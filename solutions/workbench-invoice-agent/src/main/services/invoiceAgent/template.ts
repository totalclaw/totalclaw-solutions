/**
 * 电子税务局批量导入文件的落盘。
 *
 * 做法：拿官方《批量导入开具发票模板》原文件（应用自带一份 V260401，用户也可以换成自己从电子税务局下载的），
 * 只往「1-发票基本信息」「2-发票明细信息」两张表的列名行下面**追加数据行**，其它一个字节都不动。
 *
 * 为什么不用表格库整本重写：官方模板里有 7 张隐藏的字典表、一张版本表（excelVersion 里写着 pt:20260401）、
 * 几百 K 的数据校验与名称定义。整本重写会丢掉数据校验和样式，导入时万一校验版本或结构就过不了。
 * 所以这里直接改 xlsx 压缩包里对应工作表的 XML：按列名对位，把每个值写成文本单元格（inlineStr）——
 * 官方要求「所有内容输入均为文本格式」，税号、编码、流水号也不会丢前导零。
 */
import { readFileSync, writeFileSync } from 'node:fs';
import AdmZip from 'adm-zip';
import * as XLSX from 'xlsx';
import { ETAX, fitToTemplate, type TemplateSheet } from './logic';

const text = (v: unknown): string => (v == null ? '' : String(v));

/** i18n-ignore: 官方模板表头行的锚点列名 */
const HEADER_ANCHOR = '发票流水号';

export interface EtaxWriteResult {
  /** 官方模板里我们没有数据可填的列（留空） */
  unfilled: string[];
  /** 我们有数据、但模板里找不到对应列的（没写进文件，必须交人处理） */
  unplaced: string[];
  usedOfficial: boolean;
  /** 模板版本（excelVersion 表里的那串，如 pt:20260401）；读不到为空 */
  templateVersion: string;
}

export function colLetter(index: number): string {
  let n = index + 1; let s = '';
  while (n > 0) { const r = (n - 1) % 26; s = String.fromCharCode(65 + r) + s; n = Math.floor((n - 1) / 26); }
  return s;
}

const xmlEsc = (s: string): string => s
  // XML 1.0 不允许的控制字符直接去掉，否则整个文件打不开
  .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** 工作表名 → 压缩包里的 XML 路径 */
function sheetPaths(zip: AdmZip): Map<string, string> {
  const wb = zip.readAsText('xl/workbook.xml');
  const rels = zip.readAsText('xl/_rels/workbook.xml.rels');
  const target = new Map<string, string>();
  for (const m of rels.matchAll(/<Relationship\b[^>]*>/g)) {
    const id = /\bId="([^"]+)"/.exec(m[0])?.[1]; const t = /\bTarget="([^"]+)"/.exec(m[0])?.[1];
    if (id && t) target.set(id, t.startsWith('/') ? t.slice(1) : `xl/${t}`);
  }
  const out = new Map<string, string>();
  for (const m of wb.matchAll(/<sheet\b[^>]*>/g)) {
    const name = /\bname="([^"]+)"/.exec(m[0])?.[1]; const rid = /\br:id="([^"]+)"/.exec(m[0])?.[1];
    if (name && rid && target.has(rid)) out.set(name.replace(/&amp;/g, '&'), target.get(rid)!);
  }
  return out;
}

function rowXml(rowNo: number, values: (string | number)[]): string {
  const cells = values.map((v, i) => {
    const s = text(v);
    return s === '' ? '' : `<c r="${colLetter(i)}${rowNo}" t="inlineStr"><is><t xml:space="preserve">${xmlEsc(s)}</t></is></c>`;
  }).join('');
  return `<row r="${rowNo}">${cells}</row>`;
}

/** 把数据行追加到一张工作表的 XML 里：列名行以下原有的行（示例数据）先去掉 */
export function appendRows(sheetXml: string, headerRowNo: number, rows: (string | number)[][]): string {
  let xml = sheetXml.replace(/<row\b[^>]*\br="(\d+)"[^>]*?(?:\/>|>[\s\S]*?<\/row>)/g, (m, r) => (Number(r) > headerRowNo ? '' : m));
  const body = rows.map((r, i) => rowXml(headerRowNo + 1 + i, r)).join('');
  if (/<sheetData\s*\/>/.test(xml)) xml = xml.replace(/<sheetData\s*\/>/, `<sheetData>${body}</sheetData>`);
  else xml = xml.replace('</sheetData>', `${body}</sheetData>`);
  return xml;
}

export function readTemplateVersion(buf: Buffer): string {
  try {
    const wb = XLSX.read(buf, { type: 'buffer', sheets: ['excelVersion'] });
    const ws = wb.Sheets.excelVersion;
    if (!ws) return '';
    const cells = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1, defval: '' }).flat().map(text).filter(Boolean);
    return cells.find((c) => /\d{6,}/.test(c)) || cells[0] || '';
  } catch { return ''; }
}

export function writeEtaxImport(file: string, sheets: TemplateSheet[], officialTemplate?: string): EtaxWriteResult {
  if (officialTemplate) {
    try {
      const buf = readFileSync(officialTemplate);
      const zip = new AdmZip(buf);
      const paths = sheetPaths(zip);
      // 只为读列名解析我们要写的两张表（官方模板里有几 M 的字典表，不用全读）
      const wb = XLSX.read(buf, { type: 'buffer', sheets: sheets.map((s) => s.name) });
      const unfilled: string[] = []; const unplaced: string[] = [];
      const edits: Array<{ path: string; xml: string }> = [];
      for (const ours of sheets) {
        const path = paths.get(ours.name); const ws = wb.Sheets[ours.name];
        if (!path || !ws) break;
        const aoa = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1, defval: '', raw: false });
        const hr = aoa.slice(0, 15).findIndex((r) => (r || []).some((c) => text(c).replace(/\s/g, '') === HEADER_ANCHOR));
        if (hr < 0) break;
        const fit = fitToTemplate(ours, (aoa[hr] || []).map((h) => text(h).trim()));
        unfilled.push(...fit.unfilled.map((h) => `${ours.name} · ${h}`));
        unplaced.push(...fit.unplaced.map((h) => `${ours.name} · ${h}`));
        edits.push({ path, xml: appendRows(zip.readAsText(path), hr + 1, fit.rows) });
      }
      if (edits.length === sheets.length) {
        for (const e of edits) zip.updateFile(e.path, Buffer.from(e.xml, 'utf8'));
        writeFileSync(file, zip.toBuffer());
        return { unfilled: [...new Set(unfilled)], unplaced, usedOfficial: true, templateVersion: readTemplateVersion(buf) };
      }
    } catch { /* 模板读不了：落到下面的简单写法，并告诉界面没用上模板 */ }
  }
  // 没有可用的官方模板：按官方的三行表头结构写一份只有两张表的文件（没有字典表与版本表，可能被拒收）
  const wb = XLSX.utils.book_new();
  for (const s of sheets) {
    const ws = XLSX.utils.aoa_to_sheet([[''], [''], s.headers, ...s.rows.map((r) => r.map(text))]);
    for (const k of Object.keys(ws)) if (!k.startsWith('!') && ws[k]) { ws[k].t = 's'; ws[k].z = '@'; }
    ws['!cols'] = s.headers.map((h) => ({ wch: Math.max(12, h.length * 2 + 2) }));
    XLSX.utils.book_append_sheet(wb, ws, s.name.slice(0, 31));
  }
  XLSX.writeFile(wb, file);
  return { unfilled: [], unplaced: [], usedOfficial: false, templateVersion: '' };
}

export const BUNDLED_TEMPLATE_VERSION = ETAX.version;
