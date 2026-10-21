/**
 * 正式件生成：把卡片上的数字变成客户能直接打开的 Word / Excel / PDF。
 *
 * 需求 D1-14/15 要的是"正式报价"和"技术方案"，之前落的是 .csv / .docx.txt 文本——
 * 发给沙特客户等于露怯。这里生成真排版件，且**不引新依赖**：
 *   Excel → `xlsx`（已在依赖）。报价表**写成公式**而不是算好的死数字，
 *           客户改一个数量，行小计和合计自己跟着变——这比 PDF 更有说服力。
 *   Word  → `adm-zip`（已在依赖）直接组 OOXML。文档结构简单（标题/段落/表格），
 *           为此拉一个 docx 库不划算。
 *   PDF   → Electron 自带 `webContents.printToPDF`，离屏窗口渲染 HTML。
 *
 * 未审批时**每种格式都要带 DRAFT 水印**（不是只在文件名上写 draft）：
 * Excel 顶部红色警示行 + sheet 名带 DRAFT，Word 首段红色大字，PDF 页面斜向水印。
 */
import { BrowserWindow, screen } from 'electron';
import { t as i18nT } from '@totalclaw/i18n';

export interface OutputBomRow {
  sku: string;
  description: string;
  qty: number;
  unit: string;
  unitCost: number;
  /** 折扣率 ∈ (0,1]。任一行给了就多出一列折扣，行小计公式变成 数量×单价×折扣 */
  discount?: number;
  /** 渲染层算好的行小计（供校验器对账；xlsx 里那一格仍写公式） */
  lineTotal?: number;
  currency?: string;
}

/**
 * 来源标注（P0-2）—— 客户看到一个数字，必须能知道它从哪来。
 * 收件条目本身带 `external.sourceUrl` / `fetchedAt` / ticket 元数据，数据一直都在。
 */
export interface OutputProvenance {
  sources: {
    name: string;
    url?: string;
    fetchedAt?: string;
    kind?: 'email' | 'web' | 'upload' | 'ticket' | 'whatsapp' | 'snapshot';
    /** 回原文的位置线索：「PDF 第 3 页」/「邮件第 2 段」 */
    locator?: string;
  }[];
  itemCount?: number;
  /** 计算口径，如「金额口径=含税」 */
  basis?: string;
  caseNo?: string;
}

export interface OutputCalcLine {
  label: string;
  formula: string;
  result: number;
  currency?: string;
  emphasis?: string;
}

export interface OutputSection {
  title: string;
  body: string;
}

export interface OutputContext {
  title: string;
  customer: string;
  project: string;
  ruleVersion: string;
  draft: boolean;
  bom?: OutputBomRow[];
  calcLines?: OutputCalcLine[];
  priceRange?: { low: number; high: number };
  fields?: { label: string; value: string }[];
  sections?: OutputSection[];
  /**
   * 通用表格。符合性矩阵、任务清单这类输出物**不是报价表**，
   * 套 BOM 模板会让两份不同的 xlsx 生成出逐字节相同的报价单。
   * 给了 table 就按它出表，不再走 BOM/报价那套。
   */
  table?: { sheetName?: string; headers: string[]; rows: (string | number)[][] };
  /** 来源标注（P0-2）。每种格式都会把它落到页脚 / 表尾 / 文末 */
  provenance?: OutputProvenance;
  /** 校验结论（P0-1），如「12/12 项通过」。写进页脚，客户能看到这份文件核过 */
  validationNote?: string;
}

/**
 * 草稿水印与免责声明**会被烧进生成的 xlsx/docx/pdf**，所以必须在生成那一刻按当前
 * 语言取值。写成模块顶层常量的话，import 期就定死在默认中文 —— 英文模式下交付给
 * 客户的报价单会带一行中文水印。
 */
const draftBanner = () => i18nT('【草稿 DRAFT · 未经审批不得对外】');

/** AI 生成属性必须明示 —— 我们的交付物直接进客户商务流程，这是合规项不是体验项（P3-4）。 */
const aiDisclaimer = () => i18nT('内容由 AI 生成，请核实重要信息。');

// ─────────────────────────────────────────────────────────────────────────────
// 来源页脚（P0-2）：所有格式共用同一份文案组装，避免四处各写一遍走样
// ─────────────────────────────────────────────────────────────────────────────

