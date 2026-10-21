/**
 * 审计组读不可信文件（流程文档、制度、证据、回函、KYC 资料包、举报材料）：
 * 抽文本（documentExtractor，扫描件走 OCR）→ 截断后放进 <untrusted_document>；
 * 模型给的引用一律回原文定位（locateQuote），定位不到的标「未核实」或丢弃。
 */
import type { FauDatasetMeta } from '@totalclaw/ipc-contracts';
import { extractDocument, locateQuote, type ExtractedDoc } from '../../../documentExtractor';

export interface LoadedDoc { name: string; doc: ExtractedDoc }

/** 每份文件给模型的上限；超出截断（截断处写明，避免模型以为是全文） */
export const DOC_CHAR_LIMIT = 20_000;

export async function loadDocs(metas: Pick<FauDatasetMeta, 'storedPath' | 'fileName'>[]): Promise<LoadedDoc[]> {
  const out: LoadedDoc[] = [];
  for (const m of metas) {
    if (!m.storedPath) continue;
    out.push({ name: m.fileName, doc: await extractDocument(m.storedPath, m.fileName) });
  }
  return out;
}

export function untrusted(docs: LoadedDoc[], limit = DOC_CHAR_LIMIT): Array<{ name: string; text: string }> {
  return docs.filter((d) => d.doc.text.trim()).map((d) => ({
    name: d.name,
    text: d.doc.text.length > limit ? `${d.doc.text.slice(0, limit)}\n[...truncated]` : d.doc.text,
  }));
}

/** 引用回原文：给了文件名先在那份里找，找不到再全部文件找；返回命中的文件名 */
export function locate(docs: LoadedDoc[], quote: string, docName?: string): { verified: boolean; docName: string } {
  const q = String(quote || '').trim();
  if (q.length < 2) return { verified: false, docName: docName || '' };
  const ordered = [...docs.filter((d) => d.name === docName), ...docs.filter((d) => d.name !== docName)];
  for (const d of ordered) if (locateQuote(d.doc, q).match !== 'none') return { verified: true, docName: d.name };
  return { verified: false, docName: docName || '' };
}

/** 测试与内部用：直接拿一段文本当作一份文件 */
export function textDoc(name: string, text: string): LoadedDoc {
  return { name, doc: { fileName: name, kind: 'text', text, pages: [], sheets: [] } as unknown as ExtractedDoc };
}
