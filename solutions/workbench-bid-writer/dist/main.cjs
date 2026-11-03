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

// apps/desktop-shell/node_modules/.cache/solutions-build/workbench-bid-writer/entry.main.ts
var entry_main_exports = {};
__export(entry_main_exports, {
  activate: () => activate,
  deactivate: () => deactivate,
  hostApi: () => hostApi,
  registerFunction: () => registerFunction
});
module.exports = __toCommonJS(entry_main_exports);

// ../totalclaw-solutions/solutions/workbench-bid-writer/src/main/ipc/bidWriter.ipc.ts
var import_electron = require("electron");
var import_node_path2 = require("node:path");
var import_node_fs2 = require("node:fs");
var XLSX = __toESM(require("npm:xlsx"), 1);
var import_i18n6 = require("npm:@totalclaw/i18n");
var import_ipc_contracts = require("npm:@totalclaw/ipc-contracts");
var import_shared = require("host:apps/desktop-shell/src/main/ipc/shared.ts");
var import_councilChatRouter = require("host:apps/desktop-shell/src/main/services/councilChatRouter.ts");
var import_documentExtractor = require("host:apps/desktop-shell/src/main/services/documentExtractor.ts");
var import_service = require("host:apps/desktop-shell/src/main/services/knowledgeBase/service.ts");
var import_retrieval = require("host:apps/desktop-shell/src/main/services/knowledgeBase/retrieval.ts");
var import_fieldCatalog = require("host:apps/desktop-shell/src/main/services/knowledgeBase/fieldCatalog.ts");
var import_noticeFetch = require("host:apps/desktop-shell/src/main/services/bidWriter/noticeFetch.ts");
var import_noticeSearch = require("host:apps/desktop-shell/src/main/services/bidWriter/noticeSearch.ts");

