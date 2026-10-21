/**
 * 古兰经教学平台 · 学生端单页（服务端直出，学生手机扫码即用）。
 *
 * 与 AI 学习中心的学生页同一套路数：原生 JS + fetch，无框架无构建，整页内联，
 * 由 lanServer 构造期 gzip 一次 + ETag 走 304。**不做成 Vue 页面**是有原因的：
 * 学生设备五花八门（老安卓、校园平板），一个不依赖打包产物、首屏几十 KB 的静态页最稳。
 *
 * 交互照搬那边的「翻页课件」：把内容摊成一串 slide，一屏一页、底部上一页/下一页、
 * 顶部一条进度条。手机上一屏塞不下整章经文，长列表滚到一半就不知道自己在哪；
 * 分页之后每页只讲一件事，学生跟得住，老师也好在投屏上带着走。
 *
 * 页序：封面 → 课程（教学目标与课时安排）→ 每个单元一页（含该单元经文）→ 词汇 →
 *       **题目在最后**（一题一页）→ 成绩与解析。先学完再做题是课堂的自然顺序。
 *
 * 另外整页带一个「问一问」浮标：学生随时能就本课提问，答案严格锚定教师批准过的资料
 * （/api/ask → store.studentAsk），检索不到就明说超出范围，不让模型自由发挥。
 *
 * 观感上刻意做足了：渐变极光背景、毛玻璃卡片、翻页方向感知的进场动画、逐条错落入场、
 * 成绩环形进度 + 数字滚动。这是要投在教室大屏、也要拿在学生手里的东西，糙了没人爱用。
 * 所有动画都在 `prefers-reduced-motion: reduce` 下自动关掉。
 *
 * 三语按 `?lang=` 或教师下发的语言走；阿语整页 RTL（说明书验收 13 要的就是这个）。
 */
