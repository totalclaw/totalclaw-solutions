/**
 * 法务部 · 合同审查工作台 主进程入口（hostApi 2，手写 CommonJS）。
 *
 * 七步：① 上传与预分析 ② 立场声明 ③ 审查模板 ④ 条款抽取 ⑤ 逐条审查与分级 ⑥ 修订建议与采纳 ⑦ 报告与归档
 * 参照（只借功能与交互，代码自写）：xiaodingfeng/contract-review（MIT）、anthropics/knowledge-work-plugins legal（Apache-2.0）、
 * evolsb/claude-legal-skill（MIT）、CSlawyer1985/contract-review-pro（无许可证，只借思路）、CUAD 类别名（CC BY 4.0）。
 *
 * 宿主能力（只有本入口能 require host: / npm:）：workbenchLlm（模型）、documentExtractor（PDF 文字）、electron（保存对话框）。
 * 数据：legal-agent/reviews/<id>.json、legal-agent/files/<id>/、legal-agent/playbooks.json（自定义模板版本）
 */
const { readFileSync, writeFileSync, mkdirSync, rmSync, readdirSync, existsSync } = require('node:fs');
const { join, basename, extname } = require('node:path');
const { randomUUID } = require('node:crypto');
const { extractParas } = require('./docText.cjs');
const R = require('./review.cjs');
const { buildDocx, buildRevisedDocx } = require('./docx.cjs');

const D = 'legal-agent';
const MAX_FILE = 20 * 1024 * 1024;
const ALLOWED = new Set(['.docx', '.pdf', '.txt', '.md']);