// ../totalclaw-solutions/solutions/workbench-bid-writer/src/main/services/bidWriter/noticeRules.ts
var import_i18n = require("npm:@totalclaw/i18n");
var import_matchPatterns = require("host:apps/desktop-shell/src/main/services/bidWriter/matchPatterns.ts");
function normalizeNoticeText(raw) {
  return String(raw || "").replace(/\r/g, "").replace(/[\u3000]{2,}/g, "\n").replace(/([；;。])\s*(?=[（(]?[一二三四五六七八九十]{1,3}[、）)])/g, "$1\n").replace(/([；;。])\s*(?=\d{1,2}\s*[、.．])/g, "$1\n").replace(/(?<=[^\n])(?=[（(][一二三四五六七八九十]{1,3}[）)])/g, "\n").replace(/[ \t\u3000]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
}
function escapeRe(raw) {
  return raw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function collectCandidates(text, labels) {
  const out = [];
  for (const label of labels) {
    const re = new RegExp(
      // 边界要含 / ：真实公告有「提交投标文件截止时间/开标时间：…」这种并列标签
      `(^|[\\n\\s\u3000\u3001\uFF0C,\uFF1B;\uFF08(\u3010\\[/\uFF0F])(?:[\uFF08(]?\\s*[0-9\u4E00\u4E8C\u4E09\u56DB\u4E94\u516D\u4E03\u516B\u4E5D\u5341]{1,3}\\s*[\uFF09)\u3001.\uFF0E]\\s*)?${escapeRe(label)}(?:\u548C|\u53CA|\u4E0E)?(?:\u5730\u70B9|\u5730\u5740|\u65B9\u5F0F)?(?:\\s*[/\uFF0F\u3001]\\s*[^\\n:\uFF1A]{0,12})?\\s*(?:[:\uFF1A]|\u4E3A|\u662F|\u3000| {2,})\\s*([^\\n]{1,60})`,
      "g"
    );
    let m;
    while ((m = re.exec(text)) !== null) {
      const lineStart = m[1] === "" || /[\n]/.test(m[1]);
      const hasColon = /[:：]/.test(m[0].slice(0, m[0].length - m[2].length));
      const raw = m[2].replace(import_matchPatterns.LABEL_TAIL_RE, "").replace(/[\s\u3000]+/g, " ").trim();
      if (!raw) continue;
      out.push({
        value: raw,
        // 行首 + 冒号 = 典型字段行；标签越具体权重越高（这条要压过「越靠前越好」：
        // 真实公告里「（一）提交投标文件时间」在前、「（二）提交投标文件截止时间」在后，
        // 后者才是截止点）；位置只做很小的加权，用来在同样具体的两条里挑抬头那条。
        score: (lineStart ? 3 : 0) + (hasColon ? 3 : 0) + label.length * 0.5 + Math.max(0, 1 - m.index / Math.max(1, text.length))
      });
      if (out.length >= 40) break;
    }
  }
  return out;
}
function trimValue(raw, stopAtComma) {
  const cut = stopAtComma ? raw.split(/[。；;，,]/)[0] : raw.split(/[。；;]/)[0];
  return cut.replace(/^[\s:：、，,]+/, "").replace(/[\s、，,]+$/, "").trim().slice(0, 120);
}
function acceptValue(field, raw) {
  const v = trimValue(raw, field !== "budget" && field !== "deposit");
  if (v.length < 2) return null;
  switch (field) {
    case "bidDeadline":
    case "openAt": {
      if (!import_matchPatterns.DATE_LIKE_RE.test(v)) return null;
      return v;
    }
    case "budget":
    case "deposit": {
      const m = import_matchPatterns.MONEY_RE.exec(raw);
      return m ? m[0].trim() : null;
    }
    case "buyer":
    case "agency": {
      if (import_matchPatterns.ORG_REJECT_RE.test(v)) return null;
      if (v.length > 30) return null;
      const core = v.replace(/[（(][^）)]*[）)]\s*$/, "");
      return import_matchPatterns.ORG_TAIL_RE.test(core) || core.length <= 20 ? v : null;
    }
    case "contact": {
      return import_matchPatterns.CONTACT_LIKE_RE.test(v) ? v : null;
    }
    case "projectCode": {
      const token = v.split(/[\s\u3000]/)[0];
      return import_matchPatterns.CODE_LIKE_RE.test(token) ? token : null;
    }
    default:
      return v;
  }
}
function pickFromInfoBlock(lines, blockRe, innerLabels) {
  for (let i = 0; i < lines.length; i += 1) {
    if (!blockRe.test(lines[i])) continue;
    for (let j = i + 1; j < Math.min(i + 6, lines.length); j += 1) {
      for (const label of innerLabels) {
        const m = new RegExp(`^\\s*(?:[\uFF08(]?\\s*[0-9\u4E00\u4E8C\u4E09\u56DB\u4E94\u516D\u4E03\u516B\u4E5D\u5341]{1,3}\\s*[\uFF09)\u3001.\uFF0E]\\s*)?${escapeRe(label)}\\s*[:\uFF1A]\\s*(.+)$`).exec(lines[j]);
        if (m?.[1]?.trim()) return m[1].split(/[。；;]/)[0].trim().slice(0, 60);
      }
    }
  }
  return void 0;
}
function pickFromEntrustSentence(text) {
  const m = import_matchPatterns.ENTRUST_RE.exec(text);
  if (!m) return {};
  return { agency: m[1].trim(), buyer: m[2].trim() };
}
function pickField(text, field) {
  const scored = collectCandidates(text, import_matchPatterns.FIELD_LABELS[field]).map((c) => ({ ...c, clean: acceptValue(field, c.value) })).filter((c) => c.clean);
  if (!scored.length) return void 0;
  scored.sort((a, b) => b.score - a.score || a.clean.length - b.clean.length);
  return scored[0].clean;
}
function requirementId(index) {
  return `req_${index.toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
}
function pointsOf(text) {
  const m = /(\d{1,3}(?:\.\d)?)\s*分/.exec(text);
  if (!m) return void 0;
  const v = Number(m[1]);
  return Number.isFinite(v) && v > 0 && v <= 100 ? v : void 0;
}
function extractRequirementsByRules(text, sourceLabel, locator) {
  const lines = normalizeNoticeText(text).split("\n").map((l) => l.trim());
  const out = [];
  let current = null;
  let index = 0;
  for (const line of lines) {
    if (!line) continue;
    const isItem = import_matchPatterns.ITEM_RE.test(line);
    const body = line.replace(import_matchPatterns.ITEM_RE, "").trim();
    if ((0, import_matchPatterns.isHeadingShape)(body)) {
      const hit = import_matchPatterns.SECTION_KIND.find((s) => s.re.test(body));
      if (hit) {
        current = hit.kind;
        continue;
      }
    }
    if (!current) continue;
    if (!isItem || body.length < 6) continue;
    if (body.length > 400) continue;
    if (import_matchPatterns.DEFINITION_SENTENCE_RE.test(body)) continue;
    index += 1;
    out.push({
      id: requirementId(index),
      kind: current,
      text: body.slice(0, 400),
      points: current === "scoring" ? pointsOf(body) : void 0,
      mandatory: current === "qualification" || import_matchPatterns.MANDATORY_RE.test(body),
      source: { kind: "notice", label: sourceLabel, locator, quote: body.slice(0, 160) }
    });
    if (out.length >= 120) break;
  }
  return out;
}
function extractNoticeFacts(text) {
  const t = normalizeNoticeText(text);
  const lines = t.split("\n").map((l) => l.trim()).filter(Boolean);
  const entrust = pickFromEntrustSentence(t);
  const buyerBlock = pickFromInfoBlock(lines, import_matchPatterns.INFO_BLOCK.buyer.head, import_matchPatterns.INFO_BLOCK.buyer.labels);
  const agencyBlock = pickFromInfoBlock(lines, import_matchPatterns.INFO_BLOCK.agency.head, import_matchPatterns.INFO_BLOCK.agency.labels);
  const contactBlock = pickFromInfoBlock(lines, import_matchPatterns.INFO_BLOCK.contact.head, import_matchPatterns.INFO_BLOCK.contact.labels);
  return {
    projectCode: pickField(t, "projectCode"),
    buyer: buyerBlock || pickField(t, "buyer") || entrust.buyer,
    agency: agencyBlock || pickField(t, "agency") || entrust.agency,
    budget: pickField(t, "budget"),
    deposit: pickField(t, "deposit"),
    bidDeadline: pickField(t, "bidDeadline"),
    openAt: pickField(t, "openAt"),
    contact: contactBlock || pickField(t, "contact")
  };
}
function verifyAgainstText(text, quote) {
  const norm = (s) => s.replace(import_matchPatterns.PUNCT_RE, "");
  const haystack = norm(text);
  const needle = norm(quote);
  if (needle.length < 6) return false;
  if (haystack.includes(needle)) return true;
  return haystack.includes(needle.slice(0, 12));
}
function missingFactWarnings(facts) {
  const miss = [];
  if (!facts.projectCode) miss.push((0, import_i18n.t)("\u62DB\u6807\u7F16\u53F7"));
  if (!facts.buyer) miss.push((0, import_i18n.t)("\u91C7\u8D2D\u4EBA"));
  if (!facts.bidDeadline) miss.push((0, import_i18n.t)("\u6295\u6807\u622A\u6B62\u65F6\u95F4"));
  return miss.length ? [(0, import_i18n.t)("\u8FD9\u4E9B\u5173\u952E\u4FE1\u606F\u6CA1\u5728\u516C\u544A\u91CC\u6293\u5230\uFF0C\u8BF7\u624B\u5DE5\u8865\uFF1A{list}", { list: miss.join((0, import_i18n.t)("\u3001")) })] : [];
}
function qualificationKind(text) {
  const t = String(text || "");
  if (import_matchPatterns.EVIDENCE_QUALIFICATION_RE.test(t)) return "evidence";
  return import_matchPatterns.DECLARATION_QUALIFICATION_RE.test(t) ? "declaration" : "evidence";
}

// ../totalclaw-solutions/solutions/workbench-bid-writer/src/main/ipc/bidWriter.ipc.ts
var import_matchPatterns5 = require("host:apps/desktop-shell/src/main/services/bidWriter/matchPatterns.ts");

// ../totalclaw-solutions/solutions/workbench-bid-writer/src/main/services/bidWriter/outline.ts
var import_i18n2 = require("npm:@totalclaw/i18n");
var import_matchPatterns2 = require("host:apps/desktop-shell/src/main/services/bidWriter/matchPatterns.ts");
function numberedLevel(text) {
  for (const p of import_matchPatterns2.HEADING_PATTERNS) {
    if (p.re.test(text)) return p.level;
  }
  return null;
}
function isPartHeading(text) {
  return import_matchPatterns2.HEADING_PATTERNS.some((p) => p.part && p.re.test(text));
}
function bareTitleLevel(text, nextLine) {
  if (text.length > 20 || !import_matchPatterns2.BID_TITLE_WORDS.test(text)) return null;
  if (/[／/]/.test(text)) return null;
  const body = String(nextLine || "").trim();
  return body.length >= 40 ? 2 : null;
}
function headingLevel(line, nextLine) {
  const text = line.trim();
  if (!text || (0, import_matchPatterns2.looksLikeBody)(text)) return null;
  const numbered = numberedLevel(text);
  if (numbered) return numbered;
  return bareTitleLevel(text, nextLine);
}
function stripNumbering(raw) {
  let out = String(raw || "");
  for (const re of import_matchPatterns2.NUMBERING_PREFIXES) out = out.replace(re, "");
  return out.replace(/[\s:：]+$/, "").trim();
}
function placeholderHints(line) {
  const out = [];
  for (const m of line.matchAll(import_matchPatterns2.PLACEHOLDER_BRACES)) out.push(m[1].trim());
  for (const m of line.matchAll(import_matchPatterns2.PLACEHOLDER_BRACKETS)) out.push(m[1].trim());
  return out;
}
var seq = 0;
function sectionId() {
  seq += 1;
  return `sec_${Date.now().toString(36)}_${seq.toString(36)}`;
}
function builtinOutline() {
  const spec = [
    [1, (0, import_i18n2.t)("\u6295\u6807\u51FD\u53CA\u6295\u6807\u51FD\u9644\u5F55"), (0, import_i18n2.t)("\u81F4\u91C7\u8D2D\u4EBA\u7684\u6B63\u5F0F\u6295\u6807\u51FD\uFF1A\u786E\u8BA4\u6309\u62DB\u6807\u6587\u4EF6\u8981\u6C42\u6295\u6807\u3001\u62A5\u4EF7\u603B\u4EF7\u3001\u5DE5\u671F\u4E0E\u6709\u6548\u671F\uFF0C\u5E76\u58F0\u660E\u5BF9\u62DB\u6807\u6587\u4EF6\u65E0\u5F02\u8BAE\u3002"), true],
    [1, (0, import_i18n2.t)("\u6CD5\u5B9A\u4EE3\u8868\u4EBA\u8EAB\u4EFD\u8BC1\u660E\u53CA\u6388\u6743\u59D4\u6258\u4E66"), (0, import_i18n2.t)("\u6CD5\u5B9A\u4EE3\u8868\u4EBA\u8EAB\u4EFD\u8BC1\u660E\uFF1B\u5982\u7531\u4EE3\u7406\u4EBA\u7B7E\u7F72\uFF0C\u9644\u6388\u6743\u59D4\u6258\u4E66\u5E76\u5199\u660E\u6388\u6743\u8303\u56F4\u4E0E\u671F\u9650\u3002"), true],
    [1, (0, import_i18n2.t)("\u6295\u6807\u4FDD\u8BC1\u91D1\u8BC1\u660E"), (0, import_i18n2.t)("\u4FDD\u8BC1\u91D1\u7F34\u7EB3\u51ED\u8BC1\u8BF4\u660E\uFF1A\u91D1\u989D\u3001\u5F62\u5F0F\u3001\u9012\u4EA4\u65F6\u95F4\uFF0C\u4E0E\u62DB\u6807\u516C\u544A\u8981\u6C42\u9010\u9879\u5BF9\u5E94\u3002"), true],
    [1, (0, import_i18n2.t)("\u6295\u6807\u4EBA\u8D44\u683C\u8BC1\u660E\u6587\u4EF6"), (0, import_i18n2.t)("\u8425\u4E1A\u6267\u7167\u3001\u8D44\u8D28\u8BC1\u4E66\u3001\u8BA4\u8BC1\u8BC1\u4E66\u3001\u793E\u4FDD\u4E0E\u7EB3\u7A0E\u8BC1\u660E\u7B49\u8D44\u683C\u6750\u6599\u6E05\u5355\u53CA\u5176\u6709\u6548\u671F\u3002"), true],
    [2, (0, import_i18n2.t)("\u4F01\u4E1A\u57FA\u672C\u60C5\u51B5"), (0, import_i18n2.t)("\u6210\u7ACB\u65F6\u95F4\u3001\u6CE8\u518C\u8D44\u672C\u3001\u7ECF\u8425\u8303\u56F4\u3001\u7EC4\u7EC7\u673A\u6784\u4E0E\u4EBA\u5458\u89C4\u6A21\u3002"), false],
    [2, (0, import_i18n2.t)("\u8D44\u8D28\u4E0E\u8BA4\u8BC1"), (0, import_i18n2.t)("\u9010\u9879\u5217\u51FA\u4E0E\u672C\u9879\u76EE\u76F8\u5173\u7684\u8D44\u8D28\u3001\u8BA4\u8BC1\u53CA\u7F16\u53F7\u3001\u53D1\u8BC1\u673A\u5173\u3001\u6709\u6548\u671F\u3002"), false],
    [2, (0, import_i18n2.t)("\u7C7B\u4F3C\u9879\u76EE\u4E1A\u7EE9"), (0, import_i18n2.t)("\u8FD1\u4E09\u5E74\u540C\u7C7B\u9879\u76EE\uFF1A\u9879\u76EE\u540D\u79F0\u3001\u5BA2\u6237\u3001\u5408\u540C\u91D1\u989D\u3001\u65F6\u95F4\u3001\u9A8C\u6536\u60C5\u51B5\u3002"), false],
    [1, (0, import_i18n2.t)("\u6280\u672F\u65B9\u6848"), (0, import_i18n2.t)("\u9488\u5BF9\u62DB\u6807\u6587\u4EF6\u7684\u6280\u672F\u9700\u6C42\u9010\u6761\u54CD\u5E94\uFF0C\u8BF4\u660E\u5B9E\u73B0\u65B9\u5F0F\u3001\u5173\u952E\u6307\u6807\u4E0E\u9A8C\u8BC1\u65B9\u6CD5\u3002"), true],
    [2, (0, import_i18n2.t)("\u603B\u4F53\u8BBE\u8BA1\u4E0E\u6280\u672F\u8DEF\u7EBF"), (0, import_i18n2.t)("\u603B\u4F53\u67B6\u6784\u3001\u6280\u672F\u9009\u578B\u7406\u7531\u3001\u4E0E\u62DB\u6807\u9700\u6C42\u7684\u5BF9\u5E94\u5173\u7CFB\u3002"), false],
    [2, (0, import_i18n2.t)("\u5B9E\u65BD\u65B9\u6848\u4E0E\u8FDB\u5EA6\u8BA1\u5212"), (0, import_i18n2.t)("\u5B9E\u65BD\u9636\u6BB5\u5212\u5206\u3001\u91CC\u7A0B\u7891\u3001\u4EA4\u4ED8\u7269\u4E0E\u8FDB\u5EA6\u4FDD\u969C\u63AA\u65BD\u3002"), false],
    [2, (0, import_i18n2.t)("\u9879\u76EE\u7EC4\u7EC7\u4E0E\u4EBA\u5458\u914D\u5907"), (0, import_i18n2.t)("\u9879\u76EE\u7EC4\u7EC7\u67B6\u6784\u3001\u5173\u952E\u5C97\u4F4D\u4EBA\u5458\u53CA\u5176\u8D44\u5386\u4E0E\u6295\u5165\u6BD4\u4F8B\u3002"), false],
    [2, (0, import_i18n2.t)("\u8D28\u91CF\u4FDD\u8BC1\u4E0E\u98CE\u9669\u63A7\u5236"), (0, import_i18n2.t)("\u8D28\u91CF\u7BA1\u7406\u4F53\u7CFB\u3001\u8FC7\u7A0B\u68C0\u67E5\u8282\u70B9\u3001\u4E3B\u8981\u98CE\u9669\u4E0E\u5E94\u5BF9\u9884\u6848\u3002"), false],
    [1, (0, import_i18n2.t)("\u5546\u52A1\u65B9\u6848"), (0, import_i18n2.t)("\u62A5\u4EF7\u6784\u6210\u3001\u4ED8\u6B3E\u6761\u4EF6\u3001\u5DE5\u671F\u627F\u8BFA\u3001\u77E5\u8BC6\u4EA7\u6743\u4E0E\u4FDD\u5BC6\u6761\u6B3E\u54CD\u5E94\u3002"), true],
    [2, (0, import_i18n2.t)("\u62A5\u4EF7\u8BF4\u660E"), (0, import_i18n2.t)("\u62A5\u4EF7\u8303\u56F4\u3001\u8BA1\u4EF7\u65B9\u5F0F\u3001\u7A0E\u8D39\u4E0E\u4E0D\u5305\u542B\u9879\u8BF4\u660E\uFF08\u5177\u4F53\u6570\u5B57\u4EE5\u62A5\u4EF7\u8868\u4E3A\u51C6\uFF09\u3002"), false],
    [1, (0, import_i18n2.t)("\u552E\u540E\u670D\u52A1\u4E0E\u57F9\u8BAD\u65B9\u6848"), (0, import_i18n2.t)("\u8D28\u4FDD\u671F\u3001\u54CD\u5E94\u65F6\u6548\u3001\u670D\u52A1\u56E2\u961F\u3001\u5907\u4EF6\u4E0E\u57F9\u8BAD\u5B89\u6392\u3002"), true],
    [1, (0, import_i18n2.t)("\u627F\u8BFA\u4E66\u4E0E\u5176\u4ED6\u6750\u6599"), (0, import_i18n2.t)("\u5EC9\u6D01\u627F\u8BFA\u3001\u65E0\u8FDD\u6CD5\u8BB0\u5F55\u58F0\u660E\u53CA\u62DB\u6807\u6587\u4EF6\u8981\u6C42\u7684\u5176\u4ED6\u9644\u4EF6\u3002"), false]
  ];
  return spec.map(([level, title, guide, required]) => ({
    id: sectionId(),
    level,
    title,
    guide,
    required,
    state: "todo"
  }));
}
function parseOutline(text) {
  const lines = String(text || "").replace(/\r/g, "").split("\n").map((l) => l.replace(/\t+/g, " ").trim()).filter(Boolean);
  const sections = [];
  let pending = null;
  const guideBuffer = [];
  let sawNumbered = false;
  const flush = () => {
    if (!pending) return;
    const hints = guideBuffer.join(" ").slice(0, 400).trim();
    if (hints) pending.guide = hints;
    sections.push(pending);
    pending = null;
    guideBuffer.length = 0;
  };
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const level = headingLevel(line, lines[i + 1] || "");
    if (level) {
      const title = stripNumbering(line) || line;
      if (title.length > 60 || title.length < 2) continue;
      const isNumbered = numberedLevel(line) !== null;
      if (!isNumbered && !sawNumbered) continue;
      if (isNumbered) sawNumbered = true;
      flush();
      pending = { id: sectionId(), level, title, state: "todo" };
      if (isPartHeading(line)) pending.partHeading = true;
      continue;
    }
    if (pending && guideBuffer.join(" ").length < 400) {
      const hints = placeholderHints(line);
      guideBuffer.push(hints.length ? `${line}\uFF08${(0, import_i18n2.t)("\u9700\u586B\u5199")}\uFF1A${hints.join((0, import_i18n2.t)("\u3001"))}\uFF09` : line);
    }
  }
  flush();
  const lastIndex = /* @__PURE__ */ new Map();
  sections.forEach((s, i) => lastIndex.set(s.title, i));
  const deduped = sections.filter((s, i) => lastIndex.get(s.title) === i);
  sections.length = 0;
  sections.push(...deduped);
  if (sections.length < 3) {
    return {
      sections: builtinOutline(),
      note: (0, import_i18n2.t)("\u6A21\u677F\u91CC\u6CA1\u8BC6\u522B\u51FA\u7AE0\u8282\u6807\u9898\uFF0C\u5DF2\u6539\u7528\u5185\u7F6E\u6807\u51C6\u5927\u7EB2\uFF08\u53EF\u81EA\u884C\u589E\u5220\u7AE0\u8282\uFF09"),
      fromTemplate: false
    };
  }
  for (const s of sections) {
    if (import_matchPatterns2.REQUIRED_TITLE_WORDS.test(s.title)) s.required = true;
  }
  return {
    sections: sections.slice(0, 80),
    note: (0, import_i18n2.t)("\u4ECE\u6A21\u677F\u8BC6\u522B\u51FA {n} \u4E2A\u7AE0\u8282", { n: String(Math.min(sections.length, 80)) }),
    fromTemplate: true
  };
}

// ../totalclaw-solutions/solutions/workbench-bid-writer/src/main/services/bidWriter/compliance.ts
var import_i18n3 = require("npm:@totalclaw/i18n");
var import_matchPatterns3 = require("host:apps/desktop-shell/src/main/services/bidWriter/matchPatterns.ts");
var import_matchPatterns4 = require("host:apps/desktop-shell/src/main/services/bidWriter/matchPatterns.ts");
function collectPlaceholders(content) {
  const text = String(content || "");
  const out = [];
  const known = /* @__PURE__ */ new Set();
  for (const m of text.matchAll(import_matchPatterns3.PLACEHOLDER_RE)) {
    out.push(m[1].trim());
    known.add(m[0]);
  }
  for (const m of text.matchAll(import_matchPatterns3.ANY_BRACKET_TOKEN_RE)) {
    if (known.has(m[0])) continue;
    const label = m[1].trim();
    if (label && label.length <= 30) out.push(label);
  }
  for (const m of text.matchAll(import_matchPatterns3.BRACE_TOKEN_RE)) {
    const label = m[1].trim();
    if (label) out.push(label);
  }
  return [...new Set(out)];
}
function countWords(content) {
  const s = String(content || "").trim();
  if (!s) return 0;
  const han = (s.match(/[一-龥]/g) || []).length;
  const words = (s.replace(/[一-龥]/g, " ").match(/[A-Za-z0-9][A-Za-z0-9'-]*/g) || []).length;
  return han + words;
}
function coverageTokens(text) {
  const tokens = /* @__PURE__ */ new Set();
  const han = String(text || "").replace(/[^一-龥]/g, " ");
  for (const run of han.split(/\s+/)) {
    for (let i = 0; i + 2 <= run.length; i += 1) tokens.add(run.slice(i, i + 2));
  }
  for (const word of String(text || "").toLowerCase().match(/[a-z][a-z0-9-]{2,}/g) || []) tokens.add(word);
  for (const num of String(text || "").match(/\d{4,}/g) || []) tokens.add(num);
  return [...tokens];
}
function coveredBy(sections, requirement) {
  const tokens = coverageTokens(requirement.text);
  const strip = (t) => t.replace(/[\s\u3000，,。；;：:、（）()【】\[\]"'"']/g, "").toLowerCase();
  const needle = strip(requirement.text);
  return sections.some((s) => {
    if (s.requirementIds?.includes(requirement.id)) return true;
    const hay = `${s.title}
${s.content || ""}`;
    if (tokens.length < 3) return needle.length >= 6 && strip(hay).includes(needle);
    const lower = hay.toLowerCase();
    const hits = tokens.filter((t) => lower.includes(t)).length;
    return hits / tokens.length >= 0.5;
  });
}
function item(id, level, title, detail, stepKey) {
  return { id, level, title, detail, stepKey };
}
function deadlinePassed(raw, now = Date.now()) {
  const s = String(raw || "").trim();
  if (!s) return null;
  const m = import_matchPatterns3.DATE_RE.exec(s);
  if (!m) return null;
  const hm = import_matchPatterns3.TIME_RE.exec(s.slice(m.index + m[0].length));
  const d = new Date(
    Number(m[1]),
    Number(m[2]) - 1,
    Number(m[3]),
    hm ? Number(hm[1]) : 23,
    hm?.[2] ? Number(hm[2]) : 59
  );
  if (!Number.isFinite(d.getTime())) return null;
  return d.getTime() < now;
}
function runComplianceCheck(project, now = Date.now()) {
  const items = [];
  const sections = project.sections || [];
  const requirements = project.notice?.requirements || [];
  const unfinished = sections.filter((s) => !String(s.content || "").trim());
  const failed = sections.filter((s) => s.state === "failed");
  if (!sections.length) {
    items.push(item("sections_empty", "blocker", (0, import_i18n3.t)("\u8FD8\u6CA1\u6709\u7AE0\u8282"), (0, import_i18n3.t)("\u5148\u5728\u300C\u6807\u4E66\u6A21\u677F\u300D\u8FD9\u4E00\u6B65\u786E\u5B9A\u7AE0\u8282\u9AA8\u67B6\u3002"), "template"));
  } else if (unfinished.length) {
    items.push(item(
      "sections_unfinished",
      "blocker",
      (0, import_i18n3.t)("\u6709 {n} \u7AE0\u8FD8\u6CA1\u6709\u6B63\u6587", { n: String(unfinished.length) }),
      unfinished.slice(0, 8).map((s) => s.title).join((0, import_i18n3.t)("\u3001")),
      "compose"
    ));
  } else {
    items.push(item("sections_done", "ok", (0, import_i18n3.t)("\u7AE0\u8282\u6B63\u6587\u9F50\u4E86"), (0, import_i18n3.t)("\u5171 {n} \u7AE0\u3002", { n: String(sections.length) }), "compose"));
  }
  if (failed.length) {
    items.push(item(
      "sections_failed",
      "blocker",
      (0, import_i18n3.t)("\u6709 {n} \u7AE0\u751F\u6210\u5931\u8D25", { n: String(failed.length) }),
      failed.slice(0, 8).map((s) => `${s.title}\uFF1A${s.error || (0, import_i18n3.t)("\u672A\u77E5\u9519\u8BEF")}`).join((0, import_i18n3.t)("\uFF1B")),
      "compose"
    ));
  }
  const gaps = sections.flatMap((s) => (s.placeholders || []).map((p) => `${s.title} \u2192 ${p}`));
  if (gaps.length) {
    items.push(item(
      "placeholders",
      "blocker",
      (0, import_i18n3.t)("\u6709 {n} \u5904\u5F85\u8865\u5145\u5185\u5BB9", { n: String(gaps.length) }),
      gaps.slice(0, 12).join((0, import_i18n3.t)("\uFF1B")),
      "compose"
    ));
  } else if (sections.length) {
    items.push(item("placeholders_none", "ok", (0, import_i18n3.t)("\u6CA1\u6709\u5F85\u8865\u5145\u5360\u4F4D"), (0, import_i18n3.t)("\u6B63\u6587\u91CC\u7684\u6570\u5B57\u4E0E\u8D44\u8D28\u90FD\u6709\u51FA\u5904\u3002"), "compose"));
  }
  const unmet = (project.qualifications || []).filter((q) => q.verdict === "unmet");
  const unknown = (project.qualifications || []).filter((q) => q.verdict === "unknown");
  if (unmet.length) {
    items.push(item(
      "qualification_unmet",
      "blocker",
      (0, import_i18n3.t)("\u6709 {n} \u6761\u8D44\u683C\u8981\u6C42\u4E0D\u6EE1\u8DB3", { n: String(unmet.length) }),
      unmet.slice(0, 6).map((q) => q.text.slice(0, 60)).join((0, import_i18n3.t)("\uFF1B")),
      "company"
    ));
  }
  if (unknown.length) {
    items.push(item(
      "qualification_unknown",
      "warning",
      (0, import_i18n3.t)("\u6709 {n} \u6761\u8D44\u683C\u8981\u6C42\u8FD8\u6CA1\u786E\u8BA4", { n: String(unknown.length) }),
      unknown.slice(0, 6).map((q) => q.text.slice(0, 60)).join((0, import_i18n3.t)("\uFF1B")),
      "company"
    ));
  }
  const deliverables = requirements.filter((r) => r.kind === "deliverable");
  const missing = deliverables.filter((r) => !coveredBy(sections, r));
  if (deliverables.length && missing.length) {
    items.push(item(
      "deliverable_missing",
      "warning",
      (0, import_i18n3.t)("\u6709 {n} \u9879\u5FC5\u4EA4\u6750\u6599\u6CA1\u627E\u5230\u5BF9\u5E94\u7AE0\u8282", { n: String(missing.length) }),
      missing.slice(0, 8).map((r) => r.text.slice(0, 50)).join((0, import_i18n3.t)("\uFF1B")),
      "template"
    ));
  } else if (deliverables.length) {
    items.push(item("deliverable_ok", "ok", (0, import_i18n3.t)("\u5FC5\u4EA4\u6750\u6599\u90FD\u6709\u5BF9\u5E94\u7AE0\u8282"), (0, import_i18n3.t)("\u5171 {n} \u9879\u3002", { n: String(deliverables.length) }), "template"));
  }
  const missingFields = (project.company || []).filter((f) => f.from === "missing" || !String(f.value).trim());
  if (missingFields.length) {
    items.push(item(
      "company_missing",
      "warning",
      (0, import_i18n3.t)("\u516C\u53F8\u8D44\u6599\u7F3A {n} \u9879", { n: String(missingFields.length) }),
      missingFields.slice(0, 8).map((f) => f.label).join((0, import_i18n3.t)("\u3001")),
      "company"
    ));
  }
  const passed = deadlinePassed(project.notice?.bidDeadline, now);
  if (passed === true) {
    items.push(item(
      "deadline_passed",
      "blocker",
      (0, import_i18n3.t)("\u6295\u6807\u622A\u6B62\u65F6\u95F4\u5DF2\u8FC7"),
      (0, import_i18n3.t)("\u516C\u544A\u5199\u7684\u622A\u6B62\u65F6\u95F4\u662F {t}\u3002", { t: String(project.notice?.bidDeadline || "") }),
      "notice"
    ));
  } else if (passed === false) {
    items.push(item(
      "deadline_ok",
      "ok",
      (0, import_i18n3.t)("\u8FD8\u5728\u6295\u6807\u6709\u6548\u671F\u5185"),
      (0, import_i18n3.t)("\u622A\u6B62\u65F6\u95F4\uFF1A{t}", { t: String(project.notice?.bidDeadline || "") }),
      "notice"
    ));
  } else if (!project.notice?.bidDeadline) {
    items.push(item("deadline_unknown", "warning", (0, import_i18n3.t)("\u6CA1\u6709\u6295\u6807\u622A\u6B62\u65F6\u95F4"), (0, import_i18n3.t)("\u516C\u544A\u91CC\u6CA1\u6293\u5230\uFF0C\u8BF7\u624B\u5DE5\u8865\u4E0A\u518D\u81EA\u68C0\u3002"), "notice"));
  }
  const formats = requirements.filter((r) => r.kind === "format");
  if (formats.length) {
    items.push(item(
      "format_manual",
      "warning",
      (0, import_i18n3.t)("\u6709 {n} \u6761\u683C\u5F0F\u8981\u6C42\u9700\u4EBA\u5DE5\u843D\u5B9E", { n: String(formats.length) }),
      formats.slice(0, 6).map((r) => r.text.slice(0, 60)).join((0, import_i18n3.t)("\uFF1B")),
      "review"
    ));
  }
  const acked = new Set(project.complianceAcks || []);
  const finalized = items.map((item2) => item2.level !== "ok" && acked.has(item2.id) ? { ...item2, level: "ok", detail: `${item2.detail}${item2.detail ? " " : ""}${(0, import_i18n3.t)("\uFF08\u5DF2\u4EBA\u5DE5\u786E\u8BA4\uFF0C\u4E0D\u518D\u963B\u65AD\uFF09")}` } : item2);
  const rank = { blocker: 0, warning: 1, ok: 2 };
  return finalized.sort((a, b) => rank[a.level] - rank[b.level]);
}
function hasBlocker(items) {
  return items.some((i) => i.level === "blocker");
}

// ../totalclaw-solutions/solutions/workbench-bid-writer/src/main/services/bidWriter/prompts.ts
var import_i18n4 = require("npm:@totalclaw/i18n");
var KIND_LABEL = {
  qualification: () => (0, import_i18n4.t)("\u8D44\u683C\u8981\u6C42"),
  scoring: () => (0, import_i18n4.t)("\u8BC4\u5206\u529E\u6CD5"),
  deliverable: () => (0, import_i18n4.t)("\u5FC5\u4EA4\u6750\u6599"),
  technical: () => (0, import_i18n4.t)("\u6280\u672F\u9700\u6C42"),
  commercial: () => (0, import_i18n4.t)("\u5546\u52A1\u6761\u6B3E"),
  format: () => (0, import_i18n4.t)("\u683C\u5F0F\u8981\u6C42")
};
function requirementKindLabel(kind) {
  return (KIND_LABEL[kind] || (() => kind))();
}
var LANG_LABEL = {
  "zh-CN": () => (0, import_i18n4.t)("\u7B80\u4F53\u4E2D\u6587"),
  "en-US": () => (0, import_i18n4.t)("\u82F1\u6587"),
  ar: () => (0, import_i18n4.t)("\u963F\u62C9\u4F2F\u6587")
};
function goalPrompt(options) {
  const lang = (LANG_LABEL[options.lang] || LANG_LABEL["zh-CN"])();
  const lines = [
    (0, import_i18n4.t)("\u7ED9\u4E00\u4E2A\u6295\u6807\u9879\u76EE\u5199\u4E00\u53E5\u8BDD\u6295\u6807\u76EE\u6807\uFF08\u5199\u7ED9\u5185\u90E8\u770B\uFF0C\u540E\u9762\u6BCF\u4E00\u7AE0\u90FD\u6309\u5B83\u5B9A\u8C03\uFF09\u3002"),
    (0, import_i18n4.t)("\u7528{lang}\u5199\uFF0C\u53EA\u8F93\u51FA\u8FD9\u6BB5\u6587\u5B57\u672C\u8EAB\uFF1A\u4E0D\u8981\u6807\u9898\u3001\u4E0D\u8981\u89E3\u91CA\u3001\u4E0D\u8981\u5F15\u53F7\u3001\u4E0D\u8981 Markdown\u3002", { lang }),
    (0, import_i18n4.t)("\u957F\u5EA6 60\uFF5E140 \u5B57\uFF0C\u4E00\u5230\u4E24\u53E5\u3002"),
    "",
    `${(0, import_i18n4.t)("\u9879\u76EE\u540D\u79F0")}\uFF1A${options.projectName || (0, import_i18n4.t)("\uFF08\u672A\u586B\uFF09")}`,
    `${(0, import_i18n4.t)("\u6295\u6807\u4EBA")}\uFF1A${options.bidder || (0, import_i18n4.t)("\uFF08\u672A\u586B\uFF09")}`,
    `${(0, import_i18n4.t)("\u91C7\u8D2D\u4EBA")}\uFF1A${options.buyer || (0, import_i18n4.t)("\uFF08\u516C\u544A\u672A\u5199\u660E\uFF09")}`,
    `${(0, import_i18n4.t)("\u9884\u7B97\u91D1\u989D")}\uFF1A${options.budget || (0, import_i18n4.t)("\uFF08\u516C\u544A\u672A\u5199\u660E\uFF09")}`,
    `${(0, import_i18n4.t)("\u6211\u65B9\u9009\u5B9A\u7684\u53D6\u80DC\u4FA7\u91CD")}\uFF1A${options.strategies.join((0, import_i18n4.t)("\u3001")) || (0, import_i18n4.t)("\uFF08\u672A\u9009\uFF09")}`
  ];
  if (options.scoring.length) {
    lines.push((0, import_i18n4.t)("\u62DB\u6807\u6587\u4EF6\u7684\u8BC4\u5206\u529E\u6CD5\uFF08\u5199\u76EE\u6807\u65F6\u8981\u5BF9\u4E0A\u5206\u503C\u5927\u7684\u90A3\u51E0\u9879\uFF09\uFF1A"));
    lines.push(...options.scoring.slice(0, 8).map((t) => `- ${t}`));
  }
  lines.push(
    "",
    (0, import_i18n4.t)("\u786C\u89C4\u5219\uFF1A"),
    (0, import_i18n4.t)("1. \u53EA\u80FD\u7528\u4E0A\u9762\u7ED9\u51FA\u7684\u4FE1\u606F\u3002\u7EDD\u5BF9\u4E0D\u8BB8\u7F16\u6BDB\u5229\u7387\u3001\u5DE5\u671F\u3001\u62A5\u4EF7\u3001\u4E1A\u7EE9\u6570\u91CF\u8FD9\u7C7B\u5177\u4F53\u6570\u5B57 \u2014\u2014 \u6CA1\u7ED9\u5C31\u4E0D\u8981\u63D0\u6570\u5B57\u3002"),
    (0, import_i18n4.t)("2. \u628A\u9009\u4E2D\u7684\u4FA7\u91CD\u9010\u4E2A\u843D\u5230\u5B9E\u5904\uFF08\u9009\u4E86\u4EC0\u4E48\u5C31\u8BF4\u9760\u4EC0\u4E48\u8D62\uFF09\uFF0C\u6CA1\u9009\u7684\u4E0D\u8981\u786C\u52A0\u3002"),
    (0, import_i18n4.t)('3. \u5199\u6210\u9648\u8FF0\u53E5\uFF0C\u4E0D\u8981"\u6211\u4EEC\u5EFA\u8BAE""\u53EF\u4EE5\u8003\u8651"\u8FD9\u79CD\u53E3\u543B\u3002')
  );
  return lines.join("\n");
}
function noticeExtractPrompt(text) {
  return [
    (0, import_i18n4.t)("\u4F60\u5728\u8BFB\u4E00\u4EFD\u62DB\u6807\u516C\u544A\uFF0C\u4EFB\u52A1\u662F\u628A\u5176\u4E2D\u7684\u8981\u6C42**\u9010\u6761\u6284\u51FA\u6765**\uFF0C\u4E0D\u662F\u603B\u7ED3\u3002"),
    (0, import_i18n4.t)("\u53EA\u8F93\u51FA\u4E00\u4E2A JSON \u5BF9\u8C61\uFF0C\u4E0D\u8981\u4EFB\u4F55\u89E3\u91CA\u6587\u5B57\uFF0C\u7ED3\u6784\u5982\u4E0B\uFF1A"),
    '{"requirements":[{"kind":"qualification|scoring|deliverable|technical|commercial|format","text":"\u8981\u6C42\u539F\u6587\uFF08\u53EF\u53BB\u6389\u7F16\u53F7\uFF0C\u4F46\u4E0D\u5F97\u6539\u5199\u542B\u4E49\uFF09","points":\u6570\u5B57\u6216\u7701\u7565,"mandatory":true\u6216false}]}',
    (0, import_i18n4.t)("\u89C4\u5219\uFF1A"),
    (0, import_i18n4.t)("1. text \u5FC5\u987B\u662F\u516C\u544A\u91CC\u51FA\u73B0\u8FC7\u7684\u539F\u8BDD\uFF0C\u5141\u8BB8\u53BB\u6389\u5E8F\u53F7\u548C\u591A\u4F59\u7A7A\u683C\uFF0C\u4E0D\u8BB8\u6982\u62EC\u3001\u4E0D\u8BB8\u5408\u5E76\u3001\u4E0D\u8BB8\u8865\u5145\u516C\u544A\u91CC\u6CA1\u6709\u7684\u5185\u5BB9\u3002"),
    (0, import_i18n4.t)("2. kind \u7684\u542B\u4E49\uFF1Aqualification=\u6295\u6807\u4EBA\u8D44\u683C\u95E8\u69DB\uFF1Bscoring=\u8BC4\u5206/\u8BC4\u5BA1\u529E\u6CD5\uFF1Bdeliverable=\u6295\u6807\u6587\u4EF6\u5FC5\u987B\u5305\u542B\u7684\u6750\u6599\uFF1Btechnical=\u6280\u672F\u6216\u670D\u52A1\u9700\u6C42\uFF1Bcommercial=\u5DE5\u671F\u3001\u4ED8\u6B3E\u3001\u8D28\u4FDD\u7B49\u5546\u52A1\u6761\u6B3E\uFF1Bformat=\u4EFD\u6570\u3001\u5BC6\u5C01\u3001\u7B7E\u7AE0\u3001\u88C5\u8BA2\u7B49\u683C\u5F0F\u8981\u6C42\u3002"),
    (0, import_i18n4.t)("3. \u8BC4\u5206\u9879\u82E5\u5199\u660E\u5206\u503C\uFF0C\u586B\u8FDB points\u3002"),
    (0, import_i18n4.t)('4. \u5E26"\u5FC5\u987B/\u5E94\u5F53/\u5426\u5219\u4F5C\u5E9F\u6807"\u7684\u6761\u76EE mandatory \u7F6E true\u3002'),
    (0, import_i18n4.t)("5. \u6700\u591A 60 \u6761\uFF0C\u4F18\u5148\u8D44\u683C\u8981\u6C42\u3001\u8BC4\u5206\u529E\u6CD5\u4E0E\u5FC5\u4EA4\u6750\u6599\u3002"),
    (0, import_i18n4.t)("\u516C\u544A\u6B63\u6587\u5982\u4E0B\uFF1A"),
    "---",
    text.slice(0, 6e4)
  ].join("\n");
}
function qualificationPrompt(requirements, facts) {
  return [
    (0, import_i18n4.t)("\u4E0B\u9762\u662F\u4E00\u4EFD\u62DB\u6807\u516C\u544A\u7684\u8D44\u683C\u8981\u6C42\uFF0C\u4EE5\u53CA\u6211\u65B9\u516C\u53F8\u5728\u77E5\u8BC6\u5E93\u91CC\u767B\u8BB0\u7684\u4E8B\u5B9E\u3002\u8BF7\u9010\u6761\u5224\u65AD\u6211\u65B9\u662F\u5426\u6EE1\u8DB3\u3002"),
    // JSON 结构不能进 key（花括号是 vue-i18n 占位符语法），作为参数拼回去
    (0, import_i18n4.t)("\u53EA\u8F93\u51FA JSON\uFF1A{schema}", { schema: '{"checks":[{"requirementId":"...","verdict":"met|unmet|unknown","evidence":"\u4F9D\u636E\u54EA\u6761\u516C\u53F8\u4E8B\u5B9E\uFF08\u539F\u6587\u5F15\u7528\uFF09","note":"\u4E00\u53E5\u8BDD\u8BF4\u660E"}]}' }),
    (0, import_i18n4.t)("\u5224\u5B9A\u89C4\u5219\uFF1A\u53EA\u80FD\u4F9D\u636E\u4E0B\u9762\u5217\u51FA\u7684\u516C\u53F8\u4E8B\u5B9E\uFF1B\u4E8B\u5B9E\u91CC\u6CA1\u6709\u63D0\u5230\u7684\u4E00\u5F8B\u5224 unknown\uFF0C\u7EDD\u4E0D\u63A8\u6D4B\u3002\u4E8B\u5B9E\u660E\u786E\u4E0D\u6EE1\u8DB3\uFF08\u5982\u8981\u6C42\u4E09\u5E74\u4E1A\u7EE9\u800C\u6211\u65B9\u6210\u7ACB\u4E0D\u8DB3\u4E09\u5E74\uFF09\u624D\u5224 unmet\u3002"),
    (0, import_i18n4.t)("\u8D44\u683C\u8981\u6C42\uFF1A"),
    ...requirements.map((r) => `- [${r.id}] ${r.text}`),
    (0, import_i18n4.t)("\u516C\u53F8\u4E8B\u5B9E\uFF1A"),
    ...facts.filter((f) => f.value).map((f) => `- ${f.label}\uFF1A${f.value}`)
  ].join("\n");
}
function sectionPrompt(options) {
  const { project, section, requirements, company, knowledgeExcerpts, templateExcerpt, instruction, partHeading } = options;
  const lang = (LANG_LABEL[project.lang] || LANG_LABEL["zh-CN"])();
  const lines = [
    (0, import_i18n4.t)("\u4F60\u662F\u4E00\u540D\u8D44\u6DF1\u6807\u4E66\u64B0\u5199\u4EBA\uFF0C\u6B63\u5728\u4E3A\u4E00\u4E2A\u771F\u5B9E\u6295\u6807\u9879\u76EE\u64B0\u5199\u6295\u6807\u6587\u4EF6\u4E2D\u7684\u4E00\u7AE0\u3002"),
    (0, import_i18n4.t)('\u7528{lang}\u5199\u4F5C\u3002\u53EA\u8F93\u51FA\u8FD9\u4E00\u7AE0\u7684\u6B63\u6587\uFF0C\u4E0D\u8981\u5199\u6807\u9898\u3001\u4E0D\u8981\u5199"\u4EE5\u4E0B\u662F\u2026"\u4E4B\u7C7B\u7684\u5F00\u573A\u767D\u3001\u4E0D\u8981\u7528 Markdown \u4EE3\u7801\u5757\u5305\u88F9\u3002', { lang }),
    "",
    (0, import_i18n4.t)("\u3010\u9879\u76EE\u4FE1\u606F\u3011"),
    `${(0, import_i18n4.t)("\u9879\u76EE\u540D\u79F0")}\uFF1A${project.name}`,
    `${(0, import_i18n4.t)("\u91C7\u8D2D\u4EBA")}\uFF1A${project.notice?.buyer || (0, import_i18n4.t)("\uFF08\u516C\u544A\u672A\u5199\u660E\uFF09")}`,
    `${(0, import_i18n4.t)("\u62DB\u6807\u7F16\u53F7")}\uFF1A${project.notice?.projectCode || (0, import_i18n4.t)("\uFF08\u516C\u544A\u672A\u5199\u660E\uFF09")}`,
    `${(0, import_i18n4.t)("\u6295\u6807\u4EBA")}\uFF1A${project.bidder || (0, import_i18n4.t)("\uFF08\u672A\u586B\u5199\uFF09")}`,
    `${(0, import_i18n4.t)("\u6295\u6807\u76EE\u6807")}\uFF1A${project.goal || (0, import_i18n4.t)("\uFF08\u672A\u586B\u5199\uFF09")}`
  ];
  if (project.strategies?.length) lines.push(`${(0, import_i18n4.t)("\u4FA7\u91CD")}\uFF1A${project.strategies.join((0, import_i18n4.t)("\u3001"))}`);
  lines.push("", (0, import_i18n4.t)("\u3010\u672C\u7AE0\u8981\u6C42\u3011"), `${(0, import_i18n4.t)("\u7AE0\u8282\u6807\u9898")}\uFF1A${section.title}`);
  if (partHeading) {
    lines.push(
      (0, import_i18n4.t)("\u8FD9\u662F\u4E00\u4E2A**\u90E8\u5206\u7EA7\u6807\u9898**\uFF0C\u4E0B\u9762\u8FD8\u6709\u5404\u81EA\u72EC\u7ACB\u7684\u5B50\u7AE0\u8282\u3002"),
      (0, import_i18n4.t)("\u53EA\u5199 80\uFF5E150 \u5B57\u7684\u5F15\u8A00\uFF1A\u8BF4\u660E\u672C\u90E8\u5206\u5305\u542B\u54EA\u4E9B\u5185\u5BB9\u3001\u7F16\u5236\u4F9D\u636E\u662F\u4EC0\u4E48\u3002"),
      (0, import_i18n4.t)("**\u7EDD\u5BF9\u4E0D\u8981**\u7F57\u5217\u62A5\u4EF7\u3001\u5DE5\u671F\u3001\u8BC1\u4E66\u7F16\u53F7\u3001\u4EBA\u5458\u540D\u5355\u8FD9\u7C7B\u5177\u4F53\u4FE1\u606F\uFF08\u90A3\u4E9B\u5728\u5B50\u7AE0\u8282\u91CC\u5199\uFF09\uFF0C\u66F4\u4E0D\u8981\u51FA\u73B0\u4EFB\u4F55\u5360\u4F4D\u7B26\u3002")
    );
  }
  if (section.guide) lines.push(`${(0, import_i18n4.t)("\u6A21\u677F\u91CC\u7684\u586B\u5199\u8BF4\u660E")}\uFF1A${section.guide}`);
  if (templateExcerpt) {
    lines.push((0, import_i18n4.t)("\u6A21\u677F\u4E2D\u8FD9\u4E00\u7AE0\u7684\u539F\u6587\u7247\u6BB5\uFF08\u7167\u5B83\u7684\u7ED3\u6784\u548C\u53E3\u543B\u5199\uFF0C\u4E0D\u8981\u7167\u6284\u91CC\u9762\u7684\u793A\u4F8B\u6570\u636E\uFF09\uFF1A"), templateExcerpt.slice(0, 3e3));
  }
  const notice = project.notice || { requirements: [] };
  const noticeFacts = [
    notice.agency ? `${(0, import_i18n4.t)("\u4EE3\u7406\u673A\u6784")}\uFF1A${notice.agency}` : "",
    notice.budget ? `${(0, import_i18n4.t)("\u9884\u7B97\u91D1\u989D")}\uFF1A${notice.budget}` : "",
    notice.deposit ? `${(0, import_i18n4.t)("\u6295\u6807\u4FDD\u8BC1\u91D1")}\uFF1A${notice.deposit}` : "",
    notice.bidDeadline ? `${(0, import_i18n4.t)("\u6295\u6807\u622A\u6B62\u65F6\u95F4")}\uFF1A${notice.bidDeadline}` : "",
    notice.openAt ? `${(0, import_i18n4.t)("\u5F00\u6807\u65F6\u95F4")}\uFF1A${notice.openAt}` : "",
    notice.contact ? `${(0, import_i18n4.t)("\u8054\u7CFB\u65B9\u5F0F")}\uFF1A${notice.contact}` : ""
  ].filter(Boolean);
  if (noticeFacts.length) {
    lines.push("", (0, import_i18n4.t)("\u3010\u516C\u544A\u91CC\u5DF2\u7ECF\u5199\u660E\u7684\u4E8B\u5B9E\uFF08\u76F4\u63A5\u7528\uFF0C\u4E0D\u8981\u5199\u6210\u5360\u4F4D\uFF09\u3011"), ...noticeFacts.map((t) => `- ${t}`));
  }
  if (requirements.length) {
    lines.push("", (0, import_i18n4.t)("\u3010\u5FC5\u987B\u9010\u6761\u54CD\u5E94\u7684\u62DB\u6807\u8981\u6C42\u3011"));
    lines.push(...requirements.map((r) => `- \uFF08${requirementKindLabel(r.kind)}${r.points ? ` ${r.points}${(0, import_i18n4.t)("\u5206")}` : ""}\uFF09${r.text}`));
  }
  const known = company.filter((f) => String(f.value || "").trim());
  if (known.length) {
    lines.push("", (0, import_i18n4.t)("\u3010\u53EF\u7528\u7684\u516C\u53F8\u4E8B\u5B9E\uFF08\u552F\u4E00\u53EF\u4FE1\u6765\u6E90\uFF09\u3011"));
    lines.push(...known.map((f) => `- ${f.label}\uFF1A${f.value}`));
  }
  if (knowledgeExcerpts.length) {
    lines.push("", (0, import_i18n4.t)("\u3010\u77E5\u8BC6\u5E93\u539F\u6587\u6458\u5F55\uFF08\u53EF\u5F15\u7528\uFF09\u3011"));
    lines.push(...knowledgeExcerpts.map((k) => `- \u300A${k.label}\u300B\uFF1A${k.text.slice(0, 600)}`));
  }
  lines.push(
    "",
    (0, import_i18n4.t)("\u3010\u5199\u4F5C\u786C\u89C4\u5219\u3011"),
    (0, import_i18n4.t)('1. \u516C\u53F8\u540D\u79F0\u3001\u8D44\u8D28\u7F16\u53F7\u3001\u4E1A\u7EE9\u3001\u4EBA\u6570\u3001\u91D1\u989D\u3001\u5E74\u9650\u7B49\u5177\u4F53\u4FE1\u606F\uFF0C\u53EA\u80FD\u7528\u4E0A\u9762\u7ED9\u51FA\u7684\u4E8B\u5B9E\u3002\u4E0A\u9762\u6CA1\u6709\u7684\uFF0C\u5199\u6210\u3010\u5F85\u8865\u5145\uFF1A\u9700\u8981\u4EC0\u4E48\u4FE1\u606F\u3011\u5360\u4F4D\uFF0C\u7EDD\u5BF9\u4E0D\u8BB8\u7F16\u9020\uFF0C\u4E5F\u4E0D\u8BB8\u7528"\u67D0\u67D0""XX"\u7CCA\u5F04\u3002'),
    (0, import_i18n4.t)("1a. \u4E0A\u9762\u3010\u53EF\u7528\u7684\u516C\u53F8\u4E8B\u5B9E\u3011\u91CC\u5DF2\u7ECF\u7ED9\u51FA\u7684\u503C\uFF0C\u5FC5\u987B\u539F\u6837\u6284\u8FDB\u6B63\u6587\uFF08\u6BD4\u5982\u4FE1\u7528\u4EE3\u7801\u8981\u5199\u5168\u90A3\u4E32\u5B57\u7B26\uFF09\uFF0C\u4E0D\u8BB8\u518D\u5199\u6210\u3010XXX\u3011\u8FD9\u7C7B\u81EA\u521B\u7684\u5360\u4F4D\u6807\u8BB0 \u2014\u2014 \u53EA\u6709\u4E8B\u5B9E\u91CC\u786E\u5B9E\u6CA1\u6709\u7684\u624D\u7528\u3010\u5F85\u8865\u5145\uFF1A\u2026\u3011\u3002"),
    (0, import_i18n4.t)("1b. \u4E0A\u9762\u3010\u9879\u76EE\u4FE1\u606F\u3011\u4E0E\u3010\u53EF\u7528\u7684\u516C\u53F8\u4E8B\u5B9E\u3011\u91CC**\u5DF2\u7ECF\u7ED9\u51FA\u7684\u503C\uFF0C\u5FC5\u987B\u76F4\u63A5\u5199\u8FDB\u6B63\u6587**\uFF08\u91C7\u8D2D\u4EBA\u3001\u62DB\u6807\u7F16\u53F7\u3001\u6295\u6807\u4EBA\u5168\u79F0\u3001\u4FE1\u7528\u4EE3\u7801\u3001\u8D44\u8D28\u3001\u4E1A\u7EE9\u3001\u56E2\u961F\u3001\u8D28\u4FDD\u4E0E\u54CD\u5E94\u65F6\u6548\u90FD\u5728\u91CC\u9762\uFF09\uFF0C\u4E00\u4E2A\u5B57\u90FD\u4E0D\u8BB8\u518D\u5199\u6210\u5360\u4F4D\u3002"),
    (0, import_i18n4.t)("1c. \u5360\u4F4D\u8981**\u514B\u5236**\uFF1A\u540C\u4E00\u9879\u4FE1\u606F\u5728\u672C\u7AE0\u53EA\u5199\u4E00\u6B21\uFF0C\u540E\u6587\u7528\u300C\u4E0A\u8FF0\u62A5\u4EF7\u300D\u300C\u524D\u8FF0\u5DE5\u671F\u300D\u5F15\u7528\uFF1B\u4E0D\u8981\u628A\u300C\u5355\u4EF7\u300D\u300C\u5408\u4EF7\u300D\u300C\u5408\u8BA1\u300D\u62C6\u6210\u4E09\u5904\u5360\u4F4D\uFF1B\u8868\u683C\u91CC\u80FD\u5199\u300C\u8BE6\u89C1\u62A5\u4EF7\u8868\u300D\u7684\u5C31\u4E0D\u8981\u9010\u683C\u5360\u4F4D\u3002"),
    (0, import_i18n4.t)("1d. \u5360\u4F4D\u540D**\u53EA\u80FD\u4ECE\u8FD9\u4EFD\u6E05\u5355\u91CC\u9009**\uFF1A\u6295\u6807\u603B\u62A5\u4EF7\u3001\u5927\u5199\u91D1\u989D\u3001\u5DE5\u671F\u3001\u8D28\u4FDD\u5E74\u9650\u3001\u9879\u76EE\u7ECF\u7406\u59D3\u540D\u3001\u6388\u6743\u4EE3\u8868\u59D3\u540D\u3001\u6388\u6743\u4EE3\u8868\u8EAB\u4EFD\u8BC1\u53F7\u3001\u62A5\u4EF7\u660E\u7EC6\u3001\u504F\u79BB\u8BF4\u660E\u3001\u627F\u8BFA\u4E8B\u9879\u3002\u6E05\u5355\u4E4B\u5916\u7684\u4FE1\u606F\uFF0C\u6709\u4E8B\u5B9E\u5C31\u5199\u4E8B\u5B9E\uFF0C\u6CA1\u6709\u5C31\u6574\u53E5\u4E0D\u5199 \u2014\u2014 \u4E0D\u8981\u81EA\u521B\u300C\u6BD4\u4F8B\u300D\u300C\u4EBA\u6570\u300D\u300C\u4F53\u7CFB\u8BA4\u8BC1\u300D\u8FD9\u7C7B\u770B\u4E0D\u61C2\u8981\u586B\u4EC0\u4E48\u7684\u5360\u4F4D\u3002"),
    (0, import_i18n4.t)("2. \u5BF9\u6BCF\u6761\u62DB\u6807\u8981\u6C42\u90FD\u8981\u6709\u5BF9\u5E94\u7684\u54CD\u5E94\u6587\u5B57\uFF0C\u4E0D\u8981\u6F0F\u6761\u3002"),
    (0, import_i18n4.t)('3. \u5199\u6210\u53EF\u4EE5\u76F4\u63A5\u653E\u8FDB\u6295\u6807\u6587\u4EF6\u7684\u6B63\u5F0F\u6BB5\u843D\uFF1A\u5206\u5C0F\u6807\u9898\u3001\u5FC5\u8981\u65F6\u7528\u6761\u76EE\u5217\u4E3E\uFF0C\u4E0D\u5199"\u6211\u4EEC\u5EFA\u8BAE"\u8FD9\u7C7B\u54A8\u8BE2\u53E3\u543B\u3002'),
    (0, import_i18n4.t)("4. \u7BC7\u5E45 600\uFF5E1200 \u5B57\uFF1B\u5185\u5BB9\u786E\u5B9E\u5C11\u7684\u7AE0\u8282\u53EF\u4EE5\u77ED\uFF0C\u4F46\u4E0D\u8981\u4E3A\u51D1\u5B57\u6570\u91CD\u590D\u3002"),
    (0, import_i18n4.t)('5. \u4E0D\u8981\u51FA\u73B0"\u4F5C\u4E3AAI""\u6839\u636E\u4F60\u63D0\u4F9B\u7684\u8D44\u6599"\u8FD9\u7C7B\u8BDD\u3002')
  );
  if (instruction) lines.push("", (0, import_i18n4.t)("\u3010\u672C\u6B21\u4FEE\u6539\u610F\u89C1\uFF08\u4F18\u5148\u6EE1\u8DB3\uFF09\u3011"), instruction.slice(0, 1e3));
  return lines.join("\n");
}

// ../totalclaw-solutions/solutions/workbench-bid-writer/src/main/ipc/bidWriter.ipc.ts
var import_docx = require("host:apps/desktop-shell/src/main/services/bidWriter/docx.ts");
var import_llmReply = require("host:apps/desktop-shell/src/main/services/bidWriter/llmReply.ts");

// ../totalclaw-solutions/solutions/workbench-bid-writer/src/main/services/bidWriter/store.ts
var import_node_fs = require("node:fs");
var import_node_path = require("node:path");
var import_i18n5 = require("npm:@totalclaw/i18n");
var import_accountScope = require("host:apps/desktop-shell/src/main/services/accountScope.ts");
var BID_WRITER_STATE_VERSION = 1;
var MAX_NOTICE_TEXT = 12e4;
var MAX_SECTION_TEXT = 4e5;
var MAX_SNAPSHOT_BYTES = 40 * 1024 * 1024;
function privateDir() {
  return (0, import_accountScope.accountPath)("bid-writer");
}
function snapshotPath() {
  return (0, import_node_path.join)(privateDir(), "projects.json");
}
function settingsPath() {
  return (0, import_node_path.join)(privateDir(), "settings.json");
}
function defaultDocRoot() {
  return privateDir();
}
function docRoot() {
  try {
    const p = settingsPath();
    if (!(0, import_node_fs.existsSync)(p)) return defaultDocRoot();
    const raw = JSON.parse((0, import_node_fs.readFileSync)(p, "utf-8"));
    const custom = String(raw?.docRoot || "").trim();
    if (!custom || !(0, import_node_path.isAbsolute)(custom)) return defaultDocRoot();
    if (!(0, import_node_fs.existsSync)(custom) || !(0, import_node_fs.statSync)(custom).isDirectory()) return defaultDocRoot();
    return custom;
  } catch {
    return defaultDocRoot();
  }
}
function setDocRoot(nextRaw) {
  const next = String(nextRaw || "").trim();
  if (next && (!(0, import_node_path.isAbsolute)(next) || !(0, import_node_fs.existsSync)(next) || !(0, import_node_fs.statSync)(next).isDirectory())) {
    throw new Error((0, import_i18n5.t)("\u8FD9\u4E2A\u76EE\u5F55\u4E0D\u5B58\u5728\uFF0C\u8BF7\u91CD\u65B0\u9009\u62E9"));
  }
  (0, import_node_fs.mkdirSync)(privateDir(), { recursive: true });
  const temp = `${settingsPath()}.tmp`;
  (0, import_node_fs.writeFileSync)(temp, JSON.stringify({ docRoot: next || "" }, null, 2), { encoding: "utf-8", mode: 384 });
  (0, import_node_fs.renameSync)(temp, settingsPath());
  return docRoot();
}
function projectDir(projectId, projectName) {
  const id = String(projectId || "").replace(/[^A-Za-z0-9_-]/g, "") || "project";
  const name = safeFileName(String(projectName || "").trim());
  const folder = projectName ? `${name}-${id.slice(-6)}` : id;
  const dir = (0, import_node_path.join)(docRoot(), folder);
  (0, import_node_fs.mkdirSync)(dir, { recursive: true });
  return dir;
}
function emptyState() {
  return { version: BID_WRITER_STATE_VERSION, projects: [], currentId: "" };
}
function readState() {
  try {
    const p = snapshotPath();
    if (!(0, import_node_fs.existsSync)(p)) return emptyState();
    const raw = JSON.parse((0, import_node_fs.readFileSync)(p, "utf-8"));
    if (raw?.version !== BID_WRITER_STATE_VERSION || !Array.isArray(raw.projects)) return emptyState();
    return raw;
  } catch {
    return emptyState();
  }
}
function trimProject(project) {
  const p = { ...project };
  if (p.notice?.text && p.notice.text.length > MAX_NOTICE_TEXT) {
    p.notice = { ...p.notice, text: `${p.notice.text.slice(0, MAX_NOTICE_TEXT)}
${(0, import_i18n5.t)("\u2026\uFF08\u5DF2\u622A\u65AD\uFF09")}` };
  }
  p.sections = (p.sections || []).map((s) => s.content && s.content.length > MAX_SECTION_TEXT ? { ...s, content: s.content.slice(0, MAX_SECTION_TEXT) } : s);
  return p;
}
function writeState(state) {
  if (!state || state.version !== BID_WRITER_STATE_VERSION || !Array.isArray(state.projects)) {
    throw new Error((0, import_i18n5.t)("\u6807\u4E66\u5DE5\u4F5C\u53F0\u5FEB\u7167\u683C\u5F0F\u65E0\u6548"));
  }
  const trimmed = { ...state, projects: state.projects.map(trimProject) };
  const serialized = JSON.stringify(trimmed, null, 2);
  if (Buffer.byteLength(serialized, "utf-8") > MAX_SNAPSHOT_BYTES) {
    throw new Error((0, import_i18n5.t)("\u6807\u4E66\u5DE5\u4F5C\u53F0\u6570\u636E\u8D85\u8FC7 40MB\uFF0C\u8BF7\u5220\u9664\u4E0D\u518D\u9700\u8981\u7684\u9879\u76EE\u540E\u91CD\u8BD5"));
  }
  (0, import_node_fs.mkdirSync)(privateDir(), { recursive: true });
  const target = snapshotPath();
  const temp = `${target}.tmp`;
  (0, import_node_fs.writeFileSync)(temp, serialized, { encoding: "utf-8", mode: 384 });
  (0, import_node_fs.renameSync)(temp, target);
}
function findProject(state, projectId) {
  const found = state.projects.find((p) => p.id === projectId);
  if (!found) throw new Error((0, import_i18n5.t)("\u627E\u4E0D\u5230\u8FD9\u4E2A\u6807\u4E66\u9879\u76EE\uFF0C\u53EF\u80FD\u5DF2\u88AB\u5220\u9664"));
  return found;
}
function safeFileName(raw) {
  return String(raw || "").replace(/[\\/:*?"<>|\n\r\t]/g, "_").replace(/\s+/g, " ").trim().slice(0, 60) || "bid-document";
}

// ../totalclaw-solutions/solutions/workbench-bid-writer/src/main/ipc/bidWriter.ipc.ts
var COMPOSE_TIMEOUT_MS = 24e4;
var EXTRACT_TIMEOUT_MS = 18e4;
var COMPANY_FIELD_KEYS = [
  "company_name",
  "uscc",
  "legal_rep",
  "reg_capital",
  "established",
  "address",
  "phone",
  "email",
  "website",
  "business_scope",
  "main_business",
  "intro"
];
function extraFieldDefs() {
  return [
    { key: "bid_qualifications", label: (0, import_i18n6.t)("\u8D44\u8D28\u4E0E\u8BA4\u8BC1"), query: import_matchPatterns5.EVIDENCE_QUERIES.qualifications },
    { key: "bid_performance", label: (0, import_i18n6.t)("\u7C7B\u4F3C\u9879\u76EE\u4E1A\u7EE9"), query: import_matchPatterns5.EVIDENCE_QUERIES.performance },
    { key: "bid_team", label: (0, import_i18n6.t)("\u9879\u76EE\u4EBA\u5458\u914D\u5907"), query: import_matchPatterns5.EVIDENCE_QUERIES.team }
  ];
}
function emit(deps, event) {
  try {
    deps.getMainWindow()?.webContents.send(import_ipc_contracts.IPC_CHANNELS.WORKBENCH_BW_EVENT, event);
  } catch {
  }
}
function parseModelJson(raw) {
  try {
    return (0, import_llmReply.parseJsonLoose)(raw);
  } catch {
    throw new Error((0, import_i18n6.t)("\u6A21\u578B\u6CA1\u6709\u8FD4\u56DE\u53EF\u89E3\u6790\u7684\u7ED3\u6784\u5316\u7ED3\u679C\uFF0C\u8BF7\u91CD\u8BD5\u6216\u6539\u7528\u7EAF\u89C4\u5219\u62BD\u53D6"));
  }
}
async function llm(deps, prompt, timeoutMs) {
  let reply;
  try {
    reply = await (0, import_councilChatRouter.runOneshotChat)(deps, prompt, { plainCompletion: true, timeoutMs });
  } catch (e) {
    const msg = String(e?.message || e);
    if (/SessionProvider|engineRegistry|未就绪|API key|api_key|not.*ready|provider/i.test(msg)) {
      throw new Error((0, import_i18n6.t)("AI \u5927\u8111\u5C1A\u672A\u5C31\u7EEA\uFF0C\u8BF7\u5230\u300C\u8BBE\u7F6E \u2192 \u6A21\u578B\u914D\u7F6E\u300D\u5B8C\u6210\u914D\u7F6E\u540E\u91CD\u8BD5"));
    }
    throw e;
  }
  if ((0, import_llmReply.isChannelErrorReply)(reply)) {
    const first = reply.replace(/\s+/g, " ").trim().slice(0, 160);
    throw new Error((0, import_i18n6.t)("\u5927\u6A21\u578B\u901A\u9053\u8FD4\u56DE\u7684\u662F\u9519\u8BEF\u800C\u4E0D\u662F\u6B63\u6587\uFF1A{m}", { m: first }));
  }
  return reply;
}
function llmReady(deps) {
  try {
    return !!deps.engineRegistry?.getActive?.();
  } catch {
    return false;
  }
}
function requirementId2(prefix, index) {
  return `${prefix}_${index.toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
}
function knowledgeFacts() {
  try {
    const store = (0, import_service.knowledgeStore)();
    const graphId = store.currentGraphId();
    return (0, import_retrieval.rankFacts)(store.facts(graphId)).map((f) => ({
      field: f.field,
      label: (0, import_fieldCatalog.fieldLabel)(f.field),
      value: f.value,
      docName: f.sources?.[0] ? store.doc(f.sources[0].docId)?.name : void 0,
      evidence: f.sources?.[0]?.evidence
    }));
  } catch {
    return [];
  }
}
function knowledgeSummary() {
  try {
    const store = (0, import_service.knowledgeStore)();
    const graphId = store.currentGraphId();
    const state = store.graphState(graphId);
    const built = Object.values(state.docs || {}).filter((d) => d?.builtAt).length;
    const facts = store.facts(graphId);
    const ranked = (0, import_retrieval.rankFacts)(facts);
    const company = ranked.find((f) => f.field === "company_name")?.value;
    const near = company ? void 0 : ranked.find((f) => ["company_short_name", "english_name", "brand"].includes(f.field));
    return {
      docCount: store.docs().length,
      builtCount: built,
      factCount: facts.length,
      companyName: company,
      nearestName: near ? { label: (0, import_fieldCatalog.fieldLabel)(near.field), value: near.value } : void 0
    };
  } catch {
    return { docCount: 0, builtCount: 0, factCount: 0 };
  }
}
async function knowledgeSearch(query, topK) {
  try {
    const store = (0, import_service.knowledgeStore)();
    const graphId = store.currentGraphId();
    const r = await (0, import_retrieval.searchGraph)(store, graphId, query, topK, (0, import_service.graphQueryEmbedder)(graphId));
    return r.hits.map((h) => ({ docId: h.docId, docName: h.docName, text: h.text, score: h.score, chunkIndex: h.chunkIndex }));
  } catch {
    return [];
  }
}
function joinExcerptsInOrder(hits, perChunk = 600, total = 2500) {
  const ordered = [...hits].sort((a, b) => a.docId === b.docId ? a.chunkIndex - b.chunkIndex : a.docId.localeCompare(b.docId));
  let out = "";
  for (const h of ordered) {
    const piece = h.text.replace(/\s+/g, " ").trim().slice(0, perChunk);
    if (!piece) continue;
    if (out.length + piece.length > total) break;
    out += (out ? "\n" : "") + piece;
  }
  return out;
}
async function llmRequirements(deps, text, sourceLabel, locator) {
  try {
    const raw = await llm(deps, noticeExtractPrompt(text), EXTRACT_TIMEOUT_MS);
    const parsed = parseModelJson(raw);
    const list = Array.isArray(parsed?.requirements) ? parsed.requirements : [];
    const kept = [];
    let dropped = 0;
    list.slice(0, 80).forEach((item2, index) => {
      const body = String(item2?.text || "").trim();
      if (body.length < 6) return;
      if (!verifyAgainstText(text, body)) {
        dropped += 1;
        return;
      }
      const kind = ["qualification", "scoring", "deliverable", "technical", "commercial", "format"].includes(String(item2?.kind)) ? String(item2.kind) : "technical";
      kept.push({
        id: requirementId2("llm", index),
        kind,
        text: body.slice(0, 400),
        points: Number.isFinite(Number(item2?.points)) && Number(item2.points) > 0 ? Number(item2.points) : void 0,
        mandatory: Boolean(item2?.mandatory),
        source: { kind: "notice", label: sourceLabel, locator, quote: body.slice(0, 160) }
      });
    });
    return {
      requirements: kept,
      warning: dropped ? (0, import_i18n6.t)("\u6A21\u578B\u7ED9\u51FA\u7684 {n} \u6761\u5185\u5BB9\u5728\u516C\u544A\u539F\u6587\u91CC\u627E\u4E0D\u5230\u4F9D\u636E\uFF0C\u5DF2\u4E22\u5F03\uFF08\u9632\u7F16\u9020\uFF09\u3002", { n: String(dropped) }) : void 0
    };
  } catch (e) {
    return { requirements: [], warning: (0, import_i18n6.t)("\u6A21\u578B\u6761\u76EE\u5316\u5931\u8D25\uFF0C\u5DF2\u53EA\u7528\u89C4\u5219\u62BD\u53D6\uFF1A{m}", { m: String(e?.message || e).slice(0, 120) }) };
  }
}
function dedupeRequirements(items) {
  const seen = /* @__PURE__ */ new Set();
  const out = [];
  for (const item2 of items) {
    const key = `${item2.kind}|${item2.text.replace(/[\s　，,。；;：:、]/g, "").slice(0, 30)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item2);
  }
  return out;
}
async function extractNotice(deps, payload) {
  const text = String(payload?.text || "");
  if (text.replace(/\s/g, "").length < 100) throw new Error((0, import_i18n6.t)("\u516C\u544A\u6B63\u6587\u592A\u77ED\uFF08\u4E0D\u8DB3 100 \u5B57\uFF09\uFF0C\u5148\u6293\u53D6\u6216\u7C98\u8D34\u5B8C\u6574\u516C\u544A\u518D\u62BD\u53D6"));
  const label = String(payload?.title || payload?.url || (0, import_i18n6.t)("\u62DB\u6807\u516C\u544A"));
  const locator = payload?.url ? String(payload.url) : void 0;
  emit(deps, { projectId: String(payload?.projectId || ""), stage: "extract", done: 0, total: 2, message: (0, import_i18n6.t)("\u6B63\u5728\u6309\u89C4\u5219\u62BD\u53D6\u5173\u952E\u4FE1\u606F\u2026") });
  const facts = extractNoticeFacts(text);
  const ruleRequirements = extractRequirementsByRules(text, label, locator);
  const warnings = [...missingFactWarnings(facts)];
  let requirements = ruleRequirements;
  if (!payload?.rulesOnly) {
    emit(deps, { projectId: String(payload?.projectId || ""), stage: "extract", done: 1, total: 2, message: (0, import_i18n6.t)("\u6B63\u5728\u8BA9\u6A21\u578B\u628A\u6761\u6B3E\u9010\u6761\u5217\u51FA\u6765\u2026") });
    const llmResult = await llmRequirements(deps, text, label, locator);
    if (llmResult.warning) warnings.push(llmResult.warning);
    requirements = dedupeRequirements([...ruleRequirements, ...llmResult.requirements]);
  } else {
    warnings.push((0, import_i18n6.t)("\u672C\u6B21\u53EA\u7528\u4E86\u89C4\u5219\u62BD\u53D6\uFF0C\u6CA1\u6709\u8C03\u7528\u6A21\u578B\u3002"));
  }
  if (!requirements.length) warnings.push((0, import_i18n6.t)("\u6CA1\u62BD\u51FA\u4EFB\u4F55\u8981\u6C42\u6761\u6B3E\uFF0C\u8BF7\u786E\u8BA4\u8FD9\u662F\u62DB\u6807\u516C\u544A\u8BE6\u60C5\u9875\uFF1B\u4E5F\u53EF\u4EE5\u76F4\u63A5\u5728\u4E0B\u9762\u624B\u5DE5\u6DFB\u52A0\u3002"));
  emit(deps, { projectId: String(payload?.projectId || ""), stage: "extract", done: 2, total: 2, message: (0, import_i18n6.t)("\u62BD\u53D6\u5B8C\u6210") });
  return {
    url: payload?.url,
    title: payload?.title,
    ...facts,
    fetchedAt: Date.now(),
    text: text.slice(0, 12e4),
    requirements,
    warnings
  };
}
async function searchNotices(deps, payload) {
  const state = readState();
  const project = findProject(state, String(payload?.projectId || ""));
  const keywords = String(payload?.keywords || "").trim() || (0, import_noticeSearch.deriveKeywords)(project.name, project.goal, project.strategies || []);
  if (!keywords) {
    return { ok: false, keywords: "", hits: [], error: (0, import_i18n6.t)("\u5148\u586B\u9879\u76EE\u540D\u79F0\u6216\u6295\u6807\u76EE\u6807\uFF0C\u6216\u8005\u81EA\u5DF1\u8F93\u5165\u68C0\u7D22\u5173\u952E\u8BCD") };
  }
  const queries = (0, import_noticeSearch.buildQueries)(keywords);
  const warnings = [];
  emit(deps, { projectId: project.id, stage: "fetch", done: 0, total: 2, message: (0, import_i18n6.t)("\u6B63\u5728\u68C0\u7D22\u62DB\u6807\u516C\u544A\u2026") });
  let raw = await (0, import_noticeSearch.searchViaQiyeApi)(deps.qiyeApiProc, queries);
  let via = "qiye-api";
  if (!raw.length) {
    emit(deps, { projectId: project.id, stage: "fetch", done: 1, total: 2, message: (0, import_i18n6.t)("\u641C\u7D22\u670D\u52A1\u4E0D\u53EF\u7528\uFF0C\u6539\u7528\u5185\u7F6E\u6D4F\u89C8\u5668\u68C0\u7D22\u2026") });
    raw = await (0, import_noticeSearch.searchViaBrowser)(queries);
    via = "browser";
    if (raw.length) warnings.push((0, import_i18n6.t)("\u8FD9\u6B21\u662F\u7528\u5185\u7F6E\u6D4F\u89C8\u5668\u641C\u7684\uFF08AI \u5DE5\u5177\u7BB1\u7684\u641C\u7D22\u670D\u52A1\u6CA1\u542F\u52A8\uFF09\uFF0C\u7ED3\u679C\u53EF\u80FD\u5C11\u4E00\u4E9B\u3002"));
  }
  const hits = (0, import_noticeSearch.rankHits)(raw, keywords);
  emit(deps, { projectId: project.id, stage: "fetch", done: 2, total: 2, message: (0, import_i18n6.t)("\u68C0\u7D22\u5B8C\u6210") });
  if (!hits.length) {
    return {
      ok: false,
      keywords,
      hits: [],
      via,
      warnings,
      error: (0, import_i18n6.t)("\u6CA1\u641C\u5230\u50CF\u516C\u544A\u8BE6\u60C5\u9875\u7684\u7ED3\u679C\u3002\u6362\u4E2A\u66F4\u5177\u4F53\u7684\u5173\u952E\u8BCD\uFF08\u6BD4\u5982\u52A0\u4E0A\u5730\u533A\u6216\u91C7\u8D2D\u4EBA\u540D\u79F0\uFF09\uFF0C\u6216\u8005\u76F4\u63A5\u628A\u516C\u544A\u7F51\u5740\u7C98\u8FDB\u4E0B\u9762\u3002")
    };
  }
  deps.logger.audit?.("bid-writer", (0, import_i18n6.t)("\u68C0\u7D22\u62DB\u6807\u516C\u544A"), { keywords, hits: hits.length, via });
  return { ok: true, keywords, hits, via, warnings };
}
function templateReason(name, text) {
  const lowerName = name.toLowerCase();
  const hitName = import_matchPatterns5.TEMPLATE_HINTS.find((h) => lowerName.includes(h.toLowerCase()));
  if (hitName) return { score: 1, reason: (0, import_i18n6.t)("\u6587\u4EF6\u540D\u542B\u300C{w}\u300D", { w: hitName }) };
  const hitText = import_matchPatterns5.TEMPLATE_HINTS.find((h) => text.includes(h));
  if (hitText) return { score: 0.6, reason: (0, import_i18n6.t)("\u6B63\u6587\u51FA\u73B0\u300C{w}\u300D", { w: hitText }) };
  return null;
}
async function suggestTemplates(payload) {
  const store = (() => {
    try {
      return (0, import_service.knowledgeStore)();
    } catch {
      return null;
    }
  })();
  if (!store) return { candidates: [], note: (0, import_i18n6.t)("\u77E5\u8BC6\u5E93\u8FD8\u6CA1\u521D\u59CB\u5316\u3002") };
  const docs = store.docs();
  if (!docs.length) return { candidates: [], note: (0, import_i18n6.t)("\u77E5\u8BC6\u5E93\u91CC\u8FD8\u6CA1\u6709\u6587\u6863\u3002\u5148\u5230\u300C\u77E5\u8BC6\u5E93\u300D\u5BFC\u5165\u4F60\u4EEC\u5E38\u7528\u7684\u6807\u4E66\u6A21\u677F\uFF0C\u4E0B\u6B21\u5C31\u80FD\u76F4\u63A5\u9009\u3002") };
  const query = String(payload?.query || "").trim() || import_matchPatterns5.TEMPLATE_HINTS.slice(0, 6).join(" ");
  const hits = await knowledgeSearch(query, 30);
  const hitText = /* @__PURE__ */ new Map();
  for (const h of hits) hitText.set(h.docId, `${hitText.get(h.docId) || ""}
${h.text}`.slice(0, 4e3));
  const candidates = [];
  const graphId = store.currentGraphId();
  const state = store.graphState(graphId);
  for (const doc of docs) {
    const hit = templateReason(doc.name, hitText.get(doc.id) || "");
    if (!hit) continue;
    const built = state.docs[doc.id]?.builtAt;
    candidates.push({
      docId: doc.id,
      name: doc.name,
      reason: hit.reason,
      score: hit.score + (hitText.has(doc.id) ? 0.2 : 0),
      builtAt: built
    });
  }
  candidates.sort((a, b) => b.score - a.score);
  return {
    candidates: candidates.slice(0, 12),
    note: candidates.length ? void 0 : (0, import_i18n6.t)("\u77E5\u8BC6\u5E93\u91CC\u6CA1\u627E\u5230\u50CF\u6807\u4E66\u6A21\u677F\u7684\u6587\u6863\u3002\u4F60\u53EF\u4EE5\u76F4\u63A5\u4E0A\u4F20\u6A21\u677F\uFF0C\u6216\u7528\u5185\u7F6E\u6807\u51C6\u5927\u7EB2\u5F00\u59CB\u3002")
  };
}
async function outlineFromFile(path, name) {
  const doc = await (0, import_documentExtractor.extractDocument)(path, name);
  const text = String(doc.text || "").trim();
  if (!text) throw new Error((0, import_i18n6.t)("\u8FD9\u4E2A\u6587\u4EF6\u6CA1\u62BD\u51FA\u6587\u5B57\uFF08\u53EF\u80FD\u662F\u626B\u63CF\u4EF6\uFF09\u3002\u8BF7\u6362\u53EF\u9009\u4E2D\u6587\u5B57\u7684\u7248\u672C\uFF0C\u6216\u76F4\u63A5\u7528\u5185\u7F6E\u6807\u51C6\u5927\u7EB2\u3002"));
  const parsed = parseOutline(text);
  return { sections: parsed.sections, note: parsed.note, text };
}
async function buildCompanyProfile(deps, payload) {
  const projectId = String(payload?.projectId || "");
  emit(deps, { projectId, stage: "company", done: 0, total: 3, message: (0, import_i18n6.t)("\u6B63\u5728\u8BFB\u77E5\u8BC6\u5E93\u91CC\u7684\u516C\u53F8\u8D44\u6599\u2026") });
  const facts = knowledgeFacts();
  const manual = new Map((payload?.manual || []).map((f) => [f.key, f]));
  const warnings = [];
  const fields = [];
  for (const key of COMPANY_FIELD_KEYS) {
    const keep = manual.get(key);
    if (keep && String(keep.value || "").trim()) {
      fields.push({ ...keep, from: "manual" });
      continue;
    }
    const fact = facts.find((f) => f.field === key);
    fields.push(fact ? {
      key,
      label: (0, import_fieldCatalog.fieldLabel)(key),
      value: fact.value,
      from: "knowledge",
      source: { kind: "knowledge", label: fact.docName || (0, import_i18n6.t)("\u77E5\u8BC6\u5E93"), quote: fact.evidence?.slice(0, 160) }
    } : { key, label: (0, import_fieldCatalog.fieldLabel)(key), value: "", from: "missing" });
  }
  emit(deps, { projectId, stage: "company", done: 1, total: 3, message: (0, import_i18n6.t)("\u6B63\u5728\u68C0\u7D22\u8D44\u8D28\u3001\u4E1A\u7EE9\u7B49\u8BC1\u660E\u6750\u6599\u2026") });
  const evidenceDocs = [];
  for (const def of extraFieldDefs()) {
    const keep = manual.get(def.key);
    if (keep && String(keep.value || "").trim()) {
      fields.push({ ...keep, from: "manual" });
      continue;
    }
    const hits = await knowledgeSearch(def.query, 8);
    if (!hits.length) {
      fields.push({ key: def.key, label: def.label, value: "", from: "missing" });
      continue;
    }
    const value = joinExcerptsInOrder(hits);
    fields.push({
      key: def.key,
      label: def.label,
      value,
      from: "knowledge",
      source: { kind: "knowledge", label: hits[0].docName, quote: hits[0].text.slice(0, 160) }
    });
    for (const h of hits.slice(0, 2)) {
      if (evidenceDocs.some((d) => d.docId === h.docId)) continue;
      evidenceDocs.push({ docId: h.docId, name: h.docName, reason: def.label });
    }
  }
  if (!facts.length) warnings.push((0, import_i18n6.t)("\u77E5\u8BC6\u5E93\u91CC\u8FD8\u6CA1\u6709\u516C\u53F8\u4E8B\u5B9E\u3002\u5148\u5230\u300C\u77E5\u8BC6\u5E93\u300D\u628A\u8425\u4E1A\u6267\u7167\u3001\u8D44\u8D28\u8BC1\u4E66\u3001\u516C\u53F8\u7B80\u4ECB\u5BFC\u8FDB\u53BB\u5E76\u5F62\u6210\u77E5\u8BC6\u56FE\u8C31\uFF0C\u8FD9\u4E00\u6B65\u5C31\u80FD\u81EA\u52A8\u586B\u3002"));
  const qualifications = [];
  const qualificationReqs = (payload?.requirements || []).filter((r) => r.kind === "qualification").slice(0, 30);
  if (qualificationReqs.length) {
    emit(deps, { projectId, stage: "company", done: 2, total: 3, message: (0, import_i18n6.t)("\u6B63\u5728\u9010\u6761\u6838\u5BF9\u8D44\u683C\u8981\u6C42\u2026") });
    const known = fields.filter((f) => String(f.value || "").trim());
    if (known.length && llmReady(deps)) {
      try {
        const raw = await llm(deps, qualificationPrompt(qualificationReqs, known), EXTRACT_TIMEOUT_MS);
        const parsed = parseModelJson(raw);
        const checks = Array.isArray(parsed?.checks) ? parsed.checks : [];
        for (const req of qualificationReqs) {
          const hit = checks.find((c) => String(c?.requirementId) === req.id);
          const verdict = ["met", "unmet", "unknown"].includes(String(hit?.verdict)) ? String(hit.verdict) : "unknown";
          qualifications.push({
            requirementId: req.id,
            text: req.text,
            verdict,
            evidence: hit?.evidence ? String(hit.evidence).slice(0, 200) : void 0,
            note: hit?.note ? String(hit.note).slice(0, 200) : void 0
          });
        }
      } catch (e) {
        warnings.push((0, import_i18n6.t)("\u8D44\u683C\u81EA\u68C0\u6CA1\u8DD1\u6210\u529F\uFF0C\u5DF2\u5168\u90E8\u6807\u4E3A\u5F85\u786E\u8BA4\uFF1A{m}", { m: String(e?.message || e).slice(0, 120) }));
      }
    }
    if (!qualifications.length) {
      for (const req of qualificationReqs) {
        qualifications.push({
          requirementId: req.id,
          text: req.text,
          verdict: "unknown",
          note: (0, import_i18n6.t)("\u8BF7\u4EBA\u5DE5\u786E\u8BA4")
        });
      }
    }
    for (const q of qualifications) {
      if (q.verdict !== "unknown") continue;
      if (qualificationKind(q.text) !== "declaration") continue;
      q.verdict = "met";
      q.evidence = (0, import_i18n6.t)("\u58F0\u660E\u7C7B\u6761\u6B3E\uFF1A\u7531\u6295\u6807\u4EBA\u5728\u300A\u8D44\u683C\u58F0\u660E\u53CA\u627F\u8BFA\u51FD\u300B\u4E2D\u4E66\u9762\u627F\u8BFA\u6EE1\u8DB3");
      q.note = (0, import_i18n6.t)("\u65E0\u9700\u5916\u90E8\u6750\u6599\uFF0C\u968F\u6807\u4E66\u4E00\u5E76\u51FA\u5177\u627F\u8BFA\u51FD\u5373\u53EF\uFF1B\u5982\u5B9E\u9645\u4E0D\u6EE1\u8DB3\u8BF7\u6539\u56DE\u3002");
    }
  }
  emit(deps, { projectId, stage: "company", done: 3, total: 3, message: (0, import_i18n6.t)("\u516C\u53F8\u8D44\u6599\u5C31\u7EEA") });
  return { fields, qualifications, evidenceDocs, warnings };
}
function relevantRequirements(section, all) {
  if (section.requirementIds?.length) {
    const picked = all.filter((r) => section.requirementIds.includes(r.id));
    if (picked.length) return picked.slice(0, 40);
  }
  const words = (`${section.title} ${section.guide || ""}`.match(/[一-龥A-Za-z]{2,8}/g) || []).slice(0, 12);
  const scored = all.map((r) => ({
    r,
    score: words.filter((w) => r.text.includes(w)).length + (r.mandatory ? 0.5 : 0)
  }));
  const matched = scored.filter((s) => s.score > 0).sort((a, b) => b.score - a.score).map((s) => s.r);
  if (matched.length) return matched.slice(0, 25);
  return all.filter((r) => r.kind === "scoring" || r.kind === "deliverable").slice(0, 15);
}
async function composeSection(deps, payload) {
  const state = readState();
  const project = findProject(state, String(payload?.projectId || ""));
  const section = (project.sections || []).find((s) => s.id === String(payload?.sectionId || ""));
  if (!section) throw new Error((0, import_i18n6.t)("\u627E\u4E0D\u5230\u8FD9\u4E00\u7AE0\uFF0C\u53EF\u80FD\u5DF2\u88AB\u5220\u9664"));
  emit(deps, { projectId: project.id, stage: "compose", done: 0, total: 1, message: (0, import_i18n6.t)("\u6B63\u5728\u64B0\u5199\u300C{t}\u300D\u2026", { t: section.title }) });
  const requirements = relevantRequirements(section, project.notice?.requirements || []);
  const excerpts = (await knowledgeSearch(`${section.title} ${project.name} ${project.bidder}`, 8)).map((h) => ({ label: h.docName, text: h.text }));
  let templateExcerpt;
  const templatePath = project.template?.path;
  if (templatePath && (0, import_node_fs2.existsSync)(templatePath)) {
    try {
      const doc = await (0, import_documentExtractor.extractDocument)(templatePath, (0, import_node_path2.basename)(templatePath));
      const full = String(doc.text || "");
      const at = full.indexOf(section.title);
      if (at >= 0) templateExcerpt = full.slice(at, at + 2e3);
    } catch {
    }
  }
  const index = project.sections.findIndex((s) => s.id === section.id);
  const next = project.sections[index + 1];
  const partHeading = section.partHeading === true || section.level === 1 && Boolean(next) && next.level > section.level || /^(商务|技术|资格|服务|报价)?投标文件$|^第.{1,3}(部分|篇|章)/.test(section.title.trim());
  const prompt = sectionPrompt({
    project,
    section,
    requirements,
    company: project.company || [],
    knowledgeExcerpts: excerpts,
    templateExcerpt,
    instruction: payload?.instruction,
    partHeading
  });
  const content = (await llm(deps, prompt, COMPOSE_TIMEOUT_MS)).trim();
  if (!content) throw new Error((0, import_i18n6.t)("\u6A21\u578B\u6CA1\u6709\u8FD4\u56DE\u6B63\u6587\uFF0C\u8BF7\u91CD\u8BD5"));
  const sources = [
    ...project.notice?.url ? [{ kind: "notice", label: project.notice.title || project.notice.url, locator: project.notice.url }] : [],
    ...excerpts.map((e) => ({ kind: "knowledge", label: e.label })),
    ...project.template?.name ? [{ kind: "template", label: project.template.name }] : []
  ];
  emit(deps, { projectId: project.id, stage: "compose", done: 1, total: 1, message: (0, import_i18n6.t)("\u300C{t}\u300D\u5199\u597D\u4E86", { t: section.title }) });
  return {
    ok: true,
    sectionId: section.id,
    content,
    placeholders: collectPlaceholders(content),
    wordCount: countWords(content),
    sources
  };
}
function localGoalDraft(strategies, projectName) {
  const picked = strategies.filter(Boolean);
  if (!picked.length) return "";
  const head = picked.slice(0, 3).join((0, import_i18n6.t)("\u3001"));
  const rest = picked.slice(3);
  const tail = rest.length ? (0, import_i18n6.t)("\uFF0C\u540C\u65F6\u786E\u4FDD{rest}\u3002", { rest: rest.join((0, import_i18n6.t)("\u3001")) }) : (0, import_i18n6.t)("\u3002");
  return (0, import_i18n6.t)("\u672C\u9879\u76EE\u4EE5{head}\u4F5C\u4E3A\u4E3B\u8981\u53D6\u80DC\u70B9\u53C2\u4E0E{name}\u6295\u6807{tail}", {
    head,
    name: projectName || (0, import_i18n6.t)("\u672C\u9879\u76EE"),
    tail
  });
}
async function draftGoal(deps, payload) {
  const state = readState();
  const project = findProject(state, String(payload?.projectId || ""));
  const strategies = (payload?.strategies || []).map((t) => String(t || "").trim()).filter(Boolean).slice(0, 10);
  if (!strategies.length) return { ok: false, error: (0, import_i18n6.t)("\u5148\u9009\u4E00\u4E2A\u4FA7\u91CD\u6807\u7B7E") };
  if (!llmReady(deps)) {
    const text = localGoalDraft(strategies, project.name);
    return { ok: Boolean(text), text, fallback: true };
  }
  const scoring = (project.notice?.requirements || []).filter((r) => r.kind === "scoring").map((r) => r.points ? `${r.text}\uFF08${r.points}${(0, import_i18n6.t)("\u5206")}\uFF09` : r.text);
  try {
    const text = (await llm(deps, goalPrompt({
      projectName: project.name,
      bidder: project.bidder,
      strategies,
      buyer: project.notice?.buyer,
      budget: project.notice?.budget,
      scoring,
      lang: project.lang
    }), 9e4)).trim().replace(/^["'\u201c\u2018]|["'\u201d\u2019]$/g, "");
    if (!text) throw new Error((0, import_i18n6.t)("\u6A21\u578B\u6CA1\u6709\u8FD4\u56DE\u5185\u5BB9"));
    return { ok: true, text };
  } catch (e) {
    const text = localGoalDraft(strategies, project.name);
    return { ok: Boolean(text), text, fallback: true, error: String(e?.message || e) };
  }
}
function buildChecklistWorkbook(project) {
  const wb = XLSX.utils.book_new();
  const levelLabel = (level) => level === "blocker" ? (0, import_i18n6.t)("\u963B\u65AD") : level === "warning" ? (0, import_i18n6.t)("\u63D0\u9192") : (0, import_i18n6.t)("\u901A\u8FC7");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([
    [(0, import_i18n6.t)("\u7EA7\u522B"), (0, import_i18n6.t)("\u68C0\u67E5\u9879"), (0, import_i18n6.t)("\u8BF4\u660E")],
    ...(project.compliance || []).map((c) => [levelLabel(c.level), c.title, c.detail])
  ]), (0, import_i18n6.t)("\u6295\u6807\u524D\u81EA\u68C0"));
  const gaps = (project.sections || []).flatMap((s) => (s.placeholders || []).map((p) => [s.title, p]));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([
    [(0, import_i18n6.t)("\u7AE0\u8282"), (0, import_i18n6.t)("\u5F85\u8865\u5145\u5185\u5BB9")],
    ...gaps.length ? gaps : [[(0, import_i18n6.t)("\uFF08\u65E0\uFF09"), (0, import_i18n6.t)("\u6B63\u6587\u91CC\u6CA1\u6709\u5F85\u8865\u5145\u5360\u4F4D")]]
  ]), (0, import_i18n6.t)("\u7F3A\u6599\u6E05\u5355"));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([
    [(0, import_i18n6.t)("\u7C7B\u578B"), (0, import_i18n6.t)("\u8981\u6C42"), (0, import_i18n6.t)("\u5206\u503C"), (0, import_i18n6.t)("\u786C\u6027"), (0, import_i18n6.t)("\u6765\u6E90")],
    ...(project.notice?.requirements || []).map((r) => [
      requirementKindLabel(r.kind),
      r.text,
      r.points ?? "",
      r.mandatory ? (0, import_i18n6.t)("\u662F") : "",
      r.source?.locator || r.source?.label || ""
    ])
  ]), (0, import_i18n6.t)("\u62DB\u6807\u8981\u6C42\u5BF9\u7167"));
  return wb;
}
async function exportPackage(deps, payload) {
  const state = readState();
  const project = findProject(state, String(payload?.projectId || ""));
  const draft = payload?.draft !== false;
  const formats = payload?.formats?.length ? payload.formats : ["docx", "pdf", "checklist"];
  if (!draft) {
    const items = runComplianceCheck(project);
    if (hasBlocker(items)) {
      const blockers = items.filter((i) => i.level === "blocker").map((i) => i.title).join((0, import_i18n6.t)("\uFF1B"));
      return { ok: false, error: (0, import_i18n6.t)("\u8FD8\u4E0D\u80FD\u5BFC\u51FA\u6B63\u5F0F\u4EF6\uFF1A{list}\u3002\u5148\u5904\u7406\u5B8C\u518D\u5BFC\uFF0C\u6216\u5148\u5BFC\u8349\u7A3F\u4EF6\u3002", { list: blockers }) };
    }
  }
  if (!(project.sections || []).some((s) => String(s.content || "").trim())) {
    return { ok: false, error: (0, import_i18n6.t)("\u4E00\u7AE0\u6B63\u6587\u90FD\u8FD8\u6CA1\u6709\uFF0C\u6CA1\u4EC0\u4E48\u53EF\u5BFC\u7684") };
  }
  const dir = projectDir(project.id, project.name);
  const base = safeFileName(project.name || (0, import_i18n6.t)("\u6295\u6807\u6587\u4EF6"));
  const suffix = draft ? `_${(0, import_i18n6.t)("\u8349\u7A3F")}` : "";
  const paths = [];
  const total = formats.length;
  let done = 0;
  if (formats.includes("docx")) {
    emit(deps, { projectId: project.id, stage: "export", done, total, message: (0, import_i18n6.t)("\u6B63\u5728\u751F\u6210 Word\u2026") });
    const p = (0, import_node_path2.join)(dir, `${base}${suffix}.docx`);
    (0, import_node_fs2.writeFileSync)(p, (0, import_docx.buildBidDocx)(project, draft));
    paths.push(p);
    done += 1;
  }
  if (formats.includes("pdf")) {
    emit(deps, { projectId: project.id, stage: "export", done, total, message: (0, import_i18n6.t)("\u6B63\u5728\u751F\u6210 PDF\u2026") });
    const p = (0, import_node_path2.join)(dir, `${base}${suffix}.pdf`);
    await (0, import_docx.writePdfFromHtml)(p, (0, import_docx.buildBidHtml)(project, draft));
    paths.push(p);
    done += 1;
  }
  if (formats.includes("checklist") || formats.includes("gaps")) {
    emit(deps, { projectId: project.id, stage: "export", done, total, message: (0, import_i18n6.t)("\u6B63\u5728\u751F\u6210\u81EA\u68C0\u8868\u2026") });
    const p = (0, import_node_path2.join)(dir, `${base}_${(0, import_i18n6.t)("\u81EA\u68C0\u8868")}.xlsx`);
    XLSX.writeFile(buildChecklistWorkbook(project), p);
    paths.push(p);
    done += 1;
  }
  emit(deps, { projectId: project.id, stage: "export", done: total, total, message: (0, import_i18n6.t)("\u5BFC\u51FA\u5B8C\u6210") });
  try {
    if (paths[0]) import_electron.shell.showItemInFolder(paths[0]);
  } catch {
  }
  deps.logger.audit?.("bid-writer", (0, import_i18n6.t)("\u5BFC\u51FA\u6807\u4E66"), { projectId: project.id, draft, count: paths.length });
  return { ok: true, paths };
}
function registerBidWriterHandlers(deps) {
  import_electron.ipcMain.handle(import_ipc_contracts.IPC_CHANNELS.WORKBENCH_BW_STATE_GET, () => {
    const knowledge = knowledgeSummary();
    return {
      state: readState(),
      defaultBidder: knowledge.companyName,
      llmReady: llmReady(deps),
      docRoot: docRoot(),
      defaultDocRoot: defaultDocRoot(),
      knowledge
    };
  });
  import_electron.ipcMain.handle(import_ipc_contracts.IPC_CHANNELS.WORKBENCH_BW_NOTICE_SEARCH, async (_e, payload) => {
    (0, import_shared.rateLimit)("BID_WRITER_SEARCH", 20);
    try {
      return await searchNotices(deps, payload);
    } catch (e) {
      return { ok: false, keywords: String(payload?.keywords || ""), hits: [], error: String(e?.message || e) };
    }
  });
  import_electron.ipcMain.handle(import_ipc_contracts.IPC_CHANNELS.WORKBENCH_BW_GOAL_DRAFT, async (_e, payload) => {
    (0, import_shared.rateLimit)("BID_WRITER_GOAL", 60);
    try {
      return await draftGoal(deps, payload);
    } catch (e) {
      return { ok: false, error: String(e?.message || e) };
    }
  });
  import_electron.ipcMain.handle(import_ipc_contracts.IPC_CHANNELS.WORKBENCH_BW_PICK_ROOT, async () => {
    (0, import_shared.rateLimit)("BID_WRITER_PICK_ROOT", 30);
    const win = deps.getMainWindow();
    const opts = {
      title: (0, import_i18n6.t)("\u9009\u62E9\u6807\u4E66\u5B58\u653E\u4F4D\u7F6E"),
      properties: ["openDirectory", "createDirectory"],
      defaultPath: docRoot()
    };
    const picked = win ? await import_electron.dialog.showOpenDialog(win, opts) : await import_electron.dialog.showOpenDialog(opts);
    if (picked.canceled || !picked.filePaths.length) return { ok: false, docRoot: docRoot(), defaultDocRoot: defaultDocRoot() };
    try {
      const next = setDocRoot(picked.filePaths[0]);
      deps.logger.audit?.("bid-writer", (0, import_i18n6.t)("\u66F4\u6539\u6807\u4E66\u5B58\u653E\u4F4D\u7F6E"), { path: next });
      return { ok: true, docRoot: next, defaultDocRoot: defaultDocRoot() };
    } catch (e) {
      return { ok: false, error: String(e?.message || e), docRoot: docRoot(), defaultDocRoot: defaultDocRoot() };
    }
  });
  import_electron.ipcMain.handle(import_ipc_contracts.IPC_CHANNELS.WORKBENCH_BW_SET_ROOT, (_e, payload) => {
    try {
      const next = setDocRoot(String(payload?.path || ""));
      deps.logger.audit?.("bid-writer", (0, import_i18n6.t)("\u66F4\u6539\u6807\u4E66\u5B58\u653E\u4F4D\u7F6E"), { path: next });
      return { ok: true, docRoot: next, defaultDocRoot: defaultDocRoot() };
    } catch (e) {
      return { ok: false, error: String(e?.message || e), docRoot: docRoot(), defaultDocRoot: defaultDocRoot() };
    }
  });
  import_electron.ipcMain.handle(import_ipc_contracts.IPC_CHANNELS.WORKBENCH_BW_STATE_SAVE, (_e, payload) => {
    writeState(payload?.state);
    return { ok: true };
  });
  import_electron.ipcMain.handle(import_ipc_contracts.IPC_CHANNELS.WORKBENCH_BW_NOTICE_FETCH, async (_e, payload) => {
    (0, import_shared.rateLimit)("BID_WRITER_FETCH", 30);
    const projectId = String(payload?.projectId || "");
    try {
      emit(deps, { projectId, stage: "fetch", done: 0, total: 1, message: (0, import_i18n6.t)("\u6B63\u5728\u6253\u5F00\u516C\u544A\u9875\u2026") });
      const r = await (0, import_noticeFetch.fetchNoticePage)(String(payload?.url || ""));
      emit(deps, { projectId, stage: "fetch", done: 1, total: 1, message: (0, import_i18n6.t)("\u6293\u53D6\u5B8C\u6210") });
      deps.logger.audit?.("bid-writer", (0, import_i18n6.t)("\u6293\u53D6\u62DB\u6807\u516C\u544A"), { url: r.url, chars: r.text.length });
      return {
        ok: !r.loginRequired,
        url: r.url,
        title: r.title,
        text: r.text,
        attachments: r.attachments,
        loginRequired: r.loginRequired,
        warnings: r.warnings,
        error: r.loginRequired ? (0, import_i18n6.t)("\u8FD9\u4E2A\u9875\u9762\u8981\u767B\u5F55\u624D\u80FD\u770B\u3002\u8BF7\u5148\u5728\u5185\u7F6E\u6D4F\u89C8\u5668\u91CC\u767B\u5F55\u8BE5\u7F51\u7AD9\uFF0C\u518D\u56DE\u6765\u91CD\u65B0\u6293\u53D6\uFF08\u767B\u5F55\u72B6\u6001\u4F1A\u88AB\u590D\u7528\uFF09\u3002") : void 0
      };
    } catch (e) {
      emit(deps, { projectId, stage: "fetch", done: 1, total: 1, message: (0, import_i18n6.t)("\u6293\u53D6\u5931\u8D25") });
      return { ok: false, error: String(e?.message || e) };
    }
  });
  import_electron.ipcMain.handle(import_ipc_contracts.IPC_CHANNELS.WORKBENCH_BW_NOTICE_IMPORT, async () => {
    (0, import_shared.rateLimit)("BID_WRITER_IMPORT", 30);
    const win = deps.getMainWindow();
    const opts = {
      title: (0, import_i18n6.t)("\u9009\u62E9\u62DB\u6807\u6587\u4EF6"),
      properties: ["openFile"],
      filters: [{ name: (0, import_i18n6.t)("\u62DB\u6807\u6587\u4EF6"), extensions: ["pdf", "docx", "doc", "xlsx", "xls", "txt", "md", "html"] }]
    };
    const picked = win ? await import_electron.dialog.showOpenDialog(win, opts) : await import_electron.dialog.showOpenDialog(opts);
    if (picked.canceled || !picked.filePaths.length) return { ok: false };
    const path = picked.filePaths[0];
    try {
      const doc = await (0, import_documentExtractor.extractDocument)(path, (0, import_node_path2.basename)(path));
      const text = String(doc.text || "").trim();
      if (!text) return { ok: false, error: (0, import_i18n6.t)("\u8FD9\u4E2A\u6587\u4EF6\u6CA1\u62BD\u51FA\u6587\u5B57\uFF08\u53EF\u80FD\u662F\u626B\u63CF\u4EF6\uFF09\uFF0C\u8BF7\u6362\u53EF\u9009\u4E2D\u6587\u5B57\u7684\u7248\u672C\u3002") };
      return { ok: true, title: (0, import_node_path2.basename)(path), text, warnings: doc.warning ? [doc.warning] : void 0 };
    } catch (e) {
      return { ok: false, error: String(e?.message || e) };
    }
  });
  import_electron.ipcMain.handle(import_ipc_contracts.IPC_CHANNELS.WORKBENCH_BW_NOTICE_EXTRACT, async (_e, payload) => {
    (0, import_shared.rateLimit)("BID_WRITER_EXTRACT", 20);
    return extractNotice(deps, payload);
  });
  import_electron.ipcMain.handle(import_ipc_contracts.IPC_CHANNELS.WORKBENCH_BW_TEMPLATE_IMPORT, async (_e, payload) => {
    (0, import_shared.rateLimit)("BID_WRITER_TEMPLATE", 30);
    const win = deps.getMainWindow();
    const opts = {
      title: (0, import_i18n6.t)("\u9009\u62E9\u6807\u4E66\u6A21\u677F"),
      properties: ["openFile"],
      filters: [{ name: (0, import_i18n6.t)("\u6807\u4E66\u6A21\u677F"), extensions: ["docx", "doc", "pdf", "xlsx", "txt", "md"] }]
    };
    const picked = win ? await import_electron.dialog.showOpenDialog(win, opts) : await import_electron.dialog.showOpenDialog(opts);
    if (picked.canceled || !picked.filePaths.length) return { ok: false };
    const source = picked.filePaths[0];
    try {
      const projectId = String(payload?.projectId || "shared");
      const projectName = readState().projects.find((p) => p.id === projectId)?.name;
      const target = (0, import_node_path2.join)(projectDir(projectId, projectName), `template${(0, import_node_path2.extname)(source).toLowerCase() || ".docx"}`);
      try {
        (0, import_node_fs2.copyFileSync)(source, target);
      } catch {
      }
      const usable = (0, import_node_fs2.existsSync)(target) ? target : source;
      const parsed = await outlineFromFile(usable, (0, import_node_path2.basename)(source));
      deps.logger.audit?.("bid-writer", (0, import_i18n6.t)("\u5BFC\u5165\u6807\u4E66\u6A21\u677F"), { name: (0, import_node_path2.basename)(source), sections: parsed.sections.length });
      return {
        ok: true,
        template: { kind: "upload", name: (0, import_node_path2.basename)(source), path: usable, parsedAt: Date.now(), note: parsed.note },
        sections: parsed.sections,
        warnings: [parsed.note]
      };
    } catch (e) {
      return { ok: false, error: String(e?.message || e) };
    }
  });
  import_electron.ipcMain.handle(import_ipc_contracts.IPC_CHANNELS.WORKBENCH_BW_TEMPLATE_SUGGEST, async (_e, payload) => {
    (0, import_shared.rateLimit)("BID_WRITER_SUGGEST", 30);
    return suggestTemplates(payload);
  });
  import_electron.ipcMain.handle(import_ipc_contracts.IPC_CHANNELS.WORKBENCH_BW_TEMPLATE_ADOPT, async (_e, payload) => {
    if (payload?.kind === "builtin") {
      return {
        ok: true,
        template: { kind: "builtin", name: (0, import_i18n6.t)("\u5185\u7F6E\u6807\u51C6\u5927\u7EB2"), parsedAt: Date.now() },
        sections: builtinOutline(),
        warnings: [(0, import_i18n6.t)("\u7528\u7684\u662F\u5185\u7F6E\u6807\u51C6\u5927\u7EB2\u3002\u5982\u679C\u62DB\u6807\u6587\u4EF6\u89C4\u5B9A\u4E86\u6295\u6807\u6587\u4EF6\u683C\u5F0F\uFF0C\u8BF7\u4E0A\u4F20\u540E\u91CD\u65B0\u89E3\u6790\u3002")]
      };
    }
    try {
      const store = (0, import_service.knowledgeStore)();
      const doc = store.doc(String(payload?.docId || ""));
      if (!doc) throw new Error((0, import_i18n6.t)("\u77E5\u8BC6\u5E93\u91CC\u627E\u4E0D\u5230\u8FD9\u4EFD\u6587\u6863"));
      const parsed = await outlineFromFile(store.absPath(doc.file), doc.name);
      return {
        ok: true,
        template: { kind: "knowledge", name: doc.name, docId: doc.id, path: store.absPath(doc.file), parsedAt: Date.now(), note: parsed.note },
        sections: parsed.sections,
        warnings: [parsed.note]
      };
    } catch (e) {
      return { ok: false, error: String(e?.message || e) };
    }
  });
  import_electron.ipcMain.handle(import_ipc_contracts.IPC_CHANNELS.WORKBENCH_BW_COMPANY_PROFILE, async (_e, payload) => {
    (0, import_shared.rateLimit)("BID_WRITER_COMPANY", 20);
    return buildCompanyProfile(deps, payload);
  });
  import_electron.ipcMain.handle(import_ipc_contracts.IPC_CHANNELS.WORKBENCH_BW_SECTION_COMPOSE, async (_e, payload) => {
    (0, import_shared.rateLimit)("BID_WRITER_COMPOSE", 120);
    try {
      return await composeSection(deps, payload);
    } catch (e) {
      return { ok: false, sectionId: String(payload?.sectionId || ""), error: String(e?.message || e) };
    }
  });
  import_electron.ipcMain.handle(import_ipc_contracts.IPC_CHANNELS.WORKBENCH_BW_COMPLIANCE_CHECK, async (_e, payload) => {
    const state = readState();
    const project = findProject(state, String(payload?.projectId || ""));
    const items = runComplianceCheck(project);
    return { items, blocked: hasBlocker(items) };
  });
  import_electron.ipcMain.handle(import_ipc_contracts.IPC_CHANNELS.WORKBENCH_BW_EXPORT, async (_e, payload) => {
    (0, import_shared.rateLimit)("BID_WRITER_EXPORT", 20);
    try {
      return await exportPackage(deps, payload);
    } catch (e) {
      return { ok: false, error: String(e?.message || e) };
    }
  });
}

// apps/desktop-shell/node_modules/.cache/solutions-build/workbench-bid-writer/entry.main.ts
var hostApi = 2;
var registerFunction = "registerBidWriterHandlers";
var cleanup;
function activate(ctx) {
  cleanup = registerBidWriterHandlers(ctx.host.deps);
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
