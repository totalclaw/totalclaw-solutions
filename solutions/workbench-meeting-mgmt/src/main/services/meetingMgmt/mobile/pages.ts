/**
 * 把文案、样式、脚本拼成三张直出页面：手机页（/、/m）、声纹采集页（/v）、链接失效页（401）。
 *
 * 页面是给手机浏览器（企微内置浏览器）的纯 HTML，不经过 App 的渲染层与 i18n；文案全部来自 text.ts。
 * 不引任何外部 CDN（局域网里手机未必能上外网），全部内联。
 */
import { MM_MOBILE_TEXT, mmText } from './text';
import { MM_MOBILE_CSS } from './styles';
import { MM_CLIENT_COMMON_JS } from './clientCommon';
import { MM_APP_JS } from './appScript';
import { MM_VOICE_JS } from './voiceScript';

const LS = String.fromCharCode(0x2028);
const PS = String.fromCharCode(0x2029);

/** 文案 JSON 嵌进 <script>：转义 `<`（防 `</script>` 提前闭合）与 JS 字符串里非法的行分隔符 */
export function scriptSafeJson(v: unknown): string {
  return JSON.stringify(v).replace(/</g, '\\u003c').split(LS).join('\\u2028').split(PS).join('\\u2029');
}

function escHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string);
}

function head(title: string): string {
  return '<!DOCTYPE html><html lang="zh-CN"><head><meta charset="utf-8">'
    + '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">'
    + '<meta name="format-detection" content="telephone=no"><meta name="referrer" content="no-referrer">'
    + `<title>${escHtml(title)}</title><style>${MM_MOBILE_CSS}</style></head>`;
}

/** 页面主体脚本：严格模式 IIFE，T = 文案对象，先放共用工具再放页面脚本 */
export function buildPageScript(pageJs: string): string {
  return `(function(){"use strict";var T=${scriptSafeJson(MM_MOBILE_TEXT)};${MM_CLIENT_COMMON_JS}\n${pageJs}\n})();`;
}

function shell(title: string, pageJs: string): string {
  return `${head(title)}<body><div id="app"></div><script>${buildPageScript(pageJs)}</script></body></html>`;
}

export const MEETING_MOBILE_APP_HTML = shell(mmText('appTitle'), MM_APP_JS);
export const MEETING_VOICE_PAGE_HTML = shell(mmText('voiceTitle'), MM_VOICE_JS);
const expiredBody = `<body><div id="app"><div class="expired"><div class="ic">!</div>`
  + `<h1>${escHtml(mmText('expired.title'))}</h1><p>${escHtml(mmText('expired.body'))}</p>`
  + `<p class="muted">${escHtml(mmText('expired.hint'))}</p></div></div>`;
/** 本机记住的令牌（群链接 /g 用它认人）：localStorage 键 */
export const MM_TOKEN_STORAGE_KEY = 'mm.token';
export const MEETING_MOBILE_EXPIRED_HTML = `${head(mmText('expired.title'))}${expiredBody}</body></html>`;
/** 令牌确实无效（401）时：顺手忘掉本机记着的令牌，免得群链接一直跳到失效页 */
export const MEETING_MOBILE_EXPIRED_CLEAR_HTML = `${head(mmText('expired.title'))}${expiredBody}`
  + `<script>try{localStorage.removeItem(${JSON.stringify(MM_TOKEN_STORAGE_KEY)})}catch(e){}</script></body></html>`;

/**
 * 群链接入口 /g（不带令牌，群里谁都能看到）：本机记着令牌 → 带上令牌跳到手机页（?p=v 跳声纹采集页），hash 原样带过去；
 * 没记着 → 提示先打开一次个人专属链接。
 */
export const MEETING_GROUP_ENTRY_HTML = `${head(mmText('group.title'))}<body><div id="app"><div class="expired">`
  + `<p id="g-open">${escHtml(mmText('group.opening'))}</p>`
  + `<div id="g-need" style="display:none"><div class="ic">i</div><h1>${escHtml(mmText('group.need'))}</h1><p class="muted">${escHtml(mmText('group.how'))}</p></div>`
  + `</div></div><script>(function(){var t='';try{t=localStorage.getItem(${JSON.stringify(MM_TOKEN_STORAGE_KEY)})||''}catch(e){}`
  + `var p='m';try{if(new URLSearchParams(location.search).get('p')==='v')p='v'}catch(e){}`
  + `if(t){location.replace(p+'?t='+encodeURIComponent(t)+location.hash);return}`
  + `document.getElementById('g-open').style.display='none';document.getElementById('g-need').style.display='block'})();</script></body></html>`;