function parseJsonLoose(text) {
  const s = String(text || '').replace(/```(?:json)?/gi, '');
  const a = s.indexOf('{');
  const b = s.lastIndexOf('}');
  if (a < 0 || b <= a) throw new Error('模型没有按要求返回结构化结果，请重试');
  return JSON.parse(s.slice(a, b + 1));
}

function hostLlm(ctx, deps) {
  if (!deps) return null;
  try {
    const { createWorkbenchLlm } = require('host:apps/desktop-shell/src/main/services/workbenchLlm.ts');
    const wl = createWorkbenchLlm(deps, { logTag: 'legal-agent', moduleModel: () => '' });
    return async (prompt, timeoutMs = 240_000) => (await wl.llm('legal-agent', prompt, timeoutMs)).text;
  } catch (e) {
    ctx.log.warn(`宿主模型模块不可用：${e.message}`);
    return null;
  }
}

function hostPdf() {
  try {
    const { extractDocument } = require('host:apps/desktop-shell/src/main/services/documentExtractor.ts');
    return (file) => extractDocument(file);
  } catch {
    return null;
  }
}

let llmOverride = null; // 单测注入

module.exports = {
  hostApi: 2,
  __setLlmForTests(fn) {
    llmOverride = fn;
  },

  activate(ctx) {
    const deps = ctx.host?.deps || null;
    const llmHost = hostLlm(ctx, deps);
    const pdf = hostPdf();
    const llm = async (prompt, timeoutMs) => {
      const fn = llmOverride || llmHost;
      if (!fn) throw new Error('本机模型不可用（宿主未提供模型通道）');
      return fn(prompt, timeoutMs);
    };
    const llmJson = async (prompt) => parseJsonLoose(await llm(prompt));

    const clauseTypes = JSON.parse(readFileSync(ctx.packagePath('resources/clause-types.json'), 'utf8')).items;
    const statutes = JSON.parse(readFileSync(ctx.packagePath('resources/statutes.json'), 'utf8')).items;
    const builtinBooks = readdirSync(ctx.packagePath('resources/playbooks'))
      .filter((f) => f.endsWith('.json'))
      .map((f) => ({ ...JSON.parse(readFileSync(ctx.packagePath(`resources/playbooks/${f}`), 'utf8')), builtin: true }));

    /** 模板：内置 + 自定义版本快照（{ [id]: [版本1, 版本2…] }，取最新） */
    const customBooks = () => ctx.readJson(`${D}/playbooks.json`, {});
    const playbooks = () => {
      const custom = customBooks();
      return builtinBooks.map((b) => {
        const vs = custom[b.id];
        return vs && vs.length ? { ...b, ...vs[vs.length - 1], builtin: false, versions: vs.length } : { ...b, versions: 0 };
      });
    };
    const bookOf = (id, version) => {
      const b = builtinBooks.find((x) => x.id === id) || builtinBooks[0];
      const vs = customBooks()[b.id] || [];
      if (version && vs[version - 1]) return { ...b, ...vs[version - 1] };
      return vs.length ? { ...b, ...vs[vs.length - 1] } : b;
    };

    const recPath = (id) => `${D}/reviews/${String(id).replace(/[^\w-]/g, '')}.json`;
    const load = (id) => {
      const r = ctx.readJson(recPath(id), null);
      if (!r) throw new Error('找不到这份审查');
      return r;
    };
    const save = (r) => {
      r.updatedAt = Date.now();
      ctx.writeJson(recPath(r.id), r);
      ctx.emit('review-changed', { id: r.id });
      return r;
    };

    const h = (name, fn) => ctx.handle(name, fn);

    h('meta', () => ({ playbooks: playbooks(), clauseTypes, stances: R.STANCE_LABEL, hasModel: !!(llmOverride || llmHost), canPdf: !!pdf }));

    h('review.list', () => {
      const dir = ctx.dataPath(`${D}/reviews`);
      if (!existsSync(dir)) return [];
      return readdirSync(dir)
        .filter((f) => f.endsWith('.json'))
        .map((f) => ctx.readJson(`${D}/reviews/${f}`, null))
        .filter(Boolean)
        .map((r) => ({ id: r.id, fileName: r.fileName, title: r.pre?.title || '', createdAt: r.createdAt, updatedAt: r.updatedAt, summary: r.summary || null }))
        .sort((a, b) => b.updatedAt - a.updatedAt);
    });
    h('review.get', (p) => load(p?.id));
    h('review.remove', (p) => {
      const r = load(p?.id);
      rmSync(ctx.dataPath(recPath(r.id)), { force: true });
      rmSync(ctx.dataPath(`${D}/files/${r.id}`), { recursive: true, force: true });
      return { ok: true };
    });

    /** ① 上传：渲染层传 base64，落到本方案数据目录后抽取段落 */
    const storeUpload = async (id, fileName, base64) => {
      const name = basename(String(fileName || 'contract.docx')).replace(/[\\/:*?"<>|]/g, '_');
      if (!ALLOWED.has(extname(name).toLowerCase())) throw new Error('只支持 docx / pdf / txt / md');
      const buf = Buffer.from(String(base64 || ''), 'base64');
      if (!buf.length) throw new Error('文件是空的');
      if (buf.length > MAX_FILE) throw new Error('文件超过 20MB');
      const dir = ctx.dataPath(`${D}/files/${id}`);
      mkdirSync(dir, { recursive: true });
      const file = join(dir, name);
      writeFileSync(file, buf);
      return { name, doc: await extractParas(file, { pdf }) };
    };

    h('review.create', async (p) => {
      const id = `lg-${Date.now().toString(36)}-${randomUUID().slice(0, 4)}`;
      const { name, doc } = await storeUpload(id, p?.fileName, p?.base64);
      if (!doc.paras.length) throw new Error(doc.warning || '没有读到合同文字');
      return save({
        id,
        fileName: name,
        kind: doc.kind,
        ocr: doc.ocr,
        warning: doc.warning || null,
        paras: doc.paras,
        createdAt: Date.now(),
        pre: null,
        stance: { side: 'neutral', partyName: '', mustKeep: [], tradeable: [] },
        playbook: null,
        clauses: null,
        review: null,
        summary: null,
        rebuttals: {},
      });
    });

    h('review.preAnalyze', async (p) => {
      const r = load(p?.id);
      const text = r.paras.map((x) => x.text).join('\n');
      const raw = await llmJson(R.preAnalyzePrompt(text, builtinBooks));
      r.pre = R.normalizePreAnalysis(raw, text, builtinBooks);
      if (!r.playbook) r.playbook = { id: r.pre.contractType === 'other' ? builtinBooks[0].id : r.pre.contractType, version: null };
      return save(r);
    });

    h('review.setStance', (p) => {
      const r = load(p?.id);
      const s = p?.stance || {};
      const list = (v) => (Array.isArray(v) ? v : String(v || '').split(/[\n；;]/)).map((x) => String(x).trim()).filter(Boolean).slice(0, 20);
      r.stance = { side: ['first', 'second', 'neutral'].includes(s.side) ? s.side : 'neutral', partyName: String(s.partyName || '').slice(0, 80), mustKeep: list(s.mustKeep), tradeable: list(s.tradeable) };
      return save(r);
    });

    h('playbooks.list', () => playbooks());
    h('playbook.get', (p) => ({ ...bookOf(p?.id, p?.version), versions: (customBooks()[p?.id] || []).map((v, i) => ({ version: i + 1, savedAt: v.savedAt })) }));
    h('playbook.save', (p) => {
      const base = builtinBooks.find((b) => b.id === p?.id);
      if (!base) throw new Error('没有这个模板');
      const entries = (Array.isArray(p.entries) ? p.entries : [])
        .map((e) => ({ clauseType: String(e.clauseType || ''), standard: String(e.standard || '').slice(0, 400), acceptable: String(e.acceptable || '').slice(0, 400), escalateWhen: String(e.escalateWhen || '').slice(0, 400) }))
        .filter((e) => clauseTypes.some((c) => c.id === e.clauseType) && e.standard);
      if (!entries.length) throw new Error('模板至少一条有效条目');
      const custom = customBooks();
      const vs = custom[base.id] || [];
      vs.push({ entries, required: Array.isArray(p.required) ? p.required.filter((id) => clauseTypes.some((c) => c.id === id)) : base.required, version: vs.length + 1, savedAt: Date.now() });
      custom[base.id] = vs.slice(-20);
      ctx.writeJson(`${D}/playbooks.json`, custom);
      return playbooks();
    });
    h('playbook.reset', (p) => {
      const custom = customBooks();
      delete custom[p?.id];
      ctx.writeJson(`${D}/playbooks.json`, custom);
      return playbooks();
    });
    h('review.setPlaybook', (p) => {
      const r = load(p?.id);
      if (!builtinBooks.some((b) => b.id === p?.playbookId)) throw new Error('没有这个模板');
      r.playbook = { id: p.playbookId, version: Number.isInteger(p.version) ? p.version : null };
      return save(r);
    });

    h('review.extract', async (p) => {
      const r = load(p?.id);
      const text = r.paras.map((x) => x.text).join('\n');
      const raw = await llmJson(R.extractPrompt(text, clauseTypes));
      const { clauses, dropped } = R.normalizeClauses(raw, r.paras, clauseTypes);
      r.clauses = clauses;
      r.clauseDropped = dropped;
      return save(r);
    });

    h('review.run', async (p) => {
      const r = load(p?.id);
      if (!r.clauses) throw new Error('请先完成条款抽取');
      const text = r.paras.map((x) => x.text).join('\n');
      const playbook = bookOf(r.playbook?.id, r.playbook?.version);
      const raw = await llmJson(R.reviewPrompt({ text, stance: r.stance, playbook, clauses: r.clauses, clauseTypes }));
      r.review = R.normalizeReview(raw, { paras: r.paras, clauseTypes, statutes, playbook, clauses: r.clauses });
      r.review.playbook = { id: playbook.id, name: playbook.name, version: playbook.version || null };
      r.summary = R.summarize(r.review.risks, r.review.missing);
      return save(r);
    });

    h('review.accept', (p) => {
      const r = load(p?.id);
      if (!r.review) throw new Error('还没有审查结果');
      for (const risk of r.review.risks) {
        if (p.all === true || p.all === false) risk.accepted = p.all;
        else if (risk.id === p.riskId) {
          risk.accepted = !!p.accepted;
          if (typeof p.suggestion === 'string') risk.suggestion = p.suggestion.slice(0, 1200);
        }
      }
      return save(r);
    });

    h('review.rebuttal', async (p) => {
      const r = load(p?.id);
      const risk = r.review?.risks.find((x) => x.id === p?.riskId);
      if (!risk) throw new Error('找不到这条风险');
      r.rebuttals[risk.id] = (await llm(R.rebuttalPrompt(risk, r.stance), 120_000)).trim().slice(0, 3000);
      return save(r);
    });

    /** 保存文件：有 electron 走保存对话框，否则写到本方案数据目录 exports/ */
    const saveFile = async (defaultName, buffer) => {
      let target = null;
      try {
        const { dialog, BrowserWindow, app } = require('electron');
        const win = deps?.getMainWindow?.() || BrowserWindow.getFocusedWindow() || undefined;
        const res = await dialog.showSaveDialog(win, { defaultPath: join(app.getPath('documents'), defaultName), filters: [{ name: 'Word', extensions: ['docx'] }] });
        if (res.canceled || !res.filePath) return { canceled: true };
        target = res.filePath;
      } catch {
        target = ctx.dataPath(`${D}/exports/${defaultName}`);
        mkdirSync(join(target, '..'), { recursive: true });
      }
      writeFileSync(target, buffer);
      try {
        require('electron').shell.showItemInFolder(target);
      } catch {
        /* 无 electron（单测） */
      }
      return { path: target };
    };
    const stem = (r) => (r.pre?.title || r.fileName.replace(/\.[^.]+$/, '')).replace(/[\\/:*?"<>|]/g, '_').slice(0, 40);

    h('review.exportRevised', async (p) => {
      const r = load(p?.id);
      const acc = (r.review?.risks || []).filter((x) => x.accepted);
      if (!acc.length) throw new Error('还没有采纳任何修订');
      const changes = acc.map((x) => ({
        para: x.location ? x.location.para : null,
        quote: x.location ? x.location.quote : '',
        action: x.action,
        suggestion: x.suggestion,
        note: `【${{ high: '高', medium: '中', low: '低' }[x.level]}风险】${x.reason}${x.fallback ? `\n退让方案：${x.fallback}` : ''}`,
      }));
      const out = buildRevisedDocx(r.paras, changes, { title: r.pre?.title || '' });
      const res = await saveFile(`${stem(r)}-修订稿.docx`, out.buffer);
      return { ...res, applied: out.applied, asComment: out.asComment };
    });

    h('review.exportOpinion', async (p) => {
      const r = load(p?.id);
      if (!r.review) throw new Error('还没有审查结果');
      const name = (id) => clauseTypes.find((c) => c.id === id)?.zh || id;
      const lv = { high: '高', medium: '中', low: '低' };
      const fw = { oneSided: '义务是否单向', exitSymmetric: '退出权是否对等', falsePremise: '是否有虚假或无法核实的前提', breachSymmetric: '违约责任是否对称' };
      const ans = { yes: '是', no: '否', unclear: '不明确' };
      const s = r.summary;
      const blocks = [
        { text: `${r.pre?.title || r.fileName} · 合同审查意见书`, style: 'title' },
        { text: `审查立场：${R.STANCE_LABEL[r.stance.side]}${r.stance.partyName ? `（${r.stance.partyName}）` : ''}　审查模板：${r.review.playbook?.name || ''}`, style: 'note' },
        { text: '一、总体结论', style: 'h1' },
        { text: `${s.verdict}。高风险 ${s.count.high} 项、中风险 ${s.count.medium} 项、低风险 ${s.count.low} 项，缺失条款 ${s.missing} 项，必争 ${s.must} 项；风险指数 ${s.index}（按条数计算）。` },
        r.review.overall ? { text: r.review.overall } : null,
        { text: '二、基本信息', style: 'h1' },
        { table: [['项目', '内容'], ['合同主体', (r.pre?.parties || []).map((x) => `${x.role ? `${x.role}：` : ''}${x.name}`).join('；') || '—'], ['金额', r.pre?.amount || '—'], ['期限', r.pre?.term || '—']] },
        { text: '三、风险清单', style: 'h1' },
        { table: [['等级', '条款', '原文位置', '问题', '修改建议', '必争 / 可让'], ...r.review.risks.map((x) => [lv[x.level], name(x.clauseType), x.location ? `第 ${x.location.para + 1} 段${x.location.page ? ` · 第 ${x.location.page} 页` : ''}` : '新增', x.reason, x.suggestion || '—', x.priority === 'must' ? '必争' : '可让'])] },
        { text: '四、法律依据', style: 'h1' },
        { text: r.review.risks.flatMap((x) => x.legalBasis.map((b) => `${b.law}${b.article}`)).filter((v, i, a) => a.indexOf(v) === i).join('；') || '无' },
        { text: '注：法条只做了格式核对（法律名称存在、条号在该法条数内），条文内容请人工核对。', style: 'note' },
        { text: '五、缺失条款', style: 'h1' },
        { text: r.review.missing.map(name).join('、') || '无' },
        { text: '六、框架四问', style: 'h1' },
        { table: [['问题', '结论', '说明'], ...Object.entries(fw).map(([k, label]) => [label, ans[r.review.framework[k]?.answer] || '不明确', r.review.framework[k]?.note || ''])] },
        { text: `本意见书由 AI 法务生成，供内部参考，不构成正式法律意见；签约前请由执业律师复核。生成时间：${new Date().toLocaleString('zh-CN')}`, style: 'note' },
      ].filter(Boolean);
      return saveFile(`${stem(r)}-审查意见书.docx`, buildDocx(blocks));
    });

    /** LG8 两版对比：上传另一版本，按段落对比 */
    h('review.compare', async (p) => {
      const r = load(p?.id);
      const { name, doc } = await storeUpload(r.id, `v2-${p?.fileName}`, p?.base64);
      const diff = R.compareVersions(r.paras, doc.paras);
      r.compare = { fileName: name, at: Date.now(), diff: diff.slice(0, 500), total: diff.length };
      return save(r);
    });

    ctx.log.info('legal-agent activated');
  },

  deactivate() {},
};
