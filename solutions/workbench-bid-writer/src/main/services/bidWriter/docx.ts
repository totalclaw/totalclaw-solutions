/**
 * 正式件生成：把章节正文变成能直接投出去的 Word / PDF。
 *
 * 不引新依赖（与 saudiOutputBuilder 同做法）：Word 用 adm-zip 直接组 OOXML，
 * PDF 用 Electron 的 printToPDF 渲染同一份内容的 HTML。
 *
 * 标书这类文件有几件事必须做对，否则递上去就是减分项：
 *   · 封面（项目名 / 招标编号 / 投标人 / 日期）；
 *   · 目录（章节顺序一眼可见）—— 这里用静态目录，任何阅读器都显示得出来，
 *     不用 Word 的 TOC 域（域不更新时会显示"错误！未找到目录项"）；
 *   · 页脚页码；
 *   · 阿拉伯语 RTL 排版；
 *   · **草稿件全篇带 DRAFT 标识**，避免未定稿的版本被当正式件发出去。
 */
import AdmZip from 'adm-zip';
import { BrowserWindow } from 'electron';
import { writeFileSync } from 'node:fs';
import type { BidWriterProject, BidWriterSection } from '@totalclaw/ipc-contracts';
import { CN_ORDINALS } from './matchPatterns';

export type DocLang = BidWriterProject['lang'];

/**
 * 文件里的标签按**标书语言**写死，不走 i18nT。
 *
 * i18nT 跟的是界面语言：英文界面的人给中国客户做中文标书，封面就会冒出 "Contents"。
 * 与慈善工场的三语报告同一条规矩（charityContent/reportText.ts），
 * 所以本文件在 i18n codemod 里整文件豁免，界面上的文案仍全部走 i18nT。
 */
const DOC_LABELS: Record<DocLang, Record<string, string>> = {
  'zh-CN': {
    bidDocument: '投标文件', contents: '目录', buyer: '采购人', code: '招标编号', bidder: '投标人',
    deadline: '投标截止时间', preparedAt: '编制日期',
    draft: '草稿 DRAFT · 未经审批不得对外', empty: '【本章尚未生成正文】',
  },
  'en-US': {
    bidDocument: 'Bid Document', contents: 'Contents', buyer: 'Purchaser', code: 'Tender No.', bidder: 'Bidder',
    deadline: 'Bid deadline', preparedAt: 'Prepared on',
    draft: 'DRAFT · Not for external release without approval', empty: '[This chapter has no text yet]',
  },
  ar: {
    bidDocument: 'وثيقة العطاء', contents: 'المحتويات', buyer: 'جهة الشراء', code: 'رقم المناقصة', bidder: 'مقدّم العطاء',
    deadline: 'الموعد النهائي للتقديم', preparedAt: 'تاريخ الإعداد',
    draft: 'مسودة · غير قابلة للنشر دون اعتماد', empty: '[لا يوجد نص لهذا القسم بعد]',
  },
};

function labels(project: BidWriterProject): Record<string, string> {
  return DOC_LABELS[project.lang] || DOC_LABELS['zh-CN'];
}

function xml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

function htmlEscape(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function isRtl(project: BidWriterProject): boolean {
  return project.lang === 'ar';
}

interface RunStyle { bold?: boolean; size?: number; color?: string; rtl?: boolean }

function run(text: string, style: RunStyle = {}): string {
  const props = [
    style.bold ? '<w:b/>' : '',
    style.size ? `<w:sz w:val="${style.size}"/><w:szCs w:val="${style.size}"/>` : '',
    style.color ? `<w:color w:val="${style.color}"/>` : '',
    style.rtl ? '<w:rtl/>' : '',
  ].join('');
  return `<w:r><w:rPr>${props}</w:rPr><w:t xml:space="preserve">${xml(text)}</w:t></w:r>`;
}

function para(
  text: string,
  opts: { style?: string; align?: 'center' | 'left' | 'right'; rtl?: boolean; run?: RunStyle; pageBreakBefore?: boolean } = {},
): string {
  const props = [
    opts.pageBreakBefore ? '<w:pageBreakBefore/>' : '',
    opts.style ? `<w:pStyle w:val="${opts.style}"/>` : '',
    opts.rtl ? '<w:bidi/>' : '',
    opts.align ? `<w:jc w:val="${opts.align}"/>` : '',
    '<w:spacing w:before="60" w:after="120" w:line="320" w:lineRule="auto"/>',
  ].join('');
  return `<w:p><w:pPr>${props}</w:pPr>${text ? run(text, { ...opts.run, rtl: opts.rtl }) : ''}</w:p>`;
}

/** 正文按空行分段；每段独立成 <w:p>，Word 里才有正常的段间距 */
function bodyParagraphs(content: string, rtl: boolean): string {
  return String(content || '')
    .replace(/\r/g, '')
    .split(/\n{2,}/)
    .flatMap((block) => block.split('\n'))
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => para(line, { rtl, run: { size: 22 } }))
    .join('');
}

