/**
 * 手机页 / 声纹采集页共用的浏览器脚本（原生 JS，无框架、无外部依赖）。
 *
 * 由 pages.ts 拼进页面：`(function(){ "use strict"; var T = <text.ts 的文案>; <本文件> <页面脚本> })()`。
 * 用 String.raw 原样输出，所以：不能出现反引号和 `${`；反斜杠按 JS 源码原样写；不写中文（文案一律 tx()）。
 *
 * 提供：令牌（URL 的 ?t=）、tx 文案、esc 转义、时间 / 大小格式化、api（/api/invoke）、uploadFile（/api/upload，
 * XHR 带进度）、toast、底部弹层 openSheet / confirmBox / formSheet、令牌失效页 showExpired、轻量 Markdown 渲染。
 */
export const MM_CLIENT_COMMON_JS = String.raw`
var TOKEN = '';
try { TOKEN = new URLSearchParams(location.search).get('t') || ''; } catch (e) { TOKEN = ''; }
// remember the token: group links (/g, no token) use it to recognize the person
if (TOKEN) { try { localStorage.setItem('mm.token', TOKEN); } catch (e) { /* private mode */ } }
var META = { maxUploadBytes: 2147483648, httpsBase: '' };
var EXPIRED = false;

function tx(key, vars) {
  var parts = String(key).split('.');
  var v = T;
  for (var i = 0; i < parts.length; i++) v = (v && typeof v === 'object') ? v[parts[i]] : undefined;
  if (typeof v !== 'string') return String(key);
  if (vars) v = v.replace(/\{(\w+)\}/g, function (m, k) { return vars[k] == null ? '' : String(vars[k]); });
  return v;
}
function lbl(group, key) {
  var g = T[group];
  return g && typeof g[key] === 'string' ? g[key] : String(key == null ? '' : key);
}
function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
    return c === '&' ? '&amp;' : c === '<' ? '&lt;' : c === '>' ? '&gt;' : c === '"' ? '&quot;' : '&#39;';
  });
}
function pad(n) { return n < 10 ? '0' + n : String(n); }
function fmtSize(n) {
  n = Number(n);
  if (!(n >= 0)) return '-';
  var u = ['B', 'KB', 'MB', 'GB', 'TB'];
  var i = 0;
  while (n >= 1024 && i < u.length - 1) { n = n / 1024; i++; }
  return (i ? n.toFixed(n >= 100 ? 0 : 1) : String(Math.round(n))) + ' ' + u[i];
}
function fmtDate(ms) {
  if (!ms) return '-';
  var d = new Date(ms);
  return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
}
function fmtDT(ms) {
  if (!ms) return '-';
  var d = new Date(ms);
  var hm = pad(d.getHours()) + ':' + pad(d.getMinutes());
  var md = pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  return (d.getFullYear() === new Date().getFullYear() ? md : d.getFullYear() + '-' + md) + ' ' + hm;
}
function fmtAgo(ms) {
  if (!ms) return '';
  var now = Date.now();
  var diff = now - ms;
  if (diff < 60000) return tx('time.justNow');
  if (diff < 3600000) return tx('time.minutesAgo', { n: Math.floor(diff / 60000) });
  var d = new Date(ms);
  var hm = pad(d.getHours()) + ':' + pad(d.getMinutes());
  if (d.toDateString() === new Date(now).toDateString()) return tx('time.today', { t: hm });
  if (d.toDateString() === new Date(now - 86400000).toDateString()) return tx('time.yesterday', { t: hm });
  return fmtDT(ms);
}
function fmtDue(s) { return s && /^\d{4}-\d{2}-\d{2}$/.test(s) ? s.slice(5) : (s || '-'); }
function weekdayOf(s) {
  if (!s || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return '';
  var p = s.split('-');
  var d = new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]));
  var names = tx('time.weekdays').split(',');
  return names[d.getDay()] || '';
}
function fmtClock(sec) {
  var s = Math.max(0, Math.floor(Number(sec) || 0));
  var h = Math.floor(s / 3600);
  var m = Math.floor((s % 3600) / 60);
  var r = s % 60;
  return h ? h + ':' + pad(m) + ':' + pad(r) : pad(m) + ':' + pad(r);
}
function todayStr() { return fmtDate(Date.now()); }
var AV_COLORS = ['#e05a8a', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444', '#0ea5a4', '#16a34a', '#6366f1', '#d97706', '#0284c7'];
function avatar(name, cls) {
  var n = String(name || '?');
  var h = 0;
  for (var i = 0; i < n.length; i++) h = (h * 31 + n.charCodeAt(i)) >>> 0;
  return '<span class="av ' + (cls || '') + '" style="background:' + AV_COLORS[h % AV_COLORS.length] + '">' + esc(n.slice(0, 1)) + '</span>';
}

function expiredHtml() {
  return '<div class="expired"><div class="ic">!</div><h1>' + esc(tx('expired.title')) + '</h1><p>' + esc(tx('expired.body')) +
    '</p><p class="muted">' + esc(tx('expired.hint')) + '</p></div>';
}
function showExpired() {
  if (EXPIRED) return;
  EXPIRED = true;
  try { if (localStorage.getItem('mm.token') === TOKEN) localStorage.removeItem('mm.token'); } catch (e) { /* ignore */ }
  var masks = document.querySelectorAll('.mask');
  for (var i = 0; i < masks.length; i++) masks[i].remove();
  var app = document.getElementById('app');
  if (app) app.innerHTML = expiredHtml();
}

function errText(code, status, extra) {
  var c = String(code || '');
  if (c === 'UNAUTHORIZED') return tx('expired.body');
  if (c === 'TOO_MANY') return tx('common.tooMany');
  if (c === 'FORBIDDEN_ACTION') return tx('common.forbiddenAction');
  if (c === 'BAD_PATH') return tx('common.badPath');
  if (c === 'BAD_REQUEST') return tx('common.badRequest');
  if (c === 'NOT_FOUND') return tx('common.notFound');
  if (c === 'TOO_LARGE') return tx('common.tooLarge', { max: fmtSize(extra && extra.max || META.maxUploadBytes) });
  if (c === 'EMPTY') return tx('common.emptyFile');
  if (c === 'WRITE_FAILED') return tx('common.writeFailed');
  if (c === 'INTERNAL' || (!c && status >= 500)) return tx('common.serverError');
  return c || tx('common.serverError');
}

async function api(action, payload) {
  var r;
  try {
    r = await fetch('api/invoke', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + TOKEN },
      body: JSON.stringify({ action: action, payload: payload == null ? {} : payload }),
      cache: 'no-store',
    });
  } catch (e) {
    throw new Error(tx('common.networkError'));
  }
  var j = null;
  try { j = await r.json(); } catch (e) { j = null; }
  if (r.status === 401) { showExpired(); throw new Error(tx('expired.body')); }
  if (r.status === 429) throw new Error(tx('common.tooMany'));
  if (!r.ok || !j || j.ok !== true) throw new Error(errText(j && j.error, r.status, j));
  return j.data;
}

async function loadMeta() {
  try {
    var r = await fetch('api/meta', { cache: 'no-store' });
    var j = await r.json();
    if (j && j.maxUploadBytes > 0) META.maxUploadBytes = j.maxUploadBytes;
    if (j && typeof j.httpsBase === 'string') META.httpsBase = j.httpsBase;
  } catch (e) { /* keep defaults */ }
}

function uploadFile(file, onProgress) {
  return new Promise(function (resolve, reject) {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', 'api/upload?name=' + encodeURIComponent(file.name || 'upload.bin'));
    xhr.setRequestHeader('Authorization', 'Bearer ' + TOKEN);
    xhr.setRequestHeader('Content-Type', 'application/octet-stream');
    if (xhr.upload && onProgress) {
      xhr.upload.onprogress = function (e) { if (e.lengthComputable) onProgress(e.loaded, e.total); };
    }
    xhr.onload = function () {
      var j = null;
      try { j = JSON.parse(xhr.responseText); } catch (e) { j = null; }
      if (xhr.status === 401) { showExpired(); reject(new Error(tx('expired.body'))); return; }
      if (xhr.status >= 200 && xhr.status < 300 && j && j.ok) { resolve(j.data); return; }
      reject(new Error(errText(j && j.error, xhr.status, j)));
    };
    xhr.onerror = function () { reject(new Error(tx('common.networkError'))); };
    xhr.send(file);
  });
}

function toast(msg, kind) {
  var el = document.createElement('div');
  el.className = 'toast' + (kind ? ' ' + kind : '');
  el.textContent = String(msg == null ? '' : msg);
  document.body.appendChild(el);
  setTimeout(function () { el.classList.add('show'); }, 10);
  setTimeout(function () {
    el.classList.remove('show');
    setTimeout(function () { el.remove(); }, 260);
  }, kind === 'err' ? 3600 : 2400);
}

/**
 * o: { title, body (html), full, actions: [{ text, cls, value, onClick(ctx) }], onMount(sheetEl, ctx) }
 * onClick(ctx) closes the sheet itself with ctx.close(v); thrown errors are shown inside the sheet.
 * Resolves with the value passed to close (null when dismissed).
 */
function openSheet(o) {
  return new Promise(function (resolve) {
    var mask = document.createElement('div');
    mask.className = 'mask';
    var acts = o.actions || [];
    var foot = acts.length ? '<div class="sheet-f">' + acts.map(function (a, i) {
      return '<button type="button" class="btn ' + (a.cls || '') + '" data-i="' + i + '">' + esc(a.text) + '</button>';
    }).join('') + '</div>' : '';
    mask.innerHTML = '<div class="sheet' + (o.full ? ' full' : '') + '"><div class="sheet-h"><span>' + esc(o.title || '') +
      '</span><button type="button" data-x="1" aria-label="close">&times;</button></div><div class="sheet-b">' + (o.body || '') +
      '<div class="sheet-err"></div></div>' + foot + '</div>';
    document.body.appendChild(mask);
    var sheet = mask.firstChild;
    var closed = false;
    var ctx = {
      el: sheet,
      close: function (v) {
        if (closed) return;
        closed = true;
        mask.classList.remove('show');
        setTimeout(function () { mask.remove(); }, 200);
        resolve(v === undefined ? null : v);
      },
      setError: function (msg) { var e = sheet.querySelector('.sheet-err'); if (e) e.textContent = msg || ''; },
      button: function (i) { return sheet.querySelector('.sheet-f [data-i="' + i + '"]'); },
    };
    mask.addEventListener('click', async function (ev) {
      if (ev.target === mask || (ev.target.closest && ev.target.closest('[data-x]'))) { ctx.close(null); return; }
      var b = ev.target.closest ? ev.target.closest('.sheet-f [data-i]') : null;
      if (!b) return;
      var a = acts[Number(b.getAttribute('data-i'))];
      if (!a) return;
      if (!a.onClick) { ctx.close(a.value === undefined ? null : a.value); return; }
      var btns = sheet.querySelectorAll('.sheet-f .btn');
      for (var i = 0; i < btns.length; i++) btns[i].disabled = true;
      b.setAttribute('aria-busy', 'true');
      ctx.setError('');
      try { await a.onClick(ctx); } catch (e) { ctx.setError(e && e.message ? e.message : String(e)); }
      if (!closed) {
        for (var k = 0; k < btns.length; k++) btns[k].disabled = false;
        b.removeAttribute('aria-busy');
      }
    });
    if (o.onMount) { try { o.onMount(sheet, ctx); } catch (e) { /* ignore */ } }
    setTimeout(function () { mask.classList.add('show'); }, 10);
  });
}
function confirmBox(msg, okText, danger) {
  return openSheet({
    title: '',
    body: '<div class="sheet-msg">' + esc(msg) + '</div>',
    actions: [
      { text: tx('common.cancel'), cls: 'ghost', value: false },
      { text: okText || tx('common.ok'), cls: danger ? 'danger' : 'pri', value: true },
    ],
  }).then(function (v) { return v === true; });
}
/** submit(sheetEl) does the work; throw Error(msg) to keep the sheet open and show the message. */
function formSheet(o) {
  return openSheet({
    title: o.title,
    body: o.body,
    full: o.full,
    onMount: o.onMount,
    actions: [
      { text: tx('common.cancel'), cls: 'ghost', value: null },
      { text: o.okText || tx('common.submit'), cls: o.danger ? 'danger' : 'pri', onClick: async function (ctx) {
        var r = await o.submit(ctx.el);
        ctx.close(r === undefined ? true : r);
      } },
    ],
  });
}
function need(v, field) {
  if (!String(v == null ? '' : v).trim()) throw new Error(tx('common.required', { field: field }));
  return String(v).trim();
}
function val(root, sel) { var e = root.querySelector(sel); return e ? e.value : ''; }

function mdInline(s) {
  return esc(s).replace(/\x60/g, '').replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>').replace(/__([^_]+)__/g, '<b>$1</b>');
}
function mdTable(rows) {
  var cells = function (r) { return r.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map(function (c) { return c.trim(); }); };
  var body = rows.filter(function (r) { return !/^\s*\|?\s*:?-{2,}/.test(r); });
  if (!body.length) return '';
  var head = cells(body[0]);
  var html = '<table><thead><tr>' + head.map(function (c) { return '<th>' + mdInline(c) + '</th>'; }).join('') + '</tr></thead><tbody>';
  for (var i = 1; i < body.length; i++) {
    html += '<tr>' + cells(body[i]).map(function (c) { return '<td>' + mdInline(c) + '</td>'; }).join('') + '</tr>';
  }
  return html + '</tbody></table>';
}
function md(src) {
  var lines = String(src || '').replace(/\r/g, '').split('\n');
  var out = [];
  var para = [];
  var flush = function () { if (para.length) { out.push('<p>' + mdInline(para.join(' ')) + '</p>'); para = []; } };
  var i = 0;
  while (i < lines.length) {
    var l = lines[i];
    var hm = /^(#{1,4})\s+(.*)$/.exec(l);
    if (hm) { flush(); var lv = hm[1].length; out.push('<h' + lv + '>' + mdInline(hm[2]) + '</h' + lv + '>'); i++; continue; }
    if (/^\s*[-*+]\s+/.test(l)) {
      flush();
      var ul = [];
      while (i < lines.length && /^\s*[-*+]\s+/.test(lines[i])) { ul.push('<li>' + mdInline(lines[i].replace(/^\s*[-*+]\s+/, '')) + '</li>'); i++; }
      out.push('<ul>' + ul.join('') + '</ul>');
      continue;
    }
    if (/^\s*\d+[.)]\s+/.test(l)) {
      flush();
      var ol = [];
      while (i < lines.length && /^\s*\d+[.)]\s+/.test(lines[i])) { ol.push('<li>' + mdInline(lines[i].replace(/^\s*\d+[.)]\s+/, '')) + '</li>'); i++; }
      out.push('<ol>' + ol.join('') + '</ol>');
      continue;
    }
    if (/^\s*\|.*\|\s*$/.test(l)) {
      flush();
      var rows = [];
      while (i < lines.length && /^\s*\|.*\|\s*$/.test(lines[i])) { rows.push(lines[i]); i++; }
      out.push(mdTable(rows));
      continue;
    }
    if (!l.trim()) { flush(); i++; continue; }
    para.push(l.trim());
    i++;
  }
  flush();
  return out.join('');
}
/** Split markdown into editable blocks: by headings when there are any, otherwise by blank-line paragraphs. */
function splitBlocks(src) {
  var text = String(src || '').replace(/\r/g, '').trim();
  if (!text) return [];
  var lines = text.split('\n');
  var hasHeading = lines.some(function (l) { return /^#{1,4}\s+/.test(l); });
  if (!hasHeading) return text.split(/\n\s*\n/).map(function (b) { return b.trim(); }).filter(Boolean);
  var blocks = [];
  var cur = [];
  lines.forEach(function (l) {
    if (/^#{1,4}\s+/.test(l) && cur.join('').trim()) { blocks.push(cur.join('\n').trim()); cur = []; }
    cur.push(l);
  });
  if (cur.join('').trim()) blocks.push(cur.join('\n').trim());
  return blocks;
}
function joinBlocks(blocks) { return blocks.map(function (b) { return String(b).trim(); }).filter(Boolean).join('\n\n') + '\n'; }
`;
