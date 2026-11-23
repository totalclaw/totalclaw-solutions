import { openSpreadsheetFile, readWorksheetData } from '../services/spreadsheetRead';
import { BrowserWindow, ipcMain, shell } from 'electron';
import {
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { basename, extname, isAbsolute, join } from 'node:path';
import AdmZip from 'adm-zip';
import * as XLSX from 'xlsx';
import {
  IPC_CHANNELS,
  type BidDeskExportPackageRequest,
  type BidDeskExportPackageResponse,
  type BidDeskLoadResponse,
  type BidDeskParseDocumentRequest,
  type BidDeskParseDocumentResponse,
  type BidDeskSaveRequest,
} from '@totalclaw/ipc-contracts';
import { privateRoot } from '../services/accountScope';
import type { IpcDeps } from './shared';
import { t as i18nT } from '@totalclaw/i18n';

const SNAPSHOT_VERSION = 2;
const MAX_PARSE_BYTES = 100 * 1024 * 1024;

type LooseRecord = Record<string, any>;
type ExportLocale = 'zh-CN' | 'en-US' | 'ar' | 'bilingual';

function snapshotPath(): string {
  return join(privateRoot(), 'bid-desk.json');
}

function readSnapshot(): unknown | null {
  try {
    const path = snapshotPath();
    if (!existsSync(path)) return null;
    const value = JSON.parse(readFileSync(path, 'utf-8'));
    return value?.version === SNAPSHOT_VERSION ? value : null;
  } catch {
    return null;
  }
}

function writeSnapshot(snapshot: unknown): void {
  const value = snapshot as LooseRecord;
  if (!value || value.version !== SNAPSHOT_VERSION || !Array.isArray(value.cases)) {
    throw new Error(i18nT('项目工作台快照格式无效'));
  }
  const serialized = JSON.stringify(snapshot, null, 2);
  if (Buffer.byteLength(serialized, 'utf-8') > 50 * 1024 * 1024) {
    throw new Error(i18nT('项目工作台快照超过 50MB，请移除冗余解析文本后再保存'));
  }
  const path = snapshotPath();
  const temp = `${path}.tmp`;
  mkdirSync(privateRoot(), { recursive: true });
  writeFileSync(temp, serialized, { encoding: 'utf-8', mode: 0o600 });
  renameSync(temp, path);
}

function actorFrom(deps: IpcDeps): { id: string; name: string } {
  const user = deps.serviceAuth?.readSession()?.user as LooseRecord | undefined;
  const id = String(user?.id || user?.userId || user?.phone || user?.email || 'local-user');
  const name = String(
    user?.displayName || user?.nickname || user?.name || user?.phone || user?.email || i18nT('本机用户'),
  );
  return { id, name };
}

function ensureReadableFile(path: string): void {
  if (!path || !isAbsolute(path) || !existsSync(path)) throw new Error(i18nT('文件路径无效或文件不存在'));
  const stat = statSync(path);
  if (!stat.isFile()) throw new Error(i18nT('请选择一个文件'));
  if (stat.size > MAX_PARSE_BYTES) throw new Error(i18nT('单个文件超过 100MB，请拆分后再解析'));
}

function decodeXml(value: string): string {
  return value
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, '\'')
    .replace(/&amp;/g, '&');
}

function parseDocx(path: string): BidDeskParseDocumentResponse {
  const zip = new AdmZip(path);
  const xml = zip.getEntry('word/document.xml')?.getData().toString('utf-8');
  if (!xml) throw new Error(i18nT('Word 文件缺少 document.xml'));
  // 单遍按文档顺序提取文本与段落/表格换行、制表符，避免先替换再只匹配 <w:t> 丢失所有断行与分列
  const parts: string[] = [];
  for (const m of xml.matchAll(/<w:t(?:\s[^>]*)?>([\s\S]*?)<\/w:t>|(<\/w:tc>)|(<\/w:p>|<\/w:tr>|<w:br\b[^>]*\/>)/g)) {
    if (m[1] !== undefined) parts.push(decodeXml(m[1]));
    else if (m[2]) parts.push('\t');
    else if (m[3]) parts.push('\n');
  }
  const text = parts
    .join('')
    .replace(/\t{2,}/g, '\t')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  return { text };
}

