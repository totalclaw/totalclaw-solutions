const e = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["npm:vue"];
if (!e) throw new Error("宿主模块未就绪：npm:vue");
e.default;
const vt = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["npm:vue-router"];
if (!vt) throw new Error("宿主模块未就绪：npm:vue-router");
vt.default;
const ft = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/utils/videoProductionEstimate.ts"];
if (!ft) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/utils/videoProductionEstimate.ts");
ft.default;
const io = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/components/PageBackButton.vue"];
if (!io) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/components/PageBackButton.vue");
const xo = io.default, gt = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/stores/notification.ts"];
if (!gt) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/stores/notification.ts");
gt.default;
const ht = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/utils/humanizeChatError.ts"];
if (!ht) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/utils/humanizeChatError.ts");
ht.default;
const ae = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/utils/humanize.ts"];
if (!ae) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/utils/humanize.ts");
ae.default;
const l = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/i18n.ts"];
if (!l) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/i18n.ts");
l.default;
const bt = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/composables/useLocale.ts"];
if (!bt) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/composables/useLocale.ts");
bt.default;
const ro = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/components/workflow/HumanConfirmCard.vue"];
if (!ro) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/components/workflow/HumanConfirmCard.vue");
const el = ro.default, Nt = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/composables/useNativeBrowserModalLock.ts"];
if (!Nt) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/composables/useNativeBrowserModalLock.ts");
Nt.default;
const ye = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/utils/seedanceShots.ts"];
if (!ye) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/utils/seedanceShots.ts");
ye.default;
const so = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/components/PublishRunPanel.vue"];
if (!so) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/components/PublishRunPanel.vue");
const tl = so.default, ie = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/composables/publishPlatforms.ts"];
if (!ie) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/composables/publishPlatforms.ts");
ie.default;
const co = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/components/StepRunAlert.vue"];
if (!co) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/components/StepRunAlert.vue");
const ol = co.default, Et = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/composables/useStepWatchdog.ts"];
if (!Et) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/composables/useStepWatchdog.ts");
Et.default;
const wt = "totalclaw:video-studio-direct-run:v1", u = e.ref("idle"), g = e.ref({}), y = e.ref([]), v = e.ref(""), Ke = e.ref(0), F = e.ref(0), Q = e.ref(0), ze = e.ref(0), D = e.ref(""), B = e.ref(!1), re = e.ref(!1);
function ll(E = Date.now()) {
  Q.value = E;
}
e.watch([v, g], () => {
  u.value === "running" && D.value && ll();
});
function nl() {
  try {
    const E = localStorage.getItem(wt);
    if (!E) return null;
    const V = JSON.parse(E);
    if (!V || typeof V != "object") return null;
    const $ = V.mode === "seedance" || V.mode === "slideshow" ? V.mode : "";
    return { startedAt: Number(V.startedAt) || 0, mode: $, project: String(V.project || "") };
  } catch {
    return null;
  }
}
function al(E) {
  try {
    localStorage.setItem(wt, JSON.stringify(E));
  } catch {
  }
}
function uo() {
  try {
    localStorage.removeItem(wt);
  } catch {
  }
}
function eo(E, V) {
  const $ = Date.now();
  B.value = !1, re.value = !1, D.value = E, Ke.value = $, F.value = 0, Q.value = $, ze.value = 0, u.value = "running", al({ startedAt: $, mode: E, project: V });
}
function to() {
  uo();
}
function il() {
  B.value = !1, uo();
}
function po() {
  if (B.value || u.value === "running") return !1;
  const E = nl();
  return E ? (B.value = !0, D.value = E.mode, Ke.value = E.startedAt, F.value = 0, Q.value = 0, ze.value = 0, re.value = !1, u.value = "failed", g.value = {}, v.value = l.t("应用重启或页面刷新导致上次成片中断，请重新生成"), !0) : !1;
}
po();
const rl = { class: "video-studio-page" }, sl = { class: "studio-hero" }, dl = { class: "hero-copy" }, cl = { class: "hero-kicker" }, ul = { class: "hero-actions" }, pl = ["aria-label"], ml = {
  key: 0,
  class: "ri-arrow-right-s-line flow-arrow"
}, vl = { class: "job-progress-heading" }, fl = { class: "job-progress-title" }, gl = { class: "job-progress-icon" }, hl = {
  key: 0,
  class: "job-progress-number"
}, bl = {
  key: 0,
  class: "job-progress-time"
}, Nl = {
  key: 1,
  class: "job-progress-number"
}, El = ["disabled"], wl = ["aria-valuenow"], yl = { class: "job-progress-stages" }, Vl = {
  key: 0,
  class: "publish-confirm-panel"
}, Sl = { class: "publish-confirm-head" }, kl = ["disabled"], _l = { class: "publish-confirm-hint" }, Dl = { class: "publish-confirm-list" }, Tl = { class: "publish-confirm-pick" }, Al = ["checked", "onChange"], Pl = { class: "publish-confirm-name" }, $l = ["onClick"], Cl = { class: "publish-confirm-actions" }, Il = { class: "publish-confirm-summary" }, Ll = ["disabled"], Ol = ["disabled"], Ml = { class: "model-strip" }, Bl = { class: "model-copy" }, jl = { class: "model-heading" }, Rl = { class: "model-copy" }, Wl = { class: "model-heading" }, Kl = ["title", "disabled"], zl = { class: "studio-grid" }, Fl = { class: "studio-form" }, Ul = { class: "form-card" }, Jl = { class: "section-head" }, ql = { class: "field-grid" }, Hl = { class: "field" }, Yl = ["placeholder"], Gl = { class: "field" }, Ql = ["placeholder"], Zl = { class: "field full" }, Xl = { class: "folder-picker" }, xl = ["placeholder"], en = { class: "field full" }, tn = { class: "field-label-row" }, on = ["disabled"], ln = ["placeholder"], nn = { class: "form-card" }, an = { class: "section-head" }, rn = { class: "choice-grid production-grid" }, sn = ["disabled", "title", "onClick"], dn = { class: "choice-icon" }, cn = { class: "field render-ratio" }, un = { value: "9:16" }, pn = { value: "16:9" }, mn = { value: "1:1" }, vn = {
  key: 0,
  class: "config-hint"
}, fn = { class: "form-card" }, gn = { class: "section-head" }, hn = { class: "audio-row" }, bn = { class: "toggle-card" }, Nn = { class: "toggle-copy" }, En = { class: "field music-field" }, wn = ["value"], yn = {
  key: 0,
  class: "field full voice-style"
}, Vn = ["placeholder"], Sn = {
  key: 1,
  class: "config-hint"
}, kn = { class: "form-card" }, _n = { class: "section-head" }, Dn = { class: "platform-grid" }, Tn = ["checked", "onChange"], An = { class: "platform-mark" }, Pn = { class: "platform-topics" }, $n = { class: "topics-heading" }, Cn = { class: "topic-grid" }, In = ["onUpdate:modelValue", "placeholder"], Ln = { class: "release-policy" }, On = { class: "submit-bar" }, Mn = { class: "submit-summary" }, Bn = { class: "submit-actions" }, jn = ["disabled"], Rn = ["disabled", "title"], Wn = ["disabled"], Kn = { class: "studio-aside" }, zn = { class: "aside-card skill-card" }, Fn = { class: "aside-title" }, Un = { class: "capability-list" }, Jn = {
  key: 0,
  class: "aside-card job-card"
}, qn = { class: "job-eyebrow" }, Hn = { class: "job-actions" }, Yn = ["disabled"], Gn = ["disabled", "title"], Qn = {
  key: 1,
  class: "aside-card history-card"
}, Zn = { class: "job-eyebrow" }, Xn = { class: "history-list" }, xn = { class: "history-main" }, ea = ["title"], ta = ["disabled", "title", "onClick"], oa = {
  key: 0,
  class: "history-pager"
}, la = ["disabled"], na = ["disabled"], aa = { class: "aside-card tips-card" }, ia = { class: "job-eyebrow" }, ra = ["aria-label"], sa = { class: "preview-head" }, da = ["aria-label"], ca = { class: "preview-summary" }, ua = {
  key: 0,
  class: "preview-warning"
}, pa = {
  class: "preview-source",
  role: "status"
}, ma = { key: 0 }, va = { class: "prompt-preview" }, fa = { class: "preview-actions" }, ga = ["disabled"], ha = ["aria-label"], ba = ["aria-label"], Na = { class: "video-stage" }, Ea = ["src"], wa = {
  key: 1,
  class: "video-preview-empty"
}, ya = ["title"], Va = ["disabled"], Sa = ["aria-label"], ut = "totalclaw:video-studio-last-job:v2", oo = "/Users/mac03/Downloads/0725/明日世界TOMORROW WORLD 短视频大赛-素材/TomorrowCommercialTower1素材/外立面", lo = "/video-studio", ka = 160, _a = 18, Da = 3, no = "totalclaw:publish-workflow-result:video-studio", pt = "totalclaw:video-studio-last-publish-input:v1", ao = "totalclaw:video-studio-direct-history:v1", mt = 10, Ta = /* @__PURE__ */ e.defineComponent({
  __name: "VideoStudioView",
  setup(E) {
    const V = `totalclaw:video-studio-draft:v6:${bt.currentLocale()}`, $ = /TOMORROW\s*WORLD|TomorrowCommercialTower|Tomorrow\s+Commercial\s+Tower|明日世界|TCT2/i, se = vt.useRouter(), h = gt.useNotificationStore(), Ve = [
      { label: l.t("素材"), icon: "ri-gallery-upload-line" },
      { label: l.t("创作"), icon: "ri-quill-pen-line" },
      { label: l.t("合成"), icon: "ri-film-line" },
      { label: l.t("发布"), icon: "ri-send-plane-line" }
    ], Se = [
      { id: "creative_plan", phase: 1, label: l.t("脚本与平台方案") },
      { id: "creative_review", phase: 1, label: l.t("制作方案审核") },
      { id: "render_final", phase: 1, label: l.t("剪辑、配音与成片") },
      { id: "video_review", phase: 2, label: l.t("成片质量审核") },
      { id: "publish_validation", phase: 2, label: l.t("发布内容校验") },
      { id: "publish_approval", phase: 3, label: l.t("等待发布确认") },
      { id: "platform_publish", phase: 3, label: l.t("分平台发布") }
    ], yt = [
      { id: "smart", label: l.t("AI 自动判断"), desc: l.t("根据素材类型选择最合适流程"), icon: "ri-brain-line" },
      { id: "seedance", label: l.t("fal 动态视频"), desc: l.t("根据分镜提示词生成动态镜头"), icon: "ri-movie-2-line" },
      { id: "slideshow", label: l.t("图片成片"), desc: l.t("图片、字幕和节拍快速合成"), icon: "ri-slideshow-3-line" }
    ], Fe = ie.publishPlatforms(), Vt = [
      { id: "auto", label: l.t("AI 按内容自动选择") },
      { id: "upbeat", label: l.t("轻快活力") },
      { id: "energetic", label: l.t("热烈有冲击力") },
      { id: "chill", label: l.t("松弛治愈") },
      { id: "emotional", label: l.t("温暖情绪") },
      { id: "cinematic", label: l.t("电影感") }
    ];
    function St() {
      const t = l.t("#品牌短片 #新品推广");
      return {
        projectName: "",
        brandName: "",
        materialDir: "",
        brief: [
          l.t("制作一条 15 秒左右、9:16 竖屏的品牌推广短片，用于抖音、快手、小红书和微信视频号发布。"),
          "",
          l.t("只读取用户选择的素材文件夹，自动识别其中的图片、视频和音频。已有竖屏视频优先智能剪辑；只有缺少必要过渡镜头时才调用 Seedance。"),
          "",
          l.t("0–3 秒：使用最有视觉冲击力的素材开场，以简短字幕快速建立主题。"),
          l.t("3–9 秒：用远景、近景和细节镜头交替展示核心卖点，字幕只呈现可核验信息。"),
          l.t("9–15 秒：回到品牌主视觉，以明确的行动引导收尾。"),
          "",
          l.t("只使用素材和用户输入中能够核验的事实，不虚构价格、效果、资质、奖项或活动政策；信息不足时先向用户补问。"),
          "",
          l.t("整体画面现代、清晰、有节奏感。字幕语言跟随素材和用户要求；使用自然、有质感的旁白。BGM 选择克制、具有上升感的商业氛围音乐，并对旁白做人声避让。输出最终成片预览、封面建议及四个平台差异化文案。")
        ].join(`
`),
        // 默认走「图片成片」拼接：不依赖任何生成模型 token，装完即可出片。
        // Seedance 这类生成路径要配了 key 才可选，见 seedanceAvailable。
        productionMode: "slideshow",
        aspectRatio: "9:16",
        voiceover: !0,
        voiceStyle: l.t("自然、有质感的品牌旁白；语言跟随文案，发音清晰，语速中等"),
        bgmMood: "cinematic",
        platforms: ["douyin", "kuaishou", "xiaohongshu", "wxchannels"],
        topics: {
          douyin: t,
          kuaishou: t,
          xiaohongshu: t,
          wxchannels: t
        }
      };
    }
    function mo() {
      Object.assign(r, St()), h.success(l.t("通用推荐方案和四平台话题已填好"));
    }
    function Ue(t, o) {
      try {
        const a = localStorage.getItem(t);
        return a ? { ...o, ...JSON.parse(a) } : o;
      } catch {
        return o;
      }
    }
    function ke(...t) {
      return t.some((o) => $.test(
        typeof o == "string" ? o : JSON.stringify(o ?? "")
      ));
    }
    function vo() {
      try {
        for (const t of [
          "totalclaw:video-studio-draft:v1",
          "totalclaw:video-studio-draft:v2",
          "totalclaw:video-studio-draft:v3",
          "totalclaw:video-studio-draft:v4",
          "totalclaw:video-studio-last-job:v1"
        ]) {
          const o = localStorage.getItem(t);
          o && ke(o) && localStorage.removeItem(t);
        }
      } catch {
      }
    }
    vo();
    function fo() {
      return {
        materialDir: oo,
        projectName: l.t("明日世界 · 商业塔楼外立面"),
        brandName: "TOMORROW WORLD",
        topics: "#TOMORROW_WORLD #TOMORROWCOMMERCIALTOWER2",
        brief: [
          l.t("为「TOMORROW WORLD 明日世界」商业塔楼制作一条 15 秒左右、9:16 竖屏的形象短片，用于抖音、快手、小红书和微信视频号发布。"),
          "",
          l.t("素材是塔楼外立面、夜景、主入口、街景、零售区与效果图。请按「远景建立 → 近景细节 → 夜景收束」的顺序组织镜头，画面明亮、现代、有节奏感。"),
          "",
          l.t("0–3 秒：用最具冲击力的塔楼全景开场，字幕点明项目名。"),
          l.t("3–9 秒：主入口、街景、零售区交替呈现，突出地段与业态。"),
          l.t("9–15 秒：回到夜景主视觉，以明确的行动引导收尾。"),
          "",
          l.t("只使用素材中能够核验的事实，不虚构价格、面积、招商政策、开业时间或奖项。"),
          "",
          l.t("旁白自然、有质感；配乐克制、具有上升感，并对旁白做人声避让。输出成片预览、封面建议及四个平台差异化文案。")
        ].join(`
`)
      };
    }
    const de = St(), kt = Ue(V, de), _t = ke(kt) ? de : kt, r = e.reactive({
      ..._t,
      topics: {
        ...de.topics,
        ..._t.topics || {}
      }
    }), _e = Ue(ut, { conversationId: "", projectName: "" }), i = e.reactive(
      ke(_e) ? { conversationId: "", projectName: "" } : { ..._e, videoPath: "", expectedVideoPath: _e.expectedVideoPath }
    ), Je = String(_e.videoPath || "");
    i.source || (i.source = i.taskId || i.conversationId ? "workflow" : i.videoPath ? "direct" : "none");
    const ce = e.ref([]), De = e.ref(null), Z = e.computed(() => ft.estimateVideoProduction(r.brief, De.value)), j = e.ref(!1), C = e.ref(!1), X = e.ref(!1), x = e.ref(!1), Te = e.ref(0);
    let ee = null;
    const go = e.computed(() => {
      const t = Te.value;
      return t ? t >= 60 ? `${Math.floor(t / 60)}:${String(t % 60).padStart(2, "0")}` : `${t}s` : "";
    }), ue = e.ref(!1), Ae = e.ref(!1), R = e.ref(""), L = e.ref(""), Dt = e.ref(!1), w = e.ref(!1), Pe = e.ref(""), qe = e.ref(0);
    let U = null;
    function He(t) {
      if (Pe.value = t, qe.value = 0, U && window.clearInterval(U), !t) {
        U = null;
        return;
      }
      const o = Date.now();
      U = window.setInterval(() => {
        qe.value = Math.round((Date.now() - o) / 1e3);
      }, 1e3);
    }
    const te = e.computed(() => {
      if (!Pe.value) return "";
      const t = qe.value, o = t >= 60 ? `${Math.floor(t / 60)}:${String(t % 60).padStart(2, "0")}` : `${t}s`;
      return t > 2 ? `${Pe.value} ${o}` : Pe.value;
    }), oe = e.ref(""), Tt = e.ref("");
    function ho(t) {
      const o = Lt();
      if (t && o && o.videoPath === t.input.videoPath && o.caption !== t.input.caption)
        try {
          localStorage.setItem(pt, JSON.stringify({ ...o, caption: t.input.caption }));
        } catch {
        }
      const a = t && ["completed", "partial", "needs_review", "failed"].includes(t.status), n = t?.platforms.filter((c) => c.state === "published") || [];
      if (!t || t.input.videoPath !== i.videoPath || !a || !n.length && t.status !== "needs_review") {
        oe.value = "";
        return;
      }
      const d = (c) => t.platforms.filter((s) => s.state === c).map((s) => ie.publishPlatforms().find((p) => p.id === s.id)?.label || s.id);
      oe.value = Xt({
        platformCount: n.length,
        unconfirmedCount: d("unconfirmed").length,
        failedCount: d("failed").length,
        unconfirmedPlatforms: d("unconfirmed"),
        failedPlatforms: d("failed")
      });
    }
    const At = Nt.createNativeBrowserModalLock(), $e = [
      { id: "scan", phase: 0, label: l.t("扫描素材") },
      { id: "stage", phase: 1, label: l.t("整理素材") },
      { id: "render", phase: 2, label: l.t("合成成片") }
    ], bo = { id: "audio", phase: 3, label: l.t("配音与配乐") }, Pt = [
      { id: "scan", phase: 0, label: l.t("扫描素材") },
      { id: "shots", phase: 1, label: l.t("专业分镜提示词") },
      { id: "render", phase: 2, label: l.t("Seedance 逐镜头生成 + 拼接合成") },
      { id: "qc", phase: 3, label: l.t("质检与修复") }
    ];
    function No(t, o) {
      return ka * (o === "standard" ? Da : 1) + t * _a;
    }
    function $t(t) {
      const o = Math.max(0, Math.round(t)), a = Math.floor(o / 60);
      return a > 0 ? `${a}:${String(o % 60).padStart(2, "0")}` : `${o}s`;
    }
    const W = Et.useStepWatchdog({
      running: () => u.value === "running" && !!D.value && i.source === "direct",
      startedAt: () => Ke.value || null,
      estimateMs: () => F.value > 0 ? F.value * 1e3 : null,
      kind: "video",
      lastProgressAt: () => Q.value || null,
      waitExtendedAt: () => ze.value || null,
      onHeartbeat: (t) => {
        Q.value = t;
      },
      onKeepWaiting: (t) => {
        ze.value = t;
      }
    }), Ct = e.computed(() => {
      if (W.verdict.value === "idle") return "";
      const t = W.elapsedSec.value, o = $t(t);
      if (W.suspect.value) return l.t("已用 {p0} · 可能已超时", { p0: o });
      const a = W.sinceHeartbeatSec.value, n = a != null && a >= 5 && a < 120 ? l.t("（{p0} 秒前有进度）", { p0: a }) : "";
      if (!F.value) return l.t("已用 {p0}", { p0: o }) + n;
      const d = F.value - t;
      return d > 0 ? l.t("已用 {p0} · 预计还需 {p1}", { p0: o, p1: $t(d) }) : l.t("已用 {p0} · 已超预估，仍在生成", { p0: o }) + n;
    }), le = e.ref(!1), Ce = e.ref(!1), pe = e.ref(!1);
    po(), y.value.length || (y.value = B.value ? [...D.value === "seedance" ? Pt : $e] : [...Se]), v.value || (v.value = l.t("尚未启动制作任务"));
    const T = e.ref(""), A = e.ref(null), J = e.ref(!1), k = e.ref({}), O = e.ref({});
    let Ye = null, Ge = null, Ie = null;
    e.watch(
      r,
      (t) => {
        try {
          localStorage.setItem(V, JSON.stringify(t));
        } catch {
        }
      },
      { deep: !0 }
    );
    const me = e.computed(
      () => Fe.filter((t) => r.platforms.includes(t.id)).map((t) => t.label).join(l.t("、"))
    ), P = e.computed(
      () => Fe.filter((t) => r.platforms.includes(t.id))
    ), Eo = e.computed(
      () => P.value.map((t) => t.id).join(",")
    ), Qe = e.computed(
      () => yt.find((t) => t.id === r.productionMode)?.label || l.t("AI 自动判断")
    ), Le = e.computed(
      () => Vt.find((t) => t.id === r.bgmMood)?.label || l.t("AI 按内容自动选择")
    ), It = e.computed(() => !!r.brief.trim() && r.platforms.length > 0), Ze = e.computed(() => It.value && !!r.materialDir.trim()), S = e.computed(() => !!i.videoPath), q = e.computed(() => !!oe.value);
    function Lt() {
      try {
        const t = JSON.parse(localStorage.getItem(pt) || "null");
        return t && typeof t.caption == "string" && Array.isArray(t.platformIds) ? t : null;
      } catch {
        return null;
      }
    }
    function Xe() {
      oe.value = "";
      try {
        localStorage.removeItem(no);
      } catch {
      }
    }
    const wo = e.computed(() => ({
      key: `video-publish-${i.projectName || "showcase"}`,
      runId: T.value || "VIDEO-SHOWCASE",
      nodeId: "publish_approval",
      nodeName: l.t("发布前人工确认"),
      question: l.t("是否确认将当前成片发布到所选平台？"),
      detail: l.t("成片、平台文案、话题与发布范围已经准备完成。确认后将执行分平台发布，并记录每个平台的执行回执。"),
      requireComment: !1,
      source: "human_confirm_node",
      approveLabel: l.t("确认并发布"),
      rejectLabel: l.t("退回修改"),
      approveEffect: l.t("按当前版本向所选平台执行发布，并写入发布时间与平台回执。"),
      rejectEffect: l.t("保留当前成片并返回修改，不执行发布。")
    })), yo = {
      video: l.t("待发布成片"),
      platforms: l.t("目标平台"),
      topics: l.t("各平台话题"),
      policy: l.t("执行策略")
    }, Vo = e.computed(() => ({
      video: i.videoPath || l.t("现有演示成片"),
      platforms: P.value.map((t) => t.label),
      topics: Object.fromEntries(
        P.value.map((t) => [
          t.label,
          nt(r.topics[t.id] || "")
        ])
      ),
      policy: l.t("逐平台执行；任何平台失败都会保留原始回执并停止该平台重试。")
    })), So = e.computed(() => `${i.projectName || l.t("短视频演示成片")}
${me.value}
${oe.value}`), xe = e.computed(() => u.value === "success" ? y.value.length : y.value.filter((t) => g.value[t.id] === "done").length), Oe = e.computed(
      () => y.value.length ? Math.round(xe.value / y.value.length * 100) : 0
    ), et = e.computed(() => ["cancelled", "failed"].includes(u.value)), tt = e.computed(() => B.value ? { state: "interrupted", message: "" } : i.source !== "direct" || !D.value ? null : u.value === "running" ? W.suspect.value ? { state: "suspect", message: "" } : null : u.value === "failed" ? { state: "failed", message: v.value || l.t("成片失败") } : null), Me = e.computed(() => u.value === "running" && !!D.value && i.source === "direct"), ko = e.computed(() => B.value ? l.t("上次成片已中断") : u.value === "running" ? l.t("视频制作进行中") : u.value === "waiting_human" ? l.t("等待人工审核") : u.value === "success" ? l.t("视频制作已完成") : u.value === "failed" ? l.t("视频制作遇到问题") : u.value === "cancelled" ? S.value ? l.t("上次制作已取消（成片仍可用）") : l.t("视频制作已取消") : i.taskId || i.conversationId ? l.t("制作任务等待执行") : l.t("尚未创建制作任务"));
    function K(t) {
      const o = y.value.filter((n) => n.phase === t);
      if (!o.length)
        return t === 0 && u.value !== "idle" || S.value && t < 2 ? "done" : "pending";
      if (u.value === "success" || o.every((n) => g.value[n.id] === "done"))
        return "done";
      if (!et.value && o.some((n) => g.value[n.id] === "running" || g.value[n.id] === "failed"))
        return "active";
      const a = Ve.findIndex(
        (n, d) => y.value.some((c) => c.phase === d && g.value[c.id] !== "done")
      );
      return u.value === "running" && a === t ? "active" : "pending";
    }
    function _o(t) {
      const o = y.value.filter((n) => n.phase === t);
      if (!o.length && t === 0 && u.value !== "idle") return l.t("启动前已扫描完成");
      if (!o.length && S.value && t < 2) return l.t("成片已生成");
      const a = o.find(
        (n) => g.value[n.id] === "running" || g.value[n.id] === "failed"
      );
      return a ? a.label : K(t) === "done" ? l.t("已完成") : K(t) === "active" ? l.t("正在准备") : l.t("等待执行");
    }
    function Do() {
      const t = ce.value.find((n) => n.kind === "tts");
      if (!t)
        return { tone: "missing", label: l.t("待检查"), detail: l.t("登录后可读取当前 TTS 配置") };
      const o = t.providers.find((n) => n.id === t.activeProvider);
      if (o?.configured)
        return {
          tone: "ready",
          label: l.t("已就绪"),
          detail: l.t("当前默认：{p0}", { p0: o.label })
        };
      const a = t.providers.filter((n) => n.configured);
      return a.length === 1 ? { tone: "ready", label: l.t("已就绪"), detail: l.t("当前默认：{p0}", { p0: a[0].label }) } : a.length > 1 ? {
        tone: "partial",
        label: l.t("可用但未设默认"),
        detail: l.t("已接入 {p0}，建议设为默认", { p0: a[0].label })
      } : { tone: "missing", label: l.t("未配置"), detail: l.t("配置一个配音引擎后再开始制作") };
    }
    function To() {
      if (!De.value) return { tone: "missing", label: l.t("待检查"), detail: l.t("尚未读取动态视频通道状态") };
      const { keys: t, quota: o } = De.value;
      return o?.dailyLimit != null && o.usedToday >= o.dailyLimit ? { tone: "missing", label: l.t("额度已用完"), detail: l.t("动态视频通道今日额度已用完，请联系管理员或等待额度恢复") } : t.primary || t.backup ? { tone: "ready", label: l.t("已就绪"), detail: l.t("动态视频走 fal 通道，按秒计费；文字策划仍使用当前聊天模型") } : { tone: "missing", label: l.t("未配置"), detail: l.t("请配置 fal 密钥或联系管理员开通此方案") };
    }
    const Ot = e.computed(() => {
      const t = ce.value.find((a) => a.kind === "video"), o = String(t?.activeModel || "").toLowerCase();
      return /\b(standard|pro)\b/.test(o) || o.includes("seedance-2-0-2") ? "standard" : "fast";
    }), ve = e.computed(Do), H = e.computed(To), Be = e.computed(() => j.value || H.value.tone !== "missing"), Mt = e.ref(!1);
    function Ao(t) {
      Mt.value = !0, r.productionMode = t;
    }
    e.watch(Be, (t) => {
      !t && r.productionMode === "seedance" && (r.productionMode = "slideshow");
    }), e.watch(
      () => H.value.tone,
      (t) => {
        j.value || t === "missing" || Mt.value || r.productionMode === "slideshow" && (r.productionMode = "seedance");
      },
      { immediate: !0 }
    );
    let ot = null;
    e.onUnmounted(() => {
      try {
        ot?.();
      } catch {
      }
      ot = null;
    });
    async function lt() {
      j.value = !0;
      const t = window.electronAPI;
      try {
        const [o, a] = await Promise.allSettled([
          t?.mediaModel?.get?.(),
          t?.mediaFal?.capabilities?.({ solutionId: "workbench-global-ads" })
        ]), n = o.status === "fulfilled" ? o.value : null;
        ce.value = Array.isArray(n?.kinds) ? n.kinds : [], De.value = a.status === "fulfilled" && a.value || null;
      } catch {
        ce.value = [];
      } finally {
        j.value = !1;
      }
    }
    function je(t) {
      se.push({
        path: "/settings",
        query: {
          section: "ai-models",
          media: t,
          ...t === "video" ? { provider: "fal" } : {}
        }
      });
    }
    async function Bt() {
      try {
        const t = await window.electronAPI?.solution?.pickFolder?.();
        t && (r.materialDir = t);
      } catch (t) {
        h.fromException(l.t("选择素材文件夹失败"), t);
      }
    }
    function Po(t) {
      const o = r.platforms.indexOf(t);
      o >= 0 ? r.platforms.splice(o, 1) : r.platforms.push(t);
    }
    function nt(t) {
      return t.split(/[\s,，]+/).map((o) => o.trim()).filter(Boolean).map((o) => o.startsWith("#") ? o : `#${o}`).join(" ");
    }
    function $o() {
      return P.value.map((t) => `${t.label}：${nt(r.topics[t.id] || "") || l.t("未指定，可在发布前补充")}`).join(`
`);
    }
    async function Co() {
      const t = r.brief.trim();
      if (!t || x.value) return;
      x.value = !0, Te.value = 0;
      const o = Date.now();
      ee && window.clearInterval(ee), ee = window.setInterval(() => {
        Te.value = Math.round((Date.now() - o) / 1e3);
      }, 1e3);
      try {
        const a = window.electronAPI;
        if (!a?.llmOneshot) throw new Error(l.t("默认 LLM 服务尚未就绪"));
        const n = await a.llmOneshot({
          // 润色标准与 utils/seedanceShots 的十要素规范同源：产出不是散文，
          // 而是「全局参数段 + 逐镜头分镜表」的专业结构（用户实测：粗提示词直接喂
          // Seedance 只会出平移废片，每一轮生成都必须值回票价）。
          systemPrompt: [
            l.t("你是专业短视频导演和 Seedance 视频提示词编辑。"),
            l.t("请把用户提供的中文视频提示词升级成结构化的专业制作指令，格式固定为两段："),
            l.t("【全局】画幅、总时长与镜头数、全片色调与氛围关键词、风格参照、主体一致性锚点（主体外观/色板的一句描述，供各镜头原句复用）。"),
            l.t("【分镜】逐镜头列出：镜头序号与时长（单镜头 5-10 秒整数）；景别（远/全/中/近/特写）；机位与运镜+速度（推拉摇移跟升降/环绕，配速度词）；主体+具体动作动词（禁止「展示产品」这类空话）；环境与光线（时段/光源方向/质感）；构图（画面下 1/4 留字幕安全区）；镜头内动作起止（起幅/落幅）；与上一镜的衔接意图；末尾负向提示（无文字水印、无畸变人脸手指、无抖动闪烁、不要淡入淡出黑场）。"),
            l.t("要求：保留用户给出的全部事实、产品名、时长和时间轴；日夜时序单调渐进；结构清晰、表达紧凑。"),
            l.t("绝对禁止虚构价格、门店地址、优惠规则、产品功效或用户未提供的事实。"),
            l.t("只输出升级后的完整制作指令，不要解释，不要使用 Markdown 代码块。")
          ].join(`
`),
          prompt: l.t(`成片方式：{p0}
画幅：{p1}
当前视频提示词：
{source}`, { p0: Qe.value, p1: r.aspectRatio, source: t }),
          timeoutMs: 3e5,
          // 纯补全：润色是一句进一句出的文本改写，绝不允许 worker 带工具把 brief 当任务执行
          plainCompletion: !0
        }), d = String(n?.text || "").trim();
        if (!d) throw new Error(l.t("LLM 未返回可用的润色结果"));
        r.brief = d.slice(0, 3e3), h.success(l.t("视频提示词已由 AI 润色并回填"));
      } catch (a) {
        h.fromException(l.t("视频提示词润色失败"), a);
      } finally {
        ee && (window.clearInterval(ee), ee = null), Te.value = 0, x.value = !1;
      }
    }
    function Io(t) {
      const o = me.value, a = $o(), n = ce.value.find((p) => p.kind === "tts"), d = n?.activeProvider ? `${n.activeProvider}${n.activeModel ? ` / ${n.activeModel}` : ""}` : l.t("未读取到明确默认项"), c = r.voiceover ? l.t("需要 TTS 旁白。旁白语气：{p0}。使用 AI 模型配置中的默认 TTS（{defaultTts}）；如果默认声线语言与文案不匹配，同一 provider 内改用对应语言的女声。", {
        p0: r.voiceStyle.trim() || l.t("请根据内容自动选择自然、适合短视频的表达"),
        defaultTts: d
      }) : l.t("不生成 TTS 旁白，保留素材原声并按需配乐。"), s = {
        smart: l.t("分析素材后进行本地图片成片；需要生成动态镜头时请选择 fal 动态视频。"),
        // Seedance 自带音轨常混入人声/念白，和我们自己的旁白叠在一起会串味，
        // 所以生成阶段明确只要环境音与配乐，人声一律由后续 TTS 统一合成。
        seedance: l.t("使用 fal 视频通道按分镜提示词生成动态镜头，再进行本地拼接与配音；生成费用按秒计算。"),
        slideshow: l.t("将图片制作成 {p0} 视频，使用有节奏的运镜、转场、字幕和封面。", { p0: r.aspectRatio })
      };
      return [
        l.t("请使用内置 totalclaw-video-studio skill 执行下面这条短视频制作任务。"),
        "",
        l.t("【项目】{p0}", { p0: r.projectName.trim() || r.brandName.trim() || l.t("未命名短视频项目") }),
        l.t("【品牌/门店】{p0}", { p0: r.brandName.trim() || l.t("未填写") }),
        l.t("【素材目录】{p0}", { p0: r.materialDir.trim() }),
        l.t(`【内容目标与事实】
{p0}`, { p0: r.brief.trim() }),
        l.t("【成片方式】{p0}", { p0: s[r.productionMode] }),
        l.t("【成片比例】{p0}", { p0: r.aspectRatio }),
        l.t("【配音】{voiceInstruction}", { voiceInstruction: c }),
        l.t("【配乐】{p0}", { p0: r.bgmMood === "auto" ? l.t("按内容和镜头节奏自动选择") : Le.value }),
        // 标签给人看，ID 给发布/登录工具用；发布范围以 ID 清单为准，不允许 agent 自行扩平台。
        l.t("【目标平台】{platformNames}", { platformNames: `${o}（平台 ID，发布工具只认它们：${Eo.value}）` }),
        l.t(`【各平台发布话题】
{platformTopics}`, { platformTopics: a }),
        "",
        l.t("执行要求："),
        l.t("1. 先检查素材和事实信息；缺少会影响真实性的关键信息时，只追问缺失项，不得猜价格、地点、活动规则。"),
        l.t("2. 输出 {p0} 成片，并为每个平台分别生成标题、正文、标签和封面建议，遵守各平台长度与格式差异；对应平台文案必须带上上方配置的话题，发布前允许用户单独调整。", { p0: r.aspectRatio }),
        // 之前写死「抖音、快手、小红书、微信视频号…四平台」——只勾一个平台也会被 agent 理解成四个全发。
        l.t("3. {p0} 统一走 totalclaw-video-studio 的受控发布流程；只处理上方目标平台清单里的平台，完成各平台发布前校验后，进入带详情的人工确认节点。", { p0: o }),
        l.t("4. 先生成可播放成片，把产物路径、平台文案和风险检查结果写入任务记录。{p0}成片完成后必须额外单独输出一行：TOTALCLAW_VIDEO_PREVIEW=成片绝对路径，供视频工作台自动识别。", { p0: "" }),
        l.t("5. 公开发布是不可逆动作：必须等我在对话中明确确认后再执行；遇验证码、风控或结果不明确立即暂停，不自动重试。"),
        "",
        // 初始提示词也必须按专业分镜标准写（用户指令）：与 skill 的 references/seedance-prompting.md 同源。
        l.t("镜头与成片工艺标准（必须遵守）："),
        l.t("a. 分镜逐镜头写满十要素：景别、机位与运镜+速度、主体+具体动作动词（禁止「展示产品」空话）、环境与光线、色调氛围（全片统一）、构图（画面下 1/4 留字幕安全区）、镜头内动作起止、与上一镜衔接、主体一致性锚点原句复用、末尾负向提示（无文字水印/无畸变人脸手指/无抖动闪烁）。Seedance 分镜写法以 skill 的 references/seedance-prompting.md 为准。"),
        l.t("b. 转场用一条 xfade 链（0.3-0.5 秒），严禁每段各自黑场淡入淡出再拼接；生成端不要自带淡入淡出。"),
        l.t("c. 字幕用 burn_subtitles.py 默认字号与安全区；响度走 mix_audio.py 内置的 -14 LUFS 归一；成片必须 yuv420p。"),
        l.t("d. 首帧即封面（满画面有信息量）；结尾完整淡出或干净硬收；日夜时序单调渐进。")
      ].join(`
`);
    }
    const Lo = e.computed(() => Io());
    function Oo(t, o) {
      const a = r.aspectRatio || "9:16", n = r.brandName.trim(), d = r.brief.trim(), c = r.bgmMood === "auto" ? l.t("按内容与镜头节奏自动选择") : Le.value;
      return [
        l.t("项目：{p0}", { p0: t }),
        ...n ? [l.t("品牌/门店：{p0}", { p0: n })] : [],
        l.t("画幅：{p0}（构图请为画面下 1/4 的字幕留安全区）。", { p0: a }),
        l.t("配乐情绪：{p0}。生成端只要环境音与配乐，不要任何人声念白（旁白后期统一合成）。", { p0: c }),
        "",
        l.t("内容目标与事实（只依据这里的信息，不得虚构价格、地址、优惠或功效）："),
        d || l.t("（未填写具体要求：请依据素材本身的画面内容组织镜头）"),
        "",
        l.t("可用首帧参考图（reference_image 只能原样从下面这份清单里选）："),
        ...o.slice(0, 8).map((s, p) => `${p + 1}. ${s}`),
        "",
        // 契约放最后：模型对末尾指令的服从度最高，前面写多少创作要求都不该动摇输出格式。
        // 提示词长度必须写进契约：Seedance 的生成参数（--rs/--dur/--rt）是**拼在提示词
        // 尾部的文本 flag**，没有独立字段。提示词越长，这些参数离得越远、被稀释得越厉害；
        // 火山方舟官方也建议 50–200 字，超长反而削弱指令服从度。不说上限，模型会越写越长。
        "",
        /**
         * 分幕方法论必须显式给出（2026-08-07 用户问「怎么分解的一幕一幕的」）。
         *
         * 原来这份请求**只给素材清单和 JSON 格式**，对「分几幕、每幕承担什么叙事职能、
         * 幕与幕怎么承接」只字未提，还留了句悬空的要素引用 —— 那份清单写在
         * references/seedance-prompting.md 里，模型根本读不到。于是分镜数量和结构
         * 全靠自由发挥，复杂需求下尤其飘。
         *
         * 这里把 skill 参考文档里已经打磨过的方法论压缩成可执行指令：叙事骨架定「分几幕」，
         * 十要素定「每幕怎么写」，一致性锚点与转场意图定「幕之间怎么接」。
         */
        /**
         * ⚠️ 幕数必须由目标时长推导，不能写死区间（2026-08-07 用户点出）。
         * 每幕固定 5 秒（API 下限），写死「3–6 幕」等于给成片设了 15–30 秒的隐形上限 ——
         * 用户在内容目标里写「做一分钟」，模型仍只出 3–6 幕，需求被静默压掉。
         * 界面上没有独立的时长字段，时长就写在用户的内容目标里，所以这里要求模型
         * 先从中读出目标时长，再据此算幕数。
         */
        l.t("分镜方法（决定分几幕）：先从上面的内容目标里读出目标时长，按「幕数 = 目标时长 ÷ 5 秒」计算（没写时长就按 15 秒算，即 3 幕）。再按「钩子 → 展开 → 细节 → 收束」的叙事骨架把这些幕分配到各叙事段落：时长越长，展开与细节段落的幕数就越多，不要靠拉长单幕来凑时长。一幕一个明确信息点，不要一幕塞多件事。每幕 duration 一律填 5。"),
        l.t("每幕 prompt 必须写全这些要素，组织成连贯中文段落（不是填表）：①景别（远/全/中/近/特写）②运镜与速度（推拉摇移跟升降环绕 + 缓慢匀速/急速）③主体与具体动作（用「推门而入」「抬手斟茶」这类实动词，禁止「展示产品」「呈现空间」这类空话）④时段与光线方向 ⑤色调氛围 ⑥构图（画面下 1/4 留干净留白给字幕）⑦起幅与落幅（落幅要能接下一镜）⑧与上一镜的衔接方式（动作匹配/方向延续/明暗接续）。"),
        l.t("跨幕一致性：主体外观描述（建筑材质、品牌色、人物衣着色板）在各幕之间**原句照抄**，否则每幕生成的主体长得不一样。全片色调统一。"),
        l.t("每条 prompt 末尾固定加：真实质感，无任何文字、字幕、水印、logo，无畸变人脸与手指，无乱码文字，画面无抖动闪烁。"),
        "",
        // 200 字：既装得下上面那八要素，又不超出火山方舟建议的 50–200 字区间。
        // 上限存在的理由不是省 token，而是 --rs/--dur/--rt 这些参数拼在提示词**尾部**，
        // 提示词越长它们越容易被稀释失效。
        l.t("每条 prompt 控制在 200 字以内（这是硬要求）：写满要素但不堆砌形容词，超长会让画面控制参数失效。caption 不超过 20 字。"),
        l.t("现在只输出一个 JSON 对象，不要任何解释文字与代码块围栏，格式："),
        '{"scenes":[{"reference_image":"上面清单里的绝对路径","duration":5,"prompt":"按上面要素写的镜头提示词","caption":"该镜头字幕"}]}'
      ].join(`
`);
    }
    async function Mo() {
      !Ze.value || C.value || (X.value = !1, await Ut());
    }
    const fe = e.ref([]);
    function jt() {
      try {
        const t = JSON.parse(localStorage.getItem(ao) || "[]");
        return Array.isArray(t) ? t : [];
      } catch {
        return [];
      }
    }
    function Rt(t) {
      try {
        const o = [t, ...jt().filter((a) => a.videoPath !== t.videoPath)];
        localStorage.setItem(ao, JSON.stringify(o.slice(0, 100)));
      } catch {
      }
    }
    const M = e.ref(0), ge = e.computed(() => Math.max(1, Math.ceil(fe.value.length / mt))), Bo = e.computed(() => fe.value.slice(M.value * mt, (M.value + 1) * mt));
    async function he() {
      const t = window.electronAPI;
      if (t?.listWorkspaceTree)
        try {
          const o = await t.listWorkspaceTree(), a = [];
          for (const s of Array.isArray(o) ? o : [])
            for (const p of s?.departments || [])
              for (const f of p?.tasks || []) {
                if (f?.origin?.kind !== "video-studio") continue;
                const m = Array.isArray(f.runs) ? f.runs : [], N = m[m.length - 1], b = (f.workflowDef?.inputs || []).find((ne) => ne?.key === "outputPath");
                a.push({
                  taskId: String(f.id || ""),
                  workspaceId: String(s.id || ""),
                  departmentId: String(p.id || ""),
                  conversationId: String(f.conversationId || ""),
                  projectName: String(f.name || f.origin?.label || l.t("短视频项目")),
                  createdAt: Number(f.createdAt || 0),
                  status: rt(N?.status),
                  videoPath: String(b?.defaultValue || "")
                });
              }
          for (const s of jt())
            a.push({
              taskId: `direct:${s.videoPath}`,
              workspaceId: "",
              departmentId: "",
              conversationId: "",
              projectName: s.projectName,
              createdAt: s.createdAt,
              status: "success",
              videoPath: s.videoPath
            });
          const n = ["running", "waiting_human", "pending"], c = (await Promise.all(a.map(async (s) => {
            if (s.videoPath)
              try {
                const p = await window.electronAPI?.solution?.inspectMedia?.(s.videoPath);
                if (p?.ok && p?.path) {
                  const f = Number(p.mtimeMs) > 0 ? Number(p.mtimeMs) : 0, m = s.taskId.startsWith("direct:") && f ? f : s.createdAt;
                  return { ...s, videoPath: String(p.path), createdAt: m };
                }
              } catch {
              }
            return n.includes(s.status) ? { ...s, videoPath: "" } : null;
          }))).filter((s) => !!s);
          c.sort((s, p) => p.createdAt - s.createdAt), fe.value = c, M.value > ge.value - 1 && (M.value = ge.value - 1);
        } catch {
        }
    }
    function jo(t) {
      return t === "success" ? l.t("已完成") : t === "failed" ? l.t("制作失败") : t === "cancelled" ? l.t("已停止") : t === "waiting_human" ? l.t("等待确认") : t === "running" ? l.t("制作中") : l.t("等待开始");
    }
    function Ro(t) {
      if (!t) return "";
      try {
        return new Date(t).toLocaleString();
      } catch {
        return "";
      }
    }
    async function Wo(t) {
      if (t.taskId !== i.taskId && await it()) {
        h.warn(l.t("当前有制作正在进行，发布历史成片会丢失它的进度跟踪；请等它完成或先停止"));
        return;
      }
      if (t.taskId.startsWith("direct:")) {
        i.source = "direct", i.conversationId = "", i.workspaceId = void 0, i.departmentId = void 0, i.taskId = void 0, i.projectName = t.projectName, i.expectedVideoPath = t.videoPath, i.videoPath = t.videoPath, _(), await G(t.videoPath), await Ee();
        return;
      }
      i.source = "workflow", i.conversationId = t.conversationId, i.projectName = t.projectName, i.workspaceId = t.workspaceId, i.departmentId = t.departmentId, i.taskId = t.taskId, i.expectedVideoPath = t.videoPath, i.videoPath = t.videoPath, _(), R.value = "", L.value = "", await z(), t.videoPath && await G(t.videoPath), await Ee();
    }
    function Ko(t, o) {
      const a = t.includes("\\") ? "\\" : "/";
      return [
        t.replace(/[\\/]+$/, ""),
        ".totalclaw-video-studio",
        o,
        "final.mp4"
      ].join(a);
    }
    function be() {
      g.value = Object.fromEntries(
        Object.entries(g.value).map(([t, o]) => [t, o === "running" ? "pending" : o])
      ), u.value = "cancelled", v.value = l.t("已取消本次成片"), Y();
    }
    async function at(t) {
      const o = window.electronAPI;
      re.value = !0;
      const a = [];
      t !== "seedance" && typeof o?.solution?.cancelVideo == "function" && a.push(Promise.resolve().then(() => o.solution.cancelVideo())), t !== "slideshow" && typeof o?.globalAdsRun?.cancelSlideshow == "function" && a.push(Promise.resolve().then(() => o.globalAdsRun.cancelSlideshow())), await Promise.allSettled(a);
    }
    async function zo() {
      if (!(le.value || !Me.value)) {
        le.value = !0;
        try {
          await at(D.value), await Wt(() => u.value !== "running", 15e3);
        } catch (t) {
          h.fromException(l.t("停止成片失败"), t);
        } finally {
          le.value = !1;
        }
      }
    }
    function Wt(t, o) {
      return new Promise((a) => {
        if (t()) {
          a(!0);
          return;
        }
        const n = Date.now(), d = window.setInterval(() => {
          if (t()) {
            window.clearInterval(d), a(!0);
            return;
          }
          Date.now() - n >= o && (window.clearInterval(d), a(!1));
        }, 200);
      });
    }
    async function Fo() {
      if (!Ce.value) {
        Ce.value = !0;
        try {
          if (Me.value) {
            if (await at(D.value), !await Wt(() => u.value !== "running" && !C.value, 2e4)) {
              h.warn(l.t("旧任务还没有退出，暂时无法重新生成；请稍后再试或重启应用。"));
              return;
            }
          } else if (C.value)
            return;
          await Ut();
        } finally {
          Ce.value = !1;
        }
      }
    }
    async function Kt(t) {
      const o = window.electronAPI?.solution?.listMediaDir;
      if (typeof o != "function") return !0;
      let a = null;
      try {
        a = await o(t);
      } catch (d) {
        return h.warn(l.t("素材文件夹读取失败：{p0}", { p0: ae.humanizeErrorMessage(d) })), !1;
      }
      return a?.ok ? (Array.isArray(a.files) ? a.files : []).filter((d) => d?.kind === "image").length ? !0 : (h.warn(l.t("素材文件夹里没有图片（jpg/png/webp/heic…），图片成片无法开始：{p0}", { p0: t })), !1) : (h.warn(a?.error ? l.t("素材文件夹读取失败：{p0}", { p0: String(a.error) }) : l.t("素材文件夹读不到（可能已被移动或删除）：{p0}", { p0: t })), !1);
    }
    async function zt(t) {
      const o = window.electronAPI, a = r.materialDir.trim();
      if (!a) throw new Error(l.t("请先选择素材目录，成片要用你自己的素材生成"));
      if (!o?.solution?.videoGenerate) throw new Error(l.t("成片服务尚未就绪"));
      Xe(), Y();
      const n = r.voiceover || !!r.bgmMood;
      i.source = "direct", i.conversationId = "", i.workspaceId = void 0, i.departmentId = void 0, i.taskId = void 0, _(), T.value = "", A.value = null, pe.value = !0, eo("slideshow", t), y.value = n ? [...$e, bo] : [...$e], g.value = n ? { scan: "running", stage: "pending", render: "pending", audio: "pending" } : { scan: "running", stage: "pending", render: "pending" }, v.value = l.t("正在扫描素材");
      const d = o.solution.onVideoProgress?.((c) => {
        Q.value = Date.now();
        const s = String(c?.stage || "");
        if (!s) return;
        const p = n ? ["scan", "stage", "render", "audio"] : ["scan", "stage", "render"], f = p.indexOf(s);
        if (f < 0) return;
        const m = {};
        p.forEach((N, b) => {
          m[N] = b < f ? "done" : b === f ? "running" : "pending";
        }), g.value = m, v.value = String(c?.msg || s);
      });
      try {
        let c = [];
        if (r.voiceover) {
          v.value = l.t("正在撰写 AI 旁白文案");
          try {
            const m = await o.llmOneshot({
              systemPrompt: [
                l.t("你是短视频旁白撰稿人。根据给出的项目信息写一段中文口播旁白。"),
                l.t("直接输出旁白正文：不要解释、不要标题、不要 Markdown、不要表情符号。"),
                l.t("语句自然口语化，长度控制在 60 字以内（视频只有十几秒）。"),
                l.t("绝对禁止虚构价格、地址、优惠规则或未提供的事实。")
              ].join(`
`),
              prompt: [
                l.t("项目：{p0}", { p0: t }),
                r.voiceStyle.trim() ? l.t("旁白语气：{p0}", { p0: r.voiceStyle.trim() }) : "",
                l.t(`内容要点：
{p0}`, { p0: r.brief.trim() || t })
              ].filter(Boolean).join(`
`),
              timeoutMs: 12e4,
              plainCompletion: !0
            }), N = String(m?.text || "").trim().slice(0, 200);
            N && (c = [{ id: "s1", text: N, start: 0 }]);
          } catch {
          }
          if (!c.length) {
            const m = (r.brief.trim() || t).slice(0, 120);
            m && (c = [{ id: "s1", text: m, start: 0 }]);
          }
        }
        if (re.value)
          return be(), !1;
        const s = await o.solution.videoGenerate({
          script: "oneclick",
          materialDir: a,
          perImage: 2.2,
          width: 1080,
          height: 1920,
          title: t,
          // F2 ②：配音/配乐设置端到端直通（主进程 audio 阶段消费）
          narration: c,
          bgmMood: r.bgmMood || void 0
        });
        if (s?.cancelled)
          return be(), !1;
        if (!s?.ok) throw new Error(s?.error || l.t("成片失败"));
        const p = Array.isArray(s.skippedFiles) ? s.skippedFiles : [];
        if (p.length) {
          const m = p.slice(0, 5).map((N) => `${String(N?.name)}（${String(N?.reason)}）`).join(l.t("、"));
          h.warn(l.t("有 {p0} 个素材读不出来，已跳过：{p1}", {
            p0: p.length,
            p1: m + (p.length > 5 ? "…" : "")
          }));
        }
        const f = String(s.videoPath || "");
        return g.value = n ? { scan: "done", stage: "done", render: "done", audio: "done" } : { scan: "done", stage: "done", render: "done" }, i.projectName = t, i.expectedVideoPath = f, i.videoPath = f, _(), u.value = "success", v.value = l.t("成片已完成，可预览并进入发布"), f && (Rt({ videoPath: f, projectName: t, createdAt: Date.now() }), await G(f)), await he(), h.success(l.t("成片已完成")), !0;
      } catch (c) {
        throw g.value = Object.fromEntries(
          Object.entries(g.value).map(([s, p]) => [s, p === "running" ? "failed" : p])
        ), u.value = "failed", v.value = ae.humanizeErrorMessage(c, l.t("成片失败")), Y(), c;
      } finally {
        to(), pe.value = !1;
        try {
          d?.();
        } catch {
        }
      }
    }
    function Y() {
      i.videoPath = "", i.expectedVideoPath = void 0, _(), R.value = "", L.value = "";
    }
    async function Uo(t) {
      const o = window.electronAPI, a = r.materialDir.trim();
      if (!a) throw new Error(l.t("请先选择素材目录，成片要用你自己的素材生成"));
      if (typeof o?.globalAdsRun?.slideshow != "function") throw new Error(l.t("成片服务尚未就绪"));
      if (!o?.llmOneshot) throw new Error(l.t("默认 LLM 服务尚未就绪"));
      Xe(), Y(), i.source = "direct", i.conversationId = "", i.workspaceId = void 0, i.departmentId = void 0, i.taskId = void 0, _(), T.value = "", A.value = null, pe.value = !0, eo("seedance", t), y.value = [...Pt], g.value = { scan: "running", shots: "pending", render: "pending", qc: "pending" }, v.value = l.t("正在扫描素材");
      const n = (c, s) => {
        g.value = { ...g.value, [c]: s };
      }, d = o.globalAdsRun.onSlideshowProgress?.((c) => {
        Q.value = Date.now();
        const s = String(c?.msg || "");
        s && (v.value = s, /质检|补生成/.test(s) && (n("render", "done"), n("qc", "running")));
      });
      try {
        const c = await o.solution?.materialScan?.({ materialDir: a, aspect: r.aspectRatio || "9:16" }).catch((I) => ({ ok: !1, error: String(I?.message || I) }));
        if (!c?.ok) throw new Error(l.t("素材扫描失败：{p0}", { p0: String(c?.error || l.t("未知原因")).slice(0, 120) }));
        const s = (c.included || []).filter((I) => I?.kind === "image" && I?.path).map((I) => String(I.path));
        if (!s.length) throw new Error(l.t("素材目录里没有可用图片，请先添加清晰的参考素材"));
        if (re.value)
          return be(), !1;
        n("scan", "done"), n("shots", "running"), v.value = l.t("正在按十要素规范撰写分镜提示词");
        const p = await o.llmOneshot({
          systemPrompt: ye.SEEDANCE_SHOT_SYSTEM_PROMPT,
          prompt: Oo(t, s),
          timeoutMs: 3e5,
          // 纯补全（F1 修复）：分镜是结构化文本生成。不带此标记时 worker 池按全量 toolset 建
          // agent，推理型模型会把「制作要求」当任务执行（E2E 实测 37+ 轮工具调用、13.5 分钟，
          // 最终回复不是分镜表 → parseSeedanceShotList 拒收 → 流水线打不起来）。
          plainCompletion: !0
        }), f = String(p?.text || ""), m = ye.parseSeedanceShotList(f, s);
        if (!m.length) {
          const I = {
            replyLength: f.length,
            head: f.slice(0, 200),
            tail: f.length > 400 ? f.slice(-120) : ""
          };
          console.warn("[video-studio] 分镜解析失败", I);
          try {
            o?.sendRendererLog?.({
              level: "error",
              source: "video-studio",
              message: l.t("分镜解析失败：模型回复不是可用的结构化分镜"),
              data: I
            });
          } catch {
          }
          throw new Error(l.t("模型没有返回可用的结构化分镜，未开始生成（不浪费生成额度）"));
        }
        if (re.value)
          return be(), !1;
        n("shots", "done"), n("render", "running");
        const N = Math.max(0, Math.round((Date.now() - Ke.value) / 1e3));
        F.value = N + Math.max(30, Math.round(No(m.length, Ot.value))), v.value = l.t("动态视频并行生成 {p0} 个镜头…", { p0: m.length });
        const b = `video_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`, ne = Ko(a, b), We = await o.globalAdsRun.slideshow({
          mode: "fal",
          materialDir: a,
          outputs: [{ aspect: r.aspectRatio || "9:16", path: ne }],
          title: t,
          bgmMood: r.bgmMood,
          scenes: m,
          narration: r.voiceover ? ye.narrationTimeline(m) : [],
          seedanceQuality: Ot.value
        });
        if (We?.cancelled)
          return be(), !1;
        if (!We?.ok) throw new Error(We?.error || l.t("动态视频生成失败"));
        n("render", "done"), n("qc", "running"), v.value = l.t("正在校验成片");
        const we = String(We.produced?.[0]?.path || ne), xt = await o.solution?.inspectMedia?.(we);
        if (xt?.ok !== !0) throw new Error(l.t("成片校验未通过：{p0}", { p0: String(xt?.error || l.t("文件不可播放")) }));
        return n("qc", "done"), i.projectName = t, i.expectedVideoPath = we, i.videoPath = we, _(), u.value = "success", v.value = l.t("成片已完成，可预览并进入发布"), Rt({ videoPath: we, projectName: t, createdAt: Date.now() }), await G(we), await he(), h.success(l.t("成片已完成")), !0;
      } catch (c) {
        throw g.value = Object.fromEntries(
          Object.entries(g.value).map(([s, p]) => [s, p === "running" ? "failed" : p])
        ), u.value = "failed", v.value = ae.humanizeErrorMessage(c, l.t("成片失败")), Y(), c;
      } finally {
        to(), pe.value = !1;
        try {
          d?.();
        } catch {
        }
      }
    }
    const Ft = ["running", "waiting_human"];
    async function it() {
      if (i.source !== "workflow") return !1;
      if (Ft.includes(u.value)) return !0;
      if (!i.taskId) return !1;
      try {
        const t = await window.electronAPI?.listWorkspaceTree?.();
        for (const o of Array.isArray(t) ? t : [])
          for (const a of o?.departments || []) {
            const n = (a?.tasks || []).find((c) => c?.id === i.taskId);
            if (!n) continue;
            return (Array.isArray(n.runs) ? n.runs : []).some((c) => Ft.includes(rt(c?.status)));
          }
      } catch {
      }
      return !1;
    }
    async function Ut() {
      if (!Ze.value || C.value) return !1;
      if (Me.value || await it())
        return h.warn(l.t("已有制作正在进行（{p0}），等它完成或先停止后再开始新的", { p0: v.value || l.t("执行中") })), !1;
      if (!r.materialDir.trim())
        return h.warn(l.t("请先选择素材文件夹：真实生成需要读取本地素材")), !1;
      C.value = !0;
      try {
        B.value && (await at(""), il(), await new Promise((a) => {
          window.setTimeout(a, 1e3);
        }));
        const t = r.projectName.trim() || r.brandName.trim() || l.t("短视频项目"), o = r.materialDir.trim();
        if (r.productionMode === "slideshow")
          return await Kt(o) ? await zt(t) : !1;
        try {
          return await Uo(t);
        } catch (a) {
          if (r.productionMode !== "smart") throw a;
          return h.warn(l.t("动态视频生成不可用（{p0}），已改用图片成片", { p0: ae.humanizeErrorMessage(a).slice(0, 120) })), await Kt(o) ? await zt(t) : !1;
        }
      } catch (t) {
        let o = null;
        try {
          o = ht.humanizeChatError(t);
        } catch {
          o = null;
        }
        return o && (o.suggestModelConfig || o.suggestRecharge) ? h.actionable("warn", l.t("创建视频制作任务失败：{p0}", { p0: o.message }), {
          label: o.suggestRecharge ? l.t("去充值") : l.t("去配置"),
          onClick: () => se.push({ path: "/settings", query: { section: "ai-models" } })
        }) : h.fromException(l.t("创建视频制作任务失败"), t), !1;
      } finally {
        C.value = !1;
      }
    }
    function rt(t) {
      const o = String(t || "").toLowerCase();
      return o === "running" ? "running" : o === "waiting_human" ? "waiting_human" : o === "success" || o === "completed" || o === "done" ? "success" : o === "failed" || o === "error" ? "failed" : o === "cancelled" || o === "canceled" ? "cancelled" : o === "pending" ? "pending" : "idle";
    }
    function Jo(t) {
      return ["creative_plan", "creative_review", "render_final"].includes(t) ? 1 : ["video_review", "publish_validation"].includes(t) ? 2 : ["publish_approval", "platform_publish"].includes(t) ? 3 : 1;
    }
    async function z() {
      if (i.source !== "workflow") return;
      const t = window.electronAPI;
      if (t?.listWorkspaceTree)
        try {
          if (!i.taskId && i.conversationId && t.conversation?.get) {
            const m = await t.conversation.get(i.conversationId);
            m?.taskId && (i.taskId = String(m.taskId));
          }
          if (!i.taskId) return;
          const o = await t.listWorkspaceTree();
          let a = null;
          for (const m of Array.isArray(o) ? o : []) {
            for (const N of m?.departments || []) {
              const b = (N?.tasks || []).find((ne) => ne?.id === i.taskId);
              if (b) {
                a = { workspace: m, department: N, task: b };
                break;
              }
            }
            if (a) break;
          }
          if (!a) return;
          i.workspaceId = String(a.workspace.id || ""), i.departmentId = String(a.department.id || ""), i.taskId = String(a.task.id || ""), _();
          const n = (a.task.workflowDef?.nodes || []).filter((m) => m?.type !== "start" && m?.type !== "end").map((m) => ({
            id: String(m.id),
            phase: Jo(String(m.id)),
            label: String(m.name || m.id).replace(/^[①②③④⑤⑥⑦⑧]\s*/, "")
          }));
          y.value = n.length ? n : [...Se];
          const d = Array.isArray(a.task.runs) ? a.task.runs : [], c = [...d].reverse().find(
            (m) => ["running", "waiting_human"].includes(String(m?.status || "").toLowerCase())
          ) || d[d.length - 1];
          if (!c) {
            T.value = "", u.value = "pending", g.value = {}, v.value = l.t("任务已创建，等待工作流开始");
            return;
          }
          T.value = String(c.runId || c.id || ""), u.value = rt(c.status), g.value = { ...c.nodeStates || {} };
          const s = ["waiting_human", "running"].includes(u.value) ? c.pendingHumanConfirm : null;
          A.value = s?.nodeId ? {
            nodeId: String(s.nodeId),
            nodeName: s.nodeName ? String(s.nodeName).replace(/^[①②③④⑤⑥⑦⑧]\s*/, "") : void 0,
            question: s.question,
            detail: s.detail
          } : null;
          const p = Object.entries(g.value).find(([, m]) => m === "running")?.[0] || String(c.currentNodeId || ""), f = (a.task.workflowDef?.nodes || []).find((m) => m?.id === p);
          f?.name ? v.value = String(f.name).replace(/^[①②③④⑤⑥⑦⑧]\s*/, "") : u.value === "success" ? v.value = l.t("全部制作步骤已完成") : u.value === "failed" ? v.value = String(c.error || l.t("请进入制作对话查看失败原因")) : u.value === "cancelled" ? v.value = l.t("任务已停止") : v.value = l.t("正在同步工作流状态");
        } catch {
        }
    }
    async function qo(t) {
      const o = ie.PLATFORM_PUBLISH_URLS[t];
      if (!o) return;
      const a = window.electronAPI;
      try {
        await a?.browserTabs?.create?.({ url: o, activate: !0 }), k.value = { ...k.value, [t]: "unknown" };
      } catch (n) {
        h.fromException(l.t("打开平台登录页失败"), n);
      }
    }
    async function Ho(t) {
      const o = ie.PLATFORM_PUBLISH_URLS[t], a = window.electronAPI;
      if (!(!o || !a?.browserTabs?.create)) {
        k.value = { ...k.value, [t]: "checking" };
        try {
          const n = await a.browserTabs.create({ url: o, activate: !1 }), d = String(n?.id || "");
          if (!d) throw new Error(l.t("内置浏览器未能打开该平台"));
          await new Promise((b) => setTimeout(b, 4500));
          const c = await a.browserTabs.command({
            tabId: d,
            command: "eval",
            args: [`JSON.stringify({
        url: location.href,
        fileInputs: (function(){
          var n = 0;
          (function walk(root){
            try {
              n += root.querySelectorAll('input[type="file"]').length;
              root.querySelectorAll('*').forEach(function(e){ if (e.shadowRoot) walk(e.shadowRoot); });
            } catch (err) {}
          })(document);
          return n;
        })(),
      })`]
          }), s = c?.data ?? c?.result ?? c, p = typeof s == "string" ? JSON.parse(s) : s, f = String(p?.url || ""), N = !/login|signin|passport|\/auth/i.test(f) && Number(p?.fileInputs || 0) > 0;
          k.value = { ...k.value, [t]: N ? "ready" : "absent" }, N || (O.value = { ...O.value, [t]: !1 });
        } catch {
          k.value = { ...k.value, [t]: "absent" }, O.value = { ...O.value, [t]: !1 };
        }
      }
    }
    async function Jt() {
      await Promise.all(P.value.map((t) => Ho(t.id)));
    }
    const Ne = e.computed(
      () => P.value.filter((t) => O.value[t.id] !== !1)
    ), st = e.computed(
      () => P.value.filter((t) => O.value[t.id] === !1)
    );
    async function qt(t) {
      const o = A.value;
      if (!(!o || !T.value || J.value)) {
        J.value = !0;
        try {
          const a = Ne.value.map((s) => s.label), n = st.value.map((s) => s.label), d = t ? [
            l.t("确认发布的平台：{list}", { list: a.join("、") || l.t("（无）") }),
            n.length ? l.t("跳过的平台（未登录或本次不发）：{list}，请在回执中如实标注为未发布，不要写成成功。", { list: n.join("、") }) : ""
          ].filter(Boolean).join(`
`) : l.t("暂不发布，请按修改意见调整后重新校验。"), c = await window.electronAPI?.respondTaskRunHumanConfirm?.({
            runId: T.value,
            nodeId: o.nodeId,
            approved: t,
            reply: d,
            selectedOption: t ? a.join(l.t("、")) : void 0
          });
          !c || c.ok === !1 || c.stale ? h.warn(l.t("这条确认已经失效，正在刷新运行状态")) : (h.success(t ? l.t("已确认，开始分平台发布") : l.t("已退回，等待修改后重新校验")), window.dispatchEvent(new CustomEvent("totalclaw-human-confirm-resolved", {
            detail: { runId: T.value, nodeId: o.nodeId }
          })), A.value = null), await z();
        } catch (a) {
          h.fromException(l.t("提交发布确认失败"), a);
        } finally {
          J.value = !1;
        }
      }
    }
    function Yo(t) {
      if (t?.runId && i.source === "workflow") {
        if (!T.value) {
          t.kind === "run-started" && z();
          return;
        }
        String(t.runId) === T.value && (t.nodeStates && (g.value = { ...t.nodeStates }), (t.kind === "human-confirm-resolved" || t.kind === "node-completed" || t.kind === "node-failed") && t.nodeId && A.value?.nodeId === String(t.nodeId) && (A.value = null), t.kind === "run-started" ? (u.value = "running", v.value = l.t("工作流已启动")) : t.kind === "node-entered" ? (u.value = "running", t.nodeId && (g.value = { ...g.value, [t.nodeId]: "running" }), v.value = String(t.nodeName || t.roleName || t.nodeId || l.t("正在执行"))) : t.kind === "node-completed" ? t.nodeId && (g.value = { ...g.value, [t.nodeId]: "done" }) : t.kind === "node-failed" ? (u.value = "failed", t.nodeId && (g.value = { ...g.value, [t.nodeId]: "failed" }), v.value = String(t.error || t.nodeName || l.t("节点执行失败"))) : t.kind === "human-confirm-requested" ? (u.value = "waiting_human", v.value = String(t.nodeName || l.t("等待人工确认")), t.nodeId && (A.value = {
          nodeId: String(t.nodeId),
          nodeName: t.nodeName ? String(t.nodeName).replace(/^[①②③④⑤⑥⑦⑧]\s*/, "") : void 0,
          question: t.humanConfirm?.question,
          detail: t.humanConfirm?.detail
        }, Jt())) : t.kind === "run-completed" ? (u.value = "success", v.value = l.t("全部制作步骤已完成"), z(), he()) : t.kind === "run-failed" ? (u.value = "failed", v.value = String(t.error || l.t("请进入制作对话查看失败原因")), z()) : t.kind === "run-cancelled" && (u.value = "cancelled", v.value = l.t("任务已停止"), z()));
      }
    }
    async function Go() {
      if (i.conversationId)
        try {
          if (!(await window.electronAPI?.conversation?.get?.(i.conversationId))?.id && !await Gt())
            throw new Error(l.t("这条制作任务已不存在"));
          await se.push({
            path: "/conversations",
            query: { id: i.conversationId, returnTo: "/video-studio" }
          });
        } catch (t) {
          h.fromException(l.t("无法打开制作进度"), t);
        }
    }
    async function G(t) {
      const o = t.trim().replace(/^['"`]|['"`]$/g, "");
      if (!o || Ae.value) return !1;
      Ae.value = !0, ue.value = !0;
      try {
        const a = await window.electronAPI?.solution?.previewMedia?.(o), n = a?.srcUrl || a?.dataUrl;
        if (!a?.ok || !n) throw new Error(a?.error || l.t("无法读取成片"));
        return R.value = n, L.value = a.path || o, !0;
      } catch (a) {
        return h.fromException(l.t("成片预览失败"), a), !1;
      } finally {
        Ae.value = !1;
      }
    }
    function dt(t) {
      const o = [], a = (d) => {
        const c = String(d || "").trim().replace(/^['"`]|['"`]$/g, "");
        c && !o.includes(c) && o.push(c);
      }, n = [
        /(?:^|\n)TOTALCLAW_VIDEO_PREVIEW=(.+\.(?:mp4|m4v|webm|mov))\s*(?:\n|$)/ig,
        /["']?video_(?:path|file)["']?\s*[:=]\s*["'`](.+?\.(?:mp4|m4v|webm|mov))["'`]/ig,
        /["']?videoPath["']?\s*[:=]\s*["'`](.+?\.(?:mp4|m4v|webm|mov))["'`]/ig
      ];
      for (const d of n) {
        let c;
        for (; c = d.exec(t); ) a(c[1]);
      }
      return o;
    }
    function Ht(t) {
      return [...new Set(t)].sort((o, a) => {
        const n = (d) => {
          const c = d.toLowerCase();
          let s = 0;
          return i.expectedVideoPath && d === i.expectedVideoPath && (s += 200), /totalclaw_video_preview/.test(c) && (s += 120), /(^|[\\/])final(?:[_\-.]|$)/.test(c) && (s += 100), /(mixed|master|publish|with[_-]?tts|成片)/.test(c) && (s += 50), /(raw|reference|source|input|原始)/.test(c) && (s -= 60), s;
        };
        return n(a) - n(o);
      });
    }
    async function Re(t) {
      try {
        const o = await window.electronAPI?.solution?.inspectMedia?.(t);
        return o?.ok && o?.path ? String(o.path) : "";
      } catch {
        return "";
      }
    }
    function _() {
      try {
        localStorage.setItem(ut, JSON.stringify(i));
      } catch {
      }
    }
    async function Yt(t = !1) {
      const o = i.conversationId;
      if (!o) return !1;
      try {
        const a = [
          i.videoPath,
          i.expectedVideoPath
        ].filter((d) => !!d), n = await window.electronAPI?.conversation?.getTranscript?.(o);
        if (Array.isArray(n))
          for (let d = n.length - 1; d >= 0; d -= 1)
            a.push(...dt(String(n[d]?.content || "")));
        for (const d of Ht(a)) {
          const c = await Re(d);
          if (!c) continue;
          const s = i.videoPath !== c;
          return i.videoPath = c, _(), t && s && await G(c), !0;
        }
        i.videoPath && (i.videoPath = "", R.value = "", L.value = "", _());
      } catch {
      }
      return !1;
    }
    async function Gt() {
      if (i.source === "direct" || i.expectedVideoPath || i.videoPath || i.taskId) return !1;
      const t = window.electronAPI?.conversation;
      if (!t?.list || !t?.getTranscript) return !1;
      try {
        const o = await t.list(), a = (Array.isArray(o) ? o : []).filter((n) => /视频|seedance|短片/i.test(String(n?.title || n?.lastMessagePreview || ""))).filter((n) => !ke(n?.title, n?.lastMessagePreview)).slice(0, 20);
        for (const n of a) {
          const d = await t.getTranscript(n.id);
          if (!Array.isArray(d)) continue;
          const c = [];
          for (let s = d.length - 1; s >= 0; s -= 1) {
            const p = d[s] || {};
            c.push(...dt(String(p.content || ""))), p.toolCalls && c.push(...dt(JSON.stringify(p.toolCalls)));
          }
          for (const s of Ht(c)) {
            const p = await Re(s);
            if (p)
              return i.source = "workflow", i.conversationId = String(n.id), i.projectName = String(n.title || l.t("视频制作任务")).replace(/^视频制作\s*[·\-]\s*/i, ""), i.workspaceId = void 0, i.departmentId = void 0, i.taskId = void 0, i.expectedVideoPath = void 0, i.videoPath = p, _(), !0;
          }
        }
      } catch {
      }
      return !1;
    }
    async function Qt() {
      const t = i.videoPath;
      t && (R.value && L.value === t ? ue.value = !0 : await G(t));
    }
    async function Ee() {
      if (!(!S.value || w.value)) {
        q.value && Xe(), w.value = !0;
        try {
          const t = window.electronAPI;
          if (!t?.publishRuns?.start)
            throw new Error(l.t("当前版本未开放本页发布"));
          const o = (Ne.value.length ? Ne.value : P.value).map((b) => b.id), a = Object.fromEntries(
            P.value.map((b) => [b.id, nt(r.topics[b.id] || "")])
          ), n = Lt(), d = !!n && n.videoPath === i.videoPath, c = !!n && n.platformIds.length === o.length && n.platformIds.every((b) => o.includes(b)), s = d && c && !!n?.caption;
          He(s ? l.t("复用上次发布文案…") : l.t("正在生成发布文案…"));
          const p = s ? n.caption : await Qo(), f = s ? { ...n.topics, ...a } : a, m = {
            videoPath: i.videoPath || "",
            projectName: i.projectName || r.projectName || l.t("短视频发布任务"),
            platforms: [...o],
            topics: f,
            caption: p
          };
          try {
            const b = {
              videoPath: i.videoPath || "",
              platformIds: [...o],
              topics: f,
              caption: p,
              projectName: m.projectName,
              savedAt: Date.now()
            };
            localStorage.setItem(pt, JSON.stringify(b));
          } catch {
          }
          He(l.t("正在准备发布预览…"));
          const N = await t.publishRuns.start({ kind: "video", ownerPath: lo, input: m });
          ue.value = !1, Tt.value = N.id;
        } catch (t) {
          h.fromException(l.t("无法准备发布"), t);
        } finally {
          He(""), w.value = !1;
        }
      }
    }
    async function Qo() {
      const t = r.brandName || i.projectName || r.projectName || l.t("品牌短视频"), o = r.brief.trim();
      if (!o) return t;
      try {
        const a = window.electronAPI;
        if (!a?.llmOneshot) return t;
        const n = await a.llmOneshot({
          systemPrompt: l.t("你是短视频运营，负责写发布文案。只输出正文本身，不要解释、不要引号、不要话题标签。"),
          prompt: [
            l.t("品牌 / 项目：{p0}", { p0: r.brandName || r.projectName || t }),
            l.t("目标平台：{p0}", { p0: me.value }),
            "",
            l.t("内容目标与关键信息："),
            o.slice(0, 1200),
            "",
            l.t("写一条 120 字以内的中文发布正文：开头一句钩子抓住注意力，中间讲清最核心的卖点或看点，结尾一句行动号召。只依据上面给出的事实，不得虚构价格、地址、优惠或功效。现在只输出正文。")
          ].join(`
`),
          timeoutMs: 12e4,
          plainCompletion: !0
        }), d = String(n?.text || "").trim().replace(/^["'「」]+|["'「」]+$/g, "");
        return d ? d.slice(0, 300) : t;
      } catch {
        return t;
      }
    }
    async function Zt() {
      Dt.value = !1, At.set(!1);
    }
    async function Zo(t) {
      if (!w.value) {
        if (!t.approved) {
          await Zt(), v.value = l.t("发布已退回修改，成片仍保留"), h.info(l.t("已退回修改，本次没有执行发布"));
          return;
        }
        w.value = !0, g.value = {
          ...g.value,
          publish_approval: "done",
          platform_publish: "running"
        }, u.value = "running", v.value = l.t("正在执行分平台发布");
        try {
          throw new Error(l.t("发布确认卡尚未接入真实发布流程，请从「去发布」进入发布工作流"));
        } finally {
          w.value = !1;
        }
      }
    }
    function ct() {
      ue.value = !1;
    }
    function Xt(t) {
      const o = Number(t?.platformCount || 0), a = Number(t?.unconfirmedCount || 0), n = Number(t?.failedCount || 0);
      if (!("unconfirmedCount" in (t || {})))
        return l.t("{p0} 个平台发布完成", { p0: o });
      const d = [l.t("{p0} 个平台发布完成", { p0: o })];
      return a && d.push(l.t("{p0} 个待人工核对（{p1}）", {
        p0: a,
        p1: (t.unconfirmedPlatforms || []).join("、")
      })), n && d.push(l.t("{p0} 个失败（{p1}）", {
        p0: n,
        p1: (t.failedPlatforms || []).join("、")
      })), d.join(l.t("，"));
    }
    async function Xo() {
      if (!await window.electronAPI?.solution?.folderExists?.(oo).catch(() => !1)) return;
      const o = fo();
      r.materialDir.trim() || (r.materialDir = o.materialDir), r.projectName.trim() || (r.projectName = o.projectName), r.brandName.trim() || (r.brandName = o.brandName), r.brief.trim() === de.brief.trim() && (r.brief = o.brief);
      for (const a of Object.keys(r.topics)) {
        const n = String(r.topics[a] || "").trim();
        (!n || n === de.topics[a]) && (r.topics[a] = o.topics);
      }
    }
    return e.onMounted(() => {
      Xo();
      try {
        const a = JSON.parse(localStorage.getItem(no) || "null");
        if (a?.kind === "run:completed") {
          const n = JSON.parse(String(a?.finalVariables?.node_receipt_result || "{}"));
          oe.value = Xt(n);
        }
      } catch {
      }
      lt();
      try {
        ot = window.electronAPI?.onMediaModelChanged?.(() => {
          lt();
        });
      } catch {
      }
      (async () => {
        if (Je) {
          const c = await Re(Je);
          c && (i.videoPath = Je), c ? (y.value = [...$e], g.value = { scan: "done", stage: "done", render: "done" }, u.value = "success", v.value = l.t("成片已完成，可预览并进入发布")) : (i.source = "none", Y(), u.value = "idle", g.value = {}, y.value = [...Se], v.value = l.t("填写方案并启动后，这里会实时显示每一步"));
        }
        await z();
        const a = await it(), n = B.value || i.source === "direct" && !!D.value && u.value === "failed";
        !a && !n && ["cancelled", "failed"].includes(u.value) && !(i.videoPath && await Re(i.videoPath)) && (i.source = "none", i.taskId = void 0, i.workspaceId = void 0, i.departmentId = void 0, i.conversationId = "", i.videoPath = "", i.expectedVideoPath = void 0, _(), T.value = "", g.value = {}, y.value = [...Se], u.value = "idle", D.value = "", v.value = l.t("填写方案并启动后，这里会实时显示每一步")), await he();
        const d = i.source === "direct" ? !1 : await Yt(!1);
        !a && !d && !i.expectedVideoPath && !i.taskId && await Gt();
      })(), Ye = window.electronAPI?.conversation?.onUpdated?.((a) => {
        a?.id === i.conversationId && (i.source === "direct" || u.value === "running" || Yt(!0));
      }) || null, Ge = window.electronAPI?.onTaskRunEvent?.(Yo) || null, Ie = window.setInterval(() => {
        z();
      }, 3e3);
    }), e.watch(u, (t, o) => {
      if (!(pe.value || o !== "running" || !D.value))
        if (t === "success") {
          const a = Ue(ut, { conversationId: "", projectName: "" });
          if (a.source !== "direct" || !a.videoPath) return;
          i.source = "direct", i.conversationId = "", i.taskId = void 0, i.workspaceId = void 0, i.departmentId = void 0, i.projectName = String(a.projectName || i.projectName || ""), i.expectedVideoPath = a.expectedVideoPath || a.videoPath, i.videoPath = String(a.videoPath), G(i.videoPath), he();
        } else (t === "failed" || t === "cancelled") && i.source === "direct" && Y();
    }), e.onBeforeUnmount(() => {
      At.release(), Ye?.(), Ye = null, Ge?.(), Ge = null, Ie && window.clearInterval(Ie), Ie = null, U && window.clearInterval(U), U = null;
    }), (t, o) => {
      const a = e.resolveDirective("kb-fill");
      return e.openBlock(), e.createElementBlock("div", rl, [
        e.createElementVNode("header", sl, [
          e.createVNode(xo),
          e.createElementVNode("div", dl, [
            e.createElementVNode("span", cl, [
              o[24] || (o[24] = e.createElementVNode(
                "i",
                { class: "ri-movie-2-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(t.$t("内置 Skill · totalclaw-video-studio")),
                1
                /* TEXT */
              )
            ]),
            e.createElementVNode(
              "h1",
              null,
              e.toDisplayString(t.$t("多媒体创作与发布工作台")),
              1
              /* TEXT */
            ),
            e.createElementVNode(
              "p",
              null,
              e.toDisplayString(t.$t("从素材整理、脚本、配音配乐到成片审核，一次准备抖音、快手、小红书和微信视频号版本。")),
              1
              /* TEXT */
            )
          ]),
          e.createElementVNode("div", ul, [
            e.createElementVNode("div", {
              class: "hero-flow",
              "aria-label": t.$t("视频制作流程")
            }, [
              (e.openBlock(), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(Ve, (n, d) => (e.openBlock(), e.createElementBlock(
                  e.Fragment,
                  {
                    key: n.label
                  },
                  [
                    e.createElementVNode(
                      "div",
                      {
                        class: e.normalizeClass(["flow-step", {
                          ready: K(d) === "done",
                          active: K(d) === "active"
                        }])
                      },
                      [
                        e.createElementVNode("span", null, [
                          e.createElementVNode(
                            "i",
                            {
                              class: e.normalizeClass(K(d) === "done" ? "ri-check-line" : n.icon)
                            },
                            null,
                            2
                            /* CLASS */
                          )
                        ]),
                        e.createElementVNode(
                          "small",
                          null,
                          e.toDisplayString(t.$t(n.label)),
                          1
                          /* TEXT */
                        )
                      ],
                      2
                      /* CLASS */
                    ),
                    d < Ve.length - 1 ? (e.openBlock(), e.createElementBlock("i", ml)) : e.createCommentVNode("v-if", !0)
                  ],
                  64
                  /* STABLE_FRAGMENT */
                ))),
                64
                /* STABLE_FRAGMENT */
              ))
            ], 8, pl)
          ])
        ]),
        e.createElementVNode(
          "section",
          {
            class: e.normalizeClass(["job-progress-panel", `is-${e.unref(u)}`])
          },
          [
            e.createElementVNode("div", vl, [
              e.createElementVNode("div", fl, [
                e.createElementVNode("span", gl, [
                  e.createElementVNode(
                    "i",
                    {
                      class: e.normalizeClass(e.unref(u) === "running" ? "ri-loader-4-line spin" : e.unref(u) === "failed" ? "ri-error-warning-line" : Oe.value === 100 ? "ri-check-line" : "ri-time-line")
                    },
                    null,
                    2
                    /* CLASS */
                  )
                ]),
                e.createElementVNode("div", null, [
                  e.createElementVNode(
                    "strong",
                    null,
                    e.toDisplayString(ko.value),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "small",
                    null,
                    e.toDisplayString(e.unref(v)),
                    1
                    /* TEXT */
                  )
                ])
              ]),
              et.value ? (e.openBlock(), e.createElementBlock("div", Nl, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(t.$t("停在第 {p0} 步（共 {p1} 步）", { p0: xe.value, p1: e.unref(y).length })),
                  1
                  /* TEXT */
                )
              ])) : (e.openBlock(), e.createElementBlock("div", hl, [
                e.createElementVNode(
                  "strong",
                  null,
                  e.toDisplayString(Oe.value) + "%",
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(xe.value) + "/" + e.toDisplayString(e.unref(y).length) + " " + e.toDisplayString(t.$t("步骤完成")),
                  1
                  /* TEXT */
                ),
                Ct.value ? (e.openBlock(), e.createElementBlock(
                  "span",
                  bl,
                  e.toDisplayString(Ct.value),
                  1
                  /* TEXT */
                )) : e.createCommentVNode("v-if", !0)
              ])),
              e.createCommentVNode(" 直连成片跑着就能停：两条管线的取消通道都在（solution.cancelVideo / globalAdsRun.cancelSlideshow） "),
              Me.value ? (e.openBlock(), e.createElementBlock("button", {
                key: 2,
                type: "button",
                class: "job-stop-btn",
                disabled: le.value,
                onClick: o[0] || (o[0] = (n) => zo())
              }, [
                e.createElementVNode(
                  "i",
                  {
                    class: e.normalizeClass(le.value ? "ri-loader-4-line spin" : "ri-stop-circle-line")
                  },
                  null,
                  2
                  /* CLASS */
                ),
                e.createTextVNode(
                  e.toDisplayString(le.value ? t.$t("正在停止…") : t.$t("停止")),
                  1
                  /* TEXT */
                )
              ], 8, El)) : e.createCommentVNode("v-if", !0)
            ]),
            et.value ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock("div", {
              key: 0,
              class: "job-progress-track",
              role: "progressbar",
              "aria-valuenow": Oe.value,
              "aria-valuemin": "0",
              "aria-valuemax": "100"
            }, [
              e.createElementVNode(
                "i",
                {
                  style: e.normalizeStyle({ width: `${Oe.value}%` })
                },
                null,
                4
                /* STYLE */
              )
            ], 8, wl)),
            e.createElementVNode("div", yl, [
              (e.openBlock(), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(Ve, (n, d) => e.createElementVNode(
                  "div",
                  {
                    key: `progress-${n.label}`,
                    class: e.normalizeClass(["job-progress-stage", `is-${K(d)}`])
                  },
                  [
                    e.createElementVNode(
                      "i",
                      {
                        class: e.normalizeClass(K(d) === "done" ? "ri-checkbox-circle-fill" : K(d) === "active" ? "ri-loader-4-line spin" : "ri-circle-line")
                      },
                      null,
                      2
                      /* CLASS */
                    ),
                    e.createElementVNode(
                      "span",
                      null,
                      e.toDisplayString(t.$t(n.label)),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "small",
                      null,
                      e.toDisplayString(_o(d)),
                      1
                      /* TEXT */
                    )
                  ],
                  2
                  /* CLASS */
                )),
                64
                /* STABLE_FRAGMENT */
              ))
            ]),
            e.createCommentVNode(`
        三种必须有人处理的终态：失败 / 可能已超时 / 上次运行已中断。
        失败即终止：spinner 已由管线的收尾逻辑收掉；这里给原因与「重新生成」。
        超时由看门狗判（跑过预计的 3 倍或 10 分钟没进度），可「继续等待」或「重新生成」
        （重新生成会先取消还在跑的旧任务，等它退出再起，不堆僵尸子进程）。
      `),
            tt.value ? (e.openBlock(), e.createBlock(ol, {
              key: 1,
              state: tt.value.state,
              message: tt.value.message,
              "elapsed-sec": e.unref(W).elapsedSec.value,
              "estimate-sec": e.unref(F) || null,
              "since-heartbeat-sec": e.unref(W).sinceHeartbeatSec.value,
              busy: Ce.value,
              onRetry: o[1] || (o[1] = (n) => Fo()),
              onKeepWaiting: o[2] || (o[2] = (n) => e.unref(W).keepWaiting())
            }, null, 8, ["state", "message", "elapsed-sec", "estimate-sec", "since-heartbeat-sec", "busy"])) : e.createCommentVNode("v-if", !0)
          ],
          2
          /* CLASS */
        ),
        e.createCommentVNode(`
      发布确认就地弹在演示页上。以前这个确认只存在于全局待办中心，演示页只显示一行
      「等待发布确认」，用户在页面上找不到任何可点的东西，进度就永远停在最后一步。
    `),
        A.value ? (e.openBlock(), e.createElementBlock("section", Vl, [
          e.createElementVNode("header", Sl, [
            o[26] || (o[26] = e.createElementVNode(
              "span",
              { class: "publish-confirm-icon" },
              [
                e.createElementVNode("i", { class: "ri-shield-check-line" })
              ],
              -1
              /* CACHED */
            )),
            e.createElementVNode("div", null, [
              e.createElementVNode(
                "strong",
                null,
                e.toDisplayString(A.value?.nodeName || t.$t("发布前确认")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "small",
                null,
                e.toDisplayString(A.value?.question || t.$t("请确认各平台登录状态后再发布")),
                1
                /* TEXT */
              )
            ]),
            e.createElementVNode("button", {
              type: "button",
              class: "ghost-btn",
              disabled: J.value,
              onClick: Jt
            }, [
              o[25] || (o[25] = e.createElementVNode(
                "i",
                { class: "ri-refresh-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(t.$t("检测登录状态")),
                1
                /* TEXT */
              )
            ], 8, kl)
          ]),
          e.createElementVNode(
            "p",
            _l,
            e.toDisplayString(t.$t("不要求所有平台都已登录：只发布你勾选的平台，未勾选的会在回执里如实标注为未发布。登录一律在右侧内置浏览器完成。")),
            1
            /* TEXT */
          ),
          e.createElementVNode("ul", Dl, [
            (e.openBlock(!0), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(P.value, (n) => (e.openBlock(), e.createElementBlock("li", {
                key: `confirm-${n.id}`
              }, [
                e.createElementVNode("label", Tl, [
                  e.createElementVNode("input", {
                    type: "checkbox",
                    checked: O.value[n.id] !== !1,
                    onChange: (d) => O.value = { ...O.value, [n.id]: d.target.checked }
                  }, null, 40, Al),
                  e.createElementVNode(
                    "span",
                    Pl,
                    e.toDisplayString(n.label),
                    1
                    /* TEXT */
                  )
                ]),
                e.createElementVNode(
                  "span",
                  {
                    class: e.normalizeClass(["publish-confirm-state", `is-${k.value[n.id] || "unknown"}`])
                  },
                  [
                    k.value[n.id] === "checking" ? (e.openBlock(), e.createElementBlock(
                      e.Fragment,
                      { key: 0 },
                      [
                        o[27] || (o[27] = e.createElementVNode(
                          "i",
                          { class: "ri-loader-4-line spin" },
                          null,
                          -1
                          /* CACHED */
                        )),
                        e.createTextVNode(
                          e.toDisplayString(t.$t("检测中")),
                          1
                          /* TEXT */
                        )
                      ],
                      64
                      /* STABLE_FRAGMENT */
                    )) : k.value[n.id] === "ready" ? (e.openBlock(), e.createElementBlock(
                      e.Fragment,
                      { key: 1 },
                      [
                        o[28] || (o[28] = e.createElementVNode(
                          "i",
                          { class: "ri-checkbox-circle-fill" },
                          null,
                          -1
                          /* CACHED */
                        )),
                        e.createTextVNode(
                          e.toDisplayString(t.$t("已登录")),
                          1
                          /* TEXT */
                        )
                      ],
                      64
                      /* STABLE_FRAGMENT */
                    )) : k.value[n.id] === "absent" ? (e.openBlock(), e.createElementBlock(
                      e.Fragment,
                      { key: 2 },
                      [
                        o[29] || (o[29] = e.createElementVNode(
                          "i",
                          { class: "ri-error-warning-fill" },
                          null,
                          -1
                          /* CACHED */
                        )),
                        e.createTextVNode(
                          e.toDisplayString(t.$t("未登录")),
                          1
                          /* TEXT */
                        )
                      ],
                      64
                      /* STABLE_FRAGMENT */
                    )) : (e.openBlock(), e.createElementBlock(
                      e.Fragment,
                      { key: 3 },
                      [
                        o[30] || (o[30] = e.createElementVNode(
                          "i",
                          { class: "ri-question-line" },
                          null,
                          -1
                          /* CACHED */
                        )),
                        e.createTextVNode(
                          e.toDisplayString(t.$t("未检测")),
                          1
                          /* TEXT */
                        )
                      ],
                      64
                      /* STABLE_FRAGMENT */
                    ))
                  ],
                  2
                  /* CLASS */
                ),
                e.createElementVNode("button", {
                  type: "button",
                  class: "ghost-btn small",
                  onClick: (d) => qo(n.id)
                }, [
                  o[31] || (o[31] = e.createElementVNode(
                    "i",
                    { class: "ri-external-link-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(t.$t("去内置浏览器登录")),
                    1
                    /* TEXT */
                  )
                ], 8, $l)
              ]))),
              128
              /* KEYED_FRAGMENT */
            ))
          ]),
          e.createElementVNode("footer", Cl, [
            e.createElementVNode("span", Il, [
              e.createTextVNode(
                e.toDisplayString(t.$t("本次将发布 {count} 个平台", { count: Ne.value.length })) + " ",
                1
                /* TEXT */
              ),
              st.value.length ? (e.openBlock(), e.createElementBlock(
                e.Fragment,
                { key: 0 },
                [
                  e.createTextVNode(
                    " · " + e.toDisplayString(t.$t("跳过 {count} 个", { count: st.value.length })),
                    1
                    /* TEXT */
                  )
                ],
                64
                /* STABLE_FRAGMENT */
              )) : e.createCommentVNode("v-if", !0)
            ]),
            e.createElementVNode("button", {
              type: "button",
              class: "ghost-btn",
              disabled: J.value,
              onClick: o[3] || (o[3] = (n) => qt(!1))
            }, e.toDisplayString(t.$t("暂不发布并修改")), 9, Ll),
            e.createElementVNode("button", {
              type: "button",
              class: "primary-btn",
              disabled: J.value || !Ne.value.length,
              onClick: o[4] || (o[4] = (n) => qt(!0))
            }, [
              e.createElementVNode(
                "i",
                {
                  class: e.normalizeClass(J.value ? "ri-loader-4-line spin" : "ri-send-plane-fill")
                },
                null,
                2
                /* CLASS */
              ),
              e.createTextVNode(
                " " + e.toDisplayString(t.$t("确认并开始发布")),
                1
                /* TEXT */
              )
            ], 8, Ol)
          ])
        ])) : e.createCommentVNode("v-if", !0),
        e.createCommentVNode(" 发布在本页完成：预览、登录引导、确认提交、停止/继续与分平台回执（S17a） "),
        e.createVNode(tl, {
          "owner-path": lo,
          "focus-id": Tt.value,
          onChange: ho
        }, null, 8, ["focus-id"]),
        e.createElementVNode("section", Ml, [
          e.createElementVNode(
            "article",
            {
              class: e.normalizeClass(["model-card", `status-${ve.value.tone}`])
            },
            [
              o[34] || (o[34] = e.createElementVNode(
                "span",
                { class: "model-icon voice" },
                [
                  e.createElementVNode("i", { class: "ri-mic-line" })
                ],
                -1
                /* CACHED */
              )),
              e.createElementVNode("div", Bl, [
                e.createElementVNode("div", jl, [
                  e.createElementVNode(
                    "strong",
                    null,
                    e.toDisplayString(t.$t("TTS 配音")),
                    1
                    /* TEXT */
                  ),
                  o[32] || (o[32] = e.createElementVNode(
                    "span",
                    { class: "status-dot" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createElementVNode(
                    "em",
                    null,
                    e.toDisplayString(t.$t(ve.value.label)),
                    1
                    /* TEXT */
                  )
                ]),
                e.createElementVNode(
                  "p",
                  null,
                  e.toDisplayString(ve.value.detail),
                  1
                  /* TEXT */
                )
              ]),
              e.createElementVNode("button", {
                class: "model-action",
                onClick: o[5] || (o[5] = (n) => je("tts"))
              }, [
                e.createTextVNode(
                  e.toDisplayString(ve.value.tone === "ready" ? t.$t("查看配置") : t.$t("去配置")),
                  1
                  /* TEXT */
                ),
                o[33] || (o[33] = e.createElementVNode(
                  "i",
                  { class: "ri-arrow-right-line" },
                  null,
                  -1
                  /* CACHED */
                ))
              ])
            ],
            2
            /* CLASS */
          ),
          e.createElementVNode(
            "article",
            {
              class: e.normalizeClass(["model-card", `status-${H.value.tone}`])
            },
            [
              o[38] || (o[38] = e.createElementVNode(
                "span",
                { class: "model-icon video" },
                [
                  e.createElementVNode("i", { class: "ri-movie-2-line" })
                ],
                -1
                /* CACHED */
              )),
              e.createElementVNode("div", Rl, [
                e.createElementVNode("div", Wl, [
                  o[35] || (o[35] = e.createElementVNode(
                    "strong",
                    null,
                    "fal · MiniMax",
                    -1
                    /* CACHED */
                  )),
                  o[36] || (o[36] = e.createElementVNode(
                    "span",
                    { class: "status-dot" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createElementVNode(
                    "em",
                    null,
                    e.toDisplayString(t.$t(H.value.label)),
                    1
                    /* TEXT */
                  )
                ]),
                e.createElementVNode(
                  "p",
                  null,
                  e.toDisplayString(H.value.detail),
                  1
                  /* TEXT */
                )
              ]),
              e.createElementVNode("button", {
                class: "model-action",
                onClick: o[6] || (o[6] = (n) => je("video"))
              }, [
                e.createTextVNode(
                  e.toDisplayString(H.value.tone === "ready" ? t.$t("查看配置") : t.$t("去配置")),
                  1
                  /* TEXT */
                ),
                o[37] || (o[37] = e.createElementVNode(
                  "i",
                  { class: "ri-arrow-right-line" },
                  null,
                  -1
                  /* CACHED */
                ))
              ])
            ],
            2
            /* CLASS */
          ),
          e.createElementVNode("button", {
            class: "refresh-models",
            title: t.$t("刷新配置状态"),
            disabled: j.value,
            onClick: lt
          }, [
            e.createElementVNode(
              "i",
              {
                class: e.normalizeClass(j.value ? "ri-loader-4-line spin" : "ri-refresh-line")
              },
              null,
              2
              /* CLASS */
            )
          ], 8, Kl)
        ]),
        e.createElementVNode("div", zl, [
          e.createElementVNode("main", Fl, [
            e.createElementVNode("section", Ul, [
              e.createElementVNode("div", Jl, [
                o[40] || (o[40] = e.createElementVNode(
                  "span",
                  { class: "section-index" },
                  "01",
                  -1
                  /* CACHED */
                )),
                e.createElementVNode("div", null, [
                  e.createElementVNode(
                    "h2",
                    null,
                    e.toDisplayString(t.$t("告诉 AI 这条视频要做什么")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "p",
                    null,
                    e.toDisplayString(t.$t("素材目录和内容目标会一起交给视频 Skill；资料不全时，Agent 会先在对话里补问。")),
                    1
                    /* TEXT */
                  )
                ]),
                e.createElementVNode("button", {
                  class: "demo-preset-button",
                  type: "button",
                  onClick: mo
                }, [
                  o[39] || (o[39] = e.createElementVNode(
                    "i",
                    { class: "ri-lightbulb-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(t.$t("载入推荐方案")),
                    1
                    /* TEXT */
                  )
                ])
              ]),
              e.createElementVNode("div", ql, [
                e.createElementVNode("label", Hl, [
                  e.createElementVNode(
                    "span",
                    null,
                    e.toDisplayString(t.$t("项目名称")),
                    1
                    /* TEXT */
                  ),
                  e.withDirectives(e.createElementVNode("input", {
                    "onUpdate:modelValue": o[7] || (o[7] = (n) => r.projectName = n),
                    placeholder: t.$t("例如：新品推广短视频"),
                    maxlength: "80"
                  }, null, 8, Yl), [
                    [
                      e.vModelText,
                      r.projectName,
                      void 0,
                      { trim: !0 }
                    ]
                  ])
                ]),
                e.createElementVNode("label", Gl, [
                  e.createElementVNode(
                    "span",
                    null,
                    e.toDisplayString(t.$t("品牌 / 门店")),
                    1
                    /* TEXT */
                  ),
                  e.withDirectives(e.createElementVNode("input", {
                    "onUpdate:modelValue": o[8] || (o[8] = (n) => r.brandName = n),
                    placeholder: t.$t("填写品牌或门店名称"),
                    maxlength: "80"
                  }, null, 8, Ql), [
                    [
                      e.vModelText,
                      r.brandName,
                      void 0,
                      { trim: !0 }
                    ],
                    [a, "brand"]
                  ])
                ])
              ]),
              e.createElementVNode("label", Zl, [
                e.createElementVNode("span", null, [
                  e.createTextVNode(
                    e.toDisplayString(t.$t("素材文件夹")) + " ",
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "b",
                    null,
                    e.toDisplayString(t.$t("必填")),
                    1
                    /* TEXT */
                  )
                ]),
                e.createElementVNode("div", Xl, [
                  o[41] || (o[41] = e.createElementVNode(
                    "i",
                    { class: "ri-folder-video-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.withDirectives(e.createElementVNode("input", {
                    "onUpdate:modelValue": o[9] || (o[9] = (n) => r.materialDir = n),
                    placeholder: t.$t("选择包含图片、原视频或音频的文件夹")
                  }, null, 8, xl), [
                    [
                      e.vModelText,
                      r.materialDir,
                      void 0,
                      { trim: !0 }
                    ]
                  ]),
                  e.createElementVNode(
                    "button",
                    {
                      type: "button",
                      onClick: Bt
                    },
                    e.toDisplayString(t.$t("选择文件夹")),
                    1
                    /* TEXT */
                  )
                ])
              ]),
              e.createElementVNode("label", en, [
                e.createElementVNode("span", tn, [
                  e.createElementVNode("span", null, [
                    e.createTextVNode(
                      e.toDisplayString(t.$t("内容目标与关键信息")) + " ",
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "b",
                      null,
                      e.toDisplayString(t.$t("必填")),
                      1
                      /* TEXT */
                    )
                  ]),
                  e.createElementVNode("button", {
                    type: "button",
                    disabled: x.value || !r.brief.trim(),
                    onClick: e.withModifiers(Co, ["prevent"])
                  }, [
                    e.createElementVNode(
                      "i",
                      {
                        class: e.normalizeClass(x.value ? "ri-loader-4-line spin" : "ri-edit-2-line")
                      },
                      null,
                      2
                      /* CLASS */
                    ),
                    e.createTextVNode(
                      " " + e.toDisplayString(x.value ? t.$t("AI 润色中… {p0}", { p0: go.value }) : t.$t("AI 润色视频提示词")),
                      1
                      /* TEXT */
                    )
                  ], 8, on)
                ]),
                e.withDirectives(e.createElementVNode("textarea", {
                  "onUpdate:modelValue": o[10] || (o[10] = (n) => r.brief = n),
                  rows: "5",
                  maxlength: "3000",
                  placeholder: t.$t("写清楚产品卖点、价格、门店位置、目标人群、活动时间和希望观众采取的行动。")
                }, null, 8, ln), [
                  [e.vModelText, r.brief],
                  [a, "main_business"]
                ]),
                e.createElementVNode(
                  "small",
                  null,
                  e.toDisplayString(r.brief.length) + "/3000",
                  1
                  /* TEXT */
                )
              ])
            ]),
            e.createElementVNode("section", nn, [
              e.createElementVNode("div", an, [
                o[42] || (o[42] = e.createElementVNode(
                  "span",
                  { class: "section-index" },
                  "02",
                  -1
                  /* CACHED */
                )),
                e.createElementVNode("div", null, [
                  e.createElementVNode(
                    "h2",
                    null,
                    e.toDisplayString(t.$t("选择成片方式")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "p",
                    null,
                    e.toDisplayString(t.$t("不确定就选“AI 自动判断”；需要生成动态镜头时选 fal 动态视频。")),
                    1
                    /* TEXT */
                  )
                ])
              ]),
              e.createElementVNode("div", rn, [
                (e.openBlock(), e.createElementBlock(
                  e.Fragment,
                  null,
                  e.renderList(yt, (n) => e.createElementVNode("button", {
                    key: n.id,
                    type: "button",
                    class: e.normalizeClass(["choice-card", { active: r.productionMode === n.id, unavailable: n.id === "seedance" && !Be.value }]),
                    disabled: n.id === "seedance" && !Be.value,
                    title: n.id === "seedance" && !Be.value ? t.$t("动态视频需要 fal 密钥或管理员为此方案开通媒体服务") : "",
                    onClick: (d) => Ao(n.id)
                  }, [
                    e.createElementVNode("span", dn, [
                      e.createElementVNode(
                        "i",
                        {
                          class: e.normalizeClass(n.icon)
                        },
                        null,
                        2
                        /* CLASS */
                      )
                    ]),
                    e.createElementVNode(
                      "strong",
                      null,
                      e.toDisplayString(t.$t(n.label)),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "small",
                      null,
                      e.toDisplayString(n.desc),
                      1
                      /* TEXT */
                    ),
                    o[43] || (o[43] = e.createElementVNode(
                      "i",
                      { class: "ri-checkbox-circle-fill choice-check" },
                      null,
                      -1
                      /* CACHED */
                    ))
                  ], 10, sn)),
                  64
                  /* STABLE_FRAGMENT */
                ))
              ]),
              e.createElementVNode("label", cn, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(t.$t("成片比例")),
                  1
                  /* TEXT */
                ),
                e.withDirectives(e.createElementVNode(
                  "select",
                  {
                    "onUpdate:modelValue": o[11] || (o[11] = (n) => r.aspectRatio = n)
                  },
                  [
                    e.createElementVNode(
                      "option",
                      un,
                      e.toDisplayString(t.$t("9:16（竖屏短视频）")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "option",
                      pn,
                      e.toDisplayString(t.$t("16:9（横屏视频）")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "option",
                      mn,
                      e.toDisplayString(t.$t("1:1（方形）")),
                      1
                      /* TEXT */
                    ),
                    o[44] || (o[44] = e.createElementVNode(
                      "option",
                      { value: "4:3" },
                      "4:3",
                      -1
                      /* CACHED */
                    ))
                  ],
                  512
                  /* NEED_PATCH */
                ), [
                  [e.vModelSelect, r.aspectRatio]
                ])
              ]),
              r.productionMode === "seedance" && !j.value && H.value.tone === "missing" ? (e.openBlock(), e.createElementBlock("div", vn, [
                o[45] || (o[45] = e.createElementVNode(
                  "i",
                  { class: "ri-alert-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(t.$t("动态视频通道尚未接入，请配置 fal 密钥或联系管理员开通。")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "button",
                  {
                    type: "button",
                    onClick: o[12] || (o[12] = (n) => je("video"))
                  },
                  e.toDisplayString(t.$t("配置视频通道")),
                  1
                  /* TEXT */
                )
              ])) : e.createCommentVNode("v-if", !0)
            ]),
            e.createElementVNode("section", fn, [
              e.createElementVNode("div", gn, [
                o[46] || (o[46] = e.createElementVNode(
                  "span",
                  { class: "section-index" },
                  "03",
                  -1
                  /* CACHED */
                )),
                e.createElementVNode("div", null, [
                  e.createElementVNode(
                    "h2",
                    null,
                    e.toDisplayString(t.$t("配音与配乐")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "p",
                    null,
                    e.toDisplayString(t.$t("TTS 负责旁白，BGM 会按视频节奏自动混音并避让人声。")),
                    1
                    /* TEXT */
                  )
                ])
              ]),
              e.createElementVNode("div", hn, [
                e.createElementVNode("label", bn, [
                  e.createElementVNode("span", Nn, [
                    o[47] || (o[47] = e.createElementVNode(
                      "i",
                      { class: "ri-mic-line" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createElementVNode("span", null, [
                      e.createElementVNode(
                        "strong",
                        null,
                        e.toDisplayString(t.$t("生成 AI 旁白")),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "small",
                        null,
                        e.toDisplayString(t.$t("使用 AI 模型配置中的默认 TTS")),
                        1
                        /* TEXT */
                      )
                    ])
                  ]),
                  e.withDirectives(e.createElementVNode(
                    "input",
                    {
                      "onUpdate:modelValue": o[13] || (o[13] = (n) => r.voiceover = n),
                      type: "checkbox"
                    },
                    null,
                    512
                    /* NEED_PATCH */
                  ), [
                    [e.vModelCheckbox, r.voiceover]
                  ]),
                  o[48] || (o[48] = e.createElementVNode(
                    "span",
                    { class: "switch" },
                    null,
                    -1
                    /* CACHED */
                  ))
                ]),
                e.createElementVNode("label", En, [
                  e.createElementVNode(
                    "span",
                    null,
                    e.toDisplayString(t.$t("配乐情绪")),
                    1
                    /* TEXT */
                  ),
                  e.withDirectives(e.createElementVNode(
                    "select",
                    {
                      "onUpdate:modelValue": o[14] || (o[14] = (n) => r.bgmMood = n)
                    },
                    [
                      (e.openBlock(), e.createElementBlock(
                        e.Fragment,
                        null,
                        e.renderList(Vt, (n) => e.createElementVNode("option", {
                          key: n.id,
                          value: n.id
                        }, e.toDisplayString(t.$t(n.label)), 9, wn)),
                        64
                        /* STABLE_FRAGMENT */
                      ))
                    ],
                    512
                    /* NEED_PATCH */
                  ), [
                    [e.vModelSelect, r.bgmMood]
                  ])
                ])
              ]),
              r.voiceover ? (e.openBlock(), e.createElementBlock("label", yn, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(t.$t("旁白语气")),
                  1
                  /* TEXT */
                ),
                e.withDirectives(e.createElementVNode("input", {
                  "onUpdate:modelValue": o[15] || (o[15] = (n) => r.voiceStyle = n),
                  placeholder: t.$t("例如：自然亲切、语速稍快、重点词有力量"),
                  maxlength: "160"
                }, null, 8, Vn), [
                  [
                    e.vModelText,
                    r.voiceStyle,
                    void 0,
                    { trim: !0 }
                  ]
                ])
              ])) : e.createCommentVNode("v-if", !0),
              r.voiceover && !j.value && ve.value.tone === "missing" ? (e.openBlock(), e.createElementBlock("div", Sn, [
                o[49] || (o[49] = e.createElementVNode(
                  "i",
                  { class: "ri-alert-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(t.$t("还没有可用的默认 TTS，建议先完成配音引擎配置。")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "button",
                  {
                    type: "button",
                    onClick: o[16] || (o[16] = (n) => je("tts"))
                  },
                  e.toDisplayString(t.$t("配置 TTS")),
                  1
                  /* TEXT */
                )
              ])) : e.createCommentVNode("v-if", !0)
            ]),
            e.createElementVNode("section", kn, [
              e.createElementVNode("div", _n, [
                o[50] || (o[50] = e.createElementVNode(
                  "span",
                  { class: "section-index" },
                  "04",
                  -1
                  /* CACHED */
                )),
                e.createElementVNode("div", null, [
                  e.createElementVNode(
                    "h2",
                    null,
                    e.toDisplayString(t.$t("选择发布平台")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "p",
                    null,
                    e.toDisplayString(t.$t("同一条内容会按各平台标题、正文、标签和封面规则分别生成，不直接复制粘贴。")),
                    1
                    /* TEXT */
                  )
                ])
              ]),
              e.createElementVNode("div", Dn, [
                (e.openBlock(!0), e.createElementBlock(
                  e.Fragment,
                  null,
                  e.renderList(e.unref(Fe), (n) => (e.openBlock(), e.createElementBlock(
                    "label",
                    {
                      key: n.id,
                      class: e.normalizeClass(["platform-card", n.id, { active: r.platforms.includes(n.id) }])
                    },
                    [
                      e.createElementVNode("input", {
                        type: "checkbox",
                        checked: r.platforms.includes(n.id),
                        onChange: (d) => Po(n.id)
                      }, null, 40, Tn),
                      e.createElementVNode(
                        "span",
                        An,
                        e.toDisplayString(n.mark),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode("span", null, [
                        e.createElementVNode(
                          "strong",
                          null,
                          e.toDisplayString(t.$t(n.label)),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "small",
                          null,
                          e.toDisplayString(t.$t(n.desc)),
                          1
                          /* TEXT */
                        )
                      ]),
                      o[51] || (o[51] = e.createElementVNode(
                        "i",
                        { class: "ri-checkbox-circle-fill" },
                        null,
                        -1
                        /* CACHED */
                      ))
                    ],
                    2
                    /* CLASS */
                  ))),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ]),
              e.createElementVNode("div", Pn, [
                e.createElementVNode("div", $n, [
                  e.createElementVNode("div", null, [
                    e.createElementVNode(
                      "strong",
                      null,
                      e.toDisplayString(t.$t("发布话题")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "small",
                      null,
                      e.toDisplayString(t.$t("每个平台可以单独调整；输入时可省略 #，系统会自动补齐。")),
                      1
                      /* TEXT */
                    )
                  ]),
                  e.createElementVNode("span", null, [
                    o[52] || (o[52] = e.createElementVNode(
                      "i",
                      { class: "ri-hashtag" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createTextVNode(
                      e.toDisplayString(t.$t("发布前可修改")),
                      1
                      /* TEXT */
                    )
                  ])
                ]),
                e.createElementVNode("div", Cn, [
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(P.value, (n) => (e.openBlock(), e.createElementBlock("label", {
                      key: `topic-${n.id}`,
                      class: "topic-field"
                    }, [
                      e.createElementVNode("span", null, [
                        e.createElementVNode(
                          "b",
                          {
                            class: e.normalizeClass(["topic-mark", n.id])
                          },
                          e.toDisplayString(n.mark),
                          3
                          /* TEXT, CLASS */
                        ),
                        e.createTextVNode(
                          e.toDisplayString(t.$t(n.label)),
                          1
                          /* TEXT */
                        )
                      ]),
                      e.withDirectives(e.createElementVNode("input", {
                        "onUpdate:modelValue": (d) => r.topics[n.id] = d,
                        placeholder: t.$t("#话题1 #话题2"),
                        maxlength: "240"
                      }, null, 8, In), [
                        [e.vModelText, r.topics[n.id]]
                      ])
                    ]))),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ])
              ]),
              e.createElementVNode("div", Ln, [
                o[53] || (o[53] = e.createElementVNode(
                  "i",
                  { class: "ri-shield-check-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createElementVNode("div", null, [
                  e.createElementVNode(
                    "strong",
                    null,
                    e.toDisplayString(t.$t("先审核，再公开发布")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "p",
                    null,
                    e.toDisplayString(t.$t("任务默认生成成片、四平台文案并完成发布前校验。只有你在人工确认弹窗中批准后，Agent 才会执行公开发布。")),
                    1
                    /* TEXT */
                  )
                ])
              ])
            ]),
            e.createElementVNode("div", On, [
              e.createElementVNode("div", Mn, [
                e.createElementVNode(
                  "strong",
                  null,
                  e.toDisplayString(me.value || t.$t("尚未选择平台")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(Qe.value) + " · " + e.toDisplayString(r.aspectRatio) + " · " + e.toDisplayString(r.voiceover ? t.$t("含配音") : t.$t("不配音")) + " · " + e.toDisplayString(Le.value),
                  1
                  /* TEXT */
                )
              ]),
              e.createElementVNode("div", Bn, [
                S.value ? (e.openBlock(), e.createElementBlock("button", {
                  key: 0,
                  class: "publish-video-button",
                  type: "button",
                  disabled: w.value,
                  onClick: Ee
                }, [
                  e.createElementVNode(
                    "i",
                    {
                      class: e.normalizeClass(w.value ? "ri-loader-4-line spin" : q.value ? "ri-refresh-line" : "ri-send-plane-fill")
                    },
                    null,
                    2
                    /* CLASS */
                  ),
                  e.createElementVNode(
                    "span",
                    null,
                    e.toDisplayString(w.value && te.value ? te.value : q.value ? t.$t("再次发布") : t.$t("准备发布")),
                    1
                    /* TEXT */
                  )
                ], 8, jn)) : e.createCommentVNode("v-if", !0),
                e.createElementVNode("button", {
                  class: "local-preview-button",
                  type: "button",
                  disabled: !S.value,
                  title: S.value ? i.videoPath : t.$t("成片生成到本地后可预览"),
                  onClick: Qt
                }, [
                  o[54] || (o[54] = e.createElementVNode(
                    "i",
                    { class: "ri-video-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(t.$t("预览本地成片")),
                    1
                    /* TEXT */
                  )
                ], 8, Rn),
                e.createElementVNode("button", {
                  class: "start-button",
                  disabled: !It.value || C.value,
                  onClick: o[17] || (o[17] = (n) => X.value = !0)
                }, [
                  o[55] || (o[55] = e.createElementVNode(
                    "i",
                    { class: "ri-eye-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    " " + e.toDisplayString(t.$t("先预览制作方案")),
                    1
                    /* TEXT */
                  )
                ], 8, Wn)
              ])
            ])
          ]),
          e.createElementVNode("aside", Kn, [
            e.createElementVNode("section", zn, [
              e.createElementVNode("div", Fn, [
                o[57] || (o[57] = e.createElementVNode(
                  "span",
                  null,
                  [
                    e.createElementVNode("i", { class: "ri-movie-2-line" })
                  ],
                  -1
                  /* CACHED */
                )),
                e.createElementVNode("div", null, [
                  e.createElementVNode(
                    "strong",
                    null,
                    e.toDisplayString(t.$t("视频 Skill 会自动完成")),
                    1
                    /* TEXT */
                  ),
                  o[56] || (o[56] = e.createElementVNode(
                    "small",
                    null,
                    "totalclaw-video-studio",
                    -1
                    /* CACHED */
                  ))
                ])
              ]),
              e.createElementVNode("ol", Un, [
                e.createElementVNode("li", null, [
                  o[58] || (o[58] = e.createElementVNode(
                    "i",
                    { class: "ri-file-search-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createElementVNode("span", null, [
                    e.createElementVNode(
                      "strong",
                      null,
                      e.toDisplayString(t.$t("读取与筛选素材")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "small",
                      null,
                      e.toDisplayString(t.$t("图片、视频、音频统一整理")),
                      1
                      /* TEXT */
                    )
                  ])
                ]),
                e.createElementVNode("li", null, [
                  o[59] || (o[59] = e.createElementVNode(
                    "i",
                    { class: "ri-quill-pen-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createElementVNode("span", null, [
                    e.createElementVNode(
                      "strong",
                      null,
                      e.toDisplayString(t.$t("脚本与平台文案")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "small",
                      null,
                      e.toDisplayString(t.$t("钩子、字幕、标题、正文和标签")),
                      1
                      /* TEXT */
                    )
                  ])
                ]),
                e.createElementVNode("li", null, [
                  o[60] || (o[60] = e.createElementVNode(
                    "i",
                    { class: "ri-scissors-cut-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createElementVNode("span", null, [
                    e.createElementVNode(
                      "strong",
                      null,
                      e.toDisplayString(t.$t("剪辑、配音和配乐")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "small",
                      null,
                      e.toDisplayString(t.$t("按任务比例成片、字幕烧录与人声避让")),
                      1
                      /* TEXT */
                    )
                  ])
                ]),
                e.createElementVNode("li", null, [
                  o[61] || (o[61] = e.createElementVNode(
                    "i",
                    { class: "ri-send-plane-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createElementVNode("span", null, [
                    e.createElementVNode(
                      "strong",
                      null,
                      e.toDisplayString(t.$t("审核后分平台发布")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "small",
                      null,
                      e.toDisplayString(t.$t("扫码登录、风险熔断、结果留痕")),
                      1
                      /* TEXT */
                    )
                  ])
                ])
              ])
            ]),
            S.value || i.conversationId ? (e.openBlock(), e.createElementBlock("section", Jn, [
              e.createElementVNode("span", qn, [
                o[62] || (o[62] = e.createElementVNode(
                  "i",
                  { class: "ri-history-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(t.$t("最近一次制作任务")),
                  1
                  /* TEXT */
                )
              ]),
              e.createElementVNode(
                "h3",
                null,
                e.toDisplayString(S.value ? t.$t("本次成片已就绪") : t.$t("最近一次短视频制作")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "p",
                null,
                e.toDisplayString(S.value ? t.$t("本次制作产出的成片可立即播放审核，并继续进入多平台发布流程。") : t.$t("任务已经交给 AI。制作过程、缺失信息补问和发布确认都在这条对话里继续。")),
                1
                /* TEXT */
              ),
              e.createElementVNode("div", Hn, [
                i.conversationId ? (e.openBlock(), e.createElementBlock("button", {
                  key: 0,
                  type: "button",
                  onClick: Go
                }, [
                  o[63] || (o[63] = e.createElementVNode(
                    "i",
                    { class: "ri-chat-3-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(t.$t("查看制作进度")),
                    1
                    /* TEXT */
                  )
                ])) : e.createCommentVNode("v-if", !0),
                S.value ? (e.openBlock(), e.createElementBlock("button", {
                  key: 1,
                  class: "job-publish-button",
                  type: "button",
                  disabled: w.value,
                  onClick: Ee
                }, [
                  e.createElementVNode(
                    "i",
                    {
                      class: e.normalizeClass(w.value ? "ri-loader-4-line spin" : q.value ? "ri-refresh-line" : "ri-send-plane-fill")
                    },
                    null,
                    2
                    /* CLASS */
                  ),
                  e.createElementVNode(
                    "span",
                    null,
                    e.toDisplayString(w.value && te.value ? te.value : q.value ? t.$t("再次发布") : t.$t("准备发布")),
                    1
                    /* TEXT */
                  )
                ], 8, Yn)) : e.createCommentVNode("v-if", !0),
                e.createElementVNode("button", {
                  class: "job-preview-button",
                  type: "button",
                  disabled: !S.value,
                  title: S.value ? i.videoPath : t.$t("等待工作流生成本地成片"),
                  onClick: Qt
                }, [
                  o[64] || (o[64] = e.createElementVNode(
                    "i",
                    { class: "ri-play-circle-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(t.$t("预览成片")),
                    1
                    /* TEXT */
                  )
                ], 8, Gn)
              ])
            ])) : e.createCommentVNode("v-if", !0),
            fe.value.length ? (e.openBlock(), e.createElementBlock("section", Qn, [
              e.createElementVNode("span", Zn, [
                o[65] || (o[65] = e.createElementVNode(
                  "i",
                  { class: "ri-history-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(t.$t("制作历史")),
                  1
                  /* TEXT */
                )
              ]),
              e.createElementVNode(
                "h3",
                null,
                e.toDisplayString(t.$t("共 {count} 条", { count: fe.value.length })),
                1
                /* TEXT */
              ),
              e.createElementVNode("ul", Xn, [
                (e.openBlock(!0), e.createElementBlock(
                  e.Fragment,
                  null,
                  e.renderList(Bo.value, (n) => (e.openBlock(), e.createElementBlock("li", {
                    key: n.taskId,
                    class: "history-item"
                  }, [
                    e.createElementVNode("div", xn, [
                      e.createElementVNode("strong", {
                        title: n.projectName
                      }, e.toDisplayString(n.projectName), 9, ea),
                      e.createElementVNode(
                        "small",
                        null,
                        e.toDisplayString(Ro(n.createdAt)),
                        1
                        /* TEXT */
                      )
                    ]),
                    e.createElementVNode(
                      "span",
                      {
                        class: e.normalizeClass(["history-status", `is-${n.status}`])
                      },
                      e.toDisplayString(jo(n.status)),
                      3
                      /* TEXT, CLASS */
                    ),
                    e.createElementVNode("button", {
                      type: "button",
                      class: "history-publish",
                      disabled: w.value || !n.videoPath,
                      title: n.videoPath || t.$t("这条任务还没有产出成片"),
                      onClick: (d) => Wo(n)
                    }, [
                      o[66] || (o[66] = e.createElementVNode(
                        "i",
                        { class: "ri-send-plane-line" },
                        null,
                        -1
                        /* CACHED */
                      )),
                      e.createTextVNode(
                        e.toDisplayString(t.$t("去发布")),
                        1
                        /* TEXT */
                      )
                    ], 8, ta)
                  ]))),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ]),
              ge.value > 1 ? (e.openBlock(), e.createElementBlock("footer", oa, [
                e.createElementVNode("button", {
                  type: "button",
                  disabled: M.value === 0,
                  onClick: o[18] || (o[18] = (n) => M.value -= 1)
                }, [...o[67] || (o[67] = [
                  e.createElementVNode(
                    "i",
                    { class: "ri-arrow-left-s-line" },
                    null,
                    -1
                    /* CACHED */
                  )
                ])], 8, la),
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(M.value + 1) + " / " + e.toDisplayString(ge.value),
                  1
                  /* TEXT */
                ),
                e.createElementVNode("button", {
                  type: "button",
                  disabled: M.value >= ge.value - 1,
                  onClick: o[19] || (o[19] = (n) => M.value += 1)
                }, [...o[68] || (o[68] = [
                  e.createElementVNode(
                    "i",
                    { class: "ri-arrow-right-s-line" },
                    null,
                    -1
                    /* CACHED */
                  )
                ])], 8, na)
              ])) : e.createCommentVNode("v-if", !0)
            ])) : e.createCommentVNode("v-if", !0),
            e.createElementVNode("section", aa, [
              e.createElementVNode("span", ia, [
                o[69] || (o[69] = e.createElementVNode(
                  "i",
                  { class: "ri-lightbulb-flash-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(t.$t("出片更稳的素材建议")),
                  1
                  /* TEXT */
                )
              ]),
              e.createElementVNode("ul", null, [
                e.createElementVNode(
                  "li",
                  null,
                  e.toDisplayString(t.$t("至少准备 6 张清晰图片，或 3 段以上原视频")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "li",
                  null,
                  e.toDisplayString(t.$t("首张图尽量有主体和视觉冲击力，将作为封面候选")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "li",
                  null,
                  e.toDisplayString(t.$t("价格、地点、营业时间等事实要写进内容目标，避免 AI 猜测")),
                  1
                  /* TEXT */
                )
              ])
            ])
          ])
        ]),
        e.createCommentVNode(` F5：预览遮罩必须 Teleport 到 body——留在视图 DOM 里会被祖先的 transform/filter/backdrop-filter
         困进局部堆叠上下文（fixed 退化成「相对该祖先」定位 + z-index 出不去），实测盖不住/被盖。
         backdrop 带 role="dialog" 供原生浏览器避让锁（nativeBrowserModalLock.invariant.test.ts）。 `),
        (e.openBlock(), e.createBlock(e.Teleport, { to: "body" }, [
          X.value ? (e.openBlock(), e.createElementBlock("div", {
            key: 0,
            role: "dialog",
            class: "preview-backdrop",
            onClick: o[22] || (o[22] = e.withModifiers((n) => X.value = !1, ["self"]))
          }, [
            e.createElementVNode("section", {
              class: "preview-dialog",
              role: "dialog",
              "aria-modal": "true",
              "aria-label": t.$t("制作方案预览")
            }, [
              e.createElementVNode("header", sa, [
                e.createElementVNode("div", null, [
                  e.createElementVNode("span", null, [
                    o[70] || (o[70] = e.createElementVNode(
                      "i",
                      { class: "ri-shield-check-line" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createTextVNode(
                      e.toDisplayString(t.$t("审核后再创建任务")),
                      1
                      /* TEXT */
                    )
                  ]),
                  e.createElementVNode(
                    "h2",
                    null,
                    e.toDisplayString(t.$t("制作方案预览")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "p",
                    null,
                    e.toDisplayString(t.$t("下面是即将交给视频 Skill 的完整指令；确认后才会登记到工作区并启动制作。")),
                    1
                    /* TEXT */
                  )
                ]),
                e.createElementVNode("button", {
                  type: "button",
                  "aria-label": t.$t("关闭"),
                  onClick: o[20] || (o[20] = (n) => X.value = !1)
                }, [...o[71] || (o[71] = [
                  e.createElementVNode(
                    "i",
                    { class: "ri-close-line" },
                    null,
                    -1
                    /* CACHED */
                  )
                ])], 8, da)
              ]),
              e.createElementVNode("div", ca, [
                e.createElementVNode("span", null, [
                  e.createElementVNode(
                    "strong",
                    null,
                    e.toDisplayString(r.projectName || t.$t("未命名项目")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "small",
                    null,
                    e.toDisplayString(r.brandName || t.$t("未填写品牌")),
                    1
                    /* TEXT */
                  )
                ]),
                e.createElementVNode("span", null, [
                  e.createElementVNode(
                    "strong",
                    null,
                    e.toDisplayString(Qe.value),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "small",
                    null,
                    e.toDisplayString(r.aspectRatio) + " · " + e.toDisplayString(me.value),
                    1
                    /* TEXT */
                  )
                ]),
                e.createElementVNode("span", null, [
                  e.createElementVNode(
                    "strong",
                    null,
                    e.toDisplayString(r.voiceover ? t.$t("包含 AI 配音") : t.$t("不生成配音")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "small",
                    null,
                    e.toDisplayString(Le.value),
                    1
                    /* TEXT */
                  )
                ])
              ]),
              r.materialDir.trim() ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock("div", ua, [
                o[72] || (o[72] = e.createElementVNode(
                  "i",
                  { class: "ri-folder-warning-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(t.$t("未选择素材文件夹时，将直接复用已生成的演示成片进入审核。")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "button",
                  {
                    type: "button",
                    onClick: Bt
                  },
                  e.toDisplayString(t.$t("选择素材文件夹")),
                  1
                  /* TEXT */
                )
              ])),
              e.createElementVNode("div", pa, [
                r.productionMode === "seedance" ? (e.openBlock(), e.createElementBlock(
                  e.Fragment,
                  { key: 0 },
                  [
                    e.createElementVNode(
                      "strong",
                      null,
                      e.toDisplayString(t.$t("视频生成费用预估")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "span",
                      null,
                      e.toDisplayString(t.$t("按 {shots} 个镜头、共 {seconds} 秒估算", { shots: Z.value.shots, seconds: Z.value.seconds })) + " · " + e.toDisplayString(Z.value.model),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "span",
                      null,
                      e.toDisplayString(Z.value.usd == null ? t.$t("当前模型暂无价格，费用未知") : t.$t("约 US$ {cost}", { cost: Z.value.usd.toFixed(2) })),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "small",
                      null,
                      e.toDisplayString(t.$t("视频按秒计费，不按文字 token 计费；此预估不含文字策划、配音与重生成，实际账单以服务商为准。")),
                      1
                      /* TEXT */
                    ),
                    Z.value.inferred ? (e.openBlock(), e.createElementBlock(
                      "small",
                      ma,
                      e.toDisplayString(t.$t("内容目标未写明时长，本次按 15 秒估算。")),
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
                    e.createElementVNode(
                      "strong",
                      null,
                      e.toDisplayString(t.$t("本地图片成片：视频生成费用为 0")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "small",
                      null,
                      e.toDisplayString(t.$t("文字策划、云端配音及发布流程中的 AI 调用另计。")),
                      1
                      /* TEXT */
                    )
                  ],
                  64
                  /* STABLE_FRAGMENT */
                ))
              ]),
              e.createElementVNode(
                "pre",
                va,
                e.toDisplayString(Lo.value),
                1
                /* TEXT */
              ),
              e.createElementVNode("footer", fa, [
                e.createElementVNode(
                  "button",
                  {
                    class: "preview-cancel",
                    type: "button",
                    onClick: o[21] || (o[21] = (n) => X.value = !1)
                  },
                  e.toDisplayString(t.$t("返回修改")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode("button", {
                  class: "preview-confirm",
                  type: "button",
                  disabled: !Ze.value || C.value,
                  onClick: Mo
                }, [
                  e.createElementVNode(
                    "i",
                    {
                      class: e.normalizeClass(C.value ? "ri-loader-4-line spin" : "ri-check-line")
                    },
                    null,
                    2
                    /* CLASS */
                  ),
                  e.createTextVNode(
                    " " + e.toDisplayString(C.value ? t.$t("正在创建制作任务…") : t.$t("审核通过，开始制作")),
                    1
                    /* TEXT */
                  )
                ], 8, ga)
              ])
            ], 8, ra)
          ])) : e.createCommentVNode("v-if", !0)
        ])),
        (e.openBlock(), e.createBlock(e.Teleport, { to: "body" }, [
          ue.value ? (e.openBlock(), e.createElementBlock("div", {
            key: 0,
            role: "dialog",
            class: "video-preview-backdrop",
            onClick: e.withModifiers(ct, ["self"])
          }, [
            e.createElementVNode("section", {
              class: "video-preview-dialog",
              role: "dialog",
              "aria-modal": "true",
              "aria-label": t.$t("成片预览")
            }, [
              e.createElementVNode("header", null, [
                e.createElementVNode("div", null, [
                  e.createElementVNode("span", null, [
                    o[73] || (o[73] = e.createElementVNode(
                      "i",
                      { class: "ri-play-circle-line" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createTextVNode(
                      e.toDisplayString(t.$t("视频预览")),
                      1
                      /* TEXT */
                    )
                  ]),
                  e.createElementVNode(
                    "h2",
                    null,
                    e.toDisplayString(t.$t("成片预览")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "p",
                    null,
                    e.toDisplayString(L.value || t.$t("点击播放即可预览本次生成的成片。")),
                    1
                    /* TEXT */
                  )
                ]),
                e.createElementVNode("button", {
                  type: "button",
                  "aria-label": t.$t("关闭"),
                  onClick: ct
                }, [...o[74] || (o[74] = [
                  e.createElementVNode(
                    "i",
                    { class: "ri-close-line" },
                    null,
                    -1
                    /* CACHED */
                  )
                ])], 8, ba)
              ]),
              e.createElementVNode("div", Na, [
                e.createCommentVNode(" @error：协议 404 / 解码失败时清 src 亮出失败态，不让用户对着黑屏（与确认卡预览同规则） "),
                R.value ? (e.openBlock(), e.createElementBlock("video", {
                  key: 0,
                  src: R.value,
                  controls: "",
                  autoplay: "",
                  playsinline: "",
                  onError: o[23] || (o[23] = (n) => R.value = "")
                }, null, 40, Ea)) : (e.openBlock(), e.createElementBlock("div", wa, [
                  o[75] || (o[75] = e.createElementVNode(
                    "i",
                    { class: "ri-movie-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createElementVNode(
                    "strong",
                    null,
                    e.toDisplayString(Ae.value ? t.$t("正在读取成片…") : t.$t("本地成片读取失败")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "span",
                    null,
                    e.toDisplayString(t.$t("请返回制作任务查看产物状态。")),
                    1
                    /* TEXT */
                  )
                ]))
              ]),
              L.value ? (e.openBlock(), e.createElementBlock("div", {
                key: 0,
                class: "video-preview-path",
                title: L.value
              }, [
                o[76] || (o[76] = e.createElementVNode(
                  "i",
                  { class: "ri-file-video-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(L.value),
                  1
                  /* TEXT */
                )
              ], 8, ya)) : e.createCommentVNode("v-if", !0),
              e.createElementVNode("footer", null, [
                e.createElementVNode("button", {
                  class: "preview-publish",
                  type: "button",
                  disabled: w.value,
                  onClick: Ee
                }, [
                  e.createElementVNode(
                    "i",
                    {
                      class: e.normalizeClass(w.value ? "ri-loader-4-line spin" : q.value ? "ri-refresh-line" : "ri-send-plane-fill")
                    },
                    null,
                    2
                    /* CLASS */
                  ),
                  e.createElementVNode(
                    "span",
                    null,
                    e.toDisplayString(w.value && te.value ? te.value : q.value ? t.$t("再次发布") : t.$t("准备发布")),
                    1
                    /* TEXT */
                  )
                ], 8, Va),
                e.createElementVNode("button", {
                  class: "preview-confirm",
                  type: "button",
                  onClick: ct
                }, [
                  o[77] || (o[77] = e.createElementVNode(
                    "i",
                    { class: "ri-check-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(t.$t("关闭预览")),
                    1
                    /* TEXT */
                  )
                ])
              ])
            ], 8, ha)
          ])) : e.createCommentVNode("v-if", !0)
        ])),
        (e.openBlock(), e.createBlock(e.Teleport, { to: "body" }, [
          Dt.value ? (e.openBlock(), e.createElementBlock("div", {
            key: 0,
            class: "video-publish-confirm-dock",
            role: "dialog",
            "aria-modal": "true",
            "aria-label": t.$t("短视频发布人工确认")
          }, [
            e.createVNode(el, {
              request: wo.value,
              busy: w.value,
              "context-data": Vo.value,
              "context-labels": yo,
              "context-preview": So.value,
              onDecide: Zo,
              onDismiss: Zt
            }, null, 8, ["request", "busy", "context-data", "context-preview"])
          ], 8, Sa)) : e.createCommentVNode("v-if", !0)
        ]))
      ]);
    };
  }
}), Aa = (E, V) => {
  const $ = E.__vccOpts || E;
  for (const [se, h] of V)
    $[se] = h;
  return $;
}, Pa = /* @__PURE__ */ Aa(Ta, [["__scopeId", "data-v-8ea4330c"]]);
export {
  Pa as default
};
