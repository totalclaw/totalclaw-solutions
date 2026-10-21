/**
 * B4 交叉索引核对（纯函数）：底稿里提到的索引号（如 A1-03、B1-C07-T02）必须能找到对应的底稿——
 * 文件名、表名里有，或在某个单元格里单独写着（作为索引号标签）。只在句子里被提到、哪里都找不到的标「断链」。
 */
const REF = /(?<![A-Za-z0-9])([A-G][1-9]\d?|P[1-6])-\d{2}(?:-[A-Z]\d{2}){0,3}(?![A-Za-z0-9])/g;

export interface PaperText { file: string; sheets: string[]; cells: string[] }

export function crossIndex(papers: PaperText[], extraNames: string[] = []): { ref: string; file: string; found: boolean }[] {
  const labels = new Set<string>();
  for (const p of papers) {
    for (const c of p.cells) if (new RegExp(`^${REF.source}$`).test(c.trim())) labels.add(c.trim().toUpperCase());
  }
  const names = [...papers.flatMap((p) => [p.file, ...p.sheets]), ...extraNames].map((n) => n.toUpperCase());
  const out: { ref: string; file: string; found: boolean }[] = [];
  const seen = new Set<string>();
  for (const p of papers) {
    for (const c of p.cells) {
      if (labels.has(c.trim().toUpperCase())) continue;
      for (const m of c.matchAll(REF)) {
        const ref = m[0].toUpperCase();
        const key = `${p.file}:${ref}`;
        if (seen.has(key)) continue;
        seen.add(key);
        out.push({ ref, file: p.file, found: labels.has(ref) || names.some((n) => n.includes(ref)) });
      }
    }
  }
  return out;
}
