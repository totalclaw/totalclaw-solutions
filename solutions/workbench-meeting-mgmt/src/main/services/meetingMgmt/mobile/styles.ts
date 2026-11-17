/**
 * 会议智能管理 · 手机页 / 声纹采集页共用样式。
 * 跟原型（演示视频里的企微手机端）一致：浅色、紫色主色、白卡片大圆角、单栏。
 * 用 String.raw 原样输出：里面不能出现反引号和 `${`；不写中文（文案在 text.ts）。
 */
export const MM_MOBILE_CSS = String.raw`
:root{--pri:#5b5bf0;--pri2:#7c4dff;--priSoft:#eef0ff;--priLine:#d9dcff;--ink:#1f2329;--ink2:#4e5561;--ink3:#8f959e;
--bg:#f5f6fa;--card:#fff;--line:#eceef3;--bad:#e5484d;--badSoft:#fdeeee;--warn:#d97706;--warnSoft:#fdf3e2;
--good:#16a34a;--goodSoft:#e6f6ec;--radius:14px;--safeB:env(safe-area-inset-bottom)}
*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
html,body{margin:0;padding:0}
i{font-style:normal}
body{background:var(--bg);color:var(--ink);font:15px/1.6 -apple-system,BlinkMacSystemFont,"PingFang SC","Helvetica Neue","Microsoft YaHei","Noto Sans SC",sans-serif;-webkit-text-size-adjust:100%}
a{color:var(--pri);text-decoration:none}
button,input,select,textarea{font:inherit;color:inherit}
#app{max-width:640px;margin:0 auto;min-height:100vh}
.top{position:sticky;top:0;z-index:20;display:flex;align-items:center;gap:6px;height:48px;padding:0 8px;background:rgba(245,246,250,.94);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);border-bottom:1px solid var(--line)}
.top h1{flex:1;margin:0;font-size:17px;font-weight:600;text-align:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.top .side{width:40px;height:40px;display:flex;align-items:center;justify-content:center;border:0;background:none;font-size:22px;color:var(--ink2);position:relative;cursor:pointer}
.top .side .dot{position:absolute;top:3px;left:calc(50% + 3px);box-sizing:border-box;font-style:normal;min-width:16px;height:16px;padding:0 4px;border-radius:8px;box-shadow:0 0 0 2px var(--bg);background:var(--bad);color:#fff;font-size:10px;line-height:1;font-weight:700;display:inline-flex;align-items:center;justify-content:center;text-align:center;font-variant-numeric:tabular-nums}
.page{padding:12px 14px calc(96px + var(--safeB))}
.page.with-bar{padding-bottom:calc(150px + var(--safeB))}
.card{background:var(--card);border-radius:var(--radius);padding:14px;margin-bottom:12px;box-shadow:0 1px 2px rgba(20,24,40,.04)}
.card h2{margin:0 0 10px;font-size:15px;font-weight:700;display:flex;align-items:center;gap:8px}
.card h2 .r{margin-left:auto;font-size:13px;font-weight:500;color:var(--pri)}
.sec-t{margin:16px 2px 8px;font-size:13px;font-weight:700;color:var(--ink2);display:flex;align-items:center;gap:6px}
.sec-t .n{color:var(--ink3);font-weight:500}
.muted{color:var(--ink3);font-size:13px}
.small{font-size:12.5px}
.ink2{color:var(--ink2)}
.bad{color:var(--bad)}.warn{color:var(--warn)}.good{color:var(--good)}.pri{color:var(--pri)}
.row{display:flex;align-items:center;gap:8px}
.row.wrap{flex-wrap:wrap}
.grow{flex:1;min-width:0}
.ell{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.tag{display:inline-flex;align-items:center;height:22px;padding:0 8px;border-radius:6px;font-size:12px;font-weight:600;background:var(--priSoft);color:var(--pri);white-space:nowrap}
.tag.gray{background:#f0f1f4;color:var(--ink2)}.tag.bad{background:var(--badSoft);color:var(--bad)}
.tag.warn{background:var(--warnSoft);color:var(--warn)}.tag.good{background:var(--goodSoft);color:var(--good)}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;min-height:40px;padding:8px 16px;border-radius:10px;border:1px solid var(--priLine);background:var(--priSoft);color:var(--pri);font-size:14.5px;font-weight:600;cursor:pointer;text-align:center}
.btn.pri{background:linear-gradient(90deg,var(--pri),var(--pri2));border-color:transparent;color:#fff}
.btn.ghost{background:#fff;border-color:var(--line);color:var(--ink)}
.btn.danger{background:#fff;border-color:#f4c7c8;color:var(--bad)}
.btn.sm{min-height:32px;padding:4px 12px;font-size:13px;border-radius:8px}
.btn.block{display:flex;width:100%}
.btn:disabled,.btn[aria-busy=true]{opacity:.5;pointer-events:none}
.linkbtn{border:0;background:none;color:var(--pri);padding:4px 0;font-size:13.5px;font-weight:600;cursor:pointer}
.bar{position:fixed;left:0;right:0;bottom:0;z-index:25;background:#fff;border-top:1px solid var(--line);padding:10px 14px calc(10px + var(--safeB))}
.bar-in{max-width:612px;margin:0 auto;display:flex;flex-wrap:wrap;gap:10px}
.bar-in .btn{flex:1;min-width:30%}
.bar-note{max-width:612px;margin:0 auto 8px;font-size:12.5px;color:var(--ink3)}
.tabs{position:fixed;left:0;right:0;bottom:0;z-index:25;background:#fff;border-top:1px solid var(--line);padding-bottom:var(--safeB)}
.tabs-in{max-width:640px;margin:0 auto;display:flex}
.tabs a{flex:1;display:flex;flex-direction:column;align-items:center;gap:2px;padding:7px 0 6px;color:var(--ink3);font-size:11.5px;position:relative}
.tabs a svg{width:22px;height:22px}
.tabs a.on{color:var(--pri);font-weight:600}
.tabs a .badge{position:absolute;top:3px;left:calc(50% + 6px);box-sizing:border-box;font-style:normal;min-width:17px;height:17px;padding:0 5px;border-radius:9px;background:var(--bad);color:#fff;font-size:10.5px;line-height:1;font-weight:700;display:inline-flex;align-items:center;justify-content:center;text-align:center;font-variant-numeric:tabular-nums;box-shadow:0 0 0 2px #fff}
.chips{display:flex;gap:8px;overflow-x:auto;padding:2px 0 10px;scrollbar-width:none}
.chips::-webkit-scrollbar{display:none}
.chip{flex:0 0 auto;height:32px;padding:0 14px;border-radius:16px;border:1px solid var(--line);background:#fff;color:var(--ink2);font-size:13.5px;cursor:pointer}
.chip.on{background:var(--ink);border-color:var(--ink);color:#fff;font-weight:600}
.search{width:100%;height:38px;border-radius:10px;border:1px solid var(--line);background:#fff;padding:0 12px;margin-bottom:10px;font-size:14px}
.hello{font-size:20px;font-weight:700;margin:2px 0 2px}
.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:4px;margin-top:12px}
.stats.s3{grid-template-columns:repeat(3,1fr)}
.stat{text-align:center;padding:6px 0;border-radius:10px;cursor:pointer}
.stat b{display:block;font-size:22px;line-height:1.2}
.stat span{font-size:12px;color:var(--ink3)}
.item{display:flex;gap:10px;align-items:center;padding:12px;border-radius:12px;border:1px solid var(--line);background:#fff;margin-bottom:8px;cursor:pointer}
.item.urgent{border-color:#f6c9ca;background:#fffafa}
.item .tit{font-weight:600;font-size:14.5px}
.item .sub{font-size:12.5px;color:var(--ink3);margin-top:1px}
.item .hint{font-size:12px;font-weight:600}
.list-item{display:block;padding:12px 2px;border-bottom:1px solid var(--line);color:inherit}
.list-item:last-child{border-bottom:0}
.list-item.row{display:flex}
.udot{width:8px;height:8px;border-radius:50%;background:var(--bad);flex:0 0 auto}
.prog{height:6px;border-radius:3px;background:#eceef6;overflow:hidden;flex:1}
.prog i{display:block;height:100%;border-radius:3px;background:linear-gradient(90deg,var(--pri),var(--pri2))}
.prog.bad i{background:var(--bad)}
.dl{display:grid;grid-template-columns:auto 1fr;gap:4px 12px;font-size:13.5px}
.dl dt{color:var(--ink3)}.dl dd{margin:0}
.steps{display:flex;align-items:flex-start;margin:12px 0 2px}
.steps .st{flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;font-size:10.5px;color:var(--ink3);position:relative}
.steps .st::before{content:"";position:absolute;top:5px;left:-50%;width:100%;height:2px;background:var(--line)}
.steps .st:first-child::before{display:none}
.steps .st i{width:12px;height:12px;border-radius:50%;background:var(--line);position:relative;z-index:1}
.steps .st.done i,.steps .st.done::before,.steps .st.cur::before{background:var(--pri)}
.steps .st.cur i{background:#fff;border:3px solid var(--pri)}
.steps .st.cur{color:var(--pri);font-weight:700}
.banner{border-radius:12px;padding:12px;margin-bottom:12px;background:var(--priSoft);color:var(--ink);font-size:14px}
.banner.warn{background:var(--warnSoft)}.banner.bad{background:var(--badSoft)}.banner.good{background:var(--goodSoft)}
.banner b{display:block;margin-bottom:2px}
.seg{padding:10px 12px;border-radius:12px;border:1px solid var(--line);background:#fff;margin-bottom:8px}
.seg.mine{border-color:var(--pri);box-shadow:0 0 0 2px var(--priSoft)}
.seg.flash{animation:flash 1.6s ease 2}
@keyframes flash{50%{background:var(--priSoft)}}
.seg .who{display:flex;align-items:center;gap:6px;font-size:12.5px;color:var(--ink3);margin-bottom:4px}
.seg .who b{color:var(--ink2);font-weight:600}
.segplay{display:inline-flex;align-items:center;gap:3px;height:24px;padding:0 9px;border-radius:999px;border:1px solid var(--line);background:#fff;color:var(--ink3);font-size:12px;font-variant-numeric:tabular-nums;cursor:pointer}
.segplay.on{color:var(--pri);border-color:var(--pri);background:color-mix(in srgb,var(--pri) 10%,#fff)}
.segedit{margin-left:auto;display:inline-flex;align-items:center;gap:3px;height:26px;padding:0 11px;border-radius:999px;border:1px solid color-mix(in srgb,var(--pri) 45%,var(--line));background:color-mix(in srgb,var(--pri) 8%,#fff);color:var(--pri);font-size:12.5px;font-weight:600;cursor:pointer}
.seg .txt{font-size:14.5px;white-space:pre-wrap;word-break:break-word}
.seg .orig{margin-top:4px;font-size:12px;color:var(--ink3)}
.topic-t{margin:14px 2px 8px;font-size:14px;font-weight:700}
.av{display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;border-radius:50%;color:#fff;font-size:11.5px;font-weight:700;flex:0 0 auto}
.av.lg{width:52px;height:52px;font-size:22px}
textarea,input[type=text],input[type=date],input[type=datetime-local],input[type=search],select{width:100%;border:1px solid var(--line);border-radius:10px;background:#fff;padding:9px 11px;font-size:14.5px;outline:none}
textarea:focus,input:focus,select:focus{border-color:var(--pri)}
textarea{min-height:84px;resize:vertical;line-height:1.55}
label.f{display:block;margin:12px 0 6px;font-size:13px;font-weight:600;color:var(--ink2)}
label.chk{display:flex;align-items:flex-start;gap:10px;font-size:14px;line-height:1.55;cursor:pointer}
label.chk input{width:20px;height:20px;margin-top:1px;flex:0 0 auto;accent-color:var(--pri)}
.seg-ctl{display:flex;border:1px solid var(--line);border-radius:10px;overflow:hidden;background:#fff}
.seg-ctl button{flex:1;height:38px;border:0;background:none;font-size:14px;color:var(--ink2);cursor:pointer}
.seg-ctl button+button{border-left:1px solid var(--line)}
.seg-ctl button.on{background:var(--priSoft);color:var(--pri);font-weight:700}
input[type=range]{width:100%;accent-color:var(--pri)}
.md h1,.md h2,.md h3,.md h4{font-size:15.5px;margin:14px 0 6px}
.md h1{font-size:17px}
.md p{margin:6px 0}
.md ul,.md ol{margin:6px 0;padding-left:20px}
.md table{border-collapse:collapse;width:100%;font-size:13px;margin:8px 0;display:block;overflow-x:auto}
.md th,.md td{border:1px solid var(--line);padding:5px 7px;text-align:left;white-space:nowrap}
.md th{background:#f7f8fb}
.mdblk{position:relative;padding:4px 0;border-bottom:1px dashed var(--line)}
.mdblk:last-child{border-bottom:0}
.mdblk .linkbtn{position:absolute;top:6px;right:0}
.big{font-size:28px;font-weight:700;line-height:1.2}
.kpis{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px}
.kpis.k3{grid-template-columns:repeat(3,1fr)}
.kpi{background:#fff;border-radius:12px;padding:12px}
.kpi span{display:block;font-size:12px;color:var(--ink3)}
.dept-row{display:flex;align-items:center;gap:10px;margin:8px 0;font-size:13.5px}
.dept-row .nm{width:72px;flex:0 0 auto;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dept-row .v{width:48px;text-align:right;color:var(--ink3);font-size:12.5px}
.empty{padding:28px 0;text-align:center;color:var(--ink3);font-size:13.5px}
.loading{padding:60px 0;text-align:center;color:var(--ink3)}
.err{padding:40px 16px;text-align:center;color:var(--ink2)}
.err p{margin:0 0 14px}
.timeline{list-style:none;margin:0;padding:0}
.timeline li{position:relative;padding:0 0 12px 16px;font-size:13.5px}
.timeline li::before{content:"";position:absolute;left:2px;top:7px;width:7px;height:7px;border-radius:50%;background:var(--pri)}
.timeline li::after{content:"";position:absolute;left:5px;top:16px;bottom:0;width:1px;background:var(--line)}
.timeline li:last-child::after{display:none}
.side2{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.side2>div{border-radius:10px;padding:10px;font-size:13px;background:var(--warnSoft)}
.side2>div+div{background:var(--priSoft)}
.side2 b{display:block;margin-bottom:4px;font-size:13.5px}
.upl{border:1px dashed var(--priLine);border-radius:12px;padding:12px;background:#fafaff}
.upl-file{display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid var(--line);font-size:13.5px}
.upl-file:last-child{border-bottom:0}
.hidden-input{position:absolute;width:1px;height:1px;opacity:0;pointer-events:none}
.mask{position:fixed;inset:0;z-index:60;background:rgba(15,18,30,.45);display:flex;align-items:flex-end;justify-content:center;opacity:0;transition:opacity .2s}
.mask.show{opacity:1}
.sheet{width:100%;max-width:640px;max-height:88vh;background:#fff;border-radius:18px 18px 0 0;display:flex;flex-direction:column;transform:translateY(30px);transition:transform .2s}
.mask.show .sheet{transform:none}
.sheet.full{height:88vh}
.sheet-h{display:flex;align-items:center;padding:14px 16px 8px;font-size:16px;font-weight:700}
.sheet-h span{flex:1}
.sheet-h button{border:0;background:none;font-size:22px;color:var(--ink3);cursor:pointer;width:32px;height:32px}
.sheet-b{flex:1;overflow-y:auto;padding:4px 16px 12px;-webkit-overflow-scrolling:touch}
.sheet-f{display:flex;gap:10px;padding:10px 16px calc(12px + var(--safeB));border-top:1px solid var(--line)}
.sheet-f .btn{flex:1}
.sheet-msg{font-size:14.5px;line-height:1.65;color:var(--ink2);padding:4px 0 8px}
.sheet-err{color:var(--bad);font-size:13px;margin-top:8px;min-height:1px}
.pick-dept{margin:12px 0 4px;font-size:12.5px;font-weight:700;color:var(--ink3)}
.pick-row{display:flex;align-items:center;gap:10px;padding:9px 2px;border-bottom:1px solid var(--line);cursor:pointer;font-size:14.5px}
.pick-row input{width:19px;height:19px;accent-color:var(--pri);flex:0 0 auto}
.toast{position:fixed;left:50%;top:22%;z-index:90;max-width:84%;transform:translate(-50%,-6px);background:rgba(25,28,40,.9);color:#fff;padding:10px 16px;border-radius:12px;font-size:14px;line-height:1.5;text-align:center;opacity:0;transition:opacity .2s,transform .2s;pointer-events:none}
.toast.show{opacity:1;transform:translate(-50%,0)}
.toast.err{background:rgba(190,40,45,.94)}
.expired{max-width:420px;margin:18vh auto 0;padding:0 24px;text-align:center}
.expired .ic{width:64px;height:64px;margin:0 auto 16px;border-radius:50%;background:var(--warnSoft);color:var(--warn);display:flex;align-items:center;justify-content:center;font-size:32px;font-weight:700}
.expired h1{font-size:19px;margin:0 0 8px}
.expired p{color:var(--ink2);font-size:14.5px;margin:0 0 6px}
.chips-person{display:flex;flex-wrap:wrap;gap:6px}
.chips-person span{display:inline-flex;align-items:center;gap:4px;padding:3px 8px 3px 3px;border-radius:14px;background:#f2f3f7;font-size:13px}
.vp-step{display:flex;gap:6px;margin:4px 0 14px}
.vp-step i{flex:1;height:4px;border-radius:2px;background:var(--line)}
.vp-step i.on{background:var(--pri)}
.vp-script{background:var(--priSoft);border-radius:12px;padding:14px;font-size:16.5px;line-height:1.8;color:var(--ink)}
.rec{width:96px;height:96px;margin:18px auto 8px;border-radius:50%;border:0;background:linear-gradient(135deg,var(--pri),var(--pri2));color:#fff;font-size:15px;font-weight:700;display:flex;align-items:center;justify-content:center;box-shadow:0 8px 24px rgba(91,91,240,.35);cursor:pointer}
.rec.on{background:var(--bad);box-shadow:0 0 0 10px rgba(229,72,77,.15);animation:pulse 1.2s ease infinite}
@keyframes pulse{50%{box-shadow:0 0 0 18px rgba(229,72,77,.06)}}
.rec-t{text-align:center;font-size:22px;font-weight:700;font-variant-numeric:tabular-nums}
.okmark{width:76px;height:76px;margin:24px auto 12px;border-radius:50%;background:var(--goodSoft);color:var(--good);display:flex;align-items:center;justify-content:center;font-size:40px;font-weight:700}
audio{width:100%;margin:8px 0}
`;