/**
 * 组装来源行。格式（需求 P0-2 第 1 条）：
 *   `来源：<原始文件名/网址>｜<条目数>｜<计算口径>｜校验：<结论>｜<任务编号>`
 *
 * 招标类条目的合规三件套（来源名称 / 来源链接 / 抓取时间）逐条单列 ——
 * 挤在一行里客户根本读不出来哪个链接对应哪个时间。
 */
export function buildProvenanceLines(ctx: OutputContext): string[] {
  const p = ctx.provenance;
  const lines: string[] = [];
  const head: string[] = [];

  const first = p?.sources?.[0];
  head.push(`${i18nT('来源')}：${first ? (first.url || first.name) : i18nT('本机录入')}`);
  if (p?.itemCount) head.push(i18nT('条目 {p0} 条', { p0: p.itemCount }));
  if (p?.basis) head.push(p.basis);
  if (ctx.validationNote) head.push(`${i18nT('校验')}：${ctx.validationNote}`);
  if (p?.caseNo) head.push(p.caseNo);
  // 分隔符用半角竖线：全角「｜」在阿语 RTL 下换行行为怪，且会被裸中文检查判红
  lines.push(head.join(' | '));

  // 合规三件套逐条列出：来源名称 + 链接 + 抓取时间（招标类必须保留）
  for (const source of p?.sources ?? []) {
    const parts = [source.name];
    if (source.url) parts.push(source.url);
    if (source.fetchedAt) parts.push(`${i18nT('抓取')} ${source.fetchedAt}`);
    if (source.locator) parts.push(source.locator);
    lines.push(`· ${parts.join(' · ')}`);
  }

  lines.push(aiDisclaimer());
  return lines;
}

// ─────────────────────────────────────────────────────────────────────────────
// Excel：报价表写公式，不写死数字
// ─────────────────────────────────────────────────────────────────────────────

