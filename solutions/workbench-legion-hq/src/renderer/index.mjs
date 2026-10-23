/**
 * 运营中心 · 控制台（渲染入口，ESM，宿主经 tc-solution:// 加载）。
 *
 * 主控 / 单机：分步工作台（每步独立状态，进度条吸顶常驻视口）
 *   ① 部门与机器  ② 公司信息  ③ 指挥大屏  ④ 下令与老板待办  ⑤ 例行事务  ⑥ 导演台  ⑦ 能力地图
 * 子机（员工机）：本机承载的部门 + 主控派来的正在跑的任务（大字卡），供台上每台机器屏幕有看头。
 *
 * 不 import 'vue'：用 sdk.vue（与宿主同一实例）。所有数据经 sdk.invoke 取主进程，sdk.on 收推送。
 */
export default function createSolution(sdk) {
  const { defineComponent, h, ref, reactive, computed, onMounted, onUnmounted } = sdk.vue;
  const t = (s, p) => sdk.t(s, p);

  const CSS = `
.lhq{max-width:1180px;margin:0 auto;padding:0 24px 64px;font-size:14px;color:var(--color-text-primary,#111827)}
.lhq-sticky{position:sticky;top:0;z-index:5;background:var(--color-bg-page,var(--color-bg,#f8fafc));padding:16px 0 10px;border-bottom:1px solid var(--color-border,#e5e7eb)}
.lhq-head{display:flex;align-items:center;gap:12px;flex-wrap:wrap}
.lhq-head h2{margin:0;font-size:20px}
.lhq-badge{font-size:12px;padding:2px 8px;border-radius:10px;border:1px solid var(--color-border,#e5e7eb);color:var(--color-text-secondary,#6b7280)}
.lhq-badge.on{border-color:#10b981;color:#047857;background:#ecfdf5}
.lhq-badge.warn{border-color:#f59e0b;color:#b45309;background:#fffbeb}
.lhq-steps{display:flex;gap:6px;margin-top:10px;flex-wrap:wrap}
.lhq-steps button{border:1px solid var(--color-border,#e5e7eb);background:var(--color-bg-card,#fff);border-radius:16px;padding:4px 12px;font-size:12.5px;cursor:pointer;color:inherit}
.lhq-steps button.done{border-color:#10b981;color:#047857}
.lhq-steps button.cur{border-color:var(--color-brand,#6366f1);color:var(--color-brand,#6366f1)}
.lhq-prog{height:4px;background:var(--color-border,#e5e7eb);border-radius:2px;margin-top:8px;overflow:hidden}
.lhq-prog i{display:block;height:100%;background:var(--color-brand,#6366f1);transition:width .3s}
.lhq-card{border:1px solid var(--color-border,#e5e7eb);border-radius:12px;padding:16px 18px;margin-top:16px;background:var(--color-bg-card,#fff);scroll-margin-top:120px}
.lhq-card h3{margin:0 0 4px;font-size:16px;display:flex;align-items:center;gap:8px}
.lhq-card h3 .st{font-size:12px;font-weight:400;padding:1px 8px;border-radius:9px;border:1px solid var(--color-border,#e5e7eb);color:var(--color-text-secondary,#6b7280)}
.lhq-card h3 .st.done{border-color:#10b981;color:#047857}
.lhq-sub{margin:0 0 12px;color:var(--color-text-secondary,#6b7280);font-size:13px;line-height:1.6}
.lhq-btn{padding:6px 14px;border-radius:8px;border:1px solid var(--color-border,#d1d5db);background:var(--color-bg-card,#fff);cursor:pointer;color:inherit;font-size:13px}
.lhq-btn.pri{border-color:var(--color-brand,#6366f1);background:var(--color-brand,#6366f1);color:#fff}
.lhq-btn.warn{border-color:#f59e0b;background:#f59e0b;color:#1f2937}
.lhq-btn.danger{color:#dc2626}
.lhq-btn:disabled{opacity:.5;cursor:default}
.lhq-row{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin:6px 0}
.lhq-in{border:1px solid var(--color-border,#d1d5db);border-radius:8px;padding:6px 10px;font:inherit;background:var(--color-bg-card,#fff);color:inherit}
.lhq-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:10px 16px}
.lhq-grid label{display:block;font-size:12.5px;color:var(--color-text-secondary,#6b7280);margin-bottom:4px}
.lhq-grid .lhq-in{width:100%;box-sizing:border-box}
.lhq-tbl{width:100%;border-collapse:collapse;font-size:13px}
.lhq-tbl th,.lhq-tbl td{border-bottom:1px solid var(--color-border,#e5e7eb);padding:7px 8px;text-align:left;vertical-align:top}
.lhq-tbl th{font-weight:500;color:var(--color-text-secondary,#6b7280);white-space:nowrap}
.lhq-chip{display:inline-block;font-size:12px;padding:1px 7px;border-radius:5px;border:1px solid;margin:0 4px 4px 0;white-space:nowrap}
.lhq-chip.on{color:#fff}
.lhq-mono{font-family:Menlo,Consolas,monospace;font-size:12.5px;word-break:break-all}
.lhq-task{border:1px solid var(--color-border,#e5e7eb);border-radius:10px;padding:10px 12px;margin-bottom:8px}
.lhq-task .tt{display:flex;gap:8px;align-items:center;font-weight:600}
.lhq-task .tt .s{margin-left:auto;font-weight:400;font-size:12px}
.lhq-out{white-space:pre-wrap;background:var(--color-bg-subtle,#f8fafc);border-radius:8px;padding:10px;margin-top:8px;max-height:360px;overflow:auto;font-size:13px;line-height:1.6}
.lhq-empty{color:var(--color-text-secondary,#6b7280);font-size:13px;padding:6px 0}
.lhq-big{border:2px solid;border-radius:14px;padding:18px 20px;margin-bottom:12px}
.lhq-big .n{font-size:13px;color:var(--color-text-secondary,#6b7280)}
.lhq-big .g{font-size:22px;font-weight:700;margin:6px 0}
.lhq-err{color:#dc2626;font-size:13px;margin-top:6px}
.lhq-qr{margin-top:6px;width:120px;height:120px}.lhq-qr svg{width:120px;height:120px;display:block}
.lhq-q{background:var(--color-bg-subtle,#f8fafc);border-radius:6px;padding:6px 8px;margin:6px 0;font-size:13px}
`;

  const STATUS = {
    triaging: '判定中', planning: '判定中', running: '执行中', summarizing: '汇总中', awaiting: '待老板确认',
    done: '已完成', failed: '未完成', cancelled: '已中止',
  };
  const SOURCE = { boss: '老板下令', cron: '定时例行', customer: '客户消息', mail: '来信', script: '剧本' };
  const ACTIVE = new Set(['triaging', 'planning', 'running', 'summarizing', 'awaiting']);
  const PRESETS = ['审一下这份采购合同的风险', '做一份新品推广方案', '客户投诉发货延迟怎么处理', '核算这个月的项目成本', '招聘两名前端开发', '下季度新品上市，全公司全面准备'];

  return defineComponent({
    name: 'LegionHqWorkbench',
    setup() {
      const info = ref(null);
      const snap = ref({ legions: [], machines: [], tasks: [], inbox: [], feed: [], legionLoad: {}, counters: {} });
      const machines = ref([]);
      const company = reactive({ name: '', short: '', logo: '', industry: '', products: '', boss: '', location: '', logoImage: '' });
      const companyFrom = ref('default');
      const screen = ref({ running: false, urls: [] });
      const displays = ref([]);
      const displayId = ref(null);
      const port = ref('');
      const routines = ref([]);
      const scripts = ref([]);
      const director = ref({ mode: 'idle' });
      const records = ref([]);
      const coverage = ref(null);
      const employee = ref({ hosted: [], running: [], recent: [], company: '' });
      const cmd = ref('');
      const forced = ref([]);
      const detail = ref(null);
      const busy = reactive({});
      const err = reactive({});
      const cur = ref('s1');
      const touched = reactive({ company: false, played: false });
      const report = ref(null);
      const cost = ref(null);
      const examData = ref(null);
      const examReport = ref(null);
      const examOpen = ref('');
      // L11：现场造一个新部门
      const customOpen = ref(false);
      // 按机器配模型（宿主「主控统一管理员工机配置」，与总控页同一份配置）
      const MC_ITEMS = [['text', '文字模型'], ['image', '图片模型'], ['video', '视频模型'], ['tts', '语音合成'], ['asr', '语音识别']];
      const mcfg = ref(null);
      const mcOpen = ref(''); // 'all' | 员工机 id
      const mcDraft = reactive({});
      const mcVal = (k, v) => (!v ? '' : k === 'text' ? v : `${v.provider}|${v.model || ''}`);
      const mcDesc = (k, v) => (!v ? '' : k === 'text' ? v : v.model ? `${v.provider} · ${v.model}` : v.provider);
      async function loadMcfg() {
        try { mcfg.value = await sdk.invoke('machineConfig.get'); } catch { mcfg.value = { available: false }; }
      }
      function openMc(scope) {
        if (mcOpen.value === scope) { mcOpen.value = ''; return; }
        mcOpen.value = scope;
        const own = scope === 'all' ? mcfg.value?.defaults || {} : mcfg.value?.perNode?.[scope];
        for (const [k] of MC_ITEMS) mcDraft[k] = scope !== 'all' && (!own || !Object.prototype.hasOwnProperty.call(own, k)) ? '__inherit' : mcVal(k, own?.[k]);
      }
      function mcOptions(k) {
        const o = mcfg.value?.options;
        if (!o) return [];
        if (k === 'text') return (o.text || []).map((m) => [m, m]);
        return (o.media?.[k] || []).map((p) => [`${p.provider}|${p.model || ''}`, p.model ? `${p.label} · ${p.model}` : p.label]);
      }
      function mcCurrent(id) {
        const cur = mcfg.value?.status?.[id]?.current;
        if (!cur) return '';
        const parts = [];
        if (cur.text?.model) parts.push(cur.text.model);
        for (const k of ['image', 'video']) if (cur.media?.[k]?.provider) parts.push(mcDesc(k, cur.media[k]));
        return parts.join(' / ');
      }
      async function saveMc() {
        const scope = mcOpen.value;
        const desired = {};
        for (const [k] of MC_ITEMS) {
          const v = mcDraft[k];
          if (v === '__inherit') desired[k] = '__inherit';
          else if (k === 'text') desired.text = v || null;
          else if (!v) desired[k] = null;
          else { const [provider, model] = v.split('|'); desired[k] = model ? { provider, model } : { provider }; }
        }
        busy.mc = true;
        try {
          const r = await sdk.invoke('machineConfig.save', { scope, desired });
          const rs = Object.values(r?.results || {});
          const bad = rs.filter((x) => x.state !== 'ok');
          if (!rs.length) sdk.notify.info(t('已保存；员工机上线后会自动下发'));
          else if (!bad.length) sdk.notify.info(t('已下发到 {p0} 台员工机', { p0: rs.length }));
          else sdk.notify.warn(t('{p0} 台没下发成功：{p1}', { p0: bad.length, p1: bad.map((x) => x.error).filter(Boolean).join('；').slice(0, 160) }));
          await loadMcfg();
          mcOpen.value = '';
        } catch (e) {
          sdk.notify.warn(e.message);
        } finally {
          busy.mc = false;
        }
      }
      function mcPanel() {
        if (!mcOpen.value) return null;
        const scope = mcOpen.value;
        const machine = machines.value.find((m) => m.id === scope);
        const st = scope === 'all' ? null : mcfg.value?.status?.[scope];
        return h('div', { class: 'lhq-card', style: 'padding:12px 14px;margin-top:10px' }, [
          h('b', scope === 'all' ? t('全部员工机的模型') : t('{p0} 的模型', { p0: machine?.name || scope })),
          h('p', { class: 'lhq-sub', style: 'margin:4px 0 8px' }, scope === 'all'
            ? t('选一次，所有员工机都用它；员工机新加入或重装后自动补上。key 由主控下发，员工机不用另配。')
            : t('每项可以跟随全部默认，或单独给这台指定。')),
          ...MC_ITEMS.map(([k, label]) => h('div', { class: 'lhq-row' }, [
            h('span', { style: 'width:72px;font-size:12.5px;color:var(--color-text-secondary,#6b7280)' }, t(label)),
            h('select', { class: 'lhq-in', style: 'min-width:280px', value: mcDraft[k], onChange: (e) => (mcDraft[k] = e.target.value) }, [
              scope !== 'all' ? h('option', { value: '__inherit' }, mcfg.value?.defaults?.[k] ? t('跟随全部默认（{p0}）', { p0: mcDesc(k, mcfg.value.defaults[k]) }) : t('跟随全部默认（不统一配置）')) : null,
              h('option', { value: '' }, t('不统一配置（员工机用自己的）')),
              ...mcOptions(k).map(([v, l]) => h('option', { value: v }, l)),
            ]),
          ])),
          MC_ITEMS.every(([k]) => !mcOptions(k).length) ? h('p', { class: 'lhq-sub' }, t('主控本机还没有配置模型：先在「设置 → 模型」和「设置 → 媒体模型」里配好，这里才有可选项。')) : null,
          st?.state && st.state !== 'ok' ? h('div', { class: 'lhq-err' }, st.error || '') : null,
          h('div', { class: 'lhq-row' }, [
            h('button', { class: 'lhq-btn pri', disabled: busy.mc, onClick: saveMc }, busy.mc ? t('下发中…') : scope === 'all' ? t('保存并下发到全部员工机') : t('保存并下发')),
            h('button', { class: 'lhq-btn', onClick: () => (mcOpen.value = '') }, t('取消')),
          ]),
        ]);
      }
      const customText = ref('');
      const customDraft = ref(null);
      async function draftCustom() {
        try {
          customDraft.value = await call('custom', 'legions.draftCustom', { text: customText.value });
          customDraft.value.hintsText = customDraft.value.routingHints.join('，');
        } catch (_) {
          /* 错误显示在 errLine */
        }
      }
      async function saveCustom() {
        const d = customDraft.value;
        try {
          await call('custom', 'legions.saveCustom', { name: d.name, short: d.short, summary: d.summary, routingHints: String(d.hintsText || '').split(/[,，、\s]+/).filter(Boolean), roles: d.roles, leadRole: d.leadRole, color: d.color });
          customDraft.value = null;
          customText.value = '';
          info.value = await sdk.invoke('info');
          sdk.notify.success(t('已新建部门，勾选承载它的机器后就能派活'));
        } catch (_) {
          /* 错误显示在 errLine */
        }
      }
      // L12：部门专用模型 / key
      const keysOpen = ref(false);
      const legionKeys = ref([]);
      const keyDraft = reactive({});
      async function loadLegionKeys() {
        legionKeys.value = await sdk.invoke('legionKeys.list');
        for (const k of legionKeys.value) keyDraft[k.legionId] = { provider: k.provider, model: k.model, baseUrl: k.baseUrl, outputChars: k.outputChars || 0, apiKey: '' };
      }
      async function saveLegionKey(k, clear) {
        const d = keyDraft[k.legionId] || {};
        try {
          await sdk.invoke('legionKeys.set', clear ? { legionId: k.legionId, provider: '', model: '', baseUrl: '', apiKey: '', outputChars: 0 } : { legionId: k.legionId, provider: d.provider, model: d.model, baseUrl: d.baseUrl, outputChars: Number(d.outputChars) || 0, ...(d.apiKey ? { apiKey: d.apiKey } : {}) });
          await loadLegionKeys();
          sdk.notify.success(clear ? t('已清除') : t('已保存'));
        } catch (e) {
          sdk.notify.warn(e.message);
        }
      }

      const legionById = computed(() => Object.fromEntries((info.value?.legions || []).map((L) => [L.id, L])));
      const term = computed(() => (info.value?.settings?.terms === 'legion' ? t('军团') : t('部门')));
      const isEmployee = computed(() => info.value?.mode === 'employee');

      async function call(key, action, payload) {
        busy[key] = true;
        err[key] = '';
        try {
          return await sdk.invoke(action, payload);
        } catch (e) {
          err[key] = e.message || String(e);
          throw e;
        } finally {
          busy[key] = false;
        }
      }
      const quiet = (p) => p.catch(() => undefined);

      async function loadAll() {
        info.value = await sdk.invoke('info');
        if (isEmployee.value) {
          employee.value = await sdk.invoke('employee.state');
          return;
        }
        snap.value = await sdk.invoke('state');
        screen.value = info.value.screen;
        port.value = info.value.settings.screenPort || '';
        await Promise.all([
          quiet(refreshFleet()),
          quiet(loadCompany()),
          quiet(sdk.invoke('routines.list').then((r) => (routines.value = r))),
          quiet(sdk.invoke('scripts.list').then((r) => (scripts.value = r))),
          quiet(sdk.invoke('director.status').then((r) => (director.value = r))),
          quiet(sdk.invoke('records.list').then((r) => (records.value = r))),
          quiet(sdk.invoke('coverage').then((r) => (coverage.value = r))),
          quiet(sdk.invoke('displays.list').then((r) => {
            displays.value = r;
            displayId.value = (r.find((d) => !d.primary) || r[0] || {}).id ?? null;
          })),
        ]);
      }
      async function refreshFleet(force = false) {
        machines.value = await call('fleet', 'fleet.list', { force });
      }
      async function loadCompany() {
        const r = await sdk.invoke('company.get');
        Object.assign(company, { name: '', short: '', logo: '', industry: '', products: '', boss: '', location: '', logoImage: '' }, r.profile);
        companyFrom.value = r.profile.from;
      }

      const offs = [];
      onMounted(() => {
        if (!document.getElementById('lhq-style')) {
          const s = document.createElement('style');
          s.id = 'lhq-style';
          s.textContent = CSS;
          document.head.appendChild(s);
        }
        loadAll().catch((e) => sdk.notify.warn(e.message));
        loadMcfg();
        // 员工机配置的同步状态每分钟刷新一次（员工机加入 / 对账后宿主会补发）
        const mcTimer = setInterval(() => { if (!mcOpen.value) loadMcfg(); }, 60_000);
        offs.push(() => clearInterval(mcTimer));
        offs.push(sdk.on('state', (s) => (snap.value = s)));
        offs.push(sdk.on('employee', (s) => (employee.value = s)));
        offs.push(sdk.on('director', (s) => (director.value = s)));
        offs.push(sdk.on('event', (ev) => {
          if (ev.type === 'fleet:changed') machines.value = machines.value.map((m) => ({ ...m, ...(ev.machines.find((x) => x.id === m.id) || {}) }));
          if (detail.value && ev.taskId === detail.value.id && ev.type === 'task:done') openDetail(ev.taskId);
        }));
      });
      onUnmounted(() => offs.forEach((f) => f && f()));

      // ── 各步状态（每步独立）──
      const steps = computed(() => {
        const placed = machines.value.some((m) => m.hosts?.length);
        const anyDone = (snap.value.tasks || []).some((x) => x.status === 'done');
        return [
          { id: 's1', name: t('{p0}与机器', { p0: term.value }), done: placed },
          { id: 's2', name: t('公司信息'), done: companyFrom.value === 'local' || touched.company },
          { id: 's3', name: t('指挥大屏'), done: !!screen.value.running },
          { id: 's4', name: t('下令与老板待办'), done: anyDone },
          { id: 's5', name: t('例行事务'), done: routines.value.some((r) => r.enabled) },
          { id: 's6', name: t('导演台'), done: touched.played || director.value.mode !== 'idle' },
          { id: 's7', name: t('能力地图'), done: false, optional: true },
          { id: 's8', name: t('成本看板'), done: false, optional: true },
          { id: 's9', name: t('OPC 考卷'), done: !!examReport.value && examReport.value.answered === examReport.value.total, optional: true },
        ];
      });
      const progress = computed(() => {
        const req = steps.value.filter((s) => !s.optional);
        return Math.round((req.filter((s) => s.done).length / req.length) * 100);
      });
      function go(id) {
        cur.value = id;
        document.getElementById(`lhq-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }

      // ── 动作 ──
      async function toggleAssign(legionId, m, on) {
        try {
          machines.value = await call(`a-${legionId}-${m.id}`, 'fleet.assign', { legionId, machineId: m.id, on });
        } catch (e) {
          sdk.notify.warn(e.message);
        }
      }
      function renameMachine(m) {
        m._alias = m.name;
        m._edit = true;
      }
      async function saveAlias(m) {
        machines.value = await call('fleet', 'fleet.rename', { machineId: m.id, name: m._alias || '' });
      }
      async function saveCompany() {
        try {
          await call('company', 'company.save', { ...company });
          touched.company = true;
          await loadCompany();
          sdk.notify.success(t('已保存，大屏与各部门产出抬头同步更新'));
        } catch (e) {
          /* err 已显示 */
        }
      }
      function onLogo(e) {
        const f = e.target.files && e.target.files[0];
        if (!f) return;
        if (f.size > 200 * 1024) {
          sdk.notify.warn(t('标志图片不超过 200KB'));
          return;
        }
        const r = new FileReader();
        r.onload = () => (company.logoImage = String(r.result || ''));
        r.readAsDataURL(f);
      }
      async function saveSettings(patch) {
        const s = await call('settings', 'settings.save', patch);
        info.value = { ...info.value, settings: s };
      }
      async function screenStart() {
        try {
          screen.value = await call('screen', 'screen.start', port.value ? { port: Number(port.value) } : {});
        } catch (e) {
          /* err */
        }
      }
      async function screenStop() {
        screen.value = await call('screen', 'screen.stop');
      }
      async function screenRotate() {
        screen.value = await call('screen', 'screen.rotate');
        sdk.notify.info(t('口令已更换，已打开的大屏需要用新地址重开'));
      }
      async function openWindow() {
        try {
          await call('screen', 'screen.openWindow', { displayId: displayId.value });
          screen.value = await sdk.invoke('screen.status');
        } catch (e) {
          /* err */
        }
      }
      async function copy(text) {
        try {
          await navigator.clipboard.writeText(text);
          sdk.notify.success(t('已复制'));
        } catch {
          sdk.notify.warn(text);
        }
      }
      async function send(text) {
        const v = String(text || '').trim();
        if (!v) return;
        try {
          const r = await call('cmd', 'command', { text: v, legions: forced.value });
          cmd.value = '';
          sdk.notify.info(t('已下令 #{p0}', { p0: r.no }));
        } catch (e) {
          /* err */
        }
      }
      async function confirm(taskId, approve) {
        let comment = '';
        if (!approve) {
          comment = (detail.value && detail.value.id === taskId ? detail.value._reject : '') || '';
          if (!comment) {
            await openDetail(taskId);
            detail.value._rejecting = true;
            return;
          }
        }
        try {
          await call(`c-${taskId}`, 'confirm', { taskId, approve, comment });
          if (detail.value) detail.value._rejecting = false;
        } catch (e) {
          sdk.notify.warn(e.message);
        }
      }
      async function openDetail(taskId) {
        const r = await sdk.invoke('tasks.get', { taskId });
        detail.value = r ? { ...r, _reject: '', _rejecting: false } : null;
      }

      // ── 视图 ──
      const chip = (L, on, extra = '') =>
        h('span', { class: `lhq-chip${on ? ' on' : ''}`, style: `border-color:${L.color};${on ? `background:${L.color}` : `color:${L.color}`}` }, `${L.short}${extra}`);
      const stepHead = (s, sub) => [
        h('h3', [`${steps.value.findIndex((x) => x.id === s.id) + 1}. ${s.name}`, h('span', { class: `st${s.done ? ' done' : ''}` }, s.optional ? t('可选') : s.done ? t('已完成') : t('待执行'))]),
        h('p', { class: 'lhq-sub' }, sub),
      ];
      const errLine = (k) => (err[k] ? h('div', { class: 'lhq-err' }, err[k]) : null);

      function runningSteps(legionId, machineName) {
        return (snap.value.tasks || [])
          .filter((x) => ACTIVE.has(x.status))
          .flatMap((x) => x.steps.filter((s) => s.legionId === legionId && s.status === 'running' && (!machineName || s.machine === machineName)).map((s) => ({ no: x.no, goal: s.goal, phase: s.phase })));
      }

      function pkgLine(m, L) {
        const st = m.packages?.[L.id];
        const label = { installed: t('包已装'), installing: t('装包中…'), failed: t('装包失败'), unsupported: t('员工机版本旧，不能装包'), removed: t('包已卸') }[st] || t('包未装');
        const color = st === 'installed' ? 'var(--color-success,#16a34a)' : st === 'failed' || st === 'unsupported' ? 'var(--color-danger,#dc2626)' : 'var(--color-text-secondary,#6b7280)';
        const act = (action) => async () => {
          try {
            const r = await sdk.invoke('fleet.package', { machineId: m.id, legionId: L.id, action });
            machines.value = r.machines;
            if (r.error) sdk.notify.warn(r.error);
          } catch (e) {
            sdk.notify.warn(e.message);
          }
        };
        return h('div', { style: `font-size:11px;color:${color};margin-top:2px`, title: st === 'failed' ? t('点「重装」再试；员工机要能访问方案仓库') : '' }, [
          label,
          st !== 'installing' ? h('a', { style: 'cursor:pointer;margin-left:6px;color:var(--color-brand,#6366f1)', onClick: act('install') }, st === 'installed' ? t('重装') : t('装包')) : null,
          st === 'installed' ? h('a', { style: 'cursor:pointer;margin-left:6px;color:var(--color-text-secondary,#6b7280)', onClick: act('uninstall') }, t('卸包')) : null,
        ]);
      }

      function viewFleet(s) {
        const legions = info.value?.legions || [];
        const mode = info.value?.mode;
        return h('div', { class: 'lhq-card', id: 'lhq-s1' }, [
          ...stepHead(
            s,
            mode === 'cluster'
              ? t('每个{p0}是一个方案包，可以装在任意一台机器上，一台机器可以承载多个。勾选即把{p0}装到 / 撤出该机器（员工机经集群通道写入本机画像，重启不丢）。派活时在承载它的在线机器里挑最闲的。', { p0: term.value })
              : t('本机不是集群主控：全部{p0}在本机执行。要多机演示，在主账号登录主控、子账号登录员工机（同一网段）。', { p0: term.value }),
          ),
          h('div', { class: 'lhq-row' }, [
            h('button', { class: 'lhq-btn', disabled: busy.fleet, onClick: () => refreshFleet(true).catch(() => {}) }, busy.fleet ? t('刷新中…') : t('刷新机器')),
            h('span', { class: 'lhq-sub', style: 'margin:0' }, t('在线机器 {p0} 台 · 已装{p1} {p2} 个', { p0: machines.value.filter((m) => m.online).length, p1: term.value, p2: legions.length })),
          ]),
          errLine('fleet'),
          h('div', { style: 'overflow-x:auto' }, [
            h('table', { class: 'lhq-tbl' }, [
              h('tr', [h('th', t('机器')), h('th', t('状态')), ...legions.map((L) => h('th', { style: `color:${L.color}` }, L.short))]),
              ...machines.value.map((m) =>
                h('tr', { key: m.id }, [
                  h('td', [
                    m._edit
                      ? h('span', [h('input', { class: 'lhq-in', style: 'width:110px', value: m._alias ?? m.name, onInput: (e) => (m._alias = e.target.value) }), ' ', h('button', { class: 'lhq-btn', onClick: () => saveAlias(m) }, t('保存'))])
                      : h('span', { title: m.id }, [h('b', m.name), ' ', m.local ? null : h('a', { style: 'cursor:pointer;font-size:12px;color:var(--color-brand,#6366f1)', onClick: () => renameMachine(m) }, t('改名')), ' ', !m.local && mcfg.value?.available ? h('a', { style: 'cursor:pointer;font-size:12px;color:var(--color-brand,#6366f1)', onClick: () => openMc(m.id) }, t('模型')) : null]),
                    h('div', { class: 'lhq-mono', style: 'color:var(--color-text-secondary,#6b7280)' }, m.ip || ''),
                    m.note ? h('div', { class: 'lhq-err' }, m.note) : null,
                  ]),
                  h('td', [
                    h('span', { class: `lhq-badge${m.online ? ' on' : ''}` }, m.online ? t('在线') : t('离线')),
                    h('div', { style: 'font-size:12px;margin-top:4px;color:var(--color-text-secondary,#6b7280)' }, [
                      m.busy ? t('本中心派了 {p0} 步', { p0: m.busy }) : t('空闲'),
                      m.load ? h('div', t('本机忙碌会话 {p0}', { p0: m.load.busy })) : null,
                      !m.local && mcCurrent(m.id) ? h('div', { class: 'lhq-mono', title: t('员工机当前模型') }, mcCurrent(m.id)) : m.load?.model ? h('div', { class: 'lhq-mono' }, m.load.model) : null,
                      !m.local && mcfg.value?.status?.[m.id]?.state === 'failed' ? h('div', { class: 'lhq-err' }, t('模型下发失败')) : null,
                      ...(m.load?.activities || []).map((a) => h('div', { style: 'color:var(--color-brand,#6366f1)' }, `#${a.taskNo ?? '?'} ${legionById.value[a.legionId]?.short || a.legionId} · ${a.phase || t('执行中')}`)),
                    ]),
                  ]),
                  ...legions.map((L) => {
                    const on = (m.hosts || []).includes(L.id);
                    const run = on ? runningSteps(L.id, m.name) : [];
                    return h('td', { key: L.id }, [
                      h('label', { style: 'display:flex;gap:4px;align-items:center;cursor:pointer' }, [
                        h('input', { type: 'checkbox', checked: on, disabled: busy[`a-${L.id}-${m.id}`] || (!m.online && !m.local), onChange: (e) => toggleAssign(L.id, m, e.target.checked) }),
                        on ? (run.length ? h('span', { style: `color:${L.color};font-weight:600` }, t('执行 {p0}', { p0: run.length })) : t('待命')) : '',
                      ]),
                      ...run.map((r) => h('div', { style: 'font-size:11.5px;color:var(--color-text-secondary,#6b7280)' }, `#${r.no} ${r.phase || r.goal}`)),
                      // L3：员工机上部门方案包的真实安装状态
                      !m.local && (on || m.packages?.[L.id]) ? pkgLine(m, L) : null,
                    ]);
                  }),
                ]),
              ),
            ]),
          ]),
          mode === 'cluster' && mcfg.value?.available
            ? h('div', { class: 'lhq-row' }, [
                h('button', { class: 'lhq-btn', onClick: () => openMc('all') }, t('全部员工机的模型（文字 / 图片 / 视频 / 语音）')),
                h('span', { class: 'lhq-sub', style: 'margin:0' }, t('单台要不同：点机器名旁的「模型」')),
              ])
            : null,
          mcPanel(),
          h('p', { class: 'lhq-sub', style: 'margin-top:10px' }, t('没有任何在线机器承载的{p0}，派到它的活会报「没有在线机器承载」；主控本机勾选即作兜底。', { p0: term.value })),
          h('button', { class: 'lhq-btn', style: 'margin-right:6px', onClick: () => (customOpen.value = !customOpen.value) }, customOpen.value ? t('收起新建{p0}', { p0: term.value }) : t('现场新建一个{p0}', { p0: term.value })),
          customOpen.value
            ? h('div', { style: 'margin:8px 0' }, [
                h('p', { class: 'lhq-sub' }, t('说一句要什么{p0}，AI 从已有的 AI 员工角色里挑人组成它；你确认后保存，勾选承载它的机器就能被派活。', { p0: term.value })),
                h('div', { class: 'lhq-row' }, [
                  h('input', { class: 'lhq-in', style: 'flex:1;min-width:260px', placeholder: t('例如：一个负责展会与线下活动的市场活动部'), value: customText.value, onInput: (e) => (customText.value = e.target.value) }),
                  h('button', { class: 'lhq-btn pri', disabled: busy.custom || !customText.value.trim(), onClick: draftCustom }, busy.custom ? t('起草中…') : t('AI 起草')),
                ]),
                errLine('custom'),
                customDraft.value
                  ? h('div', { class: 'lhq-card', style: 'padding:10px;margin-top:8px' }, [
                      h('div', { class: 'lhq-row' }, [
                        h('input', { class: 'lhq-in', style: 'width:120px', value: customDraft.value.name, onInput: (e) => (customDraft.value.name = e.target.value) }),
                        h('input', { class: 'lhq-in', style: 'width:60px', value: customDraft.value.short, onInput: (e) => (customDraft.value.short = e.target.value) }),
                        h('input', { class: 'lhq-in', style: 'flex:1', value: customDraft.value.summary, onInput: (e) => (customDraft.value.summary = e.target.value) }),
                      ]),
                      h('div', { class: 'lhq-row' }, [h('span', { class: 'lhq-sub', style: 'margin:0' }, t('派活关键词')), h('input', { class: 'lhq-in', style: 'flex:1', value: customDraft.value.hintsText, onInput: (e) => (customDraft.value.hintsText = e.target.value) })]),
                      h('div', { style: 'display:flex;flex-wrap:wrap;gap:6px;margin:6px 0' }, customDraft.value.roleOptions.map((r) => h('label', { class: 'lhq-chip', style: 'cursor:pointer' }, [h('input', { type: 'checkbox', checked: customDraft.value.roles.includes(r.id), onChange: (e) => { const set = new Set(customDraft.value.roles); if (e.target.checked) set.add(r.id); else set.delete(r.id); customDraft.value.roles = [...set]; } }), ` ${r.id}`]))),
                      h('div', { class: 'lhq-row' }, [
                        h('span', { class: 'lhq-sub', style: 'margin:0' }, t('负责人')),
                        h('select', { class: 'lhq-in', value: customDraft.value.leadRole, onChange: (e) => (customDraft.value.leadRole = e.target.value) }, customDraft.value.roles.map((r) => h('option', { value: r }, r))),
                        h('button', { class: 'lhq-btn pri', disabled: busy.custom || !customDraft.value.roles.length, onClick: saveCustom }, t('保存这个{p0}', { p0: term.value })),
                        h('button', { class: 'lhq-btn', onClick: () => (customDraft.value = null) }, t('不要了')),
                      ]),
                    ])
                  : null,
                ...(info.value?.legions || []).filter((L) => L.custom).map((L) =>
                  h('div', { class: 'lhq-row', key: L.id }, [
                    h('b', { style: `color:${L.color}` }, L.name),
                    h('span', { class: 'lhq-sub', style: 'margin:0' }, `${L.summary} · ${t('{p0} 名 AI 员工', { p0: L.staff })}`),
                    h('button', { class: 'lhq-btn', onClick: async () => { try { await sdk.invoke('legions.removeCustom', { id: L.id }); info.value = await sdk.invoke('info'); } catch (e) { sdk.notify.warn(e.message); } } }, t('删除')),
                  ]),
                ),
              ])
            : null,
          h('button', { class: 'lhq-btn', onClick: async () => { keysOpen.value = !keysOpen.value; if (keysOpen.value) await loadLegionKeys().catch((e) => sdk.notify.warn(e.message)); } }, keysOpen.value ? t('收起专用模型与 key') : t('{p0}专用模型与 key（防限流）', { p0: term.value })),
          keysOpen.value
            ? h('div', { style: 'margin-top:8px' }, [
                h('p', { class: 'lhq-sub' }, t('同一台机器上几个{p0}共用一把 key 容易被限流：可以给每个{p0}单独配服务商、key、模型和输出上限。key 只存在主控本机，派到员工机时只用于那一步，不写进员工机配置。主控本机执行的步骤仍用本机默认 key。剧本可以用 legionConfig 再按{p0}覆盖模型与输出上限。', { p0: term.value })),
                h('div', { style: 'overflow-x:auto' }, h('table', { class: 'lhq-tbl' }, [
                  h('tr', [h('th', term.value), h('th', t('服务商')), h('th', t('模型')), h('th', t('接口地址（可空）')), h('th', 'key'), h('th', t('输出上限')), h('th', '')]),
                  ...legionKeys.value.map((k) => {
                    const d = keyDraft[k.legionId] || (keyDraft[k.legionId] = {});
                    const inp = (f, ph, w, type) => h('input', { class: 'lhq-in', style: `width:${w}px`, type: type || 'text', placeholder: ph, value: d[f] || '', onInput: (e) => (d[f] = e.target.value) });
                    return h('tr', { key: k.legionId }, [
                      h('td', k.name),
                      h('td', inp('provider', 'deepseek', 100)),
                      h('td', inp('model', k.defaultModel || t('跟随默认'), 150)),
                      h('td', inp('baseUrl', 'https://…', 170)),
                      h('td', inp('apiKey', k.hasKey ? k.key : t('未设置'), 140, 'password')),
                      h('td', h('select', { class: 'lhq-in', value: d.outputChars || 0, onChange: (e) => (d.outputChars = Number(e.target.value)) }, [0, 600, 900, 1200, 2000].map((n) => h('option', { value: n }, n ? t('{p0} 字', { p0: n }) : t('跟随全局'))))),
                      h('td', [h('button', { class: 'lhq-btn pri', onClick: () => saveLegionKey(k, false) }, t('保存')), ' ', k.hasKey || k.provider || k.model ? h('button', { class: 'lhq-btn', onClick: () => saveLegionKey(k, true) }, t('清除')) : null]),
                    ]);
                  }),
                ])),
              ])
            : null,
        ]);
      }

      function viewCompany(s) {
        const f = (k, label, max) =>
          h('div', [h('label', label), h('input', { class: 'lhq-in', maxlength: max, value: company[k], onInput: (e) => (company[k] = e.target.value) })]);
        const demo = !!info.value?.settings?.demoMode;
        return h('div', { class: 'lhq-card', id: 'lhq-s2' }, [
          ...stepHead(s, t('公司档案是唯一真相源：大屏顶栏、各部门提示词（「你是 X 公司的法务部 AI 员工」）、产出抬头都读它。来源：{p0}。', { p0: { local: t('本地修改'), host: t('登录账号'), default: t('默认') }[companyFrom.value] || '' })),
          h('div', { class: 'lhq-grid' }, [
            f('name', t('公司全称'), 40),
            f('short', t('大屏显示名称'), 12),
            f('logo', t('标志文字（1–2 字）'), 2),
            f('industry', t('行业'), 16),
            f('products', t('主营产品'), 80),
            f('boss', t('老板称呼'), 8),
            h('div', [h('label', t('标志图片（可选，≤200KB）')), h('input', { type: 'file', accept: 'image/png,image/jpeg,image/svg+xml,image/webp', onChange: onLogo }), company.logoImage ? h('img', { src: company.logoImage, style: 'height:32px;margin-left:8px;vertical-align:middle' }) : null]),
          ]),
          h('div', { class: 'lhq-row', style: 'margin-top:12px' }, [
            h('button', { class: 'lhq-btn pri', disabled: busy.company, onClick: saveCompany }, t('保存公司信息')),
            h('button', { class: 'lhq-btn', onClick: async () => { await call('company', 'company.reset'); await loadCompany(); } }, t('恢复默认')),
            h('label', { style: 'display:flex;gap:6px;align-items:center;margin-left:12px' }, [
              h('input', { type: 'checkbox', checked: demo, onChange: (e) => saveSettings({ demoMode: e.target.checked }) }),
              t('演示模式：对外只显示「示例科技」，不露真实名称'),
            ]),
            h('label', { style: 'display:flex;gap:6px;align-items:center;margin-left:12px' }, [
              h('input', { type: 'checkbox', checked: !!info.value?.settings?.demoPack, onChange: (e) => saveSettings({ demoPack: e.target.checked }) }),
              t('演示资料包：各部门可引用虚构「示例科技」的产品、成本、经营数据、合同模板、花名册'),
            ]),
          ]),
          errLine('company'),
        ]);
      }

      function viewScreen(s) {
        const sc = screen.value;
        const auto = !!info.value?.settings?.screenAutoStart;
        return h('div', { class: 'lhq-card', id: 'lhq-s3' }, [
          ...stepHead(s, t('指挥大屏是主控的服务：点「启动 Web」后在局域网开一个网页服务，会场任意电脑 / 电视 / 平板用下面的地址打开（地址带访问口令，没有口令打不开）。手机打开「遥控地址」可下令和拍板。')),
          h('div', { class: 'lhq-row' }, [
            sc.running
              ? h('button', { class: 'lhq-btn danger', disabled: busy.screen, onClick: screenStop }, t('停止 Web'))
              : h('button', { class: 'lhq-btn pri', disabled: busy.screen, onClick: screenStart }, busy.screen ? t('启动中…') : t('启动 Web')),
            h('span', t('端口')),
            h('input', { class: 'lhq-in', style: 'width:90px', placeholder: '8240', value: port.value, disabled: sc.running, onInput: (e) => (port.value = e.target.value.replace(/\D/g, '')) }),
            sc.running ? h('span', { class: 'lhq-badge on' }, t('运行中 · 端口 {p0} · {p1} 个大屏在看', { p0: sc.port, p1: sc.viewers })) : h('span', { class: 'lhq-badge' }, t('未启动')),
            sc.running ? h('button', { class: 'lhq-btn', onClick: screenRotate }, t('换口令')) : null,
            h('label', { style: 'display:flex;gap:6px;align-items:center' }, [h('input', { type: 'checkbox', checked: auto, onChange: (e) => saveSettings({ screenAutoStart: e.target.checked, screenPort: port.value ? Number(port.value) : null }) }), t('打开 App 时自动启动')]),
            h('label', { style: 'display:flex;gap:6px;align-items:center' }, [
              t('大屏默认画面'),
              h('select', { class: 'lhq-in', value: info.value?.settings?.screenView || 'auto', onChange: (e) => saveSettings({ screenView: e.target.value }) }, [
                h('option', { value: 'auto' }, t('自动（平时办公室，来新命令先看拓扑派发）')),
                h('option', { value: 'topo' }, t('拓扑（部门与交接线）')),
                h('option', { value: 'office' }, t('办公室（AI 员工在工位干活）')),
              ]),
            ]),
          ]),
          errLine('screen'),
          sc.running
            ? h('table', { class: 'lhq-tbl', style: 'margin-top:8px' }, [
                h('tr', [h('th', t('网卡')), h('th', t('大屏地址')), h('th', t('手机遥控地址')), h('th', '')]),
                ...(sc.urls.length ? sc.urls : [{ name: t('本机'), url: sc.localUrl, remote: sc.localUrl.replace('/?', '/remote?') }]).map((u) =>
                  h('tr', [
                    h('td', `${u.name}${u.address ? ` ${u.address}` : ''}`),
                    h('td', [h('div', { class: 'lhq-mono' }, u.url), u.qr ? h('div', { class: 'lhq-qr', innerHTML: u.qr, title: t('扫码打开大屏') }) : null]),
                    h('td', [h('div', { class: 'lhq-mono' }, u.remote), u.remoteQr ? h('div', { class: 'lhq-qr', innerHTML: u.remoteQr, title: t('手机扫码：下令 / 拍板') }) : null]),
                    h('td', { style: 'white-space:nowrap' }, [h('button', { class: 'lhq-btn', onClick: () => copy(u.url) }, t('复制')), ' ', h('button', { class: 'lhq-btn', onClick: () => copy(u.remote) }, t('复制遥控'))]),
                  ]),
                ),
              ])
            : null,
          h('div', { class: 'lhq-row', style: 'margin-top:10px' }, [
            h('span', t('在本机显示器上全屏打开：')),
            h(
              'select',
              { class: 'lhq-in', value: displayId.value, onChange: (e) => (displayId.value = Number(e.target.value)) },
              displays.value.map((d) => h('option', { value: d.id }, d.label)),
            ),
            h('button', { class: 'lhq-btn pri', disabled: busy.screen, onClick: openWindow }, t('全屏打开大屏')),
            h('button', { class: 'lhq-btn', onClick: () => sdk.invoke('screen.closeWindow') }, t('关闭大屏窗口')),
            h('span', { class: 'lhq-sub', style: 'margin:0' }, t('全屏窗口里 Esc 退出全屏，再按一次关闭')),
          ]),
          sc.running && !sc.urls.length ? h('div', { class: 'lhq-err' }, t('没找到局域网地址：本机可能没有连网，会场其它设备打不开')) : null,
        ]);
      }

      function taskCard(x) {
        const L = legionById.value;
        return h('div', { class: 'lhq-task', key: x.id }, [
          h('div', { class: 'tt' }, [
            h('span', { class: 'lhq-mono' }, `#${x.no}`),
            h('span', { class: 'lhq-badge' }, t(SOURCE[x.source] || x.source)),
            h('span', x.title),
            h('span', { class: 's', style: `color:${x.status === 'failed' ? '#dc2626' : x.status === 'awaiting' ? '#b45309' : 'inherit'}` }, t(STATUS[x.status] || x.status)),
          ]),
          h('div', { style: 'margin-top:6px' }, [
            ...x.legions.map((id) => {
              const st = x.steps.filter((s) => s.legionId === id);
              return L[id] ? chip(L[id], st.some((s) => s.status === 'running'), st.length && st.every((s) => s.status === 'done') ? ' ✓' : '') : null;
            }),
            x.triage ? h('span', { class: 'lhq-sub', style: 'font-size:12px' }, `${x.triage.reason}${x.triage.via === 'rules' ? t('（关键词规则）') : ''}`) : null,
          ]),
          x.error ? h('div', { class: 'lhq-err' }, x.error) : null,
          h('div', { class: 'lhq-row' }, [
            h('button', { class: 'lhq-btn', onClick: () => openDetail(x.id) }, t('查看产出')),
            x.status === 'awaiting' ? h('button', { class: 'lhq-btn warn', disabled: busy[`c-${x.id}`], onClick: () => confirm(x.id, true) }, t('批准')) : null,
            x.status === 'awaiting' ? h('button', { class: 'lhq-btn', onClick: () => confirm(x.id, false) }, t('驳回')) : null,
            ACTIVE.has(x.status) ? h('button', { class: 'lhq-btn danger', onClick: () => sdk.invoke('cancel', { taskId: x.id }) }, t('中止')) : null,
            x.status === 'failed' && (x.steps || []).length ? h('button', { class: 'lhq-btn warn', onClick: async () => { try { const r = await sdk.invoke('retry', { taskId: x.id }); sdk.notify.info(t('已重新派出 {p0} 步，已交上来的部门成果保留', { p0: r.steps })); } catch (e) { sdk.notify.warn(e.message); } } }, t('重办没办成的部分')) : null,
          ]),
        ]);
      }

      function viewDetail() {
        const d = detail.value;
        if (!d) return null;
        const L = legionById.value;
        return h('div', { class: 'lhq-card', style: 'border-color:var(--color-brand,#6366f1)' }, [
          h('h3', [`#${d.no} ${d.title}`, h('span', { class: 'st' }, t(STATUS[d.status] || d.status)), h('a', { style: 'margin-left:auto;cursor:pointer;font-size:13px;font-weight:400', onClick: () => (detail.value = null) }, t('收起'))]),
          d.decision ? h('p', { class: 'lhq-sub' }, t('判定：{p0}（{p1}）', { p0: d.decision.reason, p1: d.decision.via === 'model' ? t('AI 总经理') : d.decision.via === 'forced' ? t('指定') : t('关键词规则') }) + (d.decision.fallbackReason ? ` · ${t('模型判定未用上：{p0}', { p0: d.decision.fallbackReason })}` : '')) : null,
          ...(d.plan?.steps || []).map((s) => {
            const o = d.outputs?.[s.id] || {};
            return h('div', { style: 'margin-top:10px' }, [
              h('div', [L[s.legionId] ? chip(L[s.legionId], false) : null, h('b', s.goal), o.machine ? h('span', { class: 'lhq-sub' }, ` · ${o.machine}${o.ms ? ` · ${Math.round(o.ms / 1000)}s` : ''}`) : null]),
              o.error ? h('div', { class: 'lhq-err' }, o.error) : o.text ? h('div', { class: 'lhq-out' }, o.text) : h('div', { class: 'lhq-empty' }, t('还没有产出')),
            ]);
          }),
          d.summary ? h('div', { style: 'margin-top:12px' }, [h('b', d.plan?.summary ? t('AI 总经理汇总') : t('结果')), h('div', { class: 'lhq-out' }, d.summary)]) : null,
          d.summary ? h('div', { class: 'lhq-row' }, [h('button', { class: 'lhq-btn', onClick: async () => { try { const r = await sdk.invoke('tasks.export', { taskId: d.id }); if (!r.canceled) sdk.notify.success(t('已导出：{p0}', { p0: r.path })); } catch (e) { sdk.notify.warn(e.message); } } }, t('导出 Word（带公司抬头）'))]) : null,
          d.status === 'awaiting' && d._rejecting
            ? h('div', { class: 'lhq-row', style: 'margin-top:10px' }, [
                h('input', { class: 'lhq-in', style: 'flex:1', placeholder: t('驳回意见（会带着意见重做一次）'), value: d._reject, onInput: (e) => (d._reject = e.target.value) }),
                h('button', { class: 'lhq-btn', onClick: () => confirm(d.id, false) }, t('提交驳回')),
              ])
            : null,
        ]);
      }

      function viewCommand(s) {
        const tasks = snap.value.tasks || [];
        const legions = info.value?.legions || [];
        return h('div', { class: 'lhq-card', id: 'lhq-s4' }, [
          ...stepHead(s, t('说一件事，AI 总经理判断要哪几个{p0}（一个 / 几个 / 全公司），派给承载它们的机器并发执行；多件事同时进行。钱、签约、对外发布、录用的最终动作进老板待办，AI 只准备不执行。', { p0: term.value })),
          h('div', { class: 'lhq-row' }, [
            h('input', { class: 'lhq-in', style: 'flex:1;min-width:260px', maxlength: 2000, placeholder: t('例如：帮我审一下这份经销合同'), value: cmd.value, onInput: (e) => (cmd.value = e.target.value), onKeydown: (e) => e.key === 'Enter' && !e.isComposing && send(cmd.value) }),
            h('button', { class: 'lhq-btn pri', disabled: busy.cmd, onClick: () => send(cmd.value) }, t('下令')),
          ]),
          h('div', { class: 'lhq-row' }, PRESETS.map((p) => h('button', { class: 'lhq-btn', onClick: () => send(p) }, t(p)))),
          h('div', { class: 'lhq-row' }, [
            h('span', { class: 'lhq-sub', style: 'margin:0' }, t('指定{p0}（可选，跳过判定）：', { p0: term.value })),
            ...legions.map((L) =>
              h('label', { style: 'cursor:pointer' }, [
                h('input', { type: 'checkbox', checked: forced.value.includes(L.id), onChange: (e) => (forced.value = e.target.checked ? [...forced.value, L.id] : forced.value.filter((x) => x !== L.id)) }),
                ` ${L.short}`,
              ]),
            ),
          ]),
          errLine('cmd'),
          !info.value?.hasModel ? h('div', { class: 'lhq-err' }, t('本机模型通道不可用：判定只能走关键词规则，本机执行的步骤会失败')) : null,
          h('div', { class: 'lhq-row', style: 'margin-top:8px' }, [
            h('label', [h('input', { type: 'checkbox', checked: info.value?.settings?.useModelTriage !== false, onChange: (e) => saveSettings({ useModelTriage: e.target.checked }) }), ' ', t('由 AI 总经理（模型）判定，失败回落关键词规则')]),
            h('span', t('每步输出约')),
            h('select', { class: 'lhq-in', value: info.value?.settings?.outputChars || 900, onChange: (e) => saveSettings({ outputChars: Number(e.target.value) }) }, [600, 900, 1200, 2000].map((n) => h('option', { value: n }, t('{p0} 字', { p0: n })))),
            h('span', t('称呼')),
            h('select', { class: 'lhq-in', value: info.value?.settings?.terms || 'department', onChange: (e) => saveSettings({ terms: e.target.value }) }, [h('option', { value: 'department' }, t('部门（OPC）')), h('option', { value: 'legion' }, t('军团'))]),
          ]),
          h('h4', { style: 'margin:14px 0 6px' }, t('老板待办（{p0}）', { p0: (snap.value.inbox || []).length })),
          (snap.value.inbox || []).length
            ? h('div', (snap.value.inbox || []).map((x) => h('div', { class: 'lhq-row' }, [h('b', `#${x.no} ${x.title}`), x.approval ? h('span', { class: 'lhq-badge warn' }, x.approval.label) : null, h('button', { class: 'lhq-btn warn', onClick: () => confirm(x.taskId, true) }, t('批准')), h('button', { class: 'lhq-btn', onClick: () => confirm(x.taskId, false) }, t('驳回'))])))
            : h('div', { class: 'lhq-empty' }, t('暂无需要拍板的事')),
          viewDetail(),
          h('h4', { style: 'margin:14px 0 6px' }, t('公司事务')),
          tasks.length ? h('div', tasks.slice(0, 20).map(taskCard)) : h('div', { class: 'lhq-empty' }, t('还没有任务')),
        ]);
      }

      function viewRoutines(s) {
        const mailFolder = info.value?.settings?.mailFolder;
        return h('div', { class: 'lhq-card', id: 'lhq-s5' }, [
          ...stepHead(s, t('公司在老板不说话时也在运转：到点生成一件事（来源 = 定时例行），走同一个入口。App 开着才会触发，错过的不补跑。')),
          h('div', { class: 'lhq-row' }, [
            h('b', t('来信文件夹')),
            h('span', { class: 'lhq-mono' }, mailFolder || t('未设置')),
            h('button', { class: 'lhq-btn', onClick: async () => { try { const r = await sdk.invoke('mail.pickFolder'); if (!r.canceled) { info.value = await sdk.invoke('info'); sdk.notify.info(t('已设置；新放进去的 {p0} 封来信已交给 AI 总经理', { p0: r.made.length })); } } catch (e) { sdk.notify.warn(e.message); } } }, t('选择文件夹')),
            mailFolder ? h('button', { class: 'lhq-btn', onClick: async () => { const r = await sdk.invoke('mail.scanNow'); sdk.notify.info(t('新来信 {p0} 封', { p0: r.made.length })); } }, t('现在检查')) : null,
            mailFolder ? h('button', { class: 'lhq-btn', onClick: async () => { await saveSettings({ mailFolder: '' }); } }, t('停用')) : null,
            h('label', { style: 'display:flex;gap:6px;align-items:center;margin-left:auto' }, [h('input', { type: 'checkbox', checked: info.value?.settings?.notify !== false, onChange: (e) => saveSettings({ notify: e.target.checked }) }), t('待拍板 / 例行办完时发系统通知')]),
            info.value?.settings?.imPushAvailable
              ? h('label', { style: 'display:flex;gap:6px;align-items:center' }, [h('input', { type: 'checkbox', checked: !!info.value?.settings?.imPush, onChange: (e) => saveSettings({ imPush: e.target.checked }) }), t('同时发到老板 IM')])
              : null,
          ]),
          info.value?.settings?.mailboxAvailable
            ? h('div', { class: 'lhq-row' }, [
                h('label', { style: 'display:flex;gap:6px;align-items:center' }, [h('input', { type: 'checkbox', checked: !!info.value?.settings?.mailboxIntake, onChange: (e) => saveSettings({ mailboxIntake: e.target.checked }) }), h('b', t('公司邮箱来信交给 AI 总经理'))]),
                h('span', { class: 'lhq-sub', style: 'margin:0' }, (() => {
                  const st = info.value?.settings?.mailboxStatus?.state;
                  if (!st || st === 'not_configured') return t('先在「设置 → 邮件」填收件服务器（IMAP）；推广、群发和自动回复不会进来');
                  return { ready: t('收件通道正常，每分钟自动收取'), degraded: t('收件通道部分可用，详情见「设置 → 邮件」'), error: t('收件通道出错，详情见「设置 → 邮件」') }[st] || st;
                })()),
              ])
            : null,
          h('p', { class: 'lhq-sub' }, t('把邮件导出的 .eml（或 .txt / .md）放进来信文件夹，每 20 秒检查一次，新来信自动成为「来信」任务，由 AI 总经理分拣给部门；原文件不改动。')),
          h('table', { class: 'lhq-tbl' }, [
            h('tr', [h('th', t('启用')), h('th', t('事项')), h('th', t('时间')), h('th', t('涉及{p0}', { p0: term.value })), h('th', t('上次')), h('th', '')]),
            ...routines.value.map((r) =>
              h('tr', [
                h('td', h('input', { type: 'checkbox', checked: r.enabled, onChange: async (e) => (routines.value = await sdk.invoke('routines.toggle', { id: r.id, on: e.target.checked })) })),
                h('td', [h('b', t(r.name)), h('div', { class: 'lhq-sub', style: 'margin:0' }, t(r.text))]),
                h('td', t(r.when)),
                h('td', r.legions.map((id) => (legionById.value[id] ? chip(legionById.value[id], false) : null))),
                h('td', r.lastRun || '—'),
                h('td', h('button', { class: 'lhq-btn', onClick: async () => { await sdk.invoke('routines.runNow', { id: r.id }); sdk.notify.info(t('已下发')); } }, t('现在试一次'))),
              ]),
            ),
          ]),
        ]);
      }

      function viewDirector(s) {
        const d = director.value;
        const sc = scripts.value.find((x) => x.id === d.scriptId);
        return h('div', { class: 'lhq-card', id: 'lhq-s6' }, [
          ...stepHead(s, t('观众看不到的导演台：剧本按节奏下发任务；暂停 = 不再下新任务（已在跑的继续）；重置 = 中止全部任务并清空大屏。网络或模型出问题时，切到录制回放，大屏按原节奏重演（只在角落亮一个小点）。')),
          h('div', { class: 'lhq-row' }, [
            h('span', { class: `lhq-badge${d.mode === 'playing' || d.mode === 'replaying' ? ' on' : ''}` }, `${t({ idle: '空闲', playing: '开演中', paused: '已暂停', finished: '已演完', replaying: '回放中' }[d.mode] || d.mode)}${sc ? ` · ${sc.name}` : ''}${d.total ? ` · ${d.next}/${d.total}` : ''}`),
            d.mode === 'playing' ? h('button', { class: 'lhq-btn', onClick: async () => (director.value = await sdk.invoke('director.pause')) }, t('暂停')) : null,
            d.mode === 'paused' ? h('button', { class: 'lhq-btn pri', onClick: async () => (director.value = await sdk.invoke('director.resume')) }, t('继续')) : null,
            h('button', { class: 'lhq-btn danger', onClick: async () => (director.value = await sdk.invoke('director.reset')) }, t('重置')),
          ]),
          h('table', { class: 'lhq-tbl' }, [
            h('tr', [h('th', t('剧本')), h('th', t('事项')), h('th', '')]),
            ...scripts.value.map((x) =>
              h('tr', [
                h('td', [h('b', t(x.name)), h('div', { class: 'lhq-sub', style: 'margin:0' }, t(x.description))]),
                h('td', x.items.length),
                h('td', h('button', { class: 'lhq-btn pri', onClick: async () => { director.value = await sdk.invoke('director.play', { scriptId: x.id }); touched.played = true; } }, t('一键开演'))),
              ]),
            ),
          ]),
          h('h4', { style: 'margin:14px 0 6px' }, t('录制（每次启动一个文件，可回放兜底）')),
          records.value.length
            ? h('table', { class: 'lhq-tbl' }, records.value.slice(0, 10).map((r) => h('tr', [h('td', { class: 'lhq-mono' }, r.name), h('td', t('{p0} 条事件', { p0: r.events })), h('td', h('button', { class: 'lhq-btn', onClick: async () => { try { director.value = await sdk.invoke('director.replay', { file: r.name }); } catch (e) { sdk.notify.warn(e.message); } } }, t('回放')))])))
            : h('div', { class: 'lhq-empty' }, t('还没有录制')),
          h('button', { class: 'lhq-btn', style: 'margin-top:6px', onClick: async () => (records.value = await sdk.invoke('records.list')) }, t('刷新录制列表')),
          h('h4', { style: 'margin:14px 0 6px' }, t('调优表（本次开演以来每步耗时，用于把主剧本压到 8 分钟内）')),
          h('button', { class: 'lhq-btn', onClick: async () => (report.value = await sdk.invoke('director.report')) }, t('生成调优表')),
          report.value
            ? h('div', [
                h('p', { class: 'lhq-sub' }, t('{p0} 件事，从第一件开始到最后一件办完共 {p1} 秒；最慢的步骤在最前', { p0: report.value.tasks, p1: Math.round(report.value.totalMs / 1000) })),
                h('table', { class: 'lhq-tbl' }, [
                  h('tr', [h('th', '#'), h('th', t('部门')), h('th', t('步骤')), h('th', t('机器')), h('th', t('耗时')), h('th', t('产出字数'))]),
                  ...[...report.value.rows].sort((a, b) => (b.ms || 0) - (a.ms || 0)).slice(0, 40).map((r) => h('tr', [h('td', r.taskNo), h('td', legionById.value[r.legionId]?.short || r.legionId), h('td', r.goal), h('td', r.machine || '—'), h('td', r.ms != null ? `${Math.round(r.ms / 1000)}s` : (r.error ? t('失败') : '—')), h('td', r.chars)])),
                ]),
              ])
            : null,
        ]);
      }

      function viewCoverage(s) {
        const c = coverage.value;
        const col = { ready: '#10b981', partial: '#f59e0b', building: '#3b82f6', gap: '#dc2626' };
        const name = (id) => (id === 'chief' ? t('AI 总经理') : legionById.value[id]?.short || id);
        const cnt = {};
        for (const i of c?.items || []) cnt[i.status] = (cnt[i.status] || 0) + 1;
        return h('div', { class: 'lhq-card', id: 'lhq-s7' }, [
          ...stepHead(s, t('「一个人能不能撑起一家公司的大部分日常」用考卷回答。下表是按现有代码估计的覆盖情况，考卷实测前不对外宣称覆盖率。大屏上按 M 键可切到这张图。')),
          c
            ? h('div', [
                h('div', { class: 'lhq-row' }, Object.keys(col).map((k) => h('span', { class: 'lhq-chip', style: `border-color:${col[k]};color:${col[k]}` }, `${t(c.statusLabels[k])} ${cnt[k] || 0}`))),
                h('table', { class: 'lhq-tbl' }, [
                  h('tr', [h('th', t('领域')), h('th', t('典型事务')), h('th', t('部门')), h('th', t('现有能力')), h('th', t('状态'))]),
                  ...c.items.map((i) => h('tr', [h('td', t(i.domain)), h('td', t(i.task)), h('td', i.departments.map(name).join(' + ')), h('td', t(i.capability)), h('td', h('span', { class: 'lhq-chip', style: `border-color:${col[i.status]};color:${col[i.status]}` }, t(c.statusLabels[i.status])))])),
                ]),
              ])
            : h('div', { class: 'lhq-empty' }, '…'),
        ]);
      }

      function viewCost(s) {
        const c = cost.value;
        const p = info.value?.settings?.cost || {};
        const num = (k, label) => h('label', { style: 'display:flex;gap:4px;align-items:center' }, [label, h('input', { class: 'lhq-in', type: 'number', step: 'any', style: 'width:90px', value: p[k], onChange: async (e) => { await saveSettings({ cost: { ...p, [k]: Number(e.target.value) } }); cost.value = await sdk.invoke('cost.board'); } })]);
        return h('div', { class: 'lhq-card', id: 'lhq-s8' }, [
          ...stepHead(s, t('按部门统计本月办了多少步、模型用量与费用，对比等效人工成本。演示口径：员工机不回传 token 数，模型费用按产出字数估算；等效人工按每步折合分钟 × 时薪估算，参数可改。')),
          h('div', { class: 'lhq-row' }, [num('yuanPer1kTokens', t('元 / 千 token')), num('tokensPerChar', t('token / 字')), num('minutesPerStep', t('每步折合分钟')), num('hourlyWage', t('时薪（元）')), h('button', { class: 'lhq-btn pri', onClick: async () => (cost.value = await sdk.invoke('cost.board')) }, t('刷新'))]),
          c
            ? h('table', { class: 'lhq-tbl' }, [
                h('tr', [h('th', t('部门')), h('th', t('步骤数')), h('th', t('估算 token')), h('th', t('模型费用（元）')), h('th', t('等效人工（元）'))]),
                ...c.rows.map((r) => h('tr', [h('td', r.name), h('td', r.steps), h('td', r.tokens), h('td', r.modelCost), h('td', r.laborCost)])),
                h('tr', [h('th', t('合计（{p0}）', { p0: c.month })), h('th', c.total.steps), h('th', c.total.tokens), h('th', c.total.modelCost), h('th', c.total.laborCost)]),
              ])
            : h('div', { class: 'lhq-empty' }, t('点「刷新」生成')),
          c ? h('p', { class: 'lhq-sub', style: 'margin-top:6px' }, t(c.note)) : null,
        ]);
      }

      function viewExam(s) {
        const ex = examData.value;
        const rep = examReport.value;
        const VL = { pass: t('通过'), partial: t('部分'), fail: t('不通过') };
        return h('div', { class: 'lhq-card', id: 'lhq-s9' }, [
          ...stepHead(s, t('「一个人能不能撑起一家公司的大部分日常」用考卷回答：39 题对应能力地图 39 项，走真实链路（AI 总经理判定 → 部门执行），按检查点人工打分。建议先打开「演示资料包」。通过 + 部分 ≥ 75% 才对外讲。')),
          h('div', { class: 'lhq-row' }, [
            h('button', { class: 'lhq-btn', onClick: async () => { examData.value = await sdk.invoke('exam.list'); examReport.value = await sdk.invoke('exam.report'); } }, ex ? t('刷新') : t('打开考卷')),
            rep ? h('span', { class: 'lhq-badge' }, t('已作答 {p0}/{p1} · 通过 {p2} · 部分 {p3} · 不通过 {p4} · 通过+部分 {p5}%', { p0: rep.answered, p1: rep.total, p2: rep.count.pass, p3: rep.count.partial, p4: rep.count.fail, p5: rep.usablePct })) : null,
            rep ? h('button', { class: 'lhq-btn', onClick: async () => { try { const r = await sdk.invoke('exam.export'); if (!r.canceled) sdk.notify.success(t('已导出：{p0}', { p0: r.path })); } catch (e) { sdk.notify.warn(e.message); } } }, t('导出覆盖率报告')) : null,
          ]),
          rep?.gaps?.length
            ? h('div', { class: 'lhq-sub', style: 'margin:6px 0' }, t('先补：{p0}', { p0: rep.gaps.slice(0, 5).map((g) => `${g.id} ${g.task}`).join('；') }))
            : null,
          ex
            ? h('table', { class: 'lhq-tbl' }, [
                h('tr', [h('th', t('题')), h('th', t('领域 / 事务')), h('th', t('状态')), h('th', '')]),
                ...ex.exam.items.flatMap((q) => {
                  const r = ex.results[q.id] || {};
                  const rows = [
                    h('tr', { key: q.id }, [
                      h('td', q.id),
                      h('td', [h('b', t(q.task)), h('div', { class: 'lhq-sub', style: 'margin:0' }, t(q.domain))]),
                      h('td', r.verdict ? VL[r.verdict] : r.taskId ? t('已下发') : t('未作答')),
                      h('td', { style: 'white-space:nowrap' }, [
                        h('button', { class: 'lhq-btn', onClick: async () => { try { const run = await sdk.invoke('exam.run', { id: q.id }); examData.value = await sdk.invoke('exam.list'); sdk.notify.info(run.demoPackOn ? t('考题基于演示资料包，已自动开启；已交给 AI 总经理') : t('已交给 AI 总经理')); } catch (e) { sdk.notify.warn(e.message); } } }, r.taskId ? t('重跑') : t('作答')),
                        ' ',
                        h('button', { class: 'lhq-btn', onClick: () => (examOpen.value = examOpen.value === q.id ? '' : q.id) }, t('打分')),
                      ]),
                    ]),
                  ];
                  if (examOpen.value === q.id) {
                    const draft = (q._draft = q._draft || { checks: q.checks.map((_, i) => !!(r.checks || [])[i]), verdict: r.verdict || '', note: r.note || '' });
                    rows.push(
                      h('tr', { key: `${q.id}-x` }, [
                        h('td', { colspan: 4 }, [
                          h('div', { class: 'lhq-q' }, q.prompt),
                          r.taskId ? h('button', { class: 'lhq-btn', onClick: () => openDetail(r.taskId) }, t('查看产出')) : null,
                          ...q.checks.map((c, i) => h('label', { style: 'display:block;margin:4px 0' }, [h('input', { type: 'checkbox', checked: draft.checks[i], onChange: (e) => (draft.checks[i] = e.target.checked) }), ` ${t(c)}`])),
                          h('div', { class: 'lhq-row' }, [
                            ...['pass', 'partial', 'fail'].map((v) => h('label', [h('input', { type: 'radio', name: `v-${q.id}`, checked: draft.verdict === v, onChange: () => (draft.verdict = v) }), ` ${VL[v]}`])),
                            h('input', { class: 'lhq-in', style: 'flex:1', placeholder: t('备注（可选）'), value: draft.note, onInput: (e) => (draft.note = e.target.value) }),
                            h('button', { class: 'lhq-btn pri', onClick: async () => { try { await sdk.invoke('exam.score', { id: q.id, ...draft }); examData.value = await sdk.invoke('exam.list'); examReport.value = await sdk.invoke('exam.report'); examOpen.value = ''; } catch (e) { sdk.notify.warn(e.message); } } }, t('保存评分')),
                          ]),
                        ]),
                      ]),
                    );
                  }
                  return rows;
                }),
              ])
            : null,
          examOpen.value ? viewDetail() : null,
        ]);
      }

      function viewEmployee() {
        const e = employee.value;
        const L = legionById.value;
        return h('div', { class: 'lhq', 'data-test': 'legion-hq-employee' }, [
          h('div', { class: 'lhq-sticky' }, [
            h('div', { class: 'lhq-head' }, [h('h2', e.company ? `${e.company} · ${t('员工机')}` : t('员工机')), h('span', { class: 'lhq-badge on' }, t('本机由主控派活'))]),
            h('div', { class: 'lhq-row', style: 'margin-top:8px' }, [
              h('span', t('本机承载：')),
              ...(e.hosted.length ? e.hosted.map((id) => (L[id] ? chip(L[id], true) : h('span', { class: 'lhq-chip' }, id))) : [h('span', { class: 'lhq-sub', style: 'margin:0' }, t('主控还没有把{p0}装到本机', { p0: term.value }))]),
            ]),
          ]),
          h('h3', { style: 'margin:18px 0 10px' }, t('正在执行（{p0}）', { p0: e.running.length })),
          e.running.length
            ? h('div', e.running.map((x) => {
                const lg = x.legionId && L[x.legionId];
                return h('div', { class: 'lhq-big', style: `border-color:${lg ? lg.color : 'var(--color-brand,#6366f1)'}` }, [
                  h('div', { class: 'n' }, [x.taskNo ? `#${x.taskNo} · ` : '', lg ? lg.name : x.legionName || t('集群任务'), ' · ', t('已执行 {p0} 秒', { p0: Math.max(0, Math.round((Date.now() - x.receivedAt) / 1000)) })]),
                  h('div', { class: 'g' }, x.goal || x.title),
                  x.goal ? h('div', { class: 'lhq-sub', style: 'margin:0' }, t('所属任务：{p0}', { p0: x.title })) : null,
                ]);
              }))
            : h('div', { class: 'lhq-empty' }, t('待命中：主控派来的活会显示在这里')),
          h('h3', { style: 'margin:18px 0 10px' }, t('最近完成')),
          e.recent.length
            ? h('table', { class: 'lhq-tbl' }, e.recent.map((x) => h('tr', [h('td', x.taskNo ? `#${x.taskNo}` : ''), h('td', (x.legionId && L[x.legionId]?.short) || x.legionName || ''), h('td', x.goal || x.title), h('td', x.status === 'done' ? t('完成') : h('span', { style: 'color:#dc2626' }, x.error || t('失败'))), h('td', x.durationMs ? `${Math.round(x.durationMs / 1000)}s` : '')])))
            : h('div', { class: 'lhq-empty' }, t('本次打开以来还没有完成的任务')),
        ]);
      }

      // 子机页面每秒刷新「已执行 N 秒」
      const tick = ref(0);
      const timer = setInterval(() => (tick.value++), 1000);
      onUnmounted(() => clearInterval(timer));

      return () => {
        void tick.value;
        if (!info.value) return h('div', { class: 'lhq', style: 'padding-top:32px' }, t('加载中…'));
        if (isEmployee.value) return viewEmployee();
        const st = steps.value;
        const c = snap.value.counters || {};
        return h('div', { class: 'lhq', 'data-test': 'legion-hq' }, [
          h('div', { class: 'lhq-sticky' }, [
            h('div', { class: 'lhq-head' }, [
              h('h2', t('运营中心')),
              h('span', { class: 'lhq-badge on' }, { cluster: t('集群主控'), standalone: t('单机') }[info.value.mode] || info.value.mode),
              h('span', { class: `lhq-badge${screen.value.running ? ' on' : ''}` }, screen.value.running ? t('大屏运行中') : t('大屏未启动')),
              h('span', { class: 'lhq-badge' }, t('进行中 {p0} · 今日完成 {p1}', { p0: c.running || 0, p1: c.doneToday || 0 })),
              c.awaiting ? h('span', { class: 'lhq-badge warn', style: 'cursor:pointer', onClick: () => go('s4') }, t('待老板确认 {p0}', { p0: c.awaiting })) : null,
            ]),
            h('div', { class: 'lhq-steps' }, st.map((s, i) => h('button', { class: `${s.done ? 'done' : ''}${cur.value === s.id ? ' cur' : ''}`, onClick: () => go(s.id) }, `${i + 1} ${s.name}${s.done ? ' ✓' : ''}`))),
            h('div', { class: 'lhq-prog' }, h('i', { style: `width:${progress.value}%` })),
          ]),
          viewFleet(st[0]),
          viewCompany(st[1]),
          viewScreen(st[2]),
          viewCommand(st[3]),
          viewRoutines(st[4]),
          viewDirector(st[5]),
          viewCoverage(st[6]),
          viewCost(st[7]),
          viewExam(st[8]),
        ]);
      };
    },
  });
}