function parseSpreadsheet(path: string): BidDeskParseDocumentResponse {
  const workbook = openSpreadsheetFile(path, { cellDates: true });
  const sheets = workbook.SheetNames.map((name) => ({
    name,
    rows: readWorksheetData(workbook.Sheets[name], { raw: false, defval: '' }).rows,
  }));
  const text = sheets.map((sheet) => (
    `## ${sheet.name}\n`
    + sheet.rows.map((row) => row.map((cell) => String(cell ?? '').trim()).join('\t')).join('\n')
  )).join('\n\n');
  return { text, sheets };
}

async function parsePdf(path: string): Promise<BidDeskParseDocumentResponse> {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const task = pdfjs.getDocument({
    data: new Uint8Array(readFileSync(path)),
    useSystemFonts: true,
  });
  const document = await task.promise;
  const pages: string[] = [];
  const scannedPageNumbers: number[] = [];
  try {
    for (let index = 1; index <= document.numPages; index += 1) {
      const page = await document.getPage(index);
      const content = await page.getTextContent();
      const text = (content.items as Array<{ str?: string; hasEOL?: boolean }>)
        .map((item) => `${item.str || ''}${item.hasEOL ? '\n' : ' '}`)
        .join('')
        .replace(/[ \t]+\n/g, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
      pages.push(i18nT("[第 {index} 页]\n{text}", { index, text }));
      if (text.replace(/\s/g, '').length < 20) scannedPageNumbers.push(index);
    }
    const pageImages: Array<{ page: number; dataUrl: string }> = [];
    if (scannedPageNumbers.length) {
      const { createCanvas } = await import('@napi-rs/canvas');
      for (const pageNumber of scannedPageNumbers.slice(0, 12)) {
        const page = await document.getPage(pageNumber);
        const baseViewport = page.getViewport({ scale: 1 });
        const scale = Math.min(2, 1_600 / Math.max(baseViewport.width, 1));
        const viewport = page.getViewport({ scale });
        const canvas = createCanvas(Math.ceil(viewport.width), Math.ceil(viewport.height));
        const canvasContext = canvas.getContext('2d');
        await page.render({
          canvasContext: canvasContext as any,
          viewport,
        }).promise;
        pageImages.push({
          page: pageNumber,
          dataUrl: canvas.toDataURL('image/jpeg', 82),
        });
      }
    }
    const text = pages.join('\n\n');
    const warnings: string[] = [];
    if (!text.replace(/\[第 \d+ 页\]\s*/g, '').trim()) warnings.push(i18nT('PDF 未提取到文本，已将扫描页送入视觉识别队列。'));
    if (scannedPageNumbers.length > 12) warnings.push(i18nT('扫描页共 {p0} 页，本次先识别前 12 页；其余页面请拆分后继续。', { p0: scannedPageNumbers.length }));
    return {
      text,
      pageCount: pages.length,
      pageImages,
      warnings: warnings.length ? warnings : undefined,
    };
  } finally {
    await document.destroy();
  }
}

async function parseDocument(payload: BidDeskParseDocumentRequest): Promise<BidDeskParseDocumentResponse> {
  const path = String(payload?.path || '').trim();
  ensureReadableFile(path);
  const extension = extname(payload?.name || path).toLowerCase();
  if (extension === '.docx') return parseDocx(path);
  if (['.xlsx', '.xls', '.csv'].includes(extension)) return parseSpreadsheet(path);
  if (extension === '.pdf') return parsePdf(path);
  if (['.png', '.jpg', '.jpeg', '.webp', '.tif', '.tiff', '.bmp'].includes(extension)) {
    return { text: '', warnings: [i18nT('图片文件需要使用视觉识别。')] };
  }
  if (extension === '.doc') {
    return { text: '', warnings: [i18nT('旧版 .doc 暂不支持本地解析，请另存为 .docx 后重试。')] };
  }
  return { text: readFileSync(path, 'utf-8') };
}

function xml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function html(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function safeFileName(value: string): string {
  return basename(value).replace(/[\\/:*?"<>|]/g, '_').trim() || 'bid-output';
}

function money(value: unknown, locale: ExportLocale): string {
  return new Intl.NumberFormat(locale === 'ar' ? 'ar-SA' : locale === 'zh-CN' ? 'zh-CN' : 'en-US', {
    style: 'currency',
    currency: 'SAR',
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);
}

function percent(value: unknown): string {
  return `${((Number(value) || 0) * 100).toFixed(1)}%`;
}

function selectedScenario(bidCase: LooseRecord): LooseRecord {
  const scenarios = Array.isArray(bidCase.scenarios) ? bidCase.scenarios : [];
  return scenarios.find((item: LooseRecord) => item.id === bidCase?.decision?.frozenScenarioId)
    || scenarios[0]
    || {};
}

function fieldValue(bidCase: LooseRecord, keys: string[]): string {
  const fields = Array.isArray(bidCase.fields) ? bidCase.fields : [];
  const normalized = keys.map((key) => key.toLowerCase());
  const field = fields.find((item: LooseRecord) => normalized.includes(String(item.key || '').toLowerCase()));
  return String(field?.value || '').trim();
}

function localize(locale: ExportLocale) {
  const ar = locale === 'ar';
  const zh = locale === 'zh-CN';
  return {
    quotation: ar ? 'عرض السعر الرسمي' : zh ? i18nT('正式报价单') : 'Formal Quotation',
    customer: ar ? 'العميل' : zh ? i18nT('客户') : 'Customer',
    project: ar ? 'المشروع' : zh ? i18nT('项目') : 'Project',
    rfq: ar ? 'رقم طلب العرض' : zh ? i18nT('询价编号') : 'RFQ Number',
    item: ar ? 'البند' : zh ? i18nT('品项') : 'Item',
    quantity: ar ? 'الكمية' : zh ? i18nT('数量') : 'Quantity',
    unitPrice: ar ? 'سعر الوحدة' : zh ? i18nT('单价') : 'Unit Price',
    total: ar ? 'الإجمالي' : zh ? i18nT('金额') : 'Total',
    payment: ar ? 'شروط الدفع' : zh ? i18nT('付款条件') : 'Payment Terms',
    delivery: ar ? 'مدة التسليم' : zh ? i18nT('交付周期') : 'Delivery',
    warranty: ar ? 'الضمان' : zh ? i18nT('质保') : 'Warranty',
    validity: ar ? 'صلاحية العرض' : zh ? i18nT('报价有效期') : 'Offer Validity',
    approved: ar ? 'الإصدار المعتمد' : zh ? i18nT('已批准版本') : 'Approved Version',
  };
}

function quotationModel(bidCase: LooseRecord, locale: ExportLocale) {
  const labels = localize(locale);
  const scenario = selectedScenario(bidCase);
  const lineItems = (Array.isArray(bidCase.lineItems) ? bidCase.lineItems : []).map(
    (item: LooseRecord, index: number) => {
      const quantity = Number(item.quantity) || 0;
      const unitPrice = Number(item.unitPriceSar) || 0;
      return [
        String(index + 1),
        String(item.description || ''),
        `${quantity} ${item.unit || ''}`.trim(),
        unitPrice ? money(unitPrice, locale) : '—',
        unitPrice ? money(unitPrice * quantity, locale) : '—',
      ];
    },
  );
  return {
    labels,
    scenario,
    title: labels.quotation,
    metadata: [
      [labels.customer, String(bidCase.customer || '')],
      [labels.project, String(bidCase.project || '')],
      [labels.rfq, String(bidCase.rfqNumber || '')],
      [labels.validity, fieldValue(bidCase, ['offer_validity', 'bid_validity', 'validity']) || '—'],
      [labels.payment, fieldValue(bidCase, ['payment_terms', 'payment']) || '—'],
      [labels.delivery, fieldValue(bidCase, ['delivery_period', 'delivery']) || '—'],
      [labels.warranty, fieldValue(bidCase, ['warranty', 'warranty_terms']) || '—'],
    ],
    headers: ['#', labels.item, labels.quantity, labels.unitPrice, labels.total],
    rows: lineItems,
    grandTotal: money(scenario.offeredPriceSar, locale),
    version: Number(bidCase?.decision?.version) || 1,
  };
}

function paragraph(text: string, rtl = false, heading = false): string {
  return `<w:p><w:pPr>${rtl ? '<w:bidi/>' : ''}${heading ? '<w:spacing w:before="240" w:after="120"/>' : ''}</w:pPr>`
    + `<w:r><w:rPr>${rtl ? '<w:rtl/>' : ''}${heading ? '<w:b/><w:sz w:val="30"/>' : '<w:sz w:val="22"/>'}</w:rPr>`
    + `<w:t xml:space="preserve">${xml(text)}</w:t></w:r></w:p>`;
}

function table(headers: string[], rows: string[][], rtl = false): string {
  const renderRow = (cells: string[], isHeader = false) => `<w:tr>${cells.map((cell) => (
    `<w:tc><w:tcPr><w:tcW w:w="2200" w:type="dxa"/>${isHeader ? '<w:shd w:fill="E9ECFF"/>' : ''}</w:tcPr>`
    + `<w:p><w:pPr>${rtl ? '<w:bidi/>' : ''}</w:pPr><w:r><w:rPr>${isHeader ? '<w:b/>' : ''}${rtl ? '<w:rtl/>' : ''}`
    + `<w:sz w:val="20"/></w:rPr><w:t xml:space="preserve">${xml(cell)}</w:t></w:r></w:p></w:tc>`
  )).join('')}</w:tr>`;
  return `<w:tbl><w:tblPr><w:tblW w:w="0" w:type="auto"/><w:tblBorders>`
    + '<w:top w:val="single" w:sz="4" w:color="D9DDE8"/><w:left w:val="single" w:sz="4" w:color="D9DDE8"/>'
    + '<w:bottom w:val="single" w:sz="4" w:color="D9DDE8"/><w:right w:val="single" w:sz="4" w:color="D9DDE8"/>'
    + '<w:insideH w:val="single" w:sz="4" w:color="D9DDE8"/><w:insideV w:val="single" w:sz="4" w:color="D9DDE8"/>'
    + `</w:tblBorders></w:tblPr>${renderRow(headers, true)}${rows.map((row) => renderRow(row)).join('')}</w:tbl>`;
}

function writeDocx(path: string, blocks: string[]): void {
  const zip = new AdmZip();
  zip.addFile('[Content_Types].xml', Buffer.from(
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
    + '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'
    + '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>'
    + '<Default Extension="xml" ContentType="application/xml"/>'
    + '<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>'
    + '<Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>'
    + '</Types>',
  ));
  zip.addFile('_rels/.rels', Buffer.from(
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
    + '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
    + '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>'
    + '</Relationships>',
  ));
  zip.addFile('word/_rels/document.xml.rels', Buffer.from(
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
    + '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
    + '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>'
    + '</Relationships>',
  ));
  zip.addFile('word/styles.xml', Buffer.from(
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
    + '<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">'
    + '<w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/>'
    + '<w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:eastAsia="Microsoft YaHei" w:cs="Arial"/></w:rPr></w:style>'
    + '</w:styles>',
  ));
  zip.addFile('word/document.xml', Buffer.from(
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
    + '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">'
    + `<w:body>${blocks.join('')}<w:sectPr><w:pgSz w:w="11906" w:h="16838"/>`
    + '<w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134"/></w:sectPr></w:body></w:document>',
  ));
  zip.writeZip(path);
}

function quotationBlocks(bidCase: LooseRecord, locale: ExportLocale): string[] {
  const rtl = locale === 'ar';
  const model = quotationModel(bidCase, locale);
  return [
    paragraph(model.title, rtl, true),
    paragraph(`${model.labels.approved} ${model.version}`, rtl),
    table(model.metadata.map(([key]) => key), [model.metadata.map(([, value]) => value)], rtl),
    paragraph('', rtl),
    table(model.headers, model.rows, rtl),
    paragraph(`${model.labels.total}: ${model.grandTotal}`, rtl, true),
  ];
}

function genericListBlocks(title: string, bidCase: LooseRecord, rows: string[][], rtl = false): string[] {
  return [
    paragraph(title, rtl, true),
    paragraph(`${bidCase.customer || ''} · ${bidCase.project || ''} · ${bidCase.rfqNumber || ''}`, rtl),
    table(['#', 'Requirement', 'Response / Decision', 'Evidence'], rows, rtl),
  ];
}

function quotationHtml(bidCase: LooseRecord, locale: ExportLocale): string {
  const model = quotationModel(bidCase, locale);
  const rtl = locale === 'ar';
  const rows = model.rows.map((row) => `<tr>${row.map((cell) => `<td>${html(cell)}</td>`).join('')}</tr>`).join('');
  const metadata = model.metadata.map(([key, value]) => `<div><b>${html(key)}</b><span>${html(value)}</span></div>`).join('');
  return `<!doctype html><html lang="${locale}" dir="${rtl ? 'rtl' : 'ltr'}"><head><meta charset="utf-8"><style>`
    + 'body{font-family:Arial,"Microsoft YaHei",sans-serif;color:#172033;margin:42px;line-height:1.5}'
    + 'h1{color:#302b77;border-bottom:3px solid #655cf5;padding-bottom:14px}.meta{display:grid;grid-template-columns:1fr 1fr;gap:10px 24px;margin:20px 0}'
    + '.meta div{display:grid;gap:3px}.meta span{color:#5d6678}table{width:100%;border-collapse:collapse}th,td{border:1px solid #d9dde8;padding:8px;text-align:start}th{background:#eef0ff}'
    + '.total{margin-top:22px;text-align:end;font-size:20px;font-weight:700}</style></head><body>'
    + `<h1>${html(model.title)}</h1><p>${html(model.labels.approved)} ${model.version}</p><div class="meta">${metadata}</div>`
    + `<table><thead><tr>${model.headers.map((cell) => `<th>${html(cell)}</th>`).join('')}</tr></thead><tbody>${rows}</tbody></table>`
    + `<div class="total">${html(model.labels.total)}: ${html(model.grandTotal)}</div></body></html>`;
}

function bilingualQuotationHtml(bidCase: LooseRecord): string {
  const english = quotationHtml(bidCase, 'en-US');
  const arabic = quotationHtml(bidCase, 'ar');
  const arabicBody = arabic.match(/<body>([\s\S]*?)<\/body>/i)?.[1] || '';
  return english.replace(
    '</body></html>',
    `<section dir="rtl" style="page-break-before:always;padding-top:12px">${arabicBody}</section></body></html>`,
  );
}

async function writePdf(path: string, htmlContent: string): Promise<void> {
  const window = new BrowserWindow({
    show: false,
    webPreferences: { sandbox: true, contextIsolation: true, javascript: false },
  });
  try {
    await window.loadURL(`data:text/html;base64,${Buffer.from(htmlContent).toString('base64')}`);
    const pdf = await window.webContents.printToPDF({
      printBackground: true,
      pageSize: 'A4',
      margins: { top: 0.4, right: 0.4, bottom: 0.4, left: 0.4 },
    });
    writeFileSync(path, pdf);
  } finally {
    window.destroy();
  }
}

async function exportPackage(
  payload: BidDeskExportPackageRequest,
  exportActor: { id: string; name: string },
): Promise<BidDeskExportPackageResponse> {
  try {
    const folder = String(payload?.folderPath || '').trim();
    if (!folder || !isAbsolute(folder)) return { ok: false, error: i18nT('请选择有效的输出文件夹') };
    mkdirSync(folder, { recursive: true });
    const bidCase = (payload?.bidCase || {}) as LooseRecord;
    const fields = Array.isArray(bidCase.fields) ? bidCase.fields : [];
    const lineItems = Array.isArray(bidCase.lineItems) ? bidCase.lineItems : [];
    const findings = Array.isArray(bidCase.findings) ? bidCase.findings : [];
    const scenario = selectedScenario(bidCase);
    const lineTotal = lineItems.reduce(
      (total: number, item: LooseRecord) =>
        total + (Number(item.unitPriceSar) || 0) * (Number(item.quantity) || 0),
      0,
    );
    const exportBlockers = [
      bidCase?.decision?.decision !== 'approved' ? i18nT('当前版本尚未批准') : '',
      !String(bidCase?.decision?.comment || '').trim() ? i18nT('审批意见为空') : '',
      !scenario?.id || scenario.id !== bidCase?.decision?.frozenScenarioId ? i18nT('未冻结有效报价场景') : '',
      scenario?.belowMinimumMargin ? i18nT('报价低于最低毛利率') : '',
      scenario?.id && Math.abs(lineTotal - Number(scenario.offeredPriceSar || 0)) > 1
        ? i18nT('BOQ 逐行金额合计与报价场景不一致') : '',
      !fields.length || fields.some((item: LooseRecord) =>
        !['accepted', 'modified'].includes(item.reviewStatus)) ? i18nT('仍有字段待复核') : '',
      !lineItems.length || lineItems.some((item: LooseRecord) =>
        !['accepted', 'modified'].includes(item.reviewStatus) || Number(item.unitPriceSar) <= 0 || !item.evidence?.length)
        ? i18nT('BOQ 品项尚未完成售价、复核或证据确认') : '',
      !findings.length || findings.some((item: LooseRecord) =>
        !item.humanDecision || item.humanDecision === 'pending')
        ? i18nT('符合性结论尚未全部人工确认') : '',
    ].filter(Boolean);
    if (exportBlockers.length) {
      return { ok: false, error: i18nT('不能输出正式文件：{p0}', { p0: exportBlockers.join(i18nT('；')) }) };
    }
    const base = safeFileName(String(bidCase.id || 'bid-case'));
    const locale = payload.locale || 'en-US';
    const selected = new Set(payload.artifactIds || [
      'english_quotation', 'arabic_quotation', 'bilingual_quotation',
      'compliance', 'line_items', 'missing_items', 'clarifications',
      'deviations', 'proposal', 'approval', 'audit',
    ]);
    const paths: string[] = [];
    const add = (path: string) => { paths.push(path); };

    // 兼容旧版单语 quotation id；新版完整包必须同时包含英文、阿文和英阿双语三份。
    const exportEnglish = selected.has('english_quotation')
      || (selected.has('quotation') && locale !== 'ar');
    const exportArabic = selected.has('arabic_quotation')
      || (selected.has('quotation') && locale === 'ar');
    if (exportEnglish) {
      const docxPath = join(folder, `${base}_Quotation_EN.docx`);
      writeDocx(docxPath, quotationBlocks(bidCase, 'en-US'));
      add(docxPath);
      const pdfPath = join(folder, `${base}_Quotation_EN.pdf`);
      await writePdf(pdfPath, quotationHtml(bidCase, 'en-US'));
      add(pdfPath);
    }
    if (exportArabic) {
      const docxPath = join(folder, `${base}_Quotation_AR.docx`);
      writeDocx(docxPath, quotationBlocks(bidCase, 'ar'));
      add(docxPath);
      const pdfPath = join(folder, `${base}_Quotation_AR.pdf`);
      await writePdf(pdfPath, quotationHtml(bidCase, 'ar'));
      add(pdfPath);
    }
    if (selected.has('bilingual_quotation')) {
      const bilingualDocx = join(folder, `${base}_Quotation_EN-AR.docx`);
      writeDocx(bilingualDocx, [
        ...quotationBlocks(bidCase, 'en-US'),
        paragraph('العرض باللغة العربية', true, true),
        ...quotationBlocks(bidCase, 'ar'),
      ]);
      add(bilingualDocx);
      const bilingualPdf = join(folder, `${base}_Quotation_EN-AR.pdf`);
      await writePdf(bilingualPdf, bilingualQuotationHtml(bidCase));
      add(bilingualPdf);
    }

    const exportFindings = Array.isArray(bidCase.findings) ? bidCase.findings : [];
    const findingRows = exportFindings.map((item: LooseRecord, index: number) => [
      String(index + 1),
      String(item.requirement || ''),
      String(item.response || ''),
      String(item.humanDecision || item.status || ''),
      String(item.owner || ''),
      (Array.isArray(item.evidence) ? item.evidence : [])
        .map((entry: LooseRecord) => `${entry.fileId || ''}${entry.page ? ` p.${entry.page}` : ''}${entry.sheet ? ` ${entry.sheet}!${entry.cell || ''}` : ''}`)
        .join('; '),
      String(item.clarification || ''),
    ]);
    if (selected.has('compliance')) {
      const workbook = XLSX.utils.book_new();
      const sheet = XLSX.utils.aoa_to_sheet([
        ['#', 'Requirement', 'Response', 'Human Decision', 'Owner', 'Evidence', 'Clarification'],
        ...findingRows,
      ]);
      XLSX.utils.book_append_sheet(workbook, sheet, 'Compliance Matrix');
      const path = join(folder, `${base}_Compliance_Matrix.xlsx`);
      XLSX.writeFile(workbook, path);
      add(path);
    }
    if (selected.has('line_items')) {
      const workbook = XLSX.utils.book_new();
      const rows = (Array.isArray(bidCase.lineItems) ? bidCase.lineItems : []).map(
        (item: LooseRecord, index: number) => [
          index + 1,
          item.description || '',
          item.model || '',
          item.quantity || 0,
          item.unit || '',
          item.matchedProduct || '',
          item.unitCostSar || 0,
          item.unitPriceSar || 0,
          (Number(item.unitPriceSar) || 0) * (Number(item.quantity) || 0),
          item.reviewStatus || '',
          (Array.isArray(item.evidence) ? item.evidence : [])
            .map((entry: LooseRecord) => `${entry.fileId || ''}${entry.page ? ` p.${entry.page}` : ''}${entry.sheet ? ` ${entry.sheet}!${entry.cell || ''}` : ''}${entry.excerpt ? ` — ${entry.excerpt}` : ''}`)
            .join('; '),
        ],
      );
      XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet([
        ['#', 'Description', 'Model', 'Quantity', 'Unit', 'Matched Product', 'Unit Cost SAR', 'Unit Price SAR', 'Total SAR', 'Review Status', 'Source Evidence'],
        ...rows,
      ]), 'BOQ');
      const path = join(folder, `${base}_Structured_BOQ.xlsx`);
      XLSX.writeFile(workbook, path);
      add(path);
    }
    if (selected.has('missing_items')) {
      const missingItems = Array.isArray(bidCase.missingItems) ? bidCase.missingItems : [];
      const path = join(folder, `${base}_Missing_Items.docx`);
      writeDocx(path, [
        paragraph('Missing Items List', false, true),
        paragraph(`${bidCase.customer || ''} · ${bidCase.project || ''} · ${bidCase.rfqNumber || ''}`),
        table(
          ['#', 'Missing Information / Document', 'Status', 'Required Action'],
          (missingItems.length ? missingItems : ['No unresolved missing items.']).map(
            (item: unknown, index: number) => [
              String(index + 1),
              String(item || ''),
              missingItems.length ? 'Open' : 'Closed',
              missingItems.length ? 'Obtain and review before submission' : 'No action required',
            ],
          ),
        ),
      ]);
      add(path);
    }

    const listDocument = (id: string, title: string, predicate: (item: LooseRecord) => boolean) => {
      if (!selected.has(id)) return;
      const rows = exportFindings.filter(predicate).map((item: LooseRecord, index: number) => [
        String(index + 1),
        String(item.requirement || ''),
        String(item.clarification || item.response || item.humanDecision || item.status || ''),
        (Array.isArray(item.evidence) ? item.evidence : []).map((entry: LooseRecord) => entry.excerpt || entry.fileId || '').join('; '),
      ]);
      const path = join(folder, `${base}_${safeFileName(title)}.docx`);
      writeDocx(path, genericListBlocks(title, bidCase, rows));
      add(path);
    };
    listDocument('clarifications', 'Clarification_List', (item) => Boolean(item.clarification));
    listDocument('deviations', 'Technical_Deviation_List', (item) =>
      ['deviation', 'major_deviation'].includes(item.humanDecision || item.status));

    if (selected.has('proposal')) {
      const scenario = selectedScenario(bidCase);
      const path = join(folder, `${base}_Commercial_Proposal.docx`);
      writeDocx(path, [
        paragraph('Commercial Proposal', false, true),
        paragraph(`${bidCase.customer || ''} · ${bidCase.project || ''} · ${bidCase.rfqNumber || ''}`),
        table(
          ['Total Offer', 'Payment Terms', 'Delivery', 'Warranty', 'Offer Validity'],
          [[
            money(scenario.offeredPriceSar, 'en-US'),
            fieldValue(bidCase, ['payment_terms', 'payment']) || '—',
            fieldValue(bidCase, ['delivery_period', 'delivery']) || String(scenario.deliveryImpact || '—'),
            fieldValue(bidCase, ['warranty', 'warranty_terms']) || '—',
            fieldValue(bidCase, ['offer_validity', 'bid_validity', 'validity']) || '—',
          ]],
        ),
        paragraph('The offer is subject to the approved clarifications and technical deviation list.'),
      ]);
      add(path);
    }
    if (selected.has('approval')) {
      const scenario = selectedScenario(bidCase);
      const summary = bidCase.decisionSummary || {};
      const majorDeviations = exportFindings.filter((item: LooseRecord) =>
        ['deviation', 'major_deviation'].includes(item.humanDecision || item.status));
      const evidenceRows = (Array.isArray(summary.evidenceSources) ? summary.evidenceSources : [])
        .map((entry: LooseRecord, index: number) => [
          String(index + 1),
          String(entry.fileId || ''),
          entry.page ? `p.${entry.page}` : entry.sheet ? `${entry.sheet}!${entry.cell || ''}` : '—',
          String(entry.excerpt || ''),
        ]);
      const scenarioRows = (Array.isArray(bidCase.scenarios) ? bidCase.scenarios : [])
        .map((item: LooseRecord) => [
          String(item.name || ''),
          money(item.landedCostSar, 'en-US'),
          money(item.suggestedPriceSar, 'en-US'),
          money(item.offeredPriceSar, 'en-US'),
          `${money(item.marginSar, 'en-US')} / ${percent(item.marginRate)}`,
          money(item.discountImpactSar, 'en-US'),
          String(item.deliveryImpact || '—'),
        ]);
      const path = join(folder, `${base}_Internal_Approval.docx`);
      writeDocx(path, [
        paragraph('Internal Bid Approval', false, true),
        table(
          ['Case', 'Customer', 'Project', 'RFQ', 'Offer', 'Margin', 'Approver', 'Decision'],
          [[
            String(bidCase.id || ''),
            String(bidCase.customer || ''),
            String(bidCase.project || ''),
            String(bidCase.rfqNumber || ''),
            money(scenario.offeredPriceSar, 'en-US'),
            `${money(scenario.marginSar, 'en-US')} / ${percent(scenario.marginRate)}`,
            String(bidCase.decision?.approver || ''),
            String(bidCase.decision?.decision || ''),
          ]],
        ),
        paragraph(`AI Recommendation: ${summary.aiRecommendation || '—'}`),
        paragraph('Pricing Scenarios', false, true),
        table(
          ['Scenario', 'Landed Cost', 'Suggested Price', 'Offered Price', 'Margin', 'Discount Impact', 'Delivery Impact'],
          scenarioRows,
        ),
        paragraph('Major Technical Deviations', false, true),
        table(
          ['Requirement', 'Company Response', 'Human Decision', 'Owner'],
          majorDeviations.length
            ? majorDeviations.map((item: LooseRecord) => [
              String(item.requirement || ''),
              String(item.response || ''),
              String(item.humanDecision || item.status || ''),
              String(item.owner || ''),
            ])
            : [['None', '—', 'Confirmed', '—']],
        ),
        paragraph(`Delivery / Certification / Payment / Other Risks: ${(Array.isArray(summary.risks) ? summary.risks : []).join('; ') || '—'}`),
        paragraph(`Management Decisions Required: ${(Array.isArray(summary.keyDecisions) ? summary.keyDecisions : []).join('; ') || '—'}`),
        paragraph('Evidence Sources', false, true),
        table(
          ['#', 'Source File', 'Location', 'Excerpt'],
          evidenceRows.length ? evidenceRows : [['1', '—', '—', 'No source recorded']],
        ),
        paragraph(`Approval Comment: ${bidCase.decision?.comment || '—'}`),
      ]);
      add(path);
    }
    if (selected.has('audit')) {
      const path = join(folder, `${base}_Audit_Trail.json`);
      writeFileSync(path, JSON.stringify({
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
            action: 'artifacts.exported',
            detail: i18nT('已导出当前批准版本的正式投标文件包。'),
          },
          ...(Array.isArray(bidCase.audit) ? bidCase.audit : []),
        ],
      }, null, 2), 'utf-8');
      add(path);
    }
    try { if (paths[0]) shell.showItemInFolder(paths[0]); } catch { /* ignore */ }
    return { ok: true, paths };
  } catch (error: any) {
    return { ok: false, error: error?.message || String(error) };
  }
}

export function registerBidDeskHandlers(deps: IpcDeps): void {
  ipcMain.handle(IPC_CHANNELS.BID_DESK_LOAD, (): BidDeskLoadResponse => ({
    snapshot: readSnapshot(),
    actor: actorFrom(deps),
  }));
  ipcMain.handle(IPC_CHANNELS.BID_DESK_SAVE, (_event, payload: BidDeskSaveRequest) => {
    writeSnapshot(payload?.snapshot);
    return { ok: true };
  });
  ipcMain.handle(IPC_CHANNELS.BID_DESK_PARSE_DOCUMENT, (_event, payload: BidDeskParseDocumentRequest) =>
    parseDocument(payload));
  ipcMain.handle(IPC_CHANNELS.BID_DESK_EXPORT_PACKAGE, (_event, payload: BidDeskExportPackageRequest) =>
    exportPackage(payload, actorFrom(deps)));
}
