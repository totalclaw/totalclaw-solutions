/**
 * 法务部 · 合同审查工作台（渲染入口，ESM）。七步向导，每步独立状态，进度条吸顶；右侧原文定位高亮。
 * 不 import 'vue'：用 sdk.vue。
 */
export default function createSolution(sdk) {
  const { defineComponent, h, ref, reactive, computed, onMounted, onUnmounted } = sdk.vue;
  const t = (s, p) => sdk.t(s, p);

  const CSS = `
.lga-scroll{height:100%;overflow-y:auto;overscroll-behavior:contain}
.lga{max-width:1320px;margin:0 auto;padding:0 20px 64px;font-size:14px;color:var(--color-text-primary,#111827)}
.lga-auto{display:flex;align-items:center;gap:10px;margin-top:10px;padding:9px 12px;border-radius:10px;background:color-mix(in srgb,var(--color-brand,#6366f1) 10%,var(--color-bg-card,#fff));border:1px solid color-mix(in srgb,var(--color-brand,#6366f1) 40%,transparent);color:var(--color-brand,#6366f1);font-size:13px}
.lga-auto b{font-weight:600}.lga-auto .sp{display:inline-block;animation:lga-spin 1s linear infinite}@keyframes lga-spin{to{transform:rotate(360deg)}}
.lga-steps button:disabled{cursor:default}
.lga-sticky{position:sticky;top:0;z-index:5;background:var(--color-bg-page,var(--color-bg,#f8fafc));padding:14px 0 10px;border-bottom:1px solid var(--color-border,#e5e7eb)}
.lga-head{display:flex;align-items:center;gap:10px;flex-wrap:wrap}.lga-head h2{margin:0;font-size:20px}
.lga-steps{display:flex;gap:2px;margin-top:10px;flex-wrap:wrap;border-bottom:1px solid var(--color-border,#e5e7eb)}
.lga-steps button{border:none;border-bottom:2px solid transparent;background:none;border-radius:0;padding:7px 12px;margin-bottom:-1px;font-size:13px;cursor:pointer;color:var(--color-text-secondary,#6b7280)}
.lga-steps button.done{color:#047857}.lga-steps button.cur{border-bottom-color:var(--color-brand,#6366f1);color:var(--color-brand,#6366f1);font-weight:600}
.lga-prog{height:4px;background:var(--color-border,#e5e7eb);border-radius:2px;margin-top:8px;overflow:hidden}.lga-prog i{display:block;height:100%;background:var(--color-brand,#6366f1);transition:width .3s}
.lga-body{display:grid;grid-template-columns:minmax(0,1fr) 420px;gap:16px;align-items:start}
@media (max-width:1100px){.lga-body{grid-template-columns:1fr}.lga-doc{position:static!important;max-height:none!important}}
.lga-card{border:1px solid var(--color-border,#e5e7eb);border-radius:12px;padding:16px 18px;margin-top:16px;background:var(--color-bg-card,#fff);scroll-margin-top:120px}
.lga-card h3{margin:0 0 4px;font-size:16px;display:flex;align-items:center;gap:8px}
.lga-st{font-size:12px;font-weight:400;padding:1px 8px;border-radius:9px;border:1px solid var(--color-border,#e5e7eb);color:var(--color-text-secondary,#6b7280)}.lga-st.done{border-color:#10b981;color:#047857}
.lga-sub{margin:0 0 12px;color:var(--color-text-secondary,#6b7280);font-size:13px;line-height:1.6}
.lga-btn{padding:6px 14px;border-radius:8px;border:1px solid var(--color-border,#d1d5db);background:var(--color-bg-card,#fff);cursor:pointer;color:inherit;font-size:13px}
.lga-btn.pri{border-color:var(--color-brand,#6366f1);background:var(--color-brand,#6366f1);color:#fff}.lga-btn:disabled{opacity:.5;cursor:default}
.lga-row{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin:6px 0}
.lga-in{border:1px solid var(--color-border,#d1d5db);border-radius:8px;padding:6px 10px;font:inherit;background:var(--color-bg-card,#fff);color:inherit;box-sizing:border-box}
.lga-tbl{width:100%;border-collapse:collapse;font-size:13px}.lga-tbl th,.lga-tbl td{border-bottom:1px solid var(--color-border,#e5e7eb);padding:6px 8px;text-align:left;vertical-align:top}.lga-tbl th{font-weight:500;color:var(--color-text-secondary,#6b7280)}
.lga-lv{display:inline-block;font-size:12px;padding:0 7px;border-radius:5px;color:#fff;white-space:nowrap}.lga-lv.high{background:#dc2626}.lga-lv.medium{background:#f59e0b}.lga-lv.low{background:#10b981}
.lga-risk{border:1px solid var(--color-border,#e5e7eb);border-left-width:4px;border-radius:10px;padding:10px 12px;margin-bottom:10px;cursor:pointer}
.lga-risk.high{border-left-color:#dc2626}.lga-risk.medium{border-left-color:#f59e0b}.lga-risk.low{border-left-color:#10b981}.lga-risk.sel{box-shadow:0 0 0 2px var(--color-brand,#6366f1)}
.lga-q{background:var(--color-bg-subtle,#f8fafc);border-radius:6px;padding:6px 8px;margin:6px 0;font-size:12.5px;color:var(--color-text-secondary,#4b5563)}
.lga-dash{display:grid;grid-template-columns:repeat(5,1fr);gap:10px}.lga-dash div{border:1px solid var(--color-border,#e5e7eb);border-radius:10px;padding:10px;text-align:center}.lga-dash b{display:block;font-size:24px}
.lga-doc{position:sticky;top:130px;max-height:calc(100vh - 150px);overflow:auto;border:1px solid var(--color-border,#e5e7eb);border-radius:12px;padding:12px 14px;margin-top:16px;background:var(--color-bg-card,#fff);font-size:13px;line-height:1.7}
.lga-doc p{margin:0 0 8px;padding:2px 4px;border-radius:4px}.lga-doc p.hit{background:#fef3c7}.lga-doc mark{background:#fde68a;padding:0 1px}
.lga-doc .pn{color:var(--color-text-secondary,#9ca3af);font-size:11px;margin-right:6px}
.lga-err{color:#dc2626;font-size:13px;margin-top:6px}.lga-empty{color:var(--color-text-secondary,#6b7280);font-size:13px}
.lga-diff .added{color:#047857}.lga-diff .removed{color:#dc2626;text-decoration:line-through}.lga-diff .changed{color:#b45309}
`;

  const LV = { high: '高', medium: '中', low: '低' };
  const ACT = { replace: '替换', insert: '新增', delete: '删除', comment: '批注' };

  function readBase64(file) {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(String(r.result).split(',')[1] || '');
      r.onerror = () => reject(new Error(t('读取文件失败')));
      r.readAsDataURL(file);
    });
  }

  return defineComponent({
    name: 'LegalAgentWorkbench',
    setup() {
      const meta = ref(null);
      const list = ref([]);
      const rec = ref(null);
      const busy = reactive({});
      const err = reactive({});
      const sel = ref(null); // { para, quote }
      const stanceForm = reactive({ side: 'neutral', partyName: '', mustKeep: '', tradeable: '' });
      const book = ref(null);
      const bookDirty = ref(false);
      const filter = ref('all');
      // 页签：七步一页一个，只渲染当前这一步（原来整页一长条，卡、宿主容器也不滚动）
      const cur = ref(1);
      const scroller = ref(null);
      // AI 数字员工操作（运营中心派来的合同）：{ key, no, n, label }，界面顶部显示正在做哪一步
      const auto = ref(null);

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
      const setRec = (r) => {
        rec.value = r;
        if (r) Object.assign(stanceForm, { side: r.stance.side, partyName: r.stance.partyName, mustKeep: r.stance.mustKeep.join('\n'), tradeable: r.stance.tradeable.join('\n') });
      };
      async function refreshList() {
        list.value = await sdk.invoke('review.list');
      }
      async function open(id) {
        setRec(await sdk.invoke('review.get', { id }));
        sel.value = null;
        if (rec.value.playbook) await loadBook(rec.value.playbook.id);
      }
      async function loadBook(id) {
        book.value = await sdk.invoke('playbook.get', { id });
        bookDirty.value = false;
      }

      // ── AI 数字员工操作界面：运营中心派来的合同，由本页一步步做完，结果交回运营中心 ──
      const LF = () => (typeof window !== 'undefined' ? window.electronAPI?.legionForeground : null);
      const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
      const handled = new Set();
      const jobKey = () => {
        try { return new URLSearchParams((location.hash.split('?')[1] || '')).get('lfjob') || ''; } catch { return ''; }
      };
      async function act(key, action, payload) {
        const r = await call(key, action, payload);
        return r;
      }
      function reportText(r) {
        const s = r.summary || { count: { high: 0, medium: 0, low: 0 }, missing: 0, index: 0, verdict: '' };
        const lvZh = { high: '高', medium: '中', low: '低' };
        const order = { high: 0, medium: 1, low: 2 };
        const risks = [...(r.review?.risks || [])].sort((a, b) => order[a.level] - order[b.level]).slice(0, 12);
        const lines = [
          `# 《${r.pre?.title || r.fileName}》合同审查意见`,
          `（由法务部「合同审查」工作台逐步审查：预分析 → 立场 → 模板 → 条款抽取 → 逐条审查 → 采纳修订）`,
          '',
          `**结论**：${s.verdict}。高风险 ${s.count.high} 项、中风险 ${s.count.medium} 项、低风险 ${s.count.low} 项，缺失条款 ${s.missing} 项，风险指数 ${s.index}。`,
          r.review?.overall ? `\n${r.review.overall}` : '',
          '',
          '## 主要风险与修改建议',
          ...risks.map((x, i) => `${i + 1}. 【${lvZh[x.level]}】${ctName(x.clauseType)}${x.location ? `（第 ${x.location.para + 1} 段）` : '（缺失）'}：${x.reason}${x.suggestion ? `\n   建议：${x.suggestion}` : ''}`),
          r.review?.missing?.length ? `\n## 缺失条款\n${r.review.missing.map(ctName).join('、')}` : '',
          '',
          `已采纳修订 ${(r.review?.risks || []).filter((x) => x.accepted).length} 条；带修订痕迹的 Word 与意见书可在「合同审查 → 报告与归档」导出。`,
          '需老板确认：是否按以上建议与对方谈判修改；本意见供内部参考，签约前请执业律师复核。',
        ];
        return lines.filter((x) => x !== '').join('\n');
      }
      async function runAutopilot(key) {
        if (!key || handled.has(key) || !LF()) return;
        handled.add(key);
        const job = await LF().job(key).catch(() => null);
        if (!job || !job.files?.length) return;
        const say = async (n, label) => {
          go(n);
          auto.value = { key, no: job.meta?.taskNo ?? null, n, label };
          await LF().progress(key, `第 ${n} 步 · ${label}`).catch(() => undefined);
          await sleep(900);
        };
        try {
          const f = job.files[0];
          await say(1, t('上传合同：{p0}', { p0: f.name }));
          setRec(await act('upload', 'review.createFromPath', { path: f.path, name: f.name }));
          await quiet(refreshList());
          await say(1, t('预分析：识别合同类型、双方主体、金额与期限'));
          setRec(await act('s1', 'review.preAnalyze', { id: rec.value.id }));
          await loadBook(rec.value.playbook.id);
          await say(2, t('立场声明：中立，只做风险提示'));
          Object.assign(stanceForm, { side: 'neutral', partyName: job.meta?.company || stanceForm.partyName });
          setRec(await act('s2', 'review.setStance', { id: rec.value.id, stance: { ...stanceForm } }));
          await say(3, t('选审查模板：{p0}', { p0: book.value?.name ? t(book.value.name) : '' }));
          setRec(await act('s3', 'review.setPlaybook', { id: rec.value.id, playbookId: book.value.id }));
          await say(4, t('条款抽取：找出关键条款并在原文定位'));
          setRec(await act('s4', 'review.extract', { id: rec.value.id }));
          await say(5, t('逐条审查：分级、理由、法条依据与修改建议'));
          setRec(await act('s5', 'review.run', { id: rec.value.id }));
          await say(6, t('采纳修订：高风险与必争条款的修改建议'));
          for (const x of rec.value.review?.risks || []) {
            if (x.level === 'high' || x.priority === 'must') setRec(await sdk.invoke('review.accept', { id: rec.value.id, riskId: x.id, accepted: true, suggestion: x.suggestion }));
          }
          await say(7, t('生成审查意见书与修订稿（Word），交回运营中心'));
          // 意见书 / 修订稿直接落到本方案数据目录（不弹保存框），随结果交回：大屏实时动态里可下载
          const files = await sdk.invoke('review.exportFiles', { id: rec.value.id }).catch(() => []);
          await LF().complete(key, { ok: true, text: reportText(rec.value), files: Array.isArray(files) ? files : [] });
        } catch (e) {
          await LF().complete(key, { ok: false, error: (e && e.message) || String(e) }).catch(() => undefined);
          sdk.notify.warn(t('自动审查没做完：{p0}', { p0: (e && e.message) || String(e) }));
        } finally {
          auto.value = null;
          await quiet(refreshList());
        }
      }
      const onHash = () => { void runAutopilot(jobKey()); };
      onUnmounted(() => window.removeEventListener('hashchange', onHash));

      onMounted(async () => {
        window.addEventListener('hashchange', onHash);
        if (!document.getElementById('lga-style')) {
          const s = document.createElement('style');
          s.id = 'lga-style';
          s.textContent = CSS;
          document.head.appendChild(s);
        }
        try {
          meta.value = await sdk.invoke('meta');
          await refreshList();
        } catch (e) {
          sdk.notify.warn(e.message);
        }
        void runAutopilot(jobKey());
      });

      async function upload(e) {
        const f = e.target.files && e.target.files[0];
        e.target.value = '';
        if (!f) return;
        try {
          const r = await call('upload', 'review.create', { fileName: f.name, base64: await readBase64(f) });
          setRec(r);
          await refreshList();
          await step(1);
        } catch (_) {
          /* err 已显示 */
        }
      }
      // 每步动作
      async function step(n) {
        const id = rec.value?.id;
        if (!id) return;
        try {
          if (n === 1) {
            setRec(await call('s1', 'review.preAnalyze', { id }));
            await loadBook(rec.value.playbook.id);
          } else if (n === 2) setRec(await call('s2', 'review.setStance', { id, stance: { ...stanceForm } }));
          else if (n === 3) {
            if (bookDirty.value) await call('s3', 'playbook.save', { id: book.value.id, entries: book.value.entries, required: book.value.required });
            setRec(await call('s3', 'review.setPlaybook', { id, playbookId: book.value.id }));
            await loadBook(book.value.id);
          } else if (n === 4) setRec(await call('s4', 'review.extract', { id }));
          else if (n === 5) setRec(await call('s5', 'review.run', { id }));
        } catch (_) {
          /* err */
        }
        await quiet(refreshList());
      }
      async function accept(risk, on) {
        setRec(await sdk.invoke('review.accept', { id: rec.value.id, riskId: risk.id, accepted: on, suggestion: risk.suggestion }));
      }
      async function exportDoc(kind) {
        try {
          const r = await call('s7', kind === 'revised' ? 'review.exportRevised' : 'review.exportOpinion', { id: rec.value.id });
          if (r.canceled) return;
          sdk.notify.success(kind === 'revised' ? t('修订稿已保存：{p0} 处修订{p1}', { p0: r.applied, p1: r.asComment ? t('，{p0} 处因位置重叠改为批注', { p0: r.asComment }) : '' }) : t('意见书已保存'));
        } catch (_) {
          /* err */
        }
      }
      async function compare(e) {
        const f = e.target.files && e.target.files[0];
        e.target.value = '';
        if (!f) return;
        try {
          setRec(await call('cmp', 'review.compare', { id: rec.value.id, fileName: f.name, base64: await readBase64(f) }));
        } catch (_) {
          /* err */
        }
      }

      const steps = computed(() => {
        const r = rec.value;
        return [
          { n: 1, name: t('上传与预分析'), done: !!r?.pre },
          { n: 2, name: t('立场声明'), done: !!r && (r.stance.side !== 'neutral' || !!r.stance.partyName) },
          { n: 3, name: t('审查模板'), done: !!r?.playbook && !!r?.pre },
          { n: 4, name: t('条款抽取'), done: !!r?.clauses },
          { n: 5, name: t('逐条审查'), done: !!r?.review },
          { n: 6, name: t('修订与采纳'), done: !!r?.review?.risks.some((x) => x.accepted) },
          { n: 7, name: t('报告与归档'), done: false, optional: true },
        ];
      });
      const progress = computed(() => Math.round((steps.value.filter((s) => s.done).length / 6) * 100));
      const go = (n) => {
        cur.value = n;
        if (scroller.value) scroller.value.scrollTop = 0;
      };
      const ctName = (id) => meta.value?.clauseTypes.find((c) => c.id === id)?.zh || id;

      const head = (s, sub) => [
        h('h3', [`${s.n}. ${s.name}`, h('span', { class: `lga-st${s.done ? ' done' : ''}` }, s.optional ? t('可选') : s.done ? t('已完成') : t('待执行'))]),
        h('p', { class: 'lga-sub' }, sub),
      ];
      const errLine = (k) => (err[k] ? h('div', { class: 'lga-err' }, err[k]) : null);
      const pickLoc = (loc) => {
        if (!loc) return;
        sel.value = loc;
        setTimeout(() => document.getElementById(`lga-p${loc.para}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 30);
      };
      const locText = (loc) => (loc ? t('第 {p0} 段{p1}{p2}', { p0: loc.para + 1, p1: loc.page ? t(' · 第 {p0} 页', { p0: loc.page }) : '', p2: loc.approx ? t('（位置近似）') : '' }) : t('新增条款'));

      function vStep1(s) {
        const r = rec.value;
        return h('div', { class: 'lga-card', id: 'lga-s1' }, [
          ...head(s, t('上传合同（docx / pdf / txt），识别合同类型、双方主体、金额与期限。主体、金额、期限只收原文里真的出现的内容。')),
          h('div', { class: 'lga-row' }, [
            h('label', { class: 'lga-btn pri', style: 'display:inline-block' }, [busy.upload ? t('读取中…') : t('上传合同'), h('input', { type: 'file', accept: '.docx,.pdf,.txt,.md', style: 'display:none', onChange: upload })]),
            r ? h('span', [h('b', r.fileName), ` · ${t('{p0} 段', { p0: r.paras.length })}`]) : null,
            r ? h('button', { class: 'lga-btn', disabled: busy.s1, onClick: () => step(1) }, busy.s1 ? t('分析中…') : r.pre ? t('重新预分析') : t('开始预分析')) : null,
          ]),
          r?.warning ? h('div', { class: 'lga-err' }, r.warning) : null,
          r?.ocr ? h('div', { class: 'lga-sub' }, t('这份文件是扫描件，文字来自 OCR，原文定位只到页')) : null,
          errLine('upload'),
          errLine('s1'),
          r?.pre
            ? h('table', { class: 'lga-tbl', style: 'margin-top:8px' }, [
                h('tr', [h('th', t('合同名称')), h('td', r.pre.title || '—')]),
                h('tr', [h('th', t('合同类型')), h('td', meta.value?.playbooks.find((b) => b.id === r.pre.contractType)?.name || t('其它'))]),
                h('tr', [h('th', t('主体')), h('td', r.pre.parties.map((p) => `${p.role ? `${p.role}：` : ''}${p.name}`).join('；') || '—')]),
                h('tr', [h('th', t('金额')), h('td', r.pre.amount || '—')]),
                h('tr', [h('th', t('期限')), h('td', r.pre.term || '—')]),
                h('tr', [h('th', t('建议重点')), h('td', r.pre.focus.join('；') || '—')]),
              ])
            : null,
        ]);
      }

      function vStep2(s) {
        const parties = rec.value?.pre?.parties || [];
        return h('div', { class: 'lga-card', id: 'lga-s2' }, [
          ...head(s, t('先说清楚代表哪一方，再写必守项与可谈项——同一条款，对甲方是保护，对乙方可能是风险。')),
          h('div', { class: 'lga-row' }, [
            h('span', t('我方是')),
            h('select', { class: 'lga-in', value: stanceForm.side, onChange: (e) => (stanceForm.side = e.target.value) }, Object.entries(meta.value?.stances || {}).map(([k, v]) => h('option', { value: k }, t(v)))),
            h('input', { class: 'lga-in', style: 'width:240px', placeholder: t('我方主体名称'), list: 'lga-parties', value: stanceForm.partyName, onInput: (e) => (stanceForm.partyName = e.target.value) }),
            h('datalist', { id: 'lga-parties' }, parties.map((p) => h('option', { value: p.name }))),
          ]),
          h('div', { class: 'lga-row', style: 'align-items:flex-start' }, [
            h('textarea', { class: 'lga-in', rows: 3, style: 'flex:1;min-width:240px', placeholder: t('必守项（每行一条），例如：付款期限不超过 60 天'), value: stanceForm.mustKeep, onInput: (e) => (stanceForm.mustKeep = e.target.value) }),
            h('textarea', { class: 'lga-in', rows: 3, style: 'flex:1;min-width:240px', placeholder: t('可谈项（每行一条），例如：质保期可以延长到 18 个月'), value: stanceForm.tradeable, onInput: (e) => (stanceForm.tradeable = e.target.value) }),
          ]),
          h('button', { class: 'lga-btn pri', disabled: !rec.value || busy.s2, onClick: () => step(2) }, t('保存立场')),
          errLine('s2'),
        ]);
      }

      function vStep3(s) {
        const b = book.value;
        return h('div', { class: 'lga-card', id: 'lga-s3' }, [
          ...head(s, t('按合同类型加载审查模板：每类条款写标准立场、可接受范围、需要上报的情形。模板可以改，改动按版本留快照。')),
          h('div', { class: 'lga-row' }, [
            h('select', { class: 'lga-in', value: b?.id, disabled: !rec.value, onChange: (e) => loadBook(e.target.value) }, (meta.value?.playbooks || []).map((p) => h('option', { value: p.id }, `${t(p.name)}${p.versions ? t('（已改 {p0} 版）', { p0: p.versions }) : ''}`))),
            h('button', { class: 'lga-btn pri', disabled: !rec.value || !b || busy.s3, onClick: () => step(3) }, bookDirty.value ? t('保存为新版本并使用') : t('使用此模板')),
            b?.versions?.length ? h('button', { class: 'lga-btn', onClick: async () => { meta.value.playbooks = await sdk.invoke('playbook.reset', { id: b.id }); await loadBook(b.id); } }, t('恢复内置版本')) : null,
          ]),
          errLine('s3'),
          b
            ? h('table', { class: 'lga-tbl' }, [
                h('tr', [h('th', t('条款')), h('th', t('标准立场')), h('th', t('可接受')), h('th', t('需上报'))]),
                ...b.entries.map((e) =>
                  h('tr', [
                    h('td', { style: 'white-space:nowrap' }, ctName(e.clauseType)),
                    ...['standard', 'acceptable', 'escalateWhen'].map((k) => h('td', h('textarea', { class: 'lga-in', rows: 2, style: 'width:100%', value: e[k], onInput: (ev) => { e[k] = ev.target.value; bookDirty.value = true; } }))),
                  ]),
                ),
              ])
            : null,
        ]);
      }

      function vStep4(s) {
        const r = rec.value;
        return h('div', { class: 'lga-card', id: 'lga-s4' }, [
          ...head(s, t('按 CUAD 41 类 + 中文常用类别抽取关键条款。模型只给原话，位置由程序在原文里找，找不到的不收。')),
          h('button', { class: 'lga-btn pri', disabled: !r?.pre || busy.s4, onClick: () => step(4) }, busy.s4 ? t('抽取中…') : r?.clauses ? t('重新抽取') : t('开始抽取')),
          errLine('s4'),
          r?.clauses
            ? h('div', [
                h('p', { class: 'lga-sub', style: 'margin-top:8px' }, t('抽到 {p0} 条{p1}', { p0: r.clauses.length, p1: r.clauseDropped ? t('；{p0} 条引用在原文里找不到，已丢弃', { p0: r.clauseDropped }) : '' })),
                h('table', { class: 'lga-tbl' }, [
                  h('tr', [h('th', t('类别')), h('th', t('概括')), h('th', t('位置'))]),
                  ...r.clauses.map((c) => h('tr', { style: 'cursor:pointer', onClick: () => pickLoc(c.location) }, [h('td', ctName(c.clauseType)), h('td', c.summary), h('td', { style: 'white-space:nowrap' }, locText(c.location))])),
                ]),
              ])
            : null,
        ]);
      }

      function vStep5(s) {
        const r = rec.value;
        const rv = r?.review;
        const sm = r?.summary;
        const fw = { oneSided: t('义务是否单向'), exitSymmetric: t('退出权是否对等'), falsePremise: t('有无虚假前提'), breachSymmetric: t('违约是否对称') };
        const ans = { yes: t('是'), no: t('否'), unclear: t('不明确') };
        return h('div', { class: 'lga-card', id: 'lga-s5' }, [
          ...head(s, t('逐条审查并分级：每条附理由、违约后果、法条依据与修改建议。法条只做格式核对（法律存在、条号在范围），编造的丢弃；缺失条款由程序按模板必备项算。')),
          h('button', { class: 'lga-btn pri', disabled: !r?.clauses || busy.s5, onClick: () => step(5) }, busy.s5 ? t('审查中…') : rv ? t('重新审查') : t('开始审查')),
          errLine('s5'),
          sm
            ? h('div', { style: 'margin-top:12px' }, [
                h('div', { class: 'lga-dash' }, [
                  h('div', [h('b', { style: 'color:#dc2626' }, sm.count.high), t('高风险')]),
                  h('div', [h('b', { style: 'color:#f59e0b' }, sm.count.medium), t('中风险')]),
                  h('div', [h('b', { style: 'color:#10b981' }, sm.count.low), t('低风险')]),
                  h('div', [h('b', sm.missing), t('缺失条款')]),
                  h('div', [h('b', sm.index), t('风险指数')]),
                ]),
                h('p', { class: 'lga-sub', style: 'margin-top:8px' }, `${t(sm.verdict)}。${rv.overall}`),
                rv.stats.droppedQuotes || rv.stats.droppedBasis ? h('p', { class: 'lga-sub' }, t('已丢弃：{p0} 条风险的引用在原文找不到，{p1} 条法条格式不对（法律不在清单或条号超出）', { p0: rv.stats.droppedQuotes, p1: rv.stats.droppedBasis })) : null,
                rv.missing.length ? h('p', [h('b', t('缺失条款：')), rv.missing.map(ctName).join('、')]) : null,
                h('table', { class: 'lga-tbl', style: 'margin-top:6px' }, [h('tr', [h('th', t('框架四问')), h('th', t('结论')), h('th', t('说明'))]), ...Object.entries(fw).map(([k, label]) => h('tr', [h('td', label), h('td', ans[rv.framework[k].answer]), h('td', rv.framework[k].note)]))]),
              ])
            : null,
        ]);
      }

      function vStep6(s) {
        const rv = rec.value?.review;
        const risks = (rv?.risks || []).filter((x) => filter.value === 'all' || x.level === filter.value);
        return h('div', { class: 'lga-card', id: 'lga-s6' }, [
          ...head(s, t('每条给可直接放进合同的条文、退让方案、必争 / 可让。可以改写建议后再采纳；采纳的修订导出为带修订痕迹的 Word。')),
          rv
            ? h('div', { class: 'lga-row' }, [
                ...['all', 'high', 'medium', 'low'].map((k) => h('button', { class: `lga-btn${filter.value === k ? ' pri' : ''}`, onClick: () => (filter.value = k) }, k === 'all' ? t('全部') : t('{p0}风险', { p0: LV[k] }))),
                h('button', { class: 'lga-btn', onClick: async () => setRec(await sdk.invoke('review.accept', { id: rec.value.id, all: true })) }, t('全部采纳')),
                h('button', { class: 'lga-btn', onClick: async () => setRec(await sdk.invoke('review.accept', { id: rec.value.id, all: false })) }, t('全部取消')),
              ])
            : h('div', { class: 'lga-empty' }, t('完成审查后在这里逐条采纳')),
          ...risks.map((x) =>
            h('div', { class: `lga-risk ${x.level}${sel.value && x.location && sel.value.para === x.location.para ? ' sel' : ''}`, key: x.id, onClick: () => pickLoc(x.location) }, [
              h('div', { class: 'lga-row', style: 'margin:0' }, [
                h('span', { class: `lga-lv ${x.level}` }, t(LV[x.level])),
                h('b', ctName(x.clauseType)),
                h('span', { class: 'lga-st' }, t(ACT[x.action])),
                h('span', { class: 'lga-st' }, x.priority === 'must' ? t('必争') : t('可让')),
                h('span', { class: 'lga-sub', style: 'margin:0' }, locText(x.location)),
                h('label', { style: 'margin-left:auto;cursor:pointer', onClick: (e) => e.stopPropagation() }, [h('input', { type: 'checkbox', checked: x.accepted, onChange: (e) => accept(x, e.target.checked) }), ` ${t('采纳')}`]),
              ]),
              x.location ? h('div', { class: 'lga-q' }, `「${x.location.quote}」`) : null,
              h('div', x.reason),
              x.cost ? h('div', { class: 'lga-sub', style: 'margin:4px 0' }, t('后果：{p0}', { p0: x.cost })) : null,
              x.legalBasis.length ? h('div', { class: 'lga-sub', style: 'margin:4px 0' }, `${t('依据')}：${x.legalBasis.map((b) => `${b.law}${b.article}`).join('；')}${t('（仅格式核对）')}`) : null,
              x.action !== 'delete' && x.action !== 'comment'
                ? h('textarea', { class: 'lga-in', rows: 3, style: 'width:100%;margin-top:6px', value: x.suggestion, onClick: (e) => e.stopPropagation(), onInput: (e) => (x.suggestion = e.target.value), onChange: () => x.accepted && accept(x, true) })
                : null,
              x.fallback ? h('div', { class: 'lga-sub', style: 'margin:4px 0' }, t('退让方案：{p0}', { p0: x.fallback })) : null,
              h('div', { class: 'lga-row' }, [
                h('button', { class: 'lga-btn', disabled: busy[`rb-${x.id}`], onClick: async (e) => { e.stopPropagation(); busy[`rb-${x.id}`] = true; try { setRec(await sdk.invoke('review.rebuttal', { id: rec.value.id, riskId: x.id })); } catch (er) { sdk.notify.warn(er.message); } finally { busy[`rb-${x.id}`] = false; } } }, busy[`rb-${x.id}`] ? t('推演中…') : t('对方会怎么反驳')),
              ]),
              rec.value.rebuttals?.[x.id] ? h('div', { class: 'lga-q', style: 'white-space:pre-wrap' }, rec.value.rebuttals[x.id]) : null,
            ]),
          ),
        ]);
      }

      function vStep7(s) {
        const r = rec.value;
        return h('div', { class: 'lga-card', id: 'lga-s7' }, [
          ...head(s, t('导出带修订痕迹与批注的修订稿（Word 里可逐条接受 / 拒绝；保留文字、不保留原格式），以及审查意见书。也可以上传对方改过的版本做两版对比。')),
          h('div', { class: 'lga-row' }, [
            h('button', { class: 'lga-btn pri', disabled: !r?.review || busy.s7, onClick: () => exportDoc('revised') }, t('导出修订稿')),
            h('button', { class: 'lga-btn', disabled: !r?.review || busy.s7, onClick: () => exportDoc('opinion') }, t('导出审查意见书')),
            h('label', { class: 'lga-btn', style: 'display:inline-block' }, [busy.cmp ? t('对比中…') : t('上传新版本对比'), h('input', { type: 'file', accept: '.docx,.pdf,.txt,.md', style: 'display:none', disabled: !r, onChange: compare })]),
          ]),
          errLine('s7'),
          errLine('cmp'),
          r?.compare
            ? h('div', { class: 'lga-diff', style: 'margin-top:8px' }, [
                h('p', { class: 'lga-sub' }, t('与「{p0}」对比：{p1} 处不同', { p0: r.compare.fileName, p1: r.compare.total })),
                ...r.compare.diff.slice(0, 200).map((d) => h('div', { class: d.type, style: 'margin-bottom:6px' }, d.type === 'changed' ? [h('div', { class: 'removed' }, d.from), h('div', { class: 'changed' }, d.text)] : `${d.type === 'added' ? '+ ' : '- '}${d.text}`)),
              ])
            : null,
        ]);
      }

      function vDoc() {
        const r = rec.value;
        if (!r) return h('div', { class: 'lga-doc' }, h('div', { class: 'lga-empty' }, t('上传合同后在这里显示原文；点条款或风险会定位并高亮原文')));
        return h(
          'div',
          { class: 'lga-doc' },
          r.paras.map((p) => {
            const hit = sel.value && sel.value.para === p.i;
            let body = p.text;
            if (hit && sel.value.quote) {
              const at = p.text.indexOf(sel.value.quote.slice(0, 12));
              if (at >= 0) {
                const end = Math.min(p.text.length, at + sel.value.quote.length);
                body = [p.text.slice(0, at), h('mark', p.text.slice(at, end)), p.text.slice(end)];
              }
            }
            return h('p', { id: `lga-p${p.i}`, class: hit ? 'hit' : '' }, [h('span', { class: 'pn' }, p.i + 1), ...(Array.isArray(body) ? body : [body])]);
          }),
        );
      }

      return () => {
        if (!meta.value) return h('div', { class: 'lga', style: 'padding-top:32px' }, t('加载中…'));
        const st = steps.value;
        const VIEWS = [vStep1, vStep2, vStep3, vStep4, vStep5, vStep6, vStep7];
        const a = auto.value;
        return h('div', { class: 'lga-scroll', ref: scroller }, h('div', { class: 'lga', 'data-test': 'legal-agent' }, [
          h('div', { class: 'lga-sticky' }, [
            h('div', { class: 'lga-head' }, [
              h('h2', t('法务部 · 合同审查')),
              h('select', { class: 'lga-in', value: rec.value?.id || '', onChange: (e) => e.target.value && open(e.target.value) }, [h('option', { value: '' }, t('历史审查（{p0}）', { p0: list.value.length })), ...list.value.map((x) => h('option', { value: x.id }, `${x.title || x.fileName}${x.summary ? ` · ${t('高 {p0}', { p0: x.summary.count.high })}` : ''}`))]),
              rec.value ? h('button', { class: 'lga-btn', onClick: () => { rec.value = null; sel.value = null; } }, t('新建审查')) : null,
              !meta.value.hasModel ? h('span', { class: 'lga-err' }, t('本机模型不可用，审查步骤无法执行')) : null,
            ]),
            h('div', { class: 'lga-steps', role: 'tablist' }, st.map((s) => h('button', { role: 'tab', 'aria-selected': cur.value === s.n, 'data-test': `lga-tab-${s.n}`, class: `${s.done ? 'done' : ''}${cur.value === s.n ? ' cur' : ''}`, disabled: !!a, onClick: () => go(s.n) }, `${s.n} ${s.name}${s.done ? ' ✓' : ''}`))),
            h('div', { class: 'lga-prog' }, h('i', { style: `width:${progress.value}%` })),
            a ? h('div', { class: 'lga-auto', 'data-test': 'lga-autopilot' }, [h('span', { class: 'sp' }, '⟳'), h('b', t('AI 数字员工正在操作')), a.no != null ? t('（运营中心任务 #{p0}）', { p0: a.no }) : '', h('span', `· ${t('第 {p0} 步', { p0: a.n })}：${a.label}`)]) : null,
          ]),
          h('div', { class: 'lga-body' }, [h('div', [VIEWS[cur.value - 1](st[cur.value - 1])]), vDoc()]),
        ]));
      };
    },
  });
}
