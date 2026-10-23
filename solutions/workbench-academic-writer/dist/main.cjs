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

// ../../../../../../../../../Users/mac02/Desktop/work/new-work/totalclaw-qiye-app/apps/desktop-shell/node_modules/.cache/solutions-build/workbench-academic-writer/entry.main.ts
var entry_main_exports = {};
__export(entry_main_exports, {
  activate: () => activate,
  deactivate: () => deactivate,
  hostApi: () => hostApi,
  registerFunction: () => registerFunction
});
module.exports = __toCommonJS(entry_main_exports);

// ../../../../../../../../../Users/mac02/Desktop/work/new-work/totalclaw-solutions/solutions/workbench-academic-writer/src/main/ipc/academicWriter.ipc.ts
var import_electron = require("electron");
var import_node_fs2 = require("node:fs");
var import_node_path2 = require("node:path");
var import_ipc_contracts = require("npm:@totalclaw/ipc-contracts");
var import_i18n3 = require("npm:@totalclaw/i18n");
var import_userFacingError = require("host:apps/desktop-shell/src/main/utils/userFacingError.ts");
var import_workbenchLlm = require("host:apps/desktop-shell/src/main/services/workbenchLlm.ts");

// ../../../../../../../../../Users/mac02/Desktop/work/new-work/totalclaw-solutions/solutions/workbench-academic-writer/src/main/services/academicWriter/store.ts
var import_node_fs = require("node:fs");
var import_node_path = require("node:path");
var import_node_crypto = require("node:crypto");
var import_i18n = require("npm:@totalclaw/i18n");
var import_accountScope = require("host:apps/desktop-shell/src/main/services/accountScope.ts");
function newId(prefix) {
  return `${prefix}_${(0, import_node_crypto.randomUUID)().replace(/-/g, "").slice(0, 12)}`;
}
function defaultSettings() {
  return { outputDir: "", contactEmail: "", defaultSources: ["pubmed", "europepmc", "arxiv", "openalex"] };
}
function newProject(input = {}) {
  return {
    id: input.id || newId("awp"),
    title: String(input.title || (0, import_i18n.t)("\u672A\u547D\u540D\u8BBA\u6587")).trim(),
    field: String(input.field || ""),
    language: input.language === "en" ? "en" : "zh",
    style: input.style === "apa" || input.style === "ieee" ? input.style : "gbt7714",
    paperType: input.paperType || "review",
    requirements: String(input.requirements || ""),
    library: [],
    outline: [],
    sections: [],
    exports: [],
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
}
function normalize(raw) {
  const d = defaultSettings();
  const s = raw?.settings || {};
  const projects = Array.isArray(raw?.projects) ? raw.projects.filter((p) => p?.id).map((p) => ({ ...newProject(p), ...p, library: p.library || [], outline: p.outline || [], sections: p.sections || [], exports: p.exports || [] })) : [];
  if (!projects.length) projects.push(newProject());
  return {
    projects,
    activeProjectId: projects.some((p) => p.id === raw?.activeProjectId) ? raw.activeProjectId : projects[0].id,
    settings: { ...d, ...s, defaultSources: Array.isArray(s.defaultSources) && s.defaultSources.length ? s.defaultSources : d.defaultSources }
  };
}
var AcademicWriterStore = class {
  constructor(dirOf = () => (0, import_accountScope.accountPath)("academic-writer")) {
    this.dirOf = dirOf;
  }
  cache = null;
  cacheDir = "";
  file() {
    const d = this.dirOf();
    if (d !== this.cacheDir) {
      this.cache = null;
      this.cacheDir = d;
    }
    (0, import_node_fs.mkdirSync)(d, { recursive: true });
    return (0, import_node_path.join)(d, "state.json");
  }
  read() {
    const f = this.file();
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
    const s = this.read();
    const out = fn(s);
    const f = this.file();
    (0, import_node_fs.writeFileSync)(`${f}.tmp`, JSON.stringify(s), "utf-8");
    (0, import_node_fs.renameSync)(`${f}.tmp`, f);
    return out;
  }
  project(s = this.read()) {
    return s.projects.find((p) => p.id === s.activeProjectId) || s.projects[0];
  }
};

// ../../../../../../../../../Users/mac02/Desktop/work/new-work/totalclaw-solutions/solutions/workbench-academic-writer/src/main/services/academicWriter/sources.ts
var import_node_crypto2 = require("node:crypto");
var import_i18n2 = require("npm:@totalclaw/i18n");
var TIMEOUT_MS = 25e3;
function pid(source, sourceId) {
  return `p_${(0, import_node_crypto2.createHash)("sha1").update(`${source}:${sourceId}`).digest("hex").slice(0, 12)}`;
}
function stripTags(s) {
  return String(s ?? "").replace(/<\/(p|h\d|sec|jats:p|jats:sec|AbstractText)>/gi, "\n").replace(/<[^>]+>/g, " ").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&amp;/g, "&").replace(/[ \t\u00a0]+/g, " ").replace(/\s*\n\s*/g, "\n").trim();
}
function normDoi(doi) {
  return String(doi || "").trim().replace(/^https?:\/\/(dx\.)?doi\.org\//i, "").replace(/^doi:\s*/i, "").toLowerCase();
}
function normTitle(t) {
  return String(t || "").toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "");
}
function parsePubmedSummary(json, abstracts) {
  const r = json?.result || {};
  return (r.uids || []).map((uid) => {
    const d = r[uid] || {};
    const doi = (d.articleids || []).find((a) => a.idtype === "doi")?.value;
    return {
      id: pid("pubmed", uid),
      source: "pubmed",
      sourceId: uid,
      pmid: uid,
      title: stripTags(d.title).replace(/\.$/, ""),
      authors: (d.authors || []).filter((a) => a.authtype === "Author").map((a) => String(a.name)),
      journal: String(d.fulljournalname || d.source || ""),
      year: String(d.pubdate || "").slice(0, 4),
      volume: d.volume || void 0,
      issue: d.issue || void 0,
      pages: d.pages || void 0,
      doi: doi ? normDoi(doi) : void 0,
      url: `https://pubmed.ncbi.nlm.nih.gov/${uid}/`,
      abstract: abstracts[uid] || ""
    };
  }).filter((p) => p.title);
}
function parsePubmedAbstracts(xml) {
  const out = {};
  for (const art of String(xml || "").split(/<PubmedArticle>/).slice(1)) {
    const id = art.match(/<PMID[^>]*>(\d+)<\/PMID>/)?.[1];
    if (!id) continue;
    const parts = [...art.matchAll(/<AbstractText([^>]*)>([\s\S]*?)<\/AbstractText>/g)].map((m) => {
      const label = m[1].match(/Label="([^"]+)"/)?.[1];
      const body = stripTags(m[2]);
      return label ? `${label[0]}${label.slice(1).toLowerCase()}: ${body}` : body;
    });
    if (parts.length) out[id] = parts.join("\n");
  }
  return out;
}
function parseEuropePmc(json) {
  return (json?.resultList?.result || []).map((r) => {
    const ji = r.journalInfo || {};
    const urls = r.fullTextUrlList?.fullTextUrl || [];
    const pdf = urls.find((u) => u.documentStyle === "pdf" && /free|open/i.test(u.availability || ""))?.url;
    const sid = String(r.id || r.pmid || r.doi || "");
    return {
      id: pid("europepmc", sid),
      source: "europepmc",
      sourceId: sid,
      pmid: r.pmid || void 0,
      doi: r.doi ? normDoi(r.doi) : void 0,
      title: stripTags(r.title).replace(/\.$/, ""),
      authors: Array.isArray(r.authorList?.author) ? r.authorList.author.map((a) => String(a.fullName || `${a.lastName || ""} ${a.initials || ""}`).trim()) : String(r.authorString || "").replace(/\.$/, "").split(/,\s*/).filter(Boolean),
      journal: String(ji.journal?.title || r.journalTitle || r.bookOrReportDetails?.publisher || ""),
      year: String(r.pubYear || ""),
      volume: ji.volume || void 0,
      issue: ji.issue || void 0,
      pages: r.pageInfo || void 0,
      url: r.pmid ? `https://europepmc.org/article/MED/${r.pmid}` : r.doi ? `https://doi.org/${r.doi}` : `https://europepmc.org/search?query=${encodeURIComponent(sid)}`,
      pdfUrl: pdf,
      abstract: stripTags(r.abstractText),
      citedBy: r.citedByCount != null ? Number(r.citedByCount) : void 0,
      openAccess: r.isOpenAccess === "Y"
    };
  }).filter((p) => p.title);
}
function parseArxiv(xml) {
  const out = [];
  for (const e of String(xml || "").split(/<entry>/).slice(1)) {
    const tag = (n) => stripTags(e.match(new RegExp(`<${n}[^>]*>([\\s\\S]*?)</${n}>`))?.[1] || "");
    const absUrl = tag("id");
    const arxivId = absUrl.replace(/^https?:\/\/arxiv\.org\/abs\//, "");
    if (!arxivId) continue;
    const doi = e.match(/<arxiv:doi[^>]*>([^<]+)<\/arxiv:doi>/)?.[1];
    out.push({
      id: pid("arxiv", arxivId.replace(/v\d+$/, "")),
      source: "arxiv",
      sourceId: arxivId,
      arxivId,
      title: tag("title").replace(/\s+/g, " "),
      authors: [...e.matchAll(/<author>\s*<name>([^<]+)<\/name>/g)].map((m) => m[1].trim()),
      journal: stripTags(e.match(/<arxiv:journal_ref[^>]*>([^<]+)</)?.[1] || "") || "arXiv",
      year: tag("published").slice(0, 4),
      doi: doi ? normDoi(doi) : void 0,
      url: `https://arxiv.org/abs/${arxivId}`,
      pdfUrl: `https://arxiv.org/pdf/${arxivId}`,
      abstract: tag("summary").replace(/\s+/g, " "),
      openAccess: true
    });
  }
  return out;
}
function parseCrossref(json) {
  return (json?.message?.items || []).map((it) => {
    const doi = normDoi(it.DOI);
    const y = it.issued?.["date-parts"]?.[0]?.[0] ?? it.published?.["date-parts"]?.[0]?.[0];
    return {
      id: pid("crossref", doi),
      source: "crossref",
      sourceId: doi,
      doi,
      title: stripTags((it.title || [])[0] || ""),
      authors: (it.author || []).map((a) => [a.given, a.family].filter(Boolean).join(" ") || a.name || "").filter(Boolean),
      journal: String((it["container-title"] || [])[0] || ""),
      year: y ? String(y) : "",
      volume: it.volume || void 0,
      issue: it.issue || void 0,
      pages: it.page || void 0,
      url: `https://doi.org/${doi}`,
      abstract: stripTags(it.abstract),
      citedBy: it["is-referenced-by-count"] != null ? Number(it["is-referenced-by-count"]) : void 0
    };
  }).filter((p) => p.title && p.doi);
}
function invertedToText(idx) {
  if (!idx) return "";
  const words = [];
  for (const [w, pos] of Object.entries(idx)) for (const p of pos) words[p] = w;
  return words.filter((x) => x != null).join(" ");
}
function parseOpenAlex(json) {
  return (json?.results || []).map((w) => {
    const sid = String(w.id || "").replace("https://openalex.org/", "");
    const b = w.biblio || {};
    return {
      id: pid("openalex", sid),
      source: "openalex",
      sourceId: sid,
      doi: w.doi ? normDoi(w.doi) : void 0,
      title: stripTags(w.title || w.display_name || ""),
      authors: (w.authorships || []).map((a) => String(a.author?.display_name || "")).filter(Boolean),
      journal: String(w.primary_location?.source?.display_name || ""),
      year: w.publication_year ? String(w.publication_year) : "",
      volume: b.volume || void 0,
      issue: b.issue || void 0,
      pages: b.first_page ? b.last_page ? `${b.first_page}-${b.last_page}` : String(b.first_page) : void 0,
      url: w.doi || String(w.id || ""),
      pdfUrl: w.open_access?.oa_url || void 0,
      abstract: invertedToText(w.abstract_inverted_index),
      citedBy: w.cited_by_count != null ? Number(w.cited_by_count) : void 0,
      openAccess: !!w.open_access?.is_oa
    };
  }).filter((p) => p.title);
}
function keysOf(p) {
  return [p.doi && `doi:${normDoi(p.doi)}`, p.pmid && `pmid:${p.pmid}`, p.arxivId && `arxiv:${p.arxivId.replace(/v\d+$/, "")}`, `t:${normTitle(p.title)}`].filter(Boolean);
}
function mergePapers(lists) {
  const out = [];
  const index = /* @__PURE__ */ new Map();
  const rank = /* @__PURE__ */ new Map();
  for (const list of lists) {
    for (const [i, p] of list.entries()) {
      const hit = keysOf(p).map((k) => index.get(k)).find(Boolean);
      if (!hit) {
        const copy = { ...p, foundIn: [p.source] };
        out.push(copy);
        rank.set(copy, i);
        keysOf(copy).forEach((k) => index.set(k, copy));
        continue;
      }
      rank.set(hit, Math.min(rank.get(hit) ?? i, i));
      if (!hit.foundIn.includes(p.source)) hit.foundIn.push(p.source);
      for (const f of ["doi", "pmid", "arxivId", "volume", "issue", "pages", "pdfUrl", "journal", "year"]) if (!hit[f] && p[f]) hit[f] = p[f];
      if ((p.abstract || "").length > (hit.abstract || "").length) hit.abstract = p.abstract;
      if (!hit.authors.length && p.authors.length) hit.authors = p.authors;
      if (p.citedBy != null) hit.citedBy = Math.max(hit.citedBy ?? 0, p.citedBy);
      hit.openAccess = hit.openAccess || p.openAccess;
      keysOf(p).forEach((k) => index.set(k, hit));
    }
  }
  return out.map((p, order) => ({ p, order })).sort((a, b) => b.p.foundIn.length - a.p.foundIn.length || (rank.get(a.p) ?? 99) - (rank.get(b.p) ?? 99) || a.order - b.order).map((x) => x.p);
}
async function get(url, email, as) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: ctrl.signal, headers: { "User-Agent": `TotalClaw-AcademicWriter/1.0${email ? ` (mailto:${email})` : ""}`, Accept: as === "json" ? "application/json" : "*/*" } });
    if (res.status === 429) throw new Error((0, import_i18n2.t)("\u8BF7\u6C42\u592A\u9891\u7E41\uFF0C\u88AB\u9650\u6D41\u4E86\uFF0C\u7A0D\u7B49\u4E00\u4F1A\u513F\u518D\u67E5"));
    if (!res.ok) throw new Error((0, import_i18n2.t)("\u63A5\u53E3\u8FD4\u56DE {p0}", { p0: res.status }));
    return as === "json" ? await res.json() : await res.text();
  } catch (error) {
    if (error?.name === "AbortError") throw new Error((0, import_i18n2.t)("{p0} \u79D2\u6CA1\u6709\u54CD\u5E94", { p0: TIMEOUT_MS / 1e3 }));
    throw error;
  } finally {
    clearTimeout(timer);
  }
}
function arxivQuery(query) {
  const phrases = [...query.matchAll(/"([^"]+)"/g)].map((m) => `all:"${m[1]}"`);
  const words = query.replace(/"[^"]+"/g, " ").replace(/[()]/g, " ").split(/\s+/).filter((w) => w && !/^(and|or|not)$/i.test(w)).slice(0, 8).map((w) => `all:${w}`);
  return encodeURIComponent([...phrases, ...words].join(" AND ")).replace(/%20/g, "+");
}
async function searchSource(source, query, o) {
  const q = encodeURIComponent(query);
  const n = Math.max(1, Math.min(50, o.limit));
  const mail = o.email ? `&email=${encodeURIComponent(o.email)}` : "";
  if (source === "pubmed") {
    const term = o.yearFrom ? `${query} AND ${o.yearFrom}:3000[dp]` : query;
    const s = await get(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&retmode=json&sort=relevance&retmax=${n}&term=${encodeURIComponent(term)}&tool=totalclaw${mail}`, o.email, "json");
    const ids = s?.esearchresult?.idlist || [];
    if (!ids.length) return [];
    const [sum, xml] = await Promise.all([
      get(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&retmode=json&id=${ids.join(",")}&tool=totalclaw${mail}`, o.email, "json"),
      get(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&rettype=abstract&retmode=xml&id=${ids.join(",")}&tool=totalclaw${mail}`, o.email, "text")
    ]);
    return parsePubmedSummary(sum, parsePubmedAbstracts(xml));
  }
  if (source === "europepmc") {
    const qq = o.yearFrom ? `${query} AND PUB_YEAR:[${o.yearFrom} TO 3000]` : query;
    return parseEuropePmc(await get(`https://www.ebi.ac.uk/europepmc/webservices/rest/search?format=json&resultType=core&pageSize=${n}&query=${encodeURIComponent(qq)}${mail}`, o.email, "json"));
  }
  if (source === "arxiv") {
    const xml = await get(`https://export.arxiv.org/api/query?search_query=${arxivQuery(query)}&max_results=${n}&sortBy=relevance`, o.email, "text");
    return parseArxiv(xml).filter((p) => !o.yearFrom || Number(p.year) >= o.yearFrom);
  }
  if (source === "crossref") {
    const f = `type:journal-article${o.yearFrom ? `,from-pub-date:${o.yearFrom}` : ""}`;
    return parseCrossref(await get(`https://api.crossref.org/works?query.bibliographic=${q}&rows=${n}&filter=${f}&select=DOI,title,author,container-title,issued,published,volume,issue,page,abstract,is-referenced-by-count${o.email ? `&mailto=${encodeURIComponent(o.email)}` : ""}`, o.email, "json"));
  }
  const filter = o.yearFrom ? `&filter=from_publication_date:${o.yearFrom}-01-01` : "";
  return parseOpenAlex(await get(`https://api.openalex.org/works?search=${q}&per-page=${n}${filter}&select=id,doi,title,display_name,authorships,primary_location,publication_year,biblio,abstract_inverted_index,cited_by_count,open_access${o.email ? `&mailto=${encodeURIComponent(o.email)}` : ""}`, o.email, "json"));
}
async function doiExists(doi, email) {
  try {
    await get(`https://api.crossref.org/works/${encodeURIComponent(normDoi(doi))}`, email, "json");
    return true;
  } catch (error) {
    if (/404/.test(error.message)) return false;
    throw error;
  }
}
function sourceLabel(s) {
  return { pubmed: "PubMed", europepmc: "Europe PMC", arxiv: "arXiv", crossref: "Crossref", openalex: "OpenAlex", web: (0, import_i18n2.t)("\u7F51\u9875\u6293\u53D6") }[s];
}

// ../../../../../../../../../Users/mac02/Desktop/work/new-work/totalclaw-solutions/solutions/workbench-academic-writer/src/main/services/academicWriter/citationWords.json
var citationWords_default = { _note: "\u53C2\u8003\u6587\u732E\u683C\u5F0F\u91CC\u7684\u56FA\u5B9A\u7528\u5B57\uFF08GB/T 7714 \u4E2D\u6587\u6587\u732E\u7684\u300C\u7B49\u300D\uFF09\uFF0C\u662F\u683C\u5F0F\u89C4\u8303\u4E0D\u662F\u754C\u9762\u6587\u6848\uFF0C\u4E0D\u8FDB i18n \u8BCD\u5178\u3002", etalZh: "\u7B49" };

// ../../../../../../../../../Users/mac02/Desktop/work/new-work/totalclaw-solutions/solutions/workbench-academic-writer/src/main/services/academicWriter/citations.ts
var CITE_RE = /\[(\d+(?:\s*[-–—,，、]\s*\d+)*)\]/g;
function expand(group) {
  const out = [];
  for (const part of group.split(/[,，、]/)) {
    const m = part.trim().match(/^(\d+)\s*[-–—]\s*(\d+)$/);
    if (m) {
      const a = Number(m[1]);
      const b = Number(m[2]);
      if (b >= a && b - a <= 50) for (let i = a; i <= b; i++) out.push(i);
    } else if (/^\d+$/.test(part.trim())) out.push(Number(part.trim()));
  }
  return out;
}
function extractCites(text, librarySize) {
  const order = [];
  const bad = [];
  for (const m of String(text || "").matchAll(CITE_RE)) {
    for (const n of expand(m[1])) {
      if (n < 1 || n > librarySize) {
        if (!bad.includes(n)) bad.push(n);
        continue;
      }
      if (!order.includes(n)) order.push(n);
    }
  }
  return { order, bad };
}
function isCjk(s) {
  return /[一-鿿]/.test(s);
}
function initials(given) {
  return given.split(/[\s-]+/).filter(Boolean).map((g) => `${g[0].toUpperCase()}`).join(" ");
}
function splitName(name) {
  const n = name.trim();
  if (isCjk(n)) return { family: n, given: "" };
  const pubmed = n.match(/^([\p{L}'’\- ]+?)\s+([A-Z]{1,3})$/u);
  if (pubmed) return { family: pubmed[1], given: pubmed[2].split("").join(" ") };
  const parts = n.split(/\s+/);
  if (parts.length === 1) return { family: n, given: "" };
  return { family: parts[parts.length - 1], given: initials(parts.slice(0, -1).join(" ")) };
}
function gbAuthors(authors) {
  const list = authors.slice(0, 3).map((a) => {
    const { family, given } = splitName(a);
    return isCjk(family) ? family : `${family.toUpperCase()} ${given.replace(/\s/g, " ")}`.trim();
  });
  if (!list.length) return "";
  const etal = authors.length > 3 ? authors.some(isCjk) ? `, ${citationWords_default.etalZh}` : ", et al" : "";
  return `${list.join(", ")}${etal}`;
}
function apaAuthors(authors) {
  const list = authors.map((a) => {
    const { family, given } = splitName(a);
    return given ? `${family}, ${given.split(" ").map((g) => `${g}.`).join(" ")}` : family;
  });
  if (list.length <= 2) return list.join(" & ");
  if (list.length > 20) return `${list.slice(0, 19).join(", ")}, \u2026 ${list[list.length - 1]}`;
  return `${list.slice(0, -1).join(", ")}, & ${list[list.length - 1]}`;
}
function ieeeAuthors(authors) {
  const list = authors.slice(0, 6).map((a) => {
    const { family, given } = splitName(a);
    return given ? `${given.split(" ").map((g) => `${g}.`).join(" ")} ${family}` : family;
  });
  if (authors.length > 6) return `${list[0]} et al.`;
  return list.length <= 2 ? list.join(" and ") : `${list.slice(0, -1).join(", ")}, and ${list[list.length - 1]}`;
}
function gbType(p) {
  return p.source === "arxiv" && (!p.journal || p.journal === "arXiv") ? "[EB/OL]" : "[J]";
}
function formatReference(p, style, n) {
  const doi = p.doi ? `DOI: ${p.doi}` : "";
  if (style === "apa") {
    const vol = p.volume ? `, ${p.volume}${p.issue ? `(${p.issue})` : ""}` : "";
    const pages = p.pages ? `, ${p.pages}` : "";
    const link = p.doi ? ` https://doi.org/${p.doi}` : p.url ? ` ${p.url}` : "";
    return `${apaAuthors(p.authors)} (${p.year || "n.d."}). ${p.title}. ${p.journal ? `${p.journal}` : ""}${vol}${pages}.${link}`.replace(/\s+\./g, ".");
  }
  if (style === "ieee") {
    const parts = [`${ieeeAuthors(p.authors)}, "${p.title},"`, p.journal ? `${p.journal},` : "", p.volume ? `vol. ${p.volume},` : "", p.issue ? `no. ${p.issue},` : "", p.pages ? `pp. ${p.pages},` : "", `${p.year}${p.doi ? "," : "."}`, p.doi ? `doi: ${p.doi}.` : ""];
    return `[${n ?? ""}] ${parts.filter(Boolean).join(" ")}`;
  }
  const tail = gbType(p) === "[EB/OL]" ? `${p.year}. ${p.url}` : `${p.journal}, ${p.year}${p.volume ? `, ${p.volume}` : ""}${p.issue ? `(${p.issue})` : ""}${p.pages ? `: ${p.pages}` : ""}`;
  return `[${n ?? ""}] ${gbAuthors(p.authors)}. ${p.title}${gbType(p)}. ${tail}.${doi ? ` ${doi}.` : ""}`.replace(/\.\./g, ".");
}
function apaInText(p) {
  const fam = (a) => splitName(a).family;
  const who = p.authors.length === 0 ? p.title.slice(0, 20) : p.authors.length === 1 ? fam(p.authors[0]) : p.authors.length === 2 ? `${fam(p.authors[0])} & ${fam(p.authors[1])}` : `${fam(p.authors[0])} et al.`;
  return `${who}, ${p.year || "n.d."}`;
}
function renderManuscript(text, library, style) {
  const { order, bad } = extractCites(text, library.length);
  const newNo = new Map(order.map((lib, i) => [lib, i + 1]));
  const out = String(text || "").replace(CITE_RE, (_m, group) => {
    const nums = expand(group);
    if (style === "apa") {
      const good = nums.filter((n) => newNo.has(n)).map((n) => apaInText(library[n - 1]));
      const badPart = nums.filter((n) => !newNo.has(n)).map((n) => `?${n}`);
      return `(${[...good, ...badPart].join("; ")})`;
    }
    return `[${nums.map((n) => newNo.has(n) ? String(newNo.get(n)) : `?${n}`).join(", ")}]`;
  });
  const refs = order.map((lib, i) => formatReference(library[lib - 1], style, i + 1));
  if (style === "apa") refs.sort((a, b) => a.localeCompare(b));
  return { text: out, references: refs, order, bad };
}
function toBibtex(p) {
  const first = splitName(p.authors[0] || "anon").family.replace(/[^A-Za-z]/g, "").toLowerCase() || "ref";
  const key = `${first}${p.year || ""}${normalizeKeyWord(p.title)}`;
  const fields = [
    ["title", p.title],
    ["author", p.authors.join(" and ")],
    ["journal", p.journal],
    ["year", p.year],
    ["volume", p.volume],
    ["number", p.issue],
    ["pages", p.pages?.replace("-", "--")],
    ["doi", p.doi],
    ["url", p.url]
  ];
  const type = p.source === "arxiv" && (!p.journal || p.journal === "arXiv") ? "misc" : "article";
  return `@${type}{${key},
${fields.filter(([, v]) => v).map(([k, v]) => `  ${k} = {${String(v).replace(/[{}]/g, "")}}`).join(",\n")}
}`;
}
function normalizeKeyWord(title) {
  return (String(title).match(/[A-Za-z]{4,}/)?.[0] || "").toLowerCase();
}
function wordCount(text) {
  const t = String(text || "");
  const cjk = (t.match(/[一-鿿]/g) || []).length;
  const latin = (t.replace(/[一-鿿]/g, " ").match(/[A-Za-z0-9]+/g) || []).length;
  return cjk + latin;
}

// ../../../../../../../../../Users/mac02/Desktop/work/new-work/totalclaw-solutions/solutions/workbench-academic-writer/src/main/ipc/academicWriter.ipc.ts
var import_openWithApps = require("host:apps/desktop-shell/src/main/services/openWithApps.ts");

// ../../../../../../../../../Users/mac02/Desktop/work/new-work/totalclaw-solutions/solutions/workbench-academic-writer/src/main/services/academicWriter/prompts.ts
var JSON_ONLY = "\u53EA\u8F93\u51FA\u4E00\u4E2A JSON \u5BF9\u8C61\uFF0C\u4E0D\u8981 Markdown \u4EE3\u7801\u5757\uFF0C\u4E0D\u8981\u89E3\u91CA\u3002";
var TYPE_LABEL = { review: "\u7EFC\u8FF0", research: "\u7814\u7A76\u8BBA\u6587", thesis: "\u5B66\u4F4D\u8BBA\u6587", proposal: "\u5F00\u9898\u62A5\u544A" };
function lang(p) {
  return p.language === "en" ? "\u7528\u82F1\u6587\uFF08\u5B66\u672F\u82F1\u8BED\uFF09\u5199" : "\u7528\u4E2D\u6587\uFF08\u89C4\u8303\u5B66\u672F\u4E2D\u6587\uFF09\u5199";
}
function queryPrompt(topic, field) {
  return [
    "\u4F60\u662F\u79D1\u7814\u9986\u5458\uFF0C\u5E2E\u4F5C\u8005\u4E3A\u4E0B\u9762\u7684\u9009\u9898\u8BBE\u8BA1\u6587\u732E\u68C0\u7D22\u5F0F\uFF0C\u7528\u4E8E PubMed / Europe PMC / arXiv / Crossref / OpenAlex \u8FD9\u4E9B\u82F1\u6587\u5B66\u672F\u5E93\u3002",
    `\u9009\u9898\uFF1A${topic}`,
    field ? `\u5B66\u79D1\u9886\u57DF\uFF1A${field}` : "",
    "\u7ED9\u51FA 3\uFF5E5 \u6761\u82F1\u6587\u68C0\u7D22\u5F0F\uFF1A\u6BCF\u6761\u8986\u76D6\u9009\u9898\u7684\u4E00\u4E2A\u4FA7\u9762\uFF08\u6838\u5FC3\u6982\u5FF5\u3001\u65B9\u6CD5\u3001\u5E94\u7528\u573A\u666F\u3001\u7EFC\u8FF0\u7C7B\uFF09\uFF0C\u7528\u5E38\u89C1\u7684\u540C\u4E49\u8BCD\u548C OR / AND \u7EC4\u5408\uFF0C\u4E0D\u8981\u592A\u957F\uFF0810 \u4E2A\u8BCD\u4EE5\u5185\uFF09\u3002",
    "\u53E6\u7ED9 3\uFF5E6 \u4E2A\u4E2D\u6587\u5173\u952E\u8BCD\uFF0C\u65B9\u4FBF\u4F5C\u8005\u53BB\u77E5\u7F51\u3001\u4E07\u65B9\u68C0\u7D22\u3002",
    JSON_ONLY,
    '\u683C\u5F0F\uFF1A{"queries":[{"query":"","purpose":"\u8FD9\u6761\u68C0\u7D22\u5F0F\u67E5\u4EC0\u4E48\uFF08\u4E2D\u6587\u4E00\u53E5\u8BDD\uFF09"}],"zhKeywords":[""]}'
  ].filter(Boolean).join("\n");
}
function readPrompt(p, paper, text) {
  return [
    `\u4F60\u5728\u5E2E\u4F5C\u8005\u7CBE\u8BFB\u4E00\u7BC7\u6587\u732E\uFF0C\u670D\u52A1\u4E8E\u300C${p.title}\u300D\u8FD9\u7BC7${TYPE_LABEL[p.paperType] || "\u8BBA\u6587"}\u3002${lang(p)}\u3002`,
    "\u6839\u636E\u4E0B\u9762\u7684\u539F\u6587\uFF08\u901A\u5E38\u662F\u6458\u8981\uFF09\u63D0\u70BC\u56DB\u9879\uFF1A\u7814\u7A76\u95EE\u9898 question\u3001\u65B9\u6CD5 method\u3001\u4E3B\u8981\u53D1\u73B0 findings\u3001\u5C40\u9650 limitations\u3002",
    "\u6BCF\u9879\u518D\u7ED9\u4E00\u53E5\u652F\u6491\u5B83\u7684\u539F\u6587\u5F15\u7528 quote\uFF1A\u5FC5\u987B\u662F\u539F\u6587\u91CC\u9010\u5B57\u8FDE\u7EED\u7684\u4E00\u6BB5\uFF08\u4E0D\u8D85\u8FC7 60 \u4E2A\u8BCD\uFF09\uFF0C\u4E0D\u80FD\u6539\u5199\uFF1B\u539F\u6587\u91CC\u6CA1\u6709\u4F9D\u636E\u7684\u9879\u5199\u300C\u6458\u8981\u672A\u63D0\u53CA\u300D\uFF0Cquote \u7559\u7A7A\u3002",
    "\u4E0D\u8981\u8865\u5145\u539F\u6587\u6CA1\u6709\u7684\u6570\u5B57\u3001\u6837\u672C\u91CF\u3001\u7ED3\u8BBA\u3002",
    JSON_ONLY,
    '\u683C\u5F0F\uFF1A{"question":"","method":"","findings":"","limitations":"","quotes":[{"field":"question|method|findings|limitations","quote":""}]}',
    `--- \u6587\u732E\uFF1A${paper.title}\uFF08${paper.authors.slice(0, 3).join(", ")}${paper.authors.length > 3 ? " \u7B49" : ""}\uFF0C${paper.journal} ${paper.year}\uFF09 ---`,
    text.slice(0, 12e3)
  ].join("\n");
}
function libraryBlock(library, ids) {
  return library.map((x, i) => ({ x, n: i + 1 })).filter(({ x }) => !ids || ids.includes(x.id)).map(({ x, n }) => {
    const s = x.summary;
    const brief = s ? `\u95EE\u9898\uFF1A${s.question}\uFF1B\u65B9\u6CD5\uFF1A${s.method}\uFF1B\u53D1\u73B0\uFF1A${s.findings}\uFF1B\u5C40\u9650\uFF1A${s.limitations}` : (x.abstract || "").slice(0, 700);
    return `[${n}] ${x.title}\uFF08${x.authors[0] || ""}${x.authors.length > 1 ? " \u7B49" : ""}, ${x.year}, ${x.journal}\uFF09
${brief}`;
  }).join("\n\n");
}
function outlinePrompt(p) {
  return [
    `\u4E3A\u4E00\u7BC7${TYPE_LABEL[p.paperType] || "\u8BBA\u6587"}\u62DF\u63D0\u7EB2\u3002\u9898\u76EE\uFF1A\u300C${p.title}\u300D${p.field ? `\uFF0C\u9886\u57DF\uFF1A${p.field}` : ""}\u3002${lang(p)}\u3002`,
    p.requirements ? `\u4F5C\u8005\u7684\u8981\u6C42\uFF1A${p.requirements}` : "",
    "\u53EA\u80FD\u4F9D\u636E\u4E0B\u9762\u6587\u732E\u5E93\u91CC\u7684\u6587\u732E\u7EC4\u7EC7\u5185\u5BB9\u3002\u6BCF\u8282\u7ED9 3\uFF5E6 \u4E2A\u8981\u70B9\uFF0C\u5E76\u5217\u51FA\u8FD9\u4E00\u8282\u8981\u5F15\u7528\u7684\u6587\u732E\u7F16\u53F7\uFF08\u53EA\u80FD\u7528\u4E0B\u9762\u51FA\u73B0\u7684 [n]\uFF09\u3002",
    p.paperType === "review" ? "\u7EFC\u8FF0\u7ED3\u6784\u53C2\u8003\uFF1A\u5F15\u8A00\uFF08\u80CC\u666F\u4E0E\u610F\u4E49\uFF09\u2192 \u6309\u4E3B\u9898 / \u65B9\u6CD5\u5206\u7684\u82E5\u5E72\u8282\uFF08\u6BD4\u8F83\u3001\u6F14\u8FDB\u3001\u4E89\u8BAE\uFF09\u2192 \u6311\u6218\u4E0E\u5C55\u671B \u2192 \u7ED3\u8BBA\u3002" : "",
    p.paperType === "research" ? "\u7814\u7A76\u8BBA\u6587\u7ED3\u6784\u53C2\u8003\uFF1A\u5F15\u8A00 \u2192 \u76F8\u5173\u5DE5\u4F5C \u2192 \u65B9\u6CD5 \u2192 \u5B9E\u9A8C / \u7ED3\u679C\uFF08\u8FD9\u91CC\u53EA\u5199\u8981\u505A\u4EC0\u4E48\uFF0C\u7ED3\u679C\u7531\u4F5C\u8005\u586B\uFF09\u2192 \u8BA8\u8BBA \u2192 \u7ED3\u8BBA\u3002" : "",
    p.paperType === "proposal" ? "\u5F00\u9898\u62A5\u544A\u7ED3\u6784\u53C2\u8003\uFF1A\u9009\u9898\u80CC\u666F\u4E0E\u610F\u4E49 \u2192 \u56FD\u5185\u5916\u7814\u7A76\u73B0\u72B6 \u2192 \u7814\u7A76\u5185\u5BB9\u4E0E\u76EE\u6807 \u2192 \u7814\u7A76\u65B9\u6CD5\u4E0E\u6280\u672F\u8DEF\u7EBF \u2192 \u521B\u65B0\u70B9 \u2192 \u8FDB\u5EA6\u5B89\u6392 \u2192 \u9884\u671F\u6210\u679C\u3002" : "",
    JSON_ONLY,
    '\u683C\u5F0F\uFF1A{"sections":[{"heading":"","points":[""],"cites":[1,2]}]}',
    "--- \u6587\u732E\u5E93 ---",
    libraryBlock(p.library)
  ].filter(Boolean).join("\n");
}
function sectionPrompt(p, heading, points, citeIds, allHeadings) {
  return [
    `\u4F60\u5728\u548C\u4F5C\u8005\u4E00\u8D77\u5199\u300C${p.title}\u300D\uFF08${TYPE_LABEL[p.paperType] || "\u8BBA\u6587"}\uFF09\u3002${lang(p)}\u3002\u73B0\u5728\u53EA\u5199\u5176\u4E2D\u4E00\u8282\uFF1A\u300C${heading}\u300D\u3002`,
    `\u5168\u6587\u7684\u8282\u6807\u9898\u4F9D\u6B21\u662F\uFF1A${allHeadings.join(" / ")}\u3002\u672C\u8282\u4E0D\u8981\u91CD\u590D\u5176\u5B83\u8282\u7684\u5185\u5BB9\u3002`,
    points.length ? `\u672C\u8282\u8981\u70B9\uFF1A
${points.map((x) => `- ${x}`).join("\n")}` : "",
    p.requirements ? `\u4F5C\u8005\u7684\u8981\u6C42\uFF1A${p.requirements}` : "",
    "\u5199\u4F5C\u89C4\u5219\uFF1A",
    "- \u9700\u8981\u4F9D\u636E\u7684\u9648\u8FF0\uFF0C\u5728\u53E5\u672B\u7528\u6587\u732E\u7F16\u53F7\u6807\u6CE8\uFF0C\u5982 [3] \u6216 [2, 5]\uFF1B\u7F16\u53F7\u53EA\u80FD\u7528\u4E0B\u9762\u6E05\u5355\u91CC\u7684\uFF0C\u7EDD\u4E0D\u7F16\u9020\u6587\u732E\u6216\u7F16\u53F7\uFF1B",
    "- \u4E0D\u7F16\u9020\u6570\u636E\u3001\u6837\u672C\u91CF\u3001\u5B9E\u9A8C\u7ED3\u679C\u3001\u767E\u5206\u6BD4\uFF1B\u6E05\u5355\u91CC\u6CA1\u6709\u4F9D\u636E\u53C8\u5FC5\u987B\u5199\u7684\uFF0C\u5199\u300C\uFF08\u9700\u8865\u5145\u6587\u732E\uFF09\u300D\u6216\u300C\uFF08\u5F85\u4F5C\u8005\u8865\u5145\u6570\u636E\uFF09\u300D\u5360\u4F4D\uFF1B",
    "- \u6BB5\u843D\u5F0F\u5B66\u672F\u5199\u4F5C\uFF0C\u4E0D\u7528\u5217\u8868\u5806\u780C\uFF1B\u672C\u8282 400\uFF5E900 \u5B57\uFF08\u82F1\u6587 300\uFF5E700 \u8BCD\uFF09\uFF1B",
    "- \u53EA\u8F93\u51FA\u672C\u8282\u6B63\u6587\uFF0C\u4E0D\u8981\u91CD\u590D\u8282\u6807\u9898\uFF0C\u4E0D\u8981\u8F93\u51FA\u53C2\u8003\u6587\u732E\u8868\u3002",
    "--- \u53EF\u5F15\u7528\u7684\u6587\u732E ---",
    libraryBlock(p.library, citeIds.length ? citeIds : void 0)
  ].filter(Boolean).join("\n");
}
function webExtractPrompt(url, text) {
  return [
    "\u4E0B\u9762\u662F\u4F5C\u8005\u5728\u5B66\u672F\u7F51\u7AD9\uFF08\u77E5\u7F51\u3001\u4E07\u65B9\u3001\u671F\u520A\u5B98\u7F51\u3001Google Scholar \u7B49\uFF09\u6253\u5F00\u7684\u4E00\u4E2A\u6587\u732E\u9875\u9762\u7684\u6587\u5B57\u3002\u628A\u8FD9\u7BC7\u6587\u732E\u7684\u9898\u5F55\u4FE1\u606F\u6284\u51FA\u6765\u3002",
    "\u6BCF\u4E2A\u503C\u5FC5\u987B\u80FD\u5728\u9875\u9762\u6587\u5B57\u91CC\u539F\u6837\u627E\u5230\uFF1B\u627E\u4E0D\u5230\u7684\u586B\u7A7A\u5B57\u7B26\u4E32\uFF0C\u4E0D\u8981\u731C\u3002authors \u662F\u4F5C\u8005\u540D\u6570\u7EC4\uFF1Byear \u56DB\u4F4D\u5E74\u4EFD\uFF1Babstract \u662F\u6458\u8981\u539F\u6587\uFF08\u4E0D\u8981\u6539\u5199\u3001\u4E0D\u8981\u7FFB\u8BD1\uFF09\u3002",
    '\u5982\u679C\u9875\u9762\u662F\u68C0\u7D22\u7ED3\u679C\u5217\u8868\u800C\u4E0D\u662F\u5355\u7BC7\u6587\u732E\u8BE6\u60C5\uFF0C\u8FD4\u56DE {"notArticle": true}\u3002',
    JSON_ONLY,
    '\u683C\u5F0F\uFF1A{"title":"","authors":[""],"journal":"","year":"","volume":"","issue":"","pages":"","doi":"","abstract":""}',
    `--- \u9875\u9762 ${url} ---`,
    text.slice(0, 8e3)
  ].join("\n");
}

// ../../../../../../../../../Users/mac02/Desktop/work/new-work/totalclaw-solutions/solutions/workbench-academic-writer/src/main/ipc/academicWriter.ipc.ts
var import_brandPaths = require("host:apps/desktop-shell/src/main/services/brandPaths.ts");
var store = new AcademicWriterStore();
var ACADEMIC_BROWSER_CONTEXT = "academic-writer";
function norm(s) {
  return String(s || "").toLowerCase().replace(/[\s\p{P}\p{S}]+/gu, "");
}
function foundIn(corpus, quote) {
  const q = norm(quote || "");
  return q.length >= 4 && norm(corpus).includes(q);
}
function safeName(s) {
  return String(s || "").replace(/[\\/:*?"<>|\r\n]/g, "_").trim().slice(0, 60) || "paper";
}
function registerAcademicWriterHandlers(deps) {
  const logger = deps.logger;
  const win = () => deps.getMainWindow?.() ?? null;
  const broadcast = (type, payload) => {
    try {
      win()?.webContents.send(import_ipc_contracts.IPC_CHANNELS.WORKBENCH_AW_EVENT, { type, payload });
    } catch {
    }
  };
  const progress = (key, message) => broadcast("progress", { key, message });
  const pushState = () => broadcast("state");
  const outputRoot = () => {
    const s = store.read().settings;
    const root = s.outputDir && (0, import_node_fs2.existsSync)(s.outputDir) ? s.outputDir : (0, import_node_path2.join)(import_electron.app.getPath("documents"), (0, import_brandPaths.documentsFolderName)(), (0, import_i18n3.t)("\u5B66\u672F\u5199\u4F5C"));
    (0, import_node_fs2.mkdirSync)(root, { recursive: true });
    return root;
  };
  const publicState = () => ({ ...store.read(), outputDir: outputRoot() });
  const models = (0, import_workbenchLlm.createWorkbenchLlm)(deps, { logTag: "academic-writer", moduleModel: () => "" });
  const llmJson = (m, prompt, timeoutMs) => models.llmJson(m, prompt, timeoutMs);
  const llm = (m, prompt, timeoutMs) => models.llm(m, prompt, timeoutMs);
  const project = () => store.project();
  const mutateProject = (fn) => store.update((s) => fn(store.project(s), s));
  const need = (v, what) => {
    if (v == null) throw new Error((0, import_i18n3.t)("{p0}\u4E0D\u5B58\u5728\u6216\u5DF2\u5220\u9664", { p0: what }));
    return v;
  };
  const draftText = (p) => p.manuscript?.trim() ? p.manuscript : [`# ${p.title}`, ...p.sections.filter((x) => x.text.trim()).map((x) => `## ${x.heading}

${x.text.trim()}`)].join("\n\n");
  const renderedBody = (pr) => {
    const r = renderManuscript(draftText(pr), pr.library, pr.style);
    const refTitle = pr.language === "en" ? "References" : (0, import_i18n3.t)("\u53C2\u8003\u6587\u732E");
    return `${r.text.trim()}

## ${refTitle}

${r.references.join("\n\n")}
`;
  };
  const listedApps = /* @__PURE__ */ new Map();
  const isOwnExport = (path) => store.read().projects.some((p) => p.exports.some((e) => e.path === path));
  const actions = {
    "state.get": () => publicState(),
    "settings.patch": (p) => {
      const out = store.update((s) => {
        for (const [k, v] of Object.entries(p?.patch || {})) {
          const cur = s.settings[k];
          s.settings[k] = cur && typeof cur === "object" && !Array.isArray(cur) && v && typeof v === "object" && !Array.isArray(v) ? { ...cur, ...v } : v;
        }
        return s.settings;
      });
      pushState();
      return out;
    },
    "outputDir.pick": async () => {
      const r = await import_electron.dialog.showOpenDialog(win(), { properties: ["openDirectory", "createDirectory"] });
      if (r.canceled || !r.filePaths[0]) return null;
      store.update((s) => {
        s.settings.outputDir = r.filePaths[0];
      });
      pushState();
      return r.filePaths[0];
    },
    "path.open": async (p) => {
      if (!p?.path || !(0, import_node_fs2.existsSync)(p.path)) throw new Error((0, import_i18n3.t)("\u6587\u4EF6\u4E0D\u5B58\u5728"));
      if (p.reveal) {
        import_electron.shell.showItemInFolder(p.path);
        return true;
      }
      const err = await import_electron.shell.openPath(p.path);
      if (err) throw new Error(err);
      return true;
    },
    "openIn.apps": async (p) => {
      if (!isOwnExport(p?.path) || !(0, import_node_fs2.existsSync)(p.path)) throw new Error((0, import_i18n3.t)("\u6587\u4EF6\u4E0D\u5B58\u5728"));
      const apps = await (0, import_openWithApps.appsForFile)(p.path);
      listedApps.set(p.path, apps);
      return apps;
    },
    "openIn.open": async (p) => {
      if (!isOwnExport(p?.path) || !(0, import_node_fs2.existsSync)(p.path)) throw new Error((0, import_i18n3.t)("\u6587\u4EF6\u4E0D\u5B58\u5728"));
      if (!(listedApps.get(p.path) || []).some((a) => a.path === p.appPath)) throw new Error((0, import_i18n3.t)("\u8BF7\u4ECE\u5217\u8868\u91CC\u9009\u62E9\u5E94\u7528"));
      await (0, import_openWithApps.openWithApp)(p.path, p.appPath);
      return true;
    },
    "openIn.choose": async (p) => {
      if (!isOwnExport(p?.path) || !(0, import_node_fs2.existsSync)(p.path)) throw new Error((0, import_i18n3.t)("\u6587\u4EF6\u4E0D\u5B58\u5728"));
      const r = await import_electron.dialog.showOpenDialog(win(), { title: (0, import_i18n3.t)("\u9009\u62E9\u6253\u5F00\u6587\u6863\u7684\u5E94\u7528"), properties: ["openFile"], ...process.platform === "win32" ? { filters: [{ name: (0, import_i18n3.t)("\u5E94\u7528\u7A0B\u5E8F"), extensions: ["exe"] }] } : { defaultPath: "/Applications" } });
      if (r.canceled || !r.filePaths[0]) return false;
      await (0, import_openWithApps.openWithApp)(p.path, r.filePaths[0]);
      return true;
    },
    // 论文项目
    "project.create": (p) => {
      const pr = newProject(p?.input || {});
      store.update((s) => {
        s.projects.unshift(pr);
        s.activeProjectId = pr.id;
      });
      pushState();
      return pr;
    },
    "project.switch": (p) => {
      store.update((s) => {
        need(s.projects.find((x) => x.id === p.id), (0, import_i18n3.t)("\u8BBA\u6587\u9879\u76EE"));
        s.activeProjectId = p.id;
      });
      pushState();
      return true;
    },
    "project.update": (p) => {
      const out = mutateProject((pr) => {
        for (const k of ["title", "field", "language", "style", "paperType", "requirements"]) if (p?.patch?.[k] !== void 0) pr[k] = p.patch[k];
        return pr;
      });
      pushState();
      return out;
    },
    "project.remove": (p) => {
      store.update((s) => {
        s.projects = s.projects.filter((x) => x.id !== p.id);
        if (!s.projects.length) s.projects.push(newProject());
        if (!s.projects.some((x) => x.id === s.activeProjectId)) s.activeProjectId = s.projects[0].id;
      });
      pushState();
      return true;
    },
    // ① 检索
    "query.suggest": async (p) => {
      const pr = project();
      const { json, model } = await llmJson("search", queryPrompt(String(p?.topic || pr.title), pr.field));
      return {
        model,
        queries: (Array.isArray(json?.queries) ? json.queries : []).map((q) => ({ query: String(q?.query || "").trim(), purpose: String(q?.purpose || "") })).filter((q) => q.query).slice(0, 6),
        zhKeywords: (Array.isArray(json?.zhKeywords) ? json.zhKeywords : []).map(String).filter(Boolean).slice(0, 8)
      };
    },
    "search.run": async (p) => {
      const query = String(p?.query || "").trim();
      if (!query) throw new Error((0, import_i18n3.t)("\u8BF7\u8F93\u5165\u68C0\u7D22\u8BCD"));
      const sources = (p.sources?.length ? p.sources : store.read().settings.defaultSources).filter((x) => import_ipc_contracts.AW_API_SOURCES.includes(x));
      const email = store.read().settings.contactEmail;
      const errors = [];
      progress("search", (0, import_i18n3.t)("\u6B63\u5728\u68C0\u7D22\uFF1A{p0}", { p0: sources.map(sourceLabel).join(" / ") }));
      const lists = await Promise.all(sources.map(async (src) => {
        try {
          return await searchSource(src, query, { limit: Number(p.limit) || 15, yearFrom: p.yearFrom || void 0, email });
        } catch (error) {
          errors.push({ source: src, message: error?.message || String(error) });
          return [];
        }
      }));
      const results = mergePapers(lists);
      const run = { id: newId("srch"), query, sources, yearFrom: p.yearFrom || void 0, results, errors, at: (/* @__PURE__ */ new Date()).toISOString() };
      mutateProject((pr) => {
        pr.lastSearch = run;
      });
      progress("search", "");
      pushState();
      return run;
    },
    // ② 文献库
    "library.add": (p) => {
      const added = mutateProject((pr) => {
        let n = 0;
        for (const id of p?.ids || []) {
          const paper = pr.lastSearch?.results.find((x) => x.id === id);
          if (!paper) continue;
          const dup = pr.library.find((x) => paper.doi && x.doi === paper.doi || normTitle(x.title) === normTitle(paper.title));
          if (dup) continue;
          pr.library.push({ ...paper, addedAt: (/* @__PURE__ */ new Date()).toISOString() });
          n += 1;
        }
        return n;
      });
      pushState();
      return { added };
    },
    "library.remove": (p) => {
      mutateProject((pr) => {
        const idx = pr.library.findIndex((x) => x.id === p.id);
        if (idx < 0) return;
        pr.library.splice(idx, 1);
        const shift = (t) => t.replace(/\[(\d+(?:\s*[-–—,，、]\s*\d+)*)\]/g, (_m, g) => `[${g.replace(/\d+/g, (d) => {
          const n = Number(d);
          return n === idx + 1 ? "0" : n > idx + 1 ? String(n - 1) : d;
        })}]`);
        pr.sections.forEach((s) => {
          s.text = shift(s.text);
          s.badRefs = extractCites(s.text, pr.library.length).bad.map(String);
        });
        if (pr.manuscript) pr.manuscript = shift(pr.manuscript);
        pr.outline.forEach((o) => {
          o.cites = o.cites.filter((c) => c !== p.id);
        });
      });
      pushState();
      return true;
    },
    "library.note": (p) => {
      mutateProject((pr) => {
        const x = pr.library.find((y) => y.id === p.id);
        if (x) x.note = String(p.note || "").slice(0, 2e3);
      });
      pushState();
      return true;
    },
    "library.checkDoi": async () => {
      const pr = project();
      const email = store.read().settings.contactEmail;
      const results = {};
      for (const x of pr.library.filter((y) => y.doi)) {
        progress("library", (0, import_i18n3.t)("\u67E5\u9A8C DOI\uFF1A{p0}", { p0: x.doi }));
        try {
          results[x.id] = await doiExists(x.doi, email) ? "ok" : "missing";
        } catch {
        }
      }
      mutateProject((p2) => {
        p2.library.forEach((x) => {
          if (results[x.id]) x.doiCheck = results[x.id];
        });
      });
      progress("library", "");
      pushState();
      return results;
    },
    /** 抓取内置浏览器当前页面：作者在知网 / 万方 / 期刊官网打开了一篇文献详情页 */
    "web.capture": async () => {
      const tabs = deps.embeddedBrowserTabs;
      if (!tabs?.tabIdForAgentContext) throw new Error((0, import_i18n3.t)("\u5185\u7F6E\u6D4F\u89C8\u5668\u4E0D\u53EF\u7528"));
      const tabId = tabs.tabIdForAgentContext(ACADEMIC_BROWSER_CONTEXT);
      if (!tabId) throw new Error((0, import_i18n3.t)("\u8FD8\u6CA1\u6709\u5728\u5185\u7F6E\u6D4F\u89C8\u5668\u91CC\u6253\u5F00\u5B66\u672F\u7F51\u7AD9\uFF1A\u5148\u70B9\u4E0A\u9762\u7684\u7F51\u7AD9\u5165\u53E3\uFF0C\u6253\u5F00\u4E00\u7BC7\u6587\u732E\u7684\u8BE6\u60C5\u9875"));
      const page = await tabs.evalInTab(tabId, `(() => ({ url: location.href, title: document.title, text: (document.body && document.body.innerText || '').slice(0, 20000) }))()`);
      const url = String(page?.url || "");
      const body = `${String(page?.title || "")}
${String(page?.text || "")}`.trim();
      if (body.length < 50) throw new Error((0, import_i18n3.t)("\u6CA1\u6709\u8BFB\u5230\u9875\u9762\u5185\u5BB9\uFF1A\u8BF7\u5148\u5728\u5185\u7F6E\u6D4F\u89C8\u5668\u91CC\u6253\u5F00\u4E00\u7BC7\u6587\u732E\u7684\u8BE6\u60C5\u9875"));
      const { json, model } = await llmJson("search", webExtractPrompt(url, body));
      if (json?.notArticle) throw new Error((0, import_i18n3.t)("\u5F53\u524D\u9875\u9762\u50CF\u662F\u68C0\u7D22\u7ED3\u679C\u5217\u8868\uFF1A\u8BF7\u70B9\u8FDB\u4E00\u7BC7\u6587\u732E\u7684\u8BE6\u60C5\u9875\u518D\u6293\u53D6"));
      const title = String(json?.title || "").trim();
      if (!title || !foundIn(body, title)) throw new Error((0, import_i18n3.t)("\u6CA1\u80FD\u4ECE\u9875\u9762\u91CC\u786E\u8BA4\u6587\u732E\u6807\u9898\uFF0C\u8BF7\u6362\u5230\u6587\u732E\u8BE6\u60C5\u9875\u518D\u8BD5"));
      const keep = (v) => {
        const s = String(v ?? "").trim();
        return s && foundIn(body, s) ? s : "";
      };
      const paper = {
        id: newId("web"),
        source: "web",
        sourceId: url || title,
        title,
        authors: (Array.isArray(json?.authors) ? json.authors : []).map((a) => keep(a)).filter(Boolean).slice(0, 30),
        journal: keep(json?.journal),
        year: /^\d{4}$/.test(String(json?.year)) && body.includes(String(json.year)) ? String(json.year) : "",
        volume: keep(json?.volume) || void 0,
        issue: keep(json?.issue) || void 0,
        pages: keep(json?.pages) || void 0,
        doi: json?.doi && body.toLowerCase().includes(normDoi(json.doi)) ? normDoi(json.doi) : void 0,
        url,
        abstract: stripTags(keep(json?.abstract)),
        foundIn: ["web"],
        addedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      const added = mutateProject((pr) => {
        if (pr.library.some((x) => paper.doi && x.doi === paper.doi || normTitle(x.title) === normTitle(paper.title))) return false;
        pr.library.push(paper);
        return true;
      });
      logger?.info?.("academic-writer", "web capture", { url, model, added });
      pushState();
      return { paper, added, model };
    },
    // ③ 精读
    "read.run": async (p) => {
      const pr = project();
      const targets = pr.library.filter((x) => p?.ids?.length ? p.ids.includes(x.id) : !x.summary);
      let done = 0;
      const failed = [];
      for (const paper of targets) {
        const text = [paper.title, paper.abstract].filter(Boolean).join("\n\n");
        if (!paper.abstract) {
          failed.push((0, import_i18n3.t)("{p0}\uFF1A\u6CA1\u6709\u6458\u8981\u53EF\u8BFB", { p0: paper.title.slice(0, 40) }));
          continue;
        }
        progress("read", (0, import_i18n3.t)("\u7CBE\u8BFB {a}/{b}\uFF1A{p0}", { a: done + 1, b: targets.length, p0: paper.title.slice(0, 50) }));
        try {
          const { json, model } = await llmJson("read", readPrompt(pr, paper, text));
          const quotes = (Array.isArray(json?.quotes) ? json.quotes : []).slice(0, 8).map((q) => ({
            field: String(q?.field || ""),
            text: String(json?.[q?.field] || ""),
            quote: String(q?.quote || "").slice(0, 500),
            verified: foundIn(text, q?.quote)
          })).filter((q) => q.quote);
          mutateProject((p2) => {
            const x = p2.library.find((y) => y.id === paper.id);
            if (x) x.summary = { question: String(json?.question || ""), method: String(json?.method || ""), findings: String(json?.findings || ""), limitations: String(json?.limitations || ""), quotes, model, at: (/* @__PURE__ */ new Date()).toISOString() };
          });
          done += 1;
          pushState();
        } catch (error) {
          failed.push((0, import_i18n3.t)("{p0}\uFF1A{p1}", { p0: paper.title.slice(0, 40), p1: error?.message || "" }));
        }
      }
      progress("read", "");
      return { done, failed };
    },
    // ④ 提纲
    "outline.generate": async () => {
      const pr = project();
      if (pr.library.length < 3) throw new Error((0, import_i18n3.t)("\u6587\u732E\u5E93\u81F3\u5C11\u8981\u6709 3 \u7BC7\u6587\u732E\u518D\u62DF\u63D0\u7EB2"));
      const { json, model } = await llmJson("outline", outlinePrompt(pr), 24e4);
      const outline = (Array.isArray(json?.sections) ? json.sections : []).slice(0, 15).map((s) => ({
        id: newId("sec"),
        heading: String(s?.heading || "").trim(),
        points: (Array.isArray(s?.points) ? s.points : []).map(String).filter(Boolean).slice(0, 8),
        cites: (Array.isArray(s?.cites) ? s.cites : []).map(Number).filter((n) => n >= 1 && n <= pr.library.length).map((n) => pr.library[n - 1].id)
      })).filter((s) => s.heading);
      if (!outline.length) throw new Error((0, import_i18n3.t)("\u6A21\u578B\u6CA1\u6709\u7ED9\u51FA\u63D0\u7EB2\uFF0C\u8BF7\u91CD\u8BD5\u6216\u6362\u4E00\u4E2A\u6A21\u578B"));
      mutateProject((p2) => {
        p2.outline = outline;
        p2.outlineModel = model;
      });
      pushState();
      return { outline, model };
    },
    "outline.save": (p) => {
      mutateProject((pr) => {
        pr.outline = (p?.outline || []).map((s) => ({ id: s.id || newId("sec"), heading: String(s.heading || "").trim(), points: (s.points || []).map(String).filter(Boolean), cites: (s.cites || []).filter((c) => pr.library.some((x) => x.id === c)) })).filter((s) => s.heading);
      });
      pushState();
      return true;
    },
    // ⑤ 写作
    "write.section": async (p) => {
      const pr = project();
      const sec = need(pr.outline.find((x) => x.id === p.outlineId), (0, import_i18n3.t)("\u63D0\u7EB2\u5C0F\u8282"));
      progress("write", (0, import_i18n3.t)("\u6B63\u5728\u5199\uFF1A{p0}", { p0: sec.heading }));
      const r = await llm("write", sectionPrompt(pr, sec.heading, sec.points, sec.cites, pr.outline.map((x) => x.heading)), 3e5);
      const text = r.text.trim().replace(/^#+\s*.*\n+/, "");
      const bad = extractCites(text, pr.library.length).bad.map(String);
      const out = mutateProject((p2) => {
        const next = { id: sec.id, heading: sec.heading, text, model: r.model, badRefs: bad, at: (/* @__PURE__ */ new Date()).toISOString() };
        const i = p2.sections.findIndex((x) => x.id === sec.id);
        if (i >= 0) p2.sections[i] = next;
        else p2.sections.push(next);
        p2.sections.sort((a, b) => p2.outline.findIndex((o) => o.id === a.id) - p2.outline.findIndex((o) => o.id === b.id));
        return next;
      });
      progress("write", "");
      pushState();
      return out;
    },
    "sections.save": (p) => {
      const out = mutateProject((pr) => {
        const s = need(pr.sections.find((x) => x.id === p.id), (0, import_i18n3.t)("\u5C0F\u8282"));
        s.text = String(p.text || "");
        s.badRefs = extractCites(s.text, pr.library.length).bad.map(String);
        return s;
      });
      pushState();
      return out;
    },
    /** 送进人机双写编辑器的全文：引用保留文献库编号，导出时再按格式重排 */
    "manuscript.compose": () => draftText(project()),
    /** 预览用：和导出文件同一份成稿（引用已按格式重排、带参考文献表） */
    "manuscript.rendered": () => renderedBody(project()),
    "manuscript.save": (p) => {
      const text = String(p?.text || "");
      if (!text.trim()) throw new Error((0, import_i18n3.t)("\u53CC\u5199\u7F16\u8F91\u5668\u91CC\u6CA1\u6709\u5185\u5BB9"));
      mutateProject((pr) => {
        pr.manuscript = text;
        pr.manuscriptAt = (/* @__PURE__ */ new Date()).toISOString();
      });
      pushState();
      return { words: wordCount(text) };
    },
    "manuscript.reset": () => {
      mutateProject((pr) => {
        pr.manuscript = void 0;
        pr.manuscriptAt = void 0;
      });
      pushState();
      return true;
    },
    // ⑥ 查验与导出
    "check.run": () => {
      const pr = project();
      const text = draftText(pr);
      const { order, bad } = extractCites(text, pr.library.length);
      const check = {
        cited: order.map((n) => pr.library[n - 1].id),
        uncited: pr.library.filter((_, i) => !order.includes(i + 1)).map((x) => x.id),
        badRefs: bad.map(String),
        doiMissing: pr.library.filter((x) => x.doiCheck === "missing").map((x) => x.id),
        wordCount: wordCount(text),
        at: (/* @__PURE__ */ new Date()).toISOString()
      };
      mutateProject((p2) => {
        p2.check = check;
      });
      pushState();
      return check;
    },
    "references.preview": () => {
      const pr = project();
      return renderManuscript(draftText(pr), pr.library, pr.style).references;
    },
    "export": async (p) => {
      const pr = project();
      const dir = (0, import_node_path2.join)(outputRoot(), safeName(pr.title));
      (0, import_node_fs2.mkdirSync)(dir, { recursive: true });
      const stamp = (/* @__PURE__ */ new Date()).toISOString().slice(0, 16).replace(/[-:T]/g, "");
      let path;
      if (p.format === "bib") {
        path = (0, import_node_path2.join)(dir, `${safeName(pr.title)}-${stamp}.bib`);
        (0, import_node_fs2.writeFileSync)(path, pr.library.map(toBibtex).join("\n\n"), "utf-8");
      } else {
        const body = renderedBody(pr);
        if (p.format === "md") {
          path = (0, import_node_path2.join)(dir, `${safeName(pr.title)}-${stamp}.md`);
          (0, import_node_fs2.writeFileSync)(path, body, "utf-8");
        } else {
          const { buildDocx } = await Promise.resolve().then(() => __toESM(require("host:apps/desktop-shell/src/main/services/cowriteEditor.ts"), 1));
          path = (0, import_node_path2.join)(dir, `${safeName(pr.title)}-${stamp}.docx`);
          const plain = body.replace(/^# .*\n+/, "").replace(/^#{1,6}\s*/gm, "").replace(/\*\*(.+?)\*\*/g, "$1");
          (0, import_node_fs2.writeFileSync)(path, buildDocx(pr.title, plain));
        }
      }
      mutateProject((p2) => {
        p2.exports.unshift({ path, kind: p.format, at: (/* @__PURE__ */ new Date()).toISOString() });
        p2.exports.splice(20);
      });
      pushState();
      return { path };
    }
  };
  import_electron.ipcMain.handle(import_ipc_contracts.IPC_CHANNELS.WORKBENCH_AW_INVOKE, async (_e, req) => {
    const fn = actions[String(req?.action || "")];
    if (!fn) throw new Error((0, import_i18n3.t)("\u672A\u77E5\u64CD\u4F5C\uFF1A{p0}", { p0: String(req?.action || "") }));
    try {
      return await fn(req.payload ?? {});
    } catch (error) {
      logger?.warn?.("academic-writer", `${req.action} failed`, { error: error?.message });
      throw new Error((0, import_userFacingError.userFacingError)(error));
    }
  });
}

// ../../../../../../../../../Users/mac02/Desktop/work/new-work/totalclaw-qiye-app/apps/desktop-shell/node_modules/.cache/solutions-build/workbench-academic-writer/entry.main.ts
var hostApi = 2;
var registerFunction = "registerAcademicWriterHandlers";
var cleanup;
function activate(ctx) {
  cleanup = registerAcademicWriterHandlers(ctx.host.deps);
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