export async function buildQuotationXlsx(ctx: OutputContext): Promise<Buffer> {
  const XLSX: any = await import('xlsx');
  const wb = XLSX.utils.book_new();

  // 非报价类表格（符合性矩阵 / 任务清单）走通用表，不套 BOM 模板
  if (ctx.table) {
    const rows: any[][] = [];
    if (ctx.draft) rows.push([draftBanner()]);
    rows.push([i18nT('客户'), ctx.customer]);
    rows.push([i18nT('项目'), ctx.project]);
    rows.push([i18nT('规则版本'), ctx.ruleVersion]);
    rows.push([]);
    rows.push(ctx.table.headers);
    for (const row of ctx.table.rows) rows.push(row as any[]);

    // 来源行落在表尾（P0-2）——sheet 里没有"页脚"这种东西，表尾是唯一跟着数据走的位置
    rows.push([]);
    for (const line of buildProvenanceLines(ctx)) rows.push([line]);

    const sheet = XLSX.utils.aoa_to_sheet(rows);
    sheet['!cols'] = ctx.table.headers.map((h) => ({ wch: Math.max(12, Math.min(48, h.length * 3 + 10)) }));
    const name = ctx.table.sheetName || i18nT('明细');
    // sheet 名上限 31 字符，超了 SheetJS 会抛
    XLSX.utils.book_append_sheet(wb, sheet, `${name}${ctx.draft ? ' (DRAFT)' : ''}`.slice(0, 31));
    return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }) as Buffer;
  }

  // —— BOM sheet：行小计写成 =数量*单价，合计写成 SUM —— 客户改数量就自己重算
  const bom = ctx.bom ?? [];
  // 折扣列**只在真有折扣时才出现**：没有折扣却摆一列全 1 的"折扣"，
  // 客户第一反应是"这是不是漏填了"。列一多，行小计的列号也要跟着挪，所以两套都要算准。
  const hasDiscount = bom.some((row) => typeof row.discount === 'number');
  const header = hasDiscount
    ? ['#', 'SKU', i18nT('描述'), i18nT('数量'), i18nT('单位'), i18nT('单价'), i18nT('折扣率'), i18nT('行小计')]
    : ['#', 'SKU', i18nT('描述'), i18nT('数量'), i18nT('单位'), i18nT('单价'), i18nT('行小计')];
  const totalCol = hasDiscount ? 'H' : 'G';           // 行小计所在列
  const totalColIndex = hasDiscount ? 7 : 6;          // 0-based，写 !ref 用
  const rows: any[][] = [];
  if (ctx.draft) rows.push([draftBanner()]);
  rows.push([i18nT('客户'), ctx.customer]);
  rows.push([i18nT('项目'), ctx.project]);
  rows.push([i18nT('规则版本'), ctx.ruleVersion]);
  rows.push([]);
  const headerRowIndex = rows.length;   // 0-based
  rows.push(header);
  bom.forEach((row, i) => rows.push(hasDiscount
    ? [i + 1, row.sku, row.description, row.qty, row.unit, row.unitCost, row.discount ?? 1, null]
    : [i + 1, row.sku, row.description, row.qty, row.unit, row.unitCost, null]));

  const sheet = XLSX.utils.aoa_to_sheet(rows);
  // 行小计 = 数量 × 单价（× 折扣率）。
  // ⚠ 公式格**必须同时给缓存值 v**：SheetJS 写文件时会静默丢掉只有 f 没有 v 的单元格
  //（实测：写出去再读回来 undefined），结果就是整列空白。v 也让用户没点重算前就能看到数。
  bom.forEach((row, i) => {
    const excelRow = headerRowIndex + 2 + i;   // 1-based，且表头占一行
    const formula = hasDiscount ? `D${excelRow}*F${excelRow}*G${excelRow}` : `D${excelRow}*F${excelRow}`;
    sheet[`${totalCol}${excelRow}`] = {
      t: 'n', f: formula, v: row.qty * row.unitCost * (hasDiscount ? (row.discount ?? 1) : 1),
    };
  });
  let lastRowIndex = headerRowIndex + 1 + bom.length;   // 1-based
  if (bom.length) {
    const first = headerRowIndex + 2;
    const last = headerRowIndex + 1 + bom.length;
    const totalRow = last + 1;
    XLSX.utils.sheet_add_aoa(sheet, [[i18nT('设备合计')]], { origin: `${hasDiscount ? 'G' : 'F'}${totalRow}` });
    sheet[`${totalCol}${totalRow}`] = {
      t: 'n',
      f: `SUM(${totalCol}${first}:${totalCol}${last})`,
      v: bom.reduce((sum, row) => sum + row.qty * row.unitCost * (hasDiscount ? (row.discount ?? 1) : 1), 0),
    };
    lastRowIndex = totalRow;
  }
  // 来源行落在表尾（P0-2）
  const footerStart = lastRowIndex + 2;
  XLSX.utils.sheet_add_aoa(sheet, buildProvenanceLines(ctx).map((line) => [line]), { origin: `A${footerStart}` });
  lastRowIndex = footerStart + buildProvenanceLines(ctx).length - 1;
  sheet['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: lastRowIndex - 1, c: totalColIndex } });
  sheet['!cols'] = hasDiscount
    ? [{ wch: 4 }, { wch: 18 }, { wch: 38 }, { wch: 8 }, { wch: 6 }, { wch: 12 }, { wch: 8 }, { wch: 14 }]
    : [{ wch: 4 }, { wch: 18 }, { wch: 38 }, { wch: 8 }, { wch: 6 }, { wch: 12 }, { wch: 14 }];
  XLSX.utils.book_append_sheet(wb, sheet, ctx.draft ? 'BOM (DRAFT)' : 'BOM');

  // —— 成本与报价 sheet：每行带公式文本，客户看得见依据 ——
  const costRows: any[][] = [];
  if (ctx.draft) costRows.push([draftBanner()]);
  costRows.push([i18nT('项目'), i18nT('金额'), i18nT('公式')]);
  for (const line of ctx.calcLines ?? []) {
    costRows.push([line.label, Math.round(line.result), line.formula]);
  }
  if (ctx.priceRange) {
    costRows.push([]);
    costRows.push([i18nT('建议报价区间'), `${ctx.priceRange.low} — ${ctx.priceRange.high}`, i18nT('底价 × 上浮区间')]);
  }
  costRows.push([]);
  for (const line of buildProvenanceLines(ctx)) costRows.push([line]);
  const costSheet = XLSX.utils.aoa_to_sheet(costRows);
  costSheet['!cols'] = [{ wch: 26 }, { wch: 18 }, { wch: 46 }];
  XLSX.utils.book_append_sheet(wb, costSheet, i18nT('成本与报价'));

  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }) as Buffer;
}

