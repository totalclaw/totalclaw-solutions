/**
 * 会议智能管理 · 手机页（H5，企微里打开）的页面脚本。单页应用，hash 路由，原生 JS。
 *
 * 路由（企微卡片直达，与 server.ts 的 mobileHashFor 一一对应）：
 *   #/home  #/meetings  #/tasks  #/projects  #/me  #/notices
 *   #/meeting/<id>[?anchor=<segmentId>]   纪要页：上传 / 处理进度 / 指认（可试听）/ 本人发言核对确认 / 终审（逐段改、退回、通过、选生成任务）/ 指定任务负责人
 *   #/plan/<meetingId>                     执行方案：任务负责人逐项编辑、设完成时间、增删、确认下发
 *   #/task/<id>                            任务：接收 / 异议 / 更新进度 / 标记完成 / 申请变更 / 复核 / 回应 / 裁决
 *   #/project/<id>  #/summary/<projectId>  #/report/<projectId>/<reportId>
 *   #/new-meeting[?project=<id>]  #/new-project  #/voice（跳声纹采集页 /v）
 *
 * 数据全部经 /api/invoke 调文档 3.2 的统一动作，按返回里的 can / my 显示按钮；权限最终由主进程校验。
 * 底部导航「首页、会议、任务、项目、我的」只在一级页显示；详情页顶部有返回。
 *
 * 用 String.raw 原样输出：不能出现反引号和 `${`；不写中文（文案在 text.ts，用 tx() 取）。
 */
