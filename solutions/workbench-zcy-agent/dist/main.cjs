var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
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
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// node_modules/.cache/solutions-build/workbench-zcy-agent/entry.main.ts
var entry_main_exports = {};
__export(entry_main_exports, {
  activate: () => activate,
  hostApi: () => hostApi,
  registerFunction: () => registerFunction
});
module.exports = __toCommonJS(entry_main_exports);

// ../../../totalclaw-solutions/solutions/workbench-zcy-agent/src/main/ipc/zcyAgent.ipc.ts
var import_electron = require("electron");
var import_node_fs2 = require("node:fs");
var import_ipc_contracts = require("npm:@totalclaw/ipc-contracts");
var import_i18n2 = require("npm:@totalclaw/i18n");
var import_userFacingError = require("host:apps/desktop-shell/src/main/utils/userFacingError.ts");
var import_quitRegistry = require("host:apps/desktop-shell/src/main/util/quitRegistry.ts");
var import_workbenchLlm = require("host:apps/desktop-shell/src/main/services/workbenchLlm.ts");

// ../../../totalclaw-solutions/solutions/workbench-zcy-agent/src/main/services/zcyAgent/store.ts
var import_node_fs = require("node:fs");
var import_node_path = require("node:path");
var import_node_crypto = require("node:crypto");
var import_accountScope = require("host:apps/desktop-shell/src/main/services/accountScope.ts");

// ../../../totalclaw-solutions/solutions/workbench-zcy-agent/src/main/services/zcyAgent/logic.ts
var import_i18n = require("npm:@totalclaw/i18n");

// ../../../totalclaw-solutions/solutions/workbench-zcy-agent/src/main/services/zcyAgent/keywords.json
var keywords_default = {
  product: {
    name: ["\u5546\u54C1\u540D\u79F0", "\u54C1\u540D", "\u4EA7\u54C1\u540D\u79F0", "\u540D\u79F0"],
    brand: ["\u54C1\u724C"],
    model: ["\u89C4\u683C\u578B\u53F7", "\u578B\u53F7", "\u89C4\u683C"],
    category: ["\u7C7B\u76EE", "\u54C1\u76EE", "\u5206\u7C7B", "\u54C1\u7C7B"],
    price: ["\u653F\u91C7\u4E91\u552E\u4EF7", "\u552E\u4EF7", "\u9500\u552E\u4EF7", "\u534F\u8BAE\u4EF7", "\u4EF7\u683C", "\u5355\u4EF7"],
    stock: ["\u5E93\u5B58"],
    unit: ["\u8BA1\u91CF\u5355\u4F4D", "\u5355\u4F4D"],
    params: ["\u53C2\u6570", "\u5C5E\u6027", "\u914D\u7F6E"],
    detail: ["\u8BE6\u60C5", "\u63CF\u8FF0", "\u5356\u70B9"],
    images: ["\u56FE\u7247", "\u4E3B\u56FE"],
    jd: ["\u4EAC\u4E1C"],
    tmall: ["\u5929\u732B"],
    suning: ["\u82CF\u5B81"],
    refPrice: ["\u7535\u5546\u4EF7", "\u53C2\u8003\u4EF7", "\u5E02\u573A\u4EF7", "\u81EA\u8425\u4EF7"]
  },
  order: {
    orderNo: ["\u8BA2\u5355\u7F16\u53F7", "\u8BA2\u5355\u53F7"],
    buyer: ["\u91C7\u8D2D\u5355\u4F4D", "\u91C7\u8D2D\u4EBA", "\u4E70\u5BB6", "\u5BA2\u6237"],
    buyerTaxNo: ["\u7EDF\u4E00\u793E\u4F1A\u4FE1\u7528\u4EE3\u7801", "\u7EB3\u7A0E\u4EBA\u8BC6\u522B\u53F7", "\u7A0E\u53F7"],
    amount: ["\u8BA2\u5355\u91D1\u989D", "\u6210\u4EA4\u91D1\u989D", "\u5B9E\u4ED8\u91D1\u989D", "\u91D1\u989D"],
    createdAt: ["\u4E0B\u5355\u65F6\u95F4", "\u521B\u5EFA\u65F6\u95F4", "\u8BA2\u5355\u65F6\u95F4"],
    status: ["\u8BA2\u5355\u72B6\u6001", "\u72B6\u6001"],
    items: ["\u5546\u54C1\u540D\u79F0", "\u5546\u54C1", "\u8D27\u7269\u540D\u79F0"],
    logisticsCompany: ["\u7269\u6D41\u516C\u53F8", "\u5FEB\u9012\u516C\u53F8"],
    logisticsNo: ["\u7269\u6D41\u5355\u53F7", "\u8FD0\u5355\u53F7", "\u5FEB\u9012\u5355\u53F7"]
  },
  orderStatus: {
    to_accept: ["\u5F85\u63A5\u5355", "\u5F85\u786E\u8BA4", "\u5F85\u4F9B\u5E94\u5546\u786E\u8BA4"],
    to_ship: ["\u5F85\u53D1\u8D27", "\u5DF2\u63A5\u5355", "\u5907\u8D27"],
    shipped: ["\u5DF2\u53D1\u8D27", "\u5F85\u6536\u8D27", "\u5F85\u9A8C\u6536", "\u914D\u9001\u4E2D"],
    to_settle: ["\u5F85\u7ED3\u7B97", "\u5DF2\u9A8C\u6536", "\u5F85\u4ED8\u6B3E", "\u5F85\u652F\u4ED8"],
    to_invoice: ["\u5F85\u5F00\u7968"],
    done: ["\u5DF2\u5B8C\u6210", "\u4EA4\u6613\u6210\u529F", "\u5DF2\u7ED3\u7B97"],
    closed: ["\u5DF2\u53D6\u6D88", "\u5DF2\u5173\u95ED", "\u5DF2\u62D2\u5355", "\u5DF2\u9000\u5355"]
  },
  selfRunHosts: {
    jd: ["jd.com"],
    tmall: ["tmall.com", "tmall.hk"],
    suning: ["suning.com"]
  },
  adWords: ["\u6700\u4FBF\u5B9C", "\u6700\u4F4E\u4EF7", "\u5168\u7F51\u6700\u4F4E", "\u7B2C\u4E00", "\u9876\u7EA7", "\u6781\u54C1", "\u56FD\u5BB6\u7EA7", "\u4E16\u754C\u7EA7", "\u6700\u4F73", "\u6700\u597D", "\u5305\u90AE", "\u79D2\u6740", "\u7279\u4EF7", "\u4FC3\u9500", "\u6E05\u4ED3", "\u5047\u4E00\u8D54\u5341", "\u5382\u5BB6\u76F4\u9500"],
  restrictedWords: ["\u51CF\u80A5", "\u964D\u7CD6", "\u9632\u7206", "\u8B66\u7528", "\u6D88\u9632"],
  jilinExtraWords: ["\u51CF\u8102"],
  contactPattern: "(\u5FAE\u4FE1|QQ|\u52A0V|\u7535\u8BDD|\u624B\u673A|\u8054\u7CFB\u65B9\u5F0F)\\s*[:\uFF1A]?\\s*[0-9A-Za-z_-]{5,}"
};

