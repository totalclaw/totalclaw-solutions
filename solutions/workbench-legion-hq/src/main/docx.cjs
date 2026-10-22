/**
 * 生成 docx：普通文档（意见书 / offer 函 / 报告）+ 带修订痕迹与批注的修订稿（法务 LG6）。
 * 字体一律微软雅黑（中西文都用）。只生成 Word 能打开的最小结构，不依赖模板。
 * 本文件在 workbench-legal-agent、workbench-hr-agent、workbench-legion-hq 各有一份，内容必须一致。
 */
const { writeZip } = require('./zip.cjs');
const { norm } = require('./docText.cjs');

const W = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';
const FONT = '微软雅黑';

function esc(s) {
  return String(s ?? '')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const rPr = ({ bold, size, color } = {}) =>
  `<w:rPr>${bold ? '<w:b/>' : ''}${color ? `<w:color w:val="${color}"/>` : ''}${size ? `<w:sz w:val="${size}"/><w:szCs w:val="${size}"/>` : ''}</w:rPr>`;
const run = (text, fmt) => `<w:r>${rPr(fmt)}<w:t xml:space="preserve">${esc(text)}</w:t></w:r>`;
const delRun = (text) => `<w:r><w:delText xml:space="preserve">${esc(text)}</w:delText></w:r>`;

/** 段落：{ text, style: 'title'|'h1'|'h2'|'p'|'note', runs? } */
function para(p) {
  const fmt = { title: { bold: true, size: 36 }, h1: { bold: true, size: 30 }, h2: { bold: true, size: 26 }, note: { size: 18, color: '6B7280' } }[p.style] || {};
  const pPr = p.style === 'title' ? '<w:pPr><w:jc w:val="center"/><w:spacing w:after="240"/></w:pPr>' : p.style === 'h1' || p.style === 'h2' ? '<w:pPr><w:spacing w:before="240" w:after="120"/></w:pPr>' : '<w:pPr><w:spacing w:after="80"/></w:pPr>';
  const body = p.runs ? p.runs.join('') : String(p.text ?? '').split('\n').map((line, i) => (i ? '<w:r><w:br/></w:r>' : '') + run(line, fmt)).join('');
  return `<w:p>${pPr}${body}</w:p>`;
}

function table(rows) {
  const cell = (t, head) => `<w:tc><w:tcPr><w:tcW w:w="0" w:type="auto"/></w:tcPr><w:p>${run(t, head ? { bold: true } : {})}</w:p></w:tc>`;
  return `<w:tbl><w:tblPr><w:tblStyle w:val="TableGrid"/><w:tblW w:w="5000" w:type="pct"/><w:tblBorders>${['top', 'left', 'bottom', 'right', 'insideH', 'insideV'].map((b) => `<w:${b} w:val="single" w:sz="4" w:color="BFBFBF"/>`).join('')}</w:tblBorders></w:tblPr>${rows.map((r, i) => `<w:tr>${r.map((c) => cell(c, i === 0)).join('')}</w:tr>`).join('')}</w:tbl>`;
}

function packageDocx(bodyXml, { comments = [] } = {}) {
  const document = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="${W}" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><w:body>${bodyXml}<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="851" w:footer="992" w:gutter="0"/></w:sectPr></w:body></w:document>`;
  const styles = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:styles xmlns:w="${W}"><w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="${FONT}" w:hAnsi="${FONT}" w:eastAsia="${FONT}" w:cs="${FONT}"/><w:sz w:val="22"/><w:szCs w:val="22"/><w:lang w:val="en-US" w:eastAsia="zh-CN"/></w:rPr></w:rPrDefault><w:pPrDefault><w:pPr><w:spacing w:line="360" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults><w:style w:type="table" w:styleId="TableGrid"><w:name w:val="Table Grid"/></w:style></w:styles>`;
  const commentsXml = comments.length
    ? `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:comments xmlns:w="${W}">${comments.map((c) => `<w:comment w:id="${c.id}" w:author="${esc(c.author)}" w:date="${c.date}" w:initials="AI"><w:p>${run(c.text)}</w:p></w:comment>`).join('')}</w:comments>`
    : null;
  const rels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>${commentsXml ? '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/comments" Target="comments.xml"/>' : ''}</Relationships>`;
  const types = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>${commentsXml ? '<Override PartName="/word/comments.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.comments+xml"/>' : ''}</Types>`;
  const rootRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>`;
  const entries = [
    { name: '[Content_Types].xml', data: types },
    { name: '_rels/.rels', data: rootRels },
    { name: 'word/document.xml', data: document },
    { name: 'word/styles.xml', data: styles },
    { name: 'word/_rels/document.xml.rels', data: rels },
  ];
  if (commentsXml) entries.push({ name: 'word/comments.xml', data: commentsXml });
  return writeZip(entries);
}

/** 普通文档：blocks = [{ text, style } | { table: string[][] }] */
function buildDocx(blocks) {
  return packageDocx(blocks.map((b) => (b.table ? table(b.table) : para(b))).join(''));
}

/** 在原文里找引用的实际起止（忽略空白与全半角差异）；找不到返回 null */
function findSpan(text, quote) {
  const q = norm(quote);
  if (!q) return null;
  const map = [];
  let n = '';
  for (let i = 0; i < text.length; i++) {
    const c = norm(text[i]);
    for (const ch of c) {
      n += ch;
      map.push(i);
    }
  }
  const at = n.indexOf(q);
  if (at < 0) return null;
  return [map[at], map[at + q.length - 1] + 1];
}

/**
 * 修订稿：原文逐段重排（保留文字，不保留原格式），已采纳的修订写成 Word 修订痕迹（删除 / 插入）与批注。
 * changes = [{ para, quote, action, suggestion, note }]（para 为段落序号，insert 可无 quote）
 * @returns {{ buffer: Buffer, applied: number, asComment: number }}
 */
function buildRevisedDocx(paras, changes, { author = 'AI 法务', date = new Date().toISOString().replace(/\.\d+Z$/, 'Z'), title } = {}) {
  let rid = 1;
  const comments = [];
  const byPara = new Map();
  const tail = [];
  for (const c of changes) {
    if (c.para == null) tail.push(c);
    else (byPara.get(c.para) || byPara.set(c.para, []).get(c.para)).push(c);
  }
  let applied = 0;
  let asComment = 0;
  const addComment = (text) => {
    const id = comments.length;
    comments.push({ id, author, date, text });
    return id;
  };
  const insPara = (text) => `<w:p><w:ins w:id="${rid++}" w:author="${esc(author)}" w:date="${date}">${run(text)}</w:ins></w:p>`;
  const out = [];
  if (title) out.push(para({ text: title, style: 'title' }));
  for (const p of paras) {
    const list = (byPara.get(p.i) || []).map((c) => ({ ...c, span: c.quote ? findSpan(p.text, c.quote) : null }));
    // 同段多处修改：按位置排序，重叠的后者降级为批注
    list.sort((a, b) => (a.span ? a.span[0] : 1e9) - (b.span ? b.span[0] : 1e9));
    let cursor = 0;
    const segs = [];
    const inserts = [];
    const paraComments = [];
    for (const c of list) {
      if (c.action === 'insert') {
        inserts.push(c);
        continue;
      }
      if (!c.span || c.span[0] < cursor || c.action === 'comment') {
        paraComments.push(c);
        if (c.action !== 'comment') asComment++;
        continue;
      }
      const [s, e] = c.span;
      if (s > cursor) segs.push(run(p.text.slice(cursor, s)));
      const cid = c.note ? addComment(c.note) : null;
      if (cid != null) segs.push(`<w:commentRangeStart w:id="${cid}"/>`);
      segs.push(`<w:del w:id="${rid++}" w:author="${esc(author)}" w:date="${date}">${delRun(p.text.slice(s, e))}</w:del>`);
      if (c.action === 'replace' && c.suggestion) segs.push(`<w:ins w:id="${rid++}" w:author="${esc(author)}" w:date="${date}">${run(c.suggestion)}</w:ins>`);
      if (cid != null) segs.push(`<w:commentRangeEnd w:id="${cid}"/><w:r><w:commentReference w:id="${cid}"/></w:r>`);
      cursor = e;
      applied++;
    }
    if (cursor < p.text.length) segs.push(run(p.text.slice(cursor)));
    for (const c of paraComments) {
      const cid = addComment([c.note, c.suggestion ? `建议：${c.suggestion}` : ''].filter(Boolean).join('\n'));
      segs.push(`<w:commentRangeStart w:id="${cid}"/><w:commentRangeEnd w:id="${cid}"/><w:r><w:commentReference w:id="${cid}"/></w:r>`);
    }
    out.push(`<w:p><w:pPr><w:spacing w:after="80"/></w:pPr>${segs.join('')}</w:p>`);
    for (const c of inserts) {
      out.push(insPara(c.suggestion));
      applied++;
    }
  }
  for (const c of tail) {
    out.push(insPara(c.suggestion));
    applied++;
  }
  return { buffer: packageDocx(out.join(''), { comments }), applied, asComment };
}

module.exports = { buildDocx, buildRevisedDocx, findSpan, esc };
