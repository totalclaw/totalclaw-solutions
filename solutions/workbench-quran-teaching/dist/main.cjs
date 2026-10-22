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

// node_modules/.cache/solutions-build/workbench-quran-teaching/entry.main.ts
var entry_main_exports = {};
__export(entry_main_exports, {
  activate: () => activate,
  deactivate: () => deactivate,
  hostApi: () => hostApi,
  registerFunction: () => registerFunction
});
module.exports = __toCommonJS(entry_main_exports);

// ../../../totalclaw-solutions/solutions/workbench-quran-teaching/src/main/ipc/quranTeaching.ipc.ts
var import_electron2 = require("electron");
var import_node_fs4 = require("node:fs");
var import_node_path3 = require("node:path");
var import_ipc_contracts = require("npm:@totalclaw/ipc-contracts");
var import_i18n3 = require("npm:@totalclaw/i18n");
var import_shared = require("host:apps/desktop-shell/src/main/ipc/shared.ts");
var import_councilChatRouter = require("host:apps/desktop-shell/src/main/services/councilChatRouter.ts");
var import_accountScope = require("host:apps/desktop-shell/src/main/services/accountScope.ts");
var import_runtimeLocation = require("host:apps/desktop-shell/src/main/services/runtimeLocation.ts");
var import_ffmpegPath = require("host:apps/desktop-shell/src/main/services/ffmpegPath.ts");
var import_mediaProtocol = require("host:apps/desktop-shell/src/main/services/mediaProtocol.ts");
var import_localTts = require("host:apps/desktop-shell/src/main/services/localTts.ts");
var import_mediaFal = require("host:apps/desktop-shell/src/main/ipc/mediaFal.ipc.ts");

// ../../../totalclaw-solutions/solutions/workbench-quran-teaching/src/main/services/quranTeaching/store.ts
var import_node_fs2 = require("node:fs");
var import_node_path2 = require("node:path");
var import_atomicJson = require("host:apps/desktop-shell/src/main/utils/atomicJson.ts");

// ../../../totalclaw-solutions/solutions/workbench-quran-teaching/src/main/services/quranTeaching/approvedMaterials.json
var approvedMaterials_default = {
  version: "V1.0",
  sourceGlossary: [
    "\u6F14\u793A\u6279\u51C6\u8BCD\u8868 V1.0\uFF08\u6559\u5E08\u57FA\u7840\u8BCD\u4E49\u7B14\u8BB0\uFF09",
    "Demo approved glossary V1.0 (teacher's notes on basic word meanings)",
    "\u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0645\u0641\u0631\u062F\u0627\u062A \u0627\u0644\u0645\u0639\u062A\u0645\u062F\u0629 \u0627\u0644\u062A\u062C\u0631\u064A\u0628\u064A\u0629 V1.0 (\u0645\u0644\u0627\u062D\u0638\u0627\u062A \u0627\u0644\u0645\u0639\u0644\u0645 \u062D\u0648\u0644 \u0627\u0644\u0645\u0639\u0627\u0646\u064A \u0627\u0644\u0623\u0633\u0627\u0633\u064A\u0629 \u0644\u0644\u0643\u0644\u0645\u0627\u062A)"
  ],
  sourceStructure: [
    "\u6F14\u793A\u6279\u51C6\u6559\u6848\u7ED3\u6784\u8868 V1.0\uFF08\u6559\u5E08\u7B14\u8BB0 \xB7 \u7AE0\u8282\u4E3B\u9898\u4E0E\u6559\u5B66\u5355\u5143\uFF09",
    "Demo approved lesson-structure table V1.0 (teacher's notes \xB7 surah themes and teaching units)",
    "\u062C\u062F\u0648\u0644 \u0628\u0646\u064A\u0629 \u0627\u0644\u062F\u0631\u0648\u0633 \u0627\u0644\u0645\u0639\u062A\u0645\u062F \u0627\u0644\u062A\u062C\u0631\u064A\u0628\u064A V1.0 (\u0645\u0644\u0627\u062D\u0638\u0627\u062A \u0627\u0644\u0645\u0639\u0644\u0645 \xB7 \u0645\u0648\u0636\u0648\u0639\u0627\u062A \u0627\u0644\u0633\u0648\u0631 \u0648\u0627\u0644\u0648\u062D\u062F\u0627\u062A \u0627\u0644\u062A\u0639\u0644\u064A\u0645\u064A\u0629)"
  ],
  reviewer: [
    "\u6F14\u793A\u5185\u5BB9\u5BA1\u6838\u4EBA\uFF08\u5F85\u6B63\u5F0F\u9879\u76EE\u6307\u5B9A\uFF09",
    "Demo content reviewer (to be appointed for the full project)",
    "\u0645\u0631\u0627\u062C\u0639 \u0627\u0644\u0645\u062D\u062A\u0648\u0649 \u0627\u0644\u062A\u062C\u0631\u064A\u0628\u064A (\u064A\u064F\u0639\u064A\u064E\u0651\u0646 \u0641\u064A \u0627\u0644\u0645\u0634\u0631\u0648\u0639 \u0627\u0644\u0631\u0633\u0645\u064A)"
  ],
  glossary: [
    {
      chapter: 1,
      word: "\u0628\u0633\u0645",
      zh: "\u4EE5\u2026\u2026\u4E4B\u540D",
      en: "in the name of",
      ar: "\u0628\u0627\u0633\u0645"
    },
    {
      chapter: 1,
      word: "\u0627\u0644\u062D\u0645\u062F",
      zh: "\u4E00\u5207\u8D5E\u9882",
      en: "all praise",
      ar: "\u0627\u0644\u062B\u0646\u0627\u0621 \u0627\u0644\u0643\u0627\u0645\u0644"
    },
    {
      chapter: 1,
      word: "\u0631\u0628",
      zh: "\u4E3B\u3001\u517B\u80B2\u8005",
      en: "Lord, Sustainer",
      ar: "\u0627\u0644\u0645\u0627\u0644\u0643 \u0627\u0644\u0645\u0631\u0628\u0651\u064A"
    },
    {
      chapter: 1,
      word: "\u0627\u0644\u0639\u0627\u0644\u0645\u064A\u0646",
      zh: "\u4F17\u4E16\u754C",
      en: "the worlds",
      ar: "\u0643\u0644 \u0627\u0644\u0645\u062E\u0644\u0648\u0642\u0627\u062A"
    },
    {
      chapter: 1,
      word: "\u0627\u0644\u0631\u062D\u0645\u0627\u0646",
      zh: "\u81F3\u4EC1\u7684",
      en: "the Most Gracious",
      ar: "\u0648\u0627\u0633\u0639 \u0627\u0644\u0631\u062D\u0645\u0629"
    },
    {
      chapter: 1,
      word: "\u0627\u0644\u0631\u062D\u064A\u0645",
      zh: "\u81F3\u6148\u7684",
      en: "the Most Merciful",
      ar: "\u062F\u0627\u0626\u0645 \u0627\u0644\u0631\u062D\u0645\u0629"
    },
    {
      chapter: 1,
      word: "\u0645\u0627\u0644\u0643",
      zh: "\u4E3B\u5BB0\u3001\u638C\u7BA1\u8005",
      en: "Master, Owner",
      ar: "\u0635\u0627\u062D\u0628 \u0627\u0644\u0645\u0644\u0643"
    },
    {
      chapter: 1,
      word: "\u064A\u0648\u0645",
      zh: "\u65E5",
      en: "day",
      ar: "\u0627\u0644\u0646\u0647\u0627\u0631 / \u0627\u0644\u0648\u0642\u062A"
    },
    {
      chapter: 1,
      word: "\u0627\u0644\u062F\u064A\u0646",
      zh: "\u62A5\u5E94\uFF08\u4E4B\u65E5\uFF09",
      en: "recompense, judgement",
      ar: "\u0627\u0644\u062C\u0632\u0627\u0621"
    },
    {
      chapter: 1,
      word: "\u0646\u0639\u0628\u062F",
      zh: "\u6211\u4EEC\u5D07\u62DC",
      en: "we worship",
      ar: "\u0646\u062E\u0636\u0639 \u0628\u0627\u0644\u0639\u0628\u0627\u062F\u0629"
    },
    {
      chapter: 1,
      word: "\u0646\u0633\u062A\u0639\u064A\u0646",
      zh: "\u6211\u4EEC\u6C42\u52A9",
      en: "we ask for help",
      ar: "\u0646\u0637\u0644\u0628 \u0627\u0644\u0639\u0648\u0646"
    },
    {
      chapter: 1,
      word: "\u0627\u0647\u062F\u0646\u0627",
      zh: "\u6C42\u4F60\u5F15\u5BFC\u6211\u4EEC",
      en: "guide us",
      ar: "\u0623\u0631\u0634\u062F\u0646\u0627"
    },
    {
      chapter: 1,
      word: "\u0627\u0644\u0635\u0631\u0627\u0637",
      zh: "\u9053\u8DEF",
      en: "the path",
      ar: "\u0627\u0644\u0637\u0631\u064A\u0642"
    },
    {
      chapter: 1,
      word: "\u0627\u0644\u0645\u0633\u062A\u0642\u064A\u0645",
      zh: "\u7AEF\u6B63\u7684\u3001\u7B14\u76F4\u7684",
      en: "straight",
      ar: "\u0627\u0644\u0630\u064A \u0644\u0627 \u0627\u0639\u0648\u062C\u0627\u062C \u0641\u064A\u0647"
    },
    {
      chapter: 1,
      word: "\u0627\u0646\u0639\u0645\u062A",
      zh: "\u4F60\u65BD\u6069",
      en: "You have bestowed favour",
      ar: "\u0623\u0639\u0637\u064A\u062A \u0627\u0644\u0646\u0639\u0645\u0629"
    },
    {
      chapter: 1,
      word: "\u0627\u0644\u0645\u063A\u0636\u0648\u0628",
      zh: "\u88AB\u8C34\u6012\u7684",
      en: "those who earned anger",
      ar: "\u0645\u0646 \u0646\u0632\u0644 \u0639\u0644\u064A\u0647\u0645 \u0627\u0644\u063A\u0636\u0628"
    },
    {
      chapter: 1,
      word: "\u0627\u0644\u0636\u0627\u0644\u064A\u0646",
      zh: "\u8FF7\u8BEF\u7684\u4EBA",
      en: "those who went astray",
      ar: "\u0627\u0644\u062A\u0627\u0626\u0647\u0648\u0646 \u0639\u0646 \u0627\u0644\u0637\u0631\u064A\u0642"
    },
    {
      chapter: 103,
      word: "\u0648\u0627\u0644\u0639\u0635\u0631",
      zh: "\u4EE5\u65F6\u5149\u76DF\u8A93",
      en: "by time (an oath)",
      ar: "\u0642\u0633\u0645 \u0628\u0627\u0644\u0632\u0645\u0627\u0646"
    },
    {
      chapter: 103,
      word: "\u0627\u0644\u0627\u0646\u0633\u0627\u0646",
      zh: "\u4EBA",
      en: "mankind, the human being",
      ar: "\u0627\u0644\u0628\u0634\u0631"
    },
    {
      chapter: 103,
      word: "\u062E\u0633\u0631",
      zh: "\u4E8F\u6298\u3001\u635F\u5931",
      en: "loss",
      ar: "\u062E\u0633\u0627\u0631\u0629 \u0648\u0646\u0642\u0635\u0627\u0646"
    },
    {
      chapter: 103,
      word: "\u0627\u0645\u0646\u0648\u0627",
      zh: "\u5F52\u4FE1\u7684\u4EBA\u4EEC",
      en: "those who believe",
      ar: "\u0635\u062F\u0651\u0642\u0648\u0627 \u0648\u0622\u0645\u0646\u0648\u0627"
    },
    {
      chapter: 103,
      word: "\u0648\u0639\u0645\u0644\u0648\u0627",
      zh: "\u505A\u3001\u884C",
      en: "they did / performed",
      ar: "\u0641\u0639\u0644\u0648\u0627"
    },
    {
      chapter: 103,
      word: "\u0627\u0644\u0635\u0627\u0644\u062D\u0627\u062A",
      zh: "\u5584\u529F",
      en: "righteous deeds",
      ar: "\u0627\u0644\u0623\u0639\u0645\u0627\u0644 \u0627\u0644\u0635\u0627\u0644\u062D\u0629"
    },
    {
      chapter: 103,
      word: "\u0648\u062A\u0648\u0627\u0635\u0648\u0627",
      zh: "\u4E92\u76F8\u529D\u52C9",
      en: "they advised one another",
      ar: "\u0623\u0648\u0635\u0649 \u0628\u0639\u0636\u0647\u0645 \u0628\u0639\u0636\u064B\u0627"
    },
    {
      chapter: 103,
      word: "\u0628\u0627\u0644\u062D\u0642",
      zh: "\u4EE5\u771F\u7406",
      en: "with the truth",
      ar: "\u0628\u0627\u0644\u0635\u062F\u0642 \u0648\u0627\u0644\u0635\u0648\u0627\u0628"
    },
    {
      chapter: 103,
      word: "\u0628\u0627\u0644\u0635\u0628\u0631",
      zh: "\u4EE5\u575A\u5FCD",
      en: "with patience",
      ar: "\u0628\u0627\u0644\u062B\u0628\u0627\u062A \u0648\u0627\u0644\u062A\u062D\u0645\u0651\u0644"
    },
    {
      chapter: 108,
      word: "\u0627\u0639\u0637\u064A\u0646\u0627\u0643",
      zh: "\u6211\u4EEC\u8D50\u7ED9\u4F60",
      en: "We have granted you",
      ar: "\u0645\u0646\u062D\u0646\u0627\u0643"
    },
    {
      chapter: 108,
      word: "\u0627\u0644\u0643\u0648\u062B\u0631",
      zh: "\u591A\u798F\u3001\u4E30\u76DB\u7684\u6069\u60E0",
      en: "abundance (al-Kawthar)",
      ar: "\u0627\u0644\u062E\u064A\u0631 \u0627\u0644\u0643\u062B\u064A\u0631"
    },
    {
      chapter: 108,
      word: "\u0641\u0635\u0644",
      zh: "\u4F60\u5F53\u793C\u62DC",
      en: "so pray",
      ar: "\u0623\u062F\u0650\u0651 \u0627\u0644\u0635\u0644\u0627\u0629"
    },
    {
      chapter: 108,
      word: "\u0644\u0631\u0628\u0643",
      zh: "\u4E3A\u4F60\u7684\u4E3B",
      en: "to your Lord",
      ar: "\u0644\u0644\u0647 \u0631\u0628\u0643"
    },
    {
      chapter: 108,
      word: "\u0648\u0627\u0646\u062D\u0631",
      zh: "\u5E76\u5BB0\u7272",
      en: "and sacrifice",
      ar: "\u0648\u0627\u0630\u0628\u062D \u0627\u0644\u0642\u0631\u0628\u0627\u0646"
    },
    {
      chapter: 108,
      word: "\u0634\u0627\u0646\u0621\u0643",
      zh: "\u618E\u6068\u4F60\u8005",
      en: "the one who hates you",
      ar: "\u0645\u0628\u063A\u0636\u0643"
    },
    {
      chapter: 108,
      word: "\u0627\u0644\u0627\u0628\u062A\u0631",
      zh: "\u7EDD\u540E\u7684\u3001\u65AD\u7EDD\u7684",
      en: "the one cut off",
      ar: "\u0627\u0644\u0645\u0642\u0637\u0648\u0639 \u0645\u0646 \u0643\u0644 \u062E\u064A\u0631"
    },
    {
      chapter: 112,
      word: "\u0642\u0644",
      zh: "\u4F60\u8BF4",
      en: "say",
      ar: "\u0642\u064F\u0644"
    },
    {
      chapter: 112,
      word: "\u0627\u062D\u062F",
      zh: "\u72EC\u4E00",
      en: "One, unique",
      ar: "\u0648\u0627\u062D\u062F \u0644\u0627 \u0634\u0631\u064A\u0643 \u0644\u0647"
    },
    {
      chapter: 112,
      word: "\u0627\u0644\u0635\u0645\u062F",
      zh: "\u4E07\u7269\u6240\u4EF0\u8D56\u7684",
      en: "the Eternal Refuge",
      ar: "\u0627\u0644\u0630\u064A \u064A\u064F\u0642\u0635\u062F \u0641\u064A \u0627\u0644\u062D\u0627\u062C\u0627\u062A"
    },
    {
      chapter: 112,
      word: "\u064A\u0644\u062F",
      zh: "\u751F\uFF08\u5B50\uFF09",
      en: "beget",
      ar: "\u064A\u064F\u0646\u062C\u0628"
    },
    {
      chapter: 112,
      word: "\u064A\u0648\u0644\u062F",
      zh: "\u88AB\u751F",
      en: "be born",
      ar: "\u064A\u064F\u0648\u0644\u064E\u062F"
    },
    {
      chapter: 112,
      word: "\u0643\u0641\u0648\u0627",
      zh: "\u5339\u654C\u8005",
      en: "equal, comparable",
      ar: "\u0645\u062B\u064A\u0644 \u0648\u0646\u0638\u064A\u0631"
    },
    {
      chapter: 113,
      word: "\u0627\u0639\u0648\u0630",
      zh: "\u6211\u6C42\u5E87\u62A4",
      en: "I seek refuge",
      ar: "\u0623\u0644\u062A\u062C\u0626 \u0648\u0623\u062D\u062A\u0645\u064A"
    },
    {
      chapter: 113,
      word: "\u0627\u0644\u0641\u0644\u0642",
      zh: "\u66D9\u5149\u3001\u9ECE\u660E",
      en: "the daybreak",
      ar: "\u0627\u0644\u0635\u0628\u062D"
    },
    {
      chapter: 113,
      word: "\u0634\u0631",
      zh: "\u6076\u3001\u7978\u5BB3",
      en: "evil, harm",
      ar: "\u0627\u0644\u0633\u0648\u0621 \u0648\u0627\u0644\u0623\u0630\u0649"
    },
    {
      chapter: 113,
      word: "\u062E\u0644\u0642",
      zh: "\u521B\u9020",
      en: "created",
      ar: "\u0623\u0648\u062C\u062F"
    },
    {
      chapter: 113,
      word: "\u063A\u0627\u0633\u0642",
      zh: "\u9ED1\u591C",
      en: "darkness of night",
      ar: "\u0627\u0644\u0644\u064A\u0644 \u0627\u0644\u0645\u0638\u0644\u0645"
    },
    {
      chapter: 113,
      word: "\u0648\u0642\u0628",
      zh: "\u7B3C\u7F69\u3001\u964D\u4E34",
      en: "when it settles",
      ar: "\u062F\u062E\u0644 \u0648\u0623\u0638\u0644\u0645"
    },
    {
      chapter: 113,
      word: "\u0627\u0644\u0639\u0642\u062F",
      zh: "\u7ED3",
      en: "knots",
      ar: "\u0627\u0644\u0639\u064F\u0642\u064E\u062F"
    },
    {
      chapter: 113,
      word: "\u062D\u0627\u0633\u062F",
      zh: "\u5AC9\u5992\u8005",
      en: "envier",
      ar: "\u0645\u0646 \u064A\u062A\u0645\u0646\u0649 \u0632\u0648\u0627\u0644 \u0627\u0644\u0646\u0639\u0645\u0629"
    },
    {
      chapter: 113,
      word: "\u062D\u0633\u062F",
      zh: "\u5AC9\u5992",
      en: "envies",
      ar: "\u0623\u0638\u0647\u0631 \u0627\u0644\u062D\u0633\u062F"
    },
    {
      chapter: 114,
      word: "\u0627\u0644\u0646\u0627\u0633",
      zh: "\u4E16\u4EBA",
      en: "mankind, people",
      ar: "\u0627\u0644\u0628\u0634\u0631"
    },
    {
      chapter: 114,
      word: "\u0645\u0644\u0643",
      zh: "\u541B\u738B",
      en: "King",
      ar: "\u0627\u0644\u0645\u0627\u0644\u0643 \u0627\u0644\u0645\u062A\u0635\u0631\u0641"
    },
    {
      chapter: 114,
      word: "\u0627\u0644\u0627\u0647",
      zh: "\u795E\u3001\u88AB\u5D07\u62DC\u8005",
      en: "God (the one worshipped)",
      ar: "\u0627\u0644\u0645\u0639\u0628\u0648\u062F"
    },
    {
      chapter: 114,
      word: "\u0627\u0644\u0648\u0633\u0648\u0627\u0633",
      zh: "\u6559\u5506\u8005\u3001\u79C1\u8BED\u8005",
      en: "the whisperer",
      ar: "\u0627\u0644\u0645\u0648\u0633\u0648\u0650\u0633"
    },
    {
      chapter: 114,
      word: "\u0627\u0644\u062E\u0646\u0627\u0633",
      zh: "\u6F5C\u4F0F\u8005\u3001\u9000\u7F29\u8005",
      en: "the one who withdraws",
      ar: "\u0627\u0644\u0630\u064A \u064A\u062E\u062A\u0641\u064A \u0648\u064A\u062A\u0631\u0627\u062C\u0639"
    },
    {
      chapter: 114,
      word: "\u064A\u0648\u0633\u0648\u0633",
      zh: "\u6559\u5506\u3001\u79C1\u8BED",
      en: "whispers",
      ar: "\u064A\u064F\u0644\u0642\u064A \u0627\u0644\u0648\u0633\u0648\u0633\u0629"
    },
    {
      chapter: 114,
      word: "\u0635\u062F\u0648\u0631",
      zh: "\u80F8\u819B\uFF08\u5185\u5FC3\uFF09",
      en: "breasts (hearts)",
      ar: "\u0627\u0644\u0642\u0644\u0648\u0628"
    },
    {
      chapter: 114,
      word: "\u0627\u0644\u062C\u0646\u0629",
      zh: "\u7CBE\u7075",
      en: "jinn",
      ar: "\u0627\u0644\u062C\u0646"
    },
    {
      chapter: 49,
      word: "\u062A\u0642\u062F\u0645\u0648\u0627",
      zh: "\u62A2\u5148\u3001\u50ED\u8D8A",
      en: "put yourselves forward",
      ar: "\u062A\u062A\u0642\u062F\u0651\u0645\u0648\u0627"
    },
    {
      chapter: 49,
      word: "\u0648\u0627\u062A\u0642\u0648\u0627",
      zh: "\u4F60\u4EEC\u5F53\u656C\u754F",
      en: "and fear (be mindful of)",
      ar: "\u062E\u0627\u0641\u0648\u0627 \u0648\u0627\u062D\u0630\u0631\u0648\u0627"
    },
    {
      chapter: 49,
      word: "\u0633\u0645\u064A\u0639",
      zh: "\u5168\u806A\u7684",
      en: "All-Hearing",
      ar: "\u064A\u0633\u0645\u0639 \u0643\u0644 \u0634\u064A\u0621"
    },
    {
      chapter: 49,
      word: "\u0639\u0644\u064A\u0645",
      zh: "\u5168\u77E5\u7684",
      en: "All-Knowing",
      ar: "\u064A\u0639\u0644\u0645 \u0643\u0644 \u0634\u064A\u0621"
    },
    {
      chapter: 49,
      word: "\u0627\u0635\u0648\u0627\u062A\u0643\u0645",
      zh: "\u4F60\u4EEC\u7684\u58F0\u97F3",
      en: "your voices",
      ar: "\u0623\u0635\u0648\u0627\u062A\u0643\u0645"
    },
    {
      chapter: 49,
      word: "\u0627\u0644\u0646\u0628\u064A",
      zh: "\u5148\u77E5",
      en: "the Prophet",
      ar: "\u0627\u0644\u0646\u0628\u064A\u0651"
    },
    {
      chapter: 49,
      word: "\u062A\u062D\u0628\u0637",
      zh: "\u5931\u6548\u3001\u767D\u8D39",
      en: "become worthless",
      ar: "\u062A\u0628\u0637\u0644"
    },
    {
      chapter: 49,
      word: "\u064A\u063A\u0636\u0648\u0646",
      zh: "\u538B\u4F4E\uFF08\u58F0\u97F3\uFF09",
      en: "lower (their voices)",
      ar: "\u064A\u062E\u0641\u0636\u0648\u0646"
    },
    {
      chapter: 49,
      word: "\u0644\u0644\u062A\u0642\u0648\u064A",
      zh: "\u4E3A\u656C\u754F",
      en: "for righteousness",
      ar: "\u0644\u0644\u062E\u0634\u064A\u0629 \u0648\u0627\u0644\u0637\u0627\u0639\u0629"
    },
    {
      chapter: 49,
      word: "\u0645\u063A\u0641\u0631\u0629",
      zh: "\u9976\u6055",
      en: "forgiveness",
      ar: "\u0627\u0644\u0639\u0641\u0648 \u0639\u0646 \u0627\u0644\u0630\u0646\u0628"
    },
    {
      chapter: 49,
      word: "\u0648\u0627\u062C\u0631",
      zh: "\u62A5\u916C",
      en: "reward",
      ar: "\u062B\u0648\u0627\u0628"
    },
    {
      chapter: 49,
      word: "\u0627\u0644\u062D\u062C\u0631\u0627\u062A",
      zh: "\u5BDD\u5BA4\u3001\u5185\u5BA4",
      en: "the private rooms",
      ar: "\u0627\u0644\u063A\u0631\u0641"
    },
    {
      chapter: 49,
      word: "\u064A\u0639\u0642\u0644\u0648\u0646",
      zh: "\u7406\u89E3\u3001\u660E\u7406",
      en: "understand",
      ar: "\u064A\u0641\u0647\u0645\u0648\u0646"
    },
    {
      chapter: 49,
      word: "\u0635\u0628\u0631\u0648\u0627",
      zh: "\u4ED6\u4EEC\u575A\u5FCD",
      en: "they were patient",
      ar: "\u062A\u062D\u0645\u0651\u0644\u0648\u0627 \u0648\u0627\u0646\u062A\u0638\u0631\u0648\u0627"
    },
    {
      chapter: 49,
      word: "\u0641\u0627\u0633\u0642",
      zh: "\u6096\u9006\u8005",
      en: "a wrongdoer",
      ar: "\u0627\u0644\u062E\u0627\u0631\u062C \u0639\u0646 \u0627\u0644\u0637\u0627\u0639\u0629"
    },
    {
      chapter: 49,
      word: "\u0628\u0646\u0628\u0627",
      zh: "\u5E26\u7740\u6D88\u606F",
      en: "with news",
      ar: "\u0628\u062E\u0628\u0631"
    },
    {
      chapter: 49,
      word: "\u0641\u062A\u0628\u064A\u0646\u0648\u0627",
      zh: "\u4F60\u4EEC\u5F53\u6838\u5B9E",
      en: "verify it",
      ar: "\u062A\u062B\u0628\u0651\u062A\u0648\u0627 \u0648\u062A\u0623\u0643\u062F\u0648\u0627"
    },
    {
      chapter: 49,
      word: "\u0628\u062C\u0647\u0627\u0644\u0629",
      zh: "\u56E0\u65E0\u77E5",
      en: "out of ignorance",
      ar: "\u0628\u063A\u064A\u0631 \u0639\u0644\u0645"
    },
    {
      chapter: 49,
      word: "\u0646\u0627\u062F\u0645\u064A\u0646",
      zh: "\u540E\u6094\u7684",
      en: "regretful",
      ar: "\u0645\u062A\u062D\u0633\u0651\u0631\u064A\u0646"
    },
    {
      chapter: 49,
      word: "\u0627\u0644\u0627\u064A\u0645\u0627\u0646",
      zh: "\u4FE1\u4EF0",
      en: "faith",
      ar: "\u0627\u0644\u062A\u0635\u062F\u064A\u0642 \u0628\u0627\u0644\u0642\u0644\u0628"
    },
    {
      chapter: 49,
      word: "\u0627\u0644\u0643\u0641\u0631",
      zh: "\u4E0D\u4FE1",
      en: "disbelief",
      ar: "\u0627\u0644\u062C\u062D\u0648\u062F"
    },
    {
      chapter: 49,
      word: "\u0627\u0644\u0641\u0633\u0648\u0642",
      zh: "\u6096\u9006",
      en: "defiance, wickedness",
      ar: "\u0627\u0644\u062E\u0631\u0648\u062C \u0639\u0646 \u0627\u0644\u0637\u0627\u0639\u0629"
    },
    {
      chapter: 49,
      word: "\u0648\u0627\u0644\u0639\u0635\u064A\u0627\u0646",
      zh: "\u8FDD\u6297",
      en: "disobedience",
      ar: "\u0645\u062E\u0627\u0644\u0641\u0629 \u0627\u0644\u0623\u0645\u0631"
    },
    {
      chapter: 49,
      word: "\u0627\u0644\u0631\u0627\u0634\u062F\u0648\u0646",
      zh: "\u5FAA\u6B63\u9053\u8005",
      en: "the rightly guided",
      ar: "\u0627\u0644\u0645\u0647\u062A\u062F\u0648\u0646"
    },
    {
      chapter: 49,
      word: "\u0637\u0627\u0621\u0641\u062A\u0627\u0646",
      zh: "\u4E24\u4F19\u4EBA",
      en: "two groups",
      ar: "\u062C\u0645\u0627\u0639\u062A\u0627\u0646"
    },
    {
      chapter: 49,
      word: "\u0627\u0644\u0645\u0621\u0645\u0646\u064A\u0646",
      zh: "\u4FE1\u58EB\u4EEC",
      en: "the believers",
      ar: "\u0627\u0644\u0645\u0635\u062F\u0651\u0642\u0648\u0646"
    },
    {
      chapter: 49,
      word: "\u0627\u0642\u062A\u062A\u0644\u0648\u0627",
      zh: "\u4E92\u76F8\u4E89\u6597",
      en: "fight each other",
      ar: "\u062A\u0642\u0627\u062A\u0644\u0648\u0627"
    },
    {
      chapter: 49,
      word: "\u0641\u0627\u0635\u0644\u062D\u0648\u0627",
      zh: "\u4F60\u4EEC\u5F53\u8C03\u89E3",
      en: "make peace",
      ar: "\u0623\u0632\u064A\u0644\u0648\u0627 \u0627\u0644\u062E\u0644\u0627\u0641"
    },
    {
      chapter: 49,
      word: "\u0628\u0627\u0644\u0639\u062F\u0644",
      zh: "\u4EE5\u516C\u6B63",
      en: "with justice",
      ar: "\u0628\u0627\u0644\u0625\u0646\u0635\u0627\u0641"
    },
    {
      chapter: 49,
      word: "\u0627\u0644\u0645\u0642\u0633\u0637\u064A\u0646",
      zh: "\u4E3B\u6301\u516C\u9053\u8005",
      en: "those who act justly",
      ar: "\u0627\u0644\u0639\u0627\u062F\u0644\u0648\u0646"
    },
    {
      chapter: 49,
      word: "\u0627\u062E\u0648\u0629",
      zh: "\u5144\u5F1F",
      en: "brothers",
      ar: "\u0625\u062E\u0648\u0629"
    },
    {
      chapter: 49,
      word: "\u062A\u0631\u062D\u0645\u0648\u0646",
      zh: "\u4F60\u4EEC\u8499\u6148\u60AF",
      en: "you may receive mercy",
      ar: "\u062A\u0646\u0627\u0644\u0648\u0646 \u0627\u0644\u0631\u062D\u0645\u0629"
    },
    {
      chapter: 49,
      word: "\u064A\u0633\u062E\u0631",
      zh: "\u5632\u7B11",
      en: "ridicule",
      ar: "\u064A\u0633\u062A\u0647\u0632\u0626"
    },
    {
      chapter: 49,
      word: "\u062A\u0644\u0645\u0632\u0648\u0627",
      zh: "\u8BFD\u8C24\u3001\u6307\u8D23",
      en: "insult, find fault",
      ar: "\u062A\u0639\u064A\u0628\u0648\u0627"
    },
    {
      chapter: 49,
      word: "\u062A\u0646\u0627\u0628\u0632\u0648\u0627",
      zh: "\u4E92\u76F8\u53D6\u7EF0\u53F7",
      en: "call each other by nicknames",
      ar: "\u062A\u062A\u062F\u0627\u0639\u0648\u0627 \u0628\u0627\u0644\u0623\u0644\u0642\u0627\u0628"
    },
    {
      chapter: 49,
      word: "\u0628\u0627\u0644\u0627\u0644\u0642\u0627\u0628",
      zh: "\u4EE5\u7EF0\u53F7",
      en: "by (offensive) nicknames",
      ar: "\u0628\u0627\u0644\u0623\u0633\u0645\u0627\u0621 \u0627\u0644\u0645\u0643\u0631\u0648\u0647\u0629"
    },
    {
      chapter: 49,
      word: "\u0627\u0644\u0638\u0627\u0644\u0645\u0648\u0646",
      zh: "\u4E0D\u4E49\u8005",
      en: "the wrongdoers",
      ar: "\u0627\u0644\u0630\u064A\u0646 \u0638\u0644\u0645\u0648\u0627"
    },
    {
      chapter: 49,
      word: "\u0627\u062C\u062A\u0646\u0628\u0648\u0627",
      zh: "\u4F60\u4EEC\u5F53\u8FDC\u79BB",
      en: "avoid",
      ar: "\u0627\u0628\u062A\u0639\u062F\u0648\u0627"
    },
    {
      chapter: 49,
      word: "\u0627\u0644\u0638\u0646",
      zh: "\u731C\u7591",
      en: "suspicion, assumption",
      ar: "\u0627\u0644\u0634\u0643 \u0648\u0627\u0644\u062A\u062E\u0645\u064A\u0646"
    },
    {
      chapter: 49,
      word: "\u0627\u062B\u0645",
      zh: "\u7F6A",
      en: "sin",
      ar: "\u0630\u0646\u0628"
    },
    {
      chapter: 49,
      word: "\u062A\u062C\u0633\u0633\u0648\u0627",
      zh: "\u7AA5\u63A2",
      en: "spy",
      ar: "\u062A\u062A\u0628\u0651\u0639\u0648\u0627 \u0627\u0644\u0639\u0648\u0631\u0627\u062A"
    },
    {
      chapter: 49,
      word: "\u064A\u063A\u062A\u0628",
      zh: "\u80CC\u8C08",
      en: "backbite",
      ar: "\u064A\u0630\u0643\u0631 \u0623\u062E\u0627\u0647 \u0628\u0645\u0627 \u064A\u0643\u0631\u0647"
    },
    {
      chapter: 49,
      word: "\u062A\u0648\u0627\u0628",
      zh: "\u81F3\u8D66\u7684",
      en: "Accepting of repentance",
      ar: "\u0643\u062B\u064A\u0631 \u0642\u0628\u0648\u0644 \u0627\u0644\u062A\u0648\u0628\u0629"
    },
    {
      chapter: 49,
      word: "\u062E\u0644\u0642\u0646\u0627\u0643\u0645",
      zh: "\u6211\u4EEC\u521B\u9020\u4E86\u4F60\u4EEC",
      en: "We created you",
      ar: "\u0623\u0648\u062C\u062F\u0646\u0627\u0643\u0645"
    },
    {
      chapter: 49,
      word: "\u0630\u0643\u0631",
      zh: "\u7537",
      en: "male",
      ar: "\u0630\u0643\u0631"
    },
    {
      chapter: 49,
      word: "\u0648\u0627\u0646\u062B\u064A",
      zh: "\u5973",
      en: "female",
      ar: "\u0623\u0646\u062B\u0649"
    },
    {
      chapter: 49,
      word: "\u0634\u0639\u0648\u0628\u0627",
      zh: "\u6C11\u65CF",
      en: "peoples",
      ar: "\u0623\u0645\u0645"
    },
    {
      chapter: 49,
      word: "\u0648\u0642\u0628\u0627\u0621\u0644",
      zh: "\u90E8\u843D",
      en: "tribes",
      ar: "\u0642\u0628\u0627\u0626\u0644"
    },
    {
      chapter: 49,
      word: "\u0644\u062A\u0639\u0627\u0631\u0641\u0648\u0627",
      zh: "\u4EE5\u4FBF\u4F60\u4EEC\u4E92\u76F8\u8BA4\u8BC6",
      en: "so that you may know one another",
      ar: "\u0644\u064A\u0639\u0631\u0641 \u0628\u0639\u0636\u0643\u0645 \u0628\u0639\u0636\u064B\u0627"
    },
    {
      chapter: 49,
      word: "\u0627\u0643\u0631\u0645\u0643\u0645",
      zh: "\u4F60\u4EEC\u4E2D\u6700\u5C0A\u8D35\u8005",
      en: "the most noble of you",
      ar: "\u0623\u0641\u0636\u0644\u0643\u0645"
    },
    {
      chapter: 49,
      word: "\u0627\u062A\u0642\u064A\u0643\u0645",
      zh: "\u4F60\u4EEC\u4E2D\u6700\u656C\u754F\u8005",
      en: "the most righteous of you",
      ar: "\u0623\u0643\u062B\u0631\u0643\u0645 \u062A\u0642\u0648\u0649"
    },
    {
      chapter: 49,
      word: "\u062E\u0628\u064A\u0631",
      zh: "\u5F7B\u77E5\u7684",
      en: "All-Aware",
      ar: "\u0639\u0644\u064A\u0645 \u0628\u0628\u0648\u0627\u0637\u0646 \u0627\u0644\u0623\u0645\u0648\u0631"
    },
    {
      chapter: 49,
      word: "\u0627\u0644\u0627\u0639\u0631\u0627\u0628",
      zh: "\u6E38\u7267\u4EBA",
      en: "the desert Arabs",
      ar: "\u0633\u0643\u0627\u0646 \u0627\u0644\u0628\u0627\u062F\u064A\u0629"
    },
    {
      chapter: 49,
      word: "\u0627\u0633\u0644\u0645\u0646\u0627",
      zh: "\u6211\u4EEC\u5F52\u987A\u4E86",
      en: "we have submitted",
      ar: "\u0627\u0633\u062A\u0633\u0644\u0645\u0646\u0627 \u0648\u0627\u0646\u0642\u062F\u0646\u0627"
    },
    {
      chapter: 49,
      word: "\u064A\u0631\u062A\u0627\u0628\u0648\u0627",
      zh: "\u6000\u7591",
      en: "doubt",
      ar: "\u064A\u0634\u0643\u0651\u0648\u0627"
    },
    {
      chapter: 49,
      word: "\u0648\u062C\u0627\u0647\u062F\u0648\u0627",
      zh: "\u594B\u6597",
      en: "strive",
      ar: "\u0628\u0630\u0644\u0648\u0627 \u0627\u0644\u062C\u0647\u062F"
    },
    {
      chapter: 49,
      word: "\u0627\u0644\u0635\u0627\u062F\u0642\u0648\u0646",
      zh: "\u8BDA\u5B9E\u8005",
      en: "the truthful",
      ar: "\u0627\u0644\u0635\u0627\u062F\u0642\u0648\u0646 \u0641\u064A \u0625\u064A\u0645\u0627\u0646\u0647\u0645"
    },
    {
      chapter: 49,
      word: "\u0628\u062F\u064A\u0646\u0643\u0645",
      zh: "\u4EE5\u4F60\u4EEC\u7684\u5B97\u6559",
      en: "of your religion",
      ar: "\u0628\u062F\u064A\u0646\u0643\u0645"
    },
    {
      chapter: 49,
      word: "\u064A\u0645\u0646\u0648\u0646",
      zh: "\u4ED6\u4EEC\u65BD\u6069\u56FE\u62A5",
      en: "they consider it a favour",
      ar: "\u064A\u0630\u0643\u0651\u0631\u0648\u0646 \u0628\u0627\u0644\u0641\u0636\u0644"
    },
    {
      chapter: 49,
      word: "\u0647\u062F\u064A\u0643\u0645",
      zh: "\u4ED6\u5F15\u5BFC\u4E86\u4F60\u4EEC",
      en: "He guided you",
      ar: "\u0623\u0631\u0634\u062F\u0643\u0645"
    },
    {
      chapter: 49,
      word: "\u063A\u064A\u0628",
      zh: "\u5E7D\u7384",
      en: "the unseen",
      ar: "\u0645\u0627 \u062E\u0641\u064A"
    },
    {
      chapter: 49,
      word: "\u0628\u0635\u064A\u0631",
      zh: "\u660E\u5BDF\u7684",
      en: "All-Seeing",
      ar: "\u064A\u0631\u0649 \u0643\u0644 \u0634\u064A\u0621"
    },
    {
      chapter: 67,
      word: "\u062A\u0628\u0627\u0631\u0643",
      zh: "\u591A\u798F\u7684\u3001\u5C0A\u5D07\u7684",
      en: "blessed is",
      ar: "\u062A\u0639\u0627\u0638\u0645 \u0648\u0643\u062B\u0631 \u062E\u064A\u0631\u0647"
    },
    {
      chapter: 67,
      word: "\u0627\u0644\u0645\u0644\u0643",
      zh: "\u4E3B\u6743\u3001\u56FD\u6743",
      en: "the dominion",
      ar: "\u0627\u0644\u0633\u0644\u0637\u0627\u0646 \u0648\u0627\u0644\u062D\u0643\u0645"
    },
    {
      chapter: 67,
      word: "\u0642\u062F\u064A\u0631",
      zh: "\u5168\u80FD\u7684",
      en: "All-Powerful",
      ar: "\u0642\u0627\u062F\u0631 \u0639\u0644\u0649 \u0643\u0644 \u0634\u064A\u0621"
    },
    {
      chapter: 67,
      word: "\u0627\u0644\u0645\u0648\u062A",
      zh: "\u6B7B\u4EA1",
      en: "death",
      ar: "\u0627\u0644\u0645\u0648\u062A"
    },
    {
      chapter: 67,
      word: "\u0648\u0627\u0644\u062D\u064A\u0648\u0627\u0629",
      zh: "\u4E0E\u751F\u547D",
      en: "and life",
      ar: "\u0648\u0627\u0644\u062D\u064A\u0627\u0629"
    },
    {
      chapter: 67,
      word: "\u0644\u064A\u0628\u0644\u0648\u0643\u0645",
      zh: "\u4EE5\u4FBF\u8003\u9A8C\u4F60\u4EEC",
      en: "to test you",
      ar: "\u0644\u064A\u062E\u062A\u0628\u0631\u0643\u0645"
    },
    {
      chapter: 67,
      word: "\u0627\u062D\u0633\u0646",
      zh: "\u6700\u597D\u7684",
      en: "best",
      ar: "\u0623\u0641\u0636\u0644"
    },
    {
      chapter: 67,
      word: "\u0639\u0645\u0644\u0627",
      zh: "\u884C\u4E3A",
      en: "in deed",
      ar: "\u0639\u0645\u0644\u064B\u0627"
    },
    {
      chapter: 67,
      word: "\u0627\u0644\u0639\u0632\u064A\u0632",
      zh: "\u4E07\u80FD\u7684",
      en: "the Almighty",
      ar: "\u0627\u0644\u063A\u0627\u0644\u0628"
    },
    {
      chapter: 67,
      word: "\u0627\u0644\u063A\u0641\u0648\u0631",
      zh: "\u81F3\u8D66\u7684",
      en: "the Forgiving",
      ar: "\u0643\u062B\u064A\u0631 \u0627\u0644\u0645\u063A\u0641\u0631\u0629"
    },
    {
      chapter: 67,
      word: "\u0633\u0628\u0639",
      zh: "\u4E03",
      en: "seven",
      ar: "\u0633\u0628\u0639"
    },
    {
      chapter: 67,
      word: "\u0633\u0645\u0627\u0648\u0627\u062A",
      zh: "\u8BF8\u5929",
      en: "heavens",
      ar: "\u0633\u0645\u0627\u0648\u0627\u062A"
    },
    {
      chapter: 67,
      word: "\u0637\u0628\u0627\u0642\u0627",
      zh: "\u5C42\u5C42\u7684",
      en: "in layers",
      ar: "\u0628\u0639\u0636\u0647\u0627 \u0641\u0648\u0642 \u0628\u0639\u0636"
    },
    {
      chapter: 67,
      word: "\u062A\u0641\u0627\u0648\u062A",
      zh: "\u53C2\u5DEE\u3001\u4E0D\u534F\u8C03",
      en: "inconsistency",
      ar: "\u0627\u062E\u062A\u0644\u0627\u0641 \u0648\u0627\u0636\u0637\u0631\u0627\u0628"
    },
    {
      chapter: 67,
      word: "\u0627\u0644\u0628\u0635\u0631",
      zh: "\u89C6\u7EBF",
      en: "sight",
      ar: "\u0627\u0644\u0646\u0638\u0631"
    },
    {
      chapter: 67,
      word: "\u0641\u0637\u0648\u0631",
      zh: "\u88C2\u7F1D",
      en: "flaws, rifts",
      ar: "\u0634\u0642\u0648\u0642"
    },
    {
      chapter: 67,
      word: "\u0643\u0631\u062A\u064A\u0646",
      zh: "\u518D\u4E09",
      en: "again and again",
      ar: "\u0645\u0631\u0629 \u0628\u0639\u062F \u0645\u0631\u0629"
    },
    {
      chapter: 67,
      word: "\u062E\u0627\u0633\u0627",
      zh: "\u75B2\u60EB\u5730\u3001\u7F9E\u6127\u5730",
      en: "humbled",
      ar: "\u0630\u0644\u064A\u0644\u064B\u0627"
    },
    {
      chapter: 67,
      word: "\u062D\u0633\u064A\u0631",
      zh: "\u5026\u6020\u7684",
      en: "fatigued",
      ar: "\u0643\u0644\u064A\u0644 \u0645\u062A\u0639\u0628"
    },
    {
      chapter: 67,
      word: "\u0628\u0645\u0635\u0627\u0628\u064A\u062D",
      zh: "\u4EE5\u706F\uFF08\u661F\u8FB0\uFF09",
      en: "with lamps (stars)",
      ar: "\u0628\u0627\u0644\u0646\u062C\u0648\u0645 \u0627\u0644\u0645\u0636\u064A\u0626\u0629"
    },
    {
      chapter: 67,
      word: "\u0631\u062C\u0648\u0645\u0627",
      zh: "\u6295\u5C04\u7269",
      en: "missiles",
      ar: "\u0634\u064F\u0647\u064F\u0628\u064B\u0627 \u062A\u064F\u0631\u0645\u0649"
    },
    {
      chapter: 67,
      word: "\u0644\u0644\u0634\u064A\u0627\u0637\u064A\u0646",
      zh: "\u5BF9\u6076\u9B54",
      en: "for the devils",
      ar: "\u0644\u0644\u0634\u064A\u0627\u0637\u064A\u0646"
    },
    {
      chapter: 67,
      word: "\u0639\u0630\u0627\u0628",
      zh: "\u5211\u7F5A",
      en: "punishment",
      ar: "\u0639\u0642\u0648\u0628\u0629"
    },
    {
      chapter: 67,
      word: "\u0627\u0644\u0633\u0639\u064A\u0631",
      zh: "\u70C8\u706B",
      en: "the Blaze",
      ar: "\u0627\u0644\u0646\u0627\u0631 \u0627\u0644\u0645\u0644\u062A\u0647\u0628\u0629"
    },
    {
      chapter: 67,
      word: "\u062C\u0647\u0646\u0645",
      zh: "\u706B\u72F1",
      en: "Hell",
      ar: "\u062C\u0647\u0646\u0645"
    },
    {
      chapter: 67,
      word: "\u0627\u0644\u0645\u0635\u064A\u0631",
      zh: "\u5F52\u5BBF",
      en: "destination",
      ar: "\u0627\u0644\u0645\u0631\u062C\u0639"
    },
    {
      chapter: 67,
      word: "\u0634\u0647\u064A\u0642\u0627",
      zh: "\u5486\u54EE\u58F0",
      en: "a roaring",
      ar: "\u0635\u0648\u062A\u064B\u0627 \u0634\u062F\u064A\u062F\u064B\u0627"
    },
    {
      chapter: 67,
      word: "\u062A\u0641\u0648\u0631",
      zh: "\u6CB8\u817E",
      en: "boiling",
      ar: "\u062A\u063A\u0644\u064A"
    },
    {
      chapter: 67,
      word: "\u0627\u0644\u063A\u064A\u0638",
      zh: "\u66B4\u6012",
      en: "rage",
      ar: "\u0634\u062F\u0629 \u0627\u0644\u063A\u0636\u0628"
    },
    {
      chapter: 67,
      word: "\u0641\u0648\u062C",
      zh: "\u4E00\u7FA4",
      en: "a group",
      ar: "\u062C\u0645\u0627\u0639\u0629"
    },
    {
      chapter: 67,
      word: "\u062E\u0632\u0646\u062A\u0647\u0627",
      zh: "\u5B83\u7684\u770B\u5B88\u8005",
      en: "its keepers",
      ar: "\u062D\u0631\u0651\u0627\u0633\u0647\u0627"
    },
    {
      chapter: 67,
      word: "\u0646\u0630\u064A\u0631",
      zh: "\u8B66\u544A\u8005",
      en: "a warner",
      ar: "\u0645\u064F\u0646\u0630\u0650\u0631"
    },
    {
      chapter: 67,
      word: "\u0641\u0643\u0630\u0628\u0646\u0627",
      zh: "\u6211\u4EEC\u5426\u8BA4\u4E86",
      en: "but we denied",
      ar: "\u0641\u0623\u0646\u0643\u0631\u0646\u0627"
    },
    {
      chapter: 67,
      word: "\u0636\u0644\u0627\u0644",
      zh: "\u8FF7\u8BEF",
      en: "error",
      ar: "\u0636\u064A\u0627\u0639 \u0639\u0646 \u0627\u0644\u062D\u0642"
    },
    {
      chapter: 67,
      word: "\u0646\u0633\u0645\u0639",
      zh: "\u6211\u4EEC\u542C",
      en: "we listen",
      ar: "\u0646\u0633\u0645\u0639"
    },
    {
      chapter: 67,
      word: "\u0646\u0639\u0642\u0644",
      zh: "\u6211\u4EEC\u7406\u89E3",
      en: "we reason",
      ar: "\u0646\u0641\u0647\u0645"
    },
    {
      chapter: 67,
      word: "\u0641\u0627\u0639\u062A\u0631\u0641\u0648\u0627",
      zh: "\u4ED6\u4EEC\u627F\u8BA4\u4E86",
      en: "so they confessed",
      ar: "\u0623\u0642\u0631\u0651\u0648\u0627"
    },
    {
      chapter: 67,
      word: "\u0628\u0630\u0646\u0628\u0647\u0645",
      zh: "\u4ED6\u4EEC\u7684\u7F6A",
      en: "their sin",
      ar: "\u0628\u062E\u0637\u064A\u0626\u062A\u0647\u0645"
    },
    {
      chapter: 67,
      word: "\u064A\u062E\u0634\u0648\u0646",
      zh: "\u754F\u60E7",
      en: "fear",
      ar: "\u064A\u062E\u0627\u0641\u0648\u0646"
    },
    {
      chapter: 67,
      word: "\u0628\u0627\u0644\u063A\u064A\u0628",
      zh: "\u5728\u5E7D\u7384\u4E2D\uFF08\u672A\u89C1\u65F6\uFF09",
      en: "in the unseen",
      ar: "\u062F\u0648\u0646 \u0623\u0646 \u064A\u0631\u0648\u0627"
    },
    {
      chapter: 67,
      word: "\u0648\u0627\u0633\u0631\u0648\u0627",
      zh: "\u4F60\u4EEC\u9690\u85CF",
      en: "conceal",
      ar: "\u0623\u062E\u0641\u0648\u0627"
    },
    {
      chapter: 67,
      word: "\u0627\u062C\u0647\u0631\u0648\u0627",
      zh: "\u516C\u5F00",
      en: "declare openly",
      ar: "\u0623\u0639\u0644\u0646\u0648\u0627"
    },
    {
      chapter: 67,
      word: "\u0627\u0644\u0635\u062F\u0648\u0631",
      zh: "\u80F8\u4E2D\uFF08\u5185\u5FC3\uFF09",
      en: "the breasts",
      ar: "\u0627\u0644\u0642\u0644\u0648\u0628"
    },
    {
      chapter: 67,
      word: "\u0627\u0644\u0644\u0637\u064A\u0641",
      zh: "\u81F3\u7CBE\u5FAE\u7684",
      en: "the Subtle",
      ar: "\u0627\u0644\u0639\u0627\u0644\u0645 \u0628\u062F\u0642\u0627\u0626\u0642 \u0627\u0644\u0623\u0645\u0648\u0631"
    },
    {
      chapter: 67,
      word: "\u0627\u0644\u062E\u0628\u064A\u0631",
      zh: "\u5F7B\u77E5\u7684",
      en: "the All-Aware",
      ar: "\u0627\u0644\u0639\u0627\u0644\u0645 \u0628\u0628\u0648\u0627\u0637\u0646 \u0627\u0644\u0623\u0645\u0648\u0631"
    },
    {
      chapter: 67,
      word: "\u0630\u0644\u0648\u0644\u0627",
      zh: "\u9A6F\u670D\u7684",
      en: "subservient",
      ar: "\u0633\u0647\u0644\u0629 \u0645\u0630\u0644\u0651\u0644\u0629"
    },
    {
      chapter: 67,
      word: "\u0645\u0646\u0627\u0643\u0628\u0647\u0627",
      zh: "\u5B83\u7684\u5404\u65B9",
      en: "its regions",
      ar: "\u062C\u0648\u0627\u0646\u0628\u0647\u0627"
    },
    {
      chapter: 67,
      word: "\u0631\u0632\u0642\u0647",
      zh: "\u4ED6\u7684\u7ED9\u517B",
      en: "His provision",
      ar: "\u0645\u0627 \u0631\u0632\u0642"
    },
    {
      chapter: 67,
      word: "\u0627\u0644\u0646\u0634\u0648\u0631",
      zh: "\u590D\u6D3B",
      en: "the resurrection",
      ar: "\u0627\u0644\u0628\u0639\u062B"
    },
    {
      chapter: 67,
      word: "\u064A\u062E\u0633\u0641",
      zh: "\u4F7F\u9677\u843D",
      en: "cause to swallow",
      ar: "\u064A\u063A\u0648\u0631 \u0628\u0643\u0645"
    },
    {
      chapter: 67,
      word: "\u062A\u0645\u0648\u0631",
      zh: "\u52A8\u8361",
      en: "sways",
      ar: "\u062A\u0636\u0637\u0631\u0628"
    },
    {
      chapter: 67,
      word: "\u062D\u0627\u0635\u0628\u0627",
      zh: "\u98DE\u77F3",
      en: "a storm of stones",
      ar: "\u0631\u064A\u062D\u064B\u0627 \u0641\u064A\u0647\u0627 \u062D\u062C\u0627\u0631\u0629"
    },
    {
      chapter: 67,
      word: "\u0646\u0643\u064A\u0631",
      zh: "\u6211\u7684\u8C34\u8D23",
      en: "My denial (punishment)",
      ar: "\u0625\u0646\u0643\u0627\u0631\u064A \u0648\u0639\u0642\u0648\u0628\u062A\u064A"
    },
    {
      chapter: 67,
      word: "\u0627\u0644\u0637\u064A\u0631",
      zh: "\u9E1F",
      en: "the birds",
      ar: "\u0627\u0644\u0637\u064A\u0648\u0631"
    },
    {
      chapter: 67,
      word: "\u0635\u0627\u0641\u0627\u062A",
      zh: "\u5C55\u7FC5\u7684",
      en: "spreading their wings",
      ar: "\u0628\u0627\u0633\u0637\u0627\u062A \u0623\u062C\u0646\u062D\u062A\u0647\u0627"
    },
    {
      chapter: 67,
      word: "\u0648\u064A\u0642\u0628\u0636\u0646",
      zh: "\u6536\u7FC5",
      en: "and folding them",
      ar: "\u0648\u064A\u0636\u0645\u0645\u0646"
    },
    {
      chapter: 67,
      word: "\u062C\u0646\u062F",
      zh: "\u519B\u961F",
      en: "an army",
      ar: "\u062C\u064A\u0634"
    },
    {
      chapter: 67,
      word: "\u064A\u0646\u0635\u0631\u0643\u0645",
      zh: "\u63F4\u52A9\u4F60\u4EEC",
      en: "help you",
      ar: "\u064A\u0639\u064A\u0646\u0643\u0645"
    },
    {
      chapter: 67,
      word: "\u063A\u0631\u0648\u0631",
      zh: "\u6B3A\u9A97\u3001\u8FF7\u60D1",
      en: "delusion",
      ar: "\u062E\u062F\u0627\u0639"
    },
    {
      chapter: 67,
      word: "\u064A\u0631\u0632\u0642\u0643\u0645",
      zh: "\u4F9B\u7ED9\u4F60\u4EEC",
      en: "provide for you",
      ar: "\u064A\u0639\u0637\u064A\u0643\u0645 \u0627\u0644\u0631\u0632\u0642"
    },
    {
      chapter: 67,
      word: "\u0639\u062A\u0648",
      zh: "\u50B2\u6162",
      en: "insolence",
      ar: "\u062A\u0643\u0628\u0651\u0631"
    },
    {
      chapter: 67,
      word: "\u0648\u0646\u0641\u0648\u0631",
      zh: "\u4E0E\u6297\u62D2",
      en: "and aversion",
      ar: "\u0648\u0627\u0628\u062A\u0639\u0627\u062F"
    },
    {
      chapter: 67,
      word: "\u0645\u0643\u0628\u0627",
      zh: "\u4FEF\u4F0F\u5730",
      en: "fallen on his face",
      ar: "\u0645\u0646\u0643\u0628\u064B\u0627"
    },
    {
      chapter: 67,
      word: "\u0633\u0648\u064A\u0627",
      zh: "\u7AEF\u6B63\u5730",
      en: "upright",
      ar: "\u0645\u0633\u062A\u0642\u064A\u0645\u064B\u0627"
    },
    {
      chapter: 67,
      word: "\u0627\u0646\u0634\u0627\u0643\u0645",
      zh: "\u4ED6\u521B\u9020\u4E86\u4F60\u4EEC",
      en: "He produced you",
      ar: "\u0623\u0648\u062C\u062F\u0643\u0645"
    },
    {
      chapter: 67,
      word: "\u0627\u0644\u0633\u0645\u0639",
      zh: "\u542C\u89C9",
      en: "hearing",
      ar: "\u0627\u0644\u0633\u0645\u0639"
    },
    {
      chapter: 67,
      word: "\u0648\u0627\u0644\u0627\u0628\u0635\u0627\u0631",
      zh: "\u4E0E\u89C6\u89C9",
      en: "and sight",
      ar: "\u0648\u0627\u0644\u0639\u064A\u0648\u0646"
    },
    {
      chapter: 67,
      word: "\u0648\u0627\u0644\u0627\u0641\u0621\u062F\u0629",
      zh: "\u4E0E\u5FC3",
      en: "and hearts",
      ar: "\u0648\u0627\u0644\u0642\u0644\u0648\u0628"
    },
    {
      chapter: 67,
      word: "\u062A\u0634\u0643\u0631\u0648\u0646",
      zh: "\u4F60\u4EEC\u611F\u8C22",
      en: "you give thanks",
      ar: "\u062A\u0634\u0643\u0631\u0648\u0646"
    },
    {
      chapter: 67,
      word: "\u0630\u0631\u0627\u0643\u0645",
      zh: "\u4ED6\u7E41\u884D\u4E86\u4F60\u4EEC",
      en: "He multiplied you",
      ar: "\u0628\u062B\u0651\u0643\u0645 \u0648\u0646\u0634\u0631\u0643\u0645"
    },
    {
      chapter: 67,
      word: "\u062A\u062D\u0634\u0631\u0648\u0646",
      zh: "\u4F60\u4EEC\u88AB\u96C6\u5408",
      en: "you will be gathered",
      ar: "\u062A\u064F\u062C\u0645\u0639\u0648\u0646"
    },
    {
      chapter: 67,
      word: "\u0627\u0644\u0648\u0639\u062F",
      zh: "\u5141\u8BFA",
      en: "the promise",
      ar: "\u0627\u0644\u0648\u0639\u062F"
    },
    {
      chapter: 67,
      word: "\u0627\u0644\u0639\u0644\u0645",
      zh: "\u77E5\u8BC6",
      en: "knowledge",
      ar: "\u0627\u0644\u0639\u0644\u0645"
    },
    {
      chapter: 67,
      word: "\u0632\u0644\u0641\u0629",
      zh: "\u4E34\u8FD1",
      en: "near",
      ar: "\u0642\u0631\u064A\u0628\u064B\u0627"
    },
    {
      chapter: 67,
      word: "\u0648\u062C\u0648\u0647",
      zh: "\u9762\u5BB9",
      en: "faces",
      ar: "\u0648\u062C\u0648\u0647"
    },
    {
      chapter: 67,
      word: "\u062A\u062F\u0639\u0648\u0646",
      zh: "\u4F60\u4EEC\uFF08\u66FE\uFF09\u8981\u6C42",
      en: "you used to call for",
      ar: "\u062A\u0637\u0644\u0628\u0648\u0646"
    },
    {
      chapter: 67,
      word: "\u0627\u0647\u0644\u0643\u0646\u064A",
      zh: "\u6BC1\u706D\u6211",
      en: "destroys me",
      ar: "\u0623\u0645\u0627\u062A\u0646\u064A"
    },
    {
      chapter: 67,
      word: "\u0631\u062D\u0645\u0646\u0627",
      zh: "\u6148\u60AF\u6211\u4EEC",
      en: "has mercy on us",
      ar: "\u0631\u062D\u0645\u0646\u0627"
    },
    {
      chapter: 67,
      word: "\u064A\u062C\u064A\u0631",
      zh: "\u4FDD\u62A4",
      en: "protect",
      ar: "\u064A\u062D\u0645\u064A"
    },
    {
      chapter: 67,
      word: "\u0627\u0644\u064A\u0645",
      zh: "\u75DB\u82E6\u7684",
      en: "painful",
      ar: "\u0645\u0648\u062C\u0639"
    },
    {
      chapter: 67,
      word: "\u062A\u0648\u0643\u0644\u0646\u0627",
      zh: "\u6211\u4EEC\u6258\u9760",
      en: "we rely",
      ar: "\u0627\u0639\u062A\u0645\u062F\u0646\u0627"
    },
    {
      chapter: 67,
      word: "\u0645\u0627\u0621\u0643\u0645",
      zh: "\u4F60\u4EEC\u7684\u6C34",
      en: "your water",
      ar: "\u0645\u0627\u0624\u0643\u0645"
    },
    {
      chapter: 67,
      word: "\u063A\u0648\u0631\u0627",
      zh: "\u6E17\u5165\u5730\u4E0B",
      en: "sunk (into the earth)",
      ar: "\u0630\u0627\u0647\u0628\u064B\u0627 \u0641\u064A \u0627\u0644\u0623\u0631\u0636"
    },
    {
      chapter: 67,
      word: "\u0645\u0639\u064A\u0646",
      zh: "\u6D41\u52A8\u7684\uFF08\u6CC9\u6C34\uFF09",
      en: "flowing",
      ar: "\u062C\u0627\u0631\u064D \u0638\u0627\u0647\u0631"
    },
    {
      chapter: 55,
      word: "\u0639\u0644\u0645",
      zh: "\u6559\u6388",
      en: "taught",
      ar: "\u0639\u0644\u0651\u0645"
    },
    {
      chapter: 55,
      word: "\u0627\u0644\u0642\u0631\u0627\u0646",
      zh: "\u53E4\u5170\u7ECF",
      en: "the Quran",
      ar: "\u0627\u0644\u0642\u0631\u0622\u0646"
    },
    {
      chapter: 55,
      word: "\u0627\u0644\u0628\u064A\u0627\u0646",
      zh: "\u8868\u8FBE\u3001\u8BF4\u660E",
      en: "eloquence, expression",
      ar: "\u0627\u0644\u0646\u0637\u0642 \u0648\u0627\u0644\u0625\u0641\u0635\u0627\u062D"
    },
    {
      chapter: 55,
      word: "\u0627\u0644\u0634\u0645\u0633",
      zh: "\u592A\u9633",
      en: "the sun",
      ar: "\u0627\u0644\u0634\u0645\u0633"
    },
    {
      chapter: 55,
      word: "\u0648\u0627\u0644\u0642\u0645\u0631",
      zh: "\u4E0E\u6708\u4EAE",
      en: "and the moon",
      ar: "\u0648\u0627\u0644\u0642\u0645\u0631"
    },
    {
      chapter: 55,
      word: "\u0628\u062D\u0633\u0628\u0627\u0646",
      zh: "\u4F9D\u5B9A\u6570\u8FD0\u884C",
      en: "by precise calculation",
      ar: "\u0628\u062D\u0633\u0627\u0628 \u062F\u0642\u064A\u0642"
    },
    {
      chapter: 55,
      word: "\u0648\u0627\u0644\u0646\u062C\u0645",
      zh: "\u4E0E\u661F\u8FB0\uFF08\u8349\u6728\uFF09",
      en: "and the stars (or plants)",
      ar: "\u0648\u0627\u0644\u0646\u062C\u0645"
    },
    {
      chapter: 55,
      word: "\u0648\u0627\u0644\u0634\u062C\u0631",
      zh: "\u4E0E\u6811\u6728",
      en: "and the trees",
      ar: "\u0648\u0627\u0644\u0634\u062C\u0631"
    },
    {
      chapter: 55,
      word: "\u064A\u0633\u062C\u062F\u0627\u0646",
      zh: "\u4E24\u8005\u53E9\u5934",
      en: "both prostrate",
      ar: "\u064A\u062E\u0636\u0639\u0627\u0646"
    },
    {
      chapter: 55,
      word: "\u0631\u0641\u0639\u0647\u0627",
      zh: "\u4ED6\u5347\u8D77\u5B83",
      en: "He raised it",
      ar: "\u0631\u0641\u0639\u0647\u0627"
    },
    {
      chapter: 55,
      word: "\u0627\u0644\u0645\u064A\u0632\u0627\u0646",
      zh: "\u5929\u5E73\u3001\u5E73\u8861",
      en: "the balance",
      ar: "\u0627\u0644\u0639\u062F\u0644 \u0648\u0627\u0644\u0645\u064A\u0632\u0627\u0646"
    },
    {
      chapter: 55,
      word: "\u062A\u0637\u063A\u0648\u0627",
      zh: "\u8FC7\u5206",
      en: "transgress",
      ar: "\u062A\u062A\u062C\u0627\u0648\u0632\u0648\u0627 \u0627\u0644\u062D\u062F"
    },
    {
      chapter: 55,
      word: "\u0627\u0644\u0648\u0632\u0646",
      zh: "\u79F0\u91CF",
      en: "the weight",
      ar: "\u0627\u0644\u0648\u0632\u0646"
    },
    {
      chapter: 55,
      word: "\u0628\u0627\u0644\u0642\u0633\u0637",
      zh: "\u4EE5\u516C\u5E73",
      en: "with justice",
      ar: "\u0628\u0627\u0644\u0639\u062F\u0644"
    },
    {
      chapter: 55,
      word: "\u062A\u062E\u0633\u0631\u0648\u0627",
      zh: "\u4F60\u4EEC\u51CF\u5C11",
      en: "make deficient",
      ar: "\u062A\u0646\u0642\u0635\u0648\u0627"
    },
    {
      chapter: 55,
      word: "\u0644\u0644\u0627\u0646\u0627\u0645",
      zh: "\u4E3A\u4F17\u751F",
      en: "for the creatures",
      ar: "\u0644\u0644\u062E\u0644\u0642"
    },
    {
      chapter: 55,
      word: "\u0641\u0627\u0643\u0647\u0629",
      zh: "\u6C34\u679C",
      en: "fruit",
      ar: "\u0641\u0627\u0643\u0647\u0629"
    },
    {
      chapter: 55,
      word: "\u0648\u0627\u0644\u0646\u062E\u0644",
      zh: "\u4E0E\u6930\u67A3\u6811",
      en: "and palm trees",
      ar: "\u0648\u0627\u0644\u0646\u062E\u0644"
    },
    {
      chapter: 55,
      word: "\u0627\u0644\u0627\u0643\u0645\u0627\u0645",
      zh: "\u82B1\u843C\u3001\u82B1\u82DE",
      en: "sheaths",
      ar: "\u0623\u0648\u0639\u064A\u0629 \u0627\u0644\u0637\u0644\u0639"
    },
    {
      chapter: 55,
      word: "\u0648\u0627\u0644\u062D\u0628",
      zh: "\u4E0E\u8C37\u7C92",
      en: "and grain",
      ar: "\u0648\u0627\u0644\u062D\u0628\u0648\u0628"
    },
    {
      chapter: 55,
      word: "\u0627\u0644\u0639\u0635\u0641",
      zh: "\u830E\u53F6\u3001\u7CE0",
      en: "husks",
      ar: "\u0648\u0631\u0642 \u0627\u0644\u0632\u0631\u0639"
    },
    {
      chapter: 55,
      word: "\u0648\u0627\u0644\u0631\u064A\u062D\u0627\u0646",
      zh: "\u4E0E\u9999\u8349",
      en: "and fragrant plants",
      ar: "\u0648\u0627\u0644\u0646\u0628\u0627\u062A \u0627\u0644\u0637\u064A\u0628"
    },
    {
      chapter: 55,
      word: "\u0641\u0628\u0627\u064A",
      zh: "\u90A3\u4E48\uFF0C\u54EA\u4E00\u4EF6",
      en: "so which of",
      ar: "\u0641\u0628\u0623\u064A\u0651"
    },
    {
      chapter: 55,
      word: "\u0627\u0644\u0627\u0621",
      zh: "\u6069\u5178",
      en: "favours",
      ar: "\u0627\u0644\u0646\u0639\u0645"
    },
    {
      chapter: 55,
      word: "\u0631\u0628\u0643\u0645\u0627",
      zh: "\u4F60\u4FE9\u7684\u4E3B",
      en: "your Lord (dual)",
      ar: "\u0631\u0628\u0643\u0645\u0627"
    },
    {
      chapter: 55,
      word: "\u062A\u0643\u0630\u0628\u0627\u0646",
      zh: "\u4F60\u4FE9\u5426\u8BA4",
      en: "would you both deny",
      ar: "\u062A\u0646\u0643\u0631\u0627\u0646"
    },
    {
      chapter: 55,
      word: "\u0635\u0644\u0635\u0627\u0644",
      zh: "\u5E72\u6CE5",
      en: "clay",
      ar: "\u0637\u064A\u0646 \u064A\u0627\u0628\u0633"
    },
    {
      chapter: 55,
      word: "\u0643\u0627\u0644\u0641\u062E\u0627\u0631",
      zh: "\u50CF\u9676\u5668",
      en: "like pottery",
      ar: "\u0643\u0627\u0644\u0637\u064A\u0646 \u0627\u0644\u0645\u062D\u0631\u0648\u0642"
    },
    {
      chapter: 55,
      word: "\u0627\u0644\u062C\u0627\u0646",
      zh: "\u7CBE\u7075",
      en: "the jinn",
      ar: "\u0627\u0644\u062C\u0646"
    },
    {
      chapter: 55,
      word: "\u0645\u0627\u0631\u062C",
      zh: "\u706B\u7130",
      en: "a smokeless flame",
      ar: "\u0644\u0647\u0628"
    },
    {
      chapter: 55,
      word: "\u0646\u0627\u0631",
      zh: "\u706B",
      en: "fire",
      ar: "\u0646\u0627\u0631"
    },
    {
      chapter: 55,
      word: "\u0627\u0644\u0645\u0634\u0631\u0642\u064A\u0646",
      zh: "\u4E24\u4E2A\u4E1C\u65B9",
      en: "the two easts",
      ar: "\u0645\u0634\u0631\u0642\u0627 \u0627\u0644\u0634\u062A\u0627\u0621 \u0648\u0627\u0644\u0635\u064A\u0641"
    },
    {
      chapter: 55,
      word: "\u0627\u0644\u0645\u063A\u0631\u0628\u064A\u0646",
      zh: "\u4E24\u4E2A\u897F\u65B9",
      en: "the two wests",
      ar: "\u0645\u063A\u0631\u0628\u0627 \u0627\u0644\u0634\u062A\u0627\u0621 \u0648\u0627\u0644\u0635\u064A\u0641"
    },
    {
      chapter: 55,
      word: "\u0645\u0631\u062C",
      zh: "\u4F7F\u6C47\u5408",
      en: "He released",
      ar: "\u0623\u0631\u0633\u0644 \u0648\u062E\u0644\u0637"
    },
    {
      chapter: 55,
      word: "\u0627\u0644\u0628\u062D\u0631\u064A\u0646",
      zh: "\u4E24\u6D77",
      en: "the two seas",
      ar: "\u0627\u0644\u0628\u062D\u0631\u064A\u0646"
    },
    {
      chapter: 55,
      word: "\u064A\u0644\u062A\u0642\u064A\u0627\u0646",
      zh: "\u4E24\u8005\u76F8\u9047",
      en: "they meet",
      ar: "\u064A\u062A\u0642\u0627\u0628\u0644\u0627\u0646"
    },
    {
      chapter: 55,
      word: "\u0628\u0631\u0632\u062E",
      zh: "\u5C4F\u969C",
      en: "a barrier",
      ar: "\u062D\u0627\u062C\u0632"
    },
    {
      chapter: 55,
      word: "\u064A\u0628\u063A\u064A\u0627\u0646",
      zh: "\u4E24\u8005\u8D8A\u754C",
      en: "they transgress",
      ar: "\u064A\u0639\u062A\u062F\u064A\u0627\u0646"
    },
    {
      chapter: 55,
      word: "\u0627\u0644\u0644\u0621\u0644\u0621",
      zh: "\u73CD\u73E0",
      en: "pearls",
      ar: "\u0627\u0644\u0644\u0624\u0644\u0624"
    },
    {
      chapter: 55,
      word: "\u0648\u0627\u0644\u0645\u0631\u062C\u0627\u0646",
      zh: "\u4E0E\u73CA\u745A",
      en: "and coral",
      ar: "\u0648\u0627\u0644\u0645\u0631\u062C\u0627\u0646"
    },
    {
      chapter: 55,
      word: "\u0627\u0644\u062C\u0648\u0627\u0631",
      zh: "\u8239\u53EA",
      en: "the ships",
      ar: "\u0627\u0644\u0633\u0641\u0646"
    },
    {
      chapter: 55,
      word: "\u0627\u0644\u0645\u0646\u0634\u0627\u062A",
      zh: "\u9AD8\u8038\u7684",
      en: "elevated",
      ar: "\u0627\u0644\u0645\u0631\u062A\u0641\u0639\u0629"
    },
    {
      chapter: 55,
      word: "\u0643\u0627\u0644\u0627\u0639\u0644\u0627\u0645",
      zh: "\u50CF\u5C71\u5CB3",
      en: "like mountains",
      ar: "\u0643\u0627\u0644\u062C\u0628\u0627\u0644"
    },
    {
      chapter: 55,
      word: "\u0641\u0627\u0646",
      zh: "\u8981\u6D88\u901D\u7684",
      en: "will perish",
      ar: "\u0632\u0627\u0626\u0644"
    },
    {
      chapter: 55,
      word: "\u0648\u064A\u0628\u0642\u064A",
      zh: "\u800C\u6C38\u5B58",
      en: "and there remains",
      ar: "\u0648\u064A\u062F\u0648\u0645"
    },
    {
      chapter: 55,
      word: "\u0627\u0644\u062C\u0644\u0627\u0644",
      zh: "\u5C0A\u4E25",
      en: "majesty",
      ar: "\u0627\u0644\u0639\u0638\u0645\u0629"
    },
    {
      chapter: 55,
      word: "\u0648\u0627\u0644\u0627\u0643\u0631\u0627\u0645",
      zh: "\u4E0E\u5C0A\u8363",
      en: "and honour",
      ar: "\u0648\u0627\u0644\u0643\u0631\u0645"
    },
    {
      chapter: 55,
      word: "\u0634\u0627\u0646",
      zh: "\u4E8B\u52A1",
      en: "a matter",
      ar: "\u0623\u0645\u0631"
    },
    {
      chapter: 55,
      word: "\u0633\u0646\u0641\u0631\u063A",
      zh: "\u6211\u4EEC\u5C06\u4E13\u6CE8",
      en: "We will attend",
      ar: "\u0633\u0646\u062A\u0641\u0631\u0651\u063A"
    },
    {
      chapter: 55,
      word: "\u0627\u0644\u062B\u0642\u0644\u0627\u0646",
      zh: "\u4E24\u5927\u7C7B\uFF08\u4EBA\u4E0E\u7CBE\u7075\uFF09",
      en: "the two weighty ones",
      ar: "\u0627\u0644\u062C\u0646 \u0648\u0627\u0644\u0625\u0646\u0633"
    },
    {
      chapter: 55,
      word: "\u064A\u0627\u0645\u0639\u0634\u0631",
      zh: "\u2026\u2026\u7684\u7FA4\u4F53\u554A",
      en: "O company of",
      ar: "\u064A\u0627 \u062C\u0645\u0627\u0639\u0629"
    },
    {
      chapter: 55,
      word: "\u062A\u0646\u0641\u0630\u0648\u0627",
      zh: "\u4F60\u4EEC\u7A7F\u8D8A",
      en: "pass beyond",
      ar: "\u062A\u062E\u0631\u062C\u0648\u0627"
    },
    {
      chapter: 55,
      word: "\u0627\u0642\u0637\u0627\u0631",
      zh: "\u5404\u8FB9\u3001\u533A\u57DF",
      en: "the regions",
      ar: "\u0646\u0648\u0627\u062D\u064A"
    },
    {
      chapter: 55,
      word: "\u0628\u0633\u0644\u0637\u0627\u0646",
      zh: "\u51ED\u6743\u529B",
      en: "with authority",
      ar: "\u0628\u0642\u0648\u0629 \u0648\u062D\u062C\u0629"
    },
    {
      chapter: 55,
      word: "\u0634\u0648\u0627\u0638",
      zh: "\u706B\u7130",
      en: "a flame",
      ar: "\u0644\u0647\u0628"
    },
    {
      chapter: 55,
      word: "\u0648\u0646\u062D\u0627\u0633",
      zh: "\u4E0E\u70DF",
      en: "and smoke",
      ar: "\u0648\u062F\u062E\u0627\u0646"
    },
    {
      chapter: 55,
      word: "\u062A\u0646\u062A\u0635\u0631\u0627\u0646",
      zh: "\u4F60\u4FE9\u83B7\u6551",
      en: "you both will defend",
      ar: "\u062A\u0645\u062A\u0646\u0639\u0627\u0646"
    },
    {
      chapter: 55,
      word: "\u0627\u0646\u0634\u0642\u062A",
      zh: "\u7834\u88C2",
      en: "is split",
      ar: "\u062A\u0635\u062F\u0651\u0639\u062A"
    },
    {
      chapter: 55,
      word: "\u0648\u0631\u062F\u0629",
      zh: "\u73AB\u7470\u8272",
      en: "rose-coloured",
      ar: "\u062D\u0645\u0631\u0627\u0621 \u0643\u0627\u0644\u0648\u0631\u062F"
    },
    {
      chapter: 55,
      word: "\u0643\u0627\u0644\u062F\u0647\u0627\u0646",
      zh: "\u50CF\u6CB9\u8102",
      en: "like oil",
      ar: "\u0643\u0627\u0644\u0632\u064A\u062A"
    },
    {
      chapter: 55,
      word: "\u0627\u0644\u0645\u062C\u0631\u0645\u0648\u0646",
      zh: "\u7F6A\u4EBA",
      en: "the criminals",
      ar: "\u0627\u0644\u0645\u0630\u0646\u0628\u0648\u0646"
    },
    {
      chapter: 55,
      word: "\u0628\u0633\u064A\u0645\u0627\u0647\u0645",
      zh: "\u51ED\u4ED6\u4EEC\u7684\u6807\u8BB0",
      en: "by their marks",
      ar: "\u0628\u0639\u0644\u0627\u0645\u0627\u062A\u0647\u0645"
    },
    {
      chapter: 55,
      word: "\u0628\u0627\u0644\u0646\u0648\u0627\u0635\u064A",
      zh: "\u6293\u989D\u53D1",
      en: "by the forelocks",
      ar: "\u0628\u0645\u0642\u062F\u0651\u0645 \u0627\u0644\u0631\u0623\u0633"
    },
    {
      chapter: 55,
      word: "\u0648\u0627\u0644\u0627\u0642\u062F\u0627\u0645",
      zh: "\u4E0E\u53CC\u811A",
      en: "and the feet",
      ar: "\u0648\u0627\u0644\u0623\u0631\u062C\u0644"
    },
    {
      chapter: 55,
      word: "\u062D\u0645\u064A\u0645",
      zh: "\u6CB8\u6C34",
      en: "scalding water",
      ar: "\u0645\u0627\u0621 \u0634\u062F\u064A\u062F \u0627\u0644\u062D\u0631\u0627\u0631\u0629"
    },
    {
      chapter: 55,
      word: "\u062E\u0627\u0641",
      zh: "\u754F\u60E7",
      en: "fears",
      ar: "\u062E\u0627\u0641"
    },
    {
      chapter: 55,
      word: "\u0645\u0642\u0627\u0645",
      zh: "\u7AD9\u7ACB\uFF08\u9762\u5BF9\uFF09",
      en: "the standing (before)",
      ar: "\u0627\u0644\u0648\u0642\u0648\u0641 \u0628\u064A\u0646 \u064A\u062F\u064A"
    },
    {
      chapter: 55,
      word: "\u062C\u0646\u062A\u0627\u0646",
      zh: "\u4E24\u5EA7\u4E50\u56ED",
      en: "two gardens",
      ar: "\u062C\u0646\u062A\u0627\u0646"
    },
    {
      chapter: 55,
      word: "\u0627\u0641\u0646\u0627\u0646",
      zh: "\u679D\u6761",
      en: "branches",
      ar: "\u0623\u063A\u0635\u0627\u0646"
    },
    {
      chapter: 55,
      word: "\u0639\u064A\u0646\u0627\u0646",
      zh: "\u4E24\u9053\u6CC9",
      en: "two springs",
      ar: "\u0639\u064A\u0646\u0627\u0646"
    },
    {
      chapter: 55,
      word: "\u062A\u062C\u0631\u064A\u0627\u0646",
      zh: "\u4E24\u6CC9\u6D41\u6DCC",
      en: "flowing",
      ar: "\u062A\u0633\u064A\u0644\u0627\u0646"
    },
    {
      chapter: 55,
      word: "\u0632\u0648\u062C\u0627\u0646",
      zh: "\u4E24\u79CD",
      en: "two kinds",
      ar: "\u0635\u0646\u0641\u0627\u0646"
    },
    {
      chapter: 55,
      word: "\u0645\u062A\u0643\u0621\u064A\u0646",
      zh: "\u659C\u501A\u7740",
      en: "reclining",
      ar: "\u0645\u0633\u062A\u0646\u062F\u064A\u0646"
    },
    {
      chapter: 55,
      word: "\u0641\u0631\u0634",
      zh: "\u5E8A\u8925",
      en: "beds",
      ar: "\u0641\u064F\u0631\u0634"
    },
    {
      chapter: 55,
      word: "\u0627\u0633\u062A\u0628\u0631\u0642",
      zh: "\u9526\u7F0E",
      en: "brocade",
      ar: "\u062D\u0631\u064A\u0631 \u063A\u0644\u064A\u0638"
    },
    {
      chapter: 55,
      word: "\u0648\u062C\u0646\u064A",
      zh: "\u4E0E\u679C\u5B9E",
      en: "and the fruit",
      ar: "\u0648\u062B\u0645\u0631"
    },
    {
      chapter: 55,
      word: "\u062F\u0627\u0646",
      zh: "\u4E34\u8FD1\u7684",
      en: "near at hand",
      ar: "\u0642\u0631\u064A\u0628"
    },
    {
      chapter: 55,
      word: "\u0627\u0644\u064A\u0627\u0642\u0648\u062A",
      zh: "\u7EA2\u5B9D\u77F3",
      en: "rubies",
      ar: "\u0627\u0644\u064A\u0627\u0642\u0648\u062A"
    },
    {
      chapter: 55,
      word: "\u062C\u0632\u0627\u0621",
      zh: "\u62A5\u916C",
      en: "reward",
      ar: "\u0645\u0643\u0627\u0641\u0623\u0629"
    },
    {
      chapter: 55,
      word: "\u0627\u0644\u0627\u062D\u0633\u0627\u0646",
      zh: "\u5584\u884C",
      en: "good",
      ar: "\u0627\u0644\u0625\u062D\u0633\u0627\u0646"
    },
    {
      chapter: 55,
      word: "\u0645\u062F\u0647\u0627\u0645\u062A\u0627\u0646",
      zh: "\u6DF1\u7EFF\u7684\uFF08\u4E24\u56ED\uFF09",
      en: "dark green",
      ar: "\u0634\u062F\u064A\u062F\u062A\u0627 \u0627\u0644\u062E\u0636\u0631\u0629"
    },
    {
      chapter: 55,
      word: "\u0646\u0636\u0627\u062E\u062A\u0627\u0646",
      zh: "\u55B7\u6D8C\u7684\uFF08\u4E24\u6CC9\uFF09",
      en: "gushing",
      ar: "\u0641\u0648\u0651\u0627\u0631\u062A\u0627\u0646"
    },
    {
      chapter: 55,
      word: "\u0648\u0646\u062E\u0644",
      zh: "\u4E0E\u6930\u67A3",
      en: "and palm trees",
      ar: "\u0648\u0646\u062E\u0644"
    },
    {
      chapter: 55,
      word: "\u0648\u0631\u0645\u0627\u0646",
      zh: "\u4E0E\u77F3\u69B4",
      en: "and pomegranates",
      ar: "\u0648\u0631\u0645\u0627\u0646"
    },
    {
      chapter: 55,
      word: "\u062E\u064A\u0631\u0627\u062A",
      zh: "\u5584\u826F\u7684",
      en: "good ones",
      ar: "\u0641\u0627\u0636\u0644\u0627\u062A"
    },
    {
      chapter: 55,
      word: "\u062D\u0633\u0627\u0646",
      zh: "\u7F8E\u4E3D\u7684",
      en: "beautiful",
      ar: "\u062C\u0645\u064A\u0644\u0627\u062A"
    },
    {
      chapter: 55,
      word: "\u0627\u0644\u062E\u064A\u0627\u0645",
      zh: "\u5E10\u7BF7",
      en: "pavilions",
      ar: "\u0627\u0644\u062E\u064A\u0627\u0645"
    },
    {
      chapter: 55,
      word: "\u0631\u0641\u0631\u0641",
      zh: "\u7EFF\u57AB",
      en: "green cushions",
      ar: "\u0648\u0633\u0627\u0626\u062F"
    },
    {
      chapter: 55,
      word: "\u062E\u0636\u0631",
      zh: "\u7EFF\u8272\u7684",
      en: "green",
      ar: "\u062E\u0636\u0631\u0627\u0621"
    },
    {
      chapter: 55,
      word: "\u0648\u0639\u0628\u0642\u0631\u064A",
      zh: "\u4E0E\u7CBE\u7F8E\u5730\u6BEF",
      en: "and fine carpets",
      ar: "\u0648\u0628\u064F\u0633\u0637 \u0641\u0627\u062E\u0631\u0629"
    },
    {
      chapter: 55,
      word: "\u0627\u0633\u0645",
      zh: "\u540D\u5B57",
      en: "the name",
      ar: "\u0627\u0633\u0645"
    },
    {
      chapter: 12,
      word: "\u0627\u0644\u0631",
      zh: "\uFF08\u7AE0\u9996\u5B57\u6BCD\uFF09",
      en: "(disconnected letters)",
      ar: "\u062D\u0631\u0648\u0641 \u0645\u0642\u0637\u0639\u0629"
    },
    {
      chapter: 12,
      word: "\u0627\u064A\u0627\u062A",
      zh: "\u8FF9\u8C61\u3001\u7ECF\u6587",
      en: "verses, signs",
      ar: "\u0622\u064A\u0627\u062A"
    },
    {
      chapter: 12,
      word: "\u0627\u0644\u0643\u062A\u0627\u0628",
      zh: "\u7ECF\u5178",
      en: "the Book",
      ar: "\u0627\u0644\u0643\u062A\u0627\u0628"
    },
    {
      chapter: 12,
      word: "\u0627\u0644\u0645\u0628\u064A\u0646",
      zh: "\u660E\u767D\u7684",
      en: "the clear",
      ar: "\u0627\u0644\u0648\u0627\u0636\u062D"
    },
    {
      chapter: 12,
      word: "\u0627\u0646\u0632\u0644\u0646\u0627\u0647",
      zh: "\u6211\u4EEC\u964D\u793A\u5B83",
      en: "We sent it down",
      ar: "\u0623\u0646\u0632\u0644\u0646\u0627\u0647"
    },
    {
      chapter: 12,
      word: "\u0642\u0631\u0627\u0646\u0627",
      zh: "\u53E4\u5170\uFF08\u8BF5\u8BFB\u7684\uFF09",
      en: "a Quran (recitation)",
      ar: "\u0642\u0631\u0622\u0646\u064B\u0627"
    },
    {
      chapter: 12,
      word: "\u0639\u0631\u0628\u064A\u0627",
      zh: "\u963F\u62C9\u4F2F\u8BED\u7684",
      en: "Arabic",
      ar: "\u0628\u0644\u063A\u0629 \u0627\u0644\u0639\u0631\u0628"
    },
    {
      chapter: 12,
      word: "\u062A\u0639\u0642\u0644\u0648\u0646",
      zh: "\u4F60\u4EEC\u7406\u89E3",
      en: "you understand",
      ar: "\u062A\u0641\u0647\u0645\u0648\u0646"
    },
    {
      chapter: 12,
      word: "\u0646\u0642\u0635",
      zh: "\u6211\u4EEC\u8BB2\u8FF0",
      en: "We relate",
      ar: "\u0646\u062D\u0643\u064A"
    },
    {
      chapter: 12,
      word: "\u0627\u0644\u0642\u0635\u0635",
      zh: "\u6545\u4E8B",
      en: "stories",
      ar: "\u0627\u0644\u0623\u062E\u0628\u0627\u0631"
    },
    {
      chapter: 12,
      word: "\u064A\u0648\u0633\u0641",
      zh: "\u4F18\u7D20\u798F",
      en: "Yusuf (Joseph)",
      ar: "\u064A\u0648\u0633\u0641 \u0639\u0644\u064A\u0647 \u0627\u0644\u0633\u0644\u0627\u0645"
    },
    {
      chapter: 12,
      word: "\u0644\u0627\u0628\u064A\u0647",
      zh: "\u5BF9\u4ED6\u7684\u7236\u4EB2",
      en: "to his father",
      ar: "\u0644\u0623\u0628\u064A\u0647"
    },
    {
      chapter: 12,
      word: "\u064A\u0627\u0627\u0628\u062A",
      zh: "\u6211\u7684\u7236\u4EB2\u554A",
      en: "O my father",
      ar: "\u064A\u0627 \u0623\u0628\u064A"
    },
    {
      chapter: 12,
      word: "\u0631\u0627\u064A\u062A",
      zh: "\u6211\u770B\u89C1\uFF08\u68A6\u89C1\uFF09",
      en: "I saw (in a dream)",
      ar: "\u0631\u0623\u064A\u062A \u0641\u064A \u0627\u0644\u0645\u0646\u0627\u0645"
    },
    {
      chapter: 12,
      word: "\u0643\u0648\u0643\u0628\u0627",
      zh: "\u661F",
      en: "stars",
      ar: "\u0646\u062C\u0645\u064B\u0627"
    },
    {
      chapter: 12,
      word: "\u0648\u0627\u0644\u0634\u0645\u0633",
      zh: "\u4E0E\u592A\u9633",
      en: "and the sun",
      ar: "\u0648\u0627\u0644\u0634\u0645\u0633"
    },
    {
      chapter: 12,
      word: "\u0633\u0627\u062C\u062F\u064A\u0646",
      zh: "\u53E9\u5934\u7684",
      en: "prostrating",
      ar: "\u062E\u0627\u0636\u0639\u064A\u0646"
    },
    {
      chapter: 12,
      word: "\u064A\u0627\u0628\u0646\u064A",
      zh: "\u6211\u7684\u5B69\u5B50\u554A",
      en: "O my son",
      ar: "\u064A\u0627 \u0627\u0628\u0646\u064A"
    },
    {
      chapter: 12,
      word: "\u0631\u0621\u064A\u0627\u0643",
      zh: "\u4F60\u7684\u68A6",
      en: "your vision",
      ar: "\u0645\u0627 \u0631\u0623\u064A\u062A\u0647 \u0641\u064A \u0646\u0648\u0645\u0643"
    },
    {
      chapter: 12,
      word: "\u0627\u062E\u0648\u062A\u0643",
      zh: "\u4F60\u7684\u5144\u5F1F\u4EEC",
      en: "your brothers",
      ar: "\u0625\u062E\u0648\u062A\u0643"
    },
    {
      chapter: 12,
      word: "\u0643\u064A\u062F\u0627",
      zh: "\u8BA1\u8C0B",
      en: "a plot",
      ar: "\u0645\u0643\u0631\u064B\u0627"
    },
    {
      chapter: 12,
      word: "\u0627\u0644\u0634\u064A\u0637\u0627\u0646",
      zh: "\u6076\u9B54",
      en: "Satan",
      ar: "\u0627\u0644\u0634\u064A\u0637\u0627\u0646"
    },
    {
      chapter: 12,
      word: "\u0639\u062F\u0648",
      zh: "\u654C\u4EBA",
      en: "an enemy",
      ar: "\u0639\u062F\u0648"
    },
    {
      chapter: 12,
      word: "\u064A\u062C\u062A\u0628\u064A\u0643",
      zh: "\u4ED6\u9009\u62D4\u4F60",
      en: "He will choose you",
      ar: "\u064A\u0635\u0637\u0641\u064A\u0643"
    },
    {
      chapter: 12,
      word: "\u062A\u0627\u0648\u064A\u0644",
      zh: "\u89E3\u91CA",
      en: "interpretation",
      ar: "\u062A\u0641\u0633\u064A\u0631"
    },
    {
      chapter: 12,
      word: "\u0627\u0644\u0627\u062D\u0627\u062F\u064A\u062B",
      zh: "\u68A6\u5146\u3001\u8A00\u8C08",
      en: "narrations (dreams)",
      ar: "\u0627\u0644\u0631\u0624\u0649"
    },
    {
      chapter: 12,
      word: "\u0648\u0627\u062E\u0648\u062A\u0647",
      zh: "\u4E0E\u4ED6\u7684\u5144\u5F1F\u4EEC",
      en: "and his brothers",
      ar: "\u0648\u0625\u062E\u0648\u062A\u0647"
    },
    {
      chapter: 12,
      word: "\u0644\u0644\u0633\u0627\u0621\u0644\u064A\u0646",
      zh: "\u5BF9\u8BE2\u95EE\u8005",
      en: "for those who ask",
      ar: "\u0644\u0644\u0645\u0633\u062A\u0641\u0633\u0631\u064A\u0646"
    },
    {
      chapter: 12,
      word: "\u0639\u0635\u0628\u0629",
      zh: "\u4E00\u4F19\uFF08\u5F3A\u58EE\u7684\u4EBA\uFF09",
      en: "a strong group",
      ar: "\u062C\u0645\u0627\u0639\u0629 \u0642\u0648\u064A\u0629"
    },
    {
      chapter: 12,
      word: "\u0627\u0642\u062A\u0644\u0648\u0627",
      zh: "\u4F60\u4EEC\u6740",
      en: "kill",
      ar: "\u0627\u0642\u062A\u0644\u0648\u0627"
    },
    {
      chapter: 12,
      word: "\u0627\u0637\u0631\u062D\u0648\u0647",
      zh: "\u628A\u4ED6\u6254\u5230",
      en: "cast him out",
      ar: "\u0623\u0644\u0642\u0648\u0647"
    },
    {
      chapter: 12,
      word: "\u0627\u0631\u0636\u0627",
      zh: "\u4E00\u7247\u571F\u5730",
      en: "a land",
      ar: "\u0623\u0631\u0636\u064B\u0627"
    },
    {
      chapter: 12,
      word: "\u0627\u0644\u062C\u0628",
      zh: "\u4E95",
      en: "the well",
      ar: "\u0627\u0644\u0628\u0626\u0631"
    },
    {
      chapter: 12,
      word: "\u0627\u0644\u0633\u064A\u0627\u0631\u0629",
      zh: "\u5546\u961F\u3001\u65C5\u5BA2",
      en: "travellers",
      ar: "\u0627\u0644\u0642\u0627\u0641\u0644\u0629"
    },
    {
      chapter: 12,
      word: "\u0644\u0646\u0627\u0635\u062D\u0648\u0646",
      zh: "\u5FE0\u544A\u8005",
      en: "sincere advisers",
      ar: "\u0645\u062E\u0644\u0635\u0648\u0646 \u0641\u064A \u0627\u0644\u0646\u0635\u062D"
    },
    {
      chapter: 12,
      word: "\u0627\u0644\u0630\u0621\u0628",
      zh: "\u72FC",
      en: "the wolf",
      ar: "\u0627\u0644\u0630\u0626\u0628"
    },
    {
      chapter: 12,
      word: "\u0642\u0645\u064A\u0635\u0647",
      zh: "\u4ED6\u7684\u886C\u8863",
      en: "his shirt",
      ar: "\u0642\u0645\u064A\u0635\u0647"
    },
    {
      chapter: 12,
      word: "\u0628\u062F\u0645",
      zh: "\u5E26\u7740\u8840",
      en: "with blood",
      ar: "\u0628\u062F\u0645"
    },
    {
      chapter: 12,
      word: "\u0643\u0630\u0628",
      zh: "\u5047\u7684",
      en: "false",
      ar: "\u0645\u0632\u064A\u0651\u0641"
    },
    {
      chapter: 12,
      word: "\u0633\u0648\u0644\u062A",
      zh: "\u6002\u607F\u3001\u7F8E\u5316",
      en: "enticed",
      ar: "\u0632\u064A\u0651\u0646\u062A"
    },
    {
      chapter: 12,
      word: "\u0641\u0635\u0628\u0631",
      zh: "\u90A3\u4E48\uFF0C\u575A\u5FCD",
      en: "so patience",
      ar: "\u0641\u0635\u0628\u0631"
    },
    {
      chapter: 12,
      word: "\u062C\u0645\u064A\u0644",
      zh: "\u7F8E\u597D\u7684",
      en: "beautiful",
      ar: "\u062D\u0633\u0646"
    },
    {
      chapter: 12,
      word: "\u0627\u0644\u0645\u0633\u062A\u0639\u0627\u0646",
      zh: "\u88AB\u6C42\u52A9\u8005",
      en: "the One sought for help",
      ar: "\u0627\u0644\u0645\u0637\u0644\u0648\u0628 \u0639\u0648\u0646\u0647"
    },
    {
      chapter: 12,
      word: "\u0633\u064A\u0627\u0631\u0629",
      zh: "\u5546\u961F",
      en: "a caravan",
      ar: "\u0642\u0627\u0641\u0644\u0629"
    },
    {
      chapter: 12,
      word: "\u0648\u0627\u0631\u062F\u0647\u0645",
      zh: "\u4ED6\u4EEC\u7684\u53D6\u6C34\u4EBA",
      en: "their water-drawer",
      ar: "\u0627\u0644\u0633\u0627\u0642\u064A"
    },
    {
      chapter: 12,
      word: "\u062F\u0644\u0648\u0647",
      zh: "\u4ED6\u7684\u6C34\u6876",
      en: "his bucket",
      ar: "\u062F\u0644\u0648\u0647"
    },
    {
      chapter: 12,
      word: "\u063A\u0644\u0627\u0645",
      zh: "\u5C11\u5E74",
      en: "a boy",
      ar: "\u0635\u0628\u064A"
    },
    {
      chapter: 12,
      word: "\u0628\u0636\u0627\u0639\u0629",
      zh: "\u8D27\u7269",
      en: "merchandise",
      ar: "\u0633\u0644\u0639\u0629"
    },
    {
      chapter: 12,
      word: "\u0648\u0634\u0631\u0648\u0647",
      zh: "\u4ED6\u4EEC\u5356\u4E86\u4ED6",
      en: "they sold him",
      ar: "\u0628\u0627\u0639\u0648\u0647"
    },
    {
      chapter: 12,
      word: "\u0628\u062E\u0633",
      zh: "\u4F4E\u5EC9\u7684",
      en: "a low (price)",
      ar: "\u0646\u0627\u0642\u0635 \u0642\u0644\u064A\u0644"
    },
    {
      chapter: 12,
      word: "\u062F\u0631\u0627\u0647\u0645",
      zh: "\u94F6\u5E01",
      en: "dirhams",
      ar: "\u062F\u0631\u0627\u0647\u0645"
    },
    {
      chapter: 12,
      word: "\u0645\u0635\u0631",
      zh: "\u57C3\u53CA",
      en: "Egypt",
      ar: "\u0645\u0635\u0631"
    },
    {
      chapter: 12,
      word: "\u0644\u0627\u0645\u0631\u0627\u062A\u0647",
      zh: "\u5BF9\u4ED6\u7684\u59BB\u5B50",
      en: "to his wife",
      ar: "\u0644\u0632\u0648\u062C\u062A\u0647"
    },
    {
      chapter: 12,
      word: "\u0645\u062B\u0648\u064A\u0647",
      zh: "\u4ED6\u7684\u4F4F\u5904",
      en: "his residence",
      ar: "\u0645\u0642\u0627\u0645\u0647"
    },
    {
      chapter: 12,
      word: "\u0648\u0644\u062F\u0627",
      zh: "\u513F\u5B50",
      en: "a son",
      ar: "\u0627\u0628\u0646\u064B\u0627"
    },
    {
      chapter: 12,
      word: "\u0627\u0634\u062F\u0647",
      zh: "\u4ED6\u7684\u6210\u5E74",
      en: "his maturity",
      ar: "\u0643\u0645\u0627\u0644 \u0642\u0648\u062A\u0647"
    },
    {
      chapter: 12,
      word: "\u062D\u0643\u0645\u0627",
      zh: "\u667A\u6167\uFF08\u5224\u65AD\u529B\uFF09",
      en: "judgement",
      ar: "\u062D\u0643\u0645\u0629"
    },
    {
      chapter: 12,
      word: "\u0648\u0639\u0644\u0645\u0627",
      zh: "\u4E0E\u77E5\u8BC6",
      en: "and knowledge",
      ar: "\u0648\u0639\u0644\u0645\u064B\u0627"
    },
    {
      chapter: 12,
      word: "\u0627\u0644\u0645\u062D\u0633\u0646\u064A\u0646",
      zh: "\u884C\u5584\u8005",
      en: "the doers of good",
      ar: "\u0627\u0644\u0645\u062D\u0633\u0646\u064A\u0646"
    },
    {
      chapter: 12,
      word: "\u0648\u0631\u0627\u0648\u062F\u062A\u0647",
      zh: "\u5979\u5F15\u8BF1\u4ED6",
      en: "she sought to seduce him",
      ar: "\u0637\u0644\u0628\u062A \u0645\u0646\u0647"
    },
    {
      chapter: 12,
      word: "\u0648\u063A\u0644\u0642\u062A",
      zh: "\u5979\u9501\u4E0A",
      en: "she closed",
      ar: "\u0623\u063A\u0644\u0642\u062A"
    },
    {
      chapter: 12,
      word: "\u0627\u0644\u0627\u0628\u0648\u0627\u0628",
      zh: "\u95E8",
      en: "the doors",
      ar: "\u0627\u0644\u0623\u0628\u0648\u0627\u0628"
    },
    {
      chapter: 12,
      word: "\u0645\u0639\u0627\u0630",
      zh: "\u6C42\u5E87\u62A4",
      en: "refuge (with God)",
      ar: "\u0623\u0639\u0648\u0630"
    },
    {
      chapter: 12,
      word: "\u0631\u0628\u064A",
      zh: "\u6211\u7684\u4E3B",
      en: "my Lord",
      ar: "\u0631\u0628\u064A"
    },
    {
      chapter: 12,
      word: "\u0627\u0644\u0645\u062E\u0644\u0635\u064A\u0646",
      zh: "\u8654\u8BDA\u7684",
      en: "the chosen (sincere)",
      ar: "\u0627\u0644\u0645\u062E\u062A\u0627\u0631\u0648\u0646 \u0627\u0644\u0645\u062E\u0644\u0635\u0648\u0646"
    },
    {
      chapter: 12,
      word: "\u0627\u0644\u0628\u0627\u0628",
      zh: "\u95E8",
      en: "the door",
      ar: "\u0627\u0644\u0628\u0627\u0628"
    },
    {
      chapter: 12,
      word: "\u0648\u0642\u062F\u062A",
      zh: "\u5979\u6495\u7834",
      en: "she tore",
      ar: "\u0634\u0642\u0651\u062A"
    },
    {
      chapter: 12,
      word: "\u062F\u0628\u0631",
      zh: "\u540E\u9762",
      en: "from behind",
      ar: "\u0645\u0646 \u0627\u0644\u062E\u0644\u0641"
    },
    {
      chapter: 12,
      word: "\u0642\u0628\u0644",
      zh: "\u524D\u9762",
      en: "from the front",
      ar: "\u0645\u0646 \u0627\u0644\u0623\u0645\u0627\u0645"
    },
    {
      chapter: 12,
      word: "\u0634\u0627\u0647\u062F",
      zh: "\u8BC1\u4EBA",
      en: "a witness",
      ar: "\u0634\u0627\u0647\u062F"
    },
    {
      chapter: 12,
      word: "\u0643\u064A\u062F\u0643\u0646",
      zh: "\u4F60\u4EEC\uFF08\u5973\u4EBA\uFF09\u7684\u8BA1\u8C0B",
      en: "your (women's) plot",
      ar: "\u0645\u0643\u0631\u0643\u0646"
    },
    {
      chapter: 12,
      word: "\u0627\u0644\u0645\u062F\u064A\u0646\u0629",
      zh: "\u57CE\u5E02",
      en: "the city",
      ar: "\u0627\u0644\u0645\u062F\u064A\u0646\u0629"
    },
    {
      chapter: 12,
      word: "\u0646\u0633\u0648\u0629",
      zh: "\u5987\u5973\u4EEC",
      en: "women",
      ar: "\u0646\u0633\u0627\u0621"
    },
    {
      chapter: 12,
      word: "\u0627\u0645\u0631\u0627\u062A",
      zh: "\u59BB\u5B50",
      en: "the wife of",
      ar: "\u0632\u0648\u062C\u0629"
    },
    {
      chapter: 12,
      word: "\u0627\u0644\u0639\u0632\u064A\u0632",
      zh: "\u6743\u8D35",
      en: "the Aziz (governor)",
      ar: "\u0627\u0644\u0639\u0632\u064A\u0632"
    },
    {
      chapter: 12,
      word: "\u0628\u0645\u0643\u0631\u0647\u0646",
      zh: "\u5979\u4EEC\u7684\u8BAE\u8BBA",
      en: "their scheming",
      ar: "\u0645\u0643\u0631\u0647\u0646\u0651"
    },
    {
      chapter: 12,
      word: "\u0645\u062A\u0643\u0627",
      zh: "\u5BB4\u5E2D",
      en: "a banquet",
      ar: "\u0645\u062C\u0644\u0633 \u0637\u0639\u0627\u0645"
    },
    {
      chapter: 12,
      word: "\u0633\u0643\u064A\u0646\u0627",
      zh: "\u4E00\u628A\u5200",
      en: "a knife",
      ar: "\u0633\u0643\u064A\u0646\u064B\u0627"
    },
    {
      chapter: 12,
      word: "\u0627\u0643\u0628\u0631\u0646\u0647",
      zh: "\u5979\u4EEC\u60CA\u53F9\u4ED6",
      en: "they were amazed at him",
      ar: "\u0623\u0639\u0638\u0645\u0646\u0647"
    },
    {
      chapter: 12,
      word: "\u0648\u0642\u0637\u0639\u0646",
      zh: "\u5979\u4EEC\u5272\u4F24",
      en: "and they cut",
      ar: "\u0648\u062C\u0631\u062D\u0646"
    },
    {
      chapter: 12,
      word: "\u0627\u064A\u062F\u064A\u0647\u0646",
      zh: "\u5979\u4EEC\u7684\u624B",
      en: "their hands",
      ar: "\u0623\u064A\u062F\u064A\u0647\u0646"
    },
    {
      chapter: 12,
      word: "\u0628\u0634\u0631\u0627",
      zh: "\u51E1\u4EBA",
      en: "a human being",
      ar: "\u0625\u0646\u0633\u0627\u0646\u064B\u0627"
    },
    {
      chapter: 12,
      word: "\u0643\u0631\u064A\u0645",
      zh: "\u5C0A\u8D35\u7684",
      en: "noble",
      ar: "\u0643\u0631\u064A\u0645"
    },
    {
      chapter: 12,
      word: "\u0627\u0644\u0633\u062C\u0646",
      zh: "\u76D1\u72F1",
      en: "prison",
      ar: "\u0627\u0644\u0633\u062C\u0646"
    },
    {
      chapter: 12,
      word: "\u064A\u062F\u0639\u0648\u0646\u0646\u064A",
      zh: "\u5979\u4EEC\u53EB\u6211",
      en: "they call me",
      ar: "\u064A\u0637\u0644\u0628\u0646 \u0645\u0646\u064A"
    },
    {
      chapter: 12,
      word: "\u0627\u0644\u062C\u0627\u0647\u0644\u064A\u0646",
      zh: "\u65E0\u77E5\u8005",
      en: "the ignorant",
      ar: "\u0627\u0644\u062C\u0627\u0647\u0644\u064A\u0646"
    },
    {
      chapter: 12,
      word: "\u0627\u0644\u0633\u0645\u064A\u0639",
      zh: "\u5168\u806A\u7684",
      en: "the All-Hearing",
      ar: "\u0627\u0644\u0633\u0645\u064A\u0639"
    },
    {
      chapter: 12,
      word: "\u0627\u0644\u0639\u0644\u064A\u0645",
      zh: "\u5168\u77E5\u7684",
      en: "the All-Knowing",
      ar: "\u0627\u0644\u0639\u0644\u064A\u0645"
    },
    {
      chapter: 12,
      word: "\u0641\u062A\u064A\u0627\u0646",
      zh: "\u4E24\u4E2A\u9752\u5E74",
      en: "two young men",
      ar: "\u0634\u0627\u0628\u0627\u0646"
    },
    {
      chapter: 12,
      word: "\u0627\u0639\u0635\u0631",
      zh: "\u6211\u69A8",
      en: "I press",
      ar: "\u0623\u0639\u0635\u0631"
    },
    {
      chapter: 12,
      word: "\u062E\u0645\u0631\u0627",
      zh: "\u9152\uFF08\u8461\u8404\uFF09",
      en: "wine (grapes)",
      ar: "\u0639\u0646\u0628\u064B\u0627"
    },
    {
      chapter: 12,
      word: "\u0631\u0627\u0633\u064A",
      zh: "\u6211\u7684\u5934",
      en: "my head",
      ar: "\u0631\u0623\u0633\u064A"
    },
    {
      chapter: 12,
      word: "\u062E\u0628\u0632\u0627",
      zh: "\u9762\u5305",
      en: "bread",
      ar: "\u062E\u0628\u0632\u064B\u0627"
    },
    {
      chapter: 12,
      word: "\u0627\u0644\u0637\u064A\u0631",
      zh: "\u9E1F",
      en: "birds",
      ar: "\u0627\u0644\u0637\u064A\u0648\u0631"
    },
    {
      chapter: 12,
      word: "\u0628\u062A\u0627\u0648\u064A\u0644\u0647",
      zh: "\u5B83\u7684\u89E3\u91CA",
      en: "its interpretation",
      ar: "\u0628\u062A\u0641\u0633\u064A\u0631\u0647"
    },
    {
      chapter: 12,
      word: "\u0645\u0644\u0629",
      zh: "\u5B97\u6559\u3001\u9053",
      en: "the religion",
      ar: "\u0627\u0644\u062F\u064A\u0646"
    },
    {
      chapter: 12,
      word: "\u0627\u0628\u0627\u0621\u064A",
      zh: "\u6211\u7684\u7956\u5148",
      en: "my fathers",
      ar: "\u0622\u0628\u0627\u0626\u064A"
    },
    {
      chapter: 12,
      word: "\u0627\u0628\u0631\u0627\u0647\u064A\u0645",
      zh: "\u6613\u535C\u62C9\u6B23",
      en: "Ibrahim (Abraham)",
      ar: "\u0625\u0628\u0631\u0627\u0647\u064A\u0645 \u0639\u0644\u064A\u0647 \u0627\u0644\u0633\u0644\u0627\u0645"
    },
    {
      chapter: 12,
      word: "\u0648\u0627\u0633\u062D\u0627\u0642",
      zh: "\u4E0E\u4F0A\u65AF\u54C8\u683C",
      en: "and Ishaq (Isaac)",
      ar: "\u0648\u0625\u0633\u062D\u0627\u0642 \u0639\u0644\u064A\u0647 \u0627\u0644\u0633\u0644\u0627\u0645"
    },
    {
      chapter: 12,
      word: "\u0648\u064A\u0639\u0642\u0648\u0628",
      zh: "\u4E0E\u53F6\u5C14\u5B64\u767D",
      en: "and Yaqub (Jacob)",
      ar: "\u0648\u064A\u0639\u0642\u0648\u0628 \u0639\u0644\u064A\u0647 \u0627\u0644\u0633\u0644\u0627\u0645"
    },
    {
      chapter: 12,
      word: "\u064A\u0627\u0635\u0627\u062D\u0628\u064A",
      zh: "\u6211\u7684\u4E24\u4F4D\u72F1\u53CB\u554A",
      en: "O my two companions",
      ar: "\u064A\u0627 \u0635\u0627\u062D\u0628\u064A\u0651"
    },
    {
      chapter: 12,
      word: "\u0627\u0631\u0628\u0627\u0628",
      zh: "\u4F17\u4E3B\u5BB0",
      en: "lords",
      ar: "\u0622\u0644\u0647\u0629"
    },
    {
      chapter: 12,
      word: "\u0645\u062A\u0641\u0631\u0642\u0648\u0646",
      zh: "\u5404\u4E0D\u76F8\u540C\u7684",
      en: "separate (many)",
      ar: "\u0645\u062A\u0639\u062F\u062F\u0648\u0646"
    },
    {
      chapter: 12,
      word: "\u0627\u0644\u0642\u0647\u0627\u0631",
      zh: "\u81F3\u5F3A\u7684",
      en: "the Prevailing",
      ar: "\u0627\u0644\u063A\u0627\u0644\u0628"
    },
    {
      chapter: 12,
      word: "\u0627\u0644\u062D\u0643\u0645",
      zh: "\u5224\u51B3",
      en: "the judgement",
      ar: "\u0627\u0644\u062D\u0643\u0645"
    },
    {
      chapter: 12,
      word: "\u0627\u0644\u0642\u064A\u0645",
      zh: "\u7AEF\u6B63\u7684",
      en: "the upright",
      ar: "\u0627\u0644\u0645\u0633\u062A\u0642\u064A\u0645"
    },
    {
      chapter: 12,
      word: "\u0641\u064A\u0633\u0642\u064A",
      zh: "\u4ED6\u5C06\u659F",
      en: "he will serve",
      ar: "\u064A\u0633\u0642\u064A"
    },
    {
      chapter: 12,
      word: "\u0641\u064A\u0635\u0644\u0628",
      zh: "\u4ED6\u5C06\u88AB\u9489\u6B7B",
      en: "he will be crucified",
      ar: "\u064A\u064F\u0635\u0644\u0628"
    },
    {
      chapter: 12,
      word: "\u0627\u0644\u0645\u0644\u0643",
      zh: "\u56FD\u738B",
      en: "the king",
      ar: "\u0627\u0644\u0645\u0644\u0643"
    },
    {
      chapter: 12,
      word: "\u0628\u0636\u0639",
      zh: "\u51E0\uFF08\u5E74\uFF09",
      en: "several",
      ar: "\u0645\u0627 \u0628\u064A\u0646 \u0627\u0644\u062B\u0644\u0627\u062B \u0648\u0627\u0644\u062A\u0633\u0639"
    },
    {
      chapter: 12,
      word: "\u0633\u0646\u064A\u0646",
      zh: "\u5E74",
      en: "years",
      ar: "\u0633\u0646\u0648\u0627\u062A"
    },
    {
      chapter: 12,
      word: "\u0628\u0642\u0631\u0627\u062A",
      zh: "\u6BCD\u725B",
      en: "cows",
      ar: "\u0628\u0642\u0631\u0627\u062A"
    },
    {
      chapter: 12,
      word: "\u0633\u0645\u0627\u0646",
      zh: "\u80A5\u7684",
      en: "fat",
      ar: "\u0633\u0645\u064A\u0646\u0629"
    },
    {
      chapter: 12,
      word: "\u0639\u062C\u0627\u0641",
      zh: "\u7626\u7684",
      en: "lean",
      ar: "\u0647\u0632\u064A\u0644\u0629"
    },
    {
      chapter: 12,
      word: "\u0633\u0646\u0628\u0644\u0627\u062A",
      zh: "\u7A57",
      en: "ears of grain",
      ar: "\u0633\u0646\u0627\u0628\u0644"
    },
    {
      chapter: 12,
      word: "\u064A\u0627\u0628\u0633\u0627\u062A",
      zh: "\u5E72\u67AF\u7684",
      en: "dry",
      ar: "\u062C\u0627\u0641\u0629"
    },
    {
      chapter: 12,
      word: "\u0627\u0636\u063A\u0627\u062B",
      zh: "\u6DF7\u4E71\u7684",
      en: "confused (dreams)",
      ar: "\u0623\u062E\u0644\u0627\u0637"
    },
    {
      chapter: 12,
      word: "\u0627\u062D\u0644\u0627\u0645",
      zh: "\u68A6",
      en: "dreams",
      ar: "\u0623\u062D\u0644\u0627\u0645"
    },
    {
      chapter: 12,
      word: "\u0627\u0644\u0635\u062F\u064A\u0642",
      zh: "\u8BDA\u5B9E\u8005",
      en: "the truthful one",
      ar: "\u0643\u062B\u064A\u0631 \u0627\u0644\u0635\u062F\u0642"
    },
    {
      chapter: 12,
      word: "\u062A\u0632\u0631\u0639\u0648\u0646",
      zh: "\u4F60\u4EEC\u8015\u79CD",
      en: "you will sow",
      ar: "\u062A\u0632\u0631\u0639\u0648\u0646"
    },
    {
      chapter: 12,
      word: "\u062F\u0627\u0628\u0627",
      zh: "\u5982\u5E38\u3001\u8FDE\u7EED",
      en: "as usual",
      ar: "\u0643\u0639\u0627\u062F\u062A\u0643\u0645"
    },
    {
      chapter: 12,
      word: "\u062D\u0635\u062F\u062A\u0645",
      zh: "\u4F60\u4EEC\u6536\u5272",
      en: "you harvest",
      ar: "\u062D\u0635\u062F\u062A\u0645"
    },
    {
      chapter: 12,
      word: "\u0633\u0646\u0628\u0644\u0647",
      zh: "\u5B83\u7684\u7A57",
      en: "its ear",
      ar: "\u0633\u0646\u0628\u0644\u0647"
    },
    {
      chapter: 12,
      word: "\u0634\u062F\u0627\u062F",
      zh: "\u8270\u96BE\u7684",
      en: "hard",
      ar: "\u0634\u062F\u064A\u062F\u0629"
    },
    {
      chapter: 12,
      word: "\u064A\u063A\u0627\u062B",
      zh: "\u5F97\u96E8",
      en: "given rain",
      ar: "\u064A\u064F\u0645\u0637\u064E\u0631"
    },
    {
      chapter: 12,
      word: "\u064A\u0639\u0635\u0631\u0648\u0646",
      zh: "\u4ED6\u4EEC\u69A8\uFF08\u679C\u6C41\uFF09",
      en: "they press (juice)",
      ar: "\u064A\u0639\u0635\u0631\u0648\u0646"
    },
    {
      chapter: 12,
      word: "\u0627\u0621\u062A\u0648\u0646\u064A",
      zh: "\u628A\u4ED6\u5E26\u6765",
      en: "bring him to me",
      ar: "\u0623\u062D\u0636\u0631\u0648\u0647"
    },
    {
      chapter: 12,
      word: "\u0627\u0644\u0631\u0633\u0648\u0644",
      zh: "\u4F7F\u8005",
      en: "the messenger",
      ar: "\u0627\u0644\u0631\u0633\u0648\u0644"
    },
    {
      chapter: 12,
      word: "\u0628\u0627\u0644",
      zh: "\u60C5\u51B5",
      en: "the case",
      ar: "\u0627\u0644\u062D\u0627\u0644"
    },
    {
      chapter: 12,
      word: "\u062D\u0635\u062D\u0635",
      zh: "\u663E\u660E\u4E86",
      en: "has become evident",
      ar: "\u0638\u0647\u0631 \u0648\u062A\u0628\u064A\u0651\u0646"
    },
    {
      chapter: 12,
      word: "\u0627\u0644\u062D\u0642",
      zh: "\u771F\u76F8",
      en: "the truth",
      ar: "\u0627\u0644\u062D\u0642"
    },
    {
      chapter: 12,
      word: "\u0646\u0641\u0633\u064A",
      zh: "\u6211\u81EA\u5DF1",
      en: "myself",
      ar: "\u0646\u0641\u0633\u064A"
    },
    {
      chapter: 12,
      word: "\u0644\u0627\u0645\u0627\u0631\u0629",
      zh: "\u786E\u662F\u6002\u607F",
      en: "inclined (to evil)",
      ar: "\u0643\u062B\u064A\u0631\u0629 \u0627\u0644\u0623\u0645\u0631"
    },
    {
      chapter: 12,
      word: "\u0628\u0627\u0644\u0633\u0648\u0621",
      zh: "\u4F5C\u6076",
      en: "to evil",
      ar: "\u0628\u0627\u0644\u0634\u0631"
    },
    {
      chapter: 12,
      word: "\u0627\u0633\u062A\u062E\u0644\u0635\u0647",
      zh: "\u6211\u4E13\u7528\u4ED6",
      en: "I will appoint him exclusively",
      ar: "\u0623\u062C\u0639\u0644\u0647 \u062E\u0627\u0635\u064B\u0627 \u0644\u064A"
    },
    {
      chapter: 12,
      word: "\u0645\u0643\u064A\u0646",
      zh: "\u6709\u5730\u4F4D\u7684",
      en: "established",
      ar: "\u0630\u0648 \u0645\u0643\u0627\u0646\u0629"
    },
    {
      chapter: 12,
      word: "\u0627\u0645\u064A\u0646",
      zh: "\u53EF\u4FE1\u4EFB\u7684",
      en: "trusted",
      ar: "\u0645\u0623\u0645\u0648\u0646"
    },
    {
      chapter: 12,
      word: "\u062E\u0632\u0627\u0621\u0646",
      zh: "\u4ED3\u5E93",
      en: "the storehouses",
      ar: "\u0627\u0644\u0645\u062E\u0627\u0632\u0646"
    },
    {
      chapter: 12,
      word: "\u0627\u0644\u0627\u0631\u0636",
      zh: "\u5927\u5730",
      en: "the land",
      ar: "\u0627\u0644\u0623\u0631\u0636"
    },
    {
      chapter: 12,
      word: "\u062D\u0641\u064A\u0638",
      zh: "\u5584\u4E8E\u4FDD\u7BA1\u7684",
      en: "a guardian",
      ar: "\u062D\u0627\u0641\u0638"
    },
    {
      chapter: 12,
      word: "\u0645\u0643\u0646\u0627",
      zh: "\u6211\u4EEC\u4F7F\u2026\u2026\u6709\u5730\u4F4D",
      en: "We established",
      ar: "\u0645\u0643\u0651\u0646\u0651\u0627"
    },
    {
      chapter: 12,
      word: "\u0628\u0627\u0644\u0627\u062E\u0631\u0629",
      zh: "\u540E\u4E16",
      en: "the Hereafter",
      ar: "\u0627\u0644\u0622\u062E\u0631\u0629"
    },
    {
      chapter: 12,
      word: "\u0627\u062E\u0648\u0629",
      zh: "\u5144\u5F1F\u4EEC",
      en: "brothers",
      ar: "\u0625\u062E\u0648\u0629"
    },
    {
      chapter: 12,
      word: "\u0641\u0639\u0631\u0641\u0647\u0645",
      zh: "\u4ED6\u8BA4\u51FA\u4ED6\u4EEC",
      en: "he recognised them",
      ar: "\u0639\u0631\u0641\u0647\u0645"
    },
    {
      chapter: 12,
      word: "\u0645\u0646\u0643\u0631\u0648\u0646",
      zh: "\u4E0D\u8BA4\u8BC6\u7684",
      en: "not recognising",
      ar: "\u0644\u0627 \u064A\u0639\u0631\u0641\u0648\u0646\u0647"
    },
    {
      chapter: 12,
      word: "\u0628\u062C\u0647\u0627\u0632\u0647\u0645",
      zh: "\u4ED6\u4EEC\u7684\u7CAE\u98DF",
      en: "their supplies",
      ar: "\u0628\u0645\u062A\u0627\u0639\u0647\u0645"
    },
    {
      chapter: 12,
      word: "\u0628\u0627\u062E",
      zh: "\u4E00\u4E2A\u5144\u5F1F",
      en: "a brother",
      ar: "\u0628\u0623\u062E"
    },
    {
      chapter: 12,
      word: "\u0627\u0644\u0643\u064A\u0644",
      zh: "\u91CF\u5668\u3001\u7CAE\u98DF",
      en: "the measure",
      ar: "\u0627\u0644\u0645\u0643\u064A\u0627\u0644"
    },
    {
      chapter: 12,
      word: "\u0627\u0644\u0645\u0646\u0632\u0644\u064A\u0646",
      zh: "\u6B3E\u5F85\u8005",
      en: "hosts",
      ar: "\u0627\u0644\u0645\u0636\u064A\u0641\u064A\u0646"
    },
    {
      chapter: 12,
      word: "\u0628\u0636\u0627\u0639\u062A\u0647\u0645",
      zh: "\u4ED6\u4EEC\u7684\u8D27\u7269\uFF08\u94F6\u94B1\uFF09",
      en: "their merchandise",
      ar: "\u062B\u0645\u0646 \u0628\u0636\u0627\u0639\u062A\u0647\u0645"
    },
    {
      chapter: 12,
      word: "\u0631\u062D\u0627\u0644\u0647\u0645",
      zh: "\u4ED6\u4EEC\u7684\u884C\u56CA",
      en: "their saddlebags",
      ar: "\u0623\u0645\u062A\u0639\u062A\u0647\u0645"
    },
    {
      chapter: 12,
      word: "\u0645\u0648\u062B\u0642\u0627",
      zh: "\u8A93\u7EA6",
      en: "a solemn pledge",
      ar: "\u0639\u0647\u062F\u064B\u0627 \u0645\u0624\u0643\u062F\u064B\u0627"
    },
    {
      chapter: 12,
      word: "\u0648\u0643\u064A\u0644",
      zh: "\u76D1\u62A4\u8005\u3001\u89C1\u8BC1",
      en: "a guardian (witness)",
      ar: "\u0634\u0627\u0647\u062F \u0648\u062D\u0627\u0641\u0638"
    },
    {
      chapter: 12,
      word: "\u0628\u0627\u0628",
      zh: "\u95E8",
      en: "gate",
      ar: "\u0628\u0627\u0628"
    },
    {
      chapter: 12,
      word: "\u0627\u0628\u0648\u0627\u0628",
      zh: "\u5404\u95E8",
      en: "gates",
      ar: "\u0623\u0628\u0648\u0627\u0628"
    },
    {
      chapter: 12,
      word: "\u0627\u0644\u0639\u064A\u0631",
      zh: "\u5546\u961F",
      en: "the caravan",
      ar: "\u0627\u0644\u0642\u0627\u0641\u0644\u0629"
    },
    {
      chapter: 12,
      word: "\u0644\u0633\u0627\u0631\u0642\u0648\u0646",
      zh: "\u786E\u662F\u5C0F\u5077",
      en: "are thieves",
      ar: "\u0633\u0627\u0631\u0642\u0648\u0646"
    },
    {
      chapter: 12,
      word: "\u0635\u0648\u0627\u0639",
      zh: "\u91CF\u676F",
      en: "the cup",
      ar: "\u0635\u0648\u0627\u0639"
    },
    {
      chapter: 12,
      word: "\u0628\u0639\u064A\u0631",
      zh: "\u9A86\u9A7C",
      en: "a camel",
      ar: "\u0628\u0639\u064A\u0631"
    },
    {
      chapter: 12,
      word: "\u0632\u0639\u064A\u0645",
      zh: "\u62C5\u4FDD\u4EBA",
      en: "a guarantor",
      ar: "\u0636\u0627\u0645\u0646"
    },
    {
      chapter: 12,
      word: "\u0627\u0644\u0638\u0627\u0644\u0645\u064A\u0646",
      zh: "\u4E0D\u4E49\u7684\u4EBA",
      en: "the wrongdoers",
      ar: "\u0627\u0644\u0638\u0627\u0644\u0645\u064A\u0646"
    },
    {
      chapter: 12,
      word: "\u0634\u064A\u062E\u0627",
      zh: "\u8001\u4EBA",
      en: "an old man",
      ar: "\u0631\u062C\u0644\u064B\u0627 \u0643\u0628\u064A\u0631\u064B\u0627"
    },
    {
      chapter: 12,
      word: "\u0643\u0628\u064A\u0631\u0627",
      zh: "\u5E74\u8001\u7684",
      en: "aged",
      ar: "\u0643\u0628\u064A\u0631 \u0627\u0644\u0633\u0646"
    },
    {
      chapter: 12,
      word: "\u0646\u062C\u064A\u0627",
      zh: "\u5BC6\u8C08",
      en: "in private consultation",
      ar: "\u0645\u062A\u0646\u0627\u062C\u064A\u0646"
    },
    {
      chapter: 12,
      word: "\u064A\u0627\u0627\u0628\u0627\u0646\u0627",
      zh: "\u6211\u4EEC\u7684\u7236\u4EB2\u554A",
      en: "O our father",
      ar: "\u064A\u0627 \u0623\u0628\u0627\u0646\u0627"
    },
    {
      chapter: 12,
      word: "\u0633\u0631\u0642",
      zh: "\u5077",
      en: "stole",
      ar: "\u0633\u0631\u0642"
    },
    {
      chapter: 12,
      word: "\u0627\u0644\u063A\u064A\u0628",
      zh: "\u5E7D\u7384",
      en: "the unseen",
      ar: "\u0627\u0644\u063A\u064A\u0628"
    },
    {
      chapter: 12,
      word: "\u0627\u0644\u0642\u0631\u064A\u0629",
      zh: "\u57CE\u9547",
      en: "the town",
      ar: "\u0627\u0644\u0642\u0631\u064A\u0629"
    },
    {
      chapter: 12,
      word: "\u064A\u0627\u0627\u0633\u0641\u064A",
      zh: "\u6211\u591A\u4E48\u60B2\u4F24\u554A",
      en: "O my sorrow",
      ar: "\u064A\u0627 \u062D\u0632\u0646\u064A"
    },
    {
      chapter: 12,
      word: "\u0648\u0627\u0628\u064A\u0636\u062A",
      zh: "\u53D8\u767D",
      en: "became white",
      ar: "\u0627\u0628\u064A\u0636\u0651\u062A"
    },
    {
      chapter: 12,
      word: "\u0639\u064A\u0646\u0627\u0647",
      zh: "\u4ED6\u7684\u53CC\u773C",
      en: "his eyes",
      ar: "\u0639\u064A\u0646\u0627\u0647"
    },
    {
      chapter: 12,
      word: "\u0627\u0644\u062D\u0632\u0646",
      zh: "\u60B2\u4F24",
      en: "grief",
      ar: "\u0627\u0644\u062D\u0632\u0646"
    },
    {
      chapter: 12,
      word: "\u0643\u0638\u064A\u0645",
      zh: "\u6291\u5236\u7684",
      en: "suppressing",
      ar: "\u0643\u0627\u062A\u0645"
    },
    {
      chapter: 12,
      word: "\u062A\u0641\u062A\u0627",
      zh: "\u4F60\u4E0D\u505C\u6B62",
      en: "you will not cease",
      ar: "\u0644\u0627 \u062A\u0632\u0627\u0644"
    },
    {
      chapter: 12,
      word: "\u062D\u0631\u0636\u0627",
      zh: "\u6194\u60B4",
      en: "wasted away",
      ar: "\u0647\u0627\u0644\u0643\u064B\u0627"
    },
    {
      chapter: 12,
      word: "\u0627\u0644\u0647\u0627\u0644\u0643\u064A\u0646",
      zh: "\u6B7B\u53BB\u7684\u4EBA",
      en: "those who perish",
      ar: "\u0627\u0644\u0647\u0627\u0644\u0643\u064A\u0646"
    },
    {
      chapter: 12,
      word: "\u0627\u0634\u0643\u0648\u0627",
      zh: "\u6211\u8BC9\u8BF4",
      en: "I complain",
      ar: "\u0623\u0634\u0643\u0648"
    },
    {
      chapter: 12,
      word: "\u0628\u062B\u064A",
      zh: "\u6211\u7684\u5FE7\u6101",
      en: "my suffering",
      ar: "\u0647\u0645\u0651\u064A"
    },
    {
      chapter: 12,
      word: "\u0648\u062D\u0632\u0646\u064A",
      zh: "\u4E0E\u6211\u7684\u60B2\u4F24",
      en: "and my grief",
      ar: "\u0648\u062D\u0632\u0646\u064A"
    },
    {
      chapter: 12,
      word: "\u0641\u062A\u062D\u0633\u0633\u0648\u0627",
      zh: "\u4F60\u4EEC\u53BB\u6253\u63A2",
      en: "go and find out",
      ar: "\u0627\u0628\u062D\u062B\u0648\u0627"
    },
    {
      chapter: 12,
      word: "\u0631\u0648\u062D",
      zh: "\u6148\u6069\u3001\u5BBD\u6170",
      en: "the relief (mercy)",
      ar: "\u0627\u0644\u0641\u0631\u062C \u0648\u0627\u0644\u0631\u062D\u0645\u0629"
    },
    {
      chapter: 12,
      word: "\u062A\u0627\u064A\u0621\u0633\u0648\u0627",
      zh: "\u4F60\u4EEC\u7EDD\u671B",
      en: "despair",
      ar: "\u062A\u0642\u0646\u0637\u0648\u0627"
    },
    {
      chapter: 12,
      word: "\u0627\u0644\u0636\u0631",
      zh: "\u82E6\u96BE",
      en: "the hardship",
      ar: "\u0627\u0644\u0634\u062F\u0629"
    },
    {
      chapter: 12,
      word: "\u0645\u0632\u062C\u064A\u0629",
      zh: "\u4F4E\u52A3\u7684",
      en: "scant",
      ar: "\u0642\u0644\u064A\u0644\u0629 \u0631\u062F\u064A\u0626\u0629"
    },
    {
      chapter: 12,
      word: "\u0648\u062A\u0635\u062F\u0642",
      zh: "\u5E76\u65BD\u820D",
      en: "and be charitable",
      ar: "\u0648\u062A\u0641\u0636\u0651\u0644"
    },
    {
      chapter: 12,
      word: "\u0627\u0644\u0645\u062A\u0635\u062F\u0642\u064A\u0646",
      zh: "\u65BD\u820D\u8005",
      en: "the charitable",
      ar: "\u0627\u0644\u0645\u062A\u0635\u062F\u0642\u064A\u0646"
    },
    {
      chapter: 12,
      word: "\u062C\u0627\u0647\u0644\u0648\u0646",
      zh: "\u65E0\u77E5\u7684",
      en: "ignorant",
      ar: "\u062C\u0627\u0647\u0644\u0648\u0646"
    },
    {
      chapter: 12,
      word: "\u0627\u0646\u062A",
      zh: "\u4F60\u771F\u662F\u2026\u2026\u5417",
      en: "are you indeed",
      ar: "\u0623\u0623\u0646\u062A"
    },
    {
      chapter: 12,
      word: "\u0627\u062E\u064A",
      zh: "\u6211\u7684\u5F1F\u5F1F",
      en: "my brother",
      ar: "\u0623\u062E\u064A"
    },
    {
      chapter: 12,
      word: "\u064A\u062A\u0642",
      zh: "\u656C\u754F",
      en: "fears (God)",
      ar: "\u064A\u062A\u0651\u0642\u064A"
    },
    {
      chapter: 12,
      word: "\u0648\u064A\u0635\u0628\u0631",
      zh: "\u5E76\u575A\u5FCD",
      en: "and is patient",
      ar: "\u0648\u064A\u0635\u0628\u0631"
    },
    {
      chapter: 12,
      word: "\u0627\u062B\u0631\u0643",
      zh: "\u4ED6\u9009\u62D4\u4E86\u4F60",
      en: "He has preferred you",
      ar: "\u0641\u0636\u0651\u0644\u0643"
    },
    {
      chapter: 12,
      word: "\u062E\u0627\u0637\u0621\u064A\u0646",
      zh: "\u6709\u8FC7\u9519\u7684",
      en: "sinners",
      ar: "\u0645\u0630\u0646\u0628\u064A\u0646"
    },
    {
      chapter: 12,
      word: "\u062A\u062B\u0631\u064A\u0628",
      zh: "\u8D23\u5907",
      en: "blame",
      ar: "\u0644\u0648\u0645"
    },
    {
      chapter: 12,
      word: "\u0627\u0631\u062D\u0645",
      zh: "\u6700\u6148\u60AF\u7684",
      en: "the most merciful",
      ar: "\u0623\u0631\u062D\u0645"
    },
    {
      chapter: 12,
      word: "\u0627\u0644\u0631\u0627\u062D\u0645\u064A\u0646",
      zh: "\u6148\u60AF\u8005\u4EEC",
      en: "the merciful",
      ar: "\u0627\u0644\u0631\u0627\u062D\u0645\u064A\u0646"
    },
    {
      chapter: 12,
      word: "\u0628\u0642\u0645\u064A\u0635\u064A",
      zh: "\u6211\u7684\u886C\u8863",
      en: "my shirt",
      ar: "\u0628\u0642\u0645\u064A\u0635\u064A"
    },
    {
      chapter: 12,
      word: "\u0648\u062C\u0647",
      zh: "\u8138",
      en: "the face",
      ar: "\u0648\u062C\u0647"
    },
    {
      chapter: 12,
      word: "\u0627\u0628\u064A",
      zh: "\u6211\u7684\u7236\u4EB2",
      en: "my father",
      ar: "\u0623\u0628\u064A"
    },
    {
      chapter: 12,
      word: "\u0628\u0635\u064A\u0631\u0627",
      zh: "\u80FD\u770B\u89C1\u7684",
      en: "seeing",
      ar: "\u0645\u0628\u0635\u0631\u064B\u0627"
    },
    {
      chapter: 12,
      word: "\u0628\u0627\u0647\u0644\u0643\u0645",
      zh: "\u4F60\u4EEC\u7684\u5BB6\u4EBA",
      en: "your family",
      ar: "\u0628\u0623\u0647\u0644\u0643\u0645"
    },
    {
      chapter: 12,
      word: "\u0631\u064A\u062D",
      zh: "\u6C14\u606F",
      en: "the scent",
      ar: "\u0631\u0627\u0626\u062D\u0629"
    },
    {
      chapter: 12,
      word: "\u062A\u0641\u0646\u062F\u0648\u0646",
      zh: "\u4F60\u4EEC\u8BF4\u6211\u7CCA\u6D82",
      en: "you think me weak of mind",
      ar: "\u062A\u0646\u0633\u0628\u0648\u0646\u0646\u064A \u0625\u0644\u0649 \u0627\u0644\u062E\u0631\u0641"
    },
    {
      chapter: 12,
      word: "\u0627\u0644\u0628\u0634\u064A\u0631",
      zh: "\u62A5\u559C\u8005",
      en: "the bearer of good news",
      ar: "\u0627\u0644\u0645\u0628\u0634\u0651\u0631"
    },
    {
      chapter: 12,
      word: "\u0627\u0633\u062A\u063A\u0641\u0631",
      zh: "\u6C42\u9976\u6055",
      en: "ask forgiveness",
      ar: "\u0627\u0637\u0644\u0628 \u0627\u0644\u0645\u063A\u0641\u0631\u0629"
    },
    {
      chapter: 12,
      word: "\u0630\u0646\u0648\u0628\u0646\u0627",
      zh: "\u6211\u4EEC\u7684\u7F6A",
      en: "our sins",
      ar: "\u0630\u0646\u0648\u0628\u0646\u0627"
    },
    {
      chapter: 12,
      word: "\u0627\u0628\u0648\u064A\u0647",
      zh: "\u4ED6\u7684\u7236\u6BCD",
      en: "his parents",
      ar: "\u0623\u0628\u0648\u064A\u0647"
    },
    {
      chapter: 12,
      word: "\u0627\u0645\u0646\u064A\u0646",
      zh: "\u5E73\u5B89\u5730",
      en: "safe",
      ar: "\u0622\u0645\u0646\u064A\u0646"
    },
    {
      chapter: 12,
      word: "\u0627\u0644\u0639\u0631\u0634",
      zh: "\u5B9D\u5EA7",
      en: "the throne",
      ar: "\u0627\u0644\u0633\u0631\u064A\u0631"
    },
    {
      chapter: 12,
      word: "\u0633\u062C\u062F\u0627",
      zh: "\u53E9\u5934",
      en: "in prostration",
      ar: "\u0633\u0627\u062C\u062F\u064A\u0646"
    },
    {
      chapter: 12,
      word: "\u0627\u0644\u0628\u062F\u0648",
      zh: "\u6C99\u6F20",
      en: "the bedouin life (desert)",
      ar: "\u0627\u0644\u0628\u0627\u062F\u064A\u0629"
    },
    {
      chapter: 12,
      word: "\u0644\u0637\u064A\u0641",
      zh: "\u7CBE\u5FAE\u7684\u3001\u4EC1\u6148\u7684",
      en: "Subtle (Kind)",
      ar: "\u0631\u0641\u064A\u0642"
    },
    {
      chapter: 12,
      word: "\u0641\u0627\u0637\u0631",
      zh: "\u521B\u9020\u8005",
      en: "Creator",
      ar: "\u062E\u0627\u0644\u0642"
    },
    {
      chapter: 12,
      word: "\u0648\u0644\u064A",
      zh: "\u6211\u7684\u4FDD\u62A4\u8005",
      en: "my protector",
      ar: "\u0648\u0644\u064A\u0651\u064A"
    },
    {
      chapter: 12,
      word: "\u062A\u0648\u0641\u0646\u064A",
      zh: "\u8BA9\u6211\u5F52\u771F",
      en: "take me (in death)",
      ar: "\u0623\u0645\u062A\u0646\u064A"
    },
    {
      chapter: 12,
      word: "\u0645\u0633\u0644\u0645\u0627",
      zh: "\u5F52\u987A\u8005",
      en: "as a Muslim",
      ar: "\u0645\u0633\u0644\u0645\u064B\u0627"
    },
    {
      chapter: 12,
      word: "\u0628\u0627\u0644\u0635\u0627\u0644\u062D\u064A\u0646",
      zh: "\u4E0E\u5584\u4EBA\u4EEC",
      en: "with the righteous",
      ar: "\u0628\u0627\u0644\u0635\u0627\u0644\u062D\u064A\u0646"
    },
    {
      chapter: 12,
      word: "\u0627\u0646\u0628\u0627\u0621",
      zh: "\u6D88\u606F",
      en: "news",
      ar: "\u0623\u062E\u0628\u0627\u0631"
    },
    {
      chapter: 12,
      word: "\u0646\u0648\u062D\u064A\u0647",
      zh: "\u6211\u4EEC\u542F\u793A\u5B83",
      en: "We reveal it",
      ar: "\u0646\u0648\u062D\u064A\u0647"
    },
    {
      chapter: 12,
      word: "\u064A\u0645\u0643\u0631\u0648\u0646",
      zh: "\u4ED6\u4EEC\u5BC6\u8C0B",
      en: "they plotted",
      ar: "\u064A\u0643\u064A\u062F\u0648\u0646"
    },
    {
      chapter: 12,
      word: "\u062D\u0631\u0635\u062A",
      zh: "\u6E34\u671B\u7684",
      en: "eager",
      ar: "\u0634\u062F\u064A\u062F \u0627\u0644\u0631\u063A\u0628\u0629"
    },
    {
      chapter: 12,
      word: "\u0628\u0645\u0621\u0645\u0646\u064A\u0646",
      zh: "\u5F52\u4FE1\u7684",
      en: "believers",
      ar: "\u0645\u0624\u0645\u0646\u064A\u0646"
    },
    {
      chapter: 12,
      word: "\u0630\u0643\u0631",
      zh: "\u6559\u8BF2",
      en: "a reminder",
      ar: "\u0627\u0644\u062A\u0630\u0643\u064A\u0631"
    },
    {
      chapter: 12,
      word: "\u0644\u0644\u0639\u0627\u0644\u0645\u064A\u0646",
      zh: "\u5BF9\u4F17\u4E16\u754C",
      en: "for the worlds",
      ar: "\u0644\u0644\u0639\u0627\u0644\u0645\u064A\u0646"
    },
    {
      chapter: 12,
      word: "\u0627\u064A\u0629",
      zh: "\u8FF9\u8C61",
      en: "a sign",
      ar: "\u0622\u064A\u0629"
    },
    {
      chapter: 12,
      word: "\u0645\u0639\u0631\u0636\u0648\u0646",
      zh: "\u80CC\u5F03\u7684",
      en: "turning away",
      ar: "\u0645\u0646\u0635\u0631\u0641\u0648\u0646"
    },
    {
      chapter: 12,
      word: "\u0645\u0634\u0631\u0643\u0648\u0646",
      zh: "\u4EE5\u7269\u914D\u4E3B\u7684",
      en: "associating others (with God)",
      ar: "\u0645\u0634\u0631\u0643\u0648\u0646"
    },
    {
      chapter: 12,
      word: "\u063A\u0627\u0634\u064A\u0629",
      zh: "\u7B3C\u7F69\u7684\uFF08\u5211\u7F5A\uFF09",
      en: "an overwhelming (punishment)",
      ar: "\u0639\u0642\u0648\u0628\u0629 \u062A\u063A\u0634\u0627\u0647\u0645"
    },
    {
      chapter: 12,
      word: "\u0628\u063A\u062A\u0629",
      zh: "\u7A81\u7136",
      en: "suddenly",
      ar: "\u0641\u062C\u0623\u0629"
    },
    {
      chapter: 12,
      word: "\u0633\u0628\u064A\u0644\u064A",
      zh: "\u6211\u7684\u9053",
      en: "my way",
      ar: "\u0637\u0631\u064A\u0642\u064A"
    },
    {
      chapter: 12,
      word: "\u0628\u0635\u064A\u0631\u0629",
      zh: "\u660E\u8BC1",
      en: "insight",
      ar: "\u062D\u062C\u0629 \u0648\u0627\u0636\u062D\u0629"
    },
    {
      chapter: 12,
      word: "\u0631\u062C\u0627\u0644\u0627",
      zh: "\u7537\u4EBA\u4EEC",
      en: "men",
      ar: "\u0631\u062C\u0627\u0644\u064B\u0627"
    },
    {
      chapter: 12,
      word: "\u0627\u0644\u0642\u0631\u064A",
      zh: "\u57CE\u9547",
      en: "the towns",
      ar: "\u0627\u0644\u0642\u0631\u0649"
    },
    {
      chapter: 12,
      word: "\u0639\u0627\u0642\u0628\u0629",
      zh: "\u7ED3\u5C40",
      en: "the end",
      ar: "\u0627\u0644\u0646\u0647\u0627\u064A\u0629"
    },
    {
      chapter: 12,
      word: "\u0627\u0633\u062A\u064A\u0621\u0633",
      zh: "\u7EDD\u671B\u4E86",
      en: "despaired",
      ar: "\u064A\u0626\u0633"
    },
    {
      chapter: 12,
      word: "\u0646\u0635\u0631\u0646\u0627",
      zh: "\u6211\u4EEC\u7684\u63F4\u52A9",
      en: "Our help",
      ar: "\u0639\u0648\u0646\u0646\u0627"
    },
    {
      chapter: 12,
      word: "\u0628\u0627\u0633\u0646\u0627",
      zh: "\u6211\u4EEC\u7684\u60E9\u7F5A",
      en: "Our punishment",
      ar: "\u0639\u0630\u0627\u0628\u0646\u0627"
    },
    {
      chapter: 12,
      word: "\u0639\u0628\u0631\u0629",
      zh: "\u6559\u8BAD",
      en: "a lesson",
      ar: "\u0639\u0638\u0629"
    },
    {
      chapter: 12,
      word: "\u0627\u0644\u0627\u0644\u0628\u0627\u0628",
      zh: "\u7406\u667A",
      en: "understanding",
      ar: "\u0627\u0644\u0639\u0642\u0648\u0644"
    },
    {
      chapter: 12,
      word: "\u064A\u0641\u062A\u0631\u064A",
      zh: "\u88AB\u634F\u9020",
      en: "invented",
      ar: "\u064A\u064F\u062E\u062A\u0644\u0642"
    },
    {
      chapter: 12,
      word: "\u062A\u0635\u062F\u064A\u0642",
      zh: "\u8BC1\u5B9E",
      en: "a confirmation",
      ar: "\u062A\u0623\u0643\u064A\u062F"
    },
    {
      chapter: 12,
      word: "\u0648\u062A\u0641\u0635\u064A\u0644",
      zh: "\u4E0E\u8BE6\u89E3",
      en: "and a detailed explanation",
      ar: "\u0648\u0628\u064A\u0627\u0646"
    },
    {
      chapter: 12,
      word: "\u0648\u0647\u062F\u064A",
      zh: "\u4E0E\u5F15\u5BFC",
      en: "and guidance",
      ar: "\u0648\u0625\u0631\u0634\u0627\u062F"
    },
    {
      chapter: 12,
      word: "\u0648\u0631\u062D\u0645\u0629",
      zh: "\u4E0E\u6148\u6069",
      en: "and mercy",
      ar: "\u0648\u0631\u062D\u0645\u0629"
    },
    {
      chapter: 12,
      word: "\u064A\u0621\u0645\u0646\u0648\u0646",
      zh: "\u4ED6\u4EEC\u5F52\u4FE1",
      en: "they believe",
      ar: "\u064A\u0624\u0645\u0646\u0648\u0646"
    }
  ],
  themes: [
    {
      chapter: 1,
      title: [
        "\u8D5E\u9882\u3001\u5D07\u62DC\u4E0E\u7948\u6C42\u5F15\u5BFC",
        "Praise, worship and the plea for guidance",
        "\u0627\u0644\u062D\u0645\u062F \u0648\u0627\u0644\u0639\u0628\u0627\u062F\u0629 \u0648\u0637\u0644\u0628 \u0627\u0644\u0647\u062F\u0627\u064A\u0629"
      ],
      body: [
        "\u672C\u7AE0\u4E03\u8282\uFF1A\u5148\u8D5E\u9882\u517B\u80B2\u4F17\u4E16\u754C\u7684\u4E3B\uFF081-4\uFF09\uFF0C\u518D\u8868\u660E\u552F\u72EC\u5D07\u62DC\u4E0E\u6C42\u52A9\uFF085\uFF09\uFF0C\u6700\u540E\u7948\u6C42\u7AEF\u6B63\u7684\u9053\u8DEF\u5E76\u8BF4\u660E\u8BE5\u9053\u8DEF\u7684\u7279\u5F81\uFF086-7\uFF09\u3002\u6559\u5B66\u4E0A\u6309\u300C\u8D5E\u9882 \u2192 \u5D07\u62DC \u2192 \u7948\u6C42\u300D\u4E09\u6BB5\u8BB2\u89E3\u3002",
        "Seven verses: praise of the Lord of the worlds (1-4), the declaration of exclusive worship and seeking help (5), and the plea for the straight path with its description (6-7). Teach in three movements: praise, worship, plea.",
        "\u0633\u0628\u0639 \u0622\u064A\u0627\u062A: \u0627\u0644\u062B\u0646\u0627\u0621 \u0639\u0644\u0649 \u0631\u0628 \u0627\u0644\u0639\u0627\u0644\u0645\u064A\u0646 (1-4)\u060C \u062B\u0645 \u0625\u0641\u0631\u0627\u062F \u0627\u0644\u0639\u0628\u0627\u062F\u0629 \u0648\u0627\u0644\u0627\u0633\u062A\u0639\u0627\u0646\u0629 (5)\u060C \u062B\u0645 \u0637\u0644\u0628 \u0627\u0644\u0635\u0631\u0627\u0637 \u0627\u0644\u0645\u0633\u062A\u0642\u064A\u0645 \u0648\u0648\u0635\u0641\u0647 (6-7). \u062A\u064F\u062F\u0631\u064E\u0651\u0633 \u0641\u064A \u062B\u0644\u0627\u062B \u062D\u0631\u0643\u0627\u062A: \u0627\u0644\u062D\u0645\u062F\u060C \u0627\u0644\u0639\u0628\u0627\u062F\u0629\u060C \u0627\u0644\u062F\u0639\u0627\u0621."
      ]
    },
    {
      chapter: 103,
      title: [
        "\u65F6\u5149\u4E4B\u8A93\u4E0E\u514D\u4E8E\u4E8F\u6298\u7684\u56DB\u4E2A\u6761\u4EF6",
        "The oath by time and the four conditions against loss",
        "\u0627\u0644\u0642\u0633\u0645 \u0628\u0627\u0644\u0639\u0635\u0631 \u0648\u0634\u0631\u0648\u0637 \u0627\u0644\u0646\u062C\u0627\u0629 \u0645\u0646 \u0627\u0644\u062E\u0633\u0631"
      ],
      body: [
        "\u672C\u7AE0\u4E09\u8282\uFF1A\u4EE5\u65F6\u5149\u8D77\u8A93\uFF081\uFF09\uFF0C\u65AD\u8A00\u4EBA\u5904\u4E8E\u4E8F\u6298\uFF082\uFF09\uFF0C\u4F8B\u5916\u6761\u4EF6\u662F\u5F52\u4FE1\u3001\u884C\u5584\u3001\u4EE5\u771F\u7406\u4E92\u52C9\u3001\u4EE5\u575A\u5FCD\u4E92\u52C9\uFF083\uFF09\u3002\u6559\u5B66\u91CD\u70B9\uFF1A\u300C\u4E00\u822C\u5224\u65AD + \u4F8B\u5916\u6761\u4EF6\u300D\u7684\u53E5\u5F0F\u4E0E\u56DB\u4E2A\u6761\u4EF6\u7684\u987A\u5E8F\u3002",
        'Three verses: an oath by time (1), the general statement that mankind is in loss (2), and the exception: belief, righteous deeds, mutual counsel to truth and to patience (3). Focus: the pattern "general rule + exception" and the order of the four conditions.',
        "\u062B\u0644\u0627\u062B \u0622\u064A\u0627\u062A: \u0627\u0644\u0642\u0633\u0645 \u0628\u0627\u0644\u0639\u0635\u0631 (1)\u060C \u0627\u0644\u062D\u0643\u0645 \u0627\u0644\u0639\u0627\u0645 \u0628\u0623\u0646 \u0627\u0644\u0625\u0646\u0633\u0627\u0646 \u0641\u064A \u062E\u0633\u0631 (2)\u060C \u0648\u0627\u0644\u0627\u0633\u062A\u062B\u0646\u0627\u0621: \u0627\u0644\u0625\u064A\u0645\u0627\u0646\u060C \u0627\u0644\u0639\u0645\u0644 \u0627\u0644\u0635\u0627\u0644\u062D\u060C \u0627\u0644\u062A\u0648\u0627\u0635\u064A \u0628\u0627\u0644\u062D\u0642\u060C \u0627\u0644\u062A\u0648\u0627\u0635\u064A \u0628\u0627\u0644\u0635\u0628\u0631 (3). \u0627\u0644\u062A\u0631\u0643\u064A\u0632: \u0628\u0646\u064A\u0629 \xAB\u062D\u0643\u0645 \u0639\u0627\u0645 + \u0627\u0633\u062A\u062B\u0646\u0627\u0621\xBB \u0648\u062A\u0631\u062A\u064A\u0628 \u0627\u0644\u0634\u0631\u0648\u0637 \u0627\u0644\u0623\u0631\u0628\u0639\u0629."
      ]
    },
    {
      chapter: 108,
      title: [
        "\u6069\u8D50\u3001\u793C\u62DC\u4E0E\u5BB0\u7272",
        "The gift, prayer and sacrifice",
        "\u0627\u0644\u0639\u0637\u0627\u0621 \u0648\u0627\u0644\u0635\u0644\u0627\u0629 \u0648\u0627\u0644\u0646\u062D\u0631"
      ],
      body: [
        "\u4E09\u8282\u7ED3\u6784\uFF1A\u6069\u8D50\uFF081\uFF09\u2192 \u56DE\u5E94\u6069\u8D50\u7684\u884C\u52A8\uFF1A\u793C\u62DC\u4E0E\u5BB0\u7272\uFF082\uFF09\u2192 \u5BF9\u618E\u6068\u8005\u7684\u5224\u5B9A\uFF083\uFF09\u3002\u6559\u5B66\u91CD\u70B9\uFF1A\u56E0\u679C\u5173\u7CFB\u300C\u56E0\u4E3A\u8D50\u4E88\uFF0C\u6240\u4EE5\u793C\u62DC\u300D\u3002",
        'Three verses: the gift (1), the response to it in prayer and sacrifice (2), and the judgement on the one who hates (3). Focus: the cause-effect link "because He gave, therefore pray".',
        "\u062B\u0644\u0627\u062B \u0622\u064A\u0627\u062A: \u0627\u0644\u0639\u0637\u0627\u0621 (1)\u060C \u0627\u0644\u0627\u0633\u062A\u062C\u0627\u0628\u0629 \u0644\u0647 \u0628\u0627\u0644\u0635\u0644\u0627\u0629 \u0648\u0627\u0644\u0646\u062D\u0631 (2)\u060C \u0648\u0627\u0644\u062D\u0643\u0645 \u0639\u0644\u0649 \u0627\u0644\u0634\u0627\u0646\u0626 (3). \u0627\u0644\u062A\u0631\u0643\u064A\u0632: \u0639\u0644\u0627\u0642\u0629 \u0627\u0644\u0633\u0628\u0628 \u0648\u0627\u0644\u0646\u062A\u064A\u062C\u0629."
      ]
    },
    {
      chapter: 112,
      title: [
        "\u72EC\u4E00\u4E0E\u65E0\u5339",
        "Oneness and incomparability",
        "\u0627\u0644\u062A\u0648\u062D\u064A\u062F \u0648\u0646\u0641\u064A \u0627\u0644\u0645\u062B\u064A\u0644"
      ],
      body: [
        "\u56DB\u8282\u4ECE\u80AF\u5B9A\uFF08\u72EC\u4E00\u3001\u88AB\u4EF0\u8D56\uFF09\u5230\u5426\u5B9A\uFF08\u4E0D\u751F\u3001\u4E0D\u88AB\u751F\u3001\u65E0\u5339\u654C\uFF09\u3002\u6559\u5B66\u91CD\u70B9\uFF1A\u80AF\u5B9A\u53E5\u4E0E\u5426\u5B9A\u53E5\u7684\u5BF9\u7167\uFF0C\u4EE5\u53CA\u300C\u0623\u062D\u062F\u300D\u5728\u9996\u5C3E\u4E24\u6B21\u51FA\u73B0\u3002",
        'Four verses moving from affirmation (One, the Eternal Refuge) to negation (does not beget, is not begotten, has no equal). Focus: affirmation versus negation, and the word "\u0623\u062D\u062F" appearing at both the start and the end.',
        "\u0623\u0631\u0628\u0639 \u0622\u064A\u0627\u062A \u0645\u0646 \u0627\u0644\u0625\u062B\u0628\u0627\u062A (\u0623\u062D\u062F\u060C \u0627\u0644\u0635\u0645\u062F) \u0625\u0644\u0649 \u0627\u0644\u0646\u0641\u064A (\u0644\u0645 \u064A\u0644\u062F\u060C \u0644\u0645 \u064A\u0648\u0644\u062F\u060C \u0644\u0627 \u0643\u0641\u0648). \u0627\u0644\u062A\u0631\u0643\u064A\u0632: \u0645\u0642\u0627\u0628\u0644\u0629 \u0627\u0644\u0625\u062B\u0628\u0627\u062A \u0628\u0627\u0644\u0646\u0641\u064A\u060C \u0648\u062A\u0643\u0631\u0627\u0631 \u0643\u0644\u0645\u0629 \xAB\u0623\u062D\u062F\xBB \u0641\u064A \u0627\u0644\u0628\u062F\u0627\u064A\u0629 \u0648\u0627\u0644\u0646\u0647\u0627\u064A\u0629."
      ]
    },
    {
      chapter: 113,
      title: [
        "\u5411\u66D9\u5149\u4E4B\u4E3B\u6C42\u5E87\u62A4",
        "Seeking refuge with the Lord of daybreak",
        "\u0627\u0644\u0627\u0633\u062A\u0639\u0627\u0630\u0629 \u0628\u0631\u0628 \u0627\u0644\u0641\u0644\u0642"
      ],
      body: [
        "\u4E94\u8282\uFF1A\u6C42\u5E87\u62A4\u7684\u5BF9\u8C61\uFF081\uFF09\u4E0E\u56DB\u79CD\u88AB\u6C42\u5E87\u62A4\u4E4B\u6076\uFF082-5\uFF09\uFF0C\u5176\u4E2D\u4E09\u79CD\u4EE5\u300C\u0648\u064E\u0645\u0650\u0646 \u0634\u064E\u0631\u0650\u0651\u300D\u91CD\u590D\u5F00\u5934\uFF0C\u662F\u8BC6\u522B\u91CD\u590D\u7ED3\u6784\u7684\u6700\u77ED\u8303\u4F8B\u3002",
        'Five verses: the One with whom refuge is sought (1) and four kinds of harm (2-5), three of which open with the repeated phrase "\u0648\u064E\u0645\u0650\u0646 \u0634\u064E\u0631\u0650\u0651" \u2013 the shortest example of a repeated structure.',
        "\u062E\u0645\u0633 \u0622\u064A\u0627\u062A: \u0627\u0644\u0645\u0633\u062A\u0639\u0627\u0630 \u0628\u0647 (1) \u0648\u0623\u0631\u0628\u0639\u0629 \u0623\u0646\u0648\u0627\u0639 \u0645\u0646 \u0627\u0644\u0634\u0631 (2-5)\u060C \u062B\u0644\u0627\u062B\u0629 \u0645\u0646\u0647\u0627 \u062A\u0628\u062F\u0623 \u0628\u0639\u0628\u0627\u0631\u0629 \xAB\u0648\u064E\u0645\u0650\u0646 \u0634\u064E\u0631\u0650\u0651\xBB \u0627\u0644\u0645\u062A\u0643\u0631\u0631\u0629 \u2013 \u0623\u0642\u0635\u0631 \u0645\u062B\u0627\u0644 \u0639\u0644\u0649 \u0627\u0644\u0628\u0646\u064A\u0629 \u0627\u0644\u0645\u062A\u0643\u0631\u0631\u0629."
      ]
    },
    {
      chapter: 114,
      title: [
        "\u5411\u4E16\u4EBA\u4E4B\u4E3B\u6C42\u5E87\u62A4",
        "Seeking refuge with the Lord of mankind",
        "\u0627\u0644\u0627\u0633\u062A\u0639\u0627\u0630\u0629 \u0628\u0631\u0628 \u0627\u0644\u0646\u0627\u0633"
      ],
      body: [
        "\u516D\u8282\uFF1A\u4E09\u4E2A\u79F0\u8C13\uFF08\u4E3B\u3001\u541B\u738B\u3001\u795E\uFF09\u5C42\u5C42\u9012\u8FDB\uFF081-3\uFF09\uFF0C\u7136\u540E\u8BF4\u660E\u6240\u6C42\u5E87\u62A4\u7684\u6076\u2014\u2014\u6F5C\u4F0F\u7684\u6559\u5506\u8005\uFF084-6\uFF09\u3002\u300C\u0671\u0644\u0646\u064E\u0651\u0627\u0633\u0650\u300D\u4E00\u8BCD\u5728\u516D\u8282\u91CC\u51FA\u73B0\u4E94\u6B21\uFF0C\u9002\u5408\u8BCD\u9891\u4E0E\u7ED3\u6784\u7EC3\u4E60\u3002",
        'Six verses: three ascending titles \u2013 Lord, King, God (1-3) \u2013 followed by the harm sought refuge from: the withdrawing whisperer (4-6). The word "\u0671\u0644\u0646\u064E\u0651\u0627\u0633\u0650" appears five times in six verses, ideal for frequency and structure exercises.',
        "\u0633\u062A \u0622\u064A\u0627\u062A: \u062B\u0644\u0627\u062B\u0629 \u0623\u0648\u0635\u0627\u0641 \u0645\u062A\u062F\u0631\u062C\u0629 \u2013 \u0631\u0628\u060C \u0645\u0644\u0643\u060C \u0625\u0644\u0647 (1-3) \u2013 \u062B\u0645 \u0627\u0644\u0634\u0631 \u0627\u0644\u0645\u0633\u062A\u0639\u0627\u0630 \u0645\u0646\u0647: \u0627\u0644\u0648\u0633\u0648\u0627\u0633 \u0627\u0644\u062E\u0646\u0627\u0633 (4-6). \u062A\u062A\u0643\u0631\u0631 \u0643\u0644\u0645\u0629 \xAB\u0671\u0644\u0646\u064E\u0651\u0627\u0633\u0650\xBB \u062E\u0645\u0633 \u0645\u0631\u0627\u062A \u0641\u064A \u0633\u062A \u0622\u064A\u0627\u062A."
      ]
    },
    {
      chapter: 49,
      title: [
        "\u4FE1\u58EB\u793E\u7FA4\u7684\u793C\u8282\u4E0E\u51C6\u5219",
        "Manners and norms of the believing community",
        "\u0622\u062F\u0627\u0628 \u0627\u0644\u0645\u062C\u062A\u0645\u0639 \u0627\u0644\u0645\u0624\u0645\u0646 \u0648\u0642\u0648\u0627\u0639\u062F\u0647"
      ],
      body: [
        "\u5341\u516B\u8282\u53EF\u5206\u4E3A\u4E94\u4E2A\u6559\u5B66\u5355\u5143\uFF1A\u5BF9\u5148\u77E5\u7684\u793C\u8282\uFF081-5\uFF09\u3001\u6838\u5B9E\u6D88\u606F\uFF086-8\uFF09\u3001\u548C\u89E3\u4E0E\u5144\u5F1F\u60C5\u8C0A\uFF089-10\uFF09\u3001\u7981\u6B62\u5632\u7B11\u731C\u7591\u7AA5\u63A2\u80CC\u8C08\u4E0E\u4EBA\u7C7B\u5E73\u7B49\uFF0811-13\uFF09\u3001\u4FE1\u4EF0\u4E0E\u5F52\u987A\u7684\u533A\u522B\uFF0814-18\uFF09\u3002\u300C\u064A\u064E\u0640\u0670\u0653\u0623\u064E\u064A\u064F\u0651\u0647\u064E\u0627 \u0671\u0644\u064E\u0651\u0630\u0650\u064A\u0646\u064E \u0621\u064E\u0627\u0645\u064E\u0646\u064F\u0648\u0627\u06DF\u300D\u547C\u8BED\u51FA\u73B0\u4E94\u6B21\uFF0C\u662F\u5206\u6BB5\u6807\u5FD7\u3002",
        'Eighteen verses in five teaching units: etiquette before the Prophet (1-5), verifying news (6-8), reconciliation and brotherhood (9-10), prohibition of mockery, suspicion, spying and backbiting plus human equality (11-13), and the difference between faith and submission (14-18). The address "\u064A\u064E\u0640\u0670\u0653\u0623\u064E\u064A\u064F\u0651\u0647\u064E\u0627 \u0671\u0644\u064E\u0651\u0630\u0650\u064A\u0646\u064E \u0621\u064E\u0627\u0645\u064E\u0646\u064F\u0648\u0627\u06DF" occurs five times and marks the sections.',
        "\u062B\u0645\u0627\u0646\u064A \u0639\u0634\u0631\u0629 \u0622\u064A\u0629 \u0641\u064A \u062E\u0645\u0633 \u0648\u062D\u062F\u0627\u062A: \u0627\u0644\u0623\u062F\u0628 \u0645\u0639 \u0627\u0644\u0646\u0628\u064A (1-5)\u060C \u0627\u0644\u062A\u062B\u0628\u062A \u0645\u0646 \u0627\u0644\u0623\u062E\u0628\u0627\u0631 (6-8)\u060C \u0627\u0644\u0625\u0635\u0644\u0627\u062D \u0648\u0627\u0644\u0623\u062E\u0648\u0629 (9-10)\u060C \u0627\u0644\u0646\u0647\u064A \u0639\u0646 \u0627\u0644\u0633\u062E\u0631\u064A\u0629 \u0648\u0627\u0644\u0638\u0646 \u0648\u0627\u0644\u062A\u062C\u0633\u0633 \u0648\u0627\u0644\u063A\u064A\u0628\u0629 \u0648\u0645\u0633\u0627\u0648\u0627\u0629 \u0627\u0644\u0628\u0634\u0631 (11-13)\u060C \u0648\u0627\u0644\u0641\u0631\u0642 \u0628\u064A\u0646 \u0627\u0644\u0625\u064A\u0645\u0627\u0646 \u0648\u0627\u0644\u0625\u0633\u0644\u0627\u0645 (14-18). \u064A\u062A\u0643\u0631\u0631 \u0627\u0644\u0646\u062F\u0627\u0621 \xAB\u064A\u064E\u0640\u0670\u0653\u0623\u064E\u064A\u064F\u0651\u0647\u064E\u0627 \u0671\u0644\u064E\u0651\u0630\u0650\u064A\u0646\u064E \u0621\u064E\u0627\u0645\u064E\u0646\u064F\u0648\u0627\u06DF\xBB \u062E\u0645\u0633 \u0645\u0631\u0627\u062A."
      ]
    },
    {
      chapter: 67,
      title: [
        "\u4E3B\u6743\u3001\u521B\u9020\u7684\u5B8C\u7F8E\u4E0E\u8B66\u9192",
        "Sovereignty, the perfection of creation and warning",
        "\u0627\u0644\u0645\u0644\u0643 \u0648\u0625\u062A\u0642\u0627\u0646 \u0627\u0644\u062E\u0644\u0642 \u0648\u0627\u0644\u0625\u0646\u0630\u0627\u0631"
      ],
      body: [
        "\u4E09\u5341\u8282\u5206\u516D\u4E2A\u5355\u5143\uFF1A\u4E3B\u6743\u4E0E\u521B\u9020\u7684\u5B8C\u7F8E\uFF081-5\uFF09\u3001\u5426\u8BA4\u8005\u7684\u7ED3\u5C40\u4E0E\u5FCF\u6094\uFF086-11\uFF09\u3001\u754F\u60E7\u4E0E\u88AB\u9A6F\u670D\u7684\u5927\u5730\uFF0812-15\uFF09\u3001\u8B66\u544A\u4E0E\u4E24\u79CD\u884C\u8D70\u8005\u7684\u6BD4\u55BB\uFF0816-22\uFF09\u3001\u611F\u5B98\u7684\u521B\u9020\u4E0E\u590D\u6D3B\u7684\u5141\u8BFA\uFF0823-27\uFF09\u3001\u7ED3\u8BED\uFF0828-30\uFF09\u3002\u591A\u6B21\u51FA\u73B0\u300C\u0642\u064F\u0644\u0652\u300D\u5F15\u5BFC\u7684\u53CD\u95EE\uFF0C\u662F\u672C\u7AE0\u7684\u4FEE\u8F9E\u7279\u5F81\u3002",
        'Thirty verses in six units: sovereignty and flawless creation (1-5), the fate and confession of deniers (6-11), fear of the unseen and the subdued earth (12-15), warnings and the parable of two walkers (16-22), the creation of the senses and the promise of resurrection (23-27), and the conclusion (28-30). Rhetorical questions introduced by "\u0642\u064F\u0644\u0652" recur throughout.',
        "\u062B\u0644\u0627\u062B\u0648\u0646 \u0622\u064A\u0629 \u0641\u064A \u0633\u062A \u0648\u062D\u062F\u0627\u062A: \u0627\u0644\u0645\u0644\u0643 \u0648\u0625\u062A\u0642\u0627\u0646 \u0627\u0644\u062E\u0644\u0642 (1-5)\u060C \u0645\u0635\u064A\u0631 \u0627\u0644\u0645\u0643\u0630\u0628\u064A\u0646 \u0648\u0627\u0639\u062A\u0631\u0627\u0641\u0647\u0645 (6-11)\u060C \u0627\u0644\u062E\u0634\u064A\u0629 \u0628\u0627\u0644\u063A\u064A\u0628 \u0648\u0627\u0644\u0623\u0631\u0636 \u0627\u0644\u0630\u0644\u0648\u0644 (12-15)\u060C \u0627\u0644\u0625\u0646\u0630\u0627\u0631 \u0648\u0645\u062B\u0644 \u0627\u0644\u0645\u0627\u0634\u064A\u064E\u064A\u0646 (16-22)\u060C \u062E\u0644\u0642 \u0627\u0644\u062D\u0648\u0627\u0633 \u0648\u0648\u0639\u062F \u0627\u0644\u062D\u0634\u0631 (23-27)\u060C \u0648\u0627\u0644\u062E\u0627\u062A\u0645\u0629 (28-30). \u062A\u062A\u0643\u0631\u0631 \u0627\u0644\u0623\u0633\u0626\u0644\u0629 \u0627\u0644\u0627\u0633\u062A\u0646\u0643\u0627\u0631\u064A\u0629 \u0627\u0644\u0645\u0628\u062F\u0648\u0621\u0629 \u0628\u0640\xAB\u0642\u064F\u0644\u0652\xBB."
      ]
    },
    {
      chapter: 55,
      title: [
        "\u6069\u5178\u7684\u6E05\u5355\u4E0E\u91CD\u590D\u7684\u53CD\u95EE",
        "The catalogue of favours and the repeated refrain",
        "\u062A\u0639\u062F\u0627\u062F \u0627\u0644\u0646\u0639\u0645 \u0648\u0627\u0644\u0644\u0627\u0632\u0645\u0629 \u0627\u0644\u0645\u062A\u0643\u0631\u0631\u0629"
      ],
      body: [
        "\u4E03\u5341\u516B\u8282\u6309\u4E94\u4E2A\u5355\u5143\u8BB2\u6388\uFF1A\u6559\u5BFC\u4E0E\u81EA\u7136\u79E9\u5E8F\uFF081-13\uFF09\u3001\u4EBA\u4E0E\u7CBE\u7075\u7684\u521B\u9020\u3001\u4E24\u6D77\u4E0E\u8239\u53EA\uFF0814-25\uFF09\u3001\u4E07\u7269\u6D88\u901D\u4E0E\u5BA1\u5224\uFF0826-45\uFF09\u3001\u4E24\u5EA7\u4E50\u56ED\uFF0846-61\uFF09\u3001\u53E6\u5916\u4E24\u5EA7\u4E50\u56ED\u4E0E\u7ED3\u8BED\uFF0862-78\uFF09\u3002\u53CD\u95EE\u53E5\u300C\u0641\u064E\u0628\u0650\u0623\u064E\u0649\u0650\u0651 \u0621\u064E\u0627\u0644\u064E\u0622\u0621\u0650 \u0631\u064E\u0628\u0650\u0651\u0643\u064F\u0645\u064E\u0627 \u062A\u064F\u0643\u064E\u0630\u0650\u0651\u0628\u064E\u0627\u0646\u0650\u300D\u91CD\u590D 31 \u6B21\uFF0C\u662F\u8BC6\u522B\u91CD\u590D\u7ED3\u6784\u3001\u907F\u514D\u673A\u68B0\u9010\u8282\u603B\u7ED3\u7684\u6838\u5FC3\u6848\u4F8B\u3002",
        'Seventy-eight verses in five units: teaching and the natural order (1-13), the creation of humans and jinn, the two seas and ships (14-25), the passing of all things and judgement (26-45), the two gardens (46-61), and two further gardens with the conclusion (62-78). The refrain "\u0641\u064E\u0628\u0650\u0623\u064E\u0649\u0650\u0651 \u0621\u064E\u0627\u0644\u064E\u0622\u0621\u0650 \u0631\u064E\u0628\u0650\u0651\u0643\u064F\u0645\u064E\u0627 \u062A\u064F\u0643\u064E\u0630\u0650\u0651\u0628\u064E\u0627\u0646\u0650" repeats 31 times \u2013 the key case for recognising repeated structure instead of summarising verse by verse.',
        "\u062B\u0645\u0627\u0646 \u0648\u0633\u0628\u0639\u0648\u0646 \u0622\u064A\u0629 \u0641\u064A \u062E\u0645\u0633 \u0648\u062D\u062F\u0627\u062A: \u0627\u0644\u062A\u0639\u0644\u064A\u0645 \u0648\u0646\u0638\u0627\u0645 \u0627\u0644\u0643\u0648\u0646 (1-13)\u060C \u062E\u0644\u0642 \u0627\u0644\u0625\u0646\u0633\u0627\u0646 \u0648\u0627\u0644\u062C\u0627\u0646 \u0648\u0627\u0644\u0628\u062D\u0631\u0627\u0646 \u0648\u0627\u0644\u0633\u0641\u0646 (14-25)\u060C \u0641\u0646\u0627\u0621 \u0627\u0644\u062E\u0644\u0642 \u0648\u0627\u0644\u062D\u0633\u0627\u0628 (26-45)\u060C \u0627\u0644\u062C\u0646\u062A\u0627\u0646 (46-61)\u060C \u0648\u062C\u0646\u062A\u0627\u0646 \u0623\u062E\u0631\u064A\u0627\u0646 \u0648\u0627\u0644\u062E\u0627\u062A\u0645\u0629 (62-78). \u062A\u062A\u0643\u0631\u0631 \u0627\u0644\u0644\u0627\u0632\u0645\u0629 \xAB\u0641\u064E\u0628\u0650\u0623\u064E\u0649\u0650\u0651 \u0621\u064E\u0627\u0644\u064E\u0622\u0621\u0650 \u0631\u064E\u0628\u0650\u0651\u0643\u064F\u0645\u064E\u0627 \u062A\u064F\u0643\u064E\u0630\u0650\u0651\u0628\u064E\u0627\u0646\u0650\xBB 31 \u0645\u0631\u0629."
      ]
    },
    {
      chapter: 12,
      title: [
        "\u4F18\u7D20\u798F\u7684\u6545\u4E8B\uFF1A\u4ECE\u68A6\u5230\u68A6\u7684\u5B9E\u73B0",
        "The story of Yusuf: from the dream to its fulfilment",
        "\u0642\u0635\u0629 \u064A\u0648\u0633\u0641: \u0645\u0646 \u0627\u0644\u0631\u0624\u064A\u0627 \u0625\u0644\u0649 \u062A\u062D\u0642\u0642\u0647\u0627"
      ],
      body: [
        "\u4E00\u767E\u4E00\u5341\u4E00\u8282\u662F\u4E00\u6761\u8FDE\u7EED\u53D9\u4E8B\uFF1A\u5F00\u7BC7\u7684\u68A6\uFF084-6\uFF09\u5728\u7ED3\u5C3E\u5B9E\u73B0\uFF08100\uFF09\u3002\u6309\u4E8B\u4EF6\u987A\u5E8F\u62C6\u6210\u5341\u4E94\u4E2A\u5355\u5143\uFF0C\u4EBA\u7269\u5173\u7CFB\uFF08\u4F18\u7D20\u798F\u3001\u7236\u4EB2\u3001\u5144\u5F1F\u4EEC\u3001\u6743\u8D35\u53CA\u5176\u59BB\u5B50\u3001\u72F1\u53CB\u3001\u56FD\u738B\uFF09\u8D2F\u7A7F\u5168\u7BC7\uFF0C\u9002\u5408\u957F\u4E0A\u4E0B\u6587\u68C0\u7D22\u3001\u8DE8\u8282\u56E0\u679C\u4E0E\u4E8B\u4EF6\u6392\u5E8F\u7EC3\u4E60\u3002",
        "One hundred and eleven verses form one continuous narrative: the opening dream (4-6) is fulfilled at the end (100). Divided into fifteen units by event, with the cast (Yusuf, his father, his brothers, the Aziz and his wife, the two prisoners, the king) running throughout \u2013 suited to long-context retrieval, cross-verse causation and event ordering.",
        "\u0645\u0626\u0629 \u0648\u0625\u062D\u062F\u0649 \u0639\u0634\u0631\u0629 \u0622\u064A\u0629 \u062A\u0634\u0643\u0644 \u0633\u0631\u062F\u064B\u0627 \u0645\u062A\u0635\u0644\u064B\u0627: \u0631\u0624\u064A\u0627 \u0627\u0644\u0628\u062F\u0627\u064A\u0629 (4-6) \u062A\u062A\u062D\u0642\u0642 \u0641\u064A \u0627\u0644\u0646\u0647\u0627\u064A\u0629 (100). \u0645\u0642\u0633\u0645\u0629 \u0625\u0644\u0649 \u062E\u0645\u0633 \u0639\u0634\u0631\u0629 \u0648\u062D\u062F\u0629 \u0628\u062D\u0633\u0628 \u0627\u0644\u0623\u062D\u062F\u0627\u062B\u060C \u0648\u0627\u0644\u0634\u062E\u0635\u064A\u0627\u062A (\u064A\u0648\u0633\u0641\u060C \u0623\u0628\u0648\u0647\u060C \u0625\u062E\u0648\u062A\u0647\u060C \u0627\u0644\u0639\u0632\u064A\u0632 \u0648\u0627\u0645\u0631\u0623\u062A\u0647\u060C \u0635\u0627\u062D\u0628\u0627 \u0627\u0644\u0633\u062C\u0646\u060C \u0627\u0644\u0645\u0644\u0643) \u062D\u0627\u0636\u0631\u0629 \u0641\u064A \u0643\u0644 \u0627\u0644\u0642\u0635\u0629."
      ]
    }
  ],
  units: [
    {
      chapter: 1,
      from: 1,
      to: 4,
      title: [
        "\u8D5E\u9882\u4E0E\u4E3B\u7684\u5C5E\u6027",
        "Praise and the attributes of the Lord",
        "\u0627\u0644\u062D\u0645\u062F \u0648\u0635\u0641\u0627\u062A \u0627\u0644\u0631\u0628"
      ],
      theme: [
        "\u4EE5\u4E3B\u4E4B\u540D\u5F00\u7BC7\uFF0C\u8D5E\u9882\u517B\u80B2\u4F17\u4E16\u754C\u3001\u81F3\u4EC1\u81F3\u6148\u3001\u638C\u7BA1\u62A5\u5E94\u65E5\u7684\u4E3B\u3002",
        "Opening in the name of God and praising the Lord of the worlds, Most Gracious, Most Merciful, Master of the Day of Recompense.",
        "\u0627\u0644\u0627\u0641\u062A\u062A\u0627\u062D \u0628\u0627\u0633\u0645 \u0627\u0644\u0644\u0647 \u0648\u0627\u0644\u062B\u0646\u0627\u0621 \u0639\u0644\u0649 \u0631\u0628 \u0627\u0644\u0639\u0627\u0644\u0645\u064A\u0646 \u0627\u0644\u0631\u062D\u0645\u0646 \u0627\u0644\u0631\u062D\u064A\u0645 \u0645\u0627\u0644\u0643 \u064A\u0648\u0645 \u0627\u0644\u062F\u064A\u0646."
      ],
      persons: [],
      concepts: [
        [
          "\u8D5E\u9882",
          "Praise",
          "\u0627\u0644\u062D\u0645\u062F"
        ],
        [
          "\u517B\u80B2\u4F17\u4E16\u754C\u7684\u4E3B",
          "Lord of the worlds",
          "\u0631\u0628 \u0627\u0644\u0639\u0627\u0644\u0645\u064A\u0646"
        ],
        [
          "\u62A5\u5E94\u65E5",
          "Day of Recompense",
          "\u064A\u0648\u0645 \u0627\u0644\u062F\u064A\u0646"
        ]
      ]
    },
    {
      chapter: 1,
      from: 5,
      to: 5,
      title: [
        "\u552F\u72EC\u5D07\u62DC\u4E0E\u6C42\u52A9",
        "Exclusive worship and seeking help",
        "\u0625\u0641\u0631\u0627\u062F \u0627\u0644\u0639\u0628\u0627\u062F\u0629 \u0648\u0627\u0644\u0627\u0633\u062A\u0639\u0627\u0646\u0629"
      ],
      theme: [
        "\u628A\u5D07\u62DC\u4E0E\u6C42\u52A9\u4E13\u5F52\u4E8E\u4E3B\uFF1B\u4EE3\u8BCD\u300C\u0625\u0650\u064A\u064E\u0651\u0627\u0643\u064E\u300D\u524D\u7F6E\u8868\u793A\u4E13\u4E00\u3002",
        'Worship and seeking help are directed to God alone; the fronted pronoun "\u0625\u0650\u064A\u064E\u0651\u0627\u0643\u064E" expresses exclusivity.',
        "\u062A\u062E\u0635\u064A\u0635 \u0627\u0644\u0639\u0628\u0627\u062F\u0629 \u0648\u0627\u0644\u0627\u0633\u062A\u0639\u0627\u0646\u0629 \u0628\u0627\u0644\u0644\u0647\u061B \u062A\u0642\u062F\u064A\u0645 \xAB\u0625\u0650\u064A\u064E\u0651\u0627\u0643\u064E\xBB \u064A\u0641\u064A\u062F \u0627\u0644\u062D\u0635\u0631."
      ],
      persons: [],
      concepts: [
        [
          "\u4E13\u4E00\u5D07\u62DC",
          "Exclusive worship",
          "\u0625\u0641\u0631\u0627\u062F \u0627\u0644\u0639\u0628\u0627\u062F\u0629"
        ],
        [
          "\u6C42\u52A9",
          "Seeking help",
          "\u0627\u0644\u0627\u0633\u062A\u0639\u0627\u0646\u0629"
        ]
      ]
    },
    {
      chapter: 1,
      from: 6,
      to: 7,
      title: [
        "\u7948\u6C42\u7AEF\u6B63\u7684\u9053\u8DEF",
        "The plea for the straight path",
        "\u0637\u0644\u0628 \u0627\u0644\u0635\u0631\u0627\u0637 \u0627\u0644\u0645\u0633\u062A\u0642\u064A\u0645"
      ],
      theme: [
        "\u7948\u6C42\u5F15\u5BFC\u5230\u7AEF\u6B63\u7684\u9053\u8DEF\uFF0C\u5E76\u4EE5\u4E09\u7C7B\u4EBA\u8BF4\u660E\u8FD9\u6761\u9053\u8DEF\uFF1A\u8499\u6069\u8005\u3001\u88AB\u8C34\u6012\u8005\u3001\u8FF7\u8BEF\u8005\u3002",
        "A plea for guidance to the straight path, described through three groups: those favoured, those who earned anger, those astray.",
        "\u0637\u0644\u0628 \u0627\u0644\u0647\u062F\u0627\u064A\u0629 \u0625\u0644\u0649 \u0627\u0644\u0635\u0631\u0627\u0637 \u0627\u0644\u0645\u0633\u062A\u0642\u064A\u0645 \u0648\u0648\u0635\u0641\u0647 \u0628\u062B\u0644\u0627\u062B \u0641\u0626\u0627\u062A: \u0627\u0644\u0645\u0646\u0639\u0645 \u0639\u0644\u064A\u0647\u0645\u060C \u0627\u0644\u0645\u063A\u0636\u0648\u0628 \u0639\u0644\u064A\u0647\u0645\u060C \u0627\u0644\u0636\u0627\u0644\u064A\u0646."
      ],
      persons: [],
      concepts: [
        [
          "\u7AEF\u6B63\u7684\u9053\u8DEF",
          "The straight path",
          "\u0627\u0644\u0635\u0631\u0627\u0637 \u0627\u0644\u0645\u0633\u062A\u0642\u064A\u0645"
        ],
        [
          "\u4E09\u7C7B\u4EBA\u7684\u5BF9\u7167",
          "Contrast of three groups",
          "\u0645\u0642\u0627\u0628\u0644\u0629 \u0627\u0644\u0641\u0626\u0627\u062A \u0627\u0644\u062B\u0644\u0627\u062B"
        ]
      ]
    },
    {
      chapter: 103,
      from: 1,
      to: 2,
      title: [
        "\u8D77\u8A93\u4E0E\u603B\u5224\u65AD",
        "The oath and the general verdict",
        "\u0627\u0644\u0642\u0633\u0645 \u0648\u0627\u0644\u062D\u0643\u0645 \u0627\u0644\u0639\u0627\u0645"
      ],
      theme: [
        "\u4EE5\u65F6\u5149\u8D77\u8A93\uFF0C\u65AD\u8A00\u4EBA\u5904\u4E8E\u4E8F\u6298\u4E4B\u4E2D\u3002",
        "An oath by time, then the verdict that mankind is in loss.",
        "\u0627\u0644\u0642\u0633\u0645 \u0628\u0627\u0644\u0639\u0635\u0631 \u062B\u0645 \u0627\u0644\u062D\u0643\u0645 \u0628\u0623\u0646 \u0627\u0644\u0625\u0646\u0633\u0627\u0646 \u0641\u064A \u062E\u0633\u0631."
      ],
      persons: [],
      concepts: [
        [
          "\u4EE5\u65F6\u5149\u8D77\u8A93",
          "Oath by time",
          "\u0627\u0644\u0642\u0633\u0645 \u0628\u0627\u0644\u0639\u0635\u0631"
        ],
        [
          "\u4E8F\u6298",
          "Loss",
          "\u0627\u0644\u062E\u0633\u0631"
        ]
      ]
    },
    {
      chapter: 103,
      from: 3,
      to: 3,
      title: [
        "\u4F8B\u5916\uFF1A\u56DB\u4E2A\u6761\u4EF6",
        "The exception: four conditions",
        "\u0627\u0644\u0627\u0633\u062A\u062B\u0646\u0627\u0621: \u0627\u0644\u0634\u0631\u0648\u0637 \u0627\u0644\u0623\u0631\u0628\u0639\u0629"
      ],
      theme: [
        "\u5F52\u4FE1\u3001\u884C\u5584\u3001\u4EE5\u771F\u7406\u4E92\u52C9\u3001\u4EE5\u575A\u5FCD\u4E92\u52C9\u2014\u2014\u56DB\u4E2A\u6761\u4EF6\u4F9D\u6B21\u5E76\u5217\u3002",
        "Belief, righteous deeds, mutual counsel to truth, mutual counsel to patience \u2013 four conditions in sequence.",
        "\u0627\u0644\u0625\u064A\u0645\u0627\u0646 \u0648\u0627\u0644\u0639\u0645\u0644 \u0627\u0644\u0635\u0627\u0644\u062D \u0648\u0627\u0644\u062A\u0648\u0627\u0635\u064A \u0628\u0627\u0644\u062D\u0642 \u0648\u0627\u0644\u062A\u0648\u0627\u0635\u064A \u0628\u0627\u0644\u0635\u0628\u0631 \u2013 \u0623\u0631\u0628\u0639\u0629 \u0634\u0631\u0648\u0637 \u0645\u062A\u062A\u0627\u0628\u0639\u0629."
      ],
      persons: [],
      concepts: [
        [
          "\u5F52\u4FE1\u4E0E\u884C\u5584",
          "Faith and righteous deeds",
          "\u0627\u0644\u0625\u064A\u0645\u0627\u0646 \u0648\u0627\u0644\u0639\u0645\u0644 \u0627\u0644\u0635\u0627\u0644\u062D"
        ],
        [
          "\u4EE5\u771F\u7406\u4E92\u52C9",
          "Counsel to truth",
          "\u0627\u0644\u062A\u0648\u0627\u0635\u064A \u0628\u0627\u0644\u062D\u0642"
        ],
        [
          "\u4EE5\u575A\u5FCD\u4E92\u52C9",
          "Counsel to patience",
          "\u0627\u0644\u062A\u0648\u0627\u0635\u064A \u0628\u0627\u0644\u0635\u0628\u0631"
        ]
      ]
    },
    {
      chapter: 108,
      from: 1,
      to: 3,
      title: [
        "\u6069\u8D50\u4E0E\u56DE\u5E94",
        "The gift and the response",
        "\u0627\u0644\u0639\u0637\u0627\u0621 \u0648\u0627\u0644\u0627\u0633\u062A\u062C\u0627\u0628\u0629"
      ],
      theme: [
        "\u8D50\u4E88\u591A\u798F \u2192 \u793C\u62DC\u4E0E\u5BB0\u7272 \u2192 \u618E\u6068\u8005\u624D\u662F\u65AD\u7EDD\u8005\u3002",
        "The gift of abundance, the response of prayer and sacrifice, and the judgement that the hater is the one cut off.",
        "\u0639\u0637\u0627\u0621 \u0627\u0644\u0643\u0648\u062B\u0631\u060C \u062B\u0645 \u0627\u0644\u0635\u0644\u0627\u0629 \u0648\u0627\u0644\u0646\u062D\u0631\u060C \u062B\u0645 \u0627\u0644\u062D\u0643\u0645 \u0628\u0623\u0646 \u0627\u0644\u0634\u0627\u0646\u0626 \u0647\u0648 \u0627\u0644\u0623\u0628\u062A\u0631."
      ],
      persons: [],
      concepts: [
        [
          "\u591A\u798F",
          "Abundance (al-Kawthar)",
          "\u0627\u0644\u0643\u0648\u062B\u0631"
        ],
        [
          "\u793C\u62DC\u4E0E\u5BB0\u7272",
          "Prayer and sacrifice",
          "\u0627\u0644\u0635\u0644\u0627\u0629 \u0648\u0627\u0644\u0646\u062D\u0631"
        ]
      ]
    },
    {
      chapter: 112,
      from: 1,
      to: 2,
      title: [
        "\u80AF\u5B9A\uFF1A\u72EC\u4E00\u4E0E\u88AB\u4EF0\u8D56",
        "Affirmation: One and Eternal Refuge",
        "\u0627\u0644\u0625\u062B\u0628\u0627\u062A: \u0623\u062D\u062F \u0648\u0635\u0645\u062F"
      ],
      theme: [
        "\u4E24\u4E2A\u80AF\u5B9A\u7684\u79F0\u8C13\uFF1A\u72EC\u4E00\u3001\u4E07\u7269\u6240\u4EF0\u8D56\u3002",
        "Two affirmed attributes: the One, the Eternal Refuge.",
        "\u0635\u0641\u062A\u0627\u0646 \u0645\u062B\u0628\u062A\u062A\u0627\u0646: \u0623\u062D\u062F\u060C \u0627\u0644\u0635\u0645\u062F."
      ],
      persons: [],
      concepts: [
        [
          "\u72EC\u4E00",
          "Oneness",
          "\u0627\u0644\u0623\u062D\u062F\u064A\u0629"
        ],
        [
          "\u88AB\u4EF0\u8D56\u8005",
          "The Eternal Refuge",
          "\u0627\u0644\u0635\u0645\u062F"
        ]
      ]
    },
    {
      chapter: 112,
      from: 3,
      to: 4,
      title: [
        "\u5426\u5B9A\uFF1A\u4E0D\u751F\u4E0D\u88AB\u751F\u3001\u65E0\u5339\u654C",
        "Negation: neither begets nor is begotten, no equal",
        "\u0627\u0644\u0646\u0641\u064A: \u0644\u0645 \u064A\u0644\u062F \u0648\u0644\u0645 \u064A\u0648\u0644\u062F \u0648\u0644\u0627 \u0643\u0641\u0648"
      ],
      theme: [
        "\u4E09\u4E2A\u5426\u5B9A\u53E5\u6392\u9664\u4E00\u5207\u76F8\u4F3C\u4E0E\u5339\u654C\u3002",
        "Three negations exclude any likeness or equal.",
        "\u062B\u0644\u0627\u062B\u0629 \u0646\u0641\u064A \u062A\u0633\u062A\u0628\u0639\u062F \u0643\u0644 \u0645\u062B\u064A\u0644 \u0648\u0646\u0638\u064A\u0631."
      ],
      persons: [],
      concepts: [
        [
          "\u65E0\u5339\u654C",
          "No equal",
          "\u0646\u0641\u064A \u0627\u0644\u0643\u0641\u0621"
        ]
      ]
    },
    {
      chapter: 113,
      from: 1,
      to: 1,
      title: [
        "\u6C42\u5E87\u62A4\u7684\u5BF9\u8C61",
        "The One with whom refuge is sought",
        "\u0627\u0644\u0645\u0633\u062A\u0639\u0627\u0630 \u0628\u0647"
      ],
      theme: [
        "\u5411\u66D9\u5149\u4E4B\u4E3B\u6C42\u5E87\u62A4\u3002",
        "Seeking refuge with the Lord of daybreak.",
        "\u0627\u0644\u0627\u0633\u062A\u0639\u0627\u0630\u0629 \u0628\u0631\u0628 \u0627\u0644\u0641\u0644\u0642."
      ],
      persons: [],
      concepts: [
        [
          "\u6C42\u5E87\u62A4",
          "Seeking refuge",
          "\u0627\u0644\u0627\u0633\u062A\u0639\u0627\u0630\u0629"
        ]
      ]
    },
    {
      chapter: 113,
      from: 2,
      to: 5,
      title: [
        "\u56DB\u79CD\u6076",
        "Four kinds of harm",
        "\u0623\u0646\u0648\u0627\u0639 \u0627\u0644\u0634\u0631 \u0627\u0644\u0623\u0631\u0628\u0639\u0629"
      ],
      theme: [
        "\u53D7\u9020\u7269\u4E4B\u6076\u3001\u9ED1\u591C\u4E4B\u6076\u3001\u5439\u7ED3\u8005\u4E4B\u6076\u3001\u5AC9\u5992\u8005\u4E4B\u6076\u2014\u2014\u4E09\u8282\u4EE5\u300C\u0648\u064E\u0645\u0650\u0646 \u0634\u064E\u0631\u0650\u0651\u300D\u91CD\u590D\u5F00\u5934\u3002",
        'The harm of what is created, of darkness, of those who blow on knots, and of the envier \u2013 three verses open with "\u0648\u064E\u0645\u0650\u0646 \u0634\u064E\u0631\u0650\u0651".',
        "\u0634\u0631 \u0645\u0627 \u062E\u0644\u0642\u060C \u0634\u0631 \u0627\u0644\u063A\u0627\u0633\u0642\u060C \u0634\u0631 \u0627\u0644\u0646\u0641\u0627\u062B\u0627\u062A\u060C \u0634\u0631 \u0627\u0644\u062D\u0627\u0633\u062F \u2013 \u062B\u0644\u0627\u062B \u0622\u064A\u0627\u062A \u062A\u0628\u062F\u0623 \u0628\u0640\xAB\u0648\u064E\u0645\u0650\u0646 \u0634\u064E\u0631\u0650\u0651\xBB."
      ],
      persons: [],
      concepts: [
        [
          "\u91CD\u590D\u7ED3\u6784\u300C\u0648\u064E\u0645\u0650\u0646 \u0634\u064E\u0631\u0650\u0651\u300D",
          'Repeated opening "\u0648\u064E\u0645\u0650\u0646 \u0634\u064E\u0631\u0650\u0651"',
          "\u0627\u0644\u0628\u0646\u064A\u0629 \u0627\u0644\u0645\u062A\u0643\u0631\u0631\u0629 \xAB\u0648\u064E\u0645\u0650\u0646 \u0634\u064E\u0631\u0650\u0651\xBB"
        ],
        [
          "\u5AC9\u5992",
          "Envy",
          "\u0627\u0644\u062D\u0633\u062F"
        ]
      ]
    },
    {
      chapter: 114,
      from: 1,
      to: 3,
      title: [
        "\u4E09\u4E2A\u9012\u8FDB\u7684\u79F0\u8C13",
        "Three ascending titles",
        "\u062B\u0644\u0627\u062B\u0629 \u0623\u0648\u0635\u0627\u0641 \u0645\u062A\u062F\u0631\u062C\u0629"
      ],
      theme: [
        "\u4E16\u4EBA\u7684\u4E3B\u3001\u4E16\u4EBA\u7684\u541B\u738B\u3001\u4E16\u4EBA\u7684\u795E\u3002",
        "Lord of mankind, King of mankind, God of mankind.",
        "\u0631\u0628 \u0627\u0644\u0646\u0627\u0633\u060C \u0645\u0644\u0643 \u0627\u0644\u0646\u0627\u0633\u060C \u0625\u0644\u0647 \u0627\u0644\u0646\u0627\u0633."
      ],
      persons: [],
      concepts: [
        [
          "\u4E3B\u2014\u541B\u738B\u2014\u795E\u7684\u9012\u8FDB",
          "Lord\u2013King\u2013God progression",
          "\u062A\u062F\u0631\u062C \u0631\u0628\u2013\u0645\u0644\u0643\u2013\u0625\u0644\u0647"
        ]
      ]
    },
    {
      chapter: 114,
      from: 4,
      to: 6,
      title: [
        "\u6240\u6C42\u5E87\u62A4\u7684\u6076",
        "The harm sought refuge from",
        "\u0627\u0644\u0634\u0631 \u0627\u0644\u0645\u0633\u062A\u0639\u0627\u0630 \u0645\u0646\u0647"
      ],
      theme: [
        "\u6F5C\u4F0F\u7684\u6559\u5506\u8005\uFF0C\u5728\u4EBA\u5FC3\u4E2D\u4F4E\u8BED\uFF0C\u6765\u81EA\u7CBE\u7075\u4E0E\u4EBA\u3002",
        "The withdrawing whisperer who whispers in people's hearts, from jinn and men.",
        "\u0627\u0644\u0648\u0633\u0648\u0627\u0633 \u0627\u0644\u062E\u0646\u0627\u0633 \u0627\u0644\u0630\u064A \u064A\u0648\u0633\u0648\u0633 \u0641\u064A \u0635\u062F\u0648\u0631 \u0627\u0644\u0646\u0627\u0633 \u0645\u0646 \u0627\u0644\u062C\u0646\u0629 \u0648\u0627\u0644\u0646\u0627\u0633."
      ],
      persons: [],
      concepts: [
        [
          "\u6559\u5506\u8005",
          "The whisperer",
          "\u0627\u0644\u0648\u0633\u0648\u0627\u0633"
        ],
        [
          "\u7CBE\u7075\u4E0E\u4EBA",
          "Jinn and men",
          "\u0627\u0644\u062C\u0646\u0629 \u0648\u0627\u0644\u0646\u0627\u0633"
        ]
      ]
    },
    {
      chapter: 49,
      from: 1,
      to: 5,
      title: [
        "\u5BF9\u5148\u77E5\u7684\u793C\u8282",
        "Etiquette before the Prophet",
        "\u0627\u0644\u0623\u062F\u0628 \u0645\u0639 \u0627\u0644\u0646\u0628\u064A"
      ],
      theme: [
        "\u4E0D\u62A2\u5148\u3001\u4E0D\u9AD8\u58F0\u3001\u538B\u4F4E\u58F0\u97F3\u8005\u53D7\u8D5E\u3001\u5728\u5BDD\u5BA4\u5916\u547C\u558A\u8005\u4E0D\u660E\u7406\u3001\u8010\u5FC3\u7B49\u5F85\u66F4\u597D\u3002",
        "Do not go ahead, do not raise voices; those who lower their voices are praised; calling from outside the rooms shows lack of understanding; waiting is better.",
        "\u0639\u062F\u0645 \u0627\u0644\u062A\u0642\u062F\u0645 \u0648\u0631\u0641\u0639 \u0627\u0644\u0635\u0648\u062A\u060C \u0645\u062F\u062D \u0645\u0646 \u064A\u063A\u0636 \u0635\u0648\u062A\u0647\u060C \u0630\u0645 \u0645\u0646 \u064A\u0646\u0627\u062F\u064A \u0645\u0646 \u0648\u0631\u0627\u0621 \u0627\u0644\u062D\u062C\u0631\u0627\u062A\u060C \u0648\u0641\u0636\u0644 \u0627\u0644\u0635\u0628\u0631."
      ],
      persons: [],
      concepts: [
        [
          "\u793C\u8282\u4E0E\u5C0A\u91CD",
          "Etiquette and respect",
          "\u0627\u0644\u0623\u062F\u0628 \u0648\u0627\u0644\u0627\u062D\u062A\u0631\u0627\u0645"
        ],
        [
          "\u538B\u4F4E\u58F0\u97F3",
          "Lowering the voice",
          "\u063A\u0636 \u0627\u0644\u0635\u0648\u062A"
        ]
      ]
    },
    {
      chapter: 49,
      from: 6,
      to: 8,
      title: [
        "\u6838\u5B9E\u6D88\u606F",
        "Verifying news",
        "\u0627\u0644\u062A\u062B\u0628\u062A \u0645\u0646 \u0627\u0644\u0623\u062E\u0628\u0627\u0631"
      ],
      theme: [
        "\u6096\u9006\u8005\u5E26\u6765\u6D88\u606F\u8981\u6838\u5B9E\uFF0C\u4EE5\u514D\u56E0\u65E0\u77E5\u4F24\u5BB3\u4ED6\u4EBA\u800C\u540E\u6094\uFF1B\u4FE1\u4EF0\u88AB\u771F\u4E3B\u88C5\u9970\u5728\u4FE1\u58EB\u5FC3\u4E2D\u3002",
        "Verify news brought by a wrongdoer lest you harm people in ignorance; faith has been made beloved in the believers' hearts.",
        "\u0627\u0644\u062A\u062B\u0628\u062A \u0645\u0646 \u062E\u0628\u0631 \u0627\u0644\u0641\u0627\u0633\u0642 \u062D\u062A\u0649 \u0644\u0627 \u064A\u064F\u0635\u0627\u0628 \u0642\u0648\u0645 \u0628\u062C\u0647\u0627\u0644\u0629\u060C \u0648\u062A\u062D\u0628\u064A\u0628 \u0627\u0644\u0625\u064A\u0645\u0627\u0646 \u0641\u064A \u0627\u0644\u0642\u0644\u0648\u0628."
      ],
      persons: [],
      concepts: [
        [
          "\u6838\u5B9E\u6D88\u606F",
          "Verification of news",
          "\u0627\u0644\u062A\u062B\u0628\u062A \u0645\u0646 \u0627\u0644\u062E\u0628\u0631"
        ],
        [
          "\u4FE1\u4EF0\u7684\u88C5\u9970",
          "Faith made beloved",
          "\u062A\u062D\u0628\u064A\u0628 \u0627\u0644\u0625\u064A\u0645\u0627\u0646"
        ]
      ]
    },
    {
      chapter: 49,
      from: 9,
      to: 10,
      title: [
        "\u548C\u89E3\u4E0E\u5144\u5F1F\u60C5\u8C0A",
        "Reconciliation and brotherhood",
        "\u0627\u0644\u0625\u0635\u0644\u0627\u062D \u0648\u0627\u0644\u0623\u062E\u0648\u0629"
      ],
      theme: [
        "\u4E24\u4F19\u4FE1\u58EB\u4E89\u6597\u5F53\u8C03\u89E3\uFF0C\u4EE5\u516C\u6B63\u5904\u7406\uFF1B\u4FE1\u58EB\u7686\u4E3A\u5144\u5F1F\u3002",
        "When two groups of believers fight, make peace justly; the believers are brothers.",
        "\u0627\u0644\u0625\u0635\u0644\u0627\u062D \u0628\u064A\u0646 \u0627\u0644\u0637\u0627\u0626\u0641\u062A\u064A\u0646 \u0628\u0627\u0644\u0639\u062F\u0644\u060C \u0648\u0627\u0644\u0645\u0624\u0645\u0646\u0648\u0646 \u0625\u062E\u0648\u0629."
      ],
      persons: [],
      concepts: [
        [
          "\u548C\u89E3",
          "Reconciliation",
          "\u0627\u0644\u0625\u0635\u0644\u0627\u062D"
        ],
        [
          "\u516C\u6B63",
          "Justice",
          "\u0627\u0644\u0639\u062F\u0644"
        ],
        [
          "\u4FE1\u58EB\u7684\u5144\u5F1F\u60C5\u8C0A",
          "Brotherhood of believers",
          "\u0623\u062E\u0648\u0629 \u0627\u0644\u0645\u0624\u0645\u0646\u064A\u0646"
        ]
      ]
    },
    {
      chapter: 49,
      from: 11,
      to: 13,
      title: [
        "\u7981\u6B62\u5632\u7B11\u3001\u731C\u7591\u4E0E\u80CC\u8C08\uFF1B\u4EBA\u7C7B\u5E73\u7B49",
        "No mockery, suspicion or backbiting; human equality",
        "\u0627\u0644\u0646\u0647\u064A \u0639\u0646 \u0627\u0644\u0633\u062E\u0631\u064A\u0629 \u0648\u0627\u0644\u0638\u0646 \u0648\u0627\u0644\u063A\u064A\u0628\u0629\u061B \u0645\u0633\u0627\u0648\u0627\u0629 \u0627\u0644\u0628\u0634\u0631"
      ],
      theme: [
        "\u7981\u6B62\u5632\u7B11\u3001\u6307\u8D23\u3001\u53D6\u7EF0\u53F7\u3001\u8FC7\u5206\u731C\u7591\u3001\u7AA5\u63A2\u3001\u80CC\u8C08\uFF1B\u4EBA\u7C7B\u88AB\u9020\u4E3A\u6C11\u65CF\u4E0E\u90E8\u843D\u4EE5\u4FBF\u4E92\u76F8\u8BA4\u8BC6\uFF0C\u6700\u5C0A\u8D35\u8005\u662F\u6700\u656C\u754F\u8005\u3002",
        "Prohibition of mockery, fault-finding, nicknames, excessive suspicion, spying and backbiting; humanity was made into peoples and tribes to know one another, and the most noble is the most righteous.",
        "\u0627\u0644\u0646\u0647\u064A \u0639\u0646 \u0627\u0644\u0633\u062E\u0631\u064A\u0629 \u0648\u0627\u0644\u0644\u0645\u0632 \u0648\u0627\u0644\u062A\u0646\u0627\u0628\u0632 \u0648\u0627\u0644\u0638\u0646 \u0648\u0627\u0644\u062A\u062C\u0633\u0633 \u0648\u0627\u0644\u063A\u064A\u0628\u0629\u061B \u062E\u064F\u0644\u0642 \u0627\u0644\u0646\u0627\u0633 \u0634\u0639\u0648\u0628\u064B\u0627 \u0648\u0642\u0628\u0627\u0626\u0644 \u0644\u0644\u062A\u0639\u0627\u0631\u0641\u060C \u0648\u0623\u0643\u0631\u0645\u0647\u0645 \u0623\u062A\u0642\u0627\u0647\u0645."
      ],
      persons: [],
      concepts: [
        [
          "\u7981\u6B62\u5632\u7B11\u4E0E\u7EF0\u53F7",
          "No mockery or nicknames",
          "\u0627\u0644\u0646\u0647\u064A \u0639\u0646 \u0627\u0644\u0633\u062E\u0631\u064A\u0629 \u0648\u0627\u0644\u062A\u0646\u0627\u0628\u0632"
        ],
        [
          "\u731C\u7591\u3001\u7AA5\u63A2\u3001\u80CC\u8C08",
          "Suspicion, spying, backbiting",
          "\u0627\u0644\u0638\u0646 \u0648\u0627\u0644\u062A\u062C\u0633\u0633 \u0648\u0627\u0644\u063A\u064A\u0628\u0629"
        ],
        [
          "\u4EBA\u7C7B\u5E73\u7B49\u4E0E\u656C\u754F",
          "Human equality and righteousness",
          "\u0627\u0644\u0645\u0633\u0627\u0648\u0627\u0629 \u0648\u0627\u0644\u062A\u0642\u0648\u0649"
        ]
      ]
    },
    {
      chapter: 49,
      from: 14,
      to: 18,
      title: [
        "\u4FE1\u4EF0\u4E0E\u5F52\u987A\u7684\u533A\u522B",
        "The difference between faith and submission",
        "\u0627\u0644\u0641\u0631\u0642 \u0628\u064A\u0646 \u0627\u0644\u0625\u064A\u0645\u0627\u0646 \u0648\u0627\u0644\u0625\u0633\u0644\u0627\u0645"
      ],
      theme: [
        "\u6E38\u7267\u4EBA\u8BF4\u300C\u6211\u4EEC\u5F52\u4FE1\u4E86\u300D\uFF0C\u5E94\u8BF4\u300C\u6211\u4EEC\u5F52\u987A\u4E86\u300D\uFF1B\u771F\u4FE1\u58EB\u662F\u5F52\u4FE1\u4E14\u4E0D\u6000\u7591\u5E76\u594B\u6597\u8005\uFF1B\u4E0D\u8981\u4EE5\u5F52\u987A\u65BD\u6069\u4E8E\u5148\u77E5\uFF1B\u771F\u4E3B\u77E5\u5E7D\u7384\u3002",
        'The desert Arabs say "we believe" but should say "we have submitted"; true believers believe without doubt and strive; do not count your submission as a favour; God knows the unseen.',
        "\u0642\u0648\u0644 \u0627\u0644\u0623\u0639\u0631\u0627\u0628 \u0622\u0645\u0646\u0651\u0627 \u0648\u062D\u0642\u0647 \u0623\u0633\u0644\u0645\u0646\u0627\u061B \u0627\u0644\u0645\u0624\u0645\u0646\u0648\u0646 \u062D\u0642\u064B\u0627 \u0645\u0646 \u0622\u0645\u0646\u0648\u0627 \u0648\u0644\u0645 \u064A\u0631\u062A\u0627\u0628\u0648\u0627 \u0648\u062C\u0627\u0647\u062F\u0648\u0627\u061B \u0644\u0627 \u064A\u064F\u0645\u0646\u0651 \u0628\u0627\u0644\u0625\u0633\u0644\u0627\u0645\u061B \u0627\u0644\u0644\u0647 \u064A\u0639\u0644\u0645 \u0627\u0644\u063A\u064A\u0628."
      ],
      persons: [],
      concepts: [
        [
          "\u4FE1\u4EF0\u4E0E\u5F52\u987A",
          "Faith versus submission",
          "\u0627\u0644\u0625\u064A\u0645\u0627\u0646 \u0648\u0627\u0644\u0625\u0633\u0644\u0627\u0645"
        ],
        [
          "\u771F\u8BDA\u7684\u4FE1\u58EB",
          "The truthful believers",
          "\u0627\u0644\u0635\u0627\u062F\u0642\u0648\u0646"
        ]
      ]
    },
    {
      chapter: 67,
      from: 1,
      to: 5,
      title: [
        "\u4E3B\u6743\u4E0E\u521B\u9020\u7684\u5B8C\u7F8E",
        "Sovereignty and flawless creation",
        "\u0627\u0644\u0645\u0644\u0643 \u0648\u0625\u062A\u0642\u0627\u0646 \u0627\u0644\u062E\u0644\u0642"
      ],
      theme: [
        "\u4E3B\u6743\u5728\u4E3B\u624B\u4E2D\uFF1B\u521B\u9020\u6B7B\u4E0E\u751F\u4EE5\u8003\u9A8C\u8C01\u884C\u4E3A\u6700\u597D\uFF1B\u4E03\u5C42\u5929\u6BEB\u65E0\u53C2\u5DEE\uFF1B\u661F\u8FB0\u88C5\u9970\u5929\u7A7A\u3002",
        "Sovereignty is in His hand; death and life are created to test who is best in deed; seven heavens without flaw; stars adorn the sky.",
        "\u0627\u0644\u0645\u0644\u0643 \u0628\u064A\u062F \u0627\u0644\u0644\u0647\u061B \u062E\u0644\u0642 \u0627\u0644\u0645\u0648\u062A \u0648\u0627\u0644\u062D\u064A\u0627\u0629 \u0644\u0644\u0627\u0628\u062A\u0644\u0627\u0621\u061B \u0633\u0628\u0639 \u0633\u0645\u0627\u0648\u0627\u062A \u0628\u0644\u0627 \u062A\u0641\u0627\u0648\u062A\u061B \u0632\u064A\u0646\u0629 \u0627\u0644\u0633\u0645\u0627\u0621 \u0628\u0627\u0644\u0645\u0635\u0627\u0628\u064A\u062D."
      ],
      persons: [],
      concepts: [
        [
          "\u4E3B\u6743",
          "Sovereignty",
          "\u0627\u0644\u0645\u0644\u0643"
        ],
        [
          "\u751F\u6B7B\u4E3A\u8003\u9A8C",
          "Life and death as a test",
          "\u0627\u0644\u0627\u0628\u062A\u0644\u0627\u0621 \u0628\u0627\u0644\u0645\u0648\u062A \u0648\u0627\u0644\u062D\u064A\u0627\u0629"
        ],
        [
          "\u521B\u9020\u65E0\u7F3A\u9677",
          "Flawless creation",
          "\u0625\u062A\u0642\u0627\u0646 \u0627\u0644\u062E\u0644\u0642"
        ]
      ]
    },
    {
      chapter: 67,
      from: 6,
      to: 11,
      title: [
        "\u5426\u8BA4\u8005\u7684\u7ED3\u5C40\u4E0E\u5FCF\u6094",
        "The fate and confession of deniers",
        "\u0645\u0635\u064A\u0631 \u0627\u0644\u0645\u0643\u0630\u0628\u064A\u0646 \u0648\u0627\u0639\u062A\u0631\u0627\u0641\u0647\u0645"
      ],
      theme: [
        "\u706B\u72F1\u7684\u60C5\u666F\uFF1B\u770B\u5B88\u8005\u7684\u8D28\u95EE\u300C\u96BE\u9053\u6CA1\u6709\u8B66\u544A\u8005\u6765\u8FC7\u5417\u300D\uFF1B\u5426\u8BA4\u8005\u627F\u8BA4\u81EA\u5DF1\u4E0D\u542C\u4E0D\u601D\u3002",
        'The scene of Hell; the keepers ask "did no warner come to you?"; the deniers confess they neither listened nor reasoned.',
        "\u0645\u0634\u0647\u062F \u062C\u0647\u0646\u0645\u061B \u0633\u0624\u0627\u0644 \u0627\u0644\u062E\u0632\u0646\u0629 \xAB\u0623\u0644\u0645 \u064A\u0623\u062A\u0643\u0645 \u0646\u0630\u064A\u0631\xBB\u061B \u0627\u0639\u062A\u0631\u0627\u0641 \u0627\u0644\u0645\u0643\u0630\u0628\u064A\u0646 \u0628\u0623\u0646\u0647\u0645 \u0644\u0645 \u064A\u0633\u0645\u0639\u0648\u0627 \u0648\u0644\u0645 \u064A\u0639\u0642\u0644\u0648\u0627."
      ],
      persons: [],
      concepts: [
        [
          "\u8B66\u544A\u8005",
          "The warner",
          "\u0627\u0644\u0646\u0630\u064A\u0631"
        ],
        [
          "\u542C\u4E0E\u601D",
          "Listening and reasoning",
          "\u0627\u0644\u0633\u0645\u0639 \u0648\u0627\u0644\u0639\u0642\u0644"
        ]
      ]
    },
    {
      chapter: 67,
      from: 12,
      to: 15,
      title: [
        "\u754F\u60E7\u5E7D\u7384\u4E0E\u88AB\u9A6F\u670D\u7684\u5927\u5730",
        "Fear of the unseen and the subdued earth",
        "\u0627\u0644\u062E\u0634\u064A\u0629 \u0628\u0627\u0644\u063A\u064A\u0628 \u0648\u0627\u0644\u0623\u0631\u0636 \u0627\u0644\u0630\u0644\u0648\u0644"
      ],
      theme: [
        "\u672A\u89C1\u800C\u754F\u60E7\u8005\u5F97\u9976\u6055\uFF1B\u9690\u85CF\u6216\u516C\u5F00\u7686\u88AB\u77E5\u6653\uFF1B\u521B\u9020\u8005\u5C82\u80FD\u4E0D\u77E5\uFF1B\u5927\u5730\u88AB\u9A6F\u670D\u4F9B\u884C\u8D70\u4E0E\u83B7\u53D6\u7ED9\u517B\u3002",
        "Those who fear the unseen are forgiven; hidden or open speech is known; would the Creator not know; the earth is made subservient for walking and provision.",
        "\u0645\u063A\u0641\u0631\u0629 \u0644\u0645\u0646 \u064A\u062E\u0634\u0649 \u0631\u0628\u0647 \u0628\u0627\u0644\u063A\u064A\u0628\u061B \u0627\u0644\u0633\u0631 \u0648\u0627\u0644\u062C\u0647\u0631 \u0645\u0639\u0644\u0648\u0645\u0627\u0646\u061B \u0623\u0644\u0627 \u064A\u0639\u0644\u0645 \u0645\u0646 \u062E\u0644\u0642\u061B \u0627\u0644\u0623\u0631\u0636 \u0630\u0644\u0648\u0644 \u0644\u0644\u0645\u0634\u064A \u0648\u0627\u0644\u0631\u0632\u0642."
      ],
      persons: [],
      concepts: [
        [
          "\u754F\u60E7\u5E7D\u7384",
          "Fear of the unseen",
          "\u0627\u0644\u062E\u0634\u064A\u0629 \u0628\u0627\u0644\u063A\u064A\u0628"
        ],
        [
          "\u521B\u9020\u8005\u7684\u5168\u77E5",
          "The Creator's knowledge",
          "\u0639\u0644\u0645 \u0627\u0644\u062E\u0627\u0644\u0642"
        ],
        [
          "\u5927\u5730\u7684\u9A6F\u670D",
          "The subdued earth",
          "\u0627\u0644\u0623\u0631\u0636 \u0627\u0644\u0630\u0644\u0648\u0644"
        ]
      ]
    },
    {
      chapter: 67,
      from: 16,
      to: 22,
      title: [
        "\u8B66\u544A\u4E0E\u4E24\u79CD\u884C\u8D70\u8005\u7684\u6BD4\u55BB",
        "Warnings and the parable of two walkers",
        "\u0627\u0644\u0625\u0646\u0630\u0627\u0631 \u0648\u0645\u062B\u0644 \u0627\u0644\u0645\u0627\u0634\u064A\u064E\u064A\u0646"
      ],
      theme: [
        "\u5730\u9677\u4E0E\u98DE\u77F3\u7684\u8B66\u544A\uFF1B\u9E1F\u88AB\u81F3\u4EC1\u4E3B\u6258\u4F4F\uFF1B\u8C01\u80FD\u63F4\u52A9\u4E0E\u4F9B\u7ED9\uFF1B\u4FEF\u4F0F\u800C\u884C\u8005\u4E0E\u7AEF\u6B63\u800C\u884C\u8005\u7684\u5BF9\u6BD4\u3002",
        "Warnings of the earth swallowing and stones from the sky; birds held by the Most Gracious; who can help and provide; the one who walks on his face versus the one who walks upright.",
        "\u0627\u0644\u0625\u0646\u0630\u0627\u0631 \u0628\u0627\u0644\u062E\u0633\u0641 \u0648\u0627\u0644\u062D\u0627\u0635\u0628\u061B \u0627\u0644\u0637\u064A\u0631 \u064A\u0645\u0633\u0643\u0647\u0627 \u0627\u0644\u0631\u062D\u0645\u0646\u061B \u0645\u0646 \u064A\u0646\u0635\u0631 \u0648\u064A\u0631\u0632\u0642\u061B \u0645\u062B\u0644 \u0645\u0646 \u064A\u0645\u0634\u064A \u0645\u0643\u0628\u064B\u0627 \u0648\u0645\u0646 \u064A\u0645\u0634\u064A \u0633\u0648\u064A\u064B\u0627."
      ],
      persons: [],
      concepts: [
        [
          "\u8B66\u544A",
          "Warning",
          "\u0627\u0644\u0625\u0646\u0630\u0627\u0631"
        ],
        [
          "\u9E1F\u7684\u8FF9\u8C61",
          "The sign of the birds",
          "\u0622\u064A\u0629 \u0627\u0644\u0637\u064A\u0631"
        ],
        [
          "\u4E24\u79CD\u884C\u8D70\u8005",
          "Two walkers",
          "\u0627\u0644\u0645\u0627\u0634\u064A\u0627\u0646"
        ]
      ]
    },
    {
      chapter: 67,
      from: 23,
      to: 27,
      title: [
        "\u611F\u5B98\u7684\u521B\u9020\u4E0E\u590D\u6D3B\u7684\u5141\u8BFA",
        "The creation of the senses and the promise of resurrection",
        "\u062E\u0644\u0642 \u0627\u0644\u062D\u0648\u0627\u0633 \u0648\u0648\u0639\u062F \u0627\u0644\u062D\u0634\u0631"
      ],
      theme: [
        "\u542C\u89C9\u3001\u89C6\u89C9\u4E0E\u5FC3\u88AB\u521B\u9020\u800C\u5C11\u6709\u4EBA\u611F\u8C22\uFF1B\u88AB\u7E41\u884D\u4E8E\u5927\u5730\u5E76\u5C06\u88AB\u96C6\u5408\uFF1B\u5426\u8BA4\u8005\u95EE\u5141\u8BFA\u4F55\u65F6\uFF1B\u89C1\u5230\u65F6\u9762\u5BB9\u53D8\u8272\u3002",
        "Hearing, sight and hearts were created yet few give thanks; spread on the earth and to be gathered; deniers ask when the promise is; when they see it their faces darken.",
        "\u062E\u0644\u0642 \u0627\u0644\u0633\u0645\u0639 \u0648\u0627\u0644\u0623\u0628\u0635\u0627\u0631 \u0648\u0627\u0644\u0623\u0641\u0626\u062F\u0629 \u0648\u0642\u0644\u0629 \u0627\u0644\u0634\u0643\u0631\u061B \u0627\u0644\u0630\u0631\u0621 \u0641\u064A \u0627\u0644\u0623\u0631\u0636 \u0648\u0627\u0644\u062D\u0634\u0631\u061B \u0633\u0624\u0627\u0644 \u0627\u0644\u0645\u0643\u0630\u0628\u064A\u0646 \u0639\u0646 \u0627\u0644\u0648\u0639\u062F\u061B \u0633\u0648\u0621 \u0648\u062C\u0648\u0647\u0647\u0645 \u0639\u0646\u062F \u0631\u0624\u064A\u062A\u0647."
      ],
      persons: [],
      concepts: [
        [
          "\u611F\u5B98\u4E0E\u611F\u8C22",
          "Senses and gratitude",
          "\u0627\u0644\u062D\u0648\u0627\u0633 \u0648\u0627\u0644\u0634\u0643\u0631"
        ],
        [
          "\u590D\u6D3B\u4E0E\u96C6\u5408",
          "Resurrection and gathering",
          "\u0627\u0644\u062D\u0634\u0631"
        ]
      ]
    },
    {
      chapter: 67,
      from: 28,
      to: 30,
      title: [
        "\u7ED3\u8BED\uFF1A\u6258\u9760\u4E0E\u6C34\u7684\u53CD\u95EE",
        "Conclusion: reliance and the question of water",
        "\u0627\u0644\u062E\u0627\u062A\u0645\u0629: \u0627\u0644\u062A\u0648\u0643\u0644 \u0648\u0633\u0624\u0627\u0644 \u0627\u0644\u0645\u0627\u0621"
      ],
      theme: [
        "\u65E0\u8BBA\u5148\u77E5\u88AB\u6BC1\u706D\u6216\u88AB\u6148\u60AF\uFF0C\u8C01\u80FD\u4FDD\u62A4\u4E0D\u4FE1\u8005\uFF1B\u6211\u4EEC\u4FE1\u4EF0\u5E76\u6258\u9760\u81F3\u4EC1\u4E3B\uFF1B\u82E5\u6C34\u6E17\u5165\u5730\u4E0B\u8C01\u80FD\u5E26\u6765\u6D41\u6CC9\u3002",
        "Whether the Prophet is destroyed or shown mercy, who protects the disbelievers; we believe in and rely on the Most Gracious; if your water sank away, who would bring flowing water.",
        "\u0645\u0646 \u064A\u062C\u064A\u0631 \u0627\u0644\u0643\u0627\u0641\u0631\u064A\u0646\u061B \u0627\u0644\u0625\u064A\u0645\u0627\u0646 \u0628\u0627\u0644\u0631\u062D\u0645\u0646 \u0648\u0627\u0644\u062A\u0648\u0643\u0644 \u0639\u0644\u064A\u0647\u061B \u0645\u0646 \u064A\u0623\u062A\u064A \u0628\u0645\u0627\u0621 \u0645\u0639\u064A\u0646 \u0625\u0630\u0627 \u063A\u0627\u0631 \u0627\u0644\u0645\u0627\u0621."
      ],
      persons: [],
      concepts: [
        [
          "\u6258\u9760",
          "Reliance on God",
          "\u0627\u0644\u062A\u0648\u0643\u0644"
        ],
        [
          "\u6C34\u7684\u53CD\u95EE",
          "The question of water",
          "\u0633\u0624\u0627\u0644 \u0627\u0644\u0645\u0627\u0621"
        ]
      ]
    },
    {
      chapter: 55,
      from: 1,
      to: 13,
      title: [
        "\u6559\u5BFC\u4E0E\u81EA\u7136\u79E9\u5E8F",
        "Teaching and the natural order",
        "\u0627\u0644\u062A\u0639\u0644\u064A\u0645 \u0648\u0646\u0638\u0627\u0645 \u0627\u0644\u0643\u0648\u0646"
      ],
      theme: [
        "\u81F3\u4EC1\u4E3B\u6559\u6388\u53E4\u5170\u3001\u521B\u9020\u4EBA\u3001\u6559\u4ED6\u8868\u8FBE\uFF1B\u65E5\u6708\u4F9D\u5B9A\u6570\uFF0C\u661F\u6811\u53E9\u5934\uFF1B\u5929\u88AB\u5347\u8D77\u3001\u5929\u5E73\u88AB\u8BBE\u7F6E\uFF1B\u5927\u5730\u4E0E\u679C\u5B9E\u4E3A\u4F17\u751F\u800C\u8BBE\u3002",
        "The Most Gracious taught the Quran, created man and taught him expression; sun and moon by calculation, stars and trees prostrate; the sky raised and the balance set; the earth and its fruits for all creatures.",
        "\u0627\u0644\u0631\u062D\u0645\u0646 \u0639\u0644\u0651\u0645 \u0627\u0644\u0642\u0631\u0622\u0646 \u0648\u062E\u0644\u0642 \u0627\u0644\u0625\u0646\u0633\u0627\u0646 \u0648\u0639\u0644\u0651\u0645\u0647 \u0627\u0644\u0628\u064A\u0627\u0646\u061B \u0627\u0644\u0634\u0645\u0633 \u0648\u0627\u0644\u0642\u0645\u0631 \u0628\u062D\u0633\u0628\u0627\u0646\u061B \u0631\u0641\u0639 \u0627\u0644\u0633\u0645\u0627\u0621 \u0648\u0648\u0636\u0639 \u0627\u0644\u0645\u064A\u0632\u0627\u0646\u061B \u0627\u0644\u0623\u0631\u0636 \u0648\u062B\u0645\u0627\u0631\u0647\u0627 \u0644\u0644\u0623\u0646\u0627\u0645."
      ],
      persons: [],
      concepts: [
        [
          "\u6559\u6388\u53E4\u5170\u4E0E\u8868\u8FBE",
          "Teaching the Quran and expression",
          "\u062A\u0639\u0644\u064A\u0645 \u0627\u0644\u0642\u0631\u0622\u0646 \u0648\u0627\u0644\u0628\u064A\u0627\u0646"
        ],
        [
          "\u5929\u5E73\u4E0E\u516C\u5E73",
          "The balance and justice",
          "\u0627\u0644\u0645\u064A\u0632\u0627\u0646 \u0648\u0627\u0644\u0642\u0633\u0637"
        ],
        [
          "\u5927\u5730\u7684\u6069\u5178",
          "Favours of the earth",
          "\u0646\u0639\u0645 \u0627\u0644\u0623\u0631\u0636"
        ]
      ]
    },
    {
      chapter: 55,
      from: 14,
      to: 25,
      title: [
        "\u4EBA\u4E0E\u7CBE\u7075\u7684\u521B\u9020\u3001\u4E24\u6D77\u4E0E\u8239\u53EA",
        "Creation of man and jinn, the two seas and ships",
        "\u062E\u0644\u0642 \u0627\u0644\u0625\u0646\u0633\u0627\u0646 \u0648\u0627\u0644\u062C\u0627\u0646 \u0648\u0627\u0644\u0628\u062D\u0631\u0627\u0646 \u0648\u0627\u0644\u0633\u0641\u0646"
      ],
      theme: [
        "\u4EBA\u7531\u5E72\u6CE5\u3001\u7CBE\u7075\u7531\u706B\u7130\u800C\u9020\uFF1B\u4E24\u4E2A\u4E1C\u65B9\u4E0E\u4E24\u4E2A\u897F\u65B9\u4E4B\u4E3B\uFF1B\u4E24\u6D77\u76F8\u9047\u800C\u6709\u5C4F\u969C\uFF1B\u73CD\u73E0\u4E0E\u73CA\u745A\uFF1B\u5982\u5C71\u7684\u8239\u53EA\u3002",
        "Man from clay, jinn from a smokeless flame; Lord of the two easts and two wests; the two seas meet with a barrier between; pearls and coral; ships like mountains.",
        "\u062E\u0644\u0642 \u0627\u0644\u0625\u0646\u0633\u0627\u0646 \u0645\u0646 \u0635\u0644\u0635\u0627\u0644 \u0648\u0627\u0644\u062C\u0627\u0646 \u0645\u0646 \u0645\u0627\u0631\u062C\u061B \u0631\u0628 \u0627\u0644\u0645\u0634\u0631\u0642\u064A\u0646 \u0648\u0627\u0644\u0645\u063A\u0631\u0628\u064A\u0646\u061B \u0627\u0644\u0628\u062D\u0631\u0627\u0646 \u0648\u0628\u064A\u0646\u0647\u0645\u0627 \u0628\u0631\u0632\u062E\u061B \u0627\u0644\u0644\u0624\u0644\u0624 \u0648\u0627\u0644\u0645\u0631\u062C\u0627\u0646\u061B \u0627\u0644\u0633\u0641\u0646 \u0643\u0627\u0644\u0623\u0639\u0644\u0627\u0645."
      ],
      persons: [],
      concepts: [
        [
          "\u4EBA\u4E0E\u7CBE\u7075\u7684\u9020\u5316",
          "Creation of man and jinn",
          "\u062E\u0644\u0642 \u0627\u0644\u0625\u0646\u0633\u0627\u0646 \u0648\u0627\u0644\u062C\u0627\u0646"
        ],
        [
          "\u4E24\u6D77\u4E0E\u5C4F\u969C",
          "The two seas and the barrier",
          "\u0627\u0644\u0628\u062D\u0631\u0627\u0646 \u0648\u0627\u0644\u0628\u0631\u0632\u062E"
        ]
      ]
    },
    {
      chapter: 55,
      from: 26,
      to: 45,
      title: [
        "\u4E07\u7269\u6D88\u901D\u4E0E\u5BA1\u5224",
        "The passing of all things and judgement",
        "\u0641\u0646\u0627\u0621 \u0627\u0644\u062E\u0644\u0642 \u0648\u0627\u0644\u062D\u0633\u0627\u0628"
      ],
      theme: [
        "\u5927\u5730\u4E0A\u7684\u4E00\u5207\u90FD\u8981\u6D88\u901D\uFF0C\u552F\u4E3B\u7684\u5C0A\u989C\u6C38\u5B58\uFF1B\u4EBA\u4E0E\u7CBE\u7075\u4E0D\u80FD\u7A7F\u8D8A\u5929\u5730\u8FB9\u7F18\uFF1B\u5929\u7834\u88C2\u4E4B\u65E5\uFF1B\u7F6A\u4EBA\u51ED\u6807\u8BB0\u88AB\u8BA4\u51FA\u3002",
        "All on earth will perish while the Lord's face remains; jinn and men cannot pass beyond the heavens and earth; the day the sky splits; criminals are known by their marks.",
        "\u0643\u0644 \u0645\u0646 \u0639\u0644\u064A\u0647\u0627 \u0641\u0627\u0646 \u0648\u064A\u0628\u0642\u0649 \u0648\u062C\u0647 \u0631\u0628\u0643\u061B \u0639\u062C\u0632 \u0627\u0644\u062B\u0642\u0644\u064A\u0646 \u0639\u0646 \u0627\u0644\u0646\u0641\u0627\u0630\u061B \u064A\u0648\u0645 \u062A\u0646\u0634\u0642 \u0627\u0644\u0633\u0645\u0627\u0621\u061B \u064A\u064F\u0639\u0631\u0641 \u0627\u0644\u0645\u062C\u0631\u0645\u0648\u0646 \u0628\u0633\u064A\u0645\u0627\u0647\u0645."
      ],
      persons: [],
      concepts: [
        [
          "\u4E07\u7269\u6D88\u901D",
          "All things perish",
          "\u0627\u0644\u0641\u0646\u0627\u0621"
        ],
        [
          "\u5BA1\u5224\u65E5\u7684\u666F\u8C61",
          "Scenes of judgement",
          "\u0645\u0634\u0627\u0647\u062F \u0627\u0644\u062D\u0633\u0627\u0628"
        ]
      ]
    },
    {
      chapter: 55,
      from: 46,
      to: 61,
      title: [
        "\u4E24\u5EA7\u4E50\u56ED",
        "The two gardens",
        "\u0627\u0644\u062C\u0646\u062A\u0627\u0646"
      ],
      theme: [
        "\u754F\u60E7\u7AD9\u5728\u4E3B\u9762\u524D\u8005\u5F97\u4E24\u5EA7\u4E50\u56ED\uFF1A\u679D\u6761\u3001\u53CC\u6CC9\u3001\u53CC\u79CD\u679C\u5B9E\u3001\u9526\u7F0E\u5E8A\u8925\uFF1B\u300C\u5584\u884C\u7684\u62A5\u916C\u53EA\u662F\u5584\u884C\u300D\u3002",
        'For whoever fears standing before his Lord are two gardens: branches, two springs, two kinds of every fruit, brocade beds; "is the reward of good anything but good?".',
        "\u0644\u0645\u0646 \u062E\u0627\u0641 \u0645\u0642\u0627\u0645 \u0631\u0628\u0647 \u062C\u0646\u062A\u0627\u0646: \u0623\u0641\u0646\u0627\u0646\u060C \u0639\u064A\u0646\u0627\u0646\u060C \u0632\u0648\u062C\u0627\u0646 \u0645\u0646 \u0643\u0644 \u0641\u0627\u0643\u0647\u0629\u060C \u0641\u0631\u0634 \u0645\u0646 \u0625\u0633\u062A\u0628\u0631\u0642\u061B \xAB\u0647\u0644 \u062C\u0632\u0627\u0621 \u0627\u0644\u0625\u062D\u0633\u0627\u0646 \u0625\u0644\u0627 \u0627\u0644\u0625\u062D\u0633\u0627\u0646\xBB."
      ],
      persons: [],
      concepts: [
        [
          "\u754F\u60E7\u4E0E\u62A5\u916C",
          "Fear and reward",
          "\u0627\u0644\u062E\u0648\u0641 \u0648\u0627\u0644\u062C\u0632\u0627\u0621"
        ],
        [
          "\u5584\u884C\u7684\u62A5\u916C",
          "The reward of good",
          "\u062C\u0632\u0627\u0621 \u0627\u0644\u0625\u062D\u0633\u0627\u0646"
        ]
      ]
    },
    {
      chapter: 55,
      from: 62,
      to: 78,
      title: [
        "\u53E6\u5916\u4E24\u5EA7\u4E50\u56ED\u4E0E\u7ED3\u8BED",
        "Two further gardens and the conclusion",
        "\u062C\u0646\u062A\u0627\u0646 \u0623\u062E\u0631\u064A\u0627\u0646 \u0648\u0627\u0644\u062E\u0627\u062A\u0645\u0629"
      ],
      theme: [
        "\u53E6\u5916\u4E24\u5EA7\u6DF1\u7EFF\u7684\u4E50\u56ED\uFF1A\u55B7\u6D8C\u7684\u53CC\u6CC9\u3001\u6C34\u679C\u6930\u67A3\u77F3\u69B4\u3001\u5E10\u7BF7\uFF1B\u7ED3\u8BED\u8D5E\u9882\u5177\u5C0A\u4E25\u4E0E\u5C0A\u8363\u7684\u4E3B\u4E4B\u540D\u3002",
        "Two further dark-green gardens: gushing springs, fruit, palms and pomegranates, pavilions; the conclusion blesses the name of the Lord of majesty and honour.",
        "\u062C\u0646\u062A\u0627\u0646 \u0645\u062F\u0647\u0627\u0645\u062A\u0627\u0646: \u0639\u064A\u0646\u0627\u0646 \u0646\u0636\u0627\u062E\u062A\u0627\u0646\u060C \u0641\u0627\u0643\u0647\u0629 \u0648\u0646\u062E\u0644 \u0648\u0631\u0645\u0627\u0646\u060C \u062E\u064A\u0627\u0645\u061B \u0627\u0644\u062E\u0627\u062A\u0645\u0629: \u062A\u0628\u0627\u0631\u0643 \u0627\u0633\u0645 \u0631\u0628\u0643 \u0630\u064A \u0627\u0644\u062C\u0644\u0627\u0644 \u0648\u0627\u0644\u0625\u0643\u0631\u0627\u0645."
      ],
      persons: [],
      concepts: [
        [
          "\u53E6\u5916\u4E24\u5EA7\u4E50\u56ED",
          "The further two gardens",
          "\u0627\u0644\u062C\u0646\u062A\u0627\u0646 \u0627\u0644\u0623\u062E\u0631\u064A\u0627\u0646"
        ],
        [
          "\u5C0A\u4E25\u4E0E\u5C0A\u8363",
          "Majesty and honour",
          "\u0627\u0644\u062C\u0644\u0627\u0644 \u0648\u0627\u0644\u0625\u0643\u0631\u0627\u0645"
        ]
      ]
    },
    {
      chapter: 12,
      from: 1,
      to: 3,
      title: [
        "\u5F15\u8A00\uFF1A\u660E\u767D\u7684\u7ECF\u5178\u4E0E\u6700\u7F8E\u7684\u6545\u4E8B",
        "Prologue: the clear Book and the best of stories",
        "\u0627\u0644\u0645\u0642\u062F\u0645\u0629: \u0627\u0644\u0643\u062A\u0627\u0628 \u0627\u0644\u0645\u0628\u064A\u0646 \u0648\u0623\u062D\u0633\u0646 \u0627\u0644\u0642\u0635\u0635"
      ],
      theme: [
        "\u7AE0\u9996\u5B57\u6BCD\uFF1B\u963F\u62C9\u4F2F\u8BED\u7684\u53E4\u5170\uFF1B\u300C\u6211\u4EEC\u7ED9\u4F60\u8BB2\u8FF0\u6700\u7F8E\u7684\u6545\u4E8B\u300D\u3002",
        'Disconnected letters; an Arabic Quran; "We relate to you the best of stories".',
        "\u0627\u0644\u062D\u0631\u0648\u0641 \u0627\u0644\u0645\u0642\u0637\u0639\u0629\u061B \u0642\u0631\u0622\u0646 \u0639\u0631\u0628\u064A\u061B \xAB\u0646\u062D\u0646 \u0646\u0642\u0635 \u0639\u0644\u064A\u0643 \u0623\u062D\u0633\u0646 \u0627\u0644\u0642\u0635\u0635\xBB."
      ],
      persons: [
        [
          "\u5148\u77E5\u7A46\u7F55\u9ED8\u5FB7\uFF08\u53D7\u8BDD\u8005\uFF09",
          "Prophet Muhammad (the one addressed)",
          "\u0627\u0644\u0646\u0628\u064A \u0645\u062D\u0645\u062F \uFDFA (\u0627\u0644\u0645\u062E\u0627\u0637\u064E\u0628)"
        ]
      ],
      concepts: [
        [
          "\u6700\u7F8E\u7684\u6545\u4E8B",
          "The best of stories",
          "\u0623\u062D\u0633\u0646 \u0627\u0644\u0642\u0635\u0635"
        ]
      ]
    },
    {
      chapter: 12,
      from: 4,
      to: 6,
      title: [
        "\u4F18\u7D20\u798F\u7684\u68A6\u4E0E\u7236\u4EB2\u7684\u53EE\u5631",
        "Yusuf's dream and his father's counsel",
        "\u0631\u0624\u064A\u0627 \u064A\u0648\u0633\u0641 \u0648\u0648\u0635\u064A\u0629 \u0623\u0628\u064A\u0647"
      ],
      theme: [
        "\u4F18\u7D20\u798F\u68A6\u89C1\u5341\u4E00\u9897\u661F\u3001\u592A\u9633\u4E0E\u6708\u4EAE\u5411\u4ED6\u53E9\u5934\uFF1B\u7236\u4EB2\u53EE\u5631\u4E0D\u8981\u544A\u8BC9\u5144\u5F1F\u4EEC\uFF0C\u5E76\u9884\u8A00\u4E3B\u5C06\u9009\u62D4\u4ED6\u3002",
        "Yusuf dreams of eleven stars, the sun and the moon prostrating to him; his father warns him not to tell his brothers and foretells that God will choose him.",
        "\u064A\u0648\u0633\u0641 \u064A\u0631\u0649 \u0623\u062D\u062F \u0639\u0634\u0631 \u0643\u0648\u0643\u0628\u064B\u0627 \u0648\u0627\u0644\u0634\u0645\u0633 \u0648\u0627\u0644\u0642\u0645\u0631 \u0633\u0627\u062C\u062F\u064A\u0646\u061B \u0623\u0628\u0648\u0647 \u064A\u0648\u0635\u064A\u0647 \u0623\u0644\u0627 \u064A\u0642\u0635 \u0631\u0624\u064A\u0627\u0647 \u0639\u0644\u0649 \u0625\u062E\u0648\u062A\u0647 \u0648\u064A\u0628\u0634\u0631\u0647 \u0628\u0627\u0644\u0627\u062C\u062A\u0628\u0627\u0621."
      ],
      persons: [
        [
          "\u4F18\u7D20\u798F",
          "Yusuf",
          "\u064A\u0648\u0633\u0641"
        ],
        [
          "\u53F6\u5C14\u5B64\u767D\uFF08\u7236\u4EB2\uFF09",
          "Ya'qub (his father)",
          "\u064A\u0639\u0642\u0648\u0628 (\u0623\u0628\u0648\u0647)"
        ]
      ],
      concepts: [
        [
          "\u68A6",
          "The dream",
          "\u0627\u0644\u0631\u0624\u064A\u0627"
        ],
        [
          "\u7236\u4EB2\u7684\u53EE\u5631",
          "The father's counsel",
          "\u0648\u0635\u064A\u0629 \u0627\u0644\u0623\u0628"
        ]
      ]
    },
    {
      chapter: 12,
      from: 7,
      to: 18,
      title: [
        "\u5144\u5F1F\u4EEC\u7684\u5BC6\u8C0B\u4E0E\u4E95",
        "The brothers' plot and the well",
        "\u0645\u0643\u0631 \u0627\u0644\u0625\u062E\u0648\u0629 \u0648\u0627\u0644\u062C\u0628"
      ],
      theme: [
        "\u5144\u5F1F\u4EEC\u5AC9\u5992\uFF0C\u5546\u8BAE\u6740\u4ED6\u6216\u6254\u8FDB\u4E95\u91CC\uFF1B\u8BF7\u6C42\u5E26\u4ED6\u51FA\u6E38\uFF1B\u6295\u5165\u4E95\u4E2D\uFF1B\u5E26\u56DE\u67D3\u8840\u7684\u886C\u8863\uFF1B\u7236\u4EB2\u8BF4\u300C\u7F8E\u597D\u7684\u575A\u5FCD\u300D\u3002",
        'The brothers, jealous, plot to kill him or cast him into a well; they ask to take him out; they throw him in the well; they bring back a shirt with false blood; the father says "beautiful patience".',
        "\u062D\u0633\u062F \u0627\u0644\u0625\u062E\u0648\u0629 \u0648\u0627\u0644\u062A\u0634\u0627\u0648\u0631 \u0641\u064A \u0642\u062A\u0644\u0647 \u0623\u0648 \u0637\u0631\u062D\u0647\u061B \u0637\u0644\u0628 \u0623\u062E\u0630\u0647 \u0645\u0639\u0647\u0645\u061B \u0625\u0644\u0642\u0627\u0624\u0647 \u0641\u064A \u0627\u0644\u062C\u0628\u061B \u0627\u0644\u0642\u0645\u064A\u0635 \u0628\u062F\u0645 \u0643\u0630\u0628\u061B \u0642\u0648\u0644 \u0627\u0644\u0623\u0628 \xAB\u0641\u0635\u0628\u0631 \u062C\u0645\u064A\u0644\xBB."
      ],
      persons: [
        [
          "\u4F18\u7D20\u798F",
          "Yusuf",
          "\u064A\u0648\u0633\u0641"
        ],
        [
          "\u5144\u5F1F\u4EEC",
          "His brothers",
          "\u0625\u062E\u0648\u062A\u0647"
        ],
        [
          "\u53F6\u5C14\u5B64\u767D",
          "Ya'qub",
          "\u064A\u0639\u0642\u0648\u0628"
        ]
      ],
      concepts: [
        [
          "\u5AC9\u5992\u4E0E\u5BC6\u8C0B",
          "Envy and plotting",
          "\u0627\u0644\u062D\u0633\u062F \u0648\u0627\u0644\u0645\u0643\u0631"
        ],
        [
          "\u67D3\u8840\u7684\u886C\u8863",
          "The blood-stained shirt",
          "\u0627\u0644\u0642\u0645\u064A\u0635 \u0628\u062F\u0645 \u0643\u0630\u0628"
        ],
        [
          "\u7F8E\u597D\u7684\u575A\u5FCD",
          "Beautiful patience",
          "\u0627\u0644\u0635\u0628\u0631 \u0627\u0644\u062C\u0645\u064A\u0644"
        ]
      ]
    },
    {
      chapter: 12,
      from: 19,
      to: 22,
      title: [
        "\u5546\u961F\u6551\u8D77\u4E0E\u88AB\u5356\u5230\u57C3\u53CA",
        "Rescued by a caravan and sold in Egypt",
        "\u0627\u0644\u0642\u0627\u0641\u0644\u0629 \u0648\u0628\u064A\u0639\u0647 \u0641\u064A \u0645\u0635\u0631"
      ],
      theme: [
        "\u53D6\u6C34\u4EBA\u53D1\u73B0\u5C11\u5E74\uFF1B\u4EE5\u4F4E\u4EF7\u5356\u51FA\uFF1B\u57C3\u53CA\u7684\u4E70\u4E3B\u8BA9\u59BB\u5B50\u5584\u5F85\u4ED6\uFF1B\u4F18\u7D20\u798F\u6210\u5E74\u540E\u83B7\u667A\u6167\u4E0E\u77E5\u8BC6\u3002",
        "A water-drawer finds the boy; he is sold for a low price; the Egyptian buyer tells his wife to treat him well; on reaching maturity Yusuf is given judgement and knowledge.",
        "\u0627\u0644\u0648\u0627\u0631\u062F \u064A\u062C\u062F \u0627\u0644\u063A\u0644\u0627\u0645\u061B \u0628\u064A\u0639\u0647 \u0628\u062B\u0645\u0646 \u0628\u062E\u0633\u061B \u0627\u0644\u0645\u0634\u062A\u0631\u064A \u0627\u0644\u0645\u0635\u0631\u064A \u064A\u0648\u0635\u064A \u0627\u0645\u0631\u0623\u062A\u0647 \u0628\u0647\u061B \u0625\u064A\u062A\u0627\u0624\u0647 \u0627\u0644\u062D\u0643\u0645 \u0648\u0627\u0644\u0639\u0644\u0645."
      ],
      persons: [
        [
          "\u4F18\u7D20\u798F",
          "Yusuf",
          "\u064A\u0648\u0633\u0641"
        ],
        [
          "\u5546\u961F",
          "The caravan",
          "\u0627\u0644\u0642\u0627\u0641\u0644\u0629"
        ],
        [
          "\u57C3\u53CA\u4E70\u4E3B\uFF08\u6743\u8D35\uFF09",
          "The Egyptian buyer (al-Aziz)",
          "\u0627\u0644\u0630\u064A \u0627\u0634\u062A\u0631\u0627\u0647 \u0645\u0646 \u0645\u0635\u0631 (\u0627\u0644\u0639\u0632\u064A\u0632)"
        ]
      ],
      concepts: [
        [
          "\u4F4E\u4EF7\u51FA\u5356",
          "Sold for a low price",
          "\u0627\u0644\u0628\u064A\u0639 \u0628\u062B\u0645\u0646 \u0628\u062E\u0633"
        ],
        [
          "\u667A\u6167\u4E0E\u77E5\u8BC6",
          "Judgement and knowledge",
          "\u0627\u0644\u062D\u0643\u0645 \u0648\u0627\u0644\u0639\u0644\u0645"
        ]
      ]
    },
    {
      chapter: 12,
      from: 23,
      to: 29,
      title: [
        "\u6743\u8D35\u4E4B\u59BB\u7684\u8BF1\u60D1\u4E0E\u886C\u8863\u7684\u8BC1\u636E",
        "The wife's seduction and the evidence of the shirt",
        "\u0645\u0631\u0627\u0648\u062F\u0629 \u0627\u0645\u0631\u0623\u0629 \u0627\u0644\u0639\u0632\u064A\u0632 \u0648\u0634\u0647\u0627\u062F\u0629 \u0627\u0644\u0642\u0645\u064A\u0635"
      ],
      theme: [
        "\u5979\u9501\u95E8\u5F15\u8BF1\uFF0C\u4ED6\u6C42\u4E3B\u5E87\u62A4\uFF1B\u4E24\u4EBA\u5954\u5411\u95E8\u53E3\uFF0C\u886C\u8863\u4ECE\u540E\u9762\u6495\u7834\uFF1B\u8BC1\u4EBA\u4EE5\u886C\u8863\u88C2\u53E3\u5224\u65AD\u771F\u4F2A\u3002",
        "She locks the doors and seeks to seduce him; he seeks refuge with God; both race to the door, the shirt is torn from behind; a witness judges by where the shirt is torn.",
        "\u0625\u063A\u0644\u0627\u0642 \u0627\u0644\u0623\u0628\u0648\u0627\u0628 \u0648\u0627\u0644\u0645\u0631\u0627\u0648\u062F\u0629\u061B \xAB\u0645\u0639\u0627\u0630 \u0627\u0644\u0644\u0647\xBB\u061B \u0627\u0644\u0633\u0628\u0627\u0642 \u0625\u0644\u0649 \u0627\u0644\u0628\u0627\u0628 \u0648\u0642\u062F\u0651 \u0627\u0644\u0642\u0645\u064A\u0635 \u0645\u0646 \u062F\u0628\u0631\u061B \u0634\u0647\u0627\u062F\u0629 \u0627\u0644\u0634\u0627\u0647\u062F \u0628\u0645\u0648\u0636\u0639 \u0627\u0644\u0642\u062F\u0651."
      ],
      persons: [
        [
          "\u4F18\u7D20\u798F",
          "Yusuf",
          "\u064A\u0648\u0633\u0641"
        ],
        [
          "\u6743\u8D35\u4E4B\u59BB",
          "The wife of al-Aziz",
          "\u0627\u0645\u0631\u0623\u0629 \u0627\u0644\u0639\u0632\u064A\u0632"
        ],
        [
          "\u6743\u8D35",
          "Al-Aziz",
          "\u0627\u0644\u0639\u0632\u064A\u0632"
        ],
        [
          "\u8BC1\u4EBA",
          "The witness",
          "\u0627\u0644\u0634\u0627\u0647\u062F"
        ]
      ],
      concepts: [
        [
          "\u6C42\u4E3B\u5E87\u62A4",
          "Seeking refuge with God",
          "\u0645\u0639\u0627\u0630 \u0627\u0644\u0644\u0647"
        ],
        [
          "\u886C\u8863\u7684\u8BC1\u636E",
          "The evidence of the shirt",
          "\u0634\u0647\u0627\u062F\u0629 \u0627\u0644\u0642\u0645\u064A\u0635"
        ]
      ]
    },
    {
      chapter: 12,
      from: 30,
      to: 35,
      title: [
        "\u57CE\u4E2D\u5987\u5973\u7684\u8BAE\u8BBA\u3001\u5BB4\u4F1A\u4E0E\u5165\u72F1",
        "The women of the city, the banquet and imprisonment",
        "\u0646\u0633\u0648\u0629 \u0627\u0644\u0645\u062F\u064A\u0646\u0629 \u0648\u0627\u0644\u0645\u062A\u0643\u0623 \u0648\u0627\u0644\u0633\u062C\u0646"
      ],
      theme: [
        "\u57CE\u4E2D\u5987\u5973\u8BAE\u8BBA\uFF1B\u5979\u8BBE\u5BB4\u8BA9\u5979\u4EEC\u770B\u89C1\u4F18\u7D20\u798F\uFF0C\u5979\u4EEC\u5272\u4F24\u624B\uFF1B\u5979\u516C\u5F00\u5A01\u80C1\uFF1B\u4F18\u7D20\u798F\u5B81\u9009\u76D1\u72F1\uFF1B\u4ED6\u88AB\u5173\u5165\u72F1\u3002",
        "The women of the city talk; she prepares a banquet and the women cut their hands on seeing him; she threatens openly; Yusuf prefers prison; he is imprisoned.",
        "\u062D\u062F\u064A\u062B \u0627\u0644\u0646\u0633\u0648\u0629\u061B \u0627\u0644\u0645\u062A\u0643\u0623 \u0648\u062A\u0642\u0637\u064A\u0639 \u0627\u0644\u0623\u064A\u062F\u064A\u061B \u0627\u0644\u062A\u0647\u062F\u064A\u062F \u0628\u0627\u0644\u0633\u062C\u0646\u061B \xAB\u0627\u0644\u0633\u062C\u0646 \u0623\u062D\u0628 \u0625\u0644\u064A\xBB\u061B \u0633\u062C\u0646\u0647."
      ],
      persons: [
        [
          "\u4F18\u7D20\u798F",
          "Yusuf",
          "\u064A\u0648\u0633\u0641"
        ],
        [
          "\u6743\u8D35\u4E4B\u59BB",
          "The wife of al-Aziz",
          "\u0627\u0645\u0631\u0623\u0629 \u0627\u0644\u0639\u0632\u064A\u0632"
        ],
        [
          "\u57CE\u4E2D\u5987\u5973",
          "The women of the city",
          "\u0646\u0633\u0648\u0629 \u0627\u0644\u0645\u062F\u064A\u0646\u0629"
        ]
      ],
      concepts: [
        [
          "\u5BB4\u4F1A\u4E0E\u5272\u624B",
          "The banquet and the cut hands",
          "\u0627\u0644\u0645\u062A\u0643\u0623 \u0648\u062A\u0642\u0637\u064A\u0639 \u0627\u0644\u0623\u064A\u062F\u064A"
        ],
        [
          "\u5B81\u9009\u76D1\u72F1",
          "Preferring prison",
          "\u0627\u062E\u062A\u064A\u0627\u0631 \u0627\u0644\u0633\u062C\u0646"
        ]
      ]
    },
    {
      chapter: 12,
      from: 36,
      to: 42,
      title: [
        "\u72F1\u4E2D\u4E24\u540D\u9752\u5E74\u7684\u68A6\u4E0E\u89E3\u68A6",
        "The two prisoners' dreams and their interpretation",
        "\u0631\u0624\u064A\u0627 \u0627\u0644\u0641\u062A\u064A\u064A\u0646 \u0648\u062A\u0623\u0648\u064A\u0644\u0647\u0627"
      ],
      theme: [
        "\u4E24\u540D\u9752\u5E74\u5404\u8BB2\u4E00\u68A6\uFF1B\u4F18\u7D20\u798F\u5148\u5BA3\u8BB2\u72EC\u4E00\u4FE1\u4EF0\uFF0C\u518D\u89E3\u68A6\uFF1A\u4E00\u4EBA\u659F\u9152\u3001\u4E00\u4EBA\u88AB\u9489\u6B7B\uFF1B\u8BF7\u83B7\u91CA\u8005\u5728\u56FD\u738B\u9762\u524D\u63D0\u8D77\u81EA\u5DF1\uFF0C\u5374\u88AB\u9057\u5FD8\u6570\u5E74\u3002",
        "Two young men each relate a dream; Yusuf first calls to the oneness of God, then interprets: one will serve wine, the other will be crucified; he asks the freed one to mention him to the king, but is forgotten for years.",
        "\u0631\u0624\u064A\u0627 \u0627\u0644\u0641\u062A\u064A\u064A\u0646\u061B \u062F\u0639\u0648\u0629 \u064A\u0648\u0633\u0641 \u0625\u0644\u0649 \u0627\u0644\u062A\u0648\u062D\u064A\u062F \u0642\u0628\u0644 \u0627\u0644\u062A\u0623\u0648\u064A\u0644\u061B \u0623\u062D\u062F\u0647\u0645\u0627 \u064A\u0633\u0642\u064A \u0631\u0628\u0647 \u062E\u0645\u0631\u064B\u0627 \u0648\u0627\u0644\u0622\u062E\u0631 \u064A\u064F\u0635\u0644\u0628\u061B \u0627\u0644\u0646\u0633\u064A\u0627\u0646 \u0628\u0636\u0639 \u0633\u0646\u064A\u0646."
      ],
      persons: [
        [
          "\u4F18\u7D20\u798F",
          "Yusuf",
          "\u064A\u0648\u0633\u0641"
        ],
        [
          "\u4E24\u540D\u72F1\u53CB",
          "Two fellow prisoners",
          "\u0635\u0627\u062D\u0628\u0627 \u0627\u0644\u0633\u062C\u0646"
        ]
      ],
      concepts: [
        [
          "\u5148\u8BB2\u4FE1\u4EF0\u518D\u89E3\u68A6",
          "Faith before interpretation",
          "\u0627\u0644\u062F\u0639\u0648\u0629 \u0642\u0628\u0644 \u0627\u0644\u062A\u0623\u0648\u064A\u0644"
        ],
        [
          "\u89E3\u68A6",
          "Dream interpretation",
          "\u062A\u0623\u0648\u064A\u0644 \u0627\u0644\u0631\u0624\u064A\u0627"
        ]
      ]
    },
    {
      chapter: 12,
      from: 43,
      to: 49,
      title: [
        "\u56FD\u738B\u7684\u68A6\u4E0E\u4E03\u5E74\u4E4B\u89E3",
        "The king's dream and the seven-year interpretation",
        "\u0631\u0624\u064A\u0627 \u0627\u0644\u0645\u0644\u0643 \u0648\u062A\u0623\u0648\u064A\u0644 \u0627\u0644\u0633\u0646\u064A\u0646 \u0627\u0644\u0633\u0628\u0639"
      ],
      theme: [
        "\u56FD\u738B\u68A6\u89C1\u4E03\u5934\u80A5\u725B\u88AB\u4E03\u5934\u7626\u725B\u5403\u6389\u3001\u4E03\u7A57\u9752\u4E03\u7A57\u67AF\uFF1B\u5927\u81E3\u4EEC\u79F0\u4E3A\u4E71\u68A6\uFF1B\u83B7\u91CA\u8005\u60F3\u8D77\u4F18\u7D20\u798F\uFF1B\u4F18\u7D20\u798F\u89E3\u4E3A\u4E03\u5E74\u4E30\u6536\u3001\u4E03\u5E74\u8352\u65F1\u3001\u4E00\u5E74\u5F97\u96E8\u3002",
        "The king dreams of seven fat cows eaten by seven lean ones and seven green ears and seven dry; the courtiers call it confused dreams; the freed man remembers Yusuf; Yusuf interprets seven years of plenty, seven of hardship, then a year of rain.",
        "\u0631\u0624\u064A\u0627 \u0627\u0644\u0645\u0644\u0643: \u0633\u0628\u0639 \u0628\u0642\u0631\u0627\u062A \u0633\u0645\u0627\u0646 \u064A\u0623\u0643\u0644\u0647\u0646 \u0633\u0628\u0639 \u0639\u062C\u0627\u0641 \u0648\u0633\u0628\u0639 \u0633\u0646\u0628\u0644\u0627\u062A\u061B \xAB\u0623\u0636\u063A\u0627\u062B \u0623\u062D\u0644\u0627\u0645\xBB\u061B \u062A\u0630\u0643\u0651\u0631 \u0627\u0644\u0646\u0627\u062C\u064A\u061B \u062A\u0623\u0648\u064A\u0644 \u064A\u0648\u0633\u0641: \u0633\u0628\u0639 \u0633\u0646\u064A\u0646 \u062F\u0623\u0628\u064B\u0627 \u062B\u0645 \u0633\u0628\u0639 \u0634\u062F\u0627\u062F \u062B\u0645 \u0639\u0627\u0645 \u064A\u063A\u0627\u062B \u0641\u064A\u0647 \u0627\u0644\u0646\u0627\u0633."
      ],
      persons: [
        [
          "\u56FD\u738B",
          "The King",
          "\u0627\u0644\u0645\u0644\u0643"
        ],
        [
          "\u5927\u81E3\u4EEC",
          "The chiefs",
          "\u0627\u0644\u0645\u0644\u0623"
        ],
        [
          "\u83B7\u91CA\u7684\u72F1\u53CB",
          "The released prisoner",
          "\u0627\u0644\u0630\u064A \u0646\u062C\u0627 \u0645\u0646 \u0627\u0644\u0633\u062C\u0646"
        ],
        [
          "\u4F18\u7D20\u798F",
          "Yusuf",
          "\u064A\u0648\u0633\u0641"
        ]
      ],
      concepts: [
        [
          "\u56FD\u738B\u7684\u68A6",
          "The king's dream",
          "\u0631\u0624\u064A\u0627 \u0627\u0644\u0645\u0644\u0643"
        ],
        [
          "\u4E03\u5E74\u4E30\u6B49",
          "Seven years of plenty and hardship",
          "\u0633\u0646\u0648\u0627\u062A \u0627\u0644\u0631\u062E\u0627\u0621 \u0648\u0627\u0644\u0634\u062F\u0629"
        ]
      ]
    },
    {
      chapter: 12,
      from: 50,
      to: 57,
      title: [
        "\u662D\u96EA\u6E05\u767D\u4E0E\u638C\u7BA1\u56FD\u5E93",
        "Vindication and charge of the storehouses",
        "\u0638\u0647\u0648\u0631 \u0627\u0644\u0628\u0631\u0627\u0621\u0629 \u0648\u062A\u0648\u0644\u064A \u0627\u0644\u062E\u0632\u0627\u0626\u0646"
      ],
      theme: [
        "\u4F18\u7D20\u798F\u8981\u6C42\u5148\u67E5\u660E\u5987\u5973\u5272\u624B\u4E4B\u4E8B\uFF1B\u5979\u4EEC\u627F\u8BA4\u65E0\u8FC7\uFF1B\u6743\u8D35\u4E4B\u59BB\u627F\u8BA4\u771F\u76F8\uFF1B\u4F18\u7D20\u798F\u8BF4\u300C\u6211\u4E0D\u80FD\u81EA\u79F0\u6E05\u767D\u300D\uFF1B\u56FD\u738B\u91CD\u7528\u4ED6\uFF1B\u4ED6\u8BF7\u6C42\u638C\u7BA1\u56FD\u5E93\u3002",
        "Yusuf asks that the matter of the women be examined first; they declare his innocence; the Aziz's wife confesses the truth; Yusuf says he does not claim himself innocent; the king appoints him; he asks to be put over the storehouses.",
        "\u0637\u0644\u0628 \u064A\u0648\u0633\u0641 \u0627\u0644\u062A\u062D\u0642\u064A\u0642 \u0641\u064A \u0623\u0645\u0631 \u0627\u0644\u0646\u0633\u0648\u0629\u061B \u0627\u0639\u062A\u0631\u0627\u0641\u0647\u0646 \u0628\u0628\u0631\u0627\u0621\u062A\u0647\u061B \u0627\u0639\u062A\u0631\u0627\u0641 \u0627\u0645\u0631\u0623\u0629 \u0627\u0644\u0639\u0632\u064A\u0632\u061B \xAB\u0648\u0645\u0627 \u0623\u0628\u0631\u0626 \u0646\u0641\u0633\u064A\xBB\u061B \u062A\u0645\u0643\u064A\u0646 \u0627\u0644\u0645\u0644\u0643 \u0644\u0647\u061B \xAB\u0627\u062C\u0639\u0644\u0646\u064A \u0639\u0644\u0649 \u062E\u0632\u0627\u0626\u0646 \u0627\u0644\u0623\u0631\u0636\xBB."
      ],
      persons: [
        [
          "\u4F18\u7D20\u798F",
          "Yusuf",
          "\u064A\u0648\u0633\u0641"
        ],
        [
          "\u56FD\u738B",
          "The King",
          "\u0627\u0644\u0645\u0644\u0643"
        ],
        [
          "\u6743\u8D35\u4E4B\u59BB",
          "The wife of al-Aziz",
          "\u0627\u0645\u0631\u0623\u0629 \u0627\u0644\u0639\u0632\u064A\u0632"
        ],
        [
          "\u57CE\u4E2D\u5987\u5973",
          "The women of the city",
          "\u0646\u0633\u0648\u0629 \u0627\u0644\u0645\u062F\u064A\u0646\u0629"
        ]
      ],
      concepts: [
        [
          "\u662D\u96EA\u6E05\u767D",
          "Vindication",
          "\u0625\u062B\u0628\u0627\u062A \u0627\u0644\u0628\u0631\u0627\u0621\u0629"
        ],
        [
          "\u638C\u7BA1\u56FD\u5E93",
          "Charge of the storehouses",
          "\u062A\u0648\u0644\u064A \u0627\u0644\u062E\u0632\u0627\u0626\u0646"
        ]
      ]
    },
    {
      chapter: 12,
      from: 58,
      to: 68,
      title: [
        "\u5144\u5F1F\u4EEC\u7B2C\u4E00\u6B21\u6765\u57C3\u53CA\u4E0E\u7236\u4EB2\u7684\u53EE\u5631",
        "The brothers' first visit and the father's counsel",
        "\u0642\u062F\u0648\u0645 \u0627\u0644\u0625\u062E\u0648\u0629 \u0627\u0644\u0623\u0648\u0644 \u0648\u0648\u0635\u064A\u0629 \u0627\u0644\u0623\u0628"
      ],
      theme: [
        "\u5144\u5F1F\u4EEC\u6765\u4E70\u7CAE\uFF0C\u4F18\u7D20\u798F\u8BA4\u51FA\u4ED6\u4EEC\uFF1B\u8981\u6C42\u5E26\u6765\u540C\u6BCD\u5F1F\u5F1F\uFF1B\u628A\u8D27\u6B3E\u653E\u56DE\u884C\u56CA\uFF1B\u7236\u4EB2\u8981\u6C42\u8A93\u7EA6\u624D\u8BA9\u5F1F\u5F1F\u53BB\uFF1B\u53EE\u5631\u4ECE\u4E0D\u540C\u7684\u95E8\u8FDB\u57CE\u3002",
        "The brothers come for grain and Yusuf recognises them; he asks them to bring their brother; their goods are returned in their bags; the father demands a pledge before letting the brother go; he tells them to enter by different gates.",
        "\u0642\u062F\u0648\u0645 \u0627\u0644\u0625\u062E\u0648\u0629 \u0648\u0639\u0631\u0641\u0647\u0645 \u064A\u0648\u0633\u0641\u061B \u0637\u0644\u0628 \u0627\u0644\u0623\u062E \u0645\u0646 \u0627\u0644\u0623\u0628\u061B \u0631\u062F \u0627\u0644\u0628\u0636\u0627\u0639\u0629 \u0641\u064A \u0627\u0644\u0631\u062D\u0627\u0644\u061B \u0627\u0644\u0645\u0648\u062B\u0642 \u0645\u0646 \u0627\u0644\u0644\u0647\u061B \u0627\u0644\u062F\u062E\u0648\u0644 \u0645\u0646 \u0623\u0628\u0648\u0627\u0628 \u0645\u062A\u0641\u0631\u0642\u0629."
      ],
      persons: [
        [
          "\u4F18\u7D20\u798F",
          "Yusuf",
          "\u064A\u0648\u0633\u0641"
        ],
        [
          "\u5144\u5F1F\u4EEC",
          "His brothers",
          "\u0625\u062E\u0648\u062A\u0647"
        ],
        [
          "\u53F6\u5C14\u5B64\u767D",
          "Ya'qub",
          "\u064A\u0639\u0642\u0648\u0628"
        ]
      ],
      concepts: [
        [
          "\u8BA4\u51FA\u5144\u5F1F",
          "Recognising the brothers",
          "\u0645\u0639\u0631\u0641\u0629 \u0627\u0644\u0625\u062E\u0648\u0629"
        ],
        [
          "\u8A93\u7EA6",
          "The pledge",
          "\u0627\u0644\u0645\u0648\u062B\u0642"
        ],
        [
          "\u4E0D\u540C\u7684\u95E8",
          "Different gates",
          "\u0627\u0644\u0623\u0628\u0648\u0627\u0628 \u0627\u0644\u0645\u062A\u0641\u0631\u0642\u0629"
        ]
      ]
    },
    {
      chapter: 12,
      from: 69,
      to: 79,
      title: [
        "\u91CF\u676F\u4E0E\u672C\u96C5\u660E\u7559\u4E0B",
        "The cup and the brother kept back",
        "\u0627\u0644\u0635\u0648\u0627\u0639 \u0648\u0627\u062D\u062A\u062C\u0627\u0632 \u0627\u0644\u0623\u062E"
      ],
      theme: [
        "\u4F18\u7D20\u798F\u4E0E\u5F1F\u5F1F\u76F8\u8BA4\uFF1B\u91CF\u676F\u88AB\u653E\u8FDB\u5F1F\u5F1F\u7684\u884C\u56CA\uFF1B\u5BA3\u544A\u5931\u7A83\uFF1B\u6309\u4ED6\u4EEC\u81EA\u5DF1\u7684\u8BF4\u6CD5\u5904\u7F6E\uFF1B\u5F1F\u5F1F\u88AB\u7559\u4E0B\uFF1B\u5144\u5F1F\u4EEC\u8BF7\u6C42\u4EE3\u66FF\u88AB\u62D2\u3002",
        "Yusuf makes himself known to his brother; the cup is placed in the brother's bag; theft is announced; the brothers' own proposed penalty applies; the brother is kept; their offer of a substitute is refused.",
        "\u062A\u0639\u0631\u064A\u0641 \u064A\u0648\u0633\u0641 \u0623\u062E\u0627\u0647 \u0628\u0646\u0641\u0633\u0647\u061B \u062C\u0639\u0644 \u0627\u0644\u0635\u0648\u0627\u0639 \u0641\u064A \u0631\u062D\u0644 \u0623\u062E\u064A\u0647\u061B \u0627\u0644\u0646\u062F\u0627\u0621 \u0628\u0627\u0644\u0633\u0631\u0642\u0629\u061B \u0627\u0644\u062D\u0643\u0645 \u0628\u0634\u0631\u0639\u0647\u0645\u061B \u0627\u062D\u062A\u062C\u0627\u0632 \u0627\u0644\u0623\u062E\u061B \u0631\u0641\u0636 \u0627\u0644\u0628\u062F\u064A\u0644."
      ],
      persons: [
        [
          "\u4F18\u7D20\u798F",
          "Yusuf",
          "\u064A\u0648\u0633\u0641"
        ],
        [
          "\u5F1F\u5F1F",
          "His younger brother",
          "\u0623\u062E\u0648\u0647 \u0627\u0644\u0623\u0635\u063A\u0631"
        ],
        [
          "\u5144\u5F1F\u4EEC",
          "His brothers",
          "\u0625\u062E\u0648\u062A\u0647"
        ]
      ],
      concepts: [
        [
          "\u91CF\u676F\u4E4B\u8BA1",
          "The stratagem of the cup",
          "\u0643\u064A\u062F \u0627\u0644\u0635\u0648\u0627\u0639"
        ],
        [
          "\u516C\u6B63\u7684\u5904\u7F6E",
          "Just judgement",
          "\u0627\u0644\u062D\u0643\u0645 \u0628\u0627\u0644\u0639\u062F\u0644"
        ]
      ]
    },
    {
      chapter: 12,
      from: 80,
      to: 87,
      title: [
        "\u8FD4\u56DE\u3001\u7236\u4EB2\u7684\u60B2\u4F24\u4E0E\u575A\u5FCD",
        "The return, the father's grief and patience",
        "\u0627\u0644\u0639\u0648\u062F\u0629 \u0648\u062D\u0632\u0646 \u0627\u0644\u0623\u0628 \u0648\u0635\u0628\u0631\u0647"
      ],
      theme: [
        "\u957F\u5144\u7559\u5728\u57C3\u53CA\uFF1B\u5144\u5F1F\u4EEC\u56DE\u62A5\u7236\u4EB2\uFF1B\u7236\u4EB2\u518D\u8BF4\u300C\u7F8E\u597D\u7684\u575A\u5FCD\u300D\uFF0C\u56E0\u60B2\u4F24\u53CC\u773C\u53D8\u767D\uFF1B\u4ED6\u53EA\u5411\u4E3B\u8BC9\u8BF4\u5FE7\u6101\uFF1B\u547D\u513F\u5B50\u4EEC\u53BB\u6253\u63A2\u4F18\u7D20\u798F\u4E0E\u5F1F\u5F1F\uFF0C\u4E0D\u8981\u5BF9\u4E3B\u7684\u6148\u6069\u7EDD\u671B\u3002",
        `The eldest stays in Egypt; the brothers report to their father; he again says "beautiful patience" and his eyes turn white with grief; he complains only to God; he sends his sons to search for Yusuf and his brother and not to despair of God's mercy.`,
        "\u0628\u0642\u0627\u0621 \u0627\u0644\u0623\u062E \u0627\u0644\u0643\u0628\u064A\u0631\u061B \u0625\u062E\u0628\u0627\u0631 \u0627\u0644\u0623\u0628\u061B \xAB\u0641\u0635\u0628\u0631 \u062C\u0645\u064A\u0644\xBB \u0648\u0627\u0628\u064A\u0636\u0627\u0636 \u0639\u064A\u0646\u064A\u0647\u061B \xAB\u0625\u0646\u0645\u0627 \u0623\u0634\u0643\u0648 \u0628\u062B\u064A \u0648\u062D\u0632\u0646\u064A \u0625\u0644\u0649 \u0627\u0644\u0644\u0647\xBB\u061B \u0627\u0644\u0623\u0645\u0631 \u0628\u0627\u0644\u062A\u062D\u0633\u0633 \u0648\u0639\u062F\u0645 \u0627\u0644\u064A\u0623\u0633 \u0645\u0646 \u0631\u0648\u062D \u0627\u0644\u0644\u0647."
      ],
      persons: [
        [
          "\u53F6\u5C14\u5B64\u767D",
          "Ya'qub",
          "\u064A\u0639\u0642\u0648\u0628"
        ],
        [
          "\u5144\u5F1F\u4EEC",
          "His brothers",
          "\u0625\u062E\u0648\u062A\u0647"
        ]
      ],
      concepts: [
        [
          "\u575A\u5FCD\u4E0E\u60B2\u4F24",
          "Patience and grief",
          "\u0627\u0644\u0635\u0628\u0631 \u0648\u0627\u0644\u062D\u0632\u0646"
        ],
        [
          "\u4E0D\u5BF9\u4E3B\u7684\u6148\u6069\u7EDD\u671B",
          "Not despairing of God's mercy",
          "\u0639\u062F\u0645 \u0627\u0644\u064A\u0623\u0633 \u0645\u0646 \u0631\u0648\u062D \u0627\u0644\u0644\u0647"
        ]
      ]
    },
    {
      chapter: 12,
      from: 88,
      to: 93,
      title: [
        "\u76F8\u8BA4\u4E0E\u5BBD\u6055",
        "Recognition and forgiveness",
        "\u0627\u0644\u062A\u0639\u0627\u0631\u0641 \u0648\u0627\u0644\u0639\u0641\u0648"
      ],
      theme: [
        "\u5144\u5F1F\u4EEC\u5E26\u7740\u4F4E\u52A3\u7684\u8D27\u7269\u6C42\u65BD\u820D\uFF1B\u4F18\u7D20\u798F\u8868\u660E\u8EAB\u4EFD\uFF1B\u5144\u5F1F\u4EEC\u627F\u8BA4\u8FC7\u9519\uFF1B\u300C\u4ECA\u5929\u5BF9\u4F60\u4EEC\u6CA1\u6709\u8D23\u5907\u300D\uFF1B\u4ED6\u8BA9\u4ED6\u4EEC\u5E26\u886C\u8863\u53BB\u7236\u4EB2\u8138\u4E0A\u4F7F\u5176\u590D\u660E\u3002",
        `The brothers come with scant goods asking for charity; Yusuf reveals himself; they admit their wrong; "no blame on you today"; he sends his shirt to be cast on his father's face to restore his sight.`,
        "\u0628\u0636\u0627\u0639\u0629 \u0645\u0632\u062C\u0627\u0629\u061B \xAB\u0623\u0646\u0627 \u064A\u0648\u0633\u0641 \u0648\u0647\u0630\u0627 \u0623\u062E\u064A\xBB\u061B \u0627\u0639\u062A\u0631\u0627\u0641 \u0627\u0644\u0625\u062E\u0648\u0629\u061B \xAB\u0644\u0627 \u062A\u062B\u0631\u064A\u0628 \u0639\u0644\u064A\u0643\u0645 \u0627\u0644\u064A\u0648\u0645\xBB\u061B \u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u0642\u0645\u064A\u0635 \u0644\u064A\u0631\u062A\u062F \u0627\u0644\u0623\u0628 \u0628\u0635\u064A\u0631\u064B\u0627."
      ],
      persons: [
        [
          "\u4F18\u7D20\u798F",
          "Yusuf",
          "\u064A\u0648\u0633\u0641"
        ],
        [
          "\u5144\u5F1F\u4EEC",
          "His brothers",
          "\u0625\u062E\u0648\u062A\u0647"
        ]
      ],
      concepts: [
        [
          "\u8868\u660E\u8EAB\u4EFD",
          "Revealing identity",
          "\u0627\u0644\u062A\u0639\u0631\u064A\u0641 \u0628\u0627\u0644\u0646\u0641\u0633"
        ],
        [
          "\u5BBD\u6055",
          "Forgiveness",
          "\u0627\u0644\u0639\u0641\u0648"
        ]
      ]
    },
    {
      chapter: 12,
      from: 94,
      to: 101,
      title: [
        "\u7236\u4EB2\u590D\u660E\u3001\u5168\u5BB6\u56E2\u805A\u4E0E\u68A6\u7684\u5B9E\u73B0",
        "The father's sight restored, reunion and the dream fulfilled",
        "\u0627\u0631\u062A\u062F\u0627\u062F \u0627\u0644\u0628\u0635\u0631 \u0648\u0627\u0644\u0644\u0642\u0627\u0621 \u0648\u062A\u062D\u0642\u0642 \u0627\u0644\u0631\u0624\u064A\u0627"
      ],
      theme: [
        "\u7236\u4EB2\u95FB\u5230\u4F18\u7D20\u798F\u7684\u6C14\u606F\uFF1B\u886C\u8863\u4F7F\u4ED6\u590D\u660E\uFF1B\u513F\u5B50\u4EEC\u6C42\u7236\u4EB2\u4E3A\u4ED6\u4EEC\u6C42\u9976\uFF1B\u5168\u5BB6\u5230\u57C3\u53CA\uFF1B\u7236\u6BCD\u767B\u4E0A\u5B9D\u5EA7\uFF0C\u4F17\u4EBA\u53E9\u5934\u2014\u2014\u68A6\u5B9E\u73B0\uFF1B\u4F18\u7D20\u798F\u7684\u7948\u7977\u3002",
        "The father senses Yusuf's scent; the shirt restores his sight; the sons ask him to seek forgiveness for them; the family comes to Egypt; his parents are raised on the throne and all fall in prostration \u2013 the dream fulfilled; Yusuf's prayer.",
        "\u0648\u062C\u062F \u0627\u0644\u0623\u0628 \u0631\u064A\u062D \u064A\u0648\u0633\u0641\u061B \u0627\u0631\u062A\u062F\u0627\u062F \u0627\u0644\u0628\u0635\u0631 \u0628\u0627\u0644\u0642\u0645\u064A\u0635\u061B \u0637\u0644\u0628 \u0627\u0644\u0627\u0633\u062A\u063A\u0641\u0627\u0631\u061B \u062F\u062E\u0648\u0644 \u0645\u0635\u0631\u061B \u0631\u0641\u0639 \u0627\u0644\u0623\u0628\u0648\u064A\u0646 \u0639\u0644\u0649 \u0627\u0644\u0639\u0631\u0634 \u0648\u0627\u0644\u0633\u062C\u0648\u062F \u2013 \u062A\u062D\u0642\u0642 \u0627\u0644\u0631\u0624\u064A\u0627\u061B \u062F\u0639\u0627\u0621 \u064A\u0648\u0633\u0641."
      ],
      persons: [
        [
          "\u4F18\u7D20\u798F",
          "Yusuf",
          "\u064A\u0648\u0633\u0641"
        ],
        [
          "\u53F6\u5C14\u5B64\u767D",
          "Ya'qub",
          "\u064A\u0639\u0642\u0648\u0628"
        ],
        [
          "\u7236\u6BCD",
          "His parents",
          "\u0623\u0628\u0648\u0627\u0647"
        ],
        [
          "\u5144\u5F1F\u4EEC",
          "His brothers",
          "\u0625\u062E\u0648\u062A\u0647"
        ]
      ],
      concepts: [
        [
          "\u68A6\u7684\u5B9E\u73B0",
          "Fulfilment of the dream",
          "\u062A\u062D\u0642\u0642 \u0627\u0644\u0631\u0624\u064A\u0627"
        ],
        [
          "\u56E2\u805A",
          "Reunion",
          "\u0627\u0644\u0644\u0642\u0627\u0621"
        ],
        [
          "\u4F18\u7D20\u798F\u7684\u7948\u7977",
          "Yusuf's prayer",
          "\u062F\u0639\u0627\u0621 \u064A\u0648\u0633\u0641"
        ]
      ]
    },
    {
      chapter: 12,
      from: 102,
      to: 111,
      title: [
        "\u7ED3\u8BED\uFF1A\u5E7D\u7384\u7684\u6D88\u606F\u4E0E\u5386\u53F2\u7684\u6559\u8BAD",
        "Epilogue: news of the unseen and the lesson of history",
        "\u0627\u0644\u062E\u0627\u062A\u0645\u0629: \u0623\u0646\u0628\u0627\u0621 \u0627\u0644\u063A\u064A\u0628 \u0648\u0639\u0628\u0631\u0629 \u0627\u0644\u062A\u0627\u0631\u064A\u062E"
      ],
      theme: [
        "\u8FD9\u662F\u5E7D\u7384\u7684\u6D88\u606F\uFF1B\u591A\u6570\u4EBA\u4E0D\u4FE1\uFF1B\u5929\u5730\u95F4\u7684\u8FF9\u8C61\u88AB\u5FFD\u89C6\uFF1B\u4F7F\u8005\u7684\u9053\u8DEF\u662F\u660E\u8BC1\uFF1B\u5148\u524D\u4F7F\u8005\u7684\u7ED3\u5C40\uFF1B\u300C\u4ED6\u4EEC\u7684\u6545\u4E8B\u91CC\u786E\u6709\u6559\u8BAD\u300D\u3002",
        `This is news of the unseen; most people do not believe; signs in the heavens and earth are passed by; the messengers' way is with insight; the end of earlier messengers; "in their stories there is a lesson".`,
        "\u0630\u0644\u0643 \u0645\u0646 \u0623\u0646\u0628\u0627\u0621 \u0627\u0644\u063A\u064A\u0628\u061B \u0623\u0643\u062B\u0631 \u0627\u0644\u0646\u0627\u0633 \u0644\u0627 \u064A\u0624\u0645\u0646\u0648\u0646\u061B \u0627\u0644\u0625\u0639\u0631\u0627\u0636 \u0639\u0646 \u0627\u0644\u0622\u064A\u0627\u062A\u061B \u0627\u0644\u062F\u0639\u0648\u0629 \u0639\u0644\u0649 \u0628\u0635\u064A\u0631\u0629\u061B \u0639\u0627\u0642\u0628\u0629 \u0627\u0644\u0631\u0633\u0644 \u0627\u0644\u0633\u0627\u0628\u0642\u064A\u0646\u061B \xAB\u0644\u0642\u062F \u0643\u0627\u0646 \u0641\u064A \u0642\u0635\u0635\u0647\u0645 \u0639\u0628\u0631\u0629\xBB."
      ],
      persons: [
        [
          "\u5148\u77E5\u7A46\u7F55\u9ED8\u5FB7\uFF08\u53D7\u8BDD\u8005\uFF09",
          "Prophet Muhammad (the one addressed)",
          "\u0627\u0644\u0646\u0628\u064A \u0645\u062D\u0645\u062F \uFDFA (\u0627\u0644\u0645\u062E\u0627\u0637\u064E\u0628)"
        ]
      ],
      concepts: [
        [
          "\u5E7D\u7384\u7684\u6D88\u606F",
          "News of the unseen",
          "\u0623\u0646\u0628\u0627\u0621 \u0627\u0644\u063A\u064A\u0628"
        ],
        [
          "\u5386\u53F2\u7684\u6559\u8BAD",
          "The lesson of history",
          "\u0639\u0628\u0631\u0629 \u0627\u0644\u0642\u0635\u0635"
        ]
      ]
    }
  ]
};

// ../../../totalclaw-solutions/solutions/workbench-quran-teaching/src/main/services/quranTeaching/approved.ts
var t = (v) => ({ zh: v[0], en: v[1], ar: v[2] });
function idFor(kind, chapter, extra) {
  return `m-${kind}-${chapter}-${extra}`.replace(/[^\w\-؀-ۿ]/g, "");
}
var seeds = approvedMaterials_default;
var cache = null;
function approvedMaterials() {
  if (cache) return cache;
  const out = [];
  for (const g of seeds.glossary) {
    out.push({ id: idFor("g", g.chapter, g.word), kind: "glossary", chapter: g.chapter, word: g.word, title: { zh: g.zh, en: g.en, ar: g.ar }, source: t(seeds.sourceGlossary), reviewStatus: "approved", reviewedBy: t(seeds.reviewer) });
  }
  for (const th of seeds.themes) {
    out.push({ id: idFor("t", th.chapter, "theme"), kind: "theme", chapter: th.chapter, title: t(th.title), body: t(th.body), source: t(seeds.sourceStructure), reviewStatus: "approved", reviewedBy: t(seeds.reviewer) });
  }
  for (const u of unitSeeds()) {
    out.push({ id: u.id, kind: "unit", chapter: u.chapter, from: u.from, to: u.to, title: t(u.title), body: t(u.theme), source: t(seeds.sourceStructure), reviewStatus: "approved", reviewedBy: t(seeds.reviewer) });
    u.concepts.forEach((c, i) => {
      out.push({ id: `${u.id}-c${i + 1}`, kind: "concept", chapter: u.chapter, from: u.from, to: u.to, title: t(c), source: t(seeds.sourceStructure), reviewStatus: "approved", reviewedBy: t(seeds.reviewer) });
    });
  }
  cache = out;
  return out;
}
function unitSeeds() {
  return seeds.units.map((u) => ({ ...u, id: idFor("u", u.chapter, `${u.from}-${u.to}`) }));
}
function approvedVersion() {
  return seeds.version;
}

// ../../../totalclaw-solutions/solutions/workbench-quran-teaching/src/main/services/quranTeaching/corpus.ts
var import_node_crypto = require("node:crypto");
var import_node_fs = require("node:fs");
var import_node_path = require("node:path");
var import_i18n = require("npm:@totalclaw/i18n");

// ../../../totalclaw-solutions/solutions/workbench-quran-teaching/src/main/services/quranTeaching/corpusFormat.json
var corpusFormat_default = {
  manifestFile: "corpus_manifest.csv",
  jsonFile: "quran_corpus_10ch_265v.json",
  legacyManifestFile: "\u8BED\u6599\u6E05\u5355\u4E0E\u6821\u9A8C\u503C.csv",
  legacyJsonFile: "\u6807\u51C6\u7ECF\u6587\u6D4B\u8BD5\u8BED\u6599_10\u7AE0265\u8282.json",
  columns: { tier: "\u6D4B\u8BD5\u5C42\u7EA7", chapter: "\u7AE0\u53F7", nameZh: "\u4E2D\u6587\u8BC6\u522B\u540D", nameAr: "\u963F\u62C9\u4F2F\u6587\u7AE0\u540D", verseCount: "\u8282\u6570", file: "\u6587\u4EF6\u540D", sha: "SHA-256" },
  jsonKeys: { chapter: "\u7AE0\u53F7", ref: "\u7ECF\u6587\u7F16\u53F7", arabic: "\u963F\u62C9\u4F2F\u6587\u539F\u6587" },
  tierPrefix: { "1": "\u4E00", "2": "\u4E8C" }
};

// ../../../totalclaw-solutions/solutions/workbench-quran-teaching/src/main/services/quranTeaching/corpus.ts
var F = corpusFormat_default;
var CORPUS_VERSION = "V1.0";
var MANIFEST_FILE = F.manifestFile;
var JSON_FILE = F.jsonFile;
var manifestName = (dir) => [F.manifestFile, F.legacyManifestFile].find((n) => (0, import_node_fs.existsSync)((0, import_node_path.join)(dir, n)));
var jsonName = (dir) => [F.jsonFile, F.legacyJsonFile].find((n) => (0, import_node_fs.existsSync)((0, import_node_path.join)(dir, n)));
var CHAPTER_EN = {
  1: "Al-Fatihah",
  103: "Al-Asr",
  108: "Al-Kawthar",
  112: "Al-Ikhlas",
  113: "Al-Falaq",
  114: "An-Nas",
  49: "Al-Hujurat",
  67: "Al-Mulk",
  55: "Ar-Rahman",
  12: "Yusuf"
};
function stripBom(s) {
  return s.charCodeAt(0) === 65279 ? s.slice(1) : s;
}
function parseCsvLine(line) {
  return line.split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
}
function sha256File(path) {
  return (0, import_node_crypto.createHash)("sha256").update((0, import_node_fs.readFileSync)(path)).digest("hex");
}
function readManifest(dir) {
  const raw = stripBom((0, import_node_fs.readFileSync)((0, import_node_path.join)(dir, manifestName(dir) || MANIFEST_FILE), "utf8")).replace(/\r/g, "");
  const lines = raw.split("\n").filter((l) => l.trim());
  const header = parseCsvLine(lines[0]);
  const idx = (name) => header.findIndex((h) => h === name);
  const iTier = idx(F.columns.tier);
  const iCh = idx(F.columns.chapter);
  const iZh = idx(F.columns.nameZh);
  const iAr = idx(F.columns.nameAr);
  const iN = idx(F.columns.verseCount);
  const iFile = idx(F.columns.file);
  const iSha = idx(F.columns.sha);
  if ([iTier, iCh, iZh, iAr, iN, iFile, iSha].some((i) => i < 0)) throw new Error((0, import_i18n.t)("\u6E05\u5355\u8868\u5934\u4E0D\u5B8C\u6574\uFF1A{p0}", { p0: header.join(",") }));
  return lines.slice(1).map((l) => {
    const c = parseCsvLine(l);
    const tierText = c[iTier] || "";
    const tier = tierText.startsWith(F.tierPrefix["1"]) ? 1 : tierText.startsWith(F.tierPrefix["2"]) ? 2 : 3;
    return { chapter: Number(c[iCh]), nameZh: c[iZh], nameAr: c[iAr], verseCount: Number(c[iN]), file: c[iFile], sha256: c[iSha].toLowerCase(), tier };
  });
}
function readChapterTxt(path) {
  const raw = stripBom((0, import_node_fs.readFileSync)(path, "utf8")).replace(/\r/g, "");
  const out = [];
  for (const line of raw.split("\n")) {
    const m = /^(\d+:\d+)\t(.+)$/.exec(line);
    if (m) out.push({ ref: m[1], arabic: m[2] });
  }
  return out;
}
function loadCorpus(dir, source) {
  const problems = [];
  const chapters = [];
  const verses = [];
  const byChapter = /* @__PURE__ */ new Map();
  if (!manifestName(dir)) {
    problems.push((0, import_i18n.t)("\u7F3A\u5C11\u6E05\u5355\u6587\u4EF6 {p0}", { p0: MANIFEST_FILE }));
    return { status: emptyStatus(source, dir, problems), verses, byChapter };
  }
  let manifest;
  try {
    manifest = readManifest(dir);
  } catch (e) {
    problems.push(String(e?.message || e));
    return { status: emptyStatus(source, dir, problems), verses, byChapter };
  }
  let json = [];
  const jsonFile = jsonName(dir);
  const jsonPath = (0, import_node_path.join)(dir, jsonFile || JSON_FILE);
  if (jsonFile) {
    try {
      json = JSON.parse(stripBom((0, import_node_fs.readFileSync)(jsonPath, "utf8")));
    } catch (e) {
      problems.push((0, import_i18n.t)("\u63A5\u53E3\u6587\u4EF6\u89E3\u6790\u5931\u8D25\uFF1A{p0}", { p0: String(e?.message || e) }));
    }
  } else {
    problems.push((0, import_i18n.t)("\u7F3A\u5C11\u63A5\u53E3\u6587\u4EF6 {p0}", { p0: JSON_FILE }));
  }
  for (const m of manifest) {
    const path = (0, import_node_path.join)(dir, m.file);
    let verified = false;
    if (!(0, import_node_fs.existsSync)(path)) {
      problems.push((0, import_i18n.t)("\u7F3A\u5C11\u9010\u7AE0\u6587\u4EF6 {p0}", { p0: m.file }));
    } else {
      const actual = sha256File(path);
      verified = actual === m.sha256;
      if (!verified) problems.push((0, import_i18n.t)("{p0} \u6821\u9A8C\u503C\u4E0D\u7B26\uFF08\u6E05\u5355 {p1}\u2026 / \u5B9E\u9645 {p2}\u2026\uFF09", { p0: m.file, p1: m.sha256.slice(0, 12), p2: actual.slice(0, 12) }));
    }
    chapters.push({ chapter: m.chapter, nameZh: m.nameZh, nameAr: m.nameAr, nameEn: CHAPTER_EN[m.chapter] || `Surah ${m.chapter}`, verseCount: m.verseCount, tier: m.tier, file: m.file, sha256: m.sha256, verified });
    if (!verified) continue;
    const txt = readChapterTxt(path);
    if (txt.length !== m.verseCount) problems.push((0, import_i18n.t)("{p0} \u8282\u6570 {p1} \u2260 \u6E05\u5355 {p2}", { p0: m.file, p1: txt.length, p2: m.verseCount }));
    const jsonRows = json.filter((r) => Number(r[F.jsonKeys.chapter]) === m.chapter);
    if (json.length && jsonRows.length !== txt.length) problems.push((0, import_i18n.t)("\u7B2C {p0} \u7AE0\uFF1A\u63A5\u53E3\u6587\u4EF6 {p1} \u8282 \u2260 \u9010\u7AE0\u6587\u4EF6 {p2} \u8282", { p0: m.chapter, p1: jsonRows.length, p2: txt.length }));
    const list = [];
    txt.forEach((row, i) => {
      const [c, v] = row.ref.split(":").map(Number);
      if (c !== m.chapter) problems.push((0, import_i18n.t)("{p0} \u5185\u51FA\u73B0\u4ED6\u7AE0\u7F16\u53F7 {p1}", { p0: m.file, p1: row.ref }));
      if (v !== i + 1) problems.push((0, import_i18n.t)("{p0} \u8282\u53F7\u4E0D\u8FDE\u7EED\uFF1A\u671F\u671B {p1} \u5F97\u5230 {p2}", { p0: m.file, p1: i + 1, p2: row.ref }));
      const j = jsonRows[i];
      if (j && (String(j[F.jsonKeys.ref]) !== row.ref || String(j[F.jsonKeys.arabic]) !== row.arabic)) problems.push((0, import_i18n.t)("{p0} \u63A5\u53E3\u6587\u4EF6\u4E0E\u9010\u7AE0\u6587\u4EF6\u539F\u6587\u4E0D\u4E00\u81F4", { p0: row.ref }));
      list.push({ chapter: c, verse: v, ref: row.ref, arabic: row.arabic, sourceVersion: CORPUS_VERSION, reviewStatus: source === "bundled" ? "frozen" : "pending", checksum: m.sha256 });
    });
    byChapter.set(m.chapter, list);
    verses.push(...list);
  }
  const allVerified = problems.length === 0 && chapters.length > 0 && chapters.every((c) => c.verified);
  if (!allVerified) {
    verses.length = 0;
    byChapter.clear();
  }
  return {
    status: {
      imported: allVerified,
      source,
      sourceDir: dir,
      version: CORPUS_VERSION,
      totalVerses: verses.length,
      chapters: chapters.sort((a, b) => a.tier - b.tier || a.chapter - b.chapter),
      allVerified,
      verifiedAt: allVerified ? Date.now() : void 0,
      problems
    },
    verses,
    byChapter
  };
}
function emptyStatus(source, dir, problems) {
  return { imported: false, source, sourceDir: dir, version: CORPUS_VERSION, totalVerses: 0, chapters: [], allVerified: false, problems };
}
function emptyCorpus() {
  return { status: emptyStatus("", "", []), verses: [], byChapter: /* @__PURE__ */ new Map() };
}
function locateCorpusDir(dir) {
  if (manifestName(dir)) return dir;
  try {
    for (const name of (0, import_node_fs.readdirSync)(dir)) {
      const sub = (0, import_node_path.join)(dir, name);
      if (manifestName(sub)) return sub;
    }
  } catch {
  }
  return dir;
}
function versesInRange(corpus, chapter, from, to) {
  const list = corpus.byChapter.get(chapter) || [];
  const lo = Math.max(1, from || 1);
  const hi = Math.min(list.length, to || list.length);
  return list.filter((v) => v.verse >= lo && v.verse <= hi);
}
function chapterName(corpus, chapter, lang2) {
  const info = corpus.status.chapters.find((c) => c.chapter === chapter);
  if (!info) return `${chapter}`;
  return lang2 === "ar" ? info.nameAr : lang2 === "en" ? info.nameEn : info.nameZh;
}

// ../../../totalclaw-solutions/solutions/workbench-quran-teaching/src/main/services/quranTeaching/quizTemplates.json
var quizTemplates_default = {
  identify: [
    [
      "\u4E0B\u5217\u54EA\u4E00\u9879\u662F\u300A{chapter}\u300B\u7B2C {verse} \u8282\u7684\u539F\u6587\uFF1F",
      "Which of the following is the text of {chapter} verse {verse}?",
      "\u0623\u064A\u0651 \u0645\u0645\u0627 \u064A\u0644\u064A \u0647\u0648 \u0646\u0635\u0651 \u0627\u0644\u0622\u064A\u0629 {verse} \u0645\u0646 \u0633\u0648\u0631\u0629 {chapter}\u061F"
    ],
    [
      "\u8BF7\u4ECE\u9009\u9879\u4E2D\u627E\u51FA\u7B2C {verse} \u8282\uFF08{chapter}\uFF09\u3002",
      "Identify verse {verse} of {chapter} among the options.",
      "\u062D\u062F\u0651\u062F \u0627\u0644\u0622\u064A\u0629 {verse} \u0645\u0646 \u0633\u0648\u0631\u0629 {chapter} \u0645\u0646 \u0628\u064A\u0646 \u0627\u0644\u062E\u064A\u0627\u0631\u0627\u062A."
    ],
    [
      "{chapter} \xB7 \u7B2C {verse} \u8282\u7684\u7ECF\u6587\u662F\u54EA\u4E00\u53E5\uFF1F",
      "{chapter}: which line is verse {verse}?",
      "\u0633\u0648\u0631\u0629 {chapter}: \u0623\u064A\u0651 \u0633\u0637\u0631 \u0647\u0648 \u0627\u0644\u0622\u064A\u0629 {verse}\u061F"
    ]
  ],
  next: [
    [
      "\u7D27\u63A5\u5728\u4E0B\u9762\u8FD9\u4E00\u8282\u4E4B\u540E\u7684\u662F\u54EA\u4E00\u8282\uFF1F\n{verse}",
      "Which verse comes immediately after this one?\n{verse}",
      "\u0645\u0627 \u0627\u0644\u0622\u064A\u0629 \u0627\u0644\u062A\u064A \u062A\u0644\u064A \u0647\u0630\u0647 \u0627\u0644\u0622\u064A\u0629 \u0645\u0628\u0627\u0634\u0631\u0629\u061F\n{verse}"
    ],
    [
      "\u6309\u7ECF\u6587\u987A\u5E8F\uFF0C\u4E0B\u4E00\u8282\u5E94\u662F\uFF1F\uFF08{ref}\uFF09\n{verse}",
      "In the order of the text, which verse follows ({ref})?\n{verse}",
      "\u0628\u062D\u0633\u0628 \u062A\u0631\u062A\u064A\u0628 \u0627\u0644\u0646\u0635\u060C \u0645\u0627 \u0627\u0644\u0622\u064A\u0629 \u0627\u0644\u062A\u0627\u0644\u064A\u0629 \u0644\u0640({ref})\u061F\n{verse}"
    ],
    [
      "{ref} \u4E4B\u540E\u7D27\u63A5\u7684\u4E00\u8282\uFF1A",
      "The verse that directly follows {ref}:",
      "\u0627\u0644\u0622\u064A\u0629 \u0627\u0644\u062A\u064A \u062A\u0623\u062A\u064A \u0645\u0628\u0627\u0634\u0631\u0629 \u0628\u0639\u062F {ref}:"
    ]
  ],
  fill: [
    [
      "\u8865\u5168\u7B2C {ref} \u8282\u7A7A\u7F3A\u7684\u8BCD\uFF1A\n{verse}",
      "Complete the missing word in verse {ref}:\n{verse}",
      "\u0623\u0643\u0645\u0644 \u0627\u0644\u0643\u0644\u0645\u0629 \u0627\u0644\u0646\u0627\u0642\u0635\u0629 \u0641\u064A \u0627\u0644\u0622\u064A\u0629 {ref}:\n{verse}"
    ],
    [
      "\u4E0B\u9762\u8FD9\u8282\u7ECF\u6587\uFF08{ref}\uFF09\u5C11\u4E86\u4E00\u4E2A\u8BCD\uFF0C\u8BF7\u9009\u51FA\u6B63\u786E\u7684\u8BCD\u3002\n{verse}",
      "One word is missing from verse {ref}. Choose the correct word.\n{verse}",
      "\u0633\u0642\u0637\u062A \u0643\u0644\u0645\u0629 \u0645\u0646 \u0627\u0644\u0622\u064A\u0629 {ref}. \u0627\u062E\u062A\u0631 \u0627\u0644\u0643\u0644\u0645\u0629 \u0627\u0644\u0635\u062D\u064A\u062D\u0629.\n{verse}"
    ],
    [
      "{ref}\uFF1A\u7A7A\u683C\u5904\u5E94\u586B\u5165\u54EA\u4E2A\u8BCD\uFF1F\n{verse}",
      "{ref}: which word fills the blank?\n{verse}",
      "{ref}: \u0645\u0627 \u0627\u0644\u0643\u0644\u0645\u0629 \u0627\u0644\u062A\u064A \u062A\u0645\u0644\u0623 \u0627\u0644\u0641\u0631\u0627\u063A\u061F\n{verse}"
    ]
  ],
  orderVerses: [
    [
      "\u628A\u4E0B\u5217\u7ECF\u6587\u6309\u300A{chapter}\u300B\u4E2D\u7684\u5148\u540E\u987A\u5E8F\u6392\u5217\uFF08{range}\uFF09\u3002",
      "Arrange these verses in their order in {chapter} ({range}).",
      "\u0631\u062A\u0651\u0628 \u0647\u0630\u0647 \u0627\u0644\u0622\u064A\u0627\u062A \u062D\u0633\u0628 \u062A\u0631\u062A\u064A\u0628\u0647\u0627 \u0641\u064A \u0633\u0648\u0631\u0629 {chapter} ({range})."
    ],
    [
      "\u4EE5\u4E0B\u51E0\u8282\u88AB\u6253\u4E71\u4E86\u987A\u5E8F\uFF0C\u8BF7\u6062\u590D\u539F\u987A\u5E8F\uFF08{chapter} {range}\uFF09\u3002",
      "These verses are shuffled. Restore the original order ({chapter} {range}).",
      "\u0627\u062E\u062A\u0644\u0637 \u062A\u0631\u062A\u064A\u0628 \u0647\u0630\u0647 \u0627\u0644\u0622\u064A\u0627\u062A. \u0623\u0639\u062F \u062A\u0631\u062A\u064A\u0628\u0647\u0627 \u0627\u0644\u0623\u0635\u0644\u064A ({chapter} {range})."
    ],
    [
      "\u6309\u7ECF\u6587\u987A\u5E8F\u6392\u5217\uFF08{range}\uFF09\uFF1A",
      "Put in textual order ({range}):",
      "\u0631\u062A\u0651\u0628 \u062D\u0633\u0628 \u062A\u0631\u062A\u064A\u0628 \u0627\u0644\u0646\u0635 ({range}):"
    ]
  ],
  orderWords: [
    [
      "\u628A\u4E0B\u5217\u8BCD\u8BED\u6309\u7B2C {ref} \u8282\u7684\u539F\u6587\u987A\u5E8F\u6392\u5217\u3002",
      "Arrange these words in the order of verse {ref}.",
      "\u0631\u062A\u0651\u0628 \u0647\u0630\u0647 \u0627\u0644\u0643\u0644\u0645\u0627\u062A \u0628\u062D\u0633\u0628 \u062A\u0631\u062A\u064A\u0628\u0647\u0627 \u0641\u064A \u0627\u0644\u0622\u064A\u0629 {ref}."
    ],
    [
      "\u7B2C {ref} \u8282\u7684\u8BCD\u88AB\u6253\u4E71\u4E86\uFF0C\u8BF7\u6062\u590D\u539F\u53E5\u987A\u5E8F\u3002",
      "The words of verse {ref} are shuffled. Restore the sentence.",
      "\u0627\u062E\u062A\u0644\u0637 \u062A\u0631\u062A\u064A\u0628 \u0643\u0644\u0645\u0627\u062A \u0627\u0644\u0622\u064A\u0629 {ref}. \u0623\u0639\u062F \u062A\u0631\u062A\u064A\u0628 \u0627\u0644\u062C\u0645\u0644\u0629."
    ],
    [
      "\u6062\u590D\u7B2C {ref} \u8282\u7684\u8BCD\u5E8F\uFF1A",
      "Restore the word order of verse {ref}:",
      "\u0623\u0639\u062F \u062A\u0631\u062A\u064A\u0628 \u0643\u0644\u0645\u0627\u062A \u0627\u0644\u0622\u064A\u0629 {ref}:"
    ]
  ],
  orderEvents: [
    [
      "\u628A\u4E0B\u5217\u4E8B\u4EF6\u6309\u300A{chapter}\u300B\u7684\u53D9\u4E8B\u987A\u5E8F\u6392\u5217\u3002",
      "Arrange these events in the narrative order of {chapter}.",
      "\u0631\u062A\u0651\u0628 \u0647\u0630\u0647 \u0627\u0644\u0623\u062D\u062F\u0627\u062B \u062D\u0633\u0628 \u062A\u0633\u0644\u0633\u0644\u0647\u0627 \u0641\u064A \u0633\u0648\u0631\u0629 {chapter}."
    ],
    [
      "\u4EE5\u4E0B\u4E8B\u4EF6\u51FA\u81EA\u300A{chapter}\u300B\uFF0C\u8BF7\u6309\u53D1\u751F\u5148\u540E\u6392\u5E8F\u3002",
      "These events are from {chapter}. Order them as they occur.",
      "\u0647\u0630\u0647 \u0627\u0644\u0623\u062D\u062F\u0627\u062B \u0645\u0646 \u0633\u0648\u0631\u0629 {chapter}. \u0631\u062A\u0651\u0628\u0647\u0627 \u062D\u0633\u0628 \u0648\u0642\u0648\u0639\u0647\u0627."
    ],
    [
      "\u300A{chapter}\u300B\u4E8B\u4EF6\u987A\u5E8F\uFF08{range}\uFF09\uFF1A",
      "Event order in {chapter} ({range}):",
      "\u062A\u0631\u062A\u064A\u0628 \u0627\u0644\u0623\u062D\u062F\u0627\u062B \u0641\u064A \u0633\u0648\u0631\u0629 {chapter} ({range}):"
    ]
  ],
  matchWords: [
    [
      "\u628A\u5DE6\u5217\u7684\u8BCD\u4E0E\u53F3\u5217\u7684\u57FA\u7840\u91CA\u4E49\u914D\u5BF9\uFF08{chapter}\uFF0C\u6279\u51C6\u8BCD\u8868\uFF09\u3002",
      "Match each word on the left with its basic meaning on the right ({chapter}, approved glossary).",
      "\u0635\u0650\u0644 \u0643\u0644 \u0643\u0644\u0645\u0629 \u0641\u064A \u0627\u0644\u0639\u0645\u0648\u062F \u0627\u0644\u0623\u064A\u0645\u0646 \u0628\u0645\u0639\u0646\u0627\u0647\u0627 \u0627\u0644\u0623\u0633\u0627\u0633\u064A ({chapter}\u060C \u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0645\u0641\u0631\u062F\u0627\u062A \u0627\u0644\u0645\u0639\u062A\u0645\u062F\u0629)."
    ],
    [
      "\u8BCD\u6C47\u914D\u5BF9\uFF08{chapter} {range}\uFF09\uFF1A\u4E3A\u6BCF\u4E2A\u8BCD\u9009\u51FA\u91CA\u4E49\u3002",
      "Vocabulary matching ({chapter} {range}): choose the meaning for each word.",
      "\u0645\u0637\u0627\u0628\u0642\u0629 \u0627\u0644\u0645\u0641\u0631\u062F\u0627\u062A ({chapter} {range}): \u0627\u062E\u062A\u0631 \u0627\u0644\u0645\u0639\u0646\u0649 \u0644\u0643\u0644 \u0643\u0644\u0645\u0629."
    ],
    [
      "\u4E3A\u4E0B\u5217\u8BCD\u8BED\u9009\u62E9\u6B63\u786E\u91CA\u4E49\uFF1A",
      "Choose the correct meaning for each word:",
      "\u0627\u062E\u062A\u0631 \u0627\u0644\u0645\u0639\u0646\u0649 \u0627\u0644\u0635\u062D\u064A\u062D \u0644\u0643\u0644 \u0643\u0644\u0645\u0629:"
    ]
  ],
  matchUnits: [
    [
      "\u628A\u4E0B\u5217\u7ECF\u6587\u4E0E\u5176\u6240\u5C5E\u7684\u6559\u5B66\u5355\u5143\u914D\u5BF9\uFF08{chapter}\uFF09\u3002",
      "Match each verse with the teaching unit it belongs to ({chapter}).",
      "\u0635\u0650\u0644 \u0643\u0644 \u0622\u064A\u0629 \u0628\u0627\u0644\u0648\u062D\u062F\u0629 \u0627\u0644\u062A\u0639\u0644\u064A\u0645\u064A\u0629 \u0627\u0644\u062A\u064A \u062A\u0646\u062A\u0645\u064A \u0625\u0644\u064A\u0647\u0627 ({chapter})."
    ],
    [
      "\u8DE8\u8282\u7406\u89E3\uFF1A\u8FD9\u4E9B\u7ECF\u6587\u5404\u5C5E\u4E8E\u54EA\u4E2A\u5355\u5143\uFF1F",
      "Cross-verse comprehension: which unit does each verse belong to?",
      "\u0641\u0647\u0645 \u0639\u0628\u0631 \u0627\u0644\u0622\u064A\u0627\u062A: \u0625\u0644\u0649 \u0623\u064A\u0651 \u0648\u062D\u062F\u0629 \u062A\u0646\u062A\u0645\u064A \u0643\u0644 \u0622\u064A\u0629\u061F"
    ],
    [
      "\u7ECF\u6587 \u2194 \u6559\u5B66\u5355\u5143\u914D\u5BF9\uFF08{range}\uFF09\uFF1A",
      "Verse \u2194 unit matching ({range}):",
      "\u0645\u0637\u0627\u0628\u0642\u0629 \u0627\u0644\u0622\u064A\u0629 \u0628\u0627\u0644\u0648\u062D\u062F\u0629 ({range}):"
    ]
  ],
  concept: [
    [
      "\u4E0B\u5217\u54EA\u4E00\u8282\u6700\u76F4\u63A5\u5BF9\u5E94\u6982\u5FF5\u300C{concept}\u300D\uFF1F\uFF08\u4F9D\u636E\u6279\u51C6\u6559\u5B66\u8D44\u6599\uFF09",
      'Which verse most directly corresponds to the concept "{concept}"? (per approved materials)',
      "\u0623\u064A\u0651 \u0622\u064A\u0629 \u062A\u0642\u0627\u0628\u0644 \u0645\u0628\u0627\u0634\u0631\u0629 \u0645\u0641\u0647\u0648\u0645 \xAB{concept}\xBB\u061F (\u0648\u0641\u0642 \u0627\u0644\u0645\u0648\u0627\u062F \u0627\u0644\u0645\u0639\u062A\u0645\u062F\u0629)"
    ],
    [
      "\u6982\u5FF5\u300C{concept}\u300D\u51FA\u73B0\u5728\u54EA\u4E00\u8282\uFF1F",
      'In which verse does the concept "{concept}" appear?',
      "\u0641\u064A \u0623\u064A\u0651 \u0622\u064A\u0629 \u064A\u0631\u062F \u0645\u0641\u0647\u0648\u0645 \xAB{concept}\xBB\u061F"
    ],
    [
      "\u8BF7\u9009\u51FA\u4F53\u73B0\u300C{concept}\u300D\u7684\u7ECF\u6587\uFF1A",
      'Select the verse that expresses "{concept}":',
      "\u0627\u062E\u062A\u0631 \u0627\u0644\u0622\u064A\u0629 \u0627\u0644\u062A\u064A \u062A\u0639\u0628\u0651\u0631 \u0639\u0646 \xAB{concept}\xBB:"
    ]
  ],
  conceptUnit: [
    [
      "\u6982\u5FF5\u300C{concept}\u300D\u5C5E\u4E8E\u54EA\u4E2A\u6559\u5B66\u5355\u5143\uFF1F",
      'Which teaching unit does the concept "{concept}" belong to?',
      "\u0625\u0644\u0649 \u0623\u064A\u0651 \u0648\u062D\u062F\u0629 \u062A\u0639\u0644\u064A\u0645\u064A\u0629 \u064A\u0646\u062A\u0645\u064A \u0645\u0641\u0647\u0648\u0645 \xAB{concept}\xBB\u061F"
    ],
    [
      "\u300C{concept}\u300D\u662F\u4E0B\u5217\u54EA\u4E2A\u5355\u5143\u7684\u6559\u5B66\u91CD\u70B9\uFF1F",
      '"{concept}" is the focus of which unit?',
      "\xAB{concept}\xBB \u0647\u0648 \u0645\u062D\u0648\u0631 \u0623\u064A\u0651 \u0648\u062D\u062F\u0629\u061F"
    ],
    [
      "\u7EFC\u5408\u7406\u89E3\uFF1A\u300C{concept}\u300D\u5BF9\u5E94\u7684\u5355\u5143\u662F\uFF1F",
      'Synthesis: the unit corresponding to "{concept}" is?',
      "\u0641\u0647\u0645 \u0634\u0627\u0645\u0644: \u0645\u0627 \u0627\u0644\u0648\u062D\u062F\u0629 \u0627\u0644\u0645\u0642\u0627\u0628\u0644\u0629 \u0644\u0640\xAB{concept}\xBB\u061F"
    ]
  ],
  explain: {
    identify: [
      "\u6B63\u786E\u7B54\u6848\u662F\u7B2C {ref} \u8282\u7684\u539F\u6587\uFF08\u9501\u5B9A\u6E90\u6570\u636E\uFF0C\u9010\u5B57\u5F15\u7528\uFF09\u3002",
      "The correct answer is the text of verse {ref} (locked source data, quoted verbatim).",
      "\u0627\u0644\u0625\u062C\u0627\u0628\u0629 \u0627\u0644\u0635\u062D\u064A\u062D\u0629 \u0647\u064A \u0646\u0635 \u0627\u0644\u0622\u064A\u0629 {ref} (\u0628\u064A\u0627\u0646\u0627\u062A \u0645\u0635\u062F\u0631 \u0645\u0642\u0641\u0644\u0629\u060C \u0645\u0646\u0642\u0648\u0644\u0629 \u062D\u0631\u0641\u064A\u064B\u0627)."
    ],
    next: [
      "\u6309\u9501\u5B9A\u8BED\u6599\u7684\u8282\u5E8F\uFF0C{ref} \u4E4B\u540E\u662F {next}\u3002",
      "By the locked order of verses, {next} follows {ref}.",
      "\u0628\u062D\u0633\u0628 \u062A\u0631\u062A\u064A\u0628 \u0627\u0644\u0646\u0635 \u0627\u0644\u0645\u0642\u0641\u0644\u060C \u062A\u0623\u062A\u064A {next} \u0628\u0639\u062F {ref}."
    ],
    fill: [
      "\u539F\u6587\u7B2C {ref} \u8282\u4E2D\u8BE5\u4F4D\u7F6E\u7684\u8BCD\u662F\u300C{word}\u300D\uFF08\u9010\u5B57\u53D6\u81EA\u9501\u5B9A\u8BED\u6599\uFF09\u3002",
      'The word at that position in verse {ref} is "{word}" (taken verbatim from the locked corpus).',
      "\u0627\u0644\u0643\u0644\u0645\u0629 \u0641\u064A \u0630\u0644\u0643 \u0627\u0644\u0645\u0648\u0636\u0639 \u0645\u0646 \u0627\u0644\u0622\u064A\u0629 {ref} \u0647\u064A \xAB{word}\xBB (\u0645\u0646\u0642\u0648\u0644\u0629 \u062D\u0631\u0641\u064A\u064B\u0627 \u0645\u0646 \u0627\u0644\u0646\u0635 \u0627\u0644\u0645\u0642\u0641\u0644)."
    ],
    orderVerses: [
      "\u6B63\u786E\u987A\u5E8F\u5373\u9501\u5B9A\u8BED\u6599\u4E2D\u7684\u8282\u5E8F\uFF1A{refs}\u3002",
      "The correct order is the verse order in the locked corpus: {refs}.",
      "\u0627\u0644\u062A\u0631\u062A\u064A\u0628 \u0627\u0644\u0635\u062D\u064A\u062D \u0647\u0648 \u062A\u0631\u062A\u064A\u0628 \u0627\u0644\u0622\u064A\u0627\u062A \u0641\u064A \u0627\u0644\u0646\u0635 \u0627\u0644\u0645\u0642\u0641\u0644: {refs}."
    ],
    orderWords: [
      "\u6B63\u786E\u8BCD\u5E8F\u5373\u7B2C {ref} \u8282\u539F\u6587\u7684\u8BCD\u5E8F\u3002",
      "The correct order is the word order of verse {ref}.",
      "\u0627\u0644\u062A\u0631\u062A\u064A\u0628 \u0627\u0644\u0635\u062D\u064A\u062D \u0647\u0648 \u062A\u0631\u062A\u064A\u0628 \u0643\u0644\u0645\u0627\u062A \u0627\u0644\u0622\u064A\u0629 {ref}."
    ],
    orderEvents: [
      "\u4E8B\u4EF6\u987A\u5E8F\u4F9D\u636E\u6279\u51C6\u6559\u6848\u7ED3\u6784\u8868\u4E2D\u7684\u8282\u8303\u56F4\uFF1A{refs}\u3002",
      "The event order follows the verse ranges in the approved structure table: {refs}.",
      "\u062A\u0631\u062A\u064A\u0628 \u0627\u0644\u0623\u062D\u062F\u0627\u062B \u0648\u0641\u0642 \u0646\u0637\u0627\u0642\u0627\u062A \u0627\u0644\u0622\u064A\u0627\u062A \u0641\u064A \u062C\u062F\u0648\u0644 \u0627\u0644\u0628\u0646\u064A\u0629 \u0627\u0644\u0645\u0639\u062A\u0645\u062F: {refs}."
    ],
    matchWords: [
      "\u91CA\u4E49\u6765\u81EA\u6279\u51C6\u8BCD\u8868\uFF08{source}\uFF09\uFF0C\u6BCF\u4E2A\u8BCD\u90FD\u51FA\u73B0\u5728 {range} \u7684\u539F\u6587\u4E2D\u3002",
      "Meanings come from the approved glossary ({source}); every word occurs in the text of {range}.",
      "\u0627\u0644\u0645\u0639\u0627\u0646\u064A \u0645\u0646 \u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0645\u0641\u0631\u062F\u0627\u062A \u0627\u0644\u0645\u0639\u062A\u0645\u062F\u0629 ({source})\u061B \u0643\u0644 \u0643\u0644\u0645\u0629 \u0648\u0627\u0631\u062F\u0629 \u0641\u064A \u0646\u0635 {range}."
    ],
    matchUnits: [
      "\u5355\u5143\u5212\u5206\u6765\u81EA\u6279\u51C6\u6559\u6848\u7ED3\u6784\u8868\uFF1B\u6BCF\u8282\u6309\u5176\u8282\u53F7\u843D\u5165\u5BF9\u5E94\u5355\u5143\u7684\u8282\u8303\u56F4\u3002",
      "Unit boundaries come from the approved structure table; each verse falls in its unit's verse range.",
      "\u062D\u062F\u0648\u062F \u0627\u0644\u0648\u062D\u062F\u0627\u062A \u0645\u0646 \u062C\u062F\u0648\u0644 \u0627\u0644\u0628\u0646\u064A\u0629 \u0627\u0644\u0645\u0639\u062A\u0645\u062F\u061B \u0643\u0644 \u0622\u064A\u0629 \u062A\u0642\u0639 \u0636\u0645\u0646 \u0646\u0637\u0627\u0642 \u0648\u062D\u062F\u062A\u0647\u0627."
    ],
    concept: [
      "\u6982\u5FF5\u300C{concept}\u300D\u5728\u6279\u51C6\u8D44\u6599\u4E2D\u6302\u5728 {refs}\uFF1B\u6B63\u786E\u9009\u9879\u53D6\u81EA\u8BE5\u8303\u56F4\u7684\u539F\u6587\u3002",
      'The concept "{concept}" is mapped to {refs} in the approved materials; the correct option is quoted from that range.',
      "\u0645\u0641\u0647\u0648\u0645 \xAB{concept}\xBB \u0645\u0631\u062A\u0628\u0637 \u0628\u0640{refs} \u0641\u064A \u0627\u0644\u0645\u0648\u0627\u062F \u0627\u0644\u0645\u0639\u062A\u0645\u062F\u0629\u061B \u0627\u0644\u062E\u064A\u0627\u0631 \u0627\u0644\u0635\u062D\u064A\u062D \u0645\u0646\u0642\u0648\u0644 \u0645\u0646 \u0630\u0644\u0643 \u0627\u0644\u0646\u0637\u0627\u0642."
    ],
    conceptUnit: [
      "\u6279\u51C6\u6559\u6848\u7ED3\u6784\u8868\u628A\u300C{concept}\u300D\u5217\u4E3A\u5355\u5143\u300C{unit}\u300D\uFF08{refs}\uFF09\u7684\u6559\u5B66\u6982\u5FF5\u3002",
      'The approved structure table lists "{concept}" as a concept of unit "{unit}" ({refs}).',
      "\u064A\u062F\u0631\u062C \u062C\u062F\u0648\u0644 \u0627\u0644\u0628\u0646\u064A\u0629 \u0627\u0644\u0645\u0639\u062A\u0645\u062F \xAB{concept}\xBB \u0643\u0645\u0641\u0647\u0648\u0645 \u0644\u0644\u0648\u062D\u062F\u0629 \xAB{unit}\xBB ({refs})."
    ],
    themeVerse: [
      "\u6279\u51C6\u6559\u6848\u7ED3\u6784\u8868\u628A {ref} \u5212\u5165\u5355\u5143\u300C{unit}\u300D\uFF0C\u5176\u4E3B\u9898\u4E3A\uFF1A{theme}\u3002\u6B63\u786E\u9009\u9879\u9010\u5B57\u53D6\u81EA\u8BE5\u8282\u539F\u6587\u3002",
      'The approved structure table places {ref} in unit "{unit}", whose theme is: {theme}. The correct option is quoted verbatim from that verse.',
      "\u064A\u0636\u0639 \u062C\u062F\u0648\u0644 \u0627\u0644\u0628\u0646\u064A\u0629 \u0627\u0644\u0645\u0639\u062A\u0645\u062F {ref} \u0641\u064A \u0627\u0644\u0648\u062D\u062F\u0629 \xAB{unit}\xBB \u0648\u0645\u0648\u0636\u0648\u0639\u0647\u0627: {theme}. \u0627\u0644\u062E\u064A\u0627\u0631 \u0627\u0644\u0635\u062D\u064A\u062D \u0645\u0646\u0642\u0648\u0644 \u062D\u0631\u0641\u064A\u064B\u0627 \u0645\u0646 \u062A\u0644\u0643 \u0627\u0644\u0622\u064A\u0629."
    ],
    verseUnit: [
      "\u6309\u6279\u51C6\u6559\u6848\u7ED3\u6784\u8868\uFF0C{ref} \u843D\u5728\u5355\u5143\u300C{unit}\u300D\u7684\u8282\u8303\u56F4\uFF08{range}\uFF09\u5185\u3002",
      'Per the approved structure table, {ref} falls within unit "{unit}" ({range}).',
      "\u0648\u0641\u0642 \u062C\u062F\u0648\u0644 \u0627\u0644\u0628\u0646\u064A\u0629 \u0627\u0644\u0645\u0639\u062A\u0645\u062F\u060C \u062A\u0642\u0639 {ref} \u0636\u0645\u0646 \u0627\u0644\u0648\u062D\u062F\u0629 \xAB{unit}\xBB ({range})."
    ],
    conceptPair: [
      "\u6279\u51C6\u6559\u6848\u7ED3\u6784\u8868\u628A\u300C{a}\u300D\u4E0E\u300C{b}\u300D\u90FD\u5217\u4E3A\u5355\u5143\u300C{unit}\u300D\uFF08{range}\uFF09\u7684\u6559\u5B66\u6982\u5FF5\u3002",
      'The approved structure table lists both "{a}" and "{b}" as concepts of unit "{unit}" ({range}).',
      "\u064A\u062F\u0631\u062C \u062C\u062F\u0648\u0644 \u0627\u0644\u0628\u0646\u064A\u0629 \u0627\u0644\u0645\u0639\u062A\u0645\u062F \xAB{a}\xBB \u0648\xAB{b}\xBB \u0643\u0645\u0641\u0647\u0648\u0645\u064A\u0646 \u0644\u0644\u0648\u062D\u062F\u0629 \xAB{unit}\xBB ({range})."
    ],
    unitTheme: [
      "{unit} \u7684\u4E3B\u9898\u662F\u300C{theme}\u300D\uFF08{range}\uFF09\u3002",
      "{unit} is about \u201C{theme}\u201D ({range}).",
      "\u0645\u0648\u0636\u0648\u0639 {unit} \u0647\u0648 \xAB{theme}\xBB ({range})."
    ]
  },
  verify: {
    ok_verbatim: [
      "\u7B54\u6848\u9010\u5B57\u5B58\u5728\u4E8E\u9501\u5B9A\u7ECF\u6587 {refs}",
      "Answer exists verbatim in locked verses {refs}",
      "\u0627\u0644\u0625\u062C\u0627\u0628\u0629 \u0645\u0648\u062C\u0648\u062F\u0629 \u062D\u0631\u0641\u064A\u064B\u0627 \u0641\u064A \u0627\u0644\u0622\u064A\u0627\u062A \u0627\u0644\u0645\u0642\u0641\u0644\u0629 {refs}"
    ],
    ok_order: [
      "\u987A\u5E8F\u4E0E\u9501\u5B9A\u8BED\u6599\u4E00\u81F4\uFF08{refs}\uFF09",
      "Order matches the locked corpus ({refs})",
      "\u0627\u0644\u062A\u0631\u062A\u064A\u0628 \u0645\u0637\u0627\u0628\u0642 \u0644\u0644\u0646\u0635 \u0627\u0644\u0645\u0642\u0641\u0644 ({refs})"
    ],
    ok_material: [
      "\u7B54\u6848\u7531\u6279\u51C6\u8D44\u6599 {ids} \u652F\u6301",
      "Answer supported by approved materials {ids}",
      "\u0627\u0644\u0625\u062C\u0627\u0628\u0629 \u0645\u062F\u0639\u0648\u0645\u0629 \u0628\u0627\u0644\u0645\u0648\u0627\u062F \u0627\u0644\u0645\u0639\u062A\u0645\u062F\u0629 {ids}"
    ],
    fail: [
      "\u81EA\u52A8\u4E00\u81F4\u6027\u68C0\u67E5\u672A\u901A\u8FC7\uFF1A{why}",
      "Automatic consistency check failed: {why}",
      "\u0641\u0634\u0644 \u0641\u062D\u0635 \u0627\u0644\u0627\u062A\u0633\u0627\u0642 \u0627\u0644\u062A\u0644\u0642\u0627\u0626\u064A: {why}"
    ]
  },
  eventLabel: [
    "\u4E8B\u4EF6 {n}\uFF1A{title}\uFF08{range}\uFF09",
    "Event {n}: {title} ({range})",
    "\u0627\u0644\u062D\u062F\u062B {n}: {title} ({range})"
  ],
  unitLabel: [
    "\u5355\u5143 {n}\uFF1A{title}\uFF08{range}\uFF09",
    "Unit {n}: {title} ({range})",
    "\u0627\u0644\u0648\u062D\u062F\u0629 {n}: {title} ({range})"
  ],
  paperTitle: {
    practice: [
      "\u7EC3\u4E60 \xB7 {chapter} {range} \xB7 \u7B2C {v} \u7248",
      "Practice \xB7 {chapter} {range} \xB7 version {v}",
      "\u062A\u062F\u0631\u064A\u0628 \xB7 {chapter} {range} \xB7 \u0627\u0644\u0646\u0633\u062E\u0629 {v}"
    ],
    exam: [
      "\u8003\u8BD5 \xB7 {chapter} {range} \xB7 \u7B2C {v} \u7248",
      "Exam \xB7 {chapter} {range} \xB7 version {v}",
      "\u0627\u062E\u062A\u0628\u0627\u0631 \xB7 {chapter} {range} \xB7 \u0627\u0644\u0646\u0633\u062E\u0629 {v}"
    ],
    reinforce: [
      "\u5F3A\u5316\u7EC3\u4E60 \xB7 {target}",
      "Reinforcement practice \xB7 {target}",
      "\u062A\u062F\u0631\u064A\u0628 \u062A\u0639\u0632\u064A\u0632\u064A \xB7 {target}"
    ],
    retest: [
      "\u590D\u6D4B \xB7 {target}",
      "Retest \xB7 {target}",
      "\u0625\u0639\u0627\u062F\u0629 \u0627\u062E\u062A\u0628\u0627\u0631 \xB7 {target}"
    ]
  },
  autoUnitTitle: [
    "\u7B2C {range} \u8282",
    "Verses {range}",
    "\u0627\u0644\u0622\u064A\u0627\u062A {range}"
  ],
  autoUnitTheme: [
    "\u81EA\u52A8\u5206\u6BB5\uFF08\u672A\u8986\u76D6\u6279\u51C6\u5355\u5143\u8868\uFF0C\u6559\u5E08\u786E\u8BA4\u540E\u53EF\u547D\u540D\uFF09",
    "Auto segment (not covered by the approved unit table; teacher may name it)",
    "\u062A\u0642\u0633\u064A\u0645 \u0622\u0644\u064A (\u063A\u064A\u0631 \u0645\u063A\u0637\u0649 \u0628\u062C\u062F\u0648\u0644 \u0627\u0644\u0648\u062D\u062F\u0627\u062A \u0627\u0644\u0645\u0639\u062A\u0645\u062F\u061B \u064A\u0645\u0643\u0646 \u0644\u0644\u0645\u0639\u0644\u0645 \u062A\u0633\u0645\u064A\u062A\u0647)"
  ],
  themeVerse: [
    [
      "\u4E0B\u5217\u54EA\u4E00\u8282\u4F53\u73B0\u4E86\u5355\u5143\u300C{unit}\u300D\u7684\u4E3B\u9898\uFF1A{theme}",
      'Which verse expresses the theme of unit "{unit}": {theme}',
      "\u0623\u064A\u0651 \u0622\u064A\u0629 \u062A\u0639\u0628\u0651\u0631 \u0639\u0646 \u0645\u0648\u0636\u0648\u0639 \u0627\u0644\u0648\u062D\u062F\u0629 \xAB{unit}\xBB: {theme}"
    ],
    [
      "\u6839\u636E\u6279\u51C6\u8D44\u6599\uFF0C\u300C{theme}\u300D\u5BF9\u5E94\u4E0B\u9762\u54EA\u4E00\u8282\uFF1F",
      'According to the approved materials, which verse corresponds to: "{theme}"?',
      "\u0648\u0641\u0642 \u0627\u0644\u0645\u0648\u0627\u062F \u0627\u0644\u0645\u0639\u062A\u0645\u062F\u0629\u060C \u0623\u064A\u0651 \u0622\u064A\u0629 \u062A\u0642\u0627\u0628\u0644: \xAB{theme}\xBB\u061F"
    ],
    [
      "\u7406\u89E3\u9898\uFF1A\u54EA\u4E00\u8282\u8BB2\u7684\u662F\u300C{unit}\u300D\uFF1F",
      'Comprehension: which verse is about "{unit}"?',
      "\u0641\u0647\u0645: \u0623\u064A\u0651 \u0622\u064A\u0629 \u062A\u062A\u062D\u062F\u062B \u0639\u0646 \xAB{unit}\xBB\u061F"
    ]
  ],
  verseUnit: [
    [
      "\u4E0B\u9762\u8FD9\u8282\u7ECF\u6587\u5C5E\u4E8E\u54EA\u4E2A\u6559\u5B66\u5355\u5143\uFF1F\n{verse}",
      "Which teaching unit does this verse belong to?\n{verse}",
      "\u0625\u0644\u0649 \u0623\u064A\u0651 \u0648\u062D\u062F\u0629 \u062A\u0639\u0644\u064A\u0645\u064A\u0629 \u062A\u0646\u062A\u0645\u064A \u0647\u0630\u0647 \u0627\u0644\u0622\u064A\u0629\u061F\n{verse}"
    ],
    [
      "\u7B2C {ref} \u8282\u7684\u4E3B\u9898\u5F52\u5165\u54EA\u4E2A\u5355\u5143\uFF1F\n{verse}",
      "Under which unit does the theme of verse {ref} fall?\n{verse}",
      "\u062A\u062D\u062A \u0623\u064A\u0651 \u0648\u062D\u062F\u0629 \u064A\u0646\u062F\u0631\u062C \u0645\u0648\u0636\u0648\u0639 \u0627\u0644\u0622\u064A\u0629 {ref}\u061F\n{verse}"
    ],
    [
      "\u8BF7\u4E3A\u7B2C {ref} \u8282\u9009\u51FA\u6240\u5C5E\u5355\u5143\uFF1A\n{verse}",
      "Choose the unit for verse {ref}:\n{verse}",
      "\u0627\u062E\u062A\u0631 \u0627\u0644\u0648\u062D\u062F\u0629 \u0627\u0644\u062A\u064A \u062A\u0646\u062A\u0645\u064A \u0625\u0644\u064A\u0647\u0627 \u0627\u0644\u0622\u064A\u0629 {ref}:\n{verse}"
    ]
  ],
  conceptPair: [
    [
      "\u6982\u5FF5\u300C{a}\u300D\u4E0E\u300C{b}\u300D\u540C\u5C5E\u4E8E\u54EA\u4E2A\u6559\u5B66\u5355\u5143\uFF1F",
      'Which teaching unit contains both concepts "{a}" and "{b}"?',
      "\u0623\u064A\u0651 \u0648\u062D\u062F\u0629 \u062A\u0639\u0644\u064A\u0645\u064A\u0629 \u062A\u0636\u0645 \u0645\u0641\u0647\u0648\u0645\u064A \xAB{a}\xBB \u0648\xAB{b}\xBB \u0645\u0639\u064B\u0627\u061F"
    ],
    [
      "\u7EFC\u5408\u7406\u89E3\uFF1A\u300C{a}\u300D\u548C\u300C{b}\u300D\u5728\u54EA\u4E00\u4E2A\u5355\u5143\u91CC\u4E00\u8D77\u51FA\u73B0\uFF1F",
      'Synthesis: in which unit do "{a}" and "{b}" appear together?',
      "\u0641\u0647\u0645 \u0634\u0627\u0645\u0644: \u0641\u064A \u0623\u064A\u0651 \u0648\u062D\u062F\u0629 \u064A\u0631\u062F \xAB{a}\xBB \u0648\xAB{b}\xBB \u0645\u0639\u064B\u0627\u061F"
    ],
    [
      "\u300C{a}\u300D\u300C{b}\u300D\u4E24\u4E2A\u6982\u5FF5\u7684\u5171\u540C\u5355\u5143\u662F\uFF1F",
      'The unit shared by the concepts "{a}" and "{b}" is?',
      "\u0645\u0627 \u0627\u0644\u0648\u062D\u062F\u0629 \u0627\u0644\u0645\u0634\u062A\u0631\u0643\u0629 \u0628\u064A\u0646 \u0645\u0641\u0647\u0648\u0645\u064A \xAB{a}\xBB \u0648\xAB{b}\xBB\u061F"
    ]
  ],
  unitTheme: [
    [
      "{unit} \u8FD9\u4E00\u6BB5\u8BB2\u7684\u4E3B\u8981\u662F\u4EC0\u4E48\uFF1F",
      "What is {unit} mainly about?",
      "\u0639\u0645\u0651 \u064A\u062A\u062D\u062F\u0651\u062B {unit} \u0628\u0634\u0643\u0644 \u0631\u0626\u064A\u0633\u064A\u061F"
    ],
    [
      "\u4E0B\u9762\u54EA\u4E00\u9879\u6700\u80FD\u6982\u62EC {unit}\uFF1F",
      "Which option best sums up {unit}?",
      "\u0623\u064A \u062E\u064A\u0627\u0631 \u064A\u0644\u062E\u0651\u0635 {unit} \u0639\u0644\u0649 \u0623\u0641\u0636\u0644 \u0648\u062C\u0647\u061F"
    ],
    [
      "\u8BFB\u5B8C {unit}\uFF0C\u5B83\u7684\u91CD\u70B9\u662F\uFF1A",
      "After reading {unit}, its main point is:",
      "\u0628\u0639\u062F \u0642\u0631\u0627\u0621\u0629 {unit}\u060C \u0641\u0625\u0646 \u0645\u062D\u0648\u0631\u0647 \u0647\u0648:"
    ]
  ]
};

// ../../../totalclaw-solutions/solutions/workbench-quran-teaching/src/main/services/quranTeaching/rng.ts
var SeededRng = class {
  state;
  constructor(seed) {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < seed.length; i += 1) {
      h ^= seed.charCodeAt(i);
      h = Math.imul(h, 16777619) >>> 0;
    }
    this.state = h || 2654435769;
  }
  /** [0, 1) */
  next() {
    this.state = this.state + 1831565813 >>> 0;
    let t2 = this.state;
    t2 = Math.imul(t2 ^ t2 >>> 15, t2 | 1);
    t2 ^= t2 + Math.imul(t2 ^ t2 >>> 7, t2 | 61);
    return ((t2 ^ t2 >>> 14) >>> 0) / 4294967296;
  }
  int(maxExclusive) {
    return Math.floor(this.next() * Math.max(1, maxExclusive));
  }
  pick(arr) {
    return arr[this.int(arr.length)];
  }
  shuffle(arr) {
    const out = arr.slice();
    for (let i = out.length - 1; i > 0; i -= 1) {
      const j = this.int(i + 1);
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  }
  /** 不放回抽 n 个 */
  sample(arr, n) {
    return this.shuffle(arr).slice(0, Math.max(0, Math.min(n, arr.length)));
  }
  chance(p) {
    return this.next() < p;
  }
};
function newSeed(prefix = "s") {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

// ../../../totalclaw-solutions/solutions/workbench-quran-teaching/src/main/services/quranTeaching/quiz.ts
var import_quranPaperVariant = require("host:apps/desktop-shell/src/shared/quranPaperVariant.ts");

// ../../../totalclaw-solutions/solutions/workbench-quran-teaching/src/main/services/quranTeaching/textUtils.ts
var DIACRITICS = /[\u0610-\u061A\u064B-\u065F\u06D6-\u06DC\u06DF-\u06E8\u06EA-\u06ED\u08D3-\u08FF]/g;
var PAUSE_TOKEN = /^[\u06D6-\u06DC\u06DE-\u06E0\u06E5\u06E6\u06E9\s]+$/;
function normalizeArabic(word) {
  return word.replace(/\u0640\u0654/g, "\u0621").replace(/[\u0627\u0648\u0649\u064A]\u0654/g, "\u0621").replace(/\u0649\u0670/g, "\u0649").replace(/\u0670/g, "\u0627").replace(/\u0640/g, "").replace(DIACRITICS, "").replace(/\u0671/g, "\u0627").replace(/[\u0622\u0623\u0625]/g, "\u0627").replace(/[\u0624\u0626]/g, "\u0621").replace(/\u0621\u0627/g, "\u0627").replace(/\u0649/g, "\u064A").replace(/[^\u0621-\u064A]/g, "").trim();
}
function tokenizeVerse(arabic) {
  const out = [];
  let index = 0;
  for (const piece of arabic.split(/\s+/)) {
    if (!piece || PAUSE_TOKEN.test(piece)) continue;
    const norm = normalizeArabic(piece);
    if (!norm) continue;
    out.push({ raw: piece, norm, index });
    index += 1;
  }
  return out;
}
var STOP_WORDS = /* @__PURE__ */ new Set([
  "\u0648",
  "\u0641\u064A",
  "\u0645\u0646",
  "\u0645\u0627",
  "\u0644\u0627",
  "\u0627\u0644\u0627",
  "\u0627\u0646",
  "\u0627\u0646\u0627",
  "\u0647\u0648",
  "\u0647\u064A",
  "\u0647\u0645",
  "\u0639\u0644\u0649",
  "\u0627\u0644\u0649",
  "\u0639\u0646",
  "\u0628\u0647",
  "\u0628\u0647\u0627",
  "\u0644\u0647",
  "\u0644\u0647\u0627",
  "\u0644\u0647\u0645",
  "\u0643\u0644",
  "\u0627\u0648",
  "\u0627\u0630\u0627",
  "\u0642\u0644",
  "\u0642\u0627\u0644",
  "\u0642\u0627\u0644\u0648\u0627",
  "\u062B\u0645",
  "\u0628\u0644",
  "\u0642\u062F",
  "\u0644\u0645",
  "\u0644\u0646",
  "\u0630\u0644\u0643",
  "\u0647\u0630\u0627",
  "\u0647\u0630\u0647",
  "\u0627\u0644\u0630\u064A",
  "\u0627\u0644\u0630\u064A\u0646",
  "\u0627\u0644\u062A\u064A",
  "\u0645\u0639",
  "\u0628\u064A\u0646",
  "\u062D\u062A\u0649",
  "\u0644\u0648",
  "\u0627\u0645",
  "\u0627\u064A",
  "\u0643\u0627\u0646",
  "\u0643\u0627\u0646\u0648\u0627",
  "\u0627\u0646\u062A",
  "\u0627\u0646\u062A\u0645",
  "\u0646\u062D\u0646",
  "\u0643\u0646\u062A\u0645",
  "\u0641\u064A\u0647\u0627",
  "\u0641\u064A\u0647",
  "\u0645\u0646\u0647\u0627",
  "\u0645\u0646\u0647",
  "\u0639\u0644\u064A\u0647\u0645",
  "\u0639\u0644\u064A\u0643\u0645",
  "\u0644\u0643\u0645",
  "\u0628\u0645\u0627",
  "\u0641\u0627\u0646",
  "\u0648\u0627\u0646",
  "\u0648\u0645\u0627",
  "\u0648\u0644\u0627",
  "\u0627\u0644\u0627"
]);
function rangeLabel(from, to, chapter) {
  const r = from === to ? `${from}` : `${from}\u2013${to}`;
  return chapter === void 0 ? r : `${chapter}:${r}`;
}

// ../../../totalclaw-solutions/solutions/workbench-quran-teaching/src/main/services/quranTeaching/quiz.ts
var TPL = quizTemplates_default;
var LI = { zh: 0, en: 1, ar: 2 };
function fill(tpl, lang2, vars) {
  return tidyPunctuation(tpl[LI[lang2]].replace(/\{(\w+)\}/g, (_m, k) => vars[k] === void 0 ? `{${k}}` : String(vars[k])));
}
function tidyPunctuation(s) {
  return s.replace(/([。！？；])[ \t]*[。．.]+/g, "$1").replace(/(?<!\.)([.!?])[ \t]*\.(?!\.)/g, "$1").replace(/[：:][ \t]*([。．.])(?!\.)/g, "$1");
}
function labelOf(tri3, lang2) {
  return tri3[lang2];
}
function distractVerses(ctx, rng, exclude, n) {
  const pool = ctx.verses.filter((v) => !exclude.has(v.ref));
  const extra = ctx.chapterVerses.filter((v) => !exclude.has(v.ref) && !pool.includes(v));
  const picked = rng.sample(pool, n);
  if (picked.length < n) picked.push(...rng.sample(extra, n - picked.length));
  const seen = /* @__PURE__ */ new Set();
  return picked.filter((v) => {
    if (seen.has(v.arabic)) return false;
    seen.add(v.arabic);
    return true;
  });
}
function shuffleOptions(rng, options, correct) {
  const idx = rng.shuffle(options.map((_, i) => i));
  return { options: idx.map((i) => options[i]), answer: idx.indexOf(correct) };
}
function genIdentify(ctx, rng) {
  const target = rng.pick(ctx.verses);
  const others = distractVerses(ctx, rng, /* @__PURE__ */ new Set([target.ref]), 3).filter((v) => v.arabic !== target.arabic);
  if (others.length < 2) return null;
  const { options, answer } = shuffleOptions(rng, [target.arabic, ...others.map((v) => v.arabic)], 0);
  const p = rng.int(3);
  return {
    type: "mcq",
    difficulty: 1,
    dimension: "memory",
    kind: "identify",
    stem: fill(TPL.identify[p], ctx.lang, { chapter: ctx.chapterName, verse: target.verse }),
    options,
    answer,
    sourceRefs: [target.ref],
    materialIds: [],
    explanation: fill(TPL.explain.identify, ctx.lang, { ref: target.ref }),
    phrasing: p,
    proof: { kind: "verbatim", texts: [target.arabic], refs: [target.ref] }
  };
}
function genNext(ctx, rng) {
  const candidates = ctx.verses.filter((v) => ctx.chapterVerses.some((x) => x.verse === v.verse + 1));
  if (!candidates.length) return null;
  const cur = rng.pick(candidates);
  const next = ctx.chapterVerses.find((x) => x.verse === cur.verse + 1);
  const others = distractVerses(ctx, rng, /* @__PURE__ */ new Set([cur.ref, next.ref]), 3).filter((v) => v.arabic !== next.arabic);
  if (others.length < 2) return null;
  const { options, answer } = shuffleOptions(rng, [next.arabic, ...others.map((v) => v.arabic)], 0);
  const p = rng.int(3);
  return {
    type: "mcq",
    difficulty: 1,
    dimension: "order",
    kind: "next",
    stem: fill(TPL.next[p], ctx.lang, { verse: cur.arabic, ref: cur.ref }),
    options,
    answer,
    sourceRefs: [cur.ref, next.ref],
    materialIds: [],
    explanation: fill(TPL.explain.next, ctx.lang, { ref: cur.ref, next: next.ref }),
    phrasing: p,
    proof: { kind: "order", refs: [cur.ref, next.ref], texts: [next.arabic] }
  };
}
function genFill(ctx, rng) {
  const long = ctx.verses.filter((v) => tokenizeVerse(v.arabic).length >= 3);
  if (!long.length) return null;
  const target = rng.pick(long);
  const toks = tokenizeVerse(target.arabic);
  const glossed = toks.filter((t2) => ctx.parse.vocabulary.some((w) => w.materialId && w.word === t2.raw));
  const pickFrom = glossed.length ? glossed : toks;
  const tok = rng.pick(pickFrom);
  const entry = ctx.parse.vocabulary.find((w) => w.word === tok.raw);
  const pool = ctx.parse.vocabulary.filter((w) => w.word !== tok.raw && Math.abs(w.word.length - tok.raw.length) <= 3);
  const distract = rng.sample(pool, 3).map((w) => w.word);
  if (distract.length < 2) return null;
  const blanked = target.arabic.split(/\s+/).map((piece) => piece === tok.raw ? "______" : piece).join(" ");
  const { options, answer } = shuffleOptions(rng, [tok.raw, ...distract], 0);
  const p = rng.int(3);
  return {
    type: "fill",
    difficulty: 1,
    dimension: entry?.materialId ? "vocabulary" : "memory",
    kind: "fill",
    stem: fill(TPL.fill[p], ctx.lang, { ref: target.ref, verse: blanked }),
    options,
    answer,
    sourceRefs: [target.ref],
    materialIds: entry?.materialId ? [entry.materialId] : [],
    explanation: fill(TPL.explain.fill, ctx.lang, { ref: target.ref, word: tok.raw }),
    phrasing: p,
    proof: { kind: "verbatim", texts: [tok.raw], refs: [target.ref] }
  };
}
function genOrderVerses(ctx, rng, difficulty) {
  const n = difficulty >= 3 ? 5 : difficulty === 2 ? 4 : 3;
  if (ctx.verses.length < n) return null;
  const start = rng.int(ctx.verses.length - n + 1);
  const seq = ctx.verses.slice(start, start + n);
  if (new Set(seq.map((v) => v.arabic)).size < n) return null;
  const idx = rng.shuffle(seq.map((_, i) => i));
  const options = idx.map((i) => seq[i].arabic);
  const answer = seq.map((_, i) => idx.indexOf(i));
  const p = rng.int(3);
  const range = rangeLabel(seq[0].verse, seq[n - 1].verse);
  return {
    type: "order",
    difficulty,
    dimension: "order",
    kind: "orderVerses",
    stem: fill(TPL.orderVerses[p], ctx.lang, { chapter: ctx.chapterName, range }),
    options,
    answer,
    sourceRefs: seq.map((v) => v.ref),
    materialIds: [],
    explanation: fill(TPL.explain.orderVerses, ctx.lang, { refs: seq.map((v) => v.ref).join(" \u2192 ") }),
    phrasing: p,
    proof: { kind: "order", refs: seq.map((v) => v.ref), texts: seq.map((v) => v.arabic) }
  };
}
function genOrderWords(ctx, rng) {
  const ok = ctx.verses.filter((v) => {
    const n = tokenizeVerse(v.arabic).length;
    return n >= 4 && n <= 8;
  });
  if (!ok.length) return null;
  const target = rng.pick(ok);
  const words = tokenizeVerse(target.arabic).map((t2) => t2.raw);
  if (new Set(words).size < words.length) return null;
  const idx = rng.shuffle(words.map((_, i) => i));
  const options = idx.map((i) => words[i]);
  const answer = words.map((_, i) => idx.indexOf(i));
  const p = rng.int(3);
  return {
    type: "order",
    difficulty: 1,
    dimension: "order",
    kind: "orderWords",
    stem: fill(TPL.orderWords[p], ctx.lang, { ref: target.ref }),
    options,
    answer,
    sourceRefs: [target.ref],
    materialIds: [],
    explanation: fill(TPL.explain.orderWords, ctx.lang, { ref: target.ref }),
    phrasing: p,
    proof: { kind: "order", refs: [target.ref], texts: words }
  };
}
function genOrderEvents(ctx, rng) {
  const events = ctx.parse.events;
  if (events.length < 3) return null;
  const n = Math.min(4, events.length);
  const start = rng.int(events.length - n + 1);
  const seq = events.slice(start, start + n);
  const idx = rng.shuffle(seq.map((_, i) => i));
  const labels = seq.map((e) => fill(TPL.eventLabel, ctx.lang, { n: e.order, title: labelOf(e.title, ctx.lang), range: rangeLabel(e.from, e.to) }));
  const options = idx.map((i) => labels[i]);
  const answer = seq.map((_, i) => idx.indexOf(i));
  const p = rng.int(3);
  const unitIds = ctx.parse.units.filter((u) => seq.some((e) => e.from === u.from && e.to === u.to)).map((u) => u.id);
  return {
    type: "order",
    difficulty: 3,
    dimension: "comprehension",
    kind: "orderEvents",
    stem: fill(TPL.orderEvents[p], ctx.lang, { chapter: ctx.chapterName, range: rangeLabel(seq[0].from, seq[n - 1].to) }),
    options,
    answer,
    sourceRefs: seq.map((e) => rangeLabel(e.from, e.to, ctx.parse.chapter)),
    materialIds: unitIds,
    explanation: fill(TPL.explain.orderEvents, ctx.lang, { refs: seq.map((e) => rangeLabel(e.from, e.to)).join(" \u2192 ") }),
    phrasing: p,
    proof: { kind: "material", ids: unitIds }
  };
}
function genMatchWords(ctx, rng) {
  const glossed = ctx.parse.vocabulary.filter((w) => w.meaning && w.materialId);
  const uniq = [];
  const seenMeaning = /* @__PURE__ */ new Set();
  for (const w of rng.shuffle(glossed)) {
    const m = labelOf(w.meaning, ctx.lang);
    if (seenMeaning.has(m)) continue;
    seenMeaning.add(m);
    uniq.push(w);
    if (uniq.length === 4) break;
  }
  if (uniq.length < 3) return null;
  const left = uniq.map((w) => w.word);
  const meanings = uniq.map((w) => labelOf(w.meaning, ctx.lang));
  const idx = rng.shuffle(meanings.map((_, i) => i));
  const options = idx.map((i) => meanings[i]);
  const answer = meanings.map((_, i) => idx.indexOf(i));
  const refs = Array.from(new Set(uniq.flatMap((w) => w.refs.slice(0, 2))));
  const p = rng.int(3);
  const range = rangeLabel(ctx.parse.from, ctx.parse.to);
  return {
    type: "match",
    difficulty: 2,
    dimension: "vocabulary",
    kind: "matchWords",
    stem: fill(TPL.matchWords[p], ctx.lang, { chapter: ctx.chapterName, range }),
    options,
    left,
    answer,
    sourceRefs: refs,
    materialIds: uniq.map((w) => w.materialId),
    explanation: fill(TPL.explain.matchWords, ctx.lang, { source: ctx.glossarySource, range: `${ctx.chapterName} ${range}` }),
    phrasing: p,
    proof: { kind: "material", ids: uniq.map((w) => w.materialId), texts: left }
  };
}
function unitLabel(ctx, u) {
  return fill(TPL.unitLabel, ctx.lang, { n: u.index, title: labelOf(u.title, ctx.lang), range: rangeLabel(u.from, u.to) });
}
function genMatchUnits(ctx, rng) {
  const units = ctx.parse.units.filter((u) => u.verseRefs.length);
  if (units.length < 3) return null;
  const chosen = rng.sample(units, Math.min(4, units.length));
  const pairs = chosen.map((u) => {
    const ref = rng.pick(u.verseRefs);
    return { u, v: ctx.verses.find((x) => x.ref === ref) };
  }).filter((p2) => !!p2.v);
  if (pairs.length < 3 || new Set(pairs.map((p2) => p2.v.arabic)).size < pairs.length) return null;
  const left = pairs.map((p2) => p2.v.arabic);
  const labels = pairs.map((p2) => unitLabel(ctx, p2.u));
  const idx = rng.shuffle(labels.map((_, i) => i));
  const options = idx.map((i) => labels[i]);
  const answer = labels.map((_, i) => idx.indexOf(i));
  const p = rng.int(3);
  return {
    type: "match",
    difficulty: 3,
    dimension: "comprehension",
    kind: "matchUnits",
    stem: fill(TPL.matchUnits[p], ctx.lang, { chapter: ctx.chapterName, range: rangeLabel(ctx.parse.from, ctx.parse.to) }),
    options,
    left,
    answer,
    sourceRefs: pairs.map((x) => x.v.ref),
    materialIds: chosen.map((u) => u.id),
    explanation: fill(TPL.explain.matchUnits, ctx.lang, {}),
    phrasing: p,
    proof: { kind: "material", ids: chosen.map((u) => u.id), refs: pairs.map((x) => x.v.ref) }
  };
}
function genConcept(ctx, rng) {
  const concepts = ctx.parse.concepts.filter((c2) => c2.verseRefs.length);
  if (!concepts.length) return null;
  const c = rng.pick(concepts);
  const inside = ctx.verses.filter((v) => c.verseRefs.includes(v.ref));
  const outside = ctx.chapterVerses.filter((v) => !c.verseRefs.includes(v.ref));
  if (!inside.length || outside.length < 2) return null;
  const target = rng.pick(inside);
  const others = rng.sample(outside, 3).filter((v) => v.arabic !== target.arabic);
  if (others.length < 2) return null;
  const { options, answer } = shuffleOptions(rng, [target.arabic, ...others.map((v) => v.arabic)], 0);
  const p = rng.int(3);
  const label = labelOf(c.label, ctx.lang);
  return {
    type: "concept",
    difficulty: 2,
    dimension: "concept",
    kind: "concept",
    stem: fill(TPL.concept[p], ctx.lang, { concept: label }),
    options,
    answer,
    sourceRefs: [target.ref],
    conceptId: c.id,
    conceptLabel: label,
    materialIds: c.materialIds,
    explanation: fill(TPL.explain.concept, ctx.lang, { concept: label, refs: c.verseRefs.slice(0, 6).join(", ") }),
    phrasing: p,
    proof: { kind: "material", ids: c.materialIds, texts: [target.arabic], refs: [target.ref] }
  };
}
function genConceptUnit(ctx, rng) {
  const units = ctx.parse.units.filter((u2) => u2.conceptIds.length);
  if (units.length < 3) return null;
  const u = rng.pick(units);
  const c = ctx.parse.concepts.find((x) => x.id === rng.pick(u.conceptIds));
  if (!c) return null;
  const others = rng.sample(ctx.parse.units.filter((x) => x.id !== u.id), 3);
  if (others.length < 2) return null;
  const { options, answer } = shuffleOptions(rng, [unitLabel(ctx, u), ...others.map((x) => unitLabel(ctx, x))], 0);
  const p = rng.int(3);
  const label = labelOf(c.label, ctx.lang);
  return {
    type: "concept",
    difficulty: 3,
    dimension: "concept",
    kind: "conceptUnit",
    stem: fill(TPL.conceptUnit[p], ctx.lang, { concept: label }),
    options,
    answer,
    sourceRefs: u.verseRefs.slice(0, 3),
    conceptId: c.id,
    conceptLabel: label,
    materialIds: [u.id, ...c.materialIds],
    explanation: fill(TPL.explain.conceptUnit, ctx.lang, { concept: label, unit: labelOf(u.title, ctx.lang), refs: rangeLabel(u.from, u.to) }),
    phrasing: p,
    proof: { kind: "material", ids: [u.id, c.id] }
  };
}
function genThemeVerse(ctx, rng) {
  const units = ctx.parse.units.filter((u2) => u2.verseRefs.length && u2.origin === "approved");
  if (!units.length) return null;
  const u = rng.pick(units);
  const inside = ctx.verses.filter((v) => u.verseRefs.includes(v.ref));
  const outside = ctx.chapterVerses.filter((v) => !u.verseRefs.includes(v.ref));
  if (!inside.length || outside.length < 2) return null;
  const target = rng.pick(inside);
  const others = rng.sample(outside, 3).filter((v) => v.arabic !== target.arabic);
  if (others.length < 2) return null;
  const { options, answer } = shuffleOptions(rng, [target.arabic, ...others.map((v) => v.arabic)], 0);
  const p = rng.int(3);
  const unit = labelOf(u.title, ctx.lang);
  const theme = labelOf(u.theme, ctx.lang);
  return {
    type: "mcq",
    difficulty: 2,
    dimension: "comprehension",
    kind: "themeVerse",
    stem: fill(TPL.themeVerse[p], ctx.lang, { unit, theme }),
    options,
    answer,
    sourceRefs: [target.ref],
    materialIds: [u.id],
    explanation: fill(TPL.explain.themeVerse, ctx.lang, { ref: target.ref, unit, theme }),
    phrasing: p,
    proof: { kind: "material", ids: [u.id], texts: [target.arabic], refs: [target.ref] }
  };
}
function genUnitTheme(ctx, rng) {
  const units = ctx.parse.units.filter((u2) => labelOf(u2.theme, ctx.lang).trim());
  if (units.length < 3) return null;
  const u = rng.pick(units);
  const others = rng.sample(units.filter((x) => x.id !== u.id && labelOf(x.theme, ctx.lang) !== labelOf(u.theme, ctx.lang)), 3);
  if (others.length < 2) return null;
  const theme = labelOf(u.theme, ctx.lang);
  const { options, answer } = shuffleOptions(rng, [theme, ...others.map((x) => labelOf(x.theme, ctx.lang))], 0);
  const p = rng.int(3);
  const unit = unitLabel(ctx, u);
  return {
    type: "mcq",
    difficulty: 1,
    dimension: "comprehension",
    kind: "unitTheme",
    stem: fill(TPL.unitTheme[p], ctx.lang, { unit }),
    options,
    answer,
    sourceRefs: u.verseRefs.slice(0, 3),
    materialIds: [u.id],
    explanation: fill(TPL.explain.unitTheme, ctx.lang, { unit, theme, range: rangeLabel(u.from, u.to) }),
    phrasing: p,
    proof: { kind: "material", ids: [u.id], refs: u.verseRefs.slice(0, 3) }
  };
}
function genVerseUnit(ctx, rng) {
  const units = ctx.parse.units.filter((u2) => u2.verseRefs.length);
  if (units.length < 2) return null;
  const u = rng.pick(units);
  const v = ctx.verses.find((x) => x.ref === rng.pick(u.verseRefs));
  if (!v) return null;
  const others = rng.sample(units.filter((x) => x.id !== u.id), 3);
  const { options, answer } = shuffleOptions(rng, [unitLabel(ctx, u), ...others.map((x) => unitLabel(ctx, x))], 0);
  const p = rng.int(3);
  return {
    type: "concept",
    difficulty: 2,
    dimension: "comprehension",
    kind: "verseUnit",
    stem: fill(TPL.verseUnit[p], ctx.lang, { verse: v.arabic, ref: v.ref }),
    options,
    answer,
    sourceRefs: [v.ref],
    materialIds: [u.id],
    explanation: fill(TPL.explain.verseUnit, ctx.lang, { ref: v.ref, unit: labelOf(u.title, ctx.lang), range: rangeLabel(u.from, u.to) }),
    phrasing: p,
    proof: { kind: "material", ids: [u.id], refs: [v.ref], texts: [v.arabic] }
  };
}
function genConceptPair(ctx, rng) {
  const units = ctx.parse.units.filter((u2) => u2.conceptIds.length >= 2);
  const all = ctx.parse.units.filter((u2) => u2.verseRefs.length);
  if (!units.length || all.length < 2) return null;
  const u = rng.pick(units);
  const [ca, cb] = rng.sample(u.conceptIds, 2).map((id) => ctx.parse.concepts.find((c) => c.id === id));
  if (!ca || !cb) return null;
  const others = rng.sample(all.filter((x) => x.id !== u.id), 3);
  const { options, answer } = shuffleOptions(rng, [unitLabel(ctx, u), ...others.map((x) => unitLabel(ctx, x))], 0);
  const p = rng.int(3);
  const a = labelOf(ca.label, ctx.lang);
  const b = labelOf(cb.label, ctx.lang);
  return {
    type: "concept",
    difficulty: 3,
    dimension: "comprehension",
    kind: "conceptPair",
    stem: fill(TPL.conceptPair[p], ctx.lang, { a, b }),
    options,
    answer,
    sourceRefs: u.verseRefs.slice(0, 3),
    materialIds: [u.id, ca.id, cb.id],
    explanation: fill(TPL.explain.conceptPair, ctx.lang, { a, b, unit: labelOf(u.title, ctx.lang), range: rangeLabel(u.from, u.to) }),
    phrasing: p,
    proof: { kind: "material", ids: [u.id, ca.id, cb.id] }
  };
}
function verifyDraft(d, ctx, materialIds) {
  const lang2 = ctx.lang;
  const byRef = new Map(ctx.chapterVerses.map((v) => [v.ref, v]));
  if (d.proof.kind === "verbatim") {
    for (const [i, text] of (d.proof.texts || []).entries()) {
      const ref = d.proof.refs?.[i] || d.proof.refs?.[0] || "";
      const v = byRef.get(ref);
      if (!v || !(v.arabic === text || v.arabic.split(/\s+/).includes(text))) return { ok: false, note: fill(TPL.verify.fail, lang2, { why: `${ref} \u220C ${text.slice(0, 20)}` }) };
    }
    const ans = typeof d.answer === "number" ? d.options[d.answer] : "";
    if (ans && !(d.proof.texts || []).includes(ans)) return { ok: false, note: fill(TPL.verify.fail, lang2, { why: "answer\u2260proof" }) };
    return { ok: true, note: fill(TPL.verify.ok_verbatim, lang2, { refs: (d.proof.refs || []).join(", ") }) };
  }
  if (d.proof.kind === "order") {
    const refs = d.proof.refs || [];
    if (d.kind === "orderVerses") {
      const nums = refs.map((r) => Number(r.split(":")[1]));
      for (let i = 1; i < nums.length; i += 1) if (nums[i] !== nums[i - 1] + 1) return { ok: false, note: fill(TPL.verify.fail, lang2, { why: "refs not consecutive" }) };
      const seq = d.answer.map((i) => d.options[i]);
      for (const [i, r] of refs.entries()) if (byRef.get(r)?.arabic !== seq[i]) return { ok: false, note: fill(TPL.verify.fail, lang2, { why: `${r} text mismatch` }) };
    } else if (d.kind === "orderWords") {
      const v = byRef.get(refs[0]);
      const seq = d.answer.map((i) => d.options[i]).join(" ");
      if (!v || tokenizeVerse(v.arabic).map((t2) => t2.raw).join(" ") !== seq) return { ok: false, note: fill(TPL.verify.fail, lang2, { why: "word order mismatch" }) };
    } else if (d.kind === "next") {
      const [a, b] = refs.map((r) => Number(r.split(":")[1]));
      if (b !== a + 1 || byRef.get(refs[1])?.arabic !== d.options[d.answer]) return { ok: false, note: fill(TPL.verify.fail, lang2, { why: "next verse mismatch" }) };
    }
    return { ok: true, note: fill(TPL.verify.ok_order, lang2, { refs: refs.join(", ") }) };
  }
  const ids = d.proof.ids || [];
  if (!ids.length || ids.some((id) => !materialIds.has(id))) return { ok: false, note: fill(TPL.verify.fail, lang2, { why: "material not approved" }) };
  for (const [i, text] of (d.proof.texts || []).entries()) {
    if (d.kind === "matchWords") {
      if (!ctx.verses.some((v) => v.arabic.split(/\s+/).includes(text))) return { ok: false, note: fill(TPL.verify.fail, lang2, { why: `word \u2209 range: ${text}` }) };
    } else if (d.proof.refs?.[i] && byRef.get(d.proof.refs[i])?.arabic !== text) return { ok: false, note: fill(TPL.verify.fail, lang2, { why: "verse mismatch" }) };
  }
  return { ok: true, note: fill(TPL.verify.ok_material, lang2, { ids: ids.slice(0, 3).join(", ") }) };
}
function questionFace(q) {
  return [q.stem.trim(), q.options.slice().sort().join("|"), (q.left || []).slice().sort().join("|")].join("\n");
}
function questionIdentity(q) {
  const ans = typeof q.answer === "number" ? q.options[q.answer] ?? "" : q.answer.map((i, k) => `${q.left?.[k] ?? ""}>${q.options[i] ?? ""}`).join("|");
  return [q.type, q.dimension, q.conceptId || "", q.sourceRefs.join(","), q.options.slice().sort().join("|"), (q.left || []).slice().sort().join("|"), ans].join("#");
}
function generatorsFor(difficulty, audience) {
  if (audience !== "full") {
    const all = [
      { kind: "unitTheme", type: "mcq", fn: genUnitTheme },
      { kind: "matchWords", type: "match", fn: genMatchWords },
      { kind: "concept", type: "concept", fn: genConcept },
      { kind: "conceptUnit", type: "concept", fn: genConceptUnit },
      { kind: "conceptPair", type: "concept", fn: genConceptPair },
      { kind: "matchUnits", type: "match", fn: genMatchUnits },
      { kind: "orderEvents", type: "order", fn: genOrderEvents }
    ];
    if (difficulty === 1) return all.filter((g) => ["unitTheme", "matchWords", "concept"].includes(g.kind));
    if (difficulty === 2) return all.filter((g) => ["concept", "conceptUnit", "matchUnits", "unitTheme"].includes(g.kind));
    return all.filter((g) => ["conceptPair", "orderEvents", "matchUnits", "conceptUnit"].includes(g.kind));
  }
  return generatorsForAll(difficulty);
}
function generatorsForAll(difficulty) {
  if (difficulty === 1) {
    return [
      { kind: "identify", type: "mcq", fn: genIdentify },
      { kind: "next", type: "mcq", fn: genNext },
      { kind: "fill", type: "fill", fn: genFill },
      { kind: "orderWords", type: "order", fn: genOrderWords },
      { kind: "orderVerses", type: "order", fn: (c, r) => genOrderVerses(c, r, 1) }
    ];
  }
  if (difficulty === 2) {
    return [
      { kind: "matchWords", type: "match", fn: genMatchWords },
      { kind: "concept", type: "concept", fn: genConcept },
      { kind: "themeVerse", type: "mcq", fn: genThemeVerse },
      { kind: "verseUnit", type: "concept", fn: genVerseUnit },
      { kind: "orderVerses", type: "order", fn: (c, r) => genOrderVerses(c, r, 2) },
      { kind: "fill", type: "fill", fn: genFill }
    ];
  }
  return [
    { kind: "matchUnits", type: "match", fn: genMatchUnits },
    { kind: "conceptUnit", type: "concept", fn: genConceptUnit },
    { kind: "conceptPair", type: "concept", fn: genConceptPair },
    { kind: "orderEvents", type: "order", fn: genOrderEvents },
    { kind: "orderVerses", type: "order", fn: (c, r) => genOrderVerses(c, r, 3) }
  ];
}
var DIM_KINDS = { memory: ["identify", "fill"], order: ["next", "orderWords", "orderVerses"], vocabulary: ["fill", "matchWords"], comprehension: ["unitTheme", "themeVerse", "verseUnit", "conceptPair", "matchUnits", "orderEvents"], concept: ["concept", "conceptUnit"] };
function dimensionQuota(count, focus) {
  if (focus) return {};
  const q = Math.max(1, Math.round(count * 0.15));
  return count >= 4 ? { comprehension: q, concept: q } : {};
}
function defaultMix(level) {
  if (level === "beginner") return { 1: 0.6, 2: 0.3, 3: 0.1 };
  if (level === "intermediate") return { 1: 0.35, 2: 0.4, 3: 0.25 };
  return { 1: 0.2, 2: 0.4, 3: 0.4 };
}
function draftMatchesFocus(d, focus) {
  if (!focus) return true;
  if (focus.conceptId) return d.conceptId === focus.conceptId || d.materialIds.includes(focus.conceptId);
  if (focus.kind === "verse" && focus.key) return d.sourceRefs.includes(focus.key);
  if (focus.kind === "vocabulary" && focus.key) return d.materialIds.includes(focus.key) || d.options.includes(focus.key) || (d.left || []).includes(focus.key);
  if (focus.kind === "type" && focus.key) return d.type === focus.key;
  if (focus.dimension) return d.dimension === focus.dimension;
  return true;
}
function generateQuestions(ctx, seed, spec, approvedIds) {
  const rng = new SeededRng(seed);
  const mix = spec.mix || defaultMix("beginner");
  const want = [];
  for (let i = 0; i < spec.count; i += 1) {
    const r = rng.next();
    want.push(r < mix[1] ? 1 : r < mix[1] + mix[2] ? 2 : 3);
  }
  const out = [];
  const seen = new Set(spec.exclude || []);
  const seenFaces = new Set(spec.excludeFaces || []);
  const strictBudget = spec.count * (spec.exclude?.length ? 200 : 60);
  const variantBudget = strictBudget + spec.count * 80;
  const anyTypeBudget = variantBudget + (spec.types?.length ? spec.count * 80 : 0);
  let relaxed = false;
  let anyType = false;
  let rejected = 0;
  let guard = 0;
  let slotFailures = 0;
  while (out.length < spec.count && guard < anyTypeBudget) {
    guard += 1;
    if (!relaxed && guard > strictBudget) {
      relaxed = true;
      slotFailures = 0;
    }
    if (!anyType && guard > variantBudget) {
      anyType = true;
      slotFailures = 0;
    }
    if (anyType && out.length >= Math.min(spec.count, 3)) break;
    let difficulty = want[out.length] ?? 1;
    if (slotFailures >= 12 && difficulty > 1) difficulty = difficulty - Math.min(difficulty - 1, Math.floor(slotFailures / 12));
    let gens = generatorsFor(difficulty, spec.audience);
    if (spec.types?.length && !anyType) {
      gens = gens.filter((g) => spec.types.includes(g.type));
      if (!gens.length) gens = [1, 2, 3].flatMap((d2) => generatorsFor(d2, spec.audience)).filter((g) => spec.types.includes(g.type));
    }
    if (spec.focus?.dimension) {
      const dim = spec.focus.dimension;
      const dimKinds = DIM_KINDS;
      const allowed = dimKinds[dim];
      const filtered = gens.filter((g) => allowed.includes(g.kind));
      if (filtered.length) gens = filtered;
      else gens = [1, 2, 3].flatMap((d2) => generatorsFor(d2, spec.audience)).filter((g) => allowed.includes(g.kind));
    }
    if (spec.focus?.conceptId) {
      const conceptGens = [2, 3].flatMap((d2) => generatorsFor(d2, spec.audience)).filter((g) => g.kind === "concept" || g.kind === "conceptUnit" || g.kind === "matchUnits");
      gens = guard % 3 === 0 ? gens : conceptGens;
    }
    if (!gens.length && slotFailures < 40) {
      slotFailures += 1;
      continue;
    }
    if (!gens.length) break;
    const gen = rng.pick(gens);
    const d = gen.fn(ctx, rng);
    if (!d) {
      slotFailures += 1;
      continue;
    }
    if (!draftMatchesFocus(d, spec.focus) && slotFailures < 30) {
      slotFailures += 1;
      continue;
    }
    if (spec.focus?.conceptId && !d.conceptId && d.materialIds.includes(spec.focus.conceptId)) {
      d.conceptId = spec.focus.conceptId;
      d.conceptLabel = d.conceptLabel || ctx.parse.concepts.find((c) => c.id === spec.focus.conceptId)?.label[ctx.lang] || spec.focus.conceptId;
    }
    if (!relaxed && seen.has(questionIdentity(d)) || seenFaces.has(questionFace(d))) {
      slotFailures += 1;
      continue;
    }
    const check = verifyDraft(d, ctx, approvedIds);
    if (!check.ok) {
      rejected += 1;
      slotFailures += 1;
      continue;
    }
    seen.add(questionIdentity(d));
    seenFaces.add(questionFace(d));
    slotFailures = 0;
    out.push({
      id: `q-${seed}-${out.length + 1}`,
      type: d.type,
      difficulty: d.difficulty,
      dimension: d.dimension,
      stem: d.stem,
      options: d.options,
      left: d.left,
      answer: d.answer,
      sourceRefs: d.sourceRefs,
      conceptId: d.conceptId,
      conceptLabel: d.conceptLabel,
      materialIds: d.materialIds,
      explanation: d.explanation,
      verified: true,
      verifyNote: check.note,
      reviewStatus: "draft",
      aiGenerated: true,
      generator: "template",
      phrasing: d.phrasing
    });
  }
  for (const [dim, need] of Object.entries(dimensionQuota(spec.count, spec.focus))) {
    let have = out.filter((q) => q.dimension === dim).length;
    let tries = 0;
    while (have < need && tries < 40) {
      tries += 1;
      const gens = [1, 2, 3].flatMap((d2) => generatorsFor(d2, spec.audience)).filter((g) => DIM_KINDS[dim].includes(g.kind) && (!spec.types?.length || spec.types.includes(g.type)));
      if (!gens.length) break;
      const d = rng.pick(gens).fn(ctx, rng);
      if (!d || seen.has(questionIdentity(d)) || seenFaces.has(questionFace(d))) continue;
      const check = verifyDraft(d, ctx, approvedIds);
      if (!check.ok) {
        rejected += 1;
        continue;
      }
      seen.add(questionIdentity(d));
      seenFaces.add(questionFace(d));
      const q = {
        id: `q-${seed}-x${out.length + tries}`,
        type: d.type,
        difficulty: d.difficulty,
        dimension: d.dimension,
        stem: d.stem,
        options: d.options,
        left: d.left,
        answer: d.answer,
        sourceRefs: d.sourceRefs,
        conceptId: d.conceptId,
        conceptLabel: d.conceptLabel,
        materialIds: d.materialIds,
        explanation: d.explanation,
        verified: true,
        verifyNote: check.note,
        reviewStatus: "draft",
        aiGenerated: true,
        generator: "template",
        phrasing: d.phrasing
      };
      if (out.length < spec.count) out.push(q);
      else {
        const dims = out.map((x) => x.dimension);
        const idx = [dims.lastIndexOf("memory"), dims.lastIndexOf("order"), dims.lastIndexOf("vocabulary")].find((i) => i >= 0) ?? -1;
        if (idx < 0) break;
        out.splice(idx, 1, q);
      }
      have += 1;
    }
  }
  if (spec.focus && out.length && !out.some((q) => draftMatchesFocus(q, spec.focus))) {
    const focusGens = [1, 2, 3].flatMap((d) => generatorsFor(d, spec.audience));
    for (let i = 0; i < 200; i += 1) {
      const d = rng.pick(focusGens).fn(ctx, rng);
      if (!d || !draftMatchesFocus(d, spec.focus)) continue;
      if (seen.has(questionIdentity(d)) || seenFaces.has(questionFace(d))) continue;
      if (spec.focus.conceptId && !d.conceptId && d.materialIds.includes(spec.focus.conceptId)) {
        d.conceptId = spec.focus.conceptId;
        d.conceptLabel = d.conceptLabel || ctx.parse.concepts.find((c) => c.id === spec.focus.conceptId)?.label[ctx.lang] || spec.focus.conceptId;
      }
      const check = verifyDraft(d, ctx, approvedIds);
      if (!check.ok) {
        rejected += 1;
        continue;
      }
      seen.add(questionIdentity(d));
      seenFaces.add(questionFace(d));
      out[out.length - 1] = {
        id: out[out.length - 1].id,
        type: d.type,
        difficulty: d.difficulty,
        dimension: d.dimension,
        stem: d.stem,
        options: d.options,
        left: d.left,
        answer: d.answer,
        sourceRefs: d.sourceRefs,
        conceptId: d.conceptId,
        conceptLabel: d.conceptLabel,
        materialIds: d.materialIds,
        explanation: d.explanation,
        verified: true,
        verifyNote: check.note,
        reviewStatus: "draft",
        aiGenerated: true,
        generator: "template",
        phrasing: d.phrasing
      };
      break;
    }
  }
  const shuffled = rng.shuffle(out).map((q, i) => ({ ...q, id: `q-${seed}-${i + 1}` }));
  return { questions: shuffled, rejected };
}
function buildVariants(paper, studentIds, seedSalt = "") {
  return studentIds.map((studentId) => {
    const rng = new SeededRng(`${paper.seed}:${seedSalt}:${studentId}`);
    const order = rng.shuffle(paper.questions.map((q) => q.id));
    const optionOrder = {};
    for (const q of paper.questions) {
      const idx = q.options.map((_, i) => i);
      optionOrder[q.id] = q.type === "order" || q.type === "match" ? idx : rng.shuffle(idx);
    }
    const signature = paperSignature((0, import_quranPaperVariant.variantQuestions)(paper, { studentId, order, optionOrder, signature: "" }));
    return { studentId, order, optionOrder, signature };
  });
}
function paperSignature(questions) {
  return questions.map((q) => `${q.stem.slice(0, 24)}#${q.options.map((o) => o.slice(0, 6)).join(",")}`).join("|");
}
function paperTitle(kind, lang2, vars) {
  return fill(TPL.paperTitle[kind], lang2, vars);
}
function isCorrect(q, answer) {
  if (answer === null || answer === void 0) return false;
  if (typeof q.answer === "number") return answer === q.answer;
  if (!Array.isArray(answer) || answer.length !== q.answer.length) return false;
  return q.answer.every((v, i) => v === answer[i]);
}

// ../../../totalclaw-solutions/solutions/workbench-quran-teaching/src/main/services/quranTeaching/graph.ts
function buildGraph(parse, verses, chapterName2, lang2, papers, records, students) {
  const nodes = [];
  const edges = [];
  const chapterId = `ch-${parse.chapter}`;
  nodes.push({ id: chapterId, kind: "chapter", label: chapterName2, sub: `${parse.chapter} \xB7 ${rangeLabel(parse.from, parse.to)}`, refs: verses.map((v) => v.ref), level: 0 });
  const questions = papers.flatMap((p) => p.questions);
  const qById = new Map(questions.map((q) => [q.id, q]));
  const masteryFor = (match) => {
    const out = {};
    let any = false;
    for (const s of students) {
      let c = 0;
      let t2 = 0;
      for (const r of records) {
        if (r.studentId !== s.id) continue;
        const q = qById.get(r.questionId);
        if (!q || !match(q)) continue;
        t2 += 1;
        if (isCorrect(q, r.answer)) c += 1;
      }
      if (t2) {
        out[s.id] = Math.round(c / t2 * 100) / 100;
        any = true;
      }
    }
    return any ? out : void 0;
  };
  const collapse = parse.verseCount > 40;
  for (const u of parse.units) {
    const uid = `unit-${u.id}`;
    nodes.push({ id: uid, kind: "unit", label: u.title[lang2], sub: `${rangeLabel(u.from, u.to)}${u.repeated ? ` \xB7 \xD7${u.repeated.count}` : ""}`, refs: u.verseRefs, level: 1, mastery: masteryFor((q) => q.materialIds.includes(u.id) || q.sourceRefs.some((r) => u.verseRefs.includes(r))) });
    edges.push({ id: `e-${chapterId}-${uid}`, source: chapterId, target: uid, kind: "contains" });
    for (const cid of u.conceptIds) {
      const c = parse.concepts.find((x) => x.id === cid);
      if (!c) continue;
      const nid = `concept-${c.id}`;
      if (!nodes.some((n) => n.id === nid)) {
        nodes.push({ id: nid, kind: "concept", label: c.label[lang2], refs: c.verseRefs, level: 2, mastery: masteryFor((q) => q.conceptId === c.id) });
      }
      edges.push({ id: `e-${uid}-${nid}`, source: uid, target: nid, kind: "explains" });
      if (!collapse) {
        for (const ref of c.verseRefs) {
          const vid = `verse-${ref}`;
          if (!nodes.some((n) => n.id === vid)) {
            const v = verses.find((x) => x.ref === ref);
            if (v) nodes.push({ id: vid, kind: "verse", label: v.arabic, sub: ref, refs: [ref], level: 3 });
          }
          edges.push({ id: `e-${nid}-${vid}`, source: nid, target: vid, kind: "covers" });
        }
      }
    }
    if (collapse) {
      const vid = `verse-${u.chapter}:${u.from}-${u.to}`;
      nodes.push({ id: vid, kind: "verse", label: `${u.chapter}:${rangeLabel(u.from, u.to)}`, sub: `${u.verseRefs.length}`, refs: u.verseRefs, level: 3 });
      edges.push({ id: `e-${uid}-${vid}`, source: uid, target: vid, kind: "covers" });
    } else {
      for (const ref of u.verseRefs) {
        const vid = `verse-${ref}`;
        if (nodes.some((n) => n.id === vid)) continue;
        const v = verses.find((x) => x.ref === ref);
        if (v) {
          nodes.push({ id: vid, kind: "verse", label: v.arabic, sub: ref, refs: [ref], level: 3 });
          edges.push({ id: `e-${uid}-${vid}`, source: uid, target: vid, kind: "covers" });
        }
      }
    }
  }
  for (const c of parse.concepts) {
    const qs = questions.filter((q) => q.conceptId === c.id);
    if (!qs.length) continue;
    const qid = `questions-${c.id}`;
    nodes.push({ id: qid, kind: "question", label: `${qs.length}`, sub: qs.map((q) => q.id).join(","), refs: Array.from(new Set(qs.flatMap((q) => q.sourceRefs))), level: 3 });
    edges.push({ id: `e-${qid}`, source: `concept-${c.id}`, target: qid, kind: "tests" });
  }
  nodes.push({ id: `material-${parse.chapter}`, kind: "material", label: `${parse.materialIds.length}`, refs: [], level: 1 });
  edges.push({ id: `e-material-${parse.chapter}`, source: chapterId, target: `material-${parse.chapter}`, kind: "explains" });
  return { chapter: parse.chapter, from: parse.from, to: parse.to, nodes, edges, builtAt: Date.now() };
}

// ../../../totalclaw-solutions/solutions/workbench-quran-teaching/src/main/services/quranTeaching/mediaTemplates.json
var mediaTemplates_default = {
  cardTitle: {
    vocab: [
      "\u8BCD\u6C47\u5361 \xB7 {chapter} {range}",
      "Vocabulary card \xB7 {chapter} {range}",
      "\u0628\u0637\u0627\u0642\u0629 \u0645\u0641\u0631\u062F\u0627\u062A \xB7 {chapter} {range}"
    ],
    concept_map: [
      "\u6982\u5FF5\u56FE \xB7 {chapter} {range}",
      "Concept map \xB7 {chapter} {range}",
      "\u062E\u0631\u064A\u0637\u0629 \u0627\u0644\u0645\u0641\u0627\u0647\u064A\u0645 \xB7 {chapter} {range}"
    ],
    timeline: [
      "\u4E8B\u4EF6\u65F6\u95F4\u7EBF \xB7 {chapter}",
      "Event timeline \xB7 {chapter}",
      "\u0627\u0644\u062E\u0637 \u0627\u0644\u0632\u0645\u0646\u064A \u0644\u0644\u0623\u062D\u062F\u0627\u062B \xB7 {chapter}"
    ],
    review: [
      "\u590D\u4E60\u5361 \xB7 {chapter} {range}",
      "Review card \xB7 {chapter} {range}",
      "\u0628\u0637\u0627\u0642\u0629 \u0645\u0631\u0627\u062C\u0639\u0629 \xB7 {chapter} {range}"
    ],
    structure: [
      "\u7AE0\u8282\u7ED3\u6784\u56FE \xB7 {chapter}",
      "Chapter structure \xB7 {chapter}",
      "\u0628\u0646\u064A\u0629 \u0627\u0644\u0633\u0648\u0631\u0629 \xB7 {chapter}"
    ]
  },
  footer: [
    "\u7ECF\u6587\u6587\u5B57\u53D6\u81EA\u9501\u5B9A\u8BED\u6599 {version}\uFF08\u6821\u9A8C\u901A\u8FC7\uFF09\xB7 \u91CA\u4E49\u6765\u81EA\u6279\u51C6\u8D44\u6599 \xB7 \u672C\u56FE\u7531\u5E73\u53F0\u6A21\u677F\u751F\u6210",
    "Quranic text from locked corpus {version} (verified) \xB7 meanings from approved materials \xB7 generated from a platform template",
    "\u0646\u0635 \u0627\u0644\u0642\u0631\u0622\u0646 \u0645\u0646 \u0627\u0644\u0645\u062F\u0648\u0646\u0629 \u0627\u0644\u0645\u0642\u0641\u0644\u0629 {version} (\u0645\u064F\u062A\u062D\u0642\u0651\u0642 \u0645\u0646\u0647) \xB7 \u0627\u0644\u0645\u0639\u0627\u0646\u064A \u0645\u0646 \u0627\u0644\u0645\u0648\u0627\u062F \u0627\u0644\u0645\u0639\u062A\u0645\u062F\u0629 \xB7 \u0645\u064F\u0648\u0644\u064E\u0651\u062F \u0645\u0646 \u0642\u0627\u0644\u0628 \u0627\u0644\u0645\u0646\u0635\u0629"
  ],
  aiBadge: [
    "AI \u751F\u6210 \xB7 \u5F85\u6559\u5E08\u786E\u8BA4",
    "AI-generated \xB7 pending teacher confirmation",
    "\u0645\u0648\u0644\u064E\u0651\u062F \u0628\u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064A \xB7 \u0628\u0627\u0646\u062A\u0638\u0627\u0631 \u062A\u0623\u0643\u064A\u062F \u0627\u0644\u0645\u0639\u0644\u0645"
  ],
  script: {
    title: [
      "{chapter} {range} \xB7 \u6559\u5B66\u77ED\u7247",
      "{chapter} {range} \xB7 Teaching short",
      "{chapter} {range} \xB7 \u0645\u0642\u0637\u0639 \u062A\u0639\u0644\u064A\u0645\u064A"
    ],
    objective: [
      "\u7528 {sec} \u79D2\u8BB2\u6E05 {chapter} {range} \u7684\u7ED3\u6784\u4E0E\u6838\u5FC3\u6982\u5FF5\uFF0C\u914D\u5408\u9501\u5B9A\u7ECF\u6587\u7684\u6587\u5B57\u5C42\u4E0E\u6279\u51C6\u8BCD\u8868\u7684\u91CA\u4E49\u3002",
      "In {sec} seconds, explain the structure and core concepts of {chapter} {range}, with the locked text as a text layer and approved-glossary meanings.",
      "\u0641\u064A {sec} \u062B\u0627\u0646\u064A\u0629\u060C \u0634\u0631\u062D \u0628\u0646\u064A\u0629 {chapter} {range} \u0648\u0645\u0641\u0627\u0647\u064A\u0645\u0647 \u0627\u0644\u0623\u0633\u0627\u0633\u064A\u0629 \u0645\u0639 \u0637\u0628\u0642\u0629 \u0646\u0635\u064A\u0629 \u0644\u0644\u0646\u0635 \u0627\u0644\u0645\u0642\u0641\u0644 \u0648\u0645\u0639\u0627\u0646\u064A \u0627\u0644\u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0645\u0639\u062A\u0645\u062F\u0629."
    ],
    intro: {
      visual: [
        "\u6807\u9898\u5361\uFF1A\u7AE0\u540D + \u8282\u8303\u56F4\uFF0C\u6DF1\u8272\u80CC\u666F\u4E0E\u51E0\u4F55\u7EB9\u6837\uFF0C\u65E0\u4EBA\u7269",
        "Title card: chapter name + verse range, dark background with geometric pattern, no figures",
        "\u0628\u0637\u0627\u0642\u0629 \u0639\u0646\u0648\u0627\u0646: \u0627\u0633\u0645 \u0627\u0644\u0633\u0648\u0631\u0629 \u0648\u0646\u0637\u0627\u0642 \u0627\u0644\u0622\u064A\u0627\u062A\u060C \u062E\u0644\u0641\u064A\u0629 \u062F\u0627\u0643\u0646\u0629 \u0628\u0632\u062E\u0631\u0641\u0629 \u0647\u0646\u062F\u0633\u064A\u0629\u060C \u062F\u0648\u0646 \u0623\u0634\u062E\u0627\u0635"
      ],
      narration: [
        "\u672C\u8282\u8BFE\u6211\u4EEC\u5B66\u4E60{chapter}\u7B2C {range} \u8282\u3002",
        "In this lesson we study {chapter}, verses {range}.",
        "\u0641\u064A \u0647\u0630\u0627 \u0627\u0644\u062F\u0631\u0633 \u0646\u062F\u0631\u0633 \u0633\u0648\u0631\u0629 {chapter}\u060C \u0627\u0644\u0622\u064A\u0627\u062A {range}."
      ],
      subtitle: [
        "{chapter} \xB7 {range}",
        "{chapter} \xB7 {range}",
        "{chapter} \xB7 {range}"
      ]
    },
    unit: {
      visual: [
        "\u5355\u5143\u5361\uFF1A\u6807\u9898 + \u7ECF\u6587 {refs} \u4EE5\u6587\u5B57\u5C42\u9010\u8282\u6D6E\u73B0",
        "Unit card: title + verses {refs} appear line by line as a text layer",
        "\u0628\u0637\u0627\u0642\u0629 \u0648\u062D\u062F\u0629: \u0627\u0644\u0639\u0646\u0648\u0627\u0646 + \u0627\u0644\u0622\u064A\u0627\u062A {refs} \u062A\u0638\u0647\u0631 \u0633\u0637\u0631\u064B\u0627 \u0633\u0637\u0631\u064B\u0627 \u0643\u0637\u0628\u0642\u0629 \u0646\u0635\u064A\u0629"
      ],
      narration: [
        "\u7B2C {n} \u4E2A\u5355\u5143\uFF1A{title}\u3002{theme}",
        "Unit {n}: {title}. {theme}",
        "\u0627\u0644\u0648\u062D\u062F\u0629 {n}: {title}. {theme}"
      ]
    },
    vocab: {
      visual: [
        "\u8BCD\u6C47\u5361\uFF1A{words} \u4E09\u8BCD\u5E76\u6392\uFF0C\u4E0B\u65B9\u662F\u6279\u51C6\u91CA\u4E49",
        "Vocabulary card: {words} side by side with approved meanings below",
        "\u0628\u0637\u0627\u0642\u0629 \u0645\u0641\u0631\u062F\u0627\u062A: {words} \u062C\u0646\u0628\u064B\u0627 \u0625\u0644\u0649 \u062C\u0646\u0628 \u0645\u0639 \u0627\u0644\u0645\u0639\u0627\u0646\u064A \u0627\u0644\u0645\u0639\u062A\u0645\u062F\u0629 \u062A\u062D\u062A\u0647\u0627"
      ],
      narration: [
        "\u6838\u5FC3\u8BCD\u6C47\uFF1A{list}\u3002",
        "Core vocabulary: {list}.",
        "\u0627\u0644\u0645\u0641\u0631\u062F\u0627\u062A \u0627\u0644\u0623\u0633\u0627\u0633\u064A\u0629: {list}."
      ],
      subtitle: [
        "{words}",
        "{words}",
        "{words}"
      ]
    },
    map: {
      visual: [
        "\u7406\u89E3\u56FE\u52A8\u753B\uFF1A\u7AE0 \u2192 \u5355\u5143 \u2192 \u6982\u5FF5 \u2192 \u7ECF\u6587 \u9010\u5C42\u5C55\u5F00",
        "Understanding map animation: chapter \u2192 units \u2192 concepts \u2192 verses unfold layer by layer",
        "\u062D\u0631\u0643\u0629 \u062E\u0631\u064A\u0637\u0629 \u0627\u0644\u0641\u0647\u0645: \u0627\u0644\u0633\u0648\u0631\u0629 \u2190 \u0627\u0644\u0648\u062D\u062F\u0627\u062A \u2190 \u0627\u0644\u0645\u0641\u0627\u0647\u064A\u0645 \u2190 \u0627\u0644\u0622\u064A\u0627\u062A \u0637\u0628\u0642\u0629 \u0637\u0628\u0642\u0629"
      ],
      narration: [
        "\u628A\u6982\u5FF5\u548C\u7ECF\u6587\u8FDE\u8D77\u6765\uFF1A{concepts}\u3002",
        "Linking concepts to verses: {concepts}.",
        "\u0631\u0628\u0637 \u0627\u0644\u0645\u0641\u0627\u0647\u064A\u0645 \u0628\u0627\u0644\u0622\u064A\u0627\u062A: {concepts}."
      ],
      subtitle: [
        "{concepts}",
        "{concepts}",
        "{concepts}"
      ]
    },
    review: {
      visual: [
        "\u590D\u4E60\u5361\uFF1A\u4E24\u9053\u590D\u4E60\u9898\u9010\u6761\u51FA\u73B0",
        "Review card: two review questions appear one by one",
        "\u0628\u0637\u0627\u0642\u0629 \u0645\u0631\u0627\u062C\u0639\u0629: \u0633\u0624\u0627\u0644\u0627\u0646 \u064A\u0638\u0647\u0631\u0627\u0646 \u062A\u0628\u0627\u0639\u064B\u0627"
      ],
      narration: [
        "\u8BFE\u540E\u590D\u4E60\uFF1A{q1} {q2}",
        "Review after class: {q1} {q2}",
        "\u0645\u0631\u0627\u062C\u0639\u0629 \u0628\u0639\u062F \u0627\u0644\u062F\u0631\u0633: {q1} {q2}"
      ],
      subtitle: [
        "\u590D\u4E60",
        "Review",
        "\u0645\u0631\u0627\u062C\u0639\u0629"
      ]
    },
    reviewQ: [
      [
        "\u7B2C {ref} \u8282\u8BB2\u7684\u662F\u4EC0\u4E48\u4E3B\u9898\uFF1F",
        "What is the theme of verse {ref}?",
        "\u0645\u0627 \u0645\u0648\u0636\u0648\u0639 \u0627\u0644\u0622\u064A\u0629 {ref}\u061F"
      ],
      [
        "\u300C{word}\u300D\u7684\u57FA\u7840\u8BCD\u4E49\u662F\u4EC0\u4E48\uFF1F",
        'What is the basic meaning of "{word}"?',
        "\u0645\u0627 \u0627\u0644\u0645\u0639\u0646\u0649 \u0627\u0644\u0623\u0633\u0627\u0633\u064A \u0644\u0640\xAB{word}\xBB\u061F"
      ],
      [
        "\u672C\u8303\u56F4\u6709\u51E0\u4E2A\u6559\u5B66\u5355\u5143\uFF1F\u5404\u81EA\u7684\u91CD\u70B9\u662F\u4EC0\u4E48\uFF1F",
        "How many teaching units are there, and what is each about?",
        "\u0643\u0645 \u0639\u062F\u062F \u0627\u0644\u0648\u062D\u062F\u0627\u062A \u0627\u0644\u062A\u0639\u0644\u064A\u0645\u064A\u0629 \u0648\u0645\u0627 \u0645\u062D\u0648\u0631 \u0643\u0644 \u0645\u0646\u0647\u0627\u061F"
      ]
    ]
  }
};

// ../../../totalclaw-solutions/solutions/workbench-quran-teaching/src/main/services/quranTeaching/media.ts
var T = mediaTemplates_default;
var esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
var CARD_W = 1280;
var CARD_H = 800;
function cardTextLayer(input) {
  const v = input.verses;
  if (input.kind === "vocab") return input.parse.vocabulary.filter((w) => w.meaning).slice(0, 6).map((w) => w.word);
  if (input.kind === "review") return v.filter((x) => (input.focusRefs || []).includes(x.ref)).slice(0, 3).map((x) => x.arabic);
  if (input.kind === "concept_map") return input.parse.concepts.slice(0, 6).flatMap((c) => c.verseRefs.slice(0, 1)).map((ref) => v.find((x) => x.ref === ref)?.arabic || "").filter(Boolean);
  if (input.kind === "structure") return input.parse.units.slice(0, 8).map((u) => v.find((x) => x.ref === u.verseRefs[0])?.arabic || "").filter(Boolean);
  return [];
}
function buildCardHtml(input, fontCss = "") {
  const { lang: lang2, parse, verses } = input;
  const dir = lang2 === "ar" ? "rtl" : "ltr";
  const title = fill(T.cardTitle[input.kind], lang2, { chapter: input.chapterName, range: rangeLabel(parse.from, parse.to) });
  const footer = fill(T.footer, lang2, { version: input.corpusVersion });
  const bg = input.backgroundDataUrl ? `background: linear-gradient(180deg, rgba(8,20,32,.78), rgba(8,20,32,.9)), url(${input.backgroundDataUrl}) center/cover;` : "background: radial-gradient(1200px 600px at 20% 0%, #1f4d5a 0%, #0d2430 45%, #071620 100%);";
  const byRef = new Map(verses.map((v) => [v.ref, v]));
  let body = "";
  if (input.kind === "vocab") {
    const words = parse.vocabulary.filter((w) => w.meaning).slice(0, 6);
    body = `<div class="grid">${words.map((w) => `<div class="cell"><div class="ar">${esc(w.word)}</div><div class="mean">${esc(w.meaning[lang2])}</div><div class="ref">${esc(w.refs.slice(0, 2).join(" \xB7 "))}</div></div>`).join("")}</div>`;
  } else if (input.kind === "concept_map") {
    const concepts = parse.concepts.slice(0, 6);
    body = `<div class="map"><div class="hub">${esc(input.chapterName)}<small>${rangeLabel(parse.from, parse.to)}</small></div><div class="spokes">${concepts.map((c) => {
      const v = byRef.get(c.verseRefs[0]);
      return `<div class="spoke"><div class="c">${esc(c.label[lang2])}</div><div class="ar small">${esc(v?.arabic || "")}</div><div class="ref">${esc(c.verseRefs.slice(0, 3).join(", "))}</div></div>`;
    }).join("")}</div></div>`;
  } else if (input.kind === "timeline") {
    const events = parse.events.length ? parse.events : parse.units.map((u, i) => ({ order: i + 1, title: u.title, from: u.from, to: u.to, persons: [] }));
    body = `<div class="timeline">${events.slice(0, 8).map((e) => `<div class="ev"><div class="dot">${e.order}</div><div class="t">${esc(e.title[lang2])}</div><div class="ref">${rangeLabel(e.from, e.to)}${e.persons.length ? ` \xB7 ${esc(e.persons.slice(0, 3).map((p) => p[lang2]).join(lang2 === "ar" ? "\u060C " : " / "))}` : ""}</div></div>`).join("")}</div>`;
  } else if (input.kind === "review") {
    const refs = input.focusRefs?.length ? input.focusRefs : verses.slice(0, 3).map((v) => v.ref);
    body = `<div class="review">${refs.slice(0, 3).map((ref) => {
      const v = byRef.get(ref);
      return v ? `<div class="line"><div class="ar">${esc(v.arabic)}</div><div class="ref">${esc(v.ref)}</div></div>` : "";
    }).join("")}<div class="hint">${parse.vocabulary.filter((w) => w.meaning && w.refs.some((r) => refs.includes(r))).slice(0, 4).map((w) => `<span>${esc(w.word)} \u2014 ${esc(w.meaning[lang2])}</span>`).join("")}</div></div>`;
  } else {
    body = `<div class="structure">${parse.units.slice(0, 8).map((u) => `<div class="unit"><div class="n">${u.index}</div><div><div class="t">${esc(u.title[lang2])}</div><div class="ref">${rangeLabel(u.from, u.to)}${u.repeated ? ` \xB7 \xD7${u.repeated.count}` : ""}</div><div class="ar small">${esc(byRef.get(u.verseRefs[0])?.arabic || "")}</div></div></div>`).join("")}</div>`;
  }
  return `<!doctype html><html lang="${lang2 === "ar" ? "ar" : lang2 === "en" ? "en" : "zh-CN"}" dir="${dir}"><head><meta charset="utf-8"><style>${fontCss}
  html,body{margin:0;width:${CARD_W}px;height:${CARD_H}px;overflow:hidden}
  body{${bg}color:#f4efe4;font-family:"Amiri Quran","Amiri","Noto Naskh Arabic","Scheherazade New","Geeza Pro","PingFang SC","Segoe UI",sans-serif;position:relative}
  .frame{position:absolute;inset:22px;border:1px solid rgba(232,201,126,.45);border-radius:18px;pointer-events:none}
  .frame:before{content:"";position:absolute;inset:8px;border:1px solid rgba(232,201,126,.2);border-radius:12px}
  h1{margin:0;padding:44px 64px 8px;font-size:34px;letter-spacing:.5px;color:#e8c97e;font-weight:700}
  .badge{position:absolute;top:48px;${dir === "rtl" ? "left" : "right"}:64px;font-size:14px;padding:6px 12px;border-radius:999px;background:rgba(232,201,126,.16);color:#e8c97e;border:1px solid rgba(232,201,126,.4)}
  .content{padding:8px 64px 0;height:${CARD_H - 190}px;box-sizing:border-box;display:grid;align-content:stretch}
  .content>*{height:100%;box-sizing:border-box}
  .ar{font-size:40px;line-height:1.8;direction:rtl;text-align:right;font-family:"Amiri Quran","Amiri","Noto Naskh Arabic","Scheherazade New","Geeza Pro","KFGQPC Uthman Taha Naskh",serif}
  .ar.small{font-size:26px;line-height:1.7}
  .mean{font-size:20px;color:#d9e6ea;margin-top:6px}
  .ref{font-size:14px;color:#9fb8c2;margin-top:6px;direction:ltr;text-align:${dir === "rtl" ? "right" : "left"}}
  .grid{display:grid;grid-template-columns:repeat(3,1fr);grid-auto-rows:1fr;gap:18px}
  .cell{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);border-radius:14px;padding:18px 20px;display:flex;flex-direction:column;justify-content:center}
  .map{display:flex;gap:28px;align-items:stretch;height:100%}
  .hub{flex:0 0 240px;display:flex;flex-direction:column;justify-content:center;align-items:center;font-size:36px;color:#e8c97e;border:2px solid rgba(232,201,126,.6);border-radius:24px;background:rgba(232,201,126,.08)}
  .hub small{font-size:18px;color:#d9e6ea;margin-top:8px}
  .spokes{flex:1;display:grid;grid-template-columns:repeat(2,1fr);gap:14px}
  .spoke{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);border-radius:14px;padding:14px 16px}
  .spoke .c{font-size:22px;color:#e8c97e;margin-bottom:4px}
  .timeline{display:grid;grid-template-columns:repeat(4,1fr);grid-auto-rows:1fr;gap:22px 16px;padding-top:18px}
  .ev{position:relative;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);border-radius:14px;padding:44px 16px 16px;display:flex;flex-direction:column;justify-content:center}
  .ev .t{font-size:24px;line-height:1.4}
  .dot{position:absolute;top:-14px;${dir === "rtl" ? "right" : "left"}:16px;width:36px;height:36px;border-radius:50%;background:#e8c97e;color:#071620;font-weight:800;display:flex;align-items:center;justify-content:center;font-size:18px}
  .t{font-size:20px;color:#f4efe4}
  .review{display:flex;flex-direction:column;justify-content:center}
  .review .line{padding:12px 0;border-bottom:1px dashed rgba(255,255,255,.18)}
  .review .hint{margin-top:14px;display:flex;flex-wrap:wrap;gap:10px}
  .review .hint span{font-size:18px;padding:6px 12px;border-radius:10px;background:rgba(255,255,255,.08)}
  .structure{display:grid;grid-template-columns:repeat(2,1fr);grid-auto-rows:1fr;gap:12px}
  .unit{display:flex;gap:12px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);border-radius:12px;padding:10px 14px}
  .unit .n{width:32px;height:32px;border-radius:50%;background:#e8c97e;color:#071620;font-weight:800;display:flex;align-items:center;justify-content:center;flex:0 0 auto}
  footer{position:absolute;bottom:34px;left:64px;right:64px;font-size:13px;color:#9fb8c2;display:flex;justify-content:space-between;gap:16px}
  </style></head><body><div class="frame"></div><h1>${esc(title)}</h1><span class="badge">${esc(fill(T.aiBadge, lang2, {}))}</span><div class="content">${body}</div><footer><span>${esc(footer)}</span><span>${esc(input.chapterName)} \xB7 ${parse.chapter}:${rangeLabel(parse.from, parse.to)}</span></footer></body></html>`;
}
function backgroundPrompt(kind) {
  const mood = {
    vocab: "deep teal and gold islamic geometric pattern, soft light, elegant, minimal",
    concept_map: "abstract network of golden lines on dark emerald, geometric arabesque, minimal",
    timeline: "desert dunes at dusk, warm gold and deep blue, subtle geometric border",
    review: "quiet night sky with fine golden arabesque pattern, minimal",
    structure: "layered geometric tiles, deep blue and gold, calm, minimal"
  };
  return `${mood[kind]}, no text, no letters, no calligraphy, no people, no faces, no figures, no animals, background only, high quality`;
}
function buildVideoScript(id, lang2, chapterName2, parse, verses) {
  const range = rangeLabel(parse.from, parse.to);
  const scenes = [];
  let no = 1;
  scenes.push({ no: no++, durationSec: 6, visual: fill(T.script.intro.visual, lang2, {}), narration: fill(T.script.intro.narration, lang2, { chapter: chapterName2, range }), subtitle: fill(T.script.intro.subtitle, lang2, { chapter: chapterName2, range }), verseRefs: [] });
  for (const u of parse.units.slice(0, 4)) {
    const refs = u.verseRefs.slice(0, 3);
    scenes.push({ no: no++, durationSec: 12, visual: fill(T.script.unit.visual, lang2, { refs: refs.join(", ") }), narration: fill(T.script.unit.narration, lang2, { n: u.index, title: u.title[lang2], theme: u.theme[lang2] }), subtitle: refs.map((r) => verses.find((v) => v.ref === r)?.arabic || "").filter(Boolean).join("\n"), verseRefs: refs });
  }
  const words = parse.vocabulary.filter((w) => w.meaning).slice(0, 3);
  if (words.length) scenes.push({ no: no++, durationSec: 10, visual: fill(T.script.vocab.visual, lang2, { words: words.map((w) => w.word).join("\u060C ") }), narration: fill(T.script.vocab.narration, lang2, { list: words.map((w) => `${w.word} \u2014 ${w.meaning[lang2]}`).join("; ") }), subtitle: fill(T.script.vocab.subtitle, lang2, { words: words.map((w) => w.word).join("  \xB7  ") }), verseRefs: Array.from(new Set(words.flatMap((w) => w.refs.slice(0, 1)))) });
  const concepts = parse.concepts.slice(0, 4).map((c) => c.label[lang2]);
  if (concepts.length) scenes.push({ no: no++, durationSec: 10, visual: fill(T.script.map.visual, lang2, {}), narration: fill(T.script.map.narration, lang2, { concepts: concepts.join("; ") }), subtitle: fill(T.script.map.subtitle, lang2, { concepts: concepts.join(" \xB7 ") }), verseRefs: parse.concepts.slice(0, 4).flatMap((c) => c.verseRefs.slice(0, 1)) });
  const q1 = fill(T.script.reviewQ[0], lang2, { ref: verses[0]?.ref || `${parse.chapter}:${parse.from}` });
  const q2 = words[0] ? fill(T.script.reviewQ[1], lang2, { word: words[0].word }) : fill(T.script.reviewQ[2], lang2, {});
  scenes.push({ no: no++, durationSec: 8, visual: fill(T.script.review.visual, lang2, {}), narration: fill(T.script.review.narration, lang2, { q1, q2 }), subtitle: fill(T.script.review.subtitle, lang2, {}), verseRefs: [] });
  const totalSec = scenes.reduce((a, s) => a + s.durationSec, 0);
  return {
    id,
    chapter: parse.chapter,
    from: parse.from,
    to: parse.to,
    title: fill(T.script.title, lang2, { chapter: chapterName2, range }),
    objective: fill(T.script.objective, lang2, { sec: totalSec, chapter: chapterName2, range }),
    scenes,
    reviewQuestions: [q1, q2],
    totalSec,
    aiGenerated: true,
    generator: "template",
    lang: lang2,
    createdAt: Date.now()
  };
}
function scriptPolishPrompt(script, approvedText) {
  const langName = script.lang === "ar" ? "Arabic" : script.lang === "en" ? "English" : "Chinese";
  return [
    `Polish the narration of a short teaching video. Respond ONLY with JSON: {"scenes":[{"no":number,"narration":string}]}.`,
    `Language: ${langName}. Keep each narration under 45 words. NEVER rewrite, translate or paraphrase Quranic verses; refer to them only by chapter:verse. Explanations must stay within the APPROVED MATERIALS. Do not describe God or prophets as visual figures.`,
    `SCENES: ${JSON.stringify(script.scenes.map((s) => ({ no: s.no, narration: s.narration, verseRefs: s.verseRefs })))}`,
    `APPROVED MATERIALS: ${approvedText.slice(0, 5e3)}`
  ].join("\n");
}
function applyScriptPolish(script, raw) {
  const m = raw.match(/\{[\s\S]*\}/);
  if (!m) return script;
  try {
    const parsed = JSON.parse(m[0]);
    if (!Array.isArray(parsed.scenes)) return script;
    return { ...script, generator: "llm", scenes: script.scenes.map((s) => {
      const p = parsed.scenes.find((x) => Number(x?.no) === s.no);
      return p && typeof p.narration === "string" && p.narration.trim() ? { ...s, narration: p.narration.trim().slice(0, 400) } : s;
    }) };
  } catch {
    return script;
  }
}
function buildSceneHtml(scene, lang2, chapterName2, index, total, fontCss = "") {
  const dir = lang2 === "ar" ? "rtl" : "ltr";
  const hasArabic = /[؀-ۿ]/.test(scene.subtitle);
  return `<!doctype html><html dir="${dir}"><head><meta charset="utf-8"><style>${fontCss}
  html,body{margin:0;width:1280px;height:720px;overflow:hidden}
  body{background:radial-gradient(900px 500px at 30% 0%, #1f4d5a 0%, #0d2430 50%, #071620 100%);color:#f4efe4;font-family:"Amiri Quran","Amiri","Noto Naskh Arabic","Geeza Pro","PingFang SC","Segoe UI",sans-serif;position:relative}
  .frame{position:absolute;inset:20px;border:1px solid rgba(232,201,126,.4);border-radius:16px}
  .top{position:absolute;top:44px;left:56px;right:56px;display:flex;justify-content:space-between;font-size:18px;color:#e8c97e}
  .sub{position:absolute;left:56px;right:56px;top:110px;bottom:150px;display:flex;align-items:center;justify-content:center;text-align:center;font-size:${hasArabic ? 40 : 30}px;line-height:1.9;direction:${hasArabic ? "rtl" : dir};white-space:pre-wrap}
  .nar{position:absolute;bottom:52px;left:56px;right:56px;font-size:22px;line-height:1.5;color:#f4efe4;background:rgba(0,0,0,.35);padding:12px 18px;border-radius:12px}
  </style></head><body><div class="frame"></div><div class="top"><span>${esc(chapterName2)}</span><span>${index + 1} / ${total}</span></div><div class="sub">${esc(scene.subtitle)}</div><div class="nar">${esc(scene.narration)}</div></body></html>`;
}

// ../../../totalclaw-solutions/solutions/workbench-quran-teaching/src/main/services/quranTeaching/parse.ts
var AUTO = quizTemplates_default;
var fillTri = (tpl, vars) => {
  const f = (s) => s.replace(/\{(\w+)\}/g, (_m, k) => String(vars[k] ?? ""));
  return { zh: f(tpl[0]), en: f(tpl[1]), ar: f(tpl[2]) };
};
function buildVocabulary(verses, materials) {
  const glossary = /* @__PURE__ */ new Map();
  for (const m of materials) if (m.kind === "glossary" && m.word) glossary.set(`${m.chapter}:${m.word}`, m);
  const map = /* @__PURE__ */ new Map();
  for (const v of verses) {
    for (const tok of tokenizeVerse(v.arabic)) {
      const key = tok.norm;
      let e = map.get(key);
      if (!e) {
        const g = glossary.get(`${v.chapter}:${key}`);
        e = { word: tok.raw, count: 0, refs: [], meaning: g?.title, materialId: g?.id };
        map.set(key, e);
      }
      e.count += 1;
      if (!e.refs.includes(v.ref)) e.refs.push(v.ref);
    }
  }
  return Array.from(map.entries()).map(([norm, e]) => ({ norm, e })).sort((a, b) => {
    const ga = a.e.meaning ? 1 : 0;
    const gb = b.e.meaning ? 1 : 0;
    if (ga !== gb) return gb - ga;
    const sa = STOP_WORDS.has(a.norm) ? 1 : 0;
    const sb = STOP_WORDS.has(b.norm) ? 1 : 0;
    if (sa !== sb) return sa - sb;
    return b.e.count - a.e.count;
  }).map((x) => x.e);
}
function detectRepeated(verses) {
  const whole = /* @__PURE__ */ new Map();
  const opening = /* @__PURE__ */ new Map();
  for (const v of verses) {
    const toks = tokenizeVerse(v.arabic);
    const wholeKey = toks.map((t2) => t2.norm).join(" ");
    const w = whole.get(wholeKey) || { phrase: v.arabic, refs: [] };
    w.refs.push(v.ref);
    whole.set(wholeKey, w);
    if (toks.length >= 3) {
      const key = toks.slice(0, 2).map((t2) => t2.norm).join(" ");
      const o = opening.get(key) || { phrase: toks.slice(0, 2).map((t2) => t2.raw).join(" "), refs: [] };
      o.refs.push(v.ref);
      opening.set(key, o);
    }
  }
  const out = [];
  for (const w of whole.values()) if (w.refs.length >= 2) out.push({ phrase: w.phrase, count: w.refs.length, refs: w.refs });
  const wholeRefs = new Set(out.flatMap((r) => r.refs));
  for (const o of opening.values()) {
    const refs = o.refs.filter((r) => !wholeRefs.has(r));
    if (refs.length >= 3) out.push({ phrase: `${o.phrase} \u2026`, count: refs.length, refs });
  }
  return out.sort((a, b) => b.count - a.count);
}
function tri(zh, en, ar) {
  return { zh, en, ar };
}
function autoSplit(chapter, verses, repeated) {
  if (!verses.length) return [];
  const n = verses.length;
  if (n <= 8) return [{ from: verses[0].verse, to: verses[n - 1].verse }];
  const boundaryAfter = /* @__PURE__ */ new Set();
  for (const r of repeated) if (r.count >= 3 && !r.phrase.endsWith("\u2026")) for (const ref of r.refs) boundaryAfter.add(Number(ref.split(":")[1]));
  const target = n >= 60 ? 12 : n >= 25 ? 7 : 5;
  const out = [];
  let start = verses[0].verse;
  for (let i = 0; i < n; i += 1) {
    const v = verses[i].verse;
    const len = v - start + 1;
    const last = i === n - 1;
    if (last || len >= target && (boundaryAfter.has(v) || len >= target * 1.6)) {
      out.push({ from: start, to: v });
      start = v + 1;
    }
  }
  return out;
}
function buildUnits(chapter, verses, materials, vocab, repeated) {
  if (!verses.length) return [];
  const lo = verses[0].verse;
  const hi = verses[verses.length - 1].verse;
  const seeds2 = unitSeeds().filter((u) => u.chapter === chapter && u.to >= lo && u.from <= hi);
  const ranges = seeds2.map((s) => ({ from: Math.max(lo, s.from), to: Math.min(hi, s.to), seed: s }));
  let cursor = lo;
  const gaps = [];
  for (const r of ranges.slice().sort((a, b) => a.from - b.from)) {
    if (r.from > cursor) gaps.push({ from: cursor, to: r.from - 1 });
    cursor = Math.max(cursor, r.to + 1);
  }
  if (cursor <= hi) gaps.push({ from: cursor, to: hi });
  for (const g of gaps) {
    const sub = verses.filter((v) => v.verse >= g.from && v.verse <= g.to);
    for (const piece of autoSplit(chapter, sub, repeated)) ranges.push(piece);
  }
  ranges.sort((a, b) => a.from - b.from);
  const concepts = materials.filter((m) => m.kind === "concept" && m.chapter === chapter);
  return ranges.map((r, i) => {
    const refs = verses.filter((v) => v.verse >= r.from && v.verse <= r.to).map((v) => v.ref);
    const unitVocab = vocab.filter((w) => w.meaning && w.refs.some((ref) => refs.includes(ref))).slice(0, 8).map((w) => w.word);
    const rep = repeated.find((x) => x.refs.filter((ref) => refs.includes(ref)).length >= 2);
    const conceptIds = concepts.filter((c) => (c.from ?? 1) <= r.to && (c.to ?? 9999) >= r.from).map((c) => c.id);
    const id = r.seed ? r.seed.id : `u-auto-${chapter}-${r.from}-${r.to}`;
    return {
      id,
      chapter,
      index: i + 1,
      from: r.from,
      to: r.to,
      title: r.seed ? tri(...r.seed.title) : fillTri(AUTO.autoUnitTitle, { range: rangeLabel(r.from, r.to) }),
      theme: r.seed ? tri(...r.seed.theme) : fillTri(AUTO.autoUnitTheme, {}),
      conceptIds,
      vocabulary: unitVocab,
      verseRefs: refs,
      repeated: rep ? { phrase: rep.phrase, count: rep.refs.filter((ref) => refs.includes(ref)).length, refs: rep.refs.filter((ref) => refs.includes(ref)) } : void 0,
      origin: r.seed ? "approved" : "auto"
    };
  });
}
function buildConcepts(chapter, verses, materials) {
  const lo = verses[0]?.verse ?? 1;
  const hi = verses[verses.length - 1]?.verse ?? 0;
  return materials.filter((m) => m.kind === "concept" && m.chapter === chapter && (m.from ?? 1) <= hi && (m.to ?? 9999) >= lo).map((m) => ({
    id: m.id,
    chapter,
    label: m.title,
    verseRefs: verses.filter((v) => v.verse >= Math.max(lo, m.from ?? 1) && v.verse <= Math.min(hi, m.to ?? 9999)).map((v) => v.ref),
    materialIds: [m.id, ...materials.filter((x) => x.kind === "unit" && x.chapter === chapter && x.from === m.from && x.to === m.to).map((x) => x.id)]
  }));
}
function parseRange(chapter, verses, materials) {
  const vocabulary = buildVocabulary(verses, materials);
  const repeated = detectRepeated(verses);
  const units = buildUnits(chapter, verses, materials, vocabulary, repeated);
  const concepts = buildConcepts(chapter, verses, materials);
  const events = unitSeeds().filter((u) => u.chapter === chapter && u.persons && u.persons.length && u.to >= (verses[0]?.verse ?? 1) && u.from <= (verses[verses.length - 1]?.verse ?? 0)).map((u, i) => ({ order: i + 1, title: tri(...u.title), from: u.from, to: u.to, persons: (u.persons || []).map((p) => tri(...p)) }));
  const wordCount = verses.reduce((a, v) => a + tokenizeVerse(v.arabic).length, 0);
  const materialIds = Array.from(/* @__PURE__ */ new Set([
    ...vocabulary.filter((w) => w.materialId).map((w) => w.materialId),
    ...units.filter((u) => u.origin === "approved").map((u) => u.id),
    ...concepts.map((c) => c.id),
    ...materials.filter((m) => m.kind === "theme" && m.chapter === chapter).map((m) => m.id)
  ]));
  return {
    chapter,
    from: verses[0]?.verse ?? 0,
    to: verses[verses.length - 1]?.verse ?? 0,
    verseCount: verses.length,
    wordCount,
    uniqueWords: vocabulary.length,
    vocabulary,
    units,
    concepts,
    repeated,
    events,
    materialIds,
    parsedAt: Date.now()
  };
}
function searchVerses(verses, query, limit = 50) {
  const terms = query.split(/\s+/).map(normalizeArabic).filter(Boolean);
  if (!terms.length) return [];
  const out = [];
  for (const v of verses) {
    const norms = tokenizeVerse(v.arabic).map((t2) => t2.norm);
    let hits = 0;
    for (const t2 of terms) hits += norms.filter((n) => n === t2 || n.includes(t2)).length;
    if (hits) out.push({ verse: v, hits });
  }
  return out.sort((a, b) => b.hits - a.hits).slice(0, limit);
}

// ../../../totalclaw-solutions/solutions/workbench-quran-teaching/src/main/services/quranTeaching/store.ts
var import_matchTokens = require("host:apps/desktop-shell/src/shared/matchTokens.ts");

// ../../../totalclaw-solutions/solutions/workbench-quran-teaching/src/main/services/quranTeaching/planTemplates.json
var planTemplates_default = {
  level: {
    beginner: [
      "\u521D\u7EA7\uFF1A\u4EE5\u8BB0\u5FC6\u3001\u8BCD\u6C47\u4E0E\u987A\u5E8F\u4E3A\u4E3B\uFF0C\u7406\u89E3\u9898\u5360\u5C11\u6570",
      "Beginner: memory, vocabulary and order first, few comprehension items",
      "\u0645\u0628\u062A\u062F\u0626: \u0627\u0644\u062A\u0631\u0643\u064A\u0632 \u0639\u0644\u0649 \u0627\u0644\u062D\u0641\u0638 \u0648\u0627\u0644\u0645\u0641\u0631\u062F\u0627\u062A \u0648\u0627\u0644\u062A\u0631\u062A\u064A\u0628\u060C \u0648\u0642\u0644\u064A\u0644 \u0645\u0646 \u0623\u0633\u0626\u0644\u0629 \u0627\u0644\u0641\u0647\u0645"
    ],
    intermediate: [
      "\u4E2D\u7EA7\uFF1A\u8BB0\u5FC6\u4E0E\u7406\u89E3\u5E76\u91CD\uFF0C\u52A0\u5165\u6982\u5FF5\u5173\u7CFB",
      "Intermediate: memory and comprehension balanced, concept relations added",
      "\u0645\u062A\u0648\u0633\u0637: \u062A\u0648\u0627\u0632\u0646 \u0628\u064A\u0646 \u0627\u0644\u062D\u0641\u0638 \u0648\u0627\u0644\u0641\u0647\u0645 \u0645\u0639 \u0625\u0636\u0627\u0641\u0629 \u0627\u0644\u0639\u0644\u0627\u0642\u0627\u062A \u0627\u0644\u0645\u0641\u0627\u0647\u064A\u0645\u064A\u0629"
    ],
    advanced: [
      "\u9AD8\u7EA7\uFF1A\u8DE8\u8282\u7406\u89E3\u3001\u4E8B\u4EF6\u987A\u5E8F\u4E0E\u7EFC\u5408\u6982\u5FF5\u4E3A\u4E3B",
      "Advanced: cross-verse comprehension, event order and synthesis",
      "\u0645\u062A\u0642\u062F\u0645: \u0641\u0647\u0645 \u0639\u0628\u0631 \u0627\u0644\u0622\u064A\u0627\u062A \u0648\u062A\u0631\u062A\u064A\u0628 \u0627\u0644\u0623\u062D\u062F\u0627\u062B \u0648\u0627\u0644\u062A\u0631\u0643\u064A\u0628 \u0627\u0644\u0645\u0641\u0627\u0647\u064A\u0645\u064A"
    ]
  },
  adaptation: [
    "\u9762\u5411{grade}\uFF08{level}\uFF09\u3002\u6240\u9009\u8303\u56F4 {chapter} {range} \u5171 {verses} \u8282\u3001{units} \u4E2A\u6559\u5B66\u5355\u5143\uFF0C\u6309\u6BCF\u5468 {spw} \u6B21\u3001\u6BCF\u6B21 {mins} \u5206\u949F\u3001\u5171 {weeks} \u5468\u6392\u6210 {sessions} \u8BFE\uFF1B\u5E73\u5747\u6BCF\u8BFE\u8986\u76D6 {perSession} \u8282\uFF0C\u6700\u540E\u4E00\u8BFE\u4E3A\u7EFC\u5408\u590D\u4E60\u4E0E\u6D4B\u8BD5\u3002",
    "For {grade} ({level}). The selected range {chapter} {range} has {verses} verses in {units} teaching units, scheduled as {sessions} sessions ({spw} per week, {mins} minutes each, {weeks} weeks); about {perSession} verses per session, with the final session for review and testing.",
    "\u0644\u0640{grade} ({level}). \u064A\u0636\u0645 \u0627\u0644\u0646\u0637\u0627\u0642 \u0627\u0644\u0645\u062E\u062A\u0627\u0631 {chapter} {range} {verses} \u0622\u064A\u0629 \u0641\u064A {units} \u0648\u062D\u062F\u0627\u062A\u060C \u0645\u0642\u0633\u0645\u0629 \u0625\u0644\u0649 {sessions} \u062D\u0635\u0629 ({spw} \u0623\u0633\u0628\u0648\u0639\u064A\u064B\u0627\u060C {mins} \u062F\u0642\u064A\u0642\u0629 \u0644\u0643\u0644 \u062D\u0635\u0629\u060C {weeks} \u0623\u0633\u0627\u0628\u064A\u0639)\u061B \u0646\u062D\u0648 {perSession} \u0622\u064A\u0629 \u0641\u064A \u0627\u0644\u062D\u0635\u0629\u060C \u0648\u0627\u0644\u062D\u0635\u0629 \u0627\u0644\u0623\u062E\u064A\u0631\u0629 \u0644\u0644\u0645\u0631\u0627\u062C\u0639\u0629 \u0648\u0627\u0644\u0627\u062E\u062A\u0628\u0627\u0631."
  ],
  overview: [
    "\u603B\u8BFE\u7A0B\u8BA1\u5212\uFF1A{sessions} \u8BFE\u8986\u76D6 {chapter} {range}\u3002\u524D {teach} \u8BFE\u9010\u5355\u5143\u6559\u5B66\uFF08\u8BF5\u8BFB \u2192 \u8BCD\u6C47 \u2192 \u7406\u89E3 \u2192 \u7EC3\u4E60\uFF09\uFF0C\u7B2C {sessions} \u8BFE\u7EFC\u5408\u590D\u4E60\u4E0E\u6D4B\u8BD5\u3002\u6BCF\u8BFE\u90FD\u4EE5\u9501\u5B9A\u7ECF\u6587\u4E3A\u4E2D\u5FC3\uFF0C\u89E3\u91CA\u53EA\u4F9D\u636E\u6279\u51C6\u8D44\u6599\u3002",
    "Course plan: {sessions} sessions covering {chapter} {range}. Sessions 1-{teach} teach unit by unit (recitation \u2192 vocabulary \u2192 comprehension \u2192 practice); session {sessions} is review and testing. Every session centres on the locked text; explanations rely only on approved materials.",
    "\u062E\u0637\u0629 \u0627\u0644\u0645\u0642\u0631\u0631: {sessions} \u062D\u0635\u0635 \u062A\u063A\u0637\u064A {chapter} {range}. \u0627\u0644\u062D\u0635\u0635 1-{teach} \u062A\u062F\u0631\u0651\u0633 \u0648\u062D\u062F\u0629 \u0628\u0648\u062D\u062F\u0629 (\u062A\u0644\u0627\u0648\u0629 \u2190 \u0645\u0641\u0631\u062F\u0627\u062A \u2190 \u0641\u0647\u0645 \u2190 \u062A\u062F\u0631\u064A\u0628)\u061B \u0627\u0644\u062D\u0635\u0629 {sessions} \u0645\u0631\u0627\u062C\u0639\u0629 \u0648\u0627\u062E\u062A\u0628\u0627\u0631. \u0643\u0644 \u062D\u0635\u0629 \u062A\u062A\u0645\u062D\u0648\u0631 \u062D\u0648\u0644 \u0627\u0644\u0646\u0635 \u0627\u0644\u0645\u0642\u0641\u0644\u060C \u0648\u0627\u0644\u0634\u0631\u062D \u0648\u0641\u0642 \u0627\u0644\u0645\u0648\u0627\u062F \u0627\u0644\u0645\u0639\u062A\u0645\u062F\u0629 \u0641\u0642\u0637."
  ],
  objectives: [
    [
      "\u80FD\u6309\u7AE0/\u8282\u51C6\u786E\u8BC6\u522B\u4E0E\u8BF5\u8BFB {chapter} {range} \u7684\u7ECF\u6587",
      "Accurately identify and recite the verses of {chapter} {range} by chapter and verse",
      "\u0627\u0644\u062A\u0639\u0631\u0651\u0641 \u0639\u0644\u0649 \u0622\u064A\u0627\u062A {chapter} {range} \u0648\u062A\u0644\u0627\u0648\u062A\u0647\u0627 \u0628\u062F\u0642\u0629 \u062D\u0633\u0628 \u0627\u0644\u0633\u0648\u0631\u0629 \u0648\u0627\u0644\u0622\u064A\u0629"
    ],
    [
      "\u638C\u63E1\u6279\u51C6\u8BCD\u8868\u4E2D\u7684 {vocab} \u4E2A\u6838\u5FC3\u8BCD\u6C47\u7684\u57FA\u7840\u8BCD\u4E49",
      "Master the basic meanings of {vocab} core words from the approved glossary",
      "\u0625\u062A\u0642\u0627\u0646 \u0627\u0644\u0645\u0639\u0627\u0646\u064A \u0627\u0644\u0623\u0633\u0627\u0633\u064A\u0629 \u0644\u0640{vocab} \u0643\u0644\u0645\u0629 \u0645\u062D\u0648\u0631\u064A\u0629 \u0645\u0646 \u0627\u0644\u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0645\u0639\u062A\u0645\u062F\u0629"
    ],
    [
      "\u7406\u89E3\u5404\u6559\u5B66\u5355\u5143\u7684\u4E3B\u9898\u4E0E\u7ECF\u6587\u95F4\u7684\u57FA\u672C\u5173\u7CFB",
      "Understand each unit's theme and the basic relations between verses",
      "\u0641\u0647\u0645 \u0645\u0648\u0636\u0648\u0639 \u0643\u0644 \u0648\u062D\u062F\u0629 \u0648\u0627\u0644\u0639\u0644\u0627\u0642\u0627\u062A \u0627\u0644\u0623\u0633\u0627\u0633\u064A\u0629 \u0628\u064A\u0646 \u0627\u0644\u0622\u064A\u0627\u062A"
    ],
    [
      "\u80FD\u5728\u7406\u89E3\u56FE\u4E2D\u8BF4\u660E\u6982\u5FF5\u4E0E\u7ECF\u6587\u7684\u5BF9\u5E94\u5173\u7CFB",
      "Explain concept-to-verse correspondences on the understanding map",
      "\u062A\u0648\u0636\u064A\u062D \u062A\u0642\u0627\u0628\u0644 \u0627\u0644\u0645\u0641\u0627\u0647\u064A\u0645 \u0648\u0627\u0644\u0622\u064A\u0627\u062A \u0641\u064A \u062E\u0631\u064A\u0637\u0629 \u0627\u0644\u0641\u0647\u0645"
    ]
  ],
  segments: {
    warmup: [
      "\u590D\u4E60\u4E0E\u5BFC\u5165",
      "Review & warm-up",
      "\u0645\u0631\u0627\u062C\u0639\u0629 \u0648\u062A\u0645\u0647\u064A\u062F"
    ],
    recite: [
      "\u8BF5\u8BFB\u4E0E\u8BC6\u522B\uFF08\u9501\u5B9A\u7ECF\u6587\uFF09",
      "Recitation & recognition (locked text)",
      "\u062A\u0644\u0627\u0648\u0629 \u0648\u062A\u0639\u0631\u0651\u0641 (\u0627\u0644\u0646\u0635 \u0627\u0644\u0645\u0642\u0641\u0644)"
    ],
    vocab: [
      "\u8BCD\u6C47\u8BB2\u89E3\uFF08\u6279\u51C6\u8BCD\u8868\uFF09",
      "Vocabulary (approved glossary)",
      "\u0645\u0641\u0631\u062F\u0627\u062A (\u0627\u0644\u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0645\u0639\u062A\u0645\u062F\u0629)"
    ],
    meaning: [
      "\u4E3B\u9898\u4E0E\u7406\u89E3\uFF08\u6279\u51C6\u8D44\u6599\uFF09",
      "Theme & comprehension (approved materials)",
      "\u0627\u0644\u0645\u0648\u0636\u0648\u0639 \u0648\u0627\u0644\u0641\u0647\u0645 (\u0627\u0644\u0645\u0648\u0627\u062F \u0627\u0644\u0645\u0639\u062A\u0645\u062F\u0629)"
    ],
    map: [
      "\u7406\u89E3\u56FE\u8BB2\u89E3",
      "Understanding map",
      "\u062E\u0631\u064A\u0637\u0629 \u0627\u0644\u0641\u0647\u0645"
    ],
    practice: [
      "\u968F\u5802\u7EC3\u4E60\uFF08\u52A8\u6001\u51FA\u9898\uFF09",
      "In-class practice (dynamic items)",
      "\u062A\u062F\u0631\u064A\u0628 \u0635\u0641\u064A (\u0623\u0633\u0626\u0644\u0629 \u062F\u064A\u0646\u0627\u0645\u064A\u0643\u064A\u0629)"
    ],
    wrap: [
      "\u5C0F\u7ED3\u4E0E\u4F5C\u4E1A",
      "Wrap-up & homework",
      "\u062E\u0644\u0627\u0635\u0629 \u0648\u0648\u0627\u062C\u0628"
    ],
    review: [
      "\u7EFC\u5408\u590D\u4E60",
      "Comprehensive review",
      "\u0645\u0631\u0627\u062C\u0639\u0629 \u0634\u0627\u0645\u0644\u0629"
    ],
    test: [
      "\u5355\u5143\u6D4B\u8BD5\uFF08\u52A8\u6001\u8BD5\u5377\uFF09",
      "Unit test (dynamic paper)",
      "\u0627\u062E\u062A\u0628\u0627\u0631 \u0627\u0644\u0648\u062D\u062F\u0629 (\u0648\u0631\u0642\u0629 \u062F\u064A\u0646\u0627\u0645\u064A\u0643\u064A\u0629)"
    ],
    feedback: [
      "\u8BB2\u8BC4\u4E0E\u8584\u5F31\u70B9\u53CD\u9988",
      "Feedback on weak points",
      "\u062A\u063A\u0630\u064A\u0629 \u0631\u0627\u062C\u0639\u0629 \u062D\u0648\u0644 \u0646\u0642\u0627\u0637 \u0627\u0644\u0636\u0639\u0641"
    ]
  },
  activity: {
    warmup: [
      "\u56DE\u987E\u4E0A\u4E00\u8BFE\u7684\u7ECF\u6587\u4E0E\u8BCD\u6C47\uFF0C\u63D0\u95EE 2-3 \u4E2A\u590D\u4E60\u95EE\u9898",
      "Recall last session's verses and words; ask 2-3 review questions",
      "\u0627\u0633\u062A\u0631\u062C\u0627\u0639 \u0622\u064A\u0627\u062A \u0648\u0645\u0641\u0631\u062F\u0627\u062A \u0627\u0644\u062D\u0635\u0629 \u0627\u0644\u0633\u0627\u0628\u0642\u0629 \u0645\u0639 2-3 \u0623\u0633\u0626\u0644\u0629 \u0645\u0631\u0627\u062C\u0639\u0629"
    ],
    recite: [
      "\u9010\u8282\u5C55\u793A {refs}\uFF0C\u5B66\u751F\u8DDF\u8BFB\u5E76\u6309\u8282\u53F7\u8BC6\u522B",
      "Display {refs} verse by verse; students repeat and identify by verse number",
      "\u0639\u0631\u0636 {refs} \u0622\u064A\u0629 \u0622\u064A\u0629\u061B \u064A\u0631\u062F\u062F \u0627\u0644\u0637\u0644\u0627\u0628 \u0648\u064A\u062A\u0639\u0631\u0641\u0648\u0646 \u0639\u0644\u0649 \u0631\u0642\u0645 \u0627\u0644\u0622\u064A\u0629"
    ],
    vocab: [
      "\u8BB2\u89E3 {words}",
      "Explain {words}",
      "\u0634\u0631\u062D {words}"
    ],
    meaning: [
      "\u6309\u6279\u51C6\u8D44\u6599\u8BB2\u89E3\u5355\u5143\u4E3B\u9898\uFF1A{theme}",
      "Explain the unit theme from approved materials: {theme}",
      "\u0634\u0631\u062D \u0645\u0648\u0636\u0648\u0639 \u0627\u0644\u0648\u062D\u062F\u0629 \u0645\u0646 \u0627\u0644\u0645\u0648\u0627\u062F \u0627\u0644\u0645\u0639\u062A\u0645\u062F\u0629: {theme}"
    ],
    map: [
      "\u5728\u7406\u89E3\u56FE\u4E2D\u6253\u5F00\u672C\u5355\u5143\u8282\u70B9\uFF0C\u5C55\u793A\u6982\u5FF5 \u2194 \u7ECF\u6587\u5173\u8054",
      "Open this unit's node on the map and show concept \u2194 verse links",
      "\u0641\u062A\u062D \u0639\u0642\u062F\u0629 \u0627\u0644\u0648\u062D\u062F\u0629 \u0641\u064A \u0627\u0644\u062E\u0631\u064A\u0637\u0629 \u0648\u0639\u0631\u0636 \u0631\u0648\u0627\u0628\u0637 \u0627\u0644\u0645\u0641\u0647\u0648\u0645 \u0628\u0627\u0644\u0622\u064A\u0629"
    ],
    practice: [
      "\u73B0\u573A\u751F\u6210 5 \u9898\uFF08\u8BC6\u522B / \u586B\u7A7A / \u6392\u5E8F\uFF09\uFF0C\u5373\u65F6\u8BB2\u8BC4",
      "Generate 5 items live (identify / fill / order) and review immediately",
      "\u062A\u0648\u0644\u064A\u062F 5 \u0623\u0633\u0626\u0644\u0629 \u0641\u0648\u0631\u064A\u064B\u0627 (\u062A\u0639\u0631\u0651\u0641 / \u0641\u0631\u0627\u063A / \u062A\u0631\u062A\u064A\u0628) \u0645\u0639 \u062A\u0635\u062D\u064A\u062D \u0641\u0648\u0631\u064A"
    ],
    wrap: [
      "\u603B\u7ED3\u8981\u70B9\uFF0C\u5E03\u7F6E\u80CC\u8BF5 {refs}",
      "Summarise key points; assign memorising {refs}",
      "\u062A\u0644\u062E\u064A\u0635 \u0627\u0644\u0646\u0642\u0627\u0637 \u0627\u0644\u0631\u0626\u064A\u0633\u0629 \u0648\u062A\u0643\u0644\u064A\u0641 \u0628\u062D\u0641\u0638 {refs}"
    ],
    review: [
      "\u6309\u5355\u5143\u4E32\u8BB2 {range} \u5168\u90E8\u7ECF\u6587\u4E0E\u6982\u5FF5",
      "Walk through all verses and concepts of {range} unit by unit",
      "\u0645\u0631\u0627\u062C\u0639\u0629 \u062C\u0645\u064A\u0639 \u0622\u064A\u0627\u062A \u0648\u0645\u0641\u0627\u0647\u064A\u0645 {range} \u0648\u062D\u062F\u0629 \u0628\u0648\u062D\u062F\u0629"
    ],
    test: [
      "\u751F\u6210\u4E00\u5957 10 \u9898\u52A8\u6001\u8BD5\u5377\u5E76\u4F5C\u7B54",
      "Generate and take a 10-item dynamic paper",
      "\u062A\u0648\u0644\u064A\u062F \u0648\u0631\u0642\u0629 \u062F\u064A\u0646\u0627\u0645\u064A\u0643\u064A\u0629 \u0645\u0646 10 \u0623\u0633\u0626\u0644\u0629 \u0648\u062D\u0644\u0647\u0627"
    ],
    feedback: [
      "\u67E5\u770B\u4E2A\u4EBA\u4E0E\u7FA4\u4F53\u8584\u5F31\u70B9\uFF0C\u51B3\u5B9A\u5F3A\u5316\u5185\u5BB9",
      "Review individual and group weak points; decide on reinforcement",
      "\u0645\u0631\u0627\u062C\u0639\u0629 \u0646\u0642\u0627\u0637 \u0627\u0644\u0636\u0639\u0641 \u0627\u0644\u0641\u0631\u062F\u064A\u0629 \u0648\u0627\u0644\u062C\u0645\u0627\u0639\u064A\u0629 \u0648\u062A\u062D\u062F\u064A\u062F \u0627\u0644\u062A\u0639\u0632\u064A\u0632"
    ]
  },
  reviewGoal: [
    "\u80FD\u590D\u8FF0\u672C\u8BFE\u7ECF\u6587\u5E76\u8BF4\u51FA {n} \u4E2A\u6838\u5FC3\u8BCD\u7684\u8BCD\u4E49",
    "Recite this session's verses and give the meaning of {n} core words",
    "\u062A\u0644\u0627\u0648\u0629 \u0622\u064A\u0627\u062A \u0627\u0644\u062D\u0635\u0629 \u0648\u0630\u0643\u0631 \u0645\u0639\u0646\u0649 {n} \u0643\u0644\u0645\u0627\u062A \u0645\u062D\u0648\u0631\u064A\u0629"
  ],
  testGoal: [
    "\u8BC6\u522B / \u586B\u7A7A / \u6392\u5E8F\u9898\u6B63\u786E\u7387 \u2265 80%",
    "\u2265 80% on identify / fill / order items",
    "\u2265 80% \u0641\u064A \u0623\u0633\u0626\u0644\u0629 \u0627\u0644\u062A\u0639\u0631\u0651\u0641 / \u0627\u0644\u0641\u0631\u0627\u063A / \u0627\u0644\u062A\u0631\u062A\u064A\u0628"
  ],
  finalReviewGoal: [
    "\u80FD\u8BF4\u660E\u5404\u5355\u5143\u4E3B\u9898\u4E0E\u6982\u5FF5 \u2194 \u7ECF\u6587\u7684\u5BF9\u5E94",
    "Explain each unit's theme and concept \u2194 verse mapping",
    "\u062A\u0648\u0636\u064A\u062D \u0645\u0648\u0636\u0648\u0639 \u0643\u0644 \u0648\u062D\u062F\u0629 \u0648\u062A\u0642\u0627\u0628\u0644 \u0627\u0644\u0645\u0641\u0627\u0647\u064A\u0645 \u0628\u0627\u0644\u0622\u064A\u0627\u062A"
  ],
  finalTestGoal: [
    "\u7EFC\u5408\u8BD5\u5377\u603B\u5206 \u2265 75%\uFF0C\u65E0\u7EF4\u5EA6\u4F4E\u4E8E 60%",
    "Overall \u2265 75% with no dimension below 60%",
    "\u0627\u0644\u0645\u062C\u0645\u0648\u0639 \u2265 75% \u0648\u062F\u0648\u0646 \u0623\u064A \u0628\u064F\u0639\u062F \u062A\u062D\u062A 60%"
  ],
  sessionTitle: [
    "\u7B2C {n} \u8BFE \xB7 {title}",
    "Session {n} \xB7 {title}",
    "\u0627\u0644\u062D\u0635\u0629 {n} \xB7 {title}"
  ],
  finalTitle: [
    "\u7B2C {n} \u8BFE \xB7 \u7EFC\u5408\u590D\u4E60\u4E0E\u6D4B\u8BD5",
    "Session {n} \xB7 Review & test",
    "\u0627\u0644\u062D\u0635\u0629 {n} \xB7 \u0645\u0631\u0627\u062C\u0639\u0629 \u0648\u0627\u062E\u062A\u0628\u0627\u0631"
  ]
};

// ../../../totalclaw-solutions/solutions/workbench-quran-teaching/src/main/services/quranTeaching/planner.ts
var T2 = planTemplates_default;
function allocateUnits(units, teachSessions) {
  if (!units.length || teachSessions <= 0) return [];
  if (units.length === teachSessions) return units.map((u) => ({ units: [u], from: u.from, to: u.to }));
  if (units.length < teachSessions) {
    const pieces = units.map((u) => ({ units: [u], from: u.from, to: u.to }));
    while (pieces.length < teachSessions) {
      let idx = 0;
      for (let i = 1; i < pieces.length; i += 1) if (pieces[i].to - pieces[i].from > pieces[idx].to - pieces[idx].from) idx = i;
      const p = pieces[idx];
      if (p.to - p.from < 1) break;
      const mid = Math.floor((p.from + p.to) / 2);
      pieces.splice(idx, 1, { units: p.units, from: p.from, to: mid }, { units: p.units, from: mid + 1, to: p.to });
    }
    return pieces;
  }
  const totalVerses = units.reduce((a, u) => a + (u.to - u.from + 1), 0);
  const target = totalVerses / teachSessions;
  const out = [];
  let cur = [];
  let acc = 0;
  for (const [i, u] of units.entries()) {
    cur.push(u);
    acc += u.to - u.from + 1;
    const unitsLeft = units.length - i - 1;
    const sessionsLeft = teachSessions - out.length - 1;
    const mustClose = unitsLeft <= sessionsLeft;
    if (out.length < teachSessions - 1 && (acc >= target || mustClose)) {
      out.push({ units: cur, from: cur[0].from, to: cur[cur.length - 1].to });
      cur = [];
      acc = 0;
    }
  }
  if (cur.length) out.push({ units: cur, from: cur[0].from, to: cur[cur.length - 1].to });
  return out;
}
function segmentPlan(minutes, lang2, vars, final = false) {
  const keys = final ? ["review", "test", "feedback"] : ["warmup", "recite", "vocab", "meaning", "map", "practice", "wrap"];
  const weights = final ? [0.35, 0.45, 0.2] : [0.1, 0.22, 0.18, 0.2, 0.1, 0.13, 0.07];
  const mins = weights.map((w) => Math.max(2, Math.round(minutes * w)));
  const diff = minutes - mins.reduce((a, b) => a + b, 0);
  mins[final ? 1 : 3] += diff;
  return keys.map((k, i) => ({ name: fill(T2.segments[k], lang2, {}), minutes: mins[i], activity: fill(T2.activity[k], lang2, vars) }));
}
function buildPlanSkeleton(id, req, parse, chapterName2) {
  const lang2 = req.lang;
  const sessionsTotal = Math.max(2, req.sessionsPerWeek * req.weeks);
  const teach = sessionsTotal - 1;
  const alloc = allocateUnits(parse.units, teach);
  const range = rangeLabel(req.from, req.to);
  const sessions = alloc.map((a, i) => {
    const refs = `${req.chapter}:${rangeLabel(a.from, a.to)}`;
    const words = a.units.flatMap((u) => u.vocabulary).slice(0, 6);
    const vars2 = { refs, words: words.join("\u060C ") || "\u2014", theme: a.units.map((u) => u.theme[lang2]).join(" / "), range };
    const title = a.units.length === 1 ? a.units[0].title[lang2] : a.units.map((u) => u.title[lang2]).join(" + ");
    return {
      index: i + 1,
      week: Math.floor(i / req.sessionsPerWeek) + 1,
      unitId: a.units[0].id,
      title: fill(T2.sessionTitle, lang2, { n: i + 1, title }),
      from: a.from,
      to: a.to,
      objectives: [
        fill(T2.objectives[0], lang2, { chapter: chapterName2, range: rangeLabel(a.from, a.to) }),
        fill(T2.objectives[1], lang2, { vocab: words.length }),
        fill(T2.objectives[2], lang2, {})
      ],
      segments: segmentPlan(req.sessionMinutes, lang2, vars2),
      vocabulary: words,
      reviewGoal: fill(T2.reviewGoal, lang2, { n: Math.max(3, words.length) }),
      testGoal: fill(T2.testGoal, lang2, {}),
      sourceRefs: parse.units.filter((u) => a.units.includes(u)).flatMap((u) => u.verseRefs).filter((r) => {
        const v = Number(r.split(":")[1]);
        return v >= a.from && v <= a.to;
      })
    };
  });
  const finalIndex = sessions.length + 1;
  sessions.push({
    index: finalIndex,
    week: Math.floor((finalIndex - 1) / req.sessionsPerWeek) + 1,
    unitId: "",
    title: fill(T2.finalTitle, lang2, { n: finalIndex }),
    from: req.from,
    to: req.to,
    objectives: [fill(T2.objectives[2], lang2, {}), fill(T2.objectives[3], lang2, {})],
    segments: segmentPlan(req.sessionMinutes, lang2, { range: `${chapterName2} ${range}` }, true),
    vocabulary: parse.vocabulary.filter((w) => w.meaning).slice(0, 8).map((w) => w.word),
    reviewGoal: fill(T2.finalReviewGoal, lang2, {}),
    testGoal: fill(T2.finalTestGoal, lang2, {}),
    sourceRefs: parse.units.flatMap((u) => u.verseRefs)
  });
  const vars = {
    grade: req.grade,
    level: fill(T2.level[req.level], lang2, {}),
    chapter: chapterName2,
    range,
    verses: parse.verseCount,
    units: parse.units.length,
    spw: req.sessionsPerWeek,
    mins: req.sessionMinutes,
    weeks: req.weeks,
    sessions: sessions.length,
    teach,
    perSession: Math.max(1, Math.round(parse.verseCount / Math.max(1, teach)))
  };
  return {
    id,
    request: req,
    aiGenerated: true,
    generator: "template",
    reviewStatus: "draft",
    adaptation: fill(T2.adaptation, lang2, vars),
    objectives: T2.objectives.map((o) => fill(o, lang2, { chapter: chapterName2, range, vocab: parse.vocabulary.filter((w) => w.meaning).length })),
    difficultyLabel: fill(T2.level[req.level], lang2, {}),
    overview: fill(T2.overview, lang2, vars),
    sessions,
    materialIds: parse.materialIds,
    createdAt: Date.now()
  };
}
function enrichPrompt(plan, approvedText) {
  const langName = plan.request.lang === "ar" ? "Arabic" : plan.request.lang === "en" ? "English" : "Chinese";
  return [
    `You are refining a lesson plan for a Quran teaching demo. Respond ONLY with JSON: {"adaptation": string, "objectives": string[4], "sessions": [{"index": number, "objectives": string[3]}]}.`,
    `Language of all text: ${langName}. Do not quote or alter Quranic text. Base every statement only on the APPROVED MATERIALS below; do not add religious interpretation beyond them.`,
    `Student: ${plan.request.grade}, level ${plan.request.level}, ${plan.request.sessionsPerWeek} sessions/week, ${plan.request.sessionMinutes} min, ${plan.request.weeks} weeks. Goals: ${plan.request.goals || "-"}.`,
    `SKELETON: ${JSON.stringify({ adaptation: plan.adaptation, objectives: plan.objectives, sessions: plan.sessions.map((s) => ({ index: s.index, title: s.title, range: `${s.from}-${s.to}`, objectives: s.objectives })) })}`,
    `APPROVED MATERIALS: ${approvedText.slice(0, 6e3)}`
  ].join("\n");
}
function applyEnrichment(plan, raw) {
  const m = raw.match(/\{[\s\S]*\}/);
  if (!m) return plan;
  let parsed;
  try {
    parsed = JSON.parse(m[0]);
  } catch {
    return plan;
  }
  const out = { ...plan, generator: "llm" };
  if (typeof parsed.adaptation === "string" && parsed.adaptation.trim()) out.adaptation = parsed.adaptation.trim().slice(0, 800);
  if (Array.isArray(parsed.objectives) && parsed.objectives.length) out.objectives = parsed.objectives.filter((x) => typeof x === "string").slice(0, 5);
  if (Array.isArray(parsed.sessions)) {
    out.sessions = plan.sessions.map((s) => {
      const p = parsed.sessions.find((x) => Number(x?.index) === s.index);
      return p && Array.isArray(p.objectives) && p.objectives.length ? { ...s, objectives: p.objectives.filter((x) => typeof x === "string").slice(0, 4) } : s;
    });
  }
  return out;
}

// ../../../totalclaw-solutions/solutions/workbench-quran-teaching/src/main/services/quranTeaching/reinforceTemplates.json
var reinforceTemplates_default = {
  explanation: {
    concept: [
      "\u5F3A\u5316\u5355\u5143\u9488\u5BF9\u6982\u5FF5\u300C{label}\u300D\uFF08{cls}\uFF09\u3002\u5B83\u5728\u6279\u51C6\u8D44\u6599\u4E2D\u5BF9\u5E94 {refs}\uFF1A{body}\u3002\u5B66\u4E60\u8DEF\u5F84\uFF1A\u5148\u91CD\u8BFB\u8FD9\u4E9B\u7ECF\u6587\u5E76\u5BF9\u7167\u7406\u89E3\u56FE\uFF0C\u518D\u770B\u590D\u4E60\u5361\uFF0C\u6700\u540E\u5B8C\u6210\u5F3A\u5316\u7EC3\u4E60\u4E0E\u590D\u6D4B\u3002",
      'Reinforcement targets the concept "{label}" ({cls}). In the approved materials it maps to {refs}: {body}. Path: re-read these verses against the understanding map, study the review cards, then complete the practice and retest.',
      "\u064A\u0633\u062A\u0647\u062F\u0641 \u0627\u0644\u062A\u0639\u0632\u064A\u0632 \u0645\u0641\u0647\u0648\u0645 \xAB{label}\xBB ({cls}). \u064A\u0642\u0627\u0628\u0644\u0647 \u0641\u064A \u0627\u0644\u0645\u0648\u0627\u062F \u0627\u0644\u0645\u0639\u062A\u0645\u062F\u0629 {refs}: {body}. \u0627\u0644\u0645\u0633\u0627\u0631: \u0623\u0639\u062F \u0642\u0631\u0627\u0621\u0629 \u0647\u0630\u0647 \u0627\u0644\u0622\u064A\u0627\u062A \u0645\u0639 \u062E\u0631\u064A\u0637\u0629 \u0627\u0644\u0641\u0647\u0645\u060C \u062B\u0645 \u0628\u0637\u0627\u0642\u0627\u062A \u0627\u0644\u0645\u0631\u0627\u062C\u0639\u0629\u060C \u062B\u0645 \u0627\u0644\u062A\u062F\u0631\u064A\u0628 \u0648\u0625\u0639\u0627\u062F\u0629 \u0627\u0644\u0627\u062E\u062A\u0628\u0627\u0631."
    ],
    vocabulary: [
      "\u5F3A\u5316\u5355\u5143\u9488\u5BF9\u8BCD\u6C47\u300C{label}\u300D\uFF08{cls}\uFF09\u3002\u6279\u51C6\u8BCD\u8868\u91CA\u4E49\uFF1A{body}\uFF1B\u51FA\u73B0\u4E8E {refs}\u3002\u5B66\u4E60\u8DEF\u5F84\uFF1A\u8BCD\u6C47\u5361 \u2192 \u540C\u8282\u586B\u7A7A \u2192 \u5339\u914D\u590D\u6D4B\u3002",
      'Reinforcement targets the word "{label}" ({cls}). Approved gloss: {body}; occurs in {refs}. Path: vocabulary card \u2192 fill-in on the same verse \u2192 matching retest.',
      "\u064A\u0633\u062A\u0647\u062F\u0641 \u0627\u0644\u062A\u0639\u0632\u064A\u0632 \u0627\u0644\u0645\u0641\u0631\u062F\u0629 \xAB{label}\xBB ({cls}). \u0627\u0644\u0645\u0639\u0646\u0649 \u0627\u0644\u0645\u0639\u062A\u0645\u062F: {body}\u061B \u062A\u0631\u062F \u0641\u064A {refs}. \u0627\u0644\u0645\u0633\u0627\u0631: \u0628\u0637\u0627\u0642\u0629 \u0645\u0641\u0631\u062F\u0627\u062A \u2190 \u0645\u0644\u0621 \u0641\u0631\u0627\u063A \u2190 \u0625\u0639\u0627\u062F\u0629 \u0627\u062E\u062A\u0628\u0627\u0631 \u0628\u0627\u0644\u0645\u0637\u0627\u0628\u0642\u0629."
    ],
    verse: [
      "\u5F3A\u5316\u5355\u5143\u9488\u5BF9\u7ECF\u6587 {label}\uFF08{cls}\uFF09\u3002\u5B66\u4E60\u8DEF\u5F84\uFF1A\u9010\u8BCD\u8BF5\u8BFB \u2192 \u8BCD\u5E8F\u6392\u5217 \u2192 \u8BC6\u522B\u4E0E\u4E0A\u4E0B\u8282\u987A\u5E8F\u7EC3\u4E60 \u2192 \u590D\u6D4B\u3002",
      "Reinforcement targets verse {label} ({cls}). Path: word-by-word recitation \u2192 word ordering \u2192 recognition and adjacent-verse order practice \u2192 retest.",
      "\u064A\u0633\u062A\u0647\u062F\u0641 \u0627\u0644\u062A\u0639\u0632\u064A\u0632 \u0627\u0644\u0622\u064A\u0629 {label} ({cls}). \u0627\u0644\u0645\u0633\u0627\u0631: \u062A\u0644\u0627\u0648\u0629 \u0643\u0644\u0645\u0629 \u0643\u0644\u0645\u0629 \u2190 \u062A\u0631\u062A\u064A\u0628 \u0627\u0644\u0643\u0644\u0645\u0627\u062A \u2190 \u062A\u062F\u0631\u064A\u0628 \u0639\u0644\u0649 \u0627\u0644\u062A\u0639\u0631\u0651\u0641 \u0648\u062A\u0631\u062A\u064A\u0628 \u0627\u0644\u0622\u064A\u0627\u062A \u0627\u0644\u0645\u062C\u0627\u0648\u0631\u0629 \u2190 \u0625\u0639\u0627\u062F\u0629 \u0627\u062E\u062A\u0628\u0627\u0631."
    ],
    type: [
      "\u5F3A\u5316\u5355\u5143\u9488\u5BF9\u9898\u578B\u300C{label}\u300D\uFF08{cls}\uFF09\u3002\u5148\u7528\u4F4E\u96BE\u5EA6\u540C\u7C7B\u9898\u719F\u6089\u4F5C\u7B54\u65B9\u5F0F\uFF0C\u518D\u9010\u6B65\u63D0\u9AD8\u96BE\u5EA6\u3002",
      'Reinforcement targets the question type "{label}" ({cls}). Start with easier items of the same type, then raise the difficulty.',
      "\u064A\u0633\u062A\u0647\u062F\u0641 \u0627\u0644\u062A\u0639\u0632\u064A\u0632 \u0646\u0648\u0639 \u0627\u0644\u0633\u0624\u0627\u0644 \xAB{label}\xBB ({cls}). \u0627\u0628\u062F\u0623 \u0628\u0623\u0633\u0626\u0644\u0629 \u0623\u0633\u0647\u0644 \u0645\u0646 \u0627\u0644\u0646\u0648\u0639 \u0646\u0641\u0633\u0647 \u062B\u0645 \u0627\u0631\u0641\u0639 \u0627\u0644\u0635\u0639\u0648\u0628\u0629."
    ]
  },
  card: {
    verse: [
      "\u7ECF\u6587 {ref}",
      "Verse {ref}",
      "\u0627\u0644\u0622\u064A\u0629 {ref}"
    ],
    conceptTitle: [
      "\u6982\u5FF5\uFF1A{label}",
      "Concept: {label}",
      "\u0627\u0644\u0645\u0641\u0647\u0648\u0645: {label}"
    ],
    conceptBody: [
      "\u5BF9\u5E94\u7ECF\u6587 {refs}\u3002{body}",
      "Maps to {refs}. {body}",
      "\u064A\u0642\u0627\u0628\u0644 {refs}. {body}"
    ],
    vocabTitle: [
      "\u8BCD\u6C47\uFF1A{word}",
      "Word: {word}",
      "\u0627\u0644\u0645\u0641\u0631\u062F\u0629: {word}"
    ],
    vocabBody: [
      "\u57FA\u7840\u91CA\u4E49\uFF1A{meaning}\uFF08\u6279\u51C6\u8BCD\u8868\uFF09\u3002\u51FA\u5904\uFF1A{refs}\u3002",
      "Basic meaning: {meaning} (approved glossary). Found in {refs}.",
      "\u0627\u0644\u0645\u0639\u0646\u0649 \u0627\u0644\u0623\u0633\u0627\u0633\u064A: {meaning} (\u0627\u0644\u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0645\u0639\u062A\u0645\u062F\u0629). \u062A\u0631\u062F \u0641\u064A {refs}."
    ],
    unitTitle: [
      "\u5355\u5143\uFF1A{title}",
      "Unit: {title}",
      "\u0627\u0644\u0648\u062D\u062F\u0629: {title}"
    ]
  },
  targetLabel: [
    "{label}",
    "{label}",
    "{label}"
  ]
};

// ../../../totalclaw-solutions/solutions/workbench-quran-teaching/src/main/services/quranTeaching/analysisTemplates.json
var analysisTemplates_default = {
  students: [
    {
      id: "stu-a",
      code: "\u7532",
      name: [
        "\u5B66\u751F\u7532",
        "Student A",
        "\u0627\u0644\u0637\u0627\u0644\u0628 \u0623"
      ],
      description: [
        "\u8BB0\u5FC6\u3001\u8BCD\u6C47\u3001\u7406\u89E3\u5747\u8F83\u5F3A\u2014\u2014\u9AD8\u638C\u63E1\u5B66\u751F\u3002",
        "Strong in memory, vocabulary and comprehension \u2013 a high-mastery student.",
        "\u0642\u0648\u064A \u0641\u064A \u0627\u0644\u062D\u0641\u0638 \u0648\u0627\u0644\u0645\u0641\u0631\u062F\u0627\u062A \u0648\u0627\u0644\u0641\u0647\u0645 \u2013 \u0637\u0627\u0644\u0628 \u0639\u0627\u0644\u064A \u0627\u0644\u0625\u062A\u0642\u0627\u0646."
      ],
      traits: {
        memory: 0.95,
        order: 0.92,
        vocabulary: 0.9,
        comprehension: 0.88,
        concept: 0.86
      }
    },
    {
      id: "stu-b",
      code: "\u4E59",
      name: [
        "\u5B66\u751F\u4E59",
        "Student B",
        "\u0627\u0644\u0637\u0627\u0644\u0628 \u0628"
      ],
      description: [
        "\u8BB0\u5FC6\u8F83\u5F3A\uFF0C\u4F46\u7406\u89E3\u9898\u548C\u6982\u5FF5\u5173\u7CFB\u9898\u504F\u5F31\u2014\u2014\u533A\u5206\u300C\u80CC\u5F97\u597D\u300D\u548C\u300C\u7406\u89E3\u5F97\u597D\u300D\u3002",
        "Strong memory but weak on comprehension and concept-relation items \u2013 distinguishes memorising from understanding.",
        "\u062D\u0641\u0638 \u0642\u0648\u064A \u0644\u0643\u0646 \u0636\u0639\u0641 \u0641\u064A \u0623\u0633\u0626\u0644\u0629 \u0627\u0644\u0641\u0647\u0645 \u0648\u0627\u0644\u0639\u0644\u0627\u0642\u0627\u062A \u0627\u0644\u0645\u0641\u0627\u0647\u064A\u0645\u064A\u0629 \u2013 \u064A\u0645\u064A\u0651\u0632 \u0628\u064A\u0646 \u0627\u0644\u062D\u0641\u0638 \u0648\u0627\u0644\u0641\u0647\u0645."
      ],
      traits: {
        memory: 0.93,
        order: 0.9,
        vocabulary: 0.8,
        comprehension: 0.42,
        concept: 0.38
      }
    },
    {
      id: "stu-c",
      code: "\u4E19",
      name: [
        "\u5B66\u751F\u4E19",
        "Student C",
        "\u0627\u0644\u0637\u0627\u0644\u0628 \u062C"
      ],
      description: [
        "\u8BCD\u6C47\u4E0E\u5339\u914D\u9898\u504F\u5F31\u2014\u2014\u5C55\u793A\u8BCD\u6C47\u7EF4\u5EA6\u5206\u6790\u3002",
        "Weak in vocabulary and matching items \u2013 shows the vocabulary dimension.",
        "\u0636\u0639\u0641 \u0641\u064A \u0627\u0644\u0645\u0641\u0631\u062F\u0627\u062A \u0648\u0623\u0633\u0626\u0644\u0629 \u0627\u0644\u0645\u0637\u0627\u0628\u0642\u0629 \u2013 \u064A\u064F\u0638\u0647\u0631 \u0628\u064F\u0639\u062F \u0627\u0644\u0645\u0641\u0631\u062F\u0627\u062A."
      ],
      traits: {
        memory: 0.82,
        order: 0.8,
        vocabulary: 0.35,
        comprehension: 0.75,
        concept: 0.72
      }
    },
    {
      id: "stu-d",
      code: "\u4E01",
      name: [
        "\u5B66\u751F\u4E01",
        "Student D",
        "\u0627\u0644\u0637\u0627\u0644\u0628 \u062F"
      ],
      description: [
        "\u6574\u4F53\u4E0D\u5DEE\uFF0C\u4F46\u67D0\u4E00\u6982\u5FF5\u8FDE\u7EED\u51FA\u9519\u2014\u2014\u5C55\u793A\u5C40\u90E8\u77E5\u8BC6\u70B9\u5F31\u9879\u3002",
        "Generally fine, but repeatedly wrong on one concept \u2013 shows a local weak point.",
        "\u062C\u064A\u062F \u0639\u0645\u0648\u0645\u064B\u0627 \u0644\u0643\u0646\u0647 \u064A\u062E\u0637\u0626 \u0628\u0627\u0633\u062A\u0645\u0631\u0627\u0631 \u0641\u064A \u0645\u0641\u0647\u0648\u0645 \u0648\u0627\u062D\u062F \u2013 \u064A\u064F\u0638\u0647\u0631 \u0646\u0642\u0637\u0629 \u0636\u0639\u0641 \u0645\u0648\u0636\u0639\u064A\u0629."
      ],
      traits: {
        memory: 0.85,
        order: 0.84,
        vocabulary: 0.82,
        comprehension: 0.8,
        concept: 0.78,
        weakConceptHint: "first"
      }
    },
    {
      id: "stu-e",
      code: "\u620A",
      name: [
        "\u5B66\u751F\u620A",
        "Student E",
        "\u0627\u0644\u0637\u0627\u0644\u0628 \u0647\u0640"
      ],
      description: [
        "\u6574\u4F53\u4E2D\u7B49\uFF0C\u591A\u4E2A\u7EF4\u5EA6\u6709\u5C11\u91CF\u9519\u8BEF\u2014\u2014\u5F62\u6210\u7FA4\u4F53\u7EDF\u8BA1\u5BF9\u6BD4\u3002",
        "Average overall with a few errors across dimensions \u2013 provides the group baseline.",
        "\u0645\u062A\u0648\u0633\u0637 \u0639\u0645\u0648\u0645\u064B\u0627 \u0645\u0639 \u0623\u062E\u0637\u0627\u0621 \u0642\u0644\u064A\u0644\u0629 \u0641\u064A \u0639\u062F\u0629 \u0623\u0628\u0639\u0627\u062F \u2013 \u064A\u0634\u0643\u0651\u0644 \u062E\u0637 \u0627\u0644\u0623\u0633\u0627\u0633 \u0644\u0644\u0645\u062C\u0645\u0648\u0639\u0629."
      ],
      traits: {
        memory: 0.7,
        order: 0.68,
        vocabulary: 0.66,
        comprehension: 0.64,
        concept: 0.6
      }
    }
  ],
  dimension: {
    memory: [
      "\u8BB0\u5FC6\u4E0E\u8BC6\u522B",
      "Memory & recognition",
      "\u0627\u0644\u062D\u0641\u0638 \u0648\u0627\u0644\u062A\u0639\u0631\u0651\u0641"
    ],
    order: [
      "\u987A\u5E8F",
      "Order",
      "\u0627\u0644\u062A\u0631\u062A\u064A\u0628"
    ],
    vocabulary: [
      "\u8BCD\u6C47",
      "Vocabulary",
      "\u0627\u0644\u0645\u0641\u0631\u062F\u0627\u062A"
    ],
    comprehension: [
      "\u7406\u89E3",
      "Comprehension",
      "\u0627\u0644\u0641\u0647\u0645"
    ],
    concept: [
      "\u6982\u5FF5\u638C\u63E1",
      "Concept mastery",
      "\u0625\u062A\u0642\u0627\u0646 \u0627\u0644\u0645\u0641\u0627\u0647\u064A\u0645"
    ]
  },
  type: {
    mcq: [
      "\u9009\u62E9\u9898",
      "Multiple choice",
      "\u0627\u062E\u062A\u064A\u0627\u0631 \u0645\u0646 \u0645\u062A\u0639\u062F\u062F"
    ],
    fill: [
      "\u586B\u7A7A",
      "Fill in the blank",
      "\u0645\u0644\u0621 \u0627\u0644\u0641\u0631\u0627\u063A"
    ],
    order: [
      "\u6392\u5E8F",
      "Ordering",
      "\u062A\u0631\u062A\u064A\u0628"
    ],
    match: [
      "\u5339\u914D",
      "Matching",
      "\u0645\u0637\u0627\u0628\u0642\u0629"
    ],
    concept: [
      "\u6982\u5FF5\u5173\u7CFB",
      "Concept relation",
      "\u0639\u0644\u0627\u0642\u0629 \u0645\u0641\u0627\u0647\u064A\u0645\u064A\u0629"
    ]
  },
  classification: {
    memory: [
      "\u8BB0\u5FC6\u95EE\u9898",
      "Memory issue",
      "\u0645\u0634\u0643\u0644\u0629 \u062D\u0641\u0638"
    ],
    vocabulary: [
      "\u8BCD\u6C47\u95EE\u9898",
      "Vocabulary issue",
      "\u0645\u0634\u0643\u0644\u0629 \u0645\u0641\u0631\u062F\u0627\u062A"
    ],
    concept: [
      "\u6982\u5FF5\u7406\u89E3\u95EE\u9898",
      "Concept understanding issue",
      "\u0645\u0634\u0643\u0644\u0629 \u0641\u0647\u0645 \u0645\u0641\u0647\u0648\u0645"
    ],
    order: [
      "\u987A\u5E8F\u95EE\u9898",
      "Ordering issue",
      "\u0645\u0634\u0643\u0644\u0629 \u062A\u0631\u062A\u064A\u0628"
    ],
    question_type: [
      "\u9898\u578B\u95EE\u9898",
      "Question-type issue",
      "\u0645\u0634\u0643\u0644\u0629 \u0646\u0648\u0639 \u0627\u0644\u0633\u0624\u0627\u0644"
    ],
    coverage_gap: [
      "\u6559\u5B66\u6750\u6599\u8986\u76D6\u4E0D\u8DB3",
      "Insufficient approved material coverage",
      "\u0646\u0642\u0635 \u0641\u064A \u062A\u063A\u0637\u064A\u0629 \u0627\u0644\u0645\u0648\u0627\u062F \u0627\u0644\u0645\u0639\u062A\u0645\u062F\u0629"
    ]
  },
  verdict: {
    common: [
      "\u7FA4\u4F53\u5171\u540C\u8584\u5F31\u70B9\uFF08{n}/{m}\uFF09",
      "Common group weak point ({n}/{m})",
      "\u0646\u0642\u0637\u0629 \u0636\u0639\u0641 \u0645\u0634\u062A\u0631\u0643\u0629 ({n}/{m})"
    ],
    hint: [
      "\u63D0\u793A\u9700\u8981\u589E\u52A0\u590D\u4E60\uFF08{n}/{m}\uFF09",
      "Suggests extra review ({n}/{m})",
      "\u064A\u0648\u0635\u0649 \u0628\u0645\u0631\u0627\u062C\u0639\u0629 \u0625\u0636\u0627\u0641\u064A\u0629 ({n}/{m})"
    ],
    individual: [
      "\u66F4\u53EF\u80FD\u5C5E\u4E8E\u4E2A\u4EBA\u95EE\u9898\uFF08{n}/{m}\uFF09",
      "More likely an individual issue ({n}/{m})",
      "\u0639\u0644\u0649 \u0627\u0644\u0623\u0631\u062C\u062D \u0645\u0634\u0643\u0644\u0629 \u0641\u0631\u062F\u064A\u0629 ({n}/{m})"
    ]
  },
  weakLabel: {
    verse: [
      "\u7ECF\u6587 {ref}",
      "Verse {ref}",
      "\u0627\u0644\u0622\u064A\u0629 {ref}"
    ],
    type: [
      "\u9898\u578B\uFF1A{type}",
      "Type: {type}",
      "\u0627\u0644\u0646\u0648\u0639: {type}"
    ],
    vocabulary: [
      "\u8BCD\u6C47\u300C{word}\u300D",
      'Vocabulary "{word}"',
      "\u0627\u0644\u0645\u0641\u0631\u062F\u0629 \xAB{word}\xBB"
    ]
  },
  recommend: {
    concept: [
      "\u590D\u4E60\u6982\u5FF5\u300C{label}\u300D\u5BF9\u5E94\u7684\u7ECF\u6587\uFF08{refs}\uFF09\uFF0C\u5728\u7406\u89E3\u56FE\u4E2D\u67E5\u770B\u5176\u5173\u8054\uFF0C\u5E76\u5B8C\u6210 5 \u9053\u9488\u5BF9\u6027\u5F3A\u5316\u9898\u3002",
      'Review the verses for the concept "{label}" ({refs}), inspect its links in the understanding map, and complete 5 targeted reinforcement items.',
      "\u0631\u0627\u062C\u0639 \u0622\u064A\u0627\u062A \u0645\u0641\u0647\u0648\u0645 \xAB{label}\xBB ({refs})\u060C \u0648\u062A\u0641\u062D\u0651\u0635 \u0631\u0648\u0627\u0628\u0637\u0647 \u0641\u064A \u062E\u0631\u064A\u0637\u0629 \u0627\u0644\u0641\u0647\u0645\u060C \u0648\u0623\u0643\u0645\u0644 5 \u0623\u0633\u0626\u0644\u0629 \u062A\u0639\u0632\u064A\u0632\u064A\u0629."
    ],
    verse: [
      "\u91CD\u8BFB\u5E76\u80CC\u8BF5 {ref}\uFF0C\u914D\u5408\u586B\u7A7A\u4E0E\u6392\u5E8F\u7EC3\u4E60\u5DE9\u56FA\u8BB0\u5FC6\u3002",
      "Re-read and memorise {ref}, reinforcing with fill-in and ordering exercises.",
      "\u0623\u0639\u062F \u0642\u0631\u0627\u0621\u0629 \u0648\u062D\u0641\u0638 {ref} \u0645\u0639 \u062A\u0645\u0627\u0631\u064A\u0646 \u0645\u0644\u0621 \u0627\u0644\u0641\u0631\u0627\u063A \u0648\u0627\u0644\u062A\u0631\u062A\u064A\u0628."
    ],
    vocabulary: [
      "\u7528\u8BCD\u6C47\u5361\u590D\u4E60\u6279\u51C6\u8BCD\u8868\u4E2D\u7684\u300C{word}\u300D\u53CA\u540C\u8282\u8BCD\u6C47\u3002",
      'Review "{word}" and its verse-mates from the approved glossary with vocabulary cards.',
      "\u0631\u0627\u062C\u0639 \xAB{word}\xBB \u0648\u0645\u0641\u0631\u062F\u0627\u062A \u0622\u064A\u062A\u0647\u0627 \u0645\u0646 \u0627\u0644\u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0645\u0639\u062A\u0645\u062F\u0629 \u0628\u0627\u0633\u062A\u062E\u062F\u0627\u0645 \u0628\u0637\u0627\u0642\u0627\u062A \u0627\u0644\u0645\u0641\u0631\u062F\u0627\u062A."
    ],
    type: [
      "{type} \u9898\u578B\u9519\u8BEF\u96C6\u4E2D\uFF0C\u5EFA\u8BAE\u5148\u505A 3 \u9053\u540C\u7C7B\u4F4E\u96BE\u5EA6\u7EC3\u4E60\u719F\u6089\u9898\u578B\u3002",
      "Errors cluster in {type} items; start with 3 easier items of the same type to get used to the format.",
      "\u062A\u062A\u0631\u0643\u0632 \u0627\u0644\u0623\u062E\u0637\u0627\u0621 \u0641\u064A \u0623\u0633\u0626\u0644\u0629 {type}\u061B \u0627\u0628\u062F\u0623 \u0628\u062B\u0644\u0627\u062B\u0629 \u0623\u0633\u0626\u0644\u0629 \u0623\u0633\u0647\u0644 \u0645\u0646 \u0627\u0644\u0646\u0648\u0639 \u0646\u0641\u0633\u0647 \u0644\u0644\u062A\u0639\u0648\u0651\u062F \u0639\u0644\u0649 \u0627\u0644\u0634\u0643\u0644."
    ],
    fine: [
      "\u5404\u7EF4\u5EA6\u5747\u8861\uFF0C\u5EFA\u8BAE\u8FDB\u5165\u4E0B\u4E00\u5355\u5143\u5E76\u505A\u4E00\u6B21\u7EFC\u5408\u590D\u6D4B\u3002",
      "All dimensions are balanced; proceed to the next unit and take a comprehensive retest.",
      "\u062C\u0645\u064A\u0639 \u0627\u0644\u0623\u0628\u0639\u0627\u062F \u0645\u062A\u0648\u0627\u0632\u0646\u0629\u061B \u0627\u0646\u062A\u0642\u0644 \u0625\u0644\u0649 \u0627\u0644\u0648\u062D\u062F\u0629 \u0627\u0644\u062A\u0627\u0644\u064A\u0629 \u0648\u0623\u062C\u0631\u0650 \u0625\u0639\u0627\u062F\u0629 \u0627\u062E\u062A\u0628\u0627\u0631 \u0634\u0627\u0645\u0644\u0629."
    ]
  },
  note: {
    concept: [
      "{n} \u540D\u5B66\u751F\u5728\u6982\u5FF5\u300C{label}\u300D\u76F8\u5173\u9898\u4E0A\u51FA\u9519\uFF0C\u5EFA\u8BAE\u96C6\u4E2D\u8BB2\u89E3\u5E76\u914D\u7406\u89E3\u56FE\u3002",
      '{n} students missed items on the concept "{label}"; teach it explicitly with the understanding map.',
      "\u0623\u062E\u0637\u0623 {n} \u0637\u0644\u0627\u0628 \u0641\u064A \u0623\u0633\u0626\u0644\u0629 \u0645\u0641\u0647\u0648\u0645 \xAB{label}\xBB\u061B \u064A\u064F\u0646\u0635\u062D \u0628\u0634\u0631\u062D\u0647 \u0645\u0639 \u062E\u0631\u064A\u0637\u0629 \u0627\u0644\u0641\u0647\u0645."
    ],
    vocabulary: [
      "{n} \u540D\u5B66\u751F\u5728\u8BCD\u6C47\u300C{word}\u300D\u4E0A\u51FA\u9519\uFF0C\u9700\u8981\u589E\u52A0\u8BCD\u6C47\u590D\u4E60\u3002",
      '{n} students missed the word "{word}"; add vocabulary review.',
      "\u0623\u062E\u0637\u0623 {n} \u0637\u0644\u0627\u0628 \u0641\u064A \u0627\u0644\u0645\u0641\u0631\u062F\u0629 \xAB{word}\xBB\u061B \u0623\u0636\u0641 \u0645\u0631\u0627\u062C\u0639\u0629 \u0644\u0644\u0645\u0641\u0631\u062F\u0627\u062A."
    ],
    verse: [
      "{n} \u540D\u5B66\u751F\u5728 {ref} \u7684\u8BB0\u5FC6/\u987A\u5E8F\u9898\u4E0A\u51FA\u9519\u3002",
      "{n} students missed memory/order items on {ref}.",
      "\u0623\u062E\u0637\u0623 {n} \u0637\u0644\u0627\u0628 \u0641\u064A \u0623\u0633\u0626\u0644\u0629 \u0627\u0644\u062D\u0641\u0638/\u0627\u0644\u062A\u0631\u062A\u064A\u0628 \u0644\u0644\u0622\u064A\u0629 {ref}."
    ],
    type: [
      "{n} \u540D\u5B66\u751F\u5728 {type} \u9898\u578B\u4E0A\u51FA\u9519\uFF0C\u53EF\u80FD\u662F\u9898\u578B\u719F\u6089\u5EA6\u95EE\u9898\u800C\u975E\u5185\u5BB9\u95EE\u9898\u3002",
      "{n} students missed {type} items \u2013 possibly familiarity with the format rather than the content.",
      "\u0623\u062E\u0637\u0623 {n} \u0637\u0644\u0627\u0628 \u0641\u064A \u0623\u0633\u0626\u0644\u0629 {type} \u2013 \u0631\u0628\u0645\u0627 \u0628\u0633\u0628\u0628 \u0634\u0643\u0644 \u0627\u0644\u0633\u0624\u0627\u0644 \u0644\u0627 \u0627\u0644\u0645\u062D\u062A\u0648\u0649."
    ],
    coverage: [
      "\u8BE5\u6982\u5FF5\u4EC5\u6709\u7ED3\u6784\u8868\u4E00\u6761\u6279\u51C6\u8D44\u6599\u652F\u6491\uFF0C\u9519\u8BEF\u96C6\u4E2D\u65F6\u66F4\u53EF\u80FD\u662F\u6559\u5B66\u6750\u6599\u8986\u76D6\u4E0D\u8DB3\uFF0C\u5EFA\u8BAE\u8865\u5145\u7ECF\u6279\u51C6\u7684\u8BB2\u89E3\u8D44\u6599\u3002",
      "Only one approved structure-table entry supports this concept; clustered errors more likely indicate insufficient approved material \u2013 add approved explanatory material.",
      "\u0644\u0627 \u064A\u062F\u0639\u0645 \u0647\u0630\u0627 \u0627\u0644\u0645\u0641\u0647\u0648\u0645 \u0633\u0648\u0649 \u0645\u062F\u062E\u0644 \u0648\u0627\u062D\u062F \u0645\u0646 \u062C\u062F\u0648\u0644 \u0627\u0644\u0628\u0646\u064A\u0629 \u0627\u0644\u0645\u0639\u062A\u0645\u062F\u061B \u062A\u0631\u0643\u0651\u0632 \u0627\u0644\u0623\u062E\u0637\u0627\u0621 \u064A\u0634\u064A\u0631 \u0625\u0644\u0649 \u0646\u0642\u0635 \u0627\u0644\u0645\u0648\u0627\u062F \u0627\u0644\u0645\u0639\u062A\u0645\u062F\u0629."
    ]
  }
};

// ../../../totalclaw-solutions/solutions/workbench-quran-teaching/src/main/services/quranTeaching/students.ts
var T3 = analysisTemplates_default;
var tri2 = (v) => ({ zh: v[0], en: v[1], ar: v[2] });
var DIMENSIONS = ["memory", "order", "vocabulary", "comprehension", "concept"];
function demoStudents() {
  return T3.students.map((s) => ({ id: s.id, code: s.code, name: tri2(s.name), description: tri2(s.description), traits: { ...s.traits } }));
}
function typeLabel(t2, lang2) {
  return fill(T3.type[t2] || [t2, t2, t2], lang2, {});
}
function classificationLabel(c, lang2) {
  return fill(T3.classification[c], lang2, {});
}
function simulateAnswers(student, paper, seed, opts = {}) {
  const rng = new SeededRng(`${seed}:${student.id}:${paper.id}`);
  let weakConcept;
  if (student.traits.weakConceptHint === "first") {
    const freq = /* @__PURE__ */ new Map();
    for (const q of paper.questions) if (q.conceptId) freq.set(q.conceptId, (freq.get(q.conceptId) || 0) + 1);
    weakConcept = Array.from(freq.entries()).sort((a, b) => b[1] - a[1])[0]?.[0];
  }
  const now = Date.now();
  return paper.questions.map((q, i) => {
    let p = student.traits[q.dimension] ?? 0.7;
    if (weakConcept && q.conceptId === weakConcept) p = 0.12;
    if (student.traits.weakChapter && q.sourceRefs[0]?.startsWith(`${student.traits.weakChapter}:`)) p *= 0.5;
    p = Math.min(0.98, p + (opts.boost || 0));
    const correct = rng.chance(p);
    const answer = correct ? q.answer : wrongAnswer(q, rng);
    return {
      id: `r-${paper.id}-${student.id}-${q.id}-${opts.attempt || 1}`,
      studentId: student.id,
      paperId: paper.id,
      questionId: q.id,
      chapter: paper.chapter,
      answer,
      correct,
      attempt: opts.attempt || 1,
      timeSec: 20 + rng.int(70),
      answeredAt: now + i * 1e3,
      origin: opts.origin || "preset"
    };
  });
}
function wrongAnswer(q, rng) {
  if (typeof q.answer === "number") {
    const others = q.options.map((_, i) => i).filter((i) => i !== q.answer);
    return others.length ? rng.pick(others) : q.answer;
  }
  const arr = q.answer.slice();
  if (arr.length >= 2) {
    const i = rng.int(arr.length);
    let j = rng.int(arr.length);
    if (j === i) j = (i + 1) % arr.length;
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
function pct(correct, total) {
  return { pct: total ? Math.round(correct / total * 100) : 0, correct, total };
}
function weakKey(q) {
  if (q.conceptId) return { kind: "concept", key: q.conceptId, label: () => q.conceptLabel || q.conceptId, refs: q.sourceRefs };
  if (q.dimension === "vocabulary" && q.materialIds[0]) {
    const word = typeof q.answer === "number" ? q.options[q.answer] : (q.left || [])[0] || "";
    return { kind: "vocabulary", key: q.materialIds[0], label: (lang2) => fill(T3.weakLabel.vocabulary, lang2, { word }), refs: q.sourceRefs, word };
  }
  if (q.sourceRefs[0]) return { kind: "verse", key: q.sourceRefs[0], label: (lang2) => fill(T3.weakLabel.verse, lang2, { ref: q.sourceRefs[0] }), refs: q.sourceRefs };
  return { kind: "type", key: q.type, label: (lang2) => fill(T3.weakLabel.type, lang2, { type: typeLabel(q.type, lang2) }), refs: [] };
}
function analyzeStudent(studentId, paper, records, lang2) {
  const paperQuestions = (0, import_quranPaperVariant.questionsForStudent)(paper, studentId);
  const byQ = /* @__PURE__ */ new Map();
  for (const r of records) if (r.studentId === studentId && r.paperId === paper.id) {
    const prev = byQ.get(r.questionId);
    if (!prev || r.attempt >= prev.attempt) byQ.set(r.questionId, r);
  }
  const dims = { memory: { c: 0, t: 0 }, order: { c: 0, t: 0 }, vocabulary: { c: 0, t: 0 }, comprehension: { c: 0, t: 0 }, concept: { c: 0, t: 0 } };
  const weak = /* @__PURE__ */ new Map();
  const typeWrong = /* @__PURE__ */ new Map();
  let correct = 0;
  let total = 0;
  for (const q of paperQuestions) {
    const r = byQ.get(q.id);
    const ok = r ? isCorrect(q, r.answer) : false;
    total += 1;
    if (ok) correct += 1;
    dims[q.dimension].t += 1;
    if (ok) dims[q.dimension].c += 1;
    const tw = typeWrong.get(q.type) || { wrong: 0, total: 0 };
    tw.total += 1;
    if (!ok) tw.wrong += 1;
    typeWrong.set(q.type, tw);
    const wk = weakKey(q);
    const item = weak.get(wk.key) || { kind: wk.kind, key: wk.key, label: wk.label(lang2), refs: [], wrong: 0, total: 0 };
    item.total += 1;
    if (!ok) item.wrong += 1;
    for (const ref of wk.refs) if (!item.refs.includes(ref)) item.refs.push(ref);
    weak.set(wk.key, item);
  }
  for (const [type, tw] of typeWrong) if (tw.total >= 2 && tw.wrong / tw.total >= 0.5) {
    weak.set(`type:${type}`, { kind: "type", key: type, label: fill(T3.weakLabel.type, lang2, { type: typeLabel(type, lang2) }), refs: [], wrong: tw.wrong, total: tw.total });
  }
  const weakItems = Array.from(weak.values()).filter((w) => w.wrong > 0).sort((a, b) => b.wrong / b.total - a.wrong / a.total || b.wrong - a.wrong).slice(0, 6);
  const recommendations = weakItems.slice(0, 3).map((w) => {
    if (w.kind === "concept") return fill(T3.recommend.concept, lang2, { label: w.label, refs: w.refs.slice(0, 4).join(", ") });
    if (w.kind === "verse") return fill(T3.recommend.verse, lang2, { ref: w.key });
    if (w.kind === "vocabulary") return fill(T3.recommend.vocabulary, lang2, { word: rawWord(paper, w.key) || w.label });
    return fill(T3.recommend.type, lang2, { type: typeLabel(w.key, lang2) });
  });
  if (!recommendations.length) recommendations.push(fill(T3.recommend.fine, lang2, {}));
  return {
    studentId,
    paperId: paper.id,
    total: pct(correct, total),
    dimensions: { memory: pct(dims.memory.c, dims.memory.t), order: pct(dims.order.c, dims.order.t), vocabulary: pct(dims.vocabulary.c, dims.vocabulary.t), comprehension: pct(dims.comprehension.c, dims.comprehension.t), concept: pct(dims.concept.c, dims.concept.t) },
    weakItems,
    recommendations
  };
}
function rawWord(paper, materialId) {
  const q = paper.questions.find((x) => x.dimension === "vocabulary" && x.materialIds[0] === materialId);
  return q ? weakKey(q).word || "" : "";
}
function classify(q, kind, approvedCount) {
  if (kind === "type") return "question_type";
  if (kind === "vocabulary") return "vocabulary";
  if (kind === "concept") return approvedCount <= 1 ? "coverage_gap" : "concept";
  if (q.dimension === "order") return "order";
  return "memory";
}
function analyzeGroup(paper, students, records, lang2, approvedCountFor) {
  const perStudent = students.map((s) => analyzeStudent(s.id, paper, records, lang2));
  const issues = /* @__PURE__ */ new Map();
  for (const q of paper.questions) {
    const wk = weakKey(q);
    const it = issues.get(wk.key) || { key: wk.key, kind: wk.kind, label: wk.label(lang2), refs: wk.refs.slice(0, 6), wrongStudents: [], wrongCount: 0, studentCount: students.length, ratio: 0, verdict: "individual", classification: "memory", note: "", _q: q };
    issues.set(wk.key, it);
  }
  for (const [i, s] of students.entries()) {
    const a = perStudent[i];
    for (const w of a.weakItems) {
      if (w.kind === "type") continue;
      const it = issues.get(w.key);
      if (it && w.wrong > 0 && !it.wrongStudents.includes(s.id)) it.wrongStudents.push(s.id);
    }
  }
  const typeStats = /* @__PURE__ */ new Map();
  for (const q of paper.questions) {
    const t2 = typeStats.get(q.type) || { qs: [] };
    t2.qs.push(q);
    typeStats.set(q.type, t2);
  }
  for (const [type, st] of typeStats) {
    if (st.qs.length < 2) continue;
    const key = `type:${type}`;
    const it = { key, kind: "type", label: fill(T3.weakLabel.type, lang2, { type: typeLabel(type, lang2) }), refs: [], wrongStudents: [], wrongCount: 0, studentCount: students.length, ratio: 0, verdict: "individual", classification: "question_type", note: "", _q: st.qs[0] };
    for (const [i, s] of students.entries()) if (perStudent[i].weakItems.some((w) => w.kind === "type" && w.key === type)) it.wrongStudents.push(s.id);
    issues.set(key, it);
  }
  const out = [];
  for (const it of issues.values()) {
    it.wrongCount = it.wrongStudents.length;
    if (!it.wrongCount) continue;
    it.ratio = Math.round(it.wrongCount / it.studentCount * 100) / 100;
    it.verdict = it.wrongCount >= 3 ? "common" : it.wrongCount === 2 ? "hint" : "individual";
    const q = it._q;
    it.classification = classify(q, it.kind, it.kind === "concept" ? approvedCountFor(it.key) : 99);
    const v = fill(T3.verdict[it.verdict], lang2, { n: it.wrongCount, m: it.studentCount });
    let note = "";
    if (it.kind === "concept") note = fill(T3.note.concept, lang2, { n: it.wrongCount, label: it.label });
    else if (it.kind === "vocabulary") note = fill(T3.note.vocabulary, lang2, { n: it.wrongCount, word: weakKey(q).word || it.label });
    else if (it.kind === "verse") note = fill(T3.note.verse, lang2, { n: it.wrongCount, ref: it.key });
    else note = fill(T3.note.type, lang2, { n: it.wrongCount, type: typeLabel(it.key.replace(/^type:/, ""), lang2) });
    if (it.classification === "coverage_gap") note += " " + fill(T3.note.coverage, lang2, {});
    it.note = `${v} \xB7 ${note}`;
    delete it._q;
    out.push(it);
  }
  out.sort((a, b) => b.wrongCount - a.wrongCount || (a.kind === "concept" ? -1 : 1));
  return { paperId: paper.id, issues: out, commonCount: out.filter((i) => i.verdict === "common").length, computedAt: Date.now() };
}
function analyzePaper(paper, students, records, lang2, approvedCountFor) {
  return {
    paperId: paper.id,
    students: students.map((s) => analyzeStudent(s.id, paper, records, lang2)),
    group: analyzeGroup(paper, students, records, lang2, approvedCountFor)
  };
}
function knowledgeKey(q) {
  const k = weakKey(q);
  return k.kind === "type" ? null : k.key;
}
function covers(p, key) {
  if (key.startsWith("type:")) return p.questions.filter((q) => q.type === key.slice(5)).length >= 2;
  return p.questions.some((q) => knowledgeKey(q) === key);
}
function compareRetest(base, retest, students, records, lang2, approvedCountFor, targetKey) {
  const baseKeys = new Set(base.questions.map(knowledgeKey).filter((k) => !!k));
  const keys = Array.from(new Set(retest.questions.map(knowledgeKey).filter((k) => !!k && baseKeys.has(k))));
  const shared = new Set(keys);
  const scope = (p) => ({ ...p, questions: p.questions.filter((q) => shared.has(knowledgeKey(q) || "")) });
  const b = scope(base);
  const a = scope(retest);
  const common = (g) => g.issues.filter((i) => shared.has(i.key) && i.verdict === "common").length;
  const wrongOf = (p, key) => analyzeGroup(p, students, records, lang2, approvedCountFor).issues.find((i) => i.key === key)?.wrongCount ?? 0;
  return {
    keys,
    target: { before: wrongOf(base, targetKey), after: covers(retest, targetKey) ? wrongOf(retest, targetKey) : null, studentCount: students.length },
    common: { before: common(analyzeGroup(b, students, records, lang2, approvedCountFor)), after: common(analyzeGroup(a, students, records, lang2, approvedCountFor)) },
    students: students.map((s) => ({ studentId: s.id, before: analyzeStudent(s.id, b, records, lang2).total, after: analyzeStudent(s.id, a, records, lang2).total }))
  };
}

// ../../../totalclaw-solutions/solutions/workbench-quran-teaching/src/main/services/quranTeaching/reinforce.ts
var T4 = reinforceTemplates_default;
function specForIssue(issue, count) {
  if (issue.kind === "concept") return { count, focus: { conceptId: issue.key }, mix: { 1: 0.2, 2: 0.5, 3: 0.3 } };
  if (issue.kind === "vocabulary") return { count, focus: { kind: "vocabulary", key: issue.key, dimension: "vocabulary" }, types: ["fill", "match"], mix: { 1: 0.5, 2: 0.5, 3: 0 } };
  if (issue.kind === "verse") return { count, focus: { kind: "verse", key: issue.key }, mix: { 1: 0.8, 2: 0.2, 3: 0 } };
  return { count, types: [issue.key.replace(/^type:/, "")], mix: { 1: 0.6, 2: 0.3, 3: 0.1 } };
}
function reinforcementExplanation(issue, lang2, parse, materials) {
  const cls = classificationLabel(issue.classification, lang2);
  if (issue.kind === "concept") {
    const c = parse.concepts.find((x) => x.id === issue.key);
    const unit = materials.find((m) => m.kind === "unit" && c?.materialIds.includes(m.id));
    return fill(T4.explanation.concept, lang2, { label: issue.label, cls, refs: (c?.verseRefs || issue.refs).slice(0, 6).join(", "), body: unit?.body?.[lang2] || "" });
  }
  if (issue.kind === "vocabulary") {
    const g = materials.find((m) => m.id === issue.key);
    return fill(T4.explanation.vocabulary, lang2, { label: issue.label, cls, body: g?.title[lang2] || "", refs: issue.refs.join(", ") });
  }
  if (issue.kind === "verse") return fill(T4.explanation.verse, lang2, { label: issue.key, cls });
  return fill(T4.explanation.type, lang2, { label: issue.label, cls });
}
function reviewCards(issue, lang2, parse, verses, materials) {
  const cards = [];
  const byRef = new Map(verses.map((v) => [v.ref, v]));
  if (issue.kind === "concept") {
    const c = parse.concepts.find((x) => x.id === issue.key);
    const unit = materials.find((m) => m.kind === "unit" && c?.materialIds.includes(m.id));
    if (c) cards.push({ title: fill(T4.card.conceptTitle, lang2, { label: c.label[lang2] }), body: fill(T4.card.conceptBody, lang2, { refs: c.verseRefs.slice(0, 6).join(", "), body: unit?.body?.[lang2] || "" }), refs: c.verseRefs });
    for (const ref of (c?.verseRefs || issue.refs).slice(0, 3)) {
      const v = byRef.get(ref);
      if (v) cards.push({ title: fill(T4.card.verse, lang2, { ref }), body: "", arabic: v.arabic, refs: [ref] });
    }
    for (const w of parse.vocabulary.filter((x) => x.meaning && x.refs.some((r) => c?.verseRefs.includes(r))).slice(0, 3)) {
      cards.push({ title: fill(T4.card.vocabTitle, lang2, { word: w.word }), body: fill(T4.card.vocabBody, lang2, { meaning: w.meaning[lang2], refs: w.refs.slice(0, 3).join(", ") }), refs: w.refs, arabic: w.word });
    }
  } else if (issue.kind === "vocabulary") {
    const w = parse.vocabulary.find((x) => x.materialId === issue.key);
    if (w) {
      cards.push({ title: fill(T4.card.vocabTitle, lang2, { word: w.word }), body: fill(T4.card.vocabBody, lang2, { meaning: w.meaning[lang2], refs: w.refs.slice(0, 3).join(", ") }), refs: w.refs, arabic: w.word });
      for (const ref of w.refs.slice(0, 2)) {
        const v = byRef.get(ref);
        if (v) cards.push({ title: fill(T4.card.verse, lang2, { ref }), body: "", arabic: v.arabic, refs: [ref] });
      }
    }
  } else if (issue.kind === "verse") {
    const v = byRef.get(issue.key);
    if (v) {
      cards.push({ title: fill(T4.card.verse, lang2, { ref: v.ref }), body: "", arabic: v.arabic, refs: [v.ref] });
      const u = parse.units.find((x) => x.verseRefs.includes(v.ref));
      if (u) cards.push({ title: fill(T4.card.unitTitle, lang2, { title: u.title[lang2] }), body: u.theme[lang2], refs: u.verseRefs });
      for (const w of parse.vocabulary.filter((x) => x.meaning && x.refs.includes(v.ref)).slice(0, 3)) cards.push({ title: fill(T4.card.vocabTitle, lang2, { word: w.word }), body: fill(T4.card.vocabBody, lang2, { meaning: w.meaning[lang2], refs: w.refs.slice(0, 3).join(", ") }), refs: w.refs, arabic: w.word });
    }
  } else {
    for (const u of parse.units.slice(0, 2)) cards.push({ title: fill(T4.card.unitTitle, lang2, { title: u.title[lang2] }), body: u.theme[lang2], refs: u.verseRefs });
  }
  return cards;
}

// ../../../totalclaw-solutions/solutions/workbench-quran-teaching/src/main/services/quranTeaching/store.ts
var emptyState = () => ({ corpusDir: "", corpusSource: "", plans: [], papers: [], records: [], reinforcements: [], cards: [], scripts: [], videos: [], questionEdits: {} });
var QuranTeachingStore = class {
  constructor(deps) {
    this.deps = deps;
    (0, import_node_fs2.mkdirSync)(this.dir(), { recursive: true });
    this.load();
    const dir = this.state.corpusDir && (0, import_node_fs2.existsSync)(this.state.corpusDir) ? this.state.corpusDir : deps.bundledCorpusDir;
    this.importCorpus(dir, dir === deps.bundledCorpusDir ? "bundled" : "directory");
    this.adoptBundledVideos();
  }
  corpus = emptyCorpus();
  state = emptyState();
  parseCache = /* @__PURE__ */ new Map();
  materials = approvedMaterials();
  students = demoStudents();
  // ── 持久化 ──
  dir() {
    return (0, import_node_path2.join)(this.deps.dataDir, "quran-teaching");
  }
  file() {
    return (0, import_node_path2.join)(this.dir(), "state.json");
  }
  load() {
    try {
      if ((0, import_node_fs2.existsSync)(this.file())) this.state = { ...emptyState(), ...JSON.parse((0, import_node_fs2.readFileSync)(this.file(), "utf8")) };
    } catch (e) {
      const kept = (0, import_atomicJson.quarantineCorruptFile)(this.file(), String(e?.message || e));
      this.deps.logger?.warn?.("quran-teaching: state \u8BFB\u53D6\u5931\u8D25\uFF0C\u5DF2\u9694\u79BB\u635F\u574F\u6587\u4EF6\u5E76\u7528\u7A7A\u72B6\u6001\u542F\u52A8", {
        err: String(e?.message || e),
        quarantined: kept || "(\u9694\u79BB\u5931\u8D25)"
      });
    }
    this.dropStaleLanguageContent();
  }
  /**
   * 旧版本生成的英文 / 阿语试卷与强化里夹着中文（当时来源名只有中文、概念名取中文原卷的），存档里一直留着，
   * 切到该语言时会被当成「已有本语言版本」直接显示。模板生成的英文 / 阿语内容本不该含汉字：
   * 这类存档丢掉（连同其答题记录），切语言时按原参数重新生成。教师在题目上的编辑存在 questionEdits，不在检查范围。
   */
  dropStaleLanguageContent() {
    const papers = this.state.papers.filter((p) => !(p.lang !== "zh" && hasHanText(p)));
    const reinforcements = this.state.reinforcements.filter((r) => !(r.practice.lang !== "zh" && hasHanText(r)));
    if (papers.length === this.state.papers.length && reinforcements.length === this.state.reinforcements.length) return;
    const kept = new Set(papers.map((p) => p.id));
    this.deps.logger?.info?.("quran-teaching: \u4E22\u5F03\u542B\u4E2D\u6587\u7684\u65E7\u82F1\u6587 / \u963F\u8BED\u751F\u6210\u5185\u5BB9", { papers: this.state.papers.length - papers.length, reinforcements: this.state.reinforcements.length - reinforcements.length });
    this.state.papers = papers;
    this.state.reinforcements = reinforcements;
    this.state.records = this.state.records.filter((r) => kept.has(r.paperId));
    this.save();
  }
  /**
   * ⚠️ 必须原子写。原实现是 `writeFileSync(file, JSON.stringify(state))` 直接覆盖 ——
   * 写盘途中断电 / 被强杀就留下一个**截断的 state.json**，而 load() 的 catch 只 warn
   * 一句就换成空状态：**语料目录、全部试卷、全部答题记录、教学计划、卡片一起归零，
   * 而且不报错**。学生交卷阶段每答一题写一次整份 state，这个窗口一点都不小。
   * 同仓库 utils/atomicJson 的 writeJsonAtomic 是 tmp + fsync + 带退避重试的 rename，
   * eduHubStore 早就在用，这边补上。
   */
  save() {
    try {
      (0, import_atomicJson.writeJsonAtomic)(this.file(), this.state);
    } catch (e) {
      this.deps.logger?.warn?.("quran-teaching: state \u5199\u5165\u5931\u8D25", { err: String(e?.message || e) });
    }
  }
  now() {
    return this.deps.now ? this.deps.now() : Date.now();
  }
  // ── L1 语料 ──
  importCorpus(dir, source) {
    const located = locateCorpusDir(dir);
    const loaded = loadCorpus(located, source);
    if (loaded.status.allVerified) {
      this.corpus = loaded;
      this.state.corpusDir = located;
      this.state.corpusSource = source;
      this.parseCache.clear();
      this.save();
      this.deps.logger?.info?.("quran-teaching: \u8BED\u6599\u5BFC\u5165\u5E76\u6821\u9A8C\u901A\u8FC7", { dir: located, verses: loaded.verses.length });
    } else {
      this.deps.logger?.warn?.("quran-teaching: \u8BED\u6599\u6821\u9A8C\u5931\u8D25\uFF0C\u62D2\u7EDD\u5BFC\u5165", { dir: located, problems: loaded.status.problems });
      if (!this.corpus.status.imported) this.corpus = { ...emptyCorpus(), status: loaded.status };
      return loaded.status;
    }
    return this.corpus.status;
  }
  corpusStatus() {
    return this.corpus.status;
  }
  requireCorpus() {
    if (!this.corpus.status.imported) throw new Error("CORPUS_NOT_IMPORTED");
  }
  verses(chapter, from, to) {
    return versesInRange(this.corpus, chapter, from, to);
  }
  search(query, chapter) {
    const pool = chapter ? this.corpus.byChapter.get(chapter) || [] : this.corpus.verses;
    return searchVerses(pool, query);
  }
  chapterLabel(chapter, lang2) {
    return chapterName(this.corpus, chapter, lang2);
  }
  // ── L2 ──
  materialsFor(chapter, from, to) {
    return this.materials.filter((m) => m.chapter === chapter && (!from || !to || m.kind === "glossary" || m.kind === "theme" || (m.from ?? 1) <= to && (m.to ?? 9999) >= from));
  }
  approvedIds() {
    return new Set(this.materials.map((m) => m.id));
  }
  approvedCountFor(conceptId) {
    const c = this.materials.find((m) => m.id === conceptId);
    if (!c) return 0;
    return this.materials.filter((m) => m.chapter === c.chapter && (m.kind === "concept" || m.kind === "unit" || m.kind === "note") && (m.from ?? 1) <= (c.to ?? 9999) && (m.to ?? 9999) >= (c.from ?? 1)).length;
  }
  approvedText(chapter, from, to, lang2) {
    return this.materialsFor(chapter, from, to).filter((m) => m.kind !== "glossary").map((m) => `[${m.id}] ${m.title[lang2]}${m.body ? `: ${m.body[lang2]}` : ""}`).join("\n");
  }
  // ── 解析 ──
  normalizeRange(chapter, from, to) {
    const all = this.corpus.byChapter.get(chapter) || [];
    if (!all.length) throw new Error(`CHAPTER_NOT_FOUND:${chapter}`);
    const lo = Math.max(1, Math.min(all.length, from || 1));
    const hi = Math.max(lo, Math.min(all.length, to || all.length));
    return { from: lo, to: hi };
  }
  parse(chapter, from, to) {
    this.requireCorpus();
    const r = this.normalizeRange(chapter, from, to);
    const key = `${chapter}:${r.from}-${r.to}`;
    const cached = this.parseCache.get(key);
    if (cached) return cached;
    const result = parseRange(chapter, this.verses(chapter, r.from, r.to), this.materials);
    this.parseCache.set(key, result);
    return result;
  }
  // ── 教学计划 ──
  async generatePlan(req) {
    this.requireCorpus();
    const r = this.normalizeRange(req.chapter, req.from, req.to);
    const request = { ...req, from: r.from, to: r.to, sessionsPerWeek: clamp(req.sessionsPerWeek, 1, 7), sessionMinutes: clamp(req.sessionMinutes, 15, 180), weeks: clamp(req.weeks, 1, 16) };
    const parse = this.parse(request.chapter, request.from, request.to);
    let plan = buildPlanSkeleton(`plan-${this.now().toString(36)}`, request, parse, this.chapterLabel(request.chapter, request.lang));
    if (this.deps.llm && this.deps.llmReady?.()) {
      try {
        const raw = await this.deps.llm(enrichPrompt(plan, this.approvedText(request.chapter, request.from, request.to, request.lang)), 6e4);
        plan = applyEnrichment(plan, raw);
      } catch (e) {
        this.deps.logger?.warn?.("quran-teaching: \u8BA1\u5212\u6DA6\u8272\u5931\u8D25\uFF0C\u7528\u6A21\u677F\u9AA8\u67B6", { err: String(e?.message || e) });
      }
    }
    plan.createdAt = this.now();
    this.state.plans.unshift(plan);
    this.state.plans = this.state.plans.slice(0, 30);
    this.save();
    return plan;
  }
  /** 已生成的课程（教师端下发课程时从这里挑） */
  listPlans() {
    return this.state.plans;
  }
  findPlan(id) {
    return this.state.plans.find((p) => p.id === id) || null;
  }
  savePlan(id, patch) {
    const plan = this.state.plans.find((p) => p.id === id);
    if (!plan) throw new Error("PLAN_NOT_FOUND");
    if (patch.adaptation !== void 0) plan.adaptation = String(patch.adaptation).slice(0, 2e3);
    if (patch.overview !== void 0) plan.overview = String(patch.overview).slice(0, 2e3);
    if (Array.isArray(patch.objectives)) plan.objectives = patch.objectives.map(String).slice(0, 8);
    if (Array.isArray(patch.sessions)) plan.sessions = patch.sessions;
    plan.reviewStatus = patch.reviewStatus || "edited";
    this.save();
    return plan;
  }
  // ── 理解图 ──
  graph(chapter, from, to, lang2) {
    const parse = this.parse(chapter, from, to);
    const papers = this.state.papers.filter((p) => p.chapter === chapter);
    const ids = new Set(papers.map((p) => p.id));
    return buildGraph(parse, this.verses(chapter, parse.from, parse.to), this.chapterLabel(chapter, lang2), lang2, papers.map((p) => this.materializePaper(p)), this.state.records.filter((r) => ids.has(r.paperId)), this.students);
  }
  // ── 出题 ──
  quizContext(chapter, from, to, lang2) {
    return { lang: lang2, chapterName: this.chapterLabel(chapter, lang2), verses: this.verses(chapter, from, to), chapterVerses: this.corpus.byChapter.get(chapter) || [], parse: this.parse(chapter, from, to), glossarySource: this.materials.find((m) => m.kind === "glossary")?.source[lang2] || "" };
  }
  /** 教师编辑过的题目覆盖在原题上（编辑不改 id，来源字段保留） */
  materializePaper(p) {
    const edits = this.state.questionEdits;
    if (!Object.keys(edits).length) return p;
    return { ...p, questions: p.questions.map((q) => edits[q.id] ? { ...q, ...edits[q.id] } : q) };
  }
  generatePaper(opts) {
    this.requireCorpus();
    const r = this.normalizeRange(opts.chapter, opts.from, opts.to);
    const lang2 = opts.lang;
    const ctx = this.quizContext(opts.chapter, r.from, r.to, lang2);
    const seed = newSeed("p");
    const spec = opts.spec ? { ...opts.spec, audience: opts.spec.audience ?? opts.audience } : { count: clamp(opts.count || 10, 3, 30), mix: defaultMix(opts.level || "beginner"), audience: opts.audience };
    const { questions, rejected } = generateQuestions(ctx, seed, spec, this.approvedIds());
    if (!questions.length) throw new Error("NO_QUESTIONS");
    const kind = opts.kind || "practice";
    const version = this.state.papers.filter((p) => p.chapter === opts.chapter && p.from === r.from && p.to === r.to && p.kind === kind).length + 1;
    const paper = {
      id: `paper-${seed}`,
      kind,
      chapter: opts.chapter,
      from: r.from,
      to: r.to,
      version,
      seed,
      lang: lang2,
      questions,
      title: opts.title || paperTitle(kind, lang2, { chapter: ctx.chapterName, range: rangeLabel(r.from, r.to), v: version, target: opts.targetKey || "" }),
      signature: paperSignature(questions),
      targetKey: opts.targetKey,
      createdAt: this.now()
    };
    this.state.papers.unshift(paper);
    this.state.papers = this.state.papers.slice(0, 60);
    this.save();
    return { paper, rejected };
  }
  papers() {
    return this.state.papers.map((p) => this.materializePaper(p));
  }
  paper(id) {
    const p = this.state.papers.find((x) => x.id === id);
    if (!p) throw new Error("PAPER_NOT_FOUND");
    return this.materializePaper(p);
  }
  updateQuestion(paperId, questionId, patch) {
    const p = this.state.papers.find((x) => x.id === paperId);
    if (!p) throw new Error("PAPER_NOT_FOUND");
    if (patch.remove) {
      p.questions = p.questions.filter((q) => q.id !== questionId);
      this.state.records = this.state.records.filter((r) => r.questionId !== questionId);
    } else {
      const q = p.questions.find((x) => x.id === questionId);
      if (!q) throw new Error("QUESTION_NOT_FOUND");
      const e = this.state.questionEdits[questionId] || {};
      if (patch.stem !== void 0) e.stem = String(patch.stem).slice(0, 1e3);
      if (patch.explanation !== void 0) e.explanation = String(patch.explanation).slice(0, 1e3);
      if (patch.reviewStatus) e.reviewStatus = patch.reviewStatus;
      this.state.questionEdits[questionId] = e;
    }
    p.signature = paperSignature(this.materializePaper(p).questions);
    this.save();
    return this.materializePaper(p);
  }
  regenerateQuestion(paperId, questionId) {
    const p = this.state.papers.find((x) => x.id === paperId);
    if (!p) throw new Error("PAPER_NOT_FOUND");
    const idx = p.questions.findIndex((q) => q.id === questionId);
    if (idx < 0) throw new Error("QUESTION_NOT_FOUND");
    const old = p.questions[idx];
    const ctx = this.quizContext(p.chapter, p.from, p.to, p.lang);
    const seed = newSeed("rq");
    const { questions } = generateQuestions(ctx, seed, { count: 1, mix: { 1: old.difficulty === 1 ? 1 : 0, 2: old.difficulty === 2 ? 1 : 0, 3: old.difficulty === 3 ? 1 : 0 }, types: [old.type], focus: old.conceptId ? { conceptId: old.conceptId } : void 0 }, this.approvedIds());
    if (!questions.length) throw new Error("NO_QUESTIONS");
    const fresh = { ...questions[0], id: `${questionId}-r${this.now().toString(36).slice(-4)}` };
    p.questions.splice(idx, 1, fresh);
    this.state.records = this.state.records.filter((r) => r.questionId !== questionId);
    delete this.state.questionEdits[questionId];
    p.signature = paperSignature(p.questions);
    this.save();
    return this.materializePaper(p);
  }
  // ── 学生与分析 ──
  listStudents() {
    return this.students;
  }
  simulate(paperId, seed) {
    const paper = this.paper(paperId);
    const s = seed || `sim-${paperId}`;
    const realCount = this.state.records.filter((r) => r.paperId === paperId && r.origin === "edited").length;
    if (realCount > 0) {
      this.deps.logger?.info?.("quran-teaching: \u6A21\u62DF\u4F5C\u7B54\u4FDD\u7559\u771F\u4EBA\u8BB0\u5F55", { paperId, kept: realCount });
    }
    this.state.records = this.state.records.filter((r) => r.paperId !== paperId || r.origin === "edited");
    const existing = new Set((paper.variants || []).map((v) => v.studentId));
    const missing = this.students.map((st) => st.id).filter((id) => !existing.has(id));
    if (missing.length) paper.variants = [...paper.variants || [], ...buildVariants(paper, missing, s)];
    const out = this.students.flatMap((st) => simulateAnswers(st, { ...paper, questions: (0, import_quranPaperVariant.questionsForStudent)(paper, st.id) }, s, { origin: "preset" }));
    this.state.records.push(...out);
    this.save();
    return out;
  }
  /**
   * 取某生这份卷子的题目视图；**没有变体就当场固化一份再返回**。
   *
   * ⚠️ 这是「选项选错」那个 bug 的根治点（2026-09-22 用户反馈 + 审查确认）。
   * 原来变体只在 `simulate()` 里才建，而学生是通过 `/api/paper` 先拿题的：
   *   学生拿题时没有变体 → 看到的是**原卷顺序**，作答下标按原卷；
   *   教师随后点「5 名学生作答」或切内容语言 → simulate 建出变体；
   *   判分时 setAnswer 走 questionsForStudent → 拿到的是**变体顺序**，
   *   选项被重排、正确答案下标做过逆映射 → 学生的单选整片判错。
   * 发题那一刻就把变体钉死，学生看到的与判分用的从此是同一份，
   * 后续 simulate 也不再改动已有变体（见 simulate 里的保留逻辑）。
   */
  questionsForStudentPinned(paperId, studentId) {
    const paper = this.paper(paperId);
    const has = paper.variants?.some((v) => v.studentId === studentId);
    if (!has) {
      const fresh = buildVariants(paper, [studentId], `serve-${studentId}`);
      paper.variants = [...paper.variants || [], ...fresh];
      this.save();
      this.deps.logger?.info?.("quran-teaching: \u53D1\u9898\u65F6\u56FA\u5316\u5B66\u751F\u5377\u7248\u672C", { paperId, studentId });
    }
    return (0, import_quranPaperVariant.questionsForStudent)(paper, studentId);
  }
  records(paperId) {
    return this.state.records.filter((r) => r.paperId === paperId);
  }
  /**
   * `opts.defer`：**批量写入时必须传 true**，由调用方在循环结束后统一 `flush()`。
   * 原来每题都 `save()`，而 save 写的是**整份 state**（含全部试卷、视频、卡片、脚本）。
   * 一个班 30 人 × 每人 M 题 = N×M 次全量同步 `writeFileSync` 全在主进程跑，
   * 事件循环被卡死：教师端 UI 冻结、其它学生的请求排队，看起来就像「服务挂了」
   * （2026-09-22 审查确认）。
   */
  setAnswer(paperId, studentId, questionId, answer, opts = {}) {
    const paper = this.paper(paperId);
    if (!this.students.some((s) => s.id === studentId)) throw new Error("STUDENT_NOT_FOUND");
    const q = (0, import_quranPaperVariant.questionsForStudent)(paper, studentId).find((x) => x.id === questionId);
    if (!q) throw new Error("QUESTION_NOT_FOUND");
    let rec = this.state.records.find((r) => r.paperId === paperId && r.studentId === studentId && r.questionId === questionId);
    if (!rec) {
      rec = { id: `r-${paperId}-${studentId}-${questionId}-1`, studentId, paperId, questionId, chapter: paper.chapter, answer: null, correct: false, attempt: 1, answeredAt: this.now(), origin: "edited" };
      this.state.records.push(rec);
    }
    rec.answer = answer;
    rec.correct = isCorrect(q, answer);
    rec.origin = "edited";
    rec.answeredAt = this.now();
    if (!opts.defer) this.save();
    return rec;
  }
  /** 批量 setAnswer(defer) 之后由调用方显式落盘一次。 */
  flush() {
    this.save();
  }
  /**
   * AI 教学解释按「试卷 + 语言 + 当前答题结果」缓存：切内容语言时已有该语言的解释直接用，
   * 没有才调模型；改了任何一个答案，结果签名变了，旧解释自然失效。只放内存（主进程常驻，界面切语言重载也还在）。
   *
   * 教师点「重新生成」时传 force=true 绕开缓存（验收 14 要求关键 AI 输出可重新生成；
   * 签名没变就一直回旧文案，等于这个按钮是假的）。
   */
  commentaryCache = /* @__PURE__ */ new Map();
  commentaryKey(paperId, lang2) {
    const sig = this.records(paperId).map((r) => `${r.studentId}:${r.questionId}:${r.correct ? 1 : 0}`).sort().join(",");
    return `${paperId}|${lang2}|${sig}`;
  }
  /** 题目里存的概念名是出卷时的语言：按分析语言换成批准资料里该语言的概念名（中文原卷在英文界面做强化时不冒中文） */
  localizePaper(p, lang2) {
    if (p.lang === lang2) return p;
    return { ...p, questions: p.questions.map((q) => q.conceptId ? { ...q, conceptLabel: this.conceptTitle(q.conceptId, lang2) || q.conceptLabel } : q) };
  }
  analyze(paperId, lang2) {
    const paper = this.localizePaper(this.paper(paperId), lang2);
    const a = analyzePaper(paper, this.students, this.records(paperId), lang2, (id) => this.approvedCountFor(id));
    const cached = this.commentaryCache.get(this.commentaryKey(paperId, lang2));
    if (cached) a.commentary = cached;
    return a;
  }
  async analyzeWithCommentary(paperId, lang2, force = false) {
    if (force) this.commentaryCache.delete(this.commentaryKey(paperId, lang2));
    const a = this.analyze(paperId, lang2);
    if (a.commentary && !force) return a;
    if (this.deps.llm && this.deps.llmReady?.() && a.group.issues.length) {
      try {
        const langName = lang2 === "ar" ? "Arabic" : lang2 === "en" ? "English" : "Chinese";
        const prompt = [
          `You are a teaching assistant. Write 3-5 sentences in ${langName} for the teacher, explaining what these 5 students have NOT learned and what to teach next. Use only the statistics below; do not add religious interpretation; refer to verses only by chapter:verse.`,
          `GROUP ISSUES: ${JSON.stringify(a.group.issues.slice(0, 6).map((i) => ({ label: i.label, kind: i.kind, wrong: `${i.wrongCount}/${i.studentCount}`, verdict: i.verdict, classification: i.classification, refs: i.refs.slice(0, 4) })))}`,
          `STUDENTS: ${JSON.stringify(a.students.map((s) => ({ id: s.studentId, total: s.total.pct, dims: Object.fromEntries(DIMENSIONS.map((d) => [d, s.dimensions[d].pct])) })))}`
        ].join("\n");
        a.commentary = (await this.deps.llm(prompt, 45e3)).trim().slice(0, 1200);
        if (a.commentary) this.commentaryCache.set(this.commentaryKey(paperId, lang2), a.commentary);
      } catch (e) {
        this.deps.logger?.warn?.("quran-teaching: \u5206\u6790\u89E3\u91CA\u751F\u6210\u5931\u8D25", { err: String(e?.message || e) });
      }
    }
    return a;
  }
  // ── 强化与复测 ──
  reinforce(paperId, issueKey, lang2) {
    const base = this.paper(paperId);
    const analysis = this.analyze(paperId, lang2);
    const issue = analysis.group.issues.find((i) => i.key === issueKey);
    if (!issue) throw new Error("ISSUE_NOT_FOUND");
    const parse = this.parse(base.chapter, base.from, base.to);
    const verses = this.verses(base.chapter, base.from, base.to);
    const label = issue.label;
    const ids = (p) => p.questions.map(questionIdentity);
    const faces = (p) => p.questions.map(questionFace);
    const practice = this.generatePaper({ chapter: base.chapter, from: base.from, to: base.to, lang: lang2, kind: "reinforce", spec: { ...specForIssue(issue, 4), exclude: ids(base), excludeFaces: faces(base) }, targetKey: issueKey, title: paperTitle("reinforce", lang2, { target: label }) }).paper;
    const retestSpec = specForIssue(issue, 5);
    let retest = this.generatePaper({ chapter: base.chapter, from: base.from, to: base.to, lang: lang2, kind: "retest", spec: { ...retestSpec, exclude: [...ids(base), ...ids(practice)], excludeFaces: [...faces(base), ...faces(practice)] }, targetKey: issueKey, title: paperTitle("retest", lang2, { target: label }) }).paper;
    if (!covers(retest, issueKey)) {
      for (let i = 0; i < 3 && !covers(retest, issueKey); i += 1) {
        retest = this.generatePaper({ chapter: base.chapter, from: base.from, to: base.to, lang: lang2, kind: "retest", spec: { ...retestSpec, exclude: [...ids(base), ...ids(practice)], excludeFaces: [...faces(base), ...faces(practice)] }, targetKey: issueKey, title: paperTitle("retest", lang2, { target: label }) }).paper;
      }
      if (!covers(retest, issueKey)) this.deps.logger?.warn?.("quran-teaching: \u590D\u6D4B\u5377\u8986\u76D6\u4E0D\u5230\u76EE\u6807\u77E5\u8BC6\u70B9\uFF0C\u524D\u540E\u5BF9\u6BD4\u6309\u5171\u540C\u8003\u5230\u7684\u77E5\u8BC6\u70B9\u53E3\u5F84\u7ED9\u51FA", { issueKey });
    }
    const r = {
      id: `rf-${this.now().toString(36)}`,
      basePaperId: paperId,
      targetKey: issueKey,
      targetLabel: label,
      classification: issue.classification,
      explanation: reinforcementExplanation(issue, lang2, parse, this.materials),
      cards: reviewCards(issue, lang2, parse, verses, this.materials),
      practice,
      retest,
      before: { group: analysis.group, students: analysis.students, targetWrong: issue.wrongCount },
      aiGenerated: true,
      generator: "template",
      createdAt: this.now()
    };
    this.state.reinforcements.unshift(r);
    this.state.reinforcements = this.state.reinforcements.slice(0, 20);
    this.save();
    return r;
  }
  /**
   * 教师审核 AI 产物（验收 14：关键 AI 输出要有接受 / 编辑 / 重新生成）。
   *
   * 「重新生成」各自已有入口（脚本走 makeVideoScript、强化走 reinforce），这里补的是
   * 另外两件：**接受**（标为已确认）与**编辑**（改正文 / 改复习卡）。
   * 教师改过之后仍是 AI 生成物 —— aiGenerated 不动，§6 第三层的标记不能因为人改过就抹掉；
   * 改的是内容与审核态，来源属性照旧。
   */
  review(patch) {
    if (patch.target === "script") {
      const sc = this.state.scripts.find((x) => x.id === patch.id);
      if (!sc) throw new Error("SCRIPT_NOT_FOUND");
      if (typeof patch.text === "string" && patch.text.trim()) sc.objective = patch.text.trim().slice(0, 2e3);
      if (patch.accept !== void 0) sc.reviewStatus = patch.accept ? "confirmed" : "draft";
      this.save();
      return { script: sc };
    }
    if (patch.target === "card") {
      const before = this.state.cards.length;
      this.state.cards = this.state.cards.filter((c) => c.id !== patch.id);
      if (this.state.cards.length === before) throw new Error("CARD_NOT_FOUND");
      this.save();
      return {};
    }
    const rf = this.state.reinforcements.find((x) => x.id === patch.id);
    if (!rf) throw new Error("REINFORCEMENT_NOT_FOUND");
    if (typeof patch.text === "string" && patch.text.trim()) rf.explanation = patch.text.trim().slice(0, 4e3);
    for (const c of patch.cards || []) {
      const card = rf.cards[c.index];
      if (!card) continue;
      if (typeof c.title === "string" && c.title.trim()) card.title = c.title.trim().slice(0, 200);
      if (typeof c.body === "string" && c.body.trim()) card.body = c.body.trim().slice(0, 2e3);
    }
    if (patch.accept !== void 0) rf.reviewStatus = patch.accept ? "confirmed" : "draft";
    this.save();
    return { reinforcement: rf };
  }
  /**
   * 收下教师粘贴的文本 / 文件（§8「上传文本或文件入口」，说明书列为可简化）。
   *
   * 关键是**它进不了锁定层、也进不了批准层**：只作为「待审核资料」存着，AI 不会拿它解释或出题
   * （approvedIds 里没有它）。之前这个入口只是界面上的一个 textarea，粘完什么也不发、
   * 什么也不存，刷新即没 —— 那就成了纯摆设。现在真落库，界面能列出已收条目。
   */
  intake(text, note) {
    const body = String(text || "").trim();
    if (!body) return this.state.intake || [];
    if (!this.state.intake) this.state.intake = [];
    this.state.intake.unshift({
      id: `intake-${this.now().toString(36)}`,
      chars: body.length,
      preview: body.slice(0, 120),
      note: note || "",
      reviewStatus: "pending",
      createdAt: this.now()
    });
    this.state.intake = this.state.intake.slice(0, 20);
    this.save();
    return this.state.intake;
  }
  intakeItems() {
    return this.state.intake || [];
  }
  reinforcements() {
    return this.state.reinforcements;
  }
  /** 复测：学生完成强化后再答（模拟时给弱项学生加成，体现「强化后」变化）；也可由界面逐题改答案后再调 analyze */
  retest(reinforcementId, lang2) {
    const r = this.state.reinforcements.find((x) => x.id === reinforcementId);
    if (!r) throw new Error("REINFORCEMENT_NOT_FOUND");
    const seed = `retest-${r.id}`;
    this.state.records = this.state.records.filter((x) => x.paperId !== r.retest.id && x.paperId !== r.practice.id);
    for (const st of this.students) {
      const wasWeak = r.before.group.issues.find((i) => i.key === r.targetKey)?.wrongStudents.includes(st.id);
      this.state.records.push(...simulateAnswers(st, this.materializePaper(r.practice), `${seed}-practice`, { origin: "retest", boost: wasWeak ? 0.25 : 0.05 }));
      this.state.records.push(...simulateAnswers(st, this.materializePaper(r.retest), seed, { origin: "retest", boost: wasWeak ? 0.4 : 0.08, attempt: 2 }));
    }
    const after = analyzePaper(this.materializePaper(r.retest), this.students, this.records(r.retest.id), lang2, (id) => this.approvedCountFor(id));
    const issue = after.group.issues.find((i) => i.key === r.targetKey);
    r.after = { group: after.group, students: after.students, targetWrong: issue?.wrongCount || 0 };
    r.compare = this.retestCompare(r, lang2);
    this.save();
    return r;
  }
  /** 前后对比：原卷与复测卷共同考到的知识点，同一口径（见 compareRetest）。原卷已被清掉时不给对比 */
  retestCompare(r, lang2) {
    const base = this.state.papers.find((p) => p.id === r.basePaperId);
    if (!base) return void 0;
    return compareRetest(this.materializePaper(base), this.materializePaper(r.retest), this.students, [...this.records(base.id), ...this.records(r.retest.id)], lang2, (id) => this.approvedCountFor(id), r.targetKey);
  }
  /** 复测答案被手改后重算 after（验收 09 同样适用于复测） */
  recomputeAfter(reinforcementId, lang2) {
    const r = this.state.reinforcements.find((x) => x.id === reinforcementId);
    if (!r) throw new Error("REINFORCEMENT_NOT_FOUND");
    if (!r.after) return r;
    const after = analyzePaper(this.materializePaper(r.retest), this.students, this.records(r.retest.id), lang2, (id) => this.approvedCountFor(id));
    r.after = { group: after.group, students: after.students, targetWrong: after.group.issues.find((i) => i.key === r.targetKey)?.wrongCount || 0 };
    r.compare = this.retestCompare(r, lang2);
    this.save();
    return r;
  }
  // ── 多媒体 ──
  async makeCard(opts) {
    this.requireCorpus();
    if (!this.deps.renderImage) throw new Error("RENDER_UNAVAILABLE");
    const r = this.normalizeRange(opts.chapter, opts.from, opts.to);
    const parse = this.parse(opts.chapter, r.from, r.to);
    const verses = this.verses(opts.chapter, r.from, r.to);
    const jobId = opts.jobId || `card-${this.now().toString(36)}`;
    let background;
    let bg = "template";
    if (opts.useFal && this.deps.falBackground && this.deps.falReady?.()) {
      this.deps.progress?.(jobId, "fal", "fal", 0, 2);
      try {
        const b = await this.deps.falBackground(backgroundPrompt(opts.kind));
        if (b) {
          background = b;
          bg = "fal";
        }
      } catch (e) {
        this.deps.logger?.warn?.("quran-teaching: fal \u80CC\u666F\u5931\u8D25\uFF0C\u7528\u6A21\u677F\u80CC\u666F", { err: String(e?.message || e) });
      }
    }
    this.deps.progress?.(jobId, "render", "render", 1, 2);
    const input = { kind: opts.kind, lang: opts.lang, chapterName: this.chapterLabel(opts.chapter, opts.lang), parse, verses, corpusVersion: this.corpus.status.version, backgroundDataUrl: background, focusRefs: opts.focusRefs };
    const dir = (0, import_node_path2.join)(this.dir(), "media");
    (0, import_node_fs2.mkdirSync)(dir, { recursive: true });
    const path = (0, import_node_path2.join)(dir, `${jobId}-${opts.kind}.png`);
    await this.deps.renderImage(buildCardHtml(input, this.deps.fontFaceCss), path, CARD_W, CARD_H);
    const card = { id: jobId, kind: opts.kind, title: `${input.chapterName} ${rangeLabel(r.from, r.to)}`, path, url: this.deps.fileUrl ? this.deps.fileUrl(path) : path, verseRefs: verses.map((v) => v.ref), textLayer: cardTextLayer(input), background: bg, lang: opts.lang, createdAt: this.now() };
    this.state.cards.unshift(card);
    this.state.cards = this.state.cards.slice(0, 40);
    this.save();
    this.deps.progress?.(jobId, "done", "done", 2, 2);
    return card;
  }
  async makeVideoScript(opts) {
    this.requireCorpus();
    const r = this.normalizeRange(opts.chapter, opts.from, opts.to);
    const parse = this.parse(opts.chapter, r.from, r.to);
    let script = buildVideoScript(`vs-${this.now().toString(36)}`, opts.lang, this.chapterLabel(opts.chapter, opts.lang), parse, this.verses(opts.chapter, r.from, r.to));
    if (opts.polish !== false && this.deps.llm && this.deps.llmReady?.()) {
      try {
        script = applyScriptPolish(script, await this.deps.llm(scriptPolishPrompt(script, this.approvedText(opts.chapter, r.from, r.to, opts.lang)), 6e4));
      } catch (e) {
        this.deps.logger?.warn?.("quran-teaching: \u811A\u672C\u6DA6\u8272\u5931\u8D25\uFF0C\u7528\u6A21\u677F", { err: String(e?.message || e) });
      }
    }
    this.state.scripts.unshift(script);
    this.state.scripts = this.state.scripts.slice(0, 20);
    this.save();
    return script;
  }
  async makeVideoSample(scriptId, jobId) {
    const script = this.state.scripts.find((s) => s.id === scriptId);
    if (!script) throw new Error("SCRIPT_NOT_FOUND");
    if (!this.deps.renderImage) throw new Error("RENDER_UNAVAILABLE");
    if (!this.deps.ffmpeg) throw new Error("FFMPEG_UNAVAILABLE");
    const id = jobId || `vid-${this.now().toString(36)}`;
    const work = (0, import_node_path2.join)(this.dir(), "media", id);
    (0, import_node_fs2.mkdirSync)(work, { recursive: true });
    const chapterName2 = this.chapterLabel(script.chapter, script.lang);
    const segs = [];
    let voiceEngine = "none";
    for (const [i, sc] of script.scenes.entries()) {
      this.deps.progress?.(id, "frame", `${i + 1}/${script.scenes.length}`, i, script.scenes.length + 1);
      const png = (0, import_node_path2.join)(work, `scene-${i + 1}.png`);
      await this.deps.renderImage(buildSceneHtml(sc, script.lang, chapterName2, i, script.scenes.length, this.deps.fontFaceCss), png, 1280, 720);
      let wav = null;
      if (this.deps.tts) {
        try {
          const r = await this.deps.tts(sc.narration, script.lang, (0, import_node_path2.join)(work, `scene-${i + 1}`));
          if (r) {
            wav = r.path;
            voiceEngine = voiceEngine === "fal" || r.engine === "fal" ? "fal" : "local";
          }
        } catch (e) {
          this.deps.logger?.warn?.("quran-teaching: TTS \u5931\u8D25\uFF0C\u8BE5\u955C\u5934\u9759\u97F3", { err: String(e?.message || e) });
        }
      }
      const seg = (0, import_node_path2.join)(work, `seg-${i + 1}.mp4`);
      const dur = Math.max(3, sc.durationSec);
      const args = wav ? ["-y", "-loop", "1", "-i", png, "-i", wav, "-c:v", "libx264", "-tune", "stillimage", "-pix_fmt", "yuv420p", "-r", "25", "-c:a", "aac", "-b:a", "128k", "-shortest", "-t", String(dur + 4), "-vf", "scale=1280:720", seg] : ["-y", "-loop", "1", "-i", png, "-f", "lavfi", "-i", "anullsrc=r=44100:cl=stereo", "-c:v", "libx264", "-tune", "stillimage", "-pix_fmt", "yuv420p", "-r", "25", "-c:a", "aac", "-t", String(dur), "-vf", "scale=1280:720", seg];
      await runFfmpeg(this.deps.ffmpeg, args);
      segs.push(seg);
    }
    this.deps.progress?.(id, "concat", "concat", script.scenes.length, script.scenes.length + 1);
    const list = (0, import_node_path2.join)(work, "concat.txt");
    (0, import_node_fs2.writeFileSync)(list, segs.map((s) => `file '${s.replace(/'/g, "'\\''")}'`).join("\n"));
    const out = (0, import_node_path2.join)(this.dir(), "media", `${id}.mp4`);
    await runFfmpeg(this.deps.ffmpeg, ["-y", "-f", "concat", "-safe", "0", "-i", list, "-c", "copy", out]);
    const sample = { id, scriptId, path: out, url: this.deps.fileUrl ? this.deps.fileUrl(out) : out, durationSec: script.totalSec, source: "generated", createdAt: this.now(), voiceEngine };
    this.state.videos.unshift(sample);
    this.state.videos = this.state.videos.slice(0, 10);
    this.save();
    this.deps.progress?.(id, "done", "done", script.scenes.length + 1, script.scenes.length + 1);
    return sample;
  }
  /**
   * 语音合成：kind=verse 只朗读锁定语料原文（逐字拼接，不改写）；kind=teaching 朗读解释文本。
   * 引擎优先级由 deps.tts 决定（fal MiniMax speech-02-hd → 本地兜底），结果带 engine / fallback 标注。
   */
  async makeSpeech(req) {
    this.requireCorpus();
    if (!this.deps.tts) throw new Error("TTS_UNAVAILABLE");
    const r = this.normalizeRange(req.chapter, req.from, req.to);
    const verses = this.verses(req.chapter, r.from, r.to);
    let text;
    let refs = [];
    let lang2 = req.lang;
    if (req.kind === "verse") {
      const picked = verses.slice(0, 12);
      text = picked.map((v) => v.arabic).join("\n");
      refs = picked.map((v) => v.ref);
      lang2 = "ar";
    } else {
      text = String(req.text || "").trim().slice(0, 2e3);
      if (!text) throw new Error("TEXT_REQUIRED");
    }
    const id = `spk-${this.now().toString(36)}`;
    const dir = (0, import_node_path2.join)(this.dir(), "media");
    (0, import_node_fs2.mkdirSync)(dir, { recursive: true });
    const out = await this.deps.tts(text, lang2, (0, import_node_path2.join)(dir, id));
    if (!out) throw new Error("TTS_UNAVAILABLE");
    return { id, kind: req.kind, path: out.path, url: this.deps.fileUrl ? this.deps.fileUrl(out.path) : out.path, engine: out.engine, model: out.model, fallback: out.engine !== "fal", text, verseRefs: refs, createdAt: this.now() };
  }
  /**
   * 把随包的短视频样例登记进来（说明书 §13.2 / 验收 12：成片允许预置，但必须**有**）。
   *
   * 幂等：按路径去重，重启不会越登越多。样例由 scripts/build-quran-demo-video.mjs 走真链生成
   * （真语料 → 真脚本分镜 → Chromium 渲染真文字帧 → ffmpeg 合成），不是随手找的片子。
   * 没带样例、或文件被删了，就当没有——界面据此决定说不说「有预置样例」，不空口承诺。
   */
  adoptBundledVideos() {
    const dir = this.deps.bundledVideoDir;
    if (!dir || !(0, import_node_fs2.existsSync)(dir)) return;
    let changed = false;
    for (const name of (0, import_node_fs2.readdirSync)(dir)) {
      if (!name.toLowerCase().endsWith(".mp4")) continue;
      const path = (0, import_node_path2.join)(dir, name);
      if (this.state.videos.some((v) => v.path === path)) continue;
      let note = "";
      let durationSec = 0;
      try {
        const meta = JSON.parse((0, import_node_fs2.readFileSync)(path.replace(/\.mp4$/i, ".json"), "utf8"));
        note = String(meta?.note || "");
        durationSec = Number(meta?.durationSec) || 0;
      } catch {
      }
      this.state.videos.push({
        id: `vid-bundled-${name.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`,
        path,
        url: this.deps.fileUrl ? this.deps.fileUrl(path) : path,
        durationSec,
        source: "prebaked",
        createdAt: this.now(),
        note
      });
      changed = true;
    }
    if (changed) this.save();
  }
  registerPrebakedVideo(path, note) {
    const sample = { id: `vid-pre-${this.now().toString(36)}`, path, url: this.deps.fileUrl ? this.deps.fileUrl(path) : path, durationSec: 0, source: "prebaked", createdAt: this.now(), note };
    this.state.videos.unshift(sample);
    this.save();
    return sample;
  }
  // ── 学生端受限问答 ──
  /**
   * 只依据批准资料回答：先按语言分词（中文 Intl.Segmenter / 阿文按词去变音符 / 英文按词），
   * 命中批准资料（主题 / 单元 / 概念 / 词表）或经文才作答；命不中或 LLM 判定不足 → 明确提示需要更多批准资料。
   */
  async studentAsk(question, chapter, from, to, lang2) {
    this.requireCorpus();
    const r = this.normalizeRange(chapter, from, to);
    const terms = queryTerms(question, lang2);
    if (!terms.length) return { answer: "", sources: [], insufficient: true };
    const mats = this.materialsFor(chapter, r.from, r.to).filter((m) => m.kind !== "glossary");
    const hits = mats.filter((m) => terms.some((t2) => textHasTerm(`${m.title[lang2]} ${m.body?.[lang2] || ""} ${m.title.ar} ${m.body?.ar || ""}`, t2))).slice(0, 4);
    const glossHits = this.materialsFor(chapter).filter((m) => m.kind === "glossary" && terms.some((t2) => textHasTerm(`${m.word || ""} ${m.title[lang2]}`, t2))).slice(0, 4);
    const verseHits = terms.some((t2) => /[\u0600-\u06FF]/.test(t2)) ? searchVerses(this.verses(chapter, r.from, r.to), terms.filter((t2) => /[\u0600-\u06FF]/.test(t2)).join(" "), 3) : [];
    const sources = [
      ...hits.map((m) => ({ id: m.id, title: m.title[lang2] })),
      ...glossHits.map((m) => ({ id: m.id, title: `${m.word} \u2014 ${m.title[lang2]}` })),
      ...verseHits.map((h) => ({ id: `L1:${h.verse.ref}`, title: h.verse.ref }))
    ];
    if (!hits.length && !glossHits.length) return { answer: "", sources: [], insufficient: true };
    const snippets = [
      ...hits.map((m) => `[${m.id}] ${m.title[lang2]}${m.body ? `: ${m.body[lang2]}` : ""}`),
      ...glossHits.map((m) => `[${m.id}] ${m.word}: ${m.title[lang2]}`),
      ...verseHits.map((h) => `[L1 ${h.verse.ref}] ${h.verse.arabic}`)
    ].join("\n");
    const plain = [
      ...hits.map((m) => `\u2022 ${m.title[lang2]}${m.body ? ` \u2014 ${m.body[lang2]}` : ""}`),
      ...glossHits.map((m) => `\u2022 ${m.word} \u2014 ${m.title[lang2]}`),
      ...verseHits.map((h) => `\u2022 ${h.verse.ref} ${h.verse.arabic}`)
    ].join("\n");
    if (this.deps.llm && this.deps.llmReady?.()) {
      try {
        const langName = lang2 === "ar" ? "Arabic" : lang2 === "en" ? "English" : "Chinese";
        const raw = await this.deps.llm(`Answer the student's question in ${langName} using ONLY the approved materials below. They were retrieved for this question: if they are related, answer with what they say (a basic word meaning or the concept they name is enough), even if only partially. Reply exactly INSUFFICIENT only when none of them is related. Do not add interpretation beyond them; never paraphrase Quranic text, refer to verses as chapter:verse. Keep it under 120 words.
QUESTION: ${question}
APPROVED MATERIALS:
${snippets}`, 45e3);
        if (raw.trim() && !/^\s*INSUFFICIENT/i.test(raw)) return { answer: raw.trim().slice(0, 1500), sources, insufficient: false };
      } catch (e) {
        this.deps.logger?.warn?.("quran-teaching: \u53D7\u9650\u95EE\u7B54 LLM \u5931\u8D25\uFF0C\u76F4\u63A5\u8FD4\u56DE\u8D44\u6599\u7247\u6BB5", { err: String(e?.message || e) });
      }
    }
    return { answer: plain, sources, insufficient: false };
  }
  // ── 看板 ──
  /** 强化目标的标签按看板语言重算（存档里的 targetLabel 是生成时的语言）；原卷不在了就返回空，调用方回落存档值 */
  issueLabel(paperId, issueKey, lang2) {
    const concept = this.conceptTitle(issueKey, lang2);
    if (concept) return concept;
    try {
      return this.analyze(paperId, lang2).group.issues.find((i) => i.key === issueKey)?.label || "";
    } catch {
      return "";
    }
  }
  /** 概念类薄弱点的标签取批准资料里该语言的概念名（题目里存的 conceptLabel 是出卷时的语言） */
  conceptTitle(id, lang2) {
    return this.materials.find((m) => m.kind === "concept" && m.id === id)?.title[lang2] || "";
  }
  dashboard(lang2) {
    const papers = this.papers();
    const students = this.students.map((s) => {
      const analyses = papers.filter((p) => this.state.records.some((r) => r.paperId === p.id && r.studentId === s.id)).map((p) => analyzeStudent(s.id, p, this.state.records, lang2));
      const avg = analyses.length ? Math.round(analyses.reduce((a, x) => a + x.total.pct, 0) / analyses.length) : 0;
      const dimAvg = DIMENSIONS.map((d) => {
        const xs = analyses.map((a) => a.dimensions[d]).filter((x) => x.total);
        return { d, pct: xs.length ? xs.reduce((a, x) => a + x.pct, 0) / xs.length : -1 };
      }).filter((x) => x.pct >= 0);
      const strongest = dimAvg.length ? dimAvg.reduce((a, b) => b.pct > a.pct ? b : a).d : "";
      const weakest = dimAvg.length ? dimAvg.reduce((a, b) => b.pct < a.pct ? b : a).d : "";
      return { studentId: s.id, name: s.name, avg, strongest, weakest, papers: analyses.length };
    });
    const isSet = (p) => p.kind === "practice" || p.kind === "exam";
    const latest = papers.find((p) => isSet(p) && p.lang === lang2) || papers.find(isSet);
    const commonIssues = latest ? analyzeGroup(latest, this.students, this.state.records, lang2, (id) => this.approvedCountFor(id)).issues.filter((i) => i.verdict !== "individual").slice(0, 6).map((i) => i.kind === "concept" ? { ...i, label: this.conceptTitle(i.key, lang2) || i.label } : i) : [];
    const questions = papers.reduce((a, p) => a + p.questions.length, 0);
    return {
      corpus: { chapters: this.corpus.status.chapters.length, verses: this.corpus.status.totalVerses, verified: this.corpus.status.allVerified },
      plans: this.state.plans.length,
      papers: papers.length,
      questions,
      verifiedQuestions: papers.reduce((a, p) => a + p.questions.filter((q) => q.verified).length, 0),
      students,
      commonIssues,
      improvement: this.state.reinforcements.map((r) => ({ reinforcementId: r.id, targetLabel: this.issueLabel(r.basePaperId, r.targetKey, lang2) || r.targetLabel, before: r.compare?.target.before ?? r.before.targetWrong, after: r.compare ? r.compare.target.after : r.after ? r.after.targetWrong : null })),
      media: { cards: this.state.cards.length, videos: this.state.videos.length }
    };
  }
  status() {
    return {
      corpus: this.corpus.status,
      llmReady: !!this.deps.llmReady?.(),
      ffmpegReady: !!this.deps.ffmpeg,
      falReady: !!this.deps.falReady?.(),
      students: this.students,
      plans: this.state.plans,
      papers: this.papers(),
      reinforcements: this.state.reinforcements,
      cards: this.state.cards,
      scripts: this.state.scripts,
      videos: this.state.videos,
      fonts: this.deps.fontUrls
    };
  }
  approvedVersion() {
    return approvedVersion();
  }
  reset() {
    const keep = { corpusDir: this.state.corpusDir, corpusSource: this.state.corpusSource };
    this.state = { ...emptyState(), ...keep };
    this.commentaryCache.clear();
    this.save();
  }
};
function clamp(n, lo, hi) {
  return Math.max(lo, Math.min(hi, Number(n) || lo));
}
function hasHanText(value) {
  if (typeof value === "string") return /[\u3400-\u9fff]/.test(value);
  if (Array.isArray(value)) return value.some(hasHanText);
  if (value && typeof value === "object") {
    const o = value;
    const tri3 = "zh" in o && "en" in o && "ar" in o;
    return Object.entries(o).some(([k, v]) => !["id", "path", "url", "signature", "sha256"].includes(k) && !(tri3 && k === "zh") && hasHanText(v));
  }
  return false;
}
var ZH_STOP = new Set((0, import_matchTokens.matchTokens)(["\u4EC0\u4E48", "\u8FD9\u4E00", "\u4E00\u7AE0", "\u8FD9\u7AE0", "\u8FD9\u8282", "\u8FD9\u4E2A", "\u90A3\u4E2A", "\u600E\u4E48", "\u4E3A\u4EC0\u4E48", "\u4E3A\u4F55", "\u54EA\u4E00", "\u54EA\u4E2A", "\u8BF7\u95EE", "\u610F\u601D", "\u662F\u4E0D\u662F", "\u6709\u6CA1\u6709", "\u53EF\u4EE5", "\u5E94\u8BE5", "\u5982\u4F55", "\u91CC\u9762", "\u5176\u4E2D", "\u672C\u7AE0", "\u7ECF\u6587", "\u8FD9\u91CC", "\u4E00\u8282", "\u8FD9\u4E9B", "\u90A3\u4E9B"]));
var EN_STOP = /* @__PURE__ */ new Set(["what", "which", "does", "this", "that", "these", "those", "the", "and", "for", "with", "about", "mean", "means", "meaning", "verse", "verses", "chapter", "surah", "sura", "how", "why", "are", "is", "in", "of", "to", "do", "it", "here", "there", "please", "tell", "explain", "can", "you", "say", "says", "said", "word", "words"]);
function englishStem(w) {
  for (const suf of ["ently", "antly", "ness", "ence", "ance", "ment", "ing", "ent", "ant", "ly", "ed", "es", "s"]) {
    if (w.endsWith(suf) && w.length - suf.length >= 4) return w.slice(0, -suf.length);
  }
  return w;
}
function queryTerms(question, lang2) {
  const q = String(question || "").trim();
  const out = /* @__PURE__ */ new Set();
  for (const w of q.split(/\s+/)) if (/[\u0600-\u06FF]/.test(w)) {
    const n = normalizeArabic(w);
    if (n.length >= 2) out.add(n);
  }
  const zh = q.replace(/[^\u4e00-\u9fff]+/g, " ").trim();
  if (zh) {
    let segs = [];
    try {
      const Seg = Intl.Segmenter;
      if (Seg) segs = Array.from(new Seg("zh", { granularity: "word" }).segment(zh)).filter((x) => x.isWordLike).map((x) => x.segment);
    } catch {
      segs = [];
    }
    if (!segs.length) for (const piece of zh.split(" ")) for (let i = 0; i + 2 <= piece.length; i += 1) segs.push(piece.slice(i, i + 2));
    for (const t2 of segs) if (t2.length >= 2 && !ZH_STOP.has(t2)) out.add(t2);
    if (!out.size && zh.length <= 3) out.add(zh);
  }
  if (lang2 === "en" || /[A-Za-z]{3,}/.test(q)) {
    for (const w of q.toLowerCase().split(/[^a-z]+/)) if (w.length >= 3 && !EN_STOP.has(w)) out.add(englishStem(w));
  }
  return Array.from(out);
}
function textHasTerm(text, term) {
  if (/[\u0600-\u06FF]/.test(term)) {
    const words = text.split(/\s+/).map(normalizeArabic).filter(Boolean);
    return words.some((w) => w === term || term.length >= 3 && w.includes(term));
  }
  return text.toLowerCase().includes(term.toLowerCase());
}
async function runFfmpeg(bin, args) {
  const { execFile } = await Promise.resolve().then(() => __toESM(require("node:child_process")));
  await new Promise((resolve, reject) => {
    execFile(bin, args, { timeout: 18e4, maxBuffer: 16 * 1024 * 1024 }, (err, _out, stderr) => {
      if (err) reject(new Error(`ffmpeg: ${String(stderr || err.message).slice(-400)}`));
      else resolve();
    });
  });
}

// ../../../totalclaw-solutions/solutions/workbench-quran-teaching/src/main/services/quranTeaching/lan.ts
var import_crypto = require("crypto");
var import_i18n2 = require("npm:@totalclaw/i18n");
var import_lanServer = require("host:apps/desktop-shell/src/main/services/lanServer.ts");

// ../../../totalclaw-solutions/solutions/workbench-quran-teaching/src/main/services/quranTeaching/studentPage.ts
var QURAN_STUDENT_PAGE_HTML = `<!DOCTYPE html>
<html lang="zh"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#0b1020">
<title>\u53E4\u5170\u7ECF\u6559\u5B66 \xB7 \u5B66\u751F\u7AEF</title>
<style>
:root{
  --bg:#f4f6fc;--bg2:#e9ecfa;--card:rgba(255,255,255,.78);--cardSolid:#fff;
  --ink:#151a27;--ink2:#4b5364;--ink3:#7b8497;--line:rgba(21,26,39,.10);
  --brand:#5b5bd6;--brand2:#22a6b3;--gold:#c8912f;--ok:#16a34a;--bad:#dc2626;
  --shadow:0 18px 48px -24px rgba(24,28,64,.45),0 2px 8px -2px rgba(24,28,64,.10);
  --ease:cubic-bezier(.22,1,.36,1);
}
@media(prefers-color-scheme:dark){:root{
  --bg:#0b1020;--bg2:#131a33;--card:rgba(28,33,54,.72);--cardSolid:#1b2136;
  --ink:#eef1f8;--ink2:#b6bdd0;--ink3:#8a93ac;--line:rgba(255,255,255,.10);
  --brand:#8b8bf0;--brand2:#3ed0dd;--gold:#e0b45f;
  --shadow:0 20px 56px -26px rgba(0,0,0,.8),0 2px 10px -3px rgba(0,0,0,.5);
}}
*{box-sizing:border-box}
/* \u6A2A\u5411\u6EA2\u51FA\u88C1\u5728 html \u4E0A\uFF0C\u4E0D\u8981\u5199\u5728 body \u4E0A\uFF1A\u7ED9 body \u8BBE overflow-x \u4F1A\u628A\u53E6\u4E00\u6839\u8F74\u7B97\u6210 auto\uFF0C
   body \u5C31\u53D8\u6210\u6EDA\u52A8\u5BB9\u5668\uFF0C\u5E95\u680F\u7684 position:sticky \u968F\u5373\u5931\u6548\uFF08\u5B9E\u6D4B\u957F\u9875\u9762\u4E0A\u6309\u94AE\u88AB\u5185\u5BB9\u9876\u4E0B\u53BB\u4E86\uFF09 */
html{overflow-x:hidden}
body{margin:0;background:var(--bg);color:var(--ink);
  font:16px/1.65 -apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,"Noto Sans SC","Noto Sans Arabic",sans-serif;
  padding:env(safe-area-inset-top) 0 calc(env(safe-area-inset-bottom) + 8px)}
/* \u6781\u5149\u80CC\u666F\uFF1A\u4E24\u56E2\u7F13\u6162\u6F02\u79FB\u7684\u5149\u6591\uFF0C\u6210\u672C\u53EA\u6709\u4E24\u4E2A blur \u7684\u5408\u6210\u5C42 */
.aur{position:fixed;inset:-25vmax;z-index:-1;pointer-events:none;filter:blur(70px);opacity:.55}
.aur i{position:absolute;display:block;border-radius:50%}
.aur i:nth-child(1){width:52vmax;height:52vmax;left:2%;top:0;background:radial-gradient(circle,var(--brand),transparent 66%);animation:drift1 26s var(--ease) infinite alternate}
.aur i:nth-child(2){width:44vmax;height:44vmax;right:0;top:28%;background:radial-gradient(circle,var(--brand2),transparent 66%);animation:drift2 32s var(--ease) infinite alternate}
.aur i:nth-child(3){width:40vmax;height:40vmax;left:22%;bottom:0;background:radial-gradient(circle,var(--gold),transparent 68%);opacity:.6;animation:drift1 38s var(--ease) infinite alternate-reverse}
@keyframes drift1{from{transform:translate3d(0,0,0) scale(1)}to{transform:translate3d(9vmax,7vmax,0) scale(1.14)}}
@keyframes drift2{from{transform:translate3d(0,0,0) scale(1.05)}to{transform:translate3d(-11vmax,-6vmax,0) scale(.92)}}

.wrap{max-width:760px;margin:0 auto;padding:14px 16px 20px;min-height:100vh;display:flex;flex-direction:column}
.card{background:var(--card);border:1px solid var(--line);border-radius:20px;padding:18px;margin-bottom:12px;
  backdrop-filter:blur(18px) saturate(1.5);-webkit-backdrop-filter:blur(18px) saturate(1.5);box-shadow:var(--shadow)}
h1{font-size:23px;line-height:1.35;margin:0 0 6px;letter-spacing:-.01em}
h2{font-size:17px;margin:0 0 10px;letter-spacing:-.005em}
.sub{color:var(--ink3);font-size:13.5px;margin:0 0 14px}
.kicker{font-size:11.5px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;margin-bottom:8px;
  background:linear-gradient(90deg,var(--brand),var(--brand2));-webkit-background-clip:text;background-clip:text;color:transparent}
label{display:block;font-size:13px;color:var(--ink3);margin:14px 0 6px;font-weight:600}
input,select{width:100%;padding:13px 14px;border:1px solid var(--line);border-radius:14px;background:var(--cardSolid);
  color:var(--ink);font-size:16px;transition:border-color .2s,box-shadow .2s;appearance:none}
input:focus,select:focus{outline:0;border-color:var(--brand);box-shadow:0 0 0 4px color-mix(in srgb,var(--brand) 18%,transparent)}
#code{letter-spacing:.32em;font-weight:700;text-align:center;font-size:20px}
.btn{width:100%;padding:14px;border:0;border-radius:14px;color:#fff;font-size:16px;font-weight:700;cursor:pointer;
  background:linear-gradient(120deg,var(--brand),var(--brand2));box-shadow:0 10px 24px -12px var(--brand);
  transition:transform .16s var(--ease),box-shadow .2s,opacity .2s;position:relative;overflow:hidden}
.btn:active{transform:scale(.975)}
.btn:disabled{opacity:.45;cursor:default;transform:none}
.btn.ghost{background:transparent;color:var(--brand);border:1px solid var(--line);box-shadow:none;font-weight:600}
/* \u4E3B\u6309\u94AE\u4E0A\u4E00\u9053\u7F13\u6162\u626B\u8FC7\u7684\u9AD8\u5149\uFF0C\u9759\u6B62\u9875\u9762\u4E5F\u6709\u751F\u6C14 */
.btn.pri::after{content:"";position:absolute;inset:0;background:linear-gradient(105deg,transparent 38%,rgba(255,255,255,.34) 50%,transparent 62%);
  transform:translateX(-120%);animation:sheen 3.6s ease-in-out infinite}
@keyframes sheen{0%,62%{transform:translateX(-120%)}88%,100%{transform:translateX(120%)}}
.err{color:var(--bad);font-size:13px;margin-top:10px;min-height:18px;transition:opacity .2s}
.err:not(:empty){animation:shake .42s var(--ease)}
@keyframes shake{0%,100%{transform:translateX(0)}22%{transform:translateX(-7px)}44%{transform:translateX(6px)}68%{transform:translateX(-3px)}}

/* \u2500\u2500 \u9876\u90E8\uFF1A\u8303\u56F4\u80F6\u56CA + \u8FDB\u5EA6\u6761 \u2500\u2500 */
.top{display:flex;align-items:center;gap:10px;margin-bottom:9px;font-size:12.5px;color:var(--ink3)}
.top .grow{flex:1}
.pill{display:inline-flex;align-items:center;gap:6px;padding:4px 11px;border-radius:999px;font-weight:700;font-size:12px;
  background:color-mix(in srgb,var(--brand) 13%,transparent);color:var(--brand);border:1px solid color-mix(in srgb,var(--brand) 22%,transparent)}
.bar{height:5px;border-radius:999px;background:color-mix(in srgb,var(--ink) 9%,transparent);overflow:hidden;margin-bottom:14px}
.bar i{display:block;height:100%;border-radius:999px;background:linear-gradient(90deg,var(--brand),var(--brand2));
  transition:width .55s var(--ease);box-shadow:0 0 12px -2px var(--brand)}

/* \u2500\u2500 \u7FFB\u9875\u52A8\u753B\uFF1A\u65B9\u5411\u611F\u77E5 \u2500\u2500 */
.slide{animation:inFwd .44s var(--ease) both}
.back .slide{animation-name:inBack}
@keyframes inFwd{from{opacity:0;transform:translate3d(34px,10px,0) scale(.985)}to{opacity:1;transform:none}}
@keyframes inBack{from{opacity:0;transform:translate3d(-34px,10px,0) scale(.985)}to{opacity:1;transform:none}}
/* \u9010\u6761\u9519\u843D\u5165\u573A\uFF1A\u7ED9\u5B50\u9879\u8BBE --i\uFF0C\u5EF6\u8FDF\u8DDF\u7740\u5E8F\u53F7\u8D70 */
.stg{opacity:0;animation:rise .5s var(--ease) both;animation-delay:calc(var(--i,0) * 65ms + 90ms)}
@keyframes rise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}

/* \u2500\u2500 \u7ECF\u6587 \u2500\u2500 */
.verse{font-size:13px;color:var(--ink3);margin-top:6px}
.ayah{border:1px solid var(--line);border-radius:16px;padding:14px 16px;margin-bottom:10px;
  background:linear-gradient(135deg,color-mix(in srgb,var(--gold) 9%,transparent),transparent 62%);position:relative;overflow:hidden}
.ayah::before{content:"";position:absolute;inset-inline-start:0;top:12%;bottom:12%;width:3px;border-radius:999px;
  background:linear-gradient(180deg,var(--gold),transparent)}
.ayah .ref{font-size:11.5px;font-weight:800;letter-spacing:.08em;color:var(--gold);margin-bottom:8px}
.ar{font-size:23px;line-height:2.25;direction:rtl;text-align:right;font-family:"Noto Naskh Arabic","Amiri","Geeza Pro","Segoe UI",serif}

/* \u2500\u2500 \u76EE\u6807 / \u8BFE\u65F6 \u2500\u2500 */
.li{display:flex;gap:11px;align-items:flex-start;padding:11px 13px;border:1px solid var(--line);border-radius:14px;margin-bottom:8px;background:var(--cardSolid)}
.li .no{flex:0 0 auto;width:22px;height:22px;border-radius:50%;font-size:11.5px;font-weight:800;display:grid;place-items:center;
  background:color-mix(in srgb,var(--brand) 15%,transparent);color:var(--brand);margin-top:2px}
.sess{border:1px solid var(--line);border-radius:14px;padding:12px 14px;margin-bottom:8px;background:var(--cardSolid)}
.sess b{display:block;margin-bottom:4px}

/* \u2500\u2500 \u8BCD\u6C47 \u2500\u2500 */
.vocab{display:grid;grid-template-columns:1fr 1fr;gap:9px}
.vocab .w{border:1px solid var(--line);border-radius:14px;padding:11px 13px;background:var(--cardSolid);transition:transform .2s var(--ease)}
.vocab .w:active{transform:scale(.97)}
.vocab .w b{display:block;font-size:21px;direction:rtl;text-align:right;font-family:"Noto Naskh Arabic","Amiri","Geeza Pro",serif;color:var(--gold)}
@media(max-width:430px){.vocab{grid-template-columns:1fr}}

/* \u2500\u2500 \u9898\u76EE \u2500\u2500 */
/* \u9898\u5E72\u91CC\u5E38\u6709\u300C\u4E2D\u6587\u95EE\u6CD5 + \u6362\u884C + \u963F\u62C9\u4F2F\u539F\u6587\u300D\u4E24\u884C\uFF1A\u6362\u884C\u8981\u4FDD\u4F4F\uFF0C
   \u6BCF\u884C\u7684\u4E66\u5199\u65B9\u5411\u6309\u8BE5\u884C\u9996\u4E2A\u5F3A\u65B9\u5411\u5B57\u7B26\u81EA\u5DF1\u5B9A\uFF08plaintext\uFF09\uFF0C\u5426\u5219\u963F\u8BED\u4F1A\u88AB\u4E2D\u6587\u90A3\u884C\u62FD\u6210 LTR */
.stem{font-size:18px;font-weight:700;line-height:1.7;margin:0 0 14px;white-space:pre-wrap;unicode-bidi:plaintext}
.opt{display:flex;gap:11px;align-items:center;width:100%;text-align:start;padding:13px 15px;margin:0 0 9px;
  border:1.5px solid var(--line);border-radius:14px;background:var(--cardSolid);color:var(--ink);font-size:15.5px;font-weight:500;
  cursor:pointer;transition:transform .16s var(--ease),border-color .2s,background .2s,box-shadow .2s}
.opt:active{transform:scale(.985)}
.opt .ar{font-size:20px;line-height:1.9;flex:1}
.opt .k{flex:0 0 auto;width:26px;height:26px;border-radius:9px;display:grid;place-items:center;font-size:12.5px;font-weight:800;
  background:color-mix(in srgb,var(--ink) 7%,transparent);color:var(--ink3);transition:all .2s var(--ease)}
.opt.on{border-color:var(--brand);background:color-mix(in srgb,var(--brand) 9%,transparent);box-shadow:0 10px 24px -16px var(--brand)}
.opt.on .k{background:linear-gradient(120deg,var(--brand),var(--brand2));color:#fff;transform:scale(1.08);animation:pop .3s var(--ease)}
@keyframes pop{0%{transform:scale(.7)}60%{transform:scale(1.2)}100%{transform:scale(1.08)}}

/* \u2500\u2500 \u6392\u5E8F\u9898 \u2500\u2500 */
.seq{display:flex;align-items:center;gap:9px}
.seq .ord{flex:0 0 auto;width:26px;height:26px;border-radius:9px;display:grid;place-items:center;font-size:12.5px;font-weight:800;
  background:color-mix(in srgb,var(--ink) 7%,transparent);color:var(--ink3);transition:all .2s var(--ease)}
.opt.on .ord{background:linear-gradient(120deg,var(--brand),var(--brand2));color:#fff;animation:pop .3s var(--ease)}

/* \u2500\u2500 \u914D\u5BF9\u9898 \u2500\u2500 */
.pair{border:1px solid var(--line);border-radius:14px;padding:11px 13px;margin-bottom:9px;background:var(--cardSolid);transition:border-color .25s,box-shadow .25s}
/* \u51B2\u7A81\u884C\uFF1A\u8FD9\u4E2A\u91CA\u4E49\u5DF2\u7ECF\u914D\u7ED9\u5B83\u4E86 \u2014\u2014 \u95EA\u4E00\u4E0B\u5E2E\u5B66\u751F\u627E\u5230\u8BE5\u53BB\u54EA\u513F\u53D6\u6D88 */
.pair.released{border-color:var(--gold);box-shadow:0 0 0 3px color-mix(in srgb,var(--gold) 22%,transparent);animation:flash .9s var(--ease)}
@keyframes flash{0%,100%{box-shadow:0 0 0 3px color-mix(in srgb,var(--gold) 22%,transparent)}50%{box-shadow:0 0 0 7px color-mix(in srgb,var(--gold) 34%,transparent)}}
.pair .lw{font-size:21px;line-height:2;direction:rtl;text-align:right;font-family:"Noto Naskh Arabic","Amiri","Geeza Pro",serif;color:var(--gold);margin-bottom:9px}
/* \u6574\u8282\u7ECF\u6587\u505A\u5DE6\u5217\u65F6\uFF08\u8DE8\u8282\u7406\u89E3\u90A3\u79CD\uFF09\u5B57\u53F7\u6536\u4E00\u6863\uFF0C\u4E0D\u7136\u4E00\u5C4F\u8FDE\u4E24\u7EC4\u90FD\u653E\u4E0D\u4E0B */
.pair .lw.long{font-size:17px;line-height:1.95}
.chips{display:flex;flex-wrap:wrap;gap:7px}
.chip{padding:7px 12px;border-radius:999px;border:1.5px solid var(--line);background:transparent;color:var(--ink2);
  font-size:13.5px;font-weight:600;cursor:pointer;transition:all .18s var(--ease)}
.chip:active{transform:scale(.94)}
.chip.ar{font-size:17px;line-height:1.9;font-family:"Noto Naskh Arabic","Amiri","Geeza Pro",serif}
.chip.on{border-color:var(--brand);background:linear-gradient(120deg,var(--brand),var(--brand2));color:#fff;animation:pop .3s var(--ease)}

/* \u2500\u2500 \u6210\u7EE9 \u2500\u2500 */
.ring{display:block;margin:6px auto 4px;transform:rotate(-90deg)}
.ring circle{fill:none;stroke-width:11;stroke-linecap:round}
.ring .bgc{stroke:color-mix(in srgb,var(--ink) 10%,transparent)}
.ring .fg{stroke:url(#g1);transition:stroke-dashoffset 1.1s var(--ease)}
.scoreWrap{position:relative;text-align:center}
.scoreNum{position:absolute;inset:0;display:grid;place-content:center;font-size:40px;font-weight:800;letter-spacing:-.02em}
.scoreNum small{display:block;font-size:12px;font-weight:600;color:var(--ink3);letter-spacing:.06em}
.scoreNum .pctRow{display:flex;align-items:baseline;justify-content:center;gap:1px;direction:ltr}
.scoreNum .pctSign{font-size:17px;font-weight:700;font-style:normal;color:var(--ink3)}
.tag{display:inline-flex;gap:5px;align-items:center;padding:4px 12px;border-radius:999px;font-size:12.5px;font-weight:700;
  background:color-mix(in srgb,var(--brand) 13%,transparent);color:var(--brand)}
.tag.ok{background:color-mix(in srgb,var(--ok) 15%,transparent);color:var(--ok)}
.wrongItem{border-inline-start:3px solid var(--bad);padding:2px 0 2px 12px;margin-bottom:12px}
[dir=rtl] .wrongItem{padding:2px 12px 2px 0}

/* \u2500\u2500 \u5E95\u90E8\u5BFC\u822A \u2500\u2500 */
.nav{display:flex;gap:10px;align-items:center;margin-top:auto;position:sticky;bottom:0;z-index:20;
  padding:14px 0 calc(env(safe-area-inset-bottom) + 6px);
  /* \u5E95\u680F\u662F sticky \u7684\uFF0C\u957F\u9875\u9762\uFF08\u9519\u9898\u89E3\u6790\uFF09\u4F1A\u4ECE\u6309\u94AE\u5E95\u4E0B\u900F\u51FA\u6765 \u2014\u2014 \u57AB\u4E00\u5C42\u7531\u900F\u660E\u6E10\u5230\u5E95\u8272\u7684\u80CC\u666F */
  background:linear-gradient(180deg,transparent,var(--bg) 42%)}
.nav .btn{flex:1 1 0;margin:0}

/* \u2500\u2500 \u95EE\u4E00\u95EE \u2500\u2500 */
.qa{position:fixed;inset-inline-end:16px;bottom:calc(env(safe-area-inset-bottom) + 84px);z-index:60;
  display:flex;flex-direction:column;align-items:flex-end;gap:10px}
.fab{width:56px;height:56px;border-radius:50%;border:0;cursor:pointer;font-size:24px;color:#fff;
  background:linear-gradient(135deg,var(--brand),var(--brand2));box-shadow:0 14px 30px -12px var(--brand);
  transition:transform .2s var(--ease)}
.fab:active{transform:scale(.9)}
.fab::after{content:"";position:absolute;inset:0;border-radius:50%;box-shadow:0 0 0 0 color-mix(in srgb,var(--brand) 50%,transparent);
  animation:ping 2.6s ease-out infinite;pointer-events:none}
@keyframes ping{0%{box-shadow:0 0 0 0 color-mix(in srgb,var(--brand) 45%,transparent)}70%,100%{box-shadow:0 0 0 18px transparent}}
.qaPanel{width:min(370px,86vw);background:var(--card);border:1px solid var(--line);border-radius:18px;padding:14px;
  backdrop-filter:blur(20px) saturate(1.5);-webkit-backdrop-filter:blur(20px) saturate(1.5);box-shadow:var(--shadow);
  animation:panelUp .34s var(--ease) both}
@keyframes panelUp{from{opacity:0;transform:translateY(16px) scale(.96)}to{opacity:1;transform:none}}
.qaHead{display:flex;align-items:center;justify-content:space-between;gap:8px}
.qaX{border:0;background:none;font-size:22px;line-height:1;color:var(--ink3);cursor:pointer;padding:0 2px}
.qaTip{font-size:11.5px;color:var(--ink3);margin:2px 0 9px}
.qaAns{min-height:22px;max-height:230px;overflow-y:auto;font-size:14px;line-height:1.7;white-space:pre-wrap;
  background:color-mix(in srgb,var(--ink) 4%,transparent);border-radius:12px;padding:10px 12px;margin-bottom:9px}
.qaSrc{font-size:11.5px;color:var(--ink3);margin-top:7px}
.qaIn{display:flex;gap:8px}
.qaIn input{flex:1;padding:11px 12px;font-size:15px}
.qaIn .btn{flex:0 0 auto;width:auto;padding:11px 16px;font-size:14px}
.dots i{display:inline-block;width:6px;height:6px;margin-inline-end:4px;border-radius:50%;background:var(--brand);animation:blink 1.1s infinite}
.dots i:nth-child(2){animation-delay:.16s}.dots i:nth-child(3){animation-delay:.32s}
@keyframes blink{0%,80%,100%{opacity:.25;transform:translateY(0)}40%{opacity:1;transform:translateY(-3px)}}

.loading{display:grid;place-items:center;min-height:42vh;gap:14px}
.spin{width:38px;height:38px;border-radius:50%;border:3px solid var(--line);border-top-color:var(--brand);animation:spin .85s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}

@media(prefers-reduced-motion:reduce){
  *,*::before,*::after{animation-duration:.001ms!important;animation-iteration-count:1!important;transition-duration:.001ms!important}
  .stg{opacity:1}
}
</style></head>
<body>
<div class="aur" aria-hidden="true"><i></i><i></i><i></i></div>
<div class="wrap" id="app"></div>
<script>
(function(){
var T={
 zh:{title:'\u53E4\u5170\u7ECF\u667A\u80FD\u6559\u5B66',hint:'\u8F93\u5165\u8001\u5E08\u7ED9\u7684\u73ED\u7EA7\u7801\uFF0C\u9009\u62E9\u4F60\u7684\u540D\u5B57\u5F00\u59CB\u3002',code:'\u73ED\u7EA7\u7801',who:'\u6211\u662F',enter:'\u8FDB\u5165\u8BFE\u5802',
     noPaper:'\u8001\u5E08\u8FD8\u6CA1\u6709\u4E0B\u53D1\u8BD5\u5377\u3002',noLearn:'\u8001\u5E08\u8FD8\u6CA1\u6709\u51C6\u5907\u8FD9\u4E00\u8BFE\u7684\u5185\u5BB9\uFF0C\u5148\u7B49\u4E00\u4E0B\u3002',
     submit:'\u63D0\u4EA4\u7B54\u5377',submitting:'\u63D0\u4EA4\u4E2D\u2026',done:'\u5DF2\u63D0\u4EA4',score:'\u5F97\u5206',right:'\u7B54\u5BF9',of:'\u5171',again:'\u91CD\u65B0\u4F5C\u7B54',back:'\u9000\u51FA',
     badCode:'\u73ED\u7EA7\u7801\u4E0D\u5BF9\uFF0C\u8BF7\u627E\u8001\u5E08\u786E\u8BA4\u3002',taken:'\u8FD9\u4E2A\u540D\u5B57\u5DF2\u7ECF\u6709\u4EBA\u5728\u7528\u4E86\uFF0C\u6362\u4E00\u4E2A\u3002',net:'\u7F51\u7EDC\u4E0D\u901A\uFF0C\u68C0\u67E5\u662F\u5426\u8FD8\u8FDE\u7740\u6559\u5BA4\u7684 Wi-Fi\u3002',
     pick:'\u8BF7\u9009\u62E9\u4F60\u7684\u540D\u5B57',fill:'\u8FD8\u6709\u9898\u6CA1\u7B54\uFF0C\u786E\u8BA4\u8981\u63D0\u4EA4\u5417\uFF1F',src:'\u4F9D\u636E\u7ECF\u6587',
     cover:'\u672C\u8BFE\u5185\u5BB9',startLearn:'\u5F00\u59CB\u5B66\u4E60',prev:'\u4E0A\u4E00\u9875',next:'\u4E0B\u4E00\u9875',startEx:'\u5F00\u59CB\u505A\u9898',ex:'\u7EC3\u4E60',
     goals:'\u6559\u5B66\u76EE\u6807',plan:'\u8BFE\u65F6\u5B89\u6392',min:'\u5206\u949F',unit:'\u5355\u5143',vocab:'\u672C\u8BFE\u8BCD\u6C47',verses:'\u7ECF\u6587',lesson:'\u8BFE\u7A0B',
     pickOne:'\u5148\u9009\u4E00\u4E2A\u7B54\u6848\u518D\u7EE7\u7EED',orderTip:'\u6309\u6B63\u786E\u987A\u5E8F\u4F9D\u6B21\u70B9\u9009',matchTip:'\u4E3A\u6BCF\u4E2A\u8BCD\u9009\u51FA\u91CA\u4E49',matchUnitTip:'\u4E3A\u6BCF\u8282\u7ECF\u6587\u9009\u51FA\u5B83\u6240\u5C5E\u7684\u5355\u5143',matchAnyTip:'\u628A\u5DE6\u53F3\u4E24\u5217\u4E00\u4E00\u5BF9\u4E0A',reset:'\u91CD\u6765',
     needOrder:'\u628A\u6240\u6709\u9879\u90FD\u6392\u5B8C\u518D\u7EE7\u7EED',needMatch:'\u8FD8\u6709\u8BCD\u6CA1\u914D\u4E0A',needMatchUnit:'\u8FD8\u6709\u7ECF\u6587\u6CA1\u914D\u4E0A\u5355\u5143',needMatchAny:'\u8FD8\u6709\u6CA1\u914D\u4E0A\u7684',review:'\u9519\u9898\u89E3\u6790',perfect:'\u5168\u5BF9\uFF0C\u5F88\u68D2\uFF01',keep:'\u518D\u56DE\u53BB\u770B\u770B\u7ECF\u6587\u5427',
     ask:'\u95EE\u4E00\u95EE',askPh:'\u5C31\u672C\u8BFE\u5185\u5BB9\u63D0\u95EE\u2026',send:'\u63D0\u95EE',asking:'\u601D\u8003\u4E2D\u2026',
     askTip:'\u53EA\u4F9D\u636E\u8001\u5E08\u6279\u51C6\u7684\u8D44\u6599\u4F5C\u7B54\u3002',askEmpty:'\u8BF7\u8F93\u5165\u95EE\u9898',askErr:'\u6682\u65F6\u7B54\u4E0D\u4E86\uFF0C\u7A0D\u540E\u518D\u8BD5',askTooMany:'\u63D0\u95EE\u592A\u9891\u7E41\uFF0C\u7B49\u4E00\u5206\u949F',
     matchTaken:'\u8FD9\u4E2A\u91CA\u4E49\u5DF2\u7ECF\u914D\u7ED9\u300C{w}\u300D\u4E86\u3002\u8981\u6539\u914D\u5230\u8FD9\u91CC\uFF0C\u8BF7\u5148\u5230\u90A3\u4E00\u884C\u70B9\u4E00\u4E0B\u53D6\u6D88\u3002',
     askNone:'\u8FD9\u4E2A\u95EE\u9898\u8D85\u51FA\u4E86\u8001\u5E08\u6279\u51C6\u7684\u8D44\u6599\u8303\u56F4\uFF0C\u8BFE\u540E\u95EE\u95EE\u8001\u5E08\u3002',askSrc:'\u4F9D\u636E\u8D44\u6599'},
 en:{title:'Quran Teaching',hint:'Enter the class code from your teacher and pick your name.',code:'Class code',who:'I am',enter:'Enter class',
     noPaper:'Your teacher has not released a paper yet.',noLearn:'Your teacher has not prepared this lesson yet.',
     submit:'Submit',submitting:'Submitting\u2026',done:'Submitted',score:'Score',right:'Correct',of:'of',again:'Answer again',back:'Sign out',
     badCode:'Wrong class code \u2014 check with your teacher.',taken:'That name is already taken, pick another.',net:'No connection \u2014 check you are still on the classroom Wi-Fi.',
     pick:'Pick your name',fill:'Some questions are unanswered. Submit anyway?',src:'Source verses',
     cover:'In this lesson',startLearn:'Start learning',prev:'Back',next:'Next',startEx:'Start exercises',ex:'Exercise',
     goals:'Objectives',plan:'Sessions',min:'min',unit:'Unit',vocab:'Vocabulary',verses:'Verses',lesson:'Lesson',
     pickOne:'Pick an answer to continue',orderTip:'Tap them in the right order',matchTip:'Choose a meaning for each word',matchUnitTip:'Choose the unit each verse belongs to',matchAnyTip:'Pair up the two columns',reset:'Start over',
     needOrder:'Put every item in order first',needMatch:'Some words are still unmatched',needMatchUnit:'Some verses have no unit yet',needMatchAny:'Some items are still unmatched',review:'Review',perfect:'All correct. Excellent!',keep:'Go back over the verses',
     ask:'Ask',askPh:'Ask about this lesson\u2026',send:'Ask',asking:'Thinking\u2026',
     askTip:'Answers come only from teacher-approved materials.',askEmpty:'Please type a question',askErr:'Cannot answer right now, try again',askTooMany:'Too many questions, wait a minute',
     matchTaken:'That meaning is already paired with \u201C{w}\u201D. To move it here, tap it there first to release it.',
     askNone:'That is outside the approved materials \u2014 ask your teacher after class.',askSrc:'Sources'},
 ar:{title:'\u062A\u0639\u0644\u064A\u0645 \u0627\u0644\u0642\u0631\u0622\u0646',hint:'\u0623\u062F\u062E\u0644 \u0631\u0645\u0632 \u0627\u0644\u0635\u0641 \u0645\u0646 \u0645\u0639\u0644\u0651\u0645\u0643 \u0648\u0627\u062E\u062A\u0631 \u0627\u0633\u0645\u0643.',code:'\u0631\u0645\u0632 \u0627\u0644\u0635\u0641',who:'\u0623\u0646\u0627',enter:'\u062F\u062E\u0648\u0644 \u0627\u0644\u0635\u0641',
     noPaper:'\u0644\u0645 \u064A\u064F\u0635\u062F\u0631 \u0645\u0639\u0644\u0651\u0645\u0643 \u0648\u0631\u0642\u0629 \u0628\u0639\u062F.',noLearn:'\u0644\u0645 \u064A\u062C\u0647\u0651\u0632 \u0645\u0639\u0644\u0651\u0645\u0643 \u0647\u0630\u0627 \u0627\u0644\u062F\u0631\u0633 \u0628\u0639\u062F.',
     submit:'\u0625\u0631\u0633\u0627\u0644',submitting:'\u062C\u0627\u0631\u064D \u0627\u0644\u0625\u0631\u0633\u0627\u0644\u2026',done:'\u062A\u0645 \u0627\u0644\u0625\u0631\u0633\u0627\u0644',score:'\u0627\u0644\u062F\u0631\u062C\u0629',right:'\u0635\u062D\u064A\u062D',of:'\u0645\u0646',again:'\u0625\u0639\u0627\u062F\u0629 \u0627\u0644\u0625\u062C\u0627\u0628\u0629',back:'\u062E\u0631\u0648\u062C',
     badCode:'\u0631\u0645\u0632 \u0627\u0644\u0635\u0641 \u063A\u064A\u0631 \u0635\u062D\u064A\u062D \u2014 \u0631\u0627\u062C\u0639 \u0645\u0639\u0644\u0651\u0645\u0643.',taken:'\u0647\u0630\u0627 \u0627\u0644\u0627\u0633\u0645 \u0645\u0633\u062A\u062E\u062F\u0645 \u0628\u0627\u0644\u0641\u0639\u0644\u060C \u0627\u062E\u062A\u0631 \u063A\u064A\u0631\u0647.',net:'\u0644\u0627 \u064A\u0648\u062C\u062F \u0627\u062A\u0635\u0627\u0644 \u2014 \u062A\u0623\u0643\u062F \u0645\u0646 \u0628\u0642\u0627\u0626\u0643 \u0639\u0644\u0649 \u0634\u0628\u0643\u0629 \u0627\u0644\u0635\u0641.',
     pick:'\u0627\u062E\u062A\u0631 \u0627\u0633\u0645\u0643',fill:'\u0628\u0639\u0636 \u0627\u0644\u0623\u0633\u0626\u0644\u0629 \u0628\u0644\u0627 \u0625\u062C\u0627\u0628\u0629. \u0647\u0644 \u062A\u0631\u064A\u062F \u0627\u0644\u0625\u0631\u0633\u0627\u0644\u061F',src:'\u0627\u0644\u0622\u064A\u0627\u062A \u0627\u0644\u0645\u0631\u062C\u0639\u064A\u0629',
     cover:'\u0641\u064A \u0647\u0630\u0627 \u0627\u0644\u062F\u0631\u0633',startLearn:'\u0627\u0628\u062F\u0623 \u0627\u0644\u062A\u0639\u0644\u0651\u0645',prev:'\u0627\u0644\u0633\u0627\u0628\u0642',next:'\u0627\u0644\u062A\u0627\u0644\u064A',startEx:'\u0627\u0628\u062F\u0623 \u0627\u0644\u062A\u0645\u0627\u0631\u064A\u0646',ex:'\u062A\u0645\u0631\u064A\u0646',
     goals:'\u0627\u0644\u0623\u0647\u062F\u0627\u0641',plan:'\u0627\u0644\u062D\u0635\u0635',min:'\u062F\u0642\u064A\u0642\u0629',unit:'\u0648\u062D\u062F\u0629',vocab:'\u0627\u0644\u0645\u0641\u0631\u062F\u0627\u062A',verses:'\u0627\u0644\u0622\u064A\u0627\u062A',lesson:'\u0627\u0644\u062F\u0631\u0633',
     pickOne:'\u0627\u062E\u062A\u0631 \u0625\u062C\u0627\u0628\u0629 \u0644\u0644\u0645\u062A\u0627\u0628\u0639\u0629',orderTip:'\u0627\u0636\u063A\u0637 \u0639\u0644\u064A\u0647\u0627 \u0628\u0627\u0644\u062A\u0631\u062A\u064A\u0628 \u0627\u0644\u0635\u062D\u064A\u062D',matchTip:'\u0627\u062E\u062A\u0631 \u0645\u0639\u0646\u0649 \u0644\u0643\u0644 \u0643\u0644\u0645\u0629',matchUnitTip:'\u0627\u062E\u062A\u0631 \u0627\u0644\u0648\u062D\u062F\u0629 \u0627\u0644\u062A\u064A \u062A\u0646\u062A\u0645\u064A \u0625\u0644\u064A\u0647\u0627 \u0643\u0644 \u0622\u064A\u0629',matchAnyTip:'\u0637\u0627\u0628\u0650\u0642 \u0628\u064A\u0646 \u0627\u0644\u0639\u0645\u0648\u062F\u064A\u0646',reset:'\u0625\u0639\u0627\u062F\u0629',
     needOrder:'\u0631\u062A\u0651\u0628 \u0643\u0644 \u0627\u0644\u0639\u0646\u0627\u0635\u0631 \u0623\u0648\u0644\u0627\u064B',needMatch:'\u0628\u0639\u0636 \u0627\u0644\u0643\u0644\u0645\u0627\u062A \u0628\u0644\u0627 \u0645\u0637\u0627\u0628\u0642\u0629',needMatchUnit:'\u0628\u0639\u0636 \u0627\u0644\u0622\u064A\u0627\u062A \u0628\u0644\u0627 \u0648\u062D\u062F\u0629',needMatchAny:'\u0628\u0639\u0636 \u0627\u0644\u0639\u0646\u0627\u0635\u0631 \u0628\u0644\u0627 \u0645\u0637\u0627\u0628\u0642\u0629',review:'\u0645\u0631\u0627\u062C\u0639\u0629',perfect:'\u0643\u0644 \u0627\u0644\u0625\u062C\u0627\u0628\u0627\u062A \u0635\u062D\u064A\u062D\u0629. \u0645\u0645\u062A\u0627\u0632!',keep:'\u0631\u0627\u062C\u0639 \u0627\u0644\u0622\u064A\u0627\u062A \u0645\u0631\u0629 \u0623\u062E\u0631\u0649',
     ask:'\u0627\u0633\u0623\u0644',askPh:'\u0627\u0633\u0623\u0644 \u0639\u0646 \u0647\u0630\u0627 \u0627\u0644\u062F\u0631\u0633\u2026',send:'\u0627\u0633\u0623\u0644',asking:'\u064A\u0641\u0643\u0651\u0631\u2026',
     askTip:'\u0627\u0644\u0625\u062C\u0627\u0628\u0627\u062A \u0645\u0646 \u0627\u0644\u0645\u0648\u0627\u062F \u0627\u0644\u0645\u0639\u062A\u0645\u062F\u0629 \u0641\u0642\u0637.',askEmpty:'\u0627\u0643\u062A\u0628 \u0633\u0624\u0627\u0644\u0627\u064B \u0645\u0646 \u0641\u0636\u0644\u0643',askErr:'\u062A\u0639\u0630\u0651\u0631 \u0627\u0644\u0631\u062F \u0627\u0644\u0622\u0646\u060C \u062D\u0627\u0648\u0644 \u0645\u062C\u062F\u062F\u0627\u064B',askTooMany:'\u0623\u0633\u0626\u0644\u0629 \u0643\u062B\u064A\u0631\u0629\u060C \u0627\u0646\u062A\u0638\u0631 \u062F\u0642\u064A\u0642\u0629',
     matchTaken:'\u0647\u0630\u0627 \u0627\u0644\u0645\u0639\u0646\u0649 \u0645\u0642\u062A\u0631\u0646 \u0628\u0627\u0644\u0641\u0639\u0644 \u0628\u0640 \xAB{w}\xBB. \u0644\u0646\u0642\u0644\u0647 \u0625\u0644\u0649 \u0647\u0646\u0627\u060C \u0623\u0644\u063A\u0650 \u0627\u062E\u062A\u064A\u0627\u0631\u0647 \u0647\u0646\u0627\u0643 \u0623\u0648\u0644\u064B\u0627.',
     askNone:'\u0647\u0630\u0627 \u062E\u0627\u0631\u062C \u0627\u0644\u0645\u0648\u0627\u062F \u0627\u0644\u0645\u0639\u062A\u0645\u062F\u0629 \u2014 \u0627\u0633\u0623\u0644 \u0645\u0639\u0644\u0651\u0645\u0643 \u0628\u0639\u062F \u0627\u0644\u062D\u0635\u0629.',askSrc:'\u0627\u0644\u0645\u0635\u0627\u062F\u0631'}};

var lang=(new URLSearchParams(location.search).get('lang')||'').slice(0,2);
if(!T[lang])lang=(navigator.language||'zh').slice(0,2);
if(!T[lang])lang='zh';
var t=T[lang];
function setDir(l){document.documentElement.lang=l;document.documentElement.dir=(l==='ar'?'rtl':'ltr');}
setDir(lang);

var app=document.getElementById('app');
var token=localStorage.getItem('qt_token')||'';
var deck=null;
var dirBack=false; // \u672C\u6B21\u6E32\u67D3\u662F\u4E0D\u662F\u300C\u5F80\u56DE\u7FFB\u300D\uFF0C\u51B3\u5B9A\u8FDB\u573A\u52A8\u753B\u65B9\u5411

var KEYS='ABCDEFGH';
/** \u9009\u9879\u91CC\u662F\u963F\u62C9\u4F2F\u539F\u6587\u8FD8\u662F\u8BD1\u6587\uFF0C\u51B3\u5B9A\u7528\u4E0D\u7528\u7ECF\u6587\u5B57\u4F53\u4E0E\u53F3\u5BF9\u9F50 \u2014\u2014 \u540C\u4E00\u5F20\u5377\u5B50\u4E24\u79CD\u90FD\u6709 */
function hasAr(x){return /[\u0600-\u06FF]/.test(String(x==null?'':x));}
function optText(o){return '<span class="'+(hasAr(o)?'ar':'')+'">'+esc(o)+'</span>';}
/** \u300C4 / 18\u300D\u8FD9\u7C7B\u5206\u6570\u5FC5\u987B\u9489\u6210 LTR\uFF1A\u963F\u8BED\u9875\u9762\u91CC\u53CC\u5411\u7B97\u6CD5\u4F1A\u628A\u5B83\u91CD\u6392\u6210\u300C18 / 4\u300D\uFF08\u5B9E\u6D4B\uFF09 */
function frac(a,b){return '<span dir="ltr">'+esc(a)+' / '+esc(b)+'</span>';}
/** \u4E2D\u6587\u7528\u5168\u89D2\u5192\u53F7\uFF0C\u82F1/\u963F\u7528\u534A\u89D2 \u2014\u2014 \u963F\u8BED\u9875\u9762\u91CC\u6DF7\u4E00\u4E2A\u300C\uFF1A\u300D\u5F88\u523A\u773C */
function colon(){return lang==='zh'?'\uFF1A':': ';}
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function api(path,opts){
  opts=opts||{};opts.headers=opts.headers||{};
  if(token)opts.headers['Authorization']='Bearer '+token;
  if(opts.body){opts.headers['Content-Type']='application/json';opts.body=JSON.stringify(opts.body);}
  return fetch(path,opts).then(function(r){
    if(r.status===401){token='';localStorage.removeItem('qt_token');renderLogin();throw new Error('UNAUTHORIZED');}
    return r.json().then(function(j){if(!r.ok&&!j.error)throw new Error('HTTP '+r.status);return j;});
  });
}
function busyPage(){app.className='wrap';app.innerHTML='<div class="loading"><div class="spin"></div></div>';}
function setErr(m){var e=document.getElementById('err');if(e)e.textContent=m||'';}

// \u2500\u2500 \u767B\u5F55 \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
function renderLogin(err){
  deck=null;app.className='wrap';paintQa();
  app.innerHTML='<div class="slide"><div class="card" style="margin-top:8vh">'
   +'<div class="kicker stg" style="--i:0">'+esc(t.lesson)+'</div>'
   +'<h1 class="stg" style="--i:1">'+esc(t.title)+'</h1>'
   +'<p class="sub stg" style="--i:2">'+esc(t.hint)+'</p>'
   +'<div class="stg" style="--i:3"><label>'+esc(t.code)+'</label>'
   +'<input id="code" autocomplete="off" inputmode="latin" maxlength="9" placeholder="XXX-XXX"></div>'
   +'<div class="stg" style="--i:4"><label>'+esc(t.who)+'</label>'
   +'<select id="who"><option value="">'+esc(t.pick)+'</option></select></div>'
   +'<div class="stg" style="--i:5;margin-top:18px"><button class="btn pri" id="go">'+esc(t.enter)+'</button></div>'
   +'<div class="err" id="err">'+esc(err||'')+'</div></div></div>';
  fetch('/api/roster?lang='+lang).then(function(r){return r.json();}).then(function(j){
    var sel=document.getElementById('who');
    if(!sel)return;
    (j.students||[]).forEach(function(s){
      var o=document.createElement('option');
      o.value=s.id;o.textContent=s.name;o.disabled=!!s.taken;
      sel.appendChild(o);
    });
  }).catch(function(){});
  document.getElementById('go').onclick=function(){
    var code=(document.getElementById('code').value||'').trim();
    var who=document.getElementById('who').value;
    if(!code||!who){setErr(t.pick);return;}
    var b=document.getElementById('go');b.disabled=true;
    api('/api/join',{method:'POST',body:{code:code,studentId:who}}).then(function(j){
      if(j.error){b.disabled=false;setErr(j.error==='BAD_CODE'?t.badCode:j.error==='TAKEN'?t.taken:j.error);return;}
      token=j.token;localStorage.setItem('qt_token',token);loadDeck();
    }).catch(function(e){b.disabled=false;if(String(e.message)!=='UNAUTHORIZED')setErr(t.net);});
  };
}

// \u2500\u2500 \u644A\u9875\uFF1A\u5185\u5BB9\u5728\u524D\u3001\u9898\u76EE\u5728\u540E \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
function loadDeck(){
  busyPage();
  Promise.all([api('/api/learn'),api('/api/paper')]).then(function(r){
    var learn=r[0]||{},paper=r[1]||{};
    if(learn.lang&&T[learn.lang]){lang=learn.lang;t=T[lang];setDir(lang);}
    var byRef={};(learn.verses||[]).forEach(function(v){byRef[v.ref]=v;});
    var slides=[{type:'cover'}];
    if(learn.lesson)slides.push({type:'lesson',l:learn.lesson});
    var units=learn.units||[];
    units.forEach(function(u,i){
      // \u8FD9\u4E00\u5355\u5143\u8986\u76D6\u7684\u7ECF\u6587\u8DDF\u7740\u8FD9\u4E00\u9875\u8D70\uFF1B\u65E7\u89E3\u6790\u6CA1\u6807 refs \u7684\u5C31\u4E0D\u5E26\u7ECF\u6587\uFF0C\u4E0D\u53BB\u778E\u731C
      var vs=(u.refs||[]).map(function(x){return byRef[x];}).filter(Boolean);
      slides.push({type:'unit',u:u,vs:vs,n:i+1,tot:units.length});
    });
    if(!units.length&&(learn.verses||[]).length){
      // \u6CA1\u6709\u5355\u5143\u65F6\u522B\u628A\u6574\u7AE0\u7ECF\u6587\u585E\u8FDB\u4E00\u9875\uFF1A\u6309 5 \u8282\u4E00\u9875\u5207\uFF0C\u624B\u673A\u4E0A\u624D\u7FFB\u5F97\u52A8
      for(var i=0;i<learn.verses.length;i+=5)slides.push({type:'verses',vs:learn.verses.slice(i,i+5)});
    }
    if((learn.vocab||[]).length)slides.push({type:'vocab',list:learn.vocab});
    var qs=(paper&&!paper.error&&paper.questions)||[];
    qs.forEach(function(q,qi){slides.push({type:'ex',q:q,qi:qi});});
    if(qs.length)slides.push({type:'result'});
    // \u4E09\u79CD\u9898\u578B\u7684\u4F5C\u7B54\u5F62\u6001\u4E0D\u4E00\u6837\uFF1A\u5355\u9009\u662F\u4E00\u4E2A\u4E0B\u6807\uFF0C\u6392\u5E8F\u662F\u4E0B\u6807\u5E8F\u5217\uFF0C\u914D\u5BF9\u662F\u300C\u5DE6\u5217\u6BCF\u9879 \u2192 \u9009\u9879\u4E0B\u6807\u300D
    var init=qs.map(function(q){
      if(q.type==='match')return (q.left||[]).map(function(){return -1;});
      if(q.type==='order')return [];
      return -1;
    });
    deck={slides:slides,idx:0,answers:init,result:null,
          learn:learn,paper:paper,submitting:false,qa:{open:false,busy:false,answer:'',sources:[]}};
    dirBack=false;render();
  }).catch(function(e){
    if(String(e.message)!=='UNAUTHORIZED')app.innerHTML='<div class="card"><p class="err">'+esc(t.net)+'</p></div>';
  });
}

function exTotal(){return deck.answers.length;}
function rangeLabel(){
  var d=deck.learn;
  return String(d.chapter||'')+(d.from?':'+d.from+'-'+d.to:'');
}

function render(){
  var d=deck,s=d.slides[d.idx],total=d.slides.length;
  var pct=Math.round((d.idx+1)/total*100);
  var head='<div class="top"><span class="pill">'+esc(rangeLabel())+'</span><span class="grow"></span>'
    +frac(d.idx+1,total)+'</div><div class="bar"><i style="width:'+pct+'%"></i></div>';
  var body='',foot='';

  if(s.type==='cover'){
    var units=d.slides.filter(function(x){return x.type==='unit';}).length;
    var vpages=d.slides.filter(function(x){return x.type==='verses';}).length;
    var has=(d.learn.verses||[]).length||(d.learn.units||[]).length;
    var who=(d.paper&&d.paper.studentName)||'';
    var note=(d.learn.lesson&&d.learn.lesson.title)||'';
    body='<div class="card">'
      +'<div class="kicker stg" style="--i:0">'+esc(t.cover)+'</div>'
      +'<h1 class="stg" style="--i:1">'+esc(d.learn.chapterName||t.title)+'</h1>'
      +'<p class="sub stg" style="--i:2">'+esc(rangeLabel())+(who?' \xB7 '+esc(who):'')+'</p>'
      +'<div class="stg" style="--i:3">'
        +(units?'<span class="tag">'+esc(units)+' '+esc(t.unit)+'</span> ':'')
        +(vpages?'<span class="tag">'+esc(vpages)+' '+esc(t.verses)+'</span> ':'')
        +(exTotal()?'<span class="tag">'+esc(exTotal())+' '+esc(t.ex)+'</span>':'')
      +'</div>'
      +(note?'<p class="sub stg" style="--i:4;margin-top:14px">'+esc(note)+'</p>':'')
      +(has?'':'<p class="sub stg" style="--i:5;margin-top:14px">'+esc(t.noLearn)+'</p>')
      +'</div>';
    foot='<button class="btn pri" id="next">'+esc(t.startLearn)+'</button>';
  } else if(s.type==='lesson'){
    var L=s.l,k=0;
    body='<div class="card"><div class="kicker">'+esc(t.lesson)+'</div>'
      +(L.overview?'<p class="sub stg" style="--i:0">'+esc(L.overview)+'</p>':'');
    if((L.objectives||[]).length){
      body+='<h2 class="stg" style="--i:1">'+esc(t.goals)+'</h2>';
      L.objectives.forEach(function(o){k+=1;body+='<div class="li stg" style="--i:'+(k+1)+'"><span class="no">'+k+'</span><span>'+esc(o)+'</span></div>';});
    }
    if((L.sessions||[]).length){
      body+='<h2 class="stg" style="--i:'+(k+2)+';margin-top:16px">'+esc(t.plan)+'</h2>';
      L.sessions.forEach(function(x,i){
        k+=1;
        body+='<div class="sess stg" style="--i:'+(k+2)+'"><b>'+(i+1)+'. '+esc(x.title)+'</b>'
          +'<div class="verse">'+esc(x.range)+(x.minutes?' \xB7 '+esc(x.minutes)+' '+esc(t.min):'')+'</div>';
        (x.objectives||[]).forEach(function(o){body+='<div class="verse">\xB7 '+esc(o)+'</div>';});
        body+='</div>';
      });
    }
    body+='</div>';
  } else if(s.type==='unit'){
    body='<div class="card"><div class="kicker">'+esc(t.unit)+' '+frac(s.n,s.tot)+'</div>'
      +'<h1 class="stg" style="--i:0">'+esc(s.u.title)+'</h1>'
      +'<p class="sub stg" style="--i:1">'+esc(s.u.theme)+'</p>'
      +ayahList(s.vs,2)+'</div>';
  } else if(s.type==='verses'){
    body='<div class="card"><div class="kicker">'+esc(t.verses)+'</div>'+ayahList(s.vs,0)+'</div>';
  } else if(s.type==='vocab'){
    body='<div class="card"><div class="kicker">'+esc(t.vocab)+'</div><div class="vocab">';
    s.list.forEach(function(w,i){
      body+='<div class="w stg" style="--i:'+i+'"><b lang="ar">'+esc(w.word)+'</b><span class="verse">'+esc(w.meaning)+'</span></div>';
    });
    body+='</div></div>';
  } else if(s.type==='ex'){
    body='<div class="card"><div class="kicker">'+esc(t.ex)+' '+frac(s.qi+1,exTotal())+'</div>'
      +'<p class="stem stg" style="--i:0">'+esc(s.q.stem)+'</p>'+exBody(s);
    if((s.q.sourceRefs||[]).length)body+='<div class="verse">'+esc(t.src)+colon()+esc(s.q.sourceRefs.join(' \xB7 '))+'</div>';
    body+='</div>';
  } else if(s.type==='result'){
    body=resultCard(d.result);
  }

  if(!foot){
    var prev=d.idx>0?'<button class="btn ghost" id="prev">'+esc(t.prev)+'</button>':'';
    if(s.type==='result'){
      foot=(d.result?'<button class="btn ghost" id="again">'+esc(t.again)+'</button>':'')
        +'<button class="btn ghost" id="out">'+esc(t.back)+'</button>';
    } else if(s.type==='ex'&&s.qi===exTotal()-1){
      foot=prev+'<button class="btn pri" id="sub"'+(d.submitting?' disabled':'')+'>'+esc(d.submitting?t.submitting:t.submit)+'</button>';
    } else {
      // \u5185\u5BB9\u6700\u540E\u4E00\u9875\u4E0A\u628A\u300C\u4E0B\u4E00\u9875\u300D\u6539\u53EB\u300C\u5F00\u59CB\u505A\u9898\u300D\u2014\u2014\u8BA9\u4EBA\u77E5\u9053\u4E0B\u9762\u6362\u7AE0\u4E86\u3002
      // \u53EA\u5728\u300C\u4ECE\u5185\u5BB9\u9875\u8DE8\u8FDB\u7B2C\u4E00\u9053\u9898\u300D\u65F6\u6539\u540D\uFF1A\u9898\u4E0E\u9898\u4E4B\u95F4\u8FD8\u662F\u300C\u4E0B\u4E00\u9875\u300D\u3002
      var nx=d.slides[d.idx+1];
      var into=nx&&nx.type==='ex'&&s.type!=='ex';
      foot=prev+'<button class="btn pri" id="next">'+esc(into?t.startEx:t.next)+'</button>';
    }
  }

  app.className='wrap'+(dirBack?' back':'');
  app.innerHTML=head+'<div class="slide">'+body+'</div><div class="err" id="err"></div><div class="nav">'+foot+'</div>';
  dirBack=false;
  bind(s);
  paintQa();
}

/** \u9898\u5E72\u91CC\u5DF2\u7ECF\u628A\u8BDD\u8BF4\u8FC7\u4E00\u904D\u65F6\u5C31\u4E0D\u518D\u91CD\u590D\u4E00\u53E5\u63D0\u793A\uFF08\u300C\u2026\uFF1A\u4E3A\u6BCF\u4E2A\u8BCD\u9009\u51FA\u91CA\u4E49\u3002\u300D\u90A3\u79CD\uFF09 */
function tipLine(q,tip){
  if(!tip)return '';
  return String(q.stem||'').indexOf(tip)>=0?'':'<p class="sub stg" style="--i:1">'+esc(tip)+'</p>';
}

/** \u8FD9\u9053\u9898\u4F5C\u7B54\u5B8C\u4E86\u6CA1\uFF08\u6392\u5E8F\u8981\u6392\u6EE1\u3001\u914D\u5BF9\u8981\u6BCF\u4E2A\u8BCD\u90FD\u914D\u4E0A\uFF09 */
function exDone(q,a){
  if(q.type==='match')return Array.isArray(a)&&a.length===(q.left||[]).length&&a.every(function(x){return x>=0;});
  if(q.type==='order')return Array.isArray(a)&&a.length===(q.options||[]).length;
  return typeof a==='number'&&a>=0;
}
/**
 * \u914D\u5BF9\u9898\u7684\u6587\u6848\u6309 dimension \u5206\u3002
 *
 * \u540C\u6837\u662F type='match'\uFF1A\u8BCD\u6C47\u914D\u5BF9\uFF08vocabulary\uFF09\u5DE6\u8FB9\u662F\u8BCD\u3001\u53F3\u8FB9\u662F\u91CA\u4E49\uFF1B
 * \u8DE8\u8282\u7406\u89E3\uFF08comprehension\uFF09\u5DE6\u8FB9\u662F\u6574\u8282\u7ECF\u6587\u3001\u53F3\u8FB9\u662F\u5355\u5143\u3002\u53EA\u770B type \u5C31\u4F1A\u50CF\u5B9E\u62CD\u622A\u56FE\u90A3\u6837\uFF0C
 * \u5728\u300C\u8FD9\u4E9B\u7ECF\u6587\u5404\u5C5E\u4E8E\u54EA\u4E2A\u5355\u5143\uFF1F\u300D\u4E0B\u9762\u5199\u300C\u4E3A\u6BCF\u4E2A\u8BCD\u9009\u51FA\u91CA\u4E49\u300D\u3002
 */
function matchTip(q){
  return q.dimension==='vocabulary'?t.matchTip:q.dimension==='comprehension'?t.matchUnitTip:t.matchAnyTip;
}
function exHint(q){
  if(q.type==='order')return t.needOrder;
  if(q.type!=='match')return t.pickOne;
  return q.dimension==='vocabulary'?t.needMatch:q.dimension==='comprehension'?t.needMatchUnit:t.needMatchAny;
}

/** \u9898\u76EE\u4E3B\u4F53\uFF1A\u5355\u9009 / \u6392\u5E8F / \u914D\u5BF9\u4E09\u79CD\u5F62\u6001 */
function exBody(s){
  var q=s.q,a=deck.answers[s.qi],h='';
  if(q.type==='order'){
    // \u6392\u5E8F\u9898\uFF1A\u6309\u6B63\u786E\u987A\u5E8F\u4F9D\u6B21\u70B9\u9009\uFF0C\u70B9\u4E2D\u7684\u6392\u4E0A\u53F7\uFF0C\u518D\u70B9\u4E00\u4E0B\u53D6\u6D88\uFF08\u540E\u9762\u7684\u81EA\u52A8\u8865\u4F4D\uFF09
    h+=tipLine(q,t.orderTip);
    (q.options||[]).forEach(function(o,oi){
      var at=a.indexOf(oi);
      h+='<button class="opt seq stg'+(at>=0?' on':'')+'" style="--i:'+(oi+2)+'" data-o="'+oi+'">'
        +'<span class="ord">'+(at>=0?(at+1):'')+'</span>'+optText(o)+'</button>';
    });
    h+='<button class="btn ghost" id="reset" style="margin-top:8px'+(a.length?'':';display:none')+'">'+esc(t.reset)+'</button>';
    return h;
  }
  if(q.type==='match'){
    // \u914D\u5BF9\u9898\uFF1A\u5DE6\u5217\u6BCF\u4E2A\u8BCD\u4E00\u884C\uFF0C\u884C\u5185\u628A\u91CA\u4E49\u505A\u6210 chip\u3002\u4E00\u4E2A\u91CA\u4E49\u53EA\u80FD\u914D\u4E00\u4E2A\u8BCD\uFF0C
    // \u6539\u914D\u5230\u522B\u5904\u65F6\u539F\u6765\u90A3\u884C\u81EA\u52A8\u677E\u5F00 \u2014\u2014 \u5426\u5219\u5B66\u751F\u4F1A\u5728\u300C\u4E24\u884C\u9009\u4E86\u540C\u4E00\u4E2A\u300D\u4E0A\u5361\u4F4F\u3002
    h+=tipLine(q,matchTip(q));
    (q.left||[]).forEach(function(w,li){
      // \u5DE6\u8FB9\u53EF\u80FD\u662F\u4E00\u4E2A\u8BCD\uFF0C\u4E5F\u53EF\u80FD\u662F\u4E00\u6574\u8282\u7ECF\u6587 \u2014\u2014 \u957F\u7684\u90A3\u79CD\u7528\u5C0F\u4E00\u53F7\u7684\u5B57\uFF0C\u5426\u5219\u4E00\u5C4F\u653E\u4E0D\u4E0B\u4E24\u7EC4
      var lw=String(w||'');
      h+='<div class="pair stg" data-li="'+li+'" style="--i:'+(li+2)+'"><div class="lw'+(lw.length>40?' long':'')+'" lang="ar">'+esc(w)+'</div><div class="chips">';
      (q.options||[]).forEach(function(o,oi){
        h+='<button class="chip'+(a[li]===oi?' on':'')+(hasAr(o)?' ar':'')+'" data-l="'+li+'" data-o="'+oi+'">'+esc(o)+'</button>';
      });
      h+='</div></div>';
    });
    return h;
  }
  (q.options||[]).forEach(function(o,oi){
    h+='<button class="opt stg'+(a===oi?' on':'')+'" style="--i:'+(oi+1)+'" data-o="'+oi+'">'
      +'<span class="k">'+KEYS.charAt(oi)+'</span>'+optText(o)+'</button>';
  });
  return h;
}

/**
 * \u9009\u4E2D\u6001\u5C31\u5730\u66F4\u65B0\u3002
 *
 * **\u4E0D\u80FD\u7528 render() \u6765\u5237\u65B0\u4E00\u6B21\u70B9\u9009** \u2014\u2014 \u6574\u9875\u91CD\u5EFA\u4F1A\u628A .stg \u7684\u5165\u573A\u52A8\u753B\u4ECE\u5934\u653E\u4E00\u904D\uFF0C
 * \u8868\u73B0\u662F\u300C\u6BCF\u70B9\u4E00\u4E0B\u5185\u5BB9\u5148\u6D88\u5931\u518D\u98DE\u56DE\u6765\u300D\uFF08\u5B9E\u62CD\u622A\u56FE\u91CC\u6574\u5F20\u5361\u7247\u662F\u7A7A\u7684\uFF0C\u5C31\u662F\u649E\u5728\u52A8\u753B\u7684 0 \u5E27\u4E0A\uFF09\u3002
 */
function paintEx(s){
  var q=s.q,a=deck.answers[s.qi];
  if(q.type==='match'){
    Array.prototype.forEach.call(document.querySelectorAll('.chip[data-l]'),function(c){
      var li=Number(c.getAttribute('data-l')),oi=Number(c.getAttribute('data-o'));
      c.classList.toggle('on',a[li]===oi);
    });
    // \u88AB\u81EA\u52A8\u677E\u5F00\u7684\u90A3\u4E00\u884C\u95EA\u4E00\u4E0B\uFF1A\u5149\u9760\u6587\u5B57\u63D0\u793A\uFF0C\u5B66\u751F\u7684\u89C6\u7EBF\u591A\u534A\u8FD8\u505C\u5728\u521A\u70B9\u7684\u90A3\u884C\u4E0A
    Array.prototype.forEach.call(document.querySelectorAll('.pair[data-li]'),function(row){
      row.classList.toggle('released',Number(row.getAttribute('data-li'))===deck.releasedLi);
    });
    return;
  }
  Array.prototype.forEach.call(document.querySelectorAll('.opt[data-o]'),function(b){
    var oi=Number(b.getAttribute('data-o'));
    if(q.type==='order'){
      var at=a.indexOf(oi);
      b.classList.toggle('on',at>=0);
      var ord=b.querySelector('.ord');
      if(ord)ord.textContent=(at>=0?String(at+1):'');
    } else {
      b.classList.toggle('on',a===oi);
    }
  });
  var rs=document.getElementById('reset');
  if(rs)rs.style.display=(q.type==='order'&&a.length?'':'none');
}

function ayahList(vs,base){
  if(!vs||!vs.length)return '';
  var h='';
  vs.forEach(function(v,i){
    h+='<div class="ayah stg" style="--i:'+(base+i)+'"><div class="ref">'+esc(v.ref)+'</div>'
      +'<div class="ar" lang="ar">'+esc(v.arabic)+'</div></div>';
  });
  return h;
}

function resultCard(r){
  if(!r)return '<div class="loading"><div class="spin"></div></div>';
  var pct=r.total?Math.round(r.correct/r.total*100):0;
  var C=2*Math.PI*54;
  var h='<div class="card"><div class="kicker">'+esc(t.done)+'</div>'
   +'<div class="scoreWrap stg" style="--i:0">'
     +'<svg class="ring" width="132" height="132" viewBox="0 0 132 132">'
       +'<defs><linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">'
         +'<stop offset="0%" stop-color="var(--brand)"/><stop offset="100%" stop-color="var(--brand2)"/></linearGradient></defs>'
       +'<circle class="bgc" cx="66" cy="66" r="54"/>'
       +'<circle class="fg" id="ring" cx="66" cy="66" r="54" stroke-dasharray="'+C.toFixed(1)+'" stroke-dashoffset="'+C.toFixed(1)+'"/>'
     +'</svg>'
     +'<div class="scoreNum"><div class="pctRow"><span id="pct">0</span><i class="pctSign">%</i></div><small>'+esc(t.score)+'</small></div>'
   +'</div>'
   +'<div class="stg" style="--i:1;text-align:center;margin-top:6px">'
     +'<span class="tag'+(r.correct===r.total?' ok':'')+'">'+esc(t.right)+' '+frac(r.correct,r.total)+'</span>'
     +'<p class="sub" style="margin-top:10px">'+esc(r.correct===r.total?t.perfect:t.keep)+'</p>'
   +'</div>';
  if((r.wrong||[]).length){
    h+='<h2 class="stg" style="--i:2;margin-top:14px">'+esc(t.review)+'</h2>';
    r.wrong.forEach(function(w,i){
      h+='<div class="wrongItem stg" style="--i:'+(i+3)+'"><div style="font-weight:650">'+esc(w.stem)+'</div>'
        +(w.explanation?'<div class="verse">'+esc(w.explanation)+'</div>':'')+'</div>';
    });
  }
  return h+'</div>';
}

/**
 * \u6210\u7EE9\u73AF + \u6570\u5B57\u6EDA\u52A8\uFF1A\u4EA4\u5B8C\u5377\u8FD9\u4E00\u4E0B\u503C\u5F97\u6709\u70B9\u4EEA\u5F0F\u611F\u3002
 *
 * rAF \u5728\u540E\u53F0\u6807\u7B7E\u9875\u4F1A\u88AB\u8282\u6D41\u751A\u81F3\u505C\u6389\uFF0C\u90A3\u6837\u6570\u5B57\u4F1A\u6C38\u8FDC\u505C\u5728\u534A\u8DEF\uFF08\u5B9E\u6D4B\u505C\u5728 3%\uFF09\u3002
 * \u6240\u4EE5\u8865\u4E00\u4E2A\u4E0D\u4F9D\u8D56 rAF \u7684\u515C\u5E95\u5B9A\u65F6\u5668\uFF1A\u5230\u70B9\u76F4\u63A5\u628A\u7EC8\u503C\u5199\u4E0A\uFF0C\u5B81\u53EF\u6CA1\u6709\u52A8\u753B\u4E5F\u4E0D\u80FD\u663E\u793A\u9519\u7684\u5206\u6570\u3002
 */
function animateScore(r){
  var ring=document.getElementById('ring'),num=document.getElementById('pct');
  if(!ring||!num||!r)return;
  var pct=r.total?r.correct/r.total:0;
  var end=Math.round(pct*100);
  var C=2*Math.PI*54,dur=1100,t0=0,done=false;
  function land(){done=true;num.textContent=String(end);ring.setAttribute('stroke-dashoffset',String(C*(1-pct)));}
  requestAnimationFrame(function(){ring.setAttribute('stroke-dashoffset',String(C*(1-pct)));});
  function step(ts){
    if(done)return;
    if(!t0)t0=ts;
    var k=Math.min(1,(ts-t0)/dur);
    num.textContent=String(Math.round(end*(1-Math.pow(1-k,3))));
    if(k<1)requestAnimationFrame(step);else done=true;
  }
  requestAnimationFrame(step);
  setTimeout(function(){if(!done)land();},dur+500);
}

// \u2500\u2500 \u95EE\u4E00\u95EE\uFF08\u6D6E\u6807 + \u9762\u677F\uFF09\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
/**
 * \u6D6E\u6807\u6302\u5728 body \u4E0A\u3001\u4E0D\u8FDB #app\uFF1A\u5B83\u8981\u8DE8\u9875\u5E38\u9A7B\uFF0C\u8DDF\u7740\u7FFB\u9875\u4E00\u8D77\u91CD\u5EFA\u7684\u8BDD\uFF0C
 * \u4E00\u662F\u6BCF\u6B21\u7FFB\u9875\u90FD\u91CD\u653E\u4E00\u904D\u5F39\u51FA\u52A8\u753B\uFF0C\u4E8C\u662F\u6253\u5B57\u6253\u5230\u4E00\u534A\u88AB render \u51B2\u6389\u3002
 */
var qaEl=null;
function paintQa(){
  if(!deck){ if(qaEl){qaEl.remove();qaEl=null;} return; }
  if(!qaEl){
    qaEl=document.createElement('div');
    qaEl.className='qa';
    document.body.appendChild(qaEl);
  }
  var q=deck.qa;
  var focused=document.activeElement&&document.activeElement.id==='qaIn';
  var draft=focused?document.activeElement.value:null;
  var panel='';
  if(q.open){
    panel='<div class="qaPanel"><div class="qaHead"><b>'+esc(t.ask)+'</b>'
      +'<button class="qaX" id="qaX" aria-label="close">\xD7</button></div>'
      +'<div class="qaTip">'+esc(t.askTip)+'</div>'
      +'<div class="qaAns" id="qaAns">'
        +(q.busy?'<span class="dots"><i></i><i></i><i></i></span>':(q.answer?esc(q.answer):''))
        +((!q.busy&&q.sources&&q.sources.length)?'<div class="qaSrc">'+esc(t.askSrc)+colon()+esc(q.sources.join(' \xB7 '))+'</div>':'')
      +'</div>'
      +'<div class="qaIn"><input id="qaIn" maxlength="300" placeholder="'+esc(t.askPh)+'"'+(q.busy?' disabled':'')+'>'
      +'<button class="btn" id="qaGo"'+(q.busy?' disabled':'')+'>'+esc(t.send)+'</button></div></div>';
  }
  qaEl.innerHTML=panel+'<button class="fab" id="fab" title="'+esc(t.ask)+'" style="position:relative">?</button>';

  var el;
  if((el=qaEl.querySelector('#fab')))el.onclick=function(){
    deck.qa.open=!deck.qa.open;paintQa();
    var i=qaEl.querySelector('#qaIn');if(i)i.focus();
  };
  if((el=qaEl.querySelector('#qaX')))el.onclick=function(){deck.qa.open=false;paintQa();};
  if((el=qaEl.querySelector('#qaGo')))el.onclick=doAsk;
  if((el=qaEl.querySelector('#qaIn'))){
    el.onkeydown=function(e){if(e.key==='Enter'){e.preventDefault();doAsk();}};
    if(draft!==null){el.value=draft;el.focus();}
  }
}

function doAsk(){
  var el=qaEl&&qaEl.querySelector('#qaIn');
  if(!el)return;
  var v=(el.value||'').trim();
  var q=deck.qa;
  if(!v){q.answer=t.askEmpty;q.sources=[];paintQa();return;}
  q.busy=true;q.answer='';q.sources=[];paintQa();
  api('/api/ask',{method:'POST',body:{q:v}}).then(function(j){
    q.busy=false;
    if(j.error){q.answer=j.error==='TOO_MANY'?t.askTooMany:j.error==='EMPTY'?t.askEmpty:t.askErr;q.sources=[];}
    else if(j.insufficient||!j.answer){q.answer=t.askNone;q.sources=[];}
    else{q.answer=j.answer;q.sources=(j.sources||[]).map(function(s){return s.title;});}
    paintQa();
  }).catch(function(e){
    q.busy=false;
    if(String(e.message)!=='UNAUTHORIZED'){q.answer=t.askErr;q.sources=[];paintQa();}
  });
}

// \u2500\u2500 \u4E8B\u4EF6\u7ED1\u5B9A \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
function bind(s){
  var el;
  if((el=document.getElementById('prev')))el.onclick=function(){if(deck.idx>0){deck.idx--;dirBack=true;render();window.scrollTo(0,0);}};
  if((el=document.getElementById('next')))el.onclick=goNext;
  if((el=document.getElementById('sub')))el.onclick=submit;
  if((el=document.getElementById('again')))el.onclick=function(){
    deck.answers=deck.slides.filter(function(x){return x.type==='ex';}).map(function(x){
      if(x.q.type==='match')return (x.q.left||[]).map(function(){return -1;});
      if(x.q.type==='order')return [];
      return -1;
    });
    deck.result=null;
    var i=-1;
    deck.slides.forEach(function(x,k){if(i<0&&x.type==='ex')i=k;});
    deck.idx=i<0?0:i;dirBack=true;render();window.scrollTo(0,0);
  };
  if((el=document.getElementById('out')))el.onclick=function(){token='';localStorage.removeItem('qt_token');renderLogin();};

  if(s.type==='ex'){
    var q=s.q;
    Array.prototype.forEach.call(document.querySelectorAll('.opt[data-o]'),function(b){
      b.onclick=function(){
        var oi=Number(b.getAttribute('data-o'));
        if(q.type==='order'){
          var a=deck.answers[s.qi],at=a.indexOf(oi);
          if(at>=0)a.splice(at,1);else a.push(oi);
        } else {
          deck.answers[s.qi]=oi;
        }
        setErr('');paintEx(s);
      };
    });
    Array.prototype.forEach.call(document.querySelectorAll('.chip[data-l]'),function(b){
      b.onclick=function(){
        var li=Number(b.getAttribute('data-l')),oi=Number(b.getAttribute('data-o'));
        var a=deck.answers[s.qi];
        // \u53D6\u6D88\u81EA\u5DF1\u8FD9\u884C\uFF1A\u4EFB\u4F55\u65F6\u5019\u90FD\u5141\u8BB8
        if(a[li]===oi){a[li]=-1;deck.releasedLi=-1;setErr('');paintEx(s);return;}
        /**
         * \u4E00\u4E2A\u91CA\u4E49\u53EA\u914D\u4E00\u4E2A\u8BCD\u3002\u26A0\uFE0F \u539F\u5B9E\u73B0\u662F\u628A**\u522B\u4EBA\u90A3\u884C\u9759\u9ED8\u677E\u5F00**\uFF0C\u5B66\u751F\u5B9E\u6D4B\u53CD\u9988
         * \u300C\u7B2C\u4E00\u4E8C\u4E2A\u8BCD\u914D\u5B8C\uFF0C\u7B2C\u4E09\u4E2A\u8BCD\u9009\u540C\u4E00\u4E2A\uFF0C\u524D\u9762\u7684\u9009\u4E2D\u5C31\u6CA1\u4E86\u300D\u2014\u2014 \u4ED6\u6839\u672C\u4E0D\u77E5\u9053\u90A3\u884C
         * \u5DF2\u7ECF\u53D8\u6210\u672A\u4F5C\u7B54\uFF0C\u4EA4\u5377\u65F6\u767D\u4E22\u4E00\u9898\u3002
         * \u300C\u7A33\u59A5\u4E3A\u4E3B\u300D\uFF1A\u6539\u6210**\u62D2\u7EDD\u8FD9\u6B21\u70B9\u51FB**\uFF0C\u8C01\u4E5F\u4E0D\u52A8\uFF0C\u5E76\u660E\u786E\u544A\u8BC9\u4ED6\u51B2\u7A81\u5728\u54EA\u4E00\u884C\u3001
         * \u600E\u4E48\u89E3\u5F00\uFF08\u53BB\u90A3\u884C\u70B9\u4E00\u4E0B\u53D6\u6D88\uFF09\u3002\u5DF2\u7ECF\u4F5C\u7B54\u7684\u5185\u5BB9\u6C38\u8FDC\u4E0D\u4F1A\u88AB\u522B\u5904\u7684\u64CD\u4F5C\u6E05\u6389\u3002
         */
        var taken=-1;
        for(var i=0;i<a.length;i+=1)if(i!==li&&a[i]===oi){taken=i;break;}
        if(taken>=0){
          deck.releasedLi=taken;                     // \u9AD8\u4EAE\u51B2\u7A81\u90A3\u884C\uFF0C\u5E2E\u4ED6\u627E\u5230
          setErr(t.matchTaken.replace('{w}',String((s.q.left||[])[taken]||'')));
          paintEx(s);
          return;
        }
        a[li]=oi;
        deck.releasedLi=-1;
        setErr('');
        paintEx(s);
      };
    });
    if((el=document.getElementById('reset')))el.onclick=function(){deck.answers[s.qi]=[];setErr('');paintEx(s);};
  }

  if(s.type==='result')animateScore(deck.result);
}

function goNext(){
  var s=deck.slides[deck.idx];
  // \u9898\u76EE\u9875\u5FC5\u987B\u9009\u4E86\u624D\u8FC7\uFF1A\u7A7A\u7740\u7FFB\u8FC7\u53BB\uFF0C\u6700\u540E\u4EA4\u5377\u624D\u53D1\u73B0\u6F0F\u4E86\u66F4\u96BE\u8865
  if(s.type==='ex'&&!exDone(s.q,deck.answers[s.qi])){setErr(exHint(s.q));return;}
  if(deck.idx<deck.slides.length-1){deck.idx++;dirBack=false;render();window.scrollTo(0,0);}
}

function submit(){
  var d=deck;
  if(d.submitting)return;
  var last=d.slides[d.idx];
  if(last.type==='ex'&&!exDone(last.q,d.answers[last.qi])){setErr(exHint(last.q));return;}
  var missing=0;
  d.slides.forEach(function(x){if(x.type==='ex'&&!exDone(x.q,d.answers[x.qi]))missing+=1;});
  if(missing&&!confirm(t.fill))return;
  d.submitting=true;render();
  var body={};
  d.slides.forEach(function(x){if(x.type==='ex'&&exDone(x.q,d.answers[x.qi]))body[x.q.id]=d.answers[x.qi];});
  api('/api/submit',{method:'POST',body:{paperId:d.paper.id,answers:body}}).then(function(j){
    d.submitting=false;
    if(j.error){render();setErr(j.error);return;}
    d.result=j;
    d.idx=d.slides.length-1;
    dirBack=false;render();window.scrollTo(0,0);
  }).catch(function(e){
    d.submitting=false;
    if(String(e.message)!=='UNAUTHORIZED'){render();setErr(t.net);}
  });
}

// \u952E\u76D8 \u2190/\u2192 \u7FFB\u9875\uFF1A\u6559\u5BA4\u6295\u5C4F\u65F6\u8001\u5E08\u7528\u9065\u63A7\u7B14\u5E26\u7740\u8D70
document.addEventListener('keydown',function(e){
  if(!deck)return;
  if(document.activeElement&&/^(INPUT|SELECT|TEXTAREA)$/.test(document.activeElement.tagName))return;
  if(e.key==='ArrowRight'){var n=document.getElementById('next');if(n)n.click();}
  if(e.key==='ArrowLeft'){var p=document.getElementById('prev');if(p)p.click();}
});

if(token)loadDeck();else renderLogin();
})();
</script></body></html>`;

// ../../../totalclaw-solutions/solutions/workbench-quran-teaching/src/main/services/quranTeaching/lan.ts
var DEFAULT_PORT = 8230;
var CODE_FAIL_LIMIT = 10;
var CODE_LOCK_MS = 6e4;
var CODE_ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
var ASK_PER_MIN = 6;
function newClassCode() {
  const b = (0, import_crypto.randomBytes)(6);
  let s = "";
  for (let i = 0; i < 6; i += 1) s += CODE_ALPHABET[b[i] % CODE_ALPHABET.length];
  return `${s.slice(0, 3)}-${s.slice(3)}`;
}
var normalizeCode = (v) => String(v || "").replace(/[^0-9a-z]/gi, "").toUpperCase();
var QuranLanService = class {
  constructor(store2, logger) {
    this.store = store2;
    this.logger = logger;
    const fails = new import_lanServer.RateBucket(CODE_FAIL_LIMIT, CODE_LOCK_MS);
    this.lan = new import_lanServer.LanServer({
      name: "quran-teaching",
      pageHtml: QURAN_STUDENT_PAGE_HTML,
      defaultPort: DEFAULT_PORT,
      logger,
      auth: (token) => this.sessionByToken(token),
      routes: this.routes(fails)
    });
  }
  lan;
  codeValue = newClassCode();
  /** studentId → 会话。一个名字同时只有一个人用；换设备重新认领即收回旧 token */
  sessions = /* @__PURE__ */ new Map();
  /** 教师端当前下发的卷子；没下发时学生端显示「老师还没有发卷」 */
  activePaperId = "";
  activeLang = "zh";
  /**
   * 当前下发的**课程**：教学范围 + 可选的课程计划。
   *
   * 与试卷分开下发是有原因的：课程是「学什么」，试卷是「考什么」，课上先讲半节再考，
   * 或者只讲不考，都是常态。绑在一起会变成「不发卷学生就没东西看」。
   */
  scope = { chapter: 103, from: void 0, to: void 0 };
  activePlanId = "";
  /** studentId → 最近一分钟的提问时间戳（受限问答限流，见 /api/ask） */
  askRate = /* @__PURE__ */ new Map();
  get classCode() {
    return this.codeValue;
  }
  status() {
    return {
      running: this.lan.running,
      port: this.lan.port,
      url: this.lan.url,
      classCode: this.codeValue,
      claimed: this.sessions.size,
      total: this.store.listStudents().length,
      paperId: this.activePaperId,
      planId: this.activePlanId
    };
  }
  async start() {
    await this.lan.start();
    return this.status();
  }
  async stop() {
    await this.lan.stop();
  }
  /** 换班级码：旧码立刻失效，但**不踢已经在答题的学生** —— 换码是为了拦住外面的人，不是打断课堂 */
  rotateCode() {
    this.codeValue = newClassCode();
    return this.status();
  }
  /**
   * 下发课程：学生端「学习内容」按它显示经文、单元、词汇与课时安排。
   * planId 可以为空 —— 只指定范围也算下发了课程（学生照样能读经文与单元）。
   */
  setActiveLesson(scope, lang2, planId) {
    if (scope?.chapter) this.scope = { chapter: scope.chapter, from: scope.from, to: scope.to };
    this.activeLang = lang2;
    this.activePlanId = planId || "";
    return this.status();
  }
  /**
   * 下发 / 收回试卷。收回后学生端的「练习 / 考试」回到「老师还没有发卷」，
   * **但学习内容照常在** —— 不发卷不等于没课可上。
   *
   * 下发卷子时顺带把教学范围对齐到这张卷子：只换卷不换范围，学生会对着别章的经文做这一章的题。
   */
  setActivePaper(paperId, lang2, scope) {
    this.activePaperId = paperId || "";
    this.activeLang = lang2;
    if (scope?.chapter) this.scope = { chapter: scope.chapter, from: scope.from, to: scope.to };
    else if (paperId) {
      try {
        const p = this.store.paper(paperId);
        this.scope = { chapter: p.chapter, from: p.from, to: p.to };
      } catch {
      }
    }
    return this.status();
  }
  /** 放开所有认领（清空演示数据时一起调，否则下一轮演示这些名字全是「已有人」） */
  releaseAll() {
    this.sessions.clear();
    this.askRate.clear();
  }
  sessionByToken(token) {
    if (!token) return null;
    for (const s of this.sessions.values()) if (s.token === token) return s;
    return null;
  }
  activePaper() {
    if (!this.activePaperId) return null;
    try {
      return this.store.paper(this.activePaperId);
    } catch {
      return null;
    }
  }
  routes(fails) {
    return [
      {
        // 名册：登录页要把「有哪些名字、哪些已被认领」先列出来，避免学生瞎猜
        method: "GET",
        path: "/api/roster",
        auth: "none",
        handler: (c) => {
          let lang2 = this.activeLang;
          try {
            const q = new URL(c.req.url || "/", "http://x").searchParams.get("lang");
            if (q === "zh" || q === "en" || q === "ar") lang2 = q;
          } catch {
          }
          c.json(200, {
            students: this.store.listStudents().map((s) => ({
              id: s.id,
              name: s.name[lang2] || s.name.zh,
              taken: this.sessions.has(s.id)
            }))
          });
        }
      },
      {
        method: "POST",
        path: "/api/join",
        auth: "none",
        handler: async (c) => {
          if (fails.locked(c.clientIp)) {
            c.json(429, { error: "TOO_MANY" });
            return;
          }
          const body = await c.body();
          if (normalizeCode(body?.code) !== normalizeCode(this.codeValue)) {
            if (fails.fail(c.clientIp)) this.logger?.warn?.("quran-teaching", (0, import_i18n2.t)("\u73ED\u7EA7\u7801\u5C1D\u8BD5\u8FC7\u4E8E\u9891\u7E41\uFF0C\u5DF2\u4E34\u65F6\u9650\u6D41"), { ip: c.clientIp });
            c.json(200, { error: "BAD_CODE" });
            return;
          }
          fails.pass(c.clientIp);
          const studentId = String(body?.studentId || "");
          const known = this.store.listStudents().some((s) => s.id === studentId);
          if (!known) {
            c.json(200, { error: "BAD_STUDENT" });
            return;
          }
          if (this.sessions.has(studentId)) {
            c.json(200, { error: "TAKEN" });
            return;
          }
          const token = (0, import_crypto.randomBytes)(24).toString("hex");
          this.sessions.set(studentId, { studentId, token, since: Date.now() });
          c.json(200, { token, studentId });
        }
      },
      {
        /**
         * 学习内容：经文 + 本课单元 + 词汇。
         *
         * 学生扫码进来第一眼要先能「学」，不是直接甩一张卷子 —— 教师端的学生页本来就是
         * 「学习内容 → 练习/考试 → 结果」三段，局域网这一侧不该只剩中间那段。
         * 经文是 L1 冻结原文（原样下发），单元与词汇取所选语言的标签。
         */
        method: "GET",
        path: "/api/learn",
        auth: "bearer",
        handler: (c) => {
          const sel = this.scope;
          const lang2 = this.activeLang;
          let verses = [];
          let units = [];
          let vocab = [];
          try {
            verses = this.store.verses(sel.chapter, sel.from, sel.to).map((v) => ({ ref: v.ref, arabic: v.arabic }));
            const parsed = this.store.parse(sel.chapter, sel.from, sel.to);
            units = parsed.units.map((u) => ({
              title: u.title[lang2] || u.title.zh,
              theme: u.theme[lang2] || u.theme.zh,
              range: `${u.from}-${u.to}`,
              refs: u.verseRefs || []
            }));
            vocab = parsed.vocabulary.filter((w) => w.meaning).slice(0, 24).map((w) => ({ word: w.word, meaning: w.meaning[lang2] || w.meaning.zh }));
          } catch {
          }
          let lesson = null;
          const plan = this.activePlanId ? this.store.findPlan(this.activePlanId) : null;
          if (plan) {
            lesson = {
              title: plan.difficultyLabel || "",
              overview: plan.overview || "",
              objectives: plan.objectives || [],
              sessions: (plan.sessions || []).map((x) => ({
                title: x.title,
                range: `${x.from}-${x.to}`,
                objectives: x.objectives || [],
                minutes: (x.segments || []).reduce((a, g) => a + (Number(g.minutes) || 0), 0)
              }))
            };
          }
          let chapterName2 = "";
          try {
            chapterName2 = this.store.chapterLabel(sel.chapter, lang2);
          } catch {
          }
          c.json(200, { chapter: sel.chapter, chapterName: chapterName2, from: sel.from, to: sel.to, lang: lang2, lesson, verses, units, vocab });
        }
      },
      {
        /**
         * 受限问答：学生就本课随时提问。
         *
         * 答案严格锚定教师批准过的资料（store.studentAsk 先检索批准资料再让模型据此作答，
         * 检索不到就直接 insufficient），学生设备上问不出「课外内容」—— 这条线的整个卖点
         * 就是可追溯，问答这一环要是放开了自由发挥，前面的批准流程等于白做。
         */
        method: "POST",
        path: "/api/ask",
        auth: "bearer",
        handler: async (c) => {
          const sid = c.principal.studentId;
          const now = Date.now();
          const win = (this.askRate.get(sid) || []).filter((ts) => now - ts < 6e4);
          if (win.length >= ASK_PER_MIN) {
            c.json(429, { error: "TOO_MANY" });
            return;
          }
          const body = await c.body();
          const q = String(body?.q || "").replace(/\s+/g, " ").trim().slice(0, 300);
          if (!q) {
            c.json(200, { error: "EMPTY" });
            return;
          }
          win.push(now);
          this.askRate.set(sid, win);
          try {
            const sel = this.scope;
            const r = await this.store.studentAsk(q, sel.chapter, sel.from, sel.to, this.activeLang);
            this.logger?.info?.("quran-teaching", (0, import_i18n2.t)("\u5B66\u751F\u63D0\u95EE"), { studentId: sid, insufficient: r.insufficient });
            c.json(200, r);
          } catch (e) {
            this.logger?.warn?.("quran-teaching", (0, import_i18n2.t)("\u5B66\u751F\u63D0\u95EE\u5931\u8D25"), { studentId: sid, err: String(e?.message || e) });
            c.json(200, { error: "INTERNAL" });
          }
        }
      },
      {
        method: "GET",
        path: "/api/paper",
        auth: "bearer",
        handler: (c) => {
          const paper = this.activePaper();
          if (!paper) {
            c.json(200, { error: "NO_PAPER" });
            return;
          }
          const sid = c.principal.studentId;
          const student = this.store.listStudents().find((s) => s.id === sid);
          const questions = this.store.questionsForStudentPinned(paper.id, sid).map((q) => ({
            id: q.id,
            type: q.type,
            dimension: q.dimension,
            stem: q.stem,
            options: q.options,
            left: q.left,
            sourceRefs: q.sourceRefs
          }));
          c.json(200, {
            id: paper.id,
            title: paper.title,
            lang: this.activeLang,
            studentName: student ? student.name[this.activeLang] || student.name.zh : "",
            questions
          });
        }
      },
      {
        method: "POST",
        path: "/api/submit",
        auth: "bearer",
        handler: async (c) => {
          const paper = this.activePaper();
          if (!paper) {
            c.json(200, { error: "NO_PAPER" });
            return;
          }
          const body = await c.body();
          if (String(body?.paperId || "") !== paper.id) {
            c.json(200, { error: "STALE_PAPER" });
            return;
          }
          const sid = c.principal.studentId;
          const mine = this.store.questionsForStudentPinned(paper.id, sid);
          const answers = body?.answers && typeof body.answers === "object" ? body.answers : {};
          let correct = 0;
          let skipped = 0;
          const wrong = [];
          for (const q of mine) {
            const raw = answers[q.id];
            const picked = Array.isArray(raw) ? raw.map((n) => Number(n)).filter((n) => Number.isFinite(n)) : typeof raw === "number" && Number.isFinite(raw) ? raw : null;
            let rec;
            try {
              rec = this.store.setAnswer(paper.id, sid, q.id, picked, { defer: true });
            } catch (err) {
              skipped += 1;
              this.logger?.warn?.("quran-teaching", (0, import_i18n2.t)("\u8FD9\u9053\u9898\u5DF2\u5931\u6548\uFF0C\u4EA4\u5377\u65F6\u8DF3\u8FC7"), {
                studentId: sid,
                paperId: paper.id,
                questionId: q.id,
                err: String(err?.message || err)
              });
              continue;
            }
            if (rec.correct) correct += 1;
            else wrong.push({ stem: q.stem, explanation: q.explanation || "" });
          }
          try {
            this.store.flush();
          } catch (err) {
            this.logger?.warn?.("quran-teaching", (0, import_i18n2.t)("\u4EA4\u5377\u843D\u76D8\u5931\u8D25"), { studentId: sid, err: String(err?.message || err) });
          }
          this.logger?.info?.("quran-teaching", (0, import_i18n2.t)("\u5B66\u751F\u5DF2\u4EA4\u5377"), { studentId: sid, paperId: paper.id, correct, total: mine.length, skipped });
          c.json(200, { correct, total: mine.length - skipped, wrong, ...skipped ? { skipped } : {} });
        }
      }
    ];
  }
};

// ../../../totalclaw-solutions/solutions/workbench-quran-teaching/src/main/services/quranTeaching/offscreenRender.ts
var import_electron = require("electron");
var import_node_fs3 = require("node:fs");
async function renderHtmlToPng(html, outPath, width, height) {
  const win = new import_electron.BrowserWindow({
    show: false,
    width,
    height,
    useContentSize: true,
    // Electron 42+ 默认缩放为 1；保留原来跟随主屏 DPI 的输出尺寸。
    webPreferences: { offscreen: { deviceScaleFactor: import_electron.screen.getPrimaryDisplay().scaleFactor }, nodeIntegration: false, contextIsolation: true, sandbox: true, backgroundThrottling: false }
  });
  try {
    win.setContentSize(width, height);
    await win.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);
    await new Promise((r) => setTimeout(r, 350));
    const img = await win.webContents.capturePage({ x: 0, y: 0, width, height });
    if (img.isEmpty()) throw new Error("capturePage returned empty image");
    (0, import_node_fs3.writeFileSync)(outPath, img.toPNG());
  } finally {
    try {
      win.destroy();
    } catch {
    }
  }
}

// ../../../totalclaw-solutions/solutions/workbench-quran-teaching/src/main/ipc/quranTeaching.ipc.ts
var QURAN_SOLUTION_ID = "workbench-quran-teaching";
var store = null;
var lanSvc = null;
var accountHooked = false;
var FAL_TTS_MODEL = "fal-ai/minimax/speech-02-hd";
var FAL_TTS_VOICE = { zh: "Chinese (Mandarin)_Warm_Girl", en: "English_Graceful_Lady", ar: "Wise_Woman" };
var LOCAL_TTS_LANG = { zh: "zh-CN", en: "en-US", ar: "ar-001" };
function resourcesDir() {
  return (0, import_runtimeLocation.shellResourcesPath)();
}
function fontAssets() {
  const dir = (0, import_node_path3.join)(resourcesDir(), "quran-demo-fonts");
  const quran = (0, import_node_path3.join)(dir, "AmiriQuran.ttf");
  const text = (0, import_node_path3.join)(dir, "Amiri-Regular.ttf");
  if (!(0, import_node_fs4.existsSync)(quran) || !(0, import_node_fs4.existsSync)(text)) return { fontFaceCss: "" };
  const face = (family, file) => `@font-face{font-family:"${family}";src:url(data:font/ttf;base64,${(0, import_node_fs4.readFileSync)(file).toString("base64")}) format("truetype");font-display:block}`;
  return { fontUrls: { quran: (0, import_mediaProtocol.buildLocalMediaUrl)(quran), text: (0, import_mediaProtocol.buildLocalMediaUrl)(text) }, fontFaceCss: face("Amiri Quran", quran) + face("Amiri", text) };
}
function llmReady(deps) {
  try {
    return !!deps.engineRegistry?.getActive?.();
  } catch {
    return false;
  }
}
function isLang(v) {
  return v === "zh" || v === "en" || v === "ar";
}
function lang(v) {
  return isLang(v) ? v : "zh";
}
function num(v, d) {
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
}
function lan(deps) {
  ensure(deps);
  if (!lanSvc) lanSvc = new QuranLanService(ensure(deps), deps.logger);
  return lanSvc;
}
function ensure(deps) {
  if (!accountHooked) {
    accountHooked = true;
    (0, import_accountScope.onAccountKeyChange)(() => {
      store = null;
      const old = lanSvc;
      lanSvc = null;
      void old?.stop();
    });
  }
  if (store) return store;
  const emit = (ev) => {
    try {
      deps.getMainWindow()?.webContents.send(import_ipc_contracts.IPC_CHANNELS.WORKBENCH_QURAN_EVENT, ev);
    } catch {
    }
  };
  const pair = (0, import_ffmpegPath.resolveFfmpegPair)(resourcesDir());
  const fonts = fontAssets();
  const falReady = () => (0, import_mediaFal.falKeysReady)(deps, QURAN_SOLUTION_ID);
  store = new QuranTeachingStore({
    dataDir: (0, import_accountScope.privateRoot)(),
    bundledCorpusDir: (0, import_node_path3.join)(resourcesDir(), "quran-demo-corpus"),
    // 随包短视频样例（§13.2 允许预置）：启动时自动登记，ffmpeg 不可用也有得放
    bundledVideoDir: (0, import_node_path3.join)(resourcesDir(), "quran-demo-videos"),
    llm: async (prompt, timeoutMs) => {
      try {
        return await (0, import_councilChatRouter.runOneshotChat)(deps, prompt, { plainCompletion: true, timeoutMs });
      } catch (e) {
        const msg = String(e?.message || e);
        if (/SessionProvider|engineRegistry|未就绪|API key|api_key|not.*ready|provider/i.test(msg)) throw new Error((0, import_i18n3.t)("AI \u5927\u8111\u5C1A\u672A\u5C31\u7EEA\uFF0C\u8BF7\u5230\u300C\u8BBE\u7F6E \u2192 \u6A21\u578B\u914D\u7F6E\u300D\u5B8C\u6210\u914D\u7F6E\u540E\u91CD\u8BD5"));
        throw e;
      }
    },
    llmReady: () => llmReady(deps),
    renderImage: renderHtmlToPng,
    ffmpeg: pair.ffmpeg,
    falReady,
    falBackground: async (prompt) => {
      const r = await (0, import_mediaFal.runFalJob)(deps, { capability: "t2i", model: "fal-ai/flux/schnell", prompt, width: 1280, height: 800, num: 1, outDir: (0, import_node_path3.join)((0, import_accountScope.privateRoot)(), "quran-teaching", "media", "fal"), solutionId: QURAN_SOLUTION_ID });
      const f = r.files.find(Boolean);
      if (!f) return null;
      return `data:image/jpeg;base64,${(0, import_node_fs4.readFileSync)(f).toString("base64")}`;
    },
    tts: async (text, l, outBase) => {
      if (falReady()) {
        try {
          const r = await (0, import_mediaFal.runFalJob)(deps, { capability: "tts", model: FAL_TTS_MODEL, text, voice: FAL_TTS_VOICE[l], outDir: (0, import_node_path3.join)((0, import_accountScope.privateRoot)(), "quran-teaching", "media", "fal"), solutionId: QURAN_SOLUTION_ID });
          const f = r.files.find(Boolean);
          if (f) return { path: f, engine: "fal", model: FAL_TTS_MODEL };
        } catch (e) {
          deps.logger?.warn?.("quran-teaching", (0, import_i18n3.t)("fal \u8BED\u97F3\u5408\u6210\u5931\u8D25\uFF0C\u56DE\u843D\u672C\u5730\u5F15\u64CE"), { err: String(e?.message || e).slice(0, 200) });
        }
      }
      const local = await (0, import_localTts.synthesizeLocalSpeech)({ text, lang: LOCAL_TTS_LANG[l] });
      if (!local.ok || !local.wavBase64) return null;
      const path = `${outBase}.wav`;
      (0, import_node_fs4.writeFileSync)(path, Buffer.from(local.wavBase64, "base64"));
      return { path, engine: "local", model: local.voice || "system" };
    },
    fileUrl: (p) => (0, import_mediaProtocol.buildLocalMediaUrl)(p),
    fontFaceCss: fonts.fontFaceCss,
    fontUrls: fonts.fontUrls,
    progress: (jobId, stage, msg, done, total) => emit({ jobId, stage, msg, done, total }),
    logger: {
      info: (m, ctx) => deps.logger?.info?.("quran-teaching", m, ctx),
      warn: (m, ctx) => deps.logger?.warn?.("quran-teaching", m, ctx)
    }
  });
  return store;
}
function registerQuranTeachingHandlers(deps) {
  import_electron2.ipcMain.handle(import_ipc_contracts.IPC_CHANNELS.WORKBENCH_QURAN_STATUS, async () => ensure(deps).status());
  import_electron2.ipcMain.handle(import_ipc_contracts.IPC_CHANNELS.WORKBENCH_QURAN_PICK_DIR, async () => {
    const win = deps.getMainWindow();
    const opts = { title: (0, import_i18n3.t)("\u9009\u62E9\u6807\u51C6\u7ECF\u6587\u6D4B\u8BD5\u8BED\u6599\u5305\u76EE\u5F55"), properties: ["openDirectory"] };
    const r = win ? await import_electron2.dialog.showOpenDialog(win, opts) : await import_electron2.dialog.showOpenDialog(opts);
    return { path: r.canceled ? "" : r.filePaths[0] || "" };
  });
  import_electron2.ipcMain.handle(import_ipc_contracts.IPC_CHANNELS.WORKBENCH_QURAN_IMPORT, async (_e, payload) => {
    (0, import_shared.rateLimit)("QURAN_IMPORT", 20);
    const s = ensure(deps);
    const dir = String(payload?.dir || "").trim();
    const status = dir ? s.importCorpus(dir, "directory") : s.importCorpus((0, import_node_path3.join)(resourcesDir(), "quran-demo-corpus"), "bundled");
    deps.logger.audit?.("quran-teaching", (0, import_i18n3.t)("\u5BFC\u5165\u6807\u51C6\u7ECF\u6587\u8BED\u6599\u5305"), { dir: status.sourceDir, verified: status.allVerified, verses: status.totalVerses, problems: status.problems.length });
    return status;
  });
  import_electron2.ipcMain.handle(import_ipc_contracts.IPC_CHANNELS.WORKBENCH_QURAN_VERSES, async (_e, payload) => ensure(deps).verses(Number(payload?.chapter), num(payload?.from), num(payload?.to)));
  import_electron2.ipcMain.handle(import_ipc_contracts.IPC_CHANNELS.WORKBENCH_QURAN_SEARCH, async (_e, payload) => ensure(deps).search(String(payload?.query || ""), num(payload?.chapter)));
  import_electron2.ipcMain.handle(import_ipc_contracts.IPC_CHANNELS.WORKBENCH_QURAN_MATERIALS, async (_e, payload) => ensure(deps).materialsFor(Number(payload?.chapter), num(payload?.from), num(payload?.to)));
  import_electron2.ipcMain.handle(import_ipc_contracts.IPC_CHANNELS.WORKBENCH_QURAN_PARSE, async (_e, payload) => {
    (0, import_shared.rateLimit)("QURAN_PARSE", 60);
    const r = ensure(deps).parse(Number(payload?.chapter), num(payload?.from), num(payload?.to));
    deps.logger.audit?.("quran-teaching", (0, import_i18n3.t)("\u89E3\u6790\u7AE0\u8282\u7ED3\u6784"), { chapter: r.chapter, from: r.from, to: r.to, units: r.units.length });
    return r;
  });
  import_electron2.ipcMain.handle(import_ipc_contracts.IPC_CHANNELS.WORKBENCH_QURAN_PLAN_GENERATE, async (_e, payload) => {
    (0, import_shared.rateLimit)("QURAN_PLAN", 10);
    const req = {
      chapter: Number(payload?.chapter),
      from: num(payload?.from, 1),
      to: num(payload?.to, 9999),
      grade: String(payload?.grade || "").trim().slice(0, 60) || (0, import_i18n3.t)("\u5927\u5B66\u4E00\u5E74\u7EA7"),
      level: payload?.level === "intermediate" || payload?.level === "advanced" ? payload.level : "beginner",
      sessionsPerWeek: num(payload?.sessionsPerWeek, 2),
      sessionMinutes: num(payload?.sessionMinutes, 45),
      weeks: num(payload?.weeks, 2),
      goals: String(payload?.goals || "").slice(0, 400),
      lang: lang(payload?.lang)
    };
    const plan = await ensure(deps).generatePlan(req);
    deps.logger.audit?.("quran-teaching", (0, import_i18n3.t)("\u751F\u6210\u6559\u5B66\u8BA1\u5212"), { planId: plan.id, chapter: req.chapter, generator: plan.generator });
    return plan;
  });
  import_electron2.ipcMain.handle(import_ipc_contracts.IPC_CHANNELS.WORKBENCH_QURAN_PLAN_SAVE, async (_e, payload) => {
    const plan = ensure(deps).savePlan(String(payload?.id || ""), payload?.patch || {});
    deps.logger.audit?.("quran-teaching", (0, import_i18n3.t)("\u6559\u5E08\u786E\u8BA4/\u7F16\u8F91\u6559\u5B66\u8BA1\u5212"), { planId: plan.id, reviewStatus: plan.reviewStatus });
    return plan;
  });
  import_electron2.ipcMain.handle(import_ipc_contracts.IPC_CHANNELS.WORKBENCH_QURAN_GRAPH, async (_e, payload) => ensure(deps).graph(Number(payload?.chapter), num(payload?.from), num(payload?.to), lang(payload?.lang)));
  import_electron2.ipcMain.handle(import_ipc_contracts.IPC_CHANNELS.WORKBENCH_QURAN_PAPER_GENERATE, async (_e, payload) => {
    (0, import_shared.rateLimit)("QURAN_PAPER", 40);
    const r = ensure(deps).generatePaper({
      chapter: Number(payload?.chapter),
      from: num(payload?.from),
      to: num(payload?.to),
      lang: lang(payload?.lang),
      level: payload?.level === "intermediate" || payload?.level === "advanced" ? payload.level : "beginner",
      count: num(payload?.count, 10),
      kind: payload?.kind === "exam" ? "exam" : "practice"
    });
    deps.logger.audit?.("quran-teaching", (0, import_i18n3.t)("\u52A8\u6001\u751F\u6210\u8BD5\u5377"), { paperId: r.paper.id, questions: r.paper.questions.length, rejected: r.rejected, version: r.paper.version });
    return r;
  });
  import_electron2.ipcMain.handle(import_ipc_contracts.IPC_CHANNELS.WORKBENCH_QURAN_PAPERS, async () => ensure(deps).papers());
  import_electron2.ipcMain.handle(import_ipc_contracts.IPC_CHANNELS.WORKBENCH_QURAN_QUESTION_UPDATE, async (_e, payload) => {
    const p = ensure(deps).updateQuestion(String(payload?.paperId || ""), String(payload?.questionId || ""), payload?.patch || {});
    deps.logger.audit?.("quran-teaching", payload?.patch?.remove ? (0, import_i18n3.t)("\u6559\u5E08\u5220\u9664\u9898\u76EE") : (0, import_i18n3.t)("\u6559\u5E08\u7F16\u8F91/\u786E\u8BA4\u9898\u76EE"), { paperId: p.id, questionId: payload?.questionId });
    return p;
  });
  import_electron2.ipcMain.handle(import_ipc_contracts.IPC_CHANNELS.WORKBENCH_QURAN_INTAKE, async (_e, payload) => {
    const items = ensure(deps).intake(String(payload?.text || ""), String(payload?.note || ""));
    deps.logger.audit?.("quran-teaching", (0, import_i18n3.t)("\u6559\u5E08\u63D0\u4EA4\u5F85\u5BA1\u6838\u8D44\u6599"), { chars: String(payload?.text || "").trim().length });
    return { items };
  });
  import_electron2.ipcMain.handle(import_ipc_contracts.IPC_CHANNELS.WORKBENCH_QURAN_REVIEW, async (_e, payload) => {
    const r = ensure(deps).review({
      target: payload?.target === "script" ? "script" : payload?.target === "card" ? "card" : "reinforcement",
      id: String(payload?.id || ""),
      accept: typeof payload?.accept === "boolean" ? payload.accept : void 0,
      text: typeof payload?.text === "string" ? payload.text : void 0,
      cards: Array.isArray(payload?.cards) ? payload.cards : void 0,
      remove: payload?.remove === true
    });
    deps.logger.audit?.("quran-teaching", (0, import_i18n3.t)("\u6559\u5E08\u5BA1\u6838 AI \u4EA7\u7269"), { target: payload?.target, id: payload?.id, accept: payload?.accept, edited: !!payload?.text || !!payload?.cards?.length });
    return r;
  });
  import_electron2.ipcMain.handle(import_ipc_contracts.IPC_CHANNELS.WORKBENCH_QURAN_QUESTION_REGENERATE, async (_e, payload) => {
    (0, import_shared.rateLimit)("QURAN_REGEN", 60);
    const p = ensure(deps).regenerateQuestion(String(payload?.paperId || ""), String(payload?.questionId || ""));
    deps.logger.audit?.("quran-teaching", (0, import_i18n3.t)("\u6559\u5E08\u91CD\u65B0\u751F\u6210\u9898\u76EE"), { paperId: p.id, questionId: payload?.questionId });
    return p;
  });
  import_electron2.ipcMain.handle(import_ipc_contracts.IPC_CHANNELS.WORKBENCH_QURAN_STUDENTS, async () => ensure(deps).listStudents());
  import_electron2.ipcMain.handle(import_ipc_contracts.IPC_CHANNELS.WORKBENCH_QURAN_SIMULATE, async (_e, payload) => {
    (0, import_shared.rateLimit)("QURAN_SIMULATE", 40);
    const records = ensure(deps).simulate(String(payload?.paperId || ""));
    deps.logger.audit?.("quran-teaching", (0, import_i18n3.t)("\u8F7D\u5165 5 \u540D\u6F14\u793A\u5B66\u751F\u7B54\u9898\u6570\u636E"), { paperId: payload?.paperId, records: records.length });
    return records;
  });
  import_electron2.ipcMain.handle(import_ipc_contracts.IPC_CHANNELS.WORKBENCH_QURAN_ANSWER_SET, async (_e, payload) => {
    const s = ensure(deps);
    const rec = s.setAnswer(String(payload?.paperId || ""), String(payload?.studentId || ""), String(payload?.questionId || ""), payload?.answer ?? null);
    const analysis = s.analyze(rec.paperId, lang(payload?.lang));
    deps.logger.audit?.("quran-teaching", (0, import_i18n3.t)("\u4FEE\u6539\u5B66\u751F\u7B54\u6848\u5E76\u91CD\u7B97"), { paperId: rec.paperId, studentId: rec.studentId, questionId: rec.questionId, correct: rec.correct });
    return { record: rec, analysis, records: s.records(rec.paperId) };
  });
  import_electron2.ipcMain.handle(import_ipc_contracts.IPC_CHANNELS.WORKBENCH_QURAN_ANALYZE, async (_e, payload) => {
    const s = ensure(deps);
    const id = String(payload?.paperId || "");
    const analysis = payload?.commentary ? await s.analyzeWithCommentary(id, lang(payload?.lang), !!payload?.force) : s.analyze(id, lang(payload?.lang));
    return { analysis, records: s.records(id) };
  });
  import_electron2.ipcMain.handle(import_ipc_contracts.IPC_CHANNELS.WORKBENCH_QURAN_REINFORCE, async (_e, payload) => {
    (0, import_shared.rateLimit)("QURAN_REINFORCE", 20);
    const r = ensure(deps).reinforce(String(payload?.paperId || ""), String(payload?.issueKey || ""), lang(payload?.lang));
    deps.logger.audit?.("quran-teaching", (0, import_i18n3.t)("\u751F\u6210\u5F3A\u5316\u6559\u5B66"), { reinforcementId: r.id, target: r.targetKey });
    return r;
  });
  import_electron2.ipcMain.handle(import_ipc_contracts.IPC_CHANNELS.WORKBENCH_QURAN_RETEST, async (_e, payload) => {
    const s = ensure(deps);
    const id = String(payload?.reinforcementId || "");
    const r = payload?.recompute ? s.recomputeAfter(id, lang(payload?.lang)) : s.retest(id, lang(payload?.lang));
    deps.logger.audit?.("quran-teaching", (0, import_i18n3.t)("\u590D\u6D4B\u5E76\u5BF9\u6BD4\u524D\u540E"), { reinforcementId: r.id, before: r.before.targetWrong, after: r.after?.targetWrong });
    return { reinforcement: r, records: s.records(r.retest.id) };
  });
  import_electron2.ipcMain.handle(import_ipc_contracts.IPC_CHANNELS.WORKBENCH_QURAN_CARD, async (_e, payload) => {
    (0, import_shared.rateLimit)("QURAN_CARD", 20);
    const kind = ["vocab", "concept_map", "timeline", "review", "structure"].includes(String(payload?.kind)) ? payload.kind : "vocab";
    const card = await ensure(deps).makeCard({ kind, chapter: Number(payload?.chapter), from: num(payload?.from), to: num(payload?.to), lang: lang(payload?.lang), useFal: !!payload?.useFal, focusRefs: Array.isArray(payload?.focusRefs) ? payload.focusRefs.map(String).slice(0, 6) : void 0, jobId: payload?.jobId ? String(payload.jobId).slice(0, 40) : void 0 });
    deps.logger.audit?.("quran-teaching", (0, import_i18n3.t)("\u751F\u6210\u6559\u5B66\u89C6\u89C9\u5361\u7247"), { id: card.id, kind: card.kind, background: card.background });
    return card;
  });
  import_electron2.ipcMain.handle(import_ipc_contracts.IPC_CHANNELS.WORKBENCH_QURAN_VIDEO_SCRIPT, async (_e, payload) => {
    (0, import_shared.rateLimit)("QURAN_SCRIPT", 20);
    const s = await ensure(deps).makeVideoScript({ chapter: Number(payload?.chapter), from: num(payload?.from), to: num(payload?.to), lang: lang(payload?.lang), polish: payload?.polish !== false });
    deps.logger.audit?.("quran-teaching", (0, import_i18n3.t)("\u751F\u6210\u89C6\u9891\u811A\u672C\u4E0E\u5206\u955C"), { id: s.id, scenes: s.scenes.length, generator: s.generator });
    return s;
  });
  import_electron2.ipcMain.handle(import_ipc_contracts.IPC_CHANNELS.WORKBENCH_QURAN_VIDEO_SAMPLE, async (_e, payload) => {
    (0, import_shared.rateLimit)("QURAN_VIDEO", 6);
    const v = await ensure(deps).makeVideoSample(String(payload?.scriptId || ""), payload?.jobId ? String(payload.jobId).slice(0, 40) : void 0);
    deps.logger.audit?.("quran-teaching", (0, import_i18n3.t)("\u5408\u6210\u89C6\u9891\u6837\u4F8B"), { id: v.id, durationSec: v.durationSec, voiceEngine: v.voiceEngine });
    return v;
  });
  import_electron2.ipcMain.handle(import_ipc_contracts.IPC_CHANNELS.WORKBENCH_QURAN_TTS, async (_e, payload) => {
    (0, import_shared.rateLimit)("QURAN_TTS", 20);
    const r = await ensure(deps).makeSpeech({ kind: payload?.kind === "teaching" ? "teaching" : "verse", chapter: Number(payload?.chapter), from: num(payload?.from), to: num(payload?.to), text: payload?.text ? String(payload.text) : void 0, lang: lang(payload?.lang) });
    deps.logger.audit?.("quran-teaching", (0, import_i18n3.t)("\u8BED\u97F3\u5408\u6210"), { id: r.id, kind: r.kind, engine: r.engine, fallback: r.fallback });
    return r;
  });
  import_electron2.ipcMain.handle(import_ipc_contracts.IPC_CHANNELS.WORKBENCH_QURAN_MEDIA, async () => {
    const s = ensure(deps).status();
    return { cards: s.cards, scripts: s.scripts, videos: s.videos };
  });
  import_electron2.ipcMain.handle(import_ipc_contracts.IPC_CHANNELS.WORKBENCH_QURAN_DASHBOARD, async (_e, payload) => ensure(deps).dashboard(lang(payload?.lang)));
  import_electron2.ipcMain.handle(import_ipc_contracts.IPC_CHANNELS.WORKBENCH_QURAN_STUDENT_ASK, async (_e, payload) => {
    (0, import_shared.rateLimit)("QURAN_ASK", 30);
    return ensure(deps).studentAsk(String(payload?.question || "").slice(0, 500), Number(payload?.chapter), num(payload?.from), num(payload?.to), lang(payload?.lang));
  });
  import_electron2.ipcMain.handle(import_ipc_contracts.IPC_CHANNELS.WORKBENCH_QURAN_RESET, async () => {
    ensure(deps).reset();
    lan(deps).releaseAll();
    deps.logger.audit?.("quran-teaching", (0, import_i18n3.t)("\u6E05\u7A7A\u6F14\u793A\u6570\u636E\uFF08\u4FDD\u7559\u8BED\u6599\uFF09"), {});
    return ensure(deps).status();
  });
  import_electron2.ipcMain.handle(import_ipc_contracts.IPC_CHANNELS.WORKBENCH_QURAN_LAN_STATUS, async () => lan(deps).status());
  import_electron2.ipcMain.handle(import_ipc_contracts.IPC_CHANNELS.WORKBENCH_QURAN_LAN_START, async () => {
    const st = await lan(deps).start();
    deps.logger.audit?.("quran-teaching", (0, import_i18n3.t)("\u542F\u52A8\u6821\u5185\u670D\u52A1"), { port: st.port });
    return st;
  });
  import_electron2.ipcMain.handle(import_ipc_contracts.IPC_CHANNELS.WORKBENCH_QURAN_LAN_STOP, async () => {
    await lan(deps).stop();
    return lan(deps).status();
  });
  import_electron2.ipcMain.handle(import_ipc_contracts.IPC_CHANNELS.WORKBENCH_QURAN_LAN_ROTATE, async () => lan(deps).rotateCode());
  import_electron2.ipcMain.handle(import_ipc_contracts.IPC_CHANNELS.WORKBENCH_QURAN_LAN_RELEASE, async () => {
    lan(deps).releaseAll();
    return lan(deps).status();
  });
  import_electron2.ipcMain.handle(import_ipc_contracts.IPC_CHANNELS.WORKBENCH_QURAN_LAN_LESSON, async (_e, payload) => lan(deps).setActiveLesson(
    { chapter: num(payload?.chapter), from: num(payload?.from), to: num(payload?.to) },
    lang(payload?.lang),
    String(payload?.planId || "")
  ));
  import_electron2.ipcMain.handle(import_ipc_contracts.IPC_CHANNELS.WORKBENCH_QURAN_LAN_PUBLISH, async (_e, payload) => (
    // 范围跟着卷子一起下发：学生端的「学习内容」按它取经文与单元，
    // 只换卷不换范围，学生会对着别章的经文做这一章的题
    lan(deps).setActivePaper(String(payload?.paperId || ""), lang(payload?.lang), {
      chapter: num(payload?.chapter),
      from: num(payload?.from),
      to: num(payload?.to)
    })
  ));
  return () => {
    const old = lanSvc;
    lanSvc = null;
    store = null;
    void old?.stop();
  };
}

// node_modules/.cache/solutions-build/workbench-quran-teaching/entry.main.ts
var hostApi = 2;
var registerFunction = "registerQuranTeachingHandlers";
var cleanup;
function activate(ctx) {
  cleanup = registerQuranTeachingHandlers(ctx.host.deps);
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
