function Jt(l, v) {
  for (var n = 0; n < v.length; n++) {
    const p = v[n];
    if (typeof p != "string" && !Array.isArray(p)) {
      for (const y in p)
        if (y !== "default" && !(y in l)) {
          const s = Object.getOwnPropertyDescriptor(p, y);
          s && Object.defineProperty(l, y, s.get ? s : {
            enumerable: !0,
            get: () => p[y]
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
const Qt = St.default, dt = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/utils/ipcPlain.ts"];
if (!dt) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/utils/ipcPlain.ts");
dt.default;
const X = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/workbenches/service-settlement/shared.ts"];
if (!X) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/workbenches/service-settlement/shared.ts");
X.default;
async function J(l, v) {
  const n = window.electronAPI?.workbenches?.meetingMgmt;
  if (!n?.invoke) throw new Error(t.t("泰途会议智能管理接口不可用，请重启应用"));
  return n.invoke(l, dt.toPlain(v ?? {}));
}
function Se(l) {
  const v = window.electronAPI?.workbenches?.meetingMgmt;
  return v?.onEvent ? v.onEvent(l) : () => {
  };
}
const fe = {
  contacts: "https://work.weixin.qq.com/wework_admin/frame#contacts",
  apps: "https://work.weixin.qq.com/wework_admin/frame#apps",
  profile: "https://work.weixin.qq.com/wework_admin/frame#profile",
  webhookDoc: "https://developer.work.weixin.qq.com/document/path/91770"
};
function ue(l) {
  if (!l) return;
  const v = window.electronAPI;
  typeof v?.openExternal == "function" ? v.openExternal(l) : typeof v?.shell?.openExternal == "function" ? v.shell.openExternal(l) : window.open(l, "_blank", "noopener");
}
const oe = e.ref(null), gt = e.ref(!1);
async function ce() {
  const l = await J("boot");
  return oe.value = l, l;
}
const We = e.ref(""), ge = e.ref({ tab: "home", seq: 0 });
function ve(l) {
  ge.value = { tab: l, seq: ge.value.seq + 1 };
}
const nt = e.ref("");
function Zt(l) {
  nt.value = l, ve("settings");
}
function de(l) {
  const v = l.kind === "task" ? "tasks" : l.kind === "meeting" || l.kind === "meeting_plan" ? "meetings" : "projects";
  ge.value = { tab: v, link: l, seq: ge.value.seq + 1 };
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
}, ft = ["#e05a8a", "#3b82f6", "#f59e0b", "#8b5cf6", "#ef4444", "#0ea5a4", "#16a34a", "#6366f1", "#d97706", "#0284c7"];
function re(l) {
  const v = String(l || "?");
  let n = 0;
  for (const p of v) n = n * 31 + p.charCodeAt(0) >>> 0;
  return { text: v.slice(0, 1), color: ft[n % ft.length] };
}
const ut = (l) => l && /^\d{4}-\d{2}-\d{2}$/.test(l) ? l.slice(5) : l || "-";
function st(l) {
  if (!l) return "-";
  const v = new Date(l), n = (p) => String(p).padStart(2, "0");
  return `${v.getFullYear()}-${n(v.getMonth() + 1)}-${n(v.getDate())}`;
}
function Ae(l) {
  const v = Math.max(0, Math.floor(l || 0)), n = Math.floor(v / 3600), p = Math.floor(v % 3600 / 60), y = v % 60, s = (o) => String(o).padStart(2, "0");
  return n ? `${n}:${s(p)}:${s(y)}` : `${s(p)}:${s(y)}`;
}
function ll(l, v = Date.now()) {
  if (!l) return "";
  const n = v - l;
  if (n < 6e4) return t.t("刚刚");
  if (n < 36e5) return t.t("{n} 分钟前", { n: Math.floor(n / 6e4) });
  const p = new Date(l), y = (i) => String(i).padStart(2, "0"), s = new Date(v), o = new Date(v - 864e5), c = `${y(p.getHours())}:${y(p.getMinutes())}`;
  return p.toDateString() === s.toDateString() ? t.t("今天 {t}", { t: c }) : p.toDateString() === o.toDateString() ? t.t("昨天 {t}", { t: c }) : `${y(p.getMonth() + 1)}-${y(p.getDate())} ${c}`;
}
const rt = e.ref(!1), lt = e.ref(""), wt = "totalclaw:meeting-mgmt-operator:v1";
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
  const v = J("people.list").then((n) => ({ depts: n?.depts ?? [], people: n?.people ?? [] }));
  return Me = { at: Date.now(), data: v }, v.catch(() => {
    Me = null;
  }), v;
}
function He() {
  Me = null;
}
function Ct(l, v = "", n) {
  const p = v.trim().toLowerCase(), y = l.people.filter((i) => !i.left && !0 && (!p || i.name.toLowerCase().includes(p) || (i.title || "").toLowerCase().includes(p))), s = [], o = /* @__PURE__ */ new Set();
  for (const i of l.depts) {
    const k = y.filter((b) => b.deptId === i.id);
    o.add(i.id), k.length && s.push({ id: i.id, name: i.name, people: k });
  }
  const c = y.filter((i) => !o.has(i.deptId));
  return c.length && s.push({ id: "", name: t.t("其他"), people: c }), s;
}
const ye = (l) => String(l).padStart(2, "0");
function $e(l) {
  if (!l) return "-";
  const v = new Date(l);
  return `${v.getFullYear()}-${ye(v.getMonth() + 1)}-${ye(v.getDate())} ${ye(v.getHours())}:${ye(v.getMinutes())}`;
}
function Tt(l) {
  if (!l) return "-";
  const v = new Date(l);
  return `${ye(v.getMonth() + 1)}-${ye(v.getDate())}`;
}
function Ye(l) {
  const v = new Date(l);
  return `${v.getFullYear()}-${ye(v.getMonth() + 1)}-${ye(v.getDate())}`;
}
function al(l) {
  const v = new Date(l);
  return `${Ye(l)}T${ye(v.getHours())}:${ye(v.getMinutes())}`;
}
function sl(l) {
  const v = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(l || "");
  return v ? new Date(+v[1], +v[2] - 1, +v[3], +v[4], +v[5]).getTime() : NaN;
}
function rl(l) {
  const v = Number(l) || 0;
  return v >= 1024 ** 3 ? `${(v / 1024 ** 3).toFixed(2)} GB` : v >= 1024 ** 2 ? `${(v / 1024 ** 2).toFixed(1)} MB` : v >= 1024 ? `${Math.round(v / 1024)} KB` : `${v} B`;
}
function il(l) {
  const v = Math.round(Number(l) || 0);
  if (!v) return "";
  const n = Math.max(1, Math.round(v / 60));
  return n < 60 ? t.t("{n} 分钟", { n }) : t.t("{h} 小时 {m} 分", { h: Math.floor(n / 60), m: ye(n % 60) });
}
function cl(l) {
  const v = Math.max(0, Math.floor(l / 1e3));
  if (v < 60) return t.t("{n} 秒", { n: v });
  const n = Math.floor(v / 60);
  return n < 60 ? t.t("{m} 分 {s} 秒", { m: n, s: v % 60 }) : t.t("{h} 小时 {m} 分", { h: Math.floor(n / 60), m: ye(n % 60) });
}
function dl(l) {
  return l >= 5 && l < 11 ? t.t("早上好") : l >= 11 && l < 13 ? t.t("中午好") : l >= 13 && l < 18 ? t.t("下午好") : t.t("晚上好");
}
const ml = () => [t.t("周日"), t.t("周一"), t.t("周二"), t.t("周三"), t.t("周四"), t.t("周五"), t.t("周六")];
function Nt(l, v = Date.now()) {
  const n = /^(\d{4})-(\d{2})-(\d{2})$/.exec(l || "");
  if (!n) return { day: "", md: l || "-" };
  const p = `${n[2]}-${n[3]}`;
  if (l === Ye(v)) return { day: t.t("今天"), md: p };
  if (l === Ye(v + 864e5)) return { day: t.t("明天"), md: p };
  const y = new Date(+n[1], +n[2] - 1, +n[3]).getDay();
  return { day: ml()[y], md: p };
}
const Fe = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九", "十"];
function ul(l) {
  const v = l + 1;
  let n = !1;
  try {
    n = String(t.i18n.global.locale.value || "zh-CN") === "zh-CN";
  } catch {
    n = !0;
  }
  if (!n) return String(v);
  const p = Fe[10];
  return v <= 10 ? Fe[v] : v < 20 ? p + Fe[v - 10] : v < 100 ? Fe[Math.floor(v / 10)] + p + (v % 10 ? Fe[v % 10] : "") : String(v);
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
  const n = Array.isArray(l) ? l : [], p = {
    all: n.length,
    meeting: n.filter((o) => o.group === "meeting").length,
    task: n.filter((o) => o.group === "task").length,
    project: n.filter((o) => o.group === "project").length
  }, y = v === "all" ? n : n.filter((o) => o.group === v), s = (o) => y.filter((c) => c.urgency === o).sort((c, i) => (c.at || 0) - (i.at || 0));
  return { counts: p, urgent: s("urgent"), today: s("today"), week: s("week") };
}
function pl(l) {
  if (!l) return "";
  const v = l.me?.person?.name;
  if (v && (l.projects || []).some((p) => p.ownerName === v)) return t.t("项目负责人");
  const n = new Set((l.todos || []).map((p) => p.type));
  return n.has("arbitrate") || n.has("review_report") ? t.t("项目负责人") : n.has("review_minutes") || n.has("assign_speaker") || n.has("decide_tasks") || n.has("assign_owner") || n.has("retry_process") ? t.t("主持人") : n.has("confirm_plan") || n.has("review_objection") ? t.t("任务负责人") : n.has("accept_task") || n.has("update_progress") || n.has("dept_reply") ? t.t("部门负责人") : n.has("confirm_speech") ? t.t("发言人") : l.me?.isAdmin ? t.t("管理员") : t.t("项目成员");
}
function vl(l, v) {
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
function kl(l, v, n) {
  if (l.my.myLabels.includes(v)) return !0;
  const p = Le(l.meeting, v);
  return !!n && p === n;
}
function yl(l) {
  const v = l.meeting, n = new Map(v.segments.map((c) => [c.id, c])), p = /* @__PURE__ */ new Set(), y = [], s = (c) => {
    const i = [];
    for (const k of c) {
      const b = n.get(k);
      if (!b) continue;
      const m = xe(l, b.speakerLabel);
      i.includes(m) || i.push(m);
    }
    return i;
  };
  for (const c of v.topics || []) {
    const i = (c.segmentIds || []).filter((k) => n.has(k));
    i.forEach((k) => p.add(k)), y.push({ id: c.id, title: c.title, segmentIds: i, speakers: s(i) });
  }
  const o = v.segments.filter((c) => !p.has(c.id)).sort((c, i) => c.start - i.start).map((c) => c.id);
  return o.length && y.push({ id: "__rest", title: y.length ? t.t("其他发言") : t.t("全部发言"), segmentIds: o, speakers: s(o) }), y;
}
function gl(l, v) {
  const n = l?.log?.length ? l.log[l.log.length - 1].at : void 0;
  return Math.max(v || 0, n || 0, l?.startedAt || 0) || void 0;
}
const fl = 10 * 6e4, It = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["npm:qrcode"];
if (!It) throw new Error("宿主模块未就绪：npm:qrcode");
const Mt = It.default;
function Ce(l) {
  return !!l.objection && l.objection.stage !== "resolved";
}
function Nl(l) {
  if (Ce(l)) {
    const v = l.objection.stage;
    if (v === "review") return t.t("待复核");
    if (v === "dept_reply") return t.t("待部门回应");
    if (v === "arbitration") return t.t("待裁决");
  }
  return Ue[l.status] ?? l.status;
}
function Vl(l) {
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
function El(l) {
  return l.status === "done" || l.status === "cancelled" ? "done" : l.status === "to_accept" || Ce(l) ? "action" : "doing";
}
function $t(l) {
  const v = (n) => n.status === "done" || n.status === "cancelled" ? 1 : 0;
  return [...l].sort((n, p) => v(n) - v(p) || +!!p.overdue - +!!n.overdue || String(n.due || "9999").localeCompare(String(p.due || "9999")) || String(n.title).localeCompare(String(p.title)));
}
function $l(l, v) {
  if (v === "status")
    return [
      { key: "action", title: t.t("需要处理") },
      { key: "doing", title: t.t("进行中") },
      { key: "done", title: t.t("已完成") }
    ].map((y) => ({ key: y.key, title: y.title, tasks: $t(l.filter((s) => El(s) === y.key)), collapsedByDefault: y.key === "done" })).filter((y) => y.tasks.length > 0);
  const n = /* @__PURE__ */ new Map();
  for (const p of l) {
    const y = v === "project" ? p.projectId : p.deptId, s = (v === "project" ? p.projectName : p.deptName) || t.t("未分类"), o = n.get(y) ?? { title: s, tasks: [] };
    o.tasks.push(p), n.set(y, o);
  }
  return [...n.entries()].map(([p, y]) => ({ key: p, title: y.title, tasks: $t(y.tasks), collapsedByDefault: !1 })).sort((p, y) => p.title.localeCompare(y.title, "zh-CN"));
}
function bl(l, v) {
  const n = v.trim().toLowerCase();
  return n ? l.filter((p) => [p.title, p.meetingTitle, p.deptName, p.assigneeName, p.ownerName, p.projectName, p.standard].some((y) => String(y || "").toLowerCase().includes(n))) : l;
}
function Ne(l) {
  const v = Number(l);
  return Number.isFinite(v) ? Math.max(0, Math.min(100, Math.round(v))) : 0;
}
function vt(l, v) {
  return v > 0 ? Ne(l / v * 100) : 0;
}
const ke = (l) => String(l).padStart(2, "0");
function Ve(l, v = !1) {
  if (!l) return "—";
  const n = new Date(l), p = `${n.getFullYear()}-${ke(n.getMonth() + 1)}-${ke(n.getDate())} ${ke(n.getHours())}:${ke(n.getMinutes())}`;
  return v ? `${p}:${ke(n.getSeconds())}` : p;
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
function hl(l = Date.now()) {
  const v = new Date(l);
  return `${v.getFullYear()}-${ke(v.getMonth() + 1)}-${ke(v.getDate())}`;
}
function ct(l, v, n = "") {
  if (!v) return n;
  const p = l?.[v];
  return p ? typeof p == "string" ? p : p.name || n || v : n || v;
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
  return (l ?? []).filter((v) => _l.has(v.action)).sort((v, n) => n.at - v.at);
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
function wl(l, v) {
  const n = {}, p = l.title.trim(), y = l.standard.trim(), s = l.due.trim();
  return p && p !== v.title && (n.title = p), y && y !== v.standard && (n.standard = y), s && s !== v.due && (n.due = s), Object.keys(n).length ? n : void 0;
}
function Cl(l) {
  return { title: l.title, standard: l.standard, due: l.objection?.suggestedDue || l.due };
}
function Tl(l, v) {
  return v?.review || v?.reply || v?.escalate || v?.arbitrate || Ce(l) ? "objection" : "detail";
}
function Il(l, v, n, p = {}) {
  return v ? p.arbitrate ? t.t("项目负责人") : p.review ? t.t("任务负责人") : p.accept || p.object || p.progress || p.complete || p.change || p.reply || p.escalate || l.assigneeId === v ? t.t("部门负责人") : (l.ownerIds?.length ? l.ownerIds : [l.ownerId]).includes(v) ? t.t("任务负责人") : n && n === v ? t.t("项目负责人") : t.t("项目成员") : "";
}
function Ml(l, v) {
  return !l || !v ? "" : l.ownerId === v ? t.t("项目负责人") : l.memberIds.includes(v) ? t.t("项目成员") : "";
}
const jt = ["active", "closing", "archived"];
function Al(l) {
  const v = jt.indexOf(l);
  return v < 0 ? 0 : v;
}
function jl(l) {
  return l === "active" ? "brand" : l === "closing" ? "warn" : "muted";
}
function Be(l, v = [], n = {}) {
  if (l.kind === "objection") {
    const s = v.find((o) => o.id === l.id)?.objection?.stage === "arbitration" && n.canArbitrate ? t.t("去裁决") : t.t("去处理");
    return { chip: t.t("异议"), tone: "warn", action: s, link: { kind: "task", id: l.id } };
  }
  if (l.kind === "meeting") return { chip: t.t("会议"), tone: "brand", action: t.t("查看"), link: { kind: "meeting", id: l.id } };
  const p = v.find((y) => y.id === l.id)?.overdue;
  return { chip: p ? t.t("逾期") : t.t("未完成"), tone: p ? "bad" : "", action: t.t("查看"), link: { kind: "task", id: l.id } };
}
function bt(l) {
  const v = l ?? [], n = new Set(v.filter((p) => p.kind === "objection").map((p) => p.id));
  return v.filter((p) => !(p.kind === "task" && n.has(p.id)));
}
function Ll(l) {
  return l ? l.kind === "project" ? { projectId: l.id, tab: "overview" } : l.kind === "project_summary" ? { projectId: l.id, tab: "summary" } : l.kind === "report" ? l.anchor ? { projectId: l.id, reportId: l.anchor, tab: "reports" } : { projectId: l.id, reportId: l.id, tab: "reports" } : null : null;
}
function Lt(l, v, n) {
  const p = Math.max(1, Math.ceil(l.length / n)), y = Math.min(Math.max(1, v), p);
  return { rows: l.slice((y - 1) * n, y * n), page: y, pages: p };
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
  const p = n.trim().toLowerCase();
  return p ? [l.name, l.title, v].some((y) => String(y || "").toLowerCase().includes(p)) : !0;
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
function zl(l) {
  if (!l) return "";
  const v = window.electronAPI?.getPathForFile;
  try {
    return (v ? v(l) : l.path) || "";
  } catch {
    return "";
  }
}
const Fl = { class: "mm-mob__bar" }, Pl = { class: "mm-mob__visual" }, Ul = ["title"], Ol = ["src", "alt"], Rl = {
  key: 1,
  class: "mm-mob__qr-ph"
}, ql = {
  key: 1,
  class: "mm-mob__idle-ico",
  "aria-hidden": "true"
}, Kl = { class: "mm-mob__info" }, Hl = { class: "mm-mob__top" }, Wl = { class: "mm-mob__title" }, Gl = { class: "mm-mob__pill" }, Yl = {
  key: 0,
  class: "mono",
  "data-test": "mm-mobile-url"
}, Jl = {
  key: 1,
  class: "muted"
}, Ql = {
  key: 0,
  class: "mm-mob__pill info",
  "data-test": "mm-mobile-public"
}, Zl = {
  key: 0,
  class: "mm-mob__desc"
}, Xl = { class: "mm-mob__note" }, xl = { class: "mm-mob__ops" }, en = ["disabled"], tn = ["disabled"], ln = {
  key: 0,
  class: "ss-note danger mm-mob__strip"
}, nn = {
  key: 1,
  class: "ss-note warn mm-mob__lan mm-mob__strip",
  "data-test": "mm-mobile-lan"
}, on = { class: "mm-card__head" }, an = ["disabled"], sn = ["disabled"], rn = {
  key: 0,
  class: "ss-note danger"
}, cn = { class: "mm-mob__addr" }, dn = {
  key: 0,
  class: "mono",
  "data-test": "mm-mobile-url"
}, mn = {
  key: 1,
  class: "muted"
}, un = {
  key: 1,
  class: "mm-mob__qr"
}, pn = ["src", "alt"], vn = {
  key: 1,
  class: "mm-mob__qr-ph"
}, kn = { class: "mm-mob__qr-text" }, yn = { class: "mm-mob__qr-acts" }, gn = {
  key: 2,
  class: "ss-note warn mm-mob__lan",
  "data-test": "mm-mobile-lan"
}, fn = {
  key: 3,
  class: "ss-note info",
  "data-test": "mm-mobile-public"
}, Nn = { class: "mm-mob__note" }, Vn = { class: "mm-mob-modal__box" }, En = { class: "mm-mob-modal__head" }, $n = ["src", "alt"], bn = {
  key: 0,
  class: "mono"
}, hn = /* @__PURE__ */ e.defineComponent({
  __name: "MobileAccessCard",
  props: {
    compact: { type: Boolean }
  },
  setup(l) {
    const v = ie.useNotificationStore(), n = e.ref({ ...oe.value?.mobile ?? {}, running: !!oe.value?.mobile.running }), p = e.ref(!1), y = e.ref(""), s = e.ref(""), o = e.ref(""), c = e.ref(!1), i = e.computed(() => oe.value?.me?.person ?? null), k = e.computed(() => !!oe.value?.me?.isAdmin);
    async function b() {
      if (s.value = "", o.value = "", c.value = !1, !(!n.value.running || !i.value))
        try {
          const N = Je(await J("mobile.link", {}));
          if (!N) return;
          s.value = N, o.value = await Mt.toDataURL(N, { margin: 1, width: 264 }).catch(() => "");
        } catch (N) {
          y.value = X.errorMessage(N);
        }
    }
    async function m() {
      try {
        const N = await J("mobile.status");
        N && (n.value = { ...N, running: !!N.running });
      } catch (N) {
        y.value = X.errorMessage(N);
      }
    }
    async function r(N) {
      p.value = !0, y.value = "";
      try {
        const T = await J(N ? "mobile.start" : "mobile.stop");
        T && typeof T == "object" && "running" in T ? n.value = { ...T, running: !!T.running } : await m(), v.success(N ? t.t("手机页服务已开启") : t.t("手机页服务已停止"));
      } catch (T) {
        y.value = X.errorMessage(T);
      } finally {
        p.value = !1;
      }
    }
    async function g() {
      s.value && await Qe(s.value) && v.success(t.t("已复制专属链接"));
    }
    function h(N) {
      N.key === "Escape" && c.value && (c.value = !1);
    }
    e.watch(() => [n.value.running, n.value.url, i.value?.id], () => {
      b();
    });
    let a = null;
    return e.onMounted(() => {
      m().then(b), a = Se((N) => {
        N.type === "mobile" && (n.value = { ...n.value, running: N.running, url: N.url }, oe.value && (oe.value.mobile = { ...oe.value.mobile, running: N.running, url: N.url }), m());
      }), document.addEventListener("keydown", h);
    }), e.onBeforeUnmount(() => {
      a?.(), document.removeEventListener("keydown", h);
    }), (N, T) => (e.openBlock(), e.createElementBlock(
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
            e.createElementVNode("div", Fl, [
              e.createElementVNode("div", Pl, [
                n.value.running ? (e.openBlock(), e.createElementBlock(
                  e.Fragment,
                  { key: 0 },
                  [
                    o.value ? (e.openBlock(), e.createElementBlock("button", {
                      key: 0,
                      type: "button",
                      class: "mm-mob__qr-btn",
                      title: N.$t("用手机扫码打开"),
                      onClick: T[0] || (T[0] = (U) => c.value = !0)
                    }, [
                      e.createElementVNode("img", {
                        src: o.value,
                        alt: N.$t("我的手机端专属链接二维码"),
                        width: "84",
                        height: "84",
                        "data-test": "mm-mobile-qr"
                      }, null, 8, Ol),
                      T[9] || (T[9] = e.createElementVNode(
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
                    ], 8, Ul)) : (e.openBlock(), e.createElementBlock("span", Rl, [...T[10] || (T[10] = [
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
                )) : (e.openBlock(), e.createElementBlock("span", ql, [...T[11] || (T[11] = [
                  e.createElementVNode(
                    "i",
                    { class: "ri-smartphone-line" },
                    null,
                    -1
                    /* CACHED */
                  )
                ])]))
              ]),
              e.createElementVNode("div", Kl, [
                e.createElementVNode("div", Hl, [
                  e.createElementVNode("span", Wl, [
                    T[12] || (T[12] = e.createElementVNode(
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
                    )
                  ]),
                  e.createElementVNode("span", Gl, [
                    e.createElementVNode(
                      "small",
                      null,
                      e.toDisplayString(N.$t("局域网地址")),
                      1
                      /* TEXT */
                    ),
                    n.value.running && n.value.url ? (e.openBlock(), e.createElementBlock(
                      "b",
                      Yl,
                      e.toDisplayString(n.value.url),
                      1
                      /* TEXT */
                    )) : (e.openBlock(), e.createElementBlock(
                      "b",
                      Jl,
                      e.toDisplayString(k.value ? N.$t("服务未开启") : N.$t("服务未开启，请管理员在首页开启")),
                      1
                      /* TEXT */
                    ))
                  ]),
                  n.value.publicBase && !(n.value.running && n.value.lanOnly) ? (e.openBlock(), e.createElementBlock("span", Ql, [
                    T[13] || (T[13] = e.createElementVNode(
                      "i",
                      { class: "ri-global-line" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createElementVNode(
                      "span",
                      null,
                      e.toDisplayString(N.$t("消息里的链接用外网地址：{url}", { url: n.value.publicBase })),
                      1
                      /* TEXT */
                    )
                  ])) : e.createCommentVNode("v-if", !0)
                ]),
                n.value.running ? (e.openBlock(), e.createElementBlock("p", Zl, [
                  e.createElementVNode(
                    "strong",
                    null,
                    e.toDisplayString(N.$t("用手机扫码打开")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "span",
                    null,
                    e.toDisplayString(i.value ? N.$t("这是 {name} 的专属链接，扫开就是本人身份，不要转发给别人。", { name: i.value.name }) : N.$t("当前身份无效，无法生成专属链接")),
                    1
                    /* TEXT */
                  )
                ])) : e.createCommentVNode("v-if", !0),
                e.createElementVNode(
                  "p",
                  Xl,
                  e.toDisplayString(N.$t("手机和这台电脑要在同一个网络；第一次开启时系统可能询问是否允许接入网络，请选允许。服务会记住开关，电脑重启后自动开启。")),
                  1
                  /* TEXT */
                )
              ]),
              e.createElementVNode("div", xl, [
                n.value.running && s.value ? (e.openBlock(), e.createElementBlock(
                  e.Fragment,
                  { key: 0 },
                  [
                    e.createElementVNode("button", {
                      type: "button",
                      class: "ss-btn sm",
                      "data-test": "mm-mobile-copy",
                      onClick: g
                    }, [
                      T[14] || (T[14] = e.createElementVNode(
                        "i",
                        { class: "ri-file-copy-line" },
                        null,
                        -1
                        /* CACHED */
                      )),
                      e.createTextVNode(
                        e.toDisplayString(N.$t("复制链接")),
                        1
                        /* TEXT */
                      )
                    ]),
                    e.createElementVNode("button", {
                      type: "button",
                      class: "ss-btn sm",
                      "data-test": "mm-mobile-open",
                      onClick: T[1] || (T[1] = (U) => e.unref(ue)(s.value))
                    }, [
                      T[15] || (T[15] = e.createElementVNode(
                        "i",
                        { class: "ri-external-link-line" },
                        null,
                        -1
                        /* CACHED */
                      )),
                      e.createTextVNode(
                        e.toDisplayString(N.$t("在浏览器打开")),
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
                      disabled: p.value,
                      "data-test": "mm-mobile-stop",
                      onClick: T[3] || (T[3] = (U) => r(!1))
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
                    ], 8, tn)) : (e.openBlock(), e.createElementBlock("button", {
                      key: 0,
                      type: "button",
                      class: "ss-btn primary sm",
                      disabled: p.value,
                      "data-test": "mm-mobile-start",
                      onClick: T[2] || (T[2] = (U) => r(!0))
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
                    ], 8, en))
                  ],
                  64
                  /* STABLE_FRAGMENT */
                )) : e.createCommentVNode("v-if", !0)
              ])
            ]),
            y.value ? (e.openBlock(), e.createElementBlock("p", ln, [
              T[16] || (T[16] = e.createElementVNode(
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
            n.value.running && n.value.lanOnly ? (e.openBlock(), e.createElementBlock("p", nn, [
              T[17] || (T[17] = e.createElementVNode(
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
                k.value ? (e.openBlock(), e.createElementBlock(
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
            ])) : e.createCommentVNode("v-if", !0)
          ],
          64
          /* STABLE_FRAGMENT */
        )) : (e.openBlock(), e.createElementBlock(
          e.Fragment,
          { key: 1 },
          [
            e.createElementVNode("header", on, [
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
              T[18] || (T[18] = e.createElementVNode(
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
                    disabled: p.value,
                    "data-test": "mm-mobile-stop",
                    onClick: T[5] || (T[5] = (U) => r(!1))
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
                  ], 8, sn)) : (e.openBlock(), e.createElementBlock("button", {
                    key: 0,
                    type: "button",
                    class: "ss-btn primary sm",
                    disabled: p.value,
                    "data-test": "mm-mobile-start",
                    onClick: T[4] || (T[4] = (U) => r(!0))
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
                  ], 8, an))
                ],
                64
                /* STABLE_FRAGMENT */
              )) : e.createCommentVNode("v-if", !0)
            ]),
            y.value ? (e.openBlock(), e.createElementBlock("p", rn, [
              T[19] || (T[19] = e.createElementVNode(
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
            e.createElementVNode("div", cn, [
              e.createElementVNode(
                "small",
                null,
                e.toDisplayString(N.$t("局域网地址")),
                1
                /* TEXT */
              ),
              n.value.running && n.value.url ? (e.openBlock(), e.createElementBlock(
                "b",
                dn,
                e.toDisplayString(n.value.url),
                1
                /* TEXT */
              )) : (e.openBlock(), e.createElementBlock(
                "b",
                mn,
                e.toDisplayString(k.value ? N.$t("服务未开启") : N.$t("服务未开启，请管理员在首页开启")),
                1
                /* TEXT */
              ))
            ]),
            n.value.running ? (e.openBlock(), e.createElementBlock("div", un, [
              o.value ? (e.openBlock(), e.createElementBlock("img", {
                key: 0,
                src: o.value,
                alt: N.$t("我的手机端专属链接二维码"),
                width: "132",
                height: "132",
                "data-test": "mm-mobile-qr"
              }, null, 8, pn)) : (e.openBlock(), e.createElementBlock("span", vn, [...T[20] || (T[20] = [
                e.createElementVNode(
                  "i",
                  { class: "ri-loader-4-line spin" },
                  null,
                  -1
                  /* CACHED */
                )
              ])])),
              e.createElementVNode("div", kn, [
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
                  e.toDisplayString(i.value ? N.$t("这是 {name} 的专属链接，扫开就是本人身份，不要转发给别人。", { name: i.value.name }) : N.$t("当前身份无效，无法生成专属链接")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode("div", yn, [
                  s.value ? (e.openBlock(), e.createElementBlock(
                    "button",
                    {
                      key: 0,
                      type: "button",
                      class: "ss-link",
                      "data-test": "mm-mobile-copy",
                      onClick: g
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
                    onClick: T[6] || (T[6] = (U) => e.unref(ue)(s.value))
                  }, [
                    e.createTextVNode(
                      e.toDisplayString(N.$t("在浏览器打开")) + " ",
                      1
                      /* TEXT */
                    ),
                    T[21] || (T[21] = e.createElementVNode(
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
            n.value.running && n.value.lanOnly ? (e.openBlock(), e.createElementBlock("p", gn, [
              T[22] || (T[22] = e.createElementVNode(
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
                k.value ? (e.openBlock(), e.createElementBlock(
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
            ])) : n.value.publicBase ? (e.openBlock(), e.createElementBlock("p", fn, [
              T[23] || (T[23] = e.createElementVNode(
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
              Nn,
              e.toDisplayString(N.$t("手机和这台电脑要在同一个网络；第一次开启时系统可能询问是否允许接入网络，请选允许。服务会记住开关，电脑重启后自动开启。")),
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
            onClick: T[8] || (T[8] = e.withModifiers((U) => c.value = !1, ["self"]))
          }, [
            e.createElementVNode("div", Vn, [
              e.createElementVNode("div", En, [
                e.createElementVNode(
                  "strong",
                  null,
                  e.toDisplayString(N.$t("用手机扫码打开")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode("button", {
                  type: "button",
                  class: "mm-mob-modal__close",
                  onClick: T[7] || (T[7] = (U) => c.value = !1)
                }, [...T[24] || (T[24] = [
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
                alt: N.$t("我的手机端专属链接二维码"),
                width: "220",
                height: "220"
              }, null, 8, $n),
              e.createElementVNode(
                "small",
                null,
                e.toDisplayString(i.value ? N.$t("这是 {name} 的专属链接，扫开就是本人身份，不要转发给别人。", { name: i.value.name }) : ""),
                1
                /* TEXT */
              ),
              n.value.url ? (e.openBlock(), e.createElementBlock(
                "b",
                bn,
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
  for (const [p, y] of v)
    n[p] = y;
  return n;
}, zt = /* @__PURE__ */ ae(hn, [["__scopeId", "data-v-7e7127bb"]]), _n = {
  class: "mm-home",
  "data-test": "mm-home"
}, Bn = {
  key: 0,
  class: "ss-note danger"
}, Sn = {
  key: 1,
  class: "ss-note"
}, Dn = {
  key: 0,
  class: "ss-note danger mm-home__push",
  "data-test": "mm-home-push-failed"
}, wn = { class: "mm-card mm-hello" }, Cn = { class: "mm-hello__text" }, Tn = { "data-test": "mm-home-brief" }, In = {
  key: 0,
  class: "bad"
}, Mn = { class: "mm-hello__counts" }, An = { class: "mm-home__primary" }, jn = {
  class: "mm-card mm-todos",
  "data-test": "mm-home-todos"
}, Ln = { class: "mm-card__head" }, zn = { class: "mm-chips" }, Fn = ["data-test", "onClick"], Pn = {
  key: 0,
  class: "mm-empty"
}, Un = {
  key: 1,
  class: "mm-todos__list"
}, On = { class: "mm-group__lbl" }, Rn = { class: "mm-group__n" }, qn = ["data-test", "onClick"], Kn = { class: "mm-todo__tag" }, Hn = { class: "mm-todo__main" }, Wn = { key: 0 }, Gn = ["onClick"], Yn = {
  class: "mm-card mm-card--notices",
  "data-test": "mm-home-notices"
}, Jn = { class: "mm-card__head" }, Qn = {
  key: 0,
  class: "mm-tag bad"
}, Zn = ["disabled"], Xn = {
  key: 0,
  class: "mm-empty"
}, xn = ["data-test", "onClick"], eo = { class: "mm-notices__body" }, to = { class: "mm-notices__top" }, lo = { key: 0 }, no = { class: "mm-home__bento" }, oo = {
  class: "mm-card",
  "data-test": "mm-home-mytasks"
}, ao = { class: "mm-card__head" }, so = {
  key: 0,
  class: "mm-empty"
}, ro = {
  key: 1,
  class: "mm-mytasks"
}, io = ["data-test", "onClick"], co = { class: "mm-mytasks__day" }, mo = { class: "mm-mytasks__body" }, uo = { class: "mm-mytasks__bar" }, po = { class: "mm-bar" }, vo = { class: "mm-mytasks__pct" }, ko = {
  key: 0,
  class: "mm-tag bad"
}, yo = {
  key: 1,
  class: "mm-tag warn"
}, go = {
  class: "mm-card",
  "data-test": "mm-home-projects"
}, fo = { class: "mm-card__head" }, No = {
  key: 0,
  class: "mm-empty"
}, Vo = {
  key: 1,
  class: "mm-rows"
}, Eo = ["onClick"], $o = {
  key: 0,
  class: "bad"
}, bo = {
  class: "mm-card",
  "data-test": "mm-home-meetings"
}, ho = { class: "mm-card__head" }, _o = {
  key: 0,
  class: "mm-empty mm-empty--row"
}, Bo = { class: "mm-empty__msg" }, So = {
  key: 1,
  class: "mm-rows"
}, Do = ["onClick"], wo = { class: "mm-row__main" }, Ke = "", Co = /* @__PURE__ */ e.defineComponent({
  __name: "HomeTab",
  emits: ["role"],
  setup(l, { expose: v, emit: n }) {
    const p = n, y = [
      { key: "all", title: t.t("全部") },
      { key: "meeting", title: t.t("会议") },
      { key: "task", title: t.t("任务") },
      { key: "project", title: t.t("项目") }
    ], s = [
      { key: "urgent", title: t.t("紧急") },
      { key: "today", title: t.t("今天") },
      { key: "week", title: t.t("本周") }
    ], o = e.ref(null), c = e.ref(""), i = e.ref(!1), k = e.ref("all"), b = e.ref(!1), m = e.ref(!1), r = e.ref([]), g = e.computed(() => oe.value?.me ?? o.value?.me ?? null), h = e.computed(() => oe.value?.me?.isAdmin && oe.value?.pushFailed || 0), a = e.computed(() => dl((/* @__PURE__ */ new Date()).getHours())), N = e.computed(() => Et(o.value?.todos ?? [], "all")), T = e.computed(() => Et(o.value?.todos ?? [], k.value)), U = e.computed(() => N.value.today.length), j = e.computed(() => {
      const f = N.value.urgent.length, d = U.value;
      let u;
      f && d ? u = t.t("今天有 {urgent}、{n} 件需在今天完成的事项", { urgent: Ke, n: d }) : f ? u = t.t("今天有 {urgent}的事项", { urgent: Ke }) : d ? u = t.t("今天有 {n} 件需在今天完成的事项", { n: d }) : u = t.t("今天没有紧急或需要今天完成的事项");
      const z = u.indexOf(Ke);
      return z < 0 ? { before: u, red: "", after: "" } : { before: u.slice(0, z), red: t.t("{n} 件紧急", { n: f }), after: u.slice(z + Ke.length) };
    }), D = e.computed(() => T.value.urgent.length + T.value.today.length + T.value.week.length), A = e.computed(() => m.value ? r.value : (o.value?.notices ?? []).slice(0, 5)), P = e.computed(() => (o.value?.projects ?? []).some((f) => f.status === "active"));
    function R(f) {
      return f.type === "update_progress" && f.urgency === "urgent" ? t.t("任务逾期") : xt[f.type] || f.type;
    }
    const _ = (f) => Math.max(0, Math.min(100, Math.round(Number(f) || 0)));
    async function S() {
      try {
        o.value = await J("home.get"), c.value = "", m.value && (r.value = await J("notice.list", {}));
      } catch (f) {
        c.value = X.errorMessage(f);
      }
    }
    async function E() {
      if (m.value) {
        m.value = !1;
        return;
      }
      try {
        r.value = await J("notice.list", {}), m.value = !0;
      } catch (f) {
        c.value = X.errorMessage(f);
      }
    }
    async function M() {
      i.value = !0;
      try {
        await J("notice.read", { all: !0 }), await S();
      } catch (f) {
        c.value = X.errorMessage(f);
      } finally {
        i.value = !1;
      }
    }
    async function I(f) {
      if (!f.read)
        try {
          await J("notice.read", { ids: [f.id] });
        } catch {
        }
      de(f.link);
    }
    function H() {
      rt.value = !0, ve("meetings");
    }
    return e.watch(() => pl(o.value), (f) => {
      f && p("role", f);
    }, { immediate: !0 }), e.onMounted(() => {
      S();
    }), v({ refresh: S }), (f, d) => (e.openBlock(), e.createElementBlock("div", _n, [
      c.value ? (e.openBlock(), e.createElementBlock("p", Bn, [
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
          e.toDisplayString(f.$t("重试")),
          1
          /* TEXT */
        )
      ])) : e.createCommentVNode("v-if", !0),
      !o.value && !c.value ? (e.openBlock(), e.createElementBlock("p", Sn, [
        d[10] || (d[10] = e.createElementVNode(
          "i",
          { class: "ri-loader-4-line spin" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(f.$t("正在加载首页…")),
          1
          /* TEXT */
        )
      ])) : e.createCommentVNode("v-if", !0),
      o.value ? (e.openBlock(), e.createElementBlock(
        e.Fragment,
        { key: 2 },
        [
          h.value ? (e.openBlock(), e.createElementBlock("p", Dn, [
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
              e.toDisplayString(f.$t("有 {n} 条企微通知没发出去，相关的人可能没收到卡片（系统内消息照常有）", { n: h.value })),
              1
              /* TEXT */
            ),
            e.createElementVNode(
              "button",
              {
                type: "button",
                class: "ss-link",
                onClick: d[0] || (d[0] = (u) => e.unref(Zt)("wecom"))
              },
              e.toDisplayString(f.$t("查看并重发")),
              1
              /* TEXT */
            )
          ])) : e.createCommentVNode("v-if", !0),
          e.createCommentVNode(" 问候与核心指标 "),
          e.createElementVNode("section", wn, [
            e.createElementVNode("div", Cn, [
              e.createElementVNode(
                "h2",
                null,
                e.toDisplayString(f.$t("{greet}，{name}", { greet: a.value, name: o.value.greetingName || g.value?.person?.name || "" })),
                1
                /* TEXT */
              ),
              e.createElementVNode("p", Tn, [
                e.createTextVNode(
                  e.toDisplayString(j.value.before),
                  1
                  /* TEXT */
                ),
                j.value.red ? (e.openBlock(), e.createElementBlock(
                  "b",
                  In,
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
            e.createElementVNode("div", Mn, [
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
                    e.toDisplayString(f.$t("待处理")),
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
                  onClick: d[1] || (d[1] = (u) => e.unref(ve)("tasks")),
                  onKeydown: d[2] || (d[2] = e.withKeys((u) => e.unref(ve)("tasks"), ["enter"]))
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
                    e.toDisplayString(f.$t("今日到期")),
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
                  onClick: d[3] || (d[3] = (u) => e.unref(ve)("tasks")),
                  onKeydown: d[4] || (d[4] = e.withKeys((u) => e.unref(ve)("tasks"), ["enter"]))
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
                    e.toDisplayString(f.$t("逾期")),
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
                    e.toDisplayString(f.$t("未读通知")),
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
          e.createElementVNode("div", An, [
            e.createCommentVNode(" 待我处理 "),
            e.createElementVNode("section", jn, [
              e.createElementVNode("header", Ln, [
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
                  e.toDisplayString(f.$t("待我处理")),
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
                e.createElementVNode("div", zn, [
                  (e.openBlock(), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(y, (u) => e.createElementVNode("button", {
                      key: u.key,
                      type: "button",
                      class: e.normalizeClass(["mm-chip", { on: k.value === u.key }]),
                      "data-test": `mm-todo-filter-${u.key}`,
                      onClick: (z) => k.value = u.key
                    }, [
                      e.createTextVNode(
                        e.toDisplayString(u.title) + " ",
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "span",
                        null,
                        e.toDisplayString(T.value.counts[u.key]),
                        1
                        /* TEXT */
                      )
                    ], 10, Fn)),
                    64
                    /* STABLE_FRAGMENT */
                  ))
                ])
              ]),
              D.value ? (e.openBlock(), e.createElementBlock("div", Un, [
                (e.openBlock(), e.createElementBlock(
                  e.Fragment,
                  null,
                  e.renderList(s, (u) => (e.openBlock(), e.createElementBlock(
                    e.Fragment,
                    {
                      key: u.key
                    },
                    [
                      T.value[u.key].length ? (e.openBlock(), e.createElementBlock(
                        "div",
                        {
                          key: 0,
                          class: e.normalizeClass(["mm-group", u.key])
                        },
                        [
                          e.createElementVNode(
                            "span",
                            On,
                            e.toDisplayString(u.title),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "span",
                            Rn,
                            e.toDisplayString(T.value[u.key].length),
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
                          u.key === "week" ? (e.openBlock(), e.createElementBlock("button", {
                            key: 0,
                            type: "button",
                            class: "ss-link",
                            "data-test": "mm-week-toggle",
                            onClick: d[5] || (d[5] = (z) => b.value = !b.value)
                          }, [
                            e.createTextVNode(
                              e.toDisplayString(b.value ? f.$t("收起") : f.$t("展开")),
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
                      u.key !== "week" || b.value ? (e.openBlock(!0), e.createElementBlock(
                        e.Fragment,
                        { key: 1 },
                        e.renderList(T.value[u.key], (z) => (e.openBlock(), e.createElementBlock("article", {
                          key: z.id,
                          class: e.normalizeClass(["mm-todo", { urgent: z.urgency === "urgent" }]),
                          "data-test": `mm-todo-${z.id}`,
                          onClick: (Q) => e.unref(de)(z.link)
                        }, [
                          e.createElementVNode(
                            "span",
                            Kn,
                            e.toDisplayString(R(z)),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode("div", Hn, [
                            e.createElementVNode(
                              "strong",
                              null,
                              e.toDisplayString(z.title),
                              1
                              /* TEXT */
                            ),
                            z.subtitle ? (e.openBlock(), e.createElementBlock(
                              "small",
                              Wn,
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
                            onClick: e.withModifiers((Q) => e.unref(de)(z.link), ["stop"])
                          }, e.toDisplayString(e.unref(el)[z.type]), 11, Gn)
                        ], 10, qn))),
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
              ])) : (e.openBlock(), e.createElementBlock("p", Pn, [
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
                  e.toDisplayString(f.$t("暂无待办")),
                  1
                  /* TEXT */
                )
              ]))
            ]),
            e.createCommentVNode(" 通知 "),
            e.createElementVNode("section", Yn, [
              e.createElementVNode("header", Jn, [
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
                  e.toDisplayString(f.$t("通知")),
                  1
                  /* TEXT */
                ),
                o.value.counts.unread ? (e.openBlock(), e.createElementBlock(
                  "span",
                  Qn,
                  e.toDisplayString(f.$t("{n} 未读", { n: o.value.counts.unread })),
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
                }, e.toDisplayString(f.$t("全部标为已读")), 9, Zn)) : e.createCommentVNode("v-if", !0),
                e.createElementVNode("button", {
                  type: "button",
                  class: "ss-link",
                  "data-test": "mm-notice-all",
                  onClick: E
                }, [
                  e.createTextVNode(
                    e.toDisplayString(m.value ? f.$t("收起") : f.$t("全部")),
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
              A.value.length ? (e.openBlock(), e.createElementBlock(
                "ul",
                {
                  key: 1,
                  class: e.normalizeClass(["mm-notices", { all: m.value }])
                },
                [
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(A.value, (u) => (e.openBlock(), e.createElementBlock("li", {
                      key: u.id,
                      class: e.normalizeClass({ unread: !u.read }),
                      "data-test": `mm-notice-${u.id}`,
                      onClick: (z) => I(u)
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
                      e.createElementVNode("div", eo, [
                        e.createElementVNode("div", to, [
                          e.createElementVNode(
                            "strong",
                            null,
                            e.toDisplayString(u.title || e.unref(tl)[u.type]),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "time",
                            null,
                            e.toDisplayString(e.unref(ll)(u.at)),
                            1
                            /* TEXT */
                          )
                        ]),
                        u.summary ? (e.openBlock(), e.createElementBlock(
                          "small",
                          lo,
                          e.toDisplayString(u.summary),
                          1
                          /* TEXT */
                        )) : e.createCommentVNode("v-if", !0)
                      ])
                    ], 10, xn))),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ],
                2
                /* CLASS */
              )) : (e.openBlock(), e.createElementBlock("p", Xn, [
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
                  e.toDisplayString(f.$t("暂无通知")),
                  1
                  /* TEXT */
                )
              ]))
            ])
          ]),
          e.createCommentVNode(" 第二工作区：三栏平铺（我的任务 / 我参与的项目 / 最近会议），拒绝向下堆叠 "),
          e.createElementVNode("div", no, [
            e.createCommentVNode(" 我的任务 · 本周截止 "),
            e.createElementVNode("section", oo, [
              e.createElementVNode("header", ao, [
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
                  e.toDisplayString(f.$t("我的任务 · 本周截止")),
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
                  onClick: d[6] || (d[6] = (u) => e.unref(ve)("tasks"))
                }, [
                  e.createTextVNode(
                    e.toDisplayString(f.$t("全部任务")),
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
              o.value.myTasksThisWeek.length ? (e.openBlock(), e.createElementBlock("ul", ro, [
                (e.openBlock(!0), e.createElementBlock(
                  e.Fragment,
                  null,
                  e.renderList(o.value.myTasksThisWeek, (u) => (e.openBlock(), e.createElementBlock("li", {
                    key: u.id,
                    "data-test": `mm-mytask-${u.id}`,
                    onClick: (z) => e.unref(de)({ kind: "task", id: u.id })
                  }, [
                    e.createElementVNode("div", co, [
                      e.createElementVNode(
                        "small",
                        null,
                        e.toDisplayString(e.unref(Nt)(u.due).day),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "b",
                        null,
                        e.toDisplayString(e.unref(Nt)(u.due).md),
                        1
                        /* TEXT */
                      )
                    ]),
                    e.createElementVNode("div", mo, [
                      e.createElementVNode(
                        "strong",
                        null,
                        e.toDisplayString(u.title),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode("div", uo, [
                        e.createElementVNode("span", po, [
                          e.createElementVNode(
                            "i",
                            {
                              class: e.normalizeClass({ bad: u.overdue }),
                              style: e.normalizeStyle({ width: `${_(u.percent)}%` })
                            },
                            null,
                            6
                            /* CLASS, STYLE */
                          )
                        ]),
                        e.createElementVNode(
                          "span",
                          vo,
                          e.toDisplayString(_(u.percent)) + "%",
                          1
                          /* TEXT */
                        ),
                        u.overdue ? (e.openBlock(), e.createElementBlock(
                          "span",
                          ko,
                          e.toDisplayString(f.$t("逾期 {n} 天", { n: u.overdueDays })),
                          1
                          /* TEXT */
                        )) : u.objection ? (e.openBlock(), e.createElementBlock(
                          "span",
                          yo,
                          e.toDisplayString(e.unref(mt)(u.objection)),
                          1
                          /* TEXT */
                        )) : e.createCommentVNode("v-if", !0)
                      ])
                    ])
                  ], 8, io))),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ])) : (e.openBlock(), e.createElementBlock("p", so, [
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
                  e.toDisplayString(f.$t("没有即将到期或逾期的任务")),
                  1
                  /* TEXT */
                )
              ]))
            ]),
            e.createCommentVNode(" 我参与的项目 "),
            e.createElementVNode("section", go, [
              e.createElementVNode("header", fo, [
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
                  e.toDisplayString(f.$t("我参与的项目")),
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
                  onClick: d[7] || (d[7] = (u) => e.unref(ve)("projects"))
                }, [
                  e.createTextVNode(
                    e.toDisplayString(f.$t("全部项目")),
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
              o.value.projects.length ? (e.openBlock(), e.createElementBlock("ul", Vo, [
                (e.openBlock(!0), e.createElementBlock(
                  e.Fragment,
                  null,
                  e.renderList(o.value.projects, (u) => (e.openBlock(), e.createElementBlock("li", {
                    key: u.id,
                    onClick: (z) => e.unref(de)({ kind: "project", id: u.id })
                  }, [
                    e.createElementVNode(
                      "strong",
                      null,
                      e.toDisplayString(u.name),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "span",
                      {
                        class: e.normalizeClass(["mm-tag", u.status === "active" ? "brand" : u.status === "closing" ? "warn" : ""])
                      },
                      e.toDisplayString(e.unref(Ge)[u.status]),
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
                      e.toDisplayString(f.$t("任务 {a}/{b}", { a: u.done, b: u.total })),
                      1
                      /* TEXT */
                    ),
                    u.overdue ? (e.openBlock(), e.createElementBlock(
                      "small",
                      $o,
                      e.toDisplayString(f.$t("逾期 {n}", { n: u.overdue })),
                      1
                      /* TEXT */
                    )) : e.createCommentVNode("v-if", !0)
                  ], 8, Eo))),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ])) : (e.openBlock(), e.createElementBlock("p", No, [
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
                  e.toDisplayString(f.$t("还没有参与的项目")),
                  1
                  /* TEXT */
                )
              ]))
            ]),
            e.createCommentVNode(" 最近会议 "),
            e.createElementVNode("section", bo, [
              e.createElementVNode("header", ho, [
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
                  e.toDisplayString(f.$t("最近会议")),
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
                  onClick: d[8] || (d[8] = (u) => e.unref(ve)("meetings"))
                }, [
                  e.createTextVNode(
                    e.toDisplayString(f.$t("全部会议")),
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
              o.value.recentMeetings.length ? (e.openBlock(), e.createElementBlock("ul", So, [
                (e.openBlock(!0), e.createElementBlock(
                  e.Fragment,
                  null,
                  e.renderList(o.value.recentMeetings, (u) => (e.openBlock(), e.createElementBlock("li", {
                    key: u.id,
                    onClick: (z) => e.unref(de)({ kind: "meeting", id: u.id })
                  }, [
                    e.createElementVNode("div", wo, [
                      e.createElementVNode(
                        "strong",
                        null,
                        e.toDisplayString(u.title),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "small",
                        null,
                        e.toDisplayString(u.projectName) + " · " + e.toDisplayString(e.unref(Tt)(u.time)),
                        1
                        /* TEXT */
                      )
                    ]),
                    e.createElementVNode(
                      "span",
                      {
                        class: e.normalizeClass(["mm-tag", e.unref(pt)[u.status]])
                      },
                      e.toDisplayString(e.unref(Xe)[u.status]),
                      3
                      /* TEXT, CLASS */
                    )
                  ], 8, Do))),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ])) : (e.openBlock(), e.createElementBlock("div", _o, [
                e.createElementVNode("span", Bo, [
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
                    e.toDisplayString(f.$t("还没有参加过会议")),
                    1
                    /* TEXT */
                  )
                ]),
                P.value ? (e.openBlock(), e.createElementBlock(
                  "button",
                  {
                    key: 0,
                    type: "button",
                    class: "mm-btn soft sm",
                    "data-test": "mm-home-new-meeting",
                    onClick: H
                  },
                  e.toDisplayString(f.$t("新建会议")),
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
}), To = /* @__PURE__ */ ae(Co, [["__scopeId", "data-v-ea93ab2f"]]), Io = {
  class: "mm-up",
  "data-test": "mm-upload-panel"
}, Mo = {
  key: 0,
  class: "mm-up__zone"
}, Ao = ["disabled"], jo = { class: "mm-up__formats" }, Lo = { class: "ss-muted" }, zo = {
  key: 1,
  class: "ss-note"
}, Fo = { class: "mm-up__proc" }, Po = { class: "mm-up__stages" }, Uo = { class: "mm-up__bar" }, Oo = { class: "mm-up__line" }, Ro = {
  key: 0,
  class: "ss-muted"
}, qo = {
  key: 1,
  class: "ss-muted"
}, Ko = {
  key: 0,
  class: "ss-note warn",
  "data-test": "mm-process-stalled"
}, Ho = {
  key: 1,
  class: "ss-muted"
}, Wo = {
  class: "ss-note danger",
  "data-test": "mm-process-failed"
}, Go = { class: "ss-actions" }, Yo = ["disabled"], Jo = ["disabled"], Qo = {
  key: 2,
  class: "ss-muted"
}, Zo = {
  key: 3,
  class: "ss-note danger"
}, Xo = /* @__PURE__ */ e.defineComponent({
  __name: "UploadPanel",
  props: {
    detail: {},
    live: {},
    now: {},
    waitFrom: {}
  },
  emits: ["changed", "log", "wait"],
  setup(l, { emit: v }) {
    const n = l, p = v, y = ie.useNotificationStore(), s = e.ref(!1), o = e.ref(""), c = e.computed(() => n.detail.meeting), i = e.computed(() => n.detail.names[c.value.hostId]?.name || ""), k = e.computed(() => {
      const j = c.value.process;
      return n.live ? { stage: n.live.stage, progress: n.live.progress, text: n.live.text } : { stage: j?.stage || "extract", progress: j?.progress || 0, text: j?.log?.length ? j.log[j.log.length - 1].text : "" };
    }), b = e.computed(() => Math.max(0, Math.min(100, Math.round(k.value.progress || 0)))), m = e.computed(() => {
      const j = c.value.files || [];
      if (j.length && j.every((A) => A.kind === "transcript")) return ["parse", "organize"];
      const D = j.some((A) => A.kind === "video") ? ["extract", "transcribe", "diarize", "organize"] : ["transcribe", "diarize", "organize"];
      return D.includes(k.value.stage) ? D : ["extract", "transcribe", "diarize", "parse", "organize"];
    }), r = e.computed(() => Math.max(0, m.value.indexOf(k.value.stage))), g = e.computed(() => c.value.process?.startedAt || 0), h = e.computed(() => Math.max(gl(c.value.process, n.live?.at) || 0, n.waitFrom || 0)), a = e.computed(() => !!h.value && n.now - h.value > fl), N = e.computed(() => Math.floor((n.now - h.value) / 6e4));
    async function T() {
      if (!s.value) {
        s.value = !0, o.value = "";
        try {
          await J("meeting.pickFiles", { id: c.value.id }) && y.success(t.t("文件已上传，开始处理")), p("changed");
        } catch (j) {
          o.value = X.errorMessage(j);
        } finally {
          s.value = !1;
        }
      }
    }
    async function U() {
      if (!s.value) {
        s.value = !0, o.value = "";
        try {
          await J("meeting.retry", { id: c.value.id }), p("changed");
        } catch (j) {
          o.value = X.errorMessage(j);
        } finally {
          s.value = !1;
        }
      }
    }
    return (j, D) => (e.openBlock(), e.createElementBlock("section", Io, [
      e.createCommentVNode(" 待上传 "),
      c.value.status === "pending_upload" ? (e.openBlock(), e.createElementBlock(
        e.Fragment,
        { key: 0 },
        [
          l.detail.my.isHost ? (e.openBlock(), e.createElementBlock("div", Mo, [
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
              onClick: T
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
            ], 8, Ao),
            e.createElementVNode("ul", jo, [
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
              Lo,
              e.toDisplayString(j.$t("扩展名不认识的文件会先探测，有音轨就当录音处理；可以一次选多个文件。")),
              1
              /* TEXT */
            )
          ])) : (e.openBlock(), e.createElementBlock("p", zo, [
            D[4] || (D[4] = e.createElementVNode(
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
          e.createElementVNode("div", Fo, [
            e.createElementVNode("ol", Po, [
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(m.value, (A, P) => (e.openBlock(), e.createElementBlock(
                  "li",
                  {
                    key: A,
                    class: e.normalizeClass({ done: P < r.value, cur: P === r.value })
                  },
                  [
                    e.createElementVNode(
                      "i",
                      {
                        class: e.normalizeClass(P < r.value ? "ri-checkbox-circle-fill" : P === r.value ? "ri-loader-4-line spin" : "ri-checkbox-blank-circle-line")
                      },
                      null,
                      2
                      /* CLASS */
                    ),
                    e.createTextVNode(
                      e.toDisplayString(e.unref(je)[A]),
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
            e.createElementVNode("div", Uo, [
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
            e.createElementVNode("p", Oo, [
              e.createElementVNode(
                "b",
                null,
                e.toDisplayString(e.unref(je)[k.value.stage]) + " · " + e.toDisplayString(b.value) + "%",
                1
                /* TEXT */
              ),
              k.value.text ? (e.openBlock(), e.createElementBlock(
                "span",
                Ro,
                e.toDisplayString(k.value.text),
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
              g.value ? (e.openBlock(), e.createElementBlock(
                "span",
                qo,
                e.toDisplayString(j.$t("已用时 {t}", { t: e.unref(cl)(l.now - g.value) })),
                1
                /* TEXT */
              )) : e.createCommentVNode("v-if", !0)
            ]),
            a.value ? (e.openBlock(), e.createElementBlock("p", Ko, [
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
                e.toDisplayString(j.$t("已经 {m} 分钟没有新进度。长录音转写较慢，可以继续等待；也可以看看处理日志。", { m: N.value })),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "button",
                {
                  type: "button",
                  class: "ss-link",
                  onClick: D[0] || (D[0] = (A) => p("wait"))
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
                  onClick: D[1] || (D[1] = (A) => p("log"))
                },
                e.toDisplayString(j.$t("查看日志")),
                1
                /* TEXT */
              )
            ])) : (e.openBlock(), e.createElementBlock(
              "small",
              Ho,
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
          e.createElementVNode("p", Wo, [
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
              e.toDisplayString(j.$t("处理失败（{stage}）：{error}", { stage: e.unref(je)[c.value.process?.stage || "extract"], error: c.value.process?.error || j.$t("未知原因") })),
              1
              /* TEXT */
            )
          ]),
          e.createElementVNode("div", Go, [
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
                e.toDisplayString(j.$t("重试")),
                1
                /* TEXT */
              )
            ], 8, Yo)) : e.createCommentVNode("v-if", !0),
            l.detail.my.isHost ? (e.openBlock(), e.createElementBlock("button", {
              key: 1,
              type: "button",
              class: "ss-btn",
              disabled: s.value,
              onClick: T
            }, [
              D[8] || (D[8] = e.createElementVNode(
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
            ], 8, Jo)) : e.createCommentVNode("v-if", !0),
            e.createElementVNode("button", {
              type: "button",
              class: "ss-btn ghost",
              onClick: D[2] || (D[2] = (A) => p("log"))
            }, [
              D[9] || (D[9] = e.createElementVNode(
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
              Qo,
              e.toDisplayString(j.$t("等待主持人 {name} 重试", { name: i.value })),
              1
              /* TEXT */
            ))
          ])
        ],
        64
        /* STABLE_FRAGMENT */
      )) : e.createCommentVNode("v-if", !0),
      o.value ? (e.openBlock(), e.createElementBlock("p", Zo, [
        D[10] || (D[10] = e.createElementVNode(
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
}), xo = /* @__PURE__ */ ae(Xo, [["__scopeId", "data-v-a1e2ccd7"]]), ea = ["data-test"], ta = ["aria-label", "data-test", "onClick"], la = ["data-test"], na = { class: "mm-pss__name" }, oa = { key: 0 }, aa = ["aria-label", "aria-expanded", "aria-activedescendant", "placeholder", "disabled", "data-test"], sa = ["aria-label", "data-test"], ra = {
  key: 3,
  class: "ri-arrow-down-s-line mm-pss__caret",
  "aria-hidden": "true"
}, ia = ["aria-multiselectable", "data-test"], ca = { class: "mm-pss-pop__group" }, da = ["id", "aria-selected", "data-test", "onMouseenter", "onClick"], ma = { class: "mm-pss-pop__name" }, ua = { key: 0 }, pa = { key: 1 }, va = {
  key: 2,
  class: "ri-check-line mm-pss-pop__check",
  "aria-hidden": "true"
}, ka = {
  key: 0,
  class: "mm-pss-pop__empty"
}, ya = /* @__PURE__ */ e.defineComponent({
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
    const n = l, p = v, y = e.ref(null), s = e.ref(null), o = e.ref(null), c = e.ref(!1), i = e.ref(""), k = e.ref(0), b = e.ref(null), m = e.ref(!1), r = e.ref({}), g = `mm-pss-${Math.random().toString(36).slice(2, 9)}`, h = `${g}-list`, a = e.computed(() => n.placeholder || t.t("搜索姓名、拼音或部门")), N = e.computed(() => n.people ?? b.value ?? { depts: [], people: [] }), T = (C) => N.value.depts.find((F) => F.id === C)?.name || "";
    let U = null;
    const j = e.ref(!1);
    function D() {
      U || j.value || Promise.resolve().then(() => D$).then((C) => {
        U = C.pinyin, j.value = !0;
      }).catch(() => {
      });
    }
    const A = /* @__PURE__ */ new Map();
    function P(C) {
      if (!U || !/[㐀-鿿]/.test(C)) return "";
      const F = A.get(C);
      if (F !== void 0) return F;
      let x = "";
      try {
        const Z = U(C, { toneType: "none", type: "array" }).map((se) => String(se).toLowerCase());
        x = `${Z.join("")} ${Z.map((se) => se[0] || "").join("")}`;
      } catch {
        x = "";
      }
      return A.set(C, x), x;
    }
    function R(C, F, x, Z, se = "") {
      const Ee = T(x) || se, he = re(F), Te = n.hint?.(C) || "";
      return j.value, {
        value: C,
        label: F,
        sub: [Ee, Z].filter(Boolean).join(" · "),
        hint: Te,
        initial: he.text,
        color: he.color,
        deptId: x,
        search: `${F} ${Ee} ${Z || ""} ${P(F)}`.toLowerCase()
      };
    }
    const _ = e.computed(() => {
      const C = n.only ? new Set(n.only) : null, F = new Set(n.exclude ?? []);
      return N.value.people.filter((x) => !x.left && (!C || C.has(x.id)) && !F.has(x.id)).map((x) => R(x.id, x.name, x.deptId, x.title));
    }), S = e.computed(() => (n.extras ?? []).map((C) => {
      const F = re(C.label);
      return { value: C.value, label: C.label, sub: C.sub || "", hint: "", initial: F.text, color: F.color, deptId: "", search: `${C.label} ${C.sub || ""} ${P(C.label)}`.toLowerCase() };
    })), E = e.computed(() => {
      const C = new Set(n.exclude ?? []);
      return (n.pinned ?? []).filter((F) => !C.has(F)).map((F) => {
        const x = N.value.people.find((se) => se.id === F);
        if (x) return R(x.id, x.name, x.deptId, x.title);
        const Z = n.names?.[F];
        return R(F, Z?.name || F, "", void 0, Z?.deptName || "");
      });
    });
    function M(C, F) {
      return F ? F.split(/\s+/).filter(Boolean).every((x) => C.search.includes(x)) : !0;
    }
    const I = e.computed(() => {
      const C = i.value.trim().toLowerCase(), F = [], x = S.value.filter((me) => M(me, C));
      x.length && F.push({ key: "__extras", label: n.extrasLabel || t.t("本场发言人"), options: x });
      const Z = E.value.filter((me) => M(me, C));
      Z.length && F.push({ key: "__pinned", label: n.pinnedLabel || t.t("本场参会人"), options: Z });
      const se = new Set(n.pinned ?? []), Ee = _.value.filter((me) => !se.has(me.value) && M(me, C)), he = /* @__PURE__ */ new Set();
      for (const me of N.value.depts) {
        he.add(me.id);
        const Re = Ee.filter((tt) => tt.deptId === me.id);
        Re.length && F.push({ key: me.id, label: me.name, options: Re });
      }
      const Te = Ee.filter((me) => !he.has(me.deptId));
      return Te.length && F.push({ key: "__other", label: t.t("其他"), options: Te }), F;
    }), H = e.computed(() => I.value.flatMap((C) => C.options)), f = e.computed(() => n.multiple ? n.values.filter(Boolean) : n.modelValue ? [n.modelValue] : []), d = (C) => f.value.includes(C), u = e.computed(() => n.multiple ? null : Q(n.modelValue)), z = e.computed(() => f.value.map(Q).filter((C) => !!C));
    function Q(C) {
      return C ? S.value.find((F) => F.value === C) ?? E.value.find((F) => F.value === C) ?? _.value.find((F) => F.value === C) ?? (() => {
        const F = N.value.people.find((Z) => Z.id === C), x = n.names?.[C];
        return F || x ? R(C, F?.name || x.name, F?.deptId || "", F?.title, x?.deptName || "") : null;
      })() : null;
    }
    const te = (C) => `${g}-${C.value.replace(/[^A-Za-z0-9_-]/g, "_")}`;
    function K() {
      const C = y.value;
      if (!C) return;
      const F = C.getBoundingClientRect(), x = window.innerHeight || 800, Z = x - F.bottom - 12, se = F.top - 12, Ee = Z < 220 && se > Z, he = Math.max(160, Math.min(340, Ee ? se : Z));
      r.value = {
        position: "fixed",
        left: `${Math.round(F.left)}px`,
        width: `${Math.round(Math.max(F.width, 260))}px`,
        maxHeight: `${Math.round(he)}px`,
        ...Ee ? { bottom: `${Math.round(x - F.top + 4)}px` } : { top: `${Math.round(F.bottom + 4)}px` }
      };
    }
    function G() {
      c.value && K();
    }
    function ee() {
      if (n.disabled || c.value) return;
      D(), !n.people && !b.value && !m.value && (m.value = !0, De().then((F) => {
        b.value = F;
      }).catch(() => {
      }).finally(() => {
        m.value = !1;
      })), i.value = "", c.value = !0;
      const C = H.value.findIndex((F) => d(F.value));
      k.value = C >= 0 ? C : 0, K(), window.addEventListener("scroll", G, !0), window.addEventListener("resize", G), e.nextTick(Y);
    }
    function ne() {
      c.value && (c.value = !1, i.value = "", window.removeEventListener("scroll", G, !0), window.removeEventListener("resize", G));
    }
    function V(C) {
      if (!n.disabled) {
        if (C.target !== s.value && C.preventDefault(), c.value && C.target !== s.value) {
          ne();
          return;
        }
        s.value?.focus(), ee();
      }
    }
    function $() {
      ne();
    }
    function B(C) {
      if (!C) return;
      const F = f.value;
      F.includes(C) ? p("update:values", F.filter((x) => x !== C)) : (!n.max || F.length < n.max) && p("update:values", [...F, C]), i.value = "";
    }
    function w() {
      if (n.multiple) {
        p("update:values", []);
        return;
      }
      q("");
    }
    function q(C) {
      if (n.multiple) {
        B(C);
        return;
      }
      C !== n.modelValue && (p("update:modelValue", C), p("change", C)), ne(), s.value?.blur();
    }
    function Y() {
      const C = H.value[k.value];
      if (!C || !o.value) return;
      o.value.querySelector(`#${CSS.escape(te(C))}`)?.scrollIntoView?.({ block: "nearest" });
    }
    function O(C) {
      if (n.multiple && C.key === "Backspace" && !i.value && f.value.length) {
        B(f.value[f.value.length - 1]);
        return;
      }
      if (!c.value && (C.key === "ArrowDown" || C.key === "Enter")) {
        C.preventDefault(), ee();
        return;
      }
      if (!c.value) return;
      const F = H.value.length;
      if (C.key === "ArrowDown")
        C.preventDefault(), F && (k.value = (k.value + 1) % F), e.nextTick(Y);
      else if (C.key === "ArrowUp")
        C.preventDefault(), F && (k.value = (k.value - 1 + F) % F), e.nextTick(Y);
      else if (C.key === "Enter") {
        C.preventDefault();
        const x = H.value[k.value];
        x && q(x.value);
      } else C.key === "Escape" ? (C.preventDefault(), C.stopPropagation(), ne()) : C.key === "Tab" && ne();
    }
    return e.watch(() => H.value.length, (C) => {
      k.value >= C && (k.value = Math.max(0, C - 1));
    }), e.watch(() => n.disabled, (C) => {
      C && ne();
    }), e.onMounted(() => {
      !n.people && f.value.length && (m.value = !0, De().then((C) => {
        b.value = C;
      }).catch(() => {
      }).finally(() => {
        m.value = !1;
      }));
    }), e.onBeforeUnmount(ne), (C, F) => (e.openBlock(), e.createElementBlock(
      "div",
      {
        ref_key: "root",
        ref: y,
        class: e.normalizeClass(["mm-pss", { open: c.value, disabled: l.disabled, multi: l.multiple }]),
        onMousedown: V
      },
      [
        F[7] || (F[7] = e.createElementVNode(
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
          e.renderList(z.value, (x) => (e.openBlock(), e.createElementBlock("span", {
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
              "aria-label": C.$t("移除 {name}", { name: x.label }),
              "data-test": l.dataTest ? `${l.dataTest}-chip-x-${x.value}` : void 0,
              onMousedown: F[0] || (F[0] = e.withModifiers(() => {
              }, ["prevent", "stop"])),
              onClick: (Z) => B(x.value)
            }, [...F[5] || (F[5] = [
              e.createElementVNode(
                "i",
                { class: "ri-close-line" },
                null,
                -1
                /* CACHED */
              )
            ])], 40, ta))
          ], 8, ea))),
          128
          /* KEYED_FRAGMENT */
        )) : e.createCommentVNode("v-if", !0),
        !l.multiple && !c.value && u.value ? (e.openBlock(), e.createElementBlock("span", {
          key: 1,
          class: "mm-pss__value",
          "data-test": l.dataTest ? `${l.dataTest}-value` : void 0
        }, [
          e.createElementVNode(
            "span",
            {
              class: "mm-pss__av",
              style: e.normalizeStyle({ background: u.value.color })
            },
            e.toDisplayString(u.value.initial),
            5
            /* TEXT, STYLE */
          ),
          e.createElementVNode(
            "span",
            na,
            e.toDisplayString(u.value.label),
            1
            /* TEXT */
          ),
          u.value.sub ? (e.openBlock(), e.createElementBlock(
            "small",
            oa,
            e.toDisplayString(u.value.sub),
            1
            /* TEXT */
          )) : e.createCommentVNode("v-if", !0)
        ], 8, la)) : e.createCommentVNode("v-if", !0),
        e.withDirectives(e.createElementVNode("input", {
          ref_key: "inputEl",
          ref: s,
          "onUpdate:modelValue": F[1] || (F[1] = (x) => i.value = x),
          class: e.normalizeClass(["mm-pss__input", { ghost: !l.multiple && !c.value && !!u.value }]),
          type: "text",
          role: "combobox",
          autocomplete: "off",
          spellcheck: "false",
          "aria-label": l.ariaLabel || a.value,
          "aria-expanded": c.value,
          "aria-autocomplete": "list",
          "aria-controls": h,
          "aria-activedescendant": c.value && H.value[k.value] ? te(H.value[k.value]) : void 0,
          placeholder: l.multiple ? f.value.length ? "" : a.value : !c.value && u.value ? "" : a.value,
          disabled: l.disabled,
          "data-test": l.dataTest,
          onFocus: ee,
          onInput: F[2] || (F[2] = (x) => k.value = 0),
          onKeydown: O,
          onBlur: $
        }, null, 42, aa), [
          [e.vModelText, i.value]
        ]),
        l.clearable && f.value.length && !l.disabled ? (e.openBlock(), e.createElementBlock("button", {
          key: 2,
          type: "button",
          class: "mm-pss__clear",
          "aria-label": C.$t("清除"),
          "data-test": l.dataTest ? `${l.dataTest}-clear` : void 0,
          onMousedown: F[3] || (F[3] = e.withModifiers(() => {
          }, ["prevent", "stop"])),
          onClick: w
        }, [...F[6] || (F[6] = [
          e.createElementVNode(
            "i",
            { class: "ri-close-circle-fill" },
            null,
            -1
            /* CACHED */
          )
        ])], 40, sa)) : (e.openBlock(), e.createElementBlock("i", ra)),
        (e.openBlock(), e.createBlock(e.Teleport, { to: "body" }, [
          c.value ? (e.openBlock(), e.createElementBlock("div", {
            key: 0,
            id: h,
            ref_key: "popEl",
            ref: o,
            class: "mm-pss-pop",
            role: "listbox",
            "aria-multiselectable": l.multiple || void 0,
            style: e.normalizeStyle(r.value),
            "data-test": l.dataTest ? `${l.dataTest}-list` : void 0,
            onMousedown: F[4] || (F[4] = e.withModifiers(() => {
            }, ["prevent"]))
          }, [
            (e.openBlock(!0), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(I.value, (x) => (e.openBlock(), e.createElementBlock(
                e.Fragment,
                {
                  key: x.key
                },
                [
                  e.createElementVNode(
                    "div",
                    ca,
                    e.toDisplayString(x.label),
                    1
                    /* TEXT */
                  ),
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(x.options, (Z) => (e.openBlock(), e.createElementBlock("div", {
                      id: te(Z),
                      key: Z.value,
                      role: "option",
                      "aria-selected": d(Z.value),
                      class: e.normalizeClass(["mm-pss-pop__opt", { active: H.value[k.value]?.value === Z.value, sel: d(Z.value) }]),
                      "data-test": l.dataTest ? `${l.dataTest}-opt-${Z.value}` : void 0,
                      onMouseenter: (se) => k.value = H.value.indexOf(Z),
                      onClick: (se) => q(Z.value)
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
                        ma,
                        e.toDisplayString(Z.label),
                        1
                        /* TEXT */
                      ),
                      Z.sub ? (e.openBlock(), e.createElementBlock(
                        "small",
                        ua,
                        e.toDisplayString(Z.sub),
                        1
                        /* TEXT */
                      )) : e.createCommentVNode("v-if", !0),
                      Z.hint ? (e.openBlock(), e.createElementBlock(
                        "em",
                        pa,
                        e.toDisplayString(Z.hint),
                        1
                        /* TEXT */
                      )) : e.createCommentVNode("v-if", !0),
                      d(Z.value) ? (e.openBlock(), e.createElementBlock("i", va)) : e.createCommentVNode("v-if", !0)
                    ], 42, da))),
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
            H.value.length ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock(
              "div",
              ka,
              e.toDisplayString(m.value ? C.$t("正在加载人员…") : i.value.trim() ? C.$t("没有找到「{q}」", { q: i.value.trim() }) : C.$t("没有可选的人员")),
              1
              /* TEXT */
            ))
          ], 44, ia)) : e.createCommentVNode("v-if", !0)
        ]))
      ],
      34
      /* CLASS, NEED_HYDRATION */
    ));
  }
}), Oe = /* @__PURE__ */ ae(ya, [["__scopeId", "data-v-051698b0"]]), ga = { class: "mm-sa__head" }, fa = { class: "ss-muted" }, Na = ["aria-expanded"], Va = {
  key: 0,
  class: "ss-note"
}, Ea = ["data-test"], $a = { class: "mm-sa__who" }, ba = { class: "mm-sa__label" }, ha = { class: "mm-sa__sample" }, _a = ["src"], Ba = { class: "mm-sa__ops" }, Sa = ["disabled", "data-test", "onClick"], Da = { class: "ss-chip ok" }, wa = ["onClick"], Ca = ["disabled", "data-test", "onClick"], Ta = {
  key: 2,
  class: "ss-chip warn"
}, Ia = {
  key: 0,
  class: "ss-note danger"
}, Ma = { class: "ss-muted" }, Aa = /* @__PURE__ */ e.defineComponent({
  __name: "SpeakerAssignPanel",
  props: {
    detail: {}
  },
  emits: ["changed"],
  setup(l, { emit: v }) {
    const n = l, p = v, y = e.reactive({}), s = e.reactive({}), o = e.ref(""), c = e.ref(""), i = e.ref(""), k = e.ref(""), b = e.computed(() => n.detail.meeting), m = e.computed(() => b.value.status !== "pending_assign"), r = e.ref(!m.value), g = e.computed(() => ["pending_assign", "pending_confirm", "pending_review"].includes(b.value.status)), h = e.ref({ depts: [], people: [] });
    e.onMounted(async () => {
      try {
        h.value = await De();
      } catch {
      }
    });
    const a = e.computed(() => n.detail.names[b.value.hostId]?.name || ""), N = (R) => n.detail.names[R]?.name || R, T = e.computed(() => {
      const R = b.value.speakers.map((_) => {
        const S = b.value.segments.filter((I) => I.speakerLabel === _.label).sort((I, H) => I.start - H.start), E = S.filter((I) => I.text.trim()).slice(0, 2).map((I) => I.text.length > 60 ? `${I.text.slice(0, 60)}…` : I.text), M = S.reduce((I, H) => I + Math.max(0, H.end - H.start), 0);
        return { ..._, count: S.length, seconds: M, samples: E };
      });
      return [...R.filter((_) => !_.personId), ...R.filter((_) => _.personId)];
    }), U = e.computed(() => T.value.filter((R) => !R.personId));
    function j(R, _) {
      return b.value.speakers.find((S) => S.personId === R && S.label !== _)?.label || "";
    }
    function D(R, _) {
      i.value = R, s[R] = _ || "";
    }
    async function A(R) {
      if (y[R]) {
        const _ = y[R];
        y[R] = "", setTimeout(() => {
          y[R] = _;
        }, 0);
        return;
      }
      o.value = R, k.value = "";
      try {
        const _ = await J("meeting.speaker.clip", { id: b.value.id, label: R });
        if (!_?.dataUrl) throw new Error(t.t("这位发言人没有可试听的片段"));
        y[R] = _.dataUrl;
      } catch (_) {
        k.value = X.errorMessage(_);
      } finally {
        o.value = "";
      }
    }
    async function P(R) {
      const _ = s[R];
      if (_) {
        c.value = R, k.value = "";
        try {
          await J("meeting.speaker.assign", { id: b.value.id, label: R, personId: _ }), i.value = "", p("changed");
        } catch (S) {
          k.value = X.errorMessage(S);
        } finally {
          c.value = "";
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
        e.createElementVNode("header", ga, [
          e.createElementVNode(
            "h4",
            null,
            e.toDisplayString(m.value ? R.$t("更正发言人") : R.$t("指认发言人")),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "span",
            fa,
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
            "aria-expanded": r.value,
            "data-test": "mm-speaker-toggle",
            onClick: _[0] || (_[0] = (S) => r.value = !r.value)
          }, [
            e.createTextVNode(
              e.toDisplayString(r.value ? R.$t("收起") : R.$t("展开")),
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
          ], 8, Na)) : e.createCommentVNode("v-if", !0)
        ]),
        !l.detail.my.isHost && !m.value ? (e.openBlock(), e.createElementBlock("p", Va, [
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
        r.value ? (e.openBlock(), e.createElementBlock(
          e.Fragment,
          { key: 1 },
          [
            (e.openBlock(!0), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(T.value, (S) => (e.openBlock(), e.createElementBlock("article", {
                key: S.label,
                class: e.normalizeClass(["mm-sa__row", { unknown: !S.personId }]),
                "data-test": `mm-speaker-${S.label}`
              }, [
                e.createElementVNode("div", $a, [
                  e.createElementVNode(
                    "span",
                    ba,
                    e.toDisplayString(S.label),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "small",
                    null,
                    e.toDisplayString(R.$t("{n} 段 · 约 {t}", { n: S.count, t: e.unref(Ae)(S.seconds) })),
                    1
                    /* TEXT */
                  )
                ]),
                e.createElementVNode("div", ha, [
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(S.samples, (E, M) => (e.openBlock(), e.createElementBlock(
                      "p",
                      { key: M },
                      e.toDisplayString(E),
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
                  }, null, 8, _a)) : e.createCommentVNode("v-if", !0)
                ]),
                e.createElementVNode("div", Ba, [
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn sm",
                    disabled: o.value === S.label,
                    "data-test": `mm-speaker-clip-${S.label}`,
                    onClick: (E) => A(S.label)
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
                      e.toDisplayString(R.$t("试听")),
                      1
                      /* TEXT */
                    )
                  ], 8, Sa),
                  S.personId && i.value !== S.label ? (e.openBlock(), e.createElementBlock(
                    e.Fragment,
                    { key: 0 },
                    [
                      e.createElementVNode("span", Da, [
                        e.createTextVNode(
                          e.toDisplayString(N(S.personId)),
                          1
                          /* TEXT */
                        ),
                        S.matchedBy === "voiceprint" && S.score != null ? (e.openBlock(), e.createElementBlock(
                          e.Fragment,
                          { key: 0 },
                          [
                            e.createTextVNode(
                              " · " + e.toDisplayString(R.$t("声纹 {p}", { p: S.score.toFixed(2) })),
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
                        onClick: (E) => D(S.label, S.personId)
                      }, e.toDisplayString(R.$t("更正")), 9, wa)) : e.createCommentVNode("v-if", !0)
                    ],
                    64
                    /* STABLE_FRAGMENT */
                  )) : l.detail.my.isHost && g.value ? (e.openBlock(), e.createElementBlock(
                    e.Fragment,
                    { key: 1 },
                    [
                      e.createVNode(Oe, {
                        "model-value": s[S.label] || "",
                        "onUpdate:modelValue": (E) => s[S.label] = E,
                        class: "mm-sa__select",
                        people: h.value,
                        pinned: b.value.attendeeIds,
                        "pinned-label": R.$t("本场参会人"),
                        names: l.detail.names,
                        hint: (E) => j(E, S.label) ? R.$t("（已指认给 {l}）", { l: j(E, S.label) }) : "",
                        "aria-label": R.$t("选择发言人…"),
                        "data-test": `mm-speaker-pick-${S.label}`
                      }, null, 8, ["model-value", "onUpdate:modelValue", "people", "pinned", "pinned-label", "names", "hint", "aria-label", "data-test"]),
                      e.createElementVNode("button", {
                        type: "button",
                        class: "ss-btn sm primary",
                        disabled: !s[S.label] || c.value === S.label,
                        "data-test": `mm-speaker-save-${S.label}`,
                        onClick: (E) => P(S.label)
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
                          e.toDisplayString(R.$t("确认")),
                          1
                          /* TEXT */
                        )
                      ], 8, Ca),
                      i.value === S.label ? (e.openBlock(), e.createElementBlock(
                        "button",
                        {
                          key: 0,
                          type: "button",
                          class: "ss-link",
                          onClick: _[1] || (_[1] = (E) => i.value = "")
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
                    Ta,
                    e.toDisplayString(R.$t("未识别")),
                    1
                    /* TEXT */
                  ))
                ])
              ], 10, Ea))),
              128
              /* KEYED_FRAGMENT */
            )),
            k.value ? (e.openBlock(), e.createElementBlock("p", Ia, [
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
              Ma,
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
}), ja = /* @__PURE__ */ ae(Aa, [["__scopeId", "data-v-a6aa3aa3"]]), La = {
  class: "mm-side",
  "data-test": "mm-decisions"
}, za = ["disabled"], Fa = ["disabled"], Pa = {
  key: 0,
  class: "ss-muted"
}, Ua = {
  key: 1,
  class: "mm-decisions"
}, Oa = { class: "mm-summary" }, Ra = {
  key: 3,
  class: "ss-muted"
}, qa = {
  key: 4,
  class: "ss-muted"
}, Ka = {
  key: 5,
  class: "ss-muted"
}, Ha = {
  key: 1,
  class: "mm-mde",
  "data-test": "mm-minutes-editor"
}, Wa = { class: "mm-mde__no" }, Ga = ["onUpdate:modelValue", "aria-label", "data-test"], Ya = ["aria-label", "onClick"], Ja = ["onUpdate:modelValue", "aria-label", "data-test"], Qa = { class: "ss-actions" }, Za = ["disabled"], Xa = ["disabled"], xa = {
  key: 2,
  class: "ss-note"
}, es = {
  key: 3,
  class: "ss-note danger"
}, ts = /* @__PURE__ */ e.defineComponent({
  __name: "MinutesDraftSide",
  props: {
    detail: {}
  },
  emits: ["changed"],
  setup(l, { emit: v }) {
    const n = l, p = v, y = e.computed(() => n.detail.meeting), s = e.computed(() => !["finalized", "ended", "pending_owner", "plan_confirm", "dispatched"].includes(y.value.status)), o = e.computed(() => n.detail.my.isHost && ["pending_assign", "pending_confirm", "pending_review"].includes(y.value.status)), c = e.computed(() => n.detail.my.isHost && !s.value && n.detail.projectStatus !== "archived"), i = e.ref(!1), k = e.ref(""), b = e.ref(""), m = e.ref("");
    let r = 0;
    const g = e.reactive({ decisions: [], summary: ["", "", ""] });
    function h() {
      g.decisions = y.value.decisions.map((U) => ({ key: ++r, id: U.id, text: U.text })), g.summary = [0, 1, 2].map((U) => y.value.summaryLines[U] || ""), b.value = "", m.value = "", i.value = !0;
    }
    function a() {
      g.decisions.push({ key: ++r, text: "" });
    }
    async function N() {
      k.value = "save", b.value = "";
      try {
        await J("meeting.minutes.save", {
          id: y.value.id,
          decisions: g.decisions.map((U) => ({ ...U.id ? { id: U.id } : {}, text: U.text })),
          summaryLines: g.summary.map((U) => U.trim()).filter(Boolean)
        }), i.value = !1, p("changed");
      } catch (U) {
        b.value = X.errorMessage(U);
      } finally {
        k.value = "";
      }
    }
    async function T() {
      if (window.confirm(t.t("按现在的发言人和文字重新整理议题、决议和摘要？会覆盖现在的内容（包括你手改过的）。"))) {
        k.value = "ai", b.value = "", m.value = "";
        try {
          const U = await J("meeting.minutes.reorganize", { id: y.value.id });
          m.value = U?.note || t.t("已重新整理"), p("changed");
        } catch (U) {
          b.value = X.errorMessage(U);
        } finally {
          k.value = "";
        }
      }
    }
    return (U, j) => (e.openBlock(), e.createElementBlock("section", La, [
      e.createElementVNode("h5", null, [
        e.createTextVNode(
          e.toDisplayString(U.$t("AI 识别的决议事项")) + " ",
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
              onClick: h
            }, [
              j[1] || (j[1] = e.createElementVNode(
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
            ], 8, za),
            o.value ? (e.openBlock(), e.createElementBlock("button", {
              key: 0,
              type: "button",
              class: "ss-link",
              disabled: !!k.value || !y.value.segments.length,
              "data-test": "mm-minutes-reorganize",
              onClick: T
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
            ], 8, Fa)) : e.createCommentVNode("v-if", !0)
          ],
          64
          /* STABLE_FRAGMENT */
        )) : e.createCommentVNode("v-if", !0)
      ]),
      i.value ? (e.openBlock(), e.createElementBlock("div", Ha, [
        (e.openBlock(!0), e.createElementBlock(
          e.Fragment,
          null,
          e.renderList(g.decisions, (D, A) => (e.openBlock(), e.createElementBlock("div", {
            key: D.key,
            class: "mm-mde__row"
          }, [
            e.createElementVNode(
              "span",
              Wa,
              e.toDisplayString(A + 1),
              1
              /* TEXT */
            ),
            e.withDirectives(e.createElementVNode("textarea", {
              "onUpdate:modelValue": (P) => D.text = P,
              rows: "2",
              "aria-label": U.$t("决议 {n}", { n: A + 1 }),
              "data-test": `mm-decision-input-${A}`
            }, null, 8, Ga), [
              [e.vModelText, D.text]
            ]),
            e.createElementVNode("button", {
              type: "button",
              class: "mm-mde__del",
              "aria-label": U.$t("删除这条决议"),
              onClick: (P) => g.decisions.splice(A, 1)
            }, [...j[3] || (j[3] = [
              e.createElementVNode(
                "i",
                { class: "ri-close-line" },
                null,
                -1
                /* CACHED */
              )
            ])], 8, Ya)
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
          e.renderList(g.summary, (D, A) => e.withDirectives((e.openBlock(), e.createElementBlock("input", {
            key: A,
            "onUpdate:modelValue": (P) => g.summary[A] = P,
            type: "text",
            maxlength: "200",
            "aria-label": U.$t("摘要第 {n} 行", { n: A + 1 }),
            "data-test": `mm-summary-input-${A}`
          }, null, 8, Ja)), [
            [e.vModelText, g.summary[A]]
          ])),
          128
          /* KEYED_FRAGMENT */
        )),
        e.createElementVNode("div", Qa, [
          e.createElementVNode("button", {
            type: "button",
            class: "ss-btn sm primary",
            disabled: !!k.value,
            "data-test": "mm-minutes-save",
            onClick: N
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
          ], 8, Za),
          e.createElementVNode("button", {
            type: "button",
            class: "ss-link",
            disabled: !!k.value,
            onClick: j[0] || (j[0] = (D) => i.value = !1)
          }, e.toDisplayString(U.$t("取消")), 9, Xa)
        ])
      ])) : (e.openBlock(), e.createElementBlock(
        e.Fragment,
        { key: 0 },
        [
          y.value.decisions.length ? (e.openBlock(), e.createElementBlock("ol", Ua, [
            (e.openBlock(!0), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(y.value.decisions, (D, A) => (e.openBlock(), e.createElementBlock("li", {
                key: D.id
              }, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(A + 1),
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
            Pa,
            e.toDisplayString(s.value ? U.$t("处理完成后在这里列出会上形成的决议") : U.$t("没有识别到决议事项")),
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
                e.toDisplayString(s.value ? U.$t("纪要摘要（草稿）") : U.$t("纪要摘要")),
                1
                /* TEXT */
              ),
              e.createElementVNode("ul", Oa, [
                (e.openBlock(!0), e.createElementBlock(
                  e.Fragment,
                  null,
                  e.renderList(y.value.summaryLines, (D, A) => (e.openBlock(), e.createElementBlock(
                    "li",
                    { key: A },
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
          o.value ? (e.openBlock(), e.createElementBlock(
            "small",
            Ra,
            e.toDisplayString(U.$t("AI 初稿，定稿前请核对：决议会拆成任务，摘要会进纪要通知。发言人改过后可「AI 重新整理」。")),
            1
            /* TEXT */
          )) : s.value ? (e.openBlock(), e.createElementBlock(
            "small",
            qa,
            e.toDisplayString(U.$t("终审通过后可选择「生成任务」或「无需生成任务」")),
            1
            /* TEXT */
          )) : c.value ? (e.openBlock(), e.createElementBlock(
            "small",
            Ka,
            e.toDisplayString(U.$t("纪要已定稿：发现错字可以编辑修正，已拆出的任务不跟着变。")),
            1
            /* TEXT */
          )) : e.createCommentVNode("v-if", !0)
        ],
        64
        /* STABLE_FRAGMENT */
      )),
      m.value ? (e.openBlock(), e.createElementBlock("p", xa, [
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
      b.value ? (e.openBlock(), e.createElementBlock("p", es, [
        j[6] || (j[6] = e.createElementVNode(
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
}), ls = /* @__PURE__ */ ae(ts, [["__scopeId", "data-v-6868f958"]]), ns = ["data-test"], os = ["disabled", "data-test"], as = {
  key: 0,
  class: "ss-note danger"
}, ss = /* @__PURE__ */ e.defineComponent({
  __name: "SegmentSpeakerPicker",
  props: {
    detail: {},
    segmentId: {}
  },
  emits: ["done"],
  setup(l, { emit: v }) {
    const n = l, p = v, y = e.computed(() => n.detail.meeting), s = e.computed(() => y.value.segments.find((a) => a.id === n.segmentId)?.speakerLabel || ""), o = e.ref(`label:${s.value}`), c = e.ref(!1), i = e.ref(""), k = e.ref({ depts: [], people: [] }), b = e.computed(() => y.value.speakers.map((a) => ({
      value: `label:${a.label}`,
      label: a.personId ? `${xe(n.detail, a.label)}（${a.label}）` : a.label,
      sub: a.personId && n.detail.names[a.personId]?.deptName || ""
    }))), m = e.computed(() => y.value.speakers.map((a) => a.personId).filter(Boolean)), r = e.computed({
      get: () => o.value.startsWith("person:") ? o.value.slice(7) : o.value,
      set: (a) => {
        o.value = a ? a.startsWith("label:") ? a : `person:${a}` : "";
      }
    }), g = e.computed(() => o.value && o.value !== `label:${s.value}`);
    async function h() {
      if (!g.value || c.value) return;
      const [a, N] = [o.value.slice(0, o.value.indexOf(":")), o.value.slice(o.value.indexOf(":") + 1)];
      c.value = !0, i.value = "";
      try {
        await J("meeting.segment.speaker", { id: y.value.id, segmentId: n.segmentId, ...a === "label" ? { label: N } : { personId: N } }), p("done", !0);
      } catch (T) {
        i.value = X.errorMessage(T);
      } finally {
        c.value = !1;
      }
    }
    return e.onMounted(async () => {
      try {
        k.value = await De();
      } catch (a) {
        i.value = X.errorMessage(a);
      }
    }), (a, N) => (e.openBlock(), e.createElementBlock("div", {
      class: "mm-ssp",
      "data-test": `mm-seg-speaker-${l.segmentId}`
    }, [
      e.createVNode(Oe, {
        modelValue: r.value,
        "onUpdate:modelValue": N[0] || (N[0] = (T) => r.value = T),
        class: "mm-ssp__select",
        people: k.value,
        extras: b.value,
        "extras-label": a.$t("本场发言人"),
        exclude: m.value,
        "aria-label": a.$t("这段的发言人"),
        "data-test": `mm-seg-speaker-pick-${l.segmentId}`
      }, null, 8, ["modelValue", "people", "extras", "extras-label", "exclude", "aria-label", "data-test"]),
      e.createElementVNode("button", {
        type: "button",
        class: "ss-btn sm primary",
        disabled: c.value || !g.value,
        "data-test": `mm-seg-speaker-save-${l.segmentId}`,
        onClick: h
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
      ], 8, os),
      e.createElementVNode(
        "button",
        {
          type: "button",
          class: "ss-link",
          onClick: N[1] || (N[1] = (T) => p("done", !1))
        },
        e.toDisplayString(a.$t("取消")),
        1
        /* TEXT */
      ),
      i.value ? (e.openBlock(), e.createElementBlock("p", as, [
        N[2] || (N[2] = e.createElementVNode(
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
    ], 8, ns));
  }
}), ht = /* @__PURE__ */ ae(ss, [["__scopeId", "data-v-da87433b"]]), rs = {
  class: "mm-min",
  "data-test": "mm-minutes"
}, is = { class: "mm-min__bar" }, cs = {
  class: "mm-seg-switch",
  role: "tablist"
}, ds = ["aria-selected"], ms = ["aria-selected"], us = { class: "ss-muted" }, ps = {
  key: 0,
  class: "mm-min__empty"
}, vs = ["data-test"], ks = ["aria-expanded", "onClick"], ys = {
  key: 0,
  class: "mm-topic__body"
}, gs = { class: "mm-seg__body" }, fs = { class: "mm-seg__who" }, Ns = { class: "mm-seg__name" }, Vs = ["title", "data-test", "onClick"], Es = { key: 1 }, $s = {
  key: 2,
  class: "mm-mini brand"
}, bs = ["title"], hs = ["title"], _s = ["data-test"], Bs = { class: "ss-actions" }, Ss = ["disabled", "data-test", "onClick"], Ds = {
  key: 2,
  class: "mm-seg__text"
}, ws = {
  key: 3,
  class: "mm-seg__return"
}, Cs = ["placeholder", "data-test"], Ts = ["disabled", "data-test", "onClick"], Is = {
  key: 0,
  class: "mm-seg__ops"
}, Ms = ["data-test", "onClick"], As = ["data-test", "onClick"], js = ["data-test", "onClick"], Ls = { class: "mm-timeline" }, zs = { class: "mm-seg__body" }, Fs = { class: "mm-seg__who" }, Ps = { class: "mm-seg__name" }, Us = ["title", "data-test", "onClick"], Os = { key: 1 }, Rs = {
  key: 2,
  class: "mm-mini brand"
}, qs = ["title"], Ks = ["title"], Hs = { class: "ss-actions" }, Ws = ["disabled", "onClick"], Gs = {
  key: 2,
  class: "mm-seg__text"
}, Ys = {
  key: 3,
  class: "mm-seg__return"
}, Js = ["placeholder"], Qs = ["disabled", "onClick"], Zs = {
  key: 0,
  class: "mm-seg__ops"
}, Xs = ["data-test", "onClick"], xs = ["onClick"], er = ["onClick"], tr = {
  key: 3,
  class: "ss-note danger"
}, lr = /* @__PURE__ */ e.defineComponent({
  __name: "MinutesPanel",
  props: {
    detail: {},
    anchor: {},
    anchorSeq: {}
  },
  emits: ["changed"],
  setup(l, { emit: v }) {
    const n = l, p = v, y = e.ref("topic"), s = e.ref(/* @__PURE__ */ new Set()), o = e.ref(""), c = e.ref(""), i = e.ref(""), k = e.ref(""), b = e.ref(""), m = e.ref(!1), r = e.ref(""), g = e.computed(() => n.detail.meeting), h = e.computed(() => oe.value?.me?.person?.id), a = e.computed(() => new Map(g.value.segments.map((O) => [O.id, O]))), N = e.computed(() => yl(n.detail)), T = e.computed(() => [...g.value.segments].sort((O, C) => O.start - C.start)), U = e.computed(() => g.value.confirmations.find((O) => O.personId === h.value)), j = e.computed(() => g.value.status === "pending_review" && n.detail.my.isHost), D = e.computed(() => n.detail.my.isHost && ["pending_assign", "pending_confirm", "pending_review"].includes(g.value.status)), A = ["finalized", "ended", "pending_owner", "plan_confirm", "dispatched"], P = e.computed(() => A.includes(g.value.status)), R = e.computed(() => P.value && n.detail.my.isHost && n.detail.projectStatus !== "archived"), _ = e.computed(() => g.value.files.some((O) => O.kind === "audio" || O.kind === "video")), S = e.computed(() => {
      const O = (g.value.topics || []).length, C = O ? t.t("AI 整理 · {n} 个议题", { n: O }) : t.t("AI 整理");
      return j.value ? `${C} · ${t.t("悬停段落可修改、退回或改发言人")}` : g.value.status === "pending_confirm" && n.detail.my.isHost ? `${C} · ${t.t("悬停段落可补全文字或改发言人")}` : g.value.status === "pending_confirm" && U.value ? `${C} · ${t.t("悬停本人发言可补全或修改")}` : D.value ? `${C} · ${t.t("发言人认错了：悬停段落可改发言人")}` : R.value ? `${C} · ${t.t("纪要已定稿；发现错字可悬停段落修改")}` : P.value ? `${C} · ${t.t("纪要已定稿")}` : C;
    });
    function E(O) {
      return a.value.get(O)?.speakerLabel || "";
    }
    function M(O) {
      return xe(n.detail, E(O));
    }
    function I(O) {
      return kl(n.detail, E(O), h.value);
    }
    function H(O) {
      return j.value || R.value ? !0 : g.value.status !== "pending_confirm" || n.detail.projectStatus === "archived" ? !1 : n.detail.my.isHost || I(O);
    }
    function f(O) {
      if (!j.value) return !1;
      const C = Le(g.value, E(O));
      return !!C && g.value.confirmations.some((F) => F.personId === C);
    }
    function d(O) {
      return {
        class: ["mm-seg", { own: I(O), hoverable: H(O) || f(O) || D.value, hl: n.anchor === O, editing: o.value === O || i.value === O || b.value === O }],
        "data-seg": O,
        "data-test": `mm-seg-${O}`
      };
    }
    function u(O) {
      return s.value.has(O);
    }
    function z(O) {
      const C = new Set(s.value);
      C.has(O) ? C.delete(O) : C.add(O), s.value = C;
    }
    e.watch(() => N.value.map((O) => O.id).join("|"), () => {
      const O = N.value[0]?.id, C = new Set([...s.value].filter((F) => N.value.some((x) => x.id === F)));
      !C.size && O && C.add(O), s.value = C;
    }, { immediate: !0 }), e.watch(() => [n.anchor, n.anchorSeq], async () => {
      const O = n.anchor;
      if (!O || !a.value.has(O)) return;
      const C = N.value.find((Z) => Z.segmentIds.includes(O));
      C && !s.value.has(C.id) && (s.value = /* @__PURE__ */ new Set([...s.value, C.id])), await e.nextTick();
      const F = typeof CSS < "u" && typeof CSS.escape == "function" ? CSS.escape(O) : O.replace(/["\\]/g, "\\$&");
      document.querySelector(`[data-seg="${F}"]`)?.scrollIntoView?.({ block: "center", behavior: "smooth" });
    }, { immediate: !0 });
    const Q = e.ref(""), te = e.ref(""), K = /* @__PURE__ */ new Map();
    let G = null;
    function ee(O) {
      return te.value === O ? "ri-loader-4-line spin" : Q.value === O ? "ri-pause-fill" : "ri-play-fill";
    }
    async function ne(O) {
      if (Q.value === O && G) {
        G.pause(), Q.value = "";
        return;
      }
      G?.pause(), Q.value = "", te.value = O, r.value = "";
      try {
        let C = K.get(O);
        if (!C) {
          if (C = (await J("meeting.segment.audio", { id: g.value.id, segmentId: O }))?.dataUrl || "", !C) throw new Error(t.t("这段没有可播放的原声"));
          K.size >= 30 && K.delete(K.keys().next().value), K.set(O, C);
        }
        G || (G = new Audio(), G.onended = () => {
          Q.value = "";
        }), G.src = C, await G.play(), Q.value = O;
      } catch (C) {
        r.value = X.errorMessage(C);
      } finally {
        te.value = "";
      }
    }
    e.onBeforeUnmount(() => {
      G?.pause(), G = null;
    });
    function V(O) {
      o.value = "", i.value = "", b.value = O;
    }
    function $(O) {
      b.value = "", O && p("changed");
    }
    function B(O) {
      b.value = "", i.value = "", o.value = O, c.value = a.value.get(O)?.text || "";
    }
    function w(O) {
      o.value = "", b.value = "", i.value = O, k.value = "";
    }
    async function q(O) {
      const C = c.value.trim();
      if (!(!C || m.value)) {
        m.value = !0, r.value = "";
        try {
          await J("meeting.segment.edit", { id: g.value.id, segmentId: O, text: C }), o.value = "", p("changed");
        } catch (F) {
          r.value = X.errorMessage(F);
        } finally {
          m.value = !1;
        }
      }
    }
    async function Y(O) {
      const C = Le(g.value, E(O));
      if (!C || m.value) return;
      const F = n.detail.names[C]?.name || "";
      if (window.confirm(t.t("把这段退回给 {name} 重新确认？只有 {name} 需要重新确认。", { name: F }))) {
        m.value = !0, r.value = "";
        try {
          await J("meeting.review.return", { id: g.value.id, personId: C, note: k.value.trim() }), i.value = "", p("changed");
        } catch (x) {
          r.value = X.errorMessage(x);
        } finally {
          m.value = !1;
        }
      }
    }
    return (O, C) => (e.openBlock(), e.createElementBlock("section", rs, [
      e.createElementVNode("div", is, [
        e.createElementVNode("div", cs, [
          e.createElementVNode("button", {
            type: "button",
            role: "tab",
            class: e.normalizeClass({ on: y.value === "topic" }),
            "aria-selected": y.value === "topic",
            "data-test": "mm-minutes-topic",
            onClick: C[0] || (C[0] = (F) => y.value = "topic")
          }, e.toDisplayString(O.$t("按议题")), 11, ds),
          e.createElementVNode("button", {
            type: "button",
            role: "tab",
            class: e.normalizeClass({ on: y.value === "timeline" }),
            "aria-selected": y.value === "timeline",
            "data-test": "mm-minutes-timeline",
            onClick: C[1] || (C[1] = (F) => y.value = "timeline")
          }, e.toDisplayString(O.$t("按时间线")), 11, ms)
        ]),
        e.createElementVNode(
          "span",
          us,
          e.toDisplayString(S.value),
          1
          /* TEXT */
        )
      ]),
      g.value.segments.length ? y.value === "topic" ? (e.openBlock(), e.createElementBlock(
        e.Fragment,
        { key: 1 },
        [
          e.createCommentVNode(" 按议题 "),
          (e.openBlock(!0), e.createElementBlock(
            e.Fragment,
            null,
            e.renderList(N.value, (F, x) => (e.openBlock(), e.createElementBlock("div", {
              key: F.id,
              class: e.normalizeClass(["mm-topic", { open: u(F.id) }]),
              "data-test": `mm-topic-${F.id}`
            }, [
              e.createElementVNode("button", {
                type: "button",
                class: "mm-topic__head",
                "aria-expanded": u(F.id),
                onClick: (Z) => z(F.id)
              }, [
                e.createElementVNode(
                  "i",
                  {
                    class: e.normalizeClass(u(F.id) ? "ri-arrow-down-s-line" : "ri-arrow-right-s-line")
                  },
                  null,
                  2
                  /* CLASS */
                ),
                e.createElementVNode(
                  "strong",
                  null,
                  e.toDisplayString(F.id === "__rest" ? F.title : O.$t("议题{n} · {title}", { n: e.unref(ul)(x), title: F.title })),
                  1
                  /* TEXT */
                ),
                e.createElementVNode("small", null, [
                  e.createTextVNode(
                    e.toDisplayString(O.$t("{n} 段", { n: F.segmentIds.length })),
                    1
                    /* TEXT */
                  ),
                  !u(F.id) && F.speakers.length ? (e.openBlock(), e.createElementBlock(
                    e.Fragment,
                    { key: 0 },
                    [
                      e.createTextVNode(
                        " · " + e.toDisplayString(F.speakers.join(e.unref(t.listSeparator)())),
                        1
                        /* TEXT */
                      )
                    ],
                    64
                    /* STABLE_FRAGMENT */
                  )) : e.createCommentVNode("v-if", !0)
                ])
              ], 8, ks),
              u(F.id) ? (e.openBlock(), e.createElementBlock("div", ys, [
                (e.openBlock(!0), e.createElementBlock(
                  e.Fragment,
                  null,
                  e.renderList(F.segmentIds, (Z) => (e.openBlock(), e.createElementBlock(
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
                          e.createElementVNode("div", gs, [
                            e.createElementVNode("div", fs, [
                              e.createElementVNode(
                                "span",
                                Ns,
                                e.toDisplayString(M(Z)),
                                1
                                /* TEXT */
                              ),
                              _.value ? (e.openBlock(), e.createElementBlock("button", {
                                key: 0,
                                type: "button",
                                class: e.normalizeClass(["mm-play", { on: Q.value === Z }]),
                                title: Q.value === Z ? O.$t("暂停") : O.$t("播放这段原声"),
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
                              ], 10, Vs)) : (e.openBlock(), e.createElementBlock(
                                "time",
                                Es,
                                e.toDisplayString(e.unref(Ae)(a.value.get(Z).start)),
                                1
                                /* TEXT */
                              )),
                              I(Z) ? (e.openBlock(), e.createElementBlock(
                                "span",
                                $s,
                                e.toDisplayString(O.$t("本人")),
                                1
                                /* TEXT */
                              )) : e.createCommentVNode("v-if", !0),
                              a.value.get(Z).originalText !== void 0 ? (e.openBlock(), e.createElementBlock("span", {
                                key: 3,
                                class: "mm-mini",
                                title: O.$t("原文：{t}", { t: a.value.get(Z).originalText || "" })
                              }, e.toDisplayString(O.$t("已修改")), 9, bs)) : e.createCommentVNode("v-if", !0),
                              a.value.get(Z).originalSpeakerLabel !== void 0 ? (e.openBlock(), e.createElementBlock("span", {
                                key: 4,
                                class: "mm-mini",
                                title: O.$t("识别时是 {l}", { l: a.value.get(Z).originalSpeakerLabel })
                              }, e.toDisplayString(O.$t("已改发言人")), 9, hs)) : e.createCommentVNode("v-if", !0)
                            ]),
                            b.value === Z ? (e.openBlock(), e.createBlock(ht, {
                              key: 0,
                              detail: l.detail,
                              "segment-id": Z,
                              onDone: $
                            }, null, 8, ["detail", "segment-id"])) : e.createCommentVNode("v-if", !0),
                            o.value === Z ? (e.openBlock(), e.createElementBlock(
                              e.Fragment,
                              { key: 1 },
                              [
                                e.withDirectives(e.createElementVNode("textarea", {
                                  "onUpdate:modelValue": C[2] || (C[2] = (se) => c.value = se),
                                  class: "mm-seg__edit",
                                  rows: "3",
                                  "data-test": `mm-seg-edit-${Z}`
                                }, null, 8, _s), [
                                  [e.vModelText, c.value]
                                ]),
                                e.createElementVNode("div", Bs, [
                                  e.createElementVNode("button", {
                                    type: "button",
                                    class: "ss-btn sm primary",
                                    disabled: m.value || !c.value.trim(),
                                    "data-test": `mm-seg-save-${Z}`,
                                    onClick: (se) => q(Z)
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
                                      e.toDisplayString(O.$t("保存")),
                                      1
                                      /* TEXT */
                                    )
                                  ], 8, Ss),
                                  e.createElementVNode(
                                    "button",
                                    {
                                      type: "button",
                                      class: "ss-link",
                                      onClick: C[3] || (C[3] = (se) => o.value = "")
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
                              Ds,
                              e.toDisplayString(a.value.get(Z).text),
                              1
                              /* TEXT */
                            )),
                            i.value === Z ? (e.openBlock(), e.createElementBlock("div", ws, [
                              e.withDirectives(e.createElementVNode("input", {
                                "onUpdate:modelValue": C[4] || (C[4] = (se) => k.value = se),
                                type: "text",
                                placeholder: O.$t("退回原因（发言人会看到），例如：这段数字需要核实"),
                                "data-test": `mm-seg-return-note-${Z}`
                              }, null, 8, Cs), [
                                [e.vModelText, k.value]
                              ]),
                              e.createElementVNode("button", {
                                type: "button",
                                class: "ss-btn sm danger",
                                disabled: m.value,
                                "data-test": `mm-seg-return-ok-${Z}`,
                                onClick: (se) => Y(Z)
                              }, e.toDisplayString(O.$t("确认退回")), 9, Ts),
                              e.createElementVNode(
                                "button",
                                {
                                  type: "button",
                                  class: "ss-link",
                                  onClick: C[5] || (C[5] = (se) => i.value = "")
                                },
                                e.toDisplayString(O.$t("取消")),
                                1
                                /* TEXT */
                              )
                            ])) : e.createCommentVNode("v-if", !0)
                          ]),
                          o.value !== Z && i.value !== Z && b.value !== Z && (H(Z) || f(Z) || D.value) ? (e.openBlock(), e.createElementBlock("div", Is, [
                            D.value ? (e.openBlock(), e.createElementBlock("button", {
                              key: 0,
                              type: "button",
                              class: "mm-op",
                              "data-test": `mm-seg-move-${Z}`,
                              onClick: (se) => V(Z)
                            }, [
                              C[10] || (C[10] = e.createElementVNode(
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
                            ], 8, Ms)) : e.createCommentVNode("v-if", !0),
                            H(Z) ? (e.openBlock(), e.createElementBlock("button", {
                              key: 1,
                              type: "button",
                              class: "mm-op",
                              "data-test": `mm-seg-modify-${Z}`,
                              onClick: (se) => B(Z)
                            }, [
                              C[11] || (C[11] = e.createElementVNode(
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
                            ], 8, As)) : e.createCommentVNode("v-if", !0),
                            f(Z) ? (e.openBlock(), e.createElementBlock("button", {
                              key: 2,
                              type: "button",
                              class: "mm-op danger",
                              "data-test": `mm-seg-return-${Z}`,
                              onClick: (se) => w(Z)
                            }, e.toDisplayString(O.$t("退回给发言人")), 9, js)) : e.createCommentVNode("v-if", !0)
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
            ], 10, vs))),
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
          e.createElementVNode("div", Ls, [
            (e.openBlock(!0), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(T.value, (F) => (e.openBlock(), e.createElementBlock(
                "div",
                e.mergeProps({
                  key: F.id
                }, { ref_for: !0 }, d(F.id)),
                [
                  e.createElementVNode(
                    "span",
                    {
                      class: "mm-av",
                      style: e.normalizeStyle({ background: e.unref(re)(M(F.id)).color })
                    },
                    e.toDisplayString(e.unref(re)(M(F.id)).text),
                    5
                    /* TEXT, STYLE */
                  ),
                  e.createElementVNode("div", zs, [
                    e.createElementVNode("div", Fs, [
                      e.createElementVNode(
                        "span",
                        Ps,
                        e.toDisplayString(M(F.id)),
                        1
                        /* TEXT */
                      ),
                      _.value ? (e.openBlock(), e.createElementBlock("button", {
                        key: 0,
                        type: "button",
                        class: e.normalizeClass(["mm-play", { on: Q.value === F.id }]),
                        title: Q.value === F.id ? O.$t("暂停") : O.$t("播放这段原声"),
                        "data-test": `mm-seg-play-${F.id}`,
                        onClick: (x) => ne(F.id)
                      }, [
                        e.createElementVNode(
                          "i",
                          {
                            class: e.normalizeClass(ee(F.id))
                          },
                          null,
                          2
                          /* CLASS */
                        ),
                        e.createElementVNode(
                          "time",
                          null,
                          e.toDisplayString(e.unref(Ae)(F.start)),
                          1
                          /* TEXT */
                        )
                      ], 10, Us)) : (e.openBlock(), e.createElementBlock(
                        "time",
                        Os,
                        e.toDisplayString(e.unref(Ae)(F.start)),
                        1
                        /* TEXT */
                      )),
                      I(F.id) ? (e.openBlock(), e.createElementBlock(
                        "span",
                        Rs,
                        e.toDisplayString(O.$t("本人")),
                        1
                        /* TEXT */
                      )) : e.createCommentVNode("v-if", !0),
                      F.originalText !== void 0 ? (e.openBlock(), e.createElementBlock("span", {
                        key: 3,
                        class: "mm-mini",
                        title: O.$t("原文：{t}", { t: F.originalText || "" })
                      }, e.toDisplayString(O.$t("已修改")), 9, qs)) : e.createCommentVNode("v-if", !0),
                      F.originalSpeakerLabel !== void 0 ? (e.openBlock(), e.createElementBlock("span", {
                        key: 4,
                        class: "mm-mini",
                        title: O.$t("识别时是 {l}", { l: F.originalSpeakerLabel })
                      }, e.toDisplayString(O.$t("已改发言人")), 9, Ks)) : e.createCommentVNode("v-if", !0)
                    ]),
                    b.value === F.id ? (e.openBlock(), e.createBlock(ht, {
                      key: 0,
                      detail: l.detail,
                      "segment-id": F.id,
                      onDone: $
                    }, null, 8, ["detail", "segment-id"])) : e.createCommentVNode("v-if", !0),
                    o.value === F.id ? (e.openBlock(), e.createElementBlock(
                      e.Fragment,
                      { key: 1 },
                      [
                        e.withDirectives(e.createElementVNode(
                          "textarea",
                          {
                            "onUpdate:modelValue": C[6] || (C[6] = (x) => c.value = x),
                            class: "mm-seg__edit",
                            rows: "3"
                          },
                          null,
                          512
                          /* NEED_PATCH */
                        ), [
                          [e.vModelText, c.value]
                        ]),
                        e.createElementVNode("div", Hs, [
                          e.createElementVNode("button", {
                            type: "button",
                            class: "ss-btn sm primary",
                            disabled: m.value || !c.value.trim(),
                            onClick: (x) => q(F.id)
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
                              e.toDisplayString(O.$t("保存")),
                              1
                              /* TEXT */
                            )
                          ], 8, Ws),
                          e.createElementVNode(
                            "button",
                            {
                              type: "button",
                              class: "ss-link",
                              onClick: C[7] || (C[7] = (x) => o.value = "")
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
                      Gs,
                      e.toDisplayString(F.text),
                      1
                      /* TEXT */
                    )),
                    i.value === F.id ? (e.openBlock(), e.createElementBlock("div", Ys, [
                      e.withDirectives(e.createElementVNode("input", {
                        "onUpdate:modelValue": C[8] || (C[8] = (x) => k.value = x),
                        type: "text",
                        placeholder: O.$t("退回原因（发言人会看到），例如：这段数字需要核实")
                      }, null, 8, Js), [
                        [e.vModelText, k.value]
                      ]),
                      e.createElementVNode("button", {
                        type: "button",
                        class: "ss-btn sm danger",
                        disabled: m.value,
                        onClick: (x) => Y(F.id)
                      }, e.toDisplayString(O.$t("确认退回")), 9, Qs),
                      e.createElementVNode(
                        "button",
                        {
                          type: "button",
                          class: "ss-link",
                          onClick: C[9] || (C[9] = (x) => i.value = "")
                        },
                        e.toDisplayString(O.$t("取消")),
                        1
                        /* TEXT */
                      )
                    ])) : e.createCommentVNode("v-if", !0)
                  ]),
                  o.value !== F.id && i.value !== F.id && b.value !== F.id && (H(F.id) || f(F.id) || D.value) ? (e.openBlock(), e.createElementBlock("div", Zs, [
                    D.value ? (e.openBlock(), e.createElementBlock("button", {
                      key: 0,
                      type: "button",
                      class: "mm-op",
                      "data-test": `mm-seg-move-${F.id}`,
                      onClick: (x) => V(F.id)
                    }, [
                      C[12] || (C[12] = e.createElementVNode(
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
                    ], 8, Xs)) : e.createCommentVNode("v-if", !0),
                    H(F.id) ? (e.openBlock(), e.createElementBlock("button", {
                      key: 1,
                      type: "button",
                      class: "mm-op",
                      onClick: (x) => B(F.id)
                    }, [
                      C[13] || (C[13] = e.createElementVNode(
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
                    ], 8, xs)) : e.createCommentVNode("v-if", !0),
                    f(F.id) ? (e.openBlock(), e.createElementBlock("button", {
                      key: 2,
                      type: "button",
                      class: "mm-op danger",
                      onClick: (x) => w(F.id)
                    }, e.toDisplayString(O.$t("退回给发言人")), 9, er)) : e.createCommentVNode("v-if", !0)
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
        ps,
        e.toDisplayString(O.$t("还没有纪要内容：上传会议文件、处理完成后在这里按议题整理")),
        1
        /* TEXT */
      )),
      r.value ? (e.openBlock(), e.createElementBlock("p", tr, [
        C[14] || (C[14] = e.createElementVNode(
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
}), nr = /* @__PURE__ */ ae(lr, [["__scopeId", "data-v-259b6ff6"]]), et = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/utils/markdown.ts"];
if (!et) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/utils/markdown.ts");
et.default;
const or = {
  class: "mm-plan",
  "data-test": "mm-plan"
}, ar = {
  key: 0,
  class: "mm-plan__empty"
}, sr = { class: "mm-plan__head" }, rr = { class: "ss-muted" }, ir = {
  key: 0,
  class: "ss-chip ok"
}, cr = {
  key: 0,
  class: "mm-plan__owner",
  "data-test": "mm-plan-owner"
}, dr = ["disabled"], mr = {
  key: 1,
  class: "ss-note"
}, ur = {
  key: 2,
  class: "ss-note"
}, pr = { class: "mm-plan__summary" }, vr = { class: "mm-plan__sumhead" }, kr = ["innerHTML"], yr = {
  key: 2,
  class: "ss-muted"
}, gr = { class: "mm-plan__sumhead" }, fr = { class: "ss-muted" }, Nr = { class: "ss-table-wrap" }, Vr = {
  key: 0,
  class: "c-del"
}, Er = { key: 0 }, $r = ["data-test"], br = { class: "num" }, hr = ["onUpdate:modelValue"], _r = { value: "" }, Br = ["value"], Sr = { key: 1 }, Dr = { class: "wrap" }, wr = ["onUpdate:modelValue", "placeholder"], Cr = { key: 1 }, Tr = {
  key: 2,
  class: "mm-plan__from"
}, Ir = { class: "wrap" }, Mr = ["onUpdate:modelValue", "placeholder"], Ar = { key: 1 }, jr = ["onUpdate:modelValue", "data-test"], Lr = { key: 1 }, zr = {
  key: 2,
  class: "mm-plan__warn"
}, Fr = { class: "mm-plan__to" }, Pr = {
  key: 0,
  class: "mm-plan__warn"
}, Ur = { key: 0 }, Or = ["title"], Rr = { key: 2 }, qr = { key: 0 }, Kr = ["title", "onClick"], Hr = { key: 0 }, Wr = ["colspan"], Gr = {
  key: 3,
  class: "mm-plan__problems"
}, Yr = {
  key: 4,
  class: "ss-actions"
}, Jr = ["disabled"], Qr = ["disabled"], Zr = ["disabled"], Xr = {
  key: 2,
  class: "ss-note danger"
}, xr = /* @__PURE__ */ e.defineComponent({
  __name: "PlanPanel",
  props: {
    detail: {}
  },
  emits: ["changed"],
  setup(l, { emit: v }) {
    const n = l, p = v, y = ie.useNotificationStore(), s = e.ref({ depts: [], people: [] }), o = e.ref([]), c = e.ref(""), i = e.ref(!1), k = e.ref(!1), b = e.ref(!1), m = e.ref([]), r = e.ref(""), g = e.ref(""), h = Ye(Date.now()), a = e.computed(() => n.detail.meeting), N = e.computed(() => a.value.plan), T = e.computed(() => a.value.status === "plan_confirm" && n.detail.my.isPlanOwner), U = e.computed(() => n.detail.my.isHost && (a.value.status === "pending_owner" || a.value.status === "plan_confirm"));
    function j(K) {
      return n.detail.names[K]?.name || s.value.people.find((G) => G.id === K)?.name || K;
    }
    function D(K) {
      return s.value.depts.find((G) => G.id === K)?.name || K || "-";
    }
    function A(K) {
      const G = s.value.depts.find((ne) => ne.id === K)?.leaderIds?.[0], ee = G ? s.value.people.find((ne) => ne.id === G) : void 0;
      return ee && !ee.left ? ee.name : "";
    }
    function P(K) {
      return K ? s.value.people.filter((G) => G.deptId === K && !G.left).map((G) => G.id) : [];
    }
    function R(K) {
      return K.assigneeId ? j(K.assigneeId) : A(K.deptId);
    }
    function _(K, G) {
      G ? K.assigneeId = G : delete K.assigneeId, i.value = !0;
    }
    function S(K) {
      return K ? a.value.decisions.findIndex((G) => G.id === K) + 1 : 0;
    }
    function E() {
      o.value = (N.value?.items || []).map((K) => ({ ...K })), c.value = N.value?.summary || "", i.value = !1, k.value = !1, b.value = !1;
    }
    e.watch(N, () => {
      i.value || E();
    }, { immediate: !0, deep: !0 });
    const M = e.computed(() => {
      const K = N.value;
      return K ? K.ownerIds?.length ? K.ownerIds : K.ownerId ? [K.ownerId] : [] : [];
    }), I = e.computed(() => M.value.map((K) => j(K)).filter(Boolean).join(t.t("、"))), H = e.computed(() => m.value.length === M.value.length && m.value.every((K) => M.value.includes(K)));
    e.watch(M, (K) => {
      m.value = [...K];
    }, { immediate: !0 });
    const f = e.computed(() => {
      const K = [];
      return o.value.length || K.push(t.t("至少保留一项任务")), o.value.forEach((G, ee) => {
        const ne = ee + 1;
        G.deptId || K.push(t.t("第 {n} 项没有选责任部门", { n: ne })), G.title.trim() || K.push(t.t("第 {n} 项没有填执行事项", { n: ne })), /^\d{4}-\d{2}-\d{2}$/.test(G.due || "") || K.push(t.t("第 {n} 项没有设完成时间", { n: ne })), G.deptId && !G.assigneeId && s.value.depts.length && !A(G.deptId) && K.push(t.t("第 {n} 项的部门没有负责人，请在「下发给」里选人", { n: ne }));
      }), K;
    });
    function d() {
      o.value.push({ id: `new-${Date.now().toString(36)}-${o.value.length}`, deptId: "", title: "", standard: "", due: "" }), i.value = !0;
    }
    function u(K) {
      o.value.splice(K, 1), i.value = !0;
    }
    async function z() {
      if (!(!m.value.length || r.value)) {
        r.value = "owner", g.value = "";
        try {
          const K = [...m.value];
          await J("meeting.plan.owner", { id: a.value.id, ownerIds: K }), y.success(t.t("已指定 {name} 为任务负责人，已通知确认方案", { name: K.map((G) => j(G)).join(t.t("、")) })), p("changed");
        } catch (K) {
          g.value = X.errorMessage(K);
        } finally {
          r.value = "";
        }
      }
    }
    async function Q(K = !1) {
      if (b.value = !0, f.value.length)
        return g.value = t.t("还有没填完的任务，先补齐再保存"), !1;
      r.value = "save", g.value = "";
      try {
        return await J("meeting.plan.save", { id: a.value.id, items: o.value.map((G) => ({ ...G, title: G.title.trim(), standard: G.standard.trim() })), summary: c.value }), i.value = !1, k.value = !1, K || y.success(t.t("方案已保存")), p("changed"), !0;
      } catch (G) {
        return g.value = X.errorMessage(G), !1;
      } finally {
        r.value = "";
      }
    }
    async function te() {
      if (b.value = !0, f.value.length) {
        g.value = t.t("还有没填完的任务，先补齐再确认");
        return;
      }
      if (window.confirm(t.t("确认后将生成 {n} 项任务，按「下发给」一栏下发，方案不能再改。确定？", { n: o.value.length })) && !(i.value && !await Q(!0))) {
        r.value = "confirm", g.value = "";
        try {
          await J("meeting.plan.confirm", { id: a.value.id }), y.success(t.t("方案已确认，任务已下发")), p("changed");
        } catch (K) {
          g.value = X.errorMessage(K);
        } finally {
          r.value = "";
        }
      }
    }
    return e.onMounted(async () => {
      try {
        s.value = await De();
      } catch (K) {
        g.value = X.errorMessage(K);
      }
    }), (K, G) => (e.openBlock(), e.createElementBlock("section", or, [
      N.value ? (e.openBlock(), e.createElementBlock(
        e.Fragment,
        { key: 1 },
        [
          e.createElementVNode("header", sr, [
            e.createElementVNode(
              "h4",
              null,
              e.toDisplayString(K.$t("AI 执行方案")),
              1
              /* TEXT */
            ),
            e.createElementVNode(
              "span",
              rr,
              e.toDisplayString(K.$t("生成于 {t}", { t: e.unref($e)(N.value.generatedAt) })),
              1
              /* TEXT */
            ),
            G[9] || (G[9] = e.createElementVNode(
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
              e.toDisplayString(M.value.length ? K.$t("任务负责人：{name}", { name: I.value }) : K.$t("还没有指定任务负责人")),
              3
              /* TEXT, CLASS */
            ),
            N.value.confirmedAt ? (e.openBlock(), e.createElementBlock(
              "span",
              ir,
              e.toDisplayString(K.$t("{t} 已确认", { t: e.unref($e)(N.value.confirmedAt) })),
              1
              /* TEXT */
            )) : e.createCommentVNode("v-if", !0)
          ]),
          e.createCommentVNode(" 主持人指定任务负责人 "),
          U.value ? (e.openBlock(), e.createElementBlock("div", cr, [
            G[10] || (G[10] = e.createElementVNode(
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
              e.toDisplayString(a.value.status === "pending_owner" ? K.$t("指定任务负责人（可多选）：其中任何一位都能确认方案，确认后按部门下发给各部门负责人") : K.$t("更换任务负责人（可多选）")),
              1
              /* TEXT */
            ),
            e.createVNode(Oe, {
              values: m.value,
              "onUpdate:values": G[0] || (G[0] = (ee) => m.value = ee),
              multiple: "",
              max: 10,
              class: "mm-plan__owner-pick",
              people: s.value,
              "aria-label": K.$t("任务负责人"),
              "data-test": "mm-plan-owner-select"
            }, null, 8, ["values", "people", "aria-label"]),
            e.createElementVNode("button", {
              type: "button",
              class: "ss-btn sm primary",
              disabled: !m.value.length || H.value || !!r.value,
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
                e.toDisplayString(K.$t("指定")),
                1
                /* TEXT */
              )
            ], 8, dr)
          ])) : a.value.status === "pending_owner" ? (e.openBlock(), e.createElementBlock("p", mr, [
            G[11] || (G[11] = e.createElementVNode(
              "i",
              { class: "ri-time-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(K.$t("等待主持人 {name} 指定任务负责人", { name: j(a.value.hostId) })),
              1
              /* TEXT */
            )
          ])) : a.value.status === "plan_confirm" && !l.detail.my.isPlanOwner ? (e.openBlock(), e.createElementBlock("p", ur, [
            G[12] || (G[12] = e.createElementVNode(
              "i",
              { class: "ri-time-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(K.$t("等待任务负责人 {name} 确认方案", { name: I.value })),
              1
              /* TEXT */
            )
          ])) : e.createCommentVNode("v-if", !0),
          e.createCommentVNode(" 方案概述 "),
          e.createElementVNode("div", pr, [
            e.createElementVNode("div", vr, [
              e.createElementVNode(
                "b",
                null,
                e.toDisplayString(K.$t("方案概述")),
                1
                /* TEXT */
              ),
              T.value && !k.value ? (e.openBlock(), e.createElementBlock(
                "button",
                {
                  key: 0,
                  type: "button",
                  class: "ss-link",
                  onClick: G[1] || (G[1] = (ee) => k.value = !0)
                },
                e.toDisplayString(K.$t("编辑")),
                1
                /* TEXT */
              )) : e.createCommentVNode("v-if", !0)
            ]),
            k.value ? e.withDirectives((e.openBlock(), e.createElementBlock(
              "textarea",
              {
                key: 0,
                "onUpdate:modelValue": G[2] || (G[2] = (ee) => c.value = ee),
                rows: "6",
                class: "mm-plan__textarea",
                onInput: G[3] || (G[3] = (ee) => i.value = !0)
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
                }, null, 8, kr)
              ],
              2112
              /* STABLE_FRAGMENT, DEV_ROOT_FRAGMENT */
            )) : (e.openBlock(), e.createElementBlock(
              "p",
              yr,
              e.toDisplayString(K.$t("（没有概述）")),
              1
              /* TEXT */
            ))
          ]),
          e.createCommentVNode(" 任务清单 "),
          e.createElementVNode("div", gr, [
            e.createElementVNode(
              "b",
              null,
              e.toDisplayString(K.$t("任务清单 · {n} 项", { n: o.value.length })),
              1
              /* TEXT */
            ),
            e.createElementVNode(
              "span",
              fr,
              e.toDisplayString(K.$t("每项一个责任部门；「下发给」默认是该部门在通讯录里的第一位负责人，可以改成任何人")),
              1
              /* TEXT */
            )
          ]),
          e.createElementVNode("div", Nr, [
            e.createElementVNode(
              "table",
              {
                class: e.normalizeClass(["ss-table mm-plan__table", { edit: T.value }])
              },
              [
                e.createElementVNode("colgroup", null, [
                  G[13] || (G[13] = e.createElementVNode(
                    "col",
                    { class: "c-no" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  G[14] || (G[14] = e.createElementVNode(
                    "col",
                    { class: "c-dept" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  G[15] || (G[15] = e.createElementVNode(
                    "col",
                    null,
                    null,
                    -1
                    /* CACHED */
                  )),
                  G[16] || (G[16] = e.createElementVNode(
                    "col",
                    null,
                    null,
                    -1
                    /* CACHED */
                  )),
                  G[17] || (G[17] = e.createElementVNode(
                    "col",
                    { class: "c-due" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  G[18] || (G[18] = e.createElementVNode(
                    "col",
                    { class: "c-to" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  T.value ? (e.openBlock(), e.createElementBlock("col", Vr)) : e.createCommentVNode("v-if", !0)
                ]),
                e.createElementVNode("thead", null, [
                  e.createElementVNode("tr", null, [
                    G[19] || (G[19] = e.createElementVNode(
                      "th",
                      null,
                      "#",
                      -1
                      /* CACHED */
                    )),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(K.$t("责任部门")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(K.$t("执行事项")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(K.$t("交付标准")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(K.$t("完成时间")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(K.$t("下发给")),
                      1
                      /* TEXT */
                    ),
                    T.value ? (e.openBlock(), e.createElementBlock("th", Er)) : e.createCommentVNode("v-if", !0)
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
                        br,
                        e.toDisplayString(ne + 1),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode("td", null, [
                        T.value ? e.withDirectives((e.openBlock(), e.createElementBlock("select", {
                          key: 0,
                          "onUpdate:modelValue": (V) => ee.deptId = V,
                          onChange: G[4] || (G[4] = (V) => i.value = !0)
                        }, [
                          e.createElementVNode(
                            "option",
                            _r,
                            e.toDisplayString(K.$t("选择部门")),
                            1
                            /* TEXT */
                          ),
                          (e.openBlock(!0), e.createElementBlock(
                            e.Fragment,
                            null,
                            e.renderList(s.value.depts, (V) => (e.openBlock(), e.createElementBlock("option", {
                              key: V.id,
                              value: V.id
                            }, e.toDisplayString(V.name), 9, Br))),
                            128
                            /* KEYED_FRAGMENT */
                          ))
                        ], 40, hr)), [
                          [e.vModelSelect, ee.deptId]
                        ]) : (e.openBlock(), e.createElementBlock(
                          "span",
                          Sr,
                          e.toDisplayString(D(ee.deptId)),
                          1
                          /* TEXT */
                        ))
                      ]),
                      e.createElementVNode("td", Dr, [
                        T.value ? e.withDirectives((e.openBlock(), e.createElementBlock("input", {
                          key: 0,
                          "onUpdate:modelValue": (V) => ee.title = V,
                          type: "text",
                          class: "wide",
                          placeholder: K.$t("执行事项"),
                          onInput: G[5] || (G[5] = (V) => i.value = !0)
                        }, null, 40, wr)), [
                          [e.vModelText, ee.title]
                        ]) : (e.openBlock(), e.createElementBlock(
                          "span",
                          Cr,
                          e.toDisplayString(ee.title),
                          1
                          /* TEXT */
                        )),
                        S(ee.decisionId) ? (e.openBlock(), e.createElementBlock(
                          "small",
                          Tr,
                          e.toDisplayString(K.$t("来自决议 {n}", { n: S(ee.decisionId) })),
                          1
                          /* TEXT */
                        )) : e.createCommentVNode("v-if", !0)
                      ]),
                      e.createElementVNode("td", Ir, [
                        T.value ? e.withDirectives((e.openBlock(), e.createElementBlock("input", {
                          key: 0,
                          "onUpdate:modelValue": (V) => ee.standard = V,
                          type: "text",
                          class: "wide",
                          placeholder: K.$t("交付标准"),
                          onInput: G[6] || (G[6] = (V) => i.value = !0)
                        }, null, 40, Mr)), [
                          [e.vModelText, ee.standard]
                        ]) : (e.openBlock(), e.createElementBlock(
                          "span",
                          Ar,
                          e.toDisplayString(ee.standard || "-"),
                          1
                          /* TEXT */
                        ))
                      ]),
                      e.createElementVNode("td", null, [
                        T.value ? e.withDirectives((e.openBlock(), e.createElementBlock("input", {
                          key: 0,
                          "onUpdate:modelValue": (V) => ee.due = V,
                          type: "date",
                          "data-test": `mm-plan-due-${ne}`,
                          onChange: G[7] || (G[7] = (V) => i.value = !0)
                        }, null, 40, jr)), [
                          [e.vModelText, ee.due]
                        ]) : (e.openBlock(), e.createElementBlock(
                          "span",
                          Lr,
                          e.toDisplayString(ee.due || "-"),
                          1
                          /* TEXT */
                        )),
                        ee.due && ee.due < e.unref(h) ? (e.openBlock(), e.createElementBlock(
                          "small",
                          zr,
                          e.toDisplayString(K.$t("早于今天")),
                          1
                          /* TEXT */
                        )) : e.createCommentVNode("v-if", !0)
                      ]),
                      e.createElementVNode("td", Fr, [
                        T.value ? (e.openBlock(), e.createElementBlock(
                          e.Fragment,
                          { key: 0 },
                          [
                            e.createCommentVNode(" 不选 = 部门第一负责人（显示在占位里）；部门没设负责人或要交给别人时直接选人 "),
                            e.createVNode(Oe, {
                              "model-value": ee.assigneeId || "",
                              people: s.value,
                              pinned: P(ee.deptId),
                              "pinned-label": K.$t("本部门"),
                              placeholder: A(ee.deptId) ? K.$t("默认：{name}", { name: A(ee.deptId) }) : K.$t("选择下发给谁"),
                              "aria-label": K.$t("下发给"),
                              clearable: "",
                              "data-test": `mm-plan-to-${ne}`,
                              "onUpdate:modelValue": (V) => _(ee, V)
                            }, null, 8, ["model-value", "people", "pinned", "pinned-label", "placeholder", "aria-label", "data-test", "onUpdate:modelValue"]),
                            ee.deptId && !ee.assigneeId && !A(ee.deptId) && s.value.depts.length ? (e.openBlock(), e.createElementBlock(
                              "small",
                              Pr,
                              e.toDisplayString(K.$t("部门没有负责人，请选人")),
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
                              Ur,
                              e.toDisplayString(R(ee)),
                              1
                              /* TEXT */
                            )) : ee.deptId ? (e.openBlock(), e.createElementBlock("span", {
                              key: 1,
                              class: "mm-plan__warn",
                              title: K.$t("企微通讯录里这个部门没有设置负责人，确认后无法下发")
                            }, e.toDisplayString(K.$t("部门没有负责人")), 9, Or)) : (e.openBlock(), e.createElementBlock("span", Rr, "-"))
                          ],
                          64
                          /* STABLE_FRAGMENT */
                        ))
                      ]),
                      T.value ? (e.openBlock(), e.createElementBlock("td", qr, [
                        e.createElementVNode("button", {
                          type: "button",
                          class: "ss-link mm-plan__del",
                          title: K.$t("删除这项任务"),
                          onClick: (V) => u(ne)
                        }, [...G[20] || (G[20] = [
                          e.createElementVNode(
                            "i",
                            { class: "ri-delete-bin-line" },
                            null,
                            -1
                            /* CACHED */
                          )
                        ])], 8, Kr)
                      ])) : e.createCommentVNode("v-if", !0)
                    ], 8, $r))),
                    128
                    /* KEYED_FRAGMENT */
                  )),
                  o.value.length ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock("tr", Hr, [
                    e.createElementVNode("td", {
                      colspan: T.value ? 7 : 6,
                      class: "mm-plan__none"
                    }, e.toDisplayString(K.$t("AI 没有从决议里拆出任务")), 9, Wr)
                  ]))
                ])
              ],
              2
              /* CLASS */
            )
          ]),
          T.value && f.value.length && b.value ? (e.openBlock(), e.createElementBlock("ul", Gr, [
            (e.openBlock(!0), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(f.value, (ee) => (e.openBlock(), e.createElementBlock(
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
          T.value ? (e.openBlock(), e.createElementBlock("div", Yr, [
            e.createElementVNode("button", {
              type: "button",
              class: "ss-btn sm",
              "data-test": "mm-plan-add",
              onClick: d
            }, [
              G[21] || (G[21] = e.createElementVNode(
                "i",
                { class: "ri-add-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(K.$t("添加任务")),
                1
                /* TEXT */
              )
            ]),
            G[22] || (G[22] = e.createElementVNode(
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
              onClick: G[8] || (G[8] = (ee) => Q())
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
                e.toDisplayString(K.$t("保存修改")),
                1
                /* TEXT */
              )
            ], 8, Jr)) : e.createCommentVNode("v-if", !0),
            i.value ? (e.openBlock(), e.createElementBlock("button", {
              key: 1,
              type: "button",
              class: "ss-link",
              disabled: !!r.value,
              onClick: E
            }, e.toDisplayString(K.$t("放弃修改")), 9, Qr)) : e.createCommentVNode("v-if", !0),
            e.createElementVNode("button", {
              type: "button",
              class: "ss-btn primary",
              disabled: !!r.value,
              "data-test": "mm-plan-confirm",
              onClick: te
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
                e.toDisplayString(K.$t("确认方案并下发")),
                1
                /* TEXT */
              )
            ], 8, Zr)
          ])) : e.createCommentVNode("v-if", !0)
        ],
        64
        /* STABLE_FRAGMENT */
      )) : (e.openBlock(), e.createElementBlock(
        "p",
        ar,
        e.toDisplayString(K.$t("纪要定稿后，主持人选择「生成任务」，AI 会在这里按决议事项生成执行方案和任务清单。")),
        1
        /* TEXT */
      )),
      g.value ? (e.openBlock(), e.createElementBlock("p", Xr, [
        G[23] || (G[23] = e.createElementVNode(
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
}), ei = /* @__PURE__ */ ae(xr, [["__scopeId", "data-v-6067da9b"]]), ti = {
  class: "mm-dt",
  "data-test": "mm-meeting-detail"
}, li = {
  key: 0,
  class: "ss-note danger"
}, ni = {
  key: 1,
  class: "ss-note"
}, oi = {
  class: "mm-dt__sticky",
  "data-test": "mm-meeting-steps"
}, ai = { class: "mm-dt__titlerow" }, si = { class: "mm-steps" }, ri = ["data-test"], ii = {
  key: 0,
  class: "mm-dt__procline"
}, ci = { class: "mm-dt__procbar" }, di = { class: "mm-dt__info" }, mi = { key: 0 }, ui = {
  key: 0,
  class: "ss-note warn"
}, pi = { class: "mm-banner__icon" }, vi = { class: "mm-banner__text" }, ki = { key: 0 }, yi = {
  key: 0,
  class: "mm-banner__ops"
}, gi = ["disabled", "data-test", "onClick"], fi = {
  key: 0,
  class: "ri-loader-4-line spin"
}, Ni = {
  key: 2,
  class: "ss-note danger"
}, Vi = {
  class: "mm-dt__tabs",
  role: "tablist"
}, Ei = ["aria-selected", "data-test", "onClick"], $i = {
  key: 0,
  class: "mm-dt__extra"
}, bi = { class: "mm-dt__grid" }, hi = { class: "mm-dt__main" }, _i = {
  key: 0,
  class: "mm-dt__empty"
}, Bi = {
  key: 1,
  class: "ss-table-wrap"
}, Si = {
  class: "ss-table",
  "data-test": "mm-confirm-table"
}, Di = { class: "num" }, wi = ["data-test"], Ci = { class: "mm-person" }, Ti = { class: "num" }, Ii = {
  key: 0,
  class: "ss-chip ok"
}, Mi = ["title"], Ai = {
  key: 2,
  class: "ss-chip warn"
}, ji = {
  key: 3,
  class: "mm-dt__note"
}, Li = { class: "ss-muted" }, zi = {
  key: 0,
  class: "mm-dt__empty"
}, Fi = {
  key: 1,
  class: "mm-raw",
  "data-test": "mm-transcript"
}, Pi = { class: "mm-dt__sub" }, Ui = ["disabled"], Oi = ["disabled", "title"], Ri = {
  key: 0,
  class: "mm-dt__empty"
}, qi = {
  key: 1,
  class: "ss-table-wrap"
}, Ki = { class: "ss-table" }, Hi = { class: "num" }, Wi = { class: "num" }, Gi = { class: "mm-dt__sub" }, Yi = {
  key: 0,
  class: "ss-muted"
}, Ji = ["disabled"], Qi = {
  key: 2,
  class: "ss-note danger"
}, Zi = {
  key: 3,
  class: "mm-dt__empty"
}, Xi = {
  key: 4,
  class: "mm-log"
}, xi = {
  key: 0,
  class: "mm-dt__empty"
}, ec = {
  key: 1,
  class: "mm-tasks",
  "data-test": "mm-meeting-tasks"
}, tc = ["onClick"], lc = { class: "mm-tasks__main" }, nc = { class: "mm-tasks__bar" }, oc = { class: "mm-tasks__pct" }, ac = {
  key: 0,
  class: "ss-chip bad"
}, sc = { class: "mm-dt__side" }, rc = { class: "mm-side" }, ic = { key: 0 }, cc = { class: "mm-avatars" }, dc = ["title"], mc = /* @__PURE__ */ e.defineComponent({
  __name: "MeetingDetail",
  props: {
    meetingId: {},
    focus: {}
  },
  emits: ["changed", "role"],
  setup(l, { expose: v, emit: n }) {
    const p = l, y = n, s = ie.useNotificationStore(), o = e.ref(null), c = e.ref(""), i = e.ref(""), k = e.ref("minutes"), b = e.ref(""), m = e.ref(0), r = e.ref(null), g = e.ref(Date.now()), h = e.ref(0), a = e.computed(() => o.value?.meeting), N = e.computed(() => oe.value?.me?.person?.id), T = e.computed(() => oe.value?.settings?.confirmTimeoutHours ?? 24), U = e.computed(() => Xt(a.value.status)), j = e.computed(() => pt[a.value.status] || "muted"), D = e.computed(() => {
      const V = a.value.status;
      return V === "pending_confirm" && o.value?.confirm.total ? t.t("待确认 {a}/{b}", { a: o.value.confirm.done, b: o.value.confirm.total }) : Xe[V];
    }), A = e.computed(() => r.value?.stage || a.value.process?.stage || "extract"), P = e.computed(() => Math.max(0, Math.min(100, Math.round(r.value?.progress ?? a.value.process?.progress ?? 0)))), R = e.computed(() => [...a.value.segments].sort((V, $) => V.start - $.start)), _ = e.computed(() => a.value.confirmations.find((V) => V.personId === N.value)), S = e.computed(() => !!o.value?.my.isHost && o.value.projectStatus === "active" && ["pending_assign", "pending_confirm", "pending_review", "failed"].includes(a.value.status) && a.value.files.some((V) => V.kind === "audio" || V.kind === "video")), E = (V) => V && o.value?.names[V]?.name || "", M = e.computed(() => {
      const V = [...new Set(a.value.files.map(($) => $.kind))].map(($) => Vt[$]).join(" / ");
      return V ? `${ot[a.value.source]} ${V}` : ot[a.value.source];
    }), I = e.computed(() => {
      const V = o.value?.confirm;
      return V?.total ? V.done >= V.total ? t.t("均已确认") : t.t("已确认 {a}/{b}", { a: V.done, b: V.total }) : "";
    });
    function H(V) {
      return a.value.segments.filter(($) => Le(a.value, $.speakerLabel) === V).length;
    }
    function f(V) {
      return V.objection ? "warn" : V.status === "done" ? "ok" : V.status === "cancelled" ? "muted" : V.status === "to_accept" ? "brand" : "muted";
    }
    const d = e.computed(() => {
      if (!o.value) return [];
      const V = o.value.confirm, $ = [
        { key: "minutes", title: t.t("纪要内容") },
        { key: "confirm", title: t.t("发言确认"), extra: V?.total ? `${V.done}/${V.total}` : "" },
        { key: "transcript", title: t.t("转写原文") },
        { key: "files", title: t.t("文件与处理记录") }
      ];
      return (a.value.plan || ["pending_owner", "plan_confirm", "dispatched"].includes(a.value.status)) && $.push({ key: "plan", title: t.t("执行方案") }), (a.value.status === "dispatched" || o.value?.tasks.length) && $.push({ key: "tasks", title: t.t("关联任务"), extra: o.value?.tasks.length ? String(o.value.tasks.length) : "" }), $;
    });
    e.watch(d, (V) => {
      V.length && !V.some(($) => $.key === k.value) && (k.value = "minutes");
    });
    const u = e.computed(() => {
      const V = o.value;
      if (!V) return null;
      const $ = V.meeting, B = V.my, w = E($.hostId), q = V.projectStatus === "archived", Y = (C, F, x = "primary") => q ? [] : [{ key: C, label: F, kind: x }], O = (C, F) => ({ tone: "muted", icon: "ri-time-line", title: C, desc: F, actions: [] });
      switch ($.status) {
        case "pending_upload":
          return B.isHost ? { tone: "warn", icon: "ri-upload-cloud-2-line", title: t.t("上传会议文件，开始转写和整理"), desc: t.t("录音、录屏、文字记录都支持；优先上传录音或录屏，能按声纹自动认出发言人"), actions: Y("pick", t.t("选择文件")) } : O(t.t("等待主持人 {name} 上传会议文件", { name: w }));
        case "processing":
          return { tone: "brand", icon: "ri-loader-4-line spin", title: t.t("正在处理：{stage}", { stage: je[A.value] }), desc: t.t("完成后自动通知每位发言人确认本人发言"), actions: [] };
        case "failed":
          return B.isHost ? { tone: "bad", icon: "ri-error-warning-line", title: t.t("处理失败"), desc: $.process?.error || "", actions: Y("retry", t.t("重试")) } : { tone: "bad", icon: "ri-error-warning-line", title: t.t("处理失败，等待主持人 {name} 重试", { name: w }), desc: $.process?.error || "", actions: [] };
        case "pending_assign": {
          const C = $.speakers.filter((F) => !F.personId).length;
          return B.isHost ? { tone: "warn", icon: "ri-user-search-line", title: t.t("有 {n} 位发言人没认出来，请先指认", { n: C }), desc: t.t("试听片段后从参会人里选人；全部指认完自动进入发言确认"), actions: k.value === "minutes" ? [] : Y("goMinutes", t.t("去指认")) } : O(t.t("等待主持人 {name} 指认发言人", { name: w }));
        }
        case "pending_confirm": {
          const C = V.confirm;
          if (_.value?.status === "pending") {
            const F = $.segments.filter((Z) => B.myLabels.includes(Z.speakerLabel) || Le($, Z.speakerLabel) === N.value).length, x = _.value.returnedAt ? t.t("主持人退回了你的发言：{note}。改完后重新确认。", { note: _.value.returnNote || t.t("（没有写原因）") }) : "";
            return { tone: x ? "warn" : "brand", icon: "ri-chat-check-line", title: t.t("请核对你的 {n} 段发言", { n: F }), desc: x || t.t("有误的直接在纪要里修改；没问题就点「确认我的发言」"), actions: Y("confirm", t.t("确认我的发言")) };
          }
          return _.value?.status === "confirmed" ? { tone: "ok", icon: "ri-check-double-line", title: t.t("你已确认本人发言"), desc: t.t("其他发言人确认中（{a}/{b}），全部确认后进入主持人终审", { a: C.done, b: C.total }), actions: [] } : { tone: "brand", icon: "ri-chat-check-line", title: t.t("发言人确认中 {a}/{b}", { a: C.done, b: C.total }), desc: B.isHost ? t.t("全部确认后自动进入你的终审；超时未确认的系统自动催办") : t.t("全部确认后进入主持人终审"), actions: k.value === "confirm" ? [] : [{ key: "goConfirm", label: t.t("查看确认进度"), kind: "soft" }] };
        }
        case "pending_review":
          return B.isHost ? { tone: "brand", icon: "ri-check-line", title: t.t("{n} 位发言人已全部确认，等你终审", { n: V.confirm.total }), desc: t.t("可直接修改任意段落，或把某段退回给指定发言人（只有被退回的人需要重新确认）"), actions: Y("approve", t.t("审核通过")) } : O(t.t("发言人已全部确认，等待主持人 {name} 终审", { name: w }));
        case "finalized":
          return B.isHost ? {
            tone: "ok",
            icon: "ri-file-shield-2-line",
            title: t.t("纪要已定稿，下一步：是否生成任务？"),
            desc: $.decisions.length ? t.t("AI 识别出 {n} 项决议事项；选「生成任务」由 AI 拆成执行方案，再由你指定任务负责人", { n: $.decisions.length }) : t.t("没有识别到决议事项，一般选「无需生成任务」结束会议"),
            actions: q ? [] : [{ key: "generate", label: t.t("生成任务"), kind: "primary" }, { key: "none", label: t.t("无需生成任务"), kind: "plain" }]
          } : O(t.t("纪要已定稿，等待主持人 {name} 选择是否生成任务", { name: w }));
        case "ended":
          return { tone: "muted", icon: "ri-flag-line", title: t.t("会议已结束（无需生成任务）"), desc: $.finalizedAt ? t.t("纪要于 {t} 定稿", { t: $e($.finalizedAt) }) : "", actions: [] };
        case "pending_owner":
          return B.isHost ? { tone: "brand", icon: "ri-user-star-line", title: t.t("执行方案已生成，请指定任务负责人"), desc: t.t("任务负责人负责确认方案；确认后自动下发给各部门负责人"), actions: k.value === "plan" ? [] : Y("goPlan", t.t("去指定")) } : O(t.t("执行方案已生成，等待主持人 {name} 指定任务负责人", { name: w }));
        case "plan_confirm":
          return B.isPlanOwner ? { tone: "brand", icon: "ri-file-list-3-line", title: t.t("请确认执行方案"), desc: t.t("可以编辑任务、增删、设完成时间；确认后按部门下发给第一负责人"), actions: k.value === "plan" ? [] : Y("goPlan", t.t("去确认方案")) } : O(t.t("等待任务负责人 {name} 确认方案", { name: ($.plan?.ownerIds?.length ? $.plan.ownerIds : $.plan?.ownerId ? [$.plan.ownerId] : []).map((C) => E(C)).filter(Boolean).join(t.t("、")) }));
        case "dispatched":
          return { tone: "ok", icon: "ri-send-plane-line", title: t.t("已派发 {n} 项任务", { n: V.tasks.length || $.taskIds.length }), desc: t.t("各部门负责人接收后开始执行，进度在「任务」里跟进"), actions: k.value === "tasks" ? [] : [{ key: "goTasks", label: t.t("查看关联任务"), kind: "soft" }] };
        default:
          return null;
      }
    });
    async function z() {
      const V = p.meetingId;
      try {
        const $ = await J("meeting.get", { id: V });
        if (V !== p.meetingId) return;
        o.value = $, c.value = "", $?.meeting?.status !== "processing" && (r.value = null);
      } catch ($) {
        c.value = X.errorMessage($);
      }
    }
    function Q() {
      z(), y("changed");
    }
    let te = null;
    function K() {
      te && clearTimeout(te), te = setTimeout(() => {
        te = null, z();
      }, 300);
    }
    async function G(V) {
      if (V === "goPlan") {
        k.value = "plan";
        return;
      }
      if (V === "goTasks") {
        k.value = "tasks";
        return;
      }
      if (V === "goMinutes") {
        k.value = "minutes";
        return;
      }
      if (V === "goConfirm") {
        k.value = "confirm";
        return;
      }
      if (!o.value || i.value) return;
      const $ = o.value.meeting.id;
      if (!(V === "approve" && !window.confirm(t.t("审核通过后纪要锁定，不能再改，并通知全部参会人。确定通过？"))) && !(V === "none" && !window.confirm(t.t("确定无需生成任务？会议将直接结束。"))) && !(V === "reprocess" && !window.confirm(t.t("用当前的转写模型把这场会议重新转写一遍？发言人识别、确认状态和对纪要的修改都会清掉，处理完重新走确认。")))) {
        i.value = V, c.value = "";
        try {
          V === "pick" ? await J("meeting.pickFiles", { id: $ }) && s.success(t.t("文件已上传，开始处理")) : V === "retry" ? await J("meeting.retry", { id: $ }) : V === "reprocess" ? (await J("meeting.reprocess", { id: $ }), s.success(t.t("已开始重新转写"))) : V === "confirm" ? (await J("meeting.confirm", { id: $ }), s.success(t.t("已确认你的发言"))) : V === "approve" ? (await J("meeting.review.approve", { id: $ }), s.success(t.t("纪要已定稿，已通知参会人"))) : V === "generate" ? (await J("meeting.decide", { id: $, decision: "generate" }), s.success(t.t("执行方案已生成，下一步指定任务负责人")), k.value = "plan") : V === "none" && await J("meeting.decide", { id: $, decision: "none" }), await z(), y("changed");
        } catch (B) {
          c.value = X.errorMessage(B), s.error(X.errorMessage(B));
        } finally {
          i.value = "";
        }
      }
    }
    e.watch(() => p.focus?.seq, () => {
      const V = p.focus;
      if (!V) return;
      const $ = ["minutes", "confirm", "transcript", "files", "plan", "tasks"];
      V.tab && $.includes(V.tab) && (k.value = V.tab), V.anchor && ($.includes(V.anchor) ? k.value = V.anchor : (k.value = "minutes", b.value = V.anchor, m.value = V.seq));
    }, { immediate: !0 }), e.watch(() => vl(o.value, N.value), (V) => {
      V && y("role", V);
    }, { immediate: !0 });
    let ee = null;
    e.watch(() => o.value?.meeting.status === "processing", (V) => {
      V && !ee && (ee = setInterval(() => {
        g.value = Date.now();
      }, 1e3)), !V && ee && (clearInterval(ee), ee = null);
    }, { immediate: !0 });
    let ne = null;
    return e.onMounted(() => {
      z(), ne = Se((V) => {
        if (V?.type === "changed") {
          (V.scope === "all" || V.scope === "meeting" && (!V.id || V.id === p.meetingId)) && K();
          return;
        }
        V?.type !== "process" || V.meetingId !== p.meetingId || (r.value = { stage: V.stage, progress: V.progress, text: V.text, at: Date.now() }, g.value = Date.now(), (V.stage === "done" || o.value && o.value.meeting.status !== "processing") && z());
      });
    }), e.onBeforeUnmount(() => {
      ne?.(), te && clearTimeout(te), ee && clearInterval(ee);
    }), v({ refresh: z }), (V, $) => (e.openBlock(), e.createElementBlock("section", ti, [
      c.value && !o.value ? (e.openBlock(), e.createElementBlock("p", li, [
        $[5] || ($[5] = e.createElementVNode(
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
          e.toDisplayString(V.$t("重试")),
          1
          /* TEXT */
        )
      ])) : o.value ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock("p", ni, [
        $[6] || ($[6] = e.createElementVNode(
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
      o.value ? (e.openBlock(), e.createElementBlock(
        e.Fragment,
        { key: 2 },
        [
          e.createCommentVNode(" 顶部：标题 + 状态 + 环节进度（sticky：滚动时一直看得见） "),
          e.createElementVNode("div", oi, [
            e.createElementVNode("div", ai, [
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
                e.toDisplayString(D.value),
                3
                /* TEXT, CLASS */
              ),
              $[8] || ($[8] = e.createElementVNode(
                "span",
                { class: "mm-grow" },
                null,
                -1
                /* CACHED */
              )),
              e.createElementVNode("ol", si, [
                (e.openBlock(!0), e.createElementBlock(
                  e.Fragment,
                  null,
                  e.renderList(e.unref(Dt), (B, w) => (e.openBlock(), e.createElementBlock("li", {
                    key: B.key,
                    class: e.normalizeClass({ done: w < U.value || a.value.status === "dispatched" && w === U.value, cur: w === U.value && a.value.status !== "dispatched", bad: w === U.value && a.value.status === "failed" }),
                    "data-test": `mm-step-${B.key}`
                  }, [
                    $[7] || ($[7] = e.createElementVNode(
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
                  ], 10, ri))),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ])
            ]),
            a.value.status === "processing" ? (e.openBlock(), e.createElementBlock("div", ii, [
              e.createElementVNode("span", ci, [
                e.createElementVNode(
                  "i",
                  {
                    style: e.normalizeStyle({ width: `${P.value}%` })
                  },
                  null,
                  4
                  /* STYLE */
                )
              ]),
              e.createElementVNode(
                "small",
                null,
                e.toDisplayString(V.$t("处理中 · {stage} {p}%", { stage: e.unref(je)[A.value], p: P.value })),
                1
                /* TEXT */
              )
            ])) : e.createCommentVNode("v-if", !0)
          ]),
          e.createElementVNode("p", di, [
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
              e.toDisplayString(e.unref($e)(a.value.time)),
              1
              /* TEXT */
            ),
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(V.$t("主持人 {name}", { name: E(a.value.hostId) })),
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
              mi,
              e.toDisplayString(e.unref(il)(a.value.durationSec)),
              1
              /* TEXT */
            )) : e.createCommentVNode("v-if", !0)
          ]),
          o.value.projectStatus !== "active" ? (e.openBlock(), e.createElementBlock("p", ui, [
            $[9] || ($[9] = e.createElementVNode(
              "i",
              { class: "ri-lock-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(o.value.projectStatus === "archived" ? V.$t("项目已归档，会议只读") : V.$t("项目结项中，会议只读")),
              1
              /* TEXT */
            )
          ])) : e.createCommentVNode("v-if", !0),
          e.createCommentVNode(" 当前环节的操作横幅 "),
          u.value ? (e.openBlock(), e.createElementBlock(
            "div",
            {
              key: 1,
              class: e.normalizeClass(["mm-banner", u.value.tone]),
              "data-test": "mm-meeting-banner"
            },
            [
              e.createElementVNode("span", pi, [
                e.createElementVNode(
                  "i",
                  {
                    class: e.normalizeClass(u.value.icon)
                  },
                  null,
                  2
                  /* CLASS */
                )
              ]),
              e.createElementVNode("div", vi, [
                e.createElementVNode(
                  "strong",
                  null,
                  e.toDisplayString(u.value.title),
                  1
                  /* TEXT */
                ),
                u.value.desc ? (e.openBlock(), e.createElementBlock(
                  "small",
                  ki,
                  e.toDisplayString(u.value.desc),
                  1
                  /* TEXT */
                )) : e.createCommentVNode("v-if", !0)
              ]),
              u.value.actions.length ? (e.openBlock(), e.createElementBlock("div", yi, [
                (e.openBlock(!0), e.createElementBlock(
                  e.Fragment,
                  null,
                  e.renderList(u.value.actions, (B) => (e.openBlock(), e.createElementBlock("button", {
                    key: B.key,
                    type: "button",
                    class: e.normalizeClass(["mm-btn", B.kind]),
                    disabled: !!i.value,
                    "data-test": `mm-action-${B.key}`,
                    onClick: (w) => G(B.key)
                  }, [
                    i.value === B.key ? (e.openBlock(), e.createElementBlock("i", fi)) : e.createCommentVNode("v-if", !0),
                    e.createTextVNode(
                      e.toDisplayString(B.label),
                      1
                      /* TEXT */
                    )
                  ], 10, gi))),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ])) : e.createCommentVNode("v-if", !0)
            ],
            2
            /* CLASS */
          )) : e.createCommentVNode("v-if", !0),
          c.value ? (e.openBlock(), e.createElementBlock("p", Ni, [
            $[10] || ($[10] = e.createElementVNode(
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
          e.createElementVNode("nav", Vi, [
            (e.openBlock(!0), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(d.value, (B) => (e.openBlock(), e.createElementBlock("button", {
                key: B.key,
                type: "button",
                role: "tab",
                class: e.normalizeClass({ on: k.value === B.key }),
                "aria-selected": k.value === B.key,
                "data-test": `mm-dtab-${B.key}`,
                onClick: (w) => k.value = B.key
              }, [
                e.createTextVNode(
                  e.toDisplayString(B.title),
                  1
                  /* TEXT */
                ),
                B.extra ? (e.openBlock(), e.createElementBlock(
                  "span",
                  $i,
                  e.toDisplayString(B.extra),
                  1
                  /* TEXT */
                )) : e.createCommentVNode("v-if", !0)
              ], 10, Ei))),
              128
              /* KEYED_FRAGMENT */
            ))
          ]),
          e.createElementVNode("div", bi, [
            e.createElementVNode("div", hi, [
              e.createCommentVNode(" 纪要内容 "),
              k.value === "minutes" ? (e.openBlock(), e.createElementBlock(
                e.Fragment,
                { key: 0 },
                [
                  a.value.status === "pending_upload" || a.value.status === "processing" || a.value.status === "failed" ? (e.openBlock(), e.createBlock(xo, {
                    key: 0,
                    detail: o.value,
                    live: r.value,
                    now: g.value,
                    "wait-from": h.value,
                    onChanged: Q,
                    onLog: $[0] || ($[0] = (B) => k.value = "files"),
                    onWait: $[1] || ($[1] = (B) => h.value = Date.now())
                  }, null, 8, ["detail", "live", "now", "wait-from"])) : e.createCommentVNode("v-if", !0),
                  a.value.status === "pending_assign" || o.value.my.isHost && (a.value.status === "pending_confirm" || a.value.status === "pending_review") ? (e.openBlock(), e.createBlock(ja, {
                    key: `sa-${a.value.status}`,
                    detail: o.value,
                    onChanged: Q
                  }, null, 8, ["detail"])) : e.createCommentVNode("v-if", !0),
                  a.value.segments.length || !["pending_upload", "processing", "failed"].includes(a.value.status) ? (e.openBlock(), e.createBlock(nr, {
                    key: 2,
                    detail: o.value,
                    anchor: b.value,
                    "anchor-seq": m.value,
                    onChanged: Q
                  }, null, 8, ["detail", "anchor", "anchor-seq"])) : e.createCommentVNode("v-if", !0)
                ],
                64
                /* STABLE_FRAGMENT */
              )) : k.value === "confirm" ? (e.openBlock(), e.createElementBlock(
                e.Fragment,
                { key: 1 },
                [
                  e.createCommentVNode(" 发言确认 "),
                  a.value.confirmations.length ? (e.openBlock(), e.createElementBlock("div", Bi, [
                    e.createElementVNode("table", Si, [
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
                            Di,
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
                          e.renderList(a.value.confirmations, (B) => (e.openBlock(), e.createElementBlock("tr", {
                            key: B.personId,
                            "data-test": `mm-confirm-${B.personId}`
                          }, [
                            e.createElementVNode("td", null, [
                              e.createElementVNode("span", Ci, [
                                e.createElementVNode(
                                  "span",
                                  {
                                    class: "mm-av sm",
                                    style: e.normalizeStyle({ background: e.unref(re)(E(B.personId)).color })
                                  },
                                  e.toDisplayString(e.unref(re)(E(B.personId)).text),
                                  5
                                  /* TEXT, STYLE */
                                ),
                                e.createTextVNode(
                                  e.toDisplayString(E(B.personId)),
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
                              Ti,
                              e.toDisplayString(H(B.personId)),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode("td", null, [
                              B.status === "confirmed" ? (e.openBlock(), e.createElementBlock(
                                "span",
                                Ii,
                                e.toDisplayString(V.$t("已确认")),
                                1
                                /* TEXT */
                              )) : B.returnedAt ? (e.openBlock(), e.createElementBlock("span", {
                                key: 1,
                                class: "ss-chip bad",
                                title: B.returnNote || ""
                              }, e.toDisplayString(V.$t("被退回")), 9, Mi)) : (e.openBlock(), e.createElementBlock(
                                "span",
                                Ai,
                                e.toDisplayString(V.$t("未确认")),
                                1
                                /* TEXT */
                              )),
                              B.returnedAt && B.returnNote && B.status !== "confirmed" ? (e.openBlock(), e.createElementBlock(
                                "small",
                                ji,
                                e.toDisplayString(B.returnNote),
                                1
                                /* TEXT */
                              )) : e.createCommentVNode("v-if", !0)
                            ]),
                            e.createElementVNode(
                              "td",
                              null,
                              e.toDisplayString(B.confirmedAt ? e.unref($e)(B.confirmedAt) : "-"),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "td",
                              null,
                              e.toDisplayString(B.remindedAt ? V.$t("已催办 {t}", { t: e.unref($e)(B.remindedAt) }) : "-"),
                              1
                              /* TEXT */
                            )
                          ], 8, wi))),
                          128
                          /* KEYED_FRAGMENT */
                        ))
                      ])
                    ])
                  ])) : (e.openBlock(), e.createElementBlock(
                    "p",
                    _i,
                    e.toDisplayString(V.$t("转写和发言人识别完成后，这里显示每位发言人的确认状态")),
                    1
                    /* TEXT */
                  )),
                  e.createElementVNode(
                    "small",
                    Li,
                    e.toDisplayString(V.$t("超过 {h} 小时未确认，系统自动催办（只提醒，不改状态）；全员确认后自动进入主持人终审。", { h: T.value })),
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
                  R.value.length ? (e.openBlock(), e.createElementBlock("ol", Fi, [
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
                    zi,
                    e.toDisplayString(V.$t("还没有转写内容")),
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
                  e.createElementVNode("div", Pi, [
                    e.createElementVNode(
                      "b",
                      null,
                      e.toDisplayString(V.$t("上传的文件")),
                      1
                      /* TEXT */
                    ),
                    $[11] || ($[11] = e.createElementVNode(
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
                      onClick: $[2] || ($[2] = (B) => G("pick"))
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
                    ], 8, Ui)) : e.createCommentVNode("v-if", !0),
                    S.value ? (e.openBlock(), e.createElementBlock("button", {
                      key: 1,
                      type: "button",
                      class: "ss-btn sm",
                      disabled: !!i.value,
                      "data-test": "mm-reprocess",
                      title: V.$t("换了更准的转写模型后，用现在的模型把这场会议重新转写一遍"),
                      onClick: $[3] || ($[3] = (B) => G("reprocess"))
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
                    ], 8, Oi)) : e.createCommentVNode("v-if", !0)
                  ]),
                  a.value.files.length ? (e.openBlock(), e.createElementBlock("div", qi, [
                    e.createElementVNode("table", Ki, [
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
                            Hi,
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
                              Wi,
                              e.toDisplayString(e.unref(rl)(B.size)),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "td",
                              null,
                              e.toDisplayString(e.unref($e)(B.uploadedAt)),
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
                    Ri,
                    e.toDisplayString(V.$t("还没有上传文件")),
                    1
                    /* TEXT */
                  )),
                  e.createElementVNode("div", Gi, [
                    e.createElementVNode(
                      "b",
                      null,
                      e.toDisplayString(V.$t("处理记录")),
                      1
                      /* TEXT */
                    ),
                    a.value.process ? (e.openBlock(), e.createElementBlock("span", Yi, [
                      e.createTextVNode(
                        e.toDisplayString(V.$t("{stage} · {p}%", { stage: e.unref(je)[a.value.process.stage], p: Math.round(a.value.process.progress || 0) })),
                        1
                        /* TEXT */
                      ),
                      a.value.process.finishedAt ? (e.openBlock(), e.createElementBlock(
                        e.Fragment,
                        { key: 0 },
                        [
                          e.createTextVNode(
                            " · " + e.toDisplayString(V.$t("完成于 {t}", { t: e.unref($e)(a.value.process.finishedAt) })),
                            1
                            /* TEXT */
                          )
                        ],
                        64
                        /* STABLE_FRAGMENT */
                      )) : e.createCommentVNode("v-if", !0)
                    ])) : e.createCommentVNode("v-if", !0),
                    $[12] || ($[12] = e.createElementVNode(
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
                      onClick: $[4] || ($[4] = (B) => G("retry"))
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
                    ], 8, Ji)) : e.createCommentVNode("v-if", !0)
                  ]),
                  a.value.process?.error ? (e.openBlock(), e.createElementBlock("p", Qi, [
                    $[13] || ($[13] = e.createElementVNode(
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
                  a.value.process?.log?.length ? (e.openBlock(), e.createElementBlock("ol", Xi, [
                    (e.openBlock(!0), e.createElementBlock(
                      e.Fragment,
                      null,
                      e.renderList(a.value.process.log, (B, w) => (e.openBlock(), e.createElementBlock("li", { key: w }, [
                        e.createElementVNode(
                          "time",
                          null,
                          e.toDisplayString(e.unref($e)(B.at)),
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
                    Zi,
                    e.toDisplayString(V.$t("还没有处理记录")),
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
                  e.createVNode(ei, {
                    detail: o.value,
                    onChanged: Q
                  }, null, 8, ["detail"])
                ],
                2112
                /* STABLE_FRAGMENT, DEV_ROOT_FRAGMENT */
              )) : k.value === "tasks" ? (e.openBlock(), e.createElementBlock(
                e.Fragment,
                { key: 5 },
                [
                  e.createCommentVNode(" 关联任务 "),
                  o.value.tasks.length ? (e.openBlock(), e.createElementBlock("ul", ec, [
                    (e.openBlock(!0), e.createElementBlock(
                      e.Fragment,
                      null,
                      e.renderList(o.value.tasks, (B) => (e.openBlock(), e.createElementBlock("li", {
                        key: B.id,
                        onClick: (w) => e.unref(de)({ kind: "task", id: B.id })
                      }, [
                        e.createElementVNode("div", lc, [
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
                            e.toDisplayString(B.deptName) + " · " + e.toDisplayString(B.assigneeName) + " · " + e.toDisplayString(V.$t("截止 {d}", { d: B.due })),
                            1
                            /* TEXT */
                          )
                        ]),
                        e.createElementVNode("span", nc, [
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
                          oc,
                          e.toDisplayString(Math.round(B.percent || 0)) + "%",
                          1
                          /* TEXT */
                        ),
                        B.overdue ? (e.openBlock(), e.createElementBlock(
                          "span",
                          ac,
                          e.toDisplayString(V.$t("逾期 {n} 天", { n: B.overdueDays })),
                          1
                          /* TEXT */
                        )) : e.createCommentVNode("v-if", !0),
                        e.createElementVNode(
                          "span",
                          {
                            class: e.normalizeClass(["ss-chip", f(B)])
                          },
                          e.toDisplayString(e.unref(mt)(B.objection) || e.unref(Ue)[B.status]),
                          3
                          /* TEXT, CLASS */
                        ),
                        $[14] || ($[14] = e.createElementVNode(
                          "i",
                          {
                            class: "ri-arrow-right-s-line",
                            "aria-hidden": "true"
                          },
                          null,
                          -1
                          /* CACHED */
                        ))
                      ], 8, tc))),
                      128
                      /* KEYED_FRAGMENT */
                    ))
                  ])) : (e.openBlock(), e.createElementBlock(
                    "p",
                    xi,
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
            e.createElementVNode("aside", sc, [
              e.createVNode(ls, {
                detail: o.value,
                onChanged: Q
              }, null, 8, ["detail"]),
              e.createElementVNode("section", rc, [
                e.createElementVNode("h5", null, [
                  e.createTextVNode(
                    e.toDisplayString(V.$t("参会人")) + " ",
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
                  I.value ? (e.openBlock(), e.createElementBlock(
                    "small",
                    ic,
                    " · " + e.toDisplayString(I.value),
                    1
                    /* TEXT */
                  )) : e.createCommentVNode("v-if", !0)
                ]),
                e.createElementVNode("div", cc, [
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(a.value.attendeeIds, (B) => (e.openBlock(), e.createElementBlock("span", {
                      key: B,
                      class: e.normalizeClass(["mm-av", { host: B === a.value.hostId }]),
                      style: e.normalizeStyle({ background: e.unref(re)(E(B)).color }),
                      title: B === a.value.hostId ? V.$t("{name}（主持人）", { name: E(B) }) : E(B)
                    }, e.toDisplayString(e.unref(re)(E(B)).text), 15, dc))),
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
}), uc = /* @__PURE__ */ ae(mc, [["__scopeId", "data-v-f1e6ab38"]]), pc = ["aria-label"], vc = { class: "mm-cd" }, kc = { class: "mm-cd__head" }, yc = ["title"], gc = { class: "mm-cd__body" }, fc = {
  key: 0,
  class: "ss-note danger"
}, Nc = {
  key: 1,
  class: "ss-note warn"
}, Vc = { class: "ss-field" }, Ec = { value: "" }, $c = ["value"], bc = { class: "ss-field" }, hc = ["placeholder"], _c = { class: "mm-cd__row" }, Bc = { class: "ss-field" }, Sc = { class: "ss-field" }, Dc = {
  class: "mm-cd__seg",
  role: "radiogroup"
}, wc = ["aria-checked", "data-test", "onClick"], Cc = { class: "ss-field" }, Tc = { class: "ss-muted" }, Ic = { class: "ss-field" }, Mc = { class: "ss-muted" }, Ac = {
  key: 0,
  class: "mm-cd__chips"
}, jc = ["title", "onClick"], Lc = { class: "mm-cd__picker" }, zc = { class: "mm-cd__search" }, Fc = ["placeholder"], Pc = { class: "mm-cd__groups" }, Uc = { class: "mm-cd__ghead" }, Oc = ["onClick"], Rc = ["data-test"], qc = ["checked", "disabled", "onChange"], Kc = {
  key: 0,
  class: "mm-cd__none"
}, Hc = { class: "ss-muted" }, Wc = {
  key: 2,
  class: "ss-note danger"
}, Gc = { class: "mm-cd__foot" }, Yc = { class: "ss-muted" }, Jc = ["disabled"], Qc = /* @__PURE__ */ e.defineComponent({
  __name: "MeetingCreateDialog",
  props: {
    projectId: {}
  },
  emits: ["close", "created"],
  setup(l, { emit: v }) {
    const n = l, p = v, y = ["offline", "tencent", "zoom"], s = ie.useNotificationStore(), o = e.ref([]), c = e.ref({ depts: [], people: [] }), i = e.ref(!1), k = e.ref(""), b = e.ref(""), m = e.ref(!1), r = e.ref(""), g = e.ref(/* @__PURE__ */ new Set());
    function h() {
      const _ = /* @__PURE__ */ new Date();
      return _.setMinutes(0, 0, 0), _.setHours(_.getHours() + 1), _.getTime();
    }
    const a = e.reactive({
      projectId: n.projectId || "",
      title: "",
      time: al(h()),
      source: "offline",
      hostId: oe.value?.me?.person?.id || ""
    }), N = e.computed(() => Ct(c.value, r.value)), T = e.computed(() => {
      const _ = new Set(g.value);
      return a.hostId && _.add(a.hostId), c.value.people.filter((S) => _.has(S.id));
    }), U = e.computed(() => T.value.length);
    function j(_) {
      if (_ === a.hostId) return;
      const S = new Set(g.value);
      S.has(_) ? S.delete(_) : S.add(_), g.value = S;
    }
    function D(_) {
      const S = new Set(g.value), E = _.every((M) => S.has(M.id));
      for (const M of _)
        M.id !== a.hostId && (E ? S.delete(M.id) : S.add(M.id));
      g.value = S;
    }
    function A() {
      m.value || p("close");
    }
    function P(_) {
      _.key === "Escape" && A();
    }
    async function R() {
      if (m.value) return;
      b.value = "";
      const _ = sl(a.time);
      if (!a.projectId) {
        b.value = t.t("请选择所属项目");
        return;
      }
      if (!a.title.trim()) {
        b.value = t.t("请填写会议主题");
        return;
      }
      if (!Number.isFinite(_)) {
        b.value = t.t("请填写会议时间");
        return;
      }
      if (!a.hostId) {
        b.value = t.t("请选择主持人");
        return;
      }
      const S = [.../* @__PURE__ */ new Set([a.hostId, ...g.value])];
      if (S.length < 2) {
        b.value = t.t("请至少再选一位参会人");
        return;
      }
      m.value = !0;
      try {
        const E = await J("meeting.create", {
          projectId: a.projectId,
          title: a.title.trim(),
          time: _,
          source: a.source,
          hostId: a.hostId,
          attendeeIds: S
        });
        s.success(t.t("会议已创建，下一步上传会议文件")), p("created", E.id);
      } catch (E) {
        b.value = X.errorMessage(E);
      } finally {
        m.value = !1;
      }
    }
    return e.onMounted(async () => {
      document.addEventListener("keydown", P);
      try {
        const [_, S] = await Promise.all([
          J("project.list", { status: "active" }),
          De()
        ]);
        o.value = (Array.isArray(_) ? _ : []).filter((E) => !E.status || E.status === "active"), c.value = S, !a.projectId && o.value.length === 1 && (a.projectId = o.value[0].id);
      } catch (_) {
        k.value = X.errorMessage(_);
      } finally {
        i.value = !0;
      }
    }), e.onBeforeUnmount(() => document.removeEventListener("keydown", P)), (_, S) => (e.openBlock(), e.createBlock(e.Teleport, { to: "body" }, [
      e.createElementVNode("div", {
        class: "mm-dialog-overlay",
        role: "dialog",
        "aria-modal": "true",
        "aria-label": _.$t("创建会议"),
        "data-test": "mm-create-dialog",
        onClick: e.withModifiers(A, ["self"])
      }, [
        e.createElementVNode("section", vc, [
          e.createElementVNode("header", kc, [
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
              onClick: A
            }, [...S[5] || (S[5] = [
              e.createElementVNode(
                "i",
                { class: "ri-close-line" },
                null,
                -1
                /* CACHED */
              )
            ])], 8, yc)
          ]),
          e.createElementVNode("div", gc, [
            k.value ? (e.openBlock(), e.createElementBlock("p", fc, [
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
            ])) : i.value && !o.value.length ? (e.openBlock(), e.createElementBlock("p", Nc, [
              S[7] || (S[7] = e.createElementVNode(
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
            e.createElementVNode("label", Vc, [
              e.createElementVNode("span", null, [
                e.createTextVNode(
                  e.toDisplayString(_.$t("所属项目")) + " ",
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
                  "onUpdate:modelValue": S[0] || (S[0] = (E) => a.projectId = E),
                  "data-test": "mm-create-project"
                },
                [
                  e.createElementVNode(
                    "option",
                    Ec,
                    e.toDisplayString(_.$t("选择项目")),
                    1
                    /* TEXT */
                  ),
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(o.value, (E) => (e.openBlock(), e.createElementBlock("option", {
                      key: E.id,
                      value: E.id
                    }, e.toDisplayString(E.name), 9, $c))),
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
            e.createElementVNode("label", bc, [
              e.createElementVNode("span", null, [
                e.createTextVNode(
                  e.toDisplayString(_.$t("会议主题")) + " ",
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
                "onUpdate:modelValue": S[1] || (S[1] = (E) => a.title = E),
                type: "text",
                maxlength: "80",
                placeholder: _.$t("例如：A2 量产导入第 5 次周例会"),
                "data-test": "mm-create-title"
              }, null, 8, hc), [
                [e.vModelText, a.title]
              ])
            ]),
            e.createElementVNode("div", _c, [
              e.createElementVNode("label", Bc, [
                e.createElementVNode("span", null, [
                  e.createTextVNode(
                    e.toDisplayString(_.$t("会议时间")) + " ",
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
                    "onUpdate:modelValue": S[2] || (S[2] = (E) => a.time = E),
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
              e.createElementVNode("div", Sc, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(_.$t("来源")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode("div", Dc, [
                  (e.openBlock(), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(y, (E) => e.createElementVNode("button", {
                      key: E,
                      type: "button",
                      role: "radio",
                      "aria-checked": a.source === E,
                      class: e.normalizeClass({ on: a.source === E }),
                      "data-test": `mm-create-source-${E}`,
                      onClick: (M) => a.source = E
                    }, e.toDisplayString(e.unref(ot)[E]), 11, wc)),
                    64
                    /* STABLE_FRAGMENT */
                  ))
                ])
              ])
            ]),
            e.createElementVNode("div", Cc, [
              e.createElementVNode("span", null, [
                e.createTextVNode(
                  e.toDisplayString(_.$t("主持人")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "small",
                  Tc,
                  e.toDisplayString(_.$t("（默认是你，可以改；主持人负责上传、指认、终审）")),
                  1
                  /* TEXT */
                )
              ]),
              e.createVNode(Oe, {
                modelValue: a.hostId,
                "onUpdate:modelValue": S[3] || (S[3] = (E) => a.hostId = E),
                people: c.value,
                "aria-label": _.$t("主持人"),
                "data-test": "mm-create-host"
              }, null, 8, ["modelValue", "people", "aria-label"])
            ]),
            e.createElementVNode("div", Ic, [
              e.createElementVNode("span", null, [
                e.createTextVNode(
                  e.toDisplayString(_.$t("参会人")) + " ",
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
                  Mc,
                  e.toDisplayString(_.$t("已选 {n} 人（主持人自动参会）", { n: U.value })),
                  1
                  /* TEXT */
                )
              ]),
              T.value.length ? (e.openBlock(), e.createElementBlock("div", Ac, [
                (e.openBlock(!0), e.createElementBlock(
                  e.Fragment,
                  null,
                  e.renderList(T.value, (E) => (e.openBlock(), e.createElementBlock("span", {
                    key: E.id,
                    class: "mm-cd__chip"
                  }, [
                    e.createTextVNode(
                      e.toDisplayString(E.name) + " ",
                      1
                      /* TEXT */
                    ),
                    E.id !== a.hostId ? (e.openBlock(), e.createElementBlock("button", {
                      key: 0,
                      type: "button",
                      title: _.$t("移除"),
                      onClick: (M) => j(E.id)
                    }, [...S[12] || (S[12] = [
                      e.createElementVNode(
                        "i",
                        { class: "ri-close-line" },
                        null,
                        -1
                        /* CACHED */
                      )
                    ])], 8, jc)) : e.createCommentVNode("v-if", !0)
                  ]))),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ])) : e.createCommentVNode("v-if", !0),
              e.createElementVNode("div", Lc, [
                e.createElementVNode("label", zc, [
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
                    "onUpdate:modelValue": S[4] || (S[4] = (E) => r.value = E),
                    type: "search",
                    placeholder: _.$t("搜索姓名、职务"),
                    "data-test": "mm-create-search"
                  }, null, 8, Fc), [
                    [e.vModelText, r.value]
                  ])
                ]),
                e.createElementVNode("div", Pc, [
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(N.value, (E) => (e.openBlock(), e.createElementBlock("div", {
                      key: E.id,
                      class: "mm-cd__group"
                    }, [
                      e.createElementVNode("div", Uc, [
                        e.createElementVNode(
                          "b",
                          null,
                          e.toDisplayString(E.name),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "small",
                          null,
                          e.toDisplayString(E.people.length),
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
                          onClick: (M) => D(E.people)
                        }, e.toDisplayString(E.people.every((M) => g.value.has(M.id)) ? _.$t("取消全选") : _.$t("全选")), 9, Oc)
                      ]),
                      (e.openBlock(!0), e.createElementBlock(
                        e.Fragment,
                        null,
                        e.renderList(E.people, (M) => (e.openBlock(), e.createElementBlock("label", {
                          key: M.id,
                          class: "mm-cd__person",
                          "data-test": `mm-create-person-${M.id}`
                        }, [
                          e.createElementVNode("input", {
                            type: "checkbox",
                            checked: g.value.has(M.id) || M.id === a.hostId,
                            disabled: M.id === a.hostId,
                            onChange: (I) => j(M.id)
                          }, null, 40, qc),
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
                        ], 8, Rc))),
                        128
                        /* KEYED_FRAGMENT */
                      ))
                    ]))),
                    128
                    /* KEYED_FRAGMENT */
                  )),
                  i.value && !N.value.length ? (e.openBlock(), e.createElementBlock(
                    "p",
                    Kc,
                    e.toDisplayString(r.value.trim() ? _.$t("没有找到这个人") : _.$t("组织里还没有人员")),
                    1
                    /* TEXT */
                  )) : e.createCommentVNode("v-if", !0)
                ])
              ]),
              e.createElementVNode("small", Hc, [
                S[15] || (S[15] = e.createElementVNode(
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
            b.value ? (e.openBlock(), e.createElementBlock("p", Wc, [
              S[16] || (S[16] = e.createElementVNode(
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
          e.createElementVNode("footer", Gc, [
            e.createElementVNode(
              "span",
              Yc,
              e.toDisplayString(_.$t("创建后在会议详情里上传录音、录屏或文字记录")),
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
                onClick: A
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
            ], 8, Jc)
          ])
        ])
      ], 8, pc)
    ]));
  }
}), Ft = /* @__PURE__ */ ae(Qc, [["__scopeId", "data-v-b8a4a4be"]]), Zc = {
  class: "mm-meetings",
  "data-test": "mm-meetings"
}, Xc = { class: "mm-meetings__head" }, xc = { class: "mm-search" }, ed = ["placeholder"], td = {
  key: 0,
  class: "ss-note danger"
}, ld = { class: "mm-meetings__grid" }, nd = { class: "mm-mlist" }, od = { class: "mm-chips" }, ad = ["data-test", "onClick"], sd = {
  key: 0,
  class: "mm-mlist__state"
}, rd = {
  key: 1,
  class: "mm-mlist__empty"
}, id = {
  key: 0,
  class: "mm-mlist__group"
}, cd = ["data-test", "onClick", "onKeydown"], dd = { class: "mm-mcard__title" }, md = { class: "mm-mcard__name" }, ud = ["title"], pd = ["disabled", "title", "aria-label", "data-test", "onClick"], vd = { class: "mm-mcard__meta" }, kd = {
  key: 1,
  class: "mm-placeholder"
}, yd = /* @__PURE__ */ e.defineComponent({
  __name: "MeetingsTab",
  emits: ["role"],
  setup(l, { expose: v, emit: n }) {
    const p = [
      { key: "all", title: t.t("全部") },
      { key: "todo", title: t.t("待我处理") },
      { key: "processing", title: t.t("处理中") },
      { key: "final", title: t.t("已定稿") }
    ], y = n, s = ie.useNotificationStore(), o = e.ref("all"), c = e.ref(""), i = e.ref(!1), k = e.ref(""), b = e.ref(""), m = e.ref(!1), r = e.ref(lt.value), g = e.ref(null), h = e.ref(null), a = e.reactive({ all: [], todo: [], processing: [], final: [] }), N = e.computed(() => ({ all: a.all.length, todo: a.todo.length, processing: a.processing.length, final: a.final.length })), T = e.computed(() => a[o.value]), U = e.computed(() => [
      { key: "mine", title: t.t("需要我处理"), items: T.value.filter((I) => I.needsMe) },
      { key: "other", title: t.t("其他"), items: T.value.filter((I) => !I.needsMe) }
    ]);
    let j = 0, D = "";
    async function A() {
      const I = ++j;
      i.value = !0;
      try {
        const H = c.value.trim(), f = await Promise.all(p.map((u) => J("meeting.list", { filter: u.key, ...H ? { q: H } : {} })));
        if (I !== j) return;
        p.forEach((u, z) => {
          a[u.key] = Array.isArray(f[z]) ? f[z] : [];
        }), b.value = "";
        const d = !a.all.some((u) => u.id === r.value) && !H && r.value !== D;
        if (!r.value || d) {
          const u = a.all.find((z) => z.needsMe) || a.all[0];
          u ? R(u.id) : r.value = "";
        }
      } catch (H) {
        I === j && (b.value = X.errorMessage(H));
      } finally {
        I === j && (i.value = !1);
      }
    }
    async function P() {
      await Promise.all([A(), h.value?.refresh?.()]);
    }
    function R(I) {
      I !== r.value && (g.value = null), r.value = I, lt.value = I;
    }
    function _(I) {
      m.value = !1, o.value = "all", c.value = "", R(I), A();
    }
    async function S(I) {
      if (k.value) return;
      const H = I.taskCount ? t.t("确定删除会议「{title}」？该会议的文件、纪要以及关联的 {n} 项任务和通知都会一并删除，无法恢复。", { title: I.title, n: I.taskCount }) : t.t("确定删除会议「{title}」？该会议的文件、纪要和相关通知都会一并删除，无法恢复。", { title: I.title });
      if (window.confirm(H)) {
        k.value = I.id;
        try {
          await J("meeting.delete", { id: I.id }), r.value === I.id && (r.value = "", lt.value = ""), D === I.id && (D = ""), s.success(t.t("已删除会议")), await Promise.all([A(), ce().catch(() => {
          })]);
        } catch (f) {
          const d = X.errorMessage(f);
          b.value = d, s.error(d);
        } finally {
          k.value = "";
        }
      }
    }
    function E() {
      const I = ge.value;
      I.tab !== "meetings" || !I.link || I.link.kind !== "meeting" && I.link.kind !== "meeting_plan" || (a.all.some((H) => H.id === I.link.id) || (o.value = "all", c.value = ""), D = I.link.id, R(I.link.id), g.value = { tab: I.link.kind === "meeting_plan" ? "plan" : void 0, anchor: I.link.anchor, seq: I.seq });
    }
    e.watch(() => ge.value.seq, E);
    let M = null;
    return e.watch(c, () => {
      M && clearTimeout(M), M = setTimeout(() => {
        M = null, A();
      }, 250);
    }), e.onMounted(() => {
      E(), rt.value && (rt.value = !1, m.value = !0), A();
    }), e.onBeforeUnmount(() => {
      M && clearTimeout(M);
    }), v({ refresh: P }), (I, H) => (e.openBlock(), e.createElementBlock("div", Zc, [
      e.createElementVNode("header", Xc, [
        e.createElementVNode(
          "h2",
          null,
          e.toDisplayString(I.$t("会议")),
          1
          /* TEXT */
        ),
        e.createElementVNode(
          "p",
          null,
          e.toDisplayString(I.$t("上传会议文件后自动转写、识别发言人、整理纪要")),
          1
          /* TEXT */
        ),
        H[7] || (H[7] = e.createElementVNode(
          "span",
          { class: "mm-grow" },
          null,
          -1
          /* CACHED */
        )),
        e.createElementVNode("label", xc, [
          H[5] || (H[5] = e.createElementVNode(
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
            "onUpdate:modelValue": H[0] || (H[0] = (f) => c.value = f),
            type: "search",
            placeholder: I.$t("搜索会议、项目"),
            "data-test": "mm-meeting-search"
          }, null, 8, ed), [
            [e.vModelText, c.value]
          ])
        ]),
        e.createElementVNode("button", {
          type: "button",
          class: "mm-btn primary",
          "data-test": "mm-meeting-create",
          onClick: H[1] || (H[1] = (f) => m.value = !0)
        }, [
          H[6] || (H[6] = e.createElementVNode(
            "i",
            { class: "ri-add-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            e.toDisplayString(I.$t("创建会议")),
            1
            /* TEXT */
          )
        ])
      ]),
      b.value ? (e.openBlock(), e.createElementBlock("p", td, [
        H[8] || (H[8] = e.createElementVNode(
          "i",
          { class: "ri-error-warning-line" },
          null,
          -1
          /* CACHED */
        )),
        e.createElementVNode(
          "span",
          null,
          e.toDisplayString(b.value),
          1
          /* TEXT */
        ),
        e.createElementVNode(
          "button",
          {
            type: "button",
            class: "ss-link",
            onClick: P
          },
          e.toDisplayString(I.$t("重试")),
          1
          /* TEXT */
        )
      ])) : e.createCommentVNode("v-if", !0),
      e.createElementVNode("div", ld, [
        e.createElementVNode("aside", nd, [
          e.createElementVNode("div", od, [
            (e.openBlock(), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(p, (f) => e.createElementVNode("button", {
                key: f.key,
                type: "button",
                class: e.normalizeClass(["mm-chip", { on: o.value === f.key }]),
                "data-test": `mm-meeting-filter-${f.key}`,
                onClick: (d) => o.value = f.key
              }, [
                e.createTextVNode(
                  e.toDisplayString(f.title) + " ",
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(N.value[f.key]),
                  1
                  /* TEXT */
                )
              ], 10, ad)),
              64
              /* STABLE_FRAGMENT */
            ))
          ]),
          i.value && !a.all.length ? (e.openBlock(), e.createElementBlock("p", sd, [
            H[9] || (H[9] = e.createElementVNode(
              "i",
              { class: "ri-loader-4-line spin" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(I.$t("正在加载会议…")),
              1
              /* TEXT */
            )
          ])) : T.value.length ? (e.openBlock(!0), e.createElementBlock(
            e.Fragment,
            { key: 2 },
            e.renderList(U.value, (f) => (e.openBlock(), e.createElementBlock(
              e.Fragment,
              {
                key: f.key
              },
              [
                f.items.length ? (e.openBlock(), e.createElementBlock("div", id, [
                  e.createElementVNode(
                    "span",
                    null,
                    e.toDisplayString(f.title),
                    1
                    /* TEXT */
                  ),
                  H[10] || (H[10] = e.createElementVNode(
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
                  e.renderList(f.items, (d) => (e.openBlock(), e.createElementBlock("div", {
                    key: d.id,
                    role: "button",
                    tabindex: "0",
                    class: e.normalizeClass(["mm-mcard", { on: d.id === r.value }]),
                    "data-test": `mm-meeting-${d.id}`,
                    onClick: (u) => R(d.id),
                    onKeydown: [
                      e.withKeys(e.withModifiers((u) => R(d.id), ["self"]), ["enter"]),
                      e.withKeys(e.withModifiers((u) => R(d.id), ["self", "prevent"]), ["space"])
                    ]
                  }, [
                    e.createElementVNode("span", dd, [
                      e.createElementVNode(
                        "span",
                        md,
                        e.toDisplayString(d.title),
                        1
                        /* TEXT */
                      ),
                      d.needsMe ? (e.openBlock(), e.createElementBlock("i", {
                        key: 0,
                        class: "mm-mcard__dot",
                        title: I.$t("需要我处理")
                      }, null, 8, ud)) : e.createCommentVNode("v-if", !0),
                      d.canDelete !== !1 ? (e.openBlock(), e.createElementBlock("button", {
                        key: 1,
                        type: "button",
                        class: "mm-mcard__del",
                        disabled: k.value === d.id,
                        title: I.$t("删除会议"),
                        "aria-label": I.$t("删除会议"),
                        "data-test": `mm-meeting-delete-${d.id}`,
                        onClick: e.withModifiers((u) => S(d), ["stop"])
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
                      ], 8, pd)) : e.createCommentVNode("v-if", !0)
                    ]),
                    e.createElementVNode("span", vd, [
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
                  ], 42, cd))),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ],
              64
              /* STABLE_FRAGMENT */
            ))),
            128
            /* KEYED_FRAGMENT */
          )) : (e.openBlock(), e.createElementBlock("div", rd, [
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(c.value.trim() ? I.$t("没有找到匹配的会议") : o.value === "all" ? I.$t("还没有参加过会议") : I.$t("这个筛选下没有会议")),
              1
              /* TEXT */
            ),
            o.value === "all" && !c.value.trim() ? (e.openBlock(), e.createElementBlock(
              "button",
              {
                key: 0,
                type: "button",
                class: "ss-link",
                onClick: H[2] || (H[2] = (f) => m.value = !0)
              },
              e.toDisplayString(I.$t("新建会议")),
              1
              /* TEXT */
            )) : e.createCommentVNode("v-if", !0)
          ]))
        ]),
        r.value ? (e.openBlock(), e.createBlock(uc, {
          key: r.value,
          ref_key: "detailRef",
          ref: h,
          "meeting-id": r.value,
          focus: g.value,
          onChanged: A,
          onRole: H[3] || (H[3] = (f) => y("role", f))
        }, null, 8, ["meeting-id", "focus"])) : (e.openBlock(), e.createElementBlock("section", kd, [
          H[11] || (H[11] = e.createElementVNode(
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
            e.toDisplayString(a.all.length ? I.$t("选择左侧的会议查看详情") : I.$t("新建一场会议，上传录音或文字记录后自动整理纪要")),
            1
            /* TEXT */
          )
        ]))
      ]),
      m.value ? (e.openBlock(), e.createBlock(Ft, {
        key: 1,
        onClose: H[4] || (H[4] = (f) => m.value = !1),
        onCreated: _
      })) : e.createCommentVNode("v-if", !0)
    ]));
  }
}), gd = /* @__PURE__ */ ae(yd, [["__scopeId", "data-v-25e61bf0"]]), fd = ["title"], Nd = { class: "mm-pc__name" }, Vd = { class: "mm-pc__dept" }, Ed = /* @__PURE__ */ e.defineComponent({
  __name: "PersonChip",
  props: {
    name: {},
    dept: {},
    plain: { type: Boolean }
  },
  setup(l) {
    const v = l, n = e.computed(() => re(v.name));
    return (p, y) => (e.openBlock(), e.createElementBlock("span", {
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
        Nd,
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
            Vd,
            e.toDisplayString(l.dept),
            1
            /* TEXT */
          )
        ],
        64
        /* STABLE_FRAGMENT */
      )) : e.createCommentVNode("v-if", !0)
    ], 10, fd));
  }
}), ze = /* @__PURE__ */ ae(Ed, [["__scopeId", "data-v-4f4c03f2"]]), $d = { class: "mm-tt" }, bd = {
  class: "mm-tt__head",
  "aria-hidden": "true"
}, hd = {
  key: 0,
  class: "mm-tt__empty"
}, _d = { class: "mm-tt__group" }, Bd = ["data-test", "onClick"], Sd = ["data-test", "onClick"], Dd = { class: "mm-tt__title" }, wd = { key: 0 }, Cd = { class: "mm-tt__prog" }, Td = /* @__PURE__ */ e.defineComponent({
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
    const n = l, p = v, y = e.computed(() => $l(n.tasks, n.groupBy)), s = e.reactive({}), o = (i) => (i.key in s ? s[i.key] : i.collapsedByDefault) && !(n.selectedId && i.tasks.some((k) => k.id === n.selectedId) && !(i.key in s));
    function c(i) {
      s[i.key] = !o(i);
    }
    return (i, k) => (e.openBlock(), e.createElementBlock("div", $d, [
      e.createElementVNode("div", bd, [
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
        hd,
        e.toDisplayString(l.emptyText || i.$t("没有任务")),
        1
        /* TEXT */
      )),
      (e.openBlock(!0), e.createElementBlock(
        e.Fragment,
        null,
        e.renderList(y.value, (b) => (e.openBlock(), e.createElementBlock(
          e.Fragment,
          {
            key: b.key
          },
          [
            e.createElementVNode("div", _d, [
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
                onClick: (m) => c(b)
              }, [
                e.createTextVNode(
                  e.toDisplayString(o(b) ? i.$t("展开") : i.$t("收起")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "i",
                  {
                    class: e.normalizeClass(o(b) ? "ri-arrow-down-s-line" : "ri-arrow-up-s-line"),
                    "aria-hidden": "true"
                  },
                  null,
                  2
                  /* CLASS */
                )
              ], 8, Bd)) : e.createCommentVNode("v-if", !0)
            ]),
            o(b) ? e.createCommentVNode("v-if", !0) : (e.openBlock(!0), e.createElementBlock(
              e.Fragment,
              { key: 0 },
              e.renderList(b.tasks, (m) => (e.openBlock(), e.createElementBlock("button", {
                key: m.id,
                type: "button",
                class: e.normalizeClass(["mm-tt__row", { on: m.id === l.selectedId, ended: m.status === "done" || m.status === "cancelled" }]),
                "data-test": `mm-task-row-${m.id}`,
                onClick: (r) => p("select", m)
              }, [
                e.createElementVNode("span", Dd, [
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
                      wd,
                      e.toDisplayString(i.$t("逾期 {n} 天", { n: m.overdueDays })),
                      1
                      /* TEXT */
                    )) : e.createCommentVNode("v-if", !0)
                  ],
                  2
                  /* CLASS */
                ),
                e.createElementVNode("span", Cd, [
                  e.createElementVNode(
                    "i",
                    {
                      class: e.normalizeClass(["mm-bar", { bad: m.overdue }])
                    },
                    [
                      e.createElementVNode(
                        "b",
                        {
                          style: e.normalizeStyle({ width: `${e.unref(Ne)(m.percent)}%` })
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
                    e.toDisplayString(e.unref(Ne)(m.percent)) + "%",
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
              ], 10, Sd))),
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
}), Pt = /* @__PURE__ */ ae(Td, [["__scopeId", "data-v-f1ba1ed1"]]), be = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/composables/useDialog.ts"];
if (!be) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/composables/useDialog.ts");
be.default;
const Id = {
  class: "mm-ob",
  "data-test": "mm-objection-panel"
}, Md = {
  key: 0,
  class: "ss-note danger"
}, Ad = { class: "mm-ob__title" }, jd = { class: "ss-chip" }, Ld = { class: "mm-ob__sides" }, zd = {
  class: "mm-ob__side raiser",
  "data-test": "mm-ob-raiser"
}, Fd = {
  key: 0,
  class: "strong"
}, Pd = {
  class: "mm-ob__side owner",
  "data-test": "mm-ob-owner"
}, Ud = {
  key: 0,
  class: "strong"
}, Od = {
  key: 1,
  class: "muted"
}, Rd = { key: 2 }, qd = {
  key: 0,
  class: "mm-ob__box",
  "data-test": "mm-ob-review"
}, Kd = { class: "sub" }, Hd = { class: "mm-ob__btns" }, Wd = ["disabled"], Gd = ["disabled"], Yd = ["disabled"], Jd = {
  key: 1,
  class: "mm-ob__box",
  "data-test": "mm-ob-reply"
}, Qd = { class: "sub" }, Zd = { class: "mm-ob__btns" }, Xd = ["disabled"], xd = ["disabled"], em = {
  key: 2,
  class: "mm-ob__box",
  "data-test": "mm-ob-arbitrate"
}, tm = { class: "sub" }, lm = { class: "mm-ob__btns" }, nm = ["disabled"], om = ["disabled"], am = ["disabled"], sm = {
  key: 3,
  class: "ss-note info"
}, rm = {
  key: 4,
  class: "mm-ob__form",
  "data-test": "mm-ob-form"
}, im = { class: "ss-muted" }, cm = { class: "ss-field" }, dm = { class: "ss-field" }, mm = { class: "ss-field" }, um = { class: "ss-field" }, pm = ["placeholder"], vm = { class: "ss-actions" }, km = ["disabled"], ym = {
  key: 2,
  class: "ss-empty"
}, gm = {
  key: 3,
  class: "mm-ob__hist"
}, fm = { class: "ss-chip" }, Nm = { class: "mm-ob__log" }, Vm = {
  key: 0,
  class: "ss-muted"
}, Em = {
  key: 1,
  class: "mm-tl",
  "data-test": "mm-ob-log"
}, $m = /* @__PURE__ */ e.defineComponent({
  __name: "ObjectionPanel",
  props: {
    task: {},
    can: {},
    names: {}
  },
  emits: ["changed"],
  setup(l, { emit: v }) {
    const n = l, p = v, y = {
      review_adopt: t.t("采纳并调整"),
      review_reject: t.t("驳回并说明"),
      arb_keep: t.t("维持原方案"),
      arb_adjust: t.t("按异议调整")
    }, s = be.useDialog(), o = ie.useNotificationStore(), c = e.ref(!1), i = e.ref(""), k = e.ref(""), b = e.ref(""), m = e.reactive({ title: "", standard: "", due: "" }), r = e.computed(() => Ce(n.task) ? n.task.objection : null), g = e.computed(() => ct(n.names, r.value?.raisedBy, n.task.assigneeName)), h = e.computed(() => {
      const _ = r.value?.review;
      return _ ? _.decision === "adopt" ? t.t("已采纳") : t.t("已驳回") : t.t("待复核");
    }), a = e.computed(() => !!(n.can.review || n.can.reply || n.can.escalate || n.can.arbitrate)), N = e.computed(() => {
      const _ = r.value?.stage;
      return _ === "review" ? t.t("等待任务负责人 {name} 复核", { name: n.task.ownerName }) : _ === "dept_reply" ? t.t("任务负责人已驳回，等待部门负责人 {name} 接受驳回或提交裁决", { name: g.value }) : _ === "arbitration" ? t.t("已提交裁决，等待项目负责人裁决") : "";
    }), T = e.computed(() => [...n.task.objectionHistory ?? []].sort((_, S) => (S.resolvedAt || S.raisedAt) - (_.resolvedAt || _.raisedAt))), U = e.computed(() => Sl(n.task.events));
    e.watch(() => [n.task.id, r.value?.stage], () => {
      k.value = "", i.value = "";
    });
    function j(_) {
      Object.assign(m, Cl(n.task)), b.value = "", k.value = _;
    }
    async function D(_, S, E) {
      c.value = !0, i.value = "";
      try {
        return await J(_, S), o.success(E), k.value = "", p("changed"), !0;
      } catch (M) {
        return i.value = X.errorMessage(M), !1;
      } finally {
        c.value = !1;
      }
    }
    async function A() {
      const _ = n.task.id, S = b.value.trim(), E = wl(m, n.task);
      switch (k.value) {
        case "review_adopt":
          await D("task.objection.review", { id: _, decision: "adopt", note: S, changes: E }, t.t("已采纳，任务回到待接收，等待部门负责人重新确认"));
          break;
        case "review_reject":
          await D("task.objection.review", { id: _, decision: "reject", note: S }, t.t("已驳回，等待部门负责人回应"));
          break;
        case "arb_keep":
          await D("task.objection.arbitrate", { id: _, decision: "keep", note: S }, t.t("已裁决：维持原方案"));
          break;
        case "arb_adjust":
          await D("task.objection.arbitrate", { id: _, decision: "adjust", note: S, changes: E }, t.t("已裁决：按异议调整"));
          break;
      }
    }
    async function P(_) {
      await s.confirm(_ === "accept" ? { title: t.t("接受驳回"), message: t.t("接受后异议结束，任务回到发起前的状态，按原方案执行。") } : { title: t.t("提交裁决"), message: t.t("提交后由项目负责人裁决，裁决结果为最终结果。") }) && await D("task.objection.reply", { id: n.task.id, decision: _ }, _ === "accept" ? t.t("已接受驳回") : t.t("已提交项目负责人裁决"));
    }
    async function R(_) {
      const S = await s.prompt({
        title: t.t("删除该任务"),
        message: t.t("删除后任务变为「已取消」（终态，结项时视同完成），并通知相关负责人。请写明原因："),
        placeholder: t.t("例如：该事项已并入其它任务"),
        confirmLabel: t.t("删除任务")
      });
      if (S === null) return;
      const E = S.trim() || t.t("删除该任务");
      _ === "review" ? await D("task.objection.review", { id: n.task.id, decision: "adopt", note: E, changes: { cancel: !0 } }, t.t("任务已删除")) : await D("task.objection.arbitrate", { id: n.task.id, decision: "adjust", note: E, changes: { cancel: !0 } }, t.t("任务已删除"));
    }
    return (_, S) => (e.openBlock(), e.createElementBlock("div", Id, [
      i.value ? (e.openBlock(), e.createElementBlock("p", Md, [
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
          e.createElementVNode("h4", Ad, [
            e.createTextVNode(
              e.toDisplayString(_.$t("当前分歧：{t}", { t: e.unref(at)[r.value.target] })) + " ",
              1
              /* TEXT */
            ),
            e.createElementVNode(
              "span",
              jd,
              e.toDisplayString(r.value.kind === "change" ? _.$t("执行中申请变更") : _.$t("接收时提出异议")),
              1
              /* TEXT */
            )
          ]),
          e.createElementVNode("div", Ld, [
            e.createElementVNode("article", zd, [
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
                e.toDisplayString(r.value.reason),
                1
                /* TEXT */
              ),
              r.value.suggestion || r.value.suggestedDue ? (e.openBlock(), e.createElementBlock("p", Fd, [
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
                      e.toDisplayString(r.value.suggestion ? _.$t("，") : "") + e.toDisplayString(_.$t("建议截止调整为 {d}", { d: e.unref(ut)(r.value.suggestedDue) })),
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
            e.createElementVNode("article", Pd, [
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
                  e.toDisplayString(h.value),
                  1
                  /* TEXT */
                )
              ]),
              r.value.review ? (e.openBlock(), e.createElementBlock(
                "p",
                Ud,
                e.toDisplayString(r.value.review.note || "—"),
                1
                /* TEXT */
              )) : (e.openBlock(), e.createElementBlock(
                "p",
                Od,
                e.toDisplayString(_.$t("还没有复核意见")),
                1
                /* TEXT */
              )),
              r.value.review ? (e.openBlock(), e.createElementBlock(
                "time",
                Rd,
                e.toDisplayString(e.unref(Pe)(r.value.review.at)),
                1
                /* TEXT */
              )) : e.createCommentVNode("v-if", !0)
            ])
          ]),
          e.createCommentVNode(" 任务负责人复核 "),
          l.can.review ? (e.openBlock(), e.createElementBlock("section", qd, [
            e.createElementVNode(
              "h5",
              null,
              e.toDisplayString(_.$t("你的复核")),
              1
              /* TEXT */
            ),
            e.createElementVNode(
              "p",
              Kd,
              e.toDisplayString(_.$t("采纳后任务回到待接收，由部门负责人重新确认；驳回后由部门负责人决定接受驳回还是提交裁决")),
              1
              /* TEXT */
            ),
            e.createElementVNode("div", Hd, [
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn",
                disabled: c.value,
                "data-test": "mm-ob-reject",
                onClick: S[0] || (S[0] = (E) => j("review_reject"))
              }, e.toDisplayString(_.$t("驳回并说明")), 9, Wd),
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn primary",
                disabled: c.value,
                "data-test": "mm-ob-adopt",
                onClick: S[1] || (S[1] = (E) => j("review_adopt"))
              }, e.toDisplayString(_.$t("采纳并调整")), 9, Gd)
            ]),
            e.createElementVNode("button", {
              type: "button",
              class: "ss-link more",
              disabled: c.value,
              "data-test": "mm-ob-delete-review",
              onClick: S[2] || (S[2] = (E) => R("review"))
            }, [
              e.createTextVNode(
                e.toDisplayString(_.$t("更多：删除该任务")) + " ",
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
            ], 8, Yd)
          ])) : e.createCommentVNode("v-if", !0),
          e.createCommentVNode(" 部门负责人回应驳回 "),
          l.can.reply || l.can.escalate ? (e.openBlock(), e.createElementBlock("section", Jd, [
            e.createElementVNode(
              "h5",
              null,
              e.toDisplayString(_.$t("任务负责人驳回了你的异议")),
              1
              /* TEXT */
            ),
            e.createElementVNode(
              "p",
              Qd,
              e.toDisplayString(_.$t("接受驳回则回到发起前的状态按原方案执行；不接受可以提交项目负责人裁决")),
              1
              /* TEXT */
            ),
            e.createElementVNode("div", Zd, [
              l.can.reply ? (e.openBlock(), e.createElementBlock("button", {
                key: 0,
                type: "button",
                class: "ss-btn",
                disabled: c.value,
                "data-test": "mm-ob-accept-reject",
                onClick: S[3] || (S[3] = (E) => P("accept"))
              }, e.toDisplayString(_.$t("接受驳回")), 9, Xd)) : e.createCommentVNode("v-if", !0),
              l.can.escalate ? (e.openBlock(), e.createElementBlock("button", {
                key: 1,
                type: "button",
                class: "ss-btn primary",
                disabled: c.value,
                "data-test": "mm-ob-escalate",
                onClick: S[4] || (S[4] = (E) => P("escalate"))
              }, e.toDisplayString(_.$t("提交裁决")), 9, xd)) : e.createCommentVNode("v-if", !0)
            ])
          ])) : e.createCommentVNode("v-if", !0),
          e.createCommentVNode(" 项目负责人裁决 "),
          l.can.arbitrate ? (e.openBlock(), e.createElementBlock("section", em, [
            e.createElementVNode(
              "h5",
              null,
              e.toDisplayString(_.$t("你的裁决（最终结果）")),
              1
              /* TEXT */
            ),
            e.createElementVNode(
              "p",
              tm,
              e.toDisplayString(_.$t("裁决后通知任务负责人和部门负责人，记入总结报告")),
              1
              /* TEXT */
            ),
            e.createElementVNode("div", lm, [
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn",
                disabled: c.value,
                "data-test": "mm-ob-keep",
                onClick: S[5] || (S[5] = (E) => j("arb_keep"))
              }, e.toDisplayString(_.$t("维持原方案")), 9, nm),
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn primary",
                disabled: c.value,
                "data-test": "mm-ob-adjust",
                onClick: S[6] || (S[6] = (E) => j("arb_adjust"))
              }, e.toDisplayString(_.$t("按异议调整")), 9, om)
            ]),
            e.createElementVNode("button", {
              type: "button",
              class: "ss-link more",
              disabled: c.value,
              "data-test": "mm-ob-delete-arbitrate",
              onClick: S[7] || (S[7] = (E) => R("arbitrate"))
            }, [
              e.createTextVNode(
                e.toDisplayString(_.$t("更多：删除该任务")) + " ",
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
            ], 8, am)
          ])) : e.createCommentVNode("v-if", !0),
          a.value ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock("p", sm, [
            S[16] || (S[16] = e.createElementVNode(
              "i",
              { class: "ri-time-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(N.value),
              1
              /* TEXT */
            )
          ])),
          e.createCommentVNode(" 复核 / 裁决的说明与调整内容 "),
          k.value ? (e.openBlock(), e.createElementBlock("section", rm, [
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
                  im,
                  e.toDisplayString(_.$t("按异议改好任务内容；没改的项保持原样。")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode("label", cm, [
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
                      "onUpdate:modelValue": S[8] || (S[8] = (E) => m.title = E),
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
                e.createElementVNode("label", dm, [
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
                      "onUpdate:modelValue": S[9] || (S[9] = (E) => m.standard = E),
                      rows: "2"
                    },
                    null,
                    512
                    /* NEED_PATCH */
                  ), [
                    [e.vModelText, m.standard]
                  ])
                ]),
                e.createElementVNode("label", mm, [
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
                      "onUpdate:modelValue": S[10] || (S[10] = (E) => m.due = E),
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
            e.createElementVNode("label", um, [
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(k.value === "review_reject" ? _.$t("驳回理由") : _.$t("说明（可选）")),
                1
                /* TEXT */
              ),
              e.withDirectives(e.createElementVNode("textarea", {
                "onUpdate:modelValue": S[11] || (S[11] = (E) => b.value = E),
                rows: "3",
                placeholder: k.value === "review_reject" ? _.$t("写明为什么维持原方案，部门负责人会看到") : "",
                "data-test": "mm-ob-note"
              }, null, 8, pm), [
                [e.vModelText, b.value]
              ])
            ]),
            e.createElementVNode("div", vm, [
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn primary sm",
                disabled: c.value || k.value === "review_reject" && !b.value.trim(),
                "data-test": "mm-ob-submit",
                onClick: A
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
                  e.toDisplayString(_.$t("确认")),
                  1
                  /* TEXT */
                )
              ], 8, km),
              e.createElementVNode(
                "button",
                {
                  type: "button",
                  class: "ss-link",
                  onClick: S[12] || (S[12] = (E) => k.value = "")
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
        ym,
        e.toDisplayString(_.$t("当前没有处理中的异议")),
        1
        /* TEXT */
      )),
      T.value.length ? (e.openBlock(), e.createElementBlock("section", gm, [
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
            e.renderList(T.value, (E) => (e.openBlock(), e.createElementBlock("li", {
              key: E.id
            }, [
              e.createElementVNode(
                "span",
                fm,
                e.toDisplayString(E.kind === "change" ? _.$t("变更申请") : _.$t("异议")) + " · " + e.toDisplayString(e.unref(at)[E.target]),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(E.reason),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "span",
                {
                  class: e.normalizeClass(["ss-chip", E.outcome === "adopted" || E.outcome === "adjusted" ? "ok" : E.outcome === "cancelled" ? "bad" : ""])
                },
                e.toDisplayString(e.unref(Dl)(E.outcome)),
                3
                /* TEXT, CLASS */
              ),
              e.createElementVNode(
                "time",
                null,
                e.toDisplayString(e.unref(Pe)(E.resolvedAt || E.raisedAt)),
                1
                /* TEXT */
              )
            ]))),
            128
            /* KEYED_FRAGMENT */
          ))
        ])
      ])) : e.createCommentVNode("v-if", !0),
      e.createElementVNode("section", Nm, [
        e.createElementVNode(
          "h4",
          null,
          e.toDisplayString(_.$t("变更记录")),
          1
          /* TEXT */
        ),
        U.value.length ? (e.openBlock(), e.createElementBlock("ol", Em, [
          (e.openBlock(!0), e.createElementBlock(
            e.Fragment,
            null,
            e.renderList(U.value, (E, M) => (e.openBlock(), e.createElementBlock("li", { key: M }, [
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
                    e.toDisplayString(e.unref(ct)(l.names, E.by, E.by)),
                    1
                    /* TEXT */
                  ),
                  e.createTextVNode(
                    " " + e.toDisplayString(e.unref(Bl)(E)),
                    1
                    /* TEXT */
                  ),
                  E.note ? (e.openBlock(), e.createElementBlock(
                    e.Fragment,
                    { key: 0 },
                    [
                      e.createTextVNode(
                        e.toDisplayString(_.$t("：")) + e.toDisplayString(E.note),
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
                  e.toDisplayString(e.unref(Pe)(E.at)),
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
          Vm,
          e.toDisplayString(_.$t("没有变更记录")),
          1
          /* TEXT */
        ))
      ])
    ]));
  }
}), bm = /* @__PURE__ */ ae($m, [["__scopeId", "data-v-16692f6c"]]), hm = ["aria-label"], _m = ["aria-label"], Bm = {
  key: 0,
  class: "mm-td__loading"
}, Sm = {
  key: 1,
  class: "ss-note danger"
}, Dm = { class: "mm-td__head" }, wm = { class: "mm-td__meta" }, Cm = {
  class: "mm-td__tabs",
  role: "tablist"
}, Tm = ["aria-selected", "data-test", "onClick"], Im = ["aria-label"], Mm = { class: "mm-td__body" }, Am = {
  key: 0,
  class: "mm-td__dl"
}, jm = { class: "pre" }, Lm = { class: "pre" }, zm = { class: "mm-td__prog" }, Fm = { class: "mm-td__log" }, Pm = {
  key: 0,
  class: "ss-empty"
}, Um = {
  key: 1,
  class: "mm-tl"
}, Om = {
  key: 0,
  class: "mm-tl__note"
}, Rm = {
  key: 3,
  class: "mm-td__form",
  "data-test": "mm-form-progress"
}, qm = { class: "mm-td__range" }, Km = { class: "mm-td__status" }, Hm = { class: "mm-tag brand" }, Wm = { class: "ss-field" }, Gm = ["placeholder"], Ym = { class: "ss-actions" }, Jm = ["disabled"], Qm = {
  key: 4,
  class: "mm-td__form",
  "data-test": "mm-form-complete"
}, Zm = { class: "ss-muted" }, Xm = { class: "ss-field" }, xm = ["placeholder"], eu = { class: "ss-actions" }, tu = ["disabled"], lu = {
  key: 5,
  class: "mm-td__form",
  "data-test": "mm-form-raise"
}, nu = { class: "ss-muted" }, ou = ["aria-label"], au = ["value"], su = { class: "ss-field" }, ru = ["placeholder"], iu = { class: "ss-field" }, cu = ["placeholder"], du = {
  key: 0,
  class: "ss-field"
}, mu = ["min"], uu = { class: "ss-actions" }, pu = ["disabled"], vu = {
  key: 0,
  class: "mm-td__foot"
}, ku = ["disabled"], yu = ["disabled"], gu = ["disabled"], fu = ["disabled"], Nu = ["disabled"], Vu = /* @__PURE__ */ e.defineComponent({
  __name: "TaskDetailPanel",
  props: {
    taskId: {},
    refreshSeq: { default: 0 }
  },
  emits: ["close", "changed", "role"],
  setup(l, { emit: v }) {
    const n = l, p = v, y = [
      { key: "detail", title: t.t("详情") },
      { key: "progress", title: t.t("进度记录") },
      { key: "objection", title: t.t("异议与变更") }
    ], s = ie.useNotificationStore(), o = e.ref(null), c = e.ref(!1), i = e.ref(!1), k = e.ref(""), b = e.ref("detail"), m = e.ref(""), r = e.reactive({ percent: 0, note: "" }), g = e.ref(""), h = e.reactive({ target: "time", reason: "", suggestion: "", suggestedDue: "" }), a = e.computed(() => o.value?.task ?? null), N = e.computed(() => o.value?.can ?? {}), T = e.computed(() => !!a.value && Ce(a.value)), U = e.computed(() => !!(N.value.accept || N.value.object || N.value.progress || N.value.complete || N.value.change)), j = e.computed(() => [...a.value?.progressLog ?? []].sort((f, d) => d.at - f.at)), D = e.computed(() => N.value.object ? t.t("提出异议") : t.t("申请变更")), A = (f) => f === "done" ? "ok" : f === "in_progress" ? "brand" : f === "to_accept" ? "warn" : "";
    async function P(f) {
      if (n.taskId) {
        c.value = !0, k.value = "";
        try {
          const d = await J("task.get", { id: n.taskId });
          o.value = d, p("role", Il(d.task, oe.value?.me.person?.id, d.project?.ownerId, d.can)), f && (b.value = Tl(d.task, d.can), m.value = "");
        } catch (d) {
          k.value = X.errorMessage(d), f && (o.value = null);
        } finally {
          c.value = !1;
        }
      }
    }
    e.watch(() => n.taskId, () => {
      P(!0);
    }, { immediate: !0 }), e.watch(() => n.refreshSeq, () => {
      P(!1);
    });
    function R(f) {
      const d = a.value;
      d && (f === "progress" && Object.assign(r, { percent: Ne(d.percent), note: "" }), f === "complete" && (g.value = ""), f === "raise" && Object.assign(h, { target: "time", reason: "", suggestion: "", suggestedDue: "" }), m.value = f);
    }
    async function _(f, d, u) {
      i.value = !0, k.value = "";
      try {
        await J(f, d), s.success(u), m.value = "", await S();
      } catch (z) {
        k.value = X.errorMessage(z);
      } finally {
        i.value = !1;
      }
    }
    async function S() {
      await P(!1), p("changed");
    }
    function E() {
      return _("task.accept", { id: n.taskId }, t.t("已接收任务"));
    }
    function M() {
      const f = Math.max(0, Math.min(100, Math.round(Number(r.percent) || 0)));
      return _("task.progress", { id: n.taskId, percent: f, note: r.note.trim(), status: "in_progress" }, t.t("进度已更新"));
    }
    function I() {
      return _("task.complete", { id: n.taskId, note: g.value.trim() || void 0 }, t.t("已标记完成，已通知任务负责人"));
    }
    function H() {
      const f = {
        id: n.taskId,
        target: h.target,
        reason: h.reason.trim(),
        suggestion: h.suggestion.trim()
      };
      return h.target === "time" && h.suggestedDue && (f.suggestedDue = h.suggestedDue), _("task.objection.raise", f, t.t("已提交，等待任务负责人复核")).then(() => {
        k.value || (b.value = "objection");
      });
    }
    return (f, d) => (e.openBlock(), e.createElementBlock("aside", {
      class: "mm-td",
      "aria-label": f.$t("任务详情"),
      "data-test": "mm-task-detail"
    }, [
      e.createElementVNode("button", {
        type: "button",
        class: "mm-td__close",
        "aria-label": f.$t("关闭"),
        "data-test": "mm-task-detail-close",
        onClick: d[0] || (d[0] = (u) => p("close"))
      }, [...d[18] || (d[18] = [
        e.createElementVNode(
          "i",
          { class: "ri-close-line" },
          null,
          -1
          /* CACHED */
        )
      ])], 8, _m),
      c.value && !o.value ? (e.openBlock(), e.createElementBlock("p", Bm, [
        d[19] || (d[19] = e.createElementVNode(
          "i",
          { class: "ri-loader-4-line spin" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(f.$t("加载中…")),
          1
          /* TEXT */
        )
      ])) : e.createCommentVNode("v-if", !0),
      k.value ? (e.openBlock(), e.createElementBlock("p", Sm, [
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
          e.createElementVNode("header", Dm, [
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
            e.createElementVNode("p", wm, [
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
                e.toDisplayString(f.$t("任务负责人 {name}", { name: a.value.ownerName })),
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
                    e.toDisplayString(f.$t("截止 {d}", { d: e.unref(ut)(a.value.due) })),
                    1
                    /* TEXT */
                  ),
                  T.value ? (e.openBlock(), e.createElementBlock(
                    e.Fragment,
                    { key: 0 },
                    [
                      e.createTextVNode(
                        e.toDisplayString(f.$t("（处理期间照常计时）")),
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
                        " · " + e.toDisplayString(f.$t("逾期 {n} 天", { n: a.value.overdueDays })),
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
          e.createElementVNode("nav", Cm, [
            (e.openBlock(), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(y, (u) => e.createElementVNode("button", {
                key: u.key,
                type: "button",
                role: "tab",
                "aria-selected": b.value === u.key,
                class: e.normalizeClass({ on: b.value === u.key }),
                "data-test": `mm-td-tab-${u.key}`,
                onClick: (z) => b.value = u.key
              }, [
                e.createTextVNode(
                  e.toDisplayString(u.title),
                  1
                  /* TEXT */
                ),
                u.key === "objection" && T.value ? (e.openBlock(), e.createElementBlock("i", {
                  key: 0,
                  class: "mm-dot",
                  "aria-label": f.$t("有处理中的异议")
                }, null, 8, Im)) : e.createCommentVNode("v-if", !0)
              ], 10, Tm)),
              64
              /* STABLE_FRAGMENT */
            ))
          ]),
          e.createElementVNode("div", Mm, [
            e.createCommentVNode(" 详情 "),
            b.value === "detail" ? (e.openBlock(), e.createElementBlock("dl", Am, [
              e.createElementVNode(
                "dt",
                null,
                e.toDisplayString(f.$t("来源会议")),
                1
                /* TEXT */
              ),
              e.createElementVNode("dd", null, [
                e.createElementVNode(
                  "button",
                  {
                    type: "button",
                    class: "ss-link",
                    onClick: d[1] || (d[1] = (u) => e.unref(de)({ kind: "meeting", id: a.value.meetingId }))
                  },
                  e.toDisplayString(a.value.meetingTitle || "—"),
                  1
                  /* TEXT */
                )
              ]),
              e.createElementVNode(
                "dt",
                null,
                e.toDisplayString(f.$t("所属项目")),
                1
                /* TEXT */
              ),
              e.createElementVNode("dd", null, [
                e.createElementVNode(
                  "button",
                  {
                    type: "button",
                    class: "ss-link",
                    onClick: d[2] || (d[2] = (u) => e.unref(de)({ kind: "project", id: a.value.projectId }))
                  },
                  e.toDisplayString(a.value.projectName || "—"),
                  1
                  /* TEXT */
                )
              ]),
              e.createElementVNode(
                "dt",
                null,
                e.toDisplayString(f.$t("责任部门")),
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
                e.toDisplayString(f.$t("任务负责人")),
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
                e.toDisplayString(f.$t("执行事项")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "dd",
                jm,
                e.toDisplayString(a.value.title),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "dt",
                null,
                e.toDisplayString(f.$t("交付标准")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "dd",
                Lm,
                e.toDisplayString(a.value.standard || "—"),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "dt",
                null,
                e.toDisplayString(f.$t("完成时间")),
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
                        e.toDisplayString(f.$t("（逾期 {n} 天）", { n: a.value.overdueDays })),
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
                e.toDisplayString(f.$t("当前进度")),
                1
                /* TEXT */
              ),
              e.createElementVNode("dd", zm, [
                e.createElementVNode(
                  "i",
                  {
                    class: e.normalizeClass(["mm-bar", { bad: a.value.overdue }])
                  },
                  [
                    e.createElementVNode(
                      "b",
                      {
                        style: e.normalizeStyle({ width: `${e.unref(Ne)(a.value.percent)}%` })
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
                  e.toDisplayString(e.unref(Ne)(a.value.percent)) + "%",
                  1
                  /* TEXT */
                )
              ]),
              e.createElementVNode(
                "dt",
                null,
                e.toDisplayString(f.$t("下发时间")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "dd",
                null,
                e.toDisplayString(e.unref(Ve)(a.value.createdAt)),
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
                    e.toDisplayString(f.$t("接收时间")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "dd",
                    null,
                    e.toDisplayString(e.unref(Ve)(a.value.acceptedAt)),
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
                    e.toDisplayString(f.$t("完成于")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "dd",
                    null,
                    e.toDisplayString(e.unref(Ve)(a.value.doneAt)),
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
                e.createElementVNode("div", Fm, [
                  j.value.length ? (e.openBlock(), e.createElementBlock("ol", Um, [
                    (e.openBlock(!0), e.createElementBlock(
                      e.Fragment,
                      null,
                      e.renderList(j.value, (u, z) => (e.openBlock(), e.createElementBlock("li", { key: z }, [
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
                              e.toDisplayString(e.unref(ct)(o.value.names, u.by, u.by)),
                              1
                              /* TEXT */
                            ),
                            e.createTextVNode(
                              " " + e.toDisplayString(f.$t("更新进度到 {n}%", { n: e.unref(Ne)(u.percent) })) + " · ",
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "span",
                              {
                                class: e.normalizeClass(["mm-tag sm", A(u.status)])
                              },
                              e.toDisplayString(e.unref(Ue)[u.status]),
                              3
                              /* TEXT, CLASS */
                            )
                          ]),
                          u.note ? (e.openBlock(), e.createElementBlock(
                            "p",
                            Om,
                            e.toDisplayString(u.note),
                            1
                            /* TEXT */
                          )) : e.createCommentVNode("v-if", !0),
                          e.createElementVNode(
                            "time",
                            null,
                            e.toDisplayString(e.unref(Pe)(u.at)),
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
                    Pm,
                    e.toDisplayString(f.$t("还没有进度记录")),
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
                e.createVNode(bm, {
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
            m.value === "progress" ? (e.openBlock(), e.createElementBlock("section", Rm, [
              e.createElementVNode(
                "h4",
                null,
                e.toDisplayString(f.$t("更新进度")),
                1
                /* TEXT */
              ),
              e.createElementVNode("label", qm, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(f.$t("完成百分比")),
                  1
                  /* TEXT */
                ),
                e.withDirectives(e.createElementVNode(
                  "input",
                  {
                    "onUpdate:modelValue": d[3] || (d[3] = (u) => r.percent = u),
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
                    "onUpdate:modelValue": d[4] || (d[4] = (u) => r.percent = u),
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
              e.createElementVNode("p", Km, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(f.$t("状态")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "span",
                  Hm,
                  e.toDisplayString(e.unref(Ue).in_progress),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "small",
                  null,
                  e.toDisplayString(a.value.status === "not_started" ? f.$t("第一次更新进度后，任务从「未开始」变为「进行中」；做完了用「标记完成」") : f.$t("做完了用「标记完成」")),
                  1
                  /* TEXT */
                )
              ]),
              e.createElementVNode("label", Wm, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(f.$t("说明")),
                  1
                  /* TEXT */
                ),
                e.withDirectives(e.createElementVNode("textarea", {
                  "onUpdate:modelValue": d[5] || (d[5] = (u) => r.note = u),
                  rows: "3",
                  placeholder: f.$t("这周做了什么、遇到什么问题"),
                  "data-test": "mm-progress-note"
                }, null, 8, Gm), [
                  [e.vModelText, r.note]
                ])
              ]),
              e.createElementVNode("div", Ym, [
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
                    e.toDisplayString(f.$t("提交进度")),
                    1
                    /* TEXT */
                  )
                ], 8, Jm),
                e.createElementVNode(
                  "button",
                  {
                    type: "button",
                    class: "ss-link",
                    onClick: d[6] || (d[6] = (u) => m.value = "")
                  },
                  e.toDisplayString(f.$t("取消")),
                  1
                  /* TEXT */
                )
              ])
            ])) : e.createCommentVNode("v-if", !0),
            m.value === "complete" ? (e.openBlock(), e.createElementBlock("section", Qm, [
              e.createElementVNode(
                "h4",
                null,
                e.toDisplayString(f.$t("标记完成")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "p",
                Zm,
                e.toDisplayString(f.$t("标记后通知任务负责人 {name}；完成后不能再改进度。", { name: a.value.ownerName })),
                1
                /* TEXT */
              ),
              e.createElementVNode("label", Xm, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(f.$t("完成说明（可选）")),
                  1
                  /* TEXT */
                ),
                e.withDirectives(e.createElementVNode("textarea", {
                  "onUpdate:modelValue": d[7] || (d[7] = (u) => g.value = u),
                  rows: "3",
                  placeholder: f.$t("交付物放在哪里、和交付标准的对照")
                }, null, 8, xm), [
                  [e.vModelText, g.value]
                ])
              ]),
              e.createElementVNode("div", eu, [
                e.createElementVNode("button", {
                  type: "button",
                  class: "ss-btn primary sm",
                  disabled: i.value,
                  "data-test": "mm-complete-submit",
                  onClick: I
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
                    e.toDisplayString(f.$t("确认完成")),
                    1
                    /* TEXT */
                  )
                ], 8, tu),
                e.createElementVNode(
                  "button",
                  {
                    type: "button",
                    class: "ss-link",
                    onClick: d[8] || (d[8] = (u) => m.value = "")
                  },
                  e.toDisplayString(f.$t("取消")),
                  1
                  /* TEXT */
                )
              ])
            ])) : e.createCommentVNode("v-if", !0),
            m.value === "raise" ? (e.openBlock(), e.createElementBlock("section", lu, [
              e.createElementVNode(
                "h4",
                null,
                e.toDisplayString(D.value),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "p",
                nu,
                e.toDisplayString(f.$t("提交后由任务负责人 {name} 复核；处理期间任务照常计时，原截止日有效。", { name: a.value.ownerName })),
                1
                /* TEXT */
              ),
              e.createElementVNode("div", {
                class: "mm-td__radios",
                role: "radiogroup",
                "aria-label": f.$t("分歧点")
              }, [
                (e.openBlock(!0), e.createElementBlock(
                  e.Fragment,
                  null,
                  e.renderList(e.unref(at), (u, z) => (e.openBlock(), e.createElementBlock(
                    "label",
                    {
                      key: z,
                      class: e.normalizeClass({ on: h.target === z })
                    },
                    [
                      e.withDirectives(e.createElementVNode("input", {
                        "onUpdate:modelValue": d[9] || (d[9] = (Q) => h.target = Q),
                        type: "radio",
                        value: z
                      }, null, 8, au), [
                        [e.vModelRadio, h.target]
                      ]),
                      e.createTextVNode(
                        e.toDisplayString(u),
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
              ], 8, ou),
              e.createElementVNode("label", su, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(f.$t("原因")),
                  1
                  /* TEXT */
                ),
                e.withDirectives(e.createElementVNode("textarea", {
                  "onUpdate:modelValue": d[10] || (d[10] = (u) => h.reason = u),
                  rows: "3",
                  placeholder: f.$t("为什么按原方案做不了"),
                  "data-test": "mm-raise-reason"
                }, null, 8, ru), [
                  [e.vModelText, h.reason]
                ])
              ]),
              e.createElementVNode("label", iu, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(f.$t("建议")),
                  1
                  /* TEXT */
                ),
                e.withDirectives(e.createElementVNode("textarea", {
                  "onUpdate:modelValue": d[11] || (d[11] = (u) => h.suggestion = u),
                  rows: "2",
                  placeholder: f.$t("你建议怎么调整"),
                  "data-test": "mm-raise-suggestion"
                }, null, 8, cu), [
                  [e.vModelText, h.suggestion]
                ])
              ]),
              h.target === "time" ? (e.openBlock(), e.createElementBlock("label", du, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(f.$t("建议的新截止日")),
                  1
                  /* TEXT */
                ),
                e.withDirectives(e.createElementVNode("input", {
                  "onUpdate:modelValue": d[12] || (d[12] = (u) => h.suggestedDue = u),
                  type: "date",
                  min: e.unref(hl)(),
                  "data-test": "mm-raise-due"
                }, null, 8, mu), [
                  [e.vModelText, h.suggestedDue]
                ])
              ])) : e.createCommentVNode("v-if", !0),
              e.createElementVNode("div", uu, [
                e.createElementVNode("button", {
                  type: "button",
                  class: "ss-btn primary sm",
                  disabled: i.value || !h.reason.trim() || !h.suggestion.trim(),
                  "data-test": "mm-raise-submit",
                  onClick: H
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
                    e.toDisplayString(f.$t("提交")),
                    1
                    /* TEXT */
                  )
                ], 8, pu),
                e.createElementVNode(
                  "button",
                  {
                    type: "button",
                    class: "ss-link",
                    onClick: d[13] || (d[13] = (u) => m.value = "")
                  },
                  e.toDisplayString(f.$t("取消")),
                  1
                  /* TEXT */
                )
              ])
            ])) : e.createCommentVNode("v-if", !0)
          ]),
          U.value && !m.value ? (e.openBlock(), e.createElementBlock("footer", vu, [
            N.value.accept ? (e.openBlock(), e.createElementBlock("button", {
              key: 0,
              type: "button",
              class: "ss-btn primary",
              disabled: i.value,
              "data-test": "mm-task-accept",
              onClick: E
            }, [
              d[25] || (d[25] = e.createElementVNode(
                "i",
                { class: "ri-checkbox-circle-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(f.$t("接收任务")),
                1
                /* TEXT */
              )
            ], 8, ku)) : e.createCommentVNode("v-if", !0),
            N.value.object ? (e.openBlock(), e.createElementBlock("button", {
              key: 1,
              type: "button",
              class: "ss-btn",
              disabled: i.value,
              "data-test": "mm-task-object",
              onClick: d[14] || (d[14] = (u) => R("raise"))
            }, [
              d[26] || (d[26] = e.createElementVNode(
                "i",
                { class: "ri-question-answer-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(f.$t("提出异议")),
                1
                /* TEXT */
              )
            ], 8, yu)) : e.createCommentVNode("v-if", !0),
            N.value.progress ? (e.openBlock(), e.createElementBlock("button", {
              key: 2,
              type: "button",
              class: "ss-btn primary",
              disabled: i.value,
              "data-test": "mm-task-progress",
              onClick: d[15] || (d[15] = (u) => R("progress"))
            }, [
              d[27] || (d[27] = e.createElementVNode(
                "i",
                { class: "ri-line-chart-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(f.$t("更新进度")),
                1
                /* TEXT */
              )
            ], 8, gu)) : e.createCommentVNode("v-if", !0),
            N.value.complete ? (e.openBlock(), e.createElementBlock("button", {
              key: 3,
              type: "button",
              class: "ss-btn",
              disabled: i.value,
              "data-test": "mm-task-complete",
              onClick: d[16] || (d[16] = (u) => R("complete"))
            }, [
              d[28] || (d[28] = e.createElementVNode(
                "i",
                { class: "ri-check-double-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(f.$t("标记完成")),
                1
                /* TEXT */
              )
            ], 8, fu)) : e.createCommentVNode("v-if", !0),
            N.value.change ? (e.openBlock(), e.createElementBlock("button", {
              key: 4,
              type: "button",
              class: "ss-btn ghost",
              disabled: i.value,
              "data-test": "mm-task-change",
              onClick: d[17] || (d[17] = (u) => R("raise"))
            }, [
              d[29] || (d[29] = e.createElementVNode(
                "i",
                { class: "ri-edit-2-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(f.$t("申请变更")),
                1
                /* TEXT */
              )
            ], 8, Nu)) : e.createCommentVNode("v-if", !0)
          ])) : e.createCommentVNode("v-if", !0)
        ],
        64
        /* STABLE_FRAGMENT */
      )) : e.createCommentVNode("v-if", !0)
    ], 8, hm));
  }
}), Eu = /* @__PURE__ */ ae(Vu, [["__scopeId", "data-v-357019bd"]]), $u = {
  class: "mm-tasks",
  "data-test": "mm-tasks-tab"
}, bu = { class: "mm-pagehead" }, hu = { class: "mm-search" }, _u = ["placeholder", "aria-label"], Bu = {
  key: 0,
  class: "mm-banner",
  "data-test": "mm-plan-banner"
}, Su = { class: "mm-banner__n" }, Du = { class: "mm-banner__text" }, wu = {
  key: 1,
  class: "ss-note danger"
}, Cu = { class: "mm-tasks__main" }, Tu = { class: "mm-tasks__bar" }, Iu = ["aria-label"], Mu = ["aria-selected", "title", "data-test", "onClick"], Au = { class: "mm-select" }, ju = { value: "status" }, Lu = { value: "project" }, zu = { value: "dept" }, Fu = { class: "mm-select" }, Pu = { value: "" }, Uu = ["value"], Ou = ["disabled", "aria-label", "title"], Ru = /* @__PURE__ */ e.defineComponent({
  __name: "TasksTab",
  emits: ["role"],
  setup(l, { expose: v, emit: n }) {
    const p = [
      { key: "received", title: t.t("我接收的"), hint: t.t("下发给我的部门、由我接收和执行的任务") },
      { key: "assigned", title: t.t("我分派的"), hint: t.t("我作为任务负责人确认下发的任务") },
      { key: "all", title: t.t("全部任务"), hint: t.t("我参与的项目里的全部任务") }
    ], y = {
      received: t.t("没有下发给你的任务"),
      all: t.t("你参与的项目里还没有任务"),
      assigned: t.t("你还没有下发过任务")
    }, s = e.ref("all"), o = e.ref("status"), c = e.ref(""), i = e.ref(""), k = e.ref([]), b = e.ref([]), m = e.ref([]), r = e.ref(""), g = e.ref(0), h = e.ref(!1), a = e.ref(""), N = n, T = e.computed(() => bl(k.value, i.value)), U = e.computed(() => {
      const d = m.value[0];
      if (!d) return "";
      const u = [d.title, d.subtitle].filter(Boolean).join(" · ");
      return m.value.length > 1 ? t.t("{line} 等 {n} 份", { line: u, n: m.value.length }) : u;
    });
    let j = 0;
    async function D() {
      const d = ++j;
      h.value = !0;
      try {
        const u = await J("task.list", { view: s.value, projectId: c.value || void 0 });
        if (d !== j) return;
        k.value = Array.isArray(u) ? u : [], a.value = "";
      } catch (u) {
        d === j && (a.value = X.errorMessage(u));
      } finally {
        d === j && (h.value = !1);
      }
    }
    async function A() {
      const [d, u] = await Promise.allSettled([
        J("project.list", {}),
        J("home.get")
      ]);
      d.status === "fulfilled" && Array.isArray(d.value) && (b.value = d.value.map((z) => ({ id: z.id, name: z.name }))), u.status === "fulfilled" && (m.value = (u.value?.todos ?? []).filter((z) => z.type === "confirm_plan"));
    }
    async function P() {
      g.value += 1, await Promise.all([D(), A()]);
    }
    e.watch([s, c], () => {
      D();
    });
    function R(d) {
      We.value = d, N("role", d);
    }
    e.watch(r, (d) => {
      d || R("");
    });
    function _() {
      const d = ge.value;
      if (d.tab !== "tasks" || d.link?.kind !== "task") return;
      const u = d.link.id;
      r.value = u, i.value = "", !k.value.some((z) => z.id === u) && (s.value !== "all" || c.value) && (s.value = "all", c.value = "");
    }
    e.watch(() => ge.value.seq, _);
    let S = null, E = null, M = 0;
    function I() {
      S && clearTimeout(S), S = setTimeout(() => {
        S = null, M = Date.now(), P();
      }, 250);
    }
    function H() {
      S || Date.now() - M < 800 || I();
    }
    v({ refresh: H });
    let f = !1;
    return e.onMounted(async () => {
      _(), M = Date.now(), await P(), !f && (_(), E = Se((d) => {
        d.type !== "changed" || !["all", "task", "meeting", "project", "org"].includes(d.scope) || I();
      }));
    }), e.onBeforeUnmount(() => {
      f = !0, E?.(), E = null, S && clearTimeout(S), We.value = "";
    }), (d, u) => (e.openBlock(), e.createElementBlock("div", $u, [
      e.createElementVNode("header", bu, [
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
        u[7] || (u[7] = e.createElementVNode(
          "span",
          { class: "grow" },
          null,
          -1
          /* CACHED */
        )),
        e.createElementVNode("label", hu, [
          u[6] || (u[6] = e.createElementVNode(
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
            "onUpdate:modelValue": u[0] || (u[0] = (z) => i.value = z),
            type: "search",
            placeholder: d.$t("搜索任务"),
            "aria-label": d.$t("搜索任务"),
            "data-test": "mm-tasks-search"
          }, null, 8, _u), [
            [e.vModelText, i.value]
          ])
        ])
      ]),
      m.value.length ? (e.openBlock(), e.createElementBlock("section", Bu, [
        e.createElementVNode(
          "span",
          Su,
          e.toDisplayString(m.value.length),
          1
          /* TEXT */
        ),
        e.createElementVNode("div", Du, [
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
            onClick: u[1] || (u[1] = (z) => e.unref(de)(m.value[0].link))
          },
          e.toDisplayString(d.$t("去确认方案")),
          1
          /* TEXT */
        )
      ])) : e.createCommentVNode("v-if", !0),
      a.value ? (e.openBlock(), e.createElementBlock("p", wu, [
        u[8] || (u[8] = e.createElementVNode(
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
          e.createElementVNode("div", Cu, [
            e.createElementVNode("div", Tu, [
              e.createElementVNode("div", {
                class: "mm-seg",
                role: "tablist",
                "aria-label": d.$t("任务视图")
              }, [
                (e.openBlock(), e.createElementBlock(
                  e.Fragment,
                  null,
                  e.renderList(p, (z) => e.createElementVNode("button", {
                    key: z.key,
                    type: "button",
                    role: "tab",
                    "aria-selected": s.value === z.key,
                    class: e.normalizeClass({ on: s.value === z.key }),
                    title: z.hint,
                    "data-test": `mm-tasks-view-${z.key}`,
                    onClick: (Q) => s.value = z.key
                  }, e.toDisplayString(z.title), 11, Mu)),
                  64
                  /* STABLE_FRAGMENT */
                ))
              ], 8, Iu),
              e.createElementVNode("label", Au, [
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
                    "onUpdate:modelValue": u[2] || (u[2] = (z) => o.value = z),
                    "data-test": "mm-tasks-groupby"
                  },
                  [
                    e.createElementVNode(
                      "option",
                      ju,
                      e.toDisplayString(d.$t("状态")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "option",
                      Lu,
                      e.toDisplayString(d.$t("项目")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "option",
                      zu,
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
                u[9] || (u[9] = e.createElementVNode(
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
              e.createElementVNode("label", Fu, [
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
                    "onUpdate:modelValue": u[3] || (u[3] = (z) => c.value = z),
                    "data-test": "mm-tasks-project"
                  },
                  [
                    e.createElementVNode(
                      "option",
                      Pu,
                      e.toDisplayString(d.$t("全部")),
                      1
                      /* TEXT */
                    ),
                    (e.openBlock(!0), e.createElementBlock(
                      e.Fragment,
                      null,
                      e.renderList(b.value, (z) => (e.openBlock(), e.createElementBlock("option", {
                        key: z.id,
                        value: z.id
                      }, e.toDisplayString(z.name), 9, Uu))),
                      128
                      /* KEYED_FRAGMENT */
                    ))
                  ],
                  512
                  /* NEED_PATCH */
                ), [
                  [e.vModelSelect, c.value]
                ]),
                u[10] || (u[10] = e.createElementVNode(
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
              u[11] || (u[11] = e.createElementVNode(
                "span",
                { class: "grow" },
                null,
                -1
                /* CACHED */
              )),
              e.createElementVNode("button", {
                type: "button",
                class: "mm-icon-btn",
                disabled: h.value,
                "aria-label": d.$t("刷新"),
                title: d.$t("刷新"),
                onClick: P
              }, [
                e.createElementVNode(
                  "i",
                  {
                    class: e.normalizeClass(h.value ? "ri-loader-4-line spin" : "ri-refresh-line")
                  },
                  null,
                  2
                  /* CLASS */
                )
              ], 8, Ou)
            ]),
            e.createVNode(Pt, {
              tasks: T.value,
              "group-by": o.value,
              "selected-id": r.value,
              "empty-text": h.value ? d.$t("加载中…") : i.value ? d.$t("没有匹配「{q}」的任务", { q: i.value }) : y[s.value],
              onSelect: u[4] || (u[4] = (z) => r.value = z.id)
            }, null, 8, ["tasks", "group-by", "selected-id", "empty-text"])
          ]),
          r.value ? (e.openBlock(), e.createBlock(Eu, {
            key: r.value,
            "task-id": r.value,
            "refresh-seq": g.value,
            onClose: u[5] || (u[5] = (z) => r.value = ""),
            onChanged: P,
            onRole: R
          }, null, 8, ["task-id", "refresh-seq"])) : e.createCommentVNode("v-if", !0)
        ],
        2
        /* CLASS */
      )
    ]));
  }
}), qu = /* @__PURE__ */ ae(Ru, [["__scopeId", "data-v-6a0cb0ba"]]), Ku = {
  class: "mm-rv",
  "data-test": "mm-report-view"
}, Hu = { class: "mm-rv__head" }, Wu = { class: "mm-rv__meta" }, Gu = { key: 0 }, Yu = { key: 1 }, Ju = {
  key: 2,
  class: "ok"
}, Qu = ["aria-label"], Zu = { key: 0 }, Xu = { class: "mm-rv__hint" }, xu = ["innerHTML"], ep = /* @__PURE__ */ e.defineComponent({
  __name: "ReportView",
  props: {
    report: {},
    approverName: {}
  },
  setup(l) {
    const v = l, n = e.computed(() => v.report.stats ?? { total: 0, done: 0, cancelled: 0, overdue: 0, onTime: 0, late: 0, completionRate: 0 }), p = e.computed(() => et.renderMarkdown(v.report.markdown || ""));
    return (y, s) => (e.openBlock(), e.createElementBlock("article", Ku, [
      e.createElementVNode("header", Hu, [
        e.createElementVNode("div", Wu, [
          e.createElementVNode(
            "strong",
            null,
            e.toDisplayString(l.report.kind === "summary" ? y.$t("项目总结报告") : y.$t("进度汇总报告")),
            1
            /* TEXT */
          ),
          l.report.periodFrom && l.report.periodTo ? (e.openBlock(), e.createElementBlock(
            "span",
            Gu,
            e.toDisplayString(y.$t("统计区间 {a} ~ {b}", { a: e.unref(st)(l.report.periodFrom), b: e.unref(st)(l.report.periodTo) })),
            1
            /* TEXT */
          )) : e.createCommentVNode("v-if", !0),
          e.createElementVNode(
            "span",
            null,
            e.toDisplayString(y.$t("生成于 {t}", { t: e.unref(Ve)(l.report.generatedAt) })),
            1
            /* TEXT */
          ),
          l.report.editedAt ? (e.openBlock(), e.createElementBlock(
            "span",
            Yu,
            e.toDisplayString(y.$t("修改于 {t}", { t: e.unref(Ve)(l.report.editedAt) })),
            1
            /* TEXT */
          )) : e.createCommentVNode("v-if", !0),
          l.report.approvedAt ? (e.openBlock(), e.createElementBlock(
            "span",
            Ju,
            e.toDisplayString(y.$t("{who} 于 {t} 审核通过", { who: l.approverName || "—", t: e.unref(Ve)(l.report.approvedAt) })),
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
              e.toDisplayString(e.unref(Ne)(n.value.completionRate)) + "%",
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
          n.value.cancelled ? (e.openBlock(), e.createElementBlock("li", Zu, [
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
        ], 8, Qu),
        e.createElementVNode("p", Xu, [
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
        innerHTML: p.value
      }, null, 8, xu)
    ]));
  }
}), Ut = /* @__PURE__ */ ae(ep, [["__scopeId", "data-v-776da457"]]), tp = {
  class: "mm-prp",
  "data-test": "mm-project-reports"
}, lp = { class: "mm-prp__bar" }, np = { class: "ss-muted" }, op = ["disabled"], ap = {
  key: 0,
  class: "ss-note warn"
}, sp = {
  key: 1,
  class: "ss-note danger"
}, rp = {
  key: 2,
  class: "ss-empty"
}, ip = {
  key: 3,
  class: "mm-prp__split"
}, cp = ["aria-label"], dp = ["aria-selected", "data-test", "onClick"], mp = /* @__PURE__ */ e.defineComponent({
  __name: "ProjectReports",
  props: {
    project: {},
    focusReportId: { default: "" },
    canGenerate: { type: Boolean, default: !1 }
  },
  emits: ["changed"],
  setup(l, { emit: v }) {
    const n = l, p = v, y = ie.useNotificationStore(), s = e.ref(!1), o = e.ref(""), c = e.ref(0), i = e.ref(""), k = e.ref(null);
    let b = null;
    const m = e.computed(() => {
      const a = [...n.project.weeklyReports ?? []];
      return k.value && !a.some((N) => N.id === k.value.id) && a.push(k.value), a.sort((N, T) => T.generatedAt - N.generatedAt);
    }), r = e.computed(() => m.value.find((a) => a.id === i.value) ?? m.value[0] ?? null), g = e.computed(() => oe.value?.settings.reportCycleDays ?? 7);
    e.watch(() => [n.project.id, n.focusReportId], () => {
      i.value = n.focusReportId && m.value.some((a) => a.id === n.focusReportId) ? n.focusReportId : "";
    }, { immediate: !0 }), e.watch(() => n.project.id, () => {
      k.value = null, o.value = "";
    });
    async function h() {
      s.value = !0, o.value = "", c.value = 0;
      const a = Date.now();
      b = setInterval(() => {
        c.value = Math.floor((Date.now() - a) / 1e3);
      }, 1e3);
      try {
        const N = await J("project.report.generate", { id: n.project.id });
        N?.id && (k.value = N, i.value = N.id), y.success(t.t("进度报告已生成")), p("changed");
      } catch (N) {
        o.value = X.errorMessage(N);
      } finally {
        s.value = !1, b && clearInterval(b), b = null;
      }
    }
    return e.onBeforeUnmount(() => {
      b && clearInterval(b);
    }), (a, N) => (e.openBlock(), e.createElementBlock("div", tp, [
      e.createElementVNode("div", lp, [
        e.createElementVNode(
          "p",
          np,
          e.toDisplayString(l.canGenerate ? a.$t("每 {n} 天自动生成一份进度汇总报告，发给任务负责人和项目负责人；项目负责人也可以现在手动生成一份。", { n: g.value }) : a.$t("每 {n} 天自动生成一份进度汇总报告，发给任务负责人和项目负责人。", { n: g.value })),
          1
          /* TEXT */
        ),
        N[0] || (N[0] = e.createElementVNode(
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
          onClick: h
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
        ], 8, op)) : e.createCommentVNode("v-if", !0)
      ]),
      s.value && c.value > 60 ? (e.openBlock(), e.createElementBlock("p", ap, [
        N[1] || (N[1] = e.createElementVNode(
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
      o.value ? (e.openBlock(), e.createElementBlock("p", sp, [
        N[2] || (N[2] = e.createElementVNode(
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
      m.value.length ? (e.openBlock(), e.createElementBlock("div", ip, [
        e.createElementVNode("ul", {
          class: "mm-prp__list",
          role: "listbox",
          "aria-label": a.$t("进度报告列表")
        }, [
          (e.openBlock(!0), e.createElementBlock(
            e.Fragment,
            null,
            e.renderList(m.value, (T) => (e.openBlock(), e.createElementBlock("li", {
              key: T.id
            }, [
              e.createElementVNode("button", {
                type: "button",
                role: "option",
                "aria-selected": T.id === i.value,
                class: e.normalizeClass({ on: T.id === i.value }),
                "data-test": `mm-report-${T.id}`,
                onClick: (U) => i.value = T.id
              }, [
                e.createElementVNode(
                  "strong",
                  null,
                  e.toDisplayString(T.periodFrom && T.periodTo ? `${e.unref(it)(T.periodFrom)} ~ ${e.unref(it)(T.periodTo)}` : e.unref(Ve)(T.generatedAt)),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "small",
                  null,
                  e.toDisplayString(a.$t("完成率 {p}% · 逾期 {n}", { p: e.unref(Ne)(T.stats?.completionRate), n: T.stats?.overdue ?? 0 })),
                  1
                  /* TEXT */
                )
              ], 10, dp)
            ]))),
            128
            /* KEYED_FRAGMENT */
          ))
        ], 8, cp),
        r.value ? (e.openBlock(), e.createBlock(Ut, {
          key: 0,
          report: r.value
        }, null, 8, ["report"])) : e.createCommentVNode("v-if", !0)
      ])) : (e.openBlock(), e.createElementBlock(
        "p",
        rp,
        e.toDisplayString(a.$t("还没有进度报告")),
        1
        /* TEXT */
      ))
    ]));
  }
}), up = /* @__PURE__ */ ae(mp, [["__scopeId", "data-v-27c1c06c"]]), pp = {
  class: "mm-psm",
  "data-test": "mm-project-summary"
}, vp = {
  key: 0,
  class: "ss-note danger"
}, kp = {
  key: 1,
  class: "ss-empty"
}, yp = {
  key: 0,
  class: "mm-psm__wait",
  "data-test": "mm-summary-waiting"
}, gp = {
  key: 1,
  class: "mm-psm__wait failed",
  "data-test": "mm-summary-missing"
}, fp = ["disabled"], Np = {
  key: 0,
  class: "ss-note info"
}, Vp = {
  key: 1,
  class: "mm-psm__bar"
}, Ep = { class: "ss-muted" }, $p = ["disabled"], bp = ["disabled"], hp = ["disabled"], _p = { class: "ss-muted" }, Bp = ["disabled"], Sp = ["disabled"], Dp = {
  key: 2,
  class: "ss-note info"
}, wp = {
  key: 3,
  class: "ss-note ok"
}, Cp = ["aria-label"], Tp = /* @__PURE__ */ e.defineComponent({
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
    const n = l, p = v, y = be.useDialog(), s = ie.useNotificationStore(), o = e.ref(!1), c = e.ref(""), i = e.ref(""), k = e.ref(!1), b = e.ref(""), m = e.ref(Date.now());
    let r = null;
    const g = e.computed(() => n.project.summary ?? null), h = e.computed(() => n.members?.find((A) => A.id === g.value?.approvedBy)?.name || ""), a = e.computed(() => {
      const A = n.project.closeCheck?.at, P = A ? Math.max(0, Math.floor((m.value - A) / 1e3)) : 0;
      return A ? P > 300 ? t.t("已经 {m} 分钟了，比平时慢；可以点「重新生成」再试一次", { m: Math.floor(P / 60) }) : t.t("已用时 {s} 秒；生成完会自动显示在这里", { s: P }) : t.t("生成完会自动显示在这里");
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
    async function N(A, P, R, _) {
      o.value = !0, c.value = A, i.value = "";
      try {
        return await J(P, R), s.success(_), p("changed"), !0;
      } catch (S) {
        return i.value = X.errorMessage(S), !1;
      } finally {
        o.value = !1, c.value = "";
      }
    }
    function T() {
      b.value = g.value?.markdown ?? "", k.value = !0;
    }
    async function U() {
      await N("save", "project.summary.save", { id: n.project.id, markdown: b.value }, t.t("总结报告已保存")) && (k.value = !1);
    }
    async function j(A) {
      A && !await y.confirm({
        title: t.t("重新生成总结报告"),
        message: g.value?.editedAt ? t.t("重新生成会覆盖你在线修改过的内容，确定吗？") : t.t("按当前项目数据重新生成一份总结报告？"),
        danger: !!g.value?.editedAt
      }) || await N("regen", "project.summary.regenerate", { id: n.project.id }, t.t("总结报告已重新生成"));
    }
    async function D() {
      await y.confirm({
        title: t.t("审核通过并归档"),
        message: t.t("归档后项目全部只读、不能重新激活，并通知全部项目成员。确定审核通过吗？"),
        confirmLabel: t.t("通过并归档")
      }) && await N("approve", "project.summary.approve", { id: n.project.id }, t.t("项目已归档"));
    }
    return (A, P) => (e.openBlock(), e.createElementBlock("div", pp, [
      i.value ? (e.openBlock(), e.createElementBlock("p", vp, [
        P[4] || (P[4] = e.createElementVNode(
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
        kp,
        e.toDisplayString(A.$t("项目还在进行中。项目负责人「发起结项」且检查通过后，AI 会在这里生成项目总结报告（概况、关键决策、任务按期 / 延期完成情况、变更与裁决记录），审核通过后归档。")),
        1
        /* TEXT */
      )) : g.value ? (e.openBlock(), e.createElementBlock(
        e.Fragment,
        { key: 3 },
        [
          l.generating ? (e.openBlock(), e.createElementBlock("p", Np, [
            P[8] || (P[8] = e.createElementVNode(
              "i",
              { class: "ri-loader-4-line spin" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(A.$t("AI 正在重新生成总结报告，生成完会自动刷新")),
              1
              /* TEXT */
            )
          ])) : e.createCommentVNode("v-if", !0),
          l.project.status === "closing" && l.can.reviewSummary ? (e.openBlock(), e.createElementBlock("div", Vp, [
            k.value ? (e.openBlock(), e.createElementBlock(
              e.Fragment,
              { key: 1 },
              [
                e.createElementVNode(
                  "p",
                  _p,
                  e.toDisplayString(A.$t("直接改 Markdown 正文；统计数字以系统计算为准，不随正文修改。")),
                  1
                  /* TEXT */
                ),
                P[11] || (P[11] = e.createElementVNode(
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
                  onClick: P[2] || (P[2] = (R) => k.value = !1)
                }, e.toDisplayString(A.$t("取消")), 9, Bp),
                e.createElementVNode("button", {
                  type: "button",
                  class: "ss-btn sm primary",
                  disabled: o.value || !b.value.trim(),
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
                    e.toDisplayString(A.$t("保存修改")),
                    1
                    /* TEXT */
                  )
                ], 8, Sp)
              ],
              64
              /* STABLE_FRAGMENT */
            )) : (e.openBlock(), e.createElementBlock(
              e.Fragment,
              { key: 0 },
              [
                e.createElementVNode(
                  "p",
                  Ep,
                  e.toDisplayString(A.$t("看一遍总结，需要的话在线修改；审核通过后项目归档，全部只读，并通知项目成员。")),
                  1
                  /* TEXT */
                ),
                P[10] || (P[10] = e.createElementVNode(
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
                  onClick: T
                }, [
                  P[9] || (P[9] = e.createElementVNode(
                    "i",
                    { class: "ri-edit-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(A.$t("在线修改")),
                    1
                    /* TEXT */
                  )
                ], 8, $p),
                e.createElementVNode("button", {
                  type: "button",
                  class: "ss-btn sm",
                  disabled: o.value || l.generating,
                  "data-test": "mm-summary-regen",
                  onClick: P[1] || (P[1] = (R) => j(!0))
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
                    e.toDisplayString(A.$t("重新生成")),
                    1
                    /* TEXT */
                  )
                ], 8, bp),
                e.createElementVNode("button", {
                  type: "button",
                  class: "ss-btn sm primary",
                  disabled: o.value || l.generating,
                  "data-test": "mm-summary-approve",
                  onClick: D
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
                    e.toDisplayString(A.$t("审核通过并归档")),
                    1
                    /* TEXT */
                  )
                ], 8, hp)
              ],
              64
              /* STABLE_FRAGMENT */
            ))
          ])) : l.project.status === "closing" ? (e.openBlock(), e.createElementBlock("p", Dp, [
            P[12] || (P[12] = e.createElementVNode(
              "i",
              { class: "ri-time-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(A.$t("总结报告待项目负责人审核，审核通过后项目归档。")),
              1
              /* TEXT */
            )
          ])) : l.project.status === "archived" ? (e.openBlock(), e.createElementBlock("p", wp, [
            P[13] || (P[13] = e.createElementVNode(
              "i",
              { class: "ri-archive-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(A.$t("项目已归档，全部内容只读。")),
              1
              /* TEXT */
            )
          ])) : e.createCommentVNode("v-if", !0),
          k.value ? e.withDirectives((e.openBlock(), e.createElementBlock("textarea", {
            key: 4,
            "onUpdate:modelValue": P[3] || (P[3] = (R) => b.value = R),
            class: "mm-psm__editor",
            rows: "24",
            "aria-label": A.$t("总结报告正文"),
            "data-test": "mm-summary-editor"
          }, null, 8, Cp)), [
            [e.vModelText, b.value]
          ]) : (e.openBlock(), e.createBlock(Ut, {
            key: 5,
            report: g.value,
            "approver-name": h.value
          }, null, 8, ["report", "approver-name"]))
        ],
        64
        /* STABLE_FRAGMENT */
      )) : (e.openBlock(), e.createElementBlock(
        e.Fragment,
        { key: 2 },
        [
          l.generating || o.value && c.value === "regen" ? (e.openBlock(), e.createElementBlock("div", yp, [
            P[5] || (P[5] = e.createElementVNode(
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
                e.toDisplayString(A.$t("AI 正在生成项目总结报告…")),
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
          ])) : (e.openBlock(), e.createElementBlock("div", gp, [
            P[7] || (P[7] = e.createElementVNode(
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
                e.toDisplayString(A.$t("总结报告还没有生成")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "small",
                null,
                e.toDisplayString(l.isOwner ? A.$t("上次生成可能没成功，点「重新生成」再试一次") : A.$t("等项目负责人重新生成")),
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
              onClick: P[0] || (P[0] = (R) => j(!1))
            }, [
              P[6] || (P[6] = e.createElementVNode(
                "i",
                { class: "ri-refresh-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(A.$t("重新生成")),
                1
                /* TEXT */
              )
            ], 8, fp)) : e.createCommentVNode("v-if", !0)
          ]))
        ],
        64
        /* STABLE_FRAGMENT */
      ))
    ]));
  }
}), Ip = /* @__PURE__ */ ae(Tp, [["__scopeId", "data-v-a7ff6e93"]]), Ot = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/components/TModal.vue"];
if (!Ot) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/components/TModal.vue");
const Ze = Ot.default, Mp = { class: "mm-pp" }, Ap = {
  key: 0,
  class: "mm-pp__chosen"
}, jp = ["aria-label", "onClick"], Lp = { key: 1 }, zp = { class: "mm-pp__search" }, Fp = ["placeholder"], Pp = ["aria-multiselectable"], Up = { class: "mm-pp__dept" }, Op = ["aria-selected", "disabled", "data-test", "onClick"], Rp = { key: 0 }, qp = {
  key: 1,
  class: "ri-check-line",
  "aria-hidden": "true"
}, Kp = {
  key: 0,
  class: "mm-pp__empty"
}, Hp = /* @__PURE__ */ e.defineComponent({
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
    const n = l, p = v, y = e.ref(""), s = e.computed(() => {
      const r = n.modelValue;
      return Array.isArray(r) ? r : r ? [r] : [];
    }), o = (r) => s.value.includes(r), c = (r) => n.depts.find((g) => g.id === r)?.name || "", i = e.computed(() => n.people.filter((r) => !r.left)), k = e.computed(() => s.value.map((r) => n.people.find((g) => g.id === r)).filter((r) => !!r)), b = e.computed(() => {
      const r = [], g = /* @__PURE__ */ new Map();
      for (const h of i.value) {
        if (!kt(h, c(h.deptId), y.value)) continue;
        const a = g.get(h.deptId) ?? [];
        a.push(h), g.set(h.deptId, a);
      }
      for (const h of n.depts) {
        const a = g.get(h.id);
        a?.length && r.push({ id: h.id, name: h.name, people: a }), g.delete(h.id);
      }
      for (const [h, a] of g) r.push({ id: h, name: c(h) || "—", people: a });
      return r;
    });
    function m(r) {
      if (!n.multiple) {
        p("update:modelValue", r);
        return;
      }
      if (o(r)) {
        if (n.locked?.includes(r)) return;
        p("update:modelValue", s.value.filter((g) => g !== r));
      } else
        p("update:modelValue", [...s.value, r]);
    }
    return (r, g) => (e.openBlock(), e.createElementBlock("div", Mp, [
      l.multiple && k.value.length ? (e.openBlock(), e.createElementBlock("div", Ap, [
        (e.openBlock(!0), e.createElementBlock(
          e.Fragment,
          null,
          e.renderList(k.value, (h) => (e.openBlock(), e.createElementBlock("span", {
            key: h.id,
            class: "mm-pp__chip"
          }, [
            e.createElementVNode(
              "i",
              {
                style: e.normalizeStyle({ background: e.unref(re)(h.name).color }),
                "aria-hidden": "true"
              },
              e.toDisplayString(e.unref(re)(h.name).text),
              5
              /* TEXT, STYLE */
            ),
            e.createTextVNode(
              e.toDisplayString(h.name) + " ",
              1
              /* TEXT */
            ),
            l.locked?.includes(h.id) ? (e.openBlock(), e.createElementBlock(
              "em",
              Lp,
              e.toDisplayString(l.lockedHint || ""),
              1
              /* TEXT */
            )) : (e.openBlock(), e.createElementBlock("button", {
              key: 0,
              type: "button",
              "aria-label": r.$t("移除 {name}", { name: h.name }),
              onClick: (a) => m(h.id)
            }, [...g[1] || (g[1] = [
              e.createElementVNode(
                "i",
                { class: "ri-close-line" },
                null,
                -1
                /* CACHED */
              )
            ])], 8, jp))
          ]))),
          128
          /* KEYED_FRAGMENT */
        ))
      ])) : e.createCommentVNode("v-if", !0),
      e.createElementVNode("div", zp, [
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
          "onUpdate:modelValue": g[0] || (g[0] = (h) => y.value = h),
          type: "search",
          placeholder: r.$t("搜索姓名、部门")
        }, null, 8, Fp), [
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
          e.renderList(b.value, (h) => (e.openBlock(), e.createElementBlock("li", {
            key: h.id
          }, [
            e.createElementVNode(
              "p",
              Up,
              e.toDisplayString(h.name),
              1
              /* TEXT */
            ),
            (e.openBlock(!0), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(h.people, (a) => (e.openBlock(), e.createElementBlock("button", {
                key: a.id,
                type: "button",
                role: "option",
                class: e.normalizeClass(["mm-pp__opt", { on: o(a.id) }]),
                "aria-selected": o(a.id),
                disabled: l.locked?.includes(a.id) && o(a.id),
                "data-test": `mm-pp-${a.id}`,
                onClick: (N) => m(a.id)
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
                  Rp,
                  e.toDisplayString(a.title),
                  1
                  /* TEXT */
                )) : e.createCommentVNode("v-if", !0),
                o(a.id) ? (e.openBlock(), e.createElementBlock("b", qp)) : e.createCommentVNode("v-if", !0)
              ], 10, Op))),
              128
              /* KEYED_FRAGMENT */
            ))
          ]))),
          128
          /* KEYED_FRAGMENT */
        )),
        b.value.length ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock(
          "li",
          Kp,
          e.toDisplayString(r.$t("没有匹配的人员")),
          1
          /* TEXT */
        ))
      ], 12, Pp)
    ]));
  }
}), we = /* @__PURE__ */ ae(Hp, [["__scopeId", "data-v-60f28bb6"]]), Wp = {
  class: "mm-pmd",
  "data-test": "mm-project-members"
}, Gp = { class: "ss-muted" }, Yp = {
  key: 0,
  class: "ss-muted"
}, Jp = {
  key: 1,
  class: "ss-note danger",
  "data-test": "mm-pm-error"
}, Qp = ["disabled"], Zp = /* @__PURE__ */ e.defineComponent({
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
    const n = l, p = v, y = e.ref([]), s = e.ref([]), o = e.ref([]), c = e.ref(!1), i = e.ref(""), k = e.computed(() => o.value.length !== n.memberIds.length || o.value.some((r) => !n.memberIds.includes(r))), b = e.computed(() => n.memberIds.filter((r) => !o.value.includes(r)).map((r) => y.value.find((g) => g.id === r)?.name || n.members?.find((g) => g.id === r)?.name || r));
    e.watch(() => n.open, async (r) => {
      if (r) {
        o.value = [...n.memberIds], i.value = "";
        try {
          const g = await J("people.list"), h = (n.members ?? []).filter((a) => !(g?.people ?? []).some((N) => N.id === a.id)).map((a) => ({ ...a, left: !1 }));
          y.value = [...g?.people ?? [], ...h], s.value = g?.depts ?? [];
        } catch (g) {
          i.value = X.errorMessage(g);
        }
      }
    }, { immediate: !0 });
    async function m() {
      c.value = !0, i.value = "";
      try {
        const r = [.../* @__PURE__ */ new Set([n.ownerId, ...o.value])], g = await J("project.members", { id: n.projectId, memberIds: r });
        p("saved", g);
      } catch (r) {
        i.value = X.errorMessage(r);
      } finally {
        c.value = !1;
      }
    }
    return (r, g) => (e.openBlock(), e.createBlock(Ze, {
      open: l.open,
      title: r.$t("编辑成员"),
      icon: "ri-team-line",
      size: "md",
      onClose: g[2] || (g[2] = (h) => p("close"))
    }, {
      footer: e.withCtx(() => [
        e.createElementVNode(
          "button",
          {
            type: "button",
            class: "ss-btn",
            onClick: g[1] || (g[1] = (h) => p("close"))
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
        ], 8, Qp)
      ]),
      default: e.withCtx(() => [
        e.createElementVNode("div", Wp, [
          e.createElementVNode(
            "p",
            Gp,
            e.toDisplayString(r.$t("项目负责人不能移除；成员还有未完成的待办或任务时也不能移除。")),
            1
            /* TEXT */
          ),
          e.createVNode(we, {
            modelValue: o.value,
            "onUpdate:modelValue": g[0] || (g[0] = (h) => o.value = h),
            people: y.value,
            depts: s.value,
            locked: [l.ownerId],
            "locked-hint": r.$t("负责人"),
            "max-height": 300
          }, null, 8, ["modelValue", "people", "depts", "locked", "locked-hint"]),
          b.value.length ? (e.openBlock(), e.createElementBlock(
            "p",
            Yp,
            e.toDisplayString(r.$t("将移除：{names}", { names: b.value.join(r.$t("、")) })),
            1
            /* TEXT */
          )) : e.createCommentVNode("v-if", !0),
          i.value ? (e.openBlock(), e.createElementBlock("p", Jp, [
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
}), Xp = /* @__PURE__ */ ae(Zp, [["__scopeId", "data-v-a1802897"]]), xp = {
  class: "mm-pd",
  "data-test": "mm-project-detail"
}, ev = {
  key: 0,
  class: "mm-pd__loading"
}, tv = {
  key: 1,
  class: "ss-note danger"
}, lv = { class: "mm-pd__head" }, nv = { class: "mm-pd__titlerow" }, ov = ["aria-label"], av = ["aria-current"], sv = ["aria-label", "aria-expanded"], rv = {
  key: 0,
  class: "mm-more__menu",
  role: "menu"
}, iv = ["disabled"], cv = ["disabled"], dv = { class: "mm-pd__meta" }, mv = {
  key: 0,
  class: "mm-pd__desc"
}, uv = {
  key: 1,
  class: "mm-pd__fail",
  "data-test": "mm-close-fail"
}, pv = ["aria-label"], vv = { class: "ss-muted" }, kv = { class: "mm-block-list" }, yv = { class: "t" }, gv = ["onClick"], fv = {
  class: "mm-pd__stats",
  "data-test": "mm-project-stats"
}, Nv = { class: "brand" }, Vv = {
  class: "mm-pd__tabs",
  role: "tablist"
}, Ev = ["aria-selected", "data-test", "onClick"], $v = { key: 0 }, bv = {
  key: 2,
  class: "mm-pd__ov"
}, hv = { class: "mm-pd__ovl" }, _v = {
  key: 0,
  class: "mm-pd__blockers",
  "data-test": "mm-close-blockers"
}, Bv = { class: "mm-block-list" }, Sv = ["title"], Dv = { key: 0 }, wv = ["data-test", "onClick"], Cv = {
  key: 1,
  class: "ss-note ok"
}, Tv = { class: "mm-pd__depts" }, Iv = {
  key: 0,
  class: "ss-muted"
}, Mv = { key: 1 }, Av = { class: "n" }, jv = { class: "mm-bar wide" }, Lv = { class: "v" }, zv = { class: "mm-pd__ovr" }, Fv = { class: "mm-pd__decisions" }, Pv = {
  key: 0,
  class: "ss-muted"
}, Uv = {
  key: 1,
  class: "mm-tl"
}, Ov = ["onClick"], Rv = { class: "mm-pd__members" }, qv = { class: "mm-avs" }, Kv = ["title", "aria-label"], Hv = { class: "mm-pd__list" }, Wv = { class: "mm-pd__listbar" }, Gv = { class: "ss-muted" }, Yv = {
  key: 0,
  class: "ss-empty"
}, Jv = ["data-test", "onClick"], Qv = { class: "t" }, Zv = {
  key: 0,
  class: "mm-tag warn"
}, Xv = { class: "mm-pd__list" }, xv = /* @__PURE__ */ e.defineComponent({
  __name: "ProjectDetail",
  props: {
    projectId: {},
    refreshSeq: { default: 0 },
    focus: { default: null }
  },
  emits: ["changed", "role"],
  setup(l, { emit: v }) {
    const n = l, p = v, y = be.useDialog(), s = ie.useNotificationStore(), o = e.ref(null), c = e.ref(!1), i = e.ref(!1), k = e.ref(""), b = e.ref("overview"), m = e.ref(""), r = e.ref(null), g = e.ref(!1), h = e.ref(!1), a = e.ref(!1), N = e.ref(null), T = e.computed(() => o.value?.project ?? null), U = e.computed(() => T.value ? Al(T.value.status) : 0), j = e.computed(() => bt(o.value?.closeBlockers)), D = e.computed(() => !!T.value && T.value.ownerId === oe.value?.me.person?.id), A = e.computed(() => [
      { key: "overview", title: t.t("概览"), count: void 0 },
      { key: "meetings", title: t.t("会议"), count: o.value?.meetings.length ?? 0 },
      { key: "tasks", title: t.t("任务"), count: o.value?.tasks.length ?? 0 },
      { key: "reports", title: t.t("进度报告"), count: T.value?.weeklyReports?.length ?? 0 },
      { key: "summary", title: t.t("总结报告"), count: void 0 }
    ]);
    function P(f) {
      return f === "failed" ? "bad" : f === "dispatched" || f === "ended" ? "ok" : f === "processing" ? "brand" : "warn";
    }
    let R = 0;
    async function _() {
      if (!n.projectId) return;
      const f = ++R;
      c.value = !0;
      try {
        const d = await J("project.get", { id: n.projectId });
        if (f !== R) return;
        o.value = d, p("role", Ml(d.project, oe.value?.me.person?.id)), k.value = "";
      } catch (d) {
        f === R && (k.value = X.errorMessage(d));
      } finally {
        f === R && (c.value = !1);
      }
    }
    e.watch(() => n.projectId, () => {
      o.value = null, r.value = null, g.value = !1, b.value = "overview", _();
    }, { immediate: !0 }), e.watch(() => n.refreshSeq, () => {
      _();
    }), e.watch(() => n.focus?.seq, () => {
      n.focus && (b.value = n.focus.tab, m.value = n.focus.reportId || "");
    }, { immediate: !0 });
    async function S() {
      if (!(!T.value || !await y.confirm({
        title: t.t("发起结项"),
        message: t.t("先检查：所有会议已派发或已结束、所有任务已完成或已取消、没有处理中的异议。通过后项目进入「结项中」，不能再新建会议和任务，也不能撤回；AI 随后生成总结报告交你审核。"),
        confirmLabel: t.t("检查并结项")
      }))) {
        i.value = !0, k.value = "";
        try {
          const d = await J("project.close", { id: T.value.id });
          d?.ok ? (r.value = null, s.success(t.t("结项检查通过，项目进入结项中，AI 正在生成总结报告")), b.value = "summary") : r.value = bt(d?.items), await _(), p("changed");
        } catch (d) {
          k.value = X.errorMessage(d);
        } finally {
          i.value = !1;
        }
      }
    }
    async function E() {
      await _(), p("changed");
    }
    async function M() {
      h.value = !1, s.success(t.t("成员已更新")), await _(), p("changed");
    }
    function I(f) {
      a.value = !1, p("changed"), f && de({ kind: "meeting", id: f });
    }
    function H(f) {
      g.value && N.value && !N.value.contains(f.target) && (g.value = !1);
    }
    return e.onMounted(() => document.addEventListener("click", H)), e.onBeforeUnmount(() => document.removeEventListener("click", H)), (f, d) => (e.openBlock(), e.createElementBlock("section", xp, [
      c.value && !o.value ? (e.openBlock(), e.createElementBlock("p", ev, [
        d[8] || (d[8] = e.createElementVNode(
          "i",
          { class: "ri-loader-4-line spin" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(f.$t("加载中…")),
          1
          /* TEXT */
        )
      ])) : e.createCommentVNode("v-if", !0),
      k.value ? (e.openBlock(), e.createElementBlock("p", tv, [
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
      o.value && T.value ? (e.openBlock(), e.createElementBlock(
        e.Fragment,
        { key: 2 },
        [
          e.createCommentVNode(" 顶部：名称 + 状态 + 进度条（sticky，滚动时始终可见） "),
          e.createElementVNode("header", lv, [
            e.createElementVNode("div", nv, [
              e.createElementVNode(
                "h3",
                null,
                e.toDisplayString(T.value.name),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "span",
                {
                  class: e.normalizeClass(["mm-tag", e.unref(jl)(T.value.status)]),
                  "data-test": "mm-project-status"
                },
                e.toDisplayString(e.unref(Ge)[T.value.status]),
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
                "aria-label": f.$t("项目状态")
              }, [
                (e.openBlock(!0), e.createElementBlock(
                  e.Fragment,
                  null,
                  e.renderList(e.unref(jt), (u, z) => (e.openBlock(), e.createElementBlock(
                    e.Fragment,
                    { key: u },
                    [
                      z > 0 ? (e.openBlock(), e.createElementBlock(
                        "li",
                        {
                          key: 0,
                          class: e.normalizeClass(["mm-steps__line", { done: z <= U.value }]),
                          "aria-hidden": "true"
                        },
                        null,
                        2
                        /* CLASS */
                      )) : e.createCommentVNode("v-if", !0),
                      e.createElementVNode("li", {
                        class: e.normalizeClass(["mm-steps__step", { done: z < U.value, on: z === U.value }]),
                        "aria-current": z === U.value ? "step" : void 0
                      }, [
                        d[10] || (d[10] = e.createElementVNode(
                          "i",
                          { "aria-hidden": "true" },
                          null,
                          -1
                          /* CACHED */
                        )),
                        e.createTextVNode(
                          e.toDisplayString(e.unref(Ge)[u]),
                          1
                          /* TEXT */
                        )
                      ], 10, av)
                    ],
                    64
                    /* STABLE_FRAGMENT */
                  ))),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ], 8, ov),
              e.createElementVNode(
                "div",
                {
                  ref_key: "moreEl",
                  ref: N,
                  class: "mm-more"
                },
                [
                  e.createElementVNode("button", {
                    type: "button",
                    class: "mm-more__btn",
                    "aria-label": f.$t("更多"),
                    "aria-expanded": g.value,
                    "data-test": "mm-project-more",
                    onClick: d[0] || (d[0] = e.withModifiers((u) => g.value = !g.value, ["stop"]))
                  }, [...d[11] || (d[11] = [
                    e.createElementVNode(
                      "i",
                      { class: "ri-more-fill" },
                      null,
                      -1
                      /* CACHED */
                    )
                  ])], 8, sv),
                  g.value ? (e.openBlock(), e.createElementBlock("div", rv, [
                    e.createElementVNode("button", {
                      type: "button",
                      role: "menuitem",
                      disabled: !o.value.can.editMembers,
                      "data-test": "mm-project-edit-members",
                      onClick: d[1] || (d[1] = (u) => {
                        g.value = !1, h.value = !0;
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
                        e.toDisplayString(f.$t("编辑成员")),
                        1
                        /* TEXT */
                      )
                    ], 8, iv),
                    e.createElementVNode("button", {
                      type: "button",
                      role: "menuitem",
                      onClick: d[2] || (d[2] = (u) => {
                        g.value = !1, _();
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
                        e.toDisplayString(f.$t("刷新")),
                        1
                        /* TEXT */
                      )
                    ])
                  ])) : e.createCommentVNode("v-if", !0)
                ],
                512
                /* NEED_PATCH */
              ),
              o.value.can.close && T.value.status === "active" ? (e.openBlock(), e.createElementBlock("button", {
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
                  e.toDisplayString(f.$t("发起结项")),
                  1
                  /* TEXT */
                )
              ], 8, cv)) : e.createCommentVNode("v-if", !0)
            ]),
            e.createElementVNode(
              "p",
              dv,
              e.toDisplayString(f.$t("负责人 {owner} · {n} 位成员 · {date} 创建", { owner: o.value.ownerName, n: o.value.members.length, date: e.unref(st)(T.value.createdAt) })),
              1
              /* TEXT */
            )
          ]),
          T.value.desc ? (e.openBlock(), e.createElementBlock(
            "p",
            mv,
            e.toDisplayString(T.value.desc),
            1
            /* TEXT */
          )) : e.createCommentVNode("v-if", !0),
          e.createCommentVNode(" 结项检查不通过：列出未完成事项 "),
          r.value ? (e.openBlock(), e.createElementBlock("section", uv, [
            e.createElementVNode("header", null, [
              e.createElementVNode(
                "strong",
                null,
                e.toDisplayString(f.$t("结项检查未通过，还有 {n} 项未完成", { n: r.value.length })),
                1
                /* TEXT */
              ),
              e.createElementVNode("button", {
                type: "button",
                class: "mm-x",
                "aria-label": f.$t("关闭"),
                onClick: d[3] || (d[3] = (u) => r.value = null)
              }, [...d[15] || (d[15] = [
                e.createElementVNode(
                  "i",
                  { class: "ri-close-line" },
                  null,
                  -1
                  /* CACHED */
                )
              ])], 8, pv)
            ]),
            e.createElementVNode(
              "p",
              vv,
              e.toDisplayString(f.$t("结项要求：所有会议已派发或已结束、所有任务已完成或已取消、没有处理中的异议。")),
              1
              /* TEXT */
            ),
            e.createElementVNode("ul", kv, [
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(r.value, (u) => (e.openBlock(), e.createElementBlock("li", {
                  key: `${u.kind}-${u.id}`
                }, [
                  e.createElementVNode(
                    "span",
                    {
                      class: e.normalizeClass(["mm-tag", e.unref(Be)(u, o.value.tasks, { canArbitrate: !!o.value.can.close }).tone])
                    },
                    e.toDisplayString(e.unref(Be)(u, o.value.tasks, { canArbitrate: !!o.value.can.close }).chip),
                    3
                    /* TEXT, CLASS */
                  ),
                  e.createElementVNode("span", yv, [
                    e.createTextVNode(
                      e.toDisplayString(u.title),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "small",
                      null,
                      " · " + e.toDisplayString(u.reason),
                      1
                      /* TEXT */
                    )
                  ]),
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-link",
                    onClick: (z) => e.unref(de)(e.unref(Be)(u, o.value.tasks, { canArbitrate: !!o.value.can.close }).link)
                  }, [
                    e.createTextVNode(
                      e.toDisplayString(e.unref(Be)(u, o.value.tasks, { canArbitrate: !!o.value.can.close }).action) + " ",
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
                  ], 8, gv)
                ]))),
                128
                /* KEYED_FRAGMENT */
              ))
            ])
          ])) : e.createCommentVNode("v-if", !0),
          e.createCommentVNode(" 5 个统计 "),
          e.createElementVNode("ul", fv, [
            e.createElementVNode("li", null, [
              e.createElementVNode(
                "b",
                null,
                e.toDisplayString(f.$t("{n} 场", { n: o.value.stats.meetings })),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "small",
                null,
                e.toDisplayString(f.$t("会议")),
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
                e.toDisplayString(f.$t("任务完成")),
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
                  e.toDisplayString(f.$t("逾期任务")),
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
                  e.toDisplayString(f.$t("处理中异议")),
                  1
                  /* TEXT */
                )
              ],
              2
              /* CLASS */
            ),
            e.createElementVNode("li", Nv, [
              e.createElementVNode(
                "b",
                null,
                e.toDisplayString(e.unref(Ne)(o.value.stats.weekRate)) + "%",
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "small",
                null,
                e.toDisplayString(f.$t("本周完成率")),
                1
                /* TEXT */
              )
            ])
          ]),
          e.createElementVNode("nav", Vv, [
            (e.openBlock(!0), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(A.value, (u) => (e.openBlock(), e.createElementBlock("button", {
                key: u.key,
                type: "button",
                role: "tab",
                "aria-selected": b.value === u.key,
                class: e.normalizeClass({ on: b.value === u.key }),
                "data-test": `mm-pd-tab-${u.key}`,
                onClick: (z) => b.value = u.key
              }, [
                e.createTextVNode(
                  e.toDisplayString(u.title),
                  1
                  /* TEXT */
                ),
                u.count !== void 0 ? (e.openBlock(), e.createElementBlock(
                  "em",
                  $v,
                  e.toDisplayString(u.count),
                  1
                  /* TEXT */
                )) : e.createCommentVNode("v-if", !0)
              ], 10, Ev))),
              128
              /* KEYED_FRAGMENT */
            ))
          ]),
          e.createCommentVNode(" 概览 "),
          b.value === "overview" ? (e.openBlock(), e.createElementBlock("div", bv, [
            e.createElementVNode("div", hv, [
              T.value.status === "active" && j.value.length ? (e.openBlock(), e.createElementBlock("section", _v, [
                e.createElementVNode(
                  "h4",
                  null,
                  e.toDisplayString(f.$t("结项前需处理 · {n} 项", { n: j.value.length })),
                  1
                  /* TEXT */
                ),
                e.createElementVNode("ul", Bv, [
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(j.value, (u) => (e.openBlock(), e.createElementBlock("li", {
                      key: `${u.kind}-${u.id}`
                    }, [
                      e.createElementVNode(
                        "span",
                        {
                          class: e.normalizeClass(["mm-tag", e.unref(Be)(u, o.value.tasks, { canArbitrate: !!o.value.can.close }).tone])
                        },
                        e.toDisplayString(e.unref(Be)(u, o.value.tasks, { canArbitrate: !!o.value.can.close }).chip),
                        3
                        /* TEXT, CLASS */
                      ),
                      e.createElementVNode("span", {
                        class: "t",
                        title: u.reason ? `${u.title} · ${u.reason}` : u.title
                      }, [
                        e.createTextVNode(
                          e.toDisplayString(u.title),
                          1
                          /* TEXT */
                        ),
                        u.reason ? (e.openBlock(), e.createElementBlock(
                          "small",
                          Dv,
                          " · " + e.toDisplayString(u.reason),
                          1
                          /* TEXT */
                        )) : e.createCommentVNode("v-if", !0)
                      ], 8, Sv),
                      e.createElementVNode("button", {
                        type: "button",
                        class: "ss-link",
                        "data-test": `mm-blocker-${u.id}`,
                        onClick: (z) => e.unref(de)(e.unref(Be)(u, o.value.tasks, { canArbitrate: !!o.value.can.close }).link)
                      }, [
                        e.createTextVNode(
                          e.toDisplayString(e.unref(Be)(u, o.value.tasks, { canArbitrate: !!o.value.can.close }).action) + " ",
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
                      ], 8, wv)
                    ]))),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ])
              ])) : T.value.status === "active" ? (e.openBlock(), e.createElementBlock("p", Cv, [
                d[18] || (d[18] = e.createElementVNode(
                  "i",
                  { class: "ri-checkbox-circle-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(f.$t("会议、任务都已收尾，没有处理中的异议，可以发起结项。")),
                  1
                  /* TEXT */
                )
              ])) : e.createCommentVNode("v-if", !0),
              e.createElementVNode("section", Tv, [
                e.createElementVNode(
                  "h4",
                  null,
                  e.toDisplayString(f.$t("各部门任务进度")),
                  1
                  /* TEXT */
                ),
                o.value.deptProgress.length ? (e.openBlock(), e.createElementBlock("ul", Mv, [
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(o.value.deptProgress, (u) => (e.openBlock(), e.createElementBlock("li", {
                      key: u.deptId
                    }, [
                      e.createElementVNode(
                        "span",
                        Av,
                        e.toDisplayString(u.name),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode("i", jv, [
                        e.createElementVNode(
                          "b",
                          {
                            style: e.normalizeStyle({ width: `${e.unref(vt)(u.done, u.total)}%` })
                          },
                          null,
                          4
                          /* STYLE */
                        )
                      ]),
                      e.createElementVNode(
                        "span",
                        Lv,
                        e.toDisplayString(u.done) + "/" + e.toDisplayString(u.total),
                        1
                        /* TEXT */
                      )
                    ]))),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ])) : (e.openBlock(), e.createElementBlock(
                  "p",
                  Iv,
                  e.toDisplayString(f.$t("还没有任务")),
                  1
                  /* TEXT */
                ))
              ])
            ]),
            e.createElementVNode("div", zv, [
              e.createElementVNode("section", Fv, [
                e.createElementVNode("h4", null, [
                  e.createTextVNode(
                    e.toDisplayString(f.$t("关键决策")) + " ",
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "small",
                    null,
                    e.toDisplayString(f.$t("来自会议纪要")),
                    1
                    /* TEXT */
                  )
                ]),
                o.value.decisions.length ? (e.openBlock(), e.createElementBlock("ol", Uv, [
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(o.value.decisions, (u, z) => (e.openBlock(), e.createElementBlock("li", { key: z }, [
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
                          e.toDisplayString(u.text),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode("time", null, [
                          e.createTextVNode(
                            e.toDisplayString(e.unref(it)(u.at)),
                            1
                            /* TEXT */
                          ),
                          u.meetingTitle ? (e.openBlock(), e.createElementBlock(
                            e.Fragment,
                            { key: 0 },
                            [
                              d[19] || (d[19] = e.createTextVNode(
                                " · ",
                                -1
                                /* CACHED */
                              )),
                              u.meetingId ? (e.openBlock(), e.createElementBlock("button", {
                                key: 0,
                                type: "button",
                                class: "mm-linkish",
                                onClick: (Q) => e.unref(de)({ kind: "meeting", id: u.meetingId })
                              }, e.toDisplayString(u.meetingTitle), 9, Ov)) : (e.openBlock(), e.createElementBlock(
                                e.Fragment,
                                { key: 1 },
                                [
                                  e.createTextVNode(
                                    e.toDisplayString(u.meetingTitle),
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
                  Pv,
                  e.toDisplayString(f.$t("还没有定稿的决议")),
                  1
                  /* TEXT */
                ))
              ]),
              e.createElementVNode("section", Rv, [
                e.createElementVNode("h4", null, [
                  e.createTextVNode(
                    e.toDisplayString(f.$t("成员")) + " ",
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
                e.createElementVNode("div", qv, [
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(o.value.members, (u) => (e.openBlock(), e.createElementBlock("i", {
                      key: u.id,
                      style: e.normalizeStyle({ background: e.unref(re)(u.name).color }),
                      title: u.name,
                      "aria-label": u.name
                    }, e.toDisplayString(e.unref(re)(u.name).text), 13, Kv))),
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
              e.createElementVNode("div", Hv, [
                e.createElementVNode("div", Wv, [
                  e.createElementVNode(
                    "p",
                    Gv,
                    e.toDisplayString(T.value.status === "active" ? f.$t("项目进行中才能新建会议。") : f.$t("项目已结项，不能再新建会议。")),
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
                    onClick: d[4] || (d[4] = (u) => a.value = !0)
                  }, [
                    d[21] || (d[21] = e.createElementVNode(
                      "i",
                      { class: "ri-add-line" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createTextVNode(
                      e.toDisplayString(f.$t("新建会议")),
                      1
                      /* TEXT */
                    )
                  ])) : e.createCommentVNode("v-if", !0)
                ]),
                o.value.meetings.length ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock(
                  "p",
                  Yv,
                  e.toDisplayString(f.$t("这个项目还没有会议")),
                  1
                  /* TEXT */
                )),
                (e.openBlock(!0), e.createElementBlock(
                  e.Fragment,
                  null,
                  e.renderList(o.value.meetings, (u) => (e.openBlock(), e.createElementBlock("button", {
                    key: u.id,
                    type: "button",
                    class: "mm-mrow",
                    "data-test": `mm-pd-meeting-${u.id}`,
                    onClick: (z) => e.unref(de)({ kind: "meeting", id: u.id })
                  }, [
                    e.createElementVNode("span", Qv, [
                      e.createElementVNode(
                        "strong",
                        null,
                        e.toDisplayString(u.title),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode("small", null, [
                        e.createTextVNode(
                          e.toDisplayString(e.unref(Ve)(u.time)),
                          1
                          /* TEXT */
                        ),
                        u.confirmText ? (e.openBlock(), e.createElementBlock(
                          e.Fragment,
                          { key: 0 },
                          [
                            e.createTextVNode(
                              " · " + e.toDisplayString(u.confirmText),
                              1
                              /* TEXT */
                            )
                          ],
                          64
                          /* STABLE_FRAGMENT */
                        )) : e.createCommentVNode("v-if", !0)
                      ])
                    ]),
                    u.needsMe ? (e.openBlock(), e.createElementBlock(
                      "span",
                      Zv,
                      e.toDisplayString(f.$t("待你处理")),
                      1
                      /* TEXT */
                    )) : e.createCommentVNode("v-if", !0),
                    e.createElementVNode(
                      "span",
                      {
                        class: e.normalizeClass(["mm-tag", P(u.status)])
                      },
                      e.toDisplayString(e.unref(Xe)[u.status] || u.status),
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
                  ], 8, Jv))),
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
              e.createElementVNode("div", Xv, [
                e.createVNode(Pt, {
                  tasks: o.value.tasks,
                  "group-by": "status",
                  "empty-text": f.$t("这个项目还没有任务"),
                  onSelect: d[5] || (d[5] = (u) => e.unref(de)({ kind: "task", id: u.id }))
                }, null, 8, ["tasks", "empty-text"])
              ])
            ],
            2112
            /* STABLE_FRAGMENT, DEV_ROOT_FRAGMENT */
          )) : b.value === "reports" ? (e.openBlock(), e.createBlock(up, {
            key: 5,
            project: T.value,
            "focus-report-id": m.value,
            "can-generate": o.value.can.generateReport ?? T.value.status !== "archived",
            onChanged: E
          }, null, 8, ["project", "focus-report-id", "can-generate"])) : (e.openBlock(), e.createBlock(Ip, {
            key: 6,
            project: T.value,
            can: o.value.can,
            members: o.value.members,
            generating: !!o.value.summaryGenerating,
            "is-owner": D.value,
            onChanged: E
          }, null, 8, ["project", "can", "members", "generating", "is-owner"]))
        ],
        64
        /* STABLE_FRAGMENT */
      )) : e.createCommentVNode("v-if", !0),
      o.value && T.value ? (e.openBlock(), e.createBlock(Xp, {
        key: 3,
        open: h.value,
        "project-id": T.value.id,
        "owner-id": T.value.ownerId,
        "member-ids": T.value.memberIds,
        members: o.value.members,
        onClose: d[6] || (d[6] = (u) => h.value = !1),
        onSaved: M
      }, null, 8, ["open", "project-id", "owner-id", "member-ids", "members"])) : e.createCommentVNode("v-if", !0),
      o.value && T.value && a.value ? (e.openBlock(), e.createBlock(Ft, {
        key: 4,
        "project-id": T.value.id,
        onClose: d[7] || (d[7] = (u) => a.value = !1),
        onCreated: I
      }, null, 8, ["project-id"])) : e.createCommentVNode("v-if", !0)
    ]));
  }
}), ek = /* @__PURE__ */ ae(xv, [["__scopeId", "data-v-614cbe4b"]]), tk = {
  class: "mm-pcd",
  "data-test": "mm-project-create"
}, lk = { class: "ss-field" }, nk = ["placeholder"], ok = { class: "ss-field" }, ak = ["placeholder"], sk = { class: "mm-pcd__cols" }, rk = { class: "mm-pcd__f" }, ik = { class: "mm-pcd__f" }, ck = { class: "ss-muted" }, dk = {
  key: 0,
  class: "ss-note danger"
}, mk = ["disabled"], uk = /* @__PURE__ */ e.defineComponent({
  __name: "ProjectCreateDialog",
  props: {
    open: { type: Boolean }
  },
  emits: ["close", "created"],
  setup(l, { emit: v }) {
    const n = l, p = v, y = e.ref([]), s = e.ref([]), o = e.ref(!1), c = e.ref(""), i = e.reactive({ name: "", desc: "", ownerId: "", memberIds: [] }), k = e.computed(() => [.../* @__PURE__ */ new Set([...i.ownerId ? [i.ownerId] : [], ...i.memberIds])]);
    e.watch(() => n.open, async (m) => {
      if (!m) return;
      const r = oe.value?.me.person?.id || "";
      Object.assign(i, { name: "", desc: "", ownerId: r, memberIds: r ? [r] : [] }), c.value = "";
      try {
        const g = await J("people.list");
        y.value = g?.people ?? [], s.value = g?.depts ?? [];
      } catch (g) {
        c.value = X.errorMessage(g);
      }
    }, { immediate: !0 }), e.watch(() => i.ownerId, (m) => {
      m && !i.memberIds.includes(m) && (i.memberIds = [m, ...i.memberIds]);
    });
    async function b() {
      o.value = !0, c.value = "";
      try {
        const m = await J("project.create", { name: i.name.trim(), desc: i.desc.trim(), ownerId: i.ownerId, memberIds: k.value });
        p("created", m);
      } catch (m) {
        c.value = X.errorMessage(m);
      } finally {
        o.value = !1;
      }
    }
    return (m, r) => (e.openBlock(), e.createBlock(Ze, {
      open: l.open,
      title: m.$t("新建项目"),
      icon: "ri-folder-add-line",
      size: "lg",
      onClose: r[5] || (r[5] = (g) => p("close"))
    }, {
      footer: e.withCtx(() => [
        e.createElementVNode(
          "button",
          {
            type: "button",
            class: "ss-btn",
            onClick: r[4] || (r[4] = (g) => p("close"))
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
          onClick: b
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
        ], 8, mk)
      ]),
      default: e.withCtx(() => [
        e.createElementVNode("div", tk, [
          e.createElementVNode("label", lk, [
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(m.$t("项目名称")),
              1
              /* TEXT */
            ),
            e.withDirectives(e.createElementVNode("input", {
              "onUpdate:modelValue": r[0] || (r[0] = (g) => i.name = g),
              type: "text",
              maxlength: "60",
              placeholder: m.$t("如：A2 量产导入项目"),
              "data-test": "mm-pc-name"
            }, null, 8, nk), [
              [e.vModelText, i.name]
            ])
          ]),
          e.createElementVNode("label", ok, [
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(m.$t("项目说明")),
              1
              /* TEXT */
            ),
            e.withDirectives(e.createElementVNode("textarea", {
              "onUpdate:modelValue": r[1] || (r[1] = (g) => i.desc = g),
              rows: "3",
              placeholder: m.$t("项目目标、范围、关键节点"),
              "data-test": "mm-pc-desc"
            }, null, 8, ak), [
              [e.vModelText, i.desc]
            ])
          ]),
          e.createElementVNode("div", sk, [
            e.createElementVNode("div", rk, [
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(m.$t("项目负责人")),
                1
                /* TEXT */
              ),
              e.createVNode(we, {
                modelValue: i.ownerId,
                "onUpdate:modelValue": r[2] || (r[2] = (g) => i.ownerId = g),
                people: y.value,
                depts: s.value,
                multiple: !1,
                "max-height": 240
              }, null, 8, ["modelValue", "people", "depts"])
            ]),
            e.createElementVNode("div", ik, [
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(m.$t("项目成员（{n} 人）", { n: k.value.length })),
                1
                /* TEXT */
              ),
              e.createVNode(we, {
                modelValue: i.memberIds,
                "onUpdate:modelValue": r[3] || (r[3] = (g) => i.memberIds = g),
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
            ck,
            e.toDisplayString(m.$t("项目负责人自动成为成员；之后会议的主持人、参会人、任务负责人和接收任务的部门负责人也会自动加入。")),
            1
            /* TEXT */
          ),
          c.value ? (e.openBlock(), e.createElementBlock("p", dk, [
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
}), pk = /* @__PURE__ */ ae(uk, [["__scopeId", "data-v-ed67c1d7"]]), vk = {
  class: "mm-projects",
  "data-test": "mm-projects-tab"
}, kk = { class: "mm-pagehead" }, yk = {
  key: 0,
  class: "ss-note danger"
}, gk = { class: "mm-projects__grid" }, fk = { class: "mm-plist" }, Nk = { class: "mm-search" }, Vk = ["placeholder", "aria-label"], Ek = ["aria-label"], $k = ["aria-selected", "data-test", "onClick"], bk = {
  key: 0,
  class: "mm-plist__empty"
}, hk = {
  key: 1,
  class: "mm-plist__empty"
}, _k = ["data-test", "onClick"], Bk = { class: "mm-pcard__top" }, Sk = {
  key: 0,
  class: "mm-pcard__over"
}, Dk = { class: "mm-pcard__bot" }, wk = { class: "mm-bar" }, Ck = { class: "owner" }, Tk = { class: "mm-plist__foot" }, Ik = { class: "mm-projects__detail" }, Mk = {
  key: 1,
  class: "mm-projects__none"
}, Ak = /* @__PURE__ */ e.defineComponent({
  __name: "ProjectsTab",
  emits: ["role"],
  setup(l, { expose: v, emit: n }) {
    const p = ["active", "closing", "archived"], y = {
      active: t.t("没有进行中的项目"),
      closing: t.t("没有结项中的项目"),
      archived: t.t("没有已归档的项目")
    }, s = ie.useNotificationStore(), o = e.ref([]), c = e.ref("active"), i = e.ref(""), k = e.ref(""), b = e.ref(0), m = e.ref(null), r = e.ref(!1), g = e.ref(!1), h = e.ref(""), a = n;
    function N(z) {
      We.value = z, a("role", z);
    }
    e.watch(k, (z) => {
      z || N("");
    });
    const T = e.computed(() => Object.fromEntries(p.map((z) => [z, o.value.filter((Q) => Q.status === z).length]))), U = e.computed(() => {
      const z = i.value.trim().toLowerCase();
      return o.value.filter((Q) => Q.status === c.value && (!z || `${Q.name} ${Q.ownerName}`.toLowerCase().includes(z)));
    }), j = (z) => typeof z.rate == "number" && Number.isFinite(z.rate) ? Ne(z.rate) : vt(z.done, z.total);
    async function D() {
      g.value = !0;
      try {
        const z = await J("project.list", {});
        o.value = Array.isArray(z) ? z : [], h.value = "", P();
      } catch (z) {
        h.value = X.errorMessage(z);
      } finally {
        g.value = !1;
      }
    }
    let A = !0;
    function P() {
      const z = o.value.find((Q) => Q.id === k.value);
      if (z) {
        z.status !== c.value && (c.value = z.status);
        return;
      }
      if (!(k.value && m.value)) {
        if (A && !T.value[c.value]) {
          const Q = p.find((te) => T.value[te] > 0);
          Q && (c.value = Q);
        }
        A = !1, k.value = U.value[0]?.id ?? "";
      }
    }
    e.watch(c, () => {
      U.value.some((z) => z.id === k.value) || (k.value = U.value[0]?.id ?? "");
    });
    function R(z) {
      k.value = z, m.value = null;
    }
    async function _(z) {
      if (o.value.some((Q) => Q.id === z)) return z;
      for (const Q of o.value)
        try {
          const te = await J("project.get", { id: Q.id });
          if (te?.project?.weeklyReports?.some((K) => K.id === z) || te?.project?.summary?.id === z) return Q.id;
        } catch {
        }
      return "";
    }
    async function S() {
      const z = ge.value;
      if (z.tab !== "projects") return;
      const Q = Ll(z.link);
      if (!Q) return;
      let te = Q.projectId || "", K = Q.reportId;
      if (z.link?.kind === "report" && !z.link.anchor && (te = await _(z.link.id), te === z.link.id && (K = void 0)), !te) {
        s.warn(t.t("没找到要打开的项目或报告"));
        return;
      }
      const G = o.value.find((ee) => ee.id === te);
      G && (c.value = G.status), i.value = "", k.value = te, m.value = { tab: Q.tab, reportId: K, seq: z.seq };
    }
    e.watch(() => ge.value.seq, () => {
      S();
    });
    async function E(z) {
      r.value = !1, s.success(t.t("项目已创建")), c.value = "active", i.value = "", await D(), z?.id && R(z.id);
    }
    let M = null, I = null, H = 0;
    function f() {
      M && clearTimeout(M), M = setTimeout(() => {
        M = null, H = Date.now(), D(), b.value += 1;
      }, 250);
    }
    function d() {
      M || Date.now() - H < 800 || f();
    }
    v({ refresh: d });
    let u = !1;
    return e.onMounted(async () => {
      H = Date.now(), await D(), !u && (await S(), !u && (I = Se((z) => {
        z.type !== "changed" || !["all", "project", "task", "meeting", "org"].includes(z.scope) || f();
      })));
    }), e.onBeforeUnmount(() => {
      u = !0, I?.(), I = null, M && clearTimeout(M), We.value = "";
    }), (z, Q) => (e.openBlock(), e.createElementBlock("div", vk, [
      e.createElementVNode("header", kk, [
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
        Q[5] || (Q[5] = e.createElementVNode(
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
          onClick: Q[0] || (Q[0] = (te) => r.value = !0)
        }, [
          Q[4] || (Q[4] = e.createElementVNode(
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
      h.value ? (e.openBlock(), e.createElementBlock("p", yk, [
        Q[6] || (Q[6] = e.createElementVNode(
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
      e.createElementVNode("div", gk, [
        e.createElementVNode("aside", fk, [
          e.createElementVNode("label", Nk, [
            Q[7] || (Q[7] = e.createElementVNode(
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
              "onUpdate:modelValue": Q[1] || (Q[1] = (te) => i.value = te),
              type: "search",
              placeholder: z.$t("搜索项目"),
              "aria-label": z.$t("搜索项目"),
              "data-test": "mm-projects-search"
            }, null, 8, Vk), [
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
              e.renderList(p, (te) => e.createElementVNode("button", {
                key: te,
                type: "button",
                role: "tab",
                "aria-selected": c.value === te,
                class: e.normalizeClass({ on: c.value === te }),
                "data-test": `mm-projects-filter-${te}`,
                onClick: (K) => c.value = te
              }, [
                e.createTextVNode(
                  e.toDisplayString(e.unref(Ge)[te]) + " ",
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "em",
                  null,
                  e.toDisplayString(T.value[te]),
                  1
                  /* TEXT */
                )
              ], 10, $k)),
              64
              /* STABLE_FRAGMENT */
            ))
          ], 8, Ek),
          g.value && !o.value.length ? (e.openBlock(), e.createElementBlock(
            "p",
            bk,
            e.toDisplayString(z.$t("加载中…")),
            1
            /* TEXT */
          )) : U.value.length ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock(
            "p",
            hk,
            e.toDisplayString(i.value ? z.$t("没有匹配的项目") : y[c.value]),
            1
            /* TEXT */
          )),
          (e.openBlock(!0), e.createElementBlock(
            e.Fragment,
            null,
            e.renderList(U.value, (te) => (e.openBlock(), e.createElementBlock("button", {
              key: te.id,
              type: "button",
              class: e.normalizeClass(["mm-pcard", { on: te.id === k.value }]),
              "data-test": `mm-project-card-${te.id}`,
              onClick: (K) => R(te.id)
            }, [
              e.createElementVNode("span", Bk, [
                e.createElementVNode(
                  "strong",
                  null,
                  e.toDisplayString(te.name),
                  1
                  /* TEXT */
                ),
                te.overdue > 0 ? (e.openBlock(), e.createElementBlock(
                  "span",
                  Sk,
                  e.toDisplayString(z.$t("逾期 {n}", { n: te.overdue })),
                  1
                  /* TEXT */
                )) : e.createCommentVNode("v-if", !0)
              ]),
              e.createElementVNode("span", Dk, [
                e.createElementVNode("i", wk, [
                  e.createElementVNode(
                    "b",
                    {
                      style: e.normalizeStyle({ width: `${j(te)}%` })
                    },
                    null,
                    4
                    /* STYLE */
                  )
                ]),
                e.createElementVNode(
                  "em",
                  null,
                  e.toDisplayString(j(te)) + "%",
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "span",
                  Ck,
                  e.toDisplayString(te.ownerName),
                  1
                  /* TEXT */
                )
              ])
            ], 10, _k))),
            128
            /* KEYED_FRAGMENT */
          )),
          e.createElementVNode(
            "p",
            Tk,
            e.toDisplayString(z.$t("只显示你参与的项目")),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode("div", Ik, [
          k.value ? (e.openBlock(), e.createBlock(ek, {
            key: 0,
            "project-id": k.value,
            "refresh-seq": b.value,
            focus: m.value,
            onChanged: D,
            onRole: N
          }, null, 8, ["project-id", "refresh-seq", "focus"])) : (e.openBlock(), e.createElementBlock("div", Mk, [
            Q[9] || (Q[9] = e.createElementVNode(
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
              onClick: Q[2] || (Q[2] = (te) => r.value = !0)
            }, [
              Q[8] || (Q[8] = e.createElementVNode(
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
      e.createVNode(pk, {
        open: r.value,
        onClose: Q[3] || (Q[3] = (te) => r.value = !1),
        onCreated: E
      }, null, 8, ["open"])
    ]));
  }
}), jk = /* @__PURE__ */ ae(Ak, [["__scopeId", "data-v-0f0a7b72"]]), Lk = {
  class: "mm-rec",
  "data-test": "mm-rec"
}, zk = { class: "mm-rec__tip" }, Fk = {
  class: "mm-rec__script",
  "data-test": "mm-rec-script"
}, Pk = { class: "mm-rec__bar" }, Uk = ["disabled"], Ok = {
  key: 0,
  class: "mm-rec__dot"
}, Rk = { class: "mm-rec__meter" }, qk = {
  key: 0,
  class: "ss-note warn"
}, Kk = ["src"], Hk = {
  key: 2,
  class: "ss-note danger",
  "data-test": "mm-rec-error"
}, _t = 10, Wk = 15, Gk = /* @__PURE__ */ e.defineComponent({
  __name: "VoiceRecorder",
  props: {
    script: {},
    disabled: { type: Boolean }
  },
  emits: ["recorded", "reset"],
  setup(l, { emit: v }) {
    const n = v, p = e.ref("idle"), y = e.ref(0), s = e.ref(0), o = e.ref(""), c = e.ref("");
    let i = null, k = null, b = [], m = null, r = 0, g = null, h = 0;
    function a() {
      m && (clearInterval(m), m = null), r && (cancelAnimationFrame(r), r = 0);
      try {
        i?.getTracks().forEach((D) => D.stop());
      } catch {
      }
      i = null;
      try {
        g?.close();
      } catch {
      }
      g = null, s.value = 0;
    }
    function N() {
      for (const D of ["audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus", "audio/mp4"])
        try {
          if (typeof MediaRecorder < "u" && MediaRecorder.isTypeSupported(D)) return D;
        } catch {
        }
      return "";
    }
    async function T() {
      o.value = "", c.value && (URL.revokeObjectURL(c.value), c.value = ""), n("reset");
      try {
        i = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: !0, noiseSuppression: !1, autoGainControl: !0 } });
      } catch (A) {
        o.value = A?.name === "NotAllowedError" ? t.t("没有麦克风权限：请在系统设置 → 隐私与安全性 → 麦克风里允许本应用，或改用「导入录音文件」") : t.t("打不开麦克风：{p0}", { p0: A?.message || "-" }), a();
        return;
      }
      const D = N();
      try {
        k = D ? new MediaRecorder(i, { mimeType: D }) : new MediaRecorder(i);
      } catch (A) {
        o.value = t.t("这台电脑不支持录音：{p0}", { p0: A?.message || "-" }), a();
        return;
      }
      b = [], k.ondataavailable = (A) => {
        A.data && A.data.size && b.push(A.data);
      }, k.onstop = () => void j(k?.mimeType || D);
      try {
        g = new AudioContext();
        const A = g.createAnalyser();
        A.fftSize = 1024, g.createMediaStreamSource(i).connect(A);
        const P = new Uint8Array(A.fftSize), R = () => {
          A.getByteTimeDomainData(P);
          let _ = 0;
          for (const S of P) _ = Math.max(_, Math.abs(S - 128));
          s.value = Math.min(100, Math.round(_ / 128 * 140)), r = requestAnimationFrame(R);
        };
        R();
      } catch {
      }
      h = Date.now(), y.value = 0, p.value = "recording", k.start(250), m = setInterval(() => {
        y.value = Math.floor((Date.now() - h) / 1e3), y.value >= Wk && U();
      }, 200);
    }
    function U() {
      k && k.state !== "inactive" && k.stop(), m && (clearInterval(m), m = null);
    }
    async function j(D) {
      const A = Math.round((Date.now() - h) / 100) / 10;
      a(), p.value = "done", y.value = Math.round(A);
      const P = new Blob(b, { type: D || "audio/webm" });
      if (!P.size) {
        o.value = t.t("没有录到声音，请重录");
        return;
      }
      c.value = URL.createObjectURL(P);
      const R = new Uint8Array(await P.arrayBuffer());
      let _ = "";
      for (let E = 0; E < R.length; E += 32768) _ += String.fromCharCode(...R.subarray(E, E + 32768));
      const S = /ogg/.test(D) ? "ogg" : /mp4/.test(D) ? "m4a" : "webm";
      n("recorded", { data: btoa(_), ext: S, seconds: A });
    }
    return e.onBeforeUnmount(() => {
      try {
        k && k.state !== "inactive" && k.stop();
      } catch {
      }
      a(), c.value && URL.revokeObjectURL(c.value);
    }), (D, A) => (e.openBlock(), e.createElementBlock("div", Lk, [
      e.createElementVNode(
        "p",
        zk,
        e.toDisplayString(D.$t("请在安静的地方，用平时开会说话的音量和语速，朗读下面这段话：")),
        1
        /* TEXT */
      ),
      e.createElementVNode(
        "blockquote",
        Fk,
        e.toDisplayString(l.script),
        1
        /* TEXT */
      ),
      e.createElementVNode("div", Pk, [
        p.value !== "recording" ? (e.openBlock(), e.createElementBlock("button", {
          key: 0,
          type: "button",
          class: e.normalizeClass(["ss-btn", p.value === "idle" ? "primary" : ""]),
          disabled: l.disabled,
          "data-test": "mm-rec-start",
          onClick: T
        }, [
          A[0] || (A[0] = e.createElementVNode(
            "i",
            { class: "ri-mic-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            e.toDisplayString(p.value === "idle" ? D.$t("开始录音") : D.$t("重录")),
            1
            /* TEXT */
          )
        ], 10, Uk)) : (e.openBlock(), e.createElementBlock("button", {
          key: 1,
          type: "button",
          class: "ss-btn danger",
          "data-test": "mm-rec-stop",
          onClick: U
        }, [
          A[1] || (A[1] = e.createElementVNode(
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
            class: e.normalizeClass(["mm-rec__time", { live: p.value === "recording", short: y.value > 0 && y.value < _t && p.value !== "recording" }])
          },
          [
            p.value === "recording" ? (e.openBlock(), e.createElementBlock("i", Ok)) : e.createCommentVNode("v-if", !0),
            e.createTextVNode(
              e.toDisplayString(D.$t("{s} 秒", { s: y.value })),
              1
              /* TEXT */
            )
          ],
          2
          /* CLASS */
        ),
        e.createElementVNode("i", Rk, [
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
      p.value === "done" && y.value < _t ? (e.openBlock(), e.createElementBlock("p", qk, [
        A[2] || (A[2] = e.createElementVNode(
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
      c.value ? (e.openBlock(), e.createElementBlock("audio", {
        key: 1,
        src: c.value,
        controls: "",
        class: "mm-rec__audio",
        "data-test": "mm-rec-preview"
      }, null, 8, Kk)) : e.createCommentVNode("v-if", !0),
      o.value ? (e.openBlock(), e.createElementBlock("p", Hk, [
        A[3] || (A[3] = e.createElementVNode(
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
}), Rt = /* @__PURE__ */ ae(Gk, [["__scopeId", "data-v-f9d93abd"]]), Yk = {
  class: "mm-sv",
  "data-test": "mm-voiceprint"
}, Jk = { class: "mm-sp__head" }, Qk = { class: "ss-actions" }, Zk = ["disabled"], Xk = ["disabled", "title"], xk = {
  key: 0,
  class: "ss-note warn"
}, ey = { class: "ss-muted mm-sv__tip" }, ty = {
  key: 2,
  class: "ss-note danger"
}, ly = {
  class: "mm-sv__cov",
  "data-test": "mm-vp-coverage"
}, ny = { class: "mm-sv__num" }, oy = { class: "mm-sv__bar" }, ay = { class: "mm-bar" }, sy = { class: "mm-sv__tools" }, ry = {
  class: "mm-subtabs",
  role: "tablist"
}, iy = ["aria-selected", "data-test", "onClick"], cy = { class: "mm-search" }, dy = ["placeholder", "aria-label"], my = { class: "ss-table-wrap" }, uy = { class: "ss-table mm-sv__table" }, py = { class: "num" }, vy = { key: 0 }, ky = {
  colspan: "6",
  class: "mm-sv__empty"
}, yy = ["data-test"], gy = { class: "mm-sv__st" }, fy = ["title", "data-test"], Ny = ["title", "data-test"], Vy = { class: "mono" }, Ey = { class: "mono" }, $y = { class: "num" }, by = ["disabled", "onClick"], hy = ["disabled", "data-test", "onClick"], _y = ["disabled", "data-test", "onClick"], By = ["disabled", "data-test", "onClick"], Sy = ["disabled", "data-test", "onClick"], Dy = ["disabled", "data-test", "onClick"], wy = ["onClick"], Cy = { class: "mm-sv__foot" }, Ty = ["aria-label"], Iy = ["disabled", "aria-label"], My = ["aria-current", "onClick"], Ay = ["disabled", "aria-label"], jy = {
  class: "mm-sv__imp",
  "data-test": "mm-vp-import-dialog"
}, Ly = { class: "mm-sv__f" }, zy = { class: "mm-sv__f" }, Fy = {
  key: 0,
  class: "ss-muted"
}, Py = { class: "mm-sv__consent" }, Uy = {
  key: 0,
  class: "ss-note danger"
}, Oy = ["disabled"], Ry = {
  class: "mm-sv__imp",
  "data-test": "mm-vp-record-dialog"
}, qy = { class: "mm-sv__f" }, Ky = { class: "mm-sv__consent" }, Hy = {
  key: 1,
  class: "ss-note danger"
}, Wy = ["disabled"], Gy = 8, Yy = /* @__PURE__ */ e.defineComponent({
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
    ], n = l, p = be.useDialog(), y = ie.useNotificationStore(), s = e.ref([]), o = e.ref(!1), c = e.ref(!1), i = e.ref(""), k = e.ref({}), b = e.ref(null), m = e.ref("all"), r = e.ref(""), g = e.ref(1), h = e.ref(!1), a = e.reactive({ personId: "", path: "", consent: !1 }), N = e.ref(""), T = e.ref(null), U = e.ref(!1), j = e.reactive({ personId: "", consent: !1, recorded: null }), D = e.ref(""), A = e.computed(() => !!oe.value?.pushChannel || !!oe.value?.wecomConnected), P = e.computed(() => oe.value?.me.person?.id || ""), R = e.computed(() => oe.value?.pushChannel === "webhook"), _ = e.computed(() => s.value.filter((w) => w.status === "collected").length), S = e.computed(() => vt(_.value, s.value.length)), E = (w) => w === "all" ? s.value.length : s.value.filter((q) => q.status === w).length, M = e.computed(() => s.value.filter((w) => m.value === "all" || w.status === m.value).filter((w) => kt(w.person, w.deptName, r.value)).sort((w, q) => w.status === q.status ? (q.enrolledAt || 0) - (w.enrolledAt || 0) : w.status === "missing" ? -1 : 1)), I = e.computed(() => Lt(M.value, g.value, Gy));
    async function H() {
      o.value = !0;
      try {
        const w = await J("voiceprint.list");
        s.value = Array.isArray(w) ? w : [], i.value = "";
      } catch (w) {
        i.value = X.errorMessage(w);
      } finally {
        o.value = !1;
      }
    }
    e.watch(() => n.refreshSeq, () => {
      H();
    }, { immediate: !0 });
    const f = (w) => s.value.find((q) => q.person.id === w)?.person.name || n.people.find((q) => q.id === w)?.name || w, d = e.computed(() => {
      const w = s.value.find((O) => O.person.id === j.personId), q = w?.person || n.people.find((O) => O.id === j.personId), Y = w?.deptName || n.depts.find((O) => O.id === q?.deptId)?.name || "";
      return t.t("大家好，我是{dept}的{name}。这是我的声纹采集录音，用于在会议纪要里自动识别我的发言。我会用平时开会说话的音量和语速，把这段话完整地读完。", {
        dept: Y,
        name: q?.name || ""
      });
    });
    async function u() {
      const w = await J("voiceprint.link"), q = {};
      if (w && typeof w == "object" && Array.isArray(w.links))
        for (const C of w.links) C?.personId && C.url && (q[C.personId] = C.url);
      const Y = oe.value?.me.person?.id, O = Je(w);
      if (Y && O && !q[Y] && (q[Y] = O), !Object.keys(q).length) throw new Error(t.t("没拿到采集链接，请先在「手机端」开启手机页服务"));
      return k.value = q, q;
    }
    async function z() {
      c.value = !0, i.value = "";
      try {
        const w = await u(), q = s.value.filter((C) => C.status === "missing" && w[C.person.id]), Y = q.length ? q : s.value.filter((C) => w[C.person.id]), O = Y.map((C) => `${C.person.name}${C.deptName ? ` · ${C.deptName}` : ""}${t.t("：")}${w[C.person.id]}`).join(`
`);
        await Qe(O) ? y.success(q.length ? t.t("已复制 {n} 位未采集员工的采集链接（每人一条，请分别发给本人）", { n: Y.length }) : t.t("已复制 {n} 人的采集链接", { n: Y.length })) : i.value = t.t("复制失败，请重试");
      } catch (w) {
        i.value = X.errorMessage(w);
      } finally {
        c.value = !1;
      }
    }
    async function Q(w) {
      c.value = !0, i.value = "";
      try {
        const Y = (k.value[w.person.id] ? k.value : await u())[w.person.id];
        if (!Y) throw new Error(t.t("没拿到 {name} 的采集链接", { name: w.person.name }));
        await Qe(Y) && y.success(t.t("已复制 {name} 的采集链接", { name: w.person.name }));
      } catch (q) {
        i.value = X.errorMessage(q);
      } finally {
        c.value = !1;
      }
    }
    async function te() {
      if (await p.confirm({
        title: R.value ? t.t("发送到企微群") : t.t("推送到企微"),
        message: R.value ? t.t("在企微群里发一条声纹采集邀请，点名提醒还没采集的人（已采集的不打扰）？") : t.t("给还没采集的人逐个推送声纹采集卡片（已采集的不打扰）？")
      })) {
        c.value = !0, i.value = "", b.value = null;
        try {
          const q = await J("voiceprint.send");
          b.value = { sent: Number(q?.sent) || 0, failed: Array.isArray(q?.failed) ? q.failed : [] }, q?.skipped ? y.success(t.t("所有人都已采集过声纹，不用再发")) : b.value.failed.length || y.success(q?.group ? t.t("采集邀请已发到企微群") : t.t("采集卡片已推送到企微"));
        } catch (q) {
          i.value = X.errorMessage(q);
        } finally {
          c.value = !1;
        }
      }
    }
    async function K(w) {
      if (await p.confirm({
        title: t.t("删除声纹（撤回授权）"),
        message: t.t("删除 {name} 的声纹样本和授权记录？之后的会议里不再能自动识别 TA，需要重新授权采集。", { name: w.person.name }),
        danger: !0,
        confirmLabel: t.t("删除")
      })) {
        c.value = !0, i.value = "";
        try {
          await J("voiceprint.delete", { personId: w.person.id }), y.success(t.t("已删除并撤回授权")), await H();
        } catch (Y) {
          i.value = X.errorMessage(Y);
        } finally {
          c.value = !1;
        }
      }
    }
    async function G(w) {
      const q = !w.autoLearn;
      if (!(!q && !await p.confirm({
        title: t.t("关闭会议补充"),
        message: t.t("关闭后不再从会议里补充样本，已补充的 {n} 条样本会一并删除；注册时录的声纹不受影响。", { n: w.extraCount || 0 }),
        confirmLabel: t.t("关闭并删除样本"),
        danger: !0
      }))) {
        c.value = !0, i.value = "";
        try {
          await J("voiceprint.autoLearn.set", { enabled: q }), y.success(q ? t.t("已开启：之后确认会议发言时会自动补充声纹") : t.t("已关闭并删除会议补充样本")), await H();
        } catch (Y) {
          i.value = X.errorMessage(Y);
        } finally {
          c.value = !1;
        }
      }
    }
    function ee(w) {
      Object.assign(a, { personId: w, path: "", consent: !1 }), N.value = "", T.value && (T.value.value = ""), h.value = !0;
    }
    function ne(w) {
      const q = w.target.files?.[0];
      a.path = zl(q), N.value = q && !a.path ? t.t("读不到这个文件的本机路径，请选择电脑上的录音文件") : "";
    }
    async function V() {
      c.value = !0, N.value = "";
      try {
        await J("voiceprint.enroll", { personId: a.personId, path: a.path, consent: !0 }), h.value = !1, y.success(t.t("声纹已采集")), await H();
      } catch (w) {
        N.value = X.errorMessage(w);
      } finally {
        c.value = !1;
      }
    }
    function $(w) {
      Object.assign(j, { personId: w || P.value, consent: !1, recorded: null }), D.value = "", U.value = !0;
    }
    async function B() {
      if (!(!j.recorded || !j.personId)) {
        c.value = !0, D.value = "";
        try {
          const w = await J("voiceprint.enrollData", {
            personId: j.personId,
            consent: !0,
            data: j.recorded.data,
            ext: j.recorded.ext
          });
          U.value = !1, y.success(w?.seconds ? t.t("声纹已采集（{s} 秒）", { s: w.seconds }) : t.t("声纹已采集")), await H();
        } catch (w) {
          D.value = X.errorMessage(w);
        } finally {
          c.value = !1;
        }
      }
    }
    return (w, q) => (e.openBlock(), e.createElementBlock("div", Yk, [
      e.createElementVNode("header", Jk, [
        e.createElementVNode("div", null, [
          e.createElementVNode(
            "h3",
            null,
            e.toDisplayString(w.$t("声纹库")),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "p",
            null,
            e.toDisplayString(w.$t("员工在企微里打开采集链接，授权同意后录 10～15 秒，用于会议发言人识别（只在本场参会人中比对）")),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode("div", Qk, [
          e.createElementVNode("button", {
            type: "button",
            class: "ss-btn",
            disabled: c.value,
            "data-test": "mm-vp-copy",
            onClick: z
          }, [
            q[16] || (q[16] = e.createElementVNode(
              "i",
              { class: "ri-link" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(w.$t("复制采集链接")),
              1
              /* TEXT */
            )
          ], 8, Zk),
          e.createElementVNode("button", {
            type: "button",
            class: "ss-btn primary",
            disabled: c.value || !A.value,
            title: A.value ? "" : w.$t("未连接企微"),
            "data-test": "mm-vp-send",
            onClick: te
          }, [
            q[17] || (q[17] = e.createElementVNode(
              "i",
              { class: "ri-send-plane-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(R.value ? w.$t("发送到企微群") : w.$t("推送到企微")),
              1
              /* TEXT */
            )
          ], 8, Xk)
        ])
      ]),
      A.value ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock("p", xk, [
        q[18] || (q[18] = e.createElementVNode(
          "i",
          { class: "ri-information-line" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(w.$t("未连接企微：先在「消息推送」里配置企微自建应用或群机器人才能推送；也可以复制采集链接自己发。采集链接要先在「手机端」开启手机页服务。")),
          1
          /* TEXT */
        )
      ])),
      e.createElementVNode(
        "p",
        ey,
        e.toDisplayString(w.$t("每人的采集链接都带本人令牌（等同免登），只能本人打开录自己的声纹；复制时按人一条一行。")),
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
            " " + e.toDisplayString(w.$t("已推送 {a} 人", { a: b.value.sent })),
            1
            /* TEXT */
          ),
          b.value.failed.length ? (e.openBlock(), e.createElementBlock(
            e.Fragment,
            { key: 0 },
            [
              e.createTextVNode(
                e.toDisplayString(w.$t("，{b} 人失败：{names}", { b: b.value.failed.length, names: b.value.failed.slice(0, 6).map((Y) => w.$t("{p0}（{p1}）", { p0: f(Y.personId), p1: Y.error })).join(w.$t("；")) })),
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
      i.value ? (e.openBlock(), e.createElementBlock("p", ty, [
        q[19] || (q[19] = e.createElementVNode(
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
      e.createElementVNode("div", ly, [
        e.createElementVNode("div", ny, [
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
            "/ " + e.toDisplayString(w.$t("{n} 人", { n: s.value.length })),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "small",
            null,
            e.toDisplayString(w.$t("已采集")),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode("div", oy, [
          e.createElementVNode("i", ay, [
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
            e.toDisplayString(w.$t("覆盖率 {p}% · 还有 {n} 人未采集", { p: S.value, n: s.value.length - _.value })),
            1
            /* TEXT */
          )
        ])
      ]),
      e.createElementVNode("div", sy, [
        e.createElementVNode("nav", ry, [
          (e.openBlock(), e.createElementBlock(
            e.Fragment,
            null,
            e.renderList(v, (Y) => e.createElementVNode("button", {
              key: Y.key,
              type: "button",
              role: "tab",
              "aria-selected": m.value === Y.key,
              class: e.normalizeClass({ on: m.value === Y.key }),
              "data-test": `mm-vp-filter-${Y.key}`,
              onClick: (O) => {
                m.value = Y.key, g.value = 1;
              }
            }, [
              e.createTextVNode(
                e.toDisplayString(Y.title) + " ",
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "em",
                null,
                e.toDisplayString(E(Y.key)),
                1
                /* TEXT */
              )
            ], 10, iy)),
            64
            /* STABLE_FRAGMENT */
          ))
        ]),
        q[23] || (q[23] = e.createElementVNode(
          "span",
          { class: "grow" },
          null,
          -1
          /* CACHED */
        )),
        e.createElementVNode("label", cy, [
          q[20] || (q[20] = e.createElementVNode(
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
            "onUpdate:modelValue": q[0] || (q[0] = (Y) => r.value = Y),
            type: "search",
            placeholder: w.$t("搜索员工"),
            "aria-label": w.$t("搜索员工"),
            onInput: q[1] || (q[1] = (Y) => g.value = 1)
          }, null, 40, dy), [
            [e.vModelText, r.value]
          ])
        ]),
        e.createElementVNode("button", {
          type: "button",
          class: "ss-btn sm",
          "data-test": "mm-vp-record",
          onClick: q[2] || (q[2] = (Y) => $(P.value))
        }, [
          q[21] || (q[21] = e.createElementVNode(
            "i",
            { class: "ri-mic-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            e.toDisplayString(w.$t("现场录音")),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode("button", {
          type: "button",
          class: "ss-btn sm",
          "data-test": "mm-vp-import",
          onClick: q[3] || (q[3] = (Y) => ee(""))
        }, [
          q[22] || (q[22] = e.createElementVNode(
            "i",
            { class: "ri-upload-2-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            e.toDisplayString(w.$t("导入录音代为采集")),
            1
            /* TEXT */
          )
        ])
      ]),
      e.createElementVNode("div", my, [
        e.createElementVNode("table", uy, [
          e.createElementVNode("thead", null, [
            e.createElementVNode("tr", null, [
              e.createElementVNode(
                "th",
                null,
                e.toDisplayString(w.$t("员工")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "th",
                null,
                e.toDisplayString(w.$t("部门")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "th",
                null,
                e.toDisplayString(w.$t("状态")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "th",
                null,
                e.toDisplayString(w.$t("授权时间（个保法单独同意）")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "th",
                null,
                e.toDisplayString(w.$t("采集时间")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "th",
                py,
                e.toDisplayString(w.$t("操作")),
                1
                /* TEXT */
              )
            ])
          ]),
          e.createElementVNode("tbody", null, [
            I.value.rows.length ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock("tr", vy, [
              e.createElementVNode(
                "td",
                ky,
                e.toDisplayString(o.value ? w.$t("加载中…") : w.$t("没有符合条件的员工")),
                1
                /* TEXT */
              )
            ])),
            (e.openBlock(!0), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(I.value.rows, (Y) => (e.openBlock(), e.createElementBlock("tr", {
                key: Y.person.id,
                "data-test": `mm-vp-row-${Y.person.id}`
              }, [
                e.createElementVNode("td", null, [
                  e.createVNode(ze, {
                    name: Y.person.name
                  }, null, 8, ["name"])
                ]),
                e.createElementVNode(
                  "td",
                  null,
                  e.toDisplayString(Y.deptName || "—"),
                  1
                  /* TEXT */
                ),
                e.createElementVNode("td", null, [
                  e.createElementVNode("span", gy, [
                    e.createElementVNode(
                      "span",
                      {
                        class: e.normalizeClass(["ss-chip", Y.status === "collected" ? "ok" : "warn"])
                      },
                      e.toDisplayString(Y.status === "collected" ? w.$t("已采集") : w.$t("未采集")),
                      3
                      /* TEXT, CLASS */
                    ),
                    Y.needsUpdate ? (e.openBlock(), e.createElementBlock("span", {
                      key: 0,
                      class: "ss-chip warn",
                      title: w.$t("这份声纹是旧模型采的。本机已装更准的声纹模型，请本人用采集链接重录一次（只要有一位参会人还是旧声纹，整场就只能用旧模型认人）"),
                      "data-test": `mm-vp-old-${Y.person.id}`
                    }, e.toDisplayString(w.$t("建议重录")), 9, fy)) : e.createCommentVNode("v-if", !0),
                    Y.autoLearn ? (e.openBlock(), e.createElementBlock("span", {
                      key: 1,
                      class: "mm-sv__learn",
                      title: w.$t("确认会议发言后，用本人的发言自动补充声纹"),
                      "data-test": `mm-vp-learn-${Y.person.id}`
                    }, [
                      q[24] || (q[24] = e.createElementVNode(
                        "i",
                        { class: "ri-loop-right-line" },
                        null,
                        -1
                        /* CACHED */
                      )),
                      e.createTextVNode(
                        e.toDisplayString(Y.extraCount ? w.$t("会议补充 {n} 条", { n: Y.extraCount }) : w.$t("会议补充已开")),
                        1
                        /* TEXT */
                      )
                    ], 8, Ny)) : e.createCommentVNode("v-if", !0)
                  ])
                ]),
                e.createElementVNode(
                  "td",
                  Vy,
                  e.toDisplayString(Y.consentAt ? e.unref(Ve)(Y.consentAt, !0) : "—"),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "td",
                  Ey,
                  e.toDisplayString(Y.enrolledAt ? e.unref(Ve)(Y.enrolledAt) : "—"),
                  1
                  /* TEXT */
                ),
                e.createElementVNode("td", $y, [
                  Y.status === "collected" ? (e.openBlock(), e.createElementBlock(
                    e.Fragment,
                    { key: 0 },
                    [
                      Y.person.id === P.value ? (e.openBlock(), e.createElementBlock(
                        e.Fragment,
                        { key: 0 },
                        [
                          e.createElementVNode("button", {
                            type: "button",
                            class: "ss-link",
                            disabled: c.value,
                            "data-test": "mm-vp-learn-toggle",
                            onClick: (O) => G(Y)
                          }, e.toDisplayString(Y.autoLearn ? w.$t("关闭会议补充") : w.$t("开启会议补充")), 9, by),
                          q[25] || (q[25] = e.createElementVNode(
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
                      Y.needsUpdate ? (e.openBlock(), e.createElementBlock(
                        e.Fragment,
                        { key: 1 },
                        [
                          e.createElementVNode("button", {
                            type: "button",
                            class: "ss-link",
                            disabled: c.value,
                            "data-test": `mm-vp-copy-${Y.person.id}`,
                            onClick: (O) => Q(Y)
                          }, e.toDisplayString(w.$t("复制重录链接")), 9, hy),
                          q[26] || (q[26] = e.createElementVNode(
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
                        "data-test": `mm-vp-rec-${Y.person.id}`,
                        onClick: (O) => $(Y.person.id)
                      }, e.toDisplayString(w.$t("现场重录")), 9, _y),
                      q[27] || (q[27] = e.createElementVNode(
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
                        "data-test": `mm-vp-del-${Y.person.id}`,
                        onClick: (O) => K(Y)
                      }, e.toDisplayString(w.$t("删除（撤回授权）")), 9, By)
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
                        "data-test": `mm-vp-rec-${Y.person.id}`,
                        onClick: (O) => $(Y.person.id)
                      }, e.toDisplayString(w.$t("现场录音")), 9, Sy),
                      q[28] || (q[28] = e.createElementVNode(
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
                        "data-test": `mm-vp-copy-${Y.person.id}`,
                        onClick: (O) => Q(Y)
                      }, e.toDisplayString(w.$t("复制链接")), 9, Dy),
                      q[29] || (q[29] = e.createElementVNode(
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
                        onClick: (O) => ee(Y.person.id)
                      }, e.toDisplayString(w.$t("代为采集")), 9, wy)
                    ],
                    64
                    /* STABLE_FRAGMENT */
                  ))
                ])
              ], 8, yy))),
              128
              /* KEYED_FRAGMENT */
            ))
          ])
        ])
      ]),
      e.createElementVNode("footer", Cy, [
        e.createElementVNode(
          "span",
          null,
          e.toDisplayString(w.$t("共 {n} 人", { n: M.value.length })),
          1
          /* TEXT */
        ),
        q[32] || (q[32] = e.createElementVNode(
          "span",
          { class: "grow" },
          null,
          -1
          /* CACHED */
        )),
        I.value.pages > 1 ? (e.openBlock(), e.createElementBlock("nav", {
          key: 0,
          class: "mm-pager",
          "aria-label": w.$t("分页")
        }, [
          e.createElementVNode("button", {
            type: "button",
            disabled: I.value.page <= 1,
            "aria-label": w.$t("上一页"),
            onClick: q[4] || (q[4] = (Y) => g.value = I.value.page - 1)
          }, [...q[30] || (q[30] = [
            e.createElementVNode(
              "i",
              { class: "ri-arrow-left-s-line" },
              null,
              -1
              /* CACHED */
            )
          ])], 8, Iy),
          (e.openBlock(!0), e.createElementBlock(
            e.Fragment,
            null,
            e.renderList(I.value.pages, (Y) => (e.openBlock(), e.createElementBlock("button", {
              key: Y,
              type: "button",
              class: e.normalizeClass({ on: Y === I.value.page }),
              "aria-current": Y === I.value.page ? "page" : void 0,
              onClick: (O) => g.value = Y
            }, e.toDisplayString(Y), 11, My))),
            128
            /* KEYED_FRAGMENT */
          )),
          e.createElementVNode("button", {
            type: "button",
            disabled: I.value.page >= I.value.pages,
            "aria-label": w.$t("下一页"),
            onClick: q[5] || (q[5] = (Y) => g.value = I.value.page + 1)
          }, [...q[31] || (q[31] = [
            e.createElementVNode(
              "i",
              { class: "ri-arrow-right-s-line" },
              null,
              -1
              /* CACHED */
            )
          ])], 8, Ay)
        ], 8, Ty)) : e.createCommentVNode("v-if", !0)
      ]),
      e.createVNode(Ze, {
        open: h.value,
        title: w.$t("导入录音代为采集"),
        icon: "ri-mic-line",
        size: "md",
        description: w.$t("管理员代员工导入一段 10～15 秒、只有本人说话的清晰录音。必须先取得本人对采集声纹的单独同意。"),
        onClose: q[9] || (q[9] = (Y) => h.value = !1)
      }, {
        footer: e.withCtx(() => [
          e.createElementVNode(
            "button",
            {
              type: "button",
              class: "ss-btn",
              onClick: q[8] || (q[8] = (Y) => h.value = !1)
            },
            e.toDisplayString(w.$t("取消")),
            1
            /* TEXT */
          ),
          e.createElementVNode("button", {
            type: "button",
            class: "ss-btn primary",
            disabled: c.value || !a.personId || !a.path || !a.consent,
            "data-test": "mm-vp-import-submit",
            onClick: V
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
              e.toDisplayString(w.$t("校验并采集")),
              1
              /* TEXT */
            )
          ], 8, Oy)
        ]),
        default: e.withCtx(() => [
          e.createElementVNode("div", jy, [
            e.createElementVNode("div", Ly, [
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(w.$t("员工")),
                1
                /* TEXT */
              ),
              e.createVNode(we, {
                modelValue: a.personId,
                "onUpdate:modelValue": q[6] || (q[6] = (Y) => a.personId = Y),
                people: l.people,
                depts: l.depts,
                multiple: !1,
                "max-height": 200
              }, null, 8, ["modelValue", "people", "depts"])
            ]),
            e.createElementVNode("label", zy, [
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(w.$t("录音文件")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "input",
                {
                  ref_key: "fileEl",
                  ref: T,
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
                Fy,
                e.toDisplayString(a.path),
                1
                /* TEXT */
              )) : e.createCommentVNode("v-if", !0)
            ]),
            e.createElementVNode("label", Py, [
              e.withDirectives(e.createElementVNode(
                "input",
                {
                  "onUpdate:modelValue": q[7] || (q[7] = (Y) => a.consent = Y),
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
                e.toDisplayString(w.$t("我已取得该员工本人对采集、使用声纹（含确认会议发言后用其本人发言补充声纹）的单独同意（个人信息保护法）；授权人与授权时间会记录在案。")),
                1
                /* TEXT */
              )
            ]),
            N.value ? (e.openBlock(), e.createElementBlock("p", Uy, [
              q[33] || (q[33] = e.createElementVNode(
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
          ])
        ]),
        _: 1
        /* STABLE */
      }, 8, ["open", "title", "description"]),
      e.createVNode(Ze, {
        open: U.value,
        title: w.$t("现场录音采集声纹"),
        icon: "ri-mic-line",
        size: "md",
        description: w.$t("直接用本机麦克风录 10～15 秒声音；请由被采集人本人朗读并授权同意。"),
        onClose: q[15] || (q[15] = (Y) => U.value = !1)
      }, {
        footer: e.withCtx(() => [
          e.createElementVNode(
            "button",
            {
              type: "button",
              class: "ss-btn",
              onClick: q[14] || (q[14] = (Y) => U.value = !1)
            },
            e.toDisplayString(w.$t("取消")),
            1
            /* TEXT */
          ),
          e.createElementVNode("button", {
            type: "button",
            class: "ss-btn primary",
            disabled: c.value || !j.personId || !j.recorded || !j.consent,
            "data-test": "mm-vp-rec-submit",
            onClick: B
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
              e.toDisplayString(w.$t("提交声纹")),
              1
              /* TEXT */
            )
          ], 8, Wy)
        ]),
        default: e.withCtx(() => [
          e.createElementVNode("div", Ry, [
            e.createElementVNode("div", qy, [
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(w.$t("员工")),
                1
                /* TEXT */
              ),
              e.createVNode(we, {
                modelValue: j.personId,
                "onUpdate:modelValue": q[10] || (q[10] = (Y) => j.personId = Y),
                people: l.people,
                depts: l.depts,
                multiple: !1,
                "max-height": 180
              }, null, 8, ["modelValue", "people", "depts"])
            ]),
            U.value ? (e.openBlock(), e.createBlock(Rt, {
              key: 0,
              script: d.value,
              disabled: c.value,
              onRecorded: q[11] || (q[11] = (Y) => j.recorded = Y),
              onReset: q[12] || (q[12] = (Y) => j.recorded = null)
            }, null, 8, ["script", "disabled"])) : e.createCommentVNode("v-if", !0),
            e.createElementVNode("label", Ky, [
              e.withDirectives(e.createElementVNode(
                "input",
                {
                  "onUpdate:modelValue": q[13] || (q[13] = (Y) => j.consent = Y),
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
                e.toDisplayString(j.personId === P.value ? w.$t("我同意采集本人的声纹（声音特征），并在我确认会议发言后用其中我本人的发言补充声纹（最多保留最近 5 条），只用于在会议纪要里识别我的发言，保存在这台电脑上，可以随时在声纹库关闭补充或删除声纹。") : w.$t("我已取得该员工本人对采集、使用声纹（含确认会议发言后用其本人发言补充声纹）的单独同意（个人信息保护法）；授权人与授权时间会记录在案。")),
                1
                /* TEXT */
              )
            ]),
            D.value ? (e.openBlock(), e.createElementBlock("p", Hy, [
              q[34] || (q[34] = e.createElementVNode(
                "i",
                { class: "ri-error-warning-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(D.value),
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
}), Jy = /* @__PURE__ */ ae(Yy, [["__scopeId", "data-v-c960e8d1"]]), Qy = {
  class: "mm-so",
  "data-test": "mm-org"
}, Zy = { class: "mm-sp__head" }, Xy = { class: "ss-actions" }, xy = ["disabled"], eg = ["disabled"], tg = {
  key: 0,
  class: "ss-note warn"
}, lg = {
  key: 1,
  class: "ss-note warn",
  "data-test": "mm-org-warnings"
}, ng = {
  key: 2,
  class: "ss-note danger"
}, og = {
  key: 3,
  class: "mm-so__last",
  "data-test": "mm-org-last"
}, ag = { class: "mm-so__lasthead" }, sg = {
  key: 0,
  class: "ss-chip bad"
}, rg = {
  key: 0,
  class: "ss-note danger"
}, ig = { class: "mm-so__diff" }, cg = ["disabled", "aria-expanded", "onClick"], dg = {
  key: 1,
  class: "mm-so__names"
}, mg = {
  key: 4,
  class: "ss-muted"
}, ug = { class: "mm-so__cols" }, pg = ["aria-label"], vg = { class: "mm-so__cap" }, kg = ["data-test", "onClick"], yg = {
  key: 0,
  class: "ss-muted"
}, gg = { class: "ss-table-wrap" }, fg = { class: "ss-table" }, Ng = { key: 0 }, Vg = {
  colspan: "7",
  class: "mm-so__empty"
}, Eg = ["data-test"], $g = ["placeholder"], bg = ["placeholder"], hg = { class: "mm-so__ops" }, _g = ["disabled", "onClick"], Bg = ["title"], Sg = { class: "mono" }, Dg = { class: "mm-so__ops" }, wg = ["data-test", "onClick"], Cg = /* @__PURE__ */ e.defineComponent({
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
    ], p = l, y = v, s = ie.useNotificationStore(), o = e.ref(!1), c = e.ref(""), i = e.ref(null), k = e.ref(""), b = e.ref(""), m = e.computed(() => !!oe.value?.wecomConnected), r = (E) => oe.value?.org.source !== "demo" || !!E.wecomIdManual, g = (E) => E.mobile || E.wecomUserId && r(E) ? t.t("群消息能提醒到本人") : t.t("没有手机号和企微账号：群消息里只写姓名"), h = e.ref(""), a = e.reactive({ mobile: "", wecomUserId: "" });
    function N(E) {
      h.value = E.id, a.mobile = E.mobile || "", a.wecomUserId = E.wecomUserId && r(E) ? E.wecomUserId : "";
    }
    async function T(E) {
      o.value = !0, c.value = "";
      try {
        const M = { personId: E.id, mobile: a.mobile.trim() };
        (a.wecomUserId.trim() || r(E)) && (M.wecomUserId = a.wecomUserId.trim()), await J("org.person.contact", M), h.value = "", s.success(t.t("已保存")), y("changed");
      } catch (M) {
        c.value = X.errorMessage(M);
      } finally {
        o.value = !1;
      }
    }
    async function U() {
      o.value = !0, c.value = "";
      try {
        const E = await J("org.importFile");
        if (!E) return;
        i.value = E, s.success(t.t("导入完成：新增 {a}、变更 {b}、离职 {c}", { a: E.added.length, b: E.changed.length, c: E.left.length })), y("changed");
      } catch (E) {
        c.value = X.errorMessage(E);
      } finally {
        o.value = !1;
      }
    }
    const j = e.computed(() => i.value ?? oe.value?.org.lastSync ?? null), D = e.computed(() => p.people.filter((E) => E.deptId === b.value && !E.left)), A = (E) => p.people.find((M) => M.id === E)?.name || E, P = (E) => p.people.filter((M) => M.deptId === E && !M.left).length, R = (E) => E.leaderIds.map(A).join(t.t("、")), _ = (E) => {
      const M = p.depts.find((I) => I.id === b.value);
      return M ? M.leaderIds.indexOf(E) + 1 : 0;
    };
    e.watch(() => p.depts, (E) => {
      E.some((M) => M.id === b.value) || (b.value = E[0]?.id ?? "");
    }, { immediate: !0 });
    async function S() {
      o.value = !0, c.value = "";
      try {
        const E = await J("org.sync");
        i.value = E, E?.error ? c.value = E.error : s.success(t.t("同步完成：新增 {a}、变更 {b}、离职 {c}", { a: E?.added?.length ?? 0, b: E?.changed?.length ?? 0, c: E?.left?.length ?? 0 })), y("changed");
      } catch (E) {
        c.value = X.errorMessage(E);
      } finally {
        o.value = !1;
      }
    }
    return (E, M) => (e.openBlock(), e.createElementBlock("div", Qy, [
      e.createElementVNode("header", Zy, [
        e.createElementVNode("div", null, [
          e.createElementVNode(
            "h3",
            null,
            e.toDisplayString(E.$t("通讯录同步")),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "p",
            null,
            e.toDisplayString(E.$t("人员只来自企微通讯录：部门、部门负责人（任务下发给第一位）、成员、职务、直属上级。系统内不维护人员信息；离职人员保留历史数据，不能再被选。")),
            1
            /* TEXT */
          ),
          e.createElementVNode("p", null, [
            e.createTextVNode(
              e.toDisplayString(E.$t("没有企微自建应用时，可以导入企微管理后台导出的通讯录表格（通讯录 → 批量导入/导出 → 导出成员）。群消息按手机号或企微账号提醒本人，表里没有的可以在下面逐个填。")) + " ",
              1
              /* TEXT */
            ),
            e.createElementVNode("button", {
              type: "button",
              class: "ss-link",
              "data-test": "mm-org-link-contacts",
              onClick: M[0] || (M[0] = (I) => e.unref(ue)(e.unref(fe).contacts))
            }, [
              e.createTextVNode(
                e.toDisplayString(E.$t("去企微后台导出")) + " ",
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
        e.createElementVNode("div", Xy, [
          e.createElementVNode("button", {
            type: "button",
            class: "ss-btn",
            disabled: o.value,
            "data-test": "mm-org-import",
            onClick: U
          }, [
            M[5] || (M[5] = e.createElementVNode(
              "i",
              { class: "ri-file-excel-2-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(E.$t("导入通讯录表格")),
              1
              /* TEXT */
            )
          ], 8, xy),
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
              e.toDisplayString(E.$t("立即同步")),
              1
              /* TEXT */
            )
          ], 8, eg)
        ])
      ]),
      m.value ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock("p", tg, [
        M[6] || (M[6] = e.createElementVNode(
          "i",
          { class: "ri-information-line" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(E.$t("未连接企微：「立即同步」会载入演示组织。到「消息推送」里填好 CorpID / AgentID / Secret 后再同步，就是真实通讯录。")),
          1
          /* TEXT */
        )
      ])),
      j.value?.warnings?.length ? (e.openBlock(), e.createElementBlock("div", lg, [
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
            e.renderList(j.value.warnings, (I, H) => (e.openBlock(), e.createElementBlock(
              "p",
              { key: H },
              e.toDisplayString(I),
              1
              /* TEXT */
            ))),
            128
            /* KEYED_FRAGMENT */
          ))
        ])
      ])) : e.createCommentVNode("v-if", !0),
      c.value ? (e.openBlock(), e.createElementBlock("p", ng, [
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
      j.value ? (e.openBlock(), e.createElementBlock("section", og, [
        e.createElementVNode("div", ag, [
          e.createElementVNode(
            "strong",
            null,
            e.toDisplayString(E.$t("上次同步")),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "span",
            null,
            e.toDisplayString(e.unref(Ve)(j.value.at)),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "span",
            null,
            e.toDisplayString(E.$t("操作人 {name}", { name: A(j.value.by) })),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "span",
            {
              class: e.normalizeClass(["ss-chip", j.value.source === "demo" ? "brand" : "ok"])
            },
            e.toDisplayString(j.value.source === "wecom" ? E.$t("企微通讯录") : j.value.source === "import" ? E.$t("导入的通讯录") : E.$t("演示组织")),
            3
            /* TEXT, CLASS */
          ),
          j.value.error ? (e.openBlock(), e.createElementBlock(
            "span",
            sg,
            e.toDisplayString(E.$t("同步出错")),
            1
            /* TEXT */
          )) : e.createCommentVNode("v-if", !0)
        ]),
        j.value.error ? (e.openBlock(), e.createElementBlock(
          "p",
          rg,
          e.toDisplayString(j.value.error),
          1
          /* TEXT */
        )) : e.createCommentVNode("v-if", !0),
        e.createElementVNode("ul", ig, [
          (e.openBlock(), e.createElementBlock(
            e.Fragment,
            null,
            e.renderList(n, (I) => e.createElementVNode(
              "li",
              {
                key: I.key,
                class: e.normalizeClass(I.key)
              },
              [
                e.createElementVNode("button", {
                  type: "button",
                  disabled: !j.value[I.key].length,
                  "aria-expanded": k.value === I.key,
                  onClick: (H) => k.value = k.value === I.key ? "" : I.key
                }, [
                  e.createElementVNode(
                    "b",
                    null,
                    e.toDisplayString(j.value[I.key].length),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "small",
                    null,
                    e.toDisplayString(I.title),
                    1
                    /* TEXT */
                  )
                ], 8, cg)
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
          dg,
          e.toDisplayString(j.value[k.value].map(A).join(E.$t("、"))),
          1
          /* TEXT */
        )) : e.createCommentVNode("v-if", !0)
      ])) : (e.openBlock(), e.createElementBlock(
        "p",
        mg,
        e.toDisplayString(E.$t("还没有同步过")),
        1
        /* TEXT */
      )),
      e.createElementVNode("div", ug, [
        e.createElementVNode("nav", {
          class: "mm-so__depts",
          "aria-label": E.$t("部门")
        }, [
          e.createElementVNode(
            "p",
            vg,
            e.toDisplayString(E.$t("部门（{n}）", { n: l.depts.length })),
            1
            /* TEXT */
          ),
          (e.openBlock(!0), e.createElementBlock(
            e.Fragment,
            null,
            e.renderList(l.depts, (I) => (e.openBlock(), e.createElementBlock("button", {
              key: I.id,
              type: "button",
              class: e.normalizeClass({ on: b.value === I.id }),
              "data-test": `mm-org-dept-${I.id}`,
              onClick: (H) => b.value = I.id
            }, [
              e.createElementVNode(
                "strong",
                null,
                e.toDisplayString(I.name),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "small",
                null,
                e.toDisplayString(E.$t("{n} 人", { n: P(I.id) })) + " · " + e.toDisplayString(E.$t("负责人 {names}", { names: R(I) || "—" })),
                1
                /* TEXT */
              )
            ], 10, kg))),
            128
            /* KEYED_FRAGMENT */
          )),
          l.depts.length ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock(
            "p",
            yg,
            e.toDisplayString(E.$t("还没有部门")),
            1
            /* TEXT */
          ))
        ], 8, pg),
        e.createElementVNode("div", gg, [
          e.createElementVNode("table", fg, [
            e.createElementVNode("thead", null, [
              e.createElementVNode("tr", null, [
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(E.$t("姓名")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(E.$t("职务")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(E.$t("直属上级")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(E.$t("部门负责人")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(E.$t("企微账号")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(E.$t("手机号")),
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
              D.value.length ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock("tr", Ng, [
                e.createElementVNode(
                  "td",
                  Vg,
                  e.toDisplayString(E.$t("这个部门没有成员")),
                  1
                  /* TEXT */
                )
              ])),
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(D.value, (I) => (e.openBlock(), e.createElementBlock("tr", {
                  key: I.id,
                  "data-test": `mm-org-row-${I.id}`
                }, [
                  e.createElementVNode("td", null, [
                    e.createVNode(ze, {
                      name: I.name
                    }, null, 8, ["name"])
                  ]),
                  e.createElementVNode(
                    "td",
                    null,
                    e.toDisplayString(I.title || "—"),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "td",
                    null,
                    e.toDisplayString(I.leaderId ? A(I.leaderId) : "—"),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode("td", null, [
                    _(I.id) > 0 ? (e.openBlock(), e.createElementBlock(
                      "span",
                      {
                        key: 0,
                        class: e.normalizeClass(["ss-chip", _(I.id) === 1 ? "brand" : ""])
                      },
                      e.toDisplayString(_(I.id) === 1 ? E.$t("第一负责人") : E.$t("负责人 {n}", { n: _(I.id) })),
                      3
                      /* TEXT, CLASS */
                    )) : e.createCommentVNode("v-if", !0)
                  ]),
                  h.value === I.id ? (e.openBlock(), e.createElementBlock(
                    e.Fragment,
                    { key: 0 },
                    [
                      e.createElementVNode("td", null, [
                        e.withDirectives(e.createElementVNode("input", {
                          "onUpdate:modelValue": M[1] || (M[1] = (H) => a.wecomUserId = H),
                          class: "mm-so__in mono",
                          placeholder: E.$t("企微账号"),
                          spellcheck: "false",
                          "data-test": "mm-org-edit-uid"
                        }, null, 8, $g), [
                          [e.vModelText, a.wecomUserId]
                        ])
                      ]),
                      e.createElementVNode("td", null, [
                        e.withDirectives(e.createElementVNode("input", {
                          "onUpdate:modelValue": M[2] || (M[2] = (H) => a.mobile = H),
                          class: "mm-so__in mono",
                          type: "tel",
                          placeholder: E.$t("手机号"),
                          "data-test": "mm-org-edit-mobile"
                        }, null, 8, bg), [
                          [e.vModelText, a.mobile]
                        ])
                      ]),
                      e.createElementVNode("td", hg, [
                        e.createElementVNode("button", {
                          type: "button",
                          class: "ss-link",
                          disabled: o.value,
                          "data-test": "mm-org-edit-save",
                          onClick: (H) => T(I)
                        }, e.toDisplayString(E.$t("保存")), 9, _g),
                        e.createElementVNode(
                          "button",
                          {
                            type: "button",
                            class: "ss-link",
                            onClick: M[3] || (M[3] = (H) => h.value = "")
                          },
                          e.toDisplayString(E.$t("取消")),
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
                        title: g(I)
                      }, e.toDisplayString(I.wecomUserId && r(I) ? I.wecomUserId : "—"), 9, Bg),
                      e.createElementVNode(
                        "td",
                        Sg,
                        e.toDisplayString(I.mobile || "—"),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode("td", Dg, [
                        e.createElementVNode("button", {
                          type: "button",
                          class: "ss-link",
                          "data-test": `mm-org-edit-${I.id}`,
                          onClick: (H) => N(I)
                        }, e.toDisplayString(E.$t("编辑")), 9, wg)
                      ])
                    ],
                    64
                    /* STABLE_FRAGMENT */
                  ))
                ], 8, Eg))),
                128
                /* KEYED_FRAGMENT */
              ))
            ])
          ])
        ])
      ])
    ]));
  }
}), Tg = /* @__PURE__ */ ae(Cg, [["__scopeId", "data-v-8cd11796"]]), Ig = {
  class: "mm-sr",
  "data-test": "mm-roles"
}, Mg = { class: "mm-sp__head" }, Ag = {
  key: 0,
  class: "ss-note danger"
}, jg = { class: "mm-sr__cols" }, Lg = { class: "mm-sr__card" }, zg = { class: "ss-muted" }, Fg = { class: "mm-sr__card" }, Pg = { class: "ss-muted" }, Ug = {
  key: 1,
  class: "ss-note warn"
}, Og = { class: "ss-actions" }, Rg = ["disabled"], qg = /* @__PURE__ */ e.defineComponent({
  __name: "SettingsRoles",
  props: {
    settings: {},
    people: {},
    depts: {}
  },
  emits: ["saved"],
  setup(l, { emit: v }) {
    const n = l, p = v, y = be.useDialog(), s = ie.useNotificationStore(), o = e.ref(!1), c = e.ref(""), i = e.reactive({ adminIds: [], projectCreatorIds: [] }), k = (a, N) => a.length === N.length && a.every((T) => N.includes(T)), b = e.computed(() => !k(i.adminIds, n.settings.adminIds) || !k(i.projectCreatorIds, n.settings.projectCreatorIds)), m = e.computed(() => oe.value?.me.person?.id || ""), r = e.computed(() => !!m.value && n.settings.adminIds.includes(m.value) && !i.adminIds.includes(m.value));
    function g() {
      i.adminIds = [...n.settings.adminIds], i.projectCreatorIds = [...n.settings.projectCreatorIds];
    }
    e.watch(() => n.settings, g, { immediate: !0 });
    async function h() {
      if (!(r.value && !await y.confirm({ title: t.t("去掉自己的管理员"), message: t.t("保存后你将无法再进入系统设置，确定吗？"), danger: !0 }))) {
        o.value = !0, c.value = "";
        try {
          const a = await J("settings.save", { patch: { adminIds: i.adminIds, projectCreatorIds: i.projectCreatorIds } });
          s.success(t.t("角色权限已保存")), p("saved", a);
        } catch (a) {
          c.value = X.errorMessage(a);
        } finally {
          o.value = !1;
        }
      }
    }
    return (a, N) => (e.openBlock(), e.createElementBlock("div", Ig, [
      e.createElementVNode("header", Mg, [
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
      c.value ? (e.openBlock(), e.createElementBlock("p", Ag, [
        N[2] || (N[2] = e.createElementVNode(
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
      e.createElementVNode("div", jg, [
        e.createElementVNode("section", Lg, [
          e.createElementVNode(
            "h4",
            null,
            e.toDisplayString(a.$t("管理员（{n}）", { n: i.adminIds.length })),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "p",
            zg,
            e.toDisplayString(a.$t("管理员可以进入系统设置、代办与演示时切换当前身份，也可以新建项目。至少保留一位。")),
            1
            /* TEXT */
          ),
          e.createVNode(we, {
            modelValue: i.adminIds,
            "onUpdate:modelValue": N[0] || (N[0] = (T) => i.adminIds = T),
            people: l.people,
            depts: l.depts,
            "max-height": 260
          }, null, 8, ["modelValue", "people", "depts"])
        ]),
        e.createElementVNode("section", Fg, [
          e.createElementVNode(
            "h4",
            null,
            e.toDisplayString(a.$t("可新建项目的人（{n}）", { n: i.projectCreatorIds.length })),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "p",
            Pg,
            e.toDisplayString(a.$t("除管理员外，还有谁可以新建项目；建项目时指定的项目负责人不需要在这里。")),
            1
            /* TEXT */
          ),
          e.createVNode(we, {
            modelValue: i.projectCreatorIds,
            "onUpdate:modelValue": N[1] || (N[1] = (T) => i.projectCreatorIds = T),
            people: l.people,
            depts: l.depts,
            "max-height": 260
          }, null, 8, ["modelValue", "people", "depts"])
        ])
      ]),
      r.value ? (e.openBlock(), e.createElementBlock("p", Ug, [
        N[3] || (N[3] = e.createElementVNode(
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
      e.createElementVNode("div", Og, [
        e.createElementVNode("button", {
          type: "button",
          class: "ss-btn primary",
          disabled: o.value || !b.value || !i.adminIds.length,
          "data-test": "mm-roles-save",
          onClick: h
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
        ], 8, Rg),
        b.value ? (e.openBlock(), e.createElementBlock(
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
}), Kg = /* @__PURE__ */ ae(qg, [["__scopeId", "data-v-cae13c9f"]]), Hg = {
  class: "mm-asr",
  "data-test": "mm-asr"
}, Wg = ["aria-label"], Gg = ["aria-checked"], Yg = ["aria-checked"], Jg = {
  key: 0,
  class: "ss-muted"
}, Qg = { class: "mm-asr__tag" }, Zg = {
  key: 0,
  class: "ss-chip ok",
  "data-test": "mm-asr-best-ready"
}, Xg = { class: "mm-asr__facts" }, xg = {
  key: 0,
  class: "ss-note warn mm-asr__why"
}, ef = {
  key: 1,
  class: "mm-asr__act"
}, tf = ["disabled"], lf = { key: 0 }, nf = {
  class: "mm-asr__more",
  "data-test": "mm-asr-more"
}, of = { class: "ss-table-wrap" }, af = { class: "ss-table mm-asr__table" }, sf = { class: "num" }, rf = { class: "num" }, cf = { class: "num" }, df = { class: "num" }, mf = { class: "num" }, uf = ["data-test"], pf = { class: "num" }, vf = { class: "num" }, kf = { class: "num" }, yf = { class: "num" }, gf = { class: "num" }, ff = { class: "mm-asr__cell-act" }, Nf = {
  key: 0,
  class: "ss-chip ok"
}, Vf = ["disabled", "data-test", "onClick"], Ef = {
  key: 2,
  class: "ss-muted"
}, $f = { class: "ss-muted mm-asr__src" }, bf = { class: "ss-field mm-asr__pref" }, hf = { value: "auto" }, _f = {
  key: 2,
  class: "mm-asr__cloud",
  "data-test": "mm-asr-cloud"
}, Bf = { class: "ss-field" }, Sf = { value: "dashscope" }, Df = { value: "siliconflow" }, wf = { value: "custom" }, Cf = { class: "ss-field" }, Tf = { class: "ss-field" }, If = { id: "mm-asr-models" }, Mf = ["value"], Af = { class: "ss-field" }, jf = {
  key: 0,
  class: "mm-asr__set"
}, Lf = { class: "mm-asr__secret" }, zf = ["type", "placeholder"], Ff = ["title"], Pf = { class: "ss-note info" }, Uf = { class: "mm-asr__act" }, Of = ["disabled"], Rf = ["disabled"], qf = ["disabled"], Kf = {
  key: 3,
  class: "ss-muted mono mm-asr__log",
  "data-test": "mm-asr-log"
}, Hf = {
  key: 4,
  class: "ss-note danger",
  "data-test": "mm-asr-error"
}, Wf = /* @__PURE__ */ e.defineComponent({
  __name: "AsrModelPicker",
  emits: ["changed"],
  setup(l, { expose: v, emit: n }) {
    const p = n, y = ie.useNotificationStore(), s = e.ref(null), o = e.ref(!1), c = e.ref(!1), i = e.ref(""), k = e.ref(""), b = e.ref(""), m = e.ref(""), r = e.ref("local"), g = e.ref("auto"), h = e.reactive({ provider: "dashscope", baseUrl: "", model: "", apiKey: "" }), a = e.ref(!1), N = e.ref(""), T = e.ref(!1), U = e.computed(() => s.value?.asr.presets ?? []), j = e.computed(() => U.value.find(($) => $.id === h.provider)), D = e.computed(() => j.value?.models ?? []), A = e.computed(() => j.value?.keyUrl || ""), P = e.computed(() => !!s.value?.models.asrReady), R = e.computed(() => s.value?.recommend.engine === "firered" ? { title: t.t("FireRedASR2（最准）+ SenseVoice 兜底"), desc: t.t("实测最准的本机模型：普通话、各地口音、吴语 / 上海话 / 闽南语 / 粤语和专业名词都明显好于以前的 Whisper。嘈杂片段自动换 SenseVoice 的结果，不会出乱码。") } : { title: t.t("SenseVoice（快速）"), desc: t.t("又快又小：普通话、口音和粤语都认，带标点，比以前的 Whisper 准一倍，1 小时录音一两分钟转完。") }), _ = e.computed(() => {
      const $ = s.value?.recommend, B = s.value?.hardware;
      if (!$?.downgradeReason || !B) return "";
      const w = $.downgradeReason === "memory" ? t.t("内存 {n} GB", { n: B.memGb }) : $.downgradeReason === "cores" ? t.t("处理器 {n} 核", { n: B.cores }) : t.t("磁盘只剩 {n} GB", { n: B.freeDiskGb ?? 0 });
      return t.t("最准的 FireRedASR2 需要 16 GB 以上内存、8 核以上处理器和约 1.5 GB 磁盘，这台电脑{why}，所以推荐 SenseVoice。", { why: w });
    }), S = e.computed(() => {
      const $ = s.value;
      if (!$) return [];
      const B = $.estimates;
      return [
        { key: "firered", name: "FireRedASR2", note: t.t("最准，含方言"), room: "12.5%", phone: "10.6%", wu: "18.5%", time: B ? t.t("约 {n} 分钟", { n: B.firered }) : "—", size: "1.2 GB", ready: !!$.models.fireRed, installId: "asr-meeting-firered2" },
        { key: "sensevoice", name: "SenseVoice", note: t.t("快、小，也做兜底"), room: "14.3%", phone: "20.3%", wu: "34.5%", time: B ? t.t("约 {n} 分钟", { n: B.sensevoice }) : "—", size: "228 MB", ready: !!$.models.senseVoice, installId: "asr-meeting-sensevoice" },
        { key: "whisper", name: "Whisper large-v3", note: t.t("只在阿拉伯语等其他语种时用"), room: "31.7%", phone: "34.5%", wu: "77.7%", time: t.t("约 16 分钟"), size: "2.9 GB", ready: $.models.asrModel === "large-v3", installId: "" }
      ];
    });
    function E($) {
      r.value = $.asr.mode, g.value = $.asr.localModel;
      const B = $.asr.cloud, w = B?.provider ?? "dashscope", q = $.asr.presets.find((Y) => Y.id === w);
      Object.assign(h, { provider: w, baseUrl: B?.baseUrl ?? q?.baseUrl ?? "", model: B?.model ?? q?.models[0] ?? "", apiKey: "" });
    }
    async function M() {
      o.value = !0;
      try {
        const $ = await J("setup.status");
        s.value = $, $ && E($), k.value = "";
      } catch ($) {
        k.value = X.errorMessage($);
      } finally {
        o.value = !1;
      }
    }
    async function I($, B) {
      c.value = !0, i.value = $, k.value = "";
      try {
        await B();
      } catch (w) {
        k.value = X.errorMessage(w);
      } finally {
        c.value = !1, i.value = "";
      }
    }
    function H($) {
      if (N.value = "", $ === "cloud") {
        r.value = "cloud";
        return;
      }
      r.value = "local", s.value?.asr.mode !== "local" && f();
    }
    function f() {
      return I("mode", async () => {
        const $ = await J("asr.mode.save", { mode: r.value === "cloud" ? "cloud" : "local", localModel: g.value });
        s.value && $ && (s.value.asr = $), p("changed");
      });
    }
    function d() {
      const $ = j.value;
      h.baseUrl = $?.baseUrl ?? "", h.model = $?.models[0] ?? "", N.value = "";
    }
    function u() {
      return { provider: h.provider, baseUrl: h.baseUrl.trim(), model: h.model.trim(), apiKey: h.apiKey.trim() };
    }
    function z() {
      return N.value = "", I("test", async () => {
        const $ = await J("asr.cloud.test", u());
        T.value = !!$?.ok, N.value = $?.ok ? t.t("连接正常（{n} 毫秒），地址、模型和 API Key 都对", { n: $.ms ?? 0 }) : $?.error || t.t("连接失败");
      });
    }
    function Q() {
      return I("save", async () => {
        await J("asr.cloud.save", u());
        const $ = await J("asr.mode.save", { mode: "cloud", localModel: g.value });
        s.value && $ && (s.value.asr = $), h.apiKey = "", a.value = !1, y.success(t.t("已改为在线接口转写")), p("changed");
      });
    }
    function te() {
      return window.confirm(t.t("清除在线接口和保存的 API Key？会议转写会改回本机模型。")) ? I("clear", async () => {
        const $ = await J("asr.cloud.save", { clear: !0 });
        s.value && $ && (s.value.asr = $, E(s.value)), p("changed");
      }) : Promise.resolve();
    }
    async function K() {
      if (a.value) {
        a.value = !1;
        return;
      }
      if (!h.apiKey && s.value?.asr.cloud?.hasKey)
        try {
          h.apiKey = (await J("asr.cloud.reveal"))?.apiKey || "";
        } catch ($) {
          k.value = X.errorMessage($);
          return;
        }
      a.value = !0;
    }
    function G() {
      ue(A.value);
    }
    const ee = () => window.electronAPI?.pyExt;
    async function ne($) {
      const B = ee();
      if (!B?.install) {
        k.value = t.t("组件安装器不可用，请到应用的 设置 → 语音 里下载");
        return;
      }
      k.value = "";
      try {
        for (const w of $) {
          if (w === "asr-meeting-firered2" && s.value?.models.fireRed || w === "asr-meeting-sensevoice" && s.value?.models.senseVoice) continue;
          b.value = w, m.value = t.t("开始下载…");
          const q = await B.install(w);
          if (!q?.ok) {
            k.value = q?.error || t.t("下载失败");
            break;
          }
          await M();
        }
        k.value || (m.value = t.t("下载完成")), p("changed");
      } catch (w) {
        k.value = X.errorMessage(w);
      } finally {
        b.value = "";
      }
    }
    let V = null;
    return e.onMounted(() => {
      M();
      const $ = ee();
      $?.onInstallProgress && (V = $.onInstallProgress((B) => {
        B?.id && B.id === b.value && B.line && (m.value = String(B.line).slice(0, 200));
      }));
    }), e.onBeforeUnmount(() => {
      try {
        V?.();
      } catch {
      }
    }), v({ reload: M }), ($, B) => (e.openBlock(), e.createElementBlock("section", Hg, [
      e.createElementVNode("div", {
        class: "mm-asr__modes",
        role: "radiogroup",
        "aria-label": $.$t("转写方式")
      }, [
        e.createElementVNode("button", {
          type: "button",
          role: "radio",
          "aria-checked": r.value !== "cloud",
          class: e.normalizeClass({ on: r.value !== "cloud" }),
          "data-test": "mm-asr-mode-local",
          onClick: B[0] || (B[0] = (w) => H("local"))
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
              e.toDisplayString($.$t("本机模型")),
              1
              /* TEXT */
            ),
            e.createElementVNode(
              "small",
              null,
              e.toDisplayString($.$t("推荐 · 录音不出这台电脑")),
              1
              /* TEXT */
            )
          ])
        ], 10, Gg),
        e.createElementVNode("button", {
          type: "button",
          role: "radio",
          "aria-checked": r.value === "cloud",
          class: e.normalizeClass({ on: r.value === "cloud" }),
          "data-test": "mm-asr-mode-cloud",
          onClick: B[1] || (B[1] = (w) => H("cloud"))
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
              e.toDisplayString($.$t("在线接口")),
              1
              /* TEXT */
            ),
            e.createElementVNode(
              "small",
              null,
              e.toDisplayString($.$t("填自己的语音识别 API")),
              1
              /* TEXT */
            )
          ])
        ], 10, Yg)
      ], 8, Wg),
      o.value && !s.value ? (e.openBlock(), e.createElementBlock("p", Jg, [
        B[11] || (B[11] = e.createElementVNode(
          "i",
          { class: "ri-loader-4-line spin" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          " " + e.toDisplayString($.$t("正在检测这台电脑…")),
          1
          /* TEXT */
        )
      ])) : s.value && r.value !== "cloud" ? (e.openBlock(), e.createElementBlock(
        e.Fragment,
        { key: 1 },
        [
          e.createElementVNode(
            "article",
            {
              class: e.normalizeClass(["mm-asr__best", { ready: P.value }]),
              "data-test": "mm-asr-best"
            },
            [
              e.createElementVNode("header", null, [
                e.createElementVNode("span", Qg, [
                  B[12] || (B[12] = e.createElementVNode(
                    "i",
                    { class: "ri-medal-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString($.$t("为这台电脑推荐")),
                    1
                    /* TEXT */
                  )
                ]),
                P.value ? (e.openBlock(), e.createElementBlock(
                  "span",
                  Zg,
                  e.toDisplayString($.$t("已就绪")),
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
              e.createElementVNode("ul", Xg, [
                e.createElementVNode("li", null, [
                  B[13] || (B[13] = e.createElementVNode(
                    "i",
                    { class: "ri-hard-drive-2-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString($.$t("约 {n} MB", { n: s.value.recommend.sizeMb })),
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
                    e.toDisplayString($.$t("1 小时录音约 {n} 分钟", { n: s.value.recommend.estMinPerHour })),
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
                    e.toDisplayString($.$t("全程在本机")),
                    1
                    /* TEXT */
                  )
                ])
              ]),
              s.value.recommend.downgradeReason ? (e.openBlock(), e.createElementBlock("p", xg, [
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
              P.value ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock("div", ef, [
                e.createElementVNode("button", {
                  type: "button",
                  class: "ss-btn primary",
                  disabled: !!b.value,
                  "data-test": "mm-asr-best-install",
                  onClick: B[2] || (B[2] = (w) => ne(s.value.recommend.installIds))
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
                    e.toDisplayString($.$t("一键下载")),
                    1
                    /* TEXT */
                  )
                ], 8, tf),
                s.value.recommend.installIds.length > 1 ? (e.openBlock(), e.createElementBlock(
                  "small",
                  lf,
                  e.toDisplayString($.$t("会依次下载 SenseVoice（嘈杂片段的兜底）和 FireRedASR2")),
                  1
                  /* TEXT */
                )) : e.createCommentVNode("v-if", !0)
              ]))
            ],
            2
            /* CLASS */
          ),
          e.createElementVNode("details", nf, [
            e.createElementVNode(
              "summary",
              null,
              e.toDisplayString($.$t("全部本机模型与实测对比")),
              1
              /* TEXT */
            ),
            e.createElementVNode("div", of, [
              e.createElementVNode("table", af, [
                e.createElementVNode("thead", null, [
                  e.createElementVNode("tr", null, [
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString($.$t("模型")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      sf,
                      e.toDisplayString($.$t("会议室录音")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      rf,
                      e.toDisplayString($.$t("电话音质")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      cf,
                      e.toDisplayString($.$t("吴语方言")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      df,
                      e.toDisplayString($.$t("1 小时耗时")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      mf,
                      e.toDisplayString($.$t("体积")),
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
                    e.renderList(S.value, (w) => (e.openBlock(), e.createElementBlock("tr", {
                      key: w.key,
                      "data-test": `mm-asr-row-${w.key}`
                    }, [
                      e.createElementVNode("td", null, [
                        e.createElementVNode(
                          "strong",
                          null,
                          e.toDisplayString(w.name),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "small",
                          null,
                          e.toDisplayString(w.note),
                          1
                          /* TEXT */
                        )
                      ]),
                      e.createElementVNode(
                        "td",
                        pf,
                        e.toDisplayString(w.room),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "td",
                        vf,
                        e.toDisplayString(w.phone),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "td",
                        kf,
                        e.toDisplayString(w.wu),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "td",
                        yf,
                        e.toDisplayString(w.time),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "td",
                        gf,
                        e.toDisplayString(w.size),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode("td", ff, [
                        w.ready ? (e.openBlock(), e.createElementBlock(
                          "span",
                          Nf,
                          e.toDisplayString($.$t("已下载")),
                          1
                          /* TEXT */
                        )) : w.installId ? (e.openBlock(), e.createElementBlock("button", {
                          key: 1,
                          type: "button",
                          class: "ss-btn sm",
                          disabled: !!b.value,
                          "data-test": `mm-asr-install-${w.key}`,
                          onClick: (q) => ne([w.installId])
                        }, [
                          e.createElementVNode(
                            "i",
                            {
                              class: e.normalizeClass(b.value === w.installId ? "ri-loader-4-line spin" : "ri-download-2-line")
                            },
                            null,
                            2
                            /* CLASS */
                          ),
                          e.createTextVNode(
                            e.toDisplayString($.$t("下载")),
                            1
                            /* TEXT */
                          )
                        ], 8, Vf)) : (e.openBlock(), e.createElementBlock(
                          "small",
                          Ef,
                          e.toDisplayString($.$t("在 设置 → 语音 下载")),
                          1
                          /* TEXT */
                        ))
                      ])
                    ], 8, uf))),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ])
              ])
            ]),
            e.createElementVNode(
              "p",
              $f,
              e.toDisplayString($.$t("表中是字错率（越低越准），用同一批带标准答案的录音在本机实测；耗时按这台电脑的配置估算。")),
              1
              /* TEXT */
            ),
            e.createElementVNode("label", bf, [
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString($.$t("转写时用")),
                1
                /* TEXT */
              ),
              e.withDirectives(e.createElementVNode(
                "select",
                {
                  "onUpdate:modelValue": B[3] || (B[3] = (w) => g.value = w),
                  "data-test": "mm-asr-pref",
                  onChange: B[4] || (B[4] = (w) => f())
                },
                [
                  e.createElementVNode(
                    "option",
                    hf,
                    e.toDisplayString($.$t("自动（推荐）：装了 FireRedASR2 用它，否则 SenseVoice")),
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
      )) : s.value && r.value === "cloud" ? (e.openBlock(), e.createElementBlock("div", _f, [
        e.createElementVNode("label", Bf, [
          e.createElementVNode(
            "span",
            null,
            e.toDisplayString($.$t("服务商")),
            1
            /* TEXT */
          ),
          e.withDirectives(e.createElementVNode(
            "select",
            {
              "onUpdate:modelValue": B[5] || (B[5] = (w) => h.provider = w),
              "data-test": "mm-asr-cloud-provider",
              onChange: d
            },
            [
              e.createElementVNode(
                "option",
                Sf,
                e.toDisplayString($.$t("阿里云百炼 · Qwen3-ASR-Flash（方言好）")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "option",
                Df,
                e.toDisplayString($.$t("硅基流动 · SenseVoice / TeleSpeech 方言")),
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
                wf,
                e.toDisplayString($.$t("其他（OpenAI 兼容接口）")),
                1
                /* TEXT */
              )
            ],
            544
            /* NEED_HYDRATION, NEED_PATCH */
          ), [
            [e.vModelSelect, h.provider]
          ])
        ]),
        e.createElementVNode("label", Cf, [
          e.createElementVNode(
            "span",
            null,
            e.toDisplayString($.$t("接口地址")),
            1
            /* TEXT */
          ),
          e.withDirectives(e.createElementVNode(
            "input",
            {
              "onUpdate:modelValue": B[6] || (B[6] = (w) => h.baseUrl = w),
              type: "url",
              spellcheck: "false",
              placeholder: "https://…/v1",
              "data-test": "mm-asr-cloud-url"
            },
            null,
            512
            /* NEED_PATCH */
          ), [
            [e.vModelText, h.baseUrl]
          ])
        ]),
        e.createElementVNode("label", Tf, [
          e.createElementVNode(
            "span",
            null,
            e.toDisplayString($.$t("模型")),
            1
            /* TEXT */
          ),
          e.withDirectives(e.createElementVNode(
            "input",
            {
              "onUpdate:modelValue": B[7] || (B[7] = (w) => h.model = w),
              type: "text",
              spellcheck: "false",
              list: "mm-asr-models",
              "data-test": "mm-asr-cloud-model"
            },
            null,
            512
            /* NEED_PATCH */
          ), [
            [e.vModelText, h.model]
          ]),
          e.createElementVNode("datalist", If, [
            (e.openBlock(!0), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(D.value, (w) => (e.openBlock(), e.createElementBlock("option", {
                key: w,
                value: w
              }, null, 8, Mf))),
              128
              /* KEYED_FRAGMENT */
            ))
          ])
        ]),
        e.createElementVNode("label", Af, [
          e.createElementVNode("span", null, [
            B[22] || (B[22] = e.createTextVNode(
              "API Key ",
              -1
              /* CACHED */
            )),
            s.value.asr.cloud?.hasKey ? (e.openBlock(), e.createElementBlock(
              "em",
              jf,
              e.toDisplayString($.$t("已保存")),
              1
              /* TEXT */
            )) : e.createCommentVNode("v-if", !0)
          ]),
          e.createElementVNode("span", Lf, [
            e.withDirectives(e.createElementVNode("input", {
              "onUpdate:modelValue": B[8] || (B[8] = (w) => h.apiKey = w),
              type: a.value ? "text" : "password",
              autocomplete: "new-password",
              spellcheck: "false",
              placeholder: s.value.asr.cloud?.hasKey ? $.$t("已保存，点右边的眼睛查看") : $.$t("粘贴 API Key"),
              "data-test": "mm-asr-cloud-key"
            }, null, 8, zf), [
              [e.vModelDynamic, h.apiKey]
            ]),
            e.createElementVNode("button", {
              type: "button",
              class: "mm-asr__eye",
              title: a.value ? $.$t("隐藏") : $.$t("查看"),
              "data-test": "mm-asr-cloud-eye",
              onClick: K
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
            ], 8, Ff)
          ]),
          A.value ? (e.openBlock(), e.createElementBlock(
            "a",
            {
              key: 0,
              class: "ss-link mm-asr__keylink",
              href: "#",
              onClick: e.withModifiers(G, ["prevent"])
            },
            e.toDisplayString($.$t("去哪拿 API Key")),
            1
            /* TEXT */
          )) : e.createCommentVNode("v-if", !0)
        ]),
        e.createElementVNode("p", Pf, [
          B[23] || (B[23] = e.createElementVNode(
            "i",
            { class: "ri-information-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            e.toDisplayString($.$t("选在线接口后，会议录音会按片段（每段不超过 20 秒）上传到这个服务转写，按服务商的价格计费；认人（声纹）仍在本机。API Key 只加密保存在这台电脑。")),
            1
            /* TEXT */
          )
        ]),
        N.value ? (e.openBlock(), e.createElementBlock(
          "p",
          {
            key: 0,
            class: e.normalizeClass(["ss-note", T.value ? "ok" : "danger"]),
            "data-test": "mm-asr-cloud-test-msg"
          },
          [
            e.createElementVNode(
              "i",
              {
                class: e.normalizeClass(T.value ? "ri-checkbox-circle-line" : "ri-error-warning-line")
              },
              null,
              2
              /* CLASS */
            ),
            e.createTextVNode(
              e.toDisplayString(N.value),
              1
              /* TEXT */
            )
          ],
          2
          /* CLASS */
        )) : e.createCommentVNode("v-if", !0),
        e.createElementVNode("div", Uf, [
          e.createElementVNode("button", {
            type: "button",
            class: "ss-btn",
            disabled: c.value,
            "data-test": "mm-asr-cloud-test",
            onClick: z
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
              e.toDisplayString($.$t("测试连接")),
              1
              /* TEXT */
            )
          ], 8, Of),
          e.createElementVNode("button", {
            type: "button",
            class: "ss-btn primary",
            disabled: c.value || !h.model.trim() || !(h.apiKey.trim() || s.value.asr.cloud?.hasKey),
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
              e.toDisplayString($.$t("保存并使用")),
              1
              /* TEXT */
            )
          ], 8, Rf),
          s.value.asr.cloud ? (e.openBlock(), e.createElementBlock("button", {
            key: 0,
            type: "button",
            class: "ss-link",
            disabled: c.value,
            "data-test": "mm-asr-cloud-clear",
            onClick: te
          }, e.toDisplayString($.$t("清除在线接口")), 9, qf)) : e.createCommentVNode("v-if", !0)
        ])
      ])) : e.createCommentVNode("v-if", !0),
      m.value ? (e.openBlock(), e.createElementBlock(
        "p",
        Kf,
        e.toDisplayString(m.value),
        1
        /* TEXT */
      )) : e.createCommentVNode("v-if", !0),
      k.value ? (e.openBlock(), e.createElementBlock("p", Hf, [
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
}), qt = /* @__PURE__ */ ae(Wf, [["__scopeId", "data-v-dadf8cc0"]]), Gf = {
  class: "mm-sa",
  "data-test": "mm-ai"
}, Yf = { class: "mm-sp__head" }, Jf = {
  key: 0,
  class: "ss-note danger"
}, Qf = { class: "mm-sa__block" }, Zf = { class: "ss-muted" }, Xf = { class: "mm-sa__block" }, xf = { class: "mm-sa__range" }, e1 = { class: "ss-muted" }, t1 = { class: "mm-sa__block" }, l1 = { class: "ss-field" }, n1 = ["placeholder"], o1 = { class: "ss-field" }, a1 = ["placeholder"], s1 = { class: "ss-field" }, r1 = ["placeholder"], i1 = { class: "ss-actions" }, c1 = ["disabled"], d1 = /* @__PURE__ */ e.defineComponent({
  __name: "SettingsAi",
  props: {
    settings: {}
  },
  emits: ["saved"],
  setup(l, { emit: v }) {
    const n = l, p = v, y = ie.useNotificationStore(), s = e.ref(!1), o = e.ref(""), c = e.reactive({ voiceprintThreshold: 0.55, planPrompt: "", summaryPrompt: "", organizePrompt: "" });
    function i(r) {
      const g = r.ai ?? { voiceprintThreshold: 0.55 };
      return {
        voiceprintThreshold: Number.isFinite(g.voiceprintThreshold) ? g.voiceprintThreshold : 0.55,
        planPrompt: g.planPrompt ?? "",
        summaryPrompt: g.summaryPrompt ?? "",
        organizePrompt: g.organizePrompt ?? ""
      };
    }
    const k = e.computed(() => JSON.stringify(i(n.settings)) !== JSON.stringify({ ...c, voiceprintThreshold: Number(c.voiceprintThreshold) }));
    function b() {
      Object.assign(c, i(n.settings));
    }
    e.watch(() => n.settings, b, { immediate: !0 });
    async function m() {
      s.value = !0, o.value = "";
      try {
        const r = Math.max(0, Math.min(1, Number(c.voiceprintThreshold) || 0.55)), g = {
          voiceprintThreshold: Math.round(r * 100) / 100,
          // 空串 = 用内置（不用 undefined：JSON 往返会丢字段，主进程深合并时清不掉旧提示词）
          planPrompt: c.planPrompt.trim(),
          summaryPrompt: c.summaryPrompt.trim(),
          organizePrompt: c.organizePrompt.trim()
        }, h = await J("settings.save", { patch: { ai: g } });
        y.success(t.t("AI 能力配置已保存")), p("saved", h);
      } catch (r) {
        o.value = X.errorMessage(r);
      } finally {
        s.value = !1;
      }
    }
    return (r, g) => (e.openBlock(), e.createElementBlock("div", Gf, [
      e.createElementVNode("header", Yf, [
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
      o.value ? (e.openBlock(), e.createElementBlock("p", Jf, [
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
      e.createElementVNode("section", Qf, [
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
          Zf,
          e.toDisplayString(r.$t("录音和录屏都按停顿切片后逐段转写；文字记录（txt / docx / srt / vtt 等）跳过转写。")),
          1
          /* TEXT */
        )
      ]),
      e.createElementVNode("section", Xf, [
        e.createElementVNode(
          "h4",
          null,
          e.toDisplayString(r.$t("声纹识别")),
          1
          /* TEXT */
        ),
        e.createElementVNode("label", xf, [
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
              "onUpdate:modelValue": g[0] || (g[0] = (h) => c.voiceprintThreshold = h),
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
          e1,
          e.toDisplayString(r.$t("只和本场参会人的声纹比对；低于下限的发言人留给主持人试听后指认。调高更严（指认更多），调低更松（可能认错）。默认 0.55。")),
          1
          /* TEXT */
        )
      ]),
      e.createElementVNode("section", t1, [
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
        e.createElementVNode("label", l1, [
          e.createElementVNode(
            "span",
            null,
            e.toDisplayString(r.$t("纪要整理（按议题 / 时间线整理、识别决议、3 行摘要）")),
            1
            /* TEXT */
          ),
          e.withDirectives(e.createElementVNode("textarea", {
            "onUpdate:modelValue": g[1] || (g[1] = (h) => c.organizePrompt = h),
            rows: "4",
            placeholder: r.$t("留空使用内置")
          }, null, 8, n1), [
            [e.vModelText, c.organizePrompt]
          ])
        ]),
        e.createElementVNode("label", o1, [
          e.createElementVNode(
            "span",
            null,
            e.toDisplayString(r.$t("执行方案（从决议拆任务：每项一个责任部门、执行事项、交付标准、建议完成时间）")),
            1
            /* TEXT */
          ),
          e.withDirectives(e.createElementVNode("textarea", {
            "onUpdate:modelValue": g[2] || (g[2] = (h) => c.planPrompt = h),
            rows: "4",
            placeholder: r.$t("留空使用内置")
          }, null, 8, a1), [
            [e.vModelText, c.planPrompt]
          ])
        ]),
        e.createElementVNode("label", s1, [
          e.createElementVNode(
            "span",
            null,
            e.toDisplayString(r.$t("项目总结（概况、关键决策、任务完成情况、变更与裁决记录）")),
            1
            /* TEXT */
          ),
          e.withDirectives(e.createElementVNode("textarea", {
            "onUpdate:modelValue": g[3] || (g[3] = (h) => c.summaryPrompt = h),
            rows: "4",
            placeholder: r.$t("留空使用内置")
          }, null, 8, r1), [
            [e.vModelText, c.summaryPrompt]
          ])
        ])
      ]),
      e.createElementVNode("div", i1, [
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
        ], 8, c1),
        k.value ? (e.openBlock(), e.createElementBlock(
          "button",
          {
            key: 0,
            type: "button",
            class: "ss-link",
            onClick: b
          },
          e.toDisplayString(r.$t("撤销修改")),
          1
          /* TEXT */
        )) : e.createCommentVNode("v-if", !0)
      ])
    ]));
  }
}), m1 = /* @__PURE__ */ ae(d1, [["__scopeId", "data-v-4bd27b96"]]), u1 = {
  class: "mm-pf",
  "data-test": "mm-push-failed"
}, p1 = { class: "mm-pf__head" }, v1 = ["disabled", "title"], k1 = { class: "ss-muted" }, y1 = {
  key: 1,
  class: "ss-note danger"
}, g1 = {
  key: 2,
  class: "mm-pf__empty"
}, f1 = {
  key: 3,
  class: "ss-table-wrap"
}, N1 = { class: "ss-table" }, V1 = { class: "num" }, E1 = ["data-test"], $1 = { class: "nowrap" }, b1 = { class: "nowrap" }, h1 = { class: "mm-pf__err" }, _1 = { class: "num" }, B1 = ["disabled", "data-test", "onClick"], S1 = {
  key: 4,
  class: "ss-muted"
}, D1 = /* @__PURE__ */ e.defineComponent({
  __name: "PushFailedList",
  setup(l) {
    const v = e.ref([]), n = e.ref(0), p = e.ref(!1), y = e.ref(""), s = e.ref(""), o = e.ref(null), c = e.computed(() => !!oe.value?.pushChannel || !!oe.value?.wecomConnected);
    async function i() {
      try {
        const m = await J("notice.push.failed");
        v.value = m?.items ?? [], n.value = m?.total ?? 0, s.value = "";
      } catch (m) {
        s.value = X.errorMessage(m);
      } finally {
        p.value = !0;
      }
    }
    async function k(m) {
      y.value = m || "all", s.value = "", o.value = null;
      try {
        o.value = await J("notice.push.retry", m ? { ids: [m] } : { all: !0 }), await Promise.all([i(), ce().catch(() => null)]);
      } catch (r) {
        s.value = X.errorMessage(r);
      } finally {
        y.value = "";
      }
    }
    let b = null;
    return e.onMounted(() => {
      i(), b = Se((m) => {
        m.type === "changed" && m.scope === "notice" && !y.value && i();
      });
    }), e.onBeforeUnmount(() => b?.()), (m, r) => (e.openBlock(), e.createElementBlock("section", u1, [
      e.createElementVNode("div", p1, [
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
          onClick: r[0] || (r[0] = (g) => k())
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
        ], 8, v1)) : e.createCommentVNode("v-if", !0)
      ]),
      e.createElementVNode(
        "p",
        k1,
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
      s.value ? (e.openBlock(), e.createElementBlock("p", y1, [
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
      !v.value.length && p.value ? (e.openBlock(), e.createElementBlock(
        "p",
        g1,
        e.toDisplayString(m.$t("没有发送失败的通知")),
        1
        /* TEXT */
      )) : v.value.length ? (e.openBlock(), e.createElementBlock("div", f1, [
        e.createElementVNode("table", N1, [
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
                V1,
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
              e.renderList(v.value, (g) => (e.openBlock(), e.createElementBlock("tr", {
                key: g.id,
                "data-test": `mm-push-row-${g.id}`
              }, [
                e.createElementVNode(
                  "td",
                  $1,
                  e.toDisplayString(e.unref($e)(g.at)),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "td",
                  b1,
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
                  h1,
                  e.toDisplayString(g.error),
                  1
                  /* TEXT */
                ),
                e.createElementVNode("td", _1, [
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-link",
                    disabled: !!y.value || !c.value,
                    "data-test": `mm-push-retry-${g.id}`,
                    onClick: (h) => k(g.id)
                  }, e.toDisplayString(y.value === g.id ? m.$t("发送中…") : m.$t("重发")), 9, B1)
                ])
              ], 8, E1))),
              128
              /* KEYED_FRAGMENT */
            ))
          ])
        ])
      ])) : e.createCommentVNode("v-if", !0),
      n.value > v.value.length ? (e.openBlock(), e.createElementBlock(
        "small",
        S1,
        e.toDisplayString(m.$t("只列出最近 {n} 条", { n: v.value.length })),
        1
        /* TEXT */
      )) : e.createCommentVNode("v-if", !0)
    ]));
  }
}), w1 = /* @__PURE__ */ ae(D1, [["__scopeId", "data-v-f0a4a0e3"]]), C1 = {
  class: "mm-sw",
  "data-test": "mm-wecom"
}, T1 = { class: "mm-sp__head" }, I1 = {
  key: 0,
  class: "ss-note danger"
}, M1 = { class: "mm-sw__form" }, A1 = { class: "ss-grid" }, j1 = { class: "ss-field" }, L1 = { class: "ss-field" }, z1 = { class: "ss-field" }, F1 = {
  key: 0,
  class: "mm-sw__set"
}, P1 = { class: "mm-sw__secret" }, U1 = ["type", "placeholder"], O1 = ["title", "disabled"], R1 = { class: "ss-field" }, q1 = ["placeholder"], K1 = { class: "ss-muted" }, H1 = { class: "ss-actions" }, W1 = ["disabled"], G1 = ["disabled"], Y1 = {
  class: "mm-sw__form",
  "data-test": "mm-webhook"
}, J1 = { class: "mm-sw__h" }, Q1 = { class: "mm-sw__steps" }, Z1 = { class: "ss-field" }, X1 = {
  key: 0,
  class: "mm-sw__set",
  "data-test": "mm-webhook-set"
}, x1 = ["placeholder"], eN = { class: "ss-muted" }, tN = { class: "ss-actions" }, lN = ["disabled"], nN = ["disabled"], oN = ["disabled"], aN = { class: "mm-sw__events" }, sN = { class: "ss-table-wrap" }, rN = { class: "ss-table" }, iN = { class: "num" }, cN = { class: "wrap" }, dN = { class: "wrap" }, mN = { class: "ss-muted" }, uN = /* @__PURE__ */ e.defineComponent({
  __name: "SettingsWecom",
  props: {
    settings: {}
  },
  emits: ["saved"],
  setup(l, { emit: v }) {
    const n = l, p = v, y = t.t("标题 + 摘要 + 按钮"), s = [
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
    ], o = be.useDialog(), c = ie.useNotificationStore(), i = e.ref(!1), k = e.ref(""), b = e.ref(""), m = e.ref(null), r = e.reactive({ corpId: "", agentId: "", secret: "", cardBaseUrl: "" }), g = e.computed(() => !!oe.value?.wecomConnected), h = e.computed(() => oe.value?.pushChannel ?? (g.value ? "app" : null)), a = e.ref(""), N = e.ref(!1);
    async function T() {
      if (!N.value && !r.secret && n.settings.wecom.hasSecret)
        try {
          const M = await J("wecom.secret.reveal");
          r.secret = M?.secret || "";
        } catch (M) {
          b.value = X.errorMessage(M);
          return;
        }
      N.value = !N.value;
    }
    const U = e.ref(null), j = e.computed(() => !r.corpId.trim() && !r.agentId.trim()), D = e.computed(() => j.value ? !!(n.settings.wecom.corpId || n.settings.wecom.agentId || n.settings.wecom.hasSecret) : !!r.corpId.trim() && !!r.agentId.trim() && (n.settings.wecom.hasSecret || !!r.secret));
    e.watch(() => n.settings.wecom, (M) => {
      Object.assign(r, { corpId: M?.corpId ?? "", agentId: M?.agentId ?? "", secret: r.secret, cardBaseUrl: M?.cardBaseUrl ?? "" });
    }, { immediate: !0 });
    async function A() {
      if (!(j.value && !await o.confirm({
        title: t.t("断开企微"),
        message: t.t("清空企微配置后，通讯录不再从企微同步，通知只进系统内消息中心。确定吗？"),
        danger: !0
      }))) {
        i.value = !0, k.value = "save", b.value = "", m.value = null;
        try {
          const M = { corpId: r.corpId.trim(), agentId: r.agentId.trim(), cardBaseUrl: r.cardBaseUrl.trim() };
          r.secret && (M.secret = r.secret), await J("wecom.save", M), j.value && (r.secret = "", N.value = !1), c.success(j.value ? t.t("已断开企微") : t.t("企微配置已保存")), p("saved"), await ce().catch(() => null);
        } catch (M) {
          b.value = X.errorMessage(M);
        } finally {
          i.value = !1, k.value = "";
        }
      }
    }
    async function P(M, I) {
      i.value = !0, k.value = M, b.value = "", U.value = null;
      try {
        await I();
      } catch (H) {
        U.value = { ok: !1, error: X.errorMessage(H) };
      } finally {
        i.value = !1, k.value = "";
      }
    }
    function R() {
      return P("hook", async () => {
        await J("wecom.webhook.save", { url: a.value.trim() }), a.value = "", c.success(t.t("群机器人已保存")), p("saved"), await ce().catch(() => null);
      });
    }
    function _() {
      return P("hookTest", async () => {
        const M = await J("wecom.webhook.test");
        U.value = { ok: !!M?.ok, error: M?.error };
      });
    }
    async function S() {
      await o.confirm({ title: t.t("移除群机器人"), message: t.t("移除后通知不再发到企微群（自建应用照常）。确定吗？"), danger: !0 }) && await P("hook", async () => {
        await J("wecom.webhook.save", { url: "" }), c.success(t.t("已移除群机器人")), p("saved"), await ce().catch(() => null);
      });
    }
    async function E() {
      i.value = !0, k.value = "test", b.value = "", m.value = null;
      try {
        const M = await J("wecom.test");
        m.value = { ok: !!M?.ok, error: M?.error }, await ce().catch(() => null);
      } catch (M) {
        m.value = { ok: !1, error: X.errorMessage(M) };
      } finally {
        i.value = !1, k.value = "";
      }
    }
    return (M, I) => (e.openBlock(), e.createElementBlock("div", C1, [
      e.createElementVNode("header", T1, [
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
            class: e.normalizeClass(["ss-chip", h.value ? "ok" : "warn"]),
            "data-test": "mm-wecom-state"
          },
          e.toDisplayString(h.value === "app" ? M.$t("企微已连接") : h.value === "webhook" ? M.$t("群机器人已连接") : M.$t("未连接企微")),
          3
          /* TEXT, CLASS */
        )
      ]),
      b.value ? (e.openBlock(), e.createElementBlock("p", I1, [
        I[8] || (I[8] = e.createElementVNode(
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
      e.createElementVNode("section", M1, [
        e.createElementVNode("div", A1, [
          e.createElementVNode("label", j1, [
            I[9] || (I[9] = e.createElementVNode(
              "span",
              null,
              "CorpID",
              -1
              /* CACHED */
            )),
            e.withDirectives(e.createElementVNode(
              "input",
              {
                "onUpdate:modelValue": I[0] || (I[0] = (H) => r.corpId = H),
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
          e.createElementVNode("label", L1, [
            I[10] || (I[10] = e.createElementVNode(
              "span",
              null,
              "AgentID",
              -1
              /* CACHED */
            )),
            e.withDirectives(e.createElementVNode(
              "input",
              {
                "onUpdate:modelValue": I[1] || (I[1] = (H) => r.agentId = H),
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
          e.createElementVNode("label", z1, [
            e.createElementVNode("span", null, [
              I[11] || (I[11] = e.createTextVNode(
                "Secret ",
                -1
                /* CACHED */
              )),
              l.settings.wecom.hasSecret ? (e.openBlock(), e.createElementBlock(
                "em",
                F1,
                e.toDisplayString(M.$t("已配置")),
                1
                /* TEXT */
              )) : e.createCommentVNode("v-if", !0)
            ]),
            e.createElementVNode("span", P1, [
              e.withDirectives(e.createElementVNode("input", {
                "onUpdate:modelValue": I[2] || (I[2] = (H) => r.secret = H),
                type: N.value ? "text" : "password",
                autocomplete: "new-password",
                spellcheck: "false",
                placeholder: l.settings.wecom.hasSecret ? M.$t("已保存，点右边的眼睛查看") : M.$t("应用的 Secret"),
                "data-test": "mm-wecom-secret"
              }, null, 8, U1), [
                [e.vModelDynamic, r.secret]
              ]),
              e.createElementVNode("button", {
                type: "button",
                class: "mm-sw__eye",
                title: N.value ? M.$t("隐藏") : M.$t("查看"),
                disabled: i.value,
                "data-test": "mm-wecom-secret-eye",
                onClick: T
              }, [
                e.createElementVNode(
                  "i",
                  {
                    class: e.normalizeClass(N.value ? "ri-eye-off-line" : "ri-eye-line")
                  },
                  null,
                  2
                  /* CLASS */
                )
              ], 8, O1)
            ])
          ])
        ]),
        e.createElementVNode("label", R1, [
          e.createElementVNode(
            "span",
            null,
            e.toDisplayString(M.$t("卡片跳转地址前缀")),
            1
            /* TEXT */
          ),
          e.withDirectives(e.createElementVNode("input", {
            "onUpdate:modelValue": I[3] || (I[3] = (H) => r.cardBaseUrl = H),
            type: "url",
            placeholder: M.$t("留空 = 用手机页服务的局域网地址，如 http://192.168.1.10:8260"),
            spellcheck: "false",
            "data-test": "mm-wecom-base"
          }, null, 8, q1), [
            [e.vModelText, r.cardBaseUrl]
          ])
        ]),
        e.createElementVNode(
          "p",
          K1,
          e.toDisplayString(M.$t("Secret 只保存在本机（系统加密存储），不会显示出来。卡片按钮会跳到「前缀 + 每人专属链接」，员工手机要能访问这个地址（同一局域网或可信域名）。CorpID 和 AgentID 都清空后保存 = 断开企微。")),
          1
          /* TEXT */
        ),
        e.createElementVNode("div", H1, [
          e.createElementVNode("button", {
            type: "button",
            class: "ss-btn primary",
            disabled: i.value || !D.value,
            "data-test": "mm-wecom-save",
            onClick: A
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
          ], 8, W1),
          e.createElementVNode("button", {
            type: "button",
            class: "ss-btn",
            disabled: i.value || !l.settings.wecom.hasSecret && !g.value,
            "data-test": "mm-wecom-test",
            onClick: E
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
          ], 8, G1),
          e.createElementVNode("button", {
            type: "button",
            class: "ss-link",
            "data-test": "mm-wecom-link-profile",
            onClick: I[4] || (I[4] = (H) => e.unref(ue)(e.unref(fe).profile))
          }, [
            e.createTextVNode(
              e.toDisplayString(M.$t("打开企微·我的企业")) + " ",
              1
              /* TEXT */
            ),
            I[12] || (I[12] = e.createElementVNode(
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
            onClick: I[5] || (I[5] = (H) => e.unref(ue)(e.unref(fe).apps))
          }, [
            e.createTextVNode(
              e.toDisplayString(M.$t("打开企微·应用管理")) + " ",
              1
              /* TEXT */
            ),
            I[13] || (I[13] = e.createElementVNode(
              "i",
              { class: "ri-external-link-line" },
              null,
              -1
              /* CACHED */
            ))
          ])
        ])
      ]),
      e.createElementVNode("section", Y1, [
        e.createElementVNode("h4", J1, [
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
          I[15] || (I[15] = e.createTextVNode()),
          e.createElementVNode("button", {
            type: "button",
            class: "ss-link",
            "data-test": "mm-wecom-link-webhook-doc",
            onClick: I[6] || (I[6] = (H) => e.unref(ue)(e.unref(fe).webhookDoc))
          }, [
            e.createTextVNode(
              e.toDisplayString(M.$t("查看企微官方说明")) + " ",
              1
              /* TEXT */
            ),
            I[14] || (I[14] = e.createElementVNode(
              "i",
              { class: "ri-external-link-line" },
              null,
              -1
              /* CACHED */
            ))
          ])
        ]),
        e.createElementVNode("ol", Q1, [
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
        e.createElementVNode("label", Z1, [
          e.createElementVNode("span", null, [
            e.createTextVNode(
              e.toDisplayString(M.$t("Webhook 地址")) + " ",
              1
              /* TEXT */
            ),
            l.settings.wecom.hasWebhook ? (e.openBlock(), e.createElementBlock(
              "em",
              X1,
              e.toDisplayString(M.$t("已配置")) + " " + e.toDisplayString(l.settings.wecom.webhookMasked),
              1
              /* TEXT */
            )) : e.createCommentVNode("v-if", !0)
          ]),
          e.withDirectives(e.createElementVNode("input", {
            "onUpdate:modelValue": I[7] || (I[7] = (H) => a.value = H),
            type: "password",
            autocomplete: "off",
            spellcheck: "false",
            placeholder: l.settings.wecom.hasWebhook ? M.$t("已配置，要换地址再粘贴") : "https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=…",
            "data-test": "mm-webhook-url"
          }, null, 8, x1), [
            [e.vModelText, a.value]
          ])
        ]),
        e.createElementVNode(
          "p",
          eN,
          e.toDisplayString(M.$t("地址里的 key 等于发消息的凭据，只保存在本机（系统加密存储），不会显示出来。配了自建应用时通知发给个人，群机器人不再发。群消息里的按钮不带个人令牌：手机上打开过自己专属链接的人点了能直接进入。每个机器人每分钟最多发 20 条，同一事件的几个人合成一条。")),
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
              e.toDisplayString(U.value.ok ? M.$t("已发到群里，请到企微群里看一眼") : U.value.error || M.$t("发送失败")),
              1
              /* TEXT */
            )
          ],
          2
          /* CLASS */
        )) : e.createCommentVNode("v-if", !0),
        e.createElementVNode("div", tN, [
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
              e.toDisplayString(M.$t("保存")),
              1
              /* TEXT */
            )
          ], 8, lN),
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
              e.toDisplayString(M.$t("测试发送")),
              1
              /* TEXT */
            )
          ], 8, nN),
          l.settings.wecom.hasWebhook ? (e.openBlock(), e.createElementBlock("button", {
            key: 0,
            type: "button",
            class: "ss-btn",
            disabled: i.value,
            "data-test": "mm-webhook-remove",
            onClick: S
          }, [
            I[16] || (I[16] = e.createElementVNode(
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
          ], 8, oN)) : e.createCommentVNode("v-if", !0)
        ])
      ]),
      e.createVNode(w1),
      e.createElementVNode("section", aN, [
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
        e.createElementVNode("div", sN, [
          e.createElementVNode("table", rN, [
            e.createElementVNode("thead", null, [
              e.createElementVNode("tr", null, [
                I[17] || (I[17] = e.createElementVNode(
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
                e.renderList(s, (H, f) => e.createElementVNode("tr", { key: f }, [
                  e.createElementVNode(
                    "td",
                    iN,
                    e.toDisplayString(f + 1),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "td",
                    null,
                    e.toDisplayString(H.event),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "td",
                    cN,
                    e.toDisplayString(H.to),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "td",
                    dN,
                    e.toDisplayString(H.card),
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
          mN,
          e.toDisplayString(M.$t("提醒周期（发言确认超时、到期提前、进度跟踪、周报）在「参数设置」里改。")),
          1
          /* TEXT */
        )
      ])
    ]));
  }
}), pN = /* @__PURE__ */ ae(uN, [["__scopeId", "data-v-c940056b"]]), vN = {
  adminIds: [],
  projectCreatorIds: [],
  confirmTimeoutHours: 24,
  dueRemindDays: 1,
  trackCycleDays: 7,
  reportCycleDays: 7,
  wecom: { corpId: "", agentId: "", hasSecret: !1 },
  // 声纹认人门槛：2026-11-16 用真实 67 分钟会议录音实测，同一会议室不同人之间余弦最高 0.53、本人 0.67~0.77，取 0.55
  ai: { asr: "local", voiceprintThreshold: 0.55 }
}, kN = {
  class: "mm-spa",
  "data-test": "mm-params"
}, yN = { class: "mm-sp__head" }, gN = {
  key: 0,
  class: "ss-note danger"
}, fN = { class: "mm-spa__list" }, NN = { class: "mm-spa__num" }, VN = ["onUpdate:modelValue", "min", "max", "aria-label", "data-test"], EN = {
  key: 1,
  class: "ss-note warn"
}, $N = { class: "ss-actions" }, bN = ["disabled"], hN = /* @__PURE__ */ e.defineComponent({
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
    ], p = l, y = v, s = ie.useNotificationStore(), o = e.ref(!1), c = e.ref(""), i = e.reactive({ confirmTimeoutHours: 24, dueRemindDays: 1, trackCycleDays: 7, reportCycleDays: 7 }), k = e.computed(() => n.some((h) => Number(i[h.key]) !== p.settings[h.key])), b = e.computed(() => {
      for (const h of n) {
        const a = Number(i[h.key]);
        if (!Number.isInteger(a) || a < h.min || a > h.max) return t.t("「{t}」要填 {a}～{b} 之间的整数", { t: h.title, a: h.min, b: h.max });
      }
      return "";
    });
    function m() {
      for (const h of n) i[h.key] = p.settings[h.key];
    }
    function r() {
      for (const h of n) i[h.key] = vN[h.key];
    }
    e.watch(() => p.settings, m, { immediate: !0 });
    async function g() {
      o.value = !0, c.value = "";
      try {
        const h = Object.fromEntries(n.map((N) => [N.key, Number(i[N.key])])), a = await J("settings.save", { patch: h });
        s.success(t.t("参数已保存")), y("saved", a);
      } catch (h) {
        c.value = X.errorMessage(h);
      } finally {
        o.value = !1;
      }
    }
    return (h, a) => (e.openBlock(), e.createElementBlock("div", kN, [
      e.createElementVNode("header", yN, [
        e.createElementVNode("div", null, [
          e.createElementVNode(
            "h3",
            null,
            e.toDisplayString(h.$t("参数设置")),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "p",
            null,
            e.toDisplayString(h.$t("催办与提醒周期。提醒只推消息，不改任何状态；逾期是任务上的标记，不是状态。")),
            1
            /* TEXT */
          )
        ])
      ]),
      c.value ? (e.openBlock(), e.createElementBlock("p", gN, [
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
      e.createElementVNode("ul", fN, [
        (e.openBlock(), e.createElementBlock(
          e.Fragment,
          null,
          e.renderList(n, (N) => e.createElementVNode("li", {
            key: N.key
          }, [
            e.createElementVNode("div", null, [
              e.createElementVNode(
                "strong",
                null,
                e.toDisplayString(N.title),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "small",
                null,
                e.toDisplayString(N.hint),
                1
                /* TEXT */
              )
            ]),
            e.createElementVNode("label", NN, [
              e.withDirectives(e.createElementVNode("input", {
                "onUpdate:modelValue": (T) => i[N.key] = T,
                type: "number",
                min: N.min,
                max: N.max,
                step: "1",
                "aria-label": N.title,
                "data-test": `mm-param-${N.key}`
              }, null, 8, VN), [
                [
                  e.vModelText,
                  i[N.key],
                  void 0,
                  { number: !0 }
                ]
              ]),
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(N.unit),
                1
                /* TEXT */
              )
            ])
          ])),
          64
          /* STABLE_FRAGMENT */
        ))
      ]),
      b.value ? (e.openBlock(), e.createElementBlock("p", EN, [
        a[1] || (a[1] = e.createElementVNode(
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
      e.createElementVNode("div", $N, [
        e.createElementVNode("button", {
          type: "button",
          class: "ss-btn primary",
          disabled: o.value || !k.value || !!b.value,
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
            e.toDisplayString(h.$t("保存")),
            1
            /* TEXT */
          )
        ], 8, bN),
        k.value ? (e.openBlock(), e.createElementBlock(
          "button",
          {
            key: 0,
            type: "button",
            class: "ss-link",
            onClick: m
          },
          e.toDisplayString(h.$t("撤销修改")),
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
          e.toDisplayString(h.$t("恢复默认")),
          1
          /* TEXT */
        )
      ])
    ]));
  }
}), _N = /* @__PURE__ */ ae(hN, [["__scopeId", "data-v-ae3507ae"]]), BN = {
  class: "mm-sm",
  "data-test": "mm-mobile-settings"
}, SN = { class: "mm-sp__head" }, DN = {
  key: 0,
  class: "ss-note danger"
}, wN = { class: "mm-sm__svc" }, CN = { class: "mm-sm__addr" }, TN = {
  key: 0,
  class: "mono"
}, IN = {
  key: 1,
  class: "muted"
}, MN = { class: "ss-muted" }, AN = { class: "mm-sm__tools" }, jN = { class: "mm-sm__qr" }, LN = { class: "mm-search" }, zN = ["placeholder", "aria-label"], FN = { class: "ss-table-wrap" }, PN = { class: "ss-table" }, UN = { class: "num" }, ON = { key: 0 }, RN = {
  colspan: "4",
  class: "mm-sm__empty"
}, qN = { class: "mm-sm__link" }, KN = { class: "mono" }, HN = ["src", "alt"], WN = {
  key: 1,
  class: "ss-muted"
}, GN = { class: "num" }, YN = ["disabled", "title", "data-test", "onClick"], JN = ["disabled", "data-test", "onClick"], QN = { class: "mm-sm__foot" }, ZN = ["aria-label"], XN = ["disabled", "aria-label"], xN = ["onClick"], eV = ["disabled", "aria-label"], tV = /* @__PURE__ */ e.defineComponent({
  __name: "SettingsMobile",
  props: {
    people: {},
    depts: {}
  },
  setup(l) {
    const v = l, n = be.useDialog(), p = ie.useNotificationStore(), y = e.ref({ running: !!oe.value?.mobile.running, url: oe.value?.mobile.url }), s = e.ref(""), o = e.ref(""), c = e.ref(""), i = e.ref(1), k = e.ref(!1), b = e.reactive({}), m = e.reactive({}), r = (D) => v.depts.find((A) => A.id === D)?.name || "", g = e.computed(() => v.people.filter((D) => !D.left && kt(D, r(D.deptId), c.value))), h = e.computed(() => Lt(g.value, i.value, 10));
    e.watch(c, () => {
      i.value = 1;
    });
    async function a() {
      try {
        const D = await J("mobile.status");
        D && (y.value = { running: !!D.running, url: D.url });
      } catch (D) {
        o.value = X.errorMessage(D);
      }
    }
    async function N(D) {
      !b[D] || m[D] || (m[D] = await Mt.toDataURL(b[D], { margin: 1, width: 240 }).catch(() => ""));
    }
    async function T(D) {
      s.value = D.id, o.value = "";
      try {
        if (!b[D.id]) {
          const A = Je(await J("mobile.link", { personId: D.id }));
          if (!A) throw new Error(t.t("没拿到专属链接，请确认手机页服务已开启"));
          b[D.id] = A;
        }
        k.value && await N(D.id), await Qe(b[D.id]) && p.success(t.t("已复制 {name} 的专属链接", { name: D.name }));
      } catch (A) {
        o.value = X.errorMessage(A);
      } finally {
        s.value = "";
      }
    }
    async function U(D) {
      if (await n.confirm({
        title: t.t("重置专属链接"),
        message: t.t("重置后 {name} 的旧链接立即失效（包括已发出的企微卡片按钮），需要把新链接重新发给本人。确定吗？", { name: D.name }),
        danger: !0,
        confirmLabel: t.t("重置")
      })) {
        s.value = D.id, o.value = "";
        try {
          const P = Je(await J("mobile.link", { personId: D.id, reset: !0 }));
          if (!P) throw new Error(t.t("没拿到专属链接，请确认手机页服务已开启"));
          b[D.id] = P, delete m[D.id], k.value && await N(D.id), p.success(t.t("已重置 {name} 的专属链接", { name: D.name }));
        } catch (P) {
          o.value = X.errorMessage(P);
        } finally {
          s.value = "";
        }
      }
    }
    e.watch(k, (D) => {
      D && Object.keys(b).forEach((A) => {
        N(A);
      });
    });
    let j = null;
    return e.onMounted(() => {
      a(), j = Se((D) => {
        D.type === "mobile" && (y.value = { running: D.running, url: D.url }, D.running || (Object.keys(b).forEach((A) => delete b[A]), Object.keys(m).forEach((A) => delete m[A])));
      });
    }), e.onBeforeUnmount(() => j?.()), (D, A) => (e.openBlock(), e.createElementBlock("div", BN, [
      e.createElementVNode("header", SN, [
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
            class: e.normalizeClass(["ss-chip", y.value.running ? "ok" : ""]),
            "data-test": "mm-mobile-settings-state"
          },
          e.toDisplayString(y.value.running ? D.$t("运行中") : D.$t("未开启")),
          3
          /* TEXT, CLASS */
        )
      ]),
      o.value ? (e.openBlock(), e.createElementBlock("p", DN, [
        A[5] || (A[5] = e.createElementVNode(
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
      e.createElementVNode("section", wN, [
        e.createElementVNode("div", CN, [
          e.createElementVNode(
            "small",
            null,
            e.toDisplayString(D.$t("局域网地址")),
            1
            /* TEXT */
          ),
          y.value.running && y.value.url ? (e.openBlock(), e.createElementBlock(
            "b",
            TN,
            e.toDisplayString(y.value.url),
            1
            /* TEXT */
          )) : (e.openBlock(), e.createElementBlock(
            "b",
            IN,
            e.toDisplayString(D.$t("服务未开启")),
            1
            /* TEXT */
          ))
        ]),
        e.createElementVNode("button", {
          type: "button",
          class: "ss-btn",
          "data-test": "mm-mobile-goto-home",
          onClick: A[0] || (A[0] = (P) => e.unref(ve)("home"))
        }, [
          A[6] || (A[6] = e.createElementVNode(
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
        MN,
        e.toDisplayString(D.$t("专属链接只发给本人，泄露了可以让管理员重置。")),
        1
        /* TEXT */
      ),
      e.createElementVNode("div", AN, [
        e.createElementVNode(
          "h4",
          null,
          e.toDisplayString(D.$t("每人专属链接")),
          1
          /* TEXT */
        ),
        A[8] || (A[8] = e.createElementVNode(
          "span",
          { class: "grow" },
          null,
          -1
          /* CACHED */
        )),
        e.createElementVNode("label", jN, [
          e.withDirectives(e.createElementVNode(
            "input",
            {
              "onUpdate:modelValue": A[1] || (A[1] = (P) => k.value = P),
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
            e.toDisplayString(D.$t("同时显示二维码")),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode("label", LN, [
          A[7] || (A[7] = e.createElementVNode(
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
            "onUpdate:modelValue": A[2] || (A[2] = (P) => c.value = P),
            type: "search",
            placeholder: D.$t("搜索员工"),
            "aria-label": D.$t("搜索员工")
          }, null, 8, zN), [
            [e.vModelText, c.value]
          ])
        ])
      ]),
      e.createElementVNode("div", FN, [
        e.createElementVNode("table", PN, [
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
                UN,
                e.toDisplayString(D.$t("操作")),
                1
                /* TEXT */
              )
            ])
          ]),
          e.createElementVNode("tbody", null, [
            h.value.rows.length ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock("tr", ON, [
              e.createElementVNode(
                "td",
                RN,
                e.toDisplayString(D.$t("没有符合条件的员工")),
                1
                /* TEXT */
              )
            ])),
            (e.openBlock(!0), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(h.value.rows, (P) => (e.openBlock(), e.createElementBlock("tr", {
                key: P.id
              }, [
                e.createElementVNode("td", null, [
                  e.createVNode(ze, {
                    name: P.name
                  }, null, 8, ["name"])
                ]),
                e.createElementVNode(
                  "td",
                  null,
                  e.toDisplayString(r(P.deptId) || "—"),
                  1
                  /* TEXT */
                ),
                e.createElementVNode("td", qN, [
                  b[P.id] ? (e.openBlock(), e.createElementBlock(
                    e.Fragment,
                    { key: 0 },
                    [
                      e.createElementVNode(
                        "span",
                        KN,
                        e.toDisplayString(b[P.id]),
                        1
                        /* TEXT */
                      ),
                      k.value && m[P.id] ? (e.openBlock(), e.createElementBlock("img", {
                        key: 0,
                        src: m[P.id],
                        alt: D.$t("{name} 的专属链接二维码", { name: P.name }),
                        width: "120",
                        height: "120"
                      }, null, 8, HN)) : e.createCommentVNode("v-if", !0)
                    ],
                    64
                    /* STABLE_FRAGMENT */
                  )) : (e.openBlock(), e.createElementBlock("span", WN, "—"))
                ]),
                e.createElementVNode("td", GN, [
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-link",
                    disabled: !y.value.running || s.value === P.id,
                    title: y.value.running ? "" : D.$t("先开启手机页服务"),
                    "data-test": `mm-mobile-link-${P.id}`,
                    onClick: (R) => T(P)
                  }, e.toDisplayString(b[P.id] ? D.$t("复制链接") : D.$t("生成并复制")), 9, YN),
                  b[P.id] ? (e.openBlock(), e.createElementBlock(
                    e.Fragment,
                    { key: 0 },
                    [
                      A[9] || (A[9] = e.createElementVNode(
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
                        disabled: s.value === P.id,
                        "data-test": `mm-mobile-reset-${P.id}`,
                        onClick: (R) => U(P)
                      }, e.toDisplayString(D.$t("重置")), 9, JN)
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
      e.createElementVNode("footer", QN, [
        e.createElementVNode(
          "span",
          null,
          e.toDisplayString(D.$t("共 {n} 人", { n: g.value.length })),
          1
          /* TEXT */
        ),
        A[12] || (A[12] = e.createElementVNode(
          "span",
          { class: "grow" },
          null,
          -1
          /* CACHED */
        )),
        h.value.pages > 1 ? (e.openBlock(), e.createElementBlock("nav", {
          key: 0,
          class: "mm-pager",
          "aria-label": D.$t("分页")
        }, [
          e.createElementVNode("button", {
            type: "button",
            disabled: h.value.page <= 1,
            "aria-label": D.$t("上一页"),
            onClick: A[3] || (A[3] = (P) => i.value = h.value.page - 1)
          }, [...A[10] || (A[10] = [
            e.createElementVNode(
              "i",
              { class: "ri-arrow-left-s-line" },
              null,
              -1
              /* CACHED */
            )
          ])], 8, XN),
          (e.openBlock(!0), e.createElementBlock(
            e.Fragment,
            null,
            e.renderList(h.value.pages, (P) => (e.openBlock(), e.createElementBlock("button", {
              key: P,
              type: "button",
              class: e.normalizeClass({ on: P === h.value.page }),
              onClick: (R) => i.value = P
            }, e.toDisplayString(P), 11, xN))),
            128
            /* KEYED_FRAGMENT */
          )),
          e.createElementVNode("button", {
            type: "button",
            disabled: h.value.page >= h.value.pages,
            "aria-label": D.$t("下一页"),
            onClick: A[4] || (A[4] = (P) => i.value = h.value.page + 1)
          }, [...A[11] || (A[11] = [
            e.createElementVNode(
              "i",
              { class: "ri-arrow-right-s-line" },
              null,
              -1
              /* CACHED */
            )
          ])], 8, eV)
        ], 8, ZN)) : e.createCommentVNode("v-if", !0)
      ])
    ]));
  }
}), lV = /* @__PURE__ */ ae(tV, [["__scopeId", "data-v-d5d7ac31"]]), nV = {
  class: "mm-sd",
  "data-test": "mm-demo"
}, oV = { class: "mm-sp__head" }, aV = {
  key: 0,
  class: "ss-note danger"
}, sV = { class: "ss-note warn" }, rV = { class: "mm-sd__cards" }, iV = { class: "mm-sd__card" }, cV = ["disabled"], dV = { class: "mm-sd__card" }, mV = ["disabled"], uV = /* @__PURE__ */ e.defineComponent({
  __name: "SettingsDemo",
  emits: ["changed"],
  setup(l, { emit: v }) {
    const n = v, p = be.useDialog(), y = ie.useNotificationStore(), s = e.ref(!1), o = e.ref(""), c = e.ref("");
    async function i(m, r) {
      s.value = !0, o.value = m, c.value = "";
      try {
        await J(m === "load" ? "demo.load" : "demo.clear"), await ce().catch(() => null), y.success(r), n("changed");
      } catch (g) {
        c.value = X.errorMessage(g);
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
    async function b() {
      await p.confirm({
        title: t.t("清空数据"),
        message: t.t("删除全部项目、会议（含上传的文件）、任务和通知，不能撤销；组织、声纹与系统设置保留。确定清空吗？"),
        confirmLabel: t.t("清空"),
        danger: !0
      }) && await i("clear", t.t("数据已清空"));
    }
    return (m, r) => (e.openBlock(), e.createElementBlock("div", nV, [
      e.createElementVNode("header", oV, [
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
      c.value ? (e.openBlock(), e.createElementBlock("p", aV, [
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
      e.createElementVNode("p", sV, [
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
      e.createElementVNode("div", rV, [
        e.createElementVNode("section", iV, [
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
          ], 8, cV)
        ]),
        e.createElementVNode("section", dV, [
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
            onClick: b
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
          ], 8, mV)
        ])
      ])
    ]));
  }
}), pV = /* @__PURE__ */ ae(uV, [["__scopeId", "data-v-2c906f2d"]]), vV = {
  class: "mm-settings",
  "data-test": "mm-settings-tab"
}, kV = { class: "mm-pagehead" }, yV = {
  key: 0,
  class: "ss-empty",
  "data-test": "mm-settings-denied"
}, gV = {
  key: 1,
  class: "mm-settings__grid"
}, fV = ["aria-label"], NV = ["aria-current", "data-test", "onClick"], VV = { class: "mm-settings__panel" }, EV = {
  key: 0,
  class: "ss-note danger"
}, $V = {
  key: 1,
  class: "ss-muted"
}, bV = /* @__PURE__ */ e.defineComponent({
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
    ], p = e.ref("voiceprint");
    e.watch(nt, (U) => {
      U && n.some((j) => j.key === U) && (p.value = U), U && (nt.value = "");
    }, { immediate: !0 });
    const y = e.ref(null), s = e.ref([]), o = e.ref([]), c = e.ref(0), i = e.ref(""), k = e.computed(() => !!oe.value?.me.isAdmin);
    async function b() {
      try {
        y.value = await J("settings.get"), i.value = "";
      } catch (U) {
        i.value = X.errorMessage(U);
      }
    }
    async function m() {
      try {
        const U = await J("people.list");
        s.value = U?.people ?? [], o.value = U?.depts ?? [];
      } catch (U) {
        i.value = X.errorMessage(U);
      }
    }
    let r = 0;
    async function g() {
      r = Date.now(), c.value += 1, await Promise.all([b(), m(), ce().catch(() => null)]);
    }
    async function h(U) {
      U && typeof U == "object" && "adminIds" in U ? y.value = U : await b(), await ce().catch(() => null);
    }
    let a = null, N = null;
    e.onMounted(() => {
      k.value && g(), N = Se((U) => {
        U.type !== "changed" || !["all", "org", "settings"].includes(U.scope) || (a && clearTimeout(a), a = setTimeout(() => {
          a = null, k.value && g();
        }, 300));
      });
    }), e.watch(k, (U) => {
      U && !y.value && g();
    });
    function T() {
      a || !k.value || Date.now() - r < 800 || (a = setTimeout(() => {
        a = null, g();
      }, 300));
    }
    return v({ refresh: T }), e.onBeforeUnmount(() => {
      N?.(), a && clearTimeout(a);
    }), (U, j) => (e.openBlock(), e.createElementBlock("div", vV, [
      e.createElementVNode("header", kV, [
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
      k.value ? (e.openBlock(), e.createElementBlock("div", gV, [
        e.createElementVNode("nav", {
          class: "mm-smenu",
          "aria-label": U.$t("设置项")
        }, [
          (e.openBlock(), e.createElementBlock(
            e.Fragment,
            null,
            e.renderList(n, (D) => e.createElementVNode("button", {
              key: D.key,
              type: "button",
              class: e.normalizeClass({ on: p.value === D.key }),
              "aria-current": p.value === D.key ? "page" : void 0,
              "data-test": `mm-settings-menu-${D.key}`,
              onClick: (A) => p.value = D.key
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
            ], 10, NV)),
            64
            /* STABLE_FRAGMENT */
          ))
        ], 8, fV),
        e.createElementVNode("section", VV, [
          i.value ? (e.openBlock(), e.createElementBlock("p", EV, [
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
            $V,
            e.toDisplayString(U.$t("加载中…")),
            1
            /* TEXT */
          )) : y.value ? (e.openBlock(), e.createElementBlock(
            e.Fragment,
            { key: 2 },
            [
              p.value === "voiceprint" ? (e.openBlock(), e.createBlock(Jy, {
                key: 0,
                people: s.value,
                depts: o.value,
                "refresh-seq": c.value
              }, null, 8, ["people", "depts", "refresh-seq"])) : p.value === "org" ? (e.openBlock(), e.createBlock(Tg, {
                key: 1,
                people: s.value,
                depts: o.value,
                onChanged: g
              }, null, 8, ["people", "depts"])) : p.value === "roles" ? (e.openBlock(), e.createBlock(Kg, {
                key: 2,
                settings: y.value,
                people: s.value,
                depts: o.value,
                onSaved: h
              }, null, 8, ["settings", "people", "depts"])) : p.value === "ai" ? (e.openBlock(), e.createBlock(m1, {
                key: 3,
                settings: y.value,
                onSaved: h
              }, null, 8, ["settings"])) : p.value === "wecom" ? (e.openBlock(), e.createBlock(pN, {
                key: 4,
                settings: y.value,
                onSaved: h
              }, null, 8, ["settings"])) : p.value === "params" ? (e.openBlock(), e.createBlock(_N, {
                key: 5,
                settings: y.value,
                onSaved: h
              }, null, 8, ["settings"])) : p.value === "mobile" ? (e.openBlock(), e.createBlock(lV, {
                key: 6,
                people: s.value,
                depts: o.value
              }, null, 8, ["people", "depts"])) : (e.openBlock(), e.createBlock(pV, {
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
        yV,
        e.toDisplayString(U.$t("只有管理员可以查看和修改系统设置。如需调整，请联系管理员。")),
        1
        /* TEXT */
      ))
    ]));
  }
}), hV = /* @__PURE__ */ ae(bV, [["__scopeId", "data-v-0fcda9a3"]]), _V = ["aria-label"], BV = { class: "mm-sw2" }, SV = { class: "mm-sw2__head" }, DV = { class: "mm-sw2__title" }, wV = {
  class: "mm-sw2__progress",
  "data-test": "mm-setup-progress"
}, CV = { class: "mm-bar" }, TV = { class: "mm-sw2__body" }, IV = ["aria-label"], MV = ["data-test", "onClick"], AV = { class: "mm-sw2__num" }, jV = {
  key: 0,
  class: "ri-check-line"
}, LV = { class: "mm-sw2__stxt" }, zV = { class: "mm-sw2__panel" }, FV = {
  key: 0,
  class: "mm-sw2__step",
  "data-test": "mm-setup-identity"
}, PV = { class: "ss-muted" }, UV = ["placeholder"], OV = { class: "mm-sw2__people" }, RV = ["disabled", "data-test", "onClick"], qV = {
  key: 0,
  class: "ss-muted"
}, KV = {
  key: 0,
  class: "ss-note danger"
}, HV = {
  key: 0,
  class: "ss-note danger"
}, WV = {
  key: 1,
  class: "ss-note"
}, GV = {
  key: 0,
  class: "mm-sw2__step",
  "data-test": "mm-setup-models"
}, YV = { class: "ss-muted" }, JV = {
  class: "mm-sw2__hw",
  "data-test": "mm-setup-hw"
}, QV = { class: "mm-sw2__items" }, ZV = {
  key: 0,
  class: "ss-chip ok",
  "data-test": "mm-setup-spk-ok"
}, XV = ["disabled"], xV = {
  key: 0,
  class: "ss-muted mono mm-sw2__log",
  "data-test": "mm-setup-install-log"
}, eE = {
  key: 1,
  class: "ss-note danger"
}, tE = {
  class: "mm-sw2__step",
  "data-test": "mm-setup-org"
}, lE = { class: "ss-muted" }, nE = {
  class: "ss-note info",
  "data-test": "mm-setup-org-now"
}, oE = { class: "mm-sw2__opts" }, aE = ["disabled"], sE = { class: "mm-sw2__row" }, rE = ["disabled"], iE = { class: "mm-sw2__links" }, cE = { class: "mm-sw2__form" }, dE = { class: "mm-sw2__secret" }, mE = ["type", "placeholder"], uE = ["title", "disabled"], pE = ["disabled"], vE = {
  class: "mm-sw2__guide",
  "data-test": "mm-setup-app-guide"
}, kE = { class: "mm-sw2__ol" }, yE = {
  key: 0,
  class: "ss-note warn mm-sw2__ip",
  "data-test": "mm-setup-egress-ip"
}, gE = { class: "mono" }, fE = {
  class: "mm-sw2__step",
  "data-test": "mm-setup-push"
}, NE = { class: "ss-muted" }, VE = { class: "mm-sw2__box" }, EE = { class: "mm-sw2__boxhead" }, $E = { class: "mm-sw2__ol" }, bE = { class: "mm-sw2__row" }, hE = ["placeholder"], _E = ["disabled"], BE = ["disabled"], SE = { class: "mm-sw2__box" }, DE = {
  class: "ss-muted",
  "data-test": "mm-setup-mentionable"
}, wE = { class: "mm-sw2__row" }, CE = { class: "mm-sw2__who" }, TE = ["placeholder"], IE = ["disabled"], ME = { class: "ss-muted" }, AE = {
  class: "mm-sw2__step",
  "data-test": "mm-setup-mobile-step"
}, jE = { class: "ss-muted" }, LE = {
  class: "mm-sw2__step",
  "data-test": "mm-setup-voice"
}, zE = { class: "ss-muted" }, FE = {
  key: 0,
  class: "ss-note warn"
}, PE = { class: "mm-sw2__consent" }, UE = { class: "mm-sw2__row" }, OE = ["disabled"], RE = ["disabled"], qE = {
  class: "mm-sw2__step",
  "data-test": "mm-setup-ai"
}, KE = { class: "ss-muted" }, HE = ["disabled"], WE = {
  class: "mm-sw2__step",
  "data-test": "mm-setup-finish"
}, GE = { class: "mm-sw2__sum" }, YE = ["onClick"], JE = { class: "ss-muted" }, QE = {
  key: 7,
  class: "ss-note danger",
  "data-test": "mm-setup-error"
}, ZE = { class: "mm-sw2__foot" }, XE = ["disabled"], xE = ["disabled"], e$ = /* @__PURE__ */ e.defineComponent({
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
    ], p = [...n.map((L) => L.key), "finish"], y = v, s = e.ref(null), o = e.ref("models"), c = e.computed(() => p.indexOf(o.value)), i = e.reactive(/* @__PURE__ */ new Set()), k = e.ref(""), b = e.ref(""), m = e.ref(!1), r = e.ref(""), g = e.ref(""), h = e.ref(""), a = e.ref(null), N = e.reactive({ corpId: "", agentId: "", secret: "" }), T = e.ref(""), U = e.ref(null), j = e.ref(""), D = e.ref(!1), A = e.ref(null), P = e.ref(null), R = e.ref(null), _ = e.ref(!1), S = e.ref(!1), E = e.ref(!1), M = e.ref([]), I = e.ref([]), H = e.ref(""), f = e.computed(() => {
      const L = H.value.trim(), W = L ? M.value.filter((_e) => _e.name.includes(L)) : M.value, le = [];
      for (const _e of I.value) {
        const qe = W.filter((Yt) => Yt.deptId === _e.id);
        qe.length && le.push({ id: _e.id, name: _e.name, people: qe });
      }
      const pe = W.filter((_e) => !I.value.some((qe) => qe.id === _e.deptId));
      return pe.length && le.push({ id: "_", name: t.t("其他"), people: pe }), le;
    }), d = e.computed(() => /60020|可信 IP|trusted IP/i.test(b.value) ? /(\d{1,3}(?:\.\d{1,3}){3})/.exec(b.value)?.[1] ?? "" : "");
    async function u() {
      try {
        await navigator.clipboard.writeText(d.value);
      } catch {
      }
    }
    const z = /当前身份无效|请先选择身份|identity is invalid|select an identity/i;
    async function Q() {
      try {
        s.value = await J("setup.status"), k.value = "", E.value = !1, j.value = s.value.me.mobile || "", !N.corpId && s.value.wecom?.corpId && (N.corpId = s.value.wecom.corpId), !N.agentId && s.value.wecom?.agentId && (N.agentId = s.value.wecom.agentId);
      } catch (L) {
        const W = X.errorMessage(L);
        z.test(W) ? await te() : k.value = W;
      }
    }
    async function te() {
      try {
        const L = await J("people.list");
        I.value = L?.depts ?? [], M.value = L?.people ?? [];
      } catch {
      }
      H.value = "", E.value = !0;
    }
    function K(L) {
      return O("identity", async () => {
        await J("identity.set", { personId: L }), He(), await ce().catch(() => null), E.value = !1, await Q();
      });
    }
    async function G() {
      if (!S.value && !N.secret && s.value?.wecom?.hasSecret)
        try {
          const L = await J("wecom.secret.reveal");
          N.secret = L?.secret || "";
        } catch (L) {
          b.value = X.errorMessage(L);
          return;
        }
      S.value = !S.value;
    }
    function ee(L) {
      const W = s.value;
      if (!W) return !1;
      switch (L) {
        case "models":
          return (W.models.asrReady || W.asr?.mode === "cloud" && !!W.asr.cloud?.hasKey) && W.models.speaker && W.models.python && W.models.ffmpeg;
        case "org":
          return W.org.people > 0 && (W.org.source !== "demo" || _.value);
        case "push":
          return !!W.push.channel;
        case "mobile":
          return W.mobile.running;
        case "voice":
          return W.me.voiceprint;
        case "ai":
          return !!R.value?.ok;
      }
    }
    function ne(L) {
      return L === "finish" ? "todo" : ee(L) ? "done" : i.has(L) ? "skipped" : "todo";
    }
    const V = e.computed(() => n.filter((L) => ee(L.key)).length);
    function $(L) {
      const W = s.value;
      if (!W) return "";
      switch (L) {
        case "models": {
          const le = W.asr?.mode === "cloud" ? t.t("在线接口") : W.recommend.engine === "firered" ? "FireRedASR2" : "SenseVoice";
          return ee(L) ? t.t("{m} 和声纹模型已就绪", { m: le }) : t.t("推荐 {m}", { m: le });
        }
        case "org":
          return t.t("{src} · {n} 人", { src: B.value, n: W.org.people });
        case "push":
          return W.push.channel === "app" ? t.t("企微自建应用") : W.push.channel === "webhook" ? t.t("企微群机器人") : t.t("只进消息中心");
        case "mobile":
          return W.mobile.running ? t.t("运行中") : t.t("未开启");
        case "voice":
          return W.me.voiceprint ? t.t("已采集") : t.t("未采集");
        case "ai":
          return R.value ? R.value.ok ? t.t("可用") : t.t("没连上") : t.t("未测试");
      }
    }
    const B = e.computed(() => {
      const L = s.value?.org.source;
      return L === "wecom" ? t.t("企微通讯录") : L === "import" ? t.t("导入的通讯录") : L === "demo" ? t.t("演示组织") : t.t("还没有组织");
    }), w = e.computed(() => ({ good: t.t("配置很好"), ok: t.t("够用"), weak: t.t("偏弱") })[s.value?.recommend.tier || "ok"]), q = e.computed(() => ({ good: "ok", ok: "brand", weak: "warn" })[s.value?.recommend.tier || "ok"]), Y = e.computed(() => t.t("大家好，我是{dept}的{name}。这是我的声纹采集录音，用于在会议纪要里自动识别我的发言。我会用平时开会说话的音量和语速，把这段话完整地读完。", {
      dept: s.value?.me.deptName || "",
      name: s.value?.me.name || ""
    }));
    async function O(L, W) {
      m.value = !0, r.value = L, b.value = "";
      try {
        await W();
      } catch (le) {
        b.value = X.errorMessage(le);
      } finally {
        m.value = !1, r.value = "";
      }
    }
    function C(L) {
      L && (o.value = L, b.value = "");
    }
    function F() {
      o.value !== "finish" && i.add(o.value), C(p[c.value + 1]);
    }
    e.watch(o, (L) => {
      L === "mobile" && s.value && !s.value.mobile.running && O("mobile", async () => {
        await J("mobile.start"), await Q(), await ce().catch(() => null);
      });
    });
    const x = () => window.electronAPI?.pyExt;
    let Z = null;
    async function se(L) {
      const W = x();
      if (!W?.install) {
        b.value = t.t("组件安装器不可用，请到应用的 设置 → 语音 里下载");
        return;
      }
      g.value = L, h.value = t.t("开始下载…"), b.value = "";
      try {
        const le = await W.install(L);
        le?.ok ? h.value = t.t("下载完成") : b.value = le?.error || t.t("下载失败"), await Q();
      } catch (le) {
        b.value = X.errorMessage(le);
      } finally {
        g.value = "";
      }
    }
    function Ee() {
      return O("demo", async () => {
        const L = s.value?.org.source !== "demo" ? await J("org.sync") : null;
        _.value = !0, await ce().catch(() => null), L?.needIdentity ? await te() : await Q();
      });
    }
    function he() {
      return O("import", async () => {
        const L = await J("org.importFile");
        L && (a.value = L, await ce().catch(() => null), L.needIdentity ? await te() : await Q());
      });
    }
    function Te() {
      return O("app", async () => {
        const L = { corpId: N.corpId.trim(), agentId: N.agentId.trim() };
        N.secret && (L.secret = N.secret), await J("wecom.save", L);
        const W = await J("org.sync");
        if (W?.error) throw new Error(W.error);
        await ce().catch(() => null), W?.needIdentity ? await te() : await Q();
      });
    }
    function me() {
      return O("hook", async () => {
        U.value = null, await J("wecom.webhook.save", { url: T.value.trim() }), T.value = "", await Q(), await ce().catch(() => null);
      });
    }
    function Re() {
      return O("hookTest", async () => {
        const L = await J("wecom.webhook.test");
        U.value = { ok: !!L?.ok, error: L?.error };
      });
    }
    function tt() {
      return O("mobileNo", async () => {
        s.value && (await J("org.person.contact", { personId: s.value.me.id, mobile: j.value.trim() }), await Q());
      });
    }
    function Kt() {
      return O("voice", async () => {
        if (!(!A.value || !s.value)) {
          P.value = null;
          try {
            const L = await J("voiceprint.enrollData", { personId: s.value.me.id, consent: !0, data: A.value.data, ext: A.value.ext });
            P.value = { ok: !0, seconds: L?.seconds };
          } catch (L) {
            P.value = { ok: !1, error: X.errorMessage(L) };
          }
          await Q();
        }
      });
    }
    function Ht() {
      return O("voice", async () => {
        if (s.value) {
          P.value = null;
          try {
            const L = await J("voiceprint.import", { personId: s.value.me.id, consent: !0 });
            L && (P.value = { ok: !0, seconds: L.seconds });
          } catch (L) {
            P.value = { ok: !1, error: X.errorMessage(L) };
          }
          await Q();
        }
      });
    }
    function Wt() {
      return O("llm", async () => {
        R.value = await J("setup.llmTest");
      });
    }
    function Gt() {
      return O("finish", async () => {
        await J("setup.finish"), await ce().catch(() => null), y("done");
      });
    }
    return e.onMounted(() => {
      Q();
      const L = x();
      L?.onInstallProgress && (Z = L.onInstallProgress((W) => {
        W?.id && W.id === g.value && W.line && (h.value = String(W.line).slice(0, 200));
      }));
    }), e.onBeforeUnmount(() => {
      try {
        Z?.();
      } catch {
      }
    }), (L, W) => (e.openBlock(), e.createElementBlock("div", {
      class: "mm-setup-overlay",
      role: "dialog",
      "aria-modal": "true",
      "aria-label": L.$t("配置引导"),
      "data-test": "mm-setup"
    }, [
      e.createElementVNode("div", BV, [
        e.createElementVNode("header", SV, [
          e.createElementVNode("div", DV, [
            e.createElementVNode(
              "h2",
              null,
              e.toDisplayString(L.$t("配置引导")),
              1
              /* TEXT */
            ),
            e.createElementVNode(
              "p",
              null,
              e.toDisplayString(L.$t("把泰途会议智能管理要用到的配置一步步配好。每一步都可以先跳过，之后点右上角「配置引导」继续。")),
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
              onClick: W[0] || (W[0] = (le) => y("close"))
            },
            e.toDisplayString(L.$t("稍后再说")),
            1
            /* TEXT */
          )
        ]),
        e.createCommentVNode(" 进度条固定在顶部，内容区自己滚 "),
        e.createElementVNode("div", wV, [
          e.createElementVNode("i", CV, [
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
            e.toDisplayString(L.$t("已完成 {a} / {b}", { a: V.value, b: n.length })),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode("div", TV, [
          e.createElementVNode("nav", {
            class: "mm-sw2__steps",
            "aria-label": L.$t("步骤")
          }, [
            (e.openBlock(), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(n, (le, pe) => e.createElementVNode("button", {
                key: le.key,
                type: "button",
                class: e.normalizeClass({ on: o.value === le.key, ok: ne(le.key) === "done", skip: ne(le.key) === "skipped" }),
                "data-test": `mm-setup-step-${le.key}`,
                onClick: (_e) => C(le.key)
              }, [
                e.createElementVNode("span", AV, [
                  ne(le.key) === "done" ? (e.openBlock(), e.createElementBlock("i", jV)) : (e.openBlock(), e.createElementBlock(
                    e.Fragment,
                    { key: 1 },
                    [
                      e.createTextVNode(
                        e.toDisplayString(pe + 1),
                        1
                        /* TEXT */
                      )
                    ],
                    64
                    /* STABLE_FRAGMENT */
                  ))
                ]),
                e.createElementVNode("span", LV, [
                  e.createElementVNode(
                    "strong",
                    null,
                    e.toDisplayString(le.title),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "small",
                    null,
                    e.toDisplayString($(le.key)),
                    1
                    /* TEXT */
                  )
                ])
              ], 10, MV)),
              64
              /* STABLE_FRAGMENT */
            ))
          ], 8, IV),
          e.createElementVNode("section", zV, [
            e.createCommentVNode(" 通讯录换成新的（企微同步 / 导入）后，原来的身份不在里面了：直接在这里选「你是谁」，选中的人成为管理员 "),
            E.value ? (e.openBlock(), e.createElementBlock("div", FV, [
              e.createElementVNode(
                "h3",
                null,
                e.toDisplayString(L.$t("通讯录已更新，你是哪一位？")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "p",
                PV,
                e.toDisplayString(L.$t("组织已经换成新的通讯录（{n} 人），原来的演示身份不在里面了。选你自己，之后按你的身份继续配置；你会成为泰途会议智能管理的管理员。", { n: M.value.length })),
                1
                /* TEXT */
              ),
              e.withDirectives(e.createElementVNode("input", {
                "onUpdate:modelValue": W[1] || (W[1] = (le) => H.value = le),
                class: "mm-sw2__search",
                type: "search",
                placeholder: L.$t("搜索姓名"),
                "data-test": "mm-setup-identity-search"
              }, null, 8, UV), [
                [e.vModelText, H.value]
              ]),
              e.createElementVNode("div", OV, [
                (e.openBlock(!0), e.createElementBlock(
                  e.Fragment,
                  null,
                  e.renderList(f.value, (le) => (e.openBlock(), e.createElementBlock(
                    e.Fragment,
                    {
                      key: le.id
                    },
                    [
                      e.createElementVNode(
                        "h5",
                        null,
                        e.toDisplayString(le.name),
                        1
                        /* TEXT */
                      ),
                      (e.openBlock(!0), e.createElementBlock(
                        e.Fragment,
                        null,
                        e.renderList(le.people, (pe) => (e.openBlock(), e.createElementBlock("button", {
                          key: pe.id,
                          type: "button",
                          class: "mm-sw2__person",
                          disabled: m.value,
                          "data-test": `mm-setup-me-${pe.id}`,
                          onClick: (_e) => K(pe.id)
                        }, [
                          e.createElementVNode(
                            "strong",
                            null,
                            e.toDisplayString(pe.name),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "small",
                            null,
                            e.toDisplayString(pe.title || ""),
                            1
                            /* TEXT */
                          )
                        ], 8, RV))),
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
                f.value.length ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock(
                  "p",
                  qV,
                  e.toDisplayString(L.$t("没有找到这个人")),
                  1
                  /* TEXT */
                ))
              ]),
              b.value ? (e.openBlock(), e.createElementBlock("p", KV, [
                W[20] || (W[20] = e.createElementVNode(
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
                k.value ? (e.openBlock(), e.createElementBlock("p", HV, [
                  W[21] || (W[21] = e.createElementVNode(
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
                !s.value && !k.value ? (e.openBlock(), e.createElementBlock("p", WV, [
                  W[22] || (W[22] = e.createElementVNode(
                    "i",
                    { class: "ri-loader-4-line spin" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(L.$t("正在检测…")),
                    1
                    /* TEXT */
                  )
                ])) : e.createCommentVNode("v-if", !0),
                s.value ? (e.openBlock(), e.createElementBlock(
                  e.Fragment,
                  { key: 2 },
                  [
                    e.createCommentVNode(" 1 电脑配置与语音模型 "),
                    o.value === "models" ? (e.openBlock(), e.createElementBlock("div", GV, [
                      e.createElementVNode(
                        "h3",
                        null,
                        e.toDisplayString(L.$t("电脑配置与语音模型")),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "p",
                        YV,
                        e.toDisplayString(L.$t("按这台电脑的配置推荐跑得动的最准的转写模型（录音不出电脑）；也可以改填自己的在线语音识别接口。认人（声纹）始终在本机。")),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode("div", JV, [
                        e.createElementVNode("div", null, [
                          e.createElementVNode(
                            "small",
                            null,
                            e.toDisplayString(L.$t("处理器")),
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
                            e.toDisplayString(L.$t("{n} 核", { n: s.value.hardware.cores })),
                            1
                            /* TEXT */
                          )
                        ]),
                        e.createElementVNode("div", null, [
                          e.createElementVNode(
                            "small",
                            null,
                            e.toDisplayString(L.$t("内存")),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "b",
                            null,
                            e.toDisplayString(L.$t("{n} GB", { n: s.value.hardware.memGb })),
                            1
                            /* TEXT */
                          )
                        ]),
                        e.createElementVNode("div", null, [
                          e.createElementVNode(
                            "small",
                            null,
                            e.toDisplayString(L.$t("模型所在磁盘剩余")),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "b",
                            null,
                            e.toDisplayString(s.value.hardware.freeDiskGb === null ? "—" : L.$t("{n} GB", { n: s.value.hardware.freeDiskGb })),
                            1
                            /* TEXT */
                          )
                        ]),
                        e.createElementVNode("div", null, [
                          e.createElementVNode(
                            "small",
                            null,
                            e.toDisplayString(L.$t("评级")),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode("b", null, [
                            e.createElementVNode(
                              "span",
                              {
                                class: e.normalizeClass(["ss-chip", q.value])
                              },
                              e.toDisplayString(w.value),
                              3
                              /* TEXT, CLASS */
                            )
                          ])
                        ])
                      ]),
                      e.createVNode(qt, {
                        "data-test": "mm-setup-asr",
                        onChanged: Q
                      }),
                      e.createElementVNode("ul", QV, [
                        e.createElementVNode("li", null, [
                          e.createElementVNode("div", null, [
                            e.createElementVNode(
                              "strong",
                              null,
                              e.toDisplayString(L.$t("声纹模型 CAM++")),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "small",
                              null,
                              e.toDisplayString(L.$t("用来按声音认出是谁在发言")),
                              1
                              /* TEXT */
                            )
                          ]),
                          s.value.models.speaker ? (e.openBlock(), e.createElementBlock(
                            "span",
                            ZV,
                            e.toDisplayString(L.$t("已下载")),
                            1
                            /* TEXT */
                          )) : (e.openBlock(), e.createElementBlock("button", {
                            key: 1,
                            type: "button",
                            class: "ss-btn primary sm",
                            disabled: !!g.value,
                            "data-test": "mm-setup-spk-install",
                            onClick: W[2] || (W[2] = (le) => se(s.value.recommend.speakerInstallId))
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
                              e.toDisplayString(L.$t("下载")),
                              1
                              /* TEXT */
                            )
                          ], 8, XV))
                        ]),
                        e.createElementVNode("li", null, [
                          e.createElementVNode("div", null, [
                            e.createElementVNode(
                              "strong",
                              null,
                              e.toDisplayString(L.$t("本机语音运行组件")),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "small",
                              null,
                              e.toDisplayString(L.$t("随应用自带的 Python 和 ffmpeg")),
                              1
                              /* TEXT */
                            )
                          ]),
                          e.createElementVNode(
                            "span",
                            {
                              class: e.normalizeClass(["ss-chip", s.value.models.python && s.value.models.ffmpeg ? "ok" : "bad"])
                            },
                            e.toDisplayString(s.value.models.python && s.value.models.ffmpeg ? L.$t("正常") : L.$t("缺失")),
                            3
                            /* TEXT, CLASS */
                          )
                        ])
                      ]),
                      h.value ? (e.openBlock(), e.createElementBlock(
                        "p",
                        xV,
                        e.toDisplayString(h.value),
                        1
                        /* TEXT */
                      )) : e.createCommentVNode("v-if", !0),
                      s.value.models.python && s.value.models.ffmpeg ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock("p", eE, [
                        W[23] || (W[23] = e.createElementVNode(
                          "i",
                          { class: "ri-error-warning-line" },
                          null,
                          -1
                          /* CACHED */
                        )),
                        e.createTextVNode(
                          e.toDisplayString(L.$t("本机语音运行组件不完整，录音没法处理。请重新安装应用，或到应用的 设置 → 语音 里修复。")),
                          1
                          /* TEXT */
                        )
                      ]))
                    ])) : o.value === "org" ? (e.openBlock(), e.createElementBlock(
                      e.Fragment,
                      { key: 1 },
                      [
                        e.createCommentVNode(" 2 组织架构 "),
                        e.createElementVNode("div", tE, [
                          e.createElementVNode(
                            "h3",
                            null,
                            e.toDisplayString(L.$t("组织架构")),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "p",
                            lE,
                            e.toDisplayString(L.$t("任务按部门派给部门负责人，发言人只在本场参会人里认，都要先有组织架构。")),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode("p", nE, [
                            W[24] || (W[24] = e.createElementVNode(
                              "i",
                              { class: "ri-team-line" },
                              null,
                              -1
                              /* CACHED */
                            )),
                            e.createTextVNode(
                              e.toDisplayString(L.$t("现在：{src} · {n} 人 · {d} 个部门", { src: B.value, n: s.value.org.people, d: s.value.org.depts })),
                              1
                              /* TEXT */
                            )
                          ]),
                          e.createElementVNode("div", oE, [
                            e.createElementVNode("article", null, [
                              e.createElementVNode(
                                "strong",
                                null,
                                e.toDisplayString(L.$t("先用演示组织")),
                                1
                                /* TEXT */
                              ),
                              e.createElementVNode(
                                "small",
                                null,
                                e.toDisplayString(L.$t("20 人、6 个部门，和原型同名，适合演示和培训。右上角「当前身份」能切到任意人推进流程。")),
                                1
                                /* TEXT */
                              ),
                              e.createElementVNode("button", {
                                type: "button",
                                class: "ss-btn sm",
                                disabled: m.value,
                                "data-test": "mm-setup-org-demo",
                                onClick: Ee
                              }, e.toDisplayString(s.value.org.source === "demo" ? L.$t("就用演示组织") : L.$t("换回演示组织")), 9, aE)
                            ]),
                            e.createElementVNode("article", null, [
                              e.createElementVNode(
                                "strong",
                                null,
                                e.toDisplayString(L.$t("导入通讯录表格（推荐）")),
                                1
                                /* TEXT */
                              ),
                              e.createElementVNode(
                                "small",
                                null,
                                e.toDisplayString(L.$t("企业微信管理后台 → 通讯录 → 批量导入/导出 → 导出成员，把导出的表格直接导进来。自己整理的表格也行：至少要有「姓名」「部门」，「手机」「账号」「是否部门负责人」「直属上级」有就更好。")),
                                1
                                /* TEXT */
                              ),
                              e.createElementVNode("div", sE, [
                                e.createElementVNode("button", {
                                  type: "button",
                                  class: "ss-btn primary sm",
                                  disabled: m.value,
                                  "data-test": "mm-setup-org-import",
                                  onClick: he
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
                                    e.toDisplayString(L.$t("选择表格导入")),
                                    1
                                    /* TEXT */
                                  )
                                ], 8, rE),
                                e.createElementVNode("button", {
                                  type: "button",
                                  class: "ss-link",
                                  "data-test": "mm-setup-link-contacts",
                                  onClick: W[3] || (W[3] = (le) => e.unref(ue)(e.unref(fe).contacts))
                                }, [
                                  e.createTextVNode(
                                    e.toDisplayString(L.$t("去企微后台导出")) + " ",
                                    1
                                    /* TEXT */
                                  ),
                                  W[25] || (W[25] = e.createElementVNode(
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
                                e.toDisplayString(L.$t("企业微信自建应用")),
                                1
                                /* TEXT */
                              ),
                              e.createElementVNode(
                                "small",
                                null,
                                e.toDisplayString(L.$t("有自建应用（CorpID、AgentID、Secret，且本机出口 IP 在企业可信 IP 里）时，直接从企微同步通讯录，通知按人发卡片。")),
                                1
                                /* TEXT */
                              ),
                              e.createElementVNode("div", iE, [
                                e.createElementVNode("button", {
                                  type: "button",
                                  class: "ss-link",
                                  "data-test": "mm-setup-link-profile",
                                  onClick: W[4] || (W[4] = (le) => e.unref(ue)(e.unref(fe).profile))
                                }, [
                                  e.createTextVNode(
                                    e.toDisplayString(L.$t("打开企微·我的企业（查 CorpID）")) + " ",
                                    1
                                    /* TEXT */
                                  ),
                                  W[26] || (W[26] = e.createElementVNode(
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
                                  onClick: W[5] || (W[5] = (le) => e.unref(ue)(e.unref(fe).apps))
                                }, [
                                  e.createTextVNode(
                                    e.toDisplayString(L.$t("打开企微·应用管理")) + " ",
                                    1
                                    /* TEXT */
                                  ),
                                  W[27] || (W[27] = e.createElementVNode(
                                    "i",
                                    { class: "ri-external-link-line" },
                                    null,
                                    -1
                                    /* CACHED */
                                  ))
                                ])
                              ]),
                              e.createElementVNode("div", cE, [
                                e.withDirectives(e.createElementVNode(
                                  "input",
                                  {
                                    "onUpdate:modelValue": W[6] || (W[6] = (le) => N.corpId = le),
                                    type: "text",
                                    placeholder: "CorpID",
                                    spellcheck: "false",
                                    "data-test": "mm-setup-corp"
                                  },
                                  null,
                                  512
                                  /* NEED_PATCH */
                                ), [
                                  [e.vModelText, N.corpId]
                                ]),
                                e.withDirectives(e.createElementVNode(
                                  "input",
                                  {
                                    "onUpdate:modelValue": W[7] || (W[7] = (le) => N.agentId = le),
                                    type: "text",
                                    placeholder: "AgentID",
                                    spellcheck: "false",
                                    "data-test": "mm-setup-agent"
                                  },
                                  null,
                                  512
                                  /* NEED_PATCH */
                                ), [
                                  [e.vModelText, N.agentId]
                                ]),
                                e.createElementVNode("span", dE, [
                                  e.withDirectives(e.createElementVNode("input", {
                                    "onUpdate:modelValue": W[8] || (W[8] = (le) => N.secret = le),
                                    type: S.value ? "text" : "password",
                                    placeholder: s.value.wecom?.hasSecret ? L.$t("已保存，点右边的眼睛查看") : "Secret",
                                    autocomplete: "new-password",
                                    spellcheck: "false",
                                    "data-test": "mm-setup-secret"
                                  }, null, 8, mE), [
                                    [e.vModelDynamic, N.secret]
                                  ]),
                                  e.createElementVNode("button", {
                                    type: "button",
                                    class: "mm-sw2__eye",
                                    title: S.value ? L.$t("隐藏") : L.$t("查看"),
                                    disabled: m.value,
                                    "data-test": "mm-setup-secret-eye",
                                    onClick: G
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
                                  ], 8, uE)
                                ])
                              ]),
                              e.createElementVNode("button", {
                                type: "button",
                                class: "ss-btn sm",
                                disabled: m.value || !N.corpId.trim() || !N.agentId.trim() || !N.secret && !s.value.push.appConfigured,
                                "data-test": "mm-setup-app-sync",
                                onClick: Te
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
                                  e.toDisplayString(L.$t("保存并同步通讯录")),
                                  1
                                  /* TEXT */
                                )
                              ], 8, pE),
                              e.createElementVNode("details", vE, [
                                e.createElementVNode(
                                  "summary",
                                  null,
                                  e.toDisplayString(L.$t("第一次接入：在企业微信管理后台做这几步")),
                                  1
                                  /* TEXT */
                                ),
                                e.createElementVNode("ol", kE, [
                                  e.createElementVNode("li", null, [
                                    e.createTextVNode(
                                      e.toDisplayString(L.$t("应用管理 → 自建 → 创建应用；可见范围选全公司（应用只能读到可见范围里的部门和成员）")) + " ",
                                      1
                                      /* TEXT */
                                    ),
                                    e.createElementVNode("button", {
                                      type: "button",
                                      class: "ss-link",
                                      onClick: W[9] || (W[9] = (le) => e.unref(ue)(e.unref(fe).apps))
                                    }, [
                                      e.createTextVNode(
                                        e.toDisplayString(L.$t("去打开")) + " ",
                                        1
                                        /* TEXT */
                                      ),
                                      W[28] || (W[28] = e.createElementVNode(
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
                                    e.toDisplayString(L.$t("应用详情 → 开发者接口 → 网页授权及 JS-SDK → 设置可信域名：填公司备案的域名，下载 WW_verify 开头的验证文件，放到网站根目录后点验证")),
                                    1
                                    /* TEXT */
                                  ),
                                  e.createElementVNode(
                                    "li",
                                    null,
                                    e.toDisplayString(L.$t("同一页「企业可信 IP」：填这台电脑所在网络的公网出口 IP。不知道就先点上面的「保存并同步通讯录」，失败时这里会显示要填的 IP")),
                                    1
                                    /* TEXT */
                                  ),
                                  e.createElementVNode("li", null, [
                                    e.createTextVNode(
                                      e.toDisplayString(L.$t("「我的企业」页面底部复制企业 ID（CorpID），应用详情里复制 AgentId 和 Secret，填到上面，再点「保存并同步通讯录」")) + " ",
                                      1
                                      /* TEXT */
                                    ),
                                    e.createElementVNode("button", {
                                      type: "button",
                                      class: "ss-link",
                                      onClick: W[10] || (W[10] = (le) => e.unref(ue)(e.unref(fe).profile))
                                    }, [
                                      e.createTextVNode(
                                        e.toDisplayString(L.$t("去打开")) + " ",
                                        1
                                        /* TEXT */
                                      ),
                                      W[29] || (W[29] = e.createElementVNode(
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
                          d.value ? (e.openBlock(), e.createElementBlock("p", yE, [
                            W[31] || (W[31] = e.createElementVNode(
                              "i",
                              { class: "ri-global-line" },
                              null,
                              -1
                              /* CACHED */
                            )),
                            e.createElementVNode("span", null, [
                              e.createTextVNode(
                                e.toDisplayString(L.$t("企业微信要求把这个 IP 加进应用的「企业可信 IP」：")),
                                1
                                /* TEXT */
                              ),
                              e.createElementVNode(
                                "b",
                                gE,
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
                                onClick: u
                              },
                              e.toDisplayString(L.$t("复制")),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode("button", {
                              type: "button",
                              class: "ss-link",
                              "data-test": "mm-setup-ip-open",
                              onClick: W[11] || (W[11] = (le) => e.unref(ue)(e.unref(fe).apps))
                            }, [
                              e.createTextVNode(
                                e.toDisplayString(L.$t("去应用管理填写")) + " ",
                                1
                                /* TEXT */
                              ),
                              W[30] || (W[30] = e.createElementVNode(
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
                                  e.toDisplayString(L.$t("已导入 {n} 人、{d} 个部门（新增 {a}，变更 {c}，不在表里的 {l} 人标为离职）", { n: a.value.people, d: a.value.depts, a: a.value.added.length, c: a.value.changed.length, l: a.value.left.length })),
                                  1
                                  /* TEXT */
                                ),
                                (e.openBlock(!0), e.createElementBlock(
                                  e.Fragment,
                                  null,
                                  e.renderList(a.value.warnings || [], (le, pe) => (e.openBlock(), e.createElementBlock(
                                    "p",
                                    { key: pe },
                                    e.toDisplayString(le),
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
                        e.createElementVNode("div", fE, [
                          e.createElementVNode(
                            "h3",
                            null,
                            e.toDisplayString(L.$t("通知推送")),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "p",
                            NE,
                            e.toDisplayString(L.$t("发言待确认、新任务、到期提醒这些通知发到哪里。不配也能用，通知只进系统内的消息中心。")),
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
                                " " + e.toDisplayString(s.value.push.channel === "app" ? L.$t("已连接企业微信自建应用：通知按人发卡片") : s.value.push.channel === "webhook" ? L.$t("已连接企微群机器人：通知发到群里") : L.$t("还没配置：通知只进消息中心")),
                                1
                                /* TEXT */
                              )
                            ],
                            2
                            /* CLASS */
                          ),
                          e.createElementVNode("article", VE, [
                            e.createElementVNode("div", EE, [
                              e.createElementVNode(
                                "strong",
                                null,
                                e.toDisplayString(L.$t("企微群机器人（推荐，最省事）")),
                                1
                                /* TEXT */
                              ),
                              e.createElementVNode("button", {
                                type: "button",
                                class: "ss-link",
                                "data-test": "mm-setup-link-webhook-doc",
                                onClick: W[12] || (W[12] = (le) => e.unref(ue)(e.unref(fe).webhookDoc))
                              }, [
                                e.createTextVNode(
                                  e.toDisplayString(L.$t("查看企微官方说明")) + " ",
                                  1
                                  /* TEXT */
                                ),
                                W[32] || (W[32] = e.createElementVNode(
                                  "i",
                                  { class: "ri-external-link-line" },
                                  null,
                                  -1
                                  /* CACHED */
                                ))
                              ])
                            ]),
                            e.createElementVNode("ol", $E, [
                              e.createElementVNode(
                                "li",
                                null,
                                e.toDisplayString(L.$t("在企业微信里打开要接收通知的内部群，点右上角「…」")),
                                1
                                /* TEXT */
                              ),
                              e.createElementVNode(
                                "li",
                                null,
                                e.toDisplayString(L.$t("选「消息推送」（旧版叫「群机器人」）→「添加」→ 新建一个，名字可以叫「会议助手」")),
                                1
                                /* TEXT */
                              ),
                              e.createElementVNode(
                                "li",
                                null,
                                e.toDisplayString(L.$t("复制生成的 Webhook 地址，粘贴到下面保存，再点「测试发送」看群里有没有收到")),
                                1
                                /* TEXT */
                              )
                            ]),
                            e.createElementVNode("div", bE, [
                              e.withDirectives(e.createElementVNode("input", {
                                "onUpdate:modelValue": W[13] || (W[13] = (le) => T.value = le),
                                type: "password",
                                spellcheck: "false",
                                autocomplete: "off",
                                placeholder: s.value.push.hasWebhook ? L.$t("已配置 {m}，要换地址再粘贴", { m: s.value.push.webhookMasked }) : "https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=…",
                                "data-test": "mm-setup-hook"
                              }, null, 8, hE), [
                                [e.vModelText, T.value]
                              ]),
                              e.createElementVNode("button", {
                                type: "button",
                                class: "ss-btn primary sm",
                                disabled: m.value || !T.value.trim(),
                                "data-test": "mm-setup-hook-save",
                                onClick: me
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
                                  e.toDisplayString(L.$t("保存")),
                                  1
                                  /* TEXT */
                                )
                              ], 8, _E),
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
                                    class: e.normalizeClass(r.value === "hookTest" ? "ri-loader-4-line spin" : "ri-send-plane-line")
                                  },
                                  null,
                                  2
                                  /* CLASS */
                                ),
                                e.createTextVNode(
                                  e.toDisplayString(L.$t("测试发送")),
                                  1
                                  /* TEXT */
                                )
                              ], 8, BE)
                            ]),
                            U.value ? (e.openBlock(), e.createElementBlock(
                              "p",
                              {
                                key: 0,
                                class: e.normalizeClass(["ss-note", U.value.ok ? "ok" : "danger"]),
                                "data-test": "mm-setup-hook-result"
                              },
                              e.toDisplayString(U.value.ok ? L.$t("已发到群里，请到企微群里看一眼") : U.value.error),
                              3
                              /* TEXT, CLASS */
                            )) : e.createCommentVNode("v-if", !0)
                          ]),
                          e.createElementVNode("article", SE, [
                            e.createElementVNode(
                              "strong",
                              null,
                              e.toDisplayString(L.$t("让群消息真正提醒到人")),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "small",
                              null,
                              e.toDisplayString(L.$t("群机器人按手机号或企微账号提醒本人（对方企微里会有提醒）。导入的通讯录里带了就不用管；演示时可以把你自己的手机号填上，群里就会提醒到你。")),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "p",
                              DE,
                              e.toDisplayString(L.$t("现在能提醒到本人的：{a} / {b} 人", { a: s.value.org.mentionable, b: s.value.org.people })),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode("div", wE, [
                              e.createElementVNode(
                                "span",
                                CE,
                                e.toDisplayString(s.value.me.name),
                                1
                                /* TEXT */
                              ),
                              e.withDirectives(e.createElementVNode("input", {
                                "onUpdate:modelValue": W[14] || (W[14] = (le) => j.value = le),
                                type: "tel",
                                placeholder: L.$t("你的手机号"),
                                "data-test": "mm-setup-mobile"
                              }, null, 8, TE), [
                                [e.vModelText, j.value]
                              ]),
                              e.createElementVNode("button", {
                                type: "button",
                                class: "ss-btn sm",
                                disabled: m.value || j.value.trim() === (s.value.me.mobile || ""),
                                "data-test": "mm-setup-mobile-save",
                                onClick: tt
                              }, e.toDisplayString(L.$t("保存")), 9, IE)
                            ]),
                            e.createElementVNode(
                              "p",
                              ME,
                              e.toDisplayString(L.$t("其他人的手机号、企微账号在「系统设置 → 通讯录」里逐个填。")),
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
                        e.createElementVNode("div", AE, [
                          e.createElementVNode(
                            "h3",
                            null,
                            e.toDisplayString(L.$t("手机端")),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "p",
                            jE,
                            e.toDisplayString(L.$t("同事用手机确认发言、接任务、录声纹，企微消息里的按钮也跳到这里。手机要和这台电脑在同一个网络。")),
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
                        e.createElementVNode("div", LE, [
                          e.createElementVNode(
                            "h3",
                            null,
                            e.toDisplayString(L.$t("采集你的声纹")),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "p",
                            zE,
                            e.toDisplayString(L.$t("采集过声纹的人，上传会议录音后会被自动认出来。先录你自己的；其他同事可以扫码在手机上自己录，或管理员在「系统设置 → 声纹库」代为导入。")),
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
                                " " + e.toDisplayString(s.value.me.voiceprint ? L.$t("{name} 的声纹已采集（重新录会覆盖）", { name: s.value.me.name }) : L.$t("{name} 还没有采集声纹", { name: s.value.me.name })) + " · " + e.toDisplayString(L.$t("全公司已采集 {a} / {b} 人", { a: s.value.voiceprints.collected, b: s.value.voiceprints.total })),
                                1
                                /* TEXT */
                              )
                            ],
                            2
                            /* CLASS */
                          ),
                          s.value.models.speaker ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock("p", FE, [
                            W[33] || (W[33] = e.createElementVNode(
                              "i",
                              { class: "ri-alert-line" },
                              null,
                              -1
                              /* CACHED */
                            )),
                            e.createTextVNode(
                              e.toDisplayString(L.$t("还没有下载声纹模型：请先在第 1 步下载。")),
                              1
                              /* TEXT */
                            )
                          ])),
                          e.createElementVNode("label", PE, [
                            e.withDirectives(e.createElementVNode(
                              "input",
                              {
                                "onUpdate:modelValue": W[15] || (W[15] = (le) => D.value = le),
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
                              e.toDisplayString(L.$t("我同意采集本人的声纹（声音特征），并在我确认会议发言后用其中我本人的发言补充声纹（最多保留最近 5 条），只用于在会议纪要里识别我的发言，保存在这台电脑上，可以随时在声纹库关闭补充或删除声纹。")),
                              1
                              /* TEXT */
                            )
                          ]),
                          e.createVNode(Rt, {
                            script: Y.value,
                            disabled: m.value || !s.value.models.speaker,
                            onRecorded: W[16] || (W[16] = (le) => A.value = le),
                            onReset: W[17] || (W[17] = (le) => A.value = null)
                          }, null, 8, ["script", "disabled"]),
                          e.createElementVNode("div", UE, [
                            e.createElementVNode("button", {
                              type: "button",
                              class: "ss-btn primary",
                              disabled: m.value || !D.value || !A.value || !s.value.models.speaker,
                              "data-test": "mm-setup-voice-submit",
                              onClick: Kt
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
                                e.toDisplayString(L.$t("提交声纹")),
                                1
                                /* TEXT */
                              )
                            ], 8, OE),
                            e.createElementVNode("button", {
                              type: "button",
                              class: "ss-link",
                              disabled: m.value || !D.value || !s.value.models.speaker,
                              "data-test": "mm-setup-voice-import",
                              onClick: Ht
                            }, e.toDisplayString(L.$t("改用已有的录音文件")), 9, RE)
                          ]),
                          P.value ? (e.openBlock(), e.createElementBlock(
                            "p",
                            {
                              key: 1,
                              class: e.normalizeClass(["ss-note", P.value.ok ? "ok" : "danger"]),
                              "data-test": "mm-setup-voice-result"
                            },
                            e.toDisplayString(P.value.ok ? L.$t("声纹已采集（{s} 秒）", { s: P.value.seconds }) : P.value.error),
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
                        e.createElementVNode("div", qE, [
                          e.createElementVNode(
                            "h3",
                            null,
                            e.toDisplayString(L.$t("大模型")),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "p",
                            KE,
                            e.toDisplayString(L.$t("整理议题和决议、生成执行方案、写周报和项目总结，用的是应用里当前选的大模型（会议转写和声纹不用它，只在本机）。")),
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
                                class: e.normalizeClass(r.value === "llm" ? "ri-loader-4-line spin" : "ri-flashlight-line")
                              },
                              null,
                              2
                              /* CLASS */
                            ),
                            e.createTextVNode(
                              e.toDisplayString(L.$t("测试连接")),
                              1
                              /* TEXT */
                            )
                          ], 8, HE),
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
                                " " + e.toDisplayString(R.value.ok ? L.$t("大模型可用：回复「{r}」，用时 {s} 秒", { r: R.value.reply, s: ((R.value.ms || 0) / 1e3).toFixed(1) }) : L.$t("没连上大模型：纪要整理和拆任务会按规则兜底，效果差很多。请到应用的「设置 → 模型」里选一个能用的模型，再回来测试。")),
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
                        e.createElementVNode("div", WE, [
                          e.createElementVNode(
                            "h3",
                            null,
                            e.toDisplayString(L.$t("配置完成情况")),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode("ul", GE, [
                            (e.openBlock(), e.createElementBlock(
                              e.Fragment,
                              null,
                              e.renderList(n, (le) => e.createElementVNode(
                                "li",
                                {
                                  key: le.key,
                                  class: e.normalizeClass(ne(le.key))
                                },
                                [
                                  e.createElementVNode(
                                    "i",
                                    {
                                      class: e.normalizeClass(ne(le.key) === "done" ? "ri-checkbox-circle-fill" : "ri-error-warning-line")
                                    },
                                    null,
                                    2
                                    /* CLASS */
                                  ),
                                  e.createElementVNode(
                                    "strong",
                                    null,
                                    e.toDisplayString(le.title),
                                    1
                                    /* TEXT */
                                  ),
                                  e.createElementVNode(
                                    "span",
                                    null,
                                    e.toDisplayString($(le.key)),
                                    1
                                    /* TEXT */
                                  ),
                                  ne(le.key) !== "done" ? (e.openBlock(), e.createElementBlock("button", {
                                    key: 0,
                                    type: "button",
                                    class: "ss-link",
                                    onClick: (pe) => C(le.key)
                                  }, e.toDisplayString(L.$t("去配置")), 9, YE)) : e.createCommentVNode("v-if", !0)
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
                            JE,
                            e.toDisplayString(L.$t("没配好的也可以先用，之后点右上角「配置引导」继续。")),
                            1
                            /* TEXT */
                          )
                        ])
                      ],
                      2112
                      /* STABLE_FRAGMENT, DEV_ROOT_FRAGMENT */
                    )) : e.createCommentVNode("v-if", !0),
                    b.value ? (e.openBlock(), e.createElementBlock("p", QE, [
                      W[34] || (W[34] = e.createElementVNode(
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
        e.createElementVNode("footer", ZE, [
          e.createElementVNode("button", {
            type: "button",
            class: "ss-btn",
            disabled: c.value <= 0,
            "data-test": "mm-setup-prev",
            onClick: W[18] || (W[18] = (le) => C(p[c.value - 1]))
          }, e.toDisplayString(L.$t("上一步")), 9, XE),
          W[35] || (W[35] = e.createElementVNode(
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
              onClick: F
            },
            e.toDisplayString(L.$t("先跳过")),
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
              onClick: W[19] || (W[19] = (le) => C(p[c.value + 1]))
            },
            e.toDisplayString(L.$t("下一步")),
            1
            /* TEXT */
          )) : (e.openBlock(), e.createElementBlock("button", {
            key: 2,
            type: "button",
            class: "ss-btn primary",
            disabled: m.value,
            "data-test": "mm-setup-done",
            onClick: Gt
          }, e.toDisplayString(L.$t("完成")), 9, xE))
        ])
      ])
    ], 8, _V));
  }
}), t$ = /* @__PURE__ */ ae(e$, [["__scopeId", "data-v-f1d1272c"]]), l$ = {
  class: "mm-wb",
  "data-test": "mm-workbench"
}, n$ = { class: "mm-head" }, o$ = { class: "mm-head__top" }, a$ = { class: "mm-head__sub" }, s$ = ["title"], r$ = ["disabled", "title"], i$ = {
  key: 2,
  class: "ri-arrow-down-s-line"
}, c$ = {
  key: 0,
  class: "mm-id__panel",
  "data-test": "mm-identity-panel"
}, d$ = { class: "mm-id__tip" }, m$ = ["placeholder"], u$ = {
  key: 1,
  class: "mm-id__state"
}, p$ = {
  key: 2,
  class: "mm-id__state danger"
}, v$ = {
  key: 3,
  class: "mm-id__list"
}, k$ = ["disabled", "data-test", "onClick"], y$ = { class: "mm-id__name" }, g$ = {
  key: 0,
  class: "mm-id__tag"
}, f$ = {
  key: 0,
  class: "mm-id__state"
}, N$ = {
  class: "mm-tabs",
  role: "tablist"
}, V$ = ["aria-selected", "data-test", "onClick"], E$ = {
  key: 0,
  class: "mm-badge"
}, $$ = {
  key: 0,
  class: "ss-note danger"
}, b$ = {
  key: 1,
  class: "ss-note"
}, h$ = {
  key: 0,
  class: "ss-note info mm-setup",
  "data-test": "mm-no-org"
}, _$ = ["disabled"], B$ = {
  key: 1,
  class: "ss-note warn"
}, Bt = "totalclaw:meeting-mgmt-tab:v1", S$ = /* @__PURE__ */ e.defineComponent({
  __name: "MeetingMgmtWorkbenchView",
  setup(l) {
    const v = [
      { key: "home", title: t.t("首页") },
      { key: "meetings", title: t.t("会议") },
      { key: "tasks", title: t.t("任务") },
      { key: "projects", title: t.t("项目") },
      { key: "settings", title: t.t("系统设置") }
    ], n = ie.useNotificationStore(), p = oe, y = e.computed(() => p.value?.me ?? null), s = e.computed(() => ge.value.tab), o = e.ref(""), c = e.ref(!1), i = e.ref(0), k = e.ref(null), b = e.reactive({}), m = e.ref(!1), r = e.computed(() => !!y.value?.isAdmin || (p.value?.settings.adminIds.length ?? 0) === 0), g = e.computed(() => !!p.value && (r.value || !!Ie.value)), h = e.computed(() => v.filter((V) => V.key !== "settings" || !!y.value?.isAdmin)), a = e.computed(() => `${y.value?.person?.id || "none"}:${i.value}`);
    function N(V) {
      const $ = p.value?.badges;
      return $ ? V === "home" ? $.home : V === "meetings" ? $.meetings : V === "tasks" ? $.tasks : 0 : 0;
    }
    function T(V, $) {
      b[V] = typeof $ == "string" ? $ : "";
    }
    const U = e.computed(() => {
      if (s.value === "settings") return t.t("管理员");
      const V = b[s.value];
      return V || (y.value?.isAdmin ? t.t("管理员") : t.t("项目成员"));
    }), j = e.ref(null), D = e.ref(!1), A = e.ref(""), P = e.ref(!1), R = e.ref(""), _ = e.ref(!1), S = e.ref({ depts: [], people: [] }), E = e.computed(() => Ct(S.value, A.value)), M = e.computed(() => S.value.people.find((V) => V.id === Ie.value)?.name || ""), I = (V) => (p.value?.settings.adminIds || []).includes(V);
    async function H() {
      if (g.value) {
        D.value = !0, A.value = "", P.value = !0, R.value = "";
        try {
          S.value = await De();
        } catch (V) {
          R.value = X.errorMessage(V);
        } finally {
          P.value = !1;
        }
      }
    }
    function f() {
      if (D.value) {
        D.value = !1;
        return;
      }
      H();
    }
    async function d(V) {
      if (!_.value) {
        if (V === y.value?.person?.id) {
          D.value = !1;
          return;
        }
        _.value = !0;
        try {
          await J("identity.set", { personId: V }), await ce(), D.value = !1;
          const $ = y.value?.person?.name || "";
          n.success(t.t("当前身份已切换为 {name}", { name: $ }));
        } catch ($) {
          R.value = X.errorMessage($), n.error(X.errorMessage($));
        } finally {
          _.value = !1;
        }
      }
    }
    function u(V) {
      if (!D.value) return;
      const $ = j.value;
      $ && V.target instanceof Node && $.contains(V.target) || (D.value = !1);
    }
    async function z() {
      o.value = "";
      try {
        await ce();
      } catch (V) {
        o.value = X.errorMessage(V);
      }
    }
    async function Q() {
      if (!c.value) {
        c.value = !0;
        try {
          await J("demo.load"), He(), await ce(), i.value += 1, n.success(t.t("演示数据已载入"));
        } catch (V) {
          n.error(X.errorMessage(V));
        } finally {
          c.value = !1;
        }
      }
    }
    let te = null;
    function K() {
      te || (te = setTimeout(() => {
        te = null, ce().catch(() => {
        });
        try {
          k.value?.refresh?.();
        } catch {
        }
      }, 300));
    }
    const G = e.computed(() => !!p.value && !y.value?.person && p.value.org.peopleCount > 0 && !!p.value.canSwitchIdentity);
    e.watch(() => p.value?.setupPending, (V) => {
      V && !gt.value && (gt.value = !0, m.value = !0);
    }, { immediate: !0 }), e.watch(G, (V) => {
      V && (m.value = !0);
    }, { immediate: !0 });
    function ee() {
      m.value = !1, He(), i.value += 1, n.success(t.t("配置已保存，可以开始使用了"));
    }
    e.watch(() => y.value, (V) => {
      V?.isAdmin && V.person?.id && ol(V.person.id);
    }, { immediate: !0 }), e.watch(() => y.value?.person?.id, () => {
      for (const V of Object.keys(b)) delete b[V];
    }), e.watch([s, () => y.value?.isAdmin, p], () => {
      p.value && s.value === "settings" && !y.value?.isAdmin && ve("home");
    }), e.watch(s, (V) => {
      try {
        localStorage.setItem(Bt, V);
      } catch {
      }
    });
    let ne = null;
    return e.onMounted(() => {
      if (ge.value.seq === 0)
        try {
          const V = localStorage.getItem(Bt);
          V && v.some(($) => $.key === V) && V !== "home" && ve(V);
        } catch {
        }
      z(), ne = Se((V) => {
        V && (V.type === "changed" ? ((V.scope === "org" || V.scope === "all") && He(), K()) : V.type === "mobile" && p.value && (p.value = { ...p.value, mobile: { running: V.running, url: V.url } }));
      }), document.addEventListener("mousedown", u);
    }), e.onBeforeUnmount(() => {
      ne?.(), te && clearTimeout(te), document.removeEventListener("mousedown", u);
    }), (V, $) => (e.openBlock(), e.createElementBlock("div", l$, [
      e.createElementVNode("section", n$, [
        e.createElementVNode("div", o$, [
          e.createVNode(Qt),
          $[11] || ($[11] = e.createElementVNode(
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
            a$,
            e.toDisplayString(V.$t("会议 → 纪要 → 任务 → 跟进 → 归档，全流程闭环")),
            1
            /* TEXT */
          ),
          $[12] || ($[12] = e.createElementVNode(
            "span",
            { class: "mm-grow" },
            null,
            -1
            /* CACHED */
          )),
          e.unref(p) ? (e.openBlock(), e.createElementBlock("span", {
            key: 0,
            class: e.normalizeClass(["mm-wecom", { on: e.unref(p).wecomConnected || e.unref(p).pushChannel === "webhook" }]),
            title: e.unref(p).wecomConnected ? V.$t("通讯录与消息卡片走企业微信") : e.unref(p).pushChannel === "webhook" ? V.$t("通知发到企微群（群机器人）") : V.$t("没有配置企业微信：通知只进系统内消息中心"),
            "data-test": "mm-wecom"
          }, e.toDisplayString(e.unref(p).wecomConnected ? V.$t("企微已连接") : e.unref(p).pushChannel === "webhook" ? V.$t("群机器人已连接") : V.$t("未连接企微")), 11, s$)) : e.createCommentVNode("v-if", !0),
          e.unref(p) && (y.value?.isAdmin || G.value) ? (e.openBlock(), e.createElementBlock("button", {
            key: 1,
            type: "button",
            class: "ss-btn sm",
            "data-test": "mm-setup-open",
            onClick: $[0] || ($[0] = (B) => m.value = !0)
          }, [
            $[8] || ($[8] = e.createElementVNode(
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
              ref: j,
              class: "mm-id"
            },
            [
              e.createElementVNode("button", {
                type: "button",
                class: e.normalizeClass(["mm-id__pill", { switchable: g.value }]),
                disabled: !e.unref(p),
                title: g.value ? V.$t("切换当前身份") : V.$t("只有管理员可以切换身份"),
                "data-test": "mm-identity",
                onClick: f
              }, [
                y.value?.person ? (e.openBlock(), e.createElementBlock(
                  e.Fragment,
                  { key: 0 },
                  [
                    e.createTextVNode(
                      e.toDisplayString(U.value) + " · " + e.toDisplayString(y.value.person.name),
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
                g.value ? (e.openBlock(), e.createElementBlock("i", i$)) : e.createCommentVNode("v-if", !0)
              ], 10, r$),
              D.value ? (e.openBlock(), e.createElementBlock("div", c$, [
                e.createElementVNode(
                  "p",
                  d$,
                  e.toDisplayString(V.$t("切换后按这个人的角色显示按钮（管理员代办、演示用）")),
                  1
                  /* TEXT */
                ),
                e.unref(Ie) && e.unref(Ie) !== y.value?.person?.id && M.value ? (e.openBlock(), e.createElementBlock("button", {
                  key: 0,
                  type: "button",
                  class: "mm-id__back",
                  onClick: $[1] || ($[1] = (B) => d(e.unref(Ie)))
                }, [
                  $[9] || ($[9] = e.createElementVNode(
                    "i",
                    { class: "ri-arrow-go-back-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(V.$t("回到 {name}（管理员）", { name: M.value })),
                    1
                    /* TEXT */
                  )
                ])) : e.createCommentVNode("v-if", !0),
                e.withDirectives(e.createElementVNode("input", {
                  "onUpdate:modelValue": $[2] || ($[2] = (B) => A.value = B),
                  class: "mm-id__search",
                  type: "search",
                  placeholder: V.$t("搜索姓名")
                }, null, 8, m$), [
                  [e.vModelText, A.value]
                ]),
                P.value ? (e.openBlock(), e.createElementBlock("p", u$, [
                  $[10] || ($[10] = e.createElementVNode(
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
                  p$,
                  e.toDisplayString(R.value),
                  1
                  /* TEXT */
                )) : (e.openBlock(), e.createElementBlock("div", v$, [
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(E.value, (B) => (e.openBlock(), e.createElementBlock(
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
                          e.renderList(B.people, (w) => (e.openBlock(), e.createElementBlock("button", {
                            key: w.id,
                            type: "button",
                            class: e.normalizeClass(["mm-id__row", { on: w.id === y.value?.person?.id }]),
                            disabled: _.value,
                            "data-test": `mm-identity-${w.id}`,
                            onClick: (q) => d(w.id)
                          }, [
                            e.createElementVNode(
                              "span",
                              {
                                class: "mm-av",
                                style: e.normalizeStyle({ background: e.unref(re)(w.name).color })
                              },
                              e.toDisplayString(e.unref(re)(w.name).text),
                              5
                              /* TEXT, STYLE */
                            ),
                            e.createElementVNode(
                              "span",
                              y$,
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
                            ),
                            I(w.id) ? (e.openBlock(), e.createElementBlock(
                              "span",
                              g$,
                              e.toDisplayString(V.$t("管理员")),
                              1
                              /* TEXT */
                            )) : e.createCommentVNode("v-if", !0)
                          ], 10, k$))),
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
                  E.value.length ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock(
                    "p",
                    f$,
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
        e.createElementVNode("nav", N$, [
          (e.openBlock(!0), e.createElementBlock(
            e.Fragment,
            null,
            e.renderList(h.value, (B) => (e.openBlock(), e.createElementBlock("button", {
              key: B.key,
              type: "button",
              role: "tab",
              class: e.normalizeClass(["mm-tab", { active: s.value === B.key }]),
              "aria-selected": s.value === B.key,
              "data-test": `mm-tab-${B.key}`,
              onClick: (w) => e.unref(ve)(B.key)
            }, [
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(B.title),
                1
                /* TEXT */
              ),
              N(B.key) ? (e.openBlock(), e.createElementBlock(
                "em",
                E$,
                e.toDisplayString(N(B.key)),
                1
                /* TEXT */
              )) : e.createCommentVNode("v-if", !0)
            ], 10, V$))),
            128
            /* KEYED_FRAGMENT */
          ))
        ])
      ]),
      o.value && !e.unref(p) ? (e.openBlock(), e.createElementBlock("p", $$, [
        $[13] || ($[13] = e.createElementVNode(
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
          e.toDisplayString(V.$t("重试")),
          1
          /* TEXT */
        )
      ])) : e.unref(p) ? (e.openBlock(), e.createElementBlock(
        e.Fragment,
        { key: 2 },
        [
          e.unref(p).org.peopleCount === 0 ? (e.openBlock(), e.createElementBlock("p", h$, [
            $[15] || ($[15] = e.createElementVNode(
              "i",
              { class: "ri-team-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(r.value ? V.$t("还没有组织人员：可在「系统设置 → 通讯录同步」同步企业微信通讯录，也可以先载入演示数据走一遍全流程。") : V.$t("还没有组织人员，请联系管理员同步通讯录。")),
              1
              /* TEXT */
            ),
            r.value ? (e.openBlock(), e.createElementBlock("button", {
              key: 0,
              type: "button",
              class: "ss-btn sm primary",
              disabled: c.value,
              "data-test": "mm-demo-load",
              onClick: Q
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
                e.toDisplayString(V.$t("载入演示数据")),
                1
                /* TEXT */
              )
            ], 8, _$)) : e.createCommentVNode("v-if", !0)
          ])) : y.value?.person ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock("p", B$, [
            $[16] || ($[16] = e.createElementVNode(
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
            g.value ? (e.openBlock(), e.createElementBlock(
              "button",
              {
                key: 0,
                type: "button",
                class: "ss-btn sm",
                onClick: H
              },
              e.toDisplayString(V.$t("选择身份")),
              1
              /* TEXT */
            )) : e.createCommentVNode("v-if", !0)
          ])),
          (e.openBlock(), e.createElementBlock("div", {
            key: a.value,
            class: "mm-body"
          }, [
            s.value === "home" ? (e.openBlock(), e.createBlock(
              To,
              {
                key: 0,
                ref_key: "tabRef",
                ref: k,
                onRole: $[3] || ($[3] = (B) => T("home", B))
              },
              null,
              512
              /* NEED_PATCH */
            )) : s.value === "meetings" ? (e.openBlock(), e.createBlock(
              gd,
              {
                key: 1,
                ref_key: "tabRef",
                ref: k,
                onRole: $[4] || ($[4] = (B) => T("meetings", B))
              },
              null,
              512
              /* NEED_PATCH */
            )) : s.value === "tasks" ? (e.openBlock(), e.createBlock(
              qu,
              {
                key: 2,
                ref_key: "tabRef",
                ref: k,
                onRole: $[5] || ($[5] = (B) => T("tasks", B))
              },
              null,
              512
              /* NEED_PATCH */
            )) : s.value === "projects" ? (e.openBlock(), e.createBlock(
              jk,
              {
                key: 3,
                ref_key: "tabRef",
                ref: k,
                onRole: $[6] || ($[6] = (B) => T("projects", B))
              },
              null,
              512
              /* NEED_PATCH */
            )) : s.value === "settings" ? (e.openBlock(), e.createBlock(
              hV,
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
      )) : (e.openBlock(), e.createElementBlock("p", b$, [
        $[14] || ($[14] = e.createElementVNode(
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
      m.value ? (e.openBlock(), e.createBlock(t$, {
        key: 3,
        onClose: $[7] || ($[7] = (B) => m.value = !1),
        onDone: ee
      })) : e.createCommentVNode("v-if", !0)
    ]));
  }
}), w$ = /* @__PURE__ */ ae(S$, [["__scopeId", "data-v-dba3778c"]]), yt = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["npm:pinyin-pro"];
if (!yt) throw new Error("宿主模块未就绪：npm:pinyin-pro");
yt.default;
const D$ = /* @__PURE__ */ Jt({
  __proto__: null
}, [yt]);
export {
  w$ as default
};
