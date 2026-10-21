/**
 * 学术写作智能体 · 文献检索：直接调各学术库的公开接口（不经过模型，不编造条目）。
 *
 *   PubMed      NCBI E-utilities：esearch → esummary（元数据）→ efetch（摘要）
 *   Europe PMC  REST search，resultType=core 自带摘要、DOI、卷期页、开放获取链接
 *   arXiv       Atom API
 *   Crossref    /works?query.bibliographic=，限期刊论文
 *   OpenAlex    /works?search=，摘要是倒排索引，这里还原成正文
 *
 * 解析函数都是纯函数（parseXxx），单测直接喂接口原样返回；fetch 层只管超时、UA、错误归一。
 * 多个来源查到同一篇（DOI / PMID / arXiv 号 / 规整后的标题相同）合并成一条，记下都在哪查到。
 */
import { createHash } from 'node:crypto';
import { t as i18nT } from '@totalclaw/i18n';
import type { AwPaper, AwSource } from '@totalclaw/ipc-contracts';

const TIMEOUT_MS = 25_000;

function pid(source: AwSource, sourceId: string): string {
  return `p_${createHash('sha1').update(`${source}:${sourceId}`).digest('hex').slice(0, 12)}`;
}

export function stripTags(s: unknown): string {
  return String(s ?? '')
    .replace(/<\/(p|h\d|sec|jats:p|jats:sec|AbstractText)>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&amp;/g, '&')
    .replace(/[ \t\u00a0]+/g, ' ')
    .replace(/\s*\n\s*/g, '\n')
    .trim();
}

export function normDoi(doi: unknown): string {
  return String(doi || '').trim().replace(/^https?:\/\/(dx\.)?doi\.org\//i, '').replace(/^doi:\s*/i, '').toLowerCase();
}

export function normTitle(t: string): string {
  return String(t || '').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '');
}

// ─── PubMed ─────────────────────────────────────────────────────────────

export function parsePubmedSummary(json: any, abstracts: Record<string, string>): AwPaper[] {
  const r = json?.result || {};
  return (r.uids || []).map((uid: string) => {
    const d = r[uid] || {};
    const doi = (d.articleids || []).find((a: any) => a.idtype === 'doi')?.value;
    return {
      id: pid('pubmed', uid), source: 'pubmed', sourceId: uid, pmid: uid,
      title: stripTags(d.title).replace(/\.$/, ''),
      authors: (d.authors || []).filter((a: any) => a.authtype === 'Author').map((a: any) => String(a.name)),
      journal: String(d.fulljournalname || d.source || ''),
      year: String(d.pubdate || '').slice(0, 4),
      volume: d.volume || undefined, issue: d.issue || undefined, pages: d.pages || undefined,
      doi: doi ? normDoi(doi) : undefined,
      url: `https://pubmed.ncbi.nlm.nih.gov/${uid}/`,
      abstract: abstracts[uid] || '',
    } as AwPaper;
  }).filter((p: AwPaper) => p.title);
}

/** efetch XML → pmid → 摘要（带小标题的结构化摘要拼成「背景：…」） */
export function parsePubmedAbstracts(xml: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const art of String(xml || '').split(/<PubmedArticle>/).slice(1)) {
    const id = art.match(/<PMID[^>]*>(\d+)<\/PMID>/)?.[1];
    if (!id) continue;
    const parts = [...art.matchAll(/<AbstractText([^>]*)>([\s\S]*?)<\/AbstractText>/g)].map((m) => {
      const label = m[1].match(/Label="([^"]+)"/)?.[1];
      const body = stripTags(m[2]);
      return label ? `${label[0]}${label.slice(1).toLowerCase()}: ${body}` : body;
    });
    if (parts.length) out[id] = parts.join('\n');
  }
  return out;
}

// ─── Europe PMC ─────────────────────────────────────────────────────────

