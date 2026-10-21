/**
 * 党政机关公文 Word（按 GB/T 9704-2012 版式要点）：
 *   版头：发文机关标志（红色小标宋，居中）+ 发文字号 + 红色分隔线；
 *   标题：2 号小标宋居中；主送机关：3 号仿宋顶格；
 *   正文：3 号仿宋、首行缩进 2 字、固定行距 28 磅，「一、」级标题用黑体；
 *   附件说明、发文机关署名与成文日期（右空 4 字）；版记：印发机关与印发日期，上下细线。
 * 页边距：天头 37mm、订口 28mm、下 35mm、右 26mm（A4）。
 *
 * 公文本身就是中文格式，「文件」「印发」「附件」等版式用字按公文规范写死，不走界面词典
 * （同 bidWriter/docx.ts，本文件在 i18n codemod 里整文件豁免）。
 * 不引新依赖：adm-zip 直接组 OOXML。
 */
import AdmZip from 'adm-zip';
import type { CaDocKind, CaOfficialDoc } from '@totalclaw/ipc-contracts';

const xml = (s: string): string => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const FONT_TITLE = '方正小标宋简体';
const FONT_BODY = '仿宋_GB2312';
const FONT_HEI = '黑体';
const FONT_KAI = '楷体_GB2312';

interface R { font?: string; size?: number; bold?: boolean; color?: string }
function run(text: string, r: R = {}): string {
  const f = r.font || FONT_BODY;
  const props = `<w:rFonts w:ascii="${f}" w:hAnsi="${f}" w:eastAsia="${f}"/>${r.bold ? '<w:b/>' : ''}${r.color ? `<w:color w:val="${r.color}"/>` : ''}<w:sz w:val="${r.size || 32}"/><w:szCs w:val="${r.size || 32}"/>`;
  return `<w:r><w:rPr>${props}</w:rPr><w:t xml:space="preserve">${xml(text)}</w:t></w:r>`;
}
interface P { align?: 'left' | 'center' | 'right' | 'both'; indent?: boolean; rightChars?: number; line?: number; before?: number; after?: number; border?: 'bottom-red' | 'top' | 'bottom' }
function para(runs: string, p: P = {}): string {
  const border = p.border === 'bottom-red'
    ? '<w:pBdr><w:bottom w:val="single" w:sz="12" w:space="6" w:color="E00000"/></w:pBdr>'
    : p.border === 'top' ? '<w:pBdr><w:top w:val="single" w:sz="6" w:space="4" w:color="000000"/></w:pBdr>'
      : p.border === 'bottom' ? '<w:pBdr><w:bottom w:val="single" w:sz="6" w:space="4" w:color="000000"/></w:pBdr>' : '';
  const ind = p.indent ? '<w:ind w:firstLineChars="200" w:firstLine="640"/>' : p.rightChars ? `<w:ind w:rightChars="${p.rightChars * 100}" w:right="${p.rightChars * 320}"/>` : '';
  return `<w:p><w:pPr>${border}<w:spacing w:before="${p.before ?? 0}" w:after="${p.after ?? 0}" w:line="${p.line ?? 560}" w:lineRule="exact"/>${ind}<w:jc w:val="${p.align || 'both'}"/></w:pPr>${runs}</w:p>`;
}

const KIND_HEAD: Record<CaOfficialDoc['kind'], string> = { notice: '文件', request: '文件', report: '文件', letter: '', minutes: '会议纪要' };

export function cnDate(iso: string): string {
  const m = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(String(iso || ''));
  if (!m) return String(iso || '');
  return `${m[1]}年${Number(m[2])}月${Number(m[3])}日`;
}

/** 正文按行成段；「一、」「（一）」开头的行分别用黑体 / 楷体 */
function bodyParas(body: string): string {
  return String(body || '').replace(/\r/g, '').split('\n').map((l) => l.trim()).filter(Boolean).map((line) => {
    if (/^[一二三四五六七八九十]+、/.test(line)) return para(run(line, { font: FONT_HEI }), { indent: true });
    if (/^（[一二三四五六七八九十]+）/.test(line)) return para(run(line, { font: FONT_KAI }), { indent: true });
    return para(run(line), { indent: true });
  }).join('');
}

