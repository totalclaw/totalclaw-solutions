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

// node_modules/.cache/solutions-build/workbench-campus-ai/entry.main.ts
var entry_main_exports = {};
__export(entry_main_exports, {
  activate: () => activate,
  hostApi: () => hostApi,
  registerFunction: () => registerFunction
});
module.exports = __toCommonJS(entry_main_exports);

// ../../../totalclaw-solutions/solutions/workbench-campus-ai/src/main/ipc/campusAi.ipc.ts
var import_electron = require("electron");
var import_node_fs6 = require("node:fs");
var import_node_path7 = require("node:path");
var import_ipc_contracts6 = require("npm:@totalclaw/ipc-contracts");
var import_ipc_contracts7 = require("npm:@totalclaw/ipc-contracts");
var import_i18n12 = require("npm:@totalclaw/i18n");
var import_userFacingError = require("host:apps/desktop-shell/src/main/utils/userFacingError.ts");
var import_quitRegistry = require("host:apps/desktop-shell/src/main/util/quitRegistry.ts");
var import_workbenchLlm = require("host:apps/desktop-shell/src/main/services/workbenchLlm.ts");
var import_excel5 = require("host:apps/desktop-shell/src/main/services/serviceSettlement/excel.ts");

// ../../../totalclaw-solutions/solutions/workbench-campus-ai/src/main/services/campusAi/service.ts
var import_node_fs2 = require("node:fs");
var import_node_path2 = require("node:path");
var import_ipc_contracts2 = require("npm:@totalclaw/ipc-contracts");
var import_i18n5 = require("npm:@totalclaw/i18n");
var import_documentExtractor = require("host:apps/desktop-shell/src/main/services/documentExtractor.ts");
var import_excel = require("host:apps/desktop-shell/src/main/services/serviceSettlement/excel.ts");

// ../../../totalclaw-solutions/solutions/workbench-campus-ai/src/main/services/campusAi/kb.ts
var import_textAnalysis = require("host:apps/desktop-shell/src/main/services/knowledgeBase/textAnalysis.ts");
var import_retrieval = require("host:apps/desktop-shell/src/main/services/knowledgeBase/retrieval.ts");
function buildIndex(text) {
  const chunks = (0, import_textAnalysis.chunkText)(text, { size: 260, overlap: 40 }).map((c, i) => ({ i, text: c.text.trim() })).filter((c) => c.text);
  const vectors = chunks.map((c) => Buffer.from((0, import_textAnalysis.localEmbed)(c.text).buffer).toString("base64"));
  return { chunks, vectors, dim: import_textAnalysis.LOCAL_EMBEDDER_DIM };
}
function decodeVector(b64) {
  const bytes = new Uint8Array(Buffer.from(b64, "base64"));
  return new Float32Array(bytes.buffer, 0, Math.floor(bytes.byteLength / 4));
}
function normQuestion(q) {
  return String(q || "").replace(/[！-～]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 65248)).toLowerCase().replace(/[\s\p{P}\p{S}]+/gu, "").replace(/(请问|你好|您好|老师|同学|想问一下|想问|问一下|吗|呢|呀|啊)/g, "");
}
function tokenSet(text) {
  return new Set((0, import_textAnalysis.contentTokens)(text));
}
function questionSimilarity(a, b) {
  const na = normQuestion(a);
  const nb = normQuestion(b);
  if (!na || !nb) return 0;
  if (na === nb) return 1;
  const ta = tokenSet(a);
  const tb = tokenSet(b);
  if (!ta.size || !tb.size) return 0;
  let inter = 0;
  for (const t of ta) if (tb.has(t)) inter++;
  return 2 * inter / (ta.size + tb.size);
}
var FAQ_DIRECT = 0.82;
function matchFaq(faqs, question) {
  let best = null;
  for (const f of faqs) {
    for (const q of [f.question, ...f.similar]) {
      const s = questionSimilarity(question, q);
      if (!best || s > best.score) best = { faq: f, score: s };
    }
  }
  return best && best.score >= FAQ_DIRECT ? best : null;
}
function campusScore(vectorSim, keywordRatio) {
  return 0.5 * Math.max(0, vectorSim) + 0.5 * keywordRatio;
}
function search(src, query, topK = 6) {
  const terms = (0, import_retrieval.queryTerms)(query);
  const qv = (0, import_textAnalysis.localEmbed)(query);
  const hits = [];
  for (const d of src.docs) {
    if (!d.index) continue;
    d.index.chunks.forEach((c, k) => {
      const kw = (0, import_textAnalysis.keywordHitRatio)(terms, c.text);
      const vs = d.index.vectors[k] ? (0, import_textAnalysis.cosine)(qv, decodeVector(d.index.vectors[k])) : 0;
      const score = campusScore(vs, kw);
      if (score > 0) hits.push({ kind: "doc", id: d.id, title: d.name, dept: d.dept, text: c.text, score, chunk: c.i });
    });
  }
  for (const f of src.faqs) {
    const text = `${f.question}
${f.answer}`;
    const kw = (0, import_textAnalysis.keywordHitRatio)(terms, `${text}
${f.similar.join("\n")}`);
    const vs = (0, import_textAnalysis.cosine)(qv, (0, import_textAnalysis.localEmbed)(`${f.question} ${f.similar.join(" ")}`));
    const score = campusScore(vs, kw);
    if (score > 0) hits.push({ kind: "faq", id: f.id, title: f.question, dept: f.dept, text, score });
  }
  hits.sort((a, b) => b.score - a.score);
  const perDoc = /* @__PURE__ */ new Map();
  const out = [];
  for (const h of hits) {
    const n = perDoc.get(h.id) || 0;
    if (n >= 3) continue;
    perDoc.set(h.id, n + 1);
    out.push(h);
    if (out.length >= topK) break;
  }
  return out;
}
var DEPT_GUESS_MIN = 0.25;

// ../../../totalclaw-solutions/solutions/workbench-campus-ai/src/main/services/campusAi/qa.ts
var import_i18n2 = require("npm:@totalclaw/i18n");
var import_groundedQa = require("host:apps/desktop-shell/src/main/services/groundedQa.logic.ts");

// ../../../totalclaw-solutions/solutions/workbench-campus-ai/src/main/services/campusAi/domains.ts
var import_i18n = require("npm:@totalclaw/i18n");

// ../../../totalclaw-solutions/solutions/workbench-campus-ai/src/main/services/campusAi/domains.json
var domains_default = {
  domains: [
    { id: "admission", name: "\u62DB\u751F\u8FCE\u65B0\u52A9\u624B", dept: "\u62DB\u751F\u529E", keywords: ["\u62DB\u751F", "\u5F55\u53D6", "\u62A5\u5230", "\u65B0\u751F", "\u8FCE\u65B0", "\u519B\u8BAD", "\u4E13\u5347\u672C", "\u5355\u62DB", "\u5FD7\u613F", "\u5206\u6570\u7EBF", "\u63A5\u7AD9", "\u5165\u5B66"] },
    { id: "academic", name: "\u6559\u52A1\u5B66\u4E1A\u52A9\u624B", dept: "\u6559\u52A1\u5904", keywords: ["\u8865\u8003", "\u91CD\u4FEE", "\u7F13\u8003", "\u8003\u8BD5", "\u6210\u7EE9", "\u5B66\u5206", "\u9009\u8BFE", "\u8BFE\u8868", "\u8F6C\u4E13\u4E1A", "\u6BD5\u4E1A", "\u5B66\u7C4D", "\u4F11\u5B66", "\u590D\u5B66", "\u7EE9\u70B9", "\u9884\u8B66", "\u6559\u6750", "\u56DB\u516D\u7EA7", "\u8BC1\u4E66"] },
    { id: "aid", name: "\u5956\u52A9\u8D44\u52A9\u52A9\u624B", dept: "\u5B66\u5DE5\u5904", keywords: ["\u5956\u5B66\u91D1", "\u52A9\u5B66\u91D1", "\u52A9\u5B66\u8D37\u6B3E", "\u8D44\u52A9", "\u56F0\u96BE", "\u52E4\u5DE5\u52A9\u5B66", "\u8865\u52A9", "\u51CF\u514D", "\u7EFF\u8272\u901A\u9053", "\u52B1\u5FD7"] },
    { id: "career", name: "\u5C31\u4E1A\u521B\u4E1A\u52A9\u624B", dept: "\u5C31\u4E1A\u6307\u5BFC\u4E2D\u5FC3", keywords: ["\u5C31\u4E1A", "\u5B9E\u4E60", "\u62DB\u8058", "\u7B80\u5386", "\u9762\u8BD5", "\u521B\u4E1A", "\u4E09\u65B9\u534F\u8BAE", "\u6D3E\u9063", "\u6863\u6848", "\u5BA3\u8BB2\u4F1A", "offer"] },
    { id: "life", name: "\u540E\u52E4\u751F\u6D3B\u52A9\u624B", dept: "\u540E\u52E4\u5904", keywords: ["\u5BBF\u820D", "\u98DF\u5802", "\u70ED\u6C34", "\u62A5\u4FEE", "\u6821\u56ED\u5361", "\u996D\u5361", "\u7184\u706F", "\u6D17\u6D74", "\u5FEB\u9012", "\u505C\u7535", "\u7A7A\u8C03", "\u5E8A\u4F4D", "\u6E05\u771F", "\u6821\u533B\u9662", "\u533B\u52A1\u5BA4"] },
    { id: "wellbeing", name: "\u5FC3\u7406\u5173\u6000\u52A9\u624B", dept: "\u5B66\u5DE5\u5904", keywords: ["\u5FC3\u7406", "\u538B\u529B", "\u7126\u8651", "\u5931\u7720", "\u60C5\u7EEA", "\u6291\u90C1", "\u54A8\u8BE2\u4E2D\u5FC3", "\u4EBA\u9645\u5173\u7CFB"] },
    { id: "it", name: "\u4FE1\u606F\u5316\u670D\u52A1\u52A9\u624B", dept: "\u4FE1\u606F\u4E2D\u5FC3", keywords: ["wifi", "\u65E0\u7EBF", "\u7F51\u7EDC", "\u6821\u56ED\u7F51", "\u5BC6\u7801", "\u8D26\u53F7", "\u90AE\u7BB1", "vpn", "\u7EDF\u4E00\u8EAB\u4EFD", "\u95E8\u6237", "\u6559\u52A1\u7CFB\u7EDF\u767B\u5F55", "\u6253\u5370"] },
    { id: "library", name: "\u56FE\u4E66\u9986\u52A9\u624B", dept: "\u56FE\u4E66\u9986", keywords: ["\u56FE\u4E66\u9986", "\u501F\u4E66", "\u501F\u9605", "\u8FD8\u4E66", "\u81EA\u4E60\u5BA4", "\u77E5\u7F51", "\u6570\u636E\u5E93", "\u6587\u732E", "\u5EA7\u4F4D\u9884\u7EA6"] },
    { id: "finance", name: "\u8D22\u52A1\u7F34\u8D39\u52A9\u624B", dept: "\u8D22\u52A1\u5904", keywords: ["\u5B66\u8D39", "\u7F34\u8D39", "\u9000\u8D39", "\u53D1\u7968", "\u62A5\u9500", "\u4F4F\u5BBF\u8D39", "\u6536\u8D39", "\u6B20\u8D39"] },
    { id: "research", name: "\u79D1\u7814\u670D\u52A1\u52A9\u624B", dept: "\u79D1\u7814\u5904", keywords: ["\u79D1\u7814", "\u8BFE\u9898", "\u9879\u76EE\u7533\u62A5", "\u8BBA\u6587", "\u4E13\u5229", "\u7ECF\u8D39", "\u6A2A\u5411", "\u7EB5\u5411", "\u7ED3\u9898"] }
  ],
  fallback: { id: "general", name: "\u6821\u56ED\u7EFC\u5408\u52A9\u624B", dept: "\u5F85\u5206\u6D3E" }
};

// ../../../totalclaw-solutions/solutions/workbench-campus-ai/src/main/services/campusAi/domains.ts
var FALLBACK_DOMAIN = domains_default.fallback.id;
function names() {
  return {
    admission: { name: (0, import_i18n.t)("\u62DB\u751F\u8FCE\u65B0\u52A9\u624B"), dept: (0, import_i18n.t)("\u62DB\u751F\u529E") },
    academic: { name: (0, import_i18n.t)("\u6559\u52A1\u5B66\u4E1A\u52A9\u624B"), dept: (0, import_i18n.t)("\u6559\u52A1\u5904") },
    aid: { name: (0, import_i18n.t)("\u5956\u52A9\u8D44\u52A9\u52A9\u624B"), dept: (0, import_i18n.t)("\u5B66\u5DE5\u5904") },
    career: { name: (0, import_i18n.t)("\u5C31\u4E1A\u521B\u4E1A\u52A9\u624B"), dept: (0, import_i18n.t)("\u5C31\u4E1A\u6307\u5BFC\u4E2D\u5FC3") },
    life: { name: (0, import_i18n.t)("\u540E\u52E4\u751F\u6D3B\u52A9\u624B"), dept: (0, import_i18n.t)("\u540E\u52E4\u5904") },
    wellbeing: { name: (0, import_i18n.t)("\u5FC3\u7406\u5173\u6000\u52A9\u624B"), dept: (0, import_i18n.t)("\u5B66\u5DE5\u5904") },
    it: { name: (0, import_i18n.t)("\u4FE1\u606F\u5316\u670D\u52A1\u52A9\u624B"), dept: (0, import_i18n.t)("\u4FE1\u606F\u4E2D\u5FC3") },
    library: { name: (0, import_i18n.t)("\u56FE\u4E66\u9986\u52A9\u624B"), dept: (0, import_i18n.t)("\u56FE\u4E66\u9986") },
    finance: { name: (0, import_i18n.t)("\u8D22\u52A1\u7F34\u8D39\u52A9\u624B"), dept: (0, import_i18n.t)("\u8D22\u52A1\u5904") },
    research: { name: (0, import_i18n.t)("\u79D1\u7814\u670D\u52A1\u52A9\u624B"), dept: (0, import_i18n.t)("\u79D1\u7814\u5904") },
    [FALLBACK_DOMAIN]: { name: (0, import_i18n.t)("\u6821\u56ED\u7EFC\u5408\u52A9\u624B"), dept: (0, import_i18n.t)("\u5F85\u5206\u6D3E") }
  };
}
function listDomains() {
  const n = names();
  return [...domains_default.domains.map((d) => d.id), FALLBACK_DOMAIN].map((id) => ({ id, name: n[id]?.name || id, dept: n[id]?.dept || "" }));
}
function domainOf(id) {
  const n = names();
  const key = id && n[id] ? id : FALLBACK_DOMAIN;
  return { id: key, name: n[key].name, dept: n[key].dept };
}
function classifyDomain(question) {
  const q = String(question || "").toLowerCase();
  let best = { id: FALLBACK_DOMAIN, hits: 0, len: 0 };
  for (const d of domains_default.domains) {
    let hits = 0;
    let len = 0;
    for (const k of d.keywords) {
      if (q.includes(k.toLowerCase())) {
        hits++;
        len = Math.max(len, k.length);
      }
    }
    if (hits > best.hits || hits === best.hits && hits > 0 && len > best.len) best = { id: d.id, hits, len };
  }
  return best.id;
}

// ../../../totalclaw-solutions/solutions/workbench-campus-ai/src/main/services/campusAi/qa.ts
var SENSITIVE_PATTERNS = [
  /自杀|轻生|不想活|活不下去|结束(自己的)?生命|寻死|跳楼|割腕|安眠药.*(吃|吞)|想死/,
  /自残|伤害自己|划(伤|破)自己/,
  /被(人)?(打|殴打|威胁|跟踪|勒索|敲诈|性侵|猥亵|强奸)|校园欺凌|霸凌|性骚扰/,
  /被骗|电信诈骗|网络诈骗|裸聊|校园贷|套路贷|网贷.*(还不上|逾期)/,
  /抑郁(症)?.*(严重|很久|好久)|崩溃|绝望/
];
function isSensitive(question) {
  const q = String(question || "");
  return SENSITIVE_PATTERNS.some((re) => re.test(q));
}
function sensitiveReply(hotline, dept) {
  const lines = [
    (0, import_i18n2.t)("\u4F60\u7684\u95EE\u9898\u6211\u4EEC\u5F88\u91CD\u89C6\uFF0C\u8BF7\u5148\u786E\u4FDD\u81EA\u5DF1\u7684\u5B89\u5168\u3002"),
    (0, import_i18n2.t)("\u5982\u679C\u6B63\u5904\u5728\u5371\u9669\u4E2D\uFF0C\u8BF7\u7ACB\u5373\u62E8\u6253 110\uFF08\u62A5\u8B66\uFF09\u6216 120\uFF08\u6025\u6551\uFF09\u3002")
  ];
  if (hotline) lines.push((0, import_i18n2.t)("\u5B66\u6821\u6C42\u52A9\u7535\u8BDD\uFF1A{p0}", { p0: hotline }));
  lines.push((0, import_i18n2.t)("\u4E5F\u53EF\u4EE5\u9A6C\u4E0A\u8054\u7CFB\u4F60\u7684\u8F85\u5BFC\u5458\u6216\u8EAB\u8FB9\u4FE1\u4EFB\u7684\u8001\u5E08\u3001\u540C\u5B66\u3002\u8FD9\u6761\u6D88\u606F\u5DF2\u7ECF\u63D0\u9192{p0}\u7684\u8001\u5E08\uFF0C\u4F1A\u5C3D\u5FEB\u8054\u7CFB\u4F60\u3002", { p0: dept }));
  return lines.join("\n");
}
function noEvidenceReply(dept) {
  return (0, import_i18n2.t)("\u77E5\u8BC6\u5E93\u91CC\u8FD8\u6CA1\u6709\u8FD9\u4E2A\u95EE\u9898\u7684\u4F9D\u636E\uFF0C\u6211\u4E0D\u4F1A\u51ED\u731C\u6D4B\u56DE\u7B54\u3002\u95EE\u9898\u5DF2\u8F6C\u7ED9{p0}\uFF0C\u7B54\u590D\u540E\u4F1A\u5728\u300C\u6211\u7684\u95EE\u9898\u300D\u91CC\u770B\u5230\u3002", { p0: dept });
}
function toSource(h) {
  return { kind: h.kind, id: h.id, title: h.title, dept: h.dept, snippet: h.text.slice(0, 220) };
}
function buildAnswerPrompt(question, hits, schoolName) {
  const refs = hits.map((h, i) => `${(0, import_i18n2.t)("\u8D44\u6599 {n}\uFF1A{title}\uFF08{dept}\uFF09", { n: String(i + 1), title: h.title, dept: h.dept || (0, import_i18n2.t)("\u672A\u5206\u90E8\u95E8") })}
${h.text}`).join("\n\n");
  return [
    (0, import_i18n2.t)("\u4F60\u662F{p0}\u7684\u6821\u56ED\u670D\u52A1\u52A9\u624B\uFF0C\u56DE\u7B54\u5B66\u751F\u548C\u8001\u5E08\u7684\u95EE\u9898\u3002\u4F60\u53EA\u80FD\u4F9D\u636E\u4E0B\u9762\u7ED9\u51FA\u7684\u8D44\u6599\u539F\u6587\u56DE\u7B54\uFF0C\u4E0D\u5F97\u8865\u5145\u8D44\u6599\u4E4B\u5916\u7684\u4EFB\u4F55\u5185\u5BB9\uFF0C\u4E0D\u5F97\u63A8\u6D4B\u3002", { p0: schoolName }),
    (0, import_i18n2.t)("\u76F4\u63A5\u7ED9\u51FA\u7B54\u6848\uFF1A\u4E0D\u8981\u5F00\u573A\u767D\uFF0C\u4E0D\u8981\u590D\u8FF0\u95EE\u9898\uFF0C\u4E0D\u8981\u5199\u300C\u6839\u636E\u8D44\u6599\u300D\u4E4B\u7C7B\u7684\u8BDD\u3002"),
    (0, import_i18n2.t)("\u65F6\u95F4\u3001\u5730\u70B9\u3001\u91D1\u989D\u3001\u7535\u8BDD\u3001\u6761\u4EF6\u7B49\u5177\u4F53\u4FE1\u606F\u5FC5\u987B\u4E0E\u8D44\u6599\u539F\u6587\u4E00\u5B57\u4E0D\u5DEE\uFF1B\u8D44\u6599\u91CC\u6CA1\u6709\u7684\u5177\u4F53\u4FE1\u606F\u4E00\u5F8B\u4E0D\u5199\u3002"),
    (0, import_i18n2.t)("\u7528\u7EAF\u6587\u672C\u8F93\u51FA\uFF0C\u4E0D\u8981\u4F7F\u7528 Markdown \u7B26\u53F7\uFF1B\u9700\u8981\u5206\u70B9\u65F6\u7528\u300C1. 2. 3.\u300D\u3002"),
    (0, import_i18n2.t)("\u8D44\u6599\u53EA\u80FD\u56DE\u7B54\u95EE\u9898\u7684\u4E00\u90E8\u5206\u65F6\uFF0C\u5C31\u56DE\u7B54\u8FD9\u4E00\u90E8\u5206\u3002"),
    `${(0, import_i18n2.t)("\u53EA\u6709\u8D44\u6599\u4E0E\u95EE\u9898\u5B8C\u5168\u65E0\u5173\u65F6\uFF0C\u624D\u53EA\u8F93\u51FA\uFF1A")}${import_groundedQa.NO_ANSWER}`,
    `${(0, import_i18n2.t)("\u6700\u540E\u5355\u72EC\u4E00\u884C\u5199\u51FA\u5B9E\u9645\u7528\u5230\u7684\u8D44\u6599\u7F16\u53F7\uFF0C\u683C\u5F0F\uFF1A")}${import_groundedQa.SOURCES_TAG} 1,3`,
    (0, import_i18n2.t)("\u8BF7\u7528\u63D0\u95EE\u8005\u4F7F\u7528\u7684\u8BED\u8A00\u56DE\u7B54\u3002"),
    "",
    (0, import_i18n2.t)("=== \u53EF\u7528\u8D44\u6599 ==="),
    refs,
    "",
    (0, import_i18n2.t)("=== \u95EE\u9898 ==="),
    question
  ].join("\n");
}
function digitsNorm(s) {
  return String(s || "").replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 65248)).replace(/(\d),(?=\d{3})/g, "$1").replace(/\s+/g, "");
}
function unsupportedNumbers(answer, sourcesText) {
  const hay = digitsNorm(sourcesText);
  const nums = digitsNorm(answer).match(/\d+(?:\.\d+)?/g) || [];
  const bad = /* @__PURE__ */ new Set();
  for (const n of nums) {
    if (n.length < 2 && !n.includes(".")) continue;
    if (!hay.includes(n)) bad.add(n);
  }
  return [...bad];
}
function quoteReply(hits) {
  return [
    (0, import_i18n2.t)("\u4EE5\u4E0B\u662F\u77E5\u8BC6\u5E93\u91CC\u7684\u76F8\u5173\u539F\u6587\uFF0C\u8BF7\u4EE5\u539F\u6587\u4E3A\u51C6\uFF1A"),
    ...hits.slice(0, 3).map((h, i) => `${i + 1}. \u300A${h.title}\u300B\uFF1A${h.text.replace(/\s+/g, " ").slice(0, 260)}`)
  ].join("\n");
}
function routeDept(hits, domain, fallback) {
  const top = hits.find((h) => h.dept);
  if (top && top.score >= DEPT_GUESS_MIN) return top.dept;
  if (domain !== FALLBACK_DOMAIN) return domainOf(domain).dept;
  return fallback;
}
async function answerQuestion(input) {
  const q = String(input.question || "").trim();
  if (isSensitive(q)) {
    return { kind: "sensitive", domain: "wellbeing", text: sensitiveReply(input.hotline, input.sensitiveDept), sources: [], ticketDept: input.sensitiveDept };
  }
  const domain = classifyDomain(q);
  const faq = matchFaq(input.faqs, q);
  if (faq) {
    return { kind: "faq", domain, text: faq.faq.answer, faqId: faq.faq.id, sources: [{ kind: "faq", id: faq.faq.id, title: faq.faq.question, dept: faq.faq.dept, snippet: faq.faq.answer.slice(0, 220) }] };
  }
  const hits = search(input.source, q, 6);
  const top = hits[0];
  if (!top || top.score < input.minScore) {
    const dept = routeDept(hits, domain, input.defaultDept);
    return { kind: "no_evidence", domain, text: noEvidenceReply(dept), sources: [], ticketDept: dept };
  }
  const usable = hits.filter((h) => h.score >= input.minScore * 0.6);
  const { text: raw, model } = await input.llm(buildAnswerPrompt(q, usable, input.schoolName));
  const parsed = (0, import_groundedQa.parseAnswer)(raw, usable.length);
  if (parsed.noAnswer) {
    const dept = routeDept(usable, domain, input.defaultDept);
    return { kind: "no_evidence", domain, text: noEvidenceReply(dept), sources: [], ticketDept: dept, model };
  }
  const used = parsed.used.map((i) => usable[i]).filter(Boolean);
  const bad = unsupportedNumbers(parsed.text, used.map((h) => h.text).join("\n"));
  if (bad.length) {
    return { kind: "quote", domain, text: quoteReply(used), sources: used.map(toSource), model, unsupported: bad };
  }
  return { kind: "answer", domain, text: parsed.text, sources: used.map(toSource), model };
}

// ../../../totalclaw-solutions/solutions/workbench-campus-ai/src/main/services/campusAi/scenarios.ts
var import_ipc_contracts = require("npm:@totalclaw/ipc-contracts");
var import_i18n3 = require("npm:@totalclaw/i18n");
function builtinScenarios() {
  return [
    { id: "plan-kb", direction: "plan", name: (0, import_i18n3.t)("\u7EDF\u4E00\u6821\u56ED\u77E5\u8BC6\u5E95\u5EA7"), desc: (0, import_i18n3.t)("\u5404\u90E8\u95E8\u5236\u5EA6\u3001\u6307\u5357\u3001FAQ \u6C47\u6210\u4E00\u4E2A\u77E5\u8BC6\u5E93\uFF0C\u95EE\u7B54\u4E0E\u52A9\u6559\u5171\u7528"), dept: (0, import_i18n3.t)("\u4FE1\u606F\u4E2D\u5FC3"), target: "tab:kb", usage: [{ module: "kb" }] },
    { id: "plan-apps", direction: "plan", name: (0, import_i18n3.t)("AI \u5E94\u7528\u89C4\u5212\u4E0E\u5EFA\u8BBE\u53F0\u8D26"), desc: (0, import_i18n3.t)("\u4E94\u5927\u65B9\u5411\u573A\u666F\u76EE\u5F55\u3001\u5EFA\u8BBE\u9636\u6BB5\u4E0E\u8D23\u4EFB\u90E8\u95E8"), dept: (0, import_i18n3.t)("\u4FE1\u606F\u4E2D\u5FC3"), target: "tab:apps", usage: [{ module: "apps" }] },
    { id: "plan-ops", direction: "plan", name: (0, import_i18n3.t)("\u6A21\u578B\u670D\u52A1\u4E0E\u8C03\u7528\u5BA1\u8BA1"), desc: (0, import_i18n3.t)("\u670D\u52A1\u72B6\u6001\u3001\u8C03\u7528\u7559\u75D5\u3001\u6570\u636E\u4FDD\u7559\u4E0E\u6E05\u7406"), dept: (0, import_i18n3.t)("\u4FE1\u606F\u4E2D\u5FC3"), target: "tab:ops", usage: [{ module: "ops" }] },
    { id: "teach-tutor", direction: "teach", name: (0, import_i18n3.t)("\u8BFE\u7A0B\u52A9\u6559"), desc: (0, import_i18n3.t)("\u5B66\u751F\u95EE\u8BFE\u7A0B\u95EE\u9898\uFF0C\u53EA\u4F9D\u636E\u8BE5\u8BFE\u7A0B\u8D44\u6599\u4F5C\u7B54"), dept: (0, import_i18n3.t)("\u6559\u52A1\u5904"), target: "tab:teach", usage: [{ module: "teach", action: "tutor" }] },
    { id: "teach-quiz", direction: "teach", name: (0, import_i18n3.t)("\u667A\u80FD\u51FA\u9898"), desc: (0, import_i18n3.t)("\u4ECE\u8BFE\u7A0B\u8D44\u6599\u51FA\u9898\uFF0C\u6BCF\u9898\u9644\u539F\u6587\u51FA\u5904"), dept: (0, import_i18n3.t)("\u6559\u52A1\u5904"), target: "tab:teach", usage: [{ module: "teach", action: "quiz" }] },
    { id: "teach-grade", direction: "teach", name: (0, import_i18n3.t)("\u4F5C\u4E1A\u6279\u6539"), desc: (0, import_i18n3.t)("\u5BA2\u89C2\u9898\u6309\u7B54\u6848\u5224\u5206\uFF0C\u4E3B\u89C2\u9898\u7ED9\u5EFA\u8BAE\u5206\u7531\u6559\u5E08\u786E\u8BA4"), dept: (0, import_i18n3.t)("\u6559\u52A1\u5904"), target: "tab:teach", usage: [{ module: "teach", action: "grade" }] },
    { id: "teach-warning", direction: "teach", name: (0, import_i18n3.t)("\u5B66\u4E1A\u9884\u8B66"), desc: (0, import_i18n3.t)("\u6210\u7EE9\u4E0E\u8003\u52E4\u7B97\u4E09\u7EA7\u9884\u8B66\uFF0C\u8F85\u5BFC\u5458\u590D\u6838\u540E\u8C08\u8BDD"), dept: (0, import_i18n3.t)("\u5B66\u5DE5\u5904"), target: "tab:warning", usage: [{ module: "warning" }] },
    { id: "teach-lesson", direction: "teach", name: (0, import_i18n3.t)("\u6559\u6848\u751F\u6210"), desc: (0, import_i18n3.t)("\u6309\u8BFE\u7A0B\u8D44\u6599\u751F\u6210\u6559\u6848\u4E0E\u8BFE\u5802\u6750\u6599"), dept: (0, import_i18n3.t)("\u6559\u52A1\u5904"), target: "route:/workbenches/edu-hub", usage: [] },
    { id: "research-stats", direction: "research", name: (0, import_i18n3.t)("\u79D1\u7814\u6210\u679C\u7EDF\u8BA1"), desc: (0, import_i18n3.t)("\u6309\u5B66\u9662\u3001\u7C7B\u578B\u3001\u5E74\u5EA6\u3001\u7EA7\u522B\u7EDF\u8BA1\u6210\u679C\u4E0E\u7ECF\u8D39"), dept: (0, import_i18n3.t)("\u79D1\u7814\u5904"), target: "tab:research", usage: [{ module: "research", action: "outputs" }] },
    { id: "research-guide", direction: "research", name: (0, import_i18n3.t)("\u7533\u62A5\u6307\u5357\u89E3\u8BFB"), desc: (0, import_i18n3.t)("\u62BD\u53D6\u622A\u6B62\u65F6\u95F4\u3001\u7533\u62A5\u6761\u4EF6\u3001\u6750\u6599\u6E05\u5355\uFF0C\u6BCF\u6761\u9644\u539F\u6587"), dept: (0, import_i18n3.t)("\u79D1\u7814\u5904"), target: "tab:research", usage: [{ module: "research", action: "guide" }] },
    { id: "research-writer", direction: "research", name: (0, import_i18n3.t)("\u7533\u62A5\u4E66\u4E0E\u8BBA\u6587\u5199\u4F5C"), desc: (0, import_i18n3.t)("\u5F15\u7528\u53EF\u6838\u5BF9\u7684\u5B66\u672F\u5199\u4F5C"), dept: (0, import_i18n3.t)("\u79D1\u7814\u5904"), target: "route:/workbenches/academic-writer", usage: [] },
    { id: "gov-doc", direction: "gov", name: (0, import_i18n3.t)("\u516C\u6587\u52A9\u624B"), desc: (0, import_i18n3.t)("\u901A\u77E5\u3001\u8BF7\u793A\u3001\u62A5\u544A\u3001\u51FD\u3001\u7EAA\u8981\uFF0C\u6309\u56FD\u6807\u7248\u5F0F\u5BFC\u51FA Word"), dept: (0, import_i18n3.t)("\u515A\u653F\u529E"), target: "tab:gov", usage: [{ module: "gov", action: "doc" }] },
    { id: "gov-hotspot", direction: "gov", name: (0, import_i18n3.t)("\u8BC9\u6C42\u70ED\u70B9\u5206\u6790"), desc: (0, import_i18n3.t)("\u5E08\u751F\u8BC9\u6C42\u6309\u9886\u57DF\u3001\u90E8\u95E8\u3001\u65F6\u95F4\u7EDF\u8BA1\u70ED\u70B9\u4E0E\u77E5\u8BC6\u7F3A\u53E3"), dept: (0, import_i18n3.t)("\u515A\u653F\u529E"), target: "tab:gov", usage: [{ module: "gov", action: "hotspot" }] },
    { id: "service-qa", direction: "service", name: (0, import_i18n3.t)("\u6821\u56ED\u667A\u80FD\u95EE\u7B54"), desc: (0, import_i18n3.t)("\u6709\u51FA\u5904\u7684\u56DE\u7B54\uFF0C\u6CA1\u4F9D\u636E\u4E0D\u7F16\u3001\u8F6C\u90E8\u95E8"), dept: (0, import_i18n3.t)("\u5B66\u5DE5\u5904"), target: "tab:qa", usage: [{ module: "qa" }] },
    { id: "service-mobile", direction: "service", name: (0, import_i18n3.t)("\u5B66\u751F\u624B\u673A\u626B\u7801\u63D0\u95EE"), desc: (0, import_i18n3.t)("\u6821\u56ED\u7F51\u5185\u626B\u7801\u5373\u7528\uFF0C\u533F\u540D\u4F1A\u8BDD"), dept: (0, import_i18n3.t)("\u4FE1\u606F\u4E2D\u5FC3"), target: "tab:qa", usage: [{ module: "mobile" }] },
    { id: "service-ticket", direction: "service", name: (0, import_i18n3.t)("\u8F6C\u529E\u95ED\u73AF"), desc: (0, import_i18n3.t)("\u7B54\u4E0D\u4E86\u7684\u8F6C\u90E8\u95E8\uFF0C\u7B54\u590D\u6C89\u6DC0\u4E3A FAQ"), dept: (0, import_i18n3.t)("\u515A\u653F\u529E"), target: "tab:tickets", usage: [{ module: "ticket" }] },
    { id: "service-care", direction: "service", name: (0, import_i18n3.t)("\u5FC3\u7406\u5371\u673A\u8BC6\u522B"), desc: (0, import_i18n3.t)("\u654F\u611F\u95EE\u9898\u7ACB\u5373\u7ED9\u6C42\u52A9\u65B9\u5F0F\u5E76\u7F6E\u9876\u63D0\u9192"), dept: (0, import_i18n3.t)("\u5B66\u5DE5\u5904"), target: "tab:tickets", usage: [] }
  ];
}
function directionLabel(d) {
  return { plan: (0, import_i18n3.t)("\u7EDF\u4E00\u89C4\u5212\u3001\u5EFA\u8BBE\u4E0E\u8FD0\u7EF4"), teach: (0, import_i18n3.t)("\u6559\u5B66"), research: (0, import_i18n3.t)("\u79D1\u7814"), gov: (0, import_i18n3.t)("\u6821\u52A1\u6CBB\u7406"), service: (0, import_i18n3.t)("\u5E08\u751F\u670D\u52A1") }[d];
}
var STAGES = ["planned", "building", "live"];
function normalizeScenarioInput(raw) {
  const name = String(raw?.name || "").trim().slice(0, 60);
  if (!name) throw new Error((0, import_i18n3.t)("\u8BF7\u586B\u5199\u573A\u666F\u540D\u79F0"));
  return {
    id: raw.id,
    direction: import_ipc_contracts.CA_DIRECTIONS.includes(raw.direction) ? raw.direction : "plan",
    name,
    desc: String(raw.desc || "").trim().slice(0, 200),
    dept: String(raw.dept || "").trim().slice(0, 30),
    stage: STAGES.includes(raw.stage) ? raw.stage : "planned",
    note: String(raw.note || "").trim().slice(0, 300)
  };
}
function usageCount(audit, rules, since) {
  if (!rules.length) return 0;
  let n = 0;
  for (const a of audit) {
    if (Date.parse(a.at) < since) continue;
    if (rules.some((r) => r.module === a.module && (!r.action || a.action.startsWith(r.action)))) n++;
  }
  return n;
}
function listScenarios(store2, audit, now = Date.now()) {
  const since = now - 30 * 864e5;
  const out = builtinScenarios().map((b) => {
    const o = store2.overrides[b.id] || {};
    return {
      id: b.id,
      direction: b.direction,
      name: b.name,
      desc: b.desc,
      dept: o.dept || b.dept,
      stage: o.stage || "live",
      target: b.target,
      builtin: true,
      note: o.note,
      usage30d: usageCount(audit, b.usage, since)
    };
  });
  for (const c of store2.custom) out.push({ ...c, builtin: false, usage30d: 0 });
  return out;
}

