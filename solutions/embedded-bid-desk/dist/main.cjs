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

// node_modules/.cache/solutions-build/embedded-bid-desk/entry.main.ts
var entry_main_exports = {};
__export(entry_main_exports, {
  activate: () => activate,
  deactivate: () => deactivate,
  hostApi: () => hostApi,
  registerFunction: () => registerFunction
});
module.exports = __toCommonJS(entry_main_exports);

// ../../../totalclaw-solutions/solutions/embedded-bid-desk/src/main/ipc/bidDesk.ipc.ts
var import_spreadsheetRead = require("host:apps/desktop-shell/src/main/services/spreadsheetRead.ts");
var import_electron = require("electron");
var import_node_fs = require("node:fs");
var import_node_path = require("node:path");
var import_adm_zip = __toESM(require("npm:adm-zip"), 1);
var XLSX = __toESM(require("npm:xlsx"), 1);
var import_ipc_contracts = require("npm:@totalclaw/ipc-contracts");
var import_accountScope = require("host:apps/desktop-shell/src/main/services/accountScope.ts");
var import_i18n = require("npm:@totalclaw/i18n");
var SNAPSHOT_VERSION = 2;
var MAX_PARSE_BYTES = 100 * 1024 * 1024;
function snapshotPath() {
  return (0, import_node_path.join)((0, import_accountScope.privateRoot)(), "bid-desk.json");
}
function readSnapshot() {
  try {
    const path = snapshotPath();
    if (!(0, import_node_fs.existsSync)(path)) return null;
    const value = JSON.parse((0, import_node_fs.readFileSync)(path, "utf-8"));
    return value?.version === SNAPSHOT_VERSION ? value : null;
  } catch {
    return null;
  }
}
function writeSnapshot(snapshot) {
  const value = snapshot;
  if (!value || value.version !== SNAPSHOT_VERSION || !Array.isArray(value.cases)) {
    throw new Error((0, import_i18n.t)("\u9879\u76EE\u5DE5\u4F5C\u53F0\u5FEB\u7167\u683C\u5F0F\u65E0\u6548"));
  }
  const serialized = JSON.stringify(snapshot, null, 2);
  if (Buffer.byteLength(serialized, "utf-8") > 50 * 1024 * 1024) {
    throw new Error((0, import_i18n.t)("\u9879\u76EE\u5DE5\u4F5C\u53F0\u5FEB\u7167\u8D85\u8FC7 50MB\uFF0C\u8BF7\u79FB\u9664\u5197\u4F59\u89E3\u6790\u6587\u672C\u540E\u518D\u4FDD\u5B58"));
  }
  const path = snapshotPath();
  const temp = `${path}.tmp`;
  (0, import_node_fs.mkdirSync)((0, import_accountScope.privateRoot)(), { recursive: true });
  (0, import_node_fs.writeFileSync)(temp, serialized, { encoding: "utf-8", mode: 384 });
  (0, import_node_fs.renameSync)(temp, path);
}
function actorFrom(deps) {
  const user = deps.serviceAuth?.readSession()?.user;
  const id = String(user?.id || user?.userId || user?.phone || user?.email || "local-user");
  const name = String(
    user?.displayName || user?.nickname || user?.name || user?.phone || user?.email || (0, import_i18n.t)("\u672C\u673A\u7528\u6237")
  );
  return { id, name };
}
function ensureReadableFile(path) {
  if (!path || !(0, import_node_path.isAbsolute)(path) || !(0, import_node_fs.existsSync)(path)) throw new Error((0, import_i18n.t)("\u6587\u4EF6\u8DEF\u5F84\u65E0\u6548\u6216\u6587\u4EF6\u4E0D\u5B58\u5728"));
  const stat = (0, import_node_fs.statSync)(path);
  if (!stat.isFile()) throw new Error((0, import_i18n.t)("\u8BF7\u9009\u62E9\u4E00\u4E2A\u6587\u4EF6"));
  if (stat.size > MAX_PARSE_BYTES) throw new Error((0, import_i18n.t)("\u5355\u4E2A\u6587\u4EF6\u8D85\u8FC7 100MB\uFF0C\u8BF7\u62C6\u5206\u540E\u518D\u89E3\u6790"));
}
function decodeXml(value) {
  return value.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, "&");
}
function parseDocx(path) {
  const zip = new import_adm_zip.default(path);
  const xml2 = zip.getEntry("word/document.xml")?.getData().toString("utf-8");
  if (!xml2) throw new Error((0, import_i18n.t)("Word \u6587\u4EF6\u7F3A\u5C11 document.xml"));
  const withBreaks = xml2.replace(/<\/w:p>/g, "\n").replace(/<\/w:tr>/g, "\n").replace(/<\/w:tc>/g, "	");
  const text = Array.from(withBreaks.matchAll(/<w:t(?:\s[^>]*)?>([\s\S]*?)<\/w:t>/g)).map((match) => decodeXml(match[1])).join("").replace(/\t{2,}/g, "	").replace(/\n{3,}/g, "\n\n").trim();
  return { text };
}
function parseSpreadsheet(path) {
  const workbook = (0, import_spreadsheetRead.openSpreadsheetFile)(path, { cellDates: true });
  const sheets = workbook.SheetNames.map((name) => ({
    name,
    rows: (0, import_spreadsheetRead.readWorksheetData)(workbook.Sheets[name], { raw: false, defval: "" }).rows
  }));
  const text = sheets.map((sheet) => `## ${sheet.name}
` + sheet.rows.map((row) => row.map((cell) => String(cell ?? "").trim()).join("	")).join("\n")).join("\n\n");
  return { text, sheets };
}
async function parsePdf(path) {
  const pdfjs = await Promise.resolve().then(() => __toESM(require("npm:pdfjs-dist/legacy/build/pdf.mjs"), 1));
  const task = pdfjs.getDocument({
    data: new Uint8Array((0, import_node_fs.readFileSync)(path)),
    useSystemFonts: true
  });
  const document = await task.promise;
  const pages = [];
  const scannedPageNumbers = [];
  try {
    for (let index = 1; index <= document.numPages; index += 1) {
      const page = await document.getPage(index);
      const content = await page.getTextContent();
      const text2 = content.items.map((item) => `${item.str || ""}${item.hasEOL ? "\n" : " "}`).join("").replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
      pages.push((0, import_i18n.t)("[\u7B2C {index} \u9875]\n{text}", { index, text: text2 }));
      if (text2.replace(/\s/g, "").length < 20) scannedPageNumbers.push(index);
    }
    const pageImages = [];
    if (scannedPageNumbers.length) {
      const { createCanvas } = await Promise.resolve().then(() => __toESM(require("npm:@napi-rs/canvas"), 1));
      for (const pageNumber of scannedPageNumbers.slice(0, 12)) {
        const page = await document.getPage(pageNumber);
        const baseViewport = page.getViewport({ scale: 1 });
        const scale = Math.min(2, 1600 / Math.max(baseViewport.width, 1));
        const viewport = page.getViewport({ scale });
        const canvas = createCanvas(Math.ceil(viewport.width), Math.ceil(viewport.height));
        const canvasContext = canvas.getContext("2d");
        await page.render({
          canvasContext,
          viewport
        }).promise;
        pageImages.push({
          page: pageNumber,
          dataUrl: canvas.toDataURL("image/jpeg", 82)
        });
      }
    }
    const text = pages.join("\n\n");
    const warnings = [];
    if (!text.replace(/\[第 \d+ 页\]\s*/g, "").trim()) warnings.push((0, import_i18n.t)("PDF \u672A\u63D0\u53D6\u5230\u6587\u672C\uFF0C\u5DF2\u5C06\u626B\u63CF\u9875\u9001\u5165\u89C6\u89C9\u8BC6\u522B\u961F\u5217\u3002"));
    if (scannedPageNumbers.length > 12) warnings.push((0, import_i18n.t)("\u626B\u63CF\u9875\u5171 {p0} \u9875\uFF0C\u672C\u6B21\u5148\u8BC6\u522B\u524D 12 \u9875\uFF1B\u5176\u4F59\u9875\u9762\u8BF7\u62C6\u5206\u540E\u7EE7\u7EED\u3002", { p0: scannedPageNumbers.length }));
    return {
      text,
      pageCount: pages.length,
      pageImages,
      warnings: warnings.length ? warnings : void 0
    };
  } finally {
    await document.destroy();
  }
}
async function parseDocument(payload) {
  const path = String(payload?.path || "").trim();
  ensureReadableFile(path);
  const extension = (0, import_node_path.extname)(payload?.name || path).toLowerCase();
  if (extension === ".docx") return parseDocx(path);
  if ([".xlsx", ".xls", ".csv"].includes(extension)) return parseSpreadsheet(path);
  if (extension === ".pdf") return parsePdf(path);
  if ([".png", ".jpg", ".jpeg", ".webp", ".tif", ".tiff", ".bmp"].includes(extension)) {
    return { text: "", warnings: [(0, import_i18n.t)("\u56FE\u7247\u6587\u4EF6\u9700\u8981\u4F7F\u7528\u89C6\u89C9\u8BC6\u522B\u3002")] };
  }
  if (extension === ".doc") {
    return { text: "", warnings: [(0, import_i18n.t)("\u65E7\u7248 .doc \u6682\u4E0D\u652F\u6301\u672C\u5730\u89E3\u6790\uFF0C\u8BF7\u53E6\u5B58\u4E3A .docx \u540E\u91CD\u8BD5\u3002")] };
  }
  return { text: (0, import_node_fs.readFileSync)(path, "utf-8") };
}
function xml(value) {
  return String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}