export const MM_APP_JS = String.raw`
var APP = document.getElementById('app');
var BOOT = null;
var PEOPLE = null;
var ROUTE_SEQ = 0;
var ACTS = {};
var TIMERS = [];
var STACK = [];
var REPLACING = false;
var UPLOADING = false;
var DIRTY = false;
var PLAYER = null;
var PLAYING = '';
var CLIPS = {};
// Repaint the play buttons in place (no full reload, so the scroll position and open editors stay).
function markPlaying() {
  var list = document.querySelectorAll('.segplay');
  for (var i = 0; i < list.length; i++) {
    var b = list[i];
    var on = b.getAttribute('data-id') === PLAYING;
    b.classList.toggle('on', on);
    var label = b.textContent.replace(/^\S+\s/, '');
    b.innerHTML = (on ? '&#10074;&#10074; ' : '&#9654; ') + esc(label);
  }
}
var HIDDEN_AT = 0;
var PAGES = {};
var ROOTS = { home: 1, meetings: 1, tasks: 1, projects: 1, me: 1 };
var TAB_OF = { home: 'home', notices: 'home', meetings: 'meetings', meeting: 'meetings', plan: 'meetings', 'new-meeting': 'meetings',
  tasks: 'tasks', task: 'tasks', projects: 'projects', project: 'projects', summary: 'projects', report: 'projects', 'new-project': 'projects', me: 'me' };
var UI = { homeGroup: 'all', meetFilter: 'all', meetQ: '', taskView: 'received', taskStatus: '', taskQ: '', projStatus: 'active', projQ: '', segFilter: {} };
var DRAFT = { plan: {}, newMeeting: null, newProject: null, upload: {} };

var ICONS = {
  home: '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/>',
  meetings: '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/><path d="M8.5 11h7M8.5 14h4"/>',
  tasks: '<path d="M10 6h10M10 12h10M10 18h10M4 6l1.2 1.2L7.5 5M4 12l1.2 1.2L7.5 11M4 18l1.2 1.2L7.5 17"/>',
  projects: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  me: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/>',
  bell: '<path d="M6 16v-5a6 6 0 1 1 12 0v5l2 2H4zM10 21h4"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
};
function icon(name) {
  return '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + (ICONS[name] || '') + '</svg>';
}

// ---------- helpers ----------
function myId() { return BOOT && BOOT.me && BOOT.me.person ? BOOT.me.person.id : ''; }
function myName() { return BOOT && BOOT.me && BOOT.me.person ? BOOT.me.person.name : ''; }
function later(fn, ms) { var h = setTimeout(fn, ms); TIMERS.push(h); return h; }
function clearTimers() { TIMERS.forEach(function (h) { clearTimeout(h); }); TIMERS = []; }
function stale(seq) { return seq !== ROUTE_SEQ || EXPIRED; }
function enc(s) { return encodeURIComponent(String(s == null ? '' : s)); }
function render(html) { APP.innerHTML = html; }
async function loadBoot(force) { if (!BOOT || force) BOOT = await api('boot'); return BOOT; }
async function people() { if (!PEOPLE) PEOPLE = await api('people.list'); return PEOPLE; }
function personOf(id) {
  if (!PEOPLE) return null;
  for (var i = 0; i < PEOPLE.people.length; i++) if (PEOPLE.people[i].id === id) return PEOPLE.people[i];
  return null;
}
function deptNameOf(id) {
  if (!PEOPLE) return '';
  for (var i = 0; i < PEOPLE.depts.length; i++) if (PEOPLE.depts[i].id === id) return PEOPLE.depts[i].name;
  return '';
}
function nm(names, id) {
  if (!id) return '';
  if (names && names[id] && names[id].name) return names[id].name;
  var p = personOf(id);
  return p ? p.name : tx('common.unknownPerson');
}
function linkHash(link) {
  if (!link) return '#/home';
  var id = enc(link.id);
  switch (link.kind) {
    case 'meeting': return '#/meeting/' + id + (link.anchor ? '?anchor=' + enc(link.anchor) : '');
    case 'meeting_plan': return '#/plan/' + id;
    case 'task': return '#/task/' + id;
    case 'project': return '#/project/' + id;
    case 'project_summary': return '#/summary/' + id;
    case 'report': return '#/report/' + id + (link.anchor ? '/' + enc(link.anchor) : '');
    default: return '#/home';
  }
}
function parseHash() {
  var h = String(location.hash || '').replace(/^#\/?/, '');
  var qi = h.indexOf('?');
  var path = qi >= 0 ? h.slice(0, qi) : h;
  var qs;
  try { qs = new URLSearchParams(qi >= 0 ? h.slice(qi + 1) : ''); } catch (e) { qs = new URLSearchParams(''); }
  var parts = path.split('/').filter(Boolean).map(function (s) { try { return decodeURIComponent(s); } catch (e) { return s; } });
  return { parts: parts, qs: qs };
}
function go(hash) { if (location.hash === hash) route(true); else location.hash = hash; }
function replaceHash(hash) { REPLACING = true; location.replace(hash); }
function goBack() {
  if (STACK.length > 1) { history.back(); return; }
  var r = parseHash();
  replaceHash('#/' + (TAB_OF[r.parts[0]] || 'home'));
}
function topBar(title, o) {
  o = o || {};
  var left = o.back ? '<button class="side" data-act="back" aria-label="' + esc(tx('common.back')) + '">&#8249;</button>' : '<span class="side"></span>';
  return '<header class="top">' + left + '<h1>' + esc(title) + '</h1>' + (o.right || '<span class="side"></span>') + '</header>';
}
function tabBar(active) {
  var b = (BOOT && BOOT.badges) || {};
  var tabs = [['home', b.home], ['meetings', b.meetings], ['tasks', b.tasks], ['projects', 0], ['me', 0]];
  return '<nav class="tabs"><div class="tabs-in">' + tabs.map(function (t) {
    var n = Number(t[1]) || 0;
    return '<a href="#/' + t[0] + '" class="' + (active === t[0] ? 'on' : '') + '">' + icon(t[0]) + '<span>' + esc(tx('nav.' + t[0])) + '</span>' +
      (n ? '<i class="badge">' + (n > 99 ? '99+' : n) + '</i>' : '') + '</a>';
  }).join('') + '</div></nav>';
}
function bottomBar(btns, note) {
  if (!btns) return '';
  return '<div class="bar">' + (note ? '<div class="bar-note">' + esc(note) + '</div>' : '') + '<div class="bar-in">' + btns + '</div></div>';
}
function btn(act, text, cls, attrs) {
  return '<button type="button" class="btn ' + (cls || '') + '" data-act="' + act + '"' + (attrs || '') + '>' + esc(text) + '</button>';
}
function tag(text, cls) { return '<span class="tag ' + (cls || '') + '">' + esc(text) + '</span>'; }
function prog(pct, bad) {
  var p = Math.max(0, Math.min(100, Number(pct) || 0));
  return '<div class="prog' + (bad ? ' bad' : '') + '"><i style="width:' + p + '%"></i></div>';
}
function emptyBlock(text) { return '<div class="empty">' + esc(text || tx('common.empty')) + '</div>'; }
function meetingTag(st) {
  var cls = st === 'failed' ? 'bad' : (st === 'dispatched' || st === 'ended' || st === 'finalized') ? 'good' : st === 'processing' ? 'gray' : '';
  return tag(lbl('meetingStatus', st), cls);
}
function taskTag(t) {
  if (t.objection && t.objection.stage && t.objection.stage !== 'resolved') return tag(lbl('objectionStage', t.objection.stage), 'warn');
  var cls = t.status === 'done' ? 'good' : t.status === 'cancelled' ? 'gray' : t.status === 'to_accept' ? '' : 'gray';
  return tag(lbl('taskStatus', t.status), cls);
}
function projectTag(st) { return tag(lbl('projectStatus', st), st === 'archived' ? 'gray' : st === 'closing' ? 'warn' : 'good'); }
function hello() {
  var h = new Date().getHours();
  return tx(h < 11 ? 'time.morning' : h < 13 ? 'time.noon' : h < 18 ? 'time.afternoon' : 'time.evening');
}
async function run(el, fn) {
  if (el) { el.disabled = true; el.setAttribute('aria-busy', 'true'); }
  try { return await fn(); }
  catch (e) { if (!EXPIRED) toast(e && e.message ? e.message : String(e), 'err'); return undefined; }
  finally { if (el && el.isConnected) { el.disabled = false; el.removeAttribute('aria-busy'); } }
}
function scrollToEl(el) {
  if (!el) return;
  var y = el.getBoundingClientRect().top + (window.scrollY || 0) - 110;
  window.scrollTo(0, Math.max(0, y));
}

// ---------- people picker ----------
// Task owners of a plan / task (several allowed; old data only has ownerId).
function planOwnerIds(plan) {
  if (!plan) return [];
  return plan.ownerIds && plan.ownerIds.length ? plan.ownerIds.slice() : plan.ownerId ? [plan.ownerId] : [];
}
function taskOwnerIds(t) {
  return t.ownerIds && t.ownerIds.length ? t.ownerIds.slice() : t.ownerId ? [t.ownerId] : [];
}
function namesOf(names, ids) {
  return ids.map(function (id) { return nm(names, id); }).filter(Boolean).join(tx('common.listSep'));
}

async function pickPeople(o) {
  var org = await people();
  var sel = {};
  (o.selected || []).forEach(function (id) { if (id) sel[id] = 1; });
  var only = o.onlyIds ? o.onlyIds.reduce(function (m, id) { m[id] = 1; return m; }, {}) : null;
  var list = org.people.filter(function (p) { return !p.left && (!only || only[p.id]); });
  var count = function () { return Object.keys(sel).length; };
  return openSheet({
    title: o.title || tx('picker.title'),
    full: true,
    body: '<input type="search" class="search" id="pk-q" placeholder="' + esc(tx('picker.search')) + '"><div id="pk-list"></div>',
    actions: [
      { text: tx('common.cancel'), cls: 'ghost', value: null },
      { text: o.multi ? tx('picker.selected', { n: count() }) : tx('common.ok'), cls: 'pri', onClick: function (ctx) { ctx.close(Object.keys(sel)); } },
    ],
    onMount: function (el, ctx) {
      var q = el.querySelector('#pk-q');
      var box = el.querySelector('#pk-list');
      var draw = function () {
        var kw = String(q.value || '').trim().toLowerCase();
        var groups = {};
        var order = [];
        list.forEach(function (p) {
          var dn = deptNameOf(p.deptId);
          if (kw && (p.name + ' ' + dn + ' ' + (p.title || '')).toLowerCase().indexOf(kw) < 0) return;
          if (!groups[p.deptId]) { groups[p.deptId] = []; order.push(p.deptId); }
          groups[p.deptId].push(p);
        });
        var shown = 0;
        var html = order.map(function (d) {
          return '<div class="pick-dept">' + esc(deptNameOf(d)) + '</div>' + groups[d].map(function (p) {
            shown++;
            if (shown > 400) return '';
            return '<label class="pick-row"><input type="' + (o.multi ? 'checkbox' : 'radio') + '" name="pk" value="' + esc(p.id) + '"' + (sel[p.id] ? ' checked' : '') + '>' +
              avatar(p.name) + '<span class="grow">' + esc(p.name) + (p.title ? ' <span class="muted small">' + esc(p.title) + '</span>' : '') + '</span></label>';
          }).join('');
        }).join('');
        box.innerHTML = html || emptyBlock(tx('picker.none'));
      };
      q.addEventListener('input', draw);
      box.addEventListener('change', function (ev) {
        var t = ev.target;
        if (!t || t.name !== 'pk') return;
        if (!o.multi) sel = {};
        if (t.checked) sel[t.value] = 1; else delete sel[t.value];
        var b = ctx.button(1);
        if (b && o.multi) b.textContent = tx('picker.selected', { n: count() });
      });
      draw();
    },
  });
}
function personChips(ids, names) {
  return '<div class="chips-person">' + ids.map(function (id) {
    var n = nm(names, id);
    return '<span>' + avatar(n) + esc(n) + '</span>';
  }).join('') + '</div>';
}

// ---------- router ----------
async function route(soft) {
  var seq = ++ROUTE_SEQ;
  clearTimers();
  ACTS = {};
  DIRTY = false;
  if (EXPIRED) return;
  var r = parseHash();
  var name = r.parts[0] || 'home';
  var page = PAGES[name];
  if (!page) { replaceHash('#/home'); return; }
  var y = soft ? (window.scrollY || 0) : 0;
  if (!soft) render(topBar(tx('common.loading'), { back: !ROOTS[name] }) + '<div class="loading">' + esc(tx('common.loading')) + '</div>' + (ROOTS[name] ? tabBar(name) : ''));
  try {
    var handled = await page(r, seq, !!soft);
    if (stale(seq)) return;
    if (soft) window.scrollTo(0, y);
    else if (!handled) window.scrollTo(0, 0);
  } catch (e) {
    if (stale(seq)) return;
    render(topBar(tx('appTitle'), { back: !ROOTS[name] }) + '<div class="err"><p>' + esc(e && e.message ? e.message : e) + '</p>' +
      btn('reload', tx('common.retry'), 'pri') + '</div>' + (ROOTS[name] ? tabBar(name) : ''));
    ACTS.reload = function () { route(false); };
  }
}
function reload() { return route(true); }

document.addEventListener('click', function (ev) {
  var el = ev.target && ev.target.closest ? ev.target.closest('[data-act],[data-go]') : null;
  if (!el || !APP.contains(el)) return;
  if (el.hasAttribute('data-go')) { ev.preventDefault(); go(el.getAttribute('data-go')); return; }
  var name = el.getAttribute('data-act');
  if (name === 'back') { ev.preventDefault(); goBack(); return; }
  var fn = ACTS[name];
  if (fn) { ev.preventDefault(); fn(el, ev); }
});
// Typing in a form marks the page dirty: an automatic refresh must never wipe what the user is writing.
document.addEventListener('input', function (ev) { if (ev.target && APP.contains(ev.target)) DIRTY = true; }, true);
// Back to this page after a while (e.g. switched to WeCom and back): reload so changes made elsewhere
// (speaker moved by the host, someone else confirmed) show up without a manual refresh.
document.addEventListener('visibilitychange', function () {
  if (document.visibilityState === 'hidden') { HIDDEN_AT = Date.now(); return; }
  if (HIDDEN_AT && Date.now() - HIDDEN_AT > 3000 && !DIRTY && !UPLOADING && !EXPIRED) reload();
  HIDDEN_AT = 0;
});
window.addEventListener('hashchange', function () {
  var h = location.hash || '#/home';
  if (REPLACING) { REPLACING = false; if (STACK.length) STACK[STACK.length - 1] = h; else STACK.push(h); }
  else if (STACK.length > 1 && STACK[STACK.length - 2] === h) STACK.pop();
  else STACK.push(h);
  route(false);
});
window.addEventListener('beforeunload', function (ev) { if (UPLOADING) { ev.preventDefault(); ev.returnValue = ''; } });

// ---------- home ----------
function todoItem(td) {
  var urgent = td.urgency === 'urgent';
  var hintCls = urgent ? 'bad' : td.urgency === 'today' ? 'warn' : 'muted';
  return '<div class="item' + (urgent ? ' urgent' : '') + '" data-go="' + esc(linkHash(td.link)) + '"><div class="grow">' +
    '<div class="row">' + tag(lbl('todoType', td.type), urgent ? 'bad' : 'gray') + (td.hint ? '<span class="hint ' + hintCls + '">' + esc(td.hint) + '</span>' : '') + '</div>' +
    '<div class="tit ell" style="margin-top:6px">' + esc(td.title) + '</div>' + (td.subtitle ? '<div class="sub ell">' + esc(td.subtitle) + '</div>' : '') +
    '</div><span class="btn sm' + (urgent ? ' pri' : '') + '">' + esc(lbl('todoAction', td.type)) + '</span></div>';
}
function noticeRow(n) {
  return '<div class="list-item" data-act="notice" data-id="' + esc(n.id) + '" data-href="' + esc(linkHash(n.link)) + '">' +
    '<div class="row">' + (n.read ? '' : '<span class="udot"></span>') +
    '<b class="grow ell">' + esc(n.title || lbl('noticeType', n.type)) + '</b><span class="muted small">' + esc(fmtAgo(n.at)) + '</span></div>' +
    (n.summary ? '<div class="muted small">' + esc(n.summary) + '</div>' : '') + '</div>';
}
function bindNoticeActs() {
  ACTS.notice = async function (el) {
    var id = el.getAttribute('data-id');
    var href = el.getAttribute('data-href');
    try { await api('notice.read', { ids: [id] }); } catch (e) { /* still navigate */ }
    go(href);
  };
}
function taskRow(t) {
  var od = t.overdue && t.status !== 'done' && t.status !== 'cancelled';
  return '<div class="list-item" data-go="#/task/' + enc(t.id) + '"><div class="row"><b class="grow ell">' + esc(t.title) + '</b>' + taskTag(t) + '</div>' +
    '<div class="muted small ell">' + esc([t.deptName, t.assigneeName, tx('task.due', { d: fmtDue(t.due) })].filter(Boolean).join(' · ')) + '</div>' +
    '<div class="row" style="margin-top:6px">' + prog(t.percent, od) + '<span class="small muted">' + esc(tx('common.percent', { n: t.percent || 0 })) + '</span>' +
    (od ? tag(tx('task.overdue', { n: t.overdueDays || 0 }), 'bad') : '') + '</div></div>';
}
function meetingRow(m) {
  return '<div class="list-item" data-go="#/meeting/' + enc(m.id) + '"><div class="row"><b class="grow ell">' + esc(m.title) + '</b>' + meetingTag(m.status) + '</div>' +
    '<div class="muted small ell">' + esc([m.projectName, fmtDT(m.time)].filter(Boolean).join(' · ')) + '</div>' +
    ((m.needsMe || m.confirmText) ? '<div class="row" style="margin-top:4px">' + (m.needsMe ? tag(tx('meetings.needsMe'), 'bad') : '') +
      (m.confirmText ? '<span class="muted small">' + esc(m.confirmText) + '</span>' : '') + '</div>' : '') + '</div>';
}
function projectRow(p) {
  var rate = p.total ? Math.round((p.done || 0) * 100 / p.total) : (p.rate || 0);
  return '<div class="list-item" data-go="#/project/' + enc(p.id) + '"><div class="row"><b class="grow ell">' + esc(p.name) + '</b>' + projectTag(p.status) + '</div>' +
    '<div class="muted small ell">' + esc([p.ownerName, tx('projects.rate', { done: p.done || 0, total: p.total || 0 }), p.overdue ? tx('projects.overdue', { n: p.overdue }) : ''].filter(Boolean).join(' · ')) + '</div>' +
    '<div class="row" style="margin-top:6px">' + prog(rate, false) + '<span class="small muted">' + rate + '%</span></div></div>';
}

PAGES.home = async function (r, seq) {
  var res = await Promise.all([api('home.get'), loadBoot(true)]);
  if (stale(seq)) return;
  var hv = res[0] || {};
  var c = hv.counts || {};
  var todos = hv.todos || [];
  var urgentN = todos.filter(function (t) { return t.urgency === 'urgent'; }).length;
  var todayN = todos.filter(function (t) { return t.urgency === 'today'; }).length;
  var g = UI.homeGroup;
  var shown = g === 'all' ? todos : todos.filter(function (t) { return t.group === g; });
  var bell = '<button class="side" data-go="#/notices" aria-label="' + esc(tx('notices.title')) + '">' + icon('bell') +
    (c.unread ? '<i class="dot">' + (c.unread > 99 ? '99+' : c.unread) + '</i>' : '') + '</button>';
  var stat = function (n, key, cls, href) {
    return '<div class="stat" data-go="' + href + '"><b class="' + cls + '">' + (Number(n) || 0) + '</b><span>' + esc(tx(key)) + '</span></div>';
  };
  var html = topBar(tx('home.title'), { right: bell }) + '<div class="page">';
  html += '<div class="card"><div class="hello">' + esc(tx('home.greeting', { hello: hello(), name: hv.greetingName || myName() })) + '</div>' +
    '<div class="muted">' + esc(urgentN || todayN ? tx('home.summary', { urgent: urgentN, today: todayN }) : tx('home.summaryNone')) + '</div>' +
    '<div class="stats">' + stat(c.todos, 'home.statTodos', 'pri', '#/home') + stat(c.dueToday, 'home.statDueToday', 'warn', '#/tasks?view=received') +
    stat(c.overdue, 'home.statOverdue', 'bad', '#/tasks?view=received&status=overdue') + stat(c.unread, 'home.statUnread', '', '#/notices') + '</div></div>';
  var chip = function (v, text, n) { return '<button class="chip' + (g === v ? ' on' : '') + '" data-act="homeGroup" data-v="' + v + '">' + esc(text) + ' ' + n + '</button>'; };
  var cnt = function (grp) { return todos.filter(function (t) { return t.group === grp; }).length; };
  html += '<div class="card"><h2>' + esc(tx('home.todoTitle')) + '</h2><div class="chips">' + chip('all', tx('common.all'), todos.length) +
    chip('meeting', tx('home.filterMeeting'), cnt('meeting')) + chip('task', tx('home.filterTask'), cnt('task')) + chip('project', tx('home.filterProject'), cnt('project')) + '</div>';
  if (!shown.length) html += emptyBlock(tx('home.todoEmpty'));
  [['urgent', 'home.groupUrgent'], ['today', 'home.groupToday'], ['week', 'home.groupWeek']].forEach(function (grp) {
    var items = shown.filter(function (t) { return (t.urgency || 'week') === grp[0]; });
    if (!items.length) return;
    html += '<div class="sec-t"><span class="' + (grp[0] === 'urgent' ? 'bad' : '') + '">' + esc(tx(grp[1])) + '</span><span class="n">' + items.length + '</span></div>' + items.map(todoItem).join('');
  });
  html += '</div>';
  var mt = hv.myTasksThisWeek || [];
  html += '<div class="card"><h2>' + esc(tx('home.myTasks')) + '<a class="r" href="#/tasks">' + esc(tx('common.viewAll')) + '</a></h2>';
  html += mt.length ? mt.map(function (t) {
    var od = t.overdue && t.status !== 'done' && t.status !== 'cancelled';
    return '<div class="list-item row" data-go="#/task/' + enc(t.id) + '"><div style="width:48px;text-align:center"><div class="muted small">' + esc(t.due === todayStr() ? tx('home.groupToday') : weekdayOf(t.due)) + '</div><b>' + esc(fmtDue(t.due)) + '</b></div>' +
      '<div class="grow"><div class="ell" style="font-weight:600">' + esc(t.title) + '</div><div class="row">' + prog(t.percent, od) + '<span class="small muted">' + (t.percent || 0) + '%</span>' +
      (od ? tag(tx('task.overdue', { n: t.overdueDays || 0 }), 'bad') : '') + '</div></div></div>';
  }).join('') : emptyBlock(tx('home.myTasksEmpty'));
  html += '</div>';
  var nts = (hv.notices || []).slice(0, 5);
  if (nts.length) {
    var unread = nts.filter(function (n) { return !n.read; }).length;
    html += '<div class="card"><h2>' + esc(tx('home.notices')) + (c.unread || unread ? tag(tx('home.unreadBadge', { n: c.unread || unread }), 'bad') : '') +
      '<a class="r" href="#/notices">' + esc(tx('common.viewAll')) + '</a></h2>' + nts.map(noticeRow).join('') + '</div>';
  }
  var ps = hv.projects || [];
  if (ps.length) html += '<div class="card"><h2>' + esc(tx('home.projects')) + '<a class="r" href="#/projects">' + esc(tx('common.viewAll')) + '</a></h2>' + ps.map(projectRow).join('') + '</div>';
  var rm = hv.recentMeetings || [];
  if (rm.length) html += '<div class="card"><h2>' + esc(tx('home.recentMeetings')) + '<a class="r" href="#/meetings">' + esc(tx('common.viewAll')) + '</a></h2>' + rm.map(meetingRow).join('') + '</div>';
  html += '</div>' + tabBar('home');
  render(html);
  ACTS.homeGroup = function (el) { UI.homeGroup = el.getAttribute('data-v') || 'all'; reload(); };
  bindNoticeActs();
};

PAGES.notices = async function (r, seq) {
  var list = await api('notice.list', {});
  if (stale(seq)) return;
  list = list || [];
  var right = list.some(function (n) { return !n.read; }) ? '<button class="side" style="width:auto;font-size:13px;color:var(--pri)" data-act="readAll">' + esc(tx('notices.readAll')) + '</button>' : '';
  render(topBar(tx('notices.title'), { back: true, right: right }) + '<div class="page"><div class="card">' + (list.length ? list.map(noticeRow).join('') : emptyBlock(tx('notices.empty'))) + '</div></div>');
  bindNoticeActs();
  ACTS.readAll = function (el) { run(el, async function () { await api('notice.read', { all: true }); reload(); }); };
};

// ---------- meetings ----------
PAGES.meetings = async function (r, seq) {
  var list = await api('meeting.list', { filter: UI.meetFilter, q: UI.meetQ || undefined });
  await loadBoot(false);
  if (stale(seq)) return;
  list = list || [];
  var chip = function (v, key) { return '<button class="chip' + (UI.meetFilter === v ? ' on' : '') + '" data-act="meetFilter" data-v="' + v + '">' + esc(tx(key)) + '</button>'; };
  var right = '<button class="side" data-go="#/new-meeting" aria-label="' + esc(tx('meetings.create')) + '">' + icon('plus') + '</button>';
  render(topBar(tx('meetings.title'), { right: right }) + '<div class="page"><input type="search" class="search" id="mq" value="' + esc(UI.meetQ) + '" placeholder="' + esc(tx('common.searchPlaceholder')) + '">' +
    '<div class="chips">' + chip('all', 'meetings.filterAll') + chip('todo', 'meetings.filterTodo') + chip('processing', 'meetings.filterProcessing') + chip('final', 'meetings.filterFinal') + '</div>' +
    '<div class="card">' + (list.length ? list.map(meetingRow).join('') : emptyBlock(tx('meetings.empty'))) + '</div></div>' + tabBar('meetings'));
  ACTS.meetFilter = function (el) { UI.meetFilter = el.getAttribute('data-v') || 'all'; reload(); };
  var q = document.getElementById('mq');
  if (q) q.addEventListener('change', function () { UI.meetQ = q.value.trim(); reload(); });
};

function stepsBar(status) {
  var steps = tx('meetingSteps').split(',');
  var groups = [['pending_upload'], ['processing', 'failed', 'pending_assign'], ['pending_confirm'], ['pending_review'], ['finalized', 'ended'], ['pending_owner', 'plan_confirm'], ['dispatched']];
  var cur = 0;
  groups.forEach(function (g, i) { if (g.indexOf(status) >= 0) cur = i; });
  return '<div class="steps">' + steps.map(function (s, i) {
    return '<div class="st ' + (i < cur ? 'done' : i === cur ? 'cur' : '') + '"><i></i><span>' + esc(s) + '</span></div>';
  }).join('') + '</div>';
}

PAGES.meeting = async function (r, seq, soft) {
  var id = r.parts[1] || '';
  var anchor = r.qs.get('anchor') || '';
  var res = await Promise.all([api('meeting.get', { id: id }), loadBoot(false), people().catch(function () { return null; })]);
  if (stale(seq)) return;
  var d = res[0] || {};
  var m = d.meeting || {};
  var my = d.my || {};
  var names = d.names || {};
  var me = myId();
  var active = d.projectStatus !== 'archived' && d.projectStatus !== 'closing';
  var speakerBy = {};
  (m.speakers || []).forEach(function (s) { speakerBy[s.label] = s; });
  var myLabels = my.myLabels || [];
  var isMine = function (seg) { return myLabels.indexOf(seg.speakerLabel) >= 0; };
  var segs = m.segments || [];
  var mySegs = segs.filter(isMine);
  var myConf = (m.confirmations || []).filter(function (c) { return c.personId === me; })[0];
  // While pending confirmation: speakers can complete their own segments (even after confirming); the host can edit any segment.
  var canEditOwn = m.status === 'pending_confirm' && !!myConf;
  var confirmHost = m.status === 'pending_confirm' && !!my.isHost;
  var canReview = m.status === 'pending_review' && !!my.isHost;
  // Host can still fix typos after the minutes are finalized (until the project is archived).
  var finalHost = !!my.isHost && ['finalized', 'ended', 'pending_owner', 'plan_confirm', 'dispatched'].indexOf(m.status) >= 0;
  var hasAudio = (m.files || []).some(function (f) { return f.kind === 'audio' || f.kind === 'video'; });
  var who = function (label) {
    var s = speakerBy[label];
    return s && s.personId ? nm(names, s.personId) : tx('meeting.speakerLabel', { label: label });
  };
  var plan = m.plan || null;
  var bar = '';
  var barNote = '';
  var panel = '';

  // ----- status panel -----
  var st = m.status;
  if (st === 'pending_upload') {
    if (my.isHost && active) {
      panel = '<div class="card"><h2>' + esc(tx('meeting.uploadTitle')) + '</h2><div class="muted small">' + esc(tx('meeting.uploadDesc')) + '</div>' +
        '<div class="banner warn small" style="margin:10px 0">' + esc(tx('meeting.uploadWifi')) + '</div>' +
        '<div class="upl"><label class="btn block"><input type="file" multiple class="hidden-input" id="upf">' + esc(tx('meeting.uploadPick')) + '</label><div id="upl-list"></div></div>' +
        '<div id="upl-msg" class="muted small" style="margin-top:8px"></div></div>';
      bar = btn('upStart', tx('meeting.uploadStart'), 'pri', ' id="up-start" disabled');
    } else {
      panel = '<div class="banner">' + esc(tx('meeting.waitUpload')) + '</div>';
    }
  } else if (st === 'processing') {
    var pr = m.process || {};
    var lastLog = pr.log && pr.log.length ? pr.log[pr.log.length - 1].text : '';
    panel = '<div class="card"><h2>' + esc(tx('meeting.processing', { stage: lbl('processStage', pr.stage || 'extract') })) + '<span class="r">' + (pr.progress || 0) + '%</span></h2>' +
      prog(pr.progress || 0) + (lastLog ? '<div class="muted small" style="margin-top:8px">' + esc(lastLog) + '</div>' : '') +
      '<div class="muted small" style="margin-top:6px">' + esc(tx('meeting.processingHint')) + '</div></div>';
    later(reload, 4000);
  } else if (st === 'failed') {
    var errMsg = m.process && m.process.error ? m.process.error : '';
    panel = '<div class="banner bad"><b>' + esc(tx('meeting.failed')) + '</b>' + esc(errMsg) + (my.isHost ? '' : '<div class="small muted">' + esc(tx('meeting.failedWait')) + '</div>') + '</div>';
    if (my.isHost && active) bar = btn('retry', tx('meeting.retryBtn'), 'pri');
  } else if (st === 'pending_assign') {
    if (my.isHost) {
      var unknown = (m.speakers || []).filter(function (s) { return !s.personId; });
      panel = '<div class="card"><h2>' + esc(tx('meeting.assignTitle')) + '</h2><div class="muted small" style="margin-bottom:10px">' + esc(tx('meeting.assignDesc', { n: unknown.length })) + '</div>' +
        (m.speakers || []).map(function (s) { return speakerSlot(s, m, names, segs); }).join('') + '</div>';
    } else {
      panel = '<div class="banner">' + esc(tx('meeting.assignWait')) + '</div>';
    }
  } else if (st === 'pending_confirm') {
    var cf = d.confirm || { done: 0, total: 0 };
    var head = '<b>' + esc(tx('meeting.confirmProgress', { done: cf.done || 0, total: cf.total || 0 })) + '</b>';
    if (myConf && myConf.status !== 'confirmed') {
      panel = (myConf.returnedAt && myConf.returnNote ? '<div class="banner warn">' + esc(tx('meeting.returnedNote', { note: myConf.returnNote })) + '</div>' : '') +
        '<div class="banner">' + head + esc(mySegs.length ? tx('meeting.confirmMine', { n: mySegs.length }) : tx('meeting.confirmMineNone')) + '</div>';
      bar = btn('confirmMine', tx('meeting.submitConfirm'), 'pri');
    } else if (myConf) {
      panel = '<div class="banner good">' + head + esc(tx('meeting.confirmDoneMine')) + '</div>';
    } else {
      panel = '<div class="banner">' + head + esc(tx('meeting.confirmWait')) + '</div>';
    }
  } else if (st === 'pending_review') {
    if (my.isHost) {
      panel = '<div class="banner"><b>' + esc(tx('meeting.reviewTitle')) + '</b>' + esc(tx('meeting.reviewDesc')) + '</div>';
      bar = btn('returnPick', tx('meeting.returnBtn'), 'ghost') + btn('approve', tx('meeting.approveBtn'), 'pri');
    } else {
      panel = '<div class="banner">' + esc(tx('meeting.reviewWait')) + '</div>';
    }
  } else if (st === 'finalized') {
    if (my.isHost && active) {
      panel = '<div class="banner good"><b>' + esc(tx('meeting.decideTitle')) + '</b>' + esc(tx('meeting.decideDesc')) + '</div>';
      bar = btn('decideNone', tx('meeting.decideNone'), 'ghost') + btn('decideGen', tx('meeting.decideGenerate'), 'pri');
    } else {
      panel = '<div class="banner good">' + esc(tx('meeting.decideWait')) + '</div>';
    }
  } else if (st === 'ended') {
    panel = '<div class="banner good">' + esc(tx('meeting.endedDesc')) + '</div>';
  } else if (st === 'pending_owner') {
    if (my.isHost && active) {
      panel = '<div class="banner"><b>' + esc(tx('meeting.ownerTitle')) + '</b>' + esc(tx('meeting.ownerDesc', { n: plan && plan.items ? plan.items.length : 0 })) + '</div>';
      bar = '<a class="btn ghost" href="#/plan/' + enc(m.id) + '">' + esc(tx('meeting.planView')) + '</a>' + btn('pickOwner', tx('meeting.ownerBtn'), 'pri');
    } else {
      panel = '<div class="banner">' + esc(tx('meeting.ownerWait')) + ' <a href="#/plan/' + enc(m.id) + '">' + esc(tx('meeting.planView')) + '</a></div>';
    }
  } else if (st === 'plan_confirm') {
    if (my.isPlanOwner) {
      panel = '<div class="banner"><b>' + esc(tx('meeting.planMine')) + '</b></div>';
      bar = '<a class="btn pri" href="#/plan/' + enc(m.id) + '">' + esc(tx('meeting.planGo')) + '</a>';
    } else {
      panel = '<div class="banner">' + esc(tx('meeting.planWait', { name: namesOf(names, planOwnerIds(plan)) })) + ' <a href="#/plan/' + enc(m.id) + '">' + esc(tx('meeting.planView')) + '</a></div>';
    }
  } else if (st === 'dispatched') {
    panel = '<div class="banner good">' + esc(tx('meeting.dispatchedDesc', { n: (m.taskIds || []).length })) + ' <a href="#/plan/' + enc(m.id) + '">' + esc(tx('meeting.planView')) + '</a></div>';
  }

  // ----- body -----
  var html = topBar(tx('meeting.title'), { back: true }) + '<div class="page' + (bar ? ' with-bar' : '') + '">';
  html += '<div class="card"><div class="row" style="align-items:flex-start"><b class="grow" style="font-size:17px;line-height:1.4">' + esc(m.title) + '</b>' + meetingTag(st) + '</div>' +
    '<div class="muted small" style="margin-top:4px">' + esc([d.projectName, fmtDT(m.time), tx('meeting.host', { name: nm(names, m.hostId) }), lbl('meetingSource', m.source),
      m.durationSec ? tx('meeting.duration', { n: Math.max(1, Math.round(m.durationSec / 60)) }) : '', tx('meeting.attendees', { n: (m.attendeeIds || []).length })].filter(Boolean).join(' · ')) + '</div>' +
    stepsBar(st) + '</div>';
  html += panel;

  if (m.summaryLines && m.summaryLines.length) {
    html += '<div class="card"><h2>' + esc(tx('meeting.summary')) + '</h2><ul style="margin:0;padding-left:18px">' + m.summaryLines.map(function (l) { return '<li>' + esc(l) + '</li>'; }).join('') + '</ul></div>';
  }
  if (m.decisions && m.decisions.length) {
    html += '<div class="card"><h2>' + esc(tx('meeting.decisions')) + '</h2><ol style="margin:0;padding-left:20px">' + m.decisions.map(function (x) { return '<li>' + esc(x.text) + '</li>'; }).join('') + '</ol></div>';
  }

  // transcript
  if (segs.length) {
    var filter = UI.segFilter[m.id] || 'all';
    var editable = function (seg) { return active && ((canEditOwn && isMine(seg)) || confirmHost || canReview || finalHost); };
    var segHtml = function (seg) {
      var mine = isMine(seg);
      var edited = !!seg.originalText && seg.originalText !== seg.text;
      var clock = hasAudio
        ? '<button class="segplay' + (PLAYING === seg.id ? ' on' : '') + '" data-act="segPlay" data-id="' + esc(seg.id) + '" aria-label="' + esc(tx('meeting.playSeg')) + '">' + (PLAYING === seg.id ? '&#10074;&#10074;' : '&#9654;') + ' ' + esc(fmtClock(seg.start)) + '</button>'
        : '<span>' + esc(fmtClock(seg.start)) + '</span>';
      return '<div class="seg' + (mine ? ' mine' : '') + '" id="seg-' + esc(seg.id) + '"><div class="who">' + avatar(who(seg.speakerLabel)) + '<b>' + esc(who(seg.speakerLabel)) + '</b>' + clock +
        (mine ? tag(tx('meeting.mine')) : '') + (edited ? tag(tx('meeting.edited'), 'gray') : '') +
        (editable(seg) ? '<button class="segedit" data-act="segEdit" data-id="' + esc(seg.id) + '">&#9998; ' + esc(tx('meeting.editBtn')) + '</button>' : '') + '</div>' +
        '<div class="txt">' + esc(seg.text) + '</div>' + (edited ? '<div class="orig">' + esc(tx('meeting.original', { text: seg.originalText })) + '</div>' : '') + '</div>';
    };
    var visible = filter === 'mine' ? segs.filter(isMine) : segs;
    var vis = {};
    visible.forEach(function (s) { vis[s.id] = s; });
    html += '<div class="sec-t">' + esc(tx('meeting.transcript')) + '<span class="n">' + segs.length + '</span></div>';
    if (finalHost && active) html += '<div class="muted small" style="margin:-4px 0 8px">' + esc(tx('meeting.finalFixHint')) + '</div>';
    if (mySegs.length) {
      html += '<div class="chips"><button class="chip' + (filter === 'all' ? ' on' : '') + '" data-act="segFilter" data-v="all">' + esc(tx('meeting.filterAllSegments')) + '</button>' +
        '<button class="chip' + (filter === 'mine' ? ' on' : '') + '" data-act="segFilter" data-v="mine">' + esc(tx('meeting.filterMine')) + ' ' + mySegs.length + '</button></div>';
    }
    var topics = m.topics || [];
    if (topics.length) {
      var used = {};
      topics.forEach(function (tp) {
        var inTopic = (tp.segmentIds || []).map(function (sid) { used[sid] = 1; return vis[sid]; }).filter(Boolean);
        if (!inTopic.length) return;
        html += '<div class="topic-t">' + esc(tp.title) + '</div>' + inTopic.map(segHtml).join('');
      });
      var rest = visible.filter(function (s) { return !used[s.id]; });
      if (rest.length) html += '<div class="topic-t">' + esc(tx('meeting.topicOther')) + '</div>' + rest.map(segHtml).join('');
    } else {
      html += visible.map(segHtml).join('');
    }
  } else if (st !== 'pending_upload' && st !== 'processing' && st !== 'failed') {
    html += '<div class="card">' + emptyBlock(tx('meeting.noSegments')) + '</div>';
  }

  // confirmations
  var confs = m.confirmations || [];
  if (confs.length) {
    html += '<div class="card"><h2>' + esc(tx('meeting.confirmations')) + '</h2>' + confs.map(function (c) {
      var n = nm(names, c.personId);
      var stTag = c.status === 'confirmed' ? tag(tx('meeting.confirmed'), 'good') : (c.returnedAt ? tag(tx('meeting.returned'), 'warn') : tag(tx('meeting.pending'), 'gray'));
      return '<div class="list-item row">' + avatar(n) + '<span class="grow">' + esc(n) + (c.confirmedAt ? ' <span class="muted small">' + esc(fmtDT(c.confirmedAt)) + '</span>' : '') +
        (c.remindedAt && c.status !== 'confirmed' ? ' <span class="muted small">' + esc(tx('meeting.remindedAt')) + '</span>' : '') + '</span>' + stTag +
        (canReview && c.status === 'confirmed' ? '<button class="linkbtn" data-act="returnTo" data-pid="' + esc(c.personId) + '">' + esc(tx('meeting.returnBtn')) + '</button>' : '') + '</div>';
    }).join('') + '</div>';
  }
  if (d.tasks && d.tasks.length) html += '<div class="card"><h2>' + esc(tx('meeting.tasks')) + '</h2>' + d.tasks.map(taskRow).join('') + '</div>';
  if (m.files && m.files.length) {
    html += '<div class="card"><h2>' + esc(tx('meeting.files')) + '</h2>' + m.files.map(function (f) {
      return '<div class="list-item row"><span class="grow ell">' + esc(f.name) + '</span><span class="muted small">' + esc(fmtSize(f.size)) + '</span></div>';
    }).join('') + '</div>';
  }
  html += '</div>' + bottomBar(bar, barNote);
  render(html);

  // ----- acts -----
  ACTS.segFilter = function (el) { UI.segFilter[m.id] = el.getAttribute('data-v'); reload(); };
  ACTS.segEdit = function (el) {
    var sid = el.getAttribute('data-id');
    var box = document.getElementById('seg-' + sid);
    var seg = segs.filter(function (s) { return s.id === sid; })[0];
    if (!box || !seg || box.querySelector('textarea')) return;
    var txt = box.querySelector('.txt');
    txt.innerHTML = '<textarea>' + esc(seg.text) + '</textarea><div class="row" style="justify-content:flex-end;margin-top:6px">' +
      btn('segCancel', tx('common.cancel'), 'sm ghost', ' data-id="' + esc(sid) + '"') + btn('segSave', tx('common.save'), 'sm pri', ' data-id="' + esc(sid) + '"') + '</div>';
    var ta = txt.querySelector('textarea');
    ta.focus();
  };
  ACTS.segCancel = function () { reload(); };
  // Play one segment's original audio; tapping the playing one pauses it. One player for the whole page.
  ACTS.segPlay = async function (el) {
    var sid = el.getAttribute('data-id');
    if (PLAYER && PLAYING === sid) { PLAYER.pause(); PLAYING = ''; markPlaying(); return; }
    if (PLAYER) PLAYER.pause();
    PLAYING = '';
    markPlaying();
    el.disabled = true;
    try {
      var url = CLIPS[sid];
      if (!url) {
        var res = await api('meeting.segment.audio', { id: m.id, segmentId: sid });
        url = res && res.dataUrl;
        if (!url) throw new Error(tx('meeting.noAudio'));
        CLIPS[sid] = url;
      }
      if (!PLAYER) { PLAYER = new Audio(); PLAYER.onended = function () { PLAYING = ''; markPlaying(); }; }
      PLAYER.src = url;
      await PLAYER.play();
      PLAYING = sid;
      markPlaying();
    } catch (e) {
      toast(e && e.message ? e.message : String(e), 'err');
    } finally {
      el.disabled = false;
    }
  };
  ACTS.segSave = function (el) {
    var sid = el.getAttribute('data-id');
    var box = document.getElementById('seg-' + sid);
    var ta = box && box.querySelector('textarea');
    if (!ta) return;
    var text = ta.value.trim();
    if (!text) { toast(tx('common.required', { field: tx('meeting.transcript') }), 'err'); return; }
    run(el, async function () {
      await api('meeting.segment.edit', { id: m.id, segmentId: sid, text: text });
      toast(tx('meeting.segSaved'));
      reload();
    });
  };
  ACTS.confirmMine = async function (el) {
    if (!(await confirmBox(tx('meeting.submitConfirmAsk'), tx('meeting.submitConfirm')))) return;
    run(el, async function () { await api('meeting.confirm', { id: m.id }); toast(tx('meeting.confirmedToast')); await loadBoot(true); reload(); });
  };
  ACTS.retry = function (el) { run(el, async function () { await api('meeting.retry', { id: m.id }); toast(tx('meeting.retried')); reload(); }); };
  var doReturn = function (pid) {
    var opts = confs.map(function (c) {
      return '<label class="pick-row"><input type="radio" name="rp" value="' + esc(c.personId) + '"' + (c.personId === pid ? ' checked' : '') + '>' + avatar(nm(names, c.personId)) + '<span class="grow">' + esc(nm(names, c.personId)) + '</span></label>';
    }).join('');
    return formSheet({
      title: tx('meeting.returnTitle'),
      okText: tx('meeting.returnBtn'),
      body: '<label class="f">' + esc(tx('meeting.returnWho')) + '</label>' + opts + '<label class="f">' + esc(tx('meeting.returnNote')) + '</label><textarea id="rn" placeholder="' + esc(tx('meeting.returnNotePh')) + '"></textarea>',
      submit: async function (sh) {
        var picked = sh.querySelector('input[name=rp]:checked');
        var who2 = need(picked ? picked.value : '', tx('meeting.returnWho'));
        var note = need(val(sh, '#rn'), tx('meeting.returnNote'));
        await api('meeting.review.return', { id: m.id, personId: who2, note: note });
      },
    }).then(function (ok) { if (ok) { toast(tx('meeting.returnedToast')); reload(); } });
  };
  ACTS.returnPick = function () { doReturn(''); };
  ACTS.returnTo = function (el) { doReturn(el.getAttribute('data-pid')); };
  var decide = async function (decision, el) {
    if (decision === 'generate') toast(tx('meeting.generating'));
    await run(el, async function () { await api('meeting.decide', { id: m.id, decision: decision }); reload(); });
  };
  ACTS.approve = async function (el) {
    if (!(await confirmBox(tx('meeting.approveAsk'), tx('meeting.approveBtn')))) return;
    var ok = await run(el, async function () { await api('meeting.review.approve', { id: m.id }); return true; });
    if (!ok) return;
    toast(tx('meeting.approvedToast'));
    var choice = await openSheet({
      title: tx('meeting.decideTitle'),
      body: '<div class="sheet-msg">' + esc(tx('meeting.decideDesc')) + '</div>',
      actions: [{ text: tx('meeting.decideNone'), cls: 'ghost', value: 'none' }, { text: tx('meeting.decideGenerate'), cls: 'pri', value: 'generate' }],
    });
    if (choice === 'none' || choice === 'generate') await decide(choice, null);
    else reload();
  };
  ACTS.decideNone = function (el) { decide('none', el); };
  ACTS.decideGen = function (el) { decide('generate', el); };
  // Task owners can be several people: multi-select, pre-checked with the current owners.
  ACTS.pickOwner = async function (el) {
    var picked = await pickPeople({ title: tx('meeting.ownerBtn'), multi: true, selected: planOwnerIds(plan) });
    if (!picked || !picked.length) return;
    run(el, async function () {
      await api('meeting.plan.owner', { id: m.id, ownerIds: picked });
      toast(tx('meeting.ownerSet', { name: namesOf(names, picked) }));
      reload();
    });
  };
  bindSpeakerActs(m, names);
  if (st === 'pending_upload' && my.isHost && active) bindUpload(m);

  // ----- anchor -----
  if (!soft) {
    var target = anchor ? document.getElementById('seg-' + anchor) : null;
    if (!target && canEditOwn && mySegs.length) target = document.getElementById('seg-' + mySegs[0].id);
    if (target) {
      scrollToEl(target);
      target.classList.add('flash');
      return true;
    }
  }
  return false;
};

function speakerSlot(s, m, names, segs) {
  var samples = segs.filter(function (x) { return x.speakerLabel === s.label; }).slice(0, 2);
  var how = s.matchedBy === 'voiceprint' ? tx('meeting.matchedVoice', { score: s.score != null ? Number(s.score).toFixed(2) : '' })
    : s.matchedBy === 'nickname' ? tx('meeting.matchedNick') : s.matchedBy === 'manual' ? tx('meeting.matchedManual') : '';
  var opts = (m.attendeeIds || []).map(function (pid) { return '<option value="' + esc(pid) + '">' + esc(nm(names, pid)) + '</option>'; }).join('');
  return '<div class="seg" id="slot-' + esc(s.label) + '"><div class="row"><b class="grow">' + esc(tx('meeting.speakerLabel', { label: s.label })) + '</b>' +
    (s.personId ? tag(nm(names, s.personId), 'good') + (how ? '<span class="muted small">' + esc(how) + '</span>' : '') : '') + '</div>' +
    samples.map(function (x) { return '<div class="muted small" style="margin-top:4px">' + esc(fmtClock(x.start)) + ' ' + esc(x.text) + '</div>'; }).join('') +
    '<div style="margin-top:8px">' + btn('listen', tx('meeting.listen'), 'sm ghost', ' data-label="' + esc(s.label) + '"') + '<div class="clip"></div></div>' +
    (s.personId ? '' : '<div class="row" style="margin-top:8px"><select class="grow" data-slot="' + esc(s.label) + '"><option value="">' + esc(tx('meeting.choosePerson')) + '</option>' + opts +
      '<option value="__other">' + esc(tx('meeting.otherPerson')) + '</option></select>' + btn('assign', tx('meeting.assignBtn'), 'sm pri', ' data-label="' + esc(s.label) + '"') + '</div>') + '</div>';
}
function bindSpeakerActs(m, names) {
  ACTS.listen = function (el) {
    var label = el.getAttribute('data-label');
    var box = el.parentNode.querySelector('.clip');
    if (!box) return;
    var src = 'api/clip?meetingId=' + enc(m.id) + '&label=' + enc(label) + '&t=' + enc(TOKEN);
    box.innerHTML = '<audio controls autoplay preload="auto" src="' + esc(src) + '"></audio>';
    var a = box.querySelector('audio');
    a.addEventListener('error', function () { box.innerHTML = '<div class="muted small">' + esc(tx('meeting.clipUnavailable')) + '</div>'; });
  };
  var sel = APP.querySelectorAll('select[data-slot]');
  for (var i = 0; i < sel.length; i++) {
    sel[i].addEventListener('change', async function (ev) {
      var s = ev.target;
      if (s.value !== '__other') return;
      var picked = await pickPeople({ title: tx('meeting.choosePerson') });
      if (!picked || !picked.length) { s.value = ''; return; }
      var o = document.createElement('option');
      o.value = picked[0];
      o.textContent = nm(names, picked[0]);
      s.insertBefore(o, s.lastChild);
      s.value = picked[0];
    });
  }
  ACTS.assign = function (el) {
    var label = el.getAttribute('data-label');
    var s = APP.querySelector('select[data-slot="' + label.replace(/"/g, '') + '"]');
    var pid = s ? s.value : '';
    if (!pid || pid === '__other') { toast(tx('meeting.choosePerson'), 'err'); return; }
    run(el, async function () {
      await api('meeting.speaker.assign', { id: m.id, label: label, personId: pid });
      toast(tx('meeting.assigned'));
      reload();
    });
  };
}
function bindUpload(m) {
  var input = document.getElementById('upf');
  var listBox = document.getElementById('upl-list');
  var startBtn = document.getElementById('up-start');
  var files = DRAFT.upload[m.id] || [];
  var draw = function () {
    listBox.innerHTML = files.map(function (f, i) {
      return '<div class="upl-file"><span class="grow ell">' + esc(f.name) + '</span><span class="muted small" id="upp-' + i + '">' + esc(fmtSize(f.size)) + '</span>' +
        (UPLOADING ? '' : '<button class="linkbtn bad" data-act="upDel" data-i="' + i + '">&times;</button>') + '</div>';
    }).join('');
    if (startBtn) startBtn.disabled = !files.length || UPLOADING;
  };
  if (input) input.addEventListener('change', function () {
    var picked = Array.prototype.slice.call(input.files || []);
    files = files.concat(picked);
    DRAFT.upload[m.id] = files;
    input.value = '';
    draw();
  });
  ACTS.upDel = function (el) { files.splice(Number(el.getAttribute('data-i')), 1); DRAFT.upload[m.id] = files; draw(); };
  ACTS.upStart = async function (el) {
    if (!files.length || UPLOADING) return;
    var max = META.maxUploadBytes;
    var total = 0;
    for (var i = 0; i < files.length; i++) {
      total += files[i].size;
      if (files[i].size > max) { toast(tx('meeting.uploadTooBig', { name: files[i].name, size: fmtSize(files[i].size), max: fmtSize(max) }), 'err'); return; }
    }
    var conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (conn && conn.type === 'cellular' && total > 20 * 1024 * 1024) {
      if (!(await confirmBox(tx('meeting.uploadCellular', { size: fmtSize(total) })))) return;
    }
    var msg = document.getElementById('upl-msg');
    UPLOADING = true;
    el.disabled = true;
    draw();
    var paths = [];
    try {
      for (var k = 0; k < files.length; k++) {
        var f = files[k];
        if (msg) msg.textContent = tx('meeting.uploading', { i: k + 1, n: files.length, name: f.name });
        var cell = document.getElementById('upp-' + k);
        var up = await uploadFile(f, (function (c) {
          return function (loaded, tot) { if (c) c.textContent = Math.floor(loaded * 100 / (tot || 1)) + '%'; };
        })(cell));
        paths.push(up.path);
      }
      await api('meeting.upload', { id: m.id, paths: paths });
      UPLOADING = false;
      DRAFT.upload[m.id] = [];
      toast(tx('meeting.uploadDone'));
      reload();
    } catch (e) {
      UPLOADING = false;
      if (EXPIRED) return;
      if (msg) msg.textContent = '';
      toast(tx('meeting.uploadFailed', { msg: e && e.message ? e.message : e }), 'err');
      if (el.isConnected) el.disabled = false;
      draw();
    }
  };
  draw();
}

// ---------- plan ----------
PAGES.plan = async function (r, seq) {
  var id = r.parts[1] || '';
  var res = await Promise.all([api('meeting.get', { id: id }), people(), loadBoot(false)]);
  if (stale(seq)) return;
  var d = res[0] || {};
  var org = res[1] || { depts: [], people: [] };
  var m = d.meeting || {};
  var my = d.my || {};
  var names = d.names || {};
  var plan = m.plan || null;
  var editable = m.status === 'plan_confirm' && !!my.isPlanOwner && !!plan;
  var canOwner = m.status === 'pending_owner' && !!my.isHost;
  var deptName = function (did) { return deptNameOf(did) || did || '-'; };
  var html = topBar(tx('plan.title'), { back: true }) + '<div class="page' + (editable || canOwner ? ' with-bar' : '') + '">';
  html += '<div class="card"><div class="row" style="align-items:flex-start"><b class="grow" style="font-size:16.5px">' + esc(m.title) + '</b>' + meetingTag(m.status) + '</div>' +
    '<div class="muted small">' + esc(d.projectName || '') + '</div>' +
    '<div class="small" style="margin-top:6px">' + esc(planOwnerIds(plan).length ? tx('plan.owner', { name: namesOf(names, planOwnerIds(plan)) }) : tx('plan.ownerNone')) + '</div></div>';
  if (!plan) {
    html += '<div class="card">' + emptyBlock(tx('plan.none')) + '</div></div>';
    render(html);
    return;
  }
  if (plan.summary) html += '<div class="card"><h2>' + esc(tx('plan.summary')) + '</h2><div class="md">' + md(plan.summary) + '</div></div>';
  if (editable) html += '<div class="banner small">' + esc(tx('plan.editHint')) + '</div>';
  html += '<div class="sec-t" id="plan-count">' + esc(tx('plan.items', { n: (plan.items || []).length })) + '</div><div id="plan-items"></div>';
  if (editable) html += btn('planAdd', tx('plan.addItem'), 'block ghost');
  html += '</div>';
  var bar = '';
  if (editable) bar = btn('planSave', tx('plan.save'), 'ghost') + btn('planConfirm', tx('plan.confirm'), 'pri');
  else if (canOwner) bar = btn('planOwner', tx('meeting.ownerBtn'), 'pri');
  html += bottomBar(bar);
  render(html);

  var fresh = (plan.items || []).map(function (x) { return { id: x.id, deptId: x.deptId, title: x.title, standard: x.standard, due: x.due, decisionId: x.decisionId, assigneeId: x.assigneeId || '' }; });
  // First listed head of the department; missing or left counts as none (same rule as the main process)
  var leaderOf = function (did) {
    var dp = null;
    for (var k = 0; k < org.depts.length; k++) if (org.depts[k].id === did) dp = org.depts[k];
    var p = dp && dp.leaderIds && dp.leaderIds.length ? personOf(dp.leaderIds[0]) : null;
    return p && !p.left ? p : null;
  };
  var toText = function (it) {
    if (it.assigneeId) return nm(names, it.assigneeId);
    var l = leaderOf(it.deptId);
    return l ? tx('plan.toDefault', { name: l.name }) : '';
  };
  var draft = editable ? (DRAFT.plan[m.id] || fresh) : fresh;
  if (editable) DRAFT.plan[m.id] = draft; else delete DRAFT.plan[m.id];
  var box = document.getElementById('plan-items');
  var deptOpts = function (cur) {
    return '<option value="">' + esc(tx('plan.chooseDept')) + '</option>' + org.depts.map(function (dp) {
      return '<option value="' + esc(dp.id) + '"' + (dp.id === cur ? ' selected' : '') + '>' + esc(dp.name) + '</option>';
    }).join('');
  };
  var collect = function () {
    if (!editable) return draft;
    var nodes = box.querySelectorAll('.plan-item');
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      var it = draft[Number(n.getAttribute('data-i'))];
      if (!it) continue;
      it.deptId = val(n, '.pi-dept');
      it.title = val(n, '.pi-title').trim();
      it.standard = val(n, '.pi-std').trim();
      it.due = val(n, '.pi-due');
    }
    return draft;
  };
  var draw = function () {
    document.getElementById('plan-count').textContent = tx('plan.items', { n: draft.length });
    box.innerHTML = draft.map(function (it, i) {
      if (!editable) {
        return '<div class="card"><div class="row">' + tag(deptName(it.deptId)) + '<span class="muted small" style="margin-left:auto">' + esc(tx('task.due', { d: it.due || '-' })) + '</span></div>' +
          '<div style="font-weight:600;margin-top:6px">' + esc(it.title) + '</div>' + (it.standard ? '<div class="muted small" style="margin-top:2px">' + esc(tx('plan.standardLine', { text: it.standard })) + '</div>' : '') +
          (toText(it) ? '<div class="muted small" style="margin-top:2px">' + esc(tx('plan.toLine', { name: toText(it) })) + '</div>' : (it.deptId ? '<div class="small bad" style="margin-top:2px">' + esc(tx('plan.toNoLeader')) + '</div>' : '')) + '</div>';
      }
      return '<div class="card plan-item" data-i="' + i + '"><div class="row"><b>' + esc(tx('plan.itemNo', { n: i + 1 })) + '</b>' +
        '<button class="linkbtn bad" style="margin-left:auto" data-act="planDel" data-i="' + i + '">' + esc(tx('plan.removeItem')) + '</button></div>' +
        '<label class="f">' + esc(tx('plan.dept')) + '</label><select class="pi-dept">' + deptOpts(it.deptId) + '</select>' +
        '<label class="f">' + esc(tx('plan.itemTitle')) + '</label><textarea class="pi-title" rows="2">' + esc(it.title) + '</textarea>' +
        '<label class="f">' + esc(tx('plan.standard')) + '</label><textarea class="pi-std" rows="2">' + esc(it.standard) + '</textarea>' +
        '<label class="f">' + esc(tx('plan.due')) + '</label><input type="date" class="pi-due" value="' + esc(it.due || '') + '">' +
        '<label class="f">' + esc(tx('plan.to')) + '</label><div class="row">' +
        '<button class="btn ghost grow" data-act="planTo" data-i="' + i + '">' + esc(toText(it) || tx('plan.toPick')) + '</button>' +
        (it.assigneeId && leaderOf(it.deptId) ? '<button class="linkbtn" style="margin-left:8px" data-act="planToReset" data-i="' + i + '">' + esc(tx('plan.toReset')) + '</button>' : '') + '</div>' +
        (!toText(it) && it.deptId ? '<div class="small bad" style="margin-top:4px">' + esc(tx('plan.toNoLeader')) + '</div>' : '') + '</div>';
    }).join('');
    // Changing the department changes the default recipient
    var sels = box.querySelectorAll('.pi-dept');
    for (var s = 0; s < sels.length; s++) sels[s].addEventListener('change', function () { collect(); draw(); });
  };
  var validate = function () {
    collect();
    if (!draft.length) throw new Error(tx('plan.emptyItems'));
    draft.forEach(function (it, i) {
      if (!it.deptId || !it.title || !it.due) throw new Error(tx('plan.itemInvalid', { n: i + 1 }));
      if (!it.assigneeId && !leaderOf(it.deptId)) throw new Error(tx('plan.toMissing', { n: i + 1 }));
    });
    return draft.map(function (it) {
      var o = { id: it.id, deptId: it.deptId, title: it.title, standard: it.standard || '', due: it.due };
      if (it.decisionId) o.decisionId = it.decisionId;
      if (it.assigneeId) o.assigneeId = it.assigneeId;
      return o;
    });
  };
  var save = async function () {
    var items = validate();
    await api('meeting.plan.save', { id: m.id, items: items, summary: plan.summary });
  };
  draw();
  ACTS.planAdd = function () {
    collect();
    draft.push({ id: 'new-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), deptId: '', title: '', standard: '', due: '' });
    draw();
    var last = box.querySelector('.plan-item:last-child');
    if (last) scrollToEl(last);
  };
  ACTS.planDel = async function (el) {
    collect();
    if (!(await confirmBox(tx('plan.removeAsk'), tx('common.remove'), true))) return;
    draft.splice(Number(el.getAttribute('data-i')), 1);
    draw();
  };
  ACTS.planTo = async function (el) {
    collect();
    var it = draft[Number(el.getAttribute('data-i'))];
    if (!it) return;
    var picked = await pickPeople({ title: tx('plan.toPick'), selected: it.assigneeId ? [it.assigneeId] : [] });
    if (!picked || !picked.length) return;
    it.assigneeId = picked[0];
    draw();
  };
  ACTS.planToReset = function (el) {
    collect();
    var it = draft[Number(el.getAttribute('data-i'))];
    if (it) it.assigneeId = '';
    draw();
  };
  ACTS.planSave = function (el) {
    run(el, async function () { await save(); delete DRAFT.plan[m.id]; toast(tx('plan.savedToast')); reload(); });
  };
  ACTS.planConfirm = async function (el) {
    try { validate(); } catch (e) { toast(e.message, 'err'); return; }
    if (!(await confirmBox(tx('plan.confirmAsk'), tx('plan.confirm')))) return;
    run(el, async function () {
      await save();
      await api('meeting.plan.confirm', { id: m.id });
      delete DRAFT.plan[m.id];
      toast(tx('plan.confirmedToast'));
      await loadBoot(true);
      replaceHash('#/meeting/' + enc(m.id));
    });
  };
  ACTS.planOwner = async function (el) {
    var picked = await pickPeople({ title: tx('meeting.ownerBtn'), multi: true, selected: planOwnerIds(plan) });
    if (!picked || !picked.length) return;
    run(el, async function () { await api('meeting.plan.owner', { id: m.id, ownerIds: picked }); toast(tx('meeting.ownerSet', { name: namesOf(names, picked) })); reload(); });
  };
};

// ---------- tasks ----------
PAGES.tasks = async function (r, seq) {
  if (r.qs.get('view')) UI.taskView = r.qs.get('view');
  if (r.qs.has('status')) UI.taskStatus = r.qs.get('status') || '';
  var status = UI.taskStatus === 'overdue' ? undefined : (UI.taskStatus || undefined);
  var list = await api('task.list', { view: UI.taskView, status: status, q: UI.taskQ || undefined });
  await loadBoot(false);
  if (stale(seq)) return;
  list = list || [];
  if (UI.taskStatus === 'overdue') list = list.filter(function (t) { return t.overdue && t.status !== 'done' && t.status !== 'cancelled'; });
  var vchip = function (v, key) { return '<button class="chip' + (UI.taskView === v ? ' on' : '') + '" data-act="taskView" data-v="' + v + '">' + esc(tx(key)) + '</button>'; };
  var schip = function (v, text) { return '<button class="chip' + (UI.taskStatus === v ? ' on' : '') + '" data-act="taskStatus" data-v="' + v + '">' + esc(text) + '</button>'; };
  render(topBar(tx('tasks.title')) + '<div class="page"><div class="chips">' + vchip('received', 'tasks.viewReceived') + vchip('assigned', 'tasks.viewAssigned') + vchip('all', 'tasks.viewAll') + '</div>' +
    '<input type="search" class="search" id="tq" value="' + esc(UI.taskQ) + '" placeholder="' + esc(tx('common.searchPlaceholder')) + '">' +
    '<div class="chips">' + schip('', tx('tasks.filterAll')) + ['to_accept', 'not_started', 'in_progress', 'done'].map(function (s) { return schip(s, lbl('taskStatus', s)); }).join('') +
    schip('overdue', tx('tasks.filterOverdue')) + '</div>' +
    '<div class="card">' + (list.length ? list.map(taskRow).join('') : emptyBlock(tx('tasks.empty'))) + '</div></div>' + tabBar('tasks'));
  ACTS.taskView = function (el) { UI.taskView = el.getAttribute('data-v'); reload(); };
  ACTS.taskStatus = function (el) { UI.taskStatus = el.getAttribute('data-v'); reload(); };
  var q = document.getElementById('tq');
  if (q) q.addEventListener('change', function () { UI.taskQ = q.value.trim(); reload(); });
};

function changesForm(t, o) {
  var sugDue = o && o.suggestedDue ? o.suggestedDue : t.due;
  return '<label class="f">' + esc(tx('task.changesTitle')) + '</label>' +
    '<label class="f">' + esc(tx('task.newTitle')) + '</label><textarea id="c-title" rows="2">' + esc(t.title) + '</textarea>' +
    '<label class="f">' + esc(tx('task.newStandard')) + '</label><textarea id="c-std" rows="2">' + esc(t.standard) + '</textarea>' +
    '<label class="f">' + esc(tx('task.newDue')) + '</label><input type="date" id="c-due" value="' + esc(sugDue || '') + '">' +
    '<label class="chk" style="margin-top:12px"><input type="checkbox" id="c-cancel"><span class="bad">' + esc(tx('task.cancelTask')) + '</span></label>';
}
function collectChanges(sh, t) {
  var ch = {};
  if (sh.querySelector('#c-cancel') && sh.querySelector('#c-cancel').checked) { ch.cancel = true; return ch; }
  var ti = val(sh, '#c-title').trim();
  var sd = val(sh, '#c-std').trim();
  var du = val(sh, '#c-due');
  if (ti && ti !== t.title) ch.title = ti;
  if (sd !== (t.standard || '') && sd) ch.standard = sd;
  if (du && du !== t.due) ch.due = du;
  return ch;
}

PAGES.task = async function (r, seq) {
  var id = r.parts[1] || '';
  var res = await Promise.all([api('task.get', { id: id }), loadBoot(false), people().catch(function () { return null; })]);
  if (stale(seq)) return;
  var d = res[0] || {};
  var t = d.task || {};
  var can = d.can || {};
  var names = d.names || {};
  var o = t.objection && t.objection.stage !== 'resolved' ? t.objection : null;
  var od = t.overdue && t.status !== 'done' && t.status !== 'cancelled';
  var b = [];
  if (can.object) b.push(btn('object', tx('task.object'), 'ghost'));
  if (can.accept) b.push(btn('accept', tx('task.accept'), 'pri'));
  if (can.change) b.push(btn('change', tx('task.change'), 'ghost'));
  if (can.progress) b.push(btn('progress', tx('task.updateProgress'), ''));
  if (can.complete) b.push(btn('complete', tx('task.complete'), 'pri'));
  if (can.review) b.push(btn('reviewReject', tx('task.reject'), 'danger'), btn('reviewAdopt', tx('task.adopt'), 'pri'));
  if (can.reply) b.push(btn('replyAccept', tx('task.replyAccept'), 'ghost'));
  if (can.escalate) b.push(btn('escalate', tx('task.escalate'), 'pri'));
  if (can.arbitrate) b.push(btn('arbKeep', tx('task.keep'), 'ghost'), btn('arbAdjust', tx('task.adjust'), 'pri'));
  var html = topBar(tx('task.title'), { back: true }) + '<div class="page' + (b.length ? ' with-bar' : '') + '">';
  html += '<div class="card"><div class="row wrap">' + taskTag(t) + '<span class="small ' + (od ? 'bad' : 'muted') + '">' + esc(tx('task.due', { d: t.due || '-' })) +
    (od ? ' · ' + esc(tx('task.overdue', { n: t.overdueDays || 0 })) : '') + '</span></div>' +
    '<div style="font-size:17px;font-weight:700;margin:8px 0 4px;line-height:1.45">' + esc(t.title) + '</div>' +
    '<div class="muted small">' + esc(tx('task.dept', { dept: t.deptName || '', name: t.assigneeName || nm(names, t.assigneeId) })) + '</div>' +
    '<div class="muted small">' + esc(tx('task.owner', { name: t.ownerName || namesOf(names, taskOwnerIds(t)) })) + '</div>' +
    '<div class="muted small"><a href="#/meeting/' + enc(t.meetingId) + '">' + esc(t.meetingTitle || '') + '</a> · <a href="#/project/' + enc(t.projectId) + '">' + esc(t.projectName || '') + '</a></div>' +
    '<div class="row" style="margin-top:10px"><span class="small muted">' + esc(tx('task.progress')) + '</span>' + prog(t.percent, od) + '<b class="small">' + (t.percent || 0) + '%</b></div></div>';
  if (t.status === 'cancelled') html += '<div class="banner">' + esc(tx('task.cancelledNote')) + '</div>';
  html += '<div class="card"><h2>' + esc(tx('task.standard')) + '</h2><div class="ink2" style="white-space:pre-wrap">' + esc(t.standard || '-') + '</div></div>';
  if (o) {
    var rv = o.review;
    html += '<div class="card"><h2>' + esc(tx('task.objectionTitle', { target: lbl('objectionTarget', o.target) })) + tag(lbl('objectionStage', o.stage), 'warn') + '</h2><div class="side2">' +
      '<div><b>' + esc(tx('task.raisedBy', { name: nm(names, o.raisedBy), kind: lbl('objectionKind', o.kind) })) + '</b>' +
      '<div>' + esc(tx('task.reason', { text: o.reason || '-' })) + '</div>' + (o.suggestion ? '<div>' + esc(tx('task.suggestion', { text: o.suggestion })) + '</div>' : '') +
      (o.suggestedDue ? '<div>' + esc(tx('task.suggestedDue', { d: o.suggestedDue })) + '</div>' : '') + '</div>' +
      '<div><b>' + esc(tx('task.sideOwner')) + ' ' + esc(t.ownerName || namesOf(names, taskOwnerIds(t))) + '</b>' +
      (rv ? '<div>' + esc(tx('task.reviewBy', { name: nm(names, rv.by), decision: rv.decision === 'adopt' ? tx('task.reviewAdopt') : tx('task.reviewReject') })) + '</div><div>' + esc(rv.note || '') + '</div>'
        : '<div class="muted">' + esc(lbl('objectionStage', 'review')) + '</div>') + '</div></div>' +
      '<div class="muted small" style="margin-top:8px">' + esc(tx('task.duringObjection')) + '</div></div>';
  }
  var logs = (t.progressLog || []).slice().reverse();
  html += '<div class="card"><h2>' + esc(tx('task.progressLog')) + '</h2>' + (logs.length ? '<ul class="timeline">' + logs.map(function (l) {
    return '<li><b>' + esc(nm(names, l.by)) + '</b> ' + esc(lbl('taskStatus', l.status)) + ' · ' + (l.percent || 0) + '% <span class="muted small">' + esc(fmtDT(l.at)) + '</span>' +
      (l.note ? '<div class="ink2">' + esc(l.note) + '</div>' : '') + '</li>';
  }).join('') + '</ul>' : emptyBlock(tx('task.noLog'))) + '</div>';
  var evs = (t.events || []).slice().reverse();
  if (evs.length) {
    html += '<div class="card"><h2>' + esc(tx('task.events')) + '</h2><ul class="timeline">' + evs.map(function (e) {
      return '<li><b>' + esc(nm(names, e.by)) + '</b> ' + esc(lbl('taskEvent', e.action)) + ' <span class="muted small">' + esc(fmtDT(e.at)) + '</span>' + (e.note ? '<div class="ink2">' + esc(e.note) + '</div>' : '') + '</li>';
    }).join('') + '</ul></div>';
  }
  var hist = t.objectionHistory || [];
  if (hist.length) {
    html += '<div class="card"><h2>' + esc(tx('task.history')) + '</h2>' + hist.map(function (h) {
      return '<div class="list-item"><div class="row">' + tag(lbl('objectionKind', h.kind), 'gray') + '<b class="grow ell">' + esc(lbl('objectionTarget', h.target)) + '</b>' +
        (h.outcome ? tag(lbl('objectionOutcome', h.outcome), 'good') : '') + '</div><div class="muted small">' + esc(h.reason) + ' · ' + esc(fmtDT(h.raisedAt)) + '</div></div>';
    }).join('') + '</div>';
  }
  html += '</div>' + bottomBar(b.join(''));
  render(html);

  var done = function (msg) { toast(msg); loadBoot(true).catch(function () {}); reload(); };
  ACTS.accept = async function (el) {
    if (!(await confirmBox(tx('task.acceptAsk'), tx('task.accept')))) return;
    run(el, async function () { await api('task.accept', { id: t.id }); done(tx('task.acceptedToast')); });
  };
  var raise = function (kind) {
    var target = 'content';
    formSheet({
      title: kind === 'change' ? tx('task.changeTitle') : tx('task.objectTitle'),
      body: '<label class="f">' + esc(tx('task.targetLabel')) + '</label><div class="seg-ctl" id="tg">' + ['content', 'time', 'requirement'].map(function (k) {
        return '<button type="button" data-v="' + k + '" class="' + (k === target ? 'on' : '') + '">' + esc(lbl('objectionTarget', k)) + '</button>';
      }).join('') + '</div>' +
        '<label class="f">' + esc(tx('task.reasonLabel')) + '</label><textarea id="o-reason" placeholder="' + esc(tx('task.reasonPh')) + '"></textarea>' +
        '<label class="f">' + esc(tx('task.suggestionLabel')) + '</label><textarea id="o-sug" placeholder="' + esc(tx('task.suggestionPh')) + '"></textarea>' +
        '<div id="o-due-box" style="display:none"><label class="f">' + esc(tx('task.suggestedDueLabel')) + '</label><input type="date" id="o-due" value="' + esc(t.due || '') + '"></div>',
      onMount: function (sh) {
        var tg = sh.querySelector('#tg');
        tg.addEventListener('click', function (ev) {
          var bt = ev.target.closest('button');
          if (!bt) return;
          target = bt.getAttribute('data-v');
          Array.prototype.forEach.call(tg.querySelectorAll('button'), function (x) { x.classList.toggle('on', x === bt); });
          sh.querySelector('#o-due-box').style.display = target === 'time' ? '' : 'none';
        });
      },
      submit: async function (sh) {
        var reason = need(val(sh, '#o-reason'), tx('task.reasonLabel'));
        var p = { id: t.id, target: target, reason: reason, suggestion: val(sh, '#o-sug').trim() };
        if (target === 'time' && val(sh, '#o-due')) p.suggestedDue = val(sh, '#o-due');
        await api('task.objection.raise', p);
      },
    }).then(function (ok) { if (ok) done(tx('task.raisedToast')); });
  };
  ACTS.object = function () { raise('objection'); };
  ACTS.change = function () { raise('change'); };
  ACTS.progress = function () {
    var status = t.status === 'in_progress' ? 'in_progress' : 'not_started';
    var opts = ['not_started', 'in_progress'].concat(can.complete ? ['done'] : []);
    formSheet({
      title: tx('task.updateProgress'),
      body: '<div style="font-weight:600;margin-bottom:4px">' + esc(t.title) + '</div><div class="muted small">' + esc(tx('task.due', { d: t.due })) + ' · ' + esc(tx('task.owner', { name: t.ownerName || '' })) + '</div>' +
        '<label class="f">' + esc(tx('task.statusLabel')) + '</label><div class="seg-ctl" id="ps">' + opts.map(function (k) {
          return '<button type="button" data-v="' + k + '" class="' + (k === status ? 'on' : '') + '">' + esc(lbl('taskStatus', k)) + '</button>';
        }).join('') + '</div>' +
        '<label class="f" id="pp-l">' + esc(tx('task.percentLabel', { n: t.percent || 0 })) + '</label><input type="range" id="pp" min="0" max="100" step="5" value="' + (t.percent || 0) + '">' +
        '<label class="f">' + esc(tx('task.noteLabel')) + '</label><textarea id="pn" placeholder="' + esc(tx('task.notePh')) + '"></textarea>',
      onMount: function (sh) {
        var pp = sh.querySelector('#pp');
        var pl = sh.querySelector('#pp-l');
        pp.addEventListener('input', function () {
          pl.textContent = tx('task.percentLabel', { n: pp.value });
          if (Number(pp.value) > 0 && status === 'not_started') { status = 'in_progress'; sync(); }
        });
        var ps = sh.querySelector('#ps');
        var sync = function () { Array.prototype.forEach.call(ps.querySelectorAll('button'), function (x) { x.classList.toggle('on', x.getAttribute('data-v') === status); }); };
        ps.addEventListener('click', function (ev) {
          var bt = ev.target.closest('button');
          if (!bt) return;
          status = bt.getAttribute('data-v');
          if (status === 'done') { pp.value = 100; pl.textContent = tx('task.percentLabel', { n: 100 }); }
          sync();
        });
      },
      submit: async function (sh) {
        var note = val(sh, '#pn').trim();
        if (status === 'done') await api('task.complete', { id: t.id, note: note });
        else await api('task.progress', { id: t.id, percent: Number(val(sh, '#pp')) || 0, note: note, status: status });
      },
    }).then(function (ok) { if (ok) done(tx('task.progressSaved')); });
  };
  ACTS.complete = function () {
    formSheet({
      title: tx('task.complete'),
      okText: tx('task.complete'),
      body: '<div class="sheet-msg">' + esc(tx('task.completeAsk')) + '</div><label class="f">' + esc(tx('task.completeNote')) + '</label><textarea id="cn"></textarea>',
      submit: async function (sh) { await api('task.complete', { id: t.id, note: val(sh, '#cn').trim() }); },
    }).then(function (ok) { if (ok) done(tx('task.completedToast')); });
  };
  var review = function (decision) {
    formSheet({
      title: tx('task.reviewTitle'),
      okText: decision === 'adopt' ? tx('task.adopt') : tx('task.reject'),
      danger: decision === 'reject',
      body: '<label class="f">' + esc(tx('task.reviewNote')) + '</label><textarea id="rv-note" placeholder="' + esc(tx('task.reviewNotePh')) + '"></textarea>' + (decision === 'adopt' ? changesForm(t, o) : ''),
      submit: async function (sh) {
        var note = need(val(sh, '#rv-note'), tx('task.reviewNote'));
        var p = { id: t.id, decision: decision, note: note };
        if (decision === 'adopt') p.changes = collectChanges(sh, t);
        await api('task.objection.review', p);
      },
    }).then(function (ok) { if (ok) done(tx('task.reviewedToast')); });
  };
  ACTS.reviewAdopt = function () { review('adopt'); };
  ACTS.reviewReject = function () { review('reject'); };
  ACTS.replyAccept = async function (el) {
    if (!(await confirmBox(tx('task.replyAcceptAsk'), tx('task.replyAccept')))) return;
    run(el, async function () { await api('task.objection.reply', { id: t.id, decision: 'accept' }); done(tx('task.repliedToast')); });
  };
  ACTS.escalate = async function (el) {
    if (!(await confirmBox(tx('task.escalateAsk'), tx('task.escalate')))) return;
    run(el, async function () { await api('task.objection.reply', { id: t.id, decision: 'escalate' }); done(tx('task.repliedToast')); });
  };
  var arbitrate = function (decision) {
    formSheet({
      title: tx('task.arbitrateTitle'),
      okText: decision === 'keep' ? tx('task.keep') : tx('task.adjust'),
      body: '<label class="f">' + esc(tx('task.arbitrateNote')) + '</label><textarea id="ab-note" placeholder="' + esc(tx('task.arbitrateNotePh')) + '"></textarea>' + (decision === 'adjust' ? changesForm(t, o) : ''),
      submit: async function (sh) {
        var note = need(val(sh, '#ab-note'), tx('task.arbitrateNote'));
        var p = { id: t.id, decision: decision, note: note };
        if (decision === 'adjust') p.changes = collectChanges(sh, t);
        await api('task.objection.arbitrate', p);
      },
    }).then(function (ok) { if (ok) done(tx('task.arbitratedToast')); });
  };
  ACTS.arbKeep = function () { arbitrate('keep'); };
  ACTS.arbAdjust = function () { arbitrate('adjust'); };
};

// ---------- projects ----------
PAGES.projects = async function (r, seq) {
  var list = await api('project.list', { status: UI.projStatus || undefined, q: UI.projQ || undefined });
  await loadBoot(false);
  if (stale(seq)) return;
  list = list || [];
  var chip = function (v, text) { return '<button class="chip' + (UI.projStatus === v ? ' on' : '') + '" data-act="projStatus" data-v="' + v + '">' + esc(text) + '</button>'; };
  var canCreate = BOOT && BOOT.me && BOOT.me.canCreateProject;
  var right = canCreate ? '<button class="side" data-go="#/new-project" aria-label="' + esc(tx('projects.create')) + '">' + icon('plus') + '</button>' : '';
  render(topBar(tx('projects.title'), { right: right }) + '<div class="page"><input type="search" class="search" id="pq" value="' + esc(UI.projQ) + '" placeholder="' + esc(tx('common.searchPlaceholder')) + '">' +
    '<div class="chips">' + chip('active', lbl('projectStatus', 'active')) + chip('closing', lbl('projectStatus', 'closing')) + chip('archived', lbl('projectStatus', 'archived')) + chip('', tx('common.all')) + '</div>' +
    '<div class="card">' + (list.length ? list.map(projectRow).join('') : emptyBlock(tx('projects.empty'))) + '</div></div>' + tabBar('projects'));
  ACTS.projStatus = function (el) { UI.projStatus = el.getAttribute('data-v'); reload(); };
  var q = document.getElementById('pq');
  if (q) q.addEventListener('change', function () { UI.projQ = q.value.trim(); reload(); });
};

PAGES.project = async function (r, seq) {
  var id = r.parts[1] || '';
  var res = await Promise.all([api('project.get', { id: id }), loadBoot(false), people().catch(function () { return null; })]);
  if (stale(seq)) return;
  var d = res[0] || {};
  var p = d.project || {};
  var can = d.can || {};
  var s = d.stats || {};
  var isOwner = p.ownerId === myId();
  var html = topBar(tx('project.title'), { back: true }) + '<div class="page' + (can.close ? ' with-bar' : '') + '">';
  html += '<div class="card"><div class="row" style="align-items:flex-start"><b class="grow" style="font-size:17px">' + esc(p.name) + '</b>' + projectTag(p.status) + '</div>' +
    '<div class="muted small">' + esc(tx('project.owner', { name: d.ownerName || nm(null, p.ownerId) })) + '</div>' +
    (p.desc ? '<div class="ink2 small" style="margin-top:6px;white-space:pre-wrap">' + esc(p.desc) + '</div>' : '') + '</div>';
  if (p.status === 'closing') html += '<div class="banner warn">' + esc(tx('project.closingNote')) + '</div>';
  if (p.status === 'archived') html += '<div class="banner">' + esc(tx('project.archivedNote', { d: fmtDate(p.archivedAt) })) + '</div>';
  var blockers = d.closeBlockers || [];
  if (blockers.length && p.status === 'active') {
    html += '<div class="banner warn"><b>' + esc(tx('project.blockers')) + '</b>' + blockers.map(function (b) {
      return '<div class="small">' + esc((T.project.blockerKind[b.kind] || b.kind) + ' · ' + b.title + ' · ' + b.reason) + '</div>';
    }).join('') + '</div>';
  }
  html += '<div class="kpis">' +
    '<div class="kpi"><span>' + esc(tx('project.statMeetings')) + '</span><b class="big">' + (s.meetings || 0) + '</b></div>' +
    '<div class="kpi"><span>' + esc(tx('project.statTasks')) + '</span><b class="big">' + (s.done || 0) + ' / ' + (s.total || 0) + '</b></div>' +
    '<div class="kpi"><span>' + esc(tx('project.statOverdue')) + '</span><b class="big ' + (s.overdue ? 'bad' : '') + '">' + (s.overdue || 0) + '</b></div>' +
    '<div class="kpi"><span>' + esc(tx('project.statObjections')) + '</span><b class="big">' + (s.objections || 0) + '</b></div>' +
    '<div class="kpi"><span>' + esc(tx('project.statWeek')) + '</span><b class="big pri">' + (s.weekRate || 0) + '%</b></div></div>';
  var acts = [];
  if (can.createMeeting) acts.push('<a class="btn sm" href="#/new-meeting?project=' + enc(p.id) + '">' + esc(tx('project.createMeeting')) + '</a>');
  if (p.summary || p.status !== 'active') acts.push('<a class="btn sm" href="#/summary/' + enc(p.id) + '">' + esc(tx('project.summary')) + '</a>');
  if (isOwner && p.status === 'active') acts.push(btn('genReport', tx('project.genReport'), 'sm ghost'));
  if (acts.length) html += '<div class="row wrap" style="margin-bottom:12px">' + acts.join('') + '</div>';
  var dp = d.deptProgress || [];
  if (dp.length) {
    html += '<div class="card"><h2>' + esc(tx('project.deptProgress')) + '</h2>' + dp.map(function (x) {
      var rate = x.total ? Math.round(x.done * 100 / x.total) : 0;
      return '<div class="dept-row"><span class="nm">' + esc(x.name) + '</span>' + prog(rate) + '<span class="v">' + (x.done || 0) + '/' + (x.total || 0) + '</span></div>';
    }).join('') + '</div>';
  }
  var members = d.members || [];
  html += '<div class="card"><h2>' + esc(tx('project.members', { n: members.length })) + (can.editMembers ? '<button class="linkbtn r" style="margin-left:auto" data-act="editMembers">' + esc(tx('project.editMembers')) + '</button>' : '') + '</h2>' +
    '<div class="chips-person">' + members.map(function (mm) { return '<span>' + avatar(mm.name) + esc(mm.name) + '</span>'; }).join('') + '</div></div>';
  var ms = d.meetings || [];
  html += '<div class="card"><h2>' + esc(tx('project.meetings')) + '<span class="n muted">' + ms.length + '</span></h2>' + (ms.length ? ms.map(meetingRow).join('') : emptyBlock(tx('project.noMeetings'))) + '</div>';
  var ts = d.tasks || [];
  html += '<div class="card"><h2>' + esc(tx('project.tasks')) + '<span class="n muted">' + ts.length + '</span></h2>' + (ts.length ? ts.map(taskRow).join('') : emptyBlock(tx('project.noTasks'))) + '</div>';
  var dec = d.decisions || [];
  if (dec.length) {
    html += '<div class="card"><h2>' + esc(tx('project.decisions')) + '</h2><ul class="timeline">' + dec.map(function (x) {
      return '<li>' + esc(x.text) + '<div class="muted small">' + esc([x.meetingTitle, fmtDate(x.at)].filter(Boolean).join(' · ')) + '</div></li>';
    }).join('') + '</ul></div>';
  }
  var reps = (p.weeklyReports || []).slice().sort(function (a, b) { return (b.generatedAt || 0) - (a.generatedAt || 0); });
  html += '<div class="card"><h2>' + esc(tx('project.reports')) + '</h2>' + (reps.length ? reps.map(function (rp) {
    return '<div class="list-item row" data-go="#/report/' + enc(p.id) + '/' + enc(rp.id) + '"><span class="grow">' + esc(rp.periodFrom ? tx('report.period', { from: fmtDate(rp.periodFrom), to: fmtDate(rp.periodTo) }) : fmtDate(rp.generatedAt)) + '</span>' +
      '<span class="muted small">' + esc(tx('report.rate')) + ' ' + ((rp.stats && rp.stats.completionRate) || 0) + '%</span></div>';
  }).join('') : emptyBlock(tx('project.noReports'))) + '</div>';
  html += '</div>' + bottomBar(can.close ? btn('closeProject', tx('project.close'), 'pri') : '');
  render(html);

  ACTS.editMembers = async function () {
    var picked = await pickPeople({ multi: true, title: tx('project.editMembers'), selected: p.memberIds || members.map(function (x) { return x.id; }) });
    if (!picked) return;
    run(null, async function () { await api('project.members', { id: p.id, memberIds: picked }); toast(tx('project.membersSaved')); reload(); });
  };
  ACTS.genReport = function (el) {
    run(el, async function () {
      var rep = await api('project.report.generate', { id: p.id });
      toast(tx('project.genReportDone'));
      if (rep && rep.id) go('#/report/' + enc(p.id) + '/' + enc(rep.id)); else reload();
    });
  };
  ACTS.closeProject = async function (el) {
    if (!(await confirmBox(tx('project.closeAsk'), tx('project.close')))) return;
    var res2 = await run(el, function () { return api('project.close', { id: p.id }); });
    if (!res2) return;
    if (res2.ok) { toast(tx('project.closeOk')); reload(); return; }
    await openSheet({
      title: tx('project.blockers'),
      body: '<div class="sheet-msg">' + esc(tx('project.closeFail')) + '</div>' + (res2.items || []).map(function (it) {
        return '<div class="list-item"><div class="row">' + tag(T.project.blockerKind[it.kind] || it.kind, 'warn') + '<b class="grow ell">' + esc(it.title) + '</b></div><div class="muted small">' + esc(it.reason) + '</div></div>';
      }).join(''),
      actions: [{ text: tx('common.ok'), cls: 'pri', value: true }],
    });
    reload();
  };
};

function reportStats(st, kind) {
  st = st || {};
  if (kind === 'weekly') {
    return '<div class="kpis"><div class="kpi"><span>' + esc(tx('report.rate')) + '</span><b class="big pri">' + (st.completionRate || 0) + '%</b></div>' +
      '<div class="kpi"><span>' + esc(tx('report.overdue')) + '</span><b class="big ' + (st.overdue ? 'bad' : '') + '">' + (st.overdue || 0) + '</b></div></div>';
  }
  var k = function (key, v, cls) { return '<div class="kpi"><span>' + esc(tx(key)) + '</span><b class="big ' + (cls || '') + '">' + v + '</b></div>'; };
  return '<div class="kpis k3">' + k('summary.statRate', (st.completionRate || 0) + '%', 'pri') + k('summary.statTotal', st.total || 0) + k('summary.statOnTime', st.onTime || 0, 'good') +
    k('summary.statLate', st.late || 0, st.late ? 'warn' : '') + k('summary.statCancelled', st.cancelled || 0) + k('summary.statOverdue', st.overdue || 0, st.overdue ? 'bad' : '') + '</div>';
}

PAGES.summary = async function (r, seq) {
  var id = r.parts[1] || '';
  var res = await Promise.all([api('project.get', { id: id }), loadBoot(false), people().catch(function () { return null; })]);
  if (stale(seq)) return;
  var d = res[0] || {};
  var p = d.project || {};
  var can = d.can || {};
  var rep = p.summary || null;
  var editable = !!can.reviewSummary && p.status === 'closing' && !!rep && !rep.approvedAt;
  var html = topBar(tx('summary.title'), { back: true }) + '<div class="page' + (editable ? ' with-bar' : '') + '">';
  html += '<div class="card"><div class="row"><b class="grow" style="font-size:16.5px">' + esc(p.name) + '</b>' + projectTag(p.status) + '</div>' +
    (rep && rep.generatedAt ? '<div class="muted small">' + esc(fmtDT(rep.generatedAt)) + '</div>' : '') + '</div>';
  if (p.status === 'archived') html += '<div class="banner">' + esc(tx('project.archivedNote', { d: fmtDate(p.archivedAt) })) + '</div>';
  if (!rep) {
    html += '<div class="card">' + emptyBlock(p.status === 'closing' ? tx('summary.generating') : tx('summary.none')) + '</div></div>';
    render(html);
    if (p.status === 'closing') later(reload, 5000);
    return;
  }
  html += reportStats(rep.stats, 'summary');
  if (editable) html += '<div class="banner small">' + esc(tx('summary.editHint')) + '</div>';
  var blocks = splitBlocks(rep.markdown);
  html += '<div class="card md">' + blocks.map(function (b, i) {
    return '<div class="mdblk" id="blk-' + i + '">' + (editable ? '<button class="linkbtn" data-act="blkEdit" data-i="' + i + '">' + esc(tx('common.edit')) + '</button>' : '') + '<div class="blk-body">' + md(b) + '</div></div>';
  }).join('') + '</div>';
  var foot = [];
  if (rep.editedAt) foot.push(tx('summary.editedAt', { d: fmtDT(rep.editedAt) }));
  if (rep.approvedAt) foot.push(tx('summary.approvedAt', { name: nm(null, rep.approvedBy), d: fmtDT(rep.approvedAt) }));
  if (foot.length) html += '<div class="muted small" style="text-align:center">' + esc(foot.join(' · ')) + '</div>';
  html += '</div>' + bottomBar(editable ? btn('sumRegen', tx('summary.regenerate'), 'ghost') + btn('sumApprove', tx('summary.approve'), 'pri') : '');
  render(html);
  if (!editable) return;
  ACTS.blkEdit = function (el) {
    var i = Number(el.getAttribute('data-i'));
    var box = document.getElementById('blk-' + i);
    if (!box || box.querySelector('textarea')) return;
    el.style.display = 'none';
    box.querySelector('.blk-body').innerHTML = '<textarea rows="8">' + esc(blocks[i]) + '</textarea><div class="row" style="justify-content:flex-end;margin:6px 0">' +
      btn('blkCancel', tx('common.cancel'), 'sm ghost') + btn('blkSave', tx('common.save'), 'sm pri', ' data-i="' + i + '"') + '</div>';
  };
  ACTS.blkCancel = function () { reload(); };
  ACTS.blkSave = function (el) {
    var i = Number(el.getAttribute('data-i'));
    var ta = document.querySelector('#blk-' + i + ' textarea');
    if (!ta) return;
    var next = blocks.slice();
    next[i] = ta.value;
    run(el, async function () { await api('project.summary.save', { id: p.id, markdown: joinBlocks(next) }); toast(tx('common.saved')); reload(); });
  };
  ACTS.sumRegen = async function (el) {
    if (!(await confirmBox(tx('summary.regenerateAsk'), tx('summary.regenerate'), true))) return;
    run(el, async function () { await api('project.summary.regenerate', { id: p.id }); toast(tx('summary.regenerating')); reload(); });
  };
  ACTS.sumApprove = async function (el) {
    if (!(await confirmBox(tx('summary.approveAsk'), tx('summary.approve')))) return;
    run(el, async function () { await api('project.summary.approve', { id: p.id }); toast(tx('summary.approvedToast')); await loadBoot(true); reload(); });
  };
};

PAGES.report = async function (r, seq) {
  var pid = r.parts[1] || '';
  var rid = r.parts[2] || '';
  var d = await api('project.get', { id: pid });
  if (stale(seq)) return;
  var p = (d && d.project) || {};
  var reps = (p.weeklyReports || []).slice().sort(function (a, b) { return (b.generatedAt || 0) - (a.generatedAt || 0); });
  var rep = null;
  for (var i = 0; i < reps.length; i++) if (reps[i].id === rid) rep = reps[i];
  if (!rep && p.summary && (p.summary.id === rid || !rid)) rep = p.summary;
  if (!rep && !rid) rep = reps[0] || null;
  var html = topBar(rep && rep.kind === 'summary' ? tx('summary.title') : tx('report.title'), { back: true }) + '<div class="page">';
  if (!rep) {
    render(html + '<div class="card">' + emptyBlock(tx('report.notFound')) + '</div></div>');
    return;
  }
  html += '<div class="card"><b style="font-size:16.5px">' + esc(p.name) + '</b><div class="muted small">' +
    esc(rep.periodFrom ? tx('report.period', { from: fmtDate(rep.periodFrom), to: fmtDate(rep.periodTo) }) : fmtDT(rep.generatedAt)) + '</div></div>';
  html += reportStats(rep.stats, rep.kind === 'summary' ? 'summary' : 'weekly');
  var dp = d.deptProgress || [];
  if (dp.length && rep.kind !== 'summary') {
    html += '<div class="card"><h2>' + esc(tx('project.deptProgress')) + '</h2>' + dp.map(function (x) {
      var rate = x.total ? Math.round(x.done * 100 / x.total) : 0;
      return '<div class="dept-row"><span class="nm">' + esc(x.name) + '</span>' + prog(rate) + '<span class="v">' + rate + '%</span></div>';
    }).join('') + '</div>';
  }
  html += '<div class="card md">' + md(rep.markdown) + '</div></div>';
  render(html);
};

// ---------- me ----------
PAGES.me = async function (r, seq) {
  var res = await Promise.all([loadBoot(true), people().catch(function () { return null; }), api('voiceprint.list').catch(function () { return null; })]);
  if (stale(seq)) return;
  var me = BOOT.me || {};
  var p = me.person || {};
  var vp = null;
  (res[2] || []).forEach(function (x) { if (x && x.person && x.person.id === p.id) vp = x; });
  var collected = vp && vp.status === 'collected';
  var html = topBar(tx('me.title')) + '<div class="page">';
  html += '<div class="card row">' + avatar(p.name, 'lg') + '<div class="grow"><div style="font-size:18px;font-weight:700">' + esc(p.name || '') + '</div>' +
    '<div class="muted small">' + esc([deptNameOf(p.deptId), p.title].filter(Boolean).join(' · ')) + '</div>' +
    '<div class="row wrap" style="margin-top:4px">' + (me.isAdmin ? tag(tx('me.admin')) : '') + (me.canCreateProject ? tag(tx('me.creator'), 'gray') : '') + '</div></div></div>';
  html += '<div class="card">' +
    '<a class="list-item row" href="#/notices"><span class="grow">' + esc(tx('me.notices')) + '</span><span class="muted">&#8250;</span></a>' +
    '<a class="list-item row" href="v?t=' + enc(TOKEN) + '"><span class="grow">' + esc(tx('me.voiceprint')) + '</span>' +
    (vp ? tag(collected ? tx('me.voiceCollected') : tx('me.voiceMissing'), collected ? 'good' : 'gray') : '') + '<span class="muted">&#8250;</span></a>' +
    (collected ? '<div class="list-item row" data-act="vpWithdraw"><span class="grow bad">' + esc(tx('me.voiceWithdraw')) + '</span></div>' : '') + '</div>';
  html += '<div class="muted small" style="padding:4px 6px">' + esc(tx('me.about')) + '</div></div>' + tabBar('me');
  render(html);
  ACTS.vpWithdraw = async function (el) {
    if (!(await confirmBox(tx('me.voiceWithdrawAsk'), tx('me.voiceWithdraw'), true))) return;
    run(el, async function () { await api('voiceprint.delete', { personId: p.id }); toast(tx('me.voiceWithdrawn')); reload(); });
  };
};

PAGES.voice = async function () { location.href = 'v?t=' + enc(TOKEN); };

// ---------- create forms ----------
function localDT(ms) {
  var d = new Date(ms);
  return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + 'T' + pad(d.getHours()) + ':' + pad(d.getMinutes());
}
function parseDT(s) {
  var m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(String(s || ''));
  if (!m) return 0;
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]), Number(m[4]), Number(m[5])).getTime();
}

PAGES['new-meeting'] = async function (r, seq) {
  var res = await Promise.all([api('project.list', { status: 'active' }), people(), loadBoot(false)]);
  if (stale(seq)) return;
  var projects = (res[0] || []).filter(function (p) { return p.status === 'active'; });
  var me = myId();
  if (!DRAFT.newMeeting) {
    var t0 = Date.now() + 30 * 60000;
    t0 = t0 - (t0 % (30 * 60000));
    DRAFT.newMeeting = { projectId: r.qs.get('project') || (projects[0] && projects[0].id) || '', title: '', time: localDT(t0), source: 'offline', hostId: me, attendeeIds: me ? [me] : [] };
  } else if (r.qs.get('project')) DRAFT.newMeeting.projectId = r.qs.get('project');
  var f = DRAFT.newMeeting;
  var draw = function () {
    var html = topBar(tx('newMeeting.title'), { back: true }) + '<div class="page with-bar"><div class="card">' +
      '<label class="f">' + esc(tx('newMeeting.project')) + '</label>' + (projects.length ? '<select id="nm-project">' + projects.map(function (p) {
        return '<option value="' + esc(p.id) + '"' + (p.id === f.projectId ? ' selected' : '') + '>' + esc(p.name) + '</option>';
      }).join('') + '</select>' : '<div class="muted">' + esc(tx('newMeeting.projectNone')) + '</div>') +
      '<label class="f">' + esc(tx('newMeeting.meetingTitle')) + '</label><input type="text" id="nm-title" value="' + esc(f.title) + '" placeholder="' + esc(tx('newMeeting.meetingTitlePh')) + '">' +
      '<label class="f">' + esc(tx('newMeeting.time')) + '</label><input type="datetime-local" id="nm-time" value="' + esc(f.time) + '">' +
      '<label class="f">' + esc(tx('newMeeting.source')) + '</label><div class="seg-ctl" id="nm-src">' + ['offline', 'tencent', 'zoom'].map(function (k) {
        return '<button type="button" data-v="' + k + '" class="' + (k === f.source ? 'on' : '') + '">' + esc(lbl('meetingSource', k)) + '</button>';
      }).join('') + '</div>' +
      '<label class="f">' + esc(tx('newMeeting.host')) + '</label><div class="row">' + personChips(f.hostId ? [f.hostId] : [], null) + '<button class="linkbtn" style="margin-left:auto" data-act="nmHost">' + esc(tx('newMeeting.pick')) + '</button></div>' +
      '<label class="f">' + esc(tx('newMeeting.attendees', { n: f.attendeeIds.length })) + '</label>' + personChips(f.attendeeIds, null) +
      '<button class="linkbtn" data-act="nmAtt">' + esc(tx('newMeeting.pick')) + '</button></div></div>' +
      bottomBar(btn('nmSubmit', tx('newMeeting.submit'), 'pri'));
    render(html);
    var bind = function (sel, key) { var el = document.getElementById(sel); if (el) el.addEventListener('input', function () { f[key] = el.value; }); if (el && el.tagName === 'SELECT') el.addEventListener('change', function () { f[key] = el.value; }); };
    bind('nm-project', 'projectId');
    bind('nm-title', 'title');
    bind('nm-time', 'time');
    var src = document.getElementById('nm-src');
    src.addEventListener('click', function (ev) {
      var b = ev.target.closest('button');
      if (!b) return;
      f.source = b.getAttribute('data-v');
      Array.prototype.forEach.call(src.querySelectorAll('button'), function (x) { x.classList.toggle('on', x === b); });
    });
  };
  draw();
  ACTS.nmHost = async function () {
    var picked = await pickPeople({ title: tx('newMeeting.host'), selected: [f.hostId] });
    if (!picked || !picked.length) return;
    f.hostId = picked[0];
    if (f.attendeeIds.indexOf(f.hostId) < 0) f.attendeeIds.unshift(f.hostId);
    draw();
  };
  ACTS.nmAtt = async function () {
    var picked = await pickPeople({ multi: true, title: tx('newMeeting.attendees', { n: f.attendeeIds.length }), selected: f.attendeeIds });
    if (!picked) return;
    f.attendeeIds = picked;
    if (f.hostId && f.attendeeIds.indexOf(f.hostId) < 0) f.attendeeIds.unshift(f.hostId);
    draw();
  };
  ACTS.nmSubmit = function (el) {
    run(el, async function () {
      need(f.projectId, tx('newMeeting.project'));
      var title = need(f.title, tx('newMeeting.meetingTitle'));
      var time = parseDT(f.time);
      if (!time) need('', tx('newMeeting.time'));
      need(f.hostId, tx('newMeeting.host'));
      var mt = await api('meeting.create', { projectId: f.projectId, title: title, time: time, source: f.source, hostId: f.hostId, attendeeIds: f.attendeeIds });
      DRAFT.newMeeting = null;
      toast(tx('newMeeting.createdToast'));
      replaceHash(mt && mt.id ? '#/meeting/' + enc(mt.id) : '#/meetings');
    });
  };
  return false;
};

PAGES['new-project'] = async function (r, seq) {
  await Promise.all([people(), loadBoot(false)]);
  if (stale(seq)) return;
  var me = myId();
  if (!DRAFT.newProject) DRAFT.newProject = { name: '', desc: '', ownerId: me, memberIds: me ? [me] : [] };
  var f = DRAFT.newProject;
  var draw = function () {
    render(topBar(tx('newProject.title'), { back: true }) + '<div class="page with-bar"><div class="card">' +
      '<label class="f">' + esc(tx('newProject.name')) + '</label><input type="text" id="np-name" value="' + esc(f.name) + '">' +
      '<label class="f">' + esc(tx('newProject.desc')) + '</label><textarea id="np-desc">' + esc(f.desc) + '</textarea>' +
      '<label class="f">' + esc(tx('newProject.owner')) + '</label><div class="row">' + personChips(f.ownerId ? [f.ownerId] : [], null) + '<button class="linkbtn" style="margin-left:auto" data-act="npOwner">' + esc(tx('newMeeting.pick')) + '</button></div>' +
      '<label class="f">' + esc(tx('newProject.members', { n: f.memberIds.length })) + '</label>' + personChips(f.memberIds, null) +
      '<button class="linkbtn" data-act="npMembers">' + esc(tx('newMeeting.pick')) + '</button></div></div>' + bottomBar(btn('npSubmit', tx('newProject.submit'), 'pri')));
    var n = document.getElementById('np-name');
    var ds = document.getElementById('np-desc');
    n.addEventListener('input', function () { f.name = n.value; });
    ds.addEventListener('input', function () { f.desc = ds.value; });
  };
  draw();
  ACTS.npOwner = async function () {
    var picked = await pickPeople({ title: tx('newProject.owner'), selected: [f.ownerId] });
    if (!picked || !picked.length) return;
    f.ownerId = picked[0];
    draw();
  };
  ACTS.npMembers = async function () {
    var picked = await pickPeople({ multi: true, title: tx('newProject.members', { n: f.memberIds.length }), selected: f.memberIds });
    if (!picked) return;
    f.memberIds = picked;
    draw();
  };
  ACTS.npSubmit = function (el) {
    run(el, async function () {
      var name = need(f.name, tx('newProject.name'));
      need(f.ownerId, tx('newProject.owner'));
      var p = await api('project.create', { name: name, desc: String(f.desc || '').trim(), ownerId: f.ownerId, memberIds: f.memberIds });
      DRAFT.newProject = null;
      toast(tx('newProject.createdToast'));
      replaceHash(p && p.id ? '#/project/' + enc(p.id) : '#/projects');
    });
  };
  return false;
};

// ---------- start ----------
async function start() {
  if (!TOKEN) { showExpired(); return; }
  try {
    await Promise.all([loadMeta(), loadBoot(true)]);
  } catch (e) {
    if (EXPIRED) return;
    render(topBar(tx('appTitle')) + '<div class="err"><p>' + esc(e && e.message ? e.message : e) + '</p>' + btn('restart', tx('common.retry'), 'pri') + '</div>');
    ACTS.restart = function () { location.reload(); };
    return;
  }
  if (!BOOT || !BOOT.me || !BOOT.me.person) {
    render('<div class="expired"><div class="ic">?</div><h1>' + esc(tx('voice.noPerson')) + '</h1><p>' + esc(tx('home.noPerson')) + '</p></div>');
    return;
  }
  if (!location.hash || location.hash === '#' || location.hash === '#/') {
    try { history.replaceState(null, '', location.pathname + location.search + '#/home'); } catch (e) { /* ignore */ }
  }
  STACK = [location.hash || '#/home'];
  route(false);
}
window.__mmApp = { route: route, linkHash: linkHash, parseHash: parseHash, md: md, splitBlocks: splitBlocks, joinBlocks: joinBlocks, ready: start() };
`;
