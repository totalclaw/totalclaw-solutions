function Jt(l, u) {
  for (var n = 0; n < u.length; n++) {
    const p = u[n];
    if (typeof p != "string" && !Array.isArray(p)) {
      for (const f in p)
        if (f !== "default" && !(f in l)) {
          const s = Object.getOwnPropertyDescriptor(p, f);
          s && Object.defineProperty(l, f, s.get ? s : {
            enumerable: !0,
            get: () => p[f]
          });
        }
    }
  }
  return Object.freeze(Object.defineProperty(l, Symbol.toStringTag, { value: "Module" }));
}
const e = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["npm:vue"];
if (!e) throw new Error("宿主模块未就绪：npm:vue");
e.default;
const t = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/i18n.ts"];
if (!t) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/i18n.ts");
t.default;
const ie = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/stores/notification.ts"];
if (!ie) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/stores/notification.ts");
ie.default;
const St = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/components/PageBackButton.vue"];
if (!St) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/components/PageBackButton.vue");
const Qt = St.default, ct = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/utils/ipcPlain.ts"];
if (!ct) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/utils/ipcPlain.ts");
ct.default;
const Z = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/workbenches/service-settlement/shared.ts"];
if (!Z) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/workbenches/service-settlement/shared.ts");
Z.default;
async function Y(l, u) {
  const n = window.electronAPI?.workbenches?.meetingMgmt;
  if (!n?.invoke) throw new Error(t.t("泰途会议智能管理接口不可用，请重启应用"));
  return n.invoke(l, ct.toPlain(u ?? {}));
}
function Se(l) {
  const u = window.electronAPI?.workbenches?.meetingMgmt;
  return u?.onEvent ? u.onEvent(l) : () => {
  };
}
const ge = {
  contacts: "https://work.weixin.qq.com/wework_admin/frame#contacts",
  apps: "https://work.weixin.qq.com/wework_admin/frame#apps",
  profile: "https://work.weixin.qq.com/wework_admin/frame#profile",
  webhookDoc: "https://developer.work.weixin.qq.com/document/path/91770"
};
function pe(l) {
  if (!l) return;
  const u = window.electronAPI;
  typeof u?.openExternal == "function" ? u.openExternal(l) : typeof u?.shell?.openExternal == "function" ? u.shell.openExternal(l) : window.open(l, "_blank", "noopener");
}
const ne = e.ref(null), yt = e.ref(!1);
async function ce() {
  const l = await Y("boot");
  return ne.value = l, l;
}
const We = e.ref(""), ye = e.ref({ tab: "home", seq: 0 });
function _e(l) {
  ye.value = { tab: l, seq: ye.value.seq + 1 };
}
const lt = e.ref("");
function Zt(l) {
  lt.value = l, _e("settings");
}
function de(l) {
  const u = l.kind === "task" ? "tasks" : l.kind === "meeting" || l.kind === "meeting_plan" ? "meetings" : "projects";
  ye.value = { tab: u, link: l, seq: ye.value.seq + 1 };
}
const Xe = {
  pending_upload: t.t("待上传"),
  processing: t.t("处理中"),
  failed: t.t("处理失败"),
  pending_assign: t.t("待指认"),
  pending_confirm: t.t("待确认"),
  pending_review: t.t("待终审"),
  finalized: t.t("已定稿"),
  ended: t.t("已结束"),
  pending_owner: t.t("待指定负责人"),
  plan_confirm: t.t("方案待确认"),
  dispatched: t.t("已派发")
}, Dt = [
  { key: "upload", label: t.t("上传"), statuses: ["pending_upload"] },
  { key: "process", label: t.t("处理"), statuses: ["processing", "failed", "pending_assign"] },
  { key: "confirm", label: t.t("发言确认"), statuses: ["pending_confirm"] },
  { key: "review", label: t.t("终审"), statuses: ["pending_review"] },
  { key: "final", label: t.t("定稿"), statuses: ["finalized", "ended"] },
  { key: "plan", label: t.t("方案"), statuses: ["pending_owner", "plan_confirm"] },
  { key: "dispatched", label: t.t("已派发"), statuses: ["dispatched"] }
];
function Xt(l) {
  const u = Dt.findIndex((n) => n.statuses.includes(l));
  return u < 0 ? 0 : u;
}
const nt = {
  offline: t.t("线下"),
  tencent: t.t("腾讯会议"),
  zoom: t.t("Zoom")
}, Ue = {
  to_accept: t.t("待接收"),
  not_started: t.t("未开始"),
  in_progress: t.t("进行中"),
  done: t.t("已完成"),
  cancelled: t.t("已取消")
};
function dt(l) {
  return l ? l.stage === "review" ? t.t("异议处理中 · 待复核") : l.stage === "dept_reply" ? t.t("异议处理中 · 待部门回应") : l.stage === "arbitration" ? t.t("异议处理中 · 待裁决") : "" : "";
}
const ot = {
  content: t.t("任务内容"),
  time: t.t("时间节点"),
  requirement: t.t("执行要求")
}, Ge = {
  active: t.t("进行中"),
  closing: t.t("结项中"),
  archived: t.t("已归档")
}, xt = {
  assign_speaker: t.t("待指认"),
  confirm_speech: t.t("发言确认"),
  review_minutes: t.t("纪要终审"),
  decide_tasks: t.t("定稿待选择"),
  assign_owner: t.t("指定负责人"),
  confirm_plan: t.t("方案确认"),
  accept_task: t.t("待接收"),
  update_progress: t.t("更新进度"),
  review_objection: t.t("异议复核"),
  dept_reply: t.t("异议回应"),
  arbitrate: t.t("待裁决"),
  review_report: t.t("报告审核"),
  retry_process: t.t("处理失败")
}, el = {
  assign_speaker: t.t("去指认"),
  confirm_speech: t.t("确认发言"),
  review_minutes: t.t("去终审"),
  decide_tasks: t.t("去选择"),
  assign_owner: t.t("去指定"),
  confirm_plan: t.t("确认方案"),
  accept_task: t.t("去接收"),
  update_progress: t.t("查看任务"),
  review_objection: t.t("去复核"),
  dept_reply: t.t("去回应"),
  arbitrate: t.t("去裁决"),
  review_report: t.t("去审核"),
  retry_process: t.t("去重试")
}, tl = {
  speech_confirm: t.t("发言待确认"),
  speech_remind: t.t("发言确认催办"),
  minutes_review: t.t("纪要待终审"),
  minutes_final: t.t("正式纪要已生成"),
  plan_confirm: t.t("方案待确认"),
  task_new: t.t("新任务待接收"),
  task_progress_remind: t.t("进度更新提醒"),
  task_due_remind: t.t("到期提醒"),
  task_overdue: t.t("逾期提醒"),
  objection_review: t.t("异议待复核"),
  plan_adjusted: t.t("调整后方案待确认"),
  arbitration: t.t("待裁决"),
  arbitration_result: t.t("裁决结果"),
  progress_report: t.t("进度汇总报告"),
  summary_review: t.t("总结报告待审核"),
  project_archived: t.t("项目已归档"),
  task_done: t.t("任务已完成"),
  task_progress: t.t("进度更新")
}, gt = ["#e05a8a", "#3b82f6", "#f59e0b", "#8b5cf6", "#ef4444", "#0ea5a4", "#16a34a", "#6366f1", "#d97706", "#0284c7"];
function re(l) {
  const u = String(l || "?");
  let n = 0;
  for (const p of u) n = n * 31 + p.charCodeAt(0) >>> 0;
  return { text: u.slice(0, 1), color: gt[n % gt.length] };
}
const mt = (l) => l && /^\d{4}-\d{2}-\d{2}$/.test(l) ? l.slice(5) : l || "-";
function at(l) {
  if (!l) return "-";
  const u = new Date(l), n = (p) => String(p).padStart(2, "0");
  return `${u.getFullYear()}-${n(u.getMonth() + 1)}-${n(u.getDate())}`;
}
function Ae(l) {
  const u = Math.max(0, Math.floor(l || 0)), n = Math.floor(u / 3600), p = Math.floor(u % 3600 / 60), f = u % 60, s = (o) => String(o).padStart(2, "0");
  return n ? `${n}:${s(p)}:${s(f)}` : `${s(p)}:${s(f)}`;
}
function ll(l, u = Date.now()) {
  if (!l) return "";
  const n = u - l;
  if (n < 6e4) return t.t("刚刚");
  if (n < 36e5) return t.t("{n} 分钟前", { n: Math.floor(n / 6e4) });
  const p = new Date(l), f = (i) => String(i).padStart(2, "0"), s = new Date(u), o = new Date(u - 864e5), d = `${f(p.getHours())}:${f(p.getMinutes())}`;
  return p.toDateString() === s.toDateString() ? t.t("今天 {t}", { t: d }) : p.toDateString() === o.toDateString() ? t.t("昨天 {t}", { t: d }) : `${f(p.getMonth() + 1)}-${f(p.getDate())} ${d}`;
}
const st = e.ref(!1), ft = e.ref(""), wt = "totalclaw:meeting-mgmt-operator:v1";
function nl() {
  try {
    return localStorage.getItem(wt) || "";
  } catch {
    return "";
  }
}
const Ie = e.ref(nl());
function ol(l) {
  Ie.value = l;
  try {
    localStorage.setItem(wt, l);
  } catch {
  }
}
let Me = null;
function De(l = !1) {
  if (!l && Me && Date.now() - Me.at < 3e4) return Me.data;
  const u = Y("people.list").then((n) => ({ depts: n?.depts ?? [], people: n?.people ?? [] }));
  return Me = { at: Date.now(), data: u }, u.catch(() => {
    Me = null;
  }), u;
}
function He() {
  Me = null;
}
function Ct(l, u = "", n) {
  const p = u.trim().toLowerCase(), f = l.people.filter((i) => !i.left && !0 && (!p || i.name.toLowerCase().includes(p) || (i.title || "").toLowerCase().includes(p))), s = [], o = /* @__PURE__ */ new Set();
  for (const i of l.depts) {
    const k = f.filter((h) => h.deptId === i.id);
    o.add(i.id), k.length && s.push({ id: i.id, name: i.name, people: k });
  }
  const d = f.filter((i) => !o.has(i.deptId));
  return d.length && s.push({ id: "", name: t.t("其他"), people: d }), s;
}
const ke = (l) => String(l).padStart(2, "0");
function Ee(l) {
  if (!l) return "-";
  const u = new Date(l);
  return `${u.getFullYear()}-${ke(u.getMonth() + 1)}-${ke(u.getDate())} ${ke(u.getHours())}:${ke(u.getMinutes())}`;
}
function Tt(l) {
  if (!l) return "-";
  const u = new Date(l);
  return `${ke(u.getMonth() + 1)}-${ke(u.getDate())}`;
}
function Ye(l) {
  const u = new Date(l);
  return `${u.getFullYear()}-${ke(u.getMonth() + 1)}-${ke(u.getDate())}`;
}
function al(l) {
  const u = new Date(l);
  return `${Ye(l)}T${ke(u.getHours())}:${ke(u.getMinutes())}`;
}
function sl(l) {
  const u = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(l || "");
  return u ? new Date(+u[1], +u[2] - 1, +u[3], +u[4], +u[5]).getTime() : NaN;
}
function rl(l) {
  const u = Number(l) || 0;
  return u >= 1024 ** 3 ? `${(u / 1024 ** 3).toFixed(2)} GB` : u >= 1024 ** 2 ? `${(u / 1024 ** 2).toFixed(1)} MB` : u >= 1024 ? `${Math.round(u / 1024)} KB` : `${u} B`;
}
function il(l) {
  const u = Math.round(Number(l) || 0);
  if (!u) return "";
  const n = Math.max(1, Math.round(u / 60));
  return n < 60 ? t.t("{n} 分钟", { n }) : t.t("{h} 小时 {m} 分", { h: Math.floor(n / 60), m: ke(n % 60) });
}
function cl(l) {
  const u = Math.max(0, Math.floor(l / 1e3));
  if (u < 60) return t.t("{n} 秒", { n: u });
  const n = Math.floor(u / 60);
  return n < 60 ? t.t("{m} 分 {s} 秒", { m: n, s: u % 60 }) : t.t("{h} 小时 {m} 分", { h: Math.floor(n / 60), m: ke(n % 60) });
}
function dl(l) {
  return l >= 5 && l < 11 ? t.t("早上好") : l >= 11 && l < 13 ? t.t("中午好") : l >= 13 && l < 18 ? t.t("下午好") : t.t("晚上好");
}
const ml = () => [t.t("周日"), t.t("周一"), t.t("周二"), t.t("周三"), t.t("周四"), t.t("周五"), t.t("周六")];
function Nt(l, u = Date.now()) {
  const n = /^(\d{4})-(\d{2})-(\d{2})$/.exec(l || "");
  if (!n) return { day: "", md: l || "-" };
  const p = `${n[2]}-${n[3]}`;
  if (l === Ye(u)) return { day: t.t("今天"), md: p };
  if (l === Ye(u + 864e5)) return { day: t.t("明天"), md: p };
  const f = new Date(+n[1], +n[2] - 1, +n[3]).getDay();
  return { day: ml()[f], md: p };
}
const Fe = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九", "十"];
function ul(l) {
  const u = l + 1;
  let n = !1;
  try {
    n = String(t.i18n.global.locale.value || "zh-CN") === "zh-CN";
  } catch {
    n = !0;
  }
  if (!n) return String(u);
  const p = Fe[10];
  return u <= 10 ? Fe[u] : u < 20 ? p + Fe[u - 10] : u < 100 ? Fe[Math.floor(u / 10)] + p + (u % 10 ? Fe[u % 10] : "") : String(u);
}
const ut = {
  pending_upload: "warn",
  processing: "muted",
  failed: "bad",
  pending_assign: "warn",
  pending_confirm: "brand",
  pending_review: "brand",
  finalized: "ok",
  ended: "muted",
  pending_owner: "brand",
  plan_confirm: "brand",
  dispatched: "ok"
}, je = {
  extract: t.t("提取音轨"),
  transcribe: t.t("转写"),
  diarize: t.t("识别发言人"),
  parse: t.t("解析文字记录"),
  organize: t.t("AI 整理纪要"),
  done: t.t("处理完成")
}, Vt = {
  audio: t.t("录音"),
  video: t.t("录屏"),
  transcript: t.t("文字记录")
};
function Et(l, u) {
  const n = Array.isArray(l) ? l : [], p = {
    all: n.length,
    meeting: n.filter((o) => o.group === "meeting").length,
    task: n.filter((o) => o.group === "task").length,
    project: n.filter((o) => o.group === "project").length
  }, f = u === "all" ? n : n.filter((o) => o.group === u), s = (o) => f.filter((d) => d.urgency === o).sort((d, i) => (d.at || 0) - (i.at || 0));
  return { counts: p, urgent: s("urgent"), today: s("today"), week: s("week") };
}
function pl(l) {
  if (!l) return "";
  const u = l.me?.person?.name;
  if (u && (l.projects || []).some((p) => p.ownerName === u)) return t.t("项目负责人");
  const n = new Set((l.todos || []).map((p) => p.type));
  return n.has("arbitrate") || n.has("review_report") ? t.t("项目负责人") : n.has("review_minutes") || n.has("assign_speaker") || n.has("decide_tasks") || n.has("assign_owner") || n.has("retry_process") ? t.t("主持人") : n.has("confirm_plan") || n.has("review_objection") ? t.t("任务负责人") : n.has("accept_task") || n.has("update_progress") || n.has("dept_reply") ? t.t("部门负责人") : n.has("confirm_speech") ? t.t("发言人") : l.me?.isAdmin ? t.t("管理员") : t.t("项目成员");
}
function vl(l, u) {
  if (!l) return "";
  const n = l.meeting.status;
  return l.my.isPlanOwner && (n === "plan_confirm" || n === "dispatched") ? t.t("任务负责人") : l.my.isHost ? t.t("主持人") : l.my.isPlanOwner ? t.t("任务负责人") : l.my.isSpeaker ? t.t("发言人") : u && l.meeting.attendeeIds.includes(u) ? t.t("参会人") : t.t("项目成员");
}
function Le(l, u) {
  return l.speakers.find((n) => n.label === u)?.personId;
}
function xe(l, u) {
  const n = Le(l.meeting, u);
  return n && l.names[n] ? l.names[n].name : t.t("未识别 {label}", { label: u });
}
function kl(l, u, n) {
  if (l.my.myLabels.includes(u)) return !0;
  const p = Le(l.meeting, u);
  return !!n && p === n;
}
function yl(l) {
  const u = l.meeting, n = new Map(u.segments.map((d) => [d.id, d])), p = /* @__PURE__ */ new Set(), f = [], s = (d) => {
    const i = [];
    for (const k of d) {
      const h = n.get(k);
      if (!h) continue;
      const m = xe(l, h.speakerLabel);
      i.includes(m) || i.push(m);
    }
    return i;
  };
  for (const d of u.topics || []) {
    const i = (d.segmentIds || []).filter((k) => n.has(k));
    i.forEach((k) => p.add(k)), f.push({ id: d.id, title: d.title, segmentIds: i, speakers: s(i) });
  }
  const o = u.segments.filter((d) => !p.has(d.id)).sort((d, i) => d.start - i.start).map((d) => d.id);
  return o.length && f.push({ id: "__rest", title: f.length ? t.t("其他发言") : t.t("全部发言"), segmentIds: o, speakers: s(o) }), f;
}
function gl(l, u) {
  const n = l?.log?.length ? l.log[l.log.length - 1].at : void 0;
  return Math.max(u || 0, n || 0, l?.startedAt || 0) || void 0;
}
const fl = 10 * 6e4, It = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["npm:qrcode"];
if (!It) throw new Error("宿主模块未就绪：npm:qrcode");
const Mt = It.default;
function Ce(l) {
  return !!l.objection && l.objection.stage !== "resolved";
}
function Nl(l) {
  if (Ce(l)) {
    const u = l.objection.stage;
    if (u === "review") return t.t("待复核");
    if (u === "dept_reply") return t.t("待部门回应");
    if (u === "arbitration") return t.t("待裁决");
  }
  return Ue[l.status] ?? l.status;
}
function Vl(l) {
  return Ce(l) ? dt(l.objection) : Ue[l.status] ?? l.status;
}
function At(l) {
  if (Ce(l)) return "bad";
  switch (l.status) {
    case "to_accept":
      return "warn";
    case "in_progress":
      return "brand";
    case "done":
      return "ok";
    case "cancelled":
      return "muted";
    default:
      return "";
  }
}
function El(l) {
  return l.status === "done" || l.status === "cancelled" ? "done" : l.status === "to_accept" || Ce(l) ? "action" : "doing";
}
function $t(l) {
  const u = (n) => n.status === "done" || n.status === "cancelled" ? 1 : 0;
  return [...l].sort((n, p) => u(n) - u(p) || +!!p.overdue - +!!n.overdue || String(n.due || "9999").localeCompare(String(p.due || "9999")) || String(n.title).localeCompare(String(p.title)));
}
function $l(l, u) {
  if (u === "status")
    return [
      { key: "action", title: t.t("需要处理") },
      { key: "doing", title: t.t("进行中") },
      { key: "done", title: t.t("已完成") }
    ].map((f) => ({ key: f.key, title: f.title, tasks: $t(l.filter((s) => El(s) === f.key)), collapsedByDefault: f.key === "done" })).filter((f) => f.tasks.length > 0);
  const n = /* @__PURE__ */ new Map();
  for (const p of l) {
    const f = u === "project" ? p.projectId : p.deptId, s = (u === "project" ? p.projectName : p.deptName) || t.t("未分类"), o = n.get(f) ?? { title: s, tasks: [] };
    o.tasks.push(p), n.set(f, o);
  }
  return [...n.entries()].map(([p, f]) => ({ key: p, title: f.title, tasks: $t(f.tasks), collapsedByDefault: !1 })).sort((p, f) => p.title.localeCompare(f.title, "zh-CN"));
}
function bl(l, u) {
  const n = u.trim().toLowerCase();
  return n ? l.filter((p) => [p.title, p.meetingTitle, p.deptName, p.assigneeName, p.ownerName, p.projectName, p.standard].some((f) => String(f || "").toLowerCase().includes(n))) : l;
}
function fe(l) {
  const u = Number(l);
  return Number.isFinite(u) ? Math.max(0, Math.min(100, Math.round(u))) : 0;
}
function pt(l, u) {
  return u > 0 ? fe(l / u * 100) : 0;
}
const ve = (l) => String(l).padStart(2, "0");
function Ne(l, u = !1) {
  if (!l) return "—";
  const n = new Date(l), p = `${n.getFullYear()}-${ve(n.getMonth() + 1)}-${ve(n.getDate())} ${ve(n.getHours())}:${ve(n.getMinutes())}`;
  return u ? `${p}:${ve(n.getSeconds())}` : p;
}
function Pe(l) {
  if (!l) return "";
  const u = new Date(l);
  return `${ve(u.getMonth() + 1)}-${ve(u.getDate())} ${ve(u.getHours())}:${ve(u.getMinutes())}`;
}
function rt(l) {
  if (!l) return "";
  const u = new Date(l);
  return `${ve(u.getMonth() + 1)}-${ve(u.getDate())}`;
}
function hl(l = Date.now()) {
  const u = new Date(l);
  return `${u.getFullYear()}-${ve(u.getMonth() + 1)}-${ve(u.getDate())}`;
}
function it(l, u, n = "") {
  if (!u) return n;
  const p = l?.[u];
  return p ? typeof p == "string" ? p : p.name || n || u : n || u;
}
const _l = /* @__PURE__ */ new Set([
  "objection_raised",
  "review_adopt",
  "review_reject",
  "reply_accept",
  "escalated",
  "arbitrate_keep",
  "arbitrate_adjust",
  "cancelled",
  "adjusted"
]);
function Bl(l) {
  switch (l.action) {
    case "created":
      return t.t("任务已下发");
    case "accepted":
      return t.t("接收了任务");
    case "progress":
      return t.t("更新了进度");
    case "done":
      return t.t("标记完成");
    case "objection_raised":
      return t.t("提出异议");
    case "review_adopt":
      return t.t("复核：采纳并调整");
    case "review_reject":
      return t.t("复核：驳回");
    case "reply_accept":
      return t.t("接受驳回");
    case "escalated":
      return t.t("不接受驳回，提交裁决");
    case "arbitrate_keep":
      return t.t("裁决：维持原方案");
    case "arbitrate_adjust":
      return t.t("裁决：按异议调整");
    case "cancelled":
      return t.t("删除了该任务");
    case "adjusted":
      return t.t("调整了任务");
    default:
      return l.action;
  }
}
function Sl(l) {
  return (l ?? []).filter((u) => _l.has(u.action)).sort((u, n) => n.at - u.at);
}
function Dl(l) {
  switch (l) {
    case "adopted":
      return t.t("已采纳并调整");
    case "accepted_reject":
      return t.t("部门接受驳回");
    case "kept":
      return t.t("裁决维持原方案");
    case "adjusted":
      return t.t("裁决按异议调整");
    case "cancelled":
      return t.t("任务已删除");
    default:
      return t.t("已结束");
  }
}
function wl(l, u) {
  const n = {}, p = l.title.trim(), f = l.standard.trim(), s = l.due.trim();
  return p && p !== u.title && (n.title = p), f && f !== u.standard && (n.standard = f), s && s !== u.due && (n.due = s), Object.keys(n).length ? n : void 0;
}
function Cl(l) {
  return { title: l.title, standard: l.standard, due: l.objection?.suggestedDue || l.due };
}
function Tl(l, u) {
  return u?.review || u?.reply || u?.escalate || u?.arbitrate || Ce(l) ? "objection" : "detail";
}
function Il(l, u, n, p = {}) {
  return u ? p.arbitrate ? t.t("项目负责人") : p.review ? t.t("任务负责人") : p.accept || p.object || p.progress || p.complete || p.change || p.reply || p.escalate || l.assigneeId === u ? t.t("部门负责人") : (l.ownerIds?.length ? l.ownerIds : [l.ownerId]).includes(u) ? t.t("任务负责人") : n && n === u ? t.t("项目负责人") : t.t("项目成员") : "";
}
function Ml(l, u) {
  return !l || !u ? "" : l.ownerId === u ? t.t("项目负责人") : l.memberIds.includes(u) ? t.t("项目成员") : "";
}
const jt = ["active", "closing", "archived"];
function Al(l) {
  const u = jt.indexOf(l);
  return u < 0 ? 0 : u;
}
function jl(l) {
  return l === "active" ? "brand" : l === "closing" ? "warn" : "muted";
}
function Be(l, u = [], n = {}) {
  if (l.kind === "objection") {
    const s = u.find((o) => o.id === l.id)?.objection?.stage === "arbitration" && n.canArbitrate ? t.t("去裁决") : t.t("去处理");
    return { chip: t.t("异议"), tone: "warn", action: s, link: { kind: "task", id: l.id } };
  }
  if (l.kind === "meeting") return { chip: t.t("会议"), tone: "brand", action: t.t("查看"), link: { kind: "meeting", id: l.id } };
  const p = u.find((f) => f.id === l.id)?.overdue;
  return { chip: p ? t.t("逾期") : t.t("未完成"), tone: p ? "bad" : "", action: t.t("查看"), link: { kind: "task", id: l.id } };
}
function bt(l) {
  const u = l ?? [], n = new Set(u.filter((p) => p.kind === "objection").map((p) => p.id));
  return u.filter((p) => !(p.kind === "task" && n.has(p.id)));
}
function Ll(l) {
  return l ? l.kind === "project" ? { projectId: l.id, tab: "overview" } : l.kind === "project_summary" ? { projectId: l.id, tab: "summary" } : l.kind === "report" ? l.anchor ? { projectId: l.id, reportId: l.anchor, tab: "reports" } : { projectId: l.id, reportId: l.id, tab: "reports" } : null : null;
}
function Lt(l, u, n) {
  const p = Math.max(1, Math.ceil(l.length / n)), f = Math.min(Math.max(1, u), p);
  return { rows: l.slice((f - 1) * n, f * n), page: f, pages: p };
}
function Je(l) {
  if (typeof l == "string") return l;
  if (l && typeof l == "object") {
    const u = l;
    for (const n of ["url", "link", "href"]) if (typeof u[n] == "string") return u[n];
  }
  return "";
}
function vt(l, u, n) {
  const p = n.trim().toLowerCase();
  return p ? [l.name, l.title, u].some((f) => String(f || "").toLowerCase().includes(p)) : !0;
}
async function Qe(l) {
  const u = window.electronAPI;
  try {
    if (u?.writeClipboardText) {
      const n = await u.writeClipboardText(l);
      if (!n || n.ok !== !1) return !0;
    }
  } catch {
  }
  try {
    return await navigator.clipboard.writeText(l), !0;
  } catch {
    return !1;
  }
}
function zl(l) {
  if (!l) return "";
  const u = window.electronAPI?.getPathForFile;
  try {
    return (u ? u(l) : l.path) || "";
  } catch {
    return "";
  }
}
const Fl = {
  class: "mm-card mm-mob",
  "data-test": "mm-mobile"
}, Pl = { class: "mm-card__head" }, Ul = ["disabled"], Ol = ["disabled"], Rl = {
  key: 0,
  class: "ss-note danger"
}, ql = { class: "mm-mob__addr" }, Kl = {
  key: 0,
  class: "mono",
  "data-test": "mm-mobile-url"
}, Hl = {
  key: 1,
  class: "muted"
}, Wl = {
  key: 1,
  class: "mm-mob__qr"
}, Gl = ["src", "alt"], Yl = {
  key: 1,
  class: "mm-mob__qr-ph"
}, Jl = { class: "mm-mob__qr-text" }, Ql = { class: "mm-mob__qr-acts" }, Zl = {
  key: 2,
  class: "ss-note warn mm-mob__lan",
  "data-test": "mm-mobile-lan"
}, Xl = {
  key: 3,
  class: "ss-note info",
  "data-test": "mm-mobile-public"
}, xl = { class: "mm-mob__note" }, en = /* @__PURE__ */ e.defineComponent({
  __name: "MobileAccessCard",
  setup(l) {
    const u = ie.useNotificationStore(), n = e.ref({ ...ne.value?.mobile ?? {}, running: !!ne.value?.mobile.running }), p = e.ref(!1), f = e.ref(""), s = e.ref(""), o = e.ref(""), d = e.computed(() => ne.value?.me?.person ?? null), i = e.computed(() => !!ne.value?.me?.isAdmin);
    async function k() {
      if (s.value = "", o.value = "", !(!n.value.running || !d.value))
        try {
          const N = Je(await Y("mobile.link", {}));
          if (!N) return;
          s.value = N, o.value = await Mt.toDataURL(N, { margin: 1, width: 264 }).catch(() => "");
        } catch (N) {
          f.value = Z.errorMessage(N);
        }
    }
    async function h() {
      try {
        const N = await Y("mobile.status");
        N && (n.value = { ...N, running: !!N.running });
      } catch (N) {
        f.value = Z.errorMessage(N);
      }
    }
    async function m(N) {
      p.value = !0, f.value = "";
      try {
        const a = await Y(N ? "mobile.start" : "mobile.stop");
        a && typeof a == "object" && "running" in a ? n.value = { ...a, running: !!a.running } : await h(), u.success(N ? t.t("手机页服务已开启") : t.t("手机页服务已停止"));
      } catch (a) {
        f.value = Z.errorMessage(a);
      } finally {
        p.value = !1;
      }
    }
    async function c() {
      s.value && await Qe(s.value) && u.success(t.t("已复制专属链接"));
    }
    e.watch(() => [n.value.running, n.value.url, d.value?.id], () => {
      k();
    });
    let g = null;
    return e.onMounted(() => {
      h().then(k), g = Se((N) => {
        N.type === "mobile" && (n.value = { ...n.value, running: N.running, url: N.url }, ne.value && (ne.value.mobile = { ...ne.value.mobile, running: N.running, url: N.url }), h());
      });
    }), e.onBeforeUnmount(() => g?.()), (N, a) => (e.openBlock(), e.createElementBlock("section", Fl, [
      e.createElementVNode("header", Pl, [
        e.createElementVNode(
          "h3",
          null,
          e.toDisplayString(N.$t("手机端")),
          1
          /* TEXT */
        ),
        e.createElementVNode(
          "span",
          {
            class: e.normalizeClass(["mm-tag", n.value.running ? "ok" : ""]),
            "data-test": "mm-mobile-state"
          },
          e.toDisplayString(n.value.running ? N.$t("运行中") : N.$t("未开启")),
          3
          /* TEXT, CLASS */
        ),
        a[3] || (a[3] = e.createElementVNode(
          "span",
          { class: "mm-grow" },
          null,
          -1
          /* CACHED */
        )),
        i.value ? (e.openBlock(), e.createElementBlock(
          e.Fragment,
          { key: 0 },
          [
            n.value.running ? (e.openBlock(), e.createElementBlock("button", {
              key: 1,
              type: "button",
              class: "ss-btn sm",
              disabled: p.value,
              "data-test": "mm-mobile-stop",
              onClick: a[1] || (a[1] = (I) => m(!1))
            }, [
              e.createElementVNode(
                "i",
                {
                  class: e.normalizeClass(p.value ? "ri-loader-4-line spin" : "ri-stop-circle-line")
                },
                null,
                2
                /* CLASS */
              ),
              e.createTextVNode(
                e.toDisplayString(N.$t("停止服务")),
                1
                /* TEXT */
              )
            ], 8, Ol)) : (e.openBlock(), e.createElementBlock("button", {
              key: 0,
              type: "button",
              class: "ss-btn primary sm",
              disabled: p.value,
              "data-test": "mm-mobile-start",
              onClick: a[0] || (a[0] = (I) => m(!0))
            }, [
              e.createElementVNode(
                "i",
                {
                  class: e.normalizeClass(p.value ? "ri-loader-4-line spin" : "ri-play-circle-line")
                },
                null,
                2
                /* CLASS */
              ),
              e.createTextVNode(
                e.toDisplayString(N.$t("开启手机页服务")),
                1
                /* TEXT */
              )
            ], 8, Ul))
          ],
          64
          /* STABLE_FRAGMENT */
        )) : e.createCommentVNode("v-if", !0)
      ]),
      f.value ? (e.openBlock(), e.createElementBlock("p", Rl, [
        a[4] || (a[4] = e.createElementVNode(
          "i",
          { class: "ri-error-warning-line" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(f.value),
          1
          /* TEXT */
        )
      ])) : e.createCommentVNode("v-if", !0),
      e.createElementVNode("div", ql, [
        e.createElementVNode(
          "small",
          null,
          e.toDisplayString(N.$t("局域网地址")),
          1
          /* TEXT */
        ),
        n.value.running && n.value.url ? (e.openBlock(), e.createElementBlock(
          "b",
          Kl,
          e.toDisplayString(n.value.url),
          1
          /* TEXT */
        )) : (e.openBlock(), e.createElementBlock(
          "b",
          Hl,
          e.toDisplayString(i.value ? N.$t("服务未开启") : N.$t("服务未开启，请管理员在首页开启")),
          1
          /* TEXT */
        ))
      ]),
      n.value.running ? (e.openBlock(), e.createElementBlock("div", Wl, [
        o.value ? (e.openBlock(), e.createElementBlock("img", {
          key: 0,
          src: o.value,
          alt: N.$t("我的手机端专属链接二维码"),
          width: "132",
          height: "132",
          "data-test": "mm-mobile-qr"
        }, null, 8, Gl)) : (e.openBlock(), e.createElementBlock("span", Yl, [...a[5] || (a[5] = [
          e.createElementVNode(
            "i",
            { class: "ri-loader-4-line spin" },
            null,
            -1
            /* CACHED */
          )
        ])])),
        e.createElementVNode("div", Jl, [
          e.createElementVNode(
            "strong",
            null,
            e.toDisplayString(N.$t("用手机扫码打开")),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "small",
            null,
            e.toDisplayString(d.value ? N.$t("这是 {name} 的专属链接，扫开就是本人身份，不要转发给别人。", { name: d.value.name }) : N.$t("当前身份无效，无法生成专属链接")),
            1
            /* TEXT */
          ),
          e.createElementVNode("div", Ql, [
            s.value ? (e.openBlock(), e.createElementBlock(
              "button",
              {
                key: 0,
                type: "button",
                class: "ss-link",
                "data-test": "mm-mobile-copy",
                onClick: c
              },
              e.toDisplayString(N.$t("复制链接")),
              1
              /* TEXT */
            )) : e.createCommentVNode("v-if", !0),
            s.value ? (e.openBlock(), e.createElementBlock("button", {
              key: 1,
              type: "button",
              class: "ss-link",
              "data-test": "mm-mobile-open",
              onClick: a[2] || (a[2] = (I) => e.unref(pe)(s.value))
            }, [
              e.createTextVNode(
                e.toDisplayString(N.$t("在浏览器打开")) + " ",
                1
                /* TEXT */
              ),
              a[6] || (a[6] = e.createElementVNode(
                "i",
                { class: "ri-external-link-line" },
                null,
                -1
                /* CACHED */
              ))
            ])) : e.createCommentVNode("v-if", !0)
          ])
        ])
      ])) : e.createCommentVNode("v-if", !0),
      n.value.running && n.value.lanOnly ? (e.openBlock(), e.createElementBlock("p", Zl, [
        a[7] || (a[7] = e.createElementVNode(
          "i",
          { class: "ri-wifi-line" },
          null,
          -1
          /* CACHED */
        )),
        e.createElementVNode("span", null, [
          e.createTextVNode(
            e.toDisplayString(N.$t("这是公司内网地址：手机要连公司 Wi-Fi（和这台电脑同一个网络）才能打开，用 4G 或在公司外面打不开。发到企业微信的消息里也会注明这一点。")) + " ",
            1
            /* TEXT */
          ),
          i.value ? (e.openBlock(), e.createElementBlock(
            e.Fragment,
            { key: 0 },
            [
              e.createTextVNode(
                e.toDisplayString(N.$t("要在外面也能打开，需要一个外网能访问到这台电脑的地址，填到 系统设置 → 企业微信 →「卡片跳转地址前缀」。")),
                1
                /* TEXT */
              )
            ],
            64
            /* STABLE_FRAGMENT */
          )) : e.createCommentVNode("v-if", !0)
        ])
      ])) : n.value.publicBase ? (e.openBlock(), e.createElementBlock("p", Xl, [
        a[8] || (a[8] = e.createElementVNode(
          "i",
          { class: "ri-global-line" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(N.$t("消息里的链接用外网地址：{url}", { url: n.value.publicBase })),
          1
          /* TEXT */
        )
      ])) : e.createCommentVNode("v-if", !0),
      e.createElementVNode(
        "p",
        xl,
        e.toDisplayString(N.$t("手机和这台电脑要在同一个网络；第一次开启时系统可能询问是否允许接入网络，请选允许。服务会记住开关，电脑重启后自动开启。")),
        1
        /* TEXT */
      )
    ]));
  }
}), oe = (l, u) => {
  const n = l.__vccOpts || l;
  for (const [p, f] of u)
    n[p] = f;
  return n;
}, zt = /* @__PURE__ */ oe(en, [["__scopeId", "data-v-0531c4e2"]]), tn = {
  class: "mm-home",
  "data-test": "mm-home"
}, ln = {
  key: 0,
  class: "ss-note danger"
}, nn = {
  key: 1,
  class: "ss-note"
}, on = {
  key: 0,
  class: "ss-note danger mm-home__push",
  "data-test": "mm-home-push-failed"
}, an = { class: "mm-card mm-hello" }, sn = { class: "mm-hello__text" }, rn = { "data-test": "mm-home-brief" }, cn = {
  key: 0,
  class: "bad"
}, dn = { class: "mm-hello__counts" }, mn = { class: "mm-count" }, un = { class: "mm-count warn" }, pn = { class: "mm-count bad" }, vn = { class: "mm-count" }, kn = { class: "mm-home__grid" }, yn = {
  class: "mm-card mm-todos",
  "data-test": "mm-home-todos"
}, gn = { class: "mm-card__head" }, fn = { class: "mm-chips" }, Nn = ["data-test", "onClick"], Vn = {
  key: 0,
  class: "mm-empty"
}, En = { class: "mm-group__lbl" }, $n = { class: "mm-group__n" }, bn = ["data-test", "onClick"], hn = { class: "mm-todo__tag" }, _n = { class: "mm-todo__main" }, Bn = { key: 0 }, Sn = ["onClick"], Dn = { class: "mm-home__side" }, wn = {
  class: "mm-card",
  "data-test": "mm-home-mytasks"
}, Cn = { class: "mm-card__head" }, Tn = {
  key: 0,
  class: "mm-empty"
}, In = {
  key: 1,
  class: "mm-mytasks"
}, Mn = ["data-test", "onClick"], An = { class: "mm-mytasks__day" }, jn = { class: "mm-mytasks__body" }, Ln = { class: "mm-mytasks__bar" }, zn = { class: "mm-bar" }, Fn = { class: "mm-mytasks__pct" }, Pn = {
  key: 0,
  class: "mm-tag bad"
}, Un = {
  key: 1,
  class: "mm-tag warn"
}, On = {
  class: "mm-card",
  "data-test": "mm-home-notices"
}, Rn = { class: "mm-card__head" }, qn = {
  key: 0,
  class: "mm-tag bad"
}, Kn = ["disabled"], Hn = {
  key: 0,
  class: "mm-empty"
}, Wn = ["data-test", "onClick"], Gn = { class: "mm-notices__body" }, Yn = { class: "mm-notices__top" }, Jn = { key: 0 }, Qn = { class: "mm-home__grid2" }, Zn = {
  class: "mm-card",
  "data-test": "mm-home-projects"
}, Xn = { class: "mm-card__head" }, xn = {
  key: 0,
  class: "mm-empty"
}, eo = {
  key: 1,
  class: "mm-rows"
}, to = ["onClick"], lo = {
  key: 0,
  class: "bad"
}, no = {
  class: "mm-card",
  "data-test": "mm-home-meetings"
}, oo = { class: "mm-card__head" }, ao = {
  key: 0,
  class: "mm-empty mm-empty--row"
}, so = {
  key: 1,
  class: "mm-rows"
}, ro = ["onClick"], Ke = "", io = /* @__PURE__ */ e.defineComponent({
  __name: "HomeTab",
  emits: ["role"],
  setup(l, { expose: u, emit: n }) {
    const p = n, f = [
      { key: "all", title: t.t("全部") },
      { key: "meeting", title: t.t("会议") },
      { key: "task", title: t.t("任务") },
      { key: "project", title: t.t("项目") }
    ], s = [
      { key: "urgent", title: t.t("紧急") },
      { key: "today", title: t.t("今天") },
      { key: "week", title: t.t("本周") }
    ], o = e.ref(null), d = e.ref(""), i = e.ref(!1), k = e.ref("all"), h = e.ref(!1), m = e.ref(!1), c = e.ref([]), g = e.computed(() => ne.value?.me ?? o.value?.me ?? null), N = e.computed(() => ne.value?.me?.isAdmin && ne.value?.pushFailed || 0), a = e.computed(() => dl((/* @__PURE__ */ new Date()).getHours())), I = e.computed(() => Et(o.value?.todos ?? [], "all")), P = e.computed(() => Et(o.value?.todos ?? [], k.value)), U = e.computed(() => I.value.today.length), M = e.computed(() => {
      const y = I.value.urgent.length, V = U.value;
      let r;
      y && V ? r = t.t("今天有 {urgent}、{n} 件需在今天完成的事项", { urgent: Ke, n: V }) : y ? r = t.t("今天有 {urgent}的事项", { urgent: Ke }) : V ? r = t.t("今天有 {n} 件需在今天完成的事项", { n: V }) : r = t.t("今天没有紧急或需要今天完成的事项");
      const W = r.indexOf(Ke);
      return W < 0 ? { before: r, red: "", after: "" } : { before: r.slice(0, W), red: t.t("{n} 件紧急", { n: y }), after: r.slice(W + Ke.length) };
    }), C = e.computed(() => P.value.urgent.length + P.value.today.length + P.value.week.length), T = e.computed(() => m.value ? c.value : (o.value?.notices ?? []).slice(0, 5)), z = e.computed(() => (o.value?.projects ?? []).some((y) => y.status === "active"));
    function R(y) {
      return y.type === "update_progress" && y.urgency === "urgent" ? t.t("任务逾期") : xt[y.type] || y.type;
    }
    const _ = (y) => Math.max(0, Math.min(100, Math.round(Number(y) || 0)));
    async function E() {
      try {
        o.value = await Y("home.get"), d.value = "", m.value && (c.value = await Y("notice.list", {}));
      } catch (y) {
        d.value = Z.errorMessage(y);
      }
    }
    async function v() {
      if (m.value) {
        m.value = !1;
        return;
      }
      try {
        c.value = await Y("notice.list", {}), m.value = !0;
      } catch (y) {
        d.value = Z.errorMessage(y);
      }
    }
    async function S() {
      i.value = !0;
      try {
        await Y("notice.read", { all: !0 }), await E();
      } catch (y) {
        d.value = Z.errorMessage(y);
      } finally {
        i.value = !1;
      }
    }
    async function j(y) {
      if (!y.read)
        try {
          await Y("notice.read", { ids: [y.id] });
        } catch {
        }
      de(y.link);
    }
    function J() {
      st.value = !0, _e("meetings");
    }
    return e.watch(() => pl(o.value), (y) => {
      y && p("role", y);
    }, { immediate: !0 }), e.onMounted(() => {
      E();
    }), u({ refresh: E }), (y, V) => (e.openBlock(), e.createElementBlock("div", tn, [
      d.value ? (e.openBlock(), e.createElementBlock("p", ln, [
        V[5] || (V[5] = e.createElementVNode(
          "i",
          { class: "ri-error-warning-line" },
          null,
          -1
          /* CACHED */
        )),
        e.createElementVNode(
          "span",
          null,
          e.toDisplayString(d.value),
          1
          /* TEXT */
        ),
        e.createElementVNode(
          "button",
          {
            type: "button",
            class: "ss-link",
            onClick: E
          },
          e.toDisplayString(y.$t("重试")),
          1
          /* TEXT */
        )
      ])) : e.createCommentVNode("v-if", !0),
      !o.value && !d.value ? (e.openBlock(), e.createElementBlock("p", nn, [
        V[6] || (V[6] = e.createElementVNode(
          "i",
          { class: "ri-loader-4-line spin" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(y.$t("正在加载首页…")),
          1
          /* TEXT */
        )
      ])) : e.createCommentVNode("v-if", !0),
      o.value ? (e.openBlock(), e.createElementBlock(
        e.Fragment,
        { key: 2 },
        [
          N.value ? (e.openBlock(), e.createElementBlock("p", on, [
            V[7] || (V[7] = e.createElementVNode(
              "i",
              { class: "ri-error-warning-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(y.$t("有 {n} 条企微通知没发出去，相关的人可能没收到卡片（系统内消息照常有）", { n: N.value })),
              1
              /* TEXT */
            ),
            e.createElementVNode(
              "button",
              {
                type: "button",
                class: "ss-link",
                onClick: V[0] || (V[0] = (r) => e.unref(Zt)("wecom"))
              },
              e.toDisplayString(y.$t("查看并重发")),
              1
              /* TEXT */
            )
          ])) : e.createCommentVNode("v-if", !0),
          e.createCommentVNode(" 问候卡 "),
          e.createElementVNode("section", an, [
            e.createElementVNode("div", sn, [
              e.createElementVNode(
                "h2",
                null,
                e.toDisplayString(y.$t("{greet}，{name}", { greet: a.value, name: o.value.greetingName || g.value?.person?.name || "" })),
                1
                /* TEXT */
              ),
              e.createElementVNode("p", rn, [
                e.createTextVNode(
                  e.toDisplayString(M.value.before),
                  1
                  /* TEXT */
                ),
                M.value.red ? (e.openBlock(), e.createElementBlock(
                  "b",
                  cn,
                  e.toDisplayString(M.value.red),
                  1
                  /* TEXT */
                )) : e.createCommentVNode("v-if", !0),
                e.createTextVNode(
                  e.toDisplayString(M.value.after),
                  1
                  /* TEXT */
                )
              ])
            ]),
            e.createElementVNode("div", dn, [
              e.createElementVNode("div", mn, [
                e.createElementVNode(
                  "strong",
                  null,
                  e.toDisplayString(o.value.counts.todos),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "small",
                  null,
                  e.toDisplayString(y.$t("待处理")),
                  1
                  /* TEXT */
                )
              ]),
              e.createElementVNode("div", un, [
                e.createElementVNode(
                  "strong",
                  null,
                  e.toDisplayString(o.value.counts.dueToday),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "small",
                  null,
                  e.toDisplayString(y.$t("今日到期")),
                  1
                  /* TEXT */
                )
              ]),
              e.createElementVNode("div", pn, [
                e.createElementVNode(
                  "strong",
                  null,
                  e.toDisplayString(o.value.counts.overdue),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "small",
                  null,
                  e.toDisplayString(y.$t("逾期")),
                  1
                  /* TEXT */
                )
              ]),
              e.createElementVNode("div", vn, [
                e.createElementVNode(
                  "strong",
                  null,
                  e.toDisplayString(o.value.counts.unread),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "small",
                  null,
                  e.toDisplayString(y.$t("未读通知")),
                  1
                  /* TEXT */
                )
              ])
            ])
          ]),
          e.createElementVNode("div", kn, [
            e.createCommentVNode(" 待我处理 "),
            e.createElementVNode("section", yn, [
              e.createElementVNode("header", gn, [
                e.createElementVNode(
                  "h3",
                  null,
                  e.toDisplayString(y.$t("待我处理")),
                  1
                  /* TEXT */
                ),
                V[8] || (V[8] = e.createElementVNode(
                  "span",
                  { class: "mm-grow" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createElementVNode("div", fn, [
                  (e.openBlock(), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(f, (r) => e.createElementVNode("button", {
                      key: r.key,
                      type: "button",
                      class: e.normalizeClass(["mm-chip", { on: k.value === r.key }]),
                      "data-test": `mm-todo-filter-${r.key}`,
                      onClick: (W) => k.value = r.key
                    }, [
                      e.createTextVNode(
                        e.toDisplayString(r.title) + " ",
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "span",
                        null,
                        e.toDisplayString(P.value.counts[r.key]),
                        1
                        /* TEXT */
                      )
                    ], 10, Nn)),
                    64
                    /* STABLE_FRAGMENT */
                  ))
                ])
              ]),
              C.value ? (e.openBlock(), e.createElementBlock(
                e.Fragment,
                { key: 1 },
                e.renderList(s, (r) => (e.openBlock(), e.createElementBlock(
                  e.Fragment,
                  {
                    key: r.key
                  },
                  [
                    P.value[r.key].length ? (e.openBlock(), e.createElementBlock(
                      "div",
                      {
                        key: 0,
                        class: e.normalizeClass(["mm-group", r.key])
                      },
                      [
                        e.createElementVNode(
                          "span",
                          En,
                          e.toDisplayString(r.title),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "span",
                          $n,
                          e.toDisplayString(P.value[r.key].length),
                          1
                          /* TEXT */
                        ),
                        V[9] || (V[9] = e.createElementVNode(
                          "i",
                          { class: "mm-group__line" },
                          null,
                          -1
                          /* CACHED */
                        )),
                        r.key === "week" ? (e.openBlock(), e.createElementBlock("button", {
                          key: 0,
                          type: "button",
                          class: "ss-link",
                          "data-test": "mm-week-toggle",
                          onClick: V[1] || (V[1] = (W) => h.value = !h.value)
                        }, [
                          e.createTextVNode(
                            e.toDisplayString(h.value ? y.$t("收起") : y.$t("展开")),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "i",
                            {
                              class: e.normalizeClass(h.value ? "ri-arrow-up-s-line" : "ri-arrow-down-s-line")
                            },
                            null,
                            2
                            /* CLASS */
                          )
                        ])) : e.createCommentVNode("v-if", !0)
                      ],
                      2
                      /* CLASS */
                    )) : e.createCommentVNode("v-if", !0),
                    r.key !== "week" || h.value ? (e.openBlock(!0), e.createElementBlock(
                      e.Fragment,
                      { key: 1 },
                      e.renderList(P.value[r.key], (W) => (e.openBlock(), e.createElementBlock("article", {
                        key: W.id,
                        class: e.normalizeClass(["mm-todo", { urgent: W.urgency === "urgent" }]),
                        "data-test": `mm-todo-${W.id}`,
                        onClick: (X) => e.unref(de)(W.link)
                      }, [
                        e.createElementVNode(
                          "span",
                          hn,
                          e.toDisplayString(R(W)),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode("div", _n, [
                          e.createElementVNode(
                            "strong",
                            null,
                            e.toDisplayString(W.title),
                            1
                            /* TEXT */
                          ),
                          W.subtitle ? (e.openBlock(), e.createElementBlock(
                            "small",
                            Bn,
                            e.toDisplayString(W.subtitle),
                            1
                            /* TEXT */
                          )) : e.createCommentVNode("v-if", !0)
                        ]),
                        W.hint ? (e.openBlock(), e.createElementBlock(
                          "span",
                          {
                            key: 0,
                            class: e.normalizeClass(["mm-todo__hint", W.urgency])
                          },
                          e.toDisplayString(W.hint),
                          3
                          /* TEXT, CLASS */
                        )) : e.createCommentVNode("v-if", !0),
                        e.createElementVNode("button", {
                          type: "button",
                          class: e.normalizeClass(["mm-btn", W.urgency === "urgent" ? "primary" : "soft"]),
                          onClick: e.withModifiers((X) => e.unref(de)(W.link), ["stop"])
                        }, e.toDisplayString(e.unref(el)[W.type]), 11, Sn)
                      ], 10, bn))),
                      128
                      /* KEYED_FRAGMENT */
                    )) : e.createCommentVNode("v-if", !0)
                  ],
                  64
                  /* STABLE_FRAGMENT */
                ))),
                64
                /* STABLE_FRAGMENT */
              )) : (e.openBlock(), e.createElementBlock(
                "p",
                Vn,
                e.toDisplayString(y.$t("暂无待办")),
                1
                /* TEXT */
              ))
            ]),
            e.createElementVNode("div", Dn, [
              e.createCommentVNode(" 手机端：服务开关 + 本人专属链接二维码 "),
              e.createVNode(zt),
              e.createCommentVNode(" 我的任务 · 本周截止 "),
              e.createElementVNode("section", wn, [
                e.createElementVNode("header", Cn, [
                  e.createElementVNode(
                    "h3",
                    null,
                    e.toDisplayString(y.$t("我的任务 · 本周截止")),
                    1
                    /* TEXT */
                  ),
                  V[11] || (V[11] = e.createElementVNode(
                    "span",
                    { class: "mm-grow" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-link",
                    onClick: V[2] || (V[2] = (r) => e.unref(_e)("tasks"))
                  }, [
                    e.createTextVNode(
                      e.toDisplayString(y.$t("全部任务")),
                      1
                      /* TEXT */
                    ),
                    V[10] || (V[10] = e.createElementVNode(
                      "i",
                      { class: "ri-arrow-right-s-line" },
                      null,
                      -1
                      /* CACHED */
                    ))
                  ])
                ]),
                o.value.myTasksThisWeek.length ? (e.openBlock(), e.createElementBlock("ul", In, [
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(o.value.myTasksThisWeek, (r) => (e.openBlock(), e.createElementBlock("li", {
                      key: r.id,
                      "data-test": `mm-mytask-${r.id}`,
                      onClick: (W) => e.unref(de)({ kind: "task", id: r.id })
                    }, [
                      e.createElementVNode("div", An, [
                        e.createElementVNode(
                          "small",
                          null,
                          e.toDisplayString(e.unref(Nt)(r.due).day),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "b",
                          null,
                          e.toDisplayString(e.unref(Nt)(r.due).md),
                          1
                          /* TEXT */
                        )
                      ]),
                      e.createElementVNode("div", jn, [
                        e.createElementVNode(
                          "strong",
                          null,
                          e.toDisplayString(r.title),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode("div", Ln, [
                          e.createElementVNode("span", zn, [
                            e.createElementVNode(
                              "i",
                              {
                                class: e.normalizeClass({ bad: r.overdue }),
                                style: e.normalizeStyle({ width: `${_(r.percent)}%` })
                              },
                              null,
                              6
                              /* CLASS, STYLE */
                            )
                          ]),
                          e.createElementVNode(
                            "span",
                            Fn,
                            e.toDisplayString(_(r.percent)) + "%",
                            1
                            /* TEXT */
                          ),
                          r.overdue ? (e.openBlock(), e.createElementBlock(
                            "span",
                            Pn,
                            e.toDisplayString(y.$t("逾期 {n} 天", { n: r.overdueDays })),
                            1
                            /* TEXT */
                          )) : r.objection ? (e.openBlock(), e.createElementBlock(
                            "span",
                            Un,
                            e.toDisplayString(e.unref(dt)(r.objection)),
                            1
                            /* TEXT */
                          )) : e.createCommentVNode("v-if", !0)
                        ])
                      ])
                    ], 8, Mn))),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ])) : (e.openBlock(), e.createElementBlock(
                  "p",
                  Tn,
                  e.toDisplayString(y.$t("没有即将到期或逾期的任务")),
                  1
                  /* TEXT */
                ))
              ]),
              e.createCommentVNode(" 通知 "),
              e.createElementVNode("section", On, [
                e.createElementVNode("header", Rn, [
                  e.createElementVNode(
                    "h3",
                    null,
                    e.toDisplayString(y.$t("通知")),
                    1
                    /* TEXT */
                  ),
                  o.value.counts.unread ? (e.openBlock(), e.createElementBlock(
                    "span",
                    qn,
                    e.toDisplayString(y.$t("{n} 未读", { n: o.value.counts.unread })),
                    1
                    /* TEXT */
                  )) : e.createCommentVNode("v-if", !0),
                  V[12] || (V[12] = e.createElementVNode(
                    "span",
                    { class: "mm-grow" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  m.value && o.value.counts.unread ? (e.openBlock(), e.createElementBlock("button", {
                    key: 1,
                    type: "button",
                    class: "ss-link",
                    disabled: i.value,
                    "data-test": "mm-notice-readall",
                    onClick: S
                  }, e.toDisplayString(y.$t("全部标为已读")), 9, Kn)) : e.createCommentVNode("v-if", !0),
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-link",
                    "data-test": "mm-notice-all",
                    onClick: v
                  }, [
                    e.createTextVNode(
                      e.toDisplayString(m.value ? y.$t("收起") : y.$t("全部")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "i",
                      {
                        class: e.normalizeClass(m.value ? "ri-arrow-up-s-line" : "ri-arrow-right-s-line")
                      },
                      null,
                      2
                      /* CLASS */
                    )
                  ])
                ]),
                T.value.length ? (e.openBlock(), e.createElementBlock(
                  "ul",
                  {
                    key: 1,
                    class: e.normalizeClass(["mm-notices", { all: m.value }])
                  },
                  [
                    (e.openBlock(!0), e.createElementBlock(
                      e.Fragment,
                      null,
                      e.renderList(T.value, (r) => (e.openBlock(), e.createElementBlock("li", {
                        key: r.id,
                        class: e.normalizeClass({ unread: !r.read }),
                        "data-test": `mm-notice-${r.id}`,
                        onClick: (W) => j(r)
                      }, [
                        V[13] || (V[13] = e.createElementVNode(
                          "i",
                          {
                            class: "mm-dot",
                            "aria-hidden": "true"
                          },
                          null,
                          -1
                          /* CACHED */
                        )),
                        e.createElementVNode("div", Gn, [
                          e.createElementVNode("div", Yn, [
                            e.createElementVNode(
                              "strong",
                              null,
                              e.toDisplayString(r.title || e.unref(tl)[r.type]),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "time",
                              null,
                              e.toDisplayString(e.unref(ll)(r.at)),
                              1
                              /* TEXT */
                            )
                          ]),
                          r.summary ? (e.openBlock(), e.createElementBlock(
                            "small",
                            Jn,
                            e.toDisplayString(r.summary),
                            1
                            /* TEXT */
                          )) : e.createCommentVNode("v-if", !0)
                        ])
                      ], 10, Wn))),
                      128
                      /* KEYED_FRAGMENT */
                    ))
                  ],
                  2
                  /* CLASS */
                )) : (e.openBlock(), e.createElementBlock(
                  "p",
                  Hn,
                  e.toDisplayString(y.$t("暂无通知")),
                  1
                  /* TEXT */
                ))
              ])
            ])
          ]),
          e.createElementVNode("div", Qn, [
            e.createCommentVNode(" 我参与的项目 "),
            e.createElementVNode("section", Zn, [
              e.createElementVNode("header", Xn, [
                e.createElementVNode(
                  "h3",
                  null,
                  e.toDisplayString(y.$t("我参与的项目")),
                  1
                  /* TEXT */
                ),
                V[15] || (V[15] = e.createElementVNode(
                  "span",
                  { class: "mm-grow" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createElementVNode("button", {
                  type: "button",
                  class: "ss-link",
                  onClick: V[3] || (V[3] = (r) => e.unref(_e)("projects"))
                }, [
                  e.createTextVNode(
                    e.toDisplayString(y.$t("全部项目")),
                    1
                    /* TEXT */
                  ),
                  V[14] || (V[14] = e.createElementVNode(
                    "i",
                    { class: "ri-arrow-right-s-line" },
                    null,
                    -1
                    /* CACHED */
                  ))
                ])
              ]),
              o.value.projects.length ? (e.openBlock(), e.createElementBlock("ul", eo, [
                (e.openBlock(!0), e.createElementBlock(
                  e.Fragment,
                  null,
                  e.renderList(o.value.projects, (r) => (e.openBlock(), e.createElementBlock("li", {
                    key: r.id,
                    onClick: (W) => e.unref(de)({ kind: "project", id: r.id })
                  }, [
                    e.createElementVNode(
                      "strong",
                      null,
                      e.toDisplayString(r.name),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "span",
                      {
                        class: e.normalizeClass(["mm-tag", r.status === "active" ? "brand" : r.status === "closing" ? "warn" : ""])
                      },
                      e.toDisplayString(e.unref(Ge)[r.status]),
                      3
                      /* TEXT, CLASS */
                    ),
                    V[16] || (V[16] = e.createElementVNode(
                      "span",
                      { class: "mm-grow" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createElementVNode(
                      "small",
                      null,
                      e.toDisplayString(y.$t("任务 {a}/{b}", { a: r.done, b: r.total })),
                      1
                      /* TEXT */
                    ),
                    r.overdue ? (e.openBlock(), e.createElementBlock(
                      "small",
                      lo,
                      e.toDisplayString(y.$t("逾期 {n}", { n: r.overdue })),
                      1
                      /* TEXT */
                    )) : e.createCommentVNode("v-if", !0)
                  ], 8, to))),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ])) : (e.openBlock(), e.createElementBlock(
                "p",
                xn,
                e.toDisplayString(y.$t("还没有参与的项目")),
                1
                /* TEXT */
              ))
            ]),
            e.createCommentVNode(" 最近会议 "),
            e.createElementVNode("section", no, [
              e.createElementVNode("header", oo, [
                e.createElementVNode(
                  "h3",
                  null,
                  e.toDisplayString(y.$t("最近会议")),
                  1
                  /* TEXT */
                ),
                V[18] || (V[18] = e.createElementVNode(
                  "span",
                  { class: "mm-grow" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createElementVNode("button", {
                  type: "button",
                  class: "ss-link",
                  onClick: V[4] || (V[4] = (r) => e.unref(_e)("meetings"))
                }, [
                  e.createTextVNode(
                    e.toDisplayString(y.$t("全部会议")),
                    1
                    /* TEXT */
                  ),
                  V[17] || (V[17] = e.createElementVNode(
                    "i",
                    { class: "ri-arrow-right-s-line" },
                    null,
                    -1
                    /* CACHED */
                  ))
                ])
              ]),
              o.value.recentMeetings.length ? (e.openBlock(), e.createElementBlock("ul", so, [
                (e.openBlock(!0), e.createElementBlock(
                  e.Fragment,
                  null,
                  e.renderList(o.value.recentMeetings, (r) => (e.openBlock(), e.createElementBlock("li", {
                    key: r.id,
                    onClick: (W) => e.unref(de)({ kind: "meeting", id: r.id })
                  }, [
                    e.createElementVNode(
                      "strong",
                      null,
                      e.toDisplayString(r.title),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "small",
                      null,
                      e.toDisplayString(r.projectName) + " · " + e.toDisplayString(e.unref(Tt)(r.time)),
                      1
                      /* TEXT */
                    ),
                    V[19] || (V[19] = e.createElementVNode(
                      "span",
                      { class: "mm-grow" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createElementVNode(
                      "span",
                      {
                        class: e.normalizeClass(["mm-tag", e.unref(ut)[r.status]])
                      },
                      e.toDisplayString(e.unref(Xe)[r.status]),
                      3
                      /* TEXT, CLASS */
                    )
                  ], 8, ro))),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ])) : (e.openBlock(), e.createElementBlock("div", ao, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(y.$t("还没有参加过会议")),
                  1
                  /* TEXT */
                ),
                z.value ? (e.openBlock(), e.createElementBlock(
                  "button",
                  {
                    key: 0,
                    type: "button",
                    class: "mm-btn soft sm",
                    "data-test": "mm-home-new-meeting",
                    onClick: J
                  },
                  e.toDisplayString(y.$t("新建会议")),
                  1
                  /* TEXT */
                )) : e.createCommentVNode("v-if", !0)
              ]))
            ])
          ])
        ],
        64
        /* STABLE_FRAGMENT */
      )) : e.createCommentVNode("v-if", !0)
    ]));
  }
}), co = /* @__PURE__ */ oe(io, [["__scopeId", "data-v-aa63f838"]]), mo = {
  class: "mm-up",
  "data-test": "mm-upload-panel"
}, uo = {
  key: 0,
  class: "mm-up__zone"
}, po = ["disabled"], vo = { class: "mm-up__formats" }, ko = { class: "ss-muted" }, yo = {
  key: 1,
  class: "ss-note"
}, go = { class: "mm-up__proc" }, fo = { class: "mm-up__stages" }, No = { class: "mm-up__bar" }, Vo = { class: "mm-up__line" }, Eo = {
  key: 0,
  class: "ss-muted"
}, $o = {
  key: 1,
  class: "ss-muted"
}, bo = {
  key: 0,
  class: "ss-note warn",
  "data-test": "mm-process-stalled"
}, ho = {
  key: 1,
  class: "ss-muted"
}, _o = {
  class: "ss-note danger",
  "data-test": "mm-process-failed"
}, Bo = { class: "ss-actions" }, So = ["disabled"], Do = ["disabled"], wo = {
  key: 2,
  class: "ss-muted"
}, Co = {
  key: 3,
  class: "ss-note danger"
}, To = /* @__PURE__ */ e.defineComponent({
  __name: "UploadPanel",
  props: {
    detail: {},
    live: {},
    now: {},
    waitFrom: {}
  },
  emits: ["changed", "log", "wait"],
  setup(l, { emit: u }) {
    const n = l, p = u, f = ie.useNotificationStore(), s = e.ref(!1), o = e.ref(""), d = e.computed(() => n.detail.meeting), i = e.computed(() => n.detail.names[d.value.hostId]?.name || ""), k = e.computed(() => {
      const M = d.value.process;
      return n.live ? { stage: n.live.stage, progress: n.live.progress, text: n.live.text } : { stage: M?.stage || "extract", progress: M?.progress || 0, text: M?.log?.length ? M.log[M.log.length - 1].text : "" };
    }), h = e.computed(() => Math.max(0, Math.min(100, Math.round(k.value.progress || 0)))), m = e.computed(() => {
      const M = d.value.files || [];
      if (M.length && M.every((T) => T.kind === "transcript")) return ["parse", "organize"];
      const C = M.some((T) => T.kind === "video") ? ["extract", "transcribe", "diarize", "organize"] : ["transcribe", "diarize", "organize"];
      return C.includes(k.value.stage) ? C : ["extract", "transcribe", "diarize", "parse", "organize"];
    }), c = e.computed(() => Math.max(0, m.value.indexOf(k.value.stage))), g = e.computed(() => d.value.process?.startedAt || 0), N = e.computed(() => Math.max(gl(d.value.process, n.live?.at) || 0, n.waitFrom || 0)), a = e.computed(() => !!N.value && n.now - N.value > fl), I = e.computed(() => Math.floor((n.now - N.value) / 6e4));
    async function P() {
      if (!s.value) {
        s.value = !0, o.value = "";
        try {
          await Y("meeting.pickFiles", { id: d.value.id }) && f.success(t.t("文件已上传，开始处理")), p("changed");
        } catch (M) {
          o.value = Z.errorMessage(M);
        } finally {
          s.value = !1;
        }
      }
    }
    async function U() {
      if (!s.value) {
        s.value = !0, o.value = "";
        try {
          await Y("meeting.retry", { id: d.value.id }), p("changed");
        } catch (M) {
          o.value = Z.errorMessage(M);
        } finally {
          s.value = !1;
        }
      }
    }
    return (M, C) => (e.openBlock(), e.createElementBlock("section", mo, [
      e.createCommentVNode(" 待上传 "),
      d.value.status === "pending_upload" ? (e.openBlock(), e.createElementBlock(
        e.Fragment,
        { key: 0 },
        [
          l.detail.my.isHost ? (e.openBlock(), e.createElementBlock("div", uo, [
            C[3] || (C[3] = e.createElementVNode(
              "i",
              {
                class: "ri-upload-cloud-2-line mm-up__icon",
                "aria-hidden": "true"
              },
              null,
              -1
              /* CACHED */
            )),
            e.createElementVNode(
              "strong",
              null,
              e.toDisplayString(M.$t("上传会议录音、录屏或文字记录")),
              1
              /* TEXT */
            ),
            e.createElementVNode(
              "p",
              null,
              e.toDisplayString(M.$t("优先上传录音或录屏：系统按停顿切段转写，再和本场参会人的声纹比对，自动认出谁在说话。只有文字记录时，没有发言人标注的段落要你手动分配。")),
              1
              /* TEXT */
            ),
            e.createElementVNode("button", {
              type: "button",
              class: "ss-btn primary",
              disabled: s.value,
              "data-test": "mm-pick-files",
              onClick: P
            }, [
              e.createElementVNode(
                "i",
                {
                  class: e.normalizeClass(s.value ? "ri-loader-4-line spin" : "ri-folder-open-line")
                },
                null,
                2
                /* CLASS */
              ),
              e.createTextVNode(
                e.toDisplayString(s.value ? M.$t("正在拷入文件…") : M.$t("选择文件")),
                1
                /* TEXT */
              )
            ], 8, po),
            e.createElementVNode("ul", vo, [
              e.createElementVNode("li", null, [
                e.createElementVNode(
                  "b",
                  null,
                  e.toDisplayString(M.$t("录音")),
                  1
                  /* TEXT */
                ),
                e.createTextVNode(
                  e.toDisplayString(M.$t("mp3、m4a、wav、aac、amr、flac、ogg、opus、wma 等")),
                  1
                  /* TEXT */
                )
              ]),
              e.createElementVNode("li", null, [
                e.createElementVNode(
                  "b",
                  null,
                  e.toDisplayString(M.$t("录屏")),
                  1
                  /* TEXT */
                ),
                e.createTextVNode(
                  e.toDisplayString(M.$t("mp4、mov、mkv、avi、flv、wmv、webm 等，自动提取音轨")),
                  1
                  /* TEXT */
                )
              ]),
              e.createElementVNode("li", null, [
                e.createElementVNode(
                  "b",
                  null,
                  e.toDisplayString(M.$t("文字记录")),
                  1
                  /* TEXT */
                ),
                e.createTextVNode(
                  e.toDisplayString(M.$t("txt、md、docx、srt、vtt、json，跳过转写，按参会昵称匹配员工")),
                  1
                  /* TEXT */
                )
              ])
            ]),
            e.createElementVNode(
              "small",
              ko,
              e.toDisplayString(M.$t("扩展名不认识的文件会先探测，有音轨就当录音处理；可以一次选多个文件。")),
              1
              /* TEXT */
            )
          ])) : (e.openBlock(), e.createElementBlock("p", yo, [
            C[4] || (C[4] = e.createElementVNode(
              "i",
              { class: "ri-time-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(M.$t("等待主持人 {name} 上传会议文件", { name: i.value })),
              1
              /* TEXT */
            )
          ]))
        ],
        64
        /* STABLE_FRAGMENT */
      )) : d.value.status === "processing" ? (e.openBlock(), e.createElementBlock(
        e.Fragment,
        { key: 1 },
        [
          e.createCommentVNode(" 处理中 "),
          e.createElementVNode("div", go, [
            e.createElementVNode("ol", fo, [
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(m.value, (T, z) => (e.openBlock(), e.createElementBlock(
                  "li",
                  {
                    key: T,
                    class: e.normalizeClass({ done: z < c.value, cur: z === c.value })
                  },
                  [
                    e.createElementVNode(
                      "i",
                      {
                        class: e.normalizeClass(z < c.value ? "ri-checkbox-circle-fill" : z === c.value ? "ri-loader-4-line spin" : "ri-checkbox-blank-circle-line")
                      },
                      null,
                      2
                      /* CLASS */
                    ),
                    e.createTextVNode(
                      e.toDisplayString(e.unref(je)[T]),
                      1
                      /* TEXT */
                    )
                  ],
                  2
                  /* CLASS */
                ))),
                128
                /* KEYED_FRAGMENT */
              ))
            ]),
            e.createElementVNode("div", No, [
              e.createElementVNode(
                "i",
                {
                  style: e.normalizeStyle({ width: `${h.value}%` })
                },
                null,
                4
                /* STYLE */
              )
            ]),
            e.createElementVNode("p", Vo, [
              e.createElementVNode(
                "b",
                null,
                e.toDisplayString(e.unref(je)[k.value.stage]) + " · " + e.toDisplayString(h.value) + "%",
                1
                /* TEXT */
              ),
              k.value.text ? (e.openBlock(), e.createElementBlock(
                "span",
                Eo,
                e.toDisplayString(k.value.text),
                1
                /* TEXT */
              )) : e.createCommentVNode("v-if", !0),
              C[5] || (C[5] = e.createElementVNode(
                "span",
                { class: "mm-grow" },
                null,
                -1
                /* CACHED */
              )),
              g.value ? (e.openBlock(), e.createElementBlock(
                "span",
                $o,
                e.toDisplayString(M.$t("已用时 {t}", { t: e.unref(cl)(l.now - g.value) })),
                1
                /* TEXT */
              )) : e.createCommentVNode("v-if", !0)
            ]),
            a.value ? (e.openBlock(), e.createElementBlock("p", bo, [
              C[6] || (C[6] = e.createElementVNode(
                "i",
                { class: "ri-hourglass-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(M.$t("已经 {m} 分钟没有新进度。长录音转写较慢，可以继续等待；也可以看看处理日志。", { m: I.value })),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "button",
                {
                  type: "button",
                  class: "ss-link",
                  onClick: C[0] || (C[0] = (T) => p("wait"))
                },
                e.toDisplayString(M.$t("继续等待")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "button",
                {
                  type: "button",
                  class: "ss-link",
                  onClick: C[1] || (C[1] = (T) => p("log"))
                },
                e.toDisplayString(M.$t("查看日志")),
                1
                /* TEXT */
              )
            ])) : (e.openBlock(), e.createElementBlock(
              "small",
              ho,
              e.toDisplayString(M.$t("处理在后台进行，可以先去做别的事；完成后发言人会收到确认通知。")),
              1
              /* TEXT */
            ))
          ])
        ],
        64
        /* STABLE_FRAGMENT */
      )) : d.value.status === "failed" ? (e.openBlock(), e.createElementBlock(
        e.Fragment,
        { key: 2 },
        [
          e.createCommentVNode(" 失败 "),
          e.createElementVNode("p", _o, [
            C[7] || (C[7] = e.createElementVNode(
              "i",
              { class: "ri-error-warning-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(M.$t("处理失败（{stage}）：{error}", { stage: e.unref(je)[d.value.process?.stage || "extract"], error: d.value.process?.error || M.$t("未知原因") })),
              1
              /* TEXT */
            )
          ]),
          e.createElementVNode("div", Bo, [
            l.detail.my.isHost ? (e.openBlock(), e.createElementBlock("button", {
              key: 0,
              type: "button",
              class: "ss-btn primary",
              disabled: s.value,
              "data-test": "mm-retry",
              onClick: U
            }, [
              e.createElementVNode(
                "i",
                {
                  class: e.normalizeClass(s.value ? "ri-loader-4-line spin" : "ri-restart-line")
                },
                null,
                2
                /* CLASS */
              ),
              e.createTextVNode(
                e.toDisplayString(M.$t("重试")),
                1
                /* TEXT */
              )
            ], 8, So)) : e.createCommentVNode("v-if", !0),
            l.detail.my.isHost ? (e.openBlock(), e.createElementBlock("button", {
              key: 1,
              type: "button",
              class: "ss-btn",
              disabled: s.value,
              onClick: P
            }, [
              C[8] || (C[8] = e.createElementVNode(
                "i",
                { class: "ri-folder-open-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(M.$t("换文件重新上传")),
                1
                /* TEXT */
              )
            ], 8, Do)) : e.createCommentVNode("v-if", !0),
            e.createElementVNode("button", {
              type: "button",
              class: "ss-btn ghost",
              onClick: C[2] || (C[2] = (T) => p("log"))
            }, [
              C[9] || (C[9] = e.createElementVNode(
                "i",
                { class: "ri-file-list-3-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(M.$t("查看处理日志")),
                1
                /* TEXT */
              )
            ]),
            l.detail.my.isHost ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock(
              "span",
              wo,
              e.toDisplayString(M.$t("等待主持人 {name} 重试", { name: i.value })),
              1
              /* TEXT */
            ))
          ])
        ],
        64
        /* STABLE_FRAGMENT */
      )) : e.createCommentVNode("v-if", !0),
      o.value ? (e.openBlock(), e.createElementBlock("p", Co, [
        C[10] || (C[10] = e.createElementVNode(
          "i",
          { class: "ri-error-warning-line" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(o.value),
          1
          /* TEXT */
        )
      ])) : e.createCommentVNode("v-if", !0)
    ]));
  }
}), Io = /* @__PURE__ */ oe(To, [["__scopeId", "data-v-a1e2ccd7"]]), Mo = ["data-test"], Ao = ["aria-label", "data-test", "onClick"], jo = ["data-test"], Lo = { class: "mm-pss__name" }, zo = { key: 0 }, Fo = ["aria-label", "aria-expanded", "aria-activedescendant", "placeholder", "disabled", "data-test"], Po = ["aria-label", "data-test"], Uo = {
  key: 3,
  class: "ri-arrow-down-s-line mm-pss__caret",
  "aria-hidden": "true"
}, Oo = ["aria-multiselectable", "data-test"], Ro = { class: "mm-pss-pop__group" }, qo = ["id", "aria-selected", "data-test", "onMouseenter", "onClick"], Ko = { class: "mm-pss-pop__name" }, Ho = { key: 0 }, Wo = { key: 1 }, Go = {
  key: 2,
  class: "ri-check-line mm-pss-pop__check",
  "aria-hidden": "true"
}, Yo = {
  key: 0,
  class: "mm-pss-pop__empty"
}, Jo = /* @__PURE__ */ e.defineComponent({
  __name: "PersonSearchSelect",
  props: {
    modelValue: { default: "" },
    values: { default: () => [] },
    multiple: { type: Boolean, default: !1 },
    max: { default: 0 },
    people: { default: null },
    only: {},
    exclude: {},
    pinned: {},
    pinnedLabel: { default: "" },
    extras: {},
    extrasLabel: { default: "" },
    names: {},
    hint: {},
    placeholder: { default: "" },
    ariaLabel: { default: "" },
    disabled: { type: Boolean, default: !1 },
    clearable: { type: Boolean, default: !1 },
    dataTest: { default: "" }
  },
  emits: ["update:modelValue", "change", "update:values"],
  setup(l, { emit: u }) {
    const n = l, p = u, f = e.ref(null), s = e.ref(null), o = e.ref(null), d = e.ref(!1), i = e.ref(""), k = e.ref(0), h = e.ref(null), m = e.ref(!1), c = e.ref({}), g = `mm-pss-${Math.random().toString(36).slice(2, 9)}`, N = `${g}-list`, a = e.computed(() => n.placeholder || t.t("搜索姓名、拼音或部门")), I = e.computed(() => n.people ?? h.value ?? { depts: [], people: [] }), P = (w) => I.value.depts.find((L) => L.id === w)?.name || "";
    let U = null;
    const M = e.ref(!1);
    function C() {
      U || M.value || Promise.resolve().then(() => a$).then((w) => {
        U = w.pinyin, M.value = !0;
      }).catch(() => {
      });
    }
    const T = /* @__PURE__ */ new Map();
    function z(w) {
      if (!U || !/[㐀-鿿]/.test(w)) return "";
      const L = T.get(w);
      if (L !== void 0) return L;
      let x = "";
      try {
        const Q = U(w, { toneType: "none", type: "array" }).map((se) => String(se).toLowerCase());
        x = `${Q.join("")} ${Q.map((se) => se[0] || "").join("")}`;
      } catch {
        x = "";
      }
      return T.set(w, x), x;
    }
    function R(w, L, x, Q, se = "") {
      const Ve = P(x) || se, be = re(L), Te = n.hint?.(w) || "";
      return M.value, {
        value: w,
        label: L,
        sub: [Ve, Q].filter(Boolean).join(" · "),
        hint: Te,
        initial: be.text,
        color: be.color,
        deptId: x,
        search: `${L} ${Ve} ${Q || ""} ${z(L)}`.toLowerCase()
      };
    }
    const _ = e.computed(() => {
      const w = n.only ? new Set(n.only) : null, L = new Set(n.exclude ?? []);
      return I.value.people.filter((x) => !x.left && (!w || w.has(x.id)) && !L.has(x.id)).map((x) => R(x.id, x.name, x.deptId, x.title));
    }), E = e.computed(() => (n.extras ?? []).map((w) => {
      const L = re(w.label);
      return { value: w.value, label: w.label, sub: w.sub || "", hint: "", initial: L.text, color: L.color, deptId: "", search: `${w.label} ${w.sub || ""} ${z(w.label)}`.toLowerCase() };
    })), v = e.computed(() => {
      const w = new Set(n.exclude ?? []);
      return (n.pinned ?? []).filter((L) => !w.has(L)).map((L) => {
        const x = I.value.people.find((se) => se.id === L);
        if (x) return R(x.id, x.name, x.deptId, x.title);
        const Q = n.names?.[L];
        return R(L, Q?.name || L, "", void 0, Q?.deptName || "");
      });
    });
    function S(w, L) {
      return L ? L.split(/\s+/).filter(Boolean).every((x) => w.search.includes(x)) : !0;
    }
    const j = e.computed(() => {
      const w = i.value.trim().toLowerCase(), L = [], x = E.value.filter((me) => S(me, w));
      x.length && L.push({ key: "__extras", label: n.extrasLabel || t.t("本场发言人"), options: x });
      const Q = v.value.filter((me) => S(me, w));
      Q.length && L.push({ key: "__pinned", label: n.pinnedLabel || t.t("本场参会人"), options: Q });
      const se = new Set(n.pinned ?? []), Ve = _.value.filter((me) => !se.has(me.value) && S(me, w)), be = /* @__PURE__ */ new Set();
      for (const me of I.value.depts) {
        be.add(me.id);
        const Re = Ve.filter((tt) => tt.deptId === me.id);
        Re.length && L.push({ key: me.id, label: me.name, options: Re });
      }
      const Te = Ve.filter((me) => !be.has(me.deptId));
      return Te.length && L.push({ key: "__other", label: t.t("其他"), options: Te }), L;
    }), J = e.computed(() => j.value.flatMap((w) => w.options)), y = e.computed(() => n.multiple ? n.values.filter(Boolean) : n.modelValue ? [n.modelValue] : []), V = (w) => y.value.includes(w), r = e.computed(() => n.multiple ? null : X(n.modelValue)), W = e.computed(() => y.value.map(X).filter((w) => !!w));
    function X(w) {
      return w ? E.value.find((L) => L.value === w) ?? v.value.find((L) => L.value === w) ?? _.value.find((L) => L.value === w) ?? (() => {
        const L = I.value.people.find((Q) => Q.id === w), x = n.names?.[w];
        return L || x ? R(w, L?.name || x.name, L?.deptId || "", L?.title, x?.deptName || "") : null;
      })() : null;
    }
    const ae = (w) => `${g}-${w.value.replace(/[^A-Za-z0-9_-]/g, "_")}`;
    function q() {
      const w = f.value;
      if (!w) return;
      const L = w.getBoundingClientRect(), x = window.innerHeight || 800, Q = x - L.bottom - 12, se = L.top - 12, Ve = Q < 220 && se > Q, be = Math.max(160, Math.min(340, Ve ? se : Q));
      c.value = {
        position: "fixed",
        left: `${Math.round(L.left)}px`,
        width: `${Math.round(Math.max(L.width, 260))}px`,
        maxHeight: `${Math.round(be)}px`,
        ...Ve ? { bottom: `${Math.round(x - L.top + 4)}px` } : { top: `${Math.round(L.bottom + 4)}px` }
      };
    }
    function H() {
      d.value && q();
    }
    function ee() {
      if (n.disabled || d.value) return;
      C(), !n.people && !h.value && !m.value && (m.value = !0, De().then((L) => {
        h.value = L;
      }).catch(() => {
      }).finally(() => {
        m.value = !1;
      })), i.value = "", d.value = !0;
      const w = J.value.findIndex((L) => V(L.value));
      k.value = w >= 0 ? w : 0, q(), window.addEventListener("scroll", H, !0), window.addEventListener("resize", H), e.nextTick(G);
    }
    function le() {
      d.value && (d.value = !1, i.value = "", window.removeEventListener("scroll", H, !0), window.removeEventListener("resize", H));
    }
    function $(w) {
      if (!n.disabled) {
        if (w.target !== s.value && w.preventDefault(), d.value && w.target !== s.value) {
          le();
          return;
        }
        s.value?.focus(), ee();
      }
    }
    function b() {
      le();
    }
    function B(w) {
      if (!w) return;
      const L = y.value;
      L.includes(w) ? p("update:values", L.filter((x) => x !== w)) : (!n.max || L.length < n.max) && p("update:values", [...L, w]), i.value = "";
    }
    function D() {
      if (n.multiple) {
        p("update:values", []);
        return;
      }
      O("");
    }
    function O(w) {
      if (n.multiple) {
        B(w);
        return;
      }
      w !== n.modelValue && (p("update:modelValue", w), p("change", w)), le(), s.value?.blur();
    }
    function G() {
      const w = J.value[k.value];
      if (!w || !o.value) return;
      o.value.querySelector(`#${CSS.escape(ae(w))}`)?.scrollIntoView?.({ block: "nearest" });
    }
    function F(w) {
      if (n.multiple && w.key === "Backspace" && !i.value && y.value.length) {
        B(y.value[y.value.length - 1]);
        return;
      }
      if (!d.value && (w.key === "ArrowDown" || w.key === "Enter")) {
        w.preventDefault(), ee();
        return;
      }
      if (!d.value) return;
      const L = J.value.length;
      if (w.key === "ArrowDown")
        w.preventDefault(), L && (k.value = (k.value + 1) % L), e.nextTick(G);
      else if (w.key === "ArrowUp")
        w.preventDefault(), L && (k.value = (k.value - 1 + L) % L), e.nextTick(G);
      else if (w.key === "Enter") {
        w.preventDefault();
        const x = J.value[k.value];
        x && O(x.value);
      } else w.key === "Escape" ? (w.preventDefault(), w.stopPropagation(), le()) : w.key === "Tab" && le();
    }
    return e.watch(() => J.value.length, (w) => {
      k.value >= w && (k.value = Math.max(0, w - 1));
    }), e.watch(() => n.disabled, (w) => {
      w && le();
    }), e.onMounted(() => {
      !n.people && y.value.length && (m.value = !0, De().then((w) => {
        h.value = w;
      }).catch(() => {
      }).finally(() => {
        m.value = !1;
      }));
    }), e.onBeforeUnmount(le), (w, L) => (e.openBlock(), e.createElementBlock(
      "div",
      {
        ref_key: "root",
        ref: f,
        class: e.normalizeClass(["mm-pss", { open: d.value, disabled: l.disabled, multi: l.multiple }]),
        onMousedown: $
      },
      [
        L[7] || (L[7] = e.createElementVNode(
          "i",
          {
            class: "ri-search-line mm-pss__icon",
            "aria-hidden": "true"
          },
          null,
          -1
          /* CACHED */
        )),
        e.createCommentVNode(" 多选：已选的人是输入框里的小标签，点 × 去掉 "),
        l.multiple ? (e.openBlock(!0), e.createElementBlock(
          e.Fragment,
          { key: 0 },
          e.renderList(W.value, (x) => (e.openBlock(), e.createElementBlock("span", {
            key: x.value,
            class: "mm-pss__chip",
            "data-test": l.dataTest ? `${l.dataTest}-chip-${x.value}` : void 0
          }, [
            e.createElementVNode(
              "span",
              {
                class: "mm-pss__av",
                style: e.normalizeStyle({ background: x.color })
              },
              e.toDisplayString(x.initial),
              5
              /* TEXT, STYLE */
            ),
            e.createTextVNode(
              e.toDisplayString(x.label) + " ",
              1
              /* TEXT */
            ),
            l.disabled ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock("button", {
              key: 0,
              type: "button",
              class: "mm-pss__chip-x",
              "aria-label": w.$t("移除 {name}", { name: x.label }),
              "data-test": l.dataTest ? `${l.dataTest}-chip-x-${x.value}` : void 0,
              onMousedown: L[0] || (L[0] = e.withModifiers(() => {
              }, ["prevent", "stop"])),
              onClick: (Q) => B(x.value)
            }, [...L[5] || (L[5] = [
              e.createElementVNode(
                "i",
                { class: "ri-close-line" },
                null,
                -1
                /* CACHED */
              )
            ])], 40, Ao))
          ], 8, Mo))),
          128
          /* KEYED_FRAGMENT */
        )) : e.createCommentVNode("v-if", !0),
        !l.multiple && !d.value && r.value ? (e.openBlock(), e.createElementBlock("span", {
          key: 1,
          class: "mm-pss__value",
          "data-test": l.dataTest ? `${l.dataTest}-value` : void 0
        }, [
          e.createElementVNode(
            "span",
            {
              class: "mm-pss__av",
              style: e.normalizeStyle({ background: r.value.color })
            },
            e.toDisplayString(r.value.initial),
            5
            /* TEXT, STYLE */
          ),
          e.createElementVNode(
            "span",
            Lo,
            e.toDisplayString(r.value.label),
            1
            /* TEXT */
          ),
          r.value.sub ? (e.openBlock(), e.createElementBlock(
            "small",
            zo,
            e.toDisplayString(r.value.sub),
            1
            /* TEXT */
          )) : e.createCommentVNode("v-if", !0)
        ], 8, jo)) : e.createCommentVNode("v-if", !0),
        e.withDirectives(e.createElementVNode("input", {
          ref_key: "inputEl",
          ref: s,
          "onUpdate:modelValue": L[1] || (L[1] = (x) => i.value = x),
          class: e.normalizeClass(["mm-pss__input", { ghost: !l.multiple && !d.value && !!r.value }]),
          type: "text",
          role: "combobox",
          autocomplete: "off",
          spellcheck: "false",
          "aria-label": l.ariaLabel || a.value,
          "aria-expanded": d.value,
          "aria-autocomplete": "list",
          "aria-controls": N,
          "aria-activedescendant": d.value && J.value[k.value] ? ae(J.value[k.value]) : void 0,
          placeholder: l.multiple ? y.value.length ? "" : a.value : !d.value && r.value ? "" : a.value,
          disabled: l.disabled,
          "data-test": l.dataTest,
          onFocus: ee,
          onInput: L[2] || (L[2] = (x) => k.value = 0),
          onKeydown: F,
          onBlur: b
        }, null, 42, Fo), [
          [e.vModelText, i.value]
        ]),
        l.clearable && y.value.length && !l.disabled ? (e.openBlock(), e.createElementBlock("button", {
          key: 2,
          type: "button",
          class: "mm-pss__clear",
          "aria-label": w.$t("清除"),
          "data-test": l.dataTest ? `${l.dataTest}-clear` : void 0,
          onMousedown: L[3] || (L[3] = e.withModifiers(() => {
          }, ["prevent", "stop"])),
          onClick: D
        }, [...L[6] || (L[6] = [
          e.createElementVNode(
            "i",
            { class: "ri-close-circle-fill" },
            null,
            -1
            /* CACHED */
          )
        ])], 40, Po)) : (e.openBlock(), e.createElementBlock("i", Uo)),
        (e.openBlock(), e.createBlock(e.Teleport, { to: "body" }, [
          d.value ? (e.openBlock(), e.createElementBlock("div", {
            key: 0,
            id: N,
            ref_key: "popEl",
            ref: o,
            class: "mm-pss-pop",
            role: "listbox",
            "aria-multiselectable": l.multiple || void 0,
            style: e.normalizeStyle(c.value),
            "data-test": l.dataTest ? `${l.dataTest}-list` : void 0,
            onMousedown: L[4] || (L[4] = e.withModifiers(() => {
            }, ["prevent"]))
          }, [
            (e.openBlock(!0), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(j.value, (x) => (e.openBlock(), e.createElementBlock(
                e.Fragment,
                {
                  key: x.key
                },
                [
                  e.createElementVNode(
                    "div",
                    Ro,
                    e.toDisplayString(x.label),
                    1
                    /* TEXT */
                  ),
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(x.options, (Q) => (e.openBlock(), e.createElementBlock("div", {
                      id: ae(Q),
                      key: Q.value,
                      role: "option",
                      "aria-selected": V(Q.value),
                      class: e.normalizeClass(["mm-pss-pop__opt", { active: J.value[k.value]?.value === Q.value, sel: V(Q.value) }]),
                      "data-test": l.dataTest ? `${l.dataTest}-opt-${Q.value}` : void 0,
                      onMouseenter: (se) => k.value = J.value.indexOf(Q),
                      onClick: (se) => O(Q.value)
                    }, [
                      e.createElementVNode(
                        "span",
                        {
                          class: "mm-pss__av",
                          style: e.normalizeStyle({ background: Q.color })
                        },
                        e.toDisplayString(Q.initial),
                        5
                        /* TEXT, STYLE */
                      ),
                      e.createElementVNode(
                        "span",
                        Ko,
                        e.toDisplayString(Q.label),
                        1
                        /* TEXT */
                      ),
                      Q.sub ? (e.openBlock(), e.createElementBlock(
                        "small",
                        Ho,
                        e.toDisplayString(Q.sub),
                        1
                        /* TEXT */
                      )) : e.createCommentVNode("v-if", !0),
                      Q.hint ? (e.openBlock(), e.createElementBlock(
                        "em",
                        Wo,
                        e.toDisplayString(Q.hint),
                        1
                        /* TEXT */
                      )) : e.createCommentVNode("v-if", !0),
                      V(Q.value) ? (e.openBlock(), e.createElementBlock("i", Go)) : e.createCommentVNode("v-if", !0)
                    ], 42, qo))),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ],
                64
                /* STABLE_FRAGMENT */
              ))),
              128
              /* KEYED_FRAGMENT */
            )),
            J.value.length ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock(
              "div",
              Yo,
              e.toDisplayString(m.value ? w.$t("正在加载人员…") : i.value.trim() ? w.$t("没有找到「{q}」", { q: i.value.trim() }) : w.$t("没有可选的人员")),
              1
              /* TEXT */
            ))
          ], 44, Oo)) : e.createCommentVNode("v-if", !0)
        ]))
      ],
      34
      /* CLASS, NEED_HYDRATION */
    ));
  }
}), Oe = /* @__PURE__ */ oe(Jo, [["__scopeId", "data-v-051698b0"]]), Qo = { class: "mm-sa__head" }, Zo = { class: "ss-muted" }, Xo = ["aria-expanded"], xo = {
  key: 0,
  class: "ss-note"
}, ea = ["data-test"], ta = { class: "mm-sa__who" }, la = { class: "mm-sa__label" }, na = { class: "mm-sa__sample" }, oa = ["src"], aa = { class: "mm-sa__ops" }, sa = ["disabled", "data-test", "onClick"], ra = { class: "ss-chip ok" }, ia = ["onClick"], ca = ["disabled", "data-test", "onClick"], da = {
  key: 2,
  class: "ss-chip warn"
}, ma = {
  key: 0,
  class: "ss-note danger"
}, ua = { class: "ss-muted" }, pa = /* @__PURE__ */ e.defineComponent({
  __name: "SpeakerAssignPanel",
  props: {
    detail: {}
  },
  emits: ["changed"],
  setup(l, { emit: u }) {
    const n = l, p = u, f = e.reactive({}), s = e.reactive({}), o = e.ref(""), d = e.ref(""), i = e.ref(""), k = e.ref(""), h = e.computed(() => n.detail.meeting), m = e.computed(() => h.value.status !== "pending_assign"), c = e.ref(!m.value), g = e.computed(() => ["pending_assign", "pending_confirm", "pending_review"].includes(h.value.status)), N = e.ref({ depts: [], people: [] });
    e.onMounted(async () => {
      try {
        N.value = await De();
      } catch {
      }
    });
    const a = e.computed(() => n.detail.names[h.value.hostId]?.name || ""), I = (R) => n.detail.names[R]?.name || R, P = e.computed(() => {
      const R = h.value.speakers.map((_) => {
        const E = h.value.segments.filter((j) => j.speakerLabel === _.label).sort((j, J) => j.start - J.start), v = E.filter((j) => j.text.trim()).slice(0, 2).map((j) => j.text.length > 60 ? `${j.text.slice(0, 60)}…` : j.text), S = E.reduce((j, J) => j + Math.max(0, J.end - J.start), 0);
        return { ..._, count: E.length, seconds: S, samples: v };
      });
      return [...R.filter((_) => !_.personId), ...R.filter((_) => _.personId)];
    }), U = e.computed(() => P.value.filter((R) => !R.personId));
    function M(R, _) {
      return h.value.speakers.find((E) => E.personId === R && E.label !== _)?.label || "";
    }
    function C(R, _) {
      i.value = R, s[R] = _ || "";
    }
    async function T(R) {
      if (f[R]) {
        const _ = f[R];
        f[R] = "", setTimeout(() => {
          f[R] = _;
        }, 0);
        return;
      }
      o.value = R, k.value = "";
      try {
        const _ = await Y("meeting.speaker.clip", { id: h.value.id, label: R });
        if (!_?.dataUrl) throw new Error(t.t("这位发言人没有可试听的片段"));
        f[R] = _.dataUrl;
      } catch (_) {
        k.value = Z.errorMessage(_);
      } finally {
        o.value = "";
      }
    }
    async function z(R) {
      const _ = s[R];
      if (_) {
        d.value = R, k.value = "";
        try {
          await Y("meeting.speaker.assign", { id: h.value.id, label: R, personId: _ }), i.value = "", p("changed");
        } catch (E) {
          k.value = Z.errorMessage(E);
        } finally {
          d.value = "";
        }
      }
    }
    return (R, _) => (e.openBlock(), e.createElementBlock(
      "section",
      {
        class: e.normalizeClass(["mm-sa", { quiet: m.value }]),
        "data-test": "mm-speaker-assign"
      },
      [
        e.createElementVNode("header", Qo, [
          e.createElementVNode(
            "h4",
            null,
            e.toDisplayString(m.value ? R.$t("更正发言人") : R.$t("指认发言人")),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "span",
            Zo,
            e.toDisplayString(m.value ? R.$t("声纹认错了：试听后整组改给正确的人；只是个别段认错，在下面的纪要里逐段改") : U.value.length ? R.$t("{n} 位没认出来 · 试听片段后选人", { n: U.value.length }) : R.$t("发言人都已认出")),
            1
            /* TEXT */
          ),
          _[2] || (_[2] = e.createElementVNode(
            "span",
            { class: "mm-grow" },
            null,
            -1
            /* CACHED */
          )),
          m.value ? (e.openBlock(), e.createElementBlock("button", {
            key: 0,
            type: "button",
            class: "ss-link",
            "aria-expanded": c.value,
            "data-test": "mm-speaker-toggle",
            onClick: _[0] || (_[0] = (E) => c.value = !c.value)
          }, [
            e.createTextVNode(
              e.toDisplayString(c.value ? R.$t("收起") : R.$t("展开")),
              1
              /* TEXT */
            ),
            e.createElementVNode(
              "i",
              {
                class: e.normalizeClass(c.value ? "ri-arrow-up-s-line" : "ri-arrow-down-s-line")
              },
              null,
              2
              /* CLASS */
            )
          ], 8, Xo)) : e.createCommentVNode("v-if", !0)
        ]),
        !l.detail.my.isHost && !m.value ? (e.openBlock(), e.createElementBlock("p", xo, [
          _[3] || (_[3] = e.createElementVNode(
            "i",
            { class: "ri-time-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            e.toDisplayString(R.$t("等待主持人 {name} 指认发言人", { name: a.value })),
            1
            /* TEXT */
          )
        ])) : e.createCommentVNode("v-if", !0),
        c.value ? (e.openBlock(), e.createElementBlock(
          e.Fragment,
          { key: 1 },
          [
            (e.openBlock(!0), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(P.value, (E) => (e.openBlock(), e.createElementBlock("article", {
                key: E.label,
                class: e.normalizeClass(["mm-sa__row", { unknown: !E.personId }]),
                "data-test": `mm-speaker-${E.label}`
              }, [
                e.createElementVNode("div", ta, [
                  e.createElementVNode(
                    "span",
                    la,
                    e.toDisplayString(E.label),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "small",
                    null,
                    e.toDisplayString(R.$t("{n} 段 · 约 {t}", { n: E.count, t: e.unref(Ae)(E.seconds) })),
                    1
                    /* TEXT */
                  )
                ]),
                e.createElementVNode("div", na, [
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(E.samples, (v, S) => (e.openBlock(), e.createElementBlock(
                      "p",
                      { key: S },
                      e.toDisplayString(v),
                      1
                      /* TEXT */
                    ))),
                    128
                    /* KEYED_FRAGMENT */
                  )),
                  f[E.label] ? (e.openBlock(), e.createElementBlock("audio", {
                    key: 0,
                    src: f[E.label],
                    controls: "",
                    autoplay: "",
                    preload: "auto",
                    class: "mm-sa__audio"
                  }, null, 8, oa)) : e.createCommentVNode("v-if", !0)
                ]),
                e.createElementVNode("div", aa, [
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn sm",
                    disabled: o.value === E.label,
                    "data-test": `mm-speaker-clip-${E.label}`,
                    onClick: (v) => T(E.label)
                  }, [
                    e.createElementVNode(
                      "i",
                      {
                        class: e.normalizeClass(o.value === E.label ? "ri-loader-4-line spin" : "ri-play-circle-line")
                      },
                      null,
                      2
                      /* CLASS */
                    ),
                    e.createTextVNode(
                      e.toDisplayString(R.$t("试听")),
                      1
                      /* TEXT */
                    )
                  ], 8, sa),
                  E.personId && i.value !== E.label ? (e.openBlock(), e.createElementBlock(
                    e.Fragment,
                    { key: 0 },
                    [
                      e.createElementVNode("span", ra, [
                        e.createTextVNode(
                          e.toDisplayString(I(E.personId)),
                          1
                          /* TEXT */
                        ),
                        E.matchedBy === "voiceprint" && E.score != null ? (e.openBlock(), e.createElementBlock(
                          e.Fragment,
                          { key: 0 },
                          [
                            e.createTextVNode(
                              " · " + e.toDisplayString(R.$t("声纹 {p}", { p: E.score.toFixed(2) })),
                              1
                              /* TEXT */
                            )
                          ],
                          64
                          /* STABLE_FRAGMENT */
                        )) : E.matchedBy === "nickname" ? (e.openBlock(), e.createElementBlock(
                          e.Fragment,
                          { key: 1 },
                          [
                            e.createTextVNode(
                              " · " + e.toDisplayString(R.$t("昵称匹配")),
                              1
                              /* TEXT */
                            )
                          ],
                          64
                          /* STABLE_FRAGMENT */
                        )) : e.createCommentVNode("v-if", !0)
                      ]),
                      l.detail.my.isHost && g.value ? (e.openBlock(), e.createElementBlock("button", {
                        key: 0,
                        type: "button",
                        class: "ss-link",
                        onClick: (v) => C(E.label, E.personId)
                      }, e.toDisplayString(R.$t("更正")), 9, ia)) : e.createCommentVNode("v-if", !0)
                    ],
                    64
                    /* STABLE_FRAGMENT */
                  )) : l.detail.my.isHost && g.value ? (e.openBlock(), e.createElementBlock(
                    e.Fragment,
                    { key: 1 },
                    [
                      e.createVNode(Oe, {
                        "model-value": s[E.label] || "",
                        "onUpdate:modelValue": (v) => s[E.label] = v,
                        class: "mm-sa__select",
                        people: N.value,
                        pinned: h.value.attendeeIds,
                        "pinned-label": R.$t("本场参会人"),
                        names: l.detail.names,
                        hint: (v) => M(v, E.label) ? R.$t("（已指认给 {l}）", { l: M(v, E.label) }) : "",
                        "aria-label": R.$t("选择发言人…"),
                        "data-test": `mm-speaker-pick-${E.label}`
                      }, null, 8, ["model-value", "onUpdate:modelValue", "people", "pinned", "pinned-label", "names", "hint", "aria-label", "data-test"]),
                      e.createElementVNode("button", {
                        type: "button",
                        class: "ss-btn sm primary",
                        disabled: !s[E.label] || d.value === E.label,
                        "data-test": `mm-speaker-save-${E.label}`,
                        onClick: (v) => z(E.label)
                      }, [
                        e.createElementVNode(
                          "i",
                          {
                            class: e.normalizeClass(d.value === E.label ? "ri-loader-4-line spin" : "ri-check-line")
                          },
                          null,
                          2
                          /* CLASS */
                        ),
                        e.createTextVNode(
                          e.toDisplayString(R.$t("确认")),
                          1
                          /* TEXT */
                        )
                      ], 8, ca),
                      i.value === E.label ? (e.openBlock(), e.createElementBlock(
                        "button",
                        {
                          key: 0,
                          type: "button",
                          class: "ss-link",
                          onClick: _[1] || (_[1] = (v) => i.value = "")
                        },
                        e.toDisplayString(R.$t("取消")),
                        1
                        /* TEXT */
                      )) : e.createCommentVNode("v-if", !0)
                    ],
                    64
                    /* STABLE_FRAGMENT */
                  )) : (e.openBlock(), e.createElementBlock(
                    "span",
                    da,
                    e.toDisplayString(R.$t("未识别")),
                    1
                    /* TEXT */
                  ))
                ])
              ], 10, ea))),
              128
              /* KEYED_FRAGMENT */
            )),
            k.value ? (e.openBlock(), e.createElementBlock("p", ma, [
              _[4] || (_[4] = e.createElementVNode(
                "i",
                { class: "ri-error-warning-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(k.value),
                1
                /* TEXT */
              )
            ])) : e.createCommentVNode("v-if", !0),
            e.createElementVNode(
              "small",
              ua,
              e.toDisplayString(m.value ? R.$t("改给别人后，新的发言人要重新确认，其他人的确认保留。") : R.$t("只和本场参会人比对声纹；没来得及加进参会人的人也能直接选。全部指认完自动进入发言确认，系统通知每位发言人核对本人发言。")),
              1
              /* TEXT */
            )
          ],
          64
          /* STABLE_FRAGMENT */
        )) : e.createCommentVNode("v-if", !0)
      ],
      2
      /* CLASS */
    ));
  }
}), va = /* @__PURE__ */ oe(pa, [["__scopeId", "data-v-a6aa3aa3"]]), ka = {
  class: "mm-side",
  "data-test": "mm-decisions"
}, ya = ["disabled"], ga = ["disabled"], fa = {
  key: 0,
  class: "ss-muted"
}, Na = {
  key: 1,
  class: "mm-decisions"
}, Va = { class: "mm-summary" }, Ea = {
  key: 3,
  class: "ss-muted"
}, $a = {
  key: 4,
  class: "ss-muted"
}, ba = {
  key: 5,
  class: "ss-muted"
}, ha = {
  key: 1,
  class: "mm-mde",
  "data-test": "mm-minutes-editor"
}, _a = { class: "mm-mde__no" }, Ba = ["onUpdate:modelValue", "aria-label", "data-test"], Sa = ["aria-label", "onClick"], Da = ["onUpdate:modelValue", "aria-label", "data-test"], wa = { class: "ss-actions" }, Ca = ["disabled"], Ta = ["disabled"], Ia = {
  key: 2,
  class: "ss-note"
}, Ma = {
  key: 3,
  class: "ss-note danger"
}, Aa = /* @__PURE__ */ e.defineComponent({
  __name: "MinutesDraftSide",
  props: {
    detail: {}
  },
  emits: ["changed"],
  setup(l, { emit: u }) {
    const n = l, p = u, f = e.computed(() => n.detail.meeting), s = e.computed(() => !["finalized", "ended", "pending_owner", "plan_confirm", "dispatched"].includes(f.value.status)), o = e.computed(() => n.detail.my.isHost && ["pending_assign", "pending_confirm", "pending_review"].includes(f.value.status)), d = e.computed(() => n.detail.my.isHost && !s.value && n.detail.projectStatus !== "archived"), i = e.ref(!1), k = e.ref(""), h = e.ref(""), m = e.ref("");
    let c = 0;
    const g = e.reactive({ decisions: [], summary: ["", "", ""] });
    function N() {
      g.decisions = f.value.decisions.map((U) => ({ key: ++c, id: U.id, text: U.text })), g.summary = [0, 1, 2].map((U) => f.value.summaryLines[U] || ""), h.value = "", m.value = "", i.value = !0;
    }
    function a() {
      g.decisions.push({ key: ++c, text: "" });
    }
    async function I() {
      k.value = "save", h.value = "";
      try {
        await Y("meeting.minutes.save", {
          id: f.value.id,
          decisions: g.decisions.map((U) => ({ ...U.id ? { id: U.id } : {}, text: U.text })),
          summaryLines: g.summary.map((U) => U.trim()).filter(Boolean)
        }), i.value = !1, p("changed");
      } catch (U) {
        h.value = Z.errorMessage(U);
      } finally {
        k.value = "";
      }
    }
    async function P() {
      if (window.confirm(t.t("按现在的发言人和文字重新整理议题、决议和摘要？会覆盖现在的内容（包括你手改过的）。"))) {
        k.value = "ai", h.value = "", m.value = "";
        try {
          const U = await Y("meeting.minutes.reorganize", { id: f.value.id });
          m.value = U?.note || t.t("已重新整理"), p("changed");
        } catch (U) {
          h.value = Z.errorMessage(U);
        } finally {
          k.value = "";
        }
      }
    }
    return (U, M) => (e.openBlock(), e.createElementBlock("section", ka, [
      e.createElementVNode("h5", null, [
        e.createTextVNode(
          e.toDisplayString(U.$t("AI 识别的决议事项")) + " ",
          1
          /* TEXT */
        ),
        e.createElementVNode(
          "span",
          null,
          e.toDisplayString(f.value.decisions.length),
          1
          /* TEXT */
        ),
        M[2] || (M[2] = e.createElementVNode(
          "span",
          { class: "mm-grow" },
          null,
          -1
          /* CACHED */
        )),
        (o.value || d.value) && !i.value ? (e.openBlock(), e.createElementBlock(
          e.Fragment,
          { key: 0 },
          [
            e.createElementVNode("button", {
              type: "button",
              class: "ss-link",
              disabled: !!k.value,
              "data-test": "mm-minutes-edit",
              onClick: N
            }, [
              M[1] || (M[1] = e.createElementVNode(
                "i",
                { class: "ri-pencil-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(U.$t("编辑")),
                1
                /* TEXT */
              )
            ], 8, ya),
            o.value ? (e.openBlock(), e.createElementBlock("button", {
              key: 0,
              type: "button",
              class: "ss-link",
              disabled: !!k.value || !f.value.segments.length,
              "data-test": "mm-minutes-reorganize",
              onClick: P
            }, [
              e.createElementVNode(
                "i",
                {
                  class: e.normalizeClass(k.value === "ai" ? "ri-loader-4-line spin" : "ri-sparkling-line")
                },
                null,
                2
                /* CLASS */
              ),
              e.createTextVNode(
                e.toDisplayString(U.$t("AI 重新整理")),
                1
                /* TEXT */
              )
            ], 8, ga)) : e.createCommentVNode("v-if", !0)
          ],
          64
          /* STABLE_FRAGMENT */
        )) : e.createCommentVNode("v-if", !0)
      ]),
      i.value ? (e.openBlock(), e.createElementBlock("div", ha, [
        (e.openBlock(!0), e.createElementBlock(
          e.Fragment,
          null,
          e.renderList(g.decisions, (C, T) => (e.openBlock(), e.createElementBlock("div", {
            key: C.key,
            class: "mm-mde__row"
          }, [
            e.createElementVNode(
              "span",
              _a,
              e.toDisplayString(T + 1),
              1
              /* TEXT */
            ),
            e.withDirectives(e.createElementVNode("textarea", {
              "onUpdate:modelValue": (z) => C.text = z,
              rows: "2",
              "aria-label": U.$t("决议 {n}", { n: T + 1 }),
              "data-test": `mm-decision-input-${T}`
            }, null, 8, Ba), [
              [e.vModelText, C.text]
            ]),
            e.createElementVNode("button", {
              type: "button",
              class: "mm-mde__del",
              "aria-label": U.$t("删除这条决议"),
              onClick: (z) => g.decisions.splice(T, 1)
            }, [...M[3] || (M[3] = [
              e.createElementVNode(
                "i",
                { class: "ri-close-line" },
                null,
                -1
                /* CACHED */
              )
            ])], 8, Sa)
          ]))),
          128
          /* KEYED_FRAGMENT */
        )),
        e.createElementVNode("button", {
          type: "button",
          class: "ss-link",
          "data-test": "mm-decision-add",
          onClick: a
        }, [
          M[4] || (M[4] = e.createElementVNode(
            "i",
            { class: "ri-add-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            e.toDisplayString(U.$t("加一条决议")),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode(
          "h6",
          null,
          e.toDisplayString(U.$t("纪要摘要（最多 3 行）")),
          1
          /* TEXT */
        ),
        (e.openBlock(!0), e.createElementBlock(
          e.Fragment,
          null,
          e.renderList(g.summary, (C, T) => e.withDirectives((e.openBlock(), e.createElementBlock("input", {
            key: T,
            "onUpdate:modelValue": (z) => g.summary[T] = z,
            type: "text",
            maxlength: "200",
            "aria-label": U.$t("摘要第 {n} 行", { n: T + 1 }),
            "data-test": `mm-summary-input-${T}`
          }, null, 8, Da)), [
            [e.vModelText, g.summary[T]]
          ])),
          128
          /* KEYED_FRAGMENT */
        )),
        e.createElementVNode("div", wa, [
          e.createElementVNode("button", {
            type: "button",
            class: "ss-btn sm primary",
            disabled: !!k.value,
            "data-test": "mm-minutes-save",
            onClick: I
          }, [
            e.createElementVNode(
              "i",
              {
                class: e.normalizeClass(k.value === "save" ? "ri-loader-4-line spin" : "ri-check-line")
              },
              null,
              2
              /* CLASS */
            ),
            e.createTextVNode(
              e.toDisplayString(U.$t("保存")),
              1
              /* TEXT */
            )
          ], 8, Ca),
          e.createElementVNode("button", {
            type: "button",
            class: "ss-link",
            disabled: !!k.value,
            onClick: M[0] || (M[0] = (C) => i.value = !1)
          }, e.toDisplayString(U.$t("取消")), 9, Ta)
        ])
      ])) : (e.openBlock(), e.createElementBlock(
        e.Fragment,
        { key: 0 },
        [
          f.value.decisions.length ? (e.openBlock(), e.createElementBlock("ol", Na, [
            (e.openBlock(!0), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(f.value.decisions, (C, T) => (e.openBlock(), e.createElementBlock("li", {
                key: C.id
              }, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(T + 1),
                  1
                  /* TEXT */
                ),
                e.createTextVNode(
                  e.toDisplayString(C.text),
                  1
                  /* TEXT */
                )
              ]))),
              128
              /* KEYED_FRAGMENT */
            ))
          ])) : (e.openBlock(), e.createElementBlock(
            "p",
            fa,
            e.toDisplayString(s.value ? U.$t("处理完成后在这里列出会上形成的决议") : U.$t("没有识别到决议事项")),
            1
            /* TEXT */
          )),
          f.value.summaryLines.length && (!s.value || o.value) ? (e.openBlock(), e.createElementBlock(
            e.Fragment,
            { key: 2 },
            [
              e.createElementVNode(
                "h6",
                null,
                e.toDisplayString(s.value ? U.$t("纪要摘要（草稿）") : U.$t("纪要摘要")),
                1
                /* TEXT */
              ),
              e.createElementVNode("ul", Va, [
                (e.openBlock(!0), e.createElementBlock(
                  e.Fragment,
                  null,
                  e.renderList(f.value.summaryLines, (C, T) => (e.openBlock(), e.createElementBlock(
                    "li",
                    { key: T },
                    e.toDisplayString(C),
                    1
                    /* TEXT */
                  ))),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ])
            ],
            64
            /* STABLE_FRAGMENT */
          )) : e.createCommentVNode("v-if", !0),
          o.value ? (e.openBlock(), e.createElementBlock(
            "small",
            Ea,
            e.toDisplayString(U.$t("AI 初稿，定稿前请核对：决议会拆成任务，摘要会进纪要通知。发言人改过后可「AI 重新整理」。")),
            1
            /* TEXT */
          )) : s.value ? (e.openBlock(), e.createElementBlock(
            "small",
            $a,
            e.toDisplayString(U.$t("终审通过后可选择「生成任务」或「无需生成任务」")),
            1
            /* TEXT */
          )) : d.value ? (e.openBlock(), e.createElementBlock(
            "small",
            ba,
            e.toDisplayString(U.$t("纪要已定稿：发现错字可以编辑修正，已拆出的任务不跟着变。")),
            1
            /* TEXT */
          )) : e.createCommentVNode("v-if", !0)
        ],
        64
        /* STABLE_FRAGMENT */
      )),
      m.value ? (e.openBlock(), e.createElementBlock("p", Ia, [
        M[5] || (M[5] = e.createElementVNode(
          "i",
          { class: "ri-information-line" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(m.value),
          1
          /* TEXT */
        )
      ])) : e.createCommentVNode("v-if", !0),
      h.value ? (e.openBlock(), e.createElementBlock("p", Ma, [
        M[6] || (M[6] = e.createElementVNode(
          "i",
          { class: "ri-error-warning-line" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(h.value),
          1
          /* TEXT */
        )
      ])) : e.createCommentVNode("v-if", !0)
    ]));
  }
}), ja = /* @__PURE__ */ oe(Aa, [["__scopeId", "data-v-6868f958"]]), La = ["data-test"], za = ["disabled", "data-test"], Fa = {
  key: 0,
  class: "ss-note danger"
}, Pa = /* @__PURE__ */ e.defineComponent({
  __name: "SegmentSpeakerPicker",
  props: {
    detail: {},
    segmentId: {}
  },
  emits: ["done"],
  setup(l, { emit: u }) {
    const n = l, p = u, f = e.computed(() => n.detail.meeting), s = e.computed(() => f.value.segments.find((a) => a.id === n.segmentId)?.speakerLabel || ""), o = e.ref(`label:${s.value}`), d = e.ref(!1), i = e.ref(""), k = e.ref({ depts: [], people: [] }), h = e.computed(() => f.value.speakers.map((a) => ({
      value: `label:${a.label}`,
      label: a.personId ? `${xe(n.detail, a.label)}（${a.label}）` : a.label,
      sub: a.personId && n.detail.names[a.personId]?.deptName || ""
    }))), m = e.computed(() => f.value.speakers.map((a) => a.personId).filter(Boolean)), c = e.computed({
      get: () => o.value.startsWith("person:") ? o.value.slice(7) : o.value,
      set: (a) => {
        o.value = a ? a.startsWith("label:") ? a : `person:${a}` : "";
      }
    }), g = e.computed(() => o.value && o.value !== `label:${s.value}`);
    async function N() {
      if (!g.value || d.value) return;
      const [a, I] = [o.value.slice(0, o.value.indexOf(":")), o.value.slice(o.value.indexOf(":") + 1)];
      d.value = !0, i.value = "";
      try {
        await Y("meeting.segment.speaker", { id: f.value.id, segmentId: n.segmentId, ...a === "label" ? { label: I } : { personId: I } }), p("done", !0);
      } catch (P) {
        i.value = Z.errorMessage(P);
      } finally {
        d.value = !1;
      }
    }
    return e.onMounted(async () => {
      try {
        k.value = await De();
      } catch (a) {
        i.value = Z.errorMessage(a);
      }
    }), (a, I) => (e.openBlock(), e.createElementBlock("div", {
      class: "mm-ssp",
      "data-test": `mm-seg-speaker-${l.segmentId}`
    }, [
      e.createVNode(Oe, {
        modelValue: c.value,
        "onUpdate:modelValue": I[0] || (I[0] = (P) => c.value = P),
        class: "mm-ssp__select",
        people: k.value,
        extras: h.value,
        "extras-label": a.$t("本场发言人"),
        exclude: m.value,
        "aria-label": a.$t("这段的发言人"),
        "data-test": `mm-seg-speaker-pick-${l.segmentId}`
      }, null, 8, ["modelValue", "people", "extras", "extras-label", "exclude", "aria-label", "data-test"]),
      e.createElementVNode("button", {
        type: "button",
        class: "ss-btn sm primary",
        disabled: d.value || !g.value,
        "data-test": `mm-seg-speaker-save-${l.segmentId}`,
        onClick: N
      }, [
        e.createElementVNode(
          "i",
          {
            class: e.normalizeClass(d.value ? "ri-loader-4-line spin" : "ri-check-line")
          },
          null,
          2
          /* CLASS */
        ),
        e.createTextVNode(
          e.toDisplayString(a.$t("改给这个人")),
          1
          /* TEXT */
        )
      ], 8, za),
      e.createElementVNode(
        "button",
        {
          type: "button",
          class: "ss-link",
          onClick: I[1] || (I[1] = (P) => p("done", !1))
        },
        e.toDisplayString(a.$t("取消")),
        1
        /* TEXT */
      ),
      i.value ? (e.openBlock(), e.createElementBlock("p", Fa, [
        I[2] || (I[2] = e.createElementVNode(
          "i",
          { class: "ri-error-warning-line" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(i.value),
          1
          /* TEXT */
        )
      ])) : e.createCommentVNode("v-if", !0)
    ], 8, La));
  }
}), ht = /* @__PURE__ */ oe(Pa, [["__scopeId", "data-v-da87433b"]]), Ua = {
  class: "mm-min",
  "data-test": "mm-minutes"
}, Oa = { class: "mm-min__bar" }, Ra = {
  class: "mm-seg-switch",
  role: "tablist"
}, qa = ["aria-selected"], Ka = ["aria-selected"], Ha = { class: "ss-muted" }, Wa = {
  key: 0,
  class: "mm-min__empty"
}, Ga = ["data-test"], Ya = ["aria-expanded", "onClick"], Ja = {
  key: 0,
  class: "mm-topic__body"
}, Qa = { class: "mm-seg__body" }, Za = { class: "mm-seg__who" }, Xa = { class: "mm-seg__name" }, xa = ["title", "data-test", "onClick"], es = { key: 1 }, ts = {
  key: 2,
  class: "mm-mini brand"
}, ls = ["title"], ns = ["title"], os = ["data-test"], as = { class: "ss-actions" }, ss = ["disabled", "data-test", "onClick"], rs = {
  key: 2,
  class: "mm-seg__text"
}, is = {
  key: 3,
  class: "mm-seg__return"
}, cs = ["placeholder", "data-test"], ds = ["disabled", "data-test", "onClick"], ms = {
  key: 0,
  class: "mm-seg__ops"
}, us = ["data-test", "onClick"], ps = ["data-test", "onClick"], vs = ["data-test", "onClick"], ks = { class: "mm-timeline" }, ys = { class: "mm-seg__body" }, gs = { class: "mm-seg__who" }, fs = { class: "mm-seg__name" }, Ns = ["title", "data-test", "onClick"], Vs = { key: 1 }, Es = {
  key: 2,
  class: "mm-mini brand"
}, $s = ["title"], bs = ["title"], hs = { class: "ss-actions" }, _s = ["disabled", "onClick"], Bs = {
  key: 2,
  class: "mm-seg__text"
}, Ss = {
  key: 3,
  class: "mm-seg__return"
}, Ds = ["placeholder"], ws = ["disabled", "onClick"], Cs = {
  key: 0,
  class: "mm-seg__ops"
}, Ts = ["data-test", "onClick"], Is = ["onClick"], Ms = ["onClick"], As = {
  key: 3,
  class: "ss-note danger"
}, js = /* @__PURE__ */ e.defineComponent({
  __name: "MinutesPanel",
  props: {
    detail: {},
    anchor: {},
    anchorSeq: {}
  },
  emits: ["changed"],
  setup(l, { emit: u }) {
    const n = l, p = u, f = e.ref("topic"), s = e.ref(/* @__PURE__ */ new Set()), o = e.ref(""), d = e.ref(""), i = e.ref(""), k = e.ref(""), h = e.ref(""), m = e.ref(!1), c = e.ref(""), g = e.computed(() => n.detail.meeting), N = e.computed(() => ne.value?.me?.person?.id), a = e.computed(() => new Map(g.value.segments.map((F) => [F.id, F]))), I = e.computed(() => yl(n.detail)), P = e.computed(() => [...g.value.segments].sort((F, w) => F.start - w.start)), U = e.computed(() => g.value.confirmations.find((F) => F.personId === N.value)), M = e.computed(() => g.value.status === "pending_review" && n.detail.my.isHost), C = e.computed(() => n.detail.my.isHost && ["pending_assign", "pending_confirm", "pending_review"].includes(g.value.status)), T = ["finalized", "ended", "pending_owner", "plan_confirm", "dispatched"], z = e.computed(() => T.includes(g.value.status)), R = e.computed(() => z.value && n.detail.my.isHost && n.detail.projectStatus !== "archived"), _ = e.computed(() => g.value.files.some((F) => F.kind === "audio" || F.kind === "video")), E = e.computed(() => {
      const F = (g.value.topics || []).length, w = F ? t.t("AI 整理 · {n} 个议题", { n: F }) : t.t("AI 整理");
      return M.value ? `${w} · ${t.t("悬停段落可修改、退回或改发言人")}` : g.value.status === "pending_confirm" && n.detail.my.isHost ? `${w} · ${t.t("悬停段落可补全文字或改发言人")}` : g.value.status === "pending_confirm" && U.value ? `${w} · ${t.t("悬停本人发言可补全或修改")}` : C.value ? `${w} · ${t.t("发言人认错了：悬停段落可改发言人")}` : R.value ? `${w} · ${t.t("纪要已定稿；发现错字可悬停段落修改")}` : z.value ? `${w} · ${t.t("纪要已定稿")}` : w;
    });
    function v(F) {
      return a.value.get(F)?.speakerLabel || "";
    }
    function S(F) {
      return xe(n.detail, v(F));
    }
    function j(F) {
      return kl(n.detail, v(F), N.value);
    }
    function J(F) {
      return M.value || R.value ? !0 : g.value.status !== "pending_confirm" || n.detail.projectStatus === "archived" ? !1 : n.detail.my.isHost || j(F);
    }
    function y(F) {
      if (!M.value) return !1;
      const w = Le(g.value, v(F));
      return !!w && g.value.confirmations.some((L) => L.personId === w);
    }
    function V(F) {
      return {
        class: ["mm-seg", { own: j(F), hoverable: J(F) || y(F) || C.value, hl: n.anchor === F, editing: o.value === F || i.value === F || h.value === F }],
        "data-seg": F,
        "data-test": `mm-seg-${F}`
      };
    }
    function r(F) {
      return s.value.has(F);
    }
    function W(F) {
      const w = new Set(s.value);
      w.has(F) ? w.delete(F) : w.add(F), s.value = w;
    }
    e.watch(() => I.value.map((F) => F.id).join("|"), () => {
      const F = I.value[0]?.id, w = new Set([...s.value].filter((L) => I.value.some((x) => x.id === L)));
      !w.size && F && w.add(F), s.value = w;
    }, { immediate: !0 }), e.watch(() => [n.anchor, n.anchorSeq], async () => {
      const F = n.anchor;
      if (!F || !a.value.has(F)) return;
      const w = I.value.find((Q) => Q.segmentIds.includes(F));
      w && !s.value.has(w.id) && (s.value = /* @__PURE__ */ new Set([...s.value, w.id])), await e.nextTick();
      const L = typeof CSS < "u" && typeof CSS.escape == "function" ? CSS.escape(F) : F.replace(/["\\]/g, "\\$&");
      document.querySelector(`[data-seg="${L}"]`)?.scrollIntoView?.({ block: "center", behavior: "smooth" });
    }, { immediate: !0 });
    const X = e.ref(""), ae = e.ref(""), q = /* @__PURE__ */ new Map();
    let H = null;
    function ee(F) {
      return ae.value === F ? "ri-loader-4-line spin" : X.value === F ? "ri-pause-fill" : "ri-play-fill";
    }
    async function le(F) {
      if (X.value === F && H) {
        H.pause(), X.value = "";
        return;
      }
      H?.pause(), X.value = "", ae.value = F, c.value = "";
      try {
        let w = q.get(F);
        if (!w) {
          if (w = (await Y("meeting.segment.audio", { id: g.value.id, segmentId: F }))?.dataUrl || "", !w) throw new Error(t.t("这段没有可播放的原声"));
          q.size >= 30 && q.delete(q.keys().next().value), q.set(F, w);
        }
        H || (H = new Audio(), H.onended = () => {
          X.value = "";
        }), H.src = w, await H.play(), X.value = F;
      } catch (w) {
        c.value = Z.errorMessage(w);
      } finally {
        ae.value = "";
      }
    }
    e.onBeforeUnmount(() => {
      H?.pause(), H = null;
    });
    function $(F) {
      o.value = "", i.value = "", h.value = F;
    }
    function b(F) {
      h.value = "", F && p("changed");
    }
    function B(F) {
      h.value = "", i.value = "", o.value = F, d.value = a.value.get(F)?.text || "";
    }
    function D(F) {
      o.value = "", h.value = "", i.value = F, k.value = "";
    }
    async function O(F) {
      const w = d.value.trim();
      if (!(!w || m.value)) {
        m.value = !0, c.value = "";
        try {
          await Y("meeting.segment.edit", { id: g.value.id, segmentId: F, text: w }), o.value = "", p("changed");
        } catch (L) {
          c.value = Z.errorMessage(L);
        } finally {
          m.value = !1;
        }
      }
    }
    async function G(F) {
      const w = Le(g.value, v(F));
      if (!w || m.value) return;
      const L = n.detail.names[w]?.name || "";
      if (window.confirm(t.t("把这段退回给 {name} 重新确认？只有 {name} 需要重新确认。", { name: L }))) {
        m.value = !0, c.value = "";
        try {
          await Y("meeting.review.return", { id: g.value.id, personId: w, note: k.value.trim() }), i.value = "", p("changed");
        } catch (x) {
          c.value = Z.errorMessage(x);
        } finally {
          m.value = !1;
        }
      }
    }
    return (F, w) => (e.openBlock(), e.createElementBlock("section", Ua, [
      e.createElementVNode("div", Oa, [
        e.createElementVNode("div", Ra, [
          e.createElementVNode("button", {
            type: "button",
            role: "tab",
            class: e.normalizeClass({ on: f.value === "topic" }),
            "aria-selected": f.value === "topic",
            "data-test": "mm-minutes-topic",
            onClick: w[0] || (w[0] = (L) => f.value = "topic")
          }, e.toDisplayString(F.$t("按议题")), 11, qa),
          e.createElementVNode("button", {
            type: "button",
            role: "tab",
            class: e.normalizeClass({ on: f.value === "timeline" }),
            "aria-selected": f.value === "timeline",
            "data-test": "mm-minutes-timeline",
            onClick: w[1] || (w[1] = (L) => f.value = "timeline")
          }, e.toDisplayString(F.$t("按时间线")), 11, Ka)
        ]),
        e.createElementVNode(
          "span",
          Ha,
          e.toDisplayString(E.value),
          1
          /* TEXT */
        )
      ]),
      g.value.segments.length ? f.value === "topic" ? (e.openBlock(), e.createElementBlock(
        e.Fragment,
        { key: 1 },
        [
          e.createCommentVNode(" 按议题 "),
          (e.openBlock(!0), e.createElementBlock(
            e.Fragment,
            null,
            e.renderList(I.value, (L, x) => (e.openBlock(), e.createElementBlock("div", {
              key: L.id,
              class: e.normalizeClass(["mm-topic", { open: r(L.id) }]),
              "data-test": `mm-topic-${L.id}`
            }, [
              e.createElementVNode("button", {
                type: "button",
                class: "mm-topic__head",
                "aria-expanded": r(L.id),
                onClick: (Q) => W(L.id)
              }, [
                e.createElementVNode(
                  "i",
                  {
                    class: e.normalizeClass(r(L.id) ? "ri-arrow-down-s-line" : "ri-arrow-right-s-line")
                  },
                  null,
                  2
                  /* CLASS */
                ),
                e.createElementVNode(
                  "strong",
                  null,
                  e.toDisplayString(L.id === "__rest" ? L.title : F.$t("议题{n} · {title}", { n: e.unref(ul)(x), title: L.title })),
                  1
                  /* TEXT */
                ),
                e.createElementVNode("small", null, [
                  e.createTextVNode(
                    e.toDisplayString(F.$t("{n} 段", { n: L.segmentIds.length })),
                    1
                    /* TEXT */
                  ),
                  !r(L.id) && L.speakers.length ? (e.openBlock(), e.createElementBlock(
                    e.Fragment,
                    { key: 0 },
                    [
                      e.createTextVNode(
                        " · " + e.toDisplayString(L.speakers.join(e.unref(t.listSeparator)())),
                        1
                        /* TEXT */
                      )
                    ],
                    64
                    /* STABLE_FRAGMENT */
                  )) : e.createCommentVNode("v-if", !0)
                ])
              ], 8, Ya),
              r(L.id) ? (e.openBlock(), e.createElementBlock("div", Ja, [
                (e.openBlock(!0), e.createElementBlock(
                  e.Fragment,
                  null,
                  e.renderList(L.segmentIds, (Q) => (e.openBlock(), e.createElementBlock(
                    e.Fragment,
                    { key: Q },
                    [
                      a.value.get(Q) ? (e.openBlock(), e.createElementBlock(
                        "div",
                        e.mergeProps({
                          key: 0,
                          ref_for: !0
                        }, V(Q)),
                        [
                          e.createElementVNode(
                            "span",
                            {
                              class: "mm-av",
                              style: e.normalizeStyle({ background: e.unref(re)(S(Q)).color })
                            },
                            e.toDisplayString(e.unref(re)(S(Q)).text),
                            5
                            /* TEXT, STYLE */
                          ),
                          e.createElementVNode("div", Qa, [
                            e.createElementVNode("div", Za, [
                              e.createElementVNode(
                                "span",
                                Xa,
                                e.toDisplayString(S(Q)),
                                1
                                /* TEXT */
                              ),
                              _.value ? (e.openBlock(), e.createElementBlock("button", {
                                key: 0,
                                type: "button",
                                class: e.normalizeClass(["mm-play", { on: X.value === Q }]),
                                title: X.value === Q ? F.$t("暂停") : F.$t("播放这段原声"),
                                "data-test": `mm-seg-play-${Q}`,
                                onClick: (se) => le(Q)
                              }, [
                                e.createElementVNode(
                                  "i",
                                  {
                                    class: e.normalizeClass(ee(Q))
                                  },
                                  null,
                                  2
                                  /* CLASS */
                                ),
                                e.createElementVNode(
                                  "time",
                                  null,
                                  e.toDisplayString(e.unref(Ae)(a.value.get(Q).start)),
                                  1
                                  /* TEXT */
                                )
                              ], 10, xa)) : (e.openBlock(), e.createElementBlock(
                                "time",
                                es,
                                e.toDisplayString(e.unref(Ae)(a.value.get(Q).start)),
                                1
                                /* TEXT */
                              )),
                              j(Q) ? (e.openBlock(), e.createElementBlock(
                                "span",
                                ts,
                                e.toDisplayString(F.$t("本人")),
                                1
                                /* TEXT */
                              )) : e.createCommentVNode("v-if", !0),
                              a.value.get(Q).originalText !== void 0 ? (e.openBlock(), e.createElementBlock("span", {
                                key: 3,
                                class: "mm-mini",
                                title: F.$t("原文：{t}", { t: a.value.get(Q).originalText || "" })
                              }, e.toDisplayString(F.$t("已修改")), 9, ls)) : e.createCommentVNode("v-if", !0),
                              a.value.get(Q).originalSpeakerLabel !== void 0 ? (e.openBlock(), e.createElementBlock("span", {
                                key: 4,
                                class: "mm-mini",
                                title: F.$t("识别时是 {l}", { l: a.value.get(Q).originalSpeakerLabel })
                              }, e.toDisplayString(F.$t("已改发言人")), 9, ns)) : e.createCommentVNode("v-if", !0)
                            ]),
                            h.value === Q ? (e.openBlock(), e.createBlock(ht, {
                              key: 0,
                              detail: l.detail,
                              "segment-id": Q,
                              onDone: b
                            }, null, 8, ["detail", "segment-id"])) : e.createCommentVNode("v-if", !0),
                            o.value === Q ? (e.openBlock(), e.createElementBlock(
                              e.Fragment,
                              { key: 1 },
                              [
                                e.withDirectives(e.createElementVNode("textarea", {
                                  "onUpdate:modelValue": w[2] || (w[2] = (se) => d.value = se),
                                  class: "mm-seg__edit",
                                  rows: "3",
                                  "data-test": `mm-seg-edit-${Q}`
                                }, null, 8, os), [
                                  [e.vModelText, d.value]
                                ]),
                                e.createElementVNode("div", as, [
                                  e.createElementVNode("button", {
                                    type: "button",
                                    class: "ss-btn sm primary",
                                    disabled: m.value || !d.value.trim(),
                                    "data-test": `mm-seg-save-${Q}`,
                                    onClick: (se) => O(Q)
                                  }, [
                                    e.createElementVNode(
                                      "i",
                                      {
                                        class: e.normalizeClass(m.value ? "ri-loader-4-line spin" : "ri-check-line")
                                      },
                                      null,
                                      2
                                      /* CLASS */
                                    ),
                                    e.createTextVNode(
                                      e.toDisplayString(F.$t("保存")),
                                      1
                                      /* TEXT */
                                    )
                                  ], 8, ss),
                                  e.createElementVNode(
                                    "button",
                                    {
                                      type: "button",
                                      class: "ss-link",
                                      onClick: w[3] || (w[3] = (se) => o.value = "")
                                    },
                                    e.toDisplayString(F.$t("取消")),
                                    1
                                    /* TEXT */
                                  )
                                ])
                              ],
                              64
                              /* STABLE_FRAGMENT */
                            )) : (e.openBlock(), e.createElementBlock(
                              "p",
                              rs,
                              e.toDisplayString(a.value.get(Q).text),
                              1
                              /* TEXT */
                            )),
                            i.value === Q ? (e.openBlock(), e.createElementBlock("div", is, [
                              e.withDirectives(e.createElementVNode("input", {
                                "onUpdate:modelValue": w[4] || (w[4] = (se) => k.value = se),
                                type: "text",
                                placeholder: F.$t("退回原因（发言人会看到），例如：这段数字需要核实"),
                                "data-test": `mm-seg-return-note-${Q}`
                              }, null, 8, cs), [
                                [e.vModelText, k.value]
                              ]),
                              e.createElementVNode("button", {
                                type: "button",
                                class: "ss-btn sm danger",
                                disabled: m.value,
                                "data-test": `mm-seg-return-ok-${Q}`,
                                onClick: (se) => G(Q)
                              }, e.toDisplayString(F.$t("确认退回")), 9, ds),
                              e.createElementVNode(
                                "button",
                                {
                                  type: "button",
                                  class: "ss-link",
                                  onClick: w[5] || (w[5] = (se) => i.value = "")
                                },
                                e.toDisplayString(F.$t("取消")),
                                1
                                /* TEXT */
                              )
                            ])) : e.createCommentVNode("v-if", !0)
                          ]),
                          o.value !== Q && i.value !== Q && h.value !== Q && (J(Q) || y(Q) || C.value) ? (e.openBlock(), e.createElementBlock("div", ms, [
                            C.value ? (e.openBlock(), e.createElementBlock("button", {
                              key: 0,
                              type: "button",
                              class: "mm-op",
                              "data-test": `mm-seg-move-${Q}`,
                              onClick: (se) => $(Q)
                            }, [
                              w[10] || (w[10] = e.createElementVNode(
                                "i",
                                { class: "ri-user-shared-line" },
                                null,
                                -1
                                /* CACHED */
                              )),
                              e.createTextVNode(
                                e.toDisplayString(F.$t("改发言人")),
                                1
                                /* TEXT */
                              )
                            ], 8, us)) : e.createCommentVNode("v-if", !0),
                            J(Q) ? (e.openBlock(), e.createElementBlock("button", {
                              key: 1,
                              type: "button",
                              class: "mm-op",
                              "data-test": `mm-seg-modify-${Q}`,
                              onClick: (se) => B(Q)
                            }, [
                              w[11] || (w[11] = e.createElementVNode(
                                "i",
                                { class: "ri-pencil-line" },
                                null,
                                -1
                                /* CACHED */
                              )),
                              e.createTextVNode(
                                e.toDisplayString(F.$t("修改")),
                                1
                                /* TEXT */
                              )
                            ], 8, ps)) : e.createCommentVNode("v-if", !0),
                            y(Q) ? (e.openBlock(), e.createElementBlock("button", {
                              key: 2,
                              type: "button",
                              class: "mm-op danger",
                              "data-test": `mm-seg-return-${Q}`,
                              onClick: (se) => D(Q)
                            }, e.toDisplayString(F.$t("退回给发言人")), 9, vs)) : e.createCommentVNode("v-if", !0)
                          ])) : e.createCommentVNode("v-if", !0)
                        ],
                        16
                        /* FULL_PROPS */
                      )) : e.createCommentVNode("v-if", !0)
                    ],
                    64
                    /* STABLE_FRAGMENT */
                  ))),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ])) : e.createCommentVNode("v-if", !0)
            ], 10, Ga))),
            128
            /* KEYED_FRAGMENT */
          ))
        ],
        64
        /* STABLE_FRAGMENT */
      )) : (e.openBlock(), e.createElementBlock(
        e.Fragment,
        { key: 2 },
        [
          e.createCommentVNode(" 按时间线 "),
          e.createElementVNode("div", ks, [
            (e.openBlock(!0), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(P.value, (L) => (e.openBlock(), e.createElementBlock(
                "div",
                e.mergeProps({
                  key: L.id
                }, { ref_for: !0 }, V(L.id)),
                [
                  e.createElementVNode(
                    "span",
                    {
                      class: "mm-av",
                      style: e.normalizeStyle({ background: e.unref(re)(S(L.id)).color })
                    },
                    e.toDisplayString(e.unref(re)(S(L.id)).text),
                    5
                    /* TEXT, STYLE */
                  ),
                  e.createElementVNode("div", ys, [
                    e.createElementVNode("div", gs, [
                      e.createElementVNode(
                        "span",
                        fs,
                        e.toDisplayString(S(L.id)),
                        1
                        /* TEXT */
                      ),
                      _.value ? (e.openBlock(), e.createElementBlock("button", {
                        key: 0,
                        type: "button",
                        class: e.normalizeClass(["mm-play", { on: X.value === L.id }]),
                        title: X.value === L.id ? F.$t("暂停") : F.$t("播放这段原声"),
                        "data-test": `mm-seg-play-${L.id}`,
                        onClick: (x) => le(L.id)
                      }, [
                        e.createElementVNode(
                          "i",
                          {
                            class: e.normalizeClass(ee(L.id))
                          },
                          null,
                          2
                          /* CLASS */
                        ),
                        e.createElementVNode(
                          "time",
                          null,
                          e.toDisplayString(e.unref(Ae)(L.start)),
                          1
                          /* TEXT */
                        )
                      ], 10, Ns)) : (e.openBlock(), e.createElementBlock(
                        "time",
                        Vs,
                        e.toDisplayString(e.unref(Ae)(L.start)),
                        1
                        /* TEXT */
                      )),
                      j(L.id) ? (e.openBlock(), e.createElementBlock(
                        "span",
                        Es,
                        e.toDisplayString(F.$t("本人")),
                        1
                        /* TEXT */
                      )) : e.createCommentVNode("v-if", !0),
                      L.originalText !== void 0 ? (e.openBlock(), e.createElementBlock("span", {
                        key: 3,
                        class: "mm-mini",
                        title: F.$t("原文：{t}", { t: L.originalText || "" })
                      }, e.toDisplayString(F.$t("已修改")), 9, $s)) : e.createCommentVNode("v-if", !0),
                      L.originalSpeakerLabel !== void 0 ? (e.openBlock(), e.createElementBlock("span", {
                        key: 4,
                        class: "mm-mini",
                        title: F.$t("识别时是 {l}", { l: L.originalSpeakerLabel })
                      }, e.toDisplayString(F.$t("已改发言人")), 9, bs)) : e.createCommentVNode("v-if", !0)
                    ]),
                    h.value === L.id ? (e.openBlock(), e.createBlock(ht, {
                      key: 0,
                      detail: l.detail,
                      "segment-id": L.id,
                      onDone: b
                    }, null, 8, ["detail", "segment-id"])) : e.createCommentVNode("v-if", !0),
                    o.value === L.id ? (e.openBlock(), e.createElementBlock(
                      e.Fragment,
                      { key: 1 },
                      [
                        e.withDirectives(e.createElementVNode(
                          "textarea",
                          {
                            "onUpdate:modelValue": w[6] || (w[6] = (x) => d.value = x),
                            class: "mm-seg__edit",
                            rows: "3"
                          },
                          null,
                          512
                          /* NEED_PATCH */
                        ), [
                          [e.vModelText, d.value]
                        ]),
                        e.createElementVNode("div", hs, [
                          e.createElementVNode("button", {
                            type: "button",
                            class: "ss-btn sm primary",
                            disabled: m.value || !d.value.trim(),
                            onClick: (x) => O(L.id)
                          }, [
                            e.createElementVNode(
                              "i",
                              {
                                class: e.normalizeClass(m.value ? "ri-loader-4-line spin" : "ri-check-line")
                              },
                              null,
                              2
                              /* CLASS */
                            ),
                            e.createTextVNode(
                              e.toDisplayString(F.$t("保存")),
                              1
                              /* TEXT */
                            )
                          ], 8, _s),
                          e.createElementVNode(
                            "button",
                            {
                              type: "button",
                              class: "ss-link",
                              onClick: w[7] || (w[7] = (x) => o.value = "")
                            },
                            e.toDisplayString(F.$t("取消")),
                            1
                            /* TEXT */
                          )
                        ])
                      ],
                      64
                      /* STABLE_FRAGMENT */
                    )) : (e.openBlock(), e.createElementBlock(
                      "p",
                      Bs,
                      e.toDisplayString(L.text),
                      1
                      /* TEXT */
                    )),
                    i.value === L.id ? (e.openBlock(), e.createElementBlock("div", Ss, [
                      e.withDirectives(e.createElementVNode("input", {
                        "onUpdate:modelValue": w[8] || (w[8] = (x) => k.value = x),
                        type: "text",
                        placeholder: F.$t("退回原因（发言人会看到），例如：这段数字需要核实")
                      }, null, 8, Ds), [
                        [e.vModelText, k.value]
                      ]),
                      e.createElementVNode("button", {
                        type: "button",
                        class: "ss-btn sm danger",
                        disabled: m.value,
                        onClick: (x) => G(L.id)
                      }, e.toDisplayString(F.$t("确认退回")), 9, ws),
                      e.createElementVNode(
                        "button",
                        {
                          type: "button",
                          class: "ss-link",
                          onClick: w[9] || (w[9] = (x) => i.value = "")
                        },
                        e.toDisplayString(F.$t("取消")),
                        1
                        /* TEXT */
                      )
                    ])) : e.createCommentVNode("v-if", !0)
                  ]),
                  o.value !== L.id && i.value !== L.id && h.value !== L.id && (J(L.id) || y(L.id) || C.value) ? (e.openBlock(), e.createElementBlock("div", Cs, [
                    C.value ? (e.openBlock(), e.createElementBlock("button", {
                      key: 0,
                      type: "button",
                      class: "mm-op",
                      "data-test": `mm-seg-move-${L.id}`,
                      onClick: (x) => $(L.id)
                    }, [
                      w[12] || (w[12] = e.createElementVNode(
                        "i",
                        { class: "ri-user-shared-line" },
                        null,
                        -1
                        /* CACHED */
                      )),
                      e.createTextVNode(
                        e.toDisplayString(F.$t("改发言人")),
                        1
                        /* TEXT */
                      )
                    ], 8, Ts)) : e.createCommentVNode("v-if", !0),
                    J(L.id) ? (e.openBlock(), e.createElementBlock("button", {
                      key: 1,
                      type: "button",
                      class: "mm-op",
                      onClick: (x) => B(L.id)
                    }, [
                      w[13] || (w[13] = e.createElementVNode(
                        "i",
                        { class: "ri-pencil-line" },
                        null,
                        -1
                        /* CACHED */
                      )),
                      e.createTextVNode(
                        e.toDisplayString(F.$t("修改")),
                        1
                        /* TEXT */
                      )
                    ], 8, Is)) : e.createCommentVNode("v-if", !0),
                    y(L.id) ? (e.openBlock(), e.createElementBlock("button", {
                      key: 2,
                      type: "button",
                      class: "mm-op danger",
                      onClick: (x) => D(L.id)
                    }, e.toDisplayString(F.$t("退回给发言人")), 9, Ms)) : e.createCommentVNode("v-if", !0)
                  ])) : e.createCommentVNode("v-if", !0)
                ],
                16
                /* FULL_PROPS */
              ))),
              128
              /* KEYED_FRAGMENT */
            ))
          ])
        ],
        2112
        /* STABLE_FRAGMENT, DEV_ROOT_FRAGMENT */
      )) : (e.openBlock(), e.createElementBlock(
        "p",
        Wa,
        e.toDisplayString(F.$t("还没有纪要内容：上传会议文件、处理完成后在这里按议题整理")),
        1
        /* TEXT */
      )),
      c.value ? (e.openBlock(), e.createElementBlock("p", As, [
        w[14] || (w[14] = e.createElementVNode(
          "i",
          { class: "ri-error-warning-line" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(c.value),
          1
          /* TEXT */
        )
      ])) : e.createCommentVNode("v-if", !0)
    ]));
  }
}), Ls = /* @__PURE__ */ oe(js, [["__scopeId", "data-v-259b6ff6"]]), et = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/utils/markdown.ts"];
if (!et) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/utils/markdown.ts");
et.default;
const zs = {
  class: "mm-plan",
  "data-test": "mm-plan"
}, Fs = {
  key: 0,
  class: "mm-plan__empty"
}, Ps = { class: "mm-plan__head" }, Us = { class: "ss-muted" }, Os = {
  key: 0,
  class: "ss-chip ok"
}, Rs = {
  key: 0,
  class: "mm-plan__owner",
  "data-test": "mm-plan-owner"
}, qs = ["disabled"], Ks = {
  key: 1,
  class: "ss-note"
}, Hs = {
  key: 2,
  class: "ss-note"
}, Ws = { class: "mm-plan__summary" }, Gs = { class: "mm-plan__sumhead" }, Ys = ["innerHTML"], Js = {
  key: 2,
  class: "ss-muted"
}, Qs = { class: "mm-plan__sumhead" }, Zs = { class: "ss-muted" }, Xs = { class: "ss-table-wrap" }, xs = {
  key: 0,
  class: "c-del"
}, er = { key: 0 }, tr = ["data-test"], lr = { class: "num" }, nr = ["onUpdate:modelValue"], or = { value: "" }, ar = ["value"], sr = { key: 1 }, rr = { class: "wrap" }, ir = ["onUpdate:modelValue", "placeholder"], cr = { key: 1 }, dr = {
  key: 2,
  class: "mm-plan__from"
}, mr = { class: "wrap" }, ur = ["onUpdate:modelValue", "placeholder"], pr = { key: 1 }, vr = ["onUpdate:modelValue", "data-test"], kr = { key: 1 }, yr = {
  key: 2,
  class: "mm-plan__warn"
}, gr = { class: "mm-plan__to" }, fr = {
  key: 0,
  class: "mm-plan__warn"
}, Nr = { key: 0 }, Vr = ["title"], Er = { key: 2 }, $r = { key: 0 }, br = ["title", "onClick"], hr = { key: 0 }, _r = ["colspan"], Br = {
  key: 3,
  class: "mm-plan__problems"
}, Sr = {
  key: 4,
  class: "ss-actions"
}, Dr = ["disabled"], wr = ["disabled"], Cr = ["disabled"], Tr = {
  key: 2,
  class: "ss-note danger"
}, Ir = /* @__PURE__ */ e.defineComponent({
  __name: "PlanPanel",
  props: {
    detail: {}
  },
  emits: ["changed"],
  setup(l, { emit: u }) {
    const n = l, p = u, f = ie.useNotificationStore(), s = e.ref({ depts: [], people: [] }), o = e.ref([]), d = e.ref(""), i = e.ref(!1), k = e.ref(!1), h = e.ref(!1), m = e.ref([]), c = e.ref(""), g = e.ref(""), N = Ye(Date.now()), a = e.computed(() => n.detail.meeting), I = e.computed(() => a.value.plan), P = e.computed(() => a.value.status === "plan_confirm" && n.detail.my.isPlanOwner), U = e.computed(() => n.detail.my.isHost && (a.value.status === "pending_owner" || a.value.status === "plan_confirm"));
    function M(q) {
      return n.detail.names[q]?.name || s.value.people.find((H) => H.id === q)?.name || q;
    }
    function C(q) {
      return s.value.depts.find((H) => H.id === q)?.name || q || "-";
    }
    function T(q) {
      const H = s.value.depts.find((le) => le.id === q)?.leaderIds?.[0], ee = H ? s.value.people.find((le) => le.id === H) : void 0;
      return ee && !ee.left ? ee.name : "";
    }
    function z(q) {
      return q ? s.value.people.filter((H) => H.deptId === q && !H.left).map((H) => H.id) : [];
    }
    function R(q) {
      return q.assigneeId ? M(q.assigneeId) : T(q.deptId);
    }
    function _(q, H) {
      H ? q.assigneeId = H : delete q.assigneeId, i.value = !0;
    }
    function E(q) {
      return q ? a.value.decisions.findIndex((H) => H.id === q) + 1 : 0;
    }
    function v() {
      o.value = (I.value?.items || []).map((q) => ({ ...q })), d.value = I.value?.summary || "", i.value = !1, k.value = !1, h.value = !1;
    }
    e.watch(I, () => {
      i.value || v();
    }, { immediate: !0, deep: !0 });
    const S = e.computed(() => {
      const q = I.value;
      return q ? q.ownerIds?.length ? q.ownerIds : q.ownerId ? [q.ownerId] : [] : [];
    }), j = e.computed(() => S.value.map((q) => M(q)).filter(Boolean).join(t.t("、"))), J = e.computed(() => m.value.length === S.value.length && m.value.every((q) => S.value.includes(q)));
    e.watch(S, (q) => {
      m.value = [...q];
    }, { immediate: !0 });
    const y = e.computed(() => {
      const q = [];
      return o.value.length || q.push(t.t("至少保留一项任务")), o.value.forEach((H, ee) => {
        const le = ee + 1;
        H.deptId || q.push(t.t("第 {n} 项没有选责任部门", { n: le })), H.title.trim() || q.push(t.t("第 {n} 项没有填执行事项", { n: le })), /^\d{4}-\d{2}-\d{2}$/.test(H.due || "") || q.push(t.t("第 {n} 项没有设完成时间", { n: le })), H.deptId && !H.assigneeId && s.value.depts.length && !T(H.deptId) && q.push(t.t("第 {n} 项的部门没有负责人，请在「下发给」里选人", { n: le }));
      }), q;
    });
    function V() {
      o.value.push({ id: `new-${Date.now().toString(36)}-${o.value.length}`, deptId: "", title: "", standard: "", due: "" }), i.value = !0;
    }
    function r(q) {
      o.value.splice(q, 1), i.value = !0;
    }
    async function W() {
      if (!(!m.value.length || c.value)) {
        c.value = "owner", g.value = "";
        try {
          const q = [...m.value];
          await Y("meeting.plan.owner", { id: a.value.id, ownerIds: q }), f.success(t.t("已指定 {name} 为任务负责人，已通知确认方案", { name: q.map((H) => M(H)).join(t.t("、")) })), p("changed");
        } catch (q) {
          g.value = Z.errorMessage(q);
        } finally {
          c.value = "";
        }
      }
    }
    async function X(q = !1) {
      if (h.value = !0, y.value.length)
        return g.value = t.t("还有没填完的任务，先补齐再保存"), !1;
      c.value = "save", g.value = "";
      try {
        return await Y("meeting.plan.save", { id: a.value.id, items: o.value.map((H) => ({ ...H, title: H.title.trim(), standard: H.standard.trim() })), summary: d.value }), i.value = !1, k.value = !1, q || f.success(t.t("方案已保存")), p("changed"), !0;
      } catch (H) {
        return g.value = Z.errorMessage(H), !1;
      } finally {
        c.value = "";
      }
    }
    async function ae() {
      if (h.value = !0, y.value.length) {
        g.value = t.t("还有没填完的任务，先补齐再确认");
        return;
      }
      if (window.confirm(t.t("确认后将生成 {n} 项任务，按「下发给」一栏下发，方案不能再改。确定？", { n: o.value.length })) && !(i.value && !await X(!0))) {
        c.value = "confirm", g.value = "";
        try {
          await Y("meeting.plan.confirm", { id: a.value.id }), f.success(t.t("方案已确认，任务已下发")), p("changed");
        } catch (q) {
          g.value = Z.errorMessage(q);
        } finally {
          c.value = "";
        }
      }
    }
    return e.onMounted(async () => {
      try {
        s.value = await De();
      } catch (q) {
        g.value = Z.errorMessage(q);
      }
    }), (q, H) => (e.openBlock(), e.createElementBlock("section", zs, [
      I.value ? (e.openBlock(), e.createElementBlock(
        e.Fragment,
        { key: 1 },
        [
          e.createElementVNode("header", Ps, [
            e.createElementVNode(
              "h4",
              null,
              e.toDisplayString(q.$t("AI 执行方案")),
              1
              /* TEXT */
            ),
            e.createElementVNode(
              "span",
              Us,
              e.toDisplayString(q.$t("生成于 {t}", { t: e.unref(Ee)(I.value.generatedAt) })),
              1
              /* TEXT */
            ),
            H[9] || (H[9] = e.createElementVNode(
              "span",
              { class: "mm-grow" },
              null,
              -1
              /* CACHED */
            )),
            e.createElementVNode(
              "span",
              {
                class: e.normalizeClass(["ss-chip", S.value.length ? "brand" : "warn"]),
                "data-test": "mm-plan-owner-chip"
              },
              e.toDisplayString(S.value.length ? q.$t("任务负责人：{name}", { name: j.value }) : q.$t("还没有指定任务负责人")),
              3
              /* TEXT, CLASS */
            ),
            I.value.confirmedAt ? (e.openBlock(), e.createElementBlock(
              "span",
              Os,
              e.toDisplayString(q.$t("{t} 已确认", { t: e.unref(Ee)(I.value.confirmedAt) })),
              1
              /* TEXT */
            )) : e.createCommentVNode("v-if", !0)
          ]),
          e.createCommentVNode(" 主持人指定任务负责人 "),
          U.value ? (e.openBlock(), e.createElementBlock("div", Rs, [
            H[10] || (H[10] = e.createElementVNode(
              "i",
              {
                class: "ri-user-star-line",
                "aria-hidden": "true"
              },
              null,
              -1
              /* CACHED */
            )),
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(a.value.status === "pending_owner" ? q.$t("指定任务负责人（可多选）：其中任何一位都能确认方案，确认后按部门下发给各部门负责人") : q.$t("更换任务负责人（可多选）")),
              1
              /* TEXT */
            ),
            e.createVNode(Oe, {
              values: m.value,
              "onUpdate:values": H[0] || (H[0] = (ee) => m.value = ee),
              multiple: "",
              max: 10,
              class: "mm-plan__owner-pick",
              people: s.value,
              "aria-label": q.$t("任务负责人"),
              "data-test": "mm-plan-owner-select"
            }, null, 8, ["values", "people", "aria-label"]),
            e.createElementVNode("button", {
              type: "button",
              class: "ss-btn sm primary",
              disabled: !m.value.length || J.value || !!c.value,
              "data-test": "mm-plan-owner-save",
              onClick: W
            }, [
              e.createElementVNode(
                "i",
                {
                  class: e.normalizeClass(c.value === "owner" ? "ri-loader-4-line spin" : "ri-check-line")
                },
                null,
                2
                /* CLASS */
              ),
              e.createTextVNode(
                e.toDisplayString(q.$t("指定")),
                1
                /* TEXT */
              )
            ], 8, qs)
          ])) : a.value.status === "pending_owner" ? (e.openBlock(), e.createElementBlock("p", Ks, [
            H[11] || (H[11] = e.createElementVNode(
              "i",
              { class: "ri-time-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(q.$t("等待主持人 {name} 指定任务负责人", { name: M(a.value.hostId) })),
              1
              /* TEXT */
            )
          ])) : a.value.status === "plan_confirm" && !l.detail.my.isPlanOwner ? (e.openBlock(), e.createElementBlock("p", Hs, [
            H[12] || (H[12] = e.createElementVNode(
              "i",
              { class: "ri-time-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(q.$t("等待任务负责人 {name} 确认方案", { name: j.value })),
              1
              /* TEXT */
            )
          ])) : e.createCommentVNode("v-if", !0),
          e.createCommentVNode(" 方案概述 "),
          e.createElementVNode("div", Ws, [
            e.createElementVNode("div", Gs, [
              e.createElementVNode(
                "b",
                null,
                e.toDisplayString(q.$t("方案概述")),
                1
                /* TEXT */
              ),
              P.value && !k.value ? (e.openBlock(), e.createElementBlock(
                "button",
                {
                  key: 0,
                  type: "button",
                  class: "ss-link",
                  onClick: H[1] || (H[1] = (ee) => k.value = !0)
                },
                e.toDisplayString(q.$t("编辑")),
                1
                /* TEXT */
              )) : e.createCommentVNode("v-if", !0)
            ]),
            k.value ? e.withDirectives((e.openBlock(), e.createElementBlock(
              "textarea",
              {
                key: 0,
                "onUpdate:modelValue": H[2] || (H[2] = (ee) => d.value = ee),
                rows: "6",
                class: "mm-plan__textarea",
                onInput: H[3] || (H[3] = (ee) => i.value = !0)
              },
              null,
              544
              /* NEED_HYDRATION, NEED_PATCH */
            )), [
              [e.vModelText, d.value]
            ]) : d.value.trim() ? (e.openBlock(), e.createElementBlock(
              e.Fragment,
              { key: 1 },
              [
                e.createCommentVNode(" eslint-disable-next-line vue/no-v-html -- renderMarkdown 已过 sanitizeHtml "),
                e.createElementVNode("div", {
                  class: "mm-plan__md",
                  innerHTML: e.unref(et.renderMarkdown)(d.value)
                }, null, 8, Ys)
              ],
              2112
              /* STABLE_FRAGMENT, DEV_ROOT_FRAGMENT */
            )) : (e.openBlock(), e.createElementBlock(
              "p",
              Js,
              e.toDisplayString(q.$t("（没有概述）")),
              1
              /* TEXT */
            ))
          ]),
          e.createCommentVNode(" 任务清单 "),
          e.createElementVNode("div", Qs, [
            e.createElementVNode(
              "b",
              null,
              e.toDisplayString(q.$t("任务清单 · {n} 项", { n: o.value.length })),
              1
              /* TEXT */
            ),
            e.createElementVNode(
              "span",
              Zs,
              e.toDisplayString(q.$t("每项一个责任部门；「下发给」默认是该部门在通讯录里的第一位负责人，可以改成任何人")),
              1
              /* TEXT */
            )
          ]),
          e.createElementVNode("div", Xs, [
            e.createElementVNode(
              "table",
              {
                class: e.normalizeClass(["ss-table mm-plan__table", { edit: P.value }])
              },
              [
                e.createElementVNode("colgroup", null, [
                  H[13] || (H[13] = e.createElementVNode(
                    "col",
                    { class: "c-no" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  H[14] || (H[14] = e.createElementVNode(
                    "col",
                    { class: "c-dept" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  H[15] || (H[15] = e.createElementVNode(
                    "col",
                    null,
                    null,
                    -1
                    /* CACHED */
                  )),
                  H[16] || (H[16] = e.createElementVNode(
                    "col",
                    null,
                    null,
                    -1
                    /* CACHED */
                  )),
                  H[17] || (H[17] = e.createElementVNode(
                    "col",
                    { class: "c-due" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  H[18] || (H[18] = e.createElementVNode(
                    "col",
                    { class: "c-to" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  P.value ? (e.openBlock(), e.createElementBlock("col", xs)) : e.createCommentVNode("v-if", !0)
                ]),
                e.createElementVNode("thead", null, [
                  e.createElementVNode("tr", null, [
                    H[19] || (H[19] = e.createElementVNode(
                      "th",
                      null,
                      "#",
                      -1
                      /* CACHED */
                    )),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(q.$t("责任部门")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(q.$t("执行事项")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(q.$t("交付标准")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(q.$t("完成时间")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(q.$t("下发给")),
                      1
                      /* TEXT */
                    ),
                    P.value ? (e.openBlock(), e.createElementBlock("th", er)) : e.createCommentVNode("v-if", !0)
                  ])
                ]),
                e.createElementVNode("tbody", null, [
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(o.value, (ee, le) => (e.openBlock(), e.createElementBlock("tr", {
                      key: ee.id,
                      "data-test": `mm-plan-item-${le}`
                    }, [
                      e.createElementVNode(
                        "td",
                        lr,
                        e.toDisplayString(le + 1),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode("td", null, [
                        P.value ? e.withDirectives((e.openBlock(), e.createElementBlock("select", {
                          key: 0,
                          "onUpdate:modelValue": ($) => ee.deptId = $,
                          onChange: H[4] || (H[4] = ($) => i.value = !0)
                        }, [
                          e.createElementVNode(
                            "option",
                            or,
                            e.toDisplayString(q.$t("选择部门")),
                            1
                            /* TEXT */
                          ),
                          (e.openBlock(!0), e.createElementBlock(
                            e.Fragment,
                            null,
                            e.renderList(s.value.depts, ($) => (e.openBlock(), e.createElementBlock("option", {
                              key: $.id,
                              value: $.id
                            }, e.toDisplayString($.name), 9, ar))),
                            128
                            /* KEYED_FRAGMENT */
                          ))
                        ], 40, nr)), [
                          [e.vModelSelect, ee.deptId]
                        ]) : (e.openBlock(), e.createElementBlock(
                          "span",
                          sr,
                          e.toDisplayString(C(ee.deptId)),
                          1
                          /* TEXT */
                        ))
                      ]),
                      e.createElementVNode("td", rr, [
                        P.value ? e.withDirectives((e.openBlock(), e.createElementBlock("input", {
                          key: 0,
                          "onUpdate:modelValue": ($) => ee.title = $,
                          type: "text",
                          class: "wide",
                          placeholder: q.$t("执行事项"),
                          onInput: H[5] || (H[5] = ($) => i.value = !0)
                        }, null, 40, ir)), [
                          [e.vModelText, ee.title]
                        ]) : (e.openBlock(), e.createElementBlock(
                          "span",
                          cr,
                          e.toDisplayString(ee.title),
                          1
                          /* TEXT */
                        )),
                        E(ee.decisionId) ? (e.openBlock(), e.createElementBlock(
                          "small",
                          dr,
                          e.toDisplayString(q.$t("来自决议 {n}", { n: E(ee.decisionId) })),
                          1
                          /* TEXT */
                        )) : e.createCommentVNode("v-if", !0)
                      ]),
                      e.createElementVNode("td", mr, [
                        P.value ? e.withDirectives((e.openBlock(), e.createElementBlock("input", {
                          key: 0,
                          "onUpdate:modelValue": ($) => ee.standard = $,
                          type: "text",
                          class: "wide",
                          placeholder: q.$t("交付标准"),
                          onInput: H[6] || (H[6] = ($) => i.value = !0)
                        }, null, 40, ur)), [
                          [e.vModelText, ee.standard]
                        ]) : (e.openBlock(), e.createElementBlock(
                          "span",
                          pr,
                          e.toDisplayString(ee.standard || "-"),
                          1
                          /* TEXT */
                        ))
                      ]),
                      e.createElementVNode("td", null, [
                        P.value ? e.withDirectives((e.openBlock(), e.createElementBlock("input", {
                          key: 0,
                          "onUpdate:modelValue": ($) => ee.due = $,
                          type: "date",
                          "data-test": `mm-plan-due-${le}`,
                          onChange: H[7] || (H[7] = ($) => i.value = !0)
                        }, null, 40, vr)), [
                          [e.vModelText, ee.due]
                        ]) : (e.openBlock(), e.createElementBlock(
                          "span",
                          kr,
                          e.toDisplayString(ee.due || "-"),
                          1
                          /* TEXT */
                        )),
                        ee.due && ee.due < e.unref(N) ? (e.openBlock(), e.createElementBlock(
                          "small",
                          yr,
                          e.toDisplayString(q.$t("早于今天")),
                          1
                          /* TEXT */
                        )) : e.createCommentVNode("v-if", !0)
                      ]),
                      e.createElementVNode("td", gr, [
                        P.value ? (e.openBlock(), e.createElementBlock(
                          e.Fragment,
                          { key: 0 },
                          [
                            e.createCommentVNode(" 不选 = 部门第一负责人（显示在占位里）；部门没设负责人或要交给别人时直接选人 "),
                            e.createVNode(Oe, {
                              "model-value": ee.assigneeId || "",
                              people: s.value,
                              pinned: z(ee.deptId),
                              "pinned-label": q.$t("本部门"),
                              placeholder: T(ee.deptId) ? q.$t("默认：{name}", { name: T(ee.deptId) }) : q.$t("选择下发给谁"),
                              "aria-label": q.$t("下发给"),
                              clearable: "",
                              "data-test": `mm-plan-to-${le}`,
                              "onUpdate:modelValue": ($) => _(ee, $)
                            }, null, 8, ["model-value", "people", "pinned", "pinned-label", "placeholder", "aria-label", "data-test", "onUpdate:modelValue"]),
                            ee.deptId && !ee.assigneeId && !T(ee.deptId) && s.value.depts.length ? (e.openBlock(), e.createElementBlock(
                              "small",
                              fr,
                              e.toDisplayString(q.$t("部门没有负责人，请选人")),
                              1
                              /* TEXT */
                            )) : e.createCommentVNode("v-if", !0)
                          ],
                          64
                          /* STABLE_FRAGMENT */
                        )) : (e.openBlock(), e.createElementBlock(
                          e.Fragment,
                          { key: 1 },
                          [
                            R(ee) ? (e.openBlock(), e.createElementBlock(
                              "span",
                              Nr,
                              e.toDisplayString(R(ee)),
                              1
                              /* TEXT */
                            )) : ee.deptId ? (e.openBlock(), e.createElementBlock("span", {
                              key: 1,
                              class: "mm-plan__warn",
                              title: q.$t("企微通讯录里这个部门没有设置负责人，确认后无法下发")
                            }, e.toDisplayString(q.$t("部门没有负责人")), 9, Vr)) : (e.openBlock(), e.createElementBlock("span", Er, "-"))
                          ],
                          64
                          /* STABLE_FRAGMENT */
                        ))
                      ]),
                      P.value ? (e.openBlock(), e.createElementBlock("td", $r, [
                        e.createElementVNode("button", {
                          type: "button",
                          class: "ss-link mm-plan__del",
                          title: q.$t("删除这项任务"),
                          onClick: ($) => r(le)
                        }, [...H[20] || (H[20] = [
                          e.createElementVNode(
                            "i",
                            { class: "ri-delete-bin-line" },
                            null,
                            -1
                            /* CACHED */
                          )
                        ])], 8, br)
                      ])) : e.createCommentVNode("v-if", !0)
                    ], 8, tr))),
                    128
                    /* KEYED_FRAGMENT */
                  )),
                  o.value.length ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock("tr", hr, [
                    e.createElementVNode("td", {
                      colspan: P.value ? 7 : 6,
                      class: "mm-plan__none"
                    }, e.toDisplayString(q.$t("AI 没有从决议里拆出任务")), 9, _r)
                  ]))
                ])
              ],
              2
              /* CLASS */
            )
          ]),
          P.value && y.value.length && h.value ? (e.openBlock(), e.createElementBlock("ul", Br, [
            (e.openBlock(!0), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(y.value, (ee) => (e.openBlock(), e.createElementBlock(
                "li",
                { key: ee },
                e.toDisplayString(ee),
                1
                /* TEXT */
              ))),
              128
              /* KEYED_FRAGMENT */
            ))
          ])) : e.createCommentVNode("v-if", !0),
          P.value ? (e.openBlock(), e.createElementBlock("div", Sr, [
            e.createElementVNode("button", {
              type: "button",
              class: "ss-btn sm",
              "data-test": "mm-plan-add",
              onClick: V
            }, [
              H[21] || (H[21] = e.createElementVNode(
                "i",
                { class: "ri-add-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(q.$t("添加任务")),
                1
                /* TEXT */
              )
            ]),
            H[22] || (H[22] = e.createElementVNode(
              "span",
              { class: "grow" },
              null,
              -1
              /* CACHED */
            )),
            i.value ? (e.openBlock(), e.createElementBlock("button", {
              key: 0,
              type: "button",
              class: "ss-btn sm",
              disabled: !!c.value,
              "data-test": "mm-plan-save",
              onClick: H[8] || (H[8] = (ee) => X())
            }, [
              e.createElementVNode(
                "i",
                {
                  class: e.normalizeClass(c.value === "save" ? "ri-loader-4-line spin" : "ri-save-3-line")
                },
                null,
                2
                /* CLASS */
              ),
              e.createTextVNode(
                e.toDisplayString(q.$t("保存修改")),
                1
                /* TEXT */
              )
            ], 8, Dr)) : e.createCommentVNode("v-if", !0),
            i.value ? (e.openBlock(), e.createElementBlock("button", {
              key: 1,
              type: "button",
              class: "ss-link",
              disabled: !!c.value,
              onClick: v
            }, e.toDisplayString(q.$t("放弃修改")), 9, wr)) : e.createCommentVNode("v-if", !0),
            e.createElementVNode("button", {
              type: "button",
              class: "ss-btn primary",
              disabled: !!c.value,
              "data-test": "mm-plan-confirm",
              onClick: ae
            }, [
              e.createElementVNode(
                "i",
                {
                  class: e.normalizeClass(c.value === "confirm" ? "ri-loader-4-line spin" : "ri-send-plane-line")
                },
                null,
                2
                /* CLASS */
              ),
              e.createTextVNode(
                e.toDisplayString(q.$t("确认方案并下发")),
                1
                /* TEXT */
              )
            ], 8, Cr)
          ])) : e.createCommentVNode("v-if", !0)
        ],
        64
        /* STABLE_FRAGMENT */
      )) : (e.openBlock(), e.createElementBlock(
        "p",
        Fs,
        e.toDisplayString(q.$t("纪要定稿后，主持人选择「生成任务」，AI 会在这里按决议事项生成执行方案和任务清单。")),
        1
        /* TEXT */
      )),
      g.value ? (e.openBlock(), e.createElementBlock("p", Tr, [
        H[23] || (H[23] = e.createElementVNode(
          "i",
          { class: "ri-error-warning-line" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(g.value),
          1
          /* TEXT */
        )
      ])) : e.createCommentVNode("v-if", !0)
    ]));
  }
}), Mr = /* @__PURE__ */ oe(Ir, [["__scopeId", "data-v-6067da9b"]]), Ar = {
  class: "mm-dt",
  "data-test": "mm-meeting-detail"
}, jr = {
  key: 0,
  class: "ss-note danger"
}, Lr = {
  key: 1,
  class: "ss-note"
}, zr = {
  class: "mm-dt__sticky",
  "data-test": "mm-meeting-steps"
}, Fr = { class: "mm-dt__titlerow" }, Pr = { class: "mm-steps" }, Ur = ["data-test"], Or = {
  key: 0,
  class: "mm-dt__procline"
}, Rr = { class: "mm-dt__procbar" }, qr = { class: "mm-dt__info" }, Kr = { key: 0 }, Hr = {
  key: 0,
  class: "ss-note warn"
}, Wr = { class: "mm-banner__icon" }, Gr = { class: "mm-banner__text" }, Yr = { key: 0 }, Jr = {
  key: 0,
  class: "mm-banner__ops"
}, Qr = ["disabled", "data-test", "onClick"], Zr = {
  key: 0,
  class: "ri-loader-4-line spin"
}, Xr = {
  key: 2,
  class: "ss-note danger"
}, xr = {
  class: "mm-dt__tabs",
  role: "tablist"
}, ei = ["aria-selected", "data-test", "onClick"], ti = {
  key: 0,
  class: "mm-dt__extra"
}, li = { class: "mm-dt__grid" }, ni = { class: "mm-dt__main" }, oi = {
  key: 0,
  class: "mm-dt__empty"
}, ai = {
  key: 1,
  class: "ss-table-wrap"
}, si = {
  class: "ss-table",
  "data-test": "mm-confirm-table"
}, ri = { class: "num" }, ii = ["data-test"], ci = { class: "mm-person" }, di = { class: "num" }, mi = {
  key: 0,
  class: "ss-chip ok"
}, ui = ["title"], pi = {
  key: 2,
  class: "ss-chip warn"
}, vi = {
  key: 3,
  class: "mm-dt__note"
}, ki = { class: "ss-muted" }, yi = {
  key: 0,
  class: "mm-dt__empty"
}, gi = {
  key: 1,
  class: "mm-raw",
  "data-test": "mm-transcript"
}, fi = { class: "mm-dt__sub" }, Ni = ["disabled"], Vi = ["disabled", "title"], Ei = {
  key: 0,
  class: "mm-dt__empty"
}, $i = {
  key: 1,
  class: "ss-table-wrap"
}, bi = { class: "ss-table" }, hi = { class: "num" }, _i = { class: "num" }, Bi = { class: "mm-dt__sub" }, Si = {
  key: 0,
  class: "ss-muted"
}, Di = ["disabled"], wi = {
  key: 2,
  class: "ss-note danger"
}, Ci = {
  key: 3,
  class: "mm-dt__empty"
}, Ti = {
  key: 4,
  class: "mm-log"
}, Ii = {
  key: 0,
  class: "mm-dt__empty"
}, Mi = {
  key: 1,
  class: "mm-tasks",
  "data-test": "mm-meeting-tasks"
}, Ai = ["onClick"], ji = { class: "mm-tasks__main" }, Li = { class: "mm-tasks__bar" }, zi = { class: "mm-tasks__pct" }, Fi = {
  key: 0,
  class: "ss-chip bad"
}, Pi = { class: "mm-dt__side" }, Ui = { class: "mm-side" }, Oi = { key: 0 }, Ri = { class: "mm-avatars" }, qi = ["title"], Ki = /* @__PURE__ */ e.defineComponent({
  __name: "MeetingDetail",
  props: {
    meetingId: {},
    focus: {}
  },
  emits: ["changed", "role"],
  setup(l, { expose: u, emit: n }) {
    const p = l, f = n, s = ie.useNotificationStore(), o = e.ref(null), d = e.ref(""), i = e.ref(""), k = e.ref("minutes"), h = e.ref(""), m = e.ref(0), c = e.ref(null), g = e.ref(Date.now()), N = e.ref(0), a = e.computed(() => o.value?.meeting), I = e.computed(() => ne.value?.me?.person?.id), P = e.computed(() => ne.value?.settings?.confirmTimeoutHours ?? 24), U = e.computed(() => Xt(a.value.status)), M = e.computed(() => ut[a.value.status] || "muted"), C = e.computed(() => {
      const $ = a.value.status;
      return $ === "pending_confirm" && o.value?.confirm.total ? t.t("待确认 {a}/{b}", { a: o.value.confirm.done, b: o.value.confirm.total }) : Xe[$];
    }), T = e.computed(() => c.value?.stage || a.value.process?.stage || "extract"), z = e.computed(() => Math.max(0, Math.min(100, Math.round(c.value?.progress ?? a.value.process?.progress ?? 0)))), R = e.computed(() => [...a.value.segments].sort(($, b) => $.start - b.start)), _ = e.computed(() => a.value.confirmations.find(($) => $.personId === I.value)), E = e.computed(() => !!o.value?.my.isHost && o.value.projectStatus === "active" && ["pending_assign", "pending_confirm", "pending_review", "failed"].includes(a.value.status) && a.value.files.some(($) => $.kind === "audio" || $.kind === "video")), v = ($) => $ && o.value?.names[$]?.name || "", S = e.computed(() => {
      const $ = [...new Set(a.value.files.map((b) => b.kind))].map((b) => Vt[b]).join(" / ");
      return $ ? `${nt[a.value.source]} ${$}` : nt[a.value.source];
    }), j = e.computed(() => {
      const $ = o.value?.confirm;
      return $?.total ? $.done >= $.total ? t.t("均已确认") : t.t("已确认 {a}/{b}", { a: $.done, b: $.total }) : "";
    });
    function J($) {
      return a.value.segments.filter((b) => Le(a.value, b.speakerLabel) === $).length;
    }
    function y($) {
      return $.objection ? "warn" : $.status === "done" ? "ok" : $.status === "cancelled" ? "muted" : $.status === "to_accept" ? "brand" : "muted";
    }
    const V = e.computed(() => {
      if (!o.value) return [];
      const $ = o.value.confirm, b = [
        { key: "minutes", title: t.t("纪要内容") },
        { key: "confirm", title: t.t("发言确认"), extra: $?.total ? `${$.done}/${$.total}` : "" },
        { key: "transcript", title: t.t("转写原文") },
        { key: "files", title: t.t("文件与处理记录") }
      ];
      return (a.value.plan || ["pending_owner", "plan_confirm", "dispatched"].includes(a.value.status)) && b.push({ key: "plan", title: t.t("执行方案") }), (a.value.status === "dispatched" || o.value?.tasks.length) && b.push({ key: "tasks", title: t.t("关联任务"), extra: o.value?.tasks.length ? String(o.value.tasks.length) : "" }), b;
    });
    e.watch(V, ($) => {
      $.length && !$.some((b) => b.key === k.value) && (k.value = "minutes");
    });
    const r = e.computed(() => {
      const $ = o.value;
      if (!$) return null;
      const b = $.meeting, B = $.my, D = v(b.hostId), O = $.projectStatus === "archived", G = (w, L, x = "primary") => O ? [] : [{ key: w, label: L, kind: x }], F = (w, L) => ({ tone: "muted", icon: "ri-time-line", title: w, desc: L, actions: [] });
      switch (b.status) {
        case "pending_upload":
          return B.isHost ? { tone: "warn", icon: "ri-upload-cloud-2-line", title: t.t("上传会议文件，开始转写和整理"), desc: t.t("录音、录屏、文字记录都支持；优先上传录音或录屏，能按声纹自动认出发言人"), actions: G("pick", t.t("选择文件")) } : F(t.t("等待主持人 {name} 上传会议文件", { name: D }));
        case "processing":
          return { tone: "brand", icon: "ri-loader-4-line spin", title: t.t("正在处理：{stage}", { stage: je[T.value] }), desc: t.t("完成后自动通知每位发言人确认本人发言"), actions: [] };
        case "failed":
          return B.isHost ? { tone: "bad", icon: "ri-error-warning-line", title: t.t("处理失败"), desc: b.process?.error || "", actions: G("retry", t.t("重试")) } : { tone: "bad", icon: "ri-error-warning-line", title: t.t("处理失败，等待主持人 {name} 重试", { name: D }), desc: b.process?.error || "", actions: [] };
        case "pending_assign": {
          const w = b.speakers.filter((L) => !L.personId).length;
          return B.isHost ? { tone: "warn", icon: "ri-user-search-line", title: t.t("有 {n} 位发言人没认出来，请先指认", { n: w }), desc: t.t("试听片段后从参会人里选人；全部指认完自动进入发言确认"), actions: k.value === "minutes" ? [] : G("goMinutes", t.t("去指认")) } : F(t.t("等待主持人 {name} 指认发言人", { name: D }));
        }
        case "pending_confirm": {
          const w = $.confirm;
          if (_.value?.status === "pending") {
            const L = b.segments.filter((Q) => B.myLabels.includes(Q.speakerLabel) || Le(b, Q.speakerLabel) === I.value).length, x = _.value.returnedAt ? t.t("主持人退回了你的发言：{note}。改完后重新确认。", { note: _.value.returnNote || t.t("（没有写原因）") }) : "";
            return { tone: x ? "warn" : "brand", icon: "ri-chat-check-line", title: t.t("请核对你的 {n} 段发言", { n: L }), desc: x || t.t("有误的直接在纪要里修改；没问题就点「确认我的发言」"), actions: G("confirm", t.t("确认我的发言")) };
          }
          return _.value?.status === "confirmed" ? { tone: "ok", icon: "ri-check-double-line", title: t.t("你已确认本人发言"), desc: t.t("其他发言人确认中（{a}/{b}），全部确认后进入主持人终审", { a: w.done, b: w.total }), actions: [] } : { tone: "brand", icon: "ri-chat-check-line", title: t.t("发言人确认中 {a}/{b}", { a: w.done, b: w.total }), desc: B.isHost ? t.t("全部确认后自动进入你的终审；超时未确认的系统自动催办") : t.t("全部确认后进入主持人终审"), actions: k.value === "confirm" ? [] : [{ key: "goConfirm", label: t.t("查看确认进度"), kind: "soft" }] };
        }
        case "pending_review":
          return B.isHost ? { tone: "brand", icon: "ri-check-line", title: t.t("{n} 位发言人已全部确认，等你终审", { n: $.confirm.total }), desc: t.t("可直接修改任意段落，或把某段退回给指定发言人（只有被退回的人需要重新确认）"), actions: G("approve", t.t("审核通过")) } : F(t.t("发言人已全部确认，等待主持人 {name} 终审", { name: D }));
        case "finalized":
          return B.isHost ? {
            tone: "ok",
            icon: "ri-file-shield-2-line",
            title: t.t("纪要已定稿，下一步：是否生成任务？"),
            desc: b.decisions.length ? t.t("AI 识别出 {n} 项决议事项；选「生成任务」由 AI 拆成执行方案，再由你指定任务负责人", { n: b.decisions.length }) : t.t("没有识别到决议事项，一般选「无需生成任务」结束会议"),
            actions: O ? [] : [{ key: "generate", label: t.t("生成任务"), kind: "primary" }, { key: "none", label: t.t("无需生成任务"), kind: "plain" }]
          } : F(t.t("纪要已定稿，等待主持人 {name} 选择是否生成任务", { name: D }));
        case "ended":
          return { tone: "muted", icon: "ri-flag-line", title: t.t("会议已结束（无需生成任务）"), desc: b.finalizedAt ? t.t("纪要于 {t} 定稿", { t: Ee(b.finalizedAt) }) : "", actions: [] };
        case "pending_owner":
          return B.isHost ? { tone: "brand", icon: "ri-user-star-line", title: t.t("执行方案已生成，请指定任务负责人"), desc: t.t("任务负责人负责确认方案；确认后自动下发给各部门负责人"), actions: k.value === "plan" ? [] : G("goPlan", t.t("去指定")) } : F(t.t("执行方案已生成，等待主持人 {name} 指定任务负责人", { name: D }));
        case "plan_confirm":
          return B.isPlanOwner ? { tone: "brand", icon: "ri-file-list-3-line", title: t.t("请确认执行方案"), desc: t.t("可以编辑任务、增删、设完成时间；确认后按部门下发给第一负责人"), actions: k.value === "plan" ? [] : G("goPlan", t.t("去确认方案")) } : F(t.t("等待任务负责人 {name} 确认方案", { name: (b.plan?.ownerIds?.length ? b.plan.ownerIds : b.plan?.ownerId ? [b.plan.ownerId] : []).map((w) => v(w)).filter(Boolean).join(t.t("、")) }));
        case "dispatched":
          return { tone: "ok", icon: "ri-send-plane-line", title: t.t("已派发 {n} 项任务", { n: $.tasks.length || b.taskIds.length }), desc: t.t("各部门负责人接收后开始执行，进度在「任务」里跟进"), actions: k.value === "tasks" ? [] : [{ key: "goTasks", label: t.t("查看关联任务"), kind: "soft" }] };
        default:
          return null;
      }
    });
    async function W() {
      const $ = p.meetingId;
      try {
        const b = await Y("meeting.get", { id: $ });
        if ($ !== p.meetingId) return;
        o.value = b, d.value = "", b?.meeting?.status !== "processing" && (c.value = null);
      } catch (b) {
        d.value = Z.errorMessage(b);
      }
    }
    function X() {
      W(), f("changed");
    }
    let ae = null;
    function q() {
      ae && clearTimeout(ae), ae = setTimeout(() => {
        ae = null, W();
      }, 300);
    }
    async function H($) {
      if ($ === "goPlan") {
        k.value = "plan";
        return;
      }
      if ($ === "goTasks") {
        k.value = "tasks";
        return;
      }
      if ($ === "goMinutes") {
        k.value = "minutes";
        return;
      }
      if ($ === "goConfirm") {
        k.value = "confirm";
        return;
      }
      if (!o.value || i.value) return;
      const b = o.value.meeting.id;
      if (!($ === "approve" && !window.confirm(t.t("审核通过后纪要锁定，不能再改，并通知全部参会人。确定通过？"))) && !($ === "none" && !window.confirm(t.t("确定无需生成任务？会议将直接结束。"))) && !($ === "reprocess" && !window.confirm(t.t("用当前的转写模型把这场会议重新转写一遍？发言人识别、确认状态和对纪要的修改都会清掉，处理完重新走确认。")))) {
        i.value = $, d.value = "";
        try {
          $ === "pick" ? await Y("meeting.pickFiles", { id: b }) && s.success(t.t("文件已上传，开始处理")) : $ === "retry" ? await Y("meeting.retry", { id: b }) : $ === "reprocess" ? (await Y("meeting.reprocess", { id: b }), s.success(t.t("已开始重新转写"))) : $ === "confirm" ? (await Y("meeting.confirm", { id: b }), s.success(t.t("已确认你的发言"))) : $ === "approve" ? (await Y("meeting.review.approve", { id: b }), s.success(t.t("纪要已定稿，已通知参会人"))) : $ === "generate" ? (await Y("meeting.decide", { id: b, decision: "generate" }), s.success(t.t("执行方案已生成，下一步指定任务负责人")), k.value = "plan") : $ === "none" && await Y("meeting.decide", { id: b, decision: "none" }), await W(), f("changed");
        } catch (B) {
          d.value = Z.errorMessage(B), s.error(Z.errorMessage(B));
        } finally {
          i.value = "";
        }
      }
    }
    e.watch(() => p.focus?.seq, () => {
      const $ = p.focus;
      if (!$) return;
      const b = ["minutes", "confirm", "transcript", "files", "plan", "tasks"];
      $.tab && b.includes($.tab) && (k.value = $.tab), $.anchor && (b.includes($.anchor) ? k.value = $.anchor : (k.value = "minutes", h.value = $.anchor, m.value = $.seq));
    }, { immediate: !0 }), e.watch(() => vl(o.value, I.value), ($) => {
      $ && f("role", $);
    }, { immediate: !0 });
    let ee = null;
    e.watch(() => o.value?.meeting.status === "processing", ($) => {
      $ && !ee && (ee = setInterval(() => {
        g.value = Date.now();
      }, 1e3)), !$ && ee && (clearInterval(ee), ee = null);
    }, { immediate: !0 });
    let le = null;
    return e.onMounted(() => {
      W(), le = Se(($) => {
        if ($?.type === "changed") {
          ($.scope === "all" || $.scope === "meeting" && (!$.id || $.id === p.meetingId)) && q();
          return;
        }
        $?.type !== "process" || $.meetingId !== p.meetingId || (c.value = { stage: $.stage, progress: $.progress, text: $.text, at: Date.now() }, g.value = Date.now(), ($.stage === "done" || o.value && o.value.meeting.status !== "processing") && W());
      });
    }), e.onBeforeUnmount(() => {
      le?.(), ae && clearTimeout(ae), ee && clearInterval(ee);
    }), u({ refresh: W }), ($, b) => (e.openBlock(), e.createElementBlock("section", Ar, [
      d.value && !o.value ? (e.openBlock(), e.createElementBlock("p", jr, [
        b[5] || (b[5] = e.createElementVNode(
          "i",
          { class: "ri-error-warning-line" },
          null,
          -1
          /* CACHED */
        )),
        e.createElementVNode(
          "span",
          null,
          e.toDisplayString(d.value),
          1
          /* TEXT */
        ),
        e.createElementVNode(
          "button",
          {
            type: "button",
            class: "ss-link",
            onClick: W
          },
          e.toDisplayString($.$t("重试")),
          1
          /* TEXT */
        )
      ])) : o.value ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock("p", Lr, [
        b[6] || (b[6] = e.createElementVNode(
          "i",
          { class: "ri-loader-4-line spin" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString($.$t("正在加载会议…")),
          1
          /* TEXT */
        )
      ])),
      o.value ? (e.openBlock(), e.createElementBlock(
        e.Fragment,
        { key: 2 },
        [
          e.createCommentVNode(" 顶部：标题 + 状态 + 环节进度（sticky：滚动时一直看得见） "),
          e.createElementVNode("div", zr, [
            e.createElementVNode("div", Fr, [
              e.createElementVNode(
                "h3",
                null,
                e.toDisplayString(a.value.title),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "span",
                {
                  class: e.normalizeClass(["ss-chip", M.value]),
                  "data-test": "mm-meeting-status"
                },
                e.toDisplayString(C.value),
                3
                /* TEXT, CLASS */
              ),
              b[8] || (b[8] = e.createElementVNode(
                "span",
                { class: "mm-grow" },
                null,
                -1
                /* CACHED */
              )),
              e.createElementVNode("ol", Pr, [
                (e.openBlock(!0), e.createElementBlock(
                  e.Fragment,
                  null,
                  e.renderList(e.unref(Dt), (B, D) => (e.openBlock(), e.createElementBlock("li", {
                    key: B.key,
                    class: e.normalizeClass({ done: D < U.value || a.value.status === "dispatched" && D === U.value, cur: D === U.value && a.value.status !== "dispatched", bad: D === U.value && a.value.status === "failed" }),
                    "data-test": `mm-step-${B.key}`
                  }, [
                    b[7] || (b[7] = e.createElementVNode(
                      "i",
                      { class: "mm-steps__dot" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createTextVNode(
                      e.toDisplayString(B.label),
                      1
                      /* TEXT */
                    )
                  ], 10, Ur))),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ])
            ]),
            a.value.status === "processing" ? (e.openBlock(), e.createElementBlock("div", Or, [
              e.createElementVNode("span", Rr, [
                e.createElementVNode(
                  "i",
                  {
                    style: e.normalizeStyle({ width: `${z.value}%` })
                  },
                  null,
                  4
                  /* STYLE */
                )
              ]),
              e.createElementVNode(
                "small",
                null,
                e.toDisplayString($.$t("处理中 · {stage} {p}%", { stage: e.unref(je)[T.value], p: z.value })),
                1
                /* TEXT */
              )
            ])) : e.createCommentVNode("v-if", !0)
          ]),
          e.createElementVNode("p", qr, [
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(o.value.projectName),
              1
              /* TEXT */
            ),
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(e.unref(Ee)(a.value.time)),
              1
              /* TEXT */
            ),
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString($.$t("主持人 {name}", { name: v(a.value.hostId) })),
              1
              /* TEXT */
            ),
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(S.value),
              1
              /* TEXT */
            ),
            a.value.durationSec ? (e.openBlock(), e.createElementBlock(
              "span",
              Kr,
              e.toDisplayString(e.unref(il)(a.value.durationSec)),
              1
              /* TEXT */
            )) : e.createCommentVNode("v-if", !0)
          ]),
          o.value.projectStatus !== "active" ? (e.openBlock(), e.createElementBlock("p", Hr, [
            b[9] || (b[9] = e.createElementVNode(
              "i",
              { class: "ri-lock-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(o.value.projectStatus === "archived" ? $.$t("项目已归档，会议只读") : $.$t("项目结项中，会议只读")),
              1
              /* TEXT */
            )
          ])) : e.createCommentVNode("v-if", !0),
          e.createCommentVNode(" 当前环节的操作横幅 "),
          r.value ? (e.openBlock(), e.createElementBlock(
            "div",
            {
              key: 1,
              class: e.normalizeClass(["mm-banner", r.value.tone]),
              "data-test": "mm-meeting-banner"
            },
            [
              e.createElementVNode("span", Wr, [
                e.createElementVNode(
                  "i",
                  {
                    class: e.normalizeClass(r.value.icon)
                  },
                  null,
                  2
                  /* CLASS */
                )
              ]),
              e.createElementVNode("div", Gr, [
                e.createElementVNode(
                  "strong",
                  null,
                  e.toDisplayString(r.value.title),
                  1
                  /* TEXT */
                ),
                r.value.desc ? (e.openBlock(), e.createElementBlock(
                  "small",
                  Yr,
                  e.toDisplayString(r.value.desc),
                  1
                  /* TEXT */
                )) : e.createCommentVNode("v-if", !0)
              ]),
              r.value.actions.length ? (e.openBlock(), e.createElementBlock("div", Jr, [
                (e.openBlock(!0), e.createElementBlock(
                  e.Fragment,
                  null,
                  e.renderList(r.value.actions, (B) => (e.openBlock(), e.createElementBlock("button", {
                    key: B.key,
                    type: "button",
                    class: e.normalizeClass(["mm-btn", B.kind]),
                    disabled: !!i.value,
                    "data-test": `mm-action-${B.key}`,
                    onClick: (D) => H(B.key)
                  }, [
                    i.value === B.key ? (e.openBlock(), e.createElementBlock("i", Zr)) : e.createCommentVNode("v-if", !0),
                    e.createTextVNode(
                      e.toDisplayString(B.label),
                      1
                      /* TEXT */
                    )
                  ], 10, Qr))),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ])) : e.createCommentVNode("v-if", !0)
            ],
            2
            /* CLASS */
          )) : e.createCommentVNode("v-if", !0),
          d.value ? (e.openBlock(), e.createElementBlock("p", Xr, [
            b[10] || (b[10] = e.createElementVNode(
              "i",
              { class: "ri-error-warning-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(d.value),
              1
              /* TEXT */
            )
          ])) : e.createCommentVNode("v-if", !0),
          e.createCommentVNode(" 内容页签 "),
          e.createElementVNode("nav", xr, [
            (e.openBlock(!0), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(V.value, (B) => (e.openBlock(), e.createElementBlock("button", {
                key: B.key,
                type: "button",
                role: "tab",
                class: e.normalizeClass({ on: k.value === B.key }),
                "aria-selected": k.value === B.key,
                "data-test": `mm-dtab-${B.key}`,
                onClick: (D) => k.value = B.key
              }, [
                e.createTextVNode(
                  e.toDisplayString(B.title),
                  1
                  /* TEXT */
                ),
                B.extra ? (e.openBlock(), e.createElementBlock(
                  "span",
                  ti,
                  e.toDisplayString(B.extra),
                  1
                  /* TEXT */
                )) : e.createCommentVNode("v-if", !0)
              ], 10, ei))),
              128
              /* KEYED_FRAGMENT */
            ))
          ]),
          e.createElementVNode("div", li, [
            e.createElementVNode("div", ni, [
              e.createCommentVNode(" 纪要内容 "),
              k.value === "minutes" ? (e.openBlock(), e.createElementBlock(
                e.Fragment,
                { key: 0 },
                [
                  a.value.status === "pending_upload" || a.value.status === "processing" || a.value.status === "failed" ? (e.openBlock(), e.createBlock(Io, {
                    key: 0,
                    detail: o.value,
                    live: c.value,
                    now: g.value,
                    "wait-from": N.value,
                    onChanged: X,
                    onLog: b[0] || (b[0] = (B) => k.value = "files"),
                    onWait: b[1] || (b[1] = (B) => N.value = Date.now())
                  }, null, 8, ["detail", "live", "now", "wait-from"])) : e.createCommentVNode("v-if", !0),
                  a.value.status === "pending_assign" || o.value.my.isHost && (a.value.status === "pending_confirm" || a.value.status === "pending_review") ? (e.openBlock(), e.createBlock(va, {
                    key: `sa-${a.value.status}`,
                    detail: o.value,
                    onChanged: X
                  }, null, 8, ["detail"])) : e.createCommentVNode("v-if", !0),
                  a.value.segments.length || !["pending_upload", "processing", "failed"].includes(a.value.status) ? (e.openBlock(), e.createBlock(Ls, {
                    key: 2,
                    detail: o.value,
                    anchor: h.value,
                    "anchor-seq": m.value,
                    onChanged: X
                  }, null, 8, ["detail", "anchor", "anchor-seq"])) : e.createCommentVNode("v-if", !0)
                ],
                64
                /* STABLE_FRAGMENT */
              )) : k.value === "confirm" ? (e.openBlock(), e.createElementBlock(
                e.Fragment,
                { key: 1 },
                [
                  e.createCommentVNode(" 发言确认 "),
                  a.value.confirmations.length ? (e.openBlock(), e.createElementBlock("div", ai, [
                    e.createElementVNode("table", si, [
                      e.createElementVNode("thead", null, [
                        e.createElementVNode("tr", null, [
                          e.createElementVNode(
                            "th",
                            null,
                            e.toDisplayString($.$t("发言人")),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "th",
                            null,
                            e.toDisplayString($.$t("部门")),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "th",
                            ri,
                            e.toDisplayString($.$t("发言段数")),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "th",
                            null,
                            e.toDisplayString($.$t("状态")),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "th",
                            null,
                            e.toDisplayString($.$t("确认时间")),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "th",
                            null,
                            e.toDisplayString($.$t("催办")),
                            1
                            /* TEXT */
                          )
                        ])
                      ]),
                      e.createElementVNode("tbody", null, [
                        (e.openBlock(!0), e.createElementBlock(
                          e.Fragment,
                          null,
                          e.renderList(a.value.confirmations, (B) => (e.openBlock(), e.createElementBlock("tr", {
                            key: B.personId,
                            "data-test": `mm-confirm-${B.personId}`
                          }, [
                            e.createElementVNode("td", null, [
                              e.createElementVNode("span", ci, [
                                e.createElementVNode(
                                  "span",
                                  {
                                    class: "mm-av sm",
                                    style: e.normalizeStyle({ background: e.unref(re)(v(B.personId)).color })
                                  },
                                  e.toDisplayString(e.unref(re)(v(B.personId)).text),
                                  5
                                  /* TEXT, STYLE */
                                ),
                                e.createTextVNode(
                                  e.toDisplayString(v(B.personId)),
                                  1
                                  /* TEXT */
                                )
                              ])
                            ]),
                            e.createElementVNode(
                              "td",
                              null,
                              e.toDisplayString(o.value.names[B.personId]?.deptName || "-"),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "td",
                              di,
                              e.toDisplayString(J(B.personId)),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode("td", null, [
                              B.status === "confirmed" ? (e.openBlock(), e.createElementBlock(
                                "span",
                                mi,
                                e.toDisplayString($.$t("已确认")),
                                1
                                /* TEXT */
                              )) : B.returnedAt ? (e.openBlock(), e.createElementBlock("span", {
                                key: 1,
                                class: "ss-chip bad",
                                title: B.returnNote || ""
                              }, e.toDisplayString($.$t("被退回")), 9, ui)) : (e.openBlock(), e.createElementBlock(
                                "span",
                                pi,
                                e.toDisplayString($.$t("未确认")),
                                1
                                /* TEXT */
                              )),
                              B.returnedAt && B.returnNote && B.status !== "confirmed" ? (e.openBlock(), e.createElementBlock(
                                "small",
                                vi,
                                e.toDisplayString(B.returnNote),
                                1
                                /* TEXT */
                              )) : e.createCommentVNode("v-if", !0)
                            ]),
                            e.createElementVNode(
                              "td",
                              null,
                              e.toDisplayString(B.confirmedAt ? e.unref(Ee)(B.confirmedAt) : "-"),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "td",
                              null,
                              e.toDisplayString(B.remindedAt ? $.$t("已催办 {t}", { t: e.unref(Ee)(B.remindedAt) }) : "-"),
                              1
                              /* TEXT */
                            )
                          ], 8, ii))),
                          128
                          /* KEYED_FRAGMENT */
                        ))
                      ])
                    ])
                  ])) : (e.openBlock(), e.createElementBlock(
                    "p",
                    oi,
                    e.toDisplayString($.$t("转写和发言人识别完成后，这里显示每位发言人的确认状态")),
                    1
                    /* TEXT */
                  )),
                  e.createElementVNode(
                    "small",
                    ki,
                    e.toDisplayString($.$t("超过 {h} 小时未确认，系统自动催办（只提醒，不改状态）；全员确认后自动进入主持人终审。", { h: P.value })),
                    1
                    /* TEXT */
                  )
                ],
                64
                /* STABLE_FRAGMENT */
              )) : k.value === "transcript" ? (e.openBlock(), e.createElementBlock(
                e.Fragment,
                { key: 2 },
                [
                  e.createCommentVNode(" 转写原文 "),
                  R.value.length ? (e.openBlock(), e.createElementBlock("ol", gi, [
                    (e.openBlock(!0), e.createElementBlock(
                      e.Fragment,
                      null,
                      e.renderList(R.value, (B) => (e.openBlock(), e.createElementBlock("li", {
                        key: B.id
                      }, [
                        e.createElementVNode(
                          "time",
                          null,
                          e.toDisplayString(e.unref(Ae)(B.start)),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "b",
                          null,
                          e.toDisplayString(e.unref(xe)(o.value, B.speakerLabel)),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "span",
                          null,
                          e.toDisplayString(B.originalText || B.text),
                          1
                          /* TEXT */
                        )
                      ]))),
                      128
                      /* KEYED_FRAGMENT */
                    ))
                  ])) : (e.openBlock(), e.createElementBlock(
                    "p",
                    yi,
                    e.toDisplayString($.$t("还没有转写内容")),
                    1
                    /* TEXT */
                  ))
                ],
                64
                /* STABLE_FRAGMENT */
              )) : k.value === "files" ? (e.openBlock(), e.createElementBlock(
                e.Fragment,
                { key: 3 },
                [
                  e.createCommentVNode(" 文件与处理记录 "),
                  e.createElementVNode("div", fi, [
                    e.createElementVNode(
                      "b",
                      null,
                      e.toDisplayString($.$t("上传的文件")),
                      1
                      /* TEXT */
                    ),
                    b[11] || (b[11] = e.createElementVNode(
                      "span",
                      { class: "mm-grow" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    o.value.my.isHost && (a.value.status === "pending_upload" || a.value.status === "failed") ? (e.openBlock(), e.createElementBlock("button", {
                      key: 0,
                      type: "button",
                      class: "ss-btn sm",
                      disabled: !!i.value,
                      onClick: b[2] || (b[2] = (B) => H("pick"))
                    }, [
                      e.createElementVNode(
                        "i",
                        {
                          class: e.normalizeClass(i.value === "pick" ? "ri-loader-4-line spin" : "ri-upload-2-line")
                        },
                        null,
                        2
                        /* CLASS */
                      ),
                      e.createTextVNode(
                        e.toDisplayString($.$t("上传文件")),
                        1
                        /* TEXT */
                      )
                    ], 8, Ni)) : e.createCommentVNode("v-if", !0),
                    E.value ? (e.openBlock(), e.createElementBlock("button", {
                      key: 1,
                      type: "button",
                      class: "ss-btn sm",
                      disabled: !!i.value,
                      "data-test": "mm-reprocess",
                      title: $.$t("换了更准的转写模型后，用现在的模型把这场会议重新转写一遍"),
                      onClick: b[3] || (b[3] = (B) => H("reprocess"))
                    }, [
                      e.createElementVNode(
                        "i",
                        {
                          class: e.normalizeClass(i.value === "reprocess" ? "ri-loader-4-line spin" : "ri-refresh-line")
                        },
                        null,
                        2
                        /* CLASS */
                      ),
                      e.createTextVNode(
                        e.toDisplayString($.$t("用当前模型重新转写")),
                        1
                        /* TEXT */
                      )
                    ], 8, Vi)) : e.createCommentVNode("v-if", !0)
                  ]),
                  a.value.files.length ? (e.openBlock(), e.createElementBlock("div", $i, [
                    e.createElementVNode("table", bi, [
                      e.createElementVNode("thead", null, [
                        e.createElementVNode("tr", null, [
                          e.createElementVNode(
                            "th",
                            null,
                            e.toDisplayString($.$t("文件")),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "th",
                            null,
                            e.toDisplayString($.$t("类型")),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "th",
                            hi,
                            e.toDisplayString($.$t("大小")),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "th",
                            null,
                            e.toDisplayString($.$t("上传时间")),
                            1
                            /* TEXT */
                          )
                        ])
                      ]),
                      e.createElementVNode("tbody", null, [
                        (e.openBlock(!0), e.createElementBlock(
                          e.Fragment,
                          null,
                          e.renderList(a.value.files, (B) => (e.openBlock(), e.createElementBlock("tr", {
                            key: B.id
                          }, [
                            e.createElementVNode(
                              "td",
                              null,
                              e.toDisplayString(B.name),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "td",
                              null,
                              e.toDisplayString(e.unref(Vt)[B.kind] || B.kind),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "td",
                              _i,
                              e.toDisplayString(e.unref(rl)(B.size)),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "td",
                              null,
                              e.toDisplayString(e.unref(Ee)(B.uploadedAt)),
                              1
                              /* TEXT */
                            )
                          ]))),
                          128
                          /* KEYED_FRAGMENT */
                        ))
                      ])
                    ])
                  ])) : (e.openBlock(), e.createElementBlock(
                    "p",
                    Ei,
                    e.toDisplayString($.$t("还没有上传文件")),
                    1
                    /* TEXT */
                  )),
                  e.createElementVNode("div", Bi, [
                    e.createElementVNode(
                      "b",
                      null,
                      e.toDisplayString($.$t("处理记录")),
                      1
                      /* TEXT */
                    ),
                    a.value.process ? (e.openBlock(), e.createElementBlock("span", Si, [
                      e.createTextVNode(
                        e.toDisplayString($.$t("{stage} · {p}%", { stage: e.unref(je)[a.value.process.stage], p: Math.round(a.value.process.progress || 0) })),
                        1
                        /* TEXT */
                      ),
                      a.value.process.finishedAt ? (e.openBlock(), e.createElementBlock(
                        e.Fragment,
                        { key: 0 },
                        [
                          e.createTextVNode(
                            " · " + e.toDisplayString($.$t("完成于 {t}", { t: e.unref(Ee)(a.value.process.finishedAt) })),
                            1
                            /* TEXT */
                          )
                        ],
                        64
                        /* STABLE_FRAGMENT */
                      )) : e.createCommentVNode("v-if", !0)
                    ])) : e.createCommentVNode("v-if", !0),
                    b[12] || (b[12] = e.createElementVNode(
                      "span",
                      { class: "mm-grow" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    o.value.my.isHost && a.value.status === "failed" ? (e.openBlock(), e.createElementBlock("button", {
                      key: 1,
                      type: "button",
                      class: "ss-btn sm primary",
                      disabled: !!i.value,
                      "data-test": "mm-files-retry",
                      onClick: b[4] || (b[4] = (B) => H("retry"))
                    }, [
                      e.createElementVNode(
                        "i",
                        {
                          class: e.normalizeClass(i.value === "retry" ? "ri-loader-4-line spin" : "ri-restart-line")
                        },
                        null,
                        2
                        /* CLASS */
                      ),
                      e.createTextVNode(
                        e.toDisplayString($.$t("重试")),
                        1
                        /* TEXT */
                      )
                    ], 8, Di)) : e.createCommentVNode("v-if", !0)
                  ]),
                  a.value.process?.error ? (e.openBlock(), e.createElementBlock("p", wi, [
                    b[13] || (b[13] = e.createElementVNode(
                      "i",
                      { class: "ri-error-warning-line" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createTextVNode(
                      e.toDisplayString(a.value.process.error),
                      1
                      /* TEXT */
                    )
                  ])) : e.createCommentVNode("v-if", !0),
                  a.value.process?.log?.length ? (e.openBlock(), e.createElementBlock("ol", Ti, [
                    (e.openBlock(!0), e.createElementBlock(
                      e.Fragment,
                      null,
                      e.renderList(a.value.process.log, (B, D) => (e.openBlock(), e.createElementBlock("li", { key: D }, [
                        e.createElementVNode(
                          "time",
                          null,
                          e.toDisplayString(e.unref(Ee)(B.at)),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "span",
                          null,
                          e.toDisplayString(B.text),
                          1
                          /* TEXT */
                        )
                      ]))),
                      128
                      /* KEYED_FRAGMENT */
                    ))
                  ])) : (e.openBlock(), e.createElementBlock(
                    "p",
                    Ci,
                    e.toDisplayString($.$t("还没有处理记录")),
                    1
                    /* TEXT */
                  ))
                ],
                64
                /* STABLE_FRAGMENT */
              )) : k.value === "plan" ? (e.openBlock(), e.createElementBlock(
                e.Fragment,
                { key: 4 },
                [
                  e.createCommentVNode(" 执行方案 "),
                  e.createVNode(Mr, {
                    detail: o.value,
                    onChanged: X
                  }, null, 8, ["detail"])
                ],
                2112
                /* STABLE_FRAGMENT, DEV_ROOT_FRAGMENT */
              )) : k.value === "tasks" ? (e.openBlock(), e.createElementBlock(
                e.Fragment,
                { key: 5 },
                [
                  e.createCommentVNode(" 关联任务 "),
                  o.value.tasks.length ? (e.openBlock(), e.createElementBlock("ul", Mi, [
                    (e.openBlock(!0), e.createElementBlock(
                      e.Fragment,
                      null,
                      e.renderList(o.value.tasks, (B) => (e.openBlock(), e.createElementBlock("li", {
                        key: B.id,
                        onClick: (D) => e.unref(de)({ kind: "task", id: B.id })
                      }, [
                        e.createElementVNode("div", ji, [
                          e.createElementVNode(
                            "strong",
                            null,
                            e.toDisplayString(B.title),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "small",
                            null,
                            e.toDisplayString(B.deptName) + " · " + e.toDisplayString(B.assigneeName) + " · " + e.toDisplayString($.$t("截止 {d}", { d: B.due })),
                            1
                            /* TEXT */
                          )
                        ]),
                        e.createElementVNode("span", Li, [
                          e.createElementVNode(
                            "i",
                            {
                              class: e.normalizeClass({ bad: B.overdue }),
                              style: e.normalizeStyle({ width: `${Math.max(0, Math.min(100, B.percent || 0))}%` })
                            },
                            null,
                            6
                            /* CLASS, STYLE */
                          )
                        ]),
                        e.createElementVNode(
                          "small",
                          zi,
                          e.toDisplayString(Math.round(B.percent || 0)) + "%",
                          1
                          /* TEXT */
                        ),
                        B.overdue ? (e.openBlock(), e.createElementBlock(
                          "span",
                          Fi,
                          e.toDisplayString($.$t("逾期 {n} 天", { n: B.overdueDays })),
                          1
                          /* TEXT */
                        )) : e.createCommentVNode("v-if", !0),
                        e.createElementVNode(
                          "span",
                          {
                            class: e.normalizeClass(["ss-chip", y(B)])
                          },
                          e.toDisplayString(e.unref(dt)(B.objection) || e.unref(Ue)[B.status]),
                          3
                          /* TEXT, CLASS */
                        ),
                        b[14] || (b[14] = e.createElementVNode(
                          "i",
                          {
                            class: "ri-arrow-right-s-line",
                            "aria-hidden": "true"
                          },
                          null,
                          -1
                          /* CACHED */
                        ))
                      ], 8, Ai))),
                      128
                      /* KEYED_FRAGMENT */
                    ))
                  ])) : (e.openBlock(), e.createElementBlock(
                    "p",
                    Ii,
                    e.toDisplayString($.$t("这场会议还没有派发任务")),
                    1
                    /* TEXT */
                  ))
                ],
                64
                /* STABLE_FRAGMENT */
              )) : e.createCommentVNode("v-if", !0)
            ]),
            e.createCommentVNode(" 右侧栏：决议事项 + 参会人 "),
            e.createElementVNode("aside", Pi, [
              e.createVNode(ja, {
                detail: o.value,
                onChanged: X
              }, null, 8, ["detail"]),
              e.createElementVNode("section", Ui, [
                e.createElementVNode("h5", null, [
                  e.createTextVNode(
                    e.toDisplayString($.$t("参会人")) + " ",
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "span",
                    null,
                    e.toDisplayString(a.value.attendeeIds.length),
                    1
                    /* TEXT */
                  ),
                  j.value ? (e.openBlock(), e.createElementBlock(
                    "small",
                    Oi,
                    " · " + e.toDisplayString(j.value),
                    1
                    /* TEXT */
                  )) : e.createCommentVNode("v-if", !0)
                ]),
                e.createElementVNode("div", Ri, [
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(a.value.attendeeIds, (B) => (e.openBlock(), e.createElementBlock("span", {
                      key: B,
                      class: e.normalizeClass(["mm-av", { host: B === a.value.hostId }]),
                      style: e.normalizeStyle({ background: e.unref(re)(v(B)).color }),
                      title: B === a.value.hostId ? $.$t("{name}（主持人）", { name: v(B) }) : v(B)
                    }, e.toDisplayString(e.unref(re)(v(B)).text), 15, qi))),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ])
              ])
            ])
          ])
        ],
        64
        /* STABLE_FRAGMENT */
      )) : e.createCommentVNode("v-if", !0)
    ]));
  }
}), Hi = /* @__PURE__ */ oe(Ki, [["__scopeId", "data-v-f1e6ab38"]]), Wi = ["aria-label"], Gi = { class: "mm-cd" }, Yi = { class: "mm-cd__head" }, Ji = ["title"], Qi = { class: "mm-cd__body" }, Zi = {
  key: 0,
  class: "ss-note danger"
}, Xi = {
  key: 1,
  class: "ss-note warn"
}, xi = { class: "ss-field" }, ec = { value: "" }, tc = ["value"], lc = { class: "ss-field" }, nc = ["placeholder"], oc = { class: "mm-cd__row" }, ac = { class: "ss-field" }, sc = { class: "ss-field" }, rc = {
  class: "mm-cd__seg",
  role: "radiogroup"
}, ic = ["aria-checked", "data-test", "onClick"], cc = { class: "ss-field" }, dc = { class: "ss-muted" }, mc = { class: "ss-field" }, uc = { class: "ss-muted" }, pc = {
  key: 0,
  class: "mm-cd__chips"
}, vc = ["title", "onClick"], kc = { class: "mm-cd__picker" }, yc = { class: "mm-cd__search" }, gc = ["placeholder"], fc = { class: "mm-cd__groups" }, Nc = { class: "mm-cd__ghead" }, Vc = ["onClick"], Ec = ["data-test"], $c = ["checked", "disabled", "onChange"], bc = {
  key: 0,
  class: "mm-cd__none"
}, hc = { class: "ss-muted" }, _c = {
  key: 2,
  class: "ss-note danger"
}, Bc = { class: "mm-cd__foot" }, Sc = { class: "ss-muted" }, Dc = ["disabled"], wc = /* @__PURE__ */ e.defineComponent({
  __name: "MeetingCreateDialog",
  props: {
    projectId: {}
  },
  emits: ["close", "created"],
  setup(l, { emit: u }) {
    const n = l, p = u, f = ["offline", "tencent", "zoom"], s = ie.useNotificationStore(), o = e.ref([]), d = e.ref({ depts: [], people: [] }), i = e.ref(!1), k = e.ref(""), h = e.ref(""), m = e.ref(!1), c = e.ref(""), g = e.ref(/* @__PURE__ */ new Set());
    function N() {
      const _ = /* @__PURE__ */ new Date();
      return _.setMinutes(0, 0, 0), _.setHours(_.getHours() + 1), _.getTime();
    }
    const a = e.reactive({
      projectId: n.projectId || "",
      title: "",
      time: al(N()),
      source: "offline",
      hostId: ne.value?.me?.person?.id || ""
    }), I = e.computed(() => Ct(d.value, c.value)), P = e.computed(() => {
      const _ = new Set(g.value);
      return a.hostId && _.add(a.hostId), d.value.people.filter((E) => _.has(E.id));
    }), U = e.computed(() => P.value.length);
    function M(_) {
      if (_ === a.hostId) return;
      const E = new Set(g.value);
      E.has(_) ? E.delete(_) : E.add(_), g.value = E;
    }
    function C(_) {
      const E = new Set(g.value), v = _.every((S) => E.has(S.id));
      for (const S of _)
        S.id !== a.hostId && (v ? E.delete(S.id) : E.add(S.id));
      g.value = E;
    }
    function T() {
      m.value || p("close");
    }
    function z(_) {
      _.key === "Escape" && T();
    }
    async function R() {
      if (m.value) return;
      h.value = "";
      const _ = sl(a.time);
      if (!a.projectId) {
        h.value = t.t("请选择所属项目");
        return;
      }
      if (!a.title.trim()) {
        h.value = t.t("请填写会议主题");
        return;
      }
      if (!Number.isFinite(_)) {
        h.value = t.t("请填写会议时间");
        return;
      }
      if (!a.hostId) {
        h.value = t.t("请选择主持人");
        return;
      }
      const E = [.../* @__PURE__ */ new Set([a.hostId, ...g.value])];
      if (E.length < 2) {
        h.value = t.t("请至少再选一位参会人");
        return;
      }
      m.value = !0;
      try {
        const v = await Y("meeting.create", {
          projectId: a.projectId,
          title: a.title.trim(),
          time: _,
          source: a.source,
          hostId: a.hostId,
          attendeeIds: E
        });
        s.success(t.t("会议已创建，下一步上传会议文件")), p("created", v.id);
      } catch (v) {
        h.value = Z.errorMessage(v);
      } finally {
        m.value = !1;
      }
    }
    return e.onMounted(async () => {
      document.addEventListener("keydown", z);
      try {
        const [_, E] = await Promise.all([
          Y("project.list", { status: "active" }),
          De()
        ]);
        o.value = (Array.isArray(_) ? _ : []).filter((v) => !v.status || v.status === "active"), d.value = E, !a.projectId && o.value.length === 1 && (a.projectId = o.value[0].id);
      } catch (_) {
        k.value = Z.errorMessage(_);
      } finally {
        i.value = !0;
      }
    }), e.onBeforeUnmount(() => document.removeEventListener("keydown", z)), (_, E) => (e.openBlock(), e.createBlock(e.Teleport, { to: "body" }, [
      e.createElementVNode("div", {
        class: "mm-dialog-overlay",
        role: "dialog",
        "aria-modal": "true",
        "aria-label": _.$t("创建会议"),
        "data-test": "mm-create-dialog",
        onClick: e.withModifiers(T, ["self"])
      }, [
        e.createElementVNode("section", Gi, [
          e.createElementVNode("header", Yi, [
            e.createElementVNode(
              "h3",
              null,
              e.toDisplayString(_.$t("创建会议")),
              1
              /* TEXT */
            ),
            e.createElementVNode("button", {
              type: "button",
              class: "mm-cd__x",
              title: _.$t("关闭"),
              onClick: T
            }, [...E[5] || (E[5] = [
              e.createElementVNode(
                "i",
                { class: "ri-close-line" },
                null,
                -1
                /* CACHED */
              )
            ])], 8, Ji)
          ]),
          e.createElementVNode("div", Qi, [
            k.value ? (e.openBlock(), e.createElementBlock("p", Zi, [
              E[6] || (E[6] = e.createElementVNode(
                "i",
                { class: "ri-error-warning-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(k.value),
                1
                /* TEXT */
              )
            ])) : i.value && !o.value.length ? (e.openBlock(), e.createElementBlock("p", Xi, [
              E[7] || (E[7] = e.createElementVNode(
                "i",
                { class: "ri-information-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(_.$t("没有进行中的项目：先在「项目」里新建项目（结项中、已归档的项目不能新建会议）。")),
                1
                /* TEXT */
              )
            ])) : e.createCommentVNode("v-if", !0),
            e.createElementVNode("label", xi, [
              e.createElementVNode("span", null, [
                e.createTextVNode(
                  e.toDisplayString(_.$t("所属项目")) + " ",
                  1
                  /* TEXT */
                ),
                E[8] || (E[8] = e.createElementVNode(
                  "b",
                  { class: "req" },
                  "*",
                  -1
                  /* CACHED */
                ))
              ]),
              e.withDirectives(e.createElementVNode(
                "select",
                {
                  "onUpdate:modelValue": E[0] || (E[0] = (v) => a.projectId = v),
                  "data-test": "mm-create-project"
                },
                [
                  e.createElementVNode(
                    "option",
                    ec,
                    e.toDisplayString(_.$t("选择项目")),
                    1
                    /* TEXT */
                  ),
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(o.value, (v) => (e.openBlock(), e.createElementBlock("option", {
                      key: v.id,
                      value: v.id
                    }, e.toDisplayString(v.name), 9, tc))),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ],
                512
                /* NEED_PATCH */
              ), [
                [e.vModelSelect, a.projectId]
              ])
            ]),
            e.createElementVNode("label", lc, [
              e.createElementVNode("span", null, [
                e.createTextVNode(
                  e.toDisplayString(_.$t("会议主题")) + " ",
                  1
                  /* TEXT */
                ),
                E[9] || (E[9] = e.createElementVNode(
                  "b",
                  { class: "req" },
                  "*",
                  -1
                  /* CACHED */
                ))
              ]),
              e.withDirectives(e.createElementVNode("input", {
                "onUpdate:modelValue": E[1] || (E[1] = (v) => a.title = v),
                type: "text",
                maxlength: "80",
                placeholder: _.$t("例如：A2 量产导入第 5 次周例会"),
                "data-test": "mm-create-title"
              }, null, 8, nc), [
                [e.vModelText, a.title]
              ])
            ]),
            e.createElementVNode("div", oc, [
              e.createElementVNode("label", ac, [
                e.createElementVNode("span", null, [
                  e.createTextVNode(
                    e.toDisplayString(_.$t("会议时间")) + " ",
                    1
                    /* TEXT */
                  ),
                  E[10] || (E[10] = e.createElementVNode(
                    "b",
                    { class: "req" },
                    "*",
                    -1
                    /* CACHED */
                  ))
                ]),
                e.withDirectives(e.createElementVNode(
                  "input",
                  {
                    "onUpdate:modelValue": E[2] || (E[2] = (v) => a.time = v),
                    type: "datetime-local",
                    "data-test": "mm-create-time"
                  },
                  null,
                  512
                  /* NEED_PATCH */
                ), [
                  [e.vModelText, a.time]
                ])
              ]),
              e.createElementVNode("div", sc, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(_.$t("来源")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode("div", rc, [
                  (e.openBlock(), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(f, (v) => e.createElementVNode("button", {
                      key: v,
                      type: "button",
                      role: "radio",
                      "aria-checked": a.source === v,
                      class: e.normalizeClass({ on: a.source === v }),
                      "data-test": `mm-create-source-${v}`,
                      onClick: (S) => a.source = v
                    }, e.toDisplayString(e.unref(nt)[v]), 11, ic)),
                    64
                    /* STABLE_FRAGMENT */
                  ))
                ])
              ])
            ]),
            e.createElementVNode("div", cc, [
              e.createElementVNode("span", null, [
                e.createTextVNode(
                  e.toDisplayString(_.$t("主持人")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "small",
                  dc,
                  e.toDisplayString(_.$t("（默认是你，可以改；主持人负责上传、指认、终审）")),
                  1
                  /* TEXT */
                )
              ]),
              e.createVNode(Oe, {
                modelValue: a.hostId,
                "onUpdate:modelValue": E[3] || (E[3] = (v) => a.hostId = v),
                people: d.value,
                "aria-label": _.$t("主持人"),
                "data-test": "mm-create-host"
              }, null, 8, ["modelValue", "people", "aria-label"])
            ]),
            e.createElementVNode("div", mc, [
              e.createElementVNode("span", null, [
                e.createTextVNode(
                  e.toDisplayString(_.$t("参会人")) + " ",
                  1
                  /* TEXT */
                ),
                E[11] || (E[11] = e.createElementVNode(
                  "b",
                  { class: "req" },
                  "*",
                  -1
                  /* CACHED */
                )),
                e.createElementVNode(
                  "small",
                  uc,
                  e.toDisplayString(_.$t("已选 {n} 人（主持人自动参会）", { n: U.value })),
                  1
                  /* TEXT */
                )
              ]),
              P.value.length ? (e.openBlock(), e.createElementBlock("div", pc, [
                (e.openBlock(!0), e.createElementBlock(
                  e.Fragment,
                  null,
                  e.renderList(P.value, (v) => (e.openBlock(), e.createElementBlock("span", {
                    key: v.id,
                    class: "mm-cd__chip"
                  }, [
                    e.createTextVNode(
                      e.toDisplayString(v.name) + " ",
                      1
                      /* TEXT */
                    ),
                    v.id !== a.hostId ? (e.openBlock(), e.createElementBlock("button", {
                      key: 0,
                      type: "button",
                      title: _.$t("移除"),
                      onClick: (S) => M(v.id)
                    }, [...E[12] || (E[12] = [
                      e.createElementVNode(
                        "i",
                        { class: "ri-close-line" },
                        null,
                        -1
                        /* CACHED */
                      )
                    ])], 8, vc)) : e.createCommentVNode("v-if", !0)
                  ]))),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ])) : e.createCommentVNode("v-if", !0),
              e.createElementVNode("div", kc, [
                e.createElementVNode("label", yc, [
                  E[13] || (E[13] = e.createElementVNode(
                    "i",
                    {
                      class: "ri-search-line",
                      "aria-hidden": "true"
                    },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.withDirectives(e.createElementVNode("input", {
                    "onUpdate:modelValue": E[4] || (E[4] = (v) => c.value = v),
                    type: "search",
                    placeholder: _.$t("搜索姓名、职务"),
                    "data-test": "mm-create-search"
                  }, null, 8, gc), [
                    [e.vModelText, c.value]
                  ])
                ]),
                e.createElementVNode("div", fc, [
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(I.value, (v) => (e.openBlock(), e.createElementBlock("div", {
                      key: v.id,
                      class: "mm-cd__group"
                    }, [
                      e.createElementVNode("div", Nc, [
                        e.createElementVNode(
                          "b",
                          null,
                          e.toDisplayString(v.name),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "small",
                          null,
                          e.toDisplayString(v.people.length),
                          1
                          /* TEXT */
                        ),
                        E[14] || (E[14] = e.createElementVNode(
                          "span",
                          { class: "mm-grow" },
                          null,
                          -1
                          /* CACHED */
                        )),
                        e.createElementVNode("button", {
                          type: "button",
                          class: "ss-link",
                          onClick: (S) => C(v.people)
                        }, e.toDisplayString(v.people.every((S) => g.value.has(S.id)) ? _.$t("取消全选") : _.$t("全选")), 9, Vc)
                      ]),
                      (e.openBlock(!0), e.createElementBlock(
                        e.Fragment,
                        null,
                        e.renderList(v.people, (S) => (e.openBlock(), e.createElementBlock("label", {
                          key: S.id,
                          class: "mm-cd__person",
                          "data-test": `mm-create-person-${S.id}`
                        }, [
                          e.createElementVNode("input", {
                            type: "checkbox",
                            checked: g.value.has(S.id) || S.id === a.hostId,
                            disabled: S.id === a.hostId,
                            onChange: (j) => M(S.id)
                          }, null, 40, $c),
                          e.createElementVNode(
                            "span",
                            {
                              class: "mm-av",
                              style: e.normalizeStyle({ background: e.unref(re)(S.name).color })
                            },
                            e.toDisplayString(e.unref(re)(S.name).text),
                            5
                            /* TEXT, STYLE */
                          ),
                          e.createElementVNode(
                            "span",
                            null,
                            e.toDisplayString(S.name),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "small",
                            null,
                            e.toDisplayString(S.title || ""),
                            1
                            /* TEXT */
                          )
                        ], 8, Ec))),
                        128
                        /* KEYED_FRAGMENT */
                      ))
                    ]))),
                    128
                    /* KEYED_FRAGMENT */
                  )),
                  i.value && !I.value.length ? (e.openBlock(), e.createElementBlock(
                    "p",
                    bc,
                    e.toDisplayString(c.value.trim() ? _.$t("没有找到这个人") : _.$t("组织里还没有人员")),
                    1
                    /* TEXT */
                  )) : e.createCommentVNode("v-if", !0)
                ])
              ]),
              e.createElementVNode("small", hc, [
                E[15] || (E[15] = e.createElementVNode(
                  "i",
                  { class: "ri-information-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  " " + e.toDisplayString(_.$t("找不到人员请联系管理员同步通讯录")),
                  1
                  /* TEXT */
                )
              ])
            ]),
            h.value ? (e.openBlock(), e.createElementBlock("p", _c, [
              E[16] || (E[16] = e.createElementVNode(
                "i",
                { class: "ri-error-warning-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(h.value),
                1
                /* TEXT */
              )
            ])) : e.createCommentVNode("v-if", !0)
          ]),
          e.createElementVNode("footer", Bc, [
            e.createElementVNode(
              "span",
              Sc,
              e.toDisplayString(_.$t("创建后在会议详情里上传录音、录屏或文字记录")),
              1
              /* TEXT */
            ),
            E[17] || (E[17] = e.createElementVNode(
              "span",
              { class: "mm-grow" },
              null,
              -1
              /* CACHED */
            )),
            e.createElementVNode(
              "button",
              {
                type: "button",
                class: "ss-btn",
                onClick: T
              },
              e.toDisplayString(_.$t("取消")),
              1
              /* TEXT */
            ),
            e.createElementVNode("button", {
              type: "button",
              class: "ss-btn primary",
              disabled: m.value,
              "data-test": "mm-create-submit",
              onClick: R
            }, [
              e.createElementVNode(
                "i",
                {
                  class: e.normalizeClass(m.value ? "ri-loader-4-line spin" : "ri-add-line")
                },
                null,
                2
                /* CLASS */
              ),
              e.createTextVNode(
                e.toDisplayString(_.$t("创建会议")),
                1
                /* TEXT */
              )
            ], 8, Dc)
          ])
        ])
      ], 8, Wi)
    ]));
  }
}), Ft = /* @__PURE__ */ oe(wc, [["__scopeId", "data-v-b8a4a4be"]]), Cc = {
  class: "mm-meetings",
  "data-test": "mm-meetings"
}, Tc = { class: "mm-meetings__head" }, Ic = { class: "mm-search" }, Mc = ["placeholder"], Ac = {
  key: 0,
  class: "ss-note danger"
}, jc = { class: "mm-meetings__grid" }, Lc = { class: "mm-mlist" }, zc = { class: "mm-chips" }, Fc = ["data-test", "onClick"], Pc = {
  key: 0,
  class: "mm-mlist__state"
}, Uc = {
  key: 1,
  class: "mm-mlist__empty"
}, Oc = {
  key: 0,
  class: "mm-mlist__group"
}, Rc = ["data-test", "onClick"], qc = { class: "mm-mcard__title" }, Kc = ["title"], Hc = { class: "mm-mcard__meta" }, Wc = {
  key: 1,
  class: "mm-placeholder"
}, Gc = /* @__PURE__ */ e.defineComponent({
  __name: "MeetingsTab",
  emits: ["role"],
  setup(l, { expose: u, emit: n }) {
    const p = [
      { key: "all", title: t.t("全部") },
      { key: "todo", title: t.t("待我处理") },
      { key: "processing", title: t.t("处理中") },
      { key: "final", title: t.t("已定稿") }
    ], f = n, s = e.ref("all"), o = e.ref(""), d = e.ref(!1), i = e.ref(""), k = e.ref(!1), h = e.ref(ft.value), m = e.ref(null), c = e.ref(null), g = e.reactive({ all: [], todo: [], processing: [], final: [] }), N = e.computed(() => ({ all: g.all.length, todo: g.todo.length, processing: g.processing.length, final: g.final.length })), a = e.computed(() => g[s.value]), I = e.computed(() => [
      { key: "mine", title: t.t("需要我处理"), items: a.value.filter((E) => E.needsMe) },
      { key: "other", title: t.t("其他"), items: a.value.filter((E) => !E.needsMe) }
    ]);
    let P = 0, U = "";
    async function M() {
      const E = ++P;
      d.value = !0;
      try {
        const v = o.value.trim(), S = await Promise.all(p.map((J) => Y("meeting.list", { filter: J.key, ...v ? { q: v } : {} })));
        if (E !== P) return;
        p.forEach((J, y) => {
          g[J.key] = Array.isArray(S[y]) ? S[y] : [];
        }), i.value = "";
        const j = !g.all.some((J) => J.id === h.value) && !v && h.value !== U;
        if (!h.value || j) {
          const J = g.all.find((y) => y.needsMe) || g.all[0];
          J ? T(J.id) : h.value = "";
        }
      } catch (v) {
        E === P && (i.value = Z.errorMessage(v));
      } finally {
        E === P && (d.value = !1);
      }
    }
    async function C() {
      await Promise.all([M(), c.value?.refresh?.()]);
    }
    function T(E) {
      E !== h.value && (m.value = null), h.value = E, ft.value = E;
    }
    function z(E) {
      k.value = !1, s.value = "all", o.value = "", T(E), M();
    }
    function R() {
      const E = ye.value;
      E.tab !== "meetings" || !E.link || E.link.kind !== "meeting" && E.link.kind !== "meeting_plan" || (g.all.some((v) => v.id === E.link.id) || (s.value = "all", o.value = ""), U = E.link.id, T(E.link.id), m.value = { tab: E.link.kind === "meeting_plan" ? "plan" : void 0, anchor: E.link.anchor, seq: E.seq });
    }
    e.watch(() => ye.value.seq, R);
    let _ = null;
    return e.watch(o, () => {
      _ && clearTimeout(_), _ = setTimeout(() => {
        _ = null, M();
      }, 250);
    }), e.onMounted(() => {
      R(), st.value && (st.value = !1, k.value = !0), M();
    }), e.onBeforeUnmount(() => {
      _ && clearTimeout(_);
    }), u({ refresh: C }), (E, v) => (e.openBlock(), e.createElementBlock("div", Cc, [
      e.createElementVNode("header", Tc, [
        e.createElementVNode(
          "h2",
          null,
          e.toDisplayString(E.$t("会议")),
          1
          /* TEXT */
        ),
        e.createElementVNode(
          "p",
          null,
          e.toDisplayString(E.$t("上传会议文件后自动转写、识别发言人、整理纪要")),
          1
          /* TEXT */
        ),
        v[7] || (v[7] = e.createElementVNode(
          "span",
          { class: "mm-grow" },
          null,
          -1
          /* CACHED */
        )),
        e.createElementVNode("label", Ic, [
          v[5] || (v[5] = e.createElementVNode(
            "i",
            {
              class: "ri-search-line",
              "aria-hidden": "true"
            },
            null,
            -1
            /* CACHED */
          )),
          e.withDirectives(e.createElementVNode("input", {
            "onUpdate:modelValue": v[0] || (v[0] = (S) => o.value = S),
            type: "search",
            placeholder: E.$t("搜索会议、项目"),
            "data-test": "mm-meeting-search"
          }, null, 8, Mc), [
            [e.vModelText, o.value]
          ])
        ]),
        e.createElementVNode("button", {
          type: "button",
          class: "mm-btn primary",
          "data-test": "mm-meeting-create",
          onClick: v[1] || (v[1] = (S) => k.value = !0)
        }, [
          v[6] || (v[6] = e.createElementVNode(
            "i",
            { class: "ri-add-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            e.toDisplayString(E.$t("创建会议")),
            1
            /* TEXT */
          )
        ])
      ]),
      i.value ? (e.openBlock(), e.createElementBlock("p", Ac, [
        v[8] || (v[8] = e.createElementVNode(
          "i",
          { class: "ri-error-warning-line" },
          null,
          -1
          /* CACHED */
        )),
        e.createElementVNode(
          "span",
          null,
          e.toDisplayString(i.value),
          1
          /* TEXT */
        ),
        e.createElementVNode(
          "button",
          {
            type: "button",
            class: "ss-link",
            onClick: C
          },
          e.toDisplayString(E.$t("重试")),
          1
          /* TEXT */
        )
      ])) : e.createCommentVNode("v-if", !0),
      e.createElementVNode("div", jc, [
        e.createElementVNode("aside", Lc, [
          e.createElementVNode("div", zc, [
            (e.openBlock(), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(p, (S) => e.createElementVNode("button", {
                key: S.key,
                type: "button",
                class: e.normalizeClass(["mm-chip", { on: s.value === S.key }]),
                "data-test": `mm-meeting-filter-${S.key}`,
                onClick: (j) => s.value = S.key
              }, [
                e.createTextVNode(
                  e.toDisplayString(S.title) + " ",
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(N.value[S.key]),
                  1
                  /* TEXT */
                )
              ], 10, Fc)),
              64
              /* STABLE_FRAGMENT */
            ))
          ]),
          d.value && !g.all.length ? (e.openBlock(), e.createElementBlock("p", Pc, [
            v[9] || (v[9] = e.createElementVNode(
              "i",
              { class: "ri-loader-4-line spin" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(E.$t("正在加载会议…")),
              1
              /* TEXT */
            )
          ])) : a.value.length ? (e.openBlock(!0), e.createElementBlock(
            e.Fragment,
            { key: 2 },
            e.renderList(I.value, (S) => (e.openBlock(), e.createElementBlock(
              e.Fragment,
              {
                key: S.key
              },
              [
                S.items.length ? (e.openBlock(), e.createElementBlock("div", Oc, [
                  e.createElementVNode(
                    "span",
                    null,
                    e.toDisplayString(S.title),
                    1
                    /* TEXT */
                  ),
                  v[10] || (v[10] = e.createElementVNode(
                    "i",
                    null,
                    null,
                    -1
                    /* CACHED */
                  ))
                ])) : e.createCommentVNode("v-if", !0),
                (e.openBlock(!0), e.createElementBlock(
                  e.Fragment,
                  null,
                  e.renderList(S.items, (j) => (e.openBlock(), e.createElementBlock("button", {
                    key: j.id,
                    type: "button",
                    class: e.normalizeClass(["mm-mcard", { on: j.id === h.value }]),
                    "data-test": `mm-meeting-${j.id}`,
                    onClick: (J) => T(j.id)
                  }, [
                    e.createElementVNode("span", qc, [
                      e.createTextVNode(
                        e.toDisplayString(j.title),
                        1
                        /* TEXT */
                      ),
                      j.needsMe ? (e.openBlock(), e.createElementBlock("i", {
                        key: 0,
                        class: "mm-mcard__dot",
                        title: E.$t("需要我处理")
                      }, null, 8, Kc)) : e.createCommentVNode("v-if", !0)
                    ]),
                    e.createElementVNode("span", Hc, [
                      e.createElementVNode(
                        "small",
                        null,
                        e.toDisplayString(j.projectName) + " · " + e.toDisplayString(e.unref(Tt)(j.time)),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "span",
                        {
                          class: e.normalizeClass(["mm-tag", e.unref(ut)[j.status]])
                        },
                        e.toDisplayString(j.confirmText || e.unref(Xe)[j.status]),
                        3
                        /* TEXT, CLASS */
                      )
                    ])
                  ], 10, Rc))),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ],
              64
              /* STABLE_FRAGMENT */
            ))),
            128
            /* KEYED_FRAGMENT */
          )) : (e.openBlock(), e.createElementBlock("div", Uc, [
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(o.value.trim() ? E.$t("没有找到匹配的会议") : s.value === "all" ? E.$t("还没有参加过会议") : E.$t("这个筛选下没有会议")),
              1
              /* TEXT */
            ),
            s.value === "all" && !o.value.trim() ? (e.openBlock(), e.createElementBlock(
              "button",
              {
                key: 0,
                type: "button",
                class: "ss-link",
                onClick: v[2] || (v[2] = (S) => k.value = !0)
              },
              e.toDisplayString(E.$t("新建会议")),
              1
              /* TEXT */
            )) : e.createCommentVNode("v-if", !0)
          ]))
        ]),
        h.value ? (e.openBlock(), e.createBlock(Hi, {
          key: h.value,
          ref_key: "detailRef",
          ref: c,
          "meeting-id": h.value,
          focus: m.value,
          onChanged: M,
          onRole: v[3] || (v[3] = (S) => f("role", S))
        }, null, 8, ["meeting-id", "focus"])) : (e.openBlock(), e.createElementBlock("section", Wc, [
          v[11] || (v[11] = e.createElementVNode(
            "i",
            {
              class: "ri-file-list-3-line",
              "aria-hidden": "true"
            },
            null,
            -1
            /* CACHED */
          )),
          e.createElementVNode(
            "p",
            null,
            e.toDisplayString(g.all.length ? E.$t("选择左侧的会议查看详情") : E.$t("新建一场会议，上传录音或文字记录后自动整理纪要")),
            1
            /* TEXT */
          )
        ]))
      ]),
      k.value ? (e.openBlock(), e.createBlock(Ft, {
        key: 1,
        onClose: v[4] || (v[4] = (S) => k.value = !1),
        onCreated: z
      })) : e.createCommentVNode("v-if", !0)
    ]));
  }
}), Yc = /* @__PURE__ */ oe(Gc, [["__scopeId", "data-v-fbe808c5"]]), Jc = ["title"], Qc = { class: "mm-pc__name" }, Zc = { class: "mm-pc__dept" }, Xc = /* @__PURE__ */ e.defineComponent({
  __name: "PersonChip",
  props: {
    name: {},
    dept: {},
    plain: { type: Boolean }
  },
  setup(l) {
    const u = l, n = e.computed(() => re(u.name));
    return (p, f) => (e.openBlock(), e.createElementBlock("span", {
      class: e.normalizeClass(["mm-pc", { plain: l.plain }]),
      title: l.dept ? `${l.name} · ${l.dept}` : l.name
    }, [
      e.createElementVNode(
        "i",
        {
          class: "mm-pc__av",
          style: e.normalizeStyle({ background: n.value.color }),
          "aria-hidden": "true"
        },
        e.toDisplayString(n.value.text),
        5
        /* TEXT, STYLE */
      ),
      e.createElementVNode(
        "span",
        Qc,
        e.toDisplayString(l.name || "—"),
        1
        /* TEXT */
      ),
      l.dept ? (e.openBlock(), e.createElementBlock(
        e.Fragment,
        { key: 0 },
        [
          f[0] || (f[0] = e.createElementVNode(
            "span",
            {
              class: "mm-pc__dot",
              "aria-hidden": "true"
            },
            "·",
            -1
            /* CACHED */
          )),
          e.createElementVNode(
            "span",
            Zc,
            e.toDisplayString(l.dept),
            1
            /* TEXT */
          )
        ],
        64
        /* STABLE_FRAGMENT */
      )) : e.createCommentVNode("v-if", !0)
    ], 10, Jc));
  }
}), ze = /* @__PURE__ */ oe(Xc, [["__scopeId", "data-v-4f4c03f2"]]), xc = { class: "mm-tt" }, ed = {
  class: "mm-tt__head",
  "aria-hidden": "true"
}, td = {
  key: 0,
  class: "mm-tt__empty"
}, ld = { class: "mm-tt__group" }, nd = ["data-test", "onClick"], od = ["data-test", "onClick"], ad = { class: "mm-tt__title" }, sd = { key: 0 }, rd = { class: "mm-tt__prog" }, id = /* @__PURE__ */ e.defineComponent({
  __name: "TaskTable",
  props: {
    tasks: {},
    groupBy: { default: "status" },
    selectedId: { default: "" },
    showProject: { type: Boolean, default: !1 },
    emptyText: { default: "" }
  },
  emits: ["select"],
  setup(l, { emit: u }) {
    const n = l, p = u, f = e.computed(() => $l(n.tasks, n.groupBy)), s = e.reactive({}), o = (i) => (i.key in s ? s[i.key] : i.collapsedByDefault) && !(n.selectedId && i.tasks.some((k) => k.id === n.selectedId) && !(i.key in s));
    function d(i) {
      s[i.key] = !o(i);
    }
    return (i, k) => (e.openBlock(), e.createElementBlock("div", xc, [
      e.createElementVNode("div", ed, [
        e.createElementVNode(
          "span",
          null,
          e.toDisplayString(i.$t("任务")),
          1
          /* TEXT */
        ),
        e.createElementVNode(
          "span",
          null,
          e.toDisplayString(i.$t("部门负责人")),
          1
          /* TEXT */
        ),
        e.createElementVNode(
          "span",
          null,
          e.toDisplayString(i.$t("截止")),
          1
          /* TEXT */
        ),
        e.createElementVNode(
          "span",
          null,
          e.toDisplayString(i.$t("进度")),
          1
          /* TEXT */
        ),
        e.createElementVNode(
          "span",
          null,
          e.toDisplayString(i.$t("状态")),
          1
          /* TEXT */
        )
      ]),
      f.value.length ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock(
        "p",
        td,
        e.toDisplayString(l.emptyText || i.$t("没有任务")),
        1
        /* TEXT */
      )),
      (e.openBlock(!0), e.createElementBlock(
        e.Fragment,
        null,
        e.renderList(f.value, (h) => (e.openBlock(), e.createElementBlock(
          e.Fragment,
          {
            key: h.key
          },
          [
            e.createElementVNode("div", ld, [
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(h.title) + " · " + e.toDisplayString(h.tasks.length),
                1
                /* TEXT */
              ),
              h.collapsedByDefault || s[h.key] ? (e.openBlock(), e.createElementBlock("button", {
                key: 0,
                type: "button",
                class: "mm-tt__fold",
                "data-test": `mm-tt-fold-${h.key}`,
                onClick: (m) => d(h)
              }, [
                e.createTextVNode(
                  e.toDisplayString(o(h) ? i.$t("展开") : i.$t("收起")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "i",
                  {
                    class: e.normalizeClass(o(h) ? "ri-arrow-down-s-line" : "ri-arrow-up-s-line"),
                    "aria-hidden": "true"
                  },
                  null,
                  2
                  /* CLASS */
                )
              ], 8, nd)) : e.createCommentVNode("v-if", !0)
            ]),
            o(h) ? e.createCommentVNode("v-if", !0) : (e.openBlock(!0), e.createElementBlock(
              e.Fragment,
              { key: 0 },
              e.renderList(h.tasks, (m) => (e.openBlock(), e.createElementBlock("button", {
                key: m.id,
                type: "button",
                class: e.normalizeClass(["mm-tt__row", { on: m.id === l.selectedId, ended: m.status === "done" || m.status === "cancelled" }]),
                "data-test": `mm-task-row-${m.id}`,
                onClick: (c) => p("select", m)
              }, [
                e.createElementVNode("span", ad, [
                  e.createElementVNode(
                    "strong",
                    null,
                    e.toDisplayString(m.title),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "small",
                    null,
                    e.toDisplayString(l.showProject ? `${m.projectName} · ${m.meetingTitle}` : m.meetingTitle),
                    1
                    /* TEXT */
                  )
                ]),
                e.createElementVNode("span", null, [
                  e.createVNode(ze, {
                    name: m.assigneeName,
                    dept: m.deptName
                  }, null, 8, ["name", "dept"])
                ]),
                e.createElementVNode(
                  "span",
                  {
                    class: e.normalizeClass(["mm-tt__due", { bad: m.overdue }])
                  },
                  [
                    e.createTextVNode(
                      e.toDisplayString(e.unref(mt)(m.due)) + " ",
                      1
                      /* TEXT */
                    ),
                    m.overdue && m.overdueDays > 0 ? (e.openBlock(), e.createElementBlock(
                      "small",
                      sd,
                      e.toDisplayString(i.$t("逾期 {n} 天", { n: m.overdueDays })),
                      1
                      /* TEXT */
                    )) : e.createCommentVNode("v-if", !0)
                  ],
                  2
                  /* CLASS */
                ),
                e.createElementVNode("span", rd, [
                  e.createElementVNode(
                    "i",
                    {
                      class: e.normalizeClass(["mm-bar", { bad: m.overdue }])
                    },
                    [
                      e.createElementVNode(
                        "b",
                        {
                          style: e.normalizeStyle({ width: `${e.unref(fe)(m.percent)}%` })
                        },
                        null,
                        4
                        /* STYLE */
                      )
                    ],
                    2
                    /* CLASS */
                  ),
                  e.createElementVNode(
                    "em",
                    null,
                    e.toDisplayString(e.unref(fe)(m.percent)) + "%",
                    1
                    /* TEXT */
                  )
                ]),
                e.createElementVNode("span", null, [
                  e.createElementVNode(
                    "span",
                    {
                      class: e.normalizeClass(["mm-tag", e.unref(At)(m)])
                    },
                    e.toDisplayString(e.unref(Nl)(m)),
                    3
                    /* TEXT, CLASS */
                  )
                ])
              ], 10, od))),
              128
              /* KEYED_FRAGMENT */
            ))
          ],
          64
          /* STABLE_FRAGMENT */
        ))),
        128
        /* KEYED_FRAGMENT */
      ))
    ]));
  }
}), Pt = /* @__PURE__ */ oe(id, [["__scopeId", "data-v-f1ba1ed1"]]), $e = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/composables/useDialog.ts"];
if (!$e) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/composables/useDialog.ts");
$e.default;
const cd = {
  class: "mm-ob",
  "data-test": "mm-objection-panel"
}, dd = {
  key: 0,
  class: "ss-note danger"
}, md = { class: "mm-ob__title" }, ud = { class: "ss-chip" }, pd = { class: "mm-ob__sides" }, vd = {
  class: "mm-ob__side raiser",
  "data-test": "mm-ob-raiser"
}, kd = {
  key: 0,
  class: "strong"
}, yd = {
  class: "mm-ob__side owner",
  "data-test": "mm-ob-owner"
}, gd = {
  key: 0,
  class: "strong"
}, fd = {
  key: 1,
  class: "muted"
}, Nd = { key: 2 }, Vd = {
  key: 0,
  class: "mm-ob__box",
  "data-test": "mm-ob-review"
}, Ed = { class: "sub" }, $d = { class: "mm-ob__btns" }, bd = ["disabled"], hd = ["disabled"], _d = ["disabled"], Bd = {
  key: 1,
  class: "mm-ob__box",
  "data-test": "mm-ob-reply"
}, Sd = { class: "sub" }, Dd = { class: "mm-ob__btns" }, wd = ["disabled"], Cd = ["disabled"], Td = {
  key: 2,
  class: "mm-ob__box",
  "data-test": "mm-ob-arbitrate"
}, Id = { class: "sub" }, Md = { class: "mm-ob__btns" }, Ad = ["disabled"], jd = ["disabled"], Ld = ["disabled"], zd = {
  key: 3,
  class: "ss-note info"
}, Fd = {
  key: 4,
  class: "mm-ob__form",
  "data-test": "mm-ob-form"
}, Pd = { class: "ss-muted" }, Ud = { class: "ss-field" }, Od = { class: "ss-field" }, Rd = { class: "ss-field" }, qd = { class: "ss-field" }, Kd = ["placeholder"], Hd = { class: "ss-actions" }, Wd = ["disabled"], Gd = {
  key: 2,
  class: "ss-empty"
}, Yd = {
  key: 3,
  class: "mm-ob__hist"
}, Jd = { class: "ss-chip" }, Qd = { class: "mm-ob__log" }, Zd = {
  key: 0,
  class: "ss-muted"
}, Xd = {
  key: 1,
  class: "mm-tl",
  "data-test": "mm-ob-log"
}, xd = /* @__PURE__ */ e.defineComponent({
  __name: "ObjectionPanel",
  props: {
    task: {},
    can: {},
    names: {}
  },
  emits: ["changed"],
  setup(l, { emit: u }) {
    const n = l, p = u, f = {
      review_adopt: t.t("采纳并调整"),
      review_reject: t.t("驳回并说明"),
      arb_keep: t.t("维持原方案"),
      arb_adjust: t.t("按异议调整")
    }, s = $e.useDialog(), o = ie.useNotificationStore(), d = e.ref(!1), i = e.ref(""), k = e.ref(""), h = e.ref(""), m = e.reactive({ title: "", standard: "", due: "" }), c = e.computed(() => Ce(n.task) ? n.task.objection : null), g = e.computed(() => it(n.names, c.value?.raisedBy, n.task.assigneeName)), N = e.computed(() => {
      const _ = c.value?.review;
      return _ ? _.decision === "adopt" ? t.t("已采纳") : t.t("已驳回") : t.t("待复核");
    }), a = e.computed(() => !!(n.can.review || n.can.reply || n.can.escalate || n.can.arbitrate)), I = e.computed(() => {
      const _ = c.value?.stage;
      return _ === "review" ? t.t("等待任务负责人 {name} 复核", { name: n.task.ownerName }) : _ === "dept_reply" ? t.t("任务负责人已驳回，等待部门负责人 {name} 接受驳回或提交裁决", { name: g.value }) : _ === "arbitration" ? t.t("已提交裁决，等待项目负责人裁决") : "";
    }), P = e.computed(() => [...n.task.objectionHistory ?? []].sort((_, E) => (E.resolvedAt || E.raisedAt) - (_.resolvedAt || _.raisedAt))), U = e.computed(() => Sl(n.task.events));
    e.watch(() => [n.task.id, c.value?.stage], () => {
      k.value = "", i.value = "";
    });
    function M(_) {
      Object.assign(m, Cl(n.task)), h.value = "", k.value = _;
    }
    async function C(_, E, v) {
      d.value = !0, i.value = "";
      try {
        return await Y(_, E), o.success(v), k.value = "", p("changed"), !0;
      } catch (S) {
        return i.value = Z.errorMessage(S), !1;
      } finally {
        d.value = !1;
      }
    }
    async function T() {
      const _ = n.task.id, E = h.value.trim(), v = wl(m, n.task);
      switch (k.value) {
        case "review_adopt":
          await C("task.objection.review", { id: _, decision: "adopt", note: E, changes: v }, t.t("已采纳，任务回到待接收，等待部门负责人重新确认"));
          break;
        case "review_reject":
          await C("task.objection.review", { id: _, decision: "reject", note: E }, t.t("已驳回，等待部门负责人回应"));
          break;
        case "arb_keep":
          await C("task.objection.arbitrate", { id: _, decision: "keep", note: E }, t.t("已裁决：维持原方案"));
          break;
        case "arb_adjust":
          await C("task.objection.arbitrate", { id: _, decision: "adjust", note: E, changes: v }, t.t("已裁决：按异议调整"));
          break;
      }
    }
    async function z(_) {
      await s.confirm(_ === "accept" ? { title: t.t("接受驳回"), message: t.t("接受后异议结束，任务回到发起前的状态，按原方案执行。") } : { title: t.t("提交裁决"), message: t.t("提交后由项目负责人裁决，裁决结果为最终结果。") }) && await C("task.objection.reply", { id: n.task.id, decision: _ }, _ === "accept" ? t.t("已接受驳回") : t.t("已提交项目负责人裁决"));
    }
    async function R(_) {
      const E = await s.prompt({
        title: t.t("删除该任务"),
        message: t.t("删除后任务变为「已取消」（终态，结项时视同完成），并通知相关负责人。请写明原因："),
        placeholder: t.t("例如：该事项已并入其它任务"),
        confirmLabel: t.t("删除任务")
      });
      if (E === null) return;
      const v = E.trim() || t.t("删除该任务");
      _ === "review" ? await C("task.objection.review", { id: n.task.id, decision: "adopt", note: v, changes: { cancel: !0 } }, t.t("任务已删除")) : await C("task.objection.arbitrate", { id: n.task.id, decision: "adjust", note: v, changes: { cancel: !0 } }, t.t("任务已删除"));
    }
    return (_, E) => (e.openBlock(), e.createElementBlock("div", cd, [
      i.value ? (e.openBlock(), e.createElementBlock("p", dd, [
        E[13] || (E[13] = e.createElementVNode(
          "i",
          { class: "ri-error-warning-line" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(i.value),
          1
          /* TEXT */
        )
      ])) : e.createCommentVNode("v-if", !0),
      c.value ? (e.openBlock(), e.createElementBlock(
        e.Fragment,
        { key: 1 },
        [
          e.createElementVNode("h4", md, [
            e.createTextVNode(
              e.toDisplayString(_.$t("当前分歧：{t}", { t: e.unref(ot)[c.value.target] })) + " ",
              1
              /* TEXT */
            ),
            e.createElementVNode(
              "span",
              ud,
              e.toDisplayString(c.value.kind === "change" ? _.$t("执行中申请变更") : _.$t("接收时提出异议")),
              1
              /* TEXT */
            )
          ]),
          e.createElementVNode("div", pd, [
            e.createElementVNode("article", vd, [
              e.createElementVNode("header", null, [
                e.createElementVNode(
                  "i",
                  {
                    class: "av",
                    style: e.normalizeStyle({ background: e.unref(re)(g.value).color }),
                    "aria-hidden": "true"
                  },
                  e.toDisplayString(e.unref(re)(g.value).text),
                  5
                  /* TEXT, STYLE */
                ),
                e.createElementVNode(
                  "b",
                  null,
                  e.toDisplayString(g.value),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "small",
                  null,
                  e.toDisplayString(_.$t("部门负责人")),
                  1
                  /* TEXT */
                )
              ]),
              e.createElementVNode(
                "p",
                null,
                e.toDisplayString(c.value.reason),
                1
                /* TEXT */
              ),
              c.value.suggestion || c.value.suggestedDue ? (e.openBlock(), e.createElementBlock("p", kd, [
                e.createTextVNode(
                  e.toDisplayString(c.value.suggestion),
                  1
                  /* TEXT */
                ),
                c.value.suggestedDue ? (e.openBlock(), e.createElementBlock(
                  e.Fragment,
                  { key: 0 },
                  [
                    e.createTextVNode(
                      e.toDisplayString(c.value.suggestion ? _.$t("，") : "") + e.toDisplayString(_.$t("建议截止调整为 {d}", { d: e.unref(mt)(c.value.suggestedDue) })),
                      1
                      /* TEXT */
                    )
                  ],
                  64
                  /* STABLE_FRAGMENT */
                )) : e.createCommentVNode("v-if", !0)
              ])) : e.createCommentVNode("v-if", !0),
              e.createElementVNode(
                "time",
                null,
                e.toDisplayString(e.unref(Pe)(c.value.raisedAt)),
                1
                /* TEXT */
              )
            ]),
            e.createElementVNode("article", yd, [
              e.createElementVNode("header", null, [
                e.createElementVNode(
                  "i",
                  {
                    class: "av",
                    style: e.normalizeStyle({ background: e.unref(re)(l.task.ownerName).color }),
                    "aria-hidden": "true"
                  },
                  e.toDisplayString(e.unref(re)(l.task.ownerName).text),
                  5
                  /* TEXT, STYLE */
                ),
                e.createElementVNode(
                  "b",
                  null,
                  e.toDisplayString(l.task.ownerName),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "small",
                  null,
                  e.toDisplayString(N.value),
                  1
                  /* TEXT */
                )
              ]),
              c.value.review ? (e.openBlock(), e.createElementBlock(
                "p",
                gd,
                e.toDisplayString(c.value.review.note || "—"),
                1
                /* TEXT */
              )) : (e.openBlock(), e.createElementBlock(
                "p",
                fd,
                e.toDisplayString(_.$t("还没有复核意见")),
                1
                /* TEXT */
              )),
              c.value.review ? (e.openBlock(), e.createElementBlock(
                "time",
                Nd,
                e.toDisplayString(e.unref(Pe)(c.value.review.at)),
                1
                /* TEXT */
              )) : e.createCommentVNode("v-if", !0)
            ])
          ]),
          e.createCommentVNode(" 任务负责人复核 "),
          l.can.review ? (e.openBlock(), e.createElementBlock("section", Vd, [
            e.createElementVNode(
              "h5",
              null,
              e.toDisplayString(_.$t("你的复核")),
              1
              /* TEXT */
            ),
            e.createElementVNode(
              "p",
              Ed,
              e.toDisplayString(_.$t("采纳后任务回到待接收，由部门负责人重新确认；驳回后由部门负责人决定接受驳回还是提交裁决")),
              1
              /* TEXT */
            ),
            e.createElementVNode("div", $d, [
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn",
                disabled: d.value,
                "data-test": "mm-ob-reject",
                onClick: E[0] || (E[0] = (v) => M("review_reject"))
              }, e.toDisplayString(_.$t("驳回并说明")), 9, bd),
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn primary",
                disabled: d.value,
                "data-test": "mm-ob-adopt",
                onClick: E[1] || (E[1] = (v) => M("review_adopt"))
              }, e.toDisplayString(_.$t("采纳并调整")), 9, hd)
            ]),
            e.createElementVNode("button", {
              type: "button",
              class: "ss-link more",
              disabled: d.value,
              "data-test": "mm-ob-delete-review",
              onClick: E[2] || (E[2] = (v) => R("review"))
            }, [
              e.createTextVNode(
                e.toDisplayString(_.$t("更多：删除该任务")) + " ",
                1
                /* TEXT */
              ),
              E[14] || (E[14] = e.createElementVNode(
                "i",
                { class: "ri-arrow-right-s-line" },
                null,
                -1
                /* CACHED */
              ))
            ], 8, _d)
          ])) : e.createCommentVNode("v-if", !0),
          e.createCommentVNode(" 部门负责人回应驳回 "),
          l.can.reply || l.can.escalate ? (e.openBlock(), e.createElementBlock("section", Bd, [
            e.createElementVNode(
              "h5",
              null,
              e.toDisplayString(_.$t("任务负责人驳回了你的异议")),
              1
              /* TEXT */
            ),
            e.createElementVNode(
              "p",
              Sd,
              e.toDisplayString(_.$t("接受驳回则回到发起前的状态按原方案执行；不接受可以提交项目负责人裁决")),
              1
              /* TEXT */
            ),
            e.createElementVNode("div", Dd, [
              l.can.reply ? (e.openBlock(), e.createElementBlock("button", {
                key: 0,
                type: "button",
                class: "ss-btn",
                disabled: d.value,
                "data-test": "mm-ob-accept-reject",
                onClick: E[3] || (E[3] = (v) => z("accept"))
              }, e.toDisplayString(_.$t("接受驳回")), 9, wd)) : e.createCommentVNode("v-if", !0),
              l.can.escalate ? (e.openBlock(), e.createElementBlock("button", {
                key: 1,
                type: "button",
                class: "ss-btn primary",
                disabled: d.value,
                "data-test": "mm-ob-escalate",
                onClick: E[4] || (E[4] = (v) => z("escalate"))
              }, e.toDisplayString(_.$t("提交裁决")), 9, Cd)) : e.createCommentVNode("v-if", !0)
            ])
          ])) : e.createCommentVNode("v-if", !0),
          e.createCommentVNode(" 项目负责人裁决 "),
          l.can.arbitrate ? (e.openBlock(), e.createElementBlock("section", Td, [
            e.createElementVNode(
              "h5",
              null,
              e.toDisplayString(_.$t("你的裁决（最终结果）")),
              1
              /* TEXT */
            ),
            e.createElementVNode(
              "p",
              Id,
              e.toDisplayString(_.$t("裁决后通知任务负责人和部门负责人，记入总结报告")),
              1
              /* TEXT */
            ),
            e.createElementVNode("div", Md, [
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn",
                disabled: d.value,
                "data-test": "mm-ob-keep",
                onClick: E[5] || (E[5] = (v) => M("arb_keep"))
              }, e.toDisplayString(_.$t("维持原方案")), 9, Ad),
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn primary",
                disabled: d.value,
                "data-test": "mm-ob-adjust",
                onClick: E[6] || (E[6] = (v) => M("arb_adjust"))
              }, e.toDisplayString(_.$t("按异议调整")), 9, jd)
            ]),
            e.createElementVNode("button", {
              type: "button",
              class: "ss-link more",
              disabled: d.value,
              "data-test": "mm-ob-delete-arbitrate",
              onClick: E[7] || (E[7] = (v) => R("arbitrate"))
            }, [
              e.createTextVNode(
                e.toDisplayString(_.$t("更多：删除该任务")) + " ",
                1
                /* TEXT */
              ),
              E[15] || (E[15] = e.createElementVNode(
                "i",
                { class: "ri-arrow-right-s-line" },
                null,
                -1
                /* CACHED */
              ))
            ], 8, Ld)
          ])) : e.createCommentVNode("v-if", !0),
          a.value ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock("p", zd, [
            E[16] || (E[16] = e.createElementVNode(
              "i",
              { class: "ri-time-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(I.value),
              1
              /* TEXT */
            )
          ])),
          e.createCommentVNode(" 复核 / 裁决的说明与调整内容 "),
          k.value ? (e.openBlock(), e.createElementBlock("section", Fd, [
            e.createElementVNode(
              "h5",
              null,
              e.toDisplayString(f[k.value]),
              1
              /* TEXT */
            ),
            k.value === "review_adopt" || k.value === "arb_adjust" ? (e.openBlock(), e.createElementBlock(
              e.Fragment,
              { key: 0 },
              [
                e.createElementVNode(
                  "p",
                  Pd,
                  e.toDisplayString(_.$t("按异议改好任务内容；没改的项保持原样。")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode("label", Ud, [
                  e.createElementVNode(
                    "span",
                    null,
                    e.toDisplayString(_.$t("任务标题")),
                    1
                    /* TEXT */
                  ),
                  e.withDirectives(e.createElementVNode(
                    "input",
                    {
                      "onUpdate:modelValue": E[8] || (E[8] = (v) => m.title = v),
                      type: "text",
                      "data-test": "mm-ob-title"
                    },
                    null,
                    512
                    /* NEED_PATCH */
                  ), [
                    [e.vModelText, m.title]
                  ])
                ]),
                e.createElementVNode("label", Od, [
                  e.createElementVNode(
                    "span",
                    null,
                    e.toDisplayString(_.$t("交付标准")),
                    1
                    /* TEXT */
                  ),
                  e.withDirectives(e.createElementVNode(
                    "textarea",
                    {
                      "onUpdate:modelValue": E[9] || (E[9] = (v) => m.standard = v),
                      rows: "2"
                    },
                    null,
                    512
                    /* NEED_PATCH */
                  ), [
                    [e.vModelText, m.standard]
                  ])
                ]),
                e.createElementVNode("label", Rd, [
                  e.createElementVNode(
                    "span",
                    null,
                    e.toDisplayString(_.$t("截止日期")),
                    1
                    /* TEXT */
                  ),
                  e.withDirectives(e.createElementVNode(
                    "input",
                    {
                      "onUpdate:modelValue": E[10] || (E[10] = (v) => m.due = v),
                      type: "date",
                      "data-test": "mm-ob-due"
                    },
                    null,
                    512
                    /* NEED_PATCH */
                  ), [
                    [e.vModelText, m.due]
                  ])
                ])
              ],
              64
              /* STABLE_FRAGMENT */
            )) : e.createCommentVNode("v-if", !0),
            e.createElementVNode("label", qd, [
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(k.value === "review_reject" ? _.$t("驳回理由") : _.$t("说明（可选）")),
                1
                /* TEXT */
              ),
              e.withDirectives(e.createElementVNode("textarea", {
                "onUpdate:modelValue": E[11] || (E[11] = (v) => h.value = v),
                rows: "3",
                placeholder: k.value === "review_reject" ? _.$t("写明为什么维持原方案，部门负责人会看到") : "",
                "data-test": "mm-ob-note"
              }, null, 8, Kd), [
                [e.vModelText, h.value]
              ])
            ]),
            e.createElementVNode("div", Hd, [
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn primary sm",
                disabled: d.value || k.value === "review_reject" && !h.value.trim(),
                "data-test": "mm-ob-submit",
                onClick: T
              }, [
                e.createElementVNode(
                  "i",
                  {
                    class: e.normalizeClass(d.value ? "ri-loader-4-line spin" : "ri-check-line")
                  },
                  null,
                  2
                  /* CLASS */
                ),
                e.createTextVNode(
                  e.toDisplayString(_.$t("确认")),
                  1
                  /* TEXT */
                )
              ], 8, Wd),
              e.createElementVNode(
                "button",
                {
                  type: "button",
                  class: "ss-link",
                  onClick: E[12] || (E[12] = (v) => k.value = "")
                },
                e.toDisplayString(_.$t("取消")),
                1
                /* TEXT */
              )
            ])
          ])) : e.createCommentVNode("v-if", !0)
        ],
        64
        /* STABLE_FRAGMENT */
      )) : (e.openBlock(), e.createElementBlock(
        "p",
        Gd,
        e.toDisplayString(_.$t("当前没有处理中的异议")),
        1
        /* TEXT */
      )),
      P.value.length ? (e.openBlock(), e.createElementBlock("section", Yd, [
        e.createElementVNode(
          "h4",
          null,
          e.toDisplayString(_.$t("以往的异议")),
          1
          /* TEXT */
        ),
        e.createElementVNode("ul", null, [
          (e.openBlock(!0), e.createElementBlock(
            e.Fragment,
            null,
            e.renderList(P.value, (v) => (e.openBlock(), e.createElementBlock("li", {
              key: v.id
            }, [
              e.createElementVNode(
                "span",
                Jd,
                e.toDisplayString(v.kind === "change" ? _.$t("变更申请") : _.$t("异议")) + " · " + e.toDisplayString(e.unref(ot)[v.target]),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(v.reason),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "span",
                {
                  class: e.normalizeClass(["ss-chip", v.outcome === "adopted" || v.outcome === "adjusted" ? "ok" : v.outcome === "cancelled" ? "bad" : ""])
                },
                e.toDisplayString(e.unref(Dl)(v.outcome)),
                3
                /* TEXT, CLASS */
              ),
              e.createElementVNode(
                "time",
                null,
                e.toDisplayString(e.unref(Pe)(v.resolvedAt || v.raisedAt)),
                1
                /* TEXT */
              )
            ]))),
            128
            /* KEYED_FRAGMENT */
          ))
        ])
      ])) : e.createCommentVNode("v-if", !0),
      e.createElementVNode("section", Qd, [
        e.createElementVNode(
          "h4",
          null,
          e.toDisplayString(_.$t("变更记录")),
          1
          /* TEXT */
        ),
        U.value.length ? (e.openBlock(), e.createElementBlock("ol", Xd, [
          (e.openBlock(!0), e.createElementBlock(
            e.Fragment,
            null,
            e.renderList(U.value, (v, S) => (e.openBlock(), e.createElementBlock("li", { key: S }, [
              E[17] || (E[17] = e.createElementVNode(
                "i",
                {
                  class: "mm-tl__dot",
                  "aria-hidden": "true"
                },
                null,
                -1
                /* CACHED */
              )),
              e.createElementVNode("div", null, [
                e.createElementVNode("p", null, [
                  e.createElementVNode(
                    "b",
                    null,
                    e.toDisplayString(e.unref(it)(l.names, v.by, v.by)),
                    1
                    /* TEXT */
                  ),
                  e.createTextVNode(
                    " " + e.toDisplayString(e.unref(Bl)(v)),
                    1
                    /* TEXT */
                  ),
                  v.note ? (e.openBlock(), e.createElementBlock(
                    e.Fragment,
                    { key: 0 },
                    [
                      e.createTextVNode(
                        e.toDisplayString(_.$t("：")) + e.toDisplayString(v.note),
                        1
                        /* TEXT */
                      )
                    ],
                    64
                    /* STABLE_FRAGMENT */
                  )) : e.createCommentVNode("v-if", !0)
                ]),
                e.createElementVNode(
                  "time",
                  null,
                  e.toDisplayString(e.unref(Pe)(v.at)),
                  1
                  /* TEXT */
                )
              ])
            ]))),
            128
            /* KEYED_FRAGMENT */
          ))
        ])) : (e.openBlock(), e.createElementBlock(
          "p",
          Zd,
          e.toDisplayString(_.$t("没有变更记录")),
          1
          /* TEXT */
        ))
      ])
    ]));
  }
}), em = /* @__PURE__ */ oe(xd, [["__scopeId", "data-v-16692f6c"]]), tm = ["aria-label"], lm = ["aria-label"], nm = {
  key: 0,
  class: "mm-td__loading"
}, om = {
  key: 1,
  class: "ss-note danger"
}, am = { class: "mm-td__head" }, sm = { class: "mm-td__meta" }, rm = {
  class: "mm-td__tabs",
  role: "tablist"
}, im = ["aria-selected", "data-test", "onClick"], cm = ["aria-label"], dm = { class: "mm-td__body" }, mm = {
  key: 0,
  class: "mm-td__dl"
}, um = { class: "pre" }, pm = { class: "pre" }, vm = { class: "mm-td__prog" }, km = { class: "mm-td__log" }, ym = {
  key: 0,
  class: "ss-empty"
}, gm = {
  key: 1,
  class: "mm-tl"
}, fm = {
  key: 0,
  class: "mm-tl__note"
}, Nm = {
  key: 3,
  class: "mm-td__form",
  "data-test": "mm-form-progress"
}, Vm = { class: "mm-td__range" }, Em = { class: "mm-td__status" }, $m = { class: "mm-tag brand" }, bm = { class: "ss-field" }, hm = ["placeholder"], _m = { class: "ss-actions" }, Bm = ["disabled"], Sm = {
  key: 4,
  class: "mm-td__form",
  "data-test": "mm-form-complete"
}, Dm = { class: "ss-muted" }, wm = { class: "ss-field" }, Cm = ["placeholder"], Tm = { class: "ss-actions" }, Im = ["disabled"], Mm = {
  key: 5,
  class: "mm-td__form",
  "data-test": "mm-form-raise"
}, Am = { class: "ss-muted" }, jm = ["aria-label"], Lm = ["value"], zm = { class: "ss-field" }, Fm = ["placeholder"], Pm = { class: "ss-field" }, Um = ["placeholder"], Om = {
  key: 0,
  class: "ss-field"
}, Rm = ["min"], qm = { class: "ss-actions" }, Km = ["disabled"], Hm = {
  key: 0,
  class: "mm-td__foot"
}, Wm = ["disabled"], Gm = ["disabled"], Ym = ["disabled"], Jm = ["disabled"], Qm = ["disabled"], Zm = /* @__PURE__ */ e.defineComponent({
  __name: "TaskDetailPanel",
  props: {
    taskId: {},
    refreshSeq: { default: 0 }
  },
  emits: ["close", "changed", "role"],
  setup(l, { emit: u }) {
    const n = l, p = u, f = [
      { key: "detail", title: t.t("详情") },
      { key: "progress", title: t.t("进度记录") },
      { key: "objection", title: t.t("异议与变更") }
    ], s = ie.useNotificationStore(), o = e.ref(null), d = e.ref(!1), i = e.ref(!1), k = e.ref(""), h = e.ref("detail"), m = e.ref(""), c = e.reactive({ percent: 0, note: "" }), g = e.ref(""), N = e.reactive({ target: "time", reason: "", suggestion: "", suggestedDue: "" }), a = e.computed(() => o.value?.task ?? null), I = e.computed(() => o.value?.can ?? {}), P = e.computed(() => !!a.value && Ce(a.value)), U = e.computed(() => !!(I.value.accept || I.value.object || I.value.progress || I.value.complete || I.value.change)), M = e.computed(() => [...a.value?.progressLog ?? []].sort((y, V) => V.at - y.at)), C = e.computed(() => I.value.object ? t.t("提出异议") : t.t("申请变更")), T = (y) => y === "done" ? "ok" : y === "in_progress" ? "brand" : y === "to_accept" ? "warn" : "";
    async function z(y) {
      if (n.taskId) {
        d.value = !0, k.value = "";
        try {
          const V = await Y("task.get", { id: n.taskId });
          o.value = V, p("role", Il(V.task, ne.value?.me.person?.id, V.project?.ownerId, V.can)), y && (h.value = Tl(V.task, V.can), m.value = "");
        } catch (V) {
          k.value = Z.errorMessage(V), y && (o.value = null);
        } finally {
          d.value = !1;
        }
      }
    }
    e.watch(() => n.taskId, () => {
      z(!0);
    }, { immediate: !0 }), e.watch(() => n.refreshSeq, () => {
      z(!1);
    });
    function R(y) {
      const V = a.value;
      V && (y === "progress" && Object.assign(c, { percent: fe(V.percent), note: "" }), y === "complete" && (g.value = ""), y === "raise" && Object.assign(N, { target: "time", reason: "", suggestion: "", suggestedDue: "" }), m.value = y);
    }
    async function _(y, V, r) {
      i.value = !0, k.value = "";
      try {
        await Y(y, V), s.success(r), m.value = "", await E();
      } catch (W) {
        k.value = Z.errorMessage(W);
      } finally {
        i.value = !1;
      }
    }
    async function E() {
      await z(!1), p("changed");
    }
    function v() {
      return _("task.accept", { id: n.taskId }, t.t("已接收任务"));
    }
    function S() {
      const y = Math.max(0, Math.min(100, Math.round(Number(c.percent) || 0)));
      return _("task.progress", { id: n.taskId, percent: y, note: c.note.trim(), status: "in_progress" }, t.t("进度已更新"));
    }
    function j() {
      return _("task.complete", { id: n.taskId, note: g.value.trim() || void 0 }, t.t("已标记完成，已通知任务负责人"));
    }
    function J() {
      const y = {
        id: n.taskId,
        target: N.target,
        reason: N.reason.trim(),
        suggestion: N.suggestion.trim()
      };
      return N.target === "time" && N.suggestedDue && (y.suggestedDue = N.suggestedDue), _("task.objection.raise", y, t.t("已提交，等待任务负责人复核")).then(() => {
        k.value || (h.value = "objection");
      });
    }
    return (y, V) => (e.openBlock(), e.createElementBlock("aside", {
      class: "mm-td",
      "aria-label": y.$t("任务详情"),
      "data-test": "mm-task-detail"
    }, [
      e.createElementVNode("button", {
        type: "button",
        class: "mm-td__close",
        "aria-label": y.$t("关闭"),
        "data-test": "mm-task-detail-close",
        onClick: V[0] || (V[0] = (r) => p("close"))
      }, [...V[18] || (V[18] = [
        e.createElementVNode(
          "i",
          { class: "ri-close-line" },
          null,
          -1
          /* CACHED */
        )
      ])], 8, lm),
      d.value && !o.value ? (e.openBlock(), e.createElementBlock("p", nm, [
        V[19] || (V[19] = e.createElementVNode(
          "i",
          { class: "ri-loader-4-line spin" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(y.$t("加载中…")),
          1
          /* TEXT */
        )
      ])) : e.createCommentVNode("v-if", !0),
      k.value ? (e.openBlock(), e.createElementBlock("p", om, [
        V[20] || (V[20] = e.createElementVNode(
          "i",
          { class: "ri-error-warning-line" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(k.value),
          1
          /* TEXT */
        )
      ])) : e.createCommentVNode("v-if", !0),
      o.value && a.value ? (e.openBlock(), e.createElementBlock(
        e.Fragment,
        { key: 2 },
        [
          e.createElementVNode("header", am, [
            e.createElementVNode(
              "span",
              {
                class: e.normalizeClass(["mm-tag", e.unref(At)(a.value)]),
                "data-test": "mm-task-status"
              },
              e.toDisplayString(e.unref(Vl)(a.value)),
              3
              /* TEXT, CLASS */
            ),
            e.createElementVNode(
              "h3",
              null,
              e.toDisplayString(a.value.title),
              1
              /* TEXT */
            ),
            e.createElementVNode("p", sm, [
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(a.value.deptName) + " · " + e.toDisplayString(a.value.assigneeName),
                1
                /* TEXT */
              ),
              V[21] || (V[21] = e.createElementVNode(
                "i",
                { "aria-hidden": "true" },
                "|",
                -1
                /* CACHED */
              )),
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(y.$t("任务负责人 {name}", { name: a.value.ownerName })),
                1
                /* TEXT */
              ),
              V[22] || (V[22] = e.createElementVNode(
                "i",
                { "aria-hidden": "true" },
                "|",
                -1
                /* CACHED */
              )),
              e.createElementVNode(
                "span",
                {
                  class: e.normalizeClass({ bad: a.value.overdue })
                },
                [
                  e.createTextVNode(
                    e.toDisplayString(y.$t("截止 {d}", { d: e.unref(mt)(a.value.due) })),
                    1
                    /* TEXT */
                  ),
                  P.value ? (e.openBlock(), e.createElementBlock(
                    e.Fragment,
                    { key: 0 },
                    [
                      e.createTextVNode(
                        e.toDisplayString(y.$t("（处理期间照常计时）")),
                        1
                        /* TEXT */
                      )
                    ],
                    64
                    /* STABLE_FRAGMENT */
                  )) : e.createCommentVNode("v-if", !0),
                  a.value.overdue && a.value.overdueDays > 0 ? (e.openBlock(), e.createElementBlock(
                    e.Fragment,
                    { key: 1 },
                    [
                      e.createTextVNode(
                        " · " + e.toDisplayString(y.$t("逾期 {n} 天", { n: a.value.overdueDays })),
                        1
                        /* TEXT */
                      )
                    ],
                    64
                    /* STABLE_FRAGMENT */
                  )) : e.createCommentVNode("v-if", !0)
                ],
                2
                /* CLASS */
              )
            ])
          ]),
          e.createElementVNode("nav", rm, [
            (e.openBlock(), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(f, (r) => e.createElementVNode("button", {
                key: r.key,
                type: "button",
                role: "tab",
                "aria-selected": h.value === r.key,
                class: e.normalizeClass({ on: h.value === r.key }),
                "data-test": `mm-td-tab-${r.key}`,
                onClick: (W) => h.value = r.key
              }, [
                e.createTextVNode(
                  e.toDisplayString(r.title),
                  1
                  /* TEXT */
                ),
                r.key === "objection" && P.value ? (e.openBlock(), e.createElementBlock("i", {
                  key: 0,
                  class: "mm-dot",
                  "aria-label": y.$t("有处理中的异议")
                }, null, 8, cm)) : e.createCommentVNode("v-if", !0)
              ], 10, im)),
              64
              /* STABLE_FRAGMENT */
            ))
          ]),
          e.createElementVNode("div", dm, [
            e.createCommentVNode(" 详情 "),
            h.value === "detail" ? (e.openBlock(), e.createElementBlock("dl", mm, [
              e.createElementVNode(
                "dt",
                null,
                e.toDisplayString(y.$t("来源会议")),
                1
                /* TEXT */
              ),
              e.createElementVNode("dd", null, [
                e.createElementVNode(
                  "button",
                  {
                    type: "button",
                    class: "ss-link",
                    onClick: V[1] || (V[1] = (r) => e.unref(de)({ kind: "meeting", id: a.value.meetingId }))
                  },
                  e.toDisplayString(a.value.meetingTitle || "—"),
                  1
                  /* TEXT */
                )
              ]),
              e.createElementVNode(
                "dt",
                null,
                e.toDisplayString(y.$t("所属项目")),
                1
                /* TEXT */
              ),
              e.createElementVNode("dd", null, [
                e.createElementVNode(
                  "button",
                  {
                    type: "button",
                    class: "ss-link",
                    onClick: V[2] || (V[2] = (r) => e.unref(de)({ kind: "project", id: a.value.projectId }))
                  },
                  e.toDisplayString(a.value.projectName || "—"),
                  1
                  /* TEXT */
                )
              ]),
              e.createElementVNode(
                "dt",
                null,
                e.toDisplayString(y.$t("责任部门")),
                1
                /* TEXT */
              ),
              e.createElementVNode("dd", null, [
                e.createVNode(ze, {
                  name: a.value.assigneeName,
                  dept: a.value.deptName
                }, null, 8, ["name", "dept"])
              ]),
              e.createElementVNode(
                "dt",
                null,
                e.toDisplayString(y.$t("任务负责人")),
                1
                /* TEXT */
              ),
              e.createElementVNode("dd", null, [
                e.createVNode(ze, {
                  name: a.value.ownerName
                }, null, 8, ["name"])
              ]),
              e.createElementVNode(
                "dt",
                null,
                e.toDisplayString(y.$t("执行事项")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "dd",
                um,
                e.toDisplayString(a.value.title),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "dt",
                null,
                e.toDisplayString(y.$t("交付标准")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "dd",
                pm,
                e.toDisplayString(a.value.standard || "—"),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "dt",
                null,
                e.toDisplayString(y.$t("完成时间")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "dd",
                {
                  class: e.normalizeClass({ bad: a.value.overdue })
                },
                [
                  e.createTextVNode(
                    e.toDisplayString(a.value.due || "—"),
                    1
                    /* TEXT */
                  ),
                  a.value.overdue && a.value.overdueDays > 0 ? (e.openBlock(), e.createElementBlock(
                    e.Fragment,
                    { key: 0 },
                    [
                      e.createTextVNode(
                        e.toDisplayString(y.$t("（逾期 {n} 天）", { n: a.value.overdueDays })),
                        1
                        /* TEXT */
                      )
                    ],
                    64
                    /* STABLE_FRAGMENT */
                  )) : e.createCommentVNode("v-if", !0)
                ],
                2
                /* CLASS */
              ),
              e.createElementVNode(
                "dt",
                null,
                e.toDisplayString(y.$t("当前进度")),
                1
                /* TEXT */
              ),
              e.createElementVNode("dd", vm, [
                e.createElementVNode(
                  "i",
                  {
                    class: e.normalizeClass(["mm-bar", { bad: a.value.overdue }])
                  },
                  [
                    e.createElementVNode(
                      "b",
                      {
                        style: e.normalizeStyle({ width: `${e.unref(fe)(a.value.percent)}%` })
                      },
                      null,
                      4
                      /* STYLE */
                    )
                  ],
                  2
                  /* CLASS */
                ),
                e.createElementVNode(
                  "em",
                  null,
                  e.toDisplayString(e.unref(fe)(a.value.percent)) + "%",
                  1
                  /* TEXT */
                )
              ]),
              e.createElementVNode(
                "dt",
                null,
                e.toDisplayString(y.$t("下发时间")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "dd",
                null,
                e.toDisplayString(e.unref(Ne)(a.value.createdAt)),
                1
                /* TEXT */
              ),
              a.value.acceptedAt ? (e.openBlock(), e.createElementBlock(
                e.Fragment,
                { key: 0 },
                [
                  e.createElementVNode(
                    "dt",
                    null,
                    e.toDisplayString(y.$t("接收时间")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "dd",
                    null,
                    e.toDisplayString(e.unref(Ne)(a.value.acceptedAt)),
                    1
                    /* TEXT */
                  )
                ],
                64
                /* STABLE_FRAGMENT */
              )) : e.createCommentVNode("v-if", !0),
              a.value.doneAt ? (e.openBlock(), e.createElementBlock(
                e.Fragment,
                { key: 1 },
                [
                  e.createElementVNode(
                    "dt",
                    null,
                    e.toDisplayString(y.$t("完成于")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "dd",
                    null,
                    e.toDisplayString(e.unref(Ne)(a.value.doneAt)),
                    1
                    /* TEXT */
                  )
                ],
                64
                /* STABLE_FRAGMENT */
              )) : e.createCommentVNode("v-if", !0)
            ])) : h.value === "progress" ? (e.openBlock(), e.createElementBlock(
              e.Fragment,
              { key: 1 },
              [
                e.createCommentVNode(" 进度记录 "),
                e.createElementVNode("div", km, [
                  M.value.length ? (e.openBlock(), e.createElementBlock("ol", gm, [
                    (e.openBlock(!0), e.createElementBlock(
                      e.Fragment,
                      null,
                      e.renderList(M.value, (r, W) => (e.openBlock(), e.createElementBlock("li", { key: W }, [
                        V[23] || (V[23] = e.createElementVNode(
                          "i",
                          {
                            class: "mm-tl__dot",
                            "aria-hidden": "true"
                          },
                          null,
                          -1
                          /* CACHED */
                        )),
                        e.createElementVNode("div", null, [
                          e.createElementVNode("p", null, [
                            e.createElementVNode(
                              "b",
                              null,
                              e.toDisplayString(e.unref(it)(o.value.names, r.by, r.by)),
                              1
                              /* TEXT */
                            ),
                            e.createTextVNode(
                              " " + e.toDisplayString(y.$t("更新进度到 {n}%", { n: e.unref(fe)(r.percent) })) + " · ",
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "span",
                              {
                                class: e.normalizeClass(["mm-tag sm", T(r.status)])
                              },
                              e.toDisplayString(e.unref(Ue)[r.status]),
                              3
                              /* TEXT, CLASS */
                            )
                          ]),
                          r.note ? (e.openBlock(), e.createElementBlock(
                            "p",
                            fm,
                            e.toDisplayString(r.note),
                            1
                            /* TEXT */
                          )) : e.createCommentVNode("v-if", !0),
                          e.createElementVNode(
                            "time",
                            null,
                            e.toDisplayString(e.unref(Pe)(r.at)),
                            1
                            /* TEXT */
                          )
                        ])
                      ]))),
                      128
                      /* KEYED_FRAGMENT */
                    ))
                  ])) : (e.openBlock(), e.createElementBlock(
                    "p",
                    ym,
                    e.toDisplayString(y.$t("还没有进度记录")),
                    1
                    /* TEXT */
                  ))
                ])
              ],
              2112
              /* STABLE_FRAGMENT, DEV_ROOT_FRAGMENT */
            )) : (e.openBlock(), e.createElementBlock(
              e.Fragment,
              { key: 2 },
              [
                e.createCommentVNode(" 异议与变更 "),
                e.createVNode(em, {
                  task: a.value,
                  can: o.value.can,
                  names: o.value.names,
                  onChanged: E
                }, null, 8, ["task", "can", "names"])
              ],
              2112
              /* STABLE_FRAGMENT, DEV_ROOT_FRAGMENT */
            )),
            e.createCommentVNode(" 动作表单 "),
            m.value === "progress" ? (e.openBlock(), e.createElementBlock("section", Nm, [
              e.createElementVNode(
                "h4",
                null,
                e.toDisplayString(y.$t("更新进度")),
                1
                /* TEXT */
              ),
              e.createElementVNode("label", Vm, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(y.$t("完成百分比")),
                  1
                  /* TEXT */
                ),
                e.withDirectives(e.createElementVNode(
                  "input",
                  {
                    "onUpdate:modelValue": V[3] || (V[3] = (r) => c.percent = r),
                    type: "range",
                    min: "0",
                    max: "100",
                    step: "5"
                  },
                  null,
                  512
                  /* NEED_PATCH */
                ), [
                  [
                    e.vModelText,
                    c.percent,
                    void 0,
                    { number: !0 }
                  ]
                ]),
                e.withDirectives(e.createElementVNode(
                  "input",
                  {
                    "onUpdate:modelValue": V[4] || (V[4] = (r) => c.percent = r),
                    type: "number",
                    min: "0",
                    max: "100",
                    class: "num",
                    "data-test": "mm-progress-percent"
                  },
                  null,
                  512
                  /* NEED_PATCH */
                ), [
                  [
                    e.vModelText,
                    c.percent,
                    void 0,
                    { number: !0 }
                  ]
                ]),
                V[24] || (V[24] = e.createElementVNode(
                  "em",
                  null,
                  "%",
                  -1
                  /* CACHED */
                ))
              ]),
              e.createElementVNode("p", Em, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(y.$t("状态")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "span",
                  $m,
                  e.toDisplayString(e.unref(Ue).in_progress),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "small",
                  null,
                  e.toDisplayString(a.value.status === "not_started" ? y.$t("第一次更新进度后，任务从「未开始」变为「进行中」；做完了用「标记完成」") : y.$t("做完了用「标记完成」")),
                  1
                  /* TEXT */
                )
              ]),
              e.createElementVNode("label", bm, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(y.$t("说明")),
                  1
                  /* TEXT */
                ),
                e.withDirectives(e.createElementVNode("textarea", {
                  "onUpdate:modelValue": V[5] || (V[5] = (r) => c.note = r),
                  rows: "3",
                  placeholder: y.$t("这周做了什么、遇到什么问题"),
                  "data-test": "mm-progress-note"
                }, null, 8, hm), [
                  [e.vModelText, c.note]
                ])
              ]),
              e.createElementVNode("div", _m, [
                e.createElementVNode("button", {
                  type: "button",
                  class: "ss-btn primary sm",
                  disabled: i.value,
                  "data-test": "mm-progress-submit",
                  onClick: S
                }, [
                  e.createElementVNode(
                    "i",
                    {
                      class: e.normalizeClass(i.value ? "ri-loader-4-line spin" : "ri-check-line")
                    },
                    null,
                    2
                    /* CLASS */
                  ),
                  e.createTextVNode(
                    e.toDisplayString(y.$t("提交进度")),
                    1
                    /* TEXT */
                  )
                ], 8, Bm),
                e.createElementVNode(
                  "button",
                  {
                    type: "button",
                    class: "ss-link",
                    onClick: V[6] || (V[6] = (r) => m.value = "")
                  },
                  e.toDisplayString(y.$t("取消")),
                  1
                  /* TEXT */
                )
              ])
            ])) : e.createCommentVNode("v-if", !0),
            m.value === "complete" ? (e.openBlock(), e.createElementBlock("section", Sm, [
              e.createElementVNode(
                "h4",
                null,
                e.toDisplayString(y.$t("标记完成")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "p",
                Dm,
                e.toDisplayString(y.$t("标记后通知任务负责人 {name}；完成后不能再改进度。", { name: a.value.ownerName })),
                1
                /* TEXT */
              ),
              e.createElementVNode("label", wm, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(y.$t("完成说明（可选）")),
                  1
                  /* TEXT */
                ),
                e.withDirectives(e.createElementVNode("textarea", {
                  "onUpdate:modelValue": V[7] || (V[7] = (r) => g.value = r),
                  rows: "3",
                  placeholder: y.$t("交付物放在哪里、和交付标准的对照")
                }, null, 8, Cm), [
                  [e.vModelText, g.value]
                ])
              ]),
              e.createElementVNode("div", Tm, [
                e.createElementVNode("button", {
                  type: "button",
                  class: "ss-btn primary sm",
                  disabled: i.value,
                  "data-test": "mm-complete-submit",
                  onClick: j
                }, [
                  e.createElementVNode(
                    "i",
                    {
                      class: e.normalizeClass(i.value ? "ri-loader-4-line spin" : "ri-check-double-line")
                    },
                    null,
                    2
                    /* CLASS */
                  ),
                  e.createTextVNode(
                    e.toDisplayString(y.$t("确认完成")),
                    1
                    /* TEXT */
                  )
                ], 8, Im),
                e.createElementVNode(
                  "button",
                  {
                    type: "button",
                    class: "ss-link",
                    onClick: V[8] || (V[8] = (r) => m.value = "")
                  },
                  e.toDisplayString(y.$t("取消")),
                  1
                  /* TEXT */
                )
              ])
            ])) : e.createCommentVNode("v-if", !0),
            m.value === "raise" ? (e.openBlock(), e.createElementBlock("section", Mm, [
              e.createElementVNode(
                "h4",
                null,
                e.toDisplayString(C.value),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "p",
                Am,
                e.toDisplayString(y.$t("提交后由任务负责人 {name} 复核；处理期间任务照常计时，原截止日有效。", { name: a.value.ownerName })),
                1
                /* TEXT */
              ),
              e.createElementVNode("div", {
                class: "mm-td__radios",
                role: "radiogroup",
                "aria-label": y.$t("分歧点")
              }, [
                (e.openBlock(!0), e.createElementBlock(
                  e.Fragment,
                  null,
                  e.renderList(e.unref(ot), (r, W) => (e.openBlock(), e.createElementBlock(
                    "label",
                    {
                      key: W,
                      class: e.normalizeClass({ on: N.target === W })
                    },
                    [
                      e.withDirectives(e.createElementVNode("input", {
                        "onUpdate:modelValue": V[9] || (V[9] = (X) => N.target = X),
                        type: "radio",
                        value: W
                      }, null, 8, Lm), [
                        [e.vModelRadio, N.target]
                      ]),
                      e.createTextVNode(
                        e.toDisplayString(r),
                        1
                        /* TEXT */
                      )
                    ],
                    2
                    /* CLASS */
                  ))),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ], 8, jm),
              e.createElementVNode("label", zm, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(y.$t("原因")),
                  1
                  /* TEXT */
                ),
                e.withDirectives(e.createElementVNode("textarea", {
                  "onUpdate:modelValue": V[10] || (V[10] = (r) => N.reason = r),
                  rows: "3",
                  placeholder: y.$t("为什么按原方案做不了"),
                  "data-test": "mm-raise-reason"
                }, null, 8, Fm), [
                  [e.vModelText, N.reason]
                ])
              ]),
              e.createElementVNode("label", Pm, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(y.$t("建议")),
                  1
                  /* TEXT */
                ),
                e.withDirectives(e.createElementVNode("textarea", {
                  "onUpdate:modelValue": V[11] || (V[11] = (r) => N.suggestion = r),
                  rows: "2",
                  placeholder: y.$t("你建议怎么调整"),
                  "data-test": "mm-raise-suggestion"
                }, null, 8, Um), [
                  [e.vModelText, N.suggestion]
                ])
              ]),
              N.target === "time" ? (e.openBlock(), e.createElementBlock("label", Om, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(y.$t("建议的新截止日")),
                  1
                  /* TEXT */
                ),
                e.withDirectives(e.createElementVNode("input", {
                  "onUpdate:modelValue": V[12] || (V[12] = (r) => N.suggestedDue = r),
                  type: "date",
                  min: e.unref(hl)(),
                  "data-test": "mm-raise-due"
                }, null, 8, Rm), [
                  [e.vModelText, N.suggestedDue]
                ])
              ])) : e.createCommentVNode("v-if", !0),
              e.createElementVNode("div", qm, [
                e.createElementVNode("button", {
                  type: "button",
                  class: "ss-btn primary sm",
                  disabled: i.value || !N.reason.trim() || !N.suggestion.trim(),
                  "data-test": "mm-raise-submit",
                  onClick: J
                }, [
                  e.createElementVNode(
                    "i",
                    {
                      class: e.normalizeClass(i.value ? "ri-loader-4-line spin" : "ri-send-plane-line")
                    },
                    null,
                    2
                    /* CLASS */
                  ),
                  e.createTextVNode(
                    e.toDisplayString(y.$t("提交")),
                    1
                    /* TEXT */
                  )
                ], 8, Km),
                e.createElementVNode(
                  "button",
                  {
                    type: "button",
                    class: "ss-link",
                    onClick: V[13] || (V[13] = (r) => m.value = "")
                  },
                  e.toDisplayString(y.$t("取消")),
                  1
                  /* TEXT */
                )
              ])
            ])) : e.createCommentVNode("v-if", !0)
          ]),
          U.value && !m.value ? (e.openBlock(), e.createElementBlock("footer", Hm, [
            I.value.accept ? (e.openBlock(), e.createElementBlock("button", {
              key: 0,
              type: "button",
              class: "ss-btn primary",
              disabled: i.value,
              "data-test": "mm-task-accept",
              onClick: v
            }, [
              V[25] || (V[25] = e.createElementVNode(
                "i",
                { class: "ri-checkbox-circle-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(y.$t("接收任务")),
                1
                /* TEXT */
              )
            ], 8, Wm)) : e.createCommentVNode("v-if", !0),
            I.value.object ? (e.openBlock(), e.createElementBlock("button", {
              key: 1,
              type: "button",
              class: "ss-btn",
              disabled: i.value,
              "data-test": "mm-task-object",
              onClick: V[14] || (V[14] = (r) => R("raise"))
            }, [
              V[26] || (V[26] = e.createElementVNode(
                "i",
                { class: "ri-question-answer-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(y.$t("提出异议")),
                1
                /* TEXT */
              )
            ], 8, Gm)) : e.createCommentVNode("v-if", !0),
            I.value.progress ? (e.openBlock(), e.createElementBlock("button", {
              key: 2,
              type: "button",
              class: "ss-btn primary",
              disabled: i.value,
              "data-test": "mm-task-progress",
              onClick: V[15] || (V[15] = (r) => R("progress"))
            }, [
              V[27] || (V[27] = e.createElementVNode(
                "i",
                { class: "ri-line-chart-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(y.$t("更新进度")),
                1
                /* TEXT */
              )
            ], 8, Ym)) : e.createCommentVNode("v-if", !0),
            I.value.complete ? (e.openBlock(), e.createElementBlock("button", {
              key: 3,
              type: "button",
              class: "ss-btn",
              disabled: i.value,
              "data-test": "mm-task-complete",
              onClick: V[16] || (V[16] = (r) => R("complete"))
            }, [
              V[28] || (V[28] = e.createElementVNode(
                "i",
                { class: "ri-check-double-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(y.$t("标记完成")),
                1
                /* TEXT */
              )
            ], 8, Jm)) : e.createCommentVNode("v-if", !0),
            I.value.change ? (e.openBlock(), e.createElementBlock("button", {
              key: 4,
              type: "button",
              class: "ss-btn ghost",
              disabled: i.value,
              "data-test": "mm-task-change",
              onClick: V[17] || (V[17] = (r) => R("raise"))
            }, [
              V[29] || (V[29] = e.createElementVNode(
                "i",
                { class: "ri-edit-2-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(y.$t("申请变更")),
                1
                /* TEXT */
              )
            ], 8, Qm)) : e.createCommentVNode("v-if", !0)
          ])) : e.createCommentVNode("v-if", !0)
        ],
        64
        /* STABLE_FRAGMENT */
      )) : e.createCommentVNode("v-if", !0)
    ], 8, tm));
  }
}), Xm = /* @__PURE__ */ oe(Zm, [["__scopeId", "data-v-357019bd"]]), xm = {
  class: "mm-tasks",
  "data-test": "mm-tasks-tab"
}, eu = { class: "mm-pagehead" }, tu = { class: "mm-search" }, lu = ["placeholder", "aria-label"], nu = {
  key: 0,
  class: "mm-banner",
  "data-test": "mm-plan-banner"
}, ou = { class: "mm-banner__n" }, au = { class: "mm-banner__text" }, su = {
  key: 1,
  class: "ss-note danger"
}, ru = { class: "mm-tasks__main" }, iu = { class: "mm-tasks__bar" }, cu = ["aria-label"], du = ["aria-selected", "title", "data-test", "onClick"], mu = { class: "mm-select" }, uu = { value: "status" }, pu = { value: "project" }, vu = { value: "dept" }, ku = { class: "mm-select" }, yu = { value: "" }, gu = ["value"], fu = ["disabled", "aria-label", "title"], Nu = /* @__PURE__ */ e.defineComponent({
  __name: "TasksTab",
  emits: ["role"],
  setup(l, { expose: u, emit: n }) {
    const p = [
      { key: "received", title: t.t("我接收的"), hint: t.t("下发给我的部门、由我接收和执行的任务") },
      { key: "assigned", title: t.t("我分派的"), hint: t.t("我作为任务负责人确认下发的任务") },
      { key: "all", title: t.t("全部任务"), hint: t.t("我参与的项目里的全部任务") }
    ], f = {
      received: t.t("没有下发给你的任务"),
      all: t.t("你参与的项目里还没有任务"),
      assigned: t.t("你还没有下发过任务")
    }, s = e.ref("all"), o = e.ref("status"), d = e.ref(""), i = e.ref(""), k = e.ref([]), h = e.ref([]), m = e.ref([]), c = e.ref(""), g = e.ref(0), N = e.ref(!1), a = e.ref(""), I = n, P = e.computed(() => bl(k.value, i.value)), U = e.computed(() => {
      const y = m.value[0];
      if (!y) return "";
      const V = [y.title, y.subtitle].filter(Boolean).join(" · ");
      return m.value.length > 1 ? t.t("{line} 等 {n} 份", { line: V, n: m.value.length }) : V;
    });
    let M = 0;
    async function C() {
      const y = ++M;
      N.value = !0;
      try {
        const V = await Y("task.list", { view: s.value, projectId: d.value || void 0 });
        if (y !== M) return;
        k.value = Array.isArray(V) ? V : [], a.value = "";
      } catch (V) {
        y === M && (a.value = Z.errorMessage(V));
      } finally {
        y === M && (N.value = !1);
      }
    }
    async function T() {
      const [y, V] = await Promise.allSettled([
        Y("project.list", {}),
        Y("home.get")
      ]);
      y.status === "fulfilled" && Array.isArray(y.value) && (h.value = y.value.map((r) => ({ id: r.id, name: r.name }))), V.status === "fulfilled" && (m.value = (V.value?.todos ?? []).filter((r) => r.type === "confirm_plan"));
    }
    async function z() {
      g.value += 1, await Promise.all([C(), T()]);
    }
    e.watch([s, d], () => {
      C();
    });
    function R(y) {
      We.value = y, I("role", y);
    }
    e.watch(c, (y) => {
      y || R("");
    });
    function _() {
      const y = ye.value;
      if (y.tab !== "tasks" || y.link?.kind !== "task") return;
      const V = y.link.id;
      c.value = V, i.value = "", !k.value.some((r) => r.id === V) && (s.value !== "all" || d.value) && (s.value = "all", d.value = "");
    }
    e.watch(() => ye.value.seq, _);
    let E = null, v = null, S = 0;
    function j() {
      E && clearTimeout(E), E = setTimeout(() => {
        E = null, S = Date.now(), z();
      }, 250);
    }
    function J() {
      E || Date.now() - S < 800 || j();
    }
    return u({ refresh: J }), e.onMounted(async () => {
      _(), S = Date.now(), await z(), _(), v = Se((y) => {
        y.type !== "changed" || !["all", "task", "meeting", "project", "org"].includes(y.scope) || j();
      });
    }), e.onBeforeUnmount(() => {
      v?.(), E && clearTimeout(E), We.value = "";
    }), (y, V) => (e.openBlock(), e.createElementBlock("div", xm, [
      e.createElementVNode("header", eu, [
        e.createElementVNode(
          "h2",
          null,
          e.toDisplayString(y.$t("任务")),
          1
          /* TEXT */
        ),
        e.createElementVNode(
          "p",
          null,
          e.toDisplayString(y.$t("会议决议拆出的任务，在这里接收、跟进、处理异议")),
          1
          /* TEXT */
        ),
        V[7] || (V[7] = e.createElementVNode(
          "span",
          { class: "grow" },
          null,
          -1
          /* CACHED */
        )),
        e.createElementVNode("label", tu, [
          V[6] || (V[6] = e.createElementVNode(
            "i",
            {
              class: "ri-search-line",
              "aria-hidden": "true"
            },
            null,
            -1
            /* CACHED */
          )),
          e.withDirectives(e.createElementVNode("input", {
            "onUpdate:modelValue": V[0] || (V[0] = (r) => i.value = r),
            type: "search",
            placeholder: y.$t("搜索任务"),
            "aria-label": y.$t("搜索任务"),
            "data-test": "mm-tasks-search"
          }, null, 8, lu), [
            [e.vModelText, i.value]
          ])
        ])
      ]),
      m.value.length ? (e.openBlock(), e.createElementBlock("section", nu, [
        e.createElementVNode(
          "span",
          ou,
          e.toDisplayString(m.value.length),
          1
          /* TEXT */
        ),
        e.createElementVNode("div", au, [
          e.createElementVNode(
            "strong",
            null,
            e.toDisplayString(y.$t("{n} 份执行方案待你确认", { n: m.value.length })),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "small",
            null,
            e.toDisplayString(U.value),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode(
          "button",
          {
            type: "button",
            class: "ss-btn primary",
            "data-test": "mm-plan-banner-go",
            onClick: V[1] || (V[1] = (r) => e.unref(de)(m.value[0].link))
          },
          e.toDisplayString(y.$t("去确认方案")),
          1
          /* TEXT */
        )
      ])) : e.createCommentVNode("v-if", !0),
      a.value ? (e.openBlock(), e.createElementBlock("p", su, [
        V[8] || (V[8] = e.createElementVNode(
          "i",
          { class: "ri-error-warning-line" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(a.value),
          1
          /* TEXT */
        )
      ])) : e.createCommentVNode("v-if", !0),
      e.createElementVNode(
        "section",
        {
          class: e.normalizeClass(["mm-tasks__card", { split: !!c.value }])
        },
        [
          e.createElementVNode("div", ru, [
            e.createElementVNode("div", iu, [
              e.createElementVNode("div", {
                class: "mm-seg",
                role: "tablist",
                "aria-label": y.$t("任务视图")
              }, [
                (e.openBlock(), e.createElementBlock(
                  e.Fragment,
                  null,
                  e.renderList(p, (r) => e.createElementVNode("button", {
                    key: r.key,
                    type: "button",
                    role: "tab",
                    "aria-selected": s.value === r.key,
                    class: e.normalizeClass({ on: s.value === r.key }),
                    title: r.hint,
                    "data-test": `mm-tasks-view-${r.key}`,
                    onClick: (W) => s.value = r.key
                  }, e.toDisplayString(r.title), 11, du)),
                  64
                  /* STABLE_FRAGMENT */
                ))
              ], 8, cu),
              e.createElementVNode("label", mu, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(y.$t("分组：")),
                  1
                  /* TEXT */
                ),
                e.withDirectives(e.createElementVNode(
                  "select",
                  {
                    "onUpdate:modelValue": V[2] || (V[2] = (r) => o.value = r),
                    "data-test": "mm-tasks-groupby"
                  },
                  [
                    e.createElementVNode(
                      "option",
                      uu,
                      e.toDisplayString(y.$t("状态")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "option",
                      pu,
                      e.toDisplayString(y.$t("项目")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "option",
                      vu,
                      e.toDisplayString(y.$t("部门")),
                      1
                      /* TEXT */
                    )
                  ],
                  512
                  /* NEED_PATCH */
                ), [
                  [e.vModelSelect, o.value]
                ]),
                V[9] || (V[9] = e.createElementVNode(
                  "i",
                  {
                    class: "ri-arrow-down-s-line",
                    "aria-hidden": "true"
                  },
                  null,
                  -1
                  /* CACHED */
                ))
              ]),
              e.createElementVNode("label", ku, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(y.$t("项目：")),
                  1
                  /* TEXT */
                ),
                e.withDirectives(e.createElementVNode(
                  "select",
                  {
                    "onUpdate:modelValue": V[3] || (V[3] = (r) => d.value = r),
                    "data-test": "mm-tasks-project"
                  },
                  [
                    e.createElementVNode(
                      "option",
                      yu,
                      e.toDisplayString(y.$t("全部")),
                      1
                      /* TEXT */
                    ),
                    (e.openBlock(!0), e.createElementBlock(
                      e.Fragment,
                      null,
                      e.renderList(h.value, (r) => (e.openBlock(), e.createElementBlock("option", {
                        key: r.id,
                        value: r.id
                      }, e.toDisplayString(r.name), 9, gu))),
                      128
                      /* KEYED_FRAGMENT */
                    ))
                  ],
                  512
                  /* NEED_PATCH */
                ), [
                  [e.vModelSelect, d.value]
                ]),
                V[10] || (V[10] = e.createElementVNode(
                  "i",
                  {
                    class: "ri-arrow-down-s-line",
                    "aria-hidden": "true"
                  },
                  null,
                  -1
                  /* CACHED */
                ))
              ]),
              V[11] || (V[11] = e.createElementVNode(
                "span",
                { class: "grow" },
                null,
                -1
                /* CACHED */
              )),
              e.createElementVNode("button", {
                type: "button",
                class: "mm-icon-btn",
                disabled: N.value,
                "aria-label": y.$t("刷新"),
                title: y.$t("刷新"),
                onClick: z
              }, [
                e.createElementVNode(
                  "i",
                  {
                    class: e.normalizeClass(N.value ? "ri-loader-4-line spin" : "ri-refresh-line")
                  },
                  null,
                  2
                  /* CLASS */
                )
              ], 8, fu)
            ]),
            e.createVNode(Pt, {
              tasks: P.value,
              "group-by": o.value,
              "selected-id": c.value,
              "empty-text": N.value ? y.$t("加载中…") : i.value ? y.$t("没有匹配「{q}」的任务", { q: i.value }) : f[s.value],
              onSelect: V[4] || (V[4] = (r) => c.value = r.id)
            }, null, 8, ["tasks", "group-by", "selected-id", "empty-text"])
          ]),
          c.value ? (e.openBlock(), e.createBlock(Xm, {
            key: c.value,
            "task-id": c.value,
            "refresh-seq": g.value,
            onClose: V[5] || (V[5] = (r) => c.value = ""),
            onChanged: z,
            onRole: R
          }, null, 8, ["task-id", "refresh-seq"])) : e.createCommentVNode("v-if", !0)
        ],
        2
        /* CLASS */
      )
    ]));
  }
}), Vu = /* @__PURE__ */ oe(Nu, [["__scopeId", "data-v-3ff5a2d7"]]), Eu = {
  class: "mm-rv",
  "data-test": "mm-report-view"
}, $u = { class: "mm-rv__head" }, bu = { class: "mm-rv__meta" }, hu = { key: 0 }, _u = { key: 1 }, Bu = {
  key: 2,
  class: "ok"
}, Su = ["aria-label"], Du = { key: 0 }, wu = { class: "mm-rv__hint" }, Cu = ["innerHTML"], Tu = /* @__PURE__ */ e.defineComponent({
  __name: "ReportView",
  props: {
    report: {},
    approverName: {}
  },
  setup(l) {
    const u = l, n = e.computed(() => u.report.stats ?? { total: 0, done: 0, cancelled: 0, overdue: 0, onTime: 0, late: 0, completionRate: 0 }), p = e.computed(() => et.renderMarkdown(u.report.markdown || ""));
    return (f, s) => (e.openBlock(), e.createElementBlock("article", Eu, [
      e.createElementVNode("header", $u, [
        e.createElementVNode("div", bu, [
          e.createElementVNode(
            "strong",
            null,
            e.toDisplayString(l.report.kind === "summary" ? f.$t("项目总结报告") : f.$t("进度汇总报告")),
            1
            /* TEXT */
          ),
          l.report.periodFrom && l.report.periodTo ? (e.openBlock(), e.createElementBlock(
            "span",
            hu,
            e.toDisplayString(f.$t("统计区间 {a} ~ {b}", { a: e.unref(at)(l.report.periodFrom), b: e.unref(at)(l.report.periodTo) })),
            1
            /* TEXT */
          )) : e.createCommentVNode("v-if", !0),
          e.createElementVNode(
            "span",
            null,
            e.toDisplayString(f.$t("生成于 {t}", { t: e.unref(Ne)(l.report.generatedAt) })),
            1
            /* TEXT */
          ),
          l.report.editedAt ? (e.openBlock(), e.createElementBlock(
            "span",
            _u,
            e.toDisplayString(f.$t("修改于 {t}", { t: e.unref(Ne)(l.report.editedAt) })),
            1
            /* TEXT */
          )) : e.createCommentVNode("v-if", !0),
          l.report.approvedAt ? (e.openBlock(), e.createElementBlock(
            "span",
            Bu,
            e.toDisplayString(f.$t("{who} 于 {t} 审核通过", { who: l.approverName || "—", t: e.unref(Ne)(l.report.approvedAt) })),
            1
            /* TEXT */
          )) : e.createCommentVNode("v-if", !0)
        ]),
        e.createElementVNode("ul", {
          class: "mm-rv__stats",
          "aria-label": f.$t("统计（由系统计算）")
        }, [
          e.createElementVNode("li", null, [
            e.createElementVNode(
              "b",
              null,
              e.toDisplayString(n.value.done) + "/" + e.toDisplayString(n.value.total),
              1
              /* TEXT */
            ),
            e.createElementVNode(
              "small",
              null,
              e.toDisplayString(f.$t("已完成")),
              1
              /* TEXT */
            )
          ]),
          e.createElementVNode("li", null, [
            e.createElementVNode(
              "b",
              null,
              e.toDisplayString(e.unref(fe)(n.value.completionRate)) + "%",
              1
              /* TEXT */
            ),
            e.createElementVNode(
              "small",
              null,
              e.toDisplayString(f.$t("完成率")),
              1
              /* TEXT */
            )
          ]),
          e.createElementVNode("li", null, [
            e.createElementVNode(
              "b",
              null,
              e.toDisplayString(n.value.onTime),
              1
              /* TEXT */
            ),
            e.createElementVNode(
              "small",
              null,
              e.toDisplayString(f.$t("按期")),
              1
              /* TEXT */
            )
          ]),
          e.createElementVNode(
            "li",
            {
              class: e.normalizeClass({ warn: n.value.late > 0 })
            },
            [
              e.createElementVNode(
                "b",
                null,
                e.toDisplayString(n.value.late),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "small",
                null,
                e.toDisplayString(f.$t("延期")),
                1
                /* TEXT */
              )
            ],
            2
            /* CLASS */
          ),
          e.createElementVNode(
            "li",
            {
              class: e.normalizeClass({ bad: n.value.overdue > 0 })
            },
            [
              e.createElementVNode(
                "b",
                null,
                e.toDisplayString(n.value.overdue),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "small",
                null,
                e.toDisplayString(f.$t("逾期")),
                1
                /* TEXT */
              )
            ],
            2
            /* CLASS */
          ),
          n.value.cancelled ? (e.openBlock(), e.createElementBlock("li", Du, [
            e.createElementVNode(
              "b",
              null,
              e.toDisplayString(n.value.cancelled),
              1
              /* TEXT */
            ),
            e.createElementVNode(
              "small",
              null,
              e.toDisplayString(f.$t("已取消")),
              1
              /* TEXT */
            )
          ])) : e.createCommentVNode("v-if", !0)
        ], 8, Su),
        e.createElementVNode("p", wu, [
          s[0] || (s[0] = e.createElementVNode(
            "i",
            {
              class: "ri-calculator-line",
              "aria-hidden": "true"
            },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            e.toDisplayString(f.$t("报告里的数字由系统按任务数据计算，模型只写叙述")),
            1
            /* TEXT */
          )
        ])
      ]),
      e.createCommentVNode(" eslint-disable-next-line vue/no-v-html -- renderMarkdown 出口已净化 "),
      e.createElementVNode("div", {
        class: "mm-rv__md",
        innerHTML: p.value
      }, null, 8, Cu)
    ]));
  }
}), Ut = /* @__PURE__ */ oe(Tu, [["__scopeId", "data-v-776da457"]]), Iu = {
  class: "mm-prp",
  "data-test": "mm-project-reports"
}, Mu = { class: "mm-prp__bar" }, Au = { class: "ss-muted" }, ju = ["disabled"], Lu = {
  key: 0,
  class: "ss-note warn"
}, zu = {
  key: 1,
  class: "ss-note danger"
}, Fu = {
  key: 2,
  class: "ss-empty"
}, Pu = {
  key: 3,
  class: "mm-prp__split"
}, Uu = ["aria-label"], Ou = ["aria-selected", "data-test", "onClick"], Ru = /* @__PURE__ */ e.defineComponent({
  __name: "ProjectReports",
  props: {
    project: {},
    focusReportId: { default: "" },
    canGenerate: { type: Boolean, default: !1 }
  },
  emits: ["changed"],
  setup(l, { emit: u }) {
    const n = l, p = u, f = ie.useNotificationStore(), s = e.ref(!1), o = e.ref(""), d = e.ref(0), i = e.ref(""), k = e.ref(null);
    let h = null;
    const m = e.computed(() => {
      const a = [...n.project.weeklyReports ?? []];
      return k.value && !a.some((I) => I.id === k.value.id) && a.push(k.value), a.sort((I, P) => P.generatedAt - I.generatedAt);
    }), c = e.computed(() => m.value.find((a) => a.id === i.value) ?? m.value[0] ?? null), g = e.computed(() => ne.value?.settings.reportCycleDays ?? 7);
    e.watch(() => [n.project.id, n.focusReportId], () => {
      i.value = n.focusReportId && m.value.some((a) => a.id === n.focusReportId) ? n.focusReportId : "";
    }, { immediate: !0 }), e.watch(() => n.project.id, () => {
      k.value = null, o.value = "";
    });
    async function N() {
      s.value = !0, o.value = "", d.value = 0;
      const a = Date.now();
      h = setInterval(() => {
        d.value = Math.floor((Date.now() - a) / 1e3);
      }, 1e3);
      try {
        const I = await Y("project.report.generate", { id: n.project.id });
        I?.id && (k.value = I, i.value = I.id), f.success(t.t("进度报告已生成")), p("changed");
      } catch (I) {
        o.value = Z.errorMessage(I);
      } finally {
        s.value = !1, h && clearInterval(h), h = null;
      }
    }
    return e.onBeforeUnmount(() => {
      h && clearInterval(h);
    }), (a, I) => (e.openBlock(), e.createElementBlock("div", Iu, [
      e.createElementVNode("div", Mu, [
        e.createElementVNode(
          "p",
          Au,
          e.toDisplayString(l.canGenerate ? a.$t("每 {n} 天自动生成一份进度汇总报告，发给任务负责人和项目负责人；项目负责人也可以现在手动生成一份。", { n: g.value }) : a.$t("每 {n} 天自动生成一份进度汇总报告，发给任务负责人和项目负责人。", { n: g.value })),
          1
          /* TEXT */
        ),
        I[0] || (I[0] = e.createElementVNode(
          "span",
          { class: "grow" },
          null,
          -1
          /* CACHED */
        )),
        n.canGenerate ? (e.openBlock(), e.createElementBlock("button", {
          key: 0,
          type: "button",
          class: "ss-btn primary sm",
          disabled: s.value,
          "data-test": "mm-report-generate",
          onClick: N
        }, [
          e.createElementVNode(
            "i",
            {
              class: e.normalizeClass(s.value ? "ri-loader-4-line spin" : "ri-file-chart-line")
            },
            null,
            2
            /* CLASS */
          ),
          e.createTextVNode(
            e.toDisplayString(s.value ? a.$t("生成中… {s} 秒", { s: d.value }) : a.$t("生成一份进度报告")),
            1
            /* TEXT */
          )
        ], 8, ju)) : e.createCommentVNode("v-if", !0)
      ]),
      s.value && d.value > 60 ? (e.openBlock(), e.createElementBlock("p", Lu, [
        I[1] || (I[1] = e.createElementVNode(
          "i",
          { class: "ri-time-line" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(a.$t("比平时慢，模型还在写叙述；数字已由系统算好，模型不可用时会用模板兜底。")),
          1
          /* TEXT */
        )
      ])) : e.createCommentVNode("v-if", !0),
      o.value ? (e.openBlock(), e.createElementBlock("p", zu, [
        I[2] || (I[2] = e.createElementVNode(
          "i",
          { class: "ri-error-warning-line" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(o.value),
          1
          /* TEXT */
        )
      ])) : e.createCommentVNode("v-if", !0),
      m.value.length ? (e.openBlock(), e.createElementBlock("div", Pu, [
        e.createElementVNode("ul", {
          class: "mm-prp__list",
          role: "listbox",
          "aria-label": a.$t("进度报告列表")
        }, [
          (e.openBlock(!0), e.createElementBlock(
            e.Fragment,
            null,
            e.renderList(m.value, (P) => (e.openBlock(), e.createElementBlock("li", {
              key: P.id
            }, [
              e.createElementVNode("button", {
                type: "button",
                role: "option",
                "aria-selected": P.id === i.value,
                class: e.normalizeClass({ on: P.id === i.value }),
                "data-test": `mm-report-${P.id}`,
                onClick: (U) => i.value = P.id
              }, [
                e.createElementVNode(
                  "strong",
                  null,
                  e.toDisplayString(P.periodFrom && P.periodTo ? `${e.unref(rt)(P.periodFrom)} ~ ${e.unref(rt)(P.periodTo)}` : e.unref(Ne)(P.generatedAt)),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "small",
                  null,
                  e.toDisplayString(a.$t("完成率 {p}% · 逾期 {n}", { p: e.unref(fe)(P.stats?.completionRate), n: P.stats?.overdue ?? 0 })),
                  1
                  /* TEXT */
                )
              ], 10, Ou)
            ]))),
            128
            /* KEYED_FRAGMENT */
          ))
        ], 8, Uu),
        c.value ? (e.openBlock(), e.createBlock(Ut, {
          key: 0,
          report: c.value
        }, null, 8, ["report"])) : e.createCommentVNode("v-if", !0)
      ])) : (e.openBlock(), e.createElementBlock(
        "p",
        Fu,
        e.toDisplayString(a.$t("还没有进度报告")),
        1
        /* TEXT */
      ))
    ]));
  }
}), qu = /* @__PURE__ */ oe(Ru, [["__scopeId", "data-v-27c1c06c"]]), Ku = {
  class: "mm-psm",
  "data-test": "mm-project-summary"
}, Hu = {
  key: 0,
  class: "ss-note danger"
}, Wu = {
  key: 1,
  class: "ss-empty"
}, Gu = {
  key: 0,
  class: "mm-psm__wait",
  "data-test": "mm-summary-waiting"
}, Yu = {
  key: 1,
  class: "mm-psm__wait failed",
  "data-test": "mm-summary-missing"
}, Ju = ["disabled"], Qu = {
  key: 0,
  class: "ss-note info"
}, Zu = {
  key: 1,
  class: "mm-psm__bar"
}, Xu = { class: "ss-muted" }, xu = ["disabled"], ep = ["disabled"], tp = ["disabled"], lp = { class: "ss-muted" }, np = ["disabled"], op = ["disabled"], ap = {
  key: 2,
  class: "ss-note info"
}, sp = {
  key: 3,
  class: "ss-note ok"
}, rp = ["aria-label"], ip = /* @__PURE__ */ e.defineComponent({
  __name: "ProjectSummary",
  props: {
    project: {},
    can: {},
    members: { default: () => [] },
    generating: { type: Boolean, default: !1 },
    isOwner: { type: Boolean, default: !1 }
  },
  emits: ["changed"],
  setup(l, { emit: u }) {
    const n = l, p = u, f = $e.useDialog(), s = ie.useNotificationStore(), o = e.ref(!1), d = e.ref(""), i = e.ref(""), k = e.ref(!1), h = e.ref(""), m = e.ref(Date.now());
    let c = null;
    const g = e.computed(() => n.project.summary ?? null), N = e.computed(() => n.members?.find((T) => T.id === g.value?.approvedBy)?.name || ""), a = e.computed(() => {
      const T = n.project.closeCheck?.at, z = T ? Math.max(0, Math.floor((m.value - T) / 1e3)) : 0;
      return T ? z > 300 ? t.t("已经 {m} 分钟了，比平时慢；可以点「重新生成」再试一次", { m: Math.floor(z / 60) }) : t.t("已用时 {s} 秒；生成完会自动显示在这里", { s: z }) : t.t("生成完会自动显示在这里");
    });
    e.watch(() => n.project.id, () => {
      k.value = !1, i.value = "";
    }), e.onMounted(() => {
      c = setInterval(() => {
        m.value = Date.now();
      }, 1e3);
    }), e.onBeforeUnmount(() => {
      c && clearInterval(c);
    });
    async function I(T, z, R, _) {
      o.value = !0, d.value = T, i.value = "";
      try {
        return await Y(z, R), s.success(_), p("changed"), !0;
      } catch (E) {
        return i.value = Z.errorMessage(E), !1;
      } finally {
        o.value = !1, d.value = "";
      }
    }
    function P() {
      h.value = g.value?.markdown ?? "", k.value = !0;
    }
    async function U() {
      await I("save", "project.summary.save", { id: n.project.id, markdown: h.value }, t.t("总结报告已保存")) && (k.value = !1);
    }
    async function M(T) {
      T && !await f.confirm({
        title: t.t("重新生成总结报告"),
        message: g.value?.editedAt ? t.t("重新生成会覆盖你在线修改过的内容，确定吗？") : t.t("按当前项目数据重新生成一份总结报告？"),
        danger: !!g.value?.editedAt
      }) || await I("regen", "project.summary.regenerate", { id: n.project.id }, t.t("总结报告已重新生成"));
    }
    async function C() {
      await f.confirm({
        title: t.t("审核通过并归档"),
        message: t.t("归档后项目全部只读、不能重新激活，并通知全部项目成员。确定审核通过吗？"),
        confirmLabel: t.t("通过并归档")
      }) && await I("approve", "project.summary.approve", { id: n.project.id }, t.t("项目已归档"));
    }
    return (T, z) => (e.openBlock(), e.createElementBlock("div", Ku, [
      i.value ? (e.openBlock(), e.createElementBlock("p", Hu, [
        z[4] || (z[4] = e.createElementVNode(
          "i",
          { class: "ri-error-warning-line" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(i.value),
          1
          /* TEXT */
        )
      ])) : e.createCommentVNode("v-if", !0),
      l.project.status === "active" ? (e.openBlock(), e.createElementBlock(
        "p",
        Wu,
        e.toDisplayString(T.$t("项目还在进行中。项目负责人「发起结项」且检查通过后，AI 会在这里生成项目总结报告（概况、关键决策、任务按期 / 延期完成情况、变更与裁决记录），审核通过后归档。")),
        1
        /* TEXT */
      )) : g.value ? (e.openBlock(), e.createElementBlock(
        e.Fragment,
        { key: 3 },
        [
          l.generating ? (e.openBlock(), e.createElementBlock("p", Qu, [
            z[8] || (z[8] = e.createElementVNode(
              "i",
              { class: "ri-loader-4-line spin" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(T.$t("AI 正在重新生成总结报告，生成完会自动刷新")),
              1
              /* TEXT */
            )
          ])) : e.createCommentVNode("v-if", !0),
          l.project.status === "closing" && l.can.reviewSummary ? (e.openBlock(), e.createElementBlock("div", Zu, [
            k.value ? (e.openBlock(), e.createElementBlock(
              e.Fragment,
              { key: 1 },
              [
                e.createElementVNode(
                  "p",
                  lp,
                  e.toDisplayString(T.$t("直接改 Markdown 正文；统计数字以系统计算为准，不随正文修改。")),
                  1
                  /* TEXT */
                ),
                z[11] || (z[11] = e.createElementVNode(
                  "span",
                  { class: "grow" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createElementVNode("button", {
                  type: "button",
                  class: "ss-btn sm",
                  disabled: o.value,
                  onClick: z[2] || (z[2] = (R) => k.value = !1)
                }, e.toDisplayString(T.$t("取消")), 9, np),
                e.createElementVNode("button", {
                  type: "button",
                  class: "ss-btn sm primary",
                  disabled: o.value || !h.value.trim(),
                  "data-test": "mm-summary-save",
                  onClick: U
                }, [
                  e.createElementVNode(
                    "i",
                    {
                      class: e.normalizeClass(o.value ? "ri-loader-4-line spin" : "ri-save-line")
                    },
                    null,
                    2
                    /* CLASS */
                  ),
                  e.createTextVNode(
                    e.toDisplayString(T.$t("保存修改")),
                    1
                    /* TEXT */
                  )
                ], 8, op)
              ],
              64
              /* STABLE_FRAGMENT */
            )) : (e.openBlock(), e.createElementBlock(
              e.Fragment,
              { key: 0 },
              [
                e.createElementVNode(
                  "p",
                  Xu,
                  e.toDisplayString(T.$t("看一遍总结，需要的话在线修改；审核通过后项目归档，全部只读，并通知项目成员。")),
                  1
                  /* TEXT */
                ),
                z[10] || (z[10] = e.createElementVNode(
                  "span",
                  { class: "grow" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createElementVNode("button", {
                  type: "button",
                  class: "ss-btn sm",
                  disabled: o.value || l.generating,
                  "data-test": "mm-summary-edit",
                  onClick: P
                }, [
                  z[9] || (z[9] = e.createElementVNode(
                    "i",
                    { class: "ri-edit-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(T.$t("在线修改")),
                    1
                    /* TEXT */
                  )
                ], 8, xu),
                e.createElementVNode("button", {
                  type: "button",
                  class: "ss-btn sm",
                  disabled: o.value || l.generating,
                  "data-test": "mm-summary-regen",
                  onClick: z[1] || (z[1] = (R) => M(!0))
                }, [
                  e.createElementVNode(
                    "i",
                    {
                      class: e.normalizeClass(o.value && d.value === "regen" ? "ri-loader-4-line spin" : "ri-refresh-line")
                    },
                    null,
                    2
                    /* CLASS */
                  ),
                  e.createTextVNode(
                    e.toDisplayString(T.$t("重新生成")),
                    1
                    /* TEXT */
                  )
                ], 8, ep),
                e.createElementVNode("button", {
                  type: "button",
                  class: "ss-btn sm primary",
                  disabled: o.value || l.generating,
                  "data-test": "mm-summary-approve",
                  onClick: C
                }, [
                  e.createElementVNode(
                    "i",
                    {
                      class: e.normalizeClass(o.value && d.value === "approve" ? "ri-loader-4-line spin" : "ri-checkbox-circle-line")
                    },
                    null,
                    2
                    /* CLASS */
                  ),
                  e.createTextVNode(
                    e.toDisplayString(T.$t("审核通过并归档")),
                    1
                    /* TEXT */
                  )
                ], 8, tp)
              ],
              64
              /* STABLE_FRAGMENT */
            ))
          ])) : l.project.status === "closing" ? (e.openBlock(), e.createElementBlock("p", ap, [
            z[12] || (z[12] = e.createElementVNode(
              "i",
              { class: "ri-time-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(T.$t("总结报告待项目负责人审核，审核通过后项目归档。")),
              1
              /* TEXT */
            )
          ])) : l.project.status === "archived" ? (e.openBlock(), e.createElementBlock("p", sp, [
            z[13] || (z[13] = e.createElementVNode(
              "i",
              { class: "ri-archive-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(T.$t("项目已归档，全部内容只读。")),
              1
              /* TEXT */
            )
          ])) : e.createCommentVNode("v-if", !0),
          k.value ? e.withDirectives((e.openBlock(), e.createElementBlock("textarea", {
            key: 4,
            "onUpdate:modelValue": z[3] || (z[3] = (R) => h.value = R),
            class: "mm-psm__editor",
            rows: "24",
            "aria-label": T.$t("总结报告正文"),
            "data-test": "mm-summary-editor"
          }, null, 8, rp)), [
            [e.vModelText, h.value]
          ]) : (e.openBlock(), e.createBlock(Ut, {
            key: 5,
            report: g.value,
            "approver-name": N.value
          }, null, 8, ["report", "approver-name"]))
        ],
        64
        /* STABLE_FRAGMENT */
      )) : (e.openBlock(), e.createElementBlock(
        e.Fragment,
        { key: 2 },
        [
          l.generating || o.value && d.value === "regen" ? (e.openBlock(), e.createElementBlock("div", Gu, [
            z[5] || (z[5] = e.createElementVNode(
              "i",
              {
                class: "ri-loader-4-line spin",
                "aria-hidden": "true"
              },
              null,
              -1
              /* CACHED */
            )),
            e.createElementVNode("div", null, [
              e.createElementVNode(
                "strong",
                null,
                e.toDisplayString(T.$t("AI 正在生成项目总结报告…")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "small",
                null,
                e.toDisplayString(a.value),
                1
                /* TEXT */
              )
            ])
          ])) : (e.openBlock(), e.createElementBlock("div", Yu, [
            z[7] || (z[7] = e.createElementVNode(
              "i",
              {
                class: "ri-file-warning-line",
                "aria-hidden": "true"
              },
              null,
              -1
              /* CACHED */
            )),
            e.createElementVNode("div", null, [
              e.createElementVNode(
                "strong",
                null,
                e.toDisplayString(T.$t("总结报告还没有生成")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "small",
                null,
                e.toDisplayString(l.isOwner ? T.$t("上次生成可能没成功，点「重新生成」再试一次") : T.$t("等项目负责人重新生成")),
                1
                /* TEXT */
              )
            ]),
            l.isOwner ? (e.openBlock(), e.createElementBlock("button", {
              key: 0,
              type: "button",
              class: "ss-btn sm primary",
              disabled: o.value,
              "data-test": "mm-summary-regen-empty",
              onClick: z[0] || (z[0] = (R) => M(!1))
            }, [
              z[6] || (z[6] = e.createElementVNode(
                "i",
                { class: "ri-refresh-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(T.$t("重新生成")),
                1
                /* TEXT */
              )
            ], 8, Ju)) : e.createCommentVNode("v-if", !0)
          ]))
        ],
        64
        /* STABLE_FRAGMENT */
      ))
    ]));
  }
}), cp = /* @__PURE__ */ oe(ip, [["__scopeId", "data-v-a7ff6e93"]]), Ot = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/components/TModal.vue"];
if (!Ot) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/components/TModal.vue");
const Ze = Ot.default, dp = { class: "mm-pp" }, mp = {
  key: 0,
  class: "mm-pp__chosen"
}, up = ["aria-label", "onClick"], pp = { key: 1 }, vp = { class: "mm-pp__search" }, kp = ["placeholder"], yp = ["aria-multiselectable"], gp = { class: "mm-pp__dept" }, fp = ["aria-selected", "disabled", "data-test", "onClick"], Np = { key: 0 }, Vp = {
  key: 1,
  class: "ri-check-line",
  "aria-hidden": "true"
}, Ep = {
  key: 0,
  class: "mm-pp__empty"
}, $p = /* @__PURE__ */ e.defineComponent({
  __name: "PersonPicker",
  props: {
    people: {},
    depts: {},
    modelValue: {},
    multiple: { type: Boolean, default: !0 },
    locked: {},
    lockedHint: {},
    maxHeight: { default: 220 }
  },
  emits: ["update:modelValue"],
  setup(l, { emit: u }) {
    const n = l, p = u, f = e.ref(""), s = e.computed(() => {
      const c = n.modelValue;
      return Array.isArray(c) ? c : c ? [c] : [];
    }), o = (c) => s.value.includes(c), d = (c) => n.depts.find((g) => g.id === c)?.name || "", i = e.computed(() => n.people.filter((c) => !c.left)), k = e.computed(() => s.value.map((c) => n.people.find((g) => g.id === c)).filter((c) => !!c)), h = e.computed(() => {
      const c = [], g = /* @__PURE__ */ new Map();
      for (const N of i.value) {
        if (!vt(N, d(N.deptId), f.value)) continue;
        const a = g.get(N.deptId) ?? [];
        a.push(N), g.set(N.deptId, a);
      }
      for (const N of n.depts) {
        const a = g.get(N.id);
        a?.length && c.push({ id: N.id, name: N.name, people: a }), g.delete(N.id);
      }
      for (const [N, a] of g) c.push({ id: N, name: d(N) || "—", people: a });
      return c;
    });
    function m(c) {
      if (!n.multiple) {
        p("update:modelValue", c);
        return;
      }
      if (o(c)) {
        if (n.locked?.includes(c)) return;
        p("update:modelValue", s.value.filter((g) => g !== c));
      } else
        p("update:modelValue", [...s.value, c]);
    }
    return (c, g) => (e.openBlock(), e.createElementBlock("div", dp, [
      l.multiple && k.value.length ? (e.openBlock(), e.createElementBlock("div", mp, [
        (e.openBlock(!0), e.createElementBlock(
          e.Fragment,
          null,
          e.renderList(k.value, (N) => (e.openBlock(), e.createElementBlock("span", {
            key: N.id,
            class: "mm-pp__chip"
          }, [
            e.createElementVNode(
              "i",
              {
                style: e.normalizeStyle({ background: e.unref(re)(N.name).color }),
                "aria-hidden": "true"
              },
              e.toDisplayString(e.unref(re)(N.name).text),
              5
              /* TEXT, STYLE */
            ),
            e.createTextVNode(
              e.toDisplayString(N.name) + " ",
              1
              /* TEXT */
            ),
            l.locked?.includes(N.id) ? (e.openBlock(), e.createElementBlock(
              "em",
              pp,
              e.toDisplayString(l.lockedHint || ""),
              1
              /* TEXT */
            )) : (e.openBlock(), e.createElementBlock("button", {
              key: 0,
              type: "button",
              "aria-label": c.$t("移除 {name}", { name: N.name }),
              onClick: (a) => m(N.id)
            }, [...g[1] || (g[1] = [
              e.createElementVNode(
                "i",
                { class: "ri-close-line" },
                null,
                -1
                /* CACHED */
              )
            ])], 8, up))
          ]))),
          128
          /* KEYED_FRAGMENT */
        ))
      ])) : e.createCommentVNode("v-if", !0),
      e.createElementVNode("div", vp, [
        g[2] || (g[2] = e.createElementVNode(
          "i",
          {
            class: "ri-search-line",
            "aria-hidden": "true"
          },
          null,
          -1
          /* CACHED */
        )),
        e.withDirectives(e.createElementVNode("input", {
          "onUpdate:modelValue": g[0] || (g[0] = (N) => f.value = N),
          type: "search",
          placeholder: c.$t("搜索姓名、部门")
        }, null, 8, kp), [
          [e.vModelText, f.value]
        ])
      ]),
      e.createElementVNode("ul", {
        class: "mm-pp__list",
        style: e.normalizeStyle({ maxHeight: `${l.maxHeight}px` }),
        role: "listbox",
        "aria-multiselectable": l.multiple
      }, [
        (e.openBlock(!0), e.createElementBlock(
          e.Fragment,
          null,
          e.renderList(h.value, (N) => (e.openBlock(), e.createElementBlock("li", {
            key: N.id
          }, [
            e.createElementVNode(
              "p",
              gp,
              e.toDisplayString(N.name),
              1
              /* TEXT */
            ),
            (e.openBlock(!0), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(N.people, (a) => (e.openBlock(), e.createElementBlock("button", {
                key: a.id,
                type: "button",
                role: "option",
                class: e.normalizeClass(["mm-pp__opt", { on: o(a.id) }]),
                "aria-selected": o(a.id),
                disabled: l.locked?.includes(a.id) && o(a.id),
                "data-test": `mm-pp-${a.id}`,
                onClick: (I) => m(a.id)
              }, [
                e.createElementVNode(
                  "i",
                  {
                    style: e.normalizeStyle({ background: e.unref(re)(a.name).color }),
                    "aria-hidden": "true"
                  },
                  e.toDisplayString(e.unref(re)(a.name).text),
                  5
                  /* TEXT, STYLE */
                ),
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(a.name),
                  1
                  /* TEXT */
                ),
                a.title ? (e.openBlock(), e.createElementBlock(
                  "small",
                  Np,
                  e.toDisplayString(a.title),
                  1
                  /* TEXT */
                )) : e.createCommentVNode("v-if", !0),
                o(a.id) ? (e.openBlock(), e.createElementBlock("b", Vp)) : e.createCommentVNode("v-if", !0)
              ], 10, fp))),
              128
              /* KEYED_FRAGMENT */
            ))
          ]))),
          128
          /* KEYED_FRAGMENT */
        )),
        h.value.length ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock(
          "li",
          Ep,
          e.toDisplayString(c.$t("没有匹配的人员")),
          1
          /* TEXT */
        ))
      ], 12, yp)
    ]));
  }
}), we = /* @__PURE__ */ oe($p, [["__scopeId", "data-v-60f28bb6"]]), bp = {
  class: "mm-pmd",
  "data-test": "mm-project-members"
}, hp = { class: "ss-muted" }, _p = {
  key: 0,
  class: "ss-muted"
}, Bp = {
  key: 1,
  class: "ss-note danger",
  "data-test": "mm-pm-error"
}, Sp = ["disabled"], Dp = /* @__PURE__ */ e.defineComponent({
  __name: "ProjectMembersDialog",
  props: {
    open: { type: Boolean },
    projectId: {},
    ownerId: {},
    memberIds: {},
    members: {}
  },
  emits: ["close", "saved"],
  setup(l, { emit: u }) {
    const n = l, p = u, f = e.ref([]), s = e.ref([]), o = e.ref([]), d = e.ref(!1), i = e.ref(""), k = e.computed(() => o.value.length !== n.memberIds.length || o.value.some((c) => !n.memberIds.includes(c))), h = e.computed(() => n.memberIds.filter((c) => !o.value.includes(c)).map((c) => f.value.find((g) => g.id === c)?.name || n.members?.find((g) => g.id === c)?.name || c));
    e.watch(() => n.open, async (c) => {
      if (c) {
        o.value = [...n.memberIds], i.value = "";
        try {
          const g = await Y("people.list"), N = (n.members ?? []).filter((a) => !(g?.people ?? []).some((I) => I.id === a.id)).map((a) => ({ ...a, left: !1 }));
          f.value = [...g?.people ?? [], ...N], s.value = g?.depts ?? [];
        } catch (g) {
          i.value = Z.errorMessage(g);
        }
      }
    }, { immediate: !0 });
    async function m() {
      d.value = !0, i.value = "";
      try {
        const c = [.../* @__PURE__ */ new Set([n.ownerId, ...o.value])], g = await Y("project.members", { id: n.projectId, memberIds: c });
        p("saved", g);
      } catch (c) {
        i.value = Z.errorMessage(c);
      } finally {
        d.value = !1;
      }
    }
    return (c, g) => (e.openBlock(), e.createBlock(Ze, {
      open: l.open,
      title: c.$t("编辑成员"),
      icon: "ri-team-line",
      size: "md",
      onClose: g[2] || (g[2] = (N) => p("close"))
    }, {
      footer: e.withCtx(() => [
        e.createElementVNode(
          "button",
          {
            type: "button",
            class: "ss-btn",
            onClick: g[1] || (g[1] = (N) => p("close"))
          },
          e.toDisplayString(c.$t("取消")),
          1
          /* TEXT */
        ),
        e.createElementVNode("button", {
          type: "button",
          class: "ss-btn primary",
          disabled: d.value || !k.value,
          "data-test": "mm-pm-save",
          onClick: m
        }, [
          e.createElementVNode(
            "i",
            {
              class: e.normalizeClass(d.value ? "ri-loader-4-line spin" : "ri-check-line")
            },
            null,
            2
            /* CLASS */
          ),
          e.createTextVNode(
            e.toDisplayString(c.$t("保存")),
            1
            /* TEXT */
          )
        ], 8, Sp)
      ]),
      default: e.withCtx(() => [
        e.createElementVNode("div", bp, [
          e.createElementVNode(
            "p",
            hp,
            e.toDisplayString(c.$t("项目负责人不能移除；成员还有未完成的待办或任务时也不能移除。")),
            1
            /* TEXT */
          ),
          e.createVNode(we, {
            modelValue: o.value,
            "onUpdate:modelValue": g[0] || (g[0] = (N) => o.value = N),
            people: f.value,
            depts: s.value,
            locked: [l.ownerId],
            "locked-hint": c.$t("负责人"),
            "max-height": 300
          }, null, 8, ["modelValue", "people", "depts", "locked", "locked-hint"]),
          h.value.length ? (e.openBlock(), e.createElementBlock(
            "p",
            _p,
            e.toDisplayString(c.$t("将移除：{names}", { names: h.value.join(c.$t("、")) })),
            1
            /* TEXT */
          )) : e.createCommentVNode("v-if", !0),
          i.value ? (e.openBlock(), e.createElementBlock("p", Bp, [
            g[3] || (g[3] = e.createElementVNode(
              "i",
              { class: "ri-error-warning-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(i.value),
              1
              /* TEXT */
            )
          ])) : e.createCommentVNode("v-if", !0)
        ])
      ]),
      _: 1
      /* STABLE */
    }, 8, ["open", "title"]));
  }
}), wp = /* @__PURE__ */ oe(Dp, [["__scopeId", "data-v-a1802897"]]), Cp = {
  class: "mm-pd",
  "data-test": "mm-project-detail"
}, Tp = {
  key: 0,
  class: "mm-pd__loading"
}, Ip = {
  key: 1,
  class: "ss-note danger"
}, Mp = { class: "mm-pd__head" }, Ap = { class: "mm-pd__titlerow" }, jp = ["aria-label"], Lp = ["aria-current"], zp = ["aria-label", "aria-expanded"], Fp = {
  key: 0,
  class: "mm-more__menu",
  role: "menu"
}, Pp = ["disabled"], Up = ["disabled"], Op = { class: "mm-pd__meta" }, Rp = {
  key: 0,
  class: "mm-pd__desc"
}, qp = {
  key: 1,
  class: "mm-pd__fail",
  "data-test": "mm-close-fail"
}, Kp = ["aria-label"], Hp = { class: "ss-muted" }, Wp = { class: "mm-block-list" }, Gp = { class: "t" }, Yp = ["onClick"], Jp = {
  class: "mm-pd__stats",
  "data-test": "mm-project-stats"
}, Qp = { class: "brand" }, Zp = {
  class: "mm-pd__tabs",
  role: "tablist"
}, Xp = ["aria-selected", "data-test", "onClick"], xp = { key: 0 }, ev = {
  key: 2,
  class: "mm-pd__ov"
}, tv = { class: "mm-pd__ovl" }, lv = {
  key: 0,
  class: "mm-pd__blockers",
  "data-test": "mm-close-blockers"
}, nv = { class: "mm-block-list" }, ov = ["title"], av = { key: 0 }, sv = ["data-test", "onClick"], rv = {
  key: 1,
  class: "ss-note ok"
}, iv = { class: "mm-pd__depts" }, cv = {
  key: 0,
  class: "ss-muted"
}, dv = { key: 1 }, mv = { class: "n" }, uv = { class: "mm-bar wide" }, pv = { class: "v" }, vv = { class: "mm-pd__ovr" }, kv = { class: "mm-pd__decisions" }, yv = {
  key: 0,
  class: "ss-muted"
}, gv = {
  key: 1,
  class: "mm-tl"
}, fv = ["onClick"], Nv = { class: "mm-pd__members" }, Vv = { class: "mm-avs" }, Ev = ["title", "aria-label"], $v = { class: "mm-pd__list" }, bv = { class: "mm-pd__listbar" }, hv = { class: "ss-muted" }, _v = {
  key: 0,
  class: "ss-empty"
}, Bv = ["data-test", "onClick"], Sv = { class: "t" }, Dv = {
  key: 0,
  class: "mm-tag warn"
}, wv = { class: "mm-pd__list" }, Cv = /* @__PURE__ */ e.defineComponent({
  __name: "ProjectDetail",
  props: {
    projectId: {},
    refreshSeq: { default: 0 },
    focus: { default: null }
  },
  emits: ["changed", "role"],
  setup(l, { emit: u }) {
    const n = l, p = u, f = $e.useDialog(), s = ie.useNotificationStore(), o = e.ref(null), d = e.ref(!1), i = e.ref(!1), k = e.ref(""), h = e.ref("overview"), m = e.ref(""), c = e.ref(null), g = e.ref(!1), N = e.ref(!1), a = e.ref(!1), I = e.ref(null), P = e.computed(() => o.value?.project ?? null), U = e.computed(() => P.value ? Al(P.value.status) : 0), M = e.computed(() => bt(o.value?.closeBlockers)), C = e.computed(() => !!P.value && P.value.ownerId === ne.value?.me.person?.id), T = e.computed(() => [
      { key: "overview", title: t.t("概览"), count: void 0 },
      { key: "meetings", title: t.t("会议"), count: o.value?.meetings.length ?? 0 },
      { key: "tasks", title: t.t("任务"), count: o.value?.tasks.length ?? 0 },
      { key: "reports", title: t.t("进度报告"), count: P.value?.weeklyReports?.length ?? 0 },
      { key: "summary", title: t.t("总结报告"), count: void 0 }
    ]);
    function z(y) {
      return y === "failed" ? "bad" : y === "dispatched" || y === "ended" ? "ok" : y === "processing" ? "brand" : "warn";
    }
    let R = 0;
    async function _() {
      if (!n.projectId) return;
      const y = ++R;
      d.value = !0;
      try {
        const V = await Y("project.get", { id: n.projectId });
        if (y !== R) return;
        o.value = V, p("role", Ml(V.project, ne.value?.me.person?.id)), k.value = "";
      } catch (V) {
        y === R && (k.value = Z.errorMessage(V));
      } finally {
        y === R && (d.value = !1);
      }
    }
    e.watch(() => n.projectId, () => {
      o.value = null, c.value = null, g.value = !1, h.value = "overview", _();
    }, { immediate: !0 }), e.watch(() => n.refreshSeq, () => {
      _();
    }), e.watch(() => n.focus?.seq, () => {
      n.focus && (h.value = n.focus.tab, m.value = n.focus.reportId || "");
    }, { immediate: !0 });
    async function E() {
      if (!(!P.value || !await f.confirm({
        title: t.t("发起结项"),
        message: t.t("先检查：所有会议已派发或已结束、所有任务已完成或已取消、没有处理中的异议。通过后项目进入「结项中」，不能再新建会议和任务，也不能撤回；AI 随后生成总结报告交你审核。"),
        confirmLabel: t.t("检查并结项")
      }))) {
        i.value = !0, k.value = "";
        try {
          const V = await Y("project.close", { id: P.value.id });
          V?.ok ? (c.value = null, s.success(t.t("结项检查通过，项目进入结项中，AI 正在生成总结报告")), h.value = "summary") : c.value = bt(V?.items), await _(), p("changed");
        } catch (V) {
          k.value = Z.errorMessage(V);
        } finally {
          i.value = !1;
        }
      }
    }
    async function v() {
      await _(), p("changed");
    }
    async function S() {
      N.value = !1, s.success(t.t("成员已更新")), await _(), p("changed");
    }
    function j(y) {
      a.value = !1, p("changed"), y && de({ kind: "meeting", id: y });
    }
    function J(y) {
      g.value && I.value && !I.value.contains(y.target) && (g.value = !1);
    }
    return e.onMounted(() => document.addEventListener("click", J)), e.onBeforeUnmount(() => document.removeEventListener("click", J)), (y, V) => (e.openBlock(), e.createElementBlock("section", Cp, [
      d.value && !o.value ? (e.openBlock(), e.createElementBlock("p", Tp, [
        V[8] || (V[8] = e.createElementVNode(
          "i",
          { class: "ri-loader-4-line spin" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(y.$t("加载中…")),
          1
          /* TEXT */
        )
      ])) : e.createCommentVNode("v-if", !0),
      k.value ? (e.openBlock(), e.createElementBlock("p", Ip, [
        V[9] || (V[9] = e.createElementVNode(
          "i",
          { class: "ri-error-warning-line" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(k.value),
          1
          /* TEXT */
        )
      ])) : e.createCommentVNode("v-if", !0),
      o.value && P.value ? (e.openBlock(), e.createElementBlock(
        e.Fragment,
        { key: 2 },
        [
          e.createCommentVNode(" 顶部：名称 + 状态 + 进度条（sticky，滚动时始终可见） "),
          e.createElementVNode("header", Mp, [
            e.createElementVNode("div", Ap, [
              e.createElementVNode(
                "h3",
                null,
                e.toDisplayString(P.value.name),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "span",
                {
                  class: e.normalizeClass(["mm-tag", e.unref(jl)(P.value.status)]),
                  "data-test": "mm-project-status"
                },
                e.toDisplayString(e.unref(Ge)[P.value.status]),
                3
                /* TEXT, CLASS */
              ),
              V[14] || (V[14] = e.createElementVNode(
                "span",
                { class: "grow" },
                null,
                -1
                /* CACHED */
              )),
              e.createElementVNode("ol", {
                class: "mm-steps",
                "aria-label": y.$t("项目状态")
              }, [
                (e.openBlock(!0), e.createElementBlock(
                  e.Fragment,
                  null,
                  e.renderList(e.unref(jt), (r, W) => (e.openBlock(), e.createElementBlock(
                    e.Fragment,
                    { key: r },
                    [
                      W > 0 ? (e.openBlock(), e.createElementBlock(
                        "li",
                        {
                          key: 0,
                          class: e.normalizeClass(["mm-steps__line", { done: W <= U.value }]),
                          "aria-hidden": "true"
                        },
                        null,
                        2
                        /* CLASS */
                      )) : e.createCommentVNode("v-if", !0),
                      e.createElementVNode("li", {
                        class: e.normalizeClass(["mm-steps__step", { done: W < U.value, on: W === U.value }]),
                        "aria-current": W === U.value ? "step" : void 0
                      }, [
                        V[10] || (V[10] = e.createElementVNode(
                          "i",
                          { "aria-hidden": "true" },
                          null,
                          -1
                          /* CACHED */
                        )),
                        e.createTextVNode(
                          e.toDisplayString(e.unref(Ge)[r]),
                          1
                          /* TEXT */
                        )
                      ], 10, Lp)
                    ],
                    64
                    /* STABLE_FRAGMENT */
                  ))),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ], 8, jp),
              e.createElementVNode(
                "div",
                {
                  ref_key: "moreEl",
                  ref: I,
                  class: "mm-more"
                },
                [
                  e.createElementVNode("button", {
                    type: "button",
                    class: "mm-more__btn",
                    "aria-label": y.$t("更多"),
                    "aria-expanded": g.value,
                    "data-test": "mm-project-more",
                    onClick: V[0] || (V[0] = e.withModifiers((r) => g.value = !g.value, ["stop"]))
                  }, [...V[11] || (V[11] = [
                    e.createElementVNode(
                      "i",
                      { class: "ri-more-fill" },
                      null,
                      -1
                      /* CACHED */
                    )
                  ])], 8, zp),
                  g.value ? (e.openBlock(), e.createElementBlock("div", Fp, [
                    e.createElementVNode("button", {
                      type: "button",
                      role: "menuitem",
                      disabled: !o.value.can.editMembers,
                      "data-test": "mm-project-edit-members",
                      onClick: V[1] || (V[1] = (r) => {
                        g.value = !1, N.value = !0;
                      })
                    }, [
                      V[12] || (V[12] = e.createElementVNode(
                        "i",
                        { class: "ri-team-line" },
                        null,
                        -1
                        /* CACHED */
                      )),
                      e.createTextVNode(
                        e.toDisplayString(y.$t("编辑成员")),
                        1
                        /* TEXT */
                      )
                    ], 8, Pp),
                    e.createElementVNode("button", {
                      type: "button",
                      role: "menuitem",
                      onClick: V[2] || (V[2] = (r) => {
                        g.value = !1, _();
                      })
                    }, [
                      V[13] || (V[13] = e.createElementVNode(
                        "i",
                        { class: "ri-refresh-line" },
                        null,
                        -1
                        /* CACHED */
                      )),
                      e.createTextVNode(
                        e.toDisplayString(y.$t("刷新")),
                        1
                        /* TEXT */
                      )
                    ])
                  ])) : e.createCommentVNode("v-if", !0)
                ],
                512
                /* NEED_PATCH */
              ),
              o.value.can.close && P.value.status === "active" ? (e.openBlock(), e.createElementBlock("button", {
                key: 0,
                type: "button",
                class: "ss-btn primary",
                disabled: i.value,
                "data-test": "mm-project-close",
                onClick: E
              }, [
                e.createElementVNode(
                  "i",
                  {
                    class: e.normalizeClass(i.value ? "ri-loader-4-line spin" : "ri-flag-2-line")
                  },
                  null,
                  2
                  /* CLASS */
                ),
                e.createTextVNode(
                  e.toDisplayString(y.$t("发起结项")),
                  1
                  /* TEXT */
                )
              ], 8, Up)) : e.createCommentVNode("v-if", !0)
            ]),
            e.createElementVNode(
              "p",
              Op,
              e.toDisplayString(y.$t("负责人 {owner} · {n} 位成员 · {date} 创建", { owner: o.value.ownerName, n: o.value.members.length, date: e.unref(at)(P.value.createdAt) })),
              1
              /* TEXT */
            )
          ]),
          P.value.desc ? (e.openBlock(), e.createElementBlock(
            "p",
            Rp,
            e.toDisplayString(P.value.desc),
            1
            /* TEXT */
          )) : e.createCommentVNode("v-if", !0),
          e.createCommentVNode(" 结项检查不通过：列出未完成事项 "),
          c.value ? (e.openBlock(), e.createElementBlock("section", qp, [
            e.createElementVNode("header", null, [
              e.createElementVNode(
                "strong",
                null,
                e.toDisplayString(y.$t("结项检查未通过，还有 {n} 项未完成", { n: c.value.length })),
                1
                /* TEXT */
              ),
              e.createElementVNode("button", {
                type: "button",
                class: "mm-x",
                "aria-label": y.$t("关闭"),
                onClick: V[3] || (V[3] = (r) => c.value = null)
              }, [...V[15] || (V[15] = [
                e.createElementVNode(
                  "i",
                  { class: "ri-close-line" },
                  null,
                  -1
                  /* CACHED */
                )
              ])], 8, Kp)
            ]),
            e.createElementVNode(
              "p",
              Hp,
              e.toDisplayString(y.$t("结项要求：所有会议已派发或已结束、所有任务已完成或已取消、没有处理中的异议。")),
              1
              /* TEXT */
            ),
            e.createElementVNode("ul", Wp, [
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(c.value, (r) => (e.openBlock(), e.createElementBlock("li", {
                  key: `${r.kind}-${r.id}`
                }, [
                  e.createElementVNode(
                    "span",
                    {
                      class: e.normalizeClass(["mm-tag", e.unref(Be)(r, o.value.tasks, { canArbitrate: !!o.value.can.close }).tone])
                    },
                    e.toDisplayString(e.unref(Be)(r, o.value.tasks, { canArbitrate: !!o.value.can.close }).chip),
                    3
                    /* TEXT, CLASS */
                  ),
                  e.createElementVNode("span", Gp, [
                    e.createTextVNode(
                      e.toDisplayString(r.title),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "small",
                      null,
                      " · " + e.toDisplayString(r.reason),
                      1
                      /* TEXT */
                    )
                  ]),
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-link",
                    onClick: (W) => e.unref(de)(e.unref(Be)(r, o.value.tasks, { canArbitrate: !!o.value.can.close }).link)
                  }, [
                    e.createTextVNode(
                      e.toDisplayString(e.unref(Be)(r, o.value.tasks, { canArbitrate: !!o.value.can.close }).action) + " ",
                      1
                      /* TEXT */
                    ),
                    V[16] || (V[16] = e.createElementVNode(
                      "i",
                      { class: "ri-arrow-right-s-line" },
                      null,
                      -1
                      /* CACHED */
                    ))
                  ], 8, Yp)
                ]))),
                128
                /* KEYED_FRAGMENT */
              ))
            ])
          ])) : e.createCommentVNode("v-if", !0),
          e.createCommentVNode(" 5 个统计 "),
          e.createElementVNode("ul", Jp, [
            e.createElementVNode("li", null, [
              e.createElementVNode(
                "b",
                null,
                e.toDisplayString(y.$t("{n} 场", { n: o.value.stats.meetings })),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "small",
                null,
                e.toDisplayString(y.$t("会议")),
                1
                /* TEXT */
              )
            ]),
            e.createElementVNode("li", null, [
              e.createElementVNode(
                "b",
                null,
                e.toDisplayString(o.value.stats.done) + " / " + e.toDisplayString(o.value.stats.total),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "small",
                null,
                e.toDisplayString(y.$t("任务完成")),
                1
                /* TEXT */
              )
            ]),
            e.createElementVNode(
              "li",
              {
                class: e.normalizeClass({ bad: o.value.stats.overdue > 0 })
              },
              [
                e.createElementVNode(
                  "b",
                  null,
                  e.toDisplayString(o.value.stats.overdue),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "small",
                  null,
                  e.toDisplayString(y.$t("逾期任务")),
                  1
                  /* TEXT */
                )
              ],
              2
              /* CLASS */
            ),
            e.createElementVNode(
              "li",
              {
                class: e.normalizeClass({ warn: o.value.stats.objections > 0 })
              },
              [
                e.createElementVNode(
                  "b",
                  null,
                  e.toDisplayString(o.value.stats.objections),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "small",
                  null,
                  e.toDisplayString(y.$t("处理中异议")),
                  1
                  /* TEXT */
                )
              ],
              2
              /* CLASS */
            ),
            e.createElementVNode("li", Qp, [
              e.createElementVNode(
                "b",
                null,
                e.toDisplayString(e.unref(fe)(o.value.stats.weekRate)) + "%",
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "small",
                null,
                e.toDisplayString(y.$t("本周完成率")),
                1
                /* TEXT */
              )
            ])
          ]),
          e.createElementVNode("nav", Zp, [
            (e.openBlock(!0), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(T.value, (r) => (e.openBlock(), e.createElementBlock("button", {
                key: r.key,
                type: "button",
                role: "tab",
                "aria-selected": h.value === r.key,
                class: e.normalizeClass({ on: h.value === r.key }),
                "data-test": `mm-pd-tab-${r.key}`,
                onClick: (W) => h.value = r.key
              }, [
                e.createTextVNode(
                  e.toDisplayString(r.title),
                  1
                  /* TEXT */
                ),
                r.count !== void 0 ? (e.openBlock(), e.createElementBlock(
                  "em",
                  xp,
                  e.toDisplayString(r.count),
                  1
                  /* TEXT */
                )) : e.createCommentVNode("v-if", !0)
              ], 10, Xp))),
              128
              /* KEYED_FRAGMENT */
            ))
          ]),
          e.createCommentVNode(" 概览 "),
          h.value === "overview" ? (e.openBlock(), e.createElementBlock("div", ev, [
            e.createElementVNode("div", tv, [
              P.value.status === "active" && M.value.length ? (e.openBlock(), e.createElementBlock("section", lv, [
                e.createElementVNode(
                  "h4",
                  null,
                  e.toDisplayString(y.$t("结项前需处理 · {n} 项", { n: M.value.length })),
                  1
                  /* TEXT */
                ),
                e.createElementVNode("ul", nv, [
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(M.value, (r) => (e.openBlock(), e.createElementBlock("li", {
                      key: `${r.kind}-${r.id}`
                    }, [
                      e.createElementVNode(
                        "span",
                        {
                          class: e.normalizeClass(["mm-tag", e.unref(Be)(r, o.value.tasks, { canArbitrate: !!o.value.can.close }).tone])
                        },
                        e.toDisplayString(e.unref(Be)(r, o.value.tasks, { canArbitrate: !!o.value.can.close }).chip),
                        3
                        /* TEXT, CLASS */
                      ),
                      e.createElementVNode("span", {
                        class: "t",
                        title: r.reason ? `${r.title} · ${r.reason}` : r.title
                      }, [
                        e.createTextVNode(
                          e.toDisplayString(r.title),
                          1
                          /* TEXT */
                        ),
                        r.reason ? (e.openBlock(), e.createElementBlock(
                          "small",
                          av,
                          " · " + e.toDisplayString(r.reason),
                          1
                          /* TEXT */
                        )) : e.createCommentVNode("v-if", !0)
                      ], 8, ov),
                      e.createElementVNode("button", {
                        type: "button",
                        class: "ss-link",
                        "data-test": `mm-blocker-${r.id}`,
                        onClick: (W) => e.unref(de)(e.unref(Be)(r, o.value.tasks, { canArbitrate: !!o.value.can.close }).link)
                      }, [
                        e.createTextVNode(
                          e.toDisplayString(e.unref(Be)(r, o.value.tasks, { canArbitrate: !!o.value.can.close }).action) + " ",
                          1
                          /* TEXT */
                        ),
                        V[17] || (V[17] = e.createElementVNode(
                          "i",
                          { class: "ri-arrow-right-s-line" },
                          null,
                          -1
                          /* CACHED */
                        ))
                      ], 8, sv)
                    ]))),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ])
              ])) : P.value.status === "active" ? (e.openBlock(), e.createElementBlock("p", rv, [
                V[18] || (V[18] = e.createElementVNode(
                  "i",
                  { class: "ri-checkbox-circle-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(y.$t("会议、任务都已收尾，没有处理中的异议，可以发起结项。")),
                  1
                  /* TEXT */
                )
              ])) : e.createCommentVNode("v-if", !0),
              e.createElementVNode("section", iv, [
                e.createElementVNode(
                  "h4",
                  null,
                  e.toDisplayString(y.$t("各部门任务进度")),
                  1
                  /* TEXT */
                ),
                o.value.deptProgress.length ? (e.openBlock(), e.createElementBlock("ul", dv, [
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(o.value.deptProgress, (r) => (e.openBlock(), e.createElementBlock("li", {
                      key: r.deptId
                    }, [
                      e.createElementVNode(
                        "span",
                        mv,
                        e.toDisplayString(r.name),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode("i", uv, [
                        e.createElementVNode(
                          "b",
                          {
                            style: e.normalizeStyle({ width: `${e.unref(pt)(r.done, r.total)}%` })
                          },
                          null,
                          4
                          /* STYLE */
                        )
                      ]),
                      e.createElementVNode(
                        "span",
                        pv,
                        e.toDisplayString(r.done) + "/" + e.toDisplayString(r.total),
                        1
                        /* TEXT */
                      )
                    ]))),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ])) : (e.openBlock(), e.createElementBlock(
                  "p",
                  cv,
                  e.toDisplayString(y.$t("还没有任务")),
                  1
                  /* TEXT */
                ))
              ])
            ]),
            e.createElementVNode("div", vv, [
              e.createElementVNode("section", kv, [
                e.createElementVNode("h4", null, [
                  e.createTextVNode(
                    e.toDisplayString(y.$t("关键决策")) + " ",
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "small",
                    null,
                    e.toDisplayString(y.$t("来自会议纪要")),
                    1
                    /* TEXT */
                  )
                ]),
                o.value.decisions.length ? (e.openBlock(), e.createElementBlock("ol", gv, [
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(o.value.decisions, (r, W) => (e.openBlock(), e.createElementBlock("li", { key: W }, [
                      V[20] || (V[20] = e.createElementVNode(
                        "i",
                        {
                          class: "mm-tl__dot",
                          "aria-hidden": "true"
                        },
                        null,
                        -1
                        /* CACHED */
                      )),
                      e.createElementVNode("div", null, [
                        e.createElementVNode(
                          "p",
                          null,
                          e.toDisplayString(r.text),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode("time", null, [
                          e.createTextVNode(
                            e.toDisplayString(e.unref(rt)(r.at)),
                            1
                            /* TEXT */
                          ),
                          r.meetingTitle ? (e.openBlock(), e.createElementBlock(
                            e.Fragment,
                            { key: 0 },
                            [
                              V[19] || (V[19] = e.createTextVNode(
                                " · ",
                                -1
                                /* CACHED */
                              )),
                              r.meetingId ? (e.openBlock(), e.createElementBlock("button", {
                                key: 0,
                                type: "button",
                                class: "mm-linkish",
                                onClick: (X) => e.unref(de)({ kind: "meeting", id: r.meetingId })
                              }, e.toDisplayString(r.meetingTitle), 9, fv)) : (e.openBlock(), e.createElementBlock(
                                e.Fragment,
                                { key: 1 },
                                [
                                  e.createTextVNode(
                                    e.toDisplayString(r.meetingTitle),
                                    1
                                    /* TEXT */
                                  )
                                ],
                                64
                                /* STABLE_FRAGMENT */
                              ))
                            ],
                            64
                            /* STABLE_FRAGMENT */
                          )) : e.createCommentVNode("v-if", !0)
                        ])
                      ])
                    ]))),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ])) : (e.openBlock(), e.createElementBlock(
                  "p",
                  yv,
                  e.toDisplayString(y.$t("还没有定稿的决议")),
                  1
                  /* TEXT */
                ))
              ]),
              e.createElementVNode("section", Nv, [
                e.createElementVNode("h4", null, [
                  e.createTextVNode(
                    e.toDisplayString(y.$t("成员")) + " ",
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "small",
                    null,
                    e.toDisplayString(o.value.members.length),
                    1
                    /* TEXT */
                  )
                ]),
                e.createElementVNode("div", Vv, [
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(o.value.members, (r) => (e.openBlock(), e.createElementBlock("i", {
                      key: r.id,
                      style: e.normalizeStyle({ background: e.unref(re)(r.name).color }),
                      title: r.name,
                      "aria-label": r.name
                    }, e.toDisplayString(e.unref(re)(r.name).text), 13, Ev))),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ])
              ])
            ])
          ])) : h.value === "meetings" ? (e.openBlock(), e.createElementBlock(
            e.Fragment,
            { key: 3 },
            [
              e.createCommentVNode(" 会议 "),
              e.createElementVNode("div", $v, [
                e.createElementVNode("div", bv, [
                  e.createElementVNode(
                    "p",
                    hv,
                    e.toDisplayString(P.value.status === "active" ? y.$t("项目进行中才能新建会议。") : y.$t("项目已结项，不能再新建会议。")),
                    1
                    /* TEXT */
                  ),
                  V[22] || (V[22] = e.createElementVNode(
                    "span",
                    { class: "grow" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  o.value.can.createMeeting ? (e.openBlock(), e.createElementBlock("button", {
                    key: 0,
                    type: "button",
                    class: "ss-btn primary sm",
                    "data-test": "mm-project-new-meeting",
                    onClick: V[4] || (V[4] = (r) => a.value = !0)
                  }, [
                    V[21] || (V[21] = e.createElementVNode(
                      "i",
                      { class: "ri-add-line" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createTextVNode(
                      e.toDisplayString(y.$t("新建会议")),
                      1
                      /* TEXT */
                    )
                  ])) : e.createCommentVNode("v-if", !0)
                ]),
                o.value.meetings.length ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock(
                  "p",
                  _v,
                  e.toDisplayString(y.$t("这个项目还没有会议")),
                  1
                  /* TEXT */
                )),
                (e.openBlock(!0), e.createElementBlock(
                  e.Fragment,
                  null,
                  e.renderList(o.value.meetings, (r) => (e.openBlock(), e.createElementBlock("button", {
                    key: r.id,
                    type: "button",
                    class: "mm-mrow",
                    "data-test": `mm-pd-meeting-${r.id}`,
                    onClick: (W) => e.unref(de)({ kind: "meeting", id: r.id })
                  }, [
                    e.createElementVNode("span", Sv, [
                      e.createElementVNode(
                        "strong",
                        null,
                        e.toDisplayString(r.title),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode("small", null, [
                        e.createTextVNode(
                          e.toDisplayString(e.unref(Ne)(r.time)),
                          1
                          /* TEXT */
                        ),
                        r.confirmText ? (e.openBlock(), e.createElementBlock(
                          e.Fragment,
                          { key: 0 },
                          [
                            e.createTextVNode(
                              " · " + e.toDisplayString(r.confirmText),
                              1
                              /* TEXT */
                            )
                          ],
                          64
                          /* STABLE_FRAGMENT */
                        )) : e.createCommentVNode("v-if", !0)
                      ])
                    ]),
                    r.needsMe ? (e.openBlock(), e.createElementBlock(
                      "span",
                      Dv,
                      e.toDisplayString(y.$t("待你处理")),
                      1
                      /* TEXT */
                    )) : e.createCommentVNode("v-if", !0),
                    e.createElementVNode(
                      "span",
                      {
                        class: e.normalizeClass(["mm-tag", z(r.status)])
                      },
                      e.toDisplayString(e.unref(Xe)[r.status] || r.status),
                      3
                      /* TEXT, CLASS */
                    ),
                    V[23] || (V[23] = e.createElementVNode(
                      "i",
                      {
                        class: "ri-arrow-right-s-line",
                        "aria-hidden": "true"
                      },
                      null,
                      -1
                      /* CACHED */
                    ))
                  ], 8, Bv))),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ])
            ],
            2112
            /* STABLE_FRAGMENT, DEV_ROOT_FRAGMENT */
          )) : h.value === "tasks" ? (e.openBlock(), e.createElementBlock(
            e.Fragment,
            { key: 4 },
            [
              e.createCommentVNode(" 任务 "),
              e.createElementVNode("div", wv, [
                e.createVNode(Pt, {
                  tasks: o.value.tasks,
                  "group-by": "status",
                  "empty-text": y.$t("这个项目还没有任务"),
                  onSelect: V[5] || (V[5] = (r) => e.unref(de)({ kind: "task", id: r.id }))
                }, null, 8, ["tasks", "empty-text"])
              ])
            ],
            2112
            /* STABLE_FRAGMENT, DEV_ROOT_FRAGMENT */
          )) : h.value === "reports" ? (e.openBlock(), e.createBlock(qu, {
            key: 5,
            project: P.value,
            "focus-report-id": m.value,
            "can-generate": o.value.can.generateReport ?? P.value.status !== "archived",
            onChanged: v
          }, null, 8, ["project", "focus-report-id", "can-generate"])) : (e.openBlock(), e.createBlock(cp, {
            key: 6,
            project: P.value,
            can: o.value.can,
            members: o.value.members,
            generating: !!o.value.summaryGenerating,
            "is-owner": C.value,
            onChanged: v
          }, null, 8, ["project", "can", "members", "generating", "is-owner"]))
        ],
        64
        /* STABLE_FRAGMENT */
      )) : e.createCommentVNode("v-if", !0),
      o.value && P.value ? (e.openBlock(), e.createBlock(wp, {
        key: 3,
        open: N.value,
        "project-id": P.value.id,
        "owner-id": P.value.ownerId,
        "member-ids": P.value.memberIds,
        members: o.value.members,
        onClose: V[6] || (V[6] = (r) => N.value = !1),
        onSaved: S
      }, null, 8, ["open", "project-id", "owner-id", "member-ids", "members"])) : e.createCommentVNode("v-if", !0),
      o.value && P.value && a.value ? (e.openBlock(), e.createBlock(Ft, {
        key: 4,
        "project-id": P.value.id,
        onClose: V[7] || (V[7] = (r) => a.value = !1),
        onCreated: j
      }, null, 8, ["project-id"])) : e.createCommentVNode("v-if", !0)
    ]));
  }
}), Tv = /* @__PURE__ */ oe(Cv, [["__scopeId", "data-v-614cbe4b"]]), Iv = {
  class: "mm-pcd",
  "data-test": "mm-project-create"
}, Mv = { class: "ss-field" }, Av = ["placeholder"], jv = { class: "ss-field" }, Lv = ["placeholder"], zv = { class: "mm-pcd__cols" }, Fv = { class: "mm-pcd__f" }, Pv = { class: "mm-pcd__f" }, Uv = { class: "ss-muted" }, Ov = {
  key: 0,
  class: "ss-note danger"
}, Rv = ["disabled"], qv = /* @__PURE__ */ e.defineComponent({
  __name: "ProjectCreateDialog",
  props: {
    open: { type: Boolean }
  },
  emits: ["close", "created"],
  setup(l, { emit: u }) {
    const n = l, p = u, f = e.ref([]), s = e.ref([]), o = e.ref(!1), d = e.ref(""), i = e.reactive({ name: "", desc: "", ownerId: "", memberIds: [] }), k = e.computed(() => [.../* @__PURE__ */ new Set([...i.ownerId ? [i.ownerId] : [], ...i.memberIds])]);
    e.watch(() => n.open, async (m) => {
      if (!m) return;
      const c = ne.value?.me.person?.id || "";
      Object.assign(i, { name: "", desc: "", ownerId: c, memberIds: c ? [c] : [] }), d.value = "";
      try {
        const g = await Y("people.list");
        f.value = g?.people ?? [], s.value = g?.depts ?? [];
      } catch (g) {
        d.value = Z.errorMessage(g);
      }
    }, { immediate: !0 }), e.watch(() => i.ownerId, (m) => {
      m && !i.memberIds.includes(m) && (i.memberIds = [m, ...i.memberIds]);
    });
    async function h() {
      o.value = !0, d.value = "";
      try {
        const m = await Y("project.create", { name: i.name.trim(), desc: i.desc.trim(), ownerId: i.ownerId, memberIds: k.value });
        p("created", m);
      } catch (m) {
        d.value = Z.errorMessage(m);
      } finally {
        o.value = !1;
      }
    }
    return (m, c) => (e.openBlock(), e.createBlock(Ze, {
      open: l.open,
      title: m.$t("新建项目"),
      icon: "ri-folder-add-line",
      size: "lg",
      onClose: c[5] || (c[5] = (g) => p("close"))
    }, {
      footer: e.withCtx(() => [
        e.createElementVNode(
          "button",
          {
            type: "button",
            class: "ss-btn",
            onClick: c[4] || (c[4] = (g) => p("close"))
          },
          e.toDisplayString(m.$t("取消")),
          1
          /* TEXT */
        ),
        e.createElementVNode("button", {
          type: "button",
          class: "ss-btn primary",
          disabled: o.value || !i.name.trim() || !i.ownerId,
          "data-test": "mm-pc-submit",
          onClick: h
        }, [
          e.createElementVNode(
            "i",
            {
              class: e.normalizeClass(o.value ? "ri-loader-4-line spin" : "ri-check-line")
            },
            null,
            2
            /* CLASS */
          ),
          e.createTextVNode(
            e.toDisplayString(m.$t("创建项目")),
            1
            /* TEXT */
          )
        ], 8, Rv)
      ]),
      default: e.withCtx(() => [
        e.createElementVNode("div", Iv, [
          e.createElementVNode("label", Mv, [
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(m.$t("项目名称")),
              1
              /* TEXT */
            ),
            e.withDirectives(e.createElementVNode("input", {
              "onUpdate:modelValue": c[0] || (c[0] = (g) => i.name = g),
              type: "text",
              maxlength: "60",
              placeholder: m.$t("如：A2 量产导入项目"),
              "data-test": "mm-pc-name"
            }, null, 8, Av), [
              [e.vModelText, i.name]
            ])
          ]),
          e.createElementVNode("label", jv, [
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(m.$t("项目说明")),
              1
              /* TEXT */
            ),
            e.withDirectives(e.createElementVNode("textarea", {
              "onUpdate:modelValue": c[1] || (c[1] = (g) => i.desc = g),
              rows: "3",
              placeholder: m.$t("项目目标、范围、关键节点"),
              "data-test": "mm-pc-desc"
            }, null, 8, Lv), [
              [e.vModelText, i.desc]
            ])
          ]),
          e.createElementVNode("div", zv, [
            e.createElementVNode("div", Fv, [
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(m.$t("项目负责人")),
                1
                /* TEXT */
              ),
              e.createVNode(we, {
                modelValue: i.ownerId,
                "onUpdate:modelValue": c[2] || (c[2] = (g) => i.ownerId = g),
                people: f.value,
                depts: s.value,
                multiple: !1,
                "max-height": 240
              }, null, 8, ["modelValue", "people", "depts"])
            ]),
            e.createElementVNode("div", Pv, [
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(m.$t("项目成员（{n} 人）", { n: k.value.length })),
                1
                /* TEXT */
              ),
              e.createVNode(we, {
                modelValue: i.memberIds,
                "onUpdate:modelValue": c[3] || (c[3] = (g) => i.memberIds = g),
                people: f.value,
                depts: s.value,
                locked: i.ownerId ? [i.ownerId] : [],
                "locked-hint": m.$t("负责人"),
                "max-height": 240
              }, null, 8, ["modelValue", "people", "depts", "locked", "locked-hint"])
            ])
          ]),
          e.createElementVNode(
            "p",
            Uv,
            e.toDisplayString(m.$t("项目负责人自动成为成员；之后会议的主持人、参会人、任务负责人和接收任务的部门负责人也会自动加入。")),
            1
            /* TEXT */
          ),
          d.value ? (e.openBlock(), e.createElementBlock("p", Ov, [
            c[6] || (c[6] = e.createElementVNode(
              "i",
              { class: "ri-error-warning-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(d.value),
              1
              /* TEXT */
            )
          ])) : e.createCommentVNode("v-if", !0)
        ])
      ]),
      _: 1
      /* STABLE */
    }, 8, ["open", "title"]));
  }
}), Kv = /* @__PURE__ */ oe(qv, [["__scopeId", "data-v-ed67c1d7"]]), Hv = {
  class: "mm-projects",
  "data-test": "mm-projects-tab"
}, Wv = { class: "mm-pagehead" }, Gv = {
  key: 0,
  class: "ss-note danger"
}, Yv = { class: "mm-projects__grid" }, Jv = { class: "mm-plist" }, Qv = { class: "mm-search" }, Zv = ["placeholder", "aria-label"], Xv = ["aria-label"], xv = ["aria-selected", "data-test", "onClick"], ek = {
  key: 0,
  class: "mm-plist__empty"
}, tk = {
  key: 1,
  class: "mm-plist__empty"
}, lk = ["data-test", "onClick"], nk = { class: "mm-pcard__top" }, ok = {
  key: 0,
  class: "mm-pcard__over"
}, ak = { class: "mm-pcard__bot" }, sk = { class: "mm-bar" }, rk = { class: "owner" }, ik = { class: "mm-plist__foot" }, ck = { class: "mm-projects__detail" }, dk = {
  key: 1,
  class: "mm-projects__none"
}, mk = /* @__PURE__ */ e.defineComponent({
  __name: "ProjectsTab",
  emits: ["role"],
  setup(l, { expose: u, emit: n }) {
    const p = ["active", "closing", "archived"], f = {
      active: t.t("没有进行中的项目"),
      closing: t.t("没有结项中的项目"),
      archived: t.t("没有已归档的项目")
    }, s = ie.useNotificationStore(), o = e.ref([]), d = e.ref("active"), i = e.ref(""), k = e.ref(""), h = e.ref(0), m = e.ref(null), c = e.ref(!1), g = e.ref(!1), N = e.ref(""), a = n;
    function I(r) {
      We.value = r, a("role", r);
    }
    e.watch(k, (r) => {
      r || I("");
    });
    const P = e.computed(() => Object.fromEntries(p.map((r) => [r, o.value.filter((W) => W.status === r).length]))), U = e.computed(() => {
      const r = i.value.trim().toLowerCase();
      return o.value.filter((W) => W.status === d.value && (!r || `${W.name} ${W.ownerName}`.toLowerCase().includes(r)));
    }), M = (r) => typeof r.rate == "number" && Number.isFinite(r.rate) ? fe(r.rate) : pt(r.done, r.total);
    async function C() {
      g.value = !0;
      try {
        const r = await Y("project.list", {});
        o.value = Array.isArray(r) ? r : [], N.value = "", z();
      } catch (r) {
        N.value = Z.errorMessage(r);
      } finally {
        g.value = !1;
      }
    }
    let T = !0;
    function z() {
      const r = o.value.find((W) => W.id === k.value);
      if (r) {
        r.status !== d.value && (d.value = r.status);
        return;
      }
      if (!(k.value && m.value)) {
        if (T && !P.value[d.value]) {
          const W = p.find((X) => P.value[X] > 0);
          W && (d.value = W);
        }
        T = !1, k.value = U.value[0]?.id ?? "";
      }
    }
    e.watch(d, () => {
      U.value.some((r) => r.id === k.value) || (k.value = U.value[0]?.id ?? "");
    });
    function R(r) {
      k.value = r, m.value = null;
    }
    async function _(r) {
      if (o.value.some((W) => W.id === r)) return r;
      for (const W of o.value)
        try {
          const X = await Y("project.get", { id: W.id });
          if (X?.project?.weeklyReports?.some((ae) => ae.id === r) || X?.project?.summary?.id === r) return W.id;
        } catch {
        }
      return "";
    }
    async function E() {
      const r = ye.value;
      if (r.tab !== "projects") return;
      const W = Ll(r.link);
      if (!W) return;
      let X = W.projectId || "", ae = W.reportId;
      if (r.link?.kind === "report" && !r.link.anchor && (X = await _(r.link.id), X === r.link.id && (ae = void 0)), !X) {
        s.warn(t.t("没找到要打开的项目或报告"));
        return;
      }
      const q = o.value.find((H) => H.id === X);
      q && (d.value = q.status), i.value = "", k.value = X, m.value = { tab: W.tab, reportId: ae, seq: r.seq };
    }
    e.watch(() => ye.value.seq, () => {
      E();
    });
    async function v(r) {
      c.value = !1, s.success(t.t("项目已创建")), d.value = "active", i.value = "", await C(), r?.id && R(r.id);
    }
    let S = null, j = null, J = 0;
    function y() {
      S && clearTimeout(S), S = setTimeout(() => {
        S = null, J = Date.now(), C(), h.value += 1;
      }, 250);
    }
    function V() {
      S || Date.now() - J < 800 || y();
    }
    return u({ refresh: V }), e.onMounted(async () => {
      J = Date.now(), await C(), await E(), j = Se((r) => {
        r.type !== "changed" || !["all", "project", "task", "meeting", "org"].includes(r.scope) || y();
      });
    }), e.onBeforeUnmount(() => {
      j?.(), S && clearTimeout(S), We.value = "";
    }), (r, W) => (e.openBlock(), e.createElementBlock("div", Hv, [
      e.createElementVNode("header", Wv, [
        e.createElementVNode(
          "h2",
          null,
          e.toDisplayString(r.$t("项目")),
          1
          /* TEXT */
        ),
        e.createElementVNode(
          "p",
          null,
          e.toDisplayString(r.$t("汇总查看项目下的会议、任务和报告")),
          1
          /* TEXT */
        ),
        W[5] || (W[5] = e.createElementVNode(
          "span",
          { class: "grow" },
          null,
          -1
          /* CACHED */
        )),
        e.unref(ne)?.me.canCreateProject ? (e.openBlock(), e.createElementBlock("button", {
          key: 0,
          type: "button",
          class: "ss-btn",
          "data-test": "mm-project-new",
          onClick: W[0] || (W[0] = (X) => c.value = !0)
        }, [
          W[4] || (W[4] = e.createElementVNode(
            "i",
            { class: "ri-add-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            e.toDisplayString(r.$t("新建项目")),
            1
            /* TEXT */
          )
        ])) : e.createCommentVNode("v-if", !0)
      ]),
      N.value ? (e.openBlock(), e.createElementBlock("p", Gv, [
        W[6] || (W[6] = e.createElementVNode(
          "i",
          { class: "ri-error-warning-line" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(N.value),
          1
          /* TEXT */
        )
      ])) : e.createCommentVNode("v-if", !0),
      e.createElementVNode("div", Yv, [
        e.createElementVNode("aside", Jv, [
          e.createElementVNode("label", Qv, [
            W[7] || (W[7] = e.createElementVNode(
              "i",
              {
                class: "ri-search-line",
                "aria-hidden": "true"
              },
              null,
              -1
              /* CACHED */
            )),
            e.withDirectives(e.createElementVNode("input", {
              "onUpdate:modelValue": W[1] || (W[1] = (X) => i.value = X),
              type: "search",
              placeholder: r.$t("搜索项目"),
              "aria-label": r.$t("搜索项目"),
              "data-test": "mm-projects-search"
            }, null, 8, Zv), [
              [e.vModelText, i.value]
            ])
          ]),
          e.createElementVNode("div", {
            class: "mm-plist__filters",
            role: "tablist",
            "aria-label": r.$t("项目状态")
          }, [
            (e.openBlock(), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(p, (X) => e.createElementVNode("button", {
                key: X,
                type: "button",
                role: "tab",
                "aria-selected": d.value === X,
                class: e.normalizeClass({ on: d.value === X }),
                "data-test": `mm-projects-filter-${X}`,
                onClick: (ae) => d.value = X
              }, [
                e.createTextVNode(
                  e.toDisplayString(e.unref(Ge)[X]) + " ",
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "em",
                  null,
                  e.toDisplayString(P.value[X]),
                  1
                  /* TEXT */
                )
              ], 10, xv)),
              64
              /* STABLE_FRAGMENT */
            ))
          ], 8, Xv),
          g.value && !o.value.length ? (e.openBlock(), e.createElementBlock(
            "p",
            ek,
            e.toDisplayString(r.$t("加载中…")),
            1
            /* TEXT */
          )) : U.value.length ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock(
            "p",
            tk,
            e.toDisplayString(i.value ? r.$t("没有匹配的项目") : f[d.value]),
            1
            /* TEXT */
          )),
          (e.openBlock(!0), e.createElementBlock(
            e.Fragment,
            null,
            e.renderList(U.value, (X) => (e.openBlock(), e.createElementBlock("button", {
              key: X.id,
              type: "button",
              class: e.normalizeClass(["mm-pcard", { on: X.id === k.value }]),
              "data-test": `mm-project-card-${X.id}`,
              onClick: (ae) => R(X.id)
            }, [
              e.createElementVNode("span", nk, [
                e.createElementVNode(
                  "strong",
                  null,
                  e.toDisplayString(X.name),
                  1
                  /* TEXT */
                ),
                X.overdue > 0 ? (e.openBlock(), e.createElementBlock(
                  "span",
                  ok,
                  e.toDisplayString(r.$t("逾期 {n}", { n: X.overdue })),
                  1
                  /* TEXT */
                )) : e.createCommentVNode("v-if", !0)
              ]),
              e.createElementVNode("span", ak, [
                e.createElementVNode("i", sk, [
                  e.createElementVNode(
                    "b",
                    {
                      style: e.normalizeStyle({ width: `${M(X)}%` })
                    },
                    null,
                    4
                    /* STYLE */
                  )
                ]),
                e.createElementVNode(
                  "em",
                  null,
                  e.toDisplayString(M(X)) + "%",
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "span",
                  rk,
                  e.toDisplayString(X.ownerName),
                  1
                  /* TEXT */
                )
              ])
            ], 10, lk))),
            128
            /* KEYED_FRAGMENT */
          )),
          e.createElementVNode(
            "p",
            ik,
            e.toDisplayString(r.$t("只显示你参与的项目")),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode("div", ck, [
          k.value ? (e.openBlock(), e.createBlock(Tv, {
            key: 0,
            "project-id": k.value,
            "refresh-seq": h.value,
            focus: m.value,
            onChanged: C,
            onRole: I
          }, null, 8, ["project-id", "refresh-seq", "focus"])) : (e.openBlock(), e.createElementBlock("div", dk, [
            W[9] || (W[9] = e.createElementVNode(
              "i",
              {
                class: "ri-folder-open-line",
                "aria-hidden": "true"
              },
              null,
              -1
              /* CACHED */
            )),
            e.createElementVNode(
              "p",
              null,
              e.toDisplayString(o.value.length ? r.$t("选择左侧的一个项目查看详情") : r.$t("还没有你参与的项目")),
              1
              /* TEXT */
            ),
            !o.value.length && e.unref(ne)?.me.canCreateProject ? (e.openBlock(), e.createElementBlock("button", {
              key: 0,
              type: "button",
              class: "ss-btn primary",
              onClick: W[2] || (W[2] = (X) => c.value = !0)
            }, [
              W[8] || (W[8] = e.createElementVNode(
                "i",
                { class: "ri-add-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(r.$t("新建项目")),
                1
                /* TEXT */
              )
            ])) : e.createCommentVNode("v-if", !0)
          ]))
        ])
      ]),
      e.createVNode(Kv, {
        open: c.value,
        onClose: W[3] || (W[3] = (X) => c.value = !1),
        onCreated: v
      }, null, 8, ["open"])
    ]));
  }
}), uk = /* @__PURE__ */ oe(mk, [["__scopeId", "data-v-7edcfee7"]]), pk = {
  class: "mm-rec",
  "data-test": "mm-rec"
}, vk = { class: "mm-rec__tip" }, kk = {
  class: "mm-rec__script",
  "data-test": "mm-rec-script"
}, yk = { class: "mm-rec__bar" }, gk = ["disabled"], fk = {
  key: 0,
  class: "mm-rec__dot"
}, Nk = { class: "mm-rec__meter" }, Vk = {
  key: 0,
  class: "ss-note warn"
}, Ek = ["src"], $k = {
  key: 2,
  class: "ss-note danger",
  "data-test": "mm-rec-error"
}, _t = 10, bk = 15, hk = /* @__PURE__ */ e.defineComponent({
  __name: "VoiceRecorder",
  props: {
    script: {},
    disabled: { type: Boolean }
  },
  emits: ["recorded", "reset"],
  setup(l, { emit: u }) {
    const n = u, p = e.ref("idle"), f = e.ref(0), s = e.ref(0), o = e.ref(""), d = e.ref("");
    let i = null, k = null, h = [], m = null, c = 0, g = null, N = 0;
    function a() {
      m && (clearInterval(m), m = null), c && (cancelAnimationFrame(c), c = 0);
      try {
        i?.getTracks().forEach((C) => C.stop());
      } catch {
      }
      i = null;
      try {
        g?.close();
      } catch {
      }
      g = null, s.value = 0;
    }
    function I() {
      for (const C of ["audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus", "audio/mp4"])
        try {
          if (typeof MediaRecorder < "u" && MediaRecorder.isTypeSupported(C)) return C;
        } catch {
        }
      return "";
    }
    async function P() {
      o.value = "", d.value && (URL.revokeObjectURL(d.value), d.value = ""), n("reset");
      try {
        i = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: !0, noiseSuppression: !1, autoGainControl: !0 } });
      } catch (T) {
        o.value = T?.name === "NotAllowedError" ? t.t("没有麦克风权限：请在系统设置 → 隐私与安全性 → 麦克风里允许本应用，或改用「导入录音文件」") : t.t("打不开麦克风：{p0}", { p0: T?.message || "-" }), a();
        return;
      }
      const C = I();
      try {
        k = C ? new MediaRecorder(i, { mimeType: C }) : new MediaRecorder(i);
      } catch (T) {
        o.value = t.t("这台电脑不支持录音：{p0}", { p0: T?.message || "-" }), a();
        return;
      }
      h = [], k.ondataavailable = (T) => {
        T.data && T.data.size && h.push(T.data);
      }, k.onstop = () => void M(k?.mimeType || C);
      try {
        g = new AudioContext();
        const T = g.createAnalyser();
        T.fftSize = 1024, g.createMediaStreamSource(i).connect(T);
        const z = new Uint8Array(T.fftSize), R = () => {
          T.getByteTimeDomainData(z);
          let _ = 0;
          for (const E of z) _ = Math.max(_, Math.abs(E - 128));
          s.value = Math.min(100, Math.round(_ / 128 * 140)), c = requestAnimationFrame(R);
        };
        R();
      } catch {
      }
      N = Date.now(), f.value = 0, p.value = "recording", k.start(250), m = setInterval(() => {
        f.value = Math.floor((Date.now() - N) / 1e3), f.value >= bk && U();
      }, 200);
    }
    function U() {
      k && k.state !== "inactive" && k.stop(), m && (clearInterval(m), m = null);
    }
    async function M(C) {
      const T = Math.round((Date.now() - N) / 100) / 10;
      a(), p.value = "done", f.value = Math.round(T);
      const z = new Blob(h, { type: C || "audio/webm" });
      if (!z.size) {
        o.value = t.t("没有录到声音，请重录");
        return;
      }
      d.value = URL.createObjectURL(z);
      const R = new Uint8Array(await z.arrayBuffer());
      let _ = "";
      for (let v = 0; v < R.length; v += 32768) _ += String.fromCharCode(...R.subarray(v, v + 32768));
      const E = /ogg/.test(C) ? "ogg" : /mp4/.test(C) ? "m4a" : "webm";
      n("recorded", { data: btoa(_), ext: E, seconds: T });
    }
    return e.onBeforeUnmount(() => {
      try {
        k && k.state !== "inactive" && k.stop();
      } catch {
      }
      a(), d.value && URL.revokeObjectURL(d.value);
    }), (C, T) => (e.openBlock(), e.createElementBlock("div", pk, [
      e.createElementVNode(
        "p",
        vk,
        e.toDisplayString(C.$t("请在安静的地方，用平时开会说话的音量和语速，朗读下面这段话：")),
        1
        /* TEXT */
      ),
      e.createElementVNode(
        "blockquote",
        kk,
        e.toDisplayString(l.script),
        1
        /* TEXT */
      ),
      e.createElementVNode("div", yk, [
        p.value !== "recording" ? (e.openBlock(), e.createElementBlock("button", {
          key: 0,
          type: "button",
          class: e.normalizeClass(["ss-btn", p.value === "idle" ? "primary" : ""]),
          disabled: l.disabled,
          "data-test": "mm-rec-start",
          onClick: P
        }, [
          T[0] || (T[0] = e.createElementVNode(
            "i",
            { class: "ri-mic-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            e.toDisplayString(p.value === "idle" ? C.$t("开始录音") : C.$t("重录")),
            1
            /* TEXT */
          )
        ], 10, gk)) : (e.openBlock(), e.createElementBlock("button", {
          key: 1,
          type: "button",
          class: "ss-btn danger",
          "data-test": "mm-rec-stop",
          onClick: U
        }, [
          T[1] || (T[1] = e.createElementVNode(
            "i",
            { class: "ri-stop-circle-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            e.toDisplayString(C.$t("停止录音")),
            1
            /* TEXT */
          )
        ])),
        e.createElementVNode(
          "span",
          {
            class: e.normalizeClass(["mm-rec__time", { live: p.value === "recording", short: f.value > 0 && f.value < _t && p.value !== "recording" }])
          },
          [
            p.value === "recording" ? (e.openBlock(), e.createElementBlock("i", fk)) : e.createCommentVNode("v-if", !0),
            e.createTextVNode(
              e.toDisplayString(C.$t("{s} 秒", { s: f.value })),
              1
              /* TEXT */
            )
          ],
          2
          /* CLASS */
        ),
        e.createElementVNode("i", Nk, [
          e.createElementVNode(
            "b",
            {
              style: e.normalizeStyle({ width: `${s.value}%` })
            },
            null,
            4
            /* STYLE */
          )
        ])
      ]),
      p.value === "done" && f.value < _t ? (e.openBlock(), e.createElementBlock("p", Vk, [
        T[2] || (T[2] = e.createElementVNode(
          "i",
          { class: "ri-alert-line" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(C.$t("录音不足 10 秒，建议重录")),
          1
          /* TEXT */
        )
      ])) : e.createCommentVNode("v-if", !0),
      d.value ? (e.openBlock(), e.createElementBlock("audio", {
        key: 1,
        src: d.value,
        controls: "",
        class: "mm-rec__audio",
        "data-test": "mm-rec-preview"
      }, null, 8, Ek)) : e.createCommentVNode("v-if", !0),
      o.value ? (e.openBlock(), e.createElementBlock("p", $k, [
        T[3] || (T[3] = e.createElementVNode(
          "i",
          { class: "ri-error-warning-line" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(o.value),
          1
          /* TEXT */
        )
      ])) : e.createCommentVNode("v-if", !0)
    ]));
  }
}), Rt = /* @__PURE__ */ oe(hk, [["__scopeId", "data-v-f9d93abd"]]), _k = {
  class: "mm-sv",
  "data-test": "mm-voiceprint"
}, Bk = { class: "mm-sp__head" }, Sk = { class: "ss-actions" }, Dk = ["disabled"], wk = ["disabled", "title"], Ck = {
  key: 0,
  class: "ss-note warn"
}, Tk = { class: "ss-muted mm-sv__tip" }, Ik = {
  key: 2,
  class: "ss-note danger"
}, Mk = {
  class: "mm-sv__cov",
  "data-test": "mm-vp-coverage"
}, Ak = { class: "mm-sv__num" }, jk = { class: "mm-sv__bar" }, Lk = { class: "mm-bar" }, zk = { class: "mm-sv__tools" }, Fk = {
  class: "mm-subtabs",
  role: "tablist"
}, Pk = ["aria-selected", "data-test", "onClick"], Uk = { class: "mm-search" }, Ok = ["placeholder", "aria-label"], Rk = { class: "ss-table-wrap" }, qk = { class: "ss-table mm-sv__table" }, Kk = { class: "num" }, Hk = { key: 0 }, Wk = {
  colspan: "6",
  class: "mm-sv__empty"
}, Gk = ["data-test"], Yk = { class: "mm-sv__st" }, Jk = ["title", "data-test"], Qk = ["title", "data-test"], Zk = { class: "mono" }, Xk = { class: "mono" }, xk = { class: "num" }, ey = ["disabled", "onClick"], ty = ["disabled", "data-test", "onClick"], ly = ["disabled", "data-test", "onClick"], ny = ["disabled", "data-test", "onClick"], oy = ["disabled", "data-test", "onClick"], ay = ["disabled", "data-test", "onClick"], sy = ["onClick"], ry = { class: "mm-sv__foot" }, iy = ["aria-label"], cy = ["disabled", "aria-label"], dy = ["aria-current", "onClick"], my = ["disabled", "aria-label"], uy = {
  class: "mm-sv__imp",
  "data-test": "mm-vp-import-dialog"
}, py = { class: "mm-sv__f" }, vy = { class: "mm-sv__f" }, ky = {
  key: 0,
  class: "ss-muted"
}, yy = { class: "mm-sv__consent" }, gy = {
  key: 0,
  class: "ss-note danger"
}, fy = ["disabled"], Ny = {
  class: "mm-sv__imp",
  "data-test": "mm-vp-record-dialog"
}, Vy = { class: "mm-sv__f" }, Ey = { class: "mm-sv__consent" }, $y = {
  key: 1,
  class: "ss-note danger"
}, by = ["disabled"], hy = 8, _y = /* @__PURE__ */ e.defineComponent({
  __name: "SettingsVoiceprint",
  props: {
    people: {},
    depts: {},
    refreshSeq: { default: 0 }
  },
  setup(l) {
    const u = [
      { key: "all", title: t.t("全部人员") },
      { key: "missing", title: t.t("未采集") },
      { key: "collected", title: t.t("已采集") }
    ], n = l, p = $e.useDialog(), f = ie.useNotificationStore(), s = e.ref([]), o = e.ref(!1), d = e.ref(!1), i = e.ref(""), k = e.ref({}), h = e.ref(null), m = e.ref("all"), c = e.ref(""), g = e.ref(1), N = e.ref(!1), a = e.reactive({ personId: "", path: "", consent: !1 }), I = e.ref(""), P = e.ref(null), U = e.ref(!1), M = e.reactive({ personId: "", consent: !1, recorded: null }), C = e.ref(""), T = e.computed(() => !!ne.value?.pushChannel || !!ne.value?.wecomConnected), z = e.computed(() => ne.value?.me.person?.id || ""), R = e.computed(() => ne.value?.pushChannel === "webhook"), _ = e.computed(() => s.value.filter((D) => D.status === "collected").length), E = e.computed(() => pt(_.value, s.value.length)), v = (D) => D === "all" ? s.value.length : s.value.filter((O) => O.status === D).length, S = e.computed(() => s.value.filter((D) => m.value === "all" || D.status === m.value).filter((D) => vt(D.person, D.deptName, c.value)).sort((D, O) => D.status === O.status ? (O.enrolledAt || 0) - (D.enrolledAt || 0) : D.status === "missing" ? -1 : 1)), j = e.computed(() => Lt(S.value, g.value, hy));
    async function J() {
      o.value = !0;
      try {
        const D = await Y("voiceprint.list");
        s.value = Array.isArray(D) ? D : [], i.value = "";
      } catch (D) {
        i.value = Z.errorMessage(D);
      } finally {
        o.value = !1;
      }
    }
    e.watch(() => n.refreshSeq, () => {
      J();
    }, { immediate: !0 });
    const y = (D) => s.value.find((O) => O.person.id === D)?.person.name || n.people.find((O) => O.id === D)?.name || D, V = e.computed(() => {
      const D = s.value.find((F) => F.person.id === M.personId), O = D?.person || n.people.find((F) => F.id === M.personId), G = D?.deptName || n.depts.find((F) => F.id === O?.deptId)?.name || "";
      return t.t("大家好，我是{dept}的{name}。这是我的声纹采集录音，用于在会议纪要里自动识别我的发言。我会用平时开会说话的音量和语速，把这段话完整地读完。", {
        dept: G,
        name: O?.name || ""
      });
    });
    async function r() {
      const D = await Y("voiceprint.link"), O = {};
      if (D && typeof D == "object" && Array.isArray(D.links))
        for (const w of D.links) w?.personId && w.url && (O[w.personId] = w.url);
      const G = ne.value?.me.person?.id, F = Je(D);
      if (G && F && !O[G] && (O[G] = F), !Object.keys(O).length) throw new Error(t.t("没拿到采集链接，请先在「手机端」开启手机页服务"));
      return k.value = O, O;
    }
    async function W() {
      d.value = !0, i.value = "";
      try {
        const D = await r(), O = s.value.filter((w) => w.status === "missing" && D[w.person.id]), G = O.length ? O : s.value.filter((w) => D[w.person.id]), F = G.map((w) => `${w.person.name}${w.deptName ? ` · ${w.deptName}` : ""}${t.t("：")}${D[w.person.id]}`).join(`
`);
        await Qe(F) ? f.success(O.length ? t.t("已复制 {n} 位未采集员工的采集链接（每人一条，请分别发给本人）", { n: G.length }) : t.t("已复制 {n} 人的采集链接", { n: G.length })) : i.value = t.t("复制失败，请重试");
      } catch (D) {
        i.value = Z.errorMessage(D);
      } finally {
        d.value = !1;
      }
    }
    async function X(D) {
      d.value = !0, i.value = "";
      try {
        const G = (k.value[D.person.id] ? k.value : await r())[D.person.id];
        if (!G) throw new Error(t.t("没拿到 {name} 的采集链接", { name: D.person.name }));
        await Qe(G) && f.success(t.t("已复制 {name} 的采集链接", { name: D.person.name }));
      } catch (O) {
        i.value = Z.errorMessage(O);
      } finally {
        d.value = !1;
      }
    }
    async function ae() {
      if (await p.confirm({
        title: R.value ? t.t("发送到企微群") : t.t("推送到企微"),
        message: R.value ? t.t("在企微群里发一条声纹采集邀请，点名提醒还没采集的人（已采集的不打扰）？") : t.t("给还没采集的人逐个推送声纹采集卡片（已采集的不打扰）？")
      })) {
        d.value = !0, i.value = "", h.value = null;
        try {
          const O = await Y("voiceprint.send");
          h.value = { sent: Number(O?.sent) || 0, failed: Array.isArray(O?.failed) ? O.failed : [] }, O?.skipped ? f.success(t.t("所有人都已采集过声纹，不用再发")) : h.value.failed.length || f.success(O?.group ? t.t("采集邀请已发到企微群") : t.t("采集卡片已推送到企微"));
        } catch (O) {
          i.value = Z.errorMessage(O);
        } finally {
          d.value = !1;
        }
      }
    }
    async function q(D) {
      if (await p.confirm({
        title: t.t("删除声纹（撤回授权）"),
        message: t.t("删除 {name} 的声纹样本和授权记录？之后的会议里不再能自动识别 TA，需要重新授权采集。", { name: D.person.name }),
        danger: !0,
        confirmLabel: t.t("删除")
      })) {
        d.value = !0, i.value = "";
        try {
          await Y("voiceprint.delete", { personId: D.person.id }), f.success(t.t("已删除并撤回授权")), await J();
        } catch (G) {
          i.value = Z.errorMessage(G);
        } finally {
          d.value = !1;
        }
      }
    }
    async function H(D) {
      const O = !D.autoLearn;
      if (!(!O && !await p.confirm({
        title: t.t("关闭会议补充"),
        message: t.t("关闭后不再从会议里补充样本，已补充的 {n} 条样本会一并删除；注册时录的声纹不受影响。", { n: D.extraCount || 0 }),
        confirmLabel: t.t("关闭并删除样本"),
        danger: !0
      }))) {
        d.value = !0, i.value = "";
        try {
          await Y("voiceprint.autoLearn.set", { enabled: O }), f.success(O ? t.t("已开启：之后确认会议发言时会自动补充声纹") : t.t("已关闭并删除会议补充样本")), await J();
        } catch (G) {
          i.value = Z.errorMessage(G);
        } finally {
          d.value = !1;
        }
      }
    }
    function ee(D) {
      Object.assign(a, { personId: D, path: "", consent: !1 }), I.value = "", P.value && (P.value.value = ""), N.value = !0;
    }
    function le(D) {
      const O = D.target.files?.[0];
      a.path = zl(O), I.value = O && !a.path ? t.t("读不到这个文件的本机路径，请选择电脑上的录音文件") : "";
    }
    async function $() {
      d.value = !0, I.value = "";
      try {
        await Y("voiceprint.enroll", { personId: a.personId, path: a.path, consent: !0 }), N.value = !1, f.success(t.t("声纹已采集")), await J();
      } catch (D) {
        I.value = Z.errorMessage(D);
      } finally {
        d.value = !1;
      }
    }
    function b(D) {
      Object.assign(M, { personId: D || z.value, consent: !1, recorded: null }), C.value = "", U.value = !0;
    }
    async function B() {
      if (!(!M.recorded || !M.personId)) {
        d.value = !0, C.value = "";
        try {
          const D = await Y("voiceprint.enrollData", {
            personId: M.personId,
            consent: !0,
            data: M.recorded.data,
            ext: M.recorded.ext
          });
          U.value = !1, f.success(D?.seconds ? t.t("声纹已采集（{s} 秒）", { s: D.seconds }) : t.t("声纹已采集")), await J();
        } catch (D) {
          C.value = Z.errorMessage(D);
        } finally {
          d.value = !1;
        }
      }
    }
    return (D, O) => (e.openBlock(), e.createElementBlock("div", _k, [
      e.createElementVNode("header", Bk, [
        e.createElementVNode("div", null, [
          e.createElementVNode(
            "h3",
            null,
            e.toDisplayString(D.$t("声纹库")),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "p",
            null,
            e.toDisplayString(D.$t("员工在企微里打开采集链接，授权同意后录 10～15 秒，用于会议发言人识别（只在本场参会人中比对）")),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode("div", Sk, [
          e.createElementVNode("button", {
            type: "button",
            class: "ss-btn",
            disabled: d.value,
            "data-test": "mm-vp-copy",
            onClick: W
          }, [
            O[16] || (O[16] = e.createElementVNode(
              "i",
              { class: "ri-link" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(D.$t("复制采集链接")),
              1
              /* TEXT */
            )
          ], 8, Dk),
          e.createElementVNode("button", {
            type: "button",
            class: "ss-btn primary",
            disabled: d.value || !T.value,
            title: T.value ? "" : D.$t("未连接企微"),
            "data-test": "mm-vp-send",
            onClick: ae
          }, [
            O[17] || (O[17] = e.createElementVNode(
              "i",
              { class: "ri-send-plane-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(R.value ? D.$t("发送到企微群") : D.$t("推送到企微")),
              1
              /* TEXT */
            )
          ], 8, wk)
        ])
      ]),
      T.value ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock("p", Ck, [
        O[18] || (O[18] = e.createElementVNode(
          "i",
          { class: "ri-information-line" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(D.$t("未连接企微：先在「消息推送」里配置企微自建应用或群机器人才能推送；也可以复制采集链接自己发。采集链接要先在「手机端」开启手机页服务。")),
          1
          /* TEXT */
        )
      ])),
      e.createElementVNode(
        "p",
        Tk,
        e.toDisplayString(D.$t("每人的采集链接都带本人令牌（等同免登），只能本人打开录自己的声纹；复制时按人一条一行。")),
        1
        /* TEXT */
      ),
      h.value ? (e.openBlock(), e.createElementBlock(
        "p",
        {
          key: 1,
          class: e.normalizeClass(["ss-note", h.value.failed.length ? "warn" : "ok"]),
          "data-test": "mm-vp-send-result"
        },
        [
          e.createElementVNode(
            "i",
            {
              class: e.normalizeClass(h.value.failed.length ? "ri-alert-line" : "ri-checkbox-circle-line")
            },
            null,
            2
            /* CLASS */
          ),
          e.createTextVNode(
            " " + e.toDisplayString(D.$t("已推送 {a} 人", { a: h.value.sent })),
            1
            /* TEXT */
          ),
          h.value.failed.length ? (e.openBlock(), e.createElementBlock(
            e.Fragment,
            { key: 0 },
            [
              e.createTextVNode(
                e.toDisplayString(D.$t("，{b} 人失败：{names}", { b: h.value.failed.length, names: h.value.failed.slice(0, 6).map((G) => D.$t("{p0}（{p1}）", { p0: y(G.personId), p1: G.error })).join(D.$t("；")) })),
                1
                /* TEXT */
              )
            ],
            64
            /* STABLE_FRAGMENT */
          )) : e.createCommentVNode("v-if", !0)
        ],
        2
        /* CLASS */
      )) : e.createCommentVNode("v-if", !0),
      i.value ? (e.openBlock(), e.createElementBlock("p", Ik, [
        O[19] || (O[19] = e.createElementVNode(
          "i",
          { class: "ri-error-warning-line" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(i.value),
          1
          /* TEXT */
        )
      ])) : e.createCommentVNode("v-if", !0),
      e.createElementVNode("div", Mk, [
        e.createElementVNode("div", Ak, [
          e.createElementVNode(
            "b",
            null,
            e.toDisplayString(_.value),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "span",
            null,
            "/ " + e.toDisplayString(D.$t("{n} 人", { n: s.value.length })),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "small",
            null,
            e.toDisplayString(D.$t("已采集")),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode("div", jk, [
          e.createElementVNode("i", Lk, [
            e.createElementVNode(
              "b",
              {
                style: e.normalizeStyle({ width: `${E.value}%` })
              },
              null,
              4
              /* STYLE */
            )
          ]),
          e.createElementVNode(
            "small",
            null,
            e.toDisplayString(D.$t("覆盖率 {p}% · 还有 {n} 人未采集", { p: E.value, n: s.value.length - _.value })),
            1
            /* TEXT */
          )
        ])
      ]),
      e.createElementVNode("div", zk, [
        e.createElementVNode("nav", Fk, [
          (e.openBlock(), e.createElementBlock(
            e.Fragment,
            null,
            e.renderList(u, (G) => e.createElementVNode("button", {
              key: G.key,
              type: "button",
              role: "tab",
              "aria-selected": m.value === G.key,
              class: e.normalizeClass({ on: m.value === G.key }),
              "data-test": `mm-vp-filter-${G.key}`,
              onClick: (F) => {
                m.value = G.key, g.value = 1;
              }
            }, [
              e.createTextVNode(
                e.toDisplayString(G.title) + " ",
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "em",
                null,
                e.toDisplayString(v(G.key)),
                1
                /* TEXT */
              )
            ], 10, Pk)),
            64
            /* STABLE_FRAGMENT */
          ))
        ]),
        O[23] || (O[23] = e.createElementVNode(
          "span",
          { class: "grow" },
          null,
          -1
          /* CACHED */
        )),
        e.createElementVNode("label", Uk, [
          O[20] || (O[20] = e.createElementVNode(
            "i",
            {
              class: "ri-search-line",
              "aria-hidden": "true"
            },
            null,
            -1
            /* CACHED */
          )),
          e.withDirectives(e.createElementVNode("input", {
            "onUpdate:modelValue": O[0] || (O[0] = (G) => c.value = G),
            type: "search",
            placeholder: D.$t("搜索员工"),
            "aria-label": D.$t("搜索员工"),
            onInput: O[1] || (O[1] = (G) => g.value = 1)
          }, null, 40, Ok), [
            [e.vModelText, c.value]
          ])
        ]),
        e.createElementVNode("button", {
          type: "button",
          class: "ss-btn sm",
          "data-test": "mm-vp-record",
          onClick: O[2] || (O[2] = (G) => b(z.value))
        }, [
          O[21] || (O[21] = e.createElementVNode(
            "i",
            { class: "ri-mic-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            e.toDisplayString(D.$t("现场录音")),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode("button", {
          type: "button",
          class: "ss-btn sm",
          "data-test": "mm-vp-import",
          onClick: O[3] || (O[3] = (G) => ee(""))
        }, [
          O[22] || (O[22] = e.createElementVNode(
            "i",
            { class: "ri-upload-2-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            e.toDisplayString(D.$t("导入录音代为采集")),
            1
            /* TEXT */
          )
        ])
      ]),
      e.createElementVNode("div", Rk, [
        e.createElementVNode("table", qk, [
          e.createElementVNode("thead", null, [
            e.createElementVNode("tr", null, [
              e.createElementVNode(
                "th",
                null,
                e.toDisplayString(D.$t("员工")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "th",
                null,
                e.toDisplayString(D.$t("部门")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "th",
                null,
                e.toDisplayString(D.$t("状态")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "th",
                null,
                e.toDisplayString(D.$t("授权时间（个保法单独同意）")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "th",
                null,
                e.toDisplayString(D.$t("采集时间")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "th",
                Kk,
                e.toDisplayString(D.$t("操作")),
                1
                /* TEXT */
              )
            ])
          ]),
          e.createElementVNode("tbody", null, [
            j.value.rows.length ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock("tr", Hk, [
              e.createElementVNode(
                "td",
                Wk,
                e.toDisplayString(o.value ? D.$t("加载中…") : D.$t("没有符合条件的员工")),
                1
                /* TEXT */
              )
            ])),
            (e.openBlock(!0), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(j.value.rows, (G) => (e.openBlock(), e.createElementBlock("tr", {
                key: G.person.id,
                "data-test": `mm-vp-row-${G.person.id}`
              }, [
                e.createElementVNode("td", null, [
                  e.createVNode(ze, {
                    name: G.person.name
                  }, null, 8, ["name"])
                ]),
                e.createElementVNode(
                  "td",
                  null,
                  e.toDisplayString(G.deptName || "—"),
                  1
                  /* TEXT */
                ),
                e.createElementVNode("td", null, [
                  e.createElementVNode("span", Yk, [
                    e.createElementVNode(
                      "span",
                      {
                        class: e.normalizeClass(["ss-chip", G.status === "collected" ? "ok" : "warn"])
                      },
                      e.toDisplayString(G.status === "collected" ? D.$t("已采集") : D.$t("未采集")),
                      3
                      /* TEXT, CLASS */
                    ),
                    G.needsUpdate ? (e.openBlock(), e.createElementBlock("span", {
                      key: 0,
                      class: "ss-chip warn",
                      title: D.$t("这份声纹是旧模型采的。本机已装更准的声纹模型，请本人用采集链接重录一次（只要有一位参会人还是旧声纹，整场就只能用旧模型认人）"),
                      "data-test": `mm-vp-old-${G.person.id}`
                    }, e.toDisplayString(D.$t("建议重录")), 9, Jk)) : e.createCommentVNode("v-if", !0),
                    G.autoLearn ? (e.openBlock(), e.createElementBlock("span", {
                      key: 1,
                      class: "mm-sv__learn",
                      title: D.$t("确认会议发言后，用本人的发言自动补充声纹"),
                      "data-test": `mm-vp-learn-${G.person.id}`
                    }, [
                      O[24] || (O[24] = e.createElementVNode(
                        "i",
                        { class: "ri-loop-right-line" },
                        null,
                        -1
                        /* CACHED */
                      )),
                      e.createTextVNode(
                        e.toDisplayString(G.extraCount ? D.$t("会议补充 {n} 条", { n: G.extraCount }) : D.$t("会议补充已开")),
                        1
                        /* TEXT */
                      )
                    ], 8, Qk)) : e.createCommentVNode("v-if", !0)
                  ])
                ]),
                e.createElementVNode(
                  "td",
                  Zk,
                  e.toDisplayString(G.consentAt ? e.unref(Ne)(G.consentAt, !0) : "—"),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "td",
                  Xk,
                  e.toDisplayString(G.enrolledAt ? e.unref(Ne)(G.enrolledAt) : "—"),
                  1
                  /* TEXT */
                ),
                e.createElementVNode("td", xk, [
                  G.status === "collected" ? (e.openBlock(), e.createElementBlock(
                    e.Fragment,
                    { key: 0 },
                    [
                      G.person.id === z.value ? (e.openBlock(), e.createElementBlock(
                        e.Fragment,
                        { key: 0 },
                        [
                          e.createElementVNode("button", {
                            type: "button",
                            class: "ss-link",
                            disabled: d.value,
                            "data-test": "mm-vp-learn-toggle",
                            onClick: (F) => H(G)
                          }, e.toDisplayString(G.autoLearn ? D.$t("关闭会议补充") : D.$t("开启会议补充")), 9, ey),
                          O[25] || (O[25] = e.createElementVNode(
                            "span",
                            {
                              class: "mm-sv__sep",
                              "aria-hidden": "true"
                            },
                            "·",
                            -1
                            /* CACHED */
                          ))
                        ],
                        64
                        /* STABLE_FRAGMENT */
                      )) : e.createCommentVNode("v-if", !0),
                      G.needsUpdate ? (e.openBlock(), e.createElementBlock(
                        e.Fragment,
                        { key: 1 },
                        [
                          e.createElementVNode("button", {
                            type: "button",
                            class: "ss-link",
                            disabled: d.value,
                            "data-test": `mm-vp-copy-${G.person.id}`,
                            onClick: (F) => X(G)
                          }, e.toDisplayString(D.$t("复制重录链接")), 9, ty),
                          O[26] || (O[26] = e.createElementVNode(
                            "span",
                            {
                              class: "mm-sv__sep",
                              "aria-hidden": "true"
                            },
                            "·",
                            -1
                            /* CACHED */
                          ))
                        ],
                        64
                        /* STABLE_FRAGMENT */
                      )) : e.createCommentVNode("v-if", !0),
                      e.createElementVNode("button", {
                        type: "button",
                        class: "ss-link",
                        disabled: d.value,
                        "data-test": `mm-vp-rec-${G.person.id}`,
                        onClick: (F) => b(G.person.id)
                      }, e.toDisplayString(D.$t("现场重录")), 9, ly),
                      O[27] || (O[27] = e.createElementVNode(
                        "span",
                        {
                          class: "mm-sv__sep",
                          "aria-hidden": "true"
                        },
                        "·",
                        -1
                        /* CACHED */
                      )),
                      e.createElementVNode("button", {
                        type: "button",
                        class: "ss-link danger",
                        disabled: d.value,
                        "data-test": `mm-vp-del-${G.person.id}`,
                        onClick: (F) => q(G)
                      }, e.toDisplayString(D.$t("删除（撤回授权）")), 9, ny)
                    ],
                    64
                    /* STABLE_FRAGMENT */
                  )) : (e.openBlock(), e.createElementBlock(
                    e.Fragment,
                    { key: 1 },
                    [
                      e.createElementVNode("button", {
                        type: "button",
                        class: "ss-link",
                        disabled: d.value,
                        "data-test": `mm-vp-rec-${G.person.id}`,
                        onClick: (F) => b(G.person.id)
                      }, e.toDisplayString(D.$t("现场录音")), 9, oy),
                      O[28] || (O[28] = e.createElementVNode(
                        "span",
                        {
                          class: "mm-sv__sep",
                          "aria-hidden": "true"
                        },
                        "·",
                        -1
                        /* CACHED */
                      )),
                      e.createElementVNode("button", {
                        type: "button",
                        class: "ss-link",
                        disabled: d.value,
                        "data-test": `mm-vp-copy-${G.person.id}`,
                        onClick: (F) => X(G)
                      }, e.toDisplayString(D.$t("复制链接")), 9, ay),
                      O[29] || (O[29] = e.createElementVNode(
                        "span",
                        {
                          class: "mm-sv__sep",
                          "aria-hidden": "true"
                        },
                        "·",
                        -1
                        /* CACHED */
                      )),
                      e.createElementVNode("button", {
                        type: "button",
                        class: "ss-link",
                        onClick: (F) => ee(G.person.id)
                      }, e.toDisplayString(D.$t("代为采集")), 9, sy)
                    ],
                    64
                    /* STABLE_FRAGMENT */
                  ))
                ])
              ], 8, Gk))),
              128
              /* KEYED_FRAGMENT */
            ))
          ])
        ])
      ]),
      e.createElementVNode("footer", ry, [
        e.createElementVNode(
          "span",
          null,
          e.toDisplayString(D.$t("共 {n} 人", { n: S.value.length })),
          1
          /* TEXT */
        ),
        O[32] || (O[32] = e.createElementVNode(
          "span",
          { class: "grow" },
          null,
          -1
          /* CACHED */
        )),
        j.value.pages > 1 ? (e.openBlock(), e.createElementBlock("nav", {
          key: 0,
          class: "mm-pager",
          "aria-label": D.$t("分页")
        }, [
          e.createElementVNode("button", {
            type: "button",
            disabled: j.value.page <= 1,
            "aria-label": D.$t("上一页"),
            onClick: O[4] || (O[4] = (G) => g.value = j.value.page - 1)
          }, [...O[30] || (O[30] = [
            e.createElementVNode(
              "i",
              { class: "ri-arrow-left-s-line" },
              null,
              -1
              /* CACHED */
            )
          ])], 8, cy),
          (e.openBlock(!0), e.createElementBlock(
            e.Fragment,
            null,
            e.renderList(j.value.pages, (G) => (e.openBlock(), e.createElementBlock("button", {
              key: G,
              type: "button",
              class: e.normalizeClass({ on: G === j.value.page }),
              "aria-current": G === j.value.page ? "page" : void 0,
              onClick: (F) => g.value = G
            }, e.toDisplayString(G), 11, dy))),
            128
            /* KEYED_FRAGMENT */
          )),
          e.createElementVNode("button", {
            type: "button",
            disabled: j.value.page >= j.value.pages,
            "aria-label": D.$t("下一页"),
            onClick: O[5] || (O[5] = (G) => g.value = j.value.page + 1)
          }, [...O[31] || (O[31] = [
            e.createElementVNode(
              "i",
              { class: "ri-arrow-right-s-line" },
              null,
              -1
              /* CACHED */
            )
          ])], 8, my)
        ], 8, iy)) : e.createCommentVNode("v-if", !0)
      ]),
      e.createVNode(Ze, {
        open: N.value,
        title: D.$t("导入录音代为采集"),
        icon: "ri-mic-line",
        size: "md",
        description: D.$t("管理员代员工导入一段 10～15 秒、只有本人说话的清晰录音。必须先取得本人对采集声纹的单独同意。"),
        onClose: O[9] || (O[9] = (G) => N.value = !1)
      }, {
        footer: e.withCtx(() => [
          e.createElementVNode(
            "button",
            {
              type: "button",
              class: "ss-btn",
              onClick: O[8] || (O[8] = (G) => N.value = !1)
            },
            e.toDisplayString(D.$t("取消")),
            1
            /* TEXT */
          ),
          e.createElementVNode("button", {
            type: "button",
            class: "ss-btn primary",
            disabled: d.value || !a.personId || !a.path || !a.consent,
            "data-test": "mm-vp-import-submit",
            onClick: $
          }, [
            e.createElementVNode(
              "i",
              {
                class: e.normalizeClass(d.value ? "ri-loader-4-line spin" : "ri-check-line")
              },
              null,
              2
              /* CLASS */
            ),
            e.createTextVNode(
              e.toDisplayString(D.$t("校验并采集")),
              1
              /* TEXT */
            )
          ], 8, fy)
        ]),
        default: e.withCtx(() => [
          e.createElementVNode("div", uy, [
            e.createElementVNode("div", py, [
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(D.$t("员工")),
                1
                /* TEXT */
              ),
              e.createVNode(we, {
                modelValue: a.personId,
                "onUpdate:modelValue": O[6] || (O[6] = (G) => a.personId = G),
                people: l.people,
                depts: l.depts,
                multiple: !1,
                "max-height": 200
              }, null, 8, ["modelValue", "people", "depts"])
            ]),
            e.createElementVNode("label", vy, [
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(D.$t("录音文件")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "input",
                {
                  ref_key: "fileEl",
                  ref: P,
                  type: "file",
                  accept: ".mp3,.m4a,.wav,.aac,.amr,.flac,.ogg,.opus,.wma,.webm,.caf,.aiff,audio/*",
                  "data-test": "mm-vp-file",
                  onChange: le
                },
                null,
                544
                /* NEED_HYDRATION, NEED_PATCH */
              ),
              a.path ? (e.openBlock(), e.createElementBlock(
                "small",
                ky,
                e.toDisplayString(a.path),
                1
                /* TEXT */
              )) : e.createCommentVNode("v-if", !0)
            ]),
            e.createElementVNode("label", yy, [
              e.withDirectives(e.createElementVNode(
                "input",
                {
                  "onUpdate:modelValue": O[7] || (O[7] = (G) => a.consent = G),
                  type: "checkbox",
                  "data-test": "mm-vp-consent"
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [e.vModelCheckbox, a.consent]
              ]),
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(D.$t("我已取得该员工本人对采集、使用声纹（含确认会议发言后用其本人发言补充声纹）的单独同意（个人信息保护法）；授权人与授权时间会记录在案。")),
                1
                /* TEXT */
              )
            ]),
            I.value ? (e.openBlock(), e.createElementBlock("p", gy, [
              O[33] || (O[33] = e.createElementVNode(
                "i",
                { class: "ri-error-warning-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(I.value),
                1
                /* TEXT */
              )
            ])) : e.createCommentVNode("v-if", !0)
          ])
        ]),
        _: 1
        /* STABLE */
      }, 8, ["open", "title", "description"]),
      e.createVNode(Ze, {
        open: U.value,
        title: D.$t("现场录音采集声纹"),
        icon: "ri-mic-line",
        size: "md",
        description: D.$t("直接用本机麦克风录 10～15 秒声音；请由被采集人本人朗读并授权同意。"),
        onClose: O[15] || (O[15] = (G) => U.value = !1)
      }, {
        footer: e.withCtx(() => [
          e.createElementVNode(
            "button",
            {
              type: "button",
              class: "ss-btn",
              onClick: O[14] || (O[14] = (G) => U.value = !1)
            },
            e.toDisplayString(D.$t("取消")),
            1
            /* TEXT */
          ),
          e.createElementVNode("button", {
            type: "button",
            class: "ss-btn primary",
            disabled: d.value || !M.personId || !M.recorded || !M.consent,
            "data-test": "mm-vp-rec-submit",
            onClick: B
          }, [
            e.createElementVNode(
              "i",
              {
                class: e.normalizeClass(d.value ? "ri-loader-4-line spin" : "ri-check-line")
              },
              null,
              2
              /* CLASS */
            ),
            e.createTextVNode(
              e.toDisplayString(D.$t("提交声纹")),
              1
              /* TEXT */
            )
          ], 8, by)
        ]),
        default: e.withCtx(() => [
          e.createElementVNode("div", Ny, [
            e.createElementVNode("div", Vy, [
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(D.$t("员工")),
                1
                /* TEXT */
              ),
              e.createVNode(we, {
                modelValue: M.personId,
                "onUpdate:modelValue": O[10] || (O[10] = (G) => M.personId = G),
                people: l.people,
                depts: l.depts,
                multiple: !1,
                "max-height": 180
              }, null, 8, ["modelValue", "people", "depts"])
            ]),
            U.value ? (e.openBlock(), e.createBlock(Rt, {
              key: 0,
              script: V.value,
              disabled: d.value,
              onRecorded: O[11] || (O[11] = (G) => M.recorded = G),
              onReset: O[12] || (O[12] = (G) => M.recorded = null)
            }, null, 8, ["script", "disabled"])) : e.createCommentVNode("v-if", !0),
            e.createElementVNode("label", Ey, [
              e.withDirectives(e.createElementVNode(
                "input",
                {
                  "onUpdate:modelValue": O[13] || (O[13] = (G) => M.consent = G),
                  type: "checkbox",
                  "data-test": "mm-vp-rec-consent"
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [e.vModelCheckbox, M.consent]
              ]),
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(M.personId === z.value ? D.$t("我同意采集本人的声纹（声音特征），并在我确认会议发言后用其中我本人的发言补充声纹（最多保留最近 5 条），只用于在会议纪要里识别我的发言，保存在这台电脑上，可以随时在声纹库关闭补充或删除声纹。") : D.$t("我已取得该员工本人对采集、使用声纹（含确认会议发言后用其本人发言补充声纹）的单独同意（个人信息保护法）；授权人与授权时间会记录在案。")),
                1
                /* TEXT */
              )
            ]),
            C.value ? (e.openBlock(), e.createElementBlock("p", $y, [
              O[34] || (O[34] = e.createElementVNode(
                "i",
                { class: "ri-error-warning-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(C.value),
                1
                /* TEXT */
              )
            ])) : e.createCommentVNode("v-if", !0)
          ])
        ]),
        _: 1
        /* STABLE */
      }, 8, ["open", "title", "description"])
    ]));
  }
}), By = /* @__PURE__ */ oe(_y, [["__scopeId", "data-v-c960e8d1"]]), Sy = {
  class: "mm-so",
  "data-test": "mm-org"
}, Dy = { class: "mm-sp__head" }, wy = { class: "ss-actions" }, Cy = ["disabled"], Ty = ["disabled"], Iy = {
  key: 0,
  class: "ss-note warn"
}, My = {
  key: 1,
  class: "ss-note warn",
  "data-test": "mm-org-warnings"
}, Ay = {
  key: 2,
  class: "ss-note danger"
}, jy = {
  key: 3,
  class: "mm-so__last",
  "data-test": "mm-org-last"
}, Ly = { class: "mm-so__lasthead" }, zy = {
  key: 0,
  class: "ss-chip bad"
}, Fy = {
  key: 0,
  class: "ss-note danger"
}, Py = { class: "mm-so__diff" }, Uy = ["disabled", "aria-expanded", "onClick"], Oy = {
  key: 1,
  class: "mm-so__names"
}, Ry = {
  key: 4,
  class: "ss-muted"
}, qy = { class: "mm-so__cols" }, Ky = ["aria-label"], Hy = { class: "mm-so__cap" }, Wy = ["data-test", "onClick"], Gy = {
  key: 0,
  class: "ss-muted"
}, Yy = { class: "ss-table-wrap" }, Jy = { class: "ss-table" }, Qy = { key: 0 }, Zy = {
  colspan: "7",
  class: "mm-so__empty"
}, Xy = ["data-test"], xy = ["placeholder"], eg = ["placeholder"], tg = { class: "mm-so__ops" }, lg = ["disabled", "onClick"], ng = ["title"], og = { class: "mono" }, ag = { class: "mm-so__ops" }, sg = ["data-test", "onClick"], rg = /* @__PURE__ */ e.defineComponent({
  __name: "SettingsOrg",
  props: {
    people: {},
    depts: {}
  },
  emits: ["changed"],
  setup(l, { emit: u }) {
    const n = [
      { key: "added", title: t.t("新增") },
      { key: "changed", title: t.t("变更") },
      { key: "left", title: t.t("离职") }
    ], p = l, f = u, s = ie.useNotificationStore(), o = e.ref(!1), d = e.ref(""), i = e.ref(null), k = e.ref(""), h = e.ref(""), m = e.computed(() => !!ne.value?.wecomConnected), c = (v) => ne.value?.org.source !== "demo" || !!v.wecomIdManual, g = (v) => v.mobile || v.wecomUserId && c(v) ? t.t("群消息能提醒到本人") : t.t("没有手机号和企微账号：群消息里只写姓名"), N = e.ref(""), a = e.reactive({ mobile: "", wecomUserId: "" });
    function I(v) {
      N.value = v.id, a.mobile = v.mobile || "", a.wecomUserId = v.wecomUserId && c(v) ? v.wecomUserId : "";
    }
    async function P(v) {
      o.value = !0, d.value = "";
      try {
        const S = { personId: v.id, mobile: a.mobile.trim() };
        (a.wecomUserId.trim() || c(v)) && (S.wecomUserId = a.wecomUserId.trim()), await Y("org.person.contact", S), N.value = "", s.success(t.t("已保存")), f("changed");
      } catch (S) {
        d.value = Z.errorMessage(S);
      } finally {
        o.value = !1;
      }
    }
    async function U() {
      o.value = !0, d.value = "";
      try {
        const v = await Y("org.importFile");
        if (!v) return;
        i.value = v, s.success(t.t("导入完成：新增 {a}、变更 {b}、离职 {c}", { a: v.added.length, b: v.changed.length, c: v.left.length })), f("changed");
      } catch (v) {
        d.value = Z.errorMessage(v);
      } finally {
        o.value = !1;
      }
    }
    const M = e.computed(() => i.value ?? ne.value?.org.lastSync ?? null), C = e.computed(() => p.people.filter((v) => v.deptId === h.value && !v.left)), T = (v) => p.people.find((S) => S.id === v)?.name || v, z = (v) => p.people.filter((S) => S.deptId === v && !S.left).length, R = (v) => v.leaderIds.map(T).join(t.t("、")), _ = (v) => {
      const S = p.depts.find((j) => j.id === h.value);
      return S ? S.leaderIds.indexOf(v) + 1 : 0;
    };
    e.watch(() => p.depts, (v) => {
      v.some((S) => S.id === h.value) || (h.value = v[0]?.id ?? "");
    }, { immediate: !0 });
    async function E() {
      o.value = !0, d.value = "";
      try {
        const v = await Y("org.sync");
        i.value = v, v?.error ? d.value = v.error : s.success(t.t("同步完成：新增 {a}、变更 {b}、离职 {c}", { a: v?.added?.length ?? 0, b: v?.changed?.length ?? 0, c: v?.left?.length ?? 0 })), f("changed");
      } catch (v) {
        d.value = Z.errorMessage(v);
      } finally {
        o.value = !1;
      }
    }
    return (v, S) => (e.openBlock(), e.createElementBlock("div", Sy, [
      e.createElementVNode("header", Dy, [
        e.createElementVNode("div", null, [
          e.createElementVNode(
            "h3",
            null,
            e.toDisplayString(v.$t("通讯录同步")),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "p",
            null,
            e.toDisplayString(v.$t("人员只来自企微通讯录：部门、部门负责人（任务下发给第一位）、成员、职务、直属上级。系统内不维护人员信息；离职人员保留历史数据，不能再被选。")),
            1
            /* TEXT */
          ),
          e.createElementVNode("p", null, [
            e.createTextVNode(
              e.toDisplayString(v.$t("没有企微自建应用时，可以导入企微管理后台导出的通讯录表格（通讯录 → 批量导入/导出 → 导出成员）。群消息按手机号或企微账号提醒本人，表里没有的可以在下面逐个填。")) + " ",
              1
              /* TEXT */
            ),
            e.createElementVNode("button", {
              type: "button",
              class: "ss-link",
              "data-test": "mm-org-link-contacts",
              onClick: S[0] || (S[0] = (j) => e.unref(pe)(e.unref(ge).contacts))
            }, [
              e.createTextVNode(
                e.toDisplayString(v.$t("去企微后台导出")) + " ",
                1
                /* TEXT */
              ),
              S[4] || (S[4] = e.createElementVNode(
                "i",
                { class: "ri-external-link-line" },
                null,
                -1
                /* CACHED */
              ))
            ])
          ])
        ]),
        e.createElementVNode("div", wy, [
          e.createElementVNode("button", {
            type: "button",
            class: "ss-btn",
            disabled: o.value,
            "data-test": "mm-org-import",
            onClick: U
          }, [
            S[5] || (S[5] = e.createElementVNode(
              "i",
              { class: "ri-file-excel-2-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(v.$t("导入通讯录表格")),
              1
              /* TEXT */
            )
          ], 8, Cy),
          e.createElementVNode("button", {
            type: "button",
            class: "ss-btn primary",
            disabled: o.value,
            "data-test": "mm-org-sync",
            onClick: E
          }, [
            e.createElementVNode(
              "i",
              {
                class: e.normalizeClass(o.value ? "ri-loader-4-line spin" : "ri-refresh-line")
              },
              null,
              2
              /* CLASS */
            ),
            e.createTextVNode(
              e.toDisplayString(v.$t("立即同步")),
              1
              /* TEXT */
            )
          ], 8, Ty)
        ])
      ]),
      m.value ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock("p", Iy, [
        S[6] || (S[6] = e.createElementVNode(
          "i",
          { class: "ri-information-line" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(v.$t("未连接企微：「立即同步」会载入演示组织。到「消息推送」里填好 CorpID / AgentID / Secret 后再同步，就是真实通讯录。")),
          1
          /* TEXT */
        )
      ])),
      M.value?.warnings?.length ? (e.openBlock(), e.createElementBlock("div", My, [
        S[7] || (S[7] = e.createElementVNode(
          "i",
          { class: "ri-alert-line" },
          null,
          -1
          /* CACHED */
        )),
        e.createElementVNode("div", null, [
          (e.openBlock(!0), e.createElementBlock(
            e.Fragment,
            null,
            e.renderList(M.value.warnings, (j, J) => (e.openBlock(), e.createElementBlock(
              "p",
              { key: J },
              e.toDisplayString(j),
              1
              /* TEXT */
            ))),
            128
            /* KEYED_FRAGMENT */
          ))
        ])
      ])) : e.createCommentVNode("v-if", !0),
      d.value ? (e.openBlock(), e.createElementBlock("p", Ay, [
        S[8] || (S[8] = e.createElementVNode(
          "i",
          { class: "ri-error-warning-line" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(d.value),
          1
          /* TEXT */
        )
      ])) : e.createCommentVNode("v-if", !0),
      M.value ? (e.openBlock(), e.createElementBlock("section", jy, [
        e.createElementVNode("div", Ly, [
          e.createElementVNode(
            "strong",
            null,
            e.toDisplayString(v.$t("上次同步")),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "span",
            null,
            e.toDisplayString(e.unref(Ne)(M.value.at)),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "span",
            null,
            e.toDisplayString(v.$t("操作人 {name}", { name: T(M.value.by) })),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "span",
            {
              class: e.normalizeClass(["ss-chip", M.value.source === "demo" ? "brand" : "ok"])
            },
            e.toDisplayString(M.value.source === "wecom" ? v.$t("企微通讯录") : M.value.source === "import" ? v.$t("导入的通讯录") : v.$t("演示组织")),
            3
            /* TEXT, CLASS */
          ),
          M.value.error ? (e.openBlock(), e.createElementBlock(
            "span",
            zy,
            e.toDisplayString(v.$t("同步出错")),
            1
            /* TEXT */
          )) : e.createCommentVNode("v-if", !0)
        ]),
        M.value.error ? (e.openBlock(), e.createElementBlock(
          "p",
          Fy,
          e.toDisplayString(M.value.error),
          1
          /* TEXT */
        )) : e.createCommentVNode("v-if", !0),
        e.createElementVNode("ul", Py, [
          (e.openBlock(), e.createElementBlock(
            e.Fragment,
            null,
            e.renderList(n, (j) => e.createElementVNode(
              "li",
              {
                key: j.key,
                class: e.normalizeClass(j.key)
              },
              [
                e.createElementVNode("button", {
                  type: "button",
                  disabled: !M.value[j.key].length,
                  "aria-expanded": k.value === j.key,
                  onClick: (J) => k.value = k.value === j.key ? "" : j.key
                }, [
                  e.createElementVNode(
                    "b",
                    null,
                    e.toDisplayString(M.value[j.key].length),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "small",
                    null,
                    e.toDisplayString(j.title),
                    1
                    /* TEXT */
                  )
                ], 8, Uy)
              ],
              2
              /* CLASS */
            )),
            64
            /* STABLE_FRAGMENT */
          ))
        ]),
        k.value && M.value[k.value].length ? (e.openBlock(), e.createElementBlock(
          "p",
          Oy,
          e.toDisplayString(M.value[k.value].map(T).join(v.$t("、"))),
          1
          /* TEXT */
        )) : e.createCommentVNode("v-if", !0)
      ])) : (e.openBlock(), e.createElementBlock(
        "p",
        Ry,
        e.toDisplayString(v.$t("还没有同步过")),
        1
        /* TEXT */
      )),
      e.createElementVNode("div", qy, [
        e.createElementVNode("nav", {
          class: "mm-so__depts",
          "aria-label": v.$t("部门")
        }, [
          e.createElementVNode(
            "p",
            Hy,
            e.toDisplayString(v.$t("部门（{n}）", { n: l.depts.length })),
            1
            /* TEXT */
          ),
          (e.openBlock(!0), e.createElementBlock(
            e.Fragment,
            null,
            e.renderList(l.depts, (j) => (e.openBlock(), e.createElementBlock("button", {
              key: j.id,
              type: "button",
              class: e.normalizeClass({ on: h.value === j.id }),
              "data-test": `mm-org-dept-${j.id}`,
              onClick: (J) => h.value = j.id
            }, [
              e.createElementVNode(
                "strong",
                null,
                e.toDisplayString(j.name),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "small",
                null,
                e.toDisplayString(v.$t("{n} 人", { n: z(j.id) })) + " · " + e.toDisplayString(v.$t("负责人 {names}", { names: R(j) || "—" })),
                1
                /* TEXT */
              )
            ], 10, Wy))),
            128
            /* KEYED_FRAGMENT */
          )),
          l.depts.length ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock(
            "p",
            Gy,
            e.toDisplayString(v.$t("还没有部门")),
            1
            /* TEXT */
          ))
        ], 8, Ky),
        e.createElementVNode("div", Yy, [
          e.createElementVNode("table", Jy, [
            e.createElementVNode("thead", null, [
              e.createElementVNode("tr", null, [
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(v.$t("姓名")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(v.$t("职务")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(v.$t("直属上级")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(v.$t("部门负责人")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(v.$t("企微账号")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(v.$t("手机号")),
                  1
                  /* TEXT */
                ),
                S[9] || (S[9] = e.createElementVNode(
                  "th",
                  null,
                  null,
                  -1
                  /* CACHED */
                ))
              ])
            ]),
            e.createElementVNode("tbody", null, [
              C.value.length ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock("tr", Qy, [
                e.createElementVNode(
                  "td",
                  Zy,
                  e.toDisplayString(v.$t("这个部门没有成员")),
                  1
                  /* TEXT */
                )
              ])),
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(C.value, (j) => (e.openBlock(), e.createElementBlock("tr", {
                  key: j.id,
                  "data-test": `mm-org-row-${j.id}`
                }, [
                  e.createElementVNode("td", null, [
                    e.createVNode(ze, {
                      name: j.name
                    }, null, 8, ["name"])
                  ]),
                  e.createElementVNode(
                    "td",
                    null,
                    e.toDisplayString(j.title || "—"),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "td",
                    null,
                    e.toDisplayString(j.leaderId ? T(j.leaderId) : "—"),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode("td", null, [
                    _(j.id) > 0 ? (e.openBlock(), e.createElementBlock(
                      "span",
                      {
                        key: 0,
                        class: e.normalizeClass(["ss-chip", _(j.id) === 1 ? "brand" : ""])
                      },
                      e.toDisplayString(_(j.id) === 1 ? v.$t("第一负责人") : v.$t("负责人 {n}", { n: _(j.id) })),
                      3
                      /* TEXT, CLASS */
                    )) : e.createCommentVNode("v-if", !0)
                  ]),
                  N.value === j.id ? (e.openBlock(), e.createElementBlock(
                    e.Fragment,
                    { key: 0 },
                    [
                      e.createElementVNode("td", null, [
                        e.withDirectives(e.createElementVNode("input", {
                          "onUpdate:modelValue": S[1] || (S[1] = (J) => a.wecomUserId = J),
                          class: "mm-so__in mono",
                          placeholder: v.$t("企微账号"),
                          spellcheck: "false",
                          "data-test": "mm-org-edit-uid"
                        }, null, 8, xy), [
                          [e.vModelText, a.wecomUserId]
                        ])
                      ]),
                      e.createElementVNode("td", null, [
                        e.withDirectives(e.createElementVNode("input", {
                          "onUpdate:modelValue": S[2] || (S[2] = (J) => a.mobile = J),
                          class: "mm-so__in mono",
                          type: "tel",
                          placeholder: v.$t("手机号"),
                          "data-test": "mm-org-edit-mobile"
                        }, null, 8, eg), [
                          [e.vModelText, a.mobile]
                        ])
                      ]),
                      e.createElementVNode("td", tg, [
                        e.createElementVNode("button", {
                          type: "button",
                          class: "ss-link",
                          disabled: o.value,
                          "data-test": "mm-org-edit-save",
                          onClick: (J) => P(j)
                        }, e.toDisplayString(v.$t("保存")), 9, lg),
                        e.createElementVNode(
                          "button",
                          {
                            type: "button",
                            class: "ss-link",
                            onClick: S[3] || (S[3] = (J) => N.value = "")
                          },
                          e.toDisplayString(v.$t("取消")),
                          1
                          /* TEXT */
                        )
                      ])
                    ],
                    64
                    /* STABLE_FRAGMENT */
                  )) : (e.openBlock(), e.createElementBlock(
                    e.Fragment,
                    { key: 1 },
                    [
                      e.createElementVNode("td", {
                        class: "mono",
                        title: g(j)
                      }, e.toDisplayString(j.wecomUserId && c(j) ? j.wecomUserId : "—"), 9, ng),
                      e.createElementVNode(
                        "td",
                        og,
                        e.toDisplayString(j.mobile || "—"),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode("td", ag, [
                        e.createElementVNode("button", {
                          type: "button",
                          class: "ss-link",
                          "data-test": `mm-org-edit-${j.id}`,
                          onClick: (J) => I(j)
                        }, e.toDisplayString(v.$t("编辑")), 9, sg)
                      ])
                    ],
                    64
                    /* STABLE_FRAGMENT */
                  ))
                ], 8, Xy))),
                128
                /* KEYED_FRAGMENT */
              ))
            ])
          ])
        ])
      ])
    ]));
  }
}), ig = /* @__PURE__ */ oe(rg, [["__scopeId", "data-v-8cd11796"]]), cg = {
  class: "mm-sr",
  "data-test": "mm-roles"
}, dg = { class: "mm-sp__head" }, mg = {
  key: 0,
  class: "ss-note danger"
}, ug = { class: "mm-sr__cols" }, pg = { class: "mm-sr__card" }, vg = { class: "ss-muted" }, kg = { class: "mm-sr__card" }, yg = { class: "ss-muted" }, gg = {
  key: 1,
  class: "ss-note warn"
}, fg = { class: "ss-actions" }, Ng = ["disabled"], Vg = /* @__PURE__ */ e.defineComponent({
  __name: "SettingsRoles",
  props: {
    settings: {},
    people: {},
    depts: {}
  },
  emits: ["saved"],
  setup(l, { emit: u }) {
    const n = l, p = u, f = $e.useDialog(), s = ie.useNotificationStore(), o = e.ref(!1), d = e.ref(""), i = e.reactive({ adminIds: [], projectCreatorIds: [] }), k = (a, I) => a.length === I.length && a.every((P) => I.includes(P)), h = e.computed(() => !k(i.adminIds, n.settings.adminIds) || !k(i.projectCreatorIds, n.settings.projectCreatorIds)), m = e.computed(() => ne.value?.me.person?.id || ""), c = e.computed(() => !!m.value && n.settings.adminIds.includes(m.value) && !i.adminIds.includes(m.value));
    function g() {
      i.adminIds = [...n.settings.adminIds], i.projectCreatorIds = [...n.settings.projectCreatorIds];
    }
    e.watch(() => n.settings, g, { immediate: !0 });
    async function N() {
      if (!(c.value && !await f.confirm({ title: t.t("去掉自己的管理员"), message: t.t("保存后你将无法再进入系统设置，确定吗？"), danger: !0 }))) {
        o.value = !0, d.value = "";
        try {
          const a = await Y("settings.save", { patch: { adminIds: i.adminIds, projectCreatorIds: i.projectCreatorIds } });
          s.success(t.t("角色权限已保存")), p("saved", a);
        } catch (a) {
          d.value = Z.errorMessage(a);
        } finally {
          o.value = !1;
        }
      }
    }
    return (a, I) => (e.openBlock(), e.createElementBlock("div", cg, [
      e.createElementVNode("header", dg, [
        e.createElementVNode("div", null, [
          e.createElementVNode(
            "h3",
            null,
            e.toDisplayString(a.$t("角色权限")),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "p",
            null,
            e.toDisplayString(a.$t("菜单对所有人相同，按钮按角色显示。系统级角色只有两类：管理员（系统设置、切换当前身份）和可新建项目的人；项目负责人、主持人、发言人、任务负责人、部门负责人都按项目 / 会议自动产生。")),
            1
            /* TEXT */
          )
        ])
      ]),
      d.value ? (e.openBlock(), e.createElementBlock("p", mg, [
        I[2] || (I[2] = e.createElementVNode(
          "i",
          { class: "ri-error-warning-line" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(d.value),
          1
          /* TEXT */
        )
      ])) : e.createCommentVNode("v-if", !0),
      e.createElementVNode("div", ug, [
        e.createElementVNode("section", pg, [
          e.createElementVNode(
            "h4",
            null,
            e.toDisplayString(a.$t("管理员（{n}）", { n: i.adminIds.length })),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "p",
            vg,
            e.toDisplayString(a.$t("管理员可以进入系统设置、代办与演示时切换当前身份，也可以新建项目。至少保留一位。")),
            1
            /* TEXT */
          ),
          e.createVNode(we, {
            modelValue: i.adminIds,
            "onUpdate:modelValue": I[0] || (I[0] = (P) => i.adminIds = P),
            people: l.people,
            depts: l.depts,
            "max-height": 260
          }, null, 8, ["modelValue", "people", "depts"])
        ]),
        e.createElementVNode("section", kg, [
          e.createElementVNode(
            "h4",
            null,
            e.toDisplayString(a.$t("可新建项目的人（{n}）", { n: i.projectCreatorIds.length })),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "p",
            yg,
            e.toDisplayString(a.$t("除管理员外，还有谁可以新建项目；建项目时指定的项目负责人不需要在这里。")),
            1
            /* TEXT */
          ),
          e.createVNode(we, {
            modelValue: i.projectCreatorIds,
            "onUpdate:modelValue": I[1] || (I[1] = (P) => i.projectCreatorIds = P),
            people: l.people,
            depts: l.depts,
            "max-height": 260
          }, null, 8, ["modelValue", "people", "depts"])
        ])
      ]),
      c.value ? (e.openBlock(), e.createElementBlock("p", gg, [
        I[3] || (I[3] = e.createElementVNode(
          "i",
          { class: "ri-alert-line" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(a.$t("你把自己从管理员里去掉了：保存后将无法再进入系统设置。")),
          1
          /* TEXT */
        )
      ])) : e.createCommentVNode("v-if", !0),
      e.createElementVNode("div", fg, [
        e.createElementVNode("button", {
          type: "button",
          class: "ss-btn primary",
          disabled: o.value || !h.value || !i.adminIds.length,
          "data-test": "mm-roles-save",
          onClick: N
        }, [
          e.createElementVNode(
            "i",
            {
              class: e.normalizeClass(o.value ? "ri-loader-4-line spin" : "ri-save-line")
            },
            null,
            2
            /* CLASS */
          ),
          e.createTextVNode(
            e.toDisplayString(a.$t("保存")),
            1
            /* TEXT */
          )
        ], 8, Ng),
        h.value ? (e.openBlock(), e.createElementBlock(
          "button",
          {
            key: 0,
            type: "button",
            class: "ss-link",
            onClick: g
          },
          e.toDisplayString(a.$t("撤销修改")),
          1
          /* TEXT */
        )) : e.createCommentVNode("v-if", !0)
      ])
    ]));
  }
}), Eg = /* @__PURE__ */ oe(Vg, [["__scopeId", "data-v-cae13c9f"]]), $g = {
  class: "mm-asr",
  "data-test": "mm-asr"
}, bg = ["aria-label"], hg = ["aria-checked"], _g = ["aria-checked"], Bg = {
  key: 0,
  class: "ss-muted"
}, Sg = { class: "mm-asr__tag" }, Dg = {
  key: 0,
  class: "ss-chip ok",
  "data-test": "mm-asr-best-ready"
}, wg = { class: "mm-asr__facts" }, Cg = {
  key: 0,
  class: "ss-note warn mm-asr__why"
}, Tg = {
  key: 1,
  class: "mm-asr__act"
}, Ig = ["disabled"], Mg = { key: 0 }, Ag = {
  class: "mm-asr__more",
  "data-test": "mm-asr-more"
}, jg = { class: "ss-table-wrap" }, Lg = { class: "ss-table mm-asr__table" }, zg = { class: "num" }, Fg = { class: "num" }, Pg = { class: "num" }, Ug = { class: "num" }, Og = { class: "num" }, Rg = ["data-test"], qg = { class: "num" }, Kg = { class: "num" }, Hg = { class: "num" }, Wg = { class: "num" }, Gg = { class: "num" }, Yg = { class: "mm-asr__cell-act" }, Jg = {
  key: 0,
  class: "ss-chip ok"
}, Qg = ["disabled", "data-test", "onClick"], Zg = {
  key: 2,
  class: "ss-muted"
}, Xg = { class: "ss-muted mm-asr__src" }, xg = { class: "ss-field mm-asr__pref" }, ef = { value: "auto" }, tf = {
  key: 2,
  class: "mm-asr__cloud",
  "data-test": "mm-asr-cloud"
}, lf = { class: "ss-field" }, nf = { value: "dashscope" }, of = { value: "siliconflow" }, af = { value: "custom" }, sf = { class: "ss-field" }, rf = { class: "ss-field" }, cf = { id: "mm-asr-models" }, df = ["value"], mf = { class: "ss-field" }, uf = {
  key: 0,
  class: "mm-asr__set"
}, pf = { class: "mm-asr__secret" }, vf = ["type", "placeholder"], kf = ["title"], yf = { class: "ss-note info" }, gf = { class: "mm-asr__act" }, ff = ["disabled"], Nf = ["disabled"], Vf = ["disabled"], Ef = {
  key: 3,
  class: "ss-muted mono mm-asr__log",
  "data-test": "mm-asr-log"
}, $f = {
  key: 4,
  class: "ss-note danger",
  "data-test": "mm-asr-error"
}, bf = /* @__PURE__ */ e.defineComponent({
  __name: "AsrModelPicker",
  emits: ["changed"],
  setup(l, { expose: u, emit: n }) {
    const p = n, f = ie.useNotificationStore(), s = e.ref(null), o = e.ref(!1), d = e.ref(!1), i = e.ref(""), k = e.ref(""), h = e.ref(""), m = e.ref(""), c = e.ref("local"), g = e.ref("auto"), N = e.reactive({ provider: "dashscope", baseUrl: "", model: "", apiKey: "" }), a = e.ref(!1), I = e.ref(""), P = e.ref(!1), U = e.computed(() => s.value?.asr.presets ?? []), M = e.computed(() => U.value.find((b) => b.id === N.provider)), C = e.computed(() => M.value?.models ?? []), T = e.computed(() => M.value?.keyUrl || ""), z = e.computed(() => !!s.value?.models.asrReady), R = e.computed(() => s.value?.recommend.engine === "firered" ? { title: t.t("FireRedASR2（最准）+ SenseVoice 兜底"), desc: t.t("实测最准的本机模型：普通话、各地口音、吴语 / 上海话 / 闽南语 / 粤语和专业名词都明显好于以前的 Whisper。嘈杂片段自动换 SenseVoice 的结果，不会出乱码。") } : { title: t.t("SenseVoice（快速）"), desc: t.t("又快又小：普通话、口音和粤语都认，带标点，比以前的 Whisper 准一倍，1 小时录音一两分钟转完。") }), _ = e.computed(() => {
      const b = s.value?.recommend, B = s.value?.hardware;
      if (!b?.downgradeReason || !B) return "";
      const D = b.downgradeReason === "memory" ? t.t("内存 {n} GB", { n: B.memGb }) : b.downgradeReason === "cores" ? t.t("处理器 {n} 核", { n: B.cores }) : t.t("磁盘只剩 {n} GB", { n: B.freeDiskGb ?? 0 });
      return t.t("最准的 FireRedASR2 需要 16 GB 以上内存、8 核以上处理器和约 1.5 GB 磁盘，这台电脑{why}，所以推荐 SenseVoice。", { why: D });
    }), E = e.computed(() => {
      const b = s.value;
      if (!b) return [];
      const B = b.estimates;
      return [
        { key: "firered", name: "FireRedASR2", note: t.t("最准，含方言"), room: "12.5%", phone: "10.6%", wu: "18.5%", time: B ? t.t("约 {n} 分钟", { n: B.firered }) : "—", size: "1.2 GB", ready: !!b.models.fireRed, installId: "asr-meeting-firered2" },
        { key: "sensevoice", name: "SenseVoice", note: t.t("快、小，也做兜底"), room: "14.3%", phone: "20.3%", wu: "34.5%", time: B ? t.t("约 {n} 分钟", { n: B.sensevoice }) : "—", size: "228 MB", ready: !!b.models.senseVoice, installId: "asr-meeting-sensevoice" },
        { key: "whisper", name: "Whisper large-v3", note: t.t("只在阿拉伯语等其他语种时用"), room: "31.7%", phone: "34.5%", wu: "77.7%", time: t.t("约 16 分钟"), size: "2.9 GB", ready: b.models.asrModel === "large-v3", installId: "" }
      ];
    });
    function v(b) {
      c.value = b.asr.mode, g.value = b.asr.localModel;
      const B = b.asr.cloud, D = B?.provider ?? "dashscope", O = b.asr.presets.find((G) => G.id === D);
      Object.assign(N, { provider: D, baseUrl: B?.baseUrl ?? O?.baseUrl ?? "", model: B?.model ?? O?.models[0] ?? "", apiKey: "" });
    }
    async function S() {
      o.value = !0;
      try {
        const b = await Y("setup.status");
        s.value = b, b && v(b), k.value = "";
      } catch (b) {
        k.value = Z.errorMessage(b);
      } finally {
        o.value = !1;
      }
    }
    async function j(b, B) {
      d.value = !0, i.value = b, k.value = "";
      try {
        await B();
      } catch (D) {
        k.value = Z.errorMessage(D);
      } finally {
        d.value = !1, i.value = "";
      }
    }
    function J(b) {
      if (I.value = "", b === "cloud") {
        c.value = "cloud";
        return;
      }
      c.value = "local", s.value?.asr.mode !== "local" && y();
    }
    function y() {
      return j("mode", async () => {
        const b = await Y("asr.mode.save", { mode: c.value === "cloud" ? "cloud" : "local", localModel: g.value });
        s.value && b && (s.value.asr = b), p("changed");
      });
    }
    function V() {
      const b = M.value;
      N.baseUrl = b?.baseUrl ?? "", N.model = b?.models[0] ?? "", I.value = "";
    }
    function r() {
      return { provider: N.provider, baseUrl: N.baseUrl.trim(), model: N.model.trim(), apiKey: N.apiKey.trim() };
    }
    function W() {
      return I.value = "", j("test", async () => {
        const b = await Y("asr.cloud.test", r());
        P.value = !!b?.ok, I.value = b?.ok ? t.t("连接正常（{n} 毫秒），地址、模型和 API Key 都对", { n: b.ms ?? 0 }) : b?.error || t.t("连接失败");
      });
    }
    function X() {
      return j("save", async () => {
        await Y("asr.cloud.save", r());
        const b = await Y("asr.mode.save", { mode: "cloud", localModel: g.value });
        s.value && b && (s.value.asr = b), N.apiKey = "", a.value = !1, f.success(t.t("已改为在线接口转写")), p("changed");
      });
    }
    function ae() {
      return window.confirm(t.t("清除在线接口和保存的 API Key？会议转写会改回本机模型。")) ? j("clear", async () => {
        const b = await Y("asr.cloud.save", { clear: !0 });
        s.value && b && (s.value.asr = b, v(s.value)), p("changed");
      }) : Promise.resolve();
    }
    async function q() {
      if (a.value) {
        a.value = !1;
        return;
      }
      if (!N.apiKey && s.value?.asr.cloud?.hasKey)
        try {
          N.apiKey = (await Y("asr.cloud.reveal"))?.apiKey || "";
        } catch (b) {
          k.value = Z.errorMessage(b);
          return;
        }
      a.value = !0;
    }
    function H() {
      pe(T.value);
    }
    const ee = () => window.electronAPI?.pyExt;
    async function le(b) {
      const B = ee();
      if (!B?.install) {
        k.value = t.t("组件安装器不可用，请到应用的 设置 → 语音 里下载");
        return;
      }
      k.value = "";
      try {
        for (const D of b) {
          if (D === "asr-meeting-firered2" && s.value?.models.fireRed || D === "asr-meeting-sensevoice" && s.value?.models.senseVoice) continue;
          h.value = D, m.value = t.t("开始下载…");
          const O = await B.install(D);
          if (!O?.ok) {
            k.value = O?.error || t.t("下载失败");
            break;
          }
          await S();
        }
        k.value || (m.value = t.t("下载完成")), p("changed");
      } catch (D) {
        k.value = Z.errorMessage(D);
      } finally {
        h.value = "";
      }
    }
    let $ = null;
    return e.onMounted(() => {
      S();
      const b = ee();
      b?.onInstallProgress && ($ = b.onInstallProgress((B) => {
        B?.id && B.id === h.value && B.line && (m.value = String(B.line).slice(0, 200));
      }));
    }), e.onBeforeUnmount(() => {
      try {
        $?.();
      } catch {
      }
    }), u({ reload: S }), (b, B) => (e.openBlock(), e.createElementBlock("section", $g, [
      e.createElementVNode("div", {
        class: "mm-asr__modes",
        role: "radiogroup",
        "aria-label": b.$t("转写方式")
      }, [
        e.createElementVNode("button", {
          type: "button",
          role: "radio",
          "aria-checked": c.value !== "cloud",
          class: e.normalizeClass({ on: c.value !== "cloud" }),
          "data-test": "mm-asr-mode-local",
          onClick: B[0] || (B[0] = (D) => J("local"))
        }, [
          B[9] || (B[9] = e.createElementVNode(
            "i",
            { class: "ri-computer-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createElementVNode("span", null, [
            e.createElementVNode(
              "strong",
              null,
              e.toDisplayString(b.$t("本机模型")),
              1
              /* TEXT */
            ),
            e.createElementVNode(
              "small",
              null,
              e.toDisplayString(b.$t("推荐 · 录音不出这台电脑")),
              1
              /* TEXT */
            )
          ])
        ], 10, hg),
        e.createElementVNode("button", {
          type: "button",
          role: "radio",
          "aria-checked": c.value === "cloud",
          class: e.normalizeClass({ on: c.value === "cloud" }),
          "data-test": "mm-asr-mode-cloud",
          onClick: B[1] || (B[1] = (D) => J("cloud"))
        }, [
          B[10] || (B[10] = e.createElementVNode(
            "i",
            { class: "ri-cloud-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createElementVNode("span", null, [
            e.createElementVNode(
              "strong",
              null,
              e.toDisplayString(b.$t("在线接口")),
              1
              /* TEXT */
            ),
            e.createElementVNode(
              "small",
              null,
              e.toDisplayString(b.$t("填自己的语音识别 API")),
              1
              /* TEXT */
            )
          ])
        ], 10, _g)
      ], 8, bg),
      o.value && !s.value ? (e.openBlock(), e.createElementBlock("p", Bg, [
        B[11] || (B[11] = e.createElementVNode(
          "i",
          { class: "ri-loader-4-line spin" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          " " + e.toDisplayString(b.$t("正在检测这台电脑…")),
          1
          /* TEXT */
        )
      ])) : s.value && c.value !== "cloud" ? (e.openBlock(), e.createElementBlock(
        e.Fragment,
        { key: 1 },
        [
          e.createElementVNode(
            "article",
            {
              class: e.normalizeClass(["mm-asr__best", { ready: z.value }]),
              "data-test": "mm-asr-best"
            },
            [
              e.createElementVNode("header", null, [
                e.createElementVNode("span", Sg, [
                  B[12] || (B[12] = e.createElementVNode(
                    "i",
                    { class: "ri-medal-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(b.$t("为这台电脑推荐")),
                    1
                    /* TEXT */
                  )
                ]),
                z.value ? (e.openBlock(), e.createElementBlock(
                  "span",
                  Dg,
                  e.toDisplayString(b.$t("已就绪")),
                  1
                  /* TEXT */
                )) : e.createCommentVNode("v-if", !0)
              ]),
              e.createElementVNode(
                "h4",
                null,
                e.toDisplayString(R.value.title),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "p",
                null,
                e.toDisplayString(R.value.desc),
                1
                /* TEXT */
              ),
              e.createElementVNode("ul", wg, [
                e.createElementVNode("li", null, [
                  B[13] || (B[13] = e.createElementVNode(
                    "i",
                    { class: "ri-hard-drive-2-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(b.$t("约 {n} MB", { n: s.value.recommend.sizeMb })),
                    1
                    /* TEXT */
                  )
                ]),
                e.createElementVNode("li", null, [
                  B[14] || (B[14] = e.createElementVNode(
                    "i",
                    { class: "ri-timer-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(b.$t("1 小时录音约 {n} 分钟", { n: s.value.recommend.estMinPerHour })),
                    1
                    /* TEXT */
                  )
                ]),
                e.createElementVNode("li", null, [
                  B[15] || (B[15] = e.createElementVNode(
                    "i",
                    { class: "ri-shield-check-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(b.$t("全程在本机")),
                    1
                    /* TEXT */
                  )
                ])
              ]),
              s.value.recommend.downgradeReason ? (e.openBlock(), e.createElementBlock("p", Cg, [
                B[16] || (B[16] = e.createElementVNode(
                  "i",
                  { class: "ri-information-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(_.value),
                  1
                  /* TEXT */
                )
              ])) : e.createCommentVNode("v-if", !0),
              z.value ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock("div", Tg, [
                e.createElementVNode("button", {
                  type: "button",
                  class: "ss-btn primary",
                  disabled: !!h.value,
                  "data-test": "mm-asr-best-install",
                  onClick: B[2] || (B[2] = (D) => le(s.value.recommend.installIds))
                }, [
                  e.createElementVNode(
                    "i",
                    {
                      class: e.normalizeClass(h.value ? "ri-loader-4-line spin" : "ri-download-2-line")
                    },
                    null,
                    2
                    /* CLASS */
                  ),
                  e.createTextVNode(
                    e.toDisplayString(b.$t("一键下载")),
                    1
                    /* TEXT */
                  )
                ], 8, Ig),
                s.value.recommend.installIds.length > 1 ? (e.openBlock(), e.createElementBlock(
                  "small",
                  Mg,
                  e.toDisplayString(b.$t("会依次下载 SenseVoice（嘈杂片段的兜底）和 FireRedASR2")),
                  1
                  /* TEXT */
                )) : e.createCommentVNode("v-if", !0)
              ]))
            ],
            2
            /* CLASS */
          ),
          e.createElementVNode("details", Ag, [
            e.createElementVNode(
              "summary",
              null,
              e.toDisplayString(b.$t("全部本机模型与实测对比")),
              1
              /* TEXT */
            ),
            e.createElementVNode("div", jg, [
              e.createElementVNode("table", Lg, [
                e.createElementVNode("thead", null, [
                  e.createElementVNode("tr", null, [
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(b.$t("模型")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      zg,
                      e.toDisplayString(b.$t("会议室录音")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      Fg,
                      e.toDisplayString(b.$t("电话音质")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      Pg,
                      e.toDisplayString(b.$t("吴语方言")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      Ug,
                      e.toDisplayString(b.$t("1 小时耗时")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      Og,
                      e.toDisplayString(b.$t("体积")),
                      1
                      /* TEXT */
                    ),
                    B[17] || (B[17] = e.createElementVNode(
                      "th",
                      null,
                      null,
                      -1
                      /* CACHED */
                    ))
                  ])
                ]),
                e.createElementVNode("tbody", null, [
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(E.value, (D) => (e.openBlock(), e.createElementBlock("tr", {
                      key: D.key,
                      "data-test": `mm-asr-row-${D.key}`
                    }, [
                      e.createElementVNode("td", null, [
                        e.createElementVNode(
                          "strong",
                          null,
                          e.toDisplayString(D.name),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "small",
                          null,
                          e.toDisplayString(D.note),
                          1
                          /* TEXT */
                        )
                      ]),
                      e.createElementVNode(
                        "td",
                        qg,
                        e.toDisplayString(D.room),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "td",
                        Kg,
                        e.toDisplayString(D.phone),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "td",
                        Hg,
                        e.toDisplayString(D.wu),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "td",
                        Wg,
                        e.toDisplayString(D.time),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "td",
                        Gg,
                        e.toDisplayString(D.size),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode("td", Yg, [
                        D.ready ? (e.openBlock(), e.createElementBlock(
                          "span",
                          Jg,
                          e.toDisplayString(b.$t("已下载")),
                          1
                          /* TEXT */
                        )) : D.installId ? (e.openBlock(), e.createElementBlock("button", {
                          key: 1,
                          type: "button",
                          class: "ss-btn sm",
                          disabled: !!h.value,
                          "data-test": `mm-asr-install-${D.key}`,
                          onClick: (O) => le([D.installId])
                        }, [
                          e.createElementVNode(
                            "i",
                            {
                              class: e.normalizeClass(h.value === D.installId ? "ri-loader-4-line spin" : "ri-download-2-line")
                            },
                            null,
                            2
                            /* CLASS */
                          ),
                          e.createTextVNode(
                            e.toDisplayString(b.$t("下载")),
                            1
                            /* TEXT */
                          )
                        ], 8, Qg)) : (e.openBlock(), e.createElementBlock(
                          "small",
                          Zg,
                          e.toDisplayString(b.$t("在 设置 → 语音 下载")),
                          1
                          /* TEXT */
                        ))
                      ])
                    ], 8, Rg))),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ])
              ])
            ]),
            e.createElementVNode(
              "p",
              Xg,
              e.toDisplayString(b.$t("表中是字错率（越低越准），用同一批带标准答案的录音在本机实测；耗时按这台电脑的配置估算。")),
              1
              /* TEXT */
            ),
            e.createElementVNode("label", xg, [
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(b.$t("转写时用")),
                1
                /* TEXT */
              ),
              e.withDirectives(e.createElementVNode(
                "select",
                {
                  "onUpdate:modelValue": B[3] || (B[3] = (D) => g.value = D),
                  "data-test": "mm-asr-pref",
                  onChange: B[4] || (B[4] = (D) => y())
                },
                [
                  e.createElementVNode(
                    "option",
                    ef,
                    e.toDisplayString(b.$t("自动（推荐）：装了 FireRedASR2 用它，否则 SenseVoice")),
                    1
                    /* TEXT */
                  ),
                  B[18] || (B[18] = e.createElementVNode(
                    "option",
                    { value: "firered" },
                    "FireRedASR2",
                    -1
                    /* CACHED */
                  )),
                  B[19] || (B[19] = e.createElementVNode(
                    "option",
                    { value: "sensevoice" },
                    "SenseVoice",
                    -1
                    /* CACHED */
                  )),
                  B[20] || (B[20] = e.createElementVNode(
                    "option",
                    { value: "whisper" },
                    "Whisper large-v3",
                    -1
                    /* CACHED */
                  ))
                ],
                544
                /* NEED_HYDRATION, NEED_PATCH */
              ), [
                [e.vModelSelect, g.value]
              ])
            ])
          ])
        ],
        64
        /* STABLE_FRAGMENT */
      )) : s.value && c.value === "cloud" ? (e.openBlock(), e.createElementBlock("div", tf, [
        e.createElementVNode("label", lf, [
          e.createElementVNode(
            "span",
            null,
            e.toDisplayString(b.$t("服务商")),
            1
            /* TEXT */
          ),
          e.withDirectives(e.createElementVNode(
            "select",
            {
              "onUpdate:modelValue": B[5] || (B[5] = (D) => N.provider = D),
              "data-test": "mm-asr-cloud-provider",
              onChange: V
            },
            [
              e.createElementVNode(
                "option",
                nf,
                e.toDisplayString(b.$t("阿里云百炼 · Qwen3-ASR-Flash（方言好）")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "option",
                of,
                e.toDisplayString(b.$t("硅基流动 · SenseVoice / TeleSpeech 方言")),
                1
                /* TEXT */
              ),
              B[21] || (B[21] = e.createElementVNode(
                "option",
                { value: "openai" },
                "OpenAI",
                -1
                /* CACHED */
              )),
              e.createElementVNode(
                "option",
                af,
                e.toDisplayString(b.$t("其他（OpenAI 兼容接口）")),
                1
                /* TEXT */
              )
            ],
            544
            /* NEED_HYDRATION, NEED_PATCH */
          ), [
            [e.vModelSelect, N.provider]
          ])
        ]),
        e.createElementVNode("label", sf, [
          e.createElementVNode(
            "span",
            null,
            e.toDisplayString(b.$t("接口地址")),
            1
            /* TEXT */
          ),
          e.withDirectives(e.createElementVNode(
            "input",
            {
              "onUpdate:modelValue": B[6] || (B[6] = (D) => N.baseUrl = D),
              type: "url",
              spellcheck: "false",
              placeholder: "https://…/v1",
              "data-test": "mm-asr-cloud-url"
            },
            null,
            512
            /* NEED_PATCH */
          ), [
            [e.vModelText, N.baseUrl]
          ])
        ]),
        e.createElementVNode("label", rf, [
          e.createElementVNode(
            "span",
            null,
            e.toDisplayString(b.$t("模型")),
            1
            /* TEXT */
          ),
          e.withDirectives(e.createElementVNode(
            "input",
            {
              "onUpdate:modelValue": B[7] || (B[7] = (D) => N.model = D),
              type: "text",
              spellcheck: "false",
              list: "mm-asr-models",
              "data-test": "mm-asr-cloud-model"
            },
            null,
            512
            /* NEED_PATCH */
          ), [
            [e.vModelText, N.model]
          ]),
          e.createElementVNode("datalist", cf, [
            (e.openBlock(!0), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(C.value, (D) => (e.openBlock(), e.createElementBlock("option", {
                key: D,
                value: D
              }, null, 8, df))),
              128
              /* KEYED_FRAGMENT */
            ))
          ])
        ]),
        e.createElementVNode("label", mf, [
          e.createElementVNode("span", null, [
            B[22] || (B[22] = e.createTextVNode(
              "API Key ",
              -1
              /* CACHED */
            )),
            s.value.asr.cloud?.hasKey ? (e.openBlock(), e.createElementBlock(
              "em",
              uf,
              e.toDisplayString(b.$t("已保存")),
              1
              /* TEXT */
            )) : e.createCommentVNode("v-if", !0)
          ]),
          e.createElementVNode("span", pf, [
            e.withDirectives(e.createElementVNode("input", {
              "onUpdate:modelValue": B[8] || (B[8] = (D) => N.apiKey = D),
              type: a.value ? "text" : "password",
              autocomplete: "new-password",
              spellcheck: "false",
              placeholder: s.value.asr.cloud?.hasKey ? b.$t("已保存，点右边的眼睛查看") : b.$t("粘贴 API Key"),
              "data-test": "mm-asr-cloud-key"
            }, null, 8, vf), [
              [e.vModelDynamic, N.apiKey]
            ]),
            e.createElementVNode("button", {
              type: "button",
              class: "mm-asr__eye",
              title: a.value ? b.$t("隐藏") : b.$t("查看"),
              "data-test": "mm-asr-cloud-eye",
              onClick: q
            }, [
              e.createElementVNode(
                "i",
                {
                  class: e.normalizeClass(a.value ? "ri-eye-off-line" : "ri-eye-line")
                },
                null,
                2
                /* CLASS */
              )
            ], 8, kf)
          ]),
          T.value ? (e.openBlock(), e.createElementBlock(
            "a",
            {
              key: 0,
              class: "ss-link mm-asr__keylink",
              href: "#",
              onClick: e.withModifiers(H, ["prevent"])
            },
            e.toDisplayString(b.$t("去哪拿 API Key")),
            1
            /* TEXT */
          )) : e.createCommentVNode("v-if", !0)
        ]),
        e.createElementVNode("p", yf, [
          B[23] || (B[23] = e.createElementVNode(
            "i",
            { class: "ri-information-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            e.toDisplayString(b.$t("选在线接口后，会议录音会按片段（每段不超过 20 秒）上传到这个服务转写，按服务商的价格计费；认人（声纹）仍在本机。API Key 只加密保存在这台电脑。")),
            1
            /* TEXT */
          )
        ]),
        I.value ? (e.openBlock(), e.createElementBlock(
          "p",
          {
            key: 0,
            class: e.normalizeClass(["ss-note", P.value ? "ok" : "danger"]),
            "data-test": "mm-asr-cloud-test-msg"
          },
          [
            e.createElementVNode(
              "i",
              {
                class: e.normalizeClass(P.value ? "ri-checkbox-circle-line" : "ri-error-warning-line")
              },
              null,
              2
              /* CLASS */
            ),
            e.createTextVNode(
              e.toDisplayString(I.value),
              1
              /* TEXT */
            )
          ],
          2
          /* CLASS */
        )) : e.createCommentVNode("v-if", !0),
        e.createElementVNode("div", gf, [
          e.createElementVNode("button", {
            type: "button",
            class: "ss-btn",
            disabled: d.value,
            "data-test": "mm-asr-cloud-test",
            onClick: W
          }, [
            e.createElementVNode(
              "i",
              {
                class: e.normalizeClass(i.value === "test" ? "ri-loader-4-line spin" : "ri-plug-line")
              },
              null,
              2
              /* CLASS */
            ),
            e.createTextVNode(
              e.toDisplayString(b.$t("测试连接")),
              1
              /* TEXT */
            )
          ], 8, ff),
          e.createElementVNode("button", {
            type: "button",
            class: "ss-btn primary",
            disabled: d.value || !N.model.trim() || !(N.apiKey.trim() || s.value.asr.cloud?.hasKey),
            "data-test": "mm-asr-cloud-save",
            onClick: X
          }, [
            e.createElementVNode(
              "i",
              {
                class: e.normalizeClass(i.value === "save" ? "ri-loader-4-line spin" : "ri-save-line")
              },
              null,
              2
              /* CLASS */
            ),
            e.createTextVNode(
              e.toDisplayString(b.$t("保存并使用")),
              1
              /* TEXT */
            )
          ], 8, Nf),
          s.value.asr.cloud ? (e.openBlock(), e.createElementBlock("button", {
            key: 0,
            type: "button",
            class: "ss-link",
            disabled: d.value,
            "data-test": "mm-asr-cloud-clear",
            onClick: ae
          }, e.toDisplayString(b.$t("清除在线接口")), 9, Vf)) : e.createCommentVNode("v-if", !0)
        ])
      ])) : e.createCommentVNode("v-if", !0),
      m.value ? (e.openBlock(), e.createElementBlock(
        "p",
        Ef,
        e.toDisplayString(m.value),
        1
        /* TEXT */
      )) : e.createCommentVNode("v-if", !0),
      k.value ? (e.openBlock(), e.createElementBlock("p", $f, [
        B[24] || (B[24] = e.createElementVNode(
          "i",
          { class: "ri-error-warning-line" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(k.value),
          1
          /* TEXT */
        )
      ])) : e.createCommentVNode("v-if", !0)
    ]));
  }
}), qt = /* @__PURE__ */ oe(bf, [["__scopeId", "data-v-dadf8cc0"]]), hf = {
  class: "mm-sa",
  "data-test": "mm-ai"
}, _f = { class: "mm-sp__head" }, Bf = {
  key: 0,
  class: "ss-note danger"
}, Sf = { class: "mm-sa__block" }, Df = { class: "ss-muted" }, wf = { class: "mm-sa__block" }, Cf = { class: "mm-sa__range" }, Tf = { class: "ss-muted" }, If = { class: "mm-sa__block" }, Mf = { class: "ss-field" }, Af = ["placeholder"], jf = { class: "ss-field" }, Lf = ["placeholder"], zf = { class: "ss-field" }, Ff = ["placeholder"], Pf = { class: "ss-actions" }, Uf = ["disabled"], Of = /* @__PURE__ */ e.defineComponent({
  __name: "SettingsAi",
  props: {
    settings: {}
  },
  emits: ["saved"],
  setup(l, { emit: u }) {
    const n = l, p = u, f = ie.useNotificationStore(), s = e.ref(!1), o = e.ref(""), d = e.reactive({ voiceprintThreshold: 0.55, planPrompt: "", summaryPrompt: "", organizePrompt: "" });
    function i(c) {
      const g = c.ai ?? { voiceprintThreshold: 0.55 };
      return {
        voiceprintThreshold: Number.isFinite(g.voiceprintThreshold) ? g.voiceprintThreshold : 0.55,
        planPrompt: g.planPrompt ?? "",
        summaryPrompt: g.summaryPrompt ?? "",
        organizePrompt: g.organizePrompt ?? ""
      };
    }
    const k = e.computed(() => JSON.stringify(i(n.settings)) !== JSON.stringify({ ...d, voiceprintThreshold: Number(d.voiceprintThreshold) }));
    function h() {
      Object.assign(d, i(n.settings));
    }
    e.watch(() => n.settings, h, { immediate: !0 });
    async function m() {
      s.value = !0, o.value = "";
      try {
        const c = Math.max(0, Math.min(1, Number(d.voiceprintThreshold) || 0.55)), g = {
          voiceprintThreshold: Math.round(c * 100) / 100,
          // 空串 = 用内置（不用 undefined：JSON 往返会丢字段，主进程深合并时清不掉旧提示词）
          planPrompt: d.planPrompt.trim(),
          summaryPrompt: d.summaryPrompt.trim(),
          organizePrompt: d.organizePrompt.trim()
        }, N = await Y("settings.save", { patch: { ai: g } });
        f.success(t.t("AI 能力配置已保存")), p("saved", N);
      } catch (c) {
        o.value = Z.errorMessage(c);
      } finally {
        s.value = !1;
      }
    }
    return (c, g) => (e.openBlock(), e.createElementBlock("div", hf, [
      e.createElementVNode("header", _f, [
        e.createElementVNode("div", null, [
          e.createElementVNode(
            "h3",
            null,
            e.toDisplayString(c.$t("AI 能力配置")),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "p",
            null,
            e.toDisplayString(c.$t("转写、声纹识别、执行方案和总结报告用到的 AI。文字类 AI 用你在应用里选的模型；模型不可用时都有确定性兜底，流程不会断。报告里的数字由系统计算，模型只写叙述。")),
            1
            /* TEXT */
          )
        ])
      ]),
      o.value ? (e.openBlock(), e.createElementBlock("p", Bf, [
        g[4] || (g[4] = e.createElementVNode(
          "i",
          { class: "ri-error-warning-line" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(o.value),
          1
          /* TEXT */
        )
      ])) : e.createCommentVNode("v-if", !0),
      e.createElementVNode("section", Sf, [
        e.createElementVNode(
          "h4",
          null,
          e.toDisplayString(c.$t("转写")),
          1
          /* TEXT */
        ),
        e.createVNode(qt),
        e.createElementVNode(
          "p",
          Df,
          e.toDisplayString(c.$t("录音和录屏都按停顿切片后逐段转写；文字记录（txt / docx / srt / vtt 等）跳过转写。")),
          1
          /* TEXT */
        )
      ]),
      e.createElementVNode("section", wf, [
        e.createElementVNode(
          "h4",
          null,
          e.toDisplayString(c.$t("声纹识别")),
          1
          /* TEXT */
        ),
        e.createElementVNode("label", Cf, [
          e.createElementVNode(
            "span",
            null,
            e.toDisplayString(c.$t("相似度下限")),
            1
            /* TEXT */
          ),
          e.withDirectives(e.createElementVNode(
            "input",
            {
              "onUpdate:modelValue": g[0] || (g[0] = (N) => d.voiceprintThreshold = N),
              type: "range",
              min: "0.3",
              max: "0.9",
              step: "0.01",
              "data-test": "mm-ai-threshold"
            },
            null,
            512
            /* NEED_PATCH */
          ), [
            [
              e.vModelText,
              d.voiceprintThreshold,
              void 0,
              { number: !0 }
            ]
          ]),
          e.createElementVNode(
            "b",
            null,
            e.toDisplayString(Number(d.voiceprintThreshold).toFixed(2)),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode(
          "p",
          Tf,
          e.toDisplayString(c.$t("只和本场参会人的声纹比对；低于下限的发言人留给主持人试听后指认。调高更严（指认更多），调低更松（可能认错）。默认 0.55。")),
          1
          /* TEXT */
        )
      ]),
      e.createElementVNode("section", If, [
        e.createElementVNode("h4", null, [
          e.createTextVNode(
            e.toDisplayString(c.$t("提示词")) + " ",
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "small",
            null,
            e.toDisplayString(c.$t("留空 = 用内置提示词")),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode("label", Mf, [
          e.createElementVNode(
            "span",
            null,
            e.toDisplayString(c.$t("纪要整理（按议题 / 时间线整理、识别决议、3 行摘要）")),
            1
            /* TEXT */
          ),
          e.withDirectives(e.createElementVNode("textarea", {
            "onUpdate:modelValue": g[1] || (g[1] = (N) => d.organizePrompt = N),
            rows: "4",
            placeholder: c.$t("留空使用内置")
          }, null, 8, Af), [
            [e.vModelText, d.organizePrompt]
          ])
        ]),
        e.createElementVNode("label", jf, [
          e.createElementVNode(
            "span",
            null,
            e.toDisplayString(c.$t("执行方案（从决议拆任务：每项一个责任部门、执行事项、交付标准、建议完成时间）")),
            1
            /* TEXT */
          ),
          e.withDirectives(e.createElementVNode("textarea", {
            "onUpdate:modelValue": g[2] || (g[2] = (N) => d.planPrompt = N),
            rows: "4",
            placeholder: c.$t("留空使用内置")
          }, null, 8, Lf), [
            [e.vModelText, d.planPrompt]
          ])
        ]),
        e.createElementVNode("label", zf, [
          e.createElementVNode(
            "span",
            null,
            e.toDisplayString(c.$t("项目总结（概况、关键决策、任务完成情况、变更与裁决记录）")),
            1
            /* TEXT */
          ),
          e.withDirectives(e.createElementVNode("textarea", {
            "onUpdate:modelValue": g[3] || (g[3] = (N) => d.summaryPrompt = N),
            rows: "4",
            placeholder: c.$t("留空使用内置")
          }, null, 8, Ff), [
            [e.vModelText, d.summaryPrompt]
          ])
        ])
      ]),
      e.createElementVNode("div", Pf, [
        e.createElementVNode("button", {
          type: "button",
          class: "ss-btn primary",
          disabled: s.value || !k.value,
          "data-test": "mm-ai-save",
          onClick: m
        }, [
          e.createElementVNode(
            "i",
            {
              class: e.normalizeClass(s.value ? "ri-loader-4-line spin" : "ri-save-line")
            },
            null,
            2
            /* CLASS */
          ),
          e.createTextVNode(
            e.toDisplayString(c.$t("保存")),
            1
            /* TEXT */
          )
        ], 8, Uf),
        k.value ? (e.openBlock(), e.createElementBlock(
          "button",
          {
            key: 0,
            type: "button",
            class: "ss-link",
            onClick: h
          },
          e.toDisplayString(c.$t("撤销修改")),
          1
          /* TEXT */
        )) : e.createCommentVNode("v-if", !0)
      ])
    ]));
  }
}), Rf = /* @__PURE__ */ oe(Of, [["__scopeId", "data-v-4bd27b96"]]), qf = {
  class: "mm-pf",
  "data-test": "mm-push-failed"
}, Kf = { class: "mm-pf__head" }, Hf = ["disabled", "title"], Wf = { class: "ss-muted" }, Gf = {
  key: 1,
  class: "ss-note danger"
}, Yf = {
  key: 2,
  class: "mm-pf__empty"
}, Jf = {
  key: 3,
  class: "ss-table-wrap"
}, Qf = { class: "ss-table" }, Zf = { class: "num" }, Xf = ["data-test"], xf = { class: "nowrap" }, e1 = { class: "nowrap" }, t1 = { class: "mm-pf__err" }, l1 = { class: "num" }, n1 = ["disabled", "data-test", "onClick"], o1 = {
  key: 4,
  class: "ss-muted"
}, a1 = /* @__PURE__ */ e.defineComponent({
  __name: "PushFailedList",
  setup(l) {
    const u = e.ref([]), n = e.ref(0), p = e.ref(!1), f = e.ref(""), s = e.ref(""), o = e.ref(null), d = e.computed(() => !!ne.value?.pushChannel || !!ne.value?.wecomConnected);
    async function i() {
      try {
        const m = await Y("notice.push.failed");
        u.value = m?.items ?? [], n.value = m?.total ?? 0, s.value = "";
      } catch (m) {
        s.value = Z.errorMessage(m);
      } finally {
        p.value = !0;
      }
    }
    async function k(m) {
      f.value = m || "all", s.value = "", o.value = null;
      try {
        o.value = await Y("notice.push.retry", m ? { ids: [m] } : { all: !0 }), await Promise.all([i(), ce().catch(() => null)]);
      } catch (c) {
        s.value = Z.errorMessage(c);
      } finally {
        f.value = "";
      }
    }
    let h = null;
    return e.onMounted(() => {
      i(), h = Se((m) => {
        m.type === "changed" && m.scope === "notice" && !f.value && i();
      });
    }), e.onBeforeUnmount(() => h?.()), (m, c) => (e.openBlock(), e.createElementBlock("section", qf, [
      e.createElementVNode("div", Kf, [
        e.createElementVNode("h4", null, [
          e.createTextVNode(
            e.toDisplayString(m.$t("推送失败记录")) + " ",
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "small",
            null,
            e.toDisplayString(m.$t("{n} 条", { n: n.value })),
            1
            /* TEXT */
          )
        ]),
        c[1] || (c[1] = e.createElementVNode(
          "span",
          { class: "mm-grow" },
          null,
          -1
          /* CACHED */
        )),
        n.value ? (e.openBlock(), e.createElementBlock("button", {
          key: 0,
          type: "button",
          class: "ss-btn sm primary",
          disabled: !!f.value || !d.value,
          title: d.value ? "" : m.$t("先配置并连接企业微信"),
          "data-test": "mm-push-retry-all",
          onClick: c[0] || (c[0] = (g) => k())
        }, [
          e.createElementVNode(
            "i",
            {
              class: e.normalizeClass(f.value === "all" ? "ri-loader-4-line spin" : "ri-send-plane-line")
            },
            null,
            2
            /* CLASS */
          ),
          e.createTextVNode(
            e.toDisplayString(m.$t("全部重发")),
            1
            /* TEXT */
          )
        ], 8, Hf)) : e.createCommentVNode("v-if", !0)
      ]),
      e.createElementVNode(
        "p",
        Wf,
        e.toDisplayString(m.$t("企微卡片没发出去的通知（系统内消息中心照常有）。常见原因：手机页服务没开、接收人不在企微应用可见范围。处理好原因后再重发。")),
        1
        /* TEXT */
      ),
      o.value ? (e.openBlock(), e.createElementBlock(
        "p",
        {
          key: 0,
          class: e.normalizeClass(["ss-note", o.value.failed ? "danger" : "ok"]),
          "data-test": "mm-push-result"
        },
        [
          e.createElementVNode(
            "i",
            {
              class: e.normalizeClass(o.value.failed ? "ri-error-warning-line" : "ri-checkbox-circle-line")
            },
            null,
            2
            /* CLASS */
          ),
          e.createTextVNode(
            e.toDisplayString(m.$t("重发成功 {a} 条，仍失败 {b} 条", { a: o.value.sent, b: o.value.failed })),
            1
            /* TEXT */
          )
        ],
        2
        /* CLASS */
      )) : e.createCommentVNode("v-if", !0),
      s.value ? (e.openBlock(), e.createElementBlock("p", Gf, [
        c[2] || (c[2] = e.createElementVNode(
          "i",
          { class: "ri-error-warning-line" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(s.value),
          1
          /* TEXT */
        )
      ])) : e.createCommentVNode("v-if", !0),
      !u.value.length && p.value ? (e.openBlock(), e.createElementBlock(
        "p",
        Yf,
        e.toDisplayString(m.$t("没有发送失败的通知")),
        1
        /* TEXT */
      )) : u.value.length ? (e.openBlock(), e.createElementBlock("div", Jf, [
        e.createElementVNode("table", Qf, [
          e.createElementVNode("thead", null, [
            e.createElementVNode("tr", null, [
              e.createElementVNode(
                "th",
                null,
                e.toDisplayString(m.$t("时间")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "th",
                null,
                e.toDisplayString(m.$t("接收人")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "th",
                null,
                e.toDisplayString(m.$t("通知")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "th",
                null,
                e.toDisplayString(m.$t("失败原因")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "th",
                Zf,
                e.toDisplayString(m.$t("操作")),
                1
                /* TEXT */
              )
            ])
          ]),
          e.createElementVNode("tbody", null, [
            (e.openBlock(!0), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(u.value, (g) => (e.openBlock(), e.createElementBlock("tr", {
                key: g.id,
                "data-test": `mm-push-row-${g.id}`
              }, [
                e.createElementVNode(
                  "td",
                  xf,
                  e.toDisplayString(e.unref(Ee)(g.at)),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "td",
                  e1,
                  e.toDisplayString(g.toName),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "td",
                  null,
                  e.toDisplayString(g.title),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "td",
                  t1,
                  e.toDisplayString(g.error),
                  1
                  /* TEXT */
                ),
                e.createElementVNode("td", l1, [
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-link",
                    disabled: !!f.value || !d.value,
                    "data-test": `mm-push-retry-${g.id}`,
                    onClick: (N) => k(g.id)
                  }, e.toDisplayString(f.value === g.id ? m.$t("发送中…") : m.$t("重发")), 9, n1)
                ])
              ], 8, Xf))),
              128
              /* KEYED_FRAGMENT */
            ))
          ])
        ])
      ])) : e.createCommentVNode("v-if", !0),
      n.value > u.value.length ? (e.openBlock(), e.createElementBlock(
        "small",
        o1,
        e.toDisplayString(m.$t("只列出最近 {n} 条", { n: u.value.length })),
        1
        /* TEXT */
      )) : e.createCommentVNode("v-if", !0)
    ]));
  }
}), s1 = /* @__PURE__ */ oe(a1, [["__scopeId", "data-v-f0a4a0e3"]]), r1 = {
  class: "mm-sw",
  "data-test": "mm-wecom"
}, i1 = { class: "mm-sp__head" }, c1 = {
  key: 0,
  class: "ss-note danger"
}, d1 = { class: "mm-sw__form" }, m1 = { class: "ss-grid" }, u1 = { class: "ss-field" }, p1 = { class: "ss-field" }, v1 = { class: "ss-field" }, k1 = {
  key: 0,
  class: "mm-sw__set"
}, y1 = { class: "mm-sw__secret" }, g1 = ["type", "placeholder"], f1 = ["title", "disabled"], N1 = { class: "ss-field" }, V1 = ["placeholder"], E1 = { class: "ss-muted" }, $1 = { class: "ss-actions" }, b1 = ["disabled"], h1 = ["disabled"], _1 = {
  class: "mm-sw__form",
  "data-test": "mm-webhook"
}, B1 = { class: "mm-sw__h" }, S1 = { class: "mm-sw__steps" }, D1 = { class: "ss-field" }, w1 = {
  key: 0,
  class: "mm-sw__set",
  "data-test": "mm-webhook-set"
}, C1 = ["placeholder"], T1 = { class: "ss-muted" }, I1 = { class: "ss-actions" }, M1 = ["disabled"], A1 = ["disabled"], j1 = ["disabled"], L1 = { class: "mm-sw__events" }, z1 = { class: "ss-table-wrap" }, F1 = { class: "ss-table" }, P1 = { class: "num" }, U1 = { class: "wrap" }, O1 = { class: "wrap" }, R1 = { class: "ss-muted" }, q1 = /* @__PURE__ */ e.defineComponent({
  __name: "SettingsWecom",
  props: {
    settings: {}
  },
  emits: ["saved"],
  setup(l, { emit: u }) {
    const n = l, p = u, f = t.t("标题 + 摘要 + 按钮"), s = [
      { event: t.t("发言待确认 / 未确认催办"), to: t.t("发言人"), card: f },
      { event: t.t("纪要待终审"), to: t.t("主持人"), card: f },
      { event: t.t("正式纪要已生成"), to: t.t("参会人"), card: t.t("会议主题 + 3 行摘要") },
      { event: t.t("执行方案待确认"), to: t.t("任务负责人"), card: t.t("任务名 + 截止") },
      { event: t.t("新任务待接收"), to: t.t("部门负责人"), card: t.t("任务名 + 截止") },
      { event: t.t("进度更新 / 到期 / 逾期提醒"), to: t.t("部门负责人（逾期同时通知任务负责人）"), card: f },
      { event: t.t("任务进度有更新 / 任务已完成"), to: t.t("任务负责人（可多位，每位都发）"), card: t.t("任务名 + 进度 / 说明") },
      { event: t.t("异议待复核"), to: t.t("任务负责人"), card: f },
      { event: t.t("调整后方案待确认"), to: t.t("部门负责人"), card: t.t("任务名 + 截止") },
      { event: t.t("待裁决"), to: t.t("项目负责人"), card: f },
      { event: t.t("裁决结果"), to: t.t("任务负责人、部门负责人"), card: f },
      { event: t.t("进度汇总报告"), to: t.t("任务负责人、项目负责人"), card: t.t("完成率 + 逾期数") },
      { event: t.t("总结报告待审核"), to: t.t("项目负责人"), card: f },
      { event: t.t("项目已归档"), to: t.t("项目成员"), card: t.t("项目已归档") }
    ], o = $e.useDialog(), d = ie.useNotificationStore(), i = e.ref(!1), k = e.ref(""), h = e.ref(""), m = e.ref(null), c = e.reactive({ corpId: "", agentId: "", secret: "", cardBaseUrl: "" }), g = e.computed(() => !!ne.value?.wecomConnected), N = e.computed(() => ne.value?.pushChannel ?? (g.value ? "app" : null)), a = e.ref(""), I = e.ref(!1);
    async function P() {
      if (!I.value && !c.secret && n.settings.wecom.hasSecret)
        try {
          const S = await Y("wecom.secret.reveal");
          c.secret = S?.secret || "";
        } catch (S) {
          h.value = Z.errorMessage(S);
          return;
        }
      I.value = !I.value;
    }
    const U = e.ref(null), M = e.computed(() => !c.corpId.trim() && !c.agentId.trim()), C = e.computed(() => M.value ? !!(n.settings.wecom.corpId || n.settings.wecom.agentId || n.settings.wecom.hasSecret) : !!c.corpId.trim() && !!c.agentId.trim() && (n.settings.wecom.hasSecret || !!c.secret));
    e.watch(() => n.settings.wecom, (S) => {
      Object.assign(c, { corpId: S?.corpId ?? "", agentId: S?.agentId ?? "", secret: c.secret, cardBaseUrl: S?.cardBaseUrl ?? "" });
    }, { immediate: !0 });
    async function T() {
      if (!(M.value && !await o.confirm({
        title: t.t("断开企微"),
        message: t.t("清空企微配置后，通讯录不再从企微同步，通知只进系统内消息中心。确定吗？"),
        danger: !0
      }))) {
        i.value = !0, k.value = "save", h.value = "", m.value = null;
        try {
          const S = { corpId: c.corpId.trim(), agentId: c.agentId.trim(), cardBaseUrl: c.cardBaseUrl.trim() };
          c.secret && (S.secret = c.secret), await Y("wecom.save", S), M.value && (c.secret = "", I.value = !1), d.success(M.value ? t.t("已断开企微") : t.t("企微配置已保存")), p("saved"), await ce().catch(() => null);
        } catch (S) {
          h.value = Z.errorMessage(S);
        } finally {
          i.value = !1, k.value = "";
        }
      }
    }
    async function z(S, j) {
      i.value = !0, k.value = S, h.value = "", U.value = null;
      try {
        await j();
      } catch (J) {
        U.value = { ok: !1, error: Z.errorMessage(J) };
      } finally {
        i.value = !1, k.value = "";
      }
    }
    function R() {
      return z("hook", async () => {
        await Y("wecom.webhook.save", { url: a.value.trim() }), a.value = "", d.success(t.t("群机器人已保存")), p("saved"), await ce().catch(() => null);
      });
    }
    function _() {
      return z("hookTest", async () => {
        const S = await Y("wecom.webhook.test");
        U.value = { ok: !!S?.ok, error: S?.error };
      });
    }
    async function E() {
      await o.confirm({ title: t.t("移除群机器人"), message: t.t("移除后通知不再发到企微群（自建应用照常）。确定吗？"), danger: !0 }) && await z("hook", async () => {
        await Y("wecom.webhook.save", { url: "" }), d.success(t.t("已移除群机器人")), p("saved"), await ce().catch(() => null);
      });
    }
    async function v() {
      i.value = !0, k.value = "test", h.value = "", m.value = null;
      try {
        const S = await Y("wecom.test");
        m.value = { ok: !!S?.ok, error: S?.error }, await ce().catch(() => null);
      } catch (S) {
        m.value = { ok: !1, error: Z.errorMessage(S) };
      } finally {
        i.value = !1, k.value = "";
      }
    }
    return (S, j) => (e.openBlock(), e.createElementBlock("div", r1, [
      e.createElementVNode("header", i1, [
        e.createElementVNode("div", null, [
          e.createElementVNode(
            "h3",
            null,
            e.toDisplayString(S.$t("消息推送")),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "p",
            null,
            e.toDisplayString(S.$t("配置企业微信自建应用后，通讯录真实同步、14 类通知以卡片推到企微；没配置时用演示组织，通知只进系统内消息中心。卡片只放标题、摘要和按钮，长文在系统内看。")),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "p",
            null,
            e.toDisplayString(S.$t("配不了自建应用（要 CorpID、Secret 和企业可信 IP）时，可以只配一个「企微群机器人」：通知发到一个企微群里并点名提醒相关的人，见下方。")),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode(
          "span",
          {
            class: e.normalizeClass(["ss-chip", N.value ? "ok" : "warn"]),
            "data-test": "mm-wecom-state"
          },
          e.toDisplayString(N.value === "app" ? S.$t("企微已连接") : N.value === "webhook" ? S.$t("群机器人已连接") : S.$t("未连接企微")),
          3
          /* TEXT, CLASS */
        )
      ]),
      h.value ? (e.openBlock(), e.createElementBlock("p", c1, [
        j[8] || (j[8] = e.createElementVNode(
          "i",
          { class: "ri-error-warning-line" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(h.value),
          1
          /* TEXT */
        )
      ])) : e.createCommentVNode("v-if", !0),
      m.value ? (e.openBlock(), e.createElementBlock(
        "p",
        {
          key: 1,
          class: e.normalizeClass(["ss-note", m.value.ok ? "ok" : "danger"]),
          "data-test": "mm-wecom-test-result"
        },
        [
          e.createElementVNode(
            "i",
            {
              class: e.normalizeClass(m.value.ok ? "ri-checkbox-circle-line" : "ri-error-warning-line")
            },
            null,
            2
            /* CLASS */
          ),
          e.createTextVNode(
            e.toDisplayString(m.value.ok ? S.$t("连接正常") : m.value.error || S.$t("连接失败")),
            1
            /* TEXT */
          )
        ],
        2
        /* CLASS */
      )) : e.createCommentVNode("v-if", !0),
      e.createElementVNode("section", d1, [
        e.createElementVNode("div", m1, [
          e.createElementVNode("label", u1, [
            j[9] || (j[9] = e.createElementVNode(
              "span",
              null,
              "CorpID",
              -1
              /* CACHED */
            )),
            e.withDirectives(e.createElementVNode(
              "input",
              {
                "onUpdate:modelValue": j[0] || (j[0] = (J) => c.corpId = J),
                type: "text",
                autocomplete: "off",
                spellcheck: "false",
                "data-test": "mm-wecom-corp"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [e.vModelText, c.corpId]
            ])
          ]),
          e.createElementVNode("label", p1, [
            j[10] || (j[10] = e.createElementVNode(
              "span",
              null,
              "AgentID",
              -1
              /* CACHED */
            )),
            e.withDirectives(e.createElementVNode(
              "input",
              {
                "onUpdate:modelValue": j[1] || (j[1] = (J) => c.agentId = J),
                type: "text",
                autocomplete: "off",
                spellcheck: "false",
                "data-test": "mm-wecom-agent"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [e.vModelText, c.agentId]
            ])
          ]),
          e.createElementVNode("label", v1, [
            e.createElementVNode("span", null, [
              j[11] || (j[11] = e.createTextVNode(
                "Secret ",
                -1
                /* CACHED */
              )),
              l.settings.wecom.hasSecret ? (e.openBlock(), e.createElementBlock(
                "em",
                k1,
                e.toDisplayString(S.$t("已配置")),
                1
                /* TEXT */
              )) : e.createCommentVNode("v-if", !0)
            ]),
            e.createElementVNode("span", y1, [
              e.withDirectives(e.createElementVNode("input", {
                "onUpdate:modelValue": j[2] || (j[2] = (J) => c.secret = J),
                type: I.value ? "text" : "password",
                autocomplete: "new-password",
                spellcheck: "false",
                placeholder: l.settings.wecom.hasSecret ? S.$t("已保存，点右边的眼睛查看") : S.$t("应用的 Secret"),
                "data-test": "mm-wecom-secret"
              }, null, 8, g1), [
                [e.vModelDynamic, c.secret]
              ]),
              e.createElementVNode("button", {
                type: "button",
                class: "mm-sw__eye",
                title: I.value ? S.$t("隐藏") : S.$t("查看"),
                disabled: i.value,
                "data-test": "mm-wecom-secret-eye",
                onClick: P
              }, [
                e.createElementVNode(
                  "i",
                  {
                    class: e.normalizeClass(I.value ? "ri-eye-off-line" : "ri-eye-line")
                  },
                  null,
                  2
                  /* CLASS */
                )
              ], 8, f1)
            ])
          ])
        ]),
        e.createElementVNode("label", N1, [
          e.createElementVNode(
            "span",
            null,
            e.toDisplayString(S.$t("卡片跳转地址前缀")),
            1
            /* TEXT */
          ),
          e.withDirectives(e.createElementVNode("input", {
            "onUpdate:modelValue": j[3] || (j[3] = (J) => c.cardBaseUrl = J),
            type: "url",
            placeholder: S.$t("留空 = 用手机页服务的局域网地址，如 http://192.168.1.10:8260"),
            spellcheck: "false",
            "data-test": "mm-wecom-base"
          }, null, 8, V1), [
            [e.vModelText, c.cardBaseUrl]
          ])
        ]),
        e.createElementVNode(
          "p",
          E1,
          e.toDisplayString(S.$t("Secret 只保存在本机（系统加密存储），不会显示出来。卡片按钮会跳到「前缀 + 每人专属链接」，员工手机要能访问这个地址（同一局域网或可信域名）。CorpID 和 AgentID 都清空后保存 = 断开企微。")),
          1
          /* TEXT */
        ),
        e.createElementVNode("div", $1, [
          e.createElementVNode("button", {
            type: "button",
            class: "ss-btn primary",
            disabled: i.value || !C.value,
            "data-test": "mm-wecom-save",
            onClick: T
          }, [
            e.createElementVNode(
              "i",
              {
                class: e.normalizeClass(i.value && k.value === "save" ? "ri-loader-4-line spin" : "ri-save-line")
              },
              null,
              2
              /* CLASS */
            ),
            e.createTextVNode(
              e.toDisplayString(S.$t("保存")),
              1
              /* TEXT */
            )
          ], 8, b1),
          e.createElementVNode("button", {
            type: "button",
            class: "ss-btn",
            disabled: i.value || !l.settings.wecom.hasSecret && !g.value,
            "data-test": "mm-wecom-test",
            onClick: v
          }, [
            e.createElementVNode(
              "i",
              {
                class: e.normalizeClass(i.value && k.value === "test" ? "ri-loader-4-line spin" : "ri-plug-line")
              },
              null,
              2
              /* CLASS */
            ),
            e.createTextVNode(
              e.toDisplayString(S.$t("测试连接")),
              1
              /* TEXT */
            )
          ], 8, h1),
          e.createElementVNode("button", {
            type: "button",
            class: "ss-link",
            "data-test": "mm-wecom-link-profile",
            onClick: j[4] || (j[4] = (J) => e.unref(pe)(e.unref(ge).profile))
          }, [
            e.createTextVNode(
              e.toDisplayString(S.$t("打开企微·我的企业")) + " ",
              1
              /* TEXT */
            ),
            j[12] || (j[12] = e.createElementVNode(
              "i",
              { class: "ri-external-link-line" },
              null,
              -1
              /* CACHED */
            ))
          ]),
          e.createElementVNode("button", {
            type: "button",
            class: "ss-link",
            "data-test": "mm-wecom-link-apps",
            onClick: j[5] || (j[5] = (J) => e.unref(pe)(e.unref(ge).apps))
          }, [
            e.createTextVNode(
              e.toDisplayString(S.$t("打开企微·应用管理")) + " ",
              1
              /* TEXT */
            ),
            j[13] || (j[13] = e.createElementVNode(
              "i",
              { class: "ri-external-link-line" },
              null,
              -1
              /* CACHED */
            ))
          ])
        ])
      ]),
      e.createElementVNode("section", _1, [
        e.createElementVNode("h4", B1, [
          e.createTextVNode(
            e.toDisplayString(S.$t("企微群机器人")) + " ",
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "small",
            null,
            e.toDisplayString(S.$t("没有自建应用时用：通知发到一个企微群里，并点名提醒要处理的人")),
            1
            /* TEXT */
          ),
          j[15] || (j[15] = e.createTextVNode()),
          e.createElementVNode("button", {
            type: "button",
            class: "ss-link",
            "data-test": "mm-wecom-link-webhook-doc",
            onClick: j[6] || (j[6] = (J) => e.unref(pe)(e.unref(ge).webhookDoc))
          }, [
            e.createTextVNode(
              e.toDisplayString(S.$t("查看企微官方说明")) + " ",
              1
              /* TEXT */
            ),
            j[14] || (j[14] = e.createElementVNode(
              "i",
              { class: "ri-external-link-line" },
              null,
              -1
              /* CACHED */
            ))
          ])
        ]),
        e.createElementVNode("ol", S1, [
          e.createElementVNode(
            "li",
            null,
            e.toDisplayString(S.$t("在企业微信里打开要接收通知的内部群，点右上角「…」")),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "li",
            null,
            e.toDisplayString(S.$t("选「消息推送」（旧版叫「群机器人」）→「添加」→ 新建一个，名字可以叫「会议助手」")),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "li",
            null,
            e.toDisplayString(S.$t("复制生成的 Webhook 地址，粘贴到下面保存，再点「测试发送」看群里有没有收到")),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode("label", D1, [
          e.createElementVNode("span", null, [
            e.createTextVNode(
              e.toDisplayString(S.$t("Webhook 地址")) + " ",
              1
              /* TEXT */
            ),
            l.settings.wecom.hasWebhook ? (e.openBlock(), e.createElementBlock(
              "em",
              w1,
              e.toDisplayString(S.$t("已配置")) + " " + e.toDisplayString(l.settings.wecom.webhookMasked),
              1
              /* TEXT */
            )) : e.createCommentVNode("v-if", !0)
          ]),
          e.withDirectives(e.createElementVNode("input", {
            "onUpdate:modelValue": j[7] || (j[7] = (J) => a.value = J),
            type: "password",
            autocomplete: "off",
            spellcheck: "false",
            placeholder: l.settings.wecom.hasWebhook ? S.$t("已配置，要换地址再粘贴") : "https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=…",
            "data-test": "mm-webhook-url"
          }, null, 8, C1), [
            [e.vModelText, a.value]
          ])
        ]),
        e.createElementVNode(
          "p",
          T1,
          e.toDisplayString(S.$t("地址里的 key 等于发消息的凭据，只保存在本机（系统加密存储），不会显示出来。配了自建应用时通知发给个人，群机器人不再发。群消息里的按钮不带个人令牌：手机上打开过自己专属链接的人点了能直接进入。每个机器人每分钟最多发 20 条，同一事件的几个人合成一条。")),
          1
          /* TEXT */
        ),
        U.value ? (e.openBlock(), e.createElementBlock(
          "p",
          {
            key: 0,
            class: e.normalizeClass(["ss-note", U.value.ok ? "ok" : "danger"]),
            "data-test": "mm-webhook-result"
          },
          [
            e.createElementVNode(
              "i",
              {
                class: e.normalizeClass(U.value.ok ? "ri-checkbox-circle-line" : "ri-error-warning-line")
              },
              null,
              2
              /* CLASS */
            ),
            e.createTextVNode(
              e.toDisplayString(U.value.ok ? S.$t("已发到群里，请到企微群里看一眼") : U.value.error || S.$t("发送失败")),
              1
              /* TEXT */
            )
          ],
          2
          /* CLASS */
        )) : e.createCommentVNode("v-if", !0),
        e.createElementVNode("div", I1, [
          e.createElementVNode("button", {
            type: "button",
            class: "ss-btn primary",
            disabled: i.value || !a.value.trim(),
            "data-test": "mm-webhook-save",
            onClick: R
          }, [
            e.createElementVNode(
              "i",
              {
                class: e.normalizeClass(i.value && k.value === "hook" ? "ri-loader-4-line spin" : "ri-save-line")
              },
              null,
              2
              /* CLASS */
            ),
            e.createTextVNode(
              e.toDisplayString(S.$t("保存")),
              1
              /* TEXT */
            )
          ], 8, M1),
          e.createElementVNode("button", {
            type: "button",
            class: "ss-btn",
            disabled: i.value || !l.settings.wecom.hasWebhook,
            "data-test": "mm-webhook-test",
            onClick: _
          }, [
            e.createElementVNode(
              "i",
              {
                class: e.normalizeClass(i.value && k.value === "hookTest" ? "ri-loader-4-line spin" : "ri-send-plane-line")
              },
              null,
              2
              /* CLASS */
            ),
            e.createTextVNode(
              e.toDisplayString(S.$t("测试发送")),
              1
              /* TEXT */
            )
          ], 8, A1),
          l.settings.wecom.hasWebhook ? (e.openBlock(), e.createElementBlock("button", {
            key: 0,
            type: "button",
            class: "ss-btn",
            disabled: i.value,
            "data-test": "mm-webhook-remove",
            onClick: E
          }, [
            j[16] || (j[16] = e.createElementVNode(
              "i",
              { class: "ri-delete-bin-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(S.$t("移除")),
              1
              /* TEXT */
            )
          ], 8, j1)) : e.createCommentVNode("v-if", !0)
        ])
      ]),
      e.createVNode(s1),
      e.createElementVNode("section", L1, [
        e.createElementVNode("h4", null, [
          e.createTextVNode(
            e.toDisplayString(S.$t("14 类通知")) + " ",
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "small",
            null,
            e.toDisplayString(S.$t("只发提醒，不改任何状态")),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode("div", z1, [
          e.createElementVNode("table", F1, [
            e.createElementVNode("thead", null, [
              e.createElementVNode("tr", null, [
                j[17] || (j[17] = e.createElementVNode(
                  "th",
                  null,
                  "#",
                  -1
                  /* CACHED */
                )),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(S.$t("事件")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(S.$t("接收人")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(S.$t("卡片内容")),
                  1
                  /* TEXT */
                )
              ])
            ]),
            e.createElementVNode("tbody", null, [
              (e.openBlock(), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(s, (J, y) => e.createElementVNode("tr", { key: y }, [
                  e.createElementVNode(
                    "td",
                    P1,
                    e.toDisplayString(y + 1),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "td",
                    null,
                    e.toDisplayString(J.event),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "td",
                    U1,
                    e.toDisplayString(J.to),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "td",
                    O1,
                    e.toDisplayString(J.card),
                    1
                    /* TEXT */
                  )
                ])),
                64
                /* STABLE_FRAGMENT */
              ))
            ])
          ])
        ]),
        e.createElementVNode(
          "p",
          R1,
          e.toDisplayString(S.$t("提醒周期（发言确认超时、到期提前、进度跟踪、周报）在「参数设置」里改。")),
          1
          /* TEXT */
        )
      ])
    ]));
  }
}), K1 = /* @__PURE__ */ oe(q1, [["__scopeId", "data-v-c940056b"]]), H1 = {
  adminIds: [],
  projectCreatorIds: [],
  confirmTimeoutHours: 24,
  dueRemindDays: 1,
  trackCycleDays: 7,
  reportCycleDays: 7,
  wecom: { corpId: "", agentId: "", hasSecret: !1 },
  // 声纹认人门槛：2026-11-16 用真实 67 分钟会议录音实测，同一会议室不同人之间余弦最高 0.53、本人 0.67~0.77，取 0.55
  ai: { asr: "local", voiceprintThreshold: 0.55 }
}, W1 = {
  class: "mm-spa",
  "data-test": "mm-params"
}, G1 = { class: "mm-sp__head" }, Y1 = {
  key: 0,
  class: "ss-note danger"
}, J1 = { class: "mm-spa__list" }, Q1 = { class: "mm-spa__num" }, Z1 = ["onUpdate:modelValue", "min", "max", "aria-label", "data-test"], X1 = {
  key: 1,
  class: "ss-note warn"
}, x1 = { class: "ss-actions" }, eN = ["disabled"], tN = /* @__PURE__ */ e.defineComponent({
  __name: "SettingsParams",
  props: {
    settings: {}
  },
  emits: ["saved"],
  setup(l, { emit: u }) {
    const n = [
      { key: "confirmTimeoutHours", title: t.t("发言确认超时"), hint: t.t("发言人超过这么久没确认，就催办一次（不改状态）"), unit: t.t("小时"), min: 1, max: 720 },
      { key: "dueRemindDays", title: t.t("到期提前提醒"), hint: t.t("任务截止前几天提醒部门负责人"), unit: t.t("天"), min: 0, max: 30 },
      { key: "trackCycleDays", title: t.t("进度跟踪周期"), hint: t.t("多久提醒部门负责人更新一次进度"), unit: t.t("天"), min: 1, max: 90 },
      { key: "reportCycleDays", title: t.t("周报周期"), hint: t.t("多久给任务负责人和项目负责人发一份进度汇总报告"), unit: t.t("天"), min: 1, max: 90 }
    ], p = l, f = u, s = ie.useNotificationStore(), o = e.ref(!1), d = e.ref(""), i = e.reactive({ confirmTimeoutHours: 24, dueRemindDays: 1, trackCycleDays: 7, reportCycleDays: 7 }), k = e.computed(() => n.some((N) => Number(i[N.key]) !== p.settings[N.key])), h = e.computed(() => {
      for (const N of n) {
        const a = Number(i[N.key]);
        if (!Number.isInteger(a) || a < N.min || a > N.max) return t.t("「{t}」要填 {a}～{b} 之间的整数", { t: N.title, a: N.min, b: N.max });
      }
      return "";
    });
    function m() {
      for (const N of n) i[N.key] = p.settings[N.key];
    }
    function c() {
      for (const N of n) i[N.key] = H1[N.key];
    }
    e.watch(() => p.settings, m, { immediate: !0 });
    async function g() {
      o.value = !0, d.value = "";
      try {
        const N = Object.fromEntries(n.map((I) => [I.key, Number(i[I.key])])), a = await Y("settings.save", { patch: N });
        s.success(t.t("参数已保存")), f("saved", a);
      } catch (N) {
        d.value = Z.errorMessage(N);
      } finally {
        o.value = !1;
      }
    }
    return (N, a) => (e.openBlock(), e.createElementBlock("div", W1, [
      e.createElementVNode("header", G1, [
        e.createElementVNode("div", null, [
          e.createElementVNode(
            "h3",
            null,
            e.toDisplayString(N.$t("参数设置")),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "p",
            null,
            e.toDisplayString(N.$t("催办与提醒周期。提醒只推消息，不改任何状态；逾期是任务上的标记，不是状态。")),
            1
            /* TEXT */
          )
        ])
      ]),
      d.value ? (e.openBlock(), e.createElementBlock("p", Y1, [
        a[0] || (a[0] = e.createElementVNode(
          "i",
          { class: "ri-error-warning-line" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(d.value),
          1
          /* TEXT */
        )
      ])) : e.createCommentVNode("v-if", !0),
      e.createElementVNode("ul", J1, [
        (e.openBlock(), e.createElementBlock(
          e.Fragment,
          null,
          e.renderList(n, (I) => e.createElementVNode("li", {
            key: I.key
          }, [
            e.createElementVNode("div", null, [
              e.createElementVNode(
                "strong",
                null,
                e.toDisplayString(I.title),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "small",
                null,
                e.toDisplayString(I.hint),
                1
                /* TEXT */
              )
            ]),
            e.createElementVNode("label", Q1, [
              e.withDirectives(e.createElementVNode("input", {
                "onUpdate:modelValue": (P) => i[I.key] = P,
                type: "number",
                min: I.min,
                max: I.max,
                step: "1",
                "aria-label": I.title,
                "data-test": `mm-param-${I.key}`
              }, null, 8, Z1), [
                [
                  e.vModelText,
                  i[I.key],
                  void 0,
                  { number: !0 }
                ]
              ]),
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(I.unit),
                1
                /* TEXT */
              )
            ])
          ])),
          64
          /* STABLE_FRAGMENT */
        ))
      ]),
      h.value ? (e.openBlock(), e.createElementBlock("p", X1, [
        a[1] || (a[1] = e.createElementVNode(
          "i",
          { class: "ri-alert-line" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(h.value),
          1
          /* TEXT */
        )
      ])) : e.createCommentVNode("v-if", !0),
      e.createElementVNode("div", x1, [
        e.createElementVNode("button", {
          type: "button",
          class: "ss-btn primary",
          disabled: o.value || !k.value || !!h.value,
          "data-test": "mm-params-save",
          onClick: g
        }, [
          e.createElementVNode(
            "i",
            {
              class: e.normalizeClass(o.value ? "ri-loader-4-line spin" : "ri-save-line")
            },
            null,
            2
            /* CLASS */
          ),
          e.createTextVNode(
            e.toDisplayString(N.$t("保存")),
            1
            /* TEXT */
          )
        ], 8, eN),
        k.value ? (e.openBlock(), e.createElementBlock(
          "button",
          {
            key: 0,
            type: "button",
            class: "ss-link",
            onClick: m
          },
          e.toDisplayString(N.$t("撤销修改")),
          1
          /* TEXT */
        )) : e.createCommentVNode("v-if", !0),
        e.createElementVNode(
          "button",
          {
            type: "button",
            class: "ss-link",
            onClick: c
          },
          e.toDisplayString(N.$t("恢复默认")),
          1
          /* TEXT */
        )
      ])
    ]));
  }
}), lN = /* @__PURE__ */ oe(tN, [["__scopeId", "data-v-ae3507ae"]]), nN = {
  class: "mm-sm",
  "data-test": "mm-mobile-settings"
}, oN = { class: "mm-sp__head" }, aN = {
  key: 0,
  class: "ss-note danger"
}, sN = { class: "mm-sm__svc" }, rN = { class: "mm-sm__addr" }, iN = {
  key: 0,
  class: "mono"
}, cN = {
  key: 1,
  class: "muted"
}, dN = { class: "ss-muted" }, mN = { class: "mm-sm__tools" }, uN = { class: "mm-sm__qr" }, pN = { class: "mm-search" }, vN = ["placeholder", "aria-label"], kN = { class: "ss-table-wrap" }, yN = { class: "ss-table" }, gN = { class: "num" }, fN = { key: 0 }, NN = {
  colspan: "4",
  class: "mm-sm__empty"
}, VN = { class: "mm-sm__link" }, EN = { class: "mono" }, $N = ["src", "alt"], bN = {
  key: 1,
  class: "ss-muted"
}, hN = { class: "num" }, _N = ["disabled", "title", "data-test", "onClick"], BN = ["disabled", "data-test", "onClick"], SN = { class: "mm-sm__foot" }, DN = ["aria-label"], wN = ["disabled", "aria-label"], CN = ["onClick"], TN = ["disabled", "aria-label"], IN = /* @__PURE__ */ e.defineComponent({
  __name: "SettingsMobile",
  props: {
    people: {},
    depts: {}
  },
  setup(l) {
    const u = l, n = $e.useDialog(), p = ie.useNotificationStore(), f = e.ref({ running: !!ne.value?.mobile.running, url: ne.value?.mobile.url }), s = e.ref(""), o = e.ref(""), d = e.ref(""), i = e.ref(1), k = e.ref(!1), h = e.reactive({}), m = e.reactive({}), c = (C) => u.depts.find((T) => T.id === C)?.name || "", g = e.computed(() => u.people.filter((C) => !C.left && vt(C, c(C.deptId), d.value))), N = e.computed(() => Lt(g.value, i.value, 10));
    e.watch(d, () => {
      i.value = 1;
    });
    async function a() {
      try {
        const C = await Y("mobile.status");
        C && (f.value = { running: !!C.running, url: C.url });
      } catch (C) {
        o.value = Z.errorMessage(C);
      }
    }
    async function I(C) {
      !h[C] || m[C] || (m[C] = await Mt.toDataURL(h[C], { margin: 1, width: 240 }).catch(() => ""));
    }
    async function P(C) {
      s.value = C.id, o.value = "";
      try {
        if (!h[C.id]) {
          const T = Je(await Y("mobile.link", { personId: C.id }));
          if (!T) throw new Error(t.t("没拿到专属链接，请确认手机页服务已开启"));
          h[C.id] = T;
        }
        k.value && await I(C.id), await Qe(h[C.id]) && p.success(t.t("已复制 {name} 的专属链接", { name: C.name }));
      } catch (T) {
        o.value = Z.errorMessage(T);
      } finally {
        s.value = "";
      }
    }
    async function U(C) {
      if (await n.confirm({
        title: t.t("重置专属链接"),
        message: t.t("重置后 {name} 的旧链接立即失效（包括已发出的企微卡片按钮），需要把新链接重新发给本人。确定吗？", { name: C.name }),
        danger: !0,
        confirmLabel: t.t("重置")
      })) {
        s.value = C.id, o.value = "";
        try {
          const z = Je(await Y("mobile.link", { personId: C.id, reset: !0 }));
          if (!z) throw new Error(t.t("没拿到专属链接，请确认手机页服务已开启"));
          h[C.id] = z, delete m[C.id], k.value && await I(C.id), p.success(t.t("已重置 {name} 的专属链接", { name: C.name }));
        } catch (z) {
          o.value = Z.errorMessage(z);
        } finally {
          s.value = "";
        }
      }
    }
    e.watch(k, (C) => {
      C && Object.keys(h).forEach((T) => {
        I(T);
      });
    });
    let M = null;
    return e.onMounted(() => {
      a(), M = Se((C) => {
        C.type === "mobile" && (f.value = { running: C.running, url: C.url }, C.running || (Object.keys(h).forEach((T) => delete h[T]), Object.keys(m).forEach((T) => delete m[T])));
      });
    }), e.onBeforeUnmount(() => M?.()), (C, T) => (e.openBlock(), e.createElementBlock("div", nN, [
      e.createElementVNode("header", oN, [
        e.createElementVNode("div", null, [
          e.createElementVNode(
            "h3",
            null,
            e.toDisplayString(C.$t("手机端")),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "p",
            null,
            e.toDisplayString(C.$t("在本机开一个手机页服务，同一局域网里的手机用浏览器打开。每个人一个带令牌的专属链接（等同企微免登），功能与电脑端一致，另有声纹采集页；企微卡片的按钮也跳到这里。")),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode(
          "span",
          {
            class: e.normalizeClass(["ss-chip", f.value.running ? "ok" : ""]),
            "data-test": "mm-mobile-settings-state"
          },
          e.toDisplayString(f.value.running ? C.$t("运行中") : C.$t("未开启")),
          3
          /* TEXT, CLASS */
        )
      ]),
      o.value ? (e.openBlock(), e.createElementBlock("p", aN, [
        T[5] || (T[5] = e.createElementVNode(
          "i",
          { class: "ri-error-warning-line" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(o.value),
          1
          /* TEXT */
        )
      ])) : e.createCommentVNode("v-if", !0),
      e.createElementVNode("section", sN, [
        e.createElementVNode("div", rN, [
          e.createElementVNode(
            "small",
            null,
            e.toDisplayString(C.$t("局域网地址")),
            1
            /* TEXT */
          ),
          f.value.running && f.value.url ? (e.openBlock(), e.createElementBlock(
            "b",
            iN,
            e.toDisplayString(f.value.url),
            1
            /* TEXT */
          )) : (e.openBlock(), e.createElementBlock(
            "b",
            cN,
            e.toDisplayString(C.$t("服务未开启")),
            1
            /* TEXT */
          ))
        ]),
        e.createElementVNode("button", {
          type: "button",
          class: "ss-btn",
          "data-test": "mm-mobile-goto-home",
          onClick: T[0] || (T[0] = (z) => e.unref(_e)("home"))
        }, [
          T[6] || (T[6] = e.createElementVNode(
            "i",
            { class: "ri-home-4-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            e.toDisplayString(C.$t("到首页开关服务、扫码")),
            1
            /* TEXT */
          )
        ])
      ]),
      e.createElementVNode(
        "p",
        dN,
        e.toDisplayString(C.$t("专属链接只发给本人，泄露了可以让管理员重置。")),
        1
        /* TEXT */
      ),
      e.createElementVNode("div", mN, [
        e.createElementVNode(
          "h4",
          null,
          e.toDisplayString(C.$t("每人专属链接")),
          1
          /* TEXT */
        ),
        T[8] || (T[8] = e.createElementVNode(
          "span",
          { class: "grow" },
          null,
          -1
          /* CACHED */
        )),
        e.createElementVNode("label", uN, [
          e.withDirectives(e.createElementVNode(
            "input",
            {
              "onUpdate:modelValue": T[1] || (T[1] = (z) => k.value = z),
              type: "checkbox",
              "data-test": "mm-mobile-qr"
            },
            null,
            512
            /* NEED_PATCH */
          ), [
            [e.vModelCheckbox, k.value]
          ]),
          e.createTextVNode(
            e.toDisplayString(C.$t("同时显示二维码")),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode("label", pN, [
          T[7] || (T[7] = e.createElementVNode(
            "i",
            {
              class: "ri-search-line",
              "aria-hidden": "true"
            },
            null,
            -1
            /* CACHED */
          )),
          e.withDirectives(e.createElementVNode("input", {
            "onUpdate:modelValue": T[2] || (T[2] = (z) => d.value = z),
            type: "search",
            placeholder: C.$t("搜索员工"),
            "aria-label": C.$t("搜索员工")
          }, null, 8, vN), [
            [e.vModelText, d.value]
          ])
        ])
      ]),
      e.createElementVNode("div", kN, [
        e.createElementVNode("table", yN, [
          e.createElementVNode("thead", null, [
            e.createElementVNode("tr", null, [
              e.createElementVNode(
                "th",
                null,
                e.toDisplayString(C.$t("员工")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "th",
                null,
                e.toDisplayString(C.$t("部门")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "th",
                null,
                e.toDisplayString(C.$t("专属链接")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "th",
                gN,
                e.toDisplayString(C.$t("操作")),
                1
                /* TEXT */
              )
            ])
          ]),
          e.createElementVNode("tbody", null, [
            N.value.rows.length ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock("tr", fN, [
              e.createElementVNode(
                "td",
                NN,
                e.toDisplayString(C.$t("没有符合条件的员工")),
                1
                /* TEXT */
              )
            ])),
            (e.openBlock(!0), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(N.value.rows, (z) => (e.openBlock(), e.createElementBlock("tr", {
                key: z.id
              }, [
                e.createElementVNode("td", null, [
                  e.createVNode(ze, {
                    name: z.name
                  }, null, 8, ["name"])
                ]),
                e.createElementVNode(
                  "td",
                  null,
                  e.toDisplayString(c(z.deptId) || "—"),
                  1
                  /* TEXT */
                ),
                e.createElementVNode("td", VN, [
                  h[z.id] ? (e.openBlock(), e.createElementBlock(
                    e.Fragment,
                    { key: 0 },
                    [
                      e.createElementVNode(
                        "span",
                        EN,
                        e.toDisplayString(h[z.id]),
                        1
                        /* TEXT */
                      ),
                      k.value && m[z.id] ? (e.openBlock(), e.createElementBlock("img", {
                        key: 0,
                        src: m[z.id],
                        alt: C.$t("{name} 的专属链接二维码", { name: z.name }),
                        width: "120",
                        height: "120"
                      }, null, 8, $N)) : e.createCommentVNode("v-if", !0)
                    ],
                    64
                    /* STABLE_FRAGMENT */
                  )) : (e.openBlock(), e.createElementBlock("span", bN, "—"))
                ]),
                e.createElementVNode("td", hN, [
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-link",
                    disabled: !f.value.running || s.value === z.id,
                    title: f.value.running ? "" : C.$t("先开启手机页服务"),
                    "data-test": `mm-mobile-link-${z.id}`,
                    onClick: (R) => P(z)
                  }, e.toDisplayString(h[z.id] ? C.$t("复制链接") : C.$t("生成并复制")), 9, _N),
                  h[z.id] ? (e.openBlock(), e.createElementBlock(
                    e.Fragment,
                    { key: 0 },
                    [
                      T[9] || (T[9] = e.createElementVNode(
                        "span",
                        {
                          class: "mm-sm__sep",
                          "aria-hidden": "true"
                        },
                        "·",
                        -1
                        /* CACHED */
                      )),
                      e.createElementVNode("button", {
                        type: "button",
                        class: "ss-link danger",
                        disabled: s.value === z.id,
                        "data-test": `mm-mobile-reset-${z.id}`,
                        onClick: (R) => U(z)
                      }, e.toDisplayString(C.$t("重置")), 9, BN)
                    ],
                    64
                    /* STABLE_FRAGMENT */
                  )) : e.createCommentVNode("v-if", !0)
                ])
              ]))),
              128
              /* KEYED_FRAGMENT */
            ))
          ])
        ])
      ]),
      e.createElementVNode("footer", SN, [
        e.createElementVNode(
          "span",
          null,
          e.toDisplayString(C.$t("共 {n} 人", { n: g.value.length })),
          1
          /* TEXT */
        ),
        T[12] || (T[12] = e.createElementVNode(
          "span",
          { class: "grow" },
          null,
          -1
          /* CACHED */
        )),
        N.value.pages > 1 ? (e.openBlock(), e.createElementBlock("nav", {
          key: 0,
          class: "mm-pager",
          "aria-label": C.$t("分页")
        }, [
          e.createElementVNode("button", {
            type: "button",
            disabled: N.value.page <= 1,
            "aria-label": C.$t("上一页"),
            onClick: T[3] || (T[3] = (z) => i.value = N.value.page - 1)
          }, [...T[10] || (T[10] = [
            e.createElementVNode(
              "i",
              { class: "ri-arrow-left-s-line" },
              null,
              -1
              /* CACHED */
            )
          ])], 8, wN),
          (e.openBlock(!0), e.createElementBlock(
            e.Fragment,
            null,
            e.renderList(N.value.pages, (z) => (e.openBlock(), e.createElementBlock("button", {
              key: z,
              type: "button",
              class: e.normalizeClass({ on: z === N.value.page }),
              onClick: (R) => i.value = z
            }, e.toDisplayString(z), 11, CN))),
            128
            /* KEYED_FRAGMENT */
          )),
          e.createElementVNode("button", {
            type: "button",
            disabled: N.value.page >= N.value.pages,
            "aria-label": C.$t("下一页"),
            onClick: T[4] || (T[4] = (z) => i.value = N.value.page + 1)
          }, [...T[11] || (T[11] = [
            e.createElementVNode(
              "i",
              { class: "ri-arrow-right-s-line" },
              null,
              -1
              /* CACHED */
            )
          ])], 8, TN)
        ], 8, DN)) : e.createCommentVNode("v-if", !0)
      ])
    ]));
  }
}), MN = /* @__PURE__ */ oe(IN, [["__scopeId", "data-v-d5d7ac31"]]), AN = {
  class: "mm-sd",
  "data-test": "mm-demo"
}, jN = { class: "mm-sp__head" }, LN = {
  key: 0,
  class: "ss-note danger"
}, zN = { class: "ss-note warn" }, FN = { class: "mm-sd__cards" }, PN = { class: "mm-sd__card" }, UN = ["disabled"], ON = { class: "mm-sd__card" }, RN = ["disabled"], qN = /* @__PURE__ */ e.defineComponent({
  __name: "SettingsDemo",
  emits: ["changed"],
  setup(l, { emit: u }) {
    const n = u, p = $e.useDialog(), f = ie.useNotificationStore(), s = e.ref(!1), o = e.ref(""), d = e.ref("");
    async function i(m, c) {
      s.value = !0, o.value = m, d.value = "";
      try {
        await Y(m === "load" ? "demo.load" : "demo.clear"), await ce().catch(() => null), f.success(c), n("changed");
      } catch (g) {
        d.value = Z.errorMessage(g);
      } finally {
        s.value = !1, o.value = "";
      }
    }
    async function k() {
      await p.confirm({
        title: t.t("载入演示数据"),
        message: t.t("载入演示组织和示例项目？工作台里已有正式数据时，请先确认不会和演示数据混在一起。"),
        confirmLabel: t.t("载入")
      }) && await i("load", t.t("演示数据已载入"));
    }
    async function h() {
      await p.confirm({
        title: t.t("清空数据"),
        message: t.t("删除全部项目、会议（含上传的文件）、任务和通知，不能撤销；组织、声纹与系统设置保留。确定清空吗？"),
        confirmLabel: t.t("清空"),
        danger: !0
      }) && await i("clear", t.t("数据已清空"));
    }
    return (m, c) => (e.openBlock(), e.createElementBlock("div", AN, [
      e.createElementVNode("header", jN, [
        e.createElementVNode("div", null, [
          e.createElementVNode(
            "h3",
            null,
            e.toDisplayString(m.$t("演示数据")),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "p",
            null,
            e.toDisplayString(m.$t("一键载入演示组织（20 人、6 个部门）和 3 个项目，以及若干会议、任务、异议，与原型同名，用来演示完整闭环或培训；也可以一键清空。")),
            1
            /* TEXT */
          )
        ])
      ]),
      d.value ? (e.openBlock(), e.createElementBlock("p", LN, [
        c[0] || (c[0] = e.createElementVNode(
          "i",
          { class: "ri-error-warning-line" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(d.value),
          1
          /* TEXT */
        )
      ])) : e.createCommentVNode("v-if", !0),
      e.createElementVNode("p", zN, [
        c[1] || (c[1] = e.createElementVNode(
          "i",
          { class: "ri-alert-line" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(m.$t("演示数据和正式数据在同一个工作台里。正式使用前请先清空演示数据；清空不能撤销。")),
          1
          /* TEXT */
        )
      ]),
      e.createElementVNode("div", FN, [
        e.createElementVNode("section", PN, [
          c[2] || (c[2] = e.createElementVNode(
            "i",
            {
              class: "ri-database-2-line",
              "aria-hidden": "true"
            },
            null,
            -1
            /* CACHED */
          )),
          e.createElementVNode("div", null, [
            e.createElementVNode(
              "strong",
              null,
              e.toDisplayString(m.$t("载入演示数据")),
              1
              /* TEXT */
            ),
            e.createElementVNode(
              "small",
              null,
              e.toDisplayString(m.$t("载入后右上角「当前身份」可以切到任意演示人员，看每个角色的按钮")),
              1
              /* TEXT */
            )
          ]),
          e.createElementVNode("button", {
            type: "button",
            class: "ss-btn primary",
            disabled: s.value,
            "data-test": "mm-demo-load",
            onClick: k
          }, [
            e.createElementVNode(
              "i",
              {
                class: e.normalizeClass(s.value && o.value === "load" ? "ri-loader-4-line spin" : "ri-download-2-line")
              },
              null,
              2
              /* CLASS */
            ),
            e.createTextVNode(
              e.toDisplayString(m.$t("载入")),
              1
              /* TEXT */
            )
          ], 8, UN)
        ]),
        e.createElementVNode("section", ON, [
          c[3] || (c[3] = e.createElementVNode(
            "i",
            {
              class: "ri-delete-bin-6-line danger",
              "aria-hidden": "true"
            },
            null,
            -1
            /* CACHED */
          )),
          e.createElementVNode("div", null, [
            e.createElementVNode(
              "strong",
              null,
              e.toDisplayString(m.$t("清空数据")),
              1
              /* TEXT */
            ),
            e.createElementVNode(
              "small",
              null,
              e.toDisplayString(m.$t("删除全部项目、会议（含上传的文件）、任务和通知；组织、声纹与系统设置保留")),
              1
              /* TEXT */
            )
          ]),
          e.createElementVNode("button", {
            type: "button",
            class: "ss-btn danger",
            disabled: s.value,
            "data-test": "mm-demo-clear",
            onClick: h
          }, [
            e.createElementVNode(
              "i",
              {
                class: e.normalizeClass(s.value && o.value === "clear" ? "ri-loader-4-line spin" : "ri-delete-bin-line")
              },
              null,
              2
              /* CLASS */
            ),
            e.createTextVNode(
              e.toDisplayString(m.$t("清空")),
              1
              /* TEXT */
            )
          ], 8, RN)
        ])
      ])
    ]));
  }
}), KN = /* @__PURE__ */ oe(qN, [["__scopeId", "data-v-2c906f2d"]]), HN = {
  class: "mm-settings",
  "data-test": "mm-settings-tab"
}, WN = { class: "mm-pagehead" }, GN = {
  key: 0,
  class: "ss-empty",
  "data-test": "mm-settings-denied"
}, YN = {
  key: 1,
  class: "mm-settings__grid"
}, JN = ["aria-label"], QN = ["aria-current", "data-test", "onClick"], ZN = { class: "mm-settings__panel" }, XN = {
  key: 0,
  class: "ss-note danger"
}, xN = {
  key: 1,
  class: "ss-muted"
}, eV = /* @__PURE__ */ e.defineComponent({
  __name: "SettingsTab",
  setup(l, { expose: u }) {
    const n = [
      { key: "voiceprint", title: t.t("声纹库"), sub: t.t("采集链接与采集情况") },
      { key: "org", title: t.t("通讯录同步"), sub: t.t("企微部门与成员") },
      { key: "roles", title: t.t("角色权限"), sub: t.t("管理员与可创建项目人员") },
      { key: "ai", title: t.t("AI 能力配置"), sub: t.t("转写、声纹、方案、总结") },
      { key: "wecom", title: t.t("消息推送"), sub: t.t("14 类企微通知") },
      { key: "params", title: t.t("参数设置"), sub: t.t("催办与提醒周期") },
      { key: "mobile", title: t.t("手机端"), sub: t.t("手机页服务与专属链接") },
      { key: "demo", title: t.t("演示数据"), sub: t.t("载入或清空演示组织与项目") }
    ], p = e.ref("voiceprint");
    e.watch(lt, (U) => {
      U && n.some((M) => M.key === U) && (p.value = U), U && (lt.value = "");
    }, { immediate: !0 });
    const f = e.ref(null), s = e.ref([]), o = e.ref([]), d = e.ref(0), i = e.ref(""), k = e.computed(() => !!ne.value?.me.isAdmin);
    async function h() {
      try {
        f.value = await Y("settings.get"), i.value = "";
      } catch (U) {
        i.value = Z.errorMessage(U);
      }
    }
    async function m() {
      try {
        const U = await Y("people.list");
        s.value = U?.people ?? [], o.value = U?.depts ?? [];
      } catch (U) {
        i.value = Z.errorMessage(U);
      }
    }
    let c = 0;
    async function g() {
      c = Date.now(), d.value += 1, await Promise.all([h(), m(), ce().catch(() => null)]);
    }
    async function N(U) {
      U && typeof U == "object" && "adminIds" in U ? f.value = U : await h(), await ce().catch(() => null);
    }
    let a = null, I = null;
    e.onMounted(() => {
      k.value && g(), I = Se((U) => {
        U.type !== "changed" || !["all", "org", "settings"].includes(U.scope) || (a && clearTimeout(a), a = setTimeout(() => {
          a = null, k.value && g();
        }, 300));
      });
    }), e.watch(k, (U) => {
      U && !f.value && g();
    });
    function P() {
      a || !k.value || Date.now() - c < 800 || (a = setTimeout(() => {
        a = null, g();
      }, 300));
    }
    return u({ refresh: P }), e.onBeforeUnmount(() => {
      I?.(), a && clearTimeout(a);
    }), (U, M) => (e.openBlock(), e.createElementBlock("div", HN, [
      e.createElementVNode("header", WN, [
        e.createElementVNode(
          "h2",
          null,
          e.toDisplayString(U.$t("系统设置")),
          1
          /* TEXT */
        ),
        e.createElementVNode(
          "p",
          null,
          e.toDisplayString(U.$t("仅管理员可见")),
          1
          /* TEXT */
        )
      ]),
      k.value ? (e.openBlock(), e.createElementBlock("div", YN, [
        e.createElementVNode("nav", {
          class: "mm-smenu",
          "aria-label": U.$t("设置项")
        }, [
          (e.openBlock(), e.createElementBlock(
            e.Fragment,
            null,
            e.renderList(n, (C) => e.createElementVNode("button", {
              key: C.key,
              type: "button",
              class: e.normalizeClass({ on: p.value === C.key }),
              "aria-current": p.value === C.key ? "page" : void 0,
              "data-test": `mm-settings-menu-${C.key}`,
              onClick: (T) => p.value = C.key
            }, [
              e.createElementVNode(
                "strong",
                null,
                e.toDisplayString(C.title),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "small",
                null,
                e.toDisplayString(C.sub),
                1
                /* TEXT */
              )
            ], 10, QN)),
            64
            /* STABLE_FRAGMENT */
          ))
        ], 8, JN),
        e.createElementVNode("section", ZN, [
          i.value ? (e.openBlock(), e.createElementBlock("p", XN, [
            M[0] || (M[0] = e.createElementVNode(
              "i",
              { class: "ri-error-warning-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(i.value),
              1
              /* TEXT */
            )
          ])) : e.createCommentVNode("v-if", !0),
          !f.value && !i.value ? (e.openBlock(), e.createElementBlock(
            "p",
            xN,
            e.toDisplayString(U.$t("加载中…")),
            1
            /* TEXT */
          )) : f.value ? (e.openBlock(), e.createElementBlock(
            e.Fragment,
            { key: 2 },
            [
              p.value === "voiceprint" ? (e.openBlock(), e.createBlock(By, {
                key: 0,
                people: s.value,
                depts: o.value,
                "refresh-seq": d.value
              }, null, 8, ["people", "depts", "refresh-seq"])) : p.value === "org" ? (e.openBlock(), e.createBlock(ig, {
                key: 1,
                people: s.value,
                depts: o.value,
                onChanged: g
              }, null, 8, ["people", "depts"])) : p.value === "roles" ? (e.openBlock(), e.createBlock(Eg, {
                key: 2,
                settings: f.value,
                people: s.value,
                depts: o.value,
                onSaved: N
              }, null, 8, ["settings", "people", "depts"])) : p.value === "ai" ? (e.openBlock(), e.createBlock(Rf, {
                key: 3,
                settings: f.value,
                onSaved: N
              }, null, 8, ["settings"])) : p.value === "wecom" ? (e.openBlock(), e.createBlock(K1, {
                key: 4,
                settings: f.value,
                onSaved: N
              }, null, 8, ["settings"])) : p.value === "params" ? (e.openBlock(), e.createBlock(lN, {
                key: 5,
                settings: f.value,
                onSaved: N
              }, null, 8, ["settings"])) : p.value === "mobile" ? (e.openBlock(), e.createBlock(MN, {
                key: 6,
                people: s.value,
                depts: o.value
              }, null, 8, ["people", "depts"])) : (e.openBlock(), e.createBlock(KN, {
                key: 7,
                onChanged: g
              }))
            ],
            64
            /* STABLE_FRAGMENT */
          )) : e.createCommentVNode("v-if", !0)
        ])
      ])) : (e.openBlock(), e.createElementBlock(
        "p",
        GN,
        e.toDisplayString(U.$t("只有管理员可以查看和修改系统设置。如需调整，请联系管理员。")),
        1
        /* TEXT */
      ))
    ]));
  }
}), tV = /* @__PURE__ */ oe(eV, [["__scopeId", "data-v-0fcda9a3"]]), lV = ["aria-label"], nV = { class: "mm-sw2" }, oV = { class: "mm-sw2__head" }, aV = { class: "mm-sw2__title" }, sV = {
  class: "mm-sw2__progress",
  "data-test": "mm-setup-progress"
}, rV = { class: "mm-bar" }, iV = { class: "mm-sw2__body" }, cV = ["aria-label"], dV = ["data-test", "onClick"], mV = { class: "mm-sw2__num" }, uV = {
  key: 0,
  class: "ri-check-line"
}, pV = { class: "mm-sw2__stxt" }, vV = { class: "mm-sw2__panel" }, kV = {
  key: 0,
  class: "mm-sw2__step",
  "data-test": "mm-setup-identity"
}, yV = { class: "ss-muted" }, gV = ["placeholder"], fV = { class: "mm-sw2__people" }, NV = ["disabled", "data-test", "onClick"], VV = {
  key: 0,
  class: "ss-muted"
}, EV = {
  key: 0,
  class: "ss-note danger"
}, $V = {
  key: 0,
  class: "ss-note danger"
}, bV = {
  key: 1,
  class: "ss-note"
}, hV = {
  key: 0,
  class: "mm-sw2__step",
  "data-test": "mm-setup-models"
}, _V = { class: "ss-muted" }, BV = {
  class: "mm-sw2__hw",
  "data-test": "mm-setup-hw"
}, SV = { class: "mm-sw2__items" }, DV = {
  key: 0,
  class: "ss-chip ok",
  "data-test": "mm-setup-spk-ok"
}, wV = ["disabled"], CV = {
  key: 0,
  class: "ss-muted mono mm-sw2__log",
  "data-test": "mm-setup-install-log"
}, TV = {
  key: 1,
  class: "ss-note danger"
}, IV = {
  class: "mm-sw2__step",
  "data-test": "mm-setup-org"
}, MV = { class: "ss-muted" }, AV = {
  class: "ss-note info",
  "data-test": "mm-setup-org-now"
}, jV = { class: "mm-sw2__opts" }, LV = ["disabled"], zV = { class: "mm-sw2__row" }, FV = ["disabled"], PV = { class: "mm-sw2__links" }, UV = { class: "mm-sw2__form" }, OV = { class: "mm-sw2__secret" }, RV = ["type", "placeholder"], qV = ["title", "disabled"], KV = ["disabled"], HV = {
  class: "mm-sw2__guide",
  "data-test": "mm-setup-app-guide"
}, WV = { class: "mm-sw2__ol" }, GV = {
  key: 0,
  class: "ss-note warn mm-sw2__ip",
  "data-test": "mm-setup-egress-ip"
}, YV = { class: "mono" }, JV = {
  class: "mm-sw2__step",
  "data-test": "mm-setup-push"
}, QV = { class: "ss-muted" }, ZV = { class: "mm-sw2__box" }, XV = { class: "mm-sw2__boxhead" }, xV = { class: "mm-sw2__ol" }, eE = { class: "mm-sw2__row" }, tE = ["placeholder"], lE = ["disabled"], nE = ["disabled"], oE = { class: "mm-sw2__box" }, aE = {
  class: "ss-muted",
  "data-test": "mm-setup-mentionable"
}, sE = { class: "mm-sw2__row" }, rE = { class: "mm-sw2__who" }, iE = ["placeholder"], cE = ["disabled"], dE = { class: "ss-muted" }, mE = {
  class: "mm-sw2__step",
  "data-test": "mm-setup-mobile-step"
}, uE = { class: "ss-muted" }, pE = {
  class: "mm-sw2__step",
  "data-test": "mm-setup-voice"
}, vE = { class: "ss-muted" }, kE = {
  key: 0,
  class: "ss-note warn"
}, yE = { class: "mm-sw2__consent" }, gE = { class: "mm-sw2__row" }, fE = ["disabled"], NE = ["disabled"], VE = {
  class: "mm-sw2__step",
  "data-test": "mm-setup-ai"
}, EE = { class: "ss-muted" }, $E = ["disabled"], bE = {
  class: "mm-sw2__step",
  "data-test": "mm-setup-finish"
}, hE = { class: "mm-sw2__sum" }, _E = ["onClick"], BE = { class: "ss-muted" }, SE = {
  key: 7,
  class: "ss-note danger",
  "data-test": "mm-setup-error"
}, DE = { class: "mm-sw2__foot" }, wE = ["disabled"], CE = ["disabled"], TE = /* @__PURE__ */ e.defineComponent({
  __name: "SetupWizard",
  emits: ["close", "done"],
  setup(l, { emit: u }) {
    const n = [
      { key: "models", title: t.t("电脑配置与语音模型") },
      { key: "org", title: t.t("组织架构") },
      { key: "push", title: t.t("通知推送") },
      { key: "mobile", title: t.t("手机端") },
      { key: "voice", title: t.t("采集你的声纹") },
      { key: "ai", title: t.t("大模型") }
    ], p = [...n.map((A) => A.key), "finish"], f = u, s = e.ref(null), o = e.ref("models"), d = e.computed(() => p.indexOf(o.value)), i = e.reactive(/* @__PURE__ */ new Set()), k = e.ref(""), h = e.ref(""), m = e.ref(!1), c = e.ref(""), g = e.ref(""), N = e.ref(""), a = e.ref(null), I = e.reactive({ corpId: "", agentId: "", secret: "" }), P = e.ref(""), U = e.ref(null), M = e.ref(""), C = e.ref(!1), T = e.ref(null), z = e.ref(null), R = e.ref(null), _ = e.ref(!1), E = e.ref(!1), v = e.ref(!1), S = e.ref([]), j = e.ref([]), J = e.ref(""), y = e.computed(() => {
      const A = J.value.trim(), K = A ? S.value.filter((he) => he.name.includes(A)) : S.value, te = [];
      for (const he of j.value) {
        const qe = K.filter((Yt) => Yt.deptId === he.id);
        qe.length && te.push({ id: he.id, name: he.name, people: qe });
      }
      const ue = K.filter((he) => !j.value.some((qe) => qe.id === he.deptId));
      return ue.length && te.push({ id: "_", name: t.t("其他"), people: ue }), te;
    }), V = e.computed(() => /60020|可信 IP|trusted IP/i.test(h.value) ? /(\d{1,3}(?:\.\d{1,3}){3})/.exec(h.value)?.[1] ?? "" : "");
    async function r() {
      try {
        await navigator.clipboard.writeText(V.value);
      } catch {
      }
    }
    const W = /当前身份无效|请先选择身份|identity is invalid|select an identity/i;
    async function X() {
      try {
        s.value = await Y("setup.status"), k.value = "", v.value = !1, M.value = s.value.me.mobile || "", !I.corpId && s.value.wecom?.corpId && (I.corpId = s.value.wecom.corpId), !I.agentId && s.value.wecom?.agentId && (I.agentId = s.value.wecom.agentId);
      } catch (A) {
        const K = Z.errorMessage(A);
        W.test(K) ? await ae() : k.value = K;
      }
    }
    async function ae() {
      try {
        const A = await Y("people.list");
        j.value = A?.depts ?? [], S.value = A?.people ?? [];
      } catch {
      }
      J.value = "", v.value = !0;
    }
    function q(A) {
      return F("identity", async () => {
        await Y("identity.set", { personId: A }), He(), await ce().catch(() => null), v.value = !1, await X();
      });
    }
    async function H() {
      if (!E.value && !I.secret && s.value?.wecom?.hasSecret)
        try {
          const A = await Y("wecom.secret.reveal");
          I.secret = A?.secret || "";
        } catch (A) {
          h.value = Z.errorMessage(A);
          return;
        }
      E.value = !E.value;
    }
    function ee(A) {
      const K = s.value;
      if (!K) return !1;
      switch (A) {
        case "models":
          return (K.models.asrReady || K.asr?.mode === "cloud" && !!K.asr.cloud?.hasKey) && K.models.speaker && K.models.python && K.models.ffmpeg;
        case "org":
          return K.org.people > 0 && (K.org.source !== "demo" || _.value);
        case "push":
          return !!K.push.channel;
        case "mobile":
          return K.mobile.running;
        case "voice":
          return K.me.voiceprint;
        case "ai":
          return !!R.value?.ok;
      }
    }
    function le(A) {
      return A === "finish" ? "todo" : ee(A) ? "done" : i.has(A) ? "skipped" : "todo";
    }
    const $ = e.computed(() => n.filter((A) => ee(A.key)).length);
    function b(A) {
      const K = s.value;
      if (!K) return "";
      switch (A) {
        case "models": {
          const te = K.asr?.mode === "cloud" ? t.t("在线接口") : K.recommend.engine === "firered" ? "FireRedASR2" : "SenseVoice";
          return ee(A) ? t.t("{m} 和声纹模型已就绪", { m: te }) : t.t("推荐 {m}", { m: te });
        }
        case "org":
          return t.t("{src} · {n} 人", { src: B.value, n: K.org.people });
        case "push":
          return K.push.channel === "app" ? t.t("企微自建应用") : K.push.channel === "webhook" ? t.t("企微群机器人") : t.t("只进消息中心");
        case "mobile":
          return K.mobile.running ? t.t("运行中") : t.t("未开启");
        case "voice":
          return K.me.voiceprint ? t.t("已采集") : t.t("未采集");
        case "ai":
          return R.value ? R.value.ok ? t.t("可用") : t.t("没连上") : t.t("未测试");
      }
    }
    const B = e.computed(() => {
      const A = s.value?.org.source;
      return A === "wecom" ? t.t("企微通讯录") : A === "import" ? t.t("导入的通讯录") : A === "demo" ? t.t("演示组织") : t.t("还没有组织");
    }), D = e.computed(() => ({ good: t.t("配置很好"), ok: t.t("够用"), weak: t.t("偏弱") })[s.value?.recommend.tier || "ok"]), O = e.computed(() => ({ good: "ok", ok: "brand", weak: "warn" })[s.value?.recommend.tier || "ok"]), G = e.computed(() => t.t("大家好，我是{dept}的{name}。这是我的声纹采集录音，用于在会议纪要里自动识别我的发言。我会用平时开会说话的音量和语速，把这段话完整地读完。", {
      dept: s.value?.me.deptName || "",
      name: s.value?.me.name || ""
    }));
    async function F(A, K) {
      m.value = !0, c.value = A, h.value = "";
      try {
        await K();
      } catch (te) {
        h.value = Z.errorMessage(te);
      } finally {
        m.value = !1, c.value = "";
      }
    }
    function w(A) {
      A && (o.value = A, h.value = "");
    }
    function L() {
      o.value !== "finish" && i.add(o.value), w(p[d.value + 1]);
    }
    e.watch(o, (A) => {
      A === "mobile" && s.value && !s.value.mobile.running && F("mobile", async () => {
        await Y("mobile.start"), await X(), await ce().catch(() => null);
      });
    });
    const x = () => window.electronAPI?.pyExt;
    let Q = null;
    async function se(A) {
      const K = x();
      if (!K?.install) {
        h.value = t.t("组件安装器不可用，请到应用的 设置 → 语音 里下载");
        return;
      }
      g.value = A, N.value = t.t("开始下载…"), h.value = "";
      try {
        const te = await K.install(A);
        te?.ok ? N.value = t.t("下载完成") : h.value = te?.error || t.t("下载失败"), await X();
      } catch (te) {
        h.value = Z.errorMessage(te);
      } finally {
        g.value = "";
      }
    }
    function Ve() {
      return F("demo", async () => {
        const A = s.value?.org.source !== "demo" ? await Y("org.sync") : null;
        _.value = !0, await ce().catch(() => null), A?.needIdentity ? await ae() : await X();
      });
    }
    function be() {
      return F("import", async () => {
        const A = await Y("org.importFile");
        A && (a.value = A, await ce().catch(() => null), A.needIdentity ? await ae() : await X());
      });
    }
    function Te() {
      return F("app", async () => {
        const A = { corpId: I.corpId.trim(), agentId: I.agentId.trim() };
        I.secret && (A.secret = I.secret), await Y("wecom.save", A);
        const K = await Y("org.sync");
        if (K?.error) throw new Error(K.error);
        await ce().catch(() => null), K?.needIdentity ? await ae() : await X();
      });
    }
    function me() {
      return F("hook", async () => {
        U.value = null, await Y("wecom.webhook.save", { url: P.value.trim() }), P.value = "", await X(), await ce().catch(() => null);
      });
    }
    function Re() {
      return F("hookTest", async () => {
        const A = await Y("wecom.webhook.test");
        U.value = { ok: !!A?.ok, error: A?.error };
      });
    }
    function tt() {
      return F("mobileNo", async () => {
        s.value && (await Y("org.person.contact", { personId: s.value.me.id, mobile: M.value.trim() }), await X());
      });
    }
    function Kt() {
      return F("voice", async () => {
        if (!(!T.value || !s.value)) {
          z.value = null;
          try {
            const A = await Y("voiceprint.enrollData", { personId: s.value.me.id, consent: !0, data: T.value.data, ext: T.value.ext });
            z.value = { ok: !0, seconds: A?.seconds };
          } catch (A) {
            z.value = { ok: !1, error: Z.errorMessage(A) };
          }
          await X();
        }
      });
    }
    function Ht() {
      return F("voice", async () => {
        if (s.value) {
          z.value = null;
          try {
            const A = await Y("voiceprint.import", { personId: s.value.me.id, consent: !0 });
            A && (z.value = { ok: !0, seconds: A.seconds });
          } catch (A) {
            z.value = { ok: !1, error: Z.errorMessage(A) };
          }
          await X();
        }
      });
    }
    function Wt() {
      return F("llm", async () => {
        R.value = await Y("setup.llmTest");
      });
    }
    function Gt() {
      return F("finish", async () => {
        await Y("setup.finish"), await ce().catch(() => null), f("done");
      });
    }
    return e.onMounted(() => {
      X();
      const A = x();
      A?.onInstallProgress && (Q = A.onInstallProgress((K) => {
        K?.id && K.id === g.value && K.line && (N.value = String(K.line).slice(0, 200));
      }));
    }), e.onBeforeUnmount(() => {
      try {
        Q?.();
      } catch {
      }
    }), (A, K) => (e.openBlock(), e.createElementBlock("div", {
      class: "mm-setup-overlay",
      role: "dialog",
      "aria-modal": "true",
      "aria-label": A.$t("配置引导"),
      "data-test": "mm-setup"
    }, [
      e.createElementVNode("div", nV, [
        e.createElementVNode("header", oV, [
          e.createElementVNode("div", aV, [
            e.createElementVNode(
              "h2",
              null,
              e.toDisplayString(A.$t("配置引导")),
              1
              /* TEXT */
            ),
            e.createElementVNode(
              "p",
              null,
              e.toDisplayString(A.$t("把泰途会议智能管理要用到的配置一步步配好。每一步都可以先跳过，之后点右上角「配置引导」继续。")),
              1
              /* TEXT */
            )
          ]),
          e.createElementVNode(
            "button",
            {
              type: "button",
              class: "ss-btn",
              "data-test": "mm-setup-later",
              onClick: K[0] || (K[0] = (te) => f("close"))
            },
            e.toDisplayString(A.$t("稍后再说")),
            1
            /* TEXT */
          )
        ]),
        e.createCommentVNode(" 进度条固定在顶部，内容区自己滚 "),
        e.createElementVNode("div", sV, [
          e.createElementVNode("i", rV, [
            e.createElementVNode(
              "b",
              {
                style: e.normalizeStyle({ width: `${Math.round($.value / n.length * 100)}%` })
              },
              null,
              4
              /* STYLE */
            )
          ]),
          e.createElementVNode(
            "span",
            null,
            e.toDisplayString(A.$t("已完成 {a} / {b}", { a: $.value, b: n.length })),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode("div", iV, [
          e.createElementVNode("nav", {
            class: "mm-sw2__steps",
            "aria-label": A.$t("步骤")
          }, [
            (e.openBlock(), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(n, (te, ue) => e.createElementVNode("button", {
                key: te.key,
                type: "button",
                class: e.normalizeClass({ on: o.value === te.key, ok: le(te.key) === "done", skip: le(te.key) === "skipped" }),
                "data-test": `mm-setup-step-${te.key}`,
                onClick: (he) => w(te.key)
              }, [
                e.createElementVNode("span", mV, [
                  le(te.key) === "done" ? (e.openBlock(), e.createElementBlock("i", uV)) : (e.openBlock(), e.createElementBlock(
                    e.Fragment,
                    { key: 1 },
                    [
                      e.createTextVNode(
                        e.toDisplayString(ue + 1),
                        1
                        /* TEXT */
                      )
                    ],
                    64
                    /* STABLE_FRAGMENT */
                  ))
                ]),
                e.createElementVNode("span", pV, [
                  e.createElementVNode(
                    "strong",
                    null,
                    e.toDisplayString(te.title),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "small",
                    null,
                    e.toDisplayString(b(te.key)),
                    1
                    /* TEXT */
                  )
                ])
              ], 10, dV)),
              64
              /* STABLE_FRAGMENT */
            ))
          ], 8, cV),
          e.createElementVNode("section", vV, [
            e.createCommentVNode(" 通讯录换成新的（企微同步 / 导入）后，原来的身份不在里面了：直接在这里选「你是谁」，选中的人成为管理员 "),
            v.value ? (e.openBlock(), e.createElementBlock("div", kV, [
              e.createElementVNode(
                "h3",
                null,
                e.toDisplayString(A.$t("通讯录已更新，你是哪一位？")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "p",
                yV,
                e.toDisplayString(A.$t("组织已经换成新的通讯录（{n} 人），原来的演示身份不在里面了。选你自己，之后按你的身份继续配置；你会成为泰途会议智能管理的管理员。", { n: S.value.length })),
                1
                /* TEXT */
              ),
              e.withDirectives(e.createElementVNode("input", {
                "onUpdate:modelValue": K[1] || (K[1] = (te) => J.value = te),
                class: "mm-sw2__search",
                type: "search",
                placeholder: A.$t("搜索姓名"),
                "data-test": "mm-setup-identity-search"
              }, null, 8, gV), [
                [e.vModelText, J.value]
              ]),
              e.createElementVNode("div", fV, [
                (e.openBlock(!0), e.createElementBlock(
                  e.Fragment,
                  null,
                  e.renderList(y.value, (te) => (e.openBlock(), e.createElementBlock(
                    e.Fragment,
                    {
                      key: te.id
                    },
                    [
                      e.createElementVNode(
                        "h5",
                        null,
                        e.toDisplayString(te.name),
                        1
                        /* TEXT */
                      ),
                      (e.openBlock(!0), e.createElementBlock(
                        e.Fragment,
                        null,
                        e.renderList(te.people, (ue) => (e.openBlock(), e.createElementBlock("button", {
                          key: ue.id,
                          type: "button",
                          class: "mm-sw2__person",
                          disabled: m.value,
                          "data-test": `mm-setup-me-${ue.id}`,
                          onClick: (he) => q(ue.id)
                        }, [
                          e.createElementVNode(
                            "strong",
                            null,
                            e.toDisplayString(ue.name),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "small",
                            null,
                            e.toDisplayString(ue.title || ""),
                            1
                            /* TEXT */
                          )
                        ], 8, NV))),
                        128
                        /* KEYED_FRAGMENT */
                      ))
                    ],
                    64
                    /* STABLE_FRAGMENT */
                  ))),
                  128
                  /* KEYED_FRAGMENT */
                )),
                y.value.length ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock(
                  "p",
                  VV,
                  e.toDisplayString(A.$t("没有找到这个人")),
                  1
                  /* TEXT */
                ))
              ]),
              h.value ? (e.openBlock(), e.createElementBlock("p", EV, [
                K[20] || (K[20] = e.createElementVNode(
                  "i",
                  { class: "ri-error-warning-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(h.value),
                  1
                  /* TEXT */
                )
              ])) : e.createCommentVNode("v-if", !0)
            ])) : (e.openBlock(), e.createElementBlock(
              e.Fragment,
              { key: 1 },
              [
                k.value ? (e.openBlock(), e.createElementBlock("p", $V, [
                  K[21] || (K[21] = e.createElementVNode(
                    "i",
                    { class: "ri-error-warning-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(k.value),
                    1
                    /* TEXT */
                  )
                ])) : e.createCommentVNode("v-if", !0),
                !s.value && !k.value ? (e.openBlock(), e.createElementBlock("p", bV, [
                  K[22] || (K[22] = e.createElementVNode(
                    "i",
                    { class: "ri-loader-4-line spin" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(A.$t("正在检测…")),
                    1
                    /* TEXT */
                  )
                ])) : e.createCommentVNode("v-if", !0),
                s.value ? (e.openBlock(), e.createElementBlock(
                  e.Fragment,
                  { key: 2 },
                  [
                    e.createCommentVNode(" 1 电脑配置与语音模型 "),
                    o.value === "models" ? (e.openBlock(), e.createElementBlock("div", hV, [
                      e.createElementVNode(
                        "h3",
                        null,
                        e.toDisplayString(A.$t("电脑配置与语音模型")),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "p",
                        _V,
                        e.toDisplayString(A.$t("按这台电脑的配置推荐跑得动的最准的转写模型（录音不出电脑）；也可以改填自己的在线语音识别接口。认人（声纹）始终在本机。")),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode("div", BV, [
                        e.createElementVNode("div", null, [
                          e.createElementVNode(
                            "small",
                            null,
                            e.toDisplayString(A.$t("处理器")),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "b",
                            null,
                            e.toDisplayString(s.value.hardware.cpu || s.value.hardware.arch),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "em",
                            null,
                            e.toDisplayString(A.$t("{n} 核", { n: s.value.hardware.cores })),
                            1
                            /* TEXT */
                          )
                        ]),
                        e.createElementVNode("div", null, [
                          e.createElementVNode(
                            "small",
                            null,
                            e.toDisplayString(A.$t("内存")),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "b",
                            null,
                            e.toDisplayString(A.$t("{n} GB", { n: s.value.hardware.memGb })),
                            1
                            /* TEXT */
                          )
                        ]),
                        e.createElementVNode("div", null, [
                          e.createElementVNode(
                            "small",
                            null,
                            e.toDisplayString(A.$t("模型所在磁盘剩余")),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "b",
                            null,
                            e.toDisplayString(s.value.hardware.freeDiskGb === null ? "—" : A.$t("{n} GB", { n: s.value.hardware.freeDiskGb })),
                            1
                            /* TEXT */
                          )
                        ]),
                        e.createElementVNode("div", null, [
                          e.createElementVNode(
                            "small",
                            null,
                            e.toDisplayString(A.$t("评级")),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode("b", null, [
                            e.createElementVNode(
                              "span",
                              {
                                class: e.normalizeClass(["ss-chip", O.value])
                              },
                              e.toDisplayString(D.value),
                              3
                              /* TEXT, CLASS */
                            )
                          ])
                        ])
                      ]),
                      e.createVNode(qt, {
                        "data-test": "mm-setup-asr",
                        onChanged: X
                      }),
                      e.createElementVNode("ul", SV, [
                        e.createElementVNode("li", null, [
                          e.createElementVNode("div", null, [
                            e.createElementVNode(
                              "strong",
                              null,
                              e.toDisplayString(A.$t("声纹模型 CAM++")),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "small",
                              null,
                              e.toDisplayString(A.$t("用来按声音认出是谁在发言")),
                              1
                              /* TEXT */
                            )
                          ]),
                          s.value.models.speaker ? (e.openBlock(), e.createElementBlock(
                            "span",
                            DV,
                            e.toDisplayString(A.$t("已下载")),
                            1
                            /* TEXT */
                          )) : (e.openBlock(), e.createElementBlock("button", {
                            key: 1,
                            type: "button",
                            class: "ss-btn primary sm",
                            disabled: !!g.value,
                            "data-test": "mm-setup-spk-install",
                            onClick: K[2] || (K[2] = (te) => se(s.value.recommend.speakerInstallId))
                          }, [
                            e.createElementVNode(
                              "i",
                              {
                                class: e.normalizeClass(g.value === s.value.recommend.speakerInstallId ? "ri-loader-4-line spin" : "ri-download-2-line")
                              },
                              null,
                              2
                              /* CLASS */
                            ),
                            e.createTextVNode(
                              e.toDisplayString(A.$t("下载")),
                              1
                              /* TEXT */
                            )
                          ], 8, wV))
                        ]),
                        e.createElementVNode("li", null, [
                          e.createElementVNode("div", null, [
                            e.createElementVNode(
                              "strong",
                              null,
                              e.toDisplayString(A.$t("本机语音运行组件")),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "small",
                              null,
                              e.toDisplayString(A.$t("随应用自带的 Python 和 ffmpeg")),
                              1
                              /* TEXT */
                            )
                          ]),
                          e.createElementVNode(
                            "span",
                            {
                              class: e.normalizeClass(["ss-chip", s.value.models.python && s.value.models.ffmpeg ? "ok" : "bad"])
                            },
                            e.toDisplayString(s.value.models.python && s.value.models.ffmpeg ? A.$t("正常") : A.$t("缺失")),
                            3
                            /* TEXT, CLASS */
                          )
                        ])
                      ]),
                      N.value ? (e.openBlock(), e.createElementBlock(
                        "p",
                        CV,
                        e.toDisplayString(N.value),
                        1
                        /* TEXT */
                      )) : e.createCommentVNode("v-if", !0),
                      s.value.models.python && s.value.models.ffmpeg ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock("p", TV, [
                        K[23] || (K[23] = e.createElementVNode(
                          "i",
                          { class: "ri-error-warning-line" },
                          null,
                          -1
                          /* CACHED */
                        )),
                        e.createTextVNode(
                          e.toDisplayString(A.$t("本机语音运行组件不完整，录音没法处理。请重新安装应用，或到应用的 设置 → 语音 里修复。")),
                          1
                          /* TEXT */
                        )
                      ]))
                    ])) : o.value === "org" ? (e.openBlock(), e.createElementBlock(
                      e.Fragment,
                      { key: 1 },
                      [
                        e.createCommentVNode(" 2 组织架构 "),
                        e.createElementVNode("div", IV, [
                          e.createElementVNode(
                            "h3",
                            null,
                            e.toDisplayString(A.$t("组织架构")),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "p",
                            MV,
                            e.toDisplayString(A.$t("任务按部门派给部门负责人，发言人只在本场参会人里认，都要先有组织架构。")),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode("p", AV, [
                            K[24] || (K[24] = e.createElementVNode(
                              "i",
                              { class: "ri-team-line" },
                              null,
                              -1
                              /* CACHED */
                            )),
                            e.createTextVNode(
                              e.toDisplayString(A.$t("现在：{src} · {n} 人 · {d} 个部门", { src: B.value, n: s.value.org.people, d: s.value.org.depts })),
                              1
                              /* TEXT */
                            )
                          ]),
                          e.createElementVNode("div", jV, [
                            e.createElementVNode("article", null, [
                              e.createElementVNode(
                                "strong",
                                null,
                                e.toDisplayString(A.$t("先用演示组织")),
                                1
                                /* TEXT */
                              ),
                              e.createElementVNode(
                                "small",
                                null,
                                e.toDisplayString(A.$t("20 人、6 个部门，和原型同名，适合演示和培训。右上角「当前身份」能切到任意人推进流程。")),
                                1
                                /* TEXT */
                              ),
                              e.createElementVNode("button", {
                                type: "button",
                                class: "ss-btn sm",
                                disabled: m.value,
                                "data-test": "mm-setup-org-demo",
                                onClick: Ve
                              }, e.toDisplayString(s.value.org.source === "demo" ? A.$t("就用演示组织") : A.$t("换回演示组织")), 9, LV)
                            ]),
                            e.createElementVNode("article", null, [
                              e.createElementVNode(
                                "strong",
                                null,
                                e.toDisplayString(A.$t("导入通讯录表格（推荐）")),
                                1
                                /* TEXT */
                              ),
                              e.createElementVNode(
                                "small",
                                null,
                                e.toDisplayString(A.$t("企业微信管理后台 → 通讯录 → 批量导入/导出 → 导出成员，把导出的表格直接导进来。自己整理的表格也行：至少要有「姓名」「部门」，「手机」「账号」「是否部门负责人」「直属上级」有就更好。")),
                                1
                                /* TEXT */
                              ),
                              e.createElementVNode("div", zV, [
                                e.createElementVNode("button", {
                                  type: "button",
                                  class: "ss-btn primary sm",
                                  disabled: m.value,
                                  "data-test": "mm-setup-org-import",
                                  onClick: be
                                }, [
                                  e.createElementVNode(
                                    "i",
                                    {
                                      class: e.normalizeClass(c.value === "import" ? "ri-loader-4-line spin" : "ri-file-excel-2-line")
                                    },
                                    null,
                                    2
                                    /* CLASS */
                                  ),
                                  e.createTextVNode(
                                    e.toDisplayString(A.$t("选择表格导入")),
                                    1
                                    /* TEXT */
                                  )
                                ], 8, FV),
                                e.createElementVNode("button", {
                                  type: "button",
                                  class: "ss-link",
                                  "data-test": "mm-setup-link-contacts",
                                  onClick: K[3] || (K[3] = (te) => e.unref(pe)(e.unref(ge).contacts))
                                }, [
                                  e.createTextVNode(
                                    e.toDisplayString(A.$t("去企微后台导出")) + " ",
                                    1
                                    /* TEXT */
                                  ),
                                  K[25] || (K[25] = e.createElementVNode(
                                    "i",
                                    { class: "ri-external-link-line" },
                                    null,
                                    -1
                                    /* CACHED */
                                  ))
                                ])
                              ])
                            ]),
                            e.createElementVNode("article", null, [
                              e.createElementVNode(
                                "strong",
                                null,
                                e.toDisplayString(A.$t("企业微信自建应用")),
                                1
                                /* TEXT */
                              ),
                              e.createElementVNode(
                                "small",
                                null,
                                e.toDisplayString(A.$t("有自建应用（CorpID、AgentID、Secret，且本机出口 IP 在企业可信 IP 里）时，直接从企微同步通讯录，通知按人发卡片。")),
                                1
                                /* TEXT */
                              ),
                              e.createElementVNode("div", PV, [
                                e.createElementVNode("button", {
                                  type: "button",
                                  class: "ss-link",
                                  "data-test": "mm-setup-link-profile",
                                  onClick: K[4] || (K[4] = (te) => e.unref(pe)(e.unref(ge).profile))
                                }, [
                                  e.createTextVNode(
                                    e.toDisplayString(A.$t("打开企微·我的企业（查 CorpID）")) + " ",
                                    1
                                    /* TEXT */
                                  ),
                                  K[26] || (K[26] = e.createElementVNode(
                                    "i",
                                    { class: "ri-external-link-line" },
                                    null,
                                    -1
                                    /* CACHED */
                                  ))
                                ]),
                                e.createElementVNode("button", {
                                  type: "button",
                                  class: "ss-link",
                                  "data-test": "mm-setup-link-apps",
                                  onClick: K[5] || (K[5] = (te) => e.unref(pe)(e.unref(ge).apps))
                                }, [
                                  e.createTextVNode(
                                    e.toDisplayString(A.$t("打开企微·应用管理")) + " ",
                                    1
                                    /* TEXT */
                                  ),
                                  K[27] || (K[27] = e.createElementVNode(
                                    "i",
                                    { class: "ri-external-link-line" },
                                    null,
                                    -1
                                    /* CACHED */
                                  ))
                                ])
                              ]),
                              e.createElementVNode("div", UV, [
                                e.withDirectives(e.createElementVNode(
                                  "input",
                                  {
                                    "onUpdate:modelValue": K[6] || (K[6] = (te) => I.corpId = te),
                                    type: "text",
                                    placeholder: "CorpID",
                                    spellcheck: "false",
                                    "data-test": "mm-setup-corp"
                                  },
                                  null,
                                  512
                                  /* NEED_PATCH */
                                ), [
                                  [e.vModelText, I.corpId]
                                ]),
                                e.withDirectives(e.createElementVNode(
                                  "input",
                                  {
                                    "onUpdate:modelValue": K[7] || (K[7] = (te) => I.agentId = te),
                                    type: "text",
                                    placeholder: "AgentID",
                                    spellcheck: "false",
                                    "data-test": "mm-setup-agent"
                                  },
                                  null,
                                  512
                                  /* NEED_PATCH */
                                ), [
                                  [e.vModelText, I.agentId]
                                ]),
                                e.createElementVNode("span", OV, [
                                  e.withDirectives(e.createElementVNode("input", {
                                    "onUpdate:modelValue": K[8] || (K[8] = (te) => I.secret = te),
                                    type: E.value ? "text" : "password",
                                    placeholder: s.value.wecom?.hasSecret ? A.$t("已保存，点右边的眼睛查看") : "Secret",
                                    autocomplete: "new-password",
                                    spellcheck: "false",
                                    "data-test": "mm-setup-secret"
                                  }, null, 8, RV), [
                                    [e.vModelDynamic, I.secret]
                                  ]),
                                  e.createElementVNode("button", {
                                    type: "button",
                                    class: "mm-sw2__eye",
                                    title: E.value ? A.$t("隐藏") : A.$t("查看"),
                                    disabled: m.value,
                                    "data-test": "mm-setup-secret-eye",
                                    onClick: H
                                  }, [
                                    e.createElementVNode(
                                      "i",
                                      {
                                        class: e.normalizeClass(E.value ? "ri-eye-off-line" : "ri-eye-line")
                                      },
                                      null,
                                      2
                                      /* CLASS */
                                    )
                                  ], 8, qV)
                                ])
                              ]),
                              e.createElementVNode("button", {
                                type: "button",
                                class: "ss-btn sm",
                                disabled: m.value || !I.corpId.trim() || !I.agentId.trim() || !I.secret && !s.value.push.appConfigured,
                                "data-test": "mm-setup-app-sync",
                                onClick: Te
                              }, [
                                e.createElementVNode(
                                  "i",
                                  {
                                    class: e.normalizeClass(c.value === "app" ? "ri-loader-4-line spin" : "ri-refresh-line")
                                  },
                                  null,
                                  2
                                  /* CLASS */
                                ),
                                e.createTextVNode(
                                  e.toDisplayString(A.$t("保存并同步通讯录")),
                                  1
                                  /* TEXT */
                                )
                              ], 8, KV),
                              e.createElementVNode("details", HV, [
                                e.createElementVNode(
                                  "summary",
                                  null,
                                  e.toDisplayString(A.$t("第一次接入：在企业微信管理后台做这几步")),
                                  1
                                  /* TEXT */
                                ),
                                e.createElementVNode("ol", WV, [
                                  e.createElementVNode("li", null, [
                                    e.createTextVNode(
                                      e.toDisplayString(A.$t("应用管理 → 自建 → 创建应用；可见范围选全公司（应用只能读到可见范围里的部门和成员）")) + " ",
                                      1
                                      /* TEXT */
                                    ),
                                    e.createElementVNode("button", {
                                      type: "button",
                                      class: "ss-link",
                                      onClick: K[9] || (K[9] = (te) => e.unref(pe)(e.unref(ge).apps))
                                    }, [
                                      e.createTextVNode(
                                        e.toDisplayString(A.$t("去打开")) + " ",
                                        1
                                        /* TEXT */
                                      ),
                                      K[28] || (K[28] = e.createElementVNode(
                                        "i",
                                        { class: "ri-external-link-line" },
                                        null,
                                        -1
                                        /* CACHED */
                                      ))
                                    ])
                                  ]),
                                  e.createElementVNode(
                                    "li",
                                    null,
                                    e.toDisplayString(A.$t("应用详情 → 开发者接口 → 网页授权及 JS-SDK → 设置可信域名：填公司备案的域名，下载 WW_verify 开头的验证文件，放到网站根目录后点验证")),
                                    1
                                    /* TEXT */
                                  ),
                                  e.createElementVNode(
                                    "li",
                                    null,
                                    e.toDisplayString(A.$t("同一页「企业可信 IP」：填这台电脑所在网络的公网出口 IP。不知道就先点上面的「保存并同步通讯录」，失败时这里会显示要填的 IP")),
                                    1
                                    /* TEXT */
                                  ),
                                  e.createElementVNode("li", null, [
                                    e.createTextVNode(
                                      e.toDisplayString(A.$t("「我的企业」页面底部复制企业 ID（CorpID），应用详情里复制 AgentId 和 Secret，填到上面，再点「保存并同步通讯录」")) + " ",
                                      1
                                      /* TEXT */
                                    ),
                                    e.createElementVNode("button", {
                                      type: "button",
                                      class: "ss-link",
                                      onClick: K[10] || (K[10] = (te) => e.unref(pe)(e.unref(ge).profile))
                                    }, [
                                      e.createTextVNode(
                                        e.toDisplayString(A.$t("去打开")) + " ",
                                        1
                                        /* TEXT */
                                      ),
                                      K[29] || (K[29] = e.createElementVNode(
                                        "i",
                                        { class: "ri-external-link-line" },
                                        null,
                                        -1
                                        /* CACHED */
                                      ))
                                    ])
                                  ])
                                ])
                              ])
                            ])
                          ]),
                          V.value ? (e.openBlock(), e.createElementBlock("p", GV, [
                            K[31] || (K[31] = e.createElementVNode(
                              "i",
                              { class: "ri-global-line" },
                              null,
                              -1
                              /* CACHED */
                            )),
                            e.createElementVNode("span", null, [
                              e.createTextVNode(
                                e.toDisplayString(A.$t("企业微信要求把这个 IP 加进应用的「企业可信 IP」：")),
                                1
                                /* TEXT */
                              ),
                              e.createElementVNode(
                                "b",
                                YV,
                                e.toDisplayString(V.value),
                                1
                                /* TEXT */
                              )
                            ]),
                            e.createElementVNode(
                              "button",
                              {
                                type: "button",
                                class: "ss-btn sm",
                                onClick: r
                              },
                              e.toDisplayString(A.$t("复制")),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode("button", {
                              type: "button",
                              class: "ss-link",
                              "data-test": "mm-setup-ip-open",
                              onClick: K[11] || (K[11] = (te) => e.unref(pe)(e.unref(ge).apps))
                            }, [
                              e.createTextVNode(
                                e.toDisplayString(A.$t("去应用管理填写")) + " ",
                                1
                                /* TEXT */
                              ),
                              K[30] || (K[30] = e.createElementVNode(
                                "i",
                                { class: "ri-external-link-line" },
                                null,
                                -1
                                /* CACHED */
                              ))
                            ])
                          ])) : e.createCommentVNode("v-if", !0),
                          a.value ? (e.openBlock(), e.createElementBlock(
                            "div",
                            {
                              key: 1,
                              class: e.normalizeClass(["ss-note", a.value.warnings?.length ? "warn" : "ok"]),
                              "data-test": "mm-setup-import-result"
                            },
                            [
                              e.createElementVNode(
                                "i",
                                {
                                  class: e.normalizeClass(a.value.warnings?.length ? "ri-alert-line" : "ri-checkbox-circle-line")
                                },
                                null,
                                2
                                /* CLASS */
                              ),
                              e.createElementVNode("div", null, [
                                e.createElementVNode(
                                  "p",
                                  null,
                                  e.toDisplayString(A.$t("已导入 {n} 人、{d} 个部门（新增 {a}，变更 {c}，不在表里的 {l} 人标为离职）", { n: a.value.people, d: a.value.depts, a: a.value.added.length, c: a.value.changed.length, l: a.value.left.length })),
                                  1
                                  /* TEXT */
                                ),
                                (e.openBlock(!0), e.createElementBlock(
                                  e.Fragment,
                                  null,
                                  e.renderList(a.value.warnings || [], (te, ue) => (e.openBlock(), e.createElementBlock(
                                    "p",
                                    { key: ue },
                                    e.toDisplayString(te),
                                    1
                                    /* TEXT */
                                  ))),
                                  128
                                  /* KEYED_FRAGMENT */
                                ))
                              ])
                            ],
                            2
                            /* CLASS */
                          )) : e.createCommentVNode("v-if", !0)
                        ])
                      ],
                      2112
                      /* STABLE_FRAGMENT, DEV_ROOT_FRAGMENT */
                    )) : o.value === "push" ? (e.openBlock(), e.createElementBlock(
                      e.Fragment,
                      { key: 2 },
                      [
                        e.createCommentVNode(" 3 通知推送 "),
                        e.createElementVNode("div", JV, [
                          e.createElementVNode(
                            "h3",
                            null,
                            e.toDisplayString(A.$t("通知推送")),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "p",
                            QV,
                            e.toDisplayString(A.$t("发言待确认、新任务、到期提醒这些通知发到哪里。不配也能用，通知只进系统内的消息中心。")),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "p",
                            {
                              class: e.normalizeClass(["ss-note", s.value.push.channel ? "ok" : "warn"]),
                              "data-test": "mm-setup-push-now"
                            },
                            [
                              e.createElementVNode(
                                "i",
                                {
                                  class: e.normalizeClass(s.value.push.channel ? "ri-checkbox-circle-line" : "ri-information-line")
                                },
                                null,
                                2
                                /* CLASS */
                              ),
                              e.createTextVNode(
                                " " + e.toDisplayString(s.value.push.channel === "app" ? A.$t("已连接企业微信自建应用：通知按人发卡片") : s.value.push.channel === "webhook" ? A.$t("已连接企微群机器人：通知发到群里") : A.$t("还没配置：通知只进消息中心")),
                                1
                                /* TEXT */
                              )
                            ],
                            2
                            /* CLASS */
                          ),
                          e.createElementVNode("article", ZV, [
                            e.createElementVNode("div", XV, [
                              e.createElementVNode(
                                "strong",
                                null,
                                e.toDisplayString(A.$t("企微群机器人（推荐，最省事）")),
                                1
                                /* TEXT */
                              ),
                              e.createElementVNode("button", {
                                type: "button",
                                class: "ss-link",
                                "data-test": "mm-setup-link-webhook-doc",
                                onClick: K[12] || (K[12] = (te) => e.unref(pe)(e.unref(ge).webhookDoc))
                              }, [
                                e.createTextVNode(
                                  e.toDisplayString(A.$t("查看企微官方说明")) + " ",
                                  1
                                  /* TEXT */
                                ),
                                K[32] || (K[32] = e.createElementVNode(
                                  "i",
                                  { class: "ri-external-link-line" },
                                  null,
                                  -1
                                  /* CACHED */
                                ))
                              ])
                            ]),
                            e.createElementVNode("ol", xV, [
                              e.createElementVNode(
                                "li",
                                null,
                                e.toDisplayString(A.$t("在企业微信里打开要接收通知的内部群，点右上角「…」")),
                                1
                                /* TEXT */
                              ),
                              e.createElementVNode(
                                "li",
                                null,
                                e.toDisplayString(A.$t("选「消息推送」（旧版叫「群机器人」）→「添加」→ 新建一个，名字可以叫「会议助手」")),
                                1
                                /* TEXT */
                              ),
                              e.createElementVNode(
                                "li",
                                null,
                                e.toDisplayString(A.$t("复制生成的 Webhook 地址，粘贴到下面保存，再点「测试发送」看群里有没有收到")),
                                1
                                /* TEXT */
                              )
                            ]),
                            e.createElementVNode("div", eE, [
                              e.withDirectives(e.createElementVNode("input", {
                                "onUpdate:modelValue": K[13] || (K[13] = (te) => P.value = te),
                                type: "password",
                                spellcheck: "false",
                                autocomplete: "off",
                                placeholder: s.value.push.hasWebhook ? A.$t("已配置 {m}，要换地址再粘贴", { m: s.value.push.webhookMasked }) : "https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=…",
                                "data-test": "mm-setup-hook"
                              }, null, 8, tE), [
                                [e.vModelText, P.value]
                              ]),
                              e.createElementVNode("button", {
                                type: "button",
                                class: "ss-btn primary sm",
                                disabled: m.value || !P.value.trim(),
                                "data-test": "mm-setup-hook-save",
                                onClick: me
                              }, [
                                e.createElementVNode(
                                  "i",
                                  {
                                    class: e.normalizeClass(c.value === "hook" ? "ri-loader-4-line spin" : "ri-save-line")
                                  },
                                  null,
                                  2
                                  /* CLASS */
                                ),
                                e.createTextVNode(
                                  e.toDisplayString(A.$t("保存")),
                                  1
                                  /* TEXT */
                                )
                              ], 8, lE),
                              e.createElementVNode("button", {
                                type: "button",
                                class: "ss-btn sm",
                                disabled: m.value || !s.value.push.hasWebhook,
                                "data-test": "mm-setup-hook-test",
                                onClick: Re
                              }, [
                                e.createElementVNode(
                                  "i",
                                  {
                                    class: e.normalizeClass(c.value === "hookTest" ? "ri-loader-4-line spin" : "ri-send-plane-line")
                                  },
                                  null,
                                  2
                                  /* CLASS */
                                ),
                                e.createTextVNode(
                                  e.toDisplayString(A.$t("测试发送")),
                                  1
                                  /* TEXT */
                                )
                              ], 8, nE)
                            ]),
                            U.value ? (e.openBlock(), e.createElementBlock(
                              "p",
                              {
                                key: 0,
                                class: e.normalizeClass(["ss-note", U.value.ok ? "ok" : "danger"]),
                                "data-test": "mm-setup-hook-result"
                              },
                              e.toDisplayString(U.value.ok ? A.$t("已发到群里，请到企微群里看一眼") : U.value.error),
                              3
                              /* TEXT, CLASS */
                            )) : e.createCommentVNode("v-if", !0)
                          ]),
                          e.createElementVNode("article", oE, [
                            e.createElementVNode(
                              "strong",
                              null,
                              e.toDisplayString(A.$t("让群消息真正提醒到人")),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "small",
                              null,
                              e.toDisplayString(A.$t("群机器人按手机号或企微账号提醒本人（对方企微里会有提醒）。导入的通讯录里带了就不用管；演示时可以把你自己的手机号填上，群里就会提醒到你。")),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "p",
                              aE,
                              e.toDisplayString(A.$t("现在能提醒到本人的：{a} / {b} 人", { a: s.value.org.mentionable, b: s.value.org.people })),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode("div", sE, [
                              e.createElementVNode(
                                "span",
                                rE,
                                e.toDisplayString(s.value.me.name),
                                1
                                /* TEXT */
                              ),
                              e.withDirectives(e.createElementVNode("input", {
                                "onUpdate:modelValue": K[14] || (K[14] = (te) => M.value = te),
                                type: "tel",
                                placeholder: A.$t("你的手机号"),
                                "data-test": "mm-setup-mobile"
                              }, null, 8, iE), [
                                [e.vModelText, M.value]
                              ]),
                              e.createElementVNode("button", {
                                type: "button",
                                class: "ss-btn sm",
                                disabled: m.value || M.value.trim() === (s.value.me.mobile || ""),
                                "data-test": "mm-setup-mobile-save",
                                onClick: tt
                              }, e.toDisplayString(A.$t("保存")), 9, cE)
                            ]),
                            e.createElementVNode(
                              "p",
                              dE,
                              e.toDisplayString(A.$t("其他人的手机号、企微账号在「系统设置 → 通讯录」里逐个填。")),
                              1
                              /* TEXT */
                            )
                          ])
                        ])
                      ],
                      2112
                      /* STABLE_FRAGMENT, DEV_ROOT_FRAGMENT */
                    )) : o.value === "mobile" ? (e.openBlock(), e.createElementBlock(
                      e.Fragment,
                      { key: 3 },
                      [
                        e.createCommentVNode(" 4 手机端 "),
                        e.createElementVNode("div", mE, [
                          e.createElementVNode(
                            "h3",
                            null,
                            e.toDisplayString(A.$t("手机端")),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "p",
                            uE,
                            e.toDisplayString(A.$t("同事用手机确认发言、接任务、录声纹，企微消息里的按钮也跳到这里。手机要和这台电脑在同一个网络。")),
                            1
                            /* TEXT */
                          ),
                          e.createVNode(zt)
                        ])
                      ],
                      2112
                      /* STABLE_FRAGMENT, DEV_ROOT_FRAGMENT */
                    )) : o.value === "voice" ? (e.openBlock(), e.createElementBlock(
                      e.Fragment,
                      { key: 4 },
                      [
                        e.createCommentVNode(" 5 声纹 "),
                        e.createElementVNode("div", pE, [
                          e.createElementVNode(
                            "h3",
                            null,
                            e.toDisplayString(A.$t("采集你的声纹")),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "p",
                            vE,
                            e.toDisplayString(A.$t("采集过声纹的人，上传会议录音后会被自动认出来。先录你自己的；其他同事可以扫码在手机上自己录，或管理员在「系统设置 → 声纹库」代为导入。")),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "p",
                            {
                              class: e.normalizeClass(["ss-note", s.value.me.voiceprint ? "ok" : "info"]),
                              "data-test": "mm-setup-voice-now"
                            },
                            [
                              e.createElementVNode(
                                "i",
                                {
                                  class: e.normalizeClass(s.value.me.voiceprint ? "ri-checkbox-circle-line" : "ri-mic-line")
                                },
                                null,
                                2
                                /* CLASS */
                              ),
                              e.createTextVNode(
                                " " + e.toDisplayString(s.value.me.voiceprint ? A.$t("{name} 的声纹已采集（重新录会覆盖）", { name: s.value.me.name }) : A.$t("{name} 还没有采集声纹", { name: s.value.me.name })) + " · " + e.toDisplayString(A.$t("全公司已采集 {a} / {b} 人", { a: s.value.voiceprints.collected, b: s.value.voiceprints.total })),
                                1
                                /* TEXT */
                              )
                            ],
                            2
                            /* CLASS */
                          ),
                          s.value.models.speaker ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock("p", kE, [
                            K[33] || (K[33] = e.createElementVNode(
                              "i",
                              { class: "ri-alert-line" },
                              null,
                              -1
                              /* CACHED */
                            )),
                            e.createTextVNode(
                              e.toDisplayString(A.$t("还没有下载声纹模型：请先在第 1 步下载。")),
                              1
                              /* TEXT */
                            )
                          ])),
                          e.createElementVNode("label", yE, [
                            e.withDirectives(e.createElementVNode(
                              "input",
                              {
                                "onUpdate:modelValue": K[15] || (K[15] = (te) => C.value = te),
                                type: "checkbox",
                                "data-test": "mm-setup-consent"
                              },
                              null,
                              512
                              /* NEED_PATCH */
                            ), [
                              [e.vModelCheckbox, C.value]
                            ]),
                            e.createElementVNode(
                              "span",
                              null,
                              e.toDisplayString(A.$t("我同意采集本人的声纹（声音特征），并在我确认会议发言后用其中我本人的发言补充声纹（最多保留最近 5 条），只用于在会议纪要里识别我的发言，保存在这台电脑上，可以随时在声纹库关闭补充或删除声纹。")),
                              1
                              /* TEXT */
                            )
                          ]),
                          e.createVNode(Rt, {
                            script: G.value,
                            disabled: m.value || !s.value.models.speaker,
                            onRecorded: K[16] || (K[16] = (te) => T.value = te),
                            onReset: K[17] || (K[17] = (te) => T.value = null)
                          }, null, 8, ["script", "disabled"]),
                          e.createElementVNode("div", gE, [
                            e.createElementVNode("button", {
                              type: "button",
                              class: "ss-btn primary",
                              disabled: m.value || !C.value || !T.value || !s.value.models.speaker,
                              "data-test": "mm-setup-voice-submit",
                              onClick: Kt
                            }, [
                              e.createElementVNode(
                                "i",
                                {
                                  class: e.normalizeClass(c.value === "voice" ? "ri-loader-4-line spin" : "ri-upload-2-line")
                                },
                                null,
                                2
                                /* CLASS */
                              ),
                              e.createTextVNode(
                                e.toDisplayString(A.$t("提交声纹")),
                                1
                                /* TEXT */
                              )
                            ], 8, fE),
                            e.createElementVNode("button", {
                              type: "button",
                              class: "ss-link",
                              disabled: m.value || !C.value || !s.value.models.speaker,
                              "data-test": "mm-setup-voice-import",
                              onClick: Ht
                            }, e.toDisplayString(A.$t("改用已有的录音文件")), 9, NE)
                          ]),
                          z.value ? (e.openBlock(), e.createElementBlock(
                            "p",
                            {
                              key: 1,
                              class: e.normalizeClass(["ss-note", z.value.ok ? "ok" : "danger"]),
                              "data-test": "mm-setup-voice-result"
                            },
                            e.toDisplayString(z.value.ok ? A.$t("声纹已采集（{s} 秒）", { s: z.value.seconds }) : z.value.error),
                            3
                            /* TEXT, CLASS */
                          )) : e.createCommentVNode("v-if", !0)
                        ])
                      ],
                      2112
                      /* STABLE_FRAGMENT, DEV_ROOT_FRAGMENT */
                    )) : o.value === "ai" ? (e.openBlock(), e.createElementBlock(
                      e.Fragment,
                      { key: 5 },
                      [
                        e.createCommentVNode(" 6 大模型 "),
                        e.createElementVNode("div", VE, [
                          e.createElementVNode(
                            "h3",
                            null,
                            e.toDisplayString(A.$t("大模型")),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "p",
                            EE,
                            e.toDisplayString(A.$t("整理议题和决议、生成执行方案、写周报和项目总结，用的是应用里当前选的大模型（会议转写和声纹不用它，只在本机）。")),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode("button", {
                            type: "button",
                            class: "ss-btn primary",
                            disabled: m.value,
                            "data-test": "mm-setup-llm-test",
                            onClick: Wt
                          }, [
                            e.createElementVNode(
                              "i",
                              {
                                class: e.normalizeClass(c.value === "llm" ? "ri-loader-4-line spin" : "ri-flashlight-line")
                              },
                              null,
                              2
                              /* CLASS */
                            ),
                            e.createTextVNode(
                              e.toDisplayString(A.$t("测试连接")),
                              1
                              /* TEXT */
                            )
                          ], 8, $E),
                          R.value ? (e.openBlock(), e.createElementBlock(
                            "p",
                            {
                              key: 0,
                              class: e.normalizeClass(["ss-note", R.value.ok ? "ok" : "warn"]),
                              "data-test": "mm-setup-llm-result"
                            },
                            [
                              e.createElementVNode(
                                "i",
                                {
                                  class: e.normalizeClass(R.value.ok ? "ri-checkbox-circle-line" : "ri-alert-line")
                                },
                                null,
                                2
                                /* CLASS */
                              ),
                              e.createTextVNode(
                                " " + e.toDisplayString(R.value.ok ? A.$t("大模型可用：回复「{r}」，用时 {s} 秒", { r: R.value.reply, s: ((R.value.ms || 0) / 1e3).toFixed(1) }) : A.$t("没连上大模型：纪要整理和拆任务会按规则兜底，效果差很多。请到应用的「设置 → 模型」里选一个能用的模型，再回来测试。")),
                                1
                                /* TEXT */
                              )
                            ],
                            2
                            /* CLASS */
                          )) : e.createCommentVNode("v-if", !0)
                        ])
                      ],
                      2112
                      /* STABLE_FRAGMENT, DEV_ROOT_FRAGMENT */
                    )) : o.value === "finish" ? (e.openBlock(), e.createElementBlock(
                      e.Fragment,
                      { key: 6 },
                      [
                        e.createCommentVNode(" 完成 "),
                        e.createElementVNode("div", bE, [
                          e.createElementVNode(
                            "h3",
                            null,
                            e.toDisplayString(A.$t("配置完成情况")),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode("ul", hE, [
                            (e.openBlock(), e.createElementBlock(
                              e.Fragment,
                              null,
                              e.renderList(n, (te) => e.createElementVNode(
                                "li",
                                {
                                  key: te.key,
                                  class: e.normalizeClass(le(te.key))
                                },
                                [
                                  e.createElementVNode(
                                    "i",
                                    {
                                      class: e.normalizeClass(le(te.key) === "done" ? "ri-checkbox-circle-fill" : "ri-error-warning-line")
                                    },
                                    null,
                                    2
                                    /* CLASS */
                                  ),
                                  e.createElementVNode(
                                    "strong",
                                    null,
                                    e.toDisplayString(te.title),
                                    1
                                    /* TEXT */
                                  ),
                                  e.createElementVNode(
                                    "span",
                                    null,
                                    e.toDisplayString(b(te.key)),
                                    1
                                    /* TEXT */
                                  ),
                                  le(te.key) !== "done" ? (e.openBlock(), e.createElementBlock("button", {
                                    key: 0,
                                    type: "button",
                                    class: "ss-link",
                                    onClick: (ue) => w(te.key)
                                  }, e.toDisplayString(A.$t("去配置")), 9, _E)) : e.createCommentVNode("v-if", !0)
                                ],
                                2
                                /* CLASS */
                              )),
                              64
                              /* STABLE_FRAGMENT */
                            ))
                          ]),
                          e.createElementVNode(
                            "p",
                            BE,
                            e.toDisplayString(A.$t("没配好的也可以先用，之后点右上角「配置引导」继续。")),
                            1
                            /* TEXT */
                          )
                        ])
                      ],
                      2112
                      /* STABLE_FRAGMENT, DEV_ROOT_FRAGMENT */
                    )) : e.createCommentVNode("v-if", !0),
                    h.value ? (e.openBlock(), e.createElementBlock("p", SE, [
                      K[34] || (K[34] = e.createElementVNode(
                        "i",
                        { class: "ri-error-warning-line" },
                        null,
                        -1
                        /* CACHED */
                      )),
                      e.createTextVNode(
                        e.toDisplayString(h.value),
                        1
                        /* TEXT */
                      )
                    ])) : e.createCommentVNode("v-if", !0)
                  ],
                  64
                  /* STABLE_FRAGMENT */
                )) : e.createCommentVNode("v-if", !0)
              ],
              64
              /* STABLE_FRAGMENT */
            ))
          ])
        ]),
        e.createElementVNode("footer", DE, [
          e.createElementVNode("button", {
            type: "button",
            class: "ss-btn",
            disabled: d.value <= 0,
            "data-test": "mm-setup-prev",
            onClick: K[18] || (K[18] = (te) => w(p[d.value - 1]))
          }, e.toDisplayString(A.$t("上一步")), 9, wE),
          K[35] || (K[35] = e.createElementVNode(
            "span",
            { class: "mm-grow" },
            null,
            -1
            /* CACHED */
          )),
          o.value !== "finish" && le(o.value) !== "done" ? (e.openBlock(), e.createElementBlock(
            "button",
            {
              key: 0,
              type: "button",
              class: "ss-link",
              "data-test": "mm-setup-skip",
              onClick: L
            },
            e.toDisplayString(A.$t("先跳过")),
            1
            /* TEXT */
          )) : e.createCommentVNode("v-if", !0),
          o.value !== "finish" ? (e.openBlock(), e.createElementBlock(
            "button",
            {
              key: 1,
              type: "button",
              class: "ss-btn primary",
              "data-test": "mm-setup-next",
              onClick: K[19] || (K[19] = (te) => w(p[d.value + 1]))
            },
            e.toDisplayString(A.$t("下一步")),
            1
            /* TEXT */
          )) : (e.openBlock(), e.createElementBlock("button", {
            key: 2,
            type: "button",
            class: "ss-btn primary",
            disabled: m.value,
            "data-test": "mm-setup-done",
            onClick: Gt
          }, e.toDisplayString(A.$t("完成")), 9, CE))
        ])
      ])
    ], 8, lV));
  }
}), IE = /* @__PURE__ */ oe(TE, [["__scopeId", "data-v-f1d1272c"]]), ME = {
  class: "mm-wb",
  "data-test": "mm-workbench"
}, AE = { class: "mm-head" }, jE = { class: "mm-head__top" }, LE = { class: "mm-head__sub" }, zE = ["title"], FE = ["disabled", "title"], PE = {
  key: 2,
  class: "ri-arrow-down-s-line"
}, UE = {
  key: 0,
  class: "mm-id__panel",
  "data-test": "mm-identity-panel"
}, OE = { class: "mm-id__tip" }, RE = ["placeholder"], qE = {
  key: 1,
  class: "mm-id__state"
}, KE = {
  key: 2,
  class: "mm-id__state danger"
}, HE = {
  key: 3,
  class: "mm-id__list"
}, WE = ["disabled", "data-test", "onClick"], GE = { class: "mm-id__name" }, YE = {
  key: 0,
  class: "mm-id__tag"
}, JE = {
  key: 0,
  class: "mm-id__state"
}, QE = {
  class: "mm-tabs",
  role: "tablist"
}, ZE = ["aria-selected", "data-test", "onClick"], XE = {
  key: 0,
  class: "mm-badge"
}, xE = {
  key: 0,
  class: "ss-note danger"
}, e$ = {
  key: 1,
  class: "ss-note"
}, t$ = {
  key: 0,
  class: "ss-note info mm-setup",
  "data-test": "mm-no-org"
}, l$ = ["disabled"], n$ = {
  key: 1,
  class: "ss-note warn"
}, Bt = "totalclaw:meeting-mgmt-tab:v1", o$ = /* @__PURE__ */ e.defineComponent({
  __name: "MeetingMgmtWorkbenchView",
  setup(l) {
    const u = [
      { key: "home", title: t.t("首页") },
      { key: "meetings", title: t.t("会议") },
      { key: "tasks", title: t.t("任务") },
      { key: "projects", title: t.t("项目") },
      { key: "settings", title: t.t("系统设置") }
    ], n = ie.useNotificationStore(), p = ne, f = e.computed(() => p.value?.me ?? null), s = e.computed(() => ye.value.tab), o = e.ref(""), d = e.ref(!1), i = e.ref(0), k = e.ref(null), h = e.reactive({}), m = e.ref(!1), c = e.computed(() => !!f.value?.isAdmin || (p.value?.settings.adminIds.length ?? 0) === 0), g = e.computed(() => !!p.value && (c.value || !!Ie.value)), N = e.computed(() => u.filter(($) => $.key !== "settings" || !!f.value?.isAdmin)), a = e.computed(() => `${f.value?.person?.id || "none"}:${i.value}`);
    function I($) {
      const b = p.value?.badges;
      return b ? $ === "home" ? b.home : $ === "meetings" ? b.meetings : $ === "tasks" ? b.tasks : 0 : 0;
    }
    function P($, b) {
      h[$] = typeof b == "string" ? b : "";
    }
    const U = e.computed(() => {
      if (s.value === "settings") return t.t("管理员");
      const $ = h[s.value];
      return $ || (f.value?.isAdmin ? t.t("管理员") : t.t("项目成员"));
    }), M = e.ref(null), C = e.ref(!1), T = e.ref(""), z = e.ref(!1), R = e.ref(""), _ = e.ref(!1), E = e.ref({ depts: [], people: [] }), v = e.computed(() => Ct(E.value, T.value)), S = e.computed(() => E.value.people.find(($) => $.id === Ie.value)?.name || ""), j = ($) => (p.value?.settings.adminIds || []).includes($);
    async function J() {
      if (g.value) {
        C.value = !0, T.value = "", z.value = !0, R.value = "";
        try {
          E.value = await De();
        } catch ($) {
          R.value = Z.errorMessage($);
        } finally {
          z.value = !1;
        }
      }
    }
    function y() {
      if (C.value) {
        C.value = !1;
        return;
      }
      J();
    }
    async function V($) {
      if (!_.value) {
        if ($ === f.value?.person?.id) {
          C.value = !1;
          return;
        }
        _.value = !0;
        try {
          await Y("identity.set", { personId: $ }), await ce(), C.value = !1;
          const b = f.value?.person?.name || "";
          n.success(t.t("当前身份已切换为 {name}", { name: b }));
        } catch (b) {
          R.value = Z.errorMessage(b), n.error(Z.errorMessage(b));
        } finally {
          _.value = !1;
        }
      }
    }
    function r($) {
      if (!C.value) return;
      const b = M.value;
      b && $.target instanceof Node && b.contains($.target) || (C.value = !1);
    }
    async function W() {
      o.value = "";
      try {
        await ce();
      } catch ($) {
        o.value = Z.errorMessage($);
      }
    }
    async function X() {
      if (!d.value) {
        d.value = !0;
        try {
          await Y("demo.load"), He(), await ce(), i.value += 1, n.success(t.t("演示数据已载入"));
        } catch ($) {
          n.error(Z.errorMessage($));
        } finally {
          d.value = !1;
        }
      }
    }
    let ae = null;
    function q() {
      ae || (ae = setTimeout(() => {
        ae = null, ce().catch(() => {
        });
        try {
          k.value?.refresh?.();
        } catch {
        }
      }, 300));
    }
    const H = e.computed(() => !!p.value && !f.value?.person && p.value.org.peopleCount > 0 && !!p.value.canSwitchIdentity);
    e.watch(() => p.value?.setupPending, ($) => {
      $ && !yt.value && (yt.value = !0, m.value = !0);
    }, { immediate: !0 }), e.watch(H, ($) => {
      $ && (m.value = !0);
    }, { immediate: !0 });
    function ee() {
      m.value = !1, He(), i.value += 1, n.success(t.t("配置已保存，可以开始使用了"));
    }
    e.watch(() => f.value, ($) => {
      $?.isAdmin && $.person?.id && ol($.person.id);
    }, { immediate: !0 }), e.watch(() => f.value?.person?.id, () => {
      for (const $ of Object.keys(h)) delete h[$];
    }), e.watch([s, () => f.value?.isAdmin, p], () => {
      p.value && s.value === "settings" && !f.value?.isAdmin && _e("home");
    }), e.watch(s, ($) => {
      try {
        localStorage.setItem(Bt, $);
      } catch {
      }
    });
    let le = null;
    return e.onMounted(() => {
      if (ye.value.seq === 0)
        try {
          const $ = localStorage.getItem(Bt);
          $ && u.some((b) => b.key === $) && $ !== "home" && _e($);
        } catch {
        }
      W(), le = Se(($) => {
        $ && ($.type === "changed" ? (($.scope === "org" || $.scope === "all") && He(), q()) : $.type === "mobile" && p.value && (p.value = { ...p.value, mobile: { running: $.running, url: $.url } }));
      }), document.addEventListener("mousedown", r);
    }), e.onBeforeUnmount(() => {
      le?.(), ae && clearTimeout(ae), document.removeEventListener("mousedown", r);
    }), ($, b) => (e.openBlock(), e.createElementBlock("div", ME, [
      e.createElementVNode("section", AE, [
        e.createElementVNode("div", jE, [
          e.createVNode(Qt),
          b[11] || (b[11] = e.createElementVNode(
            "span",
            {
              class: "mm-mark",
              "aria-hidden": "true"
            },
            null,
            -1
            /* CACHED */
          )),
          e.createElementVNode(
            "h1",
            null,
            e.toDisplayString($.$t("泰途会议智能管理")),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "p",
            LE,
            e.toDisplayString($.$t("会议 → 纪要 → 任务 → 跟进 → 归档，全流程闭环")),
            1
            /* TEXT */
          ),
          b[12] || (b[12] = e.createElementVNode(
            "span",
            { class: "mm-grow" },
            null,
            -1
            /* CACHED */
          )),
          e.unref(p) ? (e.openBlock(), e.createElementBlock("span", {
            key: 0,
            class: e.normalizeClass(["mm-wecom", { on: e.unref(p).wecomConnected || e.unref(p).pushChannel === "webhook" }]),
            title: e.unref(p).wecomConnected ? $.$t("通讯录与消息卡片走企业微信") : e.unref(p).pushChannel === "webhook" ? $.$t("通知发到企微群（群机器人）") : $.$t("没有配置企业微信：通知只进系统内消息中心"),
            "data-test": "mm-wecom"
          }, e.toDisplayString(e.unref(p).wecomConnected ? $.$t("企微已连接") : e.unref(p).pushChannel === "webhook" ? $.$t("群机器人已连接") : $.$t("未连接企微")), 11, zE)) : e.createCommentVNode("v-if", !0),
          e.unref(p) && (f.value?.isAdmin || H.value) ? (e.openBlock(), e.createElementBlock("button", {
            key: 1,
            type: "button",
            class: "ss-btn sm",
            "data-test": "mm-setup-open",
            onClick: b[0] || (b[0] = (B) => m.value = !0)
          }, [
            b[8] || (b[8] = e.createElementVNode(
              "i",
              { class: "ri-settings-4-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString($.$t("配置引导")),
              1
              /* TEXT */
            )
          ])) : e.createCommentVNode("v-if", !0),
          e.createElementVNode(
            "div",
            {
              ref_key: "idRoot",
              ref: M,
              class: "mm-id"
            },
            [
              e.createElementVNode("button", {
                type: "button",
                class: e.normalizeClass(["mm-id__pill", { switchable: g.value }]),
                disabled: !e.unref(p),
                title: g.value ? $.$t("切换当前身份") : $.$t("只有管理员可以切换身份"),
                "data-test": "mm-identity",
                onClick: y
              }, [
                f.value?.person ? (e.openBlock(), e.createElementBlock(
                  e.Fragment,
                  { key: 0 },
                  [
                    e.createTextVNode(
                      e.toDisplayString(U.value) + " · " + e.toDisplayString(f.value.person.name),
                      1
                      /* TEXT */
                    )
                  ],
                  64
                  /* STABLE_FRAGMENT */
                )) : (e.openBlock(), e.createElementBlock(
                  e.Fragment,
                  { key: 1 },
                  [
                    e.createTextVNode(
                      e.toDisplayString($.$t("选择身份")),
                      1
                      /* TEXT */
                    )
                  ],
                  64
                  /* STABLE_FRAGMENT */
                )),
                g.value ? (e.openBlock(), e.createElementBlock("i", PE)) : e.createCommentVNode("v-if", !0)
              ], 10, FE),
              C.value ? (e.openBlock(), e.createElementBlock("div", UE, [
                e.createElementVNode(
                  "p",
                  OE,
                  e.toDisplayString($.$t("切换后按这个人的角色显示按钮（管理员代办、演示用）")),
                  1
                  /* TEXT */
                ),
                e.unref(Ie) && e.unref(Ie) !== f.value?.person?.id && S.value ? (e.openBlock(), e.createElementBlock("button", {
                  key: 0,
                  type: "button",
                  class: "mm-id__back",
                  onClick: b[1] || (b[1] = (B) => V(e.unref(Ie)))
                }, [
                  b[9] || (b[9] = e.createElementVNode(
                    "i",
                    { class: "ri-arrow-go-back-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString($.$t("回到 {name}（管理员）", { name: S.value })),
                    1
                    /* TEXT */
                  )
                ])) : e.createCommentVNode("v-if", !0),
                e.withDirectives(e.createElementVNode("input", {
                  "onUpdate:modelValue": b[2] || (b[2] = (B) => T.value = B),
                  class: "mm-id__search",
                  type: "search",
                  placeholder: $.$t("搜索姓名")
                }, null, 8, RE), [
                  [e.vModelText, T.value]
                ]),
                z.value ? (e.openBlock(), e.createElementBlock("p", qE, [
                  b[10] || (b[10] = e.createElementVNode(
                    "i",
                    { class: "ri-loader-4-line spin" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString($.$t("正在加载人员…")),
                    1
                    /* TEXT */
                  )
                ])) : R.value ? (e.openBlock(), e.createElementBlock(
                  "p",
                  KE,
                  e.toDisplayString(R.value),
                  1
                  /* TEXT */
                )) : (e.openBlock(), e.createElementBlock("div", HE, [
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(v.value, (B) => (e.openBlock(), e.createElementBlock(
                      e.Fragment,
                      {
                        key: B.id
                      },
                      [
                        e.createElementVNode(
                          "h5",
                          null,
                          e.toDisplayString(B.name),
                          1
                          /* TEXT */
                        ),
                        (e.openBlock(!0), e.createElementBlock(
                          e.Fragment,
                          null,
                          e.renderList(B.people, (D) => (e.openBlock(), e.createElementBlock("button", {
                            key: D.id,
                            type: "button",
                            class: e.normalizeClass(["mm-id__row", { on: D.id === f.value?.person?.id }]),
                            disabled: _.value,
                            "data-test": `mm-identity-${D.id}`,
                            onClick: (O) => V(D.id)
                          }, [
                            e.createElementVNode(
                              "span",
                              {
                                class: "mm-av",
                                style: e.normalizeStyle({ background: e.unref(re)(D.name).color })
                              },
                              e.toDisplayString(e.unref(re)(D.name).text),
                              5
                              /* TEXT, STYLE */
                            ),
                            e.createElementVNode(
                              "span",
                              GE,
                              e.toDisplayString(D.name),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "small",
                              null,
                              e.toDisplayString(D.title || ""),
                              1
                              /* TEXT */
                            ),
                            j(D.id) ? (e.openBlock(), e.createElementBlock(
                              "span",
                              YE,
                              e.toDisplayString($.$t("管理员")),
                              1
                              /* TEXT */
                            )) : e.createCommentVNode("v-if", !0)
                          ], 10, WE))),
                          128
                          /* KEYED_FRAGMENT */
                        ))
                      ],
                      64
                      /* STABLE_FRAGMENT */
                    ))),
                    128
                    /* KEYED_FRAGMENT */
                  )),
                  v.value.length ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock(
                    "p",
                    JE,
                    e.toDisplayString($.$t("找不到人员请联系管理员同步通讯录")),
                    1
                    /* TEXT */
                  ))
                ]))
              ])) : e.createCommentVNode("v-if", !0)
            ],
            512
            /* NEED_PATCH */
          )
        ]),
        e.createElementVNode("nav", QE, [
          (e.openBlock(!0), e.createElementBlock(
            e.Fragment,
            null,
            e.renderList(N.value, (B) => (e.openBlock(), e.createElementBlock("button", {
              key: B.key,
              type: "button",
              role: "tab",
              class: e.normalizeClass(["mm-tab", { active: s.value === B.key }]),
              "aria-selected": s.value === B.key,
              "data-test": `mm-tab-${B.key}`,
              onClick: (D) => e.unref(_e)(B.key)
            }, [
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(B.title),
                1
                /* TEXT */
              ),
              I(B.key) ? (e.openBlock(), e.createElementBlock(
                "em",
                XE,
                e.toDisplayString(I(B.key)),
                1
                /* TEXT */
              )) : e.createCommentVNode("v-if", !0)
            ], 10, ZE))),
            128
            /* KEYED_FRAGMENT */
          ))
        ])
      ]),
      o.value && !e.unref(p) ? (e.openBlock(), e.createElementBlock("p", xE, [
        b[13] || (b[13] = e.createElementVNode(
          "i",
          { class: "ri-error-warning-line" },
          null,
          -1
          /* CACHED */
        )),
        e.createElementVNode(
          "span",
          null,
          e.toDisplayString(o.value),
          1
          /* TEXT */
        ),
        e.createElementVNode(
          "button",
          {
            type: "button",
            class: "ss-link",
            onClick: W
          },
          e.toDisplayString($.$t("重试")),
          1
          /* TEXT */
        )
      ])) : e.unref(p) ? (e.openBlock(), e.createElementBlock(
        e.Fragment,
        { key: 2 },
        [
          e.unref(p).org.peopleCount === 0 ? (e.openBlock(), e.createElementBlock("p", t$, [
            b[15] || (b[15] = e.createElementVNode(
              "i",
              { class: "ri-team-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(c.value ? $.$t("还没有组织人员：可在「系统设置 → 通讯录同步」同步企业微信通讯录，也可以先载入演示数据走一遍全流程。") : $.$t("还没有组织人员，请联系管理员同步通讯录。")),
              1
              /* TEXT */
            ),
            c.value ? (e.openBlock(), e.createElementBlock("button", {
              key: 0,
              type: "button",
              class: "ss-btn sm primary",
              disabled: d.value,
              "data-test": "mm-demo-load",
              onClick: X
            }, [
              e.createElementVNode(
                "i",
                {
                  class: e.normalizeClass(d.value ? "ri-loader-4-line spin" : "ri-magic-line")
                },
                null,
                2
                /* CLASS */
              ),
              e.createTextVNode(
                e.toDisplayString($.$t("载入演示数据")),
                1
                /* TEXT */
              )
            ], 8, l$)) : e.createCommentVNode("v-if", !0)
          ])) : f.value?.person ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock("p", n$, [
            b[16] || (b[16] = e.createElementVNode(
              "i",
              { class: "ri-user-search-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString($.$t("还没有选择当前身份：点右上角选择你是谁，按钮按你的角色显示。")),
              1
              /* TEXT */
            ),
            g.value ? (e.openBlock(), e.createElementBlock(
              "button",
              {
                key: 0,
                type: "button",
                class: "ss-btn sm",
                onClick: J
              },
              e.toDisplayString($.$t("选择身份")),
              1
              /* TEXT */
            )) : e.createCommentVNode("v-if", !0)
          ])),
          (e.openBlock(), e.createElementBlock("div", {
            key: a.value,
            class: "mm-body"
          }, [
            s.value === "home" ? (e.openBlock(), e.createBlock(
              co,
              {
                key: 0,
                ref_key: "tabRef",
                ref: k,
                onRole: b[3] || (b[3] = (B) => P("home", B))
              },
              null,
              512
              /* NEED_PATCH */
            )) : s.value === "meetings" ? (e.openBlock(), e.createBlock(
              Yc,
              {
                key: 1,
                ref_key: "tabRef",
                ref: k,
                onRole: b[4] || (b[4] = (B) => P("meetings", B))
              },
              null,
              512
              /* NEED_PATCH */
            )) : s.value === "tasks" ? (e.openBlock(), e.createBlock(
              Vu,
              {
                key: 2,
                ref_key: "tabRef",
                ref: k,
                onRole: b[5] || (b[5] = (B) => P("tasks", B))
              },
              null,
              512
              /* NEED_PATCH */
            )) : s.value === "projects" ? (e.openBlock(), e.createBlock(
              uk,
              {
                key: 3,
                ref_key: "tabRef",
                ref: k,
                onRole: b[6] || (b[6] = (B) => P("projects", B))
              },
              null,
              512
              /* NEED_PATCH */
            )) : s.value === "settings" ? (e.openBlock(), e.createBlock(
              tV,
              {
                key: 4,
                ref_key: "tabRef",
                ref: k
              },
              null,
              512
              /* NEED_PATCH */
            )) : e.createCommentVNode("v-if", !0)
          ]))
        ],
        64
        /* STABLE_FRAGMENT */
      )) : (e.openBlock(), e.createElementBlock("p", e$, [
        b[14] || (b[14] = e.createElementVNode(
          "i",
          { class: "ri-loader-4-line spin" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString($.$t("正在加载工作台…")),
          1
          /* TEXT */
        )
      ])),
      m.value ? (e.openBlock(), e.createBlock(IE, {
        key: 3,
        onClose: b[7] || (b[7] = (B) => m.value = !1),
        onDone: ee
      })) : e.createCommentVNode("v-if", !0)
    ]));
  }
}), s$ = /* @__PURE__ */ oe(o$, [["__scopeId", "data-v-dba3778c"]]), kt = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["npm:pinyin-pro"];
if (!kt) throw new Error("宿主模块未就绪：npm:pinyin-pro");
kt.default;
const a$ = /* @__PURE__ */ Jt({
  __proto__: null
}, [kt]);
export {
  s$ as default
};