function html(value) {
  return String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function safeFileName(value) {
  return (0, import_node_path.basename)(value).replace(/[\\/:*?"<>|]/g, "_").trim() || "bid-output";
}
function money(value, locale) {
  return new Intl.NumberFormat(locale === "ar" ? "ar-SA" : locale === "zh-CN" ? "zh-CN" : "en-US", {
    style: "currency",
    currency: "SAR",
    maximumFractionDigits: 2
  }).format(Number(value) || 0);
}
function percent(value) {
  return `${((Number(value) || 0) * 100).toFixed(1)}%`;
}
function selectedScenario(bidCase) {
  const scenarios = Array.isArray(bidCase.scenarios) ? bidCase.scenarios : [];
  return scenarios.find((item) => item.id === bidCase?.decision?.frozenScenarioId) || scenarios[0] || {};
}
function fieldValue(bidCase, keys) {
  const fields = Array.isArray(bidCase.fields) ? bidCase.fields : [];
  const normalized = keys.map((key) => key.toLowerCase());
  const field = fields.find((item) => normalized.includes(String(item.key || "").toLowerCase()));
  return String(field?.value || "").trim();
}
function localize(locale) {
  const ar = locale === "ar";
  const zh = locale === "zh-CN";
  return {
    quotation: ar ? "\u0639\u0631\u0636 \u0627\u0644\u0633\u0639\u0631 \u0627\u0644\u0631\u0633\u0645\u064A" : zh ? (0, import_i18n.t)("\u6B63\u5F0F\u62A5\u4EF7\u5355") : "Formal Quotation",
    customer: ar ? "\u0627\u0644\u0639\u0645\u064A\u0644" : zh ? (0, import_i18n.t)("\u5BA2\u6237") : "Customer",
    project: ar ? "\u0627\u0644\u0645\u0634\u0631\u0648\u0639" : zh ? (0, import_i18n.t)("\u9879\u76EE") : "Project",
    rfq: ar ? "\u0631\u0642\u0645 \u0637\u0644\u0628 \u0627\u0644\u0639\u0631\u0636" : zh ? (0, import_i18n.t)("\u8BE2\u4EF7\u7F16\u53F7") : "RFQ Number",
    item: ar ? "\u0627\u0644\u0628\u0646\u062F" : zh ? (0, import_i18n.t)("\u54C1\u9879") : "Item",
    quantity: ar ? "\u0627\u0644\u0643\u0645\u064A\u0629" : zh ? (0, import_i18n.t)("\u6570\u91CF") : "Quantity",
    unitPrice: ar ? "\u0633\u0639\u0631 \u0627\u0644\u0648\u062D\u062F\u0629" : zh ? (0, import_i18n.t)("\u5355\u4EF7") : "Unit Price",
    total: ar ? "\u0627\u0644\u0625\u062C\u0645\u0627\u0644\u064A" : zh ? (0, import_i18n.t)("\u91D1\u989D") : "Total",
    payment: ar ? "\u0634\u0631\u0648\u0637 \u0627\u0644\u062F\u0641\u0639" : zh ? (0, import_i18n.t)("\u4ED8\u6B3E\u6761\u4EF6") : "Payment Terms",
    delivery: ar ? "\u0645\u062F\u0629 \u0627\u0644\u062A\u0633\u0644\u064A\u0645" : zh ? (0, import_i18n.t)("\u4EA4\u4ED8\u5468\u671F") : "Delivery",
    warranty: ar ? "\u0627\u0644\u0636\u0645\u0627\u0646" : zh ? (0, import_i18n.t)("\u8D28\u4FDD") : "Warranty",
    validity: ar ? "\u0635\u0644\u0627\u062D\u064A\u0629 \u0627\u0644\u0639\u0631\u0636" : zh ? (0, import_i18n.t)("\u62A5\u4EF7\u6709\u6548\u671F") : "Offer Validity",
    approved: ar ? "\u0627\u0644\u0625\u0635\u062F\u0627\u0631 \u0627\u0644\u0645\u0639\u062A\u0645\u062F" : zh ? (0, import_i18n.t)("\u5DF2\u6279\u51C6\u7248\u672C") : "Approved Version"
  };
}
function quotationModel(bidCase, locale) {
  const labels = localize(locale);
  const scenario = selectedScenario(bidCase);
  const lineItems = (Array.isArray(bidCase.lineItems) ? bidCase.lineItems : []).map(
    (item, index) => {
      const quantity = Number(item.quantity) || 0;
      const unitPrice = Number(item.unitPriceSar) || 0;
      return [
        String(index + 1),
        String(item.description || ""),
        `${quantity} ${item.unit || ""}`.trim(),
        unitPrice ? money(unitPrice, locale) : "\u2014",
        unitPrice ? money(unitPrice * quantity, locale) : "\u2014"
      ];
    }
  );
  return {
    labels,
    scenario,
    title: labels.quotation,
    metadata: [
      [labels.customer, String(bidCase.customer || "")],
      [labels.project, String(bidCase.project || "")],
      [labels.rfq, String(bidCase.rfqNumber || "")],
      [labels.validity, fieldValue(bidCase, ["offer_validity", "bid_validity", "validity"]) || "\u2014"],
      [labels.payment, fieldValue(bidCase, ["payment_terms", "payment"]) || "\u2014"],
      [labels.delivery, fieldValue(bidCase, ["delivery_period", "delivery"]) || "\u2014"],
      [labels.warranty, fieldValue(bidCase, ["warranty", "warranty_terms"]) || "\u2014"]
    ],
    headers: ["#", labels.item, labels.quantity, labels.unitPrice, labels.total],
    rows: lineItems,
    grandTotal: money(scenario.offeredPriceSar, locale),
    version: Number(bidCase?.decision?.version) || 1
  };
}
function paragraph(text, rtl = false, heading = false) {
  return `<w:p><w:pPr>${rtl ? "<w:bidi/>" : ""}${heading ? '<w:spacing w:before="240" w:after="120"/>' : ""}</w:pPr><w:r><w:rPr>${rtl ? "<w:rtl/>" : ""}${heading ? '<w:b/><w:sz w:val="30"/>' : '<w:sz w:val="22"/>'}</w:rPr><w:t xml:space="preserve">${xml(text)}</w:t></w:r></w:p>`;
}
function table(headers, rows, rtl = false) {
  const renderRow = (cells, isHeader = false) => `<w:tr>${cells.map((cell) => `<w:tc><w:tcPr><w:tcW w:w="2200" w:type="dxa"/>${isHeader ? '<w:shd w:fill="E9ECFF"/>' : ""}</w:tcPr><w:p><w:pPr>${rtl ? "<w:bidi/>" : ""}</w:pPr><w:r><w:rPr>${isHeader ? "<w:b/>" : ""}${rtl ? "<w:rtl/>" : ""}<w:sz w:val="20"/></w:rPr><w:t xml:space="preserve">${xml(cell)}</w:t></w:r></w:p></w:tc>`).join("")}</w:tr>`;
  return `<w:tbl><w:tblPr><w:tblW w:w="0" w:type="auto"/><w:tblBorders><w:top w:val="single" w:sz="4" w:color="D9DDE8"/><w:left w:val="single" w:sz="4" w:color="D9DDE8"/><w:bottom w:val="single" w:sz="4" w:color="D9DDE8"/><w:right w:val="single" w:sz="4" w:color="D9DDE8"/><w:insideH w:val="single" w:sz="4" w:color="D9DDE8"/><w:insideV w:val="single" w:sz="4" w:color="D9DDE8"/></w:tblBorders></w:tblPr>${renderRow(headers, true)}${rows.map((row) => renderRow(row)).join("")}</w:tbl>`;
}
function writeDocx(path, blocks) {
  const zip = new import_adm_zip.default();
  zip.addFile("[Content_Types].xml", Buffer.from(
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/></Types>'
  ));
  zip.addFile("_rels/.rels", Buffer.from(
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>'
  ));
  zip.addFile("word/_rels/document.xml.rels", Buffer.from(
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>'
  ));
  zip.addFile("word/styles.xml", Buffer.from(
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:eastAsia="Microsoft YaHei" w:cs="Arial"/></w:rPr></w:style></w:styles>'
  ));
  zip.addFile("word/document.xml", Buffer.from(
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${blocks.join("")}<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134"/></w:sectPr></w:body></w:document>`
  ));
  zip.writeZip(path);
}
function quotationBlocks(bidCase, locale) {
  const rtl = locale === "ar";
  const model = quotationModel(bidCase, locale);
  return [
    paragraph(model.title, rtl, true),
    paragraph(`${model.labels.approved} ${model.version}`, rtl),
    table(model.metadata.map(([key]) => key), [model.metadata.map(([, value]) => value)], rtl),
    paragraph("", rtl),
    table(model.headers, model.rows, rtl),
    paragraph(`${model.labels.total}: ${model.grandTotal}`, rtl, true)
  ];
}
function genericListBlocks(title, bidCase, rows, rtl = false) {
  return [
    paragraph(title, rtl, true),
    paragraph(`${bidCase.customer || ""} \xB7 ${bidCase.project || ""} \xB7 ${bidCase.rfqNumber || ""}`, rtl),
    table(["#", "Requirement", "Response / Decision", "Evidence"], rows, rtl)
  ];
}
function quotationHtml(bidCase, locale) {
  const model = quotationModel(bidCase, locale);
  const rtl = locale === "ar";
  const rows = model.rows.map((row) => `<tr>${row.map((cell) => `<td>${html(cell)}</td>`).join("")}</tr>`).join("");
  const metadata = model.metadata.map(([key, value]) => `<div><b>${html(key)}</b><span>${html(value)}</span></div>`).join("");
  return `<!doctype html><html lang="${locale}" dir="${rtl ? "rtl" : "ltr"}"><head><meta charset="utf-8"><style>body{font-family:Arial,"Microsoft YaHei",sans-serif;color:#172033;margin:42px;line-height:1.5}h1{color:#302b77;border-bottom:3px solid #655cf5;padding-bottom:14px}.meta{display:grid;grid-template-columns:1fr 1fr;gap:10px 24px;margin:20px 0}.meta div{display:grid;gap:3px}.meta span{color:#5d6678}table{width:100%;border-collapse:collapse}th,td{border:1px solid #d9dde8;padding:8px;text-align:start}th{background:#eef0ff}.total{margin-top:22px;text-align:end;font-size:20px;font-weight:700}</style></head><body><h1>${html(model.title)}</h1><p>${html(model.labels.approved)} ${model.version}</p><div class="meta">${metadata}</div><table><thead><tr>${model.headers.map((cell) => `<th>${html(cell)}</th>`).join("")}</tr></thead><tbody>${rows}</tbody></table><div class="total">${html(model.labels.total)}: ${html(model.grandTotal)}</div></body></html>`;
}
function bilingualQuotationHtml(bidCase) {
  const english = quotationHtml(bidCase, "en-US");
  const arabic = quotationHtml(bidCase, "ar");
  const arabicBody = arabic.match(/<body>([\s\S]*?)<\/body>/i)?.[1] || "";
  return english.replace(
    "</body></html>",
    `<section dir="rtl" style="page-break-before:always;padding-top:12px">${arabicBody}</section></body></html>`
  );
}
async function writePdf(path, htmlContent) {
  const window = new import_electron.BrowserWindow({
    show: false,
    webPreferences: { sandbox: true, contextIsolation: true, javascript: false }
  });
  try {
    await window.loadURL(`data:text/html;base64,${Buffer.from(htmlContent).toString("base64")}`);
    const pdf = await window.webContents.printToPDF({
      printBackground: true,
      pageSize: "A4",
      margins: { top: 0.4, right: 0.4, bottom: 0.4, left: 0.4 }
    });
    (0, import_node_fs.writeFileSync)(path, pdf);
  } finally {
    window.destroy();
  }
}
async function exportPackage(payload, exportActor) {
  try {
    const folder = String(payload?.folderPath || "").trim();
    if (!folder || !(0, import_node_path.isAbsolute)(folder)) return { ok: false, error: (0, import_i18n.t)("\u8BF7\u9009\u62E9\u6709\u6548\u7684\u8F93\u51FA\u6587\u4EF6\u5939") };
    (0, import_node_fs.mkdirSync)(folder, { recursive: true });
    const bidCase = payload?.bidCase || {};
    const fields = Array.isArray(bidCase.fields) ? bidCase.fields : [];
    const lineItems = Array.isArray(bidCase.lineItems) ? bidCase.lineItems : [];
    const findings = Array.isArray(bidCase.findings) ? bidCase.findings : [];
    const scenario = selectedScenario(bidCase);
    const lineTotal = lineItems.reduce(
      (total, item) => total + (Number(item.unitPriceSar) || 0) * (Number(item.quantity) || 0),
      0
    );
    const exportBlockers = [
      bidCase?.decision?.decision !== "approved" ? (0, import_i18n.t)("\u5F53\u524D\u7248\u672C\u5C1A\u672A\u6279\u51C6") : "",
      !String(bidCase?.decision?.comment || "").trim() ? (0, import_i18n.t)("\u5BA1\u6279\u610F\u89C1\u4E3A\u7A7A") : "",
      !scenario?.id || scenario.id !== bidCase?.decision?.frozenScenarioId ? (0, import_i18n.t)("\u672A\u51BB\u7ED3\u6709\u6548\u62A5\u4EF7\u573A\u666F") : "",
      scenario?.belowMinimumMargin ? (0, import_i18n.t)("\u62A5\u4EF7\u4F4E\u4E8E\u6700\u4F4E\u6BDB\u5229\u7387") : "",
      scenario?.id && Math.abs(lineTotal - Number(scenario.offeredPriceSar || 0)) > 1 ? (0, import_i18n.t)("BOQ \u9010\u884C\u91D1\u989D\u5408\u8BA1\u4E0E\u62A5\u4EF7\u573A\u666F\u4E0D\u4E00\u81F4") : "",
      !fields.length || fields.some((item) => !["accepted", "modified"].includes(item.reviewStatus)) ? (0, import_i18n.t)("\u4ECD\u6709\u5B57\u6BB5\u5F85\u590D\u6838") : "",
      !lineItems.length || lineItems.some((item) => !["accepted", "modified"].includes(item.reviewStatus) || Number(item.unitPriceSar) <= 0 || !item.evidence?.length) ? (0, import_i18n.t)("BOQ \u54C1\u9879\u5C1A\u672A\u5B8C\u6210\u552E\u4EF7\u3001\u590D\u6838\u6216\u8BC1\u636E\u786E\u8BA4") : "",
      !findings.length || findings.some((item) => !item.humanDecision || item.humanDecision === "pending") ? (0, import_i18n.t)("\u7B26\u5408\u6027\u7ED3\u8BBA\u5C1A\u672A\u5168\u90E8\u4EBA\u5DE5\u786E\u8BA4") : ""
    ].filter(Boolean);
    if (exportBlockers.length) {
      return { ok: false, error: (0, import_i18n.t)("\u4E0D\u80FD\u8F93\u51FA\u6B63\u5F0F\u6587\u4EF6\uFF1A{p0}", { p0: exportBlockers.join((0, import_i18n.t)("\uFF1B")) }) };
    }
    const base = safeFileName(String(bidCase.id || "bid-case"));
    const locale = payload.locale || "en-US";
    const selected = new Set(payload.artifactIds || [
      "english_quotation",
      "arabic_quotation",
      "bilingual_quotation",
      "compliance",
      "line_items",
      "missing_items",
      "clarifications",
      "deviations",
      "proposal",
      "approval",
      "audit"
    ]);
    const paths = [];
    const add = (path) => {
      paths.push(path);
    };
    const exportEnglish = selected.has("english_quotation") || selected.has("quotation") && locale !== "ar";
    const exportArabic = selected.has("arabic_quotation") || selected.has("quotation") && locale === "ar";
    if (exportEnglish) {
      const docxPath = (0, import_node_path.join)(folder, `${base}_Quotation_EN.docx`);
      writeDocx(docxPath, quotationBlocks(bidCase, "en-US"));
      add(docxPath);
      const pdfPath = (0, import_node_path.join)(folder, `${base}_Quotation_EN.pdf`);
      await writePdf(pdfPath, quotationHtml(bidCase, "en-US"));
      add(pdfPath);
    }
    if (exportArabic) {
      const docxPath = (0, import_node_path.join)(folder, `${base}_Quotation_AR.docx`);
      writeDocx(docxPath, quotationBlocks(bidCase, "ar"));
      add(docxPath);
      const pdfPath = (0, import_node_path.join)(folder, `${base}_Quotation_AR.pdf`);
      await writePdf(pdfPath, quotationHtml(bidCase, "ar"));
      add(pdfPath);
    }
    if (selected.has("bilingual_quotation")) {
      const bilingualDocx = (0, import_node_path.join)(folder, `${base}_Quotation_EN-AR.docx`);
      writeDocx(bilingualDocx, [
        ...quotationBlocks(bidCase, "en-US"),
        paragraph("\u0627\u0644\u0639\u0631\u0636 \u0628\u0627\u0644\u0644\u063A\u0629 \u0627\u0644\u0639\u0631\u0628\u064A\u0629", true, true),
        ...quotationBlocks(bidCase, "ar")
      ]);
      add(bilingualDocx);
      const bilingualPdf = (0, import_node_path.join)(folder, `${base}_Quotation_EN-AR.pdf`);
      await writePdf(bilingualPdf, bilingualQuotationHtml(bidCase));
      add(bilingualPdf);
    }
    const exportFindings = Array.isArray(bidCase.findings) ? bidCase.findings : [];
    const findingRows = exportFindings.map((item, index) => [
      String(index + 1),
      String(item.requirement || ""),
      String(item.response || ""),
      String(item.humanDecision || item.status || ""),
      String(item.owner || ""),
      (Array.isArray(item.evidence) ? item.evidence : []).map((entry) => `${entry.fileId || ""}${entry.page ? ` p.${entry.page}` : ""}${entry.sheet ? ` ${entry.sheet}!${entry.cell || ""}` : ""}`).join("; "),
      String(item.clarification || "")
    ]);
    if (selected.has("compliance")) {
      const workbook = XLSX.utils.book_new();
      const sheet = XLSX.utils.aoa_to_sheet([
        ["#", "Requirement", "Response", "Human Decision", "Owner", "Evidence", "Clarification"],
        ...findingRows
      ]);
      XLSX.utils.book_append_sheet(workbook, sheet, "Compliance Matrix");
      const path = (0, import_node_path.join)(folder, `${base}_Compliance_Matrix.xlsx`);
      XLSX.writeFile(workbook, path);
      add(path);
    }
    if (selected.has("line_items")) {
      const workbook = XLSX.utils.book_new();
      const rows = (Array.isArray(bidCase.lineItems) ? bidCase.lineItems : []).map(
        (item, index) => [
          index + 1,
          item.description || "",
          item.model || "",
          item.quantity || 0,
          item.unit || "",
          item.matchedProduct || "",
          item.unitCostSar || 0,
          item.unitPriceSar || 0,
          (Number(item.unitPriceSar) || 0) * (Number(item.quantity) || 0),
          item.reviewStatus || "",
          (Array.isArray(item.evidence) ? item.evidence : []).map((entry) => `${entry.fileId || ""}${entry.page ? ` p.${entry.page}` : ""}${entry.sheet ? ` ${entry.sheet}!${entry.cell || ""}` : ""}${entry.excerpt ? ` \u2014 ${entry.excerpt}` : ""}`).join("; ")
        ]
      );
      XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet([
        ["#", "Description", "Model", "Quantity", "Unit", "Matched Product", "Unit Cost SAR", "Unit Price SAR", "Total SAR", "Review Status", "Source Evidence"],
        ...rows
      ]), "BOQ");
      const path = (0, import_node_path.join)(folder, `${base}_Structured_BOQ.xlsx`);
      XLSX.writeFile(workbook, path);
      add(path);
    }
    if (selected.has("missing_items")) {
      const missingItems = Array.isArray(bidCase.missingItems) ? bidCase.missingItems : [];
      const path = (0, import_node_path.join)(folder, `${base}_Missing_Items.docx`);
      writeDocx(path, [
        paragraph("Missing Items List", false, true),
        paragraph(`${bidCase.customer || ""} \xB7 ${bidCase.project || ""} \xB7 ${bidCase.rfqNumber || ""}`),
        table(
          ["#", "Missing Information / Document", "Status", "Required Action"],
          (missingItems.length ? missingItems : ["No unresolved missing items."]).map(
            (item, index) => [
              String(index + 1),
              String(item || ""),
              missingItems.length ? "Open" : "Closed",
              missingItems.length ? "Obtain and review before submission" : "No action required"
            ]
          )
        )
      ]);
      add(path);
    }
    const listDocument = (id, title, predicate) => {
      if (!selected.has(id)) return;
      const rows = exportFindings.filter(predicate).map((item, index) => [
        String(index + 1),
        String(item.requirement || ""),
        String(item.clarification || item.response || item.humanDecision || item.status || ""),
        (Array.isArray(item.evidence) ? item.evidence : []).map((entry) => entry.excerpt || entry.fileId || "").join("; ")
      ]);
      const path = (0, import_node_path.join)(folder, `${base}_${safeFileName(title)}.docx`);
      writeDocx(path, genericListBlocks(title, bidCase, rows));
      add(path);
    };
    listDocument("clarifications", "Clarification_List", (item) => Boolean(item.clarification));
    listDocument("deviations", "Technical_Deviation_List", (item) => ["deviation", "major_deviation"].includes(item.humanDecision || item.status));
    if (selected.has("proposal")) {
      const scenario2 = selectedScenario(bidCase);
      const path = (0, import_node_path.join)(folder, `${base}_Commercial_Proposal.docx`);
      writeDocx(path, [
        paragraph("Commercial Proposal", false, true),
        paragraph(`${bidCase.customer || ""} \xB7 ${bidCase.project || ""} \xB7 ${bidCase.rfqNumber || ""}`),
        table(
          ["Total Offer", "Payment Terms", "Delivery", "Warranty", "Offer Validity"],
          [[
            money(scenario2.offeredPriceSar, "en-US"),
            fieldValue(bidCase, ["payment_terms", "payment"]) || "\u2014",
            fieldValue(bidCase, ["delivery_period", "delivery"]) || String(scenario2.deliveryImpact || "\u2014"),
            fieldValue(bidCase, ["warranty", "warranty_terms"]) || "\u2014",
            fieldValue(bidCase, ["offer_validity", "bid_validity", "validity"]) || "\u2014"
          ]]
        ),
        paragraph("The offer is subject to the approved clarifications and technical deviation list.")
      ]);
      add(path);
    }
    if (selected.has("approval")) {
      const scenario2 = selectedScenario(bidCase);
      const summary = bidCase.decisionSummary || {};
      const majorDeviations = exportFindings.filter((item) => ["deviation", "major_deviation"].includes(item.humanDecision || item.status));
      const evidenceRows = (Array.isArray(summary.evidenceSources) ? summary.evidenceSources : []).map((entry, index) => [
        String(index + 1),
        String(entry.fileId || ""),
        entry.page ? `p.${entry.page}` : entry.sheet ? `${entry.sheet}!${entry.cell || ""}` : "\u2014",
        String(entry.excerpt || "")
      ]);
      const scenarioRows = (Array.isArray(bidCase.scenarios) ? bidCase.scenarios : []).map((item) => [
        String(item.name || ""),
        money(item.landedCostSar, "en-US"),
        money(item.suggestedPriceSar, "en-US"),
        money(item.offeredPriceSar, "en-US"),
        `${money(item.marginSar, "en-US")} / ${percent(item.marginRate)}`,
        money(item.discountImpactSar, "en-US"),
        String(item.deliveryImpact || "\u2014")
      ]);
      const path = (0, import_node_path.join)(folder, `${base}_Internal_Approval.docx`);
      writeDocx(path, [
        paragraph("Internal Bid Approval", false, true),
        table(
          ["Case", "Customer", "Project", "RFQ", "Offer", "Margin", "Approver", "Decision"],
          [[
            String(bidCase.id || ""),
            String(bidCase.customer || ""),
            String(bidCase.project || ""),
            String(bidCase.rfqNumber || ""),
            money(scenario2.offeredPriceSar, "en-US"),
            `${money(scenario2.marginSar, "en-US")} / ${percent(scenario2.marginRate)}`,
            String(bidCase.decision?.approver || ""),
            String(bidCase.decision?.decision || "")
          ]]
        ),
        paragraph(`AI Recommendation: ${summary.aiRecommendation || "\u2014"}`),
        paragraph("Pricing Scenarios", false, true),
        table(
          ["Scenario", "Landed Cost", "Suggested Price", "Offered Price", "Margin", "Discount Impact", "Delivery Impact"],
          scenarioRows
        ),
        paragraph("Major Technical Deviations", false, true),
        table(
          ["Requirement", "Company Response", "Human Decision", "Owner"],
          majorDeviations.length ? majorDeviations.map((item) => [
            String(item.requirement || ""),
            String(item.response || ""),
            String(item.humanDecision || item.status || ""),
            String(item.owner || "")
          ]) : [["None", "\u2014", "Confirmed", "\u2014"]]
        ),
        paragraph(`Delivery / Certification / Payment / Other Risks: ${(Array.isArray(summary.risks) ? summary.risks : []).join("; ") || "\u2014"}`),
        paragraph(`Management Decisions Required: ${(Array.isArray(summary.keyDecisions) ? summary.keyDecisions : []).join("; ") || "\u2014"}`),
        paragraph("Evidence Sources", false, true),
        table(
          ["#", "Source File", "Location", "Excerpt"],
          evidenceRows.length ? evidenceRows : [["1", "\u2014", "\u2014", "No source recorded"]]
        ),
        paragraph(`Approval Comment: ${bidCase.decision?.comment || "\u2014"}`)
      ]);
      add(path);
    }
    if (selected.has("audit")) {
      const path = (0, import_node_path.join)(folder, `${base}_Audit_Trail.json`);
      (0, import_node_fs.writeFileSync)(path, JSON.stringify({
        caseId: bidCase.id,
        version: bidCase.version,
        decision: bidCase.decision,
        documents: bidCase.documents,
        fields: bidCase.fields,
        lineItems: bidCase.lineItems,
        findings: bidCase.findings,
        pricingScenarios: bidCase.scenarios,
        missingItems: bidCase.missingItems,
        decisionSummary: bidCase.decisionSummary,
        outputRecords: bidCase.outputRecords,
        events: [
          {
            id: `export_${Date.now()}`,
            at: Date.now(),
            actor: exportActor.name,
            actorId: exportActor.id,
            action: "artifacts.exported",
            detail: (0, import_i18n.t)("\u5DF2\u5BFC\u51FA\u5F53\u524D\u6279\u51C6\u7248\u672C\u7684\u6B63\u5F0F\u6295\u6807\u6587\u4EF6\u5305\u3002")
          },
          ...Array.isArray(bidCase.audit) ? bidCase.audit : []
        ]
      }, null, 2), "utf-8");
      add(path);
    }
    try {
      if (paths[0]) import_electron.shell.showItemInFolder(paths[0]);
    } catch {
    }
    return { ok: true, paths };
  } catch (error) {
    return { ok: false, error: error?.message || String(error) };
  }
}
function registerBidDeskHandlers(deps) {
  import_electron.ipcMain.handle(import_ipc_contracts.IPC_CHANNELS.BID_DESK_LOAD, () => ({
    snapshot: readSnapshot(),
    actor: actorFrom(deps)
  }));
  import_electron.ipcMain.handle(import_ipc_contracts.IPC_CHANNELS.BID_DESK_SAVE, (_event, payload) => {
    writeSnapshot(payload?.snapshot);
    return { ok: true };
  });
  import_electron.ipcMain.handle(import_ipc_contracts.IPC_CHANNELS.BID_DESK_PARSE_DOCUMENT, (_event, payload) => parseDocument(payload));
  import_electron.ipcMain.handle(import_ipc_contracts.IPC_CHANNELS.BID_DESK_EXPORT_PACKAGE, (_event, payload) => exportPackage(payload, actorFrom(deps)));
}

// node_modules/.cache/solutions-build/embedded-bid-desk/entry.main.ts
var hostApi = 2;
var registerFunction = "registerBidDeskHandlers";
var cleanup;
function activate(ctx) {
  cleanup = registerBidDeskHandlers(ctx.host.deps);
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
