function Wt(l, p) {
  for (var n = 0; n < p.length; n++) {
    const u = p[n];
    if (typeof u != "string" && !Array.isArray(u)) {
      for (const f in u)
        if (f !== "default" && !(f in l)) {
          const s = Object.getOwnPropertyDescriptor(u, f);
          s && Object.defineProperty(l, f, s.get ? s : {
            enumerable: !0,
            get: () => u[f]
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
const se = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/stores/notification.ts"];
if (!se) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/stores/notification.ts");
se.default;
const _t = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/components/PageBackButton.vue"];
if (!_t) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/components/PageBackButton.vue");
const Gt = _t.default, st = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/utils/ipcPlain.ts"];
if (!st) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/utils/ipcPlain.ts");
st.default;
const X = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/workbenches/service-settlement/shared.ts"];
if (!X) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/workbenches/service-settlement/shared.ts");
X.default;
async function W(l, p) {
  const n = window.electronAPI?.workbenches?.meetingMgmt;
  if (!n?.invoke) throw new Error(t.t("泰途会议智能管理接口不可用，请重启应用"));
  return n.invoke(l, st.toPlain(p ?? {}));
}
function _e(l) {
  const p = window.electronAPI?.workbenches?.meetingMgmt;
  return p?.onEvent ? p.onEvent(l) : () => {
  };
}
const te = e.ref(null), vt = e.ref(!1);
async function ie() {
  const l = await W("boot");
  return te.value = l, l;
}
const Ke = e.ref(""), ke = e.ref({ tab: "home", seq: 0 });
function he(l) {
  ke.value = { tab: l, seq: ke.value.seq + 1 };
}
const xe = e.ref("");
function Yt(l) {
  xe.value = l, he("settings");
}
function de(l) {
  const p = l.kind === "task" ? "tasks" : l.kind === "meeting" || l.kind === "meeting_plan" ? "meetings" : "projects";
  ke.value = { tab: p, link: l, seq: ke.value.seq + 1 };
}
const Je = {
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
}, Bt = [
  { key: "upload", label: t.t("上传"), statuses: ["pending_upload"] },
  { key: "process", label: t.t("处理"), statuses: ["processing", "failed", "pending_assign"] },
  { key: "confirm", label: t.t("发言确认"), statuses: ["pending_confirm"] },
  { key: "review", label: t.t("终审"), statuses: ["pending_review"] },
  { key: "final", label: t.t("定稿"), statuses: ["finalized", "ended"] },
  { key: "plan", label: t.t("方案"), statuses: ["pending_owner", "plan_confirm"] },
  { key: "dispatched", label: t.t("已派发"), statuses: ["dispatched"] }
];
function Jt(l) {
  const p = Bt.findIndex((n) => n.statuses.includes(l));
  return p < 0 ? 0 : p;
}
const et = {
  offline: t.t("线下"),
  tencent: t.t("腾讯会议"),
  zoom: t.t("Zoom")
}, Fe = {
  to_accept: t.t("待接收"),
  not_started: t.t("未开始"),
  in_progress: t.t("进行中"),
  done: t.t("已完成"),
  cancelled: t.t("已取消")
};
function rt(l) {
  return l ? l.stage === "review" ? t.t("异议处理中 · 待复核") : l.stage === "dept_reply" ? t.t("异议处理中 · 待部门回应") : l.stage === "arbitration" ? t.t("异议处理中 · 待裁决") : "" : "";
}
const tt = {
  content: t.t("任务内容"),
  time: t.t("时间节点"),
  requirement: t.t("执行要求")
}, He = {
  active: t.t("进行中"),
  closing: t.t("结项中"),
  archived: t.t("已归档")
}, Qt = {
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
}, Zt = {
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
}, Xt = {
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
}, kt = ["#e05a8a", "#3b82f6", "#f59e0b", "#8b5cf6", "#ef4444", "#0ea5a4", "#16a34a", "#6366f1", "#d97706", "#0284c7"];
function oe(l) {
  const p = String(l || "?");
  let n = 0;
  for (const u of p) n = n * 31 + u.charCodeAt(0) >>> 0;
  return { text: p.slice(0, 1), color: kt[n % kt.length] };
}
const it = (l) => l && /^\d{4}-\d{2}-\d{2}$/.test(l) ? l.slice(5) : l || "-";
function lt(l) {
  if (!l) return "-";
  const p = new Date(l), n = (u) => String(u).padStart(2, "0");
  return `${p.getFullYear()}-${n(p.getMonth() + 1)}-${n(p.getDate())}`;
}
function Te(l) {
  const p = Math.max(0, Math.floor(l || 0)), n = Math.floor(p / 3600), u = Math.floor(p % 3600 / 60), f = p % 60, s = (a) => String(a).padStart(2, "0");
  return n ? `${n}:${s(u)}:${s(f)}` : `${s(u)}:${s(f)}`;
}
function xt(l, p = Date.now()) {
  if (!l) return "";
  const n = p - l;
  if (n < 6e4) return t.t("刚刚");
  if (n < 36e5) return t.t("{n} 分钟前", { n: Math.floor(n / 6e4) });
  const u = new Date(l), f = (i) => String(i).padStart(2, "0"), s = new Date(p), a = new Date(p - 864e5), m = `${f(u.getHours())}:${f(u.getMinutes())}`;
  return u.toDateString() === s.toDateString() ? t.t("今天 {t}", { t: m }) : u.toDateString() === a.toDateString() ? t.t("昨天 {t}", { t: m }) : `${f(u.getMonth() + 1)}-${f(u.getDate())} ${m}`;
}
const nt = e.ref(!1), gt = e.ref(""), St = "totalclaw:meeting-mgmt-operator:v1";
function el() {
  try {
    return localStorage.getItem(St) || "";
  } catch {
    return "";
  }
}
const we = e.ref(el());
function tl(l) {
  we.value = l;
  try {
    localStorage.setItem(St, l);
  } catch {
  }
}
let Ce = null;
function Be(l = !1) {
  if (!l && Ce && Date.now() - Ce.at < 3e4) return Ce.data;
  const p = W("people.list").then((n) => ({ depts: n?.depts ?? [], people: n?.people ?? [] }));
  return Ce = { at: Date.now(), data: p }, p.catch(() => {
    Ce = null;
  }), p;
}
function qe() {
  Ce = null;
}
function Dt(l, p = "", n) {
  const u = p.trim().toLowerCase(), f = l.people.filter((i) => !i.left && !0 && (!u || i.name.toLowerCase().includes(u) || (i.title || "").toLowerCase().includes(u))), s = [], a = /* @__PURE__ */ new Set();
  for (const i of l.depts) {
    const g = f.filter((b) => b.deptId === i.id);
    a.add(i.id), g.length && s.push({ id: i.id, name: i.name, people: g });
  }
  const m = f.filter((i) => !a.has(i.deptId));
  return m.length && s.push({ id: "", name: t.t("其他"), people: m }), s;
}
const ve = (l) => String(l).padStart(2, "0");
function Ee(l) {
  if (!l) return "-";
  const p = new Date(l);
  return `${p.getFullYear()}-${ve(p.getMonth() + 1)}-${ve(p.getDate())} ${ve(p.getHours())}:${ve(p.getMinutes())}`;
}
function wt(l) {
  if (!l) return "-";
  const p = new Date(l);
  return `${ve(p.getMonth() + 1)}-${ve(p.getDate())}`;
}
function We(l) {
  const p = new Date(l);
  return `${p.getFullYear()}-${ve(p.getMonth() + 1)}-${ve(p.getDate())}`;
}
function ll(l) {
  const p = new Date(l);
  return `${We(l)}T${ve(p.getHours())}:${ve(p.getMinutes())}`;
}
function nl(l) {
  const p = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(l || "");
  return p ? new Date(+p[1], +p[2] - 1, +p[3], +p[4], +p[5]).getTime() : NaN;
}
function al(l) {
  const p = Number(l) || 0;
  return p >= 1024 ** 3 ? `${(p / 1024 ** 3).toFixed(2)} GB` : p >= 1024 ** 2 ? `${(p / 1024 ** 2).toFixed(1)} MB` : p >= 1024 ? `${Math.round(p / 1024)} KB` : `${p} B`;
}
function ol(l) {
  const p = Math.round(Number(l) || 0);
  if (!p) return "";
  const n = Math.max(1, Math.round(p / 60));
  return n < 60 ? t.t("{n} 分钟", { n }) : t.t("{h} 小时 {m} 分", { h: Math.floor(n / 60), m: ve(n % 60) });
}
function sl(l) {
  const p = Math.max(0, Math.floor(l / 1e3));
  if (p < 60) return t.t("{n} 秒", { n: p });
  const n = Math.floor(p / 60);
  return n < 60 ? t.t("{m} 分 {s} 秒", { m: n, s: p % 60 }) : t.t("{h} 小时 {m} 分", { h: Math.floor(n / 60), m: ve(n % 60) });
}
function rl(l) {
  return l >= 5 && l < 11 ? t.t("早上好") : l >= 11 && l < 13 ? t.t("中午好") : l >= 13 && l < 18 ? t.t("下午好") : t.t("晚上好");
}
const il = () => [t.t("周日"), t.t("周一"), t.t("周二"), t.t("周三"), t.t("周四"), t.t("周五"), t.t("周六")];
function yt(l, p = Date.now()) {
  const n = /^(\d{4})-(\d{2})-(\d{2})$/.exec(l || "");
  if (!n) return { day: "", md: l || "-" };
  const u = `${n[2]}-${n[3]}`;
  if (l === We(p)) return { day: t.t("今天"), md: u };
  if (l === We(p + 864e5)) return { day: t.t("明天"), md: u };
  const f = new Date(+n[1], +n[2] - 1, +n[3]).getDay();
  return { day: il()[f], md: u };
}
const Le = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九", "十"];
function cl(l) {
  const p = l + 1;
  let n = !1;
  try {
    n = String(t.i18n.global.locale.value || "zh-CN") === "zh-CN";
  } catch {
    n = !0;
  }
  if (!n) return String(p);
  const u = Le[10];
  return p <= 10 ? Le[p] : p < 20 ? u + Le[p - 10] : p < 100 ? Le[Math.floor(p / 10)] + u + (p % 10 ? Le[p % 10] : "") : String(p);
}
const ct = {
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
}, Ie = {
  extract: t.t("提取音轨"),
  transcribe: t.t("转写"),
  diarize: t.t("识别发言人"),
  parse: t.t("解析文字记录"),
  organize: t.t("AI 整理纪要"),
  done: t.t("处理完成")
}, ft = {
  audio: t.t("录音"),
  video: t.t("录屏"),
  transcript: t.t("文字记录")
};
function Et(l, p) {
  const n = Array.isArray(l) ? l : [], u = {
    all: n.length,
    meeting: n.filter((a) => a.group === "meeting").length,
    task: n.filter((a) => a.group === "task").length,
    project: n.filter((a) => a.group === "project").length
  }, f = p === "all" ? n : n.filter((a) => a.group === p), s = (a) => f.filter((m) => m.urgency === a).sort((m, i) => (m.at || 0) - (i.at || 0));
  return { counts: u, urgent: s("urgent"), today: s("today"), week: s("week") };
}
function dl(l) {
  if (!l) return "";
  const p = l.me?.person?.name;
  if (p && (l.projects || []).some((u) => u.ownerName === p)) return t.t("项目负责人");
  const n = new Set((l.todos || []).map((u) => u.type));
  return n.has("arbitrate") || n.has("review_report") ? t.t("项目负责人") : n.has("review_minutes") || n.has("assign_speaker") || n.has("decide_tasks") || n.has("assign_owner") || n.has("retry_process") ? t.t("主持人") : n.has("confirm_plan") || n.has("review_objection") ? t.t("任务负责人") : n.has("accept_task") || n.has("update_progress") || n.has("dept_reply") ? t.t("部门负责人") : n.has("confirm_speech") ? t.t("发言人") : l.me?.isAdmin ? t.t("管理员") : t.t("项目成员");
}
function ml(l, p) {
  if (!l) return "";
  const n = l.meeting.status;
  return l.my.isPlanOwner && (n === "plan_confirm" || n === "dispatched") ? t.t("任务负责人") : l.my.isHost ? t.t("主持人") : l.my.isPlanOwner ? t.t("任务负责人") : l.my.isSpeaker ? t.t("发言人") : p && l.meeting.attendeeIds.includes(p) ? t.t("参会人") : t.t("项目成员");
}
function Me(l, p) {
  return l.speakers.find((n) => n.label === p)?.personId;
}
function Qe(l, p) {
  const n = Me(l.meeting, p);
  return n && l.names[n] ? l.names[n].name : t.t("未识别 {label}", { label: p });
}
function ul(l, p, n) {
  if (l.my.myLabels.includes(p)) return !0;
  const u = Me(l.meeting, p);
  return !!n && u === n;
}
function pl(l) {
  const p = l.meeting, n = new Map(p.segments.map((m) => [m.id, m])), u = /* @__PURE__ */ new Set(), f = [], s = (m) => {
    const i = [];
    for (const g of m) {
      const b = n.get(g);
      if (!b) continue;
      const d = Qe(l, b.speakerLabel);
      i.includes(d) || i.push(d);
    }
    return i;
  };
  for (const m of p.topics || []) {
    const i = (m.segmentIds || []).filter((g) => n.has(g));
    i.forEach((g) => u.add(g)), f.push({ id: m.id, title: m.title, segmentIds: i, speakers: s(i) });
  }
  const a = p.segments.filter((m) => !u.has(m.id)).sort((m, i) => m.start - i.start).map((m) => m.id);
  return a.length && f.push({ id: "__rest", title: f.length ? t.t("其他发言") : t.t("全部发言"), segmentIds: a, speakers: s(a) }), f;
}
function vl(l, p) {
  const n = l?.log?.length ? l.log[l.log.length - 1].at : void 0;
  return Math.max(p || 0, n || 0, l?.startedAt || 0) || void 0;
}
const kl = 10 * 6e4, Ct = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["npm:qrcode"];
if (!Ct) throw new Error("宿主模块未就绪：npm:qrcode");
const Tt = Ct.default;
function Se(l) {
  return !!l.objection && l.objection.stage !== "resolved";
}
function gl(l) {
  if (Se(l)) {
    const p = l.objection.stage;
    if (p === "review") return t.t("待复核");
    if (p === "dept_reply") return t.t("待部门回应");
    if (p === "arbitration") return t.t("待裁决");
  }
  return Fe[l.status] ?? l.status;
}
function yl(l) {
  return Se(l) ? rt(l.objection) : Fe[l.status] ?? l.status;
}
function It(l) {
  if (Se(l)) return "bad";
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
function fl(l) {
  return l.status === "done" || l.status === "cancelled" ? "done" : l.status === "to_accept" || Se(l) ? "action" : "doing";
}
function Nt(l) {
  const p = (n) => n.status === "done" || n.status === "cancelled" ? 1 : 0;
  return [...l].sort((n, u) => p(n) - p(u) || +!!u.overdue - +!!n.overdue || String(n.due || "9999").localeCompare(String(u.due || "9999")) || String(n.title).localeCompare(String(u.title)));
}
function El(l, p) {
  if (p === "status")
    return [
      { key: "action", title: t.t("需要处理") },
      { key: "doing", title: t.t("进行中") },
      { key: "done", title: t.t("已完成") }
    ].map((f) => ({ key: f.key, title: f.title, tasks: Nt(l.filter((s) => fl(s) === f.key)), collapsedByDefault: f.key === "done" })).filter((f) => f.tasks.length > 0);
  const n = /* @__PURE__ */ new Map();
  for (const u of l) {
    const f = p === "project" ? u.projectId : u.deptId, s = (p === "project" ? u.projectName : u.deptName) || t.t("未分类"), a = n.get(f) ?? { title: s, tasks: [] };
    a.tasks.push(u), n.set(f, a);
  }
  return [...n.entries()].map(([u, f]) => ({ key: u, title: f.title, tasks: Nt(f.tasks), collapsedByDefault: !1 })).sort((u, f) => u.title.localeCompare(f.title, "zh-CN"));
}
function Nl(l, p) {
  const n = p.trim().toLowerCase();
  return n ? l.filter((u) => [u.title, u.meetingTitle, u.deptName, u.assigneeName, u.ownerName, u.projectName, u.standard].some((f) => String(f || "").toLowerCase().includes(n))) : l;
}
function ge(l) {
  const p = Number(l);
  return Number.isFinite(p) ? Math.max(0, Math.min(100, Math.round(p))) : 0;
}
function dt(l, p) {
  return p > 0 ? ge(l / p * 100) : 0;
}
const pe = (l) => String(l).padStart(2, "0");
function ye(l, p = !1) {
  if (!l) return "—";
  const n = new Date(l), u = `${n.getFullYear()}-${pe(n.getMonth() + 1)}-${pe(n.getDate())} ${pe(n.getHours())}:${pe(n.getMinutes())}`;
  return p ? `${u}:${pe(n.getSeconds())}` : u;
}
function ze(l) {
  if (!l) return "";
  const p = new Date(l);
  return `${pe(p.getMonth() + 1)}-${pe(p.getDate())} ${pe(p.getHours())}:${pe(p.getMinutes())}`;
}
function at(l) {
  if (!l) return "";
  const p = new Date(l);
  return `${pe(p.getMonth() + 1)}-${pe(p.getDate())}`;
}
function Vl(l = Date.now()) {
  const p = new Date(l);
  return `${p.getFullYear()}-${pe(p.getMonth() + 1)}-${pe(p.getDate())}`;
}
function ot(l, p, n = "") {
  if (!p) return n;
  const u = l?.[p];
  return u ? typeof u == "string" ? u : u.name || n || p : n || p;
}
const $l = /* @__PURE__ */ new Set([
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
function hl(l) {
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
function bl(l) {
  return (l ?? []).filter((p) => $l.has(p.action)).sort((p, n) => n.at - p.at);
}
function _l(l) {
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
function Bl(l, p) {
  const n = {}, u = l.title.trim(), f = l.standard.trim(), s = l.due.trim();
  return u && u !== p.title && (n.title = u), f && f !== p.standard && (n.standard = f), s && s !== p.due && (n.due = s), Object.keys(n).length ? n : void 0;
}
function Sl(l) {
  return { title: l.title, standard: l.standard, due: l.objection?.suggestedDue || l.due };
}
function Dl(l, p) {
  return p?.review || p?.reply || p?.escalate || p?.arbitrate || Se(l) ? "objection" : "detail";
}
function wl(l, p, n, u = {}) {
  return p ? u.arbitrate ? t.t("项目负责人") : u.review ? t.t("任务负责人") : u.accept || u.object || u.progress || u.complete || u.change || u.reply || u.escalate || l.assigneeId === p ? t.t("部门负责人") : (l.ownerIds?.length ? l.ownerIds : [l.ownerId]).includes(p) ? t.t("任务负责人") : n && n === p ? t.t("项目负责人") : t.t("项目成员") : "";
}
function Cl(l, p) {
  return !l || !p ? "" : l.ownerId === p ? t.t("项目负责人") : l.memberIds.includes(p) ? t.t("项目成员") : "";
}
const Mt = ["active", "closing", "archived"];
function Tl(l) {
  const p = Mt.indexOf(l);
  return p < 0 ? 0 : p;
}
function Il(l) {
  return l === "active" ? "brand" : l === "closing" ? "warn" : "muted";
}
function be(l, p = [], n = {}) {
  if (l.kind === "objection") {
    const s = p.find((a) => a.id === l.id)?.objection?.stage === "arbitration" && n.canArbitrate ? t.t("去裁决") : t.t("去处理");
    return { chip: t.t("异议"), tone: "warn", action: s, link: { kind: "task", id: l.id } };
  }
  if (l.kind === "meeting") return { chip: t.t("会议"), tone: "brand", action: t.t("查看"), link: { kind: "meeting", id: l.id } };
  const u = p.find((f) => f.id === l.id)?.overdue;
  return { chip: u ? t.t("逾期") : t.t("未完成"), tone: u ? "bad" : "", action: t.t("查看"), link: { kind: "task", id: l.id } };
}
function Vt(l) {
  const p = l ?? [], n = new Set(p.filter((u) => u.kind === "objection").map((u) => u.id));
  return p.filter((u) => !(u.kind === "task" && n.has(u.id)));
}
function Ml(l) {
  return l ? l.kind === "project" ? { projectId: l.id, tab: "overview" } : l.kind === "project_summary" ? { projectId: l.id, tab: "summary" } : l.kind === "report" ? l.anchor ? { projectId: l.id, reportId: l.anchor, tab: "reports" } : { projectId: l.id, reportId: l.id, tab: "reports" } : null : null;
}
function At(l, p, n) {
  const u = Math.max(1, Math.ceil(l.length / n)), f = Math.min(Math.max(1, p), u);
  return { rows: l.slice((f - 1) * n, f * n), page: f, pages: u };
}
function Ge(l) {
  if (typeof l == "string") return l;
  if (l && typeof l == "object") {
    const p = l;
    for (const n of ["url", "link", "href"]) if (typeof p[n] == "string") return p[n];
  }
  return "";
}
function mt(l, p, n) {
  const u = n.trim().toLowerCase();
  return u ? [l.name, l.title, p].some((f) => String(f || "").toLowerCase().includes(u)) : !0;
}
async function Ye(l) {
  const p = window.electronAPI;
  try {
    if (p?.writeClipboardText) {
      const n = await p.writeClipboardText(l);
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
function Al(l) {
  if (!l) return "";
  const p = window.electronAPI?.getPathForFile;
  try {
    return (p ? p(l) : l.path) || "";
  } catch {
    return "";
  }
}
const jl = {
  class: "mm-card mm-mob",
  "data-test": "mm-mobile"
}, Ll = { class: "mm-card__head" }, zl = ["disabled"], Fl = ["disabled"], Pl = {
  key: 0,
  class: "ss-note danger"
}, Ul = { class: "mm-mob__addr" }, Ol = {
  key: 0,
  class: "mono",
  "data-test": "mm-mobile-url"
}, Rl = {
  key: 1,
  class: "muted"
}, ql = {
  key: 1,
  class: "mm-mob__qr"
}, Kl = ["src", "alt"], Hl = {
  key: 1,
  class: "mm-mob__qr-ph"
}, Wl = { class: "mm-mob__qr-text" }, Gl = {
  key: 2,
  class: "ss-note warn mm-mob__lan",
  "data-test": "mm-mobile-lan"
}, Yl = {
  key: 3,
  class: "ss-note info",
  "data-test": "mm-mobile-public"
}, Jl = { class: "mm-mob__note" }, Ql = /* @__PURE__ */ e.defineComponent({
  __name: "MobileAccessCard",
  setup(l) {
    const p = se.useNotificationStore(), n = e.ref({ ...te.value?.mobile ?? {}, running: !!te.value?.mobile.running }), u = e.ref(!1), f = e.ref(""), s = e.ref(""), a = e.ref(""), m = e.computed(() => te.value?.me?.person ?? null), i = e.computed(() => !!te.value?.me?.isAdmin);
    async function g() {
      if (s.value = "", a.value = "", !(!n.value.running || !m.value))
        try {
          const $ = Ge(await W("mobile.link", {}));
          if (!$) return;
          s.value = $, a.value = await Tt.toDataURL($, { margin: 1, width: 264 }).catch(() => "");
        } catch ($) {
          f.value = X.errorMessage($);
        }
    }
    async function b() {
      try {
        const $ = await W("mobile.status");
        $ && (n.value = { ...$, running: !!$.running });
      } catch ($) {
        f.value = X.errorMessage($);
      }
    }
    async function d($) {
      u.value = !0, f.value = "";
      try {
        const o = await W($ ? "mobile.start" : "mobile.stop");
        o && typeof o == "object" && "running" in o ? n.value = { ...o, running: !!o.running } : await b(), p.success($ ? t.t("手机页服务已开启") : t.t("手机页服务已停止"));
      } catch (o) {
        f.value = X.errorMessage(o);
      } finally {
        u.value = !1;
      }
    }
    async function c() {
      s.value && await Ye(s.value) && p.success(t.t("已复制专属链接"));
    }
    e.watch(() => [n.value.running, n.value.url, m.value?.id], () => {
      g();
    });
    let y = null;
    return e.onMounted(() => {
      b().then(g), y = _e(($) => {
        $.type === "mobile" && (n.value = { ...n.value, running: $.running, url: $.url }, te.value && (te.value.mobile = { ...te.value.mobile, running: $.running, url: $.url }), b());
      });
    }), e.onBeforeUnmount(() => y?.()), ($, o) => (e.openBlock(), e.createElementBlock("section", jl, [
      e.createElementVNode("header", Ll, [
        e.createElementVNode(
          "h3",
          null,
          e.toDisplayString($.$t("手机端")),
          1
          /* TEXT */
        ),
        e.createElementVNode(
          "span",
          {
            class: e.normalizeClass(["mm-tag", n.value.running ? "ok" : ""]),
            "data-test": "mm-mobile-state"
          },
          e.toDisplayString(n.value.running ? $.$t("运行中") : $.$t("未开启")),
          3
          /* TEXT, CLASS */
        ),
        o[2] || (o[2] = e.createElementVNode(
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
              disabled: u.value,
              "data-test": "mm-mobile-stop",
              onClick: o[1] || (o[1] = (I) => d(!1))
            }, [
              e.createElementVNode(
                "i",
                {
                  class: e.normalizeClass(u.value ? "ri-loader-4-line spin" : "ri-stop-circle-line")
                },
                null,
                2
                /* CLASS */
              ),
              e.createTextVNode(
                e.toDisplayString($.$t("停止服务")),
                1
                /* TEXT */
              )
            ], 8, Fl)) : (e.openBlock(), e.createElementBlock("button", {
              key: 0,
              type: "button",
              class: "ss-btn primary sm",
              disabled: u.value,
              "data-test": "mm-mobile-start",
              onClick: o[0] || (o[0] = (I) => d(!0))
            }, [
              e.createElementVNode(
                "i",
                {
                  class: e.normalizeClass(u.value ? "ri-loader-4-line spin" : "ri-play-circle-line")
                },
                null,
                2
                /* CLASS */
              ),
              e.createTextVNode(
                e.toDisplayString($.$t("开启手机页服务")),
                1
                /* TEXT */
              )
            ], 8, zl))
          ],
          64
          /* STABLE_FRAGMENT */
        )) : e.createCommentVNode("v-if", !0)
      ]),
      f.value ? (e.openBlock(), e.createElementBlock("p", Pl, [
        o[3] || (o[3] = e.createElementVNode(
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
      e.createElementVNode("div", Ul, [
        e.createElementVNode(
          "small",
          null,
          e.toDisplayString($.$t("局域网地址")),
          1
          /* TEXT */
        ),
        n.value.running && n.value.url ? (e.openBlock(), e.createElementBlock(
          "b",
          Ol,
          e.toDisplayString(n.value.url),
          1
          /* TEXT */
        )) : (e.openBlock(), e.createElementBlock(
          "b",
          Rl,
          e.toDisplayString(i.value ? $.$t("服务未开启") : $.$t("服务未开启，请管理员在首页开启")),
          1
          /* TEXT */
        ))
      ]),
      n.value.running ? (e.openBlock(), e.createElementBlock("div", ql, [
        a.value ? (e.openBlock(), e.createElementBlock("img", {
          key: 0,
          src: a.value,
          alt: $.$t("我的手机端专属链接二维码"),
          width: "132",
          height: "132",
          "data-test": "mm-mobile-qr"
        }, null, 8, Kl)) : (e.openBlock(), e.createElementBlock("span", Hl, [...o[4] || (o[4] = [
          e.createElementVNode(
            "i",
            { class: "ri-loader-4-line spin" },
            null,
            -1
            /* CACHED */
          )
        ])])),
        e.createElementVNode("div", Wl, [
          e.createElementVNode(
            "strong",
            null,
            e.toDisplayString($.$t("用手机扫码打开")),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "small",
            null,
            e.toDisplayString(m.value ? $.$t("这是 {name} 的专属链接，扫开就是本人身份，不要转发给别人。", { name: m.value.name }) : $.$t("当前身份无效，无法生成专属链接")),
            1
            /* TEXT */
          ),
          s.value ? (e.openBlock(), e.createElementBlock(
            "button",
            {
              key: 0,
              type: "button",
              class: "ss-link",
              "data-test": "mm-mobile-copy",
              onClick: c
            },
            e.toDisplayString($.$t("复制链接")),
            1
            /* TEXT */
          )) : e.createCommentVNode("v-if", !0)
        ])
      ])) : e.createCommentVNode("v-if", !0),
      n.value.running && n.value.lanOnly ? (e.openBlock(), e.createElementBlock("p", Gl, [
        o[5] || (o[5] = e.createElementVNode(
          "i",
          { class: "ri-wifi-line" },
          null,
          -1
          /* CACHED */
        )),
        e.createElementVNode("span", null, [
          e.createTextVNode(
            e.toDisplayString($.$t("这是公司内网地址：手机要连公司 Wi-Fi（和这台电脑同一个网络）才能打开，用 4G 或在公司外面打不开。发到企业微信的消息里也会注明这一点。")) + " ",
            1
            /* TEXT */
          ),
          i.value ? (e.openBlock(), e.createElementBlock(
            e.Fragment,
            { key: 0 },
            [
              e.createTextVNode(
                e.toDisplayString($.$t("要在外面也能打开，需要一个外网能访问到这台电脑的地址，填到 系统设置 → 企业微信 →「卡片跳转地址前缀」。")),
                1
                /* TEXT */
              )
            ],
            64
            /* STABLE_FRAGMENT */
          )) : e.createCommentVNode("v-if", !0)
        ])
      ])) : n.value.publicBase ? (e.openBlock(), e.createElementBlock("p", Yl, [
        o[6] || (o[6] = e.createElementVNode(
          "i",
          { class: "ri-global-line" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString($.$t("消息里的链接用外网地址：{url}", { url: n.value.publicBase })),
          1
          /* TEXT */
        )
      ])) : e.createCommentVNode("v-if", !0),
      e.createElementVNode(
        "p",
        Jl,
        e.toDisplayString($.$t("手机和这台电脑要在同一个网络；第一次开启时系统可能询问是否允许接入网络，请选允许。服务会记住开关，电脑重启后自动开启。")),
        1
        /* TEXT */
      )
    ]));
  }
}), le = (l, p) => {
  const n = l.__vccOpts || l;
  for (const [u, f] of p)
    n[u] = f;
  return n;
}, jt = /* @__PURE__ */ le(Ql, [["__scopeId", "data-v-12e50808"]]), Zl = {
  class: "mm-home",
  "data-test": "mm-home"
}, Xl = {
  key: 0,
  class: "ss-note danger"
}, xl = {
  key: 1,
  class: "ss-note"
}, en = {
  key: 0,
  class: "ss-note danger mm-home__push",
  "data-test": "mm-home-push-failed"
}, tn = { class: "mm-card mm-hello" }, ln = { class: "mm-hello__text" }, nn = { "data-test": "mm-home-brief" }, an = {
  key: 0,
  class: "bad"
}, on = { class: "mm-hello__counts" }, sn = { class: "mm-count" }, rn = { class: "mm-count warn" }, cn = { class: "mm-count bad" }, dn = { class: "mm-count" }, mn = { class: "mm-home__grid" }, un = {
  class: "mm-card mm-todos",
  "data-test": "mm-home-todos"
}, pn = { class: "mm-card__head" }, vn = { class: "mm-chips" }, kn = ["data-test", "onClick"], gn = {
  key: 0,
  class: "mm-empty"
}, yn = { class: "mm-group__lbl" }, fn = { class: "mm-group__n" }, En = ["data-test", "onClick"], Nn = { class: "mm-todo__tag" }, Vn = { class: "mm-todo__main" }, $n = { key: 0 }, hn = ["onClick"], bn = { class: "mm-home__side" }, _n = {
  class: "mm-card",
  "data-test": "mm-home-mytasks"
}, Bn = { class: "mm-card__head" }, Sn = {
  key: 0,
  class: "mm-empty"
}, Dn = {
  key: 1,
  class: "mm-mytasks"
}, wn = ["data-test", "onClick"], Cn = { class: "mm-mytasks__day" }, Tn = { class: "mm-mytasks__body" }, In = { class: "mm-mytasks__bar" }, Mn = { class: "mm-bar" }, An = { class: "mm-mytasks__pct" }, jn = {
  key: 0,
  class: "mm-tag bad"
}, Ln = {
  key: 1,
  class: "mm-tag warn"
}, zn = {
  class: "mm-card",
  "data-test": "mm-home-notices"
}, Fn = { class: "mm-card__head" }, Pn = {
  key: 0,
  class: "mm-tag bad"
}, Un = ["disabled"], On = {
  key: 0,
  class: "mm-empty"
}, Rn = ["data-test", "onClick"], qn = { class: "mm-notices__body" }, Kn = { class: "mm-notices__top" }, Hn = { key: 0 }, Wn = { class: "mm-home__grid2" }, Gn = {
  class: "mm-card",
  "data-test": "mm-home-projects"
}, Yn = { class: "mm-card__head" }, Jn = {
  key: 0,
  class: "mm-empty"
}, Qn = {
  key: 1,
  class: "mm-rows"
}, Zn = ["onClick"], Xn = {
  key: 0,
  class: "bad"
}, xn = {
  class: "mm-card",
  "data-test": "mm-home-meetings"
}, ea = { class: "mm-card__head" }, ta = {
  key: 0,
  class: "mm-empty mm-empty--row"
}, la = {
  key: 1,
  class: "mm-rows"
}, na = ["onClick"], Re = "", aa = /* @__PURE__ */ e.defineComponent({
  __name: "HomeTab",
  emits: ["role"],
  setup(l, { expose: p, emit: n }) {
    const u = n, f = [
      { key: "all", title: t.t("全部") },
      { key: "meeting", title: t.t("会议") },
      { key: "task", title: t.t("任务") },
      { key: "project", title: t.t("项目") }
    ], s = [
      { key: "urgent", title: t.t("紧急") },
      { key: "today", title: t.t("今天") },
      { key: "week", title: t.t("本周") }
    ], a = e.ref(null), m = e.ref(""), i = e.ref(!1), g = e.ref("all"), b = e.ref(!1), d = e.ref(!1), c = e.ref([]), y = e.computed(() => te.value?.me ?? a.value?.me ?? null), $ = e.computed(() => te.value?.me?.isAdmin && te.value?.pushFailed || 0), o = e.computed(() => rl((/* @__PURE__ */ new Date()).getHours())), I = e.computed(() => Et(a.value?.todos ?? [], "all")), F = e.computed(() => Et(a.value?.todos ?? [], g.value)), P = e.computed(() => I.value.today.length), L = e.computed(() => {
      const k = I.value.urgent.length, h = P.value;
      let r;
      k && h ? r = t.t("今天有 {urgent}、{n} 件需在今天完成的事项", { urgent: Re, n: h }) : k ? r = t.t("今天有 {urgent}的事项", { urgent: Re }) : h ? r = t.t("今天有 {n} 件需在今天完成的事项", { n: h }) : r = t.t("今天没有紧急或需要今天完成的事项");
      const H = r.indexOf(Re);
      return H < 0 ? { before: r, red: "", after: "" } : { before: r.slice(0, H), red: t.t("{n} 件紧急", { n: k }), after: r.slice(H + Re.length) };
    }), D = e.computed(() => F.value.urgent.length + F.value.today.length + F.value.week.length), C = e.computed(() => d.value ? c.value : (a.value?.notices ?? []).slice(0, 5)), z = e.computed(() => (a.value?.projects ?? []).some((k) => k.status === "active"));
    function R(k) {
      return k.type === "update_progress" && k.urgency === "urgent" ? t.t("任务逾期") : Qt[k.type] || k.type;
    }
    const _ = (k) => Math.max(0, Math.min(100, Math.round(Number(k) || 0)));
    async function E() {
      try {
        a.value = await W("home.get"), m.value = "", d.value && (c.value = await W("notice.list", {}));
      } catch (k) {
        m.value = X.errorMessage(k);
      }
    }
    async function v() {
      if (d.value) {
        d.value = !1;
        return;
      }
      try {
        c.value = await W("notice.list", {}), d.value = !0;
      } catch (k) {
        m.value = X.errorMessage(k);
      }
    }
    async function w() {
      i.value = !0;
      try {
        await W("notice.read", { all: !0 }), await E();
      } catch (k) {
        m.value = X.errorMessage(k);
      } finally {
        i.value = !1;
      }
    }
    async function U(k) {
      if (!k.read)
        try {
          await W("notice.read", { ids: [k.id] });
        } catch {
        }
      de(k.link);
    }
    function G() {
      nt.value = !0, he("meetings");
    }
    return e.watch(() => dl(a.value), (k) => {
      k && u("role", k);
    }, { immediate: !0 }), e.onMounted(() => {
      E();
    }), p({ refresh: E }), (k, h) => (e.openBlock(), e.createElementBlock("div", Zl, [
      m.value ? (e.openBlock(), e.createElementBlock("p", Xl, [
        h[5] || (h[5] = e.createElementVNode(
          "i",
          { class: "ri-error-warning-line" },
          null,
          -1
          /* CACHED */
        )),
        e.createElementVNode(
          "span",
          null,
          e.toDisplayString(m.value),
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
          e.toDisplayString(k.$t("重试")),
          1
          /* TEXT */
        )
      ])) : e.createCommentVNode("v-if", !0),
      !a.value && !m.value ? (e.openBlock(), e.createElementBlock("p", xl, [
        h[6] || (h[6] = e.createElementVNode(
          "i",
          { class: "ri-loader-4-line spin" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(k.$t("正在加载首页…")),
          1
          /* TEXT */
        )
      ])) : e.createCommentVNode("v-if", !0),
      a.value ? (e.openBlock(), e.createElementBlock(
        e.Fragment,
        { key: 2 },
        [
          $.value ? (e.openBlock(), e.createElementBlock("p", en, [
            h[7] || (h[7] = e.createElementVNode(
              "i",
              { class: "ri-error-warning-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(k.$t("有 {n} 条企微通知没发出去，相关的人可能没收到卡片（系统内消息照常有）", { n: $.value })),
              1
              /* TEXT */
            ),
            e.createElementVNode(
              "button",
              {
                type: "button",
                class: "ss-link",
                onClick: h[0] || (h[0] = (r) => e.unref(Yt)("wecom"))
              },
              e.toDisplayString(k.$t("查看并重发")),
              1
              /* TEXT */
            )
          ])) : e.createCommentVNode("v-if", !0),
          e.createCommentVNode(" 问候卡 "),
          e.createElementVNode("section", tn, [
            e.createElementVNode("div", ln, [
              e.createElementVNode(
                "h2",
                null,
                e.toDisplayString(k.$t("{greet}，{name}", { greet: o.value, name: a.value.greetingName || y.value?.person?.name || "" })),
                1
                /* TEXT */
              ),
              e.createElementVNode("p", nn, [
                e.createTextVNode(
                  e.toDisplayString(L.value.before),
                  1
                  /* TEXT */
                ),
                L.value.red ? (e.openBlock(), e.createElementBlock(
                  "b",
                  an,
                  e.toDisplayString(L.value.red),
                  1
                  /* TEXT */
                )) : e.createCommentVNode("v-if", !0),
                e.createTextVNode(
                  e.toDisplayString(L.value.after),
                  1
                  /* TEXT */
                )
              ])
            ]),
            e.createElementVNode("div", on, [
              e.createElementVNode("div", sn, [
                e.createElementVNode(
                  "strong",
                  null,
                  e.toDisplayString(a.value.counts.todos),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "small",
                  null,
                  e.toDisplayString(k.$t("待处理")),
                  1
                  /* TEXT */
                )
              ]),
              e.createElementVNode("div", rn, [
                e.createElementVNode(
                  "strong",
                  null,
                  e.toDisplayString(a.value.counts.dueToday),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "small",
                  null,
                  e.toDisplayString(k.$t("今日到期")),
                  1
                  /* TEXT */
                )
              ]),
              e.createElementVNode("div", cn, [
                e.createElementVNode(
                  "strong",
                  null,
                  e.toDisplayString(a.value.counts.overdue),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "small",
                  null,
                  e.toDisplayString(k.$t("逾期")),
                  1
                  /* TEXT */
                )
              ]),
              e.createElementVNode("div", dn, [
                e.createElementVNode(
                  "strong",
                  null,
                  e.toDisplayString(a.value.counts.unread),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "small",
                  null,
                  e.toDisplayString(k.$t("未读通知")),
                  1
                  /* TEXT */
                )
              ])
            ])
          ]),
          e.createElementVNode("div", mn, [
            e.createCommentVNode(" 待我处理 "),
            e.createElementVNode("section", un, [
              e.createElementVNode("header", pn, [
                e.createElementVNode(
                  "h3",
                  null,
                  e.toDisplayString(k.$t("待我处理")),
                  1
                  /* TEXT */
                ),
                h[8] || (h[8] = e.createElementVNode(
                  "span",
                  { class: "mm-grow" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createElementVNode("div", vn, [
                  (e.openBlock(), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(f, (r) => e.createElementVNode("button", {
                      key: r.key,
                      type: "button",
                      class: e.normalizeClass(["mm-chip", { on: g.value === r.key }]),
                      "data-test": `mm-todo-filter-${r.key}`,
                      onClick: (H) => g.value = r.key
                    }, [
                      e.createTextVNode(
                        e.toDisplayString(r.title) + " ",
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "span",
                        null,
                        e.toDisplayString(F.value.counts[r.key]),
                        1
                        /* TEXT */
                      )
                    ], 10, kn)),
                    64
                    /* STABLE_FRAGMENT */
                  ))
                ])
              ]),
              D.value ? (e.openBlock(), e.createElementBlock(
                e.Fragment,
                { key: 1 },
                e.renderList(s, (r) => (e.openBlock(), e.createElementBlock(
                  e.Fragment,
                  {
                    key: r.key
                  },
                  [
                    F.value[r.key].length ? (e.openBlock(), e.createElementBlock(
                      "div",
                      {
                        key: 0,
                        class: e.normalizeClass(["mm-group", r.key])
                      },
                      [
                        e.createElementVNode(
                          "span",
                          yn,
                          e.toDisplayString(r.title),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "span",
                          fn,
                          e.toDisplayString(F.value[r.key].length),
                          1
                          /* TEXT */
                        ),
                        h[9] || (h[9] = e.createElementVNode(
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
                          onClick: h[1] || (h[1] = (H) => b.value = !b.value)
                        }, [
                          e.createTextVNode(
                            e.toDisplayString(b.value ? k.$t("收起") : k.$t("展开")),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "i",
                            {
                              class: e.normalizeClass(b.value ? "ri-arrow-up-s-line" : "ri-arrow-down-s-line")
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
                    r.key !== "week" || b.value ? (e.openBlock(!0), e.createElementBlock(
                      e.Fragment,
                      { key: 1 },
                      e.renderList(F.value[r.key], (H) => (e.openBlock(), e.createElementBlock("article", {
                        key: H.id,
                        class: e.normalizeClass(["mm-todo", { urgent: H.urgency === "urgent" }]),
                        "data-test": `mm-todo-${H.id}`,
                        onClick: (Q) => e.unref(de)(H.link)
                      }, [
                        e.createElementVNode(
                          "span",
                          Nn,
                          e.toDisplayString(R(H)),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode("div", Vn, [
                          e.createElementVNode(
                            "strong",
                            null,
                            e.toDisplayString(H.title),
                            1
                            /* TEXT */
                          ),
                          H.subtitle ? (e.openBlock(), e.createElementBlock(
                            "small",
                            $n,
                            e.toDisplayString(H.subtitle),
                            1
                            /* TEXT */
                          )) : e.createCommentVNode("v-if", !0)
                        ]),
                        H.hint ? (e.openBlock(), e.createElementBlock(
                          "span",
                          {
                            key: 0,
                            class: e.normalizeClass(["mm-todo__hint", H.urgency])
                          },
                          e.toDisplayString(H.hint),
                          3
                          /* TEXT, CLASS */
                        )) : e.createCommentVNode("v-if", !0),
                        e.createElementVNode("button", {
                          type: "button",
                          class: e.normalizeClass(["mm-btn", H.urgency === "urgent" ? "primary" : "soft"]),
                          onClick: e.withModifiers((Q) => e.unref(de)(H.link), ["stop"])
                        }, e.toDisplayString(e.unref(Zt)[H.type]), 11, hn)
                      ], 10, En))),
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
                gn,
                e.toDisplayString(k.$t("暂无待办")),
                1
                /* TEXT */
              ))
            ]),
            e.createElementVNode("div", bn, [
              e.createCommentVNode(" 手机端：服务开关 + 本人专属链接二维码 "),
              e.createVNode(jt),
              e.createCommentVNode(" 我的任务 · 本周截止 "),
              e.createElementVNode("section", _n, [
                e.createElementVNode("header", Bn, [
                  e.createElementVNode(
                    "h3",
                    null,
                    e.toDisplayString(k.$t("我的任务 · 本周截止")),
                    1
                    /* TEXT */
                  ),
                  h[11] || (h[11] = e.createElementVNode(
                    "span",
                    { class: "mm-grow" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-link",
                    onClick: h[2] || (h[2] = (r) => e.unref(he)("tasks"))
                  }, [
                    e.createTextVNode(
                      e.toDisplayString(k.$t("全部任务")),
                      1
                      /* TEXT */
                    ),
                    h[10] || (h[10] = e.createElementVNode(
                      "i",
                      { class: "ri-arrow-right-s-line" },
                      null,
                      -1
                      /* CACHED */
                    ))
                  ])
                ]),
                a.value.myTasksThisWeek.length ? (e.openBlock(), e.createElementBlock("ul", Dn, [
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(a.value.myTasksThisWeek, (r) => (e.openBlock(), e.createElementBlock("li", {
                      key: r.id,
                      "data-test": `mm-mytask-${r.id}`,
                      onClick: (H) => e.unref(de)({ kind: "task", id: r.id })
                    }, [
                      e.createElementVNode("div", Cn, [
                        e.createElementVNode(
                          "small",
                          null,
                          e.toDisplayString(e.unref(yt)(r.due).day),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "b",
                          null,
                          e.toDisplayString(e.unref(yt)(r.due).md),
                          1
                          /* TEXT */
                        )
                      ]),
                      e.createElementVNode("div", Tn, [
                        e.createElementVNode(
                          "strong",
                          null,
                          e.toDisplayString(r.title),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode("div", In, [
                          e.createElementVNode("span", Mn, [
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
                            An,
                            e.toDisplayString(_(r.percent)) + "%",
                            1
                            /* TEXT */
                          ),
                          r.overdue ? (e.openBlock(), e.createElementBlock(
                            "span",
                            jn,
                            e.toDisplayString(k.$t("逾期 {n} 天", { n: r.overdueDays })),
                            1
                            /* TEXT */
                          )) : r.objection ? (e.openBlock(), e.createElementBlock(
                            "span",
                            Ln,
                            e.toDisplayString(e.unref(rt)(r.objection)),
                            1
                            /* TEXT */
                          )) : e.createCommentVNode("v-if", !0)
                        ])
                      ])
                    ], 8, wn))),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ])) : (e.openBlock(), e.createElementBlock(
                  "p",
                  Sn,
                  e.toDisplayString(k.$t("没有即将到期或逾期的任务")),
                  1
                  /* TEXT */
                ))
              ]),
              e.createCommentVNode(" 通知 "),
              e.createElementVNode("section", zn, [
                e.createElementVNode("header", Fn, [
                  e.createElementVNode(
                    "h3",
                    null,
                    e.toDisplayString(k.$t("通知")),
                    1
                    /* TEXT */
                  ),
                  a.value.counts.unread ? (e.openBlock(), e.createElementBlock(
                    "span",
                    Pn,
                    e.toDisplayString(k.$t("{n} 未读", { n: a.value.counts.unread })),
                    1
                    /* TEXT */
                  )) : e.createCommentVNode("v-if", !0),
                  h[12] || (h[12] = e.createElementVNode(
                    "span",
                    { class: "mm-grow" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  d.value && a.value.counts.unread ? (e.openBlock(), e.createElementBlock("button", {
                    key: 1,
                    type: "button",
                    class: "ss-link",
                    disabled: i.value,
                    "data-test": "mm-notice-readall",
                    onClick: w
                  }, e.toDisplayString(k.$t("全部标为已读")), 9, Un)) : e.createCommentVNode("v-if", !0),
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-link",
                    "data-test": "mm-notice-all",
                    onClick: v
                  }, [
                    e.createTextVNode(
                      e.toDisplayString(d.value ? k.$t("收起") : k.$t("全部")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "i",
                      {
                        class: e.normalizeClass(d.value ? "ri-arrow-up-s-line" : "ri-arrow-right-s-line")
                      },
                      null,
                      2
                      /* CLASS */
                    )
                  ])
                ]),
                C.value.length ? (e.openBlock(), e.createElementBlock(
                  "ul",
                  {
                    key: 1,
                    class: e.normalizeClass(["mm-notices", { all: d.value }])
                  },
                  [
                    (e.openBlock(!0), e.createElementBlock(
                      e.Fragment,
                      null,
                      e.renderList(C.value, (r) => (e.openBlock(), e.createElementBlock("li", {
                        key: r.id,
                        class: e.normalizeClass({ unread: !r.read }),
                        "data-test": `mm-notice-${r.id}`,
                        onClick: (H) => U(r)
                      }, [
                        h[13] || (h[13] = e.createElementVNode(
                          "i",
                          {
                            class: "mm-dot",
                            "aria-hidden": "true"
                          },
                          null,
                          -1
                          /* CACHED */
                        )),
                        e.createElementVNode("div", qn, [
                          e.createElementVNode("div", Kn, [
                            e.createElementVNode(
                              "strong",
                              null,
                              e.toDisplayString(r.title || e.unref(Xt)[r.type]),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "time",
                              null,
                              e.toDisplayString(e.unref(xt)(r.at)),
                              1
                              /* TEXT */
                            )
                          ]),
                          r.summary ? (e.openBlock(), e.createElementBlock(
                            "small",
                            Hn,
                            e.toDisplayString(r.summary),
                            1
                            /* TEXT */
                          )) : e.createCommentVNode("v-if", !0)
                        ])
                      ], 10, Rn))),
                      128
                      /* KEYED_FRAGMENT */
                    ))
                  ],
                  2
                  /* CLASS */
                )) : (e.openBlock(), e.createElementBlock(
                  "p",
                  On,
                  e.toDisplayString(k.$t("暂无通知")),
                  1
                  /* TEXT */
                ))
              ])
            ])
          ]),
          e.createElementVNode("div", Wn, [
            e.createCommentVNode(" 我参与的项目 "),
            e.createElementVNode("section", Gn, [
              e.createElementVNode("header", Yn, [
                e.createElementVNode(
                  "h3",
                  null,
                  e.toDisplayString(k.$t("我参与的项目")),
                  1
                  /* TEXT */
                ),
                h[15] || (h[15] = e.createElementVNode(
                  "span",
                  { class: "mm-grow" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createElementVNode("button", {
                  type: "button",
                  class: "ss-link",
                  onClick: h[3] || (h[3] = (r) => e.unref(he)("projects"))
                }, [
                  e.createTextVNode(
                    e.toDisplayString(k.$t("全部项目")),
                    1
                    /* TEXT */
                  ),
                  h[14] || (h[14] = e.createElementVNode(
                    "i",
                    { class: "ri-arrow-right-s-line" },
                    null,
                    -1
                    /* CACHED */
                  ))
                ])
              ]),
              a.value.projects.length ? (e.openBlock(), e.createElementBlock("ul", Qn, [
                (e.openBlock(!0), e.createElementBlock(
                  e.Fragment,
                  null,
                  e.renderList(a.value.projects, (r) => (e.openBlock(), e.createElementBlock("li", {
                    key: r.id,
                    onClick: (H) => e.unref(de)({ kind: "project", id: r.id })
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
                      e.toDisplayString(e.unref(He)[r.status]),
                      3
                      /* TEXT, CLASS */
                    ),
                    h[16] || (h[16] = e.createElementVNode(
                      "span",
                      { class: "mm-grow" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createElementVNode(
                      "small",
                      null,
                      e.toDisplayString(k.$t("任务 {a}/{b}", { a: r.done, b: r.total })),
                      1
                      /* TEXT */
                    ),
                    r.overdue ? (e.openBlock(), e.createElementBlock(
                      "small",
                      Xn,
                      e.toDisplayString(k.$t("逾期 {n}", { n: r.overdue })),
                      1
                      /* TEXT */
                    )) : e.createCommentVNode("v-if", !0)
                  ], 8, Zn))),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ])) : (e.openBlock(), e.createElementBlock(
                "p",
                Jn,
                e.toDisplayString(k.$t("还没有参与的项目")),
                1
                /* TEXT */
              ))
            ]),
            e.createCommentVNode(" 最近会议 "),
            e.createElementVNode("section", xn, [
              e.createElementVNode("header", ea, [
                e.createElementVNode(
                  "h3",
                  null,
                  e.toDisplayString(k.$t("最近会议")),
                  1
                  /* TEXT */
                ),
                h[18] || (h[18] = e.createElementVNode(
                  "span",
                  { class: "mm-grow" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createElementVNode("button", {
                  type: "button",
                  class: "ss-link",
                  onClick: h[4] || (h[4] = (r) => e.unref(he)("meetings"))
                }, [
                  e.createTextVNode(
                    e.toDisplayString(k.$t("全部会议")),
                    1
                    /* TEXT */
                  ),
                  h[17] || (h[17] = e.createElementVNode(
                    "i",
                    { class: "ri-arrow-right-s-line" },
                    null,
                    -1
                    /* CACHED */
                  ))
                ])
              ]),
              a.value.recentMeetings.length ? (e.openBlock(), e.createElementBlock("ul", la, [
                (e.openBlock(!0), e.createElementBlock(
                  e.Fragment,
                  null,
                  e.renderList(a.value.recentMeetings, (r) => (e.openBlock(), e.createElementBlock("li", {
                    key: r.id,
                    onClick: (H) => e.unref(de)({ kind: "meeting", id: r.id })
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
                      e.toDisplayString(r.projectName) + " · " + e.toDisplayString(e.unref(wt)(r.time)),
                      1
                      /* TEXT */
                    ),
                    h[19] || (h[19] = e.createElementVNode(
                      "span",
                      { class: "mm-grow" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createElementVNode(
                      "span",
                      {
                        class: e.normalizeClass(["mm-tag", e.unref(ct)[r.status]])
                      },
                      e.toDisplayString(e.unref(Je)[r.status]),
                      3
                      /* TEXT, CLASS */
                    )
                  ], 8, na))),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ])) : (e.openBlock(), e.createElementBlock("div", ta, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(k.$t("还没有参加过会议")),
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
                    onClick: G
                  },
                  e.toDisplayString(k.$t("新建会议")),
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
}), oa = /* @__PURE__ */ le(aa, [["__scopeId", "data-v-aa63f838"]]), sa = {
  class: "mm-up",
  "data-test": "mm-upload-panel"
}, ra = {
  key: 0,
  class: "mm-up__zone"
}, ia = ["disabled"], ca = { class: "mm-up__formats" }, da = { class: "ss-muted" }, ma = {
  key: 1,
  class: "ss-note"
}, ua = { class: "mm-up__proc" }, pa = { class: "mm-up__stages" }, va = { class: "mm-up__bar" }, ka = { class: "mm-up__line" }, ga = {
  key: 0,
  class: "ss-muted"
}, ya = {
  key: 1,
  class: "ss-muted"
}, fa = {
  key: 0,
  class: "ss-note warn",
  "data-test": "mm-process-stalled"
}, Ea = {
  key: 1,
  class: "ss-muted"
}, Na = {
  class: "ss-note danger",
  "data-test": "mm-process-failed"
}, Va = { class: "ss-actions" }, $a = ["disabled"], ha = ["disabled"], ba = {
  key: 2,
  class: "ss-muted"
}, _a = {
  key: 3,
  class: "ss-note danger"
}, Ba = /* @__PURE__ */ e.defineComponent({
  __name: "UploadPanel",
  props: {
    detail: {},
    live: {},
    now: {},
    waitFrom: {}
  },
  emits: ["changed", "log", "wait"],
  setup(l, { emit: p }) {
    const n = l, u = p, f = se.useNotificationStore(), s = e.ref(!1), a = e.ref(""), m = e.computed(() => n.detail.meeting), i = e.computed(() => n.detail.names[m.value.hostId]?.name || ""), g = e.computed(() => {
      const L = m.value.process;
      return n.live ? { stage: n.live.stage, progress: n.live.progress, text: n.live.text } : { stage: L?.stage || "extract", progress: L?.progress || 0, text: L?.log?.length ? L.log[L.log.length - 1].text : "" };
    }), b = e.computed(() => Math.max(0, Math.min(100, Math.round(g.value.progress || 0)))), d = e.computed(() => {
      const L = m.value.files || [];
      if (L.length && L.every((C) => C.kind === "transcript")) return ["parse", "organize"];
      const D = L.some((C) => C.kind === "video") ? ["extract", "transcribe", "diarize", "organize"] : ["transcribe", "diarize", "organize"];
      return D.includes(g.value.stage) ? D : ["extract", "transcribe", "diarize", "parse", "organize"];
    }), c = e.computed(() => Math.max(0, d.value.indexOf(g.value.stage))), y = e.computed(() => m.value.process?.startedAt || 0), $ = e.computed(() => Math.max(vl(m.value.process, n.live?.at) || 0, n.waitFrom || 0)), o = e.computed(() => !!$.value && n.now - $.value > kl), I = e.computed(() => Math.floor((n.now - $.value) / 6e4));
    async function F() {
      if (!s.value) {
        s.value = !0, a.value = "";
        try {
          await W("meeting.pickFiles", { id: m.value.id }) && f.success(t.t("文件已上传，开始处理")), u("changed");
        } catch (L) {
          a.value = X.errorMessage(L);
        } finally {
          s.value = !1;
        }
      }
    }
    async function P() {
      if (!s.value) {
        s.value = !0, a.value = "";
        try {
          await W("meeting.retry", { id: m.value.id }), u("changed");
        } catch (L) {
          a.value = X.errorMessage(L);
        } finally {
          s.value = !1;
        }
      }
    }
    return (L, D) => (e.openBlock(), e.createElementBlock("section", sa, [
      e.createCommentVNode(" 待上传 "),
      m.value.status === "pending_upload" ? (e.openBlock(), e.createElementBlock(
        e.Fragment,
        { key: 0 },
        [
          l.detail.my.isHost ? (e.openBlock(), e.createElementBlock("div", ra, [
            D[3] || (D[3] = e.createElementVNode(
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
              e.toDisplayString(L.$t("上传会议录音、录屏或文字记录")),
              1
              /* TEXT */
            ),
            e.createElementVNode(
              "p",
              null,
              e.toDisplayString(L.$t("优先上传录音或录屏：系统按停顿切段转写，再和本场参会人的声纹比对，自动认出谁在说话。只有文字记录时，没有发言人标注的段落要你手动分配。")),
              1
              /* TEXT */
            ),
            e.createElementVNode("button", {
              type: "button",
              class: "ss-btn primary",
              disabled: s.value,
              "data-test": "mm-pick-files",
              onClick: F
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
                e.toDisplayString(s.value ? L.$t("正在拷入文件…") : L.$t("选择文件")),
                1
                /* TEXT */
              )
            ], 8, ia),
            e.createElementVNode("ul", ca, [
              e.createElementVNode("li", null, [
                e.createElementVNode(
                  "b",
                  null,
                  e.toDisplayString(L.$t("录音")),
                  1
                  /* TEXT */
                ),
                e.createTextVNode(
                  e.toDisplayString(L.$t("mp3、m4a、wav、aac、amr、flac、ogg、opus、wma 等")),
                  1
                  /* TEXT */
                )
              ]),
              e.createElementVNode("li", null, [
                e.createElementVNode(
                  "b",
                  null,
                  e.toDisplayString(L.$t("录屏")),
                  1
                  /* TEXT */
                ),
                e.createTextVNode(
                  e.toDisplayString(L.$t("mp4、mov、mkv、avi、flv、wmv、webm 等，自动提取音轨")),
                  1
                  /* TEXT */
                )
              ]),
              e.createElementVNode("li", null, [
                e.createElementVNode(
                  "b",
                  null,
                  e.toDisplayString(L.$t("文字记录")),
                  1
                  /* TEXT */
                ),
                e.createTextVNode(
                  e.toDisplayString(L.$t("txt、md、docx、srt、vtt、json，跳过转写，按参会昵称匹配员工")),
                  1
                  /* TEXT */
                )
              ])
            ]),
            e.createElementVNode(
              "small",
              da,
              e.toDisplayString(L.$t("扩展名不认识的文件会先探测，有音轨就当录音处理；可以一次选多个文件。")),
              1
              /* TEXT */
            )
          ])) : (e.openBlock(), e.createElementBlock("p", ma, [
            D[4] || (D[4] = e.createElementVNode(
              "i",
              { class: "ri-time-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(L.$t("等待主持人 {name} 上传会议文件", { name: i.value })),
              1
              /* TEXT */
            )
          ]))
        ],
        64
        /* STABLE_FRAGMENT */
      )) : m.value.status === "processing" ? (e.openBlock(), e.createElementBlock(
        e.Fragment,
        { key: 1 },
        [
          e.createCommentVNode(" 处理中 "),
          e.createElementVNode("div", ua, [
            e.createElementVNode("ol", pa, [
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(d.value, (C, z) => (e.openBlock(), e.createElementBlock(
                  "li",
                  {
                    key: C,
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
                      e.toDisplayString(e.unref(Ie)[C]),
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
            e.createElementVNode("div", va, [
              e.createElementVNode(
                "i",
                {
                  style: e.normalizeStyle({ width: `${b.value}%` })
                },
                null,
                4
                /* STYLE */
              )
            ]),
            e.createElementVNode("p", ka, [
              e.createElementVNode(
                "b",
                null,
                e.toDisplayString(e.unref(Ie)[g.value.stage]) + " · " + e.toDisplayString(b.value) + "%",
                1
                /* TEXT */
              ),
              g.value.text ? (e.openBlock(), e.createElementBlock(
                "span",
                ga,
                e.toDisplayString(g.value.text),
                1
                /* TEXT */
              )) : e.createCommentVNode("v-if", !0),
              D[5] || (D[5] = e.createElementVNode(
                "span",
                { class: "mm-grow" },
                null,
                -1
                /* CACHED */
              )),
              y.value ? (e.openBlock(), e.createElementBlock(
                "span",
                ya,
                e.toDisplayString(L.$t("已用时 {t}", { t: e.unref(sl)(l.now - y.value) })),
                1
                /* TEXT */
              )) : e.createCommentVNode("v-if", !0)
            ]),
            o.value ? (e.openBlock(), e.createElementBlock("p", fa, [
              D[6] || (D[6] = e.createElementVNode(
                "i",
                { class: "ri-hourglass-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(L.$t("已经 {m} 分钟没有新进度。长录音转写较慢，可以继续等待；也可以看看处理日志。", { m: I.value })),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "button",
                {
                  type: "button",
                  class: "ss-link",
                  onClick: D[0] || (D[0] = (C) => u("wait"))
                },
                e.toDisplayString(L.$t("继续等待")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "button",
                {
                  type: "button",
                  class: "ss-link",
                  onClick: D[1] || (D[1] = (C) => u("log"))
                },
                e.toDisplayString(L.$t("查看日志")),
                1
                /* TEXT */
              )
            ])) : (e.openBlock(), e.createElementBlock(
              "small",
              Ea,
              e.toDisplayString(L.$t("处理在后台进行，可以先去做别的事；完成后发言人会收到确认通知。")),
              1
              /* TEXT */
            ))
          ])
        ],
        64
        /* STABLE_FRAGMENT */
      )) : m.value.status === "failed" ? (e.openBlock(), e.createElementBlock(
        e.Fragment,
        { key: 2 },
        [
          e.createCommentVNode(" 失败 "),
          e.createElementVNode("p", Na, [
            D[7] || (D[7] = e.createElementVNode(
              "i",
              { class: "ri-error-warning-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(L.$t("处理失败（{stage}）：{error}", { stage: e.unref(Ie)[m.value.process?.stage || "extract"], error: m.value.process?.error || L.$t("未知原因") })),
              1
              /* TEXT */
            )
          ]),
          e.createElementVNode("div", Va, [
            l.detail.my.isHost ? (e.openBlock(), e.createElementBlock("button", {
              key: 0,
              type: "button",
              class: "ss-btn primary",
              disabled: s.value,
              "data-test": "mm-retry",
              onClick: P
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
                e.toDisplayString(L.$t("重试")),
                1
                /* TEXT */
              )
            ], 8, $a)) : e.createCommentVNode("v-if", !0),
            l.detail.my.isHost ? (e.openBlock(), e.createElementBlock("button", {
              key: 1,
              type: "button",
              class: "ss-btn",
              disabled: s.value,
              onClick: F
            }, [
              D[8] || (D[8] = e.createElementVNode(
                "i",
                { class: "ri-folder-open-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(L.$t("换文件重新上传")),
                1
                /* TEXT */
              )
            ], 8, ha)) : e.createCommentVNode("v-if", !0),
            e.createElementVNode("button", {
              type: "button",
              class: "ss-btn ghost",
              onClick: D[2] || (D[2] = (C) => u("log"))
            }, [
              D[9] || (D[9] = e.createElementVNode(
                "i",
                { class: "ri-file-list-3-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(L.$t("查看处理日志")),
                1
                /* TEXT */
              )
            ]),
            l.detail.my.isHost ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock(
              "span",
              ba,
              e.toDisplayString(L.$t("等待主持人 {name} 重试", { name: i.value })),
              1
              /* TEXT */
            ))
          ])
        ],
        64
        /* STABLE_FRAGMENT */
      )) : e.createCommentVNode("v-if", !0),
      a.value ? (e.openBlock(), e.createElementBlock("p", _a, [
        D[10] || (D[10] = e.createElementVNode(
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
      ])) : e.createCommentVNode("v-if", !0)
    ]));
  }
}), Sa = /* @__PURE__ */ le(Ba, [["__scopeId", "data-v-a1e2ccd7"]]), Da = ["data-test"], wa = ["aria-label", "data-test", "onClick"], Ca = ["data-test"], Ta = { class: "mm-pss__name" }, Ia = { key: 0 }, Ma = ["aria-label", "aria-expanded", "aria-activedescendant", "placeholder", "disabled", "data-test"], Aa = ["aria-label", "data-test"], ja = {
  key: 3,
  class: "ri-arrow-down-s-line mm-pss__caret",
  "aria-hidden": "true"
}, La = ["aria-multiselectable", "data-test"], za = { class: "mm-pss-pop__group" }, Fa = ["id", "aria-selected", "data-test", "onMouseenter", "onClick"], Pa = { class: "mm-pss-pop__name" }, Ua = { key: 0 }, Oa = { key: 1 }, Ra = {
  key: 2,
  class: "ri-check-line mm-pss-pop__check",
  "aria-hidden": "true"
}, qa = {
  key: 0,
  class: "mm-pss-pop__empty"
}, Ka = /* @__PURE__ */ e.defineComponent({
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
  setup(l, { emit: p }) {
    const n = l, u = p, f = e.ref(null), s = e.ref(null), a = e.ref(null), m = e.ref(!1), i = e.ref(""), g = e.ref(0), b = e.ref(null), d = e.ref(!1), c = e.ref({}), y = `mm-pss-${Math.random().toString(36).slice(2, 9)}`, $ = `${y}-list`, o = e.computed(() => n.placeholder || t.t("搜索姓名、拼音或部门")), I = e.computed(() => n.people ?? b.value ?? { depts: [], people: [] }), F = (T) => I.value.depts.find((j) => j.id === T)?.name || "";
    let P = null;
    const L = e.ref(!1);
    function D() {
      P || L.value || Promise.resolve().then(() => WV).then((T) => {
        P = T.pinyin, L.value = !0;
      }).catch(() => {
      });
    }
    const C = /* @__PURE__ */ new Map();
    function z(T) {
      if (!P || !/[㐀-鿿]/.test(T)) return "";
      const j = C.get(T);
      if (j !== void 0) return j;
      let Z = "";
      try {
        const Y = P(T, { toneType: "none", type: "array" }).map((ae) => String(ae).toLowerCase());
        Z = `${Y.join("")} ${Y.map((ae) => ae[0] || "").join("")}`;
      } catch {
        Z = "";
      }
      return C.set(T, Z), Z;
    }
    function R(T, j, Z, Y, ae = "") {
      const fe = F(Z) || ae, Ve = oe(j), De = n.hint?.(T) || "";
      return L.value, {
        value: T,
        label: j,
        sub: [fe, Y].filter(Boolean).join(" · "),
        hint: De,
        initial: Ve.text,
        color: Ve.color,
        deptId: Z,
        search: `${j} ${fe} ${Y || ""} ${z(j)}`.toLowerCase()
      };
    }
    const _ = e.computed(() => {
      const T = n.only ? new Set(n.only) : null, j = new Set(n.exclude ?? []);
      return I.value.people.filter((Z) => !Z.left && (!T || T.has(Z.id)) && !j.has(Z.id)).map((Z) => R(Z.id, Z.name, Z.deptId, Z.title));
    }), E = e.computed(() => (n.extras ?? []).map((T) => {
      const j = oe(T.label);
      return { value: T.value, label: T.label, sub: T.sub || "", hint: "", initial: j.text, color: j.color, deptId: "", search: `${T.label} ${T.sub || ""} ${z(T.label)}`.toLowerCase() };
    })), v = e.computed(() => {
      const T = new Set(n.exclude ?? []);
      return (n.pinned ?? []).filter((j) => !T.has(j)).map((j) => {
        const Z = I.value.people.find((ae) => ae.id === j);
        if (Z) return R(Z.id, Z.name, Z.deptId, Z.title);
        const Y = n.names?.[j];
        return R(j, Y?.name || j, "", void 0, Y?.deptName || "");
      });
    });
    function w(T, j) {
      return j ? j.split(/\s+/).filter(Boolean).every((Z) => T.search.includes(Z)) : !0;
    }
    const U = e.computed(() => {
      const T = i.value.trim().toLowerCase(), j = [], Z = E.value.filter((me) => w(me, T));
      Z.length && j.push({ key: "__extras", label: n.extrasLabel || t.t("本场发言人"), options: Z });
      const Y = v.value.filter((me) => w(me, T));
      Y.length && j.push({ key: "__pinned", label: n.pinnedLabel || t.t("本场参会人"), options: Y });
      const ae = new Set(n.pinned ?? []), fe = _.value.filter((me) => !ae.has(me.value) && w(me, T)), Ve = /* @__PURE__ */ new Set();
      for (const me of I.value.depts) {
        Ve.add(me.id);
        const Ue = fe.filter((Xe) => Xe.deptId === me.id);
        Ue.length && j.push({ key: me.id, label: me.name, options: Ue });
      }
      const De = fe.filter((me) => !Ve.has(me.deptId));
      return De.length && j.push({ key: "__other", label: t.t("其他"), options: De }), j;
    }), G = e.computed(() => U.value.flatMap((T) => T.options)), k = e.computed(() => n.multiple ? n.values.filter(Boolean) : n.modelValue ? [n.modelValue] : []), h = (T) => k.value.includes(T), r = e.computed(() => n.multiple ? null : Q(n.modelValue)), H = e.computed(() => k.value.map(Q).filter((T) => !!T));
    function Q(T) {
      return T ? E.value.find((j) => j.value === T) ?? v.value.find((j) => j.value === T) ?? _.value.find((j) => j.value === T) ?? (() => {
        const j = I.value.people.find((Y) => Y.id === T), Z = n.names?.[T];
        return j || Z ? R(T, j?.name || Z.name, j?.deptId || "", j?.title, Z?.deptName || "") : null;
      })() : null;
    }
    const ne = (T) => `${y}-${T.value.replace(/[^A-Za-z0-9_-]/g, "_")}`;
    function q() {
      const T = f.value;
      if (!T) return;
      const j = T.getBoundingClientRect(), Z = window.innerHeight || 800, Y = Z - j.bottom - 12, ae = j.top - 12, fe = Y < 220 && ae > Y, Ve = Math.max(160, Math.min(340, fe ? ae : Y));
      c.value = {
        position: "fixed",
        left: `${Math.round(j.left)}px`,
        width: `${Math.round(Math.max(j.width, 260))}px`,
        maxHeight: `${Math.round(Ve)}px`,
        ...fe ? { bottom: `${Math.round(Z - j.top + 4)}px` } : { top: `${Math.round(j.bottom + 4)}px` }
      };
    }
    function B() {
      m.value && q();
    }
    function A() {
      if (n.disabled || m.value) return;
      D(), !n.people && !b.value && !d.value && (d.value = !0, Be().then((j) => {
        b.value = j;
      }).catch(() => {
      }).finally(() => {
        d.value = !1;
      })), i.value = "", m.value = !0;
      const T = G.value.findIndex((j) => h(j.value));
      g.value = T >= 0 ? T : 0, q(), window.addEventListener("scroll", B, !0), window.addEventListener("resize", B), e.nextTick(ce);
    }
    function K() {
      m.value && (m.value = !1, i.value = "", window.removeEventListener("scroll", B, !0), window.removeEventListener("resize", B));
    }
    function V(T) {
      if (!n.disabled) {
        if (T.target !== s.value && T.preventDefault(), m.value && T.target !== s.value) {
          K();
          return;
        }
        s.value?.focus(), A();
      }
    }
    function N() {
      K();
    }
    function S(T) {
      if (!T) return;
      const j = k.value;
      j.includes(T) ? u("update:values", j.filter((Z) => Z !== T)) : (!n.max || j.length < n.max) && u("update:values", [...j, T]), i.value = "";
    }
    function x() {
      if (n.multiple) {
        u("update:values", []);
        return;
      }
      re("");
    }
    function re(T) {
      if (n.multiple) {
        S(T);
        return;
      }
      T !== n.modelValue && (u("update:modelValue", T), u("change", T)), K(), s.value?.blur();
    }
    function ce() {
      const T = G.value[g.value];
      if (!T || !a.value) return;
      a.value.querySelector(`#${CSS.escape(ne(T))}`)?.scrollIntoView?.({ block: "nearest" });
    }
    function O(T) {
      if (n.multiple && T.key === "Backspace" && !i.value && k.value.length) {
        S(k.value[k.value.length - 1]);
        return;
      }
      if (!m.value && (T.key === "ArrowDown" || T.key === "Enter")) {
        T.preventDefault(), A();
        return;
      }
      if (!m.value) return;
      const j = G.value.length;
      if (T.key === "ArrowDown")
        T.preventDefault(), j && (g.value = (g.value + 1) % j), e.nextTick(ce);
      else if (T.key === "ArrowUp")
        T.preventDefault(), j && (g.value = (g.value - 1 + j) % j), e.nextTick(ce);
      else if (T.key === "Enter") {
        T.preventDefault();
        const Z = G.value[g.value];
        Z && re(Z.value);
      } else T.key === "Escape" ? (T.preventDefault(), T.stopPropagation(), K()) : T.key === "Tab" && K();
    }
    return e.watch(() => G.value.length, (T) => {
      g.value >= T && (g.value = Math.max(0, T - 1));
    }), e.watch(() => n.disabled, (T) => {
      T && K();
    }), e.onMounted(() => {
      !n.people && k.value.length && (d.value = !0, Be().then((T) => {
        b.value = T;
      }).catch(() => {
      }).finally(() => {
        d.value = !1;
      }));
    }), e.onBeforeUnmount(K), (T, j) => (e.openBlock(), e.createElementBlock(
      "div",
      {
        ref_key: "root",
        ref: f,
        class: e.normalizeClass(["mm-pss", { open: m.value, disabled: l.disabled, multi: l.multiple }]),
        onMousedown: V
      },
      [
        j[7] || (j[7] = e.createElementVNode(
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
          e.renderList(H.value, (Z) => (e.openBlock(), e.createElementBlock("span", {
            key: Z.value,
            class: "mm-pss__chip",
            "data-test": l.dataTest ? `${l.dataTest}-chip-${Z.value}` : void 0
          }, [
            e.createElementVNode(
              "span",
              {
                class: "mm-pss__av",
                style: e.normalizeStyle({ background: Z.color })
              },
              e.toDisplayString(Z.initial),
              5
              /* TEXT, STYLE */
            ),
            e.createTextVNode(
              e.toDisplayString(Z.label) + " ",
              1
              /* TEXT */
            ),
            l.disabled ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock("button", {
              key: 0,
              type: "button",
              class: "mm-pss__chip-x",
              "aria-label": T.$t("移除 {name}", { name: Z.label }),
              "data-test": l.dataTest ? `${l.dataTest}-chip-x-${Z.value}` : void 0,
              onMousedown: j[0] || (j[0] = e.withModifiers(() => {
              }, ["prevent", "stop"])),
              onClick: (Y) => S(Z.value)
            }, [...j[5] || (j[5] = [
              e.createElementVNode(
                "i",
                { class: "ri-close-line" },
                null,
                -1
                /* CACHED */
              )
            ])], 40, wa))
          ], 8, Da))),
          128
          /* KEYED_FRAGMENT */
        )) : e.createCommentVNode("v-if", !0),
        !l.multiple && !m.value && r.value ? (e.openBlock(), e.createElementBlock("span", {
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
            Ta,
            e.toDisplayString(r.value.label),
            1
            /* TEXT */
          ),
          r.value.sub ? (e.openBlock(), e.createElementBlock(
            "small",
            Ia,
            e.toDisplayString(r.value.sub),
            1
            /* TEXT */
          )) : e.createCommentVNode("v-if", !0)
        ], 8, Ca)) : e.createCommentVNode("v-if", !0),
        e.withDirectives(e.createElementVNode("input", {
          ref_key: "inputEl",
          ref: s,
          "onUpdate:modelValue": j[1] || (j[1] = (Z) => i.value = Z),
          class: e.normalizeClass(["mm-pss__input", { ghost: !l.multiple && !m.value && !!r.value }]),
          type: "text",
          role: "combobox",
          autocomplete: "off",
          spellcheck: "false",
          "aria-label": l.ariaLabel || o.value,
          "aria-expanded": m.value,
          "aria-autocomplete": "list",
          "aria-controls": $,
          "aria-activedescendant": m.value && G.value[g.value] ? ne(G.value[g.value]) : void 0,
          placeholder: l.multiple ? k.value.length ? "" : o.value : !m.value && r.value ? "" : o.value,
          disabled: l.disabled,
          "data-test": l.dataTest,
          onFocus: A,
          onInput: j[2] || (j[2] = (Z) => g.value = 0),
          onKeydown: O,
          onBlur: N
        }, null, 42, Ma), [
          [e.vModelText, i.value]
        ]),
        l.clearable && k.value.length && !l.disabled ? (e.openBlock(), e.createElementBlock("button", {
          key: 2,
          type: "button",
          class: "mm-pss__clear",
          "aria-label": T.$t("清除"),
          "data-test": l.dataTest ? `${l.dataTest}-clear` : void 0,
          onMousedown: j[3] || (j[3] = e.withModifiers(() => {
          }, ["prevent", "stop"])),
          onClick: x
        }, [...j[6] || (j[6] = [
          e.createElementVNode(
            "i",
            { class: "ri-close-circle-fill" },
            null,
            -1
            /* CACHED */
          )
        ])], 40, Aa)) : (e.openBlock(), e.createElementBlock("i", ja)),
        (e.openBlock(), e.createBlock(e.Teleport, { to: "body" }, [
          m.value ? (e.openBlock(), e.createElementBlock("div", {
            key: 0,
            id: $,
            ref_key: "popEl",
            ref: a,
            class: "mm-pss-pop",
            role: "listbox",
            "aria-multiselectable": l.multiple || void 0,
            style: e.normalizeStyle(c.value),
            "data-test": l.dataTest ? `${l.dataTest}-list` : void 0,
            onMousedown: j[4] || (j[4] = e.withModifiers(() => {
            }, ["prevent"]))
          }, [
            (e.openBlock(!0), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(U.value, (Z) => (e.openBlock(), e.createElementBlock(
                e.Fragment,
                {
                  key: Z.key
                },
                [
                  e.createElementVNode(
                    "div",
                    za,
                    e.toDisplayString(Z.label),
                    1
                    /* TEXT */
                  ),
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(Z.options, (Y) => (e.openBlock(), e.createElementBlock("div", {
                      id: ne(Y),
                      key: Y.value,
                      role: "option",
                      "aria-selected": h(Y.value),
                      class: e.normalizeClass(["mm-pss-pop__opt", { active: G.value[g.value]?.value === Y.value, sel: h(Y.value) }]),
                      "data-test": l.dataTest ? `${l.dataTest}-opt-${Y.value}` : void 0,
                      onMouseenter: (ae) => g.value = G.value.indexOf(Y),
                      onClick: (ae) => re(Y.value)
                    }, [
                      e.createElementVNode(
                        "span",
                        {
                          class: "mm-pss__av",
                          style: e.normalizeStyle({ background: Y.color })
                        },
                        e.toDisplayString(Y.initial),
                        5
                        /* TEXT, STYLE */
                      ),
                      e.createElementVNode(
                        "span",
                        Pa,
                        e.toDisplayString(Y.label),
                        1
                        /* TEXT */
                      ),
                      Y.sub ? (e.openBlock(), e.createElementBlock(
                        "small",
                        Ua,
                        e.toDisplayString(Y.sub),
                        1
                        /* TEXT */
                      )) : e.createCommentVNode("v-if", !0),
                      Y.hint ? (e.openBlock(), e.createElementBlock(
                        "em",
                        Oa,
                        e.toDisplayString(Y.hint),
                        1
                        /* TEXT */
                      )) : e.createCommentVNode("v-if", !0),
                      h(Y.value) ? (e.openBlock(), e.createElementBlock("i", Ra)) : e.createCommentVNode("v-if", !0)
                    ], 42, Fa))),
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
            G.value.length ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock(
              "div",
              qa,
              e.toDisplayString(d.value ? T.$t("正在加载人员…") : i.value.trim() ? T.$t("没有找到「{q}」", { q: i.value.trim() }) : T.$t("没有可选的人员")),
              1
              /* TEXT */
            ))
          ], 44, La)) : e.createCommentVNode("v-if", !0)
        ]))
      ],
      34
      /* CLASS, NEED_HYDRATION */
    ));
  }
}), Pe = /* @__PURE__ */ le(Ka, [["__scopeId", "data-v-051698b0"]]), Ha = { class: "mm-sa__head" }, Wa = { class: "ss-muted" }, Ga = ["aria-expanded"], Ya = {
  key: 0,
  class: "ss-note"
}, Ja = ["data-test"], Qa = { class: "mm-sa__who" }, Za = { class: "mm-sa__label" }, Xa = { class: "mm-sa__sample" }, xa = ["src"], eo = { class: "mm-sa__ops" }, to = ["disabled", "data-test", "onClick"], lo = { class: "ss-chip ok" }, no = ["onClick"], ao = ["disabled", "data-test", "onClick"], oo = {
  key: 2,
  class: "ss-chip warn"
}, so = {
  key: 0,
  class: "ss-note danger"
}, ro = { class: "ss-muted" }, io = /* @__PURE__ */ e.defineComponent({
  __name: "SpeakerAssignPanel",
  props: {
    detail: {}
  },
  emits: ["changed"],
  setup(l, { emit: p }) {
    const n = l, u = p, f = e.reactive({}), s = e.reactive({}), a = e.ref(""), m = e.ref(""), i = e.ref(""), g = e.ref(""), b = e.computed(() => n.detail.meeting), d = e.computed(() => b.value.status !== "pending_assign"), c = e.ref(!d.value), y = e.computed(() => ["pending_assign", "pending_confirm", "pending_review"].includes(b.value.status)), $ = e.ref({ depts: [], people: [] });
    e.onMounted(async () => {
      try {
        $.value = await Be();
      } catch {
      }
    });
    const o = e.computed(() => n.detail.names[b.value.hostId]?.name || ""), I = (R) => n.detail.names[R]?.name || R, F = e.computed(() => {
      const R = b.value.speakers.map((_) => {
        const E = b.value.segments.filter((U) => U.speakerLabel === _.label).sort((U, G) => U.start - G.start), v = E.filter((U) => U.text.trim()).slice(0, 2).map((U) => U.text.length > 60 ? `${U.text.slice(0, 60)}…` : U.text), w = E.reduce((U, G) => U + Math.max(0, G.end - G.start), 0);
        return { ..._, count: E.length, seconds: w, samples: v };
      });
      return [...R.filter((_) => !_.personId), ...R.filter((_) => _.personId)];
    }), P = e.computed(() => F.value.filter((R) => !R.personId));
    function L(R, _) {
      return b.value.speakers.find((E) => E.personId === R && E.label !== _)?.label || "";
    }
    function D(R, _) {
      i.value = R, s[R] = _ || "";
    }
    async function C(R) {
      if (f[R]) {
        const _ = f[R];
        f[R] = "", setTimeout(() => {
          f[R] = _;
        }, 0);
        return;
      }
      a.value = R, g.value = "";
      try {
        const _ = await W("meeting.speaker.clip", { id: b.value.id, label: R });
        if (!_?.dataUrl) throw new Error(t.t("这位发言人没有可试听的片段"));
        f[R] = _.dataUrl;
      } catch (_) {
        g.value = X.errorMessage(_);
      } finally {
        a.value = "";
      }
    }
    async function z(R) {
      const _ = s[R];
      if (_) {
        m.value = R, g.value = "";
        try {
          await W("meeting.speaker.assign", { id: b.value.id, label: R, personId: _ }), i.value = "", u("changed");
        } catch (E) {
          g.value = X.errorMessage(E);
        } finally {
          m.value = "";
        }
      }
    }
    return (R, _) => (e.openBlock(), e.createElementBlock(
      "section",
      {
        class: e.normalizeClass(["mm-sa", { quiet: d.value }]),
        "data-test": "mm-speaker-assign"
      },
      [
        e.createElementVNode("header", Ha, [
          e.createElementVNode(
            "h4",
            null,
            e.toDisplayString(d.value ? R.$t("更正发言人") : R.$t("指认发言人")),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "span",
            Wa,
            e.toDisplayString(d.value ? R.$t("声纹认错了：试听后整组改给正确的人；只是个别段认错，在下面的纪要里逐段改") : P.value.length ? R.$t("{n} 位没认出来 · 试听片段后选人", { n: P.value.length }) : R.$t("发言人都已认出")),
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
          d.value ? (e.openBlock(), e.createElementBlock("button", {
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
          ], 8, Ga)) : e.createCommentVNode("v-if", !0)
        ]),
        !l.detail.my.isHost && !d.value ? (e.openBlock(), e.createElementBlock("p", Ya, [
          _[3] || (_[3] = e.createElementVNode(
            "i",
            { class: "ri-time-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            e.toDisplayString(R.$t("等待主持人 {name} 指认发言人", { name: o.value })),
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
              e.renderList(F.value, (E) => (e.openBlock(), e.createElementBlock("article", {
                key: E.label,
                class: e.normalizeClass(["mm-sa__row", { unknown: !E.personId }]),
                "data-test": `mm-speaker-${E.label}`
              }, [
                e.createElementVNode("div", Qa, [
                  e.createElementVNode(
                    "span",
                    Za,
                    e.toDisplayString(E.label),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "small",
                    null,
                    e.toDisplayString(R.$t("{n} 段 · 约 {t}", { n: E.count, t: e.unref(Te)(E.seconds) })),
                    1
                    /* TEXT */
                  )
                ]),
                e.createElementVNode("div", Xa, [
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(E.samples, (v, w) => (e.openBlock(), e.createElementBlock(
                      "p",
                      { key: w },
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
                  }, null, 8, xa)) : e.createCommentVNode("v-if", !0)
                ]),
                e.createElementVNode("div", eo, [
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn sm",
                    disabled: a.value === E.label,
                    "data-test": `mm-speaker-clip-${E.label}`,
                    onClick: (v) => C(E.label)
                  }, [
                    e.createElementVNode(
                      "i",
                      {
                        class: e.normalizeClass(a.value === E.label ? "ri-loader-4-line spin" : "ri-play-circle-line")
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
                  ], 8, to),
                  E.personId && i.value !== E.label ? (e.openBlock(), e.createElementBlock(
                    e.Fragment,
                    { key: 0 },
                    [
                      e.createElementVNode("span", lo, [
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
                      l.detail.my.isHost && y.value ? (e.openBlock(), e.createElementBlock("button", {
                        key: 0,
                        type: "button",
                        class: "ss-link",
                        onClick: (v) => D(E.label, E.personId)
                      }, e.toDisplayString(R.$t("更正")), 9, no)) : e.createCommentVNode("v-if", !0)
                    ],
                    64
                    /* STABLE_FRAGMENT */
                  )) : l.detail.my.isHost && y.value ? (e.openBlock(), e.createElementBlock(
                    e.Fragment,
                    { key: 1 },
                    [
                      e.createVNode(Pe, {
                        "model-value": s[E.label] || "",
                        "onUpdate:modelValue": (v) => s[E.label] = v,
                        class: "mm-sa__select",
                        people: $.value,
                        pinned: b.value.attendeeIds,
                        "pinned-label": R.$t("本场参会人"),
                        names: l.detail.names,
                        hint: (v) => L(v, E.label) ? R.$t("（已指认给 {l}）", { l: L(v, E.label) }) : "",
                        "aria-label": R.$t("选择发言人…"),
                        "data-test": `mm-speaker-pick-${E.label}`
                      }, null, 8, ["model-value", "onUpdate:modelValue", "people", "pinned", "pinned-label", "names", "hint", "aria-label", "data-test"]),
                      e.createElementVNode("button", {
                        type: "button",
                        class: "ss-btn sm primary",
                        disabled: !s[E.label] || m.value === E.label,
                        "data-test": `mm-speaker-save-${E.label}`,
                        onClick: (v) => z(E.label)
                      }, [
                        e.createElementVNode(
                          "i",
                          {
                            class: e.normalizeClass(m.value === E.label ? "ri-loader-4-line spin" : "ri-check-line")
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
                      ], 8, ao),
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
                    oo,
                    e.toDisplayString(R.$t("未识别")),
                    1
                    /* TEXT */
                  ))
                ])
              ], 10, Ja))),
              128
              /* KEYED_FRAGMENT */
            )),
            g.value ? (e.openBlock(), e.createElementBlock("p", so, [
              _[4] || (_[4] = e.createElementVNode(
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
            ])) : e.createCommentVNode("v-if", !0),
            e.createElementVNode(
              "small",
              ro,
              e.toDisplayString(d.value ? R.$t("改给别人后，新的发言人要重新确认，其他人的确认保留。") : R.$t("只和本场参会人比对声纹；没来得及加进参会人的人也能直接选。全部指认完自动进入发言确认，系统通知每位发言人核对本人发言。")),
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
}), co = /* @__PURE__ */ le(io, [["__scopeId", "data-v-a6aa3aa3"]]), mo = {
  class: "mm-side",
  "data-test": "mm-decisions"
}, uo = ["disabled"], po = ["disabled"], vo = {
  key: 0,
  class: "ss-muted"
}, ko = {
  key: 1,
  class: "mm-decisions"
}, go = { class: "mm-summary" }, yo = {
  key: 3,
  class: "ss-muted"
}, fo = {
  key: 4,
  class: "ss-muted"
}, Eo = {
  key: 5,
  class: "ss-muted"
}, No = {
  key: 1,
  class: "mm-mde",
  "data-test": "mm-minutes-editor"
}, Vo = { class: "mm-mde__no" }, $o = ["onUpdate:modelValue", "aria-label", "data-test"], ho = ["aria-label", "onClick"], bo = ["onUpdate:modelValue", "aria-label", "data-test"], _o = { class: "ss-actions" }, Bo = ["disabled"], So = ["disabled"], Do = {
  key: 2,
  class: "ss-note"
}, wo = {
  key: 3,
  class: "ss-note danger"
}, Co = /* @__PURE__ */ e.defineComponent({
  __name: "MinutesDraftSide",
  props: {
    detail: {}
  },
  emits: ["changed"],
  setup(l, { emit: p }) {
    const n = l, u = p, f = e.computed(() => n.detail.meeting), s = e.computed(() => !["finalized", "ended", "pending_owner", "plan_confirm", "dispatched"].includes(f.value.status)), a = e.computed(() => n.detail.my.isHost && ["pending_assign", "pending_confirm", "pending_review"].includes(f.value.status)), m = e.computed(() => n.detail.my.isHost && !s.value && n.detail.projectStatus !== "archived"), i = e.ref(!1), g = e.ref(""), b = e.ref(""), d = e.ref("");
    let c = 0;
    const y = e.reactive({ decisions: [], summary: ["", "", ""] });
    function $() {
      y.decisions = f.value.decisions.map((P) => ({ key: ++c, id: P.id, text: P.text })), y.summary = [0, 1, 2].map((P) => f.value.summaryLines[P] || ""), b.value = "", d.value = "", i.value = !0;
    }
    function o() {
      y.decisions.push({ key: ++c, text: "" });
    }
    async function I() {
      g.value = "save", b.value = "";
      try {
        await W("meeting.minutes.save", {
          id: f.value.id,
          decisions: y.decisions.map((P) => ({ ...P.id ? { id: P.id } : {}, text: P.text })),
          summaryLines: y.summary.map((P) => P.trim()).filter(Boolean)
        }), i.value = !1, u("changed");
      } catch (P) {
        b.value = X.errorMessage(P);
      } finally {
        g.value = "";
      }
    }
    async function F() {
      if (window.confirm(t.t("按现在的发言人和文字重新整理议题、决议和摘要？会覆盖现在的内容（包括你手改过的）。"))) {
        g.value = "ai", b.value = "", d.value = "";
        try {
          const P = await W("meeting.minutes.reorganize", { id: f.value.id });
          d.value = P?.note || t.t("已重新整理"), u("changed");
        } catch (P) {
          b.value = X.errorMessage(P);
        } finally {
          g.value = "";
        }
      }
    }
    return (P, L) => (e.openBlock(), e.createElementBlock("section", mo, [
      e.createElementVNode("h5", null, [
        e.createTextVNode(
          e.toDisplayString(P.$t("AI 识别的决议事项")) + " ",
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
        L[2] || (L[2] = e.createElementVNode(
          "span",
          { class: "mm-grow" },
          null,
          -1
          /* CACHED */
        )),
        (a.value || m.value) && !i.value ? (e.openBlock(), e.createElementBlock(
          e.Fragment,
          { key: 0 },
          [
            e.createElementVNode("button", {
              type: "button",
              class: "ss-link",
              disabled: !!g.value,
              "data-test": "mm-minutes-edit",
              onClick: $
            }, [
              L[1] || (L[1] = e.createElementVNode(
                "i",
                { class: "ri-pencil-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(P.$t("编辑")),
                1
                /* TEXT */
              )
            ], 8, uo),
            a.value ? (e.openBlock(), e.createElementBlock("button", {
              key: 0,
              type: "button",
              class: "ss-link",
              disabled: !!g.value || !f.value.segments.length,
              "data-test": "mm-minutes-reorganize",
              onClick: F
            }, [
              e.createElementVNode(
                "i",
                {
                  class: e.normalizeClass(g.value === "ai" ? "ri-loader-4-line spin" : "ri-sparkling-line")
                },
                null,
                2
                /* CLASS */
              ),
              e.createTextVNode(
                e.toDisplayString(P.$t("AI 重新整理")),
                1
                /* TEXT */
              )
            ], 8, po)) : e.createCommentVNode("v-if", !0)
          ],
          64
          /* STABLE_FRAGMENT */
        )) : e.createCommentVNode("v-if", !0)
      ]),
      i.value ? (e.openBlock(), e.createElementBlock("div", No, [
        (e.openBlock(!0), e.createElementBlock(
          e.Fragment,
          null,
          e.renderList(y.decisions, (D, C) => (e.openBlock(), e.createElementBlock("div", {
            key: D.key,
            class: "mm-mde__row"
          }, [
            e.createElementVNode(
              "span",
              Vo,
              e.toDisplayString(C + 1),
              1
              /* TEXT */
            ),
            e.withDirectives(e.createElementVNode("textarea", {
              "onUpdate:modelValue": (z) => D.text = z,
              rows: "2",
              "aria-label": P.$t("决议 {n}", { n: C + 1 }),
              "data-test": `mm-decision-input-${C}`
            }, null, 8, $o), [
              [e.vModelText, D.text]
            ]),
            e.createElementVNode("button", {
              type: "button",
              class: "mm-mde__del",
              "aria-label": P.$t("删除这条决议"),
              onClick: (z) => y.decisions.splice(C, 1)
            }, [...L[3] || (L[3] = [
              e.createElementVNode(
                "i",
                { class: "ri-close-line" },
                null,
                -1
                /* CACHED */
              )
            ])], 8, ho)
          ]))),
          128
          /* KEYED_FRAGMENT */
        )),
        e.createElementVNode("button", {
          type: "button",
          class: "ss-link",
          "data-test": "mm-decision-add",
          onClick: o
        }, [
          L[4] || (L[4] = e.createElementVNode(
            "i",
            { class: "ri-add-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            e.toDisplayString(P.$t("加一条决议")),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode(
          "h6",
          null,
          e.toDisplayString(P.$t("纪要摘要（最多 3 行）")),
          1
          /* TEXT */
        ),
        (e.openBlock(!0), e.createElementBlock(
          e.Fragment,
          null,
          e.renderList(y.summary, (D, C) => e.withDirectives((e.openBlock(), e.createElementBlock("input", {
            key: C,
            "onUpdate:modelValue": (z) => y.summary[C] = z,
            type: "text",
            maxlength: "200",
            "aria-label": P.$t("摘要第 {n} 行", { n: C + 1 }),
            "data-test": `mm-summary-input-${C}`
          }, null, 8, bo)), [
            [e.vModelText, y.summary[C]]
          ])),
          128
          /* KEYED_FRAGMENT */
        )),
        e.createElementVNode("div", _o, [
          e.createElementVNode("button", {
            type: "button",
            class: "ss-btn sm primary",
            disabled: !!g.value,
            "data-test": "mm-minutes-save",
            onClick: I
          }, [
            e.createElementVNode(
              "i",
              {
                class: e.normalizeClass(g.value === "save" ? "ri-loader-4-line spin" : "ri-check-line")
              },
              null,
              2
              /* CLASS */
            ),
            e.createTextVNode(
              e.toDisplayString(P.$t("保存")),
              1
              /* TEXT */
            )
          ], 8, Bo),
          e.createElementVNode("button", {
            type: "button",
            class: "ss-link",
            disabled: !!g.value,
            onClick: L[0] || (L[0] = (D) => i.value = !1)
          }, e.toDisplayString(P.$t("取消")), 9, So)
        ])
      ])) : (e.openBlock(), e.createElementBlock(
        e.Fragment,
        { key: 0 },
        [
          f.value.decisions.length ? (e.openBlock(), e.createElementBlock("ol", ko, [
            (e.openBlock(!0), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(f.value.decisions, (D, C) => (e.openBlock(), e.createElementBlock("li", {
                key: D.id
              }, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(C + 1),
                  1
                  /* TEXT */
                ),
                e.createTextVNode(
                  e.toDisplayString(D.text),
                  1
                  /* TEXT */
                )
              ]))),
              128
              /* KEYED_FRAGMENT */
            ))
          ])) : (e.openBlock(), e.createElementBlock(
            "p",
            vo,
            e.toDisplayString(s.value ? P.$t("处理完成后在这里列出会上形成的决议") : P.$t("没有识别到决议事项")),
            1
            /* TEXT */
          )),
          f.value.summaryLines.length && (!s.value || a.value) ? (e.openBlock(), e.createElementBlock(
            e.Fragment,
            { key: 2 },
            [
              e.createElementVNode(
                "h6",
                null,
                e.toDisplayString(s.value ? P.$t("纪要摘要（草稿）") : P.$t("纪要摘要")),
                1
                /* TEXT */
              ),
              e.createElementVNode("ul", go, [
                (e.openBlock(!0), e.createElementBlock(
                  e.Fragment,
                  null,
                  e.renderList(f.value.summaryLines, (D, C) => (e.openBlock(), e.createElementBlock(
                    "li",
                    { key: C },
                    e.toDisplayString(D),
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
          a.value ? (e.openBlock(), e.createElementBlock(
            "small",
            yo,
            e.toDisplayString(P.$t("AI 初稿，定稿前请核对：决议会拆成任务，摘要会进纪要通知。发言人改过后可「AI 重新整理」。")),
            1
            /* TEXT */
          )) : s.value ? (e.openBlock(), e.createElementBlock(
            "small",
            fo,
            e.toDisplayString(P.$t("终审通过后可选择「生成任务」或「无需生成任务」")),
            1
            /* TEXT */
          )) : m.value ? (e.openBlock(), e.createElementBlock(
            "small",
            Eo,
            e.toDisplayString(P.$t("纪要已定稿：发现错字可以编辑修正，已拆出的任务不跟着变。")),
            1
            /* TEXT */
          )) : e.createCommentVNode("v-if", !0)
        ],
        64
        /* STABLE_FRAGMENT */
      )),
      d.value ? (e.openBlock(), e.createElementBlock("p", Do, [
        L[5] || (L[5] = e.createElementVNode(
          "i",
          { class: "ri-information-line" },
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
      b.value ? (e.openBlock(), e.createElementBlock("p", wo, [
        L[6] || (L[6] = e.createElementVNode(
          "i",
          { class: "ri-error-warning-line" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(b.value),
          1
          /* TEXT */
        )
      ])) : e.createCommentVNode("v-if", !0)
    ]));
  }
}), To = /* @__PURE__ */ le(Co, [["__scopeId", "data-v-6868f958"]]), Io = ["data-test"], Mo = ["disabled", "data-test"], Ao = {
  key: 0,
  class: "ss-note danger"
}, jo = /* @__PURE__ */ e.defineComponent({
  __name: "SegmentSpeakerPicker",
  props: {
    detail: {},
    segmentId: {}
  },
  emits: ["done"],
  setup(l, { emit: p }) {
    const n = l, u = p, f = e.computed(() => n.detail.meeting), s = e.computed(() => f.value.segments.find((o) => o.id === n.segmentId)?.speakerLabel || ""), a = e.ref(`label:${s.value}`), m = e.ref(!1), i = e.ref(""), g = e.ref({ depts: [], people: [] }), b = e.computed(() => f.value.speakers.map((o) => ({
      value: `label:${o.label}`,
      label: o.personId ? `${Qe(n.detail, o.label)}（${o.label}）` : o.label,
      sub: o.personId && n.detail.names[o.personId]?.deptName || ""
    }))), d = e.computed(() => f.value.speakers.map((o) => o.personId).filter(Boolean)), c = e.computed({
      get: () => a.value.startsWith("person:") ? a.value.slice(7) : a.value,
      set: (o) => {
        a.value = o ? o.startsWith("label:") ? o : `person:${o}` : "";
      }
    }), y = e.computed(() => a.value && a.value !== `label:${s.value}`);
    async function $() {
      if (!y.value || m.value) return;
      const [o, I] = [a.value.slice(0, a.value.indexOf(":")), a.value.slice(a.value.indexOf(":") + 1)];
      m.value = !0, i.value = "";
      try {
        await W("meeting.segment.speaker", { id: f.value.id, segmentId: n.segmentId, ...o === "label" ? { label: I } : { personId: I } }), u("done", !0);
      } catch (F) {
        i.value = X.errorMessage(F);
      } finally {
        m.value = !1;
      }
    }
    return e.onMounted(async () => {
      try {
        g.value = await Be();
      } catch (o) {
        i.value = X.errorMessage(o);
      }
    }), (o, I) => (e.openBlock(), e.createElementBlock("div", {
      class: "mm-ssp",
      "data-test": `mm-seg-speaker-${l.segmentId}`
    }, [
      e.createVNode(Pe, {
        modelValue: c.value,
        "onUpdate:modelValue": I[0] || (I[0] = (F) => c.value = F),
        class: "mm-ssp__select",
        people: g.value,
        extras: b.value,
        "extras-label": o.$t("本场发言人"),
        exclude: d.value,
        "aria-label": o.$t("这段的发言人"),
        "data-test": `mm-seg-speaker-pick-${l.segmentId}`
      }, null, 8, ["modelValue", "people", "extras", "extras-label", "exclude", "aria-label", "data-test"]),
      e.createElementVNode("button", {
        type: "button",
        class: "ss-btn sm primary",
        disabled: m.value || !y.value,
        "data-test": `mm-seg-speaker-save-${l.segmentId}`,
        onClick: $
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
          e.toDisplayString(o.$t("改给这个人")),
          1
          /* TEXT */
        )
      ], 8, Mo),
      e.createElementVNode(
        "button",
        {
          type: "button",
          class: "ss-link",
          onClick: I[1] || (I[1] = (F) => u("done", !1))
        },
        e.toDisplayString(o.$t("取消")),
        1
        /* TEXT */
      ),
      i.value ? (e.openBlock(), e.createElementBlock("p", Ao, [
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
    ], 8, Io));
  }
}), $t = /* @__PURE__ */ le(jo, [["__scopeId", "data-v-da87433b"]]), Lo = {
  class: "mm-min",
  "data-test": "mm-minutes"
}, zo = { class: "mm-min__bar" }, Fo = {
  class: "mm-seg-switch",
  role: "tablist"
}, Po = ["aria-selected"], Uo = ["aria-selected"], Oo = { class: "ss-muted" }, Ro = {
  key: 0,
  class: "mm-min__empty"
}, qo = ["data-test"], Ko = ["aria-expanded", "onClick"], Ho = {
  key: 0,
  class: "mm-topic__body"
}, Wo = { class: "mm-seg__body" }, Go = { class: "mm-seg__who" }, Yo = { class: "mm-seg__name" }, Jo = ["title", "data-test", "onClick"], Qo = { key: 1 }, Zo = {
  key: 2,
  class: "mm-mini brand"
}, Xo = ["title"], xo = ["title"], es = ["data-test"], ts = { class: "ss-actions" }, ls = ["disabled", "data-test", "onClick"], ns = {
  key: 2,
  class: "mm-seg__text"
}, as = {
  key: 3,
  class: "mm-seg__return"
}, os = ["placeholder", "data-test"], ss = ["disabled", "data-test", "onClick"], rs = {
  key: 0,
  class: "mm-seg__ops"
}, is = ["data-test", "onClick"], cs = ["data-test", "onClick"], ds = ["data-test", "onClick"], ms = { class: "mm-timeline" }, us = { class: "mm-seg__body" }, ps = { class: "mm-seg__who" }, vs = { class: "mm-seg__name" }, ks = ["title", "data-test", "onClick"], gs = { key: 1 }, ys = {
  key: 2,
  class: "mm-mini brand"
}, fs = ["title"], Es = ["title"], Ns = { class: "ss-actions" }, Vs = ["disabled", "onClick"], $s = {
  key: 2,
  class: "mm-seg__text"
}, hs = {
  key: 3,
  class: "mm-seg__return"
}, bs = ["placeholder"], _s = ["disabled", "onClick"], Bs = {
  key: 0,
  class: "mm-seg__ops"
}, Ss = ["data-test", "onClick"], Ds = ["onClick"], ws = ["onClick"], Cs = {
  key: 3,
  class: "ss-note danger"
}, Ts = /* @__PURE__ */ e.defineComponent({
  __name: "MinutesPanel",
  props: {
    detail: {},
    anchor: {},
    anchorSeq: {}
  },
  emits: ["changed"],
  setup(l, { emit: p }) {
    const n = l, u = p, f = e.ref("topic"), s = e.ref(/* @__PURE__ */ new Set()), a = e.ref(""), m = e.ref(""), i = e.ref(""), g = e.ref(""), b = e.ref(""), d = e.ref(!1), c = e.ref(""), y = e.computed(() => n.detail.meeting), $ = e.computed(() => te.value?.me?.person?.id), o = e.computed(() => new Map(y.value.segments.map((O) => [O.id, O]))), I = e.computed(() => pl(n.detail)), F = e.computed(() => [...y.value.segments].sort((O, T) => O.start - T.start)), P = e.computed(() => y.value.confirmations.find((O) => O.personId === $.value)), L = e.computed(() => y.value.status === "pending_review" && n.detail.my.isHost), D = e.computed(() => n.detail.my.isHost && ["pending_assign", "pending_confirm", "pending_review"].includes(y.value.status)), C = ["finalized", "ended", "pending_owner", "plan_confirm", "dispatched"], z = e.computed(() => C.includes(y.value.status)), R = e.computed(() => z.value && n.detail.my.isHost && n.detail.projectStatus !== "archived"), _ = e.computed(() => y.value.files.some((O) => O.kind === "audio" || O.kind === "video")), E = e.computed(() => {
      const O = (y.value.topics || []).length, T = O ? t.t("AI 整理 · {n} 个议题", { n: O }) : t.t("AI 整理");
      return L.value ? `${T} · ${t.t("悬停段落可修改、退回或改发言人")}` : y.value.status === "pending_confirm" && n.detail.my.isHost ? `${T} · ${t.t("悬停段落可补全文字或改发言人")}` : y.value.status === "pending_confirm" && P.value ? `${T} · ${t.t("悬停本人发言可补全或修改")}` : D.value ? `${T} · ${t.t("发言人认错了：悬停段落可改发言人")}` : R.value ? `${T} · ${t.t("纪要已定稿；发现错字可悬停段落修改")}` : z.value ? `${T} · ${t.t("纪要已定稿")}` : T;
    });
    function v(O) {
      return o.value.get(O)?.speakerLabel || "";
    }
    function w(O) {
      return Qe(n.detail, v(O));
    }
    function U(O) {
      return ul(n.detail, v(O), $.value);
    }
    function G(O) {
      return L.value || R.value ? !0 : y.value.status !== "pending_confirm" || n.detail.projectStatus === "archived" ? !1 : n.detail.my.isHost || U(O);
    }
    function k(O) {
      if (!L.value) return !1;
      const T = Me(y.value, v(O));
      return !!T && y.value.confirmations.some((j) => j.personId === T);
    }
    function h(O) {
      return {
        class: ["mm-seg", { own: U(O), hoverable: G(O) || k(O) || D.value, hl: n.anchor === O, editing: a.value === O || i.value === O || b.value === O }],
        "data-seg": O,
        "data-test": `mm-seg-${O}`
      };
    }
    function r(O) {
      return s.value.has(O);
    }
    function H(O) {
      const T = new Set(s.value);
      T.has(O) ? T.delete(O) : T.add(O), s.value = T;
    }
    e.watch(() => I.value.map((O) => O.id).join("|"), () => {
      const O = I.value[0]?.id, T = new Set([...s.value].filter((j) => I.value.some((Z) => Z.id === j)));
      !T.size && O && T.add(O), s.value = T;
    }, { immediate: !0 }), e.watch(() => [n.anchor, n.anchorSeq], async () => {
      const O = n.anchor;
      if (!O || !o.value.has(O)) return;
      const T = I.value.find((Y) => Y.segmentIds.includes(O));
      T && !s.value.has(T.id) && (s.value = /* @__PURE__ */ new Set([...s.value, T.id])), await e.nextTick();
      const j = typeof CSS < "u" && typeof CSS.escape == "function" ? CSS.escape(O) : O.replace(/["\\]/g, "\\$&");
      document.querySelector(`[data-seg="${j}"]`)?.scrollIntoView?.({ block: "center", behavior: "smooth" });
    }, { immediate: !0 });
    const Q = e.ref(""), ne = e.ref(""), q = /* @__PURE__ */ new Map();
    let B = null;
    function A(O) {
      return ne.value === O ? "ri-loader-4-line spin" : Q.value === O ? "ri-pause-fill" : "ri-play-fill";
    }
    async function K(O) {
      if (Q.value === O && B) {
        B.pause(), Q.value = "";
        return;
      }
      B?.pause(), Q.value = "", ne.value = O, c.value = "";
      try {
        let T = q.get(O);
        if (!T) {
          if (T = (await W("meeting.segment.audio", { id: y.value.id, segmentId: O }))?.dataUrl || "", !T) throw new Error(t.t("这段没有可播放的原声"));
          q.size >= 30 && q.delete(q.keys().next().value), q.set(O, T);
        }
        B || (B = new Audio(), B.onended = () => {
          Q.value = "";
        }), B.src = T, await B.play(), Q.value = O;
      } catch (T) {
        c.value = X.errorMessage(T);
      } finally {
        ne.value = "";
      }
    }
    e.onBeforeUnmount(() => {
      B?.pause(), B = null;
    });
    function V(O) {
      a.value = "", i.value = "", b.value = O;
    }
    function N(O) {
      b.value = "", O && u("changed");
    }
    function S(O) {
      b.value = "", i.value = "", a.value = O, m.value = o.value.get(O)?.text || "";
    }
    function x(O) {
      a.value = "", b.value = "", i.value = O, g.value = "";
    }
    async function re(O) {
      const T = m.value.trim();
      if (!(!T || d.value)) {
        d.value = !0, c.value = "";
        try {
          await W("meeting.segment.edit", { id: y.value.id, segmentId: O, text: T }), a.value = "", u("changed");
        } catch (j) {
          c.value = X.errorMessage(j);
        } finally {
          d.value = !1;
        }
      }
    }
    async function ce(O) {
      const T = Me(y.value, v(O));
      if (!T || d.value) return;
      const j = n.detail.names[T]?.name || "";
      if (window.confirm(t.t("把这段退回给 {name} 重新确认？只有 {name} 需要重新确认。", { name: j }))) {
        d.value = !0, c.value = "";
        try {
          await W("meeting.review.return", { id: y.value.id, personId: T, note: g.value.trim() }), i.value = "", u("changed");
        } catch (Z) {
          c.value = X.errorMessage(Z);
        } finally {
          d.value = !1;
        }
      }
    }
    return (O, T) => (e.openBlock(), e.createElementBlock("section", Lo, [
      e.createElementVNode("div", zo, [
        e.createElementVNode("div", Fo, [
          e.createElementVNode("button", {
            type: "button",
            role: "tab",
            class: e.normalizeClass({ on: f.value === "topic" }),
            "aria-selected": f.value === "topic",
            "data-test": "mm-minutes-topic",
            onClick: T[0] || (T[0] = (j) => f.value = "topic")
          }, e.toDisplayString(O.$t("按议题")), 11, Po),
          e.createElementVNode("button", {
            type: "button",
            role: "tab",
            class: e.normalizeClass({ on: f.value === "timeline" }),
            "aria-selected": f.value === "timeline",
            "data-test": "mm-minutes-timeline",
            onClick: T[1] || (T[1] = (j) => f.value = "timeline")
          }, e.toDisplayString(O.$t("按时间线")), 11, Uo)
        ]),
        e.createElementVNode(
          "span",
          Oo,
          e.toDisplayString(E.value),
          1
          /* TEXT */
        )
      ]),
      y.value.segments.length ? f.value === "topic" ? (e.openBlock(), e.createElementBlock(
        e.Fragment,
        { key: 1 },
        [
          e.createCommentVNode(" 按议题 "),
          (e.openBlock(!0), e.createElementBlock(
            e.Fragment,
            null,
            e.renderList(I.value, (j, Z) => (e.openBlock(), e.createElementBlock("div", {
              key: j.id,
              class: e.normalizeClass(["mm-topic", { open: r(j.id) }]),
              "data-test": `mm-topic-${j.id}`
            }, [
              e.createElementVNode("button", {
                type: "button",
                class: "mm-topic__head",
                "aria-expanded": r(j.id),
                onClick: (Y) => H(j.id)
              }, [
                e.createElementVNode(
                  "i",
                  {
                    class: e.normalizeClass(r(j.id) ? "ri-arrow-down-s-line" : "ri-arrow-right-s-line")
                  },
                  null,
                  2
                  /* CLASS */
                ),
                e.createElementVNode(
                  "strong",
                  null,
                  e.toDisplayString(j.id === "__rest" ? j.title : O.$t("议题{n} · {title}", { n: e.unref(cl)(Z), title: j.title })),
                  1
                  /* TEXT */
                ),
                e.createElementVNode("small", null, [
                  e.createTextVNode(
                    e.toDisplayString(O.$t("{n} 段", { n: j.segmentIds.length })),
                    1
                    /* TEXT */
                  ),
                  !r(j.id) && j.speakers.length ? (e.openBlock(), e.createElementBlock(
                    e.Fragment,
                    { key: 0 },
                    [
                      e.createTextVNode(
                        " · " + e.toDisplayString(j.speakers.join(e.unref(t.listSeparator)())),
                        1
                        /* TEXT */
                      )
                    ],
                    64
                    /* STABLE_FRAGMENT */
                  )) : e.createCommentVNode("v-if", !0)
                ])
              ], 8, Ko),
              r(j.id) ? (e.openBlock(), e.createElementBlock("div", Ho, [
                (e.openBlock(!0), e.createElementBlock(
                  e.Fragment,
                  null,
                  e.renderList(j.segmentIds, (Y) => (e.openBlock(), e.createElementBlock(
                    e.Fragment,
                    { key: Y },
                    [
                      o.value.get(Y) ? (e.openBlock(), e.createElementBlock(
                        "div",
                        e.mergeProps({
                          key: 0,
                          ref_for: !0
                        }, h(Y)),
                        [
                          e.createElementVNode(
                            "span",
                            {
                              class: "mm-av",
                              style: e.normalizeStyle({ background: e.unref(oe)(w(Y)).color })
                            },
                            e.toDisplayString(e.unref(oe)(w(Y)).text),
                            5
                            /* TEXT, STYLE */
                          ),
                          e.createElementVNode("div", Wo, [
                            e.createElementVNode("div", Go, [
                              e.createElementVNode(
                                "span",
                                Yo,
                                e.toDisplayString(w(Y)),
                                1
                                /* TEXT */
                              ),
                              _.value ? (e.openBlock(), e.createElementBlock("button", {
                                key: 0,
                                type: "button",
                                class: e.normalizeClass(["mm-play", { on: Q.value === Y }]),
                                title: Q.value === Y ? O.$t("暂停") : O.$t("播放这段原声"),
                                "data-test": `mm-seg-play-${Y}`,
                                onClick: (ae) => K(Y)
                              }, [
                                e.createElementVNode(
                                  "i",
                                  {
                                    class: e.normalizeClass(A(Y))
                                  },
                                  null,
                                  2
                                  /* CLASS */
                                ),
                                e.createElementVNode(
                                  "time",
                                  null,
                                  e.toDisplayString(e.unref(Te)(o.value.get(Y).start)),
                                  1
                                  /* TEXT */
                                )
                              ], 10, Jo)) : (e.openBlock(), e.createElementBlock(
                                "time",
                                Qo,
                                e.toDisplayString(e.unref(Te)(o.value.get(Y).start)),
                                1
                                /* TEXT */
                              )),
                              U(Y) ? (e.openBlock(), e.createElementBlock(
                                "span",
                                Zo,
                                e.toDisplayString(O.$t("本人")),
                                1
                                /* TEXT */
                              )) : e.createCommentVNode("v-if", !0),
                              o.value.get(Y).originalText !== void 0 ? (e.openBlock(), e.createElementBlock("span", {
                                key: 3,
                                class: "mm-mini",
                                title: O.$t("原文：{t}", { t: o.value.get(Y).originalText || "" })
                              }, e.toDisplayString(O.$t("已修改")), 9, Xo)) : e.createCommentVNode("v-if", !0),
                              o.value.get(Y).originalSpeakerLabel !== void 0 ? (e.openBlock(), e.createElementBlock("span", {
                                key: 4,
                                class: "mm-mini",
                                title: O.$t("识别时是 {l}", { l: o.value.get(Y).originalSpeakerLabel })
                              }, e.toDisplayString(O.$t("已改发言人")), 9, xo)) : e.createCommentVNode("v-if", !0)
                            ]),
                            b.value === Y ? (e.openBlock(), e.createBlock($t, {
                              key: 0,
                              detail: l.detail,
                              "segment-id": Y,
                              onDone: N
                            }, null, 8, ["detail", "segment-id"])) : e.createCommentVNode("v-if", !0),
                            a.value === Y ? (e.openBlock(), e.createElementBlock(
                              e.Fragment,
                              { key: 1 },
                              [
                                e.withDirectives(e.createElementVNode("textarea", {
                                  "onUpdate:modelValue": T[2] || (T[2] = (ae) => m.value = ae),
                                  class: "mm-seg__edit",
                                  rows: "3",
                                  "data-test": `mm-seg-edit-${Y}`
                                }, null, 8, es), [
                                  [e.vModelText, m.value]
                                ]),
                                e.createElementVNode("div", ts, [
                                  e.createElementVNode("button", {
                                    type: "button",
                                    class: "ss-btn sm primary",
                                    disabled: d.value || !m.value.trim(),
                                    "data-test": `mm-seg-save-${Y}`,
                                    onClick: (ae) => re(Y)
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
                                      e.toDisplayString(O.$t("保存")),
                                      1
                                      /* TEXT */
                                    )
                                  ], 8, ls),
                                  e.createElementVNode(
                                    "button",
                                    {
                                      type: "button",
                                      class: "ss-link",
                                      onClick: T[3] || (T[3] = (ae) => a.value = "")
                                    },
                                    e.toDisplayString(O.$t("取消")),
                                    1
                                    /* TEXT */
                                  )
                                ])
                              ],
                              64
                              /* STABLE_FRAGMENT */
                            )) : (e.openBlock(), e.createElementBlock(
                              "p",
                              ns,
                              e.toDisplayString(o.value.get(Y).text),
                              1
                              /* TEXT */
                            )),
                            i.value === Y ? (e.openBlock(), e.createElementBlock("div", as, [
                              e.withDirectives(e.createElementVNode("input", {
                                "onUpdate:modelValue": T[4] || (T[4] = (ae) => g.value = ae),
                                type: "text",
                                placeholder: O.$t("退回原因（发言人会看到），例如：这段数字需要核实"),
                                "data-test": `mm-seg-return-note-${Y}`
                              }, null, 8, os), [
                                [e.vModelText, g.value]
                              ]),
                              e.createElementVNode("button", {
                                type: "button",
                                class: "ss-btn sm danger",
                                disabled: d.value,
                                "data-test": `mm-seg-return-ok-${Y}`,
                                onClick: (ae) => ce(Y)
                              }, e.toDisplayString(O.$t("确认退回")), 9, ss),
                              e.createElementVNode(
                                "button",
                                {
                                  type: "button",
                                  class: "ss-link",
                                  onClick: T[5] || (T[5] = (ae) => i.value = "")
                                },
                                e.toDisplayString(O.$t("取消")),
                                1
                                /* TEXT */
                              )
                            ])) : e.createCommentVNode("v-if", !0)
                          ]),
                          a.value !== Y && i.value !== Y && b.value !== Y && (G(Y) || k(Y) || D.value) ? (e.openBlock(), e.createElementBlock("div", rs, [
                            D.value ? (e.openBlock(), e.createElementBlock("button", {
                              key: 0,
                              type: "button",
                              class: "mm-op",
                              "data-test": `mm-seg-move-${Y}`,
                              onClick: (ae) => V(Y)
                            }, [
                              T[10] || (T[10] = e.createElementVNode(
                                "i",
                                { class: "ri-user-shared-line" },
                                null,
                                -1
                                /* CACHED */
                              )),
                              e.createTextVNode(
                                e.toDisplayString(O.$t("改发言人")),
                                1
                                /* TEXT */
                              )
                            ], 8, is)) : e.createCommentVNode("v-if", !0),
                            G(Y) ? (e.openBlock(), e.createElementBlock("button", {
                              key: 1,
                              type: "button",
                              class: "mm-op",
                              "data-test": `mm-seg-modify-${Y}`,
                              onClick: (ae) => S(Y)
                            }, [
                              T[11] || (T[11] = e.createElementVNode(
                                "i",
                                { class: "ri-pencil-line" },
                                null,
                                -1
                                /* CACHED */
                              )),
                              e.createTextVNode(
                                e.toDisplayString(O.$t("修改")),
                                1
                                /* TEXT */
                              )
                            ], 8, cs)) : e.createCommentVNode("v-if", !0),
                            k(Y) ? (e.openBlock(), e.createElementBlock("button", {
                              key: 2,
                              type: "button",
                              class: "mm-op danger",
                              "data-test": `mm-seg-return-${Y}`,
                              onClick: (ae) => x(Y)
                            }, e.toDisplayString(O.$t("退回给发言人")), 9, ds)) : e.createCommentVNode("v-if", !0)
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
            ], 10, qo))),
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
          e.createElementVNode("div", ms, [
            (e.openBlock(!0), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(F.value, (j) => (e.openBlock(), e.createElementBlock(
                "div",
                e.mergeProps({
                  key: j.id
                }, { ref_for: !0 }, h(j.id)),
                [
                  e.createElementVNode(
                    "span",
                    {
                      class: "mm-av",
                      style: e.normalizeStyle({ background: e.unref(oe)(w(j.id)).color })
                    },
                    e.toDisplayString(e.unref(oe)(w(j.id)).text),
                    5
                    /* TEXT, STYLE */
                  ),
                  e.createElementVNode("div", us, [
                    e.createElementVNode("div", ps, [
                      e.createElementVNode(
                        "span",
                        vs,
                        e.toDisplayString(w(j.id)),
                        1
                        /* TEXT */
                      ),
                      _.value ? (e.openBlock(), e.createElementBlock("button", {
                        key: 0,
                        type: "button",
                        class: e.normalizeClass(["mm-play", { on: Q.value === j.id }]),
                        title: Q.value === j.id ? O.$t("暂停") : O.$t("播放这段原声"),
                        "data-test": `mm-seg-play-${j.id}`,
                        onClick: (Z) => K(j.id)
                      }, [
                        e.createElementVNode(
                          "i",
                          {
                            class: e.normalizeClass(A(j.id))
                          },
                          null,
                          2
                          /* CLASS */
                        ),
                        e.createElementVNode(
                          "time",
                          null,
                          e.toDisplayString(e.unref(Te)(j.start)),
                          1
                          /* TEXT */
                        )
                      ], 10, ks)) : (e.openBlock(), e.createElementBlock(
                        "time",
                        gs,
                        e.toDisplayString(e.unref(Te)(j.start)),
                        1
                        /* TEXT */
                      )),
                      U(j.id) ? (e.openBlock(), e.createElementBlock(
                        "span",
                        ys,
                        e.toDisplayString(O.$t("本人")),
                        1
                        /* TEXT */
                      )) : e.createCommentVNode("v-if", !0),
                      j.originalText !== void 0 ? (e.openBlock(), e.createElementBlock("span", {
                        key: 3,
                        class: "mm-mini",
                        title: O.$t("原文：{t}", { t: j.originalText || "" })
                      }, e.toDisplayString(O.$t("已修改")), 9, fs)) : e.createCommentVNode("v-if", !0),
                      j.originalSpeakerLabel !== void 0 ? (e.openBlock(), e.createElementBlock("span", {
                        key: 4,
                        class: "mm-mini",
                        title: O.$t("识别时是 {l}", { l: j.originalSpeakerLabel })
                      }, e.toDisplayString(O.$t("已改发言人")), 9, Es)) : e.createCommentVNode("v-if", !0)
                    ]),
                    b.value === j.id ? (e.openBlock(), e.createBlock($t, {
                      key: 0,
                      detail: l.detail,
                      "segment-id": j.id,
                      onDone: N
                    }, null, 8, ["detail", "segment-id"])) : e.createCommentVNode("v-if", !0),
                    a.value === j.id ? (e.openBlock(), e.createElementBlock(
                      e.Fragment,
                      { key: 1 },
                      [
                        e.withDirectives(e.createElementVNode(
                          "textarea",
                          {
                            "onUpdate:modelValue": T[6] || (T[6] = (Z) => m.value = Z),
                            class: "mm-seg__edit",
                            rows: "3"
                          },
                          null,
                          512
                          /* NEED_PATCH */
                        ), [
                          [e.vModelText, m.value]
                        ]),
                        e.createElementVNode("div", Ns, [
                          e.createElementVNode("button", {
                            type: "button",
                            class: "ss-btn sm primary",
                            disabled: d.value || !m.value.trim(),
                            onClick: (Z) => re(j.id)
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
                              e.toDisplayString(O.$t("保存")),
                              1
                              /* TEXT */
                            )
                          ], 8, Vs),
                          e.createElementVNode(
                            "button",
                            {
                              type: "button",
                              class: "ss-link",
                              onClick: T[7] || (T[7] = (Z) => a.value = "")
                            },
                            e.toDisplayString(O.$t("取消")),
                            1
                            /* TEXT */
                          )
                        ])
                      ],
                      64
                      /* STABLE_FRAGMENT */
                    )) : (e.openBlock(), e.createElementBlock(
                      "p",
                      $s,
                      e.toDisplayString(j.text),
                      1
                      /* TEXT */
                    )),
                    i.value === j.id ? (e.openBlock(), e.createElementBlock("div", hs, [
                      e.withDirectives(e.createElementVNode("input", {
                        "onUpdate:modelValue": T[8] || (T[8] = (Z) => g.value = Z),
                        type: "text",
                        placeholder: O.$t("退回原因（发言人会看到），例如：这段数字需要核实")
                      }, null, 8, bs), [
                        [e.vModelText, g.value]
                      ]),
                      e.createElementVNode("button", {
                        type: "button",
                        class: "ss-btn sm danger",
                        disabled: d.value,
                        onClick: (Z) => ce(j.id)
                      }, e.toDisplayString(O.$t("确认退回")), 9, _s),
                      e.createElementVNode(
                        "button",
                        {
                          type: "button",
                          class: "ss-link",
                          onClick: T[9] || (T[9] = (Z) => i.value = "")
                        },
                        e.toDisplayString(O.$t("取消")),
                        1
                        /* TEXT */
                      )
                    ])) : e.createCommentVNode("v-if", !0)
                  ]),
                  a.value !== j.id && i.value !== j.id && b.value !== j.id && (G(j.id) || k(j.id) || D.value) ? (e.openBlock(), e.createElementBlock("div", Bs, [
                    D.value ? (e.openBlock(), e.createElementBlock("button", {
                      key: 0,
                      type: "button",
                      class: "mm-op",
                      "data-test": `mm-seg-move-${j.id}`,
                      onClick: (Z) => V(j.id)
                    }, [
                      T[12] || (T[12] = e.createElementVNode(
                        "i",
                        { class: "ri-user-shared-line" },
                        null,
                        -1
                        /* CACHED */
                      )),
                      e.createTextVNode(
                        e.toDisplayString(O.$t("改发言人")),
                        1
                        /* TEXT */
                      )
                    ], 8, Ss)) : e.createCommentVNode("v-if", !0),
                    G(j.id) ? (e.openBlock(), e.createElementBlock("button", {
                      key: 1,
                      type: "button",
                      class: "mm-op",
                      onClick: (Z) => S(j.id)
                    }, [
                      T[13] || (T[13] = e.createElementVNode(
                        "i",
                        { class: "ri-pencil-line" },
                        null,
                        -1
                        /* CACHED */
                      )),
                      e.createTextVNode(
                        e.toDisplayString(O.$t("修改")),
                        1
                        /* TEXT */
                      )
                    ], 8, Ds)) : e.createCommentVNode("v-if", !0),
                    k(j.id) ? (e.openBlock(), e.createElementBlock("button", {
                      key: 2,
                      type: "button",
                      class: "mm-op danger",
                      onClick: (Z) => x(j.id)
                    }, e.toDisplayString(O.$t("退回给发言人")), 9, ws)) : e.createCommentVNode("v-if", !0)
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
        Ro,
        e.toDisplayString(O.$t("还没有纪要内容：上传会议文件、处理完成后在这里按议题整理")),
        1
        /* TEXT */
      )),
      c.value ? (e.openBlock(), e.createElementBlock("p", Cs, [
        T[14] || (T[14] = e.createElementVNode(
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
}), Is = /* @__PURE__ */ le(Ts, [["__scopeId", "data-v-259b6ff6"]]), Ze = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/utils/markdown.ts"];
if (!Ze) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/utils/markdown.ts");
Ze.default;
const Ms = {
  class: "mm-plan",
  "data-test": "mm-plan"
}, As = {
  key: 0,
  class: "mm-plan__empty"
}, js = { class: "mm-plan__head" }, Ls = { class: "ss-muted" }, zs = {
  key: 0,
  class: "ss-chip ok"
}, Fs = {
  key: 0,
  class: "mm-plan__owner",
  "data-test": "mm-plan-owner"
}, Ps = ["disabled"], Us = {
  key: 1,
  class: "ss-note"
}, Os = {
  key: 2,
  class: "ss-note"
}, Rs = { class: "mm-plan__summary" }, qs = { class: "mm-plan__sumhead" }, Ks = ["innerHTML"], Hs = {
  key: 2,
  class: "ss-muted"
}, Ws = { class: "mm-plan__sumhead" }, Gs = { class: "ss-muted" }, Ys = { class: "ss-table-wrap" }, Js = {
  key: 0,
  class: "c-del"
}, Qs = { key: 0 }, Zs = ["data-test"], Xs = { class: "num" }, xs = ["onUpdate:modelValue"], er = { value: "" }, tr = ["value"], lr = { key: 1 }, nr = { class: "wrap" }, ar = ["onUpdate:modelValue", "placeholder"], or = { key: 1 }, sr = {
  key: 2,
  class: "mm-plan__from"
}, rr = { class: "wrap" }, ir = ["onUpdate:modelValue", "placeholder"], cr = { key: 1 }, dr = ["onUpdate:modelValue", "data-test"], mr = { key: 1 }, ur = {
  key: 2,
  class: "mm-plan__warn"
}, pr = { class: "mm-plan__to" }, vr = {
  key: 0,
  class: "mm-plan__warn"
}, kr = { key: 0 }, gr = ["title"], yr = { key: 2 }, fr = { key: 0 }, Er = ["title", "onClick"], Nr = { key: 0 }, Vr = ["colspan"], $r = {
  key: 3,
  class: "mm-plan__problems"
}, hr = {
  key: 4,
  class: "ss-actions"
}, br = ["disabled"], _r = ["disabled"], Br = ["disabled"], Sr = {
  key: 2,
  class: "ss-note danger"
}, Dr = /* @__PURE__ */ e.defineComponent({
  __name: "PlanPanel",
  props: {
    detail: {}
  },
  emits: ["changed"],
  setup(l, { emit: p }) {
    const n = l, u = p, f = se.useNotificationStore(), s = e.ref({ depts: [], people: [] }), a = e.ref([]), m = e.ref(""), i = e.ref(!1), g = e.ref(!1), b = e.ref(!1), d = e.ref([]), c = e.ref(""), y = e.ref(""), $ = We(Date.now()), o = e.computed(() => n.detail.meeting), I = e.computed(() => o.value.plan), F = e.computed(() => o.value.status === "plan_confirm" && n.detail.my.isPlanOwner), P = e.computed(() => n.detail.my.isHost && (o.value.status === "pending_owner" || o.value.status === "plan_confirm"));
    function L(q) {
      return n.detail.names[q]?.name || s.value.people.find((B) => B.id === q)?.name || q;
    }
    function D(q) {
      return s.value.depts.find((B) => B.id === q)?.name || q || "-";
    }
    function C(q) {
      const B = s.value.depts.find((K) => K.id === q)?.leaderIds?.[0], A = B ? s.value.people.find((K) => K.id === B) : void 0;
      return A && !A.left ? A.name : "";
    }
    function z(q) {
      return q ? s.value.people.filter((B) => B.deptId === q && !B.left).map((B) => B.id) : [];
    }
    function R(q) {
      return q.assigneeId ? L(q.assigneeId) : C(q.deptId);
    }
    function _(q, B) {
      B ? q.assigneeId = B : delete q.assigneeId, i.value = !0;
    }
    function E(q) {
      return q ? o.value.decisions.findIndex((B) => B.id === q) + 1 : 0;
    }
    function v() {
      a.value = (I.value?.items || []).map((q) => ({ ...q })), m.value = I.value?.summary || "", i.value = !1, g.value = !1, b.value = !1;
    }
    e.watch(I, () => {
      i.value || v();
    }, { immediate: !0, deep: !0 });
    const w = e.computed(() => {
      const q = I.value;
      return q ? q.ownerIds?.length ? q.ownerIds : q.ownerId ? [q.ownerId] : [] : [];
    }), U = e.computed(() => w.value.map((q) => L(q)).filter(Boolean).join(t.t("、"))), G = e.computed(() => d.value.length === w.value.length && d.value.every((q) => w.value.includes(q)));
    e.watch(w, (q) => {
      d.value = [...q];
    }, { immediate: !0 });
    const k = e.computed(() => {
      const q = [];
      return a.value.length || q.push(t.t("至少保留一项任务")), a.value.forEach((B, A) => {
        const K = A + 1;
        B.deptId || q.push(t.t("第 {n} 项没有选责任部门", { n: K })), B.title.trim() || q.push(t.t("第 {n} 项没有填执行事项", { n: K })), /^\d{4}-\d{2}-\d{2}$/.test(B.due || "") || q.push(t.t("第 {n} 项没有设完成时间", { n: K })), B.deptId && !B.assigneeId && s.value.depts.length && !C(B.deptId) && q.push(t.t("第 {n} 项的部门没有负责人，请在「下发给」里选人", { n: K }));
      }), q;
    });
    function h() {
      a.value.push({ id: `new-${Date.now().toString(36)}-${a.value.length}`, deptId: "", title: "", standard: "", due: "" }), i.value = !0;
    }
    function r(q) {
      a.value.splice(q, 1), i.value = !0;
    }
    async function H() {
      if (!(!d.value.length || c.value)) {
        c.value = "owner", y.value = "";
        try {
          const q = [...d.value];
          await W("meeting.plan.owner", { id: o.value.id, ownerIds: q }), f.success(t.t("已指定 {name} 为任务负责人，已通知确认方案", { name: q.map((B) => L(B)).join(t.t("、")) })), u("changed");
        } catch (q) {
          y.value = X.errorMessage(q);
        } finally {
          c.value = "";
        }
      }
    }
    async function Q(q = !1) {
      if (b.value = !0, k.value.length)
        return y.value = t.t("还有没填完的任务，先补齐再保存"), !1;
      c.value = "save", y.value = "";
      try {
        return await W("meeting.plan.save", { id: o.value.id, items: a.value.map((B) => ({ ...B, title: B.title.trim(), standard: B.standard.trim() })), summary: m.value }), i.value = !1, g.value = !1, q || f.success(t.t("方案已保存")), u("changed"), !0;
      } catch (B) {
        return y.value = X.errorMessage(B), !1;
      } finally {
        c.value = "";
      }
    }
    async function ne() {
      if (b.value = !0, k.value.length) {
        y.value = t.t("还有没填完的任务，先补齐再确认");
        return;
      }
      if (window.confirm(t.t("确认后将生成 {n} 项任务，按「下发给」一栏下发，方案不能再改。确定？", { n: a.value.length })) && !(i.value && !await Q(!0))) {
        c.value = "confirm", y.value = "";
        try {
          await W("meeting.plan.confirm", { id: o.value.id }), f.success(t.t("方案已确认，任务已下发")), u("changed");
        } catch (q) {
          y.value = X.errorMessage(q);
        } finally {
          c.value = "";
        }
      }
    }
    return e.onMounted(async () => {
      try {
        s.value = await Be();
      } catch (q) {
        y.value = X.errorMessage(q);
      }
    }), (q, B) => (e.openBlock(), e.createElementBlock("section", Ms, [
      I.value ? (e.openBlock(), e.createElementBlock(
        e.Fragment,
        { key: 1 },
        [
          e.createElementVNode("header", js, [
            e.createElementVNode(
              "h4",
              null,
              e.toDisplayString(q.$t("AI 执行方案")),
              1
              /* TEXT */
            ),
            e.createElementVNode(
              "span",
              Ls,
              e.toDisplayString(q.$t("生成于 {t}", { t: e.unref(Ee)(I.value.generatedAt) })),
              1
              /* TEXT */
            ),
            B[9] || (B[9] = e.createElementVNode(
              "span",
              { class: "mm-grow" },
              null,
              -1
              /* CACHED */
            )),
            e.createElementVNode(
              "span",
              {
                class: e.normalizeClass(["ss-chip", w.value.length ? "brand" : "warn"]),
                "data-test": "mm-plan-owner-chip"
              },
              e.toDisplayString(w.value.length ? q.$t("任务负责人：{name}", { name: U.value }) : q.$t("还没有指定任务负责人")),
              3
              /* TEXT, CLASS */
            ),
            I.value.confirmedAt ? (e.openBlock(), e.createElementBlock(
              "span",
              zs,
              e.toDisplayString(q.$t("{t} 已确认", { t: e.unref(Ee)(I.value.confirmedAt) })),
              1
              /* TEXT */
            )) : e.createCommentVNode("v-if", !0)
          ]),
          e.createCommentVNode(" 主持人指定任务负责人 "),
          P.value ? (e.openBlock(), e.createElementBlock("div", Fs, [
            B[10] || (B[10] = e.createElementVNode(
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
              e.toDisplayString(o.value.status === "pending_owner" ? q.$t("指定任务负责人（可多选）：其中任何一位都能确认方案，确认后按部门下发给各部门负责人") : q.$t("更换任务负责人（可多选）")),
              1
              /* TEXT */
            ),
            e.createVNode(Pe, {
              values: d.value,
              "onUpdate:values": B[0] || (B[0] = (A) => d.value = A),
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
              disabled: !d.value.length || G.value || !!c.value,
              "data-test": "mm-plan-owner-save",
              onClick: H
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
            ], 8, Ps)
          ])) : o.value.status === "pending_owner" ? (e.openBlock(), e.createElementBlock("p", Us, [
            B[11] || (B[11] = e.createElementVNode(
              "i",
              { class: "ri-time-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(q.$t("等待主持人 {name} 指定任务负责人", { name: L(o.value.hostId) })),
              1
              /* TEXT */
            )
          ])) : o.value.status === "plan_confirm" && !l.detail.my.isPlanOwner ? (e.openBlock(), e.createElementBlock("p", Os, [
            B[12] || (B[12] = e.createElementVNode(
              "i",
              { class: "ri-time-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(q.$t("等待任务负责人 {name} 确认方案", { name: U.value })),
              1
              /* TEXT */
            )
          ])) : e.createCommentVNode("v-if", !0),
          e.createCommentVNode(" 方案概述 "),
          e.createElementVNode("div", Rs, [
            e.createElementVNode("div", qs, [
              e.createElementVNode(
                "b",
                null,
                e.toDisplayString(q.$t("方案概述")),
                1
                /* TEXT */
              ),
              F.value && !g.value ? (e.openBlock(), e.createElementBlock(
                "button",
                {
                  key: 0,
                  type: "button",
                  class: "ss-link",
                  onClick: B[1] || (B[1] = (A) => g.value = !0)
                },
                e.toDisplayString(q.$t("编辑")),
                1
                /* TEXT */
              )) : e.createCommentVNode("v-if", !0)
            ]),
            g.value ? e.withDirectives((e.openBlock(), e.createElementBlock(
              "textarea",
              {
                key: 0,
                "onUpdate:modelValue": B[2] || (B[2] = (A) => m.value = A),
                rows: "6",
                class: "mm-plan__textarea",
                onInput: B[3] || (B[3] = (A) => i.value = !0)
              },
              null,
              544
              /* NEED_HYDRATION, NEED_PATCH */
            )), [
              [e.vModelText, m.value]
            ]) : m.value.trim() ? (e.openBlock(), e.createElementBlock(
              e.Fragment,
              { key: 1 },
              [
                e.createCommentVNode(" eslint-disable-next-line vue/no-v-html -- renderMarkdown 已过 sanitizeHtml "),
                e.createElementVNode("div", {
                  class: "mm-plan__md",
                  innerHTML: e.unref(Ze.renderMarkdown)(m.value)
                }, null, 8, Ks)
              ],
              2112
              /* STABLE_FRAGMENT, DEV_ROOT_FRAGMENT */
            )) : (e.openBlock(), e.createElementBlock(
              "p",
              Hs,
              e.toDisplayString(q.$t("（没有概述）")),
              1
              /* TEXT */
            ))
          ]),
          e.createCommentVNode(" 任务清单 "),
          e.createElementVNode("div", Ws, [
            e.createElementVNode(
              "b",
              null,
              e.toDisplayString(q.$t("任务清单 · {n} 项", { n: a.value.length })),
              1
              /* TEXT */
            ),
            e.createElementVNode(
              "span",
              Gs,
              e.toDisplayString(q.$t("每项一个责任部门；「下发给」默认是该部门在通讯录里的第一位负责人，可以改成任何人")),
              1
              /* TEXT */
            )
          ]),
          e.createElementVNode("div", Ys, [
            e.createElementVNode(
              "table",
              {
                class: e.normalizeClass(["ss-table mm-plan__table", { edit: F.value }])
              },
              [
                e.createElementVNode("colgroup", null, [
                  B[13] || (B[13] = e.createElementVNode(
                    "col",
                    { class: "c-no" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  B[14] || (B[14] = e.createElementVNode(
                    "col",
                    { class: "c-dept" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  B[15] || (B[15] = e.createElementVNode(
                    "col",
                    null,
                    null,
                    -1
                    /* CACHED */
                  )),
                  B[16] || (B[16] = e.createElementVNode(
                    "col",
                    null,
                    null,
                    -1
                    /* CACHED */
                  )),
                  B[17] || (B[17] = e.createElementVNode(
                    "col",
                    { class: "c-due" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  B[18] || (B[18] = e.createElementVNode(
                    "col",
                    { class: "c-to" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  F.value ? (e.openBlock(), e.createElementBlock("col", Js)) : e.createCommentVNode("v-if", !0)
                ]),
                e.createElementVNode("thead", null, [
                  e.createElementVNode("tr", null, [
                    B[19] || (B[19] = e.createElementVNode(
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
                    F.value ? (e.openBlock(), e.createElementBlock("th", Qs)) : e.createCommentVNode("v-if", !0)
                  ])
                ]),
                e.createElementVNode("tbody", null, [
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(a.value, (A, K) => (e.openBlock(), e.createElementBlock("tr", {
                      key: A.id,
                      "data-test": `mm-plan-item-${K}`
                    }, [
                      e.createElementVNode(
                        "td",
                        Xs,
                        e.toDisplayString(K + 1),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode("td", null, [
                        F.value ? e.withDirectives((e.openBlock(), e.createElementBlock("select", {
                          key: 0,
                          "onUpdate:modelValue": (V) => A.deptId = V,
                          onChange: B[4] || (B[4] = (V) => i.value = !0)
                        }, [
                          e.createElementVNode(
                            "option",
                            er,
                            e.toDisplayString(q.$t("选择部门")),
                            1
                            /* TEXT */
                          ),
                          (e.openBlock(!0), e.createElementBlock(
                            e.Fragment,
                            null,
                            e.renderList(s.value.depts, (V) => (e.openBlock(), e.createElementBlock("option", {
                              key: V.id,
                              value: V.id
                            }, e.toDisplayString(V.name), 9, tr))),
                            128
                            /* KEYED_FRAGMENT */
                          ))
                        ], 40, xs)), [
                          [e.vModelSelect, A.deptId]
                        ]) : (e.openBlock(), e.createElementBlock(
                          "span",
                          lr,
                          e.toDisplayString(D(A.deptId)),
                          1
                          /* TEXT */
                        ))
                      ]),
                      e.createElementVNode("td", nr, [
                        F.value ? e.withDirectives((e.openBlock(), e.createElementBlock("input", {
                          key: 0,
                          "onUpdate:modelValue": (V) => A.title = V,
                          type: "text",
                          class: "wide",
                          placeholder: q.$t("执行事项"),
                          onInput: B[5] || (B[5] = (V) => i.value = !0)
                        }, null, 40, ar)), [
                          [e.vModelText, A.title]
                        ]) : (e.openBlock(), e.createElementBlock(
                          "span",
                          or,
                          e.toDisplayString(A.title),
                          1
                          /* TEXT */
                        )),
                        E(A.decisionId) ? (e.openBlock(), e.createElementBlock(
                          "small",
                          sr,
                          e.toDisplayString(q.$t("来自决议 {n}", { n: E(A.decisionId) })),
                          1
                          /* TEXT */
                        )) : e.createCommentVNode("v-if", !0)
                      ]),
                      e.createElementVNode("td", rr, [
                        F.value ? e.withDirectives((e.openBlock(), e.createElementBlock("input", {
                          key: 0,
                          "onUpdate:modelValue": (V) => A.standard = V,
                          type: "text",
                          class: "wide",
                          placeholder: q.$t("交付标准"),
                          onInput: B[6] || (B[6] = (V) => i.value = !0)
                        }, null, 40, ir)), [
                          [e.vModelText, A.standard]
                        ]) : (e.openBlock(), e.createElementBlock(
                          "span",
                          cr,
                          e.toDisplayString(A.standard || "-"),
                          1
                          /* TEXT */
                        ))
                      ]),
                      e.createElementVNode("td", null, [
                        F.value ? e.withDirectives((e.openBlock(), e.createElementBlock("input", {
                          key: 0,
                          "onUpdate:modelValue": (V) => A.due = V,
                          type: "date",
                          "data-test": `mm-plan-due-${K}`,
                          onChange: B[7] || (B[7] = (V) => i.value = !0)
                        }, null, 40, dr)), [
                          [e.vModelText, A.due]
                        ]) : (e.openBlock(), e.createElementBlock(
                          "span",
                          mr,
                          e.toDisplayString(A.due || "-"),
                          1
                          /* TEXT */
                        )),
                        A.due && A.due < e.unref($) ? (e.openBlock(), e.createElementBlock(
                          "small",
                          ur,
                          e.toDisplayString(q.$t("早于今天")),
                          1
                          /* TEXT */
                        )) : e.createCommentVNode("v-if", !0)
                      ]),
                      e.createElementVNode("td", pr, [
                        F.value ? (e.openBlock(), e.createElementBlock(
                          e.Fragment,
                          { key: 0 },
                          [
                            e.createCommentVNode(" 不选 = 部门第一负责人（显示在占位里）；部门没设负责人或要交给别人时直接选人 "),
                            e.createVNode(Pe, {
                              "model-value": A.assigneeId || "",
                              people: s.value,
                              pinned: z(A.deptId),
                              "pinned-label": q.$t("本部门"),
                              placeholder: C(A.deptId) ? q.$t("默认：{name}", { name: C(A.deptId) }) : q.$t("选择下发给谁"),
                              "aria-label": q.$t("下发给"),
                              clearable: "",
                              "data-test": `mm-plan-to-${K}`,
                              "onUpdate:modelValue": (V) => _(A, V)
                            }, null, 8, ["model-value", "people", "pinned", "pinned-label", "placeholder", "aria-label", "data-test", "onUpdate:modelValue"]),
                            A.deptId && !A.assigneeId && !C(A.deptId) && s.value.depts.length ? (e.openBlock(), e.createElementBlock(
                              "small",
                              vr,
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
                            R(A) ? (e.openBlock(), e.createElementBlock(
                              "span",
                              kr,
                              e.toDisplayString(R(A)),
                              1
                              /* TEXT */
                            )) : A.deptId ? (e.openBlock(), e.createElementBlock("span", {
                              key: 1,
                              class: "mm-plan__warn",
                              title: q.$t("企微通讯录里这个部门没有设置负责人，确认后无法下发")
                            }, e.toDisplayString(q.$t("部门没有负责人")), 9, gr)) : (e.openBlock(), e.createElementBlock("span", yr, "-"))
                          ],
                          64
                          /* STABLE_FRAGMENT */
                        ))
                      ]),
                      F.value ? (e.openBlock(), e.createElementBlock("td", fr, [
                        e.createElementVNode("button", {
                          type: "button",
                          class: "ss-link mm-plan__del",
                          title: q.$t("删除这项任务"),
                          onClick: (V) => r(K)
                        }, [...B[20] || (B[20] = [
                          e.createElementVNode(
                            "i",
                            { class: "ri-delete-bin-line" },
                            null,
                            -1
                            /* CACHED */
                          )
                        ])], 8, Er)
                      ])) : e.createCommentVNode("v-if", !0)
                    ], 8, Zs))),
                    128
                    /* KEYED_FRAGMENT */
                  )),
                  a.value.length ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock("tr", Nr, [
                    e.createElementVNode("td", {
                      colspan: F.value ? 7 : 6,
                      class: "mm-plan__none"
                    }, e.toDisplayString(q.$t("AI 没有从决议里拆出任务")), 9, Vr)
                  ]))
                ])
              ],
              2
              /* CLASS */
            )
          ]),
          F.value && k.value.length && b.value ? (e.openBlock(), e.createElementBlock("ul", $r, [
            (e.openBlock(!0), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(k.value, (A) => (e.openBlock(), e.createElementBlock(
                "li",
                { key: A },
                e.toDisplayString(A),
                1
                /* TEXT */
              ))),
              128
              /* KEYED_FRAGMENT */
            ))
          ])) : e.createCommentVNode("v-if", !0),
          F.value ? (e.openBlock(), e.createElementBlock("div", hr, [
            e.createElementVNode("button", {
              type: "button",
              class: "ss-btn sm",
              "data-test": "mm-plan-add",
              onClick: h
            }, [
              B[21] || (B[21] = e.createElementVNode(
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
            B[22] || (B[22] = e.createElementVNode(
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
              onClick: B[8] || (B[8] = (A) => Q())
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
            ], 8, br)) : e.createCommentVNode("v-if", !0),
            i.value ? (e.openBlock(), e.createElementBlock("button", {
              key: 1,
              type: "button",
              class: "ss-link",
              disabled: !!c.value,
              onClick: v
            }, e.toDisplayString(q.$t("放弃修改")), 9, _r)) : e.createCommentVNode("v-if", !0),
            e.createElementVNode("button", {
              type: "button",
              class: "ss-btn primary",
              disabled: !!c.value,
              "data-test": "mm-plan-confirm",
              onClick: ne
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
            ], 8, Br)
          ])) : e.createCommentVNode("v-if", !0)
        ],
        64
        /* STABLE_FRAGMENT */
      )) : (e.openBlock(), e.createElementBlock(
        "p",
        As,
        e.toDisplayString(q.$t("纪要定稿后，主持人选择「生成任务」，AI 会在这里按决议事项生成执行方案和任务清单。")),
        1
        /* TEXT */
      )),
      y.value ? (e.openBlock(), e.createElementBlock("p", Sr, [
        B[23] || (B[23] = e.createElementVNode(
          "i",
          { class: "ri-error-warning-line" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(y.value),
          1
          /* TEXT */
        )
      ])) : e.createCommentVNode("v-if", !0)
    ]));
  }
}), wr = /* @__PURE__ */ le(Dr, [["__scopeId", "data-v-6067da9b"]]), Cr = {
  class: "mm-dt",
  "data-test": "mm-meeting-detail"
}, Tr = {
  key: 0,
  class: "ss-note danger"
}, Ir = {
  key: 1,
  class: "ss-note"
}, Mr = {
  class: "mm-dt__sticky",
  "data-test": "mm-meeting-steps"
}, Ar = { class: "mm-dt__titlerow" }, jr = { class: "mm-steps" }, Lr = ["data-test"], zr = {
  key: 0,
  class: "mm-dt__procline"
}, Fr = { class: "mm-dt__procbar" }, Pr = { class: "mm-dt__info" }, Ur = { key: 0 }, Or = {
  key: 0,
  class: "ss-note warn"
}, Rr = { class: "mm-banner__icon" }, qr = { class: "mm-banner__text" }, Kr = { key: 0 }, Hr = {
  key: 0,
  class: "mm-banner__ops"
}, Wr = ["disabled", "data-test", "onClick"], Gr = {
  key: 0,
  class: "ri-loader-4-line spin"
}, Yr = {
  key: 2,
  class: "ss-note danger"
}, Jr = {
  class: "mm-dt__tabs",
  role: "tablist"
}, Qr = ["aria-selected", "data-test", "onClick"], Zr = {
  key: 0,
  class: "mm-dt__extra"
}, Xr = { class: "mm-dt__grid" }, xr = { class: "mm-dt__main" }, ei = {
  key: 0,
  class: "mm-dt__empty"
}, ti = {
  key: 1,
  class: "ss-table-wrap"
}, li = {
  class: "ss-table",
  "data-test": "mm-confirm-table"
}, ni = { class: "num" }, ai = ["data-test"], oi = { class: "mm-person" }, si = { class: "num" }, ri = {
  key: 0,
  class: "ss-chip ok"
}, ii = ["title"], ci = {
  key: 2,
  class: "ss-chip warn"
}, di = {
  key: 3,
  class: "mm-dt__note"
}, mi = { class: "ss-muted" }, ui = {
  key: 0,
  class: "mm-dt__empty"
}, pi = {
  key: 1,
  class: "mm-raw",
  "data-test": "mm-transcript"
}, vi = { class: "mm-dt__sub" }, ki = ["disabled"], gi = ["disabled", "title"], yi = {
  key: 0,
  class: "mm-dt__empty"
}, fi = {
  key: 1,
  class: "ss-table-wrap"
}, Ei = { class: "ss-table" }, Ni = { class: "num" }, Vi = { class: "num" }, $i = { class: "mm-dt__sub" }, hi = {
  key: 0,
  class: "ss-muted"
}, bi = ["disabled"], _i = {
  key: 2,
  class: "ss-note danger"
}, Bi = {
  key: 3,
  class: "mm-dt__empty"
}, Si = {
  key: 4,
  class: "mm-log"
}, Di = {
  key: 0,
  class: "mm-dt__empty"
}, wi = {
  key: 1,
  class: "mm-tasks",
  "data-test": "mm-meeting-tasks"
}, Ci = ["onClick"], Ti = { class: "mm-tasks__main" }, Ii = { class: "mm-tasks__bar" }, Mi = { class: "mm-tasks__pct" }, Ai = {
  key: 0,
  class: "ss-chip bad"
}, ji = { class: "mm-dt__side" }, Li = { class: "mm-side" }, zi = { key: 0 }, Fi = { class: "mm-avatars" }, Pi = ["title"], Ui = /* @__PURE__ */ e.defineComponent({
  __name: "MeetingDetail",
  props: {
    meetingId: {},
    focus: {}
  },
  emits: ["changed", "role"],
  setup(l, { expose: p, emit: n }) {
    const u = l, f = n, s = se.useNotificationStore(), a = e.ref(null), m = e.ref(""), i = e.ref(""), g = e.ref("minutes"), b = e.ref(""), d = e.ref(0), c = e.ref(null), y = e.ref(Date.now()), $ = e.ref(0), o = e.computed(() => a.value?.meeting), I = e.computed(() => te.value?.me?.person?.id), F = e.computed(() => te.value?.settings?.confirmTimeoutHours ?? 24), P = e.computed(() => Jt(o.value.status)), L = e.computed(() => ct[o.value.status] || "muted"), D = e.computed(() => {
      const V = o.value.status;
      return V === "pending_confirm" && a.value?.confirm.total ? t.t("待确认 {a}/{b}", { a: a.value.confirm.done, b: a.value.confirm.total }) : Je[V];
    }), C = e.computed(() => c.value?.stage || o.value.process?.stage || "extract"), z = e.computed(() => Math.max(0, Math.min(100, Math.round(c.value?.progress ?? o.value.process?.progress ?? 0)))), R = e.computed(() => [...o.value.segments].sort((V, N) => V.start - N.start)), _ = e.computed(() => o.value.confirmations.find((V) => V.personId === I.value)), E = e.computed(() => !!a.value?.my.isHost && a.value.projectStatus === "active" && ["pending_assign", "pending_confirm", "pending_review", "failed"].includes(o.value.status) && o.value.files.some((V) => V.kind === "audio" || V.kind === "video")), v = (V) => V && a.value?.names[V]?.name || "", w = e.computed(() => {
      const V = [...new Set(o.value.files.map((N) => N.kind))].map((N) => ft[N]).join(" / ");
      return V ? `${et[o.value.source]} ${V}` : et[o.value.source];
    }), U = e.computed(() => {
      const V = a.value?.confirm;
      return V?.total ? V.done >= V.total ? t.t("均已确认") : t.t("已确认 {a}/{b}", { a: V.done, b: V.total }) : "";
    });
    function G(V) {
      return o.value.segments.filter((N) => Me(o.value, N.speakerLabel) === V).length;
    }
    function k(V) {
      return V.objection ? "warn" : V.status === "done" ? "ok" : V.status === "cancelled" ? "muted" : V.status === "to_accept" ? "brand" : "muted";
    }
    const h = e.computed(() => {
      if (!a.value) return [];
      const V = a.value.confirm, N = [
        { key: "minutes", title: t.t("纪要内容") },
        { key: "confirm", title: t.t("发言确认"), extra: V?.total ? `${V.done}/${V.total}` : "" },
        { key: "transcript", title: t.t("转写原文") },
        { key: "files", title: t.t("文件与处理记录") }
      ];
      return (o.value.plan || ["pending_owner", "plan_confirm", "dispatched"].includes(o.value.status)) && N.push({ key: "plan", title: t.t("执行方案") }), (o.value.status === "dispatched" || a.value?.tasks.length) && N.push({ key: "tasks", title: t.t("关联任务"), extra: a.value?.tasks.length ? String(a.value.tasks.length) : "" }), N;
    });
    e.watch(h, (V) => {
      V.length && !V.some((N) => N.key === g.value) && (g.value = "minutes");
    });
    const r = e.computed(() => {
      const V = a.value;
      if (!V) return null;
      const N = V.meeting, S = V.my, x = v(N.hostId), re = V.projectStatus === "archived", ce = (T, j, Z = "primary") => re ? [] : [{ key: T, label: j, kind: Z }], O = (T, j) => ({ tone: "muted", icon: "ri-time-line", title: T, desc: j, actions: [] });
      switch (N.status) {
        case "pending_upload":
          return S.isHost ? { tone: "warn", icon: "ri-upload-cloud-2-line", title: t.t("上传会议文件，开始转写和整理"), desc: t.t("录音、录屏、文字记录都支持；优先上传录音或录屏，能按声纹自动认出发言人"), actions: ce("pick", t.t("选择文件")) } : O(t.t("等待主持人 {name} 上传会议文件", { name: x }));
        case "processing":
          return { tone: "brand", icon: "ri-loader-4-line spin", title: t.t("正在处理：{stage}", { stage: Ie[C.value] }), desc: t.t("完成后自动通知每位发言人确认本人发言"), actions: [] };
        case "failed":
          return S.isHost ? { tone: "bad", icon: "ri-error-warning-line", title: t.t("处理失败"), desc: N.process?.error || "", actions: ce("retry", t.t("重试")) } : { tone: "bad", icon: "ri-error-warning-line", title: t.t("处理失败，等待主持人 {name} 重试", { name: x }), desc: N.process?.error || "", actions: [] };
        case "pending_assign": {
          const T = N.speakers.filter((j) => !j.personId).length;
          return S.isHost ? { tone: "warn", icon: "ri-user-search-line", title: t.t("有 {n} 位发言人没认出来，请先指认", { n: T }), desc: t.t("试听片段后从参会人里选人；全部指认完自动进入发言确认"), actions: g.value === "minutes" ? [] : ce("goMinutes", t.t("去指认")) } : O(t.t("等待主持人 {name} 指认发言人", { name: x }));
        }
        case "pending_confirm": {
          const T = V.confirm;
          if (_.value?.status === "pending") {
            const j = N.segments.filter((Y) => S.myLabels.includes(Y.speakerLabel) || Me(N, Y.speakerLabel) === I.value).length, Z = _.value.returnedAt ? t.t("主持人退回了你的发言：{note}。改完后重新确认。", { note: _.value.returnNote || t.t("（没有写原因）") }) : "";
            return { tone: Z ? "warn" : "brand", icon: "ri-chat-check-line", title: t.t("请核对你的 {n} 段发言", { n: j }), desc: Z || t.t("有误的直接在纪要里修改；没问题就点「确认我的发言」"), actions: ce("confirm", t.t("确认我的发言")) };
          }
          return _.value?.status === "confirmed" ? { tone: "ok", icon: "ri-check-double-line", title: t.t("你已确认本人发言"), desc: t.t("其他发言人确认中（{a}/{b}），全部确认后进入主持人终审", { a: T.done, b: T.total }), actions: [] } : { tone: "brand", icon: "ri-chat-check-line", title: t.t("发言人确认中 {a}/{b}", { a: T.done, b: T.total }), desc: S.isHost ? t.t("全部确认后自动进入你的终审；超时未确认的系统自动催办") : t.t("全部确认后进入主持人终审"), actions: g.value === "confirm" ? [] : [{ key: "goConfirm", label: t.t("查看确认进度"), kind: "soft" }] };
        }
        case "pending_review":
          return S.isHost ? { tone: "brand", icon: "ri-check-line", title: t.t("{n} 位发言人已全部确认，等你终审", { n: V.confirm.total }), desc: t.t("可直接修改任意段落，或把某段退回给指定发言人（只有被退回的人需要重新确认）"), actions: ce("approve", t.t("审核通过")) } : O(t.t("发言人已全部确认，等待主持人 {name} 终审", { name: x }));
        case "finalized":
          return S.isHost ? {
            tone: "ok",
            icon: "ri-file-shield-2-line",
            title: t.t("纪要已定稿，下一步：是否生成任务？"),
            desc: N.decisions.length ? t.t("AI 识别出 {n} 项决议事项；选「生成任务」由 AI 拆成执行方案，再由你指定任务负责人", { n: N.decisions.length }) : t.t("没有识别到决议事项，一般选「无需生成任务」结束会议"),
            actions: re ? [] : [{ key: "generate", label: t.t("生成任务"), kind: "primary" }, { key: "none", label: t.t("无需生成任务"), kind: "plain" }]
          } : O(t.t("纪要已定稿，等待主持人 {name} 选择是否生成任务", { name: x }));
        case "ended":
          return { tone: "muted", icon: "ri-flag-line", title: t.t("会议已结束（无需生成任务）"), desc: N.finalizedAt ? t.t("纪要于 {t} 定稿", { t: Ee(N.finalizedAt) }) : "", actions: [] };
        case "pending_owner":
          return S.isHost ? { tone: "brand", icon: "ri-user-star-line", title: t.t("执行方案已生成，请指定任务负责人"), desc: t.t("任务负责人负责确认方案；确认后自动下发给各部门负责人"), actions: g.value === "plan" ? [] : ce("goPlan", t.t("去指定")) } : O(t.t("执行方案已生成，等待主持人 {name} 指定任务负责人", { name: x }));
        case "plan_confirm":
          return S.isPlanOwner ? { tone: "brand", icon: "ri-file-list-3-line", title: t.t("请确认执行方案"), desc: t.t("可以编辑任务、增删、设完成时间；确认后按部门下发给第一负责人"), actions: g.value === "plan" ? [] : ce("goPlan", t.t("去确认方案")) } : O(t.t("等待任务负责人 {name} 确认方案", { name: (N.plan?.ownerIds?.length ? N.plan.ownerIds : N.plan?.ownerId ? [N.plan.ownerId] : []).map((T) => v(T)).filter(Boolean).join(t.t("、")) }));
        case "dispatched":
          return { tone: "ok", icon: "ri-send-plane-line", title: t.t("已派发 {n} 项任务", { n: V.tasks.length || N.taskIds.length }), desc: t.t("各部门负责人接收后开始执行，进度在「任务」里跟进"), actions: g.value === "tasks" ? [] : [{ key: "goTasks", label: t.t("查看关联任务"), kind: "soft" }] };
        default:
          return null;
      }
    });
    async function H() {
      const V = u.meetingId;
      try {
        const N = await W("meeting.get", { id: V });
        if (V !== u.meetingId) return;
        a.value = N, m.value = "", N?.meeting?.status !== "processing" && (c.value = null);
      } catch (N) {
        m.value = X.errorMessage(N);
      }
    }
    function Q() {
      H(), f("changed");
    }
    let ne = null;
    function q() {
      ne && clearTimeout(ne), ne = setTimeout(() => {
        ne = null, H();
      }, 300);
    }
    async function B(V) {
      if (V === "goPlan") {
        g.value = "plan";
        return;
      }
      if (V === "goTasks") {
        g.value = "tasks";
        return;
      }
      if (V === "goMinutes") {
        g.value = "minutes";
        return;
      }
      if (V === "goConfirm") {
        g.value = "confirm";
        return;
      }
      if (!a.value || i.value) return;
      const N = a.value.meeting.id;
      if (!(V === "approve" && !window.confirm(t.t("审核通过后纪要锁定，不能再改，并通知全部参会人。确定通过？"))) && !(V === "none" && !window.confirm(t.t("确定无需生成任务？会议将直接结束。"))) && !(V === "reprocess" && !window.confirm(t.t("用当前的转写模型把这场会议重新转写一遍？发言人识别、确认状态和对纪要的修改都会清掉，处理完重新走确认。")))) {
        i.value = V, m.value = "";
        try {
          V === "pick" ? await W("meeting.pickFiles", { id: N }) && s.success(t.t("文件已上传，开始处理")) : V === "retry" ? await W("meeting.retry", { id: N }) : V === "reprocess" ? (await W("meeting.reprocess", { id: N }), s.success(t.t("已开始重新转写"))) : V === "confirm" ? (await W("meeting.confirm", { id: N }), s.success(t.t("已确认你的发言"))) : V === "approve" ? (await W("meeting.review.approve", { id: N }), s.success(t.t("纪要已定稿，已通知参会人"))) : V === "generate" ? (await W("meeting.decide", { id: N, decision: "generate" }), s.success(t.t("执行方案已生成，下一步指定任务负责人")), g.value = "plan") : V === "none" && await W("meeting.decide", { id: N, decision: "none" }), await H(), f("changed");
        } catch (S) {
          m.value = X.errorMessage(S), s.error(X.errorMessage(S));
        } finally {
          i.value = "";
        }
      }
    }
    e.watch(() => u.focus?.seq, () => {
      const V = u.focus;
      if (!V) return;
      const N = ["minutes", "confirm", "transcript", "files", "plan", "tasks"];
      V.tab && N.includes(V.tab) && (g.value = V.tab), V.anchor && (N.includes(V.anchor) ? g.value = V.anchor : (g.value = "minutes", b.value = V.anchor, d.value = V.seq));
    }, { immediate: !0 }), e.watch(() => ml(a.value, I.value), (V) => {
      V && f("role", V);
    }, { immediate: !0 });
    let A = null;
    e.watch(() => a.value?.meeting.status === "processing", (V) => {
      V && !A && (A = setInterval(() => {
        y.value = Date.now();
      }, 1e3)), !V && A && (clearInterval(A), A = null);
    }, { immediate: !0 });
    let K = null;
    return e.onMounted(() => {
      H(), K = _e((V) => {
        if (V?.type === "changed") {
          (V.scope === "all" || V.scope === "meeting" && (!V.id || V.id === u.meetingId)) && q();
          return;
        }
        V?.type !== "process" || V.meetingId !== u.meetingId || (c.value = { stage: V.stage, progress: V.progress, text: V.text, at: Date.now() }, y.value = Date.now(), (V.stage === "done" || a.value && a.value.meeting.status !== "processing") && H());
      });
    }), e.onBeforeUnmount(() => {
      K?.(), ne && clearTimeout(ne), A && clearInterval(A);
    }), p({ refresh: H }), (V, N) => (e.openBlock(), e.createElementBlock("section", Cr, [
      m.value && !a.value ? (e.openBlock(), e.createElementBlock("p", Tr, [
        N[5] || (N[5] = e.createElementVNode(
          "i",
          { class: "ri-error-warning-line" },
          null,
          -1
          /* CACHED */
        )),
        e.createElementVNode(
          "span",
          null,
          e.toDisplayString(m.value),
          1
          /* TEXT */
        ),
        e.createElementVNode(
          "button",
          {
            type: "button",
            class: "ss-link",
            onClick: H
          },
          e.toDisplayString(V.$t("重试")),
          1
          /* TEXT */
        )
      ])) : a.value ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock("p", Ir, [
        N[6] || (N[6] = e.createElementVNode(
          "i",
          { class: "ri-loader-4-line spin" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(V.$t("正在加载会议…")),
          1
          /* TEXT */
        )
      ])),
      a.value ? (e.openBlock(), e.createElementBlock(
        e.Fragment,
        { key: 2 },
        [
          e.createCommentVNode(" 顶部：标题 + 状态 + 环节进度（sticky：滚动时一直看得见） "),
          e.createElementVNode("div", Mr, [
            e.createElementVNode("div", Ar, [
              e.createElementVNode(
                "h3",
                null,
                e.toDisplayString(o.value.title),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "span",
                {
                  class: e.normalizeClass(["ss-chip", L.value]),
                  "data-test": "mm-meeting-status"
                },
                e.toDisplayString(D.value),
                3
                /* TEXT, CLASS */
              ),
              N[8] || (N[8] = e.createElementVNode(
                "span",
                { class: "mm-grow" },
                null,
                -1
                /* CACHED */
              )),
              e.createElementVNode("ol", jr, [
                (e.openBlock(!0), e.createElementBlock(
                  e.Fragment,
                  null,
                  e.renderList(e.unref(Bt), (S, x) => (e.openBlock(), e.createElementBlock("li", {
                    key: S.key,
                    class: e.normalizeClass({ done: x < P.value || o.value.status === "dispatched" && x === P.value, cur: x === P.value && o.value.status !== "dispatched", bad: x === P.value && o.value.status === "failed" }),
                    "data-test": `mm-step-${S.key}`
                  }, [
                    N[7] || (N[7] = e.createElementVNode(
                      "i",
                      { class: "mm-steps__dot" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createTextVNode(
                      e.toDisplayString(S.label),
                      1
                      /* TEXT */
                    )
                  ], 10, Lr))),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ])
            ]),
            o.value.status === "processing" ? (e.openBlock(), e.createElementBlock("div", zr, [
              e.createElementVNode("span", Fr, [
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
                e.toDisplayString(V.$t("处理中 · {stage} {p}%", { stage: e.unref(Ie)[C.value], p: z.value })),
                1
                /* TEXT */
              )
            ])) : e.createCommentVNode("v-if", !0)
          ]),
          e.createElementVNode("p", Pr, [
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(a.value.projectName),
              1
              /* TEXT */
            ),
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(e.unref(Ee)(o.value.time)),
              1
              /* TEXT */
            ),
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(V.$t("主持人 {name}", { name: v(o.value.hostId) })),
              1
              /* TEXT */
            ),
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(w.value),
              1
              /* TEXT */
            ),
            o.value.durationSec ? (e.openBlock(), e.createElementBlock(
              "span",
              Ur,
              e.toDisplayString(e.unref(ol)(o.value.durationSec)),
              1
              /* TEXT */
            )) : e.createCommentVNode("v-if", !0)
          ]),
          a.value.projectStatus !== "active" ? (e.openBlock(), e.createElementBlock("p", Or, [
            N[9] || (N[9] = e.createElementVNode(
              "i",
              { class: "ri-lock-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(a.value.projectStatus === "archived" ? V.$t("项目已归档，会议只读") : V.$t("项目结项中，会议只读")),
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
              e.createElementVNode("span", Rr, [
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
              e.createElementVNode("div", qr, [
                e.createElementVNode(
                  "strong",
                  null,
                  e.toDisplayString(r.value.title),
                  1
                  /* TEXT */
                ),
                r.value.desc ? (e.openBlock(), e.createElementBlock(
                  "small",
                  Kr,
                  e.toDisplayString(r.value.desc),
                  1
                  /* TEXT */
                )) : e.createCommentVNode("v-if", !0)
              ]),
              r.value.actions.length ? (e.openBlock(), e.createElementBlock("div", Hr, [
                (e.openBlock(!0), e.createElementBlock(
                  e.Fragment,
                  null,
                  e.renderList(r.value.actions, (S) => (e.openBlock(), e.createElementBlock("button", {
                    key: S.key,
                    type: "button",
                    class: e.normalizeClass(["mm-btn", S.kind]),
                    disabled: !!i.value,
                    "data-test": `mm-action-${S.key}`,
                    onClick: (x) => B(S.key)
                  }, [
                    i.value === S.key ? (e.openBlock(), e.createElementBlock("i", Gr)) : e.createCommentVNode("v-if", !0),
                    e.createTextVNode(
                      e.toDisplayString(S.label),
                      1
                      /* TEXT */
                    )
                  ], 10, Wr))),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ])) : e.createCommentVNode("v-if", !0)
            ],
            2
            /* CLASS */
          )) : e.createCommentVNode("v-if", !0),
          m.value ? (e.openBlock(), e.createElementBlock("p", Yr, [
            N[10] || (N[10] = e.createElementVNode(
              "i",
              { class: "ri-error-warning-line" },
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
          e.createCommentVNode(" 内容页签 "),
          e.createElementVNode("nav", Jr, [
            (e.openBlock(!0), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(h.value, (S) => (e.openBlock(), e.createElementBlock("button", {
                key: S.key,
                type: "button",
                role: "tab",
                class: e.normalizeClass({ on: g.value === S.key }),
                "aria-selected": g.value === S.key,
                "data-test": `mm-dtab-${S.key}`,
                onClick: (x) => g.value = S.key
              }, [
                e.createTextVNode(
                  e.toDisplayString(S.title),
                  1
                  /* TEXT */
                ),
                S.extra ? (e.openBlock(), e.createElementBlock(
                  "span",
                  Zr,
                  e.toDisplayString(S.extra),
                  1
                  /* TEXT */
                )) : e.createCommentVNode("v-if", !0)
              ], 10, Qr))),
              128
              /* KEYED_FRAGMENT */
            ))
          ]),
          e.createElementVNode("div", Xr, [
            e.createElementVNode("div", xr, [
              e.createCommentVNode(" 纪要内容 "),
              g.value === "minutes" ? (e.openBlock(), e.createElementBlock(
                e.Fragment,
                { key: 0 },
                [
                  o.value.status === "pending_upload" || o.value.status === "processing" || o.value.status === "failed" ? (e.openBlock(), e.createBlock(Sa, {
                    key: 0,
                    detail: a.value,
                    live: c.value,
                    now: y.value,
                    "wait-from": $.value,
                    onChanged: Q,
                    onLog: N[0] || (N[0] = (S) => g.value = "files"),
                    onWait: N[1] || (N[1] = (S) => $.value = Date.now())
                  }, null, 8, ["detail", "live", "now", "wait-from"])) : e.createCommentVNode("v-if", !0),
                  o.value.status === "pending_assign" || a.value.my.isHost && (o.value.status === "pending_confirm" || o.value.status === "pending_review") ? (e.openBlock(), e.createBlock(co, {
                    key: `sa-${o.value.status}`,
                    detail: a.value,
                    onChanged: Q
                  }, null, 8, ["detail"])) : e.createCommentVNode("v-if", !0),
                  o.value.segments.length || !["pending_upload", "processing", "failed"].includes(o.value.status) ? (e.openBlock(), e.createBlock(Is, {
                    key: 2,
                    detail: a.value,
                    anchor: b.value,
                    "anchor-seq": d.value,
                    onChanged: Q
                  }, null, 8, ["detail", "anchor", "anchor-seq"])) : e.createCommentVNode("v-if", !0)
                ],
                64
                /* STABLE_FRAGMENT */
              )) : g.value === "confirm" ? (e.openBlock(), e.createElementBlock(
                e.Fragment,
                { key: 1 },
                [
                  e.createCommentVNode(" 发言确认 "),
                  o.value.confirmations.length ? (e.openBlock(), e.createElementBlock("div", ti, [
                    e.createElementVNode("table", li, [
                      e.createElementVNode("thead", null, [
                        e.createElementVNode("tr", null, [
                          e.createElementVNode(
                            "th",
                            null,
                            e.toDisplayString(V.$t("发言人")),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "th",
                            null,
                            e.toDisplayString(V.$t("部门")),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "th",
                            ni,
                            e.toDisplayString(V.$t("发言段数")),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "th",
                            null,
                            e.toDisplayString(V.$t("状态")),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "th",
                            null,
                            e.toDisplayString(V.$t("确认时间")),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "th",
                            null,
                            e.toDisplayString(V.$t("催办")),
                            1
                            /* TEXT */
                          )
                        ])
                      ]),
                      e.createElementVNode("tbody", null, [
                        (e.openBlock(!0), e.createElementBlock(
                          e.Fragment,
                          null,
                          e.renderList(o.value.confirmations, (S) => (e.openBlock(), e.createElementBlock("tr", {
                            key: S.personId,
                            "data-test": `mm-confirm-${S.personId}`
                          }, [
                            e.createElementVNode("td", null, [
                              e.createElementVNode("span", oi, [
                                e.createElementVNode(
                                  "span",
                                  {
                                    class: "mm-av sm",
                                    style: e.normalizeStyle({ background: e.unref(oe)(v(S.personId)).color })
                                  },
                                  e.toDisplayString(e.unref(oe)(v(S.personId)).text),
                                  5
                                  /* TEXT, STYLE */
                                ),
                                e.createTextVNode(
                                  e.toDisplayString(v(S.personId)),
                                  1
                                  /* TEXT */
                                )
                              ])
                            ]),
                            e.createElementVNode(
                              "td",
                              null,
                              e.toDisplayString(a.value.names[S.personId]?.deptName || "-"),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "td",
                              si,
                              e.toDisplayString(G(S.personId)),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode("td", null, [
                              S.status === "confirmed" ? (e.openBlock(), e.createElementBlock(
                                "span",
                                ri,
                                e.toDisplayString(V.$t("已确认")),
                                1
                                /* TEXT */
                              )) : S.returnedAt ? (e.openBlock(), e.createElementBlock("span", {
                                key: 1,
                                class: "ss-chip bad",
                                title: S.returnNote || ""
                              }, e.toDisplayString(V.$t("被退回")), 9, ii)) : (e.openBlock(), e.createElementBlock(
                                "span",
                                ci,
                                e.toDisplayString(V.$t("未确认")),
                                1
                                /* TEXT */
                              )),
                              S.returnedAt && S.returnNote && S.status !== "confirmed" ? (e.openBlock(), e.createElementBlock(
                                "small",
                                di,
                                e.toDisplayString(S.returnNote),
                                1
                                /* TEXT */
                              )) : e.createCommentVNode("v-if", !0)
                            ]),
                            e.createElementVNode(
                              "td",
                              null,
                              e.toDisplayString(S.confirmedAt ? e.unref(Ee)(S.confirmedAt) : "-"),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "td",
                              null,
                              e.toDisplayString(S.remindedAt ? V.$t("已催办 {t}", { t: e.unref(Ee)(S.remindedAt) }) : "-"),
                              1
                              /* TEXT */
                            )
                          ], 8, ai))),
                          128
                          /* KEYED_FRAGMENT */
                        ))
                      ])
                    ])
                  ])) : (e.openBlock(), e.createElementBlock(
                    "p",
                    ei,
                    e.toDisplayString(V.$t("转写和发言人识别完成后，这里显示每位发言人的确认状态")),
                    1
                    /* TEXT */
                  )),
                  e.createElementVNode(
                    "small",
                    mi,
                    e.toDisplayString(V.$t("超过 {h} 小时未确认，系统自动催办（只提醒，不改状态）；全员确认后自动进入主持人终审。", { h: F.value })),
                    1
                    /* TEXT */
                  )
                ],
                64
                /* STABLE_FRAGMENT */
              )) : g.value === "transcript" ? (e.openBlock(), e.createElementBlock(
                e.Fragment,
                { key: 2 },
                [
                  e.createCommentVNode(" 转写原文 "),
                  R.value.length ? (e.openBlock(), e.createElementBlock("ol", pi, [
                    (e.openBlock(!0), e.createElementBlock(
                      e.Fragment,
                      null,
                      e.renderList(R.value, (S) => (e.openBlock(), e.createElementBlock("li", {
                        key: S.id
                      }, [
                        e.createElementVNode(
                          "time",
                          null,
                          e.toDisplayString(e.unref(Te)(S.start)),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "b",
                          null,
                          e.toDisplayString(e.unref(Qe)(a.value, S.speakerLabel)),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "span",
                          null,
                          e.toDisplayString(S.originalText || S.text),
                          1
                          /* TEXT */
                        )
                      ]))),
                      128
                      /* KEYED_FRAGMENT */
                    ))
                  ])) : (e.openBlock(), e.createElementBlock(
                    "p",
                    ui,
                    e.toDisplayString(V.$t("还没有转写内容")),
                    1
                    /* TEXT */
                  ))
                ],
                64
                /* STABLE_FRAGMENT */
              )) : g.value === "files" ? (e.openBlock(), e.createElementBlock(
                e.Fragment,
                { key: 3 },
                [
                  e.createCommentVNode(" 文件与处理记录 "),
                  e.createElementVNode("div", vi, [
                    e.createElementVNode(
                      "b",
                      null,
                      e.toDisplayString(V.$t("上传的文件")),
                      1
                      /* TEXT */
                    ),
                    N[11] || (N[11] = e.createElementVNode(
                      "span",
                      { class: "mm-grow" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    a.value.my.isHost && (o.value.status === "pending_upload" || o.value.status === "failed") ? (e.openBlock(), e.createElementBlock("button", {
                      key: 0,
                      type: "button",
                      class: "ss-btn sm",
                      disabled: !!i.value,
                      onClick: N[2] || (N[2] = (S) => B("pick"))
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
                        e.toDisplayString(V.$t("上传文件")),
                        1
                        /* TEXT */
                      )
                    ], 8, ki)) : e.createCommentVNode("v-if", !0),
                    E.value ? (e.openBlock(), e.createElementBlock("button", {
                      key: 1,
                      type: "button",
                      class: "ss-btn sm",
                      disabled: !!i.value,
                      "data-test": "mm-reprocess",
                      title: V.$t("换了更准的转写模型后，用现在的模型把这场会议重新转写一遍"),
                      onClick: N[3] || (N[3] = (S) => B("reprocess"))
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
                        e.toDisplayString(V.$t("用当前模型重新转写")),
                        1
                        /* TEXT */
                      )
                    ], 8, gi)) : e.createCommentVNode("v-if", !0)
                  ]),
                  o.value.files.length ? (e.openBlock(), e.createElementBlock("div", fi, [
                    e.createElementVNode("table", Ei, [
                      e.createElementVNode("thead", null, [
                        e.createElementVNode("tr", null, [
                          e.createElementVNode(
                            "th",
                            null,
                            e.toDisplayString(V.$t("文件")),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "th",
                            null,
                            e.toDisplayString(V.$t("类型")),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "th",
                            Ni,
                            e.toDisplayString(V.$t("大小")),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "th",
                            null,
                            e.toDisplayString(V.$t("上传时间")),
                            1
                            /* TEXT */
                          )
                        ])
                      ]),
                      e.createElementVNode("tbody", null, [
                        (e.openBlock(!0), e.createElementBlock(
                          e.Fragment,
                          null,
                          e.renderList(o.value.files, (S) => (e.openBlock(), e.createElementBlock("tr", {
                            key: S.id
                          }, [
                            e.createElementVNode(
                              "td",
                              null,
                              e.toDisplayString(S.name),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "td",
                              null,
                              e.toDisplayString(e.unref(ft)[S.kind] || S.kind),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "td",
                              Vi,
                              e.toDisplayString(e.unref(al)(S.size)),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "td",
                              null,
                              e.toDisplayString(e.unref(Ee)(S.uploadedAt)),
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
                    yi,
                    e.toDisplayString(V.$t("还没有上传文件")),
                    1
                    /* TEXT */
                  )),
                  e.createElementVNode("div", $i, [
                    e.createElementVNode(
                      "b",
                      null,
                      e.toDisplayString(V.$t("处理记录")),
                      1
                      /* TEXT */
                    ),
                    o.value.process ? (e.openBlock(), e.createElementBlock("span", hi, [
                      e.createTextVNode(
                        e.toDisplayString(V.$t("{stage} · {p}%", { stage: e.unref(Ie)[o.value.process.stage], p: Math.round(o.value.process.progress || 0) })),
                        1
                        /* TEXT */
                      ),
                      o.value.process.finishedAt ? (e.openBlock(), e.createElementBlock(
                        e.Fragment,
                        { key: 0 },
                        [
                          e.createTextVNode(
                            " · " + e.toDisplayString(V.$t("完成于 {t}", { t: e.unref(Ee)(o.value.process.finishedAt) })),
                            1
                            /* TEXT */
                          )
                        ],
                        64
                        /* STABLE_FRAGMENT */
                      )) : e.createCommentVNode("v-if", !0)
                    ])) : e.createCommentVNode("v-if", !0),
                    N[12] || (N[12] = e.createElementVNode(
                      "span",
                      { class: "mm-grow" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    a.value.my.isHost && o.value.status === "failed" ? (e.openBlock(), e.createElementBlock("button", {
                      key: 1,
                      type: "button",
                      class: "ss-btn sm primary",
                      disabled: !!i.value,
                      "data-test": "mm-files-retry",
                      onClick: N[4] || (N[4] = (S) => B("retry"))
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
                        e.toDisplayString(V.$t("重试")),
                        1
                        /* TEXT */
                      )
                    ], 8, bi)) : e.createCommentVNode("v-if", !0)
                  ]),
                  o.value.process?.error ? (e.openBlock(), e.createElementBlock("p", _i, [
                    N[13] || (N[13] = e.createElementVNode(
                      "i",
                      { class: "ri-error-warning-line" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createTextVNode(
                      e.toDisplayString(o.value.process.error),
                      1
                      /* TEXT */
                    )
                  ])) : e.createCommentVNode("v-if", !0),
                  o.value.process?.log?.length ? (e.openBlock(), e.createElementBlock("ol", Si, [
                    (e.openBlock(!0), e.createElementBlock(
                      e.Fragment,
                      null,
                      e.renderList(o.value.process.log, (S, x) => (e.openBlock(), e.createElementBlock("li", { key: x }, [
                        e.createElementVNode(
                          "time",
                          null,
                          e.toDisplayString(e.unref(Ee)(S.at)),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "span",
                          null,
                          e.toDisplayString(S.text),
                          1
                          /* TEXT */
                        )
                      ]))),
                      128
                      /* KEYED_FRAGMENT */
                    ))
                  ])) : (e.openBlock(), e.createElementBlock(
                    "p",
                    Bi,
                    e.toDisplayString(V.$t("还没有处理记录")),
                    1
                    /* TEXT */
                  ))
                ],
                64
                /* STABLE_FRAGMENT */
              )) : g.value === "plan" ? (e.openBlock(), e.createElementBlock(
                e.Fragment,
                { key: 4 },
                [
                  e.createCommentVNode(" 执行方案 "),
                  e.createVNode(wr, {
                    detail: a.value,
                    onChanged: Q
                  }, null, 8, ["detail"])
                ],
                2112
                /* STABLE_FRAGMENT, DEV_ROOT_FRAGMENT */
              )) : g.value === "tasks" ? (e.openBlock(), e.createElementBlock(
                e.Fragment,
                { key: 5 },
                [
                  e.createCommentVNode(" 关联任务 "),
                  a.value.tasks.length ? (e.openBlock(), e.createElementBlock("ul", wi, [
                    (e.openBlock(!0), e.createElementBlock(
                      e.Fragment,
                      null,
                      e.renderList(a.value.tasks, (S) => (e.openBlock(), e.createElementBlock("li", {
                        key: S.id,
                        onClick: (x) => e.unref(de)({ kind: "task", id: S.id })
                      }, [
                        e.createElementVNode("div", Ti, [
                          e.createElementVNode(
                            "strong",
                            null,
                            e.toDisplayString(S.title),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "small",
                            null,
                            e.toDisplayString(S.deptName) + " · " + e.toDisplayString(S.assigneeName) + " · " + e.toDisplayString(V.$t("截止 {d}", { d: S.due })),
                            1
                            /* TEXT */
                          )
                        ]),
                        e.createElementVNode("span", Ii, [
                          e.createElementVNode(
                            "i",
                            {
                              class: e.normalizeClass({ bad: S.overdue }),
                              style: e.normalizeStyle({ width: `${Math.max(0, Math.min(100, S.percent || 0))}%` })
                            },
                            null,
                            6
                            /* CLASS, STYLE */
                          )
                        ]),
                        e.createElementVNode(
                          "small",
                          Mi,
                          e.toDisplayString(Math.round(S.percent || 0)) + "%",
                          1
                          /* TEXT */
                        ),
                        S.overdue ? (e.openBlock(), e.createElementBlock(
                          "span",
                          Ai,
                          e.toDisplayString(V.$t("逾期 {n} 天", { n: S.overdueDays })),
                          1
                          /* TEXT */
                        )) : e.createCommentVNode("v-if", !0),
                        e.createElementVNode(
                          "span",
                          {
                            class: e.normalizeClass(["ss-chip", k(S)])
                          },
                          e.toDisplayString(e.unref(rt)(S.objection) || e.unref(Fe)[S.status]),
                          3
                          /* TEXT, CLASS */
                        ),
                        N[14] || (N[14] = e.createElementVNode(
                          "i",
                          {
                            class: "ri-arrow-right-s-line",
                            "aria-hidden": "true"
                          },
                          null,
                          -1
                          /* CACHED */
                        ))
                      ], 8, Ci))),
                      128
                      /* KEYED_FRAGMENT */
                    ))
                  ])) : (e.openBlock(), e.createElementBlock(
                    "p",
                    Di,
                    e.toDisplayString(V.$t("这场会议还没有派发任务")),
                    1
                    /* TEXT */
                  ))
                ],
                64
                /* STABLE_FRAGMENT */
              )) : e.createCommentVNode("v-if", !0)
            ]),
            e.createCommentVNode(" 右侧栏：决议事项 + 参会人 "),
            e.createElementVNode("aside", ji, [
              e.createVNode(To, {
                detail: a.value,
                onChanged: Q
              }, null, 8, ["detail"]),
              e.createElementVNode("section", Li, [
                e.createElementVNode("h5", null, [
                  e.createTextVNode(
                    e.toDisplayString(V.$t("参会人")) + " ",
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "span",
                    null,
                    e.toDisplayString(o.value.attendeeIds.length),
                    1
                    /* TEXT */
                  ),
                  U.value ? (e.openBlock(), e.createElementBlock(
                    "small",
                    zi,
                    " · " + e.toDisplayString(U.value),
                    1
                    /* TEXT */
                  )) : e.createCommentVNode("v-if", !0)
                ]),
                e.createElementVNode("div", Fi, [
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(o.value.attendeeIds, (S) => (e.openBlock(), e.createElementBlock("span", {
                      key: S,
                      class: e.normalizeClass(["mm-av", { host: S === o.value.hostId }]),
                      style: e.normalizeStyle({ background: e.unref(oe)(v(S)).color }),
                      title: S === o.value.hostId ? V.$t("{name}（主持人）", { name: v(S) }) : v(S)
                    }, e.toDisplayString(e.unref(oe)(v(S)).text), 15, Pi))),
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
}), Oi = /* @__PURE__ */ le(Ui, [["__scopeId", "data-v-f1e6ab38"]]), Ri = ["aria-label"], qi = { class: "mm-cd" }, Ki = { class: "mm-cd__head" }, Hi = ["title"], Wi = { class: "mm-cd__body" }, Gi = {
  key: 0,
  class: "ss-note danger"
}, Yi = {
  key: 1,
  class: "ss-note warn"
}, Ji = { class: "ss-field" }, Qi = { value: "" }, Zi = ["value"], Xi = { class: "ss-field" }, xi = ["placeholder"], ec = { class: "mm-cd__row" }, tc = { class: "ss-field" }, lc = { class: "ss-field" }, nc = {
  class: "mm-cd__seg",
  role: "radiogroup"
}, ac = ["aria-checked", "data-test", "onClick"], oc = { class: "ss-field" }, sc = { class: "ss-muted" }, rc = { class: "ss-field" }, ic = { class: "ss-muted" }, cc = {
  key: 0,
  class: "mm-cd__chips"
}, dc = ["title", "onClick"], mc = { class: "mm-cd__picker" }, uc = { class: "mm-cd__search" }, pc = ["placeholder"], vc = { class: "mm-cd__groups" }, kc = { class: "mm-cd__ghead" }, gc = ["onClick"], yc = ["data-test"], fc = ["checked", "disabled", "onChange"], Ec = {
  key: 0,
  class: "mm-cd__none"
}, Nc = { class: "ss-muted" }, Vc = {
  key: 2,
  class: "ss-note danger"
}, $c = { class: "mm-cd__foot" }, hc = { class: "ss-muted" }, bc = ["disabled"], _c = /* @__PURE__ */ e.defineComponent({
  __name: "MeetingCreateDialog",
  props: {
    projectId: {}
  },
  emits: ["close", "created"],
  setup(l, { emit: p }) {
    const n = l, u = p, f = ["offline", "tencent", "zoom"], s = se.useNotificationStore(), a = e.ref([]), m = e.ref({ depts: [], people: [] }), i = e.ref(!1), g = e.ref(""), b = e.ref(""), d = e.ref(!1), c = e.ref(""), y = e.ref(/* @__PURE__ */ new Set());
    function $() {
      const _ = /* @__PURE__ */ new Date();
      return _.setMinutes(0, 0, 0), _.setHours(_.getHours() + 1), _.getTime();
    }
    const o = e.reactive({
      projectId: n.projectId || "",
      title: "",
      time: ll($()),
      source: "offline",
      hostId: te.value?.me?.person?.id || ""
    }), I = e.computed(() => Dt(m.value, c.value)), F = e.computed(() => {
      const _ = new Set(y.value);
      return o.hostId && _.add(o.hostId), m.value.people.filter((E) => _.has(E.id));
    }), P = e.computed(() => F.value.length);
    function L(_) {
      if (_ === o.hostId) return;
      const E = new Set(y.value);
      E.has(_) ? E.delete(_) : E.add(_), y.value = E;
    }
    function D(_) {
      const E = new Set(y.value), v = _.every((w) => E.has(w.id));
      for (const w of _)
        w.id !== o.hostId && (v ? E.delete(w.id) : E.add(w.id));
      y.value = E;
    }
    function C() {
      d.value || u("close");
    }
    function z(_) {
      _.key === "Escape" && C();
    }
    async function R() {
      if (d.value) return;
      b.value = "";
      const _ = nl(o.time);
      if (!o.projectId) {
        b.value = t.t("请选择所属项目");
        return;
      }
      if (!o.title.trim()) {
        b.value = t.t("请填写会议主题");
        return;
      }
      if (!Number.isFinite(_)) {
        b.value = t.t("请填写会议时间");
        return;
      }
      if (!o.hostId) {
        b.value = t.t("请选择主持人");
        return;
      }
      const E = [.../* @__PURE__ */ new Set([o.hostId, ...y.value])];
      if (E.length < 2) {
        b.value = t.t("请至少再选一位参会人");
        return;
      }
      d.value = !0;
      try {
        const v = await W("meeting.create", {
          projectId: o.projectId,
          title: o.title.trim(),
          time: _,
          source: o.source,
          hostId: o.hostId,
          attendeeIds: E
        });
        s.success(t.t("会议已创建，下一步上传会议文件")), u("created", v.id);
      } catch (v) {
        b.value = X.errorMessage(v);
      } finally {
        d.value = !1;
      }
    }
    return e.onMounted(async () => {
      document.addEventListener("keydown", z);
      try {
        const [_, E] = await Promise.all([
          W("project.list", { status: "active" }),
          Be()
        ]);
        a.value = (Array.isArray(_) ? _ : []).filter((v) => !v.status || v.status === "active"), m.value = E, !o.projectId && a.value.length === 1 && (o.projectId = a.value[0].id);
      } catch (_) {
        g.value = X.errorMessage(_);
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
        onClick: e.withModifiers(C, ["self"])
      }, [
        e.createElementVNode("section", qi, [
          e.createElementVNode("header", Ki, [
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
              onClick: C
            }, [...E[5] || (E[5] = [
              e.createElementVNode(
                "i",
                { class: "ri-close-line" },
                null,
                -1
                /* CACHED */
              )
            ])], 8, Hi)
          ]),
          e.createElementVNode("div", Wi, [
            g.value ? (e.openBlock(), e.createElementBlock("p", Gi, [
              E[6] || (E[6] = e.createElementVNode(
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
            ])) : i.value && !a.value.length ? (e.openBlock(), e.createElementBlock("p", Yi, [
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
            e.createElementVNode("label", Ji, [
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
                  "onUpdate:modelValue": E[0] || (E[0] = (v) => o.projectId = v),
                  "data-test": "mm-create-project"
                },
                [
                  e.createElementVNode(
                    "option",
                    Qi,
                    e.toDisplayString(_.$t("选择项目")),
                    1
                    /* TEXT */
                  ),
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(a.value, (v) => (e.openBlock(), e.createElementBlock("option", {
                      key: v.id,
                      value: v.id
                    }, e.toDisplayString(v.name), 9, Zi))),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ],
                512
                /* NEED_PATCH */
              ), [
                [e.vModelSelect, o.projectId]
              ])
            ]),
            e.createElementVNode("label", Xi, [
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
                "onUpdate:modelValue": E[1] || (E[1] = (v) => o.title = v),
                type: "text",
                maxlength: "80",
                placeholder: _.$t("例如：A2 量产导入第 5 次周例会"),
                "data-test": "mm-create-title"
              }, null, 8, xi), [
                [e.vModelText, o.title]
              ])
            ]),
            e.createElementVNode("div", ec, [
              e.createElementVNode("label", tc, [
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
                    "onUpdate:modelValue": E[2] || (E[2] = (v) => o.time = v),
                    type: "datetime-local",
                    "data-test": "mm-create-time"
                  },
                  null,
                  512
                  /* NEED_PATCH */
                ), [
                  [e.vModelText, o.time]
                ])
              ]),
              e.createElementVNode("div", lc, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(_.$t("来源")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode("div", nc, [
                  (e.openBlock(), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(f, (v) => e.createElementVNode("button", {
                      key: v,
                      type: "button",
                      role: "radio",
                      "aria-checked": o.source === v,
                      class: e.normalizeClass({ on: o.source === v }),
                      "data-test": `mm-create-source-${v}`,
                      onClick: (w) => o.source = v
                    }, e.toDisplayString(e.unref(et)[v]), 11, ac)),
                    64
                    /* STABLE_FRAGMENT */
                  ))
                ])
              ])
            ]),
            e.createElementVNode("div", oc, [
              e.createElementVNode("span", null, [
                e.createTextVNode(
                  e.toDisplayString(_.$t("主持人")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "small",
                  sc,
                  e.toDisplayString(_.$t("（默认是你，可以改；主持人负责上传、指认、终审）")),
                  1
                  /* TEXT */
                )
              ]),
              e.createVNode(Pe, {
                modelValue: o.hostId,
                "onUpdate:modelValue": E[3] || (E[3] = (v) => o.hostId = v),
                people: m.value,
                "aria-label": _.$t("主持人"),
                "data-test": "mm-create-host"
              }, null, 8, ["modelValue", "people", "aria-label"])
            ]),
            e.createElementVNode("div", rc, [
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
                  ic,
                  e.toDisplayString(_.$t("已选 {n} 人（主持人自动参会）", { n: P.value })),
                  1
                  /* TEXT */
                )
              ]),
              F.value.length ? (e.openBlock(), e.createElementBlock("div", cc, [
                (e.openBlock(!0), e.createElementBlock(
                  e.Fragment,
                  null,
                  e.renderList(F.value, (v) => (e.openBlock(), e.createElementBlock("span", {
                    key: v.id,
                    class: "mm-cd__chip"
                  }, [
                    e.createTextVNode(
                      e.toDisplayString(v.name) + " ",
                      1
                      /* TEXT */
                    ),
                    v.id !== o.hostId ? (e.openBlock(), e.createElementBlock("button", {
                      key: 0,
                      type: "button",
                      title: _.$t("移除"),
                      onClick: (w) => L(v.id)
                    }, [...E[12] || (E[12] = [
                      e.createElementVNode(
                        "i",
                        { class: "ri-close-line" },
                        null,
                        -1
                        /* CACHED */
                      )
                    ])], 8, dc)) : e.createCommentVNode("v-if", !0)
                  ]))),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ])) : e.createCommentVNode("v-if", !0),
              e.createElementVNode("div", mc, [
                e.createElementVNode("label", uc, [
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
                  }, null, 8, pc), [
                    [e.vModelText, c.value]
                  ])
                ]),
                e.createElementVNode("div", vc, [
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(I.value, (v) => (e.openBlock(), e.createElementBlock("div", {
                      key: v.id,
                      class: "mm-cd__group"
                    }, [
                      e.createElementVNode("div", kc, [
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
                          onClick: (w) => D(v.people)
                        }, e.toDisplayString(v.people.every((w) => y.value.has(w.id)) ? _.$t("取消全选") : _.$t("全选")), 9, gc)
                      ]),
                      (e.openBlock(!0), e.createElementBlock(
                        e.Fragment,
                        null,
                        e.renderList(v.people, (w) => (e.openBlock(), e.createElementBlock("label", {
                          key: w.id,
                          class: "mm-cd__person",
                          "data-test": `mm-create-person-${w.id}`
                        }, [
                          e.createElementVNode("input", {
                            type: "checkbox",
                            checked: y.value.has(w.id) || w.id === o.hostId,
                            disabled: w.id === o.hostId,
                            onChange: (U) => L(w.id)
                          }, null, 40, fc),
                          e.createElementVNode(
                            "span",
                            {
                              class: "mm-av",
                              style: e.normalizeStyle({ background: e.unref(oe)(w.name).color })
                            },
                            e.toDisplayString(e.unref(oe)(w.name).text),
                            5
                            /* TEXT, STYLE */
                          ),
                          e.createElementVNode(
                            "span",
                            null,
                            e.toDisplayString(w.name),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "small",
                            null,
                            e.toDisplayString(w.title || ""),
                            1
                            /* TEXT */
                          )
                        ], 8, yc))),
                        128
                        /* KEYED_FRAGMENT */
                      ))
                    ]))),
                    128
                    /* KEYED_FRAGMENT */
                  )),
                  i.value && !I.value.length ? (e.openBlock(), e.createElementBlock(
                    "p",
                    Ec,
                    e.toDisplayString(c.value.trim() ? _.$t("没有找到这个人") : _.$t("组织里还没有人员")),
                    1
                    /* TEXT */
                  )) : e.createCommentVNode("v-if", !0)
                ])
              ]),
              e.createElementVNode("small", Nc, [
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
            b.value ? (e.openBlock(), e.createElementBlock("p", Vc, [
              E[16] || (E[16] = e.createElementVNode(
                "i",
                { class: "ri-error-warning-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(b.value),
                1
                /* TEXT */
              )
            ])) : e.createCommentVNode("v-if", !0)
          ]),
          e.createElementVNode("footer", $c, [
            e.createElementVNode(
              "span",
              hc,
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
                onClick: C
              },
              e.toDisplayString(_.$t("取消")),
              1
              /* TEXT */
            ),
            e.createElementVNode("button", {
              type: "button",
              class: "ss-btn primary",
              disabled: d.value,
              "data-test": "mm-create-submit",
              onClick: R
            }, [
              e.createElementVNode(
                "i",
                {
                  class: e.normalizeClass(d.value ? "ri-loader-4-line spin" : "ri-add-line")
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
            ], 8, bc)
          ])
        ])
      ], 8, Ri)
    ]));
  }
}), Lt = /* @__PURE__ */ le(_c, [["__scopeId", "data-v-b8a4a4be"]]), Bc = {
  class: "mm-meetings",
  "data-test": "mm-meetings"
}, Sc = { class: "mm-meetings__head" }, Dc = { class: "mm-search" }, wc = ["placeholder"], Cc = {
  key: 0,
  class: "ss-note danger"
}, Tc = { class: "mm-meetings__grid" }, Ic = { class: "mm-mlist" }, Mc = { class: "mm-chips" }, Ac = ["data-test", "onClick"], jc = {
  key: 0,
  class: "mm-mlist__state"
}, Lc = {
  key: 1,
  class: "mm-mlist__empty"
}, zc = {
  key: 0,
  class: "mm-mlist__group"
}, Fc = ["data-test", "onClick"], Pc = { class: "mm-mcard__title" }, Uc = ["title"], Oc = { class: "mm-mcard__meta" }, Rc = {
  key: 1,
  class: "mm-placeholder"
}, qc = /* @__PURE__ */ e.defineComponent({
  __name: "MeetingsTab",
  emits: ["role"],
  setup(l, { expose: p, emit: n }) {
    const u = [
      { key: "all", title: t.t("全部") },
      { key: "todo", title: t.t("待我处理") },
      { key: "processing", title: t.t("处理中") },
      { key: "final", title: t.t("已定稿") }
    ], f = n, s = e.ref("all"), a = e.ref(""), m = e.ref(!1), i = e.ref(""), g = e.ref(!1), b = e.ref(gt.value), d = e.ref(null), c = e.ref(null), y = e.reactive({ all: [], todo: [], processing: [], final: [] }), $ = e.computed(() => ({ all: y.all.length, todo: y.todo.length, processing: y.processing.length, final: y.final.length })), o = e.computed(() => y[s.value]), I = e.computed(() => [
      { key: "mine", title: t.t("需要我处理"), items: o.value.filter((E) => E.needsMe) },
      { key: "other", title: t.t("其他"), items: o.value.filter((E) => !E.needsMe) }
    ]);
    let F = 0, P = "";
    async function L() {
      const E = ++F;
      m.value = !0;
      try {
        const v = a.value.trim(), w = await Promise.all(u.map((G) => W("meeting.list", { filter: G.key, ...v ? { q: v } : {} })));
        if (E !== F) return;
        u.forEach((G, k) => {
          y[G.key] = Array.isArray(w[k]) ? w[k] : [];
        }), i.value = "";
        const U = !y.all.some((G) => G.id === b.value) && !v && b.value !== P;
        if (!b.value || U) {
          const G = y.all.find((k) => k.needsMe) || y.all[0];
          G ? C(G.id) : b.value = "";
        }
      } catch (v) {
        E === F && (i.value = X.errorMessage(v));
      } finally {
        E === F && (m.value = !1);
      }
    }
    async function D() {
      await Promise.all([L(), c.value?.refresh?.()]);
    }
    function C(E) {
      E !== b.value && (d.value = null), b.value = E, gt.value = E;
    }
    function z(E) {
      g.value = !1, s.value = "all", a.value = "", C(E), L();
    }
    function R() {
      const E = ke.value;
      E.tab !== "meetings" || !E.link || E.link.kind !== "meeting" && E.link.kind !== "meeting_plan" || (y.all.some((v) => v.id === E.link.id) || (s.value = "all", a.value = ""), P = E.link.id, C(E.link.id), d.value = { tab: E.link.kind === "meeting_plan" ? "plan" : void 0, anchor: E.link.anchor, seq: E.seq });
    }
    e.watch(() => ke.value.seq, R);
    let _ = null;
    return e.watch(a, () => {
      _ && clearTimeout(_), _ = setTimeout(() => {
        _ = null, L();
      }, 250);
    }), e.onMounted(() => {
      R(), nt.value && (nt.value = !1, g.value = !0), L();
    }), e.onBeforeUnmount(() => {
      _ && clearTimeout(_);
    }), p({ refresh: D }), (E, v) => (e.openBlock(), e.createElementBlock("div", Bc, [
      e.createElementVNode("header", Sc, [
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
        e.createElementVNode("label", Dc, [
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
            "onUpdate:modelValue": v[0] || (v[0] = (w) => a.value = w),
            type: "search",
            placeholder: E.$t("搜索会议、项目"),
            "data-test": "mm-meeting-search"
          }, null, 8, wc), [
            [e.vModelText, a.value]
          ])
        ]),
        e.createElementVNode("button", {
          type: "button",
          class: "mm-btn primary",
          "data-test": "mm-meeting-create",
          onClick: v[1] || (v[1] = (w) => g.value = !0)
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
      i.value ? (e.openBlock(), e.createElementBlock("p", Cc, [
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
            onClick: D
          },
          e.toDisplayString(E.$t("重试")),
          1
          /* TEXT */
        )
      ])) : e.createCommentVNode("v-if", !0),
      e.createElementVNode("div", Tc, [
        e.createElementVNode("aside", Ic, [
          e.createElementVNode("div", Mc, [
            (e.openBlock(), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(u, (w) => e.createElementVNode("button", {
                key: w.key,
                type: "button",
                class: e.normalizeClass(["mm-chip", { on: s.value === w.key }]),
                "data-test": `mm-meeting-filter-${w.key}`,
                onClick: (U) => s.value = w.key
              }, [
                e.createTextVNode(
                  e.toDisplayString(w.title) + " ",
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString($.value[w.key]),
                  1
                  /* TEXT */
                )
              ], 10, Ac)),
              64
              /* STABLE_FRAGMENT */
            ))
          ]),
          m.value && !y.all.length ? (e.openBlock(), e.createElementBlock("p", jc, [
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
          ])) : o.value.length ? (e.openBlock(!0), e.createElementBlock(
            e.Fragment,
            { key: 2 },
            e.renderList(I.value, (w) => (e.openBlock(), e.createElementBlock(
              e.Fragment,
              {
                key: w.key
              },
              [
                w.items.length ? (e.openBlock(), e.createElementBlock("div", zc, [
                  e.createElementVNode(
                    "span",
                    null,
                    e.toDisplayString(w.title),
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
                  e.renderList(w.items, (U) => (e.openBlock(), e.createElementBlock("button", {
                    key: U.id,
                    type: "button",
                    class: e.normalizeClass(["mm-mcard", { on: U.id === b.value }]),
                    "data-test": `mm-meeting-${U.id}`,
                    onClick: (G) => C(U.id)
                  }, [
                    e.createElementVNode("span", Pc, [
                      e.createTextVNode(
                        e.toDisplayString(U.title),
                        1
                        /* TEXT */
                      ),
                      U.needsMe ? (e.openBlock(), e.createElementBlock("i", {
                        key: 0,
                        class: "mm-mcard__dot",
                        title: E.$t("需要我处理")
                      }, null, 8, Uc)) : e.createCommentVNode("v-if", !0)
                    ]),
                    e.createElementVNode("span", Oc, [
                      e.createElementVNode(
                        "small",
                        null,
                        e.toDisplayString(U.projectName) + " · " + e.toDisplayString(e.unref(wt)(U.time)),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "span",
                        {
                          class: e.normalizeClass(["mm-tag", e.unref(ct)[U.status]])
                        },
                        e.toDisplayString(U.confirmText || e.unref(Je)[U.status]),
                        3
                        /* TEXT, CLASS */
                      )
                    ])
                  ], 10, Fc))),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ],
              64
              /* STABLE_FRAGMENT */
            ))),
            128
            /* KEYED_FRAGMENT */
          )) : (e.openBlock(), e.createElementBlock("div", Lc, [
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(a.value.trim() ? E.$t("没有找到匹配的会议") : s.value === "all" ? E.$t("还没有参加过会议") : E.$t("这个筛选下没有会议")),
              1
              /* TEXT */
            ),
            s.value === "all" && !a.value.trim() ? (e.openBlock(), e.createElementBlock(
              "button",
              {
                key: 0,
                type: "button",
                class: "ss-link",
                onClick: v[2] || (v[2] = (w) => g.value = !0)
              },
              e.toDisplayString(E.$t("新建会议")),
              1
              /* TEXT */
            )) : e.createCommentVNode("v-if", !0)
          ]))
        ]),
        b.value ? (e.openBlock(), e.createBlock(Oi, {
          key: b.value,
          ref_key: "detailRef",
          ref: c,
          "meeting-id": b.value,
          focus: d.value,
          onChanged: L,
          onRole: v[3] || (v[3] = (w) => f("role", w))
        }, null, 8, ["meeting-id", "focus"])) : (e.openBlock(), e.createElementBlock("section", Rc, [
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
            e.toDisplayString(y.all.length ? E.$t("选择左侧的会议查看详情") : E.$t("新建一场会议，上传录音或文字记录后自动整理纪要")),
            1
            /* TEXT */
          )
        ]))
      ]),
      g.value ? (e.openBlock(), e.createBlock(Lt, {
        key: 1,
        onClose: v[4] || (v[4] = (w) => g.value = !1),
        onCreated: z
      })) : e.createCommentVNode("v-if", !0)
    ]));
  }
}), Kc = /* @__PURE__ */ le(qc, [["__scopeId", "data-v-fbe808c5"]]), Hc = ["title"], Wc = { class: "mm-pc__name" }, Gc = { class: "mm-pc__dept" }, Yc = /* @__PURE__ */ e.defineComponent({
  __name: "PersonChip",
  props: {
    name: {},
    dept: {},
    plain: { type: Boolean }
  },
  setup(l) {
    const p = l, n = e.computed(() => oe(p.name));
    return (u, f) => (e.openBlock(), e.createElementBlock("span", {
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
        Wc,
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
            Gc,
            e.toDisplayString(l.dept),
            1
            /* TEXT */
          )
        ],
        64
        /* STABLE_FRAGMENT */
      )) : e.createCommentVNode("v-if", !0)
    ], 10, Hc));
  }
}), Ae = /* @__PURE__ */ le(Yc, [["__scopeId", "data-v-4f4c03f2"]]), Jc = { class: "mm-tt" }, Qc = {
  class: "mm-tt__head",
  "aria-hidden": "true"
}, Zc = {
  key: 0,
  class: "mm-tt__empty"
}, Xc = { class: "mm-tt__group" }, xc = ["data-test", "onClick"], ed = ["data-test", "onClick"], td = { class: "mm-tt__title" }, ld = { key: 0 }, nd = { class: "mm-tt__prog" }, ad = /* @__PURE__ */ e.defineComponent({
  __name: "TaskTable",
  props: {
    tasks: {},
    groupBy: { default: "status" },
    selectedId: { default: "" },
    showProject: { type: Boolean, default: !1 },
    emptyText: { default: "" }
  },
  emits: ["select"],
  setup(l, { emit: p }) {
    const n = l, u = p, f = e.computed(() => El(n.tasks, n.groupBy)), s = e.reactive({}), a = (i) => (i.key in s ? s[i.key] : i.collapsedByDefault) && !(n.selectedId && i.tasks.some((g) => g.id === n.selectedId) && !(i.key in s));
    function m(i) {
      s[i.key] = !a(i);
    }
    return (i, g) => (e.openBlock(), e.createElementBlock("div", Jc, [
      e.createElementVNode("div", Qc, [
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
        Zc,
        e.toDisplayString(l.emptyText || i.$t("没有任务")),
        1
        /* TEXT */
      )),
      (e.openBlock(!0), e.createElementBlock(
        e.Fragment,
        null,
        e.renderList(f.value, (b) => (e.openBlock(), e.createElementBlock(
          e.Fragment,
          {
            key: b.key
          },
          [
            e.createElementVNode("div", Xc, [
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(b.title) + " · " + e.toDisplayString(b.tasks.length),
                1
                /* TEXT */
              ),
              b.collapsedByDefault || s[b.key] ? (e.openBlock(), e.createElementBlock("button", {
                key: 0,
                type: "button",
                class: "mm-tt__fold",
                "data-test": `mm-tt-fold-${b.key}`,
                onClick: (d) => m(b)
              }, [
                e.createTextVNode(
                  e.toDisplayString(a(b) ? i.$t("展开") : i.$t("收起")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "i",
                  {
                    class: e.normalizeClass(a(b) ? "ri-arrow-down-s-line" : "ri-arrow-up-s-line"),
                    "aria-hidden": "true"
                  },
                  null,
                  2
                  /* CLASS */
                )
              ], 8, xc)) : e.createCommentVNode("v-if", !0)
            ]),
            a(b) ? e.createCommentVNode("v-if", !0) : (e.openBlock(!0), e.createElementBlock(
              e.Fragment,
              { key: 0 },
              e.renderList(b.tasks, (d) => (e.openBlock(), e.createElementBlock("button", {
                key: d.id,
                type: "button",
                class: e.normalizeClass(["mm-tt__row", { on: d.id === l.selectedId, ended: d.status === "done" || d.status === "cancelled" }]),
                "data-test": `mm-task-row-${d.id}`,
                onClick: (c) => u("select", d)
              }, [
                e.createElementVNode("span", td, [
                  e.createElementVNode(
                    "strong",
                    null,
                    e.toDisplayString(d.title),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "small",
                    null,
                    e.toDisplayString(l.showProject ? `${d.projectName} · ${d.meetingTitle}` : d.meetingTitle),
                    1
                    /* TEXT */
                  )
                ]),
                e.createElementVNode("span", null, [
                  e.createVNode(Ae, {
                    name: d.assigneeName,
                    dept: d.deptName
                  }, null, 8, ["name", "dept"])
                ]),
                e.createElementVNode(
                  "span",
                  {
                    class: e.normalizeClass(["mm-tt__due", { bad: d.overdue }])
                  },
                  [
                    e.createTextVNode(
                      e.toDisplayString(e.unref(it)(d.due)) + " ",
                      1
                      /* TEXT */
                    ),
                    d.overdue && d.overdueDays > 0 ? (e.openBlock(), e.createElementBlock(
                      "small",
                      ld,
                      e.toDisplayString(i.$t("逾期 {n} 天", { n: d.overdueDays })),
                      1
                      /* TEXT */
                    )) : e.createCommentVNode("v-if", !0)
                  ],
                  2
                  /* CLASS */
                ),
                e.createElementVNode("span", nd, [
                  e.createElementVNode(
                    "i",
                    {
                      class: e.normalizeClass(["mm-bar", { bad: d.overdue }])
                    },
                    [
                      e.createElementVNode(
                        "b",
                        {
                          style: e.normalizeStyle({ width: `${e.unref(ge)(d.percent)}%` })
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
                    e.toDisplayString(e.unref(ge)(d.percent)) + "%",
                    1
                    /* TEXT */
                  )
                ]),
                e.createElementVNode("span", null, [
                  e.createElementVNode(
                    "span",
                    {
                      class: e.normalizeClass(["mm-tag", e.unref(It)(d)])
                    },
                    e.toDisplayString(e.unref(gl)(d)),
                    3
                    /* TEXT, CLASS */
                  )
                ])
              ], 10, ed))),
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
}), zt = /* @__PURE__ */ le(ad, [["__scopeId", "data-v-f1ba1ed1"]]), Ne = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/composables/useDialog.ts"];
if (!Ne) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/composables/useDialog.ts");
Ne.default;
const od = {
  class: "mm-ob",
  "data-test": "mm-objection-panel"
}, sd = {
  key: 0,
  class: "ss-note danger"
}, rd = { class: "mm-ob__title" }, id = { class: "ss-chip" }, cd = { class: "mm-ob__sides" }, dd = {
  class: "mm-ob__side raiser",
  "data-test": "mm-ob-raiser"
}, md = {
  key: 0,
  class: "strong"
}, ud = {
  class: "mm-ob__side owner",
  "data-test": "mm-ob-owner"
}, pd = {
  key: 0,
  class: "strong"
}, vd = {
  key: 1,
  class: "muted"
}, kd = { key: 2 }, gd = {
  key: 0,
  class: "mm-ob__box",
  "data-test": "mm-ob-review"
}, yd = { class: "sub" }, fd = { class: "mm-ob__btns" }, Ed = ["disabled"], Nd = ["disabled"], Vd = ["disabled"], $d = {
  key: 1,
  class: "mm-ob__box",
  "data-test": "mm-ob-reply"
}, hd = { class: "sub" }, bd = { class: "mm-ob__btns" }, _d = ["disabled"], Bd = ["disabled"], Sd = {
  key: 2,
  class: "mm-ob__box",
  "data-test": "mm-ob-arbitrate"
}, Dd = { class: "sub" }, wd = { class: "mm-ob__btns" }, Cd = ["disabled"], Td = ["disabled"], Id = ["disabled"], Md = {
  key: 3,
  class: "ss-note info"
}, Ad = {
  key: 4,
  class: "mm-ob__form",
  "data-test": "mm-ob-form"
}, jd = { class: "ss-muted" }, Ld = { class: "ss-field" }, zd = { class: "ss-field" }, Fd = { class: "ss-field" }, Pd = { class: "ss-field" }, Ud = ["placeholder"], Od = { class: "ss-actions" }, Rd = ["disabled"], qd = {
  key: 2,
  class: "ss-empty"
}, Kd = {
  key: 3,
  class: "mm-ob__hist"
}, Hd = { class: "ss-chip" }, Wd = { class: "mm-ob__log" }, Gd = {
  key: 0,
  class: "ss-muted"
}, Yd = {
  key: 1,
  class: "mm-tl",
  "data-test": "mm-ob-log"
}, Jd = /* @__PURE__ */ e.defineComponent({
  __name: "ObjectionPanel",
  props: {
    task: {},
    can: {},
    names: {}
  },
  emits: ["changed"],
  setup(l, { emit: p }) {
    const n = l, u = p, f = {
      review_adopt: t.t("采纳并调整"),
      review_reject: t.t("驳回并说明"),
      arb_keep: t.t("维持原方案"),
      arb_adjust: t.t("按异议调整")
    }, s = Ne.useDialog(), a = se.useNotificationStore(), m = e.ref(!1), i = e.ref(""), g = e.ref(""), b = e.ref(""), d = e.reactive({ title: "", standard: "", due: "" }), c = e.computed(() => Se(n.task) ? n.task.objection : null), y = e.computed(() => ot(n.names, c.value?.raisedBy, n.task.assigneeName)), $ = e.computed(() => {
      const _ = c.value?.review;
      return _ ? _.decision === "adopt" ? t.t("已采纳") : t.t("已驳回") : t.t("待复核");
    }), o = e.computed(() => !!(n.can.review || n.can.reply || n.can.escalate || n.can.arbitrate)), I = e.computed(() => {
      const _ = c.value?.stage;
      return _ === "review" ? t.t("等待任务负责人 {name} 复核", { name: n.task.ownerName }) : _ === "dept_reply" ? t.t("任务负责人已驳回，等待部门负责人 {name} 接受驳回或提交裁决", { name: y.value }) : _ === "arbitration" ? t.t("已提交裁决，等待项目负责人裁决") : "";
    }), F = e.computed(() => [...n.task.objectionHistory ?? []].sort((_, E) => (E.resolvedAt || E.raisedAt) - (_.resolvedAt || _.raisedAt))), P = e.computed(() => bl(n.task.events));
    e.watch(() => [n.task.id, c.value?.stage], () => {
      g.value = "", i.value = "";
    });
    function L(_) {
      Object.assign(d, Sl(n.task)), b.value = "", g.value = _;
    }
    async function D(_, E, v) {
      m.value = !0, i.value = "";
      try {
        return await W(_, E), a.success(v), g.value = "", u("changed"), !0;
      } catch (w) {
        return i.value = X.errorMessage(w), !1;
      } finally {
        m.value = !1;
      }
    }
    async function C() {
      const _ = n.task.id, E = b.value.trim(), v = Bl(d, n.task);
      switch (g.value) {
        case "review_adopt":
          await D("task.objection.review", { id: _, decision: "adopt", note: E, changes: v }, t.t("已采纳，任务回到待接收，等待部门负责人重新确认"));
          break;
        case "review_reject":
          await D("task.objection.review", { id: _, decision: "reject", note: E }, t.t("已驳回，等待部门负责人回应"));
          break;
        case "arb_keep":
          await D("task.objection.arbitrate", { id: _, decision: "keep", note: E }, t.t("已裁决：维持原方案"));
          break;
        case "arb_adjust":
          await D("task.objection.arbitrate", { id: _, decision: "adjust", note: E, changes: v }, t.t("已裁决：按异议调整"));
          break;
      }
    }
    async function z(_) {
      await s.confirm(_ === "accept" ? { title: t.t("接受驳回"), message: t.t("接受后异议结束，任务回到发起前的状态，按原方案执行。") } : { title: t.t("提交裁决"), message: t.t("提交后由项目负责人裁决，裁决结果为最终结果。") }) && await D("task.objection.reply", { id: n.task.id, decision: _ }, _ === "accept" ? t.t("已接受驳回") : t.t("已提交项目负责人裁决"));
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
      _ === "review" ? await D("task.objection.review", { id: n.task.id, decision: "adopt", note: v, changes: { cancel: !0 } }, t.t("任务已删除")) : await D("task.objection.arbitrate", { id: n.task.id, decision: "adjust", note: v, changes: { cancel: !0 } }, t.t("任务已删除"));
    }
    return (_, E) => (e.openBlock(), e.createElementBlock("div", od, [
      i.value ? (e.openBlock(), e.createElementBlock("p", sd, [
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
          e.createElementVNode("h4", rd, [
            e.createTextVNode(
              e.toDisplayString(_.$t("当前分歧：{t}", { t: e.unref(tt)[c.value.target] })) + " ",
              1
              /* TEXT */
            ),
            e.createElementVNode(
              "span",
              id,
              e.toDisplayString(c.value.kind === "change" ? _.$t("执行中申请变更") : _.$t("接收时提出异议")),
              1
              /* TEXT */
            )
          ]),
          e.createElementVNode("div", cd, [
            e.createElementVNode("article", dd, [
              e.createElementVNode("header", null, [
                e.createElementVNode(
                  "i",
                  {
                    class: "av",
                    style: e.normalizeStyle({ background: e.unref(oe)(y.value).color }),
                    "aria-hidden": "true"
                  },
                  e.toDisplayString(e.unref(oe)(y.value).text),
                  5
                  /* TEXT, STYLE */
                ),
                e.createElementVNode(
                  "b",
                  null,
                  e.toDisplayString(y.value),
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
              c.value.suggestion || c.value.suggestedDue ? (e.openBlock(), e.createElementBlock("p", md, [
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
                      e.toDisplayString(c.value.suggestion ? _.$t("，") : "") + e.toDisplayString(_.$t("建议截止调整为 {d}", { d: e.unref(it)(c.value.suggestedDue) })),
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
                e.toDisplayString(e.unref(ze)(c.value.raisedAt)),
                1
                /* TEXT */
              )
            ]),
            e.createElementVNode("article", ud, [
              e.createElementVNode("header", null, [
                e.createElementVNode(
                  "i",
                  {
                    class: "av",
                    style: e.normalizeStyle({ background: e.unref(oe)(l.task.ownerName).color }),
                    "aria-hidden": "true"
                  },
                  e.toDisplayString(e.unref(oe)(l.task.ownerName).text),
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
                  e.toDisplayString($.value),
                  1
                  /* TEXT */
                )
              ]),
              c.value.review ? (e.openBlock(), e.createElementBlock(
                "p",
                pd,
                e.toDisplayString(c.value.review.note || "—"),
                1
                /* TEXT */
              )) : (e.openBlock(), e.createElementBlock(
                "p",
                vd,
                e.toDisplayString(_.$t("还没有复核意见")),
                1
                /* TEXT */
              )),
              c.value.review ? (e.openBlock(), e.createElementBlock(
                "time",
                kd,
                e.toDisplayString(e.unref(ze)(c.value.review.at)),
                1
                /* TEXT */
              )) : e.createCommentVNode("v-if", !0)
            ])
          ]),
          e.createCommentVNode(" 任务负责人复核 "),
          l.can.review ? (e.openBlock(), e.createElementBlock("section", gd, [
            e.createElementVNode(
              "h5",
              null,
              e.toDisplayString(_.$t("你的复核")),
              1
              /* TEXT */
            ),
            e.createElementVNode(
              "p",
              yd,
              e.toDisplayString(_.$t("采纳后任务回到待接收，由部门负责人重新确认；驳回后由部门负责人决定接受驳回还是提交裁决")),
              1
              /* TEXT */
            ),
            e.createElementVNode("div", fd, [
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn",
                disabled: m.value,
                "data-test": "mm-ob-reject",
                onClick: E[0] || (E[0] = (v) => L("review_reject"))
              }, e.toDisplayString(_.$t("驳回并说明")), 9, Ed),
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn primary",
                disabled: m.value,
                "data-test": "mm-ob-adopt",
                onClick: E[1] || (E[1] = (v) => L("review_adopt"))
              }, e.toDisplayString(_.$t("采纳并调整")), 9, Nd)
            ]),
            e.createElementVNode("button", {
              type: "button",
              class: "ss-link more",
              disabled: m.value,
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
            ], 8, Vd)
          ])) : e.createCommentVNode("v-if", !0),
          e.createCommentVNode(" 部门负责人回应驳回 "),
          l.can.reply || l.can.escalate ? (e.openBlock(), e.createElementBlock("section", $d, [
            e.createElementVNode(
              "h5",
              null,
              e.toDisplayString(_.$t("任务负责人驳回了你的异议")),
              1
              /* TEXT */
            ),
            e.createElementVNode(
              "p",
              hd,
              e.toDisplayString(_.$t("接受驳回则回到发起前的状态按原方案执行；不接受可以提交项目负责人裁决")),
              1
              /* TEXT */
            ),
            e.createElementVNode("div", bd, [
              l.can.reply ? (e.openBlock(), e.createElementBlock("button", {
                key: 0,
                type: "button",
                class: "ss-btn",
                disabled: m.value,
                "data-test": "mm-ob-accept-reject",
                onClick: E[3] || (E[3] = (v) => z("accept"))
              }, e.toDisplayString(_.$t("接受驳回")), 9, _d)) : e.createCommentVNode("v-if", !0),
              l.can.escalate ? (e.openBlock(), e.createElementBlock("button", {
                key: 1,
                type: "button",
                class: "ss-btn primary",
                disabled: m.value,
                "data-test": "mm-ob-escalate",
                onClick: E[4] || (E[4] = (v) => z("escalate"))
              }, e.toDisplayString(_.$t("提交裁决")), 9, Bd)) : e.createCommentVNode("v-if", !0)
            ])
          ])) : e.createCommentVNode("v-if", !0),
          e.createCommentVNode(" 项目负责人裁决 "),
          l.can.arbitrate ? (e.openBlock(), e.createElementBlock("section", Sd, [
            e.createElementVNode(
              "h5",
              null,
              e.toDisplayString(_.$t("你的裁决（最终结果）")),
              1
              /* TEXT */
            ),
            e.createElementVNode(
              "p",
              Dd,
              e.toDisplayString(_.$t("裁决后通知任务负责人和部门负责人，记入总结报告")),
              1
              /* TEXT */
            ),
            e.createElementVNode("div", wd, [
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn",
                disabled: m.value,
                "data-test": "mm-ob-keep",
                onClick: E[5] || (E[5] = (v) => L("arb_keep"))
              }, e.toDisplayString(_.$t("维持原方案")), 9, Cd),
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn primary",
                disabled: m.value,
                "data-test": "mm-ob-adjust",
                onClick: E[6] || (E[6] = (v) => L("arb_adjust"))
              }, e.toDisplayString(_.$t("按异议调整")), 9, Td)
            ]),
            e.createElementVNode("button", {
              type: "button",
              class: "ss-link more",
              disabled: m.value,
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
            ], 8, Id)
          ])) : e.createCommentVNode("v-if", !0),
          o.value ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock("p", Md, [
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
          g.value ? (e.openBlock(), e.createElementBlock("section", Ad, [
            e.createElementVNode(
              "h5",
              null,
              e.toDisplayString(f[g.value]),
              1
              /* TEXT */
            ),
            g.value === "review_adopt" || g.value === "arb_adjust" ? (e.openBlock(), e.createElementBlock(
              e.Fragment,
              { key: 0 },
              [
                e.createElementVNode(
                  "p",
                  jd,
                  e.toDisplayString(_.$t("按异议改好任务内容；没改的项保持原样。")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode("label", Ld, [
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
                      "onUpdate:modelValue": E[8] || (E[8] = (v) => d.title = v),
                      type: "text",
                      "data-test": "mm-ob-title"
                    },
                    null,
                    512
                    /* NEED_PATCH */
                  ), [
                    [e.vModelText, d.title]
                  ])
                ]),
                e.createElementVNode("label", zd, [
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
                      "onUpdate:modelValue": E[9] || (E[9] = (v) => d.standard = v),
                      rows: "2"
                    },
                    null,
                    512
                    /* NEED_PATCH */
                  ), [
                    [e.vModelText, d.standard]
                  ])
                ]),
                e.createElementVNode("label", Fd, [
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
                      "onUpdate:modelValue": E[10] || (E[10] = (v) => d.due = v),
                      type: "date",
                      "data-test": "mm-ob-due"
                    },
                    null,
                    512
                    /* NEED_PATCH */
                  ), [
                    [e.vModelText, d.due]
                  ])
                ])
              ],
              64
              /* STABLE_FRAGMENT */
            )) : e.createCommentVNode("v-if", !0),
            e.createElementVNode("label", Pd, [
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(g.value === "review_reject" ? _.$t("驳回理由") : _.$t("说明（可选）")),
                1
                /* TEXT */
              ),
              e.withDirectives(e.createElementVNode("textarea", {
                "onUpdate:modelValue": E[11] || (E[11] = (v) => b.value = v),
                rows: "3",
                placeholder: g.value === "review_reject" ? _.$t("写明为什么维持原方案，部门负责人会看到") : "",
                "data-test": "mm-ob-note"
              }, null, 8, Ud), [
                [e.vModelText, b.value]
              ])
            ]),
            e.createElementVNode("div", Od, [
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn primary sm",
                disabled: m.value || g.value === "review_reject" && !b.value.trim(),
                "data-test": "mm-ob-submit",
                onClick: C
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
                  e.toDisplayString(_.$t("确认")),
                  1
                  /* TEXT */
                )
              ], 8, Rd),
              e.createElementVNode(
                "button",
                {
                  type: "button",
                  class: "ss-link",
                  onClick: E[12] || (E[12] = (v) => g.value = "")
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
        qd,
        e.toDisplayString(_.$t("当前没有处理中的异议")),
        1
        /* TEXT */
      )),
      F.value.length ? (e.openBlock(), e.createElementBlock("section", Kd, [
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
            e.renderList(F.value, (v) => (e.openBlock(), e.createElementBlock("li", {
              key: v.id
            }, [
              e.createElementVNode(
                "span",
                Hd,
                e.toDisplayString(v.kind === "change" ? _.$t("变更申请") : _.$t("异议")) + " · " + e.toDisplayString(e.unref(tt)[v.target]),
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
                e.toDisplayString(e.unref(_l)(v.outcome)),
                3
                /* TEXT, CLASS */
              ),
              e.createElementVNode(
                "time",
                null,
                e.toDisplayString(e.unref(ze)(v.resolvedAt || v.raisedAt)),
                1
                /* TEXT */
              )
            ]))),
            128
            /* KEYED_FRAGMENT */
          ))
        ])
      ])) : e.createCommentVNode("v-if", !0),
      e.createElementVNode("section", Wd, [
        e.createElementVNode(
          "h4",
          null,
          e.toDisplayString(_.$t("变更记录")),
          1
          /* TEXT */
        ),
        P.value.length ? (e.openBlock(), e.createElementBlock("ol", Yd, [
          (e.openBlock(!0), e.createElementBlock(
            e.Fragment,
            null,
            e.renderList(P.value, (v, w) => (e.openBlock(), e.createElementBlock("li", { key: w }, [
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
                    e.toDisplayString(e.unref(ot)(l.names, v.by, v.by)),
                    1
                    /* TEXT */
                  ),
                  e.createTextVNode(
                    " " + e.toDisplayString(e.unref(hl)(v)),
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
                  e.toDisplayString(e.unref(ze)(v.at)),
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
          Gd,
          e.toDisplayString(_.$t("没有变更记录")),
          1
          /* TEXT */
        ))
      ])
    ]));
  }
}), Qd = /* @__PURE__ */ le(Jd, [["__scopeId", "data-v-16692f6c"]]), Zd = ["aria-label"], Xd = ["aria-label"], xd = {
  key: 0,
  class: "mm-td__loading"
}, em = {
  key: 1,
  class: "ss-note danger"
}, tm = { class: "mm-td__head" }, lm = { class: "mm-td__meta" }, nm = {
  class: "mm-td__tabs",
  role: "tablist"
}, am = ["aria-selected", "data-test", "onClick"], om = ["aria-label"], sm = { class: "mm-td__body" }, rm = {
  key: 0,
  class: "mm-td__dl"
}, im = { class: "pre" }, cm = { class: "pre" }, dm = { class: "mm-td__prog" }, mm = { class: "mm-td__log" }, um = {
  key: 0,
  class: "ss-empty"
}, pm = {
  key: 1,
  class: "mm-tl"
}, vm = {
  key: 0,
  class: "mm-tl__note"
}, km = {
  key: 3,
  class: "mm-td__form",
  "data-test": "mm-form-progress"
}, gm = { class: "mm-td__range" }, ym = { class: "mm-td__status" }, fm = { class: "mm-tag brand" }, Em = { class: "ss-field" }, Nm = ["placeholder"], Vm = { class: "ss-actions" }, $m = ["disabled"], hm = {
  key: 4,
  class: "mm-td__form",
  "data-test": "mm-form-complete"
}, bm = { class: "ss-muted" }, _m = { class: "ss-field" }, Bm = ["placeholder"], Sm = { class: "ss-actions" }, Dm = ["disabled"], wm = {
  key: 5,
  class: "mm-td__form",
  "data-test": "mm-form-raise"
}, Cm = { class: "ss-muted" }, Tm = ["aria-label"], Im = ["value"], Mm = { class: "ss-field" }, Am = ["placeholder"], jm = { class: "ss-field" }, Lm = ["placeholder"], zm = {
  key: 0,
  class: "ss-field"
}, Fm = ["min"], Pm = { class: "ss-actions" }, Um = ["disabled"], Om = {
  key: 0,
  class: "mm-td__foot"
}, Rm = ["disabled"], qm = ["disabled"], Km = ["disabled"], Hm = ["disabled"], Wm = ["disabled"], Gm = /* @__PURE__ */ e.defineComponent({
  __name: "TaskDetailPanel",
  props: {
    taskId: {},
    refreshSeq: { default: 0 }
  },
  emits: ["close", "changed", "role"],
  setup(l, { emit: p }) {
    const n = l, u = p, f = [
      { key: "detail", title: t.t("详情") },
      { key: "progress", title: t.t("进度记录") },
      { key: "objection", title: t.t("异议与变更") }
    ], s = se.useNotificationStore(), a = e.ref(null), m = e.ref(!1), i = e.ref(!1), g = e.ref(""), b = e.ref("detail"), d = e.ref(""), c = e.reactive({ percent: 0, note: "" }), y = e.ref(""), $ = e.reactive({ target: "time", reason: "", suggestion: "", suggestedDue: "" }), o = e.computed(() => a.value?.task ?? null), I = e.computed(() => a.value?.can ?? {}), F = e.computed(() => !!o.value && Se(o.value)), P = e.computed(() => !!(I.value.accept || I.value.object || I.value.progress || I.value.complete || I.value.change)), L = e.computed(() => [...o.value?.progressLog ?? []].sort((k, h) => h.at - k.at)), D = e.computed(() => I.value.object ? t.t("提出异议") : t.t("申请变更")), C = (k) => k === "done" ? "ok" : k === "in_progress" ? "brand" : k === "to_accept" ? "warn" : "";
    async function z(k) {
      if (n.taskId) {
        m.value = !0, g.value = "";
        try {
          const h = await W("task.get", { id: n.taskId });
          a.value = h, u("role", wl(h.task, te.value?.me.person?.id, h.project?.ownerId, h.can)), k && (b.value = Dl(h.task, h.can), d.value = "");
        } catch (h) {
          g.value = X.errorMessage(h), k && (a.value = null);
        } finally {
          m.value = !1;
        }
      }
    }
    e.watch(() => n.taskId, () => {
      z(!0);
    }, { immediate: !0 }), e.watch(() => n.refreshSeq, () => {
      z(!1);
    });
    function R(k) {
      const h = o.value;
      h && (k === "progress" && Object.assign(c, { percent: ge(h.percent), note: "" }), k === "complete" && (y.value = ""), k === "raise" && Object.assign($, { target: "time", reason: "", suggestion: "", suggestedDue: "" }), d.value = k);
    }
    async function _(k, h, r) {
      i.value = !0, g.value = "";
      try {
        await W(k, h), s.success(r), d.value = "", await E();
      } catch (H) {
        g.value = X.errorMessage(H);
      } finally {
        i.value = !1;
      }
    }
    async function E() {
      await z(!1), u("changed");
    }
    function v() {
      return _("task.accept", { id: n.taskId }, t.t("已接收任务"));
    }
    function w() {
      const k = Math.max(0, Math.min(100, Math.round(Number(c.percent) || 0)));
      return _("task.progress", { id: n.taskId, percent: k, note: c.note.trim(), status: "in_progress" }, t.t("进度已更新"));
    }
    function U() {
      return _("task.complete", { id: n.taskId, note: y.value.trim() || void 0 }, t.t("已标记完成，已通知任务负责人"));
    }
    function G() {
      const k = {
        id: n.taskId,
        target: $.target,
        reason: $.reason.trim(),
        suggestion: $.suggestion.trim()
      };
      return $.target === "time" && $.suggestedDue && (k.suggestedDue = $.suggestedDue), _("task.objection.raise", k, t.t("已提交，等待任务负责人复核")).then(() => {
        g.value || (b.value = "objection");
      });
    }
    return (k, h) => (e.openBlock(), e.createElementBlock("aside", {
      class: "mm-td",
      "aria-label": k.$t("任务详情"),
      "data-test": "mm-task-detail"
    }, [
      e.createElementVNode("button", {
        type: "button",
        class: "mm-td__close",
        "aria-label": k.$t("关闭"),
        "data-test": "mm-task-detail-close",
        onClick: h[0] || (h[0] = (r) => u("close"))
      }, [...h[18] || (h[18] = [
        e.createElementVNode(
          "i",
          { class: "ri-close-line" },
          null,
          -1
          /* CACHED */
        )
      ])], 8, Xd),
      m.value && !a.value ? (e.openBlock(), e.createElementBlock("p", xd, [
        h[19] || (h[19] = e.createElementVNode(
          "i",
          { class: "ri-loader-4-line spin" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(k.$t("加载中…")),
          1
          /* TEXT */
        )
      ])) : e.createCommentVNode("v-if", !0),
      g.value ? (e.openBlock(), e.createElementBlock("p", em, [
        h[20] || (h[20] = e.createElementVNode(
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
      ])) : e.createCommentVNode("v-if", !0),
      a.value && o.value ? (e.openBlock(), e.createElementBlock(
        e.Fragment,
        { key: 2 },
        [
          e.createElementVNode("header", tm, [
            e.createElementVNode(
              "span",
              {
                class: e.normalizeClass(["mm-tag", e.unref(It)(o.value)]),
                "data-test": "mm-task-status"
              },
              e.toDisplayString(e.unref(yl)(o.value)),
              3
              /* TEXT, CLASS */
            ),
            e.createElementVNode(
              "h3",
              null,
              e.toDisplayString(o.value.title),
              1
              /* TEXT */
            ),
            e.createElementVNode("p", lm, [
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(o.value.deptName) + " · " + e.toDisplayString(o.value.assigneeName),
                1
                /* TEXT */
              ),
              h[21] || (h[21] = e.createElementVNode(
                "i",
                { "aria-hidden": "true" },
                "|",
                -1
                /* CACHED */
              )),
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(k.$t("任务负责人 {name}", { name: o.value.ownerName })),
                1
                /* TEXT */
              ),
              h[22] || (h[22] = e.createElementVNode(
                "i",
                { "aria-hidden": "true" },
                "|",
                -1
                /* CACHED */
              )),
              e.createElementVNode(
                "span",
                {
                  class: e.normalizeClass({ bad: o.value.overdue })
                },
                [
                  e.createTextVNode(
                    e.toDisplayString(k.$t("截止 {d}", { d: e.unref(it)(o.value.due) })),
                    1
                    /* TEXT */
                  ),
                  F.value ? (e.openBlock(), e.createElementBlock(
                    e.Fragment,
                    { key: 0 },
                    [
                      e.createTextVNode(
                        e.toDisplayString(k.$t("（处理期间照常计时）")),
                        1
                        /* TEXT */
                      )
                    ],
                    64
                    /* STABLE_FRAGMENT */
                  )) : e.createCommentVNode("v-if", !0),
                  o.value.overdue && o.value.overdueDays > 0 ? (e.openBlock(), e.createElementBlock(
                    e.Fragment,
                    { key: 1 },
                    [
                      e.createTextVNode(
                        " · " + e.toDisplayString(k.$t("逾期 {n} 天", { n: o.value.overdueDays })),
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
          e.createElementVNode("nav", nm, [
            (e.openBlock(), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(f, (r) => e.createElementVNode("button", {
                key: r.key,
                type: "button",
                role: "tab",
                "aria-selected": b.value === r.key,
                class: e.normalizeClass({ on: b.value === r.key }),
                "data-test": `mm-td-tab-${r.key}`,
                onClick: (H) => b.value = r.key
              }, [
                e.createTextVNode(
                  e.toDisplayString(r.title),
                  1
                  /* TEXT */
                ),
                r.key === "objection" && F.value ? (e.openBlock(), e.createElementBlock("i", {
                  key: 0,
                  class: "mm-dot",
                  "aria-label": k.$t("有处理中的异议")
                }, null, 8, om)) : e.createCommentVNode("v-if", !0)
              ], 10, am)),
              64
              /* STABLE_FRAGMENT */
            ))
          ]),
          e.createElementVNode("div", sm, [
            e.createCommentVNode(" 详情 "),
            b.value === "detail" ? (e.openBlock(), e.createElementBlock("dl", rm, [
              e.createElementVNode(
                "dt",
                null,
                e.toDisplayString(k.$t("来源会议")),
                1
                /* TEXT */
              ),
              e.createElementVNode("dd", null, [
                e.createElementVNode(
                  "button",
                  {
                    type: "button",
                    class: "ss-link",
                    onClick: h[1] || (h[1] = (r) => e.unref(de)({ kind: "meeting", id: o.value.meetingId }))
                  },
                  e.toDisplayString(o.value.meetingTitle || "—"),
                  1
                  /* TEXT */
                )
              ]),
              e.createElementVNode(
                "dt",
                null,
                e.toDisplayString(k.$t("所属项目")),
                1
                /* TEXT */
              ),
              e.createElementVNode("dd", null, [
                e.createElementVNode(
                  "button",
                  {
                    type: "button",
                    class: "ss-link",
                    onClick: h[2] || (h[2] = (r) => e.unref(de)({ kind: "project", id: o.value.projectId }))
                  },
                  e.toDisplayString(o.value.projectName || "—"),
                  1
                  /* TEXT */
                )
              ]),
              e.createElementVNode(
                "dt",
                null,
                e.toDisplayString(k.$t("责任部门")),
                1
                /* TEXT */
              ),
              e.createElementVNode("dd", null, [
                e.createVNode(Ae, {
                  name: o.value.assigneeName,
                  dept: o.value.deptName
                }, null, 8, ["name", "dept"])
              ]),
              e.createElementVNode(
                "dt",
                null,
                e.toDisplayString(k.$t("任务负责人")),
                1
                /* TEXT */
              ),
              e.createElementVNode("dd", null, [
                e.createVNode(Ae, {
                  name: o.value.ownerName
                }, null, 8, ["name"])
              ]),
              e.createElementVNode(
                "dt",
                null,
                e.toDisplayString(k.$t("执行事项")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "dd",
                im,
                e.toDisplayString(o.value.title),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "dt",
                null,
                e.toDisplayString(k.$t("交付标准")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "dd",
                cm,
                e.toDisplayString(o.value.standard || "—"),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "dt",
                null,
                e.toDisplayString(k.$t("完成时间")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "dd",
                {
                  class: e.normalizeClass({ bad: o.value.overdue })
                },
                [
                  e.createTextVNode(
                    e.toDisplayString(o.value.due || "—"),
                    1
                    /* TEXT */
                  ),
                  o.value.overdue && o.value.overdueDays > 0 ? (e.openBlock(), e.createElementBlock(
                    e.Fragment,
                    { key: 0 },
                    [
                      e.createTextVNode(
                        e.toDisplayString(k.$t("（逾期 {n} 天）", { n: o.value.overdueDays })),
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
                e.toDisplayString(k.$t("当前进度")),
                1
                /* TEXT */
              ),
              e.createElementVNode("dd", dm, [
                e.createElementVNode(
                  "i",
                  {
                    class: e.normalizeClass(["mm-bar", { bad: o.value.overdue }])
                  },
                  [
                    e.createElementVNode(
                      "b",
                      {
                        style: e.normalizeStyle({ width: `${e.unref(ge)(o.value.percent)}%` })
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
                  e.toDisplayString(e.unref(ge)(o.value.percent)) + "%",
                  1
                  /* TEXT */
                )
              ]),
              e.createElementVNode(
                "dt",
                null,
                e.toDisplayString(k.$t("下发时间")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "dd",
                null,
                e.toDisplayString(e.unref(ye)(o.value.createdAt)),
                1
                /* TEXT */
              ),
              o.value.acceptedAt ? (e.openBlock(), e.createElementBlock(
                e.Fragment,
                { key: 0 },
                [
                  e.createElementVNode(
                    "dt",
                    null,
                    e.toDisplayString(k.$t("接收时间")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "dd",
                    null,
                    e.toDisplayString(e.unref(ye)(o.value.acceptedAt)),
                    1
                    /* TEXT */
                  )
                ],
                64
                /* STABLE_FRAGMENT */
              )) : e.createCommentVNode("v-if", !0),
              o.value.doneAt ? (e.openBlock(), e.createElementBlock(
                e.Fragment,
                { key: 1 },
                [
                  e.createElementVNode(
                    "dt",
                    null,
                    e.toDisplayString(k.$t("完成于")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "dd",
                    null,
                    e.toDisplayString(e.unref(ye)(o.value.doneAt)),
                    1
                    /* TEXT */
                  )
                ],
                64
                /* STABLE_FRAGMENT */
              )) : e.createCommentVNode("v-if", !0)
            ])) : b.value === "progress" ? (e.openBlock(), e.createElementBlock(
              e.Fragment,
              { key: 1 },
              [
                e.createCommentVNode(" 进度记录 "),
                e.createElementVNode("div", mm, [
                  L.value.length ? (e.openBlock(), e.createElementBlock("ol", pm, [
                    (e.openBlock(!0), e.createElementBlock(
                      e.Fragment,
                      null,
                      e.renderList(L.value, (r, H) => (e.openBlock(), e.createElementBlock("li", { key: H }, [
                        h[23] || (h[23] = e.createElementVNode(
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
                              e.toDisplayString(e.unref(ot)(a.value.names, r.by, r.by)),
                              1
                              /* TEXT */
                            ),
                            e.createTextVNode(
                              " " + e.toDisplayString(k.$t("更新进度到 {n}%", { n: e.unref(ge)(r.percent) })) + " · ",
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "span",
                              {
                                class: e.normalizeClass(["mm-tag sm", C(r.status)])
                              },
                              e.toDisplayString(e.unref(Fe)[r.status]),
                              3
                              /* TEXT, CLASS */
                            )
                          ]),
                          r.note ? (e.openBlock(), e.createElementBlock(
                            "p",
                            vm,
                            e.toDisplayString(r.note),
                            1
                            /* TEXT */
                          )) : e.createCommentVNode("v-if", !0),
                          e.createElementVNode(
                            "time",
                            null,
                            e.toDisplayString(e.unref(ze)(r.at)),
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
                    um,
                    e.toDisplayString(k.$t("还没有进度记录")),
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
                e.createVNode(Qd, {
                  task: o.value,
                  can: a.value.can,
                  names: a.value.names,
                  onChanged: E
                }, null, 8, ["task", "can", "names"])
              ],
              2112
              /* STABLE_FRAGMENT, DEV_ROOT_FRAGMENT */
            )),
            e.createCommentVNode(" 动作表单 "),
            d.value === "progress" ? (e.openBlock(), e.createElementBlock("section", km, [
              e.createElementVNode(
                "h4",
                null,
                e.toDisplayString(k.$t("更新进度")),
                1
                /* TEXT */
              ),
              e.createElementVNode("label", gm, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(k.$t("完成百分比")),
                  1
                  /* TEXT */
                ),
                e.withDirectives(e.createElementVNode(
                  "input",
                  {
                    "onUpdate:modelValue": h[3] || (h[3] = (r) => c.percent = r),
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
                    "onUpdate:modelValue": h[4] || (h[4] = (r) => c.percent = r),
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
                h[24] || (h[24] = e.createElementVNode(
                  "em",
                  null,
                  "%",
                  -1
                  /* CACHED */
                ))
              ]),
              e.createElementVNode("p", ym, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(k.$t("状态")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "span",
                  fm,
                  e.toDisplayString(e.unref(Fe).in_progress),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "small",
                  null,
                  e.toDisplayString(o.value.status === "not_started" ? k.$t("第一次更新进度后，任务从「未开始」变为「进行中」；做完了用「标记完成」") : k.$t("做完了用「标记完成」")),
                  1
                  /* TEXT */
                )
              ]),
              e.createElementVNode("label", Em, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(k.$t("说明")),
                  1
                  /* TEXT */
                ),
                e.withDirectives(e.createElementVNode("textarea", {
                  "onUpdate:modelValue": h[5] || (h[5] = (r) => c.note = r),
                  rows: "3",
                  placeholder: k.$t("这周做了什么、遇到什么问题"),
                  "data-test": "mm-progress-note"
                }, null, 8, Nm), [
                  [e.vModelText, c.note]
                ])
              ]),
              e.createElementVNode("div", Vm, [
                e.createElementVNode("button", {
                  type: "button",
                  class: "ss-btn primary sm",
                  disabled: i.value,
                  "data-test": "mm-progress-submit",
                  onClick: w
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
                    e.toDisplayString(k.$t("提交进度")),
                    1
                    /* TEXT */
                  )
                ], 8, $m),
                e.createElementVNode(
                  "button",
                  {
                    type: "button",
                    class: "ss-link",
                    onClick: h[6] || (h[6] = (r) => d.value = "")
                  },
                  e.toDisplayString(k.$t("取消")),
                  1
                  /* TEXT */
                )
              ])
            ])) : e.createCommentVNode("v-if", !0),
            d.value === "complete" ? (e.openBlock(), e.createElementBlock("section", hm, [
              e.createElementVNode(
                "h4",
                null,
                e.toDisplayString(k.$t("标记完成")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "p",
                bm,
                e.toDisplayString(k.$t("标记后通知任务负责人 {name}；完成后不能再改进度。", { name: o.value.ownerName })),
                1
                /* TEXT */
              ),
              e.createElementVNode("label", _m, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(k.$t("完成说明（可选）")),
                  1
                  /* TEXT */
                ),
                e.withDirectives(e.createElementVNode("textarea", {
                  "onUpdate:modelValue": h[7] || (h[7] = (r) => y.value = r),
                  rows: "3",
                  placeholder: k.$t("交付物放在哪里、和交付标准的对照")
                }, null, 8, Bm), [
                  [e.vModelText, y.value]
                ])
              ]),
              e.createElementVNode("div", Sm, [
                e.createElementVNode("button", {
                  type: "button",
                  class: "ss-btn primary sm",
                  disabled: i.value,
                  "data-test": "mm-complete-submit",
                  onClick: U
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
                    e.toDisplayString(k.$t("确认完成")),
                    1
                    /* TEXT */
                  )
                ], 8, Dm),
                e.createElementVNode(
                  "button",
                  {
                    type: "button",
                    class: "ss-link",
                    onClick: h[8] || (h[8] = (r) => d.value = "")
                  },
                  e.toDisplayString(k.$t("取消")),
                  1
                  /* TEXT */
                )
              ])
            ])) : e.createCommentVNode("v-if", !0),
            d.value === "raise" ? (e.openBlock(), e.createElementBlock("section", wm, [
              e.createElementVNode(
                "h4",
                null,
                e.toDisplayString(D.value),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "p",
                Cm,
                e.toDisplayString(k.$t("提交后由任务负责人 {name} 复核；处理期间任务照常计时，原截止日有效。", { name: o.value.ownerName })),
                1
                /* TEXT */
              ),
              e.createElementVNode("div", {
                class: "mm-td__radios",
                role: "radiogroup",
                "aria-label": k.$t("分歧点")
              }, [
                (e.openBlock(!0), e.createElementBlock(
                  e.Fragment,
                  null,
                  e.renderList(e.unref(tt), (r, H) => (e.openBlock(), e.createElementBlock(
                    "label",
                    {
                      key: H,
                      class: e.normalizeClass({ on: $.target === H })
                    },
                    [
                      e.withDirectives(e.createElementVNode("input", {
                        "onUpdate:modelValue": h[9] || (h[9] = (Q) => $.target = Q),
                        type: "radio",
                        value: H
                      }, null, 8, Im), [
                        [e.vModelRadio, $.target]
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
              ], 8, Tm),
              e.createElementVNode("label", Mm, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(k.$t("原因")),
                  1
                  /* TEXT */
                ),
                e.withDirectives(e.createElementVNode("textarea", {
                  "onUpdate:modelValue": h[10] || (h[10] = (r) => $.reason = r),
                  rows: "3",
                  placeholder: k.$t("为什么按原方案做不了"),
                  "data-test": "mm-raise-reason"
                }, null, 8, Am), [
                  [e.vModelText, $.reason]
                ])
              ]),
              e.createElementVNode("label", jm, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(k.$t("建议")),
                  1
                  /* TEXT */
                ),
                e.withDirectives(e.createElementVNode("textarea", {
                  "onUpdate:modelValue": h[11] || (h[11] = (r) => $.suggestion = r),
                  rows: "2",
                  placeholder: k.$t("你建议怎么调整"),
                  "data-test": "mm-raise-suggestion"
                }, null, 8, Lm), [
                  [e.vModelText, $.suggestion]
                ])
              ]),
              $.target === "time" ? (e.openBlock(), e.createElementBlock("label", zm, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(k.$t("建议的新截止日")),
                  1
                  /* TEXT */
                ),
                e.withDirectives(e.createElementVNode("input", {
                  "onUpdate:modelValue": h[12] || (h[12] = (r) => $.suggestedDue = r),
                  type: "date",
                  min: e.unref(Vl)(),
                  "data-test": "mm-raise-due"
                }, null, 8, Fm), [
                  [e.vModelText, $.suggestedDue]
                ])
              ])) : e.createCommentVNode("v-if", !0),
              e.createElementVNode("div", Pm, [
                e.createElementVNode("button", {
                  type: "button",
                  class: "ss-btn primary sm",
                  disabled: i.value || !$.reason.trim() || !$.suggestion.trim(),
                  "data-test": "mm-raise-submit",
                  onClick: G
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
                    e.toDisplayString(k.$t("提交")),
                    1
                    /* TEXT */
                  )
                ], 8, Um),
                e.createElementVNode(
                  "button",
                  {
                    type: "button",
                    class: "ss-link",
                    onClick: h[13] || (h[13] = (r) => d.value = "")
                  },
                  e.toDisplayString(k.$t("取消")),
                  1
                  /* TEXT */
                )
              ])
            ])) : e.createCommentVNode("v-if", !0)
          ]),
          P.value && !d.value ? (e.openBlock(), e.createElementBlock("footer", Om, [
            I.value.accept ? (e.openBlock(), e.createElementBlock("button", {
              key: 0,
              type: "button",
              class: "ss-btn primary",
              disabled: i.value,
              "data-test": "mm-task-accept",
              onClick: v
            }, [
              h[25] || (h[25] = e.createElementVNode(
                "i",
                { class: "ri-checkbox-circle-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(k.$t("接收任务")),
                1
                /* TEXT */
              )
            ], 8, Rm)) : e.createCommentVNode("v-if", !0),
            I.value.object ? (e.openBlock(), e.createElementBlock("button", {
              key: 1,
              type: "button",
              class: "ss-btn",
              disabled: i.value,
              "data-test": "mm-task-object",
              onClick: h[14] || (h[14] = (r) => R("raise"))
            }, [
              h[26] || (h[26] = e.createElementVNode(
                "i",
                { class: "ri-question-answer-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(k.$t("提出异议")),
                1
                /* TEXT */
              )
            ], 8, qm)) : e.createCommentVNode("v-if", !0),
            I.value.progress ? (e.openBlock(), e.createElementBlock("button", {
              key: 2,
              type: "button",
              class: "ss-btn primary",
              disabled: i.value,
              "data-test": "mm-task-progress",
              onClick: h[15] || (h[15] = (r) => R("progress"))
            }, [
              h[27] || (h[27] = e.createElementVNode(
                "i",
                { class: "ri-line-chart-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(k.$t("更新进度")),
                1
                /* TEXT */
              )
            ], 8, Km)) : e.createCommentVNode("v-if", !0),
            I.value.complete ? (e.openBlock(), e.createElementBlock("button", {
              key: 3,
              type: "button",
              class: "ss-btn",
              disabled: i.value,
              "data-test": "mm-task-complete",
              onClick: h[16] || (h[16] = (r) => R("complete"))
            }, [
              h[28] || (h[28] = e.createElementVNode(
                "i",
                { class: "ri-check-double-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(k.$t("标记完成")),
                1
                /* TEXT */
              )
            ], 8, Hm)) : e.createCommentVNode("v-if", !0),
            I.value.change ? (e.openBlock(), e.createElementBlock("button", {
              key: 4,
              type: "button",
              class: "ss-btn ghost",
              disabled: i.value,
              "data-test": "mm-task-change",
              onClick: h[17] || (h[17] = (r) => R("raise"))
            }, [
              h[29] || (h[29] = e.createElementVNode(
                "i",
                { class: "ri-edit-2-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(k.$t("申请变更")),
                1
                /* TEXT */
              )
            ], 8, Wm)) : e.createCommentVNode("v-if", !0)
          ])) : e.createCommentVNode("v-if", !0)
        ],
        64
        /* STABLE_FRAGMENT */
      )) : e.createCommentVNode("v-if", !0)
    ], 8, Zd));
  }
}), Ym = /* @__PURE__ */ le(Gm, [["__scopeId", "data-v-357019bd"]]), Jm = {
  class: "mm-tasks",
  "data-test": "mm-tasks-tab"
}, Qm = { class: "mm-pagehead" }, Zm = { class: "mm-search" }, Xm = ["placeholder", "aria-label"], xm = {
  key: 0,
  class: "mm-banner",
  "data-test": "mm-plan-banner"
}, eu = { class: "mm-banner__n" }, tu = { class: "mm-banner__text" }, lu = {
  key: 1,
  class: "ss-note danger"
}, nu = { class: "mm-tasks__main" }, au = { class: "mm-tasks__bar" }, ou = ["aria-label"], su = ["aria-selected", "title", "data-test", "onClick"], ru = { class: "mm-select" }, iu = { value: "status" }, cu = { value: "project" }, du = { value: "dept" }, mu = { class: "mm-select" }, uu = { value: "" }, pu = ["value"], vu = ["disabled", "aria-label", "title"], ku = /* @__PURE__ */ e.defineComponent({
  __name: "TasksTab",
  emits: ["role"],
  setup(l, { expose: p, emit: n }) {
    const u = [
      { key: "received", title: t.t("我接收的"), hint: t.t("下发给我的部门、由我接收和执行的任务") },
      { key: "assigned", title: t.t("我分派的"), hint: t.t("我作为任务负责人确认下发的任务") },
      { key: "all", title: t.t("全部任务"), hint: t.t("我参与的项目里的全部任务") }
    ], f = {
      received: t.t("没有下发给你的任务"),
      all: t.t("你参与的项目里还没有任务"),
      assigned: t.t("你还没有下发过任务")
    }, s = e.ref("all"), a = e.ref("status"), m = e.ref(""), i = e.ref(""), g = e.ref([]), b = e.ref([]), d = e.ref([]), c = e.ref(""), y = e.ref(0), $ = e.ref(!1), o = e.ref(""), I = n, F = e.computed(() => Nl(g.value, i.value)), P = e.computed(() => {
      const k = d.value[0];
      if (!k) return "";
      const h = [k.title, k.subtitle].filter(Boolean).join(" · ");
      return d.value.length > 1 ? t.t("{line} 等 {n} 份", { line: h, n: d.value.length }) : h;
    });
    let L = 0;
    async function D() {
      const k = ++L;
      $.value = !0;
      try {
        const h = await W("task.list", { view: s.value, projectId: m.value || void 0 });
        if (k !== L) return;
        g.value = Array.isArray(h) ? h : [], o.value = "";
      } catch (h) {
        k === L && (o.value = X.errorMessage(h));
      } finally {
        k === L && ($.value = !1);
      }
    }
    async function C() {
      const [k, h] = await Promise.allSettled([
        W("project.list", {}),
        W("home.get")
      ]);
      k.status === "fulfilled" && Array.isArray(k.value) && (b.value = k.value.map((r) => ({ id: r.id, name: r.name }))), h.status === "fulfilled" && (d.value = (h.value?.todos ?? []).filter((r) => r.type === "confirm_plan"));
    }
    async function z() {
      y.value += 1, await Promise.all([D(), C()]);
    }
    e.watch([s, m], () => {
      D();
    });
    function R(k) {
      Ke.value = k, I("role", k);
    }
    e.watch(c, (k) => {
      k || R("");
    });
    function _() {
      const k = ke.value;
      if (k.tab !== "tasks" || k.link?.kind !== "task") return;
      const h = k.link.id;
      c.value = h, i.value = "", !g.value.some((r) => r.id === h) && (s.value !== "all" || m.value) && (s.value = "all", m.value = "");
    }
    e.watch(() => ke.value.seq, _);
    let E = null, v = null, w = 0;
    function U() {
      E && clearTimeout(E), E = setTimeout(() => {
        E = null, w = Date.now(), z();
      }, 250);
    }
    function G() {
      E || Date.now() - w < 800 || U();
    }
    return p({ refresh: G }), e.onMounted(async () => {
      _(), w = Date.now(), await z(), _(), v = _e((k) => {
        k.type !== "changed" || !["all", "task", "meeting", "project", "org"].includes(k.scope) || U();
      });
    }), e.onBeforeUnmount(() => {
      v?.(), E && clearTimeout(E), Ke.value = "";
    }), (k, h) => (e.openBlock(), e.createElementBlock("div", Jm, [
      e.createElementVNode("header", Qm, [
        e.createElementVNode(
          "h2",
          null,
          e.toDisplayString(k.$t("任务")),
          1
          /* TEXT */
        ),
        e.createElementVNode(
          "p",
          null,
          e.toDisplayString(k.$t("会议决议拆出的任务，在这里接收、跟进、处理异议")),
          1
          /* TEXT */
        ),
        h[7] || (h[7] = e.createElementVNode(
          "span",
          { class: "grow" },
          null,
          -1
          /* CACHED */
        )),
        e.createElementVNode("label", Zm, [
          h[6] || (h[6] = e.createElementVNode(
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
            "onUpdate:modelValue": h[0] || (h[0] = (r) => i.value = r),
            type: "search",
            placeholder: k.$t("搜索任务"),
            "aria-label": k.$t("搜索任务"),
            "data-test": "mm-tasks-search"
          }, null, 8, Xm), [
            [e.vModelText, i.value]
          ])
        ])
      ]),
      d.value.length ? (e.openBlock(), e.createElementBlock("section", xm, [
        e.createElementVNode(
          "span",
          eu,
          e.toDisplayString(d.value.length),
          1
          /* TEXT */
        ),
        e.createElementVNode("div", tu, [
          e.createElementVNode(
            "strong",
            null,
            e.toDisplayString(k.$t("{n} 份执行方案待你确认", { n: d.value.length })),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "small",
            null,
            e.toDisplayString(P.value),
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
            onClick: h[1] || (h[1] = (r) => e.unref(de)(d.value[0].link))
          },
          e.toDisplayString(k.$t("去确认方案")),
          1
          /* TEXT */
        )
      ])) : e.createCommentVNode("v-if", !0),
      o.value ? (e.openBlock(), e.createElementBlock("p", lu, [
        h[8] || (h[8] = e.createElementVNode(
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
      e.createElementVNode(
        "section",
        {
          class: e.normalizeClass(["mm-tasks__card", { split: !!c.value }])
        },
        [
          e.createElementVNode("div", nu, [
            e.createElementVNode("div", au, [
              e.createElementVNode("div", {
                class: "mm-seg",
                role: "tablist",
                "aria-label": k.$t("任务视图")
              }, [
                (e.openBlock(), e.createElementBlock(
                  e.Fragment,
                  null,
                  e.renderList(u, (r) => e.createElementVNode("button", {
                    key: r.key,
                    type: "button",
                    role: "tab",
                    "aria-selected": s.value === r.key,
                    class: e.normalizeClass({ on: s.value === r.key }),
                    title: r.hint,
                    "data-test": `mm-tasks-view-${r.key}`,
                    onClick: (H) => s.value = r.key
                  }, e.toDisplayString(r.title), 11, su)),
                  64
                  /* STABLE_FRAGMENT */
                ))
              ], 8, ou),
              e.createElementVNode("label", ru, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(k.$t("分组：")),
                  1
                  /* TEXT */
                ),
                e.withDirectives(e.createElementVNode(
                  "select",
                  {
                    "onUpdate:modelValue": h[2] || (h[2] = (r) => a.value = r),
                    "data-test": "mm-tasks-groupby"
                  },
                  [
                    e.createElementVNode(
                      "option",
                      iu,
                      e.toDisplayString(k.$t("状态")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "option",
                      cu,
                      e.toDisplayString(k.$t("项目")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "option",
                      du,
                      e.toDisplayString(k.$t("部门")),
                      1
                      /* TEXT */
                    )
                  ],
                  512
                  /* NEED_PATCH */
                ), [
                  [e.vModelSelect, a.value]
                ]),
                h[9] || (h[9] = e.createElementVNode(
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
              e.createElementVNode("label", mu, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(k.$t("项目：")),
                  1
                  /* TEXT */
                ),
                e.withDirectives(e.createElementVNode(
                  "select",
                  {
                    "onUpdate:modelValue": h[3] || (h[3] = (r) => m.value = r),
                    "data-test": "mm-tasks-project"
                  },
                  [
                    e.createElementVNode(
                      "option",
                      uu,
                      e.toDisplayString(k.$t("全部")),
                      1
                      /* TEXT */
                    ),
                    (e.openBlock(!0), e.createElementBlock(
                      e.Fragment,
                      null,
                      e.renderList(b.value, (r) => (e.openBlock(), e.createElementBlock("option", {
                        key: r.id,
                        value: r.id
                      }, e.toDisplayString(r.name), 9, pu))),
                      128
                      /* KEYED_FRAGMENT */
                    ))
                  ],
                  512
                  /* NEED_PATCH */
                ), [
                  [e.vModelSelect, m.value]
                ]),
                h[10] || (h[10] = e.createElementVNode(
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
              h[11] || (h[11] = e.createElementVNode(
                "span",
                { class: "grow" },
                null,
                -1
                /* CACHED */
              )),
              e.createElementVNode("button", {
                type: "button",
                class: "mm-icon-btn",
                disabled: $.value,
                "aria-label": k.$t("刷新"),
                title: k.$t("刷新"),
                onClick: z
              }, [
                e.createElementVNode(
                  "i",
                  {
                    class: e.normalizeClass($.value ? "ri-loader-4-line spin" : "ri-refresh-line")
                  },
                  null,
                  2
                  /* CLASS */
                )
              ], 8, vu)
            ]),
            e.createVNode(zt, {
              tasks: F.value,
              "group-by": a.value,
              "selected-id": c.value,
              "empty-text": $.value ? k.$t("加载中…") : i.value ? k.$t("没有匹配「{q}」的任务", { q: i.value }) : f[s.value],
              onSelect: h[4] || (h[4] = (r) => c.value = r.id)
            }, null, 8, ["tasks", "group-by", "selected-id", "empty-text"])
          ]),
          c.value ? (e.openBlock(), e.createBlock(Ym, {
            key: c.value,
            "task-id": c.value,
            "refresh-seq": y.value,
            onClose: h[5] || (h[5] = (r) => c.value = ""),
            onChanged: z,
            onRole: R
          }, null, 8, ["task-id", "refresh-seq"])) : e.createCommentVNode("v-if", !0)
        ],
        2
        /* CLASS */
      )
    ]));
  }
}), gu = /* @__PURE__ */ le(ku, [["__scopeId", "data-v-3ff5a2d7"]]), yu = {
  class: "mm-rv",
  "data-test": "mm-report-view"
}, fu = { class: "mm-rv__head" }, Eu = { class: "mm-rv__meta" }, Nu = { key: 0 }, Vu = { key: 1 }, $u = {
  key: 2,
  class: "ok"
}, hu = ["aria-label"], bu = { key: 0 }, _u = { class: "mm-rv__hint" }, Bu = ["innerHTML"], Su = /* @__PURE__ */ e.defineComponent({
  __name: "ReportView",
  props: {
    report: {},
    approverName: {}
  },
  setup(l) {
    const p = l, n = e.computed(() => p.report.stats ?? { total: 0, done: 0, cancelled: 0, overdue: 0, onTime: 0, late: 0, completionRate: 0 }), u = e.computed(() => Ze.renderMarkdown(p.report.markdown || ""));
    return (f, s) => (e.openBlock(), e.createElementBlock("article", yu, [
      e.createElementVNode("header", fu, [
        e.createElementVNode("div", Eu, [
          e.createElementVNode(
            "strong",
            null,
            e.toDisplayString(l.report.kind === "summary" ? f.$t("项目总结报告") : f.$t("进度汇总报告")),
            1
            /* TEXT */
          ),
          l.report.periodFrom && l.report.periodTo ? (e.openBlock(), e.createElementBlock(
            "span",
            Nu,
            e.toDisplayString(f.$t("统计区间 {a} ~ {b}", { a: e.unref(lt)(l.report.periodFrom), b: e.unref(lt)(l.report.periodTo) })),
            1
            /* TEXT */
          )) : e.createCommentVNode("v-if", !0),
          e.createElementVNode(
            "span",
            null,
            e.toDisplayString(f.$t("生成于 {t}", { t: e.unref(ye)(l.report.generatedAt) })),
            1
            /* TEXT */
          ),
          l.report.editedAt ? (e.openBlock(), e.createElementBlock(
            "span",
            Vu,
            e.toDisplayString(f.$t("修改于 {t}", { t: e.unref(ye)(l.report.editedAt) })),
            1
            /* TEXT */
          )) : e.createCommentVNode("v-if", !0),
          l.report.approvedAt ? (e.openBlock(), e.createElementBlock(
            "span",
            $u,
            e.toDisplayString(f.$t("{who} 于 {t} 审核通过", { who: l.approverName || "—", t: e.unref(ye)(l.report.approvedAt) })),
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
              e.toDisplayString(e.unref(ge)(n.value.completionRate)) + "%",
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
          n.value.cancelled ? (e.openBlock(), e.createElementBlock("li", bu, [
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
        ], 8, hu),
        e.createElementVNode("p", _u, [
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
        innerHTML: u.value
      }, null, 8, Bu)
    ]));
  }
}), Ft = /* @__PURE__ */ le(Su, [["__scopeId", "data-v-776da457"]]), Du = {
  class: "mm-prp",
  "data-test": "mm-project-reports"
}, wu = { class: "mm-prp__bar" }, Cu = { class: "ss-muted" }, Tu = ["disabled"], Iu = {
  key: 0,
  class: "ss-note warn"
}, Mu = {
  key: 1,
  class: "ss-note danger"
}, Au = {
  key: 2,
  class: "ss-empty"
}, ju = {
  key: 3,
  class: "mm-prp__split"
}, Lu = ["aria-label"], zu = ["aria-selected", "data-test", "onClick"], Fu = /* @__PURE__ */ e.defineComponent({
  __name: "ProjectReports",
  props: {
    project: {},
    focusReportId: { default: "" },
    canGenerate: { type: Boolean, default: !1 }
  },
  emits: ["changed"],
  setup(l, { emit: p }) {
    const n = l, u = p, f = se.useNotificationStore(), s = e.ref(!1), a = e.ref(""), m = e.ref(0), i = e.ref(""), g = e.ref(null);
    let b = null;
    const d = e.computed(() => {
      const o = [...n.project.weeklyReports ?? []];
      return g.value && !o.some((I) => I.id === g.value.id) && o.push(g.value), o.sort((I, F) => F.generatedAt - I.generatedAt);
    }), c = e.computed(() => d.value.find((o) => o.id === i.value) ?? d.value[0] ?? null), y = e.computed(() => te.value?.settings.reportCycleDays ?? 7);
    e.watch(() => [n.project.id, n.focusReportId], () => {
      i.value = n.focusReportId && d.value.some((o) => o.id === n.focusReportId) ? n.focusReportId : "";
    }, { immediate: !0 }), e.watch(() => n.project.id, () => {
      g.value = null, a.value = "";
    });
    async function $() {
      s.value = !0, a.value = "", m.value = 0;
      const o = Date.now();
      b = setInterval(() => {
        m.value = Math.floor((Date.now() - o) / 1e3);
      }, 1e3);
      try {
        const I = await W("project.report.generate", { id: n.project.id });
        I?.id && (g.value = I, i.value = I.id), f.success(t.t("进度报告已生成")), u("changed");
      } catch (I) {
        a.value = X.errorMessage(I);
      } finally {
        s.value = !1, b && clearInterval(b), b = null;
      }
    }
    return e.onBeforeUnmount(() => {
      b && clearInterval(b);
    }), (o, I) => (e.openBlock(), e.createElementBlock("div", Du, [
      e.createElementVNode("div", wu, [
        e.createElementVNode(
          "p",
          Cu,
          e.toDisplayString(l.canGenerate ? o.$t("每 {n} 天自动生成一份进度汇总报告，发给任务负责人和项目负责人；项目负责人也可以现在手动生成一份。", { n: y.value }) : o.$t("每 {n} 天自动生成一份进度汇总报告，发给任务负责人和项目负责人。", { n: y.value })),
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
          onClick: $
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
            e.toDisplayString(s.value ? o.$t("生成中… {s} 秒", { s: m.value }) : o.$t("生成一份进度报告")),
            1
            /* TEXT */
          )
        ], 8, Tu)) : e.createCommentVNode("v-if", !0)
      ]),
      s.value && m.value > 60 ? (e.openBlock(), e.createElementBlock("p", Iu, [
        I[1] || (I[1] = e.createElementVNode(
          "i",
          { class: "ri-time-line" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(o.$t("比平时慢，模型还在写叙述；数字已由系统算好，模型不可用时会用模板兜底。")),
          1
          /* TEXT */
        )
      ])) : e.createCommentVNode("v-if", !0),
      a.value ? (e.openBlock(), e.createElementBlock("p", Mu, [
        I[2] || (I[2] = e.createElementVNode(
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
      d.value.length ? (e.openBlock(), e.createElementBlock("div", ju, [
        e.createElementVNode("ul", {
          class: "mm-prp__list",
          role: "listbox",
          "aria-label": o.$t("进度报告列表")
        }, [
          (e.openBlock(!0), e.createElementBlock(
            e.Fragment,
            null,
            e.renderList(d.value, (F) => (e.openBlock(), e.createElementBlock("li", {
              key: F.id
            }, [
              e.createElementVNode("button", {
                type: "button",
                role: "option",
                "aria-selected": F.id === i.value,
                class: e.normalizeClass({ on: F.id === i.value }),
                "data-test": `mm-report-${F.id}`,
                onClick: (P) => i.value = F.id
              }, [
                e.createElementVNode(
                  "strong",
                  null,
                  e.toDisplayString(F.periodFrom && F.periodTo ? `${e.unref(at)(F.periodFrom)} ~ ${e.unref(at)(F.periodTo)}` : e.unref(ye)(F.generatedAt)),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "small",
                  null,
                  e.toDisplayString(o.$t("完成率 {p}% · 逾期 {n}", { p: e.unref(ge)(F.stats?.completionRate), n: F.stats?.overdue ?? 0 })),
                  1
                  /* TEXT */
                )
              ], 10, zu)
            ]))),
            128
            /* KEYED_FRAGMENT */
          ))
        ], 8, Lu),
        c.value ? (e.openBlock(), e.createBlock(Ft, {
          key: 0,
          report: c.value
        }, null, 8, ["report"])) : e.createCommentVNode("v-if", !0)
      ])) : (e.openBlock(), e.createElementBlock(
        "p",
        Au,
        e.toDisplayString(o.$t("还没有进度报告")),
        1
        /* TEXT */
      ))
    ]));
  }
}), Pu = /* @__PURE__ */ le(Fu, [["__scopeId", "data-v-27c1c06c"]]), Uu = {
  class: "mm-psm",
  "data-test": "mm-project-summary"
}, Ou = {
  key: 0,
  class: "ss-note danger"
}, Ru = {
  key: 1,
  class: "ss-empty"
}, qu = {
  key: 0,
  class: "mm-psm__wait",
  "data-test": "mm-summary-waiting"
}, Ku = {
  key: 1,
  class: "mm-psm__wait failed",
  "data-test": "mm-summary-missing"
}, Hu = ["disabled"], Wu = {
  key: 0,
  class: "ss-note info"
}, Gu = {
  key: 1,
  class: "mm-psm__bar"
}, Yu = { class: "ss-muted" }, Ju = ["disabled"], Qu = ["disabled"], Zu = ["disabled"], Xu = { class: "ss-muted" }, xu = ["disabled"], ep = ["disabled"], tp = {
  key: 2,
  class: "ss-note info"
}, lp = {
  key: 3,
  class: "ss-note ok"
}, np = ["aria-label"], ap = /* @__PURE__ */ e.defineComponent({
  __name: "ProjectSummary",
  props: {
    project: {},
    can: {},
    members: { default: () => [] },
    generating: { type: Boolean, default: !1 },
    isOwner: { type: Boolean, default: !1 }
  },
  emits: ["changed"],
  setup(l, { emit: p }) {
    const n = l, u = p, f = Ne.useDialog(), s = se.useNotificationStore(), a = e.ref(!1), m = e.ref(""), i = e.ref(""), g = e.ref(!1), b = e.ref(""), d = e.ref(Date.now());
    let c = null;
    const y = e.computed(() => n.project.summary ?? null), $ = e.computed(() => n.members?.find((C) => C.id === y.value?.approvedBy)?.name || ""), o = e.computed(() => {
      const C = n.project.closeCheck?.at, z = C ? Math.max(0, Math.floor((d.value - C) / 1e3)) : 0;
      return C ? z > 300 ? t.t("已经 {m} 分钟了，比平时慢；可以点「重新生成」再试一次", { m: Math.floor(z / 60) }) : t.t("已用时 {s} 秒；生成完会自动显示在这里", { s: z }) : t.t("生成完会自动显示在这里");
    });
    e.watch(() => n.project.id, () => {
      g.value = !1, i.value = "";
    }), e.onMounted(() => {
      c = setInterval(() => {
        d.value = Date.now();
      }, 1e3);
    }), e.onBeforeUnmount(() => {
      c && clearInterval(c);
    });
    async function I(C, z, R, _) {
      a.value = !0, m.value = C, i.value = "";
      try {
        return await W(z, R), s.success(_), u("changed"), !0;
      } catch (E) {
        return i.value = X.errorMessage(E), !1;
      } finally {
        a.value = !1, m.value = "";
      }
    }
    function F() {
      b.value = y.value?.markdown ?? "", g.value = !0;
    }
    async function P() {
      await I("save", "project.summary.save", { id: n.project.id, markdown: b.value }, t.t("总结报告已保存")) && (g.value = !1);
    }
    async function L(C) {
      C && !await f.confirm({
        title: t.t("重新生成总结报告"),
        message: y.value?.editedAt ? t.t("重新生成会覆盖你在线修改过的内容，确定吗？") : t.t("按当前项目数据重新生成一份总结报告？"),
        danger: !!y.value?.editedAt
      }) || await I("regen", "project.summary.regenerate", { id: n.project.id }, t.t("总结报告已重新生成"));
    }
    async function D() {
      await f.confirm({
        title: t.t("审核通过并归档"),
        message: t.t("归档后项目全部只读、不能重新激活，并通知全部项目成员。确定审核通过吗？"),
        confirmLabel: t.t("通过并归档")
      }) && await I("approve", "project.summary.approve", { id: n.project.id }, t.t("项目已归档"));
    }
    return (C, z) => (e.openBlock(), e.createElementBlock("div", Uu, [
      i.value ? (e.openBlock(), e.createElementBlock("p", Ou, [
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
        Ru,
        e.toDisplayString(C.$t("项目还在进行中。项目负责人「发起结项」且检查通过后，AI 会在这里生成项目总结报告（概况、关键决策、任务按期 / 延期完成情况、变更与裁决记录），审核通过后归档。")),
        1
        /* TEXT */
      )) : y.value ? (e.openBlock(), e.createElementBlock(
        e.Fragment,
        { key: 3 },
        [
          l.generating ? (e.openBlock(), e.createElementBlock("p", Wu, [
            z[8] || (z[8] = e.createElementVNode(
              "i",
              { class: "ri-loader-4-line spin" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(C.$t("AI 正在重新生成总结报告，生成完会自动刷新")),
              1
              /* TEXT */
            )
          ])) : e.createCommentVNode("v-if", !0),
          l.project.status === "closing" && l.can.reviewSummary ? (e.openBlock(), e.createElementBlock("div", Gu, [
            g.value ? (e.openBlock(), e.createElementBlock(
              e.Fragment,
              { key: 1 },
              [
                e.createElementVNode(
                  "p",
                  Xu,
                  e.toDisplayString(C.$t("直接改 Markdown 正文；统计数字以系统计算为准，不随正文修改。")),
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
                  disabled: a.value,
                  onClick: z[2] || (z[2] = (R) => g.value = !1)
                }, e.toDisplayString(C.$t("取消")), 9, xu),
                e.createElementVNode("button", {
                  type: "button",
                  class: "ss-btn sm primary",
                  disabled: a.value || !b.value.trim(),
                  "data-test": "mm-summary-save",
                  onClick: P
                }, [
                  e.createElementVNode(
                    "i",
                    {
                      class: e.normalizeClass(a.value ? "ri-loader-4-line spin" : "ri-save-line")
                    },
                    null,
                    2
                    /* CLASS */
                  ),
                  e.createTextVNode(
                    e.toDisplayString(C.$t("保存修改")),
                    1
                    /* TEXT */
                  )
                ], 8, ep)
              ],
              64
              /* STABLE_FRAGMENT */
            )) : (e.openBlock(), e.createElementBlock(
              e.Fragment,
              { key: 0 },
              [
                e.createElementVNode(
                  "p",
                  Yu,
                  e.toDisplayString(C.$t("看一遍总结，需要的话在线修改；审核通过后项目归档，全部只读，并通知项目成员。")),
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
                  disabled: a.value || l.generating,
                  "data-test": "mm-summary-edit",
                  onClick: F
                }, [
                  z[9] || (z[9] = e.createElementVNode(
                    "i",
                    { class: "ri-edit-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(C.$t("在线修改")),
                    1
                    /* TEXT */
                  )
                ], 8, Ju),
                e.createElementVNode("button", {
                  type: "button",
                  class: "ss-btn sm",
                  disabled: a.value || l.generating,
                  "data-test": "mm-summary-regen",
                  onClick: z[1] || (z[1] = (R) => L(!0))
                }, [
                  e.createElementVNode(
                    "i",
                    {
                      class: e.normalizeClass(a.value && m.value === "regen" ? "ri-loader-4-line spin" : "ri-refresh-line")
                    },
                    null,
                    2
                    /* CLASS */
                  ),
                  e.createTextVNode(
                    e.toDisplayString(C.$t("重新生成")),
                    1
                    /* TEXT */
                  )
                ], 8, Qu),
                e.createElementVNode("button", {
                  type: "button",
                  class: "ss-btn sm primary",
                  disabled: a.value || l.generating,
                  "data-test": "mm-summary-approve",
                  onClick: D
                }, [
                  e.createElementVNode(
                    "i",
                    {
                      class: e.normalizeClass(a.value && m.value === "approve" ? "ri-loader-4-line spin" : "ri-checkbox-circle-line")
                    },
                    null,
                    2
                    /* CLASS */
                  ),
                  e.createTextVNode(
                    e.toDisplayString(C.$t("审核通过并归档")),
                    1
                    /* TEXT */
                  )
                ], 8, Zu)
              ],
              64
              /* STABLE_FRAGMENT */
            ))
          ])) : l.project.status === "closing" ? (e.openBlock(), e.createElementBlock("p", tp, [
            z[12] || (z[12] = e.createElementVNode(
              "i",
              { class: "ri-time-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(C.$t("总结报告待项目负责人审核，审核通过后项目归档。")),
              1
              /* TEXT */
            )
          ])) : l.project.status === "archived" ? (e.openBlock(), e.createElementBlock("p", lp, [
            z[13] || (z[13] = e.createElementVNode(
              "i",
              { class: "ri-archive-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(C.$t("项目已归档，全部内容只读。")),
              1
              /* TEXT */
            )
          ])) : e.createCommentVNode("v-if", !0),
          g.value ? e.withDirectives((e.openBlock(), e.createElementBlock("textarea", {
            key: 4,
            "onUpdate:modelValue": z[3] || (z[3] = (R) => b.value = R),
            class: "mm-psm__editor",
            rows: "24",
            "aria-label": C.$t("总结报告正文"),
            "data-test": "mm-summary-editor"
          }, null, 8, np)), [
            [e.vModelText, b.value]
          ]) : (e.openBlock(), e.createBlock(Ft, {
            key: 5,
            report: y.value,
            "approver-name": $.value
          }, null, 8, ["report", "approver-name"]))
        ],
        64
        /* STABLE_FRAGMENT */
      )) : (e.openBlock(), e.createElementBlock(
        e.Fragment,
        { key: 2 },
        [
          l.generating || a.value && m.value === "regen" ? (e.openBlock(), e.createElementBlock("div", qu, [
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
                e.toDisplayString(C.$t("AI 正在生成项目总结报告…")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "small",
                null,
                e.toDisplayString(o.value),
                1
                /* TEXT */
              )
            ])
          ])) : (e.openBlock(), e.createElementBlock("div", Ku, [
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
                e.toDisplayString(C.$t("总结报告还没有生成")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "small",
                null,
                e.toDisplayString(l.isOwner ? C.$t("上次生成可能没成功，点「重新生成」再试一次") : C.$t("等项目负责人重新生成")),
                1
                /* TEXT */
              )
            ]),
            l.isOwner ? (e.openBlock(), e.createElementBlock("button", {
              key: 0,
              type: "button",
              class: "ss-btn sm primary",
              disabled: a.value,
              "data-test": "mm-summary-regen-empty",
              onClick: z[0] || (z[0] = (R) => L(!1))
            }, [
              z[6] || (z[6] = e.createElementVNode(
                "i",
                { class: "ri-refresh-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(C.$t("重新生成")),
                1
                /* TEXT */
              )
            ], 8, Hu)) : e.createCommentVNode("v-if", !0)
          ]))
        ],
        64
        /* STABLE_FRAGMENT */
      ))
    ]));
  }
}), op = /* @__PURE__ */ le(ap, [["__scopeId", "data-v-a7ff6e93"]]), Pt = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/components/TModal.vue"];
if (!Pt) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/components/TModal.vue");
const ut = Pt.default, sp = { class: "mm-pp" }, rp = {
  key: 0,
  class: "mm-pp__chosen"
}, ip = ["aria-label", "onClick"], cp = { key: 1 }, dp = { class: "mm-pp__search" }, mp = ["placeholder"], up = ["aria-multiselectable"], pp = { class: "mm-pp__dept" }, vp = ["aria-selected", "disabled", "data-test", "onClick"], kp = { key: 0 }, gp = {
  key: 1,
  class: "ri-check-line",
  "aria-hidden": "true"
}, yp = {
  key: 0,
  class: "mm-pp__empty"
}, fp = /* @__PURE__ */ e.defineComponent({
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
  setup(l, { emit: p }) {
    const n = l, u = p, f = e.ref(""), s = e.computed(() => {
      const c = n.modelValue;
      return Array.isArray(c) ? c : c ? [c] : [];
    }), a = (c) => s.value.includes(c), m = (c) => n.depts.find((y) => y.id === c)?.name || "", i = e.computed(() => n.people.filter((c) => !c.left)), g = e.computed(() => s.value.map((c) => n.people.find((y) => y.id === c)).filter((c) => !!c)), b = e.computed(() => {
      const c = [], y = /* @__PURE__ */ new Map();
      for (const $ of i.value) {
        if (!mt($, m($.deptId), f.value)) continue;
        const o = y.get($.deptId) ?? [];
        o.push($), y.set($.deptId, o);
      }
      for (const $ of n.depts) {
        const o = y.get($.id);
        o?.length && c.push({ id: $.id, name: $.name, people: o }), y.delete($.id);
      }
      for (const [$, o] of y) c.push({ id: $, name: m($) || "—", people: o });
      return c;
    });
    function d(c) {
      if (!n.multiple) {
        u("update:modelValue", c);
        return;
      }
      if (a(c)) {
        if (n.locked?.includes(c)) return;
        u("update:modelValue", s.value.filter((y) => y !== c));
      } else
        u("update:modelValue", [...s.value, c]);
    }
    return (c, y) => (e.openBlock(), e.createElementBlock("div", sp, [
      l.multiple && g.value.length ? (e.openBlock(), e.createElementBlock("div", rp, [
        (e.openBlock(!0), e.createElementBlock(
          e.Fragment,
          null,
          e.renderList(g.value, ($) => (e.openBlock(), e.createElementBlock("span", {
            key: $.id,
            class: "mm-pp__chip"
          }, [
            e.createElementVNode(
              "i",
              {
                style: e.normalizeStyle({ background: e.unref(oe)($.name).color }),
                "aria-hidden": "true"
              },
              e.toDisplayString(e.unref(oe)($.name).text),
              5
              /* TEXT, STYLE */
            ),
            e.createTextVNode(
              e.toDisplayString($.name) + " ",
              1
              /* TEXT */
            ),
            l.locked?.includes($.id) ? (e.openBlock(), e.createElementBlock(
              "em",
              cp,
              e.toDisplayString(l.lockedHint || ""),
              1
              /* TEXT */
            )) : (e.openBlock(), e.createElementBlock("button", {
              key: 0,
              type: "button",
              "aria-label": c.$t("移除 {name}", { name: $.name }),
              onClick: (o) => d($.id)
            }, [...y[1] || (y[1] = [
              e.createElementVNode(
                "i",
                { class: "ri-close-line" },
                null,
                -1
                /* CACHED */
              )
            ])], 8, ip))
          ]))),
          128
          /* KEYED_FRAGMENT */
        ))
      ])) : e.createCommentVNode("v-if", !0),
      e.createElementVNode("div", dp, [
        y[2] || (y[2] = e.createElementVNode(
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
          "onUpdate:modelValue": y[0] || (y[0] = ($) => f.value = $),
          type: "search",
          placeholder: c.$t("搜索姓名、部门")
        }, null, 8, mp), [
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
          e.renderList(b.value, ($) => (e.openBlock(), e.createElementBlock("li", {
            key: $.id
          }, [
            e.createElementVNode(
              "p",
              pp,
              e.toDisplayString($.name),
              1
              /* TEXT */
            ),
            (e.openBlock(!0), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList($.people, (o) => (e.openBlock(), e.createElementBlock("button", {
                key: o.id,
                type: "button",
                role: "option",
                class: e.normalizeClass(["mm-pp__opt", { on: a(o.id) }]),
                "aria-selected": a(o.id),
                disabled: l.locked?.includes(o.id) && a(o.id),
                "data-test": `mm-pp-${o.id}`,
                onClick: (I) => d(o.id)
              }, [
                e.createElementVNode(
                  "i",
                  {
                    style: e.normalizeStyle({ background: e.unref(oe)(o.name).color }),
                    "aria-hidden": "true"
                  },
                  e.toDisplayString(e.unref(oe)(o.name).text),
                  5
                  /* TEXT, STYLE */
                ),
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(o.name),
                  1
                  /* TEXT */
                ),
                o.title ? (e.openBlock(), e.createElementBlock(
                  "small",
                  kp,
                  e.toDisplayString(o.title),
                  1
                  /* TEXT */
                )) : e.createCommentVNode("v-if", !0),
                a(o.id) ? (e.openBlock(), e.createElementBlock("b", gp)) : e.createCommentVNode("v-if", !0)
              ], 10, vp))),
              128
              /* KEYED_FRAGMENT */
            ))
          ]))),
          128
          /* KEYED_FRAGMENT */
        )),
        b.value.length ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock(
          "li",
          yp,
          e.toDisplayString(c.$t("没有匹配的人员")),
          1
          /* TEXT */
        ))
      ], 12, up)
    ]));
  }
}), je = /* @__PURE__ */ le(fp, [["__scopeId", "data-v-60f28bb6"]]), Ep = {
  class: "mm-pmd",
  "data-test": "mm-project-members"
}, Np = { class: "ss-muted" }, Vp = {
  key: 0,
  class: "ss-muted"
}, $p = {
  key: 1,
  class: "ss-note danger",
  "data-test": "mm-pm-error"
}, hp = ["disabled"], bp = /* @__PURE__ */ e.defineComponent({
  __name: "ProjectMembersDialog",
  props: {
    open: { type: Boolean },
    projectId: {},
    ownerId: {},
    memberIds: {},
    members: {}
  },
  emits: ["close", "saved"],
  setup(l, { emit: p }) {
    const n = l, u = p, f = e.ref([]), s = e.ref([]), a = e.ref([]), m = e.ref(!1), i = e.ref(""), g = e.computed(() => a.value.length !== n.memberIds.length || a.value.some((c) => !n.memberIds.includes(c))), b = e.computed(() => n.memberIds.filter((c) => !a.value.includes(c)).map((c) => f.value.find((y) => y.id === c)?.name || n.members?.find((y) => y.id === c)?.name || c));
    e.watch(() => n.open, async (c) => {
      if (c) {
        a.value = [...n.memberIds], i.value = "";
        try {
          const y = await W("people.list"), $ = (n.members ?? []).filter((o) => !(y?.people ?? []).some((I) => I.id === o.id)).map((o) => ({ ...o, left: !1 }));
          f.value = [...y?.people ?? [], ...$], s.value = y?.depts ?? [];
        } catch (y) {
          i.value = X.errorMessage(y);
        }
      }
    }, { immediate: !0 });
    async function d() {
      m.value = !0, i.value = "";
      try {
        const c = [.../* @__PURE__ */ new Set([n.ownerId, ...a.value])], y = await W("project.members", { id: n.projectId, memberIds: c });
        u("saved", y);
      } catch (c) {
        i.value = X.errorMessage(c);
      } finally {
        m.value = !1;
      }
    }
    return (c, y) => (e.openBlock(), e.createBlock(ut, {
      open: l.open,
      title: c.$t("编辑成员"),
      icon: "ri-team-line",
      size: "md",
      onClose: y[2] || (y[2] = ($) => u("close"))
    }, {
      footer: e.withCtx(() => [
        e.createElementVNode(
          "button",
          {
            type: "button",
            class: "ss-btn",
            onClick: y[1] || (y[1] = ($) => u("close"))
          },
          e.toDisplayString(c.$t("取消")),
          1
          /* TEXT */
        ),
        e.createElementVNode("button", {
          type: "button",
          class: "ss-btn primary",
          disabled: m.value || !g.value,
          "data-test": "mm-pm-save",
          onClick: d
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
            e.toDisplayString(c.$t("保存")),
            1
            /* TEXT */
          )
        ], 8, hp)
      ]),
      default: e.withCtx(() => [
        e.createElementVNode("div", Ep, [
          e.createElementVNode(
            "p",
            Np,
            e.toDisplayString(c.$t("项目负责人不能移除；成员还有未完成的待办或任务时也不能移除。")),
            1
            /* TEXT */
          ),
          e.createVNode(je, {
            modelValue: a.value,
            "onUpdate:modelValue": y[0] || (y[0] = ($) => a.value = $),
            people: f.value,
            depts: s.value,
            locked: [l.ownerId],
            "locked-hint": c.$t("负责人"),
            "max-height": 300
          }, null, 8, ["modelValue", "people", "depts", "locked", "locked-hint"]),
          b.value.length ? (e.openBlock(), e.createElementBlock(
            "p",
            Vp,
            e.toDisplayString(c.$t("将移除：{names}", { names: b.value.join(c.$t("、")) })),
            1
            /* TEXT */
          )) : e.createCommentVNode("v-if", !0),
          i.value ? (e.openBlock(), e.createElementBlock("p", $p, [
            y[3] || (y[3] = e.createElementVNode(
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
}), _p = /* @__PURE__ */ le(bp, [["__scopeId", "data-v-a1802897"]]), Bp = {
  class: "mm-pd",
  "data-test": "mm-project-detail"
}, Sp = {
  key: 0,
  class: "mm-pd__loading"
}, Dp = {
  key: 1,
  class: "ss-note danger"
}, wp = { class: "mm-pd__head" }, Cp = { class: "mm-pd__titlerow" }, Tp = ["aria-label"], Ip = ["aria-current"], Mp = ["aria-label", "aria-expanded"], Ap = {
  key: 0,
  class: "mm-more__menu",
  role: "menu"
}, jp = ["disabled"], Lp = ["disabled"], zp = { class: "mm-pd__meta" }, Fp = {
  key: 0,
  class: "mm-pd__desc"
}, Pp = {
  key: 1,
  class: "mm-pd__fail",
  "data-test": "mm-close-fail"
}, Up = ["aria-label"], Op = { class: "ss-muted" }, Rp = { class: "mm-block-list" }, qp = { class: "t" }, Kp = ["onClick"], Hp = {
  class: "mm-pd__stats",
  "data-test": "mm-project-stats"
}, Wp = { class: "brand" }, Gp = {
  class: "mm-pd__tabs",
  role: "tablist"
}, Yp = ["aria-selected", "data-test", "onClick"], Jp = { key: 0 }, Qp = {
  key: 2,
  class: "mm-pd__ov"
}, Zp = { class: "mm-pd__ovl" }, Xp = {
  key: 0,
  class: "mm-pd__blockers",
  "data-test": "mm-close-blockers"
}, xp = { class: "mm-block-list" }, ev = ["title"], tv = { key: 0 }, lv = ["data-test", "onClick"], nv = {
  key: 1,
  class: "ss-note ok"
}, av = { class: "mm-pd__depts" }, ov = {
  key: 0,
  class: "ss-muted"
}, sv = { key: 1 }, rv = { class: "n" }, iv = { class: "mm-bar wide" }, cv = { class: "v" }, dv = { class: "mm-pd__ovr" }, mv = { class: "mm-pd__decisions" }, uv = {
  key: 0,
  class: "ss-muted"
}, pv = {
  key: 1,
  class: "mm-tl"
}, vv = ["onClick"], kv = { class: "mm-pd__members" }, gv = { class: "mm-avs" }, yv = ["title", "aria-label"], fv = { class: "mm-pd__list" }, Ev = { class: "mm-pd__listbar" }, Nv = { class: "ss-muted" }, Vv = {
  key: 0,
  class: "ss-empty"
}, $v = ["data-test", "onClick"], hv = { class: "t" }, bv = {
  key: 0,
  class: "mm-tag warn"
}, _v = { class: "mm-pd__list" }, Bv = /* @__PURE__ */ e.defineComponent({
  __name: "ProjectDetail",
  props: {
    projectId: {},
    refreshSeq: { default: 0 },
    focus: { default: null }
  },
  emits: ["changed", "role"],
  setup(l, { emit: p }) {
    const n = l, u = p, f = Ne.useDialog(), s = se.useNotificationStore(), a = e.ref(null), m = e.ref(!1), i = e.ref(!1), g = e.ref(""), b = e.ref("overview"), d = e.ref(""), c = e.ref(null), y = e.ref(!1), $ = e.ref(!1), o = e.ref(!1), I = e.ref(null), F = e.computed(() => a.value?.project ?? null), P = e.computed(() => F.value ? Tl(F.value.status) : 0), L = e.computed(() => Vt(a.value?.closeBlockers)), D = e.computed(() => !!F.value && F.value.ownerId === te.value?.me.person?.id), C = e.computed(() => [
      { key: "overview", title: t.t("概览"), count: void 0 },
      { key: "meetings", title: t.t("会议"), count: a.value?.meetings.length ?? 0 },
      { key: "tasks", title: t.t("任务"), count: a.value?.tasks.length ?? 0 },
      { key: "reports", title: t.t("进度报告"), count: F.value?.weeklyReports?.length ?? 0 },
      { key: "summary", title: t.t("总结报告"), count: void 0 }
    ]);
    function z(k) {
      return k === "failed" ? "bad" : k === "dispatched" || k === "ended" ? "ok" : k === "processing" ? "brand" : "warn";
    }
    let R = 0;
    async function _() {
      if (!n.projectId) return;
      const k = ++R;
      m.value = !0;
      try {
        const h = await W("project.get", { id: n.projectId });
        if (k !== R) return;
        a.value = h, u("role", Cl(h.project, te.value?.me.person?.id)), g.value = "";
      } catch (h) {
        k === R && (g.value = X.errorMessage(h));
      } finally {
        k === R && (m.value = !1);
      }
    }
    e.watch(() => n.projectId, () => {
      a.value = null, c.value = null, y.value = !1, b.value = "overview", _();
    }, { immediate: !0 }), e.watch(() => n.refreshSeq, () => {
      _();
    }), e.watch(() => n.focus?.seq, () => {
      n.focus && (b.value = n.focus.tab, d.value = n.focus.reportId || "");
    }, { immediate: !0 });
    async function E() {
      if (!(!F.value || !await f.confirm({
        title: t.t("发起结项"),
        message: t.t("先检查：所有会议已派发或已结束、所有任务已完成或已取消、没有处理中的异议。通过后项目进入「结项中」，不能再新建会议和任务，也不能撤回；AI 随后生成总结报告交你审核。"),
        confirmLabel: t.t("检查并结项")
      }))) {
        i.value = !0, g.value = "";
        try {
          const h = await W("project.close", { id: F.value.id });
          h?.ok ? (c.value = null, s.success(t.t("结项检查通过，项目进入结项中，AI 正在生成总结报告")), b.value = "summary") : c.value = Vt(h?.items), await _(), u("changed");
        } catch (h) {
          g.value = X.errorMessage(h);
        } finally {
          i.value = !1;
        }
      }
    }
    async function v() {
      await _(), u("changed");
    }
    async function w() {
      $.value = !1, s.success(t.t("成员已更新")), await _(), u("changed");
    }
    function U(k) {
      o.value = !1, u("changed"), k && de({ kind: "meeting", id: k });
    }
    function G(k) {
      y.value && I.value && !I.value.contains(k.target) && (y.value = !1);
    }
    return e.onMounted(() => document.addEventListener("click", G)), e.onBeforeUnmount(() => document.removeEventListener("click", G)), (k, h) => (e.openBlock(), e.createElementBlock("section", Bp, [
      m.value && !a.value ? (e.openBlock(), e.createElementBlock("p", Sp, [
        h[8] || (h[8] = e.createElementVNode(
          "i",
          { class: "ri-loader-4-line spin" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(k.$t("加载中…")),
          1
          /* TEXT */
        )
      ])) : e.createCommentVNode("v-if", !0),
      g.value ? (e.openBlock(), e.createElementBlock("p", Dp, [
        h[9] || (h[9] = e.createElementVNode(
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
      ])) : e.createCommentVNode("v-if", !0),
      a.value && F.value ? (e.openBlock(), e.createElementBlock(
        e.Fragment,
        { key: 2 },
        [
          e.createCommentVNode(" 顶部：名称 + 状态 + 进度条（sticky，滚动时始终可见） "),
          e.createElementVNode("header", wp, [
            e.createElementVNode("div", Cp, [
              e.createElementVNode(
                "h3",
                null,
                e.toDisplayString(F.value.name),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "span",
                {
                  class: e.normalizeClass(["mm-tag", e.unref(Il)(F.value.status)]),
                  "data-test": "mm-project-status"
                },
                e.toDisplayString(e.unref(He)[F.value.status]),
                3
                /* TEXT, CLASS */
              ),
              h[14] || (h[14] = e.createElementVNode(
                "span",
                { class: "grow" },
                null,
                -1
                /* CACHED */
              )),
              e.createElementVNode("ol", {
                class: "mm-steps",
                "aria-label": k.$t("项目状态")
              }, [
                (e.openBlock(!0), e.createElementBlock(
                  e.Fragment,
                  null,
                  e.renderList(e.unref(Mt), (r, H) => (e.openBlock(), e.createElementBlock(
                    e.Fragment,
                    { key: r },
                    [
                      H > 0 ? (e.openBlock(), e.createElementBlock(
                        "li",
                        {
                          key: 0,
                          class: e.normalizeClass(["mm-steps__line", { done: H <= P.value }]),
                          "aria-hidden": "true"
                        },
                        null,
                        2
                        /* CLASS */
                      )) : e.createCommentVNode("v-if", !0),
                      e.createElementVNode("li", {
                        class: e.normalizeClass(["mm-steps__step", { done: H < P.value, on: H === P.value }]),
                        "aria-current": H === P.value ? "step" : void 0
                      }, [
                        h[10] || (h[10] = e.createElementVNode(
                          "i",
                          { "aria-hidden": "true" },
                          null,
                          -1
                          /* CACHED */
                        )),
                        e.createTextVNode(
                          e.toDisplayString(e.unref(He)[r]),
                          1
                          /* TEXT */
                        )
                      ], 10, Ip)
                    ],
                    64
                    /* STABLE_FRAGMENT */
                  ))),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ], 8, Tp),
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
                    "aria-label": k.$t("更多"),
                    "aria-expanded": y.value,
                    "data-test": "mm-project-more",
                    onClick: h[0] || (h[0] = e.withModifiers((r) => y.value = !y.value, ["stop"]))
                  }, [...h[11] || (h[11] = [
                    e.createElementVNode(
                      "i",
                      { class: "ri-more-fill" },
                      null,
                      -1
                      /* CACHED */
                    )
                  ])], 8, Mp),
                  y.value ? (e.openBlock(), e.createElementBlock("div", Ap, [
                    e.createElementVNode("button", {
                      type: "button",
                      role: "menuitem",
                      disabled: !a.value.can.editMembers,
                      "data-test": "mm-project-edit-members",
                      onClick: h[1] || (h[1] = (r) => {
                        y.value = !1, $.value = !0;
                      })
                    }, [
                      h[12] || (h[12] = e.createElementVNode(
                        "i",
                        { class: "ri-team-line" },
                        null,
                        -1
                        /* CACHED */
                      )),
                      e.createTextVNode(
                        e.toDisplayString(k.$t("编辑成员")),
                        1
                        /* TEXT */
                      )
                    ], 8, jp),
                    e.createElementVNode("button", {
                      type: "button",
                      role: "menuitem",
                      onClick: h[2] || (h[2] = (r) => {
                        y.value = !1, _();
                      })
                    }, [
                      h[13] || (h[13] = e.createElementVNode(
                        "i",
                        { class: "ri-refresh-line" },
                        null,
                        -1
                        /* CACHED */
                      )),
                      e.createTextVNode(
                        e.toDisplayString(k.$t("刷新")),
                        1
                        /* TEXT */
                      )
                    ])
                  ])) : e.createCommentVNode("v-if", !0)
                ],
                512
                /* NEED_PATCH */
              ),
              a.value.can.close && F.value.status === "active" ? (e.openBlock(), e.createElementBlock("button", {
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
                  e.toDisplayString(k.$t("发起结项")),
                  1
                  /* TEXT */
                )
              ], 8, Lp)) : e.createCommentVNode("v-if", !0)
            ]),
            e.createElementVNode(
              "p",
              zp,
              e.toDisplayString(k.$t("负责人 {owner} · {n} 位成员 · {date} 创建", { owner: a.value.ownerName, n: a.value.members.length, date: e.unref(lt)(F.value.createdAt) })),
              1
              /* TEXT */
            )
          ]),
          F.value.desc ? (e.openBlock(), e.createElementBlock(
            "p",
            Fp,
            e.toDisplayString(F.value.desc),
            1
            /* TEXT */
          )) : e.createCommentVNode("v-if", !0),
          e.createCommentVNode(" 结项检查不通过：列出未完成事项 "),
          c.value ? (e.openBlock(), e.createElementBlock("section", Pp, [
            e.createElementVNode("header", null, [
              e.createElementVNode(
                "strong",
                null,
                e.toDisplayString(k.$t("结项检查未通过，还有 {n} 项未完成", { n: c.value.length })),
                1
                /* TEXT */
              ),
              e.createElementVNode("button", {
                type: "button",
                class: "mm-x",
                "aria-label": k.$t("关闭"),
                onClick: h[3] || (h[3] = (r) => c.value = null)
              }, [...h[15] || (h[15] = [
                e.createElementVNode(
                  "i",
                  { class: "ri-close-line" },
                  null,
                  -1
                  /* CACHED */
                )
              ])], 8, Up)
            ]),
            e.createElementVNode(
              "p",
              Op,
              e.toDisplayString(k.$t("结项要求：所有会议已派发或已结束、所有任务已完成或已取消、没有处理中的异议。")),
              1
              /* TEXT */
            ),
            e.createElementVNode("ul", Rp, [
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(c.value, (r) => (e.openBlock(), e.createElementBlock("li", {
                  key: `${r.kind}-${r.id}`
                }, [
                  e.createElementVNode(
                    "span",
                    {
                      class: e.normalizeClass(["mm-tag", e.unref(be)(r, a.value.tasks, { canArbitrate: !!a.value.can.close }).tone])
                    },
                    e.toDisplayString(e.unref(be)(r, a.value.tasks, { canArbitrate: !!a.value.can.close }).chip),
                    3
                    /* TEXT, CLASS */
                  ),
                  e.createElementVNode("span", qp, [
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
                    onClick: (H) => e.unref(de)(e.unref(be)(r, a.value.tasks, { canArbitrate: !!a.value.can.close }).link)
                  }, [
                    e.createTextVNode(
                      e.toDisplayString(e.unref(be)(r, a.value.tasks, { canArbitrate: !!a.value.can.close }).action) + " ",
                      1
                      /* TEXT */
                    ),
                    h[16] || (h[16] = e.createElementVNode(
                      "i",
                      { class: "ri-arrow-right-s-line" },
                      null,
                      -1
                      /* CACHED */
                    ))
                  ], 8, Kp)
                ]))),
                128
                /* KEYED_FRAGMENT */
              ))
            ])
          ])) : e.createCommentVNode("v-if", !0),
          e.createCommentVNode(" 5 个统计 "),
          e.createElementVNode("ul", Hp, [
            e.createElementVNode("li", null, [
              e.createElementVNode(
                "b",
                null,
                e.toDisplayString(k.$t("{n} 场", { n: a.value.stats.meetings })),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "small",
                null,
                e.toDisplayString(k.$t("会议")),
                1
                /* TEXT */
              )
            ]),
            e.createElementVNode("li", null, [
              e.createElementVNode(
                "b",
                null,
                e.toDisplayString(a.value.stats.done) + " / " + e.toDisplayString(a.value.stats.total),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "small",
                null,
                e.toDisplayString(k.$t("任务完成")),
                1
                /* TEXT */
              )
            ]),
            e.createElementVNode(
              "li",
              {
                class: e.normalizeClass({ bad: a.value.stats.overdue > 0 })
              },
              [
                e.createElementVNode(
                  "b",
                  null,
                  e.toDisplayString(a.value.stats.overdue),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "small",
                  null,
                  e.toDisplayString(k.$t("逾期任务")),
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
                class: e.normalizeClass({ warn: a.value.stats.objections > 0 })
              },
              [
                e.createElementVNode(
                  "b",
                  null,
                  e.toDisplayString(a.value.stats.objections),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "small",
                  null,
                  e.toDisplayString(k.$t("处理中异议")),
                  1
                  /* TEXT */
                )
              ],
              2
              /* CLASS */
            ),
            e.createElementVNode("li", Wp, [
              e.createElementVNode(
                "b",
                null,
                e.toDisplayString(e.unref(ge)(a.value.stats.weekRate)) + "%",
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "small",
                null,
                e.toDisplayString(k.$t("本周完成率")),
                1
                /* TEXT */
              )
            ])
          ]),
          e.createElementVNode("nav", Gp, [
            (e.openBlock(!0), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(C.value, (r) => (e.openBlock(), e.createElementBlock("button", {
                key: r.key,
                type: "button",
                role: "tab",
                "aria-selected": b.value === r.key,
                class: e.normalizeClass({ on: b.value === r.key }),
                "data-test": `mm-pd-tab-${r.key}`,
                onClick: (H) => b.value = r.key
              }, [
                e.createTextVNode(
                  e.toDisplayString(r.title),
                  1
                  /* TEXT */
                ),
                r.count !== void 0 ? (e.openBlock(), e.createElementBlock(
                  "em",
                  Jp,
                  e.toDisplayString(r.count),
                  1
                  /* TEXT */
                )) : e.createCommentVNode("v-if", !0)
              ], 10, Yp))),
              128
              /* KEYED_FRAGMENT */
            ))
          ]),
          e.createCommentVNode(" 概览 "),
          b.value === "overview" ? (e.openBlock(), e.createElementBlock("div", Qp, [
            e.createElementVNode("div", Zp, [
              F.value.status === "active" && L.value.length ? (e.openBlock(), e.createElementBlock("section", Xp, [
                e.createElementVNode(
                  "h4",
                  null,
                  e.toDisplayString(k.$t("结项前需处理 · {n} 项", { n: L.value.length })),
                  1
                  /* TEXT */
                ),
                e.createElementVNode("ul", xp, [
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(L.value, (r) => (e.openBlock(), e.createElementBlock("li", {
                      key: `${r.kind}-${r.id}`
                    }, [
                      e.createElementVNode(
                        "span",
                        {
                          class: e.normalizeClass(["mm-tag", e.unref(be)(r, a.value.tasks, { canArbitrate: !!a.value.can.close }).tone])
                        },
                        e.toDisplayString(e.unref(be)(r, a.value.tasks, { canArbitrate: !!a.value.can.close }).chip),
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
                          tv,
                          " · " + e.toDisplayString(r.reason),
                          1
                          /* TEXT */
                        )) : e.createCommentVNode("v-if", !0)
                      ], 8, ev),
                      e.createElementVNode("button", {
                        type: "button",
                        class: "ss-link",
                        "data-test": `mm-blocker-${r.id}`,
                        onClick: (H) => e.unref(de)(e.unref(be)(r, a.value.tasks, { canArbitrate: !!a.value.can.close }).link)
                      }, [
                        e.createTextVNode(
                          e.toDisplayString(e.unref(be)(r, a.value.tasks, { canArbitrate: !!a.value.can.close }).action) + " ",
                          1
                          /* TEXT */
                        ),
                        h[17] || (h[17] = e.createElementVNode(
                          "i",
                          { class: "ri-arrow-right-s-line" },
                          null,
                          -1
                          /* CACHED */
                        ))
                      ], 8, lv)
                    ]))),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ])
              ])) : F.value.status === "active" ? (e.openBlock(), e.createElementBlock("p", nv, [
                h[18] || (h[18] = e.createElementVNode(
                  "i",
                  { class: "ri-checkbox-circle-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(k.$t("会议、任务都已收尾，没有处理中的异议，可以发起结项。")),
                  1
                  /* TEXT */
                )
              ])) : e.createCommentVNode("v-if", !0),
              e.createElementVNode("section", av, [
                e.createElementVNode(
                  "h4",
                  null,
                  e.toDisplayString(k.$t("各部门任务进度")),
                  1
                  /* TEXT */
                ),
                a.value.deptProgress.length ? (e.openBlock(), e.createElementBlock("ul", sv, [
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(a.value.deptProgress, (r) => (e.openBlock(), e.createElementBlock("li", {
                      key: r.deptId
                    }, [
                      e.createElementVNode(
                        "span",
                        rv,
                        e.toDisplayString(r.name),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode("i", iv, [
                        e.createElementVNode(
                          "b",
                          {
                            style: e.normalizeStyle({ width: `${e.unref(dt)(r.done, r.total)}%` })
                          },
                          null,
                          4
                          /* STYLE */
                        )
                      ]),
                      e.createElementVNode(
                        "span",
                        cv,
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
                  ov,
                  e.toDisplayString(k.$t("还没有任务")),
                  1
                  /* TEXT */
                ))
              ])
            ]),
            e.createElementVNode("div", dv, [
              e.createElementVNode("section", mv, [
                e.createElementVNode("h4", null, [
                  e.createTextVNode(
                    e.toDisplayString(k.$t("关键决策")) + " ",
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "small",
                    null,
                    e.toDisplayString(k.$t("来自会议纪要")),
                    1
                    /* TEXT */
                  )
                ]),
                a.value.decisions.length ? (e.openBlock(), e.createElementBlock("ol", pv, [
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(a.value.decisions, (r, H) => (e.openBlock(), e.createElementBlock("li", { key: H }, [
                      h[20] || (h[20] = e.createElementVNode(
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
                            e.toDisplayString(e.unref(at)(r.at)),
                            1
                            /* TEXT */
                          ),
                          r.meetingTitle ? (e.openBlock(), e.createElementBlock(
                            e.Fragment,
                            { key: 0 },
                            [
                              h[19] || (h[19] = e.createTextVNode(
                                " · ",
                                -1
                                /* CACHED */
                              )),
                              r.meetingId ? (e.openBlock(), e.createElementBlock("button", {
                                key: 0,
                                type: "button",
                                class: "mm-linkish",
                                onClick: (Q) => e.unref(de)({ kind: "meeting", id: r.meetingId })
                              }, e.toDisplayString(r.meetingTitle), 9, vv)) : (e.openBlock(), e.createElementBlock(
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
                  uv,
                  e.toDisplayString(k.$t("还没有定稿的决议")),
                  1
                  /* TEXT */
                ))
              ]),
              e.createElementVNode("section", kv, [
                e.createElementVNode("h4", null, [
                  e.createTextVNode(
                    e.toDisplayString(k.$t("成员")) + " ",
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "small",
                    null,
                    e.toDisplayString(a.value.members.length),
                    1
                    /* TEXT */
                  )
                ]),
                e.createElementVNode("div", gv, [
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(a.value.members, (r) => (e.openBlock(), e.createElementBlock("i", {
                      key: r.id,
                      style: e.normalizeStyle({ background: e.unref(oe)(r.name).color }),
                      title: r.name,
                      "aria-label": r.name
                    }, e.toDisplayString(e.unref(oe)(r.name).text), 13, yv))),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ])
              ])
            ])
          ])) : b.value === "meetings" ? (e.openBlock(), e.createElementBlock(
            e.Fragment,
            { key: 3 },
            [
              e.createCommentVNode(" 会议 "),
              e.createElementVNode("div", fv, [
                e.createElementVNode("div", Ev, [
                  e.createElementVNode(
                    "p",
                    Nv,
                    e.toDisplayString(F.value.status === "active" ? k.$t("项目进行中才能新建会议。") : k.$t("项目已结项，不能再新建会议。")),
                    1
                    /* TEXT */
                  ),
                  h[22] || (h[22] = e.createElementVNode(
                    "span",
                    { class: "grow" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  a.value.can.createMeeting ? (e.openBlock(), e.createElementBlock("button", {
                    key: 0,
                    type: "button",
                    class: "ss-btn primary sm",
                    "data-test": "mm-project-new-meeting",
                    onClick: h[4] || (h[4] = (r) => o.value = !0)
                  }, [
                    h[21] || (h[21] = e.createElementVNode(
                      "i",
                      { class: "ri-add-line" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createTextVNode(
                      e.toDisplayString(k.$t("新建会议")),
                      1
                      /* TEXT */
                    )
                  ])) : e.createCommentVNode("v-if", !0)
                ]),
                a.value.meetings.length ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock(
                  "p",
                  Vv,
                  e.toDisplayString(k.$t("这个项目还没有会议")),
                  1
                  /* TEXT */
                )),
                (e.openBlock(!0), e.createElementBlock(
                  e.Fragment,
                  null,
                  e.renderList(a.value.meetings, (r) => (e.openBlock(), e.createElementBlock("button", {
                    key: r.id,
                    type: "button",
                    class: "mm-mrow",
                    "data-test": `mm-pd-meeting-${r.id}`,
                    onClick: (H) => e.unref(de)({ kind: "meeting", id: r.id })
                  }, [
                    e.createElementVNode("span", hv, [
                      e.createElementVNode(
                        "strong",
                        null,
                        e.toDisplayString(r.title),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode("small", null, [
                        e.createTextVNode(
                          e.toDisplayString(e.unref(ye)(r.time)),
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
                      bv,
                      e.toDisplayString(k.$t("待你处理")),
                      1
                      /* TEXT */
                    )) : e.createCommentVNode("v-if", !0),
                    e.createElementVNode(
                      "span",
                      {
                        class: e.normalizeClass(["mm-tag", z(r.status)])
                      },
                      e.toDisplayString(e.unref(Je)[r.status] || r.status),
                      3
                      /* TEXT, CLASS */
                    ),
                    h[23] || (h[23] = e.createElementVNode(
                      "i",
                      {
                        class: "ri-arrow-right-s-line",
                        "aria-hidden": "true"
                      },
                      null,
                      -1
                      /* CACHED */
                    ))
                  ], 8, $v))),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ])
            ],
            2112
            /* STABLE_FRAGMENT, DEV_ROOT_FRAGMENT */
          )) : b.value === "tasks" ? (e.openBlock(), e.createElementBlock(
            e.Fragment,
            { key: 4 },
            [
              e.createCommentVNode(" 任务 "),
              e.createElementVNode("div", _v, [
                e.createVNode(zt, {
                  tasks: a.value.tasks,
                  "group-by": "status",
                  "empty-text": k.$t("这个项目还没有任务"),
                  onSelect: h[5] || (h[5] = (r) => e.unref(de)({ kind: "task", id: r.id }))
                }, null, 8, ["tasks", "empty-text"])
              ])
            ],
            2112
            /* STABLE_FRAGMENT, DEV_ROOT_FRAGMENT */
          )) : b.value === "reports" ? (e.openBlock(), e.createBlock(Pu, {
            key: 5,
            project: F.value,
            "focus-report-id": d.value,
            "can-generate": a.value.can.generateReport ?? F.value.status !== "archived",
            onChanged: v
          }, null, 8, ["project", "focus-report-id", "can-generate"])) : (e.openBlock(), e.createBlock(op, {
            key: 6,
            project: F.value,
            can: a.value.can,
            members: a.value.members,
            generating: !!a.value.summaryGenerating,
            "is-owner": D.value,
            onChanged: v
          }, null, 8, ["project", "can", "members", "generating", "is-owner"]))
        ],
        64
        /* STABLE_FRAGMENT */
      )) : e.createCommentVNode("v-if", !0),
      a.value && F.value ? (e.openBlock(), e.createBlock(_p, {
        key: 3,
        open: $.value,
        "project-id": F.value.id,
        "owner-id": F.value.ownerId,
        "member-ids": F.value.memberIds,
        members: a.value.members,
        onClose: h[6] || (h[6] = (r) => $.value = !1),
        onSaved: w
      }, null, 8, ["open", "project-id", "owner-id", "member-ids", "members"])) : e.createCommentVNode("v-if", !0),
      a.value && F.value && o.value ? (e.openBlock(), e.createBlock(Lt, {
        key: 4,
        "project-id": F.value.id,
        onClose: h[7] || (h[7] = (r) => o.value = !1),
        onCreated: U
      }, null, 8, ["project-id"])) : e.createCommentVNode("v-if", !0)
    ]));
  }
}), Sv = /* @__PURE__ */ le(Bv, [["__scopeId", "data-v-614cbe4b"]]), Dv = {
  class: "mm-pcd",
  "data-test": "mm-project-create"
}, wv = { class: "ss-field" }, Cv = ["placeholder"], Tv = { class: "ss-field" }, Iv = ["placeholder"], Mv = { class: "mm-pcd__cols" }, Av = { class: "mm-pcd__f" }, jv = { class: "mm-pcd__f" }, Lv = { class: "ss-muted" }, zv = {
  key: 0,
  class: "ss-note danger"
}, Fv = ["disabled"], Pv = /* @__PURE__ */ e.defineComponent({
  __name: "ProjectCreateDialog",
  props: {
    open: { type: Boolean }
  },
  emits: ["close", "created"],
  setup(l, { emit: p }) {
    const n = l, u = p, f = e.ref([]), s = e.ref([]), a = e.ref(!1), m = e.ref(""), i = e.reactive({ name: "", desc: "", ownerId: "", memberIds: [] }), g = e.computed(() => [.../* @__PURE__ */ new Set([...i.ownerId ? [i.ownerId] : [], ...i.memberIds])]);
    e.watch(() => n.open, async (d) => {
      if (!d) return;
      const c = te.value?.me.person?.id || "";
      Object.assign(i, { name: "", desc: "", ownerId: c, memberIds: c ? [c] : [] }), m.value = "";
      try {
        const y = await W("people.list");
        f.value = y?.people ?? [], s.value = y?.depts ?? [];
      } catch (y) {
        m.value = X.errorMessage(y);
      }
    }, { immediate: !0 }), e.watch(() => i.ownerId, (d) => {
      d && !i.memberIds.includes(d) && (i.memberIds = [d, ...i.memberIds]);
    });
    async function b() {
      a.value = !0, m.value = "";
      try {
        const d = await W("project.create", { name: i.name.trim(), desc: i.desc.trim(), ownerId: i.ownerId, memberIds: g.value });
        u("created", d);
      } catch (d) {
        m.value = X.errorMessage(d);
      } finally {
        a.value = !1;
      }
    }
    return (d, c) => (e.openBlock(), e.createBlock(ut, {
      open: l.open,
      title: d.$t("新建项目"),
      icon: "ri-folder-add-line",
      size: "lg",
      onClose: c[5] || (c[5] = (y) => u("close"))
    }, {
      footer: e.withCtx(() => [
        e.createElementVNode(
          "button",
          {
            type: "button",
            class: "ss-btn",
            onClick: c[4] || (c[4] = (y) => u("close"))
          },
          e.toDisplayString(d.$t("取消")),
          1
          /* TEXT */
        ),
        e.createElementVNode("button", {
          type: "button",
          class: "ss-btn primary",
          disabled: a.value || !i.name.trim() || !i.ownerId,
          "data-test": "mm-pc-submit",
          onClick: b
        }, [
          e.createElementVNode(
            "i",
            {
              class: e.normalizeClass(a.value ? "ri-loader-4-line spin" : "ri-check-line")
            },
            null,
            2
            /* CLASS */
          ),
          e.createTextVNode(
            e.toDisplayString(d.$t("创建项目")),
            1
            /* TEXT */
          )
        ], 8, Fv)
      ]),
      default: e.withCtx(() => [
        e.createElementVNode("div", Dv, [
          e.createElementVNode("label", wv, [
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(d.$t("项目名称")),
              1
              /* TEXT */
            ),
            e.withDirectives(e.createElementVNode("input", {
              "onUpdate:modelValue": c[0] || (c[0] = (y) => i.name = y),
              type: "text",
              maxlength: "60",
              placeholder: d.$t("如：A2 量产导入项目"),
              "data-test": "mm-pc-name"
            }, null, 8, Cv), [
              [e.vModelText, i.name]
            ])
          ]),
          e.createElementVNode("label", Tv, [
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(d.$t("项目说明")),
              1
              /* TEXT */
            ),
            e.withDirectives(e.createElementVNode("textarea", {
              "onUpdate:modelValue": c[1] || (c[1] = (y) => i.desc = y),
              rows: "3",
              placeholder: d.$t("项目目标、范围、关键节点"),
              "data-test": "mm-pc-desc"
            }, null, 8, Iv), [
              [e.vModelText, i.desc]
            ])
          ]),
          e.createElementVNode("div", Mv, [
            e.createElementVNode("div", Av, [
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(d.$t("项目负责人")),
                1
                /* TEXT */
              ),
              e.createVNode(je, {
                modelValue: i.ownerId,
                "onUpdate:modelValue": c[2] || (c[2] = (y) => i.ownerId = y),
                people: f.value,
                depts: s.value,
                multiple: !1,
                "max-height": 240
              }, null, 8, ["modelValue", "people", "depts"])
            ]),
            e.createElementVNode("div", jv, [
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(d.$t("项目成员（{n} 人）", { n: g.value.length })),
                1
                /* TEXT */
              ),
              e.createVNode(je, {
                modelValue: i.memberIds,
                "onUpdate:modelValue": c[3] || (c[3] = (y) => i.memberIds = y),
                people: f.value,
                depts: s.value,
                locked: i.ownerId ? [i.ownerId] : [],
                "locked-hint": d.$t("负责人"),
                "max-height": 240
              }, null, 8, ["modelValue", "people", "depts", "locked", "locked-hint"])
            ])
          ]),
          e.createElementVNode(
            "p",
            Lv,
            e.toDisplayString(d.$t("项目负责人自动成为成员；之后会议的主持人、参会人、任务负责人和接收任务的部门负责人也会自动加入。")),
            1
            /* TEXT */
          ),
          m.value ? (e.openBlock(), e.createElementBlock("p", zv, [
            c[6] || (c[6] = e.createElementVNode(
              "i",
              { class: "ri-error-warning-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(m.value),
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
}), Uv = /* @__PURE__ */ le(Pv, [["__scopeId", "data-v-ed67c1d7"]]), Ov = {
  class: "mm-projects",
  "data-test": "mm-projects-tab"
}, Rv = { class: "mm-pagehead" }, qv = {
  key: 0,
  class: "ss-note danger"
}, Kv = { class: "mm-projects__grid" }, Hv = { class: "mm-plist" }, Wv = { class: "mm-search" }, Gv = ["placeholder", "aria-label"], Yv = ["aria-label"], Jv = ["aria-selected", "data-test", "onClick"], Qv = {
  key: 0,
  class: "mm-plist__empty"
}, Zv = {
  key: 1,
  class: "mm-plist__empty"
}, Xv = ["data-test", "onClick"], xv = { class: "mm-pcard__top" }, ek = {
  key: 0,
  class: "mm-pcard__over"
}, tk = { class: "mm-pcard__bot" }, lk = { class: "mm-bar" }, nk = { class: "owner" }, ak = { class: "mm-plist__foot" }, ok = { class: "mm-projects__detail" }, sk = {
  key: 1,
  class: "mm-projects__none"
}, rk = /* @__PURE__ */ e.defineComponent({
  __name: "ProjectsTab",
  emits: ["role"],
  setup(l, { expose: p, emit: n }) {
    const u = ["active", "closing", "archived"], f = {
      active: t.t("没有进行中的项目"),
      closing: t.t("没有结项中的项目"),
      archived: t.t("没有已归档的项目")
    }, s = se.useNotificationStore(), a = e.ref([]), m = e.ref("active"), i = e.ref(""), g = e.ref(""), b = e.ref(0), d = e.ref(null), c = e.ref(!1), y = e.ref(!1), $ = e.ref(""), o = n;
    function I(r) {
      Ke.value = r, o("role", r);
    }
    e.watch(g, (r) => {
      r || I("");
    });
    const F = e.computed(() => Object.fromEntries(u.map((r) => [r, a.value.filter((H) => H.status === r).length]))), P = e.computed(() => {
      const r = i.value.trim().toLowerCase();
      return a.value.filter((H) => H.status === m.value && (!r || `${H.name} ${H.ownerName}`.toLowerCase().includes(r)));
    }), L = (r) => typeof r.rate == "number" && Number.isFinite(r.rate) ? ge(r.rate) : dt(r.done, r.total);
    async function D() {
      y.value = !0;
      try {
        const r = await W("project.list", {});
        a.value = Array.isArray(r) ? r : [], $.value = "", z();
      } catch (r) {
        $.value = X.errorMessage(r);
      } finally {
        y.value = !1;
      }
    }
    let C = !0;
    function z() {
      const r = a.value.find((H) => H.id === g.value);
      if (r) {
        r.status !== m.value && (m.value = r.status);
        return;
      }
      if (!(g.value && d.value)) {
        if (C && !F.value[m.value]) {
          const H = u.find((Q) => F.value[Q] > 0);
          H && (m.value = H);
        }
        C = !1, g.value = P.value[0]?.id ?? "";
      }
    }
    e.watch(m, () => {
      P.value.some((r) => r.id === g.value) || (g.value = P.value[0]?.id ?? "");
    });
    function R(r) {
      g.value = r, d.value = null;
    }
    async function _(r) {
      if (a.value.some((H) => H.id === r)) return r;
      for (const H of a.value)
        try {
          const Q = await W("project.get", { id: H.id });
          if (Q?.project?.weeklyReports?.some((ne) => ne.id === r) || Q?.project?.summary?.id === r) return H.id;
        } catch {
        }
      return "";
    }
    async function E() {
      const r = ke.value;
      if (r.tab !== "projects") return;
      const H = Ml(r.link);
      if (!H) return;
      let Q = H.projectId || "", ne = H.reportId;
      if (r.link?.kind === "report" && !r.link.anchor && (Q = await _(r.link.id), Q === r.link.id && (ne = void 0)), !Q) {
        s.warn(t.t("没找到要打开的项目或报告"));
        return;
      }
      const q = a.value.find((B) => B.id === Q);
      q && (m.value = q.status), i.value = "", g.value = Q, d.value = { tab: H.tab, reportId: ne, seq: r.seq };
    }
    e.watch(() => ke.value.seq, () => {
      E();
    });
    async function v(r) {
      c.value = !1, s.success(t.t("项目已创建")), m.value = "active", i.value = "", await D(), r?.id && R(r.id);
    }
    let w = null, U = null, G = 0;
    function k() {
      w && clearTimeout(w), w = setTimeout(() => {
        w = null, G = Date.now(), D(), b.value += 1;
      }, 250);
    }
    function h() {
      w || Date.now() - G < 800 || k();
    }
    return p({ refresh: h }), e.onMounted(async () => {
      G = Date.now(), await D(), await E(), U = _e((r) => {
        r.type !== "changed" || !["all", "project", "task", "meeting", "org"].includes(r.scope) || k();
      });
    }), e.onBeforeUnmount(() => {
      U?.(), w && clearTimeout(w), Ke.value = "";
    }), (r, H) => (e.openBlock(), e.createElementBlock("div", Ov, [
      e.createElementVNode("header", Rv, [
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
        H[5] || (H[5] = e.createElementVNode(
          "span",
          { class: "grow" },
          null,
          -1
          /* CACHED */
        )),
        e.unref(te)?.me.canCreateProject ? (e.openBlock(), e.createElementBlock("button", {
          key: 0,
          type: "button",
          class: "ss-btn",
          "data-test": "mm-project-new",
          onClick: H[0] || (H[0] = (Q) => c.value = !0)
        }, [
          H[4] || (H[4] = e.createElementVNode(
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
      $.value ? (e.openBlock(), e.createElementBlock("p", qv, [
        H[6] || (H[6] = e.createElementVNode(
          "i",
          { class: "ri-error-warning-line" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString($.value),
          1
          /* TEXT */
        )
      ])) : e.createCommentVNode("v-if", !0),
      e.createElementVNode("div", Kv, [
        e.createElementVNode("aside", Hv, [
          e.createElementVNode("label", Wv, [
            H[7] || (H[7] = e.createElementVNode(
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
              "onUpdate:modelValue": H[1] || (H[1] = (Q) => i.value = Q),
              type: "search",
              placeholder: r.$t("搜索项目"),
              "aria-label": r.$t("搜索项目"),
              "data-test": "mm-projects-search"
            }, null, 8, Gv), [
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
              e.renderList(u, (Q) => e.createElementVNode("button", {
                key: Q,
                type: "button",
                role: "tab",
                "aria-selected": m.value === Q,
                class: e.normalizeClass({ on: m.value === Q }),
                "data-test": `mm-projects-filter-${Q}`,
                onClick: (ne) => m.value = Q
              }, [
                e.createTextVNode(
                  e.toDisplayString(e.unref(He)[Q]) + " ",
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "em",
                  null,
                  e.toDisplayString(F.value[Q]),
                  1
                  /* TEXT */
                )
              ], 10, Jv)),
              64
              /* STABLE_FRAGMENT */
            ))
          ], 8, Yv),
          y.value && !a.value.length ? (e.openBlock(), e.createElementBlock(
            "p",
            Qv,
            e.toDisplayString(r.$t("加载中…")),
            1
            /* TEXT */
          )) : P.value.length ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock(
            "p",
            Zv,
            e.toDisplayString(i.value ? r.$t("没有匹配的项目") : f[m.value]),
            1
            /* TEXT */
          )),
          (e.openBlock(!0), e.createElementBlock(
            e.Fragment,
            null,
            e.renderList(P.value, (Q) => (e.openBlock(), e.createElementBlock("button", {
              key: Q.id,
              type: "button",
              class: e.normalizeClass(["mm-pcard", { on: Q.id === g.value }]),
              "data-test": `mm-project-card-${Q.id}`,
              onClick: (ne) => R(Q.id)
            }, [
              e.createElementVNode("span", xv, [
                e.createElementVNode(
                  "strong",
                  null,
                  e.toDisplayString(Q.name),
                  1
                  /* TEXT */
                ),
                Q.overdue > 0 ? (e.openBlock(), e.createElementBlock(
                  "span",
                  ek,
                  e.toDisplayString(r.$t("逾期 {n}", { n: Q.overdue })),
                  1
                  /* TEXT */
                )) : e.createCommentVNode("v-if", !0)
              ]),
              e.createElementVNode("span", tk, [
                e.createElementVNode("i", lk, [
                  e.createElementVNode(
                    "b",
                    {
                      style: e.normalizeStyle({ width: `${L(Q)}%` })
                    },
                    null,
                    4
                    /* STYLE */
                  )
                ]),
                e.createElementVNode(
                  "em",
                  null,
                  e.toDisplayString(L(Q)) + "%",
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "span",
                  nk,
                  e.toDisplayString(Q.ownerName),
                  1
                  /* TEXT */
                )
              ])
            ], 10, Xv))),
            128
            /* KEYED_FRAGMENT */
          )),
          e.createElementVNode(
            "p",
            ak,
            e.toDisplayString(r.$t("只显示你参与的项目")),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode("div", ok, [
          g.value ? (e.openBlock(), e.createBlock(Sv, {
            key: 0,
            "project-id": g.value,
            "refresh-seq": b.value,
            focus: d.value,
            onChanged: D,
            onRole: I
          }, null, 8, ["project-id", "refresh-seq", "focus"])) : (e.openBlock(), e.createElementBlock("div", sk, [
            H[9] || (H[9] = e.createElementVNode(
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
              e.toDisplayString(a.value.length ? r.$t("选择左侧的一个项目查看详情") : r.$t("还没有你参与的项目")),
              1
              /* TEXT */
            ),
            !a.value.length && e.unref(te)?.me.canCreateProject ? (e.openBlock(), e.createElementBlock("button", {
              key: 0,
              type: "button",
              class: "ss-btn primary",
              onClick: H[2] || (H[2] = (Q) => c.value = !0)
            }, [
              H[8] || (H[8] = e.createElementVNode(
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
      e.createVNode(Uv, {
        open: c.value,
        onClose: H[3] || (H[3] = (Q) => c.value = !1),
        onCreated: v
      }, null, 8, ["open"])
    ]));
  }
}), ik = /* @__PURE__ */ le(rk, [["__scopeId", "data-v-7edcfee7"]]), ck = {
  class: "mm-sv",
  "data-test": "mm-voiceprint"
}, dk = { class: "mm-sp__head" }, mk = { class: "ss-actions" }, uk = ["disabled"], pk = ["disabled", "title"], vk = {
  key: 0,
  class: "ss-note warn"
}, kk = { class: "ss-muted mm-sv__tip" }, gk = {
  key: 2,
  class: "ss-note danger"
}, yk = {
  class: "mm-sv__cov",
  "data-test": "mm-vp-coverage"
}, fk = { class: "mm-sv__num" }, Ek = { class: "mm-sv__bar" }, Nk = { class: "mm-bar" }, Vk = { class: "mm-sv__tools" }, $k = {
  class: "mm-subtabs",
  role: "tablist"
}, hk = ["aria-selected", "data-test", "onClick"], bk = { class: "mm-search" }, _k = ["placeholder", "aria-label"], Bk = { class: "ss-table-wrap" }, Sk = { class: "ss-table mm-sv__table" }, Dk = { class: "num" }, wk = { key: 0 }, Ck = {
  colspan: "6",
  class: "mm-sv__empty"
}, Tk = ["data-test"], Ik = { class: "mm-sv__st" }, Mk = ["title", "data-test"], Ak = ["title", "data-test"], jk = { class: "mono" }, Lk = { class: "mono" }, zk = { class: "num" }, Fk = ["disabled", "onClick"], Pk = ["disabled", "data-test", "onClick"], Uk = ["disabled", "data-test", "onClick"], Ok = ["disabled", "data-test", "onClick"], Rk = ["onClick"], qk = { class: "mm-sv__foot" }, Kk = ["aria-label"], Hk = ["disabled", "aria-label"], Wk = ["aria-current", "onClick"], Gk = ["disabled", "aria-label"], Yk = {
  class: "mm-sv__imp",
  "data-test": "mm-vp-import-dialog"
}, Jk = { class: "mm-sv__f" }, Qk = { class: "mm-sv__f" }, Zk = {
  key: 0,
  class: "ss-muted"
}, Xk = { class: "mm-sv__consent" }, xk = {
  key: 0,
  class: "ss-note danger"
}, eg = ["disabled"], tg = 8, lg = /* @__PURE__ */ e.defineComponent({
  __name: "SettingsVoiceprint",
  props: {
    people: {},
    depts: {},
    refreshSeq: { default: 0 }
  },
  setup(l) {
    const p = [
      { key: "all", title: t.t("全部人员") },
      { key: "missing", title: t.t("未采集") },
      { key: "collected", title: t.t("已采集") }
    ], n = l, u = Ne.useDialog(), f = se.useNotificationStore(), s = e.ref([]), a = e.ref(!1), m = e.ref(!1), i = e.ref(""), g = e.ref({}), b = e.ref(null), d = e.ref("all"), c = e.ref(""), y = e.ref(1), $ = e.ref(!1), o = e.reactive({ personId: "", path: "", consent: !1 }), I = e.ref(""), F = e.ref(null), P = e.computed(() => !!te.value?.pushChannel || !!te.value?.wecomConnected), L = e.computed(() => te.value?.me.person?.id || ""), D = e.computed(() => te.value?.pushChannel === "webhook"), C = e.computed(() => s.value.filter((B) => B.status === "collected").length), z = e.computed(() => dt(C.value, s.value.length)), R = (B) => B === "all" ? s.value.length : s.value.filter((A) => A.status === B).length, _ = e.computed(() => s.value.filter((B) => d.value === "all" || B.status === d.value).filter((B) => mt(B.person, B.deptName, c.value)).sort((B, A) => B.status === A.status ? (A.enrolledAt || 0) - (B.enrolledAt || 0) : B.status === "missing" ? -1 : 1)), E = e.computed(() => At(_.value, y.value, tg));
    async function v() {
      a.value = !0;
      try {
        const B = await W("voiceprint.list");
        s.value = Array.isArray(B) ? B : [], i.value = "";
      } catch (B) {
        i.value = X.errorMessage(B);
      } finally {
        a.value = !1;
      }
    }
    e.watch(() => n.refreshSeq, () => {
      v();
    }, { immediate: !0 });
    const w = (B) => s.value.find((A) => A.person.id === B)?.person.name || n.people.find((A) => A.id === B)?.name || B;
    async function U() {
      const B = await W("voiceprint.link"), A = {};
      if (B && typeof B == "object" && Array.isArray(B.links))
        for (const N of B.links) N?.personId && N.url && (A[N.personId] = N.url);
      const K = te.value?.me.person?.id, V = Ge(B);
      if (K && V && !A[K] && (A[K] = V), !Object.keys(A).length) throw new Error(t.t("没拿到采集链接，请先在「手机端」开启手机页服务"));
      return g.value = A, A;
    }
    async function G() {
      m.value = !0, i.value = "";
      try {
        const B = await U(), A = s.value.filter((N) => N.status === "missing" && B[N.person.id]), K = A.length ? A : s.value.filter((N) => B[N.person.id]), V = K.map((N) => `${N.person.name}${N.deptName ? ` · ${N.deptName}` : ""}${t.t("：")}${B[N.person.id]}`).join(`
`);
        await Ye(V) ? f.success(A.length ? t.t("已复制 {n} 位未采集员工的采集链接（每人一条，请分别发给本人）", { n: K.length }) : t.t("已复制 {n} 人的采集链接", { n: K.length })) : i.value = t.t("复制失败，请重试");
      } catch (B) {
        i.value = X.errorMessage(B);
      } finally {
        m.value = !1;
      }
    }
    async function k(B) {
      m.value = !0, i.value = "";
      try {
        const K = (g.value[B.person.id] ? g.value : await U())[B.person.id];
        if (!K) throw new Error(t.t("没拿到 {name} 的采集链接", { name: B.person.name }));
        await Ye(K) && f.success(t.t("已复制 {name} 的采集链接", { name: B.person.name }));
      } catch (A) {
        i.value = X.errorMessage(A);
      } finally {
        m.value = !1;
      }
    }
    async function h() {
      if (await u.confirm({
        title: D.value ? t.t("发送到企微群") : t.t("推送到企微"),
        message: D.value ? t.t("在企微群里发一条声纹采集邀请，点名提醒还没采集的人（已采集的不打扰）？") : t.t("给还没采集的人逐个推送声纹采集卡片（已采集的不打扰）？")
      })) {
        m.value = !0, i.value = "", b.value = null;
        try {
          const A = await W("voiceprint.send");
          b.value = { sent: Number(A?.sent) || 0, failed: Array.isArray(A?.failed) ? A.failed : [] }, A?.skipped ? f.success(t.t("所有人都已采集过声纹，不用再发")) : b.value.failed.length || f.success(A?.group ? t.t("采集邀请已发到企微群") : t.t("采集卡片已推送到企微"));
        } catch (A) {
          i.value = X.errorMessage(A);
        } finally {
          m.value = !1;
        }
      }
    }
    async function r(B) {
      if (await u.confirm({
        title: t.t("删除声纹（撤回授权）"),
        message: t.t("删除 {name} 的声纹样本和授权记录？之后的会议里不再能自动识别 TA，需要重新授权采集。", { name: B.person.name }),
        danger: !0,
        confirmLabel: t.t("删除")
      })) {
        m.value = !0, i.value = "";
        try {
          await W("voiceprint.delete", { personId: B.person.id }), f.success(t.t("已删除并撤回授权")), await v();
        } catch (K) {
          i.value = X.errorMessage(K);
        } finally {
          m.value = !1;
        }
      }
    }
    async function H(B) {
      const A = !B.autoLearn;
      if (!(!A && !await u.confirm({
        title: t.t("关闭会议补充"),
        message: t.t("关闭后不再从会议里补充样本，已补充的 {n} 条样本会一并删除；注册时录的声纹不受影响。", { n: B.extraCount || 0 }),
        confirmLabel: t.t("关闭并删除样本"),
        danger: !0
      }))) {
        m.value = !0, i.value = "";
        try {
          await W("voiceprint.autoLearn.set", { enabled: A }), f.success(A ? t.t("已开启：之后确认会议发言时会自动补充声纹") : t.t("已关闭并删除会议补充样本")), await v();
        } catch (K) {
          i.value = X.errorMessage(K);
        } finally {
          m.value = !1;
        }
      }
    }
    function Q(B) {
      Object.assign(o, { personId: B, path: "", consent: !1 }), I.value = "", F.value && (F.value.value = ""), $.value = !0;
    }
    function ne(B) {
      const A = B.target.files?.[0];
      o.path = Al(A), I.value = A && !o.path ? t.t("读不到这个文件的本机路径，请选择电脑上的录音文件") : "";
    }
    async function q() {
      m.value = !0, I.value = "";
      try {
        await W("voiceprint.enroll", { personId: o.personId, path: o.path, consent: !0 }), $.value = !1, f.success(t.t("声纹已采集")), await v();
      } catch (B) {
        I.value = X.errorMessage(B);
      } finally {
        m.value = !1;
      }
    }
    return (B, A) => (e.openBlock(), e.createElementBlock("div", ck, [
      e.createElementVNode("header", dk, [
        e.createElementVNode("div", null, [
          e.createElementVNode(
            "h3",
            null,
            e.toDisplayString(B.$t("声纹库")),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "p",
            null,
            e.toDisplayString(B.$t("员工在企微里打开采集链接，授权同意后录 10～15 秒，用于会议发言人识别（只在本场参会人中比对）")),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode("div", mk, [
          e.createElementVNode("button", {
            type: "button",
            class: "ss-btn",
            disabled: m.value,
            "data-test": "mm-vp-copy",
            onClick: G
          }, [
            A[9] || (A[9] = e.createElementVNode(
              "i",
              { class: "ri-link" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(B.$t("复制采集链接")),
              1
              /* TEXT */
            )
          ], 8, uk),
          e.createElementVNode("button", {
            type: "button",
            class: "ss-btn primary",
            disabled: m.value || !P.value,
            title: P.value ? "" : B.$t("未连接企微"),
            "data-test": "mm-vp-send",
            onClick: h
          }, [
            A[10] || (A[10] = e.createElementVNode(
              "i",
              { class: "ri-send-plane-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(D.value ? B.$t("发送到企微群") : B.$t("推送到企微")),
              1
              /* TEXT */
            )
          ], 8, pk)
        ])
      ]),
      P.value ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock("p", vk, [
        A[11] || (A[11] = e.createElementVNode(
          "i",
          { class: "ri-information-line" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(B.$t("未连接企微：先在「消息推送」里配置企微自建应用或群机器人才能推送；也可以复制采集链接自己发。采集链接要先在「手机端」开启手机页服务。")),
          1
          /* TEXT */
        )
      ])),
      e.createElementVNode(
        "p",
        kk,
        e.toDisplayString(B.$t("每人的采集链接都带本人令牌（等同免登），只能本人打开录自己的声纹；复制时按人一条一行。")),
        1
        /* TEXT */
      ),
      b.value ? (e.openBlock(), e.createElementBlock(
        "p",
        {
          key: 1,
          class: e.normalizeClass(["ss-note", b.value.failed.length ? "warn" : "ok"]),
          "data-test": "mm-vp-send-result"
        },
        [
          e.createElementVNode(
            "i",
            {
              class: e.normalizeClass(b.value.failed.length ? "ri-alert-line" : "ri-checkbox-circle-line")
            },
            null,
            2
            /* CLASS */
          ),
          e.createTextVNode(
            " " + e.toDisplayString(B.$t("已推送 {a} 人", { a: b.value.sent })),
            1
            /* TEXT */
          ),
          b.value.failed.length ? (e.openBlock(), e.createElementBlock(
            e.Fragment,
            { key: 0 },
            [
              e.createTextVNode(
                e.toDisplayString(B.$t("，{b} 人失败：{names}", { b: b.value.failed.length, names: b.value.failed.slice(0, 6).map((K) => B.$t("{p0}（{p1}）", { p0: w(K.personId), p1: K.error })).join(B.$t("；")) })),
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
      i.value ? (e.openBlock(), e.createElementBlock("p", gk, [
        A[12] || (A[12] = e.createElementVNode(
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
      e.createElementVNode("div", yk, [
        e.createElementVNode("div", fk, [
          e.createElementVNode(
            "b",
            null,
            e.toDisplayString(C.value),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "span",
            null,
            "/ " + e.toDisplayString(B.$t("{n} 人", { n: s.value.length })),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "small",
            null,
            e.toDisplayString(B.$t("已采集")),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode("div", Ek, [
          e.createElementVNode("i", Nk, [
            e.createElementVNode(
              "b",
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
            e.toDisplayString(B.$t("覆盖率 {p}% · 还有 {n} 人未采集", { p: z.value, n: s.value.length - C.value })),
            1
            /* TEXT */
          )
        ])
      ]),
      e.createElementVNode("div", Vk, [
        e.createElementVNode("nav", $k, [
          (e.openBlock(), e.createElementBlock(
            e.Fragment,
            null,
            e.renderList(p, (K) => e.createElementVNode("button", {
              key: K.key,
              type: "button",
              role: "tab",
              "aria-selected": d.value === K.key,
              class: e.normalizeClass({ on: d.value === K.key }),
              "data-test": `mm-vp-filter-${K.key}`,
              onClick: (V) => {
                d.value = K.key, y.value = 1;
              }
            }, [
              e.createTextVNode(
                e.toDisplayString(K.title) + " ",
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "em",
                null,
                e.toDisplayString(R(K.key)),
                1
                /* TEXT */
              )
            ], 10, hk)),
            64
            /* STABLE_FRAGMENT */
          ))
        ]),
        A[15] || (A[15] = e.createElementVNode(
          "span",
          { class: "grow" },
          null,
          -1
          /* CACHED */
        )),
        e.createElementVNode("label", bk, [
          A[13] || (A[13] = e.createElementVNode(
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
            "onUpdate:modelValue": A[0] || (A[0] = (K) => c.value = K),
            type: "search",
            placeholder: B.$t("搜索员工"),
            "aria-label": B.$t("搜索员工"),
            onInput: A[1] || (A[1] = (K) => y.value = 1)
          }, null, 40, _k), [
            [e.vModelText, c.value]
          ])
        ]),
        e.createElementVNode("button", {
          type: "button",
          class: "ss-btn sm",
          "data-test": "mm-vp-import",
          onClick: A[2] || (A[2] = (K) => Q(""))
        }, [
          A[14] || (A[14] = e.createElementVNode(
            "i",
            { class: "ri-upload-2-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            e.toDisplayString(B.$t("导入录音代为采集")),
            1
            /* TEXT */
          )
        ])
      ]),
      e.createElementVNode("div", Bk, [
        e.createElementVNode("table", Sk, [
          e.createElementVNode("thead", null, [
            e.createElementVNode("tr", null, [
              e.createElementVNode(
                "th",
                null,
                e.toDisplayString(B.$t("员工")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "th",
                null,
                e.toDisplayString(B.$t("部门")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "th",
                null,
                e.toDisplayString(B.$t("状态")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "th",
                null,
                e.toDisplayString(B.$t("授权时间（个保法单独同意）")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "th",
                null,
                e.toDisplayString(B.$t("采集时间")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "th",
                Dk,
                e.toDisplayString(B.$t("操作")),
                1
                /* TEXT */
              )
            ])
          ]),
          e.createElementVNode("tbody", null, [
            E.value.rows.length ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock("tr", wk, [
              e.createElementVNode(
                "td",
                Ck,
                e.toDisplayString(a.value ? B.$t("加载中…") : B.$t("没有符合条件的员工")),
                1
                /* TEXT */
              )
            ])),
            (e.openBlock(!0), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(E.value.rows, (K) => (e.openBlock(), e.createElementBlock("tr", {
                key: K.person.id,
                "data-test": `mm-vp-row-${K.person.id}`
              }, [
                e.createElementVNode("td", null, [
                  e.createVNode(Ae, {
                    name: K.person.name
                  }, null, 8, ["name"])
                ]),
                e.createElementVNode(
                  "td",
                  null,
                  e.toDisplayString(K.deptName || "—"),
                  1
                  /* TEXT */
                ),
                e.createElementVNode("td", null, [
                  e.createElementVNode("span", Ik, [
                    e.createElementVNode(
                      "span",
                      {
                        class: e.normalizeClass(["ss-chip", K.status === "collected" ? "ok" : "warn"])
                      },
                      e.toDisplayString(K.status === "collected" ? B.$t("已采集") : B.$t("未采集")),
                      3
                      /* TEXT, CLASS */
                    ),
                    K.needsUpdate ? (e.openBlock(), e.createElementBlock("span", {
                      key: 0,
                      class: "ss-chip warn",
                      title: B.$t("这份声纹是旧模型采的。本机已装更准的声纹模型，请本人用采集链接重录一次（只要有一位参会人还是旧声纹，整场就只能用旧模型认人）"),
                      "data-test": `mm-vp-old-${K.person.id}`
                    }, e.toDisplayString(B.$t("建议重录")), 9, Mk)) : e.createCommentVNode("v-if", !0),
                    K.autoLearn ? (e.openBlock(), e.createElementBlock("span", {
                      key: 1,
                      class: "mm-sv__learn",
                      title: B.$t("确认会议发言后，用本人的发言自动补充声纹"),
                      "data-test": `mm-vp-learn-${K.person.id}`
                    }, [
                      A[16] || (A[16] = e.createElementVNode(
                        "i",
                        { class: "ri-loop-right-line" },
                        null,
                        -1
                        /* CACHED */
                      )),
                      e.createTextVNode(
                        e.toDisplayString(K.extraCount ? B.$t("会议补充 {n} 条", { n: K.extraCount }) : B.$t("会议补充已开")),
                        1
                        /* TEXT */
                      )
                    ], 8, Ak)) : e.createCommentVNode("v-if", !0)
                  ])
                ]),
                e.createElementVNode(
                  "td",
                  jk,
                  e.toDisplayString(K.consentAt ? e.unref(ye)(K.consentAt, !0) : "—"),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "td",
                  Lk,
                  e.toDisplayString(K.enrolledAt ? e.unref(ye)(K.enrolledAt) : "—"),
                  1
                  /* TEXT */
                ),
                e.createElementVNode("td", zk, [
                  K.status === "collected" ? (e.openBlock(), e.createElementBlock(
                    e.Fragment,
                    { key: 0 },
                    [
                      K.person.id === L.value ? (e.openBlock(), e.createElementBlock(
                        e.Fragment,
                        { key: 0 },
                        [
                          e.createElementVNode("button", {
                            type: "button",
                            class: "ss-link",
                            disabled: m.value,
                            "data-test": "mm-vp-learn-toggle",
                            onClick: (V) => H(K)
                          }, e.toDisplayString(K.autoLearn ? B.$t("关闭会议补充") : B.$t("开启会议补充")), 9, Fk),
                          A[17] || (A[17] = e.createElementVNode(
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
                      K.needsUpdate ? (e.openBlock(), e.createElementBlock(
                        e.Fragment,
                        { key: 1 },
                        [
                          e.createElementVNode("button", {
                            type: "button",
                            class: "ss-link",
                            disabled: m.value,
                            "data-test": `mm-vp-copy-${K.person.id}`,
                            onClick: (V) => k(K)
                          }, e.toDisplayString(B.$t("复制重录链接")), 9, Pk),
                          A[18] || (A[18] = e.createElementVNode(
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
                        class: "ss-link danger",
                        disabled: m.value,
                        "data-test": `mm-vp-del-${K.person.id}`,
                        onClick: (V) => r(K)
                      }, e.toDisplayString(B.$t("删除（撤回授权）")), 9, Uk)
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
                        disabled: m.value,
                        "data-test": `mm-vp-copy-${K.person.id}`,
                        onClick: (V) => k(K)
                      }, e.toDisplayString(B.$t("复制链接")), 9, Ok),
                      A[19] || (A[19] = e.createElementVNode(
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
                        onClick: (V) => Q(K.person.id)
                      }, e.toDisplayString(B.$t("代为采集")), 9, Rk)
                    ],
                    64
                    /* STABLE_FRAGMENT */
                  ))
                ])
              ], 8, Tk))),
              128
              /* KEYED_FRAGMENT */
            ))
          ])
        ])
      ]),
      e.createElementVNode("footer", qk, [
        e.createElementVNode(
          "span",
          null,
          e.toDisplayString(B.$t("共 {n} 人", { n: _.value.length })),
          1
          /* TEXT */
        ),
        A[22] || (A[22] = e.createElementVNode(
          "span",
          { class: "grow" },
          null,
          -1
          /* CACHED */
        )),
        E.value.pages > 1 ? (e.openBlock(), e.createElementBlock("nav", {
          key: 0,
          class: "mm-pager",
          "aria-label": B.$t("分页")
        }, [
          e.createElementVNode("button", {
            type: "button",
            disabled: E.value.page <= 1,
            "aria-label": B.$t("上一页"),
            onClick: A[3] || (A[3] = (K) => y.value = E.value.page - 1)
          }, [...A[20] || (A[20] = [
            e.createElementVNode(
              "i",
              { class: "ri-arrow-left-s-line" },
              null,
              -1
              /* CACHED */
            )
          ])], 8, Hk),
          (e.openBlock(!0), e.createElementBlock(
            e.Fragment,
            null,
            e.renderList(E.value.pages, (K) => (e.openBlock(), e.createElementBlock("button", {
              key: K,
              type: "button",
              class: e.normalizeClass({ on: K === E.value.page }),
              "aria-current": K === E.value.page ? "page" : void 0,
              onClick: (V) => y.value = K
            }, e.toDisplayString(K), 11, Wk))),
            128
            /* KEYED_FRAGMENT */
          )),
          e.createElementVNode("button", {
            type: "button",
            disabled: E.value.page >= E.value.pages,
            "aria-label": B.$t("下一页"),
            onClick: A[4] || (A[4] = (K) => y.value = E.value.page + 1)
          }, [...A[21] || (A[21] = [
            e.createElementVNode(
              "i",
              { class: "ri-arrow-right-s-line" },
              null,
              -1
              /* CACHED */
            )
          ])], 8, Gk)
        ], 8, Kk)) : e.createCommentVNode("v-if", !0)
      ]),
      e.createVNode(ut, {
        open: $.value,
        title: B.$t("导入录音代为采集"),
        icon: "ri-mic-line",
        size: "md",
        description: B.$t("管理员代员工导入一段 10～15 秒、只有本人说话的清晰录音。必须先取得本人对采集声纹的单独同意。"),
        onClose: A[8] || (A[8] = (K) => $.value = !1)
      }, {
        footer: e.withCtx(() => [
          e.createElementVNode(
            "button",
            {
              type: "button",
              class: "ss-btn",
              onClick: A[7] || (A[7] = (K) => $.value = !1)
            },
            e.toDisplayString(B.$t("取消")),
            1
            /* TEXT */
          ),
          e.createElementVNode("button", {
            type: "button",
            class: "ss-btn primary",
            disabled: m.value || !o.personId || !o.path || !o.consent,
            "data-test": "mm-vp-import-submit",
            onClick: q
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
              e.toDisplayString(B.$t("校验并采集")),
              1
              /* TEXT */
            )
          ], 8, eg)
        ]),
        default: e.withCtx(() => [
          e.createElementVNode("div", Yk, [
            e.createElementVNode("div", Jk, [
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(B.$t("员工")),
                1
                /* TEXT */
              ),
              e.createVNode(je, {
                modelValue: o.personId,
                "onUpdate:modelValue": A[5] || (A[5] = (K) => o.personId = K),
                people: l.people,
                depts: l.depts,
                multiple: !1,
                "max-height": 200
              }, null, 8, ["modelValue", "people", "depts"])
            ]),
            e.createElementVNode("label", Qk, [
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(B.$t("录音文件")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "input",
                {
                  ref_key: "fileEl",
                  ref: F,
                  type: "file",
                  accept: ".mp3,.m4a,.wav,.aac,.amr,.flac,.ogg,.opus,.wma,.webm,.caf,.aiff,audio/*",
                  "data-test": "mm-vp-file",
                  onChange: ne
                },
                null,
                544
                /* NEED_HYDRATION, NEED_PATCH */
              ),
              o.path ? (e.openBlock(), e.createElementBlock(
                "small",
                Zk,
                e.toDisplayString(o.path),
                1
                /* TEXT */
              )) : e.createCommentVNode("v-if", !0)
            ]),
            e.createElementVNode("label", Xk, [
              e.withDirectives(e.createElementVNode(
                "input",
                {
                  "onUpdate:modelValue": A[6] || (A[6] = (K) => o.consent = K),
                  type: "checkbox",
                  "data-test": "mm-vp-consent"
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [e.vModelCheckbox, o.consent]
              ]),
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(B.$t("我已取得该员工本人对采集、使用声纹（含确认会议发言后用其本人发言补充声纹）的单独同意（个人信息保护法）；授权人与授权时间会记录在案。")),
                1
                /* TEXT */
              )
            ]),
            I.value ? (e.openBlock(), e.createElementBlock("p", xk, [
              A[23] || (A[23] = e.createElementVNode(
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
      }, 8, ["open", "title", "description"])
    ]));
  }
}), ng = /* @__PURE__ */ le(lg, [["__scopeId", "data-v-65e5f2d6"]]), ag = {
  class: "mm-so",
  "data-test": "mm-org"
}, og = { class: "mm-sp__head" }, sg = { class: "ss-actions" }, rg = ["disabled"], ig = ["disabled"], cg = {
  key: 0,
  class: "ss-note warn"
}, dg = {
  key: 1,
  class: "ss-note warn",
  "data-test": "mm-org-warnings"
}, mg = {
  key: 2,
  class: "ss-note danger"
}, ug = {
  key: 3,
  class: "mm-so__last",
  "data-test": "mm-org-last"
}, pg = { class: "mm-so__lasthead" }, vg = {
  key: 0,
  class: "ss-chip bad"
}, kg = {
  key: 0,
  class: "ss-note danger"
}, gg = { class: "mm-so__diff" }, yg = ["disabled", "aria-expanded", "onClick"], fg = {
  key: 1,
  class: "mm-so__names"
}, Eg = {
  key: 4,
  class: "ss-muted"
}, Ng = { class: "mm-so__cols" }, Vg = ["aria-label"], $g = { class: "mm-so__cap" }, hg = ["data-test", "onClick"], bg = {
  key: 0,
  class: "ss-muted"
}, _g = { class: "ss-table-wrap" }, Bg = { class: "ss-table" }, Sg = { key: 0 }, Dg = {
  colspan: "7",
  class: "mm-so__empty"
}, wg = ["data-test"], Cg = ["placeholder"], Tg = ["placeholder"], Ig = { class: "mm-so__ops" }, Mg = ["disabled", "onClick"], Ag = ["title"], jg = { class: "mono" }, Lg = { class: "mm-so__ops" }, zg = ["data-test", "onClick"], Fg = /* @__PURE__ */ e.defineComponent({
  __name: "SettingsOrg",
  props: {
    people: {},
    depts: {}
  },
  emits: ["changed"],
  setup(l, { emit: p }) {
    const n = [
      { key: "added", title: t.t("新增") },
      { key: "changed", title: t.t("变更") },
      { key: "left", title: t.t("离职") }
    ], u = l, f = p, s = se.useNotificationStore(), a = e.ref(!1), m = e.ref(""), i = e.ref(null), g = e.ref(""), b = e.ref(""), d = e.computed(() => !!te.value?.wecomConnected), c = (v) => te.value?.org.source !== "demo" || !!v.wecomIdManual, y = (v) => v.mobile || v.wecomUserId && c(v) ? t.t("群消息能提醒到本人") : t.t("没有手机号和企微账号：群消息里只写姓名"), $ = e.ref(""), o = e.reactive({ mobile: "", wecomUserId: "" });
    function I(v) {
      $.value = v.id, o.mobile = v.mobile || "", o.wecomUserId = v.wecomUserId && c(v) ? v.wecomUserId : "";
    }
    async function F(v) {
      a.value = !0, m.value = "";
      try {
        const w = { personId: v.id, mobile: o.mobile.trim() };
        (o.wecomUserId.trim() || c(v)) && (w.wecomUserId = o.wecomUserId.trim()), await W("org.person.contact", w), $.value = "", s.success(t.t("已保存")), f("changed");
      } catch (w) {
        m.value = X.errorMessage(w);
      } finally {
        a.value = !1;
      }
    }
    async function P() {
      a.value = !0, m.value = "";
      try {
        const v = await W("org.importFile");
        if (!v) return;
        i.value = v, s.success(t.t("导入完成：新增 {a}、变更 {b}、离职 {c}", { a: v.added.length, b: v.changed.length, c: v.left.length })), f("changed");
      } catch (v) {
        m.value = X.errorMessage(v);
      } finally {
        a.value = !1;
      }
    }
    const L = e.computed(() => i.value ?? te.value?.org.lastSync ?? null), D = e.computed(() => u.people.filter((v) => v.deptId === b.value && !v.left)), C = (v) => u.people.find((w) => w.id === v)?.name || v, z = (v) => u.people.filter((w) => w.deptId === v && !w.left).length, R = (v) => v.leaderIds.map(C).join(t.t("、")), _ = (v) => {
      const w = u.depts.find((U) => U.id === b.value);
      return w ? w.leaderIds.indexOf(v) + 1 : 0;
    };
    e.watch(() => u.depts, (v) => {
      v.some((w) => w.id === b.value) || (b.value = v[0]?.id ?? "");
    }, { immediate: !0 });
    async function E() {
      a.value = !0, m.value = "";
      try {
        const v = await W("org.sync");
        i.value = v, v?.error ? m.value = v.error : s.success(t.t("同步完成：新增 {a}、变更 {b}、离职 {c}", { a: v?.added?.length ?? 0, b: v?.changed?.length ?? 0, c: v?.left?.length ?? 0 })), f("changed");
      } catch (v) {
        m.value = X.errorMessage(v);
      } finally {
        a.value = !1;
      }
    }
    return (v, w) => (e.openBlock(), e.createElementBlock("div", ag, [
      e.createElementVNode("header", og, [
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
          e.createElementVNode(
            "p",
            null,
            e.toDisplayString(v.$t("没有企微自建应用时，可以导入企微管理后台导出的通讯录表格（通讯录 → 批量导入/导出 → 导出成员）。群消息按手机号或企微账号提醒本人，表里没有的可以在下面逐个填。")),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode("div", sg, [
          e.createElementVNode("button", {
            type: "button",
            class: "ss-btn",
            disabled: a.value,
            "data-test": "mm-org-import",
            onClick: P
          }, [
            w[3] || (w[3] = e.createElementVNode(
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
          ], 8, rg),
          e.createElementVNode("button", {
            type: "button",
            class: "ss-btn primary",
            disabled: a.value,
            "data-test": "mm-org-sync",
            onClick: E
          }, [
            e.createElementVNode(
              "i",
              {
                class: e.normalizeClass(a.value ? "ri-loader-4-line spin" : "ri-refresh-line")
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
          ], 8, ig)
        ])
      ]),
      d.value ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock("p", cg, [
        w[4] || (w[4] = e.createElementVNode(
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
      L.value?.warnings?.length ? (e.openBlock(), e.createElementBlock("div", dg, [
        w[5] || (w[5] = e.createElementVNode(
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
            e.renderList(L.value.warnings, (U, G) => (e.openBlock(), e.createElementBlock(
              "p",
              { key: G },
              e.toDisplayString(U),
              1
              /* TEXT */
            ))),
            128
            /* KEYED_FRAGMENT */
          ))
        ])
      ])) : e.createCommentVNode("v-if", !0),
      m.value ? (e.openBlock(), e.createElementBlock("p", mg, [
        w[6] || (w[6] = e.createElementVNode(
          "i",
          { class: "ri-error-warning-line" },
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
      L.value ? (e.openBlock(), e.createElementBlock("section", ug, [
        e.createElementVNode("div", pg, [
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
            e.toDisplayString(e.unref(ye)(L.value.at)),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "span",
            null,
            e.toDisplayString(v.$t("操作人 {name}", { name: C(L.value.by) })),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "span",
            {
              class: e.normalizeClass(["ss-chip", L.value.source === "demo" ? "brand" : "ok"])
            },
            e.toDisplayString(L.value.source === "wecom" ? v.$t("企微通讯录") : L.value.source === "import" ? v.$t("导入的通讯录") : v.$t("演示组织")),
            3
            /* TEXT, CLASS */
          ),
          L.value.error ? (e.openBlock(), e.createElementBlock(
            "span",
            vg,
            e.toDisplayString(v.$t("同步出错")),
            1
            /* TEXT */
          )) : e.createCommentVNode("v-if", !0)
        ]),
        L.value.error ? (e.openBlock(), e.createElementBlock(
          "p",
          kg,
          e.toDisplayString(L.value.error),
          1
          /* TEXT */
        )) : e.createCommentVNode("v-if", !0),
        e.createElementVNode("ul", gg, [
          (e.openBlock(), e.createElementBlock(
            e.Fragment,
            null,
            e.renderList(n, (U) => e.createElementVNode(
              "li",
              {
                key: U.key,
                class: e.normalizeClass(U.key)
              },
              [
                e.createElementVNode("button", {
                  type: "button",
                  disabled: !L.value[U.key].length,
                  "aria-expanded": g.value === U.key,
                  onClick: (G) => g.value = g.value === U.key ? "" : U.key
                }, [
                  e.createElementVNode(
                    "b",
                    null,
                    e.toDisplayString(L.value[U.key].length),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "small",
                    null,
                    e.toDisplayString(U.title),
                    1
                    /* TEXT */
                  )
                ], 8, yg)
              ],
              2
              /* CLASS */
            )),
            64
            /* STABLE_FRAGMENT */
          ))
        ]),
        g.value && L.value[g.value].length ? (e.openBlock(), e.createElementBlock(
          "p",
          fg,
          e.toDisplayString(L.value[g.value].map(C).join(v.$t("、"))),
          1
          /* TEXT */
        )) : e.createCommentVNode("v-if", !0)
      ])) : (e.openBlock(), e.createElementBlock(
        "p",
        Eg,
        e.toDisplayString(v.$t("还没有同步过")),
        1
        /* TEXT */
      )),
      e.createElementVNode("div", Ng, [
        e.createElementVNode("nav", {
          class: "mm-so__depts",
          "aria-label": v.$t("部门")
        }, [
          e.createElementVNode(
            "p",
            $g,
            e.toDisplayString(v.$t("部门（{n}）", { n: l.depts.length })),
            1
            /* TEXT */
          ),
          (e.openBlock(!0), e.createElementBlock(
            e.Fragment,
            null,
            e.renderList(l.depts, (U) => (e.openBlock(), e.createElementBlock("button", {
              key: U.id,
              type: "button",
              class: e.normalizeClass({ on: b.value === U.id }),
              "data-test": `mm-org-dept-${U.id}`,
              onClick: (G) => b.value = U.id
            }, [
              e.createElementVNode(
                "strong",
                null,
                e.toDisplayString(U.name),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "small",
                null,
                e.toDisplayString(v.$t("{n} 人", { n: z(U.id) })) + " · " + e.toDisplayString(v.$t("负责人 {names}", { names: R(U) || "—" })),
                1
                /* TEXT */
              )
            ], 10, hg))),
            128
            /* KEYED_FRAGMENT */
          )),
          l.depts.length ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock(
            "p",
            bg,
            e.toDisplayString(v.$t("还没有部门")),
            1
            /* TEXT */
          ))
        ], 8, Vg),
        e.createElementVNode("div", _g, [
          e.createElementVNode("table", Bg, [
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
                w[7] || (w[7] = e.createElementVNode(
                  "th",
                  null,
                  null,
                  -1
                  /* CACHED */
                ))
              ])
            ]),
            e.createElementVNode("tbody", null, [
              D.value.length ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock("tr", Sg, [
                e.createElementVNode(
                  "td",
                  Dg,
                  e.toDisplayString(v.$t("这个部门没有成员")),
                  1
                  /* TEXT */
                )
              ])),
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(D.value, (U) => (e.openBlock(), e.createElementBlock("tr", {
                  key: U.id,
                  "data-test": `mm-org-row-${U.id}`
                }, [
                  e.createElementVNode("td", null, [
                    e.createVNode(Ae, {
                      name: U.name
                    }, null, 8, ["name"])
                  ]),
                  e.createElementVNode(
                    "td",
                    null,
                    e.toDisplayString(U.title || "—"),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "td",
                    null,
                    e.toDisplayString(U.leaderId ? C(U.leaderId) : "—"),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode("td", null, [
                    _(U.id) > 0 ? (e.openBlock(), e.createElementBlock(
                      "span",
                      {
                        key: 0,
                        class: e.normalizeClass(["ss-chip", _(U.id) === 1 ? "brand" : ""])
                      },
                      e.toDisplayString(_(U.id) === 1 ? v.$t("第一负责人") : v.$t("负责人 {n}", { n: _(U.id) })),
                      3
                      /* TEXT, CLASS */
                    )) : e.createCommentVNode("v-if", !0)
                  ]),
                  $.value === U.id ? (e.openBlock(), e.createElementBlock(
                    e.Fragment,
                    { key: 0 },
                    [
                      e.createElementVNode("td", null, [
                        e.withDirectives(e.createElementVNode("input", {
                          "onUpdate:modelValue": w[0] || (w[0] = (G) => o.wecomUserId = G),
                          class: "mm-so__in mono",
                          placeholder: v.$t("企微账号"),
                          spellcheck: "false",
                          "data-test": "mm-org-edit-uid"
                        }, null, 8, Cg), [
                          [e.vModelText, o.wecomUserId]
                        ])
                      ]),
                      e.createElementVNode("td", null, [
                        e.withDirectives(e.createElementVNode("input", {
                          "onUpdate:modelValue": w[1] || (w[1] = (G) => o.mobile = G),
                          class: "mm-so__in mono",
                          type: "tel",
                          placeholder: v.$t("手机号"),
                          "data-test": "mm-org-edit-mobile"
                        }, null, 8, Tg), [
                          [e.vModelText, o.mobile]
                        ])
                      ]),
                      e.createElementVNode("td", Ig, [
                        e.createElementVNode("button", {
                          type: "button",
                          class: "ss-link",
                          disabled: a.value,
                          "data-test": "mm-org-edit-save",
                          onClick: (G) => F(U)
                        }, e.toDisplayString(v.$t("保存")), 9, Mg),
                        e.createElementVNode(
                          "button",
                          {
                            type: "button",
                            class: "ss-link",
                            onClick: w[2] || (w[2] = (G) => $.value = "")
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
                        title: y(U)
                      }, e.toDisplayString(U.wecomUserId && c(U) ? U.wecomUserId : "—"), 9, Ag),
                      e.createElementVNode(
                        "td",
                        jg,
                        e.toDisplayString(U.mobile || "—"),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode("td", Lg, [
                        e.createElementVNode("button", {
                          type: "button",
                          class: "ss-link",
                          "data-test": `mm-org-edit-${U.id}`,
                          onClick: (G) => I(U)
                        }, e.toDisplayString(v.$t("编辑")), 9, zg)
                      ])
                    ],
                    64
                    /* STABLE_FRAGMENT */
                  ))
                ], 8, wg))),
                128
                /* KEYED_FRAGMENT */
              ))
            ])
          ])
        ])
      ])
    ]));
  }
}), Pg = /* @__PURE__ */ le(Fg, [["__scopeId", "data-v-657e223a"]]), Ug = {
  class: "mm-sr",
  "data-test": "mm-roles"
}, Og = { class: "mm-sp__head" }, Rg = {
  key: 0,
  class: "ss-note danger"
}, qg = { class: "mm-sr__cols" }, Kg = { class: "mm-sr__card" }, Hg = { class: "ss-muted" }, Wg = { class: "mm-sr__card" }, Gg = { class: "ss-muted" }, Yg = {
  key: 1,
  class: "ss-note warn"
}, Jg = { class: "ss-actions" }, Qg = ["disabled"], Zg = /* @__PURE__ */ e.defineComponent({
  __name: "SettingsRoles",
  props: {
    settings: {},
    people: {},
    depts: {}
  },
  emits: ["saved"],
  setup(l, { emit: p }) {
    const n = l, u = p, f = Ne.useDialog(), s = se.useNotificationStore(), a = e.ref(!1), m = e.ref(""), i = e.reactive({ adminIds: [], projectCreatorIds: [] }), g = (o, I) => o.length === I.length && o.every((F) => I.includes(F)), b = e.computed(() => !g(i.adminIds, n.settings.adminIds) || !g(i.projectCreatorIds, n.settings.projectCreatorIds)), d = e.computed(() => te.value?.me.person?.id || ""), c = e.computed(() => !!d.value && n.settings.adminIds.includes(d.value) && !i.adminIds.includes(d.value));
    function y() {
      i.adminIds = [...n.settings.adminIds], i.projectCreatorIds = [...n.settings.projectCreatorIds];
    }
    e.watch(() => n.settings, y, { immediate: !0 });
    async function $() {
      if (!(c.value && !await f.confirm({ title: t.t("去掉自己的管理员"), message: t.t("保存后你将无法再进入系统设置，确定吗？"), danger: !0 }))) {
        a.value = !0, m.value = "";
        try {
          const o = await W("settings.save", { patch: { adminIds: i.adminIds, projectCreatorIds: i.projectCreatorIds } });
          s.success(t.t("角色权限已保存")), u("saved", o);
        } catch (o) {
          m.value = X.errorMessage(o);
        } finally {
          a.value = !1;
        }
      }
    }
    return (o, I) => (e.openBlock(), e.createElementBlock("div", Ug, [
      e.createElementVNode("header", Og, [
        e.createElementVNode("div", null, [
          e.createElementVNode(
            "h3",
            null,
            e.toDisplayString(o.$t("角色权限")),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "p",
            null,
            e.toDisplayString(o.$t("菜单对所有人相同，按钮按角色显示。系统级角色只有两类：管理员（系统设置、切换当前身份）和可新建项目的人；项目负责人、主持人、发言人、任务负责人、部门负责人都按项目 / 会议自动产生。")),
            1
            /* TEXT */
          )
        ])
      ]),
      m.value ? (e.openBlock(), e.createElementBlock("p", Rg, [
        I[2] || (I[2] = e.createElementVNode(
          "i",
          { class: "ri-error-warning-line" },
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
      e.createElementVNode("div", qg, [
        e.createElementVNode("section", Kg, [
          e.createElementVNode(
            "h4",
            null,
            e.toDisplayString(o.$t("管理员（{n}）", { n: i.adminIds.length })),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "p",
            Hg,
            e.toDisplayString(o.$t("管理员可以进入系统设置、代办与演示时切换当前身份，也可以新建项目。至少保留一位。")),
            1
            /* TEXT */
          ),
          e.createVNode(je, {
            modelValue: i.adminIds,
            "onUpdate:modelValue": I[0] || (I[0] = (F) => i.adminIds = F),
            people: l.people,
            depts: l.depts,
            "max-height": 260
          }, null, 8, ["modelValue", "people", "depts"])
        ]),
        e.createElementVNode("section", Wg, [
          e.createElementVNode(
            "h4",
            null,
            e.toDisplayString(o.$t("可新建项目的人（{n}）", { n: i.projectCreatorIds.length })),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "p",
            Gg,
            e.toDisplayString(o.$t("除管理员外，还有谁可以新建项目；建项目时指定的项目负责人不需要在这里。")),
            1
            /* TEXT */
          ),
          e.createVNode(je, {
            modelValue: i.projectCreatorIds,
            "onUpdate:modelValue": I[1] || (I[1] = (F) => i.projectCreatorIds = F),
            people: l.people,
            depts: l.depts,
            "max-height": 260
          }, null, 8, ["modelValue", "people", "depts"])
        ])
      ]),
      c.value ? (e.openBlock(), e.createElementBlock("p", Yg, [
        I[3] || (I[3] = e.createElementVNode(
          "i",
          { class: "ri-alert-line" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(o.$t("你把自己从管理员里去掉了：保存后将无法再进入系统设置。")),
          1
          /* TEXT */
        )
      ])) : e.createCommentVNode("v-if", !0),
      e.createElementVNode("div", Jg, [
        e.createElementVNode("button", {
          type: "button",
          class: "ss-btn primary",
          disabled: a.value || !b.value || !i.adminIds.length,
          "data-test": "mm-roles-save",
          onClick: $
        }, [
          e.createElementVNode(
            "i",
            {
              class: e.normalizeClass(a.value ? "ri-loader-4-line spin" : "ri-save-line")
            },
            null,
            2
            /* CLASS */
          ),
          e.createTextVNode(
            e.toDisplayString(o.$t("保存")),
            1
            /* TEXT */
          )
        ], 8, Qg),
        b.value ? (e.openBlock(), e.createElementBlock(
          "button",
          {
            key: 0,
            type: "button",
            class: "ss-link",
            onClick: y
          },
          e.toDisplayString(o.$t("撤销修改")),
          1
          /* TEXT */
        )) : e.createCommentVNode("v-if", !0)
      ])
    ]));
  }
}), Xg = /* @__PURE__ */ le(Zg, [["__scopeId", "data-v-cae13c9f"]]), xg = {
  class: "mm-asr",
  "data-test": "mm-asr"
}, ey = ["aria-label"], ty = ["aria-checked"], ly = ["aria-checked"], ny = {
  key: 0,
  class: "ss-muted"
}, ay = { class: "mm-asr__tag" }, oy = {
  key: 0,
  class: "ss-chip ok",
  "data-test": "mm-asr-best-ready"
}, sy = { class: "mm-asr__facts" }, ry = {
  key: 0,
  class: "ss-note warn mm-asr__why"
}, iy = {
  key: 1,
  class: "mm-asr__act"
}, cy = ["disabled"], dy = { key: 0 }, my = {
  class: "mm-asr__more",
  "data-test": "mm-asr-more"
}, uy = { class: "ss-table-wrap" }, py = { class: "ss-table mm-asr__table" }, vy = { class: "num" }, ky = { class: "num" }, gy = { class: "num" }, yy = { class: "num" }, fy = { class: "num" }, Ey = ["data-test"], Ny = { class: "num" }, Vy = { class: "num" }, $y = { class: "num" }, hy = { class: "num" }, by = { class: "num" }, _y = { class: "mm-asr__cell-act" }, By = {
  key: 0,
  class: "ss-chip ok"
}, Sy = ["disabled", "data-test", "onClick"], Dy = {
  key: 2,
  class: "ss-muted"
}, wy = { class: "ss-muted mm-asr__src" }, Cy = { class: "ss-field mm-asr__pref" }, Ty = { value: "auto" }, Iy = {
  key: 2,
  class: "mm-asr__cloud",
  "data-test": "mm-asr-cloud"
}, My = { class: "ss-field" }, Ay = { value: "dashscope" }, jy = { value: "siliconflow" }, Ly = { value: "custom" }, zy = { class: "ss-field" }, Fy = { class: "ss-field" }, Py = { id: "mm-asr-models" }, Uy = ["value"], Oy = { class: "ss-field" }, Ry = {
  key: 0,
  class: "mm-asr__set"
}, qy = { class: "mm-asr__secret" }, Ky = ["type", "placeholder"], Hy = ["title"], Wy = { class: "ss-note info" }, Gy = { class: "mm-asr__act" }, Yy = ["disabled"], Jy = ["disabled"], Qy = ["disabled"], Zy = {
  key: 3,
  class: "ss-muted mono mm-asr__log",
  "data-test": "mm-asr-log"
}, Xy = {
  key: 4,
  class: "ss-note danger",
  "data-test": "mm-asr-error"
}, xy = /* @__PURE__ */ e.defineComponent({
  __name: "AsrModelPicker",
  emits: ["changed"],
  setup(l, { expose: p, emit: n }) {
    const u = n, f = se.useNotificationStore(), s = e.ref(null), a = e.ref(!1), m = e.ref(!1), i = e.ref(""), g = e.ref(""), b = e.ref(""), d = e.ref(""), c = e.ref("local"), y = e.ref("auto"), $ = e.reactive({ provider: "dashscope", baseUrl: "", model: "", apiKey: "" }), o = e.ref(!1), I = e.ref(""), F = e.ref(!1), P = e.computed(() => s.value?.asr.presets ?? []), L = e.computed(() => P.value.find((N) => N.id === $.provider)), D = e.computed(() => L.value?.models ?? []), C = e.computed(() => L.value?.keyUrl || ""), z = e.computed(() => !!s.value?.models.asrReady), R = e.computed(() => s.value?.recommend.engine === "firered" ? { title: t.t("FireRedASR2（最准）+ SenseVoice 兜底"), desc: t.t("实测最准的本机模型：普通话、各地口音、吴语 / 上海话 / 闽南语 / 粤语和专业名词都明显好于以前的 Whisper。嘈杂片段自动换 SenseVoice 的结果，不会出乱码。") } : { title: t.t("SenseVoice（快速）"), desc: t.t("又快又小：普通话、口音和粤语都认，带标点，比以前的 Whisper 准一倍，1 小时录音一两分钟转完。") }), _ = e.computed(() => {
      const N = s.value?.recommend, S = s.value?.hardware;
      if (!N?.downgradeReason || !S) return "";
      const x = N.downgradeReason === "memory" ? t.t("内存 {n} GB", { n: S.memGb }) : N.downgradeReason === "cores" ? t.t("处理器 {n} 核", { n: S.cores }) : t.t("磁盘只剩 {n} GB", { n: S.freeDiskGb ?? 0 });
      return t.t("最准的 FireRedASR2 需要 16 GB 以上内存、8 核以上处理器和约 1.5 GB 磁盘，这台电脑{why}，所以推荐 SenseVoice。", { why: x });
    }), E = e.computed(() => {
      const N = s.value;
      if (!N) return [];
      const S = N.estimates;
      return [
        { key: "firered", name: "FireRedASR2", note: t.t("最准，含方言"), room: "12.5%", phone: "10.6%", wu: "18.5%", time: S ? t.t("约 {n} 分钟", { n: S.firered }) : "—", size: "1.2 GB", ready: !!N.models.fireRed, installId: "asr-meeting-firered2" },
        { key: "sensevoice", name: "SenseVoice", note: t.t("快、小，也做兜底"), room: "14.3%", phone: "20.3%", wu: "34.5%", time: S ? t.t("约 {n} 分钟", { n: S.sensevoice }) : "—", size: "228 MB", ready: !!N.models.senseVoice, installId: "asr-meeting-sensevoice" },
        { key: "whisper", name: "Whisper large-v3", note: t.t("只在阿拉伯语等其他语种时用"), room: "31.7%", phone: "34.5%", wu: "77.7%", time: t.t("约 16 分钟"), size: "2.9 GB", ready: N.models.asrModel === "large-v3", installId: "" }
      ];
    });
    function v(N) {
      c.value = N.asr.mode, y.value = N.asr.localModel;
      const S = N.asr.cloud, x = S?.provider ?? "dashscope", re = N.asr.presets.find((ce) => ce.id === x);
      Object.assign($, { provider: x, baseUrl: S?.baseUrl ?? re?.baseUrl ?? "", model: S?.model ?? re?.models[0] ?? "", apiKey: "" });
    }
    async function w() {
      a.value = !0;
      try {
        const N = await W("setup.status");
        s.value = N, N && v(N), g.value = "";
      } catch (N) {
        g.value = X.errorMessage(N);
      } finally {
        a.value = !1;
      }
    }
    async function U(N, S) {
      m.value = !0, i.value = N, g.value = "";
      try {
        await S();
      } catch (x) {
        g.value = X.errorMessage(x);
      } finally {
        m.value = !1, i.value = "";
      }
    }
    function G(N) {
      if (I.value = "", N === "cloud") {
        c.value = "cloud";
        return;
      }
      c.value = "local", s.value?.asr.mode !== "local" && k();
    }
    function k() {
      return U("mode", async () => {
        const N = await W("asr.mode.save", { mode: c.value === "cloud" ? "cloud" : "local", localModel: y.value });
        s.value && N && (s.value.asr = N), u("changed");
      });
    }
    function h() {
      const N = L.value;
      $.baseUrl = N?.baseUrl ?? "", $.model = N?.models[0] ?? "", I.value = "";
    }
    function r() {
      return { provider: $.provider, baseUrl: $.baseUrl.trim(), model: $.model.trim(), apiKey: $.apiKey.trim() };
    }
    function H() {
      return I.value = "", U("test", async () => {
        const N = await W("asr.cloud.test", r());
        F.value = !!N?.ok, I.value = N?.ok ? t.t("连接正常（{n} 毫秒），地址、模型和 API Key 都对", { n: N.ms ?? 0 }) : N?.error || t.t("连接失败");
      });
    }
    function Q() {
      return U("save", async () => {
        await W("asr.cloud.save", r());
        const N = await W("asr.mode.save", { mode: "cloud", localModel: y.value });
        s.value && N && (s.value.asr = N), $.apiKey = "", o.value = !1, f.success(t.t("已改为在线接口转写")), u("changed");
      });
    }
    function ne() {
      return window.confirm(t.t("清除在线接口和保存的 API Key？会议转写会改回本机模型。")) ? U("clear", async () => {
        const N = await W("asr.cloud.save", { clear: !0 });
        s.value && N && (s.value.asr = N, v(s.value)), u("changed");
      }) : Promise.resolve();
    }
    async function q() {
      if (o.value) {
        o.value = !1;
        return;
      }
      if (!$.apiKey && s.value?.asr.cloud?.hasKey)
        try {
          $.apiKey = (await W("asr.cloud.reveal"))?.apiKey || "";
        } catch (N) {
          g.value = X.errorMessage(N);
          return;
        }
      o.value = !0;
    }
    function B() {
      const N = window.electronAPI;
      N?.shell?.openExternal ? N.shell.openExternal(C.value) : window.open(C.value, "_blank", "noopener");
    }
    const A = () => window.electronAPI?.pyExt;
    async function K(N) {
      const S = A();
      if (!S?.install) {
        g.value = t.t("组件安装器不可用，请到应用的 设置 → 语音 里下载");
        return;
      }
      g.value = "";
      try {
        for (const x of N) {
          if (x === "asr-meeting-firered2" && s.value?.models.fireRed || x === "asr-meeting-sensevoice" && s.value?.models.senseVoice) continue;
          b.value = x, d.value = t.t("开始下载…");
          const re = await S.install(x);
          if (!re?.ok) {
            g.value = re?.error || t.t("下载失败");
            break;
          }
          await w();
        }
        g.value || (d.value = t.t("下载完成")), u("changed");
      } catch (x) {
        g.value = X.errorMessage(x);
      } finally {
        b.value = "";
      }
    }
    let V = null;
    return e.onMounted(() => {
      w();
      const N = A();
      N?.onInstallProgress && (V = N.onInstallProgress((S) => {
        S?.id && S.id === b.value && S.line && (d.value = String(S.line).slice(0, 200));
      }));
    }), e.onBeforeUnmount(() => {
      try {
        V?.();
      } catch {
      }
    }), p({ reload: w }), (N, S) => (e.openBlock(), e.createElementBlock("section", xg, [
      e.createElementVNode("div", {
        class: "mm-asr__modes",
        role: "radiogroup",
        "aria-label": N.$t("转写方式")
      }, [
        e.createElementVNode("button", {
          type: "button",
          role: "radio",
          "aria-checked": c.value !== "cloud",
          class: e.normalizeClass({ on: c.value !== "cloud" }),
          "data-test": "mm-asr-mode-local",
          onClick: S[0] || (S[0] = (x) => G("local"))
        }, [
          S[9] || (S[9] = e.createElementVNode(
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
              e.toDisplayString(N.$t("本机模型")),
              1
              /* TEXT */
            ),
            e.createElementVNode(
              "small",
              null,
              e.toDisplayString(N.$t("推荐 · 录音不出这台电脑")),
              1
              /* TEXT */
            )
          ])
        ], 10, ty),
        e.createElementVNode("button", {
          type: "button",
          role: "radio",
          "aria-checked": c.value === "cloud",
          class: e.normalizeClass({ on: c.value === "cloud" }),
          "data-test": "mm-asr-mode-cloud",
          onClick: S[1] || (S[1] = (x) => G("cloud"))
        }, [
          S[10] || (S[10] = e.createElementVNode(
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
              e.toDisplayString(N.$t("在线接口")),
              1
              /* TEXT */
            ),
            e.createElementVNode(
              "small",
              null,
              e.toDisplayString(N.$t("填自己的语音识别 API")),
              1
              /* TEXT */
            )
          ])
        ], 10, ly)
      ], 8, ey),
      a.value && !s.value ? (e.openBlock(), e.createElementBlock("p", ny, [
        S[11] || (S[11] = e.createElementVNode(
          "i",
          { class: "ri-loader-4-line spin" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          " " + e.toDisplayString(N.$t("正在检测这台电脑…")),
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
                e.createElementVNode("span", ay, [
                  S[12] || (S[12] = e.createElementVNode(
                    "i",
                    { class: "ri-medal-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(N.$t("为这台电脑推荐")),
                    1
                    /* TEXT */
                  )
                ]),
                z.value ? (e.openBlock(), e.createElementBlock(
                  "span",
                  oy,
                  e.toDisplayString(N.$t("已就绪")),
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
              e.createElementVNode("ul", sy, [
                e.createElementVNode("li", null, [
                  S[13] || (S[13] = e.createElementVNode(
                    "i",
                    { class: "ri-hard-drive-2-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(N.$t("约 {n} MB", { n: s.value.recommend.sizeMb })),
                    1
                    /* TEXT */
                  )
                ]),
                e.createElementVNode("li", null, [
                  S[14] || (S[14] = e.createElementVNode(
                    "i",
                    { class: "ri-timer-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(N.$t("1 小时录音约 {n} 分钟", { n: s.value.recommend.estMinPerHour })),
                    1
                    /* TEXT */
                  )
                ]),
                e.createElementVNode("li", null, [
                  S[15] || (S[15] = e.createElementVNode(
                    "i",
                    { class: "ri-shield-check-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(N.$t("全程在本机")),
                    1
                    /* TEXT */
                  )
                ])
              ]),
              s.value.recommend.downgradeReason ? (e.openBlock(), e.createElementBlock("p", ry, [
                S[16] || (S[16] = e.createElementVNode(
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
              z.value ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock("div", iy, [
                e.createElementVNode("button", {
                  type: "button",
                  class: "ss-btn primary",
                  disabled: !!b.value,
                  "data-test": "mm-asr-best-install",
                  onClick: S[2] || (S[2] = (x) => K(s.value.recommend.installIds))
                }, [
                  e.createElementVNode(
                    "i",
                    {
                      class: e.normalizeClass(b.value ? "ri-loader-4-line spin" : "ri-download-2-line")
                    },
                    null,
                    2
                    /* CLASS */
                  ),
                  e.createTextVNode(
                    e.toDisplayString(N.$t("一键下载")),
                    1
                    /* TEXT */
                  )
                ], 8, cy),
                s.value.recommend.installIds.length > 1 ? (e.openBlock(), e.createElementBlock(
                  "small",
                  dy,
                  e.toDisplayString(N.$t("会依次下载 SenseVoice（嘈杂片段的兜底）和 FireRedASR2")),
                  1
                  /* TEXT */
                )) : e.createCommentVNode("v-if", !0)
              ]))
            ],
            2
            /* CLASS */
          ),
          e.createElementVNode("details", my, [
            e.createElementVNode(
              "summary",
              null,
              e.toDisplayString(N.$t("全部本机模型与实测对比")),
              1
              /* TEXT */
            ),
            e.createElementVNode("div", uy, [
              e.createElementVNode("table", py, [
                e.createElementVNode("thead", null, [
                  e.createElementVNode("tr", null, [
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(N.$t("模型")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      vy,
                      e.toDisplayString(N.$t("会议室录音")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      ky,
                      e.toDisplayString(N.$t("电话音质")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      gy,
                      e.toDisplayString(N.$t("吴语方言")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      yy,
                      e.toDisplayString(N.$t("1 小时耗时")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      fy,
                      e.toDisplayString(N.$t("体积")),
                      1
                      /* TEXT */
                    ),
                    S[17] || (S[17] = e.createElementVNode(
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
                    e.renderList(E.value, (x) => (e.openBlock(), e.createElementBlock("tr", {
                      key: x.key,
                      "data-test": `mm-asr-row-${x.key}`
                    }, [
                      e.createElementVNode("td", null, [
                        e.createElementVNode(
                          "strong",
                          null,
                          e.toDisplayString(x.name),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "small",
                          null,
                          e.toDisplayString(x.note),
                          1
                          /* TEXT */
                        )
                      ]),
                      e.createElementVNode(
                        "td",
                        Ny,
                        e.toDisplayString(x.room),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "td",
                        Vy,
                        e.toDisplayString(x.phone),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "td",
                        $y,
                        e.toDisplayString(x.wu),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "td",
                        hy,
                        e.toDisplayString(x.time),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "td",
                        by,
                        e.toDisplayString(x.size),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode("td", _y, [
                        x.ready ? (e.openBlock(), e.createElementBlock(
                          "span",
                          By,
                          e.toDisplayString(N.$t("已下载")),
                          1
                          /* TEXT */
                        )) : x.installId ? (e.openBlock(), e.createElementBlock("button", {
                          key: 1,
                          type: "button",
                          class: "ss-btn sm",
                          disabled: !!b.value,
                          "data-test": `mm-asr-install-${x.key}`,
                          onClick: (re) => K([x.installId])
                        }, [
                          e.createElementVNode(
                            "i",
                            {
                              class: e.normalizeClass(b.value === x.installId ? "ri-loader-4-line spin" : "ri-download-2-line")
                            },
                            null,
                            2
                            /* CLASS */
                          ),
                          e.createTextVNode(
                            e.toDisplayString(N.$t("下载")),
                            1
                            /* TEXT */
                          )
                        ], 8, Sy)) : (e.openBlock(), e.createElementBlock(
                          "small",
                          Dy,
                          e.toDisplayString(N.$t("在 设置 → 语音 下载")),
                          1
                          /* TEXT */
                        ))
                      ])
                    ], 8, Ey))),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ])
              ])
            ]),
            e.createElementVNode(
              "p",
              wy,
              e.toDisplayString(N.$t("表中是字错率（越低越准），用同一批带标准答案的录音在本机实测；耗时按这台电脑的配置估算。")),
              1
              /* TEXT */
            ),
            e.createElementVNode("label", Cy, [
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(N.$t("转写时用")),
                1
                /* TEXT */
              ),
              e.withDirectives(e.createElementVNode(
                "select",
                {
                  "onUpdate:modelValue": S[3] || (S[3] = (x) => y.value = x),
                  "data-test": "mm-asr-pref",
                  onChange: S[4] || (S[4] = (x) => k())
                },
                [
                  e.createElementVNode(
                    "option",
                    Ty,
                    e.toDisplayString(N.$t("自动（推荐）：装了 FireRedASR2 用它，否则 SenseVoice")),
                    1
                    /* TEXT */
                  ),
                  S[18] || (S[18] = e.createElementVNode(
                    "option",
                    { value: "firered" },
                    "FireRedASR2",
                    -1
                    /* CACHED */
                  )),
                  S[19] || (S[19] = e.createElementVNode(
                    "option",
                    { value: "sensevoice" },
                    "SenseVoice",
                    -1
                    /* CACHED */
                  )),
                  S[20] || (S[20] = e.createElementVNode(
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
                [e.vModelSelect, y.value]
              ])
            ])
          ])
        ],
        64
        /* STABLE_FRAGMENT */
      )) : s.value && c.value === "cloud" ? (e.openBlock(), e.createElementBlock("div", Iy, [
        e.createElementVNode("label", My, [
          e.createElementVNode(
            "span",
            null,
            e.toDisplayString(N.$t("服务商")),
            1
            /* TEXT */
          ),
          e.withDirectives(e.createElementVNode(
            "select",
            {
              "onUpdate:modelValue": S[5] || (S[5] = (x) => $.provider = x),
              "data-test": "mm-asr-cloud-provider",
              onChange: h
            },
            [
              e.createElementVNode(
                "option",
                Ay,
                e.toDisplayString(N.$t("阿里云百炼 · Qwen3-ASR-Flash（方言好）")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "option",
                jy,
                e.toDisplayString(N.$t("硅基流动 · SenseVoice / TeleSpeech 方言")),
                1
                /* TEXT */
              ),
              S[21] || (S[21] = e.createElementVNode(
                "option",
                { value: "openai" },
                "OpenAI",
                -1
                /* CACHED */
              )),
              e.createElementVNode(
                "option",
                Ly,
                e.toDisplayString(N.$t("其他（OpenAI 兼容接口）")),
                1
                /* TEXT */
              )
            ],
            544
            /* NEED_HYDRATION, NEED_PATCH */
          ), [
            [e.vModelSelect, $.provider]
          ])
        ]),
        e.createElementVNode("label", zy, [
          e.createElementVNode(
            "span",
            null,
            e.toDisplayString(N.$t("接口地址")),
            1
            /* TEXT */
          ),
          e.withDirectives(e.createElementVNode(
            "input",
            {
              "onUpdate:modelValue": S[6] || (S[6] = (x) => $.baseUrl = x),
              type: "url",
              spellcheck: "false",
              placeholder: "https://…/v1",
              "data-test": "mm-asr-cloud-url"
            },
            null,
            512
            /* NEED_PATCH */
          ), [
            [e.vModelText, $.baseUrl]
          ])
        ]),
        e.createElementVNode("label", Fy, [
          e.createElementVNode(
            "span",
            null,
            e.toDisplayString(N.$t("模型")),
            1
            /* TEXT */
          ),
          e.withDirectives(e.createElementVNode(
            "input",
            {
              "onUpdate:modelValue": S[7] || (S[7] = (x) => $.model = x),
              type: "text",
              spellcheck: "false",
              list: "mm-asr-models",
              "data-test": "mm-asr-cloud-model"
            },
            null,
            512
            /* NEED_PATCH */
          ), [
            [e.vModelText, $.model]
          ]),
          e.createElementVNode("datalist", Py, [
            (e.openBlock(!0), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(D.value, (x) => (e.openBlock(), e.createElementBlock("option", {
                key: x,
                value: x
              }, null, 8, Uy))),
              128
              /* KEYED_FRAGMENT */
            ))
          ])
        ]),
        e.createElementVNode("label", Oy, [
          e.createElementVNode("span", null, [
            S[22] || (S[22] = e.createTextVNode(
              "API Key ",
              -1
              /* CACHED */
            )),
            s.value.asr.cloud?.hasKey ? (e.openBlock(), e.createElementBlock(
              "em",
              Ry,
              e.toDisplayString(N.$t("已保存")),
              1
              /* TEXT */
            )) : e.createCommentVNode("v-if", !0)
          ]),
          e.createElementVNode("span", qy, [
            e.withDirectives(e.createElementVNode("input", {
              "onUpdate:modelValue": S[8] || (S[8] = (x) => $.apiKey = x),
              type: o.value ? "text" : "password",
              autocomplete: "new-password",
              spellcheck: "false",
              placeholder: s.value.asr.cloud?.hasKey ? N.$t("已保存，点右边的眼睛查看") : N.$t("粘贴 API Key"),
              "data-test": "mm-asr-cloud-key"
            }, null, 8, Ky), [
              [e.vModelDynamic, $.apiKey]
            ]),
            e.createElementVNode("button", {
              type: "button",
              class: "mm-asr__eye",
              title: o.value ? N.$t("隐藏") : N.$t("查看"),
              "data-test": "mm-asr-cloud-eye",
              onClick: q
            }, [
              e.createElementVNode(
                "i",
                {
                  class: e.normalizeClass(o.value ? "ri-eye-off-line" : "ri-eye-line")
                },
                null,
                2
                /* CLASS */
              )
            ], 8, Hy)
          ]),
          C.value ? (e.openBlock(), e.createElementBlock(
            "a",
            {
              key: 0,
              class: "ss-link mm-asr__keylink",
              href: "#",
              onClick: e.withModifiers(B, ["prevent"])
            },
            e.toDisplayString(N.$t("去哪拿 API Key")),
            1
            /* TEXT */
          )) : e.createCommentVNode("v-if", !0)
        ]),
        e.createElementVNode("p", Wy, [
          S[23] || (S[23] = e.createElementVNode(
            "i",
            { class: "ri-information-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            e.toDisplayString(N.$t("选在线接口后，会议录音会按片段（每段不超过 20 秒）上传到这个服务转写，按服务商的价格计费；认人（声纹）仍在本机。API Key 只加密保存在这台电脑。")),
            1
            /* TEXT */
          )
        ]),
        I.value ? (e.openBlock(), e.createElementBlock(
          "p",
          {
            key: 0,
            class: e.normalizeClass(["ss-note", F.value ? "ok" : "danger"]),
            "data-test": "mm-asr-cloud-test-msg"
          },
          [
            e.createElementVNode(
              "i",
              {
                class: e.normalizeClass(F.value ? "ri-checkbox-circle-line" : "ri-error-warning-line")
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
        e.createElementVNode("div", Gy, [
          e.createElementVNode("button", {
            type: "button",
            class: "ss-btn",
            disabled: m.value,
            "data-test": "mm-asr-cloud-test",
            onClick: H
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
              e.toDisplayString(N.$t("测试连接")),
              1
              /* TEXT */
            )
          ], 8, Yy),
          e.createElementVNode("button", {
            type: "button",
            class: "ss-btn primary",
            disabled: m.value || !$.model.trim() || !($.apiKey.trim() || s.value.asr.cloud?.hasKey),
            "data-test": "mm-asr-cloud-save",
            onClick: Q
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
              e.toDisplayString(N.$t("保存并使用")),
              1
              /* TEXT */
            )
          ], 8, Jy),
          s.value.asr.cloud ? (e.openBlock(), e.createElementBlock("button", {
            key: 0,
            type: "button",
            class: "ss-link",
            disabled: m.value,
            "data-test": "mm-asr-cloud-clear",
            onClick: ne
          }, e.toDisplayString(N.$t("清除在线接口")), 9, Qy)) : e.createCommentVNode("v-if", !0)
        ])
      ])) : e.createCommentVNode("v-if", !0),
      d.value ? (e.openBlock(), e.createElementBlock(
        "p",
        Zy,
        e.toDisplayString(d.value),
        1
        /* TEXT */
      )) : e.createCommentVNode("v-if", !0),
      g.value ? (e.openBlock(), e.createElementBlock("p", Xy, [
        S[24] || (S[24] = e.createElementVNode(
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
}), Ut = /* @__PURE__ */ le(xy, [["__scopeId", "data-v-f140c40d"]]), ef = {
  class: "mm-sa",
  "data-test": "mm-ai"
}, tf = { class: "mm-sp__head" }, lf = {
  key: 0,
  class: "ss-note danger"
}, nf = { class: "mm-sa__block" }, af = { class: "ss-muted" }, of = { class: "mm-sa__block" }, sf = { class: "mm-sa__range" }, rf = { class: "ss-muted" }, cf = { class: "mm-sa__block" }, df = { class: "ss-field" }, mf = ["placeholder"], uf = { class: "ss-field" }, pf = ["placeholder"], vf = { class: "ss-field" }, kf = ["placeholder"], gf = { class: "ss-actions" }, yf = ["disabled"], ff = /* @__PURE__ */ e.defineComponent({
  __name: "SettingsAi",
  props: {
    settings: {}
  },
  emits: ["saved"],
  setup(l, { emit: p }) {
    const n = l, u = p, f = se.useNotificationStore(), s = e.ref(!1), a = e.ref(""), m = e.reactive({ voiceprintThreshold: 0.55, planPrompt: "", summaryPrompt: "", organizePrompt: "" });
    function i(c) {
      const y = c.ai ?? { voiceprintThreshold: 0.55 };
      return {
        voiceprintThreshold: Number.isFinite(y.voiceprintThreshold) ? y.voiceprintThreshold : 0.55,
        planPrompt: y.planPrompt ?? "",
        summaryPrompt: y.summaryPrompt ?? "",
        organizePrompt: y.organizePrompt ?? ""
      };
    }
    const g = e.computed(() => JSON.stringify(i(n.settings)) !== JSON.stringify({ ...m, voiceprintThreshold: Number(m.voiceprintThreshold) }));
    function b() {
      Object.assign(m, i(n.settings));
    }
    e.watch(() => n.settings, b, { immediate: !0 });
    async function d() {
      s.value = !0, a.value = "";
      try {
        const c = Math.max(0, Math.min(1, Number(m.voiceprintThreshold) || 0.55)), y = {
          voiceprintThreshold: Math.round(c * 100) / 100,
          // 空串 = 用内置（不用 undefined：JSON 往返会丢字段，主进程深合并时清不掉旧提示词）
          planPrompt: m.planPrompt.trim(),
          summaryPrompt: m.summaryPrompt.trim(),
          organizePrompt: m.organizePrompt.trim()
        }, $ = await W("settings.save", { patch: { ai: y } });
        f.success(t.t("AI 能力配置已保存")), u("saved", $);
      } catch (c) {
        a.value = X.errorMessage(c);
      } finally {
        s.value = !1;
      }
    }
    return (c, y) => (e.openBlock(), e.createElementBlock("div", ef, [
      e.createElementVNode("header", tf, [
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
      a.value ? (e.openBlock(), e.createElementBlock("p", lf, [
        y[4] || (y[4] = e.createElementVNode(
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
      e.createElementVNode("section", nf, [
        e.createElementVNode(
          "h4",
          null,
          e.toDisplayString(c.$t("转写")),
          1
          /* TEXT */
        ),
        e.createVNode(Ut),
        e.createElementVNode(
          "p",
          af,
          e.toDisplayString(c.$t("录音和录屏都按停顿切片后逐段转写；文字记录（txt / docx / srt / vtt 等）跳过转写。")),
          1
          /* TEXT */
        )
      ]),
      e.createElementVNode("section", of, [
        e.createElementVNode(
          "h4",
          null,
          e.toDisplayString(c.$t("声纹识别")),
          1
          /* TEXT */
        ),
        e.createElementVNode("label", sf, [
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
              "onUpdate:modelValue": y[0] || (y[0] = ($) => m.voiceprintThreshold = $),
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
              m.voiceprintThreshold,
              void 0,
              { number: !0 }
            ]
          ]),
          e.createElementVNode(
            "b",
            null,
            e.toDisplayString(Number(m.voiceprintThreshold).toFixed(2)),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode(
          "p",
          rf,
          e.toDisplayString(c.$t("只和本场参会人的声纹比对；低于下限的发言人留给主持人试听后指认。调高更严（指认更多），调低更松（可能认错）。默认 0.55。")),
          1
          /* TEXT */
        )
      ]),
      e.createElementVNode("section", cf, [
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
        e.createElementVNode("label", df, [
          e.createElementVNode(
            "span",
            null,
            e.toDisplayString(c.$t("纪要整理（按议题 / 时间线整理、识别决议、3 行摘要）")),
            1
            /* TEXT */
          ),
          e.withDirectives(e.createElementVNode("textarea", {
            "onUpdate:modelValue": y[1] || (y[1] = ($) => m.organizePrompt = $),
            rows: "4",
            placeholder: c.$t("留空使用内置")
          }, null, 8, mf), [
            [e.vModelText, m.organizePrompt]
          ])
        ]),
        e.createElementVNode("label", uf, [
          e.createElementVNode(
            "span",
            null,
            e.toDisplayString(c.$t("执行方案（从决议拆任务：每项一个责任部门、执行事项、交付标准、建议完成时间）")),
            1
            /* TEXT */
          ),
          e.withDirectives(e.createElementVNode("textarea", {
            "onUpdate:modelValue": y[2] || (y[2] = ($) => m.planPrompt = $),
            rows: "4",
            placeholder: c.$t("留空使用内置")
          }, null, 8, pf), [
            [e.vModelText, m.planPrompt]
          ])
        ]),
        e.createElementVNode("label", vf, [
          e.createElementVNode(
            "span",
            null,
            e.toDisplayString(c.$t("项目总结（概况、关键决策、任务完成情况、变更与裁决记录）")),
            1
            /* TEXT */
          ),
          e.withDirectives(e.createElementVNode("textarea", {
            "onUpdate:modelValue": y[3] || (y[3] = ($) => m.summaryPrompt = $),
            rows: "4",
            placeholder: c.$t("留空使用内置")
          }, null, 8, kf), [
            [e.vModelText, m.summaryPrompt]
          ])
        ])
      ]),
      e.createElementVNode("div", gf, [
        e.createElementVNode("button", {
          type: "button",
          class: "ss-btn primary",
          disabled: s.value || !g.value,
          "data-test": "mm-ai-save",
          onClick: d
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
        ], 8, yf),
        g.value ? (e.openBlock(), e.createElementBlock(
          "button",
          {
            key: 0,
            type: "button",
            class: "ss-link",
            onClick: b
          },
          e.toDisplayString(c.$t("撤销修改")),
          1
          /* TEXT */
        )) : e.createCommentVNode("v-if", !0)
      ])
    ]));
  }
}), Ef = /* @__PURE__ */ le(ff, [["__scopeId", "data-v-4bd27b96"]]), Nf = {
  class: "mm-pf",
  "data-test": "mm-push-failed"
}, Vf = { class: "mm-pf__head" }, $f = ["disabled", "title"], hf = { class: "ss-muted" }, bf = {
  key: 1,
  class: "ss-note danger"
}, _f = {
  key: 2,
  class: "mm-pf__empty"
}, Bf = {
  key: 3,
  class: "ss-table-wrap"
}, Sf = { class: "ss-table" }, Df = { class: "num" }, wf = ["data-test"], Cf = { class: "nowrap" }, Tf = { class: "nowrap" }, If = { class: "mm-pf__err" }, Mf = { class: "num" }, Af = ["disabled", "data-test", "onClick"], jf = {
  key: 4,
  class: "ss-muted"
}, Lf = /* @__PURE__ */ e.defineComponent({
  __name: "PushFailedList",
  setup(l) {
    const p = e.ref([]), n = e.ref(0), u = e.ref(!1), f = e.ref(""), s = e.ref(""), a = e.ref(null), m = e.computed(() => !!te.value?.pushChannel || !!te.value?.wecomConnected);
    async function i() {
      try {
        const d = await W("notice.push.failed");
        p.value = d?.items ?? [], n.value = d?.total ?? 0, s.value = "";
      } catch (d) {
        s.value = X.errorMessage(d);
      } finally {
        u.value = !0;
      }
    }
    async function g(d) {
      f.value = d || "all", s.value = "", a.value = null;
      try {
        a.value = await W("notice.push.retry", d ? { ids: [d] } : { all: !0 }), await Promise.all([i(), ie().catch(() => null)]);
      } catch (c) {
        s.value = X.errorMessage(c);
      } finally {
        f.value = "";
      }
    }
    let b = null;
    return e.onMounted(() => {
      i(), b = _e((d) => {
        d.type === "changed" && d.scope === "notice" && !f.value && i();
      });
    }), e.onBeforeUnmount(() => b?.()), (d, c) => (e.openBlock(), e.createElementBlock("section", Nf, [
      e.createElementVNode("div", Vf, [
        e.createElementVNode("h4", null, [
          e.createTextVNode(
            e.toDisplayString(d.$t("推送失败记录")) + " ",
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "small",
            null,
            e.toDisplayString(d.$t("{n} 条", { n: n.value })),
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
          disabled: !!f.value || !m.value,
          title: m.value ? "" : d.$t("先配置并连接企业微信"),
          "data-test": "mm-push-retry-all",
          onClick: c[0] || (c[0] = (y) => g())
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
            e.toDisplayString(d.$t("全部重发")),
            1
            /* TEXT */
          )
        ], 8, $f)) : e.createCommentVNode("v-if", !0)
      ]),
      e.createElementVNode(
        "p",
        hf,
        e.toDisplayString(d.$t("企微卡片没发出去的通知（系统内消息中心照常有）。常见原因：手机页服务没开、接收人不在企微应用可见范围。处理好原因后再重发。")),
        1
        /* TEXT */
      ),
      a.value ? (e.openBlock(), e.createElementBlock(
        "p",
        {
          key: 0,
          class: e.normalizeClass(["ss-note", a.value.failed ? "danger" : "ok"]),
          "data-test": "mm-push-result"
        },
        [
          e.createElementVNode(
            "i",
            {
              class: e.normalizeClass(a.value.failed ? "ri-error-warning-line" : "ri-checkbox-circle-line")
            },
            null,
            2
            /* CLASS */
          ),
          e.createTextVNode(
            e.toDisplayString(d.$t("重发成功 {a} 条，仍失败 {b} 条", { a: a.value.sent, b: a.value.failed })),
            1
            /* TEXT */
          )
        ],
        2
        /* CLASS */
      )) : e.createCommentVNode("v-if", !0),
      s.value ? (e.openBlock(), e.createElementBlock("p", bf, [
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
      !p.value.length && u.value ? (e.openBlock(), e.createElementBlock(
        "p",
        _f,
        e.toDisplayString(d.$t("没有发送失败的通知")),
        1
        /* TEXT */
      )) : p.value.length ? (e.openBlock(), e.createElementBlock("div", Bf, [
        e.createElementVNode("table", Sf, [
          e.createElementVNode("thead", null, [
            e.createElementVNode("tr", null, [
              e.createElementVNode(
                "th",
                null,
                e.toDisplayString(d.$t("时间")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "th",
                null,
                e.toDisplayString(d.$t("接收人")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "th",
                null,
                e.toDisplayString(d.$t("通知")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "th",
                null,
                e.toDisplayString(d.$t("失败原因")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "th",
                Df,
                e.toDisplayString(d.$t("操作")),
                1
                /* TEXT */
              )
            ])
          ]),
          e.createElementVNode("tbody", null, [
            (e.openBlock(!0), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(p.value, (y) => (e.openBlock(), e.createElementBlock("tr", {
                key: y.id,
                "data-test": `mm-push-row-${y.id}`
              }, [
                e.createElementVNode(
                  "td",
                  Cf,
                  e.toDisplayString(e.unref(Ee)(y.at)),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "td",
                  Tf,
                  e.toDisplayString(y.toName),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "td",
                  null,
                  e.toDisplayString(y.title),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "td",
                  If,
                  e.toDisplayString(y.error),
                  1
                  /* TEXT */
                ),
                e.createElementVNode("td", Mf, [
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-link",
                    disabled: !!f.value || !m.value,
                    "data-test": `mm-push-retry-${y.id}`,
                    onClick: ($) => g(y.id)
                  }, e.toDisplayString(f.value === y.id ? d.$t("发送中…") : d.$t("重发")), 9, Af)
                ])
              ], 8, wf))),
              128
              /* KEYED_FRAGMENT */
            ))
          ])
        ])
      ])) : e.createCommentVNode("v-if", !0),
      n.value > p.value.length ? (e.openBlock(), e.createElementBlock(
        "small",
        jf,
        e.toDisplayString(d.$t("只列出最近 {n} 条", { n: p.value.length })),
        1
        /* TEXT */
      )) : e.createCommentVNode("v-if", !0)
    ]));
  }
}), zf = /* @__PURE__ */ le(Lf, [["__scopeId", "data-v-f0a4a0e3"]]), Ff = {
  class: "mm-sw",
  "data-test": "mm-wecom"
}, Pf = { class: "mm-sp__head" }, Uf = {
  key: 0,
  class: "ss-note danger"
}, Of = { class: "mm-sw__form" }, Rf = { class: "ss-grid" }, qf = { class: "ss-field" }, Kf = { class: "ss-field" }, Hf = { class: "ss-field" }, Wf = {
  key: 0,
  class: "mm-sw__set"
}, Gf = { class: "mm-sw__secret" }, Yf = ["type", "placeholder"], Jf = ["title", "disabled"], Qf = { class: "ss-field" }, Zf = ["placeholder"], Xf = { class: "ss-muted" }, xf = { class: "ss-actions" }, e1 = ["disabled"], t1 = ["disabled"], l1 = {
  class: "mm-sw__form",
  "data-test": "mm-webhook"
}, n1 = { class: "mm-sw__h" }, a1 = { class: "mm-sw__steps" }, o1 = { class: "ss-field" }, s1 = {
  key: 0,
  class: "mm-sw__set",
  "data-test": "mm-webhook-set"
}, r1 = ["placeholder"], i1 = { class: "ss-muted" }, c1 = { class: "ss-actions" }, d1 = ["disabled"], m1 = ["disabled"], u1 = ["disabled"], p1 = { class: "mm-sw__events" }, v1 = { class: "ss-table-wrap" }, k1 = { class: "ss-table" }, g1 = { class: "num" }, y1 = { class: "wrap" }, f1 = { class: "wrap" }, E1 = { class: "ss-muted" }, N1 = /* @__PURE__ */ e.defineComponent({
  __name: "SettingsWecom",
  props: {
    settings: {}
  },
  emits: ["saved"],
  setup(l, { emit: p }) {
    const n = l, u = p, f = t.t("标题 + 摘要 + 按钮"), s = [
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
    ], a = Ne.useDialog(), m = se.useNotificationStore(), i = e.ref(!1), g = e.ref(""), b = e.ref(""), d = e.ref(null), c = e.reactive({ corpId: "", agentId: "", secret: "", cardBaseUrl: "" }), y = e.computed(() => !!te.value?.wecomConnected), $ = e.computed(() => te.value?.pushChannel ?? (y.value ? "app" : null)), o = e.ref(""), I = e.ref(!1);
    async function F() {
      if (!I.value && !c.secret && n.settings.wecom.hasSecret)
        try {
          const w = await W("wecom.secret.reveal");
          c.secret = w?.secret || "";
        } catch (w) {
          b.value = X.errorMessage(w);
          return;
        }
      I.value = !I.value;
    }
    const P = e.ref(null), L = e.computed(() => !c.corpId.trim() && !c.agentId.trim()), D = e.computed(() => L.value ? !!(n.settings.wecom.corpId || n.settings.wecom.agentId || n.settings.wecom.hasSecret) : !!c.corpId.trim() && !!c.agentId.trim() && (n.settings.wecom.hasSecret || !!c.secret));
    e.watch(() => n.settings.wecom, (w) => {
      Object.assign(c, { corpId: w?.corpId ?? "", agentId: w?.agentId ?? "", secret: c.secret, cardBaseUrl: w?.cardBaseUrl ?? "" });
    }, { immediate: !0 });
    async function C() {
      if (!(L.value && !await a.confirm({
        title: t.t("断开企微"),
        message: t.t("清空企微配置后，通讯录不再从企微同步，通知只进系统内消息中心。确定吗？"),
        danger: !0
      }))) {
        i.value = !0, g.value = "save", b.value = "", d.value = null;
        try {
          const w = { corpId: c.corpId.trim(), agentId: c.agentId.trim(), cardBaseUrl: c.cardBaseUrl.trim() };
          c.secret && (w.secret = c.secret), await W("wecom.save", w), L.value && (c.secret = "", I.value = !1), m.success(L.value ? t.t("已断开企微") : t.t("企微配置已保存")), u("saved"), await ie().catch(() => null);
        } catch (w) {
          b.value = X.errorMessage(w);
        } finally {
          i.value = !1, g.value = "";
        }
      }
    }
    async function z(w, U) {
      i.value = !0, g.value = w, b.value = "", P.value = null;
      try {
        await U();
      } catch (G) {
        P.value = { ok: !1, error: X.errorMessage(G) };
      } finally {
        i.value = !1, g.value = "";
      }
    }
    function R() {
      return z("hook", async () => {
        await W("wecom.webhook.save", { url: o.value.trim() }), o.value = "", m.success(t.t("群机器人已保存")), u("saved"), await ie().catch(() => null);
      });
    }
    function _() {
      return z("hookTest", async () => {
        const w = await W("wecom.webhook.test");
        P.value = { ok: !!w?.ok, error: w?.error };
      });
    }
    async function E() {
      await a.confirm({ title: t.t("移除群机器人"), message: t.t("移除后通知不再发到企微群（自建应用照常）。确定吗？"), danger: !0 }) && await z("hook", async () => {
        await W("wecom.webhook.save", { url: "" }), m.success(t.t("已移除群机器人")), u("saved"), await ie().catch(() => null);
      });
    }
    async function v() {
      i.value = !0, g.value = "test", b.value = "", d.value = null;
      try {
        const w = await W("wecom.test");
        d.value = { ok: !!w?.ok, error: w?.error }, await ie().catch(() => null);
      } catch (w) {
        d.value = { ok: !1, error: X.errorMessage(w) };
      } finally {
        i.value = !1, g.value = "";
      }
    }
    return (w, U) => (e.openBlock(), e.createElementBlock("div", Ff, [
      e.createElementVNode("header", Pf, [
        e.createElementVNode("div", null, [
          e.createElementVNode(
            "h3",
            null,
            e.toDisplayString(w.$t("消息推送")),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "p",
            null,
            e.toDisplayString(w.$t("配置企业微信自建应用后，通讯录真实同步、14 类通知以卡片推到企微；没配置时用演示组织，通知只进系统内消息中心。卡片只放标题、摘要和按钮，长文在系统内看。")),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "p",
            null,
            e.toDisplayString(w.$t("配不了自建应用（要 CorpID、Secret 和企业可信 IP）时，可以只配一个「企微群机器人」：通知发到一个企微群里并点名提醒相关的人，见下方。")),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode(
          "span",
          {
            class: e.normalizeClass(["ss-chip", $.value ? "ok" : "warn"]),
            "data-test": "mm-wecom-state"
          },
          e.toDisplayString($.value === "app" ? w.$t("企微已连接") : $.value === "webhook" ? w.$t("群机器人已连接") : w.$t("未连接企微")),
          3
          /* TEXT, CLASS */
        )
      ]),
      b.value ? (e.openBlock(), e.createElementBlock("p", Uf, [
        U[5] || (U[5] = e.createElementVNode(
          "i",
          { class: "ri-error-warning-line" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(b.value),
          1
          /* TEXT */
        )
      ])) : e.createCommentVNode("v-if", !0),
      d.value ? (e.openBlock(), e.createElementBlock(
        "p",
        {
          key: 1,
          class: e.normalizeClass(["ss-note", d.value.ok ? "ok" : "danger"]),
          "data-test": "mm-wecom-test-result"
        },
        [
          e.createElementVNode(
            "i",
            {
              class: e.normalizeClass(d.value.ok ? "ri-checkbox-circle-line" : "ri-error-warning-line")
            },
            null,
            2
            /* CLASS */
          ),
          e.createTextVNode(
            e.toDisplayString(d.value.ok ? w.$t("连接正常") : d.value.error || w.$t("连接失败")),
            1
            /* TEXT */
          )
        ],
        2
        /* CLASS */
      )) : e.createCommentVNode("v-if", !0),
      e.createElementVNode("section", Of, [
        e.createElementVNode("div", Rf, [
          e.createElementVNode("label", qf, [
            U[6] || (U[6] = e.createElementVNode(
              "span",
              null,
              "CorpID",
              -1
              /* CACHED */
            )),
            e.withDirectives(e.createElementVNode(
              "input",
              {
                "onUpdate:modelValue": U[0] || (U[0] = (G) => c.corpId = G),
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
          e.createElementVNode("label", Kf, [
            U[7] || (U[7] = e.createElementVNode(
              "span",
              null,
              "AgentID",
              -1
              /* CACHED */
            )),
            e.withDirectives(e.createElementVNode(
              "input",
              {
                "onUpdate:modelValue": U[1] || (U[1] = (G) => c.agentId = G),
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
          e.createElementVNode("label", Hf, [
            e.createElementVNode("span", null, [
              U[8] || (U[8] = e.createTextVNode(
                "Secret ",
                -1
                /* CACHED */
              )),
              l.settings.wecom.hasSecret ? (e.openBlock(), e.createElementBlock(
                "em",
                Wf,
                e.toDisplayString(w.$t("已配置")),
                1
                /* TEXT */
              )) : e.createCommentVNode("v-if", !0)
            ]),
            e.createElementVNode("span", Gf, [
              e.withDirectives(e.createElementVNode("input", {
                "onUpdate:modelValue": U[2] || (U[2] = (G) => c.secret = G),
                type: I.value ? "text" : "password",
                autocomplete: "new-password",
                spellcheck: "false",
                placeholder: l.settings.wecom.hasSecret ? w.$t("已保存，点右边的眼睛查看") : w.$t("应用的 Secret"),
                "data-test": "mm-wecom-secret"
              }, null, 8, Yf), [
                [e.vModelDynamic, c.secret]
              ]),
              e.createElementVNode("button", {
                type: "button",
                class: "mm-sw__eye",
                title: I.value ? w.$t("隐藏") : w.$t("查看"),
                disabled: i.value,
                "data-test": "mm-wecom-secret-eye",
                onClick: F
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
              ], 8, Jf)
            ])
          ])
        ]),
        e.createElementVNode("label", Qf, [
          e.createElementVNode(
            "span",
            null,
            e.toDisplayString(w.$t("卡片跳转地址前缀")),
            1
            /* TEXT */
          ),
          e.withDirectives(e.createElementVNode("input", {
            "onUpdate:modelValue": U[3] || (U[3] = (G) => c.cardBaseUrl = G),
            type: "url",
            placeholder: w.$t("留空 = 用手机页服务的局域网地址，如 http://192.168.1.10:8260"),
            spellcheck: "false",
            "data-test": "mm-wecom-base"
          }, null, 8, Zf), [
            [e.vModelText, c.cardBaseUrl]
          ])
        ]),
        e.createElementVNode(
          "p",
          Xf,
          e.toDisplayString(w.$t("Secret 只保存在本机（系统加密存储），不会显示出来。卡片按钮会跳到「前缀 + 每人专属链接」，员工手机要能访问这个地址（同一局域网或可信域名）。CorpID 和 AgentID 都清空后保存 = 断开企微。")),
          1
          /* TEXT */
        ),
        e.createElementVNode("div", xf, [
          e.createElementVNode("button", {
            type: "button",
            class: "ss-btn primary",
            disabled: i.value || !D.value,
            "data-test": "mm-wecom-save",
            onClick: C
          }, [
            e.createElementVNode(
              "i",
              {
                class: e.normalizeClass(i.value && g.value === "save" ? "ri-loader-4-line spin" : "ri-save-line")
              },
              null,
              2
              /* CLASS */
            ),
            e.createTextVNode(
              e.toDisplayString(w.$t("保存")),
              1
              /* TEXT */
            )
          ], 8, e1),
          e.createElementVNode("button", {
            type: "button",
            class: "ss-btn",
            disabled: i.value || !l.settings.wecom.hasSecret && !y.value,
            "data-test": "mm-wecom-test",
            onClick: v
          }, [
            e.createElementVNode(
              "i",
              {
                class: e.normalizeClass(i.value && g.value === "test" ? "ri-loader-4-line spin" : "ri-plug-line")
              },
              null,
              2
              /* CLASS */
            ),
            e.createTextVNode(
              e.toDisplayString(w.$t("测试连接")),
              1
              /* TEXT */
            )
          ], 8, t1)
        ])
      ]),
      e.createElementVNode("section", l1, [
        e.createElementVNode("h4", n1, [
          e.createTextVNode(
            e.toDisplayString(w.$t("企微群机器人")) + " ",
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "small",
            null,
            e.toDisplayString(w.$t("没有自建应用时用：通知发到一个企微群里，并点名提醒要处理的人")),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode("ol", a1, [
          e.createElementVNode(
            "li",
            null,
            e.toDisplayString(w.$t("在企业微信里打开要接收通知的内部群，点右上角「…」")),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "li",
            null,
            e.toDisplayString(w.$t("选「消息推送」（旧版叫「群机器人」）→「添加」→ 新建一个，名字可以叫「会议助手」")),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "li",
            null,
            e.toDisplayString(w.$t("复制生成的 Webhook 地址，粘贴到下面保存，再点「测试发送」看群里有没有收到")),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode("label", o1, [
          e.createElementVNode("span", null, [
            e.createTextVNode(
              e.toDisplayString(w.$t("Webhook 地址")) + " ",
              1
              /* TEXT */
            ),
            l.settings.wecom.hasWebhook ? (e.openBlock(), e.createElementBlock(
              "em",
              s1,
              e.toDisplayString(w.$t("已配置")) + " " + e.toDisplayString(l.settings.wecom.webhookMasked),
              1
              /* TEXT */
            )) : e.createCommentVNode("v-if", !0)
          ]),
          e.withDirectives(e.createElementVNode("input", {
            "onUpdate:modelValue": U[4] || (U[4] = (G) => o.value = G),
            type: "password",
            autocomplete: "off",
            spellcheck: "false",
            placeholder: l.settings.wecom.hasWebhook ? w.$t("已配置，要换地址再粘贴") : "https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=…",
            "data-test": "mm-webhook-url"
          }, null, 8, r1), [
            [e.vModelText, o.value]
          ])
        ]),
        e.createElementVNode(
          "p",
          i1,
          e.toDisplayString(w.$t("地址里的 key 等于发消息的凭据，只保存在本机（系统加密存储），不会显示出来。配了自建应用时通知发给个人，群机器人不再发。群消息里的按钮不带个人令牌：手机上打开过自己专属链接的人点了能直接进入。每个机器人每分钟最多发 20 条，同一事件的几个人合成一条。")),
          1
          /* TEXT */
        ),
        P.value ? (e.openBlock(), e.createElementBlock(
          "p",
          {
            key: 0,
            class: e.normalizeClass(["ss-note", P.value.ok ? "ok" : "danger"]),
            "data-test": "mm-webhook-result"
          },
          [
            e.createElementVNode(
              "i",
              {
                class: e.normalizeClass(P.value.ok ? "ri-checkbox-circle-line" : "ri-error-warning-line")
              },
              null,
              2
              /* CLASS */
            ),
            e.createTextVNode(
              e.toDisplayString(P.value.ok ? w.$t("已发到群里，请到企微群里看一眼") : P.value.error || w.$t("发送失败")),
              1
              /* TEXT */
            )
          ],
          2
          /* CLASS */
        )) : e.createCommentVNode("v-if", !0),
        e.createElementVNode("div", c1, [
          e.createElementVNode("button", {
            type: "button",
            class: "ss-btn primary",
            disabled: i.value || !o.value.trim(),
            "data-test": "mm-webhook-save",
            onClick: R
          }, [
            e.createElementVNode(
              "i",
              {
                class: e.normalizeClass(i.value && g.value === "hook" ? "ri-loader-4-line spin" : "ri-save-line")
              },
              null,
              2
              /* CLASS */
            ),
            e.createTextVNode(
              e.toDisplayString(w.$t("保存")),
              1
              /* TEXT */
            )
          ], 8, d1),
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
                class: e.normalizeClass(i.value && g.value === "hookTest" ? "ri-loader-4-line spin" : "ri-send-plane-line")
              },
              null,
              2
              /* CLASS */
            ),
            e.createTextVNode(
              e.toDisplayString(w.$t("测试发送")),
              1
              /* TEXT */
            )
          ], 8, m1),
          l.settings.wecom.hasWebhook ? (e.openBlock(), e.createElementBlock("button", {
            key: 0,
            type: "button",
            class: "ss-btn",
            disabled: i.value,
            "data-test": "mm-webhook-remove",
            onClick: E
          }, [
            U[9] || (U[9] = e.createElementVNode(
              "i",
              { class: "ri-delete-bin-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(w.$t("移除")),
              1
              /* TEXT */
            )
          ], 8, u1)) : e.createCommentVNode("v-if", !0)
        ])
      ]),
      e.createVNode(zf),
      e.createElementVNode("section", p1, [
        e.createElementVNode("h4", null, [
          e.createTextVNode(
            e.toDisplayString(w.$t("14 类通知")) + " ",
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "small",
            null,
            e.toDisplayString(w.$t("只发提醒，不改任何状态")),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode("div", v1, [
          e.createElementVNode("table", k1, [
            e.createElementVNode("thead", null, [
              e.createElementVNode("tr", null, [
                U[10] || (U[10] = e.createElementVNode(
                  "th",
                  null,
                  "#",
                  -1
                  /* CACHED */
                )),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(w.$t("事件")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(w.$t("接收人")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(w.$t("卡片内容")),
                  1
                  /* TEXT */
                )
              ])
            ]),
            e.createElementVNode("tbody", null, [
              (e.openBlock(), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(s, (G, k) => e.createElementVNode("tr", { key: k }, [
                  e.createElementVNode(
                    "td",
                    g1,
                    e.toDisplayString(k + 1),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "td",
                    null,
                    e.toDisplayString(G.event),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "td",
                    y1,
                    e.toDisplayString(G.to),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "td",
                    f1,
                    e.toDisplayString(G.card),
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
          E1,
          e.toDisplayString(w.$t("提醒周期（发言确认超时、到期提前、进度跟踪、周报）在「参数设置」里改。")),
          1
          /* TEXT */
        )
      ])
    ]));
  }
}), V1 = /* @__PURE__ */ le(N1, [["__scopeId", "data-v-5aefcb1e"]]), $1 = {
  adminIds: [],
  projectCreatorIds: [],
  confirmTimeoutHours: 24,
  dueRemindDays: 1,
  trackCycleDays: 7,
  reportCycleDays: 7,
  wecom: { corpId: "", agentId: "", hasSecret: !1 },
  // 声纹认人门槛：2026-11-16 用真实 67 分钟会议录音实测，同一会议室不同人之间余弦最高 0.53、本人 0.67~0.77，取 0.55
  ai: { asr: "local", voiceprintThreshold: 0.55 }
}, h1 = {
  class: "mm-spa",
  "data-test": "mm-params"
}, b1 = { class: "mm-sp__head" }, _1 = {
  key: 0,
  class: "ss-note danger"
}, B1 = { class: "mm-spa__list" }, S1 = { class: "mm-spa__num" }, D1 = ["onUpdate:modelValue", "min", "max", "aria-label", "data-test"], w1 = {
  key: 1,
  class: "ss-note warn"
}, C1 = { class: "ss-actions" }, T1 = ["disabled"], I1 = /* @__PURE__ */ e.defineComponent({
  __name: "SettingsParams",
  props: {
    settings: {}
  },
  emits: ["saved"],
  setup(l, { emit: p }) {
    const n = [
      { key: "confirmTimeoutHours", title: t.t("发言确认超时"), hint: t.t("发言人超过这么久没确认，就催办一次（不改状态）"), unit: t.t("小时"), min: 1, max: 720 },
      { key: "dueRemindDays", title: t.t("到期提前提醒"), hint: t.t("任务截止前几天提醒部门负责人"), unit: t.t("天"), min: 0, max: 30 },
      { key: "trackCycleDays", title: t.t("进度跟踪周期"), hint: t.t("多久提醒部门负责人更新一次进度"), unit: t.t("天"), min: 1, max: 90 },
      { key: "reportCycleDays", title: t.t("周报周期"), hint: t.t("多久给任务负责人和项目负责人发一份进度汇总报告"), unit: t.t("天"), min: 1, max: 90 }
    ], u = l, f = p, s = se.useNotificationStore(), a = e.ref(!1), m = e.ref(""), i = e.reactive({ confirmTimeoutHours: 24, dueRemindDays: 1, trackCycleDays: 7, reportCycleDays: 7 }), g = e.computed(() => n.some(($) => Number(i[$.key]) !== u.settings[$.key])), b = e.computed(() => {
      for (const $ of n) {
        const o = Number(i[$.key]);
        if (!Number.isInteger(o) || o < $.min || o > $.max) return t.t("「{t}」要填 {a}～{b} 之间的整数", { t: $.title, a: $.min, b: $.max });
      }
      return "";
    });
    function d() {
      for (const $ of n) i[$.key] = u.settings[$.key];
    }
    function c() {
      for (const $ of n) i[$.key] = $1[$.key];
    }
    e.watch(() => u.settings, d, { immediate: !0 });
    async function y() {
      a.value = !0, m.value = "";
      try {
        const $ = Object.fromEntries(n.map((I) => [I.key, Number(i[I.key])])), o = await W("settings.save", { patch: $ });
        s.success(t.t("参数已保存")), f("saved", o);
      } catch ($) {
        m.value = X.errorMessage($);
      } finally {
        a.value = !1;
      }
    }
    return ($, o) => (e.openBlock(), e.createElementBlock("div", h1, [
      e.createElementVNode("header", b1, [
        e.createElementVNode("div", null, [
          e.createElementVNode(
            "h3",
            null,
            e.toDisplayString($.$t("参数设置")),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "p",
            null,
            e.toDisplayString($.$t("催办与提醒周期。提醒只推消息，不改任何状态；逾期是任务上的标记，不是状态。")),
            1
            /* TEXT */
          )
        ])
      ]),
      m.value ? (e.openBlock(), e.createElementBlock("p", _1, [
        o[0] || (o[0] = e.createElementVNode(
          "i",
          { class: "ri-error-warning-line" },
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
      e.createElementVNode("ul", B1, [
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
            e.createElementVNode("label", S1, [
              e.withDirectives(e.createElementVNode("input", {
                "onUpdate:modelValue": (F) => i[I.key] = F,
                type: "number",
                min: I.min,
                max: I.max,
                step: "1",
                "aria-label": I.title,
                "data-test": `mm-param-${I.key}`
              }, null, 8, D1), [
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
      b.value ? (e.openBlock(), e.createElementBlock("p", w1, [
        o[1] || (o[1] = e.createElementVNode(
          "i",
          { class: "ri-alert-line" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(b.value),
          1
          /* TEXT */
        )
      ])) : e.createCommentVNode("v-if", !0),
      e.createElementVNode("div", C1, [
        e.createElementVNode("button", {
          type: "button",
          class: "ss-btn primary",
          disabled: a.value || !g.value || !!b.value,
          "data-test": "mm-params-save",
          onClick: y
        }, [
          e.createElementVNode(
            "i",
            {
              class: e.normalizeClass(a.value ? "ri-loader-4-line spin" : "ri-save-line")
            },
            null,
            2
            /* CLASS */
          ),
          e.createTextVNode(
            e.toDisplayString($.$t("保存")),
            1
            /* TEXT */
          )
        ], 8, T1),
        g.value ? (e.openBlock(), e.createElementBlock(
          "button",
          {
            key: 0,
            type: "button",
            class: "ss-link",
            onClick: d
          },
          e.toDisplayString($.$t("撤销修改")),
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
          e.toDisplayString($.$t("恢复默认")),
          1
          /* TEXT */
        )
      ])
    ]));
  }
}), M1 = /* @__PURE__ */ le(I1, [["__scopeId", "data-v-ae3507ae"]]), A1 = {
  class: "mm-sm",
  "data-test": "mm-mobile-settings"
}, j1 = { class: "mm-sp__head" }, L1 = {
  key: 0,
  class: "ss-note danger"
}, z1 = { class: "mm-sm__svc" }, F1 = { class: "mm-sm__addr" }, P1 = {
  key: 0,
  class: "mono"
}, U1 = {
  key: 1,
  class: "muted"
}, O1 = { class: "ss-muted" }, R1 = { class: "mm-sm__tools" }, q1 = { class: "mm-sm__qr" }, K1 = { class: "mm-search" }, H1 = ["placeholder", "aria-label"], W1 = { class: "ss-table-wrap" }, G1 = { class: "ss-table" }, Y1 = { class: "num" }, J1 = { key: 0 }, Q1 = {
  colspan: "4",
  class: "mm-sm__empty"
}, Z1 = { class: "mm-sm__link" }, X1 = { class: "mono" }, x1 = ["src", "alt"], eE = {
  key: 1,
  class: "ss-muted"
}, tE = { class: "num" }, lE = ["disabled", "title", "data-test", "onClick"], nE = ["disabled", "data-test", "onClick"], aE = { class: "mm-sm__foot" }, oE = ["aria-label"], sE = ["disabled", "aria-label"], rE = ["onClick"], iE = ["disabled", "aria-label"], cE = /* @__PURE__ */ e.defineComponent({
  __name: "SettingsMobile",
  props: {
    people: {},
    depts: {}
  },
  setup(l) {
    const p = l, n = Ne.useDialog(), u = se.useNotificationStore(), f = e.ref({ running: !!te.value?.mobile.running, url: te.value?.mobile.url }), s = e.ref(""), a = e.ref(""), m = e.ref(""), i = e.ref(1), g = e.ref(!1), b = e.reactive({}), d = e.reactive({}), c = (D) => p.depts.find((C) => C.id === D)?.name || "", y = e.computed(() => p.people.filter((D) => !D.left && mt(D, c(D.deptId), m.value))), $ = e.computed(() => At(y.value, i.value, 10));
    e.watch(m, () => {
      i.value = 1;
    });
    async function o() {
      try {
        const D = await W("mobile.status");
        D && (f.value = { running: !!D.running, url: D.url });
      } catch (D) {
        a.value = X.errorMessage(D);
      }
    }
    async function I(D) {
      !b[D] || d[D] || (d[D] = await Tt.toDataURL(b[D], { margin: 1, width: 240 }).catch(() => ""));
    }
    async function F(D) {
      s.value = D.id, a.value = "";
      try {
        if (!b[D.id]) {
          const C = Ge(await W("mobile.link", { personId: D.id }));
          if (!C) throw new Error(t.t("没拿到专属链接，请确认手机页服务已开启"));
          b[D.id] = C;
        }
        g.value && await I(D.id), await Ye(b[D.id]) && u.success(t.t("已复制 {name} 的专属链接", { name: D.name }));
      } catch (C) {
        a.value = X.errorMessage(C);
      } finally {
        s.value = "";
      }
    }
    async function P(D) {
      if (await n.confirm({
        title: t.t("重置专属链接"),
        message: t.t("重置后 {name} 的旧链接立即失效（包括已发出的企微卡片按钮），需要把新链接重新发给本人。确定吗？", { name: D.name }),
        danger: !0,
        confirmLabel: t.t("重置")
      })) {
        s.value = D.id, a.value = "";
        try {
          const z = Ge(await W("mobile.link", { personId: D.id, reset: !0 }));
          if (!z) throw new Error(t.t("没拿到专属链接，请确认手机页服务已开启"));
          b[D.id] = z, delete d[D.id], g.value && await I(D.id), u.success(t.t("已重置 {name} 的专属链接", { name: D.name }));
        } catch (z) {
          a.value = X.errorMessage(z);
        } finally {
          s.value = "";
        }
      }
    }
    e.watch(g, (D) => {
      D && Object.keys(b).forEach((C) => {
        I(C);
      });
    });
    let L = null;
    return e.onMounted(() => {
      o(), L = _e((D) => {
        D.type === "mobile" && (f.value = { running: D.running, url: D.url }, D.running || (Object.keys(b).forEach((C) => delete b[C]), Object.keys(d).forEach((C) => delete d[C])));
      });
    }), e.onBeforeUnmount(() => L?.()), (D, C) => (e.openBlock(), e.createElementBlock("div", A1, [
      e.createElementVNode("header", j1, [
        e.createElementVNode("div", null, [
          e.createElementVNode(
            "h3",
            null,
            e.toDisplayString(D.$t("手机端")),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "p",
            null,
            e.toDisplayString(D.$t("在本机开一个手机页服务，同一局域网里的手机用浏览器打开。每个人一个带令牌的专属链接（等同企微免登），功能与电脑端一致，另有声纹采集页；企微卡片的按钮也跳到这里。")),
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
          e.toDisplayString(f.value.running ? D.$t("运行中") : D.$t("未开启")),
          3
          /* TEXT, CLASS */
        )
      ]),
      a.value ? (e.openBlock(), e.createElementBlock("p", L1, [
        C[5] || (C[5] = e.createElementVNode(
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
      e.createElementVNode("section", z1, [
        e.createElementVNode("div", F1, [
          e.createElementVNode(
            "small",
            null,
            e.toDisplayString(D.$t("局域网地址")),
            1
            /* TEXT */
          ),
          f.value.running && f.value.url ? (e.openBlock(), e.createElementBlock(
            "b",
            P1,
            e.toDisplayString(f.value.url),
            1
            /* TEXT */
          )) : (e.openBlock(), e.createElementBlock(
            "b",
            U1,
            e.toDisplayString(D.$t("服务未开启")),
            1
            /* TEXT */
          ))
        ]),
        e.createElementVNode("button", {
          type: "button",
          class: "ss-btn",
          "data-test": "mm-mobile-goto-home",
          onClick: C[0] || (C[0] = (z) => e.unref(he)("home"))
        }, [
          C[6] || (C[6] = e.createElementVNode(
            "i",
            { class: "ri-home-4-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            e.toDisplayString(D.$t("到首页开关服务、扫码")),
            1
            /* TEXT */
          )
        ])
      ]),
      e.createElementVNode(
        "p",
        O1,
        e.toDisplayString(D.$t("专属链接只发给本人，泄露了可以让管理员重置。")),
        1
        /* TEXT */
      ),
      e.createElementVNode("div", R1, [
        e.createElementVNode(
          "h4",
          null,
          e.toDisplayString(D.$t("每人专属链接")),
          1
          /* TEXT */
        ),
        C[8] || (C[8] = e.createElementVNode(
          "span",
          { class: "grow" },
          null,
          -1
          /* CACHED */
        )),
        e.createElementVNode("label", q1, [
          e.withDirectives(e.createElementVNode(
            "input",
            {
              "onUpdate:modelValue": C[1] || (C[1] = (z) => g.value = z),
              type: "checkbox",
              "data-test": "mm-mobile-qr"
            },
            null,
            512
            /* NEED_PATCH */
          ), [
            [e.vModelCheckbox, g.value]
          ]),
          e.createTextVNode(
            e.toDisplayString(D.$t("同时显示二维码")),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode("label", K1, [
          C[7] || (C[7] = e.createElementVNode(
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
            "onUpdate:modelValue": C[2] || (C[2] = (z) => m.value = z),
            type: "search",
            placeholder: D.$t("搜索员工"),
            "aria-label": D.$t("搜索员工")
          }, null, 8, H1), [
            [e.vModelText, m.value]
          ])
        ])
      ]),
      e.createElementVNode("div", W1, [
        e.createElementVNode("table", G1, [
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
                e.toDisplayString(D.$t("专属链接")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "th",
                Y1,
                e.toDisplayString(D.$t("操作")),
                1
                /* TEXT */
              )
            ])
          ]),
          e.createElementVNode("tbody", null, [
            $.value.rows.length ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock("tr", J1, [
              e.createElementVNode(
                "td",
                Q1,
                e.toDisplayString(D.$t("没有符合条件的员工")),
                1
                /* TEXT */
              )
            ])),
            (e.openBlock(!0), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList($.value.rows, (z) => (e.openBlock(), e.createElementBlock("tr", {
                key: z.id
              }, [
                e.createElementVNode("td", null, [
                  e.createVNode(Ae, {
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
                e.createElementVNode("td", Z1, [
                  b[z.id] ? (e.openBlock(), e.createElementBlock(
                    e.Fragment,
                    { key: 0 },
                    [
                      e.createElementVNode(
                        "span",
                        X1,
                        e.toDisplayString(b[z.id]),
                        1
                        /* TEXT */
                      ),
                      g.value && d[z.id] ? (e.openBlock(), e.createElementBlock("img", {
                        key: 0,
                        src: d[z.id],
                        alt: D.$t("{name} 的专属链接二维码", { name: z.name }),
                        width: "120",
                        height: "120"
                      }, null, 8, x1)) : e.createCommentVNode("v-if", !0)
                    ],
                    64
                    /* STABLE_FRAGMENT */
                  )) : (e.openBlock(), e.createElementBlock("span", eE, "—"))
                ]),
                e.createElementVNode("td", tE, [
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-link",
                    disabled: !f.value.running || s.value === z.id,
                    title: f.value.running ? "" : D.$t("先开启手机页服务"),
                    "data-test": `mm-mobile-link-${z.id}`,
                    onClick: (R) => F(z)
                  }, e.toDisplayString(b[z.id] ? D.$t("复制链接") : D.$t("生成并复制")), 9, lE),
                  b[z.id] ? (e.openBlock(), e.createElementBlock(
                    e.Fragment,
                    { key: 0 },
                    [
                      C[9] || (C[9] = e.createElementVNode(
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
                        onClick: (R) => P(z)
                      }, e.toDisplayString(D.$t("重置")), 9, nE)
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
      e.createElementVNode("footer", aE, [
        e.createElementVNode(
          "span",
          null,
          e.toDisplayString(D.$t("共 {n} 人", { n: y.value.length })),
          1
          /* TEXT */
        ),
        C[12] || (C[12] = e.createElementVNode(
          "span",
          { class: "grow" },
          null,
          -1
          /* CACHED */
        )),
        $.value.pages > 1 ? (e.openBlock(), e.createElementBlock("nav", {
          key: 0,
          class: "mm-pager",
          "aria-label": D.$t("分页")
        }, [
          e.createElementVNode("button", {
            type: "button",
            disabled: $.value.page <= 1,
            "aria-label": D.$t("上一页"),
            onClick: C[3] || (C[3] = (z) => i.value = $.value.page - 1)
          }, [...C[10] || (C[10] = [
            e.createElementVNode(
              "i",
              { class: "ri-arrow-left-s-line" },
              null,
              -1
              /* CACHED */
            )
          ])], 8, sE),
          (e.openBlock(!0), e.createElementBlock(
            e.Fragment,
            null,
            e.renderList($.value.pages, (z) => (e.openBlock(), e.createElementBlock("button", {
              key: z,
              type: "button",
              class: e.normalizeClass({ on: z === $.value.page }),
              onClick: (R) => i.value = z
            }, e.toDisplayString(z), 11, rE))),
            128
            /* KEYED_FRAGMENT */
          )),
          e.createElementVNode("button", {
            type: "button",
            disabled: $.value.page >= $.value.pages,
            "aria-label": D.$t("下一页"),
            onClick: C[4] || (C[4] = (z) => i.value = $.value.page + 1)
          }, [...C[11] || (C[11] = [
            e.createElementVNode(
              "i",
              { class: "ri-arrow-right-s-line" },
              null,
              -1
              /* CACHED */
            )
          ])], 8, iE)
        ], 8, oE)) : e.createCommentVNode("v-if", !0)
      ])
    ]));
  }
}), dE = /* @__PURE__ */ le(cE, [["__scopeId", "data-v-d5d7ac31"]]), mE = {
  class: "mm-sd",
  "data-test": "mm-demo"
}, uE = { class: "mm-sp__head" }, pE = {
  key: 0,
  class: "ss-note danger"
}, vE = { class: "ss-note warn" }, kE = { class: "mm-sd__cards" }, gE = { class: "mm-sd__card" }, yE = ["disabled"], fE = { class: "mm-sd__card" }, EE = ["disabled"], NE = /* @__PURE__ */ e.defineComponent({
  __name: "SettingsDemo",
  emits: ["changed"],
  setup(l, { emit: p }) {
    const n = p, u = Ne.useDialog(), f = se.useNotificationStore(), s = e.ref(!1), a = e.ref(""), m = e.ref("");
    async function i(d, c) {
      s.value = !0, a.value = d, m.value = "";
      try {
        await W(d === "load" ? "demo.load" : "demo.clear"), await ie().catch(() => null), f.success(c), n("changed");
      } catch (y) {
        m.value = X.errorMessage(y);
      } finally {
        s.value = !1, a.value = "";
      }
    }
    async function g() {
      await u.confirm({
        title: t.t("载入演示数据"),
        message: t.t("载入演示组织和示例项目？工作台里已有正式数据时，请先确认不会和演示数据混在一起。"),
        confirmLabel: t.t("载入")
      }) && await i("load", t.t("演示数据已载入"));
    }
    async function b() {
      await u.confirm({
        title: t.t("清空数据"),
        message: t.t("删除全部项目、会议（含上传的文件）、任务和通知，不能撤销；组织、声纹与系统设置保留。确定清空吗？"),
        confirmLabel: t.t("清空"),
        danger: !0
      }) && await i("clear", t.t("数据已清空"));
    }
    return (d, c) => (e.openBlock(), e.createElementBlock("div", mE, [
      e.createElementVNode("header", uE, [
        e.createElementVNode("div", null, [
          e.createElementVNode(
            "h3",
            null,
            e.toDisplayString(d.$t("演示数据")),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "p",
            null,
            e.toDisplayString(d.$t("一键载入演示组织（20 人、6 个部门）和 3 个项目，以及若干会议、任务、异议，与原型同名，用来演示完整闭环或培训；也可以一键清空。")),
            1
            /* TEXT */
          )
        ])
      ]),
      m.value ? (e.openBlock(), e.createElementBlock("p", pE, [
        c[0] || (c[0] = e.createElementVNode(
          "i",
          { class: "ri-error-warning-line" },
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
      e.createElementVNode("p", vE, [
        c[1] || (c[1] = e.createElementVNode(
          "i",
          { class: "ri-alert-line" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(d.$t("演示数据和正式数据在同一个工作台里。正式使用前请先清空演示数据；清空不能撤销。")),
          1
          /* TEXT */
        )
      ]),
      e.createElementVNode("div", kE, [
        e.createElementVNode("section", gE, [
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
              e.toDisplayString(d.$t("载入演示数据")),
              1
              /* TEXT */
            ),
            e.createElementVNode(
              "small",
              null,
              e.toDisplayString(d.$t("载入后右上角「当前身份」可以切到任意演示人员，看每个角色的按钮")),
              1
              /* TEXT */
            )
          ]),
          e.createElementVNode("button", {
            type: "button",
            class: "ss-btn primary",
            disabled: s.value,
            "data-test": "mm-demo-load",
            onClick: g
          }, [
            e.createElementVNode(
              "i",
              {
                class: e.normalizeClass(s.value && a.value === "load" ? "ri-loader-4-line spin" : "ri-download-2-line")
              },
              null,
              2
              /* CLASS */
            ),
            e.createTextVNode(
              e.toDisplayString(d.$t("载入")),
              1
              /* TEXT */
            )
          ], 8, yE)
        ]),
        e.createElementVNode("section", fE, [
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
              e.toDisplayString(d.$t("清空数据")),
              1
              /* TEXT */
            ),
            e.createElementVNode(
              "small",
              null,
              e.toDisplayString(d.$t("删除全部项目、会议（含上传的文件）、任务和通知；组织、声纹与系统设置保留")),
              1
              /* TEXT */
            )
          ]),
          e.createElementVNode("button", {
            type: "button",
            class: "ss-btn danger",
            disabled: s.value,
            "data-test": "mm-demo-clear",
            onClick: b
          }, [
            e.createElementVNode(
              "i",
              {
                class: e.normalizeClass(s.value && a.value === "clear" ? "ri-loader-4-line spin" : "ri-delete-bin-line")
              },
              null,
              2
              /* CLASS */
            ),
            e.createTextVNode(
              e.toDisplayString(d.$t("清空")),
              1
              /* TEXT */
            )
          ], 8, EE)
        ])
      ])
    ]));
  }
}), VE = /* @__PURE__ */ le(NE, [["__scopeId", "data-v-2c906f2d"]]), $E = {
  class: "mm-settings",
  "data-test": "mm-settings-tab"
}, hE = { class: "mm-pagehead" }, bE = {
  key: 0,
  class: "ss-empty",
  "data-test": "mm-settings-denied"
}, _E = {
  key: 1,
  class: "mm-settings__grid"
}, BE = ["aria-label"], SE = ["aria-current", "data-test", "onClick"], DE = { class: "mm-settings__panel" }, wE = {
  key: 0,
  class: "ss-note danger"
}, CE = {
  key: 1,
  class: "ss-muted"
}, TE = /* @__PURE__ */ e.defineComponent({
  __name: "SettingsTab",
  setup(l, { expose: p }) {
    const n = [
      { key: "voiceprint", title: t.t("声纹库"), sub: t.t("采集链接与采集情况") },
      { key: "org", title: t.t("通讯录同步"), sub: t.t("企微部门与成员") },
      { key: "roles", title: t.t("角色权限"), sub: t.t("管理员与可创建项目人员") },
      { key: "ai", title: t.t("AI 能力配置"), sub: t.t("转写、声纹、方案、总结") },
      { key: "wecom", title: t.t("消息推送"), sub: t.t("14 类企微通知") },
      { key: "params", title: t.t("参数设置"), sub: t.t("催办与提醒周期") },
      { key: "mobile", title: t.t("手机端"), sub: t.t("手机页服务与专属链接") },
      { key: "demo", title: t.t("演示数据"), sub: t.t("载入或清空演示组织与项目") }
    ], u = e.ref("voiceprint");
    e.watch(xe, (P) => {
      P && n.some((L) => L.key === P) && (u.value = P), P && (xe.value = "");
    }, { immediate: !0 });
    const f = e.ref(null), s = e.ref([]), a = e.ref([]), m = e.ref(0), i = e.ref(""), g = e.computed(() => !!te.value?.me.isAdmin);
    async function b() {
      try {
        f.value = await W("settings.get"), i.value = "";
      } catch (P) {
        i.value = X.errorMessage(P);
      }
    }
    async function d() {
      try {
        const P = await W("people.list");
        s.value = P?.people ?? [], a.value = P?.depts ?? [];
      } catch (P) {
        i.value = X.errorMessage(P);
      }
    }
    let c = 0;
    async function y() {
      c = Date.now(), m.value += 1, await Promise.all([b(), d(), ie().catch(() => null)]);
    }
    async function $(P) {
      P && typeof P == "object" && "adminIds" in P ? f.value = P : await b(), await ie().catch(() => null);
    }
    let o = null, I = null;
    e.onMounted(() => {
      g.value && y(), I = _e((P) => {
        P.type !== "changed" || !["all", "org", "settings"].includes(P.scope) || (o && clearTimeout(o), o = setTimeout(() => {
          o = null, g.value && y();
        }, 300));
      });
    }), e.watch(g, (P) => {
      P && !f.value && y();
    });
    function F() {
      o || !g.value || Date.now() - c < 800 || (o = setTimeout(() => {
        o = null, y();
      }, 300));
    }
    return p({ refresh: F }), e.onBeforeUnmount(() => {
      I?.(), o && clearTimeout(o);
    }), (P, L) => (e.openBlock(), e.createElementBlock("div", $E, [
      e.createElementVNode("header", hE, [
        e.createElementVNode(
          "h2",
          null,
          e.toDisplayString(P.$t("系统设置")),
          1
          /* TEXT */
        ),
        e.createElementVNode(
          "p",
          null,
          e.toDisplayString(P.$t("仅管理员可见")),
          1
          /* TEXT */
        )
      ]),
      g.value ? (e.openBlock(), e.createElementBlock("div", _E, [
        e.createElementVNode("nav", {
          class: "mm-smenu",
          "aria-label": P.$t("设置项")
        }, [
          (e.openBlock(), e.createElementBlock(
            e.Fragment,
            null,
            e.renderList(n, (D) => e.createElementVNode("button", {
              key: D.key,
              type: "button",
              class: e.normalizeClass({ on: u.value === D.key }),
              "aria-current": u.value === D.key ? "page" : void 0,
              "data-test": `mm-settings-menu-${D.key}`,
              onClick: (C) => u.value = D.key
            }, [
              e.createElementVNode(
                "strong",
                null,
                e.toDisplayString(D.title),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "small",
                null,
                e.toDisplayString(D.sub),
                1
                /* TEXT */
              )
            ], 10, SE)),
            64
            /* STABLE_FRAGMENT */
          ))
        ], 8, BE),
        e.createElementVNode("section", DE, [
          i.value ? (e.openBlock(), e.createElementBlock("p", wE, [
            L[0] || (L[0] = e.createElementVNode(
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
            CE,
            e.toDisplayString(P.$t("加载中…")),
            1
            /* TEXT */
          )) : f.value ? (e.openBlock(), e.createElementBlock(
            e.Fragment,
            { key: 2 },
            [
              u.value === "voiceprint" ? (e.openBlock(), e.createBlock(ng, {
                key: 0,
                people: s.value,
                depts: a.value,
                "refresh-seq": m.value
              }, null, 8, ["people", "depts", "refresh-seq"])) : u.value === "org" ? (e.openBlock(), e.createBlock(Pg, {
                key: 1,
                people: s.value,
                depts: a.value,
                onChanged: y
              }, null, 8, ["people", "depts"])) : u.value === "roles" ? (e.openBlock(), e.createBlock(Xg, {
                key: 2,
                settings: f.value,
                people: s.value,
                depts: a.value,
                onSaved: $
              }, null, 8, ["settings", "people", "depts"])) : u.value === "ai" ? (e.openBlock(), e.createBlock(Ef, {
                key: 3,
                settings: f.value,
                onSaved: $
              }, null, 8, ["settings"])) : u.value === "wecom" ? (e.openBlock(), e.createBlock(V1, {
                key: 4,
                settings: f.value,
                onSaved: $
              }, null, 8, ["settings"])) : u.value === "params" ? (e.openBlock(), e.createBlock(M1, {
                key: 5,
                settings: f.value,
                onSaved: $
              }, null, 8, ["settings"])) : u.value === "mobile" ? (e.openBlock(), e.createBlock(dE, {
                key: 6,
                people: s.value,
                depts: a.value
              }, null, 8, ["people", "depts"])) : (e.openBlock(), e.createBlock(VE, {
                key: 7,
                onChanged: y
              }))
            ],
            64
            /* STABLE_FRAGMENT */
          )) : e.createCommentVNode("v-if", !0)
        ])
      ])) : (e.openBlock(), e.createElementBlock(
        "p",
        bE,
        e.toDisplayString(P.$t("只有管理员可以查看和修改系统设置。如需调整，请联系管理员。")),
        1
        /* TEXT */
      ))
    ]));
  }
}), IE = /* @__PURE__ */ le(TE, [["__scopeId", "data-v-0fcda9a3"]]), ME = {
  class: "mm-rec",
  "data-test": "mm-rec"
}, AE = { class: "mm-rec__tip" }, jE = {
  class: "mm-rec__script",
  "data-test": "mm-rec-script"
}, LE = { class: "mm-rec__bar" }, zE = ["disabled"], FE = {
  key: 0,
  class: "mm-rec__dot"
}, PE = { class: "mm-rec__meter" }, UE = {
  key: 0,
  class: "ss-note warn"
}, OE = ["src"], RE = {
  key: 2,
  class: "ss-note danger",
  "data-test": "mm-rec-error"
}, ht = 10, qE = 15, KE = /* @__PURE__ */ e.defineComponent({
  __name: "VoiceRecorder",
  props: {
    script: {},
    disabled: { type: Boolean }
  },
  emits: ["recorded", "reset"],
  setup(l, { emit: p }) {
    const n = p, u = e.ref("idle"), f = e.ref(0), s = e.ref(0), a = e.ref(""), m = e.ref("");
    let i = null, g = null, b = [], d = null, c = 0, y = null, $ = 0;
    function o() {
      d && (clearInterval(d), d = null), c && (cancelAnimationFrame(c), c = 0);
      try {
        i?.getTracks().forEach((D) => D.stop());
      } catch {
      }
      i = null;
      try {
        y?.close();
      } catch {
      }
      y = null, s.value = 0;
    }
    function I() {
      for (const D of ["audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus", "audio/mp4"])
        try {
          if (typeof MediaRecorder < "u" && MediaRecorder.isTypeSupported(D)) return D;
        } catch {
        }
      return "";
    }
    async function F() {
      a.value = "", m.value && (URL.revokeObjectURL(m.value), m.value = ""), n("reset");
      try {
        i = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: !0, noiseSuppression: !1, autoGainControl: !0 } });
      } catch (C) {
        a.value = C?.name === "NotAllowedError" ? t.t("没有麦克风权限：请在系统设置 → 隐私与安全性 → 麦克风里允许本应用，或改用「导入录音文件」") : t.t("打不开麦克风：{p0}", { p0: C?.message || "-" }), o();
        return;
      }
      const D = I();
      try {
        g = D ? new MediaRecorder(i, { mimeType: D }) : new MediaRecorder(i);
      } catch (C) {
        a.value = t.t("这台电脑不支持录音：{p0}", { p0: C?.message || "-" }), o();
        return;
      }
      b = [], g.ondataavailable = (C) => {
        C.data && C.data.size && b.push(C.data);
      }, g.onstop = () => void L(g?.mimeType || D);
      try {
        y = new AudioContext();
        const C = y.createAnalyser();
        C.fftSize = 1024, y.createMediaStreamSource(i).connect(C);
        const z = new Uint8Array(C.fftSize), R = () => {
          C.getByteTimeDomainData(z);
          let _ = 0;
          for (const E of z) _ = Math.max(_, Math.abs(E - 128));
          s.value = Math.min(100, Math.round(_ / 128 * 140)), c = requestAnimationFrame(R);
        };
        R();
      } catch {
      }
      $ = Date.now(), f.value = 0, u.value = "recording", g.start(250), d = setInterval(() => {
        f.value = Math.floor((Date.now() - $) / 1e3), f.value >= qE && P();
      }, 200);
    }
    function P() {
      g && g.state !== "inactive" && g.stop(), d && (clearInterval(d), d = null);
    }
    async function L(D) {
      const C = Math.round((Date.now() - $) / 100) / 10;
      o(), u.value = "done", f.value = Math.round(C);
      const z = new Blob(b, { type: D || "audio/webm" });
      if (!z.size) {
        a.value = t.t("没有录到声音，请重录");
        return;
      }
      m.value = URL.createObjectURL(z);
      const R = new Uint8Array(await z.arrayBuffer());
      let _ = "";
      for (let v = 0; v < R.length; v += 32768) _ += String.fromCharCode(...R.subarray(v, v + 32768));
      const E = /ogg/.test(D) ? "ogg" : /mp4/.test(D) ? "m4a" : "webm";
      n("recorded", { data: btoa(_), ext: E, seconds: C });
    }
    return e.onBeforeUnmount(() => {
      try {
        g && g.state !== "inactive" && g.stop();
      } catch {
      }
      o(), m.value && URL.revokeObjectURL(m.value);
    }), (D, C) => (e.openBlock(), e.createElementBlock("div", ME, [
      e.createElementVNode(
        "p",
        AE,
        e.toDisplayString(D.$t("请在安静的地方，用平时开会说话的音量和语速，朗读下面这段话：")),
        1
        /* TEXT */
      ),
      e.createElementVNode(
        "blockquote",
        jE,
        e.toDisplayString(l.script),
        1
        /* TEXT */
      ),
      e.createElementVNode("div", LE, [
        u.value !== "recording" ? (e.openBlock(), e.createElementBlock("button", {
          key: 0,
          type: "button",
          class: e.normalizeClass(["ss-btn", u.value === "idle" ? "primary" : ""]),
          disabled: l.disabled,
          "data-test": "mm-rec-start",
          onClick: F
        }, [
          C[0] || (C[0] = e.createElementVNode(
            "i",
            { class: "ri-mic-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            e.toDisplayString(u.value === "idle" ? D.$t("开始录音") : D.$t("重录")),
            1
            /* TEXT */
          )
        ], 10, zE)) : (e.openBlock(), e.createElementBlock("button", {
          key: 1,
          type: "button",
          class: "ss-btn danger",
          "data-test": "mm-rec-stop",
          onClick: P
        }, [
          C[1] || (C[1] = e.createElementVNode(
            "i",
            { class: "ri-stop-circle-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            e.toDisplayString(D.$t("停止录音")),
            1
            /* TEXT */
          )
        ])),
        e.createElementVNode(
          "span",
          {
            class: e.normalizeClass(["mm-rec__time", { live: u.value === "recording", short: f.value > 0 && f.value < ht && u.value !== "recording" }])
          },
          [
            u.value === "recording" ? (e.openBlock(), e.createElementBlock("i", FE)) : e.createCommentVNode("v-if", !0),
            e.createTextVNode(
              e.toDisplayString(D.$t("{s} 秒", { s: f.value })),
              1
              /* TEXT */
            )
          ],
          2
          /* CLASS */
        ),
        e.createElementVNode("i", PE, [
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
      u.value === "done" && f.value < ht ? (e.openBlock(), e.createElementBlock("p", UE, [
        C[2] || (C[2] = e.createElementVNode(
          "i",
          { class: "ri-alert-line" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(D.$t("录音不足 10 秒，建议重录")),
          1
          /* TEXT */
        )
      ])) : e.createCommentVNode("v-if", !0),
      m.value ? (e.openBlock(), e.createElementBlock("audio", {
        key: 1,
        src: m.value,
        controls: "",
        class: "mm-rec__audio",
        "data-test": "mm-rec-preview"
      }, null, 8, OE)) : e.createCommentVNode("v-if", !0),
      a.value ? (e.openBlock(), e.createElementBlock("p", RE, [
        C[3] || (C[3] = e.createElementVNode(
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
      ])) : e.createCommentVNode("v-if", !0)
    ]));
  }
}), HE = /* @__PURE__ */ le(KE, [["__scopeId", "data-v-f9d93abd"]]), WE = ["aria-label"], GE = { class: "mm-sw2" }, YE = { class: "mm-sw2__head" }, JE = { class: "mm-sw2__title" }, QE = {
  class: "mm-sw2__progress",
  "data-test": "mm-setup-progress"
}, ZE = { class: "mm-bar" }, XE = { class: "mm-sw2__body" }, xE = ["aria-label"], eN = ["data-test", "onClick"], tN = { class: "mm-sw2__num" }, lN = {
  key: 0,
  class: "ri-check-line"
}, nN = { class: "mm-sw2__stxt" }, aN = { class: "mm-sw2__panel" }, oN = {
  key: 0,
  class: "mm-sw2__step",
  "data-test": "mm-setup-identity"
}, sN = { class: "ss-muted" }, rN = ["placeholder"], iN = { class: "mm-sw2__people" }, cN = ["disabled", "data-test", "onClick"], dN = {
  key: 0,
  class: "ss-muted"
}, mN = {
  key: 0,
  class: "ss-note danger"
}, uN = {
  key: 0,
  class: "ss-note danger"
}, pN = {
  key: 1,
  class: "ss-note"
}, vN = {
  key: 0,
  class: "mm-sw2__step",
  "data-test": "mm-setup-models"
}, kN = { class: "ss-muted" }, gN = {
  class: "mm-sw2__hw",
  "data-test": "mm-setup-hw"
}, yN = { class: "mm-sw2__items" }, fN = {
  key: 0,
  class: "ss-chip ok",
  "data-test": "mm-setup-spk-ok"
}, EN = ["disabled"], NN = {
  key: 0,
  class: "ss-muted mono mm-sw2__log",
  "data-test": "mm-setup-install-log"
}, VN = {
  key: 1,
  class: "ss-note danger"
}, $N = {
  class: "mm-sw2__step",
  "data-test": "mm-setup-org"
}, hN = { class: "ss-muted" }, bN = {
  class: "ss-note info",
  "data-test": "mm-setup-org-now"
}, _N = { class: "mm-sw2__opts" }, BN = ["disabled"], SN = ["disabled"], DN = { class: "mm-sw2__form" }, wN = { class: "mm-sw2__secret" }, CN = ["type", "placeholder"], TN = ["title", "disabled"], IN = ["disabled"], MN = {
  class: "mm-sw2__guide",
  "data-test": "mm-setup-app-guide"
}, AN = { class: "mm-sw2__ol" }, jN = {
  key: 0,
  class: "ss-note warn mm-sw2__ip",
  "data-test": "mm-setup-egress-ip"
}, LN = { class: "mono" }, zN = {
  class: "mm-sw2__step",
  "data-test": "mm-setup-push"
}, FN = { class: "ss-muted" }, PN = { class: "mm-sw2__box" }, UN = { class: "mm-sw2__ol" }, ON = { class: "mm-sw2__row" }, RN = ["placeholder"], qN = ["disabled"], KN = ["disabled"], HN = { class: "mm-sw2__box" }, WN = {
  class: "ss-muted",
  "data-test": "mm-setup-mentionable"
}, GN = { class: "mm-sw2__row" }, YN = { class: "mm-sw2__who" }, JN = ["placeholder"], QN = ["disabled"], ZN = { class: "ss-muted" }, XN = {
  class: "mm-sw2__step",
  "data-test": "mm-setup-mobile-step"
}, xN = { class: "ss-muted" }, eV = {
  class: "mm-sw2__step",
  "data-test": "mm-setup-voice"
}, tV = { class: "ss-muted" }, lV = {
  key: 0,
  class: "ss-note warn"
}, nV = { class: "mm-sw2__consent" }, aV = { class: "mm-sw2__row" }, oV = ["disabled"], sV = ["disabled"], rV = {
  class: "mm-sw2__step",
  "data-test": "mm-setup-ai"
}, iV = { class: "ss-muted" }, cV = ["disabled"], dV = {
  class: "mm-sw2__step",
  "data-test": "mm-setup-finish"
}, mV = { class: "mm-sw2__sum" }, uV = ["onClick"], pV = { class: "ss-muted" }, vV = {
  key: 7,
  class: "ss-note danger",
  "data-test": "mm-setup-error"
}, kV = { class: "mm-sw2__foot" }, gV = ["disabled"], yV = ["disabled"], fV = /* @__PURE__ */ e.defineComponent({
  __name: "SetupWizard",
  emits: ["close", "done"],
  setup(l, { emit: p }) {
    const n = [
      { key: "models", title: t.t("电脑配置与语音模型") },
      { key: "org", title: t.t("组织架构") },
      { key: "push", title: t.t("通知推送") },
      { key: "mobile", title: t.t("手机端") },
      { key: "voice", title: t.t("采集你的声纹") },
      { key: "ai", title: t.t("大模型") }
    ], u = [...n.map((M) => M.key), "finish"], f = p, s = e.ref(null), a = e.ref("models"), m = e.computed(() => u.indexOf(a.value)), i = e.reactive(/* @__PURE__ */ new Set()), g = e.ref(""), b = e.ref(""), d = e.ref(!1), c = e.ref(""), y = e.ref(""), $ = e.ref(""), o = e.ref(null), I = e.reactive({ corpId: "", agentId: "", secret: "" }), F = e.ref(""), P = e.ref(null), L = e.ref(""), D = e.ref(!1), C = e.ref(null), z = e.ref(null), R = e.ref(null), _ = e.ref(!1), E = e.ref(!1), v = e.ref(!1), w = e.ref([]), U = e.ref([]), G = e.ref(""), k = e.computed(() => {
      const M = G.value.trim(), J = M ? w.value.filter(($e) => $e.name.includes(M)) : w.value, ee = [];
      for (const $e of U.value) {
        const Oe = J.filter((Ht) => Ht.deptId === $e.id);
        Oe.length && ee.push({ id: $e.id, name: $e.name, people: Oe });
      }
      const ue = J.filter(($e) => !U.value.some((Oe) => Oe.id === $e.deptId));
      return ue.length && ee.push({ id: "_", name: t.t("其他"), people: ue }), ee;
    }), h = e.computed(() => /60020|可信 IP|trusted IP/i.test(b.value) ? /(\d{1,3}(?:\.\d{1,3}){3})/.exec(b.value)?.[1] ?? "" : "");
    async function r() {
      try {
        await navigator.clipboard.writeText(h.value);
      } catch {
      }
    }
    const H = /当前身份无效|请先选择身份|identity is invalid|select an identity/i;
    async function Q() {
      try {
        s.value = await W("setup.status"), g.value = "", v.value = !1, L.value = s.value.me.mobile || "", !I.corpId && s.value.wecom?.corpId && (I.corpId = s.value.wecom.corpId), !I.agentId && s.value.wecom?.agentId && (I.agentId = s.value.wecom.agentId);
      } catch (M) {
        const J = X.errorMessage(M);
        H.test(J) ? await ne() : g.value = J;
      }
    }
    async function ne() {
      try {
        const M = await W("people.list");
        U.value = M?.depts ?? [], w.value = M?.people ?? [];
      } catch {
      }
      G.value = "", v.value = !0;
    }
    function q(M) {
      return O("identity", async () => {
        await W("identity.set", { personId: M }), qe(), await ie().catch(() => null), v.value = !1, await Q();
      });
    }
    async function B() {
      if (!E.value && !I.secret && s.value?.wecom?.hasSecret)
        try {
          const M = await W("wecom.secret.reveal");
          I.secret = M?.secret || "";
        } catch (M) {
          b.value = X.errorMessage(M);
          return;
        }
      E.value = !E.value;
    }
    function A(M) {
      const J = s.value;
      if (!J) return !1;
      switch (M) {
        case "models":
          return (J.models.asrReady || J.asr?.mode === "cloud" && !!J.asr.cloud?.hasKey) && J.models.speaker && J.models.python && J.models.ffmpeg;
        case "org":
          return J.org.people > 0 && (J.org.source !== "demo" || _.value);
        case "push":
          return !!J.push.channel;
        case "mobile":
          return J.mobile.running;
        case "voice":
          return J.me.voiceprint;
        case "ai":
          return !!R.value?.ok;
      }
    }
    function K(M) {
      return M === "finish" ? "todo" : A(M) ? "done" : i.has(M) ? "skipped" : "todo";
    }
    const V = e.computed(() => n.filter((M) => A(M.key)).length);
    function N(M) {
      const J = s.value;
      if (!J) return "";
      switch (M) {
        case "models": {
          const ee = J.asr?.mode === "cloud" ? t.t("在线接口") : J.recommend.engine === "firered" ? "FireRedASR2" : "SenseVoice";
          return A(M) ? t.t("{m} 和声纹模型已就绪", { m: ee }) : t.t("推荐 {m}", { m: ee });
        }
        case "org":
          return t.t("{src} · {n} 人", { src: S.value, n: J.org.people });
        case "push":
          return J.push.channel === "app" ? t.t("企微自建应用") : J.push.channel === "webhook" ? t.t("企微群机器人") : t.t("只进消息中心");
        case "mobile":
          return J.mobile.running ? t.t("运行中") : t.t("未开启");
        case "voice":
          return J.me.voiceprint ? t.t("已采集") : t.t("未采集");
        case "ai":
          return R.value ? R.value.ok ? t.t("可用") : t.t("没连上") : t.t("未测试");
      }
    }
    const S = e.computed(() => {
      const M = s.value?.org.source;
      return M === "wecom" ? t.t("企微通讯录") : M === "import" ? t.t("导入的通讯录") : M === "demo" ? t.t("演示组织") : t.t("还没有组织");
    }), x = e.computed(() => ({ good: t.t("配置很好"), ok: t.t("够用"), weak: t.t("偏弱") })[s.value?.recommend.tier || "ok"]), re = e.computed(() => ({ good: "ok", ok: "brand", weak: "warn" })[s.value?.recommend.tier || "ok"]), ce = e.computed(() => t.t("大家好，我是{dept}的{name}。这是我的声纹采集录音，用于在会议纪要里自动识别我的发言。我会用平时开会说话的音量和语速，把这段话完整地读完。", {
      dept: s.value?.me.deptName || "",
      name: s.value?.me.name || ""
    }));
    async function O(M, J) {
      d.value = !0, c.value = M, b.value = "";
      try {
        await J();
      } catch (ee) {
        b.value = X.errorMessage(ee);
      } finally {
        d.value = !1, c.value = "";
      }
    }
    function T(M) {
      M && (a.value = M, b.value = "");
    }
    function j() {
      a.value !== "finish" && i.add(a.value), T(u[m.value + 1]);
    }
    e.watch(a, (M) => {
      M === "mobile" && s.value && !s.value.mobile.running && O("mobile", async () => {
        await W("mobile.start"), await Q(), await ie().catch(() => null);
      });
    });
    const Z = () => window.electronAPI?.pyExt;
    let Y = null;
    async function ae(M) {
      const J = Z();
      if (!J?.install) {
        b.value = t.t("组件安装器不可用，请到应用的 设置 → 语音 里下载");
        return;
      }
      y.value = M, $.value = t.t("开始下载…"), b.value = "";
      try {
        const ee = await J.install(M);
        ee?.ok ? $.value = t.t("下载完成") : b.value = ee?.error || t.t("下载失败"), await Q();
      } catch (ee) {
        b.value = X.errorMessage(ee);
      } finally {
        y.value = "";
      }
    }
    function fe() {
      return O("demo", async () => {
        const M = s.value?.org.source !== "demo" ? await W("org.sync") : null;
        _.value = !0, await ie().catch(() => null), M?.needIdentity ? await ne() : await Q();
      });
    }
    function Ve() {
      return O("import", async () => {
        const M = await W("org.importFile");
        M && (o.value = M, await ie().catch(() => null), M.needIdentity ? await ne() : await Q());
      });
    }
    function De() {
      return O("app", async () => {
        const M = { corpId: I.corpId.trim(), agentId: I.agentId.trim() };
        I.secret && (M.secret = I.secret), await W("wecom.save", M);
        const J = await W("org.sync");
        if (J?.error) throw new Error(J.error);
        await ie().catch(() => null), J?.needIdentity ? await ne() : await Q();
      });
    }
    function me() {
      return O("hook", async () => {
        P.value = null, await W("wecom.webhook.save", { url: F.value.trim() }), F.value = "", await Q(), await ie().catch(() => null);
      });
    }
    function Ue() {
      return O("hookTest", async () => {
        const M = await W("wecom.webhook.test");
        P.value = { ok: !!M?.ok, error: M?.error };
      });
    }
    function Xe() {
      return O("mobileNo", async () => {
        s.value && (await W("org.person.contact", { personId: s.value.me.id, mobile: L.value.trim() }), await Q());
      });
    }
    function Ot() {
      return O("voice", async () => {
        if (!(!C.value || !s.value)) {
          z.value = null;
          try {
            const M = await W("voiceprint.enrollData", { personId: s.value.me.id, consent: !0, data: C.value.data, ext: C.value.ext });
            z.value = { ok: !0, seconds: M?.seconds };
          } catch (M) {
            z.value = { ok: !1, error: X.errorMessage(M) };
          }
          await Q();
        }
      });
    }
    function Rt() {
      return O("voice", async () => {
        if (s.value) {
          z.value = null;
          try {
            const M = await W("voiceprint.import", { personId: s.value.me.id, consent: !0 });
            M && (z.value = { ok: !0, seconds: M.seconds });
          } catch (M) {
            z.value = { ok: !1, error: X.errorMessage(M) };
          }
          await Q();
        }
      });
    }
    function qt() {
      return O("llm", async () => {
        R.value = await W("setup.llmTest");
      });
    }
    function Kt() {
      return O("finish", async () => {
        await W("setup.finish"), await ie().catch(() => null), f("done");
      });
    }
    return e.onMounted(() => {
      Q();
      const M = Z();
      M?.onInstallProgress && (Y = M.onInstallProgress((J) => {
        J?.id && J.id === y.value && J.line && ($.value = String(J.line).slice(0, 200));
      }));
    }), e.onBeforeUnmount(() => {
      try {
        Y?.();
      } catch {
      }
    }), (M, J) => (e.openBlock(), e.createElementBlock("div", {
      class: "mm-setup-overlay",
      role: "dialog",
      "aria-modal": "true",
      "aria-label": M.$t("配置引导"),
      "data-test": "mm-setup"
    }, [
      e.createElementVNode("div", GE, [
        e.createElementVNode("header", YE, [
          e.createElementVNode("div", JE, [
            e.createElementVNode(
              "h2",
              null,
              e.toDisplayString(M.$t("配置引导")),
              1
              /* TEXT */
            ),
            e.createElementVNode(
              "p",
              null,
              e.toDisplayString(M.$t("把泰途会议智能管理要用到的配置一步步配好。每一步都可以先跳过，之后点右上角「配置引导」继续。")),
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
              onClick: J[0] || (J[0] = (ee) => f("close"))
            },
            e.toDisplayString(M.$t("稍后再说")),
            1
            /* TEXT */
          )
        ]),
        e.createCommentVNode(" 进度条固定在顶部，内容区自己滚 "),
        e.createElementVNode("div", QE, [
          e.createElementVNode("i", ZE, [
            e.createElementVNode(
              "b",
              {
                style: e.normalizeStyle({ width: `${Math.round(V.value / n.length * 100)}%` })
              },
              null,
              4
              /* STYLE */
            )
          ]),
          e.createElementVNode(
            "span",
            null,
            e.toDisplayString(M.$t("已完成 {a} / {b}", { a: V.value, b: n.length })),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode("div", XE, [
          e.createElementVNode("nav", {
            class: "mm-sw2__steps",
            "aria-label": M.$t("步骤")
          }, [
            (e.openBlock(), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(n, (ee, ue) => e.createElementVNode("button", {
                key: ee.key,
                type: "button",
                class: e.normalizeClass({ on: a.value === ee.key, ok: K(ee.key) === "done", skip: K(ee.key) === "skipped" }),
                "data-test": `mm-setup-step-${ee.key}`,
                onClick: ($e) => T(ee.key)
              }, [
                e.createElementVNode("span", tN, [
                  K(ee.key) === "done" ? (e.openBlock(), e.createElementBlock("i", lN)) : (e.openBlock(), e.createElementBlock(
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
                e.createElementVNode("span", nN, [
                  e.createElementVNode(
                    "strong",
                    null,
                    e.toDisplayString(ee.title),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "small",
                    null,
                    e.toDisplayString(N(ee.key)),
                    1
                    /* TEXT */
                  )
                ])
              ], 10, eN)),
              64
              /* STABLE_FRAGMENT */
            ))
          ], 8, xE),
          e.createElementVNode("section", aN, [
            e.createCommentVNode(" 通讯录换成新的（企微同步 / 导入）后，原来的身份不在里面了：直接在这里选「你是谁」，选中的人成为管理员 "),
            v.value ? (e.openBlock(), e.createElementBlock("div", oN, [
              e.createElementVNode(
                "h3",
                null,
                e.toDisplayString(M.$t("通讯录已更新，你是哪一位？")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "p",
                sN,
                e.toDisplayString(M.$t("组织已经换成新的通讯录（{n} 人），原来的演示身份不在里面了。选你自己，之后按你的身份继续配置；你会成为泰途会议智能管理的管理员。", { n: w.value.length })),
                1
                /* TEXT */
              ),
              e.withDirectives(e.createElementVNode("input", {
                "onUpdate:modelValue": J[1] || (J[1] = (ee) => G.value = ee),
                class: "mm-sw2__search",
                type: "search",
                placeholder: M.$t("搜索姓名"),
                "data-test": "mm-setup-identity-search"
              }, null, 8, rN), [
                [e.vModelText, G.value]
              ]),
              e.createElementVNode("div", iN, [
                (e.openBlock(!0), e.createElementBlock(
                  e.Fragment,
                  null,
                  e.renderList(k.value, (ee) => (e.openBlock(), e.createElementBlock(
                    e.Fragment,
                    {
                      key: ee.id
                    },
                    [
                      e.createElementVNode(
                        "h5",
                        null,
                        e.toDisplayString(ee.name),
                        1
                        /* TEXT */
                      ),
                      (e.openBlock(!0), e.createElementBlock(
                        e.Fragment,
                        null,
                        e.renderList(ee.people, (ue) => (e.openBlock(), e.createElementBlock("button", {
                          key: ue.id,
                          type: "button",
                          class: "mm-sw2__person",
                          disabled: d.value,
                          "data-test": `mm-setup-me-${ue.id}`,
                          onClick: ($e) => q(ue.id)
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
                        ], 8, cN))),
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
                k.value.length ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock(
                  "p",
                  dN,
                  e.toDisplayString(M.$t("没有找到这个人")),
                  1
                  /* TEXT */
                ))
              ]),
              b.value ? (e.openBlock(), e.createElementBlock("p", mN, [
                J[13] || (J[13] = e.createElementVNode(
                  "i",
                  { class: "ri-error-warning-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(b.value),
                  1
                  /* TEXT */
                )
              ])) : e.createCommentVNode("v-if", !0)
            ])) : (e.openBlock(), e.createElementBlock(
              e.Fragment,
              { key: 1 },
              [
                g.value ? (e.openBlock(), e.createElementBlock("p", uN, [
                  J[14] || (J[14] = e.createElementVNode(
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
                ])) : e.createCommentVNode("v-if", !0),
                !s.value && !g.value ? (e.openBlock(), e.createElementBlock("p", pN, [
                  J[15] || (J[15] = e.createElementVNode(
                    "i",
                    { class: "ri-loader-4-line spin" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(M.$t("正在检测…")),
                    1
                    /* TEXT */
                  )
                ])) : e.createCommentVNode("v-if", !0),
                s.value ? (e.openBlock(), e.createElementBlock(
                  e.Fragment,
                  { key: 2 },
                  [
                    e.createCommentVNode(" 1 电脑配置与语音模型 "),
                    a.value === "models" ? (e.openBlock(), e.createElementBlock("div", vN, [
                      e.createElementVNode(
                        "h3",
                        null,
                        e.toDisplayString(M.$t("电脑配置与语音模型")),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "p",
                        kN,
                        e.toDisplayString(M.$t("按这台电脑的配置推荐跑得动的最准的转写模型（录音不出电脑）；也可以改填自己的在线语音识别接口。认人（声纹）始终在本机。")),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode("div", gN, [
                        e.createElementVNode("div", null, [
                          e.createElementVNode(
                            "small",
                            null,
                            e.toDisplayString(M.$t("处理器")),
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
                            e.toDisplayString(M.$t("{n} 核", { n: s.value.hardware.cores })),
                            1
                            /* TEXT */
                          )
                        ]),
                        e.createElementVNode("div", null, [
                          e.createElementVNode(
                            "small",
                            null,
                            e.toDisplayString(M.$t("内存")),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "b",
                            null,
                            e.toDisplayString(M.$t("{n} GB", { n: s.value.hardware.memGb })),
                            1
                            /* TEXT */
                          )
                        ]),
                        e.createElementVNode("div", null, [
                          e.createElementVNode(
                            "small",
                            null,
                            e.toDisplayString(M.$t("模型所在磁盘剩余")),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "b",
                            null,
                            e.toDisplayString(s.value.hardware.freeDiskGb === null ? "—" : M.$t("{n} GB", { n: s.value.hardware.freeDiskGb })),
                            1
                            /* TEXT */
                          )
                        ]),
                        e.createElementVNode("div", null, [
                          e.createElementVNode(
                            "small",
                            null,
                            e.toDisplayString(M.$t("评级")),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode("b", null, [
                            e.createElementVNode(
                              "span",
                              {
                                class: e.normalizeClass(["ss-chip", re.value])
                              },
                              e.toDisplayString(x.value),
                              3
                              /* TEXT, CLASS */
                            )
                          ])
                        ])
                      ]),
                      e.createVNode(Ut, {
                        "data-test": "mm-setup-asr",
                        onChanged: Q
                      }),
                      e.createElementVNode("ul", yN, [
                        e.createElementVNode("li", null, [
                          e.createElementVNode("div", null, [
                            e.createElementVNode(
                              "strong",
                              null,
                              e.toDisplayString(M.$t("声纹模型 CAM++")),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "small",
                              null,
                              e.toDisplayString(M.$t("用来按声音认出是谁在发言")),
                              1
                              /* TEXT */
                            )
                          ]),
                          s.value.models.speaker ? (e.openBlock(), e.createElementBlock(
                            "span",
                            fN,
                            e.toDisplayString(M.$t("已下载")),
                            1
                            /* TEXT */
                          )) : (e.openBlock(), e.createElementBlock("button", {
                            key: 1,
                            type: "button",
                            class: "ss-btn primary sm",
                            disabled: !!y.value,
                            "data-test": "mm-setup-spk-install",
                            onClick: J[2] || (J[2] = (ee) => ae(s.value.recommend.speakerInstallId))
                          }, [
                            e.createElementVNode(
                              "i",
                              {
                                class: e.normalizeClass(y.value === s.value.recommend.speakerInstallId ? "ri-loader-4-line spin" : "ri-download-2-line")
                              },
                              null,
                              2
                              /* CLASS */
                            ),
                            e.createTextVNode(
                              e.toDisplayString(M.$t("下载")),
                              1
                              /* TEXT */
                            )
                          ], 8, EN))
                        ]),
                        e.createElementVNode("li", null, [
                          e.createElementVNode("div", null, [
                            e.createElementVNode(
                              "strong",
                              null,
                              e.toDisplayString(M.$t("本机语音运行组件")),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "small",
                              null,
                              e.toDisplayString(M.$t("随应用自带的 Python 和 ffmpeg")),
                              1
                              /* TEXT */
                            )
                          ]),
                          e.createElementVNode(
                            "span",
                            {
                              class: e.normalizeClass(["ss-chip", s.value.models.python && s.value.models.ffmpeg ? "ok" : "bad"])
                            },
                            e.toDisplayString(s.value.models.python && s.value.models.ffmpeg ? M.$t("正常") : M.$t("缺失")),
                            3
                            /* TEXT, CLASS */
                          )
                        ])
                      ]),
                      $.value ? (e.openBlock(), e.createElementBlock(
                        "p",
                        NN,
                        e.toDisplayString($.value),
                        1
                        /* TEXT */
                      )) : e.createCommentVNode("v-if", !0),
                      s.value.models.python && s.value.models.ffmpeg ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock("p", VN, [
                        J[16] || (J[16] = e.createElementVNode(
                          "i",
                          { class: "ri-error-warning-line" },
                          null,
                          -1
                          /* CACHED */
                        )),
                        e.createTextVNode(
                          e.toDisplayString(M.$t("本机语音运行组件不完整，录音没法处理。请重新安装应用，或到应用的 设置 → 语音 里修复。")),
                          1
                          /* TEXT */
                        )
                      ]))
                    ])) : a.value === "org" ? (e.openBlock(), e.createElementBlock(
                      e.Fragment,
                      { key: 1 },
                      [
                        e.createCommentVNode(" 2 组织架构 "),
                        e.createElementVNode("div", $N, [
                          e.createElementVNode(
                            "h3",
                            null,
                            e.toDisplayString(M.$t("组织架构")),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "p",
                            hN,
                            e.toDisplayString(M.$t("任务按部门派给部门负责人，发言人只在本场参会人里认，都要先有组织架构。")),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode("p", bN, [
                            J[17] || (J[17] = e.createElementVNode(
                              "i",
                              { class: "ri-team-line" },
                              null,
                              -1
                              /* CACHED */
                            )),
                            e.createTextVNode(
                              e.toDisplayString(M.$t("现在：{src} · {n} 人 · {d} 个部门", { src: S.value, n: s.value.org.people, d: s.value.org.depts })),
                              1
                              /* TEXT */
                            )
                          ]),
                          e.createElementVNode("div", _N, [
                            e.createElementVNode("article", null, [
                              e.createElementVNode(
                                "strong",
                                null,
                                e.toDisplayString(M.$t("先用演示组织")),
                                1
                                /* TEXT */
                              ),
                              e.createElementVNode(
                                "small",
                                null,
                                e.toDisplayString(M.$t("20 人、6 个部门，和原型同名，适合演示和培训。右上角「当前身份」能切到任意人推进流程。")),
                                1
                                /* TEXT */
                              ),
                              e.createElementVNode("button", {
                                type: "button",
                                class: "ss-btn sm",
                                disabled: d.value,
                                "data-test": "mm-setup-org-demo",
                                onClick: fe
                              }, e.toDisplayString(s.value.org.source === "demo" ? M.$t("就用演示组织") : M.$t("换回演示组织")), 9, BN)
                            ]),
                            e.createElementVNode("article", null, [
                              e.createElementVNode(
                                "strong",
                                null,
                                e.toDisplayString(M.$t("导入通讯录表格（推荐）")),
                                1
                                /* TEXT */
                              ),
                              e.createElementVNode(
                                "small",
                                null,
                                e.toDisplayString(M.$t("企业微信管理后台 → 通讯录 → 批量导入/导出 → 导出成员，把导出的表格直接导进来。自己整理的表格也行：至少要有「姓名」「部门」，「手机」「账号」「是否部门负责人」「直属上级」有就更好。")),
                                1
                                /* TEXT */
                              ),
                              e.createElementVNode("button", {
                                type: "button",
                                class: "ss-btn primary sm",
                                disabled: d.value,
                                "data-test": "mm-setup-org-import",
                                onClick: Ve
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
                                  e.toDisplayString(M.$t("选择表格导入")),
                                  1
                                  /* TEXT */
                                )
                              ], 8, SN)
                            ]),
                            e.createElementVNode("article", null, [
                              e.createElementVNode(
                                "strong",
                                null,
                                e.toDisplayString(M.$t("企业微信自建应用")),
                                1
                                /* TEXT */
                              ),
                              e.createElementVNode(
                                "small",
                                null,
                                e.toDisplayString(M.$t("有自建应用（CorpID、AgentID、Secret，且本机出口 IP 在企业可信 IP 里）时，直接从企微同步通讯录，通知按人发卡片。")),
                                1
                                /* TEXT */
                              ),
                              e.createElementVNode("div", DN, [
                                e.withDirectives(e.createElementVNode(
                                  "input",
                                  {
                                    "onUpdate:modelValue": J[3] || (J[3] = (ee) => I.corpId = ee),
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
                                    "onUpdate:modelValue": J[4] || (J[4] = (ee) => I.agentId = ee),
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
                                e.createElementVNode("span", wN, [
                                  e.withDirectives(e.createElementVNode("input", {
                                    "onUpdate:modelValue": J[5] || (J[5] = (ee) => I.secret = ee),
                                    type: E.value ? "text" : "password",
                                    placeholder: s.value.wecom?.hasSecret ? M.$t("已保存，点右边的眼睛查看") : "Secret",
                                    autocomplete: "new-password",
                                    spellcheck: "false",
                                    "data-test": "mm-setup-secret"
                                  }, null, 8, CN), [
                                    [e.vModelDynamic, I.secret]
                                  ]),
                                  e.createElementVNode("button", {
                                    type: "button",
                                    class: "mm-sw2__eye",
                                    title: E.value ? M.$t("隐藏") : M.$t("查看"),
                                    disabled: d.value,
                                    "data-test": "mm-setup-secret-eye",
                                    onClick: B
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
                                  ], 8, TN)
                                ])
                              ]),
                              e.createElementVNode("button", {
                                type: "button",
                                class: "ss-btn sm",
                                disabled: d.value || !I.corpId.trim() || !I.agentId.trim() || !I.secret && !s.value.push.appConfigured,
                                "data-test": "mm-setup-app-sync",
                                onClick: De
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
                                  e.toDisplayString(M.$t("保存并同步通讯录")),
                                  1
                                  /* TEXT */
                                )
                              ], 8, IN),
                              e.createElementVNode("details", MN, [
                                e.createElementVNode(
                                  "summary",
                                  null,
                                  e.toDisplayString(M.$t("第一次接入：在企业微信管理后台做这几步")),
                                  1
                                  /* TEXT */
                                ),
                                e.createElementVNode("ol", AN, [
                                  e.createElementVNode(
                                    "li",
                                    null,
                                    e.toDisplayString(M.$t("应用管理 → 自建 → 创建应用；可见范围选全公司（应用只能读到可见范围里的部门和成员）")),
                                    1
                                    /* TEXT */
                                  ),
                                  e.createElementVNode(
                                    "li",
                                    null,
                                    e.toDisplayString(M.$t("应用详情 → 开发者接口 → 网页授权及 JS-SDK → 设置可信域名：填公司备案的域名，下载 WW_verify 开头的验证文件，放到网站根目录后点验证")),
                                    1
                                    /* TEXT */
                                  ),
                                  e.createElementVNode(
                                    "li",
                                    null,
                                    e.toDisplayString(M.$t("同一页「企业可信 IP」：填这台电脑所在网络的公网出口 IP。不知道就先点上面的「保存并同步通讯录」，失败时这里会显示要填的 IP")),
                                    1
                                    /* TEXT */
                                  ),
                                  e.createElementVNode(
                                    "li",
                                    null,
                                    e.toDisplayString(M.$t("「我的企业」页面底部复制企业 ID（CorpID），应用详情里复制 AgentId 和 Secret，填到上面，再点「保存并同步通讯录」")),
                                    1
                                    /* TEXT */
                                  )
                                ])
                              ])
                            ])
                          ]),
                          h.value ? (e.openBlock(), e.createElementBlock("p", jN, [
                            J[18] || (J[18] = e.createElementVNode(
                              "i",
                              { class: "ri-global-line" },
                              null,
                              -1
                              /* CACHED */
                            )),
                            e.createElementVNode("span", null, [
                              e.createTextVNode(
                                e.toDisplayString(M.$t("企业微信要求把这个 IP 加进应用的「企业可信 IP」：")),
                                1
                                /* TEXT */
                              ),
                              e.createElementVNode(
                                "b",
                                LN,
                                e.toDisplayString(h.value),
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
                              e.toDisplayString(M.$t("复制")),
                              1
                              /* TEXT */
                            )
                          ])) : e.createCommentVNode("v-if", !0),
                          o.value ? (e.openBlock(), e.createElementBlock(
                            "div",
                            {
                              key: 1,
                              class: e.normalizeClass(["ss-note", o.value.warnings?.length ? "warn" : "ok"]),
                              "data-test": "mm-setup-import-result"
                            },
                            [
                              e.createElementVNode(
                                "i",
                                {
                                  class: e.normalizeClass(o.value.warnings?.length ? "ri-alert-line" : "ri-checkbox-circle-line")
                                },
                                null,
                                2
                                /* CLASS */
                              ),
                              e.createElementVNode("div", null, [
                                e.createElementVNode(
                                  "p",
                                  null,
                                  e.toDisplayString(M.$t("已导入 {n} 人、{d} 个部门（新增 {a}，变更 {c}，不在表里的 {l} 人标为离职）", { n: o.value.people, d: o.value.depts, a: o.value.added.length, c: o.value.changed.length, l: o.value.left.length })),
                                  1
                                  /* TEXT */
                                ),
                                (e.openBlock(!0), e.createElementBlock(
                                  e.Fragment,
                                  null,
                                  e.renderList(o.value.warnings || [], (ee, ue) => (e.openBlock(), e.createElementBlock(
                                    "p",
                                    { key: ue },
                                    e.toDisplayString(ee),
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
                    )) : a.value === "push" ? (e.openBlock(), e.createElementBlock(
                      e.Fragment,
                      { key: 2 },
                      [
                        e.createCommentVNode(" 3 通知推送 "),
                        e.createElementVNode("div", zN, [
                          e.createElementVNode(
                            "h3",
                            null,
                            e.toDisplayString(M.$t("通知推送")),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "p",
                            FN,
                            e.toDisplayString(M.$t("发言待确认、新任务、到期提醒这些通知发到哪里。不配也能用，通知只进系统内的消息中心。")),
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
                                " " + e.toDisplayString(s.value.push.channel === "app" ? M.$t("已连接企业微信自建应用：通知按人发卡片") : s.value.push.channel === "webhook" ? M.$t("已连接企微群机器人：通知发到群里") : M.$t("还没配置：通知只进消息中心")),
                                1
                                /* TEXT */
                              )
                            ],
                            2
                            /* CLASS */
                          ),
                          e.createElementVNode("article", PN, [
                            e.createElementVNode(
                              "strong",
                              null,
                              e.toDisplayString(M.$t("企微群机器人（推荐，最省事）")),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode("ol", UN, [
                              e.createElementVNode(
                                "li",
                                null,
                                e.toDisplayString(M.$t("在企业微信里打开要接收通知的内部群，点右上角「…」")),
                                1
                                /* TEXT */
                              ),
                              e.createElementVNode(
                                "li",
                                null,
                                e.toDisplayString(M.$t("选「消息推送」（旧版叫「群机器人」）→「添加」→ 新建一个，名字可以叫「会议助手」")),
                                1
                                /* TEXT */
                              ),
                              e.createElementVNode(
                                "li",
                                null,
                                e.toDisplayString(M.$t("复制生成的 Webhook 地址，粘贴到下面保存，再点「测试发送」看群里有没有收到")),
                                1
                                /* TEXT */
                              )
                            ]),
                            e.createElementVNode("div", ON, [
                              e.withDirectives(e.createElementVNode("input", {
                                "onUpdate:modelValue": J[6] || (J[6] = (ee) => F.value = ee),
                                type: "password",
                                spellcheck: "false",
                                autocomplete: "off",
                                placeholder: s.value.push.hasWebhook ? M.$t("已配置 {m}，要换地址再粘贴", { m: s.value.push.webhookMasked }) : "https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=…",
                                "data-test": "mm-setup-hook"
                              }, null, 8, RN), [
                                [e.vModelText, F.value]
                              ]),
                              e.createElementVNode("button", {
                                type: "button",
                                class: "ss-btn primary sm",
                                disabled: d.value || !F.value.trim(),
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
                                  e.toDisplayString(M.$t("保存")),
                                  1
                                  /* TEXT */
                                )
                              ], 8, qN),
                              e.createElementVNode("button", {
                                type: "button",
                                class: "ss-btn sm",
                                disabled: d.value || !s.value.push.hasWebhook,
                                "data-test": "mm-setup-hook-test",
                                onClick: Ue
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
                                  e.toDisplayString(M.$t("测试发送")),
                                  1
                                  /* TEXT */
                                )
                              ], 8, KN)
                            ]),
                            P.value ? (e.openBlock(), e.createElementBlock(
                              "p",
                              {
                                key: 0,
                                class: e.normalizeClass(["ss-note", P.value.ok ? "ok" : "danger"]),
                                "data-test": "mm-setup-hook-result"
                              },
                              e.toDisplayString(P.value.ok ? M.$t("已发到群里，请到企微群里看一眼") : P.value.error),
                              3
                              /* TEXT, CLASS */
                            )) : e.createCommentVNode("v-if", !0)
                          ]),
                          e.createElementVNode("article", HN, [
                            e.createElementVNode(
                              "strong",
                              null,
                              e.toDisplayString(M.$t("让群消息真正提醒到人")),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "small",
                              null,
                              e.toDisplayString(M.$t("群机器人按手机号或企微账号提醒本人（对方企微里会有提醒）。导入的通讯录里带了就不用管；演示时可以把你自己的手机号填上，群里就会提醒到你。")),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "p",
                              WN,
                              e.toDisplayString(M.$t("现在能提醒到本人的：{a} / {b} 人", { a: s.value.org.mentionable, b: s.value.org.people })),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode("div", GN, [
                              e.createElementVNode(
                                "span",
                                YN,
                                e.toDisplayString(s.value.me.name),
                                1
                                /* TEXT */
                              ),
                              e.withDirectives(e.createElementVNode("input", {
                                "onUpdate:modelValue": J[7] || (J[7] = (ee) => L.value = ee),
                                type: "tel",
                                placeholder: M.$t("你的手机号"),
                                "data-test": "mm-setup-mobile"
                              }, null, 8, JN), [
                                [e.vModelText, L.value]
                              ]),
                              e.createElementVNode("button", {
                                type: "button",
                                class: "ss-btn sm",
                                disabled: d.value || L.value.trim() === (s.value.me.mobile || ""),
                                "data-test": "mm-setup-mobile-save",
                                onClick: Xe
                              }, e.toDisplayString(M.$t("保存")), 9, QN)
                            ]),
                            e.createElementVNode(
                              "p",
                              ZN,
                              e.toDisplayString(M.$t("其他人的手机号、企微账号在「系统设置 → 通讯录」里逐个填。")),
                              1
                              /* TEXT */
                            )
                          ])
                        ])
                      ],
                      2112
                      /* STABLE_FRAGMENT, DEV_ROOT_FRAGMENT */
                    )) : a.value === "mobile" ? (e.openBlock(), e.createElementBlock(
                      e.Fragment,
                      { key: 3 },
                      [
                        e.createCommentVNode(" 4 手机端 "),
                        e.createElementVNode("div", XN, [
                          e.createElementVNode(
                            "h3",
                            null,
                            e.toDisplayString(M.$t("手机端")),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "p",
                            xN,
                            e.toDisplayString(M.$t("同事用手机确认发言、接任务、录声纹，企微消息里的按钮也跳到这里。手机要和这台电脑在同一个网络。")),
                            1
                            /* TEXT */
                          ),
                          e.createVNode(jt)
                        ])
                      ],
                      2112
                      /* STABLE_FRAGMENT, DEV_ROOT_FRAGMENT */
                    )) : a.value === "voice" ? (e.openBlock(), e.createElementBlock(
                      e.Fragment,
                      { key: 4 },
                      [
                        e.createCommentVNode(" 5 声纹 "),
                        e.createElementVNode("div", eV, [
                          e.createElementVNode(
                            "h3",
                            null,
                            e.toDisplayString(M.$t("采集你的声纹")),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "p",
                            tV,
                            e.toDisplayString(M.$t("采集过声纹的人，上传会议录音后会被自动认出来。先录你自己的；其他同事可以扫码在手机上自己录，或管理员在「系统设置 → 声纹库」代为导入。")),
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
                                " " + e.toDisplayString(s.value.me.voiceprint ? M.$t("{name} 的声纹已采集（重新录会覆盖）", { name: s.value.me.name }) : M.$t("{name} 还没有采集声纹", { name: s.value.me.name })) + " · " + e.toDisplayString(M.$t("全公司已采集 {a} / {b} 人", { a: s.value.voiceprints.collected, b: s.value.voiceprints.total })),
                                1
                                /* TEXT */
                              )
                            ],
                            2
                            /* CLASS */
                          ),
                          s.value.models.speaker ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock("p", lV, [
                            J[19] || (J[19] = e.createElementVNode(
                              "i",
                              { class: "ri-alert-line" },
                              null,
                              -1
                              /* CACHED */
                            )),
                            e.createTextVNode(
                              e.toDisplayString(M.$t("还没有下载声纹模型：请先在第 1 步下载。")),
                              1
                              /* TEXT */
                            )
                          ])),
                          e.createElementVNode("label", nV, [
                            e.withDirectives(e.createElementVNode(
                              "input",
                              {
                                "onUpdate:modelValue": J[8] || (J[8] = (ee) => D.value = ee),
                                type: "checkbox",
                                "data-test": "mm-setup-consent"
                              },
                              null,
                              512
                              /* NEED_PATCH */
                            ), [
                              [e.vModelCheckbox, D.value]
                            ]),
                            e.createElementVNode(
                              "span",
                              null,
                              e.toDisplayString(M.$t("我同意采集本人的声纹（声音特征），并在我确认会议发言后用其中我本人的发言补充声纹（最多保留最近 5 条），只用于在会议纪要里识别我的发言，保存在这台电脑上，可以随时在声纹库关闭补充或删除声纹。")),
                              1
                              /* TEXT */
                            )
                          ]),
                          e.createVNode(HE, {
                            script: ce.value,
                            disabled: d.value || !s.value.models.speaker,
                            onRecorded: J[9] || (J[9] = (ee) => C.value = ee),
                            onReset: J[10] || (J[10] = (ee) => C.value = null)
                          }, null, 8, ["script", "disabled"]),
                          e.createElementVNode("div", aV, [
                            e.createElementVNode("button", {
                              type: "button",
                              class: "ss-btn primary",
                              disabled: d.value || !D.value || !C.value || !s.value.models.speaker,
                              "data-test": "mm-setup-voice-submit",
                              onClick: Ot
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
                                e.toDisplayString(M.$t("提交声纹")),
                                1
                                /* TEXT */
                              )
                            ], 8, oV),
                            e.createElementVNode("button", {
                              type: "button",
                              class: "ss-link",
                              disabled: d.value || !D.value || !s.value.models.speaker,
                              "data-test": "mm-setup-voice-import",
                              onClick: Rt
                            }, e.toDisplayString(M.$t("改用已有的录音文件")), 9, sV)
                          ]),
                          z.value ? (e.openBlock(), e.createElementBlock(
                            "p",
                            {
                              key: 1,
                              class: e.normalizeClass(["ss-note", z.value.ok ? "ok" : "danger"]),
                              "data-test": "mm-setup-voice-result"
                            },
                            e.toDisplayString(z.value.ok ? M.$t("声纹已采集（{s} 秒）", { s: z.value.seconds }) : z.value.error),
                            3
                            /* TEXT, CLASS */
                          )) : e.createCommentVNode("v-if", !0)
                        ])
                      ],
                      2112
                      /* STABLE_FRAGMENT, DEV_ROOT_FRAGMENT */
                    )) : a.value === "ai" ? (e.openBlock(), e.createElementBlock(
                      e.Fragment,
                      { key: 5 },
                      [
                        e.createCommentVNode(" 6 大模型 "),
                        e.createElementVNode("div", rV, [
                          e.createElementVNode(
                            "h3",
                            null,
                            e.toDisplayString(M.$t("大模型")),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "p",
                            iV,
                            e.toDisplayString(M.$t("整理议题和决议、生成执行方案、写周报和项目总结，用的是应用里当前选的大模型（会议转写和声纹不用它，只在本机）。")),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode("button", {
                            type: "button",
                            class: "ss-btn primary",
                            disabled: d.value,
                            "data-test": "mm-setup-llm-test",
                            onClick: qt
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
                              e.toDisplayString(M.$t("测试连接")),
                              1
                              /* TEXT */
                            )
                          ], 8, cV),
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
                                " " + e.toDisplayString(R.value.ok ? M.$t("大模型可用：回复「{r}」，用时 {s} 秒", { r: R.value.reply, s: ((R.value.ms || 0) / 1e3).toFixed(1) }) : M.$t("没连上大模型：纪要整理和拆任务会按规则兜底，效果差很多。请到应用的「设置 → 模型」里选一个能用的模型，再回来测试。")),
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
                    )) : a.value === "finish" ? (e.openBlock(), e.createElementBlock(
                      e.Fragment,
                      { key: 6 },
                      [
                        e.createCommentVNode(" 完成 "),
                        e.createElementVNode("div", dV, [
                          e.createElementVNode(
                            "h3",
                            null,
                            e.toDisplayString(M.$t("配置完成情况")),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode("ul", mV, [
                            (e.openBlock(), e.createElementBlock(
                              e.Fragment,
                              null,
                              e.renderList(n, (ee) => e.createElementVNode(
                                "li",
                                {
                                  key: ee.key,
                                  class: e.normalizeClass(K(ee.key))
                                },
                                [
                                  e.createElementVNode(
                                    "i",
                                    {
                                      class: e.normalizeClass(K(ee.key) === "done" ? "ri-checkbox-circle-fill" : "ri-error-warning-line")
                                    },
                                    null,
                                    2
                                    /* CLASS */
                                  ),
                                  e.createElementVNode(
                                    "strong",
                                    null,
                                    e.toDisplayString(ee.title),
                                    1
                                    /* TEXT */
                                  ),
                                  e.createElementVNode(
                                    "span",
                                    null,
                                    e.toDisplayString(N(ee.key)),
                                    1
                                    /* TEXT */
                                  ),
                                  K(ee.key) !== "done" ? (e.openBlock(), e.createElementBlock("button", {
                                    key: 0,
                                    type: "button",
                                    class: "ss-link",
                                    onClick: (ue) => T(ee.key)
                                  }, e.toDisplayString(M.$t("去配置")), 9, uV)) : e.createCommentVNode("v-if", !0)
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
                            pV,
                            e.toDisplayString(M.$t("没配好的也可以先用，之后点右上角「配置引导」继续。")),
                            1
                            /* TEXT */
                          )
                        ])
                      ],
                      2112
                      /* STABLE_FRAGMENT, DEV_ROOT_FRAGMENT */
                    )) : e.createCommentVNode("v-if", !0),
                    b.value ? (e.openBlock(), e.createElementBlock("p", vV, [
                      J[20] || (J[20] = e.createElementVNode(
                        "i",
                        { class: "ri-error-warning-line" },
                        null,
                        -1
                        /* CACHED */
                      )),
                      e.createTextVNode(
                        e.toDisplayString(b.value),
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
        e.createElementVNode("footer", kV, [
          e.createElementVNode("button", {
            type: "button",
            class: "ss-btn",
            disabled: m.value <= 0,
            "data-test": "mm-setup-prev",
            onClick: J[11] || (J[11] = (ee) => T(u[m.value - 1]))
          }, e.toDisplayString(M.$t("上一步")), 9, gV),
          J[21] || (J[21] = e.createElementVNode(
            "span",
            { class: "mm-grow" },
            null,
            -1
            /* CACHED */
          )),
          a.value !== "finish" && K(a.value) !== "done" ? (e.openBlock(), e.createElementBlock(
            "button",
            {
              key: 0,
              type: "button",
              class: "ss-link",
              "data-test": "mm-setup-skip",
              onClick: j
            },
            e.toDisplayString(M.$t("先跳过")),
            1
            /* TEXT */
          )) : e.createCommentVNode("v-if", !0),
          a.value !== "finish" ? (e.openBlock(), e.createElementBlock(
            "button",
            {
              key: 1,
              type: "button",
              class: "ss-btn primary",
              "data-test": "mm-setup-next",
              onClick: J[12] || (J[12] = (ee) => T(u[m.value + 1]))
            },
            e.toDisplayString(M.$t("下一步")),
            1
            /* TEXT */
          )) : (e.openBlock(), e.createElementBlock("button", {
            key: 2,
            type: "button",
            class: "ss-btn primary",
            disabled: d.value,
            "data-test": "mm-setup-done",
            onClick: Kt
          }, e.toDisplayString(M.$t("完成")), 9, yV))
        ])
      ])
    ], 8, WE));
  }
}), EV = /* @__PURE__ */ le(fV, [["__scopeId", "data-v-fb528f33"]]), NV = {
  class: "mm-wb",
  "data-test": "mm-workbench"
}, VV = { class: "mm-head" }, $V = { class: "mm-head__top" }, hV = { class: "mm-head__sub" }, bV = ["title"], _V = ["disabled", "title"], BV = {
  key: 2,
  class: "ri-arrow-down-s-line"
}, SV = {
  key: 0,
  class: "mm-id__panel",
  "data-test": "mm-identity-panel"
}, DV = { class: "mm-id__tip" }, wV = ["placeholder"], CV = {
  key: 1,
  class: "mm-id__state"
}, TV = {
  key: 2,
  class: "mm-id__state danger"
}, IV = {
  key: 3,
  class: "mm-id__list"
}, MV = ["disabled", "data-test", "onClick"], AV = { class: "mm-id__name" }, jV = {
  key: 0,
  class: "mm-id__tag"
}, LV = {
  key: 0,
  class: "mm-id__state"
}, zV = {
  class: "mm-tabs",
  role: "tablist"
}, FV = ["aria-selected", "data-test", "onClick"], PV = {
  key: 0,
  class: "mm-badge"
}, UV = {
  key: 0,
  class: "ss-note danger"
}, OV = {
  key: 1,
  class: "ss-note"
}, RV = {
  key: 0,
  class: "ss-note info mm-setup",
  "data-test": "mm-no-org"
}, qV = ["disabled"], KV = {
  key: 1,
  class: "ss-note warn"
}, bt = "totalclaw:meeting-mgmt-tab:v1", HV = /* @__PURE__ */ e.defineComponent({
  __name: "MeetingMgmtWorkbenchView",
  setup(l) {
    const p = [
      { key: "home", title: t.t("首页") },
      { key: "meetings", title: t.t("会议") },
      { key: "tasks", title: t.t("任务") },
      { key: "projects", title: t.t("项目") },
      { key: "settings", title: t.t("系统设置") }
    ], n = se.useNotificationStore(), u = te, f = e.computed(() => u.value?.me ?? null), s = e.computed(() => ke.value.tab), a = e.ref(""), m = e.ref(!1), i = e.ref(0), g = e.ref(null), b = e.reactive({}), d = e.ref(!1), c = e.computed(() => !!f.value?.isAdmin || (u.value?.settings.adminIds.length ?? 0) === 0), y = e.computed(() => !!u.value && (c.value || !!we.value)), $ = e.computed(() => p.filter((V) => V.key !== "settings" || !!f.value?.isAdmin)), o = e.computed(() => `${f.value?.person?.id || "none"}:${i.value}`);
    function I(V) {
      const N = u.value?.badges;
      return N ? V === "home" ? N.home : V === "meetings" ? N.meetings : V === "tasks" ? N.tasks : 0 : 0;
    }
    function F(V, N) {
      b[V] = typeof N == "string" ? N : "";
    }
    const P = e.computed(() => {
      if (s.value === "settings") return t.t("管理员");
      const V = b[s.value];
      return V || (f.value?.isAdmin ? t.t("管理员") : t.t("项目成员"));
    }), L = e.ref(null), D = e.ref(!1), C = e.ref(""), z = e.ref(!1), R = e.ref(""), _ = e.ref(!1), E = e.ref({ depts: [], people: [] }), v = e.computed(() => Dt(E.value, C.value)), w = e.computed(() => E.value.people.find((V) => V.id === we.value)?.name || ""), U = (V) => (u.value?.settings.adminIds || []).includes(V);
    async function G() {
      if (y.value) {
        D.value = !0, C.value = "", z.value = !0, R.value = "";
        try {
          E.value = await Be();
        } catch (V) {
          R.value = X.errorMessage(V);
        } finally {
          z.value = !1;
        }
      }
    }
    function k() {
      if (D.value) {
        D.value = !1;
        return;
      }
      G();
    }
    async function h(V) {
      if (!_.value) {
        if (V === f.value?.person?.id) {
          D.value = !1;
          return;
        }
        _.value = !0;
        try {
          await W("identity.set", { personId: V }), await ie(), D.value = !1;
          const N = f.value?.person?.name || "";
          n.success(t.t("当前身份已切换为 {name}", { name: N }));
        } catch (N) {
          R.value = X.errorMessage(N), n.error(X.errorMessage(N));
        } finally {
          _.value = !1;
        }
      }
    }
    function r(V) {
      if (!D.value) return;
      const N = L.value;
      N && V.target instanceof Node && N.contains(V.target) || (D.value = !1);
    }
    async function H() {
      a.value = "";
      try {
        await ie();
      } catch (V) {
        a.value = X.errorMessage(V);
      }
    }
    async function Q() {
      if (!m.value) {
        m.value = !0;
        try {
          await W("demo.load"), qe(), await ie(), i.value += 1, n.success(t.t("演示数据已载入"));
        } catch (V) {
          n.error(X.errorMessage(V));
        } finally {
          m.value = !1;
        }
      }
    }
    let ne = null;
    function q() {
      ne || (ne = setTimeout(() => {
        ne = null, ie().catch(() => {
        });
        try {
          g.value?.refresh?.();
        } catch {
        }
      }, 300));
    }
    const B = e.computed(() => !!u.value && !f.value?.person && u.value.org.peopleCount > 0 && !!u.value.canSwitchIdentity);
    e.watch(() => u.value?.setupPending, (V) => {
      V && !vt.value && (vt.value = !0, d.value = !0);
    }, { immediate: !0 }), e.watch(B, (V) => {
      V && (d.value = !0);
    }, { immediate: !0 });
    function A() {
      d.value = !1, qe(), i.value += 1, n.success(t.t("配置已保存，可以开始使用了"));
    }
    e.watch(() => f.value, (V) => {
      V?.isAdmin && V.person?.id && tl(V.person.id);
    }, { immediate: !0 }), e.watch(() => f.value?.person?.id, () => {
      for (const V of Object.keys(b)) delete b[V];
    }), e.watch([s, () => f.value?.isAdmin, u], () => {
      u.value && s.value === "settings" && !f.value?.isAdmin && he("home");
    }), e.watch(s, (V) => {
      try {
        localStorage.setItem(bt, V);
      } catch {
      }
    });
    let K = null;
    return e.onMounted(() => {
      if (ke.value.seq === 0)
        try {
          const V = localStorage.getItem(bt);
          V && p.some((N) => N.key === V) && V !== "home" && he(V);
        } catch {
        }
      H(), K = _e((V) => {
        V && (V.type === "changed" ? ((V.scope === "org" || V.scope === "all") && qe(), q()) : V.type === "mobile" && u.value && (u.value = { ...u.value, mobile: { running: V.running, url: V.url } }));
      }), document.addEventListener("mousedown", r);
    }), e.onBeforeUnmount(() => {
      K?.(), ne && clearTimeout(ne), document.removeEventListener("mousedown", r);
    }), (V, N) => (e.openBlock(), e.createElementBlock("div", NV, [
      e.createElementVNode("section", VV, [
        e.createElementVNode("div", $V, [
          e.createVNode(Gt),
          N[11] || (N[11] = e.createElementVNode(
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
            e.toDisplayString(V.$t("泰途会议智能管理")),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "p",
            hV,
            e.toDisplayString(V.$t("会议 → 纪要 → 任务 → 跟进 → 归档，全流程闭环")),
            1
            /* TEXT */
          ),
          N[12] || (N[12] = e.createElementVNode(
            "span",
            { class: "mm-grow" },
            null,
            -1
            /* CACHED */
          )),
          e.unref(u) ? (e.openBlock(), e.createElementBlock("span", {
            key: 0,
            class: e.normalizeClass(["mm-wecom", { on: e.unref(u).wecomConnected || e.unref(u).pushChannel === "webhook" }]),
            title: e.unref(u).wecomConnected ? V.$t("通讯录与消息卡片走企业微信") : e.unref(u).pushChannel === "webhook" ? V.$t("通知发到企微群（群机器人）") : V.$t("没有配置企业微信：通知只进系统内消息中心"),
            "data-test": "mm-wecom"
          }, e.toDisplayString(e.unref(u).wecomConnected ? V.$t("企微已连接") : e.unref(u).pushChannel === "webhook" ? V.$t("群机器人已连接") : V.$t("未连接企微")), 11, bV)) : e.createCommentVNode("v-if", !0),
          e.unref(u) && (f.value?.isAdmin || B.value) ? (e.openBlock(), e.createElementBlock("button", {
            key: 1,
            type: "button",
            class: "ss-btn sm",
            "data-test": "mm-setup-open",
            onClick: N[0] || (N[0] = (S) => d.value = !0)
          }, [
            N[8] || (N[8] = e.createElementVNode(
              "i",
              { class: "ri-settings-4-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(V.$t("配置引导")),
              1
              /* TEXT */
            )
          ])) : e.createCommentVNode("v-if", !0),
          e.createElementVNode(
            "div",
            {
              ref_key: "idRoot",
              ref: L,
              class: "mm-id"
            },
            [
              e.createElementVNode("button", {
                type: "button",
                class: e.normalizeClass(["mm-id__pill", { switchable: y.value }]),
                disabled: !e.unref(u),
                title: y.value ? V.$t("切换当前身份") : V.$t("只有管理员可以切换身份"),
                "data-test": "mm-identity",
                onClick: k
              }, [
                f.value?.person ? (e.openBlock(), e.createElementBlock(
                  e.Fragment,
                  { key: 0 },
                  [
                    e.createTextVNode(
                      e.toDisplayString(P.value) + " · " + e.toDisplayString(f.value.person.name),
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
                      e.toDisplayString(V.$t("选择身份")),
                      1
                      /* TEXT */
                    )
                  ],
                  64
                  /* STABLE_FRAGMENT */
                )),
                y.value ? (e.openBlock(), e.createElementBlock("i", BV)) : e.createCommentVNode("v-if", !0)
              ], 10, _V),
              D.value ? (e.openBlock(), e.createElementBlock("div", SV, [
                e.createElementVNode(
                  "p",
                  DV,
                  e.toDisplayString(V.$t("切换后按这个人的角色显示按钮（管理员代办、演示用）")),
                  1
                  /* TEXT */
                ),
                e.unref(we) && e.unref(we) !== f.value?.person?.id && w.value ? (e.openBlock(), e.createElementBlock("button", {
                  key: 0,
                  type: "button",
                  class: "mm-id__back",
                  onClick: N[1] || (N[1] = (S) => h(e.unref(we)))
                }, [
                  N[9] || (N[9] = e.createElementVNode(
                    "i",
                    { class: "ri-arrow-go-back-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(V.$t("回到 {name}（管理员）", { name: w.value })),
                    1
                    /* TEXT */
                  )
                ])) : e.createCommentVNode("v-if", !0),
                e.withDirectives(e.createElementVNode("input", {
                  "onUpdate:modelValue": N[2] || (N[2] = (S) => C.value = S),
                  class: "mm-id__search",
                  type: "search",
                  placeholder: V.$t("搜索姓名")
                }, null, 8, wV), [
                  [e.vModelText, C.value]
                ]),
                z.value ? (e.openBlock(), e.createElementBlock("p", CV, [
                  N[10] || (N[10] = e.createElementVNode(
                    "i",
                    { class: "ri-loader-4-line spin" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(V.$t("正在加载人员…")),
                    1
                    /* TEXT */
                  )
                ])) : R.value ? (e.openBlock(), e.createElementBlock(
                  "p",
                  TV,
                  e.toDisplayString(R.value),
                  1
                  /* TEXT */
                )) : (e.openBlock(), e.createElementBlock("div", IV, [
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(v.value, (S) => (e.openBlock(), e.createElementBlock(
                      e.Fragment,
                      {
                        key: S.id
                      },
                      [
                        e.createElementVNode(
                          "h5",
                          null,
                          e.toDisplayString(S.name),
                          1
                          /* TEXT */
                        ),
                        (e.openBlock(!0), e.createElementBlock(
                          e.Fragment,
                          null,
                          e.renderList(S.people, (x) => (e.openBlock(), e.createElementBlock("button", {
                            key: x.id,
                            type: "button",
                            class: e.normalizeClass(["mm-id__row", { on: x.id === f.value?.person?.id }]),
                            disabled: _.value,
                            "data-test": `mm-identity-${x.id}`,
                            onClick: (re) => h(x.id)
                          }, [
                            e.createElementVNode(
                              "span",
                              {
                                class: "mm-av",
                                style: e.normalizeStyle({ background: e.unref(oe)(x.name).color })
                              },
                              e.toDisplayString(e.unref(oe)(x.name).text),
                              5
                              /* TEXT, STYLE */
                            ),
                            e.createElementVNode(
                              "span",
                              AV,
                              e.toDisplayString(x.name),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "small",
                              null,
                              e.toDisplayString(x.title || ""),
                              1
                              /* TEXT */
                            ),
                            U(x.id) ? (e.openBlock(), e.createElementBlock(
                              "span",
                              jV,
                              e.toDisplayString(V.$t("管理员")),
                              1
                              /* TEXT */
                            )) : e.createCommentVNode("v-if", !0)
                          ], 10, MV))),
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
                    LV,
                    e.toDisplayString(V.$t("找不到人员请联系管理员同步通讯录")),
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
        e.createElementVNode("nav", zV, [
          (e.openBlock(!0), e.createElementBlock(
            e.Fragment,
            null,
            e.renderList($.value, (S) => (e.openBlock(), e.createElementBlock("button", {
              key: S.key,
              type: "button",
              role: "tab",
              class: e.normalizeClass(["mm-tab", { active: s.value === S.key }]),
              "aria-selected": s.value === S.key,
              "data-test": `mm-tab-${S.key}`,
              onClick: (x) => e.unref(he)(S.key)
            }, [
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(S.title),
                1
                /* TEXT */
              ),
              I(S.key) ? (e.openBlock(), e.createElementBlock(
                "em",
                PV,
                e.toDisplayString(I(S.key)),
                1
                /* TEXT */
              )) : e.createCommentVNode("v-if", !0)
            ], 10, FV))),
            128
            /* KEYED_FRAGMENT */
          ))
        ])
      ]),
      a.value && !e.unref(u) ? (e.openBlock(), e.createElementBlock("p", UV, [
        N[13] || (N[13] = e.createElementVNode(
          "i",
          { class: "ri-error-warning-line" },
          null,
          -1
          /* CACHED */
        )),
        e.createElementVNode(
          "span",
          null,
          e.toDisplayString(a.value),
          1
          /* TEXT */
        ),
        e.createElementVNode(
          "button",
          {
            type: "button",
            class: "ss-link",
            onClick: H
          },
          e.toDisplayString(V.$t("重试")),
          1
          /* TEXT */
        )
      ])) : e.unref(u) ? (e.openBlock(), e.createElementBlock(
        e.Fragment,
        { key: 2 },
        [
          e.unref(u).org.peopleCount === 0 ? (e.openBlock(), e.createElementBlock("p", RV, [
            N[15] || (N[15] = e.createElementVNode(
              "i",
              { class: "ri-team-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(c.value ? V.$t("还没有组织人员：可在「系统设置 → 通讯录同步」同步企业微信通讯录，也可以先载入演示数据走一遍全流程。") : V.$t("还没有组织人员，请联系管理员同步通讯录。")),
              1
              /* TEXT */
            ),
            c.value ? (e.openBlock(), e.createElementBlock("button", {
              key: 0,
              type: "button",
              class: "ss-btn sm primary",
              disabled: m.value,
              "data-test": "mm-demo-load",
              onClick: Q
            }, [
              e.createElementVNode(
                "i",
                {
                  class: e.normalizeClass(m.value ? "ri-loader-4-line spin" : "ri-magic-line")
                },
                null,
                2
                /* CLASS */
              ),
              e.createTextVNode(
                e.toDisplayString(V.$t("载入演示数据")),
                1
                /* TEXT */
              )
            ], 8, qV)) : e.createCommentVNode("v-if", !0)
          ])) : f.value?.person ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock("p", KV, [
            N[16] || (N[16] = e.createElementVNode(
              "i",
              { class: "ri-user-search-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(V.$t("还没有选择当前身份：点右上角选择你是谁，按钮按你的角色显示。")),
              1
              /* TEXT */
            ),
            y.value ? (e.openBlock(), e.createElementBlock(
              "button",
              {
                key: 0,
                type: "button",
                class: "ss-btn sm",
                onClick: G
              },
              e.toDisplayString(V.$t("选择身份")),
              1
              /* TEXT */
            )) : e.createCommentVNode("v-if", !0)
          ])),
          (e.openBlock(), e.createElementBlock("div", {
            key: o.value,
            class: "mm-body"
          }, [
            s.value === "home" ? (e.openBlock(), e.createBlock(
              oa,
              {
                key: 0,
                ref_key: "tabRef",
                ref: g,
                onRole: N[3] || (N[3] = (S) => F("home", S))
              },
              null,
              512
              /* NEED_PATCH */
            )) : s.value === "meetings" ? (e.openBlock(), e.createBlock(
              Kc,
              {
                key: 1,
                ref_key: "tabRef",
                ref: g,
                onRole: N[4] || (N[4] = (S) => F("meetings", S))
              },
              null,
              512
              /* NEED_PATCH */
            )) : s.value === "tasks" ? (e.openBlock(), e.createBlock(
              gu,
              {
                key: 2,
                ref_key: "tabRef",
                ref: g,
                onRole: N[5] || (N[5] = (S) => F("tasks", S))
              },
              null,
              512
              /* NEED_PATCH */
            )) : s.value === "projects" ? (e.openBlock(), e.createBlock(
              ik,
              {
                key: 3,
                ref_key: "tabRef",
                ref: g,
                onRole: N[6] || (N[6] = (S) => F("projects", S))
              },
              null,
              512
              /* NEED_PATCH */
            )) : s.value === "settings" ? (e.openBlock(), e.createBlock(
              IE,
              {
                key: 4,
                ref_key: "tabRef",
                ref: g
              },
              null,
              512
              /* NEED_PATCH */
            )) : e.createCommentVNode("v-if", !0)
          ]))
        ],
        64
        /* STABLE_FRAGMENT */
      )) : (e.openBlock(), e.createElementBlock("p", OV, [
        N[14] || (N[14] = e.createElementVNode(
          "i",
          { class: "ri-loader-4-line spin" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(V.$t("正在加载工作台…")),
          1
          /* TEXT */
        )
      ])),
      d.value ? (e.openBlock(), e.createBlock(EV, {
        key: 3,
        onClose: N[7] || (N[7] = (S) => d.value = !1),
        onDone: A
      })) : e.createCommentVNode("v-if", !0)
    ]));
  }
}), GV = /* @__PURE__ */ le(HV, [["__scopeId", "data-v-dba3778c"]]), pt = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["npm:pinyin-pro"];
if (!pt) throw new Error("宿主模块未就绪：npm:pinyin-pro");
pt.default;
const WV = /* @__PURE__ */ Wt({
  __proto__: null
}, [pt]);
export {
  GV as default
};