// ../../../totalclaw-solutions/solutions/workbench-campus-ai/src/main/services/campusAi/store.ts
var import_node_fs = require("node:fs");
var import_node_path = require("node:path");
var import_node_crypto = require("node:crypto");
var import_i18n4 = require("npm:@totalclaw/i18n");
var import_accountScope = require("host:apps/desktop-shell/src/main/services/accountScope.ts");
var QA_LIMIT = 5e3;
var TICKET_LIMIT = 2e3;
var SESSION_LIMIT = 5e3;
function newId(prefix) {
  return `${prefix}_${(0, import_node_crypto.randomUUID)().replace(/-/g, "").slice(0, 12)}`;
}
function newCampusKey() {
  return (0, import_node_crypto.randomBytes)(6).toString("base64url");
}
function defaultWarnRules() {
  return {
    passScore: 60,
    red: { failCourses: 4, failCredits: 12, absenceRate: 1 / 3 },
    orange: { failCourses: 2, failCredits: 6, absenceRate: 0.2 },
    yellow: { failCourses: 1, failCredits: 1, absenceRate: 0.1 }
  };
}
function schoolLabel(s) {
  return s.schoolName || (0, import_i18n4.t)("\u672C\u6821");
}
function defaultProfile() {
  return { englishName: "", motto: "", founded: "", address: "", website: "", intro: "", logoPath: "" };
}
function normalizeProfile(raw) {
  const r = raw || {};
  const str = (v, n) => String(v ?? "").trim().slice(0, n);
  return {
    englishName: str(r.englishName, 120),
    motto: str(r.motto, 60),
    founded: str(r.founded, 10),
    address: str(r.address, 120),
    website: str(r.website, 200),
    intro: str(r.intro, 2e3),
    logoPath: str(r.logoPath, 1e3)
  };
}
function defaultSettings() {
  return {
    schoolName: "",
    profile: defaultProfile(),
    depts: [(0, import_i18n4.t)("\u62DB\u751F\u529E"), (0, import_i18n4.t)("\u6559\u52A1\u5904"), (0, import_i18n4.t)("\u5B66\u5DE5\u5904"), (0, import_i18n4.t)("\u8D22\u52A1\u5904"), (0, import_i18n4.t)("\u540E\u52E4\u5904"), (0, import_i18n4.t)("\u56FE\u4E66\u9986"), (0, import_i18n4.t)("\u4FE1\u606F\u4E2D\u5FC3")],
    categories: [(0, import_i18n4.t)("\u89C4\u7AE0\u5236\u5EA6"), (0, import_i18n4.t)("\u529E\u4E8B\u6307\u5357"), (0, import_i18n4.t)("\u62DB\u751F\u8FCE\u65B0"), (0, import_i18n4.t)("\u5956\u52A9\u8D44\u52A9"), (0, import_i18n4.t)("\u6559\u5B66\u6559\u52A1"), (0, import_i18n4.t)("\u751F\u6D3B\u670D\u52A1")],
    sensitiveDept: (0, import_i18n4.t)("\u5B66\u5DE5\u5904"),
    hotline: "",
    retentionDays: 180,
    mobileDailyLimit: 30,
    // 检索分只做第一道闸，放宽以保召回（实测校内常见问法最低 0.17）；资料答不了的由模型判 NO_ANSWER 再拦一道
    minScore: 0.15,
    outputDir: "",
    warnRules: defaultWarnRules()
  };
}
var num = (v, min, max, fallback) => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
};
function normalizeLevel(raw, d) {
  const r = raw || {};
  return {
    failCourses: Math.round(num(r.failCourses, 0, 50, d.failCourses)),
    failCredits: num(r.failCredits, 0, 200, d.failCredits),
    absenceRate: num(r.absenceRate, 0, 1, d.absenceRate)
  };
}
function normalizeWarnRules(raw) {
  const d = defaultWarnRules();
  const r = raw || {};
  return {
    passScore: num(r.passScore, 0, 100, d.passScore),
    red: normalizeLevel(r.red, d.red),
    orange: normalizeLevel(r.orange, d.orange),
    yellow: normalizeLevel(r.yellow, d.yellow)
  };
}
var cleanList = (v, fallback) => {
  if (!Array.isArray(v)) return fallback;
  const list = [...new Set(v.map((x) => String(x || "").trim()).filter(Boolean))].slice(0, 60);
  return list.length ? list : fallback;
};
function normalizeSettings(raw) {
  const d = defaultSettings();
  const s = raw || {};
  return {
    schoolName: String(s.schoolName ?? "").trim().slice(0, 40),
    profile: normalizeProfile(s.profile),
    depts: cleanList(s.depts, d.depts),
    categories: cleanList(s.categories, d.categories),
    sensitiveDept: String(s.sensitiveDept || "").trim() || d.sensitiveDept,
    hotline: String(s.hotline || "").trim().slice(0, 120),
    retentionDays: Math.round(num(s.retentionDays, 7, 3650, d.retentionDays)),
    mobileDailyLimit: Math.round(num(s.mobileDailyLimit, 1, 500, d.mobileDailyLimit)),
    minScore: num(s.minScore, 0.05, 0.9, d.minScore),
    outputDir: String(s.outputDir || ""),
    warnRules: normalizeWarnRules(s.warnRules)
  };
}
var EMPTY_DATASETS = () => ({ roster: null, grades: null, attendance: null });
var emptyWarnData = () => ({ roster: [], grades: [], attendance: [] });
function normalize(raw) {
  const ds = EMPTY_DATASETS();
  for (const k of Object.keys(ds)) {
    const m = raw?.datasets?.[k];
    if (m && typeof m === "object" && typeof m.path === "string") ds[k] = { ...m, skipped: m.skipped || [], notes: m.notes || [], missing: m.missing || [], preview: m.preview || [], sheetNames: m.sheetNames || [], headers: m.headers || [], mapping: m.mapping || {} };
  }
  const w = raw?.warn;
  const warn = w && typeof w === "object" && w.summary ? { ...w, rules: normalizeWarnRules(w.rules), reviews: w.reviews || {}, notices: w.notices || {}, stale: !!w.stale } : null;
  return {
    settings: normalizeSettings(raw?.settings),
    docs: Array.isArray(raw?.docs) ? raw.docs.filter((d) => d && d.id && d.path) : [],
    faqs: Array.isArray(raw?.faqs) ? raw.faqs.filter((f) => f && f.id && f.question).map((f) => ({ ...f, similar: Array.isArray(f.similar) ? f.similar : [], hits: Number(f.hits) || 0 })) : [],
    tickets: Array.isArray(raw?.tickets) ? raw.tickets.filter((t) => t && t.id) : [],
    datasets: ds,
    warn,
    campusKey: typeof raw?.campusKey === "string" && raw.campusKey.length >= 6 ? raw.campusKey : newCampusKey(),
    sessions: Array.isArray(raw?.sessions) ? raw.sessions.filter((x) => x && typeof x.token === "string" && typeof x.id === "string") : [],
    scenarios: { overrides: raw?.scenarios?.overrides && typeof raw.scenarios.overrides === "object" ? raw.scenarios.overrides : {}, custom: Array.isArray(raw?.scenarios?.custom) ? raw.scenarios.custom.filter((c) => c && c.id && c.name) : [] },
    courses: Array.isArray(raw?.courses) ? raw.courses.filter((c) => c && c.id && c.name) : [],
    research: { outputsFile: String(raw?.research?.outputsFile || ""), skipped: Number(raw?.research?.skipped) || 0, guides: Array.isArray(raw?.research?.guides) ? raw.research.guides.filter((g) => g && g.id) : [] },
    officialDocs: Array.isArray(raw?.officialDocs) ? raw.officialDocs.filter((d) => d && d.id) : []
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
var CampusAiStore = class {
  constructor(dirOf = () => (0, import_accountScope.accountPath)("campus-ai")) {
    this.dirOf = dirOf;
  }
  cache = null;
  qaCache = null;
  dataCache = null;
  resultCache = null;
  indexCache = /* @__PURE__ */ new Map();
  cacheDir = "";
  root() {
    const d = this.dirOf();
    if (d !== this.cacheDir) {
      this.cache = null;
      this.qaCache = null;
      this.dataCache = null;
      this.resultCache = null;
      this.indexCache.clear();
      this.listCache?.clear();
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
    const dir = this.root();
    if (!this.cache) this.cache = normalize(readJson((0, import_node_path.join)(dir, "state.json")));
    return this.cache;
  }
  update(fn) {
    this.read();
    const out = fn(this.cache);
    this.cache.tickets = this.cache.tickets.slice(0, TICKET_LIMIT);
    this.cache.sessions = this.cache.sessions.slice(-SESSION_LIMIT);
    atomicWrite((0, import_node_path.join)(this.root(), "state.json"), this.cache);
    return out;
  }
  // ── 问答记录 ──
  qa() {
    const dir = this.root();
    if (!this.qaCache) {
      const raw = readJson((0, import_node_path.join)(dir, "qa.json"));
      this.qaCache = Array.isArray(raw) ? raw : [];
    }
    return this.qaCache;
  }
  updateQa(fn) {
    const list = this.qa();
    const out = fn(list);
    if (list.length > QA_LIMIT) list.splice(QA_LIMIT);
    atomicWrite((0, import_node_path.join)(this.root(), "qa.json"), list);
    return out;
  }
  /** 按保留天数清理问答记录，返回删掉的条数 */
  purgeQa(retentionDays, now = Date.now()) {
    const cutoff = now - retentionDays * 864e5;
    return this.updateQa((list) => {
      const before = list.length;
      const keep = list.filter((r) => Date.parse(r.at) >= cutoff);
      list.splice(0, list.length, ...keep);
      return before - keep.length;
    });
  }
  // ── 学业预警数据 ──
  data() {
    const dir = this.root();
    if (!this.dataCache) {
      const raw = readJson((0, import_node_path.join)(dir, "data.json"));
      const e = emptyWarnData();
      for (const k of Object.keys(e)) if (Array.isArray(raw?.[k])) e[k] = raw[k];
      this.dataCache = e;
    }
    return this.dataCache;
  }
  setData(key, rows) {
    this.data();
    this.dataCache[key] = rows;
    atomicWrite((0, import_node_path.join)(this.root(), "data.json"), this.dataCache);
  }
  results() {
    const dir = this.root();
    if (!this.resultCache) {
      const raw = readJson((0, import_node_path.join)(dir, "results.json"));
      this.resultCache = Array.isArray(raw) ? raw : [];
    }
    return this.resultCache;
  }
  setResults(list) {
    this.resultCache = list;
    atomicWrite((0, import_node_path.join)(this.root(), "results.json"), list);
  }
  // ── 题库 / 批改 / 科研成果（量大，各一个文件） ──
  listCache = /* @__PURE__ */ new Map();
  list(name) {
    const dir = this.root();
    if (!this.listCache.has(name)) {
      const raw = readJson((0, import_node_path.join)(dir, `${name}.json`));
      this.listCache.set(name, Array.isArray(raw) ? raw : []);
    }
    return this.listCache.get(name);
  }
  setList(name, list) {
    this.listCache.set(name, list);
    atomicWrite((0, import_node_path.join)(this.root(), `${name}.json`), list);
  }
  questions() {
    return this.list("questions");
  }
  gradings() {
    return this.list("gradings");
  }
  outputs() {
    return this.list("outputs");
  }
  // ── 知识库索引 ──
  index(docId) {
    if (this.indexCache.has(docId)) return this.indexCache.get(docId);
    const raw = readJson((0, import_node_path.join)(this.dir("index"), `${docId}.json`));
    if (!raw || !Array.isArray(raw.chunks)) return null;
    this.indexCache.set(docId, raw);
    return raw;
  }
  setIndex(docId, idx) {
    this.indexCache.set(docId, idx);
    atomicWrite((0, import_node_path.join)(this.dir("index"), `${docId}.json`), idx);
  }
  removeIndex(docId) {
    this.indexCache.delete(docId);
    (0, import_node_fs.rmSync)((0, import_node_path.join)(this.dir("index"), `${docId}.json`), { force: true });
  }
  // ── 审计 ──
  audit(entry) {
    try {
      (0, import_node_fs.appendFileSync)((0, import_node_path.join)(this.root(), "audit.jsonl"), `${JSON.stringify(entry)}
`, "utf-8");
    } catch {
    }
  }
  auditList(limit = 300) {
    const file = (0, import_node_path.join)(this.root(), "audit.jsonl");
    if (!(0, import_node_fs.existsSync)(file)) return [];
    const lines = (0, import_node_fs.readFileSync)(file, "utf-8").split("\n").filter(Boolean);
    const out = [];
    for (let i = lines.length - 1; i >= 0 && out.length < limit; i--) {
      try {
        out.push(JSON.parse(lines[i]));
      } catch {
      }
    }
    return out;
  }
  /** 审计按保留天数裁剪 */
  purgeAudit(retentionDays, now = Date.now()) {
    const file = (0, import_node_path.join)(this.root(), "audit.jsonl");
    if (!(0, import_node_fs.existsSync)(file)) return;
    const cutoff = now - retentionDays * 864e5;
    const keep = (0, import_node_fs.readFileSync)(file, "utf-8").split("\n").filter((l) => {
      if (!l) return false;
      try {
        return Date.parse(JSON.parse(l).at) >= cutoff;
      } catch {
        return false;
      }
    });
    (0, import_node_fs.writeFileSync)(file, keep.length ? `${keep.join("\n")}
` : "", "utf-8");
  }
};

// ../../../totalclaw-solutions/solutions/workbench-campus-ai/src/main/services/campusAi/service.ts
var KB_EXTS = [".pdf", ".docx", ".doc", ".txt", ".md", ".xlsx", ".xls", ".csv", ".pptx", ".html", ".htm"];
var AUTO_KINDS = ["faq", "answer", "quote"];
function publicQa(r) {
  const { askerId: _a, ...rest } = r;
  return rest;
}
function dayKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
var CampusAiService = class {
  constructor(store2, llm, onChange, onProgress = () => {
  }) {
    this.store = store2;
    this.llm = llm;
    this.onChange = onChange;
    this.onProgress = onProgress;
  }
  building = Promise.resolve();
  audit(module2, action, ok, started, detail) {
    this.store.audit({ at: (/* @__PURE__ */ new Date()).toISOString(), module: module2, action, ok, ms: started ? Date.now() - started : void 0, detail: detail ? detail.slice(0, 200) : void 0 });
  }
  // ── 文档 ───────────────────────────────────────────────────────────
  async importDocs(paths, dept, category, courseId) {
    const files = (paths || []).filter((p) => p && (0, import_node_fs2.existsSync)(p) && KB_EXTS.includes((0, import_node_path2.extname)(p).toLowerCase()));
    if (!files.length) throw new Error((0, import_i18n5.t)("\u6CA1\u6709\u53EF\u5BFC\u5165\u7684\u6587\u6863\uFF08\u652F\u6301 PDF\u3001Word\u3001Excel\u3001PPT\u3001TXT\u3001Markdown\u3001HTML\uFF09"));
    const dir = this.store.dir("docs");
    const made = [];
    this.store.update((s) => {
      for (const src of files) {
        const id = newId("cad");
        const dest = (0, import_node_path2.join)(dir, `${id}${(0, import_node_path2.extname)(src).toLowerCase()}`);
        (0, import_node_fs2.copyFileSync)(src, dest);
        const doc = {
          id,
          name: (0, import_node_path2.basename)(src),
          dept: dept || s.settings.depts[0] || "",
          category: category || "",
          path: dest,
          size: (0, import_node_fs2.statSync)(dest).size,
          status: "pending",
          chars: 0,
          chunks: 0,
          addedAt: (/* @__PURE__ */ new Date()).toISOString(),
          ...courseId ? { courseId } : {}
        };
        s.docs.unshift(doc);
        made.push(doc);
      }
    });
    this.audit(courseId ? "teach" : "kb", courseId ? "course.docs" : "docs.import", true, void 0, (0, import_i18n5.t)("{n} \u4EFD", { n: made.length }));
    this.onChange();
    return made;
  }
  /** 构建（抽文字 → 分段 → 向量）。串行，免得一次拖进来几十份同时抽 PDF 把主进程压满 */
  buildDocs(ids) {
    const run2 = async () => {
      const targets = this.store.read().docs.filter((d) => ids?.length ? ids.includes(d.id) : d.status !== "built");
      let n = 0;
      for (const d of targets) {
        n++;
        this.onProgress((0, import_i18n5.t)("\u6B63\u5728\u6784\u5EFA {a}/{b}\uFF1A{p0}", { a: n, b: targets.length, p0: d.name }));
        await this.buildOne(d.id);
      }
      this.onProgress("");
    };
    this.building = this.building.then(run2, run2);
    return this.building;
  }
  async buildOne(id) {
    const started = Date.now();
    const setDoc = (patch) => this.store.update((s) => {
      const d = s.docs.find((x) => x.id === id);
      if (d) Object.assign(d, patch);
    });
    const doc = this.store.read().docs.find((x) => x.id === id);
    if (!doc) return;
    setDoc({ status: "building", error: void 0 });
    this.onChange();
    try {
      if (!(0, import_node_fs2.existsSync)(doc.path)) throw new Error((0, import_i18n5.t)("\u6587\u6863\u526F\u672C\u4E0D\u89C1\u4E86\uFF0C\u8BF7\u5220\u9664\u540E\u91CD\u65B0\u5BFC\u5165"));
      const ex = await (0, import_documentExtractor.extractDocument)(doc.path, doc.name);
      const text = String(ex.text || "").trim();
      if (!text) throw new Error(ex.warning || (0, import_i18n5.t)("\u6CA1\u6709\u8BFB\u5230\u6587\u5B57"));
      const idx = buildIndex(text);
      if (!idx.chunks.length) throw new Error((0, import_i18n5.t)("\u6CA1\u6709\u8BFB\u5230\u6587\u5B57"));
      this.store.setIndex(id, idx);
      setDoc({ status: "built", chars: text.length, chunks: idx.chunks.length, warning: ex.warning || void 0, builtAt: (/* @__PURE__ */ new Date()).toISOString() });
      this.audit("kb", "doc.build", true, started, (0, import_i18n5.t)("{n} \u6BB5", { n: idx.chunks.length }));
    } catch (e) {
      setDoc({ status: "failed", error: e?.message || String(e) });
      this.audit("kb", "doc.build", false, started, e?.message);
    }
    this.onChange();
  }
  updateDoc(id, patch) {
    const r = this.store.update((s) => {
      const d = s.docs.find((x) => x.id === id);
      if (!d) throw new Error((0, import_i18n5.t)("\u6587\u6863\u4E0D\u5B58\u5728\u6216\u5DF2\u5220\u9664"));
      if (patch.dept !== void 0) d.dept = String(patch.dept).trim();
      if (patch.category !== void 0) d.category = String(patch.category).trim();
      return d;
    });
    this.onChange();
    return r;
  }
  removeDoc(id) {
    const d = this.store.read().docs.find((x) => x.id === id);
    this.store.update((s) => {
      s.docs = s.docs.filter((x) => x.id !== id);
    });
    if (d?.path && d.path.startsWith(this.store.dir("docs"))) (0, import_node_fs2.rmSync)(d.path, { force: true });
    this.store.removeIndex(id);
    this.audit("kb", "doc.remove", true);
    this.onChange();
  }
  // ── FAQ ────────────────────────────────────────────────────────────
  saveFaq(input, source = "manual") {
    const question = String(input?.question || "").trim();
    const answer = String(input?.answer || "").trim();
    if (!question) throw new Error((0, import_i18n5.t)("\u8BF7\u586B\u5199\u95EE\u9898"));
    if (!answer) throw new Error((0, import_i18n5.t)("\u8BF7\u586B\u5199\u7B54\u6848"));
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const similar = [...new Set((input.similar || []).map((x) => String(x).trim()).filter((x) => x && x !== question))].slice(0, 20);
    const r = this.store.update((s) => {
      const cur = input.id ? s.faqs.find((f2) => f2.id === input.id) : void 0;
      if (input.id && !cur) throw new Error((0, import_i18n5.t)("FAQ \u4E0D\u5B58\u5728\u6216\u5DF2\u5220\u9664"));
      if (cur) {
        Object.assign(cur, { question, answer, similar, dept: String(input.dept ?? cur.dept).trim(), updatedAt: now });
        return cur;
      }
      const f = { id: newId("caf"), question, answer, similar, dept: String(input.dept || "").trim(), source, createdAt: now, updatedAt: now, hits: 0 };
      s.faqs.unshift(f);
      return f;
    });
    this.audit("kb", "faq.save", true);
    this.onChange();
    return r;
  }
  removeFaq(id) {
    this.store.update((s) => {
      s.faqs = s.faqs.filter((f) => f.id !== id);
    });
    this.onChange();
  }
  /** 从 Excel 批量导入：问题、相似问法（；或换行分隔）、答案、部门。问题相同的覆盖更新 */
  importFaqs(path) {
    const table = (0, import_excel.readTable)(path);
    const qCol = table.headers.find((h) => /问题|问法|question/i.test(h) && !/相似/.test(h)) || "";
    const aCol = table.headers.find((h) => /答案|回答|答复|answer/i.test(h)) || "";
    const sCol = table.headers.find((h) => /相似|同义|similar/i.test(h)) || "";
    const dCol = table.headers.find((h) => /部门|dept/i.test(h)) || "";
    if (!qCol || !aCol) throw new Error((0, import_i18n5.t)("\u6CA1\u8BA4\u51FA\u300C\u95EE\u9898\u300D\u548C\u300C\u7B54\u6848\u300D\u4E24\u5217\uFF0C\u8BF7\u68C0\u67E5\u8868\u5934"));
    let added = 0;
    let updated = 0;
    let skipped = 0;
    const now = (/* @__PURE__ */ new Date()).toISOString();
    this.store.update((s) => {
      for (const row of table.rows) {
        const question = String(row[qCol] || "").trim();
        const answer = String(row[aCol] || "").trim();
        if (!question || !answer) {
          skipped++;
          continue;
        }
        const similar = sCol ? String(row[sCol] || "").split(/[；;\n|]/).map((x) => x.trim()).filter(Boolean) : [];
        const dept = dCol ? String(row[dCol] || "").trim() : "";
        const cur = s.faqs.find((f) => f.question === question);
        if (cur) {
          Object.assign(cur, { answer, similar, dept: dept || cur.dept, updatedAt: now });
          updated++;
          continue;
        }
        s.faqs.unshift({ id: newId("caf"), question, answer, similar, dept, source: "import", createdAt: now, updatedAt: now, hits: 0 });
        added++;
      }
    });
    this.audit("kb", "faq.import", true, void 0, (0, import_i18n5.t)("\u65B0\u589E {a}\uFF0C\u66F4\u65B0 {b}", { a: added, b: updated }));
    this.onChange();
    return { added, updated, skipped };
  }
  exportFaqs(dir) {
    const file = (0, import_node_path2.join)(dir, (0, import_i18n5.t)("\u5E38\u89C1\u95EE\u9898FAQ-{p0}.xlsx", { p0: dayKey(/* @__PURE__ */ new Date()) }));
    (0, import_excel.writeWorkbook)(file, [{
      name: "FAQ",
      headers: [(0, import_i18n5.t)("\u95EE\u9898"), (0, import_i18n5.t)("\u76F8\u4F3C\u95EE\u6CD5"), (0, import_i18n5.t)("\u7B54\u6848"), (0, import_i18n5.t)("\u90E8\u95E8"), (0, import_i18n5.t)("\u547D\u4E2D\u6B21\u6570"), (0, import_i18n5.t)("\u66F4\u65B0\u65F6\u95F4")],
      rows: this.store.read().faqs.map((f) => [f.question, f.similar.join((0, import_i18n5.t)("\uFF1B")), f.answer, f.dept, f.hits, f.updatedAt.slice(0, 10)])
    }]);
    return file;
  }
  // ── 检索 / 问答 ────────────────────────────────────────────────────
  /** 全校问答只查非课程资料；课程助教只查该课程的资料（不混 FAQ） */
  searchSource(courseId) {
    const s = this.store.read();
    return {
      docs: s.docs.filter((d) => d.status === "built" && (courseId ? d.courseId === courseId : !d.courseId)).map((d) => ({ id: d.id, name: d.name, dept: d.dept, index: this.store.index(d.id) })),
      faqs: courseId ? [] : s.faqs
    };
  }
  /** 课程资料片段（出题用）：有侧重就按侧重检索，否则在各份资料里均匀取 */
  courseChunks(courseId, focus, limit = 8) {
    const src = this.searchSource(courseId);
    if (!src.docs.length) throw new Error((0, import_i18n5.t)("\u8FD9\u95E8\u8BFE\u8FD8\u6CA1\u6709\u5DF2\u6784\u5EFA\u7684\u8D44\u6599\uFF0C\u8BF7\u5148\u5BFC\u5165\u8BFE\u7A0B\u8D44\u6599"));
    if (focus.trim()) {
      const hits = search(src, focus, limit);
      if (hits.length) return hits.map((h) => ({ title: h.title, text: h.text }));
    }
    const all = src.docs.flatMap((d) => (d.index?.chunks || []).map((c) => ({ title: d.name, text: c.text })));
    if (all.length <= limit) return all;
    const step = all.length / limit;
    return Array.from({ length: limit }, (_, i) => all[Math.floor(i * step)]);
  }
  search(query, topK = 8) {
    const q = String(query || "").trim();
    if (!q) throw new Error((0, import_i18n5.t)("\u8BF7\u8F93\u5165\u8981\u68C0\u7D22\u7684\u95EE\u9898"));
    return search(this.searchSource(), q, topK);
  }
  async ask(question, channel, askerId, courseId) {
    const q = String(question || "").trim().slice(0, 500);
    if (!q) throw new Error((0, import_i18n5.t)("\u8BF7\u8F93\u5165\u95EE\u9898"));
    const started = Date.now();
    const s = this.store.read();
    const course = courseId ? s.courses.find((c) => c.id === courseId) : void 0;
    if (courseId && !course) throw new Error((0, import_i18n5.t)("\u8BFE\u7A0B\u4E0D\u5B58\u5728\u6216\u5DF2\u5220\u9664"));
    const out = await answerQuestion({
      question: q,
      source: this.searchSource(courseId),
      faqs: courseId ? [] : s.faqs,
      minScore: s.settings.minScore,
      schoolName: schoolLabel(s.settings),
      hotline: s.settings.hotline,
      sensitiveDept: s.settings.sensitiveDept,
      defaultDept: (0, import_i18n5.t)("\u5F85\u5206\u6D3E"),
      llm: this.llm
    }).catch((e) => {
      this.audit(course ? "teach" : channel === "mobile" ? "mobile" : "qa", course ? "tutor" : "ask", false, started, e?.message);
      throw e;
    });
    const qaId = newId("caq");
    let ticketId;
    if (course && out.ticketDept && out.kind !== "sensitive") {
      out.ticketDept = (0, import_i18n5.t)("\u8BFE\u7A0B\uFF1A{p0}", { p0: course.name });
      out.text = noEvidenceReply(out.ticketDept);
    }
    if (out.ticketDept) {
      ticketId = newId("cat");
      const t = { id: ticketId, at: (/* @__PURE__ */ new Date()).toISOString(), question: q, dept: out.ticketDept, status: "open", sensitive: out.kind === "sensitive", channel, qaId };
      this.store.update((st) => {
        st.tickets.unshift(t);
      });
    }
    if (out.faqId) this.store.update((st) => {
      const f = st.faqs.find((x) => x.id === out.faqId);
      if (f) f.hits++;
    });
    const ms = Date.now() - started;
    this.store.updateQa((list) => {
      list.unshift({ id: qaId, at: (/* @__PURE__ */ new Date()).toISOString(), channel, question: q, kind: out.kind, domain: out.domain, ...courseId ? { courseId } : {}, answer: out.text, sources: out.sources, ticketId, model: out.model, ms, askerId });
    });
    this.audit(course ? "teach" : channel === "mobile" ? "mobile" : "qa", course ? "tutor" : "ask", true, started, out.kind + (out.unsupported?.length ? ` unsupported=${out.unsupported.join(",")}` : ""));
    this.onChange();
    return { qaId, kind: out.kind, domain: out.domain, text: out.text, sources: out.sources, ticketId, dept: out.ticketDept, ms };
  }
  feedback(qaId, value, askerId) {
    this.store.updateQa((list) => {
      const r = list.find((x) => x.id === qaId && (!askerId || x.askerId === askerId));
      if (!r) throw new Error((0, import_i18n5.t)("\u95EE\u7B54\u8BB0\u5F55\u4E0D\u5B58\u5728"));
      if (value) r.feedback = value;
      else delete r.feedback;
    });
    this.onChange();
  }
  // ── 转办 ───────────────────────────────────────────────────────────
  answerTicket(id, answer, opts = {}) {
    const text = String(answer || "").trim();
    if (!text) throw new Error((0, import_i18n5.t)("\u8BF7\u586B\u5199\u7B54\u590D"));
    const cur = this.store.read().tickets.find((t) => t.id === id);
    if (!cur) throw new Error((0, import_i18n5.t)("\u8F6C\u529E\u95EE\u9898\u4E0D\u5B58\u5728"));
    let faqId;
    if (opts.toFaq && !cur.sensitive) {
      faqId = this.saveFaq({ question: String(opts.faqQuestion || cur.question).trim(), answer: text, dept: cur.dept }, "ticket").id;
    }
    const r = this.store.update((s) => {
      const t = s.tickets.find((x) => x.id === id);
      Object.assign(t, { answer: text, status: "answered", answeredAt: (/* @__PURE__ */ new Date()).toISOString(), faqId: faqId || t.faqId });
      return t;
    });
    this.audit("ticket", "answer", true, void 0, faqId ? "faq" : "");
    this.onChange();
    return r;
  }
  updateTicket(id, patch) {
    const r = this.store.update((s) => {
      const t = s.tickets.find((x) => x.id === id);
      if (!t) throw new Error((0, import_i18n5.t)("\u8F6C\u529E\u95EE\u9898\u4E0D\u5B58\u5728"));
      if (patch.dept !== void 0) t.dept = String(patch.dept).trim() || t.dept;
      if (patch.status) t.status = patch.status;
      if (patch.note !== void 0) t.note = String(patch.note).slice(0, 300);
      return t;
    });
    this.onChange();
    return r;
  }
  /** 手机端「我的问题」：本人问过的，带转办答复 */
  mine(askerId) {
    const tickets = new Map(this.store.read().tickets.map((t) => [t.id, t]));
    return this.store.qa().filter((r) => r.askerId === askerId).slice(0, 50).map((r) => {
      const t = r.ticketId ? tickets.get(r.ticketId) : void 0;
      return { qaId: r.id, at: r.at, question: r.question, kind: r.kind, answer: r.answer, sources: r.sources, ticketStatus: t?.status, ticketAnswer: t?.answer, feedback: r.feedback };
    });
  }
  // ── 统计 ───────────────────────────────────────────────────────────
  stats(warnPending = 0, now = /* @__PURE__ */ new Date()) {
    const scen = listScenarios(this.store.read().scenarios, this.store.auditList(5e3), now.getTime());
    const s = this.store.read();
    const qa = this.store.qa();
    const byKind = { faq: 0, answer: 0, quote: 0, no_evidence: 0, sensitive: 0 };
    for (const r of qa) byKind[r.kind] = (byKind[r.kind] || 0) + 1;
    const auto = AUTO_KINDS.reduce((n, k) => n + byKind[k], 0);
    const days = [];
    for (let i = 13; i >= 0; i--) days.push({ day: dayKey(new Date(now.getTime() - i * 864e5)), qa: 0, auto: 0 });
    const dayIdx = new Map(days.map((d, i) => [d.day, i]));
    const weekAgo = now.getTime() - 7 * 864e5;
    let qa7d = 0;
    const counts = /* @__PURE__ */ new Map();
    for (const r of qa) {
      const t = Date.parse(r.at);
      if (t >= weekAgo) qa7d++;
      const i = dayIdx.get(dayKey(new Date(t)));
      if (i !== void 0) {
        days[i].qa++;
        if (AUTO_KINDS.includes(r.kind)) days[i].auto++;
      }
      if (r.kind === "sensitive" || r.courseId) continue;
      const key = r.question.replace(/[\s？?。！!]/g, "");
      const c = counts.get(key) || { question: r.question, count: 0 };
      c.count++;
      counts.set(key, c);
    }
    return {
      docs: s.docs.length,
      docsBuilt: s.docs.filter((d) => d.status === "built").length,
      chunks: s.docs.reduce((n, d) => n + (d.status === "built" ? d.chunks : 0), 0),
      faqs: s.faqs.length,
      qaTotal: qa.length,
      qa7d,
      autoRate: qa.length ? Math.round(auto / qa.length * 1e3) / 1e3 : null,
      byKind,
      openTickets: s.tickets.filter((t) => t.status === "open").length,
      sensitiveOpen: s.tickets.filter((t) => t.status === "open" && t.sensitive).length,
      warnPending,
      byDay: days,
      topQuestions: [...counts.values()].sort((a, b) => b.count - a.count).slice(0, 8),
      // 早于领域助手的记录没有 domain，按问题现分类（不回写）
      byDomain: listDomains().map((d) => ({ id: d.id, name: d.name, count: qa.filter((r) => !r.courseId && (r.domain || classifyDomain(r.question)) === d.id).length })).filter((d) => d.count).sort((a, b) => b.count - a.count),
      directions: Object.fromEntries(import_ipc_contracts2.CA_DIRECTIONS.map((d) => {
        const list = scen.filter((x) => x.direction === d);
        return [d, { scenarios: list.length, live: list.filter((x) => x.stage === "live").length, usage30d: list.reduce((n, x) => n + x.usage30d, 0) }];
      })),
      courses: s.courses.length,
      questions: this.store.questions().length,
      outputs: this.store.outputs().length,
      officialDocs: s.officialDocs.length,
      recent: qa.slice(0, 12).map((r) => ({ at: r.at, question: r.kind === "sensitive" ? (0, import_i18n5.t)("\uFF08\u654F\u611F\u95EE\u9898\uFF0C\u5DF2\u9690\u85CF\uFF09") : r.question, kind: r.kind, domain: r.domain, channel: r.channel }))
    };
  }
  purgeExpired() {
    const days = this.store.read().settings.retentionDays;
    const n = this.store.purgeQa(days);
    this.store.purgeAudit(days);
    if (n) {
      this.audit("ops", "qa.purge", true, void 0, String(n));
      this.onChange();
    }
    return n;
  }
};

// ../../../totalclaw-solutions/solutions/workbench-campus-ai/src/main/services/campusAi/mobileServer.ts
var import_node_crypto2 = require("node:crypto");
var import_node_fs3 = require("node:fs");
var import_node_path3 = require("node:path");
var import_lanServer = require("host:apps/desktop-shell/src/main/services/lanServer.ts");

// ../../../totalclaw-solutions/solutions/workbench-campus-ai/src/main/services/campusAi/mobilePage.ts
var CAMPUS_MOBILE_PAGE_HTML = `<!doctype html>
<html lang="zh-CN"><head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
<title>\u6821\u56ED\u667A\u80FD\u95EE\u7B54</title>
<style>
:root{--bg:#f8f4f4;--card:#fff;--ink:#22263a;--mute:#5d6072;--line:#e7dcda;--brand:#7a1f2b;--brand-deep:#5a1620;--gold:#c09a4a;--brand-soft:#f6ecec;--ok:#16a34a;--warn:#b45309;--bad:#dc2626;--serif:'Noto Serif SC','Source Han Serif SC','Songti SC','STSong',Georgia,serif}
*{box-sizing:border-box}
html,body{margin:0;background:var(--bg);color:var(--ink);font:15px/1.6 -apple-system,BlinkMacSystemFont,"PingFang SC","Microsoft YaHei",sans-serif}
header{position:sticky;top:0;z-index:2;background:var(--brand-deep);color:#fdf8ef;padding:12px 16px;display:flex;gap:12px;align-items:center;box-shadow:inset 0 -3px 0 var(--gold)}
header img{width:46px;height:46px;border-radius:50%;background:#fff;border:2px solid var(--gold);object-fit:contain;padding:3px;flex:0 0 auto}
header h1{margin:0;font-size:17px;font-family:var(--serif);letter-spacing:.05em}
header p{margin:2px 0 0;font-size:12px;opacity:.85}
header .motto{font-family:var(--serif);font-style:italic;letter-spacing:.25em;color:#e9d39f;opacity:1}
nav{display:flex;background:#fff;border-bottom:1px solid var(--line);position:sticky;top:70px;z-index:2}
nav button{flex:1;border:0;background:none;padding:10px;font-size:14px;color:var(--mute)}
nav button.on{color:var(--brand);font-weight:600;box-shadow:inset 0 -2px 0 var(--gold)}
main{padding:12px 12px 120px;max-width:720px;margin:0 auto}
.msg{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:10px 12px;margin:10px 0}
.q{background:var(--brand-soft);border-color:#dbe4ff;margin-left:36px}
.a{margin-right:12px;white-space:pre-wrap}
.a.sensitive{border-color:#fecaca;background:#fff5f5}
.a.no_evidence{border-color:#fde68a;background:#fffbeb}
.tag{display:inline-block;font-size:11px;padding:1px 6px;border-radius:6px;background:#eef2ff;color:var(--brand);margin-bottom:4px}
.tag.faq{background:#ecfdf5;color:var(--ok)}
.tag.no_evidence{background:#fef3c7;color:var(--warn)}
.tag.sensitive{background:#fee2e2;color:var(--bad)}
details{margin-top:6px;font-size:13px;color:var(--mute)}
details li{margin:4px 0}
.fb{margin-top:6px;display:flex;gap:8px}
.fb button{border:1px solid var(--line);background:#fff;border-radius:8px;padding:2px 10px;font-size:13px}
.fb button.on{border-color:var(--brand);color:var(--brand)}
.bar{position:fixed;left:0;right:0;bottom:0;background:#fff;border-top:1px solid var(--line);padding:10px 12px calc(10px + env(safe-area-inset-bottom));display:flex;gap:8px}
.bar select{max-width:34%;border:1px solid var(--line);border-radius:10px;padding:0 6px;font:inherit;font-size:13px;background:#fff;color:var(--ink)}
.bar textarea{flex:1;resize:none;border:1px solid var(--line);border-radius:10px;padding:8px 10px;font:inherit;height:44px}
.bar button{border:0;background:var(--brand);color:#fff;border-radius:10px;padding:0 16px;font-size:15px}
.bar button:disabled{opacity:.5}
.empty{color:var(--mute);text-align:center;margin-top:40px;font-size:14px}
.hint{color:var(--mute);font-size:12px;margin:8px 4px}
.chips{display:flex;flex-wrap:wrap;gap:8px;margin:12px 0}
.chips button{border:1px solid #dbe4ff;background:#fff;color:var(--brand);border-radius:16px;padding:4px 12px;font-size:13px}
.err{color:var(--bad);text-align:center;margin-top:40px}
.st{font-size:12px;color:var(--mute)}
.st.answered{color:var(--ok)}
</style></head>
<body>
<header><img id="logo" alt="" hidden /><div><h1 id="title"></h1><p id="motto" class="motto" hidden></p><p id="sub"></p></div></header>
<nav><button id="tabAsk" class="on"></button><button id="tabMine"></button></nav>
<main id="main"></main>
<div class="bar" id="bar"><select id="course" hidden></select><textarea id="input" maxlength="500"></textarea><button id="send"></button></div>
<script>
(function(){
var L=(navigator.language||'zh').toLowerCase().indexOf('zh')===0?'zh':'en';
var D={zh:{title:'\u6821\u56ED\u667A\u80FD\u95EE\u7B54',sub:'\u7B54\u6848\u6765\u81EA\u5B66\u6821\u77E5\u8BC6\u5E93\uFF0C\u6BCF\u6761\u90FD\u6709\u51FA\u5904\uFF1B\u7B54\u4E0D\u4E86\u7684\u4F1A\u8F6C\u7ED9\u76F8\u5173\u90E8\u95E8',ask:'\u63D0\u95EE',mine:'\u6211\u7684\u95EE\u9898',send:'\u53D1\u9001',ph:'\u8F93\u5165\u4F60\u7684\u95EE\u9898\uFF0C\u4F8B\u5982\uFF1A\u8865\u8003\u4EC0\u4E48\u65F6\u5019\u8003\uFF1F',school:'\u95EE\u5B66\u6821',thinking:'\u6B63\u5728\u67E5\u627E\u8D44\u6599\u2026',src:'\u51FA\u5904',useful:'\u6709\u7528',useless:'\u6CA1\u7528',faq:'\u90E8\u95E8\u5BA1\u5B9A\u7B54\u6848',answer:'\u4F9D\u636E\u539F\u6587\u4F5C\u7B54',quote:'\u539F\u6587\u6458\u5F55',no_evidence:'\u5DF2\u8F6C\u90E8\u95E8',sensitive:'\u7D27\u6025\u6C42\u52A9',empty:'\u8FD8\u6CA1\u6709\u63D0\u8FC7\u95EE\u9898',open:'\u7B49\u5F85\u90E8\u95E8\u7B54\u590D',answered:'\u90E8\u95E8\u5DF2\u7B54\u590D',closed:'\u5DF2\u5173\u95ED',reply:'\u90E8\u95E8\u7B54\u590D\uFF1A',badKey:'\u4E8C\u7EF4\u7801\u5DF2\u5931\u6548\uFF0C\u8BF7\u91CD\u65B0\u626B\u63CF\u5B66\u6821\u53D1\u5E03\u7684\u4E8C\u7EF4\u7801',limit:'\u4ECA\u5929\u7684\u63D0\u95EE\u6B21\u6570\u5DF2\u7528\u5B8C\uFF0C\u660E\u5929\u518D\u6765',fail:'\u7F51\u7EDC\u6709\u70B9\u95EE\u9898\uFF0C\u8BF7\u7A0D\u540E\u518D\u8BD5',try:'\u53EF\u4EE5\u8FD9\u6837\u95EE\uFF1A',keep:'\u63D0\u95EE\u8BB0\u5F55\u4F1A\u4FDD\u7559 {d} \u5929\uFF0C\u7528\u4E8E\u6539\u8FDB\u670D\u52A1'},
en:{title:'Campus Q&A',sub:'Answers come from the school knowledge base with sources; unanswered questions go to the right office',ask:'Ask',mine:'My questions',send:'Send',ph:'Type your question',school:'Ask the school',thinking:'Searching\u2026',src:'Sources',useful:'Helpful',useless:'Not helpful',faq:'Official answer',answer:'From documents',quote:'Excerpts',no_evidence:'Forwarded',sensitive:'Urgent help',empty:'No questions yet',open:'Waiting for reply',answered:'Answered',closed:'Closed',reply:'Office reply: ',badKey:'This QR code is no longer valid. Please scan the latest one.',limit:'Daily limit reached. Please come back tomorrow.',fail:'Network problem, please try again later',try:'Try asking:',keep:'Questions are kept for {d} days to improve the service'}}[L];
function $(id){return document.getElementById(id)}
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
var params=new URLSearchParams(location.search);var key=params.get('k')||'';
var token=localStorage.getItem('campus_tok')||'';var tab='ask';var log=[];var info={};
$('title').textContent=D.title;$('sub').textContent=D.sub;$('tabAsk').textContent=D.ask;$('tabMine').textContent=D.mine;$('send').textContent=D.send;$('input').placeholder=D.ph;
function api(m,u,b){var h={'Content-Type':'application/json'};if(token)h.Authorization='Bearer '+token;return fetch(u,{method:m,headers:h,body:b?JSON.stringify(b):undefined}).then(function(r){return r.json().catch(function(){return {}}).then(function(j){j.__s=r.status;return j})})}
function session(){
  if(token)return api('GET','/api/me').then(function(j){if(j.__s===200)return true;token='';localStorage.removeItem('campus_tok');return session()});
  if(!key){$('main').innerHTML='<p class="err">'+D.badKey+'</p>';$('bar').style.display='none';return Promise.resolve(false)}
  return api('POST','/api/session',{k:key}).then(function(j){if(j.__s!==200||!j.token){$('main').innerHTML='<p class="err">'+D.badKey+'</p>';$('bar').style.display='none';return false}token=j.token;localStorage.setItem('campus_tok',token);return true})
}
function tagOf(k){return '<span class="tag '+k+'">'+esc(D[k]||k)+'</span>'}
function srcHtml(list){if(!list||!list.length)return '';return '<details><summary>'+D.src+'\uFF08'+list.length+'\uFF09</summary><ol>'+list.map(function(s){return '<li><b>'+esc(s.title)+'</b>'+(s.dept?' \xB7 '+esc(s.dept):'')+'<br>'+esc(s.snippet)+'</li>'}).join('')+'</ol></details>'}
function fbHtml(r){if(r.kind==='sensitive')return '';return '<div class="fb"><button data-fb="up" data-id="'+r.qaId+'" class="'+(r.feedback==='up'?'on':'')+'">'+D.useful+'</button><button data-fb="down" data-id="'+r.qaId+'" class="'+(r.feedback==='down'?'on':'')+'">'+D.useless+'</button></div>'}
function renderAsk(){
  var h='';
  if(!log.length){h+='<p class="hint">'+esc(D.keep.replace('{d}',info.retentionDays||''))+'</p>';if(info.examples&&info.examples.length){h+='<p class="hint">'+D.try+'</p><div class="chips">'+info.examples.map(function(q){return '<button data-q="'+esc(q)+'">'+esc(q)+'</button>'}).join('')+'</div>'}}
  log.forEach(function(r){h+='<div class="msg q">'+esc(r.question)+'</div>';if(r.pending){h+='<div class="msg a">'+D.thinking+'</div>';return}if(r.error){h+='<div class="msg a no_evidence">'+esc(r.error)+'</div>';return}h+='<div class="msg a '+r.kind+'">'+tagOf(r.kind)+'<br>'+esc(r.text)+srcHtml(r.sources)+fbHtml(r)+'</div>'});
  $('main').innerHTML=h;window.scrollTo(0,document.body.scrollHeight);
}
function renderMine(){
  api('GET','/api/mine').then(function(j){
    var list=j.items||[];if(!list.length){$('main').innerHTML='<p class="empty">'+D.empty+'</p>';return}
    $('main').innerHTML=list.map(function(r){var st=r.ticketStatus?'<div class="st '+r.ticketStatus+'">'+esc(D[r.ticketStatus]||r.ticketStatus)+'</div>':'';var rep=r.ticketAnswer?'<div class="msg a faq"><span class="tag faq">'+D.reply+'</span><br>'+esc(r.ticketAnswer)+'</div>':'';return '<div class="msg q">'+esc(r.question)+'<div class="st">'+esc(String(r.at).slice(0,16).replace('T',' '))+'</div></div><div class="msg a '+r.kind+'">'+tagOf(r.kind)+'<br>'+esc(r.answer)+srcHtml(r.sources)+st+'</div>'+rep}).join('');
  })
}
function setTab(t){tab=t;$('tabAsk').className=t==='ask'?'on':'';$('tabMine').className=t==='mine'?'on':'';$('bar').style.display=t==='ask'?'flex':'none';if(t==='ask')renderAsk();else renderMine()}
function ask(q){
  q=String(q||'').trim();if(!q)return;$('input').value='';var r={question:q,pending:true};log.push(r);renderAsk();$('send').disabled=true;
  var cid=$('course').hidden?'':$('course').value;api('POST','/api/ask',{question:q,courseId:cid}).then(function(j){r.pending=false;if(j.__s===429)r.error=D.limit;else if(j.__s===401){token='';localStorage.removeItem('campus_tok');r.error=D.badKey}else if(j.__s!==200)r.error=j.error||D.fail;else{r.kind=j.kind;r.text=j.text;r.sources=j.sources;r.qaId=j.qaId}renderAsk()}).catch(function(){r.pending=false;r.error=D.fail;renderAsk()}).then(function(){$('send').disabled=false})
}
document.addEventListener('click',function(e){var t=e.target;if(!t||!t.getAttribute)return;var q=t.getAttribute('data-q');if(q){ask(q);return}var fb=t.getAttribute('data-fb');if(fb){var id=t.getAttribute('data-id');api('POST','/api/feedback',{qaId:id,value:fb});log.forEach(function(r){if(r.qaId===id)r.feedback=fb});if(tab==='ask')renderAsk();else renderMine()}});
$('send').onclick=function(){ask($('input').value)};
$('input').addEventListener('keydown',function(e){if(e.key==='Enter'&&!e.shiftKey&&!e.isComposing){e.preventDefault();ask($('input').value)}});
$('tabAsk').onclick=function(){setTab('ask')};$('tabMine').onclick=function(){setTab('mine')};
fetch('/api/info').then(function(r){return r.json()}).then(function(j){info=j||{};if(info.schoolName){$('title').textContent=info.schoolName+' \xB7 '+D.title;document.title=$('title').textContent}if(info.hasLogo){$('logo').src='/logo';$('logo').hidden=false}if(info.motto){$('motto').textContent=info.motto;$('motto').hidden=false}if(info.courses&&info.courses.length){var sel=$('course');sel.innerHTML='<option value="">'+esc(D.school)+'</option>'+info.courses.map(function(c){return '<option value="'+esc(c.id)+'">'+esc(c.name)+'</option>'}).join('');sel.hidden=false}}).catch(function(){}).then(function(){return session()}).then(function(ok){if(ok)setTab('ask')});
})();
</script>
</body></html>`;

// ../../../totalclaw-solutions/solutions/workbench-campus-ai/src/main/services/campusAi/mobileServer.ts
var today = () => (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
var CampusMobileServer = class {
  constructor(svc, logger) {
    this.svc = svc;
    this.logger = logger;
    const keyFails = new import_lanServer.RateBucket(10, 6e4);
    this.lan = new import_lanServer.LanServer({
      name: "campus-ai-mobile",
      pageHtml: CAMPUS_MOBILE_PAGE_HTML,
      logger,
      defaultPort: 8250,
      auth: (token) => token ? svc.store.read().sessions.find((x) => x.token === token) || null : null,
      routes: this.routes(keyFails)
    });
  }
  lan;
  status() {
    const port = this.lan.port;
    const key = this.svc.store.read().campusKey;
    const url = this.lan.url;
    return { running: this.lan.running, port, url, joinUrl: url ? `${url}/?k=${encodeURIComponent(key)}` : null };
  }
  async start() {
    await this.lan.start();
    return this.status();
  }
  async stop() {
    await this.lan.stop();
  }
  routes(keyFails) {
    const svc = this.svc;
    return [
      { method: "GET", path: "/api/ping", auth: "none", handler: (c) => c.json(200, { ok: true }) },
      {
        // 校徽是学校公开信息，扫码页面头显示用
        method: "GET",
        path: "/logo",
        auth: "none",
        handler: (c) => {
          const p = svc.store.read().settings.profile.logoPath;
          const mime = { ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".svg": "image/svg+xml", ".gif": "image/gif" }[(0, import_node_path3.extname)(p).toLowerCase()];
          c.serveFile(p && mime && (0, import_node_fs3.existsSync)(p) ? p : null, mime || "application/octet-stream");
        }
      },
      {
        method: "GET",
        path: "/api/info",
        auth: "none",
        handler: (c) => {
          const s = svc.store.read();
          const examples = s.faqs.slice().sort((a, b) => b.hits - a.hits).slice(0, 4).map((f) => f.question);
          const pr = s.settings.profile;
          const courses = s.courses.filter((x) => x.publicTutor && s.docs.some((d) => d.courseId === x.id && d.status === "built")).map((x) => ({ id: x.id, name: x.name }));
          c.json(200, { schoolName: s.settings.schoolName, englishName: pr.englishName, motto: pr.motto, hasLogo: !!pr.logoPath && (0, import_node_fs3.existsSync)(pr.logoPath), retentionDays: s.settings.retentionDays, examples, courses });
        }
      },
      {
        method: "POST",
        path: "/api/session",
        auth: "none",
        handler: async (c) => {
          if (keyFails.locked(c.clientIp)) {
            c.json(429, { error: "TOO_MANY" });
            return;
          }
          const body = await c.body();
          if (String(body?.k || "") !== svc.store.read().campusKey) {
            if (keyFails.fail(c.clientIp)) this.logger?.warn?.("campus-ai", "campus key brute-force locked", { ip: c.clientIp });
            c.json(403, { error: "BAD_KEY" });
            return;
          }
          keyFails.pass(c.clientIp);
          const sess = { id: newId("cas"), token: (0, import_node_crypto2.randomBytes)(18).toString("base64url"), createdAt: (/* @__PURE__ */ new Date()).toISOString(), day: today(), count: 0 };
          svc.store.update((s) => {
            s.sessions.push(sess);
          });
          c.json(200, { token: sess.token });
        }
      },
      { method: "GET", path: "/api/me", auth: "bearer", handler: (c) => c.json(200, { ok: true }) },
      {
        method: "POST",
        path: "/api/ask",
        auth: "bearer",
        handler: async (c) => {
          const me = c.principal;
          const body = await c.body();
          const limit = svc.store.read().settings.mobileDailyLimit;
          const allowed = svc.store.update((s) => {
            const x = s.sessions.find((y) => y.id === me.id);
            if (!x) return false;
            if (x.day !== today()) {
              x.day = today();
              x.count = 0;
            }
            if (x.count >= limit) return false;
            x.count++;
            return true;
          });
          if (!allowed) {
            c.json(429, { error: "LIMIT" });
            return;
          }
          try {
            const courseId = String(body?.courseId || "");
            const open = courseId && svc.store.read().courses.some((x) => x.id === courseId && x.publicTutor);
            const r = await svc.ask(String(body?.question || ""), "mobile", me.id, open ? courseId : void 0);
            c.json(200, r);
          } catch (e) {
            c.json(400, { error: String(e?.message || e).slice(0, 200) });
          }
        }
      },
      { method: "GET", path: "/api/mine", auth: "bearer", handler: (c) => c.json(200, { items: svc.mine(c.principal.id) }) },
      {
        method: "POST",
        path: "/api/feedback",
        auth: "bearer",
        handler: async (c) => {
          const body = await c.body();
          const v = body?.value === "up" || body?.value === "down" ? body.value : null;
          try {
            svc.feedback(String(body?.qaId || ""), v, c.principal.id);
            c.json(200, { ok: true });
          } catch {
            c.json(404, { error: "NOT_FOUND" });
          }
        }
      }
    ];
  }
  /** 换口令：旧二维码和旧会话一起作废 */
  rotateKey(newKey) {
    this.svc.store.update((s) => {
      s.campusKey = newKey;
      s.sessions = [];
    });
  }
  get ip() {
    return (0, import_lanServer.lanIp)();
  }
};

// ../../../totalclaw-solutions/solutions/workbench-campus-ai/src/main/services/campusAi/warning.ts
var import_node_path4 = require("node:path");
var import_i18n6 = require("npm:@totalclaw/i18n");
var import_ipc_contracts3 = require("npm:@totalclaw/ipc-contracts");
var import_excel2 = require("host:apps/desktop-shell/src/main/services/serviceSettlement/excel.ts");

// ../../../totalclaw-solutions/solutions/workbench-campus-ai/src/main/services/campusAi/columnKeywords.json
var columnKeywords_default = {
  columns: {
    studentId: ["\u5B66\u53F7", "\u5B66\u751F\u5B66\u53F7", "\u5B66\u7C4D\u53F7", "\u5B66\u751F\u7F16\u53F7", "\u8003\u751F\u53F7", "student id", "studentid", "student no"],
    name: ["\u59D3\u540D", "\u5B66\u751F\u59D3\u540D", "\u540D\u5B57", "name"],
    className: ["\u73ED\u7EA7", "\u884C\u653F\u73ED", "\u73ED\u7EA7\u540D\u79F0", "\u6240\u5728\u73ED\u7EA7", "class"],
    college: ["\u5B66\u9662", "\u4E8C\u7EA7\u5B66\u9662", "\u7CFB\u90E8", "\u9662\u7CFB", "\u6240\u5C5E\u5B66\u9662", "college"],
    major: ["\u4E13\u4E1A", "\u4E13\u4E1A\u540D\u79F0", "\u6240\u5B66\u4E13\u4E1A", "major"],
    counselor: ["\u8F85\u5BFC\u5458", "\u73ED\u4E3B\u4EFB", "\u8F85\u5BFC\u5458\u59D3\u540D", "counselor"],
    counselorEmail: ["\u8F85\u5BFC\u5458\u90AE\u7BB1", "\u90AE\u7BB1", "\u7535\u5B50\u90AE\u7BB1", "email"],
    course: ["\u8BFE\u7A0B", "\u8BFE\u7A0B\u540D\u79F0", "\u8BFE\u7A0B\u540D", "\u79D1\u76EE", "course"],
    score: ["\u6210\u7EE9", "\u603B\u8BC4", "\u603B\u8BC4\u6210\u7EE9", "\u6700\u7EC8\u6210\u7EE9", "\u671F\u672B\u6210\u7EE9", "\u603B\u6210\u7EE9", "\u5206\u6570", "\u5F97\u5206", "score"],
    credit: ["\u5B66\u5206", "\u8BFE\u7A0B\u5B66\u5206", "credit"],
    term: ["\u5B66\u671F", "\u5B66\u5E74\u5B66\u671F", "\u5F00\u8BFE\u5B66\u671F", "term"],
    status: ["\u8003\u52E4\u72B6\u6001", "\u51FA\u52E4\u72B6\u6001", "\u8003\u52E4\u7ED3\u679C", "\u51FA\u52E4\u60C5\u51B5", "\u72B6\u6001", "status"],
    absent: ["\u7F3A\u52E4\u6B21\u6570", "\u7F3A\u8BFE\u6B21\u6570", "\u65F7\u8BFE\u6B21\u6570", "\u7F3A\u52E4\u8282\u6570", "\u7F3A\u8BFE\u8282\u6570", "\u7F3A\u52E4", "\u7F3A\u8BFE", "absent"],
    total: ["\u5E94\u5230\u6B21\u6570", "\u5E94\u51FA\u52E4\u6B21\u6570", "\u5E94\u5230\u8282\u6570", "\u5E94\u4E0A\u8282\u6570", "\u603B\u8BFE\u6B21", "\u603B\u6B21\u6570", "\u5E94\u5230", "total"],
    date: ["\u65E5\u671F", "\u8003\u52E4\u65E5\u671F", "\u4E0A\u8BFE\u65E5\u671F", "date"]
  },
  absentStatus: ["\u7F3A\u52E4", "\u65F7\u8BFE", "\u7F3A\u8BFE", "\u672A\u5230", "\u65F7", "absent"],
  presentStatus: ["\u51FA\u52E4", "\u5230\u8BFE", "\u6B63\u5E38", "\u5DF2\u5230", "\u8FDF\u5230", "\u65E9\u9000", "\u8BF7\u5047", "\u516C\u5047", "\u75C5\u5047", "\u4E8B\u5047", "present"],
  failGrades: ["\u4E0D\u53CA\u683C", "\u4E0D\u5408\u683C", "\u7F3A\u8003", "\u4F5C\u5F0A", "\u53D6\u6D88\u8D44\u683C", "\u65F7\u8003", "F"],
  passGrades: { \u4F18\u79C0: 95, \u4F18: 95, \u826F\u597D: 85, \u826F: 85, \u4E2D\u7B49: 75, \u4E2D: 75, \u53CA\u683C: 65, \u5408\u683C: 65, \u514D\u4FEE: 80, \u901A\u8FC7: 65, A: 95, B: 85, C: 75, D: 65 },
  skipGrades: ["\u7F13\u8003", "\u672A\u5F55\u5165", "\u5F85\u5F55\u5165"]
};

// ../../../totalclaw-solutions/solutions/workbench-campus-ai/src/main/services/campusAi/warning.ts
var COLS = columnKeywords_default.columns;
var norm = (s) => String(s || "").toLowerCase().replace(/[\s_\-()（）:：]/g, "");
function detectMapping(headers, dataset, preset) {
  const roles = [...import_ipc_contracts3.CA_DATASET_ROLES[dataset].required, ...import_ipc_contracts3.CA_DATASET_ROLES[dataset].optional];
  const used = /* @__PURE__ */ new Set();
  const out = {};
  for (const r of roles) {
    const p = preset?.[r];
    if (p && headers.includes(p)) {
      out[r] = p;
      used.add(p);
    }
  }
  for (const pass of ["exact", "contains"]) {
    for (const r of roles) {
      if (out[r]) continue;
      for (const kw of COLS[r] || []) {
        const k = norm(kw);
        const hit = headers.find((h) => !used.has(h) && (pass === "exact" ? norm(h) === k : norm(h).includes(k)));
        if (hit) {
          out[r] = hit;
          used.add(hit);
          break;
        }
      }
    }
  }
  if (dataset === "roster" && out.counselorEmail && !out.counselor) delete out.counselorEmail;
  return out;
}
function missingRoles(dataset, mapping) {
  const miss = import_ipc_contracts3.CA_DATASET_ROLES[dataset].required.filter((r) => !mapping[r]);
  if (dataset === "attendance" && !mapping.status && !mapping.absent) miss.push("absent");
  return miss;
}
function roleLabel(role) {
  return {
    studentId: (0, import_i18n6.t)("\u5B66\u53F7"),
    name: (0, import_i18n6.t)("\u59D3\u540D"),
    className: (0, import_i18n6.t)("\u73ED\u7EA7"),
    college: (0, import_i18n6.t)("\u5B66\u9662"),
    major: (0, import_i18n6.t)("\u4E13\u4E1A"),
    counselor: (0, import_i18n6.t)("\u8F85\u5BFC\u5458"),
    counselorEmail: (0, import_i18n6.t)("\u8F85\u5BFC\u5458\u90AE\u7BB1"),
    course: (0, import_i18n6.t)("\u8BFE\u7A0B"),
    score: (0, import_i18n6.t)("\u6210\u7EE9"),
    credit: (0, import_i18n6.t)("\u5B66\u5206"),
    term: (0, import_i18n6.t)("\u5B66\u671F"),
    status: (0, import_i18n6.t)("\u8003\u52E4\u72B6\u6001"),
    absent: (0, import_i18n6.t)("\u7F3A\u52E4\u6B21\u6570"),
    total: (0, import_i18n6.t)("\u5E94\u5230\u6B21\u6570"),
    date: (0, import_i18n6.t)("\u65E5\u671F")
  }[role] || role;
}
function readSheet(path, sheet) {
  const sheetNames = (() => {
    try {
      return (0, import_excel2.listSheetNames)(path);
    } catch {
      return [];
    }
  })();
  return { table: (0, import_excel2.readTable)(path, { sheetName: sheet }), sheetNames };
}
var toNum = (v) => {
  const s = String(v ?? "").replace(/[,，\s]/g, "").replace(/%$/, "");
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
};
var stuId = (v) => String(v || "").trim().replace(/\.0$/, "");
var listHas = (list, v) => {
  const s = String(v || "").trim().toLowerCase();
  return !!s && list.some((x) => s === x.toLowerCase());
};
function judgeScore(raw, passScore) {
  const s = String(raw ?? "").trim();
  if (!s || listHas(columnKeywords_default.skipGrades, s)) return null;
  const n = toNum(s);
  if (n !== null) return { pass: n >= passScore, display: s };
  if (listHas(columnKeywords_default.failGrades, s)) return { pass: false, display: s };
  const map = columnKeywords_default.passGrades;
  const key = Object.keys(map).find((k) => k.toLowerCase() === s.toLowerCase());
  if (key) return { pass: map[key] >= passScore, display: s };
  return null;
}
var rowNo = (i) => i + 2;
function parseRoster(table, m) {
  const rows = [];
  const skipped = [];
  const seen = /* @__PURE__ */ new Set();
  table.rows.forEach((r, i) => {
    const id = stuId(r[m.studentId]);
    const name = String(r[m.name] || "").trim();
    if (!id) {
      skipped.push({ row: rowNo(i), reason: (0, import_i18n6.t)("\u6CA1\u6709\u5B66\u53F7") });
      return;
    }
    if (!name) {
      skipped.push({ row: rowNo(i), reason: (0, import_i18n6.t)("\u6CA1\u6709\u59D3\u540D") });
      return;
    }
    if (seen.has(id)) {
      skipped.push({ row: rowNo(i), reason: (0, import_i18n6.t)("\u5B66\u53F7\u91CD\u590D\uFF0C\u53EA\u7559\u7B2C\u4E00\u884C") });
      return;
    }
    seen.add(id);
    const g = (k) => m[k] ? String(r[m[k]] || "").trim() : "";
    rows.push({ studentId: id, name, className: g("className"), college: g("college"), major: g("major"), counselor: g("counselor"), counselorEmail: g("counselorEmail") });
  });
  return { rows, skipped: skipped.slice(0, 50), skippedCount: skipped.length, notes: [] };
}
function parseGrades(table, m) {
  const rows = [];
  const skipped = [];
  const notes = [];
  table.rows.forEach((r, i) => {
    const id = stuId(r[m.studentId]);
    const course = String(r[m.course] || "").trim();
    const score = String(r[m.score] ?? "").trim();
    if (!id) {
      skipped.push({ row: rowNo(i), reason: (0, import_i18n6.t)("\u6CA1\u6709\u5B66\u53F7") });
      return;
    }
    if (!course) {
      skipped.push({ row: rowNo(i), reason: (0, import_i18n6.t)("\u6CA1\u6709\u8BFE\u7A0B\u540D\u79F0") });
      return;
    }
    if (!score) {
      skipped.push({ row: rowNo(i), reason: (0, import_i18n6.t)("\u6CA1\u6709\u6210\u7EE9") });
      return;
    }
    const credit = m.credit ? toNum(r[m.credit]) : null;
    rows.push({ studentId: id, name: m.name ? String(r[m.name] || "").trim() : "", course, score, credit: credit !== null && credit >= 0 ? credit : 0, term: m.term ? String(r[m.term] || "").trim() : "" });
  });
  if (!m.credit) notes.push((0, import_i18n6.t)("\u6210\u7EE9\u8868\u6CA1\u6709\u5B66\u5206\u5217\uFF1A\u4E0D\u53CA\u683C\u5B66\u5206\u8BB0\u4E3A 0\uFF0C\u300C\u4E0D\u53CA\u683C\u5B66\u5206\u300D\u4E0D\u4F5C\u4E3A\u9884\u8B66\u95E8\u69DB"));
  return { rows, skipped: skipped.slice(0, 50), skippedCount: skipped.length, notes };
}
function parseAttendance(table, m) {
  const rows = [];
  const skipped = [];
  const notes = [];
  const byStatus = !!m.status && !m.absent;
  let unknownStatus = 0;
  let leave = 0;
  table.rows.forEach((r, i) => {
    const id = stuId(r[m.studentId]);
    if (!id) {
      skipped.push({ row: rowNo(i), reason: (0, import_i18n6.t)("\u6CA1\u6709\u5B66\u53F7") });
      return;
    }
    const name = m.name ? String(r[m.name] || "").trim() : "";
    const course = m.course ? String(r[m.course] || "").trim() : "";
    if (byStatus) {
      const st = String(r[m.status] || "").trim();
      if (!st) {
        skipped.push({ row: rowNo(i), reason: (0, import_i18n6.t)("\u6CA1\u6709\u8003\u52E4\u72B6\u6001") });
        return;
      }
      const absent = columnKeywords_default.absentStatus.some((k) => st.toLowerCase().includes(k.toLowerCase()));
      const present = !absent && columnKeywords_default.presentStatus.some((k) => st.toLowerCase().includes(k.toLowerCase()));
      if (!absent && !present) {
        unknownStatus++;
        skipped.push({ row: rowNo(i), reason: (0, import_i18n6.t)("\u8003\u52E4\u72B6\u6001\u8BA4\u4E0D\u51FA\uFF1A{p0}", { p0: st.slice(0, 12) }) });
        return;
      }
      if (/假/.test(st)) leave++;
      rows.push({ studentId: id, name, course, absent: absent ? 1 : 0, total: 1 });
    } else {
      const absent = toNum(r[m.absent]);
      if (absent === null || absent < 0) {
        skipped.push({ row: rowNo(i), reason: (0, import_i18n6.t)("\u7F3A\u52E4\u6B21\u6570\u4E0D\u662F\u6570\u5B57") });
        return;
      }
      const total = m.total ? toNum(r[m.total]) : null;
      if (total !== null && total < absent) {
        skipped.push({ row: rowNo(i), reason: (0, import_i18n6.t)("\u7F3A\u52E4\u6B21\u6570\u5927\u4E8E\u5E94\u5230\u6B21\u6570") });
        return;
      }
      rows.push({ studentId: id, name, course, absent, total: total !== null && total > 0 ? total : 0 });
    }
  });
  if (byStatus) notes.push((0, import_i18n6.t)("\u6309\u9010\u6B21\u8003\u52E4\u8BB0\u5F55\u7EDF\u8BA1\uFF1A\u7F3A\u52E4\u3001\u65F7\u8BFE\u8BA1\u4E3A\u7F3A\u52E4\uFF1B\u8FDF\u5230\u3001\u65E9\u9000\u3001\u8BF7\u5047\u8BA1\u4E3A\u51FA\u52E4"));
  if (leave) notes.push((0, import_i18n6.t)("{n} \u6761\u8BF7\u5047\u8BB0\u5F55\u4E0D\u8BA1\u7F3A\u52E4", { n: leave }));
  if (unknownStatus) notes.push((0, import_i18n6.t)("{n} \u6761\u8003\u52E4\u72B6\u6001\u8BA4\u4E0D\u51FA\uFF0C\u6CA1\u6709\u6536\u4E0B", { n: unknownStatus }));
  if (!byStatus && !m.total) notes.push((0, import_i18n6.t)("\u8003\u52E4\u8868\u6CA1\u6709\u5E94\u5230\u6B21\u6570\uFF1A\u53EA\u7EDF\u8BA1\u7F3A\u52E4\u6B21\u6570\uFF0C\u7F3A\u52E4\u7387\u4E0D\u4F5C\u4E3A\u9884\u8B66\u95E8\u69DB"));
  return { rows, skipped: skipped.slice(0, 50), skippedCount: skipped.length, notes };
}
var round1 = (n) => Math.round(n * 10) / 10;
var pctText = (r) => `${round1(r * 100)}%`;
function levelOf(fc, credits, rate, rules) {
  for (const lv of import_ipc_contracts3.CA_LEVELS) {
    const r = rules[lv];
    const basis = [];
    if (r.failCourses > 0 && fc >= r.failCourses) basis.push((0, import_i18n6.t)("\u4E0D\u53CA\u683C {a} \u95E8\uFF08\u95E8\u69DB {b} \u95E8\uFF09", { a: fc, b: r.failCourses }));
    if (r.failCredits > 0 && credits > 0 && credits >= r.failCredits) basis.push((0, import_i18n6.t)("\u4E0D\u53CA\u683C\u5B66\u5206 {a}\uFF08\u95E8\u69DB {b}\uFF09", { a: round1(credits), b: r.failCredits }));
    if (r.absenceRate > 0 && rate !== null && rate >= r.absenceRate) basis.push((0, import_i18n6.t)("\u7F3A\u52E4\u7387 {a}\uFF08\u95E8\u69DB {b}\uFF09", { a: pctText(rate), b: pctText(r.absenceRate) }));
    if (basis.length) return { level: lv, basis };
  }
  return { level: null, basis: [] };
}
function computeWarnings(data, rules) {
  const roster = new Map(data.roster.map((r) => [r.studentId, r]));
  const ids = new Set(data.roster.map((r) => r.studentId));
  const unknown = /* @__PURE__ */ new Set();
  const nameOf = /* @__PURE__ */ new Map();
  for (const g of data.grades) {
    if (!roster.has(g.studentId)) {
      unknown.add(g.studentId);
      ids.add(g.studentId);
    }
    if (g.name) nameOf.set(g.studentId, g.name);
  }
  for (const a of data.attendance) {
    if (!roster.has(a.studentId)) {
      unknown.add(a.studentId);
      ids.add(a.studentId);
    }
    if (a.name && !nameOf.has(a.studentId)) nameOf.set(a.studentId, a.name);
  }
  const best = /* @__PURE__ */ new Map();
  for (const g of data.grades) {
    const j = judgeScore(g.score, rules.passScore);
    if (!j) continue;
    const key = g.course;
    const per = best.get(g.studentId) || /* @__PURE__ */ new Map();
    const cur = per.get(key);
    const n = toNum(g.score);
    if (!cur || !cur.pass && j.pass || cur.pass === j.pass && n !== null && n > cur.n) {
      per.set(key, { pass: j.pass, display: j.display, credit: g.credit, term: g.term, n: n ?? (j.pass ? 1 : 0) });
    }
    best.set(g.studentId, per);
  }
  const att = /* @__PURE__ */ new Map();
  for (const a of data.attendance) {
    const cur = att.get(a.studentId) || { absent: 0, total: 0 };
    cur.absent += a.absent;
    cur.total += a.total;
    att.set(a.studentId, cur);
  }
  const results = [];
  let noGrades = 0;
  for (const id of ids) {
    const r = roster.get(id);
    const per = best.get(id);
    if (!per || !per.size) noGrades++;
    const failed = [...per?.entries() || []].filter(([, v]) => !v.pass).map(([course, v]) => ({ course, score: v.display, credit: v.credit, term: v.term || void 0 }));
    const failCredits = failed.reduce((s, f) => s + f.credit, 0);
    const a = att.get(id);
    const rate = a && a.total > 0 ? a.absent / a.total : null;
    const { level, basis } = levelOf(failed.length, failCredits, rate, rules);
    if (level && a && a.total === 0 && a.absent > 0) basis.push((0, import_i18n6.t)("\u7F3A\u52E4 {n} \u6B21\uFF08\u6CA1\u6709\u5E94\u5230\u6B21\u6570\uFF0C\u672A\u7B97\u7F3A\u52E4\u7387\uFF09", { n: a.absent }));
    results.push({
      studentId: id,
      name: r?.name || nameOf.get(id) || "",
      className: r?.className || "",
      college: r?.college || "",
      major: r?.major || "",
      counselor: r?.counselor || "",
      counselorEmail: r?.counselorEmail || "",
      failCourses: failed.length,
      failCredits: round1(failCredits),
      failed,
      absent: a?.absent || 0,
      totalSessions: a?.total || 0,
      absenceRate: rate === null ? null : Math.round(rate * 1e4) / 1e4,
      level,
      basis
    });
  }
  const order = (l) => l ? import_ipc_contracts3.CA_LEVELS.indexOf(l) : 9;
  results.sort((x, y) => order(x.level) - order(y.level) || y.failCourses - x.failCourses || (y.absenceRate ?? 0) - (x.absenceRate ?? 0) || x.studentId.localeCompare(y.studentId));
  const byLevel = { red: 0, orange: 0, yellow: 0 };
  for (const s of results) if (s.level) byLevel[s.level]++;
  return {
    results,
    summary: {
      students: results.length,
      warned: byLevel.red + byLevel.orange + byLevel.yellow,
      byLevel,
      noGrades,
      noAttendance: data.attendance.length === 0,
      unknownStudents: [...unknown].slice(0, 200)
    }
  };
}

// ../../../totalclaw-solutions/solutions/workbench-campus-ai/src/main/services/campusAi/notice.ts
var import_i18n7 = require("npm:@totalclaw/i18n");
var NAME_SLOT = "[STUDENT]";
function levelLabel(l) {
  return { red: (0, import_i18n7.t)("\u7EA2\u8272\u9884\u8B66"), orange: (0, import_i18n7.t)("\u6A59\u8272\u9884\u8B66"), yellow: (0, import_i18n7.t)("\u9EC4\u8272\u9884\u8B66") }[l];
}
function anonymousFacts(s, level) {
  const facts = [(0, import_i18n7.t)("\u9884\u8B66\u7EA7\u522B\uFF1A{p0}", { p0: levelLabel(level) })];
  if (s.failed.length) {
    facts.push((0, import_i18n7.t)("\u4E0D\u53CA\u683C\u8BFE\u7A0B {n} \u95E8\uFF0C\u5171 {c} \u5B66\u5206\uFF1A", { n: s.failed.length, c: s.failCredits }));
    for (const f of s.failed) facts.push(`- ${f.course}\uFF1A${f.score}${f.credit ? (0, import_i18n7.t)("\uFF08{p0} \u5B66\u5206\uFF09", { p0: f.credit }) : ""}`);
  }
  if (s.totalSessions > 0) facts.push((0, import_i18n7.t)("\u7F3A\u52E4 {a} \u6B21 / \u5E94\u5230 {b} \u6B21\uFF0C\u7F3A\u52E4\u7387 {c}", { a: s.absent, b: s.totalSessions, c: pctText(s.absenceRate || 0) }));
  else if (s.absent > 0) facts.push((0, import_i18n7.t)("\u7F3A\u52E4 {a} \u6B21", { a: s.absent }));
  return facts;
}
function buildNoticePrompt(facts, schoolName) {
  return [
    (0, import_i18n7.t)("\u4F60\u662F{p0}\u7684\u8F85\u5BFC\u5458\u52A9\u624B\u3002\u4E0B\u9762\u662F\u4E00\u540D\u5B66\u751F\u7684\u5B66\u4E1A\u9884\u8B66\u4E8B\u5B9E\uFF08\u5DF2\u533F\u540D\uFF09\u3002", { p0: schoolName }),
    (0, import_i18n7.t)("\u8BF7\u5199\u4E24\u6BB5\u5185\u5BB9\uFF0C\u7528 JSON \u8FD4\u56DE\uFF1A{p0}", { p0: '{"outline":"...","notice":"..."}' }),
    (0, import_i18n7.t)("outline\uFF1A\u7ED9\u8F85\u5BFC\u5458\u7528\u7684\u8C08\u8BDD\u63D0\u7EB2\uFF0C4\uFF5E6 \u6761\uFF0C\u7528\u300C1. 2. 3.\u300D\u5206\u70B9\uFF0C\u5305\u62EC\u4E86\u89E3\u539F\u56E0\u3001\u5B66\u4E60\u8BA1\u5212\u3001\u8865\u8003 / \u91CD\u4FEE\u5B89\u6392\u3001\u9700\u8981\u7684\u5E2E\u6276\u3002"),
    (0, import_i18n7.t)("notice\uFF1A\u7ED9\u5B66\u751F\u672C\u4EBA\u7684\u901A\u77E5\uFF0C\u8BED\u6C14\u5173\u5FC3\u3001\u5177\u4F53\u3001\u4E0D\u8BAD\u65A5\uFF0C150\uFF5E250 \u5B57\uFF0C\u79F0\u547C\u4E00\u5F8B\u5199 {p0}\uFF0C\u843D\u6B3E\u5199\u300C\u8F85\u5BFC\u5458\u300D\u3002", { p0: NAME_SLOT }),
    (0, import_i18n7.t)("\u53EA\u80FD\u4F7F\u7528\u4E8B\u5B9E\u91CC\u7ED9\u51FA\u7684\u8BFE\u7A0B\u540D\u548C\u6570\u5B57\uFF0C\u4E0D\u8981\u5199\u4EFB\u4F55\u4E8B\u5B9E\u91CC\u6CA1\u6709\u7684\u6570\u5B57\u3001\u65E5\u671F\u3001\u5206\u6570\u6216\u6BD4\u4F8B\u3002"),
    "",
    (0, import_i18n7.t)("=== \u4E8B\u5B9E ==="),
    ...facts
  ].join("\n");
}
var UNIT_RE = /(\d+(?:\.\d+)?)\s*(门|次|学分|%)/g;
var stripListMarks = (s) => String(s || "").replace(/^\s*\d+\s*[.、)）]\s*/gm, "");
function numbersOutsideFacts(text, facts) {
  const factText = facts.join("\n");
  const withUnit = new Set([...factText.matchAll(UNIT_RE)].map((m) => `${m[1]}${m[2]}`));
  const plain = new Set(factText.match(/\d+(?:\.\d+)?/g) || []);
  const body = stripListMarks(text);
  const bad = /* @__PURE__ */ new Set();
  for (const m of body.matchAll(UNIT_RE)) if (!withUnit.has(`${m[1]}${m[2]}`)) bad.add(`${m[1]}${m[2]}`);
  for (const n of body.replace(UNIT_RE, " ").match(/\d+(?:\.\d+)?/g) || []) if (!plain.has(n)) bad.add(n);
  return [...bad];
}
function templateNotice(s, level, schoolName) {
  const items = [];
  if (s.failed.length) items.push((0, import_i18n7.t)("{n} \u95E8\u8BFE\u7A0B\u4E0D\u53CA\u683C\uFF08{p0}\uFF09", { n: s.failed.length, p0: s.failed.map((f) => `${f.course} ${f.score}`).join("\u3001") }));
  if (s.totalSessions > 0 && s.absent > 0) items.push((0, import_i18n7.t)("\u7F3A\u52E4 {a} \u6B21\uFF0C\u7F3A\u52E4\u7387 {b}", { a: s.absent, b: pctText(s.absenceRate || 0) }));
  else if (s.absent > 0) items.push((0, import_i18n7.t)("\u7F3A\u52E4 {a} \u6B21", { a: s.absent }));
  const situation = items.join((0, import_i18n7.t)("\uFF1B"));
  const outline = [
    `1. ${(0, import_i18n7.t)("\u8BF4\u660E\u9884\u8B66\u60C5\u51B5\uFF1A{p0}\uFF0C{p1}", { p0: levelLabel(level), p1: situation })}`,
    `2. ${(0, import_i18n7.t)("\u4E86\u89E3\u539F\u56E0\uFF1A\u5B66\u4E60\u65B9\u6CD5\u3001\u8BFE\u7A0B\u96BE\u5EA6\u3001\u4F5C\u606F\u3001\u5BB6\u5EAD\u6216\u8EAB\u4F53\u60C5\u51B5")}`,
    s.failed.length ? `3. ${(0, import_i18n7.t)("\u786E\u8BA4\u8865\u8003 / \u91CD\u4FEE\u5B89\u6392\uFF1A{p0}", { p0: s.failed.map((f) => f.course).join("\u3001") })}` : `3. ${(0, import_i18n7.t)("\u786E\u8BA4\u6309\u65F6\u5230\u8BFE\u7684\u5177\u4F53\u529E\u6CD5")}`,
    `4. ${(0, import_i18n7.t)("\u4E00\u8D77\u5236\u5B9A\u5B66\u4E60\u8BA1\u5212\uFF0C\u660E\u786E\u4E0B\u6B21\u8DDF\u8FDB\u65F6\u95F4")}`,
    `5. ${(0, import_i18n7.t)("\u9700\u8981\u65F6\u8054\u7CFB\u4EFB\u8BFE\u6559\u5E08\u3001\u5B66\u4E1A\u5E2E\u6276\u6216\u5FC3\u7406\u54A8\u8BE2")}`
  ].join("\n");
  const notice = [
    (0, import_i18n7.t)("{p0}\u540C\u5B66\uFF1A", { p0: NAME_SLOT }),
    (0, import_i18n7.t)("\u4F60\u672C\u5B66\u671F\u7684\u5B66\u4E1A\u60C5\u51B5\u5DF2\u8FBE\u5230{p0}\uFF1A{p1}\u3002", { p0: levelLabel(level), p1: situation }),
    (0, import_i18n7.t)("\u8FD9\u4E0D\u662F\u5904\u5206\uFF0C\u662F\u63D0\u9192\u6211\u4EEC\u4E00\u8D77\u5C3D\u65E9\u60F3\u529E\u6CD5\u3002\u8BF7\u5728\u6536\u5230\u901A\u77E5\u540E\u4E3B\u52A8\u8054\u7CFB\u8F85\u5BFC\u5458\uFF0C\u7EA6\u4E00\u4E2A\u65F6\u95F4\u804A\u804A\u9047\u5230\u7684\u56F0\u96BE\uFF0C\u6211\u4EEC\u4F1A\u5E2E\u4F60\u5B89\u6392\u8865\u8003\u590D\u4E60\u3001\u5B66\u4E1A\u5E2E\u6276\uFF0C\u628A\u540E\u9762\u7684\u8BFE\u7A0B\u8DDF\u4E0A\u3002"),
    (0, import_i18n7.t)("{p0} \u8F85\u5BFC\u5458", { p0: schoolName })
  ].join("\n");
  return { outline, notice };
}
async function draftNotice(s, level, schoolName, llm) {
  const at = (/* @__PURE__ */ new Date()).toISOString();
  const fallback = () => ({ studentId: s.studentId, ...templateNotice(s, level, schoolName), by: "template", at });
  if (!llm) return fallback();
  const facts = anonymousFacts(s, level);
  try {
    const { json, model } = await llm(buildNoticePrompt(facts, schoolName));
    const outline = String(json?.outline || "").trim();
    const notice = String(json?.notice || "").trim();
    if (!outline || !notice) return fallback();
    if (numbersOutsideFacts(`${outline}
${notice}`, facts).length) return { ...fallback(), model };
    const withSlot = notice.includes(NAME_SLOT) ? notice : `${NAME_SLOT}${(0, import_i18n7.t)("\u540C\u5B66\uFF1A")}
${notice}`;
    return { studentId: s.studentId, outline, notice: withSlot, by: "model", model, at };
  } catch {
    return fallback();
  }
}
function fillName(text, name) {
  return String(text || "").split(NAME_SLOT).join(name || (0, import_i18n7.t)("\u540C\u5B66"));
}

// ../../../totalclaw-solutions/solutions/workbench-campus-ai/src/main/services/campusAi/demoData.ts
var import_node_fs4 = require("node:fs");
var import_node_path5 = require("node:path");
var import_excel3 = require("host:apps/desktop-shell/src/main/services/serviceSettlement/excel.ts");

// ../../../totalclaw-solutions/solutions/workbench-campus-ai/src/main/services/campusAi/demoCampus.json
var demoCampus_default = {
  docs: [
    {
      file: "\u793A\u4F8B-\u5B66\u751F\u624B\u518C\uFF08\u5B66\u7C4D\u7BA1\u7406\u8282\u9009\uFF09.md",
      dept: "\u6559\u52A1\u5904",
      category: "\u89C4\u7AE0\u5236\u5EA6",
      text: "# \u5B66\u751F\u624B\u518C\uFF08\u5B66\u7C4D\u7BA1\u7406\u8282\u9009\uFF09\n\n\u672C\u6587\u4EF6\u4E3A\u6F14\u793A\u7528\u793A\u4F8B\u8D44\u6599\u3002\n\n## \u7B2C\u4E00\u7AE0 \u8003\u6838\u4E0E\u6210\u7EE9\n\n\u7B2C\u4E00\u6761 \u8BFE\u7A0B\u8003\u6838\u6210\u7EE9\u91C7\u7528\u767E\u5206\u5236\uFF0C60 \u5206\u53CA\u4EE5\u4E0A\u4E3A\u53CA\u683C\u3002\u8003\u67E5\u8BFE\u53EF\u91C7\u7528\u4F18\u79C0\u3001\u826F\u597D\u3001\u4E2D\u7B49\u3001\u53CA\u683C\u3001\u4E0D\u53CA\u683C\u4E94\u7EA7\u5236\u3002\n\n\u7B2C\u4E8C\u6761 \u5B66\u751F\u8BFE\u7A0B\u8003\u6838\u4E0D\u53CA\u683C\uFF0C\u53EF\u53C2\u52A0\u5B66\u6821\u7EDF\u4E00\u7EC4\u7EC7\u7684\u8865\u8003\u3002\u8865\u8003\u5B89\u6392\u5728\u4E0B\u4E00\u5B66\u671F\u5F00\u5B66\u540E\u7B2C 2 \u5468\u8FDB\u884C\uFF0C\u5177\u4F53\u65F6\u95F4\u4EE5\u6559\u52A1\u5904\u901A\u77E5\u4E3A\u51C6\u3002\u8865\u8003\u4E0D\u6536\u8D39\u3002\n\n\u7B2C\u4E09\u6761 \u8865\u8003\u4ECD\u4E0D\u53CA\u683C\u7684\u8BFE\u7A0B\u987B\u91CD\u4FEE\u3002\u91CD\u4FEE\u62A5\u540D\u5728\u6BCF\u5B66\u671F\u7B2C 3 \u5468\u901A\u8FC7\u6559\u52A1\u7CFB\u7EDF\u8FDB\u884C\uFF0C\u91CD\u4FEE\u8D39\u6309\u6BCF\u5B66\u5206 80 \u5143\u6536\u53D6\u3002\n\n\u7B2C\u56DB\u6761 \u56E0\u75C5\u6216\u7279\u6B8A\u539F\u56E0\u4E0D\u80FD\u53C2\u52A0\u8003\u8BD5\u7684\uFF0C\u987B\u5728\u8003\u524D\u63D0\u4EA4\u7F13\u8003\u7533\u8BF7\uFF0C\u7ECF\u4E8C\u7EA7\u5B66\u9662\u540C\u610F\u3001\u6559\u52A1\u5904\u5BA1\u6279\u540E\u65B9\u53EF\u7F13\u8003\u3002\u7F13\u8003\u4E0E\u8865\u8003\u540C\u65F6\u8FDB\u884C\u3002\n\n## \u7B2C\u4E8C\u7AE0 \u5B66\u4E1A\u9884\u8B66\n\n\u7B2C\u4E94\u6761 \u5B66\u6821\u5B9E\u884C\u5B66\u4E1A\u9884\u8B66\u5236\u5EA6\uFF0C\u6BCF\u5B66\u671F\u6210\u7EE9\u5F55\u5165\u540E\u53D1\u5E03\u4E00\u6B21\u3002\u9884\u8B66\u5206\u4E3A\u9EC4\u8272\u3001\u6A59\u8272\u3001\u7EA2\u8272\u4E09\u7EA7\u3002\n\n\u7B2C\u516D\u6761 \u4E00\u5B66\u671F\u4E0D\u53CA\u683C\u8BFE\u7A0B\u7D2F\u8BA1\u8FBE\u5230 4 \u95E8\u6216\u4E0D\u53CA\u683C\u5B66\u5206\u7D2F\u8BA1\u8FBE\u5230 12 \u5B66\u5206\u7684\uFF0C\u7ED9\u4E88\u7EA2\u8272\u9884\u8B66\uFF0C\u5E76\u901A\u77E5\u5BB6\u957F\u3002\n\n\u7B2C\u4E03\u6761 \u6536\u5230\u9884\u8B66\u7684\u5B66\u751F\u5E94\u5728\u4E00\u5468\u5185\u4E0E\u8F85\u5BFC\u5458\u9762\u8C08\uFF0C\u5236\u5B9A\u5B66\u4E1A\u6539\u8FDB\u8BA1\u5212\u3002\n\n## \u7B2C\u4E09\u7AE0 \u8003\u52E4\u4E0E\u8BF7\u5047\n\n\u7B2C\u516B\u6761 \u5B66\u751F\u8BF7\u5047 1 \u5929\u4EE5\u5185\u7531\u8F85\u5BFC\u5458\u5BA1\u6279\uFF0C3 \u5929\u4EE5\u5185\u7531\u4E8C\u7EA7\u5B66\u9662\u5BA1\u6279\uFF0C3 \u5929\u4EE5\u4E0A\u7531\u5B66\u5DE5\u5904\u5BA1\u6279\u3002\u8BF7\u5047\u987B\u5728\u5B66\u5DE5\u7CFB\u7EDF\u63D0\u4EA4\u7533\u8BF7\u3002\n\n\u7B2C\u4E5D\u6761 \u4E00\u95E8\u8BFE\u7A0B\u7F3A\u8BFE\u7D2F\u8BA1\u8D85\u8FC7\u8BE5\u8BFE\u7A0B\u603B\u5B66\u65F6\u4E09\u5206\u4E4B\u4E00\u7684\uFF0C\u53D6\u6D88\u8BE5\u8BFE\u7A0B\u8003\u8BD5\u8D44\u683C\uFF0C\u987B\u91CD\u4FEE\u3002\n"
    },
    {
      file: "\u793A\u4F8B-\u5956\u52A9\u5B66\u91D1\u8BC4\u5B9A\u529E\u6CD5.md",
      dept: "\u5B66\u5DE5\u5904",
      category: "\u5956\u52A9\u8D44\u52A9",
      text: "# \u5956\u52A9\u5B66\u91D1\u8BC4\u5B9A\u529E\u6CD5\n\n\u672C\u6587\u4EF6\u4E3A\u6F14\u793A\u7528\u793A\u4F8B\u8D44\u6599\u3002\n\n## \u4E00\u3001\u56FD\u5BB6\u52A9\u5B66\u91D1\n\n\u56FD\u5BB6\u52A9\u5B66\u91D1\u7528\u4E8E\u8D44\u52A9\u5BB6\u5EAD\u7ECF\u6D4E\u56F0\u96BE\u5B66\u751F\uFF0C\u5206\u4E3A\u4E24\u6863\uFF1A\u4E00\u6863\u6BCF\u751F\u6BCF\u5E74 3700 \u5143\uFF0C\u4E8C\u6863\u6BCF\u751F\u6BCF\u5E74 2500 \u5143\uFF0C\u6309\u5B66\u671F\u53D1\u653E\u3002\n\n\u7533\u8BF7\u65F6\u95F4\u4E3A\u6BCF\u5E74 9 \u6708 15 \u65E5\u81F3 9 \u6708 30 \u65E5\u3002\u5B66\u751F\u987B\u5148\u5B8C\u6210\u5BB6\u5EAD\u7ECF\u6D4E\u56F0\u96BE\u8BA4\u5B9A\uFF0C\u518D\u5411\u8F85\u5BFC\u5458\u63D0\u4EA4\u7533\u8BF7\u8868\u3002\n\n## \u4E8C\u3001\u5B66\u9662\u5956\u5B66\u91D1\n\n\u5B66\u9662\u5956\u5B66\u91D1\u5206\u4E3A\u4E00\u7B49\u5956\u5B66\u91D1 2000 \u5143\u3001\u4E8C\u7B49\u5956\u5B66\u91D1 1000 \u5143\u3001\u4E09\u7B49\u5956\u5B66\u91D1 500 \u5143\uFF0C\u6BCF\u5B66\u5E74\u8BC4\u5B9A\u4E00\u6B21\uFF0C\u8BC4\u5B9A\u6BD4\u4F8B\u5206\u522B\u4E3A 3%\u30017%\u300110%\u3002\n\n\u7533\u8BF7\u6761\u4EF6\uFF1A\u4E0A\u4E00\u5B66\u5E74\u6240\u6709\u8BFE\u7A0B\u8003\u6838\u5408\u683C\uFF0C\u65E0\u8FDD\u7EAA\u5904\u5206\uFF0C\u7EFC\u5408\u6D4B\u8BC4\u6392\u540D\u8FDB\u5165\u73ED\u7EA7\u524D\u5217\u3002\n\n## \u4E09\u3001\u52E4\u5DE5\u52A9\u5B66\n\n\u6821\u5185\u52E4\u5DE5\u52A9\u5B66\u5C97\u4F4D\u6BCF\u6708\u6708\u521D\u5728\u5B66\u5DE5\u5904\u7F51\u7AD9\u53D1\u5E03\uFF0C\u62A5\u916C\u6309\u6BCF\u5C0F\u65F6 20 \u5143\u8BA1\u7B97\uFF0C\u6BCF\u6708\u5DE5\u4F5C\u4E0D\u8D85\u8FC7 40 \u5C0F\u65F6\u3002\n\n## \u56DB\u3001\u54A8\u8BE2\u65B9\u5F0F\n\n\u5B66\u751F\u8D44\u52A9\u7BA1\u7406\u4E2D\u5FC3\u8BBE\u5728\u5B66\u5DE5\u5904\uFF0C\u529E\u516C\u5730\u70B9\u4E3A\u884C\u653F\u697C 205 \u5BA4\uFF0C\u5DE5\u4F5C\u65F6\u95F4\u4E3A\u5468\u4E00\u81F3\u5468\u4E94 8:30-17:00\u3002\n"
    },
    {
      file: "\u793A\u4F8B-\u65B0\u751F\u5165\u5B66\u6307\u5357.md",
      dept: "\u62DB\u751F\u529E",
      category: "\u62DB\u751F\u8FCE\u65B0",
      text: "# \u65B0\u751F\u5165\u5B66\u6307\u5357\n\n\u672C\u6587\u4EF6\u4E3A\u6F14\u793A\u7528\u793A\u4F8B\u8D44\u6599\u3002\n\n## \u62A5\u5230\u65F6\u95F4\u4E0E\u5730\u70B9\n\n\u65B0\u751F\u62A5\u5230\u65F6\u95F4\u4E3A 9 \u6708 6 \u65E5\u81F3 9 \u6708 7 \u65E5\uFF0C\u6BCF\u5929 8:00-18:00\u3002\u62A5\u5230\u5730\u70B9\u4E3A\u5B66\u6821\u4F53\u80B2\u9986\u4E00\u697C\u3002\n\n## \u62A5\u5230\u987B\u643A\u5E26\u7684\u6750\u6599\n\n1. \u5F55\u53D6\u901A\u77E5\u4E66\uFF1B\n2. \u672C\u4EBA\u8EAB\u4EFD\u8BC1\u539F\u4EF6\u53CA\u590D\u5370\u4EF6 2 \u4EFD\uFF1B\n3. \u8FD1\u671F\u4E00\u5BF8\u514D\u51A0\u5F69\u8272\u7167\u7247 6 \u5F20\uFF1B\n4. \u56E2\u5458\u9700\u643A\u5E26\u56E2\u5458\u8BC1\u53CA\u7EC4\u7EC7\u5173\u7CFB\u4ECB\u7ECD\u4FE1\uFF1B\n5. \u5BB6\u5EAD\u7ECF\u6D4E\u56F0\u96BE\u5B66\u751F\u53EF\u643A\u5E26\u76F8\u5173\u8BC1\u660E\u6750\u6599\uFF0C\u4EE5\u4FBF\u7533\u8BF7\u7EFF\u8272\u901A\u9053\u3002\n\n## \u7EFF\u8272\u901A\u9053\n\n\u5BB6\u5EAD\u7ECF\u6D4E\u56F0\u96BE\u3001\u6682\u65F6\u65E0\u6CD5\u7F34\u7EB3\u5B66\u8D39\u7684\u65B0\u751F\uFF0C\u53EF\u5728\u62A5\u5230\u73B0\u573A\u7684\u7EFF\u8272\u901A\u9053\u7A97\u53E3\u5148\u529E\u7406\u5165\u5B66\u624B\u7EED\uFF0C\u5165\u5B66\u540E\u518D\u7533\u8BF7\u8D44\u52A9\u3002\n\n## \u4EA4\u901A\n\n\u5B66\u6821\u5728\u706B\u8F66\u7AD9\u8BBE\u6709\u65B0\u751F\u63A5\u7AD9\u70B9\uFF0C9 \u6708 6 \u65E5\u81F3 9 \u6708 7 \u65E5\u6BCF 30 \u5206\u949F\u53D1\u4E00\u73ED\u63A5\u7AD9\u8F66\u3002\n\n## \u519B\u8BAD\n\n\u65B0\u751F\u519B\u8BAD\u4ECE 9 \u6708 9 \u65E5\u5F00\u59CB\uFF0C\u4E3A\u671F 14 \u5929\u3002\u519B\u8BAD\u670D\u88C5\u5728\u62A5\u5230\u65F6\u7EDF\u4E00\u9886\u53D6\u3002\n"
    },
    {
      file: "\u793A\u4F8B-\u56FE\u4E66\u9986\u670D\u52A1\u6307\u5357.md",
      dept: "\u56FE\u4E66\u9986",
      category: "\u751F\u6D3B\u670D\u52A1",
      text: "# \u56FE\u4E66\u9986\u670D\u52A1\u6307\u5357\n\n\u672C\u6587\u4EF6\u4E3A\u6F14\u793A\u7528\u793A\u4F8B\u8D44\u6599\u3002\n\n\u56FE\u4E66\u9986\u5F00\u653E\u65F6\u95F4\uFF1A\u5468\u4E00\u81F3\u5468\u65E5 7:30-22:00\uFF0C\u6CD5\u5B9A\u8282\u5047\u65E5\u53E6\u884C\u901A\u77E5\u3002\n\n\u501F\u9605\u89C4\u5219\uFF1A\u5B66\u751F\u51ED\u6821\u56ED\u5361\u6BCF\u4EBA\u53EF\u501F\u56FE\u4E66 10 \u518C\uFF0C\u501F\u671F 30 \u5929\uFF0C\u53EF\u7EED\u501F 1 \u6B21\uFF0C\u7EED\u501F\u671F 30 \u5929\u3002\u903E\u671F\u6BCF\u518C\u6BCF\u5929\u6536\u53D6\u6EDE\u7EB3\u91D1 0.1 \u5143\u3002\n\n\u7535\u5B50\u8D44\u6E90\uFF1A\u6821\u5185\u7F51\u7EDC\u53EF\u76F4\u63A5\u8BBF\u95EE\u4E2D\u56FD\u77E5\u7F51\u7B49\u6570\u636E\u5E93\uFF1B\u6821\u5916\u8BBF\u95EE\u8BF7\u767B\u5F55\u56FE\u4E66\u9986\u7F51\u7AD9\u4F7F\u7528\u8FDC\u7A0B\u8BBF\u95EE\u7CFB\u7EDF\u3002\n\n\u81EA\u4E60\u5BA4\uFF1A\u4E09\u697C\u548C\u56DB\u697C\u8BBE\u6709\u81EA\u4E60\u533A\uFF0C\u5EA7\u4F4D\u9700\u901A\u8FC7\u56FE\u4E66\u9986\u5C0F\u7A0B\u5E8F\u9884\u7EA6\uFF0C\u6BCF\u6B21\u6700\u957F 4 \u5C0F\u65F6\u3002\n\n\u56FE\u4E66\u9057\u5931\uFF1A\u987B\u8D54\u507F\u539F\u4E66\u4EF7\u683C\u7684 2 \u500D\u3002\n"
    },
    {
      file: "\u793A\u4F8B-\u540E\u52E4\u670D\u52A1\u6307\u5357.md",
      dept: "\u540E\u52E4\u5904",
      category: "\u751F\u6D3B\u670D\u52A1",
      text: "# \u540E\u52E4\u670D\u52A1\u6307\u5357\n\n\u672C\u6587\u4EF6\u4E3A\u6F14\u793A\u7528\u793A\u4F8B\u8D44\u6599\u3002\n\n## \u5BBF\u820D\u62A5\u4FEE\n\n\u5BBF\u820D\u6C34\u7535\u3001\u95E8\u7A97\u3001\u5BB6\u5177\u635F\u574F\uFF0C\u53EF\u901A\u8FC7\u540E\u52E4\u62A5\u4FEE\u5C0F\u7A0B\u5E8F\u63D0\u4EA4\uFF0C\u6216\u62E8\u6253\u540E\u52E4\u670D\u52A1\u70ED\u7EBF 0000-1234567\u3002\u4E00\u822C\u6545\u969C 24 \u5C0F\u65F6\u5185\u4E0A\u95E8\u7EF4\u4FEE\u3002\n\n## \u70ED\u6C34\u4E0E\u6D17\u6D74\n\n\u5BBF\u820D\u70ED\u6C34\u4F9B\u5E94\u65F6\u95F4\u4E3A\u6BCF\u5929 6:30-8:30 \u548C 17:00-23:30\u3002\u516C\u5171\u6D74\u5BA4\u5F00\u653E\u65F6\u95F4\u4E3A\u6BCF\u5929 12:00-23:00\u3002\n\n## \u6821\u56ED\u5361\n\n\u6821\u56ED\u5361\u4E22\u5931\u540E\uFF0C\u8BF7\u5148\u5728\u6821\u56ED\u5361\u5C0F\u7A0B\u5E8F\u4E2D\u6302\u5931\uFF0C\u518D\u5230\u884C\u653F\u697C\u4E00\u697C\u6821\u56ED\u5361\u670D\u52A1\u4E2D\u5FC3\u8865\u529E\uFF0C\u8865\u5361\u5DE5\u672C\u8D39 20 \u5143\u3002\u670D\u52A1\u4E2D\u5FC3\u5DE5\u4F5C\u65F6\u95F4\u4E3A\u5468\u4E00\u81F3\u5468\u4E94 8:30-17:00\u3002\n\n## \u5BBF\u820D\u7BA1\u7406\n\n\u5BBF\u820D\u7184\u706F\u65F6\u95F4\u4E3A\u5468\u65E5\u81F3\u5468\u56DB 23:30\uFF0C\u5468\u4E94\u3001\u5468\u516D 24:00\u3002\u5BBF\u820D\u5185\u7981\u6B62\u4F7F\u7528\u5927\u529F\u7387\u7535\u5668\u3002\n"
    }
  ],
  faqs: [
    {
      question: "\u8865\u8003\u4EC0\u4E48\u65F6\u5019\u8003\uFF1F",
      similar: [
        "\u8865\u8003\u65F6\u95F4",
        "\u4EC0\u4E48\u65F6\u5019\u8865\u8003"
      ],
      answer: "\u8865\u8003\u5B89\u6392\u5728\u4E0B\u4E00\u5B66\u671F\u5F00\u5B66\u540E\u7B2C 2 \u5468\u8FDB\u884C\uFF0C\u5177\u4F53\u65F6\u95F4\u4EE5\u6559\u52A1\u5904\u901A\u77E5\u4E3A\u51C6\uFF0C\u8865\u8003\u4E0D\u6536\u8D39\u3002",
      dept: "\u6559\u52A1\u5904"
    },
    {
      question: "\u91CD\u4FEE\u600E\u4E48\u62A5\u540D\uFF1F",
      similar: [
        "\u91CD\u4FEE\u62A5\u540D\u65F6\u95F4",
        "\u91CD\u4FEE\u8D39\u591A\u5C11"
      ],
      answer: "\u91CD\u4FEE\u62A5\u540D\u5728\u6BCF\u5B66\u671F\u7B2C 3 \u5468\u901A\u8FC7\u6559\u52A1\u7CFB\u7EDF\u8FDB\u884C\uFF0C\u91CD\u4FEE\u8D39\u6309\u6BCF\u5B66\u5206 80 \u5143\u6536\u53D6\u3002",
      dept: "\u6559\u52A1\u5904"
    },
    {
      question: "\u56FD\u5BB6\u52A9\u5B66\u91D1\u4EC0\u4E48\u65F6\u5019\u7533\u8BF7\uFF1F",
      similar: [
        "\u52A9\u5B66\u91D1\u7533\u8BF7\u65F6\u95F4",
        "\u600E\u4E48\u7533\u8BF7\u52A9\u5B66\u91D1"
      ],
      answer: "\u6BCF\u5E74 9 \u6708 15 \u65E5\u81F3 9 \u6708 30 \u65E5\u7533\u8BF7\u3002\u987B\u5148\u5B8C\u6210\u5BB6\u5EAD\u7ECF\u6D4E\u56F0\u96BE\u8BA4\u5B9A\uFF0C\u518D\u5411\u8F85\u5BFC\u5458\u63D0\u4EA4\u7533\u8BF7\u8868\u3002",
      dept: "\u5B66\u5DE5\u5904"
    },
    {
      question: "\u65B0\u751F\u62A5\u5230\u8981\u5E26\u4EC0\u4E48\uFF1F",
      similar: [
        "\u62A5\u5230\u9700\u8981\u4EC0\u4E48\u6750\u6599",
        "\u62A5\u5230\u6750\u6599"
      ],
      answer: "\u5F55\u53D6\u901A\u77E5\u4E66\uFF1B\u8EAB\u4EFD\u8BC1\u539F\u4EF6\u53CA\u590D\u5370\u4EF6 2 \u4EFD\uFF1B\u4E00\u5BF8\u514D\u51A0\u5F69\u8272\u7167\u7247 6 \u5F20\uFF1B\u56E2\u5458\u5E26\u56E2\u5458\u8BC1\u53CA\u7EC4\u7EC7\u5173\u7CFB\u4ECB\u7ECD\u4FE1\uFF1B\u5BB6\u5EAD\u7ECF\u6D4E\u56F0\u96BE\u5B66\u751F\u53EF\u5E26\u76F8\u5173\u8BC1\u660E\u3002",
      dept: "\u62DB\u751F\u529E"
    },
    {
      question: "\u56FE\u4E66\u9986\u51E0\u70B9\u5F00\u95E8\uFF1F",
      similar: [
        "\u56FE\u4E66\u9986\u5F00\u653E\u65F6\u95F4",
        "\u56FE\u4E66\u9986\u51E0\u70B9\u5173\u95E8"
      ],
      answer: "\u56FE\u4E66\u9986\u5468\u4E00\u81F3\u5468\u65E5 7:30-22:00 \u5F00\u653E\uFF0C\u6CD5\u5B9A\u8282\u5047\u65E5\u53E6\u884C\u901A\u77E5\u3002",
      dept: "\u56FE\u4E66\u9986"
    },
    {
      question: "\u6821\u56ED\u5361\u4E22\u4E86\u600E\u4E48\u529E\uFF1F",
      similar: [
        "\u6821\u56ED\u5361\u8865\u529E",
        "\u996D\u5361\u4E22\u4E86"
      ],
      answer: "\u5148\u5728\u6821\u56ED\u5361\u5C0F\u7A0B\u5E8F\u4E2D\u6302\u5931\uFF0C\u518D\u5230\u884C\u653F\u697C\u4E00\u697C\u6821\u56ED\u5361\u670D\u52A1\u4E2D\u5FC3\u8865\u529E\uFF0C\u8865\u5361\u5DE5\u672C\u8D39 20 \u5143\u3002",
      dept: "\u540E\u52E4\u5904"
    },
    {
      question: "\u5BBF\u820D\u4EC0\u4E48\u65F6\u5019\u6709\u70ED\u6C34\uFF1F",
      similar: [
        "\u70ED\u6C34\u65F6\u95F4",
        "\u51E0\u70B9\u6709\u70ED\u6C34"
      ],
      answer: "\u5BBF\u820D\u70ED\u6C34\u4F9B\u5E94\u65F6\u95F4\u4E3A\u6BCF\u5929 6:30-8:30 \u548C 17:00-23:30\u3002",
      dept: "\u540E\u52E4\u5904"
    }
  ],
  surnames: [
    "\u738B",
    "\u674E",
    "\u5F20",
    "\u5218",
    "\u9648",
    "\u6768",
    "\u9EC4",
    "\u8D75",
    "\u5434",
    "\u5468",
    "\u5F90",
    "\u5B59",
    "\u9A6C",
    "\u6731",
    "\u80E1",
    "\u90ED",
    "\u4F55",
    "\u6797",
    "\u7F57",
    "\u9AD8"
  ],
  given: [
    "\u5B50\u6DB5",
    "\u96E8\u8F69",
    "\u6D69\u7136",
    "\u6B23\u6021",
    "\u6893\u8431",
    "\u5B87\u822A",
    "\u601D\u8FDC",
    "\u4F73\u6021",
    "\u4FCA\u6770",
    "\u8BD7\u742A",
    "\u6668\u9633",
    "\u5609\u8C6A",
    "\u96C5\u5A77",
    "\u535A\u6587",
    "\u68A6\u7476",
    "\u5929\u5B87",
    "\u53EF\u99A8",
    "\u5FD7\u5F3A",
    "\u82E5\u66E6",
    "\u660E\u8F89"
  ],
  classes: [
    {
      className: "\u667A\u80FD\u5236\u90202401\u73ED",
      college: "\u667A\u80FD\u5236\u9020\u5B66\u9662",
      major: "\u673A\u7535\u4E00\u4F53\u5316\u6280\u672F",
      counselor: "\u793A\u4F8B\u8F85\u5BFC\u5458\u7532",
      counselorEmail: "counselor-a@example.edu.cn",
      courses: [
        [
          "\u9AD8\u7B49\u6570\u5B66",
          4
        ],
        [
          "\u673A\u68B0\u5236\u56FE",
          3
        ],
        [
          "\u7535\u5DE5\u7535\u5B50\u6280\u672F",
          3
        ],
        [
          "\u5927\u5B66\u82F1\u8BED",
          3
        ],
        [
          "\u601D\u60F3\u9053\u5FB7\u4E0E\u6CD5\u6CBB",
          2
        ],
        [
          "\u4F53\u80B2",
          1
        ]
      ]
    },
    {
      className: "\u667A\u80FD\u5236\u90202402\u73ED",
      college: "\u667A\u80FD\u5236\u9020\u5B66\u9662",
      major: "\u5DE5\u4E1A\u673A\u5668\u4EBA\u6280\u672F",
      counselor: "\u793A\u4F8B\u8F85\u5BFC\u5458\u7532",
      counselorEmail: "counselor-a@example.edu.cn",
      courses: [
        [
          "\u9AD8\u7B49\u6570\u5B66",
          4
        ],
        [
          "\u673A\u68B0\u57FA\u7840",
          3
        ],
        [
          "\u7535\u5DE5\u7535\u5B50\u6280\u672F",
          3
        ],
        [
          "\u5927\u5B66\u82F1\u8BED",
          3
        ],
        [
          "\u601D\u60F3\u9053\u5FB7\u4E0E\u6CD5\u6CBB",
          2
        ],
        [
          "\u4F53\u80B2",
          1
        ]
      ]
    },
    {
      className: "\u4FE1\u606F\u6280\u672F2401\u73ED",
      college: "\u4FE1\u606F\u5DE5\u7A0B\u5B66\u9662",
      major: "\u8BA1\u7B97\u673A\u7F51\u7EDC\u6280\u672F",
      counselor: "\u793A\u4F8B\u8F85\u5BFC\u5458\u4E59",
      counselorEmail: "counselor-b@example.edu.cn",
      courses: [
        [
          "\u9AD8\u7B49\u6570\u5B66",
          4
        ],
        [
          "\u7A0B\u5E8F\u8BBE\u8BA1\u57FA\u7840",
          4
        ],
        [
          "\u8BA1\u7B97\u673A\u7F51\u7EDC\u57FA\u7840",
          3
        ],
        [
          "\u5927\u5B66\u82F1\u8BED",
          3
        ],
        [
          "\u601D\u60F3\u9053\u5FB7\u4E0E\u6CD5\u6CBB",
          2
        ],
        [
          "\u4F53\u80B2",
          1
        ]
      ]
    },
    {
      className: "\u4FE1\u606F\u6280\u672F2402\u73ED",
      college: "\u4FE1\u606F\u5DE5\u7A0B\u5B66\u9662",
      major: "\u5927\u6570\u636E\u6280\u672F",
      counselor: "\u793A\u4F8B\u8F85\u5BFC\u5458\u4E59",
      counselorEmail: "counselor-b@example.edu.cn",
      courses: [
        [
          "\u9AD8\u7B49\u6570\u5B66",
          4
        ],
        [
          "\u7A0B\u5E8F\u8BBE\u8BA1\u57FA\u7840",
          4
        ],
        [
          "\u6570\u636E\u5E93\u6280\u672F",
          3
        ],
        [
          "\u5927\u5B66\u82F1\u8BED",
          3
        ],
        [
          "\u601D\u60F3\u9053\u5FB7\u4E0E\u6CD5\u6CBB",
          2
        ],
        [
          "\u4F53\u80B2",
          1
        ]
      ]
    }
  ],
  course: {
    name: "\u7535\u5DE5\u7535\u5B50\u6280\u672F",
    teacher: "\u793A\u4F8B\u6559\u5E08",
    file: "\u793A\u4F8B-\u7535\u5DE5\u7535\u5B50\u6280\u672F\u8BB2\u4E49\uFF08\u7B2C\u4E00\u3001\u4E8C\u7AE0\uFF09.md",
    text: "# \u7535\u5DE5\u7535\u5B50\u6280\u672F\u8BB2\u4E49\uFF08\u7B2C\u4E00\u3001\u4E8C\u7AE0\uFF09\n\n\u672C\u6587\u4EF6\u4E3A\u6F14\u793A\u7528\u793A\u4F8B\u8D44\u6599\u3002\n\n## \u7B2C\u4E00\u7AE0 \u76F4\u6D41\u7535\u8DEF\n\n1.1 \u7535\u8DEF\u7684\u7EC4\u6210\u3002\u7535\u8DEF\u4E00\u822C\u7531\u7535\u6E90\u3001\u8D1F\u8F7D\u548C\u4E2D\u95F4\u73AF\u8282\uFF08\u5BFC\u7EBF\u3001\u5F00\u5173\u7B49\uFF09\u4E09\u90E8\u5206\u7EC4\u6210\u3002\u7535\u6E90\u628A\u5176\u4ED6\u5F62\u5F0F\u7684\u80FD\u91CF\u8F6C\u6362\u4E3A\u7535\u80FD\uFF0C\u8D1F\u8F7D\u628A\u7535\u80FD\u8F6C\u6362\u4E3A\u5176\u4ED6\u5F62\u5F0F\u7684\u80FD\u91CF\u3002\n\n1.2 \u6B27\u59C6\u5B9A\u5F8B\u3002\u5728\u4E00\u6BB5\u4E0D\u542B\u7535\u6E90\u7684\u7535\u963B\u7535\u8DEF\u4E2D\uFF0C\u6D41\u8FC7\u7535\u963B\u7684\u7535\u6D41\u4E0E\u7535\u963B\u4E24\u7AEF\u7684\u7535\u538B\u6210\u6B63\u6BD4\uFF0C\u4E0E\u7535\u963B\u6210\u53CD\u6BD4\uFF0C\u5373 I = U / R\u3002\u7535\u538B\u7684\u5355\u4F4D\u662F\u4F0F\u7279\uFF08V\uFF09\uFF0C\u7535\u6D41\u7684\u5355\u4F4D\u662F\u5B89\u57F9\uFF08A\uFF09\uFF0C\u7535\u963B\u7684\u5355\u4F4D\u662F\u6B27\u59C6\uFF08\u03A9\uFF09\u3002\n\n1.3 \u7535\u963B\u7684\u4E32\u8054\u3002\u51E0\u4E2A\u7535\u963B\u4F9D\u6B21\u9996\u5C3E\u76F8\u8FDE\u3001\u4E2D\u95F4\u6CA1\u6709\u5206\u652F\u7684\u8FDE\u63A5\u65B9\u5F0F\u53EB\u4E32\u8054\u3002\u4E32\u8054\u7535\u8DEF\u4E2D\u6D41\u8FC7\u5404\u7535\u963B\u7684\u7535\u6D41\u76F8\u7B49\uFF1B\u603B\u7535\u538B\u7B49\u4E8E\u5404\u7535\u963B\u4E24\u7AEF\u7535\u538B\u4E4B\u548C\uFF1B\u603B\u7535\u963B\u7B49\u4E8E\u5404\u7535\u963B\u4E4B\u548C\u3002\n\n1.4 \u7535\u963B\u7684\u5E76\u8054\u3002\u51E0\u4E2A\u7535\u963B\u7684\u4E24\u7AEF\u5206\u522B\u8FDE\u63A5\u5728\u4E00\u8D77\u7684\u8FDE\u63A5\u65B9\u5F0F\u53EB\u5E76\u8054\u3002\u5E76\u8054\u7535\u8DEF\u4E2D\u5404\u7535\u963B\u4E24\u7AEF\u7684\u7535\u538B\u76F8\u7B49\uFF1B\u603B\u7535\u6D41\u7B49\u4E8E\u5404\u652F\u8DEF\u7535\u6D41\u4E4B\u548C\uFF1B\u603B\u7535\u963B\u7684\u5012\u6570\u7B49\u4E8E\u5404\u7535\u963B\u5012\u6570\u4E4B\u548C\uFF0C\u56E0\u6B64\u5E76\u8054\u540E\u7684\u603B\u7535\u963B\u6BD4\u4EFB\u4F55\u4E00\u4E2A\u652F\u8DEF\u7535\u963B\u90FD\u5C0F\u3002\n\n1.5 \u57FA\u5C14\u970D\u592B\u5B9A\u5F8B\u3002\u57FA\u5C14\u970D\u592B\u7535\u6D41\u5B9A\u5F8B\u6307\u51FA\uFF1A\u5728\u4EFB\u4E00\u65F6\u523B\uFF0C\u6D41\u5165\u7535\u8DEF\u4E2D\u4EFB\u4E00\u8282\u70B9\u7684\u7535\u6D41\u4E4B\u548C\u7B49\u4E8E\u6D41\u51FA\u8BE5\u8282\u70B9\u7684\u7535\u6D41\u4E4B\u548C\u3002\u57FA\u5C14\u970D\u592B\u7535\u538B\u5B9A\u5F8B\u6307\u51FA\uFF1A\u5728\u4EFB\u4E00\u65F6\u523B\uFF0C\u6CBF\u7535\u8DEF\u4E2D\u4EFB\u4E00\u95ED\u5408\u56DE\u8DEF\u7ED5\u884C\u4E00\u5468\uFF0C\u5404\u6BB5\u7535\u538B\u7684\u4EE3\u6570\u548C\u7B49\u4E8E\u96F6\u3002\n\n1.6 \u7535\u529F\u7387\u3002\u7535\u529F\u7387\u8868\u793A\u7535\u6D41\u505A\u529F\u7684\u5FEB\u6162\uFF0CP = U \xD7 I\uFF0C\u5355\u4F4D\u662F\u74E6\u7279\uFF08W\uFF09\u3002\n\n## \u7B2C\u4E8C\u7AE0 \u6B63\u5F26\u4EA4\u6D41\u7535\u8DEF\n\n2.1 \u6B63\u5F26\u4EA4\u6D41\u7535\u7684\u4E09\u8981\u7D20\u3002\u6B63\u5F26\u4EA4\u6D41\u7535\u7684\u5927\u5C0F\u548C\u65B9\u5411\u968F\u65F6\u95F4\u6309\u6B63\u5F26\u89C4\u5F8B\u53D8\u5316\uFF0C\u5176\u4E09\u8981\u7D20\u662F\u6700\u5927\u503C\u3001\u89D2\u9891\u7387\u548C\u521D\u76F8\u4F4D\u3002\u6211\u56FD\u7535\u529B\u7CFB\u7EDF\u7684\u6807\u51C6\u9891\u7387\uFF08\u5DE5\u9891\uFF09\u662F 50 \u8D6B\u5179\u3002\n\n2.2 \u6709\u6548\u503C\u3002\u4EA4\u6D41\u7535\u7684\u6709\u6548\u503C\u662F\u6839\u636E\u7535\u6D41\u7684\u70ED\u6548\u5E94\u6765\u89C4\u5B9A\u7684\uFF1A\u8BA9\u4EA4\u6D41\u7535\u548C\u76F4\u6D41\u7535\u5206\u522B\u901A\u8FC7\u963B\u503C\u76F8\u540C\u7684\u7535\u963B\uFF0C\u5982\u679C\u5728\u76F8\u540C\u65F6\u95F4\u5185\u4EA7\u751F\u7684\u70ED\u91CF\u76F8\u7B49\uFF0C\u8FD9\u4E2A\u76F4\u6D41\u7535\u7684\u6570\u503C\u5C31\u53EB\u505A\u8BE5\u4EA4\u6D41\u7535\u7684\u6709\u6548\u503C\u3002\u6B63\u5F26\u4EA4\u6D41\u7535\u7684\u6709\u6548\u503C\u7B49\u4E8E\u6700\u5927\u503C\u9664\u4EE5\u6839\u53F7 2\uFF0C\u7EA6\u4E3A\u6700\u5927\u503C\u7684 0.707 \u500D\u3002\u6211\u56FD\u6C11\u7528\u7535\u538B 220 \u4F0F\u6307\u7684\u662F\u6709\u6548\u503C\u3002\n\n2.3 \u7535\u611F\u4E0E\u7535\u5BB9\u3002\u7535\u611F\u5143\u4EF6\u5BF9\u4EA4\u6D41\u7535\u6709\u963B\u788D\u4F5C\u7528\uFF0C\u79F0\u4E3A\u611F\u6297\uFF0C\u9891\u7387\u8D8A\u9AD8\u611F\u6297\u8D8A\u5927\uFF1B\u7535\u5BB9\u5143\u4EF6\u5BF9\u4EA4\u6D41\u7535\u7684\u963B\u788D\u4F5C\u7528\u79F0\u4E3A\u5BB9\u6297\uFF0C\u9891\u7387\u8D8A\u9AD8\u5BB9\u6297\u8D8A\u5C0F\u3002\u7535\u5BB9\u5177\u6709\u201C\u9694\u76F4\u6D41\u3001\u901A\u4EA4\u6D41\u201D\u7684\u7279\u6027\u3002\n\n2.4 \u5B89\u5168\u7528\u7535\u3002\u4EBA\u4F53\u5B89\u5168\u7535\u538B\u4E00\u822C\u4E0D\u8D85\u8FC7 36 \u4F0F\u3002\u68C0\u4FEE\u7535\u8DEF\u524D\u5FC5\u987B\u65AD\u5F00\u7535\u6E90\uFF0C\u5E76\u7528\u9A8C\u7535\u5668\u786E\u8BA4\u65E0\u7535\u540E\u518D\u64CD\u4F5C\u3002\n"
  },
  key: [
    {
      no: "1",
      type: "\u5355\u9009",
      answer: "B",
      score: 2,
      points: ""
    },
    {
      no: "2",
      type: "\u5224\u65AD",
      answer: "\u5BF9",
      score: 2,
      points: ""
    },
    {
      no: "3",
      type: "\u591A\u9009",
      answer: "AC",
      score: 3,
      points: ""
    },
    {
      no: "4",
      type: "\u7B80\u7B54",
      answer: "\u4E32\u8054\u7535\u8DEF\u4E2D\u5404\u7535\u963B\u7684\u7535\u6D41\u76F8\u7B49\uFF0C\u603B\u7535\u538B\u7B49\u4E8E\u5404\u7535\u963B\u4E24\u7AEF\u7535\u538B\u4E4B\u548C\uFF0C\u603B\u7535\u963B\u7B49\u4E8E\u5404\u7535\u963B\u4E4B\u548C\u3002",
      score: 10,
      points: "\u7535\u6D41\u5904\u5904\u76F8\u7B49\uFF1B\u603B\u7535\u538B\u7B49\u4E8E\u5404\u5206\u7535\u538B\u4E4B\u548C\uFF1B\u603B\u7535\u963B\u7B49\u4E8E\u5404\u7535\u963B\u4E4B\u548C"
    },
    {
      no: "5",
      type: "\u7B80\u7B54",
      answer: "\u6709\u6548\u503C\u6309\u70ED\u6548\u5E94\u89C4\u5B9A\uFF1A\u4E0E\u4EA4\u6D41\u7535\u5728\u76F8\u540C\u7535\u963B\u3001\u76F8\u540C\u65F6\u95F4\u5185\u4EA7\u751F\u76F8\u540C\u70ED\u91CF\u7684\u76F4\u6D41\u7535\u6570\u503C\u3002\u6B63\u5F26\u4EA4\u6D41\u7535\u7684\u6709\u6548\u503C\u7B49\u4E8E\u6700\u5927\u503C\u9664\u4EE5\u6839\u53F72\uFF0C\u7EA6\u4E3A\u6700\u5927\u503C\u76840.707\u500D\u3002",
      score: 8,
      points: "\u6309\u70ED\u6548\u5E94\u7B49\u6548\u6765\u5B9A\u4E49\uFF1B\u6709\u6548\u503C\u7B49\u4E8E\u6700\u5927\u503C\u9664\u4EE5\u6839\u53F72\uFF08\u7EA60.707\u500D\uFF09"
    }
  ],
  shortAnswers: {
    "4": [
      "\u4E32\u8054\u65F6\u7535\u6D41\u5904\u5904\u76F8\u7B49\uFF0C\u603B\u7535\u538B\u662F\u5404\u7535\u963B\u7535\u538B\u4E4B\u548C\uFF0C\u603B\u7535\u963B\u7B49\u4E8E\u5404\u7535\u963B\u76F8\u52A0\u3002",
      "\u7535\u6D41\u76F8\u7B49\uFF0C\u7535\u538B\u76F8\u52A0\u3002",
      "\u603B\u7535\u963B\u7B49\u4E8E\u5404\u7535\u963B\u4E4B\u548C\uFF0C\u7535\u6D41\u4E00\u6837\u3002",
      "\u5404\u7535\u963B\u7535\u538B\u76F8\u7B49\uFF0C\u603B\u7535\u6D41\u7B49\u4E8E\u652F\u8DEF\u7535\u6D41\u4E4B\u548C\u3002",
      "\u4E0D\u4F1A",
      ""
    ],
    "5": [
      "\u6709\u6548\u503C\u662F\u548C\u4EA4\u6D41\u7535\u70ED\u6548\u5E94\u76F8\u540C\u7684\u76F4\u6D41\u7535\u7684\u503C\uFF0C\u6B63\u5F26\u4EA4\u6D41\u7535\u6709\u6548\u503C\u662F\u6700\u5927\u503C\u9664\u4EE5\u6839\u53F72\u3002",
      "\u6709\u6548\u503C\u7EA6\u7B49\u4E8E\u6700\u5927\u503C\u76840.707\u500D\u3002",
      "\u6709\u6548\u503C\u5C31\u662F\u5E73\u5747\u503C\u3002",
      "\u6309\u7167\u70ED\u6548\u5E94\uFF0C\u4E0E\u5B83\u53D1\u70ED\u76F8\u540C\u7684\u76F4\u6D41\u7535\u6570\u503C\u5C31\u662F\u6709\u6548\u503C\u3002",
      ""
    ]
  },
  guide: {
    file: "\u793A\u4F8B-2026\u5E74\u5EA6\u5E02\u7EA7\u79D1\u6280\u8BA1\u5212\u9879\u76EE\u7533\u62A5\u6307\u5357.md",
    text: "# 2026\u5E74\u5EA6\u5E02\u7EA7\u79D1\u6280\u8BA1\u5212\u9879\u76EE\u7533\u62A5\u6307\u5357\n\n\u672C\u6587\u4EF6\u4E3A\u6F14\u793A\u7528\u793A\u4F8B\u8D44\u6599\u3002\n\n## \u4E00\u3001\u7533\u62A5\u65F6\u95F4\n\n\u7F51\u4E0A\u7533\u62A5\u65F6\u95F4\u4E3A2026\u5E7411\u670810\u65E5\u81F32026\u5E7411\u670830\u65E517:00\uFF0C\u903E\u671F\u7CFB\u7EDF\u81EA\u52A8\u5173\u95ED\u3002\u7EB8\u8D28\u6750\u6599\u987B\u4E8E2026\u5E7412\u67085\u65E5\u524D\u62A5\u9001\u81F3\u5E02\u79D1\u6280\u5C40\u53D7\u7406\u7A97\u53E3\u3002\u5355\u4F4D\u63A8\u8350\u622A\u6B62\u65F6\u95F4\u4E3A2026\u5E7412\u67083\u65E5\u3002\n\n## \u4E8C\u3001\u7533\u62A5\u6761\u4EF6\n\n1. \u7533\u62A5\u5355\u4F4D\u987B\u4E3A\u5728\u672C\u5E02\u6CE8\u518C\u7684\u9AD8\u7B49\u9662\u6821\u3001\u79D1\u7814\u9662\u6240\u6216\u4F01\u4E1A\uFF0C\u5177\u6709\u72EC\u7ACB\u6CD5\u4EBA\u8D44\u683C\u3002\n2. \u9879\u76EE\u8D1F\u8D23\u4EBA\u987B\u5177\u6709\u4E2D\u7EA7\u53CA\u4EE5\u4E0A\u4E13\u4E1A\u6280\u672F\u804C\u79F0\uFF0C\u5E74\u9F84\u4E0D\u8D85\u8FC757\u5468\u5C81\u3002\n3. \u6BCF\u4F4D\u9879\u76EE\u8D1F\u8D23\u4EBA\u9650\u62A51\u9879\uFF0C\u5728\u7814\u5E02\u7EA7\u9879\u76EE\u672A\u7ED3\u9898\u7684\u4E0D\u5F97\u7533\u62A5\u3002\n4. \u7533\u62A5\u5355\u4F4D\u987B\u6709\u4E0D\u5C11\u4E8E1:1\u7684\u81EA\u7B79\u7ECF\u8D39\u914D\u5957\u3002\n\n## \u4E09\u3001\u652F\u6301\u65B9\u5411\u4E0E\u8D44\u52A9\u989D\u5EA6\n\n\u91CD\u70B9\u7814\u53D1\u9879\u76EE\u6BCF\u9879\u8D44\u52A930\u4E07\u5143\uFF0C\u5B9E\u65BD\u671F\u9650\u4E24\u5E74\uFF1B\u4EA7\u5B66\u7814\u5408\u4F5C\u9879\u76EE\u6BCF\u9879\u8D44\u52A915\u4E07\u5143\uFF1B\u9752\u5E74\u79D1\u6280\u4EBA\u624D\u9879\u76EE\u6BCF\u9879\u8D44\u52A95\u4E07\u5143\uFF0C\u8D1F\u8D23\u4EBA\u5E74\u9F84\u4E0D\u8D85\u8FC735\u5468\u5C81\u3002\n\n## \u56DB\u3001\u7533\u62A5\u6750\u6599\n\n1. \u9879\u76EE\u7533\u62A5\u4E66\uFF08\u7CFB\u7EDF\u5728\u7EBF\u586B\u62A5\u540E\u5BFC\u51FA\u76D6\u7AE0\uFF09\uFF1B\n2. \u5355\u4F4D\u6CD5\u4EBA\u8BC1\u4E66\u6216\u8425\u4E1A\u6267\u7167\u590D\u5370\u4EF6\uFF1B\n3. \u9879\u76EE\u8D1F\u8D23\u4EBA\u804C\u79F0\u8BC1\u4E66\u590D\u5370\u4EF6\uFF1B\n4. \u5408\u4F5C\u534F\u8BAE\uFF08\u4EA7\u5B66\u7814\u5408\u4F5C\u9879\u76EE\u5FC5\u987B\u63D0\u4F9B\uFF09\uFF1B\n5. \u81EA\u7B79\u7ECF\u8D39\u627F\u8BFA\u4E66\u3002\n\n## \u4E94\u3001\u8054\u7CFB\u65B9\u5F0F\n\n\u5E02\u79D1\u6280\u5C40\u8BA1\u5212\u5904\uFF0C\u8054\u7CFB\u7535\u8BDD\uFF1A0000-88880000\uFF0C\u8054\u7CFB\u4EBA\uFF1A\u793A\u4F8B\u8054\u7CFB\u4EBA\u3002\n"
  }
};

// ../../../totalclaw-solutions/solutions/workbench-campus-ai/src/main/services/campusAi/demoData.ts
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
function writeDemoKb(dir) {
  (0, import_node_fs4.mkdirSync)(dir, { recursive: true });
  const docs = demoCampus_default.docs.map((d) => {
    const path = (0, import_node_path5.join)(dir, d.file);
    (0, import_node_fs4.writeFileSync)(path, d.text, "utf-8");
    return { path, dept: d.dept, category: d.category };
  });
  const faqFile = (0, import_node_path5.join)(dir, "\u793A\u4F8B-\u5E38\u89C1\u95EE\u9898FAQ.xlsx");
  (0, import_excel3.writeWorkbook)(faqFile, [{
    name: "FAQ",
    headers: ["\u95EE\u9898", "\u76F8\u4F3C\u95EE\u6CD5", "\u7B54\u6848", "\u90E8\u95E8"],
    rows: demoCampus_default.faqs.map((f) => [f.question, f.similar.join("\uFF1B"), f.answer, f.dept])
  }]);
  return { docs, faqFile };
}
function writeDemoStudents(dir) {
  (0, import_node_fs4.mkdirSync)(dir, { recursive: true });
  const r = rng(20261021);
  const pick2 = (list) => list[Math.floor(r() * list.length)];
  const gauss = () => (r() + r() + r() + r() - 2) * 1.7;
  const usedNames = /* @__PURE__ */ new Set();
  const roster = [];
  const grades = [];
  const attendance = [];
  let seq = 0;
  demoCampus_default.classes.forEach((c, ci) => {
    for (let k = 0; k < 30; k++) {
      seq++;
      const id = `2024${String(ci + 1).padStart(2, "0")}${String(k + 1).padStart(3, "0")}`;
      let name = "";
      do {
        name = pick2(demoCampus_default.surnames) + pick2(demoCampus_default.given);
      } while (usedNames.has(name));
      usedNames.add(name);
      roster.push([id, name, c.className, c.college, c.major, c.counselor, c.counselorEmail]);
      const weak = r() < 0.1;
      const truant = r() < 0.06;
      const ability = weak ? 50 + gauss() * 6 : 76 + gauss() * 7;
      for (const [course, credit] of c.courses) {
        let score = Math.round(Math.min(100, Math.max(18, ability + gauss() * 7)));
        if (course === "\u4F53\u80B2" && score < 60 && r() < 0.7) score = 60 + Math.round(r() * 20);
        grades.push([id, name, course, credit, "2025-2026-1", score]);
        if (score < 60 && r() < 0.35) grades.push([id, name, course, credit, "2025-2026-1\u8865\u8003", 60 + Math.round(r() * 12)]);
        const total = credit * 8;
        const absent = truant ? Math.round(total * (0.22 + r() * 0.2)) : weak ? Math.round(r() * total * 0.15) : r() < 0.25 ? 1 + Math.floor(r() * 2) : 0;
        attendance.push([id, name, course, Math.min(absent, total), total]);
      }
    }
  });
  const rosterFile = (0, import_node_path5.join)(dir, "\u793A\u4F8B-\u5B66\u751F\u540D\u5355.xlsx");
  const gradesFile = (0, import_node_path5.join)(dir, "\u793A\u4F8B-\u8BFE\u7A0B\u6210\u7EE9.xlsx");
  const attFile = (0, import_node_path5.join)(dir, "\u793A\u4F8B-\u8003\u52E4\u6C47\u603B.xlsx");
  (0, import_excel3.writeWorkbook)(rosterFile, [{ name: "\u5B66\u751F\u540D\u5355", headers: ["\u5B66\u53F7", "\u59D3\u540D", "\u73ED\u7EA7", "\u5B66\u9662", "\u4E13\u4E1A", "\u8F85\u5BFC\u5458", "\u8F85\u5BFC\u5458\u90AE\u7BB1"], rows: roster }]);
  (0, import_excel3.writeWorkbook)(gradesFile, [{ name: "\u6210\u7EE9", headers: ["\u5B66\u53F7", "\u59D3\u540D", "\u8BFE\u7A0B\u540D\u79F0", "\u5B66\u5206", "\u5B66\u671F", "\u603B\u8BC4\u6210\u7EE9"], rows: grades }]);
  (0, import_excel3.writeWorkbook)(attFile, [{ name: "\u8003\u52E4", headers: ["\u5B66\u53F7", "\u59D3\u540D", "\u8BFE\u7A0B", "\u7F3A\u52E4\u6B21\u6570", "\u5E94\u5230\u6B21\u6570"], rows: attendance }]);
  return { roster: rosterFile, grades: gradesFile, attendance: attFile, students: seq };
}
function writeDemoCourse(dir) {
  (0, import_node_fs4.mkdirSync)(dir, { recursive: true });
  const C = demoCampus_default.course;
  const doc = (0, import_node_path5.join)(dir, C.file);
  (0, import_node_fs4.writeFileSync)(doc, C.text, "utf-8");
  const keyFile = (0, import_node_path5.join)(dir, "\u793A\u4F8B-\u7535\u5DE5\u7535\u5B50\u6280\u672F\u4F5C\u4E1A-\u6807\u51C6\u7B54\u6848.xlsx");
  (0, import_excel3.writeWorkbook)(keyFile, [{ name: "\u6807\u51C6\u7B54\u6848", headers: ["\u9898\u53F7", "\u9898\u578B", "\u6807\u51C6\u7B54\u6848", "\u5206\u503C", "\u8BC4\u5206\u8981\u70B9"], rows: demoCampus_default.key.map((k) => [k.no, k.type, k.answer, k.score, k.points]) }]);
  const r = rng(20261022);
  const pick2 = (list) => list[Math.floor(r() * list.length)];
  const rows = [];
  const used = /* @__PURE__ */ new Set();
  for (let i = 0; i < 20; i++) {
    let name = "";
    do {
      name = pick2(demoCampus_default.surnames) + pick2(demoCampus_default.given);
    } while (used.has(name));
    used.add(name);
    const good = r() < 0.65;
    const short = demoCampus_default.shortAnswers;
    rows.push([
      `2024010${String(i + 1).padStart(2, "0")}`,
      name,
      good ? "B" : pick2(["A", "C", "D", "B"]),
      good ? "\u5BF9" : pick2(["\u5BF9", "\u9519"]),
      good ? "AC" : pick2(["A", "AC", "ABC", "C"]),
      good ? short["4"][Math.floor(r() * 3)] : pick2(short["4"]),
      good ? short["5"][Math.floor(r() * 2)] : pick2(short["5"])
    ]);
  }
  const answersFile = (0, import_node_path5.join)(dir, "\u793A\u4F8B-\u7535\u5DE5\u7535\u5B50\u6280\u672F\u4F5C\u4E1A-\u5B66\u751F\u4F5C\u7B54.xlsx");
  (0, import_excel3.writeWorkbook)(answersFile, [{ name: "\u4F5C\u7B54", headers: ["\u5B66\u53F7", "\u59D3\u540D", "\u7B2C1\u9898", "\u7B2C2\u9898", "\u7B2C3\u9898", "\u7B2C4\u9898", "\u7B2C5\u9898"], rows }]);
  return { courseName: C.name, teacher: C.teacher, docs: [doc], keyFile, answersFile };
}
function writeDemoOutputs(dir) {
  (0, import_node_fs4.mkdirSync)(dir, { recursive: true });
  const r = rng(20261023);
  const pick2 = (list) => list[Math.floor(r() * list.length)];
  const colleges = ["\u667A\u80FD\u5236\u9020\u5B66\u9662", "\u4FE1\u606F\u5DE5\u7A0B\u5B66\u9662", "\u7ECF\u6D4E\u7BA1\u7406\u5B66\u9662", "\u5EFA\u7B51\u5DE5\u7A0B\u5B66\u9662", "\u9A6C\u514B\u601D\u4E3B\u4E49\u5B66\u9662"];
  const types = [["\u8BBA\u6587", 0], ["\u4E13\u5229", 0], ["\u7EB5\u5411\u9879\u76EE", 1], ["\u6A2A\u5411\u9879\u76EE", 1], ["\u83B7\u5956", 0], ["\u8457\u4F5C", 0]];
  const levels = ["\u56FD\u5BB6\u7EA7", "\u7701\u7EA7", "\u5E02\u7EA7", "\u6821\u7EA7"];
  const topics = ["\u5DE5\u4E1A\u673A\u5668\u4EBA", "\u667A\u80FD\u4F20\u611F", "\u6570\u5B57\u5B6A\u751F", "\u8DE8\u5883\u7535\u5546", "\u4E61\u6751\u632F\u5174", "\u88C5\u914D\u5F0F\u5EFA\u7B51", "\u804C\u4E1A\u6559\u80B2", "\u5927\u6570\u636E", "\u65B0\u80FD\u6E90\u6C7D\u8F66", "\u8BFE\u7A0B\u601D\u653F"];
  const rows = [];
  for (let i = 0; i < 80; i++) {
    const [type, funded] = pick2(types);
    const college = pick2(colleges);
    const year = 2022 + Math.floor(r() * 5);
    const level = type === "\u8BBA\u6587" ? pick2(["\u6838\u5FC3\u671F\u520A", "\u666E\u901A\u671F\u520A"]) : pick2(levels);
    const fund = funded ? Math.round((type === "\u7EB5\u5411\u9879\u76EE" ? 2 + r() * 28 : 5 + r() * 45) * 10) / 10 : "";
    rows.push([`${pick2(topics)}${pick2(["\u5173\u952E\u6280\u672F\u7814\u7A76", "\u5E94\u7528\u7814\u7A76", "\u5B9E\u8DF5\u63A2\u7D22", "\u7CFB\u7EDF\u8BBE\u8BA1", "\u6559\u5B66\u6539\u9769\u7814\u7A76"])}${i + 1}`, type, college, pick2(demoCampus_default.surnames) + pick2(demoCampus_default.given), `${year}-${String(1 + Math.floor(r() * 12)).padStart(2, "0")}`, level, fund]);
  }
  const file = (0, import_node_path5.join)(dir, "\u793A\u4F8B-\u79D1\u7814\u6210\u679C\u767B\u8BB0\u8868.xlsx");
  (0, import_excel3.writeWorkbook)(file, [{ name: "\u6210\u679C", headers: ["\u6210\u679C\u540D\u79F0", "\u6210\u679C\u7C7B\u578B", "\u6240\u5C5E\u5B66\u9662", "\u8D1F\u8D23\u4EBA", "\u7ACB\u9879/\u53D1\u8868\u65E5\u671F", "\u7EA7\u522B", "\u7ECF\u8D39\uFF08\u4E07\u5143\uFF09"], rows }]);
  return file;
}
function writeDemoGuide(dir) {
  (0, import_node_fs4.mkdirSync)(dir, { recursive: true });
  const file = (0, import_node_path5.join)(dir, demoCampus_default.guide.file);
  (0, import_node_fs4.writeFileSync)(file, demoCampus_default.guide.text, "utf-8");
  return file;
}

// ../../../totalclaw-solutions/solutions/workbench-campus-ai/src/main/ipc/campusAi.modules.ts
var import_node_fs5 = require("node:fs");
var import_node_path6 = require("node:path");
var import_ipc_contracts5 = require("npm:@totalclaw/ipc-contracts");
var import_i18n11 = require("npm:@totalclaw/i18n");
var import_documentExtractor2 = require("host:apps/desktop-shell/src/main/services/documentExtractor.ts");
var import_excel4 = require("host:apps/desktop-shell/src/main/services/serviceSettlement/excel.ts");

// ../../../totalclaw-solutions/solutions/workbench-campus-ai/src/main/services/campusAi/teaching.ts
var import_ipc_contracts4 = require("npm:@totalclaw/ipc-contracts");
var import_i18n8 = require("npm:@totalclaw/i18n");
function typeLabel(t) {
  return { single: (0, import_i18n8.t)("\u5355\u9009\u9898"), multiple: (0, import_i18n8.t)("\u591A\u9009\u9898"), judge: (0, import_i18n8.t)("\u5224\u65AD\u9898"), short: (0, import_i18n8.t)("\u7B80\u7B54\u9898") }[t];
}
function buildQuizPrompt(courseName, chunks, counts, focus) {
  const want = import_ipc_contracts4.CA_QUESTION_TYPES.filter((t) => counts[t] > 0).map((t) => `${typeLabel(t)} ${counts[t]}`).join((0, import_i18n8.t)("\uFF0C"));
  return [
    (0, import_i18n8.t)("\u4F60\u662F\u300A{p0}\u300B\u7684\u4EFB\u8BFE\u6559\u5E08\uFF0C\u8981\u6839\u636E\u4E0B\u9762\u7684\u8BFE\u7A0B\u8D44\u6599\u51FA\u9898\u3002", { p0: courseName }),
    (0, import_i18n8.t)("\u9898\u91CF\uFF1A{p0}\u3002", { p0: want }),
    focus ? (0, import_i18n8.t)("\u4FA7\u91CD\uFF1A{p0}\u3002", { p0: focus }) : "",
    (0, import_i18n8.t)("\u6BCF\u9053\u9898\u53EA\u80FD\u8003\u8D44\u6599\u91CC\u5199\u660E\u7684\u5185\u5BB9\uFF1B\u6BCF\u9053\u9898\u5FC5\u987B\u7ED9\u51FA quote\uFF1A\u4ECE\u5BF9\u5E94\u8D44\u6599\u91CC\u9010\u5B57\u6458\u5F55\u7684\u4E00\u53E5\u539F\u6587\uFF0810\uFF5E60 \u5B57\uFF0C\u4E0D\u80FD\u6539\u5B57\uFF09\uFF0C\u4F5C\u4E3A\u51FA\u9898\u4F9D\u636E\u3002"),
    (0, import_i18n8.t)("\u7528 JSON \u8FD4\u56DE\uFF1A{p0}", { p0: '{"questions":[{"type":"single|multiple|judge|short","stem":"...","options":["...","...","...","..."],"answer":"...","explanation":"...","source":1,"quote":"...","points":["..."],"score":2}]}' }),
    (0, import_i18n8.t)("single\uFF1A4 \u4E2A\u9009\u9879\uFF0Canswer \u662F\u4E00\u4E2A\u5B57\u6BCD\uFF08\u5982 B\uFF09\uFF1Bmultiple\uFF1A4 \u4E2A\u9009\u9879\uFF0Canswer \u662F\u4E24\u4E2A\u4EE5\u4E0A\u5B57\u6BCD\uFF08\u5982 ACD\uFF09\uFF1Bjudge\uFF1A\u4E0D\u8981 options\uFF0Canswer \u5199\u300C\u5BF9\u300D\u6216\u300C\u9519\u300D\uFF1Bshort\uFF1A\u4E0D\u8981 options\uFF0Canswer \u5199\u53C2\u8003\u7B54\u6848\uFF0Cpoints \u5199 2\uFF5E4 \u6761\u8BC4\u5206\u8981\u70B9\uFF0Cscore \u5199\u5206\u503C\u3002"),
    (0, import_i18n8.t)("\u9009\u9879\u4E0D\u8981\u5E26 A. B. \u524D\u7F00\uFF1Bsource \u662F\u8D44\u6599\u7F16\u53F7\u3002"),
    "",
    (0, import_i18n8.t)("=== \u8BFE\u7A0B\u8D44\u6599 ==="),
    chunks.map((c, i) => `${(0, import_i18n8.t)("\u8D44\u6599 {n}\uFF1A{title}", { n: i + 1, title: c.title })}
${c.text}`).join("\n\n")
  ].filter(Boolean).join("\n");
}
function looseText(s) {
  return String(s || "").replace(/[！-～]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 65248)).replace(/[\s\p{P}\p{S}]+/gu, "").toLowerCase();
}
var LETTERS = "ABCDEFGH";
function normalizeChoice(answer, optionCount) {
  const letters = String(answer || "").toUpperCase().replace(/[^A-H]/g, "").split("").filter((c) => LETTERS.indexOf(c) < optionCount);
  return [...new Set(letters)].sort().join("");
}
function normalizeJudge(answer) {
  const s = String(answer ?? "").trim().toLowerCase();
  if (/^(对|正确|是|√|✓|t|true|yes|y|1)$/.test(s)) return "T";
  if (/^(错|错误|否|×|✗|x|f|false|no|n|0)$/.test(s)) return "F";
  return "";
}
function answerLabel(type, answer) {
  if (type !== "judge") return answer;
  return answer === "T" ? (0, import_i18n8.t)("\u5BF9") : answer === "F" ? (0, import_i18n8.t)("\u9519") : answer;
}
function parseQuiz(json, chunks) {
  const list = Array.isArray(json?.questions) ? json.questions : Array.isArray(json) ? json : [];
  const out = [];
  const reasons = [];
  const seen = /* @__PURE__ */ new Set();
  for (const q of list) {
    const type = String(q?.type || "");
    const stem = String(q?.stem || "").trim();
    if (!import_ipc_contracts4.CA_QUESTION_TYPES.includes(type) || !stem) {
      reasons.push((0, import_i18n8.t)("\u9898\u578B\u6216\u9898\u5E72\u7F3A\u5931"));
      continue;
    }
    const src = chunks[Number(q?.source) - 1];
    const quote = String(q?.quote || "").trim();
    if (!src || looseText(quote).length < 6 || !looseText(src.text).includes(looseText(quote))) {
      reasons.push((0, import_i18n8.t)("\u5F15\u6587\u5728\u8D44\u6599\u91CC\u627E\u4E0D\u5230\uFF1A{p0}", { p0: stem.slice(0, 20) }));
      continue;
    }
    const key = looseText(stem);
    if (seen.has(key)) {
      reasons.push((0, import_i18n8.t)("\u91CD\u590D\u9898"));
      continue;
    }
    let options = [];
    let answer = "";
    if (type === "single" || type === "multiple") {
      options = (Array.isArray(q?.options) ? q.options : []).map((o) => String(o ?? "").replace(/^\s*[A-Ha-h][.、．:：)]\s*/, "").trim()).filter(Boolean);
      if (options.length < 3 || options.length > 6) {
        reasons.push((0, import_i18n8.t)("\u9009\u9879\u6570\u91CF\u4E0D\u5BF9\uFF1A{p0}", { p0: stem.slice(0, 20) }));
        continue;
      }
      answer = normalizeChoice(q?.answer, options.length);
      if (type === "single" && answer.length !== 1) {
        reasons.push((0, import_i18n8.t)("\u5355\u9009\u7B54\u6848\u4E0D\u662F\u4E00\u4E2A\u9009\u9879\uFF1A{p0}", { p0: stem.slice(0, 20) }));
        continue;
      }
      if (type === "multiple" && answer.length < 2) {
        reasons.push((0, import_i18n8.t)("\u591A\u9009\u7B54\u6848\u5C11\u4E8E\u4E24\u4E2A\uFF1A{p0}", { p0: stem.slice(0, 20) }));
        continue;
      }
    } else if (type === "judge") {
      answer = normalizeJudge(q?.answer);
      if (!answer) {
        reasons.push((0, import_i18n8.t)("\u5224\u65AD\u9898\u7B54\u6848\u4E0D\u662F\u5BF9 / \u9519\uFF1A{p0}", { p0: stem.slice(0, 20) }));
        continue;
      }
    } else {
      answer = String(q?.answer || "").trim();
      if (!answer) {
        reasons.push((0, import_i18n8.t)("\u7B80\u7B54\u9898\u7F3A\u53C2\u8003\u7B54\u6848\uFF1A{p0}", { p0: stem.slice(0, 20) }));
        continue;
      }
    }
    seen.add(key);
    const points = type === "short" ? Array.isArray(q?.points) ? q.points.map((p) => String(p).trim()).filter(Boolean).slice(0, 6) : [] : [];
    const defScore = type === "short" ? 10 : type === "multiple" ? 3 : 2;
    const score = Math.min(50, Math.max(1, Math.round(Number(q?.score) || defScore)));
    out.push({ type, stem, options, answer, explanation: String(q?.explanation || "").trim().slice(0, 400), sourceTitle: src.title, sourceQuote: quote, points, score });
  }
  return { questions: out, dropped: list.length - out.length, reasons: reasons.slice(0, 20) };
}
var TYPE_WORDS = [[/多选|multiple/i, "multiple"], [/单选|选择|single|choice/i, "single"], [/判断|是非|judge|true/i, "judge"], [/简答|问答|论述|主观|short|essay/i, "short"]];
function typeFromText(s) {
  for (const [re, t] of TYPE_WORDS) if (re.test(String(s || ""))) return t;
  return null;
}
function questionNo(s) {
  const m = /(\d+)/.exec(String(s || ""));
  return m ? String(Number(m[1])) : "";
}
var col = (headers, re) => headers.find((h) => re.test(h)) || "";
function parseKey(table) {
  const h = table.headers;
  const cNo = col(h, /题号|序号|编号|^no\.?$/i);
  const cType = col(h, /题型|类型|type/i);
  const cAns = col(h, /标准答案|参考答案|答案|answer/i);
  const cScore = col(h, /分值|满分|分数|score/i);
  const cPts = col(h, /评分要点|要点|评分标准|points/i);
  const problems = [];
  if (!cNo || !cAns) return { items: [], problems: [(0, import_i18n8.t)("\u6807\u51C6\u7B54\u6848\u8868\u8981\u6709\u300C\u9898\u53F7\u300D\u548C\u300C\u6807\u51C6\u7B54\u6848\u300D\u4E24\u5217")] };
  const items = [];
  table.rows.forEach((r, i) => {
    const no = questionNo(r[cNo]);
    if (!no) {
      problems.push((0, import_i18n8.t)("\u7B2C {n} \u884C\u6CA1\u6709\u9898\u53F7", { n: i + 2 }));
      return;
    }
    let type = cType ? typeFromText(r[cType]) : null;
    const raw = String(r[cAns] ?? "").trim();
    if (!type) type = /^[A-Ha-h]{1}$/.test(raw) ? "single" : /^[A-Ha-h]{2,}$/.test(raw) ? "multiple" : normalizeJudge(raw) ? "judge" : "short";
    const score = Number(String(r[cScore] ?? "").replace(/[^\d.]/g, "")) || (type === "short" ? 10 : 2);
    const answer = type === "single" || type === "multiple" ? normalizeChoice(raw, 8) : type === "judge" ? normalizeJudge(raw) : raw;
    if (!answer) {
      problems.push((0, import_i18n8.t)("\u7B2C {n} \u9898\u6CA1\u6709\u6807\u51C6\u7B54\u6848", { n: no }));
      return;
    }
    const points = cPts ? String(r[cPts] || "").split(/[；;\n]/).map((x) => x.trim()).filter(Boolean) : [];
    if (items.some((x) => x.no === no)) {
      problems.push((0, import_i18n8.t)("\u7B2C {n} \u9898\u91CD\u590D\uFF0C\u53EA\u7559\u7B2C\u4E00\u884C", { n: no }));
      return;
    }
    items.push({ no, type, answer, score, points });
  });
  return { items, problems };
}
function parseAnswers(table, key) {
  const h = table.headers;
  const cId = col(h, /学号|student/i);
  const cName = col(h, /姓名|名字|name/i);
  const problems = [];
  if (!cId) return { sheets: [], problems: [(0, import_i18n8.t)("\u4F5C\u7B54\u8868\u8981\u6709\u300C\u5B66\u53F7\u300D\u5217")] };
  const qCols = /* @__PURE__ */ new Map();
  for (const x of h) {
    if (x === cId || x === cName) continue;
    const no = questionNo(x);
    if (no && key.some((k) => k.no === no) && !qCols.has(no)) qCols.set(no, x);
  }
  const missing = key.filter((k) => !qCols.has(k.no)).map((k) => k.no);
  if (missing.length) problems.push((0, import_i18n8.t)("\u4F5C\u7B54\u8868\u91CC\u627E\u4E0D\u5230\u8FD9\u4E9B\u9898\u7684\u5217\uFF1A{p0}", { p0: missing.join("\u3001") }));
  const sheets = [];
  const seen = /* @__PURE__ */ new Set();
  table.rows.forEach((r, i) => {
    const id = String(r[cId] || "").trim().replace(/\.0$/, "");
    if (!id) {
      problems.push((0, import_i18n8.t)("\u7B2C {n} \u884C\u6CA1\u6709\u5B66\u53F7", { n: i + 2 }));
      return;
    }
    if (seen.has(id)) {
      problems.push((0, import_i18n8.t)("\u5B66\u53F7 {p0} \u91CD\u590D\uFF0C\u53EA\u7559\u7B2C\u4E00\u884C", { p0: id }));
      return;
    }
    seen.add(id);
    const responses = {};
    for (const [no, c] of qCols) responses[no] = String(r[c] ?? "").trim();
    sheets.push({ studentId: id, name: cName ? String(r[cName] || "").trim() : "", responses });
  });
  return { sheets, problems: problems.slice(0, 30) };
}
function gradeObjective(k, response) {
  const resp = k.type === "judge" ? normalizeJudge(response) : normalizeChoice(response, 8);
  const ok = !!resp && resp === k.answer;
  return {
    no: k.no,
    response,
    auto: ok ? k.score : 0,
    final: ok ? k.score : 0,
    max: k.score,
    reason: ok ? (0, import_i18n8.t)("\u4E0E\u6807\u51C6\u7B54\u6848\u4E00\u81F4") : resp ? (0, import_i18n8.t)("\u6807\u51C6\u7B54\u6848 {p0}", { p0: answerLabel(k.type, k.answer) }) : (0, import_i18n8.t)("\u672A\u4F5C\u7B54"),
    by: "rule"
  };
}
function buildShortPrompt(k, responses, stem) {
  return [
    (0, import_i18n8.t)("\u4F60\u662F\u9605\u5377\u8001\u5E08\u3002\u6309\u53C2\u8003\u7B54\u6848\u4E0E\u8BC4\u5206\u8981\u70B9\uFF0C\u7ED9\u4E0B\u9762\u6BCF\u4EFD\u4F5C\u7B54\u6253\u5206\uFF08\u6EE1\u5206 {p0} \u5206\uFF0C\u53EF\u7ED9 0.5 \u5206\uFF09\uFF0C\u5E76\u7528\u4E00\u53E5\u8BDD\u8BF4\u660E\u7406\u7531\u3002", { p0: k.score }),
    stem ? (0, import_i18n8.t)("\u9898\u76EE\uFF1A{p0}", { p0: stem }) : "",
    (0, import_i18n8.t)("\u53C2\u8003\u7B54\u6848\uFF1A{p0}", { p0: k.answer }),
    k.points.length ? (0, import_i18n8.t)("\u8BC4\u5206\u8981\u70B9\uFF1A{p0}", { p0: k.points.join("\uFF1B") }) : "",
    (0, import_i18n8.t)("\u7528 JSON \u8FD4\u56DE\uFF1A{p0}", { p0: '{"scores":[{"i":1,"score":0,"reason":"..."}]}' }),
    (0, import_i18n8.t)("\u7A7A\u767D\u6216\u4E0E\u9898\u76EE\u65E0\u5173\u7684\u4F5C\u7B54\u7ED9 0 \u5206\u3002\u53EA\u6309\u4F5C\u7B54\u5185\u5BB9\u8BC4\u5206\uFF0C\u4E0D\u8981\u56E0\u4E3A\u5B57\u6570\u591A\u5C11\u52A0\u51CF\u5206\u3002"),
    "",
    (0, import_i18n8.t)("=== \u5B66\u751F\u4F5C\u7B54\uFF08\u5DF2\u533F\u540D\u7F16\u53F7\uFF09 ==="),
    ...responses.map((r) => `#${r.i}: ${r.text || (0, import_i18n8.t)("\uFF08\u7A7A\u767D\uFF09")}`)
  ].filter(Boolean).join("\n");
}
function clampScore(v, max) {
  const n = Number(v);
  if (!Number.isFinite(n)) return null;
  return Math.min(max, Math.max(0, Math.round(n * 2) / 2));
}
function rowTotal(items) {
  return Math.round(items.reduce((s, x) => s + (x.final ?? 0), 0) * 10) / 10;
}
function newRow(sheet, key) {
  const items = key.map((k) => k.type === "short" ? { no: k.no, response: sheet.responses[k.no] || "", auto: null, final: null, max: k.score, reason: "", by: "pending" } : gradeObjective(k, sheet.responses[k.no] || ""));
  return { studentId: sheet.studentId, name: sheet.name, items, total: rowTotal(items), confirmed: false };
}

// ../../../totalclaw-solutions/solutions/workbench-campus-ai/src/main/services/campusAi/research.ts
var import_i18n9 = require("npm:@totalclaw/i18n");
var pick = (headers, res) => {
  for (const re of res) {
    const h = headers.find((x) => re.test(x));
    if (h) return h;
  }
  return "";
};
function parseOutputs(table) {
  const h = table.headers;
  const cTitle = pick(h, [/成果名称|项目名称|论文题目|题目|名称|title/i]);
  const cType = pick(h, [/成果类型|类型|类别|type/i]);
  const cCollege = pick(h, [/学院|二级学院|单位|部门|系部|college/i]);
  const cOwner = pick(h, [/负责人|第一作者|作者|主持人|发明人|owner|author/i]);
  const cYear = pick(h, [/年度|年份|立项年|发表年|日期|时间|year|date/i]);
  const cLevel = pick(h, [/级别|等级|层次|level/i]);
  const cFund = pick(h, [/经费|金额|资助|到账|funding|amount/i]);
  if (!cTitle) return { rows: [], skipped: 0, problems: [(0, import_i18n9.t)("\u6210\u679C\u8868\u8981\u6709\u300C\u6210\u679C\u540D\u79F0\u300D\uFF08\u6216\u9879\u76EE\u540D\u79F0\u3001\u8BBA\u6587\u9898\u76EE\uFF09\u5217")] };
  const problems = [];
  if (!cType) problems.push((0, import_i18n9.t)("\u6CA1\u6709\u300C\u7C7B\u578B\u300D\u5217\uFF1A\u5168\u90E8\u6309\u300C\u672A\u5206\u7C7B\u300D\u7EDF\u8BA1"));
  if (!cCollege) problems.push((0, import_i18n9.t)("\u6CA1\u6709\u300C\u5B66\u9662\u300D\u5217\uFF1A\u5168\u90E8\u6309\u300C\u672A\u586B\u5B66\u9662\u300D\u7EDF\u8BA1"));
  if (!cYear) problems.push((0, import_i18n9.t)("\u6CA1\u6709\u5E74\u4EFD / \u65E5\u671F\u5217\uFF1A\u5168\u90E8\u6309\u300C\u672A\u586B\u5E74\u4EFD\u300D\u7EDF\u8BA1"));
  const rows = [];
  let skipped = 0;
  for (const r of table.rows) {
    const title = String(r[cTitle] || "").trim();
    if (!title) {
      skipped++;
      continue;
    }
    const yearRaw = cYear ? String(r[cYear] || "") : "";
    const ym = /(19|20)\d{2}/.exec(yearRaw);
    const fund = cFund ? Number(String(r[cFund] ?? "").replace(/[,，\s万元¥￥]/g, "")) : 0;
    rows.push({
      title,
      type: cType && String(r[cType] || "").trim() || (0, import_i18n9.t)("\u672A\u5206\u7C7B"),
      college: cCollege && String(r[cCollege] || "").trim() || (0, import_i18n9.t)("\u672A\u586B\u5B66\u9662"),
      owner: cOwner ? String(r[cOwner] || "").trim() : "",
      year: ym ? ym[0] : (0, import_i18n9.t)("\u672A\u586B\u5E74\u4EFD"),
      level: cLevel && String(r[cLevel] || "").trim() || (0, import_i18n9.t)("\u672A\u586B\u7EA7\u522B"),
      funding: Number.isFinite(fund) && fund > 0 ? Math.round(fund * 100) / 100 : 0
    });
  }
  if (cFund) problems.push((0, import_i18n9.t)("\u7ECF\u8D39\u6309\u8868\u91CC\u7684\u6570\u539F\u6837\u76F8\u52A0\uFF0C\u5355\u4F4D\u4EE5\u539F\u8868\u4E3A\u51C6"));
  return { rows, skipped, problems };
}
function group(rows, key) {
  const m = /* @__PURE__ */ new Map();
  for (const r of rows) {
    const k = key(r);
    const g = m.get(k) || { key: k, count: 0, funding: 0 };
    g.count++;
    g.funding = Math.round((g.funding + r.funding) * 100) / 100;
    m.set(k, g);
  }
  return [...m.values()];
}
function researchStats(rows) {
  const byYear = group(rows, (r) => r.year).sort((a, b) => a.key.localeCompare(b.key));
  const byType = group(rows, (r) => r.type).sort((a, b) => b.count - a.count);
  const byCollege = group(rows, (r) => r.college).sort((a, b) => b.count - a.count);
  const byLevel = group(rows, (r) => r.level).sort((a, b) => b.count - a.count);
  const colleges = byCollege.map((x) => x.key);
  const types = byType.map((x) => x.key);
  const cells = colleges.map((c) => types.map((t) => rows.filter((r) => r.college === c && r.type === t).length));
  return {
    total: rows.length,
    funding: Math.round(rows.reduce((s, r) => s + r.funding, 0) * 100) / 100,
    byYear,
    byType,
    byCollege,
    byLevel,
    matrix: { rows: colleges, cols: types, cells }
  };
}
var GUIDE_PART = 9e3;
function buildGuidePrompt(part, index, total) {
  return [
    (0, import_i18n9.t)("\u4E0B\u9762\u662F\u4E00\u4EFD\u79D1\u7814\u9879\u76EE\u7533\u62A5\u6307\u5357\u7684\u539F\u6587\uFF08\u7B2C {a}/{b} \u90E8\u5206\uFF09\u3002\u8BF7\u5E2E\u79D1\u7814\u5904\u8001\u5E08\u628A\u8981\u70B9\u62BD\u51FA\u6765\u3002", { a: index + 1, b: total }),
    (0, import_i18n9.t)("\u7528 JSON \u8FD4\u56DE\uFF1A{p0}", { p0: '{"title":"...","deadlines":[{"text":"...","date":"YYYY-MM-DD","quote":"..."}],"eligibility":[{"text":"...","quote":"..."}],"materials":[{"text":"...","quote":"..."}],"funding":[{"text":"...","quote":"..."}],"contacts":[{"text":"...","quote":"..."}]}' }),
    (0, import_i18n9.t)("deadlines\uFF1A\u5404\u7C7B\u622A\u6B62\u65F6\u95F4\u4E0E\u65F6\u95F4\u8282\u70B9\uFF1Beligibility\uFF1A\u7533\u62A5\u6761\u4EF6\u4E0E\u9650\u5236\uFF1Bmaterials\uFF1A\u8981\u63D0\u4EA4\u7684\u6750\u6599\uFF1Bfunding\uFF1A\u8D44\u52A9\u989D\u5EA6\u4E0E\u7ECF\u8D39\u8981\u6C42\uFF1Bcontacts\uFF1A\u8054\u7CFB\u4EBA\u4E0E\u8054\u7CFB\u65B9\u5F0F\u3002"),
    (0, import_i18n9.t)("\u6BCF\u6761\u90FD\u5FC5\u987B\u5E26 quote\uFF1A\u4ECE\u539F\u6587\u9010\u5B57\u6458\u5F55\u7684\u4E00\u53E5\uFF08\u4E0D\u6539\u5B57\uFF09\uFF1B\u539F\u6587\u6CA1\u5199\u7684\u4E0D\u8981\u5199\u3002text \u7528\u4E00\u53E5\u8BDD\u6982\u62EC\uFF0C\u4E0D\u8981\u52A0\u539F\u6587\u6CA1\u6709\u7684\u6570\u5B57\u3002"),
    "",
    (0, import_i18n9.t)("=== \u6307\u5357\u539F\u6587 ==="),
    part
  ].join("\n");
}
function splitGuide(text) {
  const t = String(text || "");
  if (t.length <= GUIDE_PART) return [t];
  const parts = [];
  for (let i = 0; i < t.length && parts.length < 4; i += GUIDE_PART) parts.push(t.slice(i, i + GUIDE_PART));
  return parts;
}
var GUIDE_SECTIONS = ["deadlines", "eligibility", "materials", "funding", "contacts"];
function verifyGuide(parts, fullText) {
  const hay = looseText(fullText);
  const sections = Object.fromEntries(GUIDE_SECTIONS.map((k) => [k, []]));
  let dropped = 0;
  let title = "";
  const seen = /* @__PURE__ */ new Set();
  for (const p of parts) {
    if (!title && p?.title) title = String(p.title).trim().slice(0, 120);
    for (const k of GUIDE_SECTIONS) {
      for (const it of Array.isArray(p?.[k]) ? p[k] : []) {
        const quote = String(it?.quote || "").trim();
        const text = String(it?.text || "").trim();
        const q = looseText(quote);
        if (!text || q.length < 4 || !hay.includes(q)) {
          dropped++;
          continue;
        }
        if (seen.has(`${k}:${q}`)) continue;
        seen.add(`${k}:${q}`);
        const date = /^\d{4}-\d{2}-\d{2}$/.test(String(it?.date || "")) ? String(it.date) : void 0;
        sections[k].push({ text: text.slice(0, 300), quote: quote.slice(0, 300), date, verified: true });
      }
    }
  }
  sections.deadlines.sort((a, b) => (a.date || "9999").localeCompare(b.date || "9999"));
  return { title, sections, dropped };
}

// ../../../totalclaw-solutions/solutions/workbench-campus-ai/src/main/services/campusAi/governance.ts
var import_i18n10 = require("npm:@totalclaw/i18n");
var import_textAnalysis2 = require("host:apps/desktop-shell/src/main/services/knowledgeBase/textAnalysis.ts");
function docKindLabel(k) {
  return { notice: (0, import_i18n10.t)("\u901A\u77E5"), request: (0, import_i18n10.t)("\u8BF7\u793A"), report: (0, import_i18n10.t)("\u62A5\u544A"), letter: (0, import_i18n10.t)("\u51FD"), minutes: (0, import_i18n10.t)("\u4F1A\u8BAE\u7EAA\u8981") }[k];
}
function cleanDocBody(body, title, recipients, issuer) {
  const norm2 = (x) => String(x || "").replace(/[\s：:，,。]/g, "");
  const lines = String(body || "").replace(/\r/g, "").split("\n");
  const isHead = (l) => {
    const n = norm2(l);
    return !!n && (n === norm2(title) || recipients && n === norm2(recipients));
  };
  const isTail = (l) => {
    const n = norm2(l);
    return !!n && (n === norm2(issuer) || /^\d{4}年\d{1,2}月\d{1,2}日$/.test(n));
  };
  let start = 0;
  while (start < Math.min(lines.length, 4) && (!lines[start].trim() || isHead(lines[start]))) start++;
  let end = lines.length;
  while (end > start && lines.length - end < 4 && (!lines[end - 1].trim() || isTail(lines[end - 1]))) end--;
  return lines.slice(start, end).join("\n").trim();
}
function docUnverifiedNumbers(body, points, title) {
  const half = (s) => String(s || "").replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 65248));
  const nums = (s) => half(s).split("\n").map((l) => l.replace(/^\s*\d+\s*[.、．)）]\s*/, "")).join("\n").match(/\d+(?:\.\d+)?/g) || [];
  const hay = new Set(nums(`${points}
${title}`));
  return [...new Set(nums(body).filter((n) => !hay.has(n)))];
}
var AUTO = /* @__PURE__ */ new Set(["faq", "answer", "quote"]);
var NEGATIVE = /投诉|不满|太差|没人管|没人回|多次反映|一直没|拖了|乱收费|欺负|不公平|很差|差评/;
function hotspotReport(qa, tickets, from, to, now = /* @__PURE__ */ new Date()) {
  const span = to.getTime() - from.getTime();
  const inRange = (iso, a, b) => {
    const t = Date.parse(iso);
    return t >= a && t < b;
  };
  const cur = qa.filter((r) => !r.courseId && inRange(r.at, from.getTime(), to.getTime()));
  const prev = qa.filter((r) => !r.courseId && inRange(r.at, from.getTime() - span, from.getTime()));
  const auto = cur.filter((r) => AUTO.has(r.kind)).length;
  const byDomain = listDomains().map((d) => ({
    id: d.id,
    name: d.name,
    count: cur.filter((r) => (r.domain || classifyDomain(r.question)) === d.id).length,
    noEvidence: cur.filter((r) => (r.domain || classifyDomain(r.question)) === d.id && r.kind === "no_evidence").length,
    prev: prev.filter((r) => (r.domain || classifyDomain(r.question)) === d.id).length
  })).filter((d) => d.count || d.prev).sort((a, b) => b.count - a.count);
  const tks = tickets.filter((t) => inRange(t.at, from.getTime(), to.getTime()));
  const depts = [...new Set(tks.map((t) => t.dept))];
  const byDept = depts.map((dept) => {
    const list = tks.filter((t) => t.dept === dept);
    const answered = list.filter((t) => t.answeredAt);
    const hours = answered.map((t) => (Date.parse(t.answeredAt) - Date.parse(t.at)) / 36e5).filter((h) => h >= 0);
    return {
      dept,
      open: list.filter((t) => t.status === "open").length,
      answered: answered.length,
      avgHours: hours.length ? Math.round(hours.reduce((s, h) => s + h, 0) / hours.length * 10) / 10 : null,
      overdue: list.filter((t) => t.status === "open" && now.getTime() - Date.parse(t.at) > 48 * 36e5).length
    };
  }).sort((a, b) => b.open - a.open || b.overdue - a.overdue);
  const df = /* @__PURE__ */ new Map();
  for (const r of cur) {
    if (r.kind === "sensitive") continue;
    for (const { term } of (0, import_textAnalysis2.extractKeywords)(r.question, 6)) df.set(term, (df.get(term) || 0) + 1);
  }
  const keywords = [...df.entries()].filter(([, n]) => n >= 2).sort((a, b) => b[1] - a[1]).slice(0, 20).map(([term, count]) => ({ term, count }));
  const clusters = [];
  for (const r of cur.filter((x) => x.kind === "no_evidence")) {
    const hit = clusters.find((c) => questionSimilarity(c.question, r.question) >= 0.5);
    if (hit) hit.count++;
    else clusters.push({ question: r.question, count: 1, domain: domainOf(r.domain || classifyDomain(r.question)).name });
  }
  const gaps = clusters.sort((a, b) => b.count - a.count).slice(0, 15);
  return {
    from: from.toISOString(),
    to: to.toISOString(),
    total: cur.length,
    prevTotal: prev.length,
    autoRate: cur.length ? Math.round(auto / cur.length * 1e3) / 1e3 : null,
    byDomain,
    byDept,
    keywords,
    gaps,
    sensitive: cur.filter((r) => r.kind === "sensitive").length,
    negative: cur.filter((r) => NEGATIVE.test(r.question)).length
  };
}
var pct = (r) => r === null ? "\u2014" : `${Math.round(r * 1e3) / 10}%`;
function hotspotFacts(r) {
  const f = [
    (0, import_i18n10.t)("\u672C\u671F\u95EE\u7B54 {a} \u6B21\uFF0C\u4E0A\u671F {b} \u6B21\uFF1B\u81EA\u52A8\u7B54\u590D\u7387 {c}", { a: r.total, b: r.prevTotal, c: pct(r.autoRate) }),
    ...r.byDomain.slice(0, 6).map((d) => (0, import_i18n10.t)("{p0}\uFF1A{a} \u6B21\uFF08\u4E0A\u671F {b}\uFF09\uFF0C\u5176\u4E2D\u65E0\u4F9D\u636E {c} \u6B21", { p0: d.name, a: d.count, b: d.prev, c: d.noEvidence })),
    ...r.byDept.slice(0, 6).map((d) => (0, import_i18n10.t)("{p0}\uFF1A\u5F85\u7B54\u590D {a}\uFF0C\u5DF2\u7B54\u590D {b}\uFF0C\u8D85\u8FC7 48 \u5C0F\u65F6\u672A\u7B54\u590D {c}", { p0: d.dept, a: d.open, b: d.answered, c: d.overdue })),
    ...r.gaps.slice(0, 5).map((g) => (0, import_i18n10.t)("\u77E5\u8BC6\u7F3A\u53E3\uFF1A\u300C{p0}\u300D\u88AB\u95EE {n} \u6B21", { p0: g.question, n: g.count }))
  ];
  if (r.sensitive) f.push((0, import_i18n10.t)("\u654F\u611F\u95EE\u9898 {n} \u6B21", { n: r.sensitive }));
  if (r.negative) f.push((0, import_i18n10.t)("\u5E26\u4E0D\u6EE1\u60C5\u7EEA\u7684\u95EE\u9898 {n} \u6B21", { n: r.negative }));
  return f;
}
function hotspotTemplate(r) {
  const top = r.byDomain[0];
  const lines = [(0, import_i18n10.t)("\u672C\u671F\u5E08\u751F\u5171\u63D0\u95EE {a} \u6B21\uFF08\u4E0A\u671F {b} \u6B21\uFF09\uFF0C\u81EA\u52A8\u7B54\u590D\u7387 {c}\u3002", { a: r.total, b: r.prevTotal, c: pct(r.autoRate) })];
  if (top) lines.push((0, import_i18n10.t)("\u8BC9\u6C42\u6700\u96C6\u4E2D\u7684\u662F{p0}\uFF0C\u5171 {n} \u6B21\u3002", { p0: top.name, n: top.count }));
  const lagging = r.byDept.filter((d) => d.overdue > 0);
  if (lagging.length) lines.push((0, import_i18n10.t)("\u6709\u8D85\u8FC7 48 \u5C0F\u65F6\u672A\u7B54\u590D\u8F6C\u529E\u7684\u90E8\u95E8\uFF1A{p0}\uFF0C\u8BF7\u7763\u4FC3\u7B54\u590D\u3002", { p0: lagging.map((d) => `${d.dept} ${d.overdue}`).join("\u3001") }));
  if (r.gaps.length) lines.push((0, import_i18n10.t)("\u77E5\u8BC6\u5E93\u7F3A\u53E3 {n} \u7C7B\uFF0C\u5EFA\u8BAE\u76F8\u5173\u90E8\u95E8\u8865\u5145\u8D44\u6599\u6216 FAQ\uFF1A{p0}\u3002", { n: r.gaps.length, p0: r.gaps.slice(0, 3).map((g) => `\u300C${g.question}\u300D`).join("\u3001") }));
  if (r.sensitive) lines.push((0, import_i18n10.t)("\u672C\u671F\u6709 {n} \u6B21\u654F\u611F\u95EE\u9898\uFF0C\u8BF7\u5B66\u5DE5\u5904\u786E\u8BA4\u5DF2\u5168\u90E8\u8DDF\u8FDB\u3002", { n: r.sensitive }));
  return lines.join("\n");
}
function buildHotspotPrompt(facts, school) {
  return [
    (0, import_i18n10.t)("\u4F60\u662F{p0}\u515A\u653F\u529E\u7684\u5206\u6790\u5458\u3002\u6839\u636E\u4E0B\u9762\u5DF2\u7EDF\u8BA1\u597D\u7684\u5E08\u751F\u8BC9\u6C42\u6570\u636E\uFF0C\u5199\u4E00\u6BB5 150\uFF5E250 \u5B57\u7684\u5468\u62A5\u5C0F\u7ED3\uFF0C\u6307\u51FA\u70ED\u70B9\u3001\u54CD\u5E94\u6162\u7684\u90E8\u95E8\u548C\u9700\u8981\u8865\u5145\u7684\u77E5\u8BC6\uFF0C\u5E76\u7ED9\u51FA 2\uFF5E3 \u6761\u6539\u8FDB\u5EFA\u8BAE\u3002", { p0: school }),
    (0, import_i18n10.t)("\u53EA\u80FD\u4F7F\u7528\u4E0B\u9762\u4E8B\u5B9E\u91CC\u7684\u6570\u5B57\uFF0C\u4E0D\u8981\u8BA1\u7B97\u65B0\u7684\u6570\u5B57\u3001\u4E0D\u8981\u5199\u4E8B\u5B9E\u91CC\u6CA1\u6709\u7684\u6570\u5B57\u3002\u7528\u7EAF\u6587\u672C\u8F93\u51FA\u3002"),
    "",
    (0, import_i18n10.t)("=== \u7EDF\u8BA1\u4E8B\u5B9E ==="),
    ...facts
  ].join("\n");
}

