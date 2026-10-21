/**
 * 备忘录 / 报告 docx（第 10 节）：复用 bidWriter/docx.ts 的 OOXML 写法（adm-zip 直接组包，不引新依赖），
 * 只是内容结构换成「封面 + 小节（段落 / 表格）」。
 *
 *   - 页眉固定一句「草稿，非审计 / 鉴证意见」（输出语言），页脚带草稿标识与页码；
 *   - 阿语：段落 <w:bidi/>、表格 <w:bidiVisual/>、节 <w:bidi/>；
 *   - 文书模板里没有「意见段」，只有「发现与建议」（合规边界，第 9.1 节）。
 */
import AdmZip from 'adm-zip';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

export interface DocTable { headers: string[]; rows: (string | number)[][] }
export interface DocSection { heading: string; paragraphs?: string[]; table?: DocTable }
export interface DocSpec {
  title: string;
  subtitle?: string;
  /** 封面上的键值（公司、期间、编制日期…） */
  meta?: Array<[string, string]>;
  /** 页眉：草稿，非审计 / 鉴证意见 */
  header: string;
  /** 页脚草稿标识：草稿—待签核 */
  watermark: string;
  rtl: boolean;
  sections: DocSection[];
}

function xml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

function run(text: string, o: { bold?: boolean; size?: number; color?: string; rtl?: boolean } = {}): string {
  const props = [o.bold ? '<w:b/><w:bCs/>' : '', o.size ? `<w:sz w:val="${o.size}"/><w:szCs w:val="${o.size}"/>` : '', o.color ? `<w:color w:val="${o.color}"/>` : '', o.rtl ? '<w:rtl/>' : ''].join('');
  return `<w:r><w:rPr>${props}</w:rPr><w:t xml:space="preserve">${xml(text)}</w:t></w:r>`;
}

function para(text: string, o: { style?: string; align?: 'center' | 'start'; rtl: boolean; bold?: boolean; size?: number; color?: string; pageBreakBefore?: boolean }): string {
  const jc = o.align === 'center' ? 'center' : o.rtl ? 'right' : 'left';
  const props = [o.pageBreakBefore ? '<w:pageBreakBefore/>' : '', o.style ? `<w:pStyle w:val="${o.style}"/>` : '', o.rtl ? '<w:bidi/>' : '', `<w:jc w:val="${jc}"/>`, '<w:spacing w:before="60" w:after="120" w:line="320" w:lineRule="auto"/>'].join('');
  return `<w:p><w:pPr>${props}</w:pPr>${text ? run(text, { bold: o.bold, size: o.size, color: o.color, rtl: o.rtl }) : ''}</w:p>`;
}

function table(t: DocTable, rtl: boolean): string {
  const cell = (v: string | number, bold = false) => `<w:tc><w:tcPr><w:tcW w:w="0" w:type="auto"/></w:tcPr>${para(String(v ?? ''), { rtl, bold, size: 18 })}</w:tc>`;
  const border = '<w:tblBorders><w:top w:val="single" w:sz="4"/><w:bottom w:val="single" w:sz="4"/><w:insideH w:val="single" w:sz="4"/><w:insideV w:val="single" w:sz="4"/><w:left w:val="single" w:sz="4"/><w:right w:val="single" w:sz="4"/></w:tblBorders>';
  const tblPr = `<w:tblPr>${rtl ? '<w:bidiVisual/>' : ''}<w:tblW w:w="5000" w:type="pct"/>${border}</w:tblPr>`;
  const head = `<w:tr>${t.headers.map((h) => cell(h, true)).join('')}</w:tr>`;
  const body = t.rows.map((r) => `<w:tr>${r.map((v) => cell(v)).join('')}</w:tr>`).join('');
  return `<w:tbl>${tblPr}${head}${body}</w:tbl>${para('', { rtl })}`;
}

const STYLES_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
<w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/>
<w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:eastAsia="SimSun" w:cs="Arial"/><w:sz w:val="21"/><w:szCs w:val="21"/></w:rPr></w:style>
<w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/><w:basedOn w:val="Normal"/>
<w:pPr><w:outlineLvl w:val="0"/><w:spacing w:before="320" w:after="160"/></w:pPr>
<w:rPr><w:rFonts w:eastAsia="SimHei"/><w:b/><w:bCs/><w:sz w:val="30"/><w:szCs w:val="30"/></w:rPr></w:style>
</w:styles>`;

function headerXml(text: string, rtl: boolean): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:hdr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">${para(text, { align: 'center', rtl, bold: true, size: 18, color: 'C0392B' })}</w:hdr>`;
}

