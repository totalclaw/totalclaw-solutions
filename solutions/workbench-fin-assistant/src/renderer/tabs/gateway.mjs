/**
 * 统一 AI 网关（懒加载页签）：① 模型与路由 ② 脱敏与安全围栏（含试一下）③ 全量审计日志。
 * 本工作台所有模型调用都经主进程 gateway.cjs；这里只做配置和查看。
 */
export default function gatewayTab(kit) {
  const { vue, el, t, call, busy, errNote, card, fmtAt, richText } = kit;
  const { ref, reactive } = vue;

  const cfg = ref(null);
  const draft = reactive({ models: [], rules: [], mask: { enabled: true, kinds: [], names: '' }, guard: { input: true, output: true, banned: '' } });
  const test = reactive({ text: '客户王小明（身份证 11010519491231002X，手机 13800138000）想了解大额存单起存金额，能否保本保收益？', scene: 'qa', cls: 'internal' });
  const testRes = ref(null);
  const auditRes = ref(null);
  const filter = reactive({ scene: '*', status: '' });
  const saved = ref(false);

  const KINDS = [['idcard', '身份证号'], ['bankcard', '银行卡号'], ['phone', '手机号'], ['email', '邮箱']];
  const CLS = [['public', '公开'], ['internal', '内部'], ['sensitive', '客户敏感']];
  const CX = [['*', '不限'], ['simple', '简单问题'], ['complex', '复杂问题']];

  const fill = (c) => {
    cfg.value = c;
    draft.models = c.models.map((m) => ({ ...m }));
    draft.rules = c.rules.map((r) => ({ ...r, models: [...r.models] }));
    draft.mask.enabled = c.mask.enabled;
    draft.mask.kinds = [...c.mask.kinds];
    draft.mask.names = c.mask.names.join('、');
    draft.guard.input = c.guard.input;
    draft.guard.output = c.guard.output;
    draft.guard.banned = c.guard.banned.join('、');
  };
  const loadAudit = async () => { auditRes.value = await call('gwAudit', 'gateway.audit', { scene: filter.scene, status: filter.status }); };
  const load = async () => {
    const c = await call('gw', 'gateway.get');
    if (c) fill(c);
    await loadAudit();
  };
  const split = (s) => String(s || '').split(/[、,，\n]/).map((x) => x.trim()).filter(Boolean);
  const save = async (modelKeys) => {
    const c = await call('gwSave', 'gateway.save', {
      models: draft.models, rules: draft.rules, ...(modelKeys ? { modelKeys } : {}),
      mask: { enabled: draft.mask.enabled, kinds: draft.mask.kinds, names: split(draft.mask.names) },
      guard: { input: draft.guard.input, output: draft.guard.output, banned: split(draft.guard.banned) },
    });
    if (c) { const scenes = cfg.value?.scenes; fill({ ...cfg.value, ...c, scenes }); saved.value = true; kit.sdk.notify.success(t('网关配置已保存，立即生效')); await loadAudit(); }
    return c;
  };

  // ── 模型配置弹层（页面内，不用 window.prompt）：用应用里已配的模型，或直连内网私有部署的 OpenAI 兼容接口 ──
  const mdl = ref(null);
  const mdlTest = ref(null);
  const openModel = (i) => {
    const m = i >= 0 ? draft.models[i] : null;
    mdlTest.value = null;
    mdl.value = {
      idx: i, isDefault: m?.value === '' && m?.kind !== 'direct',
      kind: m?.kind === 'direct' || i < 0 ? 'direct' : 'host',
      value: m?.kind === 'direct' ? '' : (m?.value ?? ''),
      id: m?.id || `dm${Date.now().toString(36)}`,
      endpoint: m?.endpoint || '', model: m?.model || '', apiKey: '', hasKey: !!m?.hasKey,
      timeout: String(m?.timeout || 60), label: m?.label || '', internal: i < 0 ? true : !!m?.internal, enabled: m?.enabled !== false,
    };
  };
  const mdlEntry = () => {
    const d = mdl.value;
    if (d.kind === 'direct') return { kind: 'direct', id: d.id, endpoint: d.endpoint.trim(), model: d.model.trim(), timeout: Number(d.timeout) || 60, label: d.label.trim() || d.model.trim(), internal: d.internal, enabled: d.enabled, hasKey: d.hasKey || !!d.apiKey };
    const host = (cfg.value?.hostModels || []).find((o) => o.value === d.value);
    return { value: d.value, label: d.label.trim() || host?.label || (d.value ? d.value : t('系统默认模型')), internal: d.internal, enabled: d.enabled };
  };
  const mdlProblem = () => {
    const d = mdl.value;
    if (!d) return '';
    if (d.kind === 'direct') {
      if (!/^https?:\/\/[^\s]+$/i.test(d.endpoint.trim())) return t('接口地址要以 http:// 或 https:// 开头，如 http://10.0.0.8:8000/v1');
      if (!d.model.trim()) return t('请填模型名，如 qwen2.5-72b-instruct');
      const n = Number(d.timeout); if (!(n >= 5 && n <= 600)) return t('超时填 5～600 秒');
    } else if (!d.isDefault && !d.value) return t('请选一个应用里已配置的模型');
    const v = d.kind === 'direct' ? `direct:${d.id}` : d.value;
    if (draft.models.some((m, j) => j !== d.idx && m.value === v)) return t('这个模型已经在列表里了');
    return '';
  };
  const testModel = async () => { mdlTest.value = null; mdlTest.value = await call('gwMTest', 'gateway.model.test', { model: mdlEntry(), apiKey: mdl.value.apiKey || undefined }); };
  const saveModel = async () => {
    if (mdlProblem()) return;
    const d = mdl.value;
    const e = mdlEntry();
    const v = e.kind === 'direct' ? `direct:${e.id}` : e.value;
    if (d.idx >= 0) {
      const old = draft.models[d.idx].value;
      draft.models.splice(d.idx, 1, { ...e, value: v });
      // 改了接入方式（value 变了）：路由规则里引用旧模型的地方一并换成新的
      if (old !== v) for (const r of draft.rules) r.models = r.models.map((x) => (x === old ? v : x));
    } else draft.models.push({ ...e, value: v });
    const c = await save(d.apiKey ? { [e.id]: d.apiKey } : undefined);
    if (c) mdl.value = null;
  };
  const addModel = (o) => {
    if (draft.models.some((m) => m.value === o.value)) return;
    draft.models.push({ value: o.value, label: o.label, internal: false, enabled: true });
  };
  const addRule = () => draft.rules.push({ id: `r${Date.now().toString(36)}`, name: '', scene: '*', cls: '*', complexity: '*', models: draft.models.slice(0, 1).map((m) => m.value) });
  const runTest = async (run) => { testRes.value = await call('gwTest', 'gateway.test', { ...test, run }); if (run) await loadAudit(); };
  const exportCsv = async () => { const r = await call('gwExport', 'gateway.export'); if (r?.ok) kit.sdk.notify.success(t('已导出 {p0} 条到 {p1}', { p0: r.rows, p1: r.path })); };

  const modelLabel = (v) => draft.models.find((m) => m.value === v)?.label || v || t('系统默认模型');
  const sceneLabel = (id) => (cfg.value?.scenes || []).find((s) => s.id === id)?.label || (id === '*' ? t('全部场景') : id);
  const sel = (value, opts, onChange, attrs = {}) => el('select', { class: 'fa-in', value, onChange: (e) => onChange(e.target.value), ...attrs }, opts.map(([v, l]) => el('option', { value: v, selected: v === value }, t(l))));

  const vModels = () => card('gw-1', t('① 模型与路由'), saved.value || (cfg.value?.rules?.length > 0),
    t('把能用的模型登记进来，标出哪些是内网私有部署；再按「场景 + 数据级别 + 问题复杂度」写路由规则，从上到下第一条命中的生效，规则里的模型按顺序尝试、前一个失败自动换下一个。客户敏感数据只会落到内网模型上，一个都没有就拦下。'),
    el('table', { class: 'fa-tbl' },
      el('thead', null, el('tr', null, [t('模型'), t('内网私有部署'), t('启用'), ''].map((x) => el('th', null, x)))),
      el('tbody', null, draft.models.map((m, i) => el('tr', { key: m.value || 'default' },
        el('td', null, el('b', null, m.label), m.kind === 'direct' ? el('span', { class: 'fa-src pc', style: 'margin-left:6px' }, t('直连')) : null,
          el('div', { class: 'fa-empty' }, m.kind === 'direct' ? `${m.model} · ${String(m.endpoint).replace(/^(https?:\/\/[^/]+).*$/, '$1')}${m.hasKey ? t(' · 密钥已加密保存') : ''}` : (m.value || t('（系统默认模型）')))),
        el('td', null, el('input', { type: 'checkbox', checked: m.internal, 'data-test': `gw-internal-${i}`, onChange: (e) => { m.internal = e.target.checked; } })),
        el('td', null, el('input', { type: 'checkbox', checked: m.enabled !== false, onChange: (e) => { m.enabled = e.target.checked; } })),
        el('td', { style: 'white-space:nowrap' },
          el('button', { class: `fa-btn sm${m.internal ? ' pri' : ''}`, onClick: () => openModel(i), 'data-test': `gw-model-cfg-${i}`, title: m.internal ? t('内网私有部署模型：接入方式、地址与密钥') : t('接入方式与显示名称') }, t('配置')), ' ',
          m.value ? el('button', { class: 'fa-link', onClick: () => { draft.models.splice(i, 1); } }, t('移除')) : null))))),
    el('div', { class: 'fa-row' },
      el('button', { class: 'fa-btn sm', onClick: () => openModel(-1), 'data-test': 'gw-add-direct' }, t('+ 添加私有模型')),
      el('span', { class: 'fa-empty' }, t('或从本机可用的模型里添加：')),
      el('select', { class: 'fa-in', 'data-test': 'gw-add-model', onChange: (e) => { const o = (cfg.value?.hostModels || []).find((x) => x.value === e.target.value); if (o) addModel(o); e.target.value = ''; } },
        el('option', { value: '' }, t('选择模型…')),
        (cfg.value?.hostModels || []).map((o) => el('option', { value: o.value }, `${o.group ? `${o.group} · ` : ''}${o.label}`)))),
    el('p', { class: 'fa-note info' }, t('「内网私有部署」由管理员核实后勾选：它决定客户敏感数据（授信材料、问数明细）能不能交给这个模型，发往它的内容也不再脱敏。')),
    el('h4', { style: 'margin:14px 0 6px' }, t('路由规则')),
    draft.rules.length ? el('table', { class: 'fa-tbl' },
      el('thead', null, el('tr', null, [t('规则名'), t('场景'), t('数据级别'), t('复杂度'), t('依次尝试的模型'), ''].map((x) => el('th', null, x)))),
      el('tbody', null, draft.rules.map((r, i) => el('tr', { key: r.id },
        el('td', null, el('input', { class: 'fa-in', style: 'width:120px', value: r.name, placeholder: t('如：复杂问题用强模型'), onInput: (e) => { r.name = e.target.value; } })),
        el('td', null, sel(r.scene, [['*', '全部场景'], ...(cfg.value?.scenes || []).map((s) => [s.id, s.label])], (v) => { r.scene = v; })),
        el('td', null, sel(r.cls, [['*', '不限'], ...CLS], (v) => { r.cls = v; })),
        el('td', null, sel(r.complexity, CX, (v) => { r.complexity = v; })),
        el('td', null, el('div', { class: 'fa-row' },
          r.models.map((v, j) => el('span', { class: 'fa-src pc' }, `${j + 1}. ${modelLabel(v)}`, el('button', { class: 'fa-link', style: 'margin-left:4px', onClick: () => r.models.splice(j, 1) }, '×'))),
          el('select', { class: 'fa-in', onChange: (e) => { if (e.target.value !== '__') { r.models.push(e.target.value); } e.target.value = '__'; } },
            el('option', { value: '__' }, t('+ 加模型')), draft.models.map((m) => el('option', { value: m.value }, m.label))))),
        el('td', null, el('button', { class: 'fa-link', onClick: () => draft.rules.splice(i, 1) }, t('删除')))))))
      : el('p', { class: 'fa-empty' }, t('还没有路由规则：所有调用按上面的模型顺序尝试。')),
    el('div', { class: 'fa-row' },
      el('button', { class: 'fa-btn', onClick: addRule, 'data-test': 'gw-add-rule' }, t('+ 添加规则')),
      el('button', { class: 'fa-btn pri', disabled: busy.gwSave, onClick: () => save(), 'data-test': 'gw-save' }, busy.gwSave ? t('保存中…') : t('保存网关配置'))),
    errNote('gw'), errNote('gwSave'));

  const vGuard = () => card('gw-2', t('② 脱敏与安全围栏'), !!testRes.value,
    t('发往非内网模型前把敏感信息换成占位符（模型看不到原值），回答回来再还原给使用者；使用者的问题里有越权指令会被拦下；回答里出现禁语会标记，出现输入里没有的完整证件号 / 卡号会打码。'),
    el('div', { class: 'fa-cols' },
      el('div', null,
        el('label', { class: 'fa-row' }, el('input', { type: 'checkbox', checked: draft.mask.enabled, onChange: (e) => { draft.mask.enabled = e.target.checked; } }), t('发往非内网模型前脱敏')),
        el('div', { class: 'fa-row' }, KINDS.map(([k, l]) => el('label', null, el('input', { type: 'checkbox', checked: draft.mask.kinds.includes(k), onChange: (e) => { draft.mask.kinds = e.target.checked ? [...draft.mask.kinds, k] : draft.mask.kinds.filter((x) => x !== k); } }), ' ', t(l)))),
        el('p', { class: 'fa-sub', style: 'margin:6px 0 2px' }, t('另外按名单逐字替换的客户 / 机构名（顿号分隔；授信预审里的借款人名会自动带上）')),
        el('textarea', { class: 'fa-in fa-ta', style: 'min-height:60px', value: draft.mask.names, onInput: (e) => { draft.mask.names = e.target.value; } }),
        el('label', { class: 'fa-row' }, el('input', { type: 'checkbox', checked: draft.guard.input, onChange: (e) => { draft.guard.input = e.target.checked; } }), t('输入围栏：拦截越权指令（「忽略以上指令」「输出系统提示词」等）')),
        el('label', { class: 'fa-row' }, el('input', { type: 'checkbox', checked: draft.guard.output, onChange: (e) => { draft.guard.output = e.target.checked; } }), t('输出围栏：禁语标记、编造的证件号 / 卡号打码')),
        el('p', { class: 'fa-sub', style: 'margin:6px 0 2px' }, t('输出禁语（顿号分隔）')),
        el('textarea', { class: 'fa-in fa-ta', style: 'min-height:60px', value: draft.guard.banned, onInput: (e) => { draft.guard.banned = e.target.value; } }),
        el('button', { class: 'fa-btn pri', disabled: busy.gwSave, onClick: () => save() }, t('保存'))),
      el('div', null,
        el('b', null, t('试一下')),
        el('textarea', { class: 'fa-in fa-ta', 'data-test': 'gw-test-text', value: test.text, onInput: (e) => { test.text = e.target.value; } }),
        el('div', { class: 'fa-row' },
          sel(test.scene, (cfg.value?.scenes || []).map((s) => [s.id, s.label]), (v) => { test.scene = v; }),
          sel(test.cls, CLS, (v) => { test.cls = v; }),
          el('button', { class: 'fa-btn', disabled: busy.gwTest, onClick: () => runTest(false), 'data-test': 'gw-test' }, t('看路由与脱敏（不调模型）')),
          el('button', { class: 'fa-btn pri', disabled: busy.gwTest, onClick: () => runTest(true), 'data-test': 'gw-test-run' }, busy.gwTest ? t('调用中…') : t('真调一次'))),
        errNote('gwTest'),
        testRes.value ? el('div', null,
          !testRes.value.input.ok ? el('p', { class: 'fa-note err' }, t('输入围栏拦下：{p0}', { p0: testRes.value.input.hits.map((h) => h.word).join('、') })) : el('p', { class: 'fa-note ok' }, t('输入围栏：通过')),
          testRes.value.route.blocked ? el('p', { class: 'fa-note err' }, testRes.value.route.blocked === 'no_internal_model' ? t('客户敏感数据：没有内网模型，会被拦下') : t('没有可用模型')) :
            el('p', { class: 'fa-note info' }, t('路由：{p0}（{p1}）→ {p2}', { p0: testRes.value.route.rule || t('无规则命中，按模型顺序'), p1: testRes.value.route.complexity === 'complex' ? t('复杂问题') : t('简单问题'), p2: testRes.value.route.candidates.map((m) => `${m.label}${m.internal ? t('（内网）') : ''}`).join(' → ') })),
          el('div', { class: 'fa-q', 'data-test': 'gw-masked' }, testRes.value.masked.text),
          Object.keys(testRes.value.masked.counts).length ? el('p', { class: 'fa-empty' }, t('脱敏：{p0}', { p0: Object.entries(testRes.value.masked.counts).map(([k, n]) => `${t({ idcard: '身份证号', bankcard: '银行卡号', phone: '手机号', email: '邮箱', name: '客户名' }[k] || k)} ${n}`).join('、') })) : el('p', { class: 'fa-empty' }, t('这段话发往内网模型或没有敏感信息，不用脱敏')),
          testRes.value.reply ? (testRes.value.reply.error ? el('p', { class: 'fa-note err' }, testRes.value.reply.error) : el('div', null,
            el('div', { class: 'fa-ans', style: 'white-space:normal' }, richText(testRes.value.reply.text)),
            el('p', { class: 'fa-empty' }, `${t('模型')}：${testRes.value.reply.model || t('系统默认')}${testRes.value.reply.fallback ? t('（前一个失败，已自动换模型）') : ''}`),
            (testRes.value.reply.guards || []).length ? el('p', { class: 'fa-note warn' }, t('输出围栏命中：{p0}', { p0: testRes.value.reply.guards.map((g) => g.word).join('、') })) : null)) : null) : null)));

  const vAudit = () => {
    const a = auditRes.value;
    const s = a?.stats;
    return card('gw-3', t('③ 全量审计日志'), !!a?.total,
      t('每次模型调用都记一条：场景、数据级别、命中的路由规则、依次尝试的模型、最终用的模型、脱敏了什么、围栏命中、耗时，以及请求与结果的指纹（原文不落审计）。审计按条串联哈希，删改任何一条都能发现。'),
      s ? el('div', { class: 'fa-grid' },
        [[s.total, '调用总数'], [s.ok, '成功'], [s.fallback, '自动换模型'], [s.blocked, '被拦下'], [s.guarded, '围栏命中'], [s.masked, '脱敏字段数'], [`${s.avgMs} ms`, '平均耗时']].map(([v, l]) => el('div', { class: 'fa-kpi' }, el('b', null, String(v)), el('span', null, t(l))))) : null,
      a ? (a.broken === -1 ? el('p', { class: 'fa-note ok' }, t('审计链校验通过，没有被删改')) : el('p', { class: 'fa-note err' }, t('审计链在第 {p0} 条断开：记录可能被删改', { p0: a.broken + 1 }))) : null,
      el('div', { class: 'fa-row' },
        sel(filter.scene, [['*', '全部场景'], ...(cfg.value?.scenes || []).map((x) => [x.id, x.label])], (v) => { filter.scene = v; loadAudit(); }),
        sel(filter.status, [['', '全部'], ['ok', '成功'], ['fail', '失败'], ['fallback', '换过模型'], ['guard', '围栏 / 拦下']], (v) => { filter.status = v; loadAudit(); }),
        el('button', { class: 'fa-btn', onClick: loadAudit }, t('刷新')),
        el('button', { class: 'fa-btn', disabled: busy.gwExport, onClick: exportCsv, 'data-test': 'gw-export' }, t('导出 CSV'))),
      a && a.items.length ? el('table', { class: 'fa-tbl', 'data-test': 'gw-audit' },
        el('thead', null, el('tr', null, [t('时间'), t('场景'), t('级别'), t('路由'), t('模型'), t('结果'), t('脱敏'), t('围栏'), t('耗时')].map((x) => el('th', null, x)))),
        el('tbody', null, a.items.slice(0, 120).map((r) => el('tr', { key: r.hash || r.at },
          el('td', null, fmtAt(r.at, { sec: true }).slice(5)),
          el('td', null, sceneLabel(r.scene)),
          el('td', null, t({ public: '公开', internal: '内部', sensitive: '客户敏感' }[r.cls] || r.cls || '—')),
          el('td', null, r.rule || '—', r.complexity ? el('div', { class: 'fa-empty' }, r.complexity === 'complex' ? t('复杂') : t('简单')) : null),
          el('td', null, (r.tried || []).length ? (r.tried || []).map((x) => el('div', { class: x.ok ? '' : 'fa-empty' }, `${x.ok ? '✓' : '✗'} ${x.model}`)) : (r.model || '—')),
          el('td', null, r.blocked ? el('span', { class: 'fa-lv high' }, t('拦下')) : r.ok ? el('span', { class: 'fa-lv pass' }, t('成功')) : el('span', { class: 'fa-lv medium' }, t('失败'))),
          el('td', null, Object.entries(r.masked || {}).map(([k, n]) => `${t({ idcard: '身份证', bankcard: '卡号', phone: '手机', email: '邮箱', name: '客户名' }[k] || k)}×${n}`).join(' ') || '—'),
          el('td', null, (r.guards || []).join('、') || '—'),
          el('td', null, r.ms ? `${r.ms} ms` : '—')))))
        : el('p', { class: 'fa-empty' }, t('还没有调用记录：在任一模块用到模型，或在上面「真调一次」')),
      errNote('gwAudit'));
  };

  const vModelDlg = () => {
    const d = mdl.value;
    if (!d) return null;
    const row = (label, input, hint) => el('div', { style: 'margin:8px 0' }, el('div', { class: 'fa-empty', style: 'margin-bottom:3px' }, label), input, hint ? el('div', { class: 'fa-empty', style: 'font-size:12px;margin-top:2px' }, hint) : null);
    const inp = (key, attrs = {}) => el('input', { class: 'fa-in', style: 'width:100%', value: d[key], onInput: (e) => { d[key] = e.target.value; }, ...attrs });
    const prob = mdlProblem();
    const hosts = cfg.value?.hostModels || [];
    return el('div', { class: 'fa-dlg-mask', 'data-test': 'gw-model-dlg', onClick: (e) => { if (e.target === e.currentTarget) mdl.value = null; } },
      el('div', { class: 'fa-dlg', role: 'dialog', 'aria-modal': 'true', style: 'width:540px;max-height:90vh;overflow:auto' },
        el('h3', { style: 'margin:0 0 6px;font-size:16px' }, d.idx < 0 ? t('添加私有模型') : t('配置模型')),
        el('div', { class: 'fa-row' },
          el('label', null, el('input', { type: 'radio', name: 'gw-kind', checked: d.kind === 'host', onChange: () => { d.kind = 'host'; mdlTest.value = null; } }), ' ', t('使用应用里已配置的模型')),
          el('label', { style: d.isDefault ? 'opacity:.5' : '' }, el('input', { type: 'radio', name: 'gw-kind', checked: d.kind === 'direct', disabled: d.isDefault, 'data-test': 'gw-kind-direct', onChange: () => { d.kind = 'direct'; mdlTest.value = null; } }), ' ', t('直连内网私有模型（OpenAI 兼容接口）'))),
        d.isDefault ? el('p', { class: 'fa-empty', style: 'font-size:12px;margin:0' }, t('系统默认模型跟随应用设置；要直连内网模型请用「+ 添加私有模型」')) : null,
        d.kind === 'host'
          ? (d.isDefault ? null : row(t('模型'), el('select', { class: 'fa-in', style: 'width:100%', value: d.value, onChange: (e) => { d.value = e.target.value; } }, el('option', { value: '' }, t('选择模型…')), hosts.map((o) => el('option', { value: o.value, selected: o.value === d.value }, `${o.group ? `${o.group} · ` : ''}${o.label}`)))))
          : [row(t('接口地址'), inp('endpoint', { placeholder: 'http://10.0.0.8:8000/v1', 'data-test': 'gw-direct-endpoint' }), t('填到 /v1 为止，程序会请求 <地址>/chat/completions')),
            row(t('模型名'), inp('model', { placeholder: 'qwen2.5-72b-instruct', 'data-test': 'gw-direct-model' })),
            row(t('API 密钥'), inp('apiKey', { type: 'password', autocomplete: 'new-password', placeholder: d.hasKey ? t('已加密保存，留空不改') : t('可空；系统钥匙串加密保存'), 'data-test': 'gw-direct-key' })),
            row(t('超时（秒）'), inp('timeout', { type: 'number', min: 5, max: 600, style: 'width:120px' }))],
        row(t('显示名称'), inp('label', { placeholder: d.kind === 'direct' ? t('如：行内 Qwen 72B（数据中心）') : t('留空用模型名'), 'data-test': 'gw-model-label' })),
        el('label', { class: 'fa-row', style: 'align-items:flex-start;flex-wrap:nowrap' }, el('input', { type: 'checkbox', style: 'margin-top:4px', checked: d.internal, onChange: (e) => { d.internal = e.target.checked; }, 'data-test': 'gw-model-internal' }), t('内网私有部署（由管理员核实后勾选；客户敏感数据只交给这类模型，发往它的内容不再脱敏）')),
        prob ? el('p', { class: 'fa-note warn', style: 'margin:6px 0' }, prob) : null,
        mdlTest.value ? el('p', { class: `fa-note ${mdlTest.value.ok ? 'ok' : 'err'}`, 'data-test': 'gw-model-test-res' }, mdlTest.value.ok ? t('连接正常 · {p0} 毫秒 · 返回：{p1}', { p0: mdlTest.value.ms, p1: mdlTest.value.text || '（空）' }) : t('连接失败（{p0} 毫秒）：{p1}', { p0: mdlTest.value.ms, p1: mdlTest.value.error })) : null,
        errNote('gwMTest'), errNote('gwSave'),
        el('div', { class: 'fa-row fa-dlg-actions', style: 'margin-top:10px' },
          el('button', { class: 'fa-btn', disabled: !!prob || busy.gwMTest, onClick: testModel, 'data-test': 'gw-model-test' }, busy.gwMTest ? t('测试中…') : t('测试连接')),
          el('button', { class: 'fa-btn', onClick: () => { mdl.value = null; }, 'data-test': 'gw-model-cancel' }, t('取消')),
          el('button', { class: 'fa-btn pri', disabled: !!prob || busy.gwSave, onClick: saveModel, 'data-test': 'gw-model-save' }, t('保存')))));
  };

  return {
    load,
    steps: () => [
      { id: 'gw-1', title: t('① 模型与路由'), done: saved.value || (cfg.value?.rules?.length > 0) },
      { id: 'gw-2', title: t('② 脱敏与安全围栏'), done: !!testRes.value },
      { id: 'gw-3', title: t('③ 全量审计日志'), done: !!auditRes.value?.total },
    ],
    view: () => el('div', { 'data-test': 'fa-gateway' }, vModels(), vGuard(), vAudit(), vModelDlg()),
  };
}