const STYLES_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
<w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/>
<w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:eastAsia="SimSun" w:cs="Arial"/><w:sz w:val="22"/></w:rPr></w:style>
<w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/><w:basedOn w:val="Normal"/>
<w:pPr><w:outlineLvl w:val="0"/><w:spacing w:before="320" w:after="160"/></w:pPr>
<w:rPr><w:rFonts w:eastAsia="SimHei"/><w:b/><w:sz w:val="32"/><w:szCs w:val="32"/></w:rPr></w:style>
<w:style w:type="paragraph" w:styleId="Heading2"><w:name w:val="heading 2"/><w:basedOn w:val="Normal"/>
<w:pPr><w:outlineLvl w:val="1"/><w:spacing w:before="240" w:after="120"/></w:pPr>
<w:rPr><w:rFonts w:eastAsia="SimHei"/><w:b/><w:sz w:val="26"/><w:szCs w:val="26"/></w:rPr></w:style>
<w:style w:type="paragraph" w:styleId="Heading3"><w:name w:val="heading 3"/><w:basedOn w:val="Normal"/>
<w:pPr><w:outlineLvl w:val="2"/><w:spacing w:before="200" w:after="100"/></w:pPr>
<w:rPr><w:b/><w:sz w:val="24"/><w:szCs w:val="24"/></w:rPr></w:style>
</w:styles>`;

function footerXml(draft: boolean, draftText: string): string {
  const draftRun = draft ? run(`${draftText}    `, { color: 'C0392B', bold: true, size: 18 }) : '';
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:ftr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
<w:p><w:pPr><w:jc w:val="center"/></w:pPr>${draftRun}
<w:r><w:fldChar w:fldCharType="begin"/></w:r><w:r><w:instrText xml:space="preserve"> PAGE </w:instrText></w:r>
<w:r><w:fldChar w:fldCharType="separate"/></w:r><w:r><w:t>1</w:t></w:r><w:r><w:fldChar w:fldCharType="end"/></w:r>
</w:p></w:ftr>`;
}

function headingStyle(level: number): string {
  return level === 1 ? 'Heading1' : level === 2 ? 'Heading2' : 'Heading3';
}

/**
 * 章节编号：中文标书一级用「一、」，二级「1.1」，三级「1.1.1」（国内标书惯例）；
 * 英 / 阿标书一级也用阿拉伯数字，否则客户看到的是不认识的字符。
 */
export function numberSections(
  sections: BidWriterSection[], lang: DocLang = 'zh-CN',
): Array<BidWriterSection & { label: string }> {
  const topLabel = (n: number) => (
    lang === 'zh-CN' ? `${CN_ORDINALS[n - 1] || n}、` : `${n}. `
  );
  let l1 = 0; let l2 = 0; let l3 = 0;
  return sections.map((s) => {
    if (s.level === 1) { l1 += 1; l2 = 0; l3 = 0; return { ...s, label: topLabel(l1) }; }
    if (s.level === 2) { l2 += 1; l3 = 0; return { ...s, label: `${Math.max(l1, 1)}.${l2} ` }; }
    l3 += 1;
    return { ...s, label: `${Math.max(l1, 1)}.${Math.max(l2, 1)}.${l3} ` };
  });
}

function todayText(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function buildBidDocx(project: BidWriterProject, draft: boolean): Buffer {
  const rtl = isRtl(project);
  const L = labels(project);
  const numbered = numberSections(project.sections || [], project.lang);
  const blocks: string[] = [];

  // 封面
  if (draft) blocks.push(para(L.draft, { align: 'center', rtl, run: { bold: true, size: 28, color: 'C0392B' } }));
  blocks.push(para('', { rtl }));
  blocks.push(para(project.name || L.bidDocument, { align: 'center', rtl, run: { bold: true, size: 52 } }));
  blocks.push(para(L.bidDocument, { align: 'center', rtl, run: { bold: true, size: 36 } }));
  blocks.push(para('', { rtl }));
  const coverRows: Array<[string, string]> = [
    [L.buyer, project.notice?.buyer || ''],
    [L.code, project.notice?.projectCode || ''],
    [L.bidder, project.bidder || ''],
    [L.deadline, project.notice?.bidDeadline || ''],
    [L.preparedAt, todayText()],
  ];
  for (const [k, v] of coverRows) {
    if (!v) continue;
    blocks.push(para(`${k}：${v}`, { align: 'center', rtl, run: { size: 26 } }));
  }

  // 目录（静态，任何阅读器都显示得出来）
  blocks.push(para(L.contents, { style: 'Heading1', align: 'center', rtl, pageBreakBefore: true }));
  for (const s of numbered) {
    const indent = s.level === 1 ? '' : s.level === 2 ? '    ' : '        ';
    blocks.push(para(`${indent}${s.label}${s.title}`, { rtl, run: { size: 22 } }));
  }

  // 正文
  numbered.forEach((s, index) => {
    blocks.push(para(`${s.label}${s.title}`, {
      style: headingStyle(s.level), rtl, pageBreakBefore: s.level === 1 || index === 0,
    }));
    const content = String(s.content || '').trim();
    blocks.push(content
      ? bodyParagraphs(content, rtl)
      : para(L.empty, { rtl, run: { color: 'C0392B' } }));
  });

  const sectPr = `<w:sectPr><w:footerReference w:type="default" r:id="rId2"/>`
    + `<w:pgSz w:w="11906" w:h="16838"/>`
    + `<w:pgMar w:top="1418" w:right="1418" w:bottom="1418" w:left="1418" w:header="851" w:footer="992"/>`
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
    + '</Relationships>',
  ));
  zip.addFile('word/styles.xml', Buffer.from(STYLES_XML));
  zip.addFile('word/footer1.xml', Buffer.from(footerXml(draft, L.draft)));
  zip.addFile('word/document.xml', Buffer.from(
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
    + '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"'
    + ' xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">'
    + `<w:body>${blocks.join('')}${sectPr}</w:body></w:document>`,
  ));
  return zip.toBuffer();
}