export function parseEuropePmc(json: any): AwPaper[] {
  return (json?.resultList?.result || []).map((r: any) => {
    const ji = r.journalInfo || {};
    const urls: any[] = r.fullTextUrlList?.fullTextUrl || [];
    const pdf = urls.find((u) => u.documentStyle === 'pdf' && /free|open/i.test(u.availability || ''))?.url;
    const sid = String(r.id || r.pmid || r.doi || '');
    return {
      id: pid('europepmc', sid), source: 'europepmc', sourceId: sid,
      pmid: r.pmid || undefined, doi: r.doi ? normDoi(r.doi) : undefined,
      title: stripTags(r.title).replace(/\.$/, ''),
      authors: Array.isArray(r.authorList?.author) ? r.authorList.author.map((a: any) => String(a.fullName || `${a.lastName || ''} ${a.initials || ''}`).trim()) : String(r.authorString || '').replace(/\.$/, '').split(/,\s*/).filter(Boolean),
      journal: String(ji.journal?.title || r.journalTitle || r.bookOrReportDetails?.publisher || ''),
      year: String(r.pubYear || ''),
      volume: ji.volume || undefined, issue: ji.issue || undefined, pages: r.pageInfo || undefined,
      url: r.pmid ? `https://europepmc.org/article/MED/${r.pmid}` : r.doi ? `https://doi.org/${r.doi}` : `https://europepmc.org/search?query=${encodeURIComponent(sid)}`,
      pdfUrl: pdf, abstract: stripTags(r.abstractText),
      citedBy: r.citedByCount != null ? Number(r.citedByCount) : undefined,
      openAccess: r.isOpenAccess === 'Y',
    } as AwPaper;
  }).filter((p: AwPaper) => p.title);
}

// ─── arXiv ──────────────────────────────────────────────────────────────

