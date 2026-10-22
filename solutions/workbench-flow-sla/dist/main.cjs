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

// node_modules/.cache/solutions-build/workbench-flow-sla/entry.main.ts
var entry_main_exports = {};
__export(entry_main_exports, {
  activate: () => activate,
  hostApi: () => hostApi,
  registerFunction: () => registerFunction
});
module.exports = __toCommonJS(entry_main_exports);

// ../../../totalclaw-solutions/solutions/workbench-flow-sla/src/main/ipc/flowSla.ipc.ts
var import_electron = require("electron");
var import_node_fs3 = require("node:fs");
var import_node_path5 = require("node:path");
var import_ipc_contracts3 = require("npm:@totalclaw/ipc-contracts");
var import_i18n6 = require("npm:@totalclaw/i18n");
var import_userFacingError = require("host:apps/desktop-shell/src/main/utils/userFacingError.ts");
var import_quitRegistry = require("host:apps/desktop-shell/src/main/util/quitRegistry.ts");
var import_workbenchLlm = require("host:apps/desktop-shell/src/main/services/workbenchLlm.ts");
var import_excel3 = require("host:apps/desktop-shell/src/main/services/serviceSettlement/excel.ts");

// ../../../totalclaw-solutions/solutions/workbench-flow-sla/src/main/services/flowSla/calc.ts
var DAY = 864e5;
function r2(n) {
  return Math.round(n * 100) / 100;
}
function rate(ok, total) {
  return total > 0 ? Math.round(ok / total * 1e4) / 1e4 : null;
}
function norm(s) {
  return String(s ?? "").replace(/\s+/g, "").replace(/[（]/g, "(").replace(/[）]/g, ")").replace(/[—–－_]/g, "-").replace(/[，]/g, ",").replace(/[：]/g, ":").toLowerCase();
}
var SUFFIX = /(申请报告|申请流程|报单|申请|报告|流程|单|表)$/;
function core(s) {
  let out = norm(s);
  for (let i = 0; i < 2; i += 1) out = out.replace(SUFFIX, "");
  return out;
}
function similar(a, b) {
  const x = norm(a);
  const y = norm(b);
  if (!x || !y) return 0;
  if (x === y) return 3;
  if (x.includes(y) || y.includes(x)) return 2;
  const cx = core(a);
  const cy = core(b);
  if (cx.length >= 3 && cy.length >= 3 && (cx === cy || cx.includes(cy) || cy.includes(cx))) return 1;
  return 0;
}
function ruleNames(name) {
  const parts = name.split("/").map((p) => p.trim()).filter(Boolean);
  return parts.length > 1 && parts.every((p) => p.length >= 6) ? [name, ...parts] : [name];
}
function systemMatches(ruleSystem, system) {
  return ruleSystem.split("/").map((p) => p.trim().toUpperCase()).includes(system.toUpperCase());
}
function resolveFlowType(rules, flow) {
  const composed = flow.feeType ? `${flow.flowName}-${flow.feeType}` : flow.flowName;
  let best = null;
  let bestScore = 0;
  for (const rule of rules.e2e) {
    if (rule.fallback || !systemMatches(rule.system, flow.system)) continue;
    let score = 0;
    for (const n of ruleNames(rule.flowType)) {
      score = Math.max(score, similar(n, composed), flow.feeType ? 0 : similar(n, flow.flowName));
    }
    if (score > 0 && flow.feeType && !norm(rule.flowType).includes(norm(flow.feeType)) && norm(rule.flowType).includes(norm(flow.flowName))) score = 0;
    if (score > bestScore || score === bestScore && score > 0 && best && rule.flowType.length > best.flowType.length) {
      best = rule;
      bestScore = score;
    }
  }
  if (best) {
    let limit = best.limitDays;
    if (best.variants?.length) {
      const hits = best.variants.filter((v) => (flow.title ?? "").includes(v.keyword));
      limit = hits.length === 1 ? hits[0].limitDays : Math.max(...best.variants.map((v) => v.limitDays));
    }
    return { category: best.category, flowType: best.flowType, limitDays: limit, matched: true };
  }
  if (flow.system === "CSS") return { category: "\u672A\u8BC6\u522B", flowType: flow.flowName, limitDays: null, matched: false };
  const fb = rules.e2e.find((r) => r.fallback);
  return { category: fb?.category ?? "\u5E38\u89C4\u6D41\u7A0B", flowType: flow.flowName, limitDays: null, matched: false };
}
function dayKey(t) {
  const d = new Date(t);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function isWorkday(t, holidays, extra) {
  const key = dayKey(t);
  if (extra.has(key)) return true;
  if (holidays.has(key)) return false;
  const wd = new Date(t).getDay();
  return wd !== 0 && wd !== 6;
}
function workdaysBetween(a, b, holidays, extra) {
  if (!(b > a)) return 0;
  let total = 0;
  const first = new Date(a);
  first.setHours(0, 0, 0, 0);
  for (let day = first.getTime(); day < b; ) {
    const next = new Date(day);
    next.setDate(next.getDate() + 1);
    const dayEnd = next.getTime();
    if (isWorkday(day, holidays, extra)) {
      const overlap = Math.min(b, dayEnd) - Math.max(a, day);
      if (overlap > 0) total += overlap / (dayEnd - day);
    }
    day = dayEnd;
  }
  return total;
}
function buildNodeLookup(rules) {
  const oaFk = /* @__PURE__ */ new Map();
  for (const [flow, node, internal] of rules.oaFkNodes) {
    const k = norm(flow);
    const m = oaFk.get(k) ?? /* @__PURE__ */ new Map();
    m.set(norm(node), internal);
    oaFk.set(k, m);
  }
  const oaFkNames = [...new Set(rules.oaFkNodes.map((r) => r[0]))];
  const nameCache = /* @__PURE__ */ new Map();
  const resolveOaFkFlow = (flowName) => {
    const k = norm(flowName);
    if (nameCache.has(k)) return nameCache.get(k);
    let hit = oaFk.has(k) ? k : null;
    if (!hit) {
      let bestScore = 0;
      for (const n of oaFkNames) {
        const sc = similar(n, flowName);
        if (sc > bestScore) {
          bestScore = sc;
          hit = norm(n);
        }
      }
    }
    nameCache.set(k, hit);
    return hit;
  };
  const css = (flowName, feeType, node) => {
    const cands = rules.cssNodes.filter((r) => similar(r.flowType, flowName) > 0 && (!r.feeType || !feeType || norm(r.feeType) === norm(feeType) || norm(r.feeType).includes(norm(feeType)) || norm(feeType).includes(norm(r.feeType))));
    const n = norm(node);
    const hit = cands.find((r) => norm(r.node) === n) ?? cands.find((r) => norm(r.node).includes(n) || n.includes(norm(r.node)));
    return hit ? { known: true, internal: hit.internal, limitWorkdays: hit.limitWorkdays } : { known: false, internal: false, limitWorkdays: null };
  };
  const oaOrFk = (flowName, node) => {
    const fk = resolveOaFkFlow(flowName);
    const m = fk ? oaFk.get(fk) : void 0;
    const v = m?.get(norm(node));
    if (v !== void 0) return { known: true, internal: v, limitWorkdays: null };
    if (norm(node).includes("\u8D77\u8349")) return { known: true, internal: false, limitWorkdays: null };
    return { known: false, internal: false, limitWorkdays: null };
  };
  return { css, oaOrFk };
}
function computeSla(flows, nodes, rules, opt) {
  const holidays = new Set(opt.holidays ?? []);
  const extra = new Set(opt.extraWorkdays ?? []);
  const lookup = buildNodeLookup(rules);
  const policy = opt.unknownNodePolicy ?? "exclude";
  const roster = opt.roster?.length ? new Set(opt.roster.map((n) => n.trim())) : null;
  const managers = new Set(rules.managers.map((n) => n.trim()));
  const deptOf = (name, fallback = "") => opt.rosterDept?.[name] ?? fallback;
  const nodesByFlow = /* @__PURE__ */ new Map();
  for (const n of nodes) {
    const k = `${n.system}|${n.flowNo}`;
    nodesByFlow.set(k, [...nodesByFlow.get(k) ?? [], n]);
  }
  for (const list of nodesByFlow.values()) list.sort((a, b) => a.startAt - b.startAt);
  const unknownNodeCount = /* @__PURE__ */ new Map();
  const noteUnknown = (system, flowName, node) => {
    const k = `${system}|${norm(flowName)}|${norm(node)}`;
    const cur = unknownNodeCount.get(k) ?? { system, flowName, node, count: 0 };
    cur.count += 1;
    unknownNodeCount.set(k, cur);
  };
  const attrOf = (system, flowName, feeType, node) => {
    const a = system === "CSS" ? lookup.css(flowName, feeType, node) : lookup.oaOrFk(flowName, node);
    if (a.known) return a;
    return { known: false, internal: policy === "internal", limitWorkdays: null };
  };
  const seen = /* @__PURE__ */ new Set();
  const flowResults = [];
  const typeOfFlow = /* @__PURE__ */ new Map();
  const flowByKey = /* @__PURE__ */ new Map();
  const unmatched = /* @__PURE__ */ new Map();
  for (const f of flows) {
    const key = `${f.system}|${f.flowNo}`;
    if (!f.flowNo || seen.has(key)) continue;
    seen.add(key);
    flowByKey.set(key, f);
    const type = resolveFlowType(rules, f);
    typeOfFlow.set(key, type);
    if (!type.matched) {
      const uk = `${f.system}|${norm(f.flowName)}`;
      const cur2 = unmatched.get(uk) ?? { system: f.system, flowName: f.flowName, count: 0 };
      cur2.count += 1;
      unmatched.set(uk, cur2);
    }
    if (f.status === "terminated") continue;
    const list = nodesByFlow.get(key) ?? [];
    const endForCalc = f.status === "done" ? f.endAt ?? opt.now : opt.now;
    let days2;
    let approx = false;
    if (f.system === "CSS") {
      if (!list.length) {
        days2 = (endForCalc - f.startAt) / DAY;
        approx = true;
      } else if (similar("\u9000\u6362\u8D27\u7533\u8BF7", f.flowName) >= 2) {
        const last = list[list.length - 1];
        days2 = ((last.endAt ?? endForCalc) - last.startAt) / DAY;
      } else {
        days2 = 0;
        for (const n of list) {
          const a = attrOf("CSS", f.flowName, f.feeType, n.node);
          if (!a.internal) continue;
          days2 += Math.max(0, (n.endAt ?? endForCalc) - n.startAt) / DAY;
        }
      }
    } else {
      days2 = (endForCalc - f.startAt) / DAY;
    }
    days2 = Math.max(0, days2);
    const running2 = f.status === "running";
    const cur = running2 ? [...list].reverse().find((n) => !n.endAt) : void 0;
    const currentNode = f.currentNode || cur?.node || "";
    const currentHandler = f.currentHandler || cur?.handler || "";
    const currentNodeDays = running2 && cur ? r2((opt.now - cur.startAt) / DAY) : null;
    let overtime = null;
    let runningLabel = null;
    let overdueDays = 0;
    if (type.limitDays !== null) {
      if (running2) {
        runningLabel = days2 > type.limitDays ? "overdue" : days2 > type.limitDays * rules.riskRatio ? "risk" : "normal";
      } else {
        overtime = days2 > type.limitDays + 1e-9;
      }
      overdueDays = Math.max(0, r2(days2 - type.limitDays));
    } else if (running2) {
      runningLabel = "no_limit";
    }
    const inPeriod = f.status === "done" ? (f.endAt ?? 0) >= opt.periodStart && (f.endAt ?? 0) < opt.periodEnd : true;
    flowResults.push({
      system: f.system,
      flowNo: f.flowNo,
      flowName: f.flowName,
      title: f.title ?? "",
      category: type.category,
      flowType: type.flowType,
      typeMatched: type.matched,
      initiator: f.initiator,
      dept: f.dept || deptOf(f.initiator),
      status: f.status,
      startAt: f.startAt,
      endAt: f.endAt ?? null,
      days: r2(days2),
      limitDays: type.limitDays,
      overtime,
      runningLabel,
      overdueDays,
      currentNode,
      currentHandler,
      currentNodeDays,
      approx,
      inPeriod
    });
  }
  const reviews = [];
  const outOfRoster = /* @__PURE__ */ new Set();
  for (const n of nodes) {
    if (!n.endAt || !n.handler?.trim()) continue;
    if (n.endAt < opt.periodStart || n.endAt >= opt.periodEnd) continue;
    const key = `${n.system}|${n.flowNo}`;
    const flow = flowByKey.get(key);
    const type = typeOfFlow.get(key) ?? resolveFlowType(rules, { system: n.system, flowName: n.flowName, feeType: n.feeType });
    const a = attrOf(n.system, n.flowName, n.feeType ?? flow?.feeType, n.node);
    if (!a.known) noteUnknown(n.system, n.flowName, n.node);
    if (!a.internal) continue;
    const handler = n.handler.trim();
    const identity = managers.has(handler) ? "\u7BA1\u7406\u5E72\u90E8" : "\u975E\u7BA1\u7406\u5E72\u90E8";
    let limit;
    let days2;
    let unit;
    if (n.system === "CSS") {
      limit = a.limitWorkdays;
      days2 = workdaysBetween(n.startAt, n.endAt, holidays, extra);
      unit = "\u5DE5\u4F5C\u65E5";
    } else {
      limit = personalLimit(rules, identity, type, flow?.amount);
      days2 = (n.endAt - n.startAt) / DAY;
      unit = "\u5929";
    }
    if (limit === null) continue;
    if (roster && !roster.has(handler)) {
      outOfRoster.add(handler);
      continue;
    }
    reviews.push({
      system: n.system,
      flowNo: n.flowNo,
      flowName: n.flowName,
      flowType: type.flowType,
      category: type.category,
      node: n.node,
      handler,
      identity,
      dept: deptOf(handler),
      startAt: n.startAt,
      endAt: n.endAt,
      days: r2(Math.max(0, days2)),
      unit,
      limit,
      compliant: days2 <= limit + 1e-9
    });
  }
  const done = flowResults.filter((f) => f.status === "done" && f.inPeriod);
  const running = flowResults.filter((f) => f.status === "running");
  const group = (keyOf, labelOf) => {
    const m = /* @__PURE__ */ new Map();
    for (const f of [...done, ...running]) {
      const k = keyOf(f);
      const cur = m.get(k) ?? { label: labelOf(f), done: [], running: [] };
      (f.status === "done" ? cur.done : cur.running).push(f);
      m.set(k, cur);
    }
    return [...m.values()].map(({ label, done: d, running: rn }) => {
      const judged = d.filter((f) => f.overtime !== null);
      const over = judged.filter((f) => f.overtime).length;
      const rj = rn.filter((f) => f.runningLabel !== "no_limit");
      const ro = rn.filter((f) => f.runningLabel === "overdue").length;
      const limits = [...new Set([...d, ...rn].map((f) => f.limitDays))];
      return {
        ...label,
        doneCount: d.length,
        avgDays: d.length ? r2(d.reduce((s, f) => s + f.days, 0) / d.length) : null,
        limitDays: limits.length === 1 ? limits[0] : null,
        judged: judged.length,
        overtime: over,
        complianceRate: rate(judged.length - over, judged.length),
        runningCount: rn.length,
        runningOverdue: ro,
        runningOverdueRate: rate(ro, rj.length)
      };
    });
  };
  const byType = group((f) => `${f.category}|${f.flowType}|${f.system}`, (f) => ({ category: f.category, flowType: f.flowType, system: f.system })).sort((a, b) => a.category.localeCompare(b.category, "zh") || b.doneCount - a.doneCount);
  const byCategory = group((f) => f.category, (f) => ({ category: f.category, flowType: "", system: "" })).map((c) => {
    const subs = byType.filter((t) => t.category === c.category && t.avgDays !== null);
    return { ...c, avgDays: subs.length ? r2(subs.reduce((s, t) => s + t.avgDays, 0) / subs.length) : null };
  }).sort((a, b) => a.category.localeCompare(b.category, "zh"));
  const rankPeople = (rows) => {
    const m = /* @__PURE__ */ new Map();
    for (const r of rows) {
      const cur = m.get(r.name) ?? { identity: r.identity, dept: r.dept, count: 0, ok: 0, days: 0 };
      cur.count += 1;
      cur.ok += r.ok ? 1 : 0;
      cur.days += r.days;
      m.set(r.name, cur);
    }
    const list = [...m.entries()].map(([name, v]) => ({
      name,
      identity: v.identity,
      dept: v.dept,
      count: v.count,
      compliant: v.ok,
      rate: rate(v.ok, v.count),
      avgDays: v.count ? r2(v.days / v.count) : null,
      rank: 0
    })).sort((a, b) => (b.rate ?? -1) - (a.rate ?? -1) || b.count - a.count || a.name.localeCompare(b.name, "zh"));
    let lastRate = null;
    let lastRank = 0;
    list.forEach((p, i) => {
      if (p.rate !== lastRate) {
        lastRank = i + 1;
        lastRate = p.rate;
      }
      p.rank = lastRank;
    });
    return list;
  };
  const reviewerRank = rankPeople(reviews.map((r) => ({ name: r.handler, identity: r.identity, dept: r.dept, ok: r.compliant, days: r.days })));
  const initiatorRank = rankPeople(done.filter((f) => f.overtime !== null && f.initiator).map((f) => ({ name: f.initiator, identity: managers.has(f.initiator) ? "\u7BA1\u7406\u5E72\u90E8" : "\u975E\u7BA1\u7406\u5E72\u90E8", dept: f.dept, ok: !f.overtime, days: f.days })));
  const runInit = /* @__PURE__ */ new Map();
  for (const f of running) {
    const cur = runInit.get(f.initiator || "\uFF08\u672A\u586B\uFF09") ?? { count: 0, overdue: 0, risk: 0 };
    cur.count += 1;
    if (f.runningLabel === "overdue") cur.overdue += 1;
    if (f.runningLabel === "risk") cur.risk += 1;
    runInit.set(f.initiator || "\uFF08\u672A\u586B\uFF09", cur);
  }
  const judgedAll = done.filter((f) => f.overtime !== null);
  const overAll = judgedAll.filter((f) => f.overtime).length;
  const okReviews = reviews.filter((r) => r.compliant).length;
  return {
    flows: flowResults,
    reviews,
    byType,
    byCategory,
    overall: {
      doneCount: done.length,
      avgDays: done.length ? r2(done.reduce((s, f) => s + f.days, 0) / done.length) : null,
      judged: judgedAll.length,
      overtime: overAll,
      complianceRate: rate(judgedAll.length - overAll, judgedAll.length),
      runningCount: running.length,
      runningOverdue: running.filter((f) => f.runningLabel === "overdue").length,
      runningRisk: running.filter((f) => f.runningLabel === "risk").length,
      reviewCount: reviews.length,
      reviewCompliant: okReviews,
      reviewRate: rate(okReviews, reviews.length)
    },
    reviewerRank,
    initiatorRank,
    runningByInitiator: [...runInit.entries()].map(([name, v]) => ({ name, ...v })).sort((a, b) => b.overdue - a.overdue || b.count - a.count),
    unmatchedTypes: [...unmatched.values()].sort((a, b) => b.count - a.count),
    unknownNodes: [...unknownNodeCount.values()].sort((a, b) => b.count - a.count),
    outOfRoster: [...outOfRoster].sort((a, b) => a.localeCompare(b, "zh"))
  };
}
function personalLimit(rules, identity, type, amount) {
  const mine = rules.personal.filter((p) => p.identity === identity);
  if (identity === "\u975E\u7BA1\u7406\u5E72\u90E8") {
    const hit2 = mine.find((p) => p.category === type.category) ?? mine[0];
    return hit2?.limitDays ?? null;
  }
  const band = (amount ?? 0) > rules.amountThreshold ? "gt10w" : "le10w";
  const cands = type.matched ? mine.filter((p) => norm(p.flowType) === norm(type.flowType) || similar(p.flowType, type.flowType) >= 2) : [];
  const hit = cands.find((p) => p.amount === band) ?? cands.find((p) => p.amount === "any") ?? cands[0];
  if (hit) return hit.limitDays;
  return mine.find((p) => p.category === "\u5E38\u89C4\u6D41\u7A0B")?.limitDays ?? null;
}
function toSnapshot(label, opt, res) {
  return {
    label,
    periodStart: opt.periodStart,
    periodEnd: opt.periodEnd,
    overall: res.overall,
    byType: res.byType.map((t) => ({ category: t.category, flowType: t.flowType, system: t.system, doneCount: t.doneCount, avgDays: t.avgDays, complianceRate: t.complianceRate }))
  };
}
function compareWithPrevious(cur, prev, rules) {
  const prevBy = new Map((prev?.byType ?? []).map((t) => [`${t.category}|${t.flowType}|${t.system}`, t]));
  return cur.byType.filter((t) => t.doneCount > 0).map((t) => {
    const p = prevBy.get(`${t.category}|${t.flowType}|${t.system}`);
    const avgDelta = t.avgDays !== null && p?.avgDays != null ? r2(t.avgDays - p.avgDays) : null;
    const rateDelta = t.complianceRate !== null && p?.complianceRate != null ? Math.round((t.complianceRate - p.complianceRate) * 1e4) / 1e4 : null;
    const reasons = [];
    if (avgDelta !== null && avgDelta > rules.abnormal.avgIncreaseDays) reasons.push(`\u5E73\u5747\u7528\u65F6\u73AF\u6BD4\u589E\u52A0 ${avgDelta} \u5929\uFF0C\u8D85\u8FC7 ${rules.abnormal.avgIncreaseDays} \u5929`);
    if (t.complianceRate !== null && t.complianceRate < rules.abnormal.minComplianceRate) reasons.push(`\u5408\u89C4\u7387 ${(t.complianceRate * 100).toFixed(1)}%\uFF0C\u4F4E\u4E8E ${(rules.abnormal.minComplianceRate * 100).toFixed(0)}%`);
    return {
      category: t.category,
      flowType: t.flowType,
      system: t.system,
      doneCount: t.doneCount,
      avgDays: t.avgDays,
      prevAvgDays: p?.avgDays ?? null,
      avgDelta,
      complianceRate: t.complianceRate,
      prevComplianceRate: p?.complianceRate ?? null,
      rateDelta,
      abnormal: reasons.length > 0,
      reasons
    };
  }).sort((a, b) => Number(b.abnormal) - Number(a.abnormal) || (a.complianceRate ?? 1) - (b.complianceRate ?? 1));
}
function analyzeNodes(flowType, system, res, nodes, rules, opt) {
  const lookup = buildNodeLookup(rules);
  const flowsOfType = res.flows.filter((f) => f.flowType === flowType && f.system === system && (f.status === "running" || f.inPeriod));
  const keys = new Set(flowsOfType.map((f) => `${f.system}|${f.flowNo}`));
  const byFlow = /* @__PURE__ */ new Map();
  for (const n of nodes) {
    const k = `${n.system}|${n.flowNo}`;
    if (!keys.has(k)) continue;
    byFlow.set(k, [...byFlow.get(k) ?? [], n]);
  }
  const acc = /* @__PURE__ */ new Map();
  for (const list of byFlow.values()) {
    list.sort((a, b) => a.startAt - b.startAt);
    list.forEach((n, i) => {
      const k = norm(n.node);
      const a = n.system === "CSS" ? lookup.css(n.flowName, n.feeType, n.node) : lookup.oaOrFk(n.flowName, n.node);
      const cur = acc.get(k) ?? { node: n.node, internal: a.known ? a.internal : null, durs: [], waits: [], stuck: [] };
      if (n.endAt) cur.durs.push(Math.max(0, n.endAt - n.startAt) / DAY);
      else cur.stuck.push(Math.max(0, opt.now - n.startAt) / DAY);
      const prev = list[i - 1];
      if (prev?.endAt) cur.waits.push(Math.max(0, n.startAt - prev.endAt) / DAY);
      acc.set(k, cur);
    });
  }
  const total = [...acc.values()].reduce((s, v) => s + v.durs.reduce((a, b) => a + b, 0), 0);
  const stats = [...acc.values()].map((v) => {
    const sum = v.durs.reduce((a, b) => a + b, 0);
    return {
      node: v.node,
      internal: v.internal,
      count: v.durs.length,
      avgDays: v.durs.length ? r2(sum / v.durs.length) : 0,
      maxDays: v.durs.length ? r2(Math.max(...v.durs)) : 0,
      avgWaitDays: v.waits.length ? r2(v.waits.reduce((a, b) => a + b, 0) / v.waits.length) : 0,
      share: total > 0 ? Math.round(sum / total * 1e4) / 1e4 : 0,
      stuckCount: v.stuck.length,
      avgStuckDays: v.stuck.length ? r2(v.stuck.reduce((a, b) => a + b, 0) / v.stuck.length) : null
    };
  }).sort((a, b) => b.avgDays - a.avgDays);
  return { flowType, system, nodes: stats, longestNode: stats[0]?.node ?? "" };
}
function followUpIntervalDays(category, rules) {
  return category.includes("\u5916\u90E8") ? rules.followUp.externalDays : rules.followUp.internalDays;
}
function yearOverdueRunning(res, now) {
  const yearStart = new Date(new Date(now).getFullYear(), 0, 1).getTime();
  return res.flows.filter((f) => f.status === "running" && f.runningLabel === "overdue" && f.startAt >= yearStart).sort((a, b) => b.overdueDays - a.overdueDays);
}

// ../../../totalclaw-solutions/solutions/workbench-flow-sla/src/main/services/flowSla/ingest.ts
var import_node_path = require("node:path");
var import_i18n = require("npm:@totalclaw/i18n");
var import_spreadsheetRead = require("host:apps/desktop-shell/src/main/services/spreadsheetRead.ts");
var import_excel = require("host:apps/desktop-shell/src/main/services/serviceSettlement/excel.ts");

// ../../../totalclaw-solutions/solutions/workbench-flow-sla/src/main/services/flowSla/columnKeywords.json
var columnKeywords_default = {
  flow: {
    flowNo: [
      "\u6D41\u7A0B\u7F16\u53F7",
      "\u5355\u636E\u7F16\u53F7",
      "\u6D41\u7A0B\u5355\u53F7",
      "\u7533\u8BF7\u5355\u53F7",
      "\u4E8B\u52A1\u7F16\u53F7",
      "\u6587\u6863\u7F16\u53F7",
      "\u5355\u636E\u53F7",
      "\u5355\u53F7",
      "\u6D41\u6C34\u53F7",
      "\u7F16\u53F7"
    ],
    flowName: [
      "\u6D41\u7A0B\u540D\u79F0",
      "\u4E8B\u52A1\u7C7B\u578B",
      "\u6A21\u677F\u540D\u79F0",
      "\u6D41\u7A0B\u7C7B\u578B",
      "\u5355\u636E\u7C7B\u578B",
      "\u6D41\u7A0B\u6A21\u677F",
      "\u6D41\u7A0B\u540D",
      "\u4E1A\u52A1\u7C7B\u578B",
      "\u5355\u636E\u540D\u79F0"
    ],
    feeType: [
      "\u8D39\u7528\u7C7B\u578B",
      "\u6838\u9500\u7C7B\u578B"
    ],
    title: [
      "\u6D41\u7A0B\u6807\u9898",
      "\u6587\u6863\u6807\u9898",
      "\u6807\u9898",
      "\u4E3B\u9898",
      "\u4E8B\u7531",
      "\u6458\u8981"
    ],
    initiator: [
      "\u53D1\u8D77\u4EBA",
      "\u8D77\u8349\u4EBA",
      "\u7533\u8BF7\u4EBA",
      "\u521B\u5EFA\u4EBA",
      "\u63D0\u4EA4\u4EBA",
      "\u5236\u5355\u4EBA",
      "\u7ECF\u529E\u4EBA"
    ],
    dept: [
      "\u53D1\u8D77\u90E8\u95E8",
      "\u7533\u8BF7\u90E8\u95E8",
      "\u8D77\u8349\u90E8\u95E8",
      "\u6240\u5C5E\u90E8\u95E8",
      "\u53D1\u8D77\u4EBA\u90E8\u95E8",
      "\u90E8\u95E8"
    ],
    status: [
      "\u5BA1\u6279\u72B6\u6001",
      "\u6D41\u7A0B\u72B6\u6001",
      "\u5355\u636E\u72B6\u6001",
      "\u6587\u6863\u72B6\u6001",
      "\u72B6\u6001"
    ],
    startAt: [
      "\u8D77\u8349\u65F6\u95F4",
      "\u6D41\u7A0B\u521B\u5EFA\u65F6\u95F4",
      "\u521B\u5EFA\u65F6\u95F4",
      "\u542F\u52A8\u65F6\u95F4",
      "\u53D1\u8D77\u65F6\u95F4",
      "\u7533\u8BF7\u65F6\u95F4",
      "\u63D0\u4EA4\u65F6\u95F4",
      "\u6D41\u7A0B\u5F00\u59CB\u65F6\u95F4",
      "\u8D77\u8349\u65E5\u671F",
      "\u521B\u5EFA\u65E5\u671F",
      "\u7533\u8BF7\u65E5\u671F",
      "\u5F00\u59CB\u65F6\u95F4"
    ],
    endAt: [
      "\u6D41\u7A0B\u7ED3\u675F\u65F6\u95F4",
      "\u7ED3\u675F\u65F6\u95F4",
      "\u529E\u7ED3\u65F6\u95F4",
      "\u5F52\u6863\u65F6\u95F4",
      "\u5BA1\u6838\u5B8C\u6210\u65F6\u95F4",
      "\u7ED3\u675F\u65E5\u671F",
      "\u5B8C\u6210\u65F6\u95F4"
    ],
    amount: [
      "\u7533\u8BF7\u91D1\u989D",
      "\u62A5\u9500\u91D1\u989D",
      "\u4ED8\u6B3E\u91D1\u989D",
      "\u5408\u8BA1\u91D1\u989D",
      "\u603B\u91D1\u989D",
      "\u91D1\u989D"
    ],
    currentNode: [
      "\u5F53\u524D\u8282\u70B9",
      "\u5F53\u524D\u73AF\u8282",
      "\u5F53\u524D\u6240\u5728\u8282\u70B9",
      "\u505C\u7559\u8282\u70B9"
    ],
    currentHandler: [
      "\u5F53\u524D\u5904\u7406\u4EBA",
      "\u5F53\u524D\u5BA1\u6279\u4EBA",
      "\u5F53\u524D\u5BA1\u6838\u4EBA",
      "\u5F53\u524D\u529E\u7406\u4EBA",
      "\u5F85\u529E\u4EBA"
    ]
  },
  node: {
    node: [
      "\u8282\u70B9\u540D\u79F0",
      "\u73AF\u8282\u540D\u79F0",
      "\u5BA1\u6279\u8282\u70B9\u540D",
      "\u5BA1\u6279\u8282\u70B9",
      "\u5BA1\u6838\u8282\u70B9",
      "\u8282\u70B9",
      "\u73AF\u8282"
    ],
    handler: [
      "\u5904\u7406\u4EBA",
      "\u5BA1\u6838\u4EBA",
      "\u5BA1\u6279\u4EBA",
      "\u529E\u7406\u4EBA",
      "\u64CD\u4F5C\u4EBA",
      "\u64CD\u4F5C\u8005"
    ],
    nodeStart: [
      "\u5230\u8FBE\u65F6\u95F4",
      "\u63A5\u6536\u65F6\u95F4",
      "\u8282\u70B9\u5F00\u59CB\u65F6\u95F4",
      "\u6536\u5230\u65F6\u95F4",
      "\u9001\u8FBE\u65F6\u95F4",
      "\u5F00\u59CB\u65F6\u95F4"
    ],
    nodeEnd: [
      "\u8282\u70B9\u7ED3\u675F\u65F6\u95F4",
      "\u5904\u7406\u65F6\u95F4",
      "\u5BA1\u6279\u65F6\u95F4",
      "\u5BA1\u6838\u65F6\u95F4",
      "\u529E\u7406\u65F6\u95F4",
      "\u64CD\u4F5C\u65F6\u95F4",
      "\u5B8C\u6210\u65F6\u95F4",
      "\u7ED3\u675F\u65F6\u95F4"
    ]
  },
  roster: {
    name: [
      "\u59D3\u540D",
      "\u5458\u5DE5\u59D3\u540D",
      "\u540D\u5B57",
      "\u4EBA\u5458"
    ],
    dept: [
      "\u90E8\u95E8",
      "\u6240\u5C5E\u90E8\u95E8",
      "\u79D1\u5BA4",
      "\u7EC4\u522B"
    ],
    email: [
      "\u90AE\u7BB1",
      "\u7535\u5B50\u90AE\u4EF6",
      "\u90AE\u4EF6",
      "email",
      "e-mail",
      "mail"
    ],
    identity: [
      "\u5BA1\u6838\u4EBA\u8EAB\u4EFD",
      "\u8EAB\u4EFD",
      "\u4EBA\u5458\u7C7B\u522B",
      "\u5C97\u4F4D\u7C7B\u522B",
      "\u804C\u7EA7",
      "\u804C\u52A1"
    ]
  },
  status: {
    terminated: [
      "\u7EC8\u6B62",
      "\u5E9F\u5F03",
      "\u4F5C\u5E9F",
      "\u64A4\u56DE",
      "\u64A4\u9500",
      "\u5DF2\u53D6\u6D88",
      "\u53D6\u6D88",
      "\u9A73\u56DE\u7ED3\u675F"
    ],
    running: [
      "\u5F85\u5BA1",
      "\u5BA1\u6838\u4E2D",
      "\u5BA1\u6279\u4E2D",
      "\u5904\u7406\u4E2D",
      "\u6D41\u8F6C\u4E2D",
      "\u8FDB\u884C\u4E2D",
      "\u5728\u9014",
      "\u672A\u7ED3\u675F",
      "\u672A\u5B8C\u6210",
      "\u672A\u529E\u7ED3"
    ],
    done: [
      "\u7ED3\u675F",
      "\u5DF2\u5BA1\u6838",
      "\u5DF2\u5B8C\u6210",
      "\u5DF2\u529E\u7ED3",
      "\u529E\u7ED3",
      "\u5F52\u6863",
      "\u5BA1\u6279\u901A\u8FC7",
      "\u5B8C\u6210"
    ]
  },
  statusByHandler: [
    "\u8D39\u63A7"
  ],
  managerIdentity: [
    "\u7BA1\u7406\u5E72\u90E8"
  ],
  nonManagerIdentity: [
    "\u975E\u7BA1\u7406"
  ],
  reasonColumn: [
    "\u8D85\u65F6\u539F\u56E0",
    "\u539F\u56E0\u8BF4\u660E",
    "\u539F\u56E0",
    "\u60C5\u51B5\u8BF4\u660E",
    "\u8BF4\u660E"
  ],
  systemColumn: [
    "\u6240\u5C5E\u7CFB\u7EDF",
    "\u7CFB\u7EDF"
  ],
  reasonKeywords: {
    materials: [
      "\u8D44\u6599\u4E0D\u5168",
      "\u8D44\u6599\u7F3A",
      "\u6750\u6599\u4E0D\u5168",
      "\u6750\u6599\u7F3A",
      "\u8865\u8D44\u6599",
      "\u8865\u6750\u6599",
      "\u8865\u5145\u8D44\u6599",
      "\u8865\u5145\u6750\u6599",
      "\u9000\u56DE",
      "\u9A73\u56DE",
      "\u9644\u4EF6",
      "\u4FE1\u606F\u6709\u8BEF",
      "\u586B\u5199\u9519\u8BEF",
      "\u91CD\u65B0\u63D0\u4EA4",
      "\u53D1\u7968"
    ],
    absence: [
      "\u51FA\u5DEE",
      "\u4F11\u5047",
      "\u8BF7\u5047",
      "\u5E74\u5047",
      "\u75C5\u5047",
      "\u4EA7\u5047",
      "\u4E0D\u5728\u5C97",
      "\u5916\u51FA",
      "\u57F9\u8BAD",
      "\u5F00\u4F1A",
      "\u4F1A\u8BAE"
    ],
    cross_dept: [
      "\u8DE8\u90E8\u95E8",
      "\u5176\u4ED6\u90E8\u95E8",
      "\u6C9F\u901A",
      "\u534F\u8C03",
      "\u4F1A\u7B7E",
      "\u8D22\u52A1",
      "\u6CD5\u52A1",
      "\u7B49\u5F85\u786E\u8BA4",
      "\u5F85\u786E\u8BA4",
      "\u610F\u89C1\u4E0D\u4E00\u81F4",
      "\u53CD\u590D"
    ],
    external: [
      "\u670D\u52A1\u5546",
      "\u4F9B\u5E94\u5546",
      "\u7ECF\u9500\u5546",
      "\u5BA2\u6237",
      "\u5916\u90E8",
      "\u5BF9\u65B9",
      "\u7B2C\u4E09\u65B9",
      "\u672A\u53CD\u9988",
      "\u672A\u56DE\u590D",
      "\u672A\u76D6\u7AE0",
      "\u76D6\u7AE0",
      "\u5BC4\u56DE",
      "\u7269\u6D41",
      "\u5408\u540C\u7B7E\u8BA2"
    ],
    system: [
      "\u7CFB\u7EDF",
      "\u6545\u969C",
      "\u5361\u5355",
      "\u62A5\u9519",
      "\u65E0\u6CD5\u63D0\u4EA4",
      "\u6743\u9650",
      "\u64CD\u4F5C\u5931\u8BEF",
      "\u4E0D\u4F1A\u64CD\u4F5C",
      "\u672A\u6536\u5230\u5F85\u529E",
      "\u672A\u63D0\u9192",
      "\u6CA1\u770B\u5230",
      "\u9057\u6F0F",
      "\u5FD8\u8BB0"
    ],
    design: [
      "\u8282\u70B9\u591A",
      "\u73AF\u8282\u591A",
      "\u6D41\u7A0B\u957F",
      "\u5BA1\u6279\u5C42\u7EA7",
      "\u5C42\u7EA7\u591A",
      "\u91CD\u590D\u5BA1\u6279",
      "\u6D41\u7A0B\u8BBE\u8BA1",
      "\u6D41\u7A0B\u4E0D\u5408\u7406"
    ]
  },
  demo: {
    depts: [
      "\u670D\u52A1\u4EA4\u4ED8\u90E8",
      "\u8FD0\u8425\u7BA1\u7406\u90E8",
      "\u670D\u52A1\u4F53\u9A8C\u90E8",
      "\u7528\u6237\u4EA4\u4E92\u90E8",
      "\u670D\u52A1\u6267\u884C\u90E8"
    ],
    staff: [
      "\u6797\u6653\u5F64",
      "\u4F55\u5BB6\u660E",
      "\u9648\u601D\u8FDC",
      "\u9EC4\u5609\u6B23",
      "\u6881\u5FD7\u8C6A",
      "\u9093\u96C5\u742A",
      "\u8C22\u6587\u535A",
      "\u90ED\u5A49\u5A77",
      "\u7F57\u4FCA\u6770",
      "\u82CF\u6893\u6DB5",
      "\u6F58\u96E8\u6850",
      "\u949F\u542F\u822A",
      "\u5362\u9759\u6021",
      "\u8521\u660E\u8F69",
      "\u5F6D\u8BD7\u96E8",
      "\u4F59\u6D69\u7136",
      "\u675C\u82E5\u66E6",
      "\u6234\u5B50\u5065"
    ],
    outsider: "\u5916\u90E8\u5BA1\u6838\u5458",
    newNode: "\u6570\u636E\u590D\u6838\u5C97",
    regularOa: [
      "\u6863\u6848\u501F\u9605\u6D41\u7A0B",
      "\u8BBF\u5BA2\u6765\u8BBF\u7533\u8BF7",
      "\u5370\u7AE0\u5916\u501F\u7533\u8BF7"
    ],
    unmatchedCss: "\u914D\u4EF6\u7D22\u8D54\u767B\u8BB0",
    status: {
      OA: [
        "\u7ED3\u675F",
        "\u5F85\u5BA1",
        "\u7EC8\u6B62"
      ],
      CSS: [
        "\u5DF2\u5BA1\u6838",
        "\u5BA1\u6838\u4E2D",
        "\u7EC8\u6B62"
      ],
      FK: [
        "\u7ED3\u675F",
        "\u7EC8\u6B62"
      ]
    },
    files: {
      oaFlow: "OA\u6D41\u7A0B\u65F6\u6548\u62A5\u8868-\u53D1\u8D77\u4EBA\u7EF4\u5EA6",
      oaNode: "OA\u6D41\u7A0B\u65F6\u6548\u62A5\u8868-\u5904\u7406\u4EBA\u7EF4\u5EA6",
      fkFlow: "\u8D39\u63A7\u6D41\u7A0B\u65F6\u6548\u62A5\u8868-\u53D1\u8D77\u4EBA\u7EF4\u5EA6",
      fkNode: "\u8D39\u63A7\u6D41\u7A0B\u65F6\u6548\u62A5\u8868-\u5904\u7406\u4EBA\u7EF4\u5EA6",
      css: "CSS\u6D41\u7A0B\u65F6\u6548\u62A5\u8868",
      roster: "\u4E2D\u5FC3\u4EBA\u5458\u82B1\u540D\u518C",
      dir: "\u793A\u4F8B\u6570\u636E"
    },
    headers: {
      oaFlow: [
        "\u6D41\u7A0B\u7F16\u53F7",
        "\u6D41\u7A0B\u540D\u79F0",
        "\u6807\u9898",
        "\u8D77\u8349\u4EBA",
        "\u8D77\u8349\u90E8\u95E8",
        "\u5BA1\u6279\u72B6\u6001",
        "\u8D77\u8349\u65F6\u95F4",
        "\u7ED3\u675F\u65F6\u95F4",
        "\u5F53\u524D\u8282\u70B9",
        "\u5F53\u524D\u5904\u7406\u4EBA"
      ],
      oaNode: [
        "\u6D41\u7A0B\u7F16\u53F7",
        "\u6D41\u7A0B\u540D\u79F0",
        "\u8282\u70B9\u540D\u79F0",
        "\u5904\u7406\u4EBA",
        "\u5230\u8FBE\u65F6\u95F4",
        "\u5904\u7406\u65F6\u95F4"
      ],
      fkFlow: [
        "\u5355\u636E\u7F16\u53F7",
        "\u5355\u636E\u7C7B\u578B",
        "\u6807\u9898",
        "\u7533\u8BF7\u4EBA",
        "\u7533\u8BF7\u90E8\u95E8",
        "\u7533\u8BF7\u91D1\u989D",
        "\u521B\u5EFA\u65F6\u95F4",
        "\u7ED3\u675F\u65F6\u95F4",
        "\u5F53\u524D\u8282\u70B9",
        "\u5F53\u524D\u5904\u7406\u4EBA"
      ],
      fkNode: [
        "\u5355\u636E\u7F16\u53F7",
        "\u5355\u636E\u7C7B\u578B",
        "\u73AF\u8282\u540D\u79F0",
        "\u5BA1\u6279\u4EBA",
        "\u63A5\u6536\u65F6\u95F4",
        "\u5BA1\u6279\u65F6\u95F4"
      ],
      css: [
        "\u4E8B\u52A1\u7F16\u53F7",
        "\u4E8B\u52A1\u7C7B\u578B",
        "\u8D39\u7528\u7C7B\u578B",
        "\u6807\u9898",
        "\u53D1\u8D77\u4EBA",
        "\u72B6\u6001",
        "\u5BA1\u6279\u8282\u70B9\u540D",
        "\u5BA1\u6838\u4EBA",
        "\u5F00\u59CB\u65F6\u95F4",
        "\u7ED3\u675F\u65F6\u95F4"
      ],
      roster: [
        "\u59D3\u540D",
        "\u90E8\u95E8",
        "\u90AE\u7BB1",
        "\u8EAB\u4EFD"
      ],
      titleRow: "\u7528\u6237\u670D\u52A1\u4E2D\u5FC3\u6D41\u7A0B\u65F6\u6548\u62A5\u8868\uFF08\u5BFC\u51FA\uFF09"
    },
    variantTitles: [
      "\u5907\u7528\u5546\u5F15\u5165",
      "\u670D\u52A1\u5546\u5F15\u5165"
    ],
    managers: [
      "\u8D3A\u4E91\u821F",
      "\u95FB\u4E66\u7476",
      "\u5411\u660E\u8FDC",
      "\u67CF\u6E05\u548C",
      "\u5321\u4EE5\u5B81",
      "\u84B2\u666F\u884C",
      "\u5389\u5357\u661F",
      "\u6BB7\u82E5\u6C34",
      "\u8FDE\u65F6\u96E8",
      "\u5BAB\u671B\u8212",
      "\u519C\u77E5\u590F"
    ]
  }
};

// ../../../totalclaw-solutions/solutions/workbench-flow-sla/src/main/services/flowSla/ingest.ts
var FLOW_ROLES = ["flowNo", "flowName", "feeType", "title", "initiator", "dept", "status", "startAt", "endAt", "amount", "currentNode", "currentHandler"];
var NODE_ROLES = ["node", "handler", "nodeStart", "nodeEnd"];
var ROSTER_ROLES = ["name", "dept", "email", "identity"];
var FLOW_KW = columnKeywords_default.flow;
var NODE_KW = columnKeywords_default.node;
var ROSTER_KW = columnKeywords_default.roster;
function text(v) {
  if (v == null) return "";
  if (typeof v === "number") return Number.isInteger(v) ? String(v) : String(Number(v.toFixed(8)));
  if (v instanceof Date) return formatTime(v.getTime());
  return String(v).trim();
}
function readRawTable(path, sheet) {
  const wb = (0, import_spreadsheetRead.openSpreadsheetFile)(path, { cellDates: false, raw: false });
  const names = wb.SheetNames || [];
  if (!names.length) throw new Error((0, import_i18n.t)("\u6587\u4EF6\u6CA1\u6709\u4EFB\u4F55\u5DE5\u4F5C\u8868\uFF1A{p0}", { p0: (0, import_node_path.basename)(path) }));
  const sheetName = (sheet && names.includes(sheet) ? sheet : "") || names.find((n) => wb.Sheets[n]?.["!ref"]) || names[0];
  const data = (0, import_spreadsheetRead.readWorksheetData)(wb.Sheets[sheetName], { raw: true, defval: null });
  const aoa = data.rows;
  if (!aoa.length) return { path, fileName: (0, import_node_path.basename)(path), sheetName, sheetNames: names, headers: [], rows: [], rowNumbers: [], headerRow: 0 };
  const headerIdx = (0, import_excel.detectHeaderRow)(aoa);
  const seen = /* @__PURE__ */ new Map();
  const headers = (aoa[headerIdx] || []).map((h, i) => {
    let name = text(h) || (0, import_i18n.t)("\u5217{p0}", { p0: i + 1 });
    const count = seen.get(name) || 0;
    seen.set(name, count + 1);
    if (count > 0) name = `${name}(${count + 1})`;
    return name;
  });
  const rows = [];
  const rowNumbers = [];
  for (let r = headerIdx + 1; r < aoa.length; r += 1) {
    const line = aoa[r] || [];
    if (!line.some((c) => text(c) !== "")) continue;
    rows.push(line);
    rowNumbers.push(data.rowNumbers[r] ?? r + 1);
  }
  return { path, fileName: (0, import_node_path.basename)(path), sheetName, sheetNames: names, headers, rows, rowNumbers, headerRow: data.rowNumbers[headerIdx] ?? headerIdx + 1 };
}
var normHeader = (s) => String(s || "").replace(/[\s　]+/g, "").replace(/[（(].*?[）)]$/, "").toLowerCase();
function detectIn(headers, order) {
  const used = /* @__PURE__ */ new Set();
  const out = {};
  const hs = headers.map((h) => ({ raw: h, n: normHeader(h) })).filter((h) => h.n);
  for (const pass of ["exact", "include"]) {
    for (const [role, kws] of order) {
      if (out[role]) continue;
      for (const kw of kws) {
        const k = normHeader(kw);
        const hit = hs.find((h) => !used.has(h.raw) && (pass === "exact" ? h.n === k : h.n.includes(k)));
        if (hit) {
          out[role] = hit.raw;
          used.add(hit.raw);
          break;
        }
      }
    }
  }
  return out;
}
function detectMapping(headers, slot) {
  if (slot === "roster") return detectIn(headers, ROSTER_ROLES.map((r) => [r, ROSTER_KW[r] || []]));
  const flow = FLOW_ROLES.map((r) => [r, FLOW_KW[r] || []]);
  const node = NODE_ROLES.map((r) => [r, NODE_KW[r] || []]);
  const current = flow.filter(([r]) => r === "currentNode" || r === "currentHandler");
  const rest = flow.filter(([r]) => r !== "currentNode" && r !== "currentHandler");
  const probe = detectIn(headers, [...current, ...node]);
  if (slot === "node" || probe.node) return detectIn(headers, [...current, ...node, ...rest]);
  return detectIn(headers, [...rest, ...current]);
}
function isNodeLevel(mapping) {
  return !!mapping.node && !!mapping.nodeStart;
}
function missingRoles(slot, mapping, opts = {}) {
  if (slot === "roster") return ["name"].filter((r) => !mapping[r]);
  if (slot === "flow" && !isNodeLevel(mapping)) return ["flowNo", "flowName", "startAt"].filter((r) => !mapping[r]);
  const need = ["flowNo", "node", "handler", "nodeStart"];
  if (!opts.hasFlowTable || slot === "flow") need.push("flowName");
  return need.filter((r) => !mapping[r]);
}
function previewTable(path, slot, sheet) {
  const t = readRawTable(path, sheet);
  const mapping = detectMapping(t.headers, slot);
  return {
    path,
    fileName: t.fileName,
    sheetName: t.sheetName,
    sheetNames: t.sheetNames,
    headers: t.headers,
    rowCount: t.rows.length,
    preview: t.rows.slice(0, 5).map((line) => Object.fromEntries(t.headers.map((h, i) => [h, previewCell(line[i], h, mapping)]))),
    mapping,
    headerRow: t.headerRow,
    combined: slot !== "roster" && isNodeLevel(mapping) && !!mapping.flowName
  };
}
var TIME_ROLES = /* @__PURE__ */ new Set(["startAt", "endAt", "nodeStart", "nodeEnd"]);
function previewCell(v, header, mapping) {
  const isTime = Object.entries(mapping).some(([role, h]) => h === header && TIME_ROLES.has(role));
  if (isTime && typeof v === "number") {
    const t = parseDate(v);
    return t == null ? text(v) : formatTime(t);
  }
  return text(v);
}
var pad = (n) => String(n).padStart(2, "0");
function formatTime(t) {
  const d = new Date(t);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}
function ymd(t) {
  const d = new Date(t);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
function local(y, mo, d, h = 0, mi = 0, s = 0) {
  if (y < 100) y += 2e3;
  if (y < 1990 || y > 2100 || mo < 1 || mo > 12 || d < 1 || d > 31 || h > 24 || mi > 59 || s > 59) return null;
  const t = new Date(y, mo - 1, d, h, mi, s).getTime();
  return Number.isFinite(t) ? t : null;
}
function fromSerial(n) {
  if (!(n > 2e4 && n < 8e4)) return null;
  const ms = Math.round(n * 86400) * 1e3;
  const u = new Date(Date.UTC(1899, 11, 30) + ms);
  return local(u.getUTCFullYear(), u.getUTCMonth() + 1, u.getUTCDate(), u.getUTCHours(), u.getUTCMinutes(), u.getUTCSeconds());
}
function parseDate(v) {
  if (v == null || v === "") return null;
  if (v instanceof Date) return Number.isFinite(v.getTime()) ? v.getTime() : null;
  if (typeof v === "number") {
    if (v > 1e11) return Math.round(v);
    if (v > 1e9) return Math.round(v * 1e3);
    return fromSerial(v);
  }
  let s = String(v).trim();
  if (!s || /^[-/—–\\]+$/.test(s)) return null;
  if (/^\d+(\.\d+)?$/.test(s)) {
    if (/^\d{8}$/.test(s)) return local(Number(s.slice(0, 4)), Number(s.slice(4, 6)), Number(s.slice(6, 8)));
    if (/^\d{14}$/.test(s)) return local(Number(s.slice(0, 4)), Number(s.slice(4, 6)), Number(s.slice(6, 8)), Number(s.slice(8, 10)), Number(s.slice(10, 12)), Number(s.slice(12, 14)));
    return parseDate(Number(s));
  }
  const pm = /下午|晚上|pm/i.test(s);
  const am = /上午|凌晨|早上|am/i.test(s);
  s = s.replace(/上午|下午|凌晨|早上|晚上|am|pm/gi, " ").replace(/[年月]/g, "-").replace(/日/g, " ").replace(/[时分]/g, ":").replace(/秒/g, "").replace(/T/i, " ").replace(/\s+/g, " ").replace(/:\s*$/, "").trim();
  const clock = (h, mi, sec) => {
    let hh = Number(h ?? 0);
    if (pm && hh < 12) hh += 12;
    if (am && hh === 12) hh = 0;
    return [hh, Number(mi ?? 0), Math.floor(Number(sec ?? 0))];
  };
  let m = /^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})(?:\s+(\d{1,2}):(\d{1,2})(?::(\d{1,2}(?:\.\d+)?))?)?$/.exec(s);
  if (m) return local(Number(m[1]), Number(m[2]), Number(m[3]), ...clock(m[4], m[5], m[6]));
  m = /^(\d{1,2})\/(\d{1,2})\/(\d{2,4})(?:\s+(\d{1,2}):(\d{1,2})(?::(\d{1,2}(?:\.\d+)?))?)?$/.exec(s);
  if (m) return local(Number(m[3]), Number(m[1]), Number(m[2]), ...clock(m[4], m[5], m[6]));
  return null;
}
var STATUS_KW = columnKeywords_default.status;
function matchStatus(raw) {
  const s = raw.replace(/\s+/g, "");
  if (!s) return null;
  const exact = ["terminated", "done", "running"].find((k) => STATUS_KW[k].includes(s));
  if (exact) return exact;
  return ["terminated", "running", "done"].find((k) => STATUS_KW[k].some((w) => s.includes(w))) ?? null;
}
function resolveStatus(system, statusText, handlerText, hasEnd) {
  const byStatus = matchStatus(statusText);
  if (byStatus) return { status: byStatus, guessed: false };
  if (columnKeywords_default.statusByHandler.includes(system)) {
    const byHandler = matchStatus(handlerText);
    if (byHandler === "done" || byHandler === "terminated") return { status: byHandler, guessed: false };
    if (handlerText.trim()) return { status: "running", guessed: false };
  }
  return { status: hasEnd ? "done" : "running", guessed: !!statusText.trim() };
}
var Skips = class {
  map = /* @__PURE__ */ new Map();
  add(file, reason, row) {
    const k = `${file}|${reason}`;
    const cur = this.map.get(k) ?? { file, reason, count: 0, rows: [] };
    cur.count += 1;
    if (cur.rows.length < 10) cur.rows.push(row);
    this.map.set(k, cur);
  }
  list() {
    return [...this.map.values()];
  }
};
function getter(t, mapping) {
  const idx = {};
  for (const [role, h] of Object.entries(mapping)) {
    const i = t.headers.indexOf(h);
    if (i >= 0) idx[role] = i;
  }
  return (line, role) => idx[role] === void 0 ? null : line[idx[role]];
}
function amountOf(v) {
  const s = text(v);
  if (!s) return void 0;
  const wan = /万/.test(s);
  const n = (0, import_excel.toNumber)(s.replace(/万/g, ""));
  return Number.isFinite(n) ? wan ? n * 1e4 : n : void 0;
}
function parseFlows(t, mapping, system, skips, warn) {
  const get = getter(t, mapping);
  const out = [];
  const seen = /* @__PURE__ */ new Set();
  let guessed = 0;
  t.rows.forEach((line, i) => {
    const rowNo = t.rowNumbers[i];
    const flowNo = text(get(line, "flowNo"));
    const flowName = text(get(line, "flowName"));
    if (!flowNo) {
      skips.add(t.fileName, (0, import_i18n.t)("\u6CA1\u6709\u5355\u53F7"), rowNo);
      return;
    }
    if (!flowName) {
      skips.add(t.fileName, (0, import_i18n.t)("\u6CA1\u6709\u6D41\u7A0B\u540D\u79F0"), rowNo);
      return;
    }
    if (seen.has(flowNo)) {
      skips.add(t.fileName, (0, import_i18n.t)("\u5355\u53F7\u91CD\u590D\uFF0C\u53EA\u7559\u7B2C\u4E00\u884C"), rowNo);
      return;
    }
    const startAt = parseDate(get(line, "startAt"));
    if (startAt == null) {
      skips.add(t.fileName, (0, import_i18n.t)("\u5F00\u59CB\u65F6\u95F4\u8BFB\u4E0D\u51FA\u6765"), rowNo);
      return;
    }
    const endRaw = get(line, "endAt");
    const endAt = parseDate(endRaw) ?? void 0;
    const handlerText = text(get(line, "currentHandler"));
    const st = resolveStatus(system, text(get(line, "status")), handlerText, endAt !== void 0);
    if (st.guessed) guessed += 1;
    if (st.status === "done" && endAt === void 0) {
      skips.add(t.fileName, (0, import_i18n.t)("\u5DF2\u529E\u7ED3\u4F46\u7ED3\u675F\u65F6\u95F4\u8BFB\u4E0D\u51FA\u6765"), rowNo);
      return;
    }
    if (endAt !== void 0 && endAt < startAt) {
      skips.add(t.fileName, (0, import_i18n.t)("\u7ED3\u675F\u65F6\u95F4\u65E9\u4E8E\u5F00\u59CB\u65F6\u95F4"), rowNo);
      return;
    }
    seen.add(flowNo);
    const handlerIsStatus = matchStatus(handlerText) !== null && columnKeywords_default.statusByHandler.includes(system);
    out.push({
      system,
      flowNo,
      flowName,
      feeType: text(get(line, "feeType")) || void 0,
      title: text(get(line, "title")) || void 0,
      initiator: text(get(line, "initiator")),
      dept: text(get(line, "dept")) || void 0,
      status: st.status,
      startAt,
      endAt: st.status === "running" ? void 0 : endAt,
      amount: amountOf(get(line, "amount")),
      currentNode: st.status === "running" ? text(get(line, "currentNode")) || void 0 : void 0,
      currentHandler: st.status === "running" && !handlerIsStatus ? handlerText || void 0 : void 0
    });
  });
  if (guessed) warn((0, import_i18n.t)("{p0}\uFF1A{p1} \u884C\u7684\u72B6\u6001\u6CA1\u6709\u8BA4\u51FA\u6765\uFF0C\u6309\u6709\u6CA1\u6709\u7ED3\u675F\u65F6\u95F4\u5224\u65AD\u662F\u5426\u529E\u7ED3", { p0: t.fileName, p1: guessed }));
  return out;
}
function parseNodes(t, mapping, system, skips, warn, derive) {
  const get = getter(t, mapping);
  const nodes = [];
  const groups = /* @__PURE__ */ new Map();
  let badEnd = 0;
  t.rows.forEach((line, i) => {
    const rowNo = t.rowNumbers[i];
    const flowNo = text(get(line, "flowNo"));
    if (!flowNo) {
      skips.add(t.fileName, (0, import_i18n.t)("\u6CA1\u6709\u5355\u53F7"), rowNo);
      return;
    }
    const g = groups.get(flowNo) ?? { lines: [], rowNo, nodes: [] };
    g.lines.push(line);
    groups.set(flowNo, g);
    const node = text(get(line, "node"));
    if (!node) {
      skips.add(t.fileName, (0, import_i18n.t)("\u6CA1\u6709\u8282\u70B9\u540D\u79F0"), rowNo);
      return;
    }
    const startAt = parseDate(get(line, "nodeStart"));
    if (startAt == null) {
      skips.add(t.fileName, (0, import_i18n.t)("\u8282\u70B9\u5F00\u59CB\u65F6\u95F4\u8BFB\u4E0D\u51FA\u6765"), rowNo);
      return;
    }
    const endRaw = get(line, "nodeEnd");
    const endAt = parseDate(endRaw) ?? void 0;
    if (endAt === void 0 && text(endRaw) && !/^[-/—–\\]+$/.test(text(endRaw))) badEnd += 1;
    if (endAt !== void 0 && endAt < startAt) {
      skips.add(t.fileName, (0, import_i18n.t)("\u8282\u70B9\u7ED3\u675F\u65F6\u95F4\u65E9\u4E8E\u5F00\u59CB\u65F6\u95F4"), rowNo);
      return;
    }
    const row = { system, flowNo, flowName: text(get(line, "flowName")), feeType: text(get(line, "feeType")) || void 0, node, handler: text(get(line, "handler")), startAt, endAt };
    nodes.push(row);
    g.nodes.push(row);
  });
  if (badEnd) warn((0, import_i18n.t)("{p0}\uFF1A{p1} \u884C\u7684\u8282\u70B9\u7ED3\u675F\u65F6\u95F4\u8BFB\u4E0D\u51FA\u6765\uFF0C\u6309\u8FD8\u6CA1\u5904\u7406\u5B8C\u8BA1", { p0: t.fileName, p1: badEnd }));
  const derived = [];
  if (derive) {
    let guessed = 0;
    for (const [flowNo, g] of groups) {
      const first = (role) => {
        for (const l of g.lines) {
          const s = text(get(l, role));
          if (s) return s;
        }
        return "";
      };
      const last = (role) => {
        for (let k = g.lines.length - 1; k >= 0; k -= 1) {
          const s = text(get(g.lines[k], role));
          if (s) return s;
        }
        return "";
      };
      const flowName = first("flowName");
      if (!flowName) {
        skips.add(t.fileName, (0, import_i18n.t)("\u6CA1\u6709\u6D41\u7A0B\u540D\u79F0"), g.rowNo);
        continue;
      }
      const sorted = [...g.nodes].sort((a, b) => a.startAt - b.startAt);
      let startAt = null;
      for (const l of g.lines) {
        startAt = parseDate(get(l, "startAt"));
        if (startAt != null) break;
      }
      if (startAt == null) startAt = sorted[0]?.startAt ?? null;
      if (startAt == null) {
        skips.add(t.fileName, (0, import_i18n.t)("\u5F00\u59CB\u65F6\u95F4\u8BFB\u4E0D\u51FA\u6765"), g.rowNo);
        continue;
      }
      let endAt;
      for (const l of g.lines) {
        endAt = parseDate(get(l, "endAt")) ?? void 0;
        if (endAt !== void 0) break;
      }
      const allEnded = sorted.length > 0 && sorted.every((n) => n.endAt !== void 0);
      if (endAt === void 0 && allEnded) endAt = Math.max(...sorted.map((n) => n.endAt));
      const handlerText = last("currentHandler");
      const st = resolveStatus(system, last("status"), handlerText, allEnded && endAt !== void 0);
      if (st.guessed) guessed += 1;
      if (st.status === "done" && endAt === void 0) {
        skips.add(t.fileName, (0, import_i18n.t)("\u5DF2\u529E\u7ED3\u4F46\u7ED3\u675F\u65F6\u95F4\u8BFB\u4E0D\u51FA\u6765"), g.rowNo);
        continue;
      }
      const open = [...sorted].reverse().find((n) => n.endAt === void 0);
      const opener = sorted.find((n) => /发起|起草|提交|开始/.test(n.node) && n.handler);
      derived.push({
        system,
        flowNo,
        flowName,
        feeType: first("feeType") || void 0,
        title: first("title") || void 0,
        initiator: first("initiator") || opener?.handler || "",
        dept: first("dept") || void 0,
        status: st.status,
        startAt,
        endAt: st.status === "running" ? void 0 : endAt,
        amount: amountOf(first("amount")),
        currentNode: st.status === "running" ? last("currentNode") || open?.node || void 0 : void 0,
        currentHandler: st.status === "running" ? (matchStatus(handlerText) ? "" : handlerText) || open?.handler || void 0 : void 0
      });
    }
    if (guessed) warn((0, import_i18n.t)("{p0}\uFF1A{p1} \u4E2A\u6D41\u7A0B\u7684\u72B6\u6001\u6CA1\u6709\u8BA4\u51FA\u6765\uFF0C\u6309\u8282\u70B9\u662F\u5426\u5168\u90E8\u5904\u7406\u5B8C\u5224\u65AD\u662F\u5426\u529E\u7ED3", { p0: t.fileName, p1: guessed }));
  }
  return { nodes, derived };
}
function parseRoster(t, mapping, skips) {
  const get = getter(t, mapping);
  const seen = /* @__PURE__ */ new Set();
  const out = [];
  t.rows.forEach((line, i) => {
    const name = text(get(line, "name"));
    if (!name) {
      skips.add(t.fileName, (0, import_i18n.t)("\u6CA1\u6709\u59D3\u540D"), t.rowNumbers[i]);
      return;
    }
    if (seen.has(name)) {
      skips.add(t.fileName, (0, import_i18n.t)("\u59D3\u540D\u91CD\u590D\uFF0C\u53EA\u7559\u7B2C\u4E00\u884C"), t.rowNumbers[i]);
      return;
    }
    seen.add(name);
    const email = text(get(line, "email"));
    out.push({ name, dept: text(get(line, "dept")), email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : "", identity: text(get(line, "identity")) });
  });
  return out;
}
function ingestAll(input, nowIso = (/* @__PURE__ */ new Date()).toISOString()) {
  const skips = new Skips();
  const warnings = [];
  const warn = (m) => {
    warnings.push(m);
  };
  const flows = [];
  const nodes = [];
  const files = [];
  const systems = [];
  for (const [system, spec] of Object.entries(input.systems)) {
    if (!spec?.flow && !spec?.node) continue;
    let sysFlows = [];
    const sysNodes = [];
    let derived = false;
    if (spec.flow) {
      const t = readRawTable(spec.flow.path, spec.flow.sheet);
      files.push(spec.flow.path);
      const miss = missingRoles("flow", spec.flow.mapping);
      if (miss.length) throw new Error((0, import_i18n.t)("{p0}\uFF1A\u8FD8\u6709\u5FC5\u586B\u5217\u6CA1\u6709\u5BF9\u5E94\u4E0A", { p0: t.fileName }));
      if (isNodeLevel(spec.flow.mapping)) {
        const r = parseNodes(t, spec.flow.mapping, system, skips, warn, true);
        sysNodes.push(...r.nodes);
        sysFlows = r.derived;
        derived = true;
      } else {
        sysFlows = parseFlows(t, spec.flow.mapping, system, skips, warn);
      }
    }
    if (spec.node) {
      const t = readRawTable(spec.node.path, spec.node.sheet);
      files.push(spec.node.path);
      const miss = missingRoles("node", spec.node.mapping, { hasFlowTable: !!spec.flow });
      if (miss.length) throw new Error((0, import_i18n.t)("{p0}\uFF1A\u8FD8\u6709\u5FC5\u586B\u5217\u6CA1\u6709\u5BF9\u5E94\u4E0A", { p0: t.fileName }));
      const r = parseNodes(t, spec.node.mapping, system, skips, warn, !spec.flow);
      sysNodes.push(...r.nodes);
      if (!spec.flow) {
        sysFlows = r.derived;
        derived = true;
      }
    }
    const byNo = new Map(sysFlows.map((f) => [f.flowNo, f]));
    let orphan = 0;
    const kept = sysNodes.filter((n) => {
      const f = byNo.get(n.flowNo);
      if (!n.flowName && f) {
        n.flowName = f.flowName;
      }
      if (!n.feeType && f?.feeType) n.feeType = f.feeType;
      if (!n.flowName) {
        orphan += 1;
        return false;
      }
      return true;
    });
    if (orphan) warn((0, import_i18n.t)("{p0} \u6709 {p1} \u884C\u8282\u70B9\u8BB0\u5F55\u5728\u6D41\u7A0B\u8868\u91CC\u627E\u4E0D\u5230\u5355\u53F7\u3001\u81EA\u5DF1\u4E5F\u6CA1\u6709\u6D41\u7A0B\u540D\u79F0\uFF0C\u6CA1\u6709\u6536", { p0: system, p1: orphan }));
    flows.push(...sysFlows);
    nodes.push(...kept);
    systems.push({
      system,
      flows: sysFlows.length,
      nodes: kept.length,
      derived,
      done: sysFlows.filter((f) => f.status === "done").length,
      running: sysFlows.filter((f) => f.status === "running").length,
      terminated: sysFlows.filter((f) => f.status === "terminated").length
    });
  }
  let roster = [];
  if (input.roster) {
    const t = readRawTable(input.roster.path, input.roster.sheet);
    files.push(input.roster.path);
    if (missingRoles("roster", input.roster.mapping).length) throw new Error((0, import_i18n.t)("{p0}\uFF1A\u8FD8\u6709\u5FC5\u586B\u5217\u6CA1\u6709\u5BF9\u5E94\u4E0A", { p0: t.fileName }));
    roster = parseRoster(t, input.roster.mapping, skips);
  }
  if (!flows.length) throw new Error((0, import_i18n.t)("\u6CA1\u6709\u8BFB\u5230\u4EFB\u4F55\u6D41\u7A0B\uFF0C\u8BF7\u68C0\u67E5\u9009\u62E9\u7684\u6587\u4EF6\u548C\u5217\u5BF9\u5E94"));
  return {
    flows,
    nodes,
    roster,
    summary: { systems, roster: roster.length, rosterWithEmail: roster.filter((r) => r.email).length, skipped: skips.list(), warnings, files, at: nowIso }
  };
}
var REGULAR = "__regular__";
var aliasKey = (system, flowName) => `${system}|${norm(flowName)}`;
function applyAliases(flows, aliases) {
  const original = /* @__PURE__ */ new Map();
  const out = flows.map((f) => {
    const target = aliases[aliasKey(f.system, f.flowName)];
    if (!target || target === REGULAR) return f;
    original.set(`${f.system}|${f.flowNo}`, f.flowName);
    return { ...f, flowName: target, feeType: void 0 };
  });
  return { flows: out, original };
}
function thresholdsOf(rules) {
  return {
    amountThreshold: rules.amountThreshold,
    riskRatio: rules.riskRatio,
    avgIncreaseDays: rules.abnormal.avgIncreaseDays,
    minComplianceRate: rules.abnormal.minComplianceRate,
    internalDays: rules.followUp.internalDays,
    externalDays: rules.followUp.externalDays,
    improveRemindDays: rules.improveRemindDays
  };
}
function sanitizeThresholds(p, base) {
  const num = (v, fallback, min, max) => {
    const n = Number(v);
    return v !== void 0 && v !== null && v !== "" && Number.isFinite(n) && n >= min && n <= max ? n : fallback;
  };
  return {
    amountThreshold: num(p.amountThreshold, base.amountThreshold, 0, 1e12),
    riskRatio: num(p.riskRatio, base.riskRatio, 0.01, 1),
    avgIncreaseDays: num(p.avgIncreaseDays, base.avgIncreaseDays, 0, 365),
    minComplianceRate: num(p.minComplianceRate, base.minComplianceRate, 0, 1),
    internalDays: num(p.internalDays, base.internalDays, 1, 90),
    externalDays: num(p.externalDays, base.externalDays, 1, 90),
    improveRemindDays: num(p.improveRemindDays, base.improveRemindDays, 0, 90)
  };
}
function effectiveRules(base, o = {}) {
  const th = sanitizeThresholds(o.thresholds ?? {}, thresholdsOf(base));
  const rules = {
    ...base,
    cssNodes: [...base.cssNodes],
    oaFkNodes: [...base.oaFkNodes],
    managers: [...base.managers],
    amountThreshold: th.amountThreshold,
    riskRatio: th.riskRatio,
    abnormal: { avgIncreaseDays: th.avgIncreaseDays, minComplianceRate: th.minComplianceRate },
    followUp: { internalDays: th.internalDays, externalDays: th.externalDays },
    improveRemindDays: th.improveRemindDays
  };
  const names = [...new Set(base.oaFkNodes.map((r) => r[0]))];
  const targetName = (flowName) => {
    const k = norm(flowName);
    const exact = names.find((n) => norm(n) === k);
    if (exact) return exact;
    let best = "";
    let score = 0;
    for (const n of names) {
      const sc = similar(n, flowName);
      if (sc > score) {
        score = sc;
        best = n;
      }
    }
    return best || flowName;
  };
  for (const d of o.decisions ?? []) {
    if (d.system === "CSS") rules.cssNodes.push({ flowType: d.flowName, feeType: "", node: d.node, internal: d.internal, limitWorkdays: null, note: "" });
    else rules.oaFkNodes.push([targetName(d.flowName), d.node, d.internal]);
  }
  const mgrKw = columnKeywords_default.managerIdentity;
  const nonKw = columnKeywords_default.nonManagerIdentity;
  const set = new Set(rules.managers.map((n) => n.trim()));
  for (const r of o.roster ?? []) {
    const id = r.identity.replace(/\s+/g, "");
    if (!id) continue;
    if (nonKw.some((w) => id.includes(w))) set.delete(r.name);
    else if (mgrKw.some((w) => id.includes(w))) set.add(r.name);
  }
  rules.managers = [...set];
  return rules;
}
function dayStart(t) {
  const d = new Date(t);
  d.setHours(0, 0, 0, 0);
  return d;
}
function makePeriod(kind, start, end, asOf) {
  const s = dayStart(start).getTime();
  let e = dayStart(end).getTime();
  if (!(e > s)) e = s + DAY;
  const lastDay = new Date(e);
  lastDay.setDate(lastDay.getDate() - 1);
  const d = new Date(s);
  const wholeMonth = d.getDate() === 1 && new Date(d.getFullYear(), d.getMonth() + 1, 1).getTime() === e;
  const label = kind === "monthly" && wholeMonth ? `${d.getFullYear()}-${pad(d.getMonth() + 1)}` : `${ymd(s)} ~ ${ymd(lastDay.getTime())}`;
  return { kind, start: s, end: e, asOf: Math.max(asOf, s), label };
}

// ../../../totalclaw-solutions/solutions/workbench-flow-sla/src/main/services/flowSla/store.ts
var import_node_fs = require("node:fs");
var import_node_path2 = require("node:path");
var import_node_crypto = require("node:crypto");
var import_accountScope = require("host:apps/desktop-shell/src/main/services/accountScope.ts");

// ../../../totalclaw-solutions/solutions/workbench-flow-sla/src/main/services/flowSla/defaultRules.json
var defaultRules_default = {
  version: "\u65F6\u6548\u770B\u677F\u6307\u6807(\u66F4\u65B0\u7248)",
  e2e: [
    {
      category: "\u5185\u90E8\u9A71\u52A8\u578B",
      flowType: "\u9884\u7B97\u8FFD\u52A0/\u51CF\u5C11",
      system: "\u8D39\u63A7",
      limitDays: 30
    },
    {
      category: "\u5185\u90E8\u9A71\u52A8\u578B",
      flowType: "\u9884\u7B97\u5185\u8C03\u6574",
      system: "\u8D39\u63A7",
      limitDays: 30
    },
    {
      category: "\u5185\u90E8\u9A71\u52A8\u578B",
      flowType: "\u65E5\u5E38\u8D39\u7528\u62A5\u9500",
      system: "\u8D39\u63A7",
      limitDays: 30
    },
    {
      category: "\u5185\u90E8\u9A71\u52A8\u578B",
      flowType: "\u6279\u91CF\u4ED8\u6B3E\u5355",
      system: "\u8D39\u63A7",
      limitDays: 30
    },
    {
      category: "\u5185\u90E8\u9A71\u52A8\u578B",
      flowType: "\u65E5\u5E38\u8D39\u7528\u7C7B\u91C7\u8D2D\u7533\u8BF7",
      system: "\u8D39\u63A7",
      limitDays: 20
    },
    {
      category: "\u5185\u90E8\u9A71\u52A8\u578B",
      flowType: "\u7ACB\u9879\u5355\uFF08\u8D44\u4EA7\uFF09",
      system: "\u8D39\u63A7",
      limitDays: 20
    },
    {
      category: "\u5185\u90E8\u9A71\u52A8\u578B",
      flowType: "\u9886\u6599\u7533\u8BF7\u5355",
      system: "\u8D39\u63A7",
      limitDays: 15
    },
    {
      category: "\u5185\u90E8\u9A71\u52A8\u578B",
      flowType: "\u7269\u6599\u62A5\u5E9F\u7533\u8BF7",
      system: "\u8D39\u63A7",
      limitDays: 15
    },
    {
      category: "\u5185\u90E8\u9A71\u52A8\u578B",
      flowType: "\u9884\u4ED8\u5355",
      system: "\u8D39\u63A7",
      limitDays: 10
    },
    {
      category: "\u5185\u90E8\u9A71\u52A8\u578B",
      flowType: "\u91CD\u4ED8\u5355",
      system: "\u8D39\u63A7",
      limitDays: 10
    },
    {
      category: "\u5185\u90E8\u9A71\u52A8\u578B",
      flowType: "\u552E\u540E\u8D39\u7528\u7533\u8BF7",
      system: "\u8D39\u63A7",
      limitDays: 10
    },
    {
      category: "\u5185\u90E8\u9A71\u52A8\u578B",
      flowType: "\u91C7\u8D2D\u9A8C\u6536\u8868",
      system: "\u8D39\u63A7",
      limitDays: 7
    },
    {
      category: "\u5185\u90E8\u9A71\u52A8\u578B",
      flowType: "\u9000\u6B3E\u7533\u8BF7\u6D41\u7A0B",
      system: "OA",
      limitDays: 7
    },
    {
      category: "\u5185\u90E8\u9A71\u52A8\u578B",
      flowType: "\u5408\u540C\u7248\u672C\u5236\u5B9A/\u4FEE\u8BA2\u6D41\u7A0B",
      system: "OA",
      limitDays: 30
    },
    {
      category: "\u5185\u90E8\u9A71\u52A8\u578B",
      flowType: "\u8D28\u91CF\u95EE\u9898\u4EA7\u54C1\u9000\u56DE\u7BA1\u7406\u8D39\u6838\u9500\u7533\u8BF7",
      system: "CSS",
      limitDays: 10
    },
    {
      category: "\u5185\u90E8\u9A71\u52A8\u578B",
      flowType: "\u793E\u4F1A\u5316\u670D\u52A1\u5546\u9000\u6362\u8D27\u7269\u6D41\u8FD0\u8F93\u8D39\u7533\u8BF7",
      system: "CSS",
      limitDays: 10
    },
    {
      category: "\u5185\u90E8\u9A71\u52A8\u578B",
      flowType: "\u7279\u6B8A\u8D39\u7528\u6838\u9500\u7533\u8BF7-\u5B89\u88C5\u7EF4\u4FEE\u8D39\u7528\u6838\u9500",
      system: "CSS",
      limitDays: 10
    },
    {
      category: "\u5185\u90E8\u9A71\u52A8\u578B",
      flowType: "\u7279\u6B8A\u8D39\u7528\u6838\u9500\u7533\u8BF7-\u4E0D\u8FD4\u5382\u6838\u9500",
      system: "CSS",
      limitDays: 60
    },
    {
      category: "\u5185\u90E8\u9A71\u52A8\u578B",
      flowType: "\u7279\u6B8A\u8D39\u7528\u6838\u9500\u7533\u8BF7-\u8FD4\u5382\u6838\u9500",
      system: "CSS",
      limitDays: 60
    },
    {
      category: "\u5185\u90E8\u9A71\u52A8\u578B",
      flowType: "\u514D\u8003\u6838\u7533\u8BF7\u62A5\u544A",
      system: "CSS",
      limitDays: 11
    },
    {
      category: "\u5185\u90E8\u9A71\u52A8\u578B",
      flowType: "\u7A81\u53D1\u6027\u7279\u6B8A\u60C5\u51B5\u62A5\u5907",
      system: "CSS",
      limitDays: 6
    },
    {
      category: "\u5185\u90E8\u9A71\u52A8\u578B",
      flowType: "\u5C0F\u6279\u91CF\u5DE5\u7A0B\u5355",
      system: "CSS",
      limitDays: 2
    },
    {
      category: "\u5185\u90E8\u9A71\u52A8\u578B",
      flowType: "\u8D28\u91CF\u62A5\u544A\u5355",
      system: "CSS",
      limitDays: 2
    },
    {
      category: "\u5185\u90E8\u9A71\u52A8\u578B",
      flowType: "\u9000\u6362\u8D27\u7533\u8BF7",
      system: "CSS",
      limitDays: 1.5
    },
    {
      category: "\u5916\u90E8\u6D41\u8F6C\u578B",
      flowType: "\u65E5\u5E38\u8D39\u7528\u5408\u540C\u53F0\u8D26",
      system: "\u8D39\u63A7",
      limitDays: 60
    },
    {
      category: "\u5916\u90E8\u6D41\u8F6C\u578B",
      flowType: "\u6838\u4EF7(\u542B\u9884\u4F30\u6838\u4EF7\uFF09\u6D41\u7A0B/SRM\u6838\u4EF7(\u542B\u9884\u4F30\u6838\u4EF7)\u6D41\u7A0B",
      system: "OA",
      limitDays: 30
    },
    {
      category: "\u5916\u90E8\u6D41\u8F6C\u578B",
      flowType: "\u5408\u540C\u7EBF\u4E0A\u5BA1\u67E5\u6D41\u7A0B",
      system: "OA",
      limitDays: 60
    },
    {
      category: "\u5916\u90E8\u6D41\u8F6C\u578B",
      flowType: "\u5907\u7528\u5546\u3001\u670D\u52A1\u5546\u5F15\u5165",
      system: "OA",
      limitDays: null,
      variants: [
        {
          keyword: "\u5907\u7528\u5546",
          limitDays: 7
        },
        {
          keyword: "\u670D\u52A1\u5546",
          limitDays: 72
        }
      ]
    },
    {
      category: "\u5916\u90E8\u6D41\u8F6C\u578B",
      flowType: "\u793E\u4F1A\u5316\u670D\u52A1\u5546\u9000\u51FA\u6E05\u7B97",
      system: "OA",
      limitDays: 180
    },
    {
      category: "\u5916\u90E8\u6D41\u8F6C\u578B",
      flowType: "\u7528\u6237\u670D\u52A1\u6570\u636E\u7533\u8BF7",
      system: "OA",
      limitDays: 20
    },
    {
      category: "\u5916\u90E8\u6D41\u8F6C\u578B",
      flowType: "\u7528\u6237\u6570\u636E\u8D44\u6E90\uFF08\u8F6F\u6587\u63A8\u9001\u3001\u77ED\u4FE1\u53D1\u9001\u3001\u7535\u8BDD\u5916\u547C\uFF09\u7533\u8BF7",
      system: "OA",
      limitDays: 20
    },
    {
      category: "\u5916\u90E8\u6D41\u8F6C\u578B",
      flowType: "\u670D\u52A1\u5546\u53D8\u66F4",
      system: "OA",
      limitDays: 30
    },
    {
      category: "\u5916\u90E8\u6D41\u8F6C\u578B",
      flowType: "\u4F9B\u5E94\u5546\u9009\u70B9",
      system: "OA",
      limitDays: 30
    },
    {
      category: "\u5916\u90E8\u6D41\u8F6C\u578B",
      flowType: "\u4E8B\u6545\u62A5\u544A",
      system: "CSS",
      limitDays: null
    },
    {
      category: "\u5E38\u89C4\u6D41\u7A0B",
      flowType: "\u9664\u4E86\u4EE5\u4E0A\u6D41\u7A0B",
      system: "OA/\u8D39\u63A7",
      limitDays: null,
      fallback: true
    }
  ],
  cssNodes: [
    {
      flowType: "\u5C0F\u6279\u91CF\u5DE5\u7A0B\u62A5\u5355",
      feeType: "",
      node: "\u5F00\u59CB",
      internal: false,
      limitWorkdays: null,
      note: ""
    },
    {
      flowType: "\u5C0F\u6279\u91CF\u5DE5\u7A0B\u62A5\u5355",
      feeType: "",
      node: "\u53D1\u8D77",
      internal: false,
      limitWorkdays: null,
      note: ""
    },
    {
      flowType: "\u5C0F\u6279\u91CF\u5DE5\u7A0B\u62A5\u5355",
      feeType: "",
      node: "\u670D\u52A1\u76D1\u63A7\u7EC4\u4E3B\u7BA1\u5BA1\u6279",
      internal: true,
      limitWorkdays: 2,
      note: ""
    },
    {
      flowType: "\u5C0F\u6279\u91CF\u5DE5\u7A0B\u62A5\u5355",
      feeType: "",
      node: "\u7ED3\u675F",
      internal: false,
      limitWorkdays: null,
      note: ""
    },
    {
      flowType: "\u7A81\u53D1\u6027\u7279\u6B8A\u60C5\u51B5\u62A5\u5907",
      feeType: "",
      node: "\u53D1\u8D77",
      internal: false,
      limitWorkdays: null,
      note: ""
    },
    {
      flowType: "\u7A81\u53D1\u6027\u7279\u6B8A\u60C5\u51B5\u62A5\u5907",
      feeType: "",
      node: "\u533A\u57DF\u670D\u52A1\u7ECF\u7406\u5BA1\u6279",
      internal: true,
      limitWorkdays: 2,
      note: ""
    },
    {
      flowType: "\u7A81\u53D1\u6027\u7279\u6B8A\u60C5\u51B5\u62A5\u5907",
      feeType: "",
      node: "\u670D\u52A1\u8D28\u91CF\u7BA1\u7406\u4E13\u5458\u67E5\u6838",
      internal: true,
      limitWorkdays: 2,
      note: ""
    },
    {
      flowType: "\u514D\u8003\u6838\u7533\u8BF7",
      feeType: "",
      node: "\u53D1\u8D77",
      internal: false,
      limitWorkdays: null,
      note: ""
    },
    {
      flowType: "\u514D\u8003\u6838\u7533\u8BF7",
      feeType: "",
      node: "\u533A\u57DF\u670D\u52A1\u7ECF\u7406\u5BA1\u6279",
      internal: true,
      limitWorkdays: 2,
      note: ""
    },
    {
      flowType: "\u514D\u8003\u6838\u7533\u8BF7",
      feeType: "",
      node: "\u670D\u52A1\u8D28\u91CF\u7BA1\u7406\u4E13\u5458\u67E5\u6838",
      internal: true,
      limitWorkdays: 3,
      note: ""
    },
    {
      flowType: "\u514D\u8003\u6838\u7533\u8BF7",
      feeType: "",
      node: "\u533A\u57DF\u7BA1\u7406\u90E8\u7ECF\u7406\u4F1A\u7B7E",
      internal: true,
      limitWorkdays: 1,
      note: ""
    },
    {
      flowType: "\u514D\u8003\u6838\u7533\u8BF7",
      feeType: "",
      node: "\u670D\u52A1\u8BBE\u8BA1\u90E8\u7ECF\u7406\u5BA1\u6838",
      internal: true,
      limitWorkdays: 1,
      note: ""
    },
    {
      flowType: "\u514D\u8003\u6838\u7533\u8BF7",
      feeType: "",
      node: "\u7528\u6237\u670D\u52A1\u4E2D\u5FC3\u603B\u7ECF\u7406\u5BA1\u6279",
      internal: true,
      limitWorkdays: 1,
      note: ""
    },
    {
      flowType: "\u793E\u4F1A\u5316\u670D\u52A1\u5546\u9000\u6362\u8D27\u7269\u6D41\u8FD0\u8F93\u8D39\u7533\u8BF7",
      feeType: "",
      node: "\u53D1\u8D77",
      internal: false,
      limitWorkdays: null,
      note: ""
    },
    {
      flowType: "\u793E\u4F1A\u5316\u670D\u52A1\u5546\u9000\u6362\u8D27\u7269\u6D41\u8FD0\u8F93\u8D39\u7533\u8BF7",
      feeType: "",
      node: "\u533A\u57DF\u7ECF\u7406\u5BA1\u6838",
      internal: true,
      limitWorkdays: 1,
      note: ""
    },
    {
      flowType: "\u793E\u4F1A\u5316\u670D\u52A1\u5546\u9000\u6362\u8D27\u7269\u6D41\u8FD0\u8F93\u8D39\u7533\u8BF7",
      feeType: "",
      node: "\u9000\u6362\u8D27\u7BA1\u7406\u5BA1\u6838",
      internal: true,
      limitWorkdays: 2,
      note: ""
    },
    {
      flowType: "\u793E\u4F1A\u5316\u670D\u52A1\u5546\u9000\u6362\u8D27\u7269\u6D41\u8FD0\u8F93\u8D39\u7533\u8BF7",
      feeType: "",
      node: "\u9000\u6362\u8D27\u7BA1\u7406\u6838\u7B97\u91D1\u989D",
      internal: true,
      limitWorkdays: 3,
      note: ""
    },
    {
      flowType: "\u793E\u4F1A\u5316\u670D\u52A1\u5546\u9000\u6362\u8D27\u7269\u6D41\u8FD0\u8F93\u8D39\u7533\u8BF7",
      feeType: "",
      node: "\u670D\u52A1\u5546\u786E\u8BA4",
      internal: false,
      limitWorkdays: null,
      note: ""
    },
    {
      flowType: "\u793E\u4F1A\u5316\u670D\u52A1\u5546\u9000\u6362\u8D27\u7269\u6D41\u8FD0\u8F93\u8D39\u7533\u8BF7",
      feeType: "",
      node: "\u8D39\u7528\u7BA1\u7406\u8D1F\u8D23\u4EBA\u5BA1\u6838",
      internal: true,
      limitWorkdays: 1,
      note: ""
    },
    {
      flowType: "\u793E\u4F1A\u5316\u670D\u52A1\u5546\u9000\u6362\u8D27\u7269\u6D41\u8FD0\u8F93\u8D39\u7533\u8BF7",
      feeType: "",
      node: "\u8FD0\u8425\u90E8\u7ECF\u7406\u5BA1\u6279",
      internal: true,
      limitWorkdays: 1,
      note: ""
    },
    {
      flowType: "\u793E\u4F1A\u5316\u670D\u52A1\u5546\u9000\u6362\u8D27\u7269\u6D41\u8FD0\u8F93\u8D39\u7533\u8BF7",
      feeType: "",
      node: "\u8D39\u7528\u7ED3\u7B97\u63A5\u53D7\u5904\u7406",
      internal: true,
      limitWorkdays: 1,
      note: ""
    },
    {
      flowType: "\u7279\u6B8A\u8D39\u7528\u6838\u9500\u7533\u8BF7",
      feeType: "\u8FD4\u5382\u6838\u9500",
      node: "\u53D1\u8D77",
      internal: false,
      limitWorkdays: null,
      note: ""
    },
    {
      flowType: "\u7279\u6B8A\u8D39\u7528\u6838\u9500\u7533\u8BF7",
      feeType: "\u8FD4\u5382\u6838\u9500",
      node: "\u533A\u57DF\u7ECF\u7406\u5BA1\u6279",
      internal: true,
      limitWorkdays: 1,
      note: ""
    },
    {
      flowType: "\u7279\u6B8A\u8D39\u7528\u6838\u9500\u7533\u8BF7",
      feeType: "\u8FD4\u5382\u6838\u9500",
      node: "\u670D\u52A1\u5546\u7BA1\u7406\u4E3B\u7BA1",
      internal: true,
      limitWorkdays: 1,
      note: ""
    },
    {
      flowType: "\u7279\u6B8A\u8D39\u7528\u6838\u9500\u7533\u8BF7",
      feeType: "\u8FD4\u5382\u6838\u9500",
      node: "\u670D\u52A1\u4EA4\u4ED8\u90E8\u8D1F\u8D23\u4EBA\u5BA1\u6838",
      internal: true,
      limitWorkdays: 1,
      note: ""
    },
    {
      flowType: "\u7279\u6B8A\u8D39\u7528\u6838\u9500\u7533\u8BF7",
      feeType: "\u8FD4\u5382\u6838\u9500",
      node: "\u670D\u52A1\u56DE\u8BBF\u52A9\u7406\u4E13\u5458\u5BA1\u6838",
      internal: true,
      limitWorkdays: 2,
      note: ""
    },
    {
      flowType: "\u7279\u6B8A\u8D39\u7528\u6838\u9500\u7533\u8BF7",
      feeType: "\u8FD4\u5382\u6838\u9500",
      node: "\u65E7\u4EF6\u6838\u9500\u5C97\u5BA1\u6838",
      internal: true,
      limitWorkdays: 2,
      note: ""
    },
    {
      flowType: "\u7279\u6B8A\u8D39\u7528\u6838\u9500\u7533\u8BF7",
      feeType: "\u8FD4\u5382\u6838\u9500",
      node: "\u65E7\u4EF6\u6838\u9500\u5C97\u5BA1\u6838",
      internal: true,
      limitWorkdays: 1,
      note: ""
    },
    {
      flowType: "\u7279\u6B8A\u8D39\u7528\u6838\u9500\u7533\u8BF7",
      feeType: "\u8FD4\u5382\u6838\u9500",
      node: "\u65E7\u4EF6\u6838\u9500\u5C97\u6536\u8D27\u786E\u8BA4",
      internal: false,
      limitWorkdays: null,
      note: "7/1\u524D\u4E3A120\u5929\uFF1B7/1\u540E\u4E3A60\u5929"
    },
    {
      flowType: "\u7279\u6B8A\u8D39\u7528\u6838\u9500\u7533\u8BF7",
      feeType: "\u8FD4\u5382\u6838\u9500",
      node: "\u8D39\u7528\u7ED3\u7B97\u5C97\u5BA1\u6279",
      internal: true,
      limitWorkdays: 3,
      note: ""
    },
    {
      flowType: "\u7279\u6B8A\u8D39\u7528\u6838\u9500\u7533\u8BF7",
      feeType: "\u4E0D\u8FD4\u5382\u6838\u9500",
      node: "\u53D1\u8D77",
      internal: false,
      limitWorkdays: null,
      note: ""
    },
    {
      flowType: "\u7279\u6B8A\u8D39\u7528\u6838\u9500\u7533\u8BF7",
      feeType: "\u4E0D\u8FD4\u5382\u6838\u9500",
      node: "\u533A\u57DF\u7ECF\u7406\u5BA1\u6279",
      internal: true,
      limitWorkdays: 1,
      note: ""
    },
    {
      flowType: "\u7279\u6B8A\u8D39\u7528\u6838\u9500\u7533\u8BF7",
      feeType: "\u4E0D\u8FD4\u5382\u6838\u9500",
      node: "\u670D\u52A1\u5546\u7BA1\u7406\u4E3B\u7BA1",
      internal: true,
      limitWorkdays: 1,
      note: ""
    },
    {
      flowType: "\u7279\u6B8A\u8D39\u7528\u6838\u9500\u7533\u8BF7",
      feeType: "\u4E0D\u8FD4\u5382\u6838\u9500",
      node: "\u670D\u52A1\u4EA4\u4ED8\u90E8\u8D1F\u8D23\u4EBA\u5BA1\u6838",
      internal: true,
      limitWorkdays: 1,
      note: ""
    },
    {
      flowType: "\u7279\u6B8A\u8D39\u7528\u6838\u9500\u7533\u8BF7",
      feeType: "\u4E0D\u8FD4\u5382\u6838\u9500",
      node: "\u670D\u52A1\u56DE\u8BBF\u52A9\u7406\u4E13\u5458\u5BA1\u6838",
      internal: true,
      limitWorkdays: 2,
      note: ""
    },
    {
      flowType: "\u7279\u6B8A\u8D39\u7528\u6838\u9500\u7533\u8BF7",
      feeType: "\u4E0D\u8FD4\u5382\u6838\u9500",
      node: "\u65E7\u4EF6\u6838\u9500\u5C97\u5BA1\u6838",
      internal: true,
      limitWorkdays: 2,
      note: ""
    },
    {
      flowType: "\u7279\u6B8A\u8D39\u7528\u6838\u9500\u7533\u8BF7",
      feeType: "\u4E0D\u8FD4\u5382\u6838\u9500",
      node: "\u65E7\u4EF6\u6838\u9500\u5C97\u5BA1\u6838",
      internal: true,
      limitWorkdays: 1,
      note: ""
    },
    {
      flowType: "\u7279\u6B8A\u8D39\u7528\u6838\u9500\u7533\u8BF7",
      feeType: "\u4E0D\u8FD4\u5382\u6838\u9500",
      node: "\u65E7\u4EF6\u6838\u9500\u5C97\u6536\u8D27\u786E\u8BA4",
      internal: false,
      limitWorkdays: null,
      note: "7/1\u524D\u4E3A120\u5929\uFF1B7/1\u540E\u4E3A60\u5929"
    },
    {
      flowType: "\u7279\u6B8A\u8D39\u7528\u6838\u9500\u7533\u8BF7",
      feeType: "\u4E0D\u8FD4\u5382\u6838\u9500",
      node: "\u8D39\u7528\u7ED3\u7B97\u5C97\u5BA1\u6279",
      internal: true,
      limitWorkdays: 3,
      note: ""
    },
    {
      flowType: "\u8D28\u91CF\u95EE\u9898\u4EA7\u54C1\u9000\u56DE\u7BA1\u7406\u8D39\u6838\u9500\u7533\u8BF7",
      feeType: "",
      node: "\u53D1\u8D77",
      internal: false,
      limitWorkdays: null,
      note: ""
    },
    {
      flowType: "\u8D28\u91CF\u95EE\u9898\u4EA7\u54C1\u9000\u56DE\u7BA1\u7406\u8D39\u6838\u9500\u7533\u8BF7",
      feeType: "",
      node: "\u533A\u57DF\u670D\u52A1\u7ECF\u7406\u5BA1\u6838",
      internal: true,
      limitWorkdays: 1,
      note: ""
    },
    {
      flowType: "\u8D28\u91CF\u95EE\u9898\u4EA7\u54C1\u9000\u56DE\u7BA1\u7406\u8D39\u6838\u9500\u7533\u8BF7",
      feeType: "",
      node: "\u9000\u6362\u8D27\u7BA1\u7406\u5C97\u5BA1\u6279",
      internal: true,
      limitWorkdays: 2,
      note: ""
    },
    {
      flowType: "\u8D28\u91CF\u95EE\u9898\u4EA7\u54C1\u9000\u56DE\u7BA1\u7406\u8D39\u6838\u9500\u7533\u8BF7",
      feeType: "",
      node: "\u6838\u7B97\u91D1\u989D",
      internal: true,
      limitWorkdays: 3,
      note: ""
    },
    {
      flowType: "\u8D28\u91CF\u95EE\u9898\u4EA7\u54C1\u9000\u56DE\u7BA1\u7406\u8D39\u6838\u9500\u7533\u8BF7",
      feeType: "",
      node: "\u670D\u52A1\u5546\u786E\u8BA4",
      internal: false,
      limitWorkdays: 7,
      note: ""
    },
    {
      flowType: "\u8D28\u91CF\u95EE\u9898\u4EA7\u54C1\u9000\u56DE\u7BA1\u7406\u8D39\u6838\u9500\u7533\u8BF7",
      feeType: "",
      node: "\u8D39\u7528\u7BA1\u7406\u8D1F\u8D23\u4EBA\u5BA1\u6279",
      internal: true,
      limitWorkdays: 2,
      note: ""
    },
    {
      flowType: "\u8D28\u91CF\u95EE\u9898\u4EA7\u54C1\u9000\u56DE\u7BA1\u7406\u8D39\u6838\u9500\u7533\u8BF7",
      feeType: "",
      node: "\u8FD0\u8425\u90E8\u7ECF\u7406\u5BA1\u6279",
      internal: true,
      limitWorkdays: 1,
      note: ""
    },
    {
      flowType: "\u8D28\u91CF\u95EE\u9898\u4EA7\u54C1\u9000\u56DE\u7BA1\u7406\u8D39\u6838\u9500\u7533\u8BF7",
      feeType: "",
      node: "\u5907\u6848\u3001ERP\u5199\u5165",
      internal: true,
      limitWorkdays: 1,
      note: ""
    },
    {
      flowType: "\u7279\u6B8A\u8D39\u7528\u6838\u9500\u7533\u8BF7",
      feeType: "\u5B89\u88C5\u7EF4\u4FEE\u8D39\u7528\u6838\u9500",
      node: "\u53D1\u8D77",
      internal: false,
      limitWorkdays: null,
      note: ""
    },
    {
      flowType: "\u7279\u6B8A\u8D39\u7528\u6838\u9500\u7533\u8BF7",
      feeType: "\u5B89\u88C5\u7EF4\u4FEE\u8D39\u7528\u6838\u9500",
      node: "\u533A\u57DF\u9A7B\u5916\u7ECF\u7406\u5BA1\u6279",
      internal: true,
      limitWorkdays: 1,
      note: ""
    },
    {
      flowType: "\u7279\u6B8A\u8D39\u7528\u6838\u9500\u7533\u8BF7",
      feeType: "\u5B89\u88C5\u7EF4\u4FEE\u8D39\u7528\u6838\u9500",
      node: "\u670D\u52A1\u5546\u7BA1\u7406\u4E3B\u7BA1",
      internal: true,
      limitWorkdays: 1,
      note: ""
    },
    {
      flowType: "\u7279\u6B8A\u8D39\u7528\u6838\u9500\u7533\u8BF7",
      feeType: "\u5B89\u88C5\u7EF4\u4FEE\u8D39\u7528\u6838\u9500",
      node: "\u670D\u52A1\u4EA4\u4ED8\u90E8\u8D1F\u8D23\u4EBA\u5BA1\u6838",
      internal: true,
      limitWorkdays: 1,
      note: ""
    },
    {
      flowType: "\u7279\u6B8A\u8D39\u7528\u6838\u9500\u7533\u8BF7",
      feeType: "\u5B89\u88C5\u7EF4\u4FEE\u8D39\u7528\u6838\u9500",
      node: "\u670D\u52A1\u5546\u7C7B\u578B",
      internal: false,
      limitWorkdays: null,
      note: ""
    },
    {
      flowType: "\u7279\u6B8A\u8D39\u7528\u6838\u9500\u7533\u8BF7",
      feeType: "\u5B89\u88C5\u7EF4\u4FEE\u8D39\u7528\u6838\u9500",
      node: "\u8D39\u7528\u7ED3\u7B97\u5C97\u5BA1\u6279",
      internal: true,
      limitWorkdays: 3,
      note: ""
    },
    {
      flowType: "\u7279\u6B8A\u8D39\u7528\u6838\u9500\u7533\u8BF7",
      feeType: "\u5B89\u88C5\u7EF4\u4FEE\u8D39\u7528\u6838\u9500",
      node: "\u8D39\u7528\u7ED3\u7B97\u6838\u7B97\u91D1\u989D",
      internal: true,
      limitWorkdays: 2,
      note: ""
    },
    {
      flowType: "\u7279\u6B8A\u8D39\u7528\u6838\u9500\u7533\u8BF7",
      feeType: "\u5B89\u88C5\u7EF4\u4FEE\u8D39\u7528\u6838\u9500",
      node: "\u8FD0\u8425\u7BA1\u7406\u90E8\u8D1F\u8D23\u4EBA",
      internal: true,
      limitWorkdays: 1,
      note: ""
    },
    {
      flowType: "\u4EA7\u54C1\u4E8B\u6545\u62A5\u544A",
      feeType: "",
      node: "\u53D1\u8D77",
      internal: false,
      limitWorkdays: null,
      note: ""
    },
    {
      flowType: "\u4EA7\u54C1\u4E8B\u6545\u62A5\u544A",
      feeType: "",
      node: "\u533A\u57DF\u670D\u52A1\u7ECF\u7406\u5BA1\u6279",
      internal: true,
      limitWorkdays: 3,
      note: ""
    },
    {
      flowType: "\u4EA7\u54C1\u4E8B\u6545\u62A5\u544A",
      feeType: "",
      node: "\u670D\u52A1\u7F51\u7EDC\u8D1F\u8D23\u4EBA\u5BA1\u6279",
      internal: true,
      limitWorkdays: 3,
      note: ""
    },
    {
      flowType: "\u4EA7\u54C1\u4E8B\u6545\u62A5\u544A",
      feeType: "",
      node: "\u533A\u57DF",
      internal: false,
      limitWorkdays: null,
      note: ""
    },
    {
      flowType: "\u4EA7\u54C1\u4E8B\u6545\u62A5\u544A",
      feeType: "",
      node: "\u6280\u672F\u652F\u6301\u79D1\u5BA1\u6279",
      internal: true,
      limitWorkdays: 3,
      note: ""
    },
    {
      flowType: "\u4EA7\u54C1\u4E8B\u6545\u62A5\u544A",
      feeType: "",
      node: "\u533A\u57DF\u670D\u52A1\u7ECF\u7406\u8C08\u5224",
      internal: true,
      limitWorkdays: null,
      note: ""
    },
    {
      flowType: "\u4EA7\u54C1\u4E8B\u6545\u62A5\u544A",
      feeType: "",
      node: "\u670D\u52A1\u652F\u6301\u90E8",
      internal: true,
      limitWorkdays: null,
      note: ""
    },
    {
      flowType: "\u4EA7\u54C1\u4E8B\u6545\u62A5\u544A",
      feeType: "",
      node: "\u670D\u52A1\u6267\u884C\u90E8",
      internal: true,
      limitWorkdays: null,
      note: ""
    },
    {
      flowType: "\u4EA7\u54C1\u4E8B\u6545\u62A5\u544A",
      feeType: "",
      node: "\u91D1\u989D\u786E\u8BA4",
      internal: true,
      limitWorkdays: null,
      note: ""
    },
    {
      flowType: "\u4EA7\u54C1\u4E8B\u6545\u62A5\u544A",
      feeType: "",
      node: "\u670D\u52A1\u5546\u4E0A\u4F20\u8D54\u4ED8\u8D44\u6599",
      internal: false,
      limitWorkdays: null,
      note: ""
    },
    {
      flowType: "\u4EA7\u54C1\u4E8B\u6545\u62A5\u544A",
      feeType: "",
      node: "\u670D\u52A1\u6267\u884C\u90E8\u6838\u5B9E\u8D44\u6599",
      internal: true,
      limitWorkdays: null,
      note: ""
    },
    {
      flowType: "\u4EA7\u54C1\u4E8B\u6545\u62A5\u544A",
      feeType: "",
      node: "\u4F1A\u8BA1\u8F6C\u8D26\u56DE\u6267",
      internal: true,
      limitWorkdays: 15,
      note: ""
    },
    {
      flowType: "\u4EA7\u54C1\u4E8B\u6545\u62A5\u544A",
      feeType: "",
      node: "\u54C1\u8D28\u4E2D\u5FC3\u5BA1\u6279",
      internal: true,
      limitWorkdays: null,
      note: ""
    },
    {
      flowType: "\u4EA7\u54C1\u4E8B\u6545\u62A5\u544A",
      feeType: "",
      node: "\u533A\u57DF\u670D\u52A1\u7ECF\u7406\u6267\u884C\u9000\u56DE",
      internal: false,
      limitWorkdays: null,
      note: ""
    },
    {
      flowType: "\u4EA7\u54C1\u4E8B\u6545\u62A5\u544A",
      feeType: "",
      node: "\u670D\u52A1\u5546\u9000\u56DE\u673A\u5668",
      internal: false,
      limitWorkdays: null,
      note: ""
    },
    {
      flowType: "\u4EA7\u54C1\u4E8B\u6545\u62A5\u544A",
      feeType: "",
      node: "\u670D\u52A1\u6267\u884C\u90E8\u786E\u8BA4",
      internal: true,
      limitWorkdays: null,
      note: ""
    },
    {
      flowType: "\u4EA7\u54C1\u4E8B\u6545\u62A5\u544A",
      feeType: "",
      node: "\u54C1\u8D28\u4E2D\u5FC3\u9274\u5B9A",
      internal: true,
      limitWorkdays: null,
      note: ""
    },
    {
      flowType: "\u9000\u6362\u8D27\u7533\u8BF7",
      feeType: "",
      node: "\u53D1\u8D77",
      internal: false,
      limitWorkdays: null,
      note: ""
    },
    {
      flowType: "\u9000\u6362\u8D27\u7533\u8BF7",
      feeType: "",
      node: "\u9006\u5411\u7269\u6D41\u5C97\u5BA1\u6838",
      internal: true,
      limitWorkdays: 1.5,
      note: ""
    },
    {
      flowType: "\u8D28\u91CF\u62A5\u544A\u5355",
      feeType: "",
      node: "\u53D1\u8D77",
      internal: false,
      limitWorkdays: null,
      note: ""
    },
    {
      flowType: "\u8D28\u91CF\u62A5\u544A\u5355",
      feeType: "",
      node: "\u6280\u672F\u652F\u6301\u5BA1\u6838",
      internal: true,
      limitWorkdays: 2,
      note: ""
    }
  ],
  oaFkNodes: [
    [
      "\u5458\u5DE5\u8865\u529E\u5382\u724C\u6D41\u7A0B",
      "\u8D77\u8349\u8282\u70B9",
      false
    ],
    [
      "\u5907\u7528\u5546\u3001\u670D\u52A1\u5546\u5F15\u5165",
      "\u8D77\u8349\u8282\u70B9",
      false
    ],
    [
      "\u5907\u7528\u5546\u3001\u670D\u52A1\u5546\u5F15\u5165",
      "\u670D\u52A1\u5546\u7BA1\u7406\u7EC4\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u5907\u7528\u5546\u3001\u670D\u52A1\u5546\u5F15\u5165",
      "\u7528\u6237\u670D\u52A1\u4E2D\u5FC3\u603B\u7ECF\u7406",
      true
    ],
    [
      "\u5907\u7528\u5546\u3001\u670D\u52A1\u5546\u5F15\u5165",
      "\u63D0\u4EA4\u5408\u540C\u7EBF\u4E0A\u6D41\u7A0B",
      false
    ],
    [
      "\u5907\u7528\u5546\u3001\u670D\u52A1\u5546\u5F15\u5165",
      "\u521B\u5EFA\u4E09\u5305\u914D\u4EF6\u8D26\u6237",
      true
    ],
    [
      "\u5907\u7528\u5546\u3001\u670D\u52A1\u5546\u5F15\u5165",
      "\u7EF4\u62A4\u914D\u4EF6\u53D1\u8D27\u4FE1\u606F",
      true
    ],
    [
      "\u5907\u7528\u5546\u3001\u670D\u52A1\u5546\u5F15\u5165",
      "\u521B\u5EFA\u670D\u52A1\u5546CSS\u8D26\u6237",
      true
    ],
    [
      "\u5907\u7528\u5546\u3001\u670D\u52A1\u5546\u5F15\u5165",
      "\u670D\u52A1\u4EA4\u4ED8\u90E8\u7ECF\u7406",
      true
    ],
    [
      "\u5B9A\u4EF7\u7B56\u7565\u3001\u9500\u552E\u9884\u6D4B\u53CA\u9500\u552E\u7B56\u7565\u62A5\u544A",
      "\u8D77\u8349\u8282\u70B9",
      false
    ],
    [
      "\u5B9A\u4EF7\u7B56\u7565\u3001\u9500\u552E\u9884\u6D4B\u53CA\u9500\u552E\u7B56\u7565\u62A5\u544A",
      "\u4E09\u7EA7\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u5B9A\u4EF7\u7B56\u7565\u3001\u9500\u552E\u9884\u6D4B\u53CA\u9500\u552E\u7B56\u7565\u62A5\u544A",
      "\u4EA7\u54C1\u8FD0\u8425\u90E8",
      true
    ],
    [
      "\u4EA7\u54C1\u8BD5\u7528\u65B9\u6848\u5BA1\u6279\u53CA\u9886\u7528\u7533\u8BF7",
      "\u7528\u6237\u670D\u52A1\u4E2D\u5FC3\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u4EA7\u54C1\u8BD5\u7528\u65B9\u6848\u5BA1\u6279\u53CA\u9886\u7528\u7533\u8BF7",
      "\u8D77\u8349\u8282\u70B9",
      false
    ],
    [
      "\u4EA7\u54C1\u8BD5\u7528\u65B9\u6848\u5BA1\u6279\u53CA\u9886\u7528\u7533\u8BF7",
      "\u786E\u8BA4\u8BD5\u7528\u673A\u6765\u6E90",
      true
    ],
    [
      "\u4EA7\u54C1\u8BD5\u7528\u65B9\u6848\u5BA1\u6279\u53CA\u9886\u7528\u7533\u8BF7",
      "\u5BC4\u9001\u6837\u673A\u4EE3\u8868",
      true
    ],
    [
      "\u4EA7\u54C1\u8BD5\u7528\u4F53\u9A8C\u7533\u8BF7",
      "\u670D\u52A1\u786E\u8BA4",
      false
    ],
    [
      "\u4EA7\u54C1\u8BD5\u7528\u4F53\u9A8C\u7533\u8BF7",
      "\u8D77\u8349\u8282\u70B9",
      false
    ],
    [
      "\u4EA7\u54C1\u8BD5\u7528\u4F53\u9A8C\u7533\u8BF7",
      "\u4E00\u7EA7\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u4EA7\u54C1\u8BD5\u7528\u4F53\u9A8C\u7533\u8BF7",
      "\u786E\u8BA4\u6536\u8D27\u65E5\u671F",
      false
    ],
    [
      "\u4EA7\u54C1\u8BD5\u7528\u4F53\u9A8C\u7533\u8BF7",
      "\u63A5\u6536\u6743\u76CA\u5361(\u670D\u52A1\u4EE3\u8868)",
      false
    ],
    [
      "\u4EA7\u54C1\u8BD5\u7528\u4F53\u9A8C\u7533\u8BF7",
      "\u786E\u8BA4\u5151\u6362\u4EA7\u54C1\u4FE1\u606F(\u670D\u52A1\u4EE3\u8868)",
      false
    ],
    [
      "\u4EA7\u54C1\u8BD5\u7528\u4F53\u9A8C\u7533\u8BF7",
      "\u670D\u52A1\u786E\u8BA4\u6536\u8D27\u65E5\u671F",
      false
    ],
    [
      "\u4EA7\u54C1\u8BD5\u7528\u4F53\u9A8C\u7533\u8BF7",
      "\u8D22\u52A1\u4F1A\u8BA1",
      true
    ],
    [
      "\u4EA7\u54C1\u9700\u6C42\u63D0\u62A5\u8868",
      "\u8D77\u8349\u8282\u70B9",
      false
    ],
    [
      "\u4EA7\u54C1\u9700\u6C42\u63D0\u62A5\u8868",
      "\u4F01\u5212\u4EE3\u8868",
      true
    ],
    [
      "\u6863\u6848\u501F\u9605\u6D41\u7A0B",
      "\u8D77\u8349\u8282\u70B9",
      false
    ],
    [
      "\u6863\u6848\u501F\u9605\u6D41\u7A0B",
      "\u4E00\u7EA7\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u6863\u6848\u501F\u9605\u6D41\u7A0B",
      "\u5F52\u8FD8\u6863\u6848",
      true
    ],
    [
      "\u6863\u6848\u9500\u6BC1\u7533\u8BF7",
      "\u8D77\u8349\u8282\u70B9",
      false
    ],
    [
      "\u6863\u6848\u9500\u6BC1\u7533\u8BF7",
      "\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u5458\u5DE5\u8BC1\u660E\u5F00\u5177\u6D41\u7A0B",
      "\u8D77\u8349\u8282\u70B9",
      false
    ],
    [
      "\u8BBF\u5BA2\u6765\u8BBF\u7533\u8BF7",
      "\u62DC\u8BBF\u4EBA\u5BA1\u6279",
      true
    ],
    [
      "\u51FA\u5382\u653E\u884C\u5355",
      "\u6253\u5370\u51FA\u5382",
      true
    ],
    [
      "\u7ECF\u9500\u5546\u9000\u51FA\u6E05\u7B97\u7533\u8BF7",
      "\u586B\u5199OA\u62A5\u9500\u5355\u53F7",
      false
    ],
    [
      "\u793E\u4F1A\u5316\u670D\u52A1\u5546\u9000\u51FA\u6E05\u7B97",
      "\u4E0A\u4F20\u7ECF\u9500\u5546\u76D6\u7AE0\u786E\u8BA4\u5355",
      false
    ],
    [
      "\u793E\u4F1A\u5316\u670D\u52A1\u5546\u9000\u51FA\u6E05\u7B97",
      "\u8D39\u7528\u7BA1\u7406\u5C97",
      false
    ],
    [
      "\u7ECF\u9500\u5546\u9000\u51FA\u6E05\u7B97\u7533\u8BF7",
      "\u4E0A\u4F20\u5BF9\u8D26\u786E\u8BA4\u5355",
      false
    ],
    [
      "\u793E\u4F1A\u5316\u670D\u52A1\u5546\u9000\u51FA\u6E05\u7B97",
      "\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u793E\u4F1A\u5316\u670D\u52A1\u5546\u9000\u51FA\u6E05\u7B97",
      "\u63D0\u4EA4\u6C47\u603B\u6E05\u8D26\u5BF9\u8D26\u8868",
      false
    ],
    [
      "\u793E\u4F1A\u5316\u670D\u52A1\u5546\u9000\u51FA\u6E05\u7B97",
      "\u4E0A\u4F20\u76D6\u7AE0\u6E05\u8D26\u5BF9\u8D26\u8868",
      false
    ],
    [
      "\u793E\u4F1A\u5316\u670D\u52A1\u5546\u9000\u51FA\u6E05\u7B97",
      "\u6838\u5B9E\u662F\u5426\u6709\u5F85\u6838\u9500\u8D39\u7528",
      false
    ],
    [
      "\u793E\u4F1A\u5316\u670D\u52A1\u5546\u9000\u51FA\u6E05\u7B97",
      "\u4E0A\u4F20\u5BF9\u8D26\u786E\u8BA4\u5355",
      false
    ],
    [
      "\u7ECF\u9500\u5546\u9000\u51FA\u6E05\u7B97\u7533\u8BF7",
      "\u63D0\u4EA4\u6E05\u8D26\u660E\u7EC6\u8868",
      false
    ],
    [
      "\u7ECF\u9500\u5546\u9000\u51FA\u6E05\u7B97\u7533\u8BF7",
      "\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u793E\u4F1A\u5316\u670D\u52A1\u5546\u9000\u51FA\u6E05\u7B97",
      "\u670D\u52A1\u8D28\u91CF\u7BA1\u7406",
      true
    ],
    [
      "\u6C14\u6E90\u9002\u914D\u6027\u68C0\u6D4B\u5907\u6848",
      "\u8D44\u6599\u5BA1\u6838",
      true
    ],
    [
      "\u6C14\u6E90\u9002\u914D\u6027\u68C0\u6D4B\u5907\u6848",
      "\u586B\u5199\u9001\u68C0\u8D44\u6599",
      true
    ],
    [
      "\u6C14\u6E90\u9002\u914D\u6027\u68C0\u6D4B\u5907\u6848",
      "\u586B\u5199\u9001\u68C0\u7ED3\u679C\u4FE1\u606F",
      false
    ],
    [
      "\u7269\u6599\u62A5\u5E9F",
      "\u7528\u6237\u670D\u52A1\u4E2D\u5FC3\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u6587\u4EF6\u4F1A\u7B7E\u7533\u8BF7",
      "\u4FEE\u6539",
      true
    ],
    [
      "\u6587\u4EF6\u4F1A\u7B7E\u7533\u8BF7",
      "\u4F1A\u7B7E\u4EBA\u5458\u2461",
      true
    ],
    [
      "\u6587\u4EF6\u4F1A\u7B7E\u7533\u8BF7",
      "\u4E8C\u6B21\u4FEE\u6539",
      true
    ],
    [
      "\u7269\u6599\u62A5\u5E9F",
      "\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u7269\u6599/\u6210\u54C1\u5E93\u4F4D\u8F6C\u79FB\u7533\u8BF7",
      "\u914D\u4EF6\u7BA1\u7406\u5C97",
      true
    ],
    [
      "\u6587\u4EF6\u4F1A\u7B7E\u7533\u8BF7",
      "\u4F1A\u7B7E\u4EBA\u5458",
      true
    ],
    [
      "\u7528\u6237\u670D\u52A1\u65E5\u5E38\u653F\u7B56\u8D39\u7528\u7533\u8BF7",
      "\u4E8C\u7EA7\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u7528\u6237\u670D\u52A1\u65E5\u5E38\u653F\u7B56\u8D39\u7528\u7533\u8BF7",
      "\u4E00\u7EA7\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u7528\u6237\u670D\u52A1\u6570\u636E\u7533\u8BF7",
      "\u6570\u636E\u8FD0\u8425\u4E13\u5458",
      true
    ],
    [
      "\u7528\u6237\u670D\u52A1\u6570\u636E\u7533\u8BF7",
      "\u8FD0\u8425\u7BA1\u7406\u90E8\u7ECF\u7406",
      true
    ],
    [
      "\u7528\u6237\u670D\u52A1\u6570\u636E\u7533\u8BF7",
      "\u7528\u6237\u670D\u52A1\u4E2D\u5FC3\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u7528\u6237\u670D\u52A1\u6570\u636E\u7533\u8BF7",
      "\u63D0\u4F9B\u6570\u636E\u4E0A\u4F20\u9644\u4EF6",
      true
    ],
    [
      "\u8F66\u95F4\u5DE5\u65F6\u8D39\u7528\u8C03\u6574\u7533\u8BF7\u6D41\u7A0B",
      "\u63A5\u6536\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u4EA7\u54C1\u5F00\u53D1\u9636\u6BB5\u8BC4\u5BA1\u62A5\u544A\u5BA1\u6279\u6D41\u7A0B",
      "\u5404\u90E8\u95E8\u4E2D\u5FC3\u4EE3\u8868",
      true
    ],
    [
      "\u7269\u6599/\u6210\u54C1\u5E93\u4F4D\u8F6C\u79FB\u7533\u8BF7",
      "\u8D77\u8349\u8282\u70B9",
      false
    ],
    [
      "\u7ECF\u9500\u5546\u8D39\u7528\u521B\u5EFA\u8BA2\u5355",
      "\u8D77\u8349\u8282\u70B9",
      false
    ],
    [
      "\u7ECF\u9500\u5546\u8D39\u7528\u521B\u5EFA\u8BA2\u5355",
      "\u4FE1\u606F\u5F55\u5165",
      true
    ],
    [
      "\u793E\u4F1A\u5316\u670D\u52A1\u5546\u9000\u51FA\u6E05\u7B97",
      "\u8D77\u8349\u8282\u70B9",
      false
    ],
    [
      "\u793E\u4F1A\u5316\u670D\u52A1\u5546\u9000\u51FA\u6E05\u7B97",
      "\u670D\u52A1\u7F51\u7EDC\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u793E\u4F1A\u5316\u670D\u52A1\u5546\u9000\u51FA\u6E05\u7B97",
      "\u7528\u6237\u670D\u52A1\u4E2D\u5FC3\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u793E\u4F1A\u5316\u670D\u52A1\u5546\u9000\u51FA\u6E05\u7B97",
      "\u9000\u6362\u8D27\u7BA1\u7406",
      true
    ],
    [
      "\u793E\u4F1A\u5316\u670D\u52A1\u5546\u9000\u51FA\u6E05\u7B97",
      "\u914D\u4EF6\u7BA1\u7406",
      true
    ],
    [
      "\u7269\u6599\u62A5\u5E9F",
      "\u8D77\u8349\u8282\u70B9",
      false
    ],
    [
      "\u7269\u6599\u62A5\u5E9F",
      "\u4E8C\u7EA7\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u7269\u6599\u62A5\u5E9F",
      "\u4E00\u7EA7\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u7528\u6237\u670D\u52A1\u65E5\u5E38\u653F\u7B56\u8D39\u7528\u7533\u8BF7",
      "\u8D77\u8349\u8282\u70B9",
      false
    ],
    [
      "\u7528\u6237\u670D\u52A1\u65E5\u5E38\u653F\u7B56\u8D39\u7528\u7533\u8BF7",
      "\u4E09\u7EA7\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u975E\u5E73\u53F0\u5B9A\u9152\u5E97/\u8BA2\u7968\u7533\u8BF7",
      "\u8D77\u8349\u8282\u70B9",
      false
    ],
    [
      "\u975E\u5E73\u53F0\u5B9A\u9152\u5E97/\u8BA2\u7968\u7533\u8BF7",
      "\u4E8C\u7EA7\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u975E\u5E73\u53F0\u5B9A\u9152\u5E97/\u8BA2\u7968\u7533\u8BF7",
      "\u4E00\u7EA7\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u884C\u653F\u7C7B\u7ED3\u7B97\u8D39\u7528\u4F1A\u7B7E\u7533\u8BF7",
      "\u4F1A\u7B7E",
      true
    ],
    [
      "\u7528\u6237\u6570\u636E\u8D44\u6E90\uFF08\u8F6F\u6587\u63A8\u9001\u3001\u77ED\u4FE1\u53D1\u9001\u3001\u7535\u8BDD\u5916\u547C\uFF09\u7533\u8BF7",
      "\u8FD0\u8425\u7BA1\u7406\u90E8\u7ECF\u7406",
      true
    ],
    [
      "\u7528\u6237\u6570\u636E\u8D44\u6E90\uFF08\u8F6F\u6587\u63A8\u9001\u3001\u77ED\u4FE1\u53D1\u9001\u3001\u7535\u8BDD\u5916\u547C\uFF09\u7533\u8BF7",
      "\u7528\u6237\u670D\u52A1\u4E2D\u5FC3\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u5E93\u5B58\u7269\u6599\u4E09\u6B21\u68C0\u9A8C\u89E3\u51BB\u7533\u8BF7",
      "\u8D77\u8349\u8282\u70B9",
      false
    ],
    [
      "\u5E93\u5B58\u7269\u6599\u4E09\u6B21\u68C0\u9A8C\u89E3\u51BB\u7533\u8BF7",
      "\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u6240\u5F97\u4E0A\u7F34",
      "\u8D77\u8349\u8282\u70B9",
      false
    ],
    [
      "\u6240\u5F97\u4E0A\u7F34",
      "\u4E00\u7EA7\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u7CBE\u54C1\u5DE5\u7A0B\u95EE\u9898\u70B9\u6574\u6539\u5BA1\u6279",
      "\u4F1A\u7B7E",
      true
    ],
    [
      "\u7EBF\u4E0A\u9884\u7B97\u8C03\u6574\u5BA1\u6279\u6D41\u7A0B",
      "\u8D77\u8349\u8282\u70B9",
      false
    ],
    [
      "\u7EBF\u4E0A\u9884\u7B97\u8C03\u6574\u5BA1\u6279\u6D41\u7A0B",
      "\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u7EBF\u4E0A\u9884\u7B97\u8C03\u6574\u5BA1\u6279\u6D41\u7A0B",
      "\u4E00\u7EA7\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u9500\u552E\u7EC8\u6B62\u7533\u8BF7\uFF08\u542B\u5185\u90E8\u9000\u5E02\u901A\u77E5\uFF09",
      "\u7528\u6237\u670D\u52A1\u4E2D\u5FC3\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u52B3\u52A8\u5408\u540C\u7EED\u7B7E\u610F\u89C1\u786E\u8BA4\u8868",
      "\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u52B3\u52A8\u5408\u540C\u7EED\u7B7E\u610F\u89C1\u786E\u8BA4\u8868",
      "\u4E8C\u7EA7\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u5458\u5DE5\u4FE1\u606F\u67E5\u8BE2\u53CA\u66F4\u65B0",
      "\u8D77\u8349\u8282\u70B9",
      false
    ],
    [
      "\u7ECF\u9500\u5546\u9000\u51FA\u6E05\u7B97\u7533\u8BF7",
      "\u4E0A\u4F20\u201C\u7ECF\u9500\u5546\u76D6\u7AE0\u7684\u6E05\u8D26\u5BF9\u8D26\u8868\u201D",
      false
    ],
    [
      "\u7528\u6237\u6570\u636E\u8D44\u6E90\uFF08\u8F6F\u6587\u63A8\u9001\u3001\u77ED\u4FE1\u53D1\u9001\u3001\u7535\u8BDD\u5916\u547C\uFF09\u7533\u8BF7",
      "\u65B9\u6848\u6267\u884C",
      false
    ],
    [
      "\u7528\u6237\u6570\u636E\u8D44\u6E90\uFF08\u8F6F\u6587\u63A8\u9001\u3001\u77ED\u4FE1\u53D1\u9001\u3001\u7535\u8BDD\u5916\u547C\uFF09\u7533\u8BF7",
      "\u8D39\u7528\u5904\u7406",
      true
    ],
    [
      "\u6587\u4EF6\u4F1A\u7B7E\u7533\u8BF7",
      "\u8D77\u8349\u8282\u70B9",
      false
    ],
    [
      "\u975E\u5E73\u53F0\u5B9A\u9152\u5E97/\u8BA2\u7968\u7533\u8BF7",
      "\u4E09\u7EA7\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u52B3\u52A8\u5408\u540C\u7EED\u7B7E\u610F\u89C1\u786E\u8BA4\u8868",
      "\u4E00\u7EA7\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u516C\u6587\u5916\u53D1\u7533\u8BF7",
      "\u8D77\u8349\u8282\u70B9",
      false
    ],
    [
      "\u516C\u6587\u5916\u53D1\u7533\u8BF7",
      "\u6587\u4EF6\u76D6\u7AE0",
      true
    ],
    [
      "\u516C\u6587\u5916\u53D1\u7533\u8BF7",
      "\u6570\u636E\u786E\u8BA4",
      true
    ],
    [
      "\u7269\u6599/\u6210\u54C1\u5E93\u4F4D\u8F6C\u79FB\u7533\u8BF7",
      "\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u793E\u4F1A\u5316\u670D\u52A1\u5546\u9000\u51FA\u6E05\u7B97",
      "\u670D\u52A1\u6267\u884C\u90E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u76D1\u63A7\u67E5\u8BE2\u7533\u8BF7",
      "\u8D77\u8349\u8282\u70B9",
      false
    ],
    [
      "\u76D1\u63A7\u67E5\u8BE2\u7533\u8BF7",
      "\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u7ECF\u9500\u5546\u8D39\u7528\u521B\u5EFA\u8BA2\u5355",
      "\u8D39\u7528\u4F1A\u8BA1\u521D\u5BA1",
      true
    ],
    [
      "\u5DEE\u65C5\u8865\u52A9\u5F02\u5E38\u7533\u8BF7",
      "\u4E00\u7EA7\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u5370\u7AE0\u5916\u501F\u7533\u8BF7",
      "\u8D77\u8349\u8282\u70B9",
      false
    ],
    [
      "\u5370\u7AE0\u5916\u501F\u7533\u8BF7",
      "\u4E8C\u7EA7\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u5370\u7AE0\u5916\u501F\u7533\u8BF7",
      "\u4E00\u7EA7\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u5370\u7AE0\u5916\u501F\u7533\u8BF7",
      "\u4E0A\u4F20\u76D6\u7AE0\u6587\u4EF6",
      true
    ],
    [
      "\u5DEE\u65C5\u8865\u52A9\u5F02\u5E38\u7533\u8BF7",
      "\u8D77\u8349\u8282\u70B9",
      false
    ],
    [
      "\u5DEE\u65C5\u8865\u52A9\u5F02\u5E38\u7533\u8BF7",
      "\u4E8C\u7EA7\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u7ECF\u9500\u5546\u9000\u51FA\u6E05\u7B97\u7533\u8BF7",
      "\u6C47\u603B\u5BF9\u8D26\u6E05\u5355",
      true
    ],
    [
      "\u5DEE\u65C5\u8865\u52A9\u5F02\u5E38\u7533\u8BF7",
      "\u4E09\u7EA7\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u9884\u63D0\u8D39\u7528\u5EF6\u671F\u6838\u9500\u7533\u8BF7",
      "\u8D77\u8349\u8282\u70B9",
      false
    ],
    [
      "\u9884\u63D0\u8D39\u7528\u5EF6\u671F\u6838\u9500\u7533\u8BF7",
      "\u4E8C\u7EA7\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u9884\u63D0\u8D39\u7528\u5EF6\u671F\u6838\u9500\u7533\u8BF7",
      "\u4E00\u7EA7\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u8BBF\u5BA2\u6765\u8BBF\u7533\u8BF7",
      "\u8D77\u8349\u8282\u70B9",
      false
    ],
    [
      "\u4EA7\u54C1\u4FE1\u606F\u7EF4\u62A4",
      "\u8D77\u8349\u8282\u70B9",
      false
    ],
    [
      "\u4EA7\u54C1\u4FE1\u606F\u7EF4\u62A4",
      "\u8D22\u52A1\u4F1A\u8BA1\u4E2D\u5FC3\u7ED3\u7B97\u90E8",
      true
    ],
    [
      "\u4EA7\u54C1\u4FE1\u606F\u7EF4\u62A4",
      "\u5BFC\u5165\u7CFB\u7EDF",
      true
    ],
    [
      "\u7EBF\u4E0A\u9884\u7B97\u8C03\u6574\u5BA1\u6279\u6D41\u7A0B",
      "\u4E8C\u7EA7\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u516C\u6587\u5916\u53D1\u7533\u8BF7",
      "\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u7269\u6599/\u6210\u54C1\u5E93\u4F4D\u8F6C\u79FB\u7533\u8BF7",
      "\u9000\u6362\u8D27\u7BA1\u7406\u4E3B\u7BA1",
      true
    ],
    [
      "\u7269\u6599\u62A5\u5E9F",
      "\u6210\u672C\u4F1A\u8BA1\u8FC7\u8D26",
      true
    ],
    [
      "\u4EA7\u54C1\u4FE1\u606F\u7EF4\u62A4",
      "\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u793E\u4F1A\u5316\u670D\u52A1\u5546\u9000\u51FA\u6E05\u7B97",
      "\u670D\u52A1\u5546\u7BA1\u7406\u7EC4\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u4F01\u4E1A\u6807\u51C6\u4FEE\u6539\u7533\u8BF7",
      "\u4F1A\u7B7E",
      true
    ],
    [
      "\u5632\u69FD\u4F1A\u69FD\u70B9\u6539\u5584",
      "\u8D77\u8349\u8282\u70B9",
      false
    ],
    [
      "\u5632\u69FD\u4F1A\u69FD\u70B9\u6539\u5584",
      "\u4E8C\u7EA7\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u5632\u69FD\u4F1A\u69FD\u70B9\u6539\u5584",
      "\u4E00\u7EA7\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u5632\u69FD\u4F1A\u69FD\u70B9\u6539\u5584",
      "\u6539\u5584\u8D23\u4EFB\u4EBA",
      true
    ],
    [
      "\u5632\u69FD\u4F1A\u69FD\u70B9\u6539\u5584",
      "\u6539\u5584\u8BC4\u4EF7\u4EBA",
      true
    ],
    [
      "\u5632\u69FD\u4F1A\u69FD\u70B9\u6539\u5584",
      "\u7ED3\u9879\u786E\u8BA4",
      true
    ],
    [
      "\u7528\u6237\u6570\u636E\u8D44\u6E90\uFF08\u8F6F\u6587\u63A8\u9001\u3001\u77ED\u4FE1\u53D1\u9001\u3001\u7535\u8BDD\u5916\u547C\uFF09\u7533\u8BF7",
      "\u7528\u6237\u4EA4\u4E92\u90E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u7269\u6599/\u6210\u54C1\u5E93\u4F4D\u8F6C\u79FB\u7533\u8BF7",
      "\u4F9B\u5E94\u90E8\u7ECF\u7406/\u8BA1\u5212\u7BA1\u7406\u5C97",
      true
    ],
    [
      "\u4EFF\u771F\u5206\u6790",
      "\u8D77\u8349\u8282\u70B9",
      false
    ],
    [
      "\u4EFF\u771F\u5206\u6790",
      "\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u4EFF\u771F\u5206\u6790",
      "\u4E8C\u7EA7\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u4EFF\u771F\u5206\u6790",
      "\u9A8C\u6536\u62A5\u544A",
      true
    ],
    [
      "\u5DE5\u827A\u9879\u76EE\u7ACB\u9879\u4EFB\u52A1\u4E66\u53CA\u603B\u7ED3\u7533\u8BF7",
      "\u7528\u6237\u670D\u52A1\u90E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u6587\u4EF6\u4F1A\u7B7E\u7533\u8BF7",
      "\u6D41\u7A0B\u8BBE\u8BA1\u5E08",
      true
    ],
    [
      "\u516C\u6587\u5916\u53D1\u7533\u8BF7",
      "\u4E00\u7EA7\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u7528\u6237\u6570\u636E\u8D44\u6E90\uFF08\u8F6F\u6587\u63A8\u9001\u3001\u77ED\u4FE1\u53D1\u9001\u3001\u7535\u8BDD\u5916\u547C\uFF09\u7533\u8BF7",
      "\u670D\u52A1\u4F53\u9A8C\u90E8\u7ECF\u7406",
      true
    ],
    [
      "\u7269\u6599/\u6210\u54C1\u5E93\u4F4D\u8F6C\u79FB\u7533\u8BF7",
      "\u54C1\u8D28\u5BA1\u6838",
      true
    ],
    [
      "\u7ECF\u9500\u5546\u5176\u4ED6\u7533\u8BF7\uFF08\u7EBF\u4E0B\u8425\u9500\u4E13\u7528\uFF09",
      "\u4F1A\u8BA1\u7ED3\u7B97\u90E8\u4F1A\u8BA1\u4E3B\u7BA1",
      true
    ],
    [
      "\u7ECF\u9500\u5546\u5176\u4ED6\u7533\u8BF7\uFF08\u7EBF\u4E0B\u8425\u9500\u4E13\u7528\uFF09",
      "\u533A\u57DF\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u7ECF\u9500\u5546\u5176\u4ED6\u7533\u8BF7\uFF08\u7EBF\u4E0B\u8425\u9500\u4E13\u7528\uFF09",
      "\u4E8C\u7EA7\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u7ECF\u9500\u5546\u5176\u4ED6\u7533\u8BF7\uFF08\u7EBF\u4E0B\u8425\u9500\u4E13\u7528\uFF09",
      "\u8BB0\u5F55\u7ED3\u679C",
      true
    ],
    [
      "\u7ECF\u9500\u5546\u9000\u51FA\u6E05\u7B97\u7533\u8BF7",
      "\u7ED3\u675F\u5E76\u884C\u5206\u652F",
      true
    ],
    [
      "\u7ECF\u9500\u5546\u5176\u4ED6\u7533\u8BF7\uFF08\u7EBF\u4E0B\u8425\u9500\u4E13\u7528\uFF09",
      "\u6E20\u9053\u7BA1\u7406\u90E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u6587\u4EF6\u4F1A\u7B7E\u7533\u8BF7",
      "\u6D41\u7A0B\u8BBE\u8BA1\u5E08\u2461",
      true
    ],
    [
      "\u7528\u6237\u670D\u52A1\u6570\u636E\u7533\u8BF7",
      "\u8D77\u8349\u8282\u70B9",
      false
    ],
    [
      "\u7528\u6237\u670D\u52A1\u6570\u636E\u7533\u8BF7",
      "\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u670D\u52A1\u5546\u53D8\u66F4",
      "\u8D77\u8349\u8282\u70B9",
      false
    ],
    [
      "\u670D\u52A1\u5546\u53D8\u66F4",
      "\u670D\u52A1\u5546\u7BA1\u7406\u7EC4\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u670D\u52A1\u5546\u53D8\u66F4",
      "\u7528\u6237\u670D\u52A1\u4E2D\u5FC3\u603B\u7ECF\u7406",
      true
    ],
    [
      "\u670D\u52A1\u5546\u53D8\u66F4",
      "\u670D\u52A1\u7F51\u7EDC\u5EFA\u8BBE\u52A9\u7406\u4E13\u5458",
      false
    ],
    [
      "\u670D\u52A1\u5546\u53D8\u66F4",
      "\u670D\u52A1\u4EA4\u4ED8\u90E8\u7ECF\u7406",
      true
    ],
    [
      "\u670D\u52A1\u5546\u53D8\u66F4",
      "\u670D\u52A1\u5546\u7BA1\u7406\u52A9\u7406\u4E13\u5458",
      false
    ],
    [
      "\u51FA\u5382\u653E\u884C\u5355",
      "\u8D77\u8349\u8282\u70B9",
      false
    ],
    [
      "\u51FA\u5382\u653E\u884C\u5355",
      "\u5BA1\u6279",
      true
    ],
    [
      "\u51FA\u5382\u653E\u884C\u5355",
      "\u670D\u52A1\u652F\u6301\u90E8\u7ECF\u7406",
      true
    ],
    [
      "\u51FA\u5382\u653E\u884C\u5355",
      "\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u51FA\u5382\u653E\u884C\u5355",
      "\u4E00\u7EA7\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u51FA\u5382\u653E\u884C\u5355",
      "\u4E8C\u7EA7\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u51FA\u5382\u653E\u884C\u5355",
      "\u4FDD\u5B89\u961F\u957F\u786E\u8BA4",
      true
    ],
    [
      "\u51FA\u5382\u653E\u884C\u5355",
      "\u6307\u5B9A\u63A5\u6536\u8005",
      true
    ],
    [
      "\u4F9B\u8D27\u4EF7\uFF08\u51FA\u5382\u4EF7\uFF09\u7533\u8BF7",
      "\u8D77\u8349\u8282\u70B9",
      false
    ],
    [
      "\u4F9B\u8D27\u4EF7\uFF08\u51FA\u5382\u4EF7\uFF09\u7533\u8BF7",
      "\u5BF9\u5E94\u4EA7\u54C1\u8FD0\u8425\u90E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u4F9B\u8D27\u4EF7\uFF08\u51FA\u5382\u4EF7\uFF09\u7533\u8BF7",
      "\u4F1A\u8BA1\u4E3B\u7BA1",
      true
    ],
    [
      "GTM\u9879\u76EE\u7ACB\u9879",
      "\u7528\u6237\u670D\u52A1\u4E2D\u5FC3\u603B\u7ECF\u7406",
      true
    ],
    [
      "GTM\u9879\u76EE\u7ED3\u6848",
      "\u7528\u6237\u670D\u52A1\u4E2D\u5FC3\u603B\u7ECF\u7406",
      true
    ],
    [
      "\u56FA\u5B9A\u8D44\u4EA7\u53D8\u66F4\u7533\u8BF7",
      "\u8D77\u8349\u8282\u70B9",
      false
    ],
    [
      "\u56FA\u5B9A\u8D44\u4EA7\u53D8\u66F4\u7533\u8BF7",
      "\u539F\u90E8\u95E8\u8D1F\u8D23\u4EBA\u5BA1\u6279",
      true
    ],
    [
      "\u56FA\u5B9A\u8D44\u4EA7\u53D8\u66F4\u7533\u8BF7",
      "\u8D44\u4EA7\u63A5\u6536\u4EBA\u7B7E\u6536",
      true
    ],
    [
      "\u56FA\u5B9A\u8D44\u4EA7\u53D8\u66F4\u7533\u8BF7",
      "\u8C03\u5165\u90E8\u95E8\u8D1F\u8D23\u4EBA\u5BA1\u6838",
      true
    ],
    [
      "\u56FA\u5B9A\u8D44\u4EA7\u62A5\u5E9F\u7533\u8BF7",
      "\u8D77\u8349\u8282\u70B9",
      false
    ],
    [
      "\u56FA\u5B9A\u8D44\u4EA7\u62A5\u5E9F\u7533\u8BF7",
      "\u4E8C\u7EA7\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u56FA\u5B9A\u8D44\u4EA7\u62A5\u5E9F\u7533\u8BF7",
      "\u4E00\u7EA7\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u5408\u540C\u7248\u672C\u5236\u5B9A/\u4FEE\u8BA2\u6D41\u7A0B",
      "\u4E09\u7EA7\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u5408\u540C\u7248\u672C\u5236\u5B9A/\u4FEE\u8BA2\u6D41\u7A0B",
      "\u4E00\u7EA7\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u5408\u540C\u7248\u672C\u5236\u5B9A/\u4FEE\u8BA2\u6D41\u7A0B",
      "\u8D77\u8349\u8282\u70B9",
      false
    ],
    [
      "\u5408\u540C\u7248\u672C\u5236\u5B9A/\u4FEE\u8BA2\u6D41\u7A0B",
      "\u8D22\u52A1\u5BA1\u67E5\u5C97",
      true
    ],
    [
      "\u5408\u540C\u7248\u672C\u5236\u5B9A/\u4FEE\u8BA2\u6D41\u7A0B",
      "\u786E\u8BA4\u5408\u540C",
      false
    ],
    [
      "\u5408\u540C\u7248\u672C\u5236\u5B9A/\u4FEE\u8BA2\u6D41\u7A0B",
      "\u4E8C\u7EA7\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u89C4\u8303\u6027\u6587\u4EF6\u5BA1\u67E5/\u5370\u7AE0\u4F7F\u7528",
      "\u786E\u8BA4\u6587\u4EF6\u4FEE\u6539\u5185\u5BB9",
      true
    ],
    [
      "\u89C4\u8303\u6027\u6587\u4EF6\u5BA1\u67E5/\u5370\u7AE0\u4F7F\u7528",
      "\u6253\u5370\u6587\u4EF6",
      true
    ],
    [
      "\u89C4\u8303\u6027\u6587\u4EF6\u5BA1\u67E5/\u5370\u7AE0\u4F7F\u7528",
      "\u8D77\u8349\u8282\u70B9",
      false
    ],
    [
      "\u89C4\u8303\u6027\u6587\u4EF6\u5BA1\u67E5/\u5370\u7AE0\u4F7F\u7528",
      "\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u89C4\u8303\u6027\u6587\u4EF6\u5BA1\u67E5/\u5370\u7AE0\u4F7F\u7528",
      "\u4E00\u7EA7\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u89C4\u8303\u6027\u6587\u4EF6\u5BA1\u67E5/\u5370\u7AE0\u4F7F\u7528",
      "\u8D22\u52A1\u5BA1\u67E5\u5C97",
      true
    ],
    [
      "\u89C4\u8303\u6027\u6587\u4EF6\u5BA1\u67E5/\u5370\u7AE0\u4F7F\u7528",
      "\u786E\u8BA4\u98CE\u9669",
      true
    ],
    [
      "\u89C4\u8303\u6027\u6587\u4EF6\u5BA1\u67E5/\u5370\u7AE0\u4F7F\u7528",
      "\u5BA1\u67E5\u5E76\u4E0A\u4F20\u89C4\u8303\u6027\u6587\u4EF6\u521D\u7A3F",
      true
    ],
    [
      "\u89C4\u8303\u6027\u6587\u4EF6\u5BA1\u67E5/\u5370\u7AE0\u4F7F\u7528",
      "\u4E8C\u7EA7\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u89C4\u8303\u6027\u6587\u4EF6\u5BA1\u67E5/\u5370\u7AE0\u4F7F\u7528",
      "\u5408\u540C\u5BA1\u67E5\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "SRM\u6838\u4EF7(\u542B\u9884\u4F30\u6838\u4EF7\uFF09\u6D41\u7A0B",
      "\u8D77\u8349\u8282\u70B9",
      false
    ],
    [
      "SRM\u6838\u4EF7(\u542B\u9884\u4F30\u6838\u4EF7\uFF09\u6D41\u7A0B",
      "\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "SRM\u6838\u4EF7(\u542B\u9884\u4F30\u6838\u4EF7\uFF09\u6D41\u7A0B",
      "\u4F9B\u5E94\u5546\u5F00\u53D1\u5C97",
      true
    ],
    [
      "SRM\u6838\u4EF7(\u542B\u9884\u4F30\u6838\u4EF7\uFF09\u6D41\u7A0B",
      "\u4F9B\u5E94\u94FE\u4E2D\u5FC3\u603B\u76D1",
      true
    ],
    [
      "SRM\u6838\u4EF7(\u542B\u9884\u4F30\u6838\u4EF7\uFF09\u6D41\u7A0B",
      "\u63A5\u5355",
      true
    ],
    [
      "SRM\u6838\u4EF7(\u542B\u9884\u4F30\u6838\u4EF7\uFF09\u6D41\u7A0B",
      "\u8D22\u52A1\u767B\u8BB0\u4EBA\u5458",
      true
    ],
    [
      "SRM\u6838\u4EF7(\u542B\u9884\u4F30\u6838\u4EF7\uFF09\u6D41\u7A0B",
      "\u9700\u8981\u5907\u6848\u4EBA\u5458",
      true
    ],
    [
      "SRM\u6838\u4EF7(\u542B\u9884\u4F30\u6838\u4EF7\uFF09\u6D41\u7A0B",
      "\u4E8C\u7EA7\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u4F1A\u8BAE\u7EAA\u8981",
      "\u8D77\u8349\u8282\u70B9",
      false
    ],
    [
      "\u4F1A\u8BAE\u7EAA\u8981",
      "\u4F1A\u7B7E",
      true
    ],
    [
      "\u4F1A\u8BAE\u7EAA\u8981",
      "\u6839\u636E\u4F1A\u7B7E\u610F\u89C1\u4FEE\u6539",
      true
    ],
    [
      "\u4F1A\u8BAE\u7EAA\u8981",
      "\u4F1A\u8BAE\u4E3B\u6301\u4EBA",
      true
    ],
    [
      "SRM\u4EF7\u683C\u7EF4\u62A4\u6D41\u7A0B",
      "\u4F9B\u5E94\u94FE\u4E2D\u5FC3\u603B\u76D1",
      true
    ],
    [
      "\u5047\u8D27\u9274\u5B9A\u5BA1\u6279",
      "\u8D77\u8349\u8282\u70B9",
      false
    ],
    [
      "\u5047\u8D27\u9274\u5B9A\u5BA1\u6279",
      "\u6280\u672F\u652F\u6301\u5C97",
      true
    ],
    [
      "\u5047\u8D27\u9274\u5B9A\u5BA1\u6279",
      "\u6280\u672F\u652F\u6301\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u8BA1\u5212\u8C03\u6574\u7533\u8BF7",
      "\u8D77\u8349\u8282\u70B9",
      false
    ],
    [
      "\u8BA1\u5212\u8C03\u6574\u7533\u8BF7",
      "\u6392\u4EA7\u786E\u8BA4",
      true
    ],
    [
      "\u8BA1\u5212\u8C03\u6574\u7533\u8BF7",
      "\u4F9B\u5E94\u94FE\u4E2D\u5FC3\u603B\u76D1",
      true
    ],
    [
      "\u8BA1\u5212\u8C03\u6574\u7533\u8BF7",
      "\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u8BA1\u5212\u8C03\u6574\u7533\u8BF7",
      "\u8BA1\u5212\u7BA1\u7406\u90E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u8BA1\u5212\u8C03\u6574\u7533\u8BF7",
      "OEM\u4EA4\u671F\u8BC4\u4F30",
      true
    ],
    [
      "\u8BA1\u5212\u8C03\u6574\u7533\u8BF7",
      "\u55B7\u6D82\u8BA1\u5212\u5458",
      true
    ],
    [
      "\u8BA1\u5212\u8C03\u6574\u7533\u8BF7",
      "\u786E\u8BA4OEM\u8C03\u6574\u4EA4\u671F",
      true
    ],
    [
      "\u6280\u672F\u901A\u77E5\u5355",
      "\u8BC4\u5BA1\u5C0F\u7EC4",
      true
    ],
    [
      "\u7ECF\u9500\u5546\u6388\u4FE1\u3001\u501F\u6B3E\u7533\u8BF7",
      "\u53A8\u7535\u4F1A\u8BA1",
      true
    ],
    [
      "\u7ECF\u9500\u5546\u6388\u4FE1\u3001\u501F\u6B3E\u7533\u8BF7",
      "\u53A8\u7535\u4F1A\u8BA1\u4E3B\u7BA1",
      true
    ],
    [
      "\u4EA7\u54C1\u7533\u8BF7",
      "\u670D\u52A1\u786E\u8BA4",
      true
    ],
    [
      "\u4EA7\u54C1\u7533\u8BF7",
      "\u8D77\u8349\u8282\u70B9",
      false
    ],
    [
      "\u4EA7\u54C1\u7533\u8BF7",
      "\u4E00\u7EA7\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u4EA7\u54C1\u7533\u8BF7",
      "\u4E0A\u4F20\u4ED8\u6B3E\u4FE1\u606F\u622A\u56FE",
      false
    ],
    [
      "\u4EA7\u54C1\u7533\u8BF7",
      "\u6536\u8D27\u786E\u8BA4",
      false
    ],
    [
      "\u4EA7\u54C1\u7533\u8BF7",
      "\u4E0A\u4F20\u4ED8\u6B3E\u51ED\u8BC1",
      false
    ],
    [
      "\u4EA7\u54C1\u7533\u8BF7",
      "\u63A5\u6536\u6743\u76CA\u5361(\u670D\u52A1\u4EE3\u8868)",
      false
    ],
    [
      "\u4EA7\u54C1\u7533\u8BF7",
      "\u786E\u8BA4\u5151\u6362\u4EA7\u54C1\u4FE1\u606F(\u670D\u52A1\u4EE3\u8868)",
      false
    ],
    [
      "\u4EA7\u54C1\u7533\u8BF7",
      "\u786E\u8BA4\u5B89\u88C5\u73AF\u5883",
      false
    ],
    [
      "\u4EA7\u54C1\u7533\u8BF7",
      "\u9500\u552E\u4EE3\u8868",
      true
    ],
    [
      "\u4EA7\u54C1\u7533\u8BF7",
      "\u586B\u5199\u5546\u57CE\u8BA2\u5355\u53F7",
      true
    ],
    [
      "\u4EA7\u54C1\u7533\u8BF7",
      "\u670D\u52A1\u786E\u8BA4\u6536\u8D27\u65E5\u671F",
      false
    ],
    [
      "\u4EA7\u54C1\u7533\u8BF7",
      "\u786E\u8BA4\u6536\u8D27\u65E5\u671F",
      false
    ],
    [
      "\u4EA7\u54C1\u7533\u8BF7",
      "\u8463\u529E",
      true
    ],
    [
      "\u4EA7\u54C1\u7533\u8BF7",
      "\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u4EA7\u54C1\u7533\u8BF7",
      "\u786E\u8BA4\u53D1\u8D27\u53CA\u63D0\u4F9B\u6536\u6B3E\u8D26\u53F7",
      true
    ],
    [
      "\u4EA7\u54C1\u7533\u8BF7",
      "\u786E\u8BA4\u5E93\u5B58\u6570",
      true
    ],
    [
      "\u4E92\u8054\u7F51\u8BBF\u95EE\u5F00\u901A\u7533\u8BF7",
      "\u8D77\u8349\u8282\u70B9",
      false
    ],
    [
      "\u4E92\u8054\u7F51\u8BBF\u95EE\u5F00\u901A\u7533\u8BF7",
      "\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u4E92\u8054\u7F51\u8BBF\u95EE\u5F00\u901A\u7533\u8BF7",
      "\u4E8C\u7EA7\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u4E92\u8054\u7F51\u8BBF\u95EE\u5F00\u901A\u7533\u8BF7",
      "\u4E00\u7EA7\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u901A\u8BAF\u8865\u8D34\u7533\u8BF7",
      "\u8D77\u8349\u8282\u70B9",
      false
    ],
    [
      "\u901A\u8BAF\u8865\u8D34\u7533\u8BF7",
      "\u4E00\u7EA7\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u901A\u8BAF\u8865\u8D34\u7533\u8BF7",
      "\u4E8C\u7EA7\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u798F\u5229\u8D39\u7528\u7533\u8BF7",
      "\u8D77\u8349\u8282\u70B9",
      false
    ],
    [
      "\u798F\u5229\u8D39\u7528\u7533\u8BF7",
      "\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u6D41\u7A0BIT\u4E0A\u7EBF\u53CAIT\u7EBF\u4E0A\u6D41\u7A0B\u53D8\u66F4",
      "\u8D77\u8349",
      false
    ],
    [
      "\u6D41\u7A0BIT\u4E0A\u7EBF\u53CAIT\u7EBF\u4E0A\u6D41\u7A0B\u53D8\u66F4",
      "\u4F1A\u7B7E",
      true
    ],
    [
      "\u6D41\u7A0BIT\u4E0A\u7EBF\u53CAIT\u7EBF\u4E0A\u6D41\u7A0B\u53D8\u66F4",
      "\u4FEE\u6539",
      true
    ],
    [
      "\u6D41\u7A0BIT\u4E0A\u7EBF\u53CAIT\u7EBF\u4E0A\u6D41\u7A0B\u53D8\u66F4",
      "\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u6D41\u7A0BIT\u4E0A\u7EBF\u53CAIT\u7EBF\u4E0A\u6D41\u7A0B\u53D8\u66F4",
      "\u9700\u6C42\u6D4B\u8BD5\u53CD\u9988",
      false
    ],
    [
      "\u6D41\u7A0BIT\u4E0A\u7EBF\u53CAIT\u7EBF\u4E0A\u6D41\u7A0B\u53D8\u66F4",
      "IT\u6D41\u7A0B\u6B63\u5F0F\u53D1\u5E03\u5207\u6362",
      true
    ],
    [
      "\u6D41\u7A0BIT\u4E0A\u7EBF\u53CAIT\u7EBF\u4E0A\u6D41\u7A0B\u53D8\u66F4",
      "\u6D41\u7A0B\u7BA1\u7406\u4E13\u5458",
      true
    ],
    [
      "\u6D41\u7A0BIT\u4E0A\u7EBF\u53CAIT\u7EBF\u4E0A\u6D41\u7A0B\u53D8\u66F4",
      "\u6D41\u7A0B\u8BBE\u8BA1\u5E08",
      true
    ],
    [
      "\u6D41\u7A0BIT\u4E0A\u7EBF\u53CAIT\u7EBF\u4E0A\u6D41\u7A0B\u53D8\u66F4",
      "\u4E8C\u7EA7\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u6D41\u7A0BIT\u4E0A\u7EBF\u53CAIT\u7EBF\u4E0A\u6D41\u7A0B\u53D8\u66F4",
      "\u6280\u672F\u53EF\u884C\u6027\u8BC4\u4F30",
      true
    ],
    [
      "\u4E2A\u4EBA\u7EE9\u6548\u76EE\u6807\u5236\u5B9A\u53CA\u53D8\u66F4\u6D41\u7A0B",
      "\u8D77\u8349\u8282\u70B9",
      false
    ],
    [
      "\u4E2A\u4EBA\u7EE9\u6548\u76EE\u6807\u5236\u5B9A\u53CA\u53D8\u66F4\u6D41\u7A0B",
      "\u8003\u6838\u8D23\u4EFB\u4EBA",
      false
    ],
    [
      "\u4E2A\u4EBA\u7EE9\u6548\u76EE\u6807\u5236\u5B9A\u53CA\u53D8\u66F4\u6D41\u7A0B",
      "\u865A\u7EBF\u6C47\u62A5\u8D1F\u8D23\u4EBA",
      false
    ],
    [
      "\u4E2A\u4EBA\u7EE9\u6548\u76EE\u6807\u5236\u5B9A\u53CA\u53D8\u66F4\u6D41\u7A0B",
      "\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      false
    ],
    [
      "\u4E2A\u4EBA\u7EE9\u6548\u8BC4\u4EF7\u53CA\u53CD\u9988\u6D41\u7A0B",
      "\u8003\u6838\u8D23\u4EFB\u4EBA\u521D\u8BC4",
      false
    ],
    [
      "\u4E2A\u4EBA\u7EE9\u6548\u8BC4\u4EF7\u53CA\u53CD\u9988\u6D41\u7A0B",
      "\u90E8\u95E8\u8BC4\u8BAE",
      false
    ],
    [
      "\u4E2A\u4EBA\u7EE9\u6548\u8BC4\u4EF7\u53CA\u53CD\u9988\u6D41\u7A0B",
      "\u7EE9\u6548\u53CD\u9988\u6C9F\u901A",
      false
    ],
    [
      "\u4E2A\u4EBA\u7EE9\u6548\u8BC4\u4EF7\u53CA\u53CD\u9988\u6D41\u7A0B",
      "\u7EE9\u6548\u7ED3\u679C\u63A5\u6536&\u6EE1\u610F\u5EA6\u8C03\u67E5",
      false
    ],
    [
      "\u4E2A\u4EBA\u7EE9\u6548\u8BC4\u4EF7\u53CA\u53CD\u9988\u6D41\u7A0B",
      "\u8D77\u8349\u8282\u70B9",
      false
    ],
    [
      "\u4E2A\u4EBA\u7EE9\u6548\u8BC4\u4EF7\u53CA\u53CD\u9988\u6D41\u7A0B",
      "\u7EE9\u6548\u8BC4\u5B9A",
      false
    ],
    [
      "\u4E2A\u4EBA\u7EE9\u6548\u8BC4\u4EF7\u53CA\u53CD\u9988\u6D41\u7A0B",
      "\u7ED3\u679C\u786E\u5B9A",
      false
    ],
    [
      "\u54C1\u724C\u89C6\u89C9\u5BA1\u6838\u6D41\u7A0B",
      "\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u54C1\u724C\u89C6\u89C9\u5BA1\u6838\u6D41\u7A0B",
      "\u4E00\u7EA7\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u54C1\u724C\u89C6\u89C9\u5BA1\u6838\u6D41\u7A0B",
      "\u8D77\u8349\u8282\u70B9",
      false
    ],
    [
      "\u54C1\u724C\u89C6\u89C9\u5BA1\u6838\u6D41\u7A0B",
      "\u89C6\u89C9\u5BA1\u6838",
      true
    ],
    [
      "\u54C1\u724C\u89C6\u89C9\u5BA1\u6838\u6D41\u7A0B",
      "\u5BA3\u4F20\u573A\u666F\u4F7F\u7528\u6548\u679C\u53CD\u9988",
      false
    ],
    [
      "\u54C1\u724C\u89C6\u89C9\u5BA1\u6838\u6D41\u7A0B",
      "\u5907\u6848",
      true
    ],
    [
      "\u54C1\u724C\u89C6\u89C9\u5BA1\u6838\u6D41\u7A0B",
      "\u4E0A\u4F20\u8BBE\u8BA1\u6587\u4EF6",
      true
    ],
    [
      "\u57F9\u8BAD\u8BF7\u5047\u6D41\u7A0B",
      "\u8BF7\u5047\u4EBA\u5BF9\u5E94\u4E09\u7EA7\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u57F9\u8BAD\u8BF7\u5047\u6D41\u7A0B",
      "\u8BF7\u5047\u4EBA\u5BF9\u5E94\u4E00\u7EA7\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u57F9\u8BAD\u8BF7\u5047\u6D41\u7A0B",
      "\u8D77\u8349\u8282\u70B9",
      false
    ],
    [
      "\u57F9\u8BAD\u8BF7\u5047\u6D41\u7A0B",
      "\u8BF7\u5047\u4EBA\u5BF9\u5E94\u4E8C\u7EA7\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u57F9\u8BAD\u8BF7\u5047\u6D41\u7A0B",
      "\u57F9\u8BAD\u53EC\u96C6\u8005",
      true
    ],
    [
      "\u5E73\u53F0/\u6280\u672F\u5165\u5E93\u51B3\u7B56\u8BC4\u5BA1",
      "\u8BC4\u5BA1\u56E2\u961F",
      true
    ],
    [
      "\u8BD5\u4EA7\u901A\u77E5",
      "\u8BA1\u5212\u6392\u4EA7(\u8BA1\u5212\u4EE3\u8868)",
      true
    ],
    [
      "\u8BD5\u7528\u671F\u5DE5\u4F5C\u8868",
      "\u8D77\u8349\u8282\u70B9",
      false
    ],
    [
      "\u8BD5\u7528\u671F\u5DE5\u4F5C\u8868",
      "\u786E\u8BA4\u8BD5\u7528\u671F\u5DE5\u4F5C\u8BA1\u5212",
      true
    ],
    [
      "\u8BD5\u7528\u671F\u5DE5\u4F5C\u8868",
      "\u9996\u6708\u603B\u7ED3",
      false
    ],
    [
      "\u8BD5\u7528\u671F\u5DE5\u4F5C\u8868",
      "\u9996\u6708\u786E\u8BA4",
      false
    ],
    [
      "\u8BD5\u7528\u671F\u5DE5\u4F5C\u8868",
      "\u6B21\u6708\u603B\u7ED3",
      false
    ],
    [
      "\u8BD5\u7528\u671F\u5DE5\u4F5C\u8868",
      "\u6B21\u6708\u786E\u8BA4",
      false
    ],
    [
      "\u8BD5\u7528\u671F\u5DE5\u4F5C\u8868",
      "\u8F6C\u6B63\u524D\u6708\u603B\u7ED3",
      false
    ],
    [
      "\u8BD5\u7528\u671F\u5DE5\u4F5C\u8868",
      "\u8F6C\u6B63\u524D\u6708\u786E\u8BA4",
      false
    ],
    [
      "\u8BD5\u7528\u671F\u5DE5\u4F5C\u8868",
      "\u8BC4\u4EF7\u5BFC\u5E08",
      true
    ],
    [
      "\u8BD5\u7528\u671F\u5DE5\u4F5C\u8868",
      "\u5BFC\u5E08",
      true
    ],
    [
      "\u8BD5\u7528\u671F\u5DE5\u4F5C\u8868",
      "\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u8BD5\u7528\u671F\u5DE5\u4F5C\u8868",
      "\u603B\u7ED3\u8BD5\u7528\u671F\u60C5\u51B5\u5E76\u4E0A\u4F20\u4EA4\u4ED8\u7269",
      false
    ],
    [
      "\u8BD5\u7528\u671F\u5DE5\u4F5C\u8868",
      "\u5BFC\u5E08\u8BC4\u4EF7",
      true
    ],
    [
      "\u5B9E\u9A8C\u5BA4/\u7814\u53D1\u697C\u95E8\u7981\u6743\u9650\u7533\u8BF7",
      "\u8D77\u8349\u8282\u70B9",
      false
    ],
    [
      "\u5B9E\u9A8C\u5BA4/\u7814\u53D1\u697C\u95E8\u7981\u6743\u9650\u7533\u8BF7",
      "\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u4EA7\u54C1\u56FD\u9645\u6761\u5F62\u7801\u7533\u8BF7/\u53D8\u66F4",
      "\u8D77\u8349\u8282\u70B9",
      false
    ],
    [
      "\u4EA7\u54C1\u56FD\u9645\u6761\u5F62\u7801\u7533\u8BF7/\u53D8\u66F4",
      "\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u4EA7\u54C1\u56FD\u9645\u6761\u5F62\u7801\u7533\u8BF7/\u53D8\u66F4",
      "\u586B\u5199\u5916\u90E8\u4FE1\u606F",
      true
    ],
    [
      "\u8C03\u85AA\u7533\u8BF7",
      "\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u8C03\u85AA\u7533\u8BF7",
      "\u4E00\u7EA7\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u4FE1\u606F\u7CFB\u7EDF\u8D26\u53F7\u7533\u8BF7",
      "\u8D77\u8349\u8282\u70B9",
      false
    ],
    [
      "\u4FE1\u606F\u7CFB\u7EDF\u8D26\u53F7\u7533\u8BF7",
      "\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u4FE1\u606F\u7CFB\u7EDF\u8D26\u53F7\u7533\u8BF7",
      "\u4E00\u7EA7\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u4FE1\u606F\u7CFB\u7EDF\u8D26\u53F7\u7533\u8BF7",
      "\u8D77\u8349\u4EBA\u786E\u8BA4",
      true
    ],
    [
      "\u4FE1\u606F\u7CFB\u7EDF\u8D26\u53F7\u7533\u8BF7",
      "\u4E8C\u7EA7\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u4FE1\u606F\u7CFB\u7EDF\u8D26\u53F7\u7533\u8BF7",
      "\u987E\u95EE\u914D\u7F6E\u6743\u9650",
      true
    ],
    [
      "\u4FE1\u606F\u7CFB\u7EDF\u8D26\u53F7\u7533\u8BF7",
      "Basis\u5904\u7406",
      true
    ],
    [
      "\u4FE1\u606F\u7CFB\u7EDF\u8D26\u53F7\u7533\u8BF7",
      "\u5173\u952E\u7528\u6237\u5BA1\u6279",
      true
    ],
    [
      "\u4FE1\u606F\u7CFB\u7EDF\u8D26\u53F7\u7533\u8BF7",
      "\u76F8\u5173\u9886\u5BFC\u5BA1\u6279",
      true
    ],
    [
      "\u7269\u6599\u4E3B\u6570\u636E\u65B0\u589E",
      "\u9500\u552E\u89C6\u56FE",
      true
    ],
    [
      "\u7269\u6599\u4E3B\u6570\u636E\u65B0\u589E",
      "\u8D77\u8349\u8282\u70B9",
      false
    ],
    [
      "\u7269\u6599\u4E3B\u6570\u636E\u65B0\u589E",
      "\u76F4\u63A5\u9886\u5BFC",
      true
    ],
    [
      "\u7269\u6599\u4E3B\u6570\u636E\u65B0\u589E",
      "\u6570\u636E\u6C47\u603B",
      true
    ],
    [
      "\u7269\u6599\u4E3B\u6570\u636E\u4FEE\u6539",
      "\u4E1A\u52A1\u90E8\u95E8\u4F1A\u7B7E",
      true
    ],
    [
      "\u7269\u6599\u4E3B\u6570\u636E\u4FEE\u6539",
      "\u8D77\u8349\u8282\u70B9",
      false
    ],
    [
      "\u7269\u6599\u4E3B\u6570\u636E\u4FEE\u6539",
      "\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u7269\u6599\u4E3B\u6570\u636E\u5220\u9664\u4E0E\u51BB\u7ED3",
      "\u89E3\u51BB\u9700\u6C42\u4EBA",
      true
    ],
    [
      "\u7269\u6599\u4E3B\u6570\u636E\u5220\u9664\u4E0E\u51BB\u7ED3",
      "\u7528\u6237\u670D\u52A1\u90E8\u4F1A\u7B7E",
      true
    ],
    [
      "\u7269\u6599\u4E3B\u6570\u636E\u5220\u9664\u4E0E\u51BB\u7ED3",
      "\u4EA7\u54C1\u7ECF\u7406\u4F1A\u7B7E",
      true
    ],
    [
      "\u6587\u5316\u6295\u7A3F\u6D41\u7A0B",
      "\u4E8C\u7EA7\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u6587\u5316\u6295\u7A3F\u6D41\u7A0B",
      "\u4E00\u7EA7\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u6587\u5316\u6295\u7A3F\u6D41\u7A0B",
      "\u90E8\u95E8\u661F\u706B",
      true
    ],
    [
      "\u6587\u5316\u6295\u7A3F\u6D41\u7A0B",
      "\u8D77\u8349\u8282\u70B9",
      false
    ],
    [
      "\u6587\u5316\u6295\u7A3F\u6D41\u7A0B",
      "\u4E09\u7EA7\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u6587\u5316\u6295\u7A3F\u6D41\u7A0B",
      "\u4F01\u4E1A\u6587\u5316",
      true
    ],
    [
      "\u65B0\u54C1\u9884\u6D4B\u9700\u6C42",
      "\u8FD0\u8425\u4EE3\u8868",
      true
    ],
    [
      "\u9500\u552E\u65B9\u6848\u53CA\u8D39\u7528\u7533\u8BF7\uFF08\u7EBF\u4E0B\u8425\u9500\u4E13\u7528\uFF09",
      "\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u9500\u552E\u65B9\u6848\u53CA\u8D39\u7528\u7533\u8BF7\uFF08\u7EBF\u4E0B\u8425\u9500\u4E13\u7528\uFF09",
      "\u8D39\u7528\u4F1A\u8BA1",
      true
    ],
    [
      "\u9500\u552E\u65B9\u6848\u53CA\u8D39\u7528\u7533\u8BF7\uFF08\u7EBF\u4E0B\u8425\u9500\u4E13\u7528\uFF09",
      "\u8D77\u8349\u8282\u70B9",
      false
    ],
    [
      "\u9500\u552E\u65B9\u6848\u53CA\u8D39\u7528\u7533\u8BF7\uFF08\u7EBF\u4E0B\u8425\u9500\u4E13\u7528\uFF09",
      "\u4EA7\u54C1\u8FD0\u8425",
      true
    ],
    [
      "\u9500\u552E\u65B9\u6848\u53CA\u8D39\u7528\u7533\u8BF7\uFF08\u7EBF\u4E0B\u8425\u9500\u4E13\u7528\uFF09",
      "\u4F1A\u8BA1\u4E3B\u7BA1",
      true
    ],
    [
      "\u9500\u552E\u65B9\u6848\u53CA\u8D39\u7528\u7533\u8BF7\uFF08\u7EBF\u4E0B\u8425\u9500\u4E13\u7528\uFF09",
      "\u4E8C\u7EA7\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u9500\u552E\u9879\u76EE\u7ED3\u6848",
      "\u8D39\u7528\u4F1A\u8BA1",
      true
    ],
    [
      "\u9500\u552E\u9879\u76EE\u7ED3\u6848",
      "\u8D77\u8349\u8282\u70B9",
      false
    ],
    [
      "\u9500\u552E\u9879\u76EE\u7ED3\u6848",
      "\u4E8C\u7EA7\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u7EBF\u4E0B\u5BF9/\u8C03\u8D26\u5F00\u7968\u7533\u8BF7",
      "\u8D77\u8349\u8282\u70B9",
      false
    ],
    [
      "\u7EBF\u4E0B\u5BF9/\u8C03\u8D26\u5F00\u7968\u7533\u8BF7",
      "\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u7EBF\u4E0B\u5BF9/\u8C03\u8D26\u5F00\u7968\u7533\u8BF7",
      "\u5236\u9006\u5411\u5355",
      true
    ],
    [
      "\u7EBF\u4E0B\u5BF9/\u8C03\u8D26\u5F00\u7968\u7533\u8BF7",
      "\u5236\u6B63\u5411\u5355",
      true
    ],
    [
      "\u7EBF\u4E0B\u5BF9/\u8C03\u8D26\u5F00\u7968\u7533\u8BF7",
      "\u8C03\u8D26\u6E05\u5355",
      true
    ],
    [
      "\u7EBF\u4E0B\u5BF9/\u8C03\u8D26\u5F00\u7968\u7533\u8BF7",
      "\u4F1A\u8BA1\u4E13\u5458",
      true
    ],
    [
      "\u5F02\u5E38\u53D1\u8D27\u8BA2\u5355\u8D39\u7528",
      "\u9500\u552E\u8BA1\u5212\u4EE3\u8868",
      true
    ],
    [
      "\u6708\u5EA6\u4E4B\u661F\u7533\u8BF7",
      "\u8D77\u8349\u8282\u70B9",
      false
    ],
    [
      "\u6708\u5EA6\u4E4B\u661F\u7533\u8BF7",
      "\u4E00\u7EA7\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u533A\u57DF\u4EBA\u5458\u63A2\u4EB2\u5047\u7533\u8BF7",
      "\u7B7E\u5B57\u8282\u70B9",
      true
    ],
    [
      "\u533A\u57DF\u4EBA\u5458\u63A2\u4EB2\u5047\u7533\u8BF7",
      "\u670D\u52A1\u6267\u884C\u90E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u533A\u57DF\u4EBA\u5458\u63A2\u4EB2\u5047\u7533\u8BF7",
      "\u8D77\u8349\u8282\u70B9",
      false
    ],
    [
      "\u533A\u57DF\u4EBA\u5458\u63A2\u4EB2\u5047\u7533\u8BF7",
      "\u7528\u6237\u670D\u52A1\u4E2D\u5FC3\u603B\u7ECF\u7406",
      true
    ],
    [
      "\u5458\u5DE5\u5173\u7CFB\u5904\u7406\u7533\u8BF7",
      "\u79BB\u804C\u8005\u76F4\u63A5\u9886\u5BFC",
      true
    ],
    [
      "\u5458\u5DE5\u5173\u7CFB\u5904\u7406\u7533\u8BF7",
      "\u4E00\u7EA7\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u91C7\u8D2D\u8BF7\u6C42\uFF08\u8D44\u4EA7\uFF09",
      "\u8D77\u8349\u8282\u70B9",
      false
    ],
    [
      "\u91C7\u8D2D\u8BF7\u6C42\uFF08\u8D44\u4EA7\uFF09",
      "\u4E00\u7EA7\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u91C7\u8D2D\u8BF7\u6C42\uFF08\u8D44\u4EA7\uFF09",
      "\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u8D44\u4EA7\u9879\u76EE\u9A8C\u6536\u7EC4\u6210\u5458\u7533\u8BF7",
      "\u9A8C\u6536\u9879\u76EE\u6279\u51C6\u4EBA",
      true
    ],
    [
      "\u8D44\u4EA7\u9879\u76EE\u9A8C\u6536\u7EC4\u6210\u5458\u7533\u8BF7",
      "\u4F7F\u7528\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u8D44\u4EA7\u9879\u76EE\u9A8C\u6536\u7EC4\u6210\u5458\u7533\u8BF7",
      "\u5907\u6848",
      true
    ],
    [
      "\u8D44\u4EA7\u9879\u76EE\u9A8C\u6536\u7EC4\u6210\u5458\u7533\u8BF7",
      "\u6280\u672F\u4EBA\u5458\u6240\u5728\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u8D44\u4EA7\u9879\u76EE\u9A8C\u6536\u7EC4\u6210\u5458\u7533\u8BF7",
      "\u8463\u4E8B\u957F\u529E\u516C\u5BA4\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u4E13\u5229\u68C0\u7D22\u7533\u8BF7\u6D41\u7A0B",
      "\u8D77\u8349\u8282\u70B9",
      false
    ],
    [
      "\u4E13\u5229\u68C0\u7D22\u7533\u8BF7\u6D41\u7A0B",
      "\u4E8C\u7EA7\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u4E13\u5229\u68C0\u7D22\u7533\u8BF7\u6D41\u7A0B",
      "\u4E00\u7EA7\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u4E13\u5229\u68C0\u7D22\u7533\u8BF7\u6D41\u7A0B",
      "\u4E09\u7EA7\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u4E13\u5229\u68C0\u7D22\u7533\u8BF7\u6D41\u7A0B",
      "\u4E13\u5229\u8BC4\u5206",
      true
    ],
    [
      "\u4E13\u5229\u68C0\u7D22\u7533\u8BF7\u6D41\u7A0B",
      "\u786E\u8BA4\u7533\u8BF7\u6587\u4EF6\u521D\u7A3F\u8282\u70B9",
      true
    ],
    [
      "\u4ED8\u6B3E\u7533\u8BF7\u6D41\u7A0B",
      "\u5F80\u6765\u4F1A\u8BA1\u5BA1\u6838",
      true
    ],
    [
      "\u4ED8\u6B3E\u7533\u8BF7\u6D41\u7A0B",
      "\u8D77\u8349\u8282\u70B9",
      false
    ],
    [
      "\u4ED8\u6B3E\u7533\u8BF7\u6D41\u7A0B",
      "\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u4ED8\u6B3E\u7533\u8BF7\u6D41\u7A0B",
      "\u51FA\u7EB3\u4ED8\u6B3E",
      true
    ],
    [
      "\u4ED8\u6B3E\u7533\u8BF7\u6D41\u7A0B",
      "\u4E00\u7EA7\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u4ED8\u6B3E\u7533\u8BF7\u6D41\u7A0B",
      "\u4E8C\u7EA7\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u4F9B\u5E94\u5546\u4E3B\u6570\u636E\u65B0\u589E",
      "\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u4F9B\u5E94\u5546\u8D39\u7528\u6838\u9500\u7533\u8BF7",
      "\u8D77\u8349\u8282\u70B9",
      false
    ],
    [
      "\u4F9B\u5E94\u5546\u8D39\u7528\u6838\u9500\u7533\u8BF7",
      "\u4E8C\u7EA7\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u4F9B\u5E94\u5546\u8D39\u7528\u6838\u9500\u7533\u8BF7",
      "\u4E00\u7EA7\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u4F9B\u5E94\u5546\u8D39\u7528\u6838\u9500\u7533\u8BF7",
      "\u4E09\u7EA7\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u4F9B\u5E94\u5546\u8D39\u7528\u6838\u9500\u7533\u8BF7",
      "\u51FA\u7EB3\u8BB0\u8D26",
      true
    ],
    [
      "\u4FE1\u606F\u5316\u9700\u6C42\u7533\u8BF7",
      "\u4E0A\u7EBF\u786E\u8BA4",
      true
    ],
    [
      "\u4FE1\u606F\u5316\u9700\u6C42\u7533\u8BF7",
      "\u7533\u8BF7\u4EBA\u6D4B\u8BD5",
      false
    ],
    [
      "\u4FE1\u606F\u5316\u9700\u6C42\u7533\u8BF7",
      "\u8D77\u8349\u8282\u70B9",
      false
    ],
    [
      "\u4FE1\u606F\u5316\u9700\u6C42\u7533\u8BF7",
      "\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u4FE1\u606F\u5316\u9700\u6C42\u7533\u8BF7",
      "\u4E00\u7EA7\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u4FE1\u606F\u5316\u9700\u6C42\u7533\u8BF7",
      "\u987E\u95EE\u9700\u6C42\u5206\u6790",
      true
    ],
    [
      "\u4FE1\u606F\u5316\u9700\u6C42\u7533\u8BF7",
      "\u4E8C\u7EA7\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u4FE1\u606F\u5316\u9700\u6C42\u7533\u8BF7",
      "\u4EFB\u52A1\u6267\u884C\u4EBA\u7B7E\u6536\u53CA\u5F00\u53D1",
      true
    ],
    [
      "\u4FE1\u606F\u5316\u9700\u6C42\u7533\u8BF7",
      "\u5F00\u53D1\u4EFB\u52A1\u7B7E\u6536\u53CA\u5F00\u53D1",
      true
    ],
    [
      "\u4FE1\u606F\u5316\u9700\u6C42\u7533\u8BF7",
      "\u5F00\u53D1\u9700\u6C42\u8BC4\u4F30",
      true
    ],
    [
      "\u4FE1\u606F\u5B89\u5168\u7CFB\u7EDF\u6743\u9650\u7533\u8BF7",
      "\u8D77\u8349\u8282\u70B9",
      false
    ],
    [
      "\u4FE1\u606F\u5B89\u5168\u7CFB\u7EDF\u6743\u9650\u7533\u8BF7",
      "\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u4FE1\u606F\u5B89\u5168\u7CFB\u7EDF\u6743\u9650\u7533\u8BF7",
      "\u4E00\u7EA7\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u6210\u54C1\u501F\u7528",
      "\u8D77\u8349\u8282\u70B9",
      false
    ],
    [
      "\u6210\u54C1\u501F\u7528",
      "\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u6210\u54C1\u501F\u7528",
      "\u4E00\u7EA7\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u8F66\u8F86\u95E8\u7981\u53CA\u8BBF\u5BA2\u5361\u5F00\u901A\u7533\u8BF7",
      "\u76F4\u5C5E\u4E0A\u53F8",
      true
    ],
    [
      "\u8F66\u8F86\u95E8\u7981\u53CA\u8BBF\u5BA2\u5361\u5F00\u901A\u7533\u8BF7",
      "\u8D77\u8349\u8282\u70B9",
      false
    ],
    [
      "\u8F66\u8F86\u95E8\u7981\u53CA\u8BBF\u5BA2\u5361\u5F00\u901A\u7533\u8BF7",
      "\u505C\u8F66\u8BC1\u5F00\u901A",
      true
    ],
    [
      "\u5458\u5DE5\u5165\u804C\u51C6\u5907\u6D41\u7A0B",
      "\u7528\u4EBA\u90E8\u95E8\u51C6\u5907",
      true
    ],
    [
      "\u5458\u5DE5\u5165\u804C\u51C6\u5907\u6D41\u7A0B",
      "\u5BFC\u5E08\u51C6\u5907",
      true
    ],
    [
      "\u5458\u5DE5\u5165\u804C\u51C6\u5907\u6D41\u7A0B",
      "\u57F9\u8BAD",
      true
    ],
    [
      "\u516C\u5173\u5A92\u4F53\u4F20\u64AD\u8D44\u6E90\u7533\u8BF7",
      "\u8D77\u8349\u8282\u70B9",
      false
    ],
    [
      "\u516C\u5173\u5A92\u4F53\u4F20\u64AD\u8D44\u6E90\u7533\u8BF7",
      "\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u516C\u5173\u5A92\u4F53\u4F20\u64AD\u8D44\u6E90\u7533\u8BF7",
      "\u786E\u8BA4\u53CD\u9988",
      true
    ],
    [
      "\u51FA\u5DEE\u7533\u8BF7\u6D41\u7A0B",
      "\u8D77\u8349\u8282\u70B9",
      false
    ],
    [
      "\u51FA\u5DEE\u7533\u8BF7\u6D41\u7A0B",
      "\u76F4\u63A5\u9886\u5BFC",
      true
    ],
    [
      "\u51FA\u5DEE\u7533\u8BF7\u6D41\u7A0B",
      "\u95F4\u63A5\u9886\u5BFC",
      true
    ],
    [
      "\u51FA\u5DEE\u7533\u8BF7\u6D41\u7A0B",
      "\u4E00\u7EA7\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u51FA\u5DEE\u7533\u8BF7\u6D41\u7A0B",
      "\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u51FA\u5DEE\u7533\u8BF7\u6D41\u7A0B",
      "\u4E8C\u7EA7\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u52A0\u73ED\u7533\u8BF7\u5355",
      "\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u52A0\u73ED\u7533\u8BF7\u5355",
      "\u8D77\u8349\u8282\u70B9",
      false
    ],
    [
      "\u52A0\u73ED\u7533\u8BF7\u5355",
      "\u4E00\u7EA7\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u52A0\u73ED\u7533\u8BF7\u5355",
      "\u4E8C\u7EA7\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u52A0\u73ED\u7533\u8BF7\u5355",
      "\u85AA\u916C\u7EE9\u6548\u90E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u7EBF\u4E0B\u8425\u9500\u533A\u57DF\u7533\u8BF7",
      "\u8D77\u8349\u8282\u70B9",
      false
    ],
    [
      "\u7EBF\u4E0B\u8425\u9500\u533A\u57DF\u7533\u8BF7",
      "\u4F1A\u8BA1\u7ED3\u7B97\u90E8\u4E3B\u7BA1",
      true
    ],
    [
      "\u7EBF\u4E0B\u8425\u9500\u533A\u57DF\u7533\u8BF7",
      "\u8FD0\u8425\u7BA1\u7406\u90E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u516C\u5173\u5371\u673A\u62A5\u5907\u7BA1\u7406",
      "\u62A5\u5907\u5904\u7406\u7ED3\u679C",
      false
    ],
    [
      "\u516C\u5173\u5371\u673A\u62A5\u5907\u7BA1\u7406",
      "\u8D77\u8349\u8282\u70B9",
      false
    ],
    [
      "\u516C\u5173\u5371\u673A\u62A5\u5907\u7BA1\u7406",
      "\u4E8C\u7EA7\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u516C\u5173\u5371\u673A\u62A5\u5907\u7BA1\u7406",
      "\u4E00\u7EA7\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u516C\u5173\u5371\u673A\u62A5\u5907\u7BA1\u7406",
      "\u5907\u6848\u4E0E\u68C0\u89C6",
      true
    ],
    [
      "\u63A5\u5F85\u7533\u8BF7\uFF08\u53C2\u89C2\uFF09",
      "\u8D77\u8349\u8282\u70B9",
      false
    ],
    [
      "\u63A5\u5F85\u7533\u8BF7\uFF08\u53C2\u89C2\uFF09",
      "\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u63A5\u5F85\u7533\u8BF7\uFF08\u53C2\u89C2\uFF09",
      "\u4E8C\u7EA7\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u63A5\u5F85\u7533\u8BF7\uFF08\u53C2\u89C2\uFF09",
      "\u5C55\u5385\u8BB2\u89E3\u5458",
      true
    ],
    [
      "\u5458\u5DE5\u8D39\u7528\u62A5\u9500\u7533\u8BF7\u6D41\u7A0B",
      "\u8D77\u8349\u8282\u70B9",
      false
    ],
    [
      "\u5458\u5DE5\u8D39\u7528\u62A5\u9500\u7533\u8BF7\u6D41\u7A0B",
      "\u4E8C\u7EA7\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u5458\u5DE5\u8D39\u7528\u62A5\u9500\u7533\u8BF7\u6D41\u7A0B",
      "\u4E00\u7EA7\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u5458\u5DE5\u8D39\u7528\u62A5\u9500\u7533\u8BF7\u6D41\u7A0B",
      "\u4E09\u7EA7\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u5458\u5DE5\u8D39\u7528\u62A5\u9500\u7533\u8BF7\u6D41\u7A0B",
      "\u8D22\u52A1\u4F1A\u8BA1\u4E3B\u7BA1\u2460",
      true
    ],
    [
      "\u5458\u5DE5\u8D39\u7528\u62A5\u9500\u7533\u8BF7\u6D41\u7A0B",
      "\u8D39\u7528\u4F1A\u8BA1",
      true
    ],
    [
      "\u57F9\u8BAD\u603B\u7ED3",
      "\u8D77\u8349\u8282\u70B9",
      false
    ],
    [
      "\u57F9\u8BAD\u603B\u7ED3",
      "\u53C2\u8BAD\u4EBA",
      true
    ],
    [
      "\u57F9\u8BAD\u603B\u7ED3",
      "\u53C2\u8BAD\u4EBA\u76F4\u5C5E\u4E0A\u53F8",
      true
    ],
    [
      "\u57F9\u8BAD\u7533\u8BF7\u6D41\u7A0B",
      "\u8D77\u8349\u8282\u70B9",
      false
    ],
    [
      "\u57F9\u8BAD\u7533\u8BF7\u6D41\u7A0B",
      "\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u57F9\u8BAD\u7533\u8BF7\u6D41\u7A0B",
      "\u4E00\u7EA7\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u590D\u4EA7\u6D41\u7A0B",
      "\u7528\u6237\u670D\u52A1\u4E2D\u5FC3\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u5916\u52E4\u7533\u8BF7\u5355",
      "\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u5916\u52E4\u7533\u8BF7\u5355",
      "\u8D77\u8349\u8282\u70B9",
      false
    ],
    [
      "\u98DF\u5802\u5BA2\u9910\u7533\u8BF7",
      "\u8D77\u8349\u8282\u70B9",
      false
    ],
    [
      "\u98DF\u5802\u5BA2\u9910\u7533\u8BF7",
      "\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u5DE5\u4F24\u7533\u62A5",
      "\u8D77\u8349\u8282\u70B9",
      false
    ],
    [
      "\u5DE5\u4F24\u7533\u62A5",
      "\u53D7\u4F24\u5458\u5DE5\u4E8C\u7EA7\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u5DE5\u4F24\u7533\u62A5",
      "\u53D7\u4F24\u5458\u5DE5\u4E00\u7EA7\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u91C7\u8D2D\u8BF7\u6C42(\u5E93\u5B58\u7BA1\u7406\u7C7B)",
      "\u8D77\u8349\u8282\u70B9",
      false
    ],
    [
      "\u91C7\u8D2D\u8BF7\u6C42(\u5E93\u5B58\u7BA1\u7406\u7C7B)",
      "\u4E09\u7EA7\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u91C7\u8D2D\u8BF7\u6C42(\u5E93\u5B58\u7BA1\u7406\u7C7B)",
      "\u4E8C\u7EA7\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u91C7\u8D2D\u8BF7\u6C42(\u5E93\u5B58\u7BA1\u7406\u7C7B)",
      "\u4E00\u7EA7\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u4EF7\u683C\u7EF4\u62A4\u6D41\u7A0B",
      "\u4F9B\u5E94\u5546\u7BA1\u7406\u5C97",
      true
    ],
    [
      "\u4EF7\u683C\u7EF4\u62A4\u6D41\u7A0B",
      "\u4F9B\u5E94\u94FE\u4E2D\u5FC3\u603B\u76D1",
      true
    ],
    [
      "\u4EF7\u683C\u7EF4\u62A4\u6D41\u7A0B",
      "\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u4EF7\u683C\u7EF4\u62A4\u6D41\u7A0B",
      "\u5BA1\u6279",
      true
    ],
    [
      "\u4EF7\u683C\u7EF4\u62A4\u6D41\u7A0B",
      "\u5907\u6848\u2461",
      true
    ],
    [
      "\u5458\u5DE5\u5F02\u52A8\u7533\u8BF7",
      "\u8D77\u8349\u8282\u70B9",
      false
    ],
    [
      "\u5458\u5DE5\u5F02\u52A8\u7533\u8BF7",
      "\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u5458\u5DE5\u5F02\u52A8\u7533\u8BF7",
      "\u4E8C\u7EA7\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u5458\u5DE5\u5F02\u52A8\u7533\u8BF7",
      "\u4E00\u7EA7\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u5458\u5DE5\u5F02\u52A8\u7533\u8BF7",
      "\u5F02\u52A8\u540E\u7684\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u5458\u5DE5\u5F02\u52A8\u7533\u8BF7",
      "HR\u786E\u8BA4",
      true
    ],
    [
      "\u5458\u5DE5\u5F02\u52A8\u7533\u8BF7",
      "\u5F02\u52A8\u540E\u7684\u4E00\u7EA7\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u5458\u5DE5\u5F02\u52A8\u7533\u8BF7",
      "\u5F02\u52A8\u540E\u4E8C\u7EA7\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u5F02\u5E38\u5DE5\u65F6\u7BA1\u7406",
      "\u8D23\u4EFB\u4EBA\u5BA1\u6279",
      true
    ],
    [
      "\u5F69\u5370\u7533\u8BF7",
      "\u8D77\u8349\u8282\u70B9",
      false
    ],
    [
      "\u5F69\u5370\u7533\u8BF7",
      "\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u5F69\u5370\u7533\u8BF7",
      "\u4E00\u7EA7\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u62DB\u8058\u9700\u6C42\u7533\u8BF7",
      "\u8D77\u8349\u8282\u70B9",
      false
    ],
    [
      "\u62DB\u8058\u9700\u6C42\u7533\u8BF7",
      "\u4E00\u7EA7\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u62DB\u8058\u9700\u6C42\u7533\u8BF7",
      "\u5907\u6848",
      true
    ],
    [
      "\u7EBF\u4E0B\u533A\u57DF\u63A2\u4EB2\u5047/\u8C03\u4F11\u7533\u8BF7",
      "\u8D77\u8349\u8282\u70B9",
      false
    ],
    [
      "\u63A5\u5F85\u7533\u8BF7\uFF08\u9910\u996E\u3001\u4F4F\u5BBF\u3001\u9152\u6C34\u3001\u793C\u54C1\uFF09",
      "\u8D77\u8349\u8282\u70B9",
      false
    ],
    [
      "\u63A5\u5F85\u7533\u8BF7\uFF08\u9910\u996E\u3001\u4F4F\u5BBF\u3001\u9152\u6C34\u3001\u793C\u54C1\uFF09",
      "\u4E8C\u7EA7\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u63A5\u5F85\u7533\u8BF7\uFF08\u9910\u996E\u3001\u4F4F\u5BBF\u3001\u9152\u6C34\u3001\u793C\u54C1\uFF09",
      "\u4E00\u7EA7\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u63A5\u5F85\u7533\u8BF7\uFF08\u9910\u996E\u3001\u4F4F\u5BBF\u3001\u9152\u6C34\u3001\u793C\u54C1\uFF09",
      "\u4E09\u7EA7\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u7279\u91C7\u7533\u8BF7",
      "\u5404\u4F1A\u7B7E\u90E8\u95E8\u4EE3\u8868",
      true
    ],
    [
      "\u6838\u4EF7(\u542B\u9884\u4F30\u6838\u4EF7\uFF09\u6D41\u7A0B",
      "\u5907\u6848\u4EBA",
      true
    ],
    [
      "\u6838\u4EF7(\u542B\u9884\u4F30\u6838\u4EF7\uFF09\u6D41\u7A0B",
      "\u9700\u8981\u5907\u6848\u4EBA\u5458",
      true
    ],
    [
      "\u6838\u4EF7(\u542B\u9884\u4F30\u6838\u4EF7\uFF09\u6D41\u7A0B",
      "\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u6838\u4EF7(\u542B\u9884\u4F30\u6838\u4EF7\uFF09\u6D41\u7A0B",
      "\u4E8C\u7EA7\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u6838\u4EF7(\u542B\u9884\u4F30\u6838\u4EF7\uFF09\u6D41\u7A0B",
      "\u8D77\u8349\u8282\u70B9",
      false
    ],
    [
      "\u6838\u4EF7(\u542B\u9884\u4F30\u6838\u4EF7\uFF09\u6D41\u7A0B",
      "\u4F9B\u5E94\u5546\u5F00\u53D1\u5C97",
      true
    ],
    [
      "\u6838\u4EF7(\u542B\u9884\u4F30\u6838\u4EF7\uFF09\u6D41\u7A0B",
      "\u62A5\u4EF7",
      true
    ],
    [
      "\u6838\u4EF7(\u542B\u9884\u4F30\u6838\u4EF7\uFF09\u6D41\u7A0B",
      "\u63D0\u4EA4\u5B9A\u4EF7\u8D44\u6599",
      true
    ],
    [
      "\u6838\u4EF7(\u542B\u9884\u4F30\u6838\u4EF7\uFF09\u6D41\u7A0B",
      "\u6838\u4EF7\u5C97",
      true
    ],
    [
      "\u6838\u4EF7(\u542B\u9884\u4F30\u6838\u4EF7\uFF09\u6D41\u7A0B",
      "\u63A5\u5355",
      true
    ],
    [
      "\u6838\u4EF7(\u542B\u9884\u4F30\u6838\u4EF7\uFF09\u6D41\u7A0B",
      "\u4F9B\u5E94\u94FE\u4E2D\u5FC3\u603B\u76D1",
      true
    ],
    [
      "\u5408\u540C\u7EBF\u4E0A\u5BA1\u67E5\u6D41\u7A0B",
      "\u5408\u540C\u6838\u5BF9/\u76D6\u7AE0",
      true
    ],
    [
      "\u5408\u540C\u7EBF\u4E0A\u5BA1\u67E5\u6D41\u7A0B",
      "\u9886\u53D6\u5408\u540C/\u626B\u63CF\u4E0A\u4F20\u53CA\u5907\u6848\u81F3\u8463\u529E\u3001\u8D22\u52A1",
      false
    ],
    [
      "\u5408\u540C\u7EBF\u4E0A\u5BA1\u67E5\u6D41\u7A0B",
      "\u53D1\u8D77\u4EBA\u5C06\u5408\u540C\u539F\u4EF6\u5907\u6848\u81F3\u8463\u529E",
      true
    ],
    [
      "\u5408\u540C\u7EBF\u4E0A\u5BA1\u67E5\u6D41\u7A0B",
      "\u4E00\u7EA7\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u5408\u540C\u7EBF\u4E0A\u5BA1\u67E5\u6D41\u7A0B",
      "\u4E0A\u4F20\u786E\u8BA4\u7A3F\uFF08\u586B\u5199\u5408\u540C\u7F16\u53F7\uFF09",
      false
    ],
    [
      "\u5408\u540C\u7EBF\u4E0A\u5BA1\u67E5\u6D41\u7A0B",
      "\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u5408\u540C\u7EBF\u4E0A\u5BA1\u67E5\u6D41\u7A0B",
      "\u8D77\u8349\u8282\u70B9",
      false
    ],
    [
      "\u5408\u540C\u7EBF\u4E0A\u5BA1\u67E5\u6D41\u7A0B",
      "\u4E8C\u7EA7\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u5408\u540C\u7EBF\u4E0A\u5BA1\u67E5\u6D41\u7A0B",
      "\u8D22\u52A1\u5BA1\u67E5\u5C97",
      true
    ],
    [
      "\u5408\u540C\u7EBF\u4E0A\u5BA1\u67E5\u6D41\u7A0B",
      "\u6253\u5370\u5408\u540C\u6B63\u672C",
      true
    ],
    [
      "\u5408\u540C\u7EBF\u4E0A\u5BA1\u67E5\u6D41\u7A0B",
      "\u786E\u8BA4\u6CD5\u5F8B\u6761\u6B3E",
      true
    ],
    [
      "\u5408\u540C\u7EBF\u4E0A\u5BA1\u67E5\u6D41\u7A0B",
      "\u9700\u6C42\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u5408\u540C\u7EBF\u4E0A\u5BA1\u67E5\u6D41\u7A0B",
      "\u4E0A\u4F20\u5408\u540C\u521D\u7A3F/\u6CD5\u5F8B\u98CE\u9669\u63D0\u793A\u51FD",
      true
    ],
    [
      "\u5408\u540C\u7EBF\u4E0A\u5BA1\u67E5\u6D41\u7A0B",
      "\u6CD5\u52A1\u4E2D\u5FC3\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u5408\u540C\u7EBF\u4E0A\u5BA1\u67E5\u6D41\u7A0B",
      "\u5408\u540C\u626B\u63CF\u4EF6\u53CA\u539F\u4EF6\u5907\u6848",
      true
    ],
    [
      "\u5408\u540C\u7EBF\u4E0A\u5BA1\u67E5\u6D41\u7A0B",
      "\u5408\u540C\u68C0\u89C6\u53CA\u626B\u63CF\u4EF6\u5907\u6848",
      true
    ],
    [
      "\u6D3E\u8F66\u7533\u8BF7\u5355",
      "\u8D77\u8349\u8282\u70B9",
      false
    ],
    [
      "\u6D3E\u8F66\u7533\u8BF7\u5355",
      "\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u6D3E\u8F66\u7533\u8BF7\u5355",
      "\u7533\u8BF7\u4EBA\u786E\u8BA4",
      true
    ],
    [
      "\u751F\u4EA7\u7269\u6599\u6700\u4F4E\u91C7\u8D2D\u91CF\u8BC4\u5BA1\u6216\u8D85\u8BA1\u5212\u91C7\u8D2D\u7533\u8BF7",
      "\u4F9B\u5E94\u94FE\u4E2D\u5FC3\u603B\u76D1",
      true
    ],
    [
      "\u751F\u4EA7\u7269\u6599\u6700\u4F4E\u91C7\u8D2D\u91CF\u8BC4\u5BA1\u6216\u8D85\u8BA1\u5212\u91C7\u8D2D\u7533\u8BF7",
      "\u5BA1\u6838\u4EBA",
      true
    ],
    [
      "\u79BB\u804C\u6D41\u7A0B",
      "\u76F4\u63A5\u9886\u5BFC\u5BA1\u6279",
      true
    ],
    [
      "\u79BB\u804C\u6D41\u7A0B",
      "\u8D77\u8349\u8282\u70B9",
      false
    ],
    [
      "\u79BB\u804C\u6D41\u7A0B",
      "\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u79BB\u804C\u6D41\u7A0B",
      "\u4EBA\u4E8B\u4E13\u5458\u5907\u6848",
      true
    ],
    [
      "\u79BB\u804C\u6D41\u7A0B",
      "\u542F\u52A8\u79BB\u804C\u4EA4\u63A5",
      false
    ],
    [
      "\u79BB\u804C\u6D41\u7A0B",
      "\u529E\u516C\u7528\u5177\u4EA4\u63A5\u786E\u8BA4",
      true
    ],
    [
      "\u79BB\u804C\u6D41\u7A0B",
      "\u5DE5\u4F5C\u63A5\u624B\u4EBA",
      false
    ],
    [
      "\u79BB\u804C\u6D41\u7A0B",
      "\u4E00\u7EA7\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u79BB\u804C\u6D41\u7A0B",
      "\u5382\u724C\u56DE\u6536\u786E\u8BA4",
      false
    ],
    [
      "\u79BB\u804C\u6D41\u7A0B",
      "\u4E8C\u7EA7\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u79BB\u804C\u6D41\u7A0B",
      "\u7EC4\u7EC7\u4E0E\u62DB\u8058\u90E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u7ECF\u9500\u5546\u5176\u4ED6\u7533\u8BF7\uFF08\u7EBF\u4E0B\u8425\u9500\u4E13\u7528\uFF09",
      "\u4E09\u7EA7\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u7ECF\u9500\u5546\u5176\u4ED6\u7533\u8BF7\uFF08\u7EBF\u4E0B\u8425\u9500\u4E13\u7528\uFF09",
      "\u7EBF\u4E0B\u8425\u9500\u603B\u90E8\u53D7\u7406\u5C97",
      true
    ],
    [
      "\u7ECF\u9500\u5546\u5176\u4ED6\u7533\u8BF7\uFF08\u7EBF\u4E0B\u8425\u9500\u4E13\u7528\uFF09",
      "\u8D77\u8349\u8282\u70B9",
      false
    ],
    [
      "\u7ECF\u9500\u5546\u5176\u4ED6\u7533\u8BF7\uFF08\u7EBF\u4E0B\u8425\u9500\u4E13\u7528\uFF09",
      "\u533A\u57DF\u7ECF\u7406",
      true
    ],
    [
      "\u7ECF\u9500\u5546\u8D39\u7528\u6838\u9500\u7533\u8BF7",
      "\u8D77\u8349\u8282\u70B9",
      false
    ],
    [
      "\u7ECF\u9500\u5546\u8D39\u7528\u6838\u9500\u7533\u8BF7",
      "\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u7ECF\u9500\u5546\u8D39\u7528\u6838\u9500\u7533\u8BF7",
      "\u4E00\u7EA7\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u7ECF\u9500\u5546\u8D39\u7528\u6838\u9500\u7533\u8BF7",
      "\u8D39\u7528\u4F1A\u8BA1\u63D0\u4EA4\u5F00\u7968\u8D44\u6599",
      true
    ],
    [
      "\u7ECF\u9500\u5546\u8D39\u7528\u6838\u9500\u7533\u8BF7",
      "\u8D39\u7528\u4F1A\u8BA1",
      true
    ],
    [
      "\u7ECF\u9500\u5546\u8D39\u7528\u6838\u9500\u7533\u8BF7",
      "\u8D22\u52A1\u4E2D\u5FC3\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u7ECF\u9500\u5546\u8D39\u7528\u6838\u9500\u7533\u8BF7",
      "\u51FA\u7EB3\u4ED8\u6B3E",
      true
    ],
    [
      "\u884C\u653F\u7EF4\u4FEE\u7533\u8BF7",
      "\u8D77\u8349\u8282\u70B9",
      false
    ],
    [
      "\u884C\u653F\u7EF4\u4FEE\u7533\u8BF7",
      "\u7EF4\u4FEE\u53D7\u7406",
      true
    ],
    [
      "\u884C\u653F\u7EF4\u4FEE\u7533\u8BF7",
      "\u8BE6\u60C5\u53CD\u9988",
      true
    ],
    [
      "\u8003\u52E4\u8865\u5361\u7533\u8BF7",
      "\u8D77\u8349\u8282\u70B9",
      false
    ],
    [
      "\u8003\u52E4\u8865\u5361\u7533\u8BF7",
      "\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u8BF7\u5047\u7533\u8BF7\u6D41\u7A0B",
      "\u8D77\u8349\u8282\u70B9",
      false
    ],
    [
      "\u8BF7\u5047\u7533\u8BF7\u6D41\u7A0B",
      "\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u8BF7\u5047\u7533\u8BF7\u6D41\u7A0B",
      "\u4E00\u7EA7\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u8BF7\u5047\u7533\u8BF7\u6D41\u7A0B",
      "\u9694\u7EA7\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u8BF7\u5047\u7533\u8BF7\u6D41\u7A0B",
      "\u4EBA\u4E8B\u4E13\u5458",
      true
    ],
    [
      "\u8D22\u52A1\u6570\u636E\u53CA\u8BC1\u4EF6\u8D44\u6599\u7C7B\u7533\u8BF7",
      "\u8D77\u8349\u8282\u70B9",
      false
    ],
    [
      "\u8D22\u52A1\u6570\u636E\u53CA\u8BC1\u4EF6\u8D44\u6599\u7C7B\u7533\u8BF7",
      "\u4E8C\u7EA7\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u8D22\u52A1\u6570\u636E\u53CA\u8BC1\u4EF6\u8D44\u6599\u7C7B\u7533\u8BF7",
      "\u4E00\u7EA7\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u8D22\u52A1\u6570\u636E\u53CA\u8BC1\u4EF6\u8D44\u6599\u7C7B\u7533\u8BF7",
      "\u63A5\u6536\u8D44\u6599\u6216\u6570\u636E",
      true
    ],
    [
      "\u8D22\u52A1\u6570\u636E\u53CA\u8BC1\u4EF6\u8D44\u6599\u7C7B\u7533\u8BF7",
      "\u8D22\u52A1\u529E\u7406\u4EBA",
      true
    ],
    [
      "\u91C7\u8D2D\u8BF7\u6C42(\u8D39\u7528\u7C7B)",
      "\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u91C7\u8D2D\u8BF7\u6C42(\u8D39\u7528\u7C7B)",
      "\u4E8C\u7EA7\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u91C7\u8D2D\u8BF7\u6C42(\u8D39\u7528\u7C7B)",
      "\u8D77\u8349\u8282\u70B9",
      false
    ],
    [
      "\u91C7\u8D2D\u8BF7\u6C42(\u8D39\u7528\u7C7B)",
      "\u91C7\u8D2D\u5458\u5904\u7406",
      true
    ],
    [
      "\u91C7\u8D2D\u8BF7\u6C42(\u8D39\u7528\u7C7B)",
      "\u4E09\u7EA7\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u91C7\u8D2D\u8BF7\u6C42(\u8D39\u7528\u7C7B)",
      "\u4E00\u7EA7\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u91C7\u8D2D\u8BF7\u6C42(\u8D39\u7528\u7C7B)",
      "\u91C7\u8D2D\u5458",
      true
    ],
    [
      "\u91C7\u8D2D\u8BF7\u6C42(\u8D39\u7528\u7C7B)",
      "\u91CA\u653E\u91C7\u8D2D\u8BA2\u5355",
      true
    ],
    [
      "\u5458\u5DE5\u8F6C\u6B63\u7533\u8BF7",
      "\u8D77\u8349\u8282\u70B9",
      false
    ],
    [
      "\u5458\u5DE5\u8F6C\u6B63\u7533\u8BF7",
      "\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u5458\u5DE5\u8F6C\u6B63\u7533\u8BF7",
      "\u4E00\u7EA7\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u5458\u5DE5\u8F6C\u6B63\u7533\u8BF7",
      "\u8003\u6838\u8BC4\u4F30\u4EBA",
      true
    ],
    [
      "\u5458\u5DE5\u8F6C\u6B63\u7533\u8BF7",
      "\u8BD5\u7528\u671F\u76EE\u6807\u81EA\u8BC4",
      true
    ],
    [
      "\u5458\u5DE5\u8F6C\u6B63\u7533\u8BF7",
      "\u586B\u5199\u8BD5\u7528\u671F\u603B\u7ED3",
      true
    ],
    [
      "\u5458\u5DE5\u8F6C\u6B63\u7533\u8BF7",
      "\u4E8C\u7EA7\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u9000\u6B3E\u7533\u8BF7\u6D41\u7A0B",
      "\u8D77\u8349\u8282\u70B9",
      false
    ],
    [
      "\u9000\u6B3E\u7533\u8BF7\u6D41\u7A0B",
      "\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u9000\u6B3E\u7533\u8BF7\u6D41\u7A0B",
      "\u4E00\u7EA7\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u9000\u6B3E\u7533\u8BF7\u6D41\u7A0B",
      "\u51FA\u7EB3\u4ED8\u6B3E",
      true
    ],
    [
      "\u9000\u6B3E\u7533\u8BF7\u6D41\u7A0B",
      "\u8D44\u91D1\u7BA1\u7406\u79D1\u5BA1\u6279",
      true
    ],
    [
      "\u91C7\u8D2D\u8BA2\u5355\u521B\u5EFA\u6D41\u7A0B",
      "\u8D77\u8349\u8282\u70B9",
      false
    ],
    [
      "\u91C7\u8D2D\u8BA2\u5355\u521B\u5EFA\u6D41\u7A0B",
      "\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u91C7\u8D2D\u8BA2\u5355\u521B\u5EFA\u6D41\u7A0B",
      "\u91C7\u8D2D\u8BA2\u5355\u91CA\u653E",
      true
    ],
    [
      "\u964D\u672C\u9879\u76EE\u7ACB\u9879\u53CA\u603B\u7ED3\u7533\u8BF7",
      "\u7528\u6237\u670D\u52A1\u4E2D\u5FC3\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u91C7\u8D2D\u8BF7\u6C42\uFF08\u975E\u5E93\u5B58\u7BA1\u7406\uFF09",
      "\u8D77\u8349\u8282\u70B9",
      false
    ],
    [
      "\u91C7\u8D2D\u8BF7\u6C42\uFF08\u975E\u5E93\u5B58\u7BA1\u7406\uFF09",
      "\u91C7\u8D2D\u5458\u5904\u7406",
      true
    ],
    [
      "\u91C7\u8D2D\u8BF7\u6C42\uFF08\u975E\u5E93\u5B58\u7BA1\u7406\uFF09",
      "\u4E8C\u7EA7\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u91C7\u8D2D\u8BF7\u6C42\uFF08\u975E\u5E93\u5B58\u7BA1\u7406\uFF09",
      "\u4E00\u7EA7\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u91C7\u8D2D\u8BF7\u6C42\uFF08\u975E\u5E93\u5B58\u7BA1\u7406\uFF09",
      "\u4E09\u7EA7\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u91C7\u8D2D\u8BF7\u6C42\uFF08\u975E\u5E93\u5B58\u7BA1\u7406\uFF09",
      "\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u91C7\u8D2D\u8BF7\u6C42\uFF08\u975E\u5E93\u5B58\u7BA1\u7406\uFF09",
      "\u91C7\u8D2D\u5458",
      true
    ],
    [
      "\u91C7\u8D2D\u8BF7\u6C42\uFF08\u975E\u5E93\u5B58\u7BA1\u7406\uFF09",
      "\u91CA\u653E\u8BA2\u5355",
      true
    ],
    [
      "\u8D44\u4EA7\u6295\u5165\u9879\u76EE\u53D8\u66F4\u7533\u8BF7",
      "\u8D77\u8349",
      false
    ],
    [
      "\u9886\u7528\u7533\u8BF7",
      "\u4E0A\u4F20\u53D1\u653E\u4FE1\u606F\u767B\u8BB0\u8868",
      true
    ],
    [
      "\u9886\u7528\u7533\u8BF7",
      "\u8D77\u8349\u8282\u70B9",
      false
    ],
    [
      "\u9886\u7528\u7533\u8BF7",
      "\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u9886\u7528\u7533\u8BF7",
      "\u4E8C\u7EA7\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u9886\u7528\u7533\u8BF7",
      "\u4E00\u7EA7\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u9886\u7528\u7533\u8BF7",
      "\u914D\u4EF6\u7BA1\u7406\u5C97",
      true
    ],
    [
      "\u9886\u7528\u7533\u8BF7",
      "\u9500\u552E\u786E\u8BA4",
      true
    ],
    [
      "\u9886\u7528\u7533\u8BF7",
      "\u9500\u552E\u8BA1\u5212\u90E8",
      true
    ],
    [
      "O\u7C7B\u5458\u5DE5\u8865\u8D34\u7533\u8BF7",
      "\u8D77\u8349\u8282\u70B9",
      false
    ],
    [
      "O\u7C7B\u5458\u5DE5\u8865\u8D34\u7533\u8BF7",
      "\u4E8C\u7EA7\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "O\u7C7B\u5458\u5DE5\u8865\u8D34\u7533\u8BF7",
      "\u4E00\u7EA7\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u9884\u7B97\u8FFD\u52A0/\u51CF\u5C11",
      "\u9884\u7B97\u8C03\u6574\u5355\u63D0\u4EA4",
      false
    ],
    [
      "\u9884\u7B97\u8FFD\u52A0/\u51CF\u5C11",
      "\u5BF9\u5E94\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u9884\u7B97\u8FFD\u52A0/\u51CF\u5C11",
      "\u5BF9\u5E94\u4E00\u7EA7\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u9884\u7B97\u5185\u8C03\u6574",
      "\u9884\u7B97\u8C03\u5242\u5355\u63D0\u4EA4",
      false
    ],
    [
      "\u9884\u7B97\u5185\u8C03\u6574",
      "\u5404\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u9884\u7B97\u5185\u8C03\u6574",
      "\u4E00\u7EA7\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u51FA\u5DEE\u7533\u8BF7\u5355",
      "\u5BF9\u5E94\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u51FA\u5DEE\u7533\u8BF7\u5355",
      "\u51FA\u5DEE\u7533\u8BF7\u5355\u63D0\u4EA4",
      false
    ],
    [
      "\u51FA\u5DEE\u7533\u8BF7\u5355",
      "\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u51FA\u5DEE\u7533\u8BF7\u5355",
      "\u4E00\u7EA7\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u51FA\u5DEE\u7533\u8BF7\u5355",
      "\u5BF9\u5E94\u4E00\u7EA7\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u51FA\u5DEE\u7533\u8BF7\u5355",
      "\u5BF9\u5E94\u4E8C\u7EA7\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u51FA\u5DEE\u7533\u8BF7\u5355",
      "\u8D39\u7528\u627F\u62C5\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u91CD\u4ED8\u5355",
      "\u91CD\u4ED8\u5355\u63D0\u4EA4",
      false
    ],
    [
      "\u91CD\u4ED8\u5355",
      "\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u91CD\u4ED8\u5355",
      "\u4E00\u7EA7\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u91C7\u8D2D\u9A8C\u6536\u8868",
      "\u91C7\u8D2D\u9A8C\u6536\u5355\u63D0\u4EA4",
      false
    ],
    [
      "\u91C7\u8D2D\u9A8C\u6536\u8868",
      "\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u91C7\u8D2D\u9A8C\u6536\u8868",
      "\u4E00\u7EA7\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u91C7\u8D2D\u9A8C\u6536\u8868",
      "\u4E8C\u7EA7\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u5DEE\u65C5\u62A5\u9500\u5355\uFF08\u8868\uFF09",
      "\u5DEE\u65C5\u62A5\u9500\u5355\u63D0\u4EA4",
      false
    ],
    [
      "\u5DEE\u65C5\u62A5\u9500\u5355\uFF08\u8868\uFF09",
      "\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u5DEE\u65C5\u62A5\u9500\u5355\uFF08\u8868\uFF09",
      "\u5BF9\u5E94\u4E00\u7EA7\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u5DEE\u65C5\u62A5\u9500\u5355\uFF08\u8868\uFF09",
      "\u4E8C\u7EA7\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u65E5\u5E38\u8D39\u7528\u62A5\u9500",
      "\u4FEE\u6539\u8D26\u53F7\u4FE1\u606F",
      false
    ],
    [
      "\u65E5\u5E38\u8D39\u7528\u62A5\u9500",
      "\u5BF9\u516C\u62A5\u9500\u5355\u63D0\u4EA4",
      false
    ],
    [
      "\u65E5\u5E38\u8D39\u7528\u62A5\u9500",
      "\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u65E5\u5E38\u8D39\u7528\u62A5\u9500",
      "\u4E00\u7EA7\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u65E5\u5E38\u8D39\u7528\u62A5\u9500",
      "\u5BA1\u6279",
      true
    ],
    [
      "\u65E5\u5E38\u8D39\u7528\u62A5\u9500",
      "\u4E8C\u7EA7\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u6211\u7684\u4F4F\u5BBF\u6253\u5361",
      "\u6253\u5361\u8BB0\u5F55\u63D0\u4EA4",
      false
    ],
    [
      "\u6211\u7684\u4F4F\u5BBF\u6253\u5361",
      "\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u6211\u7684\u4F4F\u5BBF\u6253\u5361",
      "\u4E00\u7EA7\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u9886\u6599\u7533\u8BF7\u5355",
      "\u4E0A\u4F20\u53D1\u653E\u4FE1\u606F\u767B\u8BB0\u8868",
      true
    ],
    [
      "\u7269\u6599\u62A5\u5E9F\u7533\u8BF7",
      "\u8D39\u7528\u627F\u62C5\u90E8\u95E8",
      true
    ],
    [
      "\u7269\u6599\u62A5\u5E9F\u7533\u8BF7",
      "\u7528\u6237\u670D\u52A1\u4E2D\u5FC3\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u65E5\u5E38\u8D39\u7528\u7C7B\u91C7\u8D2D\u7533\u8BF7",
      "\u91C7\u8D2D\u5458",
      true
    ],
    [
      "\u9886\u6599\u7533\u8BF7\u5355",
      "\u5BF9\u5E94\u4E00\u7EA7\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u9886\u6599\u7533\u8BF7\u5355",
      "\u914D\u4EF6\u7BA1\u7406\u5C97",
      true
    ],
    [
      "\u9886\u6599\u7533\u8BF7\u5355",
      "\u9886\u6599\u7533\u8BF7\u5355\u63D0\u4EA4",
      false
    ],
    [
      "\u9886\u6599\u7533\u8BF7\u5355",
      "\u5BF9\u5E94\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u9886\u6599\u7533\u8BF7\u5355",
      "\u5BF9\u5E94\u4E8C\u7EA7\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u65E5\u5E38\u8D39\u7528\u7C7B\u91C7\u8D2D\u7533\u8BF7",
      "\u8D39\u7528\u7533\u8BF7\u5355\u63D0\u4EA4",
      false
    ],
    [
      "\u65E5\u5E38\u8D39\u7528\u7C7B\u91C7\u8D2D\u7533\u8BF7",
      "\u5BF9\u5E94\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u65E5\u5E38\u8D39\u7528\u7C7B\u91C7\u8D2D\u7533\u8BF7",
      "\u5BF9\u5E94\u4E00\u7EA7\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u63A5\u5F85\u7533\u8BF7",
      "\u63A5\u5F85\u7533\u8BF7\uFF08\u9910\u996E\u3001\u4F4F\u5BBF\uFF09\u63D0\u4EA4",
      false
    ],
    [
      "\u63A5\u5F85\u7533\u8BF7",
      "\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u63A5\u5F85\u7533\u8BF7",
      "\u4E00\u7EA7\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u552E\u540E\u8D39\u7528\u7533\u8BF7",
      "\u8D39\u7528\u7533\u8BF7\u5355\u63D0\u4EA4",
      false
    ],
    [
      "\u552E\u540E\u8D39\u7528\u7533\u8BF7",
      "\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u552E\u540E\u8D39\u7528\u7533\u8BF7",
      "\u4E00\u7EA7\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u65E5\u5E38\u8D39\u7528\u7C7B\u91C7\u8D2D\u7533\u8BF7",
      "\u5BF9\u5E94\u4E8C\u7EA7\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u7269\u6599\u62A5\u5E9F\u7533\u8BF7",
      "\u62A5\u5E9F\u8D39\u7528\u7533\u8BF7\u63D0\u4EA4",
      false
    ],
    [
      "\u7269\u6599\u62A5\u5E9F\u7533\u8BF7",
      "\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u7269\u6599\u62A5\u5E9F\u7533\u8BF7",
      "\u4E00\u7EA7\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u7269\u6599\u62A5\u5E9F\u7533\u8BF7",
      "\u4E8C\u7EA7\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u63A5\u5F85\u7533\u8BF7",
      "\u4E8C\u7EA7\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u9886\u6599\u7533\u8BF7\u5355",
      "\u8D39\u7528\u627F\u62C5\u90E8\u95E8",
      true
    ],
    [
      "\u9886\u6599\u7533\u8BF7\u5355",
      "\u540C\u6B65wms\u5931\u8D25\u5904\u7406",
      true
    ],
    [
      "\u7EBF\u4E0B\u7ED3\u6848\u5355",
      "\u7EBF\u4E0B/\u65B0\u96F6\u552E\u7ED3\u6848\u5BA1\u6279\u6D41\u7A0B\u63D0\u4EA4",
      false
    ],
    [
      "\u65E5\u5E38\u8D39\u7528\u5408\u540C\u53F0\u8D26",
      "\u5408\u540C\u786E\u8BA4",
      false
    ],
    [
      "\u65E5\u5E38\u8D39\u7528\u5408\u540C\u53F0\u8D26",
      "\u5408\u540C\u53F0\u8D26\u5355\u63D0\u4EA4",
      false
    ],
    [
      "\u6279\u91CF\u4ED8\u6B3E\u5355",
      "\u6279\u91CF\u4ED8\u6B3E\u5355\u63D0\u4EA4",
      false
    ],
    [
      "\u6279\u91CF\u4ED8\u6B3E\u5355",
      "\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u6279\u91CF\u4ED8\u6B3E\u5355",
      "\u4E00\u7EA7\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u6279\u91CF\u4ED8\u6B3E\u5355",
      "\u4FEE\u6539\u8D26\u53F7\u4FE1\u606F",
      false
    ],
    [
      "\u9884\u4ED8\u5355",
      "\u9884\u4ED8\u5355\u63D0\u4EA4",
      false
    ],
    [
      "\u9884\u4ED8\u5355",
      "\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u9884\u4ED8\u5355",
      "\u5BF9\u5E94\u4E00\u7EA7\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u9884\u4ED8\u5355",
      "\u4E8C\u7EA7\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u7269\u6599\u76D8\u76C8\u76D8\u4E8F\u8C03\u8D26\u7533\u8BF7",
      "\u76D8\u76C8\u76D8\u4E8F\u8C03\u8D26\u7533\u8BF7\u5355\u63D0\u4EA4",
      false
    ],
    [
      "\u7269\u6599\u76D8\u76C8\u76D8\u4E8F\u8C03\u8D26\u7533\u8BF7",
      "\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u7269\u6599\u76D8\u76C8\u76D8\u4E8F\u8C03\u8D26\u7533\u8BF7",
      "\u8D39\u7528\u627F\u62C5\u8D1F\u8D23\u4EBA",
      true
    ],
    [
      "\u7269\u6599\u76D8\u76C8\u76D8\u4E8F\u8C03\u8D26\u7533\u8BF7",
      "\u4E00\u7EA7\u90E8\u95E8\u8D1F\u8D23\u4EBA",
      true
    ]
  ],
  personal: [
    {
      identity: "\u7BA1\u7406\u5E72\u90E8",
      category: "\u5185\u90E8\u9A71\u52A8\u578B",
      flowType: "\u9884\u7B97\u8FFD\u52A0/\u51CF\u5C11",
      platform: "\u8D39\u63A7",
      amount: "le10w",
      importance: "\u6B21\u8981\u6D41\u7A0B",
      limitDays: 2
    },
    {
      identity: "\u7BA1\u7406\u5E72\u90E8",
      category: "\u5185\u90E8\u9A71\u52A8\u578B",
      flowType: "\u9884\u7B97\u8FFD\u52A0/\u51CF\u5C11",
      platform: "\u8D39\u63A7",
      amount: "gt10w",
      importance: "\u91CD\u8981\u6D41\u7A0B",
      limitDays: 3
    },
    {
      identity: "\u7BA1\u7406\u5E72\u90E8",
      category: "\u5185\u90E8\u9A71\u52A8\u578B",
      flowType: "\u9884\u7B97\u5185\u8C03\u6574",
      platform: "\u8D39\u63A7",
      amount: "le10w",
      importance: "\u6B21\u8981\u6D41\u7A0B",
      limitDays: 2
    },
    {
      identity: "\u7BA1\u7406\u5E72\u90E8",
      category: "\u5185\u90E8\u9A71\u52A8\u578B",
      flowType: "\u9884\u7B97\u5185\u8C03\u6574",
      platform: "\u8D39\u63A7",
      amount: "gt10w",
      importance: "\u91CD\u8981\u6D41\u7A0B",
      limitDays: 3
    },
    {
      identity: "\u7BA1\u7406\u5E72\u90E8",
      category: "\u5185\u90E8\u9A71\u52A8\u578B",
      flowType: "\u65E5\u5E38\u8D39\u7528\u62A5\u9500",
      platform: "\u8D39\u63A7",
      amount: "any",
      importance: "\u6B21\u8981\u6D41\u7A0B",
      limitDays: 2
    },
    {
      identity: "\u7BA1\u7406\u5E72\u90E8",
      category: "\u5185\u90E8\u9A71\u52A8\u578B",
      flowType: "\u6279\u91CF\u4ED8\u6B3E\u5355",
      platform: "\u8D39\u63A7",
      amount: "any",
      importance: "\u6B21\u8981\u6D41\u7A0B",
      limitDays: 2
    },
    {
      identity: "\u7BA1\u7406\u5E72\u90E8",
      category: "\u5185\u90E8\u9A71\u52A8\u578B",
      flowType: "\u65E5\u5E38\u8D39\u7528\u7C7B\u91C7\u8D2D\u7533\u8BF7",
      platform: "\u8D39\u63A7",
      amount: "le10w",
      importance: "\u6B21\u8981\u6D41\u7A0B",
      limitDays: 2
    },
    {
      identity: "\u7BA1\u7406\u5E72\u90E8",
      category: "\u5185\u90E8\u9A71\u52A8\u578B",
      flowType: "\u65E5\u5E38\u8D39\u7528\u7C7B\u91C7\u8D2D\u7533\u8BF7",
      platform: "\u8D39\u63A7",
      amount: "gt10w",
      importance: "\u91CD\u8981\u6D41\u7A0B",
      limitDays: 3
    },
    {
      identity: "\u7BA1\u7406\u5E72\u90E8",
      category: "\u5185\u90E8\u9A71\u52A8\u578B",
      flowType: "\u7ACB\u9879\u5355\uFF08\u8D44\u4EA7\uFF09",
      platform: "\u8D39\u63A7",
      amount: "le10w",
      importance: "\u6B21\u8981\u6D41\u7A0B",
      limitDays: 2
    },
    {
      identity: "\u7BA1\u7406\u5E72\u90E8",
      category: "\u5185\u90E8\u9A71\u52A8\u578B",
      flowType: "\u7ACB\u9879\u5355\uFF08\u8D44\u4EA7\uFF09",
      platform: "\u8D39\u63A7",
      amount: "gt10w",
      importance: "\u91CD\u8981\u6D41\u7A0B",
      limitDays: 3
    },
    {
      identity: "\u7BA1\u7406\u5E72\u90E8",
      category: "\u5185\u90E8\u9A71\u52A8\u578B",
      flowType: "\u9886\u6599\u7533\u8BF7\u5355",
      platform: "\u8D39\u63A7",
      amount: "any",
      importance: "\u6B21\u8981\u6D41\u7A0B",
      limitDays: 2
    },
    {
      identity: "\u7BA1\u7406\u5E72\u90E8",
      category: "\u5185\u90E8\u9A71\u52A8\u578B",
      flowType: "\u7269\u6599\u62A5\u5E9F\u7533\u8BF7",
      platform: "\u8D39\u63A7",
      amount: "any",
      importance: "\u6B21\u8981\u6D41\u7A0B",
      limitDays: 2
    },
    {
      identity: "\u7BA1\u7406\u5E72\u90E8",
      category: "\u5185\u90E8\u9A71\u52A8\u578B",
      flowType: "\u9884\u4ED8\u5355",
      platform: "\u8D39\u63A7",
      amount: "any",
      importance: "\u6B21\u8981\u6D41\u7A0B",
      limitDays: 2
    },
    {
      identity: "\u7BA1\u7406\u5E72\u90E8",
      category: "\u5185\u90E8\u9A71\u52A8\u578B",
      flowType: "\u91CD\u4ED8\u5355",
      platform: "\u8D39\u63A7",
      amount: "any",
      importance: "\u6B21\u8981\u6D41\u7A0B",
      limitDays: 2
    },
    {
      identity: "\u7BA1\u7406\u5E72\u90E8",
      category: "\u5185\u90E8\u9A71\u52A8\u578B",
      flowType: "\u552E\u540E\u8D39\u7528\u7533\u8BF7",
      platform: "\u8D39\u63A7",
      amount: "le10w",
      importance: "\u6B21\u8981\u6D41\u7A0B",
      limitDays: 2
    },
    {
      identity: "\u7BA1\u7406\u5E72\u90E8",
      category: "\u5185\u90E8\u9A71\u52A8\u578B",
      flowType: "\u552E\u540E\u8D39\u7528\u7533\u8BF7",
      platform: "\u8D39\u63A7",
      amount: "gt10w",
      importance: "\u91CD\u8981\u6D41\u7A0B",
      limitDays: 3
    },
    {
      identity: "\u7BA1\u7406\u5E72\u90E8",
      category: "\u5185\u90E8\u9A71\u52A8\u578B",
      flowType: "\u91C7\u8D2D\u9A8C\u6536\u8868",
      platform: "\u8D39\u63A7",
      amount: "any",
      importance: "\u6B21\u8981\u6D41\u7A0B",
      limitDays: 2
    },
    {
      identity: "\u7BA1\u7406\u5E72\u90E8",
      category: "\u5185\u90E8\u9A71\u52A8\u578B",
      flowType: "\u9000\u6B3E\u7533\u8BF7\u6D41\u7A0B",
      platform: "OA",
      amount: "any",
      importance: "\u6B21\u8981\u6D41\u7A0B",
      limitDays: 2
    },
    {
      identity: "\u7BA1\u7406\u5E72\u90E8",
      category: "\u5185\u90E8\u9A71\u52A8\u578B",
      flowType: "\u5408\u540C\u7248\u672C\u5236\u5B9A/\u4FEE\u8BA2\u6D41\u7A0B",
      platform: "OA",
      amount: "any",
      importance: "\u91CD\u8981\u6D41\u7A0B",
      limitDays: 3
    },
    {
      identity: "\u7BA1\u7406\u5E72\u90E8",
      category: "\u5916\u90E8\u6D41\u8F6C\u578B",
      flowType: "\u6838\u4EF7(\u542B\u9884\u4F30\u6838\u4EF7\uFF09\u6D41\u7A0B/SRM\u6838\u4EF7(\u542B\u9884\u4F30\u6838\u4EF7\uFF09\u6D41\u7A0B",
      platform: "OA",
      amount: "any",
      importance: "\u91CD\u8981\u6D41\u7A0B",
      limitDays: 3
    },
    {
      identity: "\u7BA1\u7406\u5E72\u90E8",
      category: "\u5916\u90E8\u6D41\u8F6C\u578B",
      flowType: "\u5408\u540C\u7EBF\u4E0A\u5BA1\u67E5\u6D41\u7A0B",
      platform: "OA",
      amount: "any",
      importance: "\u91CD\u8981\u6D41\u7A0B",
      limitDays: 3
    },
    {
      identity: "\u7BA1\u7406\u5E72\u90E8",
      category: "\u5916\u90E8\u6D41\u8F6C\u578B",
      flowType: "\u5907\u7528\u5546\u3001\u670D\u52A1\u5546\u5F15\u5165",
      platform: "OA",
      amount: "any",
      importance: "\u6B21\u8981\u6D41\u7A0B",
      limitDays: 2
    },
    {
      identity: "\u7BA1\u7406\u5E72\u90E8",
      category: "\u5916\u90E8\u6D41\u8F6C\u578B",
      flowType: "\u793E\u4F1A\u5316\u670D\u52A1\u5546\u9000\u51FA\u6E05\u7B97",
      platform: "OA",
      amount: "any",
      importance: "\u6B21\u8981\u6D41\u7A0B",
      limitDays: 2
    },
    {
      identity: "\u7BA1\u7406\u5E72\u90E8",
      category: "\u5916\u90E8\u6D41\u8F6C\u578B",
      flowType: "\u7528\u6237\u670D\u52A1\u6570\u636E\u7533\u8BF7",
      platform: "OA",
      amount: "any",
      importance: "\u6B21\u8981\u6D41\u7A0B",
      limitDays: 2
    },
    {
      identity: "\u7BA1\u7406\u5E72\u90E8",
      category: "\u5916\u90E8\u6D41\u8F6C\u578B",
      flowType: "\u7528\u6237\u6570\u636E\u8D44\u6E90\uFF08\u8F6F\u6587\u63A8\u9001\u3001\u77ED\u4FE1\u53D1\u9001\u3001\u7535\u8BDD\u5916\u547C\uFF09\u7533\u8BF7",
      platform: "OA",
      amount: "any",
      importance: "\u6B21\u8981\u6D41\u7A0B",
      limitDays: 2
    },
    {
      identity: "\u7BA1\u7406\u5E72\u90E8",
      category: "\u5916\u90E8\u6D41\u8F6C\u578B",
      flowType: "\u670D\u52A1\u5546\u53D8\u66F4",
      platform: "OA",
      amount: "any",
      importance: "\u6B21\u8981\u6D41\u7A0B",
      limitDays: 2
    },
    {
      identity: "\u7BA1\u7406\u5E72\u90E8",
      category: "\u5916\u90E8\u6D41\u8F6C\u578B",
      flowType: "\u4F9B\u5E94\u5546\u9009\u70B9",
      platform: "OA",
      amount: "any",
      importance: "\u91CD\u8981\u6D41\u7A0B",
      limitDays: 3
    },
    {
      identity: "\u7BA1\u7406\u5E72\u90E8",
      category: "\u5E38\u89C4\u6D41\u7A0B",
      flowType: "\u9664\u4E86\u4EE5\u4E0A\u6D41\u7A0B\u90FD\u662F",
      platform: "OA/\u8D39\u63A7",
      amount: "any",
      importance: "\u6B21\u8981\u6D41\u7A0B",
      limitDays: 2
    },
    {
      identity: "\u975E\u7BA1\u7406\u5E72\u90E8",
      category: "\u5185\u90E8\u9A71\u52A8\u578B",
      flowType: "/",
      platform: "OA/\u8D39\u63A7",
      amount: "any",
      importance: "\u5185\u90E8\u8282\u70B9",
      limitDays: 3
    },
    {
      identity: "\u975E\u7BA1\u7406\u5E72\u90E8",
      category: "\u5916\u90E8\u6D41\u8F6C\u578B",
      flowType: "/",
      platform: "OA/\u8D39\u63A7",
      amount: "any",
      importance: "\u5185\u90E8\u8282\u70B9",
      limitDays: 3
    },
    {
      identity: "\u975E\u7BA1\u7406\u5E72\u90E8",
      category: "\u5E38\u89C4\u6D41\u7A0B",
      flowType: "/",
      platform: "OA/\u8D39\u63A7",
      amount: "any",
      importance: "\u5185\u90E8\u8282\u70B9",
      limitDays: 3
    }
  ],
  managers: [
    "\u5B59\u7ACB\u4E1C",
    "\u5468\u6653\u677E",
    "\u5434\u5FD7\u90A6",
    "\u59DC\u8273\u73B2",
    "\u738B\u4F73\u4E3D",
    "\u738B\u96EA\u950B",
    "\u51AF\u4E3D\u56ED",
    "\u51AF\u96EA\u6D0B",
    "\u53F6\u8302\u950B",
    "\u9648\u6668",
    "\u53F8\u5F92\u534E\u4F26"
  ],
  amountThreshold: 1e5,
  riskRatio: 0.8,
  abnormal: {
    avgIncreaseDays: 3,
    minComplianceRate: 0.95
  },
  followUp: {
    internalDays: 3,
    externalDays: 7
  },
  improveRemindDays: 7
};

// ../../../totalclaw-solutions/solutions/workbench-flow-sla/src/main/services/flowSla/store.ts
var DEFAULT_RULES = defaultRules_default;
var MAX_SNAPSHOTS = 80;
function newId(prefix) {
  return `${prefix}_${(0, import_node_crypto.randomUUID)().replace(/-/g, "").slice(0, 12)}`;
}
function emptySession() {
  return { period: null, ingest: null, snapshotId: "", prevSnapshotId: "", cases: [], rootCauses: {}, summary: "", suggestions: [], summaryBy: "", reportFiles: [], sentAt: "", ledgerWritten: false };
}
function normalize(raw) {
  const arr = (v) => Array.isArray(v) ? v : [];
  const obj = (v) => v && typeof v === "object" && !Array.isArray(v) ? v : {};
  const s = raw?.settings || {};
  const dates = (v) => [...new Set(arr(v).map((x) => String(x).trim()).filter((x) => /^\d{4}-\d{2}-\d{2}$/.test(x)))].sort();
  return {
    settings: {
      outputDir: String(s.outputDir || ""),
      weeklyRecipients: String(s.weeklyRecipients || ""),
      monthlyRecipients: String(s.monthlyRecipients || ""),
      holidays: dates(s.holidays),
      extraWorkdays: dates(s.extraWorkdays)
    },
    thresholds: obj(raw?.thresholds),
    aliases: obj(raw?.aliases),
    aliasNames: obj(raw?.aliasNames),
    nodeDecisions: arr(raw?.nodeDecisions),
    session: { ...emptySession(), ...raw?.session || {}, cases: arr(raw?.session?.cases), suggestions: arr(raw?.session?.suggestions), reportFiles: arr(raw?.session?.reportFiles), rootCauses: obj(raw?.session?.rootCauses) },
    snapshots: arr(raw?.snapshots),
    tracking: arr(raw?.tracking).map((t) => ({ ...t, notes: arr(t.notes) })),
    ledger: arr(raw?.ledger).map((l) => ({ ...l, progress: arr(l.progress) })),
    reminders: arr(raw?.reminders)
  };
}
function atomicWrite(file, data) {
  (0, import_node_fs.writeFileSync)(`${file}.tmp`, JSON.stringify(data), "utf-8");
  (0, import_node_fs.renameSync)(`${file}.tmp`, file);
}
function readJson(file) {
  try {
    return (0, import_node_fs.existsSync)(file) ? JSON.parse((0, import_node_fs.readFileSync)(file, "utf-8")) : null;
  } catch {
    return null;
  }
}
var FlowSlaStore = class {
  constructor(dirOf = () => (0, import_accountScope.accountPath)("flow-sla")) {
    this.dirOf = dirOf;
  }
  cache = null;
  dataCache = null;
  rulesCache;
  cacheDir = "";
  root() {
    const d = this.dirOf();
    if (d !== this.cacheDir) {
      this.cache = null;
      this.dataCache = null;
      this.rulesCache = void 0;
      this.cacheDir = d;
    }
    (0, import_node_fs.mkdirSync)(d, { recursive: true });
    return d;
  }
  read() {
    const dir = this.root();
    if (!this.cache) this.cache = normalize(readJson((0, import_node_path2.join)(dir, "state.json")));
    return this.cache;
  }
  update(fn) {
    this.read();
    const out = fn(this.cache);
    this.cache.reminders = this.cache.reminders.slice(0, 200);
    atomicWrite((0, import_node_path2.join)(this.root(), "state.json"), this.cache);
    return out;
  }
  data() {
    const dir = this.root();
    if (!this.dataCache) {
      const raw = readJson((0, import_node_path2.join)(dir, "data.json"));
      this.dataCache = { flows: Array.isArray(raw?.flows) ? raw.flows : [], nodes: Array.isArray(raw?.nodes) ? raw.nodes : [], roster: Array.isArray(raw?.roster) ? raw.roster : [] };
    }
    return this.dataCache;
  }
  setData(data) {
    this.root();
    this.dataCache = data;
    atomicWrite((0, import_node_path2.join)(this.root(), "data.json"), data);
  }
  /** 导入的规则表；没有导入过返回 null */
  customRules() {
    const dir = this.root();
    if (this.rulesCache === void 0) {
      const raw = readJson((0, import_node_path2.join)(dir, "rules.json"));
      this.rulesCache = raw && Array.isArray(raw.e2e) && Array.isArray(raw.cssNodes) && Array.isArray(raw.oaFkNodes) && Array.isArray(raw.personal) && Array.isArray(raw.managers) ? raw : null;
    }
    return this.rulesCache;
  }
  baseRules() {
    return this.customRules() ?? DEFAULT_RULES;
  }
  setCustomRules(rules) {
    const file = (0, import_node_path2.join)(this.root(), "rules.json");
    this.rulesCache = rules;
    if (rules) atomicWrite(file, rules);
    else if ((0, import_node_fs.existsSync)(file)) (0, import_node_fs.unlinkSync)(file);
  }
  snapDir() {
    const d = (0, import_node_path2.join)(this.root(), "snapshots");
    (0, import_node_fs.mkdirSync)(d, { recursive: true });
    return d;
  }
  saveSnapshot(meta, data) {
    atomicWrite((0, import_node_path2.join)(this.snapDir(), `${meta.id}.json`), data);
    this.update((s) => {
      s.snapshots = [meta, ...s.snapshots.filter((x) => x.id !== meta.id)].sort((a, b) => b.periodEnd - a.periodEnd || b.savedAt.localeCompare(a.savedAt));
      for (const old of s.snapshots.slice(MAX_SNAPSHOTS)) this.dropSnapshotFile(old.id);
      s.snapshots = s.snapshots.slice(0, MAX_SNAPSHOTS);
    });
  }
  snapshotData(id) {
    if (!/^[\w-]+$/.test(id)) return null;
    const raw = readJson((0, import_node_path2.join)(this.snapDir(), `${id}.json`));
    return raw && Array.isArray(raw.flows) && Array.isArray(raw.nodes) && raw.options && raw.rules ? { roster: [], aliases: {}, ...raw } : null;
  }
  removeSnapshot(id) {
    this.update((s) => {
      s.snapshots = s.snapshots.filter((x) => x.id !== id);
    });
    this.dropSnapshotFile(id);
  }
  dropSnapshotFile(id) {
    try {
      if (/^[\w-]+$/.test(id)) (0, import_node_fs.unlinkSync)((0, import_node_path2.join)(this.snapDir(), `${id}.json`));
    } catch {
    }
  }
  snapshotFiles() {
    try {
      return (0, import_node_fs.readdirSync)(this.snapDir()).filter((f) => f.endsWith(".json"));
    } catch {
      return [];
    }
  }
};

// ../../../totalclaw-solutions/solutions/workbench-flow-sla/src/main/services/flowSla/rulesImport.ts
var import_node_path3 = require("node:path");
var import_i18n2 = require("npm:@totalclaw/i18n");
var import_spreadsheetRead2 = require("host:apps/desktop-shell/src/main/services/spreadsheetRead.ts");
var str = (v) => v == null ? "" : String(v).trim();
var flat = (v) => str(v).replace(/\s+/g, "");
function days(v) {
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  const m = /^(\d+(?:\.\d+)?)(天|个?工作日|日)?$/.exec(flat(v));
  return m ? Number(m[1]) : null;
}
function locate(rows, must) {
  for (let r = 0; r < Math.min(rows.length, 15); r += 1) {
    const cells = (rows[r] || []).map(flat);
    if (must.every((re) => cells.some((c) => re.test(c)))) {
      return { rows, header: r, col: (re) => cells.findIndex((c) => re.test(c)) };
    }
  }
  return null;
}
function parseRulesWorkbook(path, base) {
  const wb = (0, import_spreadsheetRead2.openSpreadsheetFile)(path, { cellDates: false });
  const names = wb.SheetNames || [];
  const warnings = [];
  const sheet = (re, label) => {
    const name = names.find((n) => re.test(n.replace(/\s+/g, "")));
    if (!name) throw new Error((0, import_i18n2.t)("\u5DE5\u4F5C\u7C3F\u91CC\u6CA1\u6709\u627E\u5230\u300C{p0}\u300D\u8FD9\u5F20\u8868\uFF0C\u8BF7\u786E\u8BA4\u5BFC\u5165\u7684\u662F\u300A\u65F6\u6548\u770B\u677F\u6307\u6807\u300B", { p0: label }));
    return (0, import_spreadsheetRead2.readWorksheetData)(wb.Sheets[name], { raw: true, defval: null }).rows;
  };
  const need = (loc, label) => {
    if (!loc) throw new Error((0, import_i18n2.t)("\u300C{p0}\u300D\u8868\u91CC\u6CA1\u6709\u627E\u5230\u8868\u5934\u884C\uFF0C\u5217\u540D\u53EF\u80FD\u6539\u8FC7", { p0: label }));
    return loc;
  };
  const e2eLabel = (0, import_i18n2.t)("\u7AEF\u5230\u7AEF\u7528\u65F6");
  const e2eLoc = need(locate(sheet(/端到端/, e2eLabel), [/^大类$/, /流程细类/, /时效要求/]), e2eLabel);
  const [cCat, cType, cSys, cLimit] = [e2eLoc.col(/^大类$/), e2eLoc.col(/流程细类/), e2eLoc.col(/系统/), e2eLoc.col(/时效要求/)];
  const e2e = [];
  for (const row of e2eLoc.rows.slice(e2eLoc.header + 1)) {
    const category = str(row[cCat]);
    const flowType = str(row[cType]);
    if (!category || !flowType) continue;
    const sysRaw = str(row[cSys]);
    const system = /^css$/i.test(sysRaw) ? "CSS" : sysRaw;
    const limitText = str(row[cLimit]);
    const rule = { category, flowType, system, limitDays: days(row[cLimit]) };
    if (rule.limitDays === null && limitText && limitText !== "/") {
      const variants = limitText.split(/[\n；;]+/).map((line) => /^(\D+?)(\d+(?:\.\d+)?)天/.exec(line.trim())).filter(Boolean).map((m) => ({ keyword: m[1].trim(), limitDays: Number(m[2]) }));
      if (variants.length) rule.variants = variants;
      else warnings.push((0, import_i18n2.t)("\u7AEF\u5230\u7AEF\u7528\u65F6\u300C{p0}\u300D\u7684\u65F6\u6548\u8981\u6C42\u300C{p1}\u300D\u8BFB\u4E0D\u6210\u5929\u6570\uFF0C\u6309\u6CA1\u6709\u65F6\u6548\u8981\u6C42\u5904\u7406", { p0: flowType, p1: limitText }));
    }
    if (/除了以上/.test(flowType)) rule.fallback = true;
    e2e.push(rule);
  }
  const cssLabel = (0, import_i18n2.t)("CSS\u5404\u8282\u70B9\u65F6\u6548\u8981\u6C42");
  const cssLoc = need(locate(sheet(/css.*节点/i, cssLabel), [/^事务类型$/, /^审批节点名$/]), cssLabel);
  const k0 = cssLoc.col(/^事务类型$/);
  const [kFee, kNode, kAttr, kLimit] = [cssLoc.col(/^费用类型$/), cssLoc.col(/^审批节点名$/), cssLoc.col(/是否计入/), cssLoc.col(/单节点要求/)];
  const cssNodes = [];
  for (const row of cssLoc.rows.slice(cssLoc.header + 1)) {
    const flowType = str(row[k0]);
    const node = flat(row[kNode]);
    if (!flowType || !node) continue;
    const limitText = str(row[kLimit]);
    const limit = days(row[kLimit]);
    cssNodes.push({
      flowType,
      feeType: kFee >= 0 ? str(row[kFee]) : "",
      node,
      internal: /内部/.test(str(row[kAttr])),
      limitWorkdays: limit,
      note: limit === null && limitText && limitText !== "/" ? limitText.split(/\n+/).map((x) => x.trim()).filter(Boolean).join((0, import_i18n2.t)("\uFF1B")) : ""
    });
  }
  const nodeLabel = (0, import_i18n2.t)("oa\u3001\u8D39\u63A7\u8282\u70B9\u5185\u5916\u90E8");
  const nodeLoc = need(locate(sheet(/节点内外部/, nodeLabel), [/^流程名/, /环节名称/, /节点属性/]), nodeLabel);
  const [nFlow, nNode, nAttr] = [nodeLoc.col(/^流程名/), nodeLoc.col(/环节名称/), nodeLoc.col(/节点属性/)];
  const oaFkNodes = [];
  let badAttr = 0;
  for (const row of nodeLoc.rows.slice(nodeLoc.header + 1)) {
    const flow = str(row[nFlow]);
    const node = str(row[nNode]);
    const attr = str(row[nAttr]);
    if (!flow || !node) continue;
    if (!/内部|外部/.test(attr)) badAttr += 1;
    oaFkNodes.push([flow, node, /内部/.test(attr)]);
  }
  if (badAttr) warnings.push((0, import_i18n2.t)("\u8282\u70B9\u5185\u5916\u90E8\u8868\u6709 {p0} \u884C\u7684\u8282\u70B9\u5C5E\u6027\u65E2\u4E0D\u662F\u5185\u90E8\u4E5F\u4E0D\u662F\u5916\u90E8\uFF0C\u6309\u5916\u90E8\u5904\u7406", { p0: badAttr }));
  const perLabel = (0, import_i18n2.t)("oa\u8D39\u63A7\u4E2A\u4EBA\u8282\u70B9\u65F6\u6548\u8981\u6C42");
  const perLoc = need(locate(sheet(/个人节点/, perLabel), [/审核人身份/, /流程细类/, /时效要求/]), perLabel);
  const [pId, pCat, pType, pPlat, pAmt, pImp, pLimit] = [perLoc.col(/审核人身份/), perLoc.col(/^大类$/), perLoc.col(/流程细类/), perLoc.col(/平台/), perLoc.col(/金额/), perLoc.col(/重要性/), perLoc.col(/时效要求/)];
  const personal = [];
  for (const row of perLoc.rows.slice(perLoc.header + 1)) {
    const identity = str(row[pId]);
    const category = str(row[pCat]);
    if (!identity || !category) continue;
    const amt = flat(row[pAmt]);
    personal.push({
      identity,
      category,
      flowType: str(row[pType]),
      platform: str(row[pPlat]),
      amount: /以内|以下/.test(amt) ? "le10w" : /以上/.test(amt) ? "gt10w" : "any",
      importance: str(row[pImp]),
      limitDays: days(row[pLimit])
    });
  }
  const mgrLabel = (0, import_i18n2.t)("\u5BA1\u6838\u4EBA\u8EAB\u4EFD");
  const mgrLoc = need(locate(sheet(/审核人身份/, mgrLabel), [/^姓名$/, /^身份$/]), mgrLabel);
  const [mName, mId] = [mgrLoc.col(/^姓名$/), mgrLoc.col(/^身份$/)];
  const managers = [];
  for (const row of mgrLoc.rows.slice(mgrLoc.header + 1)) {
    const name = str(row[mName]);
    const id = flat(row[mId]);
    if (name && /管理干部/.test(id) && !/非管理/.test(id) && !managers.includes(name)) managers.push(name);
  }
  if (!e2e.length) throw new Error((0, import_i18n2.t)("\u300C{p0}\u300D\u8868\u91CC\u6CA1\u6709\u8BFB\u5230\u4EFB\u4F55\u89C4\u5219", { p0: e2eLabel }));
  if (!personal.length) throw new Error((0, import_i18n2.t)("\u300C{p0}\u300D\u8868\u91CC\u6CA1\u6709\u8BFB\u5230\u4EFB\u4F55\u89C4\u5219", { p0: perLabel }));
  if (!e2e.some((r) => r.fallback)) warnings.push((0, import_i18n2.t)("\u7AEF\u5230\u7AEF\u7528\u65F6\u8868\u91CC\u6CA1\u6709\u300C\u9664\u4E86\u4EE5\u4E0A\u6D41\u7A0B\u300D\u8FD9\u4E00\u884C\uFF0C\u5BF9\u4E0D\u4E0A\u7684 OA / \u8D39\u63A7\u6D41\u7A0B\u4F1A\u5F52\u5230\u300C\u5E38\u89C4\u6D41\u7A0B\u300D"));
  return {
    rules: {
      version: (0, import_node_path3.basename)(path, (0, import_node_path3.extname)(path)),
      e2e,
      cssNodes,
      oaFkNodes,
      personal,
      managers,
      amountThreshold: base.amountThreshold,
      riskRatio: base.riskRatio,
      abnormal: { ...base.abnormal },
      followUp: { ...base.followUp },
      improveRemindDays: base.improveRemindDays
    },
    warnings
  };
}

// ../../../totalclaw-solutions/solutions/workbench-flow-sla/src/main/services/flowSla/demoData.ts
var import_node_fs2 = require("node:fs");
var import_node_path4 = require("node:path");
var import_ipc_contracts = require("npm:@totalclaw/ipc-contracts");
var import_excel2 = require("host:apps/desktop-shell/src/main/services/serviceSettlement/excel.ts");
var D = columnKeywords_default.demo;
var HOUR = 36e5;
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
var pad2 = (n) => String(n).padStart(2, "0");
var minute = (t) => Math.round(t / 6e4) * 6e4;
var fmtDash = (t) => {
  const d = new Date(t);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())} ${pad2(d.getHours())}:${pad2(d.getMinutes())}:00`;
};
var fmtSlash = (t) => {
  const d = new Date(t);
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${pad2(d.getMinutes())}`;
};
function buildDemo(rules, now) {
  const rand = rng(20261013);
  const pick = (list) => list[Math.floor(rand() * list.length)];
  const between = (a, b) => a + rand() * (b - a);
  const depts = D.depts;
  const staff = D.staff.map((name, i) => ({ name, dept: depts[i % depts.length], manager: false }));
  const managers = D.managers.map((name, i) => ({ name, dept: depts[i % depts.length], manager: true }));
  const people = [...managers, ...staff];
  const outsider = { name: D.outsider, dept: "", manager: false };
  let seq = 0;
  const number = (prefix) => {
    seq += 1;
    return `${prefix}${new Date(now).getFullYear()}${String(1e5 + seq).slice(1)}`;
  };
  const walk = (start, steps) => {
    const nodes = [];
    let t = start;
    for (const s of steps) {
      const begin = minute(t);
      if (begin >= now) return { nodes, end: null };
      const finish = minute(begin + s.hours * HOUR);
      if (finish >= now) {
        nodes.push({ node: s.node, handler: s.handler.name, start: begin, end: null });
        return { nodes, end: null };
      }
      nodes.push({ node: s.node, handler: s.handler.name, start: begin, end: finish });
      t = finish + between(0, 3) * HOUR;
    }
    return { nodes, end: nodes.length ? nodes[nodes.length - 1].end : null };
  };
  const reviewer = () => {
    const r = rand();
    if (r < 0.04) return outsider;
    return r < 0.42 ? pick(managers) : pick(staff);
  };
  const hours = (internal, slowChance) => {
    if (!internal) return between(0.2, 30);
    const r = rand();
    if (r < slowChance) return between(80, 260);
    return r < 0.55 ? between(0.5, 20) : between(20, 60);
  };
  const oaNodesOf = (name) => {
    const rows = rules.oaFkNodes.filter((r) => r[0] === name).map((r) => [r[1], r[2]]);
    return [...rows.filter((r) => !r[1]).slice(0, 1), ...rows.filter((r) => r[1])].slice(0, 6);
  };
  const withNodes = (names) => names.filter((n) => oaNodesOf(n).some((r) => r[1]));
  const e2eNames = (system) => rules.e2e.filter((r) => !r.fallback && r.system.toUpperCase() === system.toUpperCase()).map((r) => r.flowType);
  const makeOaLike = (prefix, name, opts) => {
    const initiator = pick(staff);
    const start = minute(now - opts.startDaysAgo * DAY + between(1, 9) * HOUR);
    const defs = oaNodesOf(name);
    const steps = defs.map(([node, internal], i) => ({
      node,
      handler: internal ? reviewer() : initiator,
      hours: opts.stuckAt === i ? 24 * 400 : hours(internal, opts.slow ?? 0.1)
    }));
    if (opts.extraNode) steps.splice(Math.min(2, steps.length), 0, { node: D.newNode, handler: pick(staff), hours: between(2, 30) });
    const w = walk(start, steps);
    return { no: number(prefix), name, feeType: "", title: opts.title ?? `${name}-${initiator.name}`, initiator, amount: opts.amount ?? 0, start, end: opts.terminated ? null : w.end, terminated: !!opts.terminated, nodes: w.nodes };
  };
  const oaRule = withNodes(e2eNames("OA"));
  const oaRegular = withNodes(D.regularOa);
  const variantRule = rules.e2e.find((r) => r.variants?.length && r.system.toUpperCase() === "OA");
  const oa = [];
  for (let i = 0; i < 96; i += 1) {
    const regular = oaRegular.length > 0 && rand() < 0.22;
    const name = regular ? pick(oaRegular) : pick(oaRule);
    const title = variantRule && name === variantRule.flowType ? `${pick(D.variantTitles)}-${pick(staff).name}` : void 0;
    oa.push(makeOaLike("OA", name, { startDaysAgo: between(2, 68), slow: 0.12, title, extraNode: rand() < 0.08, terminated: rand() < 0.02 }));
  }
  if (oaRule.length) {
    const shortest = [...oaRule].sort((a, b) => (rules.e2e.find((r) => r.flowType === a)?.limitDays ?? 999) - (rules.e2e.find((r) => r.flowType === b)?.limitDays ?? 999))[0];
    const limit = rules.e2e.find((r) => r.flowType === shortest)?.limitDays ?? 7;
    oa.push(makeOaLike("OA", shortest, { startDaysAgo: limit * 3, stuckAt: 2 }));
    oa.push(makeOaLike("OA", shortest, { startDaysAgo: limit * 2, stuckAt: 1 }));
    oa.push(makeOaLike("OA", shortest, { startDaysAgo: limit * 0.9, stuckAt: 1 }));
  }
  if (variantRule) {
    const titles = D.variantTitles;
    oa.push(makeOaLike("OA", variantRule.flowType, { startDaysAgo: 20, stuckAt: 2, title: `${titles[0]}-${pick(staff).name}` }));
    oa.push(makeOaLike("OA", variantRule.flowType, { startDaysAgo: 20, stuckAt: 2, title: `${titles[1]}-${pick(staff).name}` }));
  }
  const fkRule = withNodes(e2eNames(import_ipc_contracts.FS_SYSTEMS[1]));
  const fk = [];
  for (let i = 0; i < 104; i += 1) {
    const amount = rand() < 0.3 ? Math.round(between(1e5, 48e4)) : Math.round(between(300, 99e3));
    fk.push(makeOaLike("FK", pick(fkRule), { startDaysAgo: between(2, 68), slow: 0.1, amount, extraNode: rand() < 0.05, terminated: rand() < 0.03 }));
  }
  if (fkRule.length) {
    const byLimit = [...fkRule].sort((a, b) => (rules.e2e.find((r) => r.flowType === a)?.limitDays ?? 999) - (rules.e2e.find((r) => r.flowType === b)?.limitDays ?? 999));
    const limit = rules.e2e.find((r) => r.flowType === byLimit[0])?.limitDays ?? 7;
    fk.push(makeOaLike("FK", byLimit[0], { startDaysAgo: limit * 2.5, stuckAt: 1, amount: 188e3 }));
    fk.push(makeOaLike("FK", byLimit[0], { startDaysAgo: limit * 0.88, stuckAt: 1, amount: 5200 }));
    fk.push(makeOaLike("FK", byLimit[1] ?? byLimit[0], { startDaysAgo: 45, stuckAt: 2, amount: 26e4 }));
  }
  const cssTypes = /* @__PURE__ */ new Map();
  for (const r of rules.cssNodes) {
    const k = `${r.flowType}|${r.feeType}`;
    const cur = cssTypes.get(k) ?? { flowType: r.flowType, feeType: r.feeType, nodes: [] };
    cur.nodes.push({ node: r.node, internal: r.internal });
    cssTypes.set(k, cur);
  }
  const cssList = [...cssTypes.values()];
  const makeCss = (type, opts) => {
    const initiator = pick(staff);
    const start = minute(now - opts.startDaysAgo * DAY + between(1, 9) * HOUR);
    const steps = type.nodes.slice(0, 9).map((n, i) => ({
      node: n.node,
      handler: n.internal ? reviewer() : initiator,
      hours: opts.stuckAt === i ? 24 * 400 : n.internal ? between(0.5, rand() < (opts.slow ?? 0.12) ? 110 : 30) : between(0.1, i === 0 ? 1 : 150)
    }));
    const w = walk(start, steps);
    return { no: number("CSS"), name: type.flowType, feeType: type.feeType, title: `${type.flowType}-${initiator.name}`, initiator, amount: 0, start, end: w.end, terminated: false, nodes: w.nodes };
  };
  const css = [];
  for (let i = 0; i < 84; i += 1) css.push(makeCss(pick(cssList), { startDaysAgo: between(2, 66) }));
  const firstInternal = (t) => Math.max(0, t.nodes.findIndex((n) => n.internal));
  for (const t of cssList.slice(0, 3)) css.push(makeCss(t, { startDaysAgo: 30, stuckAt: firstInternal(t) }));
  for (let i = 0; i < 4; i += 1) {
    const initiator = pick(staff);
    const start = minute(now - between(4, 40) * DAY);
    const w = walk(start, [{ node: cssList[0]?.nodes[0]?.node ?? D.newNode, handler: initiator, hours: 0.5 }, { node: D.newNode, handler: pick(staff), hours: between(4, 60) }]);
    css.push({ no: number("CSS"), name: D.unmatchedCss, feeType: "", title: `${D.unmatchedCss}-${initiator.name}`, initiator, amount: 0, start, end: w.end, terminated: false, nodes: w.nodes });
  }
  return { flows: { oa, fk, css }, people };
}
function writeDemo(root, rules, now) {
  const dir = (0, import_node_path4.join)(root, D.files.dir);
  (0, import_node_fs2.mkdirSync)(dir, { recursive: true });
  const { flows, people } = buildDemo(rules, now);
  const H = D.headers;
  const st = D.status;
  const current = (f) => [...f.nodes].reverse().find((n) => n.end === null);
  const file = (name) => (0, import_node_path4.join)(dir, `${name}.xlsx`);
  const mgrLabel = columnKeywords_default.managerIdentity[0];
  const staffLabel = columnKeywords_default.nonManagerIdentity[0];
  const oaFlow = file(D.files.oaFlow);
  (0, import_excel2.writeWorkbook)(oaFlow, [{
    name: "Sheet1",
    headers: [H.titleRow],
    colWidths: [18, 26, 30, 10, 14, 10, 20, 20, 18, 12],
    rows: [H.oaFlow, ...flows.oa.map((f) => [f.no, f.name, f.title, f.initiator.name, f.initiator.dept, f.terminated ? st.OA[2] : f.end ? st.OA[0] : st.OA[1], fmtDash(f.start), f.end ? fmtDash(f.end) : "", current(f)?.node ?? "", current(f)?.handler ?? ""])]
  }]);
  const oaNode = file(D.files.oaNode);
  (0, import_excel2.writeWorkbook)(oaNode, [{ name: "Sheet1", headers: H.oaNode, rows: flows.oa.flatMap((f) => f.nodes.map((n) => [f.no, f.name, n.node, n.handler, fmtDash(n.start), n.end ? fmtDash(n.end) : ""])) }]);
  const fkFlow = file(D.files.fkFlow);
  (0, import_excel2.writeWorkbook)(fkFlow, [{
    name: "Sheet1",
    headers: H.fkFlow,
    rows: flows.fk.map((f) => [f.no, f.name, f.title, f.initiator.name, f.initiator.dept, f.amount, fmtSlash(f.start), f.end ? fmtSlash(f.end) : "", current(f)?.node ?? "", f.terminated ? st.FK[1] : f.end ? st.FK[0] : current(f)?.handler ?? f.initiator.name])
  }]);
  const fkNode = file(D.files.fkNode);
  (0, import_excel2.writeWorkbook)(fkNode, [{ name: "Sheet1", headers: H.fkNode, rows: flows.fk.flatMap((f) => f.nodes.map((n) => [f.no, f.name, n.node, n.handler, fmtSlash(n.start), n.end ? fmtSlash(n.end) : ""])) }]);
  const css = file(D.files.css);
  (0, import_excel2.writeWorkbook)(css, [{
    name: "Sheet1",
    headers: H.css,
    colWidths: [16, 30, 16, 30, 10, 10, 24, 12, 20, 20],
    rows: flows.css.flatMap((f) => f.nodes.map((n) => [f.no, f.name, f.feeType, f.title, f.initiator.name, f.end ? st.CSS[0] : st.CSS[1], n.node, n.handler, new Date(n.start), n.end ? new Date(n.end) : null]))
  }]);
  const roster = file(D.files.roster);
  (0, import_excel2.writeWorkbook)(roster, [{ name: "Sheet1", headers: H.roster, rows: people.map((p, i) => [p.name, p.dept, `user${pad2(i + 1)}@example.com`, p.manager ? mgrLabel : staffLabel]) }]);
  const all = [...flows.oa, ...flows.fk, ...flows.css];
  return { dir, oaFlow, oaNode, fkFlow, fkNode, css, roster, flows: all.length, nodes: all.reduce((n, f) => n + f.nodes.length, 0) };
}

// ../../../totalclaw-solutions/solutions/workbench-flow-sla/src/main/services/flowSla/reasons.ts
var import_i18n3 = require("npm:@totalclaw/i18n");
var import_ipc_contracts2 = require("npm:@totalclaw/ipc-contracts");
var REASON_KW = columnKeywords_default.reasonKeywords;
function categoryLabel(id) {
  switch (id) {
    case "materials":
      return (0, import_i18n3.t)("\u8D44\u6599\u4E0D\u5168\u9000\u56DE");
    case "absence":
      return (0, import_i18n3.t)("\u5BA1\u6279\u4EBA\u51FA\u5DEE/\u4F11\u5047");
    case "cross_dept":
      return (0, import_i18n3.t)("\u8DE8\u90E8\u95E8\u6C9F\u901A\u7B49\u5F85");
    case "external":
      return (0, import_i18n3.t)("\u5916\u90E8\u5355\u4F4D\u672A\u53CD\u9988");
    case "system":
      return (0, import_i18n3.t)("\u7CFB\u7EDF/\u64CD\u4F5C\u95EE\u9898");
    case "design":
      return (0, import_i18n3.t)("\u6D41\u7A0B\u8BBE\u8BA1\u73AF\u8282\u8FC7\u591A");
    case "other":
      return (0, import_i18n3.t)("\u5176\u4ED6");
    default:
      return (0, import_i18n3.t)("\u672A\u5F52\u7C7B");
  }
}
function defaultRootCause(id) {
  switch (id) {
    case "materials":
      return (0, import_i18n3.t)("\u53D1\u8D77\u65F6\u8D44\u6599\u4E0D\u5B8C\u6574\u6216\u586B\u5199\u6709\u8BEF\uFF0C\u88AB\u9000\u56DE\u8865\u5145\u540E\u91CD\u65B0\u6D41\u8F6C\uFF0C\u540C\u4E00\u8282\u70B9\u91CD\u590D\u5360\u7528\u65F6\u95F4\u3002\u6839\u56E0\u5728\u53D1\u8D77\u73AF\u8282\u7F3A\u5C11\u63D0\u4EA4\u524D\u7684\u8D44\u6599\u6E05\u5355\u548C\u81EA\u67E5\u3002");
    case "absence":
      return (0, import_i18n3.t)("\u5BA1\u6279\u4EBA\u51FA\u5DEE\u3001\u4F11\u5047\u6216\u5F00\u4F1A\u671F\u95F4\u6CA1\u6709\u6307\u5B9A\u4EE3\u7406\u4EBA\uFF0C\u5F85\u529E\u4E00\u76F4\u505C\u5728\u672C\u4EBA\u540D\u4E0B\u3002\u6839\u56E0\u5728\u5BA1\u6279\u6388\u6743\u548C\u4EE3\u7406\u673A\u5236\u6CA1\u6709\u843D\u5B9E\u3002");
    case "cross_dept":
      return (0, import_i18n3.t)("\u9700\u8981\u5176\u4ED6\u90E8\u95E8\u786E\u8BA4\u6216\u4F1A\u7B7E\uFF0C\u6765\u56DE\u6C9F\u901A\u7B49\u5F85\u65F6\u95F4\u957F\u3002\u6839\u56E0\u5728\u8DE8\u90E8\u95E8\u8282\u70B9\u6CA1\u6709\u7EA6\u5B9A\u7B54\u590D\u65F6\u9650\u548C\u5BF9\u63A5\u4EBA\u3002");
    case "external":
      return (0, import_i18n3.t)("\u7B49\u5F85\u670D\u52A1\u5546\u3001\u4F9B\u5E94\u5546\u6216\u5BA2\u6237\u53CD\u9988\u3001\u76D6\u7AE0\u3001\u5BC4\u56DE\u8D44\u6599\uFF0C\u65F6\u95F4\u4E0D\u53D7\u5185\u90E8\u63A7\u5236\u3002\u6839\u56E0\u5728\u5916\u90E8\u8282\u70B9\u7F3A\u5C11\u50AC\u529E\u8282\u594F\u548C\u8D85\u671F\u5347\u7EA7\u529E\u6CD5\u3002");
    case "system":
      return (0, import_i18n3.t)("\u7CFB\u7EDF\u6545\u969C\u3001\u5F85\u529E\u63D0\u9192\u6CA1\u6536\u5230\u6216\u64CD\u4F5C\u4E0D\u719F\u7EC3\u5BFC\u81F4\u505C\u7559\u3002\u6839\u56E0\u5728\u5F85\u529E\u63D0\u9192\u548C\u64CD\u4F5C\u6307\u5F15\u4E0D\u5230\u4F4D\u3002");
    case "design":
      return (0, import_i18n3.t)("\u5BA1\u6279\u5C42\u7EA7\u6216\u8282\u70B9\u504F\u591A\uFF0C\u5B58\u5728\u91CD\u590D\u5BA1\u6279\u3002\u6839\u56E0\u5728\u6D41\u7A0B\u672C\u8EAB\uFF0C\u9700\u8981\u8BC4\u4F30\u80FD\u5426\u5408\u5E76\u6216\u51CF\u5C11\u8282\u70B9\u3002");
    default:
      return (0, import_i18n3.t)("\u539F\u56E0\u6BD4\u8F83\u5206\u6563\uFF0C\u6CA1\u6709\u5F62\u6210\u96C6\u4E2D\u7684\u95EE\u9898\uFF0C\u9700\u8981\u9010\u5355\u8DDF\u8FDB\u3002");
  }
}
function classifyByRule(reason) {
  const s = String(reason || "").replace(/\s+/g, "");
  let best = "other";
  let score = 0;
  for (const id of import_ipc_contracts2.FS_REASON_CATEGORIES) {
    const hits = (REASON_KW[id] || []).filter((w) => s.includes(w)).length;
    if (hits > score) {
      score = hits;
      best = id;
    }
  }
  return best;
}
var caseKey = (system, flowNo) => `${system}|${flowNo}`;
function buildCases(res, roster, previous = []) {
  const emailOf = new Map(roster.map((r) => [r.name, r.email]));
  const prev = new Map(previous.map((c) => [c.key, c]));
  const worstReview = /* @__PURE__ */ new Map();
  for (const r of res.reviews) {
    if (r.compliant) continue;
    const k = caseKey(r.system, r.flowNo);
    const over = r.days - r.limit;
    const cur = worstReview.get(k);
    if (!cur || over > cur.over) worstReview.set(k, { handler: r.handler, over });
  }
  const make = (f, kind) => {
    const key = caseKey(f.system, f.flowNo);
    let owner = "";
    let ownerRole = "initiator";
    if (kind === "running" && f.currentHandler) {
      owner = f.currentHandler;
      ownerRole = "handler";
    } else if (kind === "overtime" && worstReview.get(key)) {
      owner = worstReview.get(key).handler;
      ownerRole = "reviewer";
    } else {
      owner = f.initiator;
      ownerRole = "initiator";
    }
    const old = prev.get(key);
    return {
      key,
      system: f.system,
      flowNo: f.flowNo,
      flowName: f.flowName,
      title: f.title,
      flowType: f.flowType,
      category: f.category,
      kind,
      days: f.days,
      limitDays: f.limitDays,
      overdueDays: f.overdueDays,
      currentNode: f.currentNode,
      initiator: f.initiator,
      owner,
      ownerEmail: emailOf.get(owner) || "",
      ownerRole,
      reason: old?.reason || "",
      categoryId: old?.categoryId || "",
      classifiedBy: old?.classifiedBy || "",
      mailedAt: old?.mailedAt || ""
    };
  };
  const overtime = res.flows.filter((f) => f.status === "done" && f.inPeriod && f.overtime === true).map((f) => make(f, "overtime"));
  const running = res.flows.filter((f) => f.status === "running" && f.runningLabel === "overdue").map((f) => make(f, "running"));
  return [...running, ...overtime].sort((a, b) => a.owner.localeCompare(b.owner, "zh") || b.overdueDays - a.overdueDays);
}
var kindLabel = (k) => k === "running" ? (0, import_i18n3.t)("\u5728\u9014\u5DF2\u903E\u671F") : (0, import_i18n3.t)("\u5DF2\u529E\u7ED3\u8D85\u65F6");
function ownerMails(cases, period, sender) {
  const groups = /* @__PURE__ */ new Map();
  for (const c of cases) groups.set(c.owner, [...groups.get(c.owner) ?? [], c]);
  return [...groups.entries()].map(([owner, list]) => {
    const lines = list.map((c, i) => (0, import_i18n3.t)("{n}. [{sys}] {no} {name}{title}\uFF1A{kind}\uFF0C\u5DF2\u7528 {days} \u5929\uFF0C\u65F6\u6548\u8981\u6C42 {limit} \u5929\uFF0C\u8D85\u51FA {over} \u5929{node}", {
      n: i + 1,
      sys: c.system,
      no: c.flowNo,
      name: c.flowName,
      title: c.title ? `\uFF08${c.title}\uFF09` : "",
      kind: kindLabel(c.kind),
      days: c.days,
      limit: c.limitDays ?? "-",
      over: c.overdueDays,
      node: c.currentNode ? (0, import_i18n3.t)("\uFF0C\u5F53\u524D\u505C\u5728\u300C{p0}\u300D", { p0: c.currentNode }) : ""
    }));
    const body = [
      (0, import_i18n3.t)("{p0}\uFF0C\u4F60\u597D\uFF1A", { p0: owner || (0, import_i18n3.t)("\u540C\u4E8B") }),
      "",
      (0, import_i18n3.t)("\u6D41\u7A0B\u65F6\u6548\u901A\u62A5\uFF08{p0}\uFF09\u91CC\uFF0C\u4E0B\u9762 {p1} \u4E2A\u6D41\u7A0B\u8D85\u51FA\u4E86\u65F6\u6548\u8981\u6C42\uFF0C\u8BF7\u9010\u6761\u56DE\u590D\u8D85\u65F6\u539F\u56E0\u548C\u9884\u8BA1\u529E\u7ED3\u65F6\u95F4\uFF1A", { p0: period.label, p1: list.length }),
      "",
      ...lines,
      "",
      (0, import_i18n3.t)("\u53EF\u4EE5\u76F4\u63A5\u56DE\u590D\u8FD9\u5C01\u90AE\u4EF6\uFF0C\u6216\u5728\u9644\u4EF6\u8868\u683C\u7684\u300C\u8D85\u65F6\u539F\u56E0\u300D\u4E00\u5217\u586B\u597D\u540E\u53D1\u56DE\u3002"),
      ...sender ? ["", sender] : []
    ].join("\n");
    return { owner, email: list[0].ownerEmail, count: list.length, subject: (0, import_i18n3.t)("\u3010\u6D41\u7A0B\u65F6\u6548\u3011\u8BF7\u53CD\u9988 {p0} \u4E2A\u8D85\u65F6\u6D41\u7A0B\u7684\u539F\u56E0\uFF08{p1}\uFF09", { p0: list.length, p1: period.label }), body, mailedAt: list.every((c) => c.mailedAt) ? list[0].mailedAt : "" };
  }).sort((a, b) => b.count - a.count || a.owner.localeCompare(b.owner, "zh"));
}
function reasonSheetHeaders() {
  return [(0, import_i18n3.t)("\u7CFB\u7EDF"), (0, import_i18n3.t)("\u5355\u53F7"), (0, import_i18n3.t)("\u6D41\u7A0B\u540D\u79F0"), (0, import_i18n3.t)("\u6807\u9898"), (0, import_i18n3.t)("\u7C7B\u578B"), (0, import_i18n3.t)("\u5DF2\u7528\u65F6\uFF08\u5929\uFF09"), (0, import_i18n3.t)("\u65F6\u6548\u8981\u6C42\uFF08\u5929\uFF09"), (0, import_i18n3.t)("\u8D85\u51FA\uFF08\u5929\uFF09"), (0, import_i18n3.t)("\u5F53\u524D\u8282\u70B9"), (0, import_i18n3.t)("\u8D23\u4EFB\u4EBA"), (0, import_i18n3.t)("\u8D85\u65F6\u539F\u56E0")];
}
function reasonSheet(cases) {
  return {
    name: (0, import_i18n3.t)("\u8D85\u65F6\u539F\u56E0\u6536\u96C6"),
    headers: reasonSheetHeaders(),
    rows: cases.map((c) => [c.system, c.flowNo, c.flowName, c.title, kindLabel(c.kind), c.days, c.limitDays ?? "", c.overdueDays, c.currentNode, c.owner, c.reason])
  };
}
function readReasonRows(headers, rows, cases) {
  const std = reasonSheetHeaders();
  const pick = (label, kws) => headers.find((h) => h.trim() === label) || headers.find((h) => kws.some((w) => h.replace(/\s+/g, "").includes(w))) || "";
  const noCol = pick(std[1], columnKeywords_default.flow.flowNo);
  const reasonCol = pick(std[10], columnKeywords_default.reasonColumn);
  const sysCol = pick(std[0], columnKeywords_default.systemColumn);
  if (!noCol || !reasonCol) return { filled: [], unmatched: 0, noColumn: true };
  const byNo = /* @__PURE__ */ new Map();
  for (const c of cases) byNo.set(c.flowNo, [...byNo.get(c.flowNo) ?? [], c]);
  const filled = [];
  let unmatched = 0;
  for (const r of rows) {
    const reason = String(r[reasonCol] || "").trim();
    const no = String(r[noCol] || "").trim();
    if (!reason || !no) continue;
    const cands = byNo.get(no) ?? [];
    const sys = sysCol ? String(r[sysCol] || "").trim() : "";
    const hit = cands.find((c) => c.system === sys) ?? (cands.length === 1 ? cands[0] : void 0);
    if (hit) filled.push({ key: hit.key, reason: reason.slice(0, 500) });
    else unmatched += 1;
  }
  return { filled, unmatched, noColumn: false };
}
function numbersIn(s) {
  return (String(s || "").replace(/(\d),(?=\d{3})/g, "$1").match(/\d+(?:\.\d+)?/g) || []).map((x) => String(Number(x)));
}
function guardNumbers(modelText, source) {
  const allowed = new Set(numbersIn(source));
  const lines = String(modelText || "").split(/\n/);
  let dropped = 0;
  const out = [];
  for (const line of lines) {
    const marker = /^\s*(?:\d+[.、)）]|[-*•])\s*/.exec(line)?.[0] ?? "";
    const body = line.slice(marker.length);
    const kept = (body.match(/[^。！？!?；;]+[。！？!?；;]?/g) || []).filter((sentence) => {
      const ok = numbersIn(sentence).every((n) => allowed.has(n));
      if (!ok) dropped += 1;
      return ok;
    });
    if (kept.join("").trim()) out.push(`${marker}${kept.join("")}`.trimEnd());
    else if (!body.trim() && out.length && out[out.length - 1] !== "") out.push("");
  }
  return { text: out.join("\n").trim(), dropped };
}
function acceptModelClassification(json, cases) {
  const valid = new Set(import_ipc_contracts2.FS_REASON_CATEGORIES);
  const keys = new Set(cases.filter((c) => c.reason.trim()).map((c) => c.key));
  const source = cases.map((c) => `${c.reason} ${c.days} ${c.limitDays ?? ""} ${c.overdueDays}`).join("\n");
  const categories = {};
  let rejected = 0;
  const items = Array.isArray(json?.items) ? json.items : Array.isArray(json) ? json : [];
  for (const it of items) {
    const key = String(it?.key || "");
    const cat = String(it?.category || "");
    if (keys.has(key) && valid.has(cat)) categories[key] = cat;
    else rejected += 1;
  }
  const rootCauses = {};
  const rc = json?.rootCauses && typeof json.rootCauses === "object" ? json.rootCauses : {};
  for (const [cat, raw] of Object.entries(rc)) {
    if (!valid.has(cat) || typeof raw !== "string") {
      rejected += 1;
      continue;
    }
    const g = guardNumbers(raw.slice(0, 400), source);
    if (g.text) rootCauses[cat] = g.text;
    else rejected += 1;
  }
  return { categories, rootCauses, rejected };
}
function categoryCounts(cases) {
  return import_ipc_contracts2.FS_REASON_CATEGORIES.map((id) => ({ id, count: cases.filter((c) => c.reason.trim() && c.categoryId === id).length })).filter((x) => x.count > 0).sort((a, b) => b.count - a.count);
}

// ../../../totalclaw-solutions/solutions/workbench-flow-sla/src/main/services/flowSla/report.ts
var import_i18n4 = require("npm:@totalclaw/i18n");
var fmtRate = (r) => r == null ? "-" : `${(Math.round(r * 1e3) / 10).toFixed(1)}%`;
var fmtDays = (d) => d == null ? "-" : String(Math.round(d * 100) / 100);
var signed = (n, unit = "") => n == null ? "-" : `${n > 0 ? "+" : ""}${Math.round(n * 100) / 100}${unit}`;
var signedRate = (n) => n == null ? "-" : `${n > 0 ? "+" : ""}${(Math.round(n * 1e3) / 10).toFixed(1)}`;
var esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
var yesNo = (b) => b == null ? "-" : b ? (0, import_i18n4.t)("\u662F") : (0, import_i18n4.t)("\u5426");
var runLabel = (f) => f.runningLabel === "overdue" ? (0, import_i18n4.t)("\u5DF2\u903E\u671F") : f.runningLabel === "risk" ? (0, import_i18n4.t)("\u8F83\u5927\u903E\u671F\u98CE\u9669") : f.runningLabel === "no_limit" ? (0, import_i18n4.t)("\u65E0\u65F6\u6548\u8981\u6C42") : (0, import_i18n4.t)("\u6B63\u5E38");
function overallDelta(cur, prev) {
  const d = (a, b, digits) => {
    if (a == null || b == null) return null;
    const f = 10 ** digits;
    return Math.round((a - b) * f) / f;
  };
  return {
    doneCount: d(cur.doneCount, prev?.doneCount, 0),
    avgDays: d(cur.avgDays, prev?.avgDays, 2),
    complianceRate: d(cur.complianceRate, prev?.complianceRate, 4),
    runningCount: d(cur.runningCount, prev?.runningCount, 0),
    runningOverdue: d(cur.runningOverdue, prev?.runningOverdue, 0),
    reviewRate: d(cur.reviewRate, prev?.reviewRate, 4)
  };
}
function mostCommon(list) {
  const m = /* @__PURE__ */ new Map();
  for (const x of list) if (x) m.set(x, (m.get(x) ?? 0) + 1);
  return [...m.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "";
}
function bottomReviewers(rank, n, minCount = 3) {
  const pool = rank.filter((p) => p.count >= minCount && p.rate !== null && p.rate < 1);
  return [...pool].sort((a, b) => a.rate - b.rate || b.count - a.count).slice(0, n);
}
function buildFacts(ctx) {
  const o = ctx.result.overall;
  const facts = [];
  facts.push((0, import_i18n4.t)("\u7EDF\u8BA1\u5468\u671F {p0}\uFF1A\u529E\u7ED3 {p1} \u5355\uFF0C\u5E73\u5747\u7528\u65F6 {p2} \u5929\uFF0C\u6D41\u7A0B\u65F6\u6548\u5408\u89C4\u7387 {p3}\uFF08\u53C2\u4E0E\u5224\u5B9A {p4} \u5355\uFF0C\u8D85\u65F6 {p5} \u5355\uFF09\u3002", { p0: ctx.period.label, p1: o.doneCount, p2: fmtDays(o.avgDays), p3: fmtRate(o.complianceRate), p4: o.judged, p5: o.overtime }));
  facts.push((0, import_i18n4.t)("\u5728\u9014 {p0} \u5355\uFF0C\u5176\u4E2D\u5DF2\u903E\u671F {p1} \u5355\u3001\u8F83\u5927\u903E\u671F\u98CE\u9669 {p2} \u5355\u3002", { p0: o.runningCount, p1: o.runningOverdue, p2: o.runningRisk }));
  facts.push((0, import_i18n4.t)("\u4E2A\u4EBA\u5BA1\u6838 {p0} \u6B21\uFF0C\u5408\u89C4 {p1} \u6B21\uFF0C\u4E2A\u4EBA\u5BA1\u6838\u5408\u89C4\u7387 {p2}\u3002", { p0: o.reviewCount, p1: o.reviewCompliant, p2: fmtRate(o.reviewRate) }));
  if (ctx.previous) {
    facts.push((0, import_i18n4.t)("\u4E0E\u4E0A\u4E00\u5468\u671F\uFF08{p0}\uFF09\u76F8\u6BD4\uFF1A\u5408\u89C4\u7387 {p1} \u4E2A\u767E\u5206\u70B9\uFF0C\u5E73\u5747\u7528\u65F6 {p2} \u5929\uFF0C\u529E\u7ED3\u91CF {p3} \u5355\uFF0C\u5728\u9014\u903E\u671F {p4} \u5355\u3002", {
      p0: ctx.previous.label,
      p1: signedRate(ctx.delta.complianceRate),
      p2: signed(ctx.delta.avgDays),
      p3: signed(ctx.delta.doneCount),
      p4: signed(ctx.delta.runningOverdue)
    }));
  } else {
    facts.push((0, import_i18n4.t)("\u6CA1\u6709\u4E0A\u4E00\u5468\u671F\u7684\u6570\u636E\uFF0C\u672C\u671F\u4E0D\u505A\u73AF\u6BD4\u3002"));
  }
  const worse = ctx.compare.filter((t) => (t.avgDelta ?? 0) > 0 || (t.rateDelta ?? 0) < 0).length;
  facts.push((0, import_i18n4.t)("\u5F02\u5E38\u5224\u5B9A\u6807\u51C6\uFF1A\u5E73\u5747\u7528\u65F6\u73AF\u6BD4\u589E\u52A0\u8D85\u8FC7 {p0} \u5929\uFF0C\u6216\u65F6\u6548\u5408\u89C4\u7387\u4F4E\u4E8E {p1}\u3002\u672C\u671F\u5F02\u5E38\u6D41\u7A0B\u7C7B\u578B {p2} \u4E2A\uFF0C\u7528\u65F6\u6216\u5408\u89C4\u7387\u6BD4\u4E0A\u4E00\u5468\u671F\u53D8\u5DEE\u7684\u6D41\u7A0B\u7C7B\u578B {p3} \u4E2A\u3002", { p0: ctx.thresholds.avgIncreaseDays, p1: fmtRate(ctx.thresholds.minComplianceRate), p2: ctx.abnormal.length, p3: worse }));
  for (const c of ctx.result.byCategory) {
    facts.push((0, import_i18n4.t)("{p0}\uFF1A\u529E\u7ED3 {p1} \u5355\uFF0C\u5E73\u5747\u7528\u65F6 {p2} \u5929\uFF0C\u5408\u89C4\u7387 {p3}\uFF0C\u5728\u9014 {p4} \u5355\uFF08\u903E\u671F {p5} \u5355\uFF09\u3002", { p0: c.category, p1: c.doneCount, p2: fmtDays(c.avgDays), p3: fmtRate(c.complianceRate), p4: c.runningCount, p5: c.runningOverdue }));
  }
  for (const a of ctx.abnormal.slice(0, 8)) {
    const top = a.analysis.nodes[0];
    facts.push((0, import_i18n4.t)("\u5F02\u5E38\u6D41\u7A0B\u7C7B\u578B\u300C{p0}\u300D\uFF08{p1}\uFF09\uFF1A\u529E\u7ED3 {p2} \u5355\uFF0C\u5E73\u5747\u7528\u65F6 {p3} \u5929\uFF0C\u5408\u89C4\u7387 {p4}\uFF1B{p5}", { p0: a.flowType, p1: a.system, p2: a.doneCount, p3: fmtDays(a.avgDays), p4: fmtRate(a.complianceRate), p5: a.reasons.join("\uFF1B") }) + (top ? (0, import_i18n4.t)("\uFF1B\u8017\u65F6\u6700\u957F\u7684\u8282\u70B9\u662F\u300C{p0}\u300D\uFF0C\u5E73\u5747 {p1} \u5929\uFF0C\u5360\u8BE5\u7C7B\u8282\u70B9\u603B\u8017\u65F6\u7684 {p2}\u3002", { p0: top.node, p1: fmtDays(top.avgDays), p2: fmtRate(top.share) }) : ""));
  }
  const bottom = bottomReviewers(ctx.result.reviewerRank, 3);
  if (bottom.length) facts.push((0, import_i18n4.t)("\u4E2A\u4EBA\u5BA1\u6838\u5408\u89C4\u7387\u9760\u540E\uFF1A{p0}\u3002", { p0: bottom.map((p) => (0, import_i18n4.t)("{p0}\uFF08{p1}\uFF0C\u5BA1\u6838 {p2} \u6B21\uFF0C\u5408\u89C4\u7387 {p3}\uFF09", { p0: p.name, p1: p.dept || p.identity, p2: p.count, p3: fmtRate(p.rate) })).join("\u3001") }));
  if (ctx.period.kind === "monthly") {
    facts.push((0, import_i18n4.t)("\u672C\u5E74\u5EA6\u53D1\u8D77\u3001\u4ECD\u672A\u529E\u7ED3\u4E14\u5DF2\u8D85\u65F6\u7684\u5728\u9014\u6D41\u7A0B {p0} \u5355\u3002", { p0: ctx.yearOverdue.length }));
    for (const f of ctx.yearOverdue.slice(0, 5)) {
      facts.push((0, import_i18n4.t)("\u5728\u9014\u8D85\u65F6\uFF1A[{p0}] {p1} {p2}\uFF0C\u5728\u9014 {p3} \u5929\uFF0C\u8D85\u65F6 {p4} \u5929\uFF0C\u5F53\u524D\u8282\u70B9\u300C{p5}\u300D\uFF0C\u5F53\u524D\u5904\u7406\u4EBA {p6}\u3002", { p0: f.system, p1: f.flowNo, p2: f.flowType, p3: fmtDays(f.days), p4: fmtDays(f.overdueDays), p5: f.currentNode || "-", p6: f.currentHandler || "-" }));
    }
  }
  const cats = categoryCounts(ctx.cases);
  const collected = ctx.cases.filter((c) => c.reason.trim()).length;
  facts.push((0, import_i18n4.t)("\u9700\u8981\u8BF4\u660E\u539F\u56E0\u7684\u6D41\u7A0B {p0} \u5355\uFF0C\u5DF2\u6536\u5230\u539F\u56E0 {p1} \u5355\u3002", { p0: ctx.cases.length, p1: collected }));
  if (cats.length) facts.push((0, import_i18n4.t)("\u8D85\u65F6\u539F\u56E0\u5206\u5E03\uFF1A{p0}\u3002", { p0: cats.map((c) => (0, import_i18n4.t)("{p0} {p1} \u5355", { p0: categoryLabel(c.id), p1: c.count })).join("\u3001") }));
  return facts;
}
function ruleSummary(ctx) {
  const o = ctx.result.overall;
  const th = ctx.thresholds;
  const parts = [];
  const target = fmtRate(th.minComplianceRate);
  parts.push((0, import_i18n4.t)("\u3010\u6574\u4F53\u8868\u73B0\u3011{p0}\u529E\u7ED3\u6D41\u7A0B {p1} \u5355\uFF0C\u5E73\u5747\u7528\u65F6 {p2} \u5929\uFF0C\u6D41\u7A0B\u65F6\u6548\u5408\u89C4\u7387 {p3}\uFF0C{p4}\u76EE\u6807\u7EBF {p5}\uFF1B\u4E2A\u4EBA\u5BA1\u6838\u5408\u89C4\u7387 {p6}\u3002\u5728\u9014\u6D41\u7A0B {p7} \u5355\uFF0C\u5DF2\u903E\u671F {p8} \u5355\uFF0C\u8F83\u5927\u903E\u671F\u98CE\u9669 {p9} \u5355\u3002", {
    p0: ctx.period.label,
    p1: o.doneCount,
    p2: fmtDays(o.avgDays),
    p3: fmtRate(o.complianceRate),
    p4: o.complianceRate == null ? "" : o.complianceRate >= th.minComplianceRate ? (0, import_i18n4.t)("\u8FBE\u5230") : (0, import_i18n4.t)("\u4F4E\u4E8E"),
    p5: target,
    p6: fmtRate(o.reviewRate),
    p7: o.runningCount,
    p8: o.runningOverdue,
    p9: o.runningRisk
  }));
  if (ctx.previous) {
    const worse = ctx.compare.filter((t) => (t.avgDelta ?? 0) > 0 || (t.rateDelta ?? 0) < 0).length;
    parts.push((0, import_i18n4.t)("\u3010\u5F02\u5E38\u8D8B\u52BF\u3011\u4E0E {p0} \u76F8\u6BD4\uFF0C\u5408\u89C4\u7387\u53D8\u5316 {p1} \u4E2A\u767E\u5206\u70B9\uFF0C\u5E73\u5747\u7528\u65F6\u53D8\u5316 {p2} \u5929\uFF0C\u5728\u9014\u903E\u671F\u53D8\u5316 {p3} \u5355\u3002{p4} \u4E2A\u6D41\u7A0B\u7C7B\u578B\u7684\u7528\u65F6\u6216\u5408\u89C4\u7387\u53D8\u5DEE\uFF0C\u5176\u4E2D {p5} \u4E2A\u88AB\u5224\u4E3A\u5F02\u5E38\u6D41\u7A0B\u7C7B\u578B\u3002", {
      p0: ctx.previous.label,
      p1: signedRate(ctx.delta.complianceRate),
      p2: signed(ctx.delta.avgDays),
      p3: signed(ctx.delta.runningOverdue),
      p4: worse,
      p5: ctx.abnormal.length
    }));
  } else {
    parts.push((0, import_i18n4.t)("\u3010\u5F02\u5E38\u8D8B\u52BF\u3011\u6CA1\u6709\u4E0A\u4E00\u5468\u671F\u7684\u6570\u636E\uFF0C\u672C\u671F\u4E0D\u505A\u73AF\u6BD4\uFF1B\u6309\u5408\u89C4\u7387\u4F4E\u4E8E {p0} \u7684\u6807\u51C6\uFF0C\u6709 {p1} \u4E2A\u6D41\u7A0B\u7C7B\u578B\u88AB\u5224\u4E3A\u5F02\u5E38\u3002", { p0: target, p1: ctx.abnormal.length }));
  }
  if (ctx.abnormal.length) {
    const lines = ctx.abnormal.slice(0, 5).map((a) => {
      const top = a.analysis.nodes[0];
      return (0, import_i18n4.t)("\u300C{p0}\u300D\uFF08{p1}\uFF09{p2}", { p0: a.flowType, p1: a.system, p2: a.reasons.join("\uFF1B") }) + (top ? (0, import_i18n4.t)("\uFF0C\u8017\u65F6\u6700\u957F\u7684\u8282\u70B9\u662F\u300C{p0}\u300D\uFF08\u5E73\u5747 {p1} \u5929\uFF09", { p0: top.node, p1: fmtDays(top.avgDays) }) : "");
    });
    parts.push((0, import_i18n4.t)("\u3010\u91CD\u70B9\u95EE\u9898\u3011{p0}\u3002", { p0: lines.join("\uFF1B") }));
  } else {
    parts.push((0, import_i18n4.t)("\u3010\u91CD\u70B9\u95EE\u9898\u3011\u672C\u671F\u6CA1\u6709\u6D41\u7A0B\u7C7B\u578B\u88AB\u5224\u4E3A\u5F02\u5E38\u3002"));
  }
  const cats = categoryCounts(ctx.cases);
  const bottom = bottomReviewers(ctx.result.reviewerRank, 3);
  const resp = [];
  if (cats.length) resp.push((0, import_i18n4.t)("\u5DF2\u6536\u96C6\u7684\u8D85\u65F6\u539F\u56E0\u91CC\uFF0C{p0}", { p0: cats.map((c) => (0, import_i18n4.t)("{p0} {p1} \u5355", { p0: categoryLabel(c.id), p1: c.count })).join("\u3001") }));
  if (bottom.length) resp.push((0, import_i18n4.t)("\u4E2A\u4EBA\u5BA1\u6838\u5408\u89C4\u7387\u9760\u540E\u7684\u662F {p0}", { p0: bottom.map((p) => `${p.name}\uFF08${fmtRate(p.rate)}\uFF09`).join("\u3001") }));
  if (ctx.period.kind === "monthly" && ctx.yearOverdue.length) resp.push((0, import_i18n4.t)("\u672C\u5E74\u5EA6\u4ECD\u6709 {p0} \u5355\u5728\u9014\u6D41\u7A0B\u5DF2\u8D85\u65F6\u672A\u529E\u7ED3", { p0: ctx.yearOverdue.length }));
  parts.push(resp.length ? (0, import_i18n4.t)("\u3010\u8D23\u4EFB\u7EF4\u5EA6\u3011{p0}\u3002", { p0: resp.join("\uFF1B") }) : (0, import_i18n4.t)("\u3010\u8D23\u4EFB\u7EF4\u5EA6\u3011\u672C\u671F\u6CA1\u6709\u9700\u8981\u70B9\u540D\u7684\u8D23\u4EFB\u95EE\u9898\u3002"));
  return parts.join("\n\n");
}
function ruleSuggestions(ctx) {
  const deadline = ymd(ctx.period.end + 30 * 864e5);
  const out = [];
  const deptOf = new Map(ctx.result.flows.map((f) => [`${f.system}|${f.flowNo}`, f.dept]));
  for (const c of categoryCounts(ctx.cases).slice(0, 3)) {
    const mine = ctx.cases.filter((x) => x.categoryId === c.id && x.reason.trim());
    const requirement = {
      materials: (0, import_i18n4.t)("\u6574\u7406\u672C\u7C7B\u6D41\u7A0B\u7684\u63D0\u4EA4\u8D44\u6599\u6E05\u5355\uFF0C\u53D1\u8D77\u524D\u81EA\u67E5\uFF1B\u9000\u56DE\u4E00\u6B21\u4EE5\u4E0A\u7684\u5355\u636E\u7531\u90E8\u95E8\u8D1F\u8D23\u4EBA\u590D\u6838\u540E\u518D\u63D0\u4EA4"),
      absence: (0, import_i18n4.t)("\u5BA1\u6279\u4EBA\u51FA\u5DEE\u3001\u4F11\u5047\u524D\u5728\u7CFB\u7EDF\u91CC\u8BBE\u7F6E\u4EE3\u7406\u4EBA\uFF1B\u90E8\u95E8\u5185\u660E\u786E\u6BCF\u4E2A\u5BA1\u6279\u8282\u70B9\u7684\u5907\u5C97\u4EBA"),
      cross_dept: (0, import_i18n4.t)("\u4E0E\u76F8\u5173\u90E8\u95E8\u7EA6\u5B9A\u4F1A\u7B7E\u3001\u786E\u8BA4\u7C7B\u8282\u70B9\u7684\u7B54\u590D\u65F6\u9650\u548C\u5BF9\u63A5\u4EBA\uFF0C\u8D85\u8FC7\u65F6\u9650\u7531\u90E8\u95E8\u8D1F\u8D23\u4EBA\u534F\u8C03"),
      external: (0, import_i18n4.t)("\u5BF9\u5916\u90E8\u5355\u4F4D\u53CD\u9988\u7C7B\u8282\u70B9\u5EFA\u7ACB\u50AC\u529E\u8282\u594F\uFF0C\u8D85\u8FC7\u7EA6\u5B9A\u5929\u6570\u5347\u7EA7\u5230\u533A\u57DF\u7ECF\u7406\u8DDF\u8FDB"),
      system: (0, import_i18n4.t)("\u6838\u5BF9\u5F85\u529E\u63D0\u9192\u662F\u5426\u5F00\u542F\uFF0C\u6574\u7406\u5E38\u89C1\u64CD\u4F5C\u95EE\u9898\u8BF4\u660E\uFF1B\u7CFB\u7EDF\u6545\u969C\u5F53\u5929\u62A5\u7ED9\u7CFB\u7EDF\u987E\u95EE"),
      design: (0, import_i18n4.t)("\u68B3\u7406\u5BA1\u6279\u8282\u70B9\uFF0C\u8BC4\u4F30\u53EF\u4EE5\u5408\u5E76\u6216\u53D6\u6D88\u7684\u73AF\u8282\uFF0C\u5F62\u6210\u6D41\u7A0B\u4F18\u5316\u7533\u8BF7"),
      other: (0, import_i18n4.t)("\u9010\u5355\u590D\u76D8\u539F\u56E0\uFF0C\u5F62\u6210\u53EF\u6267\u884C\u7684\u6539\u8FDB\u52A8\u4F5C")
    };
    out.push({
      item: (0, import_i18n4.t)("\u51CF\u5C11\u300C{p0}\u300D\u9020\u6210\u7684\u8D85\u65F6\uFF08\u672C\u671F {p1} \u5355\uFF09", { p0: categoryLabel(c.id), p1: c.count }),
      dept: mostCommon(mine.map((x) => deptOf.get(x.key) || "")),
      owner: mostCommon(mine.map((x) => x.owner)),
      requirement: requirement[c.id],
      deadline,
      acceptance: (0, import_i18n4.t)("\u4E0B\u4E00\u4E2A\u7EDF\u8BA1\u5468\u671F\u91CC\uFF0C\u8FD9\u4E00\u7C7B\u539F\u56E0\u9020\u6210\u7684\u8D85\u65F6\u6D41\u7A0B\u6570\u91CF\u4E0B\u964D")
    });
  }
  for (const a of ctx.abnormal.slice(0, 3)) {
    const flows = ctx.result.flows.filter((f) => f.flowType === a.flowType && f.system === a.system);
    const top = a.analysis.nodes[0];
    out.push({
      item: (0, import_i18n4.t)("\u300C{p0}\u300D\u65F6\u6548\u8FBE\u6807\uFF08{p1}\uFF09", { p0: a.flowType, p1: a.reasons.join("\uFF1B") }),
      dept: mostCommon(flows.map((f) => f.dept)),
      owner: mostCommon(flows.filter((f) => f.overtime || f.runningLabel === "overdue").map((f) => f.currentHandler || f.initiator)),
      requirement: top ? (0, import_i18n4.t)("\u91CD\u70B9\u538B\u7F29\u300C{p0}\u300D\u8282\u70B9\u7684\u505C\u7559\u65F6\u95F4\uFF08\u5F53\u524D\u5E73\u5747 {p1} \u5929\uFF09\uFF0C\u4E0E\u4E1A\u52A1\u786E\u8BA4\u505C\u7559\u539F\u56E0\u5E76\u7ED9\u51FA\u5904\u7406\u529E\u6CD5", { p0: top.node, p1: fmtDays(top.avgDays) }) : (0, import_i18n4.t)("\u590D\u76D8\u672C\u7C7B\u6D41\u7A0B\u7684\u8D85\u65F6\u5355\u636E\uFF0C\u786E\u8BA4\u539F\u56E0\u5E76\u7ED9\u51FA\u5904\u7406\u529E\u6CD5"),
      deadline,
      acceptance: (0, import_i18n4.t)("\u8BE5\u6D41\u7A0B\u7C7B\u578B\u7684\u65F6\u6548\u5408\u89C4\u7387\u4E0D\u4F4E\u4E8E {p0}", { p0: fmtRate(ctx.thresholds.minComplianceRate) })
    });
  }
  return out;
}
function acceptModelSummary(json, ctx) {
  const source = buildFacts(ctx).join("\n");
  const raw = typeof json?.summary === "string" ? json.summary : Array.isArray(json?.summary) ? json.summary.join("\n\n") : "";
  const g = guardNumbers(raw.slice(0, 4e3), source);
  let dropped = g.dropped;
  const suggestions = [];
  for (const s of Array.isArray(json?.suggestions) ? json.suggestions.slice(0, 8) : []) {
    const item = guardNumbers(String(s?.item || "").slice(0, 200), source);
    const requirement = guardNumbers(String(s?.requirement || "").slice(0, 300), source);
    const acceptance = guardNumbers(String(s?.acceptance || "").slice(0, 200), source);
    dropped += item.dropped + requirement.dropped + acceptance.dropped;
    if (!item.text || !requirement.text) continue;
    const deadline = /^\d{4}-\d{2}-\d{2}$/.test(String(s?.deadline || "")) ? String(s.deadline) : ymd(ctx.period.end + 30 * 864e5);
    suggestions.push({ item: item.text, dept: String(s?.dept || "").slice(0, 40), owner: String(s?.owner || "").slice(0, 40), requirement: requirement.text, deadline, acceptance: acceptance.text });
  }
  const ok = g.text.length >= 40;
  return { summary: ok ? g.text : ruleSummary(ctx), suggestions: suggestions.length ? suggestions : ruleSuggestions(ctx), usedModel: ok, dropped };
}
function svgBars(items, opts = {}) {
  const width = opts.width ?? 660;
  const rowH = 24;
  const left = 210;
  const right = 70;
  const max = opts.max ?? Math.max(1e-9, ...items.map((i) => i.value ?? 0));
  const inner = width - left - right;
  const h = items.length * rowH + 18;
  const rows = items.map((it, i) => {
    const w = it.value == null ? 0 : Math.max(0, Math.min(1, it.value / max)) * inner;
    const y = i * rowH + 4;
    const label = it.label.length > 16 ? `${it.label.slice(0, 15)}\u2026` : it.label;
    return `<text x="${left - 8}" y="${y + 13}" text-anchor="end" font-size="11" fill="#333">${esc(label)}</text><rect x="${left}" y="${y}" width="${inner}" height="16" rx="3" fill="#f1f3f7"/><rect x="${left}" y="${y}" width="${w.toFixed(1)}" height="16" rx="3" fill="${it.warn ? "#e5484d" : "#3b6cf6"}"/><text x="${left + inner + 6}" y="${y + 13}" font-size="11" fill="#333">${esc(it.text)}</text>`;
  }).join("");
  let mark = "";
  if (opts.mark && opts.mark.value <= max) {
    const x = left + opts.mark.value / max * inner;
    mark = `<line x1="${x.toFixed(1)}" y1="0" x2="${x.toFixed(1)}" y2="${h - 14}" stroke="#f59e0b" stroke-dasharray="4 3"/><text x="${x.toFixed(1)}" y="${h - 2}" text-anchor="middle" font-size="10" fill="#b45309">${esc(opts.mark.label)}</text>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${h}" viewBox="0 0 ${width} ${h}">${rows}${mark}</svg>`;
}
function svgLine(points, opts = {}) {
  const width = opts.width ?? 660;
  const height = opts.height ?? 170;
  const padL = 36;
  const padR = 36;
  const padT = 22;
  const padB = 30;
  const vals = points.map((p) => p.value).filter((v) => v != null);
  if (!vals.length) return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="40"></svg>`;
  let lo = opts.min ?? Math.min(...vals);
  let hi = opts.max ?? Math.max(...vals);
  if (hi - lo < 1e-9) {
    hi += 1;
    lo = Math.max(0, lo - 1);
  }
  const x = (i) => padL + (points.length === 1 ? (width - padL - padR) / 2 : i / (points.length - 1) * (width - padL - padR));
  const y = (v) => padT + (1 - (v - lo) / (hi - lo)) * (height - padT - padB);
  const color = opts.color ?? "#3b6cf6";
  const path = points.map((p, i) => p.value == null ? "" : `${x(i).toFixed(1)},${y(p.value).toFixed(1)}`).filter(Boolean).join(" ");
  const dots = points.map((p, i) => p.value == null ? "" : `<circle cx="${x(i).toFixed(1)}" cy="${y(p.value).toFixed(1)}" r="3" fill="${color}"/><text x="${x(i).toFixed(1)}" y="${(y(p.value) - 7).toFixed(1)}" text-anchor="middle" font-size="10" fill="#333">${esc(p.text)}</text>`).join("");
  const step = Math.max(1, Math.ceil(points.length / 8));
  const labels = points.map((p, i) => i % step === 0 || i === points.length - 1 ? `<text x="${x(i).toFixed(1)}" y="${height - 8}" text-anchor="middle" font-size="10" fill="#666">${esc(p.label.length > 12 ? p.label.slice(-10) : p.label)}</text>` : "").join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><line x1="${padL}" y1="${height - padB}" x2="${width - padR}" y2="${height - padB}" stroke="#d5d9e2"/><polyline fill="none" stroke="${color}" stroke-width="2" points="${path}"/>${dots}${labels}</svg>`;
}
var CSS = `
*{box-sizing:border-box}body{font-family:-apple-system,"PingFang SC","Microsoft YaHei","Noto Sans CJK SC",sans-serif;color:#1f2430;margin:0;padding:28px 32px;font-size:12.5px;line-height:1.65;background:#fff}
h1{font-size:21px;margin:0 0 4px}h2{font-size:15px;margin:22px 0 8px;padding-left:8px;border-left:4px solid #3b6cf6}h3{font-size:13px;margin:14px 0 6px}
.sub{color:#667085;margin:0 0 14px}.kpis{display:flex;flex-wrap:wrap;gap:8px;margin:10px 0}
.kpi{flex:1 1 120px;border:1px solid #e3e6ee;border-radius:8px;padding:8px 10px}.kpi small{display:block;color:#667085;font-size:11px}.kpi b{font-size:18px}.kpi i{font-style:normal;font-size:11px;color:#667085;margin-left:4px}
table{border-collapse:collapse;width:100%;margin:6px 0 10px;font-size:11.5px}th,td{border:1px solid #e3e6ee;padding:4px 6px;text-align:left;vertical-align:top}th{background:#f5f7fb;font-weight:600}
td.n,th.n{text-align:right;white-space:nowrap}tr.bad td{background:#fff3f3}.tag{display:inline-block;padding:0 6px;border-radius:9px;font-size:10.5px;background:#fde8e8;color:#b42318}.ok{color:#087443}.bad{color:#b42318}
p{margin:6px 0}.note{color:#667085;font-size:11px}.pre{white-space:pre-wrap}section{page-break-inside:auto}tr{page-break-inside:avoid}h2,h3{page-break-after:avoid}
@page{size:A4;margin:14mm 12mm}`;
function table(headers, rows, empty) {
  const hs = headers.map((h) => typeof h === "string" ? { t: h, n: false } : h);
  if (!rows.length) return `<p class="note">${esc(empty)}</p>`;
  return `<table><thead><tr>${hs.map((h) => `<th${h.n ? ' class="n"' : ""}>${esc(h.t)}</th>`).join("")}</tr></thead><tbody>${rows.map((r) => `<tr${r.bad ? ' class="bad"' : ""}>${r.cells.map((c, i) => `<td${hs[i]?.n ? ' class="n"' : ""}>${esc(c)}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
}
var N = (t) => ({ t, n: true });
function kpis(ctx) {
  const o = ctx.result.overall;
  const d = ctx.delta;
  const card = (label, value, delta) => `<div class="kpi"><small>${esc(label)}</small><b>${esc(value)}</b>${delta && delta !== "-" ? `<i>${esc((0, import_i18n4.t)("\u73AF\u6BD4 {p0}", { p0: delta }))}</i>` : ""}</div>`;
  return `<div class="kpis">${[
    card((0, import_i18n4.t)("\u529E\u7ED3\u6570"), String(o.doneCount), signed(d.doneCount)),
    card((0, import_i18n4.t)("\u5E73\u5747\u7528\u65F6\uFF08\u5929\uFF09"), fmtDays(o.avgDays), signed(d.avgDays)),
    card((0, import_i18n4.t)("\u6D41\u7A0B\u65F6\u6548\u5408\u89C4\u7387"), fmtRate(o.complianceRate), d.complianceRate == null ? "-" : (0, import_i18n4.t)("{p0} \u4E2A\u767E\u5206\u70B9", { p0: signedRate(d.complianceRate) })),
    card((0, import_i18n4.t)("\u5728\u9014\u6570"), String(o.runningCount), signed(d.runningCount)),
    card((0, import_i18n4.t)("\u5DF2\u903E\u671F"), String(o.runningOverdue), signed(d.runningOverdue)),
    card((0, import_i18n4.t)("\u8F83\u5927\u903E\u671F\u98CE\u9669"), String(o.runningRisk)),
    card((0, import_i18n4.t)("\u4E2A\u4EBA\u5BA1\u6838\u5408\u89C4\u7387"), fmtRate(o.reviewRate), d.reviewRate == null ? "-" : (0, import_i18n4.t)("{p0} \u4E2A\u767E\u5206\u70B9", { p0: signedRate(d.reviewRate) }))
  ].join("")}</div>`;
}
function typeTable(list, withType, min) {
  return table(
    [(0, import_i18n4.t)("\u5927\u7C7B"), ...withType ? [(0, import_i18n4.t)("\u6D41\u7A0B\u7EC6\u7C7B"), (0, import_i18n4.t)("\u7CFB\u7EDF")] : [], N((0, import_i18n4.t)("\u529E\u7ED3")), N((0, import_i18n4.t)("\u5E73\u5747\u7528\u65F6\uFF08\u5929\uFF09")), N((0, import_i18n4.t)("\u65F6\u6548\u8981\u6C42\uFF08\u5929\uFF09")), N((0, import_i18n4.t)("\u8D85\u65F6")), N((0, import_i18n4.t)("\u5408\u89C4\u7387")), N((0, import_i18n4.t)("\u5728\u9014")), N((0, import_i18n4.t)("\u5728\u9014\u903E\u671F")), N((0, import_i18n4.t)("\u5728\u9014\u8D85\u65F6\u5360\u6BD4"))],
    list.map((t) => ({ bad: t.complianceRate !== null && t.complianceRate < min, cells: [t.category, ...withType ? [t.flowType, t.system] : [], t.doneCount, fmtDays(t.avgDays), t.limitDays ?? "-", t.overtime, fmtRate(t.complianceRate), t.runningCount, t.runningOverdue, fmtRate(t.runningOverdueRate)] })),
    (0, import_i18n4.t)("\u6CA1\u6709\u6570\u636E")
  );
}
function compareTable(list) {
  return table(
    [(0, import_i18n4.t)("\u6D41\u7A0B\u7EC6\u7C7B"), (0, import_i18n4.t)("\u7CFB\u7EDF"), N((0, import_i18n4.t)("\u529E\u7ED3")), N((0, import_i18n4.t)("\u5E73\u5747\u7528\u65F6\uFF08\u5929\uFF09")), N((0, import_i18n4.t)("\u4E0A\u671F")), N((0, import_i18n4.t)("\u53D8\u5316")), N((0, import_i18n4.t)("\u5408\u89C4\u7387")), N((0, import_i18n4.t)("\u4E0A\u671F")), N((0, import_i18n4.t)("\u53D8\u5316\uFF08\u767E\u5206\u70B9\uFF09")), (0, import_i18n4.t)("\u5F02\u5E38\u539F\u56E0")],
    list.map((t) => ({ bad: t.abnormal, cells: [t.flowType, t.system, t.doneCount, fmtDays(t.avgDays), fmtDays(t.prevAvgDays), signed(t.avgDelta), fmtRate(t.complianceRate), fmtRate(t.prevComplianceRate), signedRate(t.rateDelta), t.reasons.join((0, import_i18n4.t)("\uFF1B"))] })),
    (0, import_i18n4.t)("\u6CA1\u6709\u6570\u636E")
  );
}
function rankTable(list, countLabel) {
  return table(
    [N((0, import_i18n4.t)("\u6392\u540D")), (0, import_i18n4.t)("\u59D3\u540D"), (0, import_i18n4.t)("\u90E8\u95E8"), (0, import_i18n4.t)("\u8EAB\u4EFD"), N(countLabel), N((0, import_i18n4.t)("\u5408\u89C4")), N((0, import_i18n4.t)("\u5408\u89C4\u7387")), N((0, import_i18n4.t)("\u5E73\u5747\u7528\u65F6"))],
    list.map((p) => ({ cells: [p.rank, p.name, p.dept, p.identity, p.count, p.compliant, fmtRate(p.rate), fmtDays(p.avgDays)] })),
    (0, import_i18n4.t)("\u6CA1\u6709\u6570\u636E")
  );
}
function runningTable(list, reasonOf) {
  return table(
    [(0, import_i18n4.t)("\u7CFB\u7EDF"), (0, import_i18n4.t)("\u5355\u53F7"), (0, import_i18n4.t)("\u6D41\u7A0B\u7EC6\u7C7B"), (0, import_i18n4.t)("\u53D1\u8D77\u4EBA"), N((0, import_i18n4.t)("\u5728\u9014\uFF08\u5929\uFF09")), N((0, import_i18n4.t)("\u65F6\u6548\u8981\u6C42")), N((0, import_i18n4.t)("\u8D85\u65F6\uFF08\u5929\uFF09")), (0, import_i18n4.t)("\u5F53\u524D\u8282\u70B9"), (0, import_i18n4.t)("\u5F53\u524D\u5904\u7406\u4EBA"), N((0, import_i18n4.t)("\u8282\u70B9\u505C\u7559\uFF08\u5929\uFF09")), (0, import_i18n4.t)("\u539F\u56E0")],
    list.map((f) => {
      const c = reasonOf.get(`${f.system}|${f.flowNo}`);
      return { cells: [f.system, f.flowNo, f.flowType, f.initiator, fmtDays(f.days), f.limitDays ?? "-", fmtDays(f.overdueDays), f.currentNode, f.currentHandler, fmtDays(f.currentNodeDays), c?.reason ? `${c.categoryId ? `[${categoryLabel(c.categoryId)}] ` : ""}${c.reason}` : ""] };
    }),
    (0, import_i18n4.t)("\u6CA1\u6709\u5728\u9014\u8D85\u65F6\u7684\u6D41\u7A0B")
  );
}
function nodeTable(a) {
  return table(
    [(0, import_i18n4.t)("\u8282\u70B9"), (0, import_i18n4.t)("\u5185\u5916\u90E8"), N((0, import_i18n4.t)("\u5904\u7406\u6B21\u6570")), N((0, import_i18n4.t)("\u5E73\u5747\u8017\u65F6\uFF08\u5929\uFF09")), N((0, import_i18n4.t)("\u6700\u957F\uFF08\u5929\uFF09")), N((0, import_i18n4.t)("\u5E73\u5747\u7B49\u5F85\uFF08\u5929\uFF09")), N((0, import_i18n4.t)("\u8017\u65F6\u5360\u6BD4")), N((0, import_i18n4.t)("\u5728\u9014\u505C\u7559\u6570")), N((0, import_i18n4.t)("\u5E73\u5747\u505C\u7559\uFF08\u5929\uFF09"))],
    a.nodes.map((n) => ({ bad: n.node === a.longestNode, cells: [n.node, n.internal == null ? (0, import_i18n4.t)("\u672A\u767B\u8BB0") : n.internal ? (0, import_i18n4.t)("\u5185\u90E8") : (0, import_i18n4.t)("\u5916\u90E8"), n.count, fmtDays(n.avgDays), fmtDays(n.maxDays), fmtDays(n.avgWaitDays), fmtRate(n.share), n.stuckCount, fmtDays(n.avgStuckDays)] })),
    (0, import_i18n4.t)("\u8FD9\u4E00\u7C7B\u6D41\u7A0B\u6CA1\u6709\u8282\u70B9\u660E\u7EC6")
  );
}
function reasonsBlock(ctx) {
  const cats = categoryCounts(ctx.cases);
  if (!cats.length) return `<p class="note">${esc((0, import_i18n4.t)("\u8FD8\u6CA1\u6709\u6536\u96C6\u5230\u8D85\u65F6\u539F\u56E0"))}</p>`;
  return table(
    [(0, import_i18n4.t)("\u539F\u56E0\u7C7B\u522B"), N((0, import_i18n4.t)("\u6570\u91CF")), (0, import_i18n4.t)("\u6839\u56E0\u8BF4\u660E")],
    cats.map((c) => ({ cells: [categoryLabel(c.id), c.count, ctx.rootCauses[c.id] || defaultRootCause(c.id)] })),
    ""
  );
}
function suggestionTable(list) {
  return table(
    [(0, import_i18n4.t)("\u5EFA\u8BAE\u4E8B\u9879"), (0, import_i18n4.t)("\u8D23\u4EFB\u90E8\u95E8"), (0, import_i18n4.t)("\u8D23\u4EFB\u4EBA"), (0, import_i18n4.t)("\u6267\u884C\u8981\u6C42"), (0, import_i18n4.t)("\u6267\u884C\u671F\u9650"), (0, import_i18n4.t)("\u9A8C\u6536\u8981\u6C42")],
    list.map((s) => ({ cells: [s.item, s.dept, s.owner, s.requirement, s.deadline, s.acceptance] })),
    (0, import_i18n4.t)("\u672C\u671F\u6CA1\u6709\u6539\u5584\u5EFA\u8BAE")
  );
}
var page = (title, body) => `<!doctype html><html><head><meta charset="utf-8"><title>${esc(title)}</title><style>${CSS}</style></head><body>${body}</body></html>`;
function reportSubject(ctx) {
  return ctx.period.kind === "monthly" ? (0, import_i18n4.t)("\u7EBF\u4E0A\u6D41\u7A0B\u65F6\u6548\u8FBE\u6210\u60C5\u51B5\u6708\u5EA6\u901A\u62A5\uFF08{p0}\uFF09", { p0: ctx.period.label }) : (0, import_i18n4.t)("\u7EBF\u4E0A\u6D41\u7A0B\u65F6\u6548\u8FBE\u6210\u60C5\u51B5\u5468\u901A\u62A5\uFF08{p0}\uFF09", { p0: ctx.period.label });
}
function weeklyMail(ctx) {
  const subject = reportSubject(ctx);
  const o = ctx.result.overall;
  const reasonOf = new Map(ctx.cases.map((c) => [c.key, c]));
  const overdue = ctx.result.flows.filter((f) => f.status === "running" && f.runningLabel === "overdue").sort((a, b) => b.overdueDays - a.overdueDays);
  const top = ctx.result.reviewerRank.filter((p) => p.count >= 3).slice(0, 5);
  const bottom = bottomReviewers(ctx.result.reviewerRank, 5);
  const text2 = [
    (0, import_i18n4.t)("\u5404\u4F4D\u597D\uFF1A"),
    "",
    (0, import_i18n4.t)("{p0} \u7EBF\u4E0A\u6D41\u7A0B\u65F6\u6548\u8FBE\u6210\u60C5\u51B5\u5982\u4E0B\uFF0C\u660E\u7EC6\u89C1\u9644\u4EF6\u3002", { p0: ctx.period.label }),
    "",
    (0, import_i18n4.t)("\u4E00\u3001\u5173\u952E\u6570\u5B57"),
    (0, import_i18n4.t)("\u529E\u7ED3 {p0} \u5355\uFF0C\u5E73\u5747\u7528\u65F6 {p1} \u5929\uFF0C\u6D41\u7A0B\u65F6\u6548\u5408\u89C4\u7387 {p2}\uFF1B\u4E2A\u4EBA\u5BA1\u6838\u5408\u89C4\u7387 {p3}\u3002", { p0: o.doneCount, p1: fmtDays(o.avgDays), p2: fmtRate(o.complianceRate), p3: fmtRate(o.reviewRate) }),
    (0, import_i18n4.t)("\u5728\u9014 {p0} \u5355\uFF0C\u5DF2\u903E\u671F {p1} \u5355\uFF0C\u8F83\u5927\u903E\u671F\u98CE\u9669 {p2} \u5355\u3002", { p0: o.runningCount, p1: o.runningOverdue, p2: o.runningRisk }),
    "",
    (0, import_i18n4.t)("\u4E8C\u3001\u73AF\u6BD4\u53D8\u5316"),
    ctx.previous ? (0, import_i18n4.t)("\u4E0E {p0} \u76F8\u6BD4\uFF1A\u5408\u89C4\u7387 {p1} \u4E2A\u767E\u5206\u70B9\uFF0C\u5E73\u5747\u7528\u65F6 {p2} \u5929\uFF0C\u529E\u7ED3\u91CF {p3} \u5355\uFF0C\u5728\u9014\u903E\u671F {p4} \u5355\u3002", { p0: ctx.previous.label, p1: signedRate(ctx.delta.complianceRate), p2: signed(ctx.delta.avgDays), p3: signed(ctx.delta.doneCount), p4: signed(ctx.delta.runningOverdue) }) : (0, import_i18n4.t)("\u6CA1\u6709\u4E0A\u4E00\u5468\u671F\u7684\u6570\u636E\uFF0C\u672C\u671F\u4E0D\u505A\u73AF\u6BD4\u3002"),
    "",
    (0, import_i18n4.t)("\u4E09\u3001\u5F02\u5E38\u6D41\u7A0B\u7C7B\u578B\uFF08{p0} \u4E2A\uFF09", { p0: ctx.abnormal.length }),
    ...ctx.abnormal.length ? ctx.abnormal.map((a, i) => `${i + 1}. ${a.flowType}\uFF08${a.system}\uFF09\uFF1A${a.reasons.join((0, import_i18n4.t)("\uFF1B"))}`) : [(0, import_i18n4.t)("\u65E0")],
    "",
    (0, import_i18n4.t)("\u56DB\u3001\u5728\u9014\u5DF2\u903E\u671F\uFF08{p0} \u5355\uFF0C\u6309\u8D85\u65F6\u5929\u6570\u5217\u524D 10\uFF09", { p0: overdue.length }),
    ...overdue.length ? overdue.slice(0, 10).map((f, i) => (0, import_i18n4.t)("{n}. [{sys}] {no} {type}\uFF1A\u5728\u9014 {days} \u5929\uFF0C\u8D85\u65F6 {over} \u5929\uFF0C\u5F53\u524D\u300C{node}\u300D{handler}", { n: i + 1, sys: f.system, no: f.flowNo, type: f.flowType, days: fmtDays(f.days), over: fmtDays(f.overdueDays), node: f.currentNode || "-", handler: f.currentHandler })) : [(0, import_i18n4.t)("\u65E0")],
    ...ctx.summary.trim() ? ["", (0, import_i18n4.t)("\u4E94\u3001\u5C0F\u7ED3"), ctx.summary.trim()] : []
  ].join("\n");
  const body = [
    `<h1>${esc(subject)}</h1><p class="sub">${esc((0, import_i18n4.t)("\u7EDF\u8BA1\u5468\u671F {p0} \xB7 \u6570\u636E\u622A\u81F3 {p1}", { p0: ctx.period.label, p1: ymd(ctx.period.asOf) }))}</p>`,
    `<h2>${esc((0, import_i18n4.t)("\u5173\u952E\u6570\u5B57"))}</h2>${kpis(ctx)}`,
    `<h2>${esc((0, import_i18n4.t)("\u6309\u5927\u7C7B"))}</h2>${typeTable(ctx.result.byCategory, false, ctx.thresholds.minComplianceRate)}`,
    `<h2>${esc((0, import_i18n4.t)("\u73AF\u6BD4\u53D8\u5316"))}</h2><p>${esc(ctx.previous ? (0, import_i18n4.t)("\u5BF9\u6BD4\u5468\u671F\uFF1A{p0}", { p0: ctx.previous.label }) : (0, import_i18n4.t)("\u6CA1\u6709\u4E0A\u4E00\u5468\u671F\u7684\u6570\u636E\uFF0C\u672C\u671F\u4E0D\u505A\u73AF\u6BD4\u3002"))}</p>${compareTable(ctx.compare)}`,
    `<h2>${esc((0, import_i18n4.t)("\u5F02\u5E38\u6D41\u7A0B\u7C7B\u578B"))}</h2>${table([(0, import_i18n4.t)("\u6D41\u7A0B\u7EC6\u7C7B"), (0, import_i18n4.t)("\u7CFB\u7EDF"), (0, import_i18n4.t)("\u5F02\u5E38\u539F\u56E0"), (0, import_i18n4.t)("\u8017\u65F6\u6700\u957F\u7684\u8282\u70B9")], ctx.abnormal.map((a) => ({ bad: true, cells: [a.flowType, a.system, a.reasons.join((0, import_i18n4.t)("\uFF1B")), a.analysis.longestNode ? `${a.analysis.longestNode}\uFF08${fmtDays(a.analysis.nodes[0]?.avgDays)}\uFF09` : "-"] })), (0, import_i18n4.t)("\u672C\u671F\u6CA1\u6709\u5F02\u5E38\u6D41\u7A0B\u7C7B\u578B"))}`,
    `<h2>${esc((0, import_i18n4.t)("\u4E2A\u4EBA\u5BA1\u6838\u5408\u89C4\u7387"))}</h2><h3>${esc((0, import_i18n4.t)("\u9760\u524D"))}</h3>${rankTable(top, (0, import_i18n4.t)("\u5BA1\u6838\u6B21\u6570"))}<h3>${esc((0, import_i18n4.t)("\u9760\u540E"))}</h3>${rankTable(bottom, (0, import_i18n4.t)("\u5BA1\u6838\u6B21\u6570"))}<p class="note">${esc((0, import_i18n4.t)("\u53EA\u5217\u5BA1\u6838\u6B21\u6570\u4E0D\u5C11\u4E8E 3 \u6B21\u7684\u4EBA\uFF1B\u5B8C\u6574\u6392\u540D\u89C1\u9644\u4EF6\u3002"))}</p>`,
    `<h2>${esc((0, import_i18n4.t)("\u5728\u9014\u5DF2\u903E\u671F"))}</h2>${runningTable(overdue.slice(0, 30), reasonOf)}`,
    `<h2>${esc((0, import_i18n4.t)("\u8D85\u65F6\u539F\u56E0"))}</h2>${reasonsBlock(ctx)}`,
    ctx.summary.trim() ? `<h2>${esc((0, import_i18n4.t)("\u5C0F\u7ED3"))}</h2><p class="pre">${esc(ctx.summary.trim())}</p>` : ""
  ].join("");
  return { subject, text: text2, html: page(subject, body) };
}
function monthlyMailText(ctx) {
  const o = ctx.result.overall;
  return [
    (0, import_i18n4.t)("\u5404\u4F4D\u597D\uFF1A"),
    "",
    (0, import_i18n4.t)("{p0} \u7EBF\u4E0A\u6D41\u7A0B\u65F6\u6548\u8FBE\u6210\u60C5\u51B5\u6708\u5EA6\u5206\u6790\u62A5\u544A\u89C1\u9644\u4EF6\uFF08PDF \u62A5\u544A\u548C\u660E\u7EC6\u8868\uFF09\u3002", { p0: ctx.period.label }),
    "",
    (0, import_i18n4.t)("\u672C\u6708\u529E\u7ED3 {p0} \u5355\uFF0C\u5E73\u5747\u7528\u65F6 {p1} \u5929\uFF0C\u6D41\u7A0B\u65F6\u6548\u5408\u89C4\u7387 {p2}\uFF0C\u4E2A\u4EBA\u5BA1\u6838\u5408\u89C4\u7387 {p3}\uFF1B\u5728\u9014 {p4} \u5355\uFF0C\u5DF2\u903E\u671F {p5} \u5355\u3002", { p0: o.doneCount, p1: fmtDays(o.avgDays), p2: fmtRate(o.complianceRate), p3: fmtRate(o.reviewRate), p4: o.runningCount, p5: o.runningOverdue }),
    (0, import_i18n4.t)("\u5F02\u5E38\u6D41\u7A0B\u7C7B\u578B {p0} \u4E2A\uFF0C\u672C\u5E74\u5EA6\u5728\u9014\u8D85\u65F6\u672A\u529E\u7ED3 {p1} \u5355\uFF0C\u6539\u5584\u5EFA\u8BAE {p2} \u6761\u3002", { p0: ctx.abnormal.length, p1: ctx.yearOverdue.length, p2: ctx.suggestions.length }),
    "",
    (0, import_i18n4.t)("\u8BF7\u5404\u90E8\u95E8\u5BF9\u7167\u62A5\u544A\u91CC\u7684\u5F02\u5E38\u6D41\u7A0B\u548C\u6539\u5584\u5EFA\u8BAE\u5B89\u6392\u6574\u6539\uFF0C\u6539\u5584\u5EFA\u8BAE\u5DF2\u8BB0\u5165\u6539\u5584\u53F0\u8D26\uFF0C\u5230\u671F\u524D\u4F1A\u4E0E\u8D23\u4EFB\u4EBA\u786E\u8BA4\u3002")
  ].join("\n");
}
function monthlyReportHtml(ctx) {
  const title = (0, import_i18n4.t)("\u7EBF\u4E0A\u6D41\u7A0B\u65F6\u6548\u6708\u5EA6\u5206\u6790\u62A5\u544A\uFF08{p0}\uFF09", { p0: ctx.period.label });
  const reasonOf = new Map(ctx.cases.map((c) => [c.key, c]));
  const th = ctx.thresholds;
  const catBars = svgBars(ctx.result.byCategory.map((c) => ({ label: c.category, value: c.complianceRate, text: fmtRate(c.complianceRate), warn: c.complianceRate !== null && c.complianceRate < th.minComplianceRate })), { max: 1, mark: { value: th.minComplianceRate, label: fmtRate(th.minComplianceRate) } });
  const typed = ctx.result.byType.filter((t) => t.doneCount > 0 && t.avgDays !== null).sort((a, b) => b.avgDays - a.avgDays).slice(0, 14);
  const typeBars = svgBars(typed.map((t) => ({ label: t.flowType, value: t.avgDays, text: (0, import_i18n4.t)("{p0} \u5929", { p0: fmtDays(t.avgDays) }), warn: t.limitDays !== null && t.avgDays > t.limitDays })));
  const rateLine = svgLine(ctx.trend.map((p) => ({ label: p.label, value: p.complianceRate, text: fmtRate(p.complianceRate) })), { min: Math.min(0.5, ...ctx.trend.map((p) => p.complianceRate ?? 1)), max: 1 });
  const dayLine = svgLine(ctx.trend.map((p) => ({ label: p.label, value: p.avgDays, text: fmtDays(p.avgDays) })), { color: "#f59e0b", min: 0 });
  const body = [
    `<h1>${esc(title)}</h1><p class="sub">${esc((0, import_i18n4.t)("\u7EDF\u8BA1\u5468\u671F {p0} \xB7 \u6570\u636E\u622A\u81F3 {p1} \xB7 \u751F\u6210\u4E8E {p2}", { p0: ctx.period.label, p1: ymd(ctx.period.asOf), p2: ymd(ctx.generatedAt) }))}</p>`,
    `<h2>${esc((0, import_i18n4.t)("\u4E00\u3001\u6574\u4F53\u6570\u636E"))}</h2>${kpis(ctx)}<p class="note">${esc(ctx.previous ? (0, import_i18n4.t)("\u73AF\u6BD4\u5BF9\u8C61\uFF1A{p0}", { p0: ctx.previous.label }) : (0, import_i18n4.t)("\u6CA1\u6709\u4E0A\u4E00\u5468\u671F\u7684\u6570\u636E\uFF0C\u672C\u671F\u4E0D\u505A\u73AF\u6BD4\u3002"))}</p>`,
    `<h3>${esc((0, import_i18n4.t)("\u5404\u5927\u7C7B\u5408\u89C4\u7387"))}</h3>${catBars}${typeTable(ctx.result.byCategory, false, ctx.thresholds.minComplianceRate)}`,
    `<h3>${esc((0, import_i18n4.t)("\u5408\u89C4\u7387\u4E0E\u5E73\u5747\u7528\u65F6\u8D8B\u52BF"))}</h3>${ctx.trend.length > 1 ? `${rateLine}${dayLine}` : `<p class="note">${esc((0, import_i18n4.t)("\u4FDD\u5B58\u4E24\u4E2A\u4EE5\u4E0A\u5468\u671F\u540E\u663E\u793A\u8D8B\u52BF\u3002"))}</p>`}`,
    `<h2>${esc((0, import_i18n4.t)("\u4E8C\u3001\u5404\u7C7B\u6D41\u7A0B\u5E73\u5747\u7528\u65F6\u4E0E\u5408\u89C4\u7387"))}</h2>${typeBars}${typeTable(ctx.result.byType.filter((t) => t.doneCount > 0 || t.runningCount > 0), true, th.minComplianceRate)}`,
    `<h2>${esc((0, import_i18n4.t)("\u4E09\u3001\u73AF\u6BD4\u4E0E\u5F02\u5E38\u6D41\u7A0B\u7C7B\u578B"))}</h2><p>${esc((0, import_i18n4.t)("\u5224\u5B9A\u6807\u51C6\uFF1A\u5E73\u5747\u7528\u65F6\u73AF\u6BD4\u589E\u52A0\u8D85\u8FC7 {p0} \u5929\uFF0C\u6216\u65F6\u6548\u5408\u89C4\u7387\u4F4E\u4E8E {p1}\u3002", { p0: th.avgIncreaseDays, p1: fmtRate(th.minComplianceRate) }))}</p>${compareTable(ctx.compare)}`,
    `<h2>${esc((0, import_i18n4.t)("\u56DB\u3001\u5F02\u5E38\u6D41\u7A0B\u7684\u8282\u70B9\u5206\u6790"))}</h2>${ctx.abnormal.length ? ctx.abnormal.map((a) => `<h3>${esc(`${a.flowType}\uFF08${a.system}\uFF09`)} <span class="tag">${esc(a.reasons.join((0, import_i18n4.t)("\uFF1B")))}</span></h3><p>${esc(a.analysis.longestNode ? (0, import_i18n4.t)("\u8017\u65F6\u6700\u957F\u7684\u8282\u70B9\uFF1A{p0}", { p0: a.analysis.longestNode }) : (0, import_i18n4.t)("\u6CA1\u6709\u8282\u70B9\u660E\u7EC6\uFF0C\u65E0\u6CD5\u5B9A\u4F4D"))}</p>${nodeTable(a.analysis)}`).join("") : `<p class="note">${esc((0, import_i18n4.t)("\u672C\u671F\u6CA1\u6709\u5F02\u5E38\u6D41\u7A0B\u7C7B\u578B"))}</p>`}`,
    `<h2>${esc((0, import_i18n4.t)("\u4E94\u3001\u4E2A\u4EBA\u5BA1\u6838\u5408\u89C4\u7387\u6392\u540D"))}</h2>${rankTable(ctx.result.reviewerRank, (0, import_i18n4.t)("\u5BA1\u6838\u6B21\u6570"))}`,
    `<h2>${esc((0, import_i18n4.t)("\u516D\u3001\u53D1\u8D77\u4EBA\u5408\u89C4\u7387\u6392\u540D"))}</h2>${rankTable(ctx.result.initiatorRank, (0, import_i18n4.t)("\u529E\u7ED3\u6570"))}`,
    `<h2>${esc((0, import_i18n4.t)("\u4E03\u3001\u672C\u5E74\u5EA6\u8D85\u65F6\u672A\u529E\u7ED3\u5728\u9014\u6D41\u7A0B"))}</h2>${runningTable(ctx.yearOverdue, reasonOf)}`,
    `<h2>${esc((0, import_i18n4.t)("\u516B\u3001\u8D85\u65F6\u539F\u56E0\u5206\u6790"))}</h2>${reasonsBlock(ctx)}`,
    `<h2>${esc((0, import_i18n4.t)("\u4E5D\u3001\u6708\u5EA6\u603B\u7ED3"))}</h2><p class="pre">${esc(ctx.summary.trim() || ruleSummary(ctx))}</p>`,
    `<h2>${esc((0, import_i18n4.t)("\u5341\u3001\u6539\u5584\u5EFA\u8BAE"))}</h2>${suggestionTable(ctx.suggestions)}`
  ].join("");
  return page(title, body);
}
var dt = (t) => t ? new Date(t) : "";
function flowSheet(name, flows) {
  return {
    name,
    headers: [(0, import_i18n4.t)("\u7CFB\u7EDF"), (0, import_i18n4.t)("\u5355\u53F7"), (0, import_i18n4.t)("\u6D41\u7A0B\u540D\u79F0"), (0, import_i18n4.t)("\u6807\u9898"), (0, import_i18n4.t)("\u5927\u7C7B"), (0, import_i18n4.t)("\u6D41\u7A0B\u7EC6\u7C7B"), (0, import_i18n4.t)("\u53D1\u8D77\u4EBA"), (0, import_i18n4.t)("\u90E8\u95E8"), (0, import_i18n4.t)("\u72B6\u6001"), (0, import_i18n4.t)("\u5F00\u59CB\u65F6\u95F4"), (0, import_i18n4.t)("\u7ED3\u675F\u65F6\u95F4"), (0, import_i18n4.t)("\u7528\u65F6\uFF08\u5929\uFF09"), (0, import_i18n4.t)("\u65F6\u6548\u8981\u6C42\uFF08\u5929\uFF09"), (0, import_i18n4.t)("\u662F\u5426\u8D85\u65F6"), (0, import_i18n4.t)("\u5728\u9014\u6807\u7B7E"), (0, import_i18n4.t)("\u8D85\u51FA\uFF08\u5929\uFF09"), (0, import_i18n4.t)("\u5F53\u524D\u8282\u70B9"), (0, import_i18n4.t)("\u5F53\u524D\u5904\u7406\u4EBA"), (0, import_i18n4.t)("\u8282\u70B9\u505C\u7559\uFF08\u5929\uFF09"), (0, import_i18n4.t)("\u5907\u6CE8")],
    rows: flows.map((f) => [f.system, f.flowNo, f.flowName, f.title, f.category, f.flowType, f.initiator, f.dept, f.status === "done" ? (0, import_i18n4.t)("\u5DF2\u529E\u7ED3") : (0, import_i18n4.t)("\u5728\u9014"), dt(f.startAt), dt(f.endAt), f.days, f.limitDays ?? "", f.status === "done" ? yesNo(f.overtime) : "", f.status === "running" ? runLabel(f) : "", f.overdueDays || "", f.currentNode, f.currentHandler, f.currentNodeDays ?? "", f.approx ? (0, import_i18n4.t)("\u6CA1\u6709\u8282\u70B9\u660E\u7EC6\uFF0C\u6309\u7ED3\u675F\u51CF\u5F00\u59CB\u4F30\u7B97") : ""])
  };
}
function typeSheet(name, list) {
  return {
    name,
    headers: [(0, import_i18n4.t)("\u5927\u7C7B"), (0, import_i18n4.t)("\u6D41\u7A0B\u7EC6\u7C7B"), (0, import_i18n4.t)("\u7CFB\u7EDF"), (0, import_i18n4.t)("\u529E\u7ED3"), (0, import_i18n4.t)("\u5E73\u5747\u7528\u65F6\uFF08\u5929\uFF09"), (0, import_i18n4.t)("\u65F6\u6548\u8981\u6C42\uFF08\u5929\uFF09"), (0, import_i18n4.t)("\u53C2\u4E0E\u5224\u5B9A"), (0, import_i18n4.t)("\u8D85\u65F6"), (0, import_i18n4.t)("\u5408\u89C4\u7387"), (0, import_i18n4.t)("\u5728\u9014"), (0, import_i18n4.t)("\u5728\u9014\u903E\u671F"), (0, import_i18n4.t)("\u5728\u9014\u8D85\u65F6\u5360\u6BD4")],
    rows: list.map((t) => [t.category, t.flowType, t.system, t.doneCount, t.avgDays ?? "", t.limitDays ?? "", t.judged, t.overtime, fmtRate(t.complianceRate), t.runningCount, t.runningOverdue, fmtRate(t.runningOverdueRate)])
  };
}
function rankSheet(name, list, countLabel) {
  return {
    name,
    headers: [(0, import_i18n4.t)("\u6392\u540D"), (0, import_i18n4.t)("\u59D3\u540D"), (0, import_i18n4.t)("\u90E8\u95E8"), (0, import_i18n4.t)("\u8EAB\u4EFD"), countLabel, (0, import_i18n4.t)("\u5408\u89C4"), (0, import_i18n4.t)("\u5408\u89C4\u7387"), (0, import_i18n4.t)("\u5E73\u5747\u7528\u65F6")],
    rows: list.map((p) => [p.rank, p.name, p.dept, p.identity, p.count, p.compliant, fmtRate(p.rate), p.avgDays ?? ""])
  };
}
function reviewSheet(name, list) {
  return {
    name,
    headers: [(0, import_i18n4.t)("\u7CFB\u7EDF"), (0, import_i18n4.t)("\u5355\u53F7"), (0, import_i18n4.t)("\u6D41\u7A0B\u7EC6\u7C7B"), (0, import_i18n4.t)("\u8282\u70B9"), (0, import_i18n4.t)("\u5BA1\u6838\u4EBA"), (0, import_i18n4.t)("\u8EAB\u4EFD"), (0, import_i18n4.t)("\u90E8\u95E8"), (0, import_i18n4.t)("\u5230\u8FBE\u65F6\u95F4"), (0, import_i18n4.t)("\u5B8C\u6210\u65F6\u95F4"), (0, import_i18n4.t)("\u7528\u65F6"), (0, import_i18n4.t)("\u5355\u4F4D"), (0, import_i18n4.t)("\u65F6\u6548\u8981\u6C42"), (0, import_i18n4.t)("\u662F\u5426\u5408\u89C4")],
    rows: list.map((r) => [r.system, r.flowNo, r.flowType, r.node, r.handler, r.identity, r.dept, dt(r.startAt), dt(r.endAt), r.days, r.unit, r.limit, yesNo(r.compliant)])
  };
}
function detailSheets(ctx) {
  const res = ctx.result;
  const o = res.overall;
  const sheets = [
    {
      name: (0, import_i18n4.t)("\u6C47\u603B"),
      headers: [(0, import_i18n4.t)("\u6307\u6807"), (0, import_i18n4.t)("\u672C\u671F"), (0, import_i18n4.t)("\u73AF\u6BD4")],
      rows: [
        [(0, import_i18n4.t)("\u7EDF\u8BA1\u5468\u671F"), ctx.period.label, ctx.previous?.label ?? ""],
        [(0, import_i18n4.t)("\u529E\u7ED3\u6570"), o.doneCount, ctx.delta.doneCount ?? ""],
        [(0, import_i18n4.t)("\u5E73\u5747\u7528\u65F6\uFF08\u5929\uFF09"), o.avgDays ?? "", ctx.delta.avgDays ?? ""],
        [(0, import_i18n4.t)("\u6D41\u7A0B\u65F6\u6548\u5408\u89C4\u7387"), fmtRate(o.complianceRate), ctx.delta.complianceRate == null ? "" : (0, import_i18n4.t)("{p0} \u4E2A\u767E\u5206\u70B9", { p0: signedRate(ctx.delta.complianceRate) })],
        [(0, import_i18n4.t)("\u5728\u9014\u6570"), o.runningCount, ctx.delta.runningCount ?? ""],
        [(0, import_i18n4.t)("\u5DF2\u903E\u671F"), o.runningOverdue, ctx.delta.runningOverdue ?? ""],
        [(0, import_i18n4.t)("\u8F83\u5927\u903E\u671F\u98CE\u9669"), o.runningRisk, ""],
        [(0, import_i18n4.t)("\u4E2A\u4EBA\u5BA1\u6838\u6B21\u6570"), o.reviewCount, ""],
        [(0, import_i18n4.t)("\u4E2A\u4EBA\u5BA1\u6838\u5408\u89C4\u7387"), fmtRate(o.reviewRate), ctx.delta.reviewRate == null ? "" : (0, import_i18n4.t)("{p0} \u4E2A\u767E\u5206\u70B9", { p0: signedRate(ctx.delta.reviewRate) })]
      ]
    },
    typeSheet((0, import_i18n4.t)("\u6309\u5927\u7C7B"), res.byCategory),
    typeSheet((0, import_i18n4.t)("\u6309\u7EC6\u7C7B"), res.byType),
    {
      name: (0, import_i18n4.t)("\u73AF\u6BD4"),
      headers: [(0, import_i18n4.t)("\u5927\u7C7B"), (0, import_i18n4.t)("\u6D41\u7A0B\u7EC6\u7C7B"), (0, import_i18n4.t)("\u7CFB\u7EDF"), (0, import_i18n4.t)("\u529E\u7ED3"), (0, import_i18n4.t)("\u5E73\u5747\u7528\u65F6\uFF08\u5929\uFF09"), (0, import_i18n4.t)("\u4E0A\u671F\u5E73\u5747\u7528\u65F6"), (0, import_i18n4.t)("\u7528\u65F6\u53D8\u5316"), (0, import_i18n4.t)("\u5408\u89C4\u7387"), (0, import_i18n4.t)("\u4E0A\u671F\u5408\u89C4\u7387"), (0, import_i18n4.t)("\u5408\u89C4\u7387\u53D8\u5316\uFF08\u767E\u5206\u70B9\uFF09"), (0, import_i18n4.t)("\u662F\u5426\u5F02\u5E38"), (0, import_i18n4.t)("\u5F02\u5E38\u539F\u56E0")],
      rows: ctx.compare.map((t) => [t.category, t.flowType, t.system, t.doneCount, t.avgDays ?? "", t.prevAvgDays ?? "", t.avgDelta ?? "", fmtRate(t.complianceRate), fmtRate(t.prevComplianceRate), t.rateDelta == null ? "" : signedRate(t.rateDelta), yesNo(t.abnormal), t.reasons.join((0, import_i18n4.t)("\uFF1B"))])
    },
    {
      name: (0, import_i18n4.t)("\u5F02\u5E38\u8282\u70B9"),
      headers: [(0, import_i18n4.t)("\u6D41\u7A0B\u7EC6\u7C7B"), (0, import_i18n4.t)("\u7CFB\u7EDF"), (0, import_i18n4.t)("\u8282\u70B9"), (0, import_i18n4.t)("\u5185\u5916\u90E8"), (0, import_i18n4.t)("\u5904\u7406\u6B21\u6570"), (0, import_i18n4.t)("\u5E73\u5747\u8017\u65F6\uFF08\u5929\uFF09"), (0, import_i18n4.t)("\u6700\u957F\uFF08\u5929\uFF09"), (0, import_i18n4.t)("\u5E73\u5747\u7B49\u5F85\uFF08\u5929\uFF09"), (0, import_i18n4.t)("\u8017\u65F6\u5360\u6BD4"), (0, import_i18n4.t)("\u5728\u9014\u505C\u7559\u6570"), (0, import_i18n4.t)("\u5E73\u5747\u505C\u7559\uFF08\u5929\uFF09"), (0, import_i18n4.t)("\u662F\u5426\u6700\u957F\u8282\u70B9")],
      rows: ctx.abnormal.flatMap((a) => a.analysis.nodes.map((n) => [a.flowType, a.system, n.node, n.internal == null ? (0, import_i18n4.t)("\u672A\u767B\u8BB0") : n.internal ? (0, import_i18n4.t)("\u5185\u90E8") : (0, import_i18n4.t)("\u5916\u90E8"), n.count, n.avgDays, n.maxDays, n.avgWaitDays, fmtRate(n.share), n.stuckCount, n.avgStuckDays ?? "", yesNo(n.node === a.analysis.longestNode)]))
    },
    rankSheet((0, import_i18n4.t)("\u5BA1\u6838\u4EBA\u6392\u540D"), res.reviewerRank, (0, import_i18n4.t)("\u5BA1\u6838\u6B21\u6570")),
    rankSheet((0, import_i18n4.t)("\u53D1\u8D77\u4EBA\u6392\u540D"), res.initiatorRank, (0, import_i18n4.t)("\u529E\u7ED3\u6570")),
    flowSheet((0, import_i18n4.t)("\u8D85\u65F6\u6D41\u7A0B"), res.flows.filter((f) => f.status === "done" && f.inPeriod && f.overtime === true)),
    flowSheet((0, import_i18n4.t)("\u5728\u9014\u6D41\u7A0B"), res.flows.filter((f) => f.status === "running").sort((a, b) => b.overdueDays - a.overdueDays)),
    {
      name: (0, import_i18n4.t)("\u8D85\u65F6\u539F\u56E0"),
      headers: [(0, import_i18n4.t)("\u7CFB\u7EDF"), (0, import_i18n4.t)("\u5355\u53F7"), (0, import_i18n4.t)("\u6D41\u7A0B\u7EC6\u7C7B"), (0, import_i18n4.t)("\u7C7B\u578B"), (0, import_i18n4.t)("\u8D85\u51FA\uFF08\u5929\uFF09"), (0, import_i18n4.t)("\u8D23\u4EFB\u4EBA"), (0, import_i18n4.t)("\u8D85\u65F6\u539F\u56E0"), (0, import_i18n4.t)("\u539F\u56E0\u7C7B\u522B")],
      rows: ctx.cases.map((c) => [c.system, c.flowNo, c.flowType, c.kind === "running" ? (0, import_i18n4.t)("\u5728\u9014\u5DF2\u903E\u671F") : (0, import_i18n4.t)("\u5DF2\u529E\u7ED3\u8D85\u65F6"), c.overdueDays, c.owner, c.reason, c.reason.trim() && c.categoryId ? categoryLabel(c.categoryId) : ""])
    }
  ];
  if (ctx.period.kind === "monthly") {
    sheets.push(flowSheet((0, import_i18n4.t)("\u672C\u5E74\u5728\u9014\u8D85\u65F6"), ctx.yearOverdue));
    sheets.push({
      name: (0, import_i18n4.t)("\u6539\u5584\u5EFA\u8BAE"),
      headers: [(0, import_i18n4.t)("\u5EFA\u8BAE\u4E8B\u9879"), (0, import_i18n4.t)("\u8D23\u4EFB\u90E8\u95E8"), (0, import_i18n4.t)("\u8D23\u4EFB\u4EBA"), (0, import_i18n4.t)("\u6267\u884C\u8981\u6C42"), (0, import_i18n4.t)("\u6267\u884C\u671F\u9650"), (0, import_i18n4.t)("\u9A8C\u6536\u8981\u6C42")],
      rows: ctx.suggestions.map((s) => [s.item, s.dept, s.owner, s.requirement, s.deadline, s.acceptance])
    });
  }
  sheets.push(reviewSheet((0, import_i18n4.t)("\u4E2A\u4EBA\u5BA1\u6838\u660E\u7EC6"), res.reviews));
  sheets.push(flowSheet((0, import_i18n4.t)("\u529E\u7ED3\u660E\u7EC6"), res.flows.filter((f) => f.status === "done" && f.inPeriod)));
  return sheets;
}

// ../../../totalclaw-solutions/solutions/workbench-flow-sla/src/main/services/flowSla/proc.ts
var import_i18n5 = require("npm:@totalclaw/i18n");
var TICK_MS = 10 * 60 * 1e3;
var FIRST_TICK_MS = 30 * 1e3;
var MAX_CLOSED = 200;
var iso = (ms) => new Date(ms).toISOString();
var pad3 = (n) => String(n).padStart(2, "0");
function localDay(ms) {
  const d = new Date(ms);
  return `${d.getFullYear()}-${pad3(d.getMonth() + 1)}-${pad3(d.getDate())}`;
}
function dayMs(day) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(day);
  return m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])).getTime() : NaN;
}
function daysUntil(deadline, nowMs) {
  const d = dayMs(deadline);
  if (!Number.isFinite(d)) return null;
  return Math.round((d - dayMs(localDay(nowMs))) / DAY);
}
var nextFollowAt = (nowMs, intervalDays) => iso(nowMs + Math.max(1, intervalDays) * DAY);
function syncTracking(existing, input) {
  const { result, statusByKey, roster, rules, nowMs } = input;
  const emailOf = new Map(roster.map((r) => [r.name, r.email]));
  const flowByKey = new Map(result.flows.map((f) => [`${f.system}|${f.flowNo}`, f]));
  const now = iso(nowMs);
  let added = 0;
  let closed = 0;
  const out = [];
  const openKeys = /* @__PURE__ */ new Set();
  for (const item of existing) {
    if (item.closedAt) {
      out.push(item);
      continue;
    }
    const f = flowByKey.get(item.key);
    const status = statusByKey.get(item.key);
    const close = (reason) => {
      closed += 1;
      out.push({ ...item, closedAt: now, closeReason: reason, notes: [...item.notes, { at: now, text: reason, kind: "system" }] });
    };
    if (status === "done") {
      close((0, import_i18n5.t)("\u6700\u65B0\u5BFC\u5165\u7684\u62A5\u8868\u663E\u793A\u6D41\u7A0B\u5DF2\u529E\u7ED3"));
      continue;
    }
    if (status === "terminated") {
      close((0, import_i18n5.t)("\u6700\u65B0\u5BFC\u5165\u7684\u62A5\u8868\u663E\u793A\u6D41\u7A0B\u5DF2\u7EC8\u6B62"));
      continue;
    }
    if (f && f.status === "running" && f.runningLabel !== "overdue") {
      close((0, import_i18n5.t)("\u6309\u5F53\u524D\u65F6\u6548\u89C4\u5219\u4E0D\u518D\u903E\u671F"));
      continue;
    }
    openKeys.add(item.key);
    if (!f) {
      out.push(item);
      continue;
    }
    const handler = f.currentHandler || item.handler;
    out.push({
      ...item,
      flowName: f.flowName,
      title: f.title,
      flowType: f.flowType,
      category: f.category,
      initiator: f.initiator,
      handler,
      handlerEmail: emailOf.get(handler) || (handler === item.handler ? item.handlerEmail : ""),
      currentNode: f.currentNode || item.currentNode,
      days: f.days,
      limitDays: f.limitDays,
      overdueDays: f.overdueDays,
      currentNodeDays: f.currentNodeDays,
      intervalDays: followUpIntervalDays(f.category, rules)
    });
  }
  for (const f of result.flows) {
    if (f.status !== "running" || f.runningLabel !== "overdue") continue;
    const key = `${f.system}|${f.flowNo}`;
    if (openKeys.has(key)) continue;
    const interval = followUpIntervalDays(f.category, rules);
    const handler = f.currentHandler || f.initiator;
    added += 1;
    out.unshift({
      key,
      system: f.system,
      flowNo: f.flowNo,
      flowName: f.flowName,
      title: f.title,
      flowType: f.flowType,
      category: f.category,
      initiator: f.initiator,
      handler,
      handlerEmail: emailOf.get(handler) || "",
      currentNode: f.currentNode,
      startAt: f.startAt,
      days: f.days,
      limitDays: f.limitDays,
      overdueDays: f.overdueDays,
      currentNodeDays: f.currentNodeDays,
      intervalDays: interval,
      firstSeenAt: now,
      lastFollowAt: "",
      nextFollowAt: nextFollowAt(nowMs, interval),
      notifiedFor: "",
      notes: [{ at: now, text: (0, import_i18n5.t)("\u8FDB\u5165\u8DDF\u8FDB\u540D\u5355\uFF1A\u5728\u9014 {p0} \u5929\uFF0C\u8D85\u51FA\u65F6\u6548\u8981\u6C42 {p1} \u5929", { p0: f.days, p1: f.overdueDays }), kind: "system" }],
      closedAt: "",
      closeReason: ""
    });
  }
  const open = out.filter((x) => !x.closedAt);
  const reopened = new Set(open.map((x) => x.key));
  const closedItems = out.filter((x) => x.closedAt && !reopened.has(x.key)).sort((a, b) => b.closedAt.localeCompare(a.closedAt)).slice(0, MAX_CLOSED);
  open.sort((a, b) => a.nextFollowAt.localeCompare(b.nextFollowAt) || b.overdueDays - a.overdueDays);
  return { items: [...open, ...closedItems], added, closed };
}
function dueFollowUps(tracking, nowMs) {
  const now = iso(nowMs);
  return tracking.filter((t) => !t.closedAt && t.nextFollowAt && t.nextFollowAt <= now && t.notifiedFor !== t.nextFollowAt);
}
function ledgerStatus(item, nowMs) {
  if (item.status === "done" || item.status === "archived") return item.status;
  const left = daysUntil(item.deadline, nowMs);
  return left !== null && left < 0 ? "overdue" : "doing";
}
function ledgerActions(ledger, nowMs, remindDays) {
  const remind = [];
  const escalate = [];
  for (const it of ledger) {
    if (it.status === "done" || it.status === "archived") continue;
    const left = daysUntil(it.deadline, nowMs);
    if (left === null) continue;
    if (left < 0) {
      if (it.escalatedFor !== it.deadline) escalate.push(it);
    } else if (left <= remindDays && it.remindedFor !== it.deadline) remind.push(it);
  }
  return { remind, escalate };
}
var FlowSlaProc = class {
  constructor(deps) {
    this.deps = deps;
  }
  timer = null;
  firstTimer = null;
  ticking = false;
  nowMs() {
    return this.deps.now?.() ?? Date.now();
  }
  start() {
    if (this.timer) return;
    this.firstTimer = setTimeout(() => {
      void this.tick();
    }, FIRST_TICK_MS);
    if (typeof this.firstTimer.unref === "function") this.firstTimer.unref();
    this.timer = setInterval(() => {
      void this.tick();
    }, TICK_MS);
    if (typeof this.timer.unref === "function") this.timer.unref();
  }
  stop() {
    if (this.firstTimer) clearTimeout(this.firstTimer);
    if (this.timer) clearInterval(this.timer);
    this.firstTimer = null;
    this.timer = null;
  }
  /** 一轮提醒；返回这一轮发出的提醒。两段互不影响 */
  async tick() {
    if (this.ticking) return [];
    this.ticking = true;
    const fired = [];
    try {
      try {
        fired.push(...this.runFollowUps());
      } catch (e) {
        this.deps.logger?.warn?.("follow-up reminders failed", { error: e?.message });
      }
      try {
        fired.push(...this.runLedger());
      } catch (e) {
        this.deps.logger?.warn?.("ledger reminders failed", { error: e?.message });
      }
      if (fired.length) this.deps.broadcast({ type: "state" });
    } finally {
      this.ticking = false;
    }
    return fired;
  }
  fire(type, title, body) {
    const ev = { id: newId("fsr"), at: iso(this.nowMs()), type, title, body };
    this.deps.store.update((s) => {
      s.reminders.unshift(ev);
    });
    this.deps.broadcast({ type: "reminder", payload: ev });
    try {
      this.deps.notify?.(title, body);
    } catch {
    }
    this.deps.logger?.info?.("reminder fired", { type, title });
    return ev;
  }
  runFollowUps() {
    const now = this.nowMs();
    const due = dueFollowUps(this.deps.store.read().tracking, now);
    if (!due.length) return [];
    const keys = new Set(due.map((d) => d.key));
    this.deps.store.update((s) => {
      for (const t of s.tracking) if (keys.has(t.key) && !t.closedAt) t.notifiedFor = t.nextFollowAt;
    });
    const lines = due.slice(0, 5).map((t) => (0, import_i18n5.t)("[{p0}] {p1} {p2}\uFF1A\u8D85\u65F6 {p3} \u5929\uFF0C\u5904\u7406\u4EBA {p4}", { p0: t.system, p1: t.flowNo, p2: t.flowType, p3: t.overdueDays, p4: t.handler || "-" }));
    const more = due.length > 5 ? [(0, import_i18n5.t)("\u2026\u2026 \u53E6\u6709 {p0} \u6761", { p0: due.length - 5 })] : [];
    return [this.fire("follow_up", (0, import_i18n5.t)("\u6709 {p0} \u6761\u5728\u9014\u6D41\u7A0B\u5230\u4E86\u8DDF\u8FDB\u65F6\u95F4", { p0: due.length }), [...lines, ...more].join("\n"))];
  }
  runLedger() {
    const now = this.nowMs();
    const store2 = this.deps.store;
    const remindDays = Math.max(0, Number(this.deps.remindDays()) || 0);
    const stale = store2.read().ledger.some((it) => ledgerStatus(it, now) !== it.status || ledgerStatus(it, now) === "overdue" && !it.escalated);
    if (stale) store2.update((s) => {
      for (const it of s.ledger) {
        it.status = ledgerStatus(it, now);
        if (it.status === "overdue") it.escalated = true;
      }
    });
    const { remind, escalate } = ledgerActions(store2.read().ledger, now, remindDays);
    const out = [];
    for (const it of remind) {
      const left = daysUntil(it.deadline, now) ?? 0;
      store2.update((s) => {
        const cur = s.ledger.find((x) => x.id === it.id);
        if (cur) cur.remindedFor = cur.deadline;
      });
      out.push(this.fire("ledger_due", (0, import_i18n5.t)("\u6539\u5584\u4E8B\u9879\u8FD8\u6709 {p0} \u5929\u5230\u671F\uFF0C\u8BF7\u4E0E\u8D23\u4EFB\u4EBA\u786E\u8BA4\u6267\u884C\u60C5\u51B5", { p0: left }), (0, import_i18n5.t)("{p0}\uFF08{p1} {p2}\uFF09\uFF0C\u6267\u884C\u671F\u9650 {p3}\u3002\u9A8C\u6536\u8981\u6C42\uFF1A{p4}", { p0: it.item, p1: it.dept || "-", p2: it.owner || "-", p3: it.deadline, p4: it.acceptance || "-" })));
    }
    for (const it of escalate) {
      const over = -(daysUntil(it.deadline, now) ?? 0);
      store2.update((s) => {
        const cur = s.ledger.find((x) => x.id === it.id);
        if (cur) {
          cur.escalatedFor = cur.deadline;
          cur.escalated = true;
          cur.status = "overdue";
        }
      });
      out.push(this.fire("ledger_overdue", (0, import_i18n5.t)("\u6539\u5584\u4E8B\u9879\u5DF2\u903E\u671F {p0} \u5929\uFF0C\u9700\u8981\u5347\u7EA7\u7763\u529E", { p0: over }), (0, import_i18n5.t)("{p0}\uFF08{p1} {p2}\uFF09\uFF0C\u6267\u884C\u671F\u9650 {p3}", { p0: it.item, p1: it.dept || "-", p2: it.owner || "-", p3: it.deadline })));
    }
    return out;
  }
};

// ../../../totalclaw-solutions/solutions/workbench-flow-sla/src/main/services/flowSla/prompts.ts
var CATEGORY_GUIDE = [
  "materials  - \u8D44\u6599\u4E0D\u5168\u9000\u56DE\uFF1A\u53D1\u8D77\u65F6\u8D44\u6599\u7F3A\u5931\u3001\u586B\u5199\u9519\u8BEF\uFF0C\u88AB\u9000\u56DE\u8865\u5145\u540E\u91CD\u65B0\u6D41\u8F6C",
  "absence    - \u5BA1\u6279\u4EBA\u51FA\u5DEE/\u4F11\u5047\uFF1A\u5BA1\u6279\u4EBA\u4E0D\u5728\u5C97\u3001\u5F00\u4F1A\u3001\u57F9\u8BAD\uFF0C\u6CA1\u6709\u4EE3\u7406\u4EBA",
  "cross_dept - \u8DE8\u90E8\u95E8\u6C9F\u901A\u7B49\u5F85\uFF1A\u9700\u8981\u5176\u4ED6\u90E8\u95E8\u786E\u8BA4\u3001\u4F1A\u7B7E\uFF0C\u6765\u56DE\u6C9F\u901A",
  "external   - \u5916\u90E8\u5355\u4F4D\u672A\u53CD\u9988\uFF1A\u7B49\u670D\u52A1\u5546\u3001\u4F9B\u5E94\u5546\u3001\u5BA2\u6237\u53CD\u9988\u3001\u76D6\u7AE0\u3001\u5BC4\u56DE\u8D44\u6599",
  "system     - \u7CFB\u7EDF/\u64CD\u4F5C\u95EE\u9898\uFF1A\u7CFB\u7EDF\u6545\u969C\u3001\u6CA1\u6536\u5230\u5F85\u529E\u63D0\u9192\u3001\u64CD\u4F5C\u4E0D\u719F\u3001\u9057\u6F0F",
  "design     - \u6D41\u7A0B\u8BBE\u8BA1\u73AF\u8282\u8FC7\u591A\uFF1A\u5BA1\u6279\u5C42\u7EA7\u591A\u3001\u8282\u70B9\u591A\u3001\u91CD\u590D\u5BA1\u6279",
  "other      - \u5176\u4ED6\uFF1A\u4EE5\u4E0A\u90FD\u4E0D\u662F"
];
function reasonClassifyPrompt(cases) {
  return [
    "You classify overtime reasons of business approval flows for a Chinese company.",
    'Return ONLY a JSON object: { "items": [ { "key": <key verbatim>, "category": <one category id> } ], "rootCauses": { <category id>: <one or two sentences in Simplified Chinese> } }',
    "Category ids and meanings (use the id, never invent a new one):",
    ...CATEGORY_GUIDE.map((x) => `  ${x}`),
    "Rules:",
    '- One element in "items" for every input line, with the key copied verbatim.',
    '- "rootCauses" has an entry only for categories that actually appear in "items".',
    "- A root cause explains the underlying cause shared by the reasons in that category. Do not write any number that is not in the input. Do not name a person.",
    "",
    "INPUT (key | flow type | reason):",
    ...cases.slice(0, 200).map((c) => `${c.key} | ${c.flowType} | ${c.reason.replace(/\s+/g, " ").slice(0, 300)}`)
  ].join("\n");
}
function summaryPrompt(kind, facts, names) {
  return [
    `You write the ${kind === "monthly" ? "monthly" : "weekly"} summary of an approval-flow timeliness report for a Chinese company, in Simplified Chinese.`,
    'Return ONLY a JSON object: { "summary": <text>, "suggestions": [ { "item": ..., "dept": ..., "owner": ..., "requirement": ..., "deadline": "YYYY-MM-DD" or "", "acceptance": ... } ] }',
    '"summary" has four paragraphs separated by a blank line, starting with \u3010\u6574\u4F53\u8868\u73B0\u3011\u3010\u5F02\u5E38\u8D8B\u52BF\u3011\u3010\u91CD\u70B9\u95EE\u9898\u3011\u3010\u8D23\u4EFB\u7EF4\u5EA6\u3011.',
    '"suggestions": 2 to 6 concrete improvement actions derived from the facts (item = what to improve, requirement = what exactly must be done, acceptance = how completion is checked).',
    "Hard rules:",
    "- Use ONLY the facts below. Every number you write must appear in the facts exactly as written; do not compute, round, sum or estimate anything.",
    '- "dept" and "owner" must be chosen from the lists below, or left as "" when unsure.',
    "- No greetings, no markdown.",
    "",
    `DEPARTMENTS: ${names.depts.slice(0, 40).join("\u3001") || "(none)"}`,
    `PEOPLE: ${names.people.slice(0, 60).join("\u3001") || "(none)"}`,
    "",
    "FACTS:",
    ...facts.map((f) => `- ${f}`)
  ].join("\n");
}

// ../../../totalclaw-solutions/solutions/workbench-flow-sla/src/main/ipc/flowSla.ipc.ts
var import_brandPaths = require("host:apps/desktop-shell/src/main/services/brandPaths.ts");
var store = new FlowSlaStore();
var proc = null;
function requireFound(v, what) {
  if (v == null) throw new Error((0, import_i18n6.t)("{p0}\u4E0D\u5B58\u5728\u6216\u5DF2\u5220\u9664", { p0: what }));
  return v;
}
function runCompute(data, rules, opt, aliases) {
  const { flows, original } = applyAliases(data.flows, aliases);
  const result = computeSla(flows, data.nodes, rules, opt);
  for (const f of result.flows) {
    const o = original.get(`${f.system}|${f.flowNo}`);
    if (o) f.flowName = o;
  }
  return result;
}
function registerFlowSlaHandlers(deps) {
  const logger = deps.logger;
  const win = () => deps.getMainWindow?.() ?? null;
  const broadcast = (event) => {
    try {
      win()?.webContents.send(import_ipc_contracts3.IPC_CHANNELS.WORKBENCH_FS_EVENT, event);
    } catch {
    }
  };
  const pushState = () => broadcast({ type: "state" });
  const nowIso = () => (/* @__PURE__ */ new Date()).toISOString();
  const { llmJson } = (0, import_workbenchLlm.createWorkbenchLlm)(deps, { logTag: "flow-sla", moduleModel: () => "" });
  const outputRoot = () => {
    const s = store.read().settings;
    return s.outputDir && (0, import_node_fs3.existsSync)(s.outputDir) ? s.outputDir : (0, import_node_path5.join)(import_electron.app.getPath("documents"), (0, import_brandPaths.documentsFolderName)(), (0, import_i18n6.t)("\u6D41\u7A0B\u65F6\u6548\u76D1\u63A7"));
  };
  const outputDir = (sub) => {
    const dir = sub ? (0, import_node_path5.join)(outputRoot(), (0, import_excel3.safeFileName)(sub)) : outputRoot();
    (0, import_node_fs3.mkdirSync)(dir, { recursive: true });
    return dir;
  };
  const stamp = (d = /* @__PURE__ */ new Date()) => `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}-${String(d.getHours()).padStart(2, "0")}${String(d.getMinutes()).padStart(2, "0")}`;
  const sendMail = async (input) => {
    const { sendCaseMail } = await import("host:apps/desktop-shell/src/main/services/caseMailSender.ts");
    const relay = deps.serviceAuth ? { send: (i) => deps.serviceAuth.relaySendMail(i) } : null;
    return sendCaseMail(deps.readEmailCredentials?.() ?? {}, input, relay);
  };
  const mailStatus = () => {
    const c = deps.readEmailCredentials?.() ?? {};
    return { address: c.EMAIL_ADDRESS || "", smtpConfigured: Boolean(c.EMAIL_ADDRESS && c.EMAIL_PASSWORD && c.EMAIL_SMTP_HOST), officialRelay: Boolean(deps.serviceAuth) };
  };
  const senderName = () => {
    const c = deps.readEmailCredentials?.() ?? {};
    return c.EMAIL_SENDER_NAME || "";
  };
  const thresholds = () => sanitizeThresholds(store.read().thresholds, thresholdsOf(store.baseRules()));
  proc = new FlowSlaProc({
    store,
    remindDays: () => thresholds().improveRemindDays,
    broadcast,
    notify: (title, body) => {
      if (import_electron.Notification.isSupported()) new import_electron.Notification({ title, body: body.slice(0, 200) }).show();
    },
    logger: { info: (m, c) => logger?.info?.("flow-sla", m, c), warn: (m, c) => logger?.warn?.("flow-sla", m, c) }
  });
  proc.start();
  (0, import_quitRegistry.onAppWillQuit)("flow-sla", () => proc?.stop(), { once: true });
  const compute = () => {
    const s = store.read();
    const data = store.data();
    if (!data.flows.length) throw new Error((0, import_i18n6.t)("\u8FD8\u6CA1\u6709\u5BFC\u5165\u62A5\u8868\uFF0C\u8BF7\u5148\u5B8C\u6210\u7B2C 1 \u6B65"));
    const period = requireFound(s.session.period, (0, import_i18n6.t)("\u7EDF\u8BA1\u5468\u671F"));
    const rules = effectiveRules(store.baseRules(), { thresholds: s.thresholds, decisions: s.nodeDecisions, roster: data.roster });
    const opt = {
      now: Math.min(period.asOf, Date.now()),
      periodStart: period.start,
      periodEnd: period.end,
      holidays: s.settings.holidays,
      extraWorkdays: s.settings.extraWorkdays,
      roster: data.roster.length ? data.roster.map((r) => r.name) : void 0,
      rosterDept: Object.fromEntries(data.roster.filter((r) => r.dept).map((r) => [r.name, r.dept])),
      unknownNodePolicy: "exclude"
    };
    return { period, rules, opt, flows: data.flows, nodes: data.nodes, roster: data.roster, result: runCompute(data, rules, opt, s.aliases) };
  };
  const snapshotId = (p) => `${p.kind}-${ymd(p.start)}-${ymd(p.end)}`;
  const asPeriodSnapshot = (m) => ({ label: m.label, periodStart: m.periodStart, periodEnd: m.periodEnd, overall: m.overall, byType: m.byType });
  const previousOf = (period, pickedId) => {
    const curId = snapshotId(period);
    const candidates = store.read().snapshots.filter((x) => x.kind === period.kind && x.id !== curId);
    const picked = pickedId ? candidates.find((x) => x.id === pickedId) : void 0;
    return { prev: picked ?? candidates.find((x) => x.periodEnd <= period.start) ?? null, candidates };
  };
  const calcView = (c) => {
    const r = c.result;
    return {
      period: c.period,
      snapshotId: snapshotId(c.period),
      overall: r.overall,
      byCategory: r.byCategory,
      byType: r.byType,
      reviewerRank: r.reviewerRank,
      initiatorRank: r.initiatorRank,
      runningByInitiator: r.runningByInitiator,
      overtime: r.flows.filter((f) => f.status === "done" && f.inPeriod && f.overtime === true).sort((a, b) => b.overdueDays - a.overdueDays),
      runningAbnormal: r.flows.filter((f) => f.status === "running" && (f.runningLabel === "overdue" || f.runningLabel === "risk")).sort((a, b) => b.overdueDays - a.overdueDays || b.days - a.days),
      approxCount: r.flows.filter((f) => f.approx).length,
      noLimitCount: r.flows.filter((f) => f.limitDays === null && (f.status === "running" || f.inPeriod)).length
    };
  };
  const compareView = (c, prevId) => {
    const { prev, candidates } = previousOf(c.period, prevId);
    const types = compareWithPrevious(c.result, prev ? asPeriodSnapshot(prev) : null, c.rules);
    const abnormal = types.filter((t) => t.abnormal).map((t) => ({ ...t, analysis: analyzeNodes(t.flowType, t.system, c.result, c.nodes, c.rules, c.opt) }));
    const current = { id: snapshotId(c.period), kind: c.period.kind, savedAt: nowIso(), ...toSnapshot(c.period.label, c.opt, c.result) };
    return {
      current,
      previous: prev,
      candidates,
      delta: overallDelta(c.result.overall, prev?.overall),
      types,
      abnormal,
      yearOverdue: c.period.kind === "monthly" ? yearOverdueRunning(c.result, c.opt.now) : []
    };
  };
  const reportContext = (c) => {
    const s = store.read();
    const cmp = compareView(c, s.session.prevSnapshotId || void 0);
    const curId = snapshotId(c.period);
    const history = s.snapshots.filter((x) => x.kind === c.period.kind && x.id !== curId && x.periodEnd <= c.period.start).slice(0, 11).reverse();
    return {
      period: c.period,
      result: c.result,
      previous: cmp.previous ? asPeriodSnapshot(cmp.previous) : null,
      delta: cmp.delta,
      compare: cmp.types,
      abnormal: cmp.abnormal,
      yearOverdue: cmp.yearOverdue,
      cases: s.session.cases,
      rootCauses: s.session.rootCauses,
      summary: s.session.summary,
      suggestions: s.session.suggestions,
      thresholds: thresholdsOf(c.rules),
      trend: [...history.map((h) => ({ label: h.label, complianceRate: h.overall.complianceRate, avgDays: h.overall.avgDays })), { label: c.period.label, complianceRate: c.result.overall.complianceRate, avgDays: c.result.overall.avgDays }],
      generatedAt: Date.now()
    };
  };
  const publicState = () => {
    const s = store.read();
    const base = store.baseRules();
    const now = Date.now();
    return {
      settings: s.settings,
      outputDir: outputRoot(),
      session: s.session,
      snapshots: s.snapshots,
      tracking: s.tracking,
      ledger: s.ledger.map((l) => ({ ...l, status: ledgerStatus(l, now) })),
      reminders: s.reminders.slice(0, 50),
      mail: mailStatus(),
      rules: { version: base.version, custom: !!store.customRules(), counts: { e2e: base.e2e.length, cssNodes: base.cssNodes.length, oaFkNodes: base.oaFkNodes.length, personal: base.personal.length, managers: base.managers.length } },
      thresholds: thresholds(),
      hasData: store.data().flows.length > 0
    };
  };
  const caseOf = (key) => requireFound(store.read().session.cases.find((x) => x.key === key), (0, import_i18n6.t)("\u6D41\u7A0B"));
  const periodDir = () => outputDir(store.read().session.period?.label.replace(/\s*~\s*/g, "_") || (0, import_i18n6.t)("\u672A\u547D\u540D\u5468\u671F"));
  const resetDownstream = (keepCases) => {
    store.update((s) => {
      const old = s.session;
      s.session = { ...emptySession(), period: old.period, ingest: old.ingest, cases: keepCases ? old.cases : [] };
    });
  };
  const commitIngest = (req) => {
    const p = req.period;
    if (!p || !(p.end > p.start)) throw new Error((0, import_i18n6.t)("\u7EDF\u8BA1\u5468\u671F\u7684\u7ED3\u675F\u65E5\u671F\u5FC5\u987B\u665A\u4E8E\u5F00\u59CB\u65E5\u671F"));
    const period = makePeriod(p.kind === "monthly" ? "monthly" : "weekly", p.start, p.end, Math.min(Number(p.asOf) || Date.now(), Date.now()));
    const r = ingestAll({ systems: req.systems || {}, roster: req.roster });
    store.setData({ flows: r.flows, nodes: r.nodes, roster: r.roster });
    store.update((s) => {
      s.session = { ...emptySession(), period, ingest: r.summary };
    });
    pushState();
    return { summary: r.summary, period };
  };
  const applyReasons = (list) => {
    let n = 0;
    store.update((s) => {
      for (const it of list) {
        const c = s.session.cases.find((x) => x.key === it.key);
        if (!c) continue;
        c.reason = it.reason;
        if (c.classifiedBy !== "manual") {
          c.categoryId = it.reason.trim() ? classifyByRule(it.reason) : "";
          c.classifiedBy = it.reason.trim() ? "rule" : "";
        }
        n += 1;
      }
    });
    return n;
  };
  const writeLedgerFromSuggestions = (list, source) => {
    const now = nowIso();
    let n = 0;
    store.update((s) => {
      for (const sg of list) {
        if (!sg.item.trim()) continue;
        s.ledger.unshift({
          id: newId("fsl"),
          item: sg.item.trim(),
          dept: sg.dept || "",
          owner: sg.owner || "",
          requirement: sg.requirement || "",
          deadline: /^\d{4}-\d{2}-\d{2}$/.test(sg.deadline) ? sg.deadline : "",
          acceptance: sg.acceptance || "",
          status: "doing",
          escalated: false,
          source,
          progress: [{ at: now, text: (0, import_i18n6.t)("\u7531\u300C{p0}\u300D\u7684\u6539\u5584\u5EFA\u8BAE\u8BB0\u5165", { p0: source }) }],
          createdAt: now,
          updatedAt: now,
          remindedFor: "",
          escalatedFor: ""
        });
        n += 1;
      }
      s.session.ledgerWritten = true;
    });
    return n;
  };
  const actions = {
    "state.get": () => publicState(),
    "settings.patch": (p) => {
      const patch = p?.patch || {};
      store.update((s) => {
        if (patch.outputDir !== void 0) s.settings.outputDir = String(patch.outputDir || "");
        if (patch.weeklyRecipients !== void 0) s.settings.weeklyRecipients = String(patch.weeklyRecipients || "").slice(0, 4e3);
        if (patch.monthlyRecipients !== void 0) s.settings.monthlyRecipients = String(patch.monthlyRecipients || "").slice(0, 4e3);
      });
      pushState();
      return store.read().settings;
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
      if (!p?.path || !(0, import_node_fs3.existsSync)(p.path)) throw new Error((0, import_i18n6.t)("\u6587\u4EF6\u4E0D\u5B58\u5728"));
      if (p.reveal) {
        import_electron.shell.showItemInFolder(p.path);
        return true;
      }
      const err = await import_electron.shell.openPath(p.path);
      if (err) throw new Error(err);
      return true;
    },
    // ── 第 1 步 导入 ──
    "ingest.preview": (p) => {
      if (!p?.path || !(0, import_node_fs3.existsSync)(p.path)) throw new Error((0, import_i18n6.t)("\u6587\u4EF6\u4E0D\u5B58\u5728"));
      const slot = p.slot === "node" || p.slot === "roster" ? p.slot : "flow";
      const t = previewTable(p.path, slot, p.sheet);
      return { ...t, missing: missingRoles(slot, t.mapping, { hasFlowTable: !!p.hasFlowTable }) };
    },
    "ingest.commit": (p) => commitIngest(p),
    /** 生成一套示例报表写到输出目录并直接载入 */
    "demo.generate": (p) => {
      const files = writeDemo(outputDir(), store.baseRules(), Date.now());
      const spec = (path, slot) => ({ path, mapping: previewTable(path, slot).mapping });
      const systems = {};
      const names = import_ipc_contracts3.FS_SYSTEMS;
      systems[names[0]] = { flow: spec(files.oaFlow, "flow"), node: spec(files.oaNode, "node") };
      systems[names[1]] = { flow: spec(files.fkFlow, "flow"), node: spec(files.fkNode, "node") };
      systems[names[2]] = { flow: spec(files.css, "flow") };
      const r = commitIngest({ period: p.period, systems, roster: spec(files.roster, "roster") });
      return { ...r, dir: files.dir, files };
    },
    // ── 第 2 步 核对 ──
    "check.run": () => {
      const c = compute();
      const s = store.read();
      return {
        counts: s.session.ingest?.systems ?? [],
        unmatched: c.result.unmatchedTypes.map((u) => ({ ...u, regular: s.aliases[aliasKey(u.system, u.flowName)] === REGULAR })),
        unknownNodes: c.result.unknownNodes,
        outOfRoster: c.result.outOfRoster,
        rosterCount: c.roster.length,
        ruleTypes: c.rules.e2e.filter((r) => !r.fallback).map((r) => ({ system: r.system, category: r.category, flowType: r.flowType })),
        aliases: Object.entries(s.aliases).map(([k, target]) => ({ system: k.split("|")[0], flowName: s.aliasNames[k] || k.split("|").slice(1).join("|"), target })),
        decisions: s.nodeDecisions
      };
    },
    /** 把一个流程名对到规则细类；target 传空 = 取消，传 REGULAR = 确认它就是常规流程 */
    "alias.set": (p) => {
      const k = aliasKey(p.system, p.flowName);
      const target = String(p.target || "");
      if (target && target !== REGULAR && !store.baseRules().e2e.some((r) => r.flowType === target)) throw new Error((0, import_i18n6.t)("\u89C4\u5219\u8868\u91CC\u6CA1\u6709\u8FD9\u4E2A\u6D41\u7A0B\u7EC6\u7C7B\uFF1A{p0}", { p0: target }));
      store.update((s) => {
        if (target) {
          s.aliases[k] = target;
          s.aliasNames[k] = p.flowName;
        } else {
          delete s.aliases[k];
          delete s.aliasNames[k];
        }
      });
      resetDownstream(true);
      pushState();
      return true;
    },
    /** 给没登记内外部的节点定性；internal 传 null = 取消 */
    "node.decide": (p) => {
      store.update((s) => {
        s.nodeDecisions = s.nodeDecisions.filter((d) => !(d.system === p.system && d.flowName === p.flowName && d.node === p.node));
        if (p.internal !== null && p.internal !== void 0) s.nodeDecisions.push({ system: p.system, flowName: p.flowName, node: p.node, internal: !!p.internal });
      });
      resetDownstream(true);
      pushState();
      return true;
    },
    // ── 第 3 步 计算 ──
    "calc.run": () => {
      const c = compute();
      const s = store.read();
      const meta = { id: snapshotId(c.period), kind: c.period.kind, savedAt: nowIso(), ...toSnapshot(c.period.label, c.opt, c.result) };
      const data = { flows: c.flows, nodes: c.nodes, roster: c.roster, options: c.opt, rules: c.rules, aliases: { ...s.aliases } };
      store.saveSnapshot(meta, data);
      const statusByKey = new Map(c.flows.map((f) => [`${f.system}|${f.flowNo}`, f.status]));
      const sync = syncTracking(s.tracking, { result: c.result, statusByKey, roster: c.roster, rules: c.rules, nowMs: Date.now() });
      store.update((st) => {
        st.tracking = sync.items;
        st.session.snapshotId = meta.id;
        st.session.cases = buildCases(c.result, c.roster, st.session.cases);
      });
      pushState();
      return { ...calcView(c), tracking: { added: sync.added, closed: sync.closed } };
    },
    "calc.view": () => calcView(compute()),
    "calc.export": () => {
      const c = compute();
      const file = (0, import_node_path5.join)(periodDir(), `${(0, import_i18n6.t)("\u6D41\u7A0B\u65F6\u6548\u660E\u7EC6")}-${stamp()}.xlsx`);
      (0, import_excel3.writeWorkbook)(file, detailSheets(reportContext(c)));
      return file;
    },
    "snapshot.remove": (p) => {
      store.removeSnapshot(String(p?.id || ""));
      pushState();
      return true;
    },
    // ── 第 4 步 环比与异常 ──
    "compare.run": (p) => {
      const c = compute();
      const view = compareView(c, p?.prevId);
      store.update((s) => {
        s.session.prevSnapshotId = view.previous?.id || "";
      });
      return view;
    },
    // ── 第 5 步 原因 ──
    "cases.get": () => {
      const s = store.read();
      const period = requireFound(s.session.period, (0, import_i18n6.t)("\u7EDF\u8BA1\u5468\u671F"));
      return { cases: s.session.cases, mails: ownerMails(s.session.cases, period, senderName()) };
    },
    "cases.setEmail": (p) => {
      const email = String(p?.email || "").trim();
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error((0, import_i18n6.t)("\u90AE\u7BB1\u683C\u5F0F\u4E0D\u5BF9\uFF1A{p0}", { p0: email }));
      store.update((s) => {
        for (const c of s.session.cases) if (c.owner === p.owner) c.ownerEmail = email;
      });
      return true;
    },
    "reasons.set": (p) => {
      caseOf(p.key);
      if (p.reason !== void 0) applyReasons([{ key: p.key, reason: String(p.reason).slice(0, 500) }]);
      if (p.categoryId !== void 0) {
        if (p.categoryId && !import_ipc_contracts3.FS_REASON_CATEGORIES.includes(p.categoryId)) throw new Error((0, import_i18n6.t)("\u539F\u56E0\u7C7B\u522B\u4E0D\u5728\u540D\u5355\u91CC"));
        store.update((s) => {
          const c = s.session.cases.find((x) => x.key === p.key);
          c.categoryId = p.categoryId;
          c.classifiedBy = p.categoryId ? "manual" : "";
        });
      }
      return store.read().session.cases;
    },
    "reasons.export": () => {
      const cases = store.read().session.cases;
      if (!cases.length) throw new Error((0, import_i18n6.t)("\u6CA1\u6709\u9700\u8981\u6536\u96C6\u539F\u56E0\u7684\u6D41\u7A0B"));
      const file = (0, import_node_path5.join)(periodDir(), `${(0, import_i18n6.t)("\u8D85\u65F6\u539F\u56E0\u6536\u96C6\u8868")}-${stamp()}.xlsx`);
      (0, import_excel3.writeWorkbook)(file, [reasonSheet(cases)]);
      return file;
    },
    "reasons.import": (p) => {
      if (!p?.path || !(0, import_node_fs3.existsSync)(p.path)) throw new Error((0, import_i18n6.t)("\u6587\u4EF6\u4E0D\u5B58\u5728"));
      const t = (0, import_excel3.readTable)(p.path);
      const r = readReasonRows(t.headers, t.rows, store.read().session.cases);
      if (r.noColumn) throw new Error((0, import_i18n6.t)("\u8FD9\u5F20\u8868\u91CC\u6CA1\u6709\u627E\u5230\u300C\u5355\u53F7\u300D\u548C\u300C\u8D85\u65F6\u539F\u56E0\u300D\u4E24\u5217"));
      const n = applyReasons(r.filled);
      return { filled: n, unmatched: r.unmatched, cases: store.read().session.cases };
    },
    /** 给选中的责任人各发一封原因收集邮件（由人点击触发）；没有邮箱的跳过并列出来 */
    "reasons.send": async (p) => {
      const s = store.read();
      const period = requireFound(s.session.period, (0, import_i18n6.t)("\u7EDF\u8BA1\u5468\u671F"));
      const mails = ownerMails(s.session.cases, period, senderName()).filter((m) => (p?.owners || []).includes(m.owner));
      if (!mails.length) throw new Error((0, import_i18n6.t)("\u8BF7\u5148\u52FE\u9009\u8981\u53D1\u9001\u7684\u8D23\u4EFB\u4EBA"));
      const sent = [];
      const skipped = [];
      const failed = [];
      const dir = (0, import_node_path5.join)(periodDir(), (0, import_i18n6.t)("\u539F\u56E0\u6536\u96C6"));
      (0, import_node_fs3.mkdirSync)(dir, { recursive: true });
      for (const m of mails) {
        if (!m.email) {
          skipped.push(m.owner);
          continue;
        }
        const file = (0, import_node_path5.join)(dir, `${(0, import_i18n6.t)("\u8D85\u65F6\u539F\u56E0\u6536\u96C6\u8868")}-${(0, import_excel3.safeFileName)(m.owner)}.xlsx`);
        (0, import_excel3.writeWorkbook)(file, [reasonSheet(s.session.cases.filter((c) => c.owner === m.owner))]);
        const r = await sendMail({ to: [m.email], subject: m.subject, body: m.body, attachments: [{ filename: `${(0, import_i18n6.t)("\u8D85\u65F6\u539F\u56E0\u6536\u96C6\u8868")}.xlsx`, path: file }] });
        if (r.ok) {
          sent.push(m.owner);
          store.update((st) => {
            for (const c of st.session.cases) if (c.owner === m.owner) c.mailedAt = nowIso();
          });
        } else failed.push({ owner: m.owner, message: r.message || (0, import_i18n6.t)("\u53D1\u9001\u5931\u8D25") });
      }
      pushState();
      return { sent, skipped, failed };
    },
    /** 归类：先按关键字；useModel 时再让模型归类并写根因说明，通不过核对的保留关键字结果 */
    "reasons.classify": async (p) => {
      const withReason = store.read().session.cases.filter((c) => c.reason.trim());
      if (!withReason.length) throw new Error((0, import_i18n6.t)("\u8FD8\u6CA1\u6709\u4EFB\u4F55\u6D41\u7A0B\u586B\u4E86\u8D85\u65F6\u539F\u56E0"));
      store.update((s2) => {
        for (const c of s2.session.cases) {
          if (!c.reason.trim()) {
            c.categoryId = "";
            c.classifiedBy = "";
            continue;
          }
          if (c.classifiedBy !== "manual") {
            c.categoryId = classifyByRule(c.reason);
            c.classifiedBy = "rule";
          }
        }
      });
      let by = "rule";
      let modelError = "";
      let rejected = 0;
      let rootCauses = {};
      if (p?.useModel) {
        try {
          const { json } = await llmJson("reasons", reasonClassifyPrompt(withReason), 12e4);
          const out = acceptModelClassification(json, withReason);
          rejected = out.rejected;
          rootCauses = out.rootCauses;
          if (Object.keys(out.categories).length) {
            by = "model";
            store.update((s2) => {
              for (const c of s2.session.cases) {
                const cat = out.categories[c.key];
                if (cat && c.classifiedBy !== "manual") {
                  c.categoryId = cat;
                  c.classifiedBy = "model";
                }
              }
            });
          }
        } catch (e) {
          modelError = (0, import_userFacingError.userFacingError)(e);
        }
      }
      store.update((s2) => {
        const used = new Set(s2.session.cases.filter((c) => c.reason.trim() && c.categoryId).map((c) => c.categoryId));
        const next = {};
        for (const id of used) next[id] = rootCauses[id] || defaultRootCause(id);
        s2.session.rootCauses = next;
      });
      const s = store.read().session;
      return { by, modelError, rejected, cases: s.cases, rootCauses: s.rootCauses, labels: Object.fromEntries(import_ipc_contracts3.FS_REASON_CATEGORIES.map((id) => [id, categoryLabel(id)])) };
    },
    "rootCause.set": (p) => {
      if (!import_ipc_contracts3.FS_REASON_CATEGORIES.includes(p?.id)) throw new Error((0, import_i18n6.t)("\u539F\u56E0\u7C7B\u522B\u4E0D\u5728\u540D\u5355\u91CC"));
      store.update((s) => {
        s.session.rootCauses[p.id] = String(p.text || "").slice(0, 600);
      });
      return store.read().session.rootCauses;
    },
    // ── 第 6 步 通报 ──
    /** 起草总结与改善建议：默认规则写；useModel 时让模型写，通不过数字核对就退回规则版 */
    "summary.draft": async (p) => {
      const ctx = reportContext(compute());
      let summary = ruleSummary(ctx);
      let suggestions = ruleSuggestions(ctx);
      let by = "rule";
      let modelError = "";
      let dropped = 0;
      if (p?.useModel) {
        try {
          const depts = [...new Set(ctx.result.flows.map((f) => f.dept).filter(Boolean))];
          const people = [...new Set([...ctx.cases.map((c) => c.owner), ...ctx.result.reviewerRank.map((r) => r.name)].filter(Boolean))];
          const { json } = await llmJson("summary", summaryPrompt(ctx.period.kind, buildFacts(ctx), { depts, people }), 18e4);
          const out = acceptModelSummary(json, ctx);
          dropped = out.dropped;
          if (out.usedModel) {
            by = "model";
            summary = out.summary;
            suggestions = out.suggestions.map((sg) => ({ ...sg, dept: depts.includes(sg.dept) ? sg.dept : "", owner: people.includes(sg.owner) ? sg.owner : "" }));
          }
        } catch (e) {
          modelError = (0, import_userFacingError.userFacingError)(e);
        }
      }
      store.update((s) => {
        s.session.summary = summary;
        s.session.suggestions = suggestions;
        s.session.summaryBy = by;
      });
      return { summary, suggestions, by, modelError, dropped };
    },
    "summary.save": (p) => {
      const clean = (Array.isArray(p?.suggestions) ? p.suggestions : []).slice(0, 30).map((x) => ({
        item: String(x?.item || "").slice(0, 300),
        dept: String(x?.dept || "").slice(0, 60),
        owner: String(x?.owner || "").slice(0, 60),
        requirement: String(x?.requirement || "").slice(0, 500),
        deadline: /^\d{4}-\d{2}-\d{2}$/.test(String(x?.deadline || "")) ? String(x.deadline) : "",
        acceptance: String(x?.acceptance || "").slice(0, 300)
      })).filter((x) => x.item.trim());
      store.update((s) => {
        s.session.summary = String(p?.summary || "").slice(0, 8e3);
        s.session.suggestions = clean;
        s.session.summaryBy = "manual";
      });
      return store.read().session;
    },
    /** 生成通报文件并返回预览：周报 = 网页版 + 明细表；月报 = 分析报告 PDF + 明细表 */
    "report.build": async () => {
      const c = compute();
      const ctx = reportContext(c);
      const dir = periodDir();
      const subject = reportSubject(ctx);
      const base = (0, import_excel3.safeFileName)(subject);
      const xlsx = (0, import_node_path5.join)(dir, `${base}-${(0, import_i18n6.t)("\u660E\u7EC6")}.xlsx`);
      (0, import_excel3.writeWorkbook)(xlsx, detailSheets(ctx));
      let preview;
      if (c.period.kind === "monthly") {
        const html = monthlyReportHtml(ctx);
        const pdf = (0, import_node_path5.join)(dir, `${base}.pdf`);
        const { renderHtmlToPdf } = await import("host:apps/desktop-shell/src/main/services/charityContent/render.ts");
        await renderHtmlToPdf(html, pdf);
        preview = { kind: "monthly", subject, text: monthlyMailText(ctx), html, files: [{ name: `${base}.pdf`, path: pdf }, { name: `${base}-${(0, import_i18n6.t)("\u660E\u7EC6")}.xlsx`, path: xlsx }] };
      } else {
        const m = weeklyMail(ctx);
        const htmlFile = (0, import_node_path5.join)(dir, `${base}.html`);
        (0, import_node_fs3.writeFileSync)(htmlFile, m.html, "utf-8");
        preview = { kind: "weekly", subject, text: m.text, html: m.html, files: [{ name: `${base}.html`, path: htmlFile }, { name: `${base}-${(0, import_i18n6.t)("\u660E\u7EC6")}.xlsx`, path: xlsx }] };
      }
      store.update((s) => {
        s.session.reportFiles = preview.files.map((f) => f.path);
      });
      return preview;
    },
    /** 发送通报（由人点击触发）。月报发出后把改善建议记入改善台账 */
    "report.send": async (p) => {
      const s = store.read();
      const period = requireFound(s.session.period, (0, import_i18n6.t)("\u7EDF\u8BA1\u5468\u671F"));
      const files = s.session.reportFiles.filter((f) => (0, import_node_fs3.existsSync)(f));
      if (!files.length) throw new Error((0, import_i18n6.t)("\u8BF7\u5148\u751F\u6210\u901A\u62A5\u5E76\u9884\u89C8"));
      const { parseRecipients } = await import("host:apps/desktop-shell/src/main/services/caseMailSender.ts");
      const rcpt = parseRecipients(String(p?.to || ""));
      if (rcpt.invalid.length) throw new Error((0, import_i18n6.t)("\u8FD9\u4E9B\u6536\u4EF6\u4EBA\u5730\u5740\u4E0D\u5BF9\uFF1A{p0}", { p0: rcpt.invalid.join("\u3001") }));
      if (!rcpt.list.length) throw new Error((0, import_i18n6.t)("\u8BF7\u586B\u5199\u6536\u4EF6\u4EBA"));
      store.update((st) => {
        if (period.kind === "monthly") st.settings.monthlyRecipients = String(p.to);
        else st.settings.weeklyRecipients = String(p.to);
      });
      const r = await sendMail({
        to: rcpt.list,
        subject: String(p.subject || "").trim() || (0, import_i18n6.t)("\u7EBF\u4E0A\u6D41\u7A0B\u65F6\u6548\u8FBE\u6210\u60C5\u51B5\u901A\u62A5"),
        body: String(p.text || ""),
        attachments: files.map((f) => ({ filename: f.split(/[\\/]/).pop() || "attachment", path: f }))
      });
      if (!r.ok) throw new Error(r.message || (0, import_i18n6.t)("\u53D1\u9001\u5931\u8D25"));
      let ledgerAdded = 0;
      if (period.kind === "monthly" && !store.read().session.ledgerWritten) ledgerAdded = writeLedgerFromSuggestions(store.read().session.suggestions, (0, import_i18n6.t)("{p0} \u6708\u5EA6\u901A\u62A5", { p0: period.label }));
      store.update((st) => {
        st.session.sentAt = nowIso();
      });
      pushState();
      return { ok: true, via: r.via || "self", notice: r.notice || "", recipients: rcpt.list.length, ledgerAdded };
    },
    /** 不发邮件，只把改善建议记入台账（月报） */
    "report.toLedger": () => {
      const s = store.read();
      if (s.session.ledgerWritten) throw new Error((0, import_i18n6.t)("\u8FD9\u4E00\u671F\u7684\u6539\u5584\u5EFA\u8BAE\u5DF2\u7ECF\u8BB0\u5165\u53F0\u8D26"));
      if (!s.session.suggestions.length) throw new Error((0, import_i18n6.t)("\u6CA1\u6709\u6539\u5584\u5EFA\u8BAE"));
      const n = writeLedgerFromSuggestions(s.session.suggestions, (0, import_i18n6.t)("{p0} \u6708\u5EA6\u901A\u62A5", { p0: s.session.period?.label || "" }));
      pushState();
      return n;
    },
    // ── 时效看板 ──
    "board.get": (p) => {
      const s = store.read();
      const metas = s.snapshots;
      const snapshot = (p?.snapshotId ? metas.find((x) => x.id === p.snapshotId) : void 0) ?? metas[0] ?? null;
      const trend = [...metas].reverse().map((m) => ({ id: m.id, kind: m.kind, label: m.label, periodEnd: m.periodEnd, complianceRate: m.overall.complianceRate, avgDays: m.overall.avgDays, doneCount: m.overall.doneCount }));
      const empty = { snapshot, trend, overall: null, byCategory: [], byType: [], reviewerRank: [], flows: [], flowTotal: 0, options: { systems: [], categories: [], flowTypes: [], depts: [] } };
      const data = snapshot ? store.snapshotData(snapshot.id) : null;
      if (!snapshot || !data) return empty;
      const full = runCompute(data, data.rules, data.options, data.aliases);
      const shown = full.flows.filter((f) => f.status === "running" || f.inPeriod);
      const uniq = (list) => [...new Set(list.filter(Boolean))].sort((a, b) => a.localeCompare(b, "zh"));
      const options = { systems: uniq(shown.map((f) => f.system)), categories: uniq(shown.map((f) => f.category)), flowTypes: uniq(shown.filter((f) => !p?.category || f.category === p.category).map((f) => f.flowType)), depts: uniq(shown.map((f) => f.dept)) };
      const narrow = !!(p?.category || p?.flowType || p?.dept);
      let res = full;
      if (p?.system || narrow) {
        const keep = new Set(full.flows.filter((f) => (!p.system || f.system === p.system) && (!p.category || f.category === p.category) && (!p.flowType || f.flowType === p.flowType) && (!p.dept || f.dept === p.dept)).map((f) => `${f.system}|${f.flowNo}`));
        const flows2 = data.flows.filter((f) => keep.has(`${f.system}|${f.flowNo}`));
        const nodes = data.nodes.filter((n) => narrow ? keep.has(`${n.system}|${n.flowNo}`) : n.system === p.system);
        res = runCompute({ flows: flows2, nodes, roster: data.roster }, data.rules, data.options, data.aliases);
      }
      const flows = res.flows.filter((f) => f.status === "running" || f.inPeriod).sort((a, b) => Number(b.runningLabel === "overdue" || b.overtime === true) - Number(a.runningLabel === "overdue" || a.overtime === true) || b.overdueDays - a.overdueDays || b.days - a.days);
      return { snapshot, trend, overall: res.overall, byCategory: res.byCategory, byType: res.byType, reviewerRank: res.reviewerRank, flows: flows.slice(0, 500), flowTotal: flows.length, options };
    },
    // ── 在途跟进 ──
    "track.note": (p) => {
      const text2 = String(p?.text || "").trim();
      if (!text2) throw new Error((0, import_i18n6.t)("\u8BF7\u586B\u5199\u8FDB\u5C55"));
      store.update((s) => {
        const t = requireFound(s.tracking.find((x) => x.key === p.key && !x.closedAt), (0, import_i18n6.t)("\u8DDF\u8FDB\u6761\u76EE"));
        const now = Date.now();
        t.notes.push({ at: new Date(now).toISOString(), text: text2.slice(0, 500), kind: "note" });
        t.lastFollowAt = new Date(now).toISOString();
        t.nextFollowAt = nextFollowAt(now, t.intervalDays);
      });
      pushState();
      return true;
    },
    "track.setEmail": (p) => {
      const email = String(p?.email || "").trim();
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error((0, import_i18n6.t)("\u90AE\u7BB1\u683C\u5F0F\u4E0D\u5BF9\uFF1A{p0}", { p0: email }));
      store.update((s) => {
        requireFound(s.tracking.find((x) => x.key === p.key), (0, import_i18n6.t)("\u8DDF\u8FDB\u6761\u76EE")).handlerEmail = email;
      });
      pushState();
      return true;
    },
    "track.mailPreview": (p) => {
      const t = requireFound(store.read().tracking.find((x) => x.key === p.key && !x.closedAt), (0, import_i18n6.t)("\u8DDF\u8FDB\u6761\u76EE"));
      return {
        to: t.handlerEmail,
        subject: (0, import_i18n6.t)("\u3010\u6D41\u7A0B\u65F6\u6548\u3011\u8BF7\u66F4\u65B0\u5728\u9014\u6D41\u7A0B\u7684\u5904\u7406\u8FDB\u5EA6\uFF1A{p0}", { p0: t.flowNo }),
        body: [
          (0, import_i18n6.t)("{p0}\uFF0C\u4F60\u597D\uFF1A", { p0: t.handler || (0, import_i18n6.t)("\u540C\u4E8B") }),
          "",
          (0, import_i18n6.t)("[{p0}] {p1} {p2}{p3} \u76EE\u524D\u5728\u9014 {p4} \u5929\uFF0C\u65F6\u6548\u8981\u6C42 {p5} \u5929\uFF0C\u5DF2\u8D85\u51FA {p6} \u5929\uFF0C\u505C\u5728\u300C{p7}\u300D\u3002", { p0: t.system, p1: t.flowNo, p2: t.flowName, p3: t.title ? `\uFF08${t.title}\uFF09` : "", p4: t.days, p5: t.limitDays ?? "-", p6: t.overdueDays, p7: t.currentNode || "-" }),
          (0, import_i18n6.t)("\u8BF7\u56DE\u590D\u76EE\u524D\u7684\u5904\u7406\u8FDB\u5EA6\u3001\u5361\u4F4F\u7684\u539F\u56E0\u548C\u9884\u8BA1\u529E\u7ED3\u65F6\u95F4\u3002"),
          ...senderName() ? ["", senderName()] : []
        ].join("\n")
      };
    },
    /** 给处理人发一封进度提醒（由人点击触发），并顺延下次跟进时间 */
    "track.remind": async (p) => {
      const t = requireFound(store.read().tracking.find((x) => x.key === p.key && !x.closedAt), (0, import_i18n6.t)("\u8DDF\u8FDB\u6761\u76EE"));
      if (!t.handlerEmail) throw new Error((0, import_i18n6.t)("\u8FD9\u4F4D\u5904\u7406\u4EBA\u6CA1\u6709\u90AE\u7BB1\uFF0C\u8BF7\u5148\u8865\u4E0A"));
      const r = await sendMail({ to: [t.handlerEmail], subject: String(p.subject || ""), body: String(p.body || "") });
      if (!r.ok) throw new Error(r.message || (0, import_i18n6.t)("\u53D1\u9001\u5931\u8D25"));
      store.update((s) => {
        const cur = s.tracking.find((x) => x.key === p.key && !x.closedAt);
        if (!cur) return;
        const now = Date.now();
        cur.notes.push({ at: new Date(now).toISOString(), text: (0, import_i18n6.t)("\u5DF2\u53D1\u63D0\u9192\u90AE\u4EF6\u7ED9 {p0}", { p0: cur.handler || cur.handlerEmail }), kind: "mail" });
        cur.lastFollowAt = new Date(now).toISOString();
        cur.nextFollowAt = nextFollowAt(now, cur.intervalDays);
      });
      pushState();
      return { ok: true, via: r.via || "self" };
    },
    "track.close": (p) => {
      store.update((s) => {
        const t = requireFound(s.tracking.find((x) => x.key === p.key && !x.closedAt), (0, import_i18n6.t)("\u8DDF\u8FDB\u6761\u76EE"));
        t.closedAt = nowIso();
        t.closeReason = String(p?.reason || "").trim().slice(0, 200) || (0, import_i18n6.t)("\u624B\u5DE5\u95ED\u73AF");
        t.notes.push({ at: t.closedAt, text: t.closeReason, kind: "system" });
      });
      pushState();
      return true;
    },
    "reminders.check": async () => (await proc?.tick())?.length ?? 0,
    "reminders.clear": () => {
      store.update((s) => {
        s.reminders = [];
      });
      pushState();
      return true;
    },
    // ── 改善台账 ──
    "ledger.save": (p) => {
      const it = p?.item || {};
      const item = String(it.item || "").trim();
      if (!item) throw new Error((0, import_i18n6.t)("\u8BF7\u586B\u5199\u6539\u5584\u4E8B\u9879"));
      const deadline = String(it.deadline || "").trim();
      if (deadline && !/^\d{4}-\d{2}-\d{2}$/.test(deadline)) throw new Error((0, import_i18n6.t)("\u6267\u884C\u671F\u9650\u8BF7\u5199\u6210 2026-10-31 \u8FD9\u6837\u7684\u65E5\u671F"));
      const status = it.status === "done" || it.status === "archived" || it.status === "doing" ? it.status : void 0;
      const now = nowIso();
      const saved = store.update((s) => {
        let cur = it.id ? s.ledger.find((x) => x.id === it.id) : void 0;
        if (!cur) {
          cur = { id: newId("fsl"), item, dept: "", owner: "", requirement: "", deadline: "", acceptance: "", status: "doing", escalated: false, source: (0, import_i18n6.t)("\u624B\u5DE5\u767B\u8BB0"), progress: [], createdAt: now, updatedAt: now, remindedFor: "", escalatedFor: "" };
          s.ledger.unshift(cur);
        }
        cur.item = item.slice(0, 300);
        if (it.dept !== void 0) cur.dept = String(it.dept || "").slice(0, 60);
        if (it.owner !== void 0) cur.owner = String(it.owner || "").slice(0, 60);
        if (it.requirement !== void 0) cur.requirement = String(it.requirement || "").slice(0, 500);
        if (it.acceptance !== void 0) cur.acceptance = String(it.acceptance || "").slice(0, 300);
        if (it.deadline !== void 0) cur.deadline = deadline;
        if (status && status !== cur.status) {
          cur.progress.push({ at: now, text: (0, import_i18n6.t)("\u72B6\u6001\u6539\u4E3A\uFF1A{p0}", { p0: status === "done" ? (0, import_i18n6.t)("\u5DF2\u5B8C\u6210") : status === "archived" ? (0, import_i18n6.t)("\u5DF2\u5F52\u6863") : (0, import_i18n6.t)("\u8FDB\u884C\u4E2D") }) });
          cur.status = status;
          if (status !== "doing") cur.escalated = false;
        }
        cur.status = ledgerStatus(cur, Date.now());
        if (cur.status === "doing") cur.escalated = false;
        cur.updatedAt = now;
        return cur;
      });
      pushState();
      return saved;
    },
    "ledger.progress": (p) => {
      const text2 = String(p?.text || "").trim();
      if (!text2) throw new Error((0, import_i18n6.t)("\u8BF7\u586B\u5199\u8FDB\u5C55"));
      store.update((s) => {
        const cur = requireFound(s.ledger.find((x) => x.id === p.id), (0, import_i18n6.t)("\u6539\u5584\u4E8B\u9879"));
        cur.progress.push({ at: nowIso(), text: text2.slice(0, 500) });
        cur.updatedAt = nowIso();
      });
      pushState();
      return true;
    },
    "ledger.remove": (p) => {
      store.update((s) => {
        s.ledger = s.ledger.filter((x) => x.id !== p?.id);
      });
      pushState();
      return true;
    },
    "ledger.export": () => {
      const list = store.read().ledger;
      if (!list.length) throw new Error((0, import_i18n6.t)("\u53F0\u8D26\u8FD8\u662F\u7A7A\u7684"));
      const now = Date.now();
      const label = (st) => ({ doing: (0, import_i18n6.t)("\u8FDB\u884C\u4E2D"), done: (0, import_i18n6.t)("\u5DF2\u5B8C\u6210"), overdue: (0, import_i18n6.t)("\u903E\u671F"), archived: (0, import_i18n6.t)("\u5DF2\u5F52\u6863") })[st];
      const file = (0, import_node_path5.join)(outputDir((0, import_i18n6.t)("\u6539\u5584\u53F0\u8D26")), `${(0, import_i18n6.t)("\u6D41\u7A0B\u65F6\u6548\u6539\u5584\u53F0\u8D26")}-${stamp()}.xlsx`);
      (0, import_excel3.writeWorkbook)(file, [{
        name: (0, import_i18n6.t)("\u6539\u5584\u53F0\u8D26"),
        headers: [(0, import_i18n6.t)("\u6539\u5584\u4E8B\u9879"), (0, import_i18n6.t)("\u8D23\u4EFB\u90E8\u95E8"), (0, import_i18n6.t)("\u8D23\u4EFB\u4EBA"), (0, import_i18n6.t)("\u6267\u884C\u8981\u6C42"), (0, import_i18n6.t)("\u6267\u884C\u671F\u9650"), (0, import_i18n6.t)("\u9A8C\u6536\u8981\u6C42"), (0, import_i18n6.t)("\u72B6\u6001"), (0, import_i18n6.t)("\u662F\u5426\u5347\u7EA7\u7763\u529E"), (0, import_i18n6.t)("\u6765\u6E90"), (0, import_i18n6.t)("\u767B\u8BB0\u65F6\u95F4"), (0, import_i18n6.t)("\u8FDB\u5C55\u8BB0\u5F55")],
        rows: list.map((l) => [l.item, l.dept, l.owner, l.requirement, l.deadline, l.acceptance, label(ledgerStatus(l, now)), l.escalated ? (0, import_i18n6.t)("\u662F") : (0, import_i18n6.t)("\u5426"), l.source, l.createdAt.slice(0, 10), l.progress.map((x) => `${x.at.slice(0, 10)} ${x.text}`).join("\n")])
      }]);
      return file;
    },
    // ── 规则 ──
    "rules.get": () => {
      const base = store.baseRules();
      const s = store.read();
      return { version: base.version, custom: !!store.customRules(), e2e: base.e2e, cssNodes: base.cssNodes, oaFkNodes: base.oaFkNodes, personal: base.personal, managers: base.managers, thresholds: thresholds(), holidays: s.settings.holidays, extraWorkdays: s.settings.extraWorkdays };
    },
    /** 导入更新后的《时效看板指标》工作簿，整体替换五张规则表 */
    "rules.import": (p) => {
      if (!p?.path || !(0, import_node_fs3.existsSync)(p.path)) throw new Error((0, import_i18n6.t)("\u6587\u4EF6\u4E0D\u5B58\u5728"));
      const r = parseRulesWorkbook(p.path, DEFAULT_RULES);
      store.setCustomRules(r.rules);
      resetDownstream(true);
      pushState();
      return { warnings: r.warnings, counts: { e2e: r.rules.e2e.length, cssNodes: r.rules.cssNodes.length, oaFkNodes: r.rules.oaFkNodes.length, personal: r.rules.personal.length, managers: r.rules.managers.length } };
    },
    "rules.reset": () => {
      store.setCustomRules(null);
      resetDownstream(true);
      pushState();
      return true;
    },
    "rules.thresholds": (p) => {
      store.update((s) => {
        s.thresholds = p?.patch ? sanitizeThresholds({ ...s.thresholds, ...p.patch }, thresholdsOf(store.baseRules())) : {};
      });
      resetDownstream(true);
      pushState();
      return thresholds();
    },
    "calendar.save": (p) => {
      const clean = (v) => [...new Set((Array.isArray(v) ? v : []).map((x) => String(x).trim()).filter(Boolean))].sort();
      const all = [...clean(p?.holidays), ...clean(p?.extraWorkdays)];
      const bad = all.filter((d) => !/^\d{4}-\d{2}-\d{2}$/.test(d) || Number.isNaN((/* @__PURE__ */ new Date(`${d}T00:00:00`)).getTime()));
      if (bad.length) throw new Error((0, import_i18n6.t)("\u8FD9\u4E9B\u65E5\u671F\u5199\u5F97\u4E0D\u5BF9\uFF08\u5E94\u4E3A 2026-10-01 \u8FD9\u6837\uFF09\uFF1A{p0}", { p0: bad.slice(0, 5).join("\u3001") }));
      store.update((s) => {
        s.settings.holidays = clean(p?.holidays);
        s.settings.extraWorkdays = clean(p?.extraWorkdays);
      });
      resetDownstream(true);
      pushState();
      return true;
    }
  };
  import_electron.ipcMain.handle(import_ipc_contracts3.IPC_CHANNELS.WORKBENCH_FS_INVOKE, async (_e, req) => {
    const fn = actions[String(req?.action || "")];
    if (!fn) throw new Error((0, import_i18n6.t)("\u672A\u77E5\u64CD\u4F5C\uFF1A{p0}", { p0: String(req?.action || "") }));
    try {
      return await fn(req.payload ?? {});
    } catch (error) {
      logger?.warn?.("flow-sla", `${req.action} failed`, { error: error?.message });
      throw new Error((0, import_userFacingError.userFacingError)(error));
    }
  });
}

// node_modules/.cache/solutions-build/workbench-flow-sla/entry.main.ts
var hostApi = 2;
var registerFunction = "registerFlowSlaHandlers";
function activate(ctx) {
  registerFlowSlaHandlers(ctx.host.deps);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  activate,
  hostApi,
  registerFunction
});
