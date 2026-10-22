/**
 * 文档 → 段落（带页码），以及「模型给原文引用 → 代码在原文里找位置」。
 *
 * 位置一律由代码定：模型只给引用的原话（quote），这里在段落里找；找不到就是找不到，不信模型报的行号。
 *   docx：自己解析 word/document.xml（段落 = w:p，跳过已删除的修订文字），保留段落序号，修订稿按它回写
 *   pdf ：宿主 documentExtractor 取每页文字（入口注入），按行拼段
 *   txt / md：按空行分段
 * 本文件在 workbench-legal-agent 与 workbench-hr-agent 各有一份，内容必须一致。
 */
const { readFileSync } = require('node:fs');
const { extname } = require('node:path');
const { readZip } = require('./zip.cjs');

const ENT = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" };
function decodeXml(s) {
  return s.replace(/&(#x[0-9a-f]+|#\d+|\w+);/gi, (m, e) => {
    if (e[0] === '#') return String.fromCodePoint(e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10));
    return ENT[e] ?? m;
  });
}

/** docx document.xml → 段落文本（含表格单元格里的段落） */
function docxParagraphs(buf) {
  const files = readZip(buf);
  const xml = files.get('word/document.xml');
  if (!xml) throw new Error('docx 里没有 word/document.xml');
  const s = xml.toString('utf8');
  const paras = [];
  const re = /<w:p[\s>][\s\S]*?<\/w:p>|<w:p\/>/g;
  let m;
  while ((m = re.exec(s))) {
    const p = m[0]
      .replace(/<w:del\b[\s\S]*?<\/w:del>/g, '') // 已删除的修订文字不算正文
      .replace(/<w:tab\/>/g, '\t')
      .replace(/<w:br\/>/g, '\n');
    let text = '';
    const tre = /<w:t(?:\s[^>]*)?>([\s\S]*?)<\/w:t>|\t|\n/g;
    let t;
    while ((t = tre.exec(p))) text += t[1] !== undefined ? decodeXml(t[1]) : t[0];
    paras.push(text);
  }
  return paras;
}

const LINE_END = /[。；;：:！!？?]$/;
const CLAUSE_START = /^(第[一二三四五六七八九十百零〇\d]+[条章节款]|[一二三四五六七八九十]+、|\d+(\.\d+)*[、.．\s]|（[一二三四五六七八九十\d]+）|\([一二三四五六七八九十\d]+\))/;

/** pdf 每页按行 → 段：行尾是句末标点，或下一行是条款编号开头时断段 */
function linesToParas(text) {
  const lines = String(text || '').split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const out = [];
  let cur = '';
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (cur && CLAUSE_START.test(l)) {
      out.push(cur);
      cur = '';
    }
    cur += l;
    if (LINE_END.test(l) || i === lines.length - 1) {
      out.push(cur);
      cur = '';
    }
  }
  if (cur) out.push(cur);
  return out;
}

/**
 * @param {string} file
 * @param {{ pdf?: (file:string)=>Promise<{pages:{page:number,text:string}[], warning?:string, ocr?:boolean}> }} [host]
 * @returns {Promise<{kind:string, paras:{i:number,page:number|null,text:string}[], text:string, warning?:string, ocr?:boolean}>}
 */
async function extractParas(file, host = {}) {
  const ext = extname(file).toLowerCase();
  let raw = [];
  let warning;
  let ocr = false;
  let kind = ext.slice(1);
  if (ext === '.docx') {
    raw = docxParagraphs(readFileSync(file)).map((text) => ({ text, page: null }));
  } else if (ext === '.pdf') {
    if (!host.pdf) throw new Error('本机不能解析 PDF（宿主未提供 PDF 抽取），请转成 docx 或 txt');
    const doc = await host.pdf(file);
    warning = doc.warning;
    ocr = !!doc.ocr;
    for (const pg of doc.pages || []) for (const text of linesToParas(pg.text)) raw.push({ text, page: pg.page });
  } else if (ext === '.txt' || ext === '.md') {
    raw = readFileSync(file, 'utf8')
      .replace(/^﻿/, '')
      .split(/\r?\n\s*\r?\n|\r?\n(?=\s*(?:第[一二三四五六七八九十百\d]+条|\d+[、.．]))/)
      .map((text) => ({ text: text.replace(/\r?\n/g, ''), page: null }));
  } else {
    kind = 'unsupported';
    throw new Error('只支持 docx / pdf / txt / md');
  }
  const paras = raw.map((p, i) => ({ i, page: p.page, text: p.text })).filter((p) => p.text.trim());
  if (!paras.length && !warning) warning = '没有读到文字（可能是扫描件或空文档）';
  return { kind, paras, text: paras.map((p) => p.text).join('\n'), warning, ocr };
}

/** 归一化：去空白、全角转半角、统一引号，用于比对 */
function norm(s) {
  return String(s || '')
    .replace(/[！-～]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0))
    .replace(/[“”「」『』]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/\s+/g, '')
    .toLowerCase();
}

/**
 * 在段落里找模型给的引用。
 * 先在单段里找归一化后的整句；再跨段（引用跨了段落）；最后用开头 16 个字近似定位（approx=true）。
 * @returns {{para:number, page:number|null, quote:string, approx?:boolean}|null}
 */
function locate(paras, quote) {
  const q = norm(quote);
  if (q.length < 4) return null;
  for (const p of paras) {
    if (norm(p.text).includes(q)) return { para: p.i, page: p.page, quote: String(quote).trim().slice(0, 300) };
  }
  // 跨段：拼成全文找，换算回起始段
  let acc = '';
  const starts = [];
  for (const p of paras) {
    starts.push([acc.length, p]);
    acc += norm(p.text);
  }
  const at = acc.indexOf(q);
  if (at >= 0) {
    const hit = starts.filter(([s]) => s <= at).pop()[1];
    return { para: hit.i, page: hit.page, quote: String(quote).trim().slice(0, 300) };
  }
  if (q.length >= 20) {
    const head = q.slice(0, 16);
    const p = paras.find((x) => norm(x.text).includes(head));
    if (p) return { para: p.i, page: p.page, quote: String(quote).trim().slice(0, 300), approx: true };
  }
  return null;
}

/** 文字是否真的出现在原文里（证据核对用） */
function appearsIn(text, snippet) {
  const s = norm(snippet);
  return s.length >= 2 && norm(text).includes(s);
}

module.exports = { extractParas, docxParagraphs, linesToParas, locate, appearsIn, norm, decodeXml };