export const QURAN_STUDENT_PAGE_HTML = `<!DOCTYPE html>
<html lang="zh"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#0b1020">
<title>古兰经教学 · 学生端</title>
<style>
:root{
  --bg:#f4f6fc;--bg2:#e9ecfa;--card:rgba(255,255,255,.78);--cardSolid:#fff;
  --ink:#151a27;--ink2:#4b5364;--ink3:#7b8497;--line:rgba(21,26,39,.10);
  --brand:#5b5bd6;--brand2:#22a6b3;--gold:#c8912f;--ok:#16a34a;--bad:#dc2626;
  --shadow:0 18px 48px -24px rgba(24,28,64,.45),0 2px 8px -2px rgba(24,28,64,.10);
  --ease:cubic-bezier(.22,1,.36,1);
}
@media(prefers-color-scheme:dark){:root{
  --bg:#0b1020;--bg2:#131a33;--card:rgba(28,33,54,.72);--cardSolid:#1b2136;
  --ink:#eef1f8;--ink2:#b6bdd0;--ink3:#8a93ac;--line:rgba(255,255,255,.10);
  --brand:#8b8bf0;--brand2:#3ed0dd;--gold:#e0b45f;
  --shadow:0 20px 56px -26px rgba(0,0,0,.8),0 2px 10px -3px rgba(0,0,0,.5);
}}
*{box-sizing:border-box}
/* 横向溢出裁在 html 上，不要写在 body 上：给 body 设 overflow-x 会把另一根轴算成 auto，
   body 就变成滚动容器，底栏的 position:sticky 随即失效（实测长页面上按钮被内容顶下去了） */
html{overflow-x:hidden}
body{margin:0;background:var(--bg);color:var(--ink);
  font:16px/1.65 -apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,"Noto Sans SC","Noto Sans Arabic",sans-serif;
  padding:env(safe-area-inset-top) 0 calc(env(safe-area-inset-bottom) + 8px)}
/* 极光背景：两团缓慢漂移的光斑，成本只有两个 blur 的合成层 */
.aur{position:fixed;inset:-25vmax;z-index:-1;pointer-events:none;filter:blur(70px);opacity:.55}
.aur i{position:absolute;display:block;border-radius:50%}
.aur i:nth-child(1){width:52vmax;height:52vmax;left:2%;top:0;background:radial-gradient(circle,var(--brand),transparent 66%);animation:drift1 26s var(--ease) infinite alternate}
.aur i:nth-child(2){width:44vmax;height:44vmax;right:0;top:28%;background:radial-gradient(circle,var(--brand2),transparent 66%);animation:drift2 32s var(--ease) infinite alternate}
.aur i:nth-child(3){width:40vmax;height:40vmax;left:22%;bottom:0;background:radial-gradient(circle,var(--gold),transparent 68%);opacity:.6;animation:drift1 38s var(--ease) infinite alternate-reverse}
@keyframes drift1{from{transform:translate3d(0,0,0) scale(1)}to{transform:translate3d(9vmax,7vmax,0) scale(1.14)}}
@keyframes drift2{from{transform:translate3d(0,0,0) scale(1.05)}to{transform:translate3d(-11vmax,-6vmax,0) scale(.92)}}

.wrap{max-width:760px;margin:0 auto;padding:14px 16px 20px;min-height:100vh;display:flex;flex-direction:column}
.card{background:var(--card);border:1px solid var(--line);border-radius:20px;padding:18px;margin-bottom:12px;
  backdrop-filter:blur(18px) saturate(1.5);-webkit-backdrop-filter:blur(18px) saturate(1.5);box-shadow:var(--shadow)}
h1{font-size:23px;line-height:1.35;margin:0 0 6px;letter-spacing:-.01em}
h2{font-size:17px;margin:0 0 10px;letter-spacing:-.005em}
.sub{color:var(--ink3);font-size:13.5px;margin:0 0 14px}
.kicker{font-size:11.5px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;margin-bottom:8px;
  background:linear-gradient(90deg,var(--brand),var(--brand2));-webkit-background-clip:text;background-clip:text;color:transparent}
label{display:block;font-size:13px;color:var(--ink3);margin:14px 0 6px;font-weight:600}
input,select{width:100%;padding:13px 14px;border:1px solid var(--line);border-radius:14px;background:var(--cardSolid);
  color:var(--ink);font-size:16px;transition:border-color .2s,box-shadow .2s;appearance:none}
input:focus,select:focus{outline:0;border-color:var(--brand);box-shadow:0 0 0 4px color-mix(in srgb,var(--brand) 18%,transparent)}
#code{letter-spacing:.32em;font-weight:700;text-align:center;font-size:20px}
.btn{width:100%;padding:14px;border:0;border-radius:14px;color:#fff;font-size:16px;font-weight:700;cursor:pointer;
  background:linear-gradient(120deg,var(--brand),var(--brand2));box-shadow:0 10px 24px -12px var(--brand);
  transition:transform .16s var(--ease),box-shadow .2s,opacity .2s;position:relative;overflow:hidden}
.btn:active{transform:scale(.975)}
.btn:disabled{opacity:.45;cursor:default;transform:none}
.btn.ghost{background:transparent;color:var(--brand);border:1px solid var(--line);box-shadow:none;font-weight:600}
/* 主按钮上一道缓慢扫过的高光，静止页面也有生气 */
.btn.pri::after{content:"";position:absolute;inset:0;background:linear-gradient(105deg,transparent 38%,rgba(255,255,255,.34) 50%,transparent 62%);
  transform:translateX(-120%);animation:sheen 3.6s ease-in-out infinite}
@keyframes sheen{0%,62%{transform:translateX(-120%)}88%,100%{transform:translateX(120%)}}
.err{color:var(--bad);font-size:13px;margin-top:10px;min-height:18px;transition:opacity .2s}
.err:not(:empty){animation:shake .42s var(--ease)}
@keyframes shake{0%,100%{transform:translateX(0)}22%{transform:translateX(-7px)}44%{transform:translateX(6px)}68%{transform:translateX(-3px)}}

/* ── 顶部：范围胶囊 + 进度条 ── */
.top{display:flex;align-items:center;gap:10px;margin-bottom:9px;font-size:12.5px;color:var(--ink3)}
.top .grow{flex:1}
.pill{display:inline-flex;align-items:center;gap:6px;padding:4px 11px;border-radius:999px;font-weight:700;font-size:12px;
  background:color-mix(in srgb,var(--brand) 13%,transparent);color:var(--brand);border:1px solid color-mix(in srgb,var(--brand) 22%,transparent)}
.bar{height:5px;border-radius:999px;background:color-mix(in srgb,var(--ink) 9%,transparent);overflow:hidden;margin-bottom:14px}
.bar i{display:block;height:100%;border-radius:999px;background:linear-gradient(90deg,var(--brand),var(--brand2));
  transition:width .55s var(--ease);box-shadow:0 0 12px -2px var(--brand)}

/* ── 翻页动画：方向感知 ── */
.slide{animation:inFwd .44s var(--ease) both}
.back .slide{animation-name:inBack}
@keyframes inFwd{from{opacity:0;transform:translate3d(34px,10px,0) scale(.985)}to{opacity:1;transform:none}}
@keyframes inBack{from{opacity:0;transform:translate3d(-34px,10px,0) scale(.985)}to{opacity:1;transform:none}}
/* 逐条错落入场：给子项设 --i，延迟跟着序号走 */
.stg{opacity:0;animation:rise .5s var(--ease) both;animation-delay:calc(var(--i,0) * 65ms + 90ms)}
@keyframes rise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}

/* ── 经文 ── */
.verse{font-size:13px;color:var(--ink3);margin-top:6px}
.ayah{border:1px solid var(--line);border-radius:16px;padding:14px 16px;margin-bottom:10px;
  background:linear-gradient(135deg,color-mix(in srgb,var(--gold) 9%,transparent),transparent 62%);position:relative;overflow:hidden}
.ayah::before{content:"";position:absolute;inset-inline-start:0;top:12%;bottom:12%;width:3px;border-radius:999px;
  background:linear-gradient(180deg,var(--gold),transparent)}
.ayah .ref{font-size:11.5px;font-weight:800;letter-spacing:.08em;color:var(--gold);margin-bottom:8px}
.ar{font-size:23px;line-height:2.25;direction:rtl;text-align:right;font-family:"Noto Naskh Arabic","Amiri","Geeza Pro","Segoe UI",serif}

/* ── 目标 / 课时 ── */
.li{display:flex;gap:11px;align-items:flex-start;padding:11px 13px;border:1px solid var(--line);border-radius:14px;margin-bottom:8px;background:var(--cardSolid)}
.li .no{flex:0 0 auto;width:22px;height:22px;border-radius:50%;font-size:11.5px;font-weight:800;display:grid;place-items:center;
  background:color-mix(in srgb,var(--brand) 15%,transparent);color:var(--brand);margin-top:2px}
.sess{border:1px solid var(--line);border-radius:14px;padding:12px 14px;margin-bottom:8px;background:var(--cardSolid)}
.sess b{display:block;margin-bottom:4px}

/* ── 词汇 ── */
.vocab{display:grid;grid-template-columns:1fr 1fr;gap:9px}
.vocab .w{border:1px solid var(--line);border-radius:14px;padding:11px 13px;background:var(--cardSolid);transition:transform .2s var(--ease)}
.vocab .w:active{transform:scale(.97)}
.vocab .w b{display:block;font-size:21px;direction:rtl;text-align:right;font-family:"Noto Naskh Arabic","Amiri","Geeza Pro",serif;color:var(--gold)}
@media(max-width:430px){.vocab{grid-template-columns:1fr}}

/* ── 题目 ── */
/* 题干里常有「中文问法 + 换行 + 阿拉伯原文」两行：换行要保住，
   每行的书写方向按该行首个强方向字符自己定（plaintext），否则阿语会被中文那行拽成 LTR */
.stem{font-size:18px;font-weight:700;line-height:1.7;margin:0 0 14px;white-space:pre-wrap;unicode-bidi:plaintext}
.opt{display:flex;gap:11px;align-items:center;width:100%;text-align:start;padding:13px 15px;margin:0 0 9px;
  border:1.5px solid var(--line);border-radius:14px;background:var(--cardSolid);color:var(--ink);font-size:15.5px;font-weight:500;
  cursor:pointer;transition:transform .16s var(--ease),border-color .2s,background .2s,box-shadow .2s}
.opt:active{transform:scale(.985)}
.opt .ar{font-size:20px;line-height:1.9;flex:1}
.opt .k{flex:0 0 auto;width:26px;height:26px;border-radius:9px;display:grid;place-items:center;font-size:12.5px;font-weight:800;
  background:color-mix(in srgb,var(--ink) 7%,transparent);color:var(--ink3);transition:all .2s var(--ease)}
.opt.on{border-color:var(--brand);background:color-mix(in srgb,var(--brand) 9%,transparent);box-shadow:0 10px 24px -16px var(--brand)}
.opt.on .k{background:linear-gradient(120deg,var(--brand),var(--brand2));color:#fff;transform:scale(1.08);animation:pop .3s var(--ease)}
@keyframes pop{0%{transform:scale(.7)}60%{transform:scale(1.2)}100%{transform:scale(1.08)}}

/* ── 排序题 ── */
.seq{display:flex;align-items:center;gap:9px}
.seq .ord{flex:0 0 auto;width:26px;height:26px;border-radius:9px;display:grid;place-items:center;font-size:12.5px;font-weight:800;
  background:color-mix(in srgb,var(--ink) 7%,transparent);color:var(--ink3);transition:all .2s var(--ease)}
.opt.on .ord{background:linear-gradient(120deg,var(--brand),var(--brand2));color:#fff;animation:pop .3s var(--ease)}

/* ── 配对题 ── */
.pair{border:1px solid var(--line);border-radius:14px;padding:11px 13px;margin-bottom:9px;background:var(--cardSolid);transition:border-color .25s,box-shadow .25s}
/* 冲突行：这个释义已经配给它了 —— 闪一下帮学生找到该去哪儿取消 */
.pair.released{border-color:var(--gold);box-shadow:0 0 0 3px color-mix(in srgb,var(--gold) 22%,transparent);animation:flash .9s var(--ease)}
@keyframes flash{0%,100%{box-shadow:0 0 0 3px color-mix(in srgb,var(--gold) 22%,transparent)}50%{box-shadow:0 0 0 7px color-mix(in srgb,var(--gold) 34%,transparent)}}
.pair .lw{font-size:21px;line-height:2;direction:rtl;text-align:right;font-family:"Noto Naskh Arabic","Amiri","Geeza Pro",serif;color:var(--gold);margin-bottom:9px}
/* 整节经文做左列时（跨节理解那种）字号收一档，不然一屏连两组都放不下 */
.pair .lw.long{font-size:17px;line-height:1.95}
.chips{display:flex;flex-wrap:wrap;gap:7px}
.chip{padding:7px 12px;border-radius:999px;border:1.5px solid var(--line);background:transparent;color:var(--ink2);
  font-size:13.5px;font-weight:600;cursor:pointer;transition:all .18s var(--ease)}
.chip:active{transform:scale(.94)}
.chip.ar{font-size:17px;line-height:1.9;font-family:"Noto Naskh Arabic","Amiri","Geeza Pro",serif}
.chip.on{border-color:var(--brand);background:linear-gradient(120deg,var(--brand),var(--brand2));color:#fff;animation:pop .3s var(--ease)}

/* ── 成绩 ── */
.ring{display:block;margin:6px auto 4px;transform:rotate(-90deg)}
.ring circle{fill:none;stroke-width:11;stroke-linecap:round}
.ring .bgc{stroke:color-mix(in srgb,var(--ink) 10%,transparent)}
.ring .fg{stroke:url(#g1);transition:stroke-dashoffset 1.1s var(--ease)}
.scoreWrap{position:relative;text-align:center}
.scoreNum{position:absolute;inset:0;display:grid;place-content:center;font-size:40px;font-weight:800;letter-spacing:-.02em}
.scoreNum small{display:block;font-size:12px;font-weight:600;color:var(--ink3);letter-spacing:.06em}
.scoreNum .pctRow{display:flex;align-items:baseline;justify-content:center;gap:1px;direction:ltr}
.scoreNum .pctSign{font-size:17px;font-weight:700;font-style:normal;color:var(--ink3)}
.tag{display:inline-flex;gap:5px;align-items:center;padding:4px 12px;border-radius:999px;font-size:12.5px;font-weight:700;
  background:color-mix(in srgb,var(--brand) 13%,transparent);color:var(--brand)}
.tag.ok{background:color-mix(in srgb,var(--ok) 15%,transparent);color:var(--ok)}
.wrongItem{border-inline-start:3px solid var(--bad);padding:2px 0 2px 12px;margin-bottom:12px}
[dir=rtl] .wrongItem{padding:2px 12px 2px 0}

/* ── 底部导航 ── */
.nav{display:flex;gap:10px;align-items:center;margin-top:auto;position:sticky;bottom:0;z-index:20;
  padding:14px 0 calc(env(safe-area-inset-bottom) + 6px);
  /* 底栏是 sticky 的，长页面（错题解析）会从按钮底下透出来 —— 垫一层由透明渐到底色的背景 */
  background:linear-gradient(180deg,transparent,var(--bg) 42%)}
.nav .btn{flex:1 1 0;margin:0}

/* ── 问一问 ── */
.qa{position:fixed;inset-inline-end:16px;bottom:calc(env(safe-area-inset-bottom) + 84px);z-index:60;
  display:flex;flex-direction:column;align-items:flex-end;gap:10px}
.fab{width:56px;height:56px;border-radius:50%;border:0;cursor:pointer;font-size:24px;color:#fff;
  background:linear-gradient(135deg,var(--brand),var(--brand2));box-shadow:0 14px 30px -12px var(--brand);
  transition:transform .2s var(--ease)}
.fab:active{transform:scale(.9)}
.fab::after{content:"";position:absolute;inset:0;border-radius:50%;box-shadow:0 0 0 0 color-mix(in srgb,var(--brand) 50%,transparent);
  animation:ping 2.6s ease-out infinite;pointer-events:none}
@keyframes ping{0%{box-shadow:0 0 0 0 color-mix(in srgb,var(--brand) 45%,transparent)}70%,100%{box-shadow:0 0 0 18px transparent}}
.qaPanel{width:min(370px,86vw);background:var(--card);border:1px solid var(--line);border-radius:18px;padding:14px;
  backdrop-filter:blur(20px) saturate(1.5);-webkit-backdrop-filter:blur(20px) saturate(1.5);box-shadow:var(--shadow);
  animation:panelUp .34s var(--ease) both}
@keyframes panelUp{from{opacity:0;transform:translateY(16px) scale(.96)}to{opacity:1;transform:none}}
.qaHead{display:flex;align-items:center;justify-content:space-between;gap:8px}
.qaX{border:0;background:none;font-size:22px;line-height:1;color:var(--ink3);cursor:pointer;padding:0 2px}
.qaTip{font-size:11.5px;color:var(--ink3);margin:2px 0 9px}
.qaAns{min-height:22px;max-height:230px;overflow-y:auto;font-size:14px;line-height:1.7;white-space:pre-wrap;
  background:color-mix(in srgb,var(--ink) 4%,transparent);border-radius:12px;padding:10px 12px;margin-bottom:9px}
.qaSrc{font-size:11.5px;color:var(--ink3);margin-top:7px}
.qaIn{display:flex;gap:8px}
.qaIn input{flex:1;padding:11px 12px;font-size:15px}
.qaIn .btn{flex:0 0 auto;width:auto;padding:11px 16px;font-size:14px}
.dots i{display:inline-block;width:6px;height:6px;margin-inline-end:4px;border-radius:50%;background:var(--brand);animation:blink 1.1s infinite}
.dots i:nth-child(2){animation-delay:.16s}.dots i:nth-child(3){animation-delay:.32s}
@keyframes blink{0%,80%,100%{opacity:.25;transform:translateY(0)}40%{opacity:1;transform:translateY(-3px)}}

.loading{display:grid;place-items:center;min-height:42vh;gap:14px}
.spin{width:38px;height:38px;border-radius:50%;border:3px solid var(--line);border-top-color:var(--brand);animation:spin .85s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}

@media(prefers-reduced-motion:reduce){
  *,*::before,*::after{animation-duration:.001ms!important;animation-iteration-count:1!important;transition-duration:.001ms!important}
  .stg{opacity:1}
}
</style></head>
<body>
<div class="aur" aria-hidden="true"><i></i><i></i><i></i></div>
<div class="wrap" id="app"></div>
<script>
(function(){
var T={
 zh:{title:'古兰经智能教学',hint:'输入老师给的班级码，选择你的名字开始。',code:'班级码',who:'我是',enter:'进入课堂',
     noPaper:'老师还没有下发试卷。',noLearn:'老师还没有准备这一课的内容，先等一下。',
     submit:'提交答卷',submitting:'提交中…',done:'已提交',score:'得分',right:'答对',of:'共',again:'重新作答',back:'退出',
     badCode:'班级码不对，请找老师确认。',taken:'这个名字已经有人在用了，换一个。',net:'网络不通，检查是否还连着教室的 Wi-Fi。',
     pick:'请选择你的名字',fill:'还有题没答，确认要提交吗？',src:'依据经文',
     cover:'本课内容',startLearn:'开始学习',prev:'上一页',next:'下一页',startEx:'开始做题',ex:'练习',
     goals:'教学目标',plan:'课时安排',min:'分钟',unit:'单元',vocab:'本课词汇',verses:'经文',lesson:'课程',
     pickOne:'先选一个答案再继续',orderTip:'按正确顺序依次点选',matchTip:'为每个词选出释义',matchUnitTip:'为每节经文选出它所属的单元',matchAnyTip:'把左右两列一一对上',reset:'重来',
     needOrder:'把所有项都排完再继续',needMatch:'还有词没配上',needMatchUnit:'还有经文没配上单元',needMatchAny:'还有没配上的',review:'错题解析',perfect:'全对，很棒！',keep:'再回去看看经文吧',
     ask:'问一问',askPh:'就本课内容提问…',send:'提问',asking:'思考中…',
     askTip:'只依据老师批准的资料作答。',askEmpty:'请输入问题',askErr:'暂时答不了，稍后再试',askTooMany:'提问太频繁，等一分钟',
     matchTaken:'这个释义已经配给「{w}」了。要改配到这里，请先到那一行点一下取消。',
     askNone:'这个问题超出了老师批准的资料范围，课后问问老师。',askSrc:'依据资料'},
 en:{title:'Quran Teaching',hint:'Enter the class code from your teacher and pick your name.',code:'Class code',who:'I am',enter:'Enter class',
     noPaper:'Your teacher has not released a paper yet.',noLearn:'Your teacher has not prepared this lesson yet.',
     submit:'Submit',submitting:'Submitting…',done:'Submitted',score:'Score',right:'Correct',of:'of',again:'Answer again',back:'Sign out',
     badCode:'Wrong class code — check with your teacher.',taken:'That name is already taken, pick another.',net:'No connection — check you are still on the classroom Wi-Fi.',
     pick:'Pick your name',fill:'Some questions are unanswered. Submit anyway?',src:'Source verses',
     cover:'In this lesson',startLearn:'Start learning',prev:'Back',next:'Next',startEx:'Start exercises',ex:'Exercise',
     goals:'Objectives',plan:'Sessions',min:'min',unit:'Unit',vocab:'Vocabulary',verses:'Verses',lesson:'Lesson',
     pickOne:'Pick an answer to continue',orderTip:'Tap them in the right order',matchTip:'Choose a meaning for each word',matchUnitTip:'Choose the unit each verse belongs to',matchAnyTip:'Pair up the two columns',reset:'Start over',
     needOrder:'Put every item in order first',needMatch:'Some words are still unmatched',needMatchUnit:'Some verses have no unit yet',needMatchAny:'Some items are still unmatched',review:'Review',perfect:'All correct. Excellent!',keep:'Go back over the verses',
     ask:'Ask',askPh:'Ask about this lesson…',send:'Ask',asking:'Thinking…',
     askTip:'Answers come only from teacher-approved materials.',askEmpty:'Please type a question',askErr:'Cannot answer right now, try again',askTooMany:'Too many questions, wait a minute',
     matchTaken:'That meaning is already paired with “{w}”. To move it here, tap it there first to release it.',
     askNone:'That is outside the approved materials — ask your teacher after class.',askSrc:'Sources'},
 ar:{title:'تعليم القرآن',hint:'أدخل رمز الصف من معلّمك واختر اسمك.',code:'رمز الصف',who:'أنا',enter:'دخول الصف',
     noPaper:'لم يُصدر معلّمك ورقة بعد.',noLearn:'لم يجهّز معلّمك هذا الدرس بعد.',
     submit:'إرسال',submitting:'جارٍ الإرسال…',done:'تم الإرسال',score:'الدرجة',right:'صحيح',of:'من',again:'إعادة الإجابة',back:'خروج',
     badCode:'رمز الصف غير صحيح — راجع معلّمك.',taken:'هذا الاسم مستخدم بالفعل، اختر غيره.',net:'لا يوجد اتصال — تأكد من بقائك على شبكة الصف.',
     pick:'اختر اسمك',fill:'بعض الأسئلة بلا إجابة. هل تريد الإرسال؟',src:'الآيات المرجعية',
     cover:'في هذا الدرس',startLearn:'ابدأ التعلّم',prev:'السابق',next:'التالي',startEx:'ابدأ التمارين',ex:'تمرين',
     goals:'الأهداف',plan:'الحصص',min:'دقيقة',unit:'وحدة',vocab:'المفردات',verses:'الآيات',lesson:'الدرس',
     pickOne:'اختر إجابة للمتابعة',orderTip:'اضغط عليها بالترتيب الصحيح',matchTip:'اختر معنى لكل كلمة',matchUnitTip:'اختر الوحدة التي تنتمي إليها كل آية',matchAnyTip:'طابِق بين العمودين',reset:'إعادة',
     needOrder:'رتّب كل العناصر أولاً',needMatch:'بعض الكلمات بلا مطابقة',needMatchUnit:'بعض الآيات بلا وحدة',needMatchAny:'بعض العناصر بلا مطابقة',review:'مراجعة',perfect:'كل الإجابات صحيحة. ممتاز!',keep:'راجع الآيات مرة أخرى',
     ask:'اسأل',askPh:'اسأل عن هذا الدرس…',send:'اسأل',asking:'يفكّر…',
     askTip:'الإجابات من المواد المعتمدة فقط.',askEmpty:'اكتب سؤالاً من فضلك',askErr:'تعذّر الرد الآن، حاول مجدداً',askTooMany:'أسئلة كثيرة، انتظر دقيقة',
     matchTaken:'هذا المعنى مقترن بالفعل بـ «{w}». لنقله إلى هنا، ألغِ اختياره هناك أولًا.',
     askNone:'هذا خارج المواد المعتمدة — اسأل معلّمك بعد الحصة.',askSrc:'المصادر'}};

var lang=(new URLSearchParams(location.search).get('lang')||'').slice(0,2);
if(!T[lang])lang=(navigator.language||'zh').slice(0,2);
if(!T[lang])lang='zh';
var t=T[lang];
function setDir(l){document.documentElement.lang=l;document.documentElement.dir=(l==='ar'?'rtl':'ltr');}
setDir(lang);

var app=document.getElementById('app');
var token=localStorage.getItem('qt_token')||'';
var deck=null;
var dirBack=false; // 本次渲染是不是「往回翻」，决定进场动画方向

var KEYS='ABCDEFGH';
/** 选项里是阿拉伯原文还是译文，决定用不用经文字体与右对齐 —— 同一张卷子两种都有 */
function hasAr(x){return /[\u0600-\u06FF]/.test(String(x==null?'':x));}
function optText(o){return '<span class="'+(hasAr(o)?'ar':'')+'">'+esc(o)+'</span>';}
/** 「4 / 18」这类分数必须钉成 LTR：阿语页面里双向算法会把它重排成「18 / 4」（实测） */
function frac(a,b){return '<span dir="ltr">'+esc(a)+' / '+esc(b)+'</span>';}
/** 中文用全角冒号，英/阿用半角 —— 阿语页面里混一个「：」很刺眼 */
function colon(){return lang==='zh'?'：':': ';}
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function api(path,opts){
  opts=opts||{};opts.headers=opts.headers||{};
  if(token)opts.headers['Authorization']='Bearer '+token;
  if(opts.body){opts.headers['Content-Type']='application/json';opts.body=JSON.stringify(opts.body);}
  return fetch(path,opts).then(function(r){
    if(r.status===401){token='';localStorage.removeItem('qt_token');renderLogin();throw new Error('UNAUTHORIZED');}
    return r.json().then(function(j){if(!r.ok&&!j.error)throw new Error('HTTP '+r.status);return j;});
  });
}
function busyPage(){app.className='wrap';app.innerHTML='<div class="loading"><div class="spin"></div></div>';}
function setErr(m){var e=document.getElementById('err');if(e)e.textContent=m||'';}

// ── 登录 ────────────────────────────────────────────────
function renderLogin(err){
  deck=null;app.className='wrap';paintQa();
  app.innerHTML='<div class="slide"><div class="card" style="margin-top:8vh">'
   +'<div class="kicker stg" style="--i:0">'+esc(t.lesson)+'</div>'
   +'<h1 class="stg" style="--i:1">'+esc(t.title)+'</h1>'
   +'<p class="sub stg" style="--i:2">'+esc(t.hint)+'</p>'
   +'<div class="stg" style="--i:3"><label>'+esc(t.code)+'</label>'
   +'<input id="code" autocomplete="off" inputmode="latin" maxlength="9" placeholder="XXX-XXX"></div>'
   +'<div class="stg" style="--i:4"><label>'+esc(t.who)+'</label>'
   +'<select id="who"><option value="">'+esc(t.pick)+'</option></select></div>'
   +'<div class="stg" style="--i:5;margin-top:18px"><button class="btn pri" id="go">'+esc(t.enter)+'</button></div>'
   +'<div class="err" id="err">'+esc(err||'')+'</div></div></div>';
  fetch('/api/roster?lang='+lang).then(function(r){return r.json();}).then(function(j){
    var sel=document.getElementById('who');
    if(!sel)return;
    (j.students||[]).forEach(function(s){
      var o=document.createElement('option');
      o.value=s.id;o.textContent=s.name;o.disabled=!!s.taken;
      sel.appendChild(o);
    });
  }).catch(function(){});
  document.getElementById('go').onclick=function(){
    var code=(document.getElementById('code').value||'').trim();
    var who=document.getElementById('who').value;
    if(!code||!who){setErr(t.pick);return;}
    var b=document.getElementById('go');b.disabled=true;
    api('/api/join',{method:'POST',body:{code:code,studentId:who}}).then(function(j){
      if(j.error){b.disabled=false;setErr(j.error==='BAD_CODE'?t.badCode:j.error==='TAKEN'?t.taken:j.error);return;}
      token=j.token;localStorage.setItem('qt_token',token);loadDeck();
    }).catch(function(e){b.disabled=false;if(String(e.message)!=='UNAUTHORIZED')setErr(t.net);});
  };
}

// ── 摊页：内容在前、题目在后 ────────────────────────────
function loadDeck(){
  busyPage();
  Promise.all([api('/api/learn'),api('/api/paper')]).then(function(r){
    var learn=r[0]||{},paper=r[1]||{};
    if(learn.lang&&T[learn.lang]){lang=learn.lang;t=T[lang];setDir(lang);}
    var byRef={};(learn.verses||[]).forEach(function(v){byRef[v.ref]=v;});
    var slides=[{type:'cover'}];
    if(learn.lesson)slides.push({type:'lesson',l:learn.lesson});
    var units=learn.units||[];
    units.forEach(function(u,i){
      // 这一单元覆盖的经文跟着这一页走；旧解析没标 refs 的就不带经文，不去瞎猜
      var vs=(u.refs||[]).map(function(x){return byRef[x];}).filter(Boolean);
      slides.push({type:'unit',u:u,vs:vs,n:i+1,tot:units.length});
    });
    if(!units.length&&(learn.verses||[]).length){
      // 没有单元时别把整章经文塞进一页：按 5 节一页切，手机上才翻得动
      for(var i=0;i<learn.verses.length;i+=5)slides.push({type:'verses',vs:learn.verses.slice(i,i+5)});
    }
    if((learn.vocab||[]).length)slides.push({type:'vocab',list:learn.vocab});
    var qs=(paper&&!paper.error&&paper.questions)||[];
    qs.forEach(function(q,qi){slides.push({type:'ex',q:q,qi:qi});});
    if(qs.length)slides.push({type:'result'});
    // 三种题型的作答形态不一样：单选是一个下标，排序是下标序列，配对是「左列每项 → 选项下标」
    var init=qs.map(function(q){
      if(q.type==='match')return (q.left||[]).map(function(){return -1;});
      if(q.type==='order')return [];
      return -1;
    });
    deck={slides:slides,idx:0,answers:init,result:null,
          learn:learn,paper:paper,submitting:false,qa:{open:false,busy:false,answer:'',sources:[]}};
    dirBack=false;render();
  }).catch(function(e){
    if(String(e.message)!=='UNAUTHORIZED')app.innerHTML='<div class="card"><p class="err">'+esc(t.net)+'</p></div>';
  });
}

function exTotal(){return deck.answers.length;}
function rangeLabel(){
  var d=deck.learn;
  return String(d.chapter||'')+(d.from?':'+d.from+'-'+d.to:'');
}

function render(){
  var d=deck,s=d.slides[d.idx],total=d.slides.length;
  var pct=Math.round((d.idx+1)/total*100);
  var head='<div class="top"><span class="pill">'+esc(rangeLabel())+'</span><span class="grow"></span>'
    +frac(d.idx+1,total)+'</div><div class="bar"><i style="width:'+pct+'%"></i></div>';
  var body='',foot='';

  if(s.type==='cover'){
    var units=d.slides.filter(function(x){return x.type==='unit';}).length;
    var vpages=d.slides.filter(function(x){return x.type==='verses';}).length;
    var has=(d.learn.verses||[]).length||(d.learn.units||[]).length;
    var who=(d.paper&&d.paper.studentName)||'';
    var note=(d.learn.lesson&&d.learn.lesson.title)||'';
    body='<div class="card">'
      +'<div class="kicker stg" style="--i:0">'+esc(t.cover)+'</div>'
      +'<h1 class="stg" style="--i:1">'+esc(d.learn.chapterName||t.title)+'</h1>'
      +'<p class="sub stg" style="--i:2">'+esc(rangeLabel())+(who?' · '+esc(who):'')+'</p>'
      +'<div class="stg" style="--i:3">'
        +(units?'<span class="tag">'+esc(units)+' '+esc(t.unit)+'</span> ':'')
        +(vpages?'<span class="tag">'+esc(vpages)+' '+esc(t.verses)+'</span> ':'')
        +(exTotal()?'<span class="tag">'+esc(exTotal())+' '+esc(t.ex)+'</span>':'')
      +'</div>'
      +(note?'<p class="sub stg" style="--i:4;margin-top:14px">'+esc(note)+'</p>':'')
      +(has?'':'<p class="sub stg" style="--i:5;margin-top:14px">'+esc(t.noLearn)+'</p>')
      +'</div>';
    foot='<button class="btn pri" id="next">'+esc(t.startLearn)+'</button>';
  } else if(s.type==='lesson'){
    var L=s.l,k=0;
    body='<div class="card"><div class="kicker">'+esc(t.lesson)+'</div>'
      +(L.overview?'<p class="sub stg" style="--i:0">'+esc(L.overview)+'</p>':'');
    if((L.objectives||[]).length){
      body+='<h2 class="stg" style="--i:1">'+esc(t.goals)+'</h2>';
      L.objectives.forEach(function(o){k+=1;body+='<div class="li stg" style="--i:'+(k+1)+'"><span class="no">'+k+'</span><span>'+esc(o)+'</span></div>';});
    }
    if((L.sessions||[]).length){
      body+='<h2 class="stg" style="--i:'+(k+2)+';margin-top:16px">'+esc(t.plan)+'</h2>';
      L.sessions.forEach(function(x,i){
        k+=1;
        body+='<div class="sess stg" style="--i:'+(k+2)+'"><b>'+(i+1)+'. '+esc(x.title)+'</b>'
          +'<div class="verse">'+esc(x.range)+(x.minutes?' · '+esc(x.minutes)+' '+esc(t.min):'')+'</div>';
        (x.objectives||[]).forEach(function(o){body+='<div class="verse">· '+esc(o)+'</div>';});
        body+='</div>';
      });
    }
    body+='</div>';
  } else if(s.type==='unit'){
    body='<div class="card"><div class="kicker">'+esc(t.unit)+' '+frac(s.n,s.tot)+'</div>'
      +'<h1 class="stg" style="--i:0">'+esc(s.u.title)+'</h1>'
      +'<p class="sub stg" style="--i:1">'+esc(s.u.theme)+'</p>'
      +ayahList(s.vs,2)+'</div>';
  } else if(s.type==='verses'){
    body='<div class="card"><div class="kicker">'+esc(t.verses)+'</div>'+ayahList(s.vs,0)+'</div>';
  } else if(s.type==='vocab'){
    body='<div class="card"><div class="kicker">'+esc(t.vocab)+'</div><div class="vocab">';
    s.list.forEach(function(w,i){
      body+='<div class="w stg" style="--i:'+i+'"><b lang="ar">'+esc(w.word)+'</b><span class="verse">'+esc(w.meaning)+'</span></div>';
    });
    body+='</div></div>';
  } else if(s.type==='ex'){
    body='<div class="card"><div class="kicker">'+esc(t.ex)+' '+frac(s.qi+1,exTotal())+'</div>'
      +'<p class="stem stg" style="--i:0">'+esc(s.q.stem)+'</p>'+exBody(s);
    if((s.q.sourceRefs||[]).length)body+='<div class="verse">'+esc(t.src)+colon()+esc(s.q.sourceRefs.join(' · '))+'</div>';
    body+='</div>';
  } else if(s.type==='result'){
    body=resultCard(d.result);
  }

  if(!foot){
    var prev=d.idx>0?'<button class="btn ghost" id="prev">'+esc(t.prev)+'</button>':'';
    if(s.type==='result'){
      foot=(d.result?'<button class="btn ghost" id="again">'+esc(t.again)+'</button>':'')
        +'<button class="btn ghost" id="out">'+esc(t.back)+'</button>';
    } else if(s.type==='ex'&&s.qi===exTotal()-1){
      foot=prev+'<button class="btn pri" id="sub"'+(d.submitting?' disabled':'')+'>'+esc(d.submitting?t.submitting:t.submit)+'</button>';
    } else {
      // 内容最后一页上把「下一页」改叫「开始做题」——让人知道下面换章了。
      // 只在「从内容页跨进第一道题」时改名：题与题之间还是「下一页」。
      var nx=d.slides[d.idx+1];
      var into=nx&&nx.type==='ex'&&s.type!=='ex';
      foot=prev+'<button class="btn pri" id="next">'+esc(into?t.startEx:t.next)+'</button>';
    }
  }

  app.className='wrap'+(dirBack?' back':'');
  app.innerHTML=head+'<div class="slide">'+body+'</div><div class="err" id="err"></div><div class="nav">'+foot+'</div>';
  dirBack=false;
  bind(s);
  paintQa();
}

/** 题干里已经把话说过一遍时就不再重复一句提示（「…：为每个词选出释义。」那种） */
function tipLine(q,tip){
  if(!tip)return '';
  return String(q.stem||'').indexOf(tip)>=0?'':'<p class="sub stg" style="--i:1">'+esc(tip)+'</p>';
}

/** 这道题作答完了没（排序要排满、配对要每个词都配上） */
function exDone(q,a){
  if(q.type==='match')return Array.isArray(a)&&a.length===(q.left||[]).length&&a.every(function(x){return x>=0;});
  if(q.type==='order')return Array.isArray(a)&&a.length===(q.options||[]).length;
  return typeof a==='number'&&a>=0;
}
/**
 * 配对题的文案按 dimension 分。
 *
 * 同样是 type='match'：词汇配对（vocabulary）左边是词、右边是释义；
 * 跨节理解（comprehension）左边是整节经文、右边是单元。只看 type 就会像实拍截图那样，
 * 在「这些经文各属于哪个单元？」下面写「为每个词选出释义」。
 */
function matchTip(q){
  return q.dimension==='vocabulary'?t.matchTip:q.dimension==='comprehension'?t.matchUnitTip:t.matchAnyTip;
}
function exHint(q){
  if(q.type==='order')return t.needOrder;
  if(q.type!=='match')return t.pickOne;
  return q.dimension==='vocabulary'?t.needMatch:q.dimension==='comprehension'?t.needMatchUnit:t.needMatchAny;
}

/** 题目主体：单选 / 排序 / 配对三种形态 */
function exBody(s){
  var q=s.q,a=deck.answers[s.qi],h='';
  if(q.type==='order'){
    // 排序题：按正确顺序依次点选，点中的排上号，再点一下取消（后面的自动补位）
    h+=tipLine(q,t.orderTip);
    (q.options||[]).forEach(function(o,oi){
      var at=a.indexOf(oi);
      h+='<button class="opt seq stg'+(at>=0?' on':'')+'" style="--i:'+(oi+2)+'" data-o="'+oi+'">'
        +'<span class="ord">'+(at>=0?(at+1):'')+'</span>'+optText(o)+'</button>';
    });
    h+='<button class="btn ghost" id="reset" style="margin-top:8px'+(a.length?'':';display:none')+'">'+esc(t.reset)+'</button>';
    return h;
  }
  if(q.type==='match'){
    // 配对题：左列每个词一行，行内把释义做成 chip。一个释义只能配一个词，
    // 改配到别处时原来那行自动松开 —— 否则学生会在「两行选了同一个」上卡住。
    h+=tipLine(q,matchTip(q));
    (q.left||[]).forEach(function(w,li){
      // 左边可能是一个词，也可能是一整节经文 —— 长的那种用小一号的字，否则一屏放不下两组
      var lw=String(w||'');
      h+='<div class="pair stg" data-li="'+li+'" style="--i:'+(li+2)+'"><div class="lw'+(lw.length>40?' long':'')+'" lang="ar">'+esc(w)+'</div><div class="chips">';
      (q.options||[]).forEach(function(o,oi){
        h+='<button class="chip'+(a[li]===oi?' on':'')+(hasAr(o)?' ar':'')+'" data-l="'+li+'" data-o="'+oi+'">'+esc(o)+'</button>';
      });
      h+='</div></div>';
    });
    return h;
  }
  (q.options||[]).forEach(function(o,oi){
    h+='<button class="opt stg'+(a===oi?' on':'')+'" style="--i:'+(oi+1)+'" data-o="'+oi+'">'
      +'<span class="k">'+KEYS.charAt(oi)+'</span>'+optText(o)+'</button>';
  });
  return h;
}

/**
 * 选中态就地更新。
 *
 * **不能用 render() 来刷新一次点选** —— 整页重建会把 .stg 的入场动画从头放一遍，
 * 表现是「每点一下内容先消失再飞回来」（实拍截图里整张卡片是空的，就是撞在动画的 0 帧上）。
 */
function paintEx(s){
  var q=s.q,a=deck.answers[s.qi];
  if(q.type==='match'){
    Array.prototype.forEach.call(document.querySelectorAll('.chip[data-l]'),function(c){
      var li=Number(c.getAttribute('data-l')),oi=Number(c.getAttribute('data-o'));
      c.classList.toggle('on',a[li]===oi);
    });
    // 被自动松开的那一行闪一下：光靠文字提示，学生的视线多半还停在刚点的那行上
    Array.prototype.forEach.call(document.querySelectorAll('.pair[data-li]'),function(row){
      row.classList.toggle('released',Number(row.getAttribute('data-li'))===deck.releasedLi);
    });
    return;
  }
  Array.prototype.forEach.call(document.querySelectorAll('.opt[data-o]'),function(b){
    var oi=Number(b.getAttribute('data-o'));
    if(q.type==='order'){
      var at=a.indexOf(oi);
      b.classList.toggle('on',at>=0);
      var ord=b.querySelector('.ord');
      if(ord)ord.textContent=(at>=0?String(at+1):'');
    } else {
      b.classList.toggle('on',a===oi);
    }
  });
  var rs=document.getElementById('reset');
  if(rs)rs.style.display=(q.type==='order'&&a.length?'':'none');
}

function ayahList(vs,base){
  if(!vs||!vs.length)return '';
  var h='';
  vs.forEach(function(v,i){
    h+='<div class="ayah stg" style="--i:'+(base+i)+'"><div class="ref">'+esc(v.ref)+'</div>'
      +'<div class="ar" lang="ar">'+esc(v.arabic)+'</div></div>';
  });
  return h;
}

function resultCard(r){
  if(!r)return '<div class="loading"><div class="spin"></div></div>';
  var pct=r.total?Math.round(r.correct/r.total*100):0;
  var C=2*Math.PI*54;
  var h='<div class="card"><div class="kicker">'+esc(t.done)+'</div>'
   +'<div class="scoreWrap stg" style="--i:0">'
     +'<svg class="ring" width="132" height="132" viewBox="0 0 132 132">'
       +'<defs><linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">'
         +'<stop offset="0%" stop-color="var(--brand)"/><stop offset="100%" stop-color="var(--brand2)"/></linearGradient></defs>'
       +'<circle class="bgc" cx="66" cy="66" r="54"/>'
       +'<circle class="fg" id="ring" cx="66" cy="66" r="54" stroke-dasharray="'+C.toFixed(1)+'" stroke-dashoffset="'+C.toFixed(1)+'"/>'
     +'</svg>'
     +'<div class="scoreNum"><div class="pctRow"><span id="pct">0</span><i class="pctSign">%</i></div><small>'+esc(t.score)+'</small></div>'
   +'</div>'
   +'<div class="stg" style="--i:1;text-align:center;margin-top:6px">'
     +'<span class="tag'+(r.correct===r.total?' ok':'')+'">'+esc(t.right)+' '+frac(r.correct,r.total)+'</span>'
     +'<p class="sub" style="margin-top:10px">'+esc(r.correct===r.total?t.perfect:t.keep)+'</p>'
   +'</div>';
  if((r.wrong||[]).length){
    h+='<h2 class="stg" style="--i:2;margin-top:14px">'+esc(t.review)+'</h2>';
    r.wrong.forEach(function(w,i){
      h+='<div class="wrongItem stg" style="--i:'+(i+3)+'"><div style="font-weight:650">'+esc(w.stem)+'</div>'
        +(w.explanation?'<div class="verse">'+esc(w.explanation)+'</div>':'')+'</div>';
    });
  }
  return h+'</div>';
}

/**
 * 成绩环 + 数字滚动：交完卷这一下值得有点仪式感。
 *
 * rAF 在后台标签页会被节流甚至停掉，那样数字会永远停在半路（实测停在 3%）。
 * 所以补一个不依赖 rAF 的兜底定时器：到点直接把终值写上，宁可没有动画也不能显示错的分数。
 */
function animateScore(r){
  var ring=document.getElementById('ring'),num=document.getElementById('pct');
  if(!ring||!num||!r)return;
  var pct=r.total?r.correct/r.total:0;
  var end=Math.round(pct*100);
  var C=2*Math.PI*54,dur=1100,t0=0,done=false;
  function land(){done=true;num.textContent=String(end);ring.setAttribute('stroke-dashoffset',String(C*(1-pct)));}
  requestAnimationFrame(function(){ring.setAttribute('stroke-dashoffset',String(C*(1-pct)));});
  function step(ts){
    if(done)return;
    if(!t0)t0=ts;
    var k=Math.min(1,(ts-t0)/dur);
    num.textContent=String(Math.round(end*(1-Math.pow(1-k,3))));
    if(k<1)requestAnimationFrame(step);else done=true;
  }
  requestAnimationFrame(step);
  setTimeout(function(){if(!done)land();},dur+500);
}

// ── 问一问（浮标 + 面板）────────────────────────────────
/**
 * 浮标挂在 body 上、不进 #app：它要跨页常驻，跟着翻页一起重建的话，
 * 一是每次翻页都重放一遍弹出动画，二是打字打到一半被 render 冲掉。
 */
var qaEl=null;
function paintQa(){
  if(!deck){ if(qaEl){qaEl.remove();qaEl=null;} return; }
  if(!qaEl){
    qaEl=document.createElement('div');
    qaEl.className='qa';
    document.body.appendChild(qaEl);
  }
  var q=deck.qa;
  var focused=document.activeElement&&document.activeElement.id==='qaIn';
  var draft=focused?document.activeElement.value:null;
  var panel='';
  if(q.open){
    panel='<div class="qaPanel"><div class="qaHead"><b>'+esc(t.ask)+'</b>'
      +'<button class="qaX" id="qaX" aria-label="close">×</button></div>'
      +'<div class="qaTip">'+esc(t.askTip)+'</div>'
      +'<div class="qaAns" id="qaAns">'
        +(q.busy?'<span class="dots"><i></i><i></i><i></i></span>':(q.answer?esc(q.answer):''))
        +((!q.busy&&q.sources&&q.sources.length)?'<div class="qaSrc">'+esc(t.askSrc)+colon()+esc(q.sources.join(' · '))+'</div>':'')
      +'</div>'
      +'<div class="qaIn"><input id="qaIn" maxlength="300" placeholder="'+esc(t.askPh)+'"'+(q.busy?' disabled':'')+'>'
      +'<button class="btn" id="qaGo"'+(q.busy?' disabled':'')+'>'+esc(t.send)+'</button></div></div>';
  }
  qaEl.innerHTML=panel+'<button class="fab" id="fab" title="'+esc(t.ask)+'" style="position:relative">?</button>';

  var el;
  if((el=qaEl.querySelector('#fab')))el.onclick=function(){
    deck.qa.open=!deck.qa.open;paintQa();
    var i=qaEl.querySelector('#qaIn');if(i)i.focus();
  };
  if((el=qaEl.querySelector('#qaX')))el.onclick=function(){deck.qa.open=false;paintQa();};
  if((el=qaEl.querySelector('#qaGo')))el.onclick=doAsk;
  if((el=qaEl.querySelector('#qaIn'))){
    el.onkeydown=function(e){if(e.key==='Enter'){e.preventDefault();doAsk();}};
    if(draft!==null){el.value=draft;el.focus();}
  }
}

function doAsk(){
  var el=qaEl&&qaEl.querySelector('#qaIn');
  if(!el)return;
  var v=(el.value||'').trim();
  var q=deck.qa;
  if(!v){q.answer=t.askEmpty;q.sources=[];paintQa();return;}
  q.busy=true;q.answer='';q.sources=[];paintQa();
  api('/api/ask',{method:'POST',body:{q:v}}).then(function(j){
    q.busy=false;
    if(j.error){q.answer=j.error==='TOO_MANY'?t.askTooMany:j.error==='EMPTY'?t.askEmpty:t.askErr;q.sources=[];}
    else if(j.insufficient||!j.answer){q.answer=t.askNone;q.sources=[];}
    else{q.answer=j.answer;q.sources=(j.sources||[]).map(function(s){return s.title;});}
    paintQa();
  }).catch(function(e){
    q.busy=false;
    if(String(e.message)!=='UNAUTHORIZED'){q.answer=t.askErr;q.sources=[];paintQa();}
  });
}

// ── 事件绑定 ───────────────────────────────────────────
function bind(s){
  var el;
  if((el=document.getElementById('prev')))el.onclick=function(){if(deck.idx>0){deck.idx--;dirBack=true;render();window.scrollTo(0,0);}};
  if((el=document.getElementById('next')))el.onclick=goNext;
  if((el=document.getElementById('sub')))el.onclick=submit;
  if((el=document.getElementById('again')))el.onclick=function(){
    deck.answers=deck.slides.filter(function(x){return x.type==='ex';}).map(function(x){
      if(x.q.type==='match')return (x.q.left||[]).map(function(){return -1;});
      if(x.q.type==='order')return [];
      return -1;
    });
    deck.result=null;
    var i=-1;
    deck.slides.forEach(function(x,k){if(i<0&&x.type==='ex')i=k;});
    deck.idx=i<0?0:i;dirBack=true;render();window.scrollTo(0,0);
  };
  if((el=document.getElementById('out')))el.onclick=function(){token='';localStorage.removeItem('qt_token');renderLogin();};

  if(s.type==='ex'){
    var q=s.q;
    Array.prototype.forEach.call(document.querySelectorAll('.opt[data-o]'),function(b){
      b.onclick=function(){
        var oi=Number(b.getAttribute('data-o'));
        if(q.type==='order'){
          var a=deck.answers[s.qi],at=a.indexOf(oi);
          if(at>=0)a.splice(at,1);else a.push(oi);
        } else {
          deck.answers[s.qi]=oi;
        }
        setErr('');paintEx(s);
      };
    });
    Array.prototype.forEach.call(document.querySelectorAll('.chip[data-l]'),function(b){
      b.onclick=function(){
        var li=Number(b.getAttribute('data-l')),oi=Number(b.getAttribute('data-o'));
        var a=deck.answers[s.qi];
        // 取消自己这行：任何时候都允许
        if(a[li]===oi){a[li]=-1;deck.releasedLi=-1;setErr('');paintEx(s);return;}
        /**
         * 一个释义只配一个词。⚠️ 原实现是把**别人那行静默松开**，学生实测反馈
         * 「第一二个词配完，第三个词选同一个，前面的选中就没了」—— 他根本不知道那行
         * 已经变成未作答，交卷时白丢一题。
         * 「稳妥为主」：改成**拒绝这次点击**，谁也不动，并明确告诉他冲突在哪一行、
         * 怎么解开（去那行点一下取消）。已经作答的内容永远不会被别处的操作清掉。
         */
        var taken=-1;
        for(var i=0;i<a.length;i+=1)if(i!==li&&a[i]===oi){taken=i;break;}
        if(taken>=0){
          deck.releasedLi=taken;                     // 高亮冲突那行，帮他找到
          setErr(t.matchTaken.replace('{w}',String((s.q.left||[])[taken]||'')));
          paintEx(s);
          return;
        }
        a[li]=oi;
        deck.releasedLi=-1;
        setErr('');
        paintEx(s);
      };
    });
    if((el=document.getElementById('reset')))el.onclick=function(){deck.answers[s.qi]=[];setErr('');paintEx(s);};
  }

  if(s.type==='result')animateScore(deck.result);
}

function goNext(){
  var s=deck.slides[deck.idx];
  // 题目页必须选了才过：空着翻过去，最后交卷才发现漏了更难补
  if(s.type==='ex'&&!exDone(s.q,deck.answers[s.qi])){setErr(exHint(s.q));return;}
  if(deck.idx<deck.slides.length-1){deck.idx++;dirBack=false;render();window.scrollTo(0,0);}
}

function submit(){
  var d=deck;
  if(d.submitting)return;
  var last=d.slides[d.idx];
  if(last.type==='ex'&&!exDone(last.q,d.answers[last.qi])){setErr(exHint(last.q));return;}
  var missing=0;
  d.slides.forEach(function(x){if(x.type==='ex'&&!exDone(x.q,d.answers[x.qi]))missing+=1;});
  if(missing&&!confirm(t.fill))return;
  d.submitting=true;render();
  var body={};
  d.slides.forEach(function(x){if(x.type==='ex'&&exDone(x.q,d.answers[x.qi]))body[x.q.id]=d.answers[x.qi];});
  api('/api/submit',{method:'POST',body:{paperId:d.paper.id,answers:body}}).then(function(j){
    d.submitting=false;
    if(j.error){render();setErr(j.error);return;}
    d.result=j;
    d.idx=d.slides.length-1;
    dirBack=false;render();window.scrollTo(0,0);
  }).catch(function(e){
    d.submitting=false;
    if(String(e.message)!=='UNAUTHORIZED'){render();setErr(t.net);}
  });
}

// 键盘 ←/→ 翻页：教室投屏时老师用遥控笔带着走
document.addEventListener('keydown',function(e){
  if(!deck)return;
  if(document.activeElement&&/^(INPUT|SELECT|TEXTAREA)$/.test(document.activeElement.tagName))return;
  if(e.key==='ArrowRight'){var n=document.getElementById('next');if(n)n.click();}
  if(e.key==='ArrowLeft'){var p=document.getElementById('prev');if(p)p.click();}
});

if(token)loadDeck();else renderLogin();
})();
</script></body></html>`;