// ─────────────────────────────────────────────────────────────────────────────
// Word：手写 OOXML（结构简单，不值得为它拉一个库）
// ─────────────────────────────────────────────────────────────────────────────

function xmlEscape(value: string): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

/** 一个段落。`style` 控制字号/加粗/颜色，够用就好。 */
function paragraph(text: string, style: { size?: number; bold?: boolean; color?: string; spaceAfter?: number } = {}): string {
  const size = (style.size ?? 11) * 2;   // OOXML 用半磅
  const runProps = [
    `<w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:eastAsia="PingFang SC" w:cs="Arial"/>`,
    style.bold ? '<w:b/>' : '',
    style.color ? `<w:color w:val="${style.color}"/>` : '',
    `<w:sz w:val="${size}"/><w:szCs w:val="${size}"/>`,
  ].join('');
  const lines = String(text ?? '').split('\n');
  const runs = lines
    .map((line, i) => `${i ? '<w:br/>' : ''}<w:t xml:space="preserve">${xmlEscape(line)}</w:t>`)
    .join('');
  return [
    '<w:p>',
    `<w:pPr><w:spacing w:after="${style.spaceAfter ?? 120}"/></w:pPr>`,
    `<w:r><w:rPr>${runProps}</w:rPr>${runs}</w:r>`,
    '</w:p>',
  ].join('');
}

function table(rows: string[][]): string {
  const cell = (text: string, bold = false) => [
    '<w:tc>',
    '<w:tcPr><w:tcW w:w="0" w:type="auto"/></w:tcPr>',
    paragraph(text, { size: 10, bold, spaceAfter: 0 }),
    '</w:tc>',
  ].join('');
  const body = rows.map((row, i) => `<w:tr>${row.map((c) => cell(c, i === 0)).join('')}</w:tr>`).join('');
  return [
    '<w:tbl>',
    '<w:tblPr><w:tblStyle w:val="TableGrid"/><w:tblW w:w="0" w:type="auto"/>',
    '<w:tblBorders>',
    ...['top', 'left', 'bottom', 'right', 'insideH', 'insideV']
      .map((side) => `<w:${side} w:val="single" w:sz="4" w:color="D0D5DD"/>`),
    '</w:tblBorders></w:tblPr>',
    body,
    '</w:tbl>',
    paragraph('', { spaceAfter: 120 }),
  ].join('');
}

export async function buildProposalDocx(ctx: OutputContext): Promise<Buffer> {
  const AdmZip = (await import('adm-zip')).default as any;
  const parts: string[] = [];

  // 未审批：首段红色大字水印。放在正文最前面，打印出来一眼能看到
  if (ctx.draft) parts.push(paragraph(draftBanner(), { size: 16, bold: true, color: 'B42318' }));
  parts.push(paragraph(ctx.title, { size: 20, bold: true, spaceAfter: 200 }));
  parts.push(paragraph(`${i18nT('客户')}：${ctx.customer}`, { size: 11 }));
  parts.push(paragraph(`${i18nT('项目')}：${ctx.project}`, { size: 11 }));
  parts.push(paragraph(`${i18nT('规则版本')}：${ctx.ruleVersion}`, { size: 10, color: '64748B', spaceAfter: 240 }));

  if (ctx.fields?.length) {
    parts.push(paragraph(i18nT('需求信息'), { size: 14, bold: true }));
    parts.push(table([[i18nT('项目'), i18nT('内容')], ...ctx.fields.map((f) => [f.label, f.value])]));
  }

  for (const section of ctx.sections ?? []) {
    parts.push(paragraph(section.title, { size: 14, bold: true }));
    parts.push(paragraph(section.body, { size: 11, spaceAfter: 200 }));
  }

  if (ctx.calcLines?.length) {
    parts.push(paragraph(i18nT('成本与报价'), { size: 14, bold: true }));
    parts.push(table([
      [i18nT('项目'), i18nT('金额'), i18nT('公式')],
      ...ctx.calcLines.map((l) => [l.label, `${l.currency ?? 'SAR'} ${Math.round(l.result).toLocaleString('en-US')}`, l.formula]),
    ]));
  }

  // 来源标注落在文末（P0-2）。docx 的真页脚要额外挂 footer part + sectPr 引用，
  // 为一行灰字拉一整套关系表不划算；文末小灰字同样跟着内容走，打印出来也在。
  parts.push(paragraph('─'.repeat(40), { size: 8, color: 'CBD5E1', spaceAfter: 60 }));
  for (const line of buildProvenanceLines(ctx)) {
    parts.push(paragraph(line, { size: 8, color: '64748B', spaceAfter: 40 }));
  }

  const documentXml = [
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
    '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">',
    '<w:body>',
    parts.join(''),
    '<w:sectPr><w:pgSz w:w="11906" w:h="16838"/>',
    '<w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134"/></w:sectPr>',
    '</w:body></w:document>',
  ].join('');

  const zip = new AdmZip();
  zip.addFile('[Content_Types].xml', Buffer.from([
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
    '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">',
    '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>',
    '<Default Extension="xml" ContentType="application/xml"/>',
    '<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>',
    '</Types>',
  ].join(''), 'utf-8'));
  zip.addFile('_rels/.rels', Buffer.from([
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
    '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">',
    '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>',
    '</Relationships>',
  ].join(''), 'utf-8'));
  zip.addFile('word/_rels/document.xml.rels', Buffer.from([
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
    '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"/>',
  ].join(''), 'utf-8'));
  zip.addFile('word/document.xml', Buffer.from(documentXml, 'utf-8'));
  return zip.toBuffer();
}

