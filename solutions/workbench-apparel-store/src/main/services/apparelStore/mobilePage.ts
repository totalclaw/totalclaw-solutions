/**
 * 服装实体店智能体 · 顾客手机端单页（由 mobileServer 直出，局域网访问）。
 *
 * 与 AI 学习中心学生端同取向：无框架无构建，原生 JS + fetch，单 HTML 内联全部 CSS/JS。
 * 中 / EN / ع 三语内置小词典（阿语 RTL）——这是独立网页，不走 app 词典（codemod 整文件豁免）。
 * 造型选项与商品名由服务端按门店电脑的界面语言下发。
 *
 * 流程：扫门店码 → 授权 → 拍照（本地压缩到 1280px 再传）→ 选衣服 → 选背景 / 姿势 / 发型 → 生成
 * → 看图（门店名 + 试穿码水印画在图上，长按保存的就是带码的图）→ 想试实物 → 试穿码 + 推荐尺码。
 * 底部常驻「删除我的照片和试穿图」。
 */
export const APPAREL_MOBILE_PAGE_HTML = `<!DOCTYPE html>
<html lang="zh">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
<title>AI 试穿</title>
<style>
:root{--ink:#221c1a;--ink2:#5d534f;--ink3:#8f8581;--bg:#f7f3ef;--card:#fff;--line:#e7ded7;
--pri:#b04a3c;--priInk:#fff;--priSoft:#f6e4df;--good:#2f7a4f;--goodSoft:#dff0e5;--warn:#a86b12;--warnSoft:#f8ecd6;--bad:#b3261e;--badSoft:#f8dedb}
@media(prefers-color-scheme:dark){:root{--ink:#f1e9e5;--ink2:#c3b6b0;--ink3:#8d817c;--bg:#171312;--card:#221c1a;--line:#3a302d;
--pri:#e0786a;--priInk:#1a0f0d;--priSoft:#3d2521;--good:#6cc08e;--goodSoft:#1d3325;--warn:#e0a54a;--warnSoft:#3a2d17;--bad:#f08079;--badSoft:#3e1f1d}}
*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
body{margin:0;background:var(--bg);color:var(--ink);font:15px/1.6 -apple-system,"PingFang SC","Segoe UI","Noto Sans","Geeza Pro",sans-serif}
.wrap{max-width:560px;margin:0 auto;padding:14px 16px calc(90px + env(safe-area-inset-bottom))}
header{display:flex;align-items:center;gap:10px;margin:4px 0 12px}
header h1{font-size:18px;margin:0;flex:1}
.lang{display:inline-flex;border:1px solid var(--line);border-radius:99px;overflow:hidden}
.lang button{border:0;background:none;color:var(--ink2);padding:4px 10px;font-size:12.5px}
.lang button.on{background:var(--pri);color:var(--priInk);font-weight:700}
.card{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:14px;margin-bottom:12px}
.card h2{font-size:15px;margin:0 0 8px;display:flex;align-items:center;gap:8px}
.no{width:22px;height:22px;border-radius:50%;background:var(--priSoft);color:var(--pri);display:inline-flex;align-items:center;justify-content:center;font-size:12px;font-weight:800}
.no.ok{background:var(--good);color:#fff}
.muted{color:var(--ink3);font-size:12.5px}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;border:1px solid var(--line);background:var(--card);color:var(--ink);border-radius:12px;padding:10px 16px;font-size:14px;font-weight:700;cursor:pointer}
.btn.pri{background:var(--pri);border-color:var(--pri);color:var(--priInk)}
.btn.block{width:100%}
.btn:disabled{opacity:.45}
.btn.link{border:0;background:none;color:var(--pri);padding:6px 0;font-weight:600}
input[type=text],input[type=number]{width:100%;height:42px;border:1px solid var(--line);border-radius:10px;background:var(--bg);color:var(--ink);padding:0 12px;font:inherit}
label.chk{display:flex;gap:10px;align-items:flex-start;font-size:13px;color:var(--ink2);line-height:1.55}
label.chk input{margin-top:3px;width:18px;height:18px;flex:0 0 auto;accent-color:var(--pri)}
.row{display:flex;gap:10px}
.row>*{flex:1}
.photo{display:flex;gap:12px;align-items:center}
.photo img{width:84px;height:112px;object-fit:cover;border-radius:10px;background:var(--line)}
.grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}
.g{border:2px solid transparent;border-radius:14px;overflow:hidden;background:var(--bg);position:relative}
.g img{width:100%;aspect-ratio:3/4;object-fit:cover;display:block;background:#fff}
.g .t{padding:6px 8px;font-size:12.5px}
.g .t b{display:block;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.g.on{border-color:var(--pri)}
.g.on::after{content:"✓";position:absolute;top:6px;inset-inline-end:6px;width:22px;height:22px;border-radius:50%;background:var(--pri);color:#fff;font-size:13px;display:flex;align-items:center;justify-content:center}
.kind{margin:10px 0 4px;font-size:13px;font-weight:800;color:var(--ink2)}
.chips{display:flex;gap:8px;overflow-x:auto;padding-bottom:6px;scrollbar-width:none}
.chips::-webkit-scrollbar{display:none}
.chip{flex:0 0 auto;border:1px solid var(--line);background:var(--card);border-radius:99px;padding:7px 12px;font-size:13px;color:var(--ink);white-space:nowrap}
.chip.on{background:var(--pri);border-color:var(--pri);color:var(--priInk);font-weight:700}
.chip.sub{font-size:12px;padding:5px 10px;background:var(--bg)}
.chip.sub.on{background:var(--priSoft);color:var(--pri);border-color:var(--pri)}
.chip.tc{display:inline-flex;flex-direction:column;align-items:center;gap:4px;border-radius:12px;padding:4px 4px 6px;width:84px;white-space:normal;font-size:12px}
.chip .th{width:74px;height:92px;object-fit:cover;border-radius:8px;background:var(--line)}
.qr,.res img.qr{width:150px;height:150px;object-fit:contain;border-radius:8px;background:#fff;margin:6px auto;display:block}
.tabs{display:flex;gap:6px;margin-bottom:6px}
.tabs button{flex:1;border:1px solid var(--line);background:var(--bg);border-radius:10px;padding:6px 0;font-size:12.5px;color:var(--ink2)}
.tabs button.on{border-color:var(--pri);color:var(--pri);font-weight:800;background:var(--priSoft)}
.res{border:1px solid var(--line);border-radius:14px;overflow:hidden;margin-bottom:12px;background:var(--card)}
.res img{width:100%;display:block;background:var(--bg)}
.res .ph{aspect-ratio:3/4;display:flex;flex-direction:column;gap:8px;align-items:center;justify-content:center;color:var(--ink3);font-size:13px;background:var(--bg)}
.res .meta{padding:10px 12px;font-size:12.5px;color:var(--ink2);display:grid;gap:8px}
.code{font-size:26px;letter-spacing:.2em;font-weight:900;color:var(--pri);text-align:center;padding:6px 0}
.note{border-radius:10px;padding:9px 12px;font-size:12.5px;line-height:1.55}
.note.warn{background:var(--warnSoft);color:var(--warn)}
.note.bad{background:var(--badSoft);color:var(--bad)}
.note.ok{background:var(--goodSoft);color:var(--good)}
.bar{position:fixed;left:0;right:0;bottom:0;background:var(--card);border-top:1px solid var(--line);padding:10px 16px calc(10px + env(safe-area-inset-bottom))}
.bar .in{max-width:560px;margin:0 auto;display:flex;gap:10px;align-items:center}
.bar .in .muted{flex:1}
.spin{width:26px;height:26px;border:3px solid var(--line);border-top-color:var(--pri);border-radius:50%;animation:s 1s linear infinite}
@keyframes s{to{transform:rotate(360deg)}}
.center{text-align:center}
.hidden{display:none}
</style>
</head>
<body>
<div class="wrap" id="app"><div class="center" style="padding:80px 0"><div class="spin" style="margin:0 auto"></div></div></div>
<div class="bar hidden" id="bar"><div class="in"><span class="muted" id="barText"></span><button class="btn pri" id="goBtn"></button></div></div>
<input type="file" id="filePhoto" accept="image/*" class="hidden" />
<input type="file" id="fileBg" accept="image/*" class="hidden" />
<script>
var I18N = {
 zh: {title:'AI 试穿',welcome:'上传一张全身照，AI 帮你穿上店里的衣服',nick:'怎么称呼你（选填）',consent:'我同意：照片仅用于本次试穿，会发送到云端 AI 生成试穿图，保存在本店电脑，{d} 天后自动删除；我可以随时一键删除。',start:'开始试穿',
  s1:'我的照片',s2:'选衣服',s3:'选造型',s4:'试穿结果',take:'拍照 / 选照片',retake:'换一张',tip:'全身正面、单人、光线充足效果最好',height:'身高 cm（选填）',weight:'体重 kg（选填）',save:'保存',
  bg:'背景',pose:'姿势',hair:'发型',pick:'最多选 4 件',rec:'用店长推荐',upbg:'上传背景照片',bgok:'已上传背景',
  gen:'生成试穿图',left:'今天还能生成 {n} 张',needPhoto:'先上传照片',needGarment:'先选衣服',queued:'排队中…',running:'AI 正在生成，约 5–30 秒',failed:'生成失败',
  want:'想试实物',code:'试穿码',size:'推荐尺码',showCode:'到店出示试穿码，店员会帮你备好尺码',savehint:'长按图片保存到相册',none:'还没有试穿图',
  del:'删除我的照片和试穿图',delok:'已删除。谢谢光临！',delq:'确定删除你的照片和全部试穿图吗？',bad:'门店码无效或已更换，请重新扫描店内二维码',busy:'请求太频繁，请稍后再试',limit:'今天的生成次数已用完',
  checking:'正在检查照片…',photoBad:'照片不适合试穿，请重拍：',err:'出错了',retry:'重试',PHOTO_BAD:'照片不适合试穿，请换一张单人、全身正面、光线充足的照片',PHOTO_CHECKING:'照片还在检查中，请稍候几秒',all:'全部',showAll:'显示全部发型',onlyFit:'只看适合的',validToday:'今日有效',expired:'已过期（当天有效），可请店员按姓名查找'},
 en: {title:'AI Try-On',welcome:'Upload a full-body photo and see yourself in our clothes',nick:'Your name (optional)',consent:'I agree: my photo is used only for this try-on, sent to a cloud AI to create try-on images, stored on this store\\'s computer and deleted automatically after {d} days. I can delete it anytime.',start:'Start',
  s1:'My photo',s2:'Pick clothes',s3:'Pick a look',s4:'Results',take:'Take / choose photo',retake:'Change photo',tip:'Full body, front-facing, one person, good light',height:'Height cm (optional)',weight:'Weight kg (optional)',save:'Save',
  bg:'Background',pose:'Pose',hair:'Hair',pick:'Up to 4 items',rec:'Staff pick',upbg:'Upload background',bgok:'Background uploaded',
  gen:'Generate',left:'{n} left today',needPhoto:'Upload a photo first',needGarment:'Pick clothes first',queued:'Queued…',running:'Generating, about 5–30 s',failed:'Failed',
  want:'Try it in store',code:'Try-on code',size:'Suggested size',showCode:'Show this code in store and we\\'ll have your size ready',savehint:'Long-press the image to save',none:'No try-on images yet',
  del:'Delete my photos',delok:'Deleted. Thank you!',delq:'Delete your photo and all try-on images?',bad:'Invalid store code. Please scan the QR code in store again',busy:'Too many requests, try later',limit:'Daily limit reached',
  checking:'Checking photo…',photoBad:'Photo not suitable, please retake: ',err:'Error',retry:'Retry',PHOTO_BAD:'Photo not suitable. Please use a single-person, full-body, front-facing, well-lit photo',PHOTO_CHECKING:'Still checking your photo, please wait a few seconds',all:'All',showAll:'Show all hairstyles',onlyFit:'Only matching',validToday:'Valid today',expired:'Expired (valid on the day). Ask staff to look you up by name'},
 ar: {title:'تجربة الملابس بالذكاء الاصطناعي',welcome:'ارفع صورة كاملة للجسم وشاهد نفسك بملابسنا',nick:'اسمك (اختياري)',consent:'أوافق: تُستخدم صورتي لهذه التجربة فقط، وتُرسل إلى ذكاء اصطناعي سحابي لإنشاء الصور، وتُحفظ على جهاز المتجر وتُحذف تلقائيًا بعد {d} أيام، ويمكنني حذفها في أي وقت.',start:'ابدأ',
  s1:'صورتي',s2:'اختر الملابس',s3:'اختر الإطلالة',s4:'النتائج',take:'التقط / اختر صورة',retake:'تغيير الصورة',tip:'صورة أمامية كاملة لشخص واحد بإضاءة جيدة',height:'الطول سم (اختياري)',weight:'الوزن كغ (اختياري)',save:'حفظ',
  bg:'الخلفية',pose:'الوضعية',hair:'الشعر',pick:'حتى 4 قطع',rec:'اختيار المتجر',upbg:'ارفع صورة خلفية',bgok:'تم رفع الخلفية',
  gen:'إنشاء',left:'متبقٍ اليوم {n}',needPhoto:'ارفع صورة أولًا',needGarment:'اختر الملابس أولًا',queued:'في الانتظار…',running:'جارٍ الإنشاء، 5–30 ثانية',failed:'فشل',
  want:'أريد تجربتها في المتجر',code:'رمز التجربة',size:'المقاس المقترح',showCode:'أظهر الرمز في المتجر وسنجهز مقاسك',savehint:'اضغط مطولًا لحفظ الصورة',none:'لا توجد صور بعد',
  del:'احذف صوري',delok:'تم الحذف. شكرًا لزيارتك!',delq:'حذف صورتك وجميع صور التجربة؟',bad:'رمز المتجر غير صالح، امسح الرمز داخل المتجر مجددًا',busy:'طلبات كثيرة، حاول لاحقًا',limit:'تم بلوغ الحد اليومي',
  checking:'جارٍ فحص الصورة…',photoBad:'الصورة غير مناسبة، يرجى إعادة التصوير: ',err:'خطأ',retry:'إعادة',PHOTO_BAD:'الصورة غير مناسبة. استخدم صورة كاملة أمامية لشخص واحد بإضاءة جيدة',PHOTO_CHECKING:'ما زلنا نفحص صورتك، انتظر بضع ثوانٍ',all:'الكل',showAll:'عرض كل التسريحات',onlyFit:'المناسبة فقط',validToday:'صالح اليوم',expired:'انتهت الصلاحية (صالح في اليوم نفسه)، اطلب من الموظف البحث باسمك'}
};
var lang = localStorage.getItem('ap_lang') || ((navigator.language||'zh').slice(0,2)==='ar'?'ar':(navigator.language||'zh').slice(0,2)==='en'?'en':'zh');
function T(k,p){ var s=(I18N[lang]||I18N.zh)[k]||k; if(p){for(var x in p){s=s.split('{'+x+'}').join(p[x]);}} return s; }
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
var qs = new URLSearchParams(location.search);
var storeKey = qs.get('k') || '';
var token = qs.get('s') || localStorage.getItem('ap_token') || '';
if (qs.get('s')) { localStorage.setItem('ap_token', token); history.replaceState(null, '', location.pathname + (storeKey ? '?k=' + encodeURIComponent(storeKey) : '')); }
var S = { info:null, cat:null, me:null, picked:[], choice:{backgroundId:'B29',backgroundVariant:'B29-1',poseId:'P01',poseVariant:'P01-1',hairId:'H00'}, kind:'background', msg:'', busy:false, watermarked:{}, catF:'', showAll:false };

function api(method, path, body){
  var h = {'Content-Type':'application/json'}; if(token) h.Authorization='Bearer '+token;
  return fetch(path,{method:method,headers:h,body:body?JSON.stringify(body):undefined}).then(function(r){
    return r.json().catch(function(){return {};}).then(function(j){ if(!r.ok){ var e=new Error(j.error||('HTTP '+r.status)); e.code=j.error; e.status=r.status; throw e;} return j; });
  });
}
function errText(e){ if(e&&e.code==='BAD_KEY') return T('bad'); if(e&&e.code==='TOO_MANY') return T('busy'); if(e&&e.code==='LIMIT') return T('limit'); if(e&&(e.code==='PHOTO_BAD'||e.code==='PHOTO_CHECKING')) return T(e.code); return (e&&e.message)||T('err'); }
function setLang(l){ lang=l; localStorage.setItem('ap_lang',l); document.documentElement.dir=(l==='ar'?'rtl':'ltr'); document.documentElement.lang=l; render(); }
function langBar(){ return '<span class="lang">'+['zh','en','ar'].map(function(l){return '<button data-l="'+l+'" class="'+(l===lang?'on':'')+'">'+(l==='en'?'EN':l==='ar'?'ع':'中')+'</button>';}).join('')+'</span>'; }

function boot(){
  document.documentElement.dir=(lang==='ar'?'rtl':'ltr');
  api('GET','/api/info').then(function(i){ S.info=i; if(token){ return loadAll().catch(function(e){ if(e.status===401){ token=''; localStorage.removeItem('ap_token'); } render(); }); } render(); })
  .catch(function(e){ S.msg=errText(e); render(); });
}
function loadAll(){ return Promise.all([api('GET','/api/catalog'),api('GET','/api/me')]).then(function(r){ S.cat=r[0]; S.me=r[1]; render(); poll(); }); }
var pollTimer=null;
function poll(){ clearTimeout(pollTimer); var pending=S.me && (S.me.tryons.some(function(t){return t.status==='queued'||t.status==='running';}) || (S.me.customer.hasPhoto && !S.me.customer.photoCheck));
  if(pending) pollTimer=setTimeout(function(){ api('GET','/api/me').then(function(m){ S.me=m; render(); poll(); }).catch(function(){ poll(); }); },2500); }

function render(){
  var app=document.getElementById('app'); var bar=document.getElementById('bar');
  var head='<header><h1>'+esc((S.info&&S.info.storeName)||T('title'))+'</h1>'+langBar()+'</header>';
  if(!token || !S.me){ bar.classList.add('hidden');
    app.innerHTML=head+'<div class="card"><h2>'+T('welcome')+'</h2>'+
      (S.msg?'<p class="note bad">'+esc(S.msg)+'</p>':'')+
      '<p><input type="text" id="nick" maxlength="20" placeholder="'+T('nick')+'" /></p>'+
      '<label class="chk"><input type="checkbox" id="agree" /><span>'+esc(T('consent',{d:(S.info&&S.info.retentionDays)||7}))+'</span></label>'+
      '<p><button class="btn pri block" id="startBtn">'+T('start')+'</button></p></div>';
    bindCommon(); document.getElementById('startBtn').onclick=join; return; }
  var c=S.me.customer, cat=S.cat||{garments:[],options:[]};
  var html=head;
  if(S.msg) html+='<p class="note bad">'+esc(S.msg)+'</p>';
  // ① 照片
  html+='<div class="card"><h2><span class="no'+(c.hasPhoto?' ok':'')+'">'+(c.hasPhoto?'✓':'1')+'</span>'+T('s1')+'</h2><div class="photo">'+
    (c.hasPhoto?'<img src="/img/me?t='+encodeURIComponent(token)+'&v='+esc(c.photoVersion)+'" alt="" />':'')+
    '<div style="flex:1"><button class="btn'+(c.hasPhoto?'':' pri')+'" id="takeBtn">'+(c.hasPhoto?T('retake'):T('take'))+'</button><p class="muted">'+T('tip')+'</p></div></div>';
  if(c.hasPhoto && !c.photoCheck) html+='<p class="muted">'+T('checking')+'</p>';
  if(c.photoCheck && !c.photoCheck.ok) html+='<p class="note bad">'+T('photoBad')+esc(c.photoCheck.issues.join('；'))+'</p>';
  html+='<div class="row" style="margin-top:8px"><input type="number" id="h" placeholder="'+T('height')+'" value="'+esc(c.heightCm||'')+'" /><input type="number" id="w" placeholder="'+T('weight')+'" value="'+esc(c.weightKg||'')+'" /><button class="btn" id="bodyBtn" style="flex:0 0 auto">'+T('save')+'</button></div></div>';
  // ② 衣服
  var cats=[]; cat.garments.forEach(function(g){ if(g.category && cats.indexOf(g.category)<0) cats.push(g.category); });
  html+='<div class="card"><h2><span class="no'+(S.picked.length?' ok':'')+'">'+(S.picked.length?'✓':'2')+'</span>'+T('s2')+' <span class="muted">'+T('pick')+'</span></h2>'+
    (cats.length>1?'<div class="chips">'+['' ].concat(cats).map(function(k){return '<button class="chip sub'+(S.catF===k?' on':'')+'" data-cf="'+esc(k)+'">'+esc(k||T('all'))+'</button>';}).join('')+'</div>':'')+
    '<div class="grid">'+
    cat.garments.filter(function(g){ return !S.catF || g.category===S.catF || S.picked.indexOf(g.id)>=0; }).map(function(g){ return '<div class="g'+(S.picked.indexOf(g.id)>=0?' on':'')+'" data-g="'+g.id+'"><img loading="lazy" src="/img/g/'+g.id+'?t='+encodeURIComponent(token)+'" alt="" /><div class="t"><b>'+esc(g.name)+'</b>'+(g.price?'¥'+esc(g.price):'')+'</div></div>'; }).join('')+'</div></div>';
  // ③ 造型
  var kinds=[['background',T('bg')],['pose',T('pose')],['hair',T('hair')]];
  html+='<div class="card"><h2><span class="no ok">✓</span>'+T('s3')+'</h2>';
  var firstPicked=cat.garments.filter(function(g){return S.picked.indexOf(g.id)>=0;})[0];
  if(firstPicked && firstPicked.recommended) html+='<button class="btn link" id="recBtn">★ '+T('rec')+'</button>';
  html+='<div class="tabs">'+kinds.map(function(k){return '<button data-k="'+k[0]+'" class="'+(S.kind===k[0]?'on':'')+'">'+k[1]+' · '+esc(optLabel(S.choice[k[0]==='background'?'backgroundId':k[0]==='pose'?'poseId':'hairId']))+'</button>';}).join('')+'</div>';
  var key=S.kind==='background'?'backgroundId':S.kind==='pose'?'poseId':'hairId', vkey=key.replace('Id','Variant');
  var aud=(firstPicked && !S.showAll)?firstPicked.audience:null;
  var opts=cat.options.filter(function(o){return o.kind===S.kind && (!aud || o.audience.indexOf(aud)>=0);});
  var groups=[]; opts.forEach(function(o){ if(groups.indexOf(o.group)<0) groups.push(o.group); });
  var thumbs=cat.thumbs||[];
  groups.forEach(function(g){ html+='<div class="kind">'+esc(g)+'</div><div class="chips">'+opts.filter(function(o){return o.group===g;}).map(function(o){
    var th=thumbs.indexOf(o.id)>=0?'<img class="th" loading="lazy" src="/img/o/'+o.id+'?t='+encodeURIComponent(token)+'" alt="" />':'';
    return '<button class="chip'+(th?' tc':'')+(S.choice[key]===o.id?' on':'')+'" data-o="'+o.id+'">'+th+esc(o.label)+'</button>';}).join('')+'</div>'; });
  if(S.kind==='hair' && firstPicked) html+='<button class="btn link" id="allBtn">'+(S.showAll?T('onlyFit'):T('showAll'))+'</button>';
  var cur=cat.options.filter(function(o){return o.id===S.choice[key];})[0];
  if(cur && cur.variants.length){ html+='<div class="kind">'+esc(cur.label)+(cur.detail?' · <span class="muted">'+esc(cur.detail)+'</span>':'')+'</div><div class="chips">'+cur.variants.map(function(v){return '<button class="chip sub'+(S.choice[vkey]===v.id?' on':'')+'" data-v="'+v.id+'">'+esc(v.label)+'</button>';}).join('')+'</div>'; }
  if(cur && cur.needsUpload) html+='<button class="btn" id="bgBtn">'+(S.me.customer.hasBackground?'✓ '+T('bgok'):T('upbg'))+'</button>';
  html+='</div>';
  // ④ 结果
  html+='<div class="card"><h2><span class="no">4</span>'+T('s4')+'</h2>';
  if(!S.me.tryons.length) html+='<p class="muted">'+T('none')+'</p>';
  S.me.tryons.forEach(function(t){
    var g=cat.garments.filter(function(x){return x.id===t.garmentId;})[0];
    html+='<div class="res">';
    if(t.status==='done') html+='<img data-wm="'+t.id+'" src="'+(S.watermarked[t.id]||('/img/t/'+t.id+'?t='+encodeURIComponent(token)))+'" alt="" />';
    else if(t.status==='failed') html+='<div class="ph"><span>'+T('failed')+'</span><span class="muted" style="padding:0 16px;text-align:center">'+esc(t.error||'')+'</span></div>';
    else html+='<div class="ph"><div class="spin"></div><span>'+(t.status==='queued'?T('queued'):T('running'))+'</span></div>';
    html+='<div class="meta"><span><b>'+esc(g?g.name:'')+'</b> · '+esc(optLabel(t.choice.backgroundId))+' · '+esc(optLabel(t.choice.poseId))+' · '+esc(optLabel(t.choice.hairId))+'</span>';
    if(t.status==='done'){
      html+='<span class="muted">'+T('savehint')+'</span>';
      if(t.wantVisit) html+='<div class="note '+(t.codeValid?'ok':'warn')+' center"><div class="muted">'+T('code')+' · '+(t.codeValid?T('validToday'):T('expired'))+'</div><div class="code">'+esc(t.code)+'</div><img class="qr" src="/img/code/'+t.id+'?t='+encodeURIComponent(token)+'" alt="" />'+(t.size?'<div>'+T('size')+'：<b>'+esc(t.size)+'</b></div>':'')+'<div>'+T('showCode')+'</div></div>';
      else html+='<button class="btn pri block" data-want="'+t.id+'">'+T('want')+'</button>';
    }
    html+='</div></div>';
  });
  html+='</div><p class="center"><button class="btn link" id="delBtn">'+T('del')+'</button></p>';
  app.innerHTML=html;
  // 底栏：生成
  bar.classList.remove('hidden');
  var left=Math.max(0,(S.cat?S.cat.dailyLimit:0)-(S.me?S.me.usedToday:0));
  document.getElementById('barText').textContent=!c.hasPhoto?T('needPhoto'):(c.photoCheck&&!c.photoCheck.ok)?T('PHOTO_BAD'):!c.photoCheck?T('checking'):!S.picked.length?T('needGarment'):T('left',{n:left});
  var go=document.getElementById('goBtn'); go.textContent=T('gen'); go.disabled=S.busy||!c.hasPhoto||!S.picked.length||left<=0||(c.photoCheck&&!c.photoCheck.ok); go.onclick=generate;
  bindCommon(); bindMain(); watermarkAll();
}
function optLabel(id){ var o=(S.cat&&S.cat.options||[]).filter(function(x){return x.id===id;})[0]; return o?o.label:''; }
function bindCommon(){ Array.prototype.forEach.call(document.querySelectorAll('.lang button'),function(b){ b.onclick=function(){ setLang(b.getAttribute('data-l')); }; }); }
function bindMain(){
  var q=function(id){return document.getElementById(id);};
  q('takeBtn').onclick=function(){ q('filePhoto').value=''; q('filePhoto').click(); };
  q('bodyBtn').onclick=function(){ api('POST','/api/profile',{heightCm:Number(q('h').value)||null,weightKg:Number(q('w').value)||null}).then(function(m){ S.me=m; render(); }).catch(function(e){ S.msg=errText(e); render(); }); };
  Array.prototype.forEach.call(document.querySelectorAll('[data-g]'),function(el){ el.onclick=function(){ var id=el.getAttribute('data-g'); var i=S.picked.indexOf(id); if(i>=0) S.picked.splice(i,1); else if(S.picked.length<4) S.picked.push(id); render(); }; });
  Array.prototype.forEach.call(document.querySelectorAll('.tabs button'),function(el){ el.onclick=function(){ S.kind=el.getAttribute('data-k'); render(); }; });
  var key=S.kind==='background'?'backgroundId':S.kind==='pose'?'poseId':'hairId', vkey=key.replace('Id','Variant');
  Array.prototype.forEach.call(document.querySelectorAll('[data-o]'),function(el){ el.onclick=function(){ S.choice[key]=el.getAttribute('data-o'); delete S.choice[vkey]; render(); }; });
  Array.prototype.forEach.call(document.querySelectorAll('[data-v]'),function(el){ el.onclick=function(){ var v=el.getAttribute('data-v'); S.choice[vkey]=(S.choice[vkey]===v?undefined:v); render(); }; });
  Array.prototype.forEach.call(document.querySelectorAll('[data-cf]'),function(el){ el.onclick=function(){ S.catF=el.getAttribute('data-cf'); render(); }; });
  var ab=q('allBtn'); if(ab) ab.onclick=function(){ S.showAll=!S.showAll; render(); };
  var rec=q('recBtn'); if(rec) rec.onclick=function(){ var g=S.cat.garments.filter(function(x){return S.picked.indexOf(x.id)>=0;})[0]; if(g&&g.recommended){ S.choice=Object.assign({},g.recommended); render(); } };
  var bg=q('bgBtn'); if(bg) bg.onclick=function(){ q('fileBg').value=''; q('fileBg').click(); };
  Array.prototype.forEach.call(document.querySelectorAll('[data-want]'),function(el){ el.onclick=function(){ api('POST','/api/want',{tryonId:el.getAttribute('data-want')}).then(function(m){ S.me=m; render(); }).catch(function(e){ S.msg=errText(e); render(); }); }; });
  q('delBtn').onclick=function(){ if(!confirm(T('delq'))) return; api('POST','/api/delete-me',{}).then(function(){ token=''; localStorage.removeItem('ap_token'); S.me=null; S.msg=''; document.getElementById('bar').classList.add('hidden'); document.getElementById('app').innerHTML='<div class="card center" style="margin-top:60px"><h2 style="justify-content:center">'+T('delok')+'</h2></div>'; }).catch(function(e){ S.msg=errText(e); render(); }); };
}
function join(){
  if(!document.getElementById('agree').checked){ document.getElementById('agree').focus(); return; }
  api('POST','/api/session',{k:storeKey,nickname:document.getElementById('nick').value,consent:true}).then(function(r){ token=r.token; localStorage.setItem('ap_token',token); S.msg=''; return loadAll(); }).catch(function(e){ S.msg=errText(e); render(); });
}
function compress(file){ return new Promise(function(res,rej){ var fr=new FileReader(); fr.onerror=rej; fr.onload=function(){ var img=new Image(); img.onerror=rej; img.onload=function(){ var max=1280, s=Math.min(1,max/Math.max(img.width,img.height)); var cv=document.createElement('canvas'); cv.width=Math.round(img.width*s); cv.height=Math.round(img.height*s); cv.getContext('2d').drawImage(img,0,0,cv.width,cv.height); res(cv.toDataURL('image/jpeg',0.86)); }; img.src=fr.result; }; fr.readAsDataURL(file); }); }
function upload(kind,input){ var f=input.files&&input.files[0]; if(!f) return; S.busy=true; render(); compress(f).then(function(d){ return api('POST','/api/photo',{kind:kind,dataUrl:d}); }).then(function(m){ S.me=m; S.busy=false; S.msg=''; if(kind==='background') S.choice.customBackground=true; render(); poll(); }).catch(function(e){ S.busy=false; S.msg=errText(e); render(); }); }
document.getElementById('filePhoto').onchange=function(){ upload('photo',this); };
document.getElementById('fileBg').onchange=function(){ upload('background',this); };
function generate(){ S.busy=true; render(); api('POST','/api/tryon',{garmentIds:S.picked,choice:S.choice}).then(function(m){ S.me=m; S.busy=false; S.msg=''; render(); poll(); window.scrollTo({top:document.body.scrollHeight,behavior:'smooth'}); }).catch(function(e){ S.busy=false; S.msg=errText(e); render(); }); }
// 水印：门店名 + 试穿码画进图里，长按保存下来的就是带码的图
function watermarkAll(){ if(!S.cat||!S.cat.watermark) return; Array.prototype.forEach.call(document.querySelectorAll('img[data-wm]'),function(el){ var id=el.getAttribute('data-wm'); if(S.watermarked[id]) return; var t=S.me.tryons.filter(function(x){return x.id===id;})[0]; if(!t) return;
  var img=new Image(); img.onload=function(){ var cv=document.createElement('canvas'); cv.width=img.width; cv.height=img.height; var g=cv.getContext('2d'); g.drawImage(img,0,0); var fs=Math.max(14,Math.round(img.width/32)); g.font='700 '+fs+'px -apple-system,"PingFang SC",sans-serif'; var text=(S.info.storeName||'')+' · '+T('code')+' '+t.code; var w=g.measureText(text).width+fs*1.2, h=fs*1.9, x=img.width-w-fs*0.8, y=img.height-h-fs*0.8; g.fillStyle='rgba(0,0,0,.45)'; g.beginPath(); if(g.roundRect) g.roundRect(x,y,w,h,h/2); else g.rect(x,y,w,h); g.fill(); g.fillStyle='#fff'; g.textBaseline='middle'; g.fillText(text,x+fs*0.6,y+h/2); try{ S.watermarked[id]=cv.toDataURL('image/jpeg',0.9); el.src=S.watermarked[id]; }catch(e){} }; img.src='/img/t/'+id+'?t='+encodeURIComponent(token); }); }
boot();
</script>
</body>
</html>`;
