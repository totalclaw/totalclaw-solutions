/**
 * 人事部 · 招聘工作台（渲染入口，ESM）。七步向导 + 候选人看板，每步独立状态，进度条吸顶。
 * 不 import 'vue'：用 sdk.vue。
 */
export default function createSolution(sdk) {
  const { defineComponent, h, ref, reactive, computed, onMounted, onUnmounted, watch } = sdk.vue;
  const t = (s, p) => sdk.t(s, p);

  const CSS = `
.hra{max-width:1320px;margin:0 auto;padding:0 20px 64px;font-size:14px;color:var(--color-text-primary,#111827)}
.hra-sticky{position:sticky;top:0;z-index:5;background:var(--color-bg-page,var(--color-bg,#f8fafc));padding:14px 0 10px;border-bottom:1px solid var(--color-border,#e5e7eb)}
.hra-head{display:flex;align-items:center;gap:10px;flex-wrap:wrap}.hra-head h2{margin:0;font-size:20px}
.hra-steps{display:flex;gap:6px;margin-top:10px;flex-wrap:wrap}
.hra-steps button{border:1px solid var(--color-border,#e5e7eb);background:var(--color-bg-card,#fff);border-radius:16px;padding:4px 12px;font-size:12.5px;cursor:pointer;color:inherit}
.hra-steps button.done{border-color:#10b981;color:#047857}
.hra-prog{height:4px;background:var(--color-border,#e5e7eb);border-radius:2px;margin-top:8px;overflow:hidden}.hra-prog i{display:block;height:100%;background:var(--color-brand,#6366f1);transition:width .3s}
.hra-batch{font-size:12.5px;color:var(--color-brand,#6366f1)}
.hra-card{border:1px solid var(--color-border,#e5e7eb);border-radius:12px;padding:16px 18px;margin-top:16px;background:var(--color-bg-card,#fff);scroll-margin-top:120px}
.hra-card h3{margin:0 0 4px;font-size:16px;display:flex;align-items:center;gap:8px}
.hra-st{font-size:12px;font-weight:400;padding:1px 8px;border-radius:9px;border:1px solid var(--color-border,#e5e7eb);color:var(--color-text-secondary,#6b7280)}.hra-st.done{border-color:#10b981;color:#047857}
.hra-sub{margin:0 0 12px;color:var(--color-text-secondary,#6b7280);font-size:13px;line-height:1.6}
.hra-btn{padding:6px 14px;border-radius:8px;border:1px solid var(--color-border,#d1d5db);background:var(--color-bg-card,#fff);cursor:pointer;color:inherit;font-size:13px}
.hra-btn.pri{border-color:var(--color-brand,#6366f1);background:var(--color-brand,#6366f1);color:#fff}.hra-btn:disabled{opacity:.5;cursor:default}
.hra-row{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin:6px 0}
.hra-in{border:1px solid var(--color-border,#d1d5db);border-radius:8px;padding:6px 10px;font:inherit;background:var(--color-bg-card,#fff);color:inherit;box-sizing:border-box}
.hra-tbl{width:100%;border-collapse:collapse;font-size:13px}.hra-tbl th,.hra-tbl td{border-bottom:1px solid var(--color-border,#e5e7eb);padding:6px 8px;text-align:left;vertical-align:top}.hra-tbl th{font-weight:500;color:var(--color-text-secondary,#6b7280)}
.hra-tag{display:inline-block;font-size:12px;padding:0 7px;border-radius:5px;border:1px solid;white-space:nowrap}
.hra-advance{color:#047857;border-color:#10b981}.hra-hold{color:#b45309;border-color:#f59e0b}.hra-reject{color:#dc2626;border-color:#dc2626}
.hra-board{display:grid;grid-template-columns:repeat(6,minmax(150px,1fr));gap:10px;overflow-x:auto}
.hra-col{background:var(--color-bg-subtle,#f8fafc);border-radius:10px;padding:8px;min-height:120px}
.hra-col h4{margin:0 0 6px;font-size:13px;color:var(--color-text-secondary,#6b7280)}
.hra-cand{background:var(--color-bg-card,#fff);border:1px solid var(--color-border,#e5e7eb);border-radius:8px;padding:6px 8px;margin-bottom:6px;cursor:pointer;font-size:13px}
.hra-cand.sel{box-shadow:0 0 0 2px var(--color-brand,#6366f1)}
.hra-ev{font-size:12px;color:var(--color-text-secondary,#4b5563)}
.hra-err{color:#dc2626;font-size:13px;margin-top:6px}.hra-warn{color:#b45309;font-size:13px}.hra-empty{color:var(--color-text-secondary,#6b7280);font-size:13px}
`;

  const STAGE = { sourcing: '寻源', screening: '筛选', interview: '面试', offer: 'Offer', onboarding: '入职', rejected: '淘汰' };
  const DEC = { advance: '推进', hold: '待定', reject: '淘汰' };
  const VER = { met: '满足', unmet: '不满足', unknown: '未知' };

  const readBase64 = (file) =>
    new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(String(r.result).split(',')[1] || '');
      r.onerror = () => reject(new Error(t('读取文件失败')));
      r.readAsDataURL(file);
    });

  return defineComponent({
    name: 'HrAgentWorkbench',
    setup() {
      const meta = ref(null);
      const jobs = ref([]);
      const job = ref(null);
      const selId = ref(null);
      const busy = reactive({});
      const err = reactive({});
      const form = reactive({ title: '', dept: '', location: '', salary: '', headcount: 1, notes: '' });
      const keywords = ref('');
      const prog = ref(null);
      const offerForm = reactive({ salary: '', startDate: '', probation: '' });
      const newItem = ref('');

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
      const run = async (key, action, payload) => {
        try {
          const r = await call(key, action, payload);
          if (r?.job) job.value = r.job;
          else if (r?.candidates) job.value = r;
          return r;
        } catch (_) {
          return null;
        }
      };
      async function refreshJobs() {
        jobs.value = await sdk.invoke('job.list');
      }
      async function open(id) {
        job.value = await sdk.invoke('job.get', { id });
        selId.value = null;
      }

      const offs = [];
      onMounted(async () => {
        if (!document.getElementById('hra-style')) {
          const s = document.createElement('style');
          s.id = 'hra-style';
          s.textContent = CSS;
          document.head.appendChild(s);
        }
        offs.push(sdk.on('progress', (p) => (prog.value = p.done >= p.total ? null : p)));
        try {
          meta.value = await sdk.invoke('meta');
          await refreshJobs();
        } catch (e) {
          sdk.notify.warn(e.message);
        }
      });
      onUnmounted(() => offs.forEach((f) => f && f()));

      const sel = computed(() => job.value?.candidates.find((c) => c.id === selId.value) || null);
      // HR6：发邀约的收件地址（null = 用简历里的邮箱）与「确认发送」状态；换候选人就复位
      const sendTo = ref(null);
      const sendAsk = ref('');
      const vectorKeep = ref('');
      watch(selId, () => {
        sendTo.value = null;
        sendAsk.value = '';
      });
      const steps = computed(() => {
        const j = job.value;
        const cs = j?.candidates || [];
        return [
          { n: 1, name: t('JD 与体检'), done: !!j?.jd && !!j?.gates.length },
          { n: 2, name: t('简历导入'), done: cs.length > 0 && cs.every((c) => c.resume) },
          { n: 3, name: t('三层筛选'), done: cs.length > 0 && cs.every((c) => c.screening) },
          { n: 4, name: t('面试题与评分卡'), done: cs.some((c) => c.interview) },
          { n: 5, name: t('邀约'), done: cs.some((c) => c.invite) },
          { n: 6, name: t('Offer 与入职'), done: cs.some((c) => c.offer) },
          { n: 7, name: t('候选人看板'), done: false, optional: true },
        ];
      });
      const progress = computed(() => Math.round((steps.value.filter((s) => s.done).length / 6) * 100));
      const go = (n) => document.getElementById(`hra-s${n}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      const head = (s, sub) => [
        h('h3', [`${s.n}. ${s.name}`, h('span', { class: `hra-st${s.done ? ' done' : ''}` }, s.optional ? t('可选') : s.done ? t('已完成') : t('待执行'))]),
        h('p', { class: 'hra-sub' }, sub),
      ];
      const errLine = (k) => (err[k] ? h('div', { class: 'hra-err' }, err[k]) : null);
      const nameOf = (c) => c.resume?.basics?.name || c.fileName;
      const pick = (c) => {
        selId.value = c.id;
        if (c.offer) Object.assign(offerForm, { salary: c.offer.salary, startDate: c.offer.startDate, probation: c.offer.probation });
      };
      const cp = { id: () => job.value.id, cid: () => selId.value };

      function vStep1(s) {
        const j = job.value;
        if (!j) {
          const f = (k, label, w = 160) => h('input', { class: 'hra-in', style: `width:${w}px`, placeholder: label, value: form[k], onInput: (e) => (form[k] = e.target.value) });
          return h('div', { class: 'hra-card', id: 'hra-s1' }, [
            ...head(s, t('填岗位信息生成 JD；程序检查歧视性用词（性别、年龄、婚育、户籍、民族外貌健康），并拆出硬条件与评分维度（权重合计 100）。')),
            h('div', { class: 'hra-row' }, [f('title', t('岗位名称 *')), f('dept', t('部门')), f('location', t('工作地点')), f('salary', t('薪资范围')), h('input', { class: 'hra-in', style: 'width:80px', type: 'number', min: 1, value: form.headcount, onInput: (e) => (form.headcount = e.target.value) })]),
            h('textarea', { class: 'hra-in', rows: 3, style: 'width:100%', placeholder: t('补充说明：核心职责、必须会的技能、团队情况…'), value: form.notes, onInput: (e) => (form.notes = e.target.value) }),
            h('button', { class: 'hra-btn pri', disabled: busy.create, onClick: async () => { const r = await run('create', 'job.create', { ...form }); if (r) { job.value = r; await refreshJobs(); } } }, t('创建岗位')),
            errLine('create'),
          ]);
        }
        const chk = j.jdCheck;
        return h('div', { class: 'hra-card', id: 'hra-s1' }, [
          ...head(s, t('生成后可以直接改 JD、硬条件和维度权重，保存时重新体检。')),
          h('div', { class: 'hra-row' }, [
            h('b', j.title),
            h('span', { class: 'hra-sub', style: 'margin:0' }, [j.info.dept, j.info.location, j.info.salary].filter(Boolean).join(' · ')),
            h('button', { class: 'hra-btn pri', disabled: busy.jd, onClick: () => run('jd', 'jd.generate', { id: j.id }) }, busy.jd ? t('生成中…') : j.jd ? t('重新生成') : t('生成 JD 与筛选标准')),
            j.jd ? h('button', { class: 'hra-btn', disabled: busy.jd, onClick: () => run('jd', 'jd.save', { id: j.id, jd: j.jd, gates: j.gates, dims: j.dims }) }, t('保存修改并体检')) : null,
          ]),
          errLine('jd'),
          chk ? h('div', [...chk.issues.map((x) => h('div', { class: 'hra-err' }, t('歧视性用词（{p0}）：「{p1}」', { p0: x.kind, p1: x.text }))), ...chk.warnings.map((w) => h('div', { class: 'hra-warn' }, w)), !chk.issues.length && !chk.warnings.length ? h('div', { class: 'hra-sub' }, t('体检通过：没有发现歧视性用词')) : null]) : null,
          j.jd ? h('textarea', { class: 'hra-in', rows: 10, style: 'width:100%;margin-top:8px', value: j.jd, onInput: (e) => (j.jd = e.target.value) }) : null,
          j.gates.length
            ? h('table', { class: 'hra-tbl', style: 'margin-top:8px' }, [
                h('tr', [h('th', t('硬条件')), h('th', t('类型')), h('th', '')]),
                ...j.gates.map((g, i) => h('tr', [h('td', h('input', { class: 'hra-in', style: 'width:100%', value: g.condition, onInput: (e) => (g.condition = e.target.value) })), h('td', h('select', { class: 'hra-in', value: g.severity, onChange: (e) => (g.severity = e.target.value) }, [h('option', { value: 'must' }, t('必备')), h('option', { value: 'prefer' }, t('加分'))])), h('td', h('a', { style: 'cursor:pointer;color:#dc2626', onClick: () => j.gates.splice(i, 1) }, t('删除')))])),
              ])
            : null,
          j.dims.length
            ? h('table', { class: 'hra-tbl', style: 'margin-top:8px' }, [
                h('tr', [h('th', t('评分维度')), h('th', t('权重')), h('th', t('0 / 2 / 4 分锚点'))]),
                ...j.dims.map((d) => h('tr', [h('td', d.name), h('td', h('input', { class: 'hra-in', type: 'number', style: 'width:70px', value: d.weight, onInput: (e) => (d.weight = Number(e.target.value)) })), h('td', { class: 'hra-ev' }, [d.anchors[0], d.anchors[2], d.anchors[4]].filter(Boolean).join(' / '))])),
              ])
            : null,
        ]);
      }

      async function upload(e) {
        const list = [...(e.target.files || [])];
        e.target.value = '';
        if (!list.length) return;
        try {
          const files = await Promise.all(list.map(async (f) => ({ fileName: f.name, base64: await readBase64(f) })));
          const r = await call('up', 'resume.upload', { id: job.value.id, files });
          job.value = r.job;
          if (r.failed.length) sdk.notify.warn(t('{p0} 份没读出来：{p1}', { p0: r.failed.length, p1: r.failed.map((x) => `${x.fileName}（${x.error}）`).join('；') }));
          await run('parse', 'resume.parse', { id: job.value.id });
        } catch (_) {
          /* err */
        }
      }

      function vStep2(s) {
        const j = job.value;
        const cs = j?.candidates || [];
        return h('div', { class: 'hra-card', id: 'hra-s2' }, [
          ...head(s, t('批量导入简历（docx / pdf / txt，一次最多 200 份），整理成 JSON Resume 结构 + 期望薪资、到岗时间等。姓名、联系方式、公司、学校只收简历里真有的。')),
          h('div', { class: 'hra-row' }, [
            h('label', { class: 'hra-btn pri', style: 'display:inline-block' }, [busy.up ? t('上传中…') : t('导入简历'), h('input', { type: 'file', multiple: true, accept: '.docx,.pdf,.txt,.md', style: 'display:none', disabled: !j, onChange: upload })]),
            cs.some((c) => !c.resume) ? h('button', { class: 'hra-btn', disabled: busy.parse, onClick: () => run('parse', 'resume.parse', { id: j.id }) }, t('解析未解析的 {p0} 份', { p0: cs.filter((c) => !c.resume).length })) : null,
            h('span', { class: 'hra-sub', style: 'margin:0' }, t('共 {p0} 份，已解析 {p1}', { p0: cs.length, p1: cs.filter((c) => c.resume).length })),
          ]),
          errLine('up'),
          errLine('parse'),
          cs.length
            ? h('table', { class: 'hra-tbl' }, [
                h('tr', [h('th', t('姓名')), h('th', t('最近经历')), h('th', t('学历')), h('th', t('期望')), h('th', t('文件'))]),
                ...cs.slice(0, 50).map((c) => h('tr', { style: 'cursor:pointer', onClick: () => pick(c) }, [h('td', c.resume?.basics?.name || '—'), h('td', c.resume?.work?.[0] ? `${c.resume.work[0].name} · ${c.resume.work[0].position}` : '—'), h('td', c.resume?.education?.[0] ? `${c.resume.education[0].institution} ${c.resume.education[0].studyType}` : '—'), h('td', [c.resume?.cn?.expectedSalary, c.resume?.cn?.availableFrom].filter(Boolean).join(' · ') || '—'), h('td', { class: 'hra-ev' }, c.fileName)])),
              ])
            : null,
        ]);
      }

      function vStep3(s) {
        const j = job.value;
        const cs = (j?.candidates || []).filter((c) => c.screening).sort((a, b) => (b.screening.total || 0) - (a.screening.total || 0));
        const th = meta.value?.settings?.thresholds || { advance: 70, hold: 50 };
        return h('div', { class: 'hra-card', id: 'hra-s3' }, [
          ...head(s, t('① 关键词预筛（可选）→ ② 硬条件门禁：证据必须是简历原话，简历没提到只能判「未知」，不判不满足 → ③ 0–4 锚定分，每分要证据；总分由程序按权重算。')),
          h('div', { class: 'hra-row' }, [
            h('input', { class: 'hra-in', style: 'width:300px', placeholder: t('预筛关键词（可选，逗号分隔，命中任一即进入下一层）'), value: keywords.value, onInput: (e) => (keywords.value = e.target.value) }),
            // HR3 向量预筛：按与岗位要求的相似度只保留前 N%（不调模型）
            h('select', { class: 'hra-in', value: vectorKeep.value, onChange: (e) => (vectorKeep.value = e.target.value), title: t('按简历与岗位要求的文字相似度先筛一轮，被筛掉的不调模型，可手动改回') }, [
              h('option', { value: '' }, t('不做相似度预筛')),
              ...['0.8', '0.6', '0.4'].map((v) => h('option', { value: v }, t('相似度前 {p0}%', { p0: Math.round(Number(v) * 100) }))),
            ]),
            h('button', { class: 'hra-btn pri', disabled: !j?.candidates.length || busy.screen, onClick: () => run('screen', 'screen.run', { id: j.id, keywords: keywords.value.split(/[,，\s]+/).filter(Boolean), ...(vectorKeep.value ? { vectorKeep: Number(vectorKeep.value) } : {}) }) }, busy.screen ? t('筛选中…') : t('开始筛选')),
            h('span', t('推进线')),
            h('input', { class: 'hra-in', type: 'number', style: 'width:64px', value: th.advance, onChange: async (e) => (meta.value.settings = await sdk.invoke('settings.save', { thresholds: { ...th, advance: Number(e.target.value) } })) }),
            h('span', t('待定线')),
            h('input', { class: 'hra-in', type: 'number', style: 'width:64px', value: th.hold, onChange: async (e) => (meta.value.settings = await sdk.invoke('settings.save', { thresholds: { ...th, hold: Number(e.target.value) } })) }),
            // HR2：有在线员工机时批量解析 / 筛选分给本机 + 各员工机并行
            meta.value?.clusterMachines
              ? h('label', { class: 'hra-ev', style: 'display:inline-flex;gap:4px;align-items:center' }, [
                  h('input', { type: 'checkbox', checked: meta.value.settings?.useCluster !== false, onChange: async (e) => (meta.value.settings = await sdk.invoke('settings.save', { useCluster: e.target.checked })) }),
                  t('分给本机 + {p0} 台员工机并行', { p0: meta.value.clusterMachines }),
                ])
              : null,
            cs.length ? h('button', { class: 'hra-btn', onClick: async () => { try { await call('exp', 'screen.export', { id: j.id }); } catch (_) { /* */ } } }, t('导出筛选表')) : null,
          ]),
          errLine('screen'),
          cs.length
            ? h('table', { class: 'hra-tbl' }, [
                h('tr', [h('th', t('姓名')), h('th', t('总分')), h('th', t('决定')), h('th', t('说明')), h('th', t('需复核'))]),
                ...cs.map((c) => h('tr', { style: 'cursor:pointer', onClick: () => pick(c) }, [h('td', nameOf(c)), h('td', h('b', c.screening.total)), h('td', h('span', { class: `hra-tag hra-${c.screening.decision}` }, t(DEC[c.screening.decision]))), h('td', { class: 'hra-ev' }, c.screening.why), h('td', { class: 'hra-ev' }, c.screening.flags.length ? t('{p0} 处', { p0: c.screening.flags.length }) : '')])),
              ])
            : null,
        ]);
      }

      function vDetail() {
        const c = sel.value;
        if (!c) return h('div', { class: 'hra-card' }, h('div', { class: 'hra-empty' }, t('在上面的列表或看板里点一位候选人，这里显示筛选证据、面试题、邀约、offer 与入职清单')));
        const sc = c.screening;
        return h('div', { class: 'hra-card', style: 'border-color:var(--color-brand,#6366f1)' }, [
          h('h3', [nameOf(c), h('span', { class: 'hra-st' }, t(STAGE[c.stage])), sc ? h('span', { class: `hra-tag hra-${sc.decision}` }, `${t(DEC[sc.decision])} · ${sc.total}`) : null]),
          h('div', { class: 'hra-row' }, [
            h('span', t('移到')),
            h('select', { class: 'hra-in', value: c.stage, onChange: (e) => run('st', 'candidate.stage', { id: cp.id(), candidateId: c.id, stage: e.target.value }) }, Object.entries(STAGE).map(([k, v]) => h('option', { value: k }, t(v)))),
            h('a', { style: 'cursor:pointer;color:#dc2626;margin-left:auto', onClick: async () => { await run('rm', 'candidate.remove', { id: cp.id(), candidateId: c.id }); selId.value = null; } }, t('删除候选人')),
          ]),
          sc && !sc.prefiltered
            ? h('div', [
                h('table', { class: 'hra-tbl' }, [
                  h('tr', [h('th', t('硬条件')), h('th', t('判断')), h('th', t('简历原话'))]),
                  ...sc.gates.map((g) => h('tr', [h('td', `${g.severity === 'must' ? t('[必备]') : t('[加分]')} ${g.condition}`), h('td', t(VER[g.verdict])), h('td', { class: 'hra-ev' }, g.evidence || '—')])),
                  h('tr', [h('th', t('维度（权重）')), h('th', t('分')), h('th', t('简历原话'))]),
                  ...sc.scores.map((x) => h('tr', [h('td', `${x.dimension}（${x.weight}）`), h('td', `${x.score} / 4`), h('td', { class: 'hra-ev' }, x.evidence || '—')])),
                ]),
                sc.highlights.length ? h('p', { class: 'hra-sub' }, `${t('优势')}：${sc.highlights.join('；')}`) : null,
                sc.gaps.length ? h('p', { class: 'hra-sub' }, `${t('差距')}：${sc.gaps.join('；')}`) : null,
                sc.flags.length ? h('div', sc.flags.map((f) => h('div', { class: 'hra-warn' }, f))) : null,
              ])
            : sc
              ? h('p', { class: 'hra-sub' }, sc.why)
              : null,
        ]);
      }

      function vStep4(s) {
        const c = sel.value;
        return h('div', { class: 'hra-card', id: 'hra-s4' }, [
          ...head(s, t('按该候选人的差距和待确认项出胜任力面试题，同时生成评分卡；面试后在评分卡打分，程序按权重算面试总分。')),
          !c ? h('div', { class: 'hra-empty' }, t('先选一位候选人')) : h('button', { class: 'hra-btn pri', disabled: busy.iv, onClick: () => run('iv', 'interview.generate', { id: cp.id(), candidateId: c.id }) }, busy.iv ? t('生成中…') : c.interview ? t('重新出题') : t('生成面试题与评分卡')),
          errLine('iv'),
          c?.interview
            ? h('div', [
                h('ol', c.interview.questions.map((q) => h('li', { style: 'margin-bottom:6px' }, [q.q, h('div', { class: 'hra-ev' }, `${q.dimension} · ${t('看点')}：${q.lookFor}`)]))),
                h('table', { class: 'hra-tbl' }, [
                  h('tr', [h('th', t('维度（权重）')), h('th', t('面试打分')), h('th', t('备注'))]),
                  ...c.interview.scorecard.map((row) =>
                    h('tr', [
                      h('td', `${row.dimension}（${row.weight}）`),
                      h('td', h('select', { class: 'hra-in', value: row.score ?? '', onChange: (e) => run('ivs', 'interview.score', { id: cp.id(), candidateId: c.id, dimension: row.dimension, score: e.target.value === '' ? null : Number(e.target.value), note: row.note }) }, [h('option', { value: '' }, '—'), ...[0, 1, 2, 3, 4].map((n) => h('option', { value: n }, `${n}`))])),
                      h('td', h('input', { class: 'hra-in', style: 'width:100%', value: row.note, onChange: (e) => run('ivs', 'interview.score', { id: cp.id(), candidateId: c.id, dimension: row.dimension, score: row.score, note: e.target.value }) })),
                    ]),
                  ),
                ]),
                c.interview.total != null ? h('p', [h('b', t('面试总分：{p0}', { p0: c.interview.total }))]) : null,
              ])
            : null,
        ]);
      }

      function vStep5(s) {
        const c = sel.value;
        const inv = c?.invite;
        return h('div', { class: 'hra-card', id: 'hra-s5' }, [
          ...head(s, t('生成个性化邀约邮件草稿；面试时间留「【请填写】」由你补。补完、保存后点「发送邮件」再确认一次才会真发（用你在「设置 → 邮件」配的邮箱，没配走官方代发）；也可以复制到自己邮箱发。')),
          !c ? h('div', { class: 'hra-empty' }, t('先选一位候选人')) : h('button', { class: 'hra-btn pri', disabled: busy.inv, onClick: () => run('inv', 'invite.generate', { id: cp.id(), candidateId: c.id }) }, busy.inv ? t('生成中…') : inv ? t('重新生成') : t('生成邀约邮件')),
          errLine('inv'),
          inv
            ? h('div', [
                h('input', { class: 'hra-in', style: 'width:100%;margin-top:8px', value: inv.subject, onInput: (e) => (inv.subject = e.target.value) }),
                h('textarea', { class: 'hra-in', rows: 8, style: 'width:100%;margin-top:6px', value: inv.body, onInput: (e) => (inv.body = e.target.value) }),
                h('div', { class: 'hra-row' }, [
                  h('button', { class: 'hra-btn', onClick: async () => { try { await navigator.clipboard.writeText(`${inv.subject}\n\n${inv.body}`); sdk.notify.success(t('已复制')); } catch (_) { sdk.notify.warn(t('复制失败')); } } }, t('复制')),
                  c.resume?.basics?.email ? h('span', { class: 'hra-ev' }, `${t('收件人')}：${c.resume.basics.email}`) : null,
                  h('select', { class: 'hra-in', value: inv.status, onChange: (e) => run('inv', 'invite.save', { id: cp.id(), candidateId: c.id, subject: inv.subject, body: inv.body, status: e.target.value }) }, [h('option', { value: 'draft' }, t('草稿')), h('option', { value: 'sent' }, t('已发送')), h('option', { value: 'replied' }, t('已回复'))]),
                  h('button', { class: 'hra-btn', onClick: () => run('inv', 'invite.save', { id: cp.id(), candidateId: c.id, subject: inv.subject, body: inv.body, status: inv.status }) }, t('保存修改')),
                ]),
                h('div', { class: 'hra-row' }, [
                  h('input', { class: 'hra-in', style: 'width:240px', placeholder: t('收件邮箱'), value: sendTo.value ?? (c.resume?.basics?.email || ''), onInput: (e) => (sendTo.value = e.target.value) }),
                  sendAsk.value === c.id
                    ? h('span', [
                        h('span', { class: 'hra-ev' }, t('确认把这封邀约发给 {p0}？', { p0: sendTo.value ?? (c.resume?.basics?.email || '') })),
                        ' ',
                        h('button', { class: 'hra-btn pri', disabled: busy.inv, onClick: async () => { sendAsk.value = ''; await run('inv', 'invite.send', { id: cp.id(), candidateId: c.id, to: sendTo.value ?? (c.resume?.basics?.email || ''), resend: inv.status === 'sent' }); } }, t('确认发送')),
                        ' ',
                        h('button', { class: 'hra-btn', onClick: () => (sendAsk.value = '') }, t('取消')),
                      ])
                    : h('button', { class: 'hra-btn pri', disabled: busy.inv, onClick: () => (sendAsk.value = c.id) }, inv.status === 'sent' ? t('再次发送') : t('发送邮件')),
                  inv.sentAt ? h('span', { class: 'hra-ev' }, t('已于 {p0} 发给 {p1}{p2}', { p0: new Date(inv.sentAt).toLocaleString(), p1: inv.sentTo, p2: inv.via === 'official' ? t('（官方代发）') : '' })) : null,
                ]),
                inv.notice ? h('div', { class: 'hra-ev' }, inv.notice) : null,
              ])
            : null,
        ]);
      }

      function vStep6(s) {
        const c = sel.value;
        const f = (k, label) => h('input', { class: 'hra-in', style: 'width:150px', placeholder: label, value: offerForm[k], onInput: (e) => (offerForm[k] = e.target.value) });
        return h('div', { class: 'hra-card', id: 'hra-s6' }, [
          ...head(s, t('起草录用通知书（录用由老板拍板，这里只出草稿并导出 Word）；进入「入职」阶段后生成入职清单，逐项勾选。')),
          !c
            ? h('div', { class: 'hra-empty' }, t('先选一位候选人'))
            : h('div', { class: 'hra-row' }, [f('salary', t('薪资')), f('startDate', t('入职日期')), f('probation', t('试用期')), h('button', { class: 'hra-btn pri', disabled: busy.off, onClick: () => run('off', 'offer.generate', { id: cp.id(), candidateId: c.id, ...offerForm }) }, busy.off ? t('起草中…') : c.offer ? t('重新起草') : t('起草 offer'))]),
          errLine('off'),
          c?.offer
            ? h('div', [
                h('textarea', { class: 'hra-in', rows: 10, style: 'width:100%', value: c.offer.text, onInput: (e) => (c.offer.text = e.target.value) }),
                h('div', { class: 'hra-row' }, [
                  h('button', { class: 'hra-btn', onClick: () => run('off', 'offer.save', { id: cp.id(), candidateId: c.id, text: c.offer.text }) }, t('保存修改')),
                  h('button', { class: 'hra-btn', onClick: async () => { await run('off', 'offer.save', { id: cp.id(), candidateId: c.id, text: c.offer.text }); try { await call('offx', 'offer.export', { id: cp.id(), candidateId: c.id }); } catch (_) { /* */ } } }, t('导出 Word')),
                  c.stage !== 'onboarding' ? h('button', { class: 'hra-btn', onClick: () => run('st', 'candidate.stage', { id: cp.id(), candidateId: c.id, stage: 'onboarding' }) }, t('已接受 offer，进入入职')) : null,
                ]),
              ])
            : null,
          c?.onboarding
            ? h('div', { style: 'margin-top:10px' }, [
                h('b', t('入职清单（{p0}/{p1}）', { p0: c.onboarding.filter((x) => x.done).length, p1: c.onboarding.length })),
                ...c.onboarding.map((x, i) => h('label', { style: 'display:block;margin:4px 0;cursor:pointer' }, [h('input', { type: 'checkbox', checked: x.done, onChange: (e) => run('ob', 'onboarding.toggle', { id: cp.id(), candidateId: c.id, index: i, done: e.target.checked }) }), ` ${t(x.item)}`])),
                h('div', { class: 'hra-row' }, [h('input', { class: 'hra-in', placeholder: t('加一项'), value: newItem.value, onInput: (e) => (newItem.value = e.target.value) }), h('button', { class: 'hra-btn', onClick: async () => { await run('ob', 'onboarding.toggle', { id: cp.id(), candidateId: c.id, add: newItem.value }); newItem.value = ''; } }, t('添加'))]),
              ])
            : null,
        ]);
      }

      function vStep7(s) {
        const cs = job.value?.candidates || [];
        return h('div', { class: 'hra-card', id: 'hra-s7' }, [
          ...head(s, t('寻源 → 筛选 → 面试 → Offer → 入职，淘汰单列。点卡片查看详情，在详情里改阶段。')),
          h(
            'div',
            { class: 'hra-board' },
            Object.entries(STAGE).map(([k, v]) =>
              h('div', { class: 'hra-col' }, [
                h('h4', `${t(v)}（${cs.filter((c) => c.stage === k).length}）`),
                ...cs.filter((c) => c.stage === k).map((c) => h('div', { class: `hra-cand${selId.value === c.id ? ' sel' : ''}`, onClick: () => pick(c) }, [h('div', nameOf(c)), c.screening ? h('div', { class: 'hra-ev' }, `${t(DEC[c.screening.decision])} · ${c.screening.total}`) : null])),
              ]),
            ),
          ),
        ]);
      }

      return () => {
        if (!meta.value) return h('div', { class: 'hra', style: 'padding-top:32px' }, t('加载中…'));
        const st = steps.value;
        return h('div', { class: 'hra', 'data-test': 'hr-agent' }, [
          h('div', { class: 'hra-sticky' }, [
            h('div', { class: 'hra-head' }, [
              h('h2', t('人事部 · 招聘')),
              h('select', { class: 'hra-in', value: job.value?.id || '', onChange: (e) => e.target.value && open(e.target.value) }, [h('option', { value: '' }, t('岗位（{p0}）', { p0: jobs.value.length })), ...jobs.value.map((x) => h('option', { value: x.id }, `${x.title} · ${t('{p0} 人', { p0: x.candidates })}`))]),
              job.value ? h('button', { class: 'hra-btn', onClick: () => { job.value = null; selId.value = null; } }, t('新建岗位')) : null,
              prog.value ? h('span', { class: 'hra-batch' }, `${t(prog.value.label)} ${prog.value.done}/${prog.value.total}`) : null,
              !meta.value.hasModel ? h('span', { class: 'hra-err' }, t('本机模型不可用，生成与筛选步骤无法执行')) : null,
            ]),
            h('div', { class: 'hra-steps' }, st.map((s) => h('button', { class: s.done ? 'done' : '', onClick: () => go(s.n) }, `${s.n} ${s.name}${s.done ? ' ✓' : ''}`))),
            h('div', { class: 'hra-prog' }, h('i', { style: `width:${progress.value}%` })),
          ]),
          vStep1(st[0]),
          job.value ? [vStep2(st[1]), vStep3(st[2]), vDetail(), vStep4(st[3]), vStep5(st[4]), vStep6(st[5]), vStep7(st[6])] : null,
        ]);
      };
    },
  });
}
