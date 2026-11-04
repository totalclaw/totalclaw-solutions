/**
 * 智能体编排（懒加载页签）：① 租户与管理 ② 编排工作流（可视化画布）③ 调试运行 ④ 发布、插件与 API。
 * 画布：拖动节点；点节点右侧的出口圆点再点另一个节点就连上（条件节点有「是 / 否」两个出口）；点连线删除。
 */
export default function agentsTab(kit) {
  const { vue, el, t, call, busy, errNote, card, sdk } = kit;
  const { ref, reactive, computed, h } = vue;

  const ov = ref(null);
  const agent = ref(null);
  const sel = ref('');
  const linking = ref(null); // { from, branch }
  const drag = reactive({ id: '', dx: 0, dy: 0 });
  const runInputs = reactive({});
  const runRes = ref(null);
  const runs = ref([]);
  const issues = ref([]);
  const newKey = ref(null);
  const pluginJson = ref('{\n  "id": "fx-rate",\n  "name": "汇率查询",\n  "description": "按币种查参考汇率",\n  "kind": "http",\n  "inputs": [{ "name": "ccy", "label": "币种", "required": true }],\n  "request": { "method": "GET", "url": "https://api.example.com/fx?ccy={{inputs.ccy}}" },\n  "outputPath": "data.rate"\n}');
  const tenantForm = reactive({ name: '', color: '#19376d' });
  const dirty = ref(false);

  const NT = () => ov.value?.nodeTypes || {};
  const load = async (tenant) => {
    ov.value = await call('agOv', 'agents.overview', tenant ? { tenant } : {});
    if (ov.value && (!agent.value || !ov.value.agents.some((a) => a.id === agent.value.id))) {
      if (ov.value.agents[0]) await open(ov.value.agents[0].id); else agent.value = null;
    }
  };
  const open = async (id) => {
    agent.value = await call('agGet', 'agents.get', { id });
    sel.value = ''; runRes.value = null; dirty.value = false; issues.value = [];
    for (const k of Object.keys(runInputs)) delete runInputs[k];
    runs.value = (await call('agRuns', 'agents.runs', { id })) || [];
  };
  const switchTenant = async (id) => { await call('agT', 'agents.tenant.switch', { id }); agent.value = null; await load(); };
  const addTenant = async () => { if (!tenantForm.name.trim()) return; const r = await call('agT', 'agents.tenant.save', { ...tenantForm }); if (r) { tenantForm.name = ''; await switchTenant(r.id); } };
  const removeTenant = async (id) => { await call('agT', 'agents.tenant.remove', { id }); await load(); };
  const save = async () => {
    const a = agent.value;
    const v = await call('agVal', 'agents.validate', { graph: a.graph });
    issues.value = v?.issues || [];
    const r = await call('agSave', 'agents.save', { id: a.id, name: a.name, description: a.description, graph: a.graph });
    if (r) { agent.value = r; dirty.value = false; await load(); sdk.notify.success(t('已保存')); }
  };
  const create = async () => { const r = await call('agSave', 'agents.save', { name: t('新智能体') }); if (r) { await load(); await open(r.id); } };
  const confirmDel = ref('');
  const removeById = async (id) => {
    if (confirmDel.value !== id) { confirmDel.value = id; setTimeout(() => { if (confirmDel.value === id) confirmDel.value = ''; }, 4000); return; }
    confirmDel.value = '';
    await call('agSave', 'agents.remove', { id });
    if (agent.value?.id === id) agent.value = null;
    await load();
  };
  const remove = () => removeById(agent.value.id);
  const run = async () => {
    if (dirty.value) await save();
    runRes.value = await call('agRun', 'agents.run', { id: agent.value.id, inputs: { ...runInputs } });
    runs.value = (await call('agRuns', 'agents.runs', { id: agent.value.id })) || [];
  };
  const publish = async (on) => { if (dirty.value) await save(); const r = await call('agPub', 'agents.publish', { id: agent.value.id, published: on }); if (r) { agent.value = { ...agent.value, published: r.published }; await load(); } };
  const importPlugin = async () => { const r = await call('agPl', 'agents.plugin.import', { manifest: pluginJson.value }); if (r) { sdk.notify.success(t('插件「{p0}」已加入本租户', { p0: r.name })); await load(); } };
  const removePlugin = async (id) => { await call('agPl', 'agents.plugin.remove', { id }); await load(); };
  const createKey = async () => { newKey.value = await call('agKey', 'agents.key.create', { label: t('接入方') }); await load(); };
  const revokeKey = async (id) => { await call('agKey', 'agents.key.revoke', { id }); await load(); };
  const api = async (on) => { const r = await call('agApi', on ? 'agents.api.start' : 'agents.api.stop', {}); if (r) ov.value = { ...ov.value, api: r }; };

  // ── 画布编辑 ──
  const nodes = () => agent.value?.graph.nodes || [];
  const edges = () => agent.value?.graph.edges || [];
  const node = (id) => nodes().find((n) => n.id === id);
  const selNode = computed(() => node(sel.value));
  const touch = () => { dirty.value = true; };
  const addNode = (type) => {
    const g = agent.value.graph;
    let i = g.nodes.length + 1;
    while (g.nodes.some((n) => n.id === `n${i}`)) i += 1;
    const base = { llm: { prompt: '请回答：{{inputs.question}}', cls: 'internal' }, retrieve: { query: '{{inputs.question}}', topK: 4 }, condition: { left: '{{inputs.question}}', op: 'contains', right: '' }, assign: { value: '' }, plugin: { plugin: '', inputs: {} }, answer: { text: '' }, start: { fields: [{ name: 'question', label: '问题', required: true }] } }[type] || {};
    const last = g.nodes[g.nodes.length - 1];
    g.nodes.push({ id: `n${i}`, type, title: t(NT()[type]?.label || type), x: (last?.x || 40) + 60, y: (last?.y || 80) + 90, config: base });
    sel.value = `n${i}`; touch();
  };
  const delNode = (id) => { const g = agent.value.graph; g.nodes = g.nodes.filter((n) => n.id !== id); g.edges = g.edges.filter((e) => e.from !== id && e.to !== id); sel.value = ''; touch(); };
  const startLink = (from, branch, ev) => { ev.stopPropagation(); linking.value = { from, branch }; };
  const clickNode = (id) => {
    if (linking.value && linking.value.from !== id) {
      const g = agent.value.graph;
      g.edges = g.edges.filter((e) => !(e.from === linking.value.from && (e.branch || '') === (linking.value.branch || '')));
      g.edges.push({ from: linking.value.from, to: id, branch: linking.value.branch || '' });
      linking.value = null; touch(); return;
    }
    linking.value = null; sel.value = id;
  };
  const onDown = (n, ev) => { if (ev.button !== 0) return; drag.id = n.id; drag.dx = ev.clientX - n.x; drag.dy = ev.clientY - n.y; };
  const onMove = (ev) => { if (!drag.id) return; const n = node(drag.id); if (!n) return; n.x = Math.max(0, Math.round(ev.clientX - drag.dx)); n.y = Math.max(0, Math.round(ev.clientY - drag.dy)); touch(); };
  const onUp = () => { drag.id = ''; };
  const W = 168; const H = 58;
  const port = (n, branch) => (n.type === 'condition' ? { x: n.x + W, y: n.y + (branch === 'false' ? H - 14 : 14) } : { x: n.x + W, y: n.y + H / 2 });
  const curve = (a, b) => `M${a.x},${a.y} C${a.x + 60},${a.y} ${b.x - 60},${b.y} ${b.x},${b.y}`;
  const svg = (tag, props, kids) => h(tag, props, kids);

  const vCanvas = () => {
    const ns = nodes();
    const width = Math.max(900, ...ns.map((n) => n.x + W + 60));
    const height = Math.max(380, ...ns.map((n) => n.y + H + 60));
    return el('div', { style: 'position:relative;overflow:auto;border:1px solid var(--fa-line,#dbe2ec);border-radius:8px;background:repeating-linear-gradient(0deg,transparent 0 23px,#eef2f8 23px 24px),repeating-linear-gradient(90deg,transparent 0 23px,#eef2f8 23px 24px);height:430px', onPointermove: onMove, onPointerup: onUp, onPointerleave: onUp, 'data-test': 'ag-canvas' },
      el('div', { style: `position:relative;width:${width}px;height:${height}px` },
        svg('svg', { width, height, style: 'position:absolute;inset:0;pointer-events:none' }, edges().map((e, i) => {
          const a = node(e.from); const b = node(e.to);
          if (!a || !b) return null;
          const p1 = port(a, e.branch); const p2 = { x: b.x, y: b.y + H / 2 };
          const color = e.branch === 'true' ? '#15803d' : e.branch === 'false' ? '#c2410c' : '#64748b';
          return svg('g', { key: `e${i}` }, [
            svg('path', { d: curve(p1, p2), stroke: color, 'stroke-width': 2, fill: 'none', style: 'pointer-events:stroke;cursor:pointer', onClick: () => { agent.value.graph.edges.splice(i, 1); touch(); } }),
            e.branch ? svg('text', { x: p1.x + 10, y: p1.y - 4, 'font-size': 11, fill: color }, e.branch === 'true' ? t('是') : t('否')) : null,
          ]);
        })),
        ns.map((n) => {
          const ty = NT()[n.type] || {};
          return el('div', {
            key: n.id,
            style: `position:absolute;left:${n.x}px;top:${n.y}px;width:${W}px;height:${H}px;box-sizing:border-box;background:#fff;border:2px solid ${sel.value === n.id ? ty.color : '#d6deea'};border-left:5px solid ${ty.color};border-radius:8px;padding:6px 10px;cursor:${linking.value ? 'crosshair' : 'grab'};user-select:none;box-shadow:0 1px 3px rgba(11,36,71,.08)`,
            onPointerdown: (ev) => onDown(n, ev), onClick: () => clickNode(n.id), 'data-test': `ag-node-${n.id}`,
          },
          el('div', { style: `font-size:11px;color:${ty.color}` }, el('i', { class: ty.icon }), ' ', t(ty.label || n.type)),
          el('div', { style: 'font-weight:600;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis' }, n.title),
          n.type !== 'answer' ? (n.type === 'condition'
            ? [['true', 14, '#15803d'], ['false', H - 14, '#c2410c']].map(([b, y, c]) => el('span', { key: b, title: b === 'true' ? t('「是」连到…') : t('「否」连到…'), onPointerdown: (ev) => ev.stopPropagation(), onClick: (ev) => startLink(n.id, b, ev), style: `position:absolute;right:-8px;top:${y - 7}px;width:14px;height:14px;border-radius:50%;background:${c};border:2px solid #fff;cursor:pointer` }))
            : el('span', { title: t('连到下一个节点：点这里，再点目标节点'), onPointerdown: (ev) => ev.stopPropagation(), onClick: (ev) => startLink(n.id, '', ev), style: `position:absolute;right:-8px;top:${H / 2 - 7}px;width:14px;height:14px;border-radius:50%;background:${ty.color};border:2px solid #fff;cursor:pointer` })) : null);
        })));
  };

  const fieldRow = (label, input) => el('div', { style: 'margin:6px 0' }, el('div', { class: 'fa-empty' }, label), input);
  const inp = (obj, key, attrs = {}) => el('input', { class: 'fa-in', style: 'width:100%', value: obj[key] ?? '', onInput: (e) => { obj[key] = e.target.value; touch(); }, ...attrs });
  const ta = (obj, key, rows = 5) => el('textarea', { class: 'fa-in fa-ta', style: `min-height:${rows * 20}px`, value: obj[key] ?? '', onInput: (e) => { obj[key] = e.target.value; touch(); } });
  const vInspector = () => {
    const n = selNode.value;
    if (!n) return el('p', { class: 'fa-empty' }, linking.value ? t('点目标节点完成连线') : t('点一个节点编辑它；变量写法：{{inputs.问题字段}}、{{节点id.output}}'));
    const c = n.config;
    const plugins = ov.value?.plugins || [];
    return el('div', null,
      fieldRow(t('节点名称'), inp(n, 'title')),
      el('div', { class: 'fa-empty' }, t('节点 id：{p0}（其它节点用 {{{p0}.output}} 引用它的结果）', { p0: n.id })),
      n.type === 'start' ? fieldRow(t('输入字段（每行：字段名|显示名|必填填 1）'), el('textarea', { class: 'fa-in fa-ta', style: 'min-height:70px', value: (c.fields || []).map((f) => `${f.name}|${f.label || ''}|${f.required ? 1 : 0}`).join('\n'), onInput: (e) => { c.fields = e.target.value.split('\n').map((l) => l.split('|')).filter((x) => x[0]?.trim()).map(([name, label, r]) => ({ name: name.trim(), label: (label || name).trim(), required: String(r).trim() === '1' })); touch(); } })) : null,
      n.type === 'llm' ? [fieldRow(t('提示词'), ta(c, 'prompt', 8)), fieldRow(t('数据级别（决定 AI 网关路由）'), el('select', { class: 'fa-in', value: c.cls || 'internal', onChange: (e) => { c.cls = e.target.value; touch(); } }, [['public', '公开'], ['internal', '内部'], ['sensitive', '客户敏感']].map(([v, l]) => el('option', { value: v, selected: (c.cls || 'internal') === v }, t(l)))))] : null,
      n.type === 'retrieve' ? [fieldRow(t('检索内容'), inp(c, 'query')), fieldRow(t('取几条'), inp(c, 'topK', { type: 'number', min: 1, max: 8 }))] : null,
      n.type === 'condition' ? [fieldRow(t('左边'), inp(c, 'left')), fieldRow(t('判断'), el('select', { class: 'fa-in', value: c.op || 'contains', onChange: (e) => { c.op = e.target.value; touch(); } }, [['contains', '包含'], ['not_contains', '不包含'], ['equals', '等于'], ['not_empty', '不为空'], ['empty', '为空'], ['gt', '大于'], ['lt', '小于']].map(([v, l]) => el('option', { value: v, selected: (c.op || 'contains') === v }, t(l))))), fieldRow(t('右边'), inp(c, 'right'))] : null,
      n.type === 'assign' ? fieldRow(t('值（模板）'), ta(c, 'value', 3)) : null,
      n.type === 'plugin' ? [fieldRow(t('插件'), el('select', { class: 'fa-in', value: c.plugin || '', onChange: (e) => { c.plugin = e.target.value; c.inputs = {}; touch(); } }, el('option', { value: '' }, t('选择插件…')), plugins.map((p) => el('option', { value: p.id, selected: c.plugin === p.id }, `${p.name}${p.kind === 'builtin' ? t('（内置）') : ''}`)))),
        ...((plugins.find((p) => p.id === c.plugin)?.inputs) || []).map((f) => { c.inputs = c.inputs || {}; return fieldRow(`${f.label}${f.required ? ' *' : ''}`, inp(c.inputs, f.name)); })] : null,
      n.type === 'answer' ? fieldRow(t('回复内容（模板）'), ta(c, 'text', 4)) : null,
      el('button', { class: 'fa-link', style: 'color:#b91c1c;margin-top:6px', onClick: () => delNode(n.id) }, t('删除节点')));
  };

  const vTenant = () => {
    const o = ov.value;
    const cur = o?.tenants.find((x) => x.id === o.tenant);
    return card('ag-1', t('① 租户与管理'), !!o,
      t('每个租户（分行、事业部、合作方）有自己的智能体、运行记录、插件和 API 密钥，彼此看不到；切换租户就进入它自己的管理界面。'),
      o ? el('div', null,
        el('div', { class: 'fa-row' }, o.tenants.map((x) => el('button', { class: `fa-btn${x.id === o.tenant ? ' pri' : ''}`, style: x.id === o.tenant ? `background:${x.color};border-color:${x.color}` : `border-left:4px solid ${x.color}`, onClick: () => switchTenant(x.id), 'data-test': `ag-tenant-${x.id}` }, x.name)),
          o.tenants.length > 1 && cur ? el('button', { class: 'fa-link', style: 'color:#b91c1c', onClick: () => removeTenant(cur.id) }, t('删除当前租户')) : null),
        el('div', { class: 'fa-row' }, el('input', { class: 'fa-in', placeholder: t('新租户名称，如：信用卡中心'), value: tenantForm.name, onInput: (e) => { tenantForm.name = e.target.value; } }), el('input', { type: 'color', value: tenantForm.color, onInput: (e) => { tenantForm.color = e.target.value; } }), el('button', { class: 'fa-btn', onClick: addTenant, 'data-test': 'ag-tenant-add' }, t('新建租户'))),
        el('div', { class: 'fa-grid' }, [[o.agents.length, '智能体'], [o.agents.filter((a) => a.published).length, '已发布'], [o.plugins.filter((p) => p.kind !== 'builtin').length, '自定义插件'], [o.keys.length, 'API 密钥']].map(([v, l]) => el('div', { class: 'fa-kpi', style: `border-left-color:${cur?.color || ''}` }, el('b', null, String(v)), el('span', null, t(l)))))) : null,
      errNote('agOv'), errNote('agT'));
  };

  const vEditor = () => card('ag-2', t('② 编排工作流'), !!agent.value && !dirty.value && !issues.value.length,
    t('从左上角加节点，拖动摆位置；点节点右边的圆点再点另一个节点就连上，点连线删除。大模型节点经 AI 网关调用（路由、脱敏、审计都生效）。'),
    el('div', { class: 'fa-row' },
      (ov.value?.agents || []).map((a) => el('span', { key: a.id, style: 'display:inline-flex;align-items:center;gap:2px' },
        el('button', { class: `fa-btn sm${agent.value?.id === a.id ? ' pri' : ''}`, onClick: () => open(a.id) }, a.name, a.published ? ' ●' : ''),
        // 点错新建的可以直接删：点一下变「确认删除？」，再点才删
        el('button', { class: 'fa-link', title: t('删除这个智能体'), 'data-test': `ag-del-${a.id}`, style: `padding:0 4px;color:${confirmDel.value === a.id ? '#b91c1c' : '#94a3b8'}`, onClick: () => removeById(a.id) }, confirmDel.value === a.id ? t('确认删除？') : '×'))),
      el('button', { class: 'fa-btn sm', onClick: create, 'data-test': 'ag-new' }, t('+ 新建智能体'))),
    agent.value ? el('div', null,
      el('div', { class: 'fa-row' },
        el('input', { class: 'fa-in', style: 'font-weight:600', value: agent.value.name, onInput: (e) => { agent.value.name = e.target.value; touch(); } }),
        el('input', { class: 'fa-in', style: 'flex:1;min-width:240px', placeholder: t('一句话说明'), value: agent.value.description, onInput: (e) => { agent.value.description = e.target.value; touch(); } })),
      el('div', { class: 'fa-row' }, el('span', { class: 'fa-empty' }, t('加节点：')),
        Object.entries(NT()).filter(([k]) => k !== 'start').map(([k, v]) => el('button', { class: 'fa-btn sm', style: `border-left:3px solid ${v.color}`, onClick: () => addNode(k), 'data-test': `ag-add-${k}` }, el('i', { class: v.icon }), ' ', t(v.label))),
        linking.value ? el('span', { class: 'fa-src' }, t('连线中：点目标节点（点空白处取消）')) : null),
      el('div', { style: 'display:grid;grid-template-columns:minmax(0,1fr) 300px;gap:12px;align-items:start' }, vCanvas(), el('div', { class: 'fa-kbform', style: 'margin-top:0' }, vInspector())),
      issues.value.length ? el('div', { class: 'fa-note warn' }, issues.value.map((x) => el('div', null, `· ${x}`))) : null,
      el('div', { class: 'fa-row' },
        el('button', { class: 'fa-btn pri', disabled: busy.agSave, onClick: save, 'data-test': 'ag-save' }, dirty.value ? t('保存（有改动）') : t('保存')),
        el('button', { class: 'fa-link', style: 'color:#b91c1c', onClick: remove }, confirmDel.value === agent.value.id ? t('再点一次确认删除') : t('删除这个智能体')))) : el('p', { class: 'fa-empty' }, t('这个租户还没有智能体')),
    errNote('agSave'), errNote('agGet'));

  const vRun = () => {
    const a = agent.value;
    const fields = a?.graph.nodes.find((n) => n.type === 'start')?.config.fields || [];
    const r = runRes.value;
    return card('ag-3', t('③ 调试运行'), !!r?.ok,
      t('填输入跑一次，看每个节点的输入、输出和耗时；出错会停在出错的节点上。'),
      a ? el('div', null,
        fields.map((f) => el('div', { class: 'fa-row', key: f.name }, el('span', { style: 'min-width:80px' }, f.label || f.name), el('input', { class: 'fa-in', style: 'flex:1', value: runInputs[f.name] || '', 'data-test': `ag-in-${f.name}`, onInput: (e) => { runInputs[f.name] = e.target.value; } }))),
        el('button', { class: 'fa-btn pri', disabled: busy.agRun, onClick: run, 'data-test': 'ag-run' }, busy.agRun ? t('运行中…') : t('运行')),
        r ? el('div', null,
          r.ok ? el('div', { class: 'fa-note ok', 'data-test': 'ag-answer' }, el('b', null, t('回复：')), el('div', { class: 'fa-ans' }, r.answer)) : el('div', { class: 'fa-note err' }, r.error),
          el('table', { class: 'fa-tbl' }, el('thead', null, el('tr', null, [t('节点'), t('输入'), t('输出'), t('耗时')].map((x) => el('th', null, x)))),
            el('tbody', null, r.trace.map((s) => el('tr', { key: s.node },
              el('td', null, el('b', null, s.title), el('div', { class: 'fa-empty' }, t(NT()[s.type]?.label || s.type))),
              el('td', null, el('div', { class: 'fa-q', style: 'max-height:90px;overflow:auto;margin:0' }, typeof s.input === 'object' ? JSON.stringify(s.input) : String(s.input ?? ''))),
              el('td', null, s.ok ? el('div', { class: 'fa-q', style: 'max-height:90px;overflow:auto;margin:0' }, typeof s.output === 'object' ? JSON.stringify(s.output) : String(s.output ?? '')) : el('span', { class: 'fa-note err' }, s.error), s.hits ? el('div', { class: 'fa-empty' }, t('命中 {p0} 条', { p0: s.hits.length })) : null),
              el('td', null, `${s.ms} ms`)))))) : null,
        runs.value.length ? el('p', { class: 'fa-empty' }, t('最近运行：{p0}', { p0: runs.value.slice(0, 6).map((x) => `${x.at.slice(11, 19)} ${x.source === 'api' ? 'API' : t('控制台')} ${x.ok ? '✓' : '✗'}`).join('　') })) : null) : null,
      errNote('agRun'));
  };

  const vPublish = () => {
    const o = ov.value;
    const a = agent.value;
    return card('ag-4', t('④ 发布、插件与 API'), !!a?.published && !!o?.api.running,
      t('发布后，本租户的系统可以带密钥调用：POST /v1/agents/<id>/run，请求体 {"inputs": {...}}；服务只开在本机 127.0.0.1。插件是声明式清单（请求地址、参数、取值路径），不执行任何上传的代码。'),
      a ? el('div', { class: 'fa-row' },
        el('b', null, a.name), a.published ? el('span', { class: 'fa-lv pass' }, t('已发布')) : el('span', { class: 'fa-lv medium' }, t('未发布')),
        el('button', { class: 'fa-btn', disabled: busy.agPub, onClick: () => publish(!a.published), 'data-test': 'ag-publish' }, a.published ? t('下线') : t('发布'))) : null,
      errNote('agPub'),
      o ? el('div', { class: 'fa-cols' },
        el('div', null,
          el('h4', { style: 'margin:6px 0' }, t('本机 API')),
          el('div', { class: 'fa-row' }, o.api.running ? el('code', { class: 'fa-code' }, o.api.url) : el('span', { class: 'fa-empty' }, t('未开启')),
            el('button', { class: 'fa-btn sm', disabled: busy.agApi, onClick: () => api(!o.api.running), 'data-test': 'ag-api' }, o.api.running ? t('关闭') : t('开启'))),
          a && o.api.running ? el('div', { class: 'fa-code' }, `curl -X POST ${o.api.url}/agents/${a.id}/run \\\n  -H "Authorization: Bearer <密钥>" \\\n  -d '{"inputs":{"question":"大额存单起存多少"}}'`) : null,
          el('h4', { style: 'margin:10px 0 6px' }, t('API 密钥（只显示一次）')),
          newKey.value ? el('div', { class: 'fa-note warn' }, t('新密钥：'), el('code', null, newKey.value.key), t('（关掉后再也看不到，请立即保存）')) : null,
          (o.keys || []).map((k) => el('div', { class: 'fa-row', key: k.id }, el('code', null, `${k.prefix}…`), el('span', { class: 'fa-empty' }, `${k.label} · ${k.createdAt.slice(0, 10)}`), el('button', { class: 'fa-link', onClick: () => revokeKey(k.id) }, t('吊销')))),
          el('button', { class: 'fa-btn sm', onClick: createKey, 'data-test': 'ag-key' }, t('+ 生成密钥')),
          errNote('agApi'), errNote('agKey')),
        el('div', null,
          el('h4', { style: 'margin:6px 0' }, t('插件')),
          (o.plugins || []).map((p) => el('div', { class: 'fa-row', key: p.id }, el('span', { class: `fa-src${p.kind === 'builtin' ? ' pc' : ''}` }, p.kind === 'builtin' ? t('内置') : 'HTTP'), el('b', null, p.name), el('span', { class: 'fa-empty' }, p.description), p.kind !== 'builtin' ? el('button', { class: 'fa-link', onClick: () => removePlugin(p.id) }, t('移除')) : null)),
          el('textarea', { class: 'fa-in fa-ta', style: 'font-family:ui-monospace,Menlo,monospace;font-size:12px', value: pluginJson.value, onInput: (e) => { pluginJson.value = e.target.value; } }),
          el('button', { class: 'fa-btn', onClick: importPlugin, 'data-test': 'ag-plugin' }, t('导入插件清单')),
          errNote('agPl'))) : null);
  };

  return {
    load: () => load(),
    steps: () => [
      { id: 'ag-1', title: t('① 租户与管理'), done: !!ov.value },
      { id: 'ag-2', title: t('② 编排工作流'), done: !!agent.value && !dirty.value && !issues.value.length },
      { id: 'ag-3', title: t('③ 调试运行'), done: !!runRes.value?.ok },
      { id: 'ag-4', title: t('④ 发布、插件与 API'), done: !!agent.value?.published && !!ov.value?.api.running },
    ],
    view: () => el('div', { 'data-test': 'fa-agents', onClick: (e) => { if (linking.value && e.target === e.currentTarget) linking.value = null; } }, vTenant(), vEditor(), vRun(), vPublish()),
  };
}
