var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// node_modules/.cache/solutions-build/workbench-edu-hub/entry.main.ts
var entry_main_exports = {};
__export(entry_main_exports, {
  activate: () => activate,
  deactivate: () => deactivate,
  hostApi: () => hostApi,
  registerFunction: () => registerFunction
});
module.exports = __toCommonJS(entry_main_exports);

// ../../../totalclaw-solutions/solutions/workbench-edu-hub/src/main/ipc/eduHub.ipc.ts
var import_electron = require("electron");
var import_ipc_contracts = require("npm:@totalclaw/ipc-contracts");
var import_shared = require("host:apps/desktop-shell/src/main/ipc/shared.ts");
var import_qiyeApiClient = require("host:apps/desktop-shell/src/main/services/qiyeApiClient.ts");
var import_eduHubStore = require("host:apps/desktop-shell/src/main/services/eduHubStore.ts");

// ../../../totalclaw-solutions/solutions/workbench-edu-hub/src/main/services/eduHubProc.ts
var import_i18n = require("npm:@totalclaw/i18n");

// ../../../totalclaw-solutions/solutions/workbench-edu-hub/src/main/services/eduHubStudentPage.ts
var STUDENT_PAGE_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>AI Learning Hub</title>
<style>
:root{--ink:#1b2e29;--ink2:#4a5f58;--ink3:#7d8f88;--bg:#f6f4ee;--card:#fff;--line:#dfe3da;
--pri:#0e6b5c;--priInk:#fff;--priSoft:#e2efe9;--amber:#c08a2e;--amberSoft:#f5ead3;
--red:#b4532e;--redSoft:#f3e0d6;--good:#2e7d4f;--goodSoft:#ddeee2}
@media(prefers-color-scheme:dark){:root{--ink:#e4ece8;--ink2:#a8bab2;--ink3:#74857e;--bg:#101d19;
--card:#182723;--line:#2b3f38;--pri:#3fa88f;--priInk:#0c1815;--priSoft:#1c3a32;--amber:#d9a552;
--amberSoft:#3a2f1a;--red:#d97a52;--redSoft:#3d251a;--good:#5bb884;--goodSoft:#1c3527}}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--ink);
font:15px/1.65 -apple-system,"SF Pro SC","PingFang SC","Segoe UI","Noto Sans","Geeza Pro",sans-serif}
.wrap{max-width:680px;margin:0 auto;padding:18px 16px 60px}
.card{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:16px 18px;margin-bottom:12px}
.btn{display:inline-block;border:1px solid var(--line);background:var(--card);color:var(--ink);
border-radius:9px;padding:9px 18px;font-size:14px;font-weight:600;cursor:pointer}
.btn.pri{background:var(--pri);border-color:var(--pri);color:var(--priInk)}
.btn:disabled{opacity:.5;cursor:not-allowed}
.btn:focus-visible{outline:2px solid var(--pri);outline-offset:2px}
input{width:100%;padding:11px 14px;border:1.5px solid var(--line);border-radius:10px;font-size:15px;
background:var(--card);color:var(--ink);margin-bottom:10px}
.k{font-size:12px;color:var(--ink3)}
.chip{display:inline-block;font-size:12px;border-radius:99px;padding:2px 10px}
.chip.src{background:var(--priSoft);color:var(--pri)}
.chip.ok{background:var(--goodSoft);color:var(--good)}
.chip.bad{background:var(--redSoft);color:var(--red)}
h2{font-size:20px;letter-spacing:-.01em;margin:0 0 4px}
h3{font-size:15px;margin:0 0 8px}
.top{display:flex;align-items:center;gap:10px;margin-bottom:16px}
.top .sp{flex:1}
.lang{display:inline-flex;border:1px solid var(--line);border-radius:99px;overflow:hidden}
.lang button{border:0;background:none;color:var(--ink2);padding:4px 12px;font-size:12.5px;cursor:pointer}
.lang button.on{background:var(--pri);color:var(--priInk);font-weight:700}
.logo{width:46px;height:46px;margin:26px auto 10px;border-radius:12px;background:var(--pri);
color:var(--priInk);display:grid;place-items:center;font-size:21px;font-weight:800}
.center{text-align:center}
.lesson-item{display:flex;align-items:center;gap:12px;cursor:pointer}
.lesson-item .grow{flex:1}
.opt{display:block;width:100%;text-align:start;border:1.5px solid var(--line);background:var(--card);
color:var(--ink);border-radius:10px;padding:10px 14px;font-size:14px;margin-bottom:8px;cursor:pointer}
.opt.sel{border-color:var(--pri);background:var(--priSoft)}
.opt.right{border-color:var(--good);background:var(--goodSoft)}
.opt.wrong{border-color:var(--red);background:var(--redSoft)}
.sec{border-inline-start:3px solid var(--pri);padding-inline-start:12px;margin:14px 0}
.sec ul{margin:6px 0 0;padding-inline-start:18px}
.sec li{margin:3px 0;font-size:14px}
.score{font-size:44px;font-weight:800;letter-spacing:-.03em}
.foot{margin-top:26px;text-align:center;font-size:11.5px;color:var(--ink3)}
.err{color:var(--red);font-size:13px;min-height:18px}
[dir=rtl] .sec{border-inline-start-width:3px}
.mapbox{overflow-x:auto}.mapbox svg{max-width:100%}
.ills{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:10px}
.ill{margin:0;border:1px solid var(--line);border-radius:10px;overflow:hidden;background:var(--card)}
.ill img{width:100%;display:block;aspect-ratio:3/2;object-fit:cover}
.ill figcaption{padding:6px 10px;font-size:12px;color:var(--ink2)}
/* \u2014\u2014 My Learning Workspace \u9996\u9875 \u2014\u2014 */
.ws-kick{font-size:11.5px;font-weight:800;letter-spacing:.04em;color:var(--pri);text-transform:uppercase;margin-bottom:4px}
.ws-kick.amber{color:var(--amber)}
.ws-h{font-size:17px;margin:2px 0 4px;line-height:1.35}
.ws-meta{margin-top:2px}
.ws-prog{padding:14px 18px;margin-bottom:12px}
.ws-prog-top{display:flex;align-items:center;justify-content:space-between}
.ws-prog-top b{font-size:18px}
.ws-two{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.ws-today,.ws-review{margin-bottom:12px;display:flex;flex-direction:column}
.ws-today .btn,.ws-review .btn{align-self:flex-start;margin-top:auto}
.ws-rvline{margin:4px 0 12px;font-size:15px;font-weight:600}
.ws-sec{margin:20px 0 8px}
.ws-codev{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.06em;font-size:15px}
.chip.ws-new{background:var(--line);color:var(--ink2)}
.ws-link{color:var(--pri);font-size:13px;text-decoration:none}
.ws-link:hover{text-decoration:underline}
@media(max-width:520px){.ws-two{grid-template-columns:1fr}}
.ws-tools{display:flex;gap:10px;margin-bottom:6px}
.ws-tools .btn{flex:1}
/* \u2014\u2014 \u590D\u4E60\u5361\u7247\u2462 \u2014\u2014 */
.cardface{background:var(--priSoft);border:1px solid var(--line);border-radius:14px;padding:24px 20px;min-height:150px;display:flex;flex-direction:column;justify-content:center;text-align:center}
.cardq{font-size:19px;font-weight:700;line-height:1.4}
.carda{margin-top:14px;padding-top:14px;border-top:1px dashed var(--line);font-size:15px;line-height:1.6;white-space:pre-wrap;text-align:start}
.rate-row{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-top:16px}
.rate-bad{border-color:var(--red);color:var(--red)}
.rate-mid{border-color:var(--amber);color:var(--amber)}
.rate-good{border-color:var(--good);color:var(--good)}
/* \u2014\u2014 \u5B66\u4E60\u8BB0\u5FC6\u65F6\u95F4\u7EBF\u2465 \u2014\u2014 */
.tl-item{display:flex;gap:12px;align-items:flex-start}
.tl-ic{font-size:20px;line-height:1.2}
.tl-lbl{font-weight:600;font-size:14px}
.tl-txt{margin-top:4px}
/* \u2014\u2014 \u77E5\u8BC6\u5BFC\u56FE\u4EA4\u4E92\u2461 \u2014\u2014 */
.mind-center{display:inline-block;background:var(--pri);color:var(--priInk);font-weight:800;padding:8px 18px;border-radius:99px;margin-bottom:6px}
.mind-list{display:flex;flex-direction:column;gap:8px}
.mind-node{border:1px solid var(--line);border-radius:12px;overflow:hidden;background:var(--card)}
.mind-node.open{border-color:var(--pri)}
.mind-node-head{display:flex;align-items:center;gap:8px;padding:12px 14px;cursor:pointer;font-size:15px}
.mind-node-head .mind-caret{margin-inline-start:auto;color:var(--ink3)}
.mind-pts{margin:0;padding:0 16px 4px 32px}
.mind-pts li{margin:4px 0;font-size:14px}
.mind-acts{display:flex;gap:8px;padding:0 14px 12px}
/* \u2014\u2014 \u6D4B\u8BD5\u7EC3\u4E60\u2463 / \u8584\u5F31\u70B9 / \u7B14\u8BB0 \u2014\u2014 */
.practice-row{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:6px}
.weak-box{background:var(--amberSoft);border-color:var(--amber);margin-top:14px}
.dk-notes{margin-top:14px;padding-top:12px;border-top:1px dashed var(--line)}
.notes-list{margin-bottom:8px}
.note-item{display:flex;gap:8px;align-items:center;background:var(--priSoft);border-radius:8px;padding:6px 10px;margin-bottom:6px;font-size:13.5px}
.note-item .grow{flex:1}
.note-del{border:0;background:none;color:var(--ink3);font-size:12px;cursor:pointer}
.note-edit textarea{width:100%;border:1.5px solid var(--line);border-radius:10px;padding:8px 10px;font:inherit;background:var(--card);color:var(--ink);resize:vertical}
/* \u2014\u2014 \u97F3\u9891\u603B\u7ED3\u2464 \u2014\u2014 */
.dk-audio{margin:8px 0 14px;text-align:center}
.dk-audio audio{width:100%;max-width:420px;margin-top:6px}
/* \u2014\u2014 \u7FFB\u9875\u8BFE\u4EF6\uFF08PPT \u5F0F\uFF09 \u2014\u2014 */
.btn.xs{padding:4px 10px;font-size:12px}
.btn.lg{padding:12px 26px;font-size:16px}
.dk-top{display:flex;align-items:center;gap:10px;margin-bottom:8px}
.dk-title{flex:1;font-weight:700;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dk-prog{height:5px;background:var(--line);border-radius:99px;overflow:hidden;margin-bottom:16px}
.dk-bar{height:100%;background:var(--pri);border-radius:99px;transition:width .25s ease}
.slide{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:26px 22px;min-height:56vh;
  display:flex;flex-direction:column;animation:dkin .28s ease}
@keyframes dkin{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
.slide.cover{align-items:center;justify-content:center;text-align:center;gap:14px}
.slide.center{align-items:center;justify-content:center;text-align:center}
.dk-badge{display:inline-block;background:var(--priSoft);color:var(--pri);font-weight:700;font-size:12px;
  padding:4px 14px;border-radius:99px;letter-spacing:.04em}
.dk-h1{font-size:27px;line-height:1.3;margin:6px 0;letter-spacing:-.01em}
.dk-meta{color:var(--ink2);font-size:14px}
.dk-face{font-size:52px;line-height:1}
.dk-kicker{color:var(--pri);font-weight:800;font-size:12.5px;letter-spacing:.05em;margin-bottom:6px}
.dk-h2{font-size:22px;margin:0 0 10px;letter-spacing:-.01em}
.dk-q{font-size:20px;margin:0 0 16px;line-height:1.45}
.dk-intro{font-size:15.5px;color:var(--ink);margin:0 0 12px}
.dk-ul{margin:4px 0 14px;padding-inline-start:20px}
.dk-ul li{margin:7px 0;font-size:15px}
.dk-fig{background:#f8faf6;border:1px solid rgba(14,107,92,.18);border-radius:12px;padding:12px;margin:8px 0;overflow-x:auto}
.dk-fig svg{direction:ltr;max-width:100%;height:auto;display:block;margin:0 auto}
.dk-photo{margin:12px 0 0}
.dk-photo img{width:100%;max-height:300px;object-fit:contain;border-radius:10px;border:1px solid var(--line);background:#fff}
.dk-photo figcaption{font-size:12.5px;color:var(--ink2);margin-top:6px}
.dk-photo a{color:var(--pri)}
.dk-nav{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:14px;
  position:sticky;bottom:0;padding:10px 0;background:linear-gradient(transparent,var(--bg) 30%)}
.dk-pos{font-size:12.5px;color:var(--ink3)}
.opt.sm{padding:8px 12px;margin-bottom:6px;cursor:default}
.slide .opt{font-size:15px;padding:13px 16px}
/* \u6570\u5B57\u4EBA\u8001\u5E08\u8BB2\u89E3 */
.dk-avatar{margin:0 0 14px}
.dk-avlabel{font-size:12.5px;color:var(--pri);font-weight:700;margin-bottom:6px}
.dk-vid{width:100%;max-height:340px;border-radius:12px;background:#000;display:block}
/* \u53D7\u9650\u95EE\u7B54\u6D6E\u5C42 */
.dk-qa{position:fixed;inset-inline-end:16px;bottom:16px;z-index:50;display:flex;flex-direction:column;align-items:flex-end;gap:10px}
.dk-qa-fab{width:52px;height:52px;border-radius:50%;border:0;background:var(--pri);color:var(--priInk);font-size:22px;
  cursor:pointer;box-shadow:0 6px 18px rgba(0,0,0,.22)}
.dk-qa-panel{width:min(360px,86vw);background:var(--card);border:1px solid var(--line);border-radius:14px;
  box-shadow:0 10px 30px rgba(0,0,0,.2);padding:12px 14px}
.dk-qa-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:2px}
.dk-qa-x{border:0;background:none;font-size:20px;color:var(--ink3);cursor:pointer;line-height:1}
.dk-qa-tip{font-size:11.5px;color:var(--ink3);margin-bottom:8px}
.dk-qa-ans{min-height:20px;max-height:220px;overflow-y:auto;font-size:14px;line-height:1.6;
  white-space:pre-wrap;margin-bottom:10px}
.dk-qa-in{display:flex;gap:8px}
.dk-qa-in input{flex:1;margin:0}
.dk-qa-in .btn{flex:none}
</style>
</head>
<body>
<div class="wrap" id="app"></div>
<script>
'use strict';
var I18N = {
  en: {appName:'AI Learning Hub', enterCode:'Enter your class code', yourName:'Your name',
    studentNoPh:'Student number', badNo:'Please enter your student number', badMatch:'Student number and name do not match',
    join:'Enter my workspace', served:'Served by your school \xB7 data stays on campus', badCode:'Wrong class code',
    badName:'Please enter your name', myLessons:'My lessons', noLessons:'No published lessons yet \u2014 ask your teacher.',
    sections:' sections', quiz:' questions', myScore:'My score: ', start:'Open', keyPoints:'Key points',
    reading:'Reading', takeQuiz:'Take the quiz', submit:'Submit', back:'Back', source:'Source P.',
    result:'Quiz result', explain:'Why', retake:'Review lesson', logout:'Switch student', loading:'Loading\u2026', netErr:'Network error, retry', classFull:'Class is full', tooMany:'Too many attempts, wait a minute', mindmap:'Knowledge map', illustrations:'Illustrations',
    learn:'Start learning', next:'Next', prev:'Back', startEx:'Start exercises', exercises:'Exercises', doneLesson:'Finish', slide:'Slide', of:'of', pickOne:'Pick an answer to continue', yourAns:'Your answer', correctAns:'Correct answer', wellDone:'Well done!', keepGoing:'Keep practising', reviewAns:'Review answers',
    askTeacher:'Ask about this lesson', askPh:'Ask something about this lesson\u2026', send:'Ask', asking:'Thinking\u2026', qaTip:'Answers come only from this lesson.', qaEmpty:'Please type a question', qaErr:'Cannot answer right now, try again', qaTooMany:'Too many questions, wait a minute', avatarTeacher:'AI teacher explains', closeQa:'Close',
    hi:'Hi', weekProgress:'This week', todayLearning:"Today's learning", continue:'Continue', allDone:'All caught up \u{1F389}', allDoneSub:'No new lessons right now.', todayReview:'Suggested review today', startReview:'Start review', noReview:'Nothing to review \u2014 great!', minutes:'min', mistakesN:'mistakes', weakN:'weak points', myCourses:'My courses', statusNew:'Not started', statusReading:'In progress', statusDone:'Completed', learningCode:'Your learning code', learningCodeTip:'Note it to resume on another device.', resumeQ:'Have a learning code? Resume here', resumeTitle:'Resume with learning code', learningCodePh:'Your learning code', resumeBtn:'Resume', backToJoin:'New student? Join', codeNotFound:'Learning code not found',
    quickTools:'Quick tools', reviewCards:'Review cards', learningMemory:'Learning memory', flashcards:'Flashcards', showBack:'Show answer', rateUnknown:"Don't know", rateFuzzy:'Unsure', rateKnown:'Got it', noCards:'No cards to review \u2014 great!', reviewDone:'Review done \u{1F389}', cardsDue:'cards due', markKnown:'Mark mastered', markWeak:'Mark weak', mapTapHint:'Tap a topic to see key points', mastered:'Mastered', weakChip:'Weak', practice:'Practice', chooseMode:'Choose a mode', modeQuick:'Quick check', modeChapter:'Chapter test', modeExam:'Mock exam', retake:'Practice again', weakPoints:'Weak points', addNote:'Add note', notePh:'Write a note for this section\u2026', myNotes:'My notes', saveNote:'Save', del:'Delete', noMemory:'Your learning story starts here.', memOpen:'Opened', memTest:'Test', memPractice:'Practice', memNote:'Note', memAsk:'Asked', knowledgeMapView:'Knowledge map', audioSummary:'Audio summary'},
  ar: {appName:'\u0645\u0631\u0643\u0632 \u0627\u0644\u062A\u0639\u0644\u0651\u0645 \u0627\u0644\u0630\u0643\u064A', enterCode:'\u0623\u062F\u062E\u0644 \u0631\u0645\u0632 \u0627\u0644\u0635\u0641', yourName:'\u0627\u0633\u0645\u0643',
    studentNoPh:'\u0627\u0644\u0631\u0642\u0645 \u0627\u0644\u0623\u0643\u0627\u062F\u064A\u0645\u064A', badNo:'\u064A\u0631\u062C\u0649 \u0625\u062F\u062E\u0627\u0644 \u0631\u0642\u0645\u0643 \u0627\u0644\u0623\u0643\u0627\u062F\u064A\u0645\u064A', badMatch:'\u0627\u0644\u0631\u0642\u0645 \u0627\u0644\u0623\u0643\u0627\u062F\u064A\u0645\u064A \u0648\u0627\u0644\u0627\u0633\u0645 \u063A\u064A\u0631 \u0645\u062A\u0637\u0627\u0628\u0642\u064A\u0646',
    join:'\u0627\u062F\u062E\u0644 \u0645\u0633\u0627\u062D\u0629 \u0627\u0644\u062A\u0639\u0644\u0645', served:'\u062A\u0642\u062F\u0645\u0647 \u0645\u062F\u0631\u0633\u062A\u0643 \xB7 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u062A\u0628\u0642\u0649 \u062F\u0627\u062E\u0644 \u0627\u0644\u062D\u0631\u0645', badCode:'\u0631\u0645\u0632 \u0627\u0644\u0635\u0641 \u063A\u064A\u0631 \u0635\u062D\u064A\u062D',
    badName:'\u064A\u0631\u062C\u0649 \u0625\u062F\u062E\u0627\u0644 \u0627\u0644\u0627\u0633\u0645', myLessons:'\u062F\u0631\u0648\u0633\u064A', noLessons:'\u0644\u0627 \u062A\u0648\u062C\u062F \u062F\u0631\u0648\u0633 \u0645\u0646\u0634\u0648\u0631\u0629 \u0628\u0639\u062F \u2014 \u0627\u0633\u0623\u0644 \u0645\u0639\u0644\u0645\u0643.',
    sections:' \u0623\u0642\u0633\u0627\u0645', quiz:' \u0623\u0633\u0626\u0644\u0629', myScore:'\u0646\u062A\u064A\u062C\u062A\u064A: ', start:'\u0627\u0641\u062A\u062D', keyPoints:'\u0627\u0644\u0646\u0642\u0627\u0637 \u0627\u0644\u0623\u0633\u0627\u0633\u064A\u0629',
    reading:'\u0642\u0631\u0627\u0621\u0629', takeQuiz:'\u0627\u0628\u062F\u0623 \u0627\u0644\u0627\u062E\u062A\u0628\u0627\u0631', submit:'\u0625\u0631\u0633\u0627\u0644', back:'\u0631\u062C\u0648\u0639', source:'\u0627\u0644\u0645\u0635\u062F\u0631 \u0635',
    result:'\u0646\u062A\u064A\u062C\u0629 \u0627\u0644\u0627\u062E\u062A\u0628\u0627\u0631', explain:'\u0627\u0644\u062A\u0641\u0633\u064A\u0631', retake:'\u0645\u0631\u0627\u062C\u0639\u0629 \u0627\u0644\u062F\u0631\u0633', logout:'\u062A\u0628\u062F\u064A\u0644 \u0627\u0644\u0637\u0627\u0644\u0628', loading:'\u062C\u0627\u0631\u064D \u0627\u0644\u062A\u062D\u0645\u064A\u0644\u2026', netErr:'\u062E\u0637\u0623 \u0641\u064A \u0627\u0644\u0634\u0628\u0643\u0629', classFull:'\u0627\u0644\u0635\u0641 \u0645\u0645\u062A\u0644\u0626', tooMany:'\u0645\u062D\u0627\u0648\u0644\u0627\u062A \u0643\u062B\u064A\u0631\u0629\u060C \u0627\u0646\u062A\u0638\u0631 \u062F\u0642\u064A\u0642\u0629', mindmap:'\u0627\u0644\u062E\u0631\u064A\u0637\u0629 \u0627\u0644\u0645\u0639\u0631\u0641\u064A\u0629', illustrations:'\u0627\u0644\u0635\u0648\u0631 \u0627\u0644\u062A\u0648\u0636\u064A\u062D\u064A\u0629',
    learn:'\u0627\u0628\u062F\u0623 \u0627\u0644\u062A\u0639\u0644\u0651\u0645', next:'\u0627\u0644\u062A\u0627\u0644\u064A', prev:'\u0627\u0644\u0633\u0627\u0628\u0642', startEx:'\u0627\u0628\u062F\u0623 \u0627\u0644\u062A\u0645\u0627\u0631\u064A\u0646', exercises:'\u062A\u0645\u0627\u0631\u064A\u0646', doneLesson:'\u0625\u0646\u0647\u0627\u0621', slide:'\u0634\u0631\u064A\u062D\u0629', of:'\u0645\u0646', pickOne:'\u0627\u062E\u062A\u0631 \u0625\u062C\u0627\u0628\u0629 \u0644\u0644\u0645\u062A\u0627\u0628\u0639\u0629', yourAns:'\u0625\u062C\u0627\u0628\u062A\u0643', correctAns:'\u0627\u0644\u0625\u062C\u0627\u0628\u0629 \u0627\u0644\u0635\u062D\u064A\u062D\u0629', wellDone:'\u0623\u062D\u0633\u0646\u062A!', keepGoing:'\u0648\u0627\u0635\u0644 \u0627\u0644\u062A\u062F\u0631\u0651\u0628', reviewAns:'\u0645\u0631\u0627\u062C\u0639\u0629 \u0627\u0644\u0625\u062C\u0627\u0628\u0627\u062A',
    askTeacher:'\u0627\u0633\u0623\u0644 \u0639\u0646 \u0647\u0630\u0627 \u0627\u0644\u062F\u0631\u0633', askPh:'\u0627\u0633\u0623\u0644 \u0634\u064A\u0626\u0627\u064B \u0639\u0646 \u0647\u0630\u0627 \u0627\u0644\u062F\u0631\u0633\u2026', send:'\u0627\u0633\u0623\u0644', asking:'\u064A\u0641\u0643\u0651\u0631\u2026', qaTip:'\u0627\u0644\u0625\u062C\u0627\u0628\u0627\u062A \u0645\u0646 \u0647\u0630\u0627 \u0627\u0644\u062F\u0631\u0633 \u0641\u0642\u0637.', qaEmpty:'\u0627\u0643\u062A\u0628 \u0633\u0624\u0627\u0644\u0627\u064B \u0645\u0646 \u0641\u0636\u0644\u0643', qaErr:'\u062A\u0639\u0630\u0651\u0631 \u0627\u0644\u0631\u062F \u0627\u0644\u0622\u0646\u060C \u062D\u0627\u0648\u0644 \u0645\u062C\u062F\u062F\u0627\u064B', qaTooMany:'\u0623\u0633\u0626\u0644\u0629 \u0643\u062B\u064A\u0631\u0629\u060C \u0627\u0646\u062A\u0638\u0631 \u062F\u0642\u064A\u0642\u0629', avatarTeacher:'\u0634\u0631\u062D \u0627\u0644\u0645\u0639\u0644\u0651\u0645 \u0627\u0644\u0630\u0643\u064A', closeQa:'\u0625\u063A\u0644\u0627\u0642',
    hi:'\u0645\u0631\u062D\u0628\u0627\u064B', weekProgress:'\u0647\u0630\u0627 \u0627\u0644\u0623\u0633\u0628\u0648\u0639', todayLearning:'\u062A\u0639\u0644\u0651\u0645 \u0627\u0644\u064A\u0648\u0645', continue:'\u0645\u062A\u0627\u0628\u0639\u0629', allDone:'\u0623\u0646\u062C\u0632\u062A \u0643\u0644 \u0634\u064A\u0621 \u{1F389}', allDoneSub:'\u0644\u0627 \u062F\u0631\u0648\u0633 \u062C\u062F\u064A\u062F\u0629 \u0627\u0644\u0622\u0646.', todayReview:'\u0645\u0631\u0627\u062C\u0639\u0629 \u0627\u0644\u064A\u0648\u0645 \u0627\u0644\u0645\u0642\u062A\u0631\u062D\u0629', startReview:'\u0627\u0628\u062F\u0623 \u0627\u0644\u0645\u0631\u0627\u062C\u0639\u0629', noReview:'\u0644\u0627 \u0634\u064A\u0621 \u0644\u0644\u0645\u0631\u0627\u062C\u0639\u0629 \u2014 \u0645\u0645\u062A\u0627\u0632!', minutes:'\u062F\u0642\u064A\u0642\u0629', mistakesN:'\u0623\u062E\u0637\u0627\u0621', weakN:'\u0646\u0642\u0627\u0637 \u0636\u0639\u0641', myCourses:'\u062F\u0648\u0631\u0627\u062A\u064A', statusNew:'\u0644\u0645 \u064A\u0628\u062F\u0623', statusReading:'\u0642\u064A\u062F \u0627\u0644\u062A\u0642\u062F\u0651\u0645', statusDone:'\u0645\u0643\u062A\u0645\u0644', learningCode:'\u0631\u0645\u0632 \u062A\u0639\u0644\u0651\u0645\u0643', learningCodeTip:'\u0627\u062D\u062A\u0641\u0638 \u0628\u0647 \u0644\u0644\u0627\u0633\u062A\u0626\u0646\u0627\u0641 \u0639\u0644\u0649 \u062C\u0647\u0627\u0632 \u0622\u062E\u0631.', resumeQ:'\u0644\u062F\u064A\u0643 \u0631\u0645\u0632 \u062A\u0639\u0644\u0651\u0645\u061F \u0627\u0633\u062A\u0623\u0646\u0641 \u0647\u0646\u0627', resumeTitle:'\u0627\u0644\u0627\u0633\u062A\u0626\u0646\u0627\u0641 \u0628\u0631\u0645\u0632 \u0627\u0644\u062A\u0639\u0644\u0651\u0645', learningCodePh:'\u0631\u0645\u0632 \u062A\u0639\u0644\u0651\u0645\u0643', resumeBtn:'\u0627\u0633\u062A\u0626\u0646\u0627\u0641', backToJoin:'\u0637\u0627\u0644\u0628 \u062C\u062F\u064A\u062F\u061F \u0627\u0646\u0636\u0645', codeNotFound:'\u0631\u0645\u0632 \u0627\u0644\u062A\u0639\u0644\u0651\u0645 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F',
    quickTools:'\u0623\u062F\u0648\u0627\u062A \u0633\u0631\u064A\u0639\u0629', reviewCards:'\u0645\u0631\u0627\u062C\u0639\u0629 \u0627\u0644\u0628\u0637\u0627\u0642\u0627\u062A', learningMemory:'\u0630\u0627\u0643\u0631\u0629 \u0627\u0644\u062A\u0639\u0644\u0651\u0645', flashcards:'\u0627\u0644\u0628\u0637\u0627\u0642\u0627\u062A', showBack:'\u0627\u0639\u0631\u0636 \u0627\u0644\u0625\u062C\u0627\u0628\u0629', rateUnknown:'\u0644\u0627 \u0623\u0639\u0631\u0641', rateFuzzy:'\u063A\u064A\u0631 \u0645\u062A\u0623\u0643\u062F', rateKnown:'\u0623\u062A\u0642\u0646\u062A', noCards:'\u0644\u0627 \u0628\u0637\u0627\u0642\u0627\u062A \u0644\u0644\u0645\u0631\u0627\u062C\u0639\u0629 \u2014 \u0645\u0645\u062A\u0627\u0632!', reviewDone:'\u0627\u0646\u062A\u0647\u062A \u0627\u0644\u0645\u0631\u0627\u062C\u0639\u0629 \u{1F389}', cardsDue:'\u0628\u0637\u0627\u0642\u0627\u062A \u0645\u0633\u062A\u062D\u0642\u0629', markKnown:'\u0648\u0633\u0645\u0647\u0627 \u0645\u062A\u0642\u0646\u0629', markWeak:'\u0648\u0633\u0645\u0647\u0627 \u0636\u0639\u064A\u0641\u0629', mapTapHint:'\u0627\u0636\u063A\u0637 \u0645\u0648\u0636\u0648\u0639\u0627\u064B \u0644\u0631\u0624\u064A\u0629 \u0627\u0644\u0646\u0642\u0627\u0637', mastered:'\u0645\u062A\u0642\u0646', weakChip:'\u0636\u0639\u064A\u0641', practice:'\u062A\u062F\u0631\u0651\u0628', chooseMode:'\u0627\u062E\u062A\u0631 \u0646\u0645\u0637\u0627\u064B', modeQuick:'\u0641\u062D\u0635 \u0633\u0631\u064A\u0639', modeChapter:'\u0627\u062E\u062A\u0628\u0627\u0631 \u0627\u0644\u0641\u0635\u0644', modeExam:'\u0645\u062D\u0627\u0643\u0627\u0629 \u0627\u0644\u0627\u0645\u062A\u062D\u0627\u0646', retake:'\u062A\u062F\u0631\u0651\u0628 \u0645\u062C\u062F\u062F\u0627\u064B', weakPoints:'\u0646\u0642\u0627\u0637 \u0627\u0644\u0636\u0639\u0641', addNote:'\u0623\u0636\u0641 \u0645\u0644\u0627\u062D\u0638\u0629', notePh:'\u0627\u0643\u062A\u0628 \u0645\u0644\u0627\u062D\u0638\u0629 \u0644\u0647\u0630\u0627 \u0627\u0644\u0642\u0633\u0645\u2026', myNotes:'\u0645\u0644\u0627\u062D\u0638\u0627\u062A\u064A', saveNote:'\u062D\u0641\u0638', del:'\u062D\u0630\u0641', noMemory:'\u062A\u0628\u062F\u0623 \u0642\u0635\u0629 \u062A\u0639\u0644\u0651\u0645\u0643 \u0647\u0646\u0627.', memOpen:'\u0641\u062A\u062D\u062A', memTest:'\u0627\u062E\u062A\u0628\u0627\u0631', memPractice:'\u062A\u062F\u0631\u0651\u0628', memNote:'\u0645\u0644\u0627\u062D\u0638\u0629', memAsk:'\u0633\u0624\u0627\u0644', knowledgeMapView:'\u0627\u0644\u062E\u0631\u064A\u0637\u0629 \u0627\u0644\u0645\u0639\u0631\u0641\u064A\u0629', audioSummary:'\u0645\u0644\u062E\u0635 \u0635\u0648\u062A\u064A'},
  zh: {appName:'AI \u5B66\u4E60\u4E2D\u5FC3', enterCode:'\u8F93\u5165\u8001\u5E08\u7ED9\u7684\u73ED\u7EA7\u7801', yourName:'\u4F60\u7684\u59D3\u540D',
    studentNoPh:'\u5B66\u53F7', badNo:'\u8BF7\u8F93\u5165\u5B66\u53F7', badMatch:'\u5B66\u53F7\u4E0E\u59D3\u540D\u4E0D\u5339\u914D',
    join:'\u8FDB\u5165\u6211\u7684\u5B66\u4E60\u7A7A\u95F4', served:'\u672C\u6821\u6559\u5E08\u7AEF\u63D0\u4F9B \xB7 \u6570\u636E\u4E0D\u51FA\u6821\u56ED', badCode:'\u73ED\u7EA7\u7801\u4E0D\u5BF9',
    sections:' \u8282', quiz:' \u9898', myScore:'\u6211\u7684\u6210\u7EE9\uFF1A', start:'\u8FDB\u5165', keyPoints:'\u672C\u8BFE\u8981\u70B9',
    reading:'\u8BFE\u6587\u8981\u70B9', takeQuiz:'\u5F00\u59CB\u5C0F\u6D4B', submit:'\u4EA4\u5377', back:'\u8FD4\u56DE', source:'\u6765\u6E90 P.',
    result:'\u5C0F\u6D4B\u7ED3\u679C', explain:'\u89E3\u6790', retake:'\u56DE\u770B\u8BFE\u6587', logout:'\u5207\u6362\u5B66\u751F', loading:'\u52A0\u8F7D\u4E2D\u2026', netErr:'\u7F51\u7EDC\u5F02\u5E38\uFF0C\u8BF7\u91CD\u8BD5', classFull:'\u73ED\u7EA7\u4EBA\u6570\u5DF2\u6EE1', tooMany:'\u5C1D\u8BD5\u8FC7\u4E8E\u9891\u7E41\uFF0C\u8BF7\u7A0D\u5019\u518D\u8BD5', mindmap:'\u77E5\u8BC6\u5BFC\u56FE', illustrations:'\u6559\u5B66\u914D\u56FE',
    learn:'\u5F00\u59CB\u5B66\u4E60', next:'\u4E0B\u4E00\u9875', prev:'\u4E0A\u4E00\u9875', startEx:'\u5F00\u59CB\u505A\u9898', exercises:'\u7EC3\u4E60', doneLesson:'\u5B8C\u6210', slide:'\u7B2C', of:'/', pickOne:'\u9009\u4E00\u4E2A\u7B54\u6848\u540E\u7EE7\u7EED', yourAns:'\u4F60\u7684\u7B54\u6848', correctAns:'\u6B63\u786E\u7B54\u6848', wellDone:'\u592A\u68D2\u4E86\uFF01', keepGoing:'\u7EE7\u7EED\u52A0\u6CB9', reviewAns:'\u67E5\u770B\u89E3\u6790',
    askTeacher:'\u95EE\u672C\u8BFE', askPh:'\u5C31\u672C\u8BFE\u5185\u5BB9\u63D0\u95EE\u2026', send:'\u63D0\u95EE', asking:'\u601D\u8003\u4E2D\u2026', qaTip:'\u53EA\u89E3\u7B54\u672C\u8BFE\u76F8\u5173\u7684\u95EE\u9898\u3002', qaEmpty:'\u8BF7\u8F93\u5165\u95EE\u9898', qaErr:'\u6682\u65F6\u7B54\u4E0D\u4E86\uFF0C\u7A0D\u540E\u518D\u8BD5', qaTooMany:'\u63D0\u95EE\u592A\u9891\u7E41\uFF0C\u7B49\u4E00\u5206\u949F', avatarTeacher:'\u6570\u5B57\u4EBA\u8001\u5E08\u8BB2\u89E3', closeQa:'\u5173\u95ED',
    hi:'\u4F60\u597D', weekProgress:'\u672C\u5468\u5B66\u4E60\u8FDB\u5EA6', todayLearning:'\u4ECA\u5929\u7684\u5B66\u4E60', continue:'\u7EE7\u7EED\u5B66\u4E60', allDone:'\u5168\u90E8\u5B66\u5B8C\u5566 \u{1F389}', allDoneSub:'\u6682\u65F6\u6CA1\u6709\u65B0\u8BFE\u7A0B\u3002', todayReview:'\u4ECA\u5929\u5EFA\u8BAE\u590D\u4E60', startReview:'\u5F00\u59CB\u590D\u4E60', noReview:'\u6682\u65E0\u9700\u590D\u4E60\uFF0C\u5F88\u68D2\uFF01', minutes:'\u5206\u949F', mistakesN:'\u9053\u9519\u9898', weakN:'\u4E2A\u8584\u5F31\u70B9', myCourses:'\u6211\u7684\u8BFE\u7A0B', statusNew:'\u672A\u5F00\u59CB', statusReading:'\u5B66\u4E60\u4E2D', statusDone:'\u5DF2\u5B8C\u6210', learningCode:'\u4F60\u7684\u5B66\u4E60\u7801', learningCodeTip:'\u8BB0\u4E0B\u5B83\uFF0C\u6362\u8BBE\u5907\u4E5F\u80FD\u63A5\u7740\u5B66\u3002', resumeQ:'\u6709\u5B66\u4E60\u7801\uFF1F\u6362\u8BBE\u5907\u63A5\u7EED', resumeTitle:'\u7528\u5B66\u4E60\u7801\u63A5\u7EED', learningCodePh:'\u4F60\u7684\u5B66\u4E60\u7801', resumeBtn:'\u63A5\u7EED', backToJoin:'\u65B0\u540C\u5B66\uFF1F\u76F4\u63A5\u8FDB\u5165', codeNotFound:'\u5B66\u4E60\u7801\u4E0D\u5B58\u5728',
    quickTools:'\u5FEB\u901F\u5DE5\u5177', reviewCards:'\u590D\u4E60\u5361\u7247', learningMemory:'\u5B66\u4E60\u8BB0\u5FC6', flashcards:'\u8BB0\u5FC6\u5361', showBack:'\u770B\u7B54\u6848', rateUnknown:'\u4E0D\u4F1A', rateFuzzy:'\u6A21\u7CCA', rateKnown:'\u5DF2\u638C\u63E1', noCards:'\u6CA1\u6709\u8981\u590D\u4E60\u7684\u5361\u7247\uFF0C\u5F88\u68D2\uFF01', reviewDone:'\u590D\u4E60\u5B8C\u6210 \u{1F389}', cardsDue:'\u5F20\u5361\u5F85\u590D\u4E60', markKnown:'\u6807\u8BB0\u5DF2\u638C\u63E1', markWeak:'\u6807\u8BB0\u8584\u5F31', mapTapHint:'\u70B9\u4E00\u4E2A\u4E3B\u9898\u770B\u8981\u70B9', mastered:'\u5DF2\u638C\u63E1', weakChip:'\u8584\u5F31', practice:'\u7EC3\u4E60', chooseMode:'\u9009\u62E9\u6A21\u5F0F', modeQuick:'\u5FEB\u901F\u68C0\u6D4B', modeChapter:'\u7AE0\u8282\u6D4B\u8BD5', modeExam:'\u8003\u524D\u6A21\u62DF', retake:'\u518D\u7EC3\u4E00\u6B21', weakPoints:'\u8584\u5F31\u70B9', addNote:'\u8BB0\u7B14\u8BB0', notePh:'\u7ED9\u672C\u8282\u8BB0\u6761\u7B14\u8BB0\u2026', myNotes:'\u6211\u7684\u7B14\u8BB0', saveNote:'\u4FDD\u5B58', del:'\u5220\u9664', noMemory:'\u4F60\u7684\u5B66\u4E60\u8F68\u8FF9\u4ECE\u8FD9\u91CC\u5F00\u59CB\u3002', memOpen:'\u6253\u5F00\u4E86', memTest:'\u6D4B\u8BD5', memPractice:'\u7EC3\u4E60', memNote:'\u7B14\u8BB0', memAsk:'\u63D0\u95EE', knowledgeMapView:'\u77E5\u8BC6\u5BFC\u56FE', audioSummary:'\u97F3\u9891\u603B\u7ED3'}
};
var lang = localStorage.getItem('eh_lang') || 'en';
var T = function(k){ return (I18N[lang]||I18N.en)[k] || k; };
var token = localStorage.getItem('eh_token') || '';
var app = document.getElementById('app');

function setLang(l){ lang = l; localStorage.setItem('eh_lang', l);
  document.documentElement.dir = (l==='ar'?'rtl':'ltr'); document.documentElement.lang = l; rerender(); }
var current = { view: token ? 'home' : 'login', data: null };
function rerender(){ routes[current.view](); }

function api(path, opts){
  opts = opts || {};
  opts.headers = Object.assign({'Content-Type':'application/json'}, token?{Authorization:'Bearer '+token}:{});
  if (opts.body && typeof opts.body !== 'string') opts.body = JSON.stringify(opts.body);
  return fetch(path, opts).then(function(r){
    if (r.status === 401) { token=''; localStorage.removeItem('eh_token'); current.view='login'; rerender(); throw new Error('EH401'); }
    return r.json().then(function(j){
      // \u975E 2xx \u6216\u5E94\u7B54\u4F53\u5E26 error\uFF08\u5982\u8BFE\u7A0B\u88AB\u6559\u5E08\u4E2D\u9014\u4E0B\u7EBF\u8FD4 404 NOT_FOUND\uFF09\u4E00\u5F8B\u629B\uFF0C
      // \u522B\u628A\u9519\u8BEF\u4FE1\u5C01\u5F53\u6570\u636E\u6E32\u67D3\u6210 "undefined / undefined" \u6B7B\u9875\u3002
      if (!r.ok || (j && j.error)) throw new Error((j && j.error) || ('HTTP' + r.status));
      return j;
    });
  });
}
function el(html){ var d=document.createElement('div'); d.innerHTML=html; return d; }
function esc(s){ return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];}); }
function langBar(){ return '<span class="lang">'+['en','ar','zh'].map(function(l){
  return '<button data-l="'+l+'" class="'+(l===lang?'on':'')+'">'+(l==='en'?'EN':l==='ar'?'\u0639':'\u4E2D')+'</button>';}).join('')+'</span>'; }
function bindLang(root){ root.querySelectorAll('.lang button').forEach(function(b){
  b.onclick=function(){ setLang(b.dataset.l); }; }); }

var routes = {
  login: function(){
    app.innerHTML = '';
    var resume = !!current.resume;
    var card = resume
      ? '<div class="k" style="margin-bottom:6px">'+T('resumeTitle')+'</div>'+
        '<input id="code" autocapitalize="characters" autocomplete="off" placeholder="ABC-123" />'+
        '<input id="lcode" autocomplete="off" placeholder="'+T('learningCodePh')+'" />'+
        '<div class="err" id="err"></div>'+
        '<button class="btn pri" id="go" style="width:100%">'+T('resumeBtn')+'</button>'+
        '<div class="center" style="margin-top:12px"><a href="#" id="toggle" class="ws-link">'+T('backToJoin')+'</a></div>'
      : '<div class="k" style="margin-bottom:6px">'+T('enterCode')+'</div>'+
        '<input id="code" autocapitalize="characters" autocomplete="off" placeholder="ABC-123" />'+
        '<input id="sno" inputmode="numeric" autocomplete="off" placeholder="'+T('studentNoPh')+'" />'+
        '<input id="name" placeholder="'+T('yourName')+'" />'+
        '<div class="err" id="err"></div>'+
        '<button class="btn pri" id="go" style="width:100%">'+T('join')+'</button>'+
        '<div class="center" style="margin-top:12px"><a href="#" id="toggle" class="ws-link">'+T('resumeQ')+'</a></div>';
    var v = el('<div>'+
      '<div class="logo">H</div>'+
      '<h2 class="center">'+T('appName')+'</h2>'+
      '<div class="center" style="margin:8px 0 18px">'+langBar()+'</div>'+
      '<div class="card" style="max-width:380px;margin:0 auto">'+card+'</div>'+
      '<div class="foot">'+T('served')+'</div></div>');
    app.appendChild(v); bindLang(v);
    v.querySelector('#toggle').onclick=function(e){ e.preventDefault(); current.resume=!resume; rerender(); };
    v.querySelector('#go').onclick = function(){
      var code=v.querySelector('#code').value, btn=this, errEl=v.querySelector('#err');
      var path, body;
      if(resume){ path='/api/resume'; body={code:code, learningCode:(v.querySelector('#lcode').value||'').trim()}; }
      else { path='/api/join'; body={code:code, studentNo:(v.querySelector('#sno').value||'').trim(), name:v.querySelector('#name').value}; }
      btn.disabled=true;
      // \u88F8 fetch\uFF1Ajoin/resume \u7684 error \u662F\u767B\u5F55\u6001\u53CD\u9988\uFF08BAD_CODE/NOT_FOUND/CLASS_FULL/TOO_MANY\uFF09\uFF0C\u4E0D\u8D70 api() \u629B\u9519
      fetch(path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)})
        .then(function(r){ return r.json(); }).then(function(r){
          btn.disabled=false;
          if (r.error){ errEl.textContent = T(r.error==='BAD_CODE'?'badCode':r.error==='NOT_FOUND'?'codeNotFound':r.error==='CLASS_FULL'?'classFull':r.error==='TOO_MANY'?'tooMany':r.error==='BAD_NO'?'badNo':r.error==='BAD_MATCH'?'badMatch':'badName'); return; }
          token=r.token; localStorage.setItem('eh_token',token); localStorage.setItem('eh_name',r.name);
          current.resume=false; current.view='home'; rerender();
        }).catch(function(){ btn.disabled=false; errEl.textContent=T('netErr'); });
    };
  },

  // My Learning Workspace\uFF1A5 \u79D2\u5185\u77E5\u9053\u4E0B\u4E00\u6B65 \u2014\u2014 \u4ECA\u5929\u5B66\u4EC0\u4E48 / \u4ECA\u5929\u590D\u4E60 / \u6211\u7684\u8BFE\u7A0B\u3002\u5168\u4E3A\u771F\u5B9E\u8FDB\u5EA6\u6D3E\u751F\u3002
  home: function(){
    app.innerHTML = '<div class="k">'+T('loading')+'</div>';
    api('/api/home').then(function(h){
      app.innerHTML='';
      var nm = esc(h.name||localStorage.getItem('eh_name')||'');
      var pct = Math.max(0, Math.min(100, h.weekProgressPct||0));
      var t = h.today;
      var todayHtml = t
        ? '<div class="ws-kick">'+T('todayLearning')+'</div><h3 class="ws-h">'+esc(t.title)+'</h3>'+
          '<div class="k ws-meta">'+t.sections+T('sections')+' \xB7 '+t.quizCount+T('quiz')+'</div>'+
          '<button class="btn pri" id="goToday">'+(t.resume==='quiz'?T('continue'):T('learn'))+' \u2192</button>'
        : '<div class="ws-kick">'+T('todayLearning')+'</div><h3 class="ws-h">'+T('allDone')+'</h3><div class="k">'+T('allDoneSub')+'</div>';
      var rv = h.review||{mistakes:0,weakLessons:[],suggestMinutes:0,dueCards:0};
      var reviewHtml = rv.suggestMinutes>0
        ? '<div class="ws-kick amber">'+T('todayReview')+'</div>'+
          '<div class="ws-rvline">'+rv.suggestMinutes+' '+T('minutes')+' \xB7 '+(rv.dueCards||0)+' '+T('cardsDue')+' \xB7 '+rv.mistakes+' '+T('mistakesN')+'</div>'+
          '<button class="btn" id="goReview">'+T('startReview')+' \u2192</button>'
        : '<div class="ws-kick amber">'+T('todayReview')+'</div><div class="k ws-meta">'+T('noReview')+'</div>';
      var v = el('<div>'+
        '<div class="top"><h2>'+T('hi')+(nm?'\uFF0C'+nm:'')+'</h2><span class="sp"></span>'+langBar()+
          '<button class="btn" id="out" style="padding:4px 12px;font-size:12px">'+T('logout')+'</button></div>'+
        '<div class="card ws-prog"><div class="ws-prog-top"><span class="k">'+T('weekProgress')+'</span><b>'+pct+'%</b></div>'+
          '<div class="dk-prog" style="margin:6px 0 0"><div class="dk-bar" style="width:'+pct+'%"></div></div></div>'+
        '<div class="ws-two"><div class="card ws-today">'+todayHtml+'</div><div class="card ws-review">'+reviewHtml+'</div></div>'+
        '<div class="ws-tools"><button class="btn" id="tReview">\u{1F501} '+T('reviewCards')+'</button><button class="btn" id="tMem">\u{1F558} '+T('learningMemory')+'</button></div>'+
        '<h3 class="ws-sec">'+T('myCourses')+'</h3><div id="list"></div>'+
        '<div class="card ws-code"><span class="k">'+T('learningCode')+'\uFF1A</span><b class="ws-codev">'+esc(h.learningCode||'')+'</b>'+
          '<div class="k ws-meta">'+T('learningCodeTip')+'</div></div>'+
        '<div class="foot">'+nm+' \xB7 '+T('served')+'</div></div>');
      app.appendChild(v); bindLang(v);
      v.querySelector('#out').onclick=function(){ token=''; localStorage.removeItem('eh_token'); current.view='login'; rerender(); };
      var gt=v.querySelector('#goToday'); if(gt&&t) gt.onclick=function(){ current.view='deck'; current.data={id:t.id}; rerender(); };
      var gr=v.querySelector('#goReview'); if(gr) gr.onclick=function(){ current.view='review'; rerender(); };
      var tr=v.querySelector('#tReview'); if(tr) tr.onclick=function(){ current.view='review'; rerender(); };
      var tm=v.querySelector('#tMem'); if(tm) tm.onclick=function(){ current.view='memory'; rerender(); };
      var box = v.querySelector('#list');
      if(!h.courses.length){ box.innerHTML='<div class="card k">'+T('noLessons')+'</div>'; return; }
      h.courses.forEach(function(l){
        var stCls = l.status==='done'?'ok':l.status==='reading'?'src':'';
        var stLbl = l.status==='done'?T('statusDone'):l.status==='reading'?T('statusReading'):T('statusNew');
        var score = l.myScore ? ' \xB7 '+T('myScore')+l.myScore.score+'/'+l.myScore.total : '';
        var chip = stCls ? '<span class="chip '+stCls+'">'+stLbl+'</span>' : '<span class="chip ws-new">'+stLbl+'</span>';
        var c = el('<div class="card lesson-item"><div class="grow"><h3>'+esc(l.title)+'</h3>'+
          chip+' <span class="k">'+l.sections+T('sections')+' \xB7 '+l.quizCount+T('quiz')+score+'</span></div>'+
          '<button class="btn pri">'+(l.status==='new'?T('start'):T('continue'))+'</button></div>');
        c.querySelector('button').onclick=function(){ current.view='deck'; current.data={id:l.id}; rerender(); };
        box.appendChild(c);
      });
    }).catch(function(e){ if(e&&e.message==='EH401')return; app.innerHTML='<div class="card k">'+T('netErr')+'</div>'; });
  },

  // \u7FFB\u9875\u8BFE\u4EF6\uFF08PPT \u5F0F\uFF09\uFF1A\u5C01\u9762 \u2192 \u6BCF\u8282\u4E00\u9875\u5E7B\u706F\uFF08\u6807\u9898/\u5BFC\u8BED/\u8981\u70B9/\u793A\u610F\u56FE/\u771F\u56FE\uFF09\u2192 \u6BCF\u9898\u4E00\u9875\u4E92\u52A8\u4E60\u9898 \u2192 \u7ED3\u679C\u9875\u3002
  deck: function(){
    app.innerHTML = '<div class="k">'+T('loading')+'</div>';
    api('/api/lessons/'+current.data.id).then(function(l){
      if (l.error){ current.view='home'; rerender(); return; }
      // \u5E7B\u706F\u6B63\u6587\u6765\u6E90\uFF1A\u4F18\u5148 v6 sections\uFF1B\u65E7\u8BFE\u56DE\u843D \u56FE\u6587 HTML / \u5206\u8282\u8981\u70B9(digest)
      var secList = (l.sections&&l.sections.length) ? l.sections
        : (l.digest&&l.digest.length) ? l.digest.map(function(s){ return {title:s.sectionTitle, bullets:s.bullets, sourcePages:s.sourcePages}; })
        : [];
      var slides = [{type:'cover'}];
      // \u77E5\u8BC6\u5BFC\u56FE\u2461\uFF1A\u7ED3\u6784\u5316 center/branches \u5B58\u5728\u65F6\u63D2\u4E00\u9875\u53EF\u70B9\u5BFC\u56FE\uFF08\u5C01\u9762\u4E4B\u540E\u3001\u7AE0\u8282\u4E4B\u524D\uFF09
      if(l.knowledgeMap && l.knowledgeMap.branches && l.knowledgeMap.branches.length) slides.push({type:'mind'});
      secList.forEach(function(s,i){ slides.push({type:'content', sec:s, n:i+1, tot:secList.length}); });
      if(!secList.length && l.lessonHtml) slides.push({type:'html'});
      (l.quiz||[]).forEach(function(q,qi){ slides.push({type:'ex', q:q, qi:qi}); });
      if((l.quiz||[]).length) slides.push({type:'result'});
      deckState = { l:l, slides:slides, idx:0, answers:new Array((l.quiz||[]).length).fill(-1), result:null, submitting:false, qa:{open:false, answer:'', busy:false}, note:{open:false,busy:false} };
      renderDeck();
    }).catch(function(e){ if(e&&e.message==='EH401')return; app.innerHTML='<div class="card k">'+T('netErr')+'</div>'; });
  },

  // \u590D\u4E60\u5361\u7247\u2462 + \u667A\u80FD\u590D\u4E60\u8BA1\u5212\u2466\uFF1A\u8DE8\u8BFE\u5230\u671F\u5361\uFF08\u95F4\u9694\u91CD\u590D\uFF09\uFF0C\u7FFB\u5361\u81EA\u8BC4\u300C\u4E0D\u4F1A/\u6A21\u7CCA/\u5DF2\u638C\u63E1\u300D
  review: function(){
    app.innerHTML = '<div class="k">'+T('loading')+'</div>';
    api('/api/review').then(function(cards){
      cardDeck = { cards: cards||[], idx: 0, flipped: false }; renderCardReview();
    }).catch(function(e){ if(e&&e.message==='EH401')return; app.innerHTML='<div class="card k">'+T('netErr')+'</div>'; });
  },

  // \u4E2A\u4EBA\u5B66\u4E60\u8BB0\u5FC6\u2465\uFF1A\u771F\u5B9E\u5B66\u4E60\u8F68\u8FF9\u65F6\u95F4\u7EBF\uFF08\u6253\u5F00/\u6D4B\u8BD5/\u7EC3\u4E60/\u7B14\u8BB0/\u63D0\u95EE\uFF09
  memory: function(){
    app.innerHTML = '<div class="k">'+T('loading')+'</div>';
    api('/api/memory').then(function(events){
      app.innerHTML='';
      var v = el('<div><div class="dk-top"><button class="btn xs" id="back">'+T('back')+'</button><div class="dk-title">'+T('learningMemory')+'</div>'+langBar()+'</div><div id="tl"></div></div>');
      app.appendChild(v); bindLang(v);
      v.querySelector('#back').onclick=function(){ current.view='home'; rerender(); };
      var tl=v.querySelector('#tl');
      if(!events||!events.length){ tl.innerHTML='<div class="card k">'+T('noMemory')+'</div>'; return; }
      events.forEach(function(ev){
        var icon = ev.kind==='test'?'\u{1F4DD}':ev.kind==='practice'?'\u{1F501}':ev.kind==='note'?'\u270F\uFE0F':ev.kind==='ask'?'\u{1F4AC}':'\u{1F4D6}';
        var lbl = ev.kind==='test'?(T('memTest')+' \xB7 '+ev.score+'/'+ev.total):ev.kind==='practice'?(T('memPractice')+' \xB7 '+ev.score+'/'+ev.total):ev.kind==='note'?T('memNote'):ev.kind==='ask'?T('memAsk'):T('memOpen');
        var extra = (ev.kind==='note'||ev.kind==='ask') && ev.text ? '<div class="k tl-txt">'+esc(ev.text)+'</div>' : '';
        tl.appendChild(el('<div class="card tl-item"><div class="tl-ic">'+icon+'</div><div class="grow"><div class="tl-lbl">'+lbl+'</div><div class="k">'+esc(ev.title||'')+' \xB7 '+fmtTime(ev.at)+'</div>'+extra+'</div></div>'));
      });
    }).catch(function(e){ if(e&&e.message==='EH401')return; app.innerHTML='<div class="card k">'+T('netErr')+'</div>'; });
  }
};

// \u76F8\u5BF9\u65F6\u95F4\uFF08\u5B66\u4E60\u8BB0\u5FC6\u65F6\u95F4\u7EBF\u7528\uFF1B\u65E0\u7B2C\u4E09\u65B9\u5E93\uFF09
function fmtTime(ts){
  var d = Date.now()-Number(ts||0), h=Math.floor(d/3600000), day=Math.floor(d/86400000);
  if(d<60000) return T('asking').replace(/\u2026|.../,'')||'now';
  if(h<1) return Math.floor(d/60000)+'m';
  if(day<1) return h+'h';
  if(day<30) return day+'d';
  try{ return new Date(Number(ts)).toLocaleDateString(); }catch(e){ return ''; }
}

// \u2014\u2014 \u590D\u4E60\u5361\u7247 widget\uFF08\u7FFB\u5361 + \u95F4\u9694\u91CD\u590D\u81EA\u8BC4\uFF09\u2014\u2014
var cardDeck = null;
function renderCardReview(){
  var cd = cardDeck; if(!cd) return;
  app.innerHTML='';
  var head = '<div class="dk-top"><button class="btn xs" id="back">'+T('back')+'</button><div class="dk-title">'+T('reviewCards')+'</div>'+langBar()+'</div>';
  if(!cd.cards.length || cd.idx>=cd.cards.length){
    var msg = cd.cards.length? T('reviewDone') : T('noCards');
    var v0 = el('<div>'+head+'<div class="slide center"><div class="dk-face">'+(cd.cards.length?'\u{1F389}':'\u2705')+'</div><h3 style="margin:10px 0 16px">'+msg+'</h3><button class="btn pri" id="done">'+T('back')+'</button></div></div>');
    app.appendChild(v0); bindLang(v0);
    var go=function(){ current.view='home'; rerender(); }; v0.querySelector('#back').onclick=go; v0.querySelector('#done').onclick=go;
    return;
  }
  var c = cd.cards[cd.idx];
  var body = '<div class="dk-prog"><div class="dk-bar" style="width:'+Math.round((cd.idx)/cd.cards.length*100)+'%"></div></div>'+
    '<div class="slide"><div class="dk-kicker">'+(cd.idx+1)+' '+T('of')+' '+cd.cards.length+(c.lessonTitle?' \xB7 '+esc(c.lessonTitle):'')+'</div>'+
    '<div class="cardface"><div class="cardq">'+esc(c.front)+'</div>'+
    (cd.flipped?('<div class="carda">'+esc(c.back)+'</div>'+(c.sourcePage?'<div style="margin-top:8px"><span class="chip src">'+T('source')+c.sourcePage+'</span></div>':'')):'')+'</div>'+
    (cd.flipped
      ? '<div class="rate-row"><button class="btn rate-bad" data-r="unknown">'+T('rateUnknown')+'</button><button class="btn rate-mid" data-r="fuzzy">'+T('rateFuzzy')+'</button><button class="btn rate-good" data-r="known">'+T('rateKnown')+'</button></div>'
      : '<div class="center" style="margin-top:16px"><button class="btn pri lg" id="flip">'+T('showBack')+'</button></div>')+
    '</div>';
  var v = el('<div>'+head+body+'</div>');
  app.appendChild(v); bindLang(v);
  v.querySelector('#back').onclick=function(){ current.view='home'; rerender(); };
  var fb=v.querySelector('#flip'); if(fb) fb.onclick=function(){ cd.flipped=true; renderCardReview(); };
  v.querySelectorAll('.rate-row .btn').forEach(function(b){ b.onclick=function(){
    api('/api/cards/rate',{method:'POST',body:{cardId:c.id, rating:b.dataset.r}}).catch(function(){});
    cd.idx++; cd.flipped=false; renderCardReview();
  }; });
}

var deckState = null;

function deckExitHome(){ current.view='home'; deckState=null; rerender(); }

function submitDeck(cb){
  var d = deckState; if(d.result){ cb&&cb(); return; }
  d.submitting = true;
  api('/api/lessons/'+d.l.id+'/submit',{method:'POST',body:{answers:d.answers}}).then(function(r){
    d.result=r; d.submitting=false; cb&&cb();
  }).catch(function(e){ d.submitting=false; if(e&&e.message==='EH401')return; renderDeck('net'); });
}

function renderDeck(errFlag){
  var d = deckState; if(!d) return;
  var l = d.l, s = d.slides[d.idx], total = d.slides.length;
  var quizCount = (l.quiz||[]).length;
  var exTotal = d.practice ? (d.pcount||quizCount) : quizCount; // \u7EC3\u4E60\u6A21\u5F0F\u9898\u6570\uFF08\u5FEB\u901F\u68C0\u6D4B=5\uFF09
  app.innerHTML='';
  var head = '<div class="dk-top"><button class="btn xs" id="exit">'+T('back')+'</button>'+
    '<div class="dk-title">'+esc(l.title)+'</div>'+langBar()+'</div>'+
    '<div class="dk-prog"><div class="dk-bar" style="width:'+Math.round((d.idx+1)/total*100)+'%"></div></div>';
  var bodyHtml='';
  if(s.type==='cover'){
    var secCount = d.slides.filter(function(x){return x.type==='content';}).length;
    bodyHtml = '<div class="slide cover"><div class="dk-badge">'+T('appName')+'</div>'+
      '<h1 class="dk-h1">'+esc(l.title)+'</h1>'+
      '<div class="dk-meta">'+secCount+T('sections')+' \xB7 '+quizCount+T('quiz')+'</div>'+
      (l.audioUrl?'<div class="dk-audio"><div class="dk-avlabel">\u{1F3A7} '+T('audioSummary')+'</div>'+
        '<audio controls preload="none" src="'+esc(l.audioUrl)+'?t='+encodeURIComponent(token)+'"></audio></div>':'')+
      '<button class="btn pri lg" id="start">'+T('learn')+' \u2192</button></div>';
  } else if(s.type==='content'){
    var sec=s.sec;
    bodyHtml = '<div class="slide"><div class="dk-kicker">'+s.n+' / '+s.tot+'</div>'+
      '<h2 class="dk-h2">'+esc(sec.title)+'</h2>'+
      (sec.avatarVideoUrl?'<div class="dk-avatar"><div class="dk-avlabel">\u{1F9D1}\u200D\u{1F3EB} '+T('avatarTeacher')+'</div>'+
        '<video class="dk-vid" controls preload="metadata" playsinline src="'+esc(sec.avatarVideoUrl)+'?t='+encodeURIComponent(token)+'"></video></div>':'')+
      (sec.intro?'<p class="dk-intro">'+esc(sec.intro)+'</p>':'')+
      (sec.bullets&&sec.bullets.length?'<ul class="dk-ul">'+sec.bullets.map(function(b){return '<li>'+esc(b)+'</li>';}).join('')+'</ul>':'')+
      (sec.diagramSvg?'<div class="dk-fig">'+sec.diagramSvg+'</div>':'')+
      (sec.imageDataUrl?'<figure class="dk-photo"><img src="'+sec.imageDataUrl+'" alt="'+esc(sec.imageCaption||sec.title)+'"/>'+
        '<figcaption>'+esc(sec.imageCaption||'')+(sec.imageSourceUrl?' \xB7 <a href="'+esc(sec.imageSourceUrl)+'" target="_blank" rel="noopener">'+T('source').replace(/\\s*(P\\.?|\u0635)\\s*$/,'')+'</a>':'')+'</figcaption></figure>':'')+
      (sec.sourcePages&&sec.sourcePages.length?'<div class="k" style="margin-top:8px">'+T('source')+' '+esc(sec.sourcePages.join(', '))+'</div>':'')+
      '</div>';
  } else if(s.type==='mind'){
    var km=l.knowledgeMap||{center:'',branches:[]}, ns=l.nodeStates||{}, mo=(d.mindOpen==null?-1:d.mindOpen);
    bodyHtml = '<div class="slide"><div class="dk-kicker">'+T('knowledgeMapView')+'</div>'+
      '<div class="mind-center">'+esc(km.center||l.title)+'</div>'+
      '<div class="k" style="margin-bottom:10px">'+T('mapTapHint')+'</div><div class="mind-list">'+
      (km.branches||[]).map(function(b,bi){
        var stt=ns[bi], sc = stt==='known'?'<span class="chip ok">'+T('mastered')+'</span>':stt==='weak'?'<span class="chip bad">'+T('weakChip')+'</span>':'';
        var det = (mo===bi)? '<ul class="mind-pts">'+(b.points||[]).map(function(p){return '<li>'+esc(p)+'</li>';}).join('')+
          '</ul><div class="mind-acts"><button class="btn xs" data-mk="'+bi+'" data-st="known">\u2713 '+T('markKnown')+'</button>'+
          '<button class="btn xs" data-mk="'+bi+'" data-st="weak">\u25D0 '+T('markWeak')+'</button></div>' : '';
        return '<div class="mind-node'+(mo===bi?' open':'')+'"><div class="mind-node-head" data-b="'+bi+'"><b>'+esc(b.label)+'</b> '+sc+'<span class="mind-caret">'+(mo===bi?'\u25BE':'\u25B8')+'</span></div>'+det+'</div>';
      }).join('')+'</div></div>';
  } else if(s.type==='html'){
    bodyHtml = '<div class="slide"><div class="card">'+l.lessonHtml+'</div></div>';
  } else if(s.type==='ex'){
    var q=s.q, qi=s.qi, picked=d.answers[qi];
    bodyHtml = '<div class="slide"><div class="dk-kicker">'+T('exercises')+' '+(qi+1)+' / '+exTotal+'</div>'+
      '<h2 class="dk-q">'+esc(q.q)+'</h2><div id="opts">'+
      q.options.map(function(o,oi){ return '<button class="opt'+(picked===oi?' sel':'')+'" data-o="'+oi+'">'+esc(o)+'</button>'; }).join('')+
      '</div></div>';
  } else if(s.type==='result'){
    var r=d.result;
    if(!r){ bodyHtml='<div class="slide center"><div class="k">'+T('loading')+'</div></div>'; }
    else {
      var pct = r.total? Math.round(r.score/r.total*100):0;
      // \u8584\u5F31\u70B9\uFF1A\u672C\u6B21\u7B54\u9519\u9898\u5B9A\u4F4D\u5230\u6765\u6E90\u9875\uFF08\u5BF9\u5E94\u77E5\u8BC6\u5BFC\u56FE/\u539F\u6587\u7AE0\u8282\uFF09
      var weakPg = (r.detail||[]).filter(function(x){return x&&!x.correct&&x.sourcePage;}).map(function(x){return x.sourcePage;});
      var weakHtml = weakPg.length? '<div class="card weak-box"><div class="ws-kick amber">'+T('weakPoints')+'</div><div>'+T('source')+' '+weakPg.join(', ')+'</div></div>' : '';
      bodyHtml = '<div class="slide"><div class="center"><div class="dk-face">'+(pct>=60?'\u{1F389}':'\u{1F4AA}')+'</div>'+
        '<div class="score">'+r.score+' / '+r.total+'</div>'+
        '<div class="dk-meta">'+(pct>=60?T('wellDone'):T('keepGoing'))+'</div></div>'+
        weakHtml+
        '<div class="ws-kick" style="margin-top:16px">'+T('practice')+'</div>'+
        '<div class="practice-row"><button class="btn" data-pm="quick">'+T('modeQuick')+'</button>'+
        '<button class="btn" data-pm="chapter">'+T('modeChapter')+'</button>'+
        '<button class="btn" data-pm="exam">'+T('modeExam')+'</button></div>'+
        '<h3 style="margin:18px 0 8px">'+T('reviewAns')+'</h3><div id="rev"></div></div>';
    }
  }
  var ll = (l.lang==='ar')?'ar':(l.lang==='en-US')?'en':(l.lang==='zh-CN')?'zh':'';
  var app2 = el('<div>'+head+'<div id="dkbody"'+(ll?' lang="'+ll+'" dir="'+(ll==='ar'?'rtl':'ltr')+'"':'')+'>'+bodyHtml+'</div>'+
    (errFlag==='net'?'<div class="err" style="text-align:center">'+T('netErr')+'</div>':'')+
    '<div class="dk-nav">'+
      (d.idx>0?'<button class="btn" id="prev">\u2190 '+T('prev')+'</button>':'<span></span>')+
      '<span class="dk-pos">'+(d.idx+1)+' '+T('of')+' '+total+'</span>'+
      navRightBtn(d,s,total,exTotal)+
    '</div></div>');
  app.appendChild(app2); bindLang(app2);
  app2.querySelector('#exit').onclick=deckExitHome;
  var startB=app2.querySelector('#start'); if(startB) startB.onclick=function(){ d.idx=1; renderDeck(); };
  var prevB=app2.querySelector('#prev'); if(prevB) prevB.onclick=function(){ if(d.idx>0){d.idx--;renderDeck();} };
  var nextB=app2.querySelector('#next'); if(nextB) nextB.onclick=deckNext;
  // \u4E60\u9898\u9009\u9879
  var opts=app2.querySelector('#opts');
  if(opts) opts.addEventListener('click',function(e){ var b=e.target.closest('.opt'); if(!b)return;
    d.answers[s.qi]=Number(b.dataset.o);
    opts.querySelectorAll('.opt').forEach(function(x){x.classList.remove('sel');}); b.classList.add('sel');
    var nb=app2.querySelector('#next'); if(nb) nb.disabled=false;
  });
  // \u7ED3\u679C\u9875\u590D\u76D8\uFF1A\u53EA\u5217\u672C\u6B21\u5B9E\u9645\u4F5C\u7B54\u7684\u9898\uFF08\u7EC3\u4E60\u5FEB\u901F\u68C0\u6D4B=5 \u9898\u65F6\u4E0D\u663E\u793A\u672A\u7B54\u7684\uFF09
  var rev=app2.querySelector('#rev');
  if(rev && d.result){ (d.result.detail||[]).forEach(function(det,qi){
    var q=(l.quiz||[])[qi]; if(!q) return;
    rev.appendChild(el('<div class="card"><b>'+(qi+1)+'. '+esc(q.q)+'</b><div style="margin-top:8px">'+
      q.options.map(function(o,oi){ var cls='opt sm'; if(oi===det.answer)cls+=' right'; else if(oi===d.answers[qi]&&!det.correct)cls+=' wrong';
        return '<div class="'+cls+'">'+esc(o)+'</div>'; }).join('')+
      '</div><div class="k" style="margin-top:6px">'+T('explain')+': '+esc(det.explain)+
      (det.sourcePage?' <span class="chip src">'+T('source')+det.sourcePage+'</span>':'')+'</div></div>'));
  }); }
  // \u7EC3\u4E60\u6A21\u5F0F\u9009\u62E9\uFF08\u7ED3\u679C\u9875\uFF09\u2192 startPractice
  app2.querySelectorAll('.practice-row .btn').forEach(function(b){ b.onclick=function(){ startPractice(b.dataset.pm); }; });
  // \u77E5\u8BC6\u5BFC\u56FE\u4EA4\u4E92\uFF1A\u70B9\u6807\u9898\u5C55\u5F00/\u6536\u8D77\uFF0C\u6807\u8BB0\u638C\u63E1/\u8584\u5F31
  app2.querySelectorAll('.mind-node-head').forEach(function(h){ h.onclick=function(){
    var bi=Number(h.dataset.b); d.mindOpen = (d.mindOpen===bi? -1 : bi); renderDeck();
  }; });
  app2.querySelectorAll('[data-mk]').forEach(function(b){ b.onclick=function(e){ e.stopPropagation();
    var bi=Number(b.dataset.mk), stt=b.dataset.st;
    api('/api/lessons/'+l.id+'/node',{method:'POST',body:{node:bi, state:stt}}).catch(function(){});
    l.nodeStates = l.nodeStates||{}; l.nodeStates[bi]=stt; renderDeck();
  }; });
  // \u7AE0\u8282\u7B14\u8BB0\uFF1A\u5185\u5BB9\u9875\u53EF\u8BB0\u7B14\u8BB0\uFF08\u6302\u5728\u5F53\u524D\u7AE0\u8282 index\uFF09
  if(s.type==='content'){
    var nb=d.note||(d.note={open:false,busy:false});
    var secIdx=(s.n||1)-1;
    var mine=(l.notes||[]).filter(function(x){return x.section===secIdx;});
    var np=el('<div class="dk-notes">'+
      (mine.length?'<div class="notes-list">'+mine.map(function(n){return '<div class="note-item"><span class="grow">'+esc(n.text)+'</span><button class="note-del" data-id="'+n.id+'">'+T('del')+'</button></div>';}).join('')+'</div>':'')+
      (nb.open
        ? '<div class="note-edit"><textarea id="noteTx" rows="2" maxlength="800" placeholder="'+T('notePh')+'"></textarea>'+
          '<div style="margin-top:6px"><button class="btn pri xs" id="noteSave" '+(nb.busy?'disabled':'')+'>'+T('saveNote')+'</button></div></div>'
        : '<button class="btn xs" id="noteBtn">\u270F\uFE0F '+T('addNote')+'</button>')+'</div>');
    app2.querySelector('#dkbody').appendChild(np);
    var nbt=np.querySelector('#noteBtn'); if(nbt) nbt.onclick=function(){ nb.open=true; renderDeck(); setTimeout(function(){var t=app.querySelector('#noteTx'); if(t)t.focus();},0); };
    var nsv=np.querySelector('#noteSave'); if(nsv) nsv.onclick=function(){ var tx=app.querySelector('#noteTx'); var val=(tx&&tx.value||'').trim(); if(!val){ nb.open=false; renderDeck(); return; }
      nb.busy=true; renderDeck();
      api('/api/lessons/'+l.id+'/note',{method:'POST',body:{section:secIdx, text:val}}).then(function(r){
        nb.busy=false; nb.open=false; if(r&&r.id){ l.notes=l.notes||[]; l.notes.push({id:r.id,section:secIdx,text:val,at:r.at||Date.now()}); } renderDeck();
      }).catch(function(){ nb.busy=false; nb.open=false; renderDeck(); }); };
    np.querySelectorAll('.note-del').forEach(function(b){ b.onclick=function(){ var id=b.dataset.id;
      api('/api/notes/'+id+'/delete',{method:'POST'}).catch(function(){});
      l.notes=(l.notes||[]).filter(function(x){return x.id!==id;}); renderDeck(); }; });
  }
  // \u53D7\u9650\u95EE\u7B54\u6D6E\u5C42\uFF1A\u53EA\u89E3\u7B54\u672C\u8BFE\u5185\u5BB9\uFF0C\u8D85\u8303\u56F4\u62D2\u7B54\uFF08\u540E\u7AEF\u951A\u5B9A + \u9650\u6D41 + \u9632\u6CE8\u5165\uFF09
  var q0 = d.qa || (d.qa={open:false,answer:'',busy:false});
  var fab = el('<div class="dk-qa">'+
    (q0.open
      ? '<div class="dk-qa-panel"><div class="dk-qa-head"><b>'+T('askTeacher')+'</b><button class="dk-qa-x" id="qaClose" aria-label="'+T('closeQa')+'">\xD7</button></div>'+
        '<div class="dk-qa-tip">'+T('qaTip')+'</div>'+
        '<div class="dk-qa-ans" id="qaAns">'+(q0.busy?('<span class="k">'+T('asking')+'</span>'):(q0.answer?esc(q0.answer):''))+'</div>'+
        '<div class="dk-qa-in"><input id="qaInput" maxlength="400" placeholder="'+T('askPh')+'" '+(q0.busy?'disabled':'')+'/>'+
        '<button class="btn pri" id="qaSend" '+(q0.busy?'disabled':'')+'>'+T('send')+'</button></div></div>'
      : '')+
    '<button class="dk-qa-fab" id="qaFab" title="'+T('askTeacher')+'">\u{1F4AC}</button></div>');
  app2.appendChild(fab);
  var qaFab=app2.querySelector('#qaFab'); if(qaFab) qaFab.onclick=function(){ q0.open=!q0.open; renderDeck(); setTimeout(function(){ var i=app.querySelector('#qaInput'); if(i)i.focus(); },0); };
  var qaClose=app2.querySelector('#qaClose'); if(qaClose) qaClose.onclick=function(){ q0.open=false; renderDeck(); };
  function doAsk(){ var qi=app.querySelector('#qaInput'); if(!qi)return; var qv=(qi.value||'').trim();
    if(!qv){ q0.answer=T('qaEmpty'); renderDeck(); return; }
    q0.busy=true; q0.answer=''; renderDeck();
    api('/api/lessons/'+l.id+'/ask',{method:'POST',body:{q:qv}}).then(function(r){
      q0.busy=false; q0.answer=(r&&r.answer)||T('qaErr'); renderDeck();
    }).catch(function(e){ if(e&&e.message==='EH401')return; q0.busy=false;
      var m=(e&&e.message)||''; q0.answer = m==='TOO_MANY'?T('qaTooMany') : m==='EMPTY'?T('qaEmpty') : T('qaErr'); renderDeck(); });
  }
  var qaSend=app2.querySelector('#qaSend'); if(qaSend) qaSend.onclick=doAsk;
  var qaInput=app2.querySelector('#qaInput'); if(qaInput) qaInput.onkeydown=function(e){ if(e.key==='Enter'){ e.preventDefault(); doAsk(); } };
}

function navRightBtn(d,s,total,exTotal){
  if(s.type==='result') return '<button class="btn pri" id="next">'+T('doneLesson')+'</button>';
  // \u6700\u540E\u4E00\u9053\u4E60\u9898 \u2192 \u4EA4\u5377\uFF1B\u5C01\u9762\u5DF2\u6709 start \u6309\u94AE\u4F46\u4E5F\u7ED9 next \u515C\u5E95
  var isLastEx = (s.type==='ex' && s.qi===exTotal-1);
  var label = isLastEx ? T('submit') : (s.type==='cover'? T('learn') : T('next'));
  var dis = (s.type==='ex' && d.answers[s.qi]===-1) ? ' disabled' : '';
  return '<button class="btn pri" id="next"'+dis+'>'+label+' \u2192</button>';
}

// \u7EC3\u4E60\u6A21\u5F0F\u2463\uFF1A\u4ECE\u7ED3\u679C\u9875\u53D1\u8D77\uFF08\u53EF\u91CD\u8003\uFF0C\u9519\u9898\u81EA\u52A8\u6210\u5361\uFF09\u3002quick=\u524D 5 \u9898\uFF0Cchapter/exam=\u5168\u90E8\u3002
function startPractice(mode){
  var d=deckState, quiz=d.l.quiz||[];
  var n = mode==='quick'? Math.min(5, quiz.length) : quiz.length;
  if(!n) return;
  var slides=[]; for(var i=0;i<n;i++) slides.push({type:'ex', q:quiz[i], qi:i});
  slides.push({type:'result'});
  d.slides=slides; d.idx=0; d.answers=new Array(n).fill(-1); d.result=null; d.practice=true; d.mode=mode; d.pcount=n; d.submitting=false;
  renderDeck();
}
function practiceSubmit(cb){
  var d=deckState; if(d.result){ cb&&cb(); return; }
  d.submitting=true;
  api('/api/lessons/'+d.l.id+'/practice',{method:'POST',body:{mode:d.mode||'chapter', answers:d.answers}}).then(function(r){
    d.result=r; d.submitting=false; cb&&cb();
  }).catch(function(e){ d.submitting=false; if(e&&e.message==='EH401')return; renderDeck('net'); });
}

function deckNext(){
  var d=deckState, s=d.slides[d.idx];
  var exTotal = d.practice ? (d.pcount||(d.l.quiz||[]).length) : (d.l.quiz||[]).length;
  if(s.type==='ex' && d.answers[s.qi]===-1) return;      // \u672A\u4F5C\u7B54\u4E0D\u524D\u8FDB\uFF08\u6309\u94AE\u7981\u7528 + \u952E\u76D8\u4E5F\u62E6\uFF09
  if(s.type==='ex' && s.qi===exTotal-1){                 // \u6700\u540E\u4E00\u9898 \u2192 \u4EA4\u5377/\u7EC3\u4E60\u5224\u5206\u540E\u8FDB\u7ED3\u679C\u9875
    (d.practice ? practiceSubmit : submitDeck)(function(){ d.idx++; renderDeck(); }); return;
  }
  if(s.type==='result'){ deckExitHome(); return; }
  if(d.idx < d.slides.length-1){ d.idx++; renderDeck(); }
}

// \u952E\u76D8\u5DE6\u53F3\u7FFB\u9875\uFF08\u4E60\u9898\u672A\u4F5C\u7B54\u65F6\u53F3\u952E\u4E0D\u524D\u8FDB\uFF09
document.addEventListener('keydown', function(e){
  if(current.view!=='deck' || !deckState) return;
  if(e.key==='ArrowLeft'){ if(deckState.idx>0){deckState.idx--;renderDeck();} }
  else if(e.key==='ArrowRight'){ deckNext(); }
});
document.documentElement.dir = (lang==='ar'?'rtl':'ltr'); document.documentElement.lang = lang;
rerender();
</script>
</body>
</html>`;

// ../../../totalclaw-solutions/solutions/workbench-edu-hub/src/main/services/eduHubProc.ts
var import_lanServer = require("host:apps/desktop-shell/src/main/services/lanServer.ts");
var JOIN_FAIL_LIMIT = 10;
var JOIN_LOCK_MS = 6e4;
var EduHubProc = class {
  constructor(store2, logger) {
    this.store = store2;
    this.logger = logger;
    const joinFails = new import_lanServer.RateBucket(JOIN_FAIL_LIMIT, JOIN_LOCK_MS);
    this.lan = new import_lanServer.LanServer({
      name: "edu-hub",
      pageHtml: STUDENT_PAGE_HTML,
      logger,
      auth: (token) => store2.authStudent(token),
      onStop: () => store2.flushStudents(),
      routes: this.routes(joinFails)
    });
  }
  lan;
  status() {
    return {
      running: this.lan.running,
      port: this.lan.port,
      url: this.lan.url,
      classCode: this.store.classCode,
      onlineStudents: this.store.onlineCount(),
      totalStudents: this.store.studentCount()
    };
  }
  async start() {
    await this.lan.start();
    return this.status();
  }
  async stop() {
    await this.lan.stop();
  }
  routes(joinFails) {
    const s = this.store;
    return [
      { method: "GET", path: "/api/ping", auth: "none", handler: (c) => c.json(200, { ok: true }) },
      {
        method: "POST",
        path: "/api/join",
        auth: "none",
        handler: async (c) => {
          if (joinFails.locked(c.clientIp)) {
            c.json(429, { error: "TOO_MANY" });
            return;
          }
          const body = await c.body();
          try {
            const r = s.joinStudent(String(body?.code || ""), String(body?.studentNo || ""), String(body?.name || ""));
            joinFails.pass(c.clientIp);
            c.json(200, r);
          } catch (e) {
            const msg = e?.message;
            const code = msg === "BAD_CODE" ? "BAD_CODE" : msg === "CLASS_FULL" ? "CLASS_FULL" : msg === "BAD_NO" ? "BAD_NO" : msg === "BAD_MATCH" ? "BAD_MATCH" : "BAD_NAME";
            if (code === "BAD_CODE" && joinFails.fail(c.clientIp)) {
              this.logger?.warn?.("edu-hub", (0, import_i18n.t)("\u73ED\u7EA7\u7801\u5C1D\u8BD5\u8FC7\u4E8E\u9891\u7E41\uFF0C\u5DF2\u4E34\u65F6\u9650\u6D41"), { ip: c.clientIp });
            }
            c.json(200, { error: code });
          }
        }
      },
      {
        // 学习码接续：凭 班级码 + 学习码 找回既有档案。与 join 同一个限流桶（防枚举学习码）
        method: "POST",
        path: "/api/resume",
        auth: "none",
        handler: async (c) => {
          if (joinFails.locked(c.clientIp)) {
            c.json(429, { error: "TOO_MANY" });
            return;
          }
          const body = await c.body();
          try {
            const r = s.resumeStudent(String(body?.code || ""), String(body?.learningCode || ""));
            joinFails.pass(c.clientIp);
            c.json(200, r);
          } catch (e) {
            const code = e?.message === "BAD_CODE" ? "BAD_CODE" : "NOT_FOUND";
            if (joinFails.fail(c.clientIp)) {
              this.logger?.warn?.("edu-hub", (0, import_i18n.t)("\u63A5\u7EED\u5C1D\u8BD5\u8FC7\u4E8E\u9891\u7E41\uFF0C\u5DF2\u4E34\u65F6\u9650\u6D41"), { ip: c.clientIp });
            }
            c.json(200, { error: code });
          }
        }
      },
      // 数字人成片 / 音频总结：<video> 与 <audio> 不带 Authorization 头，走 ?t=<token>。
      // 成片是本机文件，只发给持有效学生 token 的请求（校内网，成片不出机）。
      {
        method: "GET",
        path: /^\/media\/([\w-]+)\/(\d+)\.mp4$/,
        auth: "query",
        handler: (c) => c.serveFile(s.avatarVideoPath(c.params[0], Number(c.params[1])), "video/mp4")
      },
      {
        method: "GET",
        path: /^\/audio\/([\w-]+)\.mp3$/,
        auth: "query",
        handler: (c) => c.serveFile(s.audioPath(c.params[0]), "audio/mpeg")
      },
      { method: "GET", path: "/api/home", auth: "bearer", handler: (c) => c.json(200, s.homeForStudent(c.principal.id)) },
      { method: "GET", path: "/api/lessons", auth: "bearer", handler: (c) => c.json(200, s.publishedLessonsForStudent(c.principal.id)) },
      {
        method: "GET",
        path: /^\/api\/lessons\/([\w-]+)$/,
        auth: "bearer",
        handler: (c) => {
          const lesson = s.lessonForStudent(c.params[0], c.principal.id);
          c.json(lesson ? 200 : 404, lesson ?? { error: "NOT_FOUND" });
        }
      },
      {
        method: "POST",
        path: /^\/api\/lessons\/([\w-]+)\/submit$/,
        auth: "bearer",
        handler: async (c) => {
          const body = await c.body();
          const answers = Array.isArray(body?.answers) ? body.answers.map((n) => Number(n)) : [];
          try {
            c.json(200, s.submitQuiz(c.principal.id, c.params[0], answers));
          } catch {
            c.json(404, { error: "NOT_FOUND" });
          }
        }
      },
      {
        // 受限问答：答案严格锚定本课内容，超范围拒答（store 侧限流 / 题长 / 防注入）
        method: "POST",
        path: /^\/api\/lessons\/([\w-]+)\/ask$/,
        auth: "bearer",
        handler: async (c) => {
          const body = await c.body();
          try {
            c.json(200, await s.answerQuestion(c.params[0], c.principal.id, String(body?.q || "")));
          } catch (e) {
            const code = e?.message;
            const status = code === "TOO_MANY" ? 429 : code === "NOT_FOUND" ? 404 : 200;
            c.json(status, { error: code === "TOO_MANY" || code === "NOT_FOUND" || code === "EMPTY" || code === "LLM" ? code : "INTERNAL" });
          }
        }
      },
      // ── 学习卡③ / 复习计划⑦ ──
      {
        method: "GET",
        path: /^\/api\/lessons\/([\w-]+)\/cards$/,
        auth: "bearer",
        handler: (c) => c.json(200, s.cardsForLesson(c.principal.id, c.params[0]))
      },
      { method: "GET", path: "/api/review", auth: "bearer", handler: (c) => c.json(200, s.dueCards(c.principal.id, 40)) },
      {
        method: "POST",
        path: "/api/cards/rate",
        auth: "bearer",
        handler: async (c) => {
          const body = await c.body();
          const rating = String(body?.rating || "");
          if (rating !== "unknown" && rating !== "fuzzy" && rating !== "known") {
            c.json(200, { error: "BAD_RATING" });
            return;
          }
          try {
            c.json(200, s.rateCard(c.principal.id, String(body?.cardId || ""), rating));
          } catch {
            c.json(404, { error: "NOT_FOUND" });
          }
        }
      },
      // ── 知识导图节点掌握② ──
      {
        method: "POST",
        path: /^\/api\/lessons\/([\w-]+)\/node$/,
        auth: "bearer",
        handler: async (c) => {
          const body = await c.body();
          const state = String(body?.state || "");
          if (state !== "known" && state !== "weak") {
            c.json(200, { error: "BAD_STATE" });
            return;
          }
          try {
            s.markNode(c.principal.id, c.params[0], Number(body?.node) || 0, state);
            c.json(200, { ok: true });
          } catch {
            c.json(404, { error: "NOT_FOUND" });
          }
        }
      },
      // ── 模拟测试④·练习模式（可重考，错题自动成卡）──
      {
        method: "POST",
        path: /^\/api\/lessons\/([\w-]+)\/practice$/,
        auth: "bearer",
        handler: async (c) => {
          const body = await c.body();
          const answers = Array.isArray(body?.answers) ? body.answers.map((n) => Number(n)) : [];
          try {
            c.json(200, s.practiceQuiz(c.principal.id, c.params[0], String(body?.mode || "chapter"), answers));
          } catch {
            c.json(404, { error: "NOT_FOUND" });
          }
        }
      },
      // ── 个人笔记 / 学习记忆⑥ ──
      {
        method: "POST",
        path: /^\/api\/lessons\/([\w-]+)\/note$/,
        auth: "bearer",
        handler: async (c) => {
          const body = await c.body();
          try {
            c.json(200, s.addNote(c.principal.id, c.params[0], Number(body?.section) || 0, String(body?.text || "")));
          } catch (e) {
            c.json(e?.message === "EMPTY" ? 200 : 404, { error: e?.message === "EMPTY" ? "EMPTY" : "NOT_FOUND" });
          }
        }
      },
      {
        method: "POST",
        path: /^\/api\/notes\/([\w-]+)\/delete$/,
        auth: "bearer",
        handler: (c) => {
          s.deleteNote(c.principal.id, c.params[0]);
          c.json(200, { ok: true });
        }
      },
      { method: "GET", path: "/api/memory", auth: "bearer", handler: (c) => c.json(200, s.memoryTimeline(c.principal.id, 60)) }
    ];
  }
};

// ../../../totalclaw-solutions/solutions/workbench-edu-hub/src/main/ipc/eduHub.ipc.ts
var import_digitalHumanProc = require("host:apps/desktop-shell/src/main/services/digitalHumanProc.ts");
var import_councilChatRouter = require("host:apps/desktop-shell/src/main/services/councilChatRouter.ts");
var import_accountScope = require("host:apps/desktop-shell/src/main/services/accountScope.ts");
var import_i18n2 = require("npm:@totalclaw/i18n");
var store = null;
var proc = null;
var accountHooked = false;
async function eduHubLlm(deps, prompt, timeoutMs) {
  try {
    return await (0, import_councilChatRouter.runOneshotChat)(deps, prompt, { plainCompletion: true, timeoutMs });
  } catch (e) {
    const msg = String(e?.message || e);
    if (/SessionProvider|engineRegistry|未就绪|API key|api_key|not.*ready|provider/i.test(msg)) {
      throw new Error((0, import_i18n2.t)("AI \u5927\u8111\u5C1A\u672A\u5C31\u7EEA\uFF0C\u8BF7\u5230\u300C\u8BBE\u7F6E \u2192 \u6A21\u578B\u914D\u7F6E\u300D\u5B8C\u6210\u914D\u7F6E\u540E\u91CD\u8BD5"));
    }
    throw e;
  }
}
async function eduHubGenImage(deps, prompt) {
  const proc2 = deps.qiyeApiProc;
  if (!proc2 || proc2.getStatus?.() !== "ready") {
    throw new Error((0, import_i18n2.t)("\u56FE\u50CF\u670D\u52A1\u672A\u5C31\u7EEA\uFF0C\u8BF7\u5230\u300C\u8BBE\u7F6E \u2192 \u6A21\u578B\u914D\u7F6E\u300D\u542F\u7528\u56FE\u50CF\u751F\u6210"));
  }
  const client = new import_qiyeApiClient.QiyeApiClient({
    baseUrl: proc2.getBaseUrl(),
    getBearerToken: () => proc2.getBearerToken(),
    defaultTimeoutMs: 3e5
  });
  const r = await client.post("/v1/image/generate", { backend: "auto", prompt, width: 768, height: 512, n: 1 }, 3e5);
  const img = (r?.images || [])[0];
  if (!img?.url) throw new Error((0, import_i18n2.t)("\u56FE\u50CF\u751F\u6210\u672A\u8FD4\u56DE\u56FE\u7247"));
  if (String(img.url).startsWith("data:")) return String(img.url);
  const resp = await fetch(String(img.url));
  const buf = Buffer.from(await resp.arrayBuffer());
  return `data:${img.mimeType || "image/png"};base64,${buf.toString("base64")}`;
}
async function eduHubGenAvatar(deps, script, opts) {
  const dh = deps.digitalHumanProc;
  if (!dh) throw new Error((0, import_i18n2.t)("\u6570\u5B57\u4EBA\u670D\u52A1\u672A\u5C31\u7EEA\uFF0C\u8BF7\u5148\u5230\u300C\u6570\u5B57\u4EBA\u5DE5\u4F5C\u53F0 \u2192 \u914D\u7F6E\u300D\u9009\u62E9 provider \u5E76\u586B\u51ED\u636E"));
  const sub = await dh.synthesize({ script, aspectRatio: opts?.aspectRatio || "16:9", subtitle: true });
  if ((0, import_digitalHumanProc.isTaskFinished)(sub)) {
    const u = sub?.videoUrl ?? sub?.video_url;
    if (u) return String(u);
  }
  const taskId = sub?.taskId ?? sub?.task_id;
  if (!taskId) throw new Error(String(sub?.error || (0, import_i18n2.t)("\u6570\u5B57\u4EBA\u6210\u7247\u63D0\u4EA4\u5931\u8D25")));
  const deadline = Date.now() + 10 * 6e4;
  while (Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, 4e3));
    const q = await dh.queryTask(String(taskId));
    if ((0, import_digitalHumanProc.isTaskFailed)(q)) throw new Error(String(q?.error || (0, import_i18n2.t)("\u6570\u5B57\u4EBA\u6210\u7247\u5931\u8D25")));
    if ((0, import_digitalHumanProc.isTaskFinished)(q)) {
      const u = q?.videoUrl ?? q?.video_url;
      if (u) return String(u);
    }
  }
  throw new Error((0, import_i18n2.t)("\u6570\u5B57\u4EBA\u6210\u7247\u8D85\u65F6\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5"));
}
async function eduHubGenAudio(deps, text, lang) {
  const proc2 = deps.qiyeApiProc;
  if (!proc2 || proc2.getStatus?.() !== "ready") {
    throw new Error((0, import_i18n2.t)("\u8BED\u97F3\u670D\u52A1\u672A\u5C31\u7EEA\uFF0C\u8BF7\u5230\u300C\u8BBE\u7F6E \u2192 \u6A21\u578B\u914D\u7F6E\u300D\u542F\u7528\u8BED\u97F3\u5408\u6210"));
  }
  const client = new import_qiyeApiClient.QiyeApiClient({
    baseUrl: proc2.getBaseUrl(),
    getBearerToken: () => proc2.getBearerToken(),
    defaultTimeoutMs: 3e5
  });
  const bcp47 = lang === "ar" ? "ar" : lang === "en-US" ? "en-US" : "zh-CN";
  const langPrefix = bcp47.split("-")[0].toLowerCase();
  let backend = "";
  let voice = "";
  try {
    const caps = await client.get("/v1/speech/tts/capabilities", 3e4);
    const backends = caps?.backends || [];
    for (const b of backends) {
      const v = (b.voices || []).find((x) => String(x.language || "").toLowerCase().startsWith(langPrefix));
      if (v) {
        backend = b.name;
        voice = v.id;
        break;
      }
    }
    if (!backend) {
      const chosen = backends.find((b) => b.name === "elevenlabs") || backends[0];
      if (chosen) {
        backend = chosen.name;
        voice = (chosen.voices || [])[0]?.id || "";
      }
    }
  } catch (e) {
    deps.logger?.warn?.("edu-hub", (0, import_i18n2.t)("\u8BFB\u53D6 TTS \u80FD\u529B\u5931\u8D25"), { err: String(e?.message || e) });
  }
  if (!backend) throw new Error((0, import_i18n2.t)("\u672A\u627E\u5230\u53EF\u7528\u7684\u8BED\u97F3\u5408\u6210\u540E\u7AEF\uFF0C\u8BF7\u5230\u300C\u8BBE\u7F6E \u2192 \u6A21\u578B\u914D\u7F6E\u300D\u914D\u7F6E TTS \u63D0\u4F9B\u65B9"));
  const body = { backend, text, language: bcp47, format: "mp3" };
  if (voice) body.voice = voice;
  let buffer;
  try {
    ({ buffer } = await client.postBinary("/v1/speech/tts", body, 3e5));
  } catch (e) {
    const raw = String(e?.message || e).slice(0, 120);
    throw new Error((0, import_i18n2.t)("\u8BED\u97F3\u5408\u6210\u5931\u8D25\uFF08\u540E\u7AEF {p0}\uFF09\uFF1A\u8BE5\u8BED\u97F3\u540E\u7AEF\u591A\u534A\u672A\u914D\u7F6E API Key\u3002\u8BF7\u5230\u300C\u8BBE\u7F6E \u2192 \u6A21\u578B\u914D\u7F6E \u2192 \u8BED\u97F3\u5408\u6210\u300D\u4E3A Azure / ElevenLabs / \u8BAF\u98DE \u7B49\u586B\u5165\u5BC6\u94A5\u540E\u91CD\u8BD5\uFF08\u539F\u59CB\uFF1A{p1}\uFF09", { p0: backend, p1: raw }));
  }
  if (!buffer || !buffer.length) throw new Error((0, import_i18n2.t)("\u8BED\u97F3\u5408\u6210\u672A\u8FD4\u56DE\u97F3\u9891"));
  return buffer;
}
function ensure(deps) {
  if (!accountHooked) {
    accountHooked = true;
    (0, import_accountScope.onAccountKeyChange)(() => {
      const p = proc;
      proc = null;
      store = null;
      if (p) void p.stop();
    });
  }
  if (!store) {
    store = new import_eduHubStore.EduHubStore({
      logger: deps.logger,
      llm: (prompt, timeoutMs) => eduHubLlm(deps, prompt, timeoutMs),
      genImage: (prompt) => eduHubGenImage(deps, prompt),
      genAvatarVideo: (script, opts) => eduHubGenAvatar(deps, script, opts),
      genAudio: (text, lang) => eduHubGenAudio(deps, text, lang)
    });
    store.onEvent = (ev) => {
      try {
        deps.getMainWindow()?.webContents.send(import_ipc_contracts.IPC_CHANNELS.WORKBENCH_EDU_HUB_EVENT, ev);
      } catch {
      }
    };
  }
  if (!proc) proc = new EduHubProc(store, deps.logger);
  return { store, proc };
}
function registerEduHubHandlers(deps) {
  import_electron.ipcMain.handle(import_ipc_contracts.IPC_CHANNELS.WORKBENCH_EDU_HUB_STATUS, async () => ensure(deps).proc.status());
  import_electron.ipcMain.handle(import_ipc_contracts.IPC_CHANNELS.WORKBENCH_EDU_HUB_START, async () => {
    const { proc: p } = ensure(deps);
    const st = await p.start();
    deps.logger.audit?.("edu-hub", (0, import_i18n2.t)("\u6821\u5185\u5B66\u751F\u670D\u52A1\u542F\u52A8"), { port: st.port });
    return st;
  });
  import_electron.ipcMain.handle(import_ipc_contracts.IPC_CHANNELS.WORKBENCH_EDU_HUB_STOP, async () => {
    const { proc: p } = ensure(deps);
    await p.stop();
    deps.logger.audit?.("edu-hub", (0, import_i18n2.t)("\u6821\u5185\u5B66\u751F\u670D\u52A1\u505C\u6B62"), {});
    return p.status();
  });
  import_electron.ipcMain.handle(import_ipc_contracts.IPC_CHANNELS.WORKBENCH_EDU_HUB_ROTATE_CODE, async () => {
    const { store: s, proc: p } = ensure(deps);
    s.rotateClassCode();
    deps.logger.audit?.("edu-hub", (0, import_i18n2.t)("\u73ED\u7EA7\u7801\u5DF2\u8F6E\u6362"), {});
    return p.status();
  });
  import_electron.ipcMain.handle(import_ipc_contracts.IPC_CHANNELS.WORKBENCH_EDU_HUB_CODE_HISTORY, async () => ensure(deps).store.classCodeHistory());
  import_electron.ipcMain.handle(import_ipc_contracts.IPC_CHANNELS.WORKBENCH_EDU_HUB_RESTORE_CODE, async (_e, payload) => {
    const { store: s, proc: p } = ensure(deps);
    s.restoreClassCode(String(payload?.code || ""));
    deps.logger.audit?.("edu-hub", (0, import_i18n2.t)("\u6062\u590D\u5386\u53F2\u73ED\u7EA7\u7801"), {});
    return p.status();
  });
  import_electron.ipcMain.handle(import_ipc_contracts.IPC_CHANNELS.WORKBENCH_EDU_HUB_DELETE_MATERIAL, async (_e, payload) => {
    const { store: s } = ensure(deps);
    const removed = s.deleteMaterial(String(payload?.id || ""));
    deps.logger.audit?.("edu-hub", (0, import_i18n2.t)("\u5220\u9664\u8D44\u6599"), { id: payload?.id, lessons: removed.lessons });
    return { ok: true, ...removed };
  });
  import_electron.ipcMain.handle(import_ipc_contracts.IPC_CHANNELS.WORKBENCH_EDU_HUB_DELETE_LESSON, async (_e, payload) => {
    const { store: s } = ensure(deps);
    s.deleteLesson(String(payload?.id || ""));
    deps.logger.audit?.("edu-hub", (0, import_i18n2.t)("\u5220\u9664\u6559\u6848"), { id: payload?.id });
    return { ok: true };
  });
  import_electron.ipcMain.handle(import_ipc_contracts.IPC_CHANNELS.WORKBENCH_EDU_HUB_DELETE_STUDENT, async (_e, payload) => {
    const { store: s } = ensure(deps);
    s.deleteStudent(String(payload?.studentId || ""));
    deps.logger.audit?.("edu-hub", (0, import_i18n2.t)("\u5220\u9664\u5B66\u751F\u8D26\u53F7"), { studentId: payload?.studentId });
    return { ok: true };
  });
  import_electron.ipcMain.handle(import_ipc_contracts.IPC_CHANNELS.WORKBENCH_EDU_HUB_DELETE_QUESTION, async (_e, payload) => {
    const { store: s } = ensure(deps);
    s.deleteQuestion(String(payload?.id || ""));
    deps.logger.audit?.("edu-hub", (0, import_i18n2.t)("\u5220\u9664\u5B66\u751F\u63D0\u95EE"), { id: payload?.id });
    return { ok: true };
  });
  import_electron.ipcMain.handle(import_ipc_contracts.IPC_CHANNELS.WORKBENCH_EDU_HUB_IMPORT, async () => {
    (0, import_shared.rateLimit)("EDU_HUB_IMPORT", 10);
    const { store: s } = ensure(deps);
    const win = deps.getMainWindow();
    const dialogOpts = {
      title: (0, import_i18n2.t)("\u5BFC\u5165\u8BFE\u7A0B\u8D44\u6599"),
      properties: ["openFile", "multiSelections"],
      filters: [{ name: (0, import_i18n2.t)("\u8BFE\u7A0B\u8D44\u6599"), extensions: ["pdf", "docx", "pptx", "txt", "md"] }]
    };
    const picked = win ? await import_electron.dialog.showOpenDialog(win, dialogOpts) : await import_electron.dialog.showOpenDialog(dialogOpts);
    if (picked.canceled || !picked.filePaths.length) return { imported: [] };
    const imported = picked.filePaths.map((f) => s.importMaterial(f));
    deps.logger.audit?.("edu-hub", (0, import_i18n2.t)("\u5BFC\u5165\u8BFE\u7A0B\u8D44\u6599"), { count: imported.length });
    return { imported };
  });
  import_electron.ipcMain.handle(import_ipc_contracts.IPC_CHANNELS.WORKBENCH_EDU_HUB_REPARSE, async (_e, payload) => {
    (0, import_shared.rateLimit)("EDU_HUB_REPARSE", 20);
    const id = String(payload?.id || "").trim();
    if (!id) throw new Error((0, import_i18n2.t)("\u7F3A\u5C11\u8D44\u6599 ID"));
    const { store: s } = ensure(deps);
    const material = await s.reparseMaterial(id);
    deps.logger.audit?.("edu-hub", (0, import_i18n2.t)("\u91CD\u65B0\u89E3\u6790\u8BFE\u7A0B\u8D44\u6599"), { id, status: material.status });
    return { material };
  });
  import_electron.ipcMain.handle(import_ipc_contracts.IPC_CHANNELS.WORKBENCH_EDU_HUB_MATERIALS, async () => ensure(deps).store.listMaterials());
  import_electron.ipcMain.handle(
    import_ipc_contracts.IPC_CHANNELS.WORKBENCH_EDU_HUB_GENERATE,
    async (_e, payload) => {
      (0, import_shared.rateLimit)("EDU_HUB_GENERATE", 6);
      const { store: s } = ensure(deps);
      const grade = String(payload?.grade || "").trim() || (0, import_i18n2.t)("\u521D\u4E2D");
      const durationMinutes = Math.max(15, Math.min(180, Number(payload?.durationMinutes) || 45));
      const lang = payload?.lang === "en-US" || payload?.lang === "ar" ? payload.lang : "zh-CN";
      const mode = payload?.mode === "fast" ? "fast" : "rich";
      const lesson = s.generateLesson(String(payload?.materialId || ""), { grade, durationMinutes, lang, mode });
      deps.logger.audit?.("edu-hub", (0, import_i18n2.t)("\u89E6\u53D1\u6559\u6848\u751F\u6210"), { materialId: payload?.materialId, lessonId: lesson.id, lang, mode });
      return lesson;
    }
  );
  import_electron.ipcMain.handle(
    import_ipc_contracts.IPC_CHANNELS.WORKBENCH_EDU_HUB_GEN_ILLUSTRATION,
    async (_e, payload) => {
      (0, import_shared.rateLimit)("EDU_HUB_GEN_ILLUSTRATION", 20);
      const { store: s } = ensure(deps);
      const lesson = await s.generateIllustration(String(payload?.id || ""), Number(payload?.index) || 0);
      deps.logger.audit?.("edu-hub", (0, import_i18n2.t)("\u751F\u6210\u6559\u5B66\u914D\u56FE"), { lessonId: payload?.id, index: payload?.index });
      return lesson;
    }
  );
  import_electron.ipcMain.handle(import_ipc_contracts.IPC_CHANNELS.WORKBENCH_EDU_HUB_LESSONS, async () => ensure(deps).store.listLessons());
  import_electron.ipcMain.handle(
    import_ipc_contracts.IPC_CHANNELS.WORKBENCH_EDU_HUB_SAVE_LESSON,
    async (_e, payload) => {
      const { store: s } = ensure(deps);
      const lesson = s.saveLesson(String(payload?.id || ""), payload || {});
      deps.logger.audit?.("edu-hub", (0, import_i18n2.t)("\u4FDD\u5B58\u6559\u6848\u4FEE\u6539"), { lessonId: lesson.id });
      return lesson;
    }
  );
  import_electron.ipcMain.handle(
    import_ipc_contracts.IPC_CHANNELS.WORKBENCH_EDU_HUB_SWITCH_LANG,
    async (_e, payload) => {
      (0, import_shared.rateLimit)("EDU_HUB_SWITCH_LANG", 12);
      const { store: s } = ensure(deps);
      const lang = payload?.lang === "en-US" || payload?.lang === "ar" ? payload.lang : "zh-CN";
      const lesson = s.switchLessonLang(String(payload?.id || ""), lang);
      deps.logger.audit?.("edu-hub", (0, import_i18n2.t)("\u5207\u6362\u6559\u6848\u8BED\u8A00"), { lessonId: lesson.id, lang, cached: lesson.langStatus !== "switching" });
      return lesson;
    }
  );
  import_electron.ipcMain.handle(
    import_ipc_contracts.IPC_CHANNELS.WORKBENCH_EDU_HUB_PUBLISH,
    async (_e, payload) => {
      const { store: s } = ensure(deps);
      const lesson = s.publishLesson(String(payload?.id || ""), !!payload?.on);
      deps.logger.audit?.("edu-hub", payload?.on ? (0, import_i18n2.t)("\u53D1\u5E03\u6559\u6848\u5230\u5B66\u751F\u7AEF") : (0, import_i18n2.t)("\u4E0B\u7EBF\u6559\u6848"), { lessonId: lesson.id });
      return lesson;
    }
  );
  import_electron.ipcMain.handle(import_ipc_contracts.IPC_CHANNELS.WORKBENCH_EDU_HUB_PROGRESS, async () => ensure(deps).store.progressRows());
  import_electron.ipcMain.handle(
    import_ipc_contracts.IPC_CHANNELS.WORKBENCH_EDU_HUB_STUDENT_HISTORY,
    async (_e, payload) => ensure(deps).store.memoryTimeline(String(payload?.studentId || ""))
  );
  import_electron.ipcMain.handle(
    import_ipc_contracts.IPC_CHANNELS.WORKBENCH_EDU_HUB_GEN_AVATAR,
    async (_e, payload) => {
      (0, import_shared.rateLimit)("EDU_HUB_GEN_AVATAR", 4);
      const { store: s } = ensure(deps);
      const r = await s.generateAvatarVideos(String(payload?.id || ""));
      deps.logger.audit?.("edu-hub", (0, import_i18n2.t)("\u751F\u6210\u6570\u5B57\u4EBA\u8BB2\u89E3"), { lessonId: payload?.id, ok: r.ok, total: r.total });
      return r;
    }
  );
  import_electron.ipcMain.handle(
    import_ipc_contracts.IPC_CHANNELS.WORKBENCH_EDU_HUB_AVATAR_MEDIA,
    async (_e, payload) => {
      const { store: s } = ensure(deps);
      return { items: s.reviewAvatarMedia(String(payload?.id || "")) };
    }
  );
  import_electron.ipcMain.handle(
    import_ipc_contracts.IPC_CHANNELS.WORKBENCH_EDU_HUB_GEN_AUDIO,
    async (_e, payload) => {
      (0, import_shared.rateLimit)("EDU_HUB_GEN_AUDIO", 6);
      const { store: s } = ensure(deps);
      const r = await s.generateAudio(String(payload?.id || ""));
      deps.logger.audit?.("edu-hub", (0, import_i18n2.t)("\u751F\u6210\u97F3\u9891\u603B\u7ED3"), { lessonId: payload?.id, bytes: r.bytes });
      return r;
    }
  );
  import_electron.ipcMain.handle(import_ipc_contracts.IPC_CHANNELS.WORKBENCH_EDU_HUB_QUESTIONS, async () => ensure(deps).store.recentQuestions());
  return () => {
    const p = proc;
    proc = null;
    store = null;
    if (p) void p.stop();
  };
}

// node_modules/.cache/solutions-build/workbench-edu-hub/entry.main.ts
var hostApi = 2;
var registerFunction = "registerEduHubHandlers";
var cleanup;
function activate(ctx) {
  cleanup = registerEduHubHandlers(ctx.host.deps);
}
async function deactivate() {
  const c = cleanup;
  cleanup = void 0;
  if (typeof c === "function") await c();
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  activate,
  deactivate,
  hostApi,
  registerFunction
});