export function buildOfficialDocx(d: CaOfficialDoc): Buffer {
  const blocks: string[] = [];
  const head = `${d.issuer}${KIND_HEAD[d.kind] || ''}`;
  // 版头
  blocks.push(para(run(head, { font: FONT_TITLE, size: d.kind === 'letter' ? 56 : 72, color: 'E00000' }), { align: 'center', line: 1100, before: 200 }));
  blocks.push(para(d.docNo ? run(d.docNo) : '', { align: 'center', border: 'bottom-red', after: 360 }));
  // 标题
  blocks.push(para(run(d.title, { font: FONT_TITLE, size: 44 }), { align: 'center', line: 700, before: 240, after: 240 }));
  // 主送机关
  if (d.recipients) blocks.push(para(run(`${d.recipients}：`), {}));
  // 正文
  blocks.push(bodyParas(d.body));
  // 附件说明
  const atts = String(d.attachments || '').split(/\n|；|;/).map((x) => x.trim()).filter(Boolean);
  if (atts.length) {
    blocks.push(para('', {}));
    atts.forEach((a, i) => blocks.push(para(run(i === 0 ? `附件：${atts.length > 1 ? '1．' : ''}${a}` : `　　　${i + 1}．${a}`), { indent: true })));
  }
  // 署名与成文日期
  blocks.push(para('', {}));
  blocks.push(para('', {}));
  blocks.push(para(run(d.issuer), { align: 'right', rightChars: 4 }));
  blocks.push(para(run(cnDate(d.date)), { align: 'right', rightChars: 4 }));
  // 版记
  blocks.push(para('', {}));
  blocks.push(para(run(`${d.issuer}　　　　　　　　　${cnDate(d.date)}印发`, { size: 28 }), { border: 'top', align: 'both' }));
  blocks.push(para('', { border: 'bottom' }));

  const sectPr = '<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="2098" w:right="1474" w:bottom="1984" w:left="1588" w:header="851" w:footer="992"/></w:sectPr>';
  const zip = new AdmZip();
  zip.addFile('[Content_Types].xml', Buffer.from('<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>'));
  zip.addFile('_rels/.rels', Buffer.from('<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>'));
  zip.addFile('word/document.xml', Buffer.from(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><w:body>${blocks.join('')}${sectPr}</w:body></w:document>`));
  return zip.toBuffer();
}

const KIND_NAME: Record<CaDocKind, string> = { notice: '通知', request: '请示', report: '报告', letter: '函', minutes: '会议纪要' };

/**
 * 起草公文正文的提示词。公文本身就是中文，层次序号（一、（一）1.）和结尾惯用语都按公文规范写死，
 * 不跟界面语言走（英文界面的人起草的仍是中文公文）。
 */
export function buildDocPrompt(input: { kind: CaDocKind; issuer: string; title: string; recipients: string; points: string; school: string }): string {
  const ending: Record<CaDocKind, string> = {
    notice: '通知结尾写「特此通知。」',
    request: '请示要一文一事，结尾写「妥否，请批示。」',
    report: '报告不得夹带请示事项，结尾写「特此报告。」',
    letter: '函的结尾写「特此函告。」或「请予函复。」',
    minutes: '纪要按「会议概况—议定事项」组织，议定事项逐条写明责任部门。',
  };
  return [
    `你是${input.school}党政办的公文写作助手。请按党政机关公文的写法起草一份「${KIND_NAME[input.kind]}」的正文。`,
    `发文机关：${input.issuer}；标题：${input.title}；主送机关：${input.recipients || '无'}。`,
    '只写正文：不要写标题、主送机关、署名和日期；层次用「一、」「（一）」「1.」；语言庄重、简洁，不用口语。',
    ending[input.kind],
    '只能使用下面要点里给出的事实、时间、数字和名称，不要补充要点里没有的内容。',
    '用纯文本输出，不要 Markdown。',
    '',
    '=== 要点 ===',
    input.points,
  ].join('\n');
}
