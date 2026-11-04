/**
 * 智能金融助手（渲染入口，ESM）。依据《金融行业 AI 应用解决方案 2.0》，不含研发 Agent（编码 / 代码评审）。
 * 每个模块分步骤（每步独立状态），进度条吸顶。不 import 'vue'：用 sdk.vue。
 */
export default function createSolution(sdk) {
  const { defineComponent, h, ref, reactive, computed, onMounted, shallowReactive } = sdk.vue;
  const t = (s, p) => sdk.t(s, p);

  const CSS = `
.fa{max-width:1440px;margin:0 auto;padding:0 22px 64px;font-size:14px;color:var(--color-text-primary,#111827);box-sizing:border-box;flex:1;min-height:0;overflow-y:auto;width:100%}
.fa-sticky{position:sticky;top:0;z-index:6;background:var(--color-bg-page,var(--color-bg-primary,#f8fafc));padding:4px 0 10px;border-bottom:1px solid var(--color-border,#e5e7eb)}
.fa-head{display:flex;align-items:center;gap:12px;flex-wrap:wrap}.fa-head h2{margin:0;font-size:20px}.fa-head p{margin:2px 0 0;color:var(--color-text-secondary,#6b7280);font-size:13px}
.fa-ico{width:44px;height:44px;border-radius:10px;display:inline-flex;align-items:center;justify-content:center;background:color-mix(in srgb,var(--color-brand,#6366f1) 14%,transparent);color:var(--color-brand,#6366f1);font-size:22px}
.fa-tabs{display:flex;gap:2px;margin-top:12px;overflow-x:auto;border-bottom:1px solid var(--color-border,#e5e7eb)}
.fa-tab{border:none;background:none;padding:8px 14px;cursor:pointer;font:inherit;font-weight:600;color:var(--color-text-secondary,#6b7280);border-bottom:2px solid transparent;margin-bottom:-1px;white-space:nowrap}
.fa-tab.on{color:var(--color-brand,#6366f1);border-bottom-color:var(--color-brand,#6366f1)}
.fa-steps{display:flex;gap:6px;margin-top:10px;flex-wrap:wrap}
.fa-steps button{border:1px solid var(--color-border,#e5e7eb);background:var(--color-bg-card,#fff);border-radius:16px;padding:4px 12px;font-size:12.5px;cursor:pointer;color:inherit}
.fa-steps button.done{border-color:#10b981;color:#047857}.fa-steps button.cur{border-color:var(--color-brand,#6366f1);color:var(--color-brand,#6366f1)}
.fa-prog{height:4px;background:var(--color-border,#e5e7eb);border-radius:2px;margin-top:8px;overflow:hidden}.fa-prog i{display:block;height:100%;background:var(--color-brand,#6366f1);transition:width .3s}
.fa-card{border:1px solid var(--color-border,#e5e7eb);border-radius:12px;padding:16px 18px;margin-top:16px;background:var(--color-bg-card,#fff);scroll-margin-top:170px}
.fa-card h3{margin:0 0 4px;font-size:16px;display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.fa-st{font-size:12px;font-weight:400;padding:1px 8px;border-radius:9px;border:1px solid var(--color-border,#e5e7eb);color:var(--color-text-secondary,#6b7280)}.fa-st.done{border-color:#10b981;color:#047857}
.fa-sub{margin:0 0 12px;color:var(--color-text-secondary,#6b7280);font-size:13px;line-height:1.6}
.fa-btn{padding:6px 14px;border-radius:8px;border:1px solid var(--color-border,#d1d5db);background:var(--color-bg-card,#fff);cursor:pointer;color:inherit;font:inherit;font-size:13px}
.fa-btn.pri{border-color:var(--color-brand,#6366f1);background:var(--color-brand,#6366f1);color:#fff}.fa-btn:disabled{opacity:.5;cursor:default}.fa-btn.sm{padding:3px 10px;font-size:12px}
.fa-row{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin:6px 0}
.fa-in{border:1px solid var(--color-border,#d1d5db);border-radius:8px;padding:6px 10px;font:inherit;background:var(--color-bg-card,#fff);color:inherit;box-sizing:border-box}
.fa-ta{width:100%;min-height:140px;resize:vertical}
.fa-tbl{width:100%;border-collapse:collapse;font-size:13px}.fa-tbl th,.fa-tbl td{border-bottom:1px solid var(--color-border,#e5e7eb);padding:6px 8px;text-align:left;vertical-align:top}.fa-tbl th{font-weight:500;color:var(--color-text-secondary,#6b7280)}
.fa-lv{display:inline-block;font-size:12px;padding:0 7px;border-radius:5px;color:#fff;white-space:nowrap}.fa-lv.high{background:#dc2626}.fa-lv.medium{background:#f59e0b}.fa-lv.pass{background:#10b981}
.fa-note{padding:8px 12px;border-radius:8px;font-size:13px;margin:8px 0;line-height:1.6}.fa-note.warn{background:#fef3c7;color:#92400e}.fa-note.err{background:#fee2e2;color:#991b1b}.fa-note.ok{background:#dcfce7;color:#166534}.fa-note.info{background:var(--color-bg-hover,#f1f5f9)}
.fa-q{background:var(--color-bg-hover,#f8fafc);border-radius:6px;padding:6px 8px;margin:6px 0;font-size:12.5px;color:var(--color-text-secondary,#4b5563);white-space:pre-wrap}
.fa-ans{white-space:pre-wrap;line-height:1.75}
.fa-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:12px}
.fa-kpi{border:1px solid var(--color-border,#e5e7eb);border-radius:10px;padding:10px 12px}.fa-kpi b{display:block;font-size:22px}.fa-kpi span{color:var(--color-text-secondary,#6b7280);font-size:12px}
.fa-code{font-family:ui-monospace,Menlo,monospace;font-size:12px;background:var(--color-bg-hover,#f1f5f9);border-radius:6px;padding:8px 10px;white-space:pre-wrap;overflow-x:auto}
.fa-mark{background:#fde68a;border-radius:3px;padding:0 1px}
.fa-link{border:none;background:none;color:var(--color-brand,#6366f1);cursor:pointer;font:inherit;padding:0}
.fa-empty{color:var(--color-text-secondary,#6b7280);font-size:13px}
.fa-cols{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:16px;align-items:start}@media (max-width:1000px){.fa-cols{grid-template-columns:1fr}}
`;

  // 中国金融风格（克制、稳重、合规、数据清晰）：藏青 / 深蓝为主，金色只做细线与点缀，红色代表增长（国内红涨绿跌）；
  // 无衬线字体、规整网格、充足留白，动效只用轻微过渡。横幅背景是 K 线 + 上升箭头 + ¥ 水印（低透明度，不抢内容）。
  const THEME = `
.fa{--fa-navy:#0b2447;--fa-navy-2:#19376d;--fa-blue:#2563a8;--fa-gold:#c8a24a;--fa-gold-2:#e7cf8f;--fa-red:#c8102e;--fa-line:#dbe2ec;font-family:-apple-system,BlinkMacSystemFont,'PingFang SC','Microsoft YaHei','Helvetica Neue',sans-serif}
.fa-banner{position:relative;overflow:hidden;border-radius:12px;padding:20px 24px;background:linear-gradient(115deg,var(--fa-navy) 0%,var(--fa-navy-2) 58%,#1f4a8a 100%);color:#fff;display:flex;align-items:center;gap:18px;flex-wrap:wrap;box-shadow:0 4px 14px rgba(11,36,71,.16);border-bottom:3px solid var(--fa-gold)}
.fa-banner::before{content:'';position:absolute;right:150px;top:0;bottom:0;width:520px;max-width:60%;opacity:.22;pointer-events:none;background:no-repeat right center/contain url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 520 160'><g stroke-width='2'><line x1='40' y1='96' x2='40' y2='138' stroke='%23e0565b'/><rect x='33' y='104' width='14' height='26' fill='%23e0565b'/><line x1='80' y1='86' x2='80' y2='132' stroke='%2334b37a'/><rect x='73' y='94' width='14' height='22' fill='%2334b37a'/><line x1='120' y1='74' x2='120' y2='124' stroke='%23e0565b'/><rect x='113' y='82' width='14' height='30' fill='%23e0565b'/><line x1='160' y1='66' x2='160' y2='112' stroke='%23e0565b'/><rect x='153' y='72' width='14' height='28' fill='%23e0565b'/><line x1='200' y1='70' x2='200' y2='108' stroke='%2334b37a'/><rect x='193' y='76' width='14' height='18' fill='%2334b37a'/><line x1='240' y1='50' x2='240' y2='98' stroke='%23e0565b'/><rect x='233' y='56' width='14' height='32' fill='%23e0565b'/><line x1='280' y1='40' x2='280' y2='86' stroke='%23e0565b'/><rect x='273' y='46' width='14' height='28' fill='%23e0565b'/></g><polyline points='30,128 80,112 120,98 160,86 200,90 240,66 280,54 330,40 380,30' fill='none' stroke='%23e7cf8f' stroke-width='3'/><polygon points='392,24 370,26 384,42' fill='%23e7cf8f'/><text x='430' y='118' font-size='110' font-family='Arial' font-weight='700' fill='%23ffffff' fill-opacity='.5'>¥</text></svg>")}
.fa-banner::after{content:'';position:absolute;inset:0;pointer-events:none;background:linear-gradient(90deg,transparent 0 60%,rgba(255,255,255,.04) 60% 60.2%,transparent 60.2% 75%,rgba(255,255,255,.04) 75% 75.2%,transparent 75.2%),repeating-linear-gradient(0deg,transparent 0 31px,rgba(255,255,255,.035) 31px 32px)}
.fa-banner > *{position:relative;z-index:1}
.fa-banner h2{margin:0;font-size:22px;font-weight:600;letter-spacing:.04em;color:#fff}
.fa-banner p{margin:4px 0 0;color:rgba(255,255,255,.78);font-size:13px}
.fa-banner .fa-ico{background:rgba(200,162,74,.14);color:var(--fa-gold-2);border:1px solid rgba(231,207,143,.55);border-radius:10px;width:50px;height:50px;font-size:24px}
.fa-banner .fa-grow{flex:1;min-width:240px}
.fa-up{display:inline-flex;align-items:center;gap:4px;margin-left:10px;padding:1px 8px;border-radius:4px;background:rgba(200,16,46,.18);color:#ffb3bd;font-size:12px;font-weight:600;vertical-align:3px}
.fa-badges{display:flex;gap:6px;flex-wrap:wrap;margin-top:10px}
.fa-badges span{font-size:11.5px;padding:2px 9px;border-radius:4px;border:1px solid rgba(231,207,143,.45);color:var(--fa-gold-2);background:rgba(0,0,0,.14)}
.fa-demo{border:1px solid var(--fa-gold);background:var(--fa-gold);color:#1b1404;border-radius:8px;padding:9px 18px;cursor:pointer;font:inherit;font-weight:600;transition:filter .15s}
.fa-demo:hover{filter:brightness(1.06)}.fa-demo:disabled{opacity:.6;cursor:default}
.fa-tabs{border-bottom-color:var(--fa-line)}
.fa-tab{font-weight:500}.fa-tab:hover{color:var(--fa-navy-2)}
.fa-tab.on{color:var(--fa-navy);font-weight:600;border-bottom-color:var(--fa-navy-2)}
.fa-tab:last-child{margin-left:auto}
.fa-steps button{border-radius:6px}
.fa-steps button.done{border-color:#c7d2e3;color:var(--fa-navy-2);background:#f3f6fb}
.fa-steps button.cur{border-color:var(--fa-navy-2);color:#fff;background:var(--fa-navy-2)}
.fa-prog{height:3px}.fa-prog i{background:linear-gradient(90deg,var(--fa-navy-2),var(--fa-gold))}
.fa-btn{border-radius:6px}.fa-btn.pri{border-color:var(--fa-navy-2);background:var(--fa-navy-2);color:#fff}.fa-btn.pri:hover{background:var(--fa-navy)}
.fa-card{border-radius:8px;border-color:var(--fa-line);border-top:2px solid var(--fa-navy-2);box-shadow:0 1px 2px rgba(11,36,71,.04)}
.fa-card h3{font-weight:600;color:var(--fa-navy)}
.fa-st.done{border-color:#c7d2e3;color:var(--fa-navy-2)}
.fa-kpi{border-color:var(--fa-line);border-left:3px solid var(--fa-navy-2);border-radius:6px}
.fa-kpi b{color:var(--fa-navy);font-family:'DIN Alternate','Helvetica Neue',Arial,sans-serif;font-variant-numeric:tabular-nums}
.fa-tbl th{background:#f3f6fb;color:var(--fa-navy-2)}
.fa-tbl td{font-variant-numeric:tabular-nums}
.fa-src{font-size:11.5px;padding:0 6px;border-radius:4px;background:rgba(200,16,46,.08);color:var(--fa-red);white-space:nowrap}.fa-src.pc{background:#eef2f8;color:var(--fa-navy-2)}
.fa-kbform{border:1px dashed var(--fa-line);border-radius:8px;padding:10px 12px;margin-top:8px;background:#f8fafd}
.fa-kbdocs{margin-top:14px;padding-top:12px;border-top:1px solid var(--fa-line)}
.fa-mobile{display:flex;gap:18px;align-items:flex-start;flex-wrap:wrap;margin-top:10px}
.fa-qr{width:170px;height:170px;padding:8px;background:#fff;border:1px solid var(--fa-line);border-radius:8px;box-sizing:border-box}.fa-qr svg{width:100%;height:100%;display:block}
.fa-mobile > div:last-child{flex:1;min-width:260px}
@media (prefers-color-scheme: dark){.fa-tab.on,.fa-card h3,.fa-kpi b{color:var(--fa-gold-2)}.fa-tbl th,.fa-steps button.done{background:transparent}}
`;

  const el = (tag, props, ...kids) => h(tag, props || null, kids.flat().filter((k) => k !== null && k !== undefined && k !== false));
  const fmtMoney = (v) => (v == null ? '—' : Math.abs(v) >= 1e8 ? `${(v / 1e8).toFixed(2)} 亿元` : `${(v / 1e4).toFixed(2)} 万元`);
  const fmtVal = (v, unit) => (v == null ? '—' : unit === '元' ? fmtMoney(v) : unit === '%' ? `${Number(v).toFixed(2)}%` : `${Number(v).toLocaleString()} ${unit || ''}`);
  const readBase64 = (file) => new Promise((ok, no) => { const r = new FileReader(); r.onload = () => ok(String(r.result).split(',')[1] || ''); r.onerror = () => no(new Error(t('读取文件失败'))); r.readAsDataURL(file); });
  const LV = { high: '高风险', medium: '关注', pass: '通过' };
  const lv = (k) => t(LV[k] || k);

  // 业务页签在前；「设置」（安全与审计：数据分级与模型路由、审计记录、明确不做的事）放最后
  const TABS = [
    { key: 'qa', title: '制度与合规问答', icon: 'ri-book-read-line' },
    { key: 'kb', title: '金融知识库', icon: 'ri-stack-line' },
    { key: 'ask', title: '智能问数', icon: 'ri-database-2-line' },
    { key: 'docs', title: '资料智能处理', icon: 'ri-file-list-3-line', lazy: true },
    { key: 'agents', title: '智能体编排', icon: 'ri-flow-chart', lazy: true },
    { key: 'pm', title: 'AI 项目管理', icon: 'ri-kanban-view', lazy: true },
    { key: 'credit', title: '授信材料预审', icon: 'ri-file-search-line' },
    { key: 'mkt', title: '营销物料审查', icon: 'ri-megaphone-line' },
    { key: 'gateway', title: 'AI 网关', icon: 'ri-shield-keyhole-line', lazy: true },
    { key: 'ops', title: '后台与其他', icon: 'ri-apps-2-line' },
    { key: 'overview', title: '设置', icon: 'ri-settings-3-line' },
  ];

  /**
   * 新模块按页签懒加载：第一次点开才 import 对应文件（tabs/*.mjs），首屏只带当前页的代码，不会因为模块多而卡。
   * 模块约定：default (kit) => ({ load(), steps(), view() })
   */
  const LAZY = {
    docs: () => import('./tabs/docs.mjs'),
    agents: () => import('./tabs/agents.mjs'),
    pm: () => import('./tabs/pm.mjs'),
    gateway: () => import('./tabs/gateway.mjs'),
  };
  /** 挂在已有页签下面的懒加载子模块：页签 key → 子模块 key */
  const SUB = { ask: 'askx', kb: 'kbx' };
  const SUB_LOAD = { askx: () => import('./tabs/askx.mjs'), kbx: () => import('./tabs/kbx.mjs') };

  return defineComponent({
    name: 'FinAssistantWorkbench',
    setup() {
      const tab = ref('qa');
      // 手机端制度问答（局域网对话页）：{ available, running, url, qr }
      const mobile = ref({ available: true, running: false, url: '', qr: '' });
      // 金融知识库：来源 / 文档 / 设置；新增来源的表单；检索测试结果
      const kbOv = ref({ sources: [], docs: [], settings: { useInQa: true, topK: 4 }, capabilities: {} });
      const kbForm = reactive({ kind: '', name: '', level: 'internal', graphId: '', dataSource: '', sql: "SELECT title, content FROM kb_articles WHERE content LIKE {{q}} OR title LIKE {{q}} LIMIT 20", titleCol: 'title', textCol: 'content', refCol: '', url: '', token: '', itemsPath: 'items', titleField: 'title', textField: 'content', urlField: 'url' });
      const kbLevelNew = ref('internal');
      const kbQ = ref('');
      const kbRes = ref(null);
      const appGraphs = ref([]);
      const dbSources = ref([]);
      const loadKb = async () => {
        try { kbOv.value = await sdk.invoke('kb.overview'); } catch (_) { /* 旧版本 */ }
        appGraphs.value = (await sdk.invoke('kb.appGraphs').catch(() => [])) || [];
        dbSources.value = (await sdk.invoke('kb.dbSources').catch(() => [])) || [];
      };
      const meta = ref(null);
      const busy = reactive({});
      const err = reactive({});
      const call = async (key, action, payload) => {
        busy[key] = true; err[key] = '';
        try { return await sdk.invoke(action, payload); } catch (e) { err[key] = String(e?.message || e); return undefined; } finally { busy[key] = false; }
      };
      const loadMeta = async () => { meta.value = (await call('meta', 'meta')) || meta.value; };

      // 安全与审计
      const auditView = ref(null);
      const loadAudit = async () => { auditView.value = await call('audit', 'audit.list', { limit: 200 }); };
      const toggleInternal = async (on) => { await call('settings', 'settings.patch', { modelInternal: on }); await loadMeta(); await loadAudit(); };

      // 制度问答
      const policies = ref([]);
      const qaList = ref([]);
      const gaps = ref(null);
      const qaInput = ref('');
      const polForm = reactive({ dept: '', effectiveFrom: '', effectiveTo: '' });
      const loadQa = async () => { policies.value = (await call('pol', 'policy.list')) || []; qaList.value = (await call('qaList', 'qa.list')) || []; };
      const importPolicy = async (ev) => {
        for (const f of [...(ev.target.files || [])]) await call('pol', 'policy.import', { fileName: f.name, base64: await readBase64(f), ...polForm });
        ev.target.value = '';
        await loadQa(); await loadMeta();
      };
      const askQa = async () => { if (!qaInput.value.trim()) return; const r = await call('qa', 'qa.ask', { q: qaInput.value }); if (r) qaList.value = [r, ...qaList.value]; };
      const latestQa = computed(() => qaList.value[0] || null);

      // 智能问数
      const dataInfo = ref(null);
      const asks = ref([]);
      const askInput = ref('');
      const loadAsk = async () => { dataInfo.value = await call('data', 'data.info'); asks.value = (await call('askList', 'ask.list')) || []; };
      const runAsk = async () => { if (!askInput.value.trim()) return; const r = await call('ask', 'ask.run', { q: askInput.value }); if (r) asks.value = [r, ...asks.value]; };
      const latestAsk = computed(() => asks.value[0] || null);

      // 授信预审
      const credits = ref([]);
      const credit = ref(null);
      const newCredit = reactive({ borrower: '', product: 'working_capital' });
      const relatedText = ref('');
      const threshold = ref('2000000');
      const loadCredits = async () => { credits.value = (await call('credits', 'credit.list')) || []; };
      const openCredit = async (id) => { credit.value = await call('credit', 'credit.get', { id }); relatedText.value = (credit.value?.related || []).join('、'); threshold.value = String(credit.value?.largeThreshold || 2000000); };
      const createCredit = async () => { const r = await call('credit', 'credit.create', { ...newCredit }); if (r) { credit.value = r; await loadCredits(); } };
      const setCredit = (r) => { if (r) { credit.value = r; relatedText.value = (r.related || []).join('、'); } };

      // 营销物料
      const mktList = ref([]);
      const mkt = ref(null);
      const mktForm = reactive({ title: '', text: '' });
      const loadMkt = async () => { mktList.value = (await call('mktList', 'mkt.list')) || []; };

      // 一键演示：主进程一次载入所有示例数据（不调模型），这里把各页签的输入框也填好
      const demoAll = async () => {
        const r = await call('demo', 'demo.all');
        if (!r) return;
        qaInput.value = r.qa;
        askInput.value = r.ask;
        mktForm.title = t(r.mkt.title);
        mktForm.text = r.mkt.text;
        await Promise.all([loadMeta(), loadQa(), loadAsk(), loadCredits(), loadMkt(), loadAudit()]);
        await openCredit(r.creditId);
        sdk.notify.success(t('演示数据已载入：制度、问数数据、授信预审、营销文案都已准备好；需要调用模型的步骤请在各页签手动点'));
      };

      // 懒加载的模块实例（key → { load, steps, view }）与加载状态
      const lazyMods = shallowReactive({});
      const lazyErr = reactive({});
      const kit = () => ({ sdk, vue: sdk.vue, el, t, call, busy, err, errNote, card, readBase64, fmtVal, fmtMoney, go, navigate: (k) => select(k) });
      const ensureLazy = async (k) => {
        const loader = LAZY[k] || SUB_LOAD[k];
        if (!loader || lazyMods[k]) return lazyMods[k];
        try { const m = await loader(); lazyMods[k] = m.default(kit()); } catch (e) { lazyErr[k] = String(e?.message || e); }
        return lazyMods[k];
      };
      const steps = computed(() => {
        if (lazyMods[tab.value]) return lazyMods[tab.value].steps() || [];
        const subSteps = SUB[tab.value] && lazyMods[SUB[tab.value]] ? lazyMods[SUB[tab.value]].steps() || [] : [];
        return [...baseSteps(), ...subSteps];
      });
      const baseSteps = () => {
        if (tab.value === 'qa') return [
          { id: 'qa-1', title: '① 制度库', done: policies.value.some((p) => p.active) },
          { id: 'qa-2', title: '② 提问与作答', done: qaList.value.length > 0 },
          { id: 'qa-3', title: '③ 缺口反馈', done: !!gaps.value },
          { id: 'qa-4', title: '④ 手机端提问', done: !!mobile.value.running },
        ];
        if (tab.value === 'kb') return [
          { id: 'kb-1', title: '① 知识来源', done: kbOv.value.sources.some((x) => x.enabled) },
          { id: 'kb-2', title: '② 检索测试', done: !!kbRes.value },
          { id: 'kb-3', title: '③ 用在哪里', done: !!kbOv.value.settings?.useInQa },
        ];
        if (tab.value === 'ask') return [
          { id: 'ask-1', title: '① 数据与口径库', done: !!dataInfo.value?.rows },
          { id: 'ask-2', title: '② 提问取数', done: asks.value.some((a) => a.status === 'answered') },
          { id: 'ask-3', title: '③ 复核与留痕', done: asks.value.length > 0 },
        ];
        if (tab.value === 'credit') {
          const c = credit.value;
          const issues = (c?.checks || []).filter((x) => x.level !== 'pass');
          return [
            { id: 'cr-1', title: '① 材料与缺件', done: !!c?.files?.length },
            { id: 'cr-2', title: '② 关键数据抽取', done: !!c && Object.keys(c.values || {}).length > 0 },
            { id: 'cr-3', title: '③ 程序校验', done: !!c?.checks?.length },
            { id: 'cr-4', title: '④ 预审意见', done: !!c?.opinion },
            { id: 'cr-5', title: '⑤ 人工确认', done: !!c && issues.length > 0 && issues.every((x) => c.decisions?.[x.id]) },
          ];
        }
        if (tab.value === 'mkt') return [
          { id: 'mk-1', title: '① 提交物料', done: !!mkt.value },
          { id: 'mk-2', title: '② 问题清单与处理', done: !!mkt.value && mkt.value.issues.every((i) => i.decision) },
          { id: 'mk-3', title: '③ 导出预审意见', done: !!mkt.value?.exported },
        ];
        return [];
      };
      const progress = computed(() => (steps.value.length ? Math.round((steps.value.filter((s) => s.done).length / steps.value.length) * 100) : 0));
      const go = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      const select = async (k) => {
        tab.value = k;
        if (LAZY[k]) { const m = await ensureLazy(k); if (m && tab.value === k) await m.load?.(); return; }
        if (SUB[k]) ensureLazy(SUB[k]).then((m) => m?.load?.());
        if (k === 'overview') await loadAudit();
        if (k === 'qa') await Promise.all([loadQa(), loadMobile()]);
        if (k === 'kb') await loadKb();
        if (k === 'ask') await loadAsk();
        if (k === 'credit') await loadCredits();
        if (k === 'mkt') await loadMkt();
      };
      const loadMobile = async () => { try { mobile.value = await sdk.invoke('mobile.status'); } catch (_) { /* 旧版本没有手机端 */ } };
      onMounted(async () => { await loadMeta(); await Promise.all([loadQa(), loadAudit(), loadMobile()]); });

      const errNote = (k) => (err[k] ? el('p', { class: 'fa-note err' }, err[k]) : null);
      const subView = (k) => (lazyMods[k] ? lazyMods[k].view() : lazyErr[k] ? el('p', { class: 'fa-note err' }, t('模块加载失败：{p0}', { p0: lazyErr[k] })) : el('p', { class: 'fa-empty', style: 'margin-top:12px' }, t('正在加载更多功能…')));
      const card = (id, title, done, sub, ...body) => el('section', { class: 'fa-card', id },
        el('h3', null, title, el('span', { class: `fa-st${done ? ' done' : ''}` }, done ? t('已完成') : t('待执行'))),
        sub ? el('p', { class: 'fa-sub' }, sub) : null, ...body);

      // ── 视图 ──
      const vOverview = () => {
        const m = meta.value;
        const a = auditView.value;
        return el('div', null,
          el('section', { class: 'fa-card' },
            el('h3', null, t('五个约束，落实在程序里')),
            el('p', { class: 'fa-sub' }, t('模型负责理解、检索、归纳和起草；取数、计算、校验、拦截、审批和审计由程序确定性执行。下表每一项都是本工作台里的程序控制，不依赖模型「自觉」。')),
            el('table', { class: 'fa-tbl' },
              el('thead', null, el('tr', null, el('th', null, t('约束')), el('th', null, t('本工作台的处理')))),
              el('tbody', null, [
                [t('数据不能出域'), t('授信材料、问数明细按客户敏感数据处理：没确认内网模型就在调用前拦下，并记审计')],
                [t('数字不能出错'), t('问数的数字由程序按口径库计算；问答 / 解读里的每个数字都回原文或结果核对，找不到就重写或标出')],
                [t('过程必须留痕'), t('每次导入、提问、取数、模型调用、人工修改都进审计；审计按条串联哈希，删改可发现')],
                [t('关键动作必须有人签'), t('授信预审只陈述发现、不下结论，审批人逐条确认；营销物料由合规岗终审；本工作台不对外发送、不写业务系统')],
                [t('老系统不能大改'), t('只读接入：上传文件、导入只读导出的表格，不改任何业务系统')],
              ].map(([a1, b]) => el('tr', null, el('td', null, el('b', null, a1)), el('td', null, b)))))),
          el('section', { class: 'fa-card' },
            el('h3', null, t('数据分级与模型路由')),
            el('p', { class: 'fa-sub' }, t('客户敏感数据（客户身份、账户、交易、信贷）只能走内网私有部署的模型。只有部署在本机、或由管理员核实为私有部署的模型才算内网模型——内网地址不一定是私有部署（可能只是转发到公有云的网关）。')),
            m ? el('label', { class: 'fa-row' },
              el('input', { type: 'checkbox', checked: m.settings.modelInternal, 'data-test': 'fa-model-internal', onChange: (e) => toggleInternal(e.target.checked) }),
              el('span', null, t('当前模型是内网私有部署（由管理员核实后勾选；未勾选时，授信预审与智能问数的模型调用会被拦截）'))) : null,
            m && !m.settings.modelInternal ? el('p', { class: 'fa-note warn' }, t('未确认内网模型：制度问答、营销物料审查可用（内部 / 公开信息）；授信材料预审与智能问数会在调用模型前被拦下。')) : null,
            errNote('settings')),
          el('section', { class: 'fa-card' },
            el('h3', null, t('审计记录'), a ? el('span', { class: `fa-st${a.broken < 0 ? ' done' : ''}` }, a.broken < 0 ? t('哈希链完好（{n} 条）', { n: a.total }) : t('第 {n} 条之后被改动过', { n: a.broken + 1 })) : null),
            el('p', { class: 'fa-sub' }, t('谁、何时、做了什么、用了哪个模型；模型调用只记场景、数据级别、耗时和字数，不存原文。人工修改 AI 结果记录修改前后的值。')),
            a && a.items.length ? el('table', { class: 'fa-tbl' },
              el('thead', null, el('tr', null, el('th', null, t('时间')), el('th', null, t('动作')), el('th', null, t('内容')))),
              el('tbody', null, a.items.slice(0, 60).map((x) => el('tr', null, el('td', null, String(x.at).slice(0, 19).replace('T', ' ')), el('td', null, x.action), el('td', null, el('span', { class: 'fa-empty' }, JSON.stringify(Object.fromEntries(Object.entries(x).filter(([k]) => !['at', 'action', 'prev', 'hash'].includes(k)))).slice(0, 220))))))) : el('p', { class: 'fa-empty' }, t('还没有记录'))),
          el('section', { class: 'fa-card' },
            el('h3', null, t('明确不做的事')),
            el('ul', null, [t('不让模型做授信审批、产品定价、反洗钱定性等决策，AI 只提供依据和异常提示'), t('不让模型直接向客户发送未经人工审核的内容'), t('不使用机构的客户数据训练或微调任何模型'), t('未经单独授权不写入业务系统，默认只读')].map((s) => el('li', null, s)))));
      };

      const vQa = () => {
        const q = latestQa.value;
        return el('div', null,
          card('qa-1', t('① 制度库'), policies.value.some((p) => p.active), t('导入制度文件（Word、PDF、文本；扫描件自动识别文字）。每份登记生效日期、废止日期和归口部门；废止或被新版本替代的制度自动退出检索，历史问答保留当时依据的版本。'),
            el('div', { class: 'fa-row' },
              el('input', { class: 'fa-in', placeholder: t('归口部门（可空，自动识别）'), value: polForm.dept, onInput: (e) => { polForm.dept = e.target.value; } }),
              el('label', null, t('生效日'), ' ', el('input', { class: 'fa-in', type: 'date', value: polForm.effectiveFrom, onInput: (e) => { polForm.effectiveFrom = e.target.value; } })),
              el('label', null, t('废止日'), ' ', el('input', { class: 'fa-in', type: 'date', value: polForm.effectiveTo, onInput: (e) => { polForm.effectiveTo = e.target.value; } })),
              el('label', { class: 'fa-btn pri' }, t('导入制度文件'), el('input', { type: 'file', multiple: true, accept: '.docx,.pdf,.txt,.md', hidden: true, onChange: importPolicy })),
              el('button', { class: 'fa-btn', disabled: busy.pol, 'data-test': 'fa-policy-demo', onClick: async () => { await call('pol', 'policy.demo'); await loadQa(); await loadMeta(); } }, t('载入示例制度'))),
            errNote('pol'),
            policies.value.length ? el('table', { class: 'fa-tbl' },
              el('thead', null, el('tr', null, el('th', null, t('制度')), el('th', null, t('版本')), el('th', null, t('归口部门')), el('th', null, t('生效日')), el('th', null, t('条款数')), el('th', null, t('状态')), el('th', null, ''))),
              el('tbody', null, policies.value.map((p) => el('tr', null,
                el('td', null, p.title), el('td', null, `v${p.version}`), el('td', null, p.dept || '—'), el('td', null, p.effectiveFrom || '—'), el('td', null, p.clauses),
                el('td', null, p.active ? el('span', { class: 'fa-lv pass' }, t('生效中')) : el('span', { class: 'fa-lv medium' }, p.retired ? t('已废止') : t('未生效'))),
                el('td', null, el('button', { class: 'fa-link', onClick: async () => { await call('pol', 'policy.update', { id: p.id, patch: { retired: !p.retired } }); await loadQa(); } }, p.retired ? t('恢复') : t('废止'))))))) : el('p', { class: 'fa-empty' }, t('还没有制度'))),
          card('qa-2', t('② 提问与作答'), qaList.value.length > 0, t('判定链：命中禁区话题（针对具体客户的投资建议、个案违规定性、授信审批定价、反洗钱定性）直接拒答；检索到的证据不足也拒答并提示应咨询的部门；两项都通过才交给模型。回答引用制度原文并标明文件、条款和生效日期，回答中的数字必须能在原文中找到。'),
            el('div', { class: 'fa-row' },
              el('input', { class: 'fa-in', style: 'flex:1;min-width:300px', placeholder: t('例如：大额存单起存金额是多少？宣传材料审查要几个工作日？'), value: qaInput.value, 'data-test': 'fa-qa-input', onInput: (e) => { qaInput.value = e.target.value; }, onKeydown: (e) => { if (e.key === 'Enter') askQa(); } }),
              el('button', { class: 'fa-btn pri', disabled: busy.qa, 'data-test': 'fa-qa-ask', onClick: askQa }, busy.qa ? t('检索中…') : t('提问'))),
            el('div', { class: 'fa-row' }, [t('大额存单起存金额是多少？'), t('营销材料审查要几个工作日？'), t('出差住宿每晚能报多少？'), t('客户张三该不该买这只基金？')].map((s) => el('button', { class: 'fa-btn sm', onClick: () => { qaInput.value = s; } }, s))),
            errNote('qa'),
            q ? el('div', { class: 'fa-card', style: 'margin-top:10px' },
              el('div', { class: 'fa-q' }, `${t('问')}：${q.q}`),
              q.status === 'refused' ? el('p', { class: 'fa-note warn', 'data-test': 'fa-qa-refused' }, `${t('拒答')}：${q.reason}`) : el('div', null,
                el('div', { class: 'fa-ans', 'data-test': 'fa-qa-answer' }, q.answer),
                q.unverified?.length ? el('p', { class: 'fa-note warn' }, t('以下数字没能在制度原文中找到，请人工核对：{p0}', { p0: q.unverified.join('、') })) : null,
                el('p', { class: 'fa-sub', style: 'margin-top:10px' }, t('依据')),
                (q.citations || []).map((c) => el('div', { class: 'fa-q' }, c.kind === 'kb'
                  ? `[${c.n}] ${t('知识库')} · ${c.title}（${t('来源：{p0}', { p0: c.source || '' })}${c.ref && c.ref !== c.title ? ` · ${c.ref}` : ''}）\n${c.text}`
                  : `[${c.n}]《${c.title}》${c.no} · v${c.version} · ${c.effectiveFrom ? `${c.effectiveFrom} 起施行` : '生效日未登记'}${c.dept ? ` · ${c.dept}` : ''}\n${c.text}`)),
                q.note ? el('p', { class: 'fa-note info' }, q.note) : null,
                q.fast ? el('p', { class: 'fa-note ok', 'data-test': 'fa-qa-fast' }, t('常见问题直答：{p0} 毫秒，未检索、未调用模型（相似度 {p1}）', { p0: q.fast.ms, p1: q.fast.score })) : null,
                (q.steps || []).length ? el('p', { class: 'fa-note info', 'data-test': 'fa-qa-steps' }, t('复杂问题多步检索：拆成 {p0} 个子问题分别检索——{p1}', { p0: q.steps.length, p1: q.steps.map((x) => `「${x.q}」${x.policyHits + x.kbHits} 条`).join('；') })) : null,
                el('div', { class: 'fa-row' }, t('这条回答：'), el('button', { class: 'fa-btn sm', onClick: () => call('qa', 'qa.rate', { id: q.id, rating: 1 }) }, t('有用')), !q.fast ? el('button', { class: 'fa-btn sm', onClick: async () => { if (await call('qa', 'kb.faq.fromQa', { id: q.id })) sdk.notify.success(t('已设为常见问题，下次同样的问法直接回答')); } }, t('设为常见问题')) : null, el('button', { class: 'fa-btn sm', onClick: () => call('qa', 'qa.rate', { id: q.id, rating: -1 }) }, t('不满意（进缺口反馈）'))))) : null,
            qaList.value.length > 1 ? el('details', null, el('summary', null, t('历史问答（{n}）', { n: qaList.value.length })),
              el('table', { class: 'fa-tbl' }, el('tbody', null, qaList.value.slice(0, 50).map((x) => el('tr', null, el('td', null, x.at.slice(0, 16).replace('T', ' ')), el('td', null, x.source === 'mobile' ? el('span', { class: 'fa-src' }, t('手机')) : el('span', { class: 'fa-src pc' }, t('电脑'))), el('td', null, x.q), el('td', null, x.status === 'answered' ? t('已作答') : `${t('拒答')}：${x.reason}`)))))) : null),
          card('qa-3', t('③ 缺口反馈'), !!gaps.value, t('每周汇总拒答和员工评价不满意的问题，按归口部门交制度管理部门补充解释或修订制度。'),
            el('button', { class: 'fa-btn', onClick: async () => { gaps.value = await call('gaps', 'qa.gaps'); } }, t('生成近 7 天缺口清单')),
            gaps.value ? (gaps.value.total ? Object.entries(gaps.value.byDept).map(([d, list]) => el('div', null, el('b', null, `${d}（${list.length}）`), el('ul', null, list.map((x) => el('li', null, `${x.q} — ${x.reason}`))))) : el('p', { class: 'fa-note ok' }, t('近 7 天没有拒答或差评问题'))) : null),
          card('qa-4', t('④ 手机端提问'), !!mobile.value.running, t('员工用手机扫码就能像聊天一样问制度：问题走上面同一条判定链（禁区拒答、证据不足拒答、依据条款作答、数字回原文核对），每条回答标出处，问答同样留痕审计。只在本机局域网开放，地址带访问口令。'),
            !mobile.value.available ? el('p', { class: 'fa-note warn' }, t('当前 App 版本不支持手机端，请升级 App')) : el('div', null,
              el('div', { class: 'fa-row' },
                mobile.value.running
                  ? el('button', { class: 'fa-btn', disabled: busy.mobile, 'data-test': 'fa-mobile-stop', onClick: async () => { mobile.value = await call('mobile', 'mobile.stop'); } }, t('关闭手机端'))
                  : el('button', { class: 'fa-btn pri', disabled: busy.mobile, 'data-test': 'fa-mobile-start', onClick: async () => { mobile.value = await call('mobile', 'mobile.start'); } }, busy.mobile ? t('开启中…') : t('开启手机端')),
                mobile.value.running ? el('button', { class: 'fa-btn', onClick: async () => { mobile.value = await call('mobile', 'mobile.rotate'); sdk.notify.info(t('口令已更换：旧二维码失效，请让员工重新扫码')); } }, t('换口令')) : null,
                mobile.value.running ? el('button', { class: 'fa-btn', onClick: async () => { try { await navigator.clipboard.writeText(mobile.value.url); sdk.notify.success(t('地址已复制')); } catch (_) { sdk.notify.warn(mobile.value.url); } } }, t('复制地址')) : null),
              errNote('mobile'),
              mobile.value.running ? el('div', { class: 'fa-mobile' },
                el('div', { class: 'fa-qr', 'data-test': 'fa-mobile-qr', innerHTML: mobile.value.qr }),
                el('div', null,
                  el('p', { style: 'margin:0 0 6px;font-weight:600' }, t('用手机扫码，或在同一网络的浏览器打开：')),
                  el('div', { class: 'fa-code', 'data-test': 'fa-mobile-url' }, mobile.value.url),
                  el('p', { class: 'fa-sub', style: 'margin-top:8px' }, t('手机和这台电脑需在同一个局域网；问答记录在本页「历史问答」与「设置 → 审计记录」里都能看到（来源：手机）。')))) : null)));
      };

      const vAsk = () => {
        const m = meta.value?.metrics;
        const a = latestAsk.value;
        const d = dataInfo.value;
        return el('div', null,
          card('ask-1', t('① 数据与口径库'), !!d?.rows, t('口径库是问数的唯一依据：模型只把问题映射到库里的指标，不写 SQL、不算数；数字全部由程序按口径计算。数据以只读方式接入（导入只读导出的表格，列名与口径库一致）。'),
            el('div', { class: 'fa-row' },
              el('button', { class: 'fa-btn', disabled: busy.data, 'data-test': 'fa-data-demo', onClick: async () => { await call('data', 'data.demo'); await loadAsk(); await loadMeta(); } }, t('载入示例数据（零售存款）')),
              el('label', { class: 'fa-btn' }, t('导入表格'), el('input', { type: 'file', accept: '.xlsx,.xls,.csv', hidden: true, onChange: async (e) => { const f = e.target.files?.[0]; if (f) { await call('data', 'data.import', { fileName: f.name, base64: await readBase64(f) }); await loadAsk(); } e.target.value = ''; } }))),
            errNote('data'),
            d?.rows ? el('p', { class: 'fa-note info' }, t('已接入 {n} 行（{a} 至 {b}），来源：{s}', { n: d.rows, a: d.from, b: d.to, s: d.source })) : null,
            m ? el('details', null, el('summary', null, t('口径库 · {d}（{n} 个指标）', { d: m.domain, n: m.items.length })),
              el('table', { class: 'fa-tbl' }, el('thead', null, el('tr', null, el('th', null, t('指标')), el('th', null, t('单位')), el('th', null, t('口径')))),
                el('tbody', null, m.items.map((x) => el('tr', null, el('td', null, x.name, el('div', { class: 'fa-empty' }, x.synonyms.join('、'))), el('td', null, x.unit), el('td', null, x.definition)))))) : null),
          card('ask-2', t('② 提问取数'), asks.value.some((x) => x.status === 'answered'), t('每个回答都可展开查看所用口径、等价查询语句和取数时间；口径库里没有的指标直接说明，不让模型猜口径。'),
            !meta.value?.settings.modelInternal ? el('p', { class: 'fa-note warn' }, t('问数使用的是明细数据（按客户敏感数据处理），需在「安全与审计」确认当前模型为内网私有部署后才能提问。')) : null,
            el('div', { class: 'fa-row' },
              el('input', { class: 'fa-in', style: 'flex:1;min-width:300px', placeholder: t('例如：上个月末各分行的零售存款余额'), value: askInput.value, 'data-test': 'fa-ask-input', onInput: (e) => { askInput.value = e.target.value; }, onKeydown: (e) => { if (e.key === 'Enter') runAsk(); } }),
              el('button', { class: 'fa-btn pri', disabled: busy.ask, 'data-test': 'fa-ask-run', onClick: runAsk }, busy.ask ? t('取数中…') : t('取数'))),
            el('div', { class: 'fa-row' }, [t('上个月末各分行的零售存款余额'), t('最近一个月末活期存款占比'), t('今年以来新增存款按产品分'), t('私行客户存款占比是多少'), t('不良贷款率是多少')].map((s) => el('button', { class: 'fa-btn sm', onClick: () => { askInput.value = s; } }, s))),
            errNote('ask'),
            a ? el('div', { class: 'fa-card', style: 'margin-top:10px' },
              el('div', { class: 'fa-q' }, `${t('问')}：${a.q}`),
              a.status !== 'answered' ? el('p', { class: 'fa-note warn' }, a.reason) : el('div', null,
                el('h3', null, a.metricName, el('span', { class: 'fa-st' }, `${a.period.from} ~ ${a.period.to}`)),
                a.groups ? el('table', { class: 'fa-tbl', 'data-test': 'fa-ask-result' }, el('tbody', null, a.groups.map((g) => el('tr', null, el('td', null, g.key || '—'), el('td', null, fmtVal(g.value, a.unit)))))) : el('div', { class: 'fa-kpi', 'data-test': 'fa-ask-result' }, el('b', null, fmtVal(a.value, a.unit)), el('span', null, a.metricName)),
                a.interp ? el('p', { class: 'fa-ans', style: 'margin-top:10px' }, a.interp) : el('p', { class: 'fa-note info' }, a.unverified?.length ? t('模型写的解读里有结果中找不到的数字，已丢弃；以上数字由程序计算。') : t('解读未生成；以上数字由程序计算。')),
                el('details', null, el('summary', null, t('口径、查询语句与取数时间')),
                  el('p', null, el('b', null, t('口径：')), a.definition),
                  a.note ? el('p', null, el('b', null, t('模型的理解：')), a.note) : null,
                  el('div', { class: 'fa-code' }, a.sql),
                  el('p', { class: 'fa-empty' }, t('参与计算 {n} 行 · 取数时间 {t} · 数据来源 {s}', { n: a.rowsUsed, t: a.fetchedAt.slice(0, 19).replace('T', ' '), s: a.dataSource })))))
              : null),
          card('ask-3', t('③ 复核与留痕'), asks.value.length > 0, t('每次取数记入数据访问审计（指标、查询指纹，不存查询结果），数据岗可按记录复核。'),
            asks.value.length ? el('table', { class: 'fa-tbl' }, el('thead', null, el('tr', null, el('th', null, t('时间')), el('th', null, t('问题')), el('th', null, t('指标')), el('th', null, t('结果')))),
              el('tbody', null, asks.value.slice(0, 50).map((x) => el('tr', null, el('td', null, x.at.slice(0, 16).replace('T', ' ')), el('td', null, x.q), el('td', null, x.metricName || '—'), el('td', null, x.status === 'answered' ? (x.groups ? t('{n} 组', { n: x.groups.length }) : fmtVal(x.value, x.unit)) : x.reason))))) : el('p', { class: 'fa-empty' }, t('还没有取数记录'))));
      };

      const vCredit = () => {
        const c = credit.value;
        const list = meta.value?.checklists || [];
        const cl = (list.find((p) => p.id === c?.product) || list[0] || { items: [] }).items;
        if (!c) {
          return el('div', null,
            el('section', { class: 'fa-card' },
              el('h3', null, t('新建预审')),
              el('p', { class: 'fa-sub' }, t('AI 抽取财报、流水、证照关键数据并标出原文位置；勾稽、匹配、有效期等校验由程序按规则计算；预审意见只陈述发现和依据，不给出批准或拒绝的结论，由审批人逐条确认。')),
              !meta.value?.settings.modelInternal ? el('p', { class: 'fa-note warn' }, t('授信材料属于客户敏感数据：需在「安全与审计」确认当前模型为内网私有部署，抽取和起草意见才能运行（材料清单检查、程序校验不受影响）。')) : null,
              el('div', { class: 'fa-row' },
                el('input', { class: 'fa-in', placeholder: t('借款人名称'), value: newCredit.borrower, onInput: (e) => { newCredit.borrower = e.target.value; } }),
                el('select', { class: 'fa-in', value: newCredit.product, onChange: (e) => { newCredit.product = e.target.value; } }, list.map((p) => el('option', { value: p.id }, p.name))),
                el('button', { class: 'fa-btn pri', disabled: busy.credit, 'data-test': 'fa-credit-create', onClick: createCredit }, t('新建'))),
              errNote('credit')),
            el('section', { class: 'fa-card' }, el('h3', null, t('预审记录')),
              credits.value.length ? el('table', { class: 'fa-tbl' }, el('tbody', null, credits.value.map((r) => el('tr', null, el('td', null, r.borrower), el('td', null, (list.find((p) => p.id === r.product) || {}).name || r.product), el('td', null, new Date(r.createdAt).toLocaleString()), el('td', null, el('button', { class: 'fa-link', onClick: () => openCredit(r.id) }, t('打开'))))))) : el('p', { class: 'fa-empty' }, t('还没有预审记录'))));
        }
        const issues = (c.checks || []).filter((x) => x.level !== 'pass');
        return el('div', null,
          el('div', { class: 'fa-row', style: 'margin-top:12px' }, el('button', { class: 'fa-btn sm', onClick: () => { credit.value = null; loadCredits(); } }, t('← 返回列表')), el('b', null, c.borrower), el('span', { class: 'fa-st' }, (list.find((p) => p.id === c.product) || {}).name || '')),
          errNote('credit'),
          card('cr-1', t('① 材料与缺件'), !!c.files.length, t('按业务品种的材料清单检查缺件；文件按名称自动归类，归错的可重新命名后上传。'),
            el('div', { class: 'fa-row' },
              el('label', { class: 'fa-btn pri' }, t('上传材料'), el('input', { type: 'file', multiple: true, accept: '.pdf,.docx,.txt,.csv', hidden: true, onChange: async (e) => { for (const f of [...(e.target.files || [])]) setCredit(await call('credit', 'credit.upload', { id: c.id, fileName: f.name, base64: await readBase64(f) })); e.target.value = ''; } })),
              el('button', { class: 'fa-btn', disabled: busy.credit, 'data-test': 'fa-credit-demo', onClick: async () => setCredit(await call('credit', 'credit.demo', { id: c.id })) }, t('载入示例材料'))),
            el('table', { class: 'fa-tbl' }, el('thead', null, el('tr', null, el('th', null, t('材料')), el('th', null, t('必备')), el('th', null, t('已上传')))),
              el('tbody', null, cl.map((it) => { const fs = c.files.filter((f) => f.kind === it.id); return el('tr', null, el('td', null, it.name), el('td', null, it.required ? t('是') : t('否')), el('td', null, fs.length ? fs.map((f) => f.name).join('、') : el('span', { class: it.required ? 'fa-lv high' : 'fa-empty' }, it.required ? t('缺件') : '—'))); }))),
            c.files.filter((f) => !f.kind).length ? el('p', { class: 'fa-note info' }, t('未能归类：{p0}', { p0: c.files.filter((f) => !f.kind).map((f) => f.name).join('、') })) : null),
          card('cr-2', t('② 关键数据抽取'), Object.keys(c.values || {}).length > 0, t('模型从财报和执照里找值并摘出原话，程序在原文里找位置——找不到位置的值标「未在原文找到」。任何人工修改都记录修改前后的值和修改人。'),
            el('button', { class: 'fa-btn pri', disabled: busy.credit || !c.files.length, 'data-test': 'fa-credit-extract', onClick: async () => setCredit(await call('credit', 'credit.extract', { id: c.id })) }, busy.credit ? t('处理中…') : t('抽取关键数据')),
            Object.keys(c.values || {}).length ? el('table', { class: 'fa-tbl' }, el('thead', null, el('tr', null, el('th', null, t('项目')), el('th', null, t('值')), el('th', null, t('原文')), el('th', null, t('位置')))),
              el('tbody', null, [...Object.entries(c.values).map(([k, v]) => el('tr', null, el('td', null, v.label, v.source === 'human' ? el('span', { class: 'fa-st' }, t('人工修改')) : null),
                el('td', null, el('input', { class: 'fa-in', style: 'width:150px', value: v.value == null ? '' : String(v.value), onChange: async (e) => setCredit(await call('credit', 'credit.setValue', { id: c.id, key: k, value: e.target.value })) })),
                el('td', null, el('span', { class: 'fa-empty' }, v.quote || '—')), el('td', null, v.loc ? t('第 {p} 页', { p: v.loc.page }) : el('span', { class: 'fa-lv medium' }, t('未在原文找到'))))),
                el('tr', null, el('td', null, t('营业执照有效期至')), el('td', null, el('input', { class: 'fa-in', type: 'date', value: c.licenseExpiry || '', onChange: async (e) => setCredit(await call('credit', 'credit.setValue', { id: c.id, key: 'licenseExpiry', value: e.target.value })) })), el('td', null, el('span', { class: 'fa-empty' }, c.licenseQuote || '—')), el('td', null, c.licenseLoc ? t('第 {p} 页', { p: c.licenseLoc.page }) : '—'))])) : null),
          card('cr-3', t('③ 程序校验'), !!c.checks?.length, t('资产负债平衡、流动比率、资产负债率、流水与报表收入匹配、证照有效期、大额与关联交易，全部由程序按规则计算，不交给模型判断。'),
            el('div', { class: 'fa-row' },
              el('input', { class: 'fa-in', style: 'flex:1;min-width:260px', placeholder: t('已披露关联方（用顿号分隔）'), value: relatedText.value, onInput: (e) => { relatedText.value = e.target.value; } }),
              el('label', null, t('大额交易阈值（元，默认参照对公单笔 200 万元大额报告标准）'), ' ', el('input', { class: 'fa-in', style: 'width:130px', value: threshold.value, onInput: (e) => { threshold.value = e.target.value; } })),
              el('button', { class: 'fa-btn pri', disabled: busy.credit, 'data-test': 'fa-credit-check', onClick: async () => setCredit(await call('credit', 'credit.check', { id: c.id, related: relatedText.value.split(/[、,，\s]+/), largeThreshold: Number(threshold.value) })) }, t('运行校验'))),
            c.flowSummary ? el('p', { class: 'fa-note info' }, t('流水 {n} 笔：入账 {a}，出账 {b}', { n: c.flowSummary.count, a: fmtMoney(c.flowSummary.inflow), b: fmtMoney(c.flowSummary.outflow) })) : null,
            c.checks?.length ? el('table', { class: 'fa-tbl', 'data-test': 'fa-credit-checks' }, el('thead', null, el('tr', null, el('th', null, t('结果')), el('th', null, t('检查项')), el('th', null, t('发现')), el('th', null, t('规则')))),
              el('tbody', null, c.checks.map((x) => el('tr', null, el('td', null, el('span', { class: `fa-lv ${x.level}` }, lv(x.level))), el('td', null, x.title), el('td', null, x.detail), el('td', null, el('span', { class: 'fa-empty' }, x.rule)))))) : null),
          card('cr-4', t('④ 预审意见'), !!c.opinion, t('模型根据校验结果起草，只陈述发现和依据；出现「建议批准 / 拒绝」一类结论的句子由程序删除。意见为草稿，决定由审批人作出。'),
            el('button', { class: 'fa-btn pri', disabled: busy.credit || !c.checks?.length, 'data-test': 'fa-credit-opinion', onClick: async () => setCredit(await call('credit', 'credit.opinion', { id: c.id })) }, busy.credit ? t('起草中…') : t('起草预审意见')),
            c.opinion ? el('div', null, el('div', { class: 'fa-ans fa-q', style: 'margin-top:10px' }, c.opinion), c.opinionStripped ? el('p', { class: 'fa-note warn' }, t('模型写了带结论的句子，已由程序删除。')) : null) : null),
          card('cr-5', t('⑤ 人工确认'), issues.length > 0 && issues.every((x) => c.decisions?.[x.id]), t('审批人对每条发现逐条确认、修改或驳回；所有操作和对 AI 抽取值的修改都留痕。'),
            issues.length ? el('table', { class: 'fa-tbl' }, el('tbody', null, issues.map((x) => { const d0 = c.decisions?.[x.id]; return el('tr', null, el('td', null, el('span', { class: `fa-lv ${x.level}` }, lv(x.level))), el('td', null, x.title, el('div', { class: 'fa-empty' }, x.detail)),
              el('td', null, ['confirm', 'modify', 'reject'].map((k) => el('button', { class: `fa-btn sm${d0?.decision === k ? ' pri' : ''}`, onClick: async () => setCredit(await call('credit', 'credit.decide', { id: c.id, checkId: x.id, decision: k, note: d0?.note || '' })) }, { confirm: t('确认'), modify: t('修改'), reject: t('驳回') }[k]))),
              el('td', null, el('input', { class: 'fa-in', placeholder: t('说明（可空）'), value: d0?.note || '', onChange: async (e) => setCredit(await call('credit', 'credit.decide', { id: c.id, checkId: x.id, decision: d0?.decision || 'confirm', note: e.target.value })) }))); }))) : el('p', { class: 'fa-empty' }, t('先运行程序校验')),
            c.edits?.length ? el('details', null, el('summary', null, t('修改记录（{n}）', { n: c.edits.length })), el('table', { class: 'fa-tbl' }, el('tbody', null, c.edits.map((e) => el('tr', null, el('td', null, e.at.slice(0, 19).replace('T', ' ')), el('td', null, e.field), el('td', null, `${e.before ?? '—'} → ${e.after ?? '—'}`), el('td', null, e.by)))))) : null));
      };

      const vMkt = () => {
        const x = mkt.value;
        const marked = () => {
          if (!x) return null;
          const spans = x.issues.filter((i) => i.at >= 0 && i.quote).sort((a, b) => a.at - b.at);
          const out = [];
          let pos = 0;
          for (const s of spans) { if (s.at < pos) continue; out.push(x.text.slice(pos, s.at)); out.push(el('mark', { class: 'fa-mark', title: s.rule }, x.text.slice(s.at, s.at + s.quote.length))); pos = s.at + s.quote.length; }
          out.push(x.text.slice(pos));
          return el('div', { class: 'fa-ans fa-q' }, out);
        };
        return el('div', null,
          card('mk-1', t('① 提交物料'), !!x, t('规则库由合规与法务部门维护（禁用表述、必备风险提示、收益表述要求），规则做硬匹配；模型补充语义判断（是否暗示保本、夸大收益、与存款混同）。被审查的文案当作数据处理，其中夹带的指令不影响结论。'),
            el('div', { class: 'fa-row' },
              el('input', { class: 'fa-in', style: 'flex:1', placeholder: t('物料名称（可空）'), value: mktForm.title, onInput: (e) => { mktForm.title = e.target.value; } }),
              el('button', { class: 'fa-btn', 'data-test': 'fa-mkt-demo', onClick: async () => { mktForm.text = (await call('mkt', 'mkt.demoText')) || ''; mktForm.title = t('稳盈 365 天宣传海报（示例）'); } }, t('载入示例文案'))),
            el('textarea', { class: 'fa-in fa-ta', placeholder: t('粘贴宣传文案、海报文字或短视频脚本'), value: mktForm.text, onInput: (e) => { mktForm.text = e.target.value; } }),
            el('div', { class: 'fa-row' }, el('button', { class: 'fa-btn pri', disabled: busy.mkt || !mktForm.text.trim(), 'data-test': 'fa-mkt-review', onClick: async () => { const r = await call('mkt', 'mkt.review', { ...mktForm }); if (r) { mkt.value = r; await loadMkt(); } } }, busy.mkt ? t('审查中…') : t('开始审查')), el('span', { class: 'fa-empty' }, meta.value ? t('规则库 {v} 版：禁用表述 {a} 类、必备提示 {b} 项', { v: meta.value.mktRules.version, a: meta.value.mktRules.banned, b: meta.value.mktRules.required }) : '')),
            errNote('mkt'),
            mktList.value.length ? el('details', null, el('summary', null, t('审查记录（{n}）', { n: mktList.value.length })), el('table', { class: 'fa-tbl' }, el('tbody', null, mktList.value.map((r) => el('tr', null, el('td', null, r.at.slice(0, 16).replace('T', ' ')), el('td', null, r.title), el('td', null, t('{n} 个问题，{m} 个待处理', { n: r.issues, m: r.open })), el('td', null, el('button', { class: 'fa-link', onClick: async () => { mkt.value = await call('mkt', 'mkt.get', { id: r.id }); } }, t('打开')))))))) : null),
          card('mk-2', t('② 问题清单与处理'), !!x && x.issues.every((i) => i.decision), t('每条问题附依据和修改建议；合规岗逐条确认是否构成问题，终审仍由合规岗签字。'),
            x ? el('div', { class: 'fa-cols' },
              el('div', null, x.issues.length ? x.issues.map((i) => el('div', { class: 'fa-card', style: 'margin-top:8px;padding:10px 12px' },
                el('div', { class: 'fa-row' }, el('span', { class: `fa-lv ${i.level}` }, i.level === 'high' ? t('高') : t('中')), el('b', null, i.rule), i.kind === 'semantic' ? el('span', { class: 'fa-st' }, t('模型语义判断')) : el('span', { class: 'fa-st' }, t('规则硬匹配'))),
                el('div', { class: 'fa-q' }, i.quote ? `「${i.quote}」` : t('缺少必备内容')),
                el('p', { class: 'fa-sub', style: 'margin:4px 0' }, `${t('依据')}：${i.basis || '—'}`),
                i.suggestion ? el('p', { class: 'fa-sub', style: 'margin:4px 0' }, `${t('建议')}：${i.suggestion}`) : null,
                el('div', { class: 'fa-row' }, [['accept', t('确认问题')], ['dismiss', t('不构成问题')]].map(([k, label]) => el('button', { class: `fa-btn sm${i.decision === k ? ' pri' : ''}`, onClick: async () => { mkt.value = await call('mkt', 'mkt.decide', { id: x.id, idx: i.idx, decision: k }); await loadMkt(); } }, label))))) : el('p', { class: 'fa-note ok' }, t('没有发现问题（终审仍需合规岗签字）')),
                x.semanticError ? el('p', { class: 'fa-note warn' }, t('语义判断没有完成（{p0}），以上仅为规则硬匹配结果', { p0: x.semanticError })) : null),
              el('div', null, el('p', { class: 'fa-sub' }, t('原文（标黄处为问题位置）')), marked())) : el('p', { class: 'fa-empty' }, t('先提交物料'))),
          card('mk-3', t('③ 导出预审意见'), !!x?.exported, t('导出带问题清单、依据和处理结果的预审意见（草稿标记），交合规岗终审签字后作为发布依据。'),
            el('button', { class: 'fa-btn pri', disabled: !x, onClick: async () => { const p = await call('mkt', 'mkt.export', { id: x.id }); if (p) { mkt.value = { ...x, exported: p }; sdk.notify.success(t('已导出：{p0}', { p0: p })); } } }, t('导出预审意见'))));
      };

      const KIND = { docs: '本方案文档库', app: '本机知识库', db: '远程数据库（只读）', http: '远程检索接口' };
      const LEVEL = { public: '公开', internal: '内部', sensitive: '客户敏感' };
      const levelSel = (v, on) => el('select', { class: 'fa-in', value: v, onChange: (e) => on(e.target.value) }, Object.entries(LEVEL).map(([k, x]) => el('option', { value: k }, t(x))));
      const saveSource = async (src, token) => { await call('kb', 'kb.source.save', { source: src, ...(token ? { token } : {}) }); await loadKb(); };
      const vKb = () => {
        const ov = kbOv.value;
        const cap = ov.capabilities || {};
        const f = kbForm;
        const form = () => {
          if (!f.kind) return null;
          const body = f.kind === 'app'
            ? [el('label', null, t('知识库图谱'), ' ', el('select', { class: 'fa-in', value: f.graphId, onChange: (e) => (f.graphId = e.target.value) }, el('option', { value: '' }, t('当前图谱')), appGraphs.value.map((g) => el('option', { value: g.id }, g.name || g.id))))]
            : f.kind === 'db'
              ? [
                  el('div', { class: 'fa-row' }, t('数据源'), ' ', el('select', { class: 'fa-in', value: f.dataSource, onChange: (e) => (f.dataSource = e.target.value) }, el('option', { value: '' }, dbSources.value.length ? t('选择数据源') : t('还没有数据源：在「设置 → 企业数据 · 多库分析」里添加')), dbSources.value.map((d) => el('option', { value: d.name }, `${d.name}${d.kind ? `（${d.kind}）` : ''}`)))),
                  el('textarea', { class: 'fa-in fa-ta', style: 'min-height:70px;font-family:ui-monospace,Menlo,monospace;font-size:12px', value: f.sql, onInput: (e) => (f.sql = e.target.value) }),
                  el('p', { class: 'fa-sub', style: 'margin:4px 0' }, t('只允许 SELECT；问题里的关键词以 {{q}} 代入（程序转义，按值替换，不拼接原句）。走 App 的只读数据库通道：只读守卫、子账号授权、脱敏与数据访问审计都生效。')),
                  el('div', { class: 'fa-row' }, t('标题列'), el('input', { class: 'fa-in', style: 'width:120px', value: f.titleCol, onInput: (e) => (f.titleCol = e.target.value) }), t('内容列'), el('input', { class: 'fa-in', style: 'width:120px', value: f.textCol, onInput: (e) => (f.textCol = e.target.value) }), t('出处列（可空）'), el('input', { class: 'fa-in', style: 'width:120px', value: f.refCol, onInput: (e) => (f.refCol = e.target.value) })),
                ]
              : f.kind === 'http'
                ? [
                    el('div', { class: 'fa-row' }, el('input', { class: 'fa-in', style: 'flex:1;min-width:320px', placeholder: 'https://kb.example.bank/api/search', value: f.url, onInput: (e) => (f.url = e.target.value) }), el('input', { class: 'fa-in', type: 'password', style: 'width:220px', placeholder: t('访问令牌（可空，加密保存）'), value: f.token, onInput: (e) => (f.token = e.target.value) })),
                    el('p', { class: 'fa-sub', style: 'margin:4px 0' }, t('请求：POST {query, keywords, topK}，带 Authorization: Bearer 令牌；8 秒超时、返回体 ≤2MB。按下面的字段路径取结果：')),
                    el('div', { class: 'fa-row' }, t('列表'), el('input', { class: 'fa-in', style: 'width:120px', value: f.itemsPath, onInput: (e) => (f.itemsPath = e.target.value) }), t('标题'), el('input', { class: 'fa-in', style: 'width:110px', value: f.titleField, onInput: (e) => (f.titleField = e.target.value) }), t('正文'), el('input', { class: 'fa-in', style: 'width:110px', value: f.textField, onInput: (e) => (f.textField = e.target.value) }), t('链接'), el('input', { class: 'fa-in', style: 'width:110px', value: f.urlField, onInput: (e) => (f.urlField = e.target.value) })),
                  ]
                : [];
          return el('div', { class: 'fa-kbform' },
            el('div', { class: 'fa-row' }, el('b', null, t('新增：{p0}', { p0: t(KIND[f.kind]) })), el('input', { class: 'fa-in', placeholder: t('名称（可空）'), value: f.name, onInput: (e) => (f.name = e.target.value) }), t('数据级别'), levelSel(f.level, (v) => (f.level = v))),
            body,
            el('div', { class: 'fa-row' },
              el('button', { class: 'fa-btn pri', disabled: busy.kb, 'data-test': 'fa-kb-save', onClick: async () => { try { await saveSource({ kind: f.kind, name: f.name, level: f.level, graphId: f.graphId, dataSource: f.dataSource, sql: f.sql, titleCol: f.titleCol, textCol: f.textCol, refCol: f.refCol, url: f.url, itemsPath: f.itemsPath, titleField: f.titleField, textField: f.textField, urlField: f.urlField }, f.token); f.kind = ''; f.token = ''; } catch (_) { /* errNote */ } } }, t('保存来源')),
              el('button', { class: 'fa-btn', onClick: () => (f.kind = '') }, t('取消'))));
        };
        const r = kbRes.value;
        return el('div', null,
          card('kb-1', t('① 知识来源'), ov.sources.some((x) => x.enabled), t('知识来源可以是本地的（本方案文档库、App 本机知识库），也可以是远程的（只读数据库、内网检索接口）；可多选、各自设数据级别。客户敏感级的来源只有确认内网模型时才会被引用（「设置」页里确认）。'),
            ov.sources.length ? el('table', { class: 'fa-tbl', 'data-test': 'fa-kb-sources' }, el('thead', null, el('tr', null, [t('来源'), t('类型'), t('数据级别'), t('启用'), ''].map((x) => el('th', null, x)))),
              el('tbody', null, ov.sources.map((x) => el('tr', null,
                el('td', null, x.name, x.kind === 'db' ? el('div', { class: 'fa-sub', style: 'margin:0' }, x.dataSource) : x.kind === 'http' ? el('div', { class: 'fa-sub', style: 'margin:0' }, `${x.url}${x.hasToken ? ` · ${t('已存令牌')}` : ''}`) : null),
                el('td', null, t(KIND[x.kind])),
                el('td', null, levelSel(x.level, (v) => saveSource({ ...x, level: v }))),
                el('td', null, el('input', { type: 'checkbox', checked: x.enabled, onChange: (e) => saveSource({ ...x, enabled: e.target.checked }) })),
                el('td', null, el('button', { class: 'fa-link', onClick: async () => { await call('kb', 'kb.source.remove', { id: x.id }); await loadKb(); } }, t('删除'))))))) : el('p', { class: 'fa-empty' }, t('还没有知识来源')),
            el('div', { class: 'fa-row', style: 'margin-top:10px' },
              el('span', { class: 'fa-sub', style: 'margin:0' }, t('新增来源：')),
              el('button', { class: 'fa-btn', disabled: !cap.app, title: cap.app ? '' : t('当前 App 版本没有知识库检索'), onClick: () => Object.assign(f, { kind: 'app', level: 'internal' }) }, el('i', { class: 'ri-book-2-line' }), ' ', t('本机知识库')),
              el('button', { class: 'fa-btn', disabled: !cap.db, title: cap.db ? '' : t('当前 App 版本没有只读数据库通道'), onClick: () => Object.assign(f, { kind: 'db', level: 'internal' }) }, el('i', { class: 'ri-database-2-line' }), ' ', t('远程数据库（只读）')),
              el('button', { class: 'fa-btn', onClick: () => Object.assign(f, { kind: 'http', level: 'internal' }) }, el('i', { class: 'ri-global-line' }), ' ', t('远程检索接口'))),
            form(),
            errNote('kb'),
            el('div', { class: 'fa-kbdocs' },
              el('div', { class: 'fa-row' }, el('b', null, t('本方案文档库')), el('span', { class: 'fa-sub', style: 'margin:0' }, t('产品说明书、监管文件、培训材料（PDF / Word / Excel / PPT / 文本，扫描件自动识别文字）；只存本机')),
                el('span', { style: 'flex:1' }), t('导入为'), levelSel(kbLevelNew.value, (v) => (kbLevelNew.value = v)),
                el('label', { class: 'fa-btn pri', style: 'display:inline-block' }, busy.kbdoc ? t('导入中…') : t('导入文档'), el('input', { type: 'file', multiple: true, accept: '.pdf,.doc,.docx,.xls,.xlsx,.csv,.ppt,.pptx,.txt,.md', style: 'display:none', onChange: async (e) => { const files = [...e.target.files]; e.target.value = ''; for (const file of files) { try { await call('kbdoc', 'kb.doc.import', { fileName: file.name, base64: await readBase64(file), level: kbLevelNew.value }); } catch (_) { /* errNote */ } } await loadKb(); } })),
                el('button', { class: 'fa-btn', disabled: busy.kbdoc, 'data-test': 'fa-kb-demo', onClick: async () => { await call('kbdoc', 'kb.doc.demo'); await loadKb(); } }, t('载入示例知识'))),
              errNote('kbdoc'),
              ov.docs.length ? el('table', { class: 'fa-tbl' }, el('tbody', null, ov.docs.map((d) => el('tr', null, el('td', null, d.name), el('td', null, t(LEVEL[d.level] || d.level)), el('td', null, t('{n} 段', { n: d.chunks })), el('td', null, el('button', { class: 'fa-link', onClick: async () => { await call('kb', 'kb.doc.remove', { id: d.id }); await loadKb(); } }, t('移除'))))))) : null)),
          card('kb-2', t('② 检索测试'), !!r, t('输入一个问题，看各来源各自命中了什么（每个来源单独限时，某个来源出错不影响其它来源）。'),
            el('div', { class: 'fa-row' },
              el('input', { class: 'fa-in', style: 'flex:1;min-width:280px', 'data-test': 'fa-kb-q', placeholder: t('例如：稳盈 365 天的起购金额和费用是多少？'), value: kbQ.value, onInput: (e) => (kbQ.value = e.target.value), onKeydown: (e) => e.key === 'Enter' && !e.isComposing && document.querySelector('[data-test="fa-kb-search"]')?.click() }),
              el('button', { class: 'fa-btn pri', disabled: busy.kbs || !kbQ.value.trim(), 'data-test': 'fa-kb-search', onClick: async () => { kbRes.value = await call('kbs', 'kb.search', { q: kbQ.value }); } }, busy.kbs ? t('检索中…') : t('检索'))),
            errNote('kbs'),
            r ? el('div', null,
              el('div', { class: 'fa-row' }, r.status.map((x) => el('span', { class: `fa-st${x.ok ? ' done' : ''}`, title: x.error || '' }, `${x.name}：${x.ok ? t('{n} 条', { n: x.hits }) : t('出错')}`))),
              r.droppedSensitive ? el('p', { class: 'fa-note warn' }, t('有 {n} 条客户敏感级知识没有使用：未确认内网模型', { n: r.droppedSensitive })) : null,
              r.status.filter((x) => !x.ok).map((x) => el('p', { class: 'fa-note err' }, `${x.name}：${x.error}`)),
              r.hits.length ? r.hits.map((x, i) => el('div', { class: 'fa-q', 'data-test': 'fa-kb-hit' }, `[${i + 1}] ${x.title} · ${x.sourceName} · ${t(LEVEL[x.level] || x.level)}${x.ref && x.ref !== x.title ? ` · ${x.ref}` : ''}\n${x.text}`)) : el('p', { class: 'fa-empty' }, t('没有命中'))) : null),
          card('kb-3', t('③ 用在哪里'), !!ov.settings?.useInQa, t('打开后，制度问答（含手机端）会把知识库命中当补充依据：制度条款优先，与制度冲突以制度为准；回答里知识库出处单独标注，数字同样回原文核对。'),
            el('label', { class: 'fa-row', style: 'cursor:pointer' }, el('input', { type: 'checkbox', checked: !!ov.settings?.useInQa, 'data-test': 'fa-kb-useqa', onChange: async (e) => { await call('kb', 'kb.settings', { useInQa: e.target.checked }); await loadKb(); } }), t('制度与合规问答（含手机端）引用金融知识库')),
            el('div', { class: 'fa-row' }, t('每次最多引用'), el('select', { class: 'fa-in', value: String(ov.settings?.topK || 4), onChange: async (e) => { await call('kb', 'kb.settings', { topK: Number(e.target.value) }); await loadKb(); } }, [2, 3, 4, 5, 6, 8].map((n) => el('option', { value: String(n) }, String(n)))), t('条知识'))));
      };

      const vOps = () => el('div', null,
        el('section', { class: 'fa-card' }, el('h3', null, t('已有现成工作台的场景')),
          el('p', { class: 'fa-sub' }, t('后台运营场景已有分步工作台：金额按规则以分为单位计算，模型不参与算账；每一笔结果都能追溯到原始单据；涉及资金和开票的最终按钮由人操作。')),
          el('div', { class: 'fa-grid' }, [
            ['对账核销', '按规则匹配流水与账单，金额由程序按分计算，差异逐笔列出；财务确认', '/workbenches/service-settlement'],
            ['发票处理', '识别、归档、批量开票文件生成；最终开具由人操作', '/workbenches/invoice-agent'],
            ['流程时效监控', '读取 OA、费控流程数据，计算各节点时效、逾期与排名，生成周报月报', '/workbenches/flow-sla'],
            ['合同审查', '按审查清单逐条检查，输出带修订痕迹的 Word 和风险说明；法务确认', '/workbenches/legal-agent'],
          ].map(([a, b, path]) => el('div', { class: 'fa-kpi' }, el('b', { style: 'font-size:15px' }, t(a)), el('p', { class: 'fa-sub' }, t(b)), el('button', { class: 'fa-btn sm', onClick: () => sdk.navigate(path) }, t('打开'))))),
          el('p', { class: 'fa-note info' }, t('没有开通的工作台打开后会提示申请开通。'))),
        el('section', { class: 'fa-card' }, el('h3', null, t('按项目交付的场景')),
          el('p', { class: 'fa-sub' }, t('以下场景需按机构口径、规则和系统配置或专项开发，在实施阶段落地；研发效能（编码助手、代码评审）不在本工作台。')),
          el('table', { class: 'fa-tbl' }, el('tbody', null, [
            ['前台', '客户经理助手、智能客服与回访、销售陪练与质检'],
            ['中台', '制度变更影响分析、报送数据核查、反洗钱报告辅助'],
            ['后台', '内审与稽核底稿、公文与会议纪要'],
            ['科技与数据', '指标口径库与血缘（二期，与智能问数共用口径库）、业务自建小工具（AutoCoder）'],
          ].map(([a, b]) => el('tr', null, el('td', null, el('b', null, t(a))), el('td', null, t(b))))))));

      return () => el('div', { class: 'fa' },
        el('style', null, CSS + THEME),
        el('div', { style: 'padding-top:14px' },
          el('div', { class: 'fa-banner' }, el('span', { class: 'fa-ico' }, el('i', { class: 'ri-bank-line' })),
            el('div', { class: 'fa-grow' }, el('h2', null, t('智能金融助手'), el('span', { class: 'fa-up', title: t('合规提效：制度问答、问数、预审、营销审查') }, el('i', { class: 'ri-arrow-right-up-line' }), t('合规 · 提效'))), el('p', null, t('制度问答、智能问数、授信材料预审、营销物料审查；数据不出域、数字不出错、过程留痕、关键动作人签、老系统零改造。')),
              el('div', { class: 'fa-badges' }, [t('数据不能出域'), t('数字不能出错'), t('过程必须留痕'), t('关键动作必须有人签'), t('老系统不能大改')].map((b) => el('span', null, b)))),
            el('button', { class: 'fa-demo', disabled: busy.demo, 'data-test': 'fa-demo-all', title: t('一次填入全部演示数据：示例制度、零售存款数据、一笔授信预审（材料、取数与程序校验）、营销文案和各页签的示例问题；不调用模型、不产生费用'), onClick: demoAll }, busy.demo ? t('载入中…') : t('一键载入演示数据'))),
          errNote('demo')),
        // 页签 + 步骤 + 进度条吸顶（横幅不吸顶，免得占掉半屏）
        el('div', { class: 'fa-sticky' },
          el('nav', { class: 'fa-tabs', role: 'tablist' }, TABS.map((x) => el('button', { class: `fa-tab${tab.value === x.key ? ' on' : ''}`, role: 'tab', 'aria-selected': tab.value === x.key, 'data-test': `fa-tab-${x.key}`, onClick: () => select(x.key) }, el('i', { class: x.icon, style: 'margin-inline-end:6px' }), t(x.title)))),
          steps.value.length ? el('div', null,
            el('div', { class: 'fa-steps' }, steps.value.map((s, i) => el('button', { class: `${s.done ? 'done' : ''}${!s.done && steps.value.findIndex((x) => !x.done) === i ? ' cur' : ''}`, onClick: () => go(s.id) }, `${s.done ? '✓ ' : ''}${s.title}`))),
            el('div', { class: 'fa-prog' }, el('i', { style: `width:${progress.value}%` }))) : null),
        LAZY[tab.value] ? (lazyMods[tab.value] ? lazyMods[tab.value].view() : el('section', { class: 'fa-card', 'data-test': 'fa-lazy-loading' }, lazyErr[tab.value] ? el('p', { class: 'fa-note err' }, t('模块加载失败：{p0}', { p0: lazyErr[tab.value] })) : el('p', { class: 'fa-empty' }, el('i', { class: 'ri-loader-4-line' }), ' ', t('正在加载模块…'))))
          : tab.value === 'overview' ? vOverview() : tab.value === 'qa' ? vQa() : tab.value === 'kb' ? [vKb(), subView('kbx')] : tab.value === 'ask' ? [vAsk(), subView('askx')] : tab.value === 'credit' ? vCredit() : tab.value === 'mkt' ? vMkt() : vOps());
    },
  });
}
