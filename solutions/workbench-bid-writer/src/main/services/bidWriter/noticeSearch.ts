/**
 * 「按目标检索招标公告」——从项目目标出发找到**公告详情页**的网址。
 *
 * 用户手上常常只有一个平台首页（截图里就是 zcygov.cn 首页），抓回来的是一堆导航文字。
 * 这里先替他找到具体那一条公告。
 *
 * 两条通道，能用哪条用哪条：
 *   ① qiye-api `/v1/search`（duckduckgo 等 backend，与 AI 工具箱同一条链路）；
 *   ② 它没起来时，用隐藏窗口打一次 Bing 搜索页读结果链接（与抓公告共用浏览器登录态分区）。
 * 两条都没有结果就如实说「没搜到」，不编网址。
 *
 * 结果一律过滤：像栏目页 / 首页的丢掉（looksLikeListingUrl），标题不像公告的丢掉，
 * 命中招标平台域名的加分 —— 但**不限定只能是白名单里的平台**，各省市平台太多。
 */
import { BrowserWindow, session } from 'electron';
import { t as i18nT } from '@totalclaw/i18n';
import { chromeCompatibleUserAgent } from '../embeddedBrowserTabs';
import { browserPartition } from './noticeFetch';
import { contentTokens } from '../knowledgeBase/textAnalysis';
import {
  QUERY_STOPWORDS, TENDER_PLATFORMS, TENDER_QUERY_SUFFIXES, TENDER_TITLE_RE, looksLikeListingUrl,
} from './matchPatterns';

export interface NoticeHit {
  title: string;
  url: string;
  snippet?: string;
  /** 平台名（认得出来的）或域名 */
  source: string;
  publishedAt?: string;
  score: number;
}

const MAX_RESULTS = 12;
const NAV_TIMEOUT_MS = 30_000;

/**
 * 项目信息 → 检索关键词（用户没自己填时）。
 *
 * 招标检索最有效的其实是**项目名原样**：公告标题里几乎一定含它。
 * 所以优先用项目名（去掉「…建设项目/采购项目/工程」这类到处都一样的尾巴），
 * 名字太短才退回分词取词 —— 分词会把「智慧园区」切成「智慧」「园区」，
 * 拆开搜反而命中一堆不相干的东西。分词用知识库那套（Intl.Segmenter），不自己写正则贪婪切。
 */
export function deriveKeywords(projectName: string, goal: string, strategies: string[]): string {
  const name = String(projectName || '')
    .replace(/(公开)?(招标|采购|询价|竞争性磋商)?(建设)?(项目|工程)\s*$/g, '')
    .trim();
  if (name.length >= 4) return name;
  const words = contentTokens(`${name} ${goal}`)
    .filter((w) => w.length >= 2 && !QUERY_STOPWORDS.has(w))
    .filter((w, i, arr) => arr.indexOf(w) === i)
    .slice(0, 5);
  if (words.length) return words.join(' ');
  return strategies.slice(0, 2).join(' ');
}

function hostOf(url: string): string {
  try { return new URL(url).hostname; } catch { return ''; }
}

function platformName(url: string): string {
  const host = hostOf(url);
  const hit = TENDER_PLATFORMS.find((p) => host.includes(p.host));
  return hit ? hit.name : host;
}

