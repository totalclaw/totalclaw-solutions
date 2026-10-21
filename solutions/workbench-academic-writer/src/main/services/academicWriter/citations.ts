/**
 * 学术写作智能体 · 引用与参考文献（纯函数）。
 *
 * 草稿里的引用统一写成文献库编号 [n]（n = 文献库里的序号，从 1 起），模型只能用这些编号。
 * 成稿 / 导出时：
 *   - 找出所有 [n]、[n, m]、[n-m]；库里没有的编号记为「库外引用」（模型编的，必须处理）；
 *   - 顺序编码（GB/T 7714、IEEE）按首次出现重新编号；APA 换成「(作者, 年份)」；
 *   - 参考文献表按所选格式由元数据拼出来，模型不参与。
 */
import type { AwCiteStyle, AwPaper } from '@totalclaw/ipc-contracts';
import WORDS from './citationWords.json';

const CITE_RE = /\[(\d+(?:\s*[-–—,，、]\s*\d+)*)\]/g;

function expand(group: string): number[] {
  const out: number[] = [];
  for (const part of group.split(/[,，、]/)) {
    const m = part.trim().match(/^(\d+)\s*[-–—]\s*(\d+)$/);
    if (m) {
      const a = Number(m[1]);
      const b = Number(m[2]);
      if (b >= a && b - a <= 50) for (let i = a; i <= b; i++) out.push(i);
    } else if (/^\d+$/.test(part.trim())) out.push(Number(part.trim()));
  }
  return out;
}

/** 文中引用到的库编号（按首次出现顺序）与库外编号 */
export function extractCites(text: string, librarySize: number): { order: number[]; bad: number[] } {
  const order: number[] = [];
  const bad: number[] = [];
  for (const m of String(text || '').matchAll(CITE_RE)) {
    for (const n of expand(m[1])) {
      if (n < 1 || n > librarySize) { if (!bad.includes(n)) bad.push(n); continue; }
      if (!order.includes(n)) order.push(n);
    }
  }
  return { order, bad };
}

function isCjk(s: string): boolean {
  return /[一-鿿]/.test(s);
}

function initials(given: string): string {
  return given.split(/[\s-]+/).filter(Boolean).map((g) => `${g[0].toUpperCase()}`).join(' ');
}