export function parseArxiv(xml: string): AwPaper[] {
  const out: AwPaper[] = [];
  for (const e of String(xml || '').split(/<entry>/).slice(1)) {
    const tag = (n: string) => stripTags(e.match(new RegExp(`<${n}[^>]*>([\\s\\S]*?)</${n}>`))?.[1] || '');
    const absUrl = tag('id');
    const arxivId = absUrl.replace(/^https?:\/\/arxiv\.org\/abs\//, '');
    if (!arxivId) continue;
    const doi = e.match(/<arxiv:doi[^>]*>([^<]+)<\/arxiv:doi>/)?.[1];
    out.push({
      id: pid('arxiv', arxivId.replace(/v\d+$/, '')), source: 'arxiv', sourceId: arxivId, arxivId,
      title: tag('title').replace(/\s+/g, ' '),
      authors: [...e.matchAll(/<author>\s*<name>([^<]+)<\/name>/g)].map((m) => m[1].trim()),
      journal: stripTags(e.match(/<arxiv:journal_ref[^>]*>([^<]+)</)?.[1] || '') || 'arXiv',
      year: tag('published').slice(0, 4),
      doi: doi ? normDoi(doi) : undefined,
      url: `https://arxiv.org/abs/${arxivId}`,
      pdfUrl: `https://arxiv.org/pdf/${arxivId}`,
      abstract: tag('summary').replace(/\s+/g, ' '),
      openAccess: true,
    });
  }
  return out;
}

// ─── Crossref ───────────────────────────────────────────────────────────

export function parseCrossref(json: any): AwPaper[] {
  return (json?.message?.items || []).map((it: any) => {
    const doi = normDoi(it.DOI);
    const y = it.issued?.['date-parts']?.[0]?.[0] ?? it.published?.['date-parts']?.[0]?.[0];
    return {
      id: pid('crossref', doi), source: 'crossref', sourceId: doi, doi,
      title: stripTags((it.title || [])[0] || ''),
      authors: (it.author || []).map((a: any) => [a.given, a.family].filter(Boolean).join(' ') || a.name || '').filter(Boolean),
      journal: String((it['container-title'] || [])[0] || ''),
      year: y ? String(y) : '',
      volume: it.volume || undefined, issue: it.issue || undefined, pages: it.page || undefined,
      url: `https://doi.org/${doi}`,
      abstract: stripTags(it.abstract),
      citedBy: it['is-referenced-by-count'] != null ? Number(it['is-referenced-by-count']) : undefined,
    } as AwPaper;
  }).filter((p: AwPaper) => p.title && p.doi);
}

// ─── OpenAlex ───────────────────────────────────────────────────────────

/** OpenAlex 摘要是「词 → 位置」倒排索引，按位置还原成正文 */
export function invertedToText(idx: Record<string, number[]> | null | undefined): string {
  if (!idx) return '';
  const words: string[] = [];
  for (const [w, pos] of Object.entries(idx)) for (const p of pos) words[p] = w;
  return words.filter((x) => x != null).join(' ');
}

export function parseOpenAlex(json: any): AwPaper[] {
  return (json?.results || []).map((w: any) => {
    const sid = String(w.id || '').replace('https://openalex.org/', '');
    const b = w.biblio || {};
    return {
      id: pid('openalex', sid), source: 'openalex', sourceId: sid,
      doi: w.doi ? normDoi(w.doi) : undefined,
      title: stripTags(w.title || w.display_name || ''),
      authors: (w.authorships || []).map((a: any) => String(a.author?.display_name || '')).filter(Boolean),
      journal: String(w.primary_location?.source?.display_name || ''),
      year: w.publication_year ? String(w.publication_year) : '',
      volume: b.volume || undefined, issue: b.issue || undefined,
      pages: b.first_page ? (b.last_page ? `${b.first_page}-${b.last_page}` : String(b.first_page)) : undefined,
      url: w.doi || String(w.id || ''),
      pdfUrl: w.open_access?.oa_url || undefined,
      abstract: invertedToText(w.abstract_inverted_index),
      citedBy: w.cited_by_count != null ? Number(w.cited_by_count) : undefined,
      openAccess: !!w.open_access?.is_oa,
    } as AwPaper;
  }).filter((p: AwPaper) => p.title);
}

// ─── 合并去重 ───────────────────────────────────────────────────────────

function keysOf(p: AwPaper): string[] {
  return [p.doi && `doi:${normDoi(p.doi)}`, p.pmid && `pmid:${p.pmid}`, p.arxivId && `arxiv:${p.arxivId.replace(/v\d+$/, '')}`, `t:${normTitle(p.title)}`].filter(Boolean) as string[];
}

/**
 * 同一篇合并：字段取「有值的那个」，摘要取最长的，被引取最大的。
 * 排序：多个库都查到的在前，其余按各库自己的相关度名次交错（每个库的第 1 名、再各库第 2 名…），
 * 不按被引数排 —— 实测按被引排会把 OpenAlex 里高被引但离题的文章（ChatGPT 考 USMLE）顶到最前。
 */
export function mergePapers(lists: AwPaper[][]): AwPaper[] {
  const out: AwPaper[] = [];
  const index = new Map<string, AwPaper>();
  const rank = new Map<AwPaper, number>();
  for (const list of lists) {
    for (const [i, p] of list.entries()) {
      const hit = keysOf(p).map((k) => index.get(k)).find(Boolean);
      if (!hit) {
        const copy = { ...p, foundIn: [p.source] };
        out.push(copy);
        rank.set(copy, i);
        keysOf(copy).forEach((k) => index.set(k, copy));
        continue;
      }
      rank.set(hit, Math.min(rank.get(hit) ?? i, i));
      if (!hit.foundIn!.includes(p.source)) hit.foundIn!.push(p.source);
      for (const f of ['doi', 'pmid', 'arxivId', 'volume', 'issue', 'pages', 'pdfUrl', 'journal', 'year'] as const) if (!hit[f] && p[f]) (hit as any)[f] = p[f];
      if ((p.abstract || '').length > (hit.abstract || '').length) hit.abstract = p.abstract;
      if (!hit.authors.length && p.authors.length) hit.authors = p.authors;
      if (p.citedBy != null) hit.citedBy = Math.max(hit.citedBy ?? 0, p.citedBy);
      hit.openAccess = hit.openAccess || p.openAccess;
      keysOf(p).forEach((k) => index.set(k, hit));
    }
  }
  return out
    .map((p, order) => ({ p, order }))
    .sort((a, b) => (b.p.foundIn!.length - a.p.foundIn!.length) || ((rank.get(a.p) ?? 99) - (rank.get(b.p) ?? 99)) || (a.order - b.order))
    .map((x) => x.p);
}

// ─── 网络层 ─────────────────────────────────────────────────────────────

async function get(url: string, email: string, as: 'json' | 'text'): Promise<any> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: ctrl.signal, headers: { 'User-Agent': `TotalClaw-AcademicWriter/1.0${email ? ` (mailto:${email})` : ''}`, Accept: as === 'json' ? 'application/json' : '*/*' } });
    if (res.status === 429) throw new Error(i18nT('请求太频繁，被限流了，稍等一会儿再查'));
    if (!res.ok) throw new Error(i18nT('接口返回 {p0}', { p0: res.status }));
    return as === 'json' ? await res.json() : await res.text();
  } catch (error) {
    if ((error as Error)?.name === 'AbortError') throw new Error(i18nT('{p0} 秒没有响应', { p0: TIMEOUT_MS / 1000 }));
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * arXiv 检索式：整句加引号会变成短语精确匹配（实测 5 个词的选题一条都搜不到），
 * 这里拆成词逐个 all: 再 AND；保留用户写的 "短语"，丢掉 OR / AND / 括号这类其它库的布尔写法。
 */
export function arxivQuery(query: string): string {
  const phrases = [...query.matchAll(/"([^"]+)"/g)].map((m) => `all:"${m[1]}"`);
  const words = query.replace(/"[^"]+"/g, ' ').replace(/[()]/g, ' ').split(/\s+/)
    .filter((w) => w && !/^(and|or|not)$/i.test(w)).slice(0, 8).map((w) => `all:${w}`);
  return encodeURIComponent([...phrases, ...words].join(' AND ')).replace(/%20/g, '+');
}

export interface SearchOptions { limit: number; yearFrom?: number; email: string }

export async function searchSource(source: Exclude<AwSource, 'web'>, query: string, o: SearchOptions): Promise<AwPaper[]> {
  const q = encodeURIComponent(query);
  const n = Math.max(1, Math.min(50, o.limit));
  const mail = o.email ? `&email=${encodeURIComponent(o.email)}` : '';
  if (source === 'pubmed') {
    const term = o.yearFrom ? `${query} AND ${o.yearFrom}:3000[dp]` : query;
    const s = await get(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&retmode=json&sort=relevance&retmax=${n}&term=${encodeURIComponent(term)}&tool=totalclaw${mail}`, o.email, 'json');
    const ids: string[] = s?.esearchresult?.idlist || [];
    if (!ids.length) return [];
    const [sum, xml] = await Promise.all([
      get(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&retmode=json&id=${ids.join(',')}&tool=totalclaw${mail}`, o.email, 'json'),
      get(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&rettype=abstract&retmode=xml&id=${ids.join(',')}&tool=totalclaw${mail}`, o.email, 'text'),
    ]);
    return parsePubmedSummary(sum, parsePubmedAbstracts(xml));
  }
  if (source === 'europepmc') {
    const qq = o.yearFrom ? `${query} AND PUB_YEAR:[${o.yearFrom} TO 3000]` : query;
    return parseEuropePmc(await get(`https://www.ebi.ac.uk/europepmc/webservices/rest/search?format=json&resultType=core&pageSize=${n}&query=${encodeURIComponent(qq)}${mail}`, o.email, 'json'));
  }
  if (source === 'arxiv') {
    const xml = await get(`https://export.arxiv.org/api/query?search_query=${arxivQuery(query)}&max_results=${n}&sortBy=relevance`, o.email, 'text');
    return parseArxiv(xml).filter((p) => !o.yearFrom || Number(p.year) >= o.yearFrom);
  }
  if (source === 'crossref') {
    const f = `type:journal-article${o.yearFrom ? `,from-pub-date:${o.yearFrom}` : ''}`;
    return parseCrossref(await get(`https://api.crossref.org/works?query.bibliographic=${q}&rows=${n}&filter=${f}&select=DOI,title,author,container-title,issued,published,volume,issue,page,abstract,is-referenced-by-count${o.email ? `&mailto=${encodeURIComponent(o.email)}` : ''}`, o.email, 'json'));
  }
  const filter = o.yearFrom ? `&filter=from_publication_date:${o.yearFrom}-01-01` : '';
  return parseOpenAlex(await get(`https://api.openalex.org/works?search=${q}&per-page=${n}${filter}&select=id,doi,title,display_name,authorships,primary_location,publication_year,biblio,abstract_inverted_index,cited_by_count,open_access${o.email ? `&mailto=${encodeURIComponent(o.email)}` : ''}`, o.email, 'json'));
}

/** DOI 查验：Crossref 能查到 = 真实存在 */
export async function doiExists(doi: string, email: string): Promise<boolean> {
  try {
    await get(`https://api.crossref.org/works/${encodeURIComponent(normDoi(doi))}`, email, 'json');
    return true;
  } catch (error) {
    if (/404/.test((error as Error).message)) return false;
    throw error;
  }
}

export function sourceLabel(s: AwSource): string {
  return { pubmed: 'PubMed', europepmc: 'Europe PMC', arxiv: 'arXiv', crossref: 'Crossref', openalex: 'OpenAlex', web: i18nT('网页抓取') }[s];
}