// ../../../totalclaw-solutions/solutions/workbench-campus-ai/src/main/services/campusAi/govDocx.ts
var import_adm_zip = __toESM(require("npm:adm-zip"));
var xml = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
var FONT_TITLE = "\u65B9\u6B63\u5C0F\u6807\u5B8B\u7B80\u4F53";
var FONT_BODY = "\u4EFF\u5B8B_GB2312";
var FONT_HEI = "\u9ED1\u4F53";
var FONT_KAI = "\u6977\u4F53_GB2312";
function run(text, r = {}) {
  const f = r.font || FONT_BODY;
  const props = `<w:rFonts w:ascii="${f}" w:hAnsi="${f}" w:eastAsia="${f}"/>${r.bold ? "<w:b/>" : ""}${r.color ? `<w:color w:val="${r.color}"/>` : ""}<w:sz w:val="${r.size || 32}"/><w:szCs w:val="${r.size || 32}"/>`;
  return `<w:r><w:rPr>${props}</w:rPr><w:t xml:space="preserve">${xml(text)}</w:t></w:r>`;
}
function para(runs, p = {}) {
  const border = p.border === "bottom-red" ? '<w:pBdr><w:bottom w:val="single" w:sz="12" w:space="6" w:color="E00000"/></w:pBdr>' : p.border === "top" ? '<w:pBdr><w:top w:val="single" w:sz="6" w:space="4" w:color="000000"/></w:pBdr>' : p.border === "bottom" ? '<w:pBdr><w:bottom w:val="single" w:sz="6" w:space="4" w:color="000000"/></w:pBdr>' : "";
  const ind = p.indent ? '<w:ind w:firstLineChars="200" w:firstLine="640"/>' : p.rightChars ? `<w:ind w:rightChars="${p.rightChars * 100}" w:right="${p.rightChars * 320}"/>` : "";
  return `<w:p><w:pPr>${border}<w:spacing w:before="${p.before ?? 0}" w:after="${p.after ?? 0}" w:line="${p.line ?? 560}" w:lineRule="exact"/>${ind}<w:jc w:val="${p.align || "both"}"/></w:pPr>${runs}</w:p>`;
}
var KIND_HEAD = { notice: "\u6587\u4EF6", request: "\u6587\u4EF6", report: "\u6587\u4EF6", letter: "", minutes: "\u4F1A\u8BAE\u7EAA\u8981" };
function cnDate(iso) {
  const m = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(String(iso || ""));
  if (!m) return String(iso || "");
  return `${m[1]}\u5E74${Number(m[2])}\u6708${Number(m[3])}\u65E5`;
}
function bodyParas(body) {
  return String(body || "").replace(/\r/g, "").split("\n").map((l) => l.trim()).filter(Boolean).map((line) => {
    if (/^[一二三四五六七八九十]+、/.test(line)) return para(run(line, { font: FONT_HEI }), { indent: true });
    if (/^（[一二三四五六七八九十]+）/.test(line)) return para(run(line, { font: FONT_KAI }), { indent: true });
    return para(run(line), { indent: true });
  }).join("");
}
function buildOfficialDocx(d) {
  const blocks = [];
  const head = `${d.issuer}${KIND_HEAD[d.kind] || ""}`;
  blocks.push(para(run(head, { font: FONT_TITLE, size: d.kind === "letter" ? 56 : 72, color: "E00000" }), { align: "center", line: 1100, before: 200 }));
  blocks.push(para(d.docNo ? run(d.docNo) : "", { align: "center", border: "bottom-red", after: 360 }));
  blocks.push(para(run(d.title, { font: FONT_TITLE, size: 44 }), { align: "center", line: 700, before: 240, after: 240 }));
  if (d.recipients) blocks.push(para(run(`${d.recipients}\uFF1A`), {}));
  blocks.push(bodyParas(d.body));
  const atts = String(d.attachments || "").split(/\n|；|;/).map((x) => x.trim()).filter(Boolean);
  if (atts.length) {
    blocks.push(para("", {}));
    atts.forEach((a, i) => blocks.push(para(run(i === 0 ? `\u9644\u4EF6\uFF1A${atts.length > 1 ? "1\uFF0E" : ""}${a}` : `\u3000\u3000\u3000${i + 1}\uFF0E${a}`), { indent: true })));
  }
  blocks.push(para("", {}));
  blocks.push(para("", {}));
  blocks.push(para(run(d.issuer), { align: "right", rightChars: 4 }));
  blocks.push(para(run(cnDate(d.date)), { align: "right", rightChars: 4 }));
  blocks.push(para("", {}));
  blocks.push(para(run(`${d.issuer}\u3000\u3000\u3000\u3000\u3000\u3000\u3000\u3000\u3000${cnDate(d.date)}\u5370\u53D1`, { size: 28 }), { border: "top", align: "both" }));
  blocks.push(para("", { border: "bottom" }));
  const sectPr = '<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="2098" w:right="1474" w:bottom="1984" w:left="1588" w:header="851" w:footer="992"/></w:sectPr>';
  const zip = new import_adm_zip.default();
  zip.addFile("[Content_Types].xml", Buffer.from('<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>'));
  zip.addFile("_rels/.rels", Buffer.from('<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>'));
  zip.addFile("word/document.xml", Buffer.from(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><w:body>${blocks.join("")}${sectPr}</w:body></w:document>`));
  return zip.toBuffer();
}
var KIND_NAME = { notice: "\u901A\u77E5", request: "\u8BF7\u793A", report: "\u62A5\u544A", letter: "\u51FD", minutes: "\u4F1A\u8BAE\u7EAA\u8981" };
function buildDocPrompt(input) {
  const ending = {
    notice: "\u901A\u77E5\u7ED3\u5C3E\u5199\u300C\u7279\u6B64\u901A\u77E5\u3002\u300D",
    request: "\u8BF7\u793A\u8981\u4E00\u6587\u4E00\u4E8B\uFF0C\u7ED3\u5C3E\u5199\u300C\u59A5\u5426\uFF0C\u8BF7\u6279\u793A\u3002\u300D",
    report: "\u62A5\u544A\u4E0D\u5F97\u5939\u5E26\u8BF7\u793A\u4E8B\u9879\uFF0C\u7ED3\u5C3E\u5199\u300C\u7279\u6B64\u62A5\u544A\u3002\u300D",
    letter: "\u51FD\u7684\u7ED3\u5C3E\u5199\u300C\u7279\u6B64\u51FD\u544A\u3002\u300D\u6216\u300C\u8BF7\u4E88\u51FD\u590D\u3002\u300D",
    minutes: "\u7EAA\u8981\u6309\u300C\u4F1A\u8BAE\u6982\u51B5\u2014\u8BAE\u5B9A\u4E8B\u9879\u300D\u7EC4\u7EC7\uFF0C\u8BAE\u5B9A\u4E8B\u9879\u9010\u6761\u5199\u660E\u8D23\u4EFB\u90E8\u95E8\u3002"
  };
  return [
    `\u4F60\u662F${input.school}\u515A\u653F\u529E\u7684\u516C\u6587\u5199\u4F5C\u52A9\u624B\u3002\u8BF7\u6309\u515A\u653F\u673A\u5173\u516C\u6587\u7684\u5199\u6CD5\u8D77\u8349\u4E00\u4EFD\u300C${KIND_NAME[input.kind]}\u300D\u7684\u6B63\u6587\u3002`,
    `\u53D1\u6587\u673A\u5173\uFF1A${input.issuer}\uFF1B\u6807\u9898\uFF1A${input.title}\uFF1B\u4E3B\u9001\u673A\u5173\uFF1A${input.recipients || "\u65E0"}\u3002`,
    "\u53EA\u5199\u6B63\u6587\uFF1A\u4E0D\u8981\u5199\u6807\u9898\u3001\u4E3B\u9001\u673A\u5173\u3001\u7F72\u540D\u548C\u65E5\u671F\uFF1B\u5C42\u6B21\u7528\u300C\u4E00\u3001\u300D\u300C\uFF08\u4E00\uFF09\u300D\u300C1.\u300D\uFF1B\u8BED\u8A00\u5E84\u91CD\u3001\u7B80\u6D01\uFF0C\u4E0D\u7528\u53E3\u8BED\u3002",
    ending[input.kind],
    "\u53EA\u80FD\u4F7F\u7528\u4E0B\u9762\u8981\u70B9\u91CC\u7ED9\u51FA\u7684\u4E8B\u5B9E\u3001\u65F6\u95F4\u3001\u6570\u5B57\u548C\u540D\u79F0\uFF0C\u4E0D\u8981\u8865\u5145\u8981\u70B9\u91CC\u6CA1\u6709\u7684\u5185\u5BB9\u3002",
    "\u7528\u7EAF\u6587\u672C\u8F93\u51FA\uFF0C\u4E0D\u8981 Markdown\u3002",
    "",
    "=== \u8981\u70B9 ===",
    input.points
  ].join("\n");
}

// ../../../totalclaw-solutions/solutions/workbench-campus-ai/src/main/ipc/campusAi.modules.ts
var stamp = () => {
  const d = /* @__PURE__ */ new Date();
  const p2 = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${p2(d.getMonth() + 1)}${p2(d.getDate())}-${p2(d.getHours())}${p2(d.getMinutes())}`;
};
function moduleState(ctx) {
  const s = ctx.store.read();
  const outputs = ctx.store.outputs();
  return {
    scenarios: listScenarios(s.scenarios, ctx.store.auditList(5e3)),
    domains: listDomains(),
    courses: s.courses,
    gradings: ctx.store.gradings().map((g) => ({
      id: g.id,
      title: g.title,
      courseId: g.courseId,
      createdAt: g.createdAt,
      gradedAt: g.gradedAt,
      exportedAt: g.exportedAt,
      exportPath: g.exportPath,
      students: g.rows.length,
      confirmed: g.rows.filter((r) => r.confirmed).length
    })),
    research: { outputsFile: s.research.outputsFile, outputs: outputs.length, skipped: s.research.skipped, stats: outputs.length ? researchStats(outputs) : null, guides: s.research.guides },
    officialDocs: s.officialDocs
  };
}
function moduleActions(ctx) {
  const { store: store2, svc } = ctx;
  const course = (id) => {
    const c = store2.read().courses.find((x) => x.id === id);
    if (!c) throw new Error((0, import_i18n11.t)("\u8BFE\u7A0B\u4E0D\u5B58\u5728\u6216\u5DF2\u5220\u9664"));
    return c;
  };
  const grading = (id) => {
    const g = store2.gradings().find((x) => x.id === id);
    if (!g) throw new Error((0, import_i18n11.t)("\u6279\u6539\u4EFB\u52A1\u4E0D\u5B58\u5728\u6216\u5DF2\u5220\u9664"));
    return g;
  };
  const saveGrading = (g) => {
    store2.setList("gradings", store2.gradings().map((x) => x.id === g.id ? g : x));
  };
  async function suggestShort(g) {
    let suggested = 0;
    let failed = 0;
    for (const k of g.key.filter((x) => x.type === "short")) {
      const pending = g.rows.map((r, idx) => ({ r, idx, item: r.items.find((i) => i.no === k.no) })).filter((x) => x.item && x.item.by !== "teacher");
      for (let i = 0; i < pending.length; i += 20) {
        const batch = pending.slice(i, i + 20);
        ctx.progress((0, import_i18n11.t)("\u7B2C {no} \u9898\uFF1A\u6B63\u5728\u6279\u6539 {a}/{b}", { no: k.no, a: Math.min(i + 20, pending.length), b: pending.length }), { scope: "grade" });
        const blank = batch.filter((x) => !x.item.response.trim());
        for (const x of blank) Object.assign(x.item, { auto: 0, final: 0, reason: (0, import_i18n11.t)("\u672A\u4F5C\u7B54"), by: "rule" });
        const ask = batch.filter((x) => x.item.response.trim());
        if (!ask.length) continue;
        try {
          const { json } = await ctx.llmJson("grade", buildShortPrompt(k, ask.map((x, j) => ({ i: j + 1, text: x.item.response.slice(0, 1200) })), k.stem), 15e4);
          const scores = Array.isArray(json?.scores) ? json.scores : [];
          ask.forEach((x, j) => {
            const hit = scores.find((s) => Number(s?.i) === j + 1);
            const sc = hit ? clampScore(hit.score, k.score) : null;
            if (sc === null) {
              failed++;
              Object.assign(x.item, { auto: null, final: null, reason: (0, import_i18n11.t)("\u6A21\u578B\u6CA1\u6709\u7ED9\u51FA\u5206\u6570\uFF0C\u8BF7\u6559\u5E08\u8BC4\u5206"), by: "pending" });
              return;
            }
            suggested++;
            Object.assign(x.item, { auto: sc, final: sc, reason: String(hit.reason || "").slice(0, 200), by: "model" });
          });
        } catch (e) {
          failed += ask.length;
          for (const x of ask) Object.assign(x.item, { reason: (0, import_i18n11.t)("\u6A21\u578B\u8C03\u7528\u5931\u8D25\uFF1A{p0}\uFF0C\u8BF7\u6559\u5E08\u8BC4\u5206", { p0: String(e?.message || e).slice(0, 80) }), by: "pending" });
        }
        for (const x of batch) {
          x.r.total = rowTotal(x.r.items);
        }
        saveGrading(g);
        ctx.pushState();
      }
    }
    ctx.progress("", { scope: "grade" });
    return { suggested, failed };
  }
  return {
    // ── AI 应用中心 ──
    "apps.save": (p) => {
      const input = p?.input;
      if (p?.builtin && input?.id) {
        store2.update((s) => {
          s.scenarios.overrides[input.id] = { stage: input.stage, dept: String(input.dept || "").trim() || void 0, note: String(input.note || "").trim() || void 0 };
        });
      } else {
        const n = normalizeScenarioInput(input);
        store2.update((s) => {
          const cur = n.id ? s.scenarios.custom.find((c) => c.id === n.id) : void 0;
          if (cur) Object.assign(cur, n);
          else s.scenarios.custom.push({ id: newId("cas"), direction: n.direction, name: n.name, desc: n.desc || "", dept: n.dept || "", stage: n.stage, note: n.note });
        });
      }
      svc.audit("apps", "save", true);
      ctx.pushState();
      return true;
    },
    "apps.remove": (p) => {
      store2.update((s) => {
        s.scenarios.custom = s.scenarios.custom.filter((c) => c.id !== p.id);
      });
      ctx.pushState();
      return true;
    },
    "apps.export": () => {
      const list = listScenarios(store2.read().scenarios, store2.auditList(5e3));
      const stageLabel = (x) => ({ planned: (0, import_i18n11.t)("\u89C4\u5212\u4E2D"), building: (0, import_i18n11.t)("\u5EFA\u8BBE\u4E2D"), live: (0, import_i18n11.t)("\u5DF2\u4E0A\u7EBF") })[x] || x;
      const file = (0, import_node_path6.join)(ctx.outputDir((0, import_i18n11.t)("AI\u5E94\u7528\u4E2D\u5FC3")), (0, import_i18n11.t)("AI\u5E94\u7528\u5EFA\u8BBE\u53F0\u8D26-{p0}.xlsx", { p0: stamp() }));
      (0, import_excel4.writeWorkbook)(file, [{
        name: (0, import_i18n11.t)("\u5EFA\u8BBE\u53F0\u8D26"),
        headers: [(0, import_i18n11.t)("\u65B9\u5411"), (0, import_i18n11.t)("\u573A\u666F"), (0, import_i18n11.t)("\u8BF4\u660E"), (0, import_i18n11.t)("\u8D23\u4EFB\u90E8\u95E8"), (0, import_i18n11.t)("\u9636\u6BB5"), (0, import_i18n11.t)("\u8FD1 30 \u5929\u8C03\u7528"), (0, import_i18n11.t)("\u5907\u6CE8")],
        rows: list.map((x) => [directionLabel(x.direction), x.name, x.desc, x.dept, stageLabel(x.stage), x.usage30d, x.note || ""])
      }]);
      return file;
    },
    // ── 教学：课程 ──
    "course.save": (p) => {
      const name = String(p?.input?.name || "").trim().slice(0, 40);
      if (!name) throw new Error((0, import_i18n11.t)("\u8BF7\u586B\u5199\u8BFE\u7A0B\u540D\u79F0"));
      const r = store2.update((s) => {
        const cur = p.input.id ? s.courses.find((c2) => c2.id === p.input.id) : void 0;
        if (cur) {
          Object.assign(cur, { name, teacher: String(p.input.teacher || "").trim().slice(0, 30), publicTutor: !!p.input.publicTutor });
          return cur;
        }
        const c = { id: newId("cac"), name, teacher: String(p.input.teacher || "").trim().slice(0, 30), publicTutor: !!p.input.publicTutor, createdAt: (/* @__PURE__ */ new Date()).toISOString() };
        s.courses.push(c);
        return c;
      });
      ctx.pushState();
      return r;
    },
    "course.remove": (p) => {
      const ids = store2.read().docs.filter((d) => d.courseId === p.id).map((d) => d.id);
      for (const id of ids) svc.removeDoc(id);
      store2.update((s) => {
        s.courses = s.courses.filter((c) => c.id !== p.id);
      });
      store2.setList("questions", store2.questions().filter((q) => q.courseId !== p.id));
      ctx.pushState();
      return true;
    },
    "course.import": async (p) => {
      course(p.courseId);
      const made = await svc.importDocs(p?.paths || [], "", (0, import_i18n11.t)("\u8BFE\u7A0B\u8D44\u6599"), p.courseId);
      void svc.buildDocs(made.map((d) => d.id));
      return made;
    },
    "teach.demo": async () => {
      const dir = ctx.outputDir((0, import_node_path6.join)((0, import_i18n11.t)("\u793A\u4F8B\u6570\u636E"), (0, import_i18n11.t)("\u6559\u5B66")));
      const f = writeDemoCourse(dir);
      let c = store2.read().courses.find((x) => x.name === f.courseName);
      if (!c) {
        c = { id: newId("cac"), name: f.courseName, teacher: f.teacher, publicTutor: true, createdAt: (/* @__PURE__ */ new Date()).toISOString() };
        const made2 = c;
        store2.update((s) => {
          s.courses.push(made2);
        });
      }
      const made = await svc.importDocs(f.docs, "", (0, import_i18n11.t)("\u8BFE\u7A0B\u8D44\u6599"), c.id);
      await svc.buildDocs(made.map((d) => d.id));
      return { dir, courseId: c.id, keyFile: f.keyFile, answersFile: f.answersFile };
    },
    "tutor.ask": (p) => svc.ask(p?.question || "", "desk", void 0, p?.courseId),
    // ── 教学：出题 ──
    "quiz.generate": async (p) => {
      const c = course(p.courseId);
      const counts = Object.fromEntries(import_ipc_contracts5.CA_QUESTION_TYPES.map((t) => [t, Math.min(20, Math.max(0, Math.round(Number(p?.counts?.[t]) || 0)))]));
      if (!Object.values(counts).some((n) => n > 0)) throw new Error((0, import_i18n11.t)("\u8BF7\u81F3\u5C11\u9009\u4E00\u79CD\u9898\u578B\u548C\u9898\u91CF"));
      const chunks = svc.courseChunks(c.id, String(p?.focus || ""), 8);
      const started = Date.now();
      const { json, model } = await ctx.llmJson("quiz", buildQuizPrompt(c.name, chunks, counts, String(p?.focus || "")), 24e4);
      const parsed = parseQuiz(json, chunks);
      const now = (/* @__PURE__ */ new Date()).toISOString();
      const made = parsed.questions.map((q) => ({ ...q, id: newId("caq"), courseId: c.id, reviewed: false, createdAt: now }));
      store2.setList("questions", [...made, ...store2.questions()]);
      svc.audit("teach", "quiz", true, started, (0, import_i18n11.t)("{a} \u9053\uFF0C\u4E22\u5F03 {b} \u9053", { a: made.length, b: parsed.dropped }));
      ctx.pushState();
      return { made: made.length, dropped: parsed.dropped, reasons: parsed.reasons, model };
    },
    "quiz.list": (p) => store2.questions().filter((q) => q.courseId === p?.courseId),
    "quiz.update": (p) => {
      const list = store2.questions();
      const q = list.find((x) => x.id === p?.id);
      if (!q) throw new Error((0, import_i18n11.t)("\u9898\u76EE\u4E0D\u5B58\u5728\u6216\u5DF2\u5220\u9664"));
      const pt = p.patch || {};
      if (pt.stem !== void 0) q.stem = String(pt.stem).trim() || q.stem;
      if (pt.answer !== void 0) q.answer = String(pt.answer).trim() || q.answer;
      if (pt.explanation !== void 0) q.explanation = String(pt.explanation);
      if (pt.score !== void 0) q.score = Math.min(50, Math.max(1, Math.round(Number(pt.score) || q.score)));
      if (pt.reviewed !== void 0) q.reviewed = !!pt.reviewed;
      store2.setList("questions", list);
      return q;
    },
    "quiz.remove": (p) => {
      const ids = new Set(p?.ids || []);
      store2.setList("questions", store2.questions().filter((q) => !ids.has(q.id)));
      ctx.pushState();
      return true;
    },
    "quiz.export": (p) => {
      const c = course(p.courseId);
      const list = store2.questions().filter((q) => q.courseId === c.id && (!p.ids?.length || p.ids.includes(q.id)));
      if (!list.length) throw new Error((0, import_i18n11.t)("\u6CA1\u6709\u53EF\u5BFC\u51FA\u7684\u9898\u76EE"));
      const file = (0, import_node_path6.join)(ctx.outputDir((0, import_i18n11.t)("\u9898\u5E93")), (0, import_excel4.safeFileName)((0, import_i18n11.t)("{p0}-\u8BD5\u5377\u4E0E\u7B54\u6848-{p1}.xlsx", { p0: c.name, p1: stamp() })));
      const L = "ABCDEFGH";
      (0, import_excel4.writeWorkbook)(file, [
        { name: (0, import_i18n11.t)("\u8BD5\u5377"), headers: [(0, import_i18n11.t)("\u9898\u53F7"), (0, import_i18n11.t)("\u9898\u578B"), (0, import_i18n11.t)("\u5206\u503C"), (0, import_i18n11.t)("\u9898\u76EE"), (0, import_i18n11.t)("\u9009\u9879")], rows: list.map((q, i) => [i + 1, typeLabel(q.type), q.score, q.stem, q.options.map((o, j) => `${L[j]}. ${o}`).join("\n")]) },
        { name: (0, import_i18n11.t)("\u6807\u51C6\u7B54\u6848"), headers: [(0, import_i18n11.t)("\u9898\u53F7"), (0, import_i18n11.t)("\u9898\u578B"), (0, import_i18n11.t)("\u6807\u51C6\u7B54\u6848"), (0, import_i18n11.t)("\u5206\u503C"), (0, import_i18n11.t)("\u8BC4\u5206\u8981\u70B9"), (0, import_i18n11.t)("\u89E3\u6790"), (0, import_i18n11.t)("\u51FA\u5904"), (0, import_i18n11.t)("\u539F\u6587")], rows: list.map((q, i) => [i + 1, typeLabel(q.type), answerLabel(q.type, q.answer), q.score, q.points.join((0, import_i18n11.t)("\uFF1B")), q.explanation, q.sourceTitle, q.sourceQuote]) }
      ]);
      svc.audit("teach", "quiz.export", true, void 0, String(list.length));
      return file;
    },
    // ── 教学：批改 ──
    "grade.create": (p) => {
      const c = course(p.courseId);
      let key = [];
      let problems = [];
      if (p.questionIds?.length) {
        const qs = store2.questions().filter((q) => q.courseId === c.id && p.questionIds.includes(q.id));
        key = qs.map((q, i) => ({ no: String(i + 1), stem: q.stem, type: q.type, answer: q.answer, score: q.score, points: q.points }));
      } else if (p.keyPath) {
        if (!(0, import_node_fs5.existsSync)(p.keyPath)) throw new Error((0, import_i18n11.t)("\u6587\u4EF6\u4E0D\u5B58\u5728\uFF1A{p0}", { p0: p.keyPath }));
        ({ items: key, problems } = parseKey((0, import_excel4.readTable)(p.keyPath)));
      }
      if (!key.length) throw new Error(problems[0] || (0, import_i18n11.t)("\u6807\u51C6\u7B54\u6848\u662F\u7A7A\u7684"));
      const g = { id: newId("cag"), title: String(p.title || "").trim() || (0, import_i18n11.t)("{p0} \u4F5C\u4E1A", { p0: c.name }), courseId: c.id, key, keyFile: p.keyPath || "", answersFile: "", rows: [], createdAt: (/* @__PURE__ */ new Date()).toISOString() };
      store2.setList("gradings", [g, ...store2.gradings()]);
      ctx.pushState();
      return { id: g.id, items: key.length, problems };
    },
    "grade.get": (p) => grading(p.id),
    "grade.answers": (p) => {
      const g = grading(p.id);
      if (!(0, import_node_fs5.existsSync)(p.path)) throw new Error((0, import_i18n11.t)("\u6587\u4EF6\u4E0D\u5B58\u5728\uFF1A{p0}", { p0: p.path }));
      const { sheets, problems } = parseAnswers((0, import_excel4.readTable)(p.path), g.key);
      if (!sheets.length) throw new Error(problems[0] || (0, import_i18n11.t)("\u4F5C\u7B54\u8868\u662F\u7A7A\u7684"));
      g.answersFile = p.path;
      g.rows = sheets.map((sh) => newRow(sh, g.key));
      g.gradedAt = (/* @__PURE__ */ new Date()).toISOString();
      g.exportedAt = void 0;
      saveGrading(g);
      svc.audit("teach", "grade.answers", true, void 0, String(sheets.length));
      ctx.pushState();
      return { students: sheets.length, problems };
    },
    "grade.suggest": async (p) => {
      const g = grading(p.id);
      if (!g.rows.length) throw new Error((0, import_i18n11.t)("\u8BF7\u5148\u5BFC\u5165\u5B66\u751F\u4F5C\u7B54"));
      const started = Date.now();
      const r = await suggestShort(g);
      svc.audit("teach", "grade.suggest", r.failed === 0, started, (0, import_i18n11.t)("\u5EFA\u8BAE {a}\uFF0C\u5F85\u8BC4 {b}", { a: r.suggested, b: r.failed }));
      return r;
    },
    "grade.set": (p) => {
      const g = grading(p.id);
      const row = g.rows.find((r) => r.studentId === p.studentId);
      const item = row?.items.find((i) => i.no === p.no);
      if (!row || !item) throw new Error((0, import_i18n11.t)("\u627E\u4E0D\u5230\u8FD9\u9053\u9898\u7684\u4F5C\u7B54"));
      item.final = p.final === null ? null : clampScore(p.final, item.max);
      item.by = "teacher";
      row.total = rowTotal(row.items);
      saveGrading(g);
      ctx.pushState();
      return row;
    },
    "grade.confirm": (p) => {
      const g = grading(p.id);
      let n = 0;
      for (const r of g.rows) {
        if (p.studentIds?.length && !p.studentIds.includes(r.studentId)) continue;
        if (r.items.some((i) => i.final === null)) continue;
        r.confirmed = true;
        n++;
      }
      saveGrading(g);
      ctx.pushState();
      return n;
    },
    "grade.export": (p) => {
      const g = grading(p.id);
      const pending = g.rows.filter((r) => !r.confirmed).length;
      if (pending) throw new Error((0, import_i18n11.t)("\u8FD8\u6709 {n} \u540D\u5B66\u751F\u7684\u6210\u7EE9\u6CA1\u786E\u8BA4", { n: pending }));
      const file = (0, import_node_path6.join)(ctx.outputDir((0, import_i18n11.t)("\u4F5C\u4E1A\u6279\u6539")), (0, import_excel4.safeFileName)(`${g.title}-${stamp()}.xlsx`));
      (0, import_excel4.writeWorkbook)(file, [
        { name: (0, import_i18n11.t)("\u6210\u7EE9"), headers: [(0, import_i18n11.t)("\u5B66\u53F7"), (0, import_i18n11.t)("\u59D3\u540D"), ...g.key.map((k) => (0, import_i18n11.t)("\u7B2C{p0}\u9898", { p0: k.no })), (0, import_i18n11.t)("\u603B\u5206")], rows: g.rows.map((r) => [r.studentId, r.name, ...g.key.map((k) => r.items.find((i) => i.no === k.no)?.final ?? ""), r.total]) },
        { name: (0, import_i18n11.t)("\u8BC4\u5206\u8BF4\u660E"), headers: [(0, import_i18n11.t)("\u5B66\u53F7"), (0, import_i18n11.t)("\u9898\u53F7"), (0, import_i18n11.t)("\u4F5C\u7B54"), (0, import_i18n11.t)("\u5F97\u5206"), (0, import_i18n11.t)("\u6EE1\u5206"), (0, import_i18n11.t)("\u8BC4\u5206\u65B9\u5F0F"), (0, import_i18n11.t)("\u8BF4\u660E")], rows: g.rows.flatMap((r) => r.items.map((i) => [r.studentId, i.no, i.response, i.final ?? "", i.max, { rule: (0, import_i18n11.t)("\u6309\u7B54\u6848\u5224\u5206"), model: (0, import_i18n11.t)("\u6A21\u578B\u5EFA\u8BAE\u3001\u6559\u5E08\u786E\u8BA4"), teacher: (0, import_i18n11.t)("\u6559\u5E08\u8BC4\u5206"), pending: (0, import_i18n11.t)("\u5F85\u8BC4") }[i.by], i.reason])) }
      ]);
      g.exportedAt = (/* @__PURE__ */ new Date()).toISOString();
      g.exportPath = file;
      saveGrading(g);
      svc.audit("teach", "grade.export", true, void 0, String(g.rows.length));
      ctx.pushState();
      return file;
    },
    "grade.remove": (p) => {
      store2.setList("gradings", store2.gradings().filter((g) => g.id !== p.id));
      ctx.pushState();
      return true;
    },
    // ── 科研 ──
    "research.import": (p) => {
      if (!(0, import_node_fs5.existsSync)(p?.path)) throw new Error((0, import_i18n11.t)("\u6587\u4EF6\u4E0D\u5B58\u5728\uFF1A{p0}", { p0: p?.path || "" }));
      const r = parseOutputs((0, import_excel4.readTable)(p.path));
      if (!r.rows.length) throw new Error(r.problems[0] || (0, import_i18n11.t)("\u6210\u679C\u8868\u662F\u7A7A\u7684"));
      store2.setList("outputs", r.rows);
      store2.update((s) => {
        s.research.outputsFile = p.path;
        s.research.skipped = r.skipped;
      });
      svc.audit("research", "outputs.import", true, void 0, String(r.rows.length));
      ctx.pushState();
      return { count: r.rows.length, skipped: r.skipped, problems: r.problems };
    },
    "research.demo": () => {
      const dir = ctx.outputDir((0, import_node_path6.join)((0, import_i18n11.t)("\u793A\u4F8B\u6570\u636E"), (0, import_i18n11.t)("\u79D1\u7814")));
      const f = writeDemoOutputs(dir);
      const g = writeDemoGuide(dir);
      return { dir, outputs: f, guide: g };
    },
    "research.export": () => {
      const rows = store2.outputs();
      if (!rows.length) throw new Error((0, import_i18n11.t)("\u8FD8\u6CA1\u6709\u5BFC\u5165\u6210\u679C\u8868"));
      const st = researchStats(rows);
      const file = (0, import_node_path6.join)(ctx.outputDir((0, import_i18n11.t)("\u79D1\u7814\u7EDF\u8BA1")), (0, import_i18n11.t)("\u79D1\u7814\u6210\u679C\u7EDF\u8BA1-{p0}.xlsx", { p0: stamp() }));
      const g = (list, name) => ({ name, headers: [name, (0, import_i18n11.t)("\u6570\u91CF"), (0, import_i18n11.t)("\u7ECF\u8D39")], rows: list.map((x) => [x.key, x.count, x.funding]) });
      (0, import_excel4.writeWorkbook)(file, [
        g(st.byYear, (0, import_i18n11.t)("\u5E74\u5EA6")),
        g(st.byType, (0, import_i18n11.t)("\u7C7B\u578B")),
        g(st.byCollege, (0, import_i18n11.t)("\u5B66\u9662")),
        g(st.byLevel, (0, import_i18n11.t)("\u7EA7\u522B")),
        { name: (0, import_i18n11.t)("\u5B66\u9662\xD7\u7C7B\u578B"), headers: [(0, import_i18n11.t)("\u5B66\u9662"), ...st.matrix.cols], rows: st.matrix.rows.map((r, i) => [r, ...st.matrix.cells[i]]) },
        { name: (0, import_i18n11.t)("\u660E\u7EC6"), headers: [(0, import_i18n11.t)("\u6210\u679C\u540D\u79F0"), (0, import_i18n11.t)("\u7C7B\u578B"), (0, import_i18n11.t)("\u5B66\u9662"), (0, import_i18n11.t)("\u8D1F\u8D23\u4EBA"), (0, import_i18n11.t)("\u5E74\u4EFD"), (0, import_i18n11.t)("\u7EA7\u522B"), (0, import_i18n11.t)("\u7ECF\u8D39")], rows: rows.map((r) => [r.title, r.type, r.college, r.owner, r.year, r.level, r.funding]) }
      ]);
      svc.audit("research", "outputs.export", true);
      return file;
    },
    "guide.analyze": async (p) => {
      if (!(0, import_node_fs5.existsSync)(p?.path)) throw new Error((0, import_i18n11.t)("\u6587\u4EF6\u4E0D\u5B58\u5728\uFF1A{p0}", { p0: p?.path || "" }));
      const started = Date.now();
      const ex = await (0, import_documentExtractor2.extractDocument)(p.path, (0, import_node_path6.basename)(p.path));
      const text = String(ex.text || "").trim();
      if (!text) throw new Error(ex.warning || (0, import_i18n11.t)("\u6CA1\u6709\u8BFB\u5230\u6587\u5B57"));
      const parts = splitGuide(text);
      const results = [];
      let model = "";
      for (let i = 0; i < parts.length; i++) {
        ctx.progress((0, import_i18n11.t)("\u6B63\u5728\u89E3\u8BFB\u7B2C {a}/{b} \u90E8\u5206", { a: i + 1, b: parts.length }), { scope: "guide" });
        const r = await ctx.llmJson("guide", buildGuidePrompt(parts[i], i, parts.length), 18e4);
        results.push(r.json);
        model = r.model;
      }
      ctx.progress("", { scope: "guide" });
      const v = verifyGuide(results, text);
      const g = { id: newId("cag"), fileName: (0, import_node_path6.basename)(p.path), path: p.path, at: (/* @__PURE__ */ new Date()).toISOString(), title: v.title || (0, import_node_path6.basename)(p.path), ...v.sections, dropped: v.dropped, model };
      store2.update((s) => {
        s.research.guides = [g, ...s.research.guides].slice(0, 30);
      });
      svc.audit("research", "guide", true, started, (0, import_i18n11.t)("{a} \u6761\uFF0C\u4E22\u5F03 {b} \u6761", { a: GUIDE_SECTIONS.reduce((n, k) => n + v.sections[k].length, 0), b: v.dropped }));
      ctx.pushState();
      return g;
    },
    "guide.remove": (p) => {
      store2.update((s) => {
        s.research.guides = s.research.guides.filter((g) => g.id !== p.id);
      });
      ctx.pushState();
      return true;
    },
    "guide.export": (p) => {
      const g = store2.read().research.guides.find((x) => x.id === p.id);
      if (!g) throw new Error((0, import_i18n11.t)("\u89E3\u8BFB\u8BB0\u5F55\u4E0D\u5B58\u5728"));
      const label = { deadlines: (0, import_i18n11.t)("\u622A\u6B62\u65F6\u95F4"), eligibility: (0, import_i18n11.t)("\u7533\u62A5\u6761\u4EF6"), materials: (0, import_i18n11.t)("\u6750\u6599\u6E05\u5355"), funding: (0, import_i18n11.t)("\u8D44\u52A9\u989D\u5EA6"), contacts: (0, import_i18n11.t)("\u8054\u7CFB\u65B9\u5F0F") };
      const file = (0, import_node_path6.join)(ctx.outputDir((0, import_i18n11.t)("\u7533\u62A5\u6307\u5357\u89E3\u8BFB")), (0, import_excel4.safeFileName)(`${g.title}-${stamp()}.xlsx`));
      (0, import_excel4.writeWorkbook)(file, [{ name: (0, import_i18n11.t)("\u8981\u70B9"), headers: [(0, import_i18n11.t)("\u7C7B\u522B"), (0, import_i18n11.t)("\u8981\u70B9"), (0, import_i18n11.t)("\u65E5\u671F"), (0, import_i18n11.t)("\u539F\u6587")], rows: GUIDE_SECTIONS.flatMap((k) => g[k].map((it) => [label[k], it.text, it.date || "", it.quote])) }]);
      return file;
    },
    // ── 校务治理：公文 ──
    "doc.draft": async (p) => {
      const i = p?.input || {};
      const kind = ["notice", "request", "report", "letter", "minutes"].includes(i.kind) ? i.kind : "notice";
      const title = String(i.title || "").trim();
      const points = String(i.points || "").trim();
      if (!title) throw new Error((0, import_i18n11.t)("\u8BF7\u586B\u5199\u6807\u9898"));
      if (!points) throw new Error((0, import_i18n11.t)("\u8BF7\u586B\u5199\u8981\u70B9\uFF1A\u516C\u6587\u6B63\u6587\u53EA\u6309\u8981\u70B9\u8D77\u8349"));
      const issuer = String(i.issuer || "").trim() || schoolLabel(store2.read().settings);
      const started = Date.now();
      const { text, model } = await ctx.llm("doc", buildDocPrompt({ kind, issuer, title, recipients: String(i.recipients || ""), points, school: schoolLabel(store2.read().settings) }), 18e4);
      const body = cleanDocBody(String(text || "").replace(/\*\*/g, "").replace(/^#+\s*/gm, ""), title, String(i.recipients || ""), issuer);
      const now = (/* @__PURE__ */ new Date()).toISOString();
      const doc = {
        id: i.id || newId("cao"),
        kind,
        issuer,
        docNo: String(i.docNo || "").trim(),
        title,
        recipients: String(i.recipients || "").trim(),
        points,
        attachments: String(i.attachments || "").trim(),
        date: String(i.date || now.slice(0, 10)),
        body,
        unverified: docUnverifiedNumbers(body, points, title),
        model,
        createdAt: now,
        updatedAt: now
      };
      store2.update((s) => {
        s.officialDocs = [doc, ...s.officialDocs.filter((d) => d.id !== doc.id)].slice(0, 100);
      });
      svc.audit("gov", "doc.draft", true, started, docKindLabel(kind));
      ctx.pushState();
      return doc;
    },
    "doc.save": (p) => {
      const r = store2.update((s) => {
        const d = s.officialDocs.find((x) => x.id === p?.id);
        if (!d) throw new Error((0, import_i18n11.t)("\u516C\u6587\u4E0D\u5B58\u5728\u6216\u5DF2\u5220\u9664"));
        for (const k of ["issuer", "docNo", "title", "recipients", "attachments", "date", "body", "points"]) if (p.patch?.[k] !== void 0) d[k] = String(p.patch[k]);
        d.unverified = docUnverifiedNumbers(d.body, d.points, d.title);
        d.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
        return d;
      });
      ctx.pushState();
      return r;
    },
    "doc.export": (p) => {
      const d = store2.read().officialDocs.find((x) => x.id === p?.id);
      if (!d) throw new Error((0, import_i18n11.t)("\u516C\u6587\u4E0D\u5B58\u5728\u6216\u5DF2\u5220\u9664"));
      const file = (0, import_node_path6.join)(ctx.outputDir((0, import_i18n11.t)("\u516C\u6587")), (0, import_excel4.safeFileName)(`${d.title}.docx`));
      (0, import_node_fs5.writeFileSync)(file, buildOfficialDocx(d));
      store2.update((s) => {
        const x = s.officialDocs.find((y) => y.id === d.id);
        if (x) x.docxPath = file;
      });
      svc.audit("gov", "doc.export", true);
      ctx.pushState();
      return file;
    },
    "doc.remove": (p) => {
      store2.update((s) => {
        s.officialDocs = s.officialDocs.filter((d) => d.id !== p.id);
      });
      ctx.pushState();
      return true;
    },
    // ── 校务治理：诉求热点 ──
    "hotspot.report": async (p) => {
      const days = Math.min(365, Math.max(1, Math.round(Number(p?.days) || 7)));
      const to = /* @__PURE__ */ new Date();
      const from = new Date(to.getTime() - days * 864e5);
      const started = Date.now();
      const r = hotspotReport(store2.qa(), store2.read().tickets, from, to);
      const facts = hotspotFacts(r);
      r.summary = hotspotTemplate(r);
      r.summaryBy = "template";
      if (p?.useModel !== false && r.total > 0) {
        try {
          const { text } = await ctx.llm("hotspot", buildHotspotPrompt(facts, schoolLabel(store2.read().settings)), 12e4);
          const t = String(text || "").trim();
          if (t && !numbersOutsideFacts(t, facts).length) {
            r.summary = t;
            r.summaryBy = "model";
          }
        } catch {
        }
      }
      svc.audit("gov", "hotspot", true, started, (0, import_i18n11.t)("{n} \u5929", { n: days }));
      return r;
    },
    "hotspot.export": (p) => {
      const r = p?.report;
      if (!r) throw new Error((0, import_i18n11.t)("\u8BF7\u5148\u751F\u6210\u62A5\u544A"));
      const file = (0, import_node_path6.join)(ctx.outputDir((0, import_i18n11.t)("\u8BC9\u6C42\u70ED\u70B9")), (0, import_i18n11.t)("\u8BC9\u6C42\u70ED\u70B9\u5468\u62A5-{p0}.xlsx", { p0: stamp() }));
      (0, import_excel4.writeWorkbook)(file, [
        { name: (0, import_i18n11.t)("\u5C0F\u7ED3"), headers: [(0, import_i18n11.t)("\u5C0F\u7ED3")], rows: String(r.summary || "").split("\n").map((x) => [x]) },
        { name: (0, import_i18n11.t)("\u9886\u57DF\u5206\u5E03"), headers: [(0, import_i18n11.t)("\u9886\u57DF"), (0, import_i18n11.t)("\u672C\u671F"), (0, import_i18n11.t)("\u4E0A\u671F"), (0, import_i18n11.t)("\u65E0\u4F9D\u636E")], rows: (r.byDomain || []).map((d) => [d.name, d.count, d.prev, d.noEvidence]) },
        { name: (0, import_i18n11.t)("\u90E8\u95E8\u54CD\u5E94"), headers: [(0, import_i18n11.t)("\u90E8\u95E8"), (0, import_i18n11.t)("\u5F85\u7B54\u590D"), (0, import_i18n11.t)("\u5DF2\u7B54\u590D"), (0, import_i18n11.t)("\u5E73\u5747\u54CD\u5E94\u5C0F\u65F6"), (0, import_i18n11.t)("\u8D85 48 \u5C0F\u65F6\u672A\u7B54\u590D")], rows: (r.byDept || []).map((d) => [d.dept, d.open, d.answered, d.avgHours ?? "", d.overdue]) },
        { name: (0, import_i18n11.t)("\u77E5\u8BC6\u7F3A\u53E3"), headers: [(0, import_i18n11.t)("\u95EE\u9898"), (0, import_i18n11.t)("\u6B21\u6570"), (0, import_i18n11.t)("\u9886\u57DF")], rows: (r.gaps || []).map((g) => [g.question, g.count, g.domain]) },
        { name: (0, import_i18n11.t)("\u9AD8\u9891\u8BCD"), headers: [(0, import_i18n11.t)("\u8BCD"), (0, import_i18n11.t)("\u95EE\u9898\u6570")], rows: (r.keywords || []).map((k) => [k.term, k.count]) }
      ]);
      return file;
    }
  };
}

// ../../../totalclaw-solutions/solutions/workbench-campus-ai/src/main/ipc/campusAi.ipc.ts
var store = new CampusAiStore();
function registerCampusAiHandlers(deps) {
  const logger = deps.logger;
  const win = () => deps.getMainWindow?.() ?? null;
  const send = (type, payload) => {
    try {
      win()?.webContents.send(import_ipc_contracts7.IPC_CHANNELS.WORKBENCH_CA_EVENT, { type, payload });
    } catch {
    }
  };
  let stateTimer = null;
  const pushState = () => {
    if (stateTimer) return;
    stateTimer = setTimeout(() => {
      stateTimer = null;
      send("state");
    }, 120);
  };
  const progress = (message, extra) => send("progress", { message, ...extra });
  const wbLlm = (0, import_workbenchLlm.createWorkbenchLlm)(deps, { logTag: "campus-ai", moduleModel: () => "" });
  const svc = new CampusAiService(store, (prompt) => wbLlm.llm("qa", prompt, 9e4), pushState, (m) => progress(m, { scope: "kb" }));
  const mobile = new CampusMobileServer(svc, logger);
  const outputDir = (sub) => {
    const s = store.read().settings;
    const root = s.outputDir && (0, import_node_fs6.existsSync)(s.outputDir) ? s.outputDir : (0, import_node_path7.join)(import_electron.app.getPath("documents"), "TotalClaw", (0, import_i18n12.t)("\u9AD8\u6821\u4E00\u4F53\u5316AI\u667A\u80FD\u4F53"));
    const dir = sub ? (0, import_node_path7.join)(root, sub) : root;
    (0, import_node_fs6.mkdirSync)(dir, { recursive: true });
    return dir;
  };
  const results = () => store.results();
  const mctx = {
    store,
    svc,
    llm: (module2, prompt, timeoutMs) => wbLlm.llm(module2, prompt, timeoutMs),
    llmJson: (module2, prompt, timeoutMs) => wbLlm.llmJson(module2, prompt, timeoutMs),
    outputDir: (sub) => outputDir(sub),
    pushState: () => pushState(),
    progress: (m, extra) => progress(m, extra)
  };
  const LOGO_MIME = { ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".svg": "image/svg+xml", ".gif": "image/gif" };
  let logoCache = { path: "", url: "" };
  const logoDataUrl = (path) => {
    if (!path || !(0, import_node_fs6.existsSync)(path)) return "";
    if (logoCache.path === path) return logoCache.url;
    const mime = LOGO_MIME[(0, import_node_path7.extname)(path).toLowerCase()];
    if (!mime || (0, import_node_fs6.statSync)(path).size > 3 * 1024 * 1024) return "";
    logoCache = { path, url: `data:${mime};base64,${(0, import_node_fs6.readFileSync)(path).toString("base64")}` };
    return logoCache.url;
  };
  const pendingReviews = () => {
    const w = store.read().warn;
    if (!w || w.stale) return 0;
    return results().filter((r) => r.level && (w.reviews[r.studentId]?.status || "pending") === "pending").length;
  };
  const publicState = () => {
    const s = store.read();
    let model = "";
    try {
      model = wbLlm.defaultModel();
    } catch {
      model = "";
    }
    return {
      settings: s.settings,
      defaults: { warnRules: defaultWarnRules() },
      docs: s.docs,
      faqs: s.faqs,
      tickets: s.tickets,
      datasets: s.datasets,
      warn: s.warn,
      mobile: mobile.status(),
      stats: svc.stats(pendingReviews()),
      outputDir: outputDir(),
      model,
      logo: logoDataUrl(s.settings.profile.logoPath),
      ...moduleState(mctx)
    };
  };
  try {
    svc.purgeExpired();
  } catch (e) {
    logger?.warn?.("campus-ai", "purge failed", { error: e?.message });
  }
  const purgeTimer = setInterval(() => {
    try {
      svc.purgeExpired();
    } catch {
    }
  }, 6 * 60 * 6e4);
  purgeTimer.unref?.();
  (0, import_quitRegistry.onAppWillQuit)("campus-ai", () => {
    clearInterval(purgeTimer);
    void mobile.stop();
  }, { once: true });
  const markStale = (reason) => {
    store.update((s) => {
      if (s.warn && !s.warn.stale) {
        s.warn.stale = true;
        s.warn.staleReason = reason;
      }
    });
  };
  const liveWarn = () => {
    const w = store.read().warn;
    if (!w) throw new Error((0, import_i18n12.t)("\u8FD8\u6CA1\u6709\u9884\u8B66\u7ED3\u679C\uFF0C\u8BF7\u5148\u5B8C\u6210\u7B2C 2 \u6B65"));
    if (w.stale) throw new Error((0, import_i18n12.t)("{p0}\uFF0C\u8BF7\u56DE\u5230\u7B2C 2 \u6B65\u91CD\u65B0\u8BA1\u7B97", { p0: w.staleReason || (0, import_i18n12.t)("\u6570\u636E\u6216\u89C4\u5219\u5DF2\u7ECF\u6539\u8FC7") }));
    return w;
  };
  function importDataset(dataset, path, sheet, mapping) {
    if (!import_ipc_contracts6.CA_DATASETS.includes(dataset)) throw new Error((0, import_i18n12.t)("\u672A\u77E5\u6570\u636E\u7C7B\u578B"));
    if (!path || !(0, import_node_fs6.existsSync)(path)) throw new Error((0, import_i18n12.t)("\u6587\u4EF6\u4E0D\u5B58\u5728\uFF1A{p0}", { p0: path || "" }));
    const { table, sheetNames } = readSheet(path, sheet);
    const map = detectMapping(table.headers, dataset, mapping);
    const missing = missingRoles(dataset, map);
    const meta = {
      path,
      fileName: (0, import_node_path7.basename)(path),
      sheetName: table.sheetName,
      sheetNames,
      headers: table.headers,
      rowCount: table.rows.length,
      preview: table.rows.slice(0, 5),
      mapping: map,
      missing,
      loaded: false,
      count: 0,
      skippedCount: 0,
      skipped: [],
      notes: [],
      loadedAt: ""
    };
    if (!missing.length) {
      const parsed = dataset === "roster" ? parseRoster(table, map) : dataset === "grades" ? parseGrades(table, map) : parseAttendance(table, map);
      store.setData(dataset, parsed.rows);
      Object.assign(meta, { loaded: true, count: parsed.rows.length, skippedCount: parsed.skippedCount, skipped: parsed.skipped, notes: parsed.notes, loadedAt: (/* @__PURE__ */ new Date()).toISOString() });
    }
    store.update((s) => {
      s.datasets[dataset] = meta;
    });
    markStale((0, import_i18n12.t)("\u6570\u636E\u5DF2\u7ECF\u66F4\u65B0"));
    svc.audit("warning", "data.import", meta.loaded, void 0, `${dataset} ${meta.count}`);
    pushState();
    return meta;
  }
  function compute() {
    const started = Date.now();
    const s = store.read();
    if (!s.datasets.roster?.loaded && !s.datasets.grades?.loaded) throw new Error((0, import_i18n12.t)("\u8BF7\u5148\u5BFC\u5165\u5B66\u751F\u540D\u5355\u548C\u6210\u7EE9\u8868"));
    if (!s.datasets.grades?.loaded) throw new Error((0, import_i18n12.t)("\u8BF7\u5148\u5BFC\u5165\u6210\u7EE9\u8868"));
    const { results: list, summary } = computeWarnings(store.data(), s.settings.warnRules);
    const prev = s.warn;
    const oldLevel = new Map(store.results().map((x) => [x.studentId, x.level]));
    store.setResults(list);
    const r = store.update((st) => {
      const reviews = {};
      for (const x of list) {
        const old = prev?.reviews[x.studentId];
        if (old && x.level && oldLevel.get(x.studentId) === x.level) reviews[x.studentId] = old;
      }
      st.warn = { id: newId("caw"), computedAt: (/* @__PURE__ */ new Date()).toISOString(), rules: st.settings.warnRules, summary, reviews, notices: {}, stale: false };
      return st.warn;
    });
    svc.audit("warning", "compute", true, started, (0, import_i18n12.t)("\u9884\u8B66 {a} / {b} \u4EBA", { a: summary.warned, b: summary.students }));
    pushState();
    return r;
  }
  function review(ids, status, level, note) {
    liveWarn();
    const valid = new Set(results().filter((x) => x.level).map((x) => x.studentId));
    store.update((s) => {
      for (const id of ids || []) {
        if (!valid.has(id)) continue;
        const cur = s.warn.reviews[id] || { status: "pending" };
        cur.status = status;
        if (level !== void 0) cur.level = level && import_ipc_contracts6.CA_LEVELS.includes(level) ? level : void 0;
        if (note !== void 0) cur.note = String(note).slice(0, 300);
        cur.at = (/* @__PURE__ */ new Date()).toISOString();
        s.warn.reviews[id] = cur;
        delete s.warn.notices[id];
      }
    });
    pushState();
  }
  const effectiveLevel = (x) => {
    const r = store.read().warn?.reviews[x.studentId];
    return (r?.level || x.level) ?? null;
  };
  async function writeNotices(ids, useModel) {
    const w = liveWarn();
    const confirmed = results().filter((x) => x.level && w.reviews[x.studentId]?.status === "confirmed" && (!ids?.length || ids.includes(x.studentId)));
    if (!confirmed.length) throw new Error((0, import_i18n12.t)("\u8FD8\u6CA1\u6709\u5DF2\u786E\u8BA4\u7684\u9884\u8B66\u5B66\u751F\uFF1A\u8BF7\u5148\u5728\u7B2C 3 \u6B65\u590D\u6838"));
    const school = schoolLabel(store.read().settings);
    const llmJson = useModel ? (p) => wbLlm.llmJson("notice", p, 12e4) : null;
    let done = 0;
    let byModel = 0;
    const started = Date.now();
    for (const x of confirmed) {
      progress((0, import_i18n12.t)("\u6B63\u5728\u5199\u7B2C {a}/{b} \u4EFD", { a: done + 1, b: confirmed.length }), { scope: "notice", done, total: confirmed.length });
      const n = await draftNotice(x, effectiveLevel(x), school, llmJson);
      if (n.by === "model") byModel++;
      store.update((s) => {
        if (s.warn && !s.warn.stale) s.warn.notices[x.studentId] = n;
      });
      done++;
      pushState();
    }
    progress("", { scope: "notice", done, total: confirmed.length });
    svc.audit("warning", "notices", true, started, (0, import_i18n12.t)("{a} \u4EFD\uFF0C\u6A21\u578B {b} \u4EFD", { a: done, b: byModel }));
    return { done, byModel };
  }
  const warnRows = (list) => {
    const w = store.read().warn;
    return list.map((x) => {
      const r = w.reviews[x.studentId];
      const n = w.notices[x.studentId];
      const lv = effectiveLevel(x);
      return [
        x.studentId,
        x.name,
        x.className,
        x.college,
        x.major,
        x.counselor,
        x.level ? levelLabel(x.level) : "",
        lv ? levelLabel(lv) : "",
        r?.status === "confirmed" ? (0, import_i18n12.t)("\u5DF2\u786E\u8BA4") : r?.status === "dismissed" ? (0, import_i18n12.t)("\u4E0D\u9884\u8B66") : (0, import_i18n12.t)("\u5F85\u590D\u6838"),
        x.failCourses,
        x.failCredits,
        x.failed.map((f) => `${f.course} ${f.score}`).join((0, import_i18n12.t)("\u3001")),
        x.absent,
        x.totalSessions || "",
        x.absenceRate === null ? "" : pctText(x.absenceRate),
        x.basis.join((0, import_i18n12.t)("\uFF1B")),
        r?.note || "",
        n ? n.outline : "",
        n ? fillName(n.notice, x.name) : ""
      ];
    });
  };
  const WARN_HEADERS = () => [
    (0, import_i18n12.t)("\u5B66\u53F7"),
    (0, import_i18n12.t)("\u59D3\u540D"),
    (0, import_i18n12.t)("\u73ED\u7EA7"),
    (0, import_i18n12.t)("\u5B66\u9662"),
    (0, import_i18n12.t)("\u4E13\u4E1A"),
    (0, import_i18n12.t)("\u8F85\u5BFC\u5458"),
    (0, import_i18n12.t)("\u8BA1\u7B97\u7EA7\u522B"),
    (0, import_i18n12.t)("\u590D\u6838\u7EA7\u522B"),
    (0, import_i18n12.t)("\u590D\u6838\u72B6\u6001"),
    (0, import_i18n12.t)("\u4E0D\u53CA\u683C\u95E8\u6570"),
    (0, import_i18n12.t)("\u4E0D\u53CA\u683C\u5B66\u5206"),
    (0, import_i18n12.t)("\u4E0D\u53CA\u683C\u8BFE\u7A0B"),
    (0, import_i18n12.t)("\u7F3A\u52E4\u6B21\u6570"),
    (0, import_i18n12.t)("\u5E94\u5230\u6B21\u6570"),
    (0, import_i18n12.t)("\u7F3A\u52E4\u7387"),
    (0, import_i18n12.t)("\u9884\u8B66\u4F9D\u636E"),
    (0, import_i18n12.t)("\u8F85\u5BFC\u5458\u5907\u6CE8"),
    (0, import_i18n12.t)("\u8C08\u8BDD\u63D0\u7EB2"),
    (0, import_i18n12.t)("\u5B66\u751F\u901A\u77E5")
  ];
  function exportWarn() {
    const w = liveWarn();
    if (pendingReviews()) throw new Error((0, import_i18n12.t)("\u8FD8\u6709 {n} \u540D\u5B66\u751F\u6CA1\u6709\u590D\u6838\uFF0C\u590D\u6838\u5B8C\u624D\u80FD\u5BFC\u51FA", { n: pendingReviews() }));
    const d = /* @__PURE__ */ new Date();
    const p2 = (n) => String(n).padStart(2, "0");
    const stamp2 = `${d.getFullYear()}${p2(d.getMonth() + 1)}${p2(d.getDate())}-${p2(d.getHours())}${p2(d.getMinutes())}`;
    const dir = outputDir((0, import_node_path7.join)((0, import_i18n12.t)("\u5B66\u4E1A\u9884\u8B66"), stamp2));
    const warned = results().filter((x) => x.level);
    const file = (0, import_node_path7.join)(dir, (0, import_i18n12.t)("\u5B66\u4E1A\u9884\u8B66\u540D\u5355.xlsx"));
    (0, import_excel5.writeWorkbook)(file, [{ name: (0, import_i18n12.t)("\u9884\u8B66\u540D\u5355"), headers: WARN_HEADERS(), rows: warnRows(warned) }]);
    let notices = 0;
    const ndir = (0, import_node_path7.join)(dir, (0, import_i18n12.t)("\u5B66\u751F\u901A\u77E5"));
    for (const x of warned) {
      const n = w.notices[x.studentId];
      if (!n || w.reviews[x.studentId]?.status !== "confirmed") continue;
      (0, import_node_fs6.mkdirSync)(ndir, { recursive: true });
      (0, import_node_fs6.writeFileSync)((0, import_node_path7.join)(ndir, (0, import_excel5.safeFileName)(`${x.className}-${x.studentId}-${x.name}.txt`)), `${fillName(n.notice, x.name)}
`, "utf-8");
      notices++;
    }
    store.update((s) => {
      if (s.warn) {
        s.warn.exportedAt = (/* @__PURE__ */ new Date()).toISOString();
        s.warn.exportDir = dir;
      }
    });
    svc.audit("warning", "export", true, void 0, (0, import_i18n12.t)("{a} \u4EBA\uFF0C\u901A\u77E5 {b} \u4EFD", { a: warned.length, b: notices }));
    pushState();
    return { dir, file, notices };
  }
  function mailPlan() {
    const w = liveWarn();
    const groups = /* @__PURE__ */ new Map();
    for (const x of results()) {
      if (!x.level || w.reviews[x.studentId]?.status !== "confirmed") continue;
      const key = x.counselorEmail || `__${x.counselor}`;
      const g = groups.get(key) || { counselor: x.counselor || (0, import_i18n12.t)("\u672A\u586B\u8F85\u5BFC\u5458"), to: x.counselorEmail, ids: [] };
      g.ids.push(x.studentId);
      groups.set(key, g);
    }
    return [...groups.values()].map((g) => ({ ...g, students: g.ids.length }));
  }
  const sendMail = async (input) => {
    const { sendCaseMail } = await import("host:apps/desktop-shell/src/main/services/caseMailSender.ts");
    const relay = deps.serviceAuth ? { send: (i) => deps.serviceAuth.relaySendMail(i) } : null;
    return sendCaseMail(deps.readEmailCredentials?.() ?? {}, input, relay);
  };
  async function mailSend(confirm) {
    if (!confirm) throw new Error((0, import_i18n12.t)("\u53D1\u9001\u524D\u8BF7\u5148\u786E\u8BA4\u6536\u4EF6\u4EBA\u4E0E\u5185\u5BB9"));
    const plan = mailPlan().filter((g) => g.to);
    if (!plan.length) throw new Error((0, import_i18n12.t)("\u540D\u5355\u91CC\u6CA1\u6709\u8F85\u5BFC\u5458\u90AE\u7BB1\uFF0C\u65E0\u6CD5\u53D1\u9001"));
    const dir = outputDir((0, import_node_path7.join)((0, import_i18n12.t)("\u5B66\u4E1A\u9884\u8B66"), (0, import_i18n12.t)("\u90AE\u4EF6\u9644\u4EF6")));
    const school = schoolLabel(store.read().settings);
    const all = results();
    const out = [];
    for (const g of plan) {
      const list = all.filter((x) => g.ids.includes(x.studentId));
      const file = (0, import_node_path7.join)(dir, (0, import_excel5.safeFileName)((0, import_i18n12.t)("\u5B66\u4E1A\u9884\u8B66-{p0}.xlsx", { p0: g.counselor })));
      (0, import_excel5.writeWorkbook)(file, [{ name: (0, import_i18n12.t)("\u9884\u8B66\u540D\u5355"), headers: WARN_HEADERS(), rows: warnRows(list) }]);
      const byLv = import_ipc_contracts6.CA_LEVELS.map((lv) => (0, import_i18n12.t)("{a} {b} \u4EBA", { a: levelLabel(lv), b: list.filter((x) => effectiveLevel(x) === lv).length })).join((0, import_i18n12.t)("\uFF0C"));
      const r = await sendMail({
        to: [g.to],
        subject: (0, import_i18n12.t)("\u3010{p0}\u3011\u5B66\u4E1A\u9884\u8B66\u540D\u5355\uFF08{n} \u4EBA\uFF09", { p0: school, n: list.length }),
        body: [
          (0, import_i18n12.t)("{p0}\u8001\u5E08\uFF1A", { p0: g.counselor }),
          (0, import_i18n12.t)("\u672C\u6B21\u5B66\u4E1A\u9884\u8B66\u60A8\u8D1F\u8D23\u7684\u5B66\u751F\u5171 {n} \u4EBA\uFF1A{p0}\u3002\u540D\u5355\u3001\u9884\u8B66\u4F9D\u636E\u3001\u8C08\u8BDD\u63D0\u7EB2\u4E0E\u5B66\u751F\u901A\u77E5\u8349\u7A3F\u89C1\u9644\u4EF6\u3002", { n: list.length, p0: byLv }),
          (0, import_i18n12.t)("\u8BF7\u5728\u4E00\u5468\u5185\u4E0E\u5B66\u751F\u9762\u8C08\u5E76\u5236\u5B9A\u5B66\u4E1A\u6539\u8FDB\u8BA1\u5212\u3002")
        ].join("\n\n"),
        attachments: [{ filename: (0, import_node_path7.basename)(file), path: file }]
      });
      out.push({ counselor: g.counselor, to: g.to, ok: !!r.ok, message: r.message });
    }
    svc.audit("warning", "mail", out.every((x) => x.ok), void 0, (0, import_i18n12.t)("{a} \u5C01\uFF0C\u6210\u529F {b}", { a: out.length, b: out.filter((x) => x.ok).length }));
    return out;
  }
  const actions = {
    ...moduleActions(mctx),
    "state.get": () => publicState(),
    "audit.list": (p) => store.auditList(Math.min(Math.max(Number(p?.limit) || 200, 1), 1e3)),
    "qa.list": (p) => store.qa().filter((r) => !p?.kind || r.kind === p.kind).slice(0, Math.min(Math.max(Number(p?.limit) || 200, 1), 1e3)).map(publicQa),
    "files.pick": async (p) => {
      const exts = p?.kind === "excel" ? ["xlsx", "xls", "csv"] : p?.kind === "image" ? ["png", "jpg", "jpeg", "webp", "svg"] : KB_EXTS.map((e) => e.slice(1));
      const r = await import_electron.dialog.showOpenDialog(win(), {
        title: p?.title || (0, import_i18n12.t)("\u9009\u62E9\u6587\u4EF6"),
        properties: p?.multi ? ["openFile", "multiSelections"] : ["openFile"],
        filters: [{ name: p?.kind === "excel" ? "Excel" : (0, import_i18n12.t)("\u6587\u6863"), extensions: exts }]
      });
      return r.canceled ? [] : r.filePaths;
    },
    "folder.pick": async () => {
      const r = await import_electron.dialog.showOpenDialog(win(), { properties: ["openDirectory", "createDirectory"] });
      return r.canceled ? "" : r.filePaths[0] || "";
    },
    "path.open": async (p) => {
      if (!p?.path || !(0, import_node_fs6.existsSync)(p.path)) throw new Error((0, import_i18n12.t)("\u6587\u4EF6\u4E0D\u5B58\u5728"));
      if (p.reveal) {
        import_electron.shell.showItemInFolder(p.path);
        return true;
      }
      const err = await import_electron.shell.openPath(p.path);
      if (err) throw new Error(err);
      return true;
    },
    // 知识库
    "kb.import": async (p) => {
      const made = await svc.importDocs(p?.paths || [], String(p?.dept || ""), String(p?.category || ""));
      void svc.buildDocs(made.map((d) => d.id));
      return made;
    },
    "kb.build": (p) => svc.buildDocs(p?.ids),
    "kb.update": (p) => svc.updateDoc(p.id, p),
    "kb.remove": (p) => {
      svc.removeDoc(p.id);
      return true;
    },
    "kb.search": (p) => svc.search(p?.query || ""),
    "kb.demo": async () => {
      const dir = outputDir((0, import_node_path7.join)((0, import_i18n12.t)("\u793A\u4F8B\u6570\u636E"), (0, import_i18n12.t)("\u77E5\u8BC6\u5E93")));
      const files = writeDemoKb(dir);
      const ids = [];
      for (const d of files.docs) ids.push(...(await svc.importDocs([d.path], d.dept, d.category)).map((x) => x.id));
      const faq = svc.importFaqs(files.faqFile);
      await svc.buildDocs(ids);
      return { dir, docs: ids.length, faqs: faq.added + faq.updated };
    },
    "faq.save": (p) => svc.saveFaq(p?.input || {}),
    "faq.remove": (p) => {
      svc.removeFaq(p.id);
      return true;
    },
    "faq.import": (p) => svc.importFaqs(p.path),
    "faq.export": () => svc.exportFaqs(outputDir()),
    // 问答 / 转办
    "qa.ask": (p) => svc.ask(p?.question || "", "desk"),
    "qa.feedback": (p) => {
      svc.feedback(p.qaId, p.value);
      return true;
    },
    "ticket.answer": (p) => svc.answerTicket(p.id, p.answer, { toFaq: p.toFaq, faqQuestion: p.faqQuestion }),
    "ticket.update": (p) => svc.updateTicket(p.id, p),
    // 手机端
    "mobile.start": async () => {
      const r = await mobile.start();
      svc.audit("mobile", "start", true);
      pushState();
      return r;
    },
    "mobile.stop": async () => {
      await mobile.stop();
      svc.audit("mobile", "stop", true);
      pushState();
      return mobile.status();
    },
    "mobile.rotateKey": () => {
      mobile.rotateKey(newCampusKey());
      svc.audit("mobile", "rotateKey", true);
      pushState();
      return mobile.status();
    },
    // 学业预警
    "warn.import": (p) => importDataset(p.dataset, p.path, p.sheet, p.mapping),
    "warn.clear": (p) => {
      if (!import_ipc_contracts6.CA_DATASETS.includes(p?.dataset)) throw new Error((0, import_i18n12.t)("\u672A\u77E5\u6570\u636E\u7C7B\u578B"));
      store.setData(p.dataset, []);
      store.update((s) => {
        s.datasets[p.dataset] = null;
      });
      markStale((0, import_i18n12.t)("\u6570\u636E\u5DF2\u7ECF\u66F4\u65B0"));
      pushState();
      return true;
    },
    "warn.demo": () => {
      const files = writeDemoStudents(outputDir((0, import_node_path7.join)((0, import_i18n12.t)("\u793A\u4F8B\u6570\u636E"), (0, import_i18n12.t)("\u5B66\u4E1A\u9884\u8B66"))));
      importDataset("roster", files.roster);
      importDataset("grades", files.grades);
      importDataset("attendance", files.attendance);
      return { dir: outputDir((0, import_node_path7.join)((0, import_i18n12.t)("\u793A\u4F8B\u6570\u636E"), (0, import_i18n12.t)("\u5B66\u4E1A\u9884\u8B66"))), students: files.students };
    },
    "warn.roles": () => Object.fromEntries(["studentId", "name", "className", "college", "major", "counselor", "counselorEmail", "course", "score", "credit", "term", "status", "absent", "total"].map((r) => [r, roleLabel(r)])),
    "warn.compute": () => compute(),
    "warn.results": () => results(),
    "warn.review": (p) => {
      review(p.ids, p.status, p.level, p.note);
      return true;
    },
    "warn.notices": (p) => writeNotices(p?.ids, p?.useModel !== false),
    "warn.export": () => exportWarn(),
    "warn.mailPlan": () => mailPlan(),
    "warn.mailSend": (p) => mailSend(!!p?.confirm),
    "warn.rules": (p) => {
      const rules = normalizeWarnRules({ ...store.read().settings.warnRules, ...p?.rules || {} });
      store.update((s) => {
        s.settings.warnRules = rules;
      });
      markStale((0, import_i18n12.t)("\u9884\u8B66\u89C4\u5219\u5DF2\u7ECF\u6539\u8FC7"));
      pushState();
      return rules;
    },
    // 学校档案
    "brand.logo": (p) => {
      const src = String(p?.path || "");
      const ext = (0, import_node_path7.extname)(src).toLowerCase();
      if (!src || !(0, import_node_fs6.existsSync)(src)) throw new Error((0, import_i18n12.t)("\u6587\u4EF6\u4E0D\u5B58\u5728\uFF1A{p0}", { p0: src }));
      if (!LOGO_MIME[ext]) throw new Error((0, import_i18n12.t)("\u6821\u5FBD\u8BF7\u7528 PNG\u3001JPG\u3001WebP \u6216 SVG \u56FE\u7247"));
      if ((0, import_node_fs6.statSync)(src).size > 3 * 1024 * 1024) throw new Error((0, import_i18n12.t)("\u6821\u5FBD\u56FE\u7247\u4E0D\u80FD\u8D85\u8FC7 3MB"));
      const dest = (0, import_node_path7.join)(store.dir("brand"), `logo-${Date.now()}${ext}`);
      (0, import_node_fs6.copyFileSync)(src, dest);
      const old = store.read().settings.profile.logoPath;
      store.update((s) => {
        s.settings.profile.logoPath = dest;
      });
      if (old && old !== dest && old.startsWith(store.dir("brand"))) (0, import_node_fs6.rmSync)(old, { force: true });
      svc.audit("ops", "brand.logo", true);
      pushState();
      return true;
    },
    "brand.logoClear": () => {
      const old = store.read().settings.profile.logoPath;
      store.update((s) => {
        s.settings.profile.logoPath = "";
      });
      if (old && old.startsWith(store.dir("brand"))) (0, import_node_fs6.rmSync)(old, { force: true });
      pushState();
      return true;
    },
    // 设置 / 运维
    "settings.patch": (p) => {
      const r = store.update((s) => {
        const { warnRules: _w, profile, ...rest } = p?.patch || {};
        const nextProfile = profile ? normalizeProfile({ ...s.settings.profile, ...profile, logoPath: s.settings.profile.logoPath }) : s.settings.profile;
        s.settings = normalizeSettings({ ...s.settings, ...rest, profile: nextProfile });
        return s.settings;
      });
      svc.audit("ops", "settings", true);
      pushState();
      return r;
    },
    "model.test": async () => {
      const started = Date.now();
      try {
        const r = await wbLlm.llm("ops", (0, import_i18n12.t)("\u8BF7\u53EA\u56DE\u590D\u4E24\u4E2A\u5B57\uFF1A\u6B63\u5E38"), 6e4);
        svc.audit("ops", "model.test", true, started);
        return { ok: true, model: r.model || wbLlm.defaultModel(), ms: Date.now() - started, reply: r.text.slice(0, 40) };
      } catch (e) {
        svc.audit("ops", "model.test", false, started, e?.message);
        return { ok: false, model: wbLlm.defaultModel(), ms: Date.now() - started, error: (0, import_userFacingError.userFacingError)(e) };
      }
    },
    "privacy.purgeExpired": () => svc.purgeExpired(),
    "privacy.purgeQa": () => {
      const n = store.updateQa((list) => {
        const k = list.length;
        list.splice(0);
        return k;
      });
      svc.audit("ops", "qa.purgeAll", true, void 0, String(n));
      pushState();
      return n;
    }
  };
  import_electron.ipcMain.handle(import_ipc_contracts7.IPC_CHANNELS.WORKBENCH_CA_INVOKE, async (_e, req) => {
    const fn = actions[String(req?.action || "")];
    if (!fn) throw new Error((0, import_i18n12.t)("\u672A\u77E5\u64CD\u4F5C\uFF1A{p0}", { p0: String(req?.action || "") }));
    try {
      return await fn(req.payload ?? {});
    } catch (error) {
      logger?.warn?.("campus-ai", `${req.action} failed`, { error: error?.message });
      throw new Error((0, import_userFacingError.userFacingError)(error));
    }
  });
}

// node_modules/.cache/solutions-build/workbench-campus-ai/entry.main.ts
var hostApi = 2;
var registerFunction = "registerCampusAiHandlers";
function activate(ctx) {
  registerCampusAiHandlers(ctx.host.deps);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  activate,
  hostApi,
  registerFunction
});