/** 与 docx 同一份内容的 HTML（给 printToPDF 用，也可直接预览） */
export function buildBidHtml(project: BidWriterProject, draft: boolean): string {
  const rtl = isRtl(project);
  const L = labels(project);
  const numbered = numberSections(project.sections || [], project.lang);
  const toc = numbered.map((s) => (
    `<li class="lv${s.level}">${htmlEscape(`${s.label}${s.title}`)}</li>`
  )).join('');
  const body = numbered.map((s) => {
    const tag = s.level === 1 ? 'h1' : s.level === 2 ? 'h2' : 'h3';
    const paras = String(s.content || '').split(/\n+/).map((l) => l.trim()).filter(Boolean)
      .map((l) => `<p>${htmlEscape(l)}</p>`).join('');
    return `<section class="sec lv${s.level}"><${tag}>${htmlEscape(`${s.label}${s.title}`)}</${tag}>`
      + `${paras || `<p class="missing">${htmlEscape(L.empty)}</p>`}</section>`;
  }).join('');
  const cover = [
    [L.buyer, project.notice?.buyer],
    [L.code, project.notice?.projectCode],
    [L.bidder, project.bidder],
    [L.deadline, project.notice?.bidDeadline],
    [L.preparedAt, todayText()],
  ].filter(([, v]) => v).map(([k, v]) => `<div>${htmlEscape(k)}：${htmlEscape(v)}</div>`).join('');

  return `<!doctype html><html lang="${project.lang}" dir="${rtl ? 'rtl' : 'ltr'}"><head><meta charset="utf-8"><style>
@page { size: A4; margin: 22mm 18mm; }
body { font-family: "Times New Roman", "Songti SC", "SimSun", "Noto Naskh Arabic", serif; color: #111; line-height: 1.8; font-size: 12pt; }
.draft { color: #c0392b; font-weight: 700; text-align: center; letter-spacing: 2px; }
.cover { text-align: center; padding-top: 22mm; page-break-after: always; }
.cover h1 { font-size: 30pt; margin-bottom: 4mm; }
.cover h2 { font-size: 20pt; font-weight: 600; margin-top: 0; }
.cover .meta { margin-top: 18mm; font-size: 13pt; line-height: 2.2; }
.toc { page-break-after: always; }
.toc h1 { text-align: center; }
.toc ul { list-style: none; padding: 0; }
.toc li.lv2 { padding-inline-start: 18px; }
.toc li.lv3 { padding-inline-start: 36px; }
section.lv1 { page-break-before: always; }
h1 { font-size: 17pt; } h2 { font-size: 14pt; } h3 { font-size: 12.5pt; }
p { text-align: justify; margin: 0 0 3mm; text-indent: 2em; }
.missing { color: #c0392b; text-indent: 0; }
</style></head><body>
<div class="cover">${draft ? `<div class="draft">${htmlEscape(L.draft)}</div>` : ''}
<h1>${htmlEscape(project.name || L.bidDocument)}</h1><h2>${htmlEscape(L.bidDocument)}</h2>
<div class="meta">${cover}</div></div>
<div class="toc"><h1>${htmlEscape(L.contents)}</h1><ul>${toc}</ul></div>
${body}</body></html>`;
}

/** HTML → PDF（离屏窗口，禁 JS） */
export async function writePdfFromHtml(path: string, html: string): Promise<void> {
  const win = new BrowserWindow({
    show: false,
    webPreferences: { sandbox: true, contextIsolation: true, javascript: false },
  });
  try {
    await win.loadURL(`data:text/html;base64,${Buffer.from(html, 'utf-8').toString('base64')}`);
    const pdf = await win.webContents.printToPDF({
      printBackground: true,
      pageSize: 'A4',
      margins: { top: 0.6, right: 0.5, bottom: 0.6, left: 0.5 },
    });
    writeFileSync(path, pdf);
  } finally {
    try { if (!win.isDestroyed()) win.destroy(); } catch { /* 忽略 */ }
  }
}