// ─────────────────────────────────────────────────────────────────────────────
// PDF：离屏窗口渲染 HTML → printToPDF（Electron 自带，不引 headless 浏览器）
// ─────────────────────────────────────────────────────────────────────────────

export function buildOutputHtml(ctx: OutputContext): string {
  const esc = xmlEscape;
  const rows = (ctx.calcLines ?? [])
    .map((l) => `<tr><td>${esc(l.label)}</td><td class="num">${(l.currency ?? 'SAR')} ${Math.round(l.result).toLocaleString('en-US')}</td><td class="f">${esc(l.formula)}</td></tr>`)
    .join('');
  const bomRows = (ctx.bom ?? [])
    .map((r, i) => `<tr><td>${i + 1}</td><td class="mono">${esc(r.sku)}</td><td>${esc(r.description)}</td><td class="num">${r.qty} ${esc(r.unit)}</td><td class="num">${r.unitCost.toLocaleString('en-US')}</td><td class="num">${(r.qty * r.unitCost).toLocaleString('en-US')}</td></tr>`)
    .join('');
  const sections = (ctx.sections ?? [])
    .map((s) => `<h2>${esc(s.title)}</h2><p>${esc(s.body).replace(/\n/g, '<br/>')}</p>`)
    .join('');
  const fields = (ctx.fields ?? [])
    .map((f) => `<tr><th>${esc(f.label)}</th><td>${esc(f.value)}</td></tr>`)
    .join('');

  return `<!doctype html><html><head><meta charset="utf-8"><style>
    body { font-family: -apple-system, 'PingFang SC', 'Segoe UI', sans-serif; color: #1b2733; font-size: 12px; padding: 28px; }
    h1 { font-size: 20px; margin: 0 0 4px; }
    h2 { font-size: 14px; margin: 18px 0 6px; }
    .meta { color: #64748b; font-size: 11px; margin-bottom: 16px; }
    table { border-collapse: collapse; width: 100%; margin-bottom: 12px; }
    th, td { border: 1px solid #e3e8ef; padding: 5px 8px; text-align: left; vertical-align: top; }
    th { background: #f1f5f9; }
    .num { text-align: right; font-variant-numeric: tabular-nums; }
    .f { color: #64748b; font-size: 10px; }
    .mono { font-family: ui-monospace, monospace; }
    .draft { color: #b42318; font-weight: 700; font-size: 14px; border: 2px solid #b42318; padding: 6px 10px; margin-bottom: 14px; display: inline-block; }
    /* 来源标注：正文末尾也留一份（printToPDF 的页脚模板只放得下一行） */
    .src { margin-top: 18px; padding-top: 8px; border-top: 1px solid #e3e8ef; color: #64748b; font-size: 9px; line-height: 1.5; }
    /* 未审批件加斜向水印：打印出来也去不掉 */
    .wm { position: fixed; inset: 0; pointer-events: none; display: flex; align-items: center; justify-content: center; }
    .wm span { transform: rotate(-32deg); font-size: 84px; color: rgba(180, 35, 24, .12); font-weight: 800; letter-spacing: 8px; }
  </style></head><body>
    ${ctx.draft ? `<div class="wm"><span>DRAFT</span></div><div class="draft">${esc(draftBanner())}</div>` : ''}
    <h1>${esc(ctx.title)}</h1>
    <div class="meta">${esc(ctx.customer)} · ${esc(ctx.project)} · ${i18nT('规则版本')} ${esc(ctx.ruleVersion)}</div>
    ${fields ? `<table>${fields}</table>` : ''}
    ${sections}
    ${bomRows ? `<h2>BOM</h2><table><tr><th>#</th><th>SKU</th><th>${i18nT('描述')}</th><th>${i18nT('数量')}</th><th>${i18nT('单价')}</th><th>${i18nT('行小计')}</th></tr>${bomRows}</table>` : ''}
    ${rows ? `<h2>${i18nT('成本与报价')}</h2><table><tr><th>${i18nT('项目')}</th><th>${i18nT('金额')}</th><th>${i18nT('公式')}</th></tr>${rows}</table>` : ''}
    ${ctx.priceRange ? `<p><strong>${i18nT('建议报价区间')}：SAR ${ctx.priceRange.low.toLocaleString('en-US')} — ${ctx.priceRange.high.toLocaleString('en-US')}</strong></p>` : ''}
    <div class="src">${buildProvenanceLines(ctx).map((l) => `<div>${esc(l)}</div>`).join('')}</div>
  </body></html>`;
}

export async function buildPdf(ctx: OutputContext): Promise<Buffer> {
  const win = new BrowserWindow({
    show: false,
    // Electron 42+ 默认缩放为 1；保留原来跟随主屏 DPI 的输出尺寸。
    webPreferences: { offscreen: { deviceScaleFactor: screen.getPrimaryDisplay().scaleFactor }, nodeIntegration: false, contextIsolation: true },
  });
  try {
    const html = buildOutputHtml(ctx);
    await win.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);
    // 来源标注要**每页都有**（需求 P0-2 第 1 条）——正文里塞一段只会出现在最后一页。
    // Chromium 的 headerTemplate/footerTemplate 是唯一能做到逐页重复的机制；
    // 它跑在独立的渲染上下文里，页面 CSS 完全不生效，字号必须写死在模板内联样式上。
    const footerLine = buildProvenanceLines(ctx)[0] ?? '';
    return await win.webContents.printToPDF({
      printBackground: true,
      pageSize: 'A4',
      displayHeaderFooter: true,
      headerTemplate: '<div></div>',
      footerTemplate: [
        '<div style="font-size:7px;color:#64748b;width:100%;padding:0 12mm;',
        'display:flex;justify-content:space-between;align-items:center;">',
        `<span>${xmlEscape(footerLine)}</span>`,
        '<span class="pageNumber"></span>/<span class="totalPages"></span>',
        '</div>',
      ].join(''),
      margins: { top: 0.4, bottom: 0.6, left: 0.4, right: 0.4 },
    });
  } finally {
    // 离屏窗口必须显式销毁，否则每导一份 PDF 泄一个窗口
    try { win.destroy(); } catch { /* 已销毁 */ }
  }
}

/** 邮件草稿：标准 .eml，双击能用邮件客户端打开。 */
export function buildEml(ctx: OutputContext, body: string, to?: string): Buffer {
  const lines = [
    `To: ${to || ''}`,
    `Subject: ${ctx.title}`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
    '',
    ctx.draft ? `${draftBanner()}\n` : '',
    body,
    '',
    '-- ',
    ...buildProvenanceLines(ctx),
  ];
  return Buffer.from(lines.join('\r\n'), 'utf-8');
}

export const OUTPUT_EXTENSIONS: Record<string, string> = {
  word: '.docx',
  excel: '.xlsx',
  pdf: '.pdf',
  email: '.eml',
};