function footerXml(watermark: string, rtl: boolean): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:ftr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
<w:p><w:pPr>${rtl ? '<w:bidi/>' : ''}<w:jc w:val="center"/></w:pPr>${run(`${watermark}    `, { color: 'C0392B', bold: true, size: 16, rtl })}
<w:r><w:fldChar w:fldCharType="begin"/></w:r><w:r><w:instrText xml:space="preserve"> PAGE </w:instrText></w:r>
<w:r><w:fldChar w:fldCharType="separate"/></w:r><w:r><w:t>1</w:t></w:r><w:r><w:fldChar w:fldCharType="end"/></w:r>
</w:p></w:ftr>`;
}

export function buildDocx(spec: DocSpec): Buffer {
  const rtl = spec.rtl;
  const blocks: string[] = [];
  blocks.push(para(spec.watermark, { align: 'center', rtl, bold: true, size: 24, color: 'C0392B' }));
  blocks.push(para(spec.title, { align: 'center', rtl, bold: true, size: 40 }));
  if (spec.subtitle) blocks.push(para(spec.subtitle, { align: 'center', rtl, size: 26 }));
  for (const [k, v] of spec.meta || []) if (v) blocks.push(para(`${k}: ${v}`, { align: 'center', rtl, size: 22 }));
  spec.sections.forEach((s, i) => {
    blocks.push(para(s.heading, { style: 'Heading1', rtl, pageBreakBefore: i === 0 }));
    for (const p of s.paragraphs || []) blocks.push(para(p, { rtl }));
    if (s.table) blocks.push(table(s.table, rtl));
  });
  const sectPr = `<w:sectPr><w:headerReference w:type="default" r:id="rId3"/><w:footerReference w:type="default" r:id="rId2"/>`
    + '<w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1418" w:right="1418" w:bottom="1418" w:left="1418" w:header="851" w:footer="992"/>'
    + `${rtl ? '<w:bidi/>' : ''}</w:sectPr>`;
  const zip = new AdmZip();
  zip.addFile('[Content_Types].xml', Buffer.from(
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
    + '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'
    + '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>'
    + '<Default Extension="xml" ContentType="application/xml"/>'
    + '<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>'
    + '<Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>'
    + '<Override PartName="/word/footer1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml"/>'
    + '<Override PartName="/word/header1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.header+xml"/>'
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
    + '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer" Target="footer1.xml"/>'
    + '<Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/header" Target="header1.xml"/>'
    + '</Relationships>',
  ));
  zip.addFile('word/styles.xml', Buffer.from(STYLES_XML));
  zip.addFile('word/footer1.xml', Buffer.from(footerXml(spec.watermark, rtl)));
  zip.addFile('word/header1.xml', Buffer.from(headerXml(spec.header, rtl)));
  zip.addFile('word/document.xml', Buffer.from(
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
    + '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"'
    + ' xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">'
    + `<w:body>${blocks.join('')}${sectPr}</w:body></w:document>`,
  ));
  return zip.toBuffer();
}

export function writeDocxFile(path: string, spec: DocSpec): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, buildDocx(spec));
}

/** 同一份内容的 HTML（签核页 PDF / 预览用）；阿语 dir="rtl" */
export function buildHtml(spec: DocSpec, lang: string): string {
  const esc = (v: unknown) => String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const secs = spec.sections.map((s) => {
    const ps = (s.paragraphs || []).map((p) => `<p>${esc(p)}</p>`).join('');
    const t = s.table
      ? `<table><thead><tr>${s.table.headers.map((h) => `<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${s.table.rows.map((r) => `<tr>${r.map((v) => `<td>${esc(v)}</td>`).join('')}</tr>`).join('')}</tbody></table>`
      : '';
    return `<h2>${esc(s.heading)}</h2>${ps}${t}`;
  }).join('');
  const meta = (spec.meta || []).filter(([, v]) => v).map(([k, v]) => `<div>${esc(k)}: ${esc(v)}</div>`).join('');
  return `<!doctype html><html lang="${esc(lang)}" dir="${spec.rtl ? 'rtl' : 'ltr'}"><head><meta charset="utf-8"><title>${esc(spec.title)}</title>
<style>body{font-family:-apple-system,"PingFang SC","Microsoft YaHei","Noto Naskh Arabic",Arial,sans-serif;margin:32px;color:#111;font-size:12px}
.wm{color:#c0392b;font-weight:700;text-align:center}h1{text-align:center}h2{margin-top:24px;font-size:15px}
table{border-collapse:collapse;width:100%}th,td{border:1px solid #999;padding:4px 6px;text-align:start}
td.num{direction:ltr;unicode-bidi:isolate}</style></head>
<body><div class="wm">${esc(spec.header)}</div><div class="wm">${esc(spec.watermark)}</div><h1>${esc(spec.title)}</h1>${spec.subtitle ? `<p style="text-align:center">${esc(spec.subtitle)}</p>` : ''}${meta}${secs}</body></html>`;
}
