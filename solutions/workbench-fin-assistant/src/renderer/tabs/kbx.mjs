/**
 * 智能检索扩展（懒加载，挂在「金融知识库」页签下面）：④ 常见问题直答 —— 已确认的问答亚秒直答，不检索、不调模型。
 * 复杂问题的多步检索在制度问答里自动进行（问答结果里能看到拆出来的子问题）。
 */
export default function kbxTab(kit) {
  const { vue, el, t, call, busy, errNote, card, sdk, confirm } = kit;
  const { ref, reactive } = vue;

  const faqs = ref([]);
  const form = reactive({ id: '', q: '', alts: '', answer: '' });
  const test = ref('');
  const testRes = ref(null);

  const load = async () => { faqs.value = (await call('kxList', 'kb.faq.list')) || []; };
  const save = async () => {
    const r = await call('kxSave', 'kb.faq.save', { id: form.id || undefined, q: form.q, alts: form.alts.split(/[\n、]/).map((x) => x.trim()).filter(Boolean), answer: form.answer });
    if (r) { Object.assign(form, { id: '', q: '', alts: '', answer: '' }); sdk.notify.success(t('已保存到常见问题')); await load(); }
  };
  const edit = (f) => Object.assign(form, { id: f.id, q: f.q, alts: (f.alts || []).join('\n'), answer: f.answer });
  const remove = async (f) => {
    if (!(await confirm({ text: t('确定删除常见问题「{p0}」？删除后这类问法不再直答', { p0: f.q }), ok: t('删除') }))) return;
    await call('kxSave', 'kb.faq.remove', { id: f.id });
    if (form.id === f.id) Object.assign(form, { id: '', q: '', alts: '', answer: '' });
    await load();
  };
  const tryAsk = async () => { if (!test.value.trim()) return; const t0 = performance.now(); const r = await call('kxTest', 'qa.ask', { q: test.value }); if (r) testRes.value = { ...r, uiMs: Math.round(performance.now() - t0) }; await load(); };
  const SRC = { curated: '人工维护', liked: '点赞自动收录', promoted: '从问答设置' };

  return {
    load,
    steps: () => [{ id: 'kb-4', title: t('④ 常见问题直答'), done: faqs.value.length > 0 }],
    view: () => card('kb-4', t('④ 常见问题直答（简单问题亚秒回答）'), faqs.value.length > 0,
      t('员工问到和这里已确认的问题足够像的说法，直接给已确认的答案：不检索、不调模型，通常不到 1 秒。答案引用的制度换了版本或下线，这条会自动停止直答，转回正常问答。问答里点赞的回答自动收录进来，点踩的自动撤下。复杂问题（多个子问、对比、汇总）在制度问答里会自动拆成子问题分别检索。'),
      el('div', { class: 'fa-cols' },
        el('div', null,
          el('b', null, form.id ? t('编辑常见问题') : t('新增常见问题')),
          el('input', { class: 'fa-in', style: 'width:100%;margin:6px 0', placeholder: t('标准问法'), value: form.q, onInput: (e) => { form.q = e.target.value; }, 'data-test': 'kx-q' }),
          el('textarea', { class: 'fa-in', style: 'width:100%;min-height:50px', placeholder: t('其它问法（每行一个，可空）'), value: form.alts, onInput: (e) => { form.alts = e.target.value; } }),
          el('textarea', { class: 'fa-in fa-ta', placeholder: t('已确认的答案'), value: form.answer, onInput: (e) => { form.answer = e.target.value; }, 'data-test': 'kx-a' }),
          el('div', { class: 'fa-row' }, el('button', { class: 'fa-btn pri', disabled: busy.kxSave, onClick: save, 'data-test': 'kx-save' }, t('保存')), form.id ? el('button', { class: 'fa-btn', onClick: () => Object.assign(form, { id: '', q: '', alts: '', answer: '' }) }, t('取消编辑')) : null),
          el('div', { style: 'margin-top:12px' }, el('b', null, t('试一下')),
            el('div', { class: 'fa-row' }, el('input', { class: 'fa-in', style: 'flex:1', placeholder: t('换个说法问，看能不能直答'), value: test.value, onInput: (e) => { test.value = e.target.value; }, onKeydown: (e) => { if (e.key === 'Enter') tryAsk(); }, 'data-test': 'kx-test' }), el('button', { class: 'fa-btn', disabled: busy.kxTest, onClick: tryAsk }, t('问'))),
            testRes.value ? (testRes.value.fast
              ? el('div', { class: 'fa-note ok', 'data-test': 'kx-fast' }, el('b', null, t('常见问题直答 · 相似度 {p0} · {p1} 毫秒（含界面往返 {p2} 毫秒）', { p0: testRes.value.fast.score, p1: testRes.value.fast.ms, p2: testRes.value.uiMs })), el('div', { class: 'fa-ans' }, testRes.value.answer))
              : el('div', { class: 'fa-note info' }, testRes.value.status === 'answered' ? t('没有命中常见问题，走了正常问答（{p0} 毫秒）：{p1}', { p0: testRes.value.uiMs, p1: testRes.value.answer.slice(0, 120) }) : t('没有命中常见问题：{p0}', { p0: testRes.value.reason }))) : null)),
        el('div', null,
          faqs.value.length ? el('table', { class: 'fa-tbl', 'data-test': 'kx-table' }, el('thead', null, el('tr', null, [t('问题'), t('来源'), t('直答次数'), ''].map((x) => el('th', null, x)))),
            el('tbody', null, faqs.value.map((f) => el('tr', { key: f.id, style: f.disabled || !f.fresh ? 'opacity:.55' : '' },
              el('td', null, el('b', null, f.q), (f.alts || []).length ? el('div', { class: 'fa-empty' }, t('另有 {p0} 种问法', { p0: f.alts.length })) : null, !f.fresh ? el('div', { class: 'fa-note warn', style: 'margin:4px 0 0' }, t('引用的制度已换版 / 下线，暂停直答')) : null, f.disabled ? el('div', { class: 'fa-empty' }, t('已停用：{p0}', { p0: f.disabledReason || '' })) : null),
              el('td', null, t(SRC[f.source] || f.source)),
              el('td', null, String(f.hits || 0)),
              el('td', null, el('button', { class: 'fa-link', onClick: () => edit(f), 'data-test': `kx-edit-${f.id}` }, t('编辑')), ' ', el('button', { class: 'fa-link', onClick: () => remove(f), 'data-test': `kx-del-${f.id}` }, t('删除')))))))
            : el('p', { class: 'fa-empty' }, t('还没有常见问题：在制度问答里给好的回答点赞，或在左边手动添加')))),
      errNote('kxSave'), errNote('kxTest'), errNote('kxList')),
  };
}
