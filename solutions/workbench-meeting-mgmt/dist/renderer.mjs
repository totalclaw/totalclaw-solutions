function Zt(l, v) {
  for (var n = 0; n < v.length; n++) {
    const u = v[n];
    if (typeof u != "string" && !Array.isArray(u)) {
      for (const y in u)
        if (y !== "default" && !(y in l)) {
          const s = Object.getOwnPropertyDescriptor(u, y);
          s && Object.defineProperty(l, y, s.get ? s : {
            enumerable: !0,
            get: () => u[y]
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
const ce = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/stores/notification.ts"];
if (!ce) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/stores/notification.ts");
ce.default;
const St = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/components/PageBackButton.vue"];
if (!St) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/components/PageBackButton.vue");
const Xt = St.default, dt = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/utils/ipcPlain.ts"];
if (!dt) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/utils/ipcPlain.ts");
dt.default;
const x = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/workbenches/service-settlement/shared.ts"];
if (!x) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/workbenches/service-settlement/shared.ts");
x.default;
async function J(l, v) {
  const n = window.electronAPI?.workbenches?.meetingMgmt;
  if (!n?.invoke) throw new Error(t.t("泰途会议智能管理接口不可用，请重启应用"));
  return n.invoke(l, dt.toPlain(v ?? {}));
}
function _e(l) {
  const v = window.electronAPI?.workbenches?.meetingMgmt;
  return v?.onEvent ? v.onEvent(l) : () => {
  };
}
const Ve = {
  contacts: "https://work.weixin.qq.com/wework_admin/frame#contacts",
  apps: "https://work.weixin.qq.com/wework_admin/frame#apps",
  profile: "https://work.weixin.qq.com/wework_admin/frame#profile",
  webhookDoc: "https://developer.work.weixin.qq.com/document/path/91770"
};
function pe(l) {
  if (!l) return;
  const v = window.electronAPI;
  typeof v?.openExternal == "function" ? v.openExternal(l) : typeof v?.shell?.openExternal == "function" ? v.shell.openExternal(l) : window.open(l, "_blank", "noopener");
}
const oe = e.ref(null), gt = e.ref(!1);
async function de() {
  const l = await J("boot");
  return oe.value = l, l;
}
const We = e.ref(""), Ne = e.ref({ tab: "home", seq: 0 });
function ve(l) {
  Ne.value = { tab: l, seq: Ne.value.seq + 1 };
}
const nt = e.ref("");
function xt(l) {
  nt.value = l, ve("settings");
}
function me(l) {
  const v = l.kind === "task" ? "tasks" : l.kind === "meeting" || l.kind === "meeting_plan" ? "meetings" : "projects";
  Ne.value = { tab: v, link: l, seq: Ne.value.seq + 1 };
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
function el(l) {
  const v = Dt.findIndex((n) => n.statuses.includes(l));
  return v < 0 ? 0 : v;
}
const ot = {
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
function mt(l) {
  return l ? l.stage === "review" ? t.t("异议处理中 · 待复核") : l.stage === "dept_reply" ? t.t("异议处理中 · 待部门回应") : l.stage === "arbitration" ? t.t("异议处理中 · 待裁决") : "" : "";
}
const at = {
  content: t.t("任务内容"),
  time: t.t("时间节点"),
  requirement: t.t("执行要求")
}, Ge = {
  active: t.t("进行中"),
  closing: t.t("结项中"),
  archived: t.t("已归档")
}, tl = {
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
}, ll = {
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
}, nl = {
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
}, ft = ["#e05a8a", "#3b82f6", "#f59e0b", "#8b5cf6", "#ef4444", "#0ea5a4", "#16a34a", "#6366f1", "#d97706", "#0284c7"];
function re(l) {
  const v = String(l || "?");
  let n = 0;
  for (const u of v) n = n * 31 + u.charCodeAt(0) >>> 0;
  return { text: v.slice(0, 1), color: ft[n % ft.length] };
}
const ut = (l) => l && /^\d{4}-\d{2}-\d{2}$/.test(l) ? l.slice(5) : l || "-";
function st(l) {
  if (!l) return "-";
  const v = new Date(l), n = (u) => String(u).padStart(2, "0");
  return `${v.getFullYear()}-${n(v.getMonth() + 1)}-${n(v.getDate())}`;
}
function Ae(l) {
  const v = Math.max(0, Math.floor(l || 0)), n = Math.floor(v / 3600), u = Math.floor(v % 3600 / 60), y = v % 60, s = (o) => String(o).padStart(2, "0");
  return n ? `${n}:${s(u)}:${s(y)}` : `${s(u)}:${s(y)}`;
}
function ol(l, v = Date.now()) {
  if (!l) return "";
  const n = v - l;
  if (n < 6e4) return t.t("刚刚");
  if (n < 36e5) return t.t("{n} 分钟前", { n: Math.floor(n / 6e4) });
  const u = new Date(l), y = (i) => String(i).padStart(2, "0"), s = new Date(v), o = new Date(v - 864e5), c = `${y(u.getHours())}:${y(u.getMinutes())}`;
  return u.toDateString() === s.toDateString() ? t.t("今天 {t}", { t: c }) : u.toDateString() === o.toDateString() ? t.t("昨天 {t}", { t: c }) : `${y(u.getMonth() + 1)}-${y(u.getDate())} ${c}`;
}
const rt = e.ref(!1), lt = e.ref(""), wt = "totalclaw:meeting-mgmt-operator:v1";
function al() {
  try {
    return localStorage.getItem(wt) || "";
  } catch {
    return "";
  }
}
const Ie = e.ref(al());
function sl(l) {
  Ie.value = l;
  try {
    localStorage.setItem(wt, l);
  } catch {
  }
}
let Me = null;
function De(l = !1) {
  if (!l && Me && Date.now() - Me.at < 3e4) return Me.data;
  const v = J("people.list").then((n) => ({ depts: n?.depts ?? [], people: n?.people ?? [] }));
  return Me = { at: Date.now(), data: v }, v.catch(() => {
    Me = null;
  }), v;
}
function He() {
  Me = null;
}
function Ct(l, v = "", n) {
  const u = v.trim().toLowerCase(), y = l.people.filter((i) => !i.left && !0 && (!u || i.name.toLowerCase().includes(u) || (i.title || "").toLowerCase().includes(u))), s = [], o = /* @__PURE__ */ new Set();
  for (const i of l.depts) {
    const k = y.filter((E) => E.deptId === i.id);
    o.add(i.id), k.length && s.push({ id: i.id, name: i.name, people: k });
  }
  const c = y.filter((i) => !o.has(i.deptId));
  return c.length && s.push({ id: "", name: t.t("其他"), people: c }), s;
}
const fe = (l) => String(l).padStart(2, "0");
function he(l) {
  if (!l) return "-";
  const v = new Date(l);
  return `${v.getFullYear()}-${fe(v.getMonth() + 1)}-${fe(v.getDate())} ${fe(v.getHours())}:${fe(v.getMinutes())}`;
}
function Tt(l) {
  if (!l) return "-";
  const v = new Date(l);
  return `${fe(v.getMonth() + 1)}-${fe(v.getDate())}`;
}
function Ye(l) {
  const v = new Date(l);
  return `${v.getFullYear()}-${fe(v.getMonth() + 1)}-${fe(v.getDate())}`;
}
function rl(l) {
  const v = new Date(l);
  return `${Ye(l)}T${fe(v.getHours())}:${fe(v.getMinutes())}`;
}
function il(l) {
  const v = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(l || "");
  return v ? new Date(+v[1], +v[2] - 1, +v[3], +v[4], +v[5]).getTime() : NaN;
}
function cl(l) {
  const v = Number(l) || 0;
  return v >= 1024 ** 3 ? `${(v / 1024 ** 3).toFixed(2)} GB` : v >= 1024 ** 2 ? `${(v / 1024 ** 2).toFixed(1)} MB` : v >= 1024 ? `${Math.round(v / 1024)} KB` : `${v} B`;
}
function dl(l) {
  const v = Math.round(Number(l) || 0);
  if (!v) return "";
  const n = Math.max(1, Math.round(v / 60));
  return n < 60 ? t.t("{n} 分钟", { n }) : t.t("{h} 小时 {m} 分", { h: Math.floor(n / 60), m: fe(n % 60) });
}
function ml(l) {
  const v = Math.max(0, Math.floor(l / 1e3));
  if (v < 60) return t.t("{n} 秒", { n: v });
  const n = Math.floor(v / 60);
  return n < 60 ? t.t("{m} 分 {s} 秒", { m: n, s: v % 60 }) : t.t("{h} 小时 {m} 分", { h: Math.floor(n / 60), m: fe(n % 60) });
}
function ul(l) {
  return l >= 5 && l < 11 ? t.t("早上好") : l >= 11 && l < 13 ? t.t("中午好") : l >= 13 && l < 18 ? t.t("下午好") : t.t("晚上好");
}
const pl = () => [t.t("周日"), t.t("周一"), t.t("周二"), t.t("周三"), t.t("周四"), t.t("周五"), t.t("周六")];
function Nt(l, v = Date.now()) {
  const n = /^(\d{4})-(\d{2})-(\d{2})$/.exec(l || "");
  if (!n) return { day: "", md: l || "-" };
  const u = `${n[2]}-${n[3]}`;
  if (l === Ye(v)) return { day: t.t("今天"), md: u };
  if (l === Ye(v + 864e5)) return { day: t.t("明天"), md: u };
  const y = new Date(+n[1], +n[2] - 1, +n[3]).getDay();
  return { day: pl()[y], md: u };
}
const Fe = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九", "十"];
function vl(l) {
  const v = l + 1;
  let n = !1;
  try {
    n = String(t.i18n.global.locale.value || "zh-CN") === "zh-CN";
  } catch {
    n = !0;
  }
  if (!n) return String(v);
  const u = Fe[10];
  return v <= 10 ? Fe[v] : v < 20 ? u + Fe[v - 10] : v < 100 ? Fe[Math.floor(v / 10)] + u + (v % 10 ? Fe[v % 10] : "") : String(v);
}
const pt = {
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
function Et(l, v) {
  const n = Array.isArray(l) ? l : [], u = {
    all: n.length,
    meeting: n.filter((o) => o.group === "meeting").length,
    task: n.filter((o) => o.group === "task").length,
    project: n.filter((o) => o.group === "project").length
  }, y = v === "all" ? n : n.filter((o) => o.group === v), s = (o) => y.filter((c) => c.urgency === o).sort((c, i) => (c.at || 0) - (i.at || 0));
  return { counts: u, urgent: s("urgent"), today: s("today"), week: s("week") };
}
function kl(l) {
  if (!l) return "";
  const v = l.me?.person?.name;
  if (v && (l.projects || []).some((u) => u.ownerName === v)) return t.t("项目负责人");
  const n = new Set((l.todos || []).map((u) => u.type));
  return n.has("arbitrate") || n.has("review_report") ? t.t("项目负责人") : n.has("review_minutes") || n.has("assign_speaker") || n.has("decide_tasks") || n.has("assign_owner") || n.has("retry_process") ? t.t("主持人") : n.has("confirm_plan") || n.has("review_objection") ? t.t("任务负责人") : n.has("accept_task") || n.has("update_progress") || n.has("dept_reply") ? t.t("部门负责人") : n.has("confirm_speech") ? t.t("发言人") : l.me?.isAdmin ? t.t("管理员") : t.t("项目成员");
}
function yl(l, v) {
  if (!l) return "";
  const n = l.meeting.status;
  return l.my.isPlanOwner && (n === "plan_confirm" || n === "dispatched") ? t.t("任务负责人") : l.my.isHost ? t.t("主持人") : l.my.isPlanOwner ? t.t("任务负责人") : l.my.isSpeaker ? t.t("发言人") : v && l.meeting.attendeeIds.includes(v) ? t.t("参会人") : t.t("项目成员");
}
function Le(l, v) {
  return l.speakers.find((n) => n.label === v)?.personId;
}
function xe(l, v) {
  const n = Le(l.meeting, v);
  return n && l.names[n] ? l.names[n].name : t.t("未识别 {label}", { label: v });
}
function gl(l, v, n) {
  if (l.my.myLabels.includes(v)) return !0;
  const u = Le(l.meeting, v);
  return !!n && u === n;
}
function fl(l) {
  const v = l.meeting, n = new Map(v.segments.map((c) => [c.id, c])), u = /* @__PURE__ */ new Set(), y = [], s = (c) => {
    const i = [];
    for (const k of c) {
      const E = n.get(k);
      if (!E) continue;
      const m = xe(l, E.speakerLabel);
      i.includes(m) || i.push(m);
    }
    return i;
  };
  for (const c of v.topics || []) {
    const i = (c.segmentIds || []).filter((k) => n.has(k));
    i.forEach((k) => u.add(k)), y.push({ id: c.id, title: c.title, segmentIds: i, speakers: s(i) });
  }
  const o = v.segments.filter((c) => !u.has(c.id)).sort((c, i) => c.start - i.start).map((c) => c.id);
  return o.length && y.push({ id: "__rest", title: y.length ? t.t("其他发言") : t.t("全部发言"), segmentIds: o, speakers: s(o) }), y;
}
function Nl(l, v) {
  const n = l?.log?.length ? l.log[l.log.length - 1].at : void 0;
  return Math.max(v || 0, n || 0, l?.startedAt || 0) || void 0;
}
const Vl = 10 * 6e4, It = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["npm:qrcode"];
if (!It) throw new Error("宿主模块未就绪：npm:qrcode");
const Mt = It.default;
function Ce(l) {
  return !!l.objection && l.objection.stage !== "resolved";
}
function El(l) {
  if (Ce(l)) {
    const v = l.objection.stage;
    if (v === "review") return t.t("待复核");
    if (v === "dept_reply") return t.t("待部门回应");
    if (v === "arbitration") return t.t("待裁决");
  }
  return Ue[l.status] ?? l.status;
}
function $l(l) {
  return Ce(l) ? mt(l.objection) : Ue[l.status] ?? l.status;
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
function bl(l) {
  return l.status === "done" || l.status === "cancelled" ? "done" : l.status === "to_accept" || Ce(l) ? "action" : "doing";
}
function $t(l) {
  const v = (n) => n.status === "done" || n.status === "cancelled" ? 1 : 0;
  return [...l].sort((n, u) => v(n) - v(u) || +!!u.overdue - +!!n.overdue || String(n.due || "9999").localeCompare(String(u.due || "9999")) || String(n.title).localeCompare(String(u.title)));
}
function hl(l, v) {
  if (v === "status")
    return [
      { key: "action", title: t.t("需要处理") },
      { key: "doing", title: t.t("进行中") },
      { key: "done", title: t.t("已完成") }
    ].map((y) => ({ key: y.key, title: y.title, tasks: $t(l.filter((s) => bl(s) === y.key)), collapsedByDefault: y.key === "done" })).filter((y) => y.tasks.length > 0);
  const n = /* @__PURE__ */ new Map();
  for (const u of l) {
    const y = v === "project" ? u.projectId : u.deptId, s = (v === "project" ? u.projectName : u.deptName) || t.t("未分类"), o = n.get(y) ?? { title: s, tasks: [] };
    o.tasks.push(u), n.set(y, o);
  }
  return [...n.entries()].map(([u, y]) => ({ key: u, title: y.title, tasks: $t(y.tasks), collapsedByDefault: !1 })).sort((u, y) => u.title.localeCompare(y.title, "zh-CN"));
}
function _l(l, v) {
  const n = v.trim().toLowerCase();
  return n ? l.filter((u) => [u.title, u.meetingTitle, u.deptName, u.assigneeName, u.ownerName, u.projectName, u.standard].some((y) => String(y || "").toLowerCase().includes(n))) : l;
}
function Ee(l) {
  const v = Number(l);
  return Number.isFinite(v) ? Math.max(0, Math.min(100, Math.round(v))) : 0;
}
function vt(l, v) {
  return v > 0 ? Ee(l / v * 100) : 0;
}
const ke = (l) => String(l).padStart(2, "0");
function $e(l, v = !1) {
  if (!l) return "—";
  const n = new Date(l), u = `${n.getFullYear()}-${ke(n.getMonth() + 1)}-${ke(n.getDate())} ${ke(n.getHours())}:${ke(n.getMinutes())}`;
  return v ? `${u}:${ke(n.getSeconds())}` : u;
}
function Pe(l) {
  if (!l) return "";
  const v = new Date(l);
  return `${ke(v.getMonth() + 1)}-${ke(v.getDate())} ${ke(v.getHours())}:${ke(v.getMinutes())}`;
}
function it(l) {
  if (!l) return "";
  const v = new Date(l);
  return `${ke(v.getMonth() + 1)}-${ke(v.getDate())}`;
}
function Bl(l = Date.now()) {
  const v = new Date(l);
  return `${v.getFullYear()}-${ke(v.getMonth() + 1)}-${ke(v.getDate())}`;
}
function ct(l, v, n = "") {
  if (!v) return n;
  const u = l?.[v];
  return u ? typeof u == "string" ? u : u.name || n || v : n || v;
}
const Sl = /* @__PURE__ */ new Set([
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
function Dl(l) {
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
function wl(l) {
  return (l ?? []).filter((v) => Sl.has(v.action)).sort((v, n) => n.at - v.at);
}
function Cl(l) {
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
function Tl(l, v) {
  const n = {}, u = l.title.trim(), y = l.standard.trim(), s = l.due.trim();
  return u && u !== v.title && (n.title = u), y && y !== v.standard && (n.standard = y), s && s !== v.due && (n.due = s), Object.keys(n).length ? n : void 0;
}
function Il(l) {
  return { title: l.title, standard: l.standard, due: l.objection?.suggestedDue || l.due };
}
function Ml(l, v) {
  return v?.review || v?.reply || v?.escalate || v?.arbitrate || Ce(l) ? "objection" : "detail";
}
function Al(l, v, n, u = {}) {
  return v ? u.arbitrate ? t.t("项目负责人") : u.review ? t.t("任务负责人") : u.accept || u.object || u.progress || u.complete || u.change || u.reply || u.escalate || l.assigneeId === v ? t.t("部门负责人") : (l.ownerIds?.length ? l.ownerIds : [l.ownerId]).includes(v) ? t.t("任务负责人") : n && n === v ? t.t("项目负责人") : t.t("项目成员") : "";
}
function jl(l, v) {
  return !l || !v ? "" : l.ownerId === v ? t.t("项目负责人") : l.memberIds.includes(v) ? t.t("项目成员") : "";
}
const jt = ["active", "closing", "archived"];
function Ll(l) {
  const v = jt.indexOf(l);
  return v < 0 ? 0 : v;
}
function zl(l) {
  return l === "active" ? "brand" : l === "closing" ? "warn" : "muted";
}
function Se(l, v = [], n = {}) {
  if (l.kind === "objection") {
    const s = v.find((o) => o.id === l.id)?.objection?.stage === "arbitration" && n.canArbitrate ? t.t("去裁决") : t.t("去处理");
    return { chip: t.t("异议"), tone: "warn", action: s, link: { kind: "task", id: l.id } };
  }
  if (l.kind === "meeting") return { chip: t.t("会议"), tone: "brand", action: t.t("查看"), link: { kind: "meeting", id: l.id } };
  const u = v.find((y) => y.id === l.id)?.overdue;
  return { chip: u ? t.t("逾期") : t.t("未完成"), tone: u ? "bad" : "", action: t.t("查看"), link: { kind: "task", id: l.id } };
}
function bt(l) {
  const v = l ?? [], n = new Set(v.filter((u) => u.kind === "objection").map((u) => u.id));
  return v.filter((u) => !(u.kind === "task" && n.has(u.id)));
}
function Fl(l) {
  return l ? l.kind === "project" ? { projectId: l.id, tab: "overview" } : l.kind === "project_summary" ? { projectId: l.id, tab: "summary" } : l.kind === "report" ? l.anchor ? { projectId: l.id, reportId: l.anchor, tab: "reports" } : { projectId: l.id, reportId: l.id, tab: "reports" } : null : null;
}
function Lt(l, v, n) {
  const u = Math.max(1, Math.ceil(l.length / n)), y = Math.min(Math.max(1, v), u);
  return { rows: l.slice((y - 1) * n, y * n), page: y, pages: u };
}
function Je(l) {
  if (typeof l == "string") return l;
  if (l && typeof l == "object") {
    const v = l;
    for (const n of ["url", "link", "href"]) if (typeof v[n] == "string") return v[n];
  }
  return "";
}
function kt(l, v, n) {
  const u = n.trim().toLowerCase();
  return u ? [l.name, l.title, v].some((y) => String(y || "").toLowerCase().includes(u)) : !0;
}
async function Qe(l) {
  const v = window.electronAPI;
  try {
    if (v?.writeClipboardText) {
      const n = await v.writeClipboardText(l);
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
function Pl(l) {
  if (!l) return "";
  const v = window.electronAPI?.getPathForFile;
  try {
    return (v ? v(l) : l.path) || "";
  } catch {
    return "";
  }
}
const Ul = { class: "mm-mob__bar" }, Ol = { class: "mm-mob__visual" }, Rl = ["title"], ql = ["src", "alt"], Kl = {
  key: 1,
  class: "mm-mob__qr-ph"
}, Hl = {
  key: 1,
  class: "mm-mob__idle-ico",
  "aria-hidden": "true"
}, Wl = { class: "mm-mob__info" }, Gl = { class: "mm-mob__top" }, Yl = { class: "mm-mob__title" }, Jl = { class: "mm-mob__pill" }, Ql = {
  key: 0,
  class: "mono",
  "data-test": "mm-mobile-url"
}, Zl = {
  key: 1,
  class: "muted"
}, Xl = {
  key: 0,
  class: "mm-mob__pill info",
  "data-test": "mm-mobile-public"
}, xl = {
  key: 0,
  class: "mm-mob__desc"
}, en = { class: "mm-mob__note" }, tn = { class: "mm-mob__ops" }, ln = ["disabled"], nn = ["disabled"], on = {
  key: 0,
  class: "ss-note danger mm-mob__strip"
}, an = {
  key: 1,
  class: "ss-note warn mm-mob__lan mm-mob__strip",
  "data-test": "mm-mobile-lan"
}, sn = { class: "mm-card__head" }, rn = ["disabled"], cn = ["disabled"], dn = {
  key: 0,
  class: "ss-note danger"
}, mn = { class: "mm-mob__addr" }, un = {
  key: 0,
  class: "mono",
  "data-test": "mm-mobile-url"
}, pn = {
  key: 1,
  class: "muted"
}, vn = {
  key: 1,
  class: "mm-mob__qr"
}, kn = ["src", "alt"], yn = {
  key: 1,
  class: "mm-mob__qr-ph"
}, gn = { class: "mm-mob__qr-text" }, fn = { class: "mm-mob__qr-acts" }, Nn = {
  key: 2,
  class: "ss-note warn mm-mob__lan",
  "data-test": "mm-mobile-lan"
}, Vn = {
  key: 3,
  class: "ss-note info",
  "data-test": "mm-mobile-public"
}, En = { class: "mm-mob__note" }, $n = { class: "mm-mob-modal__box" }, bn = { class: "mm-mob-modal__head" }, hn = ["src", "alt"], _n = {
  key: 0,
  class: "mono"
}, Bn = /* @__PURE__ */ e.defineComponent({
  __name: "MobileAccessCard",
  props: {
    compact: { type: Boolean }
  },
  setup(l) {
    const v = ce.useNotificationStore(), n = e.ref({ ...oe.value?.mobile ?? {}, running: !!oe.value?.mobile.running }), u = e.ref(!1), y = e.ref(""), s = e.ref(""), o = e.ref(""), c = e.ref(!1), i = e.computed(() => oe.value?.me?.person ?? null), k = e.computed(() => !!oe.value?.me?.isAdmin);
    async function E() {
      if (s.value = "", o.value = "", c.value = !1, !(!n.value.running || !i.value))
        try {
          const g = Je(await J("mobile.link", {}));
          if (!g) return;
          s.value = g, o.value = await Mt.toDataURL(g, { margin: 1, width: 264 }).catch(() => "");
        } catch (g) {
          y.value = x.errorMessage(g);
        }
    }
    async function m() {
      try {
        const g = await J("mobile.status");
        g && (n.value = { ...g, running: !!g.running });
      } catch (g) {
        y.value = x.errorMessage(g);
      }
    }
    async function r(g) {
      u.value = !0, y.value = "";
      try {
        const D = await J(g ? "mobile.start" : "mobile.stop");
        D && typeof D == "object" && "running" in D ? n.value = { ...D, running: !!D.running } : await m(), v.success(g ? t.t("手机页服务已开启") : t.t("手机页服务已停止"));
      } catch (D) {
        y.value = x.errorMessage(D);
      } finally {
        u.value = !1;
      }
    }
    async function N() {
      s.value && await Qe(s.value) && v.success(t.t("已复制专属链接"));
    }
    function w(g) {
      g.key === "Escape" && c.value && (c.value = !1);
    }
    e.watch(() => [n.value.running, n.value.url, i.value?.id], () => {
      E();
    });
    let a = null;
    return e.onMounted(() => {
      m().then(E), a = _e((g) => {
        g.type === "mobile" && (n.value = { ...n.value, running: g.running, url: g.url }, oe.value && (oe.value.mobile = { ...oe.value.mobile, running: g.running, url: g.url }), m());
      }), document.addEventListener("keydown", w);
    }), e.onBeforeUnmount(() => {
      a?.(), document.removeEventListener("keydown", w);
    }), (g, D) => (e.openBlock(), e.createElementBlock(
      "section",
      {
        class: e.normalizeClass(["mm-card mm-mob", { "mm-mob--compact": l.compact }]),
        "data-test": "mm-mobile"
      },
      [
        l.compact ? (e.openBlock(), e.createElementBlock(
          e.Fragment,
          { key: 0 },
          [
            e.createElementVNode("div", Ul, [
              e.createElementVNode("div", Ol, [
                n.value.running ? (e.openBlock(), e.createElementBlock(
                  e.Fragment,
                  { key: 0 },
                  [
                    o.value ? (e.openBlock(), e.createElementBlock("button", {
                      key: 0,
                      type: "button",
                      class: "mm-mob__qr-btn",
                      title: g.$t("用手机扫码打开"),
                      onClick: D[0] || (D[0] = (P) => c.value = !0)
                    }, [
                      e.createElementVNode("img", {
                        src: o.value,
                        alt: g.$t("我的手机端专属链接二维码"),
                        width: "84",
                        height: "84",
                        "data-test": "mm-mobile-qr"
                      }, null, 8, ql),
                      D[9] || (D[9] = e.createElementVNode(
                        "span",
                        {
                          class: "mm-mob__qr-zoom",
                          "aria-hidden": "true"
                        },
                        [
                          e.createElementVNode("i", { class: "ri-zoom-in-line" })
                        ],
                        -1
                        /* CACHED */
                      ))
                    ], 8, Rl)) : (e.openBlock(), e.createElementBlock("span", Kl, [...D[10] || (D[10] = [
                      e.createElementVNode(
                        "i",
                        { class: "ri-loader-4-line spin" },
                        null,
                        -1
                        /* CACHED */
                      )
                    ])]))
                  ],
                  64
                  /* STABLE_FRAGMENT */
                )) : (e.openBlock(), e.createElementBlock("span", Hl, [...D[11] || (D[11] = [
                  e.createElementVNode(
                    "i",
                    { class: "ri-smartphone-line" },
                    null,
                    -1
                    /* CACHED */
                  )
                ])]))
              ]),
              e.createElementVNode("div", Wl, [
                e.createElementVNode("div", Gl, [
                  e.createElementVNode("span", Yl, [
                    D[12] || (D[12] = e.createElementVNode(
                      "span",
                      {
                        class: "mm-mob__badge-ico",
                        "aria-hidden": "true"
                      },
                      [
                        e.createElementVNode("i", { class: "ri-smartphone-line" })
                      ],
                      -1
                      /* CACHED */
                    )),
                    e.createElementVNode(
                      "h3",
                      null,
                      e.toDisplayString(g.$t("手机端")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "span",
                      {
                        class: e.normalizeClass(["mm-tag", n.value.running ? "ok" : ""]),
                        "data-test": "mm-mobile-state"
                      },
                      e.toDisplayString(n.value.running ? g.$t("运行中") : g.$t("未开启")),
                      3
                      /* TEXT, CLASS */
                    )
                  ]),
                  e.createElementVNode("span", Jl, [
                    e.createElementVNode(
                      "small",
                      null,
                      e.toDisplayString(g.$t("局域网地址")),
                      1
                      /* TEXT */
                    ),
                    n.value.running && n.value.url ? (e.openBlock(), e.createElementBlock(
                      "b",
                      Ql,
                      e.toDisplayString(n.value.url),
                      1
                      /* TEXT */
                    )) : (e.openBlock(), e.createElementBlock(
                      "b",
                      Zl,
                      e.toDisplayString(k.value ? g.$t("服务未开启") : g.$t("服务未开启，请管理员在首页开启")),
                      1
                      /* TEXT */
                    ))
                  ]),
                  n.value.publicBase && !(n.value.running && n.value.lanOnly) ? (e.openBlock(), e.createElementBlock("span", Xl, [
                    D[13] || (D[13] = e.createElementVNode(
                      "i",
                      { class: "ri-global-line" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createElementVNode(
                      "span",
                      null,
                      e.toDisplayString(g.$t("消息里的链接用外网地址：{url}", { url: n.value.publicBase })),
                      1
                      /* TEXT */
                    )
                  ])) : e.createCommentVNode("v-if", !0)
                ]),
                n.value.running ? (e.openBlock(), e.createElementBlock("p", xl, [
                  e.createElementVNode(
                    "strong",
                    null,
                    e.toDisplayString(g.$t("用手机扫码打开")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "span",
                    null,
                    e.toDisplayString(i.value ? g.$t("这是 {name} 的专属链接，扫开就是本人身份，不要转发给别人。", { name: i.value.name }) : g.$t("当前身份无效，无法生成专属链接")),
                    1
                    /* TEXT */
                  )
                ])) : e.createCommentVNode("v-if", !0),
                e.createElementVNode(
                  "p",
                  en,
                  e.toDisplayString(g.$t("手机和这台电脑要在同一个网络；第一次开启时系统可能询问是否允许接入网络，请选允许。服务会记住开关，电脑重启后自动开启。")),
                  1
                  /* TEXT */
                )
              ]),
              e.createElementVNode("div", tn, [
                n.value.running && s.value ? (e.openBlock(), e.createElementBlock(
                  e.Fragment,
                  { key: 0 },
                  [
                    e.createElementVNode("button", {
                      type: "button",
                      class: "ss-btn sm",
                      "data-test": "mm-mobile-copy",
                      onClick: N
                    }, [
                      D[14] || (D[14] = e.createElementVNode(
                        "i",
                        { class: "ri-file-copy-line" },
                        null,
                        -1
                        /* CACHED */
                      )),
                      e.createTextVNode(
                        e.toDisplayString(g.$t("复制链接")),
                        1
                        /* TEXT */
                      )
                    ]),
                    e.createElementVNode("button", {
                      type: "button",
                      class: "ss-btn sm",
                      "data-test": "mm-mobile-open",
                      onClick: D[1] || (D[1] = (P) => e.unref(pe)(s.value))
                    }, [
                      D[15] || (D[15] = e.createElementVNode(
                        "i",
                        { class: "ri-external-link-line" },
                        null,
                        -1
                        /* CACHED */
                      )),
                      e.createTextVNode(
                        e.toDisplayString(g.$t("在浏览器打开")),
                        1
                        /* TEXT */
                      )
                    ])
                  ],
                  64
                  /* STABLE_FRAGMENT */
                )) : e.createCommentVNode("v-if", !0),
                k.value ? (e.openBlock(), e.createElementBlock(
                  e.Fragment,
                  { key: 1 },
                  [
                    n.value.running ? (e.openBlock(), e.createElementBlock("button", {
                      key: 1,
                      type: "button",
                      class: "ss-btn sm",
                      disabled: u.value,
                      "data-test": "mm-mobile-stop",
                      onClick: D[3] || (D[3] = (P) => r(!1))
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
                        e.toDisplayString(g.$t("停止服务")),
                        1
                        /* TEXT */
                      )
                    ], 8, nn)) : (e.openBlock(), e.createElementBlock("button", {
                      key: 0,
                      type: "button",
                      class: "ss-btn primary sm",
                      disabled: u.value,
                      "data-test": "mm-mobile-start",
                      onClick: D[2] || (D[2] = (P) => r(!0))
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
                        e.toDisplayString(g.$t("开启手机页服务")),
                        1
                        /* TEXT */
                      )
                    ], 8, ln))
                  ],
                  64
                  /* STABLE_FRAGMENT */
                )) : e.createCommentVNode("v-if", !0)
              ])
            ]),
            y.value ? (e.openBlock(), e.createElementBlock("p", on, [
              D[16] || (D[16] = e.createElementVNode(
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
            ])) : e.createCommentVNode("v-if", !0),
            n.value.running && n.value.lanOnly ? (e.openBlock(), e.createElementBlock("p", an, [
              D[17] || (D[17] = e.createElementVNode(
                "i",
                { class: "ri-wifi-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createElementVNode("span", null, [
                e.createTextVNode(
                  e.toDisplayString(g.$t("这是公司内网地址：手机要连公司 Wi-Fi（和这台电脑同一个网络）才能打开，用 4G 或在公司外面打不开。发到企业微信的消息里也会注明这一点。")) + " ",
                  1
                  /* TEXT */
                ),
                k.value ? (e.openBlock(), e.createElementBlock(
                  e.Fragment,
                  { key: 0 },
                  [
                    e.createTextVNode(
                      e.toDisplayString(g.$t("要在外面也能打开，需要一个外网能访问到这台电脑的地址，填到 系统设置 → 企业微信 →「卡片跳转地址前缀」。")),
                      1
                      /* TEXT */
                    )
                  ],
                  64
                  /* STABLE_FRAGMENT */
                )) : e.createCommentVNode("v-if", !0)
              ])
            ])) : e.createCommentVNode("v-if", !0)
          ],
          64
          /* STABLE_FRAGMENT */
        )) : (e.openBlock(), e.createElementBlock(
          e.Fragment,
          { key: 1 },
          [
            e.createElementVNode("header", sn, [
              e.createElementVNode(
                "h3",
                null,
                e.toDisplayString(g.$t("手机端")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "span",
                {
                  class: e.normalizeClass(["mm-tag", n.value.running ? "ok" : ""]),
                  "data-test": "mm-mobile-state"
                },
                e.toDisplayString(n.value.running ? g.$t("运行中") : g.$t("未开启")),
                3
                /* TEXT, CLASS */
              ),
              D[18] || (D[18] = e.createElementVNode(
                "span",
                { class: "mm-grow" },
                null,
                -1
                /* CACHED */
              )),
              k.value ? (e.openBlock(), e.createElementBlock(
                e.Fragment,
                { key: 0 },
                [
                  n.value.running ? (e.openBlock(), e.createElementBlock("button", {
                    key: 1,
                    type: "button",
                    class: "ss-btn sm",
                    disabled: u.value,
                    "data-test": "mm-mobile-stop",
                    onClick: D[5] || (D[5] = (P) => r(!1))
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
                      e.toDisplayString(g.$t("停止服务")),
                      1
                      /* TEXT */
                    )
                  ], 8, cn)) : (e.openBlock(), e.createElementBlock("button", {
                    key: 0,
                    type: "button",
                    class: "ss-btn primary sm",
                    disabled: u.value,
                    "data-test": "mm-mobile-start",
                    onClick: D[4] || (D[4] = (P) => r(!0))
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
                      e.toDisplayString(g.$t("开启手机页服务")),
                      1
                      /* TEXT */
                    )
                  ], 8, rn))
                ],
                64
                /* STABLE_FRAGMENT */
              )) : e.createCommentVNode("v-if", !0)
            ]),
            y.value ? (e.openBlock(), e.createElementBlock("p", dn, [
              D[19] || (D[19] = e.createElementVNode(
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
            ])) : e.createCommentVNode("v-if", !0),
            e.createElementVNode("div", mn, [
              e.createElementVNode(
                "small",
                null,
                e.toDisplayString(g.$t("局域网地址")),
                1
                /* TEXT */
              ),
              n.value.running && n.value.url ? (e.openBlock(), e.createElementBlock(
                "b",
                un,
                e.toDisplayString(n.value.url),
                1
                /* TEXT */
              )) : (e.openBlock(), e.createElementBlock(
                "b",
                pn,
                e.toDisplayString(k.value ? g.$t("服务未开启") : g.$t("服务未开启，请管理员在首页开启")),
                1
                /* TEXT */
              ))
            ]),
            n.value.running ? (e.openBlock(), e.createElementBlock("div", vn, [
              o.value ? (e.openBlock(), e.createElementBlock("img", {
                key: 0,
                src: o.value,
                alt: g.$t("我的手机端专属链接二维码"),
                width: "132",
                height: "132",
                "data-test": "mm-mobile-qr"
              }, null, 8, kn)) : (e.openBlock(), e.createElementBlock("span", yn, [...D[20] || (D[20] = [
                e.createElementVNode(
                  "i",
                  { class: "ri-loader-4-line spin" },
                  null,
                  -1
                  /* CACHED */
                )
              ])])),
              e.createElementVNode("div", gn, [
                e.createElementVNode(
                  "strong",
                  null,
                  e.toDisplayString(g.$t("用手机扫码打开")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "small",
                  null,
                  e.toDisplayString(i.value ? g.$t("这是 {name} 的专属链接，扫开就是本人身份，不要转发给别人。", { name: i.value.name }) : g.$t("当前身份无效，无法生成专属链接")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode("div", fn, [
                  s.value ? (e.openBlock(), e.createElementBlock(
                    "button",
                    {
                      key: 0,
                      type: "button",
                      class: "ss-link",
                      "data-test": "mm-mobile-copy",
                      onClick: N
                    },
                    e.toDisplayString(g.$t("复制链接")),
                    1
                    /* TEXT */
                  )) : e.createCommentVNode("v-if", !0),
                  s.value ? (e.openBlock(), e.createElementBlock("button", {
                    key: 1,
                    type: "button",
                    class: "ss-link",
                    "data-test": "mm-mobile-open",
                    onClick: D[6] || (D[6] = (P) => e.unref(pe)(s.value))
                  }, [
                    e.createTextVNode(
                      e.toDisplayString(g.$t("在浏览器打开")) + " ",
                      1
                      /* TEXT */
                    ),
                    D[21] || (D[21] = e.createElementVNode(
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
            n.value.running && n.value.lanOnly ? (e.openBlock(), e.createElementBlock("p", Nn, [
              D[22] || (D[22] = e.createElementVNode(
                "i",
                { class: "ri-wifi-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createElementVNode("span", null, [
                e.createTextVNode(
                  e.toDisplayString(g.$t("这是公司内网地址：手机要连公司 Wi-Fi（和这台电脑同一个网络）才能打开，用 4G 或在公司外面打不开。发到企业微信的消息里也会注明这一点。")) + " ",
                  1
                  /* TEXT */
                ),
                k.value ? (e.openBlock(), e.createElementBlock(
                  e.Fragment,
                  { key: 0 },
                  [
                    e.createTextVNode(
                      e.toDisplayString(g.$t("要在外面也能打开，需要一个外网能访问到这台电脑的地址，填到 系统设置 → 企业微信 →「卡片跳转地址前缀」。")),
                      1
                      /* TEXT */
                    )
                  ],
                  64
                  /* STABLE_FRAGMENT */
                )) : e.createCommentVNode("v-if", !0)
              ])
            ])) : n.value.publicBase ? (e.openBlock(), e.createElementBlock("p", Vn, [
              D[23] || (D[23] = e.createElementVNode(
                "i",
                { class: "ri-global-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(g.$t("消息里的链接用外网地址：{url}", { url: n.value.publicBase })),
                1
                /* TEXT */
              )
            ])) : e.createCommentVNode("v-if", !0),
            e.createElementVNode(
              "p",
              En,
              e.toDisplayString(g.$t("手机和这台电脑要在同一个网络；第一次开启时系统可能询问是否允许接入网络，请选允许。服务会记住开关，电脑重启后自动开启。")),
              1
              /* TEXT */
            )
          ],
          64
          /* STABLE_FRAGMENT */
        )),
        (e.openBlock(), e.createBlock(e.Teleport, { to: "body" }, [
          c.value && o.value ? (e.openBlock(), e.createElementBlock("div", {
            key: 0,
            class: "mm-mob-modal",
            role: "dialog",
            "aria-modal": "true",
            onClick: D[8] || (D[8] = e.withModifiers((P) => c.value = !1, ["self"]))
          }, [
            e.createElementVNode("div", $n, [
              e.createElementVNode("div", bn, [
                e.createElementVNode(
                  "strong",
                  null,
                  e.toDisplayString(g.$t("用手机扫码打开")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode("button", {
                  type: "button",
                  class: "mm-mob-modal__close",
                  onClick: D[7] || (D[7] = (P) => c.value = !1)
                }, [...D[24] || (D[24] = [
                  e.createElementVNode(
                    "i",
                    { class: "ri-close-line" },
                    null,
                    -1
                    /* CACHED */
                  )
                ])])
              ]),
              e.createElementVNode("img", {
                src: o.value,
                alt: g.$t("我的手机端专属链接二维码"),
                width: "220",
                height: "220"
              }, null, 8, hn),
              e.createElementVNode(
                "small",
                null,
                e.toDisplayString(i.value ? g.$t("这是 {name} 的专属链接，扫开就是本人身份，不要转发给别人。", { name: i.value.name }) : ""),
                1
                /* TEXT */
              ),
              n.value.url ? (e.openBlock(), e.createElementBlock(
                "b",
                _n,
                e.toDisplayString(n.value.url),
                1
                /* TEXT */
              )) : e.createCommentVNode("v-if", !0)
            ])
          ])) : e.createCommentVNode("v-if", !0)
        ]))
      ],
      2
      /* CLASS */
    ));
  }
}), ae = (l, v) => {
  const n = l.__vccOpts || l;
  for (const [u, y] of v)
    n[u] = y;
  return n;
}, zt = /* @__PURE__ */ ae(Bn, [["__scopeId", "data-v-7e7127bb"]]), Sn = {
  class: "mm-home",
  "data-test": "mm-home"
}, Dn = {
  key: 0,
  class: "ss-note danger"
}, wn = {
  key: 1,
  class: "ss-note"
}, Cn = {
  key: 0,
  class: "ss-note danger mm-home__push",
  "data-test": "mm-home-push-failed"
}, Tn = { class: "mm-card mm-hello" }, In = { class: "mm-hello__text" }, Mn = { "data-test": "mm-home-brief" }, An = {
  key: 0,
  class: "bad"
}, jn = { class: "mm-hello__counts" }, Ln = { class: "mm-home__primary" }, zn = {
  class: "mm-card mm-todos",
  "data-test": "mm-home-todos"
}, Fn = { class: "mm-card__head" }, Pn = { class: "mm-chips" }, Un = ["data-test", "onClick"], On = {
  key: 0,
  class: "mm-empty"
}, Rn = {
  key: 1,
  class: "mm-todos__list"
}, qn = { class: "mm-group__lbl" }, Kn = { class: "mm-group__n" }, Hn = ["data-test", "onClick"], Wn = { class: "mm-todo__tag" }, Gn = { class: "mm-todo__main" }, Yn = { key: 0 }, Jn = ["onClick"], Qn = {
  class: "mm-card mm-card--notices",
  "data-test": "mm-home-notices"
}, Zn = { class: "mm-card__head" }, Xn = {
  key: 0,
  class: "mm-tag bad"
}, xn = ["disabled"], eo = {
  key: 0,
  class: "mm-empty"
}, to = ["data-test", "onClick"], lo = { class: "mm-notices__body" }, no = { class: "mm-notices__top" }, oo = { key: 0 }, ao = { class: "mm-home__bento" }, so = {
  class: "mm-card",
  "data-test": "mm-home-mytasks"
}, ro = { class: "mm-card__head" }, io = {
  key: 0,
  class: "mm-empty"
}, co = {
  key: 1,
  class: "mm-mytasks"
}, mo = ["data-test", "onClick"], uo = { class: "mm-mytasks__day" }, po = { class: "mm-mytasks__body" }, vo = { class: "mm-mytasks__bar" }, ko = { class: "mm-bar" }, yo = { class: "mm-mytasks__pct" }, go = {
  key: 0,
  class: "mm-tag bad"
}, fo = {
  key: 1,
  class: "mm-tag warn"
}, No = {
  class: "mm-card",
  "data-test": "mm-home-projects"
}, Vo = { class: "mm-card__head" }, Eo = {
  key: 0,
  class: "mm-empty"
}, $o = {
  key: 1,
  class: "mm-rows"
}, bo = ["onClick"], ho = {
  key: 0,
  class: "bad"
}, _o = {
  class: "mm-card",
  "data-test": "mm-home-meetings"
}, Bo = { class: "mm-card__head" }, So = {
  key: 0,
  class: "mm-empty mm-empty--row"
}, Do = { class: "mm-empty__msg" }, wo = {
  key: 1,
  class: "mm-rows"
}, Co = ["onClick"], To = { class: "mm-row__main" }, Ke = "", Io = /* @__PURE__ */ e.defineComponent({
  __name: "HomeTab",
  emits: ["role"],
  setup(l, { expose: v, emit: n }) {
    const u = n, y = [
      { key: "all", title: t.t("全部") },
      { key: "meeting", title: t.t("会议") },
      { key: "task", title: t.t("任务") },
      { key: "project", title: t.t("项目") }
    ], s = [
      { key: "urgent", title: t.t("紧急") },
      { key: "today", title: t.t("今天") },
      { key: "week", title: t.t("本周") }
    ], o = e.ref(null), c = e.ref(""), i = e.ref(!1), k = e.ref("all"), E = e.ref(!1), m = e.ref(!1), r = e.ref([]), N = e.computed(() => oe.value?.me ?? o.value?.me ?? null), w = e.computed(() => oe.value?.me?.isAdmin && oe.value?.pushFailed || 0), a = e.computed(() => ul((/* @__PURE__ */ new Date()).getHours())), g = e.computed(() => Et(o.value?.todos ?? [], "all")), D = e.computed(() => Et(o.value?.todos ?? [], k.value)), P = e.computed(() => g.value.today.length), j = e.computed(() => {
      const V = g.value.urgent.length, d = P.value;
      let p;
      V && d ? p = t.t("今天有 {urgent}、{n} 件需在今天完成的事项", { urgent: Ke, n: d }) : V ? p = t.t("今天有 {urgent}的事项", { urgent: Ke }) : d ? p = t.t("今天有 {n} 件需在今天完成的事项", { n: d }) : p = t.t("今天没有紧急或需要今天完成的事项");
      const z = p.indexOf(Ke);
      return z < 0 ? { before: p, red: "", after: "" } : { before: p.slice(0, z), red: t.t("{n} 件紧急", { n: V }), after: p.slice(z + Ke.length) };
    }), C = e.computed(() => D.value.urgent.length + D.value.today.length + D.value.week.length), I = e.computed(() => m.value ? r.value : (o.value?.notices ?? []).slice(0, 5)), U = e.computed(() => (o.value?.projects ?? []).some((V) => V.status === "active"));
    function q(V) {
      return V.type === "update_progress" && V.urgency === "urgent" ? t.t("任务逾期") : tl[V.type] || V.type;
    }
    const B = (V) => Math.max(0, Math.min(100, Math.round(Number(V) || 0)));
    async function S() {
      try {
        o.value = await J("home.get"), c.value = "", m.value && (r.value = await J("notice.list", {}));
      } catch (V) {
        c.value = x.errorMessage(V);
      }
    }
    async function b() {
      if (m.value) {
        m.value = !1;
        return;
      }
      try {
        r.value = await J("notice.list", {}), m.value = !0;
      } catch (V) {
        c.value = x.errorMessage(V);
      }
    }
    async function M() {
      i.value = !0;
      try {
        await J("notice.read", { all: !0 }), await S();
      } catch (V) {
        c.value = x.errorMessage(V);
      } finally {
        i.value = !1;
      }
    }
    async function T(V) {
      if (!V.read)
        try {
          await J("notice.read", { ids: [V.id] });
        } catch {
        }
      me(V.link);
    }
    function G() {
      rt.value = !0, ve("meetings");
    }
    return e.watch(() => kl(o.value), (V) => {
      V && u("role", V);
    }, { immediate: !0 }), e.onMounted(() => {
      S();
    }), v({ refresh: S }), (V, d) => (e.openBlock(), e.createElementBlock("div", Sn, [
      c.value ? (e.openBlock(), e.createElementBlock("p", Dn, [
        d[9] || (d[9] = e.createElementVNode(
          "i",
          { class: "ri-error-warning-line" },
          null,
          -1
          /* CACHED */
        )),
        e.createElementVNode(
          "span",
          null,
          e.toDisplayString(c.value),
          1
          /* TEXT */
        ),
        e.createElementVNode(
          "button",
          {
            type: "button",
            class: "ss-link",
            onClick: S
          },
          e.toDisplayString(V.$t("重试")),
          1
          /* TEXT */
        )
      ])) : e.createCommentVNode("v-if", !0),
      !o.value && !c.value ? (e.openBlock(), e.createElementBlock("p", wn, [
        d[10] || (d[10] = e.createElementVNode(
          "i",
          { class: "ri-loader-4-line spin" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(V.$t("正在加载首页…")),
          1
          /* TEXT */
        )
      ])) : e.createCommentVNode("v-if", !0),
      o.value ? (e.openBlock(), e.createElementBlock(
        e.Fragment,
        { key: 2 },
        [
          w.value ? (e.openBlock(), e.createElementBlock("p", Cn, [
            d[11] || (d[11] = e.createElementVNode(
              "i",
              { class: "ri-error-warning-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(V.$t("有 {n} 条企微通知没发出去，相关的人可能没收到卡片（系统内消息照常有）", { n: w.value })),
              1
              /* TEXT */
            ),
            e.createElementVNode(
              "button",
              {
                type: "button",
                class: "ss-link",
                onClick: d[0] || (d[0] = (p) => e.unref(xt)("wecom"))
              },
              e.toDisplayString(V.$t("查看并重发")),
              1
              /* TEXT */
            )
          ])) : e.createCommentVNode("v-if", !0),
          e.createCommentVNode(" 问候与核心指标 "),
          e.createElementVNode("section", Tn, [
            e.createElementVNode("div", In, [
              e.createElementVNode(
                "h2",
                null,
                e.toDisplayString(V.$t("{greet}，{name}", { greet: a.value, name: o.value.greetingName || N.value?.person?.name || "" })),
                1
                /* TEXT */
              ),
              e.createElementVNode("p", Mn, [
                e.createTextVNode(
                  e.toDisplayString(j.value.before),
                  1
                  /* TEXT */
                ),
                j.value.red ? (e.openBlock(), e.createElementBlock(
                  "b",
                  An,
                  e.toDisplayString(j.value.red),
                  1
                  /* TEXT */
                )) : e.createCommentVNode("v-if", !0),
                e.createTextVNode(
                  e.toDisplayString(j.value.after),
                  1
                  /* TEXT */
                )
              ])
            ]),
            e.createElementVNode("div", jn, [
              e.createElementVNode(
                "div",
                {
                  class: e.normalizeClass(["mm-count", { brand: o.value.counts.todos > 0, zero: !o.value.counts.todos }])
                },
                [
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
                    e.toDisplayString(V.$t("待处理")),
                    1
                    /* TEXT */
                  )
                ],
                2
                /* CLASS */
              ),
              e.createElementVNode(
                "div",
                {
                  class: e.normalizeClass(["mm-count", { warn: o.value.counts.dueToday > 0, zero: !o.value.counts.dueToday }]),
                  role: "button",
                  tabindex: "0",
                  onClick: d[1] || (d[1] = (p) => e.unref(ve)("tasks")),
                  onKeydown: d[2] || (d[2] = e.withKeys((p) => e.unref(ve)("tasks"), ["enter"]))
                },
                [
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
                    e.toDisplayString(V.$t("今日到期")),
                    1
                    /* TEXT */
                  )
                ],
                34
                /* CLASS, NEED_HYDRATION */
              ),
              e.createElementVNode(
                "div",
                {
                  class: e.normalizeClass(["mm-count", { bad: o.value.counts.overdue > 0, zero: !o.value.counts.overdue }]),
                  role: "button",
                  tabindex: "0",
                  onClick: d[3] || (d[3] = (p) => e.unref(ve)("tasks")),
                  onKeydown: d[4] || (d[4] = e.withKeys((p) => e.unref(ve)("tasks"), ["enter"]))
                },
                [
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
                    e.toDisplayString(V.$t("逾期")),
                    1
                    /* TEXT */
                  )
                ],
                34
                /* CLASS, NEED_HYDRATION */
              ),
              e.createElementVNode(
                "div",
                {
                  class: e.normalizeClass(["mm-count", { unread: o.value.counts.unread > 0, zero: !o.value.counts.unread }])
                },
                [
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
                    e.toDisplayString(V.$t("未读通知")),
                    1
                    /* TEXT */
                  )
                ],
                2
                /* CLASS */
              )
            ])
          ]),
          e.createCommentVNode(" 第一工作区：待我处理（主） + 通知（辅），等高并排 "),
          e.createElementVNode("div", Ln, [
            e.createCommentVNode(" 待我处理 "),
            e.createElementVNode("section", zn, [
              e.createElementVNode("header", Fn, [
                d[12] || (d[12] = e.createElementVNode(
                  "span",
                  {
                    class: "mm-card__ico brand",
                    "aria-hidden": "true"
                  },
                  [
                    e.createElementVNode("i", { class: "ri-checkbox-circle-line" })
                  ],
                  -1
                  /* CACHED */
                )),
                e.createElementVNode(
                  "h3",
                  null,
                  e.toDisplayString(V.$t("待我处理")),
                  1
                  /* TEXT */
                ),
                d[13] || (d[13] = e.createElementVNode(
                  "span",
                  { class: "mm-grow" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createElementVNode("div", Pn, [
                  (e.openBlock(), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(y, (p) => e.createElementVNode("button", {
                      key: p.key,
                      type: "button",
                      class: e.normalizeClass(["mm-chip", { on: k.value === p.key }]),
                      "data-test": `mm-todo-filter-${p.key}`,
                      onClick: (z) => k.value = p.key
                    }, [
                      e.createTextVNode(
                        e.toDisplayString(p.title) + " ",
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "span",
                        null,
                        e.toDisplayString(D.value.counts[p.key]),
                        1
                        /* TEXT */
                      )
                    ], 10, Un)),
                    64
                    /* STABLE_FRAGMENT */
                  ))
                ])
              ]),
              C.value ? (e.openBlock(), e.createElementBlock("div", Rn, [
                (e.openBlock(), e.createElementBlock(
                  e.Fragment,
                  null,
                  e.renderList(s, (p) => (e.openBlock(), e.createElementBlock(
                    e.Fragment,
                    {
                      key: p.key
                    },
                    [
                      D.value[p.key].length ? (e.openBlock(), e.createElementBlock(
                        "div",
                        {
                          key: 0,
                          class: e.normalizeClass(["mm-group", p.key])
                        },
                        [
                          e.createElementVNode(
                            "span",
                            qn,
                            e.toDisplayString(p.title),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "span",
                            Kn,
                            e.toDisplayString(D.value[p.key].length),
                            1
                            /* TEXT */
                          ),
                          d[15] || (d[15] = e.createElementVNode(
                            "i",
                            { class: "mm-group__line" },
                            null,
                            -1
                            /* CACHED */
                          )),
                          p.key === "week" ? (e.openBlock(), e.createElementBlock("button", {
                            key: 0,
                            type: "button",
                            class: "ss-link",
                            "data-test": "mm-week-toggle",
                            onClick: d[5] || (d[5] = (z) => E.value = !E.value)
                          }, [
                            e.createTextVNode(
                              e.toDisplayString(E.value ? V.$t("收起") : V.$t("展开")),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "i",
                              {
                                class: e.normalizeClass(E.value ? "ri-arrow-up-s-line" : "ri-arrow-down-s-line")
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
                      p.key !== "week" || E.value ? (e.openBlock(!0), e.createElementBlock(
                        e.Fragment,
                        { key: 1 },
                        e.renderList(D.value[p.key], (z) => (e.openBlock(), e.createElementBlock("article", {
                          key: z.id,
                          class: e.normalizeClass(["mm-todo", { urgent: z.urgency === "urgent" }]),
                          "data-test": `mm-todo-${z.id}`,
                          onClick: (X) => e.unref(me)(z.link)
                        }, [
                          e.createElementVNode(
                            "span",
                            Wn,
                            e.toDisplayString(q(z)),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode("div", Gn, [
                            e.createElementVNode(
                              "strong",
                              null,
                              e.toDisplayString(z.title),
                              1
                              /* TEXT */
                            ),
                            z.subtitle ? (e.openBlock(), e.createElementBlock(
                              "small",
                              Yn,
                              e.toDisplayString(z.subtitle),
                              1
                              /* TEXT */
                            )) : e.createCommentVNode("v-if", !0)
                          ]),
                          z.hint ? (e.openBlock(), e.createElementBlock(
                            "span",
                            {
                              key: 0,
                              class: e.normalizeClass(["mm-todo__hint", z.urgency])
                            },
                            e.toDisplayString(z.hint),
                            3
                            /* TEXT, CLASS */
                          )) : e.createCommentVNode("v-if", !0),
                          e.createElementVNode("button", {
                            type: "button",
                            class: e.normalizeClass(["mm-btn", z.urgency === "urgent" ? "primary" : "soft"]),
                            onClick: e.withModifiers((X) => e.unref(me)(z.link), ["stop"])
                          }, e.toDisplayString(e.unref(ll)[z.type]), 11, Jn)
                        ], 10, Hn))),
                        128
                        /* KEYED_FRAGMENT */
                      )) : e.createCommentVNode("v-if", !0)
                    ],
                    64
                    /* STABLE_FRAGMENT */
                  ))),
                  64
                  /* STABLE_FRAGMENT */
                ))
              ])) : (e.openBlock(), e.createElementBlock("p", On, [
                d[14] || (d[14] = e.createElementVNode(
                  "i",
                  {
                    class: "ri-check-double-line",
                    "aria-hidden": "true"
                  },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(V.$t("暂无待办")),
                  1
                  /* TEXT */
                )
              ]))
            ]),
            e.createCommentVNode(" 通知 "),
            e.createElementVNode("section", Qn, [
              e.createElementVNode("header", Zn, [
                d[16] || (d[16] = e.createElementVNode(
                  "span",
                  {
                    class: "mm-card__ico bad",
                    "aria-hidden": "true"
                  },
                  [
                    e.createElementVNode("i", { class: "ri-notification-3-line" })
                  ],
                  -1
                  /* CACHED */
                )),
                e.createElementVNode(
                  "h3",
                  null,
                  e.toDisplayString(V.$t("通知")),
                  1
                  /* TEXT */
                ),
                o.value.counts.unread ? (e.openBlock(), e.createElementBlock(
                  "span",
                  Xn,
                  e.toDisplayString(V.$t("{n} 未读", { n: o.value.counts.unread })),
                  1
                  /* TEXT */
                )) : e.createCommentVNode("v-if", !0),
                d[17] || (d[17] = e.createElementVNode(
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
                  onClick: M
                }, e.toDisplayString(V.$t("全部标为已读")), 9, xn)) : e.createCommentVNode("v-if", !0),
                e.createElementVNode("button", {
                  type: "button",
                  class: "ss-link",
                  "data-test": "mm-notice-all",
                  onClick: b
                }, [
                  e.createTextVNode(
                    e.toDisplayString(m.value ? V.$t("收起") : V.$t("全部")),
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
              I.value.length ? (e.openBlock(), e.createElementBlock(
                "ul",
                {
                  key: 1,
                  class: e.normalizeClass(["mm-notices", { all: m.value }])
                },
                [
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(I.value, (p) => (e.openBlock(), e.createElementBlock("li", {
                      key: p.id,
                      class: e.normalizeClass({ unread: !p.read }),
                      "data-test": `mm-notice-${p.id}`,
                      onClick: (z) => T(p)
                    }, [
                      d[19] || (d[19] = e.createElementVNode(
                        "i",
                        {
                          class: "mm-dot",
                          "aria-hidden": "true"
                        },
                        null,
                        -1
                        /* CACHED */
                      )),
                      e.createElementVNode("div", lo, [
                        e.createElementVNode("div", no, [
                          e.createElementVNode(
                            "strong",
                            null,
                            e.toDisplayString(p.title || e.unref(nl)[p.type]),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "time",
                            null,
                            e.toDisplayString(e.unref(ol)(p.at)),
                            1
                            /* TEXT */
                          )
                        ]),
                        p.summary ? (e.openBlock(), e.createElementBlock(
                          "small",
                          oo,
                          e.toDisplayString(p.summary),
                          1
                          /* TEXT */
                        )) : e.createCommentVNode("v-if", !0)
                      ])
                    ], 10, to))),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ],
                2
                /* CLASS */
              )) : (e.openBlock(), e.createElementBlock("p", eo, [
                d[18] || (d[18] = e.createElementVNode(
                  "i",
                  {
                    class: "ri-mail-check-line",
                    "aria-hidden": "true"
                  },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(V.$t("暂无通知")),
                  1
                  /* TEXT */
                )
              ]))
            ])
          ]),
          e.createCommentVNode(" 第二工作区：三栏平铺（我的任务 / 我参与的项目 / 最近会议），拒绝向下堆叠 "),
          e.createElementVNode("div", ao, [
            e.createCommentVNode(" 我的任务 · 本周截止 "),
            e.createElementVNode("section", so, [
              e.createElementVNode("header", ro, [
                d[21] || (d[21] = e.createElementVNode(
                  "span",
                  {
                    class: "mm-card__ico warn",
                    "aria-hidden": "true"
                  },
                  [
                    e.createElementVNode("i", { class: "ri-calendar-todo-line" })
                  ],
                  -1
                  /* CACHED */
                )),
                e.createElementVNode(
                  "h3",
                  null,
                  e.toDisplayString(V.$t("我的任务 · 本周截止")),
                  1
                  /* TEXT */
                ),
                d[22] || (d[22] = e.createElementVNode(
                  "span",
                  { class: "mm-grow" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createElementVNode("button", {
                  type: "button",
                  class: "ss-link",
                  onClick: d[6] || (d[6] = (p) => e.unref(ve)("tasks"))
                }, [
                  e.createTextVNode(
                    e.toDisplayString(V.$t("全部任务")),
                    1
                    /* TEXT */
                  ),
                  d[20] || (d[20] = e.createElementVNode(
                    "i",
                    { class: "ri-arrow-right-s-line" },
                    null,
                    -1
                    /* CACHED */
                  ))
                ])
              ]),
              o.value.myTasksThisWeek.length ? (e.openBlock(), e.createElementBlock("ul", co, [
                (e.openBlock(!0), e.createElementBlock(
                  e.Fragment,
                  null,
                  e.renderList(o.value.myTasksThisWeek, (p) => (e.openBlock(), e.createElementBlock("li", {
                    key: p.id,
                    "data-test": `mm-mytask-${p.id}`,
                    onClick: (z) => e.unref(me)({ kind: "task", id: p.id })
                  }, [
                    e.createElementVNode("div", uo, [
                      e.createElementVNode(
                        "small",
                        null,
                        e.toDisplayString(e.unref(Nt)(p.due).day),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "b",
                        null,
                        e.toDisplayString(e.unref(Nt)(p.due).md),
                        1
                        /* TEXT */
                      )
                    ]),
                    e.createElementVNode("div", po, [
                      e.createElementVNode(
                        "strong",
                        null,
                        e.toDisplayString(p.title),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode("div", vo, [
                        e.createElementVNode("span", ko, [
                          e.createElementVNode(
                            "i",
                            {
                              class: e.normalizeClass({ bad: p.overdue }),
                              style: e.normalizeStyle({ width: `${B(p.percent)}%` })
                            },
                            null,
                            6
                            /* CLASS, STYLE */
                          )
                        ]),
                        e.createElementVNode(
                          "span",
                          yo,
                          e.toDisplayString(B(p.percent)) + "%",
                          1
                          /* TEXT */
                        ),
                        p.overdue ? (e.openBlock(), e.createElementBlock(
                          "span",
                          go,
                          e.toDisplayString(V.$t("逾期 {n} 天", { n: p.overdueDays })),
                          1
                          /* TEXT */
                        )) : p.objection ? (e.openBlock(), e.createElementBlock(
                          "span",
                          fo,
                          e.toDisplayString(e.unref(mt)(p.objection)),
                          1
                          /* TEXT */
                        )) : e.createCommentVNode("v-if", !0)
                      ])
                    ])
                  ], 8, mo))),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ])) : (e.openBlock(), e.createElementBlock("p", io, [
                d[23] || (d[23] = e.createElementVNode(
                  "i",
                  {
                    class: "ri-calendar-check-line",
                    "aria-hidden": "true"
                  },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(V.$t("没有即将到期或逾期的任务")),
                  1
                  /* TEXT */
                )
              ]))
            ]),
            e.createCommentVNode(" 我参与的项目 "),
            e.createElementVNode("section", No, [
              e.createElementVNode("header", Vo, [
                d[25] || (d[25] = e.createElementVNode(
                  "span",
                  {
                    class: "mm-card__ico brand",
                    "aria-hidden": "true"
                  },
                  [
                    e.createElementVNode("i", { class: "ri-folder-3-line" })
                  ],
                  -1
                  /* CACHED */
                )),
                e.createElementVNode(
                  "h3",
                  null,
                  e.toDisplayString(V.$t("我参与的项目")),
                  1
                  /* TEXT */
                ),
                d[26] || (d[26] = e.createElementVNode(
                  "span",
                  { class: "mm-grow" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createElementVNode("button", {
                  type: "button",
                  class: "ss-link",
                  onClick: d[7] || (d[7] = (p) => e.unref(ve)("projects"))
                }, [
                  e.createTextVNode(
                    e.toDisplayString(V.$t("全部项目")),
                    1
                    /* TEXT */
                  ),
                  d[24] || (d[24] = e.createElementVNode(
                    "i",
                    { class: "ri-arrow-right-s-line" },
                    null,
                    -1
                    /* CACHED */
                  ))
                ])
              ]),
              o.value.projects.length ? (e.openBlock(), e.createElementBlock("ul", $o, [
                (e.openBlock(!0), e.createElementBlock(
                  e.Fragment,
                  null,
                  e.renderList(o.value.projects, (p) => (e.openBlock(), e.createElementBlock("li", {
                    key: p.id,
                    onClick: (z) => e.unref(me)({ kind: "project", id: p.id })
                  }, [
                    e.createElementVNode(
                      "strong",
                      null,
                      e.toDisplayString(p.name),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "span",
                      {
                        class: e.normalizeClass(["mm-tag", p.status === "active" ? "brand" : p.status === "closing" ? "warn" : ""])
                      },
                      e.toDisplayString(e.unref(Ge)[p.status]),
                      3
                      /* TEXT, CLASS */
                    ),
                    d[28] || (d[28] = e.createElementVNode(
                      "span",
                      { class: "mm-grow" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createElementVNode(
                      "small",
                      null,
                      e.toDisplayString(V.$t("任务 {a}/{b}", { a: p.done, b: p.total })),
                      1
                      /* TEXT */
                    ),
                    p.overdue ? (e.openBlock(), e.createElementBlock(
                      "small",
                      ho,
                      e.toDisplayString(V.$t("逾期 {n}", { n: p.overdue })),
                      1
                      /* TEXT */
                    )) : e.createCommentVNode("v-if", !0)
                  ], 8, bo))),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ])) : (e.openBlock(), e.createElementBlock("p", Eo, [
                d[27] || (d[27] = e.createElementVNode(
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
                  "span",
                  null,
                  e.toDisplayString(V.$t("还没有参与的项目")),
                  1
                  /* TEXT */
                )
              ]))
            ]),
            e.createCommentVNode(" 最近会议 "),
            e.createElementVNode("section", _o, [
              e.createElementVNode("header", Bo, [
                d[30] || (d[30] = e.createElementVNode(
                  "span",
                  {
                    class: "mm-card__ico ok",
                    "aria-hidden": "true"
                  },
                  [
                    e.createElementVNode("i", { class: "ri-vidicon-line" })
                  ],
                  -1
                  /* CACHED */
                )),
                e.createElementVNode(
                  "h3",
                  null,
                  e.toDisplayString(V.$t("最近会议")),
                  1
                  /* TEXT */
                ),
                d[31] || (d[31] = e.createElementVNode(
                  "span",
                  { class: "mm-grow" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createElementVNode("button", {
                  type: "button",
                  class: "ss-link",
                  onClick: d[8] || (d[8] = (p) => e.unref(ve)("meetings"))
                }, [
                  e.createTextVNode(
                    e.toDisplayString(V.$t("全部会议")),
                    1
                    /* TEXT */
                  ),
                  d[29] || (d[29] = e.createElementVNode(
                    "i",
                    { class: "ri-arrow-right-s-line" },
                    null,
                    -1
                    /* CACHED */
                  ))
                ])
              ]),
              o.value.recentMeetings.length ? (e.openBlock(), e.createElementBlock("ul", wo, [
                (e.openBlock(!0), e.createElementBlock(
                  e.Fragment,
                  null,
                  e.renderList(o.value.recentMeetings, (p) => (e.openBlock(), e.createElementBlock("li", {
                    key: p.id,
                    onClick: (z) => e.unref(me)({ kind: "meeting", id: p.id })
                  }, [
                    e.createElementVNode("div", To, [
                      e.createElementVNode(
                        "strong",
                        null,
                        e.toDisplayString(p.title),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "small",
                        null,
                        e.toDisplayString(p.projectName) + " · " + e.toDisplayString(e.unref(Tt)(p.time)),
                        1
                        /* TEXT */
                      )
                    ]),
                    e.createElementVNode(
                      "span",
                      {
                        class: e.normalizeClass(["mm-tag", e.unref(pt)[p.status]])
                      },
                      e.toDisplayString(e.unref(Xe)[p.status]),
                      3
                      /* TEXT, CLASS */
                    )
                  ], 8, Co))),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ])) : (e.openBlock(), e.createElementBlock("div", So, [
                e.createElementVNode("span", Do, [
                  d[32] || (d[32] = e.createElementVNode(
                    "i",
                    {
                      class: "ri-mic-line",
                      "aria-hidden": "true"
                    },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createElementVNode(
                    "span",
                    null,
                    e.toDisplayString(V.$t("还没有参加过会议")),
                    1
                    /* TEXT */
                  )
                ]),
                U.value ? (e.openBlock(), e.createElementBlock(
                  "button",
                  {
                    key: 0,
                    type: "button",
                    class: "mm-btn soft sm",
                    "data-test": "mm-home-new-meeting",
                    onClick: G
                  },
                  e.toDisplayString(V.$t("新建会议")),
                  1
                  /* TEXT */
                )) : e.createCommentVNode("v-if", !0)
              ]))
            ])
          ]),
          e.createCommentVNode(" 手机端紧凑横条：扫码 + 链接 + 启停，收成单行不占侧栏 "),
          e.createVNode(zt, { compact: "" })
        ],
        64
        /* STABLE_FRAGMENT */
      )) : e.createCommentVNode("v-if", !0)
    ]));
  }
}), Mo = /* @__PURE__ */ ae(Io, [["__scopeId", "data-v-ea93ab2f"]]), Ao = {
  class: "mm-up",
  "data-test": "mm-upload-panel"
}, jo = {
  key: 0,
  class: "mm-up__zone"
}, Lo = ["disabled"], zo = { class: "mm-up__formats" }, Fo = { class: "ss-muted" }, Po = {
  key: 1,
  class: "ss-note"
}, Uo = { class: "mm-up__proc" }, Oo = { class: "mm-up__stages" }, Ro = { class: "mm-up__bar" }, qo = { class: "mm-up__line" }, Ko = {
  key: 0,
  class: "ss-muted"
}, Ho = {
  key: 1,
  class: "ss-muted"
}, Wo = {
  key: 0,
  class: "ss-note warn",
  "data-test": "mm-process-stalled"
}, Go = {
  key: 1,
  class: "ss-muted"
}, Yo = {
  class: "ss-note danger",
  "data-test": "mm-process-failed"
}, Jo = { class: "ss-actions" }, Qo = ["disabled"], Zo = ["disabled"], Xo = {
  key: 2,
  class: "ss-muted"
}, xo = {
  key: 3,
  class: "ss-note danger"
}, ea = /* @__PURE__ */ e.defineComponent({
  __name: "UploadPanel",
  props: {
    detail: {},
    live: {},
    now: {},
    waitFrom: {}
  },
  emits: ["changed", "log", "wait"],
  setup(l, { emit: v }) {
    const n = l, u = v, y = ce.useNotificationStore(), s = e.ref(!1), o = e.ref(""), c = e.computed(() => n.detail.meeting), i = e.computed(() => n.detail.names[c.value.hostId]?.name || ""), k = e.computed(() => {
      const j = c.value.process;
      return n.live ? { stage: n.live.stage, progress: n.live.progress, text: n.live.text } : { stage: j?.stage || "extract", progress: j?.progress || 0, text: j?.log?.length ? j.log[j.log.length - 1].text : "" };
    }), E = e.computed(() => Math.max(0, Math.min(100, Math.round(k.value.progress || 0)))), m = e.computed(() => {
      const j = c.value.files || [];
      if (j.length && j.every((I) => I.kind === "transcript")) return ["parse", "organize"];
      const C = j.some((I) => I.kind === "video") ? ["extract", "transcribe", "diarize", "organize"] : ["transcribe", "diarize", "organize"];
      return C.includes(k.value.stage) ? C : ["extract", "transcribe", "diarize", "parse", "organize"];
    }), r = e.computed(() => Math.max(0, m.value.indexOf(k.value.stage))), N = e.computed(() => c.value.process?.startedAt || 0), w = e.computed(() => Math.max(Nl(c.value.process, n.live?.at) || 0, n.waitFrom || 0)), a = e.computed(() => !!w.value && n.now - w.value > Vl), g = e.computed(() => Math.floor((n.now - w.value) / 6e4));
    async function D() {
      if (!s.value) {
        s.value = !0, o.value = "";
        try {
          await J("meeting.pickFiles", { id: c.value.id }) && y.success(t.t("文件已上传，开始处理")), u("changed");
        } catch (j) {
          o.value = x.errorMessage(j);
        } finally {
          s.value = !1;
        }
      }
    }
    async function P() {
      if (!s.value) {
        s.value = !0, o.value = "";
        try {
          await J("meeting.retry", { id: c.value.id }), u("changed");
        } catch (j) {
          o.value = x.errorMessage(j);
        } finally {
          s.value = !1;
        }
      }
    }
    return (j, C) => (e.openBlock(), e.createElementBlock("section", Ao, [
      e.createCommentVNode(" 待上传 "),
      c.value.status === "pending_upload" ? (e.openBlock(), e.createElementBlock(
        e.Fragment,
        { key: 0 },
        [
          l.detail.my.isHost ? (e.openBlock(), e.createElementBlock("div", jo, [
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
              e.toDisplayString(j.$t("上传会议录音、录屏或文字记录")),
              1
              /* TEXT */
            ),
            e.createElementVNode(
              "p",
              null,
              e.toDisplayString(j.$t("优先上传录音或录屏：系统按停顿切段转写，再和本场参会人的声纹比对，自动认出谁在说话。只有文字记录时，没有发言人标注的段落要你手动分配。")),
              1
              /* TEXT */
            ),
            e.createElementVNode("button", {
              type: "button",
              class: "ss-btn primary",
              disabled: s.value,
              "data-test": "mm-pick-files",
              onClick: D
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
                e.toDisplayString(s.value ? j.$t("正在拷入文件…") : j.$t("选择文件")),
                1
                /* TEXT */
              )
            ], 8, Lo),
            e.createElementVNode("ul", zo, [
              e.createElementVNode("li", null, [
                e.createElementVNode(
                  "b",
                  null,
                  e.toDisplayString(j.$t("录音")),
                  1
                  /* TEXT */
                ),
                e.createTextVNode(
                  e.toDisplayString(j.$t("mp3、m4a、wav、aac、amr、flac、ogg、opus、wma 等")),
                  1
                  /* TEXT */
                )
              ]),
              e.createElementVNode("li", null, [
                e.createElementVNode(
                  "b",
                  null,
                  e.toDisplayString(j.$t("录屏")),
                  1
                  /* TEXT */
                ),
                e.createTextVNode(
                  e.toDisplayString(j.$t("mp4、mov、mkv、avi、flv、wmv、webm 等，自动提取音轨")),
                  1
                  /* TEXT */
                )
              ]),
              e.createElementVNode("li", null, [
                e.createElementVNode(
                  "b",
                  null,
                  e.toDisplayString(j.$t("文字记录")),
                  1
                  /* TEXT */
                ),
                e.createTextVNode(
                  e.toDisplayString(j.$t("txt、md、docx、srt、vtt、json，跳过转写，按参会昵称匹配员工")),
                  1
                  /* TEXT */
                )
              ])
            ]),
            e.createElementVNode(
              "small",
              Fo,
              e.toDisplayString(j.$t("扩展名不认识的文件会先探测，有音轨就当录音处理；可以一次选多个文件。")),
              1
              /* TEXT */
            )
          ])) : (e.openBlock(), e.createElementBlock("p", Po, [
            C[4] || (C[4] = e.createElementVNode(
              "i",
              { class: "ri-time-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(j.$t("等待主持人 {name} 上传会议文件", { name: i.value })),
              1
              /* TEXT */
            )
          ]))
        ],
        64
        /* STABLE_FRAGMENT */
      )) : c.value.status === "processing" ? (e.openBlock(), e.createElementBlock(
        e.Fragment,
        { key: 1 },
        [
          e.createCommentVNode(" 处理中 "),
          e.createElementVNode("div", Uo, [
            e.createElementVNode("ol", Oo, [
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(m.value, (I, U) => (e.openBlock(), e.createElementBlock(
                  "li",
                  {
                    key: I,
                    class: e.normalizeClass({ done: U < r.value, cur: U === r.value })
                  },
                  [
                    e.createElementVNode(
                      "i",
                      {
                        class: e.normalizeClass(U < r.value ? "ri-checkbox-circle-fill" : U === r.value ? "ri-loader-4-line spin" : "ri-checkbox-blank-circle-line")
                      },
                      null,
                      2
                      /* CLASS */
                    ),
                    e.createTextVNode(
                      e.toDisplayString(e.unref(je)[I]),
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
            e.createElementVNode("div", Ro, [
              e.createElementVNode(
                "i",
                {
                  style: e.normalizeStyle({ width: `${E.value}%` })
                },
                null,
                4
                /* STYLE */
              )
            ]),
            e.createElementVNode("p", qo, [
              e.createElementVNode(
                "b",
                null,
                e.toDisplayString(e.unref(je)[k.value.stage]) + " · " + e.toDisplayString(E.value) + "%",
                1
                /* TEXT */
              ),
              k.value.text ? (e.openBlock(), e.createElementBlock(
                "span",
                Ko,
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
              N.value ? (e.openBlock(), e.createElementBlock(
                "span",
                Ho,
                e.toDisplayString(j.$t("已用时 {t}", { t: e.unref(ml)(l.now - N.value) })),
                1
                /* TEXT */
              )) : e.createCommentVNode("v-if", !0)
            ]),
            a.value ? (e.openBlock(), e.createElementBlock("p", Wo, [
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
                e.toDisplayString(j.$t("已经 {m} 分钟没有新进度。长录音转写较慢，可以继续等待；也可以看看处理日志。", { m: g.value })),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "button",
                {
                  type: "button",
                  class: "ss-link",
                  onClick: C[0] || (C[0] = (I) => u("wait"))
                },
                e.toDisplayString(j.$t("继续等待")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "button",
                {
                  type: "button",
                  class: "ss-link",
                  onClick: C[1] || (C[1] = (I) => u("log"))
                },
                e.toDisplayString(j.$t("查看日志")),
                1
                /* TEXT */
              )
            ])) : (e.openBlock(), e.createElementBlock(
              "small",
              Go,
              e.toDisplayString(j.$t("处理在后台进行，可以先去做别的事；完成后发言人会收到确认通知。")),
              1
              /* TEXT */
            ))
          ])
        ],
        64
        /* STABLE_FRAGMENT */
      )) : c.value.status === "failed" ? (e.openBlock(), e.createElementBlock(
        e.Fragment,
        { key: 2 },
        [
          e.createCommentVNode(" 失败 "),
          e.createElementVNode("p", Yo, [
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
              e.toDisplayString(j.$t("处理失败（{stage}）：{error}", { stage: e.unref(je)[c.value.process?.stage || "extract"], error: c.value.process?.error || j.$t("未知原因") })),
              1
              /* TEXT */
            )
          ]),
          e.createElementVNode("div", Jo, [
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
                e.toDisplayString(j.$t("重试")),
                1
                /* TEXT */
              )
            ], 8, Qo)) : e.createCommentVNode("v-if", !0),
            l.detail.my.isHost ? (e.openBlock(), e.createElementBlock("button", {
              key: 1,
              type: "button",
              class: "ss-btn",
              disabled: s.value,
              onClick: D
            }, [
              C[8] || (C[8] = e.createElementVNode(
                "i",
                { class: "ri-folder-open-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(j.$t("换文件重新上传")),
                1
                /* TEXT */
              )
            ], 8, Zo)) : e.createCommentVNode("v-if", !0),
            e.createElementVNode("button", {
              type: "button",
              class: "ss-btn ghost",
              onClick: C[2] || (C[2] = (I) => u("log"))
            }, [
              C[9] || (C[9] = e.createElementVNode(
                "i",
                { class: "ri-file-list-3-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(j.$t("查看处理日志")),
                1
                /* TEXT */
              )
            ]),
            l.detail.my.isHost ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock(
              "span",
              Xo,
              e.toDisplayString(j.$t("等待主持人 {name} 重试", { name: i.value })),
              1
              /* TEXT */
            ))
          ])
        ],
        64
        /* STABLE_FRAGMENT */
      )) : e.createCommentVNode("v-if", !0),
      o.value ? (e.openBlock(), e.createElementBlock("p", xo, [
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
}), ta = /* @__PURE__ */ ae(ea, [["__scopeId", "data-v-a1e2ccd7"]]), la = ["data-test"], na = ["aria-label", "data-test", "onClick"], oa = ["data-test"], aa = { class: "mm-pss__name" }, sa = { key: 0 }, ra = ["aria-label", "aria-expanded", "aria-activedescendant", "placeholder", "disabled", "data-test"], ia = ["aria-label", "data-test"], ca = {
  key: 3,
  class: "ri-arrow-down-s-line mm-pss__caret",
  "aria-hidden": "true"
}, da = ["aria-multiselectable", "data-test"], ma = { class: "mm-pss-pop__group" }, ua = ["id", "aria-selected", "data-test", "onMouseenter", "onClick"], pa = { class: "mm-pss-pop__name" }, va = { key: 0 }, ka = { key: 1 }, ya = {
  key: 2,
  class: "ri-check-line mm-pss-pop__check",
  "aria-hidden": "true"
}, ga = {
  key: 0,
  class: "mm-pss-pop__empty"
}, fa = /* @__PURE__ */ e.defineComponent({
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
  setup(l, { emit: v }) {
    const n = l, u = v, y = e.ref(null), s = e.ref(null), o = e.ref(null), c = e.ref(!1), i = e.ref(""), k = e.ref(0), E = e.ref(null), m = e.ref(!1), r = e.ref({}), N = `mm-pss-${Math.random().toString(36).slice(2, 9)}`, w = `${N}-list`, a = e.computed(() => n.placeholder || t.t("搜索姓名、拼音或部门")), g = e.computed(() => n.people ?? E.value ?? { depts: [], people: [] }), D = (f) => g.value.depts.find((L) => L.id === f)?.name || "";
    let P = null;
    const j = e.ref(!1);
    function C() {
      P || j.value || Promise.resolve().then(() => A$).then((f) => {
        P = f.pinyin, j.value = !0;
      }).catch(() => {
      });
    }
    const I = /* @__PURE__ */ new Map();
    function U(f) {
      if (!P || !/[㐀-鿿]/.test(f)) return "";
      const L = I.get(f);
      if (L !== void 0) return L;
      let Q = "";
      try {
        const Z = P(f, { toneType: "none", type: "array" }).map((se) => String(se).toLowerCase());
        Q = `${Z.join("")} ${Z.map((se) => se[0] || "").join("")}`;
      } catch {
        Q = "";
      }
      return I.set(f, Q), Q;
    }
    function q(f, L, Q, Z, se = "") {
      const ye = D(Q) || se, be = re(L), Te = n.hint?.(f) || "";
      return j.value, {
        value: f,
        label: L,
        sub: [ye, Z].filter(Boolean).join(" · "),
        hint: Te,
        initial: be.text,
        color: be.color,
        deptId: Q,
        search: `${L} ${ye} ${Z || ""} ${U(L)}`.toLowerCase()
      };
    }
    const B = e.computed(() => {
      const f = n.only ? new Set(n.only) : null, L = new Set(n.exclude ?? []);
      return g.value.people.filter((Q) => !Q.left && (!f || f.has(Q.id)) && !L.has(Q.id)).map((Q) => q(Q.id, Q.name, Q.deptId, Q.title));
    }), S = e.computed(() => (n.extras ?? []).map((f) => {
      const L = re(f.label);
      return { value: f.value, label: f.label, sub: f.sub || "", hint: "", initial: L.text, color: L.color, deptId: "", search: `${f.label} ${f.sub || ""} ${U(f.label)}`.toLowerCase() };
    })), b = e.computed(() => {
      const f = new Set(n.exclude ?? []);
      return (n.pinned ?? []).filter((L) => !f.has(L)).map((L) => {
        const Q = g.value.people.find((se) => se.id === L);
        if (Q) return q(Q.id, Q.name, Q.deptId, Q.title);
        const Z = n.names?.[L];
        return q(L, Z?.name || L, "", void 0, Z?.deptName || "");
      });
    });
    function M(f, L) {
      return L ? L.split(/\s+/).filter(Boolean).every((Q) => f.search.includes(Q)) : !0;
    }
    const T = e.computed(() => {
      const f = i.value.trim().toLowerCase(), L = [], Q = S.value.filter((ue) => M(ue, f));
      Q.length && L.push({ key: "__extras", label: n.extrasLabel || t.t("本场发言人"), options: Q });
      const Z = b.value.filter((ue) => M(ue, f));
      Z.length && L.push({ key: "__pinned", label: n.pinnedLabel || t.t("本场参会人"), options: Z });
      const se = new Set(n.pinned ?? []), ye = B.value.filter((ue) => !se.has(ue.value) && M(ue, f)), be = /* @__PURE__ */ new Set();
      for (const ue of g.value.depts) {
        be.add(ue.id);
        const Re = ye.filter((tt) => tt.deptId === ue.id);
        Re.length && L.push({ key: ue.id, label: ue.name, options: Re });
      }
      const Te = ye.filter((ue) => !be.has(ue.deptId));
      return Te.length && L.push({ key: "__other", label: t.t("其他"), options: Te }), L;
    }), G = e.computed(() => T.value.flatMap((f) => f.options)), V = e.computed(() => n.multiple ? n.values.filter(Boolean) : n.modelValue ? [n.modelValue] : []), d = (f) => V.value.includes(f), p = e.computed(() => n.multiple ? null : X(n.modelValue)), z = e.computed(() => V.value.map(X).filter((f) => !!f));
    function X(f) {
      return f ? S.value.find((L) => L.value === f) ?? b.value.find((L) => L.value === f) ?? B.value.find((L) => L.value === f) ?? (() => {
        const L = g.value.people.find((Z) => Z.id === f), Q = n.names?.[f];
        return L || Q ? q(f, L?.name || Q.name, L?.deptId || "", L?.title, Q?.deptName || "") : null;
      })() : null;
    }
    const le = (f) => `${N}-${f.value.replace(/[^A-Za-z0-9_-]/g, "_")}`;
    function W() {
      const f = y.value;
      if (!f) return;
      const L = f.getBoundingClientRect(), Q = window.innerHeight || 800, Z = Q - L.bottom - 12, se = L.top - 12, ye = Z < 220 && se > Z, be = Math.max(160, Math.min(340, ye ? se : Z));
      r.value = {
        position: "fixed",
        left: `${Math.round(L.left)}px`,
        width: `${Math.round(Math.max(L.width, 260))}px`,
        maxHeight: `${Math.round(be)}px`,
        ...ye ? { bottom: `${Math.round(Q - L.top + 4)}px` } : { top: `${Math.round(L.bottom + 4)}px` }
      };
    }
    function Y() {
      c.value && W();
    }
    function ee() {
      if (n.disabled || c.value) return;
      C(), !n.people && !E.value && !m.value && (m.value = !0, De().then((L) => {
        E.value = L;
      }).catch(() => {
      }).finally(() => {
        m.value = !1;
      })), i.value = "", c.value = !0;
      const f = G.value.findIndex((L) => d(L.value));
      k.value = f >= 0 ? f : 0, W(), window.addEventListener("scroll", Y, !0), window.addEventListener("resize", Y), e.nextTick(_);
    }
    function ne() {
      c.value && (c.value = !1, i.value = "", window.removeEventListener("scroll", Y, !0), window.removeEventListener("resize", Y));
    }
    function $(f) {
      if (!n.disabled) {
        if (f.target !== s.value && f.preventDefault(), c.value && f.target !== s.value) {
          ne();
          return;
        }
        s.value?.focus(), ee();
      }
    }
    function O() {
      ne();
    }
    function R(f) {
      if (!f) return;
      const L = V.value;
      L.includes(f) ? u("update:values", L.filter((Q) => Q !== f)) : (!n.max || L.length < n.max) && u("update:values", [...L, f]), i.value = "";
    }
    function F() {
      if (n.multiple) {
        u("update:values", []);
        return;
      }
      K("");
    }
    function K(f) {
      if (n.multiple) {
        R(f);
        return;
      }
      f !== n.modelValue && (u("update:modelValue", f), u("change", f)), ne(), s.value?.blur();
    }
    function _() {
      const f = G.value[k.value];
      if (!f || !o.value) return;
      o.value.querySelector(`#${CSS.escape(le(f))}`)?.scrollIntoView?.({ block: "nearest" });
    }
    function h(f) {
      if (n.multiple && f.key === "Backspace" && !i.value && V.value.length) {
        R(V.value[V.value.length - 1]);
        return;
      }
      if (!c.value && (f.key === "ArrowDown" || f.key === "Enter")) {
        f.preventDefault(), ee();
        return;
      }
      if (!c.value) return;
      const L = G.value.length;
      if (f.key === "ArrowDown")
        f.preventDefault(), L && (k.value = (k.value + 1) % L), e.nextTick(_);
      else if (f.key === "ArrowUp")
        f.preventDefault(), L && (k.value = (k.value - 1 + L) % L), e.nextTick(_);
      else if (f.key === "Enter") {
        f.preventDefault();
        const Q = G.value[k.value];
        Q && K(Q.value);
      } else f.key === "Escape" ? (f.preventDefault(), f.stopPropagation(), ne()) : f.key === "Tab" && ne();
    }
    return e.watch(() => G.value.length, (f) => {
      k.value >= f && (k.value = Math.max(0, f - 1));
    }), e.watch(() => n.disabled, (f) => {
      f && ne();
    }), e.onMounted(() => {
      !n.people && V.value.length && (m.value = !0, De().then((f) => {
        E.value = f;
      }).catch(() => {
      }).finally(() => {
        m.value = !1;
      }));
    }), e.onBeforeUnmount(ne), (f, L) => (e.openBlock(), e.createElementBlock(
      "div",
      {
        ref_key: "root",
        ref: y,
        class: e.normalizeClass(["mm-pss", { open: c.value, disabled: l.disabled, multi: l.multiple }]),
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
          e.renderList(z.value, (Q) => (e.openBlock(), e.createElementBlock("span", {
            key: Q.value,
            class: "mm-pss__chip",
            "data-test": l.dataTest ? `${l.dataTest}-chip-${Q.value}` : void 0
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
            e.createTextVNode(
              e.toDisplayString(Q.label) + " ",
              1
              /* TEXT */
            ),
            l.disabled ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock("button", {
              key: 0,
              type: "button",
              class: "mm-pss__chip-x",
              "aria-label": f.$t("移除 {name}", { name: Q.label }),
              "data-test": l.dataTest ? `${l.dataTest}-chip-x-${Q.value}` : void 0,
              onMousedown: L[0] || (L[0] = e.withModifiers(() => {
              }, ["prevent", "stop"])),
              onClick: (Z) => R(Q.value)
            }, [...L[5] || (L[5] = [
              e.createElementVNode(
                "i",
                { class: "ri-close-line" },
                null,
                -1
                /* CACHED */
              )
            ])], 40, na))
          ], 8, la))),
          128
          /* KEYED_FRAGMENT */
        )) : e.createCommentVNode("v-if", !0),
        !l.multiple && !c.value && p.value ? (e.openBlock(), e.createElementBlock("span", {
          key: 1,
          class: "mm-pss__value",
          "data-test": l.dataTest ? `${l.dataTest}-value` : void 0
        }, [
          e.createElementVNode(
            "span",
            {
              class: "mm-pss__av",
              style: e.normalizeStyle({ background: p.value.color })
            },
            e.toDisplayString(p.value.initial),
            5
            /* TEXT, STYLE */
          ),
          e.createElementVNode(
            "span",
            aa,
            e.toDisplayString(p.value.label),
            1
            /* TEXT */
          ),
          p.value.sub ? (e.openBlock(), e.createElementBlock(
            "small",
            sa,
            e.toDisplayString(p.value.sub),
            1
            /* TEXT */
          )) : e.createCommentVNode("v-if", !0)
        ], 8, oa)) : e.createCommentVNode("v-if", !0),
        e.withDirectives(e.createElementVNode("input", {
          ref_key: "inputEl",
          ref: s,
          "onUpdate:modelValue": L[1] || (L[1] = (Q) => i.value = Q),
          class: e.normalizeClass(["mm-pss__input", { ghost: !l.multiple && !c.value && !!p.value }]),
          type: "text",
          role: "combobox",
          autocomplete: "off",
          spellcheck: "false",
          "aria-label": l.ariaLabel || a.value,
          "aria-expanded": c.value,
          "aria-autocomplete": "list",
          "aria-controls": w,
          "aria-activedescendant": c.value && G.value[k.value] ? le(G.value[k.value]) : void 0,
          placeholder: l.multiple ? V.value.length ? "" : a.value : !c.value && p.value ? "" : a.value,
          disabled: l.disabled,
          "data-test": l.dataTest,
          onFocus: ee,
          onInput: L[2] || (L[2] = (Q) => k.value = 0),
          onKeydown: h,
          onBlur: O
        }, null, 42, ra), [
          [e.vModelText, i.value]
        ]),
        l.clearable && V.value.length && !l.disabled ? (e.openBlock(), e.createElementBlock("button", {
          key: 2,
          type: "button",
          class: "mm-pss__clear",
          "aria-label": f.$t("清除"),
          "data-test": l.dataTest ? `${l.dataTest}-clear` : void 0,
          onMousedown: L[3] || (L[3] = e.withModifiers(() => {
          }, ["prevent", "stop"])),
          onClick: F
        }, [...L[6] || (L[6] = [
          e.createElementVNode(
            "i",
            { class: "ri-close-circle-fill" },
            null,
            -1
            /* CACHED */
          )
        ])], 40, ia)) : (e.openBlock(), e.createElementBlock("i", ca)),
        (e.openBlock(), e.createBlock(e.Teleport, { to: "body" }, [
          c.value ? (e.openBlock(), e.createElementBlock("div", {
            key: 0,
            id: w,
            ref_key: "popEl",
            ref: o,
            class: "mm-pss-pop",
            role: "listbox",
            "aria-multiselectable": l.multiple || void 0,
            style: e.normalizeStyle(r.value),
            "data-test": l.dataTest ? `${l.dataTest}-list` : void 0,
            onMousedown: L[4] || (L[4] = e.withModifiers(() => {
            }, ["prevent"]))
          }, [
            (e.openBlock(!0), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(T.value, (Q) => (e.openBlock(), e.createElementBlock(
                e.Fragment,
                {
                  key: Q.key
                },
                [
                  e.createElementVNode(
                    "div",
                    ma,
                    e.toDisplayString(Q.label),
                    1
                    /* TEXT */
                  ),
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(Q.options, (Z) => (e.openBlock(), e.createElementBlock("div", {
                      id: le(Z),
                      key: Z.value,
                      role: "option",
                      "aria-selected": d(Z.value),
                      class: e.normalizeClass(["mm-pss-pop__opt", { active: G.value[k.value]?.value === Z.value, sel: d(Z.value) }]),
                      "data-test": l.dataTest ? `${l.dataTest}-opt-${Z.value}` : void 0,
                      onMouseenter: (se) => k.value = G.value.indexOf(Z),
                      onClick: (se) => K(Z.value)
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
                      e.createElementVNode(
                        "span",
                        pa,
                        e.toDisplayString(Z.label),
                        1
                        /* TEXT */
                      ),
                      Z.sub ? (e.openBlock(), e.createElementBlock(
                        "small",
                        va,
                        e.toDisplayString(Z.sub),
                        1
                        /* TEXT */
                      )) : e.createCommentVNode("v-if", !0),
                      Z.hint ? (e.openBlock(), e.createElementBlock(
                        "em",
                        ka,
                        e.toDisplayString(Z.hint),
                        1
                        /* TEXT */
                      )) : e.createCommentVNode("v-if", !0),
                      d(Z.value) ? (e.openBlock(), e.createElementBlock("i", ya)) : e.createCommentVNode("v-if", !0)
                    ], 42, ua))),
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
              ga,
              e.toDisplayString(m.value ? f.$t("正在加载人员…") : i.value.trim() ? f.$t("没有找到「{q}」", { q: i.value.trim() }) : f.$t("没有可选的人员")),
              1
              /* TEXT */
            ))
          ], 44, da)) : e.createCommentVNode("v-if", !0)
        ]))
      ],
      34
      /* CLASS, NEED_HYDRATION */
    ));
  }
}), Oe = /* @__PURE__ */ ae(fa, [["__scopeId", "data-v-051698b0"]]), Na = { class: "mm-sa__head" }, Va = { class: "ss-muted" }, Ea = ["aria-expanded"], $a = {
  key: 0,
  class: "ss-note"
}, ba = ["data-test"], ha = { class: "mm-sa__who" }, _a = { class: "mm-sa__label" }, Ba = { class: "mm-sa__sample" }, Sa = ["src"], Da = { class: "mm-sa__ops" }, wa = ["disabled", "data-test", "onClick"], Ca = { class: "ss-chip ok" }, Ta = ["onClick"], Ia = ["disabled", "data-test", "onClick"], Ma = {
  key: 2,
  class: "ss-chip warn"
}, Aa = {
  key: 0,
  class: "ss-note danger"
}, ja = { class: "ss-muted" }, La = /* @__PURE__ */ e.defineComponent({
  __name: "SpeakerAssignPanel",
  props: {
    detail: {}
  },
  emits: ["changed"],
  setup(l, { emit: v }) {
    const n = l, u = v, y = e.reactive({}), s = e.reactive({}), o = e.ref(""), c = e.ref(""), i = e.ref(""), k = e.ref(""), E = e.computed(() => n.detail.meeting), m = e.computed(() => E.value.status !== "pending_assign"), r = e.ref(!m.value), N = e.computed(() => ["pending_assign", "pending_confirm", "pending_review"].includes(E.value.status)), w = e.ref({ depts: [], people: [] });
    e.onMounted(async () => {
      try {
        w.value = await De();
      } catch {
      }
    });
    const a = e.computed(() => n.detail.names[E.value.hostId]?.name || ""), g = (q) => n.detail.names[q]?.name || q, D = e.computed(() => {
      const q = E.value.speakers.map((B) => {
        const S = E.value.segments.filter((T) => T.speakerLabel === B.label).sort((T, G) => T.start - G.start), b = S.filter((T) => T.text.trim()).slice(0, 2).map((T) => T.text.length > 60 ? `${T.text.slice(0, 60)}…` : T.text), M = S.reduce((T, G) => T + Math.max(0, G.end - G.start), 0);
        return { ...B, count: S.length, seconds: M, samples: b };
      });
      return [...q.filter((B) => !B.personId), ...q.filter((B) => B.personId)];
    }), P = e.computed(() => D.value.filter((q) => !q.personId));
    function j(q, B) {
      return E.value.speakers.find((S) => S.personId === q && S.label !== B)?.label || "";
    }
    function C(q, B) {
      i.value = q, s[q] = B || "";
    }
    async function I(q) {
      if (y[q]) {
        const B = y[q];
        y[q] = "", setTimeout(() => {
          y[q] = B;
        }, 0);
        return;
      }
      o.value = q, k.value = "";
      try {
        const B = await J("meeting.speaker.clip", { id: E.value.id, label: q });
        if (!B?.dataUrl) throw new Error(t.t("这位发言人没有可试听的片段"));
        y[q] = B.dataUrl;
      } catch (B) {
        k.value = x.errorMessage(B);
      } finally {
        o.value = "";
      }
    }
    async function U(q) {
      const B = s[q];
      if (B) {
        c.value = q, k.value = "";
        try {
          await J("meeting.speaker.assign", { id: E.value.id, label: q, personId: B }), i.value = "", u("changed");
        } catch (S) {
          k.value = x.errorMessage(S);
        } finally {
          c.value = "";
        }
      }
    }
    return (q, B) => (e.openBlock(), e.createElementBlock(
      "section",
      {
        class: e.normalizeClass(["mm-sa", { quiet: m.value }]),
        "data-test": "mm-speaker-assign"
      },
      [
        e.createElementVNode("header", Na, [
          e.createElementVNode(
            "h4",
            null,
            e.toDisplayString(m.value ? q.$t("更正发言人") : q.$t("指认发言人")),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "span",
            Va,
            e.toDisplayString(m.value ? q.$t("声纹认错了：试听后整组改给正确的人；只是个别段认错，在下面的纪要里逐段改") : P.value.length ? q.$t("{n} 位没认出来 · 试听片段后选人", { n: P.value.length }) : q.$t("发言人都已认出")),
            1
            /* TEXT */
          ),
          B[2] || (B[2] = e.createElementVNode(
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
            "aria-expanded": r.value,
            "data-test": "mm-speaker-toggle",
            onClick: B[0] || (B[0] = (S) => r.value = !r.value)
          }, [
            e.createTextVNode(
              e.toDisplayString(r.value ? q.$t("收起") : q.$t("展开")),
              1
              /* TEXT */
            ),
            e.createElementVNode(
              "i",
              {
                class: e.normalizeClass(r.value ? "ri-arrow-up-s-line" : "ri-arrow-down-s-line")
              },
              null,
              2
              /* CLASS */
            )
          ], 8, Ea)) : e.createCommentVNode("v-if", !0)
        ]),
        !l.detail.my.isHost && !m.value ? (e.openBlock(), e.createElementBlock("p", $a, [
          B[3] || (B[3] = e.createElementVNode(
            "i",
            { class: "ri-time-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            e.toDisplayString(q.$t("等待主持人 {name} 指认发言人", { name: a.value })),
            1
            /* TEXT */
          )
        ])) : e.createCommentVNode("v-if", !0),
        r.value ? (e.openBlock(), e.createElementBlock(
          e.Fragment,
          { key: 1 },
          [
            (e.openBlock(!0), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(D.value, (S) => (e.openBlock(), e.createElementBlock("article", {
                key: S.label,
                class: e.normalizeClass(["mm-sa__row", { unknown: !S.personId }]),
                "data-test": `mm-speaker-${S.label}`
              }, [
                e.createElementVNode("div", ha, [
                  e.createElementVNode(
                    "span",
                    _a,
                    e.toDisplayString(S.label),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "small",
                    null,
                    e.toDisplayString(q.$t("{n} 段 · 约 {t}", { n: S.count, t: e.unref(Ae)(S.seconds) })),
                    1
                    /* TEXT */
                  )
                ]),
                e.createElementVNode("div", Ba, [
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(S.samples, (b, M) => (e.openBlock(), e.createElementBlock(
                      "p",
                      { key: M },
                      e.toDisplayString(b),
                      1
                      /* TEXT */
                    ))),
                    128
                    /* KEYED_FRAGMENT */
                  )),
                  y[S.label] ? (e.openBlock(), e.createElementBlock("audio", {
                    key: 0,
                    src: y[S.label],
                    controls: "",
                    autoplay: "",
                    preload: "auto",
                    class: "mm-sa__audio"
                  }, null, 8, Sa)) : e.createCommentVNode("v-if", !0)
                ]),
                e.createElementVNode("div", Da, [
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn sm",
                    disabled: o.value === S.label,
                    "data-test": `mm-speaker-clip-${S.label}`,
                    onClick: (b) => I(S.label)
                  }, [
                    e.createElementVNode(
                      "i",
                      {
                        class: e.normalizeClass(o.value === S.label ? "ri-loader-4-line spin" : "ri-play-circle-line")
                      },
                      null,
                      2
                      /* CLASS */
                    ),
                    e.createTextVNode(
                      e.toDisplayString(q.$t("试听")),
                      1
                      /* TEXT */
                    )
                  ], 8, wa),
                  S.personId && i.value !== S.label ? (e.openBlock(), e.createElementBlock(
                    e.Fragment,
                    { key: 0 },
                    [
                      e.createElementVNode("span", Ca, [
                        e.createTextVNode(
                          e.toDisplayString(g(S.personId)),
                          1
                          /* TEXT */
                        ),
                        S.matchedBy === "voiceprint" && S.score != null ? (e.openBlock(), e.createElementBlock(
                          e.Fragment,
                          { key: 0 },
                          [
                            e.createTextVNode(
                              " · " + e.toDisplayString(q.$t("声纹 {p}", { p: S.score.toFixed(2) })),
                              1
                              /* TEXT */
                            )
                          ],
                          64
                          /* STABLE_FRAGMENT */
                        )) : S.matchedBy === "nickname" ? (e.openBlock(), e.createElementBlock(
                          e.Fragment,
                          { key: 1 },
                          [
                            e.createTextVNode(
                              " · " + e.toDisplayString(q.$t("昵称匹配")),
                              1
                              /* TEXT */
                            )
                          ],
                          64
                          /* STABLE_FRAGMENT */
                        )) : e.createCommentVNode("v-if", !0)
                      ]),
                      l.detail.my.isHost && N.value ? (e.openBlock(), e.createElementBlock("button", {
                        key: 0,
                        type: "button",
                        class: "ss-link",
                        onClick: (b) => C(S.label, S.personId)
                      }, e.toDisplayString(q.$t("更正")), 9, Ta)) : e.createCommentVNode("v-if", !0)
                    ],
                    64
                    /* STABLE_FRAGMENT */
                  )) : l.detail.my.isHost && N.value ? (e.openBlock(), e.createElementBlock(
                    e.Fragment,
                    { key: 1 },
                    [
                      e.createVNode(Oe, {
                        "model-value": s[S.label] || "",
                        "onUpdate:modelValue": (b) => s[S.label] = b,
                        class: "mm-sa__select",
                        people: w.value,
                        pinned: E.value.attendeeIds,
                        "pinned-label": q.$t("本场参会人"),
                        names: l.detail.names,
                        hint: (b) => j(b, S.label) ? q.$t("（已指认给 {l}）", { l: j(b, S.label) }) : "",
                        "aria-label": q.$t("选择发言人…"),
                        "data-test": `mm-speaker-pick-${S.label}`
                      }, null, 8, ["model-value", "onUpdate:modelValue", "people", "pinned", "pinned-label", "names", "hint", "aria-label", "data-test"]),
                      e.createElementVNode("button", {
                        type: "button",
                        class: "ss-btn sm primary",
                        disabled: !s[S.label] || c.value === S.label,
                        "data-test": `mm-speaker-save-${S.label}`,
                        onClick: (b) => U(S.label)
                      }, [
                        e.createElementVNode(
                          "i",
                          {
                            class: e.normalizeClass(c.value === S.label ? "ri-loader-4-line spin" : "ri-check-line")
                          },
                          null,
                          2
                          /* CLASS */
                        ),
                        e.createTextVNode(
                          e.toDisplayString(q.$t("确认")),
                          1
                          /* TEXT */
                        )
                      ], 8, Ia),
                      i.value === S.label ? (e.openBlock(), e.createElementBlock(
                        "button",
                        {
                          key: 0,
                          type: "button",
                          class: "ss-link",
                          onClick: B[1] || (B[1] = (b) => i.value = "")
                        },
                        e.toDisplayString(q.$t("取消")),
                        1
                        /* TEXT */
                      )) : e.createCommentVNode("v-if", !0)
                    ],
                    64
                    /* STABLE_FRAGMENT */
                  )) : (e.openBlock(), e.createElementBlock(
                    "span",
                    Ma,
                    e.toDisplayString(q.$t("未识别")),
                    1
                    /* TEXT */
                  ))
                ])
              ], 10, ba))),
              128
              /* KEYED_FRAGMENT */
            )),
            k.value ? (e.openBlock(), e.createElementBlock("p", Aa, [
              B[4] || (B[4] = e.createElementVNode(
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
              ja,
              e.toDisplayString(m.value ? q.$t("改给别人后，新的发言人要重新确认，其他人的确认保留。") : q.$t("只和本场参会人比对声纹；没来得及加进参会人的人也能直接选。全部指认完自动进入发言确认，系统通知每位发言人核对本人发言。")),
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
}), za = /* @__PURE__ */ ae(La, [["__scopeId", "data-v-a6aa3aa3"]]), Fa = {
  class: "mm-side",
  "data-test": "mm-decisions"
}, Pa = ["disabled"], Ua = ["disabled"], Oa = {
  key: 0,
  class: "ss-muted"
}, Ra = {
  key: 1,
  class: "mm-decisions"
}, qa = { class: "mm-summary" }, Ka = {
  key: 3,
  class: "ss-muted"
}, Ha = {
  key: 4,
  class: "ss-muted"
}, Wa = {
  key: 5,
  class: "ss-muted"
}, Ga = {
  key: 1,
  class: "mm-mde",
  "data-test": "mm-minutes-editor"
}, Ya = { class: "mm-mde__no" }, Ja = ["onUpdate:modelValue", "aria-label", "data-test"], Qa = ["aria-label", "onClick"], Za = ["onUpdate:modelValue", "aria-label", "data-test"], Xa = { class: "ss-actions" }, xa = ["disabled"], es = ["disabled"], ts = {
  key: 2,
  class: "ss-note"
}, ls = {
  key: 3,
  class: "ss-note danger"
}, ns = /* @__PURE__ */ e.defineComponent({
  __name: "MinutesDraftSide",
  props: {
    detail: {}
  },
  emits: ["changed"],
  setup(l, { emit: v }) {
    const n = l, u = v, y = e.computed(() => n.detail.meeting), s = e.computed(() => !["finalized", "ended", "pending_owner", "plan_confirm", "dispatched"].includes(y.value.status)), o = e.computed(() => n.detail.my.isHost && ["pending_assign", "pending_confirm", "pending_review"].includes(y.value.status)), c = e.computed(() => n.detail.my.isHost && !s.value && n.detail.projectStatus !== "archived"), i = e.ref(!1), k = e.ref(""), E = e.ref(""), m = e.ref("");
    let r = 0;
    const N = e.reactive({ decisions: [], summary: ["", "", ""] });
    function w() {
      N.decisions = y.value.decisions.map((P) => ({ key: ++r, id: P.id, text: P.text })), N.summary = [0, 1, 2].map((P) => y.value.summaryLines[P] || ""), E.value = "", m.value = "", i.value = !0;
    }
    function a() {
      N.decisions.push({ key: ++r, text: "" });
    }
    async function g() {
      k.value = "save", E.value = "";
      try {
        await J("meeting.minutes.save", {
          id: y.value.id,
          decisions: N.decisions.map((P) => ({ ...P.id ? { id: P.id } : {}, text: P.text })),
          summaryLines: N.summary.map((P) => P.trim()).filter(Boolean)
        }), i.value = !1, u("changed");
      } catch (P) {
        E.value = x.errorMessage(P);
      } finally {
        k.value = "";
      }
    }
    async function D() {
      if (window.confirm(t.t("按现在的发言人和文字重新整理议题、决议和摘要？会覆盖现在的内容（包括你手改过的）。"))) {
        k.value = "ai", E.value = "", m.value = "";
        try {
          const P = await J("meeting.minutes.reorganize", { id: y.value.id });
          m.value = P?.note || t.t("已重新整理"), u("changed");
        } catch (P) {
          E.value = x.errorMessage(P);
        } finally {
          k.value = "";
        }
      }
    }
    return (P, j) => (e.openBlock(), e.createElementBlock("section", Fa, [
      e.createElementVNode("h5", null, [
        e.createTextVNode(
          e.toDisplayString(P.$t("AI 识别的决议事项")) + " ",
          1
          /* TEXT */
        ),
        e.createElementVNode(
          "span",
          null,
          e.toDisplayString(y.value.decisions.length),
          1
          /* TEXT */
        ),
        j[2] || (j[2] = e.createElementVNode(
          "span",
          { class: "mm-grow" },
          null,
          -1
          /* CACHED */
        )),
        (o.value || c.value) && !i.value ? (e.openBlock(), e.createElementBlock(
          e.Fragment,
          { key: 0 },
          [
            e.createElementVNode("button", {
              type: "button",
              class: "ss-link",
              disabled: !!k.value,
              "data-test": "mm-minutes-edit",
              onClick: w
            }, [
              j[1] || (j[1] = e.createElementVNode(
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
            ], 8, Pa),
            o.value ? (e.openBlock(), e.createElementBlock("button", {
              key: 0,
              type: "button",
              class: "ss-link",
              disabled: !!k.value || !y.value.segments.length,
              "data-test": "mm-minutes-reorganize",
              onClick: D
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
                e.toDisplayString(P.$t("AI 重新整理")),
                1
                /* TEXT */
              )
            ], 8, Ua)) : e.createCommentVNode("v-if", !0)
          ],
          64
          /* STABLE_FRAGMENT */
        )) : e.createCommentVNode("v-if", !0)
      ]),
      i.value ? (e.openBlock(), e.createElementBlock("div", Ga, [
        (e.openBlock(!0), e.createElementBlock(
          e.Fragment,
          null,
          e.renderList(N.decisions, (C, I) => (e.openBlock(), e.createElementBlock("div", {
            key: C.key,
            class: "mm-mde__row"
          }, [
            e.createElementVNode(
              "span",
              Ya,
              e.toDisplayString(I + 1),
              1
              /* TEXT */
            ),
            e.withDirectives(e.createElementVNode("textarea", {
              "onUpdate:modelValue": (U) => C.text = U,
              rows: "2",
              "aria-label": P.$t("决议 {n}", { n: I + 1 }),
              "data-test": `mm-decision-input-${I}`
            }, null, 8, Ja), [
              [e.vModelText, C.text]
            ]),
            e.createElementVNode("button", {
              type: "button",
              class: "mm-mde__del",
              "aria-label": P.$t("删除这条决议"),
              onClick: (U) => N.decisions.splice(I, 1)
            }, [...j[3] || (j[3] = [
              e.createElementVNode(
                "i",
                { class: "ri-close-line" },
                null,
                -1
                /* CACHED */
              )
            ])], 8, Qa)
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
          j[4] || (j[4] = e.createElementVNode(
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
          e.renderList(N.summary, (C, I) => e.withDirectives((e.openBlock(), e.createElementBlock("input", {
            key: I,
            "onUpdate:modelValue": (U) => N.summary[I] = U,
            type: "text",
            maxlength: "200",
            "aria-label": P.$t("摘要第 {n} 行", { n: I + 1 }),
            "data-test": `mm-summary-input-${I}`
          }, null, 8, Za)), [
            [e.vModelText, N.summary[I]]
          ])),
          128
          /* KEYED_FRAGMENT */
        )),
        e.createElementVNode("div", Xa, [
          e.createElementVNode("button", {
            type: "button",
            class: "ss-btn sm primary",
            disabled: !!k.value,
            "data-test": "mm-minutes-save",
            onClick: g
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
              e.toDisplayString(P.$t("保存")),
              1
              /* TEXT */
            )
          ], 8, xa),
          e.createElementVNode("button", {
            type: "button",
            class: "ss-link",
            disabled: !!k.value,
            onClick: j[0] || (j[0] = (C) => i.value = !1)
          }, e.toDisplayString(P.$t("取消")), 9, es)
        ])
      ])) : (e.openBlock(), e.createElementBlock(
        e.Fragment,
        { key: 0 },
        [
          y.value.decisions.length ? (e.openBlock(), e.createElementBlock("ol", Ra, [
            (e.openBlock(!0), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(y.value.decisions, (C, I) => (e.openBlock(), e.createElementBlock("li", {
                key: C.id
              }, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(I + 1),
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
            Oa,
            e.toDisplayString(s.value ? P.$t("处理完成后在这里列出会上形成的决议") : P.$t("没有识别到决议事项")),
            1
            /* TEXT */
          )),
          y.value.summaryLines.length && (!s.value || o.value) ? (e.openBlock(), e.createElementBlock(
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
              e.createElementVNode("ul", qa, [
                (e.openBlock(!0), e.createElementBlock(
                  e.Fragment,
                  null,
                  e.renderList(y.value.summaryLines, (C, I) => (e.openBlock(), e.createElementBlock(
                    "li",
                    { key: I },
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
            Ka,
            e.toDisplayString(P.$t("AI 初稿，定稿前请核对：决议会拆成任务，摘要会进纪要通知。发言人改过后可「AI 重新整理」。")),
            1
            /* TEXT */
          )) : s.value ? (e.openBlock(), e.createElementBlock(
            "small",
            Ha,
            e.toDisplayString(P.$t("终审通过后可选择「生成任务」或「无需生成任务」")),
            1
            /* TEXT */
          )) : c.value ? (e.openBlock(), e.createElementBlock(
            "small",
            Wa,
            e.toDisplayString(P.$t("纪要已定稿：发现错字可以编辑修正，已拆出的任务不跟着变。")),
            1
            /* TEXT */
          )) : e.createCommentVNode("v-if", !0)
        ],
        64
        /* STABLE_FRAGMENT */
      )),
      m.value ? (e.openBlock(), e.createElementBlock("p", ts, [
        j[5] || (j[5] = e.createElementVNode(
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
      E.value ? (e.openBlock(), e.createElementBlock("p", ls, [
        j[6] || (j[6] = e.createElementVNode(
          "i",
          { class: "ri-error-warning-line" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(E.value),
          1
          /* TEXT */
        )
      ])) : e.createCommentVNode("v-if", !0)
    ]));
  }
}), os = /* @__PURE__ */ ae(ns, [["__scopeId", "data-v-6868f958"]]), as = ["data-test"], ss = ["disabled", "data-test"], rs = {
  key: 0,
  class: "ss-note danger"
}, is = /* @__PURE__ */ e.defineComponent({
  __name: "SegmentSpeakerPicker",
  props: {
    detail: {},
    segmentId: {}
  },
  emits: ["done"],
  setup(l, { emit: v }) {
    const n = l, u = v, y = e.computed(() => n.detail.meeting), s = e.computed(() => y.value.segments.find((a) => a.id === n.segmentId)?.speakerLabel || ""), o = e.ref(`label:${s.value}`), c = e.ref(!1), i = e.ref(""), k = e.ref({ depts: [], people: [] }), E = e.computed(() => y.value.speakers.map((a) => ({
      value: `label:${a.label}`,
      label: a.personId ? `${xe(n.detail, a.label)}（${a.label}）` : a.label,
      sub: a.personId && n.detail.names[a.personId]?.deptName || ""
    }))), m = e.computed(() => y.value.speakers.map((a) => a.personId).filter(Boolean)), r = e.computed({
      get: () => o.value.startsWith("person:") ? o.value.slice(7) : o.value,
      set: (a) => {
        o.value = a ? a.startsWith("label:") ? a : `person:${a}` : "";
      }
    }), N = e.computed(() => o.value && o.value !== `label:${s.value}`);
    async function w() {
      if (!N.value || c.value) return;
      const [a, g] = [o.value.slice(0, o.value.indexOf(":")), o.value.slice(o.value.indexOf(":") + 1)];
      c.value = !0, i.value = "";
      try {
        await J("meeting.segment.speaker", { id: y.value.id, segmentId: n.segmentId, ...a === "label" ? { label: g } : { personId: g } }), u("done", !0);
      } catch (D) {
        i.value = x.errorMessage(D);
      } finally {
        c.value = !1;
      }
    }
    return e.onMounted(async () => {
      try {
        k.value = await De();
      } catch (a) {
        i.value = x.errorMessage(a);
      }
    }), (a, g) => (e.openBlock(), e.createElementBlock("div", {
      class: "mm-ssp",
      "data-test": `mm-seg-speaker-${l.segmentId}`
    }, [
      e.createVNode(Oe, {
        modelValue: r.value,
        "onUpdate:modelValue": g[0] || (g[0] = (D) => r.value = D),
        class: "mm-ssp__select",
        people: k.value,
        extras: E.value,
        "extras-label": a.$t("本场发言人"),
        exclude: m.value,
        "aria-label": a.$t("这段的发言人"),
        "data-test": `mm-seg-speaker-pick-${l.segmentId}`
      }, null, 8, ["modelValue", "people", "extras", "extras-label", "exclude", "aria-label", "data-test"]),
      e.createElementVNode("button", {
        type: "button",
        class: "ss-btn sm primary",
        disabled: c.value || !N.value,
        "data-test": `mm-seg-speaker-save-${l.segmentId}`,
        onClick: w
      }, [
        e.createElementVNode(
          "i",
          {
            class: e.normalizeClass(c.value ? "ri-loader-4-line spin" : "ri-check-line")
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
      ], 8, ss),
      e.createElementVNode(
        "button",
        {
          type: "button",
          class: "ss-link",
          onClick: g[1] || (g[1] = (D) => u("done", !1))
        },
        e.toDisplayString(a.$t("取消")),
        1
        /* TEXT */
      ),
      i.value ? (e.openBlock(), e.createElementBlock("p", rs, [
        g[2] || (g[2] = e.createElementVNode(
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
    ], 8, as));
  }
}), ht = /* @__PURE__ */ ae(is, [["__scopeId", "data-v-da87433b"]]), cs = {
  class: "mm-min",
  "data-test": "mm-minutes"
}, ds = { class: "mm-min__bar" }, ms = {
  class: "mm-seg-switch",
  role: "tablist"
}, us = ["aria-selected"], ps = ["aria-selected"], vs = { class: "ss-muted" }, ks = {
  key: 0,
  class: "mm-min__empty"
}, ys = ["data-test"], gs = ["aria-expanded", "onClick"], fs = {
  key: 0,
  class: "mm-topic__body"
}, Ns = { class: "mm-seg__body" }, Vs = { class: "mm-seg__who" }, Es = { class: "mm-seg__name" }, $s = ["title", "data-test", "onClick"], bs = { key: 1 }, hs = {
  key: 2,
  class: "mm-mini brand"
}, _s = ["title"], Bs = ["title"], Ss = ["data-test"], Ds = { class: "ss-actions" }, ws = ["disabled", "data-test", "onClick"], Cs = {
  key: 2,
  class: "mm-seg__text"
}, Ts = {
  key: 3,
  class: "mm-seg__return"
}, Is = ["placeholder", "data-test"], Ms = ["disabled", "data-test", "onClick"], As = {
  key: 0,
  class: "mm-seg__ops"
}, js = ["data-test", "onClick"], Ls = ["data-test", "onClick"], zs = ["data-test", "onClick"], Fs = { class: "mm-timeline" }, Ps = { class: "mm-seg__body" }, Us = { class: "mm-seg__who" }, Os = { class: "mm-seg__name" }, Rs = ["title", "data-test", "onClick"], qs = { key: 1 }, Ks = {
  key: 2,
  class: "mm-mini brand"
}, Hs = ["title"], Ws = ["title"], Gs = { class: "ss-actions" }, Ys = ["disabled", "onClick"], Js = {
  key: 2,
  class: "mm-seg__text"
}, Qs = {
  key: 3,
  class: "mm-seg__return"
}, Zs = ["placeholder"], Xs = ["disabled", "onClick"], xs = {
  key: 0,
  class: "mm-seg__ops"
}, er = ["data-test", "onClick"], tr = ["onClick"], lr = ["onClick"], nr = {
  key: 3,
  class: "ss-note danger"
}, or = /* @__PURE__ */ e.defineComponent({
  __name: "MinutesPanel",
  props: {
    detail: {},
    anchor: {},
    anchorSeq: {}
  },
  emits: ["changed"],
  setup(l, { emit: v }) {
    const n = l, u = v, y = e.ref("topic"), s = e.ref(/* @__PURE__ */ new Set()), o = e.ref(""), c = e.ref(""), i = e.ref(""), k = e.ref(""), E = e.ref(""), m = e.ref(!1), r = e.ref(""), N = e.computed(() => n.detail.meeting), w = e.computed(() => oe.value?.me?.person?.id), a = e.computed(() => new Map(N.value.segments.map((h) => [h.id, h]))), g = e.computed(() => fl(n.detail)), D = e.computed(() => [...N.value.segments].sort((h, f) => h.start - f.start)), P = e.computed(() => N.value.confirmations.find((h) => h.personId === w.value)), j = e.computed(() => N.value.status === "pending_review" && n.detail.my.isHost), C = e.computed(() => n.detail.my.isHost && ["pending_assign", "pending_confirm", "pending_review"].includes(N.value.status)), I = ["finalized", "ended", "pending_owner", "plan_confirm", "dispatched"], U = e.computed(() => I.includes(N.value.status)), q = e.computed(() => U.value && n.detail.my.isHost && n.detail.projectStatus !== "archived"), B = e.computed(() => N.value.files.some((h) => h.kind === "audio" || h.kind === "video")), S = e.computed(() => {
      const h = (N.value.topics || []).length, f = h ? t.t("AI 整理 · {n} 个议题", { n: h }) : t.t("AI 整理");
      return j.value ? `${f} · ${t.t("悬停段落可修改、退回或改发言人")}` : N.value.status === "pending_confirm" && n.detail.my.isHost ? `${f} · ${t.t("悬停段落可补全文字或改发言人")}` : N.value.status === "pending_confirm" && P.value ? `${f} · ${t.t("悬停本人发言可补全或修改")}` : C.value ? `${f} · ${t.t("发言人认错了：悬停段落可改发言人")}` : q.value ? `${f} · ${t.t("纪要已定稿；发现错字可悬停段落修改")}` : U.value ? `${f} · ${t.t("纪要已定稿")}` : f;
    });
    function b(h) {
      return a.value.get(h)?.speakerLabel || "";
    }
    function M(h) {
      return xe(n.detail, b(h));
    }
    function T(h) {
      return gl(n.detail, b(h), w.value);
    }
    function G(h) {
      return j.value || q.value ? !0 : N.value.status !== "pending_confirm" || n.detail.projectStatus === "archived" ? !1 : n.detail.my.isHost || T(h);
    }
    function V(h) {
      if (!j.value) return !1;
      const f = Le(N.value, b(h));
      return !!f && N.value.confirmations.some((L) => L.personId === f);
    }
    function d(h) {
      return {
        class: ["mm-seg", { own: T(h), hoverable: G(h) || V(h) || C.value, hl: n.anchor === h, editing: o.value === h || i.value === h || E.value === h }],
        "data-seg": h,
        "data-test": `mm-seg-${h}`
      };
    }
    function p(h) {
      return s.value.has(h);
    }
    function z(h) {
      const f = new Set(s.value);
      f.has(h) ? f.delete(h) : f.add(h), s.value = f;
    }
    e.watch(() => g.value.map((h) => h.id).join("|"), () => {
      const h = g.value[0]?.id, f = new Set([...s.value].filter((L) => g.value.some((Q) => Q.id === L)));
      !f.size && h && f.add(h), s.value = f;
    }, { immediate: !0 }), e.watch(() => [n.anchor, n.anchorSeq], async () => {
      const h = n.anchor;
      if (!h || !a.value.has(h)) return;
      const f = g.value.find((Z) => Z.segmentIds.includes(h));
      f && !s.value.has(f.id) && (s.value = /* @__PURE__ */ new Set([...s.value, f.id])), await e.nextTick();
      const L = typeof CSS < "u" && typeof CSS.escape == "function" ? CSS.escape(h) : h.replace(/["\\]/g, "\\$&");
      document.querySelector(`[data-seg="${L}"]`)?.scrollIntoView?.({ block: "center", behavior: "smooth" });
    }, { immediate: !0 });
    const X = e.ref(""), le = e.ref(""), W = /* @__PURE__ */ new Map();
    let Y = null;
    function ee(h) {
      return le.value === h ? "ri-loader-4-line spin" : X.value === h ? "ri-pause-fill" : "ri-play-fill";
    }
    async function ne(h) {
      if (X.value === h && Y) {
        Y.pause(), X.value = "";
        return;
      }
      Y?.pause(), X.value = "", le.value = h, r.value = "";
      try {
        let f = W.get(h);
        if (!f) {
          if (f = (await J("meeting.segment.audio", { id: N.value.id, segmentId: h }))?.dataUrl || "", !f) throw new Error(t.t("这段没有可播放的原声"));
          W.size >= 30 && W.delete(W.keys().next().value), W.set(h, f);
        }
        Y || (Y = new Audio(), Y.onended = () => {
          X.value = "";
        }), Y.src = f, await Y.play(), X.value = h;
      } catch (f) {
        r.value = x.errorMessage(f);
      } finally {
        le.value = "";
      }
    }
    e.onBeforeUnmount(() => {
      Y?.pause(), Y = null;
    });
    function $(h) {
      o.value = "", i.value = "", E.value = h;
    }
    function O(h) {
      E.value = "", h && u("changed");
    }
    function R(h) {
      E.value = "", i.value = "", o.value = h, c.value = a.value.get(h)?.text || "";
    }
    function F(h) {
      o.value = "", E.value = "", i.value = h, k.value = "";
    }
    async function K(h) {
      const f = c.value.trim();
      if (!(!f || m.value)) {
        m.value = !0, r.value = "";
        try {
          await J("meeting.segment.edit", { id: N.value.id, segmentId: h, text: f }), o.value = "", u("changed");
        } catch (L) {
          r.value = x.errorMessage(L);
        } finally {
          m.value = !1;
        }
      }
    }
    async function _(h) {
      const f = Le(N.value, b(h));
      if (!f || m.value) return;
      const L = n.detail.names[f]?.name || "";
      if (window.confirm(t.t("把这段退回给 {name} 重新确认？只有 {name} 需要重新确认。", { name: L }))) {
        m.value = !0, r.value = "";
        try {
          await J("meeting.review.return", { id: N.value.id, personId: f, note: k.value.trim() }), i.value = "", u("changed");
        } catch (Q) {
          r.value = x.errorMessage(Q);
        } finally {
          m.value = !1;
        }
      }
    }
    return (h, f) => (e.openBlock(), e.createElementBlock("section", cs, [
      e.createElementVNode("div", ds, [
        e.createElementVNode("div", ms, [
          e.createElementVNode("button", {
            type: "button",
            role: "tab",
            class: e.normalizeClass({ on: y.value === "topic" }),
            "aria-selected": y.value === "topic",
            "data-test": "mm-minutes-topic",
            onClick: f[0] || (f[0] = (L) => y.value = "topic")
          }, e.toDisplayString(h.$t("按议题")), 11, us),
          e.createElementVNode("button", {
            type: "button",
            role: "tab",
            class: e.normalizeClass({ on: y.value === "timeline" }),
            "aria-selected": y.value === "timeline",
            "data-test": "mm-minutes-timeline",
            onClick: f[1] || (f[1] = (L) => y.value = "timeline")
          }, e.toDisplayString(h.$t("按时间线")), 11, ps)
        ]),
        e.createElementVNode(
          "span",
          vs,
          e.toDisplayString(S.value),
          1
          /* TEXT */
        )
      ]),
      N.value.segments.length ? y.value === "topic" ? (e.openBlock(), e.createElementBlock(
        e.Fragment,
        { key: 1 },
        [
          e.createCommentVNode(" 按议题 "),
          (e.openBlock(!0), e.createElementBlock(
            e.Fragment,
            null,
            e.renderList(g.value, (L, Q) => (e.openBlock(), e.createElementBlock("div", {
              key: L.id,
              class: e.normalizeClass(["mm-topic", { open: p(L.id) }]),
              "data-test": `mm-topic-${L.id}`
            }, [
              e.createElementVNode("button", {
                type: "button",
                class: "mm-topic__head",
                "aria-expanded": p(L.id),
                onClick: (Z) => z(L.id)
              }, [
                e.createElementVNode(
                  "i",
                  {
                    class: e.normalizeClass(p(L.id) ? "ri-arrow-down-s-line" : "ri-arrow-right-s-line")
                  },
                  null,
                  2
                  /* CLASS */
                ),
                e.createElementVNode(
                  "strong",
                  null,
                  e.toDisplayString(L.id === "__rest" ? L.title : h.$t("议题{n} · {title}", { n: e.unref(vl)(Q), title: L.title })),
                  1
                  /* TEXT */
                ),
                e.createElementVNode("small", null, [
                  e.createTextVNode(
                    e.toDisplayString(h.$t("{n} 段", { n: L.segmentIds.length })),
                    1
                    /* TEXT */
                  ),
                  !p(L.id) && L.speakers.length ? (e.openBlock(), e.createElementBlock(
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
              ], 8, gs),
              p(L.id) ? (e.openBlock(), e.createElementBlock("div", fs, [
                (e.openBlock(!0), e.createElementBlock(
                  e.Fragment,
                  null,
                  e.renderList(L.segmentIds, (Z) => (e.openBlock(), e.createElementBlock(
                    e.Fragment,
                    { key: Z },
                    [
                      a.value.get(Z) ? (e.openBlock(), e.createElementBlock(
                        "div",
                        e.mergeProps({
                          key: 0,
                          ref_for: !0
                        }, d(Z)),
                        [
                          e.createElementVNode(
                            "span",
                            {
                              class: "mm-av",
                              style: e.normalizeStyle({ background: e.unref(re)(M(Z)).color })
                            },
                            e.toDisplayString(e.unref(re)(M(Z)).text),
                            5
                            /* TEXT, STYLE */
                          ),
                          e.createElementVNode("div", Ns, [
                            e.createElementVNode("div", Vs, [
                              e.createElementVNode(
                                "span",
                                Es,
                                e.toDisplayString(M(Z)),
                                1
                                /* TEXT */
                              ),
                              B.value ? (e.openBlock(), e.createElementBlock("button", {
                                key: 0,
                                type: "button",
                                class: e.normalizeClass(["mm-play", { on: X.value === Z }]),
                                title: X.value === Z ? h.$t("暂停") : h.$t("播放这段原声"),
                                "data-test": `mm-seg-play-${Z}`,
                                onClick: (se) => ne(Z)
                              }, [
                                e.createElementVNode(
                                  "i",
                                  {
                                    class: e.normalizeClass(ee(Z))
                                  },
                                  null,
                                  2
                                  /* CLASS */
                                ),
                                e.createElementVNode(
                                  "time",
                                  null,
                                  e.toDisplayString(e.unref(Ae)(a.value.get(Z).start)),
                                  1
                                  /* TEXT */
                                )
                              ], 10, $s)) : (e.openBlock(), e.createElementBlock(
                                "time",
                                bs,
                                e.toDisplayString(e.unref(Ae)(a.value.get(Z).start)),
                                1
                                /* TEXT */
                              )),
                              T(Z) ? (e.openBlock(), e.createElementBlock(
                                "span",
                                hs,
                                e.toDisplayString(h.$t("本人")),
                                1
                                /* TEXT */
                              )) : e.createCommentVNode("v-if", !0),
                              a.value.get(Z).originalText !== void 0 ? (e.openBlock(), e.createElementBlock("span", {
                                key: 3,
                                class: "mm-mini",
                                title: h.$t("原文：{t}", { t: a.value.get(Z).originalText || "" })
                              }, e.toDisplayString(h.$t("已修改")), 9, _s)) : e.createCommentVNode("v-if", !0),
                              a.value.get(Z).originalSpeakerLabel !== void 0 ? (e.openBlock(), e.createElementBlock("span", {
                                key: 4,
                                class: "mm-mini",
                                title: h.$t("识别时是 {l}", { l: a.value.get(Z).originalSpeakerLabel })
                              }, e.toDisplayString(h.$t("已改发言人")), 9, Bs)) : e.createCommentVNode("v-if", !0)
                            ]),
                            E.value === Z ? (e.openBlock(), e.createBlock(ht, {
                              key: 0,
                              detail: l.detail,
                              "segment-id": Z,
                              onDone: O
                            }, null, 8, ["detail", "segment-id"])) : e.createCommentVNode("v-if", !0),
                            o.value === Z ? (e.openBlock(), e.createElementBlock(
                              e.Fragment,
                              { key: 1 },
                              [
                                e.withDirectives(e.createElementVNode("textarea", {
                                  "onUpdate:modelValue": f[2] || (f[2] = (se) => c.value = se),
                                  class: "mm-seg__edit",
                                  rows: "3",
                                  "data-test": `mm-seg-edit-${Z}`
                                }, null, 8, Ss), [
                                  [e.vModelText, c.value]
                                ]),
                                e.createElementVNode("div", Ds, [
                                  e.createElementVNode("button", {
                                    type: "button",
                                    class: "ss-btn sm primary",
                                    disabled: m.value || !c.value.trim(),
                                    "data-test": `mm-seg-save-${Z}`,
                                    onClick: (se) => K(Z)
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
                                      e.toDisplayString(h.$t("保存")),
                                      1
                                      /* TEXT */
                                    )
                                  ], 8, ws),
                                  e.createElementVNode(
                                    "button",
                                    {
                                      type: "button",
                                      class: "ss-link",
                                      onClick: f[3] || (f[3] = (se) => o.value = "")
                                    },
                                    e.toDisplayString(h.$t("取消")),
                                    1
                                    /* TEXT */
                                  )
                                ])
                              ],
                              64
                              /* STABLE_FRAGMENT */
                            )) : (e.openBlock(), e.createElementBlock(
                              "p",
                              Cs,
                              e.toDisplayString(a.value.get(Z).text),
                              1
                              /* TEXT */
                            )),
                            i.value === Z ? (e.openBlock(), e.createElementBlock("div", Ts, [
                              e.withDirectives(e.createElementVNode("input", {
                                "onUpdate:modelValue": f[4] || (f[4] = (se) => k.value = se),
                                type: "text",
                                placeholder: h.$t("退回原因（发言人会看到），例如：这段数字需要核实"),
                                "data-test": `mm-seg-return-note-${Z}`
                              }, null, 8, Is), [
                                [e.vModelText, k.value]
                              ]),
                              e.createElementVNode("button", {
                                type: "button",
                                class: "ss-btn sm danger",
                                disabled: m.value,
                                "data-test": `mm-seg-return-ok-${Z}`,
                                onClick: (se) => _(Z)
                              }, e.toDisplayString(h.$t("确认退回")), 9, Ms),
                              e.createElementVNode(
                                "button",
                                {
                                  type: "button",
                                  class: "ss-link",
                                  onClick: f[5] || (f[5] = (se) => i.value = "")
                                },
                                e.toDisplayString(h.$t("取消")),
                                1
                                /* TEXT */
                              )
                            ])) : e.createCommentVNode("v-if", !0)
                          ]),
                          o.value !== Z && i.value !== Z && E.value !== Z && (G(Z) || V(Z) || C.value) ? (e.openBlock(), e.createElementBlock("div", As, [
                            C.value ? (e.openBlock(), e.createElementBlock("button", {
                              key: 0,
                              type: "button",
                              class: "mm-op",
                              "data-test": `mm-seg-move-${Z}`,
                              onClick: (se) => $(Z)
                            }, [
                              f[10] || (f[10] = e.createElementVNode(
                                "i",
                                { class: "ri-user-shared-line" },
                                null,
                                -1
                                /* CACHED */
                              )),
                              e.createTextVNode(
                                e.toDisplayString(h.$t("改发言人")),
                                1
                                /* TEXT */
                              )
                            ], 8, js)) : e.createCommentVNode("v-if", !0),
                            G(Z) ? (e.openBlock(), e.createElementBlock("button", {
                              key: 1,
                              type: "button",
                              class: "mm-op",
                              "data-test": `mm-seg-modify-${Z}`,
                              onClick: (se) => R(Z)
                            }, [
                              f[11] || (f[11] = e.createElementVNode(
                                "i",
                                { class: "ri-pencil-line" },
                                null,
                                -1
                                /* CACHED */
                              )),
                              e.createTextVNode(
                                e.toDisplayString(h.$t("修改")),
                                1
                                /* TEXT */
                              )
                            ], 8, Ls)) : e.createCommentVNode("v-if", !0),
                            V(Z) ? (e.openBlock(), e.createElementBlock("button", {
                              key: 2,
                              type: "button",
                              class: "mm-op danger",
                              "data-test": `mm-seg-return-${Z}`,
                              onClick: (se) => F(Z)
                            }, e.toDisplayString(h.$t("退回给发言人")), 9, zs)) : e.createCommentVNode("v-if", !0)
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
            ], 10, ys))),
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
          e.createElementVNode("div", Fs, [
            (e.openBlock(!0), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(D.value, (L) => (e.openBlock(), e.createElementBlock(
                "div",
                e.mergeProps({
                  key: L.id
                }, { ref_for: !0 }, d(L.id)),
                [
                  e.createElementVNode(
                    "span",
                    {
                      class: "mm-av",
                      style: e.normalizeStyle({ background: e.unref(re)(M(L.id)).color })
                    },
                    e.toDisplayString(e.unref(re)(M(L.id)).text),
                    5
                    /* TEXT, STYLE */
                  ),
                  e.createElementVNode("div", Ps, [
                    e.createElementVNode("div", Us, [
                      e.createElementVNode(
                        "span",
                        Os,
                        e.toDisplayString(M(L.id)),
                        1
                        /* TEXT */
                      ),
                      B.value ? (e.openBlock(), e.createElementBlock("button", {
                        key: 0,
                        type: "button",
                        class: e.normalizeClass(["mm-play", { on: X.value === L.id }]),
                        title: X.value === L.id ? h.$t("暂停") : h.$t("播放这段原声"),
                        "data-test": `mm-seg-play-${L.id}`,
                        onClick: (Q) => ne(L.id)
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
                      ], 10, Rs)) : (e.openBlock(), e.createElementBlock(
                        "time",
                        qs,
                        e.toDisplayString(e.unref(Ae)(L.start)),
                        1
                        /* TEXT */
                      )),
                      T(L.id) ? (e.openBlock(), e.createElementBlock(
                        "span",
                        Ks,
                        e.toDisplayString(h.$t("本人")),
                        1
                        /* TEXT */
                      )) : e.createCommentVNode("v-if", !0),
                      L.originalText !== void 0 ? (e.openBlock(), e.createElementBlock("span", {
                        key: 3,
                        class: "mm-mini",
                        title: h.$t("原文：{t}", { t: L.originalText || "" })
                      }, e.toDisplayString(h.$t("已修改")), 9, Hs)) : e.createCommentVNode("v-if", !0),
                      L.originalSpeakerLabel !== void 0 ? (e.openBlock(), e.createElementBlock("span", {
                        key: 4,
                        class: "mm-mini",
                        title: h.$t("识别时是 {l}", { l: L.originalSpeakerLabel })
                      }, e.toDisplayString(h.$t("已改发言人")), 9, Ws)) : e.createCommentVNode("v-if", !0)
                    ]),
                    E.value === L.id ? (e.openBlock(), e.createBlock(ht, {
                      key: 0,
                      detail: l.detail,
                      "segment-id": L.id,
                      onDone: O
                    }, null, 8, ["detail", "segment-id"])) : e.createCommentVNode("v-if", !0),
                    o.value === L.id ? (e.openBlock(), e.createElementBlock(
                      e.Fragment,
                      { key: 1 },
                      [
                        e.withDirectives(e.createElementVNode(
                          "textarea",
                          {
                            "onUpdate:modelValue": f[6] || (f[6] = (Q) => c.value = Q),
                            class: "mm-seg__edit",
                            rows: "3"
                          },
                          null,
                          512
                          /* NEED_PATCH */
                        ), [
                          [e.vModelText, c.value]
                        ]),
                        e.createElementVNode("div", Gs, [
                          e.createElementVNode("button", {
                            type: "button",
                            class: "ss-btn sm primary",
                            disabled: m.value || !c.value.trim(),
                            onClick: (Q) => K(L.id)
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
                              e.toDisplayString(h.$t("保存")),
                              1
                              /* TEXT */
                            )
                          ], 8, Ys),
                          e.createElementVNode(
                            "button",
                            {
                              type: "button",
                              class: "ss-link",
                              onClick: f[7] || (f[7] = (Q) => o.value = "")
                            },
                            e.toDisplayString(h.$t("取消")),
                            1
                            /* TEXT */
                          )
                        ])
                      ],
                      64
                      /* STABLE_FRAGMENT */
                    )) : (e.openBlock(), e.createElementBlock(
                      "p",
                      Js,
                      e.toDisplayString(L.text),
                      1
                      /* TEXT */
                    )),
                    i.value === L.id ? (e.openBlock(), e.createElementBlock("div", Qs, [
                      e.withDirectives(e.createElementVNode("input", {
                        "onUpdate:modelValue": f[8] || (f[8] = (Q) => k.value = Q),
                        type: "text",
                        placeholder: h.$t("退回原因（发言人会看到），例如：这段数字需要核实")
                      }, null, 8, Zs), [
                        [e.vModelText, k.value]
                      ]),
                      e.createElementVNode("button", {
                        type: "button",
                        class: "ss-btn sm danger",
                        disabled: m.value,
                        onClick: (Q) => _(L.id)
                      }, e.toDisplayString(h.$t("确认退回")), 9, Xs),
                      e.createElementVNode(
                        "button",
                        {
                          type: "button",
                          class: "ss-link",
                          onClick: f[9] || (f[9] = (Q) => i.value = "")
                        },
                        e.toDisplayString(h.$t("取消")),
                        1
                        /* TEXT */
                      )
                    ])) : e.createCommentVNode("v-if", !0)
                  ]),
                  o.value !== L.id && i.value !== L.id && E.value !== L.id && (G(L.id) || V(L.id) || C.value) ? (e.openBlock(), e.createElementBlock("div", xs, [
                    C.value ? (e.openBlock(), e.createElementBlock("button", {
                      key: 0,
                      type: "button",
                      class: "mm-op",
                      "data-test": `mm-seg-move-${L.id}`,
                      onClick: (Q) => $(L.id)
                    }, [
                      f[12] || (f[12] = e.createElementVNode(
                        "i",
                        { class: "ri-user-shared-line" },
                        null,
                        -1
                        /* CACHED */
                      )),
                      e.createTextVNode(
                        e.toDisplayString(h.$t("改发言人")),
                        1
                        /* TEXT */
                      )
                    ], 8, er)) : e.createCommentVNode("v-if", !0),
                    G(L.id) ? (e.openBlock(), e.createElementBlock("button", {
                      key: 1,
                      type: "button",
                      class: "mm-op",
                      onClick: (Q) => R(L.id)
                    }, [
                      f[13] || (f[13] = e.createElementVNode(
                        "i",
                        { class: "ri-pencil-line" },
                        null,
                        -1
                        /* CACHED */
                      )),
                      e.createTextVNode(
                        e.toDisplayString(h.$t("修改")),
                        1
                        /* TEXT */
                      )
                    ], 8, tr)) : e.createCommentVNode("v-if", !0),
                    V(L.id) ? (e.openBlock(), e.createElementBlock("button", {
                      key: 2,
                      type: "button",
                      class: "mm-op danger",
                      onClick: (Q) => F(L.id)
                    }, e.toDisplayString(h.$t("退回给发言人")), 9, lr)) : e.createCommentVNode("v-if", !0)
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
        ks,
        e.toDisplayString(h.$t("还没有纪要内容：上传会议文件、处理完成后在这里按议题整理")),
        1
        /* TEXT */
      )),
      r.value ? (e.openBlock(), e.createElementBlock("p", nr, [
        f[14] || (f[14] = e.createElementVNode(
          "i",
          { class: "ri-error-warning-line" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(r.value),
          1
          /* TEXT */
        )
      ])) : e.createCommentVNode("v-if", !0)
    ]));
  }
}), ar = /* @__PURE__ */ ae(or, [["__scopeId", "data-v-259b6ff6"]]), et = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/utils/markdown.ts"];
if (!et) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/utils/markdown.ts");
et.default;
const sr = {
  class: "mm-plan",
  "data-test": "mm-plan"
}, rr = {
  key: 0,
  class: "mm-plan__empty"
}, ir = { class: "mm-plan__head" }, cr = { class: "ss-muted" }, dr = {
  key: 0,
  class: "ss-chip ok"
}, mr = {
  key: 0,
  class: "mm-plan__owner",
  "data-test": "mm-plan-owner"
}, ur = ["disabled"], pr = {
  key: 1,
  class: "ss-note"
}, vr = {
  key: 2,
  class: "ss-note"
}, kr = { class: "mm-plan__summary" }, yr = { class: "mm-plan__sumhead" }, gr = ["innerHTML"], fr = {
  key: 2,
  class: "ss-muted"
}, Nr = { class: "mm-plan__sumhead" }, Vr = { class: "ss-muted" }, Er = { class: "ss-table-wrap" }, $r = {
  key: 0,
  class: "c-del"
}, br = { key: 0 }, hr = ["data-test"], _r = { class: "num" }, Br = ["onUpdate:modelValue"], Sr = { value: "" }, Dr = ["value"], wr = { key: 1 }, Cr = { class: "wrap" }, Tr = ["onUpdate:modelValue", "placeholder"], Ir = { key: 1 }, Mr = {
  key: 2,
  class: "mm-plan__from"
}, Ar = { class: "wrap" }, jr = ["onUpdate:modelValue", "placeholder"], Lr = { key: 1 }, zr = ["onUpdate:modelValue", "data-test"], Fr = { key: 1 }, Pr = {
  key: 2,
  class: "mm-plan__warn"
}, Ur = { class: "mm-plan__to" }, Or = {
  key: 0,
  class: "mm-plan__warn"
}, Rr = { key: 0 }, qr = ["title"], Kr = { key: 2 }, Hr = { key: 0 }, Wr = ["title", "onClick"], Gr = { key: 0 }, Yr = ["colspan"], Jr = {
  key: 3,
  class: "mm-plan__problems"
}, Qr = {
  key: 4,
  class: "ss-actions"
}, Zr = ["disabled"], Xr = ["disabled"], xr = ["disabled"], ei = {
  key: 2,
  class: "ss-note danger"
}, ti = /* @__PURE__ */ e.defineComponent({
  __name: "PlanPanel",
  props: {
    detail: {}
  },
  emits: ["changed"],
  setup(l, { emit: v }) {
    const n = l, u = v, y = ce.useNotificationStore(), s = e.ref({ depts: [], people: [] }), o = e.ref([]), c = e.ref(""), i = e.ref(!1), k = e.ref(!1), E = e.ref(!1), m = e.ref([]), r = e.ref(""), N = e.ref(""), w = Ye(Date.now()), a = e.computed(() => n.detail.meeting), g = e.computed(() => a.value.plan), D = e.computed(() => a.value.status === "plan_confirm" && n.detail.my.isPlanOwner), P = e.computed(() => n.detail.my.isHost && (a.value.status === "pending_owner" || a.value.status === "plan_confirm"));
    function j(W) {
      return n.detail.names[W]?.name || s.value.people.find((Y) => Y.id === W)?.name || W;
    }
    function C(W) {
      return s.value.depts.find((Y) => Y.id === W)?.name || W || "-";
    }
    function I(W) {
      const Y = s.value.depts.find((ne) => ne.id === W)?.leaderIds?.[0], ee = Y ? s.value.people.find((ne) => ne.id === Y) : void 0;
      return ee && !ee.left ? ee.name : "";
    }
    function U(W) {
      return W ? s.value.people.filter((Y) => Y.deptId === W && !Y.left).map((Y) => Y.id) : [];
    }
    function q(W) {
      return W.assigneeId ? j(W.assigneeId) : I(W.deptId);
    }
    function B(W, Y) {
      Y ? W.assigneeId = Y : delete W.assigneeId, i.value = !0;
    }
    function S(W) {
      return W ? a.value.decisions.findIndex((Y) => Y.id === W) + 1 : 0;
    }
    function b() {
      o.value = (g.value?.items || []).map((W) => ({ ...W })), c.value = g.value?.summary || "", i.value = !1, k.value = !1, E.value = !1;
    }
    e.watch(g, () => {
      i.value || b();
    }, { immediate: !0, deep: !0 });
    const M = e.computed(() => {
      const W = g.value;
      return W ? W.ownerIds?.length ? W.ownerIds : W.ownerId ? [W.ownerId] : [] : [];
    }), T = e.computed(() => M.value.map((W) => j(W)).filter(Boolean).join(t.t("、"))), G = e.computed(() => m.value.length === M.value.length && m.value.every((W) => M.value.includes(W)));
    e.watch(M, (W) => {
      m.value = [...W];
    }, { immediate: !0 });
    const V = e.computed(() => {
      const W = [];
      return o.value.length || W.push(t.t("至少保留一项任务")), o.value.forEach((Y, ee) => {
        const ne = ee + 1;
        Y.deptId || W.push(t.t("第 {n} 项没有选责任部门", { n: ne })), Y.title.trim() || W.push(t.t("第 {n} 项没有填执行事项", { n: ne })), /^\d{4}-\d{2}-\d{2}$/.test(Y.due || "") || W.push(t.t("第 {n} 项没有设完成时间", { n: ne })), Y.deptId && !Y.assigneeId && s.value.depts.length && !I(Y.deptId) && W.push(t.t("第 {n} 项的部门没有负责人，请在「下发给」里选人", { n: ne }));
      }), W;
    });
    function d() {
      o.value.push({ id: `new-${Date.now().toString(36)}-${o.value.length}`, deptId: "", title: "", standard: "", due: "" }), i.value = !0;
    }
    function p(W) {
      o.value.splice(W, 1), i.value = !0;
    }
    async function z() {
      if (!(!m.value.length || r.value)) {
        r.value = "owner", N.value = "";
        try {
          const W = [...m.value];
          await J("meeting.plan.owner", { id: a.value.id, ownerIds: W }), y.success(t.t("已指定 {name} 为任务负责人，已通知确认方案", { name: W.map((Y) => j(Y)).join(t.t("、")) })), u("changed");
        } catch (W) {
          N.value = x.errorMessage(W);
        } finally {
          r.value = "";
        }
      }
    }
    async function X(W = !1) {
      if (E.value = !0, V.value.length)
        return N.value = t.t("还有没填完的任务，先补齐再保存"), !1;
      r.value = "save", N.value = "";
      try {
        return await J("meeting.plan.save", { id: a.value.id, items: o.value.map((Y) => ({ ...Y, title: Y.title.trim(), standard: Y.standard.trim() })), summary: c.value }), i.value = !1, k.value = !1, W || y.success(t.t("方案已保存")), u("changed"), !0;
      } catch (Y) {
        return N.value = x.errorMessage(Y), !1;
      } finally {
        r.value = "";
      }
    }
    async function le() {
      if (E.value = !0, V.value.length) {
        N.value = t.t("还有没填完的任务，先补齐再确认");
        return;
      }
      if (window.confirm(t.t("确认后将生成 {n} 项任务，按「下发给」一栏下发，方案不能再改。确定？", { n: o.value.length })) && !(i.value && !await X(!0))) {
        r.value = "confirm", N.value = "";
        try {
          await J("meeting.plan.confirm", { id: a.value.id }), y.success(t.t("方案已确认，任务已下发")), u("changed");
        } catch (W) {
          N.value = x.errorMessage(W);
        } finally {
          r.value = "";
        }
      }
    }
    return e.onMounted(async () => {
      try {
        s.value = await De();
      } catch (W) {
        N.value = x.errorMessage(W);
      }
    }), (W, Y) => (e.openBlock(), e.createElementBlock("section", sr, [
      g.value ? (e.openBlock(), e.createElementBlock(
        e.Fragment,
        { key: 1 },
        [
          e.createElementVNode("header", ir, [
            e.createElementVNode(
              "h4",
              null,
              e.toDisplayString(W.$t("AI 执行方案")),
              1
              /* TEXT */
            ),
            e.createElementVNode(
              "span",
              cr,
              e.toDisplayString(W.$t("生成于 {t}", { t: e.unref(he)(g.value.generatedAt) })),
              1
              /* TEXT */
            ),
            Y[9] || (Y[9] = e.createElementVNode(
              "span",
              { class: "mm-grow" },
              null,
              -1
              /* CACHED */
            )),
            e.createElementVNode(
              "span",
              {
                class: e.normalizeClass(["ss-chip", M.value.length ? "brand" : "warn"]),
                "data-test": "mm-plan-owner-chip"
              },
              e.toDisplayString(M.value.length ? W.$t("任务负责人：{name}", { name: T.value }) : W.$t("还没有指定任务负责人")),
              3
              /* TEXT, CLASS */
            ),
            g.value.confirmedAt ? (e.openBlock(), e.createElementBlock(
              "span",
              dr,
              e.toDisplayString(W.$t("{t} 已确认", { t: e.unref(he)(g.value.confirmedAt) })),
              1
              /* TEXT */
            )) : e.createCommentVNode("v-if", !0)
          ]),
          e.createCommentVNode(" 主持人指定任务负责人 "),
          P.value ? (e.openBlock(), e.createElementBlock("div", mr, [
            Y[10] || (Y[10] = e.createElementVNode(
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
              e.toDisplayString(a.value.status === "pending_owner" ? W.$t("指定任务负责人（可多选）：其中任何一位都能确认方案，确认后按部门下发给各部门负责人") : W.$t("更换任务负责人（可多选）")),
              1
              /* TEXT */
            ),
            e.createVNode(Oe, {
              values: m.value,
              "onUpdate:values": Y[0] || (Y[0] = (ee) => m.value = ee),
              multiple: "",
              max: 10,
              class: "mm-plan__owner-pick",
              people: s.value,
              "aria-label": W.$t("任务负责人"),
              "data-test": "mm-plan-owner-select"
            }, null, 8, ["values", "people", "aria-label"]),
            e.createElementVNode("button", {
              type: "button",
              class: "ss-btn sm primary",
              disabled: !m.value.length || G.value || !!r.value,
              "data-test": "mm-plan-owner-save",
              onClick: z
            }, [
              e.createElementVNode(
                "i",
                {
                  class: e.normalizeClass(r.value === "owner" ? "ri-loader-4-line spin" : "ri-check-line")
                },
                null,
                2
                /* CLASS */
              ),
              e.createTextVNode(
                e.toDisplayString(W.$t("指定")),
                1
                /* TEXT */
              )
            ], 8, ur)
          ])) : a.value.status === "pending_owner" ? (e.openBlock(), e.createElementBlock("p", pr, [
            Y[11] || (Y[11] = e.createElementVNode(
              "i",
              { class: "ri-time-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(W.$t("等待主持人 {name} 指定任务负责人", { name: j(a.value.hostId) })),
              1
              /* TEXT */
            )
          ])) : a.value.status === "plan_confirm" && !l.detail.my.isPlanOwner ? (e.openBlock(), e.createElementBlock("p", vr, [
            Y[12] || (Y[12] = e.createElementVNode(
              "i",
              { class: "ri-time-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(W.$t("等待任务负责人 {name} 确认方案", { name: T.value })),
              1
              /* TEXT */
            )
          ])) : e.createCommentVNode("v-if", !0),
          e.createCommentVNode(" 方案概述 "),
          e.createElementVNode("div", kr, [
            e.createElementVNode("div", yr, [
              e.createElementVNode(
                "b",
                null,
                e.toDisplayString(W.$t("方案概述")),
                1
                /* TEXT */
              ),
              D.value && !k.value ? (e.openBlock(), e.createElementBlock(
                "button",
                {
                  key: 0,
                  type: "button",
                  class: "ss-link",
                  onClick: Y[1] || (Y[1] = (ee) => k.value = !0)
                },
                e.toDisplayString(W.$t("编辑")),
                1
                /* TEXT */
              )) : e.createCommentVNode("v-if", !0)
            ]),
            k.value ? e.withDirectives((e.openBlock(), e.createElementBlock(
              "textarea",
              {
                key: 0,
                "onUpdate:modelValue": Y[2] || (Y[2] = (ee) => c.value = ee),
                rows: "6",
                class: "mm-plan__textarea",
                onInput: Y[3] || (Y[3] = (ee) => i.value = !0)
              },
              null,
              544
              /* NEED_HYDRATION, NEED_PATCH */
            )), [
              [e.vModelText, c.value]
            ]) : c.value.trim() ? (e.openBlock(), e.createElementBlock(
              e.Fragment,
              { key: 1 },
              [
                e.createCommentVNode(" eslint-disable-next-line vue/no-v-html -- renderMarkdown 已过 sanitizeHtml "),
                e.createElementVNode("div", {
                  class: "mm-plan__md",
                  innerHTML: e.unref(et.renderMarkdown)(c.value)
                }, null, 8, gr)
              ],
              2112
              /* STABLE_FRAGMENT, DEV_ROOT_FRAGMENT */
            )) : (e.openBlock(), e.createElementBlock(
              "p",
              fr,
              e.toDisplayString(W.$t("（没有概述）")),
              1
              /* TEXT */
            ))
          ]),
          e.createCommentVNode(" 任务清单 "),
          e.createElementVNode("div", Nr, [
            e.createElementVNode(
              "b",
              null,
              e.toDisplayString(W.$t("任务清单 · {n} 项", { n: o.value.length })),
              1
              /* TEXT */
            ),
            e.createElementVNode(
              "span",
              Vr,
              e.toDisplayString(W.$t("每项一个责任部门；「下发给」默认是该部门在通讯录里的第一位负责人，可以改成任何人")),
              1
              /* TEXT */
            )
          ]),
          e.createElementVNode("div", Er, [
            e.createElementVNode(
              "table",
              {
                class: e.normalizeClass(["ss-table mm-plan__table", { edit: D.value }])
              },
              [
                e.createElementVNode("colgroup", null, [
                  Y[13] || (Y[13] = e.createElementVNode(
                    "col",
                    { class: "c-no" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  Y[14] || (Y[14] = e.createElementVNode(
                    "col",
                    { class: "c-dept" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  Y[15] || (Y[15] = e.createElementVNode(
                    "col",
                    null,
                    null,
                    -1
                    /* CACHED */
                  )),
                  Y[16] || (Y[16] = e.createElementVNode(
                    "col",
                    null,
                    null,
                    -1
                    /* CACHED */
                  )),
                  Y[17] || (Y[17] = e.createElementVNode(
                    "col",
                    { class: "c-due" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  Y[18] || (Y[18] = e.createElementVNode(
                    "col",
                    { class: "c-to" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  D.value ? (e.openBlock(), e.createElementBlock("col", $r)) : e.createCommentVNode("v-if", !0)
                ]),
                e.createElementVNode("thead", null, [
                  e.createElementVNode("tr", null, [
                    Y[19] || (Y[19] = e.createElementVNode(
                      "th",
                      null,
                      "#",
                      -1
                      /* CACHED */
                    )),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(W.$t("责任部门")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(W.$t("执行事项")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(W.$t("交付标准")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(W.$t("完成时间")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(W.$t("下发给")),
                      1
                      /* TEXT */
                    ),
                    D.value ? (e.openBlock(), e.createElementBlock("th", br)) : e.createCommentVNode("v-if", !0)
                  ])
                ]),
                e.createElementVNode("tbody", null, [
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(o.value, (ee, ne) => (e.openBlock(), e.createElementBlock("tr", {
                      key: ee.id,
                      "data-test": `mm-plan-item-${ne}`
                    }, [
                      e.createElementVNode(
                        "td",
                        _r,
                        e.toDisplayString(ne + 1),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode("td", null, [
                        D.value ? e.withDirectives((e.openBlock(), e.createElementBlock("select", {
                          key: 0,
                          "onUpdate:modelValue": ($) => ee.deptId = $,
                          onChange: Y[4] || (Y[4] = ($) => i.value = !0)
                        }, [
                          e.createElementVNode(
                            "option",
                            Sr,
                            e.toDisplayString(W.$t("选择部门")),
                            1
                            /* TEXT */
                          ),
                          (e.openBlock(!0), e.createElementBlock(
                            e.Fragment,
                            null,
                            e.renderList(s.value.depts, ($) => (e.openBlock(), e.createElementBlock("option", {
                              key: $.id,
                              value: $.id
                            }, e.toDisplayString($.name), 9, Dr))),
                            128
                            /* KEYED_FRAGMENT */
                          ))
                        ], 40, Br)), [
                          [e.vModelSelect, ee.deptId]
                        ]) : (e.openBlock(), e.createElementBlock(
                          "span",
                          wr,
                          e.toDisplayString(C(ee.deptId)),
                          1
                          /* TEXT */
                        ))
                      ]),
                      e.createElementVNode("td", Cr, [
                        D.value ? e.withDirectives((e.openBlock(), e.createElementBlock("input", {
                          key: 0,
                          "onUpdate:modelValue": ($) => ee.title = $,
                          type: "text",
                          class: "wide",
                          placeholder: W.$t("执行事项"),
                          onInput: Y[5] || (Y[5] = ($) => i.value = !0)
                        }, null, 40, Tr)), [
                          [e.vModelText, ee.title]
                        ]) : (e.openBlock(), e.createElementBlock(
                          "span",
                          Ir,
                          e.toDisplayString(ee.title),
                          1
                          /* TEXT */
                        )),
                        S(ee.decisionId) ? (e.openBlock(), e.createElementBlock(
                          "small",
                          Mr,
                          e.toDisplayString(W.$t("来自决议 {n}", { n: S(ee.decisionId) })),
                          1
                          /* TEXT */
                        )) : e.createCommentVNode("v-if", !0)
                      ]),
                      e.createElementVNode("td", Ar, [
                        D.value ? e.withDirectives((e.openBlock(), e.createElementBlock("input", {
                          key: 0,
                          "onUpdate:modelValue": ($) => ee.standard = $,
                          type: "text",
                          class: "wide",
                          placeholder: W.$t("交付标准"),
                          onInput: Y[6] || (Y[6] = ($) => i.value = !0)
                        }, null, 40, jr)), [
                          [e.vModelText, ee.standard]
                        ]) : (e.openBlock(), e.createElementBlock(
                          "span",
                          Lr,
                          e.toDisplayString(ee.standard || "-"),
                          1
                          /* TEXT */
                        ))
                      ]),
                      e.createElementVNode("td", null, [
                        D.value ? e.withDirectives((e.openBlock(), e.createElementBlock("input", {
                          key: 0,
                          "onUpdate:modelValue": ($) => ee.due = $,
                          type: "date",
                          "data-test": `mm-plan-due-${ne}`,
                          onChange: Y[7] || (Y[7] = ($) => i.value = !0)
                        }, null, 40, zr)), [
                          [e.vModelText, ee.due]
                        ]) : (e.openBlock(), e.createElementBlock(
                          "span",
                          Fr,
                          e.toDisplayString(ee.due || "-"),
                          1
                          /* TEXT */
                        )),
                        ee.due && ee.due < e.unref(w) ? (e.openBlock(), e.createElementBlock(
                          "small",
                          Pr,
                          e.toDisplayString(W.$t("早于今天")),
                          1
                          /* TEXT */
                        )) : e.createCommentVNode("v-if", !0)
                      ]),
                      e.createElementVNode("td", Ur, [
                        D.value ? (e.openBlock(), e.createElementBlock(
                          e.Fragment,
                          { key: 0 },
                          [
                            e.createCommentVNode(" 不选 = 部门第一负责人（显示在占位里）；部门没设负责人或要交给别人时直接选人 "),
                            e.createVNode(Oe, {
                              "model-value": ee.assigneeId || "",
                              people: s.value,
                              pinned: U(ee.deptId),
                              "pinned-label": W.$t("本部门"),
                              placeholder: I(ee.deptId) ? W.$t("默认：{name}", { name: I(ee.deptId) }) : W.$t("选择下发给谁"),
                              "aria-label": W.$t("下发给"),
                              clearable: "",
                              "data-test": `mm-plan-to-${ne}`,
                              "onUpdate:modelValue": ($) => B(ee, $)
                            }, null, 8, ["model-value", "people", "pinned", "pinned-label", "placeholder", "aria-label", "data-test", "onUpdate:modelValue"]),
                            ee.deptId && !ee.assigneeId && !I(ee.deptId) && s.value.depts.length ? (e.openBlock(), e.createElementBlock(
                              "small",
                              Or,
                              e.toDisplayString(W.$t("部门没有负责人，请选人")),
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
                            q(ee) ? (e.openBlock(), e.createElementBlock(
                              "span",
                              Rr,
                              e.toDisplayString(q(ee)),
                              1
                              /* TEXT */
                            )) : ee.deptId ? (e.openBlock(), e.createElementBlock("span", {
                              key: 1,
                              class: "mm-plan__warn",
                              title: W.$t("企微通讯录里这个部门没有设置负责人，确认后无法下发")
                            }, e.toDisplayString(W.$t("部门没有负责人")), 9, qr)) : (e.openBlock(), e.createElementBlock("span", Kr, "-"))
                          ],
                          64
                          /* STABLE_FRAGMENT */
                        ))
                      ]),
                      D.value ? (e.openBlock(), e.createElementBlock("td", Hr, [
                        e.createElementVNode("button", {
                          type: "button",
                          class: "ss-link mm-plan__del",
                          title: W.$t("删除这项任务"),
                          onClick: ($) => p(ne)
                        }, [...Y[20] || (Y[20] = [
                          e.createElementVNode(
                            "i",
                            { class: "ri-delete-bin-line" },
                            null,
                            -1
                            /* CACHED */
                          )
                        ])], 8, Wr)
                      ])) : e.createCommentVNode("v-if", !0)
                    ], 8, hr))),
                    128
                    /* KEYED_FRAGMENT */
                  )),
                  o.value.length ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock("tr", Gr, [
                    e.createElementVNode("td", {
                      colspan: D.value ? 7 : 6,
                      class: "mm-plan__none"
                    }, e.toDisplayString(W.$t("AI 没有从决议里拆出任务")), 9, Yr)
                  ]))
                ])
              ],
              2
              /* CLASS */
            )
          ]),
          D.value && V.value.length && E.value ? (e.openBlock(), e.createElementBlock("ul", Jr, [
            (e.openBlock(!0), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(V.value, (ee) => (e.openBlock(), e.createElementBlock(
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
          D.value ? (e.openBlock(), e.createElementBlock("div", Qr, [
            e.createElementVNode("button", {
              type: "button",
              class: "ss-btn sm",
              "data-test": "mm-plan-add",
              onClick: d
            }, [
              Y[21] || (Y[21] = e.createElementVNode(
                "i",
                { class: "ri-add-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(W.$t("添加任务")),
                1
                /* TEXT */
              )
            ]),
            Y[22] || (Y[22] = e.createElementVNode(
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
              disabled: !!r.value,
              "data-test": "mm-plan-save",
              onClick: Y[8] || (Y[8] = (ee) => X())
            }, [
              e.createElementVNode(
                "i",
                {
                  class: e.normalizeClass(r.value === "save" ? "ri-loader-4-line spin" : "ri-save-3-line")
                },
                null,
                2
                /* CLASS */
              ),
              e.createTextVNode(
                e.toDisplayString(W.$t("保存修改")),
                1
                /* TEXT */
              )
            ], 8, Zr)) : e.createCommentVNode("v-if", !0),
            i.value ? (e.openBlock(), e.createElementBlock("button", {
              key: 1,
              type: "button",
              class: "ss-link",
              disabled: !!r.value,
              onClick: b
            }, e.toDisplayString(W.$t("放弃修改")), 9, Xr)) : e.createCommentVNode("v-if", !0),
            e.createElementVNode("button", {
              type: "button",
              class: "ss-btn primary",
              disabled: !!r.value,
              "data-test": "mm-plan-confirm",
              onClick: le
            }, [
              e.createElementVNode(
                "i",
                {
                  class: e.normalizeClass(r.value === "confirm" ? "ri-loader-4-line spin" : "ri-send-plane-line")
                },
                null,
                2
                /* CLASS */
              ),
              e.createTextVNode(
                e.toDisplayString(W.$t("确认方案并下发")),
                1
                /* TEXT */
              )
            ], 8, xr)
          ])) : e.createCommentVNode("v-if", !0)
        ],
        64
        /* STABLE_FRAGMENT */
      )) : (e.openBlock(), e.createElementBlock(
        "p",
        rr,
        e.toDisplayString(W.$t("纪要定稿后，主持人选择「生成任务」，AI 会在这里按决议事项生成执行方案和任务清单。")),
        1
        /* TEXT */
      )),
      N.value ? (e.openBlock(), e.createElementBlock("p", ei, [
        Y[23] || (Y[23] = e.createElementVNode(
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
      ])) : e.createCommentVNode("v-if", !0)
    ]));
  }
}), li = /* @__PURE__ */ ae(ti, [["__scopeId", "data-v-6067da9b"]]), ni = {
  class: "mm-dt",
  "data-test": "mm-meeting-detail"
}, oi = {
  key: 0,
  class: "ss-note danger"
}, ai = {
  key: 1,
  class: "ss-note"
}, si = {
  class: "mm-dt__sticky",
  "data-test": "mm-meeting-steps"
}, ri = { class: "mm-dt__titlerow" }, ii = { class: "mm-steps" }, ci = ["data-test"], di = {
  key: 0,
  class: "mm-dt__procline"
}, mi = { class: "mm-dt__procbar" }, ui = { class: "mm-dt__info" }, pi = { key: 0 }, vi = {
  key: 0,
  class: "ss-note warn"
}, ki = { class: "mm-banner__icon" }, yi = { class: "mm-banner__text" }, gi = { key: 0 }, fi = {
  key: 0,
  class: "mm-banner__ops"
}, Ni = ["disabled", "data-test", "onClick"], Vi = {
  key: 0,
  class: "ri-loader-4-line spin"
}, Ei = {
  key: 2,
  class: "ss-note danger"
}, $i = {
  class: "mm-dt__tabs",
  role: "tablist"
}, bi = ["aria-selected", "data-test", "onClick"], hi = {
  key: 0,
  class: "mm-dt__extra"
}, _i = { class: "mm-dt__grid" }, Bi = { class: "mm-dt__main" }, Si = {
  key: 0,
  class: "mm-dt__empty"
}, Di = {
  key: 1,
  class: "ss-table-wrap"
}, wi = {
  class: "ss-table",
  "data-test": "mm-confirm-table"
}, Ci = { class: "num" }, Ti = ["data-test"], Ii = { class: "mm-person" }, Mi = { class: "num" }, Ai = {
  key: 0,
  class: "ss-chip ok"
}, ji = ["title"], Li = {
  key: 2,
  class: "ss-chip warn"
}, zi = {
  key: 3,
  class: "mm-dt__note"
}, Fi = { class: "ss-muted" }, Pi = {
  key: 0,
  class: "mm-dt__empty"
}, Ui = {
  key: 1,
  class: "mm-raw",
  "data-test": "mm-transcript"
}, Oi = { class: "mm-dt__sub" }, Ri = ["disabled"], qi = ["disabled", "title"], Ki = {
  key: 0,
  class: "mm-dt__empty"
}, Hi = {
  key: 1,
  class: "ss-table-wrap"
}, Wi = { class: "ss-table" }, Gi = { class: "num" }, Yi = { class: "num" }, Ji = { class: "mm-dt__sub" }, Qi = {
  key: 0,
  class: "ss-muted"
}, Zi = ["disabled"], Xi = {
  key: 2,
  class: "ss-note danger"
}, xi = {
  key: 3,
  class: "mm-dt__empty"
}, ec = {
  key: 4,
  class: "mm-log"
}, tc = {
  key: 0,
  class: "mm-dt__empty"
}, lc = {
  key: 1,
  class: "mm-tasks",
  "data-test": "mm-meeting-tasks"
}, nc = ["onClick"], oc = { class: "mm-tasks__main" }, ac = { class: "mm-tasks__bar" }, sc = { class: "mm-tasks__pct" }, rc = {
  key: 0,
  class: "ss-chip bad"
}, ic = { class: "mm-dt__side" }, cc = { class: "mm-side" }, dc = { key: 0 }, mc = { class: "mm-avatars" }, uc = ["title"], pc = /* @__PURE__ */ e.defineComponent({
  __name: "MeetingDetail",
  props: {
    meetingId: {},
    focus: {}
  },
  emits: ["changed", "role"],
  setup(l, { expose: v, emit: n }) {
    const u = l, y = n, s = ce.useNotificationStore(), o = e.ref(null), c = e.ref(""), i = e.ref(""), k = e.ref("minutes"), E = e.ref(""), m = e.ref(0), r = e.ref(null), N = e.ref(Date.now()), w = e.ref(0), a = e.computed(() => o.value?.meeting), g = e.computed(() => oe.value?.me?.person?.id), D = e.computed(() => oe.value?.settings?.confirmTimeoutHours ?? 24), P = e.computed(() => el(a.value.status)), j = e.computed(() => pt[a.value.status] || "muted"), C = e.computed(() => {
      const $ = a.value.status;
      return $ === "pending_confirm" && o.value?.confirm.total ? t.t("待确认 {a}/{b}", { a: o.value.confirm.done, b: o.value.confirm.total }) : Xe[$];
    }), I = e.computed(() => r.value?.stage || a.value.process?.stage || "extract"), U = e.computed(() => Math.max(0, Math.min(100, Math.round(r.value?.progress ?? a.value.process?.progress ?? 0)))), q = e.computed(() => [...a.value.segments].sort(($, O) => $.start - O.start)), B = e.computed(() => a.value.confirmations.find(($) => $.personId === g.value)), S = e.computed(() => !!o.value?.my.isHost && o.value.projectStatus === "active" && ["pending_assign", "pending_confirm", "pending_review", "failed"].includes(a.value.status) && a.value.files.some(($) => $.kind === "audio" || $.kind === "video")), b = ($) => $ && o.value?.names[$]?.name || "", M = e.computed(() => {
      const $ = [...new Set(a.value.files.map((O) => O.kind))].map((O) => Vt[O]).join(" / ");
      return $ ? `${ot[a.value.source]} ${$}` : ot[a.value.source];
    }), T = e.computed(() => {
      const $ = o.value?.confirm;
      return $?.total ? $.done >= $.total ? t.t("均已确认") : t.t("已确认 {a}/{b}", { a: $.done, b: $.total }) : "";
    });
    function G($) {
      return a.value.segments.filter((O) => Le(a.value, O.speakerLabel) === $).length;
    }
    function V($) {
      return $.objection ? "warn" : $.status === "done" ? "ok" : $.status === "cancelled" ? "muted" : $.status === "to_accept" ? "brand" : "muted";
    }
    const d = e.computed(() => {
      if (!o.value) return [];
      const $ = o.value.confirm, O = [
        { key: "minutes", title: t.t("纪要内容") },
        { key: "confirm", title: t.t("发言确认"), extra: $?.total ? `${$.done}/${$.total}` : "" },
        { key: "transcript", title: t.t("转写原文") },
        { key: "files", title: t.t("文件与处理记录") }
      ];
      return (a.value.plan || ["pending_owner", "plan_confirm", "dispatched"].includes(a.value.status)) && O.push({ key: "plan", title: t.t("执行方案") }), (a.value.status === "dispatched" || o.value?.tasks.length) && O.push({ key: "tasks", title: t.t("关联任务"), extra: o.value?.tasks.length ? String(o.value.tasks.length) : "" }), O;
    });
    e.watch(d, ($) => {
      $.length && !$.some((O) => O.key === k.value) && (k.value = "minutes");
    });
    const p = e.computed(() => {
      const $ = o.value;
      if (!$) return null;
      const O = $.meeting, R = $.my, F = b(O.hostId), K = $.projectStatus === "archived", _ = (f, L, Q = "primary") => K ? [] : [{ key: f, label: L, kind: Q }], h = (f, L) => ({ tone: "muted", icon: "ri-time-line", title: f, desc: L, actions: [] });
      switch (O.status) {
        case "pending_upload":
          return R.isHost ? { tone: "warn", icon: "ri-upload-cloud-2-line", title: t.t("上传会议文件，开始转写和整理"), desc: t.t("录音、录屏、文字记录都支持；优先上传录音或录屏，能按声纹自动认出发言人"), actions: _("pick", t.t("选择文件")) } : h(t.t("等待主持人 {name} 上传会议文件", { name: F }));
        case "processing":
          return { tone: "brand", icon: "ri-loader-4-line spin", title: t.t("正在处理：{stage}", { stage: je[I.value] }), desc: t.t("完成后自动通知每位发言人确认本人发言"), actions: [] };
        case "failed":
          return R.isHost ? { tone: "bad", icon: "ri-error-warning-line", title: t.t("处理失败"), desc: O.process?.error || "", actions: _("retry", t.t("重试")) } : { tone: "bad", icon: "ri-error-warning-line", title: t.t("处理失败，等待主持人 {name} 重试", { name: F }), desc: O.process?.error || "", actions: [] };
        case "pending_assign": {
          const f = O.speakers.filter((L) => !L.personId).length;
          return R.isHost ? { tone: "warn", icon: "ri-user-search-line", title: t.t("有 {n} 位发言人没认出来，请先指认", { n: f }), desc: t.t("试听片段后从参会人里选人；全部指认完自动进入发言确认"), actions: k.value === "minutes" ? [] : _("goMinutes", t.t("去指认")) } : h(t.t("等待主持人 {name} 指认发言人", { name: F }));
        }
        case "pending_confirm": {
          const f = $.confirm;
          if (B.value?.status === "pending") {
            const L = O.segments.filter((Z) => R.myLabels.includes(Z.speakerLabel) || Le(O, Z.speakerLabel) === g.value).length, Q = B.value.returnedAt ? t.t("主持人退回了你的发言：{note}。改完后重新确认。", { note: B.value.returnNote || t.t("（没有写原因）") }) : "";
            return { tone: Q ? "warn" : "brand", icon: "ri-chat-check-line", title: t.t("请核对你的 {n} 段发言", { n: L }), desc: Q || t.t("有误的直接在纪要里修改；没问题就点「确认我的发言」"), actions: _("confirm", t.t("确认我的发言")) };
          }
          return B.value?.status === "confirmed" ? { tone: "ok", icon: "ri-check-double-line", title: t.t("你已确认本人发言"), desc: t.t("其他发言人确认中（{a}/{b}），全部确认后进入主持人终审", { a: f.done, b: f.total }), actions: [] } : { tone: "brand", icon: "ri-chat-check-line", title: t.t("发言人确认中 {a}/{b}", { a: f.done, b: f.total }), desc: R.isHost ? t.t("全部确认后自动进入你的终审；超时未确认的系统自动催办") : t.t("全部确认后进入主持人终审"), actions: k.value === "confirm" ? [] : [{ key: "goConfirm", label: t.t("查看确认进度"), kind: "soft" }] };
        }
        case "pending_review":
          return R.isHost ? { tone: "brand", icon: "ri-check-line", title: t.t("{n} 位发言人已全部确认，等你终审", { n: $.confirm.total }), desc: t.t("可直接修改任意段落，或把某段退回给指定发言人（只有被退回的人需要重新确认）"), actions: _("approve", t.t("审核通过")) } : h(t.t("发言人已全部确认，等待主持人 {name} 终审", { name: F }));
        case "finalized":
          return R.isHost ? {
            tone: "ok",
            icon: "ri-file-shield-2-line",
            title: t.t("纪要已定稿，下一步：是否生成任务？"),
            desc: O.decisions.length ? t.t("AI 识别出 {n} 项决议事项；选「生成任务」由 AI 拆成执行方案，再由你指定任务负责人", { n: O.decisions.length }) : t.t("没有识别到决议事项，一般选「无需生成任务」结束会议"),
            actions: K ? [] : [{ key: "generate", label: t.t("生成任务"), kind: "primary" }, { key: "none", label: t.t("无需生成任务"), kind: "plain" }]
          } : h(t.t("纪要已定稿，等待主持人 {name} 选择是否生成任务", { name: F }));
        case "ended":
          return { tone: "muted", icon: "ri-flag-line", title: t.t("会议已结束（无需生成任务）"), desc: O.finalizedAt ? t.t("纪要于 {t} 定稿", { t: he(O.finalizedAt) }) : "", actions: [] };
        case "pending_owner":
          return R.isHost ? { tone: "brand", icon: "ri-user-star-line", title: t.t("执行方案已生成，请指定任务负责人"), desc: t.t("任务负责人负责确认方案；确认后自动下发给各部门负责人"), actions: k.value === "plan" ? [] : _("goPlan", t.t("去指定")) } : h(t.t("执行方案已生成，等待主持人 {name} 指定任务负责人", { name: F }));
        case "plan_confirm":
          return R.isPlanOwner ? { tone: "brand", icon: "ri-file-list-3-line", title: t.t("请确认执行方案"), desc: t.t("可以编辑任务、增删、设完成时间；确认后按部门下发给第一负责人"), actions: k.value === "plan" ? [] : _("goPlan", t.t("去确认方案")) } : h(t.t("等待任务负责人 {name} 确认方案", { name: (O.plan?.ownerIds?.length ? O.plan.ownerIds : O.plan?.ownerId ? [O.plan.ownerId] : []).map((f) => b(f)).filter(Boolean).join(t.t("、")) }));
        case "dispatched":
          return { tone: "ok", icon: "ri-send-plane-line", title: t.t("已派发 {n} 项任务", { n: $.tasks.length || O.taskIds.length }), desc: t.t("各部门负责人接收后开始执行，进度在「任务」里跟进"), actions: k.value === "tasks" ? [] : [{ key: "goTasks", label: t.t("查看关联任务"), kind: "soft" }] };
        default:
          return null;
      }
    });
    async function z() {
      const $ = u.meetingId;
      try {
        const O = await J("meeting.get", { id: $ });
        if ($ !== u.meetingId) return;
        o.value = O, c.value = "", O?.meeting?.status !== "processing" && (r.value = null);
      } catch (O) {
        c.value = x.errorMessage(O);
      }
    }
    function X() {
      z(), y("changed");
    }
    let le = null;
    function W() {
      le && clearTimeout(le), le = setTimeout(() => {
        le = null, z();
      }, 300);
    }
    async function Y($) {
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
      const O = o.value.meeting.id;
      if (!($ === "approve" && !window.confirm(t.t("审核通过后纪要锁定，不能再改，并通知全部参会人。确定通过？"))) && !($ === "none" && !window.confirm(t.t("确定无需生成任务？会议将直接结束。"))) && !($ === "reprocess" && !window.confirm(t.t("用当前的转写模型把这场会议重新转写一遍？发言人识别、确认状态和对纪要的修改都会清掉，处理完重新走确认。")))) {
        i.value = $, c.value = "";
        try {
          $ === "pick" ? await J("meeting.pickFiles", { id: O }) && s.success(t.t("文件已上传，开始处理")) : $ === "retry" ? await J("meeting.retry", { id: O }) : $ === "reprocess" ? (await J("meeting.reprocess", { id: O }), s.success(t.t("已开始重新转写"))) : $ === "confirm" ? (await J("meeting.confirm", { id: O }), s.success(t.t("已确认你的发言"))) : $ === "approve" ? (await J("meeting.review.approve", { id: O }), s.success(t.t("纪要已定稿，已通知参会人"))) : $ === "generate" ? (await J("meeting.decide", { id: O, decision: "generate" }), s.success(t.t("执行方案已生成，下一步指定任务负责人")), k.value = "plan") : $ === "none" && await J("meeting.decide", { id: O, decision: "none" }), await z(), y("changed");
        } catch (R) {
          c.value = x.errorMessage(R), s.error(x.errorMessage(R));
        } finally {
          i.value = "";
        }
      }
    }
    e.watch(() => u.focus?.seq, () => {
      const $ = u.focus;
      if (!$) return;
      const O = ["minutes", "confirm", "transcript", "files", "plan", "tasks"];
      $.tab && O.includes($.tab) && (k.value = $.tab), $.anchor && (O.includes($.anchor) ? k.value = $.anchor : (k.value = "minutes", E.value = $.anchor, m.value = $.seq));
    }, { immediate: !0 }), e.watch(() => yl(o.value, g.value), ($) => {
      $ && y("role", $);
    }, { immediate: !0 });
    let ee = null;
    e.watch(() => o.value?.meeting.status === "processing", ($) => {
      $ && !ee && (ee = setInterval(() => {
        N.value = Date.now();
      }, 1e3)), !$ && ee && (clearInterval(ee), ee = null);
    }, { immediate: !0 });
    let ne = null;
    return e.onMounted(() => {
      z(), ne = _e(($) => {
        if ($?.type === "changed") {
          ($.scope === "all" || $.scope === "meeting" && (!$.id || $.id === u.meetingId)) && W();
          return;
        }
        $?.type !== "process" || $.meetingId !== u.meetingId || (r.value = { stage: $.stage, progress: $.progress, text: $.text, at: Date.now() }, N.value = Date.now(), ($.stage === "done" || o.value && o.value.meeting.status !== "processing") && z());
      });
    }), e.onBeforeUnmount(() => {
      ne?.(), le && clearTimeout(le), ee && clearInterval(ee);
    }), v({ refresh: z }), ($, O) => (e.openBlock(), e.createElementBlock("section", ni, [
      c.value && !o.value ? (e.openBlock(), e.createElementBlock("p", oi, [
        O[5] || (O[5] = e.createElementVNode(
          "i",
          { class: "ri-error-warning-line" },
          null,
          -1
          /* CACHED */
        )),
        e.createElementVNode(
          "span",
          null,
          e.toDisplayString(c.value),
          1
          /* TEXT */
        ),
        e.createElementVNode(
          "button",
          {
            type: "button",
            class: "ss-link",
            onClick: z
          },
          e.toDisplayString($.$t("重试")),
          1
          /* TEXT */
        )
      ])) : o.value ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock("p", ai, [
        O[6] || (O[6] = e.createElementVNode(
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
          e.createElementVNode("div", si, [
            e.createElementVNode("div", ri, [
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
                  class: e.normalizeClass(["ss-chip", j.value]),
                  "data-test": "mm-meeting-status"
                },
                e.toDisplayString(C.value),
                3
                /* TEXT, CLASS */
              ),
              O[8] || (O[8] = e.createElementVNode(
                "span",
                { class: "mm-grow" },
                null,
                -1
                /* CACHED */
              )),
              e.createElementVNode("ol", ii, [
                (e.openBlock(!0), e.createElementBlock(
                  e.Fragment,
                  null,
                  e.renderList(e.unref(Dt), (R, F) => (e.openBlock(), e.createElementBlock("li", {
                    key: R.key,
                    class: e.normalizeClass({ done: F < P.value || a.value.status === "dispatched" && F === P.value, cur: F === P.value && a.value.status !== "dispatched", bad: F === P.value && a.value.status === "failed" }),
                    "data-test": `mm-step-${R.key}`
                  }, [
                    O[7] || (O[7] = e.createElementVNode(
                      "i",
                      { class: "mm-steps__dot" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createTextVNode(
                      e.toDisplayString(R.label),
                      1
                      /* TEXT */
                    )
                  ], 10, ci))),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ])
            ]),
            a.value.status === "processing" ? (e.openBlock(), e.createElementBlock("div", di, [
              e.createElementVNode("span", mi, [
                e.createElementVNode(
                  "i",
                  {
                    style: e.normalizeStyle({ width: `${U.value}%` })
                  },
                  null,
                  4
                  /* STYLE */
                )
              ]),
              e.createElementVNode(
                "small",
                null,
                e.toDisplayString($.$t("处理中 · {stage} {p}%", { stage: e.unref(je)[I.value], p: U.value })),
                1
                /* TEXT */
              )
            ])) : e.createCommentVNode("v-if", !0)
          ]),
          e.createElementVNode("p", ui, [
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
              e.toDisplayString(e.unref(he)(a.value.time)),
              1
              /* TEXT */
            ),
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString($.$t("主持人 {name}", { name: b(a.value.hostId) })),
              1
              /* TEXT */
            ),
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(M.value),
              1
              /* TEXT */
            ),
            a.value.durationSec ? (e.openBlock(), e.createElementBlock(
              "span",
              pi,
              e.toDisplayString(e.unref(dl)(a.value.durationSec)),
              1
              /* TEXT */
            )) : e.createCommentVNode("v-if", !0)
          ]),
          o.value.projectStatus !== "active" ? (e.openBlock(), e.createElementBlock("p", vi, [
            O[9] || (O[9] = e.createElementVNode(
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
          p.value ? (e.openBlock(), e.createElementBlock(
            "div",
            {
              key: 1,
              class: e.normalizeClass(["mm-banner", p.value.tone]),
              "data-test": "mm-meeting-banner"
            },
            [
              e.createElementVNode("span", ki, [
                e.createElementVNode(
                  "i",
                  {
                    class: e.normalizeClass(p.value.icon)
                  },
                  null,
                  2
                  /* CLASS */
                )
              ]),
              e.createElementVNode("div", yi, [
                e.createElementVNode(
                  "strong",
                  null,
                  e.toDisplayString(p.value.title),
                  1
                  /* TEXT */
                ),
                p.value.desc ? (e.openBlock(), e.createElementBlock(
                  "small",
                  gi,
                  e.toDisplayString(p.value.desc),
                  1
                  /* TEXT */
                )) : e.createCommentVNode("v-if", !0)
              ]),
              p.value.actions.length ? (e.openBlock(), e.createElementBlock("div", fi, [
                (e.openBlock(!0), e.createElementBlock(
                  e.Fragment,
                  null,
                  e.renderList(p.value.actions, (R) => (e.openBlock(), e.createElementBlock("button", {
                    key: R.key,
                    type: "button",
                    class: e.normalizeClass(["mm-btn", R.kind]),
                    disabled: !!i.value,
                    "data-test": `mm-action-${R.key}`,
                    onClick: (F) => Y(R.key)
                  }, [
                    i.value === R.key ? (e.openBlock(), e.createElementBlock("i", Vi)) : e.createCommentVNode("v-if", !0),
                    e.createTextVNode(
                      e.toDisplayString(R.label),
                      1
                      /* TEXT */
                    )
                  ], 10, Ni))),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ])) : e.createCommentVNode("v-if", !0)
            ],
            2
            /* CLASS */
          )) : e.createCommentVNode("v-if", !0),
          c.value ? (e.openBlock(), e.createElementBlock("p", Ei, [
            O[10] || (O[10] = e.createElementVNode(
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
          ])) : e.createCommentVNode("v-if", !0),
          e.createCommentVNode(" 内容页签 "),
          e.createElementVNode("nav", $i, [
            (e.openBlock(!0), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(d.value, (R) => (e.openBlock(), e.createElementBlock("button", {
                key: R.key,
                type: "button",
                role: "tab",
                class: e.normalizeClass({ on: k.value === R.key }),
                "aria-selected": k.value === R.key,
                "data-test": `mm-dtab-${R.key}`,
                onClick: (F) => k.value = R.key
              }, [
                e.createTextVNode(
                  e.toDisplayString(R.title),
                  1
                  /* TEXT */
                ),
                R.extra ? (e.openBlock(), e.createElementBlock(
                  "span",
                  hi,
                  e.toDisplayString(R.extra),
                  1
                  /* TEXT */
                )) : e.createCommentVNode("v-if", !0)
              ], 10, bi))),
              128
              /* KEYED_FRAGMENT */
            ))
          ]),
          e.createElementVNode("div", _i, [
            e.createElementVNode("div", Bi, [
              e.createCommentVNode(" 纪要内容 "),
              k.value === "minutes" ? (e.openBlock(), e.createElementBlock(
                e.Fragment,
                { key: 0 },
                [
                  a.value.status === "pending_upload" || a.value.status === "processing" || a.value.status === "failed" ? (e.openBlock(), e.createBlock(ta, {
                    key: 0,
                    detail: o.value,
                    live: r.value,
                    now: N.value,
                    "wait-from": w.value,
                    onChanged: X,
                    onLog: O[0] || (O[0] = (R) => k.value = "files"),
                    onWait: O[1] || (O[1] = (R) => w.value = Date.now())
                  }, null, 8, ["detail", "live", "now", "wait-from"])) : e.createCommentVNode("v-if", !0),
                  a.value.status === "pending_assign" || o.value.my.isHost && (a.value.status === "pending_confirm" || a.value.status === "pending_review") ? (e.openBlock(), e.createBlock(za, {
                    key: `sa-${a.value.status}`,
                    detail: o.value,
                    onChanged: X
                  }, null, 8, ["detail"])) : e.createCommentVNode("v-if", !0),
                  a.value.segments.length || !["pending_upload", "processing", "failed"].includes(a.value.status) ? (e.openBlock(), e.createBlock(ar, {
                    key: 2,
                    detail: o.value,
                    anchor: E.value,
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
                  a.value.confirmations.length ? (e.openBlock(), e.createElementBlock("div", Di, [
                    e.createElementVNode("table", wi, [
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
                            Ci,
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
                          e.renderList(a.value.confirmations, (R) => (e.openBlock(), e.createElementBlock("tr", {
                            key: R.personId,
                            "data-test": `mm-confirm-${R.personId}`
                          }, [
                            e.createElementVNode("td", null, [
                              e.createElementVNode("span", Ii, [
                                e.createElementVNode(
                                  "span",
                                  {
                                    class: "mm-av sm",
                                    style: e.normalizeStyle({ background: e.unref(re)(b(R.personId)).color })
                                  },
                                  e.toDisplayString(e.unref(re)(b(R.personId)).text),
                                  5
                                  /* TEXT, STYLE */
                                ),
                                e.createTextVNode(
                                  e.toDisplayString(b(R.personId)),
                                  1
                                  /* TEXT */
                                )
                              ])
                            ]),
                            e.createElementVNode(
                              "td",
                              null,
                              e.toDisplayString(o.value.names[R.personId]?.deptName || "-"),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "td",
                              Mi,
                              e.toDisplayString(G(R.personId)),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode("td", null, [
                              R.status === "confirmed" ? (e.openBlock(), e.createElementBlock(
                                "span",
                                Ai,
                                e.toDisplayString($.$t("已确认")),
                                1
                                /* TEXT */
                              )) : R.returnedAt ? (e.openBlock(), e.createElementBlock("span", {
                                key: 1,
                                class: "ss-chip bad",
                                title: R.returnNote || ""
                              }, e.toDisplayString($.$t("被退回")), 9, ji)) : (e.openBlock(), e.createElementBlock(
                                "span",
                                Li,
                                e.toDisplayString($.$t("未确认")),
                                1
                                /* TEXT */
                              )),
                              R.returnedAt && R.returnNote && R.status !== "confirmed" ? (e.openBlock(), e.createElementBlock(
                                "small",
                                zi,
                                e.toDisplayString(R.returnNote),
                                1
                                /* TEXT */
                              )) : e.createCommentVNode("v-if", !0)
                            ]),
                            e.createElementVNode(
                              "td",
                              null,
                              e.toDisplayString(R.confirmedAt ? e.unref(he)(R.confirmedAt) : "-"),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "td",
                              null,
                              e.toDisplayString(R.remindedAt ? $.$t("已催办 {t}", { t: e.unref(he)(R.remindedAt) }) : "-"),
                              1
                              /* TEXT */
                            )
                          ], 8, Ti))),
                          128
                          /* KEYED_FRAGMENT */
                        ))
                      ])
                    ])
                  ])) : (e.openBlock(), e.createElementBlock(
                    "p",
                    Si,
                    e.toDisplayString($.$t("转写和发言人识别完成后，这里显示每位发言人的确认状态")),
                    1
                    /* TEXT */
                  )),
                  e.createElementVNode(
                    "small",
                    Fi,
                    e.toDisplayString($.$t("超过 {h} 小时未确认，系统自动催办（只提醒，不改状态）；全员确认后自动进入主持人终审。", { h: D.value })),
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
                  q.value.length ? (e.openBlock(), e.createElementBlock("ol", Ui, [
                    (e.openBlock(!0), e.createElementBlock(
                      e.Fragment,
                      null,
                      e.renderList(q.value, (R) => (e.openBlock(), e.createElementBlock("li", {
                        key: R.id
                      }, [
                        e.createElementVNode(
                          "time",
                          null,
                          e.toDisplayString(e.unref(Ae)(R.start)),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "b",
                          null,
                          e.toDisplayString(e.unref(xe)(o.value, R.speakerLabel)),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "span",
                          null,
                          e.toDisplayString(R.originalText || R.text),
                          1
                          /* TEXT */
                        )
                      ]))),
                      128
                      /* KEYED_FRAGMENT */
                    ))
                  ])) : (e.openBlock(), e.createElementBlock(
                    "p",
                    Pi,
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
                  e.createElementVNode("div", Oi, [
                    e.createElementVNode(
                      "b",
                      null,
                      e.toDisplayString($.$t("上传的文件")),
                      1
                      /* TEXT */
                    ),
                    O[11] || (O[11] = e.createElementVNode(
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
                      onClick: O[2] || (O[2] = (R) => Y("pick"))
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
                    ], 8, Ri)) : e.createCommentVNode("v-if", !0),
                    S.value ? (e.openBlock(), e.createElementBlock("button", {
                      key: 1,
                      type: "button",
                      class: "ss-btn sm",
                      disabled: !!i.value,
                      "data-test": "mm-reprocess",
                      title: $.$t("换了更准的转写模型后，用现在的模型把这场会议重新转写一遍"),
                      onClick: O[3] || (O[3] = (R) => Y("reprocess"))
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
                    ], 8, qi)) : e.createCommentVNode("v-if", !0)
                  ]),
                  a.value.files.length ? (e.openBlock(), e.createElementBlock("div", Hi, [
                    e.createElementVNode("table", Wi, [
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
                            Gi,
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
                          e.renderList(a.value.files, (R) => (e.openBlock(), e.createElementBlock("tr", {
                            key: R.id
                          }, [
                            e.createElementVNode(
                              "td",
                              null,
                              e.toDisplayString(R.name),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "td",
                              null,
                              e.toDisplayString(e.unref(Vt)[R.kind] || R.kind),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "td",
                              Yi,
                              e.toDisplayString(e.unref(cl)(R.size)),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "td",
                              null,
                              e.toDisplayString(e.unref(he)(R.uploadedAt)),
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
                    Ki,
                    e.toDisplayString($.$t("还没有上传文件")),
                    1
                    /* TEXT */
                  )),
                  e.createElementVNode("div", Ji, [
                    e.createElementVNode(
                      "b",
                      null,
                      e.toDisplayString($.$t("处理记录")),
                      1
                      /* TEXT */
                    ),
                    a.value.process ? (e.openBlock(), e.createElementBlock("span", Qi, [
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
                            " · " + e.toDisplayString($.$t("完成于 {t}", { t: e.unref(he)(a.value.process.finishedAt) })),
                            1
                            /* TEXT */
                          )
                        ],
                        64
                        /* STABLE_FRAGMENT */
                      )) : e.createCommentVNode("v-if", !0)
                    ])) : e.createCommentVNode("v-if", !0),
                    O[12] || (O[12] = e.createElementVNode(
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
                      onClick: O[4] || (O[4] = (R) => Y("retry"))
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
                    ], 8, Zi)) : e.createCommentVNode("v-if", !0)
                  ]),
                  a.value.process?.error ? (e.openBlock(), e.createElementBlock("p", Xi, [
                    O[13] || (O[13] = e.createElementVNode(
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
                  a.value.process?.log?.length ? (e.openBlock(), e.createElementBlock("ol", ec, [
                    (e.openBlock(!0), e.createElementBlock(
                      e.Fragment,
                      null,
                      e.renderList(a.value.process.log, (R, F) => (e.openBlock(), e.createElementBlock("li", { key: F }, [
                        e.createElementVNode(
                          "time",
                          null,
                          e.toDisplayString(e.unref(he)(R.at)),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "span",
                          null,
                          e.toDisplayString(R.text),
                          1
                          /* TEXT */
                        )
                      ]))),
                      128
                      /* KEYED_FRAGMENT */
                    ))
                  ])) : (e.openBlock(), e.createElementBlock(
                    "p",
                    xi,
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
                  e.createVNode(li, {
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
                  o.value.tasks.length ? (e.openBlock(), e.createElementBlock("ul", lc, [
                    (e.openBlock(!0), e.createElementBlock(
                      e.Fragment,
                      null,
                      e.renderList(o.value.tasks, (R) => (e.openBlock(), e.createElementBlock("li", {
                        key: R.id,
                        onClick: (F) => e.unref(me)({ kind: "task", id: R.id })
                      }, [
                        e.createElementVNode("div", oc, [
                          e.createElementVNode(
                            "strong",
                            null,
                            e.toDisplayString(R.title),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "small",
                            null,
                            e.toDisplayString(R.deptName) + " · " + e.toDisplayString(R.assigneeName) + " · " + e.toDisplayString($.$t("截止 {d}", { d: R.due })),
                            1
                            /* TEXT */
                          )
                        ]),
                        e.createElementVNode("span", ac, [
                          e.createElementVNode(
                            "i",
                            {
                              class: e.normalizeClass({ bad: R.overdue }),
                              style: e.normalizeStyle({ width: `${Math.max(0, Math.min(100, R.percent || 0))}%` })
                            },
                            null,
                            6
                            /* CLASS, STYLE */
                          )
                        ]),
                        e.createElementVNode(
                          "small",
                          sc,
                          e.toDisplayString(Math.round(R.percent || 0)) + "%",
                          1
                          /* TEXT */
                        ),
                        R.overdue ? (e.openBlock(), e.createElementBlock(
                          "span",
                          rc,
                          e.toDisplayString($.$t("逾期 {n} 天", { n: R.overdueDays })),
                          1
                          /* TEXT */
                        )) : e.createCommentVNode("v-if", !0),
                        e.createElementVNode(
                          "span",
                          {
                            class: e.normalizeClass(["ss-chip", V(R)])
                          },
                          e.toDisplayString(e.unref(mt)(R.objection) || e.unref(Ue)[R.status]),
                          3
                          /* TEXT, CLASS */
                        ),
                        O[14] || (O[14] = e.createElementVNode(
                          "i",
                          {
                            class: "ri-arrow-right-s-line",
                            "aria-hidden": "true"
                          },
                          null,
                          -1
                          /* CACHED */
                        ))
                      ], 8, nc))),
                      128
                      /* KEYED_FRAGMENT */
                    ))
                  ])) : (e.openBlock(), e.createElementBlock(
                    "p",
                    tc,
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
            e.createElementVNode("aside", ic, [
              e.createVNode(os, {
                detail: o.value,
                onChanged: X
              }, null, 8, ["detail"]),
              e.createElementVNode("section", cc, [
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
                  T.value ? (e.openBlock(), e.createElementBlock(
                    "small",
                    dc,
                    " · " + e.toDisplayString(T.value),
                    1
                    /* TEXT */
                  )) : e.createCommentVNode("v-if", !0)
                ]),
                e.createElementVNode("div", mc, [
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(a.value.attendeeIds, (R) => (e.openBlock(), e.createElementBlock("span", {
                      key: R,
                      class: e.normalizeClass(["mm-av", { host: R === a.value.hostId }]),
                      style: e.normalizeStyle({ background: e.unref(re)(b(R)).color }),
                      title: R === a.value.hostId ? $.$t("{name}（主持人）", { name: b(R) }) : b(R)
                    }, e.toDisplayString(e.unref(re)(b(R)).text), 15, uc))),
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
}), vc = /* @__PURE__ */ ae(pc, [["__scopeId", "data-v-0b6b8600"]]), kc = ["aria-label"], yc = { class: "mm-cd" }, gc = { class: "mm-cd__head" }, fc = ["title"], Nc = { class: "mm-cd__body" }, Vc = {
  key: 0,
  class: "ss-note danger"
}, Ec = {
  key: 1,
  class: "ss-note warn"
}, $c = { class: "ss-field" }, bc = { value: "" }, hc = ["value"], _c = { class: "ss-field" }, Bc = ["placeholder"], Sc = { class: "mm-cd__row" }, Dc = { class: "ss-field" }, wc = { class: "ss-field" }, Cc = {
  class: "mm-cd__seg",
  role: "radiogroup"
}, Tc = ["aria-checked", "data-test", "onClick"], Ic = { class: "ss-field" }, Mc = { class: "ss-muted" }, Ac = { class: "ss-field" }, jc = { class: "ss-muted" }, Lc = {
  key: 0,
  class: "mm-cd__chips"
}, zc = ["title", "onClick"], Fc = { class: "mm-cd__picker" }, Pc = { class: "mm-cd__search" }, Uc = ["placeholder"], Oc = { class: "mm-cd__groups" }, Rc = { class: "mm-cd__ghead" }, qc = ["onClick"], Kc = ["data-test"], Hc = ["checked", "disabled", "onChange"], Wc = {
  key: 0,
  class: "mm-cd__none"
}, Gc = { class: "ss-muted" }, Yc = {
  key: 2,
  class: "ss-note danger"
}, Jc = { class: "mm-cd__foot" }, Qc = { class: "ss-muted" }, Zc = ["disabled"], Xc = /* @__PURE__ */ e.defineComponent({
  __name: "MeetingCreateDialog",
  props: {
    projectId: {}
  },
  emits: ["close", "created"],
  setup(l, { emit: v }) {
    const n = l, u = v, y = ["offline", "tencent", "zoom"], s = ce.useNotificationStore(), o = e.ref([]), c = e.ref({ depts: [], people: [] }), i = e.ref(!1), k = e.ref(""), E = e.ref(""), m = e.ref(!1), r = e.ref(""), N = e.ref(/* @__PURE__ */ new Set());
    function w() {
      const B = /* @__PURE__ */ new Date();
      return B.setMinutes(0, 0, 0), B.setHours(B.getHours() + 1), B.getTime();
    }
    const a = e.reactive({
      projectId: n.projectId || "",
      title: "",
      time: rl(w()),
      source: "offline",
      hostId: oe.value?.me?.person?.id || ""
    }), g = e.computed(() => Ct(c.value, r.value)), D = e.computed(() => {
      const B = new Set(N.value);
      return a.hostId && B.add(a.hostId), c.value.people.filter((S) => B.has(S.id));
    }), P = e.computed(() => D.value.length);
    function j(B) {
      if (B === a.hostId) return;
      const S = new Set(N.value);
      S.has(B) ? S.delete(B) : S.add(B), N.value = S;
    }
    function C(B) {
      const S = new Set(N.value), b = B.every((M) => S.has(M.id));
      for (const M of B)
        M.id !== a.hostId && (b ? S.delete(M.id) : S.add(M.id));
      N.value = S;
    }
    function I() {
      m.value || u("close");
    }
    function U(B) {
      B.key === "Escape" && I();
    }
    async function q() {
      if (m.value) return;
      E.value = "";
      const B = il(a.time);
      if (!a.projectId) {
        E.value = t.t("请选择所属项目");
        return;
      }
      if (!a.title.trim()) {
        E.value = t.t("请填写会议主题");
        return;
      }
      if (!Number.isFinite(B)) {
        E.value = t.t("请填写会议时间");
        return;
      }
      if (!a.hostId) {
        E.value = t.t("请选择主持人");
        return;
      }
      const S = [.../* @__PURE__ */ new Set([a.hostId, ...N.value])];
      if (S.length < 2) {
        E.value = t.t("请至少再选一位参会人");
        return;
      }
      m.value = !0;
      try {
        const b = await J("meeting.create", {
          projectId: a.projectId,
          title: a.title.trim(),
          time: B,
          source: a.source,
          hostId: a.hostId,
          attendeeIds: S
        });
        s.success(t.t("会议已创建，下一步上传会议文件")), u("created", b.id);
      } catch (b) {
        E.value = x.errorMessage(b);
      } finally {
        m.value = !1;
      }
    }
    return e.onMounted(async () => {
      document.addEventListener("keydown", U);
      try {
        const [B, S] = await Promise.all([
          J("project.list", { status: "active" }),
          De()
        ]);
        o.value = (Array.isArray(B) ? B : []).filter((b) => !b.status || b.status === "active"), c.value = S, !a.projectId && o.value.length === 1 && (a.projectId = o.value[0].id);
      } catch (B) {
        k.value = x.errorMessage(B);
      } finally {
        i.value = !0;
      }
    }), e.onBeforeUnmount(() => document.removeEventListener("keydown", U)), (B, S) => (e.openBlock(), e.createBlock(e.Teleport, { to: "body" }, [
      e.createElementVNode("div", {
        class: "mm-dialog-overlay",
        role: "dialog",
        "aria-modal": "true",
        "aria-label": B.$t("创建会议"),
        "data-test": "mm-create-dialog",
        onClick: e.withModifiers(I, ["self"])
      }, [
        e.createElementVNode("section", yc, [
          e.createElementVNode("header", gc, [
            e.createElementVNode(
              "h3",
              null,
              e.toDisplayString(B.$t("创建会议")),
              1
              /* TEXT */
            ),
            e.createElementVNode("button", {
              type: "button",
              class: "mm-cd__x",
              title: B.$t("关闭"),
              onClick: I
            }, [...S[5] || (S[5] = [
              e.createElementVNode(
                "i",
                { class: "ri-close-line" },
                null,
                -1
                /* CACHED */
              )
            ])], 8, fc)
          ]),
          e.createElementVNode("div", Nc, [
            k.value ? (e.openBlock(), e.createElementBlock("p", Vc, [
              S[6] || (S[6] = e.createElementVNode(
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
            ])) : i.value && !o.value.length ? (e.openBlock(), e.createElementBlock("p", Ec, [
              S[7] || (S[7] = e.createElementVNode(
                "i",
                { class: "ri-information-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(B.$t("没有进行中的项目：先在「项目」里新建项目（结项中、已归档的项目不能新建会议）。")),
                1
                /* TEXT */
              )
            ])) : e.createCommentVNode("v-if", !0),
            e.createElementVNode("label", $c, [
              e.createElementVNode("span", null, [
                e.createTextVNode(
                  e.toDisplayString(B.$t("所属项目")) + " ",
                  1
                  /* TEXT */
                ),
                S[8] || (S[8] = e.createElementVNode(
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
                  "onUpdate:modelValue": S[0] || (S[0] = (b) => a.projectId = b),
                  "data-test": "mm-create-project"
                },
                [
                  e.createElementVNode(
                    "option",
                    bc,
                    e.toDisplayString(B.$t("选择项目")),
                    1
                    /* TEXT */
                  ),
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(o.value, (b) => (e.openBlock(), e.createElementBlock("option", {
                      key: b.id,
                      value: b.id
                    }, e.toDisplayString(b.name), 9, hc))),
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
            e.createElementVNode("label", _c, [
              e.createElementVNode("span", null, [
                e.createTextVNode(
                  e.toDisplayString(B.$t("会议主题")) + " ",
                  1
                  /* TEXT */
                ),
                S[9] || (S[9] = e.createElementVNode(
                  "b",
                  { class: "req" },
                  "*",
                  -1
                  /* CACHED */
                ))
              ]),
              e.withDirectives(e.createElementVNode("input", {
                "onUpdate:modelValue": S[1] || (S[1] = (b) => a.title = b),
                type: "text",
                maxlength: "80",
                placeholder: B.$t("例如：A2 量产导入第 5 次周例会"),
                "data-test": "mm-create-title"
              }, null, 8, Bc), [
                [e.vModelText, a.title]
              ])
            ]),
            e.createElementVNode("div", Sc, [
              e.createElementVNode("label", Dc, [
                e.createElementVNode("span", null, [
                  e.createTextVNode(
                    e.toDisplayString(B.$t("会议时间")) + " ",
                    1
                    /* TEXT */
                  ),
                  S[10] || (S[10] = e.createElementVNode(
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
                    "onUpdate:modelValue": S[2] || (S[2] = (b) => a.time = b),
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
              e.createElementVNode("div", wc, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(B.$t("来源")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode("div", Cc, [
                  (e.openBlock(), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(y, (b) => e.createElementVNode("button", {
                      key: b,
                      type: "button",
                      role: "radio",
                      "aria-checked": a.source === b,
                      class: e.normalizeClass({ on: a.source === b }),
                      "data-test": `mm-create-source-${b}`,
                      onClick: (M) => a.source = b
                    }, e.toDisplayString(e.unref(ot)[b]), 11, Tc)),
                    64
                    /* STABLE_FRAGMENT */
                  ))
                ])
              ])
            ]),
            e.createElementVNode("div", Ic, [
              e.createElementVNode("span", null, [
                e.createTextVNode(
                  e.toDisplayString(B.$t("主持人")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "small",
                  Mc,
                  e.toDisplayString(B.$t("（默认是你，可以改；主持人负责上传、指认、终审）")),
                  1
                  /* TEXT */
                )
              ]),
              e.createVNode(Oe, {
                modelValue: a.hostId,
                "onUpdate:modelValue": S[3] || (S[3] = (b) => a.hostId = b),
                people: c.value,
                "aria-label": B.$t("主持人"),
                "data-test": "mm-create-host"
              }, null, 8, ["modelValue", "people", "aria-label"])
            ]),
            e.createElementVNode("div", Ac, [
              e.createElementVNode("span", null, [
                e.createTextVNode(
                  e.toDisplayString(B.$t("参会人")) + " ",
                  1
                  /* TEXT */
                ),
                S[11] || (S[11] = e.createElementVNode(
                  "b",
                  { class: "req" },
                  "*",
                  -1
                  /* CACHED */
                )),
                e.createElementVNode(
                  "small",
                  jc,
                  e.toDisplayString(B.$t("已选 {n} 人（主持人自动参会）", { n: P.value })),
                  1
                  /* TEXT */
                )
              ]),
              D.value.length ? (e.openBlock(), e.createElementBlock("div", Lc, [
                (e.openBlock(!0), e.createElementBlock(
                  e.Fragment,
                  null,
                  e.renderList(D.value, (b) => (e.openBlock(), e.createElementBlock("span", {
                    key: b.id,
                    class: "mm-cd__chip"
                  }, [
                    e.createTextVNode(
                      e.toDisplayString(b.name) + " ",
                      1
                      /* TEXT */
                    ),
                    b.id !== a.hostId ? (e.openBlock(), e.createElementBlock("button", {
                      key: 0,
                      type: "button",
                      title: B.$t("移除"),
                      onClick: (M) => j(b.id)
                    }, [...S[12] || (S[12] = [
                      e.createElementVNode(
                        "i",
                        { class: "ri-close-line" },
                        null,
                        -1
                        /* CACHED */
                      )
                    ])], 8, zc)) : e.createCommentVNode("v-if", !0)
                  ]))),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ])) : e.createCommentVNode("v-if", !0),
              e.createElementVNode("div", Fc, [
                e.createElementVNode("label", Pc, [
                  S[13] || (S[13] = e.createElementVNode(
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
                    "onUpdate:modelValue": S[4] || (S[4] = (b) => r.value = b),
                    type: "search",
                    placeholder: B.$t("搜索姓名、职务"),
                    "data-test": "mm-create-search"
                  }, null, 8, Uc), [
                    [e.vModelText, r.value]
                  ])
                ]),
                e.createElementVNode("div", Oc, [
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(g.value, (b) => (e.openBlock(), e.createElementBlock("div", {
                      key: b.id,
                      class: "mm-cd__group"
                    }, [
                      e.createElementVNode("div", Rc, [
                        e.createElementVNode(
                          "b",
                          null,
                          e.toDisplayString(b.name),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "small",
                          null,
                          e.toDisplayString(b.people.length),
                          1
                          /* TEXT */
                        ),
                        S[14] || (S[14] = e.createElementVNode(
                          "span",
                          { class: "mm-grow" },
                          null,
                          -1
                          /* CACHED */
                        )),
                        e.createElementVNode("button", {
                          type: "button",
                          class: "ss-link",
                          onClick: (M) => C(b.people)
                        }, e.toDisplayString(b.people.every((M) => N.value.has(M.id)) ? B.$t("取消全选") : B.$t("全选")), 9, qc)
                      ]),
                      (e.openBlock(!0), e.createElementBlock(
                        e.Fragment,
                        null,
                        e.renderList(b.people, (M) => (e.openBlock(), e.createElementBlock("label", {
                          key: M.id,
                          class: "mm-cd__person",
                          "data-test": `mm-create-person-${M.id}`
                        }, [
                          e.createElementVNode("input", {
                            type: "checkbox",
                            checked: N.value.has(M.id) || M.id === a.hostId,
                            disabled: M.id === a.hostId,
                            onChange: (T) => j(M.id)
                          }, null, 40, Hc),
                          e.createElementVNode(
                            "span",
                            {
                              class: "mm-av",
                              style: e.normalizeStyle({ background: e.unref(re)(M.name).color })
                            },
                            e.toDisplayString(e.unref(re)(M.name).text),
                            5
                            /* TEXT, STYLE */
                          ),
                          e.createElementVNode(
                            "span",
                            null,
                            e.toDisplayString(M.name),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "small",
                            null,
                            e.toDisplayString(M.title || ""),
                            1
                            /* TEXT */
                          )
                        ], 8, Kc))),
                        128
                        /* KEYED_FRAGMENT */
                      ))
                    ]))),
                    128
                    /* KEYED_FRAGMENT */
                  )),
                  i.value && !g.value.length ? (e.openBlock(), e.createElementBlock(
                    "p",
                    Wc,
                    e.toDisplayString(r.value.trim() ? B.$t("没有找到这个人") : B.$t("组织里还没有人员")),
                    1
                    /* TEXT */
                  )) : e.createCommentVNode("v-if", !0)
                ])
              ]),
              e.createElementVNode("small", Gc, [
                S[15] || (S[15] = e.createElementVNode(
                  "i",
                  { class: "ri-information-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  " " + e.toDisplayString(B.$t("找不到人员请联系管理员同步通讯录")),
                  1
                  /* TEXT */
                )
              ])
            ]),
            E.value ? (e.openBlock(), e.createElementBlock("p", Yc, [
              S[16] || (S[16] = e.createElementVNode(
                "i",
                { class: "ri-error-warning-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(E.value),
                1
                /* TEXT */
              )
            ])) : e.createCommentVNode("v-if", !0)
          ]),
          e.createElementVNode("footer", Jc, [
            e.createElementVNode(
              "span",
              Qc,
              e.toDisplayString(B.$t("创建后在会议详情里上传录音、录屏或文字记录")),
              1
              /* TEXT */
            ),
            S[17] || (S[17] = e.createElementVNode(
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
                onClick: I
              },
              e.toDisplayString(B.$t("取消")),
              1
              /* TEXT */
            ),
            e.createElementVNode("button", {
              type: "button",
              class: "ss-btn primary",
              disabled: m.value,
              "data-test": "mm-create-submit",
              onClick: q
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
                e.toDisplayString(B.$t("创建会议")),
                1
                /* TEXT */
              )
            ], 8, Zc)
          ])
        ])
      ], 8, kc)
    ]));
  }
}), Ft = /* @__PURE__ */ ae(Xc, [["__scopeId", "data-v-b8a4a4be"]]), xc = {
  class: "mm-meetings",
  "data-test": "mm-meetings"
}, ed = { class: "mm-meetings__head" }, td = { class: "mm-search" }, ld = ["placeholder"], nd = {
  key: 0,
  class: "ss-note danger"
}, od = { class: "mm-meetings__grid" }, ad = { class: "mm-mlist" }, sd = { class: "mm-chips" }, rd = ["data-test", "onClick"], id = {
  key: 0,
  class: "mm-mlist__state"
}, cd = {
  key: 1,
  class: "mm-mlist__empty"
}, dd = {
  key: 0,
  class: "mm-mlist__group"
}, md = ["data-test", "onClick", "onKeydown"], ud = { class: "mm-mcard__title" }, pd = { class: "mm-mcard__name" }, vd = ["title"], kd = ["disabled", "title", "aria-label", "data-test", "onClick"], yd = { class: "mm-mcard__meta" }, gd = {
  key: 1,
  class: "mm-placeholder"
}, fd = /* @__PURE__ */ e.defineComponent({
  __name: "MeetingsTab",
  emits: ["role"],
  setup(l, { expose: v, emit: n }) {
    const u = [
      { key: "all", title: t.t("全部") },
      { key: "todo", title: t.t("待我处理") },
      { key: "processing", title: t.t("处理中") },
      { key: "final", title: t.t("已定稿") }
    ], y = n, s = ce.useNotificationStore(), o = e.ref("all"), c = e.ref(""), i = e.ref(!1), k = e.ref(""), E = e.ref(""), m = e.ref(!1), r = e.ref(lt.value), N = e.ref(null), w = e.ref(null), a = e.reactive({ all: [], todo: [], processing: [], final: [] }), g = e.computed(() => ({ all: a.all.length, todo: a.todo.length, processing: a.processing.length, final: a.final.length })), D = e.computed(() => a[o.value]), P = e.computed(() => [
      { key: "mine", title: t.t("需要我处理"), items: D.value.filter((T) => T.needsMe) },
      { key: "other", title: t.t("其他"), items: D.value.filter((T) => !T.needsMe) }
    ]);
    let j = 0, C = "";
    async function I() {
      const T = ++j;
      i.value = !0;
      try {
        const G = c.value.trim(), V = await Promise.all(u.map((p) => J("meeting.list", { filter: p.key, ...G ? { q: G } : {} })));
        if (T !== j) return;
        u.forEach((p, z) => {
          a[p.key] = Array.isArray(V[z]) ? V[z] : [];
        }), E.value = "";
        const d = !a.all.some((p) => p.id === r.value) && !G && r.value !== C;
        if (!r.value || d) {
          const p = a.all.find((z) => z.needsMe) || a.all[0];
          p ? q(p.id) : r.value = "";
        }
      } catch (G) {
        T === j && (E.value = x.errorMessage(G));
      } finally {
        T === j && (i.value = !1);
      }
    }
    async function U() {
      await Promise.all([I(), w.value?.refresh?.()]);
    }
    function q(T) {
      T !== r.value && (N.value = null), r.value = T, lt.value = T;
    }
    function B(T) {
      m.value = !1, o.value = "all", c.value = "", q(T), I();
    }
    async function S(T) {
      if (k.value) return;
      const G = T.taskCount ? t.t("确定删除会议「{title}」？该会议的文件、纪要以及关联的 {n} 项任务和通知都会一并删除，无法恢复。", { title: T.title, n: T.taskCount }) : t.t("确定删除会议「{title}」？该会议的文件、纪要和相关通知都会一并删除，无法恢复。", { title: T.title });
      if (window.confirm(G)) {
        k.value = T.id;
        try {
          await J("meeting.delete", { id: T.id }), r.value === T.id && (r.value = "", lt.value = ""), C === T.id && (C = ""), s.success(t.t("已删除会议")), await Promise.all([I(), de().catch(() => {
          })]);
        } catch (V) {
          const d = x.errorMessage(V);
          E.value = d, s.error(d);
        } finally {
          k.value = "";
        }
      }
    }
    function b() {
      const T = Ne.value;
      T.tab !== "meetings" || !T.link || T.link.kind !== "meeting" && T.link.kind !== "meeting_plan" || (a.all.some((G) => G.id === T.link.id) || (o.value = "all", c.value = ""), C = T.link.id, q(T.link.id), N.value = { tab: T.link.kind === "meeting_plan" ? "plan" : void 0, anchor: T.link.anchor, seq: T.seq });
    }
    e.watch(() => Ne.value.seq, b);
    let M = null;
    return e.watch(c, () => {
      M && clearTimeout(M), M = setTimeout(() => {
        M = null, I();
      }, 250);
    }), e.onMounted(() => {
      b(), rt.value && (rt.value = !1, m.value = !0), I();
    }), e.onBeforeUnmount(() => {
      M && clearTimeout(M);
    }), v({ refresh: U }), (T, G) => (e.openBlock(), e.createElementBlock("div", xc, [
      e.createElementVNode("header", ed, [
        e.createElementVNode(
          "h2",
          null,
          e.toDisplayString(T.$t("会议")),
          1
          /* TEXT */
        ),
        e.createElementVNode(
          "p",
          null,
          e.toDisplayString(T.$t("上传会议文件后自动转写、识别发言人、整理纪要")),
          1
          /* TEXT */
        ),
        G[7] || (G[7] = e.createElementVNode(
          "span",
          { class: "mm-grow" },
          null,
          -1
          /* CACHED */
        )),
        e.createElementVNode("label", td, [
          G[5] || (G[5] = e.createElementVNode(
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
            "onUpdate:modelValue": G[0] || (G[0] = (V) => c.value = V),
            type: "search",
            placeholder: T.$t("搜索会议、项目"),
            "data-test": "mm-meeting-search"
          }, null, 8, ld), [
            [e.vModelText, c.value]
          ])
        ]),
        e.createElementVNode("button", {
          type: "button",
          class: "mm-btn primary",
          "data-test": "mm-meeting-create",
          onClick: G[1] || (G[1] = (V) => m.value = !0)
        }, [
          G[6] || (G[6] = e.createElementVNode(
            "i",
            { class: "ri-add-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            e.toDisplayString(T.$t("创建会议")),
            1
            /* TEXT */
          )
        ])
      ]),
      E.value ? (e.openBlock(), e.createElementBlock("p", nd, [
        G[8] || (G[8] = e.createElementVNode(
          "i",
          { class: "ri-error-warning-line" },
          null,
          -1
          /* CACHED */
        )),
        e.createElementVNode(
          "span",
          null,
          e.toDisplayString(E.value),
          1
          /* TEXT */
        ),
        e.createElementVNode(
          "button",
          {
            type: "button",
            class: "ss-link",
            onClick: U
          },
          e.toDisplayString(T.$t("重试")),
          1
          /* TEXT */
        )
      ])) : e.createCommentVNode("v-if", !0),
      e.createElementVNode("div", od, [
        e.createElementVNode("aside", ad, [
          e.createElementVNode("div", sd, [
            (e.openBlock(), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(u, (V) => e.createElementVNode("button", {
                key: V.key,
                type: "button",
                class: e.normalizeClass(["mm-chip", { on: o.value === V.key }]),
                "data-test": `mm-meeting-filter-${V.key}`,
                onClick: (d) => o.value = V.key
              }, [
                e.createTextVNode(
                  e.toDisplayString(V.title) + " ",
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(g.value[V.key]),
                  1
                  /* TEXT */
                )
              ], 10, rd)),
              64
              /* STABLE_FRAGMENT */
            ))
          ]),
          i.value && !a.all.length ? (e.openBlock(), e.createElementBlock("p", id, [
            G[9] || (G[9] = e.createElementVNode(
              "i",
              { class: "ri-loader-4-line spin" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(T.$t("正在加载会议…")),
              1
              /* TEXT */
            )
          ])) : D.value.length ? (e.openBlock(!0), e.createElementBlock(
            e.Fragment,
            { key: 2 },
            e.renderList(P.value, (V) => (e.openBlock(), e.createElementBlock(
              e.Fragment,
              {
                key: V.key
              },
              [
                V.items.length ? (e.openBlock(), e.createElementBlock("div", dd, [
                  e.createElementVNode(
                    "span",
                    null,
                    e.toDisplayString(V.title),
                    1
                    /* TEXT */
                  ),
                  G[10] || (G[10] = e.createElementVNode(
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
                  e.renderList(V.items, (d) => (e.openBlock(), e.createElementBlock("div", {
                    key: d.id,
                    role: "button",
                    tabindex: "0",
                    class: e.normalizeClass(["mm-mcard", { on: d.id === r.value }]),
                    "data-test": `mm-meeting-${d.id}`,
                    onClick: (p) => q(d.id),
                    onKeydown: [
                      e.withKeys(e.withModifiers((p) => q(d.id), ["self"]), ["enter"]),
                      e.withKeys(e.withModifiers((p) => q(d.id), ["self", "prevent"]), ["space"])
                    ]
                  }, [
                    e.createElementVNode("span", ud, [
                      e.createElementVNode(
                        "span",
                        pd,
                        e.toDisplayString(d.title),
                        1
                        /* TEXT */
                      ),
                      d.needsMe ? (e.openBlock(), e.createElementBlock("i", {
                        key: 0,
                        class: "mm-mcard__dot",
                        title: T.$t("需要我处理")
                      }, null, 8, vd)) : e.createCommentVNode("v-if", !0),
                      d.canDelete !== !1 ? (e.openBlock(), e.createElementBlock("button", {
                        key: 1,
                        type: "button",
                        class: "mm-mcard__del",
                        disabled: k.value === d.id,
                        title: T.$t("删除会议"),
                        "aria-label": T.$t("删除会议"),
                        "data-test": `mm-meeting-delete-${d.id}`,
                        onClick: e.withModifiers((p) => S(d), ["stop"])
                      }, [
                        e.createElementVNode(
                          "i",
                          {
                            class: e.normalizeClass(k.value === d.id ? "ri-loader-4-line spin" : "ri-delete-bin-line"),
                            "aria-hidden": "true"
                          },
                          null,
                          2
                          /* CLASS */
                        )
                      ], 8, kd)) : e.createCommentVNode("v-if", !0)
                    ]),
                    e.createElementVNode("span", yd, [
                      e.createElementVNode(
                        "small",
                        null,
                        e.toDisplayString(d.projectName) + " · " + e.toDisplayString(e.unref(Tt)(d.time)),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "span",
                        {
                          class: e.normalizeClass(["mm-tag", e.unref(pt)[d.status]])
                        },
                        e.toDisplayString(d.confirmText || e.unref(Xe)[d.status]),
                        3
                        /* TEXT, CLASS */
                      )
                    ])
                  ], 42, md))),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ],
              64
              /* STABLE_FRAGMENT */
            ))),
            128
            /* KEYED_FRAGMENT */
          )) : (e.openBlock(), e.createElementBlock("div", cd, [
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(c.value.trim() ? T.$t("没有找到匹配的会议") : o.value === "all" ? T.$t("还没有参加过会议") : T.$t("这个筛选下没有会议")),
              1
              /* TEXT */
            ),
            o.value === "all" && !c.value.trim() ? (e.openBlock(), e.createElementBlock(
              "button",
              {
                key: 0,
                type: "button",
                class: "ss-link",
                onClick: G[2] || (G[2] = (V) => m.value = !0)
              },
              e.toDisplayString(T.$t("新建会议")),
              1
              /* TEXT */
            )) : e.createCommentVNode("v-if", !0)
          ]))
        ]),
        r.value ? (e.openBlock(), e.createBlock(vc, {
          key: r.value,
          ref_key: "detailRef",
          ref: w,
          "meeting-id": r.value,
          focus: N.value,
          onChanged: I,
          onRole: G[3] || (G[3] = (V) => y("role", V))
        }, null, 8, ["meeting-id", "focus"])) : (e.openBlock(), e.createElementBlock("section", gd, [
          G[11] || (G[11] = e.createElementVNode(
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
            e.toDisplayString(a.all.length ? T.$t("选择左侧的会议查看详情") : T.$t("新建一场会议，上传录音或文字记录后自动整理纪要")),
            1
            /* TEXT */
          )
        ]))
      ]),
      m.value ? (e.openBlock(), e.createBlock(Ft, {
        key: 1,
        onClose: G[4] || (G[4] = (V) => m.value = !1),
        onCreated: B
      })) : e.createCommentVNode("v-if", !0)
    ]));
  }
}), Nd = /* @__PURE__ */ ae(fd, [["__scopeId", "data-v-25e61bf0"]]), Vd = ["title"], Ed = { class: "mm-pc__name" }, $d = { class: "mm-pc__dept" }, bd = /* @__PURE__ */ e.defineComponent({
  __name: "PersonChip",
  props: {
    name: {},
    dept: {},
    plain: { type: Boolean }
  },
  setup(l) {
    const v = l, n = e.computed(() => re(v.name));
    return (u, y) => (e.openBlock(), e.createElementBlock("span", {
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
        Ed,
        e.toDisplayString(l.name || "—"),
        1
        /* TEXT */
      ),
      l.dept ? (e.openBlock(), e.createElementBlock(
        e.Fragment,
        { key: 0 },
        [
          y[0] || (y[0] = e.createElementVNode(
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
            $d,
            e.toDisplayString(l.dept),
            1
            /* TEXT */
          )
        ],
        64
        /* STABLE_FRAGMENT */
      )) : e.createCommentVNode("v-if", !0)
    ], 10, Vd));
  }
}), ze = /* @__PURE__ */ ae(bd, [["__scopeId", "data-v-4f4c03f2"]]), hd = { class: "mm-tt" }, _d = {
  class: "mm-tt__head",
  "aria-hidden": "true"
}, Bd = {
  key: 0,
  class: "mm-tt__empty"
}, Sd = { class: "mm-tt__group" }, Dd = ["data-test", "onClick"], wd = ["data-test", "onClick"], Cd = { class: "mm-tt__title" }, Td = { key: 0 }, Id = { class: "mm-tt__prog" }, Md = /* @__PURE__ */ e.defineComponent({
  __name: "TaskTable",
  props: {
    tasks: {},
    groupBy: { default: "status" },
    selectedId: { default: "" },
    showProject: { type: Boolean, default: !1 },
    emptyText: { default: "" }
  },
  emits: ["select"],
  setup(l, { emit: v }) {
    const n = l, u = v, y = e.computed(() => hl(n.tasks, n.groupBy)), s = e.reactive({}), o = (i) => (i.key in s ? s[i.key] : i.collapsedByDefault) && !(n.selectedId && i.tasks.some((k) => k.id === n.selectedId) && !(i.key in s));
    function c(i) {
      s[i.key] = !o(i);
    }
    return (i, k) => (e.openBlock(), e.createElementBlock("div", hd, [
      e.createElementVNode("div", _d, [
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
      y.value.length ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock(
        "p",
        Bd,
        e.toDisplayString(l.emptyText || i.$t("没有任务")),
        1
        /* TEXT */
      )),
      (e.openBlock(!0), e.createElementBlock(
        e.Fragment,
        null,
        e.renderList(y.value, (E) => (e.openBlock(), e.createElementBlock(
          e.Fragment,
          {
            key: E.key
          },
          [
            e.createElementVNode("div", Sd, [
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(E.title) + " · " + e.toDisplayString(E.tasks.length),
                1
                /* TEXT */
              ),
              E.collapsedByDefault || s[E.key] ? (e.openBlock(), e.createElementBlock("button", {
                key: 0,
                type: "button",
                class: "mm-tt__fold",
                "data-test": `mm-tt-fold-${E.key}`,
                onClick: (m) => c(E)
              }, [
                e.createTextVNode(
                  e.toDisplayString(o(E) ? i.$t("展开") : i.$t("收起")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "i",
                  {
                    class: e.normalizeClass(o(E) ? "ri-arrow-down-s-line" : "ri-arrow-up-s-line"),
                    "aria-hidden": "true"
                  },
                  null,
                  2
                  /* CLASS */
                )
              ], 8, Dd)) : e.createCommentVNode("v-if", !0)
            ]),
            o(E) ? e.createCommentVNode("v-if", !0) : (e.openBlock(!0), e.createElementBlock(
              e.Fragment,
              { key: 0 },
              e.renderList(E.tasks, (m) => (e.openBlock(), e.createElementBlock("button", {
                key: m.id,
                type: "button",
                class: e.normalizeClass(["mm-tt__row", { on: m.id === l.selectedId, ended: m.status === "done" || m.status === "cancelled" }]),
                "data-test": `mm-task-row-${m.id}`,
                onClick: (r) => u("select", m)
              }, [
                e.createElementVNode("span", Cd, [
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
                      e.toDisplayString(e.unref(ut)(m.due)) + " ",
                      1
                      /* TEXT */
                    ),
                    m.overdue && m.overdueDays > 0 ? (e.openBlock(), e.createElementBlock(
                      "small",
                      Td,
                      e.toDisplayString(i.$t("逾期 {n} 天", { n: m.overdueDays })),
                      1
                      /* TEXT */
                    )) : e.createCommentVNode("v-if", !0)
                  ],
                  2
                  /* CLASS */
                ),
                e.createElementVNode("span", Id, [
                  e.createElementVNode(
                    "i",
                    {
                      class: e.normalizeClass(["mm-bar", { bad: m.overdue }])
                    },
                    [
                      e.createElementVNode(
                        "b",
                        {
                          style: e.normalizeStyle({ width: `${e.unref(Ee)(m.percent)}%` })
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
                    e.toDisplayString(e.unref(Ee)(m.percent)) + "%",
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
                    e.toDisplayString(e.unref(El)(m)),
                    3
                    /* TEXT, CLASS */
                  )
                ])
              ], 10, wd))),
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
}), Pt = /* @__PURE__ */ ae(Md, [["__scopeId", "data-v-f1ba1ed1"]]), Be = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/composables/useDialog.ts"];
if (!Be) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/composables/useDialog.ts");
Be.default;
const Ad = {
  class: "mm-ob",
  "data-test": "mm-objection-panel"
}, jd = {
  key: 0,
  class: "ss-note danger"
}, Ld = { class: "mm-ob__title" }, zd = { class: "ss-chip" }, Fd = { class: "mm-ob__sides" }, Pd = {
  class: "mm-ob__side raiser",
  "data-test": "mm-ob-raiser"
}, Ud = {
  key: 0,
  class: "strong"
}, Od = {
  class: "mm-ob__side owner",
  "data-test": "mm-ob-owner"
}, Rd = {
  key: 0,
  class: "strong"
}, qd = {
  key: 1,
  class: "muted"
}, Kd = { key: 2 }, Hd = {
  key: 0,
  class: "mm-ob__box",
  "data-test": "mm-ob-review"
}, Wd = { class: "sub" }, Gd = { class: "mm-ob__btns" }, Yd = ["disabled"], Jd = ["disabled"], Qd = ["disabled"], Zd = {
  key: 1,
  class: "mm-ob__box",
  "data-test": "mm-ob-reply"
}, Xd = { class: "sub" }, xd = { class: "mm-ob__btns" }, em = ["disabled"], tm = ["disabled"], lm = {
  key: 2,
  class: "mm-ob__box",
  "data-test": "mm-ob-arbitrate"
}, nm = { class: "sub" }, om = { class: "mm-ob__btns" }, am = ["disabled"], sm = ["disabled"], rm = ["disabled"], im = {
  key: 3,
  class: "ss-note info"
}, cm = {
  key: 4,
  class: "mm-ob__form",
  "data-test": "mm-ob-form"
}, dm = { class: "ss-muted" }, mm = { class: "ss-field" }, um = { class: "ss-field" }, pm = { class: "ss-field" }, vm = { class: "ss-field" }, km = ["placeholder"], ym = { class: "ss-actions" }, gm = ["disabled"], fm = {
  key: 2,
  class: "ss-empty"
}, Nm = {
  key: 3,
  class: "mm-ob__hist"
}, Vm = { class: "ss-chip" }, Em = { class: "mm-ob__log" }, $m = {
  key: 0,
  class: "ss-muted"
}, bm = {
  key: 1,
  class: "mm-tl",
  "data-test": "mm-ob-log"
}, hm = /* @__PURE__ */ e.defineComponent({
  __name: "ObjectionPanel",
  props: {
    task: {},
    can: {},
    names: {}
  },
  emits: ["changed"],
  setup(l, { emit: v }) {
    const n = l, u = v, y = {
      review_adopt: t.t("采纳并调整"),
      review_reject: t.t("驳回并说明"),
      arb_keep: t.t("维持原方案"),
      arb_adjust: t.t("按异议调整")
    }, s = Be.useDialog(), o = ce.useNotificationStore(), c = e.ref(!1), i = e.ref(""), k = e.ref(""), E = e.ref(""), m = e.reactive({ title: "", standard: "", due: "" }), r = e.computed(() => Ce(n.task) ? n.task.objection : null), N = e.computed(() => ct(n.names, r.value?.raisedBy, n.task.assigneeName)), w = e.computed(() => {
      const B = r.value?.review;
      return B ? B.decision === "adopt" ? t.t("已采纳") : t.t("已驳回") : t.t("待复核");
    }), a = e.computed(() => !!(n.can.review || n.can.reply || n.can.escalate || n.can.arbitrate)), g = e.computed(() => {
      const B = r.value?.stage;
      return B === "review" ? t.t("等待任务负责人 {name} 复核", { name: n.task.ownerName }) : B === "dept_reply" ? t.t("任务负责人已驳回，等待部门负责人 {name} 接受驳回或提交裁决", { name: N.value }) : B === "arbitration" ? t.t("已提交裁决，等待项目负责人裁决") : "";
    }), D = e.computed(() => [...n.task.objectionHistory ?? []].sort((B, S) => (S.resolvedAt || S.raisedAt) - (B.resolvedAt || B.raisedAt))), P = e.computed(() => wl(n.task.events));
    e.watch(() => [n.task.id, r.value?.stage], () => {
      k.value = "", i.value = "";
    });
    function j(B) {
      Object.assign(m, Il(n.task)), E.value = "", k.value = B;
    }
    async function C(B, S, b) {
      c.value = !0, i.value = "";
      try {
        return await J(B, S), o.success(b), k.value = "", u("changed"), !0;
      } catch (M) {
        return i.value = x.errorMessage(M), !1;
      } finally {
        c.value = !1;
      }
    }
    async function I() {
      const B = n.task.id, S = E.value.trim(), b = Tl(m, n.task);
      switch (k.value) {
        case "review_adopt":
          await C("task.objection.review", { id: B, decision: "adopt", note: S, changes: b }, t.t("已采纳，任务回到待接收，等待部门负责人重新确认"));
          break;
        case "review_reject":
          await C("task.objection.review", { id: B, decision: "reject", note: S }, t.t("已驳回，等待部门负责人回应"));
          break;
        case "arb_keep":
          await C("task.objection.arbitrate", { id: B, decision: "keep", note: S }, t.t("已裁决：维持原方案"));
          break;
        case "arb_adjust":
          await C("task.objection.arbitrate", { id: B, decision: "adjust", note: S, changes: b }, t.t("已裁决：按异议调整"));
          break;
      }
    }
    async function U(B) {
      await s.confirm(B === "accept" ? { title: t.t("接受驳回"), message: t.t("接受后异议结束，任务回到发起前的状态，按原方案执行。") } : { title: t.t("提交裁决"), message: t.t("提交后由项目负责人裁决，裁决结果为最终结果。") }) && await C("task.objection.reply", { id: n.task.id, decision: B }, B === "accept" ? t.t("已接受驳回") : t.t("已提交项目负责人裁决"));
    }
    async function q(B) {
      const S = await s.prompt({
        title: t.t("删除该任务"),
        message: t.t("删除后任务变为「已取消」（终态，结项时视同完成），并通知相关负责人。请写明原因："),
        placeholder: t.t("例如：该事项已并入其它任务"),
        confirmLabel: t.t("删除任务")
      });
      if (S === null) return;
      const b = S.trim() || t.t("删除该任务");
      B === "review" ? await C("task.objection.review", { id: n.task.id, decision: "adopt", note: b, changes: { cancel: !0 } }, t.t("任务已删除")) : await C("task.objection.arbitrate", { id: n.task.id, decision: "adjust", note: b, changes: { cancel: !0 } }, t.t("任务已删除"));
    }
    return (B, S) => (e.openBlock(), e.createElementBlock("div", Ad, [
      i.value ? (e.openBlock(), e.createElementBlock("p", jd, [
        S[13] || (S[13] = e.createElementVNode(
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
      r.value ? (e.openBlock(), e.createElementBlock(
        e.Fragment,
        { key: 1 },
        [
          e.createElementVNode("h4", Ld, [
            e.createTextVNode(
              e.toDisplayString(B.$t("当前分歧：{t}", { t: e.unref(at)[r.value.target] })) + " ",
              1
              /* TEXT */
            ),
            e.createElementVNode(
              "span",
              zd,
              e.toDisplayString(r.value.kind === "change" ? B.$t("执行中申请变更") : B.$t("接收时提出异议")),
              1
              /* TEXT */
            )
          ]),
          e.createElementVNode("div", Fd, [
            e.createElementVNode("article", Pd, [
              e.createElementVNode("header", null, [
                e.createElementVNode(
                  "i",
                  {
                    class: "av",
                    style: e.normalizeStyle({ background: e.unref(re)(N.value).color }),
                    "aria-hidden": "true"
                  },
                  e.toDisplayString(e.unref(re)(N.value).text),
                  5
                  /* TEXT, STYLE */
                ),
                e.createElementVNode(
                  "b",
                  null,
                  e.toDisplayString(N.value),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "small",
                  null,
                  e.toDisplayString(B.$t("部门负责人")),
                  1
                  /* TEXT */
                )
              ]),
              e.createElementVNode(
                "p",
                null,
                e.toDisplayString(r.value.reason),
                1
                /* TEXT */
              ),
              r.value.suggestion || r.value.suggestedDue ? (e.openBlock(), e.createElementBlock("p", Ud, [
                e.createTextVNode(
                  e.toDisplayString(r.value.suggestion),
                  1
                  /* TEXT */
                ),
                r.value.suggestedDue ? (e.openBlock(), e.createElementBlock(
                  e.Fragment,
                  { key: 0 },
                  [
                    e.createTextVNode(
                      e.toDisplayString(r.value.suggestion ? B.$t("，") : "") + e.toDisplayString(B.$t("建议截止调整为 {d}", { d: e.unref(ut)(r.value.suggestedDue) })),
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
                e.toDisplayString(e.unref(Pe)(r.value.raisedAt)),
                1
                /* TEXT */
              )
            ]),
            e.createElementVNode("article", Od, [
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
                  e.toDisplayString(w.value),
                  1
                  /* TEXT */
                )
              ]),
              r.value.review ? (e.openBlock(), e.createElementBlock(
                "p",
                Rd,
                e.toDisplayString(r.value.review.note || "—"),
                1
                /* TEXT */
              )) : (e.openBlock(), e.createElementBlock(
                "p",
                qd,
                e.toDisplayString(B.$t("还没有复核意见")),
                1
                /* TEXT */
              )),
              r.value.review ? (e.openBlock(), e.createElementBlock(
                "time",
                Kd,
                e.toDisplayString(e.unref(Pe)(r.value.review.at)),
                1
                /* TEXT */
              )) : e.createCommentVNode("v-if", !0)
            ])
          ]),
          e.createCommentVNode(" 任务负责人复核 "),
          l.can.review ? (e.openBlock(), e.createElementBlock("section", Hd, [
            e.createElementVNode(
              "h5",
              null,
              e.toDisplayString(B.$t("你的复核")),
              1
              /* TEXT */
            ),
            e.createElementVNode(
              "p",
              Wd,
              e.toDisplayString(B.$t("采纳后任务回到待接收，由部门负责人重新确认；驳回后由部门负责人决定接受驳回还是提交裁决")),
              1
              /* TEXT */
            ),
            e.createElementVNode("div", Gd, [
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn",
                disabled: c.value,
                "data-test": "mm-ob-reject",
                onClick: S[0] || (S[0] = (b) => j("review_reject"))
              }, e.toDisplayString(B.$t("驳回并说明")), 9, Yd),
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn primary",
                disabled: c.value,
                "data-test": "mm-ob-adopt",
                onClick: S[1] || (S[1] = (b) => j("review_adopt"))
              }, e.toDisplayString(B.$t("采纳并调整")), 9, Jd)
            ]),
            e.createElementVNode("button", {
              type: "button",
              class: "ss-link more",
              disabled: c.value,
              "data-test": "mm-ob-delete-review",
              onClick: S[2] || (S[2] = (b) => q("review"))
            }, [
              e.createTextVNode(
                e.toDisplayString(B.$t("更多：删除该任务")) + " ",
                1
                /* TEXT */
              ),
              S[14] || (S[14] = e.createElementVNode(
                "i",
                { class: "ri-arrow-right-s-line" },
                null,
                -1
                /* CACHED */
              ))
            ], 8, Qd)
          ])) : e.createCommentVNode("v-if", !0),
          e.createCommentVNode(" 部门负责人回应驳回 "),
          l.can.reply || l.can.escalate ? (e.openBlock(), e.createElementBlock("section", Zd, [
            e.createElementVNode(
              "h5",
              null,
              e.toDisplayString(B.$t("任务负责人驳回了你的异议")),
              1
              /* TEXT */
            ),
            e.createElementVNode(
              "p",
              Xd,
              e.toDisplayString(B.$t("接受驳回则回到发起前的状态按原方案执行；不接受可以提交项目负责人裁决")),
              1
              /* TEXT */
            ),
            e.createElementVNode("div", xd, [
              l.can.reply ? (e.openBlock(), e.createElementBlock("button", {
                key: 0,
                type: "button",
                class: "ss-btn",
                disabled: c.value,
                "data-test": "mm-ob-accept-reject",
                onClick: S[3] || (S[3] = (b) => U("accept"))
              }, e.toDisplayString(B.$t("接受驳回")), 9, em)) : e.createCommentVNode("v-if", !0),
              l.can.escalate ? (e.openBlock(), e.createElementBlock("button", {
                key: 1,
                type: "button",
                class: "ss-btn primary",
                disabled: c.value,
                "data-test": "mm-ob-escalate",
                onClick: S[4] || (S[4] = (b) => U("escalate"))
              }, e.toDisplayString(B.$t("提交裁决")), 9, tm)) : e.createCommentVNode("v-if", !0)
            ])
          ])) : e.createCommentVNode("v-if", !0),
          e.createCommentVNode(" 项目负责人裁决 "),
          l.can.arbitrate ? (e.openBlock(), e.createElementBlock("section", lm, [
            e.createElementVNode(
              "h5",
              null,
              e.toDisplayString(B.$t("你的裁决（最终结果）")),
              1
              /* TEXT */
            ),
            e.createElementVNode(
              "p",
              nm,
              e.toDisplayString(B.$t("裁决后通知任务负责人和部门负责人，记入总结报告")),
              1
              /* TEXT */
            ),
            e.createElementVNode("div", om, [
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn",
                disabled: c.value,
                "data-test": "mm-ob-keep",
                onClick: S[5] || (S[5] = (b) => j("arb_keep"))
              }, e.toDisplayString(B.$t("维持原方案")), 9, am),
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn primary",
                disabled: c.value,
                "data-test": "mm-ob-adjust",
                onClick: S[6] || (S[6] = (b) => j("arb_adjust"))
              }, e.toDisplayString(B.$t("按异议调整")), 9, sm)
            ]),
            e.createElementVNode("button", {
              type: "button",
              class: "ss-link more",
              disabled: c.value,
              "data-test": "mm-ob-delete-arbitrate",
              onClick: S[7] || (S[7] = (b) => q("arbitrate"))
            }, [
              e.createTextVNode(
                e.toDisplayString(B.$t("更多：删除该任务")) + " ",
                1
                /* TEXT */
              ),
              S[15] || (S[15] = e.createElementVNode(
                "i",
                { class: "ri-arrow-right-s-line" },
                null,
                -1
                /* CACHED */
              ))
            ], 8, rm)
          ])) : e.createCommentVNode("v-if", !0),
          a.value ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock("p", im, [
            S[16] || (S[16] = e.createElementVNode(
              "i",
              { class: "ri-time-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(g.value),
              1
              /* TEXT */
            )
          ])),
          e.createCommentVNode(" 复核 / 裁决的说明与调整内容 "),
          k.value ? (e.openBlock(), e.createElementBlock("section", cm, [
            e.createElementVNode(
              "h5",
              null,
              e.toDisplayString(y[k.value]),
              1
              /* TEXT */
            ),
            k.value === "review_adopt" || k.value === "arb_adjust" ? (e.openBlock(), e.createElementBlock(
              e.Fragment,
              { key: 0 },
              [
                e.createElementVNode(
                  "p",
                  dm,
                  e.toDisplayString(B.$t("按异议改好任务内容；没改的项保持原样。")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode("label", mm, [
                  e.createElementVNode(
                    "span",
                    null,
                    e.toDisplayString(B.$t("任务标题")),
                    1
                    /* TEXT */
                  ),
                  e.withDirectives(e.createElementVNode(
                    "input",
                    {
                      "onUpdate:modelValue": S[8] || (S[8] = (b) => m.title = b),
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
                e.createElementVNode("label", um, [
                  e.createElementVNode(
                    "span",
                    null,
                    e.toDisplayString(B.$t("交付标准")),
                    1
                    /* TEXT */
                  ),
                  e.withDirectives(e.createElementVNode(
                    "textarea",
                    {
                      "onUpdate:modelValue": S[9] || (S[9] = (b) => m.standard = b),
                      rows: "2"
                    },
                    null,
                    512
                    /* NEED_PATCH */
                  ), [
                    [e.vModelText, m.standard]
                  ])
                ]),
                e.createElementVNode("label", pm, [
                  e.createElementVNode(
                    "span",
                    null,
                    e.toDisplayString(B.$t("截止日期")),
                    1
                    /* TEXT */
                  ),
                  e.withDirectives(e.createElementVNode(
                    "input",
                    {
                      "onUpdate:modelValue": S[10] || (S[10] = (b) => m.due = b),
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
            e.createElementVNode("label", vm, [
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(k.value === "review_reject" ? B.$t("驳回理由") : B.$t("说明（可选）")),
                1
                /* TEXT */
              ),
              e.withDirectives(e.createElementVNode("textarea", {
                "onUpdate:modelValue": S[11] || (S[11] = (b) => E.value = b),
                rows: "3",
                placeholder: k.value === "review_reject" ? B.$t("写明为什么维持原方案，部门负责人会看到") : "",
                "data-test": "mm-ob-note"
              }, null, 8, km), [
                [e.vModelText, E.value]
              ])
            ]),
            e.createElementVNode("div", ym, [
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn primary sm",
                disabled: c.value || k.value === "review_reject" && !E.value.trim(),
                "data-test": "mm-ob-submit",
                onClick: I
              }, [
                e.createElementVNode(
                  "i",
                  {
                    class: e.normalizeClass(c.value ? "ri-loader-4-line spin" : "ri-check-line")
                  },
                  null,
                  2
                  /* CLASS */
                ),
                e.createTextVNode(
                  e.toDisplayString(B.$t("确认")),
                  1
                  /* TEXT */
                )
              ], 8, gm),
              e.createElementVNode(
                "button",
                {
                  type: "button",
                  class: "ss-link",
                  onClick: S[12] || (S[12] = (b) => k.value = "")
                },
                e.toDisplayString(B.$t("取消")),
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
        fm,
        e.toDisplayString(B.$t("当前没有处理中的异议")),
        1
        /* TEXT */
      )),
      D.value.length ? (e.openBlock(), e.createElementBlock("section", Nm, [
        e.createElementVNode(
          "h4",
          null,
          e.toDisplayString(B.$t("以往的异议")),
          1
          /* TEXT */
        ),
        e.createElementVNode("ul", null, [
          (e.openBlock(!0), e.createElementBlock(
            e.Fragment,
            null,
            e.renderList(D.value, (b) => (e.openBlock(), e.createElementBlock("li", {
              key: b.id
            }, [
              e.createElementVNode(
                "span",
                Vm,
                e.toDisplayString(b.kind === "change" ? B.$t("变更申请") : B.$t("异议")) + " · " + e.toDisplayString(e.unref(at)[b.target]),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(b.reason),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "span",
                {
                  class: e.normalizeClass(["ss-chip", b.outcome === "adopted" || b.outcome === "adjusted" ? "ok" : b.outcome === "cancelled" ? "bad" : ""])
                },
                e.toDisplayString(e.unref(Cl)(b.outcome)),
                3
                /* TEXT, CLASS */
              ),
              e.createElementVNode(
                "time",
                null,
                e.toDisplayString(e.unref(Pe)(b.resolvedAt || b.raisedAt)),
                1
                /* TEXT */
              )
            ]))),
            128
            /* KEYED_FRAGMENT */
          ))
        ])
      ])) : e.createCommentVNode("v-if", !0),
      e.createElementVNode("section", Em, [
        e.createElementVNode(
          "h4",
          null,
          e.toDisplayString(B.$t("变更记录")),
          1
          /* TEXT */
        ),
        P.value.length ? (e.openBlock(), e.createElementBlock("ol", bm, [
          (e.openBlock(!0), e.createElementBlock(
            e.Fragment,
            null,
            e.renderList(P.value, (b, M) => (e.openBlock(), e.createElementBlock("li", { key: M }, [
              S[17] || (S[17] = e.createElementVNode(
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
                    e.toDisplayString(e.unref(ct)(l.names, b.by, b.by)),
                    1
                    /* TEXT */
                  ),
                  e.createTextVNode(
                    " " + e.toDisplayString(e.unref(Dl)(b)),
                    1
                    /* TEXT */
                  ),
                  b.note ? (e.openBlock(), e.createElementBlock(
                    e.Fragment,
                    { key: 0 },
                    [
                      e.createTextVNode(
                        e.toDisplayString(B.$t("：")) + e.toDisplayString(b.note),
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
                  e.toDisplayString(e.unref(Pe)(b.at)),
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
          $m,
          e.toDisplayString(B.$t("没有变更记录")),
          1
          /* TEXT */
        ))
      ])
    ]));
  }
}), _m = /* @__PURE__ */ ae(hm, [["__scopeId", "data-v-16692f6c"]]), Bm = ["aria-label"], Sm = ["aria-label"], Dm = {
  key: 0,
  class: "mm-td__loading"
}, wm = {
  key: 1,
  class: "ss-note danger"
}, Cm = { class: "mm-td__head" }, Tm = { class: "mm-td__meta" }, Im = {
  class: "mm-td__tabs",
  role: "tablist"
}, Mm = ["aria-selected", "data-test", "onClick"], Am = ["aria-label"], jm = { class: "mm-td__body" }, Lm = {
  key: 0,
  class: "mm-td__dl"
}, zm = { class: "pre" }, Fm = { class: "pre" }, Pm = { class: "mm-td__prog" }, Um = { class: "mm-td__log" }, Om = {
  key: 0,
  class: "ss-empty"
}, Rm = {
  key: 1,
  class: "mm-tl"
}, qm = {
  key: 0,
  class: "mm-tl__note"
}, Km = {
  key: 3,
  class: "mm-td__form",
  "data-test": "mm-form-progress"
}, Hm = { class: "mm-td__range" }, Wm = { class: "mm-td__status" }, Gm = { class: "mm-tag brand" }, Ym = { class: "ss-field" }, Jm = ["placeholder"], Qm = { class: "ss-actions" }, Zm = ["disabled"], Xm = {
  key: 4,
  class: "mm-td__form",
  "data-test": "mm-form-complete"
}, xm = { class: "ss-muted" }, eu = { class: "ss-field" }, tu = ["placeholder"], lu = { class: "ss-actions" }, nu = ["disabled"], ou = {
  key: 5,
  class: "mm-td__form",
  "data-test": "mm-form-raise"
}, au = { class: "ss-muted" }, su = ["aria-label"], ru = ["value"], iu = { class: "ss-field" }, cu = ["placeholder"], du = { class: "ss-field" }, mu = ["placeholder"], uu = {
  key: 0,
  class: "ss-field"
}, pu = ["min"], vu = { class: "ss-actions" }, ku = ["disabled"], yu = {
  key: 0,
  class: "mm-td__foot"
}, gu = ["disabled"], fu = ["disabled"], Nu = ["disabled"], Vu = ["disabled"], Eu = ["disabled"], $u = /* @__PURE__ */ e.defineComponent({
  __name: "TaskDetailPanel",
  props: {
    taskId: {},
    refreshSeq: { default: 0 }
  },
  emits: ["close", "changed", "role"],
  setup(l, { emit: v }) {
    const n = l, u = v, y = [
      { key: "detail", title: t.t("详情") },
      { key: "progress", title: t.t("进度记录") },
      { key: "objection", title: t.t("异议与变更") }
    ], s = ce.useNotificationStore(), o = e.ref(null), c = e.ref(!1), i = e.ref(!1), k = e.ref(""), E = e.ref("detail"), m = e.ref(""), r = e.reactive({ percent: 0, note: "" }), N = e.ref(""), w = e.reactive({ target: "time", reason: "", suggestion: "", suggestedDue: "" }), a = e.computed(() => o.value?.task ?? null), g = e.computed(() => o.value?.can ?? {}), D = e.computed(() => !!a.value && Ce(a.value)), P = e.computed(() => !!(g.value.accept || g.value.object || g.value.progress || g.value.complete || g.value.change)), j = e.computed(() => [...a.value?.progressLog ?? []].sort((V, d) => d.at - V.at)), C = e.computed(() => g.value.object ? t.t("提出异议") : t.t("申请变更")), I = (V) => V === "done" ? "ok" : V === "in_progress" ? "brand" : V === "to_accept" ? "warn" : "";
    async function U(V) {
      if (n.taskId) {
        c.value = !0, k.value = "";
        try {
          const d = await J("task.get", { id: n.taskId });
          o.value = d, u("role", Al(d.task, oe.value?.me.person?.id, d.project?.ownerId, d.can)), V && (E.value = Ml(d.task, d.can), m.value = "");
        } catch (d) {
          k.value = x.errorMessage(d), V && (o.value = null);
        } finally {
          c.value = !1;
        }
      }
    }
    e.watch(() => n.taskId, () => {
      U(!0);
    }, { immediate: !0 }), e.watch(() => n.refreshSeq, () => {
      U(!1);
    });
    function q(V) {
      const d = a.value;
      d && (V === "progress" && Object.assign(r, { percent: Ee(d.percent), note: "" }), V === "complete" && (N.value = ""), V === "raise" && Object.assign(w, { target: "time", reason: "", suggestion: "", suggestedDue: "" }), m.value = V);
    }
    async function B(V, d, p) {
      i.value = !0, k.value = "";
      try {
        await J(V, d), s.success(p), m.value = "", await S();
      } catch (z) {
        k.value = x.errorMessage(z);
      } finally {
        i.value = !1;
      }
    }
    async function S() {
      await U(!1), u("changed");
    }
    function b() {
      return B("task.accept", { id: n.taskId }, t.t("已接收任务"));
    }
    function M() {
      const V = Math.max(0, Math.min(100, Math.round(Number(r.percent) || 0)));
      return B("task.progress", { id: n.taskId, percent: V, note: r.note.trim(), status: "in_progress" }, t.t("进度已更新"));
    }
    function T() {
      return B("task.complete", { id: n.taskId, note: N.value.trim() || void 0 }, t.t("已标记完成，已通知任务负责人"));
    }
    function G() {
      const V = {
        id: n.taskId,
        target: w.target,
        reason: w.reason.trim(),
        suggestion: w.suggestion.trim()
      };
      return w.target === "time" && w.suggestedDue && (V.suggestedDue = w.suggestedDue), B("task.objection.raise", V, t.t("已提交，等待任务负责人复核")).then(() => {
        k.value || (E.value = "objection");
      });
    }
    return (V, d) => (e.openBlock(), e.createElementBlock("aside", {
      class: "mm-td",
      "aria-label": V.$t("任务详情"),
      "data-test": "mm-task-detail"
    }, [
      e.createElementVNode("button", {
        type: "button",
        class: "mm-td__close",
        "aria-label": V.$t("关闭"),
        "data-test": "mm-task-detail-close",
        onClick: d[0] || (d[0] = (p) => u("close"))
      }, [...d[18] || (d[18] = [
        e.createElementVNode(
          "i",
          { class: "ri-close-line" },
          null,
          -1
          /* CACHED */
        )
      ])], 8, Sm),
      c.value && !o.value ? (e.openBlock(), e.createElementBlock("p", Dm, [
        d[19] || (d[19] = e.createElementVNode(
          "i",
          { class: "ri-loader-4-line spin" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(V.$t("加载中…")),
          1
          /* TEXT */
        )
      ])) : e.createCommentVNode("v-if", !0),
      k.value ? (e.openBlock(), e.createElementBlock("p", wm, [
        d[20] || (d[20] = e.createElementVNode(
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
          e.createElementVNode("header", Cm, [
            e.createElementVNode(
              "span",
              {
                class: e.normalizeClass(["mm-tag", e.unref(At)(a.value)]),
                "data-test": "mm-task-status"
              },
              e.toDisplayString(e.unref($l)(a.value)),
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
            e.createElementVNode("p", Tm, [
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(a.value.deptName) + " · " + e.toDisplayString(a.value.assigneeName),
                1
                /* TEXT */
              ),
              d[21] || (d[21] = e.createElementVNode(
                "i",
                { "aria-hidden": "true" },
                "|",
                -1
                /* CACHED */
              )),
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(V.$t("任务负责人 {name}", { name: a.value.ownerName })),
                1
                /* TEXT */
              ),
              d[22] || (d[22] = e.createElementVNode(
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
                    e.toDisplayString(V.$t("截止 {d}", { d: e.unref(ut)(a.value.due) })),
                    1
                    /* TEXT */
                  ),
                  D.value ? (e.openBlock(), e.createElementBlock(
                    e.Fragment,
                    { key: 0 },
                    [
                      e.createTextVNode(
                        e.toDisplayString(V.$t("（处理期间照常计时）")),
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
                        " · " + e.toDisplayString(V.$t("逾期 {n} 天", { n: a.value.overdueDays })),
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
          e.createElementVNode("nav", Im, [
            (e.openBlock(), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(y, (p) => e.createElementVNode("button", {
                key: p.key,
                type: "button",
                role: "tab",
                "aria-selected": E.value === p.key,
                class: e.normalizeClass({ on: E.value === p.key }),
                "data-test": `mm-td-tab-${p.key}`,
                onClick: (z) => E.value = p.key
              }, [
                e.createTextVNode(
                  e.toDisplayString(p.title),
                  1
                  /* TEXT */
                ),
                p.key === "objection" && D.value ? (e.openBlock(), e.createElementBlock("i", {
                  key: 0,
                  class: "mm-dot",
                  "aria-label": V.$t("有处理中的异议")
                }, null, 8, Am)) : e.createCommentVNode("v-if", !0)
              ], 10, Mm)),
              64
              /* STABLE_FRAGMENT */
            ))
          ]),
          e.createElementVNode("div", jm, [
            e.createCommentVNode(" 详情 "),
            E.value === "detail" ? (e.openBlock(), e.createElementBlock("dl", Lm, [
              e.createElementVNode(
                "dt",
                null,
                e.toDisplayString(V.$t("来源会议")),
                1
                /* TEXT */
              ),
              e.createElementVNode("dd", null, [
                e.createElementVNode(
                  "button",
                  {
                    type: "button",
                    class: "ss-link",
                    onClick: d[1] || (d[1] = (p) => e.unref(me)({ kind: "meeting", id: a.value.meetingId }))
                  },
                  e.toDisplayString(a.value.meetingTitle || "—"),
                  1
                  /* TEXT */
                )
              ]),
              e.createElementVNode(
                "dt",
                null,
                e.toDisplayString(V.$t("所属项目")),
                1
                /* TEXT */
              ),
              e.createElementVNode("dd", null, [
                e.createElementVNode(
                  "button",
                  {
                    type: "button",
                    class: "ss-link",
                    onClick: d[2] || (d[2] = (p) => e.unref(me)({ kind: "project", id: a.value.projectId }))
                  },
                  e.toDisplayString(a.value.projectName || "—"),
                  1
                  /* TEXT */
                )
              ]),
              e.createElementVNode(
                "dt",
                null,
                e.toDisplayString(V.$t("责任部门")),
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
                e.toDisplayString(V.$t("任务负责人")),
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
                e.toDisplayString(V.$t("执行事项")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "dd",
                zm,
                e.toDisplayString(a.value.title),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "dt",
                null,
                e.toDisplayString(V.$t("交付标准")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "dd",
                Fm,
                e.toDisplayString(a.value.standard || "—"),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "dt",
                null,
                e.toDisplayString(V.$t("完成时间")),
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
                        e.toDisplayString(V.$t("（逾期 {n} 天）", { n: a.value.overdueDays })),
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
                e.toDisplayString(V.$t("当前进度")),
                1
                /* TEXT */
              ),
              e.createElementVNode("dd", Pm, [
                e.createElementVNode(
                  "i",
                  {
                    class: e.normalizeClass(["mm-bar", { bad: a.value.overdue }])
                  },
                  [
                    e.createElementVNode(
                      "b",
                      {
                        style: e.normalizeStyle({ width: `${e.unref(Ee)(a.value.percent)}%` })
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
                  e.toDisplayString(e.unref(Ee)(a.value.percent)) + "%",
                  1
                  /* TEXT */
                )
              ]),
              e.createElementVNode(
                "dt",
                null,
                e.toDisplayString(V.$t("下发时间")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "dd",
                null,
                e.toDisplayString(e.unref($e)(a.value.createdAt)),
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
                    e.toDisplayString(V.$t("接收时间")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "dd",
                    null,
                    e.toDisplayString(e.unref($e)(a.value.acceptedAt)),
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
                    e.toDisplayString(V.$t("完成于")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "dd",
                    null,
                    e.toDisplayString(e.unref($e)(a.value.doneAt)),
                    1
                    /* TEXT */
                  )
                ],
                64
                /* STABLE_FRAGMENT */
              )) : e.createCommentVNode("v-if", !0)
            ])) : E.value === "progress" ? (e.openBlock(), e.createElementBlock(
              e.Fragment,
              { key: 1 },
              [
                e.createCommentVNode(" 进度记录 "),
                e.createElementVNode("div", Um, [
                  j.value.length ? (e.openBlock(), e.createElementBlock("ol", Rm, [
                    (e.openBlock(!0), e.createElementBlock(
                      e.Fragment,
                      null,
                      e.renderList(j.value, (p, z) => (e.openBlock(), e.createElementBlock("li", { key: z }, [
                        d[23] || (d[23] = e.createElementVNode(
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
                              e.toDisplayString(e.unref(ct)(o.value.names, p.by, p.by)),
                              1
                              /* TEXT */
                            ),
                            e.createTextVNode(
                              " " + e.toDisplayString(V.$t("更新进度到 {n}%", { n: e.unref(Ee)(p.percent) })) + " · ",
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "span",
                              {
                                class: e.normalizeClass(["mm-tag sm", I(p.status)])
                              },
                              e.toDisplayString(e.unref(Ue)[p.status]),
                              3
                              /* TEXT, CLASS */
                            )
                          ]),
                          p.note ? (e.openBlock(), e.createElementBlock(
                            "p",
                            qm,
                            e.toDisplayString(p.note),
                            1
                            /* TEXT */
                          )) : e.createCommentVNode("v-if", !0),
                          e.createElementVNode(
                            "time",
                            null,
                            e.toDisplayString(e.unref(Pe)(p.at)),
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
                    Om,
                    e.toDisplayString(V.$t("还没有进度记录")),
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
                e.createVNode(_m, {
                  task: a.value,
                  can: o.value.can,
                  names: o.value.names,
                  onChanged: S
                }, null, 8, ["task", "can", "names"])
              ],
              2112
              /* STABLE_FRAGMENT, DEV_ROOT_FRAGMENT */
            )),
            e.createCommentVNode(" 动作表单 "),
            m.value === "progress" ? (e.openBlock(), e.createElementBlock("section", Km, [
              e.createElementVNode(
                "h4",
                null,
                e.toDisplayString(V.$t("更新进度")),
                1
                /* TEXT */
              ),
              e.createElementVNode("label", Hm, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(V.$t("完成百分比")),
                  1
                  /* TEXT */
                ),
                e.withDirectives(e.createElementVNode(
                  "input",
                  {
                    "onUpdate:modelValue": d[3] || (d[3] = (p) => r.percent = p),
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
                    r.percent,
                    void 0,
                    { number: !0 }
                  ]
                ]),
                e.withDirectives(e.createElementVNode(
                  "input",
                  {
                    "onUpdate:modelValue": d[4] || (d[4] = (p) => r.percent = p),
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
                    r.percent,
                    void 0,
                    { number: !0 }
                  ]
                ]),
                d[24] || (d[24] = e.createElementVNode(
                  "em",
                  null,
                  "%",
                  -1
                  /* CACHED */
                ))
              ]),
              e.createElementVNode("p", Wm, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(V.$t("状态")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "span",
                  Gm,
                  e.toDisplayString(e.unref(Ue).in_progress),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "small",
                  null,
                  e.toDisplayString(a.value.status === "not_started" ? V.$t("第一次更新进度后，任务从「未开始」变为「进行中」；做完了用「标记完成」") : V.$t("做完了用「标记完成」")),
                  1
                  /* TEXT */
                )
              ]),
              e.createElementVNode("label", Ym, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(V.$t("说明")),
                  1
                  /* TEXT */
                ),
                e.withDirectives(e.createElementVNode("textarea", {
                  "onUpdate:modelValue": d[5] || (d[5] = (p) => r.note = p),
                  rows: "3",
                  placeholder: V.$t("这周做了什么、遇到什么问题"),
                  "data-test": "mm-progress-note"
                }, null, 8, Jm), [
                  [e.vModelText, r.note]
                ])
              ]),
              e.createElementVNode("div", Qm, [
                e.createElementVNode("button", {
                  type: "button",
                  class: "ss-btn primary sm",
                  disabled: i.value,
                  "data-test": "mm-progress-submit",
                  onClick: M
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
                    e.toDisplayString(V.$t("提交进度")),
                    1
                    /* TEXT */
                  )
                ], 8, Zm),
                e.createElementVNode(
                  "button",
                  {
                    type: "button",
                    class: "ss-link",
                    onClick: d[6] || (d[6] = (p) => m.value = "")
                  },
                  e.toDisplayString(V.$t("取消")),
                  1
                  /* TEXT */
                )
              ])
            ])) : e.createCommentVNode("v-if", !0),
            m.value === "complete" ? (e.openBlock(), e.createElementBlock("section", Xm, [
              e.createElementVNode(
                "h4",
                null,
                e.toDisplayString(V.$t("标记完成")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "p",
                xm,
                e.toDisplayString(V.$t("标记后通知任务负责人 {name}；完成后不能再改进度。", { name: a.value.ownerName })),
                1
                /* TEXT */
              ),
              e.createElementVNode("label", eu, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(V.$t("完成说明（可选）")),
                  1
                  /* TEXT */
                ),
                e.withDirectives(e.createElementVNode("textarea", {
                  "onUpdate:modelValue": d[7] || (d[7] = (p) => N.value = p),
                  rows: "3",
                  placeholder: V.$t("交付物放在哪里、和交付标准的对照")
                }, null, 8, tu), [
                  [e.vModelText, N.value]
                ])
              ]),
              e.createElementVNode("div", lu, [
                e.createElementVNode("button", {
                  type: "button",
                  class: "ss-btn primary sm",
                  disabled: i.value,
                  "data-test": "mm-complete-submit",
                  onClick: T
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
                    e.toDisplayString(V.$t("确认完成")),
                    1
                    /* TEXT */
                  )
                ], 8, nu),
                e.createElementVNode(
                  "button",
                  {
                    type: "button",
                    class: "ss-link",
                    onClick: d[8] || (d[8] = (p) => m.value = "")
                  },
                  e.toDisplayString(V.$t("取消")),
                  1
                  /* TEXT */
                )
              ])
            ])) : e.createCommentVNode("v-if", !0),
            m.value === "raise" ? (e.openBlock(), e.createElementBlock("section", ou, [
              e.createElementVNode(
                "h4",
                null,
                e.toDisplayString(C.value),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "p",
                au,
                e.toDisplayString(V.$t("提交后由任务负责人 {name} 复核；处理期间任务照常计时，原截止日有效。", { name: a.value.ownerName })),
                1
                /* TEXT */
              ),
              e.createElementVNode("div", {
                class: "mm-td__radios",
                role: "radiogroup",
                "aria-label": V.$t("分歧点")
              }, [
                (e.openBlock(!0), e.createElementBlock(
                  e.Fragment,
                  null,
                  e.renderList(e.unref(at), (p, z) => (e.openBlock(), e.createElementBlock(
                    "label",
                    {
                      key: z,
                      class: e.normalizeClass({ on: w.target === z })
                    },
                    [
                      e.withDirectives(e.createElementVNode("input", {
                        "onUpdate:modelValue": d[9] || (d[9] = (X) => w.target = X),
                        type: "radio",
                        value: z
                      }, null, 8, ru), [
                        [e.vModelRadio, w.target]
                      ]),
                      e.createTextVNode(
                        e.toDisplayString(p),
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
              ], 8, su),
              e.createElementVNode("label", iu, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(V.$t("原因")),
                  1
                  /* TEXT */
                ),
                e.withDirectives(e.createElementVNode("textarea", {
                  "onUpdate:modelValue": d[10] || (d[10] = (p) => w.reason = p),
                  rows: "3",
                  placeholder: V.$t("为什么按原方案做不了"),
                  "data-test": "mm-raise-reason"
                }, null, 8, cu), [
                  [e.vModelText, w.reason]
                ])
              ]),
              e.createElementVNode("label", du, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(V.$t("建议")),
                  1
                  /* TEXT */
                ),
                e.withDirectives(e.createElementVNode("textarea", {
                  "onUpdate:modelValue": d[11] || (d[11] = (p) => w.suggestion = p),
                  rows: "2",
                  placeholder: V.$t("你建议怎么调整"),
                  "data-test": "mm-raise-suggestion"
                }, null, 8, mu), [
                  [e.vModelText, w.suggestion]
                ])
              ]),
              w.target === "time" ? (e.openBlock(), e.createElementBlock("label", uu, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(V.$t("建议的新截止日")),
                  1
                  /* TEXT */
                ),
                e.withDirectives(e.createElementVNode("input", {
                  "onUpdate:modelValue": d[12] || (d[12] = (p) => w.suggestedDue = p),
                  type: "date",
                  min: e.unref(Bl)(),
                  "data-test": "mm-raise-due"
                }, null, 8, pu), [
                  [e.vModelText, w.suggestedDue]
                ])
              ])) : e.createCommentVNode("v-if", !0),
              e.createElementVNode("div", vu, [
                e.createElementVNode("button", {
                  type: "button",
                  class: "ss-btn primary sm",
                  disabled: i.value || !w.reason.trim() || !w.suggestion.trim(),
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
                    e.toDisplayString(V.$t("提交")),
                    1
                    /* TEXT */
                  )
                ], 8, ku),
                e.createElementVNode(
                  "button",
                  {
                    type: "button",
                    class: "ss-link",
                    onClick: d[13] || (d[13] = (p) => m.value = "")
                  },
                  e.toDisplayString(V.$t("取消")),
                  1
                  /* TEXT */
                )
              ])
            ])) : e.createCommentVNode("v-if", !0)
          ]),
          P.value && !m.value ? (e.openBlock(), e.createElementBlock("footer", yu, [
            g.value.accept ? (e.openBlock(), e.createElementBlock("button", {
              key: 0,
              type: "button",
              class: "ss-btn primary",
              disabled: i.value,
              "data-test": "mm-task-accept",
              onClick: b
            }, [
              d[25] || (d[25] = e.createElementVNode(
                "i",
                { class: "ri-checkbox-circle-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(V.$t("接收任务")),
                1
                /* TEXT */
              )
            ], 8, gu)) : e.createCommentVNode("v-if", !0),
            g.value.object ? (e.openBlock(), e.createElementBlock("button", {
              key: 1,
              type: "button",
              class: "ss-btn",
              disabled: i.value,
              "data-test": "mm-task-object",
              onClick: d[14] || (d[14] = (p) => q("raise"))
            }, [
              d[26] || (d[26] = e.createElementVNode(
                "i",
                { class: "ri-question-answer-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(V.$t("提出异议")),
                1
                /* TEXT */
              )
            ], 8, fu)) : e.createCommentVNode("v-if", !0),
            g.value.progress ? (e.openBlock(), e.createElementBlock("button", {
              key: 2,
              type: "button",
              class: "ss-btn primary",
              disabled: i.value,
              "data-test": "mm-task-progress",
              onClick: d[15] || (d[15] = (p) => q("progress"))
            }, [
              d[27] || (d[27] = e.createElementVNode(
                "i",
                { class: "ri-line-chart-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(V.$t("更新进度")),
                1
                /* TEXT */
              )
            ], 8, Nu)) : e.createCommentVNode("v-if", !0),
            g.value.complete ? (e.openBlock(), e.createElementBlock("button", {
              key: 3,
              type: "button",
              class: "ss-btn",
              disabled: i.value,
              "data-test": "mm-task-complete",
              onClick: d[16] || (d[16] = (p) => q("complete"))
            }, [
              d[28] || (d[28] = e.createElementVNode(
                "i",
                { class: "ri-check-double-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(V.$t("标记完成")),
                1
                /* TEXT */
              )
            ], 8, Vu)) : e.createCommentVNode("v-if", !0),
            g.value.change ? (e.openBlock(), e.createElementBlock("button", {
              key: 4,
              type: "button",
              class: "ss-btn ghost",
              disabled: i.value,
              "data-test": "mm-task-change",
              onClick: d[17] || (d[17] = (p) => q("raise"))
            }, [
              d[29] || (d[29] = e.createElementVNode(
                "i",
                { class: "ri-edit-2-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(V.$t("申请变更")),
                1
                /* TEXT */
              )
            ], 8, Eu)) : e.createCommentVNode("v-if", !0)
          ])) : e.createCommentVNode("v-if", !0)
        ],
        64
        /* STABLE_FRAGMENT */
      )) : e.createCommentVNode("v-if", !0)
    ], 8, Bm));
  }
}), bu = /* @__PURE__ */ ae($u, [["__scopeId", "data-v-357019bd"]]), hu = {
  class: "mm-tasks",
  "data-test": "mm-tasks-tab"
}, _u = { class: "mm-pagehead" }, Bu = { class: "mm-search" }, Su = ["placeholder", "aria-label"], Du = {
  key: 0,
  class: "mm-banner",
  "data-test": "mm-plan-banner"
}, wu = { class: "mm-banner__n" }, Cu = { class: "mm-banner__text" }, Tu = {
  key: 1,
  class: "ss-note danger"
}, Iu = { class: "mm-tasks__main" }, Mu = { class: "mm-tasks__bar" }, Au = ["aria-label"], ju = ["aria-selected", "title", "data-test", "onClick"], Lu = { class: "mm-select" }, zu = { value: "status" }, Fu = { value: "project" }, Pu = { value: "dept" }, Uu = { class: "mm-select" }, Ou = { value: "" }, Ru = ["value"], qu = ["disabled", "aria-label", "title"], Ku = /* @__PURE__ */ e.defineComponent({
  __name: "TasksTab",
  emits: ["role"],
  setup(l, { expose: v, emit: n }) {
    const u = [
      { key: "received", title: t.t("我接收的"), hint: t.t("下发给我的部门、由我接收和执行的任务") },
      { key: "assigned", title: t.t("我分派的"), hint: t.t("我作为任务负责人确认下发的任务") },
      { key: "all", title: t.t("全部任务"), hint: t.t("我参与的项目里的全部任务") }
    ], y = {
      received: t.t("没有下发给你的任务"),
      all: t.t("你参与的项目里还没有任务"),
      assigned: t.t("你还没有下发过任务")
    }, s = e.ref("all"), o = e.ref("status"), c = e.ref(""), i = e.ref(""), k = e.ref([]), E = e.ref([]), m = e.ref([]), r = e.ref(""), N = e.ref(0), w = e.ref(!1), a = e.ref(""), g = n, D = e.computed(() => _l(k.value, i.value)), P = e.computed(() => {
      const d = m.value[0];
      if (!d) return "";
      const p = [d.title, d.subtitle].filter(Boolean).join(" · ");
      return m.value.length > 1 ? t.t("{line} 等 {n} 份", { line: p, n: m.value.length }) : p;
    });
    let j = 0;
    async function C() {
      const d = ++j;
      w.value = !0;
      try {
        const p = await J("task.list", { view: s.value, projectId: c.value || void 0 });
        if (d !== j) return;
        k.value = Array.isArray(p) ? p : [], a.value = "";
      } catch (p) {
        d === j && (a.value = x.errorMessage(p));
      } finally {
        d === j && (w.value = !1);
      }
    }
    async function I() {
      const [d, p] = await Promise.allSettled([
        J("project.list", {}),
        J("home.get")
      ]);
      d.status === "fulfilled" && Array.isArray(d.value) && (E.value = d.value.map((z) => ({ id: z.id, name: z.name }))), p.status === "fulfilled" && (m.value = (p.value?.todos ?? []).filter((z) => z.type === "confirm_plan"));
    }
    async function U() {
      N.value += 1, await Promise.all([C(), I()]);
    }
    e.watch([s, c], () => {
      C();
    });
    function q(d) {
      We.value = d, g("role", d);
    }
    e.watch(r, (d) => {
      d || q("");
    });
    function B() {
      const d = Ne.value;
      if (d.tab !== "tasks" || d.link?.kind !== "task") return;
      const p = d.link.id;
      r.value = p, i.value = "", !k.value.some((z) => z.id === p) && (s.value !== "all" || c.value) && (s.value = "all", c.value = "");
    }
    e.watch(() => Ne.value.seq, B);
    let S = null, b = null, M = 0;
    function T() {
      S && clearTimeout(S), S = setTimeout(() => {
        S = null, M = Date.now(), U();
      }, 250);
    }
    function G() {
      S || Date.now() - M < 800 || T();
    }
    v({ refresh: G });
    let V = !1;
    return e.onMounted(async () => {
      B(), M = Date.now(), await U(), !V && (B(), b = _e((d) => {
        d.type !== "changed" || !["all", "task", "meeting", "project", "org"].includes(d.scope) || T();
      }));
    }), e.onBeforeUnmount(() => {
      V = !0, b?.(), b = null, S && clearTimeout(S), We.value = "";
    }), (d, p) => (e.openBlock(), e.createElementBlock("div", hu, [
      e.createElementVNode("header", _u, [
        e.createElementVNode(
          "h2",
          null,
          e.toDisplayString(d.$t("任务")),
          1
          /* TEXT */
        ),
        e.createElementVNode(
          "p",
          null,
          e.toDisplayString(d.$t("会议决议拆出的任务，在这里接收、跟进、处理异议")),
          1
          /* TEXT */
        ),
        p[7] || (p[7] = e.createElementVNode(
          "span",
          { class: "grow" },
          null,
          -1
          /* CACHED */
        )),
        e.createElementVNode("label", Bu, [
          p[6] || (p[6] = e.createElementVNode(
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
            "onUpdate:modelValue": p[0] || (p[0] = (z) => i.value = z),
            type: "search",
            placeholder: d.$t("搜索任务"),
            "aria-label": d.$t("搜索任务"),
            "data-test": "mm-tasks-search"
          }, null, 8, Su), [
            [e.vModelText, i.value]
          ])
        ])
      ]),
      m.value.length ? (e.openBlock(), e.createElementBlock("section", Du, [
        e.createElementVNode(
          "span",
          wu,
          e.toDisplayString(m.value.length),
          1
          /* TEXT */
        ),
        e.createElementVNode("div", Cu, [
          e.createElementVNode(
            "strong",
            null,
            e.toDisplayString(d.$t("{n} 份执行方案待你确认", { n: m.value.length })),
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
            onClick: p[1] || (p[1] = (z) => e.unref(me)(m.value[0].link))
          },
          e.toDisplayString(d.$t("去确认方案")),
          1
          /* TEXT */
        )
      ])) : e.createCommentVNode("v-if", !0),
      a.value ? (e.openBlock(), e.createElementBlock("p", Tu, [
        p[8] || (p[8] = e.createElementVNode(
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
          class: e.normalizeClass(["mm-tasks__card", { split: !!r.value }])
        },
        [
          e.createElementVNode("div", Iu, [
            e.createElementVNode("div", Mu, [
              e.createElementVNode("div", {
                class: "mm-seg",
                role: "tablist",
                "aria-label": d.$t("任务视图")
              }, [
                (e.openBlock(), e.createElementBlock(
                  e.Fragment,
                  null,
                  e.renderList(u, (z) => e.createElementVNode("button", {
                    key: z.key,
                    type: "button",
                    role: "tab",
                    "aria-selected": s.value === z.key,
                    class: e.normalizeClass({ on: s.value === z.key }),
                    title: z.hint,
                    "data-test": `mm-tasks-view-${z.key}`,
                    onClick: (X) => s.value = z.key
                  }, e.toDisplayString(z.title), 11, ju)),
                  64
                  /* STABLE_FRAGMENT */
                ))
              ], 8, Au),
              e.createElementVNode("label", Lu, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(d.$t("分组：")),
                  1
                  /* TEXT */
                ),
                e.withDirectives(e.createElementVNode(
                  "select",
                  {
                    "onUpdate:modelValue": p[2] || (p[2] = (z) => o.value = z),
                    "data-test": "mm-tasks-groupby"
                  },
                  [
                    e.createElementVNode(
                      "option",
                      zu,
                      e.toDisplayString(d.$t("状态")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "option",
                      Fu,
                      e.toDisplayString(d.$t("项目")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "option",
                      Pu,
                      e.toDisplayString(d.$t("部门")),
                      1
                      /* TEXT */
                    )
                  ],
                  512
                  /* NEED_PATCH */
                ), [
                  [e.vModelSelect, o.value]
                ]),
                p[9] || (p[9] = e.createElementVNode(
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
              e.createElementVNode("label", Uu, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(d.$t("项目：")),
                  1
                  /* TEXT */
                ),
                e.withDirectives(e.createElementVNode(
                  "select",
                  {
                    "onUpdate:modelValue": p[3] || (p[3] = (z) => c.value = z),
                    "data-test": "mm-tasks-project"
                  },
                  [
                    e.createElementVNode(
                      "option",
                      Ou,
                      e.toDisplayString(d.$t("全部")),
                      1
                      /* TEXT */
                    ),
                    (e.openBlock(!0), e.createElementBlock(
                      e.Fragment,
                      null,
                      e.renderList(E.value, (z) => (e.openBlock(), e.createElementBlock("option", {
                        key: z.id,
                        value: z.id
                      }, e.toDisplayString(z.name), 9, Ru))),
                      128
                      /* KEYED_FRAGMENT */
                    ))
                  ],
                  512
                  /* NEED_PATCH */
                ), [
                  [e.vModelSelect, c.value]
                ]),
                p[10] || (p[10] = e.createElementVNode(
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
              p[11] || (p[11] = e.createElementVNode(
                "span",
                { class: "grow" },
                null,
                -1
                /* CACHED */
              )),
              e.createElementVNode("button", {
                type: "button",
                class: "mm-icon-btn",
                disabled: w.value,
                "aria-label": d.$t("刷新"),
                title: d.$t("刷新"),
                onClick: U
              }, [
                e.createElementVNode(
                  "i",
                  {
                    class: e.normalizeClass(w.value ? "ri-loader-4-line spin" : "ri-refresh-line")
                  },
                  null,
                  2
                  /* CLASS */
                )
              ], 8, qu)
            ]),
            e.createVNode(Pt, {
              tasks: D.value,
              "group-by": o.value,
              "selected-id": r.value,
              "empty-text": w.value ? d.$t("加载中…") : i.value ? d.$t("没有匹配「{q}」的任务", { q: i.value }) : y[s.value],
              onSelect: p[4] || (p[4] = (z) => r.value = z.id)
            }, null, 8, ["tasks", "group-by", "selected-id", "empty-text"])
          ]),
          r.value ? (e.openBlock(), e.createBlock(bu, {
            key: r.value,
            "task-id": r.value,
            "refresh-seq": N.value,
            onClose: p[5] || (p[5] = (z) => r.value = ""),
            onChanged: U,
            onRole: q
          }, null, 8, ["task-id", "refresh-seq"])) : e.createCommentVNode("v-if", !0)
        ],
        2
        /* CLASS */
      )
    ]));
  }
}), Hu = /* @__PURE__ */ ae(Ku, [["__scopeId", "data-v-6a0cb0ba"]]), Wu = {
  class: "mm-rv",
  "data-test": "mm-report-view"
}, Gu = { class: "mm-rv__head" }, Yu = { class: "mm-rv__meta" }, Ju = { key: 0 }, Qu = { key: 1 }, Zu = {
  key: 2,
  class: "ok"
}, Xu = ["aria-label"], xu = { key: 0 }, ep = { class: "mm-rv__hint" }, tp = ["innerHTML"], lp = /* @__PURE__ */ e.defineComponent({
  __name: "ReportView",
  props: {
    report: {},
    approverName: {}
  },
  setup(l) {
    const v = l, n = e.computed(() => v.report.stats ?? { total: 0, done: 0, cancelled: 0, overdue: 0, onTime: 0, late: 0, completionRate: 0 }), u = e.computed(() => et.renderMarkdown(v.report.markdown || ""));
    return (y, s) => (e.openBlock(), e.createElementBlock("article", Wu, [
      e.createElementVNode("header", Gu, [
        e.createElementVNode("div", Yu, [
          e.createElementVNode(
            "strong",
            null,
            e.toDisplayString(l.report.kind === "summary" ? y.$t("项目总结报告") : y.$t("进度汇总报告")),
            1
            /* TEXT */
          ),
          l.report.periodFrom && l.report.periodTo ? (e.openBlock(), e.createElementBlock(
            "span",
            Ju,
            e.toDisplayString(y.$t("统计区间 {a} ~ {b}", { a: e.unref(st)(l.report.periodFrom), b: e.unref(st)(l.report.periodTo) })),
            1
            /* TEXT */
          )) : e.createCommentVNode("v-if", !0),
          e.createElementVNode(
            "span",
            null,
            e.toDisplayString(y.$t("生成于 {t}", { t: e.unref($e)(l.report.generatedAt) })),
            1
            /* TEXT */
          ),
          l.report.editedAt ? (e.openBlock(), e.createElementBlock(
            "span",
            Qu,
            e.toDisplayString(y.$t("修改于 {t}", { t: e.unref($e)(l.report.editedAt) })),
            1
            /* TEXT */
          )) : e.createCommentVNode("v-if", !0),
          l.report.approvedAt ? (e.openBlock(), e.createElementBlock(
            "span",
            Zu,
            e.toDisplayString(y.$t("{who} 于 {t} 审核通过", { who: l.approverName || "—", t: e.unref($e)(l.report.approvedAt) })),
            1
            /* TEXT */
          )) : e.createCommentVNode("v-if", !0)
        ]),
        e.createElementVNode("ul", {
          class: "mm-rv__stats",
          "aria-label": y.$t("统计（由系统计算）")
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
              e.toDisplayString(y.$t("已完成")),
              1
              /* TEXT */
            )
          ]),
          e.createElementVNode("li", null, [
            e.createElementVNode(
              "b",
              null,
              e.toDisplayString(e.unref(Ee)(n.value.completionRate)) + "%",
              1
              /* TEXT */
            ),
            e.createElementVNode(
              "small",
              null,
              e.toDisplayString(y.$t("完成率")),
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
              e.toDisplayString(y.$t("按期")),
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
                e.toDisplayString(y.$t("延期")),
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
                e.toDisplayString(y.$t("逾期")),
                1
                /* TEXT */
              )
            ],
            2
            /* CLASS */
          ),
          n.value.cancelled ? (e.openBlock(), e.createElementBlock("li", xu, [
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
              e.toDisplayString(y.$t("已取消")),
              1
              /* TEXT */
            )
          ])) : e.createCommentVNode("v-if", !0)
        ], 8, Xu),
        e.createElementVNode("p", ep, [
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
            e.toDisplayString(y.$t("报告里的数字由系统按任务数据计算，模型只写叙述")),
            1
            /* TEXT */
          )
        ])
      ]),
      e.createCommentVNode(" eslint-disable-next-line vue/no-v-html -- renderMarkdown 出口已净化 "),
      e.createElementVNode("div", {
        class: "mm-rv__md",
        innerHTML: u.value
      }, null, 8, tp)
    ]));
  }
}), Ut = /* @__PURE__ */ ae(lp, [["__scopeId", "data-v-776da457"]]), np = {
  class: "mm-prp",
  "data-test": "mm-project-reports"
}, op = { class: "mm-prp__bar" }, ap = { class: "ss-muted" }, sp = ["disabled"], rp = {
  key: 0,
  class: "ss-note warn"
}, ip = {
  key: 1,
  class: "ss-note danger"
}, cp = {
  key: 2,
  class: "ss-empty"
}, dp = {
  key: 3,
  class: "mm-prp__split"
}, mp = ["aria-label"], up = ["aria-selected", "data-test", "onClick"], pp = /* @__PURE__ */ e.defineComponent({
  __name: "ProjectReports",
  props: {
    project: {},
    focusReportId: { default: "" },
    canGenerate: { type: Boolean, default: !1 }
  },
  emits: ["changed"],
  setup(l, { emit: v }) {
    const n = l, u = v, y = ce.useNotificationStore(), s = e.ref(!1), o = e.ref(""), c = e.ref(0), i = e.ref(""), k = e.ref(null);
    let E = null;
    const m = e.computed(() => {
      const a = [...n.project.weeklyReports ?? []];
      return k.value && !a.some((g) => g.id === k.value.id) && a.push(k.value), a.sort((g, D) => D.generatedAt - g.generatedAt);
    }), r = e.computed(() => m.value.find((a) => a.id === i.value) ?? m.value[0] ?? null), N = e.computed(() => oe.value?.settings.reportCycleDays ?? 7);
    e.watch(() => [n.project.id, n.focusReportId], () => {
      i.value = n.focusReportId && m.value.some((a) => a.id === n.focusReportId) ? n.focusReportId : "";
    }, { immediate: !0 }), e.watch(() => n.project.id, () => {
      k.value = null, o.value = "";
    });
    async function w() {
      s.value = !0, o.value = "", c.value = 0;
      const a = Date.now();
      E = setInterval(() => {
        c.value = Math.floor((Date.now() - a) / 1e3);
      }, 1e3);
      try {
        const g = await J("project.report.generate", { id: n.project.id });
        g?.id && (k.value = g, i.value = g.id), y.success(t.t("进度报告已生成")), u("changed");
      } catch (g) {
        o.value = x.errorMessage(g);
      } finally {
        s.value = !1, E && clearInterval(E), E = null;
      }
    }
    return e.onBeforeUnmount(() => {
      E && clearInterval(E);
    }), (a, g) => (e.openBlock(), e.createElementBlock("div", np, [
      e.createElementVNode("div", op, [
        e.createElementVNode(
          "p",
          ap,
          e.toDisplayString(l.canGenerate ? a.$t("每 {n} 天自动生成一份进度汇总报告，发给任务负责人和项目负责人；项目负责人也可以现在手动生成一份。", { n: N.value }) : a.$t("每 {n} 天自动生成一份进度汇总报告，发给任务负责人和项目负责人。", { n: N.value })),
          1
          /* TEXT */
        ),
        g[0] || (g[0] = e.createElementVNode(
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
          onClick: w
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
            e.toDisplayString(s.value ? a.$t("生成中… {s} 秒", { s: c.value }) : a.$t("生成一份进度报告")),
            1
            /* TEXT */
          )
        ], 8, sp)) : e.createCommentVNode("v-if", !0)
      ]),
      s.value && c.value > 60 ? (e.openBlock(), e.createElementBlock("p", rp, [
        g[1] || (g[1] = e.createElementVNode(
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
      o.value ? (e.openBlock(), e.createElementBlock("p", ip, [
        g[2] || (g[2] = e.createElementVNode(
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
      m.value.length ? (e.openBlock(), e.createElementBlock("div", dp, [
        e.createElementVNode("ul", {
          class: "mm-prp__list",
          role: "listbox",
          "aria-label": a.$t("进度报告列表")
        }, [
          (e.openBlock(!0), e.createElementBlock(
            e.Fragment,
            null,
            e.renderList(m.value, (D) => (e.openBlock(), e.createElementBlock("li", {
              key: D.id
            }, [
              e.createElementVNode("button", {
                type: "button",
                role: "option",
                "aria-selected": D.id === i.value,
                class: e.normalizeClass({ on: D.id === i.value }),
                "data-test": `mm-report-${D.id}`,
                onClick: (P) => i.value = D.id
              }, [
                e.createElementVNode(
                  "strong",
                  null,
                  e.toDisplayString(D.periodFrom && D.periodTo ? `${e.unref(it)(D.periodFrom)} ~ ${e.unref(it)(D.periodTo)}` : e.unref($e)(D.generatedAt)),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "small",
                  null,
                  e.toDisplayString(a.$t("完成率 {p}% · 逾期 {n}", { p: e.unref(Ee)(D.stats?.completionRate), n: D.stats?.overdue ?? 0 })),
                  1
                  /* TEXT */
                )
              ], 10, up)
            ]))),
            128
            /* KEYED_FRAGMENT */
          ))
        ], 8, mp),
        r.value ? (e.openBlock(), e.createBlock(Ut, {
          key: 0,
          report: r.value
        }, null, 8, ["report"])) : e.createCommentVNode("v-if", !0)
      ])) : (e.openBlock(), e.createElementBlock(
        "p",
        cp,
        e.toDisplayString(a.$t("还没有进度报告")),
        1
        /* TEXT */
      ))
    ]));
  }
}), vp = /* @__PURE__ */ ae(pp, [["__scopeId", "data-v-27c1c06c"]]), kp = {
  class: "mm-psm",
  "data-test": "mm-project-summary"
}, yp = {
  key: 0,
  class: "ss-note danger"
}, gp = {
  key: 1,
  class: "ss-empty"
}, fp = {
  key: 0,
  class: "mm-psm__wait",
  "data-test": "mm-summary-waiting"
}, Np = {
  key: 1,
  class: "mm-psm__wait failed",
  "data-test": "mm-summary-missing"
}, Vp = ["disabled"], Ep = {
  key: 0,
  class: "ss-note info"
}, $p = {
  key: 1,
  class: "mm-psm__bar"
}, bp = { class: "ss-muted" }, hp = ["disabled"], _p = ["disabled"], Bp = ["disabled"], Sp = { class: "ss-muted" }, Dp = ["disabled"], wp = ["disabled"], Cp = {
  key: 2,
  class: "ss-note info"
}, Tp = {
  key: 3,
  class: "ss-note ok"
}, Ip = ["aria-label"], Mp = /* @__PURE__ */ e.defineComponent({
  __name: "ProjectSummary",
  props: {
    project: {},
    can: {},
    members: { default: () => [] },
    generating: { type: Boolean, default: !1 },
    isOwner: { type: Boolean, default: !1 }
  },
  emits: ["changed"],
  setup(l, { emit: v }) {
    const n = l, u = v, y = Be.useDialog(), s = ce.useNotificationStore(), o = e.ref(!1), c = e.ref(""), i = e.ref(""), k = e.ref(!1), E = e.ref(""), m = e.ref(Date.now());
    let r = null;
    const N = e.computed(() => n.project.summary ?? null), w = e.computed(() => n.members?.find((I) => I.id === N.value?.approvedBy)?.name || ""), a = e.computed(() => {
      const I = n.project.closeCheck?.at, U = I ? Math.max(0, Math.floor((m.value - I) / 1e3)) : 0;
      return I ? U > 300 ? t.t("已经 {m} 分钟了，比平时慢；可以点「重新生成」再试一次", { m: Math.floor(U / 60) }) : t.t("已用时 {s} 秒；生成完会自动显示在这里", { s: U }) : t.t("生成完会自动显示在这里");
    });
    e.watch(() => n.project.id, () => {
      k.value = !1, i.value = "";
    }), e.onMounted(() => {
      r = setInterval(() => {
        m.value = Date.now();
      }, 1e3);
    }), e.onBeforeUnmount(() => {
      r && clearInterval(r);
    });
    async function g(I, U, q, B) {
      o.value = !0, c.value = I, i.value = "";
      try {
        return await J(U, q), s.success(B), u("changed"), !0;
      } catch (S) {
        return i.value = x.errorMessage(S), !1;
      } finally {
        o.value = !1, c.value = "";
      }
    }
    function D() {
      E.value = N.value?.markdown ?? "", k.value = !0;
    }
    async function P() {
      await g("save", "project.summary.save", { id: n.project.id, markdown: E.value }, t.t("总结报告已保存")) && (k.value = !1);
    }
    async function j(I) {
      I && !await y.confirm({
        title: t.t("重新生成总结报告"),
        message: N.value?.editedAt ? t.t("重新生成会覆盖你在线修改过的内容，确定吗？") : t.t("按当前项目数据重新生成一份总结报告？"),
        danger: !!N.value?.editedAt
      }) || await g("regen", "project.summary.regenerate", { id: n.project.id }, t.t("总结报告已重新生成"));
    }
    async function C() {
      await y.confirm({
        title: t.t("审核通过并归档"),
        message: t.t("归档后项目全部只读、不能重新激活，并通知全部项目成员。确定审核通过吗？"),
        confirmLabel: t.t("通过并归档")
      }) && await g("approve", "project.summary.approve", { id: n.project.id }, t.t("项目已归档"));
    }
    return (I, U) => (e.openBlock(), e.createElementBlock("div", kp, [
      i.value ? (e.openBlock(), e.createElementBlock("p", yp, [
        U[4] || (U[4] = e.createElementVNode(
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
        gp,
        e.toDisplayString(I.$t("项目还在进行中。项目负责人「发起结项」且检查通过后，AI 会在这里生成项目总结报告（概况、关键决策、任务按期 / 延期完成情况、变更与裁决记录），审核通过后归档。")),
        1
        /* TEXT */
      )) : N.value ? (e.openBlock(), e.createElementBlock(
        e.Fragment,
        { key: 3 },
        [
          l.generating ? (e.openBlock(), e.createElementBlock("p", Ep, [
            U[8] || (U[8] = e.createElementVNode(
              "i",
              { class: "ri-loader-4-line spin" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(I.$t("AI 正在重新生成总结报告，生成完会自动刷新")),
              1
              /* TEXT */
            )
          ])) : e.createCommentVNode("v-if", !0),
          l.project.status === "closing" && l.can.reviewSummary ? (e.openBlock(), e.createElementBlock("div", $p, [
            k.value ? (e.openBlock(), e.createElementBlock(
              e.Fragment,
              { key: 1 },
              [
                e.createElementVNode(
                  "p",
                  Sp,
                  e.toDisplayString(I.$t("直接改 Markdown 正文；统计数字以系统计算为准，不随正文修改。")),
                  1
                  /* TEXT */
                ),
                U[11] || (U[11] = e.createElementVNode(
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
                  onClick: U[2] || (U[2] = (q) => k.value = !1)
                }, e.toDisplayString(I.$t("取消")), 9, Dp),
                e.createElementVNode("button", {
                  type: "button",
                  class: "ss-btn sm primary",
                  disabled: o.value || !E.value.trim(),
                  "data-test": "mm-summary-save",
                  onClick: P
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
                    e.toDisplayString(I.$t("保存修改")),
                    1
                    /* TEXT */
                  )
                ], 8, wp)
              ],
              64
              /* STABLE_FRAGMENT */
            )) : (e.openBlock(), e.createElementBlock(
              e.Fragment,
              { key: 0 },
              [
                e.createElementVNode(
                  "p",
                  bp,
                  e.toDisplayString(I.$t("看一遍总结，需要的话在线修改；审核通过后项目归档，全部只读，并通知项目成员。")),
                  1
                  /* TEXT */
                ),
                U[10] || (U[10] = e.createElementVNode(
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
                  onClick: D
                }, [
                  U[9] || (U[9] = e.createElementVNode(
                    "i",
                    { class: "ri-edit-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(I.$t("在线修改")),
                    1
                    /* TEXT */
                  )
                ], 8, hp),
                e.createElementVNode("button", {
                  type: "button",
                  class: "ss-btn sm",
                  disabled: o.value || l.generating,
                  "data-test": "mm-summary-regen",
                  onClick: U[1] || (U[1] = (q) => j(!0))
                }, [
                  e.createElementVNode(
                    "i",
                    {
                      class: e.normalizeClass(o.value && c.value === "regen" ? "ri-loader-4-line spin" : "ri-refresh-line")
                    },
                    null,
                    2
                    /* CLASS */
                  ),
                  e.createTextVNode(
                    e.toDisplayString(I.$t("重新生成")),
                    1
                    /* TEXT */
                  )
                ], 8, _p),
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
                      class: e.normalizeClass(o.value && c.value === "approve" ? "ri-loader-4-line spin" : "ri-checkbox-circle-line")
                    },
                    null,
                    2
                    /* CLASS */
                  ),
                  e.createTextVNode(
                    e.toDisplayString(I.$t("审核通过并归档")),
                    1
                    /* TEXT */
                  )
                ], 8, Bp)
              ],
              64
              /* STABLE_FRAGMENT */
            ))
          ])) : l.project.status === "closing" ? (e.openBlock(), e.createElementBlock("p", Cp, [
            U[12] || (U[12] = e.createElementVNode(
              "i",
              { class: "ri-time-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(I.$t("总结报告待项目负责人审核，审核通过后项目归档。")),
              1
              /* TEXT */
            )
          ])) : l.project.status === "archived" ? (e.openBlock(), e.createElementBlock("p", Tp, [
            U[13] || (U[13] = e.createElementVNode(
              "i",
              { class: "ri-archive-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(I.$t("项目已归档，全部内容只读。")),
              1
              /* TEXT */
            )
          ])) : e.createCommentVNode("v-if", !0),
          k.value ? e.withDirectives((e.openBlock(), e.createElementBlock("textarea", {
            key: 4,
            "onUpdate:modelValue": U[3] || (U[3] = (q) => E.value = q),
            class: "mm-psm__editor",
            rows: "24",
            "aria-label": I.$t("总结报告正文"),
            "data-test": "mm-summary-editor"
          }, null, 8, Ip)), [
            [e.vModelText, E.value]
          ]) : (e.openBlock(), e.createBlock(Ut, {
            key: 5,
            report: N.value,
            "approver-name": w.value
          }, null, 8, ["report", "approver-name"]))
        ],
        64
        /* STABLE_FRAGMENT */
      )) : (e.openBlock(), e.createElementBlock(
        e.Fragment,
        { key: 2 },
        [
          l.generating || o.value && c.value === "regen" ? (e.openBlock(), e.createElementBlock("div", fp, [
            U[5] || (U[5] = e.createElementVNode(
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
                e.toDisplayString(I.$t("AI 正在生成项目总结报告…")),
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
          ])) : (e.openBlock(), e.createElementBlock("div", Np, [
            U[7] || (U[7] = e.createElementVNode(
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
                e.toDisplayString(I.$t("总结报告还没有生成")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "small",
                null,
                e.toDisplayString(l.isOwner ? I.$t("上次生成可能没成功，点「重新生成」再试一次") : I.$t("等项目负责人重新生成")),
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
              onClick: U[0] || (U[0] = (q) => j(!1))
            }, [
              U[6] || (U[6] = e.createElementVNode(
                "i",
                { class: "ri-refresh-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(I.$t("重新生成")),
                1
                /* TEXT */
              )
            ], 8, Vp)) : e.createCommentVNode("v-if", !0)
          ]))
        ],
        64
        /* STABLE_FRAGMENT */
      ))
    ]));
  }
}), Ap = /* @__PURE__ */ ae(Mp, [["__scopeId", "data-v-a7ff6e93"]]), Ot = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/components/TModal.vue"];
if (!Ot) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/components/TModal.vue");
const Ze = Ot.default, jp = { class: "mm-pp" }, Lp = {
  key: 0,
  class: "mm-pp__chosen"
}, zp = ["aria-label", "onClick"], Fp = { key: 1 }, Pp = { class: "mm-pp__search" }, Up = ["placeholder"], Op = ["aria-multiselectable"], Rp = { class: "mm-pp__dept" }, qp = ["aria-selected", "disabled", "data-test", "onClick"], Kp = { key: 0 }, Hp = {
  key: 1,
  class: "ri-check-line",
  "aria-hidden": "true"
}, Wp = {
  key: 0,
  class: "mm-pp__empty"
}, Gp = /* @__PURE__ */ e.defineComponent({
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
  setup(l, { emit: v }) {
    const n = l, u = v, y = e.ref(""), s = e.computed(() => {
      const r = n.modelValue;
      return Array.isArray(r) ? r : r ? [r] : [];
    }), o = (r) => s.value.includes(r), c = (r) => n.depts.find((N) => N.id === r)?.name || "", i = e.computed(() => n.people.filter((r) => !r.left)), k = e.computed(() => s.value.map((r) => n.people.find((N) => N.id === r)).filter((r) => !!r)), E = e.computed(() => {
      const r = [], N = /* @__PURE__ */ new Map();
      for (const w of i.value) {
        if (!kt(w, c(w.deptId), y.value)) continue;
        const a = N.get(w.deptId) ?? [];
        a.push(w), N.set(w.deptId, a);
      }
      for (const w of n.depts) {
        const a = N.get(w.id);
        a?.length && r.push({ id: w.id, name: w.name, people: a }), N.delete(w.id);
      }
      for (const [w, a] of N) r.push({ id: w, name: c(w) || "—", people: a });
      return r;
    });
    function m(r) {
      if (!n.multiple) {
        u("update:modelValue", r);
        return;
      }
      if (o(r)) {
        if (n.locked?.includes(r)) return;
        u("update:modelValue", s.value.filter((N) => N !== r));
      } else
        u("update:modelValue", [...s.value, r]);
    }
    return (r, N) => (e.openBlock(), e.createElementBlock("div", jp, [
      l.multiple && k.value.length ? (e.openBlock(), e.createElementBlock("div", Lp, [
        (e.openBlock(!0), e.createElementBlock(
          e.Fragment,
          null,
          e.renderList(k.value, (w) => (e.openBlock(), e.createElementBlock("span", {
            key: w.id,
            class: "mm-pp__chip"
          }, [
            e.createElementVNode(
              "i",
              {
                style: e.normalizeStyle({ background: e.unref(re)(w.name).color }),
                "aria-hidden": "true"
              },
              e.toDisplayString(e.unref(re)(w.name).text),
              5
              /* TEXT, STYLE */
            ),
            e.createTextVNode(
              e.toDisplayString(w.name) + " ",
              1
              /* TEXT */
            ),
            l.locked?.includes(w.id) ? (e.openBlock(), e.createElementBlock(
              "em",
              Fp,
              e.toDisplayString(l.lockedHint || ""),
              1
              /* TEXT */
            )) : (e.openBlock(), e.createElementBlock("button", {
              key: 0,
              type: "button",
              "aria-label": r.$t("移除 {name}", { name: w.name }),
              onClick: (a) => m(w.id)
            }, [...N[1] || (N[1] = [
              e.createElementVNode(
                "i",
                { class: "ri-close-line" },
                null,
                -1
                /* CACHED */
              )
            ])], 8, zp))
          ]))),
          128
          /* KEYED_FRAGMENT */
        ))
      ])) : e.createCommentVNode("v-if", !0),
      e.createElementVNode("div", Pp, [
        N[2] || (N[2] = e.createElementVNode(
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
          "onUpdate:modelValue": N[0] || (N[0] = (w) => y.value = w),
          type: "search",
          placeholder: r.$t("搜索姓名、部门")
        }, null, 8, Up), [
          [e.vModelText, y.value]
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
          e.renderList(E.value, (w) => (e.openBlock(), e.createElementBlock("li", {
            key: w.id
          }, [
            e.createElementVNode(
              "p",
              Rp,
              e.toDisplayString(w.name),
              1
              /* TEXT */
            ),
            (e.openBlock(!0), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(w.people, (a) => (e.openBlock(), e.createElementBlock("button", {
                key: a.id,
                type: "button",
                role: "option",
                class: e.normalizeClass(["mm-pp__opt", { on: o(a.id) }]),
                "aria-selected": o(a.id),
                disabled: l.locked?.includes(a.id) && o(a.id),
                "data-test": `mm-pp-${a.id}`,
                onClick: (g) => m(a.id)
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
                  Kp,
                  e.toDisplayString(a.title),
                  1
                  /* TEXT */
                )) : e.createCommentVNode("v-if", !0),
                o(a.id) ? (e.openBlock(), e.createElementBlock("b", Hp)) : e.createCommentVNode("v-if", !0)
              ], 10, qp))),
              128
              /* KEYED_FRAGMENT */
            ))
          ]))),
          128
          /* KEYED_FRAGMENT */
        )),
        E.value.length ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock(
          "li",
          Wp,
          e.toDisplayString(r.$t("没有匹配的人员")),
          1
          /* TEXT */
        ))
      ], 12, Op)
    ]));
  }
}), we = /* @__PURE__ */ ae(Gp, [["__scopeId", "data-v-60f28bb6"]]), Yp = {
  class: "mm-pmd",
  "data-test": "mm-project-members"
}, Jp = { class: "ss-muted" }, Qp = {
  key: 0,
  class: "ss-muted"
}, Zp = {
  key: 1,
  class: "ss-note danger",
  "data-test": "mm-pm-error"
}, Xp = ["disabled"], xp = /* @__PURE__ */ e.defineComponent({
  __name: "ProjectMembersDialog",
  props: {
    open: { type: Boolean },
    projectId: {},
    ownerId: {},
    memberIds: {},
    members: {}
  },
  emits: ["close", "saved"],
  setup(l, { emit: v }) {
    const n = l, u = v, y = e.ref([]), s = e.ref([]), o = e.ref([]), c = e.ref(!1), i = e.ref(""), k = e.computed(() => o.value.length !== n.memberIds.length || o.value.some((r) => !n.memberIds.includes(r))), E = e.computed(() => n.memberIds.filter((r) => !o.value.includes(r)).map((r) => y.value.find((N) => N.id === r)?.name || n.members?.find((N) => N.id === r)?.name || r));
    e.watch(() => n.open, async (r) => {
      if (r) {
        o.value = [...n.memberIds], i.value = "";
        try {
          const N = await J("people.list"), w = (n.members ?? []).filter((a) => !(N?.people ?? []).some((g) => g.id === a.id)).map((a) => ({ ...a, left: !1 }));
          y.value = [...N?.people ?? [], ...w], s.value = N?.depts ?? [];
        } catch (N) {
          i.value = x.errorMessage(N);
        }
      }
    }, { immediate: !0 });
    async function m() {
      c.value = !0, i.value = "";
      try {
        const r = [.../* @__PURE__ */ new Set([n.ownerId, ...o.value])], N = await J("project.members", { id: n.projectId, memberIds: r });
        u("saved", N);
      } catch (r) {
        i.value = x.errorMessage(r);
      } finally {
        c.value = !1;
      }
    }
    return (r, N) => (e.openBlock(), e.createBlock(Ze, {
      open: l.open,
      title: r.$t("编辑成员"),
      icon: "ri-team-line",
      size: "md",
      onClose: N[2] || (N[2] = (w) => u("close"))
    }, {
      footer: e.withCtx(() => [
        e.createElementVNode(
          "button",
          {
            type: "button",
            class: "ss-btn",
            onClick: N[1] || (N[1] = (w) => u("close"))
          },
          e.toDisplayString(r.$t("取消")),
          1
          /* TEXT */
        ),
        e.createElementVNode("button", {
          type: "button",
          class: "ss-btn primary",
          disabled: c.value || !k.value,
          "data-test": "mm-pm-save",
          onClick: m
        }, [
          e.createElementVNode(
            "i",
            {
              class: e.normalizeClass(c.value ? "ri-loader-4-line spin" : "ri-check-line")
            },
            null,
            2
            /* CLASS */
          ),
          e.createTextVNode(
            e.toDisplayString(r.$t("保存")),
            1
            /* TEXT */
          )
        ], 8, Xp)
      ]),
      default: e.withCtx(() => [
        e.createElementVNode("div", Yp, [
          e.createElementVNode(
            "p",
            Jp,
            e.toDisplayString(r.$t("项目负责人不能移除；成员还有未完成的待办或任务时也不能移除。")),
            1
            /* TEXT */
          ),
          e.createVNode(we, {
            modelValue: o.value,
            "onUpdate:modelValue": N[0] || (N[0] = (w) => o.value = w),
            people: y.value,
            depts: s.value,
            locked: [l.ownerId],
            "locked-hint": r.$t("负责人"),
            "max-height": 300
          }, null, 8, ["modelValue", "people", "depts", "locked", "locked-hint"]),
          E.value.length ? (e.openBlock(), e.createElementBlock(
            "p",
            Qp,
            e.toDisplayString(r.$t("将移除：{names}", { names: E.value.join(r.$t("、")) })),
            1
            /* TEXT */
          )) : e.createCommentVNode("v-if", !0),
          i.value ? (e.openBlock(), e.createElementBlock("p", Zp, [
            N[3] || (N[3] = e.createElementVNode(
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
}), ev = /* @__PURE__ */ ae(xp, [["__scopeId", "data-v-a1802897"]]), tv = {
  class: "mm-pd",
  "data-test": "mm-project-detail"
}, lv = {
  key: 0,
  class: "mm-pd__loading"
}, nv = {
  key: 1,
  class: "ss-note danger"
}, ov = { class: "mm-pd__head" }, av = { class: "mm-pd__titlerow" }, sv = ["aria-label"], rv = ["aria-current"], iv = ["aria-label", "aria-expanded"], cv = {
  key: 0,
  class: "mm-more__menu",
  role: "menu"
}, dv = ["disabled"], mv = ["disabled"], uv = { class: "mm-pd__meta" }, pv = {
  key: 0,
  class: "mm-pd__desc"
}, vv = {
  key: 1,
  class: "mm-pd__fail",
  "data-test": "mm-close-fail"
}, kv = ["aria-label"], yv = { class: "ss-muted" }, gv = { class: "mm-block-list" }, fv = { class: "t" }, Nv = ["onClick"], Vv = {
  class: "mm-pd__stats",
  "data-test": "mm-project-stats"
}, Ev = { class: "brand" }, $v = {
  class: "mm-pd__tabs",
  role: "tablist"
}, bv = ["aria-selected", "data-test", "onClick"], hv = { key: 0 }, _v = {
  key: 2,
  class: "mm-pd__ov"
}, Bv = { class: "mm-pd__ovl" }, Sv = {
  key: 0,
  class: "mm-pd__blockers",
  "data-test": "mm-close-blockers"
}, Dv = { class: "mm-block-list" }, wv = ["title"], Cv = { key: 0 }, Tv = ["data-test", "onClick"], Iv = {
  key: 1,
  class: "ss-note ok"
}, Mv = { class: "mm-pd__depts" }, Av = {
  key: 0,
  class: "ss-muted"
}, jv = { key: 1 }, Lv = { class: "n" }, zv = { class: "mm-bar wide" }, Fv = { class: "v" }, Pv = { class: "mm-pd__ovr" }, Uv = { class: "mm-pd__decisions" }, Ov = {
  key: 0,
  class: "ss-muted"
}, Rv = {
  key: 1,
  class: "mm-tl"
}, qv = ["onClick"], Kv = { class: "mm-pd__members" }, Hv = { class: "mm-avs" }, Wv = ["title", "aria-label"], Gv = { class: "mm-pd__list" }, Yv = { class: "mm-pd__listbar" }, Jv = { class: "ss-muted" }, Qv = {
  key: 0,
  class: "ss-empty"
}, Zv = ["data-test", "onClick"], Xv = { class: "t" }, xv = {
  key: 0,
  class: "mm-tag warn"
}, ek = { class: "mm-pd__list" }, tk = /* @__PURE__ */ e.defineComponent({
  __name: "ProjectDetail",
  props: {
    projectId: {},
    refreshSeq: { default: 0 },
    focus: { default: null }
  },
  emits: ["changed", "role"],
  setup(l, { emit: v }) {
    const n = l, u = v, y = Be.useDialog(), s = ce.useNotificationStore(), o = e.ref(null), c = e.ref(!1), i = e.ref(!1), k = e.ref(""), E = e.ref("overview"), m = e.ref(""), r = e.ref(null), N = e.ref(!1), w = e.ref(!1), a = e.ref(!1), g = e.ref(null), D = e.computed(() => o.value?.project ?? null), P = e.computed(() => D.value ? Ll(D.value.status) : 0), j = e.computed(() => bt(o.value?.closeBlockers)), C = e.computed(() => !!D.value && D.value.ownerId === oe.value?.me.person?.id), I = e.computed(() => [
      { key: "overview", title: t.t("概览"), count: void 0 },
      { key: "meetings", title: t.t("会议"), count: o.value?.meetings.length ?? 0 },
      { key: "tasks", title: t.t("任务"), count: o.value?.tasks.length ?? 0 },
      { key: "reports", title: t.t("进度报告"), count: D.value?.weeklyReports?.length ?? 0 },
      { key: "summary", title: t.t("总结报告"), count: void 0 }
    ]);
    function U(V) {
      return V === "failed" ? "bad" : V === "dispatched" || V === "ended" ? "ok" : V === "processing" ? "brand" : "warn";
    }
    let q = 0;
    async function B() {
      if (!n.projectId) return;
      const V = ++q;
      c.value = !0;
      try {
        const d = await J("project.get", { id: n.projectId });
        if (V !== q) return;
        o.value = d, u("role", jl(d.project, oe.value?.me.person?.id)), k.value = "";
      } catch (d) {
        V === q && (k.value = x.errorMessage(d));
      } finally {
        V === q && (c.value = !1);
      }
    }
    e.watch(() => n.projectId, () => {
      o.value = null, r.value = null, N.value = !1, E.value = "overview", B();
    }, { immediate: !0 }), e.watch(() => n.refreshSeq, () => {
      B();
    }), e.watch(() => n.focus?.seq, () => {
      n.focus && (E.value = n.focus.tab, m.value = n.focus.reportId || "");
    }, { immediate: !0 });
    async function S() {
      if (!(!D.value || !await y.confirm({
        title: t.t("发起结项"),
        message: t.t("先检查：所有会议已派发或已结束、所有任务已完成或已取消、没有处理中的异议。通过后项目进入「结项中」，不能再新建会议和任务，也不能撤回；AI 随后生成总结报告交你审核。"),
        confirmLabel: t.t("检查并结项")
      }))) {
        i.value = !0, k.value = "";
        try {
          const d = await J("project.close", { id: D.value.id });
          d?.ok ? (r.value = null, s.success(t.t("结项检查通过，项目进入结项中，AI 正在生成总结报告")), E.value = "summary") : r.value = bt(d?.items), await B(), u("changed");
        } catch (d) {
          k.value = x.errorMessage(d);
        } finally {
          i.value = !1;
        }
      }
    }
    async function b() {
      await B(), u("changed");
    }
    async function M() {
      w.value = !1, s.success(t.t("成员已更新")), await B(), u("changed");
    }
    function T(V) {
      a.value = !1, u("changed"), V && me({ kind: "meeting", id: V });
    }
    function G(V) {
      N.value && g.value && !g.value.contains(V.target) && (N.value = !1);
    }
    return e.onMounted(() => document.addEventListener("click", G)), e.onBeforeUnmount(() => document.removeEventListener("click", G)), (V, d) => (e.openBlock(), e.createElementBlock("section", tv, [
      c.value && !o.value ? (e.openBlock(), e.createElementBlock("p", lv, [
        d[8] || (d[8] = e.createElementVNode(
          "i",
          { class: "ri-loader-4-line spin" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(V.$t("加载中…")),
          1
          /* TEXT */
        )
      ])) : e.createCommentVNode("v-if", !0),
      k.value ? (e.openBlock(), e.createElementBlock("p", nv, [
        d[9] || (d[9] = e.createElementVNode(
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
      o.value && D.value ? (e.openBlock(), e.createElementBlock(
        e.Fragment,
        { key: 2 },
        [
          e.createCommentVNode(" 顶部：名称 + 状态 + 进度条（sticky，滚动时始终可见） "),
          e.createElementVNode("header", ov, [
            e.createElementVNode("div", av, [
              e.createElementVNode(
                "h3",
                null,
                e.toDisplayString(D.value.name),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "span",
                {
                  class: e.normalizeClass(["mm-tag", e.unref(zl)(D.value.status)]),
                  "data-test": "mm-project-status"
                },
                e.toDisplayString(e.unref(Ge)[D.value.status]),
                3
                /* TEXT, CLASS */
              ),
              d[14] || (d[14] = e.createElementVNode(
                "span",
                { class: "grow" },
                null,
                -1
                /* CACHED */
              )),
              e.createElementVNode("ol", {
                class: "mm-steps",
                "aria-label": V.$t("项目状态")
              }, [
                (e.openBlock(!0), e.createElementBlock(
                  e.Fragment,
                  null,
                  e.renderList(e.unref(jt), (p, z) => (e.openBlock(), e.createElementBlock(
                    e.Fragment,
                    { key: p },
                    [
                      z > 0 ? (e.openBlock(), e.createElementBlock(
                        "li",
                        {
                          key: 0,
                          class: e.normalizeClass(["mm-steps__line", { done: z <= P.value }]),
                          "aria-hidden": "true"
                        },
                        null,
                        2
                        /* CLASS */
                      )) : e.createCommentVNode("v-if", !0),
                      e.createElementVNode("li", {
                        class: e.normalizeClass(["mm-steps__step", { done: z < P.value, on: z === P.value }]),
                        "aria-current": z === P.value ? "step" : void 0
                      }, [
                        d[10] || (d[10] = e.createElementVNode(
                          "i",
                          { "aria-hidden": "true" },
                          null,
                          -1
                          /* CACHED */
                        )),
                        e.createTextVNode(
                          e.toDisplayString(e.unref(Ge)[p]),
                          1
                          /* TEXT */
                        )
                      ], 10, rv)
                    ],
                    64
                    /* STABLE_FRAGMENT */
                  ))),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ], 8, sv),
              e.createElementVNode(
                "div",
                {
                  ref_key: "moreEl",
                  ref: g,
                  class: "mm-more"
                },
                [
                  e.createElementVNode("button", {
                    type: "button",
                    class: "mm-more__btn",
                    "aria-label": V.$t("更多"),
                    "aria-expanded": N.value,
                    "data-test": "mm-project-more",
                    onClick: d[0] || (d[0] = e.withModifiers((p) => N.value = !N.value, ["stop"]))
                  }, [...d[11] || (d[11] = [
                    e.createElementVNode(
                      "i",
                      { class: "ri-more-fill" },
                      null,
                      -1
                      /* CACHED */
                    )
                  ])], 8, iv),
                  N.value ? (e.openBlock(), e.createElementBlock("div", cv, [
                    e.createElementVNode("button", {
                      type: "button",
                      role: "menuitem",
                      disabled: !o.value.can.editMembers,
                      "data-test": "mm-project-edit-members",
                      onClick: d[1] || (d[1] = (p) => {
                        N.value = !1, w.value = !0;
                      })
                    }, [
                      d[12] || (d[12] = e.createElementVNode(
                        "i",
                        { class: "ri-team-line" },
                        null,
                        -1
                        /* CACHED */
                      )),
                      e.createTextVNode(
                        e.toDisplayString(V.$t("编辑成员")),
                        1
                        /* TEXT */
                      )
                    ], 8, dv),
                    e.createElementVNode("button", {
                      type: "button",
                      role: "menuitem",
                      onClick: d[2] || (d[2] = (p) => {
                        N.value = !1, B();
                      })
                    }, [
                      d[13] || (d[13] = e.createElementVNode(
                        "i",
                        { class: "ri-refresh-line" },
                        null,
                        -1
                        /* CACHED */
                      )),
                      e.createTextVNode(
                        e.toDisplayString(V.$t("刷新")),
                        1
                        /* TEXT */
                      )
                    ])
                  ])) : e.createCommentVNode("v-if", !0)
                ],
                512
                /* NEED_PATCH */
              ),
              o.value.can.close && D.value.status === "active" ? (e.openBlock(), e.createElementBlock("button", {
                key: 0,
                type: "button",
                class: "ss-btn primary",
                disabled: i.value,
                "data-test": "mm-project-close",
                onClick: S
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
                  e.toDisplayString(V.$t("发起结项")),
                  1
                  /* TEXT */
                )
              ], 8, mv)) : e.createCommentVNode("v-if", !0)
            ]),
            e.createElementVNode(
              "p",
              uv,
              e.toDisplayString(V.$t("负责人 {owner} · {n} 位成员 · {date} 创建", { owner: o.value.ownerName, n: o.value.members.length, date: e.unref(st)(D.value.createdAt) })),
              1
              /* TEXT */
            )
          ]),
          D.value.desc ? (e.openBlock(), e.createElementBlock(
            "p",
            pv,
            e.toDisplayString(D.value.desc),
            1
            /* TEXT */
          )) : e.createCommentVNode("v-if", !0),
          e.createCommentVNode(" 结项检查不通过：列出未完成事项 "),
          r.value ? (e.openBlock(), e.createElementBlock("section", vv, [
            e.createElementVNode("header", null, [
              e.createElementVNode(
                "strong",
                null,
                e.toDisplayString(V.$t("结项检查未通过，还有 {n} 项未完成", { n: r.value.length })),
                1
                /* TEXT */
              ),
              e.createElementVNode("button", {
                type: "button",
                class: "mm-x",
                "aria-label": V.$t("关闭"),
                onClick: d[3] || (d[3] = (p) => r.value = null)
              }, [...d[15] || (d[15] = [
                e.createElementVNode(
                  "i",
                  { class: "ri-close-line" },
                  null,
                  -1
                  /* CACHED */
                )
              ])], 8, kv)
            ]),
            e.createElementVNode(
              "p",
              yv,
              e.toDisplayString(V.$t("结项要求：所有会议已派发或已结束、所有任务已完成或已取消、没有处理中的异议。")),
              1
              /* TEXT */
            ),
            e.createElementVNode("ul", gv, [
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(r.value, (p) => (e.openBlock(), e.createElementBlock("li", {
                  key: `${p.kind}-${p.id}`
                }, [
                  e.createElementVNode(
                    "span",
                    {
                      class: e.normalizeClass(["mm-tag", e.unref(Se)(p, o.value.tasks, { canArbitrate: !!o.value.can.close }).tone])
                    },
                    e.toDisplayString(e.unref(Se)(p, o.value.tasks, { canArbitrate: !!o.value.can.close }).chip),
                    3
                    /* TEXT, CLASS */
                  ),
                  e.createElementVNode("span", fv, [
                    e.createTextVNode(
                      e.toDisplayString(p.title),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "small",
                      null,
                      " · " + e.toDisplayString(p.reason),
                      1
                      /* TEXT */
                    )
                  ]),
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-link",
                    onClick: (z) => e.unref(me)(e.unref(Se)(p, o.value.tasks, { canArbitrate: !!o.value.can.close }).link)
                  }, [
                    e.createTextVNode(
                      e.toDisplayString(e.unref(Se)(p, o.value.tasks, { canArbitrate: !!o.value.can.close }).action) + " ",
                      1
                      /* TEXT */
                    ),
                    d[16] || (d[16] = e.createElementVNode(
                      "i",
                      { class: "ri-arrow-right-s-line" },
                      null,
                      -1
                      /* CACHED */
                    ))
                  ], 8, Nv)
                ]))),
                128
                /* KEYED_FRAGMENT */
              ))
            ])
          ])) : e.createCommentVNode("v-if", !0),
          e.createCommentVNode(" 5 个统计 "),
          e.createElementVNode("ul", Vv, [
            e.createElementVNode("li", null, [
              e.createElementVNode(
                "b",
                null,
                e.toDisplayString(V.$t("{n} 场", { n: o.value.stats.meetings })),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "small",
                null,
                e.toDisplayString(V.$t("会议")),
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
                e.toDisplayString(V.$t("任务完成")),
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
                  e.toDisplayString(V.$t("逾期任务")),
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
                  e.toDisplayString(V.$t("处理中异议")),
                  1
                  /* TEXT */
                )
              ],
              2
              /* CLASS */
            ),
            e.createElementVNode("li", Ev, [
              e.createElementVNode(
                "b",
                null,
                e.toDisplayString(e.unref(Ee)(o.value.stats.weekRate)) + "%",
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "small",
                null,
                e.toDisplayString(V.$t("本周完成率")),
                1
                /* TEXT */
              )
            ])
          ]),
          e.createElementVNode("nav", $v, [
            (e.openBlock(!0), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(I.value, (p) => (e.openBlock(), e.createElementBlock("button", {
                key: p.key,
                type: "button",
                role: "tab",
                "aria-selected": E.value === p.key,
                class: e.normalizeClass({ on: E.value === p.key }),
                "data-test": `mm-pd-tab-${p.key}`,
                onClick: (z) => E.value = p.key
              }, [
                e.createTextVNode(
                  e.toDisplayString(p.title),
                  1
                  /* TEXT */
                ),
                p.count !== void 0 ? (e.openBlock(), e.createElementBlock(
                  "em",
                  hv,
                  e.toDisplayString(p.count),
                  1
                  /* TEXT */
                )) : e.createCommentVNode("v-if", !0)
              ], 10, bv))),
              128
              /* KEYED_FRAGMENT */
            ))
          ]),
          e.createCommentVNode(" 概览 "),
          E.value === "overview" ? (e.openBlock(), e.createElementBlock("div", _v, [
            e.createElementVNode("div", Bv, [
              D.value.status === "active" && j.value.length ? (e.openBlock(), e.createElementBlock("section", Sv, [
                e.createElementVNode(
                  "h4",
                  null,
                  e.toDisplayString(V.$t("结项前需处理 · {n} 项", { n: j.value.length })),
                  1
                  /* TEXT */
                ),
                e.createElementVNode("ul", Dv, [
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(j.value, (p) => (e.openBlock(), e.createElementBlock("li", {
                      key: `${p.kind}-${p.id}`
                    }, [
                      e.createElementVNode(
                        "span",
                        {
                          class: e.normalizeClass(["mm-tag", e.unref(Se)(p, o.value.tasks, { canArbitrate: !!o.value.can.close }).tone])
                        },
                        e.toDisplayString(e.unref(Se)(p, o.value.tasks, { canArbitrate: !!o.value.can.close }).chip),
                        3
                        /* TEXT, CLASS */
                      ),
                      e.createElementVNode("span", {
                        class: "t",
                        title: p.reason ? `${p.title} · ${p.reason}` : p.title
                      }, [
                        e.createTextVNode(
                          e.toDisplayString(p.title),
                          1
                          /* TEXT */
                        ),
                        p.reason ? (e.openBlock(), e.createElementBlock(
                          "small",
                          Cv,
                          " · " + e.toDisplayString(p.reason),
                          1
                          /* TEXT */
                        )) : e.createCommentVNode("v-if", !0)
                      ], 8, wv),
                      e.createElementVNode("button", {
                        type: "button",
                        class: "ss-link",
                        "data-test": `mm-blocker-${p.id}`,
                        onClick: (z) => e.unref(me)(e.unref(Se)(p, o.value.tasks, { canArbitrate: !!o.value.can.close }).link)
                      }, [
                        e.createTextVNode(
                          e.toDisplayString(e.unref(Se)(p, o.value.tasks, { canArbitrate: !!o.value.can.close }).action) + " ",
                          1
                          /* TEXT */
                        ),
                        d[17] || (d[17] = e.createElementVNode(
                          "i",
                          { class: "ri-arrow-right-s-line" },
                          null,
                          -1
                          /* CACHED */
                        ))
                      ], 8, Tv)
                    ]))),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ])
              ])) : D.value.status === "active" ? (e.openBlock(), e.createElementBlock("p", Iv, [
                d[18] || (d[18] = e.createElementVNode(
                  "i",
                  { class: "ri-checkbox-circle-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(V.$t("会议、任务都已收尾，没有处理中的异议，可以发起结项。")),
                  1
                  /* TEXT */
                )
              ])) : e.createCommentVNode("v-if", !0),
              e.createElementVNode("section", Mv, [
                e.createElementVNode(
                  "h4",
                  null,
                  e.toDisplayString(V.$t("各部门任务进度")),
                  1
                  /* TEXT */
                ),
                o.value.deptProgress.length ? (e.openBlock(), e.createElementBlock("ul", jv, [
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(o.value.deptProgress, (p) => (e.openBlock(), e.createElementBlock("li", {
                      key: p.deptId
                    }, [
                      e.createElementVNode(
                        "span",
                        Lv,
                        e.toDisplayString(p.name),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode("i", zv, [
                        e.createElementVNode(
                          "b",
                          {
                            style: e.normalizeStyle({ width: `${e.unref(vt)(p.done, p.total)}%` })
                          },
                          null,
                          4
                          /* STYLE */
                        )
                      ]),
                      e.createElementVNode(
                        "span",
                        Fv,
                        e.toDisplayString(p.done) + "/" + e.toDisplayString(p.total),
                        1
                        /* TEXT */
                      )
                    ]))),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ])) : (e.openBlock(), e.createElementBlock(
                  "p",
                  Av,
                  e.toDisplayString(V.$t("还没有任务")),
                  1
                  /* TEXT */
                ))
              ])
            ]),
            e.createElementVNode("div", Pv, [
              e.createElementVNode("section", Uv, [
                e.createElementVNode("h4", null, [
                  e.createTextVNode(
                    e.toDisplayString(V.$t("关键决策")) + " ",
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "small",
                    null,
                    e.toDisplayString(V.$t("来自会议纪要")),
                    1
                    /* TEXT */
                  )
                ]),
                o.value.decisions.length ? (e.openBlock(), e.createElementBlock("ol", Rv, [
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(o.value.decisions, (p, z) => (e.openBlock(), e.createElementBlock("li", { key: z }, [
                      d[20] || (d[20] = e.createElementVNode(
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
                          e.toDisplayString(p.text),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode("time", null, [
                          e.createTextVNode(
                            e.toDisplayString(e.unref(it)(p.at)),
                            1
                            /* TEXT */
                          ),
                          p.meetingTitle ? (e.openBlock(), e.createElementBlock(
                            e.Fragment,
                            { key: 0 },
                            [
                              d[19] || (d[19] = e.createTextVNode(
                                " · ",
                                -1
                                /* CACHED */
                              )),
                              p.meetingId ? (e.openBlock(), e.createElementBlock("button", {
                                key: 0,
                                type: "button",
                                class: "mm-linkish",
                                onClick: (X) => e.unref(me)({ kind: "meeting", id: p.meetingId })
                              }, e.toDisplayString(p.meetingTitle), 9, qv)) : (e.openBlock(), e.createElementBlock(
                                e.Fragment,
                                { key: 1 },
                                [
                                  e.createTextVNode(
                                    e.toDisplayString(p.meetingTitle),
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
                  Ov,
                  e.toDisplayString(V.$t("还没有定稿的决议")),
                  1
                  /* TEXT */
                ))
              ]),
              e.createElementVNode("section", Kv, [
                e.createElementVNode("h4", null, [
                  e.createTextVNode(
                    e.toDisplayString(V.$t("成员")) + " ",
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
                e.createElementVNode("div", Hv, [
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(o.value.members, (p) => (e.openBlock(), e.createElementBlock("i", {
                      key: p.id,
                      style: e.normalizeStyle({ background: e.unref(re)(p.name).color }),
                      title: p.name,
                      "aria-label": p.name
                    }, e.toDisplayString(e.unref(re)(p.name).text), 13, Wv))),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ])
              ])
            ])
          ])) : E.value === "meetings" ? (e.openBlock(), e.createElementBlock(
            e.Fragment,
            { key: 3 },
            [
              e.createCommentVNode(" 会议 "),
              e.createElementVNode("div", Gv, [
                e.createElementVNode("div", Yv, [
                  e.createElementVNode(
                    "p",
                    Jv,
                    e.toDisplayString(D.value.status === "active" ? V.$t("项目进行中才能新建会议。") : V.$t("项目已结项，不能再新建会议。")),
                    1
                    /* TEXT */
                  ),
                  d[22] || (d[22] = e.createElementVNode(
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
                    onClick: d[4] || (d[4] = (p) => a.value = !0)
                  }, [
                    d[21] || (d[21] = e.createElementVNode(
                      "i",
                      { class: "ri-add-line" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createTextVNode(
                      e.toDisplayString(V.$t("新建会议")),
                      1
                      /* TEXT */
                    )
                  ])) : e.createCommentVNode("v-if", !0)
                ]),
                o.value.meetings.length ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock(
                  "p",
                  Qv,
                  e.toDisplayString(V.$t("这个项目还没有会议")),
                  1
                  /* TEXT */
                )),
                (e.openBlock(!0), e.createElementBlock(
                  e.Fragment,
                  null,
                  e.renderList(o.value.meetings, (p) => (e.openBlock(), e.createElementBlock("button", {
                    key: p.id,
                    type: "button",
                    class: "mm-mrow",
                    "data-test": `mm-pd-meeting-${p.id}`,
                    onClick: (z) => e.unref(me)({ kind: "meeting", id: p.id })
                  }, [
                    e.createElementVNode("span", Xv, [
                      e.createElementVNode(
                        "strong",
                        null,
                        e.toDisplayString(p.title),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode("small", null, [
                        e.createTextVNode(
                          e.toDisplayString(e.unref($e)(p.time)),
                          1
                          /* TEXT */
                        ),
                        p.confirmText ? (e.openBlock(), e.createElementBlock(
                          e.Fragment,
                          { key: 0 },
                          [
                            e.createTextVNode(
                              " · " + e.toDisplayString(p.confirmText),
                              1
                              /* TEXT */
                            )
                          ],
                          64
                          /* STABLE_FRAGMENT */
                        )) : e.createCommentVNode("v-if", !0)
                      ])
                    ]),
                    p.needsMe ? (e.openBlock(), e.createElementBlock(
                      "span",
                      xv,
                      e.toDisplayString(V.$t("待你处理")),
                      1
                      /* TEXT */
                    )) : e.createCommentVNode("v-if", !0),
                    e.createElementVNode(
                      "span",
                      {
                        class: e.normalizeClass(["mm-tag", U(p.status)])
                      },
                      e.toDisplayString(e.unref(Xe)[p.status] || p.status),
                      3
                      /* TEXT, CLASS */
                    ),
                    d[23] || (d[23] = e.createElementVNode(
                      "i",
                      {
                        class: "ri-arrow-right-s-line",
                        "aria-hidden": "true"
                      },
                      null,
                      -1
                      /* CACHED */
                    ))
                  ], 8, Zv))),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ])
            ],
            2112
            /* STABLE_FRAGMENT, DEV_ROOT_FRAGMENT */
          )) : E.value === "tasks" ? (e.openBlock(), e.createElementBlock(
            e.Fragment,
            { key: 4 },
            [
              e.createCommentVNode(" 任务 "),
              e.createElementVNode("div", ek, [
                e.createVNode(Pt, {
                  tasks: o.value.tasks,
                  "group-by": "status",
                  "empty-text": V.$t("这个项目还没有任务"),
                  onSelect: d[5] || (d[5] = (p) => e.unref(me)({ kind: "task", id: p.id }))
                }, null, 8, ["tasks", "empty-text"])
              ])
            ],
            2112
            /* STABLE_FRAGMENT, DEV_ROOT_FRAGMENT */
          )) : E.value === "reports" ? (e.openBlock(), e.createBlock(vp, {
            key: 5,
            project: D.value,
            "focus-report-id": m.value,
            "can-generate": o.value.can.generateReport ?? D.value.status !== "archived",
            onChanged: b
          }, null, 8, ["project", "focus-report-id", "can-generate"])) : (e.openBlock(), e.createBlock(Ap, {
            key: 6,
            project: D.value,
            can: o.value.can,
            members: o.value.members,
            generating: !!o.value.summaryGenerating,
            "is-owner": C.value,
            onChanged: b
          }, null, 8, ["project", "can", "members", "generating", "is-owner"]))
        ],
        64
        /* STABLE_FRAGMENT */
      )) : e.createCommentVNode("v-if", !0),
      o.value && D.value ? (e.openBlock(), e.createBlock(ev, {
        key: 3,
        open: w.value,
        "project-id": D.value.id,
        "owner-id": D.value.ownerId,
        "member-ids": D.value.memberIds,
        members: o.value.members,
        onClose: d[6] || (d[6] = (p) => w.value = !1),
        onSaved: M
      }, null, 8, ["open", "project-id", "owner-id", "member-ids", "members"])) : e.createCommentVNode("v-if", !0),
      o.value && D.value && a.value ? (e.openBlock(), e.createBlock(Ft, {
        key: 4,
        "project-id": D.value.id,
        onClose: d[7] || (d[7] = (p) => a.value = !1),
        onCreated: T
      }, null, 8, ["project-id"])) : e.createCommentVNode("v-if", !0)
    ]));
  }
}), lk = /* @__PURE__ */ ae(tk, [["__scopeId", "data-v-614cbe4b"]]), nk = {
  class: "mm-pcd",
  "data-test": "mm-project-create"
}, ok = { class: "ss-field" }, ak = ["placeholder"], sk = { class: "ss-field" }, rk = ["placeholder"], ik = { class: "mm-pcd__cols" }, ck = { class: "mm-pcd__f" }, dk = { class: "mm-pcd__f" }, mk = { class: "ss-muted" }, uk = {
  key: 0,
  class: "ss-note danger"
}, pk = ["disabled"], vk = /* @__PURE__ */ e.defineComponent({
  __name: "ProjectCreateDialog",
  props: {
    open: { type: Boolean }
  },
  emits: ["close", "created"],
  setup(l, { emit: v }) {
    const n = l, u = v, y = e.ref([]), s = e.ref([]), o = e.ref(!1), c = e.ref(""), i = e.reactive({ name: "", desc: "", ownerId: "", memberIds: [] }), k = e.computed(() => [.../* @__PURE__ */ new Set([...i.ownerId ? [i.ownerId] : [], ...i.memberIds])]);
    e.watch(() => n.open, async (m) => {
      if (!m) return;
      const r = oe.value?.me.person?.id || "";
      Object.assign(i, { name: "", desc: "", ownerId: r, memberIds: r ? [r] : [] }), c.value = "";
      try {
        const N = await J("people.list");
        y.value = N?.people ?? [], s.value = N?.depts ?? [];
      } catch (N) {
        c.value = x.errorMessage(N);
      }
    }, { immediate: !0 }), e.watch(() => i.ownerId, (m) => {
      m && !i.memberIds.includes(m) && (i.memberIds = [m, ...i.memberIds]);
    });
    async function E() {
      o.value = !0, c.value = "";
      try {
        const m = await J("project.create", { name: i.name.trim(), desc: i.desc.trim(), ownerId: i.ownerId, memberIds: k.value });
        u("created", m);
      } catch (m) {
        c.value = x.errorMessage(m);
      } finally {
        o.value = !1;
      }
    }
    return (m, r) => (e.openBlock(), e.createBlock(Ze, {
      open: l.open,
      title: m.$t("新建项目"),
      icon: "ri-folder-add-line",
      size: "lg",
      onClose: r[5] || (r[5] = (N) => u("close"))
    }, {
      footer: e.withCtx(() => [
        e.createElementVNode(
          "button",
          {
            type: "button",
            class: "ss-btn",
            onClick: r[4] || (r[4] = (N) => u("close"))
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
          onClick: E
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
        ], 8, pk)
      ]),
      default: e.withCtx(() => [
        e.createElementVNode("div", nk, [
          e.createElementVNode("label", ok, [
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(m.$t("项目名称")),
              1
              /* TEXT */
            ),
            e.withDirectives(e.createElementVNode("input", {
              "onUpdate:modelValue": r[0] || (r[0] = (N) => i.name = N),
              type: "text",
              maxlength: "60",
              placeholder: m.$t("如：A2 量产导入项目"),
              "data-test": "mm-pc-name"
            }, null, 8, ak), [
              [e.vModelText, i.name]
            ])
          ]),
          e.createElementVNode("label", sk, [
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(m.$t("项目说明")),
              1
              /* TEXT */
            ),
            e.withDirectives(e.createElementVNode("textarea", {
              "onUpdate:modelValue": r[1] || (r[1] = (N) => i.desc = N),
              rows: "3",
              placeholder: m.$t("项目目标、范围、关键节点"),
              "data-test": "mm-pc-desc"
            }, null, 8, rk), [
              [e.vModelText, i.desc]
            ])
          ]),
          e.createElementVNode("div", ik, [
            e.createElementVNode("div", ck, [
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(m.$t("项目负责人")),
                1
                /* TEXT */
              ),
              e.createVNode(we, {
                modelValue: i.ownerId,
                "onUpdate:modelValue": r[2] || (r[2] = (N) => i.ownerId = N),
                people: y.value,
                depts: s.value,
                multiple: !1,
                "max-height": 240
              }, null, 8, ["modelValue", "people", "depts"])
            ]),
            e.createElementVNode("div", dk, [
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(m.$t("项目成员（{n} 人）", { n: k.value.length })),
                1
                /* TEXT */
              ),
              e.createVNode(we, {
                modelValue: i.memberIds,
                "onUpdate:modelValue": r[3] || (r[3] = (N) => i.memberIds = N),
                people: y.value,
                depts: s.value,
                locked: i.ownerId ? [i.ownerId] : [],
                "locked-hint": m.$t("负责人"),
                "max-height": 240
              }, null, 8, ["modelValue", "people", "depts", "locked", "locked-hint"])
            ])
          ]),
          e.createElementVNode(
            "p",
            mk,
            e.toDisplayString(m.$t("项目负责人自动成为成员；之后会议的主持人、参会人、任务负责人和接收任务的部门负责人也会自动加入。")),
            1
            /* TEXT */
          ),
          c.value ? (e.openBlock(), e.createElementBlock("p", uk, [
            r[6] || (r[6] = e.createElementVNode(
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
        ])
      ]),
      _: 1
      /* STABLE */
    }, 8, ["open", "title"]));
  }
}), kk = /* @__PURE__ */ ae(vk, [["__scopeId", "data-v-ed67c1d7"]]), yk = {
  class: "mm-projects",
  "data-test": "mm-projects-tab"
}, gk = { class: "mm-pagehead" }, fk = {
  key: 0,
  class: "ss-note danger"
}, Nk = { class: "mm-projects__grid" }, Vk = { class: "mm-plist" }, Ek = { class: "mm-search" }, $k = ["placeholder", "aria-label"], bk = ["aria-label"], hk = ["aria-selected", "data-test", "onClick"], _k = {
  key: 0,
  class: "mm-plist__empty"
}, Bk = {
  key: 1,
  class: "mm-plist__empty"
}, Sk = ["data-test", "onClick"], Dk = { class: "mm-pcard__top" }, wk = {
  key: 0,
  class: "mm-pcard__over"
}, Ck = { class: "mm-pcard__bot" }, Tk = { class: "mm-bar" }, Ik = { class: "owner" }, Mk = { class: "mm-plist__foot" }, Ak = { class: "mm-projects__detail" }, jk = {
  key: 1,
  class: "mm-projects__none"
}, Lk = /* @__PURE__ */ e.defineComponent({
  __name: "ProjectsTab",
  emits: ["role"],
  setup(l, { expose: v, emit: n }) {
    const u = ["active", "closing", "archived"], y = {
      active: t.t("没有进行中的项目"),
      closing: t.t("没有结项中的项目"),
      archived: t.t("没有已归档的项目")
    }, s = ce.useNotificationStore(), o = e.ref([]), c = e.ref("active"), i = e.ref(""), k = e.ref(""), E = e.ref(0), m = e.ref(null), r = e.ref(!1), N = e.ref(!1), w = e.ref(""), a = n;
    function g(z) {
      We.value = z, a("role", z);
    }
    e.watch(k, (z) => {
      z || g("");
    });
    const D = e.computed(() => Object.fromEntries(u.map((z) => [z, o.value.filter((X) => X.status === z).length]))), P = e.computed(() => {
      const z = i.value.trim().toLowerCase();
      return o.value.filter((X) => X.status === c.value && (!z || `${X.name} ${X.ownerName}`.toLowerCase().includes(z)));
    }), j = (z) => typeof z.rate == "number" && Number.isFinite(z.rate) ? Ee(z.rate) : vt(z.done, z.total);
    async function C() {
      N.value = !0;
      try {
        const z = await J("project.list", {});
        o.value = Array.isArray(z) ? z : [], w.value = "", U();
      } catch (z) {
        w.value = x.errorMessage(z);
      } finally {
        N.value = !1;
      }
    }
    let I = !0;
    function U() {
      const z = o.value.find((X) => X.id === k.value);
      if (z) {
        z.status !== c.value && (c.value = z.status);
        return;
      }
      if (!(k.value && m.value)) {
        if (I && !D.value[c.value]) {
          const X = u.find((le) => D.value[le] > 0);
          X && (c.value = X);
        }
        I = !1, k.value = P.value[0]?.id ?? "";
      }
    }
    e.watch(c, () => {
      P.value.some((z) => z.id === k.value) || (k.value = P.value[0]?.id ?? "");
    });
    function q(z) {
      k.value = z, m.value = null;
    }
    async function B(z) {
      if (o.value.some((X) => X.id === z)) return z;
      for (const X of o.value)
        try {
          const le = await J("project.get", { id: X.id });
          if (le?.project?.weeklyReports?.some((W) => W.id === z) || le?.project?.summary?.id === z) return X.id;
        } catch {
        }
      return "";
    }
    async function S() {
      const z = Ne.value;
      if (z.tab !== "projects") return;
      const X = Fl(z.link);
      if (!X) return;
      let le = X.projectId || "", W = X.reportId;
      if (z.link?.kind === "report" && !z.link.anchor && (le = await B(z.link.id), le === z.link.id && (W = void 0)), !le) {
        s.warn(t.t("没找到要打开的项目或报告"));
        return;
      }
      const Y = o.value.find((ee) => ee.id === le);
      Y && (c.value = Y.status), i.value = "", k.value = le, m.value = { tab: X.tab, reportId: W, seq: z.seq };
    }
    e.watch(() => Ne.value.seq, () => {
      S();
    });
    async function b(z) {
      r.value = !1, s.success(t.t("项目已创建")), c.value = "active", i.value = "", await C(), z?.id && q(z.id);
    }
    let M = null, T = null, G = 0;
    function V() {
      M && clearTimeout(M), M = setTimeout(() => {
        M = null, G = Date.now(), C(), E.value += 1;
      }, 250);
    }
    function d() {
      M || Date.now() - G < 800 || V();
    }
    v({ refresh: d });
    let p = !1;
    return e.onMounted(async () => {
      G = Date.now(), await C(), !p && (await S(), !p && (T = _e((z) => {
        z.type !== "changed" || !["all", "project", "task", "meeting", "org"].includes(z.scope) || V();
      })));
    }), e.onBeforeUnmount(() => {
      p = !0, T?.(), T = null, M && clearTimeout(M), We.value = "";
    }), (z, X) => (e.openBlock(), e.createElementBlock("div", yk, [
      e.createElementVNode("header", gk, [
        e.createElementVNode(
          "h2",
          null,
          e.toDisplayString(z.$t("项目")),
          1
          /* TEXT */
        ),
        e.createElementVNode(
          "p",
          null,
          e.toDisplayString(z.$t("汇总查看项目下的会议、任务和报告")),
          1
          /* TEXT */
        ),
        X[5] || (X[5] = e.createElementVNode(
          "span",
          { class: "grow" },
          null,
          -1
          /* CACHED */
        )),
        e.unref(oe)?.me.canCreateProject ? (e.openBlock(), e.createElementBlock("button", {
          key: 0,
          type: "button",
          class: "ss-btn",
          "data-test": "mm-project-new",
          onClick: X[0] || (X[0] = (le) => r.value = !0)
        }, [
          X[4] || (X[4] = e.createElementVNode(
            "i",
            { class: "ri-add-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            e.toDisplayString(z.$t("新建项目")),
            1
            /* TEXT */
          )
        ])) : e.createCommentVNode("v-if", !0)
      ]),
      w.value ? (e.openBlock(), e.createElementBlock("p", fk, [
        X[6] || (X[6] = e.createElementVNode(
          "i",
          { class: "ri-error-warning-line" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(w.value),
          1
          /* TEXT */
        )
      ])) : e.createCommentVNode("v-if", !0),
      e.createElementVNode("div", Nk, [
        e.createElementVNode("aside", Vk, [
          e.createElementVNode("label", Ek, [
            X[7] || (X[7] = e.createElementVNode(
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
              "onUpdate:modelValue": X[1] || (X[1] = (le) => i.value = le),
              type: "search",
              placeholder: z.$t("搜索项目"),
              "aria-label": z.$t("搜索项目"),
              "data-test": "mm-projects-search"
            }, null, 8, $k), [
              [e.vModelText, i.value]
            ])
          ]),
          e.createElementVNode("div", {
            class: "mm-plist__filters",
            role: "tablist",
            "aria-label": z.$t("项目状态")
          }, [
            (e.openBlock(), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(u, (le) => e.createElementVNode("button", {
                key: le,
                type: "button",
                role: "tab",
                "aria-selected": c.value === le,
                class: e.normalizeClass({ on: c.value === le }),
                "data-test": `mm-projects-filter-${le}`,
                onClick: (W) => c.value = le
              }, [
                e.createTextVNode(
                  e.toDisplayString(e.unref(Ge)[le]) + " ",
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "em",
                  null,
                  e.toDisplayString(D.value[le]),
                  1
                  /* TEXT */
                )
              ], 10, hk)),
              64
              /* STABLE_FRAGMENT */
            ))
          ], 8, bk),
          N.value && !o.value.length ? (e.openBlock(), e.createElementBlock(
            "p",
            _k,
            e.toDisplayString(z.$t("加载中…")),
            1
            /* TEXT */
          )) : P.value.length ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock(
            "p",
            Bk,
            e.toDisplayString(i.value ? z.$t("没有匹配的项目") : y[c.value]),
            1
            /* TEXT */
          )),
          (e.openBlock(!0), e.createElementBlock(
            e.Fragment,
            null,
            e.renderList(P.value, (le) => (e.openBlock(), e.createElementBlock("button", {
              key: le.id,
              type: "button",
              class: e.normalizeClass(["mm-pcard", { on: le.id === k.value }]),
              "data-test": `mm-project-card-${le.id}`,
              onClick: (W) => q(le.id)
            }, [
              e.createElementVNode("span", Dk, [
                e.createElementVNode(
                  "strong",
                  null,
                  e.toDisplayString(le.name),
                  1
                  /* TEXT */
                ),
                le.overdue > 0 ? (e.openBlock(), e.createElementBlock(
                  "span",
                  wk,
                  e.toDisplayString(z.$t("逾期 {n}", { n: le.overdue })),
                  1
                  /* TEXT */
                )) : e.createCommentVNode("v-if", !0)
              ]),
              e.createElementVNode("span", Ck, [
                e.createElementVNode("i", Tk, [
                  e.createElementVNode(
                    "b",
                    {
                      style: e.normalizeStyle({ width: `${j(le)}%` })
                    },
                    null,
                    4
                    /* STYLE */
                  )
                ]),
                e.createElementVNode(
                  "em",
                  null,
                  e.toDisplayString(j(le)) + "%",
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "span",
                  Ik,
                  e.toDisplayString(le.ownerName),
                  1
                  /* TEXT */
                )
              ])
            ], 10, Sk))),
            128
            /* KEYED_FRAGMENT */
          )),
          e.createElementVNode(
            "p",
            Mk,
            e.toDisplayString(z.$t("只显示你参与的项目")),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode("div", Ak, [
          k.value ? (e.openBlock(), e.createBlock(lk, {
            key: 0,
            "project-id": k.value,
            "refresh-seq": E.value,
            focus: m.value,
            onChanged: C,
            onRole: g
          }, null, 8, ["project-id", "refresh-seq", "focus"])) : (e.openBlock(), e.createElementBlock("div", jk, [
            X[9] || (X[9] = e.createElementVNode(
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
              e.toDisplayString(o.value.length ? z.$t("选择左侧的一个项目查看详情") : z.$t("还没有你参与的项目")),
              1
              /* TEXT */
            ),
            !o.value.length && e.unref(oe)?.me.canCreateProject ? (e.openBlock(), e.createElementBlock("button", {
              key: 0,
              type: "button",
              class: "ss-btn primary",
              onClick: X[2] || (X[2] = (le) => r.value = !0)
            }, [
              X[8] || (X[8] = e.createElementVNode(
                "i",
                { class: "ri-add-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(z.$t("新建项目")),
                1
                /* TEXT */
              )
            ])) : e.createCommentVNode("v-if", !0)
          ]))
        ])
      ]),
      e.createVNode(kk, {
        open: r.value,
        onClose: X[3] || (X[3] = (le) => r.value = !1),
        onCreated: b
      }, null, 8, ["open"])
    ]));
  }
}), zk = /* @__PURE__ */ ae(Lk, [["__scopeId", "data-v-0f0a7b72"]]), Fk = {
  class: "mm-rec",
  "data-test": "mm-rec"
}, Pk = { class: "mm-rec__tip" }, Uk = {
  class: "mm-rec__script",
  "data-test": "mm-rec-script"
}, Ok = { class: "mm-rec__bar" }, Rk = ["disabled"], qk = {
  key: 0,
  class: "mm-rec__dot"
}, Kk = { class: "mm-rec__meter" }, Hk = {
  key: 0,
  class: "ss-note warn"
}, Wk = ["src"], Gk = {
  key: 2,
  class: "ss-note danger",
  "data-test": "mm-rec-error"
}, _t = 10, Yk = 15, Jk = /* @__PURE__ */ e.defineComponent({
  __name: "VoiceRecorder",
  props: {
    script: {},
    disabled: { type: Boolean }
  },
  emits: ["recorded", "reset"],
  setup(l, { emit: v }) {
    const n = v, u = e.ref("idle"), y = e.ref(0), s = e.ref(0), o = e.ref(""), c = e.ref("");
    let i = null, k = null, E = [], m = null, r = 0, N = null, w = 0;
    function a() {
      m && (clearInterval(m), m = null), r && (cancelAnimationFrame(r), r = 0);
      try {
        i?.getTracks().forEach((C) => C.stop());
      } catch {
      }
      i = null;
      try {
        N?.close();
      } catch {
      }
      N = null, s.value = 0;
    }
    function g() {
      for (const C of ["audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus", "audio/mp4"])
        try {
          if (typeof MediaRecorder < "u" && MediaRecorder.isTypeSupported(C)) return C;
        } catch {
        }
      return "";
    }
    async function D() {
      o.value = "", c.value && (URL.revokeObjectURL(c.value), c.value = ""), n("reset");
      try {
        i = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: !0, noiseSuppression: !1, autoGainControl: !0 } });
      } catch (I) {
        o.value = I?.name === "NotAllowedError" ? t.t("没有麦克风权限：请在系统设置 → 隐私与安全性 → 麦克风里允许本应用，或改用「导入录音文件」") : t.t("打不开麦克风：{p0}", { p0: I?.message || "-" }), a();
        return;
      }
      const C = g();
      try {
        k = C ? new MediaRecorder(i, { mimeType: C }) : new MediaRecorder(i);
      } catch (I) {
        o.value = t.t("这台电脑不支持录音：{p0}", { p0: I?.message || "-" }), a();
        return;
      }
      E = [], k.ondataavailable = (I) => {
        I.data && I.data.size && E.push(I.data);
      }, k.onstop = () => void j(k?.mimeType || C);
      try {
        N = new AudioContext();
        const I = N.createAnalyser();
        I.fftSize = 1024, N.createMediaStreamSource(i).connect(I);
        const U = new Uint8Array(I.fftSize), q = () => {
          I.getByteTimeDomainData(U);
          let B = 0;
          for (const S of U) B = Math.max(B, Math.abs(S - 128));
          s.value = Math.min(100, Math.round(B / 128 * 140)), r = requestAnimationFrame(q);
        };
        q();
      } catch {
      }
      w = Date.now(), y.value = 0, u.value = "recording", k.start(250), m = setInterval(() => {
        y.value = Math.floor((Date.now() - w) / 1e3), y.value >= Yk && P();
      }, 200);
    }
    function P() {
      k && k.state !== "inactive" && k.stop(), m && (clearInterval(m), m = null);
    }
    async function j(C) {
      const I = Math.round((Date.now() - w) / 100) / 10;
      a(), u.value = "done", y.value = Math.round(I);
      const U = new Blob(E, { type: C || "audio/webm" });
      if (!U.size) {
        o.value = t.t("没有录到声音，请重录");
        return;
      }
      c.value = URL.createObjectURL(U);
      const q = new Uint8Array(await U.arrayBuffer());
      let B = "";
      for (let b = 0; b < q.length; b += 32768) B += String.fromCharCode(...q.subarray(b, b + 32768));
      const S = /ogg/.test(C) ? "ogg" : /mp4/.test(C) ? "m4a" : "webm";
      n("recorded", { data: btoa(B), ext: S, seconds: I });
    }
    return e.onBeforeUnmount(() => {
      try {
        k && k.state !== "inactive" && k.stop();
      } catch {
      }
      a(), c.value && URL.revokeObjectURL(c.value);
    }), (C, I) => (e.openBlock(), e.createElementBlock("div", Fk, [
      e.createElementVNode(
        "p",
        Pk,
        e.toDisplayString(C.$t("请在安静的地方，用平时开会说话的音量和语速，朗读下面这段话：")),
        1
        /* TEXT */
      ),
      e.createElementVNode(
        "blockquote",
        Uk,
        e.toDisplayString(l.script),
        1
        /* TEXT */
      ),
      e.createElementVNode("div", Ok, [
        u.value !== "recording" ? (e.openBlock(), e.createElementBlock("button", {
          key: 0,
          type: "button",
          class: e.normalizeClass(["ss-btn", u.value === "idle" ? "primary" : ""]),
          disabled: l.disabled,
          "data-test": "mm-rec-start",
          onClick: D
        }, [
          I[0] || (I[0] = e.createElementVNode(
            "i",
            { class: "ri-mic-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            e.toDisplayString(u.value === "idle" ? C.$t("开始录音") : C.$t("重录")),
            1
            /* TEXT */
          )
        ], 10, Rk)) : (e.openBlock(), e.createElementBlock("button", {
          key: 1,
          type: "button",
          class: "ss-btn danger",
          "data-test": "mm-rec-stop",
          onClick: P
        }, [
          I[1] || (I[1] = e.createElementVNode(
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
            class: e.normalizeClass(["mm-rec__time", { live: u.value === "recording", short: y.value > 0 && y.value < _t && u.value !== "recording" }])
          },
          [
            u.value === "recording" ? (e.openBlock(), e.createElementBlock("i", qk)) : e.createCommentVNode("v-if", !0),
            e.createTextVNode(
              e.toDisplayString(C.$t("{s} 秒", { s: y.value })),
              1
              /* TEXT */
            )
          ],
          2
          /* CLASS */
        ),
        e.createElementVNode("i", Kk, [
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
      u.value === "done" && y.value < _t ? (e.openBlock(), e.createElementBlock("p", Hk, [
        I[2] || (I[2] = e.createElementVNode(
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
      c.value ? (e.openBlock(), e.createElementBlock("audio", {
        key: 1,
        src: c.value,
        controls: "",
        class: "mm-rec__audio",
        "data-test": "mm-rec-preview"
      }, null, 8, Wk)) : e.createCommentVNode("v-if", !0),
      o.value ? (e.openBlock(), e.createElementBlock("p", Gk, [
        I[3] || (I[3] = e.createElementVNode(
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
}), Rt = /* @__PURE__ */ ae(Jk, [["__scopeId", "data-v-f9d93abd"]]), Qk = {
  class: "mm-sv",
  "data-test": "mm-voiceprint"
}, Zk = { class: "mm-sp__head" }, Xk = { class: "ss-actions" }, xk = ["disabled"], ey = ["disabled", "title"], ty = {
  key: 0,
  class: "ss-note warn"
}, ly = { class: "ss-muted mm-sv__tip" }, ny = {
  key: 2,
  class: "ss-note danger"
}, oy = {
  class: "mm-sv__cov",
  "data-test": "mm-vp-coverage"
}, ay = { class: "mm-sv__num" }, sy = { class: "mm-sv__bar" }, ry = { class: "mm-bar" }, iy = { class: "mm-sv__tools" }, cy = {
  class: "mm-subtabs",
  role: "tablist"
}, dy = ["aria-selected", "data-test", "onClick"], my = { class: "mm-search" }, uy = ["placeholder", "aria-label"], py = { class: "ss-table-wrap" }, vy = { class: "ss-table mm-sv__table" }, ky = { class: "num" }, yy = { key: 0 }, gy = {
  colspan: "6",
  class: "mm-sv__empty"
}, fy = ["data-test"], Ny = { class: "mm-sv__st" }, Vy = ["title", "data-test"], Ey = ["title", "data-test"], $y = { class: "mono" }, by = { class: "mono" }, hy = { class: "num" }, _y = ["disabled", "onClick"], By = ["disabled", "data-test", "onClick"], Sy = ["disabled", "data-test", "onClick"], Dy = ["disabled", "data-test", "onClick"], wy = ["disabled", "data-test", "onClick"], Cy = ["disabled", "data-test", "onClick"], Ty = ["onClick"], Iy = { class: "mm-sv__foot" }, My = ["aria-label"], Ay = ["disabled", "aria-label"], jy = ["aria-current", "onClick"], Ly = ["disabled", "aria-label"], zy = {
  class: "mm-sv__imp",
  "data-test": "mm-vp-import-dialog"
}, Fy = { class: "mm-sv__f" }, Py = { class: "mm-sv__f" }, Uy = {
  key: 0,
  class: "ss-muted"
}, Oy = { class: "mm-sv__consent" }, Ry = {
  key: 0,
  class: "ss-note danger"
}, qy = ["disabled"], Ky = {
  class: "mm-sv__imp",
  "data-test": "mm-vp-record-dialog"
}, Hy = { class: "mm-sv__f" }, Wy = { class: "mm-sv__consent" }, Gy = {
  key: 1,
  class: "ss-note danger"
}, Yy = ["disabled"], Jy = 8, Qy = /* @__PURE__ */ e.defineComponent({
  __name: "SettingsVoiceprint",
  props: {
    people: {},
    depts: {},
    refreshSeq: { default: 0 }
  },
  setup(l) {
    const v = [
      { key: "all", title: t.t("全部人员") },
      { key: "missing", title: t.t("未采集") },
      { key: "collected", title: t.t("已采集") }
    ], n = l, u = Be.useDialog(), y = ce.useNotificationStore(), s = e.ref([]), o = e.ref(!1), c = e.ref(!1), i = e.ref(""), k = e.ref({}), E = e.ref(null), m = e.ref("all"), r = e.ref(""), N = e.ref(1), w = e.ref(!1), a = e.reactive({ personId: "", path: "", consent: !1 }), g = e.ref(""), D = e.ref(null), P = e.ref(!1), j = e.reactive({ personId: "", consent: !1, recorded: null }), C = e.ref(""), I = e.computed(() => !!oe.value?.pushChannel || !!oe.value?.wecomConnected), U = e.computed(() => oe.value?.me.person?.id || ""), q = e.computed(() => oe.value?.pushChannel === "webhook"), B = e.computed(() => s.value.filter((F) => F.status === "collected").length), S = e.computed(() => vt(B.value, s.value.length)), b = (F) => F === "all" ? s.value.length : s.value.filter((K) => K.status === F).length, M = e.computed(() => s.value.filter((F) => m.value === "all" || F.status === m.value).filter((F) => kt(F.person, F.deptName, r.value)).sort((F, K) => F.status === K.status ? (K.enrolledAt || 0) - (F.enrolledAt || 0) : F.status === "missing" ? -1 : 1)), T = e.computed(() => Lt(M.value, N.value, Jy));
    async function G() {
      o.value = !0;
      try {
        const F = await J("voiceprint.list");
        s.value = Array.isArray(F) ? F : [], i.value = "";
      } catch (F) {
        i.value = x.errorMessage(F);
      } finally {
        o.value = !1;
      }
    }
    e.watch(() => n.refreshSeq, () => {
      G();
    }, { immediate: !0 });
    const V = (F) => s.value.find((K) => K.person.id === F)?.person.name || n.people.find((K) => K.id === F)?.name || F, d = e.computed(() => {
      const F = s.value.find((h) => h.person.id === j.personId), K = F?.person || n.people.find((h) => h.id === j.personId), _ = F?.deptName || n.depts.find((h) => h.id === K?.deptId)?.name || "";
      return t.t("大家好，我是{dept}的{name}。这是我的声纹采集录音，用于在会议纪要里自动识别我的发言。我会用平时开会说话的音量和语速，把这段话完整地读完。", {
        dept: _,
        name: K?.name || ""
      });
    });
    async function p() {
      const F = await J("voiceprint.link"), K = {};
      if (F && typeof F == "object" && Array.isArray(F.links))
        for (const f of F.links) f?.personId && f.url && (K[f.personId] = f.url);
      const _ = oe.value?.me.person?.id, h = Je(F);
      if (_ && h && !K[_] && (K[_] = h), !Object.keys(K).length) throw new Error(t.t("没拿到采集链接，请先在「手机端」开启手机页服务"));
      return k.value = K, K;
    }
    async function z() {
      c.value = !0, i.value = "";
      try {
        const F = await p(), K = s.value.filter((f) => f.status === "missing" && F[f.person.id]), _ = K.length ? K : s.value.filter((f) => F[f.person.id]), h = _.map((f) => `${f.person.name}${f.deptName ? ` · ${f.deptName}` : ""}${t.t("：")}${F[f.person.id]}`).join(`
`);
        await Qe(h) ? y.success(K.length ? t.t("已复制 {n} 位未采集员工的采集链接（每人一条，请分别发给本人）", { n: _.length }) : t.t("已复制 {n} 人的采集链接", { n: _.length })) : i.value = t.t("复制失败，请重试");
      } catch (F) {
        i.value = x.errorMessage(F);
      } finally {
        c.value = !1;
      }
    }
    async function X(F) {
      c.value = !0, i.value = "";
      try {
        const _ = (k.value[F.person.id] ? k.value : await p())[F.person.id];
        if (!_) throw new Error(t.t("没拿到 {name} 的采集链接", { name: F.person.name }));
        await Qe(_) && y.success(t.t("已复制 {name} 的采集链接", { name: F.person.name }));
      } catch (K) {
        i.value = x.errorMessage(K);
      } finally {
        c.value = !1;
      }
    }
    async function le() {
      if (await u.confirm({
        title: q.value ? t.t("发送到企微群") : t.t("推送到企微"),
        message: q.value ? t.t("在企微群里发一条声纹采集邀请，点名提醒还没采集的人（已采集的不打扰）？") : t.t("给还没采集的人逐个推送声纹采集卡片（已采集的不打扰）？")
      })) {
        c.value = !0, i.value = "", E.value = null;
        try {
          const K = await J("voiceprint.send");
          E.value = { sent: Number(K?.sent) || 0, failed: Array.isArray(K?.failed) ? K.failed : [] }, K?.skipped ? y.success(t.t("所有人都已采集过声纹，不用再发")) : E.value.failed.length || y.success(K?.group ? t.t("采集邀请已发到企微群") : t.t("采集卡片已推送到企微"));
        } catch (K) {
          i.value = x.errorMessage(K);
        } finally {
          c.value = !1;
        }
      }
    }
    async function W(F) {
      if (await u.confirm({
        title: t.t("删除声纹（撤回授权）"),
        message: t.t("删除 {name} 的声纹样本和授权记录？之后的会议里不再能自动识别 TA，需要重新授权采集。", { name: F.person.name }),
        danger: !0,
        confirmLabel: t.t("删除")
      })) {
        c.value = !0, i.value = "";
        try {
          await J("voiceprint.delete", { personId: F.person.id }), y.success(t.t("已删除并撤回授权")), await G();
        } catch (_) {
          i.value = x.errorMessage(_);
        } finally {
          c.value = !1;
        }
      }
    }
    async function Y(F) {
      const K = !F.autoLearn;
      if (!(!K && !await u.confirm({
        title: t.t("关闭会议补充"),
        message: t.t("关闭后不再从会议里补充样本，已补充的 {n} 条样本会一并删除；注册时录的声纹不受影响。", { n: F.extraCount || 0 }),
        confirmLabel: t.t("关闭并删除样本"),
        danger: !0
      }))) {
        c.value = !0, i.value = "";
        try {
          await J("voiceprint.autoLearn.set", { enabled: K }), y.success(K ? t.t("已开启：之后确认会议发言时会自动补充声纹") : t.t("已关闭并删除会议补充样本")), await G();
        } catch (_) {
          i.value = x.errorMessage(_);
        } finally {
          c.value = !1;
        }
      }
    }
    function ee(F) {
      Object.assign(a, { personId: F, path: "", consent: !1 }), g.value = "", D.value && (D.value.value = ""), w.value = !0;
    }
    function ne(F) {
      const K = F.target.files?.[0];
      a.path = Pl(K), g.value = K && !a.path ? t.t("读不到这个文件的本机路径，请选择电脑上的录音文件") : "";
    }
    async function $() {
      c.value = !0, g.value = "";
      try {
        await J("voiceprint.enroll", { personId: a.personId, path: a.path, consent: !0 }), w.value = !1, y.success(t.t("声纹已采集")), await G();
      } catch (F) {
        g.value = x.errorMessage(F);
      } finally {
        c.value = !1;
      }
    }
    function O(F) {
      Object.assign(j, { personId: F || U.value, consent: !1, recorded: null }), C.value = "", P.value = !0;
    }
    async function R() {
      if (!(!j.recorded || !j.personId)) {
        c.value = !0, C.value = "";
        try {
          const F = await J("voiceprint.enrollData", {
            personId: j.personId,
            consent: !0,
            data: j.recorded.data,
            ext: j.recorded.ext
          });
          P.value = !1, y.success(F?.seconds ? t.t("声纹已采集（{s} 秒）", { s: F.seconds }) : t.t("声纹已采集")), await G();
        } catch (F) {
          C.value = x.errorMessage(F);
        } finally {
          c.value = !1;
        }
      }
    }
    return (F, K) => (e.openBlock(), e.createElementBlock("div", Qk, [
      e.createElementVNode("header", Zk, [
        e.createElementVNode("div", null, [
          e.createElementVNode(
            "h3",
            null,
            e.toDisplayString(F.$t("声纹库")),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "p",
            null,
            e.toDisplayString(F.$t("员工在企微里打开采集链接，授权同意后录 10～15 秒，用于会议发言人识别（只在本场参会人中比对）")),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode("div", Xk, [
          e.createElementVNode("button", {
            type: "button",
            class: "ss-btn",
            disabled: c.value,
            "data-test": "mm-vp-copy",
            onClick: z
          }, [
            K[16] || (K[16] = e.createElementVNode(
              "i",
              { class: "ri-link" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(F.$t("复制采集链接")),
              1
              /* TEXT */
            )
          ], 8, xk),
          e.createElementVNode("button", {
            type: "button",
            class: "ss-btn primary",
            disabled: c.value || !I.value,
            title: I.value ? "" : F.$t("未连接企微"),
            "data-test": "mm-vp-send",
            onClick: le
          }, [
            K[17] || (K[17] = e.createElementVNode(
              "i",
              { class: "ri-send-plane-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(q.value ? F.$t("发送到企微群") : F.$t("推送到企微")),
              1
              /* TEXT */
            )
          ], 8, ey)
        ])
      ]),
      I.value ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock("p", ty, [
        K[18] || (K[18] = e.createElementVNode(
          "i",
          { class: "ri-information-line" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(F.$t("未连接企微：先在「消息推送」里配置企微自建应用或群机器人才能推送；也可以复制采集链接自己发。采集链接要先在「手机端」开启手机页服务。")),
          1
          /* TEXT */
        )
      ])),
      e.createElementVNode(
        "p",
        ly,
        e.toDisplayString(F.$t("每人的采集链接都带本人令牌（等同免登），只能本人打开录自己的声纹；复制时按人一条一行。")),
        1
        /* TEXT */
      ),
      E.value ? (e.openBlock(), e.createElementBlock(
        "p",
        {
          key: 1,
          class: e.normalizeClass(["ss-note", E.value.failed.length ? "warn" : "ok"]),
          "data-test": "mm-vp-send-result"
        },
        [
          e.createElementVNode(
            "i",
            {
              class: e.normalizeClass(E.value.failed.length ? "ri-alert-line" : "ri-checkbox-circle-line")
            },
            null,
            2
            /* CLASS */
          ),
          e.createTextVNode(
            " " + e.toDisplayString(F.$t("已推送 {a} 人", { a: E.value.sent })),
            1
            /* TEXT */
          ),
          E.value.failed.length ? (e.openBlock(), e.createElementBlock(
            e.Fragment,
            { key: 0 },
            [
              e.createTextVNode(
                e.toDisplayString(F.$t("，{b} 人失败：{names}", { b: E.value.failed.length, names: E.value.failed.slice(0, 6).map((_) => F.$t("{p0}（{p1}）", { p0: V(_.personId), p1: _.error })).join(F.$t("；")) })),
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
      i.value ? (e.openBlock(), e.createElementBlock("p", ny, [
        K[19] || (K[19] = e.createElementVNode(
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
      e.createElementVNode("div", oy, [
        e.createElementVNode("div", ay, [
          e.createElementVNode(
            "b",
            null,
            e.toDisplayString(B.value),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "span",
            null,
            "/ " + e.toDisplayString(F.$t("{n} 人", { n: s.value.length })),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "small",
            null,
            e.toDisplayString(F.$t("已采集")),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode("div", sy, [
          e.createElementVNode("i", ry, [
            e.createElementVNode(
              "b",
              {
                style: e.normalizeStyle({ width: `${S.value}%` })
              },
              null,
              4
              /* STYLE */
            )
          ]),
          e.createElementVNode(
            "small",
            null,
            e.toDisplayString(F.$t("覆盖率 {p}% · 还有 {n} 人未采集", { p: S.value, n: s.value.length - B.value })),
            1
            /* TEXT */
          )
        ])
      ]),
      e.createElementVNode("div", iy, [
        e.createElementVNode("nav", cy, [
          (e.openBlock(), e.createElementBlock(
            e.Fragment,
            null,
            e.renderList(v, (_) => e.createElementVNode("button", {
              key: _.key,
              type: "button",
              role: "tab",
              "aria-selected": m.value === _.key,
              class: e.normalizeClass({ on: m.value === _.key }),
              "data-test": `mm-vp-filter-${_.key}`,
              onClick: (h) => {
                m.value = _.key, N.value = 1;
              }
            }, [
              e.createTextVNode(
                e.toDisplayString(_.title) + " ",
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "em",
                null,
                e.toDisplayString(b(_.key)),
                1
                /* TEXT */
              )
            ], 10, dy)),
            64
            /* STABLE_FRAGMENT */
          ))
        ]),
        K[23] || (K[23] = e.createElementVNode(
          "span",
          { class: "grow" },
          null,
          -1
          /* CACHED */
        )),
        e.createElementVNode("label", my, [
          K[20] || (K[20] = e.createElementVNode(
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
            "onUpdate:modelValue": K[0] || (K[0] = (_) => r.value = _),
            type: "search",
            placeholder: F.$t("搜索员工"),
            "aria-label": F.$t("搜索员工"),
            onInput: K[1] || (K[1] = (_) => N.value = 1)
          }, null, 40, uy), [
            [e.vModelText, r.value]
          ])
        ]),
        e.createElementVNode("button", {
          type: "button",
          class: "ss-btn sm",
          "data-test": "mm-vp-record",
          onClick: K[2] || (K[2] = (_) => O(U.value))
        }, [
          K[21] || (K[21] = e.createElementVNode(
            "i",
            { class: "ri-mic-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            e.toDisplayString(F.$t("现场录音")),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode("button", {
          type: "button",
          class: "ss-btn sm",
          "data-test": "mm-vp-import",
          onClick: K[3] || (K[3] = (_) => ee(""))
        }, [
          K[22] || (K[22] = e.createElementVNode(
            "i",
            { class: "ri-upload-2-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            e.toDisplayString(F.$t("导入录音代为采集")),
            1
            /* TEXT */
          )
        ])
      ]),
      e.createElementVNode("div", py, [
        e.createElementVNode("table", vy, [
          e.createElementVNode("thead", null, [
            e.createElementVNode("tr", null, [
              e.createElementVNode(
                "th",
                null,
                e.toDisplayString(F.$t("员工")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "th",
                null,
                e.toDisplayString(F.$t("部门")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "th",
                null,
                e.toDisplayString(F.$t("状态")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "th",
                null,
                e.toDisplayString(F.$t("授权时间（个保法单独同意）")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "th",
                null,
                e.toDisplayString(F.$t("采集时间")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "th",
                ky,
                e.toDisplayString(F.$t("操作")),
                1
                /* TEXT */
              )
            ])
          ]),
          e.createElementVNode("tbody", null, [
            T.value.rows.length ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock("tr", yy, [
              e.createElementVNode(
                "td",
                gy,
                e.toDisplayString(o.value ? F.$t("加载中…") : F.$t("没有符合条件的员工")),
                1
                /* TEXT */
              )
            ])),
            (e.openBlock(!0), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(T.value.rows, (_) => (e.openBlock(), e.createElementBlock("tr", {
                key: _.person.id,
                "data-test": `mm-vp-row-${_.person.id}`
              }, [
                e.createElementVNode("td", null, [
                  e.createVNode(ze, {
                    name: _.person.name
                  }, null, 8, ["name"])
                ]),
                e.createElementVNode(
                  "td",
                  null,
                  e.toDisplayString(_.deptName || "—"),
                  1
                  /* TEXT */
                ),
                e.createElementVNode("td", null, [
                  e.createElementVNode("span", Ny, [
                    e.createElementVNode(
                      "span",
                      {
                        class: e.normalizeClass(["ss-chip", _.status === "collected" ? "ok" : "warn"])
                      },
                      e.toDisplayString(_.status === "collected" ? F.$t("已采集") : F.$t("未采集")),
                      3
                      /* TEXT, CLASS */
                    ),
                    _.needsUpdate ? (e.openBlock(), e.createElementBlock("span", {
                      key: 0,
                      class: "ss-chip warn",
                      title: F.$t("这份声纹是旧模型采的。本机已装更准的声纹模型，请本人用采集链接重录一次（只要有一位参会人还是旧声纹，整场就只能用旧模型认人）"),
                      "data-test": `mm-vp-old-${_.person.id}`
                    }, e.toDisplayString(F.$t("建议重录")), 9, Vy)) : e.createCommentVNode("v-if", !0),
                    _.autoLearn ? (e.openBlock(), e.createElementBlock("span", {
                      key: 1,
                      class: "mm-sv__learn",
                      title: F.$t("确认会议发言后，用本人的发言自动补充声纹"),
                      "data-test": `mm-vp-learn-${_.person.id}`
                    }, [
                      K[24] || (K[24] = e.createElementVNode(
                        "i",
                        { class: "ri-loop-right-line" },
                        null,
                        -1
                        /* CACHED */
                      )),
                      e.createTextVNode(
                        e.toDisplayString(_.extraCount ? F.$t("会议补充 {n} 条", { n: _.extraCount }) : F.$t("会议补充已开")),
                        1
                        /* TEXT */
                      )
                    ], 8, Ey)) : e.createCommentVNode("v-if", !0)
                  ])
                ]),
                e.createElementVNode(
                  "td",
                  $y,
                  e.toDisplayString(_.consentAt ? e.unref($e)(_.consentAt, !0) : "—"),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "td",
                  by,
                  e.toDisplayString(_.enrolledAt ? e.unref($e)(_.enrolledAt) : "—"),
                  1
                  /* TEXT */
                ),
                e.createElementVNode("td", hy, [
                  _.status === "collected" ? (e.openBlock(), e.createElementBlock(
                    e.Fragment,
                    { key: 0 },
                    [
                      _.person.id === U.value ? (e.openBlock(), e.createElementBlock(
                        e.Fragment,
                        { key: 0 },
                        [
                          e.createElementVNode("button", {
                            type: "button",
                            class: "ss-link",
                            disabled: c.value,
                            "data-test": "mm-vp-learn-toggle",
                            onClick: (h) => Y(_)
                          }, e.toDisplayString(_.autoLearn ? F.$t("关闭会议补充") : F.$t("开启会议补充")), 9, _y),
                          K[25] || (K[25] = e.createElementVNode(
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
                      _.needsUpdate ? (e.openBlock(), e.createElementBlock(
                        e.Fragment,
                        { key: 1 },
                        [
                          e.createElementVNode("button", {
                            type: "button",
                            class: "ss-link",
                            disabled: c.value,
                            "data-test": `mm-vp-copy-${_.person.id}`,
                            onClick: (h) => X(_)
                          }, e.toDisplayString(F.$t("复制重录链接")), 9, By),
                          K[26] || (K[26] = e.createElementVNode(
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
                        disabled: c.value,
                        "data-test": `mm-vp-rec-${_.person.id}`,
                        onClick: (h) => O(_.person.id)
                      }, e.toDisplayString(F.$t("现场重录")), 9, Sy),
                      K[27] || (K[27] = e.createElementVNode(
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
                        disabled: c.value,
                        "data-test": `mm-vp-del-${_.person.id}`,
                        onClick: (h) => W(_)
                      }, e.toDisplayString(F.$t("删除（撤回授权）")), 9, Dy)
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
                        disabled: c.value,
                        "data-test": `mm-vp-rec-${_.person.id}`,
                        onClick: (h) => O(_.person.id)
                      }, e.toDisplayString(F.$t("现场录音")), 9, wy),
                      K[28] || (K[28] = e.createElementVNode(
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
                        disabled: c.value,
                        "data-test": `mm-vp-copy-${_.person.id}`,
                        onClick: (h) => X(_)
                      }, e.toDisplayString(F.$t("复制链接")), 9, Cy),
                      K[29] || (K[29] = e.createElementVNode(
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
                        onClick: (h) => ee(_.person.id)
                      }, e.toDisplayString(F.$t("代为采集")), 9, Ty)
                    ],
                    64
                    /* STABLE_FRAGMENT */
                  ))
                ])
              ], 8, fy))),
              128
              /* KEYED_FRAGMENT */
            ))
          ])
        ])
      ]),
      e.createElementVNode("footer", Iy, [
        e.createElementVNode(
          "span",
          null,
          e.toDisplayString(F.$t("共 {n} 人", { n: M.value.length })),
          1
          /* TEXT */
        ),
        K[32] || (K[32] = e.createElementVNode(
          "span",
          { class: "grow" },
          null,
          -1
          /* CACHED */
        )),
        T.value.pages > 1 ? (e.openBlock(), e.createElementBlock("nav", {
          key: 0,
          class: "mm-pager",
          "aria-label": F.$t("分页")
        }, [
          e.createElementVNode("button", {
            type: "button",
            disabled: T.value.page <= 1,
            "aria-label": F.$t("上一页"),
            onClick: K[4] || (K[4] = (_) => N.value = T.value.page - 1)
          }, [...K[30] || (K[30] = [
            e.createElementVNode(
              "i",
              { class: "ri-arrow-left-s-line" },
              null,
              -1
              /* CACHED */
            )
          ])], 8, Ay),
          (e.openBlock(!0), e.createElementBlock(
            e.Fragment,
            null,
            e.renderList(T.value.pages, (_) => (e.openBlock(), e.createElementBlock("button", {
              key: _,
              type: "button",
              class: e.normalizeClass({ on: _ === T.value.page }),
              "aria-current": _ === T.value.page ? "page" : void 0,
              onClick: (h) => N.value = _
            }, e.toDisplayString(_), 11, jy))),
            128
            /* KEYED_FRAGMENT */
          )),
          e.createElementVNode("button", {
            type: "button",
            disabled: T.value.page >= T.value.pages,
            "aria-label": F.$t("下一页"),
            onClick: K[5] || (K[5] = (_) => N.value = T.value.page + 1)
          }, [...K[31] || (K[31] = [
            e.createElementVNode(
              "i",
              { class: "ri-arrow-right-s-line" },
              null,
              -1
              /* CACHED */
            )
          ])], 8, Ly)
        ], 8, My)) : e.createCommentVNode("v-if", !0)
      ]),
      e.createVNode(Ze, {
        open: w.value,
        title: F.$t("导入录音代为采集"),
        icon: "ri-mic-line",
        size: "md",
        description: F.$t("管理员代员工导入一段 10～15 秒、只有本人说话的清晰录音。必须先取得本人对采集声纹的单独同意。"),
        onClose: K[9] || (K[9] = (_) => w.value = !1)
      }, {
        footer: e.withCtx(() => [
          e.createElementVNode(
            "button",
            {
              type: "button",
              class: "ss-btn",
              onClick: K[8] || (K[8] = (_) => w.value = !1)
            },
            e.toDisplayString(F.$t("取消")),
            1
            /* TEXT */
          ),
          e.createElementVNode("button", {
            type: "button",
            class: "ss-btn primary",
            disabled: c.value || !a.personId || !a.path || !a.consent,
            "data-test": "mm-vp-import-submit",
            onClick: $
          }, [
            e.createElementVNode(
              "i",
              {
                class: e.normalizeClass(c.value ? "ri-loader-4-line spin" : "ri-check-line")
              },
              null,
              2
              /* CLASS */
            ),
            e.createTextVNode(
              e.toDisplayString(F.$t("校验并采集")),
              1
              /* TEXT */
            )
          ], 8, qy)
        ]),
        default: e.withCtx(() => [
          e.createElementVNode("div", zy, [
            e.createElementVNode("div", Fy, [
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(F.$t("员工")),
                1
                /* TEXT */
              ),
              e.createVNode(we, {
                modelValue: a.personId,
                "onUpdate:modelValue": K[6] || (K[6] = (_) => a.personId = _),
                people: l.people,
                depts: l.depts,
                multiple: !1,
                "max-height": 200
              }, null, 8, ["modelValue", "people", "depts"])
            ]),
            e.createElementVNode("label", Py, [
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(F.$t("录音文件")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "input",
                {
                  ref_key: "fileEl",
                  ref: D,
                  type: "file",
                  accept: ".mp3,.m4a,.wav,.aac,.amr,.flac,.ogg,.opus,.wma,.webm,.caf,.aiff,audio/*",
                  "data-test": "mm-vp-file",
                  onChange: ne
                },
                null,
                544
                /* NEED_HYDRATION, NEED_PATCH */
              ),
              a.path ? (e.openBlock(), e.createElementBlock(
                "small",
                Uy,
                e.toDisplayString(a.path),
                1
                /* TEXT */
              )) : e.createCommentVNode("v-if", !0)
            ]),
            e.createElementVNode("label", Oy, [
              e.withDirectives(e.createElementVNode(
                "input",
                {
                  "onUpdate:modelValue": K[7] || (K[7] = (_) => a.consent = _),
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
                e.toDisplayString(F.$t("我已取得该员工本人对采集、使用声纹（含确认会议发言后用其本人发言补充声纹）的单独同意（个人信息保护法）；授权人与授权时间会记录在案。")),
                1
                /* TEXT */
              )
            ]),
            g.value ? (e.openBlock(), e.createElementBlock("p", Ry, [
              K[33] || (K[33] = e.createElementVNode(
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
          ])
        ]),
        _: 1
        /* STABLE */
      }, 8, ["open", "title", "description"]),
      e.createVNode(Ze, {
        open: P.value,
        title: F.$t("现场录音采集声纹"),
        icon: "ri-mic-line",
        size: "md",
        description: F.$t("直接用本机麦克风录 10～15 秒声音；请由被采集人本人朗读并授权同意。"),
        onClose: K[15] || (K[15] = (_) => P.value = !1)
      }, {
        footer: e.withCtx(() => [
          e.createElementVNode(
            "button",
            {
              type: "button",
              class: "ss-btn",
              onClick: K[14] || (K[14] = (_) => P.value = !1)
            },
            e.toDisplayString(F.$t("取消")),
            1
            /* TEXT */
          ),
          e.createElementVNode("button", {
            type: "button",
            class: "ss-btn primary",
            disabled: c.value || !j.personId || !j.recorded || !j.consent,
            "data-test": "mm-vp-rec-submit",
            onClick: R
          }, [
            e.createElementVNode(
              "i",
              {
                class: e.normalizeClass(c.value ? "ri-loader-4-line spin" : "ri-check-line")
              },
              null,
              2
              /* CLASS */
            ),
            e.createTextVNode(
              e.toDisplayString(F.$t("提交声纹")),
              1
              /* TEXT */
            )
          ], 8, Yy)
        ]),
        default: e.withCtx(() => [
          e.createElementVNode("div", Ky, [
            e.createElementVNode("div", Hy, [
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(F.$t("员工")),
                1
                /* TEXT */
              ),
              e.createVNode(we, {
                modelValue: j.personId,
                "onUpdate:modelValue": K[10] || (K[10] = (_) => j.personId = _),
                people: l.people,
                depts: l.depts,
                multiple: !1,
                "max-height": 180
              }, null, 8, ["modelValue", "people", "depts"])
            ]),
            P.value ? (e.openBlock(), e.createBlock(Rt, {
              key: 0,
              script: d.value,
              disabled: c.value,
              onRecorded: K[11] || (K[11] = (_) => j.recorded = _),
              onReset: K[12] || (K[12] = (_) => j.recorded = null)
            }, null, 8, ["script", "disabled"])) : e.createCommentVNode("v-if", !0),
            e.createElementVNode("label", Wy, [
              e.withDirectives(e.createElementVNode(
                "input",
                {
                  "onUpdate:modelValue": K[13] || (K[13] = (_) => j.consent = _),
                  type: "checkbox",
                  "data-test": "mm-vp-rec-consent"
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [e.vModelCheckbox, j.consent]
              ]),
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(j.personId === U.value ? F.$t("我同意采集本人的声纹（声音特征），并在我确认会议发言后用其中我本人的发言补充声纹（最多保留最近 5 条），只用于在会议纪要里识别我的发言，保存在这台电脑上，可以随时在声纹库关闭补充或删除声纹。") : F.$t("我已取得该员工本人对采集、使用声纹（含确认会议发言后用其本人发言补充声纹）的单独同意（个人信息保护法）；授权人与授权时间会记录在案。")),
                1
                /* TEXT */
              )
            ]),
            C.value ? (e.openBlock(), e.createElementBlock("p", Gy, [
              K[34] || (K[34] = e.createElementVNode(
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
}), Zy = /* @__PURE__ */ ae(Qy, [["__scopeId", "data-v-c960e8d1"]]), Xy = {
  class: "mm-so",
  "data-test": "mm-org"
}, xy = { class: "mm-sp__head" }, eg = { class: "ss-actions" }, tg = ["disabled"], lg = ["disabled"], ng = {
  key: 0,
  class: "ss-note warn"
}, og = {
  key: 1,
  class: "ss-note warn",
  "data-test": "mm-org-warnings"
}, ag = {
  key: 2,
  class: "ss-note danger"
}, sg = {
  key: 3,
  class: "mm-so__last",
  "data-test": "mm-org-last"
}, rg = { class: "mm-so__lasthead" }, ig = {
  key: 0,
  class: "ss-chip bad"
}, cg = {
  key: 0,
  class: "ss-note danger"
}, dg = { class: "mm-so__diff" }, mg = ["disabled", "aria-expanded", "onClick"], ug = {
  key: 1,
  class: "mm-so__names"
}, pg = {
  key: 4,
  class: "ss-muted"
}, vg = { class: "mm-so__cols" }, kg = ["aria-label"], yg = { class: "mm-so__cap" }, gg = ["data-test", "onClick"], fg = {
  key: 0,
  class: "ss-muted"
}, Ng = { class: "ss-table-wrap" }, Vg = { class: "ss-table" }, Eg = { key: 0 }, $g = {
  colspan: "7",
  class: "mm-so__empty"
}, bg = ["data-test"], hg = ["placeholder"], _g = ["placeholder"], Bg = { class: "mm-so__ops" }, Sg = ["disabled", "onClick"], Dg = ["title"], wg = { class: "mono" }, Cg = { class: "mm-so__ops" }, Tg = ["data-test", "onClick"], Ig = /* @__PURE__ */ e.defineComponent({
  __name: "SettingsOrg",
  props: {
    people: {},
    depts: {}
  },
  emits: ["changed"],
  setup(l, { emit: v }) {
    const n = [
      { key: "added", title: t.t("新增") },
      { key: "changed", title: t.t("变更") },
      { key: "left", title: t.t("离职") }
    ], u = l, y = v, s = ce.useNotificationStore(), o = e.ref(!1), c = e.ref(""), i = e.ref(null), k = e.ref(""), E = e.ref(""), m = e.computed(() => !!oe.value?.wecomConnected), r = (b) => oe.value?.org.source !== "demo" || !!b.wecomIdManual, N = (b) => b.mobile || b.wecomUserId && r(b) ? t.t("群消息能提醒到本人") : t.t("没有手机号和企微账号：群消息里只写姓名"), w = e.ref(""), a = e.reactive({ mobile: "", wecomUserId: "" });
    function g(b) {
      w.value = b.id, a.mobile = b.mobile || "", a.wecomUserId = b.wecomUserId && r(b) ? b.wecomUserId : "";
    }
    async function D(b) {
      o.value = !0, c.value = "";
      try {
        const M = { personId: b.id, mobile: a.mobile.trim() };
        (a.wecomUserId.trim() || r(b)) && (M.wecomUserId = a.wecomUserId.trim()), await J("org.person.contact", M), w.value = "", s.success(t.t("已保存")), y("changed");
      } catch (M) {
        c.value = x.errorMessage(M);
      } finally {
        o.value = !1;
      }
    }
    async function P() {
      o.value = !0, c.value = "";
      try {
        const b = await J("org.importFile");
        if (!b) return;
        i.value = b, s.success(t.t("导入完成：新增 {a}、变更 {b}、离职 {c}", { a: b.added.length, b: b.changed.length, c: b.left.length })), y("changed");
      } catch (b) {
        c.value = x.errorMessage(b);
      } finally {
        o.value = !1;
      }
    }
    const j = e.computed(() => i.value ?? oe.value?.org.lastSync ?? null), C = e.computed(() => u.people.filter((b) => b.deptId === E.value && !b.left)), I = (b) => u.people.find((M) => M.id === b)?.name || b, U = (b) => u.people.filter((M) => M.deptId === b && !M.left).length, q = (b) => b.leaderIds.map(I).join(t.t("、")), B = (b) => {
      const M = u.depts.find((T) => T.id === E.value);
      return M ? M.leaderIds.indexOf(b) + 1 : 0;
    };
    e.watch(() => u.depts, (b) => {
      b.some((M) => M.id === E.value) || (E.value = b[0]?.id ?? "");
    }, { immediate: !0 });
    async function S() {
      o.value = !0, c.value = "";
      try {
        const b = await J("org.sync");
        i.value = b, b?.error ? c.value = b.error : s.success(t.t("同步完成：新增 {a}、变更 {b}、离职 {c}", { a: b?.added?.length ?? 0, b: b?.changed?.length ?? 0, c: b?.left?.length ?? 0 })), y("changed");
      } catch (b) {
        c.value = x.errorMessage(b);
      } finally {
        o.value = !1;
      }
    }
    return (b, M) => (e.openBlock(), e.createElementBlock("div", Xy, [
      e.createElementVNode("header", xy, [
        e.createElementVNode("div", null, [
          e.createElementVNode(
            "h3",
            null,
            e.toDisplayString(b.$t("通讯录同步")),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "p",
            null,
            e.toDisplayString(b.$t("人员只来自企微通讯录：部门、部门负责人（任务下发给第一位）、成员、职务、直属上级。系统内不维护人员信息；离职人员保留历史数据，不能再被选。")),
            1
            /* TEXT */
          ),
          e.createElementVNode("p", null, [
            e.createTextVNode(
              e.toDisplayString(b.$t("没有企微自建应用时，可以导入企微管理后台导出的通讯录表格（通讯录 → 批量导入/导出 → 导出成员）。群消息按手机号或企微账号提醒本人，表里没有的可以在下面逐个填。")) + " ",
              1
              /* TEXT */
            ),
            e.createElementVNode("button", {
              type: "button",
              class: "ss-link",
              "data-test": "mm-org-link-contacts",
              onClick: M[0] || (M[0] = (T) => e.unref(pe)(e.unref(Ve).contacts))
            }, [
              e.createTextVNode(
                e.toDisplayString(b.$t("去企微后台导出")) + " ",
                1
                /* TEXT */
              ),
              M[4] || (M[4] = e.createElementVNode(
                "i",
                { class: "ri-external-link-line" },
                null,
                -1
                /* CACHED */
              ))
            ])
          ])
        ]),
        e.createElementVNode("div", eg, [
          e.createElementVNode("button", {
            type: "button",
            class: "ss-btn",
            disabled: o.value,
            "data-test": "mm-org-import",
            onClick: P
          }, [
            M[5] || (M[5] = e.createElementVNode(
              "i",
              { class: "ri-file-excel-2-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(b.$t("导入通讯录表格")),
              1
              /* TEXT */
            )
          ], 8, tg),
          e.createElementVNode("button", {
            type: "button",
            class: "ss-btn primary",
            disabled: o.value,
            "data-test": "mm-org-sync",
            onClick: S
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
              e.toDisplayString(b.$t("立即同步")),
              1
              /* TEXT */
            )
          ], 8, lg)
        ])
      ]),
      m.value ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock("p", ng, [
        M[6] || (M[6] = e.createElementVNode(
          "i",
          { class: "ri-information-line" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(b.$t("未连接企微：「立即同步」会载入演示组织。到「消息推送」里填好 CorpID / AgentID / Secret 后再同步，就是真实通讯录。")),
          1
          /* TEXT */
        )
      ])),
      j.value?.warnings?.length ? (e.openBlock(), e.createElementBlock("div", og, [
        M[7] || (M[7] = e.createElementVNode(
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
            e.renderList(j.value.warnings, (T, G) => (e.openBlock(), e.createElementBlock(
              "p",
              { key: G },
              e.toDisplayString(T),
              1
              /* TEXT */
            ))),
            128
            /* KEYED_FRAGMENT */
          ))
        ])
      ])) : e.createCommentVNode("v-if", !0),
      c.value ? (e.openBlock(), e.createElementBlock("p", ag, [
        M[8] || (M[8] = e.createElementVNode(
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
      ])) : e.createCommentVNode("v-if", !0),
      j.value ? (e.openBlock(), e.createElementBlock("section", sg, [
        e.createElementVNode("div", rg, [
          e.createElementVNode(
            "strong",
            null,
            e.toDisplayString(b.$t("上次同步")),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "span",
            null,
            e.toDisplayString(e.unref($e)(j.value.at)),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "span",
            null,
            e.toDisplayString(b.$t("操作人 {name}", { name: I(j.value.by) })),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "span",
            {
              class: e.normalizeClass(["ss-chip", j.value.source === "demo" ? "brand" : "ok"])
            },
            e.toDisplayString(j.value.source === "wecom" ? b.$t("企微通讯录") : j.value.source === "import" ? b.$t("导入的通讯录") : b.$t("演示组织")),
            3
            /* TEXT, CLASS */
          ),
          j.value.error ? (e.openBlock(), e.createElementBlock(
            "span",
            ig,
            e.toDisplayString(b.$t("同步出错")),
            1
            /* TEXT */
          )) : e.createCommentVNode("v-if", !0)
        ]),
        j.value.error ? (e.openBlock(), e.createElementBlock(
          "p",
          cg,
          e.toDisplayString(j.value.error),
          1
          /* TEXT */
        )) : e.createCommentVNode("v-if", !0),
        e.createElementVNode("ul", dg, [
          (e.openBlock(), e.createElementBlock(
            e.Fragment,
            null,
            e.renderList(n, (T) => e.createElementVNode(
              "li",
              {
                key: T.key,
                class: e.normalizeClass(T.key)
              },
              [
                e.createElementVNode("button", {
                  type: "button",
                  disabled: !j.value[T.key].length,
                  "aria-expanded": k.value === T.key,
                  onClick: (G) => k.value = k.value === T.key ? "" : T.key
                }, [
                  e.createElementVNode(
                    "b",
                    null,
                    e.toDisplayString(j.value[T.key].length),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "small",
                    null,
                    e.toDisplayString(T.title),
                    1
                    /* TEXT */
                  )
                ], 8, mg)
              ],
              2
              /* CLASS */
            )),
            64
            /* STABLE_FRAGMENT */
          ))
        ]),
        k.value && j.value[k.value].length ? (e.openBlock(), e.createElementBlock(
          "p",
          ug,
          e.toDisplayString(j.value[k.value].map(I).join(b.$t("、"))),
          1
          /* TEXT */
        )) : e.createCommentVNode("v-if", !0)
      ])) : (e.openBlock(), e.createElementBlock(
        "p",
        pg,
        e.toDisplayString(b.$t("还没有同步过")),
        1
        /* TEXT */
      )),
      e.createElementVNode("div", vg, [
        e.createElementVNode("nav", {
          class: "mm-so__depts",
          "aria-label": b.$t("部门")
        }, [
          e.createElementVNode(
            "p",
            yg,
            e.toDisplayString(b.$t("部门（{n}）", { n: l.depts.length })),
            1
            /* TEXT */
          ),
          (e.openBlock(!0), e.createElementBlock(
            e.Fragment,
            null,
            e.renderList(l.depts, (T) => (e.openBlock(), e.createElementBlock("button", {
              key: T.id,
              type: "button",
              class: e.normalizeClass({ on: E.value === T.id }),
              "data-test": `mm-org-dept-${T.id}`,
              onClick: (G) => E.value = T.id
            }, [
              e.createElementVNode(
                "strong",
                null,
                e.toDisplayString(T.name),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "small",
                null,
                e.toDisplayString(b.$t("{n} 人", { n: U(T.id) })) + " · " + e.toDisplayString(b.$t("负责人 {names}", { names: q(T) || "—" })),
                1
                /* TEXT */
              )
            ], 10, gg))),
            128
            /* KEYED_FRAGMENT */
          )),
          l.depts.length ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock(
            "p",
            fg,
            e.toDisplayString(b.$t("还没有部门")),
            1
            /* TEXT */
          ))
        ], 8, kg),
        e.createElementVNode("div", Ng, [
          e.createElementVNode("table", Vg, [
            e.createElementVNode("thead", null, [
              e.createElementVNode("tr", null, [
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(b.$t("姓名")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(b.$t("职务")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(b.$t("直属上级")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(b.$t("部门负责人")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(b.$t("企微账号")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(b.$t("手机号")),
                  1
                  /* TEXT */
                ),
                M[9] || (M[9] = e.createElementVNode(
                  "th",
                  null,
                  null,
                  -1
                  /* CACHED */
                ))
              ])
            ]),
            e.createElementVNode("tbody", null, [
              C.value.length ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock("tr", Eg, [
                e.createElementVNode(
                  "td",
                  $g,
                  e.toDisplayString(b.$t("这个部门没有成员")),
                  1
                  /* TEXT */
                )
              ])),
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(C.value, (T) => (e.openBlock(), e.createElementBlock("tr", {
                  key: T.id,
                  "data-test": `mm-org-row-${T.id}`
                }, [
                  e.createElementVNode("td", null, [
                    e.createVNode(ze, {
                      name: T.name
                    }, null, 8, ["name"])
                  ]),
                  e.createElementVNode(
                    "td",
                    null,
                    e.toDisplayString(T.title || "—"),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "td",
                    null,
                    e.toDisplayString(T.leaderId ? I(T.leaderId) : "—"),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode("td", null, [
                    B(T.id) > 0 ? (e.openBlock(), e.createElementBlock(
                      "span",
                      {
                        key: 0,
                        class: e.normalizeClass(["ss-chip", B(T.id) === 1 ? "brand" : ""])
                      },
                      e.toDisplayString(B(T.id) === 1 ? b.$t("第一负责人") : b.$t("负责人 {n}", { n: B(T.id) })),
                      3
                      /* TEXT, CLASS */
                    )) : e.createCommentVNode("v-if", !0)
                  ]),
                  w.value === T.id ? (e.openBlock(), e.createElementBlock(
                    e.Fragment,
                    { key: 0 },
                    [
                      e.createElementVNode("td", null, [
                        e.withDirectives(e.createElementVNode("input", {
                          "onUpdate:modelValue": M[1] || (M[1] = (G) => a.wecomUserId = G),
                          class: "mm-so__in mono",
                          placeholder: b.$t("企微账号"),
                          spellcheck: "false",
                          "data-test": "mm-org-edit-uid"
                        }, null, 8, hg), [
                          [e.vModelText, a.wecomUserId]
                        ])
                      ]),
                      e.createElementVNode("td", null, [
                        e.withDirectives(e.createElementVNode("input", {
                          "onUpdate:modelValue": M[2] || (M[2] = (G) => a.mobile = G),
                          class: "mm-so__in mono",
                          type: "tel",
                          placeholder: b.$t("手机号"),
                          "data-test": "mm-org-edit-mobile"
                        }, null, 8, _g), [
                          [e.vModelText, a.mobile]
                        ])
                      ]),
                      e.createElementVNode("td", Bg, [
                        e.createElementVNode("button", {
                          type: "button",
                          class: "ss-link",
                          disabled: o.value,
                          "data-test": "mm-org-edit-save",
                          onClick: (G) => D(T)
                        }, e.toDisplayString(b.$t("保存")), 9, Sg),
                        e.createElementVNode(
                          "button",
                          {
                            type: "button",
                            class: "ss-link",
                            onClick: M[3] || (M[3] = (G) => w.value = "")
                          },
                          e.toDisplayString(b.$t("取消")),
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
                        title: N(T)
                      }, e.toDisplayString(T.wecomUserId && r(T) ? T.wecomUserId : "—"), 9, Dg),
                      e.createElementVNode(
                        "td",
                        wg,
                        e.toDisplayString(T.mobile || "—"),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode("td", Cg, [
                        e.createElementVNode("button", {
                          type: "button",
                          class: "ss-link",
                          "data-test": `mm-org-edit-${T.id}`,
                          onClick: (G) => g(T)
                        }, e.toDisplayString(b.$t("编辑")), 9, Tg)
                      ])
                    ],
                    64
                    /* STABLE_FRAGMENT */
                  ))
                ], 8, bg))),
                128
                /* KEYED_FRAGMENT */
              ))
            ])
          ])
        ])
      ])
    ]));
  }
}), Mg = /* @__PURE__ */ ae(Ig, [["__scopeId", "data-v-8cd11796"]]), Ag = {
  class: "mm-sr",
  "data-test": "mm-roles"
}, jg = { class: "mm-sp__head" }, Lg = {
  key: 0,
  class: "ss-note danger"
}, zg = { class: "mm-sr__cols" }, Fg = { class: "mm-sr__card" }, Pg = { class: "ss-muted" }, Ug = { class: "mm-sr__card" }, Og = { class: "ss-muted" }, Rg = {
  key: 1,
  class: "ss-note warn"
}, qg = { class: "ss-actions" }, Kg = ["disabled"], Hg = /* @__PURE__ */ e.defineComponent({
  __name: "SettingsRoles",
  props: {
    settings: {},
    people: {},
    depts: {}
  },
  emits: ["saved"],
  setup(l, { emit: v }) {
    const n = l, u = v, y = Be.useDialog(), s = ce.useNotificationStore(), o = e.ref(!1), c = e.ref(""), i = e.reactive({ adminIds: [], projectCreatorIds: [] }), k = (a, g) => a.length === g.length && a.every((D) => g.includes(D)), E = e.computed(() => !k(i.adminIds, n.settings.adminIds) || !k(i.projectCreatorIds, n.settings.projectCreatorIds)), m = e.computed(() => oe.value?.me.person?.id || ""), r = e.computed(() => !!m.value && n.settings.adminIds.includes(m.value) && !i.adminIds.includes(m.value));
    function N() {
      i.adminIds = [...n.settings.adminIds], i.projectCreatorIds = [...n.settings.projectCreatorIds];
    }
    e.watch(() => n.settings, N, { immediate: !0 });
    async function w() {
      if (!(r.value && !await y.confirm({ title: t.t("去掉自己的管理员"), message: t.t("保存后你将无法再进入系统设置，确定吗？"), danger: !0 }))) {
        o.value = !0, c.value = "";
        try {
          const a = await J("settings.save", { patch: { adminIds: i.adminIds, projectCreatorIds: i.projectCreatorIds } });
          s.success(t.t("角色权限已保存")), u("saved", a);
        } catch (a) {
          c.value = x.errorMessage(a);
        } finally {
          o.value = !1;
        }
      }
    }
    return (a, g) => (e.openBlock(), e.createElementBlock("div", Ag, [
      e.createElementVNode("header", jg, [
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
      c.value ? (e.openBlock(), e.createElementBlock("p", Lg, [
        g[2] || (g[2] = e.createElementVNode(
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
      ])) : e.createCommentVNode("v-if", !0),
      e.createElementVNode("div", zg, [
        e.createElementVNode("section", Fg, [
          e.createElementVNode(
            "h4",
            null,
            e.toDisplayString(a.$t("管理员（{n}）", { n: i.adminIds.length })),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "p",
            Pg,
            e.toDisplayString(a.$t("管理员可以进入系统设置、代办与演示时切换当前身份，也可以新建项目。至少保留一位。")),
            1
            /* TEXT */
          ),
          e.createVNode(we, {
            modelValue: i.adminIds,
            "onUpdate:modelValue": g[0] || (g[0] = (D) => i.adminIds = D),
            people: l.people,
            depts: l.depts,
            "max-height": 260
          }, null, 8, ["modelValue", "people", "depts"])
        ]),
        e.createElementVNode("section", Ug, [
          e.createElementVNode(
            "h4",
            null,
            e.toDisplayString(a.$t("可新建项目的人（{n}）", { n: i.projectCreatorIds.length })),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "p",
            Og,
            e.toDisplayString(a.$t("除管理员外，还有谁可以新建项目；建项目时指定的项目负责人不需要在这里。")),
            1
            /* TEXT */
          ),
          e.createVNode(we, {
            modelValue: i.projectCreatorIds,
            "onUpdate:modelValue": g[1] || (g[1] = (D) => i.projectCreatorIds = D),
            people: l.people,
            depts: l.depts,
            "max-height": 260
          }, null, 8, ["modelValue", "people", "depts"])
        ])
      ]),
      r.value ? (e.openBlock(), e.createElementBlock("p", Rg, [
        g[3] || (g[3] = e.createElementVNode(
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
      e.createElementVNode("div", qg, [
        e.createElementVNode("button", {
          type: "button",
          class: "ss-btn primary",
          disabled: o.value || !E.value || !i.adminIds.length,
          "data-test": "mm-roles-save",
          onClick: w
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
        ], 8, Kg),
        E.value ? (e.openBlock(), e.createElementBlock(
          "button",
          {
            key: 0,
            type: "button",
            class: "ss-link",
            onClick: N
          },
          e.toDisplayString(a.$t("撤销修改")),
          1
          /* TEXT */
        )) : e.createCommentVNode("v-if", !0)
      ])
    ]));
  }
}), Wg = /* @__PURE__ */ ae(Hg, [["__scopeId", "data-v-cae13c9f"]]), Gg = {
  class: "mm-asr",
  "data-test": "mm-asr"
}, Yg = ["aria-label"], Jg = ["aria-checked"], Qg = ["aria-checked"], Zg = {
  key: 0,
  class: "ss-muted"
}, Xg = { class: "mm-asr__tag" }, xg = {
  key: 0,
  class: "ss-chip ok",
  "data-test": "mm-asr-best-ready"
}, ef = { class: "mm-asr__facts" }, tf = {
  key: 0,
  class: "ss-note warn mm-asr__why"
}, lf = { class: "mm-asr__act" }, nf = ["disabled"], of = { key: 0 }, af = ["disabled"], sf = {
  class: "mm-asr__more",
  "data-test": "mm-asr-more"
}, rf = { class: "ss-table-wrap" }, cf = { class: "ss-table mm-asr__table" }, df = { class: "num" }, mf = { class: "num" }, uf = { class: "num" }, pf = { class: "num" }, vf = { class: "num" }, kf = ["data-test"], yf = { class: "num" }, gf = { class: "num" }, ff = { class: "num" }, Nf = { class: "num" }, Vf = { class: "num" }, Ef = { class: "mm-asr__cell-act" }, $f = { class: "ss-chip ok" }, bf = ["disabled", "data-test", "onClick"], hf = ["disabled", "data-test", "onClick"], _f = {
  key: 2,
  class: "ss-muted"
}, Bf = { class: "ss-muted mm-asr__src" }, Sf = { class: "ss-field mm-asr__pref" }, Df = { value: "auto" }, wf = {
  key: 2,
  class: "mm-asr__cloud",
  "data-test": "mm-asr-cloud"
}, Cf = { class: "ss-field" }, Tf = { value: "dashscope" }, If = { value: "siliconflow" }, Mf = { value: "custom" }, Af = { class: "ss-field" }, jf = { class: "ss-field" }, Lf = { id: "mm-asr-models" }, zf = ["value"], Ff = { class: "ss-field" }, Pf = {
  key: 0,
  class: "mm-asr__set"
}, Uf = { class: "mm-asr__secret" }, Of = ["type", "placeholder"], Rf = ["title"], qf = { class: "ss-note info" }, Kf = { class: "mm-asr__act" }, Hf = ["disabled"], Wf = ["disabled"], Gf = ["disabled"], Yf = {
  key: 3,
  class: "mm-asr__bar",
  "data-test": "mm-asr-bar"
}, Jf = {
  key: 4,
  class: "ss-muted mono mm-asr__log",
  "data-test": "mm-asr-log"
}, Qf = {
  key: 5,
  class: "ss-note danger",
  "data-test": "mm-asr-error"
}, Zf = /* @__PURE__ */ e.defineComponent({
  __name: "AsrModelPicker",
  emits: ["changed"],
  setup(l, { expose: v, emit: n }) {
    const u = n, y = ce.useNotificationStore(), s = e.ref(null), o = e.ref(!1), c = e.ref(!1), i = e.ref(""), k = e.ref(""), E = e.ref(""), m = e.ref(""), r = e.ref(null), N = /* @__PURE__ */ new Set(["asr-meeting-sensevoice", "asr-meeting-firered2"]), w = e.ref("local"), a = e.ref("auto"), g = e.reactive({ provider: "dashscope", baseUrl: "", model: "", apiKey: "" }), D = e.ref(!1), P = e.ref(""), j = e.ref(!1), C = e.computed(() => s.value?.asr.presets ?? []), I = e.computed(() => C.value.find((_) => _.id === g.provider)), U = e.computed(() => I.value?.models ?? []), q = e.computed(() => I.value?.keyUrl || ""), B = e.computed(() => !!s.value?.models.asrReady), S = e.computed(() => s.value?.recommend.engine === "firered" ? { title: t.t("FireRedASR2（最准）+ SenseVoice 兜底"), desc: t.t("实测最准的本机模型：普通话、各地口音、吴语 / 上海话 / 闽南语 / 粤语和专业名词都明显好于以前的 Whisper。嘈杂片段自动换 SenseVoice 的结果，不会出乱码。") } : { title: t.t("SenseVoice（快速）"), desc: t.t("又快又小：普通话、口音和粤语都认，带标点，比以前的 Whisper 准一倍，1 小时录音一两分钟转完。") }), b = e.computed(() => {
      const _ = s.value?.recommend, h = s.value?.hardware;
      if (!_?.downgradeReason || !h) return "";
      const f = _.downgradeReason === "memory" ? t.t("内存 {n} GB", { n: h.memGb }) : _.downgradeReason === "cores" ? t.t("处理器 {n} 核", { n: h.cores }) : t.t("磁盘只剩 {n} GB", { n: h.freeDiskGb ?? 0 });
      return t.t("最准的 FireRedASR2 需要 16 GB 以上内存、8 核以上处理器和约 1.5 GB 磁盘，这台电脑{why}，所以推荐 SenseVoice。", { why: f });
    }), M = e.computed(() => {
      const _ = s.value;
      if (!_) return [];
      const h = _.estimates;
      return [
        { key: "firered", name: "FireRedASR2", note: t.t("最准，含方言"), room: "12.5%", phone: "10.6%", wu: "18.5%", time: h ? t.t("约 {n} 分钟", { n: h.firered }) : "—", size: "1.2 GB", ready: !!_.models.fireRed, installId: "asr-meeting-firered2" },
        { key: "sensevoice", name: "SenseVoice", note: t.t("快、小，也做兜底"), room: "14.3%", phone: "20.3%", wu: "34.5%", time: h ? t.t("约 {n} 分钟", { n: h.sensevoice }) : "—", size: "228 MB", ready: !!_.models.senseVoice, installId: "asr-meeting-sensevoice" },
        { key: "whisper", name: "Whisper large-v3", note: t.t("只在阿拉伯语等其他语种时用"), room: "31.7%", phone: "34.5%", wu: "77.7%", time: t.t("约 16 分钟"), size: "2.9 GB", ready: _.models.asrModel === "large-v3", installId: "" }
      ];
    });
    function T(_) {
      w.value = _.asr.mode, a.value = _.asr.localModel;
      const h = _.asr.cloud, f = h?.provider ?? "dashscope", L = _.asr.presets.find((Q) => Q.id === f);
      Object.assign(g, { provider: f, baseUrl: h?.baseUrl ?? L?.baseUrl ?? "", model: h?.model ?? L?.models[0] ?? "", apiKey: "" });
    }
    function G(_) {
      if (!_) return;
      const h = _.activeId && N.has(_.activeId) ? _.activeId : (_.queue || []).find((L) => N.has(L)) || "", f = !!E.value;
      E.value = h, h ? (m.value = _.line || t.t("正在下载…"), r.value = typeof _.percent == "number" ? _.percent : null, k.value = "") : (r.value = null, _.error ? (k.value = _.error, m.value = "") : f && (m.value = _.line || t.t("下载完成")));
    }
    async function V() {
      o.value = !0;
      try {
        const _ = await J("setup.status");
        s.value = _, _ && (T(_), G(_.modelDownload)), _?.modelDownload?.error || (k.value = "");
      } catch (_) {
        k.value = x.errorMessage(_);
      } finally {
        o.value = !1;
      }
    }
    async function d(_, h) {
      c.value = !0, i.value = _, k.value = "";
      try {
        await h();
      } catch (f) {
        k.value = x.errorMessage(f);
      } finally {
        c.value = !1, i.value = "";
      }
    }
    function p(_) {
      if (P.value = "", _ === "cloud") {
        w.value = "cloud";
        return;
      }
      w.value = "local", s.value?.asr.mode !== "local" && z();
    }
    function z() {
      return d("mode", async () => {
        const _ = await J("asr.mode.save", { mode: w.value === "cloud" ? "cloud" : "local", localModel: a.value });
        s.value && _ && (s.value.asr = _), u("changed");
      });
    }
    function X() {
      const _ = I.value;
      g.baseUrl = _?.baseUrl ?? "", g.model = _?.models[0] ?? "", P.value = "";
    }
    function le() {
      return { provider: g.provider, baseUrl: g.baseUrl.trim(), model: g.model.trim(), apiKey: g.apiKey.trim() };
    }
    function W() {
      return P.value = "", d("test", async () => {
        const _ = await J("asr.cloud.test", le());
        j.value = !!_?.ok, P.value = _?.ok ? t.t("连接正常（{n} 毫秒），地址、模型和 API Key 都对", { n: _.ms ?? 0 }) : _?.error || t.t("连接失败");
      });
    }
    function Y() {
      return d("save", async () => {
        await J("asr.cloud.save", le());
        const _ = await J("asr.mode.save", { mode: "cloud", localModel: a.value });
        s.value && _ && (s.value.asr = _), g.apiKey = "", D.value = !1, y.success(t.t("已改为在线接口转写")), u("changed");
      });
    }
    function ee() {
      return window.confirm(t.t("清除在线接口和保存的 API Key？会议转写会改回本机模型。")) ? d("clear", async () => {
        const _ = await J("asr.cloud.save", { clear: !0 });
        s.value && _ && (s.value.asr = _, T(s.value)), u("changed");
      }) : Promise.resolve();
    }
    async function ne() {
      if (D.value) {
        D.value = !1;
        return;
      }
      if (!g.apiKey && s.value?.asr.cloud?.hasKey)
        try {
          g.apiKey = (await J("asr.cloud.reveal"))?.apiKey || "";
        } catch (_) {
          k.value = x.errorMessage(_);
          return;
        }
      D.value = !0;
    }
    function $() {
      pe(q.value);
    }
    const O = () => window.electronAPI?.pyExt;
    async function R(_, h = !1) {
      const f = h ? [..._] : _.filter((Q) => !(Q === "asr-meeting-firered2" && s.value?.models.fireRed) && !(Q === "asr-meeting-sensevoice" && s.value?.models.senseVoice));
      if (!f.length) {
        m.value = t.t("下载完成"), u("changed");
        return;
      }
      k.value = "", E.value = f[0], r.value = 0, m.value = t.t("开始下载…");
      try {
        const Q = await J("model.download.start", { ids: f, ...h ? { force: !0 } : {} });
        G(Q);
        return;
      } catch (Q) {
        const Z = x.errorMessage(Q);
        if (!/未知操作|unexpected action/i.test(Z)) {
          E.value = "", r.value = null, k.value = Z;
          return;
        }
      }
      const L = O();
      if (!L?.install) {
        E.value = "", r.value = null, k.value = t.t("组件安装器不可用，请到应用的 设置 → 语音 里下载");
        return;
      }
      try {
        for (const Q of f) {
          E.value = Q, m.value = t.t("开始下载…"), h && L.remove && await L.remove(Q);
          const Z = await L.install(Q);
          if (!Z?.ok) {
            k.value = Z?.error || t.t("下载失败");
            break;
          }
          await V();
        }
        k.value || (m.value = t.t("下载完成")), u("changed");
      } catch (Q) {
        k.value = x.errorMessage(Q);
      } finally {
        E.value = "", r.value = null;
      }
    }
    let F = null, K = null;
    return e.onMounted(() => {
      V(), K = _e((h) => {
        if (h.type !== "model_download") return;
        const f = E.value;
        G(h.status), f && !E.value && V().then(() => u("changed"));
      });
      const _ = O();
      _?.onInstallProgress && (F = _.onInstallProgress((h) => {
        h?.id && h.id === E.value && h.line && (m.value = String(h.line).slice(0, 200));
      }));
    }), e.onBeforeUnmount(() => {
      try {
        F?.();
      } catch {
      }
      try {
        K?.();
      } catch {
      }
    }), v({ reload: V }), (_, h) => (e.openBlock(), e.createElementBlock("section", Gg, [
      e.createElementVNode("div", {
        class: "mm-asr__modes",
        role: "radiogroup",
        "aria-label": _.$t("转写方式")
      }, [
        e.createElementVNode("button", {
          type: "button",
          role: "radio",
          "aria-checked": w.value !== "cloud",
          class: e.normalizeClass({ on: w.value !== "cloud" }),
          "data-test": "mm-asr-mode-local",
          onClick: h[0] || (h[0] = (f) => p("local"))
        }, [
          h[10] || (h[10] = e.createElementVNode(
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
              e.toDisplayString(_.$t("本机模型")),
              1
              /* TEXT */
            ),
            e.createElementVNode(
              "small",
              null,
              e.toDisplayString(_.$t("推荐 · 录音不出这台电脑")),
              1
              /* TEXT */
            )
          ])
        ], 10, Jg),
        e.createElementVNode("button", {
          type: "button",
          role: "radio",
          "aria-checked": w.value === "cloud",
          class: e.normalizeClass({ on: w.value === "cloud" }),
          "data-test": "mm-asr-mode-cloud",
          onClick: h[1] || (h[1] = (f) => p("cloud"))
        }, [
          h[11] || (h[11] = e.createElementVNode(
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
              e.toDisplayString(_.$t("在线接口")),
              1
              /* TEXT */
            ),
            e.createElementVNode(
              "small",
              null,
              e.toDisplayString(_.$t("填自己的语音识别 API")),
              1
              /* TEXT */
            )
          ])
        ], 10, Qg)
      ], 8, Yg),
      o.value && !s.value ? (e.openBlock(), e.createElementBlock("p", Zg, [
        h[12] || (h[12] = e.createElementVNode(
          "i",
          { class: "ri-loader-4-line spin" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          " " + e.toDisplayString(_.$t("正在检测这台电脑…")),
          1
          /* TEXT */
        )
      ])) : s.value && w.value !== "cloud" ? (e.openBlock(), e.createElementBlock(
        e.Fragment,
        { key: 1 },
        [
          e.createElementVNode(
            "article",
            {
              class: e.normalizeClass(["mm-asr__best", { ready: B.value }]),
              "data-test": "mm-asr-best"
            },
            [
              e.createElementVNode("header", null, [
                e.createElementVNode("span", Xg, [
                  h[13] || (h[13] = e.createElementVNode(
                    "i",
                    { class: "ri-medal-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(_.$t("为这台电脑推荐")),
                    1
                    /* TEXT */
                  )
                ]),
                B.value ? (e.openBlock(), e.createElementBlock(
                  "span",
                  xg,
                  e.toDisplayString(_.$t("已就绪")),
                  1
                  /* TEXT */
                )) : e.createCommentVNode("v-if", !0)
              ]),
              e.createElementVNode(
                "h4",
                null,
                e.toDisplayString(S.value.title),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "p",
                null,
                e.toDisplayString(S.value.desc),
                1
                /* TEXT */
              ),
              e.createElementVNode("ul", ef, [
                e.createElementVNode("li", null, [
                  h[14] || (h[14] = e.createElementVNode(
                    "i",
                    { class: "ri-hard-drive-2-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(_.$t("约 {n} MB", { n: s.value.recommend.sizeMb })),
                    1
                    /* TEXT */
                  )
                ]),
                e.createElementVNode("li", null, [
                  h[15] || (h[15] = e.createElementVNode(
                    "i",
                    { class: "ri-timer-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(_.$t("1 小时录音约 {n} 分钟", { n: s.value.recommend.estMinPerHour })),
                    1
                    /* TEXT */
                  )
                ]),
                e.createElementVNode("li", null, [
                  h[16] || (h[16] = e.createElementVNode(
                    "i",
                    { class: "ri-shield-check-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(_.$t("全程在本机")),
                    1
                    /* TEXT */
                  )
                ])
              ]),
              s.value.recommend.downgradeReason ? (e.openBlock(), e.createElementBlock("p", tf, [
                h[17] || (h[17] = e.createElementVNode(
                  "i",
                  { class: "ri-information-line" },
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
              e.createElementVNode("div", lf, [
                B.value ? (e.openBlock(), e.createElementBlock("button", {
                  key: 1,
                  type: "button",
                  class: "ss-btn sm",
                  disabled: !!E.value,
                  "data-test": "mm-asr-best-reinstall",
                  onClick: h[3] || (h[3] = (f) => R(s.value.recommend.installIds, !0))
                }, [
                  e.createElementVNode(
                    "i",
                    {
                      class: e.normalizeClass(E.value ? "ri-loader-4-line spin" : "ri-refresh-line")
                    },
                    null,
                    2
                    /* CLASS */
                  ),
                  e.createTextVNode(
                    e.toDisplayString(_.$t("重新下载")),
                    1
                    /* TEXT */
                  )
                ], 8, af)) : (e.openBlock(), e.createElementBlock(
                  e.Fragment,
                  { key: 0 },
                  [
                    e.createElementVNode("button", {
                      type: "button",
                      class: "ss-btn primary",
                      disabled: !!E.value,
                      "data-test": "mm-asr-best-install",
                      onClick: h[2] || (h[2] = (f) => R(s.value.recommend.installIds))
                    }, [
                      e.createElementVNode(
                        "i",
                        {
                          class: e.normalizeClass(E.value ? "ri-loader-4-line spin" : "ri-download-2-line")
                        },
                        null,
                        2
                        /* CLASS */
                      ),
                      e.createTextVNode(
                        e.toDisplayString(_.$t("一键下载")),
                        1
                        /* TEXT */
                      )
                    ], 8, nf),
                    s.value.recommend.installIds.length > 1 ? (e.openBlock(), e.createElementBlock(
                      "small",
                      of,
                      e.toDisplayString(_.$t("会依次下载 SenseVoice（嘈杂片段的兜底）和 FireRedASR2")),
                      1
                      /* TEXT */
                    )) : e.createCommentVNode("v-if", !0)
                  ],
                  64
                  /* STABLE_FRAGMENT */
                ))
              ])
            ],
            2
            /* CLASS */
          ),
          e.createElementVNode("details", sf, [
            e.createElementVNode(
              "summary",
              null,
              e.toDisplayString(_.$t("全部本机模型与实测对比")),
              1
              /* TEXT */
            ),
            e.createElementVNode("div", rf, [
              e.createElementVNode("table", cf, [
                e.createElementVNode("thead", null, [
                  e.createElementVNode("tr", null, [
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(_.$t("模型")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      df,
                      e.toDisplayString(_.$t("会议室录音")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      mf,
                      e.toDisplayString(_.$t("电话音质")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      uf,
                      e.toDisplayString(_.$t("吴语方言")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      pf,
                      e.toDisplayString(_.$t("1 小时耗时")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      vf,
                      e.toDisplayString(_.$t("体积")),
                      1
                      /* TEXT */
                    ),
                    h[18] || (h[18] = e.createElementVNode(
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
                    e.renderList(M.value, (f) => (e.openBlock(), e.createElementBlock("tr", {
                      key: f.key,
                      "data-test": `mm-asr-row-${f.key}`
                    }, [
                      e.createElementVNode("td", null, [
                        e.createElementVNode(
                          "strong",
                          null,
                          e.toDisplayString(f.name),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "small",
                          null,
                          e.toDisplayString(f.note),
                          1
                          /* TEXT */
                        )
                      ]),
                      e.createElementVNode(
                        "td",
                        yf,
                        e.toDisplayString(f.room),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "td",
                        gf,
                        e.toDisplayString(f.phone),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "td",
                        ff,
                        e.toDisplayString(f.wu),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "td",
                        Nf,
                        e.toDisplayString(f.time),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "td",
                        Vf,
                        e.toDisplayString(f.size),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode("td", Ef, [
                        f.ready ? (e.openBlock(), e.createElementBlock(
                          e.Fragment,
                          { key: 0 },
                          [
                            e.createElementVNode(
                              "span",
                              $f,
                              e.toDisplayString(_.$t("已下载")),
                              1
                              /* TEXT */
                            ),
                            f.installId ? (e.openBlock(), e.createElementBlock("button", {
                              key: 0,
                              type: "button",
                              class: "ss-btn sm",
                              disabled: !!E.value,
                              "data-test": `mm-asr-reinstall-${f.key}`,
                              onClick: (L) => R([f.installId], !0)
                            }, [
                              e.createElementVNode(
                                "i",
                                {
                                  class: e.normalizeClass(E.value === f.installId ? "ri-loader-4-line spin" : "ri-refresh-line")
                                },
                                null,
                                2
                                /* CLASS */
                              ),
                              e.createTextVNode(
                                e.toDisplayString(_.$t("重新下载")),
                                1
                                /* TEXT */
                              )
                            ], 8, bf)) : e.createCommentVNode("v-if", !0)
                          ],
                          64
                          /* STABLE_FRAGMENT */
                        )) : f.installId ? (e.openBlock(), e.createElementBlock("button", {
                          key: 1,
                          type: "button",
                          class: "ss-btn sm",
                          disabled: !!E.value,
                          "data-test": `mm-asr-install-${f.key}`,
                          onClick: (L) => R([f.installId])
                        }, [
                          e.createElementVNode(
                            "i",
                            {
                              class: e.normalizeClass(E.value === f.installId ? "ri-loader-4-line spin" : "ri-download-2-line")
                            },
                            null,
                            2
                            /* CLASS */
                          ),
                          e.createTextVNode(
                            e.toDisplayString(_.$t("下载")),
                            1
                            /* TEXT */
                          )
                        ], 8, hf)) : (e.openBlock(), e.createElementBlock(
                          "small",
                          _f,
                          e.toDisplayString(_.$t("在 设置 → 语音 下载")),
                          1
                          /* TEXT */
                        ))
                      ])
                    ], 8, kf))),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ])
              ])
            ]),
            e.createElementVNode(
              "p",
              Bf,
              e.toDisplayString(_.$t("表中是字错率（越低越准），用同一批带标准答案的录音在本机实测；耗时按这台电脑的配置估算。")),
              1
              /* TEXT */
            ),
            e.createElementVNode("label", Sf, [
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(_.$t("转写时用")),
                1
                /* TEXT */
              ),
              e.withDirectives(e.createElementVNode(
                "select",
                {
                  "onUpdate:modelValue": h[4] || (h[4] = (f) => a.value = f),
                  "data-test": "mm-asr-pref",
                  onChange: h[5] || (h[5] = (f) => z())
                },
                [
                  e.createElementVNode(
                    "option",
                    Df,
                    e.toDisplayString(_.$t("自动（推荐）：装了 FireRedASR2 用它，否则 SenseVoice")),
                    1
                    /* TEXT */
                  ),
                  h[19] || (h[19] = e.createElementVNode(
                    "option",
                    { value: "firered" },
                    "FireRedASR2",
                    -1
                    /* CACHED */
                  )),
                  h[20] || (h[20] = e.createElementVNode(
                    "option",
                    { value: "sensevoice" },
                    "SenseVoice",
                    -1
                    /* CACHED */
                  )),
                  h[21] || (h[21] = e.createElementVNode(
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
                [e.vModelSelect, a.value]
              ])
            ])
          ])
        ],
        64
        /* STABLE_FRAGMENT */
      )) : s.value && w.value === "cloud" ? (e.openBlock(), e.createElementBlock("div", wf, [
        e.createElementVNode("label", Cf, [
          e.createElementVNode(
            "span",
            null,
            e.toDisplayString(_.$t("服务商")),
            1
            /* TEXT */
          ),
          e.withDirectives(e.createElementVNode(
            "select",
            {
              "onUpdate:modelValue": h[6] || (h[6] = (f) => g.provider = f),
              "data-test": "mm-asr-cloud-provider",
              onChange: X
            },
            [
              e.createElementVNode(
                "option",
                Tf,
                e.toDisplayString(_.$t("阿里云百炼 · Qwen3-ASR-Flash（方言好）")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "option",
                If,
                e.toDisplayString(_.$t("硅基流动 · SenseVoice / TeleSpeech 方言")),
                1
                /* TEXT */
              ),
              h[22] || (h[22] = e.createElementVNode(
                "option",
                { value: "openai" },
                "OpenAI",
                -1
                /* CACHED */
              )),
              e.createElementVNode(
                "option",
                Mf,
                e.toDisplayString(_.$t("其他（OpenAI 兼容接口）")),
                1
                /* TEXT */
              )
            ],
            544
            /* NEED_HYDRATION, NEED_PATCH */
          ), [
            [e.vModelSelect, g.provider]
          ])
        ]),
        e.createElementVNode("label", Af, [
          e.createElementVNode(
            "span",
            null,
            e.toDisplayString(_.$t("接口地址")),
            1
            /* TEXT */
          ),
          e.withDirectives(e.createElementVNode(
            "input",
            {
              "onUpdate:modelValue": h[7] || (h[7] = (f) => g.baseUrl = f),
              type: "url",
              spellcheck: "false",
              placeholder: "https://…/v1",
              "data-test": "mm-asr-cloud-url"
            },
            null,
            512
            /* NEED_PATCH */
          ), [
            [e.vModelText, g.baseUrl]
          ])
        ]),
        e.createElementVNode("label", jf, [
          e.createElementVNode(
            "span",
            null,
            e.toDisplayString(_.$t("模型")),
            1
            /* TEXT */
          ),
          e.withDirectives(e.createElementVNode(
            "input",
            {
              "onUpdate:modelValue": h[8] || (h[8] = (f) => g.model = f),
              type: "text",
              spellcheck: "false",
              list: "mm-asr-models",
              "data-test": "mm-asr-cloud-model"
            },
            null,
            512
            /* NEED_PATCH */
          ), [
            [e.vModelText, g.model]
          ]),
          e.createElementVNode("datalist", Lf, [
            (e.openBlock(!0), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(U.value, (f) => (e.openBlock(), e.createElementBlock("option", {
                key: f,
                value: f
              }, null, 8, zf))),
              128
              /* KEYED_FRAGMENT */
            ))
          ])
        ]),
        e.createElementVNode("label", Ff, [
          e.createElementVNode("span", null, [
            h[23] || (h[23] = e.createTextVNode(
              "API Key ",
              -1
              /* CACHED */
            )),
            s.value.asr.cloud?.hasKey ? (e.openBlock(), e.createElementBlock(
              "em",
              Pf,
              e.toDisplayString(_.$t("已保存")),
              1
              /* TEXT */
            )) : e.createCommentVNode("v-if", !0)
          ]),
          e.createElementVNode("span", Uf, [
            e.withDirectives(e.createElementVNode("input", {
              "onUpdate:modelValue": h[9] || (h[9] = (f) => g.apiKey = f),
              type: D.value ? "text" : "password",
              autocomplete: "new-password",
              spellcheck: "false",
              placeholder: s.value.asr.cloud?.hasKey ? _.$t("已保存，点右边的眼睛查看") : _.$t("粘贴 API Key"),
              "data-test": "mm-asr-cloud-key"
            }, null, 8, Of), [
              [e.vModelDynamic, g.apiKey]
            ]),
            e.createElementVNode("button", {
              type: "button",
              class: "mm-asr__eye",
              title: D.value ? _.$t("隐藏") : _.$t("查看"),
              "data-test": "mm-asr-cloud-eye",
              onClick: ne
            }, [
              e.createElementVNode(
                "i",
                {
                  class: e.normalizeClass(D.value ? "ri-eye-off-line" : "ri-eye-line")
                },
                null,
                2
                /* CLASS */
              )
            ], 8, Rf)
          ]),
          q.value ? (e.openBlock(), e.createElementBlock(
            "a",
            {
              key: 0,
              class: "ss-link mm-asr__keylink",
              href: "#",
              onClick: e.withModifiers($, ["prevent"])
            },
            e.toDisplayString(_.$t("去哪拿 API Key")),
            1
            /* TEXT */
          )) : e.createCommentVNode("v-if", !0)
        ]),
        e.createElementVNode("p", qf, [
          h[24] || (h[24] = e.createElementVNode(
            "i",
            { class: "ri-information-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            e.toDisplayString(_.$t("选在线接口后，会议录音会按片段（每段不超过 20 秒）上传到这个服务转写，按服务商的价格计费；认人（声纹）仍在本机。API Key 只加密保存在这台电脑。")),
            1
            /* TEXT */
          )
        ]),
        P.value ? (e.openBlock(), e.createElementBlock(
          "p",
          {
            key: 0,
            class: e.normalizeClass(["ss-note", j.value ? "ok" : "danger"]),
            "data-test": "mm-asr-cloud-test-msg"
          },
          [
            e.createElementVNode(
              "i",
              {
                class: e.normalizeClass(j.value ? "ri-checkbox-circle-line" : "ri-error-warning-line")
              },
              null,
              2
              /* CLASS */
            ),
            e.createTextVNode(
              e.toDisplayString(P.value),
              1
              /* TEXT */
            )
          ],
          2
          /* CLASS */
        )) : e.createCommentVNode("v-if", !0),
        e.createElementVNode("div", Kf, [
          e.createElementVNode("button", {
            type: "button",
            class: "ss-btn",
            disabled: c.value,
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
              e.toDisplayString(_.$t("测试连接")),
              1
              /* TEXT */
            )
          ], 8, Hf),
          e.createElementVNode("button", {
            type: "button",
            class: "ss-btn primary",
            disabled: c.value || !g.model.trim() || !(g.apiKey.trim() || s.value.asr.cloud?.hasKey),
            "data-test": "mm-asr-cloud-save",
            onClick: Y
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
              e.toDisplayString(_.$t("保存并使用")),
              1
              /* TEXT */
            )
          ], 8, Wf),
          s.value.asr.cloud ? (e.openBlock(), e.createElementBlock("button", {
            key: 0,
            type: "button",
            class: "ss-link",
            disabled: c.value,
            "data-test": "mm-asr-cloud-clear",
            onClick: ee
          }, e.toDisplayString(_.$t("清除在线接口")), 9, Gf)) : e.createCommentVNode("v-if", !0)
        ])
      ])) : e.createCommentVNode("v-if", !0),
      E.value && r.value !== null ? (e.openBlock(), e.createElementBlock("div", Yf, [
        e.createElementVNode(
          "i",
          {
            style: e.normalizeStyle({ width: `${r.value}%` })
          },
          null,
          4
          /* STYLE */
        )
      ])) : e.createCommentVNode("v-if", !0),
      m.value ? (e.openBlock(), e.createElementBlock(
        "p",
        Jf,
        e.toDisplayString(m.value),
        1
        /* TEXT */
      )) : e.createCommentVNode("v-if", !0),
      k.value ? (e.openBlock(), e.createElementBlock("p", Qf, [
        h[25] || (h[25] = e.createElementVNode(
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
}), qt = /* @__PURE__ */ ae(Zf, [["__scopeId", "data-v-aa00b6e5"]]), Xf = {
  class: "mm-sa",
  "data-test": "mm-ai"
}, xf = { class: "mm-sp__head" }, e1 = {
  key: 0,
  class: "ss-note danger"
}, t1 = { class: "mm-sa__block" }, l1 = { class: "ss-muted" }, n1 = { class: "mm-sa__block" }, o1 = { class: "mm-sa__range" }, a1 = { class: "ss-muted" }, s1 = { class: "mm-sa__block" }, r1 = { class: "ss-field" }, i1 = ["placeholder"], c1 = { class: "ss-field" }, d1 = ["placeholder"], m1 = { class: "ss-field" }, u1 = ["placeholder"], p1 = { class: "ss-actions" }, v1 = ["disabled"], k1 = /* @__PURE__ */ e.defineComponent({
  __name: "SettingsAi",
  props: {
    settings: {}
  },
  emits: ["saved"],
  setup(l, { emit: v }) {
    const n = l, u = v, y = ce.useNotificationStore(), s = e.ref(!1), o = e.ref(""), c = e.reactive({ voiceprintThreshold: 0.55, planPrompt: "", summaryPrompt: "", organizePrompt: "" });
    function i(r) {
      const N = r.ai ?? { voiceprintThreshold: 0.55 };
      return {
        voiceprintThreshold: Number.isFinite(N.voiceprintThreshold) ? N.voiceprintThreshold : 0.55,
        planPrompt: N.planPrompt ?? "",
        summaryPrompt: N.summaryPrompt ?? "",
        organizePrompt: N.organizePrompt ?? ""
      };
    }
    const k = e.computed(() => JSON.stringify(i(n.settings)) !== JSON.stringify({ ...c, voiceprintThreshold: Number(c.voiceprintThreshold) }));
    function E() {
      Object.assign(c, i(n.settings));
    }
    e.watch(() => n.settings, E, { immediate: !0 });
    async function m() {
      s.value = !0, o.value = "";
      try {
        const r = Math.max(0, Math.min(1, Number(c.voiceprintThreshold) || 0.55)), N = {
          voiceprintThreshold: Math.round(r * 100) / 100,
          // 空串 = 用内置（不用 undefined：JSON 往返会丢字段，主进程深合并时清不掉旧提示词）
          planPrompt: c.planPrompt.trim(),
          summaryPrompt: c.summaryPrompt.trim(),
          organizePrompt: c.organizePrompt.trim()
        }, w = await J("settings.save", { patch: { ai: N } });
        y.success(t.t("AI 能力配置已保存")), u("saved", w);
      } catch (r) {
        o.value = x.errorMessage(r);
      } finally {
        s.value = !1;
      }
    }
    return (r, N) => (e.openBlock(), e.createElementBlock("div", Xf, [
      e.createElementVNode("header", xf, [
        e.createElementVNode("div", null, [
          e.createElementVNode(
            "h3",
            null,
            e.toDisplayString(r.$t("AI 能力配置")),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "p",
            null,
            e.toDisplayString(r.$t("转写、声纹识别、执行方案和总结报告用到的 AI。文字类 AI 用你在应用里选的模型；模型不可用时都有确定性兜底，流程不会断。报告里的数字由系统计算，模型只写叙述。")),
            1
            /* TEXT */
          )
        ])
      ]),
      o.value ? (e.openBlock(), e.createElementBlock("p", e1, [
        N[4] || (N[4] = e.createElementVNode(
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
      e.createElementVNode("section", t1, [
        e.createElementVNode(
          "h4",
          null,
          e.toDisplayString(r.$t("转写")),
          1
          /* TEXT */
        ),
        e.createVNode(qt),
        e.createElementVNode(
          "p",
          l1,
          e.toDisplayString(r.$t("录音和录屏都按停顿切片后逐段转写；文字记录（txt / docx / srt / vtt 等）跳过转写。")),
          1
          /* TEXT */
        )
      ]),
      e.createElementVNode("section", n1, [
        e.createElementVNode(
          "h4",
          null,
          e.toDisplayString(r.$t("声纹识别")),
          1
          /* TEXT */
        ),
        e.createElementVNode("label", o1, [
          e.createElementVNode(
            "span",
            null,
            e.toDisplayString(r.$t("相似度下限")),
            1
            /* TEXT */
          ),
          e.withDirectives(e.createElementVNode(
            "input",
            {
              "onUpdate:modelValue": N[0] || (N[0] = (w) => c.voiceprintThreshold = w),
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
              c.voiceprintThreshold,
              void 0,
              { number: !0 }
            ]
          ]),
          e.createElementVNode(
            "b",
            null,
            e.toDisplayString(Number(c.voiceprintThreshold).toFixed(2)),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode(
          "p",
          a1,
          e.toDisplayString(r.$t("只和本场参会人的声纹比对；低于下限的发言人留给主持人试听后指认。调高更严（指认更多），调低更松（可能认错）。默认 0.55。")),
          1
          /* TEXT */
        )
      ]),
      e.createElementVNode("section", s1, [
        e.createElementVNode("h4", null, [
          e.createTextVNode(
            e.toDisplayString(r.$t("提示词")) + " ",
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "small",
            null,
            e.toDisplayString(r.$t("留空 = 用内置提示词")),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode("label", r1, [
          e.createElementVNode(
            "span",
            null,
            e.toDisplayString(r.$t("纪要整理（按议题 / 时间线整理、识别决议、3 行摘要）")),
            1
            /* TEXT */
          ),
          e.withDirectives(e.createElementVNode("textarea", {
            "onUpdate:modelValue": N[1] || (N[1] = (w) => c.organizePrompt = w),
            rows: "4",
            placeholder: r.$t("留空使用内置")
          }, null, 8, i1), [
            [e.vModelText, c.organizePrompt]
          ])
        ]),
        e.createElementVNode("label", c1, [
          e.createElementVNode(
            "span",
            null,
            e.toDisplayString(r.$t("执行方案（从决议拆任务：每项一个责任部门、执行事项、交付标准、建议完成时间）")),
            1
            /* TEXT */
          ),
          e.withDirectives(e.createElementVNode("textarea", {
            "onUpdate:modelValue": N[2] || (N[2] = (w) => c.planPrompt = w),
            rows: "4",
            placeholder: r.$t("留空使用内置")
          }, null, 8, d1), [
            [e.vModelText, c.planPrompt]
          ])
        ]),
        e.createElementVNode("label", m1, [
          e.createElementVNode(
            "span",
            null,
            e.toDisplayString(r.$t("项目总结（概况、关键决策、任务完成情况、变更与裁决记录）")),
            1
            /* TEXT */
          ),
          e.withDirectives(e.createElementVNode("textarea", {
            "onUpdate:modelValue": N[3] || (N[3] = (w) => c.summaryPrompt = w),
            rows: "4",
            placeholder: r.$t("留空使用内置")
          }, null, 8, u1), [
            [e.vModelText, c.summaryPrompt]
          ])
        ])
      ]),
      e.createElementVNode("div", p1, [
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
            e.toDisplayString(r.$t("保存")),
            1
            /* TEXT */
          )
        ], 8, v1),
        k.value ? (e.openBlock(), e.createElementBlock(
          "button",
          {
            key: 0,
            type: "button",
            class: "ss-link",
            onClick: E
          },
          e.toDisplayString(r.$t("撤销修改")),
          1
          /* TEXT */
        )) : e.createCommentVNode("v-if", !0)
      ])
    ]));
  }
}), y1 = /* @__PURE__ */ ae(k1, [["__scopeId", "data-v-4bd27b96"]]), g1 = {
  class: "mm-pf",
  "data-test": "mm-push-failed"
}, f1 = { class: "mm-pf__head" }, N1 = ["disabled", "title"], V1 = { class: "ss-muted" }, E1 = {
  key: 1,
  class: "ss-note danger"
}, $1 = {
  key: 2,
  class: "mm-pf__empty"
}, b1 = {
  key: 3,
  class: "ss-table-wrap"
}, h1 = { class: "ss-table" }, _1 = { class: "num" }, B1 = ["data-test"], S1 = { class: "nowrap" }, D1 = { class: "nowrap" }, w1 = { class: "mm-pf__err" }, C1 = { class: "num" }, T1 = ["disabled", "data-test", "onClick"], I1 = {
  key: 4,
  class: "ss-muted"
}, M1 = /* @__PURE__ */ e.defineComponent({
  __name: "PushFailedList",
  setup(l) {
    const v = e.ref([]), n = e.ref(0), u = e.ref(!1), y = e.ref(""), s = e.ref(""), o = e.ref(null), c = e.computed(() => !!oe.value?.pushChannel || !!oe.value?.wecomConnected);
    async function i() {
      try {
        const m = await J("notice.push.failed");
        v.value = m?.items ?? [], n.value = m?.total ?? 0, s.value = "";
      } catch (m) {
        s.value = x.errorMessage(m);
      } finally {
        u.value = !0;
      }
    }
    async function k(m) {
      y.value = m || "all", s.value = "", o.value = null;
      try {
        o.value = await J("notice.push.retry", m ? { ids: [m] } : { all: !0 }), await Promise.all([i(), de().catch(() => null)]);
      } catch (r) {
        s.value = x.errorMessage(r);
      } finally {
        y.value = "";
      }
    }
    let E = null;
    return e.onMounted(() => {
      i(), E = _e((m) => {
        m.type === "changed" && m.scope === "notice" && !y.value && i();
      });
    }), e.onBeforeUnmount(() => E?.()), (m, r) => (e.openBlock(), e.createElementBlock("section", g1, [
      e.createElementVNode("div", f1, [
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
        r[1] || (r[1] = e.createElementVNode(
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
          disabled: !!y.value || !c.value,
          title: c.value ? "" : m.$t("先配置并连接企业微信"),
          "data-test": "mm-push-retry-all",
          onClick: r[0] || (r[0] = (N) => k())
        }, [
          e.createElementVNode(
            "i",
            {
              class: e.normalizeClass(y.value === "all" ? "ri-loader-4-line spin" : "ri-send-plane-line")
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
        ], 8, N1)) : e.createCommentVNode("v-if", !0)
      ]),
      e.createElementVNode(
        "p",
        V1,
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
      s.value ? (e.openBlock(), e.createElementBlock("p", E1, [
        r[2] || (r[2] = e.createElementVNode(
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
      !v.value.length && u.value ? (e.openBlock(), e.createElementBlock(
        "p",
        $1,
        e.toDisplayString(m.$t("没有发送失败的通知")),
        1
        /* TEXT */
      )) : v.value.length ? (e.openBlock(), e.createElementBlock("div", b1, [
        e.createElementVNode("table", h1, [
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
                _1,
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
              e.renderList(v.value, (N) => (e.openBlock(), e.createElementBlock("tr", {
                key: N.id,
                "data-test": `mm-push-row-${N.id}`
              }, [
                e.createElementVNode(
                  "td",
                  S1,
                  e.toDisplayString(e.unref(he)(N.at)),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "td",
                  D1,
                  e.toDisplayString(N.toName),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "td",
                  null,
                  e.toDisplayString(N.title),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "td",
                  w1,
                  e.toDisplayString(N.error),
                  1
                  /* TEXT */
                ),
                e.createElementVNode("td", C1, [
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-link",
                    disabled: !!y.value || !c.value,
                    "data-test": `mm-push-retry-${N.id}`,
                    onClick: (w) => k(N.id)
                  }, e.toDisplayString(y.value === N.id ? m.$t("发送中…") : m.$t("重发")), 9, T1)
                ])
              ], 8, B1))),
              128
              /* KEYED_FRAGMENT */
            ))
          ])
        ])
      ])) : e.createCommentVNode("v-if", !0),
      n.value > v.value.length ? (e.openBlock(), e.createElementBlock(
        "small",
        I1,
        e.toDisplayString(m.$t("只列出最近 {n} 条", { n: v.value.length })),
        1
        /* TEXT */
      )) : e.createCommentVNode("v-if", !0)
    ]));
  }
}), A1 = /* @__PURE__ */ ae(M1, [["__scopeId", "data-v-f0a4a0e3"]]), j1 = {
  class: "mm-sw",
  "data-test": "mm-wecom"
}, L1 = { class: "mm-sp__head" }, z1 = {
  key: 0,
  class: "ss-note danger"
}, F1 = { class: "mm-sw__form" }, P1 = { class: "ss-grid" }, U1 = { class: "ss-field" }, O1 = { class: "ss-field" }, R1 = { class: "ss-field" }, q1 = {
  key: 0,
  class: "mm-sw__set"
}, K1 = { class: "mm-sw__secret" }, H1 = ["type", "placeholder"], W1 = ["title", "disabled"], G1 = { class: "ss-field" }, Y1 = ["placeholder"], J1 = { class: "ss-muted" }, Q1 = { class: "ss-actions" }, Z1 = ["disabled"], X1 = ["disabled"], x1 = {
  class: "mm-sw__form",
  "data-test": "mm-webhook"
}, eN = { class: "mm-sw__h" }, tN = { class: "mm-sw__steps" }, lN = { class: "ss-field" }, nN = {
  key: 0,
  class: "mm-sw__set",
  "data-test": "mm-webhook-set"
}, oN = ["placeholder"], aN = { class: "ss-muted" }, sN = { class: "ss-actions" }, rN = ["disabled"], iN = ["disabled"], cN = ["disabled"], dN = { class: "mm-sw__events" }, mN = { class: "ss-table-wrap" }, uN = { class: "ss-table" }, pN = { class: "num" }, vN = { class: "wrap" }, kN = { class: "wrap" }, yN = { class: "ss-muted" }, gN = /* @__PURE__ */ e.defineComponent({
  __name: "SettingsWecom",
  props: {
    settings: {}
  },
  emits: ["saved"],
  setup(l, { emit: v }) {
    const n = l, u = v, y = t.t("标题 + 摘要 + 按钮"), s = [
      { event: t.t("发言待确认 / 未确认催办"), to: t.t("发言人"), card: y },
      { event: t.t("纪要待终审"), to: t.t("主持人"), card: y },
      { event: t.t("正式纪要已生成"), to: t.t("参会人"), card: t.t("会议主题 + 3 行摘要") },
      { event: t.t("执行方案待确认"), to: t.t("任务负责人"), card: t.t("任务名 + 截止") },
      { event: t.t("新任务待接收"), to: t.t("部门负责人"), card: t.t("任务名 + 截止") },
      { event: t.t("进度更新 / 到期 / 逾期提醒"), to: t.t("部门负责人（逾期同时通知任务负责人）"), card: y },
      { event: t.t("任务进度有更新 / 任务已完成"), to: t.t("任务负责人（可多位，每位都发）"), card: t.t("任务名 + 进度 / 说明") },
      { event: t.t("异议待复核"), to: t.t("任务负责人"), card: y },
      { event: t.t("调整后方案待确认"), to: t.t("部门负责人"), card: t.t("任务名 + 截止") },
      { event: t.t("待裁决"), to: t.t("项目负责人"), card: y },
      { event: t.t("裁决结果"), to: t.t("任务负责人、部门负责人"), card: y },
      { event: t.t("进度汇总报告"), to: t.t("任务负责人、项目负责人"), card: t.t("完成率 + 逾期数") },
      { event: t.t("总结报告待审核"), to: t.t("项目负责人"), card: y },
      { event: t.t("项目已归档"), to: t.t("项目成员"), card: t.t("项目已归档") }
    ], o = Be.useDialog(), c = ce.useNotificationStore(), i = e.ref(!1), k = e.ref(""), E = e.ref(""), m = e.ref(null), r = e.reactive({ corpId: "", agentId: "", secret: "", cardBaseUrl: "" }), N = e.computed(() => !!oe.value?.wecomConnected), w = e.computed(() => oe.value?.pushChannel ?? (N.value ? "app" : null)), a = e.ref(""), g = e.ref(!1);
    async function D() {
      if (!g.value && !r.secret && n.settings.wecom.hasSecret)
        try {
          const M = await J("wecom.secret.reveal");
          r.secret = M?.secret || "";
        } catch (M) {
          E.value = x.errorMessage(M);
          return;
        }
      g.value = !g.value;
    }
    const P = e.ref(null), j = e.computed(() => !r.corpId.trim() && !r.agentId.trim()), C = e.computed(() => j.value ? !!(n.settings.wecom.corpId || n.settings.wecom.agentId || n.settings.wecom.hasSecret) : !!r.corpId.trim() && !!r.agentId.trim() && (n.settings.wecom.hasSecret || !!r.secret));
    e.watch(() => n.settings.wecom, (M) => {
      Object.assign(r, { corpId: M?.corpId ?? "", agentId: M?.agentId ?? "", secret: r.secret, cardBaseUrl: M?.cardBaseUrl ?? "" });
    }, { immediate: !0 });
    async function I() {
      if (!(j.value && !await o.confirm({
        title: t.t("断开企微"),
        message: t.t("清空企微配置后，通讯录不再从企微同步，通知只进系统内消息中心。确定吗？"),
        danger: !0
      }))) {
        i.value = !0, k.value = "save", E.value = "", m.value = null;
        try {
          const M = { corpId: r.corpId.trim(), agentId: r.agentId.trim(), cardBaseUrl: r.cardBaseUrl.trim() };
          r.secret && (M.secret = r.secret), await J("wecom.save", M), j.value && (r.secret = "", g.value = !1), c.success(j.value ? t.t("已断开企微") : t.t("企微配置已保存")), u("saved"), await de().catch(() => null);
        } catch (M) {
          E.value = x.errorMessage(M);
        } finally {
          i.value = !1, k.value = "";
        }
      }
    }
    async function U(M, T) {
      i.value = !0, k.value = M, E.value = "", P.value = null;
      try {
        await T();
      } catch (G) {
        P.value = { ok: !1, error: x.errorMessage(G) };
      } finally {
        i.value = !1, k.value = "";
      }
    }
    function q() {
      return U("hook", async () => {
        await J("wecom.webhook.save", { url: a.value.trim() }), a.value = "", c.success(t.t("群机器人已保存")), u("saved"), await de().catch(() => null);
      });
    }
    function B() {
      return U("hookTest", async () => {
        const M = await J("wecom.webhook.test");
        P.value = { ok: !!M?.ok, error: M?.error };
      });
    }
    async function S() {
      await o.confirm({ title: t.t("移除群机器人"), message: t.t("移除后通知不再发到企微群（自建应用照常）。确定吗？"), danger: !0 }) && await U("hook", async () => {
        await J("wecom.webhook.save", { url: "" }), c.success(t.t("已移除群机器人")), u("saved"), await de().catch(() => null);
      });
    }
    async function b() {
      i.value = !0, k.value = "test", E.value = "", m.value = null;
      try {
        const M = await J("wecom.test");
        m.value = { ok: !!M?.ok, error: M?.error }, await de().catch(() => null);
      } catch (M) {
        m.value = { ok: !1, error: x.errorMessage(M) };
      } finally {
        i.value = !1, k.value = "";
      }
    }
    return (M, T) => (e.openBlock(), e.createElementBlock("div", j1, [
      e.createElementVNode("header", L1, [
        e.createElementVNode("div", null, [
          e.createElementVNode(
            "h3",
            null,
            e.toDisplayString(M.$t("消息推送")),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "p",
            null,
            e.toDisplayString(M.$t("配置企业微信自建应用后，通讯录真实同步、14 类通知以卡片推到企微；没配置时用演示组织，通知只进系统内消息中心。卡片只放标题、摘要和按钮，长文在系统内看。")),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "p",
            null,
            e.toDisplayString(M.$t("配不了自建应用（要 CorpID、Secret 和企业可信 IP）时，可以只配一个「企微群机器人」：通知发到一个企微群里并点名提醒相关的人，见下方。")),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode(
          "span",
          {
            class: e.normalizeClass(["ss-chip", w.value ? "ok" : "warn"]),
            "data-test": "mm-wecom-state"
          },
          e.toDisplayString(w.value === "app" ? M.$t("企微已连接") : w.value === "webhook" ? M.$t("群机器人已连接") : M.$t("未连接企微")),
          3
          /* TEXT, CLASS */
        )
      ]),
      E.value ? (e.openBlock(), e.createElementBlock("p", z1, [
        T[8] || (T[8] = e.createElementVNode(
          "i",
          { class: "ri-error-warning-line" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(E.value),
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
            e.toDisplayString(m.value.ok ? M.$t("连接正常") : m.value.error || M.$t("连接失败")),
            1
            /* TEXT */
          )
        ],
        2
        /* CLASS */
      )) : e.createCommentVNode("v-if", !0),
      e.createElementVNode("section", F1, [
        e.createElementVNode("div", P1, [
          e.createElementVNode("label", U1, [
            T[9] || (T[9] = e.createElementVNode(
              "span",
              null,
              "CorpID",
              -1
              /* CACHED */
            )),
            e.withDirectives(e.createElementVNode(
              "input",
              {
                "onUpdate:modelValue": T[0] || (T[0] = (G) => r.corpId = G),
                type: "text",
                autocomplete: "off",
                spellcheck: "false",
                "data-test": "mm-wecom-corp"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [e.vModelText, r.corpId]
            ])
          ]),
          e.createElementVNode("label", O1, [
            T[10] || (T[10] = e.createElementVNode(
              "span",
              null,
              "AgentID",
              -1
              /* CACHED */
            )),
            e.withDirectives(e.createElementVNode(
              "input",
              {
                "onUpdate:modelValue": T[1] || (T[1] = (G) => r.agentId = G),
                type: "text",
                autocomplete: "off",
                spellcheck: "false",
                "data-test": "mm-wecom-agent"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [e.vModelText, r.agentId]
            ])
          ]),
          e.createElementVNode("label", R1, [
            e.createElementVNode("span", null, [
              T[11] || (T[11] = e.createTextVNode(
                "Secret ",
                -1
                /* CACHED */
              )),
              l.settings.wecom.hasSecret ? (e.openBlock(), e.createElementBlock(
                "em",
                q1,
                e.toDisplayString(M.$t("已配置")),
                1
                /* TEXT */
              )) : e.createCommentVNode("v-if", !0)
            ]),
            e.createElementVNode("span", K1, [
              e.withDirectives(e.createElementVNode("input", {
                "onUpdate:modelValue": T[2] || (T[2] = (G) => r.secret = G),
                type: g.value ? "text" : "password",
                autocomplete: "new-password",
                spellcheck: "false",
                placeholder: l.settings.wecom.hasSecret ? M.$t("已保存，点右边的眼睛查看") : M.$t("应用的 Secret"),
                "data-test": "mm-wecom-secret"
              }, null, 8, H1), [
                [e.vModelDynamic, r.secret]
              ]),
              e.createElementVNode("button", {
                type: "button",
                class: "mm-sw__eye",
                title: g.value ? M.$t("隐藏") : M.$t("查看"),
                disabled: i.value,
                "data-test": "mm-wecom-secret-eye",
                onClick: D
              }, [
                e.createElementVNode(
                  "i",
                  {
                    class: e.normalizeClass(g.value ? "ri-eye-off-line" : "ri-eye-line")
                  },
                  null,
                  2
                  /* CLASS */
                )
              ], 8, W1)
            ])
          ])
        ]),
        e.createElementVNode("label", G1, [
          e.createElementVNode(
            "span",
            null,
            e.toDisplayString(M.$t("卡片跳转地址前缀")),
            1
            /* TEXT */
          ),
          e.withDirectives(e.createElementVNode("input", {
            "onUpdate:modelValue": T[3] || (T[3] = (G) => r.cardBaseUrl = G),
            type: "url",
            placeholder: M.$t("留空 = 用手机页服务的局域网地址，如 http://192.168.1.10:8260"),
            spellcheck: "false",
            "data-test": "mm-wecom-base"
          }, null, 8, Y1), [
            [e.vModelText, r.cardBaseUrl]
          ])
        ]),
        e.createElementVNode(
          "p",
          J1,
          e.toDisplayString(M.$t("Secret 只保存在本机（系统加密存储），不会显示出来。卡片按钮会跳到「前缀 + 每人专属链接」，员工手机要能访问这个地址（同一局域网或可信域名）。CorpID 和 AgentID 都清空后保存 = 断开企微。")),
          1
          /* TEXT */
        ),
        e.createElementVNode("div", Q1, [
          e.createElementVNode("button", {
            type: "button",
            class: "ss-btn primary",
            disabled: i.value || !C.value,
            "data-test": "mm-wecom-save",
            onClick: I
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
              e.toDisplayString(M.$t("保存")),
              1
              /* TEXT */
            )
          ], 8, Z1),
          e.createElementVNode("button", {
            type: "button",
            class: "ss-btn",
            disabled: i.value || !l.settings.wecom.hasSecret && !N.value,
            "data-test": "mm-wecom-test",
            onClick: b
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
              e.toDisplayString(M.$t("测试连接")),
              1
              /* TEXT */
            )
          ], 8, X1),
          e.createElementVNode("button", {
            type: "button",
            class: "ss-link",
            "data-test": "mm-wecom-link-profile",
            onClick: T[4] || (T[4] = (G) => e.unref(pe)(e.unref(Ve).profile))
          }, [
            e.createTextVNode(
              e.toDisplayString(M.$t("打开企微·我的企业")) + " ",
              1
              /* TEXT */
            ),
            T[12] || (T[12] = e.createElementVNode(
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
            onClick: T[5] || (T[5] = (G) => e.unref(pe)(e.unref(Ve).apps))
          }, [
            e.createTextVNode(
              e.toDisplayString(M.$t("打开企微·应用管理")) + " ",
              1
              /* TEXT */
            ),
            T[13] || (T[13] = e.createElementVNode(
              "i",
              { class: "ri-external-link-line" },
              null,
              -1
              /* CACHED */
            ))
          ])
        ])
      ]),
      e.createElementVNode("section", x1, [
        e.createElementVNode("h4", eN, [
          e.createTextVNode(
            e.toDisplayString(M.$t("企微群机器人")) + " ",
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "small",
            null,
            e.toDisplayString(M.$t("没有自建应用时用：通知发到一个企微群里，并点名提醒要处理的人")),
            1
            /* TEXT */
          ),
          T[15] || (T[15] = e.createTextVNode()),
          e.createElementVNode("button", {
            type: "button",
            class: "ss-link",
            "data-test": "mm-wecom-link-webhook-doc",
            onClick: T[6] || (T[6] = (G) => e.unref(pe)(e.unref(Ve).webhookDoc))
          }, [
            e.createTextVNode(
              e.toDisplayString(M.$t("查看企微官方说明")) + " ",
              1
              /* TEXT */
            ),
            T[14] || (T[14] = e.createElementVNode(
              "i",
              { class: "ri-external-link-line" },
              null,
              -1
              /* CACHED */
            ))
          ])
        ]),
        e.createElementVNode("ol", tN, [
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
        e.createElementVNode("label", lN, [
          e.createElementVNode("span", null, [
            e.createTextVNode(
              e.toDisplayString(M.$t("Webhook 地址")) + " ",
              1
              /* TEXT */
            ),
            l.settings.wecom.hasWebhook ? (e.openBlock(), e.createElementBlock(
              "em",
              nN,
              e.toDisplayString(M.$t("已配置")) + " " + e.toDisplayString(l.settings.wecom.webhookMasked),
              1
              /* TEXT */
            )) : e.createCommentVNode("v-if", !0)
          ]),
          e.withDirectives(e.createElementVNode("input", {
            "onUpdate:modelValue": T[7] || (T[7] = (G) => a.value = G),
            type: "password",
            autocomplete: "off",
            spellcheck: "false",
            placeholder: l.settings.wecom.hasWebhook ? M.$t("已配置，要换地址再粘贴") : "https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=…",
            "data-test": "mm-webhook-url"
          }, null, 8, oN), [
            [e.vModelText, a.value]
          ])
        ]),
        e.createElementVNode(
          "p",
          aN,
          e.toDisplayString(M.$t("地址里的 key 等于发消息的凭据，只保存在本机（系统加密存储），不会显示出来。配了自建应用时通知发给个人，群机器人不再发。群消息里的按钮不带个人令牌：手机上打开过自己专属链接的人点了能直接进入。每个机器人每分钟最多发 20 条，同一事件的几个人合成一条。")),
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
              e.toDisplayString(P.value.ok ? M.$t("已发到群里，请到企微群里看一眼") : P.value.error || M.$t("发送失败")),
              1
              /* TEXT */
            )
          ],
          2
          /* CLASS */
        )) : e.createCommentVNode("v-if", !0),
        e.createElementVNode("div", sN, [
          e.createElementVNode("button", {
            type: "button",
            class: "ss-btn primary",
            disabled: i.value || !a.value.trim(),
            "data-test": "mm-webhook-save",
            onClick: q
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
              e.toDisplayString(M.$t("保存")),
              1
              /* TEXT */
            )
          ], 8, rN),
          e.createElementVNode("button", {
            type: "button",
            class: "ss-btn",
            disabled: i.value || !l.settings.wecom.hasWebhook,
            "data-test": "mm-webhook-test",
            onClick: B
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
              e.toDisplayString(M.$t("测试发送")),
              1
              /* TEXT */
            )
          ], 8, iN),
          l.settings.wecom.hasWebhook ? (e.openBlock(), e.createElementBlock("button", {
            key: 0,
            type: "button",
            class: "ss-btn",
            disabled: i.value,
            "data-test": "mm-webhook-remove",
            onClick: S
          }, [
            T[16] || (T[16] = e.createElementVNode(
              "i",
              { class: "ri-delete-bin-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(M.$t("移除")),
              1
              /* TEXT */
            )
          ], 8, cN)) : e.createCommentVNode("v-if", !0)
        ])
      ]),
      e.createVNode(A1),
      e.createElementVNode("section", dN, [
        e.createElementVNode("h4", null, [
          e.createTextVNode(
            e.toDisplayString(M.$t("14 类通知")) + " ",
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "small",
            null,
            e.toDisplayString(M.$t("只发提醒，不改任何状态")),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode("div", mN, [
          e.createElementVNode("table", uN, [
            e.createElementVNode("thead", null, [
              e.createElementVNode("tr", null, [
                T[17] || (T[17] = e.createElementVNode(
                  "th",
                  null,
                  "#",
                  -1
                  /* CACHED */
                )),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(M.$t("事件")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(M.$t("接收人")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(M.$t("卡片内容")),
                  1
                  /* TEXT */
                )
              ])
            ]),
            e.createElementVNode("tbody", null, [
              (e.openBlock(), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(s, (G, V) => e.createElementVNode("tr", { key: V }, [
                  e.createElementVNode(
                    "td",
                    pN,
                    e.toDisplayString(V + 1),
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
                    vN,
                    e.toDisplayString(G.to),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "td",
                    kN,
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
          yN,
          e.toDisplayString(M.$t("提醒周期（发言确认超时、到期提前、进度跟踪、周报）在「参数设置」里改。")),
          1
          /* TEXT */
        )
      ])
    ]));
  }
}), fN = /* @__PURE__ */ ae(gN, [["__scopeId", "data-v-c940056b"]]), NN = {
  adminIds: [],
  projectCreatorIds: [],
  confirmTimeoutHours: 24,
  dueRemindDays: 1,
  trackCycleDays: 7,
  reportCycleDays: 7,
  wecom: { corpId: "", agentId: "", hasSecret: !1 },
  // 声纹认人门槛：2026-11-16 用真实 67 分钟会议录音实测，同一会议室不同人之间余弦最高 0.53、本人 0.67~0.77，取 0.55
  ai: { asr: "local", voiceprintThreshold: 0.55 }
}, VN = {
  class: "mm-spa",
  "data-test": "mm-params"
}, EN = { class: "mm-sp__head" }, $N = {
  key: 0,
  class: "ss-note danger"
}, bN = { class: "mm-spa__list" }, hN = { class: "mm-spa__num" }, _N = ["onUpdate:modelValue", "min", "max", "aria-label", "data-test"], BN = {
  key: 1,
  class: "ss-note warn"
}, SN = { class: "ss-actions" }, DN = ["disabled"], wN = /* @__PURE__ */ e.defineComponent({
  __name: "SettingsParams",
  props: {
    settings: {}
  },
  emits: ["saved"],
  setup(l, { emit: v }) {
    const n = [
      { key: "confirmTimeoutHours", title: t.t("发言确认超时"), hint: t.t("发言人超过这么久没确认，就催办一次（不改状态）"), unit: t.t("小时"), min: 1, max: 720 },
      { key: "dueRemindDays", title: t.t("到期提前提醒"), hint: t.t("任务截止前几天提醒部门负责人"), unit: t.t("天"), min: 0, max: 30 },
      { key: "trackCycleDays", title: t.t("进度跟踪周期"), hint: t.t("多久提醒部门负责人更新一次进度"), unit: t.t("天"), min: 1, max: 90 },
      { key: "reportCycleDays", title: t.t("周报周期"), hint: t.t("多久给任务负责人和项目负责人发一份进度汇总报告"), unit: t.t("天"), min: 1, max: 90 }
    ], u = l, y = v, s = ce.useNotificationStore(), o = e.ref(!1), c = e.ref(""), i = e.reactive({ confirmTimeoutHours: 24, dueRemindDays: 1, trackCycleDays: 7, reportCycleDays: 7 }), k = e.computed(() => n.some((w) => Number(i[w.key]) !== u.settings[w.key])), E = e.computed(() => {
      for (const w of n) {
        const a = Number(i[w.key]);
        if (!Number.isInteger(a) || a < w.min || a > w.max) return t.t("「{t}」要填 {a}～{b} 之间的整数", { t: w.title, a: w.min, b: w.max });
      }
      return "";
    });
    function m() {
      for (const w of n) i[w.key] = u.settings[w.key];
    }
    function r() {
      for (const w of n) i[w.key] = NN[w.key];
    }
    e.watch(() => u.settings, m, { immediate: !0 });
    async function N() {
      o.value = !0, c.value = "";
      try {
        const w = Object.fromEntries(n.map((g) => [g.key, Number(i[g.key])])), a = await J("settings.save", { patch: w });
        s.success(t.t("参数已保存")), y("saved", a);
      } catch (w) {
        c.value = x.errorMessage(w);
      } finally {
        o.value = !1;
      }
    }
    return (w, a) => (e.openBlock(), e.createElementBlock("div", VN, [
      e.createElementVNode("header", EN, [
        e.createElementVNode("div", null, [
          e.createElementVNode(
            "h3",
            null,
            e.toDisplayString(w.$t("参数设置")),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "p",
            null,
            e.toDisplayString(w.$t("催办与提醒周期。提醒只推消息，不改任何状态；逾期是任务上的标记，不是状态。")),
            1
            /* TEXT */
          )
        ])
      ]),
      c.value ? (e.openBlock(), e.createElementBlock("p", $N, [
        a[0] || (a[0] = e.createElementVNode(
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
      ])) : e.createCommentVNode("v-if", !0),
      e.createElementVNode("ul", bN, [
        (e.openBlock(), e.createElementBlock(
          e.Fragment,
          null,
          e.renderList(n, (g) => e.createElementVNode("li", {
            key: g.key
          }, [
            e.createElementVNode("div", null, [
              e.createElementVNode(
                "strong",
                null,
                e.toDisplayString(g.title),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "small",
                null,
                e.toDisplayString(g.hint),
                1
                /* TEXT */
              )
            ]),
            e.createElementVNode("label", hN, [
              e.withDirectives(e.createElementVNode("input", {
                "onUpdate:modelValue": (D) => i[g.key] = D,
                type: "number",
                min: g.min,
                max: g.max,
                step: "1",
                "aria-label": g.title,
                "data-test": `mm-param-${g.key}`
              }, null, 8, _N), [
                [
                  e.vModelText,
                  i[g.key],
                  void 0,
                  { number: !0 }
                ]
              ]),
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(g.unit),
                1
                /* TEXT */
              )
            ])
          ])),
          64
          /* STABLE_FRAGMENT */
        ))
      ]),
      E.value ? (e.openBlock(), e.createElementBlock("p", BN, [
        a[1] || (a[1] = e.createElementVNode(
          "i",
          { class: "ri-alert-line" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(E.value),
          1
          /* TEXT */
        )
      ])) : e.createCommentVNode("v-if", !0),
      e.createElementVNode("div", SN, [
        e.createElementVNode("button", {
          type: "button",
          class: "ss-btn primary",
          disabled: o.value || !k.value || !!E.value,
          "data-test": "mm-params-save",
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
            e.toDisplayString(w.$t("保存")),
            1
            /* TEXT */
          )
        ], 8, DN),
        k.value ? (e.openBlock(), e.createElementBlock(
          "button",
          {
            key: 0,
            type: "button",
            class: "ss-link",
            onClick: m
          },
          e.toDisplayString(w.$t("撤销修改")),
          1
          /* TEXT */
        )) : e.createCommentVNode("v-if", !0),
        e.createElementVNode(
          "button",
          {
            type: "button",
            class: "ss-link",
            onClick: r
          },
          e.toDisplayString(w.$t("恢复默认")),
          1
          /* TEXT */
        )
      ])
    ]));
  }
}), CN = /* @__PURE__ */ ae(wN, [["__scopeId", "data-v-ae3507ae"]]), TN = {
  class: "mm-sm",
  "data-test": "mm-mobile-settings"
}, IN = { class: "mm-sp__head" }, MN = {
  key: 0,
  class: "ss-note danger"
}, AN = { class: "mm-sm__svc" }, jN = { class: "mm-sm__addr" }, LN = {
  key: 0,
  class: "mono"
}, zN = {
  key: 1,
  class: "muted"
}, FN = { class: "ss-muted" }, PN = { class: "mm-sm__tools" }, UN = { class: "mm-sm__qr" }, ON = { class: "mm-search" }, RN = ["placeholder", "aria-label"], qN = { class: "ss-table-wrap" }, KN = { class: "ss-table" }, HN = { class: "num" }, WN = { key: 0 }, GN = {
  colspan: "4",
  class: "mm-sm__empty"
}, YN = { class: "mm-sm__link" }, JN = { class: "mono" }, QN = ["src", "alt"], ZN = {
  key: 1,
  class: "ss-muted"
}, XN = { class: "num" }, xN = ["disabled", "title", "data-test", "onClick"], eV = ["disabled", "data-test", "onClick"], tV = { class: "mm-sm__foot" }, lV = ["aria-label"], nV = ["disabled", "aria-label"], oV = ["onClick"], aV = ["disabled", "aria-label"], sV = /* @__PURE__ */ e.defineComponent({
  __name: "SettingsMobile",
  props: {
    people: {},
    depts: {}
  },
  setup(l) {
    const v = l, n = Be.useDialog(), u = ce.useNotificationStore(), y = e.ref({ running: !!oe.value?.mobile.running, url: oe.value?.mobile.url }), s = e.ref(""), o = e.ref(""), c = e.ref(""), i = e.ref(1), k = e.ref(!1), E = e.reactive({}), m = e.reactive({}), r = (C) => v.depts.find((I) => I.id === C)?.name || "", N = e.computed(() => v.people.filter((C) => !C.left && kt(C, r(C.deptId), c.value))), w = e.computed(() => Lt(N.value, i.value, 10));
    e.watch(c, () => {
      i.value = 1;
    });
    async function a() {
      try {
        const C = await J("mobile.status");
        C && (y.value = { running: !!C.running, url: C.url });
      } catch (C) {
        o.value = x.errorMessage(C);
      }
    }
    async function g(C) {
      !E[C] || m[C] || (m[C] = await Mt.toDataURL(E[C], { margin: 1, width: 240 }).catch(() => ""));
    }
    async function D(C) {
      s.value = C.id, o.value = "";
      try {
        if (!E[C.id]) {
          const I = Je(await J("mobile.link", { personId: C.id }));
          if (!I) throw new Error(t.t("没拿到专属链接，请确认手机页服务已开启"));
          E[C.id] = I;
        }
        k.value && await g(C.id), await Qe(E[C.id]) && u.success(t.t("已复制 {name} 的专属链接", { name: C.name }));
      } catch (I) {
        o.value = x.errorMessage(I);
      } finally {
        s.value = "";
      }
    }
    async function P(C) {
      if (await n.confirm({
        title: t.t("重置专属链接"),
        message: t.t("重置后 {name} 的旧链接立即失效（包括已发出的企微卡片按钮），需要把新链接重新发给本人。确定吗？", { name: C.name }),
        danger: !0,
        confirmLabel: t.t("重置")
      })) {
        s.value = C.id, o.value = "";
        try {
          const U = Je(await J("mobile.link", { personId: C.id, reset: !0 }));
          if (!U) throw new Error(t.t("没拿到专属链接，请确认手机页服务已开启"));
          E[C.id] = U, delete m[C.id], k.value && await g(C.id), u.success(t.t("已重置 {name} 的专属链接", { name: C.name }));
        } catch (U) {
          o.value = x.errorMessage(U);
        } finally {
          s.value = "";
        }
      }
    }
    e.watch(k, (C) => {
      C && Object.keys(E).forEach((I) => {
        g(I);
      });
    });
    let j = null;
    return e.onMounted(() => {
      a(), j = _e((C) => {
        C.type === "mobile" && (y.value = { running: C.running, url: C.url }, C.running || (Object.keys(E).forEach((I) => delete E[I]), Object.keys(m).forEach((I) => delete m[I])));
      });
    }), e.onBeforeUnmount(() => j?.()), (C, I) => (e.openBlock(), e.createElementBlock("div", TN, [
      e.createElementVNode("header", IN, [
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
            class: e.normalizeClass(["ss-chip", y.value.running ? "ok" : ""]),
            "data-test": "mm-mobile-settings-state"
          },
          e.toDisplayString(y.value.running ? C.$t("运行中") : C.$t("未开启")),
          3
          /* TEXT, CLASS */
        )
      ]),
      o.value ? (e.openBlock(), e.createElementBlock("p", MN, [
        I[5] || (I[5] = e.createElementVNode(
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
      e.createElementVNode("section", AN, [
        e.createElementVNode("div", jN, [
          e.createElementVNode(
            "small",
            null,
            e.toDisplayString(C.$t("局域网地址")),
            1
            /* TEXT */
          ),
          y.value.running && y.value.url ? (e.openBlock(), e.createElementBlock(
            "b",
            LN,
            e.toDisplayString(y.value.url),
            1
            /* TEXT */
          )) : (e.openBlock(), e.createElementBlock(
            "b",
            zN,
            e.toDisplayString(C.$t("服务未开启")),
            1
            /* TEXT */
          ))
        ]),
        e.createElementVNode("button", {
          type: "button",
          class: "ss-btn",
          "data-test": "mm-mobile-goto-home",
          onClick: I[0] || (I[0] = (U) => e.unref(ve)("home"))
        }, [
          I[6] || (I[6] = e.createElementVNode(
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
        FN,
        e.toDisplayString(C.$t("专属链接只发给本人，泄露了可以让管理员重置。")),
        1
        /* TEXT */
      ),
      e.createElementVNode("div", PN, [
        e.createElementVNode(
          "h4",
          null,
          e.toDisplayString(C.$t("每人专属链接")),
          1
          /* TEXT */
        ),
        I[8] || (I[8] = e.createElementVNode(
          "span",
          { class: "grow" },
          null,
          -1
          /* CACHED */
        )),
        e.createElementVNode("label", UN, [
          e.withDirectives(e.createElementVNode(
            "input",
            {
              "onUpdate:modelValue": I[1] || (I[1] = (U) => k.value = U),
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
        e.createElementVNode("label", ON, [
          I[7] || (I[7] = e.createElementVNode(
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
            "onUpdate:modelValue": I[2] || (I[2] = (U) => c.value = U),
            type: "search",
            placeholder: C.$t("搜索员工"),
            "aria-label": C.$t("搜索员工")
          }, null, 8, RN), [
            [e.vModelText, c.value]
          ])
        ])
      ]),
      e.createElementVNode("div", qN, [
        e.createElementVNode("table", KN, [
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
                HN,
                e.toDisplayString(C.$t("操作")),
                1
                /* TEXT */
              )
            ])
          ]),
          e.createElementVNode("tbody", null, [
            w.value.rows.length ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock("tr", WN, [
              e.createElementVNode(
                "td",
                GN,
                e.toDisplayString(C.$t("没有符合条件的员工")),
                1
                /* TEXT */
              )
            ])),
            (e.openBlock(!0), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(w.value.rows, (U) => (e.openBlock(), e.createElementBlock("tr", {
                key: U.id
              }, [
                e.createElementVNode("td", null, [
                  e.createVNode(ze, {
                    name: U.name
                  }, null, 8, ["name"])
                ]),
                e.createElementVNode(
                  "td",
                  null,
                  e.toDisplayString(r(U.deptId) || "—"),
                  1
                  /* TEXT */
                ),
                e.createElementVNode("td", YN, [
                  E[U.id] ? (e.openBlock(), e.createElementBlock(
                    e.Fragment,
                    { key: 0 },
                    [
                      e.createElementVNode(
                        "span",
                        JN,
                        e.toDisplayString(E[U.id]),
                        1
                        /* TEXT */
                      ),
                      k.value && m[U.id] ? (e.openBlock(), e.createElementBlock("img", {
                        key: 0,
                        src: m[U.id],
                        alt: C.$t("{name} 的专属链接二维码", { name: U.name }),
                        width: "120",
                        height: "120"
                      }, null, 8, QN)) : e.createCommentVNode("v-if", !0)
                    ],
                    64
                    /* STABLE_FRAGMENT */
                  )) : (e.openBlock(), e.createElementBlock("span", ZN, "—"))
                ]),
                e.createElementVNode("td", XN, [
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-link",
                    disabled: !y.value.running || s.value === U.id,
                    title: y.value.running ? "" : C.$t("先开启手机页服务"),
                    "data-test": `mm-mobile-link-${U.id}`,
                    onClick: (q) => D(U)
                  }, e.toDisplayString(E[U.id] ? C.$t("复制链接") : C.$t("生成并复制")), 9, xN),
                  E[U.id] ? (e.openBlock(), e.createElementBlock(
                    e.Fragment,
                    { key: 0 },
                    [
                      I[9] || (I[9] = e.createElementVNode(
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
                        disabled: s.value === U.id,
                        "data-test": `mm-mobile-reset-${U.id}`,
                        onClick: (q) => P(U)
                      }, e.toDisplayString(C.$t("重置")), 9, eV)
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
      e.createElementVNode("footer", tV, [
        e.createElementVNode(
          "span",
          null,
          e.toDisplayString(C.$t("共 {n} 人", { n: N.value.length })),
          1
          /* TEXT */
        ),
        I[12] || (I[12] = e.createElementVNode(
          "span",
          { class: "grow" },
          null,
          -1
          /* CACHED */
        )),
        w.value.pages > 1 ? (e.openBlock(), e.createElementBlock("nav", {
          key: 0,
          class: "mm-pager",
          "aria-label": C.$t("分页")
        }, [
          e.createElementVNode("button", {
            type: "button",
            disabled: w.value.page <= 1,
            "aria-label": C.$t("上一页"),
            onClick: I[3] || (I[3] = (U) => i.value = w.value.page - 1)
          }, [...I[10] || (I[10] = [
            e.createElementVNode(
              "i",
              { class: "ri-arrow-left-s-line" },
              null,
              -1
              /* CACHED */
            )
          ])], 8, nV),
          (e.openBlock(!0), e.createElementBlock(
            e.Fragment,
            null,
            e.renderList(w.value.pages, (U) => (e.openBlock(), e.createElementBlock("button", {
              key: U,
              type: "button",
              class: e.normalizeClass({ on: U === w.value.page }),
              onClick: (q) => i.value = U
            }, e.toDisplayString(U), 11, oV))),
            128
            /* KEYED_FRAGMENT */
          )),
          e.createElementVNode("button", {
            type: "button",
            disabled: w.value.page >= w.value.pages,
            "aria-label": C.$t("下一页"),
            onClick: I[4] || (I[4] = (U) => i.value = w.value.page + 1)
          }, [...I[11] || (I[11] = [
            e.createElementVNode(
              "i",
              { class: "ri-arrow-right-s-line" },
              null,
              -1
              /* CACHED */
            )
          ])], 8, aV)
        ], 8, lV)) : e.createCommentVNode("v-if", !0)
      ])
    ]));
  }
}), rV = /* @__PURE__ */ ae(sV, [["__scopeId", "data-v-d5d7ac31"]]), iV = {
  class: "mm-sd",
  "data-test": "mm-demo"
}, cV = { class: "mm-sp__head" }, dV = {
  key: 0,
  class: "ss-note danger"
}, mV = { class: "ss-note warn" }, uV = { class: "mm-sd__cards" }, pV = { class: "mm-sd__card" }, vV = ["disabled"], kV = { class: "mm-sd__card" }, yV = ["disabled"], gV = /* @__PURE__ */ e.defineComponent({
  __name: "SettingsDemo",
  emits: ["changed"],
  setup(l, { emit: v }) {
    const n = v, u = Be.useDialog(), y = ce.useNotificationStore(), s = e.ref(!1), o = e.ref(""), c = e.ref("");
    async function i(m, r) {
      s.value = !0, o.value = m, c.value = "";
      try {
        await J(m === "load" ? "demo.load" : "demo.clear"), await de().catch(() => null), y.success(r), n("changed");
      } catch (N) {
        c.value = x.errorMessage(N);
      } finally {
        s.value = !1, o.value = "";
      }
    }
    async function k() {
      await u.confirm({
        title: t.t("载入演示数据"),
        message: t.t("载入演示组织和示例项目？工作台里已有正式数据时，请先确认不会和演示数据混在一起。"),
        confirmLabel: t.t("载入")
      }) && await i("load", t.t("演示数据已载入"));
    }
    async function E() {
      await u.confirm({
        title: t.t("清空数据"),
        message: t.t("删除全部项目、会议（含上传的文件）、任务和通知，不能撤销；组织、声纹与系统设置保留。确定清空吗？"),
        confirmLabel: t.t("清空"),
        danger: !0
      }) && await i("clear", t.t("数据已清空"));
    }
    return (m, r) => (e.openBlock(), e.createElementBlock("div", iV, [
      e.createElementVNode("header", cV, [
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
      c.value ? (e.openBlock(), e.createElementBlock("p", dV, [
        r[0] || (r[0] = e.createElementVNode(
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
      ])) : e.createCommentVNode("v-if", !0),
      e.createElementVNode("p", mV, [
        r[1] || (r[1] = e.createElementVNode(
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
      e.createElementVNode("div", uV, [
        e.createElementVNode("section", pV, [
          r[2] || (r[2] = e.createElementVNode(
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
          ], 8, vV)
        ]),
        e.createElementVNode("section", kV, [
          r[3] || (r[3] = e.createElementVNode(
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
            onClick: E
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
          ], 8, yV)
        ])
      ])
    ]));
  }
}), fV = /* @__PURE__ */ ae(gV, [["__scopeId", "data-v-2c906f2d"]]), NV = {
  class: "mm-settings",
  "data-test": "mm-settings-tab"
}, VV = { class: "mm-pagehead" }, EV = {
  key: 0,
  class: "ss-empty",
  "data-test": "mm-settings-denied"
}, $V = {
  key: 1,
  class: "mm-settings__grid"
}, bV = ["aria-label"], hV = ["aria-current", "data-test", "onClick"], _V = { class: "mm-settings__panel" }, BV = {
  key: 0,
  class: "ss-note danger"
}, SV = {
  key: 1,
  class: "ss-muted"
}, DV = /* @__PURE__ */ e.defineComponent({
  __name: "SettingsTab",
  setup(l, { expose: v }) {
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
    e.watch(nt, (P) => {
      P && n.some((j) => j.key === P) && (u.value = P), P && (nt.value = "");
    }, { immediate: !0 });
    const y = e.ref(null), s = e.ref([]), o = e.ref([]), c = e.ref(0), i = e.ref(""), k = e.computed(() => !!oe.value?.me.isAdmin);
    async function E() {
      try {
        y.value = await J("settings.get"), i.value = "";
      } catch (P) {
        i.value = x.errorMessage(P);
      }
    }
    async function m() {
      try {
        const P = await J("people.list");
        s.value = P?.people ?? [], o.value = P?.depts ?? [];
      } catch (P) {
        i.value = x.errorMessage(P);
      }
    }
    let r = 0;
    async function N() {
      r = Date.now(), c.value += 1, await Promise.all([E(), m(), de().catch(() => null)]);
    }
    async function w(P) {
      P && typeof P == "object" && "adminIds" in P ? y.value = P : await E(), await de().catch(() => null);
    }
    let a = null, g = null;
    e.onMounted(() => {
      k.value && N(), g = _e((P) => {
        P.type !== "changed" || !["all", "org", "settings"].includes(P.scope) || (a && clearTimeout(a), a = setTimeout(() => {
          a = null, k.value && N();
        }, 300));
      });
    }), e.watch(k, (P) => {
      P && !y.value && N();
    });
    function D() {
      a || !k.value || Date.now() - r < 800 || (a = setTimeout(() => {
        a = null, N();
      }, 300));
    }
    return v({ refresh: D }), e.onBeforeUnmount(() => {
      g?.(), a && clearTimeout(a);
    }), (P, j) => (e.openBlock(), e.createElementBlock("div", NV, [
      e.createElementVNode("header", VV, [
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
      k.value ? (e.openBlock(), e.createElementBlock("div", $V, [
        e.createElementVNode("nav", {
          class: "mm-smenu",
          "aria-label": P.$t("设置项")
        }, [
          (e.openBlock(), e.createElementBlock(
            e.Fragment,
            null,
            e.renderList(n, (C) => e.createElementVNode("button", {
              key: C.key,
              type: "button",
              class: e.normalizeClass({ on: u.value === C.key }),
              "aria-current": u.value === C.key ? "page" : void 0,
              "data-test": `mm-settings-menu-${C.key}`,
              onClick: (I) => u.value = C.key
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
            ], 10, hV)),
            64
            /* STABLE_FRAGMENT */
          ))
        ], 8, bV),
        e.createElementVNode("section", _V, [
          i.value ? (e.openBlock(), e.createElementBlock("p", BV, [
            j[0] || (j[0] = e.createElementVNode(
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
          !y.value && !i.value ? (e.openBlock(), e.createElementBlock(
            "p",
            SV,
            e.toDisplayString(P.$t("加载中…")),
            1
            /* TEXT */
          )) : y.value ? (e.openBlock(), e.createElementBlock(
            e.Fragment,
            { key: 2 },
            [
              u.value === "voiceprint" ? (e.openBlock(), e.createBlock(Zy, {
                key: 0,
                people: s.value,
                depts: o.value,
                "refresh-seq": c.value
              }, null, 8, ["people", "depts", "refresh-seq"])) : u.value === "org" ? (e.openBlock(), e.createBlock(Mg, {
                key: 1,
                people: s.value,
                depts: o.value,
                onChanged: N
              }, null, 8, ["people", "depts"])) : u.value === "roles" ? (e.openBlock(), e.createBlock(Wg, {
                key: 2,
                settings: y.value,
                people: s.value,
                depts: o.value,
                onSaved: w
              }, null, 8, ["settings", "people", "depts"])) : u.value === "ai" ? (e.openBlock(), e.createBlock(y1, {
                key: 3,
                settings: y.value,
                onSaved: w
              }, null, 8, ["settings"])) : u.value === "wecom" ? (e.openBlock(), e.createBlock(fN, {
                key: 4,
                settings: y.value,
                onSaved: w
              }, null, 8, ["settings"])) : u.value === "params" ? (e.openBlock(), e.createBlock(CN, {
                key: 5,
                settings: y.value,
                onSaved: w
              }, null, 8, ["settings"])) : u.value === "mobile" ? (e.openBlock(), e.createBlock(rV, {
                key: 6,
                people: s.value,
                depts: o.value
              }, null, 8, ["people", "depts"])) : (e.openBlock(), e.createBlock(fV, {
                key: 7,
                onChanged: N
              }))
            ],
            64
            /* STABLE_FRAGMENT */
          )) : e.createCommentVNode("v-if", !0)
        ])
      ])) : (e.openBlock(), e.createElementBlock(
        "p",
        EV,
        e.toDisplayString(P.$t("只有管理员可以查看和修改系统设置。如需调整，请联系管理员。")),
        1
        /* TEXT */
      ))
    ]));
  }
}), wV = /* @__PURE__ */ ae(DV, [["__scopeId", "data-v-0fcda9a3"]]), CV = ["aria-label"], TV = { class: "mm-sw2" }, IV = { class: "mm-sw2__head" }, MV = { class: "mm-sw2__title" }, AV = {
  class: "mm-sw2__progress",
  "data-test": "mm-setup-progress"
}, jV = { class: "mm-bar" }, LV = { class: "mm-sw2__body" }, zV = ["aria-label"], FV = ["data-test", "onClick"], PV = { class: "mm-sw2__num" }, UV = {
  key: 0,
  class: "ri-check-line"
}, OV = { class: "mm-sw2__stxt" }, RV = { class: "mm-sw2__panel" }, qV = {
  key: 0,
  class: "mm-sw2__step",
  "data-test": "mm-setup-identity"
}, KV = { class: "ss-muted" }, HV = ["placeholder"], WV = { class: "mm-sw2__people" }, GV = ["disabled", "data-test", "onClick"], YV = {
  key: 0,
  class: "ss-muted"
}, JV = {
  key: 0,
  class: "ss-note danger"
}, QV = {
  key: 0,
  class: "ss-note danger"
}, ZV = {
  key: 1,
  class: "ss-note"
}, XV = {
  key: 0,
  class: "mm-sw2__step",
  "data-test": "mm-setup-models"
}, xV = { class: "ss-muted" }, eE = {
  class: "mm-sw2__hw",
  "data-test": "mm-setup-hw"
}, tE = { class: "mm-sw2__items" }, lE = {
  class: "ss-chip ok",
  "data-test": "mm-setup-spk-ok"
}, nE = ["disabled"], oE = ["disabled"], aE = {
  key: 0,
  class: "ss-muted mono mm-sw2__log",
  "data-test": "mm-setup-install-log"
}, sE = {
  key: 1,
  class: "ss-note danger"
}, rE = {
  class: "mm-sw2__step",
  "data-test": "mm-setup-org"
}, iE = { class: "ss-muted" }, cE = {
  class: "ss-note info",
  "data-test": "mm-setup-org-now"
}, dE = { class: "mm-sw2__opts" }, mE = ["disabled"], uE = { class: "mm-sw2__row" }, pE = ["disabled"], vE = { class: "mm-sw2__links" }, kE = { class: "mm-sw2__form" }, yE = { class: "mm-sw2__secret" }, gE = ["type", "placeholder"], fE = ["title", "disabled"], NE = ["disabled"], VE = {
  class: "mm-sw2__guide",
  "data-test": "mm-setup-app-guide"
}, EE = { class: "mm-sw2__ol" }, $E = {
  key: 0,
  class: "ss-note warn mm-sw2__ip",
  "data-test": "mm-setup-egress-ip"
}, bE = { class: "mono" }, hE = {
  class: "mm-sw2__step",
  "data-test": "mm-setup-push"
}, _E = { class: "ss-muted" }, BE = { class: "mm-sw2__box" }, SE = { class: "mm-sw2__boxhead" }, DE = { class: "mm-sw2__ol" }, wE = { class: "mm-sw2__row" }, CE = ["placeholder"], TE = ["disabled"], IE = ["disabled"], ME = { class: "mm-sw2__box" }, AE = {
  class: "ss-muted",
  "data-test": "mm-setup-mentionable"
}, jE = { class: "mm-sw2__row" }, LE = { class: "mm-sw2__who" }, zE = ["placeholder"], FE = ["disabled"], PE = { class: "ss-muted" }, UE = {
  class: "mm-sw2__step",
  "data-test": "mm-setup-mobile-step"
}, OE = { class: "ss-muted" }, RE = {
  class: "mm-sw2__step",
  "data-test": "mm-setup-voice"
}, qE = { class: "ss-muted" }, KE = {
  key: 0,
  class: "ss-note warn"
}, HE = { class: "mm-sw2__consent" }, WE = { class: "mm-sw2__row" }, GE = ["disabled"], YE = ["disabled"], JE = {
  class: "mm-sw2__step",
  "data-test": "mm-setup-ai"
}, QE = { class: "ss-muted" }, ZE = ["disabled"], XE = {
  class: "mm-sw2__step",
  "data-test": "mm-setup-finish"
}, xE = { class: "mm-sw2__sum" }, e$ = ["onClick"], t$ = { class: "ss-muted" }, l$ = {
  key: 7,
  class: "ss-note danger",
  "data-test": "mm-setup-error"
}, n$ = { class: "mm-sw2__foot" }, o$ = ["disabled"], a$ = ["disabled"], s$ = /* @__PURE__ */ e.defineComponent({
  __name: "SetupWizard",
  emits: ["close", "done"],
  setup(l, { emit: v }) {
    const n = [
      { key: "models", title: t.t("电脑配置与语音模型") },
      { key: "org", title: t.t("组织架构") },
      { key: "push", title: t.t("通知推送") },
      { key: "mobile", title: t.t("手机端") },
      { key: "voice", title: t.t("采集你的声纹") },
      { key: "ai", title: t.t("大模型") }
    ], u = [...n.map((A) => A.key), "finish"], y = v, s = e.ref(null), o = e.ref("models"), c = e.computed(() => u.indexOf(o.value)), i = e.reactive(/* @__PURE__ */ new Set()), k = e.ref(""), E = e.ref(""), m = e.ref(!1), r = e.ref(""), N = e.ref(""), w = e.ref(""), a = e.ref(null), g = e.reactive({ corpId: "", agentId: "", secret: "" }), D = e.ref(""), P = e.ref(null), j = e.ref(""), C = e.ref(!1), I = e.ref(null), U = e.ref(null), q = e.ref(null), B = e.ref(!1), S = e.ref(!1), b = e.ref(!1), M = e.ref([]), T = e.ref([]), G = e.ref(""), V = e.computed(() => {
      const A = G.value.trim(), H = A ? M.value.filter((ge) => ge.name.includes(A)) : M.value, te = [];
      for (const ge of T.value) {
        const qe = H.filter((Qt) => Qt.deptId === ge.id);
        qe.length && te.push({ id: ge.id, name: ge.name, people: qe });
      }
      const ie = H.filter((ge) => !T.value.some((qe) => qe.id === ge.deptId));
      return ie.length && te.push({ id: "_", name: t.t("其他"), people: ie }), te;
    }), d = e.computed(() => /60020|可信 IP|trusted IP/i.test(E.value) ? /(\d{1,3}(?:\.\d{1,3}){3})/.exec(E.value)?.[1] ?? "" : "");
    async function p() {
      try {
        await navigator.clipboard.writeText(d.value);
      } catch {
      }
    }
    const z = /当前身份无效|请先选择身份|identity is invalid|select an identity/i;
    async function X() {
      try {
        s.value = await J("setup.status"), k.value = "", b.value = !1, j.value = s.value.me.mobile || "", !g.corpId && s.value.wecom?.corpId && (g.corpId = s.value.wecom.corpId), !g.agentId && s.value.wecom?.agentId && (g.agentId = s.value.wecom.agentId), ye(s.value.modelDownload);
      } catch (A) {
        const H = x.errorMessage(A);
        z.test(H) ? await le() : k.value = H;
      }
    }
    async function le() {
      try {
        const A = await J("people.list");
        T.value = A?.depts ?? [], M.value = A?.people ?? [];
      } catch {
      }
      G.value = "", b.value = !0;
    }
    function W(A) {
      return h("identity", async () => {
        await J("identity.set", { personId: A }), He(), await de().catch(() => null), b.value = !1, await X();
      });
    }
    async function Y() {
      if (!S.value && !g.secret && s.value?.wecom?.hasSecret)
        try {
          const A = await J("wecom.secret.reveal");
          g.secret = A?.secret || "";
        } catch (A) {
          E.value = x.errorMessage(A);
          return;
        }
      S.value = !S.value;
    }
    function ee(A) {
      const H = s.value;
      if (!H) return !1;
      switch (A) {
        case "models":
          return (H.models.asrReady || H.asr?.mode === "cloud" && !!H.asr.cloud?.hasKey) && H.models.speaker && H.models.python && H.models.ffmpeg;
        case "org":
          return H.org.people > 0 && (H.org.source !== "demo" || B.value);
        case "push":
          return !!H.push.channel;
        case "mobile":
          return H.mobile.running;
        case "voice":
          return H.me.voiceprint;
        case "ai":
          return !!q.value?.ok;
      }
    }
    function ne(A) {
      return A === "finish" ? "todo" : ee(A) ? "done" : i.has(A) ? "skipped" : "todo";
    }
    const $ = e.computed(() => n.filter((A) => ee(A.key)).length);
    function O(A) {
      const H = s.value;
      if (!H) return "";
      switch (A) {
        case "models": {
          const te = H.asr?.mode === "cloud" ? t.t("在线接口") : H.recommend.engine === "firered" ? "FireRedASR2" : "SenseVoice";
          return ee(A) ? t.t("{m} 和声纹模型已就绪", { m: te }) : t.t("推荐 {m}", { m: te });
        }
        case "org":
          return t.t("{src} · {n} 人", { src: R.value, n: H.org.people });
        case "push":
          return H.push.channel === "app" ? t.t("企微自建应用") : H.push.channel === "webhook" ? t.t("企微群机器人") : t.t("只进消息中心");
        case "mobile":
          return H.mobile.running ? t.t("运行中") : t.t("未开启");
        case "voice":
          return H.me.voiceprint ? t.t("已采集") : t.t("未采集");
        case "ai":
          return q.value ? q.value.ok ? t.t("可用") : t.t("没连上") : t.t("未测试");
      }
    }
    const R = e.computed(() => {
      const A = s.value?.org.source;
      return A === "wecom" ? t.t("企微通讯录") : A === "import" ? t.t("导入的通讯录") : A === "demo" ? t.t("演示组织") : t.t("还没有组织");
    }), F = e.computed(() => ({ good: t.t("配置很好"), ok: t.t("够用"), weak: t.t("偏弱") })[s.value?.recommend.tier || "ok"]), K = e.computed(() => ({ good: "ok", ok: "brand", weak: "warn" })[s.value?.recommend.tier || "ok"]), _ = e.computed(() => t.t("大家好，我是{dept}的{name}。这是我的声纹采集录音，用于在会议纪要里自动识别我的发言。我会用平时开会说话的音量和语速，把这段话完整地读完。", {
      dept: s.value?.me.deptName || "",
      name: s.value?.me.name || ""
    }));
    async function h(A, H) {
      m.value = !0, r.value = A, E.value = "";
      try {
        await H();
      } catch (te) {
        E.value = x.errorMessage(te);
      } finally {
        m.value = !1, r.value = "";
      }
    }
    function f(A) {
      A && (o.value = A, E.value = "");
    }
    function L() {
      o.value !== "finish" && i.add(o.value), f(u[c.value + 1]);
    }
    e.watch(o, (A) => {
      A === "mobile" && s.value && !s.value.mobile.running && h("mobile", async () => {
        await J("mobile.start"), await X(), await de().catch(() => null);
      });
    });
    const Q = () => window.electronAPI?.pyExt;
    let Z = null, se = null;
    function ye(A) {
      if (!A) return;
      const H = s.value?.recommend.speakerInstallId || "speaker-campplus", te = A.activeId === H || (A.queue || []).includes(H) ? H : "", ie = !!N.value;
      N.value = te, te ? (w.value = A.activeId === H ? A.line || t.t("正在下载…") : t.t("已排队，等待前一个模型完成…"), E.value = "") : ie && (A.error ? (E.value = A.error, w.value = "") : w.value = A.line || t.t("下载完成"));
    }
    async function be(A, H = !1) {
      N.value = A, w.value = t.t("开始下载…"), E.value = "";
      try {
        const ie = await J("model.download.start", { ids: [A], ...H ? { force: !0 } : {} });
        ye(ie);
        return;
      } catch (ie) {
        const ge = x.errorMessage(ie);
        if (!/未知操作|unexpected action/i.test(ge)) {
          N.value = "", E.value = ge;
          return;
        }
      }
      const te = Q();
      if (!te?.install) {
        N.value = "", E.value = t.t("组件安装器不可用，请到应用的 设置 → 语音 里下载");
        return;
      }
      try {
        H && te.remove && await te.remove(A);
        const ie = await te.install(A);
        ie?.ok ? w.value = t.t("下载完成") : E.value = ie?.error || t.t("下载失败"), await X();
      } catch (ie) {
        E.value = x.errorMessage(ie);
      } finally {
        N.value = "";
      }
    }
    function Te() {
      return h("demo", async () => {
        const A = s.value?.org.source !== "demo" ? await J("org.sync") : null;
        B.value = !0, await de().catch(() => null), A?.needIdentity ? await le() : await X();
      });
    }
    function ue() {
      return h("import", async () => {
        const A = await J("org.importFile");
        A && (a.value = A, await de().catch(() => null), A.needIdentity ? await le() : await X());
      });
    }
    function Re() {
      return h("app", async () => {
        const A = { corpId: g.corpId.trim(), agentId: g.agentId.trim() };
        g.secret && (A.secret = g.secret), await J("wecom.save", A);
        const H = await J("org.sync");
        if (H?.error) throw new Error(H.error);
        await de().catch(() => null), H?.needIdentity ? await le() : await X();
      });
    }
    function tt() {
      return h("hook", async () => {
        P.value = null, await J("wecom.webhook.save", { url: D.value.trim() }), D.value = "", await X(), await de().catch(() => null);
      });
    }
    function Kt() {
      return h("hookTest", async () => {
        const A = await J("wecom.webhook.test");
        P.value = { ok: !!A?.ok, error: A?.error };
      });
    }
    function Ht() {
      return h("mobileNo", async () => {
        s.value && (await J("org.person.contact", { personId: s.value.me.id, mobile: j.value.trim() }), await X());
      });
    }
    function Wt() {
      return h("voice", async () => {
        if (!(!I.value || !s.value)) {
          U.value = null;
          try {
            const A = await J("voiceprint.enrollData", { personId: s.value.me.id, consent: !0, data: I.value.data, ext: I.value.ext });
            U.value = { ok: !0, seconds: A?.seconds };
          } catch (A) {
            U.value = { ok: !1, error: x.errorMessage(A) };
          }
          await X();
        }
      });
    }
    function Gt() {
      return h("voice", async () => {
        if (s.value) {
          U.value = null;
          try {
            const A = await J("voiceprint.import", { personId: s.value.me.id, consent: !0 });
            A && (U.value = { ok: !0, seconds: A.seconds });
          } catch (A) {
            U.value = { ok: !1, error: x.errorMessage(A) };
          }
          await X();
        }
      });
    }
    function Yt() {
      return h("llm", async () => {
        q.value = await J("setup.llmTest");
      });
    }
    function Jt() {
      return h("finish", async () => {
        await J("setup.finish"), await de().catch(() => null), y("done");
      });
    }
    return e.onMounted(() => {
      X(), se = _e((H) => {
        if (H.type !== "model_download") return;
        const te = N.value;
        ye(H.status), te && !N.value && X();
      });
      const A = Q();
      A?.onInstallProgress && (Z = A.onInstallProgress((H) => {
        H?.id && H.id === N.value && H.line && (w.value = String(H.line).slice(0, 200));
      }));
    }), e.onBeforeUnmount(() => {
      try {
        Z?.();
      } catch {
      }
      try {
        se?.();
      } catch {
      }
    }), (A, H) => (e.openBlock(), e.createElementBlock("div", {
      class: "mm-setup-overlay",
      role: "dialog",
      "aria-modal": "true",
      "aria-label": A.$t("配置引导"),
      "data-test": "mm-setup"
    }, [
      e.createElementVNode("div", TV, [
        e.createElementVNode("header", IV, [
          e.createElementVNode("div", MV, [
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
              onClick: H[0] || (H[0] = (te) => y("close"))
            },
            e.toDisplayString(A.$t("稍后再说")),
            1
            /* TEXT */
          )
        ]),
        e.createCommentVNode(" 进度条固定在顶部，内容区自己滚 "),
        e.createElementVNode("div", AV, [
          e.createElementVNode("i", jV, [
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
        e.createElementVNode("div", LV, [
          e.createElementVNode("nav", {
            class: "mm-sw2__steps",
            "aria-label": A.$t("步骤")
          }, [
            (e.openBlock(), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(n, (te, ie) => e.createElementVNode("button", {
                key: te.key,
                type: "button",
                class: e.normalizeClass({ on: o.value === te.key, ok: ne(te.key) === "done", skip: ne(te.key) === "skipped" }),
                "data-test": `mm-setup-step-${te.key}`,
                onClick: (ge) => f(te.key)
              }, [
                e.createElementVNode("span", PV, [
                  ne(te.key) === "done" ? (e.openBlock(), e.createElementBlock("i", UV)) : (e.openBlock(), e.createElementBlock(
                    e.Fragment,
                    { key: 1 },
                    [
                      e.createTextVNode(
                        e.toDisplayString(ie + 1),
                        1
                        /* TEXT */
                      )
                    ],
                    64
                    /* STABLE_FRAGMENT */
                  ))
                ]),
                e.createElementVNode("span", OV, [
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
                    e.toDisplayString(O(te.key)),
                    1
                    /* TEXT */
                  )
                ])
              ], 10, FV)),
              64
              /* STABLE_FRAGMENT */
            ))
          ], 8, zV),
          e.createElementVNode("section", RV, [
            e.createCommentVNode(" 通讯录换成新的（企微同步 / 导入）后，原来的身份不在里面了：直接在这里选「你是谁」，选中的人成为管理员 "),
            b.value ? (e.openBlock(), e.createElementBlock("div", qV, [
              e.createElementVNode(
                "h3",
                null,
                e.toDisplayString(A.$t("通讯录已更新，你是哪一位？")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "p",
                KV,
                e.toDisplayString(A.$t("组织已经换成新的通讯录（{n} 人），原来的演示身份不在里面了。选你自己，之后按你的身份继续配置；你会成为泰途会议智能管理的管理员。", { n: M.value.length })),
                1
                /* TEXT */
              ),
              e.withDirectives(e.createElementVNode("input", {
                "onUpdate:modelValue": H[1] || (H[1] = (te) => G.value = te),
                class: "mm-sw2__search",
                type: "search",
                placeholder: A.$t("搜索姓名"),
                "data-test": "mm-setup-identity-search"
              }, null, 8, HV), [
                [e.vModelText, G.value]
              ]),
              e.createElementVNode("div", WV, [
                (e.openBlock(!0), e.createElementBlock(
                  e.Fragment,
                  null,
                  e.renderList(V.value, (te) => (e.openBlock(), e.createElementBlock(
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
                        e.renderList(te.people, (ie) => (e.openBlock(), e.createElementBlock("button", {
                          key: ie.id,
                          type: "button",
                          class: "mm-sw2__person",
                          disabled: m.value,
                          "data-test": `mm-setup-me-${ie.id}`,
                          onClick: (ge) => W(ie.id)
                        }, [
                          e.createElementVNode(
                            "strong",
                            null,
                            e.toDisplayString(ie.name),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "small",
                            null,
                            e.toDisplayString(ie.title || ""),
                            1
                            /* TEXT */
                          )
                        ], 8, GV))),
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
                V.value.length ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock(
                  "p",
                  YV,
                  e.toDisplayString(A.$t("没有找到这个人")),
                  1
                  /* TEXT */
                ))
              ]),
              E.value ? (e.openBlock(), e.createElementBlock("p", JV, [
                H[21] || (H[21] = e.createElementVNode(
                  "i",
                  { class: "ri-error-warning-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(E.value),
                  1
                  /* TEXT */
                )
              ])) : e.createCommentVNode("v-if", !0)
            ])) : (e.openBlock(), e.createElementBlock(
              e.Fragment,
              { key: 1 },
              [
                k.value ? (e.openBlock(), e.createElementBlock("p", QV, [
                  H[22] || (H[22] = e.createElementVNode(
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
                !s.value && !k.value ? (e.openBlock(), e.createElementBlock("p", ZV, [
                  H[23] || (H[23] = e.createElementVNode(
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
                    o.value === "models" ? (e.openBlock(), e.createElementBlock("div", XV, [
                      e.createElementVNode(
                        "h3",
                        null,
                        e.toDisplayString(A.$t("电脑配置与语音模型")),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "p",
                        xV,
                        e.toDisplayString(A.$t("按这台电脑的配置推荐跑得动的最准的转写模型（录音不出电脑）；也可以改填自己的在线语音识别接口。认人（声纹）始终在本机。")),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode("div", eE, [
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
                                class: e.normalizeClass(["ss-chip", K.value])
                              },
                              e.toDisplayString(F.value),
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
                      e.createElementVNode("ul", tE, [
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
                            e.Fragment,
                            { key: 0 },
                            [
                              e.createElementVNode(
                                "span",
                                lE,
                                e.toDisplayString(A.$t("已下载")),
                                1
                                /* TEXT */
                              ),
                              e.createElementVNode("button", {
                                type: "button",
                                class: "ss-btn sm",
                                disabled: !!N.value,
                                "data-test": "mm-setup-spk-reinstall",
                                onClick: H[2] || (H[2] = (te) => be(s.value.recommend.speakerInstallId, !0))
                              }, [
                                e.createElementVNode(
                                  "i",
                                  {
                                    class: e.normalizeClass(N.value === s.value.recommend.speakerInstallId ? "ri-loader-4-line spin" : "ri-refresh-line")
                                  },
                                  null,
                                  2
                                  /* CLASS */
                                ),
                                e.createTextVNode(
                                  e.toDisplayString(A.$t("重新下载")),
                                  1
                                  /* TEXT */
                                )
                              ], 8, nE)
                            ],
                            64
                            /* STABLE_FRAGMENT */
                          )) : (e.openBlock(), e.createElementBlock("button", {
                            key: 1,
                            type: "button",
                            class: "ss-btn primary sm",
                            disabled: !!N.value,
                            "data-test": "mm-setup-spk-install",
                            onClick: H[3] || (H[3] = (te) => be(s.value.recommend.speakerInstallId))
                          }, [
                            e.createElementVNode(
                              "i",
                              {
                                class: e.normalizeClass(N.value === s.value.recommend.speakerInstallId ? "ri-loader-4-line spin" : "ri-download-2-line")
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
                          ], 8, oE))
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
                      w.value ? (e.openBlock(), e.createElementBlock(
                        "p",
                        aE,
                        e.toDisplayString(w.value),
                        1
                        /* TEXT */
                      )) : e.createCommentVNode("v-if", !0),
                      s.value.models.python && s.value.models.ffmpeg ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock("p", sE, [
                        H[24] || (H[24] = e.createElementVNode(
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
                        e.createElementVNode("div", rE, [
                          e.createElementVNode(
                            "h3",
                            null,
                            e.toDisplayString(A.$t("组织架构")),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "p",
                            iE,
                            e.toDisplayString(A.$t("任务按部门派给部门负责人，发言人只在本场参会人里认，都要先有组织架构。")),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode("p", cE, [
                            H[25] || (H[25] = e.createElementVNode(
                              "i",
                              { class: "ri-team-line" },
                              null,
                              -1
                              /* CACHED */
                            )),
                            e.createTextVNode(
                              e.toDisplayString(A.$t("现在：{src} · {n} 人 · {d} 个部门", { src: R.value, n: s.value.org.people, d: s.value.org.depts })),
                              1
                              /* TEXT */
                            )
                          ]),
                          e.createElementVNode("div", dE, [
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
                                onClick: Te
                              }, e.toDisplayString(s.value.org.source === "demo" ? A.$t("就用演示组织") : A.$t("换回演示组织")), 9, mE)
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
                              e.createElementVNode("div", uE, [
                                e.createElementVNode("button", {
                                  type: "button",
                                  class: "ss-btn primary sm",
                                  disabled: m.value,
                                  "data-test": "mm-setup-org-import",
                                  onClick: ue
                                }, [
                                  e.createElementVNode(
                                    "i",
                                    {
                                      class: e.normalizeClass(r.value === "import" ? "ri-loader-4-line spin" : "ri-file-excel-2-line")
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
                                ], 8, pE),
                                e.createElementVNode("button", {
                                  type: "button",
                                  class: "ss-link",
                                  "data-test": "mm-setup-link-contacts",
                                  onClick: H[4] || (H[4] = (te) => e.unref(pe)(e.unref(Ve).contacts))
                                }, [
                                  e.createTextVNode(
                                    e.toDisplayString(A.$t("去企微后台导出")) + " ",
                                    1
                                    /* TEXT */
                                  ),
                                  H[26] || (H[26] = e.createElementVNode(
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
                              e.createElementVNode("div", vE, [
                                e.createElementVNode("button", {
                                  type: "button",
                                  class: "ss-link",
                                  "data-test": "mm-setup-link-profile",
                                  onClick: H[5] || (H[5] = (te) => e.unref(pe)(e.unref(Ve).profile))
                                }, [
                                  e.createTextVNode(
                                    e.toDisplayString(A.$t("打开企微·我的企业（查 CorpID）")) + " ",
                                    1
                                    /* TEXT */
                                  ),
                                  H[27] || (H[27] = e.createElementVNode(
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
                                  onClick: H[6] || (H[6] = (te) => e.unref(pe)(e.unref(Ve).apps))
                                }, [
                                  e.createTextVNode(
                                    e.toDisplayString(A.$t("打开企微·应用管理")) + " ",
                                    1
                                    /* TEXT */
                                  ),
                                  H[28] || (H[28] = e.createElementVNode(
                                    "i",
                                    { class: "ri-external-link-line" },
                                    null,
                                    -1
                                    /* CACHED */
                                  ))
                                ])
                              ]),
                              e.createElementVNode("div", kE, [
                                e.withDirectives(e.createElementVNode(
                                  "input",
                                  {
                                    "onUpdate:modelValue": H[7] || (H[7] = (te) => g.corpId = te),
                                    type: "text",
                                    placeholder: "CorpID",
                                    spellcheck: "false",
                                    "data-test": "mm-setup-corp"
                                  },
                                  null,
                                  512
                                  /* NEED_PATCH */
                                ), [
                                  [e.vModelText, g.corpId]
                                ]),
                                e.withDirectives(e.createElementVNode(
                                  "input",
                                  {
                                    "onUpdate:modelValue": H[8] || (H[8] = (te) => g.agentId = te),
                                    type: "text",
                                    placeholder: "AgentID",
                                    spellcheck: "false",
                                    "data-test": "mm-setup-agent"
                                  },
                                  null,
                                  512
                                  /* NEED_PATCH */
                                ), [
                                  [e.vModelText, g.agentId]
                                ]),
                                e.createElementVNode("span", yE, [
                                  e.withDirectives(e.createElementVNode("input", {
                                    "onUpdate:modelValue": H[9] || (H[9] = (te) => g.secret = te),
                                    type: S.value ? "text" : "password",
                                    placeholder: s.value.wecom?.hasSecret ? A.$t("已保存，点右边的眼睛查看") : "Secret",
                                    autocomplete: "new-password",
                                    spellcheck: "false",
                                    "data-test": "mm-setup-secret"
                                  }, null, 8, gE), [
                                    [e.vModelDynamic, g.secret]
                                  ]),
                                  e.createElementVNode("button", {
                                    type: "button",
                                    class: "mm-sw2__eye",
                                    title: S.value ? A.$t("隐藏") : A.$t("查看"),
                                    disabled: m.value,
                                    "data-test": "mm-setup-secret-eye",
                                    onClick: Y
                                  }, [
                                    e.createElementVNode(
                                      "i",
                                      {
                                        class: e.normalizeClass(S.value ? "ri-eye-off-line" : "ri-eye-line")
                                      },
                                      null,
                                      2
                                      /* CLASS */
                                    )
                                  ], 8, fE)
                                ])
                              ]),
                              e.createElementVNode("button", {
                                type: "button",
                                class: "ss-btn sm",
                                disabled: m.value || !g.corpId.trim() || !g.agentId.trim() || !g.secret && !s.value.push.appConfigured,
                                "data-test": "mm-setup-app-sync",
                                onClick: Re
                              }, [
                                e.createElementVNode(
                                  "i",
                                  {
                                    class: e.normalizeClass(r.value === "app" ? "ri-loader-4-line spin" : "ri-refresh-line")
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
                              ], 8, NE),
                              e.createElementVNode("details", VE, [
                                e.createElementVNode(
                                  "summary",
                                  null,
                                  e.toDisplayString(A.$t("第一次接入：在企业微信管理后台做这几步")),
                                  1
                                  /* TEXT */
                                ),
                                e.createElementVNode("ol", EE, [
                                  e.createElementVNode("li", null, [
                                    e.createTextVNode(
                                      e.toDisplayString(A.$t("应用管理 → 自建 → 创建应用；可见范围选全公司（应用只能读到可见范围里的部门和成员）")) + " ",
                                      1
                                      /* TEXT */
                                    ),
                                    e.createElementVNode("button", {
                                      type: "button",
                                      class: "ss-link",
                                      onClick: H[10] || (H[10] = (te) => e.unref(pe)(e.unref(Ve).apps))
                                    }, [
                                      e.createTextVNode(
                                        e.toDisplayString(A.$t("去打开")) + " ",
                                        1
                                        /* TEXT */
                                      ),
                                      H[29] || (H[29] = e.createElementVNode(
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
                                      onClick: H[11] || (H[11] = (te) => e.unref(pe)(e.unref(Ve).profile))
                                    }, [
                                      e.createTextVNode(
                                        e.toDisplayString(A.$t("去打开")) + " ",
                                        1
                                        /* TEXT */
                                      ),
                                      H[30] || (H[30] = e.createElementVNode(
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
                          d.value ? (e.openBlock(), e.createElementBlock("p", $E, [
                            H[32] || (H[32] = e.createElementVNode(
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
                                bE,
                                e.toDisplayString(d.value),
                                1
                                /* TEXT */
                              )
                            ]),
                            e.createElementVNode(
                              "button",
                              {
                                type: "button",
                                class: "ss-btn sm",
                                onClick: p
                              },
                              e.toDisplayString(A.$t("复制")),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode("button", {
                              type: "button",
                              class: "ss-link",
                              "data-test": "mm-setup-ip-open",
                              onClick: H[12] || (H[12] = (te) => e.unref(pe)(e.unref(Ve).apps))
                            }, [
                              e.createTextVNode(
                                e.toDisplayString(A.$t("去应用管理填写")) + " ",
                                1
                                /* TEXT */
                              ),
                              H[31] || (H[31] = e.createElementVNode(
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
                                  e.renderList(a.value.warnings || [], (te, ie) => (e.openBlock(), e.createElementBlock(
                                    "p",
                                    { key: ie },
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
                        e.createElementVNode("div", hE, [
                          e.createElementVNode(
                            "h3",
                            null,
                            e.toDisplayString(A.$t("通知推送")),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "p",
                            _E,
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
                          e.createElementVNode("article", BE, [
                            e.createElementVNode("div", SE, [
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
                                onClick: H[13] || (H[13] = (te) => e.unref(pe)(e.unref(Ve).webhookDoc))
                              }, [
                                e.createTextVNode(
                                  e.toDisplayString(A.$t("查看企微官方说明")) + " ",
                                  1
                                  /* TEXT */
                                ),
                                H[33] || (H[33] = e.createElementVNode(
                                  "i",
                                  { class: "ri-external-link-line" },
                                  null,
                                  -1
                                  /* CACHED */
                                ))
                              ])
                            ]),
                            e.createElementVNode("ol", DE, [
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
                            e.createElementVNode("div", wE, [
                              e.withDirectives(e.createElementVNode("input", {
                                "onUpdate:modelValue": H[14] || (H[14] = (te) => D.value = te),
                                type: "password",
                                spellcheck: "false",
                                autocomplete: "off",
                                placeholder: s.value.push.hasWebhook ? A.$t("已配置 {m}，要换地址再粘贴", { m: s.value.push.webhookMasked }) : "https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=…",
                                "data-test": "mm-setup-hook"
                              }, null, 8, CE), [
                                [e.vModelText, D.value]
                              ]),
                              e.createElementVNode("button", {
                                type: "button",
                                class: "ss-btn primary sm",
                                disabled: m.value || !D.value.trim(),
                                "data-test": "mm-setup-hook-save",
                                onClick: tt
                              }, [
                                e.createElementVNode(
                                  "i",
                                  {
                                    class: e.normalizeClass(r.value === "hook" ? "ri-loader-4-line spin" : "ri-save-line")
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
                              ], 8, TE),
                              e.createElementVNode("button", {
                                type: "button",
                                class: "ss-btn sm",
                                disabled: m.value || !s.value.push.hasWebhook,
                                "data-test": "mm-setup-hook-test",
                                onClick: Kt
                              }, [
                                e.createElementVNode(
                                  "i",
                                  {
                                    class: e.normalizeClass(r.value === "hookTest" ? "ri-loader-4-line spin" : "ri-send-plane-line")
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
                              ], 8, IE)
                            ]),
                            P.value ? (e.openBlock(), e.createElementBlock(
                              "p",
                              {
                                key: 0,
                                class: e.normalizeClass(["ss-note", P.value.ok ? "ok" : "danger"]),
                                "data-test": "mm-setup-hook-result"
                              },
                              e.toDisplayString(P.value.ok ? A.$t("已发到群里，请到企微群里看一眼") : P.value.error),
                              3
                              /* TEXT, CLASS */
                            )) : e.createCommentVNode("v-if", !0)
                          ]),
                          e.createElementVNode("article", ME, [
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
                              AE,
                              e.toDisplayString(A.$t("现在能提醒到本人的：{a} / {b} 人", { a: s.value.org.mentionable, b: s.value.org.people })),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode("div", jE, [
                              e.createElementVNode(
                                "span",
                                LE,
                                e.toDisplayString(s.value.me.name),
                                1
                                /* TEXT */
                              ),
                              e.withDirectives(e.createElementVNode("input", {
                                "onUpdate:modelValue": H[15] || (H[15] = (te) => j.value = te),
                                type: "tel",
                                placeholder: A.$t("你的手机号"),
                                "data-test": "mm-setup-mobile"
                              }, null, 8, zE), [
                                [e.vModelText, j.value]
                              ]),
                              e.createElementVNode("button", {
                                type: "button",
                                class: "ss-btn sm",
                                disabled: m.value || j.value.trim() === (s.value.me.mobile || ""),
                                "data-test": "mm-setup-mobile-save",
                                onClick: Ht
                              }, e.toDisplayString(A.$t("保存")), 9, FE)
                            ]),
                            e.createElementVNode(
                              "p",
                              PE,
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
                        e.createElementVNode("div", UE, [
                          e.createElementVNode(
                            "h3",
                            null,
                            e.toDisplayString(A.$t("手机端")),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "p",
                            OE,
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
                        e.createElementVNode("div", RE, [
                          e.createElementVNode(
                            "h3",
                            null,
                            e.toDisplayString(A.$t("采集你的声纹")),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "p",
                            qE,
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
                          s.value.models.speaker ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock("p", KE, [
                            H[34] || (H[34] = e.createElementVNode(
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
                          e.createElementVNode("label", HE, [
                            e.withDirectives(e.createElementVNode(
                              "input",
                              {
                                "onUpdate:modelValue": H[16] || (H[16] = (te) => C.value = te),
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
                            script: _.value,
                            disabled: m.value || !s.value.models.speaker,
                            onRecorded: H[17] || (H[17] = (te) => I.value = te),
                            onReset: H[18] || (H[18] = (te) => I.value = null)
                          }, null, 8, ["script", "disabled"]),
                          e.createElementVNode("div", WE, [
                            e.createElementVNode("button", {
                              type: "button",
                              class: "ss-btn primary",
                              disabled: m.value || !C.value || !I.value || !s.value.models.speaker,
                              "data-test": "mm-setup-voice-submit",
                              onClick: Wt
                            }, [
                              e.createElementVNode(
                                "i",
                                {
                                  class: e.normalizeClass(r.value === "voice" ? "ri-loader-4-line spin" : "ri-upload-2-line")
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
                            ], 8, GE),
                            e.createElementVNode("button", {
                              type: "button",
                              class: "ss-link",
                              disabled: m.value || !C.value || !s.value.models.speaker,
                              "data-test": "mm-setup-voice-import",
                              onClick: Gt
                            }, e.toDisplayString(A.$t("改用已有的录音文件")), 9, YE)
                          ]),
                          U.value ? (e.openBlock(), e.createElementBlock(
                            "p",
                            {
                              key: 1,
                              class: e.normalizeClass(["ss-note", U.value.ok ? "ok" : "danger"]),
                              "data-test": "mm-setup-voice-result"
                            },
                            e.toDisplayString(U.value.ok ? A.$t("声纹已采集（{s} 秒）", { s: U.value.seconds }) : U.value.error),
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
                        e.createElementVNode("div", JE, [
                          e.createElementVNode(
                            "h3",
                            null,
                            e.toDisplayString(A.$t("大模型")),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "p",
                            QE,
                            e.toDisplayString(A.$t("整理议题和决议、生成执行方案、写周报和项目总结，用的是应用里当前选的大模型（会议转写和声纹不用它，只在本机）。")),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode("button", {
                            type: "button",
                            class: "ss-btn primary",
                            disabled: m.value,
                            "data-test": "mm-setup-llm-test",
                            onClick: Yt
                          }, [
                            e.createElementVNode(
                              "i",
                              {
                                class: e.normalizeClass(r.value === "llm" ? "ri-loader-4-line spin" : "ri-flashlight-line")
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
                          ], 8, ZE),
                          q.value ? (e.openBlock(), e.createElementBlock(
                            "p",
                            {
                              key: 0,
                              class: e.normalizeClass(["ss-note", q.value.ok ? "ok" : "warn"]),
                              "data-test": "mm-setup-llm-result"
                            },
                            [
                              e.createElementVNode(
                                "i",
                                {
                                  class: e.normalizeClass(q.value.ok ? "ri-checkbox-circle-line" : "ri-alert-line")
                                },
                                null,
                                2
                                /* CLASS */
                              ),
                              e.createTextVNode(
                                " " + e.toDisplayString(q.value.ok ? A.$t("大模型可用：回复「{r}」，用时 {s} 秒", { r: q.value.reply, s: ((q.value.ms || 0) / 1e3).toFixed(1) }) : A.$t("没连上大模型：纪要整理和拆任务会按规则兜底，效果差很多。请到应用的「设置 → 模型」里选一个能用的模型，再回来测试。")),
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
                        e.createElementVNode("div", XE, [
                          e.createElementVNode(
                            "h3",
                            null,
                            e.toDisplayString(A.$t("配置完成情况")),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode("ul", xE, [
                            (e.openBlock(), e.createElementBlock(
                              e.Fragment,
                              null,
                              e.renderList(n, (te) => e.createElementVNode(
                                "li",
                                {
                                  key: te.key,
                                  class: e.normalizeClass(ne(te.key))
                                },
                                [
                                  e.createElementVNode(
                                    "i",
                                    {
                                      class: e.normalizeClass(ne(te.key) === "done" ? "ri-checkbox-circle-fill" : "ri-error-warning-line")
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
                                    e.toDisplayString(O(te.key)),
                                    1
                                    /* TEXT */
                                  ),
                                  ne(te.key) !== "done" ? (e.openBlock(), e.createElementBlock("button", {
                                    key: 0,
                                    type: "button",
                                    class: "ss-link",
                                    onClick: (ie) => f(te.key)
                                  }, e.toDisplayString(A.$t("去配置")), 9, e$)) : e.createCommentVNode("v-if", !0)
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
                            t$,
                            e.toDisplayString(A.$t("没配好的也可以先用，之后点右上角「配置引导」继续。")),
                            1
                            /* TEXT */
                          )
                        ])
                      ],
                      2112
                      /* STABLE_FRAGMENT, DEV_ROOT_FRAGMENT */
                    )) : e.createCommentVNode("v-if", !0),
                    E.value ? (e.openBlock(), e.createElementBlock("p", l$, [
                      H[35] || (H[35] = e.createElementVNode(
                        "i",
                        { class: "ri-error-warning-line" },
                        null,
                        -1
                        /* CACHED */
                      )),
                      e.createTextVNode(
                        e.toDisplayString(E.value),
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
        e.createElementVNode("footer", n$, [
          e.createElementVNode("button", {
            type: "button",
            class: "ss-btn",
            disabled: c.value <= 0,
            "data-test": "mm-setup-prev",
            onClick: H[19] || (H[19] = (te) => f(u[c.value - 1]))
          }, e.toDisplayString(A.$t("上一步")), 9, o$),
          H[36] || (H[36] = e.createElementVNode(
            "span",
            { class: "mm-grow" },
            null,
            -1
            /* CACHED */
          )),
          o.value !== "finish" && ne(o.value) !== "done" ? (e.openBlock(), e.createElementBlock(
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
              onClick: H[20] || (H[20] = (te) => f(u[c.value + 1]))
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
            onClick: Jt
          }, e.toDisplayString(A.$t("完成")), 9, a$))
        ])
      ])
    ], 8, CV));
  }
}), r$ = /* @__PURE__ */ ae(s$, [["__scopeId", "data-v-bdaaa9cf"]]), i$ = {
  class: "mm-wb",
  "data-test": "mm-workbench"
}, c$ = { class: "mm-head" }, d$ = { class: "mm-head__top" }, m$ = { class: "mm-head__sub" }, u$ = ["title"], p$ = ["disabled", "title"], v$ = {
  key: 2,
  class: "ri-arrow-down-s-line"
}, k$ = {
  key: 0,
  class: "mm-id__panel",
  "data-test": "mm-identity-panel"
}, y$ = { class: "mm-id__tip" }, g$ = ["placeholder"], f$ = {
  key: 1,
  class: "mm-id__state"
}, N$ = {
  key: 2,
  class: "mm-id__state danger"
}, V$ = {
  key: 3,
  class: "mm-id__list"
}, E$ = ["disabled", "data-test", "onClick"], $$ = { class: "mm-id__name" }, b$ = {
  key: 0,
  class: "mm-id__tag"
}, h$ = {
  key: 0,
  class: "mm-id__state"
}, _$ = {
  class: "mm-tabs",
  role: "tablist"
}, B$ = ["aria-selected", "data-test", "onClick"], S$ = {
  key: 0,
  class: "mm-badge"
}, D$ = {
  key: 0,
  class: "ss-note danger"
}, w$ = {
  key: 1,
  class: "ss-note"
}, C$ = {
  key: 0,
  class: "ss-note info mm-setup",
  "data-test": "mm-no-org"
}, T$ = ["disabled"], I$ = {
  key: 1,
  class: "ss-note warn"
}, Bt = "totalclaw:meeting-mgmt-tab:v1", M$ = /* @__PURE__ */ e.defineComponent({
  __name: "MeetingMgmtWorkbenchView",
  setup(l) {
    const v = [
      { key: "home", title: t.t("首页") },
      { key: "meetings", title: t.t("会议") },
      { key: "tasks", title: t.t("任务") },
      { key: "projects", title: t.t("项目") },
      { key: "settings", title: t.t("系统设置") }
    ], n = ce.useNotificationStore(), u = oe, y = e.computed(() => u.value?.me ?? null), s = e.computed(() => Ne.value.tab), o = e.ref(""), c = e.ref(!1), i = e.ref(0), k = e.ref(null), E = e.reactive({}), m = e.ref(!1), r = e.computed(() => !!y.value?.isAdmin || (u.value?.settings.adminIds.length ?? 0) === 0), N = e.computed(() => !!u.value && (r.value || !!Ie.value)), w = e.computed(() => v.filter(($) => $.key !== "settings" || !!y.value?.isAdmin)), a = e.computed(() => `${y.value?.person?.id || "none"}:${i.value}`);
    function g($) {
      const O = u.value?.badges;
      return O ? $ === "home" ? O.home : $ === "meetings" ? O.meetings : $ === "tasks" ? O.tasks : 0 : 0;
    }
    function D($, O) {
      E[$] = typeof O == "string" ? O : "";
    }
    const P = e.computed(() => {
      if (s.value === "settings") return t.t("管理员");
      const $ = E[s.value];
      return $ || (y.value?.isAdmin ? t.t("管理员") : t.t("项目成员"));
    }), j = e.ref(null), C = e.ref(!1), I = e.ref(""), U = e.ref(!1), q = e.ref(""), B = e.ref(!1), S = e.ref({ depts: [], people: [] }), b = e.computed(() => Ct(S.value, I.value)), M = e.computed(() => S.value.people.find(($) => $.id === Ie.value)?.name || ""), T = ($) => (u.value?.settings.adminIds || []).includes($);
    async function G() {
      if (N.value) {
        C.value = !0, I.value = "", U.value = !0, q.value = "";
        try {
          S.value = await De();
        } catch ($) {
          q.value = x.errorMessage($);
        } finally {
          U.value = !1;
        }
      }
    }
    function V() {
      if (C.value) {
        C.value = !1;
        return;
      }
      G();
    }
    async function d($) {
      if (!B.value) {
        if ($ === y.value?.person?.id) {
          C.value = !1;
          return;
        }
        B.value = !0;
        try {
          await J("identity.set", { personId: $ }), await de(), C.value = !1;
          const O = y.value?.person?.name || "";
          n.success(t.t("当前身份已切换为 {name}", { name: O }));
        } catch (O) {
          q.value = x.errorMessage(O), n.error(x.errorMessage(O));
        } finally {
          B.value = !1;
        }
      }
    }
    function p($) {
      if (!C.value) return;
      const O = j.value;
      O && $.target instanceof Node && O.contains($.target) || (C.value = !1);
    }
    async function z() {
      o.value = "";
      try {
        await de();
      } catch ($) {
        o.value = x.errorMessage($);
      }
    }
    async function X() {
      if (!c.value) {
        c.value = !0;
        try {
          await J("demo.load"), He(), await de(), i.value += 1, n.success(t.t("演示数据已载入"));
        } catch ($) {
          n.error(x.errorMessage($));
        } finally {
          c.value = !1;
        }
      }
    }
    let le = null;
    function W() {
      le || (le = setTimeout(() => {
        le = null, de().catch(() => {
        });
        try {
          k.value?.refresh?.();
        } catch {
        }
      }, 300));
    }
    const Y = e.computed(() => !!u.value && !y.value?.person && u.value.org.peopleCount > 0 && !!u.value.canSwitchIdentity);
    e.watch(() => u.value?.setupPending, ($) => {
      $ && !gt.value && (gt.value = !0, m.value = !0);
    }, { immediate: !0 }), e.watch(Y, ($) => {
      $ && (m.value = !0);
    }, { immediate: !0 });
    function ee() {
      m.value = !1, He(), i.value += 1, n.success(t.t("配置已保存，可以开始使用了"));
    }
    e.watch(() => y.value, ($) => {
      $?.isAdmin && $.person?.id && sl($.person.id);
    }, { immediate: !0 }), e.watch(() => y.value?.person?.id, () => {
      for (const $ of Object.keys(E)) delete E[$];
    }), e.watch([s, () => y.value?.isAdmin, u], () => {
      u.value && s.value === "settings" && !y.value?.isAdmin && ve("home");
    }), e.watch(s, ($) => {
      try {
        localStorage.setItem(Bt, $);
      } catch {
      }
    });
    let ne = null;
    return e.onMounted(() => {
      if (Ne.value.seq === 0)
        try {
          const $ = localStorage.getItem(Bt);
          $ && v.some((O) => O.key === $) && $ !== "home" && ve($);
        } catch {
        }
      z(), ne = _e(($) => {
        $ && ($.type === "changed" ? (($.scope === "org" || $.scope === "all") && He(), W()) : $.type === "mobile" && u.value && (u.value = { ...u.value, mobile: { running: $.running, url: $.url } }));
      }), document.addEventListener("mousedown", p);
    }), e.onBeforeUnmount(() => {
      ne?.(), le && clearTimeout(le), document.removeEventListener("mousedown", p);
    }), ($, O) => (e.openBlock(), e.createElementBlock("div", i$, [
      e.createElementVNode("section", c$, [
        e.createElementVNode("div", d$, [
          e.createVNode(Xt),
          O[11] || (O[11] = e.createElementVNode(
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
            m$,
            e.toDisplayString($.$t("会议 → 纪要 → 任务 → 跟进 → 归档，全流程闭环")),
            1
            /* TEXT */
          ),
          O[12] || (O[12] = e.createElementVNode(
            "span",
            { class: "mm-grow" },
            null,
            -1
            /* CACHED */
          )),
          e.unref(u) ? (e.openBlock(), e.createElementBlock("span", {
            key: 0,
            class: e.normalizeClass(["mm-wecom", { on: e.unref(u).wecomConnected || e.unref(u).pushChannel === "webhook" }]),
            title: e.unref(u).wecomConnected ? $.$t("通讯录与消息卡片走企业微信") : e.unref(u).pushChannel === "webhook" ? $.$t("通知发到企微群（群机器人）") : $.$t("没有配置企业微信：通知只进系统内消息中心"),
            "data-test": "mm-wecom"
          }, e.toDisplayString(e.unref(u).wecomConnected ? $.$t("企微已连接") : e.unref(u).pushChannel === "webhook" ? $.$t("群机器人已连接") : $.$t("未连接企微")), 11, u$)) : e.createCommentVNode("v-if", !0),
          e.unref(u) && (y.value?.isAdmin || Y.value) ? (e.openBlock(), e.createElementBlock("button", {
            key: 1,
            type: "button",
            class: "ss-btn sm",
            "data-test": "mm-setup-open",
            onClick: O[0] || (O[0] = (R) => m.value = !0)
          }, [
            O[8] || (O[8] = e.createElementVNode(
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
              ref: j,
              class: "mm-id"
            },
            [
              e.createElementVNode("button", {
                type: "button",
                class: e.normalizeClass(["mm-id__pill", { switchable: N.value }]),
                disabled: !e.unref(u),
                title: N.value ? $.$t("切换当前身份") : $.$t("只有管理员可以切换身份"),
                "data-test": "mm-identity",
                onClick: V
              }, [
                y.value?.person ? (e.openBlock(), e.createElementBlock(
                  e.Fragment,
                  { key: 0 },
                  [
                    e.createTextVNode(
                      e.toDisplayString(P.value) + " · " + e.toDisplayString(y.value.person.name),
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
                N.value ? (e.openBlock(), e.createElementBlock("i", v$)) : e.createCommentVNode("v-if", !0)
              ], 10, p$),
              C.value ? (e.openBlock(), e.createElementBlock("div", k$, [
                e.createElementVNode(
                  "p",
                  y$,
                  e.toDisplayString($.$t("切换后按这个人的角色显示按钮（管理员代办、演示用）")),
                  1
                  /* TEXT */
                ),
                e.unref(Ie) && e.unref(Ie) !== y.value?.person?.id && M.value ? (e.openBlock(), e.createElementBlock("button", {
                  key: 0,
                  type: "button",
                  class: "mm-id__back",
                  onClick: O[1] || (O[1] = (R) => d(e.unref(Ie)))
                }, [
                  O[9] || (O[9] = e.createElementVNode(
                    "i",
                    { class: "ri-arrow-go-back-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString($.$t("回到 {name}（管理员）", { name: M.value })),
                    1
                    /* TEXT */
                  )
                ])) : e.createCommentVNode("v-if", !0),
                e.withDirectives(e.createElementVNode("input", {
                  "onUpdate:modelValue": O[2] || (O[2] = (R) => I.value = R),
                  class: "mm-id__search",
                  type: "search",
                  placeholder: $.$t("搜索姓名")
                }, null, 8, g$), [
                  [e.vModelText, I.value]
                ]),
                U.value ? (e.openBlock(), e.createElementBlock("p", f$, [
                  O[10] || (O[10] = e.createElementVNode(
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
                ])) : q.value ? (e.openBlock(), e.createElementBlock(
                  "p",
                  N$,
                  e.toDisplayString(q.value),
                  1
                  /* TEXT */
                )) : (e.openBlock(), e.createElementBlock("div", V$, [
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(b.value, (R) => (e.openBlock(), e.createElementBlock(
                      e.Fragment,
                      {
                        key: R.id
                      },
                      [
                        e.createElementVNode(
                          "h5",
                          null,
                          e.toDisplayString(R.name),
                          1
                          /* TEXT */
                        ),
                        (e.openBlock(!0), e.createElementBlock(
                          e.Fragment,
                          null,
                          e.renderList(R.people, (F) => (e.openBlock(), e.createElementBlock("button", {
                            key: F.id,
                            type: "button",
                            class: e.normalizeClass(["mm-id__row", { on: F.id === y.value?.person?.id }]),
                            disabled: B.value,
                            "data-test": `mm-identity-${F.id}`,
                            onClick: (K) => d(F.id)
                          }, [
                            e.createElementVNode(
                              "span",
                              {
                                class: "mm-av",
                                style: e.normalizeStyle({ background: e.unref(re)(F.name).color })
                              },
                              e.toDisplayString(e.unref(re)(F.name).text),
                              5
                              /* TEXT, STYLE */
                            ),
                            e.createElementVNode(
                              "span",
                              $$,
                              e.toDisplayString(F.name),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "small",
                              null,
                              e.toDisplayString(F.title || ""),
                              1
                              /* TEXT */
                            ),
                            T(F.id) ? (e.openBlock(), e.createElementBlock(
                              "span",
                              b$,
                              e.toDisplayString($.$t("管理员")),
                              1
                              /* TEXT */
                            )) : e.createCommentVNode("v-if", !0)
                          ], 10, E$))),
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
                  b.value.length ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock(
                    "p",
                    h$,
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
        e.createElementVNode("nav", _$, [
          (e.openBlock(!0), e.createElementBlock(
            e.Fragment,
            null,
            e.renderList(w.value, (R) => (e.openBlock(), e.createElementBlock("button", {
              key: R.key,
              type: "button",
              role: "tab",
              class: e.normalizeClass(["mm-tab", { active: s.value === R.key }]),
              "aria-selected": s.value === R.key,
              "data-test": `mm-tab-${R.key}`,
              onClick: (F) => e.unref(ve)(R.key)
            }, [
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(R.title),
                1
                /* TEXT */
              ),
              g(R.key) ? (e.openBlock(), e.createElementBlock(
                "em",
                S$,
                e.toDisplayString(g(R.key)),
                1
                /* TEXT */
              )) : e.createCommentVNode("v-if", !0)
            ], 10, B$))),
            128
            /* KEYED_FRAGMENT */
          ))
        ])
      ]),
      o.value && !e.unref(u) ? (e.openBlock(), e.createElementBlock("p", D$, [
        O[13] || (O[13] = e.createElementVNode(
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
            onClick: z
          },
          e.toDisplayString($.$t("重试")),
          1
          /* TEXT */
        )
      ])) : e.unref(u) ? (e.openBlock(), e.createElementBlock(
        e.Fragment,
        { key: 2 },
        [
          e.unref(u).org.peopleCount === 0 ? (e.openBlock(), e.createElementBlock("p", C$, [
            O[15] || (O[15] = e.createElementVNode(
              "i",
              { class: "ri-team-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(r.value ? $.$t("还没有组织人员：可在「系统设置 → 通讯录同步」同步企业微信通讯录，也可以先载入演示数据走一遍全流程。") : $.$t("还没有组织人员，请联系管理员同步通讯录。")),
              1
              /* TEXT */
            ),
            r.value ? (e.openBlock(), e.createElementBlock("button", {
              key: 0,
              type: "button",
              class: "ss-btn sm primary",
              disabled: c.value,
              "data-test": "mm-demo-load",
              onClick: X
            }, [
              e.createElementVNode(
                "i",
                {
                  class: e.normalizeClass(c.value ? "ri-loader-4-line spin" : "ri-magic-line")
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
            ], 8, T$)) : e.createCommentVNode("v-if", !0)
          ])) : y.value?.person ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock("p", I$, [
            O[16] || (O[16] = e.createElementVNode(
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
            N.value ? (e.openBlock(), e.createElementBlock(
              "button",
              {
                key: 0,
                type: "button",
                class: "ss-btn sm",
                onClick: G
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
              Mo,
              {
                key: 0,
                ref_key: "tabRef",
                ref: k,
                onRole: O[3] || (O[3] = (R) => D("home", R))
              },
              null,
              512
              /* NEED_PATCH */
            )) : s.value === "meetings" ? (e.openBlock(), e.createBlock(
              Nd,
              {
                key: 1,
                ref_key: "tabRef",
                ref: k,
                onRole: O[4] || (O[4] = (R) => D("meetings", R))
              },
              null,
              512
              /* NEED_PATCH */
            )) : s.value === "tasks" ? (e.openBlock(), e.createBlock(
              Hu,
              {
                key: 2,
                ref_key: "tabRef",
                ref: k,
                onRole: O[5] || (O[5] = (R) => D("tasks", R))
              },
              null,
              512
              /* NEED_PATCH */
            )) : s.value === "projects" ? (e.openBlock(), e.createBlock(
              zk,
              {
                key: 3,
                ref_key: "tabRef",
                ref: k,
                onRole: O[6] || (O[6] = (R) => D("projects", R))
              },
              null,
              512
              /* NEED_PATCH */
            )) : s.value === "settings" ? (e.openBlock(), e.createBlock(
              wV,
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
      )) : (e.openBlock(), e.createElementBlock("p", w$, [
        O[14] || (O[14] = e.createElementVNode(
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
      m.value ? (e.openBlock(), e.createBlock(r$, {
        key: 3,
        onClose: O[7] || (O[7] = (R) => m.value = !1),
        onDone: ee
      })) : e.createCommentVNode("v-if", !0)
    ]));
  }
}), j$ = /* @__PURE__ */ ae(M$, [["__scopeId", "data-v-dba3778c"]]), yt = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["npm:pinyin-pro"];
if (!yt) throw new Error("宿主模块未就绪：npm:pinyin-pro");
yt.default;
const A$ = /* @__PURE__ */ Zt({
  __proto__: null
}, [yt]);
export {
  j$ as default
};