/** 作者名拆成 姓 + 名缩写。PubMed 本身就是「Smith JA」格式，其余是「John A Smith」 */
function splitName(name: string): { family: string; given: string } {
  const n = name.trim();
  if (isCjk(n)) return { family: n, given: '' };
  const pubmed = n.match(/^([\p{L}'’\- ]+?)\s+([A-Z]{1,3})$/u);
  if (pubmed) return { family: pubmed[1], given: pubmed[2].split('').join(' ') };
  const parts = n.split(/\s+/);
  if (parts.length === 1) return { family: n, given: '' };
  return { family: parts[parts.length - 1], given: initials(parts.slice(0, -1).join(' ')) };
}

function gbAuthors(authors: string[]): string {
  const list = authors.slice(0, 3).map((a) => {
    const { family, given } = splitName(a);
    return isCjk(family) ? family : `${family.toUpperCase()} ${given.replace(/\s/g, ' ')}`.trim();
  });
  if (!list.length) return '';
  const etal = authors.length > 3 ? (authors.some(isCjk) ? `, ${WORDS.etalZh}` : ', et al') : '';
  return `${list.join(', ')}${etal}`;
}

function apaAuthors(authors: string[]): string {
  const list = authors.map((a) => {
    const { family, given } = splitName(a);
    return given ? `${family}, ${given.split(' ').map((g) => `${g}.`).join(' ')}` : family;
  });
  if (list.length <= 2) return list.join(' & ');
  if (list.length > 20) return `${list.slice(0, 19).join(', ')}, … ${list[list.length - 1]}`;
  return `${list.slice(0, -1).join(', ')}, & ${list[list.length - 1]}`;
}

function ieeeAuthors(authors: string[]): string {
  const list = authors.slice(0, 6).map((a) => {
    const { family, given } = splitName(a);
    return given ? `${given.split(' ').map((g) => `${g}.`).join(' ')} ${family}` : family;
  });
  if (authors.length > 6) return `${list[0]} et al.`;
  return list.length <= 2 ? list.join(' and ') : `${list.slice(0, -1).join(', ')}, and ${list[list.length - 1]}`;
}

/** 文献类型标识：arXiv 预印本算 [A]? 按 GB/T 7714-2015，预印本用 [EB/OL]，期刊 [J] */
function gbType(p: AwPaper): string {
  return p.source === 'arxiv' && (!p.journal || p.journal === 'arXiv') ? '[EB/OL]' : '[J]';
}

export function formatReference(p: AwPaper, style: AwCiteStyle, n?: number): string {
  const doi = p.doi ? `DOI: ${p.doi}` : '';
  if (style === 'apa') {
    const vol = p.volume ? `, ${p.volume}${p.issue ? `(${p.issue})` : ''}` : '';
    const pages = p.pages ? `, ${p.pages}` : '';
    const link = p.doi ? ` https://doi.org/${p.doi}` : p.url ? ` ${p.url}` : '';
    return `${apaAuthors(p.authors)} (${p.year || 'n.d.'}). ${p.title}. ${p.journal ? `${p.journal}` : ''}${vol}${pages}.${link}`.replace(/\s+\./g, '.');
  }
  if (style === 'ieee') {
    const parts = [`${ieeeAuthors(p.authors)}, "${p.title},"`, p.journal ? `${p.journal},` : '', p.volume ? `vol. ${p.volume},` : '', p.issue ? `no. ${p.issue},` : '', p.pages ? `pp. ${p.pages},` : '', `${p.year}${p.doi ? ',' : '.'}`, p.doi ? `doi: ${p.doi}.` : ''];
    return `[${n ?? ''}] ${parts.filter(Boolean).join(' ')}`;
  }
  // GB/T 7714-2015 顺序编码制
  const tail = gbType(p) === '[EB/OL]'
    ? `${p.year}. ${p.url}`
    : `${p.journal}, ${p.year}${p.volume ? `, ${p.volume}` : ''}${p.issue ? `(${p.issue})` : ''}${p.pages ? `: ${p.pages}` : ''}`;
  return `[${n ?? ''}] ${gbAuthors(p.authors)}. ${p.title}${gbType(p)}. ${tail}.${doi ? ` ${doi}.` : ''}`.replace(/\.\./g, '.');
}

function apaInText(p: AwPaper): string {
  const fam = (a: string) => splitName(a).family;
  const who = p.authors.length === 0 ? p.title.slice(0, 20) : p.authors.length === 1 ? fam(p.authors[0]) : p.authors.length === 2 ? `${fam(p.authors[0])} & ${fam(p.authors[1])}` : `${fam(p.authors[0])} et al.`;
  return `${who}, ${p.year || 'n.d.'}`;
}

/**
 * 成稿：把库编号换成最终引用，并生成参考文献表。
 * 库外编号原样保留成「[?n]」，一眼能看出来，不会混进正式参考文献。
 */
export function renderManuscript(text: string, library: AwPaper[], style: AwCiteStyle): { text: string; references: string[]; order: number[]; bad: number[] } {
  const { order, bad } = extractCites(text, library.length);
  const newNo = new Map(order.map((lib, i) => [lib, i + 1]));
  const out = String(text || '').replace(CITE_RE, (_m, group: string) => {
    const nums = expand(group);
    if (style === 'apa') {
      const good = nums.filter((n) => newNo.has(n)).map((n) => apaInText(library[n - 1]));
      const badPart = nums.filter((n) => !newNo.has(n)).map((n) => `?${n}`);
      return `(${[...good, ...badPart].join('; ')})`;
    }
    return `[${nums.map((n) => (newNo.has(n) ? String(newNo.get(n)) : `?${n}`)).join(', ')}]`;
  });
  const refs = order.map((lib, i) => formatReference(library[lib - 1], style, i + 1));
  if (style === 'apa') refs.sort((a, b) => a.localeCompare(b));
  return { text: out, references: refs, order, bad };
}

export function toBibtex(p: AwPaper): string {
  const first = splitName(p.authors[0] || 'anon').family.replace(/[^A-Za-z]/g, '').toLowerCase() || 'ref';
  const key = `${first}${p.year || ''}${normalizeKeyWord(p.title)}`;
  const fields: Array<[string, string | undefined]> = [
    ['title', p.title], ['author', p.authors.join(' and ')], ['journal', p.journal], ['year', p.year],
    ['volume', p.volume], ['number', p.issue], ['pages', p.pages?.replace('-', '--')], ['doi', p.doi], ['url', p.url],
  ];
  const type = p.source === 'arxiv' && (!p.journal || p.journal === 'arXiv') ? 'misc' : 'article';
  return `@${type}{${key},\n${fields.filter(([, v]) => v).map(([k, v]) => `  ${k} = {${String(v).replace(/[{}]/g, '')}}`).join(',\n')}\n}`;
}

function normalizeKeyWord(title: string): string {
  return (String(title).match(/[A-Za-z]{4,}/)?.[0] || '').toLowerCase();
}

export function wordCount(text: string): number {
  const t = String(text || '');
  const cjk = (t.match(/[一-鿿]/g) || []).length;
  const latin = (t.replace(/[一-鿿]/g, ' ').match(/[A-Za-z0-9]+/g) || []).length;
  return cjk + latin;
}
