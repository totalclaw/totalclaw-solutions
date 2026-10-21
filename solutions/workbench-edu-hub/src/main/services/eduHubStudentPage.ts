/**
 * eduHubStudentPage —— 学生端单文件 SPA（由 eduHubProc 直出）。
 *
 * 速度取向：无框架无构建（原生 JS + fetch），单 HTML 内联全部 CSS/JS；
 * eduHubProc 侧再叠 gzip + ETag 强缓存。首屏体积 < 20KB（gzip 后 ~6KB）。
 * 三语（EN/AR/中文）内置小词典，AR 全 RTL；不出现开放聊天框（受控原则）。
 */
export const STUDENT_PAGE_HTML = `<!DOCTYPE html>
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
/* —— My Learning Workspace 首页 —— */
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
/* —— 复习卡片③ —— */
.cardface{background:var(--priSoft);border:1px solid var(--line);border-radius:14px;padding:24px 20px;min-height:150px;display:flex;flex-direction:column;justify-content:center;text-align:center}
.cardq{font-size:19px;font-weight:700;line-height:1.4}
.carda{margin-top:14px;padding-top:14px;border-top:1px dashed var(--line);font-size:15px;line-height:1.6;white-space:pre-wrap;text-align:start}
.rate-row{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-top:16px}
.rate-bad{border-color:var(--red);color:var(--red)}
.rate-mid{border-color:var(--amber);color:var(--amber)}
.rate-good{border-color:var(--good);color:var(--good)}
/* —— 学习记忆时间线⑥ —— */
.tl-item{display:flex;gap:12px;align-items:flex-start}
.tl-ic{font-size:20px;line-height:1.2}
.tl-lbl{font-weight:600;font-size:14px}
.tl-txt{margin-top:4px}
/* —— 知识导图交互② —— */
.mind-center{display:inline-block;background:var(--pri);color:var(--priInk);font-weight:800;padding:8px 18px;border-radius:99px;margin-bottom:6px}
.mind-list{display:flex;flex-direction:column;gap:8px}
.mind-node{border:1px solid var(--line);border-radius:12px;overflow:hidden;background:var(--card)}
.mind-node.open{border-color:var(--pri)}
.mind-node-head{display:flex;align-items:center;gap:8px;padding:12px 14px;cursor:pointer;font-size:15px}
.mind-node-head .mind-caret{margin-inline-start:auto;color:var(--ink3)}
.mind-pts{margin:0;padding:0 16px 4px 32px}
.mind-pts li{margin:4px 0;font-size:14px}
.mind-acts{display:flex;gap:8px;padding:0 14px 12px}
/* —— 测试练习④ / 薄弱点 / 笔记 —— */
.practice-row{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:6px}
.weak-box{background:var(--amberSoft);border-color:var(--amber);margin-top:14px}
.dk-notes{margin-top:14px;padding-top:12px;border-top:1px dashed var(--line)}
.notes-list{margin-bottom:8px}
.note-item{display:flex;gap:8px;align-items:center;background:var(--priSoft);border-radius:8px;padding:6px 10px;margin-bottom:6px;font-size:13.5px}
.note-item .grow{flex:1}
.note-del{border:0;background:none;color:var(--ink3);font-size:12px;cursor:pointer}
.note-edit textarea{width:100%;border:1.5px solid var(--line);border-radius:10px;padding:8px 10px;font:inherit;background:var(--card);color:var(--ink);resize:vertical}
/* —— 音频总结⑤ —— */
.dk-audio{margin:8px 0 14px;text-align:center}
.dk-audio audio{width:100%;max-width:420px;margin-top:6px}
/* —— 翻页课件（PPT 式） —— */
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
/* 数字人老师讲解 */
.dk-avatar{margin:0 0 14px}
.dk-avlabel{font-size:12.5px;color:var(--pri);font-weight:700;margin-bottom:6px}
.dk-vid{width:100%;max-height:340px;border-radius:12px;background:#000;display:block}
/* 受限问答浮层 */
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
    join:'Enter my workspace', served:'Served by your school · data stays on campus', badCode:'Wrong class code',
    badName:'Please enter your name', myLessons:'My lessons', noLessons:'No published lessons yet — ask your teacher.',
    sections:' sections', quiz:' questions', myScore:'My score: ', start:'Open', keyPoints:'Key points',
    reading:'Reading', takeQuiz:'Take the quiz', submit:'Submit', back:'Back', source:'Source P.',
    result:'Quiz result', explain:'Why', retake:'Review lesson', logout:'Switch student', loading:'Loading…', netErr:'Network error, retry', classFull:'Class is full', tooMany:'Too many attempts, wait a minute', mindmap:'Knowledge map', illustrations:'Illustrations',
    learn:'Start learning', next:'Next', prev:'Back', startEx:'Start exercises', exercises:'Exercises', doneLesson:'Finish', slide:'Slide', of:'of', pickOne:'Pick an answer to continue', yourAns:'Your answer', correctAns:'Correct answer', wellDone:'Well done!', keepGoing:'Keep practising', reviewAns:'Review answers',
    askTeacher:'Ask about this lesson', askPh:'Ask something about this lesson…', send:'Ask', asking:'Thinking…', qaTip:'Answers come only from this lesson.', qaEmpty:'Please type a question', qaErr:'Cannot answer right now, try again', qaTooMany:'Too many questions, wait a minute', avatarTeacher:'AI teacher explains', closeQa:'Close',
    hi:'Hi', weekProgress:'This week', todayLearning:"Today's learning", continue:'Continue', allDone:'All caught up 🎉', allDoneSub:'No new lessons right now.', todayReview:'Suggested review today', startReview:'Start review', noReview:'Nothing to review — great!', minutes:'min', mistakesN:'mistakes', weakN:'weak points', myCourses:'My courses', statusNew:'Not started', statusReading:'In progress', statusDone:'Completed', learningCode:'Your learning code', learningCodeTip:'Note it to resume on another device.', resumeQ:'Have a learning code? Resume here', resumeTitle:'Resume with learning code', learningCodePh:'Your learning code', resumeBtn:'Resume', backToJoin:'New student? Join', codeNotFound:'Learning code not found',
    quickTools:'Quick tools', reviewCards:'Review cards', learningMemory:'Learning memory', flashcards:'Flashcards', showBack:'Show answer', rateUnknown:"Don't know", rateFuzzy:'Unsure', rateKnown:'Got it', noCards:'No cards to review — great!', reviewDone:'Review done 🎉', cardsDue:'cards due', markKnown:'Mark mastered', markWeak:'Mark weak', mapTapHint:'Tap a topic to see key points', mastered:'Mastered', weakChip:'Weak', practice:'Practice', chooseMode:'Choose a mode', modeQuick:'Quick check', modeChapter:'Chapter test', modeExam:'Mock exam', retake:'Practice again', weakPoints:'Weak points', addNote:'Add note', notePh:'Write a note for this section…', myNotes:'My notes', saveNote:'Save', del:'Delete', noMemory:'Your learning story starts here.', memOpen:'Opened', memTest:'Test', memPractice:'Practice', memNote:'Note', memAsk:'Asked', knowledgeMapView:'Knowledge map', audioSummary:'Audio summary'},
  ar: {appName:'مركز التعلّم الذكي', enterCode:'أدخل رمز الصف', yourName:'اسمك',
    studentNoPh:'الرقم الأكاديمي', badNo:'يرجى إدخال رقمك الأكاديمي', badMatch:'الرقم الأكاديمي والاسم غير متطابقين',
    join:'ادخل مساحة التعلم', served:'تقدمه مدرستك · البيانات تبقى داخل الحرم', badCode:'رمز الصف غير صحيح',
    badName:'يرجى إدخال الاسم', myLessons:'دروسي', noLessons:'لا توجد دروس منشورة بعد — اسأل معلمك.',
    sections:' أقسام', quiz:' أسئلة', myScore:'نتيجتي: ', start:'افتح', keyPoints:'النقاط الأساسية',
    reading:'قراءة', takeQuiz:'ابدأ الاختبار', submit:'إرسال', back:'رجوع', source:'المصدر ص',
    result:'نتيجة الاختبار', explain:'التفسير', retake:'مراجعة الدرس', logout:'تبديل الطالب', loading:'جارٍ التحميل…', netErr:'خطأ في الشبكة', classFull:'الصف ممتلئ', tooMany:'محاولات كثيرة، انتظر دقيقة', mindmap:'الخريطة المعرفية', illustrations:'الصور التوضيحية',
    learn:'ابدأ التعلّم', next:'التالي', prev:'السابق', startEx:'ابدأ التمارين', exercises:'تمارين', doneLesson:'إنهاء', slide:'شريحة', of:'من', pickOne:'اختر إجابة للمتابعة', yourAns:'إجابتك', correctAns:'الإجابة الصحيحة', wellDone:'أحسنت!', keepGoing:'واصل التدرّب', reviewAns:'مراجعة الإجابات',
    askTeacher:'اسأل عن هذا الدرس', askPh:'اسأل شيئاً عن هذا الدرس…', send:'اسأل', asking:'يفكّر…', qaTip:'الإجابات من هذا الدرس فقط.', qaEmpty:'اكتب سؤالاً من فضلك', qaErr:'تعذّر الرد الآن، حاول مجدداً', qaTooMany:'أسئلة كثيرة، انتظر دقيقة', avatarTeacher:'شرح المعلّم الذكي', closeQa:'إغلاق',
    hi:'مرحباً', weekProgress:'هذا الأسبوع', todayLearning:'تعلّم اليوم', continue:'متابعة', allDone:'أنجزت كل شيء 🎉', allDoneSub:'لا دروس جديدة الآن.', todayReview:'مراجعة اليوم المقترحة', startReview:'ابدأ المراجعة', noReview:'لا شيء للمراجعة — ممتاز!', minutes:'دقيقة', mistakesN:'أخطاء', weakN:'نقاط ضعف', myCourses:'دوراتي', statusNew:'لم يبدأ', statusReading:'قيد التقدّم', statusDone:'مكتمل', learningCode:'رمز تعلّمك', learningCodeTip:'احتفظ به للاستئناف على جهاز آخر.', resumeQ:'لديك رمز تعلّم؟ استأنف هنا', resumeTitle:'الاستئناف برمز التعلّم', learningCodePh:'رمز تعلّمك', resumeBtn:'استئناف', backToJoin:'طالب جديد؟ انضم', codeNotFound:'رمز التعلّم غير موجود',
    quickTools:'أدوات سريعة', reviewCards:'مراجعة البطاقات', learningMemory:'ذاكرة التعلّم', flashcards:'البطاقات', showBack:'اعرض الإجابة', rateUnknown:'لا أعرف', rateFuzzy:'غير متأكد', rateKnown:'أتقنت', noCards:'لا بطاقات للمراجعة — ممتاز!', reviewDone:'انتهت المراجعة 🎉', cardsDue:'بطاقات مستحقة', markKnown:'وسمها متقنة', markWeak:'وسمها ضعيفة', mapTapHint:'اضغط موضوعاً لرؤية النقاط', mastered:'متقن', weakChip:'ضعيف', practice:'تدرّب', chooseMode:'اختر نمطاً', modeQuick:'فحص سريع', modeChapter:'اختبار الفصل', modeExam:'محاكاة الامتحان', retake:'تدرّب مجدداً', weakPoints:'نقاط الضعف', addNote:'أضف ملاحظة', notePh:'اكتب ملاحظة لهذا القسم…', myNotes:'ملاحظاتي', saveNote:'حفظ', del:'حذف', noMemory:'تبدأ قصة تعلّمك هنا.', memOpen:'فتحت', memTest:'اختبار', memPractice:'تدرّب', memNote:'ملاحظة', memAsk:'سؤال', knowledgeMapView:'الخريطة المعرفية', audioSummary:'ملخص صوتي'},
  zh: {appName:'AI 学习中心', enterCode:'输入老师给的班级码', yourName:'你的姓名',
    studentNoPh:'学号', badNo:'请输入学号', badMatch:'学号与姓名不匹配',
    join:'进入我的学习空间', served:'本校教师端提供 · 数据不出校园', badCode:'班级码不对',
    sections:' 节', quiz:' 题', myScore:'我的成绩：', start:'进入', keyPoints:'本课要点',
    reading:'课文要点', takeQuiz:'开始小测', submit:'交卷', back:'返回', source:'来源 P.',
    result:'小测结果', explain:'解析', retake:'回看课文', logout:'切换学生', loading:'加载中…', netErr:'网络异常，请重试', classFull:'班级人数已满', tooMany:'尝试过于频繁，请稍候再试', mindmap:'知识导图', illustrations:'教学配图',
    learn:'开始学习', next:'下一页', prev:'上一页', startEx:'开始做题', exercises:'练习', doneLesson:'完成', slide:'第', of:'/', pickOne:'选一个答案后继续', yourAns:'你的答案', correctAns:'正确答案', wellDone:'太棒了！', keepGoing:'继续加油', reviewAns:'查看解析',
    askTeacher:'问本课', askPh:'就本课内容提问…', send:'提问', asking:'思考中…', qaTip:'只解答本课相关的问题。', qaEmpty:'请输入问题', qaErr:'暂时答不了，稍后再试', qaTooMany:'提问太频繁，等一分钟', avatarTeacher:'数字人老师讲解', closeQa:'关闭',
    hi:'你好', weekProgress:'本周学习进度', todayLearning:'今天的学习', continue:'继续学习', allDone:'全部学完啦 🎉', allDoneSub:'暂时没有新课程。', todayReview:'今天建议复习', startReview:'开始复习', noReview:'暂无需复习，很棒！', minutes:'分钟', mistakesN:'道错题', weakN:'个薄弱点', myCourses:'我的课程', statusNew:'未开始', statusReading:'学习中', statusDone:'已完成', learningCode:'你的学习码', learningCodeTip:'记下它，换设备也能接着学。', resumeQ:'有学习码？换设备接续', resumeTitle:'用学习码接续', learningCodePh:'你的学习码', resumeBtn:'接续', backToJoin:'新同学？直接进入', codeNotFound:'学习码不存在',
    quickTools:'快速工具', reviewCards:'复习卡片', learningMemory:'学习记忆', flashcards:'记忆卡', showBack:'看答案', rateUnknown:'不会', rateFuzzy:'模糊', rateKnown:'已掌握', noCards:'没有要复习的卡片，很棒！', reviewDone:'复习完成 🎉', cardsDue:'张卡待复习', markKnown:'标记已掌握', markWeak:'标记薄弱', mapTapHint:'点一个主题看要点', mastered:'已掌握', weakChip:'薄弱', practice:'练习', chooseMode:'选择模式', modeQuick:'快速检测', modeChapter:'章节测试', modeExam:'考前模拟', retake:'再练一次', weakPoints:'薄弱点', addNote:'记笔记', notePh:'给本节记条笔记…', myNotes:'我的笔记', saveNote:'保存', del:'删除', noMemory:'你的学习轨迹从这里开始。', memOpen:'打开了', memTest:'测试', memPractice:'练习', memNote:'笔记', memAsk:'提问', knowledgeMapView:'知识导图', audioSummary:'音频总结'}
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
      // 非 2xx 或应答体带 error（如课程被教师中途下线返 404 NOT_FOUND）一律抛，
      // 别把错误信封当数据渲染成 "undefined / undefined" 死页。
      if (!r.ok || (j && j.error)) throw new Error((j && j.error) || ('HTTP' + r.status));
      return j;
    });
  });
}
function el(html){ var d=document.createElement('div'); d.innerHTML=html; return d; }
function esc(s){ return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];}); }
function langBar(){ return '<span class="lang">'+['en','ar','zh'].map(function(l){
  return '<button data-l="'+l+'" class="'+(l===lang?'on':'')+'">'+(l==='en'?'EN':l==='ar'?'ع':'中')+'</button>';}).join('')+'</span>'; }
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
      // 裸 fetch：join/resume 的 error 是登录态反馈（BAD_CODE/NOT_FOUND/CLASS_FULL/TOO_MANY），不走 api() 抛错
      fetch(path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)})
        .then(function(r){ return r.json(); }).then(function(r){
          btn.disabled=false;
          if (r.error){ errEl.textContent = T(r.error==='BAD_CODE'?'badCode':r.error==='NOT_FOUND'?'codeNotFound':r.error==='CLASS_FULL'?'classFull':r.error==='TOO_MANY'?'tooMany':r.error==='BAD_NO'?'badNo':r.error==='BAD_MATCH'?'badMatch':'badName'); return; }
          token=r.token; localStorage.setItem('eh_token',token); localStorage.setItem('eh_name',r.name);
          current.resume=false; current.view='home'; rerender();
        }).catch(function(){ btn.disabled=false; errEl.textContent=T('netErr'); });
    };
  },

  // My Learning Workspace：5 秒内知道下一步 —— 今天学什么 / 今天复习 / 我的课程。全为真实进度派生。
  home: function(){
    app.innerHTML = '<div class="k">'+T('loading')+'</div>';
    api('/api/home').then(function(h){
      app.innerHTML='';
      var nm = esc(h.name||localStorage.getItem('eh_name')||'');
      var pct = Math.max(0, Math.min(100, h.weekProgressPct||0));
      var t = h.today;
      var todayHtml = t
        ? '<div class="ws-kick">'+T('todayLearning')+'</div><h3 class="ws-h">'+esc(t.title)+'</h3>'+
          '<div class="k ws-meta">'+t.sections+T('sections')+' · '+t.quizCount+T('quiz')+'</div>'+
          '<button class="btn pri" id="goToday">'+(t.resume==='quiz'?T('continue'):T('learn'))+' →</button>'
        : '<div class="ws-kick">'+T('todayLearning')+'</div><h3 class="ws-h">'+T('allDone')+'</h3><div class="k">'+T('allDoneSub')+'</div>';
      var rv = h.review||{mistakes:0,weakLessons:[],suggestMinutes:0,dueCards:0};
      var reviewHtml = rv.suggestMinutes>0
        ? '<div class="ws-kick amber">'+T('todayReview')+'</div>'+
          '<div class="ws-rvline">'+rv.suggestMinutes+' '+T('minutes')+' · '+(rv.dueCards||0)+' '+T('cardsDue')+' · '+rv.mistakes+' '+T('mistakesN')+'</div>'+
          '<button class="btn" id="goReview">'+T('startReview')+' →</button>'
        : '<div class="ws-kick amber">'+T('todayReview')+'</div><div class="k ws-meta">'+T('noReview')+'</div>';
      var v = el('<div>'+
        '<div class="top"><h2>'+T('hi')+(nm?'，'+nm:'')+'</h2><span class="sp"></span>'+langBar()+
          '<button class="btn" id="out" style="padding:4px 12px;font-size:12px">'+T('logout')+'</button></div>'+
        '<div class="card ws-prog"><div class="ws-prog-top"><span class="k">'+T('weekProgress')+'</span><b>'+pct+'%</b></div>'+
          '<div class="dk-prog" style="margin:6px 0 0"><div class="dk-bar" style="width:'+pct+'%"></div></div></div>'+
        '<div class="ws-two"><div class="card ws-today">'+todayHtml+'</div><div class="card ws-review">'+reviewHtml+'</div></div>'+
        '<div class="ws-tools"><button class="btn" id="tReview">🔁 '+T('reviewCards')+'</button><button class="btn" id="tMem">🕘 '+T('learningMemory')+'</button></div>'+
        '<h3 class="ws-sec">'+T('myCourses')+'</h3><div id="list"></div>'+
        '<div class="card ws-code"><span class="k">'+T('learningCode')+'：</span><b class="ws-codev">'+esc(h.learningCode||'')+'</b>'+
          '<div class="k ws-meta">'+T('learningCodeTip')+'</div></div>'+
        '<div class="foot">'+nm+' · '+T('served')+'</div></div>');
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
        var score = l.myScore ? ' · '+T('myScore')+l.myScore.score+'/'+l.myScore.total : '';
        var chip = stCls ? '<span class="chip '+stCls+'">'+stLbl+'</span>' : '<span class="chip ws-new">'+stLbl+'</span>';
        var c = el('<div class="card lesson-item"><div class="grow"><h3>'+esc(l.title)+'</h3>'+
          chip+' <span class="k">'+l.sections+T('sections')+' · '+l.quizCount+T('quiz')+score+'</span></div>'+
          '<button class="btn pri">'+(l.status==='new'?T('start'):T('continue'))+'</button></div>');
        c.querySelector('button').onclick=function(){ current.view='deck'; current.data={id:l.id}; rerender(); };
        box.appendChild(c);
      });
    }).catch(function(e){ if(e&&e.message==='EH401')return; app.innerHTML='<div class="card k">'+T('netErr')+'</div>'; });
  },

  // 翻页课件（PPT 式）：封面 → 每节一页幻灯（标题/导语/要点/示意图/真图）→ 每题一页互动习题 → 结果页。
  deck: function(){
    app.innerHTML = '<div class="k">'+T('loading')+'</div>';
    api('/api/lessons/'+current.data.id).then(function(l){
      if (l.error){ current.view='home'; rerender(); return; }
      // 幻灯正文来源：优先 v6 sections；旧课回落 图文 HTML / 分节要点(digest)
      var secList = (l.sections&&l.sections.length) ? l.sections
        : (l.digest&&l.digest.length) ? l.digest.map(function(s){ return {title:s.sectionTitle, bullets:s.bullets, sourcePages:s.sourcePages}; })
        : [];
      var slides = [{type:'cover'}];
      // 知识导图②：结构化 center/branches 存在时插一页可点导图（封面之后、章节之前）
      if(l.knowledgeMap && l.knowledgeMap.branches && l.knowledgeMap.branches.length) slides.push({type:'mind'});
      secList.forEach(function(s,i){ slides.push({type:'content', sec:s, n:i+1, tot:secList.length}); });
      if(!secList.length && l.lessonHtml) slides.push({type:'html'});
      (l.quiz||[]).forEach(function(q,qi){ slides.push({type:'ex', q:q, qi:qi}); });
      if((l.quiz||[]).length) slides.push({type:'result'});
      deckState = { l:l, slides:slides, idx:0, answers:new Array((l.quiz||[]).length).fill(-1), result:null, submitting:false, qa:{open:false, answer:'', busy:false}, note:{open:false,busy:false} };
      renderDeck();
    }).catch(function(e){ if(e&&e.message==='EH401')return; app.innerHTML='<div class="card k">'+T('netErr')+'</div>'; });
  },

  // 复习卡片③ + 智能复习计划⑦：跨课到期卡（间隔重复），翻卡自评「不会/模糊/已掌握」
  review: function(){
    app.innerHTML = '<div class="k">'+T('loading')+'</div>';
    api('/api/review').then(function(cards){
      cardDeck = { cards: cards||[], idx: 0, flipped: false }; renderCardReview();
    }).catch(function(e){ if(e&&e.message==='EH401')return; app.innerHTML='<div class="card k">'+T('netErr')+'</div>'; });
  },

  // 个人学习记忆⑥：真实学习轨迹时间线（打开/测试/练习/笔记/提问）
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
        var icon = ev.kind==='test'?'📝':ev.kind==='practice'?'🔁':ev.kind==='note'?'✏️':ev.kind==='ask'?'💬':'📖';
        var lbl = ev.kind==='test'?(T('memTest')+' · '+ev.score+'/'+ev.total):ev.kind==='practice'?(T('memPractice')+' · '+ev.score+'/'+ev.total):ev.kind==='note'?T('memNote'):ev.kind==='ask'?T('memAsk'):T('memOpen');
        var extra = (ev.kind==='note'||ev.kind==='ask') && ev.text ? '<div class="k tl-txt">'+esc(ev.text)+'</div>' : '';
        tl.appendChild(el('<div class="card tl-item"><div class="tl-ic">'+icon+'</div><div class="grow"><div class="tl-lbl">'+lbl+'</div><div class="k">'+esc(ev.title||'')+' · '+fmtTime(ev.at)+'</div>'+extra+'</div></div>'));
      });
    }).catch(function(e){ if(e&&e.message==='EH401')return; app.innerHTML='<div class="card k">'+T('netErr')+'</div>'; });
  }
};

// 相对时间（学习记忆时间线用；无第三方库）
function fmtTime(ts){
  var d = Date.now()-Number(ts||0), h=Math.floor(d/3600000), day=Math.floor(d/86400000);
  if(d<60000) return T('asking').replace(/…|\.\.\./,'')||'now';
  if(h<1) return Math.floor(d/60000)+'m';
  if(day<1) return h+'h';
  if(day<30) return day+'d';
  try{ return new Date(Number(ts)).toLocaleDateString(); }catch(e){ return ''; }
}

// —— 复习卡片 widget（翻卡 + 间隔重复自评）——
var cardDeck = null;
function renderCardReview(){
  var cd = cardDeck; if(!cd) return;
  app.innerHTML='';
  var head = '<div class="dk-top"><button class="btn xs" id="back">'+T('back')+'</button><div class="dk-title">'+T('reviewCards')+'</div>'+langBar()+'</div>';
  if(!cd.cards.length || cd.idx>=cd.cards.length){
    var msg = cd.cards.length? T('reviewDone') : T('noCards');
    var v0 = el('<div>'+head+'<div class="slide center"><div class="dk-face">'+(cd.cards.length?'🎉':'✅')+'</div><h3 style="margin:10px 0 16px">'+msg+'</h3><button class="btn pri" id="done">'+T('back')+'</button></div></div>');
    app.appendChild(v0); bindLang(v0);
    var go=function(){ current.view='home'; rerender(); }; v0.querySelector('#back').onclick=go; v0.querySelector('#done').onclick=go;
    return;
  }
  var c = cd.cards[cd.idx];
  var body = '<div class="dk-prog"><div class="dk-bar" style="width:'+Math.round((cd.idx)/cd.cards.length*100)+'%"></div></div>'+
    '<div class="slide"><div class="dk-kicker">'+(cd.idx+1)+' '+T('of')+' '+cd.cards.length+(c.lessonTitle?' · '+esc(c.lessonTitle):'')+'</div>'+
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
  var exTotal = d.practice ? (d.pcount||quizCount) : quizCount; // 练习模式题数（快速检测=5）
  app.innerHTML='';
  var head = '<div class="dk-top"><button class="btn xs" id="exit">'+T('back')+'</button>'+
    '<div class="dk-title">'+esc(l.title)+'</div>'+langBar()+'</div>'+
    '<div class="dk-prog"><div class="dk-bar" style="width:'+Math.round((d.idx+1)/total*100)+'%"></div></div>';
  var bodyHtml='';
  if(s.type==='cover'){
    var secCount = d.slides.filter(function(x){return x.type==='content';}).length;
    bodyHtml = '<div class="slide cover"><div class="dk-badge">'+T('appName')+'</div>'+
      '<h1 class="dk-h1">'+esc(l.title)+'</h1>'+
      '<div class="dk-meta">'+secCount+T('sections')+' · '+quizCount+T('quiz')+'</div>'+
      (l.audioUrl?'<div class="dk-audio"><div class="dk-avlabel">🎧 '+T('audioSummary')+'</div>'+
        '<audio controls preload="none" src="'+esc(l.audioUrl)+'?t='+encodeURIComponent(token)+'"></audio></div>':'')+
      '<button class="btn pri lg" id="start">'+T('learn')+' →</button></div>';
  } else if(s.type==='content'){
    var sec=s.sec;
    bodyHtml = '<div class="slide"><div class="dk-kicker">'+s.n+' / '+s.tot+'</div>'+
      '<h2 class="dk-h2">'+esc(sec.title)+'</h2>'+
      (sec.avatarVideoUrl?'<div class="dk-avatar"><div class="dk-avlabel">🧑‍🏫 '+T('avatarTeacher')+'</div>'+
        '<video class="dk-vid" controls preload="metadata" playsinline src="'+esc(sec.avatarVideoUrl)+'?t='+encodeURIComponent(token)+'"></video></div>':'')+
      (sec.intro?'<p class="dk-intro">'+esc(sec.intro)+'</p>':'')+
      (sec.bullets&&sec.bullets.length?'<ul class="dk-ul">'+sec.bullets.map(function(b){return '<li>'+esc(b)+'</li>';}).join('')+'</ul>':'')+
      (sec.diagramSvg?'<div class="dk-fig">'+sec.diagramSvg+'</div>':'')+
      (sec.imageDataUrl?'<figure class="dk-photo"><img src="'+sec.imageDataUrl+'" alt="'+esc(sec.imageCaption||sec.title)+'"/>'+
        '<figcaption>'+esc(sec.imageCaption||'')+(sec.imageSourceUrl?' · <a href="'+esc(sec.imageSourceUrl)+'" target="_blank" rel="noopener">'+T('source').replace(/\\s*(P\\.?|ص)\\s*$/,'')+'</a>':'')+'</figcaption></figure>':'')+
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
          '</ul><div class="mind-acts"><button class="btn xs" data-mk="'+bi+'" data-st="known">✓ '+T('markKnown')+'</button>'+
          '<button class="btn xs" data-mk="'+bi+'" data-st="weak">◐ '+T('markWeak')+'</button></div>' : '';
        return '<div class="mind-node'+(mo===bi?' open':'')+'"><div class="mind-node-head" data-b="'+bi+'"><b>'+esc(b.label)+'</b> '+sc+'<span class="mind-caret">'+(mo===bi?'▾':'▸')+'</span></div>'+det+'</div>';
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
      // 薄弱点：本次答错题定位到来源页（对应知识导图/原文章节）
      var weakPg = (r.detail||[]).filter(function(x){return x&&!x.correct&&x.sourcePage;}).map(function(x){return x.sourcePage;});
      var weakHtml = weakPg.length? '<div class="card weak-box"><div class="ws-kick amber">'+T('weakPoints')+'</div><div>'+T('source')+' '+weakPg.join(', ')+'</div></div>' : '';
      bodyHtml = '<div class="slide"><div class="center"><div class="dk-face">'+(pct>=60?'🎉':'💪')+'</div>'+
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
      (d.idx>0?'<button class="btn" id="prev">← '+T('prev')+'</button>':'<span></span>')+
      '<span class="dk-pos">'+(d.idx+1)+' '+T('of')+' '+total+'</span>'+
      navRightBtn(d,s,total,exTotal)+
    '</div></div>');
  app.appendChild(app2); bindLang(app2);
  app2.querySelector('#exit').onclick=deckExitHome;
  var startB=app2.querySelector('#start'); if(startB) startB.onclick=function(){ d.idx=1; renderDeck(); };
  var prevB=app2.querySelector('#prev'); if(prevB) prevB.onclick=function(){ if(d.idx>0){d.idx--;renderDeck();} };
  var nextB=app2.querySelector('#next'); if(nextB) nextB.onclick=deckNext;
  // 习题选项
  var opts=app2.querySelector('#opts');
  if(opts) opts.addEventListener('click',function(e){ var b=e.target.closest('.opt'); if(!b)return;
    d.answers[s.qi]=Number(b.dataset.o);
    opts.querySelectorAll('.opt').forEach(function(x){x.classList.remove('sel');}); b.classList.add('sel');
    var nb=app2.querySelector('#next'); if(nb) nb.disabled=false;
  });
  // 结果页复盘：只列本次实际作答的题（练习快速检测=5 题时不显示未答的）
  var rev=app2.querySelector('#rev');
  if(rev && d.result){ (d.result.detail||[]).forEach(function(det,qi){
    var q=(l.quiz||[])[qi]; if(!q) return;
    rev.appendChild(el('<div class="card"><b>'+(qi+1)+'. '+esc(q.q)+'</b><div style="margin-top:8px">'+
      q.options.map(function(o,oi){ var cls='opt sm'; if(oi===det.answer)cls+=' right'; else if(oi===d.answers[qi]&&!det.correct)cls+=' wrong';
        return '<div class="'+cls+'">'+esc(o)+'</div>'; }).join('')+
      '</div><div class="k" style="margin-top:6px">'+T('explain')+': '+esc(det.explain)+
      (det.sourcePage?' <span class="chip src">'+T('source')+det.sourcePage+'</span>':'')+'</div></div>'));
  }); }
  // 练习模式选择（结果页）→ startPractice
  app2.querySelectorAll('.practice-row .btn').forEach(function(b){ b.onclick=function(){ startPractice(b.dataset.pm); }; });
  // 知识导图交互：点标题展开/收起，标记掌握/薄弱
  app2.querySelectorAll('.mind-node-head').forEach(function(h){ h.onclick=function(){
    var bi=Number(h.dataset.b); d.mindOpen = (d.mindOpen===bi? -1 : bi); renderDeck();
  }; });
  app2.querySelectorAll('[data-mk]').forEach(function(b){ b.onclick=function(e){ e.stopPropagation();
    var bi=Number(b.dataset.mk), stt=b.dataset.st;
    api('/api/lessons/'+l.id+'/node',{method:'POST',body:{node:bi, state:stt}}).catch(function(){});
    l.nodeStates = l.nodeStates||{}; l.nodeStates[bi]=stt; renderDeck();
  }; });
  // 章节笔记：内容页可记笔记（挂在当前章节 index）
  if(s.type==='content'){
    var nb=d.note||(d.note={open:false,busy:false});
    var secIdx=(s.n||1)-1;
    var mine=(l.notes||[]).filter(function(x){return x.section===secIdx;});
    var np=el('<div class="dk-notes">'+
      (mine.length?'<div class="notes-list">'+mine.map(function(n){return '<div class="note-item"><span class="grow">'+esc(n.text)+'</span><button class="note-del" data-id="'+n.id+'">'+T('del')+'</button></div>';}).join('')+'</div>':'')+
      (nb.open
        ? '<div class="note-edit"><textarea id="noteTx" rows="2" maxlength="800" placeholder="'+T('notePh')+'"></textarea>'+
          '<div style="margin-top:6px"><button class="btn pri xs" id="noteSave" '+(nb.busy?'disabled':'')+'>'+T('saveNote')+'</button></div></div>'
        : '<button class="btn xs" id="noteBtn">✏️ '+T('addNote')+'</button>')+'</div>');
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
  // 受限问答浮层：只解答本课内容，超范围拒答（后端锚定 + 限流 + 防注入）
  var q0 = d.qa || (d.qa={open:false,answer:'',busy:false});
  var fab = el('<div class="dk-qa">'+
    (q0.open
      ? '<div class="dk-qa-panel"><div class="dk-qa-head"><b>'+T('askTeacher')+'</b><button class="dk-qa-x" id="qaClose" aria-label="'+T('closeQa')+'">×</button></div>'+
        '<div class="dk-qa-tip">'+T('qaTip')+'</div>'+
        '<div class="dk-qa-ans" id="qaAns">'+(q0.busy?('<span class="k">'+T('asking')+'</span>'):(q0.answer?esc(q0.answer):''))+'</div>'+
        '<div class="dk-qa-in"><input id="qaInput" maxlength="400" placeholder="'+T('askPh')+'" '+(q0.busy?'disabled':'')+'/>'+
        '<button class="btn pri" id="qaSend" '+(q0.busy?'disabled':'')+'>'+T('send')+'</button></div></div>'
      : '')+
    '<button class="dk-qa-fab" id="qaFab" title="'+T('askTeacher')+'">💬</button></div>');
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
  // 最后一道习题 → 交卷；封面已有 start 按钮但也给 next 兜底
  var isLastEx = (s.type==='ex' && s.qi===exTotal-1);
  var label = isLastEx ? T('submit') : (s.type==='cover'? T('learn') : T('next'));
  var dis = (s.type==='ex' && d.answers[s.qi]===-1) ? ' disabled' : '';
  return '<button class="btn pri" id="next"'+dis+'>'+label+' →</button>';
}

// 练习模式④：从结果页发起（可重考，错题自动成卡）。quick=前 5 题，chapter/exam=全部。
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
  if(s.type==='ex' && d.answers[s.qi]===-1) return;      // 未作答不前进（按钮禁用 + 键盘也拦）
  if(s.type==='ex' && s.qi===exTotal-1){                 // 最后一题 → 交卷/练习判分后进结果页
    (d.practice ? practiceSubmit : submitDeck)(function(){ d.idx++; renderDeck(); }); return;
  }
  if(s.type==='result'){ deckExitHome(); return; }
  if(d.idx < d.slides.length-1){ d.idx++; renderDeck(); }
}

// 键盘左右翻页（习题未作答时右键不前进）
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
