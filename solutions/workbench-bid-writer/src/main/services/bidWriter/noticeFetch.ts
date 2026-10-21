/**
 * 抓「目标投标网站」的公告页。
 *
 * 两个关键决定：
 *  1) **共用内置浏览器的登录态分区**（`persist:totalclaw-browser-<账号>`）。招标平台
 *     十有八九要登录才看得到完整公告与附件；用户在内置浏览器里登录一次，这里的隐藏窗口
 *     直接带着同一份 cookie 进去，不必让用户把账号密码交给我们保存。
 *  2) **只读**。只导航、只读 DOM，不点任何按钮、不填任何表单 —— 招标平台上误点一下
 *     可能就是一次报名或一份下载记录。
 *
 * 落地页仍是登录页时如实回 `loginRequired`，让 UI 引导用户去内置浏览器登录，
 * 而不是把登录页的文字当公告正文喂给模型（那会生成一份胡说八道的标书）。
 */
import { BrowserWindow, session } from 'electron';
import { t as i18nT } from '@totalclaw/i18n';
import { chromeCompatibleUserAgent, isTransientNavigationError, normalizeBrowserUrl } from '../embeddedBrowserTabs';
import { getActiveAccountKey } from '../accountScope';

export interface FetchedNotice {
  url: string;
  title: string;
  text: string;
  attachments: Array<{ name: string; url: string }>;
  loginRequired: boolean;
  warnings: string[];
}

const NAV_TIMEOUT_MS = 45_000;
const SETTLE_MS = 1_200;
const MAX_TEXT = 200_000;

/** 与 embeddedBrowserTabs 同一套 key 规范化，才能命中同一个分区 */
function safeKey(raw: string): string {
  return (raw || 'guest').toLowerCase().replace(/[^a-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 64) || 'guest';
}

export function browserPartition(): string {
  return `persist:totalclaw-browser-${safeKey(getActiveAccountKey() || 'guest')}`;
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

/** 页面里跑的读取脚本：只读 DOM，返回结构化 JSON 字符串 */
const READ_SCRIPT = `(() => {
  const drop = ['script','style','noscript','nav','header','footer','iframe'];
  const clone = document.body ? document.body.cloneNode(true) : null;
  if (clone) { drop.forEach((tag) => clone.querySelectorAll(tag).forEach((n) => n.remove())); }
  const raw = clone ? (clone.innerText || clone.textContent || '') : '';
  const text = raw.replace(/\\u00a0/g, ' ').replace(/[ \\t]+/g, ' ').replace(/\\n{3,}/g, '\\n\\n').trim();
  const seen = new Set();
  const attachments = [];
  document.querySelectorAll('a[href]').forEach((a) => {
    const href = a.href || '';
    const name = (a.textContent || '').replace(/\\s+/g, ' ').trim();
    if (!href || seen.has(href)) return;
    if (/\\.(pdf|docx?|xlsx?|zip|rar|7z)(\\?|$)/i.test(href) || /(招标文件|采购文件|附件|下载|公告正文)/.test(name)) {
      seen.add(href);
      attachments.push({ name: (name || href.split('/').pop() || '').slice(0, 120), url: href });
    }
  });
  const pwd = document.querySelectorAll('input[type=password]').length > 0;
  const loginWords = /(登录|登陆|請登入|Sign in|Log in|账号登录)/.test(document.title || '');
  return JSON.stringify({
    title: (document.title || '').slice(0, 200),
    url: location.href,
    text: text.slice(0, ${MAX_TEXT}),
    attachments: attachments.slice(0, 40),
    loginish: pwd || loginWords,
  });
})()`;

/**
 * 抓一页。失败一律返回可读中文原因，不抛。
 */
export async function fetchNoticePage(rawUrl: string): Promise<FetchedNotice> {
  const input = String(rawUrl || '').trim();
  // normalizeBrowserUrl 会把「不像网址」的输入变成百度搜索页 —— 那不是用户要抓的公告，
  // 与其抓回一页搜索结果喂给模型，不如在这里拦住并说清楚。
  if (!/^https?:\/\//i.test(input) && !/^[^\s]+\.[^\s]{2,}/.test(input)) {
    throw new Error(i18nT('请填写招标公告的网址（以 http(s) 开头）'));
  }
  const url = normalizeBrowserUrl(input);
  if (!/^https?:\/\//i.test(url)) throw new Error(i18nT('请填写招标公告的网址（以 http(s) 开头）'));

  const partition = browserPartition();
  // 分区可能还没被内置浏览器建过（用户从没开过浏览器）：fromPartition 会按需创建，
  // 这条只是确保 UA 一致，免得站点按 Electron UA 给降级页面。
  try { session.fromPartition(partition).setUserAgent(chromeCompatibleUserAgent()); } catch { /* 忽略 */ }

  const win = new BrowserWindow({
    show: false,
    webPreferences: {
      partition,
      sandbox: true,
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: true,
      javascript: true,
    },
  });
  const warnings: string[] = [];
  try {
    win.webContents.setUserAgent(chromeCompatibleUserAgent());
    // 只读：拦掉新窗口 / 下载触发的弹窗
    win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
    try {
      await Promise.race([
        win.webContents.loadURL(url),
        sleep(NAV_TIMEOUT_MS).then(() => { throw new Error(i18nT('页面加载超时（45 秒）')); }),
      ]);
    } catch (e: any) {
      // 站点常在 load 事件后再跳转 / 取消导航 —— 只要最终读到正文就算成功，这里只记一条提示
      if (!isTransientNavigationError(e) && !/ERR_ABORTED/i.test(String(e?.message || e))) throw e;
      warnings.push(i18nT('页面加载过程中发生跳转，已按最终落地页读取。'));
    }
    await sleep(SETTLE_MS);
    const raw = await win.webContents.executeJavaScript(READ_SCRIPT, true);
    const parsed = JSON.parse(String(raw || '{}')) as {
      title?: string; url?: string; text?: string; loginish?: boolean;
      attachments?: Array<{ name: string; url: string }>;
    };
    const text = String(parsed.text || '').trim();
    const loginRequired = Boolean(parsed.loginish) && text.replace(/\s/g, '').length < 800;
    if (!text) warnings.push(i18nT('这个页面没读到文字，可能是图片版公告或需要登录。'));
    else if (text.replace(/\s/g, '').length < 200) warnings.push(i18nT('正文很短（不足 200 字），请确认抓的是公告详情页而不是列表页。'));
    return {
      url: String(parsed.url || url),
      title: String(parsed.title || ''),
      text,
      attachments: Array.isArray(parsed.attachments) ? parsed.attachments : [],
      loginRequired,
      warnings,
    };
  } finally {
    try { if (!win.isDestroyed()) win.destroy(); } catch { /* 忽略 */ }
  }
}
