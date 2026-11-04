/**
 * 智能问数扩展（懒加载，挂在「智能问数」页签下面）：④ 数据源（表格 / 数据库 / HTTP / 抓包零侵入）⑤ 报表、API 与定时任务。
 * 「对话」取数在页签上面的 ① ~ ③；这里是另外三种取数形态与多数据源。
 */
export default function askxTab(kit) {
  const { vue, el, t, call, busy, errNote, card, readBase64, sdk, fmtVal, fmtAt } = kit;
  const { ref, reactive } = vue;

  const src = ref({ sources: [], fields: {}, active: '' });
  const form = reactive({ kind: 'har', name: '', dataSource: '', sql: 'SELECT * FROM retail_deposit_daily', url: '', path: 'data', token: '', entry: 0, harFile: '', file: '' });
  const har = ref(null);
  const preview = ref(null);
  const mapping = reactive({});
  const reports = ref([]);
  const asks = ref([]);
  const repOut = ref(null);
  const repName = ref('');
  const webhook = ref('');

  const load = async () => {
    src.value = (await call('axSrc', 'ask.src.list')) || src.value;
    reports.value = (await call('axRep', 'ask.report.list')) || [];
    asks.value = ((await call('askList', 'ask.list')) || []).filter((a) => a.status === 'answered').slice(0, 20);
  };
  const setMapping = (m) => { for (const k of Object.keys(mapping)) delete mapping[k]; Object.assign(mapping, m || {}); };
  const parseHar = async (f) => {
    if (!f) return;
    har.value = await call('axHar', 'ask.har.parse', { fileName: f.name, base64: await readBase64(f) });
    if (har.value) { form.harFile = har.value.harFile; form.name = form.name || f.name.replace(/\.har$/i, ''); }
  };
  const pickHar = async (entry, path) => {
    form.entry = entry; form.path = path;
    preview.value = await call('axPrev', 'ask.src.preview', { kind: 'har', harFile: form.harFile, entry, path });
    if (preview.value) setMapping(preview.value.mapping);
  };
  const previewOther = async (f) => {
    const payload = { kind: form.kind, dataSource: form.dataSource, sql: form.sql, url: form.url, path: form.path, ...(f ? { fileName: f.name, base64: await readBase64(f) } : {}) };
    preview.value = await call('axPrev', 'ask.src.preview', payload);
    if (preview.value) { setMapping(preview.value.mapping); if (preview.value.file) form.file = preview.value.file; if (!form.name) form.name = preview.value.name || ''; }
  };
  const saveSource = async () => {
    const r = await call('axSave', 'ask.src.save', { kind: form.kind, name: form.name, mapping: { ...mapping }, file: form.kind === 'har' ? form.harFile : form.file, entry: form.entry, path: form.path, dataSource: form.dataSource, sql: form.sql, url: form.url, ...(form.token ? { token: form.token } : {}) });
    if (r) { const n = await call('axLoad', 'ask.src.load', { id: r.id }); if (n) sdk.notify.success(t('已接入「{p0}」并载入 {p1} 行，可以直接问数了', { p0: r.name, p1: n })); preview.value = null; har.value = null; await load(); }
  };
  const loadSrc = async (id) => { const n = await call('axLoad', 'ask.src.load', { id }); if (n) { sdk.notify.success(t('已载入 {p0} 行', { p0: n })); await load(); } };
  const removeSrc = async (id) => { await call('axSave', 'ask.src.remove', { id }); await load(); };
  const saveReport = async (askId) => { const r = await call('axRepSave', 'ask.report.save', { askId, name: repName.value }); if (r) { repName.value = ''; await load(); await runReport(r.id); } };
  const runReport = async (id) => { repOut.value = await call('axRun', 'ask.report.run', { id }); await load(); };
  const update = async (id, patch) => { await call('axUpd', 'ask.report.update', { id, ...patch }); await load(); };
  const exportRep = async (id) => { const r = await call('axExp', 'ask.report.export', { id }); if (r?.ok) sdk.notify.success(t('已导出：{p0}', { p0: r.path })); };
  const pushRep = async (id) => { if (await call('axPush', 'ask.report.push', { id })) sdk.notify.success(t('已推送到群')); };
  const saveHook = async () => { if (await call('axHook', 'ask.webhook.save', { webhook: webhook.value })) { webhook.value = ''; sdk.notify.success(t('群机器人已保存（加密）')); } };

  const KINDS = [['har', '浏览器抓包（零侵入）'], ['file', '表格文件'], ['db', '数据库（只读 SQL）'], ['http', 'HTTP 接口']];
  const fields = () => src.value.fields || {};

  const vMapping = () => preview.value ? el('div', { class: 'fa-kbform' },
    el('p', { class: 'fa-sub' }, t('共 {p0} 行。把口径库要求的字段对到源数据的列上（已自动对上同名 / 常见别名）：', { p0: preview.value.rows })),
    el('table', { class: 'fa-tbl' }, el('tbody', null, Object.entries(fields()).map(([f, label]) => el('tr', { key: f },
      el('td', null, el('b', null, t(label))), el('td', null, el('code', null, f)),
      el('td', null, el('select', { class: 'fa-in', value: mapping[f] || '', onChange: (e) => { mapping[f] = e.target.value; } }, el('option', { value: '' }, t('（未对上）')), preview.value.keys.map((k) => el('option', { value: k, selected: mapping[f] === k }, k)))),
      el('td', null, mapping[f] ? el('span', { class: 'fa-empty' }, String(preview.value.sample?.[0]?.[mapping[f]] ?? '')) : el('span', { class: 'fa-lv medium' }, t('缺'))))))),
    el('div', { class: 'fa-row' }, el('input', { class: 'fa-in', placeholder: t('数据源名称'), value: form.name, onInput: (e) => { form.name = e.target.value; } }),
      el('button', { class: 'fa-btn pri', disabled: busy.axSave || Object.keys(fields()).some((f) => !mapping[f]), onClick: saveSource, 'data-test': 'ax-save' }, t('保存并载入')))) : null;

  const vSources = () => card('ask-4', t('④ 多数据源接入'), (src.value.sources || []).length > 0,
    t('不用改业务系统：在浏览器里打开那张报表页，开发者工具 → 网络 → 右键「另存为 HAR」，导进来就能把它调用的接口变成数据源（零侵入接口捕获）。也可以接表格、App 里配好的数据库（只读 SQL）或 HTTP 接口。指标怎么算始终由口径库决定。'),
    (src.value.sources || []).length ? el('table', { class: 'fa-tbl' }, el('thead', null, el('tr', null, [t('数据源'), t('类型'), '', ''].map((x) => el('th', null, x)))),
      el('tbody', null, src.value.sources.map((x) => el('tr', { key: x.id }, el('td', null, el('b', null, x.name), src.value.active === x.id ? el('span', { class: 'fa-src pc', style: 'margin-left:6px' }, t('当前在用')) : null),
        el('td', null, t(KINDS.find((k) => k[0] === x.kind)?.[1] || x.kind)),
        el('td', null, el('button', { class: 'fa-btn sm', onClick: () => loadSrc(x.id) }, src.value.active === x.id ? t('刷新数据') : t('切换到它'))),
        el('td', null, el('button', { class: 'fa-link', onClick: () => removeSrc(x.id) }, t('删除'))))))) : null,
    el('div', { class: 'fa-row' }, el('span', null, t('新增数据源')), KINDS.map(([k, l]) => el('button', { class: `fa-btn sm${form.kind === k ? ' pri' : ''}`, onClick: () => { form.kind = k; preview.value = null; har.value = null; } }, t(l)))),
    form.kind === 'har' ? el('div', null,
      el('label', { class: 'fa-btn' }, t('导入 HAR 抓包文件'), el('input', { type: 'file', accept: '.har,.json', hidden: true, 'data-test': 'ax-har', onChange: (e) => { parseHar(e.target.files?.[0]); e.target.value = ''; } })),
      har.value ? el('table', { class: 'fa-tbl', style: 'margin-top:8px' }, el('thead', null, el('tr', null, [t('接口'), t('列表位置'), t('行数'), t('字段'), ''].map((x) => el('th', null, x)))),
        el('tbody', null, har.value.entries.flatMap((e) => e.candidates.map((c) => el('tr', { key: `${e.index}-${c.path}` },
          el('td', null, el('code', null, `${e.method} ${e.url}`)), el('td', null, c.path || t('（根）')), el('td', null, String(c.rows)), el('td', null, el('span', { class: 'fa-empty' }, c.keys.slice(0, 8).join('、'))),
          el('td', null, el('button', { class: 'fa-btn sm', onClick: () => pickHar(e.index, c.path) }, t('用这个')))))))) : null)
      : el('div', null,
        form.kind === 'file' ? el('label', { class: 'fa-btn' }, t('选择表格文件'), el('input', { type: 'file', accept: '.csv,.xlsx,.xls', hidden: true, onChange: (e) => { previewOther(e.target.files?.[0]); e.target.value = ''; } })) : null,
        form.kind === 'db' ? el('div', null, el('div', { class: 'fa-row' }, el('span', null, t('数据源名')), el('input', { class: 'fa-in', value: form.dataSource, placeholder: t('App「数据源」里配好的名字'), onInput: (e) => { form.dataSource = e.target.value; } })), el('textarea', { class: 'fa-in fa-ta', style: 'min-height:60px;font-family:ui-monospace,Menlo,monospace', value: form.sql, onInput: (e) => { form.sql = e.target.value; } }), el('button', { class: 'fa-btn', onClick: () => previewOther() }, t('预览'))) : null,
        form.kind === 'http' ? el('div', null, el('div', { class: 'fa-row' }, el('input', { class: 'fa-in', style: 'flex:1', placeholder: 'https://bi.example.com/api/deposit', value: form.url, onInput: (e) => { form.url = e.target.value; } }), el('input', { class: 'fa-in', placeholder: t('列表路径，如 data.list'), value: form.path, onInput: (e) => { form.path = e.target.value; } }), el('input', { class: 'fa-in', type: 'password', placeholder: t('令牌（可空，加密保存）'), value: form.token, onInput: (e) => { form.token = e.target.value; } })), el('button', { class: 'fa-btn', onClick: () => previewOther() }, t('预览'))) : null),
    vMapping(),
    errNote('axHar'), errNote('axPrev'), errNote('axSave'), errNote('axLoad'));

  const vReports = () => card('ask-5', t('⑤ 报表、API 与定时任务'), reports.value.length > 0,
    t('把一次问数的口径存成报表：之后按口径直接重算，不再调模型；可以导出表格、经本机 API 被其它系统取数（GET /v1/reports/<id>，密钥在「智能体编排 → 发布」里生成），也可以每天定时重算并推送到群。'),
    asks.value.length ? el('div', { class: 'fa-row' },
      el('select', { class: 'fa-in', id: 'ax-ask', style: 'max-width:420px' }, asks.value.map((a) => el('option', { value: a.id }, `${a.q} → ${a.metricName}`))),
      el('input', { class: 'fa-in', placeholder: t('报表名称'), value: repName.value, onInput: (e) => { repName.value = e.target.value; } }),
      el('button', { class: 'fa-btn pri', disabled: busy.axRepSave, onClick: () => saveReport(document.getElementById('ax-ask')?.value), 'data-test': 'ax-report-save' }, t('存成报表'))) : el('p', { class: 'fa-empty' }, t('先在上面问一次数，答出来的问题才能存成报表')),
    reports.value.length ? el('table', { class: 'fa-tbl' }, el('thead', null, el('tr', null, [t('报表'), t('定时'), t('上次结果'), ''].map((x) => el('th', null, x)))),
      el('tbody', null, reports.value.map((r) => el('tr', { key: r.id },
        el('td', null, el('b', null, r.name), el('div', { class: 'fa-empty' }, r.q), el('code', { style: 'font-size:11px' }, `/v1/reports/${r.id}`)),
        el('td', null, el('input', { class: 'fa-in', type: 'time', style: 'width:110px', value: r.schedule, onChange: (e) => update(r.id, { schedule: e.target.value }) }),
          el('label', { class: 'fa-row' }, el('input', { type: 'checkbox', checked: r.refresh, onChange: (e) => update(r.id, { refresh: e.target.checked }) }), t('先刷新数据源')),
          el('label', { class: 'fa-row' }, el('input', { type: 'checkbox', checked: r.push, onChange: (e) => update(r.id, { push: e.target.checked }) }), t('推送到群'))),
        el('td', null, r.lastRun ? el('div', null, el('span', { class: 'fa-empty' }, `${fmtAt(r.lastRun.at).slice(5)} · ${t({ manual: '手动', schedule: '定时', api: 'API', export: '导出', push: '推送' }[r.lastRun.source] || r.lastRun.source)}`), el('div', null, r.lastRun.groups ? t('{p0} 组', { p0: r.lastRun.groups.length }) : fmtVal(r.lastRun.value, r.unit))) : '—'),
        el('td', null, el('div', { class: 'fa-row' }, el('button', { class: 'fa-btn sm', onClick: () => runReport(r.id) }, t('重算')), el('button', { class: 'fa-btn sm', onClick: () => exportRep(r.id) }, t('导出')), el('button', { class: 'fa-btn sm', onClick: () => pushRep(r.id) }, t('推送')), el('button', { class: 'fa-link', onClick: () => call('axUpd', 'ask.report.remove', { id: r.id }).then(load) }, t('删除')))))))) : null,
    repOut.value ? el('div', { class: 'fa-kbform', 'data-test': 'ax-report-out' },
      el('b', null, repOut.value.report.name), el('span', { class: 'fa-empty' }, ` · ${repOut.value.metric.name}（${repOut.value.out.period.from || '—'} 至 ${repOut.value.out.period.to || '—'}）· ${t('未调用模型')}`),
      repOut.value.out.groups ? el('table', { class: 'fa-tbl' }, el('tbody', null, repOut.value.out.groups.map((g) => el('tr', { key: g.key }, el('td', null, g.key), el('td', null, fmtVal(g.value, repOut.value.metric.unit)))))) : el('p', null, fmtVal(repOut.value.out.value, repOut.value.metric.unit)),
      el('details', null, el('summary', null, t('取数 SQL（只读）')), el('div', { class: 'fa-code' }, repOut.value.sql || ''))) : null,
    el('div', { class: 'fa-row' }, el('span', { class: 'fa-empty' }, t('群机器人')), el('input', { class: 'fa-in', type: 'password', style: 'flex:1', placeholder: t('企业微信 / 钉钉 / 飞书机器人地址（加密保存）'), value: webhook.value, onInput: (e) => { webhook.value = e.target.value; } }), el('button', { class: 'fa-btn sm', onClick: saveHook }, t('保存'))),
    errNote('axRepSave'), errNote('axRun'), errNote('axExp'), errNote('axPush'), errNote('axHook'));

  return {
    load,
    steps: () => [
      { id: 'ask-4', title: t('④ 多数据源'), done: (src.value.sources || []).length > 0 },
      { id: 'ask-5', title: t('⑤ 报表 / API / 任务'), done: reports.value.length > 0 },
    ],
    view: () => el('div', { 'data-test': 'fa-askx' }, vSources(), vReports()),
  };
}