/** 过滤 + 打分：像公告详情页的留下，首页 / 栏目页丢掉 */
export function rankHits(
  raw: Array<{ title?: string; url?: string; snippet?: string; publishedAt?: string }>,
  keywords: string,
): NoticeHit[] {
  const terms = keywords.split(/\s+/).filter((t) => t.length >= 2);
  const seen = new Set<string>();
  const out: NoticeHit[] = [];
  for (const item of raw) {
    const url = String(item?.url || '').trim();
    const title = String(item?.title || '').replace(/\s+/g, ' ').trim();
    if (!/^https?:\/\//i.test(url) || !title) continue;
    const host = hostOf(url);
    if (!host || seen.has(url)) continue;
    if (looksLikeListingUrl(url)) continue;
    const isTenderTitle = TENDER_TITLE_RE.test(title);
    const onPlatform = TENDER_PLATFORMS.some((p) => host.includes(p.host));
    // 标题不像公告、又不在已知平台上 —— 多半是新闻或软文，丢掉
    if (!isTenderTitle && !onPlatform) continue;
    seen.add(url);
    const hits = terms.filter((t) => title.includes(t) || String(item?.snippet || '').includes(t)).length;
    out.push({
      title,
      url,
      snippet: String(item?.snippet || '').replace(/\s+/g, ' ').slice(0, 200) || undefined,
      source: platformName(url),
      publishedAt: item?.publishedAt ? String(item.publishedAt).slice(0, 10) : undefined,
      score: hits * 2 + (isTenderTitle ? 2 : 0) + (onPlatform ? 3 : 0),
    });
  }
  return out.sort((a, b) => b.score - a.score).slice(0, MAX_RESULTS);
}

/** 拼检索式：关键词 × 公告词，平台不限定（限定反而漏掉省市平台） */
export function buildQueries(keywords: string): string[] {
  const kw = keywords.trim();
  if (!kw) return [];
  return TENDER_QUERY_SUFFIXES.map((suffix) => `${kw} ${suffix}`);
}

/** 通道①：qiye-api /v1/search */
export async function searchViaQiyeApi(
  proc: any, queries: string[], perQuery = 10,
): Promise<Array<{ title?: string; url?: string; snippet?: string; publishedAt?: string }>> {
  if (!proc || proc.getStatus?.() !== 'ready') return [];
  const { QiyeApiClient } = await import('../qiyeApiClient');
  const client = new QiyeApiClient({
    baseUrl: proc.getBaseUrl(),
    getBearerToken: () => proc.getBearerToken(),
    defaultTimeoutMs: 60_000,
  });
  const out: Array<{ title?: string; url?: string; snippet?: string; publishedAt?: string }> = [];
  for (const query of queries) {
    try {
      const r: any = await client.post('/v1/search', {
        backend: 'duckduckgo', query, k: perQuery, language: 'zh', country: 'cn',
      }, 60_000);
      const list = Array.isArray(r?.results) ? r.results : Array.isArray(r) ? r : [];
      out.push(...list);
    } catch { /* 换下一个检索式 */ }
  }
  return out;
}

/** 页面里跑的读取脚本：只读搜索结果页的链接与标题 */
const READ_RESULTS = `(() => {
  const out = [];
  const seen = new Set();
  document.querySelectorAll('li.b_algo, .b_algo, #b_results > li').forEach((li) => {
    const a = li.querySelector('h2 a, a[href^="http"]');
    if (!a) return;
    const href = a.href || '';
    if (!href || seen.has(href)) return;
    seen.add(href);
    const p = li.querySelector('p, .b_caption p');
    out.push({ title: (a.textContent || '').trim(), url: href, snippet: (p ? p.textContent : '').trim() });
  });
  return JSON.stringify(out.slice(0, 20));
})()`;

/** 通道②：隐藏窗口打搜索页读结果（qiye-api 没起来时兜底） */
export async function searchViaBrowser(
  queries: string[],
): Promise<Array<{ title?: string; url?: string; snippet?: string }>> {
  const partition = browserPartition();
  try { session.fromPartition(partition).setUserAgent(chromeCompatibleUserAgent()); } catch { /* 忽略 */ }
  const win = new BrowserWindow({
    show: false,
    webPreferences: { partition, sandbox: true, contextIsolation: true, nodeIntegration: false, javascript: true },
  });
  const out: Array<{ title?: string; url?: string; snippet?: string }> = [];
  try {
    win.webContents.setUserAgent(chromeCompatibleUserAgent());
    win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
    for (const query of queries.slice(0, 2)) {
      try {
        await Promise.race([
          win.webContents.loadURL(`https://cn.bing.com/search?q=${encodeURIComponent(query)}&setlang=zh-CN`),
          new Promise((_r, reject) => setTimeout(() => reject(new Error(i18nT('搜索页加载超时'))), NAV_TIMEOUT_MS)),
        ]);
        await new Promise((r) => setTimeout(r, 900));
        const raw = await win.webContents.executeJavaScript(READ_RESULTS, true);
        out.push(...(JSON.parse(String(raw || '[]')) as typeof out));
      } catch { /* 换下一个检索式 */ }
    }
  } finally {
    try { if (!win.isDestroyed()) win.destroy(); } catch { /* 忽略 */ }
  }
  return out;
}
