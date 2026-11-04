/**
 * AI 项目管理（懒加载页签）：① 项目与接入 ② 进度跟踪 ③ 日报周报 ④ 需求管理 AI 化。
 * 日报周报的数字由程序从 git 提交、任务系统、会议纪要汇总，模型只负责写成文字（数字对不上会被打回重写）。
 */
export default function pmTab(kit) {
  const { vue, el, t, call, busy, err, errNote, card, readBase64, sdk, fmtAt, richText, navigate } = kit;
  const { ref, reactive } = vue;

  const projects = ref([]);
  const pid = ref('');
  const pg = ref(null);
  const reports = ref([]);
  const form = reactive({ id: '', name: '', method: 'agile', stage: '立项', stageDue: '', startDate: '', endDate: '', members: '', git: '', toolKind: 'csv', baseUrl: '', project: '', email: '', team: '', query: '', token: '', webhook: '', daily: '', weekly: '', push: false, mail: false, mailTo: '' });
  const minutesText = ref('');
  const syncRes = ref(null);
  const req = reactive({ text: '', method: 'agile', doc: '', lint: [], review: null, breakdown: null });
  const STAGE_COLORS = ['#1f2937', '#b91c1c', '#1d6fa8', '#15803d', '#ea7a24', '#7c3aed', '#0f766e'];
  const TOOLS = [['csv', '导入导出表格（任意系统）'], ['jira', 'Jira'], ['tapd', 'TAPD'], ['zentao', '禅道'], ['ones', 'ONES']];
  const STAGES = ['立项', '需求', '设计', '开发', '测试', '投产', '运维'];

  const fillForm = (x) => {
    Object.assign(form, { id: x?.id || '', name: x?.name || '', method: x?.method || 'agile', stage: x?.stage || '立项', stageDue: x?.stageDue || '', startDate: x?.startDate || '', endDate: x?.endDate || '', members: (x?.members || []).join('、'), git: (x?.git || []).join('\n'), toolKind: x?.tool?.kind || 'csv', baseUrl: x?.tool?.baseUrl || '', project: x?.tool?.project || '', email: x?.tool?.email || '', team: x?.tool?.team || '', query: x?.tool?.query || '', token: '', webhook: '', daily: x?.schedule?.daily || '', weekly: x?.schedule?.weekly || '', push: !!x?.schedule?.push, mail: !!x?.schedule?.mail, mailTo: (x?.mailTo || []).join(', ') });
  };
  const loadProject = async (id) => {
    pid.value = id;
    pg.value = id ? await call('pmPg', 'pm.progress', { id }) : null;
    reports.value = id ? (await call('pmRep', 'pm.reports', { id })) || [] : [];
    fillForm(pg.value?.project);
  };
  const load = async () => {
    projects.value = (await call('pmList', 'pm.list')) || [];
    if (!pid.value || !projects.value.some((p) => p.id === pid.value)) await loadProject(projects.value[0]?.id || '');
    else await loadProject(pid.value);
  };
  const split = (s, re = /[、,，\s]+/) => String(s || '').split(re).map((x) => x.trim()).filter(Boolean);
  const saveProject = async () => {
    const r = await call('pmSave', 'pm.save', {
      id: form.id || undefined, name: form.name, method: form.method, stage: form.stage, stageDue: form.stageDue, startDate: form.startDate, endDate: form.endDate,
      members: split(form.members), git: split(form.git, /\n+/),
      tool: { kind: form.toolKind, baseUrl: form.baseUrl, project: form.project, email: form.email, team: form.team, query: form.query, ...(form.token ? { token: form.token } : {}) },
      ...(form.webhook ? { webhook: form.webhook } : {}),
      schedule: { daily: form.daily, weekly: form.weekly, push: form.push, mail: form.mail },
      mailTo: form.mailTo,
    });
    if (r) { sdk.notify.success(t('项目已保存')); projects.value = (await call('pmList', 'pm.list')) || []; await loadProject(r.id); }
  };
  const newProject = () => { pid.value = ''; pg.value = null; reports.value = []; fillForm(null); };
  const demo = async () => { const r = await call('pmDemo', 'pm.demo'); if (r) { projects.value = (await call('pmList', 'pm.list')) || []; await loadProject(r.id); } };
  const sync = async () => { syncRes.value = await call('pmSync', 'pm.sync', { id: pid.value }); await loadProject(pid.value); };
  const importTasks = async (f) => { if (!f) return; const r = await call('pmImp', 'pm.importTasks', { id: pid.value, fileName: f.name, base64: await readBase64(f) }); if (r) { sdk.notify.success(t('已导入 {p0} 项任务', { p0: r.tasks })); await loadProject(pid.value); } };
  const addMinutes = async () => { const r = await call('pmMin', 'pm.addMinutes', { id: pid.value, text: minutesText.value }); if (r) { minutesText.value = ''; sdk.notify.success(t('纪要已加入：决议 {p0} 条，待办 {p1} 条', { p0: r.items.decisions.length, p1: r.items.todos.length })); await loadProject(pid.value); } };
  const report = async (kind) => { const r = await call('pmReport', 'pm.report', { id: pid.value, kind }); if (r) reports.value = [r, ...reports.value]; };
  const push = async (r) => { const ok = await call('pmPush', 'pm.push', { id: pid.value, reportId: r.id }); if (ok) { sdk.notify.success(t('已推送到群')); reports.value = (await call('pmRep', 'pm.reports', { id: pid.value })) || []; } };
  // 报告发邮件：结果记在报告上；SMTP 返回的失败原因原样显示（没配发信邮箱时给去「设置」的入口）
  const mailRep = async (r) => {
    const m = await call('pmMail', 'pm.mail', { id: pid.value, reportId: r.id });
    if (m?.ok) sdk.notify.success(t('已发送到 {p0}', { p0: m.to.join('、') }));
    reports.value = (await call('pmRep', 'pm.reports', { id: pid.value })) || reports.value;
  };
  const lint = async () => { req.lint = (await call('pmLint', 'pm.req.lint', { text: req.doc || req.text }))?.issues || []; };
  const genDoc = async () => { const r = await call('pmGen', 'pm.req.generate', { text: req.text }); if (r) { req.doc = r.doc; req.lint = r.issues; } };
  const review = async () => { req.review = await call('pmRev', 'pm.req.review', { text: req.doc || req.text }); };
  const breakdown = async () => { req.breakdown = await call('pmBrk', 'pm.req.breakdown', { text: req.doc || req.text, method: req.method }); };
  const exportBreakdown = async () => { const r = await call('pmExp', 'pm.req.export', { tasks: req.breakdown?.tasks || [] }); if (r?.ok) sdk.notify.success(t('已导出：{p0}', { p0: r.path })); };

  const inp = (key, attrs = {}) => el('input', { class: 'fa-in', value: form[key], onInput: (e) => { form[key] = e.target.value; }, ...attrs });
  const LV = { high: ['高', 'high'], medium: ['中', 'medium'], low: ['低', 'pass'] };

  const vSetup = () => card('pm-1', t('① 项目与接入'), !!pg.value?.project?.lastSync,
    t('建项目、填所在阶段，接入数据：git 仓库（本机路径）、任务系统（Jira / TAPD / 禅道 / ONES 走接口，其它系统导出表格导入；自研系统可用「智能问数」零侵入取数）、会议纪要；配上企业微信 / 钉钉 / 飞书群机器人就能定时推送。'),
    el('div', { class: 'fa-row' },
      projects.value.map((p) => el('button', { class: `fa-btn sm${pid.value === p.id ? ' pri' : ''}`, onClick: () => loadProject(p.id) }, p.name)),
      el('button', { class: 'fa-btn sm', onClick: newProject }, t('+ 新项目')),
      el('button', { class: 'fa-btn sm', disabled: busy.pmDemo, onClick: demo, 'data-test': 'pm-demo' }, t('载入示例项目'))),
    el('div', { class: 'fa-cols' },
      el('div', null,
        el('div', { class: 'fa-row' }, el('span', { style: 'min-width:70px' }, t('项目名称')), inp('name', { style: 'flex:1' })),
        el('div', { class: 'fa-row' }, el('span', { style: 'min-width:70px' }, t('研发模式')), el('select', { class: 'fa-in', value: form.method, onChange: (e) => { form.method = e.target.value; } }, [['waterfall', '瀑布'], ['agile', '敏捷'], ['devops', 'DevOps']].map(([v, l]) => el('option', { value: v, selected: form.method === v }, t(l)))),
          el('span', null, t('当前阶段')), el('select', { class: 'fa-in', value: form.stage, onChange: (e) => { form.stage = e.target.value; } }, STAGES.map((s) => el('option', { value: s, selected: form.stage === s }, t(s)))), el('span', null, t('阶段截止')), inp('stageDue', { type: 'date' })),
        el('div', { class: 'fa-row' }, el('span', { style: 'min-width:70px' }, t('起止日期')), inp('startDate', { type: 'date' }), '—', inp('endDate', { type: 'date' })),
        el('div', { class: 'fa-row' }, el('span', { style: 'min-width:70px' }, t('成员')), inp('members', { style: 'flex:1', placeholder: t('顿号分隔，和 git 提交人名一致') })),
        el('div', { class: 'fa-row', style: 'align-items:flex-start' }, el('span', { style: 'min-width:70px' }, t('git 仓库')), el('textarea', { class: 'fa-in', style: 'flex:1;min-height:44px', placeholder: t('本机仓库路径，一行一个'), value: form.git, onInput: (e) => { form.git = e.target.value; } }))),
      el('div', null,
        el('div', { class: 'fa-row' }, el('span', { style: 'min-width:70px' }, t('任务系统')), el('select', { class: 'fa-in', value: form.toolKind, onChange: (e) => { form.toolKind = e.target.value; } }, TOOLS.map(([v, l]) => el('option', { value: v, selected: form.toolKind === v }, t(l))))),
        form.toolKind === 'csv' ? el('div', { class: 'fa-row' }, el('label', { class: 'fa-btn sm' }, t('导入任务表（CSV / Excel）'), el('input', { type: 'file', hidden: true, accept: '.csv,.xlsx,.xls', disabled: !pid.value, onChange: (e) => { importTasks(e.target.files?.[0]); e.target.value = ''; } })), !pid.value ? el('span', { class: 'fa-empty' }, t('先保存项目')) : null)
          : el('div', null,
            form.toolKind !== 'tapd' ? el('div', { class: 'fa-row' }, el('span', { style: 'min-width:70px' }, t('地址')), inp('baseUrl', { style: 'flex:1', placeholder: 'https://jira.example.com' })) : null,
            el('div', { class: 'fa-row' }, el('span', { style: 'min-width:70px' }, form.toolKind === 'tapd' ? t('项目 ID') : t('项目')), inp('project'), form.toolKind === 'ones' ? inp('team', { placeholder: t('团队 UUID') }) : null),
            el('div', { class: 'fa-row' }, el('span', { style: 'min-width:70px' }, t('账号')), inp('email', { placeholder: t('邮箱 / 用户 ID（可空）') }), inp('token', { type: 'password', placeholder: pg.value?.project?.tool?.hasToken ? t('已加密保存，留空不改') : t('访问令牌') })),
            form.toolKind === 'jira' ? el('div', { class: 'fa-row' }, el('span', { style: 'min-width:70px' }, 'JQL'), inp('query', { style: 'flex:1', placeholder: 'project = MB AND sprint in openSprints()' })) : null),
        el('div', { class: 'fa-row' }, el('span', { style: 'min-width:70px' }, t('群机器人')), inp('webhook', { style: 'flex:1', type: 'password', placeholder: pg.value?.project?.hasWebhook ? t('已加密保存，留空不改') : t('企业微信 / 钉钉 / 飞书机器人地址') })),
        el('div', { class: 'fa-row' }, el('span', { style: 'min-width:70px' }, t('定时')), t('每天'), inp('daily', { type: 'time', style: 'width:110px' }), t('生成日报；每周'), el('select', { class: 'fa-in', value: (form.weekly || '').split(' ')[0] || '', onChange: (e) => { form.weekly = e.target.value ? `${e.target.value} ${(form.weekly || '').split(' ')[1] || '17:00'}` : ''; } }, [['', '不生成'], ['1', '周一'], ['2', '周二'], ['3', '周三'], ['4', '周四'], ['5', '周五']].map(([v, l]) => el('option', { value: v, selected: ((form.weekly || '').split(' ')[0] || '') === v }, t(l)))), form.weekly ? el('input', { class: 'fa-in', type: 'time', style: 'width:110px', value: form.weekly.split(' ')[1] || '17:00', onInput: (e) => { form.weekly = `${form.weekly.split(' ')[0]} ${e.target.value}`; } }) : null, t('生成周报')),
        el('div', { class: 'fa-row' }, el('span', { style: 'min-width:70px' }, t('报告邮件')), inp('mailTo', { style: 'flex:1', placeholder: t('收件人邮箱，多个用逗号分隔'), 'data-test': 'pm-mail-to' })),
        el('div', { class: 'fa-row' },
          el('label', null, el('input', { type: 'checkbox', checked: form.push, onChange: (e) => { form.push = e.target.checked; } }), ' ', t('生成后自动推送到群')),
          el('label', null, el('input', { type: 'checkbox', checked: form.mail, 'data-test': 'pm-mail-auto', onChange: (e) => { form.mail = e.target.checked; } }), ' ', t('生成后自动发邮件'))))),
    el('div', { class: 'fa-row' },
      el('button', { class: 'fa-btn pri', disabled: busy.pmSave, onClick: saveProject, 'data-test': 'pm-save' }, t('保存项目')),
      pid.value ? el('button', { class: 'fa-btn', disabled: busy.pmSync, onClick: sync, 'data-test': 'pm-sync' }, busy.pmSync ? t('同步中…') : t('同步 git 与任务系统')) : null,
      pg.value?.project?.lastSync ? el('span', { class: 'fa-empty' }, t('上次同步：{p0}（{p1}，{p2} 项任务）', { p0: fmtAt(pg.value.project.lastSync.at), p1: pg.value.project.lastSync.source, p2: pg.value.project.lastSync.tasks })) : null),
    syncRes.value?.errors?.length ? el('div', { class: 'fa-note err' }, syncRes.value.errors.join('；')) : null,
    pid.value ? el('div', { style: 'margin-top:8px' }, el('b', null, t('会议纪要')), el('textarea', { class: 'fa-in fa-ta', style: 'min-height:70px', placeholder: t('粘贴站会 / 周会纪要；「决议：」「待办：」开头的行会被识别'), value: minutesText.value, onInput: (e) => { minutesText.value = e.target.value; } }), el('button', { class: 'fa-btn sm', onClick: addMinutes }, t('加入纪要'))) : null,
    errNote('pmSave'), errNote('pmSync'), errNote('pmImp'), errNote('pmDemo'), errNote('pmMin'));

  const vProgress = () => {
    const g = pg.value;
    const p = g?.progress;
    return card('pm-2', t('② 进度跟踪'), !!p?.total,
      t('全生命周期：立项 → 需求 → 设计 → 开发 → 测试 → 投产 → 运维；完成率、逾期、阻塞、成员多日无提交、阶段超期由程序按规则判定，不靠模型猜。'),
      g ? el('div', null,
        el('div', { style: 'display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin:6px 0 12px' }, g.stages.map((s, i) => [
          el('span', { style: `padding:6px 14px;border-radius:6px;font-weight:600;color:#fff;background:${STAGE_COLORS[i]};opacity:${i <= p.stageIdx ? 1 : 0.35};${i === p.stageIdx ? 'box-shadow:0 0 0 3px rgba(200,162,74,.6)' : ''}` }, t(s)),
          i < g.stages.length - 1 ? el('span', { style: 'width:18px;height:2px;background:#cbd5e1' }) : null])),
        el('div', { class: 'fa-grid' }, [[`${p.done}/${p.total}`, '任务完成'], [`${(p.rate * 100).toFixed(0)}%`, '完成率'], [p.planned == null ? '—' : `${(p.planned * 100).toFixed(0)}%`, '计划进度'], [p.overdue.length, '逾期'], [p.blocked.length, '阻塞'], [g.commits.length, '近 60 天提交']].map(([v, l]) => el('div', { class: 'fa-kpi' }, el('b', null, String(v)), el('span', null, t(l))))),
        g.risks.length ? el('div', { style: 'margin-top:10px' }, el('b', null, t('风险预警')), g.risks.map((r) => el('div', { class: `fa-note ${r.level === 'high' ? 'err' : r.level === 'medium' ? 'warn' : 'info'}` }, `${t(LV[r.level]?.[0] || '')} · ${r.text}`))) : el('p', { class: 'fa-note ok' }, t('暂无风险')),
        g.tasks.length ? el('details', { style: 'margin-top:8px' }, el('summary', null, t('任务清单（{p0} 项）', { p0: g.tasks.length })),
          el('table', { class: 'fa-tbl' }, el('thead', null, el('tr', null, [t('编号'), t('标题'), t('状态'), t('负责人'), t('截止')].map((x) => el('th', null, x)))),
            el('tbody', null, g.tasks.map((x) => el('tr', { key: x.id }, el('td', null, x.id), el('td', null, x.title), el('td', null, x.status), el('td', null, x.owner), el('td', null, x.due)))))) : null) : el('p', { class: 'fa-empty' }, t('先在第 ① 步建项目或载入示例')),
      errNote('pmPg'));
  };

  const vReports = () => card('pm-3', t('③ 日报周报'), reports.value.some((r) => r.text),
    t('从 git 提交、任务流转、会议纪要自动汇总；数字全部来自程序统计，模型写出的数字对不上会被打回重写一次，仍对不上的会标出来。'),
    pid.value ? el('div', { class: 'fa-row' },
      el('button', { class: 'fa-btn pri', disabled: busy.pmReport, onClick: () => report('daily'), 'data-test': 'pm-daily' }, busy.pmReport ? t('生成中…') : t('生成今天的日报')),
      el('button', { class: 'fa-btn', disabled: busy.pmReport, onClick: () => report('weekly') }, t('生成本周周报'))) : null,
    reports.value.slice(0, 5).map((r, i) => el('div', { class: 'fa-kbform', key: r.id, 'data-test': i === 0 ? 'pm-report' : undefined },
      el('div', { class: 'fa-row' }, el('b', null, `${r.kind === 'weekly' ? t('周报') : t('日报')} ${r.from === r.to ? r.to : `${r.from} ~ ${r.to}`}`), el('span', { class: 'fa-empty' }, r.source === 'schedule' ? t('定时生成') : t('手动生成')),
        ['git 提交', '任务系统', '会议纪要'].map((s) => el('span', { class: 'fa-src pc' }, t(s))),
        r.pushed ? el('span', { class: `fa-lv ${r.pushed.ok ? 'pass' : 'high'}` }, r.pushed.ok ? t('已推送') : t('推送失败')) : (r.text ? el('button', { class: 'fa-btn sm', disabled: busy.pmPush, onClick: () => push(r) }, t('推送到群')) : null),
        r.text ? el('button', { class: 'fa-btn sm', disabled: busy.pmMail, onClick: () => mailRep(r), 'data-test': i === 0 ? 'pm-mail' : undefined }, busy.pmMail ? t('发送中…') : r.mailed?.ok ? t('再发一次邮件') : t('发送邮件')) : null,
        r.mailed ? el('span', { class: `fa-lv ${r.mailed.ok ? 'pass' : 'high'}`, title: r.mailed.message || '' }, r.mailed.ok ? t('已发邮件 {p0}', { p0: fmtAt(r.mailed.at).slice(5) }) : t('邮件失败')) : null),
      r.mailed && !r.mailed.ok && r.mailed.message ? el('p', { class: 'fa-note err' }, t('邮件没发出去：{p0}', { p0: r.mailed.message })) : null,
      el('p', { class: 'fa-empty' }, t('事实：提交 {a} 次（合并请求 {b} 个），任务完成 {c}/{d}，本期流转 {e} 项，逾期 {f} 项', { a: r.facts.commits, b: r.facts.merges, c: r.facts.taskDone, d: r.facts.taskTotal, e: r.facts.transitions, f: r.facts.overdue.length })),
      r.error ? el('p', { class: 'fa-note err' }, r.error) : el('div', { class: 'fa-ans', style: 'white-space:normal' }, richText(r.text)),
      r.unverified?.length ? el('p', { class: 'fa-note warn' }, t('这些数字在统计里找不到，请核对：{p0}', { p0: r.unverified.join('、') })) : null)),
    err.pmMail ? el('p', { class: 'fa-note err' }, err.pmMail, /设置/.test(err.pmMail) ? [' ', el('button', { class: 'fa-link', onClick: () => navigate('overview') }, t('去设置'))] : null) : null,
    errNote('pmReport'), errNote('pmPush'));

  const vReq = () => card('pm-4', t('④ 需求管理 AI 化'), !!req.breakdown?.tasks?.length,
    t('写一段想法生成需求文档；评审时程序先查含糊词、缺验收标准、缺角色，再由模型找二义性和遗漏；最后按瀑布 / 敏捷 / DevOps 拆成任务，导出表格可直接导入 Jira / TAPD / 禅道。'),
    el('div', { class: 'fa-cols' },
      el('div', null,
        el('b', null, t('需求想法')),
        el('textarea', { class: 'fa-in fa-ta', 'data-test': 'pm-req', placeholder: t('例：手机银行增加「到期理财一键续投」，客户在到期前 3 天收到提醒，可以选同类产品续投，需要风险测评有效'), value: req.text, onInput: (e) => { req.text = e.target.value; } }),
        el('div', { class: 'fa-row' },
          el('button', { class: 'fa-btn pri', disabled: busy.pmGen || !req.text.trim(), onClick: genDoc, 'data-test': 'pm-gen' }, busy.pmGen ? t('生成中…') : t('生成需求文档')),
          el('button', { class: 'fa-btn', onClick: lint }, t('程序预检'))),
        req.doc ? el('div', null, el('b', null, t('需求文档（可改）')), el('textarea', { class: 'fa-in fa-ta', style: 'min-height:260px', value: req.doc, onInput: (e) => { req.doc = e.target.value; } })) : null,
        req.lint.length ? el('div', null, req.lint.map((x) => el('div', { class: `fa-note ${x.level === 'high' ? 'err' : x.level === 'medium' ? 'warn' : 'info'}` }, x.text))) : null),
      el('div', null,
        el('div', { class: 'fa-row' },
          el('button', { class: 'fa-btn', disabled: busy.pmRev || !(req.doc || req.text).trim(), onClick: review, 'data-test': 'pm-review' }, busy.pmRev ? t('评审中…') : t('AI 需求评审')),
          el('select', { class: 'fa-in', value: req.method, onChange: (e) => { req.method = e.target.value; } }, [['waterfall', '瀑布'], ['agile', '敏捷'], ['devops', 'DevOps']].map(([v, l]) => el('option', { value: v, selected: req.method === v }, t(l)))),
          el('button', { class: 'fa-btn pri', disabled: busy.pmBrk || !(req.doc || req.text).trim(), onClick: breakdown, 'data-test': 'pm-breakdown' }, busy.pmBrk ? t('拆解中…') : t('拆解任务'))),
        req.review ? el('div', null,
          el('p', null, el('b', null, t('评审得分 {p0}', { p0: req.review.score })), ' · ', req.review.summary),
          req.review.findings.map((f) => el('div', { class: `fa-note ${f.level === 'high' ? 'err' : f.level === 'medium' ? 'warn' : 'info'}` }, el('b', null, f.problem), f.where ? el('div', { class: 'fa-empty' }, `「${f.where}」${f.located ? '' : t('（原文里没找到这句）')}`) : null, el('div', null, t('改法：{p0}', { p0: f.suggestion }))))) : null,
        req.breakdown ? el('div', null,
          el('p', null, el('b', null, t('共 {p0} 项，合计 {p1} {p2}', { p0: req.breakdown.tasks.length, p1: req.breakdown.total, p2: t(req.breakdown.unit) }))),
          el('table', { class: 'fa-tbl', 'data-test': 'pm-tasks' }, el('thead', null, el('tr', null, ['#', t('标题'), t('类型'), t('估算'), t('依赖')].map((x) => el('th', null, x)))),
            el('tbody', null, req.breakdown.tasks.map((x) => el('tr', { key: x.no }, el('td', null, String(x.no)), el('td', null, x.title, x.acceptance ? el('div', { class: 'fa-empty' }, t('验收：{p0}', { p0: x.acceptance })) : null), el('td', null, t(x.type)), el('td', null, String(x.estimate)), el('td', null, x.dependsOn.join(', ')))))),
          el('button', { class: 'fa-btn', onClick: exportBreakdown }, t('导出任务表（CSV）'))) : null)),
    errNote('pmGen'), errNote('pmRev'), errNote('pmBrk'), errNote('pmExp'));

  return {
    load,
    steps: () => [
      { id: 'pm-1', title: t('① 项目与接入'), done: !!pg.value?.project?.lastSync },
      { id: 'pm-2', title: t('② 进度跟踪'), done: !!pg.value?.progress?.total },
      { id: 'pm-3', title: t('③ 日报周报'), done: reports.value.some((r) => r.text) },
      { id: 'pm-4', title: t('④ 需求管理 AI 化'), done: !!req.breakdown?.tasks?.length },
    ],
    view: () => el('div', { 'data-test': 'fa-pm' }, vSetup(), vProgress(), vReports(), vReq()),
  };
}