// ../../../totalclaw-solutions/solutions/workbench-zcy-agent/src/main/services/zcyAgent/logic.ts
var K = keywords_default;
var cents = (v) => Math.round((Number(v) || 0) * 100);
var yuan = (c) => Math.round(c) / 100;
function toNum(v) {
  if (typeof v === "number") return Number.isFinite(v) ? v : 0;
  const n = Number(String(v ?? "").replace(/[,，\s¥￥元]/g, ""));
  return Number.isFinite(n) ? n : 0;
}
function defaultRegions() {
  const base = { imageMinSide: 800, imageMin: 1, imageMaxKb: 3072, priceRule: "avg", priceTolerance: 0, refMin: 1, acceptHours: 24, titleMax: 60, titleOrder: "brand_first", reviewDays: 0, bannedWords: [...K.restrictedWords] };
  return [
    // 吉林放第一位（默认）：出处是吉林省公共资源交易中心《政采云协议商品上架指南》
    { ...base, id: "jilin", name: (0, import_i18n.t)("\u5409\u6797"), titleOrder: "name_first", reviewDays: 3, bannedWords: [...K.restrictedWords, ...K.jilinExtraWords], note: (0, import_i18n.t)("\u5409\u6797\u7701\u4E0A\u67B6\u6307\u5357\uFF1A\u6807\u9898\u300C\u5546\u54C1-\u54C1\u724C-\u578B\u53F7\u300D\uFF1B\u4E3B\u56FE\u81F3\u5C11 1 \u5F20\u3001JPG / PNG\u3001\u5355\u5F20\u5C0F\u4E8E 3M\u3001\u4E0D\u5C11\u4E8E 800\xD7800\uFF1B\u9500\u552E\u4EF7\u683C\u4E0D\u5F97\u9AD8\u4E8E\u5E02\u573A\u4EF7\u683C\uFF0C\u7535\u5546\u94FE\u63A5\u4F18\u5148\u586B\u4EAC\u4E1C\u3001\u82CF\u5B81\u3001\u5929\u732B\u81EA\u8425\uFF0C\u6CA1\u6709\u81EA\u8425\u53EF\u586B\u65D7\u8230\u5E97\u3001\u4E13\u5356\u5E97\u3001\u4E13\u8425\u5E97\uFF1B\u4E0A\u67B6\u7533\u8BF7 3 \u4E2A\u5DE5\u4F5C\u65E5\u5185\u786E\u8BA4\uFF1B\u4E0D\u5F97\u8DE8\u7C7B\u76EE\u3001\u8D85\u8303\u56F4\u4E0A\u67B6") },
    { ...base, id: "general", name: (0, import_i18n.t)("\u901A\u7528\uFF08\u4ECE\u4E25\uFF09"), note: (0, import_i18n.t)("\u4E0D\u786E\u5B9A\u672C\u533A\u5212\u53E3\u5F84\u65F6\u7528\u8FD9\u5957\uFF1A\u552E\u4EF7\u4E0D\u5F97\u9AD8\u4E8E\u4EAC\u4E1C\u3001\u5929\u732B\u3001\u82CF\u5B81\u81EA\u8425\u4EF7\u7684\u5747\u503C") },
    { ...base, id: "zhejiang", name: (0, import_i18n.t)("\u6D59\u6C5F"), priceTolerance: 0.1, note: (0, import_i18n.t)("\u4EE5\u4E09\u5BB6\u81EA\u8425\u6700\u4F4E 3 \u4E2A\u4EF7\u683C\u7684\u5747\u4EF7\u4E3A\u57FA\u51C6\uFF0C\u9AD8\u51FA 10% \u5373\u4EF7\u683C\u8FDD\u7EA6\uFF08\u6263\u8BDA\u4FE1\u5206\u3001\u6682\u505C\u4EA4\u6613\uFF09") },
    { ...base, id: "anhui", name: (0, import_i18n.t)("\u5B89\u5FBD\uFF08\u5FBD\u91C7\u4E91\uFF09"), note: (0, import_i18n.t)("\u9AD8\u4E8E\u81EA\u8425\u5747\u4EF7\u5373\u7981\u6B62\u4E0A\u67B6\uFF1B180 \u5929\u65E0\u6210\u4EA4\u4E14\u65E0\u7F16\u8F91\u7684\u5546\u54C1\u4F1A\u88AB\u4E0B\u67B6\uFF1B\u672A\u6309\u65F6\u54CD\u5E94\u8BA2\u5355\u7D2F\u8BA1 5 \u6B21\u8D77\u6BCF\u6B21\u6263 20 \u5206") },
    { ...base, id: "yunnan", name: (0, import_i18n.t)("\u4E91\u5357"), imageMin: 2, imageMaxKb: 1024, note: (0, import_i18n.t)("\u4E3B\u56FE\u81F3\u5C11 2 \u5F20\u5B9E\u62CD\u3001\u4E0D\u8D85\u8FC7 1M\u3001\u65E0\u6C34\u5370\u65E0\u62FC\u63A5") }
  ];
}
function composeTitle(p, order = "brand_first") {
  const name = String(p.name || "").trim();
  const part = (v) => {
    const x = String(v || "").trim();
    return x && !name.includes(x) ? x : "";
  };
  const parts = order === "name_first" ? [name, part(p.brand), part(p.model)] : [part(p.brand), name, part(p.model)];
  return parts.filter(Boolean).join(" ");
}
function refPlatform(url) {
  let host = "";
  try {
    host = new URL(/^https?:\/\//i.test(url) ? url : `https://${url}`).hostname.toLowerCase();
  } catch {
    return "other";
  }
  for (const p of ["jd", "tmall", "suning"]) if (K.selfRunHosts[p].some((h) => host === h || host.endsWith(`.${h}`))) return p;
  return "other";
}
function priceBaseline(refs, rule) {
  const prices = refs.filter((r) => r.platform !== "other" && r.price > 0).map((r) => cents(r.price)).sort((a, b) => a - b);
  if (!prices.length) return { baseline: 0, count: 0 };
  if (rule.priceRule === "min") return { baseline: yuan(prices[0]), count: prices.length };
  const use = prices.slice(0, 3);
  return { baseline: yuan(Math.floor(use.reduce((n, x) => n + x, 0) / use.length)), count: prices.length };
}
function bannedHits(text, rule) {
  const words = [.../* @__PURE__ */ new Set([...rule.bannedWords, ...K.adWords])].filter(Boolean);
  return words.filter((w) => text.includes(w));
}
function checkProduct(p, rule) {
  const out = [];
  const err = (code, message) => out.push({ level: "error", code, message });
  const warn = (code, message) => out.push({ level: "warning", code, message });
  if (!p.name) err("name_missing", (0, import_i18n.t)("\u6CA1\u6709\u5546\u54C1\u540D\u79F0"));
  if (!p.brand) err("brand_missing", (0, import_i18n.t)("\u6CA1\u6709\u54C1\u724C\uFF1A\u653F\u91C7\u4E91\u4E0A\u67B6\u8981\u5148\u6709\u54C1\u724C\uFF0C\u6807\u9898\u91CC\u4E5F\u8981\u5E26"));
  if (!p.model) warn("model_missing", (0, import_i18n.t)("\u6CA1\u6709\u578B\u53F7\uFF1A\u540C\u54C1\u724C\u591A\u4E2A\u5546\u54C1\u65F6\u5BB9\u6613\u88AB\u5224\u91CD\u590D\u94FA\u8D27"));
  if (!p.category) err("category_missing", (0, import_i18n.t)("\u6CA1\u6709\u7C7B\u76EE\uFF1A\u6570\u5B57\u5458\u5DE5\u4E0D\u77E5\u9053\u53D1\u5E03\u5230\u54EA\u4E2A\u7C7B\u76EE\u4E0B"));
  const title = p.title || composeTitle(p, rule.titleOrder);
  if (title.length > rule.titleMax) err("title_long", (0, import_i18n.t)("\u6807\u9898 {p0} \u4E2A\u5B57\uFF0C\u8D85\u8FC7 {p1} \u4E2A\u5B57", { p0: title.length, p1: rule.titleMax }));
  if (p.brand && !title.includes(p.brand)) warn("title_no_brand", (0, import_i18n.t)("\u6807\u9898\u91CC\u6CA1\u6709\u54C1\u724C\u300C{p0}\u300D", { p0: p.brand }));
  if (p.model && !title.includes(p.model)) warn("title_no_model", (0, import_i18n.t)("\u6807\u9898\u91CC\u6CA1\u6709\u578B\u53F7\u300C{p0}\u300D", { p0: p.model }));
  const hits = bannedHits(`${title}
${p.detail}
${p.params}`, rule);
  if (hits.length) err("banned_words", (0, import_i18n.t)("\u6807\u9898\u6216\u8BE6\u60C5\u91CC\u6709\u7981\u7528\u8BCD\uFF1A{p0}", { p0: hits.join("\u3001") }));
  if (new RegExp(K.contactPattern, "i").test(`${title}
${p.detail}`)) err("contact_info", (0, import_i18n.t)("\u6807\u9898\u6216\u8BE6\u60C5\u91CC\u6709\u8054\u7CFB\u65B9\u5F0F\uFF0C\u4F1A\u88AB\u9A73\u56DE"));
  if (!(p.price > 0)) err("price_missing", (0, import_i18n.t)("\u6CA1\u6709\u552E\u4EF7"));
  const selfRun = p.refs.filter((r) => r.platform !== "other" && r.url);
  const other = p.refs.filter((r) => r.platform === "other" && r.url);
  if (other.length) warn("ref_not_selfrun", (0, import_i18n.t)("\u6709 {p0} \u6761\u6BD4\u4EF7\u94FE\u63A5\u4E0D\u662F\u4EAC\u4E1C\u3001\u5929\u732B\u3001\u82CF\u5B81\u7684\u7AD9\u70B9\uFF0C\u4E0D\u7B97\u6570", { p0: other.length }));
  if (selfRun.length < rule.refMin) err("ref_missing", (0, import_i18n.t)("\u6BD4\u4EF7\u94FE\u63A5\u4E0D\u591F\uFF1A\u81F3\u5C11\u8981 {p0} \u6761\u4EAC\u4E1C / \u5929\u732B / \u82CF\u5B81\u81EA\u8425\u7684\u540C\u6B3E\u94FE\u63A5\uFF0C\u73B0\u5728 {p1} \u6761", { p0: rule.refMin, p1: selfRun.length }));
  if (selfRun.some((r) => !(r.price > 0))) err("ref_price_missing", (0, import_i18n.t)("\u6709\u6BD4\u4EF7\u94FE\u63A5\u6CA1\u586B\u5BF9\u65B9\u7684\u552E\u4EF7\uFF0C\u7B97\u4E0D\u51FA\u57FA\u51C6"));
  const { baseline } = priceBaseline(p.refs, rule);
  if (baseline > 0 && p.price > 0) {
    const line = yuan(Math.floor(cents(baseline) * (1 + rule.priceTolerance)));
    if (cents(p.price) > cents(line)) err("price_over", (0, import_i18n.t)("\u552E\u4EF7 {p0} \u5143\u9AD8\u4E8E\u6BD4\u4EF7\u7EBF {p1} \u5143\uFF08\u57FA\u51C6 {p2} \u5143\uFF09\uFF0C\u4F1A\u88AB\u5224\u4EF7\u683C\u8FDD\u89C4", { p0: p.price, p1: line, p2: baseline }));
    else if (cents(p.price) > cents(baseline)) warn("price_above_base", (0, import_i18n.t)("\u552E\u4EF7 {p0} \u5143\u9AD8\u4E8E\u81EA\u8425\u57FA\u51C6\u4EF7 {p1} \u5143\uFF0C\u8FD8\u5728\u5BB9\u5FCD\u7EBF\u5185\uFF0C\u5EFA\u8BAE\u964D\u5230\u57FA\u51C6\u4EE5\u4E0B", { p0: p.price, p1: baseline }));
  }
  if (p.images.length < rule.imageMin) err("image_few", (0, import_i18n.t)("\u4E3B\u56FE\u81F3\u5C11 {p0} \u5F20\uFF0C\u73B0\u5728 {p1} \u5F20", { p0: rule.imageMin, p1: p.images.length }));
  for (const im of p.images) {
    const name = im.path.split(/[\\/]/).pop() || im.path;
    if (!/\.(jpe?g|png)$/i.test(im.path)) err("image_type", (0, import_i18n.t)("{p0} \u4E0D\u662F JPG / PNG", { p0: name }));
    if (im.width && Math.min(im.width, im.height) < rule.imageMinSide) err("image_small", (0, import_i18n.t)("{p0} \u53EA\u6709 {p1}\xD7{p2}\uFF0C\u6700\u77ED\u8FB9\u8981 {p3} \u4EE5\u4E0A", { p0: name, p1: im.width, p2: im.height, p3: rule.imageMinSide }));
    if (im.kb > rule.imageMaxKb) err("image_big", (0, import_i18n.t)("{p0} \u6709 {p1}KB\uFF0C\u8D85\u8FC7 {p2}KB", { p0: name, p1: im.kb, p2: rule.imageMaxKb }));
    if (!im.width) warn("image_unread", (0, import_i18n.t)("{p0} \u8BFB\u4E0D\u51FA\u5C3A\u5BF8\uFF0C\u6587\u4EF6\u53EF\u80FD\u4E0D\u5728\u4E86", { p0: name }));
  }
  if (!(p.stock > 0)) warn("stock_zero", (0, import_i18n.t)("\u5E93\u5B58\u662F 0"));
  if (!p.params.trim()) warn("params_empty", (0, import_i18n.t)("\u6CA1\u6709\u53C2\u6570\uFF1A\u5E26\u300C\u6807\u300D\u7684\u7C7B\u76EE\u8981\u628A\u53C2\u6570\u8865\u5168\u624D\u80FD\u8FC7\u5BA1"));
  return out;
}
function strayNumbers(detail, source) {
  const have = new Set(source.match(/\d+(?:\.\d+)?/g) || []);
  return [...new Set((detail.match(/\d+(?:\.\d+)?/g) || []).filter((n) => !have.has(n) && n.length > 1))];
}
function priceInquiry(inq) {
  const issues = [];
  const items = inq.items.map((it) => {
    const cost = cents(it.cost);
    if (!(cost > 0)) {
      issues.push({ level: "error", code: "cost_missing", message: (0, import_i18n.t)("\u300C{p0}\u300D\u8FD8\u6CA1\u586B\u6210\u672C\uFF0C\u7B97\u4E0D\u4E86\u62A5\u4EF7", { p0: it.name }) });
      return { ...it, quote: 0 };
    }
    let quote = Math.ceil(cost * (1 + inq.margin) - 1e-6);
    const ceiling = cents(it.ceiling);
    if (ceiling > 0 && ceiling < cost) issues.push({ level: "error", code: "ceiling_below_cost", message: (0, import_i18n.t)("\u300C{p0}\u300D\u6700\u9AD8\u9650\u4EF7 {p1} \u5143\u4F4E\u4E8E\u6210\u672C {p2} \u5143\uFF0C\u62A5\u4E86\u5C31\u4E8F", { p0: it.name, p1: it.ceiling, p2: it.cost }) });
    if (ceiling > 0 && quote > ceiling) {
      quote = ceiling;
      if (ceiling >= cost) issues.push({ level: "warning", code: "capped", message: (0, import_i18n.t)("\u300C{p0}\u300D\u6309\u6700\u9AD8\u9650\u4EF7 {p1} \u5143\u62A5\uFF0C\u6BDB\u5229\u7387\u53EA\u6709 {p2}%", { p0: it.name, p1: it.ceiling, p2: Math.round((ceiling - cost) / cost * 1e3) / 10 }) });
    }
    return { ...it, quote: yuan(quote) };
  });
  const total = yuan(items.reduce((n, it) => n + Math.round(cents(it.quote) * (it.qty || 0)), 0));
  if (inq.budget > 0 && cents(total) > cents(inq.budget)) issues.push({ level: "error", code: "over_budget", message: (0, import_i18n.t)("\u62A5\u4EF7\u5408\u8BA1 {p0} \u5143\u8D85\u8FC7\u9884\u7B97 {p1} \u5143", { p0: total, p1: inq.budget }) });
  if (items.some((it) => !(it.qty > 0))) issues.push({ level: "warning", code: "qty_missing", message: (0, import_i18n.t)("\u6709\u660E\u7EC6\u6CA1\u6709\u6570\u91CF\uFF0C\u5408\u8BA1\u4E0D\u51C6") });
  return { items, total, issues };
}
var HOUR = 36e5;
function buildAlerts(input) {
  const out = [];
  const { now, rule } = input;
  for (const o of input.orders) {
    const t = Date.parse(o.createdAt);
    if (o.status === "to_accept") {
      if (!Number.isFinite(t)) {
        out.push({ level: "warning", kind: "order_accept", refId: o.id, text: (0, import_i18n.t)("\u8BA2\u5355 {p0} \u5F85\u63A5\u5355\uFF08\u8BFB\u4E0D\u51FA\u4E0B\u5355\u65F6\u95F4\uFF0C\u5C3D\u5FEB\u5904\u7406\uFF09", { p0: o.orderNo }) });
        continue;
      }
      const left = rule.acceptHours - (now - t) / HOUR;
      if (left <= 0) out.push({ level: "error", kind: "order_accept", refId: o.id, text: (0, import_i18n.t)("\u8BA2\u5355 {p0} \u5DF2\u8D85\u8FC7 {p1} \u5C0F\u65F6\u63A5\u5355\u65F6\u9650", { p0: o.orderNo, p1: rule.acceptHours }) });
      else out.push({ level: left <= rule.acceptHours / 2 ? "error" : "warning", kind: "order_accept", refId: o.id, text: (0, import_i18n.t)("\u8BA2\u5355 {p0} \u5F85\u63A5\u5355\uFF0C\u8FD8\u5269 {p1} \u5C0F\u65F6", { p0: o.orderNo, p1: Math.max(1, Math.floor(left)) }) });
    } else if (o.status === "to_ship" && Number.isFinite(t) && now - t > 48 * HOUR) {
      out.push({ level: "warning", kind: "order_ship", refId: o.id, text: (0, import_i18n.t)("\u8BA2\u5355 {p0} \u4E0B\u5355\u5DF2\u8D85\u8FC7 48 \u5C0F\u65F6\u8FD8\u6CA1\u53D1\u8D27", { p0: o.orderNo }) });
    }
  }
  for (const q of input.inquiries) {
    if (!["new", "priced", "confirmed", "handed"].includes(q.status)) continue;
    const t = Date.parse(q.deadline);
    if (!Number.isFinite(t)) continue;
    const left = (t - now) / HOUR;
    if (left <= 0) out.push({ level: "error", kind: "inquiry_deadline", refId: q.id, text: (0, import_i18n.t)("\u8BE2\u4EF7\u5355\u300C{p0}\u300D\u5DF2\u8FC7\u62A5\u4EF7\u622A\u6B62\u65F6\u95F4", { p0: q.title || q.no }) });
    else if (left <= 24) out.push({ level: "error", kind: "inquiry_deadline", refId: q.id, text: (0, import_i18n.t)("\u8BE2\u4EF7\u5355\u300C{p0}\u300D\u8FD8\u5269 {p1} \u5C0F\u65F6\u622A\u6B62", { p0: q.title || q.no, p1: Math.max(1, Math.floor(left)) }) });
    else if (left <= 72) out.push({ level: "warning", kind: "inquiry_deadline", refId: q.id, text: (0, import_i18n.t)("\u8BE2\u4EF7\u5355\u300C{p0}\u300D\u8FD8\u5269 {p1} \u5929\u622A\u6B62", { p0: q.title || q.no, p1: Math.floor(left / 24) }) });
  }
  for (const q of input.company.qualifications) {
    if (!q.expireAt) continue;
    const t = Date.parse(`${q.expireAt}T23:59:59`);
    if (!Number.isFinite(t)) continue;
    const days = Math.floor((t - now) / (24 * HOUR));
    if (days < 0) out.push({ level: "error", kind: "qualification", refId: q.id, text: (0, import_i18n.t)("\u8D44\u8D28\u300C{p0}\u300D\u5DF2\u8FC7\u671F", { p0: q.name }) });
    else if (days <= 30) out.push({ level: "warning", kind: "qualification", refId: q.id, text: (0, import_i18n.t)("\u8D44\u8D28\u300C{p0}\u300D\u8FD8\u6709 {p1} \u5929\u5230\u671F", { p0: q.name, p1: days }) });
  }
  for (const p of input.products) {
    if (p.status !== "listed") continue;
    const { baseline } = priceBaseline(p.refs, rule);
    if (baseline > 0 && cents(p.price) > Math.floor(cents(baseline) * (1 + rule.priceTolerance))) {
      out.push({ level: "error", kind: "price", refId: p.id, text: (0, import_i18n.t)("\u5728\u552E\u5546\u54C1\u300C{p0}\u300D\u552E\u4EF7 {p1} \u5143\u9AD8\u4E8E\u6BD4\u4EF7\u7EBF\uFF08\u57FA\u51C6 {p2} \u5143\uFF09\uFF0C\u62BD\u68C0\u4F1A\u88AB\u5904\u7F5A", { p0: p.title || p.name, p1: p.price, p2: baseline }) });
    }
  }
  return out.sort((a, b) => a.level === b.level ? 0 : a.level === "error" ? -1 : 1);
}
var nh = (h) => String(h || "").replace(/[\s:：*()（）]/g, "").toLowerCase();
function detectCols(headers, table) {
  const out = {};
  const used = /* @__PURE__ */ new Set();
  for (const pass of ["exact", "include"]) {
    for (const [key, kws] of Object.entries(table)) {
      if (out[key]) continue;
      for (const kw of kws) {
        const hit = headers.find((h) => !used.has(h) && (pass === "exact" ? nh(h) === nh(kw) : nh(h).includes(nh(kw))));
        if (hit) {
          out[key] = hit;
          used.add(hit);
          break;
        }
      }
    }
  }
  return out;
}
function parseProductsTable(table) {
  const m = detectCols(table.headers, K.product);
  if (!m.name) throw new Error((0, import_i18n.t)("\u8FD9\u5F20\u8868\u91CC\u627E\u4E0D\u5230\u5546\u54C1\u540D\u79F0\u4E00\u5217"));
  const g = (r, k) => m[k] ? String(r[m[k]] ?? "").trim() : "";
  return table.rows.map((r) => {
    const refPrice = toNum(g(r, "refPrice"));
    const refs = [];
    for (const k of ["jd", "tmall", "suning"]) {
      const cell = g(r, k);
      if (!cell) continue;
      const url = (cell.match(/https?:\/\/\S+/) || [])[0] || "";
      const price = toNum(cell.replace(url, "")) || (url ? refPrice : toNum(cell));
      if (url) refs.push({ platform: refPlatform(url), url, price });
    }
    return {
      name: g(r, "name"),
      brand: g(r, "brand"),
      model: g(r, "model"),
      category: g(r, "category"),
      price: toNum(g(r, "price")),
      stock: toNum(g(r, "stock")),
      unit: g(r, "unit"),
      params: g(r, "params").replace(/[;；]\s*/g, "\n"),
      detail: g(r, "detail"),
      refs,
      imagePaths: g(r, "images").split(/[\n;；,，|]/).map((x) => x.trim()).filter(Boolean)
    };
  }).filter((p) => p.name);
}
function parseOrderStatus(text) {
  const s = String(text || "").replace(/\s/g, "");
  if (!s) return "";
  for (const [k, kws] of Object.entries(K.orderStatus)) if (kws.some((w) => s.includes(w))) return k;
  return Object.keys(K.orderStatus).includes(s) ? s : "";
}
function parseTime(v) {
  const s = String(v ?? "").trim().replace(/[年月/.]/g, "-").replace(/日/g, " ").replace(/\s+/g, " ");
  const m = /^(\d{4})-(\d{1,2})-(\d{1,2})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2}))?)?/.exec(s);
  if (!m) return "";
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]), Number(m[4] || 0), Number(m[5] || 0), Number(m[6] || 0));
  return Number.isFinite(d.getTime()) ? d.toISOString() : "";
}
function normalizeOrders(list) {
  const orders = [];
  let dropped = 0;
  for (const x of Array.isArray(list) ? list : []) {
    const orderNo = String(x?.orderNo ?? x?.no ?? "").replace(/\s/g, "");
    const status = parseOrderStatus(String(x?.status ?? ""));
    if (!orderNo || !status) {
      dropped += 1;
      continue;
    }
    orders.push({
      orderNo,
      buyer: String(x?.buyer ?? "").trim(),
      buyerTaxNo: String(x?.buyerTaxNo ?? "").replace(/\s/g, "").toUpperCase(),
      amount: toNum(x?.amount),
      createdAt: parseTime(x?.createdAt),
      status,
      items: String(x?.items ?? "").trim().slice(0, 300),
      logisticsCompany: String(x?.logisticsCompany ?? "").trim(),
      logisticsNo: String(x?.logisticsNo ?? "").trim()
    });
  }
  return { orders, dropped };
}
function parseOrdersTable(table) {
  const m = detectCols(table.headers, K.order);
  if (!m.orderNo || !m.status) throw new Error((0, import_i18n.t)("\u8FD9\u5F20\u8868\u91CC\u627E\u4E0D\u5230\u300C\u8BA2\u5355\u7F16\u53F7\u300D\u548C\u300C\u8BA2\u5355\u72B6\u6001\u300D\u4E24\u5217"));
  return normalizeOrders(table.rows.map((r) => Object.fromEntries(Object.entries(m).map(([k, h]) => [k, r[h]]))));
}
function normalizeInquiries(list) {
  const inquiries = [];
  let dropped = 0;
  for (const x of Array.isArray(list) ? list : []) {
    const no = String(x?.no ?? x?.inquiryNo ?? "").replace(/\s/g, "");
    const title = String(x?.title ?? "").trim();
    if (!no && !title) {
      dropped += 1;
      continue;
    }
    const items = (Array.isArray(x?.items) ? x.items : []).map((it) => ({
      name: String(it?.name ?? "").trim(),
      spec: String(it?.spec ?? "").trim(),
      qty: toNum(it?.qty),
      unit: String(it?.unit ?? "").trim(),
      ceiling: toNum(it?.ceiling)
    })).filter((it) => it.name);
    inquiries.push({ no, title, buyer: String(x?.buyer ?? "").trim(), deadline: parseTime(x?.deadline), budget: toNum(x?.budget), url: /^https?:\/\//.test(String(x?.url ?? "")) ? String(x.url) : "", items });
  }
  return { inquiries, dropped };
}
function parseAgentJson(text) {
  const src = String(text || "");
  const blocks = [...src.matchAll(/```(?:json)?\s*([\s\S]*?)```/g)].map((m) => m[1]);
  const candidates = [...blocks.reverse()];
  const a = src.indexOf("[");
  const b = src.lastIndexOf("]");
  if (a >= 0 && b > a) candidates.push(src.slice(a, b + 1));
  for (const c of candidates) {
    try {
      const v = JSON.parse(c.trim());
      if (Array.isArray(v)) return v;
      if (Array.isArray(v?.orders)) return v.orders;
      if (Array.isArray(v?.inquiries)) return v.inquiries;
      if (Array.isArray(v?.items)) return v.items;
    } catch {
    }
  }
  throw new Error((0, import_i18n.t)("\u56DE\u590D\u91CC\u6CA1\u6709\u627E\u5230\u7ED3\u679C\u6E05\u5355\uFF1A\u6570\u5B57\u5458\u5DE5\u53EF\u80FD\u8FD8\u6CA1\u505A\u5B8C\uFF0C\u6216\u8005\u505C\u5728\u767B\u5F55 / \u9A8C\u8BC1\u7801\u4E0A\u4E86"));
}

// ../../../totalclaw-solutions/solutions/workbench-zcy-agent/src/main/services/zcyAgent/store.ts
function newId(prefix) {
  return `${prefix}_${(0, import_node_crypto.randomUUID)().replace(/-/g, "").slice(0, 12)}`;
}
var ZCY_LOGIN_URL = "https://login.zcygov.cn/user-login/";
var ZCY_HOME_URL = "https://www.zcygov.cn/";
var ZCY_JILIN_PORTAL = "http://www.ccgp-jilin.gov.cn/";
function defaultSettings() {
  return {
    company: { name: "", creditCode: "", legalPerson: "", contact: "", phone: "", address: "", bank: "", bankAccount: "", qualifications: [], englishName: "", shortName: "", postcode: "", email: "", contactMobile: "", totalAssets: "", employees: "", income: "", intro: "", registerOrg: "", registerCapital: "", scope: "", onjobCount: "", socialPayCount: "" },
    account: { username: "", hasPassword: false, loginUrl: ZCY_LOGIN_URL, homeUrl: ZCY_HOME_URL, lastFillAt: "" },
    regionId: "jilin",
    regions: defaultRegions(),
    defaultMargin: 0.08,
    invoiceTaxRate: 0.13,
    model: "",
    patrolTimes: []
  };
}
function normalize(raw) {
  const d = defaultSettings();
  const s = raw?.settings || {};
  const arr = (v) => Array.isArray(v) ? v : [];
  const regions = (Array.isArray(s.regions) && s.regions.length ? s.regions : d.regions).map((r) => ({ ...d.regions.find((x) => x.id === r.id) || d.regions[0], ...r }));
  return {
    settings: {
      ...d,
      ...s,
      company: { ...d.company, ...s.company || {}, qualifications: arr(s.company?.qualifications) },
      account: { ...d.account, ...s.account || {}, hasPassword: !!raw?.passwordCipher },
      regions,
      regionId: regions.some((r) => r.id === s.regionId) ? s.regionId : regions[0].id,
      patrolTimes: arr(s.patrolTimes)
    },
    products: arr(raw?.products).map((p) => ({ ...p, images: p.images || [], refs: p.refs || [], issues: p.issues || [] })),
    inquiries: arr(raw?.inquiries).map((q) => ({ ...q, items: q.items || [], issues: q.issues || [] })),
    orders: arr(raw?.orders),
    log: arr(raw?.log),
    workbench: raw?.workbench && typeof raw.workbench === "object" ? { ...raw.workbench, todos: arr(raw.workbench.todos) } : null,
    passwordCipher: typeof raw?.passwordCipher === "string" ? raw.passwordCipher : "",
    lastPatrol: raw?.lastPatrol && typeof raw.lastPatrol === "object" ? raw.lastPatrol : {}
  };
}
var ZcyAgentStore = class {
  constructor(dirOf = () => (0, import_accountScope.accountPath)("zcy-agent")) {
    this.dirOf = dirOf;
  }
  cache = null;
  cacheDir = "";
  root() {
    const d = this.dirOf();
    if (d !== this.cacheDir) {
      this.cache = null;
      this.cacheDir = d;
    }
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
    this.cache.log = this.cache.log.slice(0, 300);
    this.cache.settings.account.hasPassword = !!this.cache.passwordCipher;
    const f = (0, import_node_path.join)(this.root(), "state.json");
    (0, import_node_fs.writeFileSync)(`${f}.tmp`, JSON.stringify(this.cache), "utf-8");
    (0, import_node_fs.renameSync)(`${f}.tmp`, f);
    return out;
  }
};

// ../../../totalclaw-solutions/solutions/workbench-zcy-agent/src/main/services/zcyAgent/prompts.ts
var RULES = [
  "\u786C\u6027\u8981\u6C42\uFF1A",
  "1. \u6211\u5DF2\u7ECF\u5728\u5185\u7F6E\u6D4F\u89C8\u5668\u91CC\u767B\u5F55\u4E86\u653F\u91C7\u4E91\u3002\u5982\u679C\u9875\u9762\u8981\u6C42\u767B\u5F55\u3001\u9A8C\u8BC1\u7801\u3001\u6ED1\u5757\u3001\u77ED\u4FE1\u6216 CA \u8BC1\u4E66\uFF0C\u505C\u4E0B\u6765\u544A\u8BC9\u6211\uFF0C\u4E0D\u8981\u5C1D\u8BD5\u7ED5\u8FC7\uFF0C\u4E5F\u4E0D\u8981\u5411\u6211\u7D22\u8981\u5BC6\u7801\u3002",
  "2. \u4E0B\u9762\u7ED9\u7684\u6587\u5B57\u3001\u4EF7\u683C\u3001\u6570\u91CF\u9010\u5B57\u7167\u6284\uFF0C\u4E0D\u8BB8\u81EA\u5DF1\u6539\u4EF7\u3001\u4E0D\u8BB8\u81EA\u5DF1\u8BA1\u7B97\u3002",
  "3. \u4E0D\u8981\u70B9\u4EFB\u4F55\u6700\u7EC8\u6309\u94AE\uFF08\u63D0\u4EA4\u5BA1\u6838\u3001\u63D0\u4EA4\u62A5\u4EF7\u3001\u786E\u8BA4\u63A5\u5355\u3001\u786E\u8BA4\u53D1\u8D27\u3001\u7B7E\u7AE0\u3001\u786E\u8BA4\u6539\u4EF7\uFF09\uFF1A\u505A\u5230\u90A3\u4E00\u6B65\u524D\u505C\u4E0B\uFF0C\u622A\u56FE\u7ED9\u6211\uFF0C\u7531\u6211\u4EB2\u81EA\u70B9\u3002",
  "4. \u9875\u9762\u4E0A\u7684\u5B57\u6BB5\u548C\u6211\u7ED9\u7684\u5BF9\u4E0D\u4E0A\u3001\u6216\u8005\u6709\u6211\u6CA1\u7ED9\u7684\u5FC5\u586B\u9879\u65F6\uFF0C\u505C\u4E0B\u6765\u628A\u5B57\u6BB5\u540D\u539F\u6587\u5217\u7ED9\u6211\uFF0C\u4E0D\u8981\u7F16\u5185\u5BB9\u586B\u8FDB\u53BB\u3002"
];
var home = (a) => a.homeUrl || "https://www.zcygov.cn/";
function listingInstruction(p, rule, a) {
  return [
    `\u8BF7\u5728\u5185\u7F6E\u6D4F\u89C8\u5668\u6253\u5F00\u653F\u91C7\u4E91\uFF08${home(a)}\uFF09\uFF0C\u8FDB\u5165\u4F9B\u5E94\u5546\u5DE5\u4F5C\u53F0\uFF0C\u53D1\u5E03\u4E00\u4E2A\u5546\u54C1\u3002`,
    "\u8DEF\u5F84\uFF1A\u6211\u7684\u5DE5\u4F5C\u53F0 \u2192 \u5546\u54C1\u4E2D\u5FC3 \u2192 \u5546\u54C1\u7BA1\u7406 \u2192 \u5546\u54C1\u53D1\u5E03\uFF08\u5404\u533A\u5212\u83DC\u5355\u540D\u53EF\u80FD\u7565\u6709\u4E0D\u540C\uFF0C\u627E\u4E0D\u5230\u65F6\u628A\u770B\u5230\u7684\u83DC\u5355\u5217\u7ED9\u6211\uFF09\u3002",
    ...RULES,
    "",
    `\u7C7B\u76EE\uFF1A${p.category}\uFF08\u7C7B\u76EE\u5E26\u300C\u6807\u300D\u7684\u8981\u5F15\u7528\u5E73\u53F0\u5DF2\u6709\u7684\u6807\u51C6\u5546\u54C1\uFF0C\u6309\u54C1\u724C\u548C\u578B\u53F7\u641C\u7D22\u540E\u9009\u62E9\u5B8C\u5168\u4E00\u81F4\u7684\u90A3\u6761\uFF1B\u641C\u4E0D\u5230\u5C31\u505C\u4E0B\u6765\u544A\u8BC9\u6211\uFF1B\u5E26\u300C\u8D44\u300D\u7684\u7C7B\u76EE\u9700\u8981\u8D44\u8D28\uFF0C\u9875\u9762\u63D0\u793A\u7F3A\u8D44\u8D28\u65F6\u505C\u4E0B\u6765\uFF09`,
    `\u54C1\u724C\uFF1A${p.brand}`,
    `\u578B\u53F7\uFF1A${p.model || "\uFF08\u65E0\uFF09"}`,
    `\u5546\u54C1\u6807\u9898\uFF1A${p.title}\uFF08\u7CFB\u7EDF\u6309\u7C7B\u76EE\u81EA\u52A8\u751F\u6210\u6807\u9898\u65F6\u4EE5\u7CFB\u7EDF\u4E3A\u51C6\uFF0C\u628A\u751F\u6210\u7684\u6807\u9898\u544A\u8BC9\u6211\uFF09`,
    `\u552E\u4EF7\uFF1A${p.price} \u5143`,
    `\u5E93\u5B58\uFF1A${p.stock}${p.unit ? ` ${p.unit}` : ""}`,
    p.params.trim() ? `\u53C2\u6570\uFF08\u9010\u9879\u5BF9\u5E94\u9875\u9762\u5B57\u6BB5\u586B\u5199\uFF09\uFF1A
${p.params.trim().split("\n").map((x) => `  - ${x}`).join("\n")}` : "",
    p.detail.trim() ? `\u5546\u54C1\u8BE6\u60C5\uFF1A${p.detail.trim()}` : "",
    "\u7535\u5546\u5E73\u53F0\u6BD4\u4EF7\u94FE\u63A5\uFF08\u586B\u5230\u5BF9\u5E94\u5E73\u53F0\u7684\u8F93\u5165\u6846\uFF09\uFF1A",
    ...p.refs.filter((r) => r.url).map((r) => `  - ${{ jd: "\u4EAC\u4E1C", tmall: "\u5929\u732B", suning: "\u82CF\u5B81", other: "\u5176\u4ED6" }[r.platform]}\uFF1A${r.url}\uFF08\u5BF9\u65B9\u552E\u4EF7 ${r.price} \u5143\uFF09`),
    `\u4E3B\u56FE\uFF08\u6309\u987A\u5E8F\u4E0A\u4F20\uFF0C\u7B2C\u4E00\u5F20\u4E3A\u4E3B\u56FE\uFF1B\u8981\u6C42\u4E0D\u5C0F\u4E8E ${rule.imageMinSide}\xD7${rule.imageMinSide}\uFF09\uFF1A`,
    ...p.images.map((im, i) => `  ${i + 1}. ${im.path}`),
    "",
    "\u586B\u5B8C\u540E\u505C\u5728\u300C\u63D0\u4EA4\u5BA1\u6838\u300D\u524D\uFF0C\u56DE\u590D\u6211\uFF1A\u9875\u9762\u4E0A\u7684\u6807\u9898\u3001\u552E\u4EF7\u3001\u7C7B\u76EE\u5404\u662F\u4EC0\u4E48\uFF0C\u6709\u6CA1\u6709\u7EA2\u5B57\u63D0\u793A\uFF0C\u5E76\u9644\u622A\u56FE\u3002"
  ].filter((x) => x !== "").join("\n");
}
function ordersPatrolInstruction(a) {
  return [
    `\u8BF7\u5728\u5185\u7F6E\u6D4F\u89C8\u5668\u6253\u5F00\u653F\u91C7\u4E91\uFF08${home(a)}\uFF09\uFF0C\u8FDB\u5165\u4F9B\u5E94\u5546\u5DE5\u4F5C\u53F0\uFF0C\u53EA\u8BFB\u53D6\u8BA2\u5355\u5217\u8868\uFF0C\u4E0D\u505A\u4EFB\u4F55\u64CD\u4F5C\u3002`,
    "\u8DEF\u5F84\uFF1A\u4EA4\u6613\u4E2D\u5FC3 \u2192 \u8BA2\u5355\u7BA1\u7406\u3002\u4F9D\u6B21\u67E5\u770B\u300C\u5F85\u63A5\u5355 / \u5F85\u786E\u8BA4\u300D\u300C\u5F85\u53D1\u8D27\u300D\u300C\u5F85\u9A8C\u6536 / \u5DF2\u53D1\u8D27\u300D\u300C\u5F85\u7ED3\u7B97\u300D\u300C\u5F85\u5F00\u7968\u300D\u8FD9\u51E0\u4E2A\u72B6\u6001\u9875\u7B7E\uFF0C\u6BCF\u4E2A\u9875\u7B7E\u8BFB\u7B2C\u4E00\u9875\u3002",
    ...RULES,
    "",
    "\u8BFB\u5B8C\u540E\u53EA\u56DE\u590D\u4E00\u4E2A ```json \u4EE3\u7801\u5757\uFF0C\u5185\u5BB9\u662F\u6570\u7EC4\uFF0C\u6BCF\u4E2A\u8BA2\u5355\u4E00\u4E2A\u5BF9\u8C61\uFF0C\u5B57\u6BB5\uFF1A",
    "  orderNo\uFF08\u8BA2\u5355\u7F16\u53F7\uFF0C\u7167\u6284\uFF09\u3001buyer\uFF08\u91C7\u8D2D\u5355\u4F4D\uFF09\u3001buyerTaxNo\uFF08\u9875\u9762\u4E0A\u6709\u7EDF\u4E00\u793E\u4F1A\u4FE1\u7528\u4EE3\u7801\u624D\u586B\uFF0C\u5426\u5219\u7A7A\u5B57\u7B26\u4E32\uFF09\u3001",
    "  amount\uFF08\u8BA2\u5355\u91D1\u989D\uFF0C\u6570\u5B57\uFF09\u3001createdAt\uFF08\u4E0B\u5355\u65F6\u95F4\uFF0C\u683C\u5F0F 2026-01-31 14:30\uFF09\u3001status\uFF08\u9875\u9762\u4E0A\u7684\u72B6\u6001\u539F\u6587\uFF0C\u5982 \u5F85\u63A5\u5355\uFF09\u3001",
    "  items\uFF08\u5546\u54C1\u540D\u79F0\u4E0E\u6570\u91CF\u7684\u7B80\u8FF0\uFF09\u3001logisticsCompany\u3001logisticsNo\uFF08\u6CA1\u6709\u5C31\u7A7A\u5B57\u7B26\u4E32\uFF09\u3002",
    "\u9875\u9762\u4E0A\u6CA1\u6709\u7684\u5B57\u6BB5\u586B\u7A7A\u5B57\u7B26\u4E32\uFF0C\u4E0D\u8981\u731C\uFF1B\u4E00\u4E2A\u8BA2\u5355\u90FD\u6CA1\u6709\u5C31\u56DE\u590D []\u3002"
  ].join("\n");
}
function inquiriesPatrolInstruction(a) {
  return [
    `\u8BF7\u5728\u5185\u7F6E\u6D4F\u89C8\u5668\u6253\u5F00\u653F\u91C7\u4E91\uFF08${home(a)}\uFF09\uFF0C\u8FDB\u5165\u4F9B\u5E94\u5546\u5DE5\u4F5C\u53F0\uFF0C\u53EA\u8BFB\u53D6\u6211\u80FD\u53C2\u4E0E\u7684\u5728\u7EBF\u8BE2\u4EF7 / \u53CD\u5411\u7ADE\u4EF7\u5355\uFF0C\u4E0D\u505A\u4EFB\u4F55\u64CD\u4F5C\u3002`,
    "\u8DEF\u5F84\uFF1A\u4EA4\u6613\u4E2D\u5FC3 \u2192 \u5728\u7EBF\u8BE2\u4EF7\uFF08\u6216\u300C\u8BE2\u4EF7\u7BA1\u7406\u300D\u300C\u7ADE\u4EF7\u7BA1\u7406\u300D\uFF09\u2192 \u5F85\u62A5\u4EF7 / \u53EF\u53C2\u4E0E\u3002\u8BFB\u7B2C\u4E00\u9875\uFF0C\u9010\u4E2A\u70B9\u8FDB\u8BE6\u60C5\u8BFB\u660E\u7EC6\u3002",
    ...RULES,
    "",
    "\u8BFB\u5B8C\u540E\u53EA\u56DE\u590D\u4E00\u4E2A ```json \u4EE3\u7801\u5757\uFF0C\u5185\u5BB9\u662F\u6570\u7EC4\uFF0C\u6BCF\u5F20\u8BE2\u4EF7\u5355\u4E00\u4E2A\u5BF9\u8C61\uFF0C\u5B57\u6BB5\uFF1A",
    "  no\uFF08\u8BE2\u4EF7\u5355\u53F7\uFF09\u3001title\uFF08\u9879\u76EE\u540D\u79F0\uFF09\u3001buyer\uFF08\u91C7\u8D2D\u5355\u4F4D\uFF09\u3001deadline\uFF08\u62A5\u4EF7\u622A\u6B62\u65F6\u95F4\uFF0C\u683C\u5F0F 2026-01-31 17:00\uFF09\u3001",
    "  budget\uFF08\u9884\u7B97\u6216\u603B\u9650\u4EF7\uFF0C\u6570\u5B57\uFF0C\u6CA1\u6709\u586B 0\uFF09\u3001url\uFF08\u8BE6\u60C5\u9875\u5730\u5740\uFF09\u3001",
    "  items\uFF08\u6570\u7EC4\uFF1Aname \u540D\u79F0\u3001spec \u89C4\u683C\u53C2\u6570\u8981\u6C42\u3001qty \u6570\u91CF\u3001unit \u5355\u4F4D\u3001ceiling \u5355\u4EF7\u6700\u9AD8\u9650\u4EF7\uFF0C\u6CA1\u6709\u586B 0\uFF09\u3002",
    "\u9875\u9762\u4E0A\u6CA1\u6709\u7684\u5B57\u6BB5\u586B\u7A7A\u5B57\u7B26\u4E32\u6216 0\uFF0C\u4E0D\u8981\u731C\uFF1B\u6CA1\u6709\u53EF\u53C2\u4E0E\u7684\u5C31\u56DE\u590D []\u3002"
  ].join("\n");
}
function quoteInstruction(q, a) {
  return [
    `\u8BF7\u5728\u5185\u7F6E\u6D4F\u89C8\u5668\u6253\u5F00\u653F\u91C7\u4E91\uFF08${q.url || home(a)}\uFF09\uFF0C\u5BF9\u8BE2\u4EF7\u5355\u300C${q.title || q.no}\u300D${q.no ? `\uFF08${q.no}\uFF09` : ""}\u586B\u5199\u62A5\u4EF7\u3002`,
    q.url ? "" : "\u8DEF\u5F84\uFF1A\u4EA4\u6613\u4E2D\u5FC3 \u2192 \u5728\u7EBF\u8BE2\u4EF7 \u2192 \u5F85\u62A5\u4EF7\uFF0C\u6309\u5355\u53F7\u627E\u5230\u8FD9\u5F20\u8BE2\u4EF7\u5355\u3002",
    ...RULES,
    "",
    "\u9010\u9879\u586B\u5199\u5355\u4EF7\uFF08\u542B\u7A0E\uFF0C\u5143\uFF09\uFF0C\u7167\u6284\uFF0C\u4E0D\u8981\u6539\uFF1A",
    ...q.items.map((it, i) => `  ${i + 1}. ${it.name}${it.spec ? `\uFF08${it.spec}\uFF09` : ""} \xD7 ${it.qty}${it.unit}\uFF1A\u5355\u4EF7 ${it.quote.toFixed(2)}`),
    `\u62A5\u4EF7\u5408\u8BA1\u5E94\u4E3A ${q.total.toFixed(2)} \u5143\uFF1B\u9875\u9762\u5408\u8BA1\u4E0E\u6B64\u4E0D\u4E00\u81F4\u65F6\u4E0D\u8981\u7EE7\u7EED\uFF0C\u628A\u9875\u9762\u4E0A\u7684\u5408\u8BA1\u544A\u8BC9\u6211\u3002`,
    q.note ? `\u8865\u5145\u8BF4\u660E / \u54CD\u5E94\u8BF4\u660E\uFF1A${q.note}` : "",
    "\u8BE2\u4EF7\u53EA\u6709\u4E00\u8F6E\u62A5\u4EF7\uFF0C\u63D0\u4EA4\u540E\u4E0D\u80FD\u6539\u3002\u505C\u5728\u300C\u63D0\u4EA4\u62A5\u4EF7\u300D\u524D\uFF0C\u622A\u56FE\u7ED9\u6211\uFF0C\u7531\u6211\u4EB2\u81EA\u70B9\u3002"
  ].filter((x) => x !== "").join("\n");
}
function acceptOrderInstruction(o, a) {
  return [
    `\u8BF7\u5728\u5185\u7F6E\u6D4F\u89C8\u5668\u6253\u5F00\u653F\u91C7\u4E91\uFF08${home(a)}\uFF09\uFF0C\u627E\u5230\u8BA2\u5355 ${o.orderNo}\uFF08${o.buyer}\uFF0C${o.amount} \u5143\uFF09\uFF0C\u51C6\u5907\u63A5\u5355\u3002`,
    "\u8DEF\u5F84\uFF1A\u4EA4\u6613\u4E2D\u5FC3 \u2192 \u8BA2\u5355\u7BA1\u7406 \u2192 \u5F85\u63A5\u5355 / \u5F85\u786E\u8BA4\u3002",
    ...RULES,
    "",
    "\u5148\u6838\u5BF9\u8BA2\u5355\u91CC\u7684\u5546\u54C1\u3001\u6570\u91CF\u3001\u91D1\u989D\u3001\u6536\u8D27\u5730\u5740\uFF0C\u628A\u8FD9\u4E9B\u5185\u5BB9\u539F\u6587\u56DE\u590D\u7ED9\u6211\uFF1B\u7136\u540E\u505C\u5728\u300C\u786E\u8BA4\u63A5\u5355\u300D\u524D\uFF0C\u7531\u6211\u4EB2\u81EA\u70B9\u3002\u4E0D\u8981\u6539\u4EF7\uFF0C\u4E0D\u8981\u62D2\u5355\u3002"
  ].join("\n");
}
function shipOrderInstruction(o, a) {
  return [
    `\u8BF7\u5728\u5185\u7F6E\u6D4F\u89C8\u5668\u6253\u5F00\u653F\u91C7\u4E91\uFF08${home(a)}\uFF09\uFF0C\u627E\u5230\u8BA2\u5355 ${o.orderNo}\uFF08${o.buyer}\uFF09\uFF0C\u56DE\u586B\u53D1\u8D27\u4FE1\u606F\u3002`,
    "\u8DEF\u5F84\uFF1A\u4EA4\u6613\u4E2D\u5FC3 \u2192 \u8BA2\u5355\u7BA1\u7406 \u2192 \u5F85\u53D1\u8D27 \u2192 \u53D1\u8D27\u3002",
    ...RULES,
    "",
    `\u7269\u6D41\u516C\u53F8\uFF1A${o.logisticsCompany}`,
    `\u7269\u6D41\u5355\u53F7\uFF1A${o.logisticsNo}`,
    "\u586B\u597D\u540E\u505C\u5728\u300C\u786E\u8BA4\u53D1\u8D27\u300D\u524D\uFF0C\u622A\u56FE\u7ED9\u6211\uFF0C\u7531\u6211\u4EB2\u81EA\u70B9\u3002"
  ].join("\n");
}
function describePrompt(p) {
  return [
    "Write a product description in Simplified Chinese for a government e-procurement marketplace listing.",
    "Style: factual, 80-160 Chinese characters, no marketing superlatives, no promotions, no contact info, no price.",
    "Use ONLY the facts below. Every number in your text must appear in the facts. Do not invent certifications, awards, or specs.",
    "Return plain text only.",
    "",
    `Category: ${p.category}`,
    `Brand: ${p.brand}`,
    `Name: ${p.name}`,
    `Model: ${p.model}`,
    "Specs:",
    p.params || "(none)"
  ].join("\n");
}

// ../../../totalclaw-solutions/solutions/workbench-zcy-agent/src/main/ipc/zcyAgent.ipc.ts
var import_excel = require("host:apps/desktop-shell/src/main/services/serviceSettlement/excel.ts");
var import_invoiceAgent = require("host:apps/desktop-shell/src/main/ipc/invoiceAgent.ipc.ts");
var import_login = require("host:apps/desktop-shell/src/main/services/zcyAgent/login.ts");

// ../../../totalclaw-solutions/solutions/workbench-zcy-agent/src/main/services/zcyAgent/zcyPage.ts
var ZCY_WORKBENCH_URL = "https://middle.zcygov.cn/guide/supplier";
var ZCY_ONBOARD_LIST_URL = "https://middle.zcygov.cn/supplier-v2/#/enter/supplier/list";
var T = {
  identity: /您正在入驻(.+?)[，,]\s*当前身份为[·•\s]*(.+)/,
  temp: "\u4E34\u65F6",
  todoLabels: ["\u534F\u8BAE\u5F85\u529E\u7406", "\u5546\u54C1\u5F85\u4E0A\u67B6", "\u5546\u54C1\u51BB\u7ED3", "\u5F85\u63A5\u5355", "\u5F85\u53D1\u8D27", "\u9000\u6362\u8D27", "\u83B7\u53D6\u91C7\u8D2D\u6587\u4EF6", "\u5F85\u6295\u6807", "\u5F85\u5F00\u6807", "\u5F85\u6F84\u6E05", "\u5F85\u62A5\u4EF7", "\u5408\u540C\u786E\u8BA4"],
  forbidden: "\u65E0\u8BBF\u95EE\u6743\u9650"
};
var WORKBENCH_SCRIPT = `(() => {
  const vis = (el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  const one = (el) => String(el.innerText || '').split(/\\s+/).join(' ').trim();
  const h = Array.from(document.querySelectorAll('h1,h2,h3')).map(one).find((t) => t.indexOf('\u5F53\u524D\u8EAB\u4EFD\u4E3A') >= 0) || '';
  return JSON.stringify({ url: location.href, host: location.hostname, title: document.title, identity: h,
    cards: Array.from(document.querySelectorAll('.store-one')).filter(vis).map(one),
    hasLoginForm: !!document.querySelector('#password, input[type=password]'),
    text: one(document.body || document.documentElement).slice(0, 1500) });
})()`;
function parseWorkbench(raw) {
  let o = {};
  try {
    o = typeof raw === "string" ? JSON.parse(raw) : raw || {};
  } catch {
    o = {};
  }
  const url = String(o.url || "");
  const host = String(o.host || "");
  const onLogin = host === "login.zcygov.cn" || !!o.hasLoginForm;
  const m = T.identity.exec(String(o.identity || ""));
  const todos = [];
  for (const c of Array.isArray(o.cards) ? o.cards : []) {
    const mm = /^(\d+)\s+(.+)$/.exec(String(c).trim());
    if (mm && T.todoLabels.includes(mm[2].trim())) todos.push({ label: mm[2].trim(), count: Number(mm[1]) });
  }
  const identity = m ? m[2].trim() : "";
  return {
    url,
    loggedIn: !onLogin && /(^|\.)zcygov\.cn$/.test(host),
    region: m ? m[1].trim() : "",
    identity,
    temporary: identity.includes(T.temp),
    todos,
    onWorkbench: url.startsWith(ZCY_WORKBENCH_URL),
    forbidden: String(o.text || "").includes(T.forbidden)
  };
}
var ONBOARD_FIELDS = [
  { id: "supplierBaseInfo.name", key: "name", label: "\u5546\u5BB6\u5168\u79F0" },
  { id: "supplierBaseInfo.englishName", key: "englishName", label: "\u82F1\u6587\u540D\u79F0" },
  { id: "supplierBaseInfo.abbreviation", key: "shortName", label: "\u5546\u5BB6\u7B80\u79F0" },
  { id: "supplierBaseInfo.bizAddress", key: "address", label: "\u8BE6\u7EC6\u5730\u5740" },
  { id: "supplierBaseInfo.postcode", key: "postcode", label: "\u90AE\u653F\u7F16\u7801" },
  { id: "supplierBaseInfo.contactPhone", key: "phone", label: "\u5BF9\u5916\u8054\u7CFB\u7535\u8BDD" },
  { id: "supplierBaseInfo.enterpriseEmail", key: "email", label: "\u5BF9\u5916\u7535\u5B50\u90AE\u7BB1" },
  { id: "supplierBaseInfo.contactpersonName", key: "contact", label: "\u8054\u7CFB\u4EBA\u59D3\u540D" },
  { id: "supplierBaseInfo.contactpersonPhone", key: "contactMobile", label: "\u8054\u7CFB\u4EBA\u7535\u8BDD" },
  { id: "supplierBaseInfo.bsseTotalAssets", key: "totalAssets", label: "\u4E0A\u5E74\u672B\u8D44\u4EA7\u603B\u989D(\u4E07\u5143)" },
  { id: "supplierBaseInfo.employees", key: "employees", label: "\u4E0A\u5E74\u672B\u4ECE\u4E1A\u4EBA\u5458(\u4EBA)" },
  { id: "supplierBaseInfo.businessIncome", key: "income", label: "\u4E0A\u5E74\u5EA6\u8425\u4E1A\u6536\u5165(\u4E07\u5143)" },
  { id: "supplierBaseInfo.companyIntro", key: "intro", label: "\u5E97\u94FA\u4ECB\u7ECD" },
  { id: "certificateBiz.socialCreditCode", key: "creditCode", label: "\u7EDF\u4E00\u793E\u4F1A\u4FE1\u7528\u4EE3\u7801" },
  { id: "certificateBiz.certificateOrgname", key: "registerOrg", label: "\u767B\u8BB0\u673A\u5173" },
  { id: "certificateBiz.registerCapital", key: "registerCapital", label: "\u6CE8\u518C\u8D44\u91D1(\u4E07\u5143)" },
  { id: "certificateBiz.mainscope", key: "scope", label: "\u7ECF\u8425\u8303\u56F4" },
  { id: "certificateSocialInsurance.onjobQuantity", key: "onjobCount", label: "\u5728\u804C\u4EBA\u6570" },
  { id: "certificateSocialInsurance.socialPayQuantity", key: "socialPayCount", label: "\u793E\u4FDD\u7F34\u8D39\u4EBA\u6570" }
];
var ONBOARD_MANUAL = ["\u5E97\u94FAlogo", "\u8425\u4E1A\u6267\u7167\u767B\u8BB0\u673A\u5173\u6240\u5728\u5730", "\u6240\u5728\u5730\u533A", "\u6240\u5C5E\u7ECF\u6D4E\u884C\u4E1A", "\u5546\u5BB6\u89C4\u6A21", "\u662F\u5426\u6B8B\u75BE\u4EBA\u798F\u5229\u4F01\u4E1A", "\u662F\u5426\u76D1\u72F1\u4F01\u4E1A", "\u7ECF\u6D4E\u6027\u8D28", "\u5546\u5BB6\u7C7B\u578B", "\u662F\u5426\u4E0A\u5E02", "\u662F\u5426\u662F\u54C1\u724C\u5546", "\u8425\u4E1A\u6267\u7167\u626B\u63CF\u4EF6", "\u6210\u7ACB\u65E5\u671F", "\u8BC1\u4EF6\u6709\u6548\u671F", "\u5E01\u79CD", "\u5355\u4F4D\u793E\u4FDD\u7F34\u7EB3\u51ED\u8BC1\u9644\u4EF6", "\u6CD5\u5B9A\u4EE3\u8868\u4EBA\u4FE1\u606F\uFF08\u8EAB\u4EFD\u8BC1\u6B63\u53CD\u9762\u76D6\u7AE0\u626B\u63CF\u4EF6\uFF09", "\u300A\u6CE8\u518C\u58F0\u660E\u300B\u76D6\u7AE0\u626B\u63CF\u4EF6", "\u52FE\u9009\u300C\u672C\u4EBA\u5DF2\u9605\u8BFB\u5E76\u540C\u610F\u300D"];
function isOnboardFormUrl(url) {
  try {
    const u = new URL(url);
    return u.protocol === "https:" && u.hostname === "middle.zcygov.cn" && u.pathname.startsWith("/settle-front") && u.hash.includes("newsettle");
  } catch {
    return false;
  }
}
function onboardFillScript(company, overwrite = false) {
  const pairs = ONBOARD_FIELDS.map((f) => [f.id, f.label, String(company[f.key] ?? "").trim()]).filter((p) => p[2]);
  return `(() => {
  if (location.hostname !== 'middle.zcygov.cn' || location.hash.indexOf('newsettle') < 0) return JSON.stringify({ error: 'not-onboard-form' });
  const pairs = ${JSON.stringify(pairs)};
  const overwrite = ${overwrite ? "true" : "false"};
  const out = { filled: [], same: [], kept: [], missing: [] };
  for (const [id, label, value] of pairs) {
    const el = document.getElementById(id);
    if (!el || (el.tagName !== 'INPUT' && el.tagName !== 'TEXTAREA') || el.disabled || el.readOnly) { out.missing.push(label); continue; }
    const cur = String(el.value || '').trim();
    if (cur === value) { out.same.push(label); continue; }
    if (cur && !overwrite) { out.kept.push([label, cur.slice(0, 60)]); continue; }
    const proto = el.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    const d = Object.getOwnPropertyDescriptor(proto, 'value');
    el.focus(); d.set.call(el, value);
    el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); el.blur();
    out.filled.push(label);
  }
  return JSON.stringify(out);
})()`;
}
function parseFillResult(raw) {
  try {
    const o = typeof raw === "string" ? JSON.parse(raw) : raw || {};
    return { filled: (o.filled || []).map(String), same: (o.same || []).map(String), kept: (o.kept || []).map((x) => [String(x[0]), String(x[1])]), missing: (o.missing || []).map(String), ...o.error ? { error: String(o.error) } : {} };
  } catch {
    return { filled: [], same: [], kept: [], missing: [], error: "bad-result" };
  }
}

// ../../../totalclaw-solutions/solutions/workbench-zcy-agent/src/main/ipc/zcyAgent.ipc.ts
var store = new ZcyAgentStore();
var BROWSER_CONTEXT = "zcy-agent";
function requireFound(v, what) {
  if (v == null) throw new Error((0, import_i18n2.t)("{p0}\u4E0D\u5B58\u5728\u6216\u5DF2\u5220\u9664", { p0: what }));
  return v;
}
function registerZcyAgentHandlers(deps) {
  const logger = deps.logger;
  const win = () => deps.getMainWindow?.() ?? null;
  const pushState = () => {
    try {
      win()?.webContents.send(import_ipc_contracts.IPC_CHANNELS.WORKBENCH_ZC_EVENT, { type: "state" });
    } catch {
    }
  };
  const now = () => (/* @__PURE__ */ new Date()).toISOString();
  const log = (module2, text, ok = true) => {
    store.update((s) => {
      s.log.unshift({ at: now(), module: module2, text, ok });
    });
  };
  const { modelOptions, llm } = (0, import_workbenchLlm.createWorkbenchLlm)(deps, { logTag: "zcy-agent", moduleModel: () => store.read().settings.model || "" });
  const canEncrypt = () => {
    try {
      return import_electron.safeStorage.isEncryptionAvailable();
    } catch {
      return false;
    }
  };
  const rule = () => {
    const s = store.read().settings;
    return s.regions.find((r) => r.id === s.regionId) || s.regions[0];
  };
  const publicState = () => {
    const s = store.read();
    return {
      settings: s.settings,
      products: s.products,
      inquiries: s.inquiries,
      orders: s.orders,
      log: s.log.slice(0, 80),
      secretStorage: canEncrypt(),
      workbench: s.workbench,
      alerts: buildAlerts({ orders: s.orders, inquiries: s.inquiries, products: s.products, company: s.settings.company, rule: rule(), now: Date.now() })
    };
  };
  const productOf = (id) => requireFound(store.read().products.find((p) => p.id === id), (0, import_i18n2.t)("\u5546\u54C1"));
  const inquiryOf = (id) => requireFound(store.read().inquiries.find((q) => q.id === id), (0, import_i18n2.t)("\u8BE2\u4EF7\u5355"));
  const orderOf = (id) => requireFound(store.read().orders.find((o) => o.id === id), (0, import_i18n2.t)("\u8BA2\u5355"));
  const imageInfo = (path) => {
    let width = 0;
    let height = 0;
    let kb = 0;
    try {
      kb = Math.ceil((0, import_node_fs2.statSync)(path).size / 1024);
      const sz = import_electron.nativeImage.createFromPath(path).getSize();
      width = sz.width;
      height = sz.height;
    } catch {
    }
    return { path, width, height, kb };
  };
  const recheck = (p) => {
    if (!p.title) p.title = composeTitle(p, rule().titleOrder);
    p.issues = checkProduct(p, rule());
    if (p.status === "confirmed" && p.issues.some((i) => i.level === "error")) p.status = "draft";
  };
  const recheckAll = () => {
    store.update((s) => {
      for (const p of s.products) if (p.status === "draft" || p.status === "confirmed" || p.status === "rejected") recheck(p);
    });
  };
  function mergeOrders(seeds) {
    let added = 0;
    let updated = 0;
    store.update((s) => {
      for (const x of seeds) {
        const cur = s.orders.find((o) => o.orderNo === x.orderNo);
        if (!cur) {
          s.orders.unshift({ id: newId("zco"), ...x, note: "", updatedAt: now() });
          added += 1;
          continue;
        }
        cur.status = x.status;
        if (x.buyer) cur.buyer = x.buyer;
        if (x.buyerTaxNo) cur.buyerTaxNo = x.buyerTaxNo;
        if (x.amount) cur.amount = x.amount;
        if (x.createdAt) cur.createdAt = x.createdAt;
        if (x.items) cur.items = x.items;
        if (x.logisticsCompany) cur.logisticsCompany = x.logisticsCompany;
        if (x.logisticsNo) cur.logisticsNo = x.logisticsNo;
        cur.updatedAt = now();
        updated += 1;
      }
    });
    return { added, updated };
  }
  function mergeInquiries(seeds) {
    let added = 0;
    let updated = 0;
    const margin = store.read().settings.defaultMargin;
    store.update((s) => {
      for (const x of seeds) {
        const cur = s.inquiries.find((q) => x.no ? q.no === x.no : q.title === x.title);
        if (!cur) {
          s.inquiries.unshift({ id: newId("zcq"), ...x, items: x.items.map((it) => ({ ...it, cost: 0, quote: 0 })), margin, total: 0, status: "new", issues: [], note: "", updatedAt: now() });
          added += 1;
          continue;
        }
        if (x.deadline) cur.deadline = x.deadline;
        if (x.budget) cur.budget = x.budget;
        if (x.url) cur.url = x.url;
        if (cur.status === "new" && x.items.length) cur.items = x.items.map((it) => ({ ...it, cost: cur.items.find((o) => o.name === it.name)?.cost || 0, quote: 0 }));
        cur.updatedAt = now();
        updated += 1;
      }
    });
    return { added, updated };
  }
  const timer = setInterval(() => {
    try {
      const s = store.read();
      if (!s.settings.patrolTimes.length) return;
      const d = /* @__PURE__ */ new Date();
      const hm = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
      const day = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      if (!s.settings.patrolTimes.includes(hm) || s.lastPatrol[hm] === day) return;
      store.update((st) => {
        st.lastPatrol[hm] = day;
      });
      const alerts = publicState().alerts;
      if (import_electron.Notification.isSupported()) {
        new import_electron.Notification({ title: (0, import_i18n2.t)("\u653F\u91C7\u4E91\u5DE1\u68C0\u65F6\u95F4\u5230\u4E86"), body: alerts.length ? (0, import_i18n2.t)("\u6709 {p0} \u6761\u5F85\u5904\u7406\u63D0\u9192\uFF0C\u6253\u5F00\u653F\u91C7\u4E91\u667A\u80FD\u4F53\u8BFB\u56DE\u6700\u65B0\u8BA2\u5355\u4E0E\u8BE2\u4EF7\u5355", { p0: alerts.length }) : (0, import_i18n2.t)("\u6253\u5F00\u653F\u91C7\u4E91\u667A\u80FD\u4F53\u8BFB\u56DE\u6700\u65B0\u8BA2\u5355\u4E0E\u8BE2\u4EF7\u5355") }).show();
      }
      try {
        win()?.webContents.send(import_ipc_contracts.IPC_CHANNELS.WORKBENCH_ZC_EVENT, { type: "patrol-due" });
      } catch {
      }
    } catch (e) {
      logger?.warn?.("zcy-agent", "patrol tick failed", { error: e?.message });
    }
  }, 6e4);
  (0, import_quitRegistry.onAppWillQuit)("zcy-agent", () => clearInterval(timer), { once: true });
  const actions = {
    "state.get": () => publicState(),
    "models.list": () => modelOptions(),
    "settings.patch": (p) => {
      const patch = p?.patch || {};
      store.update((s) => {
        if (patch.company) {
          const c = { ...s.settings.company, ...patch.company };
          c.qualifications = s.settings.company.qualifications;
          c.creditCode = String(c.creditCode || "").replace(/\s/g, "").toUpperCase();
          for (const k of ["englishName", "shortName", "postcode", "email", "contactMobile", "totalAssets", "employees", "income", "intro", "registerOrg", "registerCapital", "scope", "onjobCount", "socialPayCount"]) c[k] = String(c[k] ?? "").trim();
          s.settings.company = c;
        }
        if (Array.isArray(patch.regions) && patch.regions.length) {
          s.settings.regions = patch.regions.map((r) => ({
            ...r,
            imageMinSide: Math.max(0, Math.round(toNum(r.imageMinSide))),
            imageMin: Math.max(0, Math.round(toNum(r.imageMin))),
            imageMaxKb: Math.max(1, Math.round(toNum(r.imageMaxKb))),
            priceRule: r.priceRule === "min" ? "min" : "avg",
            priceTolerance: Math.min(1, Math.max(0, toNum(r.priceTolerance))),
            refMin: Math.max(0, Math.round(toNum(r.refMin))),
            acceptHours: Math.max(1, toNum(r.acceptHours)),
            titleMax: Math.max(10, Math.round(toNum(r.titleMax))),
            titleOrder: r.titleOrder === "name_first" ? "name_first" : "brand_first",
            reviewDays: Math.max(0, Math.round(toNum(r.reviewDays))),
            bannedWords: (Array.isArray(r.bannedWords) ? r.bannedWords : []).map((w) => String(w).trim()).filter(Boolean)
          }));
        }
        if (patch.regionId && s.settings.regions.some((r) => r.id === patch.regionId)) s.settings.regionId = patch.regionId;
        if (patch.defaultMargin !== void 0) s.settings.defaultMargin = Math.min(5, Math.max(0, toNum(patch.defaultMargin)));
        if (patch.invoiceTaxRate !== void 0) s.settings.invoiceTaxRate = Math.min(1, Math.max(0, toNum(patch.invoiceTaxRate)));
        if (patch.model !== void 0) s.settings.model = String(patch.model || "");
        if (Array.isArray(patch.patrolTimes)) s.settings.patrolTimes = [...new Set(patch.patrolTimes.map((t) => String(t).trim()).filter((t) => /^([01]\d|2[0-3]):[0-5]\d$/.test(t)))].sort();
      });
      recheckAll();
      pushState();
      return publicState().settings;
    },
    "files.pick": async (p) => {
      const filters = p?.kind === "excel" ? [{ name: "Excel", extensions: ["xlsx", "xls", "csv"] }] : p?.kind === "image" ? [{ name: "Image", extensions: ["jpg", "jpeg", "png"] }] : [];
      const r = await import_electron.dialog.showOpenDialog(win(), { properties: p?.multi ? ["openFile", "multiSelections"] : ["openFile"], filters });
      return r.canceled ? [] : r.filePaths;
    },
    "path.open": async (p) => {
      if (!p?.path || !(0, import_node_fs2.existsSync)(p.path)) throw new Error((0, import_i18n2.t)("\u6587\u4EF6\u4E0D\u5B58\u5728"));
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
    // ── 账号与材料 ──
    "account.save": (p) => {
      for (const u of [p.loginUrl, p.homeUrl]) if (u && !(0, import_login.isZcyHost)(u)) throw new Error((0, import_i18n2.t)("\u5730\u5740\u5FC5\u987B\u662F https \u7684\u653F\u91C7\u4E91\u57DF\u540D\uFF08zcygov.cn\uFF09\uFF1A{p0}", { p0: u }));
      if (p.password && !canEncrypt()) throw new Error((0, import_i18n2.t)("\u8FD9\u53F0\u7535\u8111\u7684\u7CFB\u7EDF\u94A5\u5319\u4E32\u4E0D\u53EF\u7528\uFF0C\u5BC6\u7801\u6CA1\u6CD5\u5B89\u5168\u4FDD\u5B58\uFF1B\u767B\u5F55\u65F6\u8BF7\u81EA\u5DF1\u5728\u767B\u5F55\u6846\u91CC\u8F93\u5165"));
      store.update((s) => {
        if (p.username !== void 0) s.settings.account.username = String(p.username).trim();
        if (p.loginUrl !== void 0) s.settings.account.loginUrl = p.loginUrl || ZCY_LOGIN_URL;
        if (p.homeUrl !== void 0) s.settings.account.homeUrl = p.homeUrl || ZCY_HOME_URL;
        if (p.password) s.passwordCipher = import_electron.safeStorage.encryptString(String(p.password)).toString("base64");
      });
      if (p.password) log("account", (0, import_i18n2.t)("\u5DF2\u4FDD\u5B58\u653F\u91C7\u4E91\u8D26\u53F7\u5BC6\u7801\uFF08\u52A0\u5BC6\u5B58\u5728\u672C\u673A\uFF09"));
      pushState();
      return publicState().settings.account;
    },
    "account.clearPassword": () => {
      store.update((s) => {
        s.passwordCipher = "";
      });
      log("account", (0, import_i18n2.t)("\u5DF2\u5220\u9664\u4FDD\u5B58\u7684\u5BC6\u7801"));
      pushState();
      return true;
    },
    /** 打开登录页并填好账号密码；验证码 / 滑块 / 点登录由人完成 */
    "account.login": async () => {
      const tabs = deps.embeddedBrowserTabs;
      if (!tabs) throw new Error((0, import_i18n2.t)("\u5185\u7F6E\u6D4F\u89C8\u5668\u4E0D\u53EF\u7528"));
      const s = store.read();
      const url = s.settings.account.loginUrl || ZCY_LOGIN_URL;
      if (!(0, import_login.isZcyHost)(url)) throw new Error((0, import_i18n2.t)("\u767B\u5F55\u5730\u5740\u4E0D\u662F\u653F\u91C7\u4E91\u57DF\u540D\uFF0C\u5DF2\u62E6\u4E0B"));
      const tab = await tabs.create({ url, contextId: BROWSER_CONTEXT, source: "agent", activate: true });
      try {
        tabs.setAutomationPaused(tab.id, true);
      } catch {
      }
      try {
        tabs.setVisible(true);
      } catch {
      }
      let password = "";
      if (s.passwordCipher && canEncrypt()) {
        try {
          password = import_electron.safeStorage.decryptString(Buffer.from(s.passwordCipher, "base64"));
        } catch {
          password = "";
        }
      }
      if (!s.settings.account.username || !password) return { opened: true, filled: false, reason: "no-credential" };
      let result = "no-form";
      for (let i = 0; i < 20 && result !== "filled"; i += 1) {
        await new Promise((r) => setTimeout(r, 750));
        if (!(0, import_login.isZcyHost)(tabs.currentUrlOf(tab.id))) {
          result = "off-site";
          continue;
        }
        try {
          result = String(await tabs.evalInTab(tab.id, (0, import_login.loginFillScript)(s.settings.account.username, password)));
        } catch {
          result = "no-form";
        }
      }
      password = "";
      if (result === "filled") {
        store.update((st) => {
          st.settings.account.lastFillAt = now();
        });
        log("account", (0, import_i18n2.t)("\u5DF2\u5728\u767B\u5F55\u9875\u586B\u597D\u8D26\u53F7\u5BC6\u7801\uFF0C\u7B49\u4F60\u8FC7\u9A8C\u8BC1\u7801\u5E76\u70B9\u767B\u5F55"));
        pushState();
      }
      return { opened: true, filled: result === "filled", reason: result };
    },
    // ── 打开政采云、读工作台、入驻 ──
    /** 在内置浏览器里打开政采云的某个页面（都要求是政采云域名） */
    "site.open": async (p) => {
      const tabs = deps.embeddedBrowserTabs;
      if (!tabs) throw new Error((0, import_i18n2.t)("\u5185\u7F6E\u6D4F\u89C8\u5668\u4E0D\u53EF\u7528"));
      const acc = store.read().settings.account;
      const url = p?.target === "onboard" ? ZCY_ONBOARD_LIST_URL : p?.target === "home" ? acc.homeUrl || ZCY_HOME_URL : p?.target === "portal" ? ZCY_JILIN_PORTAL : ZCY_WORKBENCH_URL;
      const tab = await tabs.create({ url, contextId: BROWSER_CONTEXT, source: "agent", activate: true });
      try {
        tabs.setAutomationPaused(tab.id, true);
      } catch {
      }
      try {
        tabs.setVisible(true);
      } catch {
      }
      return { url };
    },
    /** 打开供应商工作台并读回：登录了没有、入驻到哪一步、各项待办计数。只读，不点任何东西。 */
    "site.readWorkbench": async () => {
      const tabs = deps.embeddedBrowserTabs;
      if (!tabs) throw new Error((0, import_i18n2.t)("\u5185\u7F6E\u6D4F\u89C8\u5668\u4E0D\u53EF\u7528"));
      const tab = await tabs.create({ url: ZCY_WORKBENCH_URL, contextId: BROWSER_CONTEXT, source: "agent", activate: true });
      try {
        tabs.setAutomationPaused(tab.id, true);
      } catch {
      }
      try {
        tabs.setVisible(true);
      } catch {
      }
      let read = parseWorkbench(null);
      for (let i = 0; i < 16; i += 1) {
        await new Promise((r) => setTimeout(r, 1e3));
        if (!(0, import_login.isZcyHost)(tabs.currentUrlOf(tab.id))) continue;
        try {
          read = parseWorkbench(await tabs.evalInTab(tab.id, WORKBENCH_SCRIPT));
        } catch {
          continue;
        }
        if (!read.loggedIn || read.onWorkbench && read.todos.length) break;
      }
      const wb = { readAt: now(), loggedIn: read.loggedIn && read.onWorkbench, region: read.region, identity: read.identity, temporary: read.temporary, todos: read.todos };
      store.update((s) => {
        s.workbench = wb;
      });
      log("account", wb.loggedIn ? (0, import_i18n2.t)("\u8BFB\u56DE\u653F\u91C7\u4E91\u5DE5\u4F5C\u53F0\uFF1A{p0}{p1}", { p0: wb.region || "", p1: wb.identity ? ` \xB7 ${wb.identity}` : "" }) : (0, import_i18n2.t)("\u653F\u91C7\u4E91\u8FD8\u6CA1\u767B\u5F55"), wb.loggedIn);
      pushState();
      return wb;
    },
    /** 入驻要准备的东西：能自动填的文本项里还缺哪些、要人在页面上处理的有哪些 */
    "onboard.checklist": () => {
      const c = store.read().settings.company;
      return {
        ready: ONBOARD_FIELDS.filter((f) => String(c[f.key] ?? "").trim()).map((f) => f.label),
        missing: ONBOARD_FIELDS.filter((f) => !String(c[f.key] ?? "").trim()).map((f) => f.label),
        manual: ONBOARD_MANUAL
      };
    },
    /** 把企业资料填进入驻填报页的文本框（要先停在那个页面上）；不点保存草稿，也不点提交入驻申请 */
    "onboard.fill": async (p) => {
      const tabs = deps.embeddedBrowserTabs;
      if (!tabs) throw new Error((0, import_i18n2.t)("\u5185\u7F6E\u6D4F\u89C8\u5668\u4E0D\u53EF\u7528"));
      const tabId = tabs.tabIdForAgentContext(BROWSER_CONTEXT);
      const url = tabId ? tabs.currentUrlOf(tabId) : "";
      if (!tabId || !isOnboardFormUrl(url)) throw new Error((0, import_i18n2.t)("\u5185\u7F6E\u6D4F\u89C8\u5668\u73B0\u5728\u4E0D\u5728\u5165\u9A7B\u586B\u62A5\u9875\uFF1A\u5148\u70B9\u300C\u6253\u5F00\u5165\u9A7B\u9875\u9762\u300D\uFF0C\u5728\u5217\u8868\u91CC\u70B9\u300C\u7EE7\u7EED\u5165\u9A7B\u300D\u8FDB\u5230\u586B\u8D44\u6599\u7684\u9875\u9762\uFF0C\u518D\u56DE\u6765\u70B9\u586B\u5199"));
      const r = parseFillResult(await tabs.evalInTab(tabId, onboardFillScript(store.read().settings.company, !!p?.overwrite)));
      if (r.error) throw new Error((0, import_i18n2.t)("\u5185\u7F6E\u6D4F\u89C8\u5668\u73B0\u5728\u4E0D\u5728\u5165\u9A7B\u586B\u62A5\u9875\uFF1A\u5148\u70B9\u300C\u6253\u5F00\u5165\u9A7B\u9875\u9762\u300D\uFF0C\u5728\u5217\u8868\u91CC\u70B9\u300C\u7EE7\u7EED\u5165\u9A7B\u300D\u8FDB\u5230\u586B\u8D44\u6599\u7684\u9875\u9762\uFF0C\u518D\u56DE\u6765\u70B9\u586B\u5199"));
      log("account", (0, import_i18n2.t)("\u5165\u9A7B\u8D44\u6599\uFF1A\u586B\u4E86 {p0} \u9879\uFF0C{p1} \u9879\u9875\u9762\u4E0A\u5DF2\u6709\u4E0D\u540C\u7684\u503C\u6CA1\u6709\u52A8", { p0: r.filled.length, p1: r.kept.length }));
      pushState();
      return { ...r, manual: ONBOARD_MANUAL };
    },
    "qual.save": (p) => {
      const name = String(p?.name || "").trim();
      if (!name) throw new Error((0, import_i18n2.t)("\u8BF7\u586B\u8D44\u8D28\u540D\u79F0"));
      const expireAt = String(p.expireAt || "").trim();
      if (expireAt && !/^\d{4}-\d{2}-\d{2}$/.test(expireAt)) throw new Error((0, import_i18n2.t)("\u5230\u671F\u65E5\u683C\u5F0F\u5E94\u4E3A 2026-12-31"));
      store.update((s) => {
        const list = s.settings.company.qualifications;
        const cur = p.id ? list.find((q) => q.id === p.id) : void 0;
        if (cur) Object.assign(cur, { name, expireAt, note: String(p.note || ""), ...p.file !== void 0 ? { file: p.file } : {} });
        else list.push({ id: newId("zcf"), name, file: String(p.file || ""), expireAt, note: String(p.note || "") });
      });
      pushState();
      return true;
    },
    "qual.remove": (p) => {
      store.update((s) => {
        s.settings.company.qualifications = s.settings.company.qualifications.filter((q) => q.id !== p.id);
      });
      pushState();
      return true;
    },
    // ── 商品上架 ──
    "products.import": (p) => {
      const seeds = parseProductsTable((0, import_excel.readTable)(p.path));
      if (!seeds.length) throw new Error((0, import_i18n2.t)("\u8FD9\u5F20\u8868\u91CC\u6CA1\u6709\u8BFB\u5230\u5546\u54C1"));
      store.update((s) => {
        for (const x of seeds) {
          const { imagePaths, ...rest } = x;
          const prod = { id: newId("zcp"), ...rest, title: "", images: imagePaths.filter((f) => (0, import_node_fs2.existsSync)(f)).map(imageInfo), status: "draft", issues: [], updatedAt: now() };
          recheck(prod);
          s.products.unshift(prod);
        }
      });
      log("listing", (0, import_i18n2.t)("\u5BFC\u5165 {p0} \u4E2A\u5546\u54C1", { p0: seeds.length }));
      pushState();
      return { imported: seeds.length };
    },
    "product.save": (p) => {
      const patch = p?.patch || {};
      const out = store.update((s) => {
        let cur = p.id ? s.products.find((x) => x.id === p.id) : void 0;
        if (p.id && !cur) throw new Error((0, import_i18n2.t)("{p0}\u4E0D\u5B58\u5728\u6216\u5DF2\u5220\u9664", { p0: (0, import_i18n2.t)("\u5546\u54C1") }));
        if (cur && !["draft", "confirmed", "rejected"].includes(cur.status)) throw new Error((0, import_i18n2.t)("\u5DF2\u4EA4\u7ED9\u6570\u5B57\u5458\u5DE5\u7684\u5546\u54C1\u4E0D\u80FD\u518D\u6539\uFF1B\u8981\u6539\u5148\u6807\u8BB0\u4E3A\u88AB\u9A73\u56DE"));
        if (!cur) {
          cur = { id: newId("zcp"), name: "", brand: "", model: "", category: "", title: "", price: 0, stock: 0, unit: "", params: "", detail: "", images: [], refs: [], status: "draft", issues: [], updatedAt: now() };
          s.products.unshift(cur);
        }
        const str = (k) => {
          if (patch[k] !== void 0) cur[k] = String(patch[k] ?? "").trim();
        };
        ["name", "brand", "model", "category", "title", "unit", "params", "detail"].forEach(str);
        if (patch.price !== void 0) cur.price = Math.max(0, toNum(patch.price));
        if (patch.stock !== void 0) cur.stock = Math.max(0, Math.round(toNum(patch.stock)));
        if (Array.isArray(patch.refs)) cur.refs = patch.refs.filter((r) => r?.url).map((r) => ({ url: String(r.url).trim(), platform: refPlatform(String(r.url)), price: Math.max(0, toNum(r.price)) }));
        if (Array.isArray(patch.images)) cur.images = patch.images.map((im) => imageInfo(String(im?.path || im)));
        if (cur.status === "rejected") cur.status = "draft";
        cur.updatedAt = now();
        recheck(cur);
        return cur;
      });
      pushState();
      return out;
    },
    "product.addImages": async (p) => {
      const prod = productOf(p.id);
      const r = await import_electron.dialog.showOpenDialog(win(), { properties: ["openFile", "multiSelections"], filters: [{ name: "Image", extensions: ["jpg", "jpeg", "png"] }] });
      if (r.canceled) return prod;
      store.update(() => {
        prod.images = [...prod.images, ...r.filePaths.filter((f) => !prod.images.some((i) => i.path === f)).map(imageInfo)];
        prod.updatedAt = now();
        recheck(prod);
      });
      pushState();
      return prod;
    },
    "product.remove": (p) => {
      store.update((s) => {
        s.products = s.products.filter((x) => x.id !== p.id);
      });
      pushState();
      return true;
    },
    "products.recheck": () => {
      recheckAll();
      pushState();
      return true;
    },
    /** 模型按参数写详情：只许用给定参数，写出来的数字回参数核对 */
    "product.describe": async (p) => {
      const prod = productOf(p.id);
      if (!prod.params.trim()) throw new Error((0, import_i18n2.t)("\u5148\u586B\u53C2\u6570\uFF1A\u8BE6\u60C5\u53EA\u80FD\u4ECE\u53C2\u6570\u91CC\u5199\uFF0C\u6CA1\u6709\u53C2\u6570\u5C31\u6CA1\u6709\u53EF\u5199\u7684"));
      const { text } = await llm("listing", describePrompt(prod), 9e4);
      const detail = text.trim().replace(/^["'「]|["'」]$/g, "").slice(0, 500);
      const stray = strayNumbers(detail, `${prod.params}
${prod.name}
${prod.model}
${prod.brand}`);
      if (stray.length) throw new Error((0, import_i18n2.t)("\u6A21\u578B\u5199\u7684\u8BE6\u60C5\u91CC\u51FA\u73B0\u4E86\u53C2\u6570\u91CC\u6CA1\u6709\u7684\u6570\u5B57\uFF08{p0}\uFF09\uFF0C\u6CA1\u6709\u91C7\u7528\uFF1B\u8BF7\u91CD\u8BD5\u6216\u81EA\u5DF1\u5199", { p0: stray.join("\u3001") }));
      store.update(() => {
        prod.detail = detail;
        prod.updatedAt = now();
        recheck(prod);
      });
      pushState();
      return prod;
    },
    "product.confirm": (p) => {
      let n = 0;
      let blocked = 0;
      store.update((s) => {
        for (const x of s.products) {
          if (!(p.ids || []).includes(x.id) || x.status !== "draft" && x.status !== "confirmed") continue;
          if (p.confirmed === false) {
            x.status = "draft";
            n += 1;
            continue;
          }
          recheck(x);
          if (x.issues.some((i) => i.level === "error")) {
            blocked += 1;
            continue;
          }
          x.status = "confirmed";
          n += 1;
        }
      });
      pushState();
      return { changed: n, blocked };
    },
    "product.instruction": (p) => {
      const prod = productOf(p.id);
      if (prod.status !== "confirmed") throw new Error((0, import_i18n2.t)("\u5148\u786E\u8BA4\u8FD9\u4E2A\u5546\u54C1"));
      return listingInstruction(prod, rule(), store.read().settings.account);
    },
    "product.status": (p) => {
      const prod = productOf(p.id);
      store.update(() => {
        prod.status = p.status;
        if (p.conversationId) prod.conversationId = p.conversationId;
        if (p.productUrl !== void 0) prod.productUrl = String(p.productUrl).trim();
        if (p.status === "rejected") prod.rejectReason = String(p.rejectReason || "").slice(0, 200);
        prod.updatedAt = now();
      });
      log("listing", (0, import_i18n2.t)("\u300C{p0}\u300D\uFF1A{p1}", { p0: prod.title || prod.name, p1: productStatusLabel(p.status) }), p.status !== "rejected");
      pushState();
      return prod;
    },
    // ── 询价报价 ──
    "inquiry.patrolInstruction": () => inquiriesPatrolInstruction(store.read().settings.account),
    "inquiry.importReply": (p) => {
      const r = normalizeInquiries(parseAgentJson(p.text));
      const m = mergeInquiries(r.inquiries);
      log("quote", (0, import_i18n2.t)("\u8BFB\u56DE\u8BE2\u4EF7\u5355\uFF1A\u65B0\u589E {p0} \u5F20\uFF0C\u66F4\u65B0 {p1} \u5F20", { p0: m.added, p1: m.updated }));
      pushState();
      return { ...m, dropped: r.dropped };
    },
    "inquiry.save": (p) => {
      const patch = p?.patch || {};
      const out = store.update((s) => {
        let cur = p.id ? s.inquiries.find((q) => q.id === p.id) : void 0;
        if (p.id && !cur) throw new Error((0, import_i18n2.t)("{p0}\u4E0D\u5B58\u5728\u6216\u5DF2\u5220\u9664", { p0: (0, import_i18n2.t)("\u8BE2\u4EF7\u5355") }));
        if (cur && !["new", "priced", "confirmed"].includes(cur.status)) throw new Error((0, import_i18n2.t)("\u5DF2\u4EA4\u51FA\u53BB\u7684\u8BE2\u4EF7\u5355\u4E0D\u80FD\u518D\u6539"));
        if (!cur) {
          cur = { id: newId("zcq"), no: "", title: "", buyer: "", deadline: "", budget: 0, items: [], margin: s.settings.defaultMargin, total: 0, status: "new", issues: [], url: "", note: "", updatedAt: now() };
          s.inquiries.unshift(cur);
        }
        if (patch.no !== void 0) cur.no = String(patch.no).trim();
        if (patch.title !== void 0) cur.title = String(patch.title).trim();
        if (patch.buyer !== void 0) cur.buyer = String(patch.buyer).trim();
        if (patch.note !== void 0) cur.note = String(patch.note).slice(0, 300);
        if (patch.url !== void 0) cur.url = /^https?:\/\//.test(String(patch.url)) ? String(patch.url).trim() : "";
        if (patch.deadline !== void 0) cur.deadline = parseTime(patch.deadline) || (Number.isFinite(Date.parse(String(patch.deadline))) ? new Date(String(patch.deadline)).toISOString() : "");
        if (patch.budget !== void 0) cur.budget = Math.max(0, toNum(patch.budget));
        if (patch.margin !== void 0) cur.margin = Math.min(5, Math.max(0, toNum(patch.margin)));
        if (Array.isArray(patch.items)) {
          cur.items = patch.items.filter((it) => String(it?.name || "").trim()).map((it) => ({
            name: String(it.name).trim(),
            spec: String(it.spec || "").trim(),
            qty: Math.max(0, toNum(it.qty)),
            unit: String(it.unit || "").trim(),
            ceiling: Math.max(0, toNum(it.ceiling)),
            cost: Math.max(0, toNum(it.cost)),
            quote: 0
          }));
        }
        cur.status = "new";
        cur.total = 0;
        cur.issues = [];
        for (const it of cur.items) it.quote = 0;
        cur.updatedAt = now();
        return cur;
      });
      pushState();
      return out;
    },
    "inquiry.price": (p) => {
      const q = inquiryOf(p.id);
      if (!["new", "priced", "confirmed"].includes(q.status)) throw new Error((0, import_i18n2.t)("\u5DF2\u4EA4\u51FA\u53BB\u7684\u8BE2\u4EF7\u5355\u4E0D\u80FD\u518D\u6539"));
      if (!q.items.length) throw new Error((0, import_i18n2.t)("\u8FD9\u5F20\u8BE2\u4EF7\u5355\u8FD8\u6CA1\u6709\u660E\u7EC6"));
      const r = priceInquiry(q);
      store.update(() => {
        q.items = r.items;
        q.total = r.total;
        q.issues = r.issues;
        q.status = "priced";
        q.updatedAt = now();
      });
      pushState();
      return q;
    },
    "inquiry.status": (p) => {
      const q = inquiryOf(p.id);
      if (p.status === "confirmed") {
        if (q.status !== "priced") throw new Error((0, import_i18n2.t)("\u5148\u7B97\u62A5\u4EF7"));
        if (q.issues.some((i) => i.level === "error")) throw new Error((0, import_i18n2.t)("\u8FD9\u5F20\u8BE2\u4EF7\u5355\u7684\u62A5\u4EF7\u8FD8\u6709\u95EE\u9898\uFF0C\u4E0D\u80FD\u786E\u8BA4\uFF1A{p0}", { p0: q.issues.find((i) => i.level === "error").message }));
      }
      store.update(() => {
        q.status = p.status;
        if (p.conversationId) q.conversationId = p.conversationId;
        q.updatedAt = now();
      });
      log("quote", (0, import_i18n2.t)("\u300C{p0}\u300D\uFF1A{p1}", { p0: q.title || q.no, p1: inquiryStatusLabel(p.status) }), p.status !== "lost");
      pushState();
      return q;
    },
    "inquiry.instruction": (p) => {
      const q = inquiryOf(p.id);
      if (q.status !== "confirmed") throw new Error((0, import_i18n2.t)("\u5148\u786E\u8BA4\u62A5\u4EF7"));
      return quoteInstruction(q, store.read().settings.account);
    },
    "inquiry.remove": (p) => {
      store.update((s) => {
        s.inquiries = s.inquiries.filter((q) => q.id !== p.id);
      });
      pushState();
      return true;
    },
    // ── 订单履约 ──
    "orders.patrolInstruction": () => ordersPatrolInstruction(store.read().settings.account),
    "orders.importReply": (p) => {
      const r = normalizeOrders(parseAgentJson(p.text));
      const m = mergeOrders(r.orders);
      log("orders", (0, import_i18n2.t)("\u8BFB\u56DE\u8BA2\u5355\uFF1A\u65B0\u589E {p0} \u5F20\uFF0C\u66F4\u65B0 {p1} \u5F20", { p0: m.added, p1: m.updated }));
      pushState();
      return { ...m, dropped: r.dropped };
    },
    "orders.importFile": (p) => {
      const r = parseOrdersTable((0, import_excel.readTable)(p.path));
      const m = mergeOrders(r.orders);
      log("orders", (0, import_i18n2.t)("\u5BFC\u5165\u8BA2\u5355\u8868\uFF1A\u65B0\u589E {p0} \u5F20\uFF0C\u66F4\u65B0 {p1} \u5F20", { p0: m.added, p1: m.updated }));
      pushState();
      return { ...m, dropped: r.dropped };
    },
    "order.update": (p) => {
      const o = orderOf(p.id);
      const patch = p.patch || {};
      store.update(() => {
        if (patch.logisticsCompany !== void 0) o.logisticsCompany = String(patch.logisticsCompany).trim();
        if (patch.logisticsNo !== void 0) o.logisticsNo = String(patch.logisticsNo).replace(/\s/g, "");
        if (patch.buyerTaxNo !== void 0) o.buyerTaxNo = String(patch.buyerTaxNo).replace(/\s/g, "").toUpperCase();
        if (patch.note !== void 0) o.note = String(patch.note).slice(0, 200);
        if (patch.status) o.status = patch.status;
        if (patch.conversationId) o.conversationId = patch.conversationId;
        o.updatedAt = now();
      });
      pushState();
      return o;
    },
    "order.acceptInstruction": (p) => {
      const o = orderOf(p.id);
      if (o.status !== "to_accept") throw new Error((0, import_i18n2.t)("\u8FD9\u5F20\u8BA2\u5355\u4E0D\u5728\u5F85\u63A5\u5355\u72B6\u6001"));
      return acceptOrderInstruction(o, store.read().settings.account);
    },
    "order.shipInstruction": (p) => {
      const o = orderOf(p.id);
      if (o.status !== "to_ship") throw new Error((0, import_i18n2.t)("\u8FD9\u5F20\u8BA2\u5355\u4E0D\u5728\u5F85\u53D1\u8D27\u72B6\u6001"));
      if (!o.logisticsCompany || !o.logisticsNo) throw new Error((0, import_i18n2.t)("\u5148\u586B\u7269\u6D41\u516C\u53F8\u548C\u7269\u6D41\u5355\u53F7"));
      return shipOrderInstruction(o, store.read().settings.account);
    },
    "order.remove": (p) => {
      store.update((s) => {
        s.orders = s.orders.filter((o) => o.id !== p.id);
      });
      pushState();
      return true;
    },
    /** 待开票订单转入发票智能体：建一批开票行，金额按含税，项目名称要在发票智能体里改成规范的开票项目 */
    "orders.toInvoice": (p) => {
      const s = store.read();
      const list = s.orders.filter((o) => (p.ids || []).includes(o.id) && !o.invoiceBatchId);
      if (!list.length) throw new Error((0, import_i18n2.t)("\u6CA1\u6709\u53EF\u8F6C\u5165\u7684\u8BA2\u5355\uFF08\u5DF2\u8F6C\u8FC7\u7684\u4E0D\u4F1A\u91CD\u590D\u8F6C\uFF09"));
      const bad = list.find((o) => !(o.amount > 0) || !o.buyer);
      if (bad) throw new Error((0, import_i18n2.t)("\u8BA2\u5355 {p0} \u7F3A\u91C7\u8D2D\u5355\u4F4D\u6216\u91D1\u989D\uFF0C\u4E0D\u80FD\u8F6C\u5F00\u7968", { p0: bad.orderNo }));
      const stamp = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
      const batchId = (0, import_invoiceAgent.invoiceImportExternal)({
        name: (0, import_i18n2.t)("\u653F\u91C7\u4E91\u8BA2\u5355 {p0}", { p0: stamp }),
        source: "zcy",
        rows: list.map((o) => ({ buyerName: o.buyer, buyerTaxNo: o.buyerTaxNo, itemName: o.items, amount: o.amount, taxIncluded: true, taxRate: s.settings.invoiceTaxRate, orderNo: o.orderNo, kind: "normal", remark: (0, import_i18n2.t)("\u653F\u91C7\u4E91\u8BA2\u5355 {p0}", { p0: o.orderNo }) }))
      });
      store.update(() => {
        for (const o of list) {
          o.invoiceBatchId = batchId;
          o.updatedAt = now();
        }
      });
      log("orders", (0, import_i18n2.t)("{p0} \u5F20\u8BA2\u5355\u5DF2\u8F6C\u5165\u53D1\u7968\u667A\u80FD\u4F53", { p0: list.length }));
      pushState();
      return { batchId, count: list.length };
    }
  };
  import_electron.ipcMain.handle(import_ipc_contracts.IPC_CHANNELS.WORKBENCH_ZC_INVOKE, async (_e, req) => {
    const fn = actions[String(req?.action || "")];
    if (!fn) throw new Error((0, import_i18n2.t)("\u672A\u77E5\u64CD\u4F5C\uFF1A{p0}", { p0: String(req?.action || "") }));
    try {
      return await fn(req.payload ?? {});
    } catch (error) {
      logger?.warn?.("zcy-agent", `${req.action} failed`, { error: error?.message });
      throw new Error((0, import_userFacingError.userFacingError)(error));
    }
  });
}
var productStatusLabel = (s) => ({ draft: (0, import_i18n2.t)("\u8349\u7A3F"), confirmed: (0, import_i18n2.t)("\u5DF2\u786E\u8BA4"), handed: (0, import_i18n2.t)("\u6570\u5B57\u5458\u5DE5\u5904\u7406\u4E2D"), submitted: (0, import_i18n2.t)("\u5DF2\u63D0\u4EA4\u5BA1\u6838"), listed: (0, import_i18n2.t)("\u5DF2\u4E0A\u67B6"), rejected: (0, import_i18n2.t)("\u88AB\u9A73\u56DE"), delisted: (0, import_i18n2.t)("\u5DF2\u4E0B\u67B6") })[s];
var inquiryStatusLabel = (s) => ({ new: (0, import_i18n2.t)("\u5F85\u7B97\u4EF7"), priced: (0, import_i18n2.t)("\u5DF2\u7B97\u4EF7"), confirmed: (0, import_i18n2.t)("\u5DF2\u786E\u8BA4"), handed: (0, import_i18n2.t)("\u6570\u5B57\u5458\u5DE5\u5904\u7406\u4E2D"), submitted: (0, import_i18n2.t)("\u5DF2\u63D0\u4EA4\u62A5\u4EF7"), won: (0, import_i18n2.t)("\u5DF2\u6210\u4EA4"), lost: (0, import_i18n2.t)("\u672A\u6210\u4EA4"), skipped: (0, import_i18n2.t)("\u4E0D\u53C2\u4E0E") })[s];

// node_modules/.cache/solutions-build/workbench-zcy-agent/entry.main.ts
var hostApi = 2;
var registerFunction = "registerZcyAgentHandlers";
function activate(ctx) {
  registerZcyAgentHandlers(ctx.host.deps);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  activate,
  hostApi,
  registerFunction
});
