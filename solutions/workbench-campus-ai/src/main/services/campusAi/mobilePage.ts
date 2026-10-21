/**
 * 学生手机端单页（校园局域网直出）。扫码带校园口令 ?k= 进来，换一个匿名会话后提问。
 * 自带中 / EN 小词典（跟手机语言），不走应用词典 —— 同 apparelStore/mobilePage.ts。
 */
export const CAMPUS_MOBILE_PAGE_HTML = `<!doctype html>
<html lang="zh-CN"><head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
<title>校园智能问答</title>
<style>
:root{--bg:#f8f4f4;--card:#fff;--ink:#22263a;--mute:#5d6072;--line:#e7dcda;--brand:#7a1f2b;--brand-deep:#5a1620;--gold:#c09a4a;--brand-soft:#f6ecec;--ok:#16a34a;--warn:#b45309;--bad:#dc2626;--serif:'Noto Serif SC','Source Han Serif SC','Songti SC','STSong',Georgia,serif}
*{box-sizing:border-box}
html,body{margin:0;background:var(--bg);color:var(--ink);font:15px/1.6 -apple-system,BlinkMacSystemFont,"PingFang SC","Microsoft YaHei",sans-serif}
header{position:sticky;top:0;z-index:2;background:var(--brand-deep);color:#fdf8ef;padding:12px 16px;display:flex;gap:12px;align-items:center;box-shadow:inset 0 -3px 0 var(--gold)}
header img{width:46px;height:46px;border-radius:50%;background:#fff;border:2px solid var(--gold);object-fit:contain;padding:3px;flex:0 0 auto}
header h1{margin:0;font-size:17px;font-family:var(--serif);letter-spacing:.05em}
header p{margin:2px 0 0;font-size:12px;opacity:.85}
header .motto{font-family:var(--serif);font-style:italic;letter-spacing:.25em;color:#e9d39f;opacity:1}
nav{display:flex;background:#fff;border-bottom:1px solid var(--line);position:sticky;top:70px;z-index:2}
nav button{flex:1;border:0;background:none;padding:10px;font-size:14px;color:var(--mute)}
nav button.on{color:var(--brand);font-weight:600;box-shadow:inset 0 -2px 0 var(--gold)}
main{padding:12px 12px 120px;max-width:720px;margin:0 auto}
.msg{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:10px 12px;margin:10px 0}
.q{background:var(--brand-soft);border-color:#dbe4ff;margin-left:36px}
.a{margin-right:12px;white-space:pre-wrap}
.a.sensitive{border-color:#fecaca;background:#fff5f5}
.a.no_evidence{border-color:#fde68a;background:#fffbeb}
.tag{display:inline-block;font-size:11px;padding:1px 6px;border-radius:6px;background:#eef2ff;color:var(--brand);margin-bottom:4px}
.tag.faq{background:#ecfdf5;color:var(--ok)}
.tag.no_evidence{background:#fef3c7;color:var(--warn)}
.tag.sensitive{background:#fee2e2;color:var(--bad)}
details{margin-top:6px;font-size:13px;color:var(--mute)}
details li{margin:4px 0}
.fb{margin-top:6px;display:flex;gap:8px}
.fb button{border:1px solid var(--line);background:#fff;border-radius:8px;padding:2px 10px;font-size:13px}
.fb button.on{border-color:var(--brand);color:var(--brand)}
.bar{position:fixed;left:0;right:0;bottom:0;background:#fff;border-top:1px solid var(--line);padding:10px 12px calc(10px + env(safe-area-inset-bottom));display:flex;gap:8px}
.bar select{max-width:34%;border:1px solid var(--line);border-radius:10px;padding:0 6px;font:inherit;font-size:13px;background:#fff;color:var(--ink)}
.bar textarea{flex:1;resize:none;border:1px solid var(--line);border-radius:10px;padding:8px 10px;font:inherit;height:44px}
.bar button{border:0;background:var(--brand);color:#fff;border-radius:10px;padding:0 16px;font-size:15px}
.bar button:disabled{opacity:.5}
.empty{color:var(--mute);text-align:center;margin-top:40px;font-size:14px}
.hint{color:var(--mute);font-size:12px;margin:8px 4px}
.chips{display:flex;flex-wrap:wrap;gap:8px;margin:12px 0}
.chips button{border:1px solid #dbe4ff;background:#fff;color:var(--brand);border-radius:16px;padding:4px 12px;font-size:13px}
.err{color:var(--bad);text-align:center;margin-top:40px}
.st{font-size:12px;color:var(--mute)}
.st.answered{color:var(--ok)}
</style></head>
<body>
<header><img id="logo" alt="" hidden /><div><h1 id="title"></h1><p id="motto" class="motto" hidden></p><p id="sub"></p></div></header>
<nav><button id="tabAsk" class="on"></button><button id="tabMine"></button></nav>
<main id="main"></main>
<div class="bar" id="bar"><select id="course" hidden></select><textarea id="input" maxlength="500"></textarea><button id="send"></button></div>
<script>
(function(){
var L=(navigator.language||'zh').toLowerCase().indexOf('zh')===0?'zh':'en';
var D={zh:{title:'校园智能问答',sub:'答案来自学校知识库，每条都有出处；答不了的会转给相关部门',ask:'提问',mine:'我的问题',send:'发送',ph:'输入你的问题，例如：补考什么时候考？',school:'问学校',thinking:'正在查找资料…',src:'出处',useful:'有用',useless:'没用',faq:'部门审定答案',answer:'依据原文作答',quote:'原文摘录',no_evidence:'已转部门',sensitive:'紧急求助',empty:'还没有提过问题',open:'等待部门答复',answered:'部门已答复',closed:'已关闭',reply:'部门答复：',badKey:'二维码已失效，请重新扫描学校发布的二维码',limit:'今天的提问次数已用完，明天再来',fail:'网络有点问题，请稍后再试',try:'可以这样问：',keep:'提问记录会保留 {d} 天，用于改进服务'},
en:{title:'Campus Q&A',sub:'Answers come from the school knowledge base with sources; unanswered questions go to the right office',ask:'Ask',mine:'My questions',send:'Send',ph:'Type your question',school:'Ask the school',thinking:'Searching…',src:'Sources',useful:'Helpful',useless:'Not helpful',faq:'Official answer',answer:'From documents',quote:'Excerpts',no_evidence:'Forwarded',sensitive:'Urgent help',empty:'No questions yet',open:'Waiting for reply',answered:'Answered',closed:'Closed',reply:'Office reply: ',badKey:'This QR code is no longer valid. Please scan the latest one.',limit:'Daily limit reached. Please come back tomorrow.',fail:'Network problem, please try again later',try:'Try asking:',keep:'Questions are kept for {d} days to improve the service'}}[L];
function $(id){return document.getElementById(id)}
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
var params=new URLSearchParams(location.search);var key=params.get('k')||'';
var token=localStorage.getItem('campus_tok')||'';var tab='ask';var log=[];var info={};
$('title').textContent=D.title;$('sub').textContent=D.sub;$('tabAsk').textContent=D.ask;$('tabMine').textContent=D.mine;$('send').textContent=D.send;$('input').placeholder=D.ph;
function api(m,u,b){var h={'Content-Type':'application/json'};if(token)h.Authorization='Bearer '+token;return fetch(u,{method:m,headers:h,body:b?JSON.stringify(b):undefined}).then(function(r){return r.json().catch(function(){return {}}).then(function(j){j.__s=r.status;return j})})}
function session(){
  if(token)return api('GET','/api/me').then(function(j){if(j.__s===200)return true;token='';localStorage.removeItem('campus_tok');return session()});
  if(!key){$('main').innerHTML='<p class="err">'+D.badKey+'</p>';$('bar').style.display='none';return Promise.resolve(false)}
  return api('POST','/api/session',{k:key}).then(function(j){if(j.__s!==200||!j.token){$('main').innerHTML='<p class="err">'+D.badKey+'</p>';$('bar').style.display='none';return false}token=j.token;localStorage.setItem('campus_tok',token);return true})
}
function tagOf(k){return '<span class="tag '+k+'">'+esc(D[k]||k)+'</span>'}
function srcHtml(list){if(!list||!list.length)return '';return '<details><summary>'+D.src+'（'+list.length+'）</summary><ol>'+list.map(function(s){return '<li><b>'+esc(s.title)+'</b>'+(s.dept?' · '+esc(s.dept):'')+'<br>'+esc(s.snippet)+'</li>'}).join('')+'</ol></details>'}
function fbHtml(r){if(r.kind==='sensitive')return '';return '<div class="fb"><button data-fb="up" data-id="'+r.qaId+'" class="'+(r.feedback==='up'?'on':'')+'">'+D.useful+'</button><button data-fb="down" data-id="'+r.qaId+'" class="'+(r.feedback==='down'?'on':'')+'">'+D.useless+'</button></div>'}
function renderAsk(){
  var h='';
  if(!log.length){h+='<p class="hint">'+esc(D.keep.replace('{d}',info.retentionDays||''))+'</p>';if(info.examples&&info.examples.length){h+='<p class="hint">'+D.try+'</p><div class="chips">'+info.examples.map(function(q){return '<button data-q="'+esc(q)+'">'+esc(q)+'</button>'}).join('')+'</div>'}}
  log.forEach(function(r){h+='<div class="msg q">'+esc(r.question)+'</div>';if(r.pending){h+='<div class="msg a">'+D.thinking+'</div>';return}if(r.error){h+='<div class="msg a no_evidence">'+esc(r.error)+'</div>';return}h+='<div class="msg a '+r.kind+'">'+tagOf(r.kind)+'<br>'+esc(r.text)+srcHtml(r.sources)+fbHtml(r)+'</div>'});
  $('main').innerHTML=h;window.scrollTo(0,document.body.scrollHeight);
}
function renderMine(){
  api('GET','/api/mine').then(function(j){
    var list=j.items||[];if(!list.length){$('main').innerHTML='<p class="empty">'+D.empty+'</p>';return}
    $('main').innerHTML=list.map(function(r){var st=r.ticketStatus?'<div class="st '+r.ticketStatus+'">'+esc(D[r.ticketStatus]||r.ticketStatus)+'</div>':'';var rep=r.ticketAnswer?'<div class="msg a faq"><span class="tag faq">'+D.reply+'</span><br>'+esc(r.ticketAnswer)+'</div>':'';return '<div class="msg q">'+esc(r.question)+'<div class="st">'+esc(String(r.at).slice(0,16).replace('T',' '))+'</div></div><div class="msg a '+r.kind+'">'+tagOf(r.kind)+'<br>'+esc(r.answer)+srcHtml(r.sources)+st+'</div>'+rep}).join('');
  })
}
function setTab(t){tab=t;$('tabAsk').className=t==='ask'?'on':'';$('tabMine').className=t==='mine'?'on':'';$('bar').style.display=t==='ask'?'flex':'none';if(t==='ask')renderAsk();else renderMine()}
function ask(q){
  q=String(q||'').trim();if(!q)return;$('input').value='';var r={question:q,pending:true};log.push(r);renderAsk();$('send').disabled=true;
  var cid=$('course').hidden?'':$('course').value;api('POST','/api/ask',{question:q,courseId:cid}).then(function(j){r.pending=false;if(j.__s===429)r.error=D.limit;else if(j.__s===401){token='';localStorage.removeItem('campus_tok');r.error=D.badKey}else if(j.__s!==200)r.error=j.error||D.fail;else{r.kind=j.kind;r.text=j.text;r.sources=j.sources;r.qaId=j.qaId}renderAsk()}).catch(function(){r.pending=false;r.error=D.fail;renderAsk()}).then(function(){$('send').disabled=false})
}
document.addEventListener('click',function(e){var t=e.target;if(!t||!t.getAttribute)return;var q=t.getAttribute('data-q');if(q){ask(q);return}var fb=t.getAttribute('data-fb');if(fb){var id=t.getAttribute('data-id');api('POST','/api/feedback',{qaId:id,value:fb});log.forEach(function(r){if(r.qaId===id)r.feedback=fb});if(tab==='ask')renderAsk();else renderMine()}});
$('send').onclick=function(){ask($('input').value)};
$('input').addEventListener('keydown',function(e){if(e.key==='Enter'&&!e.shiftKey&&!e.isComposing){e.preventDefault();ask($('input').value)}});
$('tabAsk').onclick=function(){setTab('ask')};$('tabMine').onclick=function(){setTab('mine')};
fetch('/api/info').then(function(r){return r.json()}).then(function(j){info=j||{};if(info.schoolName){$('title').textContent=info.schoolName+' · '+D.title;document.title=$('title').textContent}if(info.hasLogo){$('logo').src='/logo';$('logo').hidden=false}if(info.motto){$('motto').textContent=info.motto;$('motto').hidden=false}if(info.courses&&info.courses.length){var sel=$('course');sel.innerHTML='<option value="">'+esc(D.school)+'</option>'+info.courses.map(function(c){return '<option value="'+esc(c.id)+'">'+esc(c.name)+'</option>'}).join('');sel.hidden=false}}).catch(function(){}).then(function(){return session()}).then(function(ok){if(ok)setTab('ask')});
})();
</script>
</body></html>`;
