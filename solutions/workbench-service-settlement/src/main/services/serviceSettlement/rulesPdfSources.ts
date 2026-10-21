import { basename, normalize } from 'node:path';
import { t as i18nT } from '@totalclaw/i18n';
export function rulesPdfPaths(input: { path?: string; paths?: string[] }): string[] {
  const supplied = input.paths ?? (input.path ? [input.path] : []);
  if (!Array.isArray(supplied) || supplied.some(p => typeof p !== 'string' || !p.trim())) throw new Error(i18nT('PDF 文件列表无效'));
  const seen = new Set<string>();
  const paths = supplied.map(p => normalize(p.trim())).filter(p => {
    const key = process.platform === 'win32' ? p.toLowerCase() : p;
    if (seen.has(key)) return false;
    seen.add(key); return true;
  });
  if (!paths.length) throw new Error(i18nT('请选择 PDF 文件'));
  if (paths.length > 20) throw new Error(i18nT('一次最多读取 20 份规则 PDF'));
  if (paths.some(p => !/\.pdf$/i.test(p))) throw new Error(i18nT('规则文件仅支持 PDF'));
  return paths;
}
export function combineRuleDocuments(documents: { path: string; text: string }[]): string {
  const text = documents.map((doc, index) => {
    if (!doc.text.trim()) throw new Error(i18nT('{p0}：没有可读文字', { p0: basename(doc.path) }));
    return i18nT("===== 文件 {p0}：{p1} =====\n{p2}", { p0: index + 1, p1: basename(doc.path), p2: doc.text.trim() });
  }).join('\n\n');
  if (text.length > 64000) throw new Error(i18nT('规则 PDF 总文字超过单次 64000 字上限，请精简文件后重试；未截断或更新规则'));
  return text;
}
