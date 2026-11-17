/**
 * 会议智能管理 · 声纹采集页（/v?t=<令牌>，从企微群 / 卡片链接进入）的页面脚本。
 *
 * 流程：授权确认（说明用途与范围，勾选同意，显示授权人；授权时间由主进程在 voiceprint.enroll 时记录）
 *   → 录音（显示自我介绍提示文案，10~15 秒）→ 试听并提交（主进程质量校验不合格就把原因原样显示、让用户重录）
 *   → 完成显示「采集成功」。系统里没有这个人（boot 返回 person 为空）时提示联系管理员同步通讯录。
 *
 * 录音方式（只录音，不录像——用户明确要求）：https（外网地址，见设置里的卡片地址）下在页面里直接录；
 * 局域网 http 不是安全上下文，浏览器不给麦克风：说明原因，有 https 外网地址就给「用 https 打开」，
 * 安卓浏览器可调起系统录音机（iPhone / 企微里 capture 只会打开相机，不给这个按钮），都能选已录好的录音文件。
 *
 * 用 String.raw 原样输出：不能出现反引号和 `${`；不写中文（文案在 text.ts）。
 */
export const MM_VOICE_JS = String.raw`
var ROOT = document.getElementById('app');
var V = { step: 'loading', me: null, deptName: '', agreed: false, file: null, url: '', dur: 0, recSecs: 0, err: '', result: null, existing: null, rec: null, micFailed: false, progress: 0, checking: false };
var IS_IOS = /iP(hone|ad|od)/.test(navigator.userAgent || '') || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
// iPhone and the WeCom in-app browser have no system audio recorder for file inputs (capture opens the camera),
// so on those we never offer a capture button; they record in the page over https or pick an audio file.
var VIDEO_FIRST = IS_IOS || /wxwork/i.test(navigator.userAgent || '');

function canInPageRecord() {
  return !V.micFailed && !!window.isSecureContext && !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) && typeof window.MediaRecorder === 'function';
}
function stepBar(n) {
  return '<div class="vp-step">' + [1, 2, 3].map(function (i) { return '<i class="' + (i <= n ? 'on' : '') + '"></i>'; }).join('') + '</div>';
}
function header() {
  return '<header class="top"><span class="side"></span><h1>' + esc(tx('voice.title')) + '</h1><span class="side"></span></header>';
}
function personLine() {
  var p = V.me || {};
  return tx('voice.authorizer', { name: p.name || '', dept: V.deptName ? ' · ' + V.deptName : '' });
}
function draw() {
  if (EXPIRED) return;
  var s = V.step;
  var html = header() + '<div class="page' + (s === 'consent' || s === 'review' ? ' with-bar' : '') + '">';
  var bar = '';
  if (s === 'loading') {
    html += '<div class="loading">' + esc(tx('common.loading')) + '</div>';
  } else if (s === 'nouser') {
    html += '<div class="expired" style="margin-top:12vh"><div class="ic">?</div><h1>' + esc(tx('voice.noPerson')) + '</h1><p>' + esc(tx('voice.noPersonHint')) + '</p></div>';
  } else if (s === 'error') {
    html += '<div class="err"><p>' + esc(V.err) + '</p><button class="btn pri" data-v="reload">' + esc(tx('common.retry')) + '</button></div>';
  } else if (s === 'consent') {
    html += stepBar(1) + '<div class="card"><h2>' + esc(tx('voice.consentTitle')) + '</h2><div class="ink2">' + esc(tx('voice.consentIntro', { name: (V.me && V.me.name) || '' })) + '</div></div>';
    if (V.existing) html += '<div class="banner warn small">' + esc(tx('voice.already', { time: fmtDT(V.existing.enrolledAt || V.existing.consentAt) })) + '</div>';
    html += '<div class="card">' + [['purposeTitle', 'purpose'], ['scopeTitle', 'scope'], ['storeTitle', 'store'], ['withdrawTitle', 'withdraw']].map(function (k) {
      return '<div style="margin-bottom:10px"><b>' + esc(tx('voice.' + k[0])) + '</b><div class="ink2 small">' + esc(tx('voice.' + k[1])) + '</div></div>';
    }).join('') + '</div>';
    html += '<div class="card"><label class="chk"><input type="checkbox" id="agree"' + (V.agreed ? ' checked' : '') + '><span>' + esc(tx('voice.agree')) + '</span></label>' +
      '<div class="muted small" style="margin-top:10px">' + esc(personLine()) + '</div><div class="muted small">' + esc(tx('voice.authTimeLater')) + '</div></div>';
    bar = '<button class="btn pri" data-v="start" id="start"' + (V.agreed ? '' : ' disabled') + '>' + esc(tx('voice.start')) + '</button>';
  } else if (s === 'record') {
    var p = V.me || {};
    html += stepBar(2) + '<div class="card"><h2>' + esc(tx('voice.recordTitle')) + '</h2><div class="muted small" style="margin-bottom:8px">' + esc(tx('voice.recordTip')) + '</div>' +
      '<div class="vp-script">' + esc(tx('voice.script', { dept: V.deptName || '', name: p.name || '' })) + '</div></div>';
    if (canInPageRecord()) {
      var on = !!V.rec;
      html += '<div class="card"><button class="rec' + (on ? ' on' : '') + '" data-v="' + (on ? 'recStop' : 'recStart') + '">' + esc(on ? tx('voice.recStop') : tx('voice.recStart')) + '</button>' +
        '<div class="rec-t" id="rec-t">' + esc(tx('voice.recTimer', { s: on ? Math.floor((Date.now() - V.rec.t0) / 1000) : 0 })) + '</div></div>';
      html += '<label class="btn ghost block"><input type="file" accept="audio/*" class="hidden-input" id="f-pick">' + esc(tx('voice.recPickFile')) + '</label>';
    } else {
      // Audio only, never video. Explain why the page can't record and give the ways that still record audio.
      if (!window.isSecureContext) {
        html += '<div class="banner warn">' + esc(tx('voice.httpNoMic')) + '</div>';
        if (META.httpsBase) html += '<a class="btn pri block" style="min-height:52px;margin-bottom:10px" href="' + esc(META.httpsBase + '/v?t=' + encodeURIComponent(TOKEN)) + '">' + esc(tx('voice.openHttps')) + '</a>';
      } else if (V.micFailed) {
        html += '<div class="banner warn">' + esc(tx('voice.micBlocked')) + '</div><button class="btn block" style="margin-bottom:10px" data-v="micRetry">' + esc(tx('voice.micRetry')) + '</button>';
      }
      if (!VIDEO_FIRST) html += '<label class="btn ' + (META.httpsBase && !window.isSecureContext ? 'ghost' : 'pri') + ' block" style="min-height:52px;margin-bottom:10px"><input type="file" accept="audio/*" capture class="hidden-input" id="f-rec">' + esc(tx('voice.recNative')) + '</label>';
      html += '<label class="btn ghost block" style="margin-bottom:10px"><input type="file" accept="audio/*" class="hidden-input" id="f-pick">' + esc(tx('voice.recPickAudio')) + '</label>' +
        '<div class="muted small">' + esc(tx('voice.recPickAudioHint')) + '</div>';
    }
  } else if (s === 'review') {
    var secs = V.dur || V.recSecs || 0;
    html += stepBar(3) + '<div class="card"><h2>' + esc(tx('voice.reviewTitle')) + '</h2><div class="muted small">' + esc(tx('voice.reviewTip')) + '</div>' +
      '<audio controls preload="metadata" id="pv" src="' + esc(V.url) + '"></audio><div id="pv-info" class="small muted">' + (secs ? esc(tx('voice.durationLabel', { s: Math.round(secs) })) : '') + '</div>' +
      (secs && secs < 9.5 ? '<div class="small warn">' + esc(tx('voice.tooShortLocal', { s: Math.round(secs) })) + '</div>' : '') + '</div>';
    if (V.err) html += '<div class="banner bad"><b>' + esc(tx('voice.failTitle')) + '</b>' + esc(V.err) + '</div>';
    bar = '<button class="btn ' + (V.err ? 'pri' : 'ghost') + '" data-v="rerecord">' + esc(tx('voice.rerecord')) + '</button>' +
      '<button class="btn ' + (V.err ? 'ghost' : 'pri') + '" data-v="submit">' + esc(tx('voice.submit')) + '</button>';
  } else if (s === 'submitting') {
    html += stepBar(3) + '<div class="card" style="text-align:center;padding:40px 14px"><div class="loading" style="padding:0" id="sub-t">' +
      esc(V.checking ? tx('voice.checking') : tx('voice.uploading', { p: V.progress })) + '</div></div>';
  } else if (s === 'done') {
    var r = V.result || {};
    var sec = r.sampleSeconds || r.seconds;
    html += '<div class="okmark">&#10003;</div><div style="text-align:center"><div style="font-size:20px;font-weight:700">' + esc(tx('voice.doneTitle')) + '</div>' +
      '<p class="ink2" style="margin:8px 16px">' + esc(tx('voice.doneBody', { name: (V.me && V.me.name) || '' })) + '</p>' +
      (sec ? '<div class="muted small">' + esc(tx('voice.doneSeconds', { s: Math.round(sec) })) + '</div>' : '') +
      '<div class="muted small">' + esc(personLine()) + '</div><div class="muted small">' + esc(tx('voice.authTime', { time: fmtDT(r.consentAt || Date.now()) })) + '</div>' +
      '<a class="btn ghost" style="margin-top:20px" href="m?t=' + encodeURIComponent(TOKEN) + '#/me">' + esc(tx('voice.backHome')) + '</a></div>';
  }
  html += '</div>' + (bar ? '<div class="bar"><div class="bar-in">' + bar + '</div></div>' : '');
  ROOT.innerHTML = html;
  bind();
}

function bind() {
  var agree = document.getElementById('agree');
  if (agree) agree.addEventListener('change', function () {
    V.agreed = agree.checked;
    var b = document.getElementById('start');
    if (b) b.disabled = !V.agreed;
  });
  ['f-rec', 'f-pick'].forEach(function (id) {
    var inp = document.getElementById(id);
    if (!inp) return;
    inp.addEventListener('change', function () {
      var f = inp.files && inp.files[0];
      inp.value = '';
      if (!f) return;
      if (f.size > META.maxUploadBytes) { toast(tx('common.tooLarge', { max: fmtSize(META.maxUploadBytes) }), 'err'); return; }
      V.recSecs = 0;
      setFile(f);
    });
  });
  var pv = document.getElementById('pv');
  if (pv) {
    pv.addEventListener('loadedmetadata', function () {
      if (isFinite(pv.duration) && pv.duration > 0 && !V.recSecs) {
        V.dur = pv.duration;
        var info = document.getElementById('pv-info');
        if (info) info.textContent = tx('voice.durationLabel', { s: Math.round(V.dur) });
        if (V.dur < 9.5 && info) info.insertAdjacentHTML('afterend', '<div class="small warn">' + esc(tx('voice.tooShortLocal', { s: Math.round(V.dur) })) + '</div>');
      }
    });
    pv.addEventListener('error', function () {
      var info = document.getElementById('pv-info');
      pv.style.display = 'none';
      if (info) info.textContent = tx('voice.noPreview');
    });
  }
}

function setFile(f) {
  if (V.url) { try { URL.revokeObjectURL(V.url); } catch (e) { /* ignore */ } }
  V.file = f;
  V.url = URL.createObjectURL(f);
  V.dur = 0;
  V.err = '';
  V.step = 'review';
  draw();
}

async function recStart() {
  var stream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: false, autoGainControl: true } });
  } catch (e) {
    V.micFailed = true;
    toast(tx('voice.micDenied'));
    draw();
    return;
  }
  var types = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus'];
  var mime = '';
  for (var i = 0; i < types.length; i++) {
    if (window.MediaRecorder.isTypeSupported && window.MediaRecorder.isTypeSupported(types[i])) { mime = types[i]; break; }
  }
  var mr;
  try { mr = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream); }
  catch (e) { stream.getTracks().forEach(function (t) { t.stop(); }); V.micFailed = true; draw(); return; }
  var chunks = [];
  mr.ondataavailable = function (e) { if (e.data && e.data.size) chunks.push(e.data); };
  mr.onstop = function () {
    stream.getTracks().forEach(function (t) { t.stop(); });
    var type = mr.mimeType || mime || 'audio/webm';
    var ext = /mp4|aac/.test(type) ? 'm4a' : /ogg/.test(type) ? 'ogg' : 'webm';
    var blob = new Blob(chunks, { type: type });
    var file;
    try { file = new File([blob], 'voiceprint.' + ext, { type: type }); } catch (e) { file = blob; file.name = 'voiceprint.' + ext; }
    setFile(file);
  };
  V.rec = { mr: mr, t0: Date.now(), timer: 0 };
  V.recSecs = 0;
  mr.start(250);
  draw();
  V.rec.timer = setInterval(function () {
    if (!V.rec) return;
    var secs = (Date.now() - V.rec.t0) / 1000;
    var el = document.getElementById('rec-t');
    if (el) el.textContent = tx('voice.recTimer', { s: Math.floor(secs) });
    if (secs >= 15) { toast(tx('voice.recAutoStop')); recStop(); }
  }, 250);
}
function recStop() {
  if (!V.rec) return;
  clearInterval(V.rec.timer);
  V.recSecs = (Date.now() - V.rec.t0) / 1000;
  var mr = V.rec.mr;
  V.rec = null;
  if (V.recSecs < 10) toast(tx('voice.recTooShort'), 'err');
  try { mr.stop(); } catch (e) { draw(); }
}

async function submit() {
  if (!V.file) { V.step = 'record'; draw(); return; }
  V.step = 'submitting';
  V.progress = 0;
  V.checking = false;
  draw();
  var label = function () {
    var el = document.getElementById('sub-t');
    if (el) el.textContent = V.checking ? tx('voice.checking') : tx('voice.uploading', { p: V.progress });
  };
  try {
    var up = await uploadFile(V.file, function (loaded, total) { V.progress = Math.floor(loaded * 100 / (total || 1)); label(); });
    V.checking = true;
    label();
    var res = await api('voiceprint.enroll', { personId: V.me.id, path: up.path, consent: true });
    V.result = res || {};
    V.step = 'done';
    draw();
  } catch (e) {
    if (EXPIRED) return;
    V.err = e && e.message ? e.message : String(e);
    V.step = 'review';
    draw();
  }
}

ROOT.addEventListener('click', function (ev) {
  var el = ev.target && ev.target.closest ? ev.target.closest('[data-v]') : null;
  if (!el) return;
  var a = el.getAttribute('data-v');
  if (a === 'start' && V.agreed) { V.step = 'record'; draw(); }
  else if (a === 'recStart') recStart();
  else if (a === 'micRetry') { V.micFailed = false; draw(); }
  else if (a === 'recStop') recStop();
  else if (a === 'rerecord') {
    if (V.url) { try { URL.revokeObjectURL(V.url); } catch (e) { /* ignore */ } }
    V.file = null; V.url = ''; V.err = ''; V.dur = 0; V.recSecs = 0;
    V.step = 'record';
    draw();
  }
  else if (a === 'submit') submit();
  else if (a === 'reload') location.reload();
});

async function startVoice() {
  if (!TOKEN) { showExpired(); return; }
  draw();
  var boot;
  try {
    await loadMeta();
    boot = await api('boot');
  } catch (e) {
    if (EXPIRED) return;
    V.err = e && e.message ? e.message : String(e);
    V.step = 'error';
    draw();
    return;
  }
  if (!boot || !boot.me || !boot.me.person) { V.step = 'nouser'; draw(); return; }
  V.me = boot.me.person;
  try {
    var org = await api('people.list');
    (org && org.depts || []).forEach(function (d) { if (d.id === V.me.deptId) V.deptName = d.name; });
  } catch (e) { /* dept name is optional */ }
  try {
    var list = await api('voiceprint.list');
    (list || []).forEach(function (x) { if (x && x.person && x.person.id === V.me.id && x.status === 'collected') V.existing = x; });
  } catch (e) { /* only admins may list; ignore */ }
  if (EXPIRED) return;
  V.step = 'consent';
  draw();
}
window.__mmVoice = { state: V, ready: startVoice() };
`;
