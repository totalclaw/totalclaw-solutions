/**
 * 资料智能处理（懒加载页签）：① 导入资料 ② 识别与分类 ③ 内容提取与核对 ④ 入库与导出。
 * WPS / 图片 / PDF / 音频 / 视频都能进来：主进程按文件头认格式、取文字（OCR / 本机语音转写）、分类、抽字段并逐字核对。
 */
export default function docsTab(kit) {
  const { vue, el, t, call, busy, errNote, card, readBase64, sdk } = kit;
  const { ref, computed } = vue;

  const meta = ref(null);
  const list = ref([]);
  const cur = ref(null);
  const picked = ref(new Set());
  const level = ref('internal');
  const exported = ref(false);
  let timer = null;
  let off = null;

  const ICON = { document: 'ri-file-text-line', sheet: 'ri-file-excel-2-line', slides: 'ri-slideshow-line', image: 'ri-image-line', audio: 'ri-mic-line', video: 'ri-video-line', unknown: 'ri-file-unknow-line' };
  const STATUS = { queued: ['排队中', ''], processing: ['处理中', 'medium'], done: ['已完成', 'pass'], failed: ['失败', 'high'] };
  const catName = (id) => (meta.value?.categories || []).find((c) => c.id === id)?.name || '—';

  const refresh = async () => {
    list.value = (await call('docsList', 'docs.list')) || list.value;
    if (cur.value) { const c = list.value.find((x) => x.id === cur.value.id); if (c && (c.status !== cur.value.status || c.phase !== cur.value.phase)) await open(c.id); }
    const pending = list.value.some((x) => x.status === 'queued' || x.status === 'processing');
    if (pending && !timer) timer = setInterval(refresh, 2000);
    if (!pending && timer) { clearInterval(timer); timer = null; }
  };
  const load = async () => {
    meta.value = await call('docsMeta', 'docs.meta');
    if (!off && typeof sdk.on === 'function') off = sdk.on('docs.progress', () => refresh());
    await refresh();
  };
  const open = async (id) => { cur.value = await call('docsGet', 'docs.get', { id }); };
  const importFiles = async (files) => {
    const arr = [...(files || [])];
    if (!arr.length) return;
    const payload = [];
    for (const f of arr) payload.push({ fileName: f.name, base64: await readBase64(f) });
    const r = await call('docsImport', 'docs.import', { files: payload, level: level.value });
    if (r) { await refresh(); if (r[0]) await open(r[0].id); }
  };
  const demo = async () => {
    const r = await call('docsDemo', 'docs.demo');
    if (r) { for (const d of r) call('docsProc', 'docs.process', { id: d.id }).then(refresh); await refresh(); }
  };
  const processDoc = async (id) => { await call('docsProc', 'docs.process', { id }); await refresh(); await open(id); };
  const setCat = async (id, category) => { const r = await call('docsCat', 'docs.setCategory', { id, category }); if (r) { await refresh(); await open(id); } };
  const setField = async (field, value) => { const r = await call('docsField', 'docs.setField', { id: cur.value.id, field, value }); if (r) await open(cur.value.id); };
  const toKb = async () => { const r = await call('docsKb', 'docs.toKb', { ids: [...picked.value] }); if (r) { sdk.notify.success(t('已入金融知识库 {p0} 份，制度问答和智能体检索都能用到', { p0: r.added })); await refresh(); } };
  const exportCsv = async () => { const r = await call('docsExport', 'docs.export'); if (r?.ok) { exported.value = true; sdk.notify.success(t('已导出资料台账：{p0}', { p0: r.path })); } };
  const togglePick = (id) => { const s = new Set(picked.value); if (s.has(id)) s.delete(id); else s.add(id); picked.value = s; };

  const done = computed(() => list.value.filter((x) => x.status === 'done'));
  const stats = computed(() => {
    const by = {};
    for (const d of list.value) by[d.group] = (by[d.group] || 0) + 1;
    return by;
  });

  const vImport = () => card('dc-1', t('① 导入资料'), list.value.length > 0,
    t('WPS（.wps/.et/.dps，含老格式）、Word、PDF、Excel、PPT、图片、音频、视频都能拖进来，一次最多 50 个。按文件内容认格式，不看后缀；图片走本机文字识别，音频 / 视频先取声音再用本机语音模型转写，资料不出本机。'),
    el('div', { class: 'fa-row' },
      el('span', null, t('数据级别')),
      el('select', { class: 'fa-in', value: level.value, onChange: (e) => { level.value = e.target.value; } },
        [['public', '公开'], ['internal', '内部'], ['sensitive', '客户敏感（只交内网模型）']].map(([v, l]) => el('option', { value: v, selected: v === level.value }, t(l)))),
      el('label', { class: 'fa-btn pri' }, el('i', { class: 'ri-upload-2-line' }), ' ', t('选择资料…'),
        el('input', { type: 'file', multiple: true, hidden: true, 'data-test': 'docs-file', onChange: (e) => { importFiles(e.target.files); e.target.value = ''; } })),
      el('button', { class: 'fa-btn', disabled: busy.docsDemo, onClick: demo, 'data-test': 'docs-demo' }, t('载入 6 份示例资料（WPS / PDF / 图片 / 录音 / 视频 / 流水）'))),
    el('div', {
      class: 'fa-kbform', style: 'text-align:center;padding:22px;cursor:copy',
      onDragover: (e) => e.preventDefault(),
      onDrop: (e) => { e.preventDefault(); importFiles(e.dataTransfer?.files); },
    }, el('i', { class: 'ri-drag-drop-line', style: 'font-size:22px' }), el('div', { class: 'fa-empty' }, t('把文件拖到这里'))),
    meta.value ? el('div', { class: 'fa-row' },
      [['ocr', '图片文字识别'], ['asr', '本机语音转写'], ['ffmpeg', '音视频解码']].map(([k, l]) => el('span', { class: `fa-src${meta.value.capabilities[k] ? ' pc' : ''}` }, `${meta.value.capabilities[k] ? '✓' : '✗'} ${t(l)}`)),
      !meta.value.capabilities.asr ? el('span', { class: 'fa-empty' }, t('（音频 / 视频需要升级应用或下载本地语音模型）')) : null) : null,
    errNote('docsImport'), errNote('docsDemo'));

  const vList = () => card('dc-2', t('② 识别与分类'), done.value.length > 0,
    t('先按关键词定类目（零成本、能解释为什么），拿不准再交模型在固定类目里选；分错了可以直接改，改了会按新类目重新抽字段。'),
    Object.keys(stats.value).length ? el('div', { class: 'fa-grid' }, Object.entries(stats.value).map(([g, n]) => el('div', { class: 'fa-kpi' }, el('b', null, String(n)), el('span', null, el('i', { class: ICON[g] }), ' ', t(meta.value?.groups?.[g] || g))))) : null,
    list.value.length ? el('table', { class: 'fa-tbl', 'data-test': 'docs-table' },
      el('thead', null, el('tr', null, ['', t('资料'), t('格式'), t('类目'), t('状态'), ''].map((x) => el('th', null, x)))),
      el('tbody', null, list.value.map((d) => el('tr', { key: d.id, style: cur.value?.id === d.id ? 'background:#f3f6fb' : '' },
        el('td', null, el('input', { type: 'checkbox', checked: picked.value.has(d.id), disabled: d.status !== 'done', onChange: () => togglePick(d.id) })),
        el('td', null, el('button', { class: 'fa-link', onClick: () => open(d.id) }, el('i', { class: ICON[d.group] || ICON.unknown }), ' ', d.name), d.inKb ? el('span', { class: 'fa-src pc', style: 'margin-left:6px' }, t('已入库')) : null),
        el('td', null, t(d.formatLabel || '')),
        el('td', null, d.status === 'done' ? el('select', { class: 'fa-in', value: d.category, onChange: (e) => setCat(d.id, e.target.value) }, (meta.value?.categories || []).map((c) => el('option', { value: c.id, selected: c.id === d.category }, t(c.name)))) : '—',
          d.categoryBy ? el('div', { class: 'fa-empty' }, t({ rule: '关键词判定', model: '模型判定', manual: '人工改过' }[d.categoryBy])) : null),
        el('td', null, el('span', { class: `fa-lv ${STATUS[d.status]?.[1] || ''}`, style: STATUS[d.status]?.[1] ? '' : 'background:#94a3b8' }, t(STATUS[d.status]?.[0] || d.status)), d.phase ? el('div', { class: 'fa-empty' }, t(d.phase)) : null, d.error ? el('div', { class: 'fa-note err', style: 'margin:4px 0 0' }, d.error) : null),
        el('td', null, d.status === 'failed' || d.status === 'queued' ? el('button', { class: 'fa-btn sm', onClick: () => processDoc(d.id) }, d.status === 'failed' ? t('重试') : t('开始处理')) : null)))))
      : el('p', { class: 'fa-empty' }, t('还没有资料')),
    errNote('docsCat'), errNote('docsProc'));

  const vFields = () => {
    const d = cur.value;
    return card('dc-3', t('③ 内容提取与核对'), !!d?.fields?.length,
      t('按类目抽关键字段，每个字段都带原文摘录，程序逐字核对摘录在原文里能不能找到：找不到的标「未核实」，人工改过的记一笔审计。'),
      !d ? el('p', { class: 'fa-empty' }, t('在上面点一份资料查看')) : el('div', { class: 'fa-cols' },
        el('div', null,
          el('h4', { style: 'margin:0 0 6px' }, d.name, ' · ', t(catName(d.category))),
          d.categoryReason ? el('p', { class: 'fa-empty' }, t('分类依据：{p0}', { p0: d.categoryReason })) : null,
          (d.fields || []).length ? el('table', { class: 'fa-tbl', 'data-test': 'docs-fields' },
            el('thead', null, el('tr', null, [t('字段'), t('值'), t('核对')].map((x) => el('th', null, x)))),
            el('tbody', null, d.fields.map((f) => el('tr', { key: f.field },
              el('td', null, t(f.field)),
              el('td', null, el('input', { class: 'fa-in', style: 'width:100%', value: f.value, placeholder: t('原文没有'), onChange: (e) => setField(f.field, e.target.value) }), f.quote ? el('div', { class: 'fa-empty' }, `「${f.quote}」`) : null),
              el('td', null, f.missing ? el('span', { class: 'fa-empty' }, t('原文没有')) : f.manual ? el('span', { class: 'fa-src pc' }, t('人工确认')) : f.verified ? el('span', { class: 'fa-lv pass' }, t('已核实')) : el('span', { class: 'fa-lv medium' }, t('未核实')))))))
            : el('p', { class: 'fa-empty' }, d.status === 'done' ? t('这一类没有要抽的字段') : t('处理完成后显示')),
          d.facts ? el('p', { class: 'fa-empty' }, [d.facts.dates?.length ? t('日期：{p0}', { p0: d.facts.dates.join('、') }) : '', d.facts.amounts?.length ? t('金额：{p0}', { p0: d.facts.amounts.join('、') }) : ''].filter(Boolean).join('　')) : null),
        el('div', null,
          el('b', null, d.group === 'audio' || d.group === 'video' ? t('转写文字') : d.group === 'image' ? t('识别出的文字') : t('正文')),
          el('div', { class: 'fa-q', style: 'max-height:420px;overflow:auto', 'data-test': 'docs-text' }, d.text || t('（还没有取到文字）')))),
      errNote('docsField'));
  };

  const vOut = () => card('dc-4', t('④ 入库与导出'), done.value.some((d) => d.inKb) || exported.value,
    t('勾选处理好的资料放进金融知识库（制度问答、智能体都能检索到），或导出资料台账（每个字段一列，未核实的会注明）。'),
    el('div', { class: 'fa-row' },
      el('button', { class: 'fa-btn', onClick: () => { picked.value = new Set(done.value.map((d) => d.id)); } }, t('全选已完成的')),
      el('button', { class: 'fa-btn pri', disabled: !picked.value.size || busy.docsKb, onClick: toKb, 'data-test': 'docs-tokb' }, t('入金融知识库（{p0} 份）', { p0: picked.value.size })),
      el('button', { class: 'fa-btn', disabled: !list.value.length || busy.docsExport, onClick: exportCsv, 'data-test': 'docs-export' }, t('导出资料台账'))),
    errNote('docsKb'), errNote('docsExport'));

  return {
    load,
    steps: () => [
      { id: 'dc-1', title: t('① 导入资料'), done: list.value.length > 0 },
      { id: 'dc-2', title: t('② 识别与分类'), done: done.value.length > 0 },
      { id: 'dc-3', title: t('③ 内容提取与核对'), done: !!cur.value?.fields?.length },
      { id: 'dc-4', title: t('④ 入库与导出'), done: done.value.some((d) => d.inKb) || exported.value },
    ],
    view: () => el('div', { 'data-test': 'fa-docs' }, vImport(), vList(), vFields(), vOut()),
  };
}
