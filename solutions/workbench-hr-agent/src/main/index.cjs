/**
 * 人事部 · 招聘工作台 主进程入口（hostApi 2，手写 CommonJS）。
 *
 * 七步：① JD 生成与体检 ② 简历批量导入与解析 ③ 三层筛选 ④ 面试题与评分卡 ⑤ 邀约 ⑥ Offer 与入职清单 ⑦ 候选人看板
 * 参照（只借功能与交互，代码自写）：anthropics/knowledge-work-plugins human-resources（Apache-2.0）、miao4ai/open_recruiter（MIT）、
 * sliday/resume-job-matcher（无许可证，只借思路）、srbhr/Resume-Matcher（Apache-2.0）、horilla（LGPL，只借交互）、jsonresume schema（MIT）。
 *
 * 宿主能力（只有本入口能 require host:）：workbenchLlm、documentExtractor（PDF）、electron（保存对话框）。
 * 数据：hr-agent/jobs/<id>.json、hr-agent/files/<jobId>/、hr-agent/settings.json
 * 简历含个人信息，只存在本机账号目录，不上传。邮件只生成草稿，由人复制后发送。
 */
const { writeFileSync, mkdirSync, rmSync, readdirSync, existsSync } = require('node:fs');
const { join, basename, extname } = require('node:path');
const { randomUUID } = require('node:crypto');
const { extractParas } = require('./docText.cjs');
const S = require('./screening.cjs');
const { buildDocx } = require('./docx.cjs');

const D = 'hr-agent';
const MAX_FILE = 15 * 1024 * 1024;
const MAX_BATCH = 200;
const ALLOWED = new Set(['.docx', '.pdf', '.txt', '.md']);
const CONCURRENCY = 3;

function parseJsonLoose(text) {
  const s = String(text || '').replace(/```(?:json)?/gi, '');
  const a = s.indexOf('{');
  const b = s.lastIndexOf('}');
  if (a < 0 || b <= a) throw new Error('模型没有按要求返回结构化结果，请重试');
  return JSON.parse(s.slice(a, b + 1));
}

async function pool(items, limit, fn) {
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (next < items.length) {
        const i = next++;
        await fn(items[i], i);
      }
    }),
  );
}

let llmOverride = null;
let mailOverride = null;
let activityOverride = null;
let clusterOverride = null; // 单测注入假集群

module.exports = {
  hostApi: 2,
  __setLlmForTests(fn) {
    llmOverride = fn;
  },
  /** 单测注入发信 */
  __setMailSenderForTests(fn) {
    mailOverride = fn;
  },
  __setActivityForTests(fn) {
    activityOverride = fn;
  },
  __setClusterForTests(proc) {
    clusterOverride = proc;
  },

  activate(ctx) {
    const deps = ctx.host?.deps || null;
    let llmHost = null;
    let pdf = null;
    if (deps) {
      try {
        const { createWorkbenchLlm } = require('host:apps/desktop-shell/src/main/services/workbenchLlm.ts');
        const wl = createWorkbenchLlm(deps, { logTag: 'hr-agent', moduleModel: () => '' });
        llmHost = async (prompt, timeoutMs = 180_000) => (await wl.llm('hr-agent', prompt, timeoutMs)).text;
      } catch (e) {
        ctx.log.warn(`宿主模型模块不可用：${e.message}`);
      }
      try {
        const { extractDocument } = require('host:apps/desktop-shell/src/main/services/documentExtractor.ts');
        pdf = (file) => extractDocument(file);
      } catch {
        /* 无 PDF 抽取 */
      }
    }
    // HR6 发邀约：与宿主其它工作台同一套（自己的 SMTP 优先，没配走官方代发）；单测可经 __setMailSenderForTests 注入
    let mailHost = null;
    if (deps) {
      try {
        const { sendCaseMail } = require('host:apps/desktop-shell/src/main/services/caseMailSender.ts');
        const relay = deps.serviceAuth?.relaySendMail ? { send: (i) => deps.serviceAuth.relaySendMail(i) } : null;
        mailHost = (input) => sendCaseMail(deps.readEmailCredentials?.() ?? {}, input, relay);
      } catch {
        /* 宿主没有发信模块：只能复制草稿 */
      }
    }
    // LG7 / HR7：长操作期间报给宿主（status.report 带回主控，大屏部门节点下显示细步骤）；旧宿主没有就不报
    let reportActivity = activityOverride || null;
    if (!reportActivity && deps) {
      try {
        reportActivity = require('host:apps/desktop-shell/src/main/services/workbenchActivity.ts').reportWorkbenchActivity;
      } catch {
        reportActivity = null;
      }
    }
    const activity = (key, a) => {
      try {
        reportActivity && reportActivity(key, a);
      } catch {
        /* 上报失败不影响工作台 */
      }
    };
    const llm = async (prompt, timeoutMs) => {
      const fn = llmOverride || llmHost;
      if (!fn) throw new Error('本机模型不可用（宿主未提供模型通道）');
      return fn(prompt, timeoutMs);
    };
    const llmJson = async (prompt) => parseJsonLoose(await llm(prompt));

    const settings = () => ({ company: '北京泰途科技有限公司', thresholds: { advance: 70, hold: 50 }, ...ctx.readJson(`${D}/settings.json`, {}) });
    const jobPath = (id) => `${D}/jobs/${String(id).replace(/[^\w-]/g, '')}.json`;
    const load = (id) => {
      const j = ctx.readJson(jobPath(id), null);
      if (!j) throw new Error('找不到这个岗位');
      return j;
    };
    const save = (j) => {
      j.updatedAt = Date.now();
      ctx.writeJson(jobPath(j.id), j);
      ctx.emit('job-changed', { id: j.id });
      return j;
    };
    const cand = (j, cid) => {
      const c = j.candidates.find((x) => x.id === cid);
      if (!c) throw new Error('找不到这位候选人');
      return c;
    };
    /** 并发批处理期间多个任务同时改同一个岗位：每次重新读、只改自己那位候选人再写回 */
    const patchCandidate = (jobId, cid, fn) => {
      const j = load(jobId);
      const c = cand(j, cid);
      fn(c, j);
      return save(j);
    };

    const h = (name, fn) => ctx.handle(name, fn);

    h('meta', () => ({ settings: settings(), stages: S.STAGES, hasModel: !!(llmOverride || llmHost), canPdf: !!pdf, defaultOnboarding: S.DEFAULT_ONBOARDING, clusterMachines: clusterWorkers().length }));
    h('settings.save', (p) => {
      const cur = ctx.readJson(`${D}/settings.json`, {});
      if (typeof p?.company === 'string' && p.company.trim()) cur.company = p.company.trim().slice(0, 40);
      if (p?.thresholds) {
        const a = Math.min(100, Math.max(0, Number(p.thresholds.advance) || 70));
        const hd = Math.min(a, Math.max(0, Number(p.thresholds.hold) || 50));
        cur.thresholds = { advance: a, hold: hd };
      }
      if (typeof p?.useCluster === 'boolean') cur.useCluster = p.useCluster;
      ctx.writeJson(`${D}/settings.json`, cur);
      return settings();
    });

    h('job.list', () => {
      const dir = ctx.dataPath(`${D}/jobs`);
      if (!existsSync(dir)) return [];
      return readdirSync(dir)
        .filter((f) => f.endsWith('.json'))
        .map((f) => ctx.readJson(`${D}/jobs/${f}`, null))
        .filter(Boolean)
        .map((j) => ({ id: j.id, title: j.title, candidates: j.candidates.length, updatedAt: j.updatedAt }))
        .sort((a, b) => b.updatedAt - a.updatedAt);
    });
    h('job.get', (p) => load(p?.id));
    h('job.remove', (p) => {
      const j = load(p?.id);
      rmSync(ctx.dataPath(jobPath(j.id)), { force: true });
      rmSync(ctx.dataPath(`${D}/files/${j.id}`), { recursive: true, force: true });
      return { ok: true };
    });

    // ① JD
    h('job.create', (p) => {
      const title = String(p?.title || '').trim().slice(0, 40);
      if (!title) throw new Error('请填写岗位名称');
      const info = { dept: String(p.dept || '').slice(0, 30), location: String(p.location || '').slice(0, 30), salary: String(p.salary || '').slice(0, 30), headcount: Math.max(1, Math.min(99, Number(p.headcount) || 1)), notes: String(p.notes || '').slice(0, 1000) };
      return save({ id: `hr-${Date.now().toString(36)}-${randomUUID().slice(0, 4)}`, title, info, jd: '', jdCheck: null, gates: [], dims: [], candidates: [], createdAt: Date.now() });
    });
    h('jd.generate', async (p) => {
      const j = load(p?.id);
      const r = S.normalizeJd(await llmJson(S.jdPrompt({ title: j.title, ...j.info }, settings().company)));
      Object.assign(j, r);
      j.jdCheck = S.checkJd(j.jd, j.gates);
      return save(j);
    });
    h('jd.save', (p) => {
      const j = load(p?.id);
      if (typeof p.jd === 'string') j.jd = p.jd.slice(0, 8000);
      if (Array.isArray(p.gates)) j.gates = p.gates.map((g, i) => ({ id: g.id || `g${i + 1}`, condition: String(g.condition || '').slice(0, 120), severity: g.severity === 'must' ? 'must' : 'prefer' })).filter((g) => g.condition);
      if (Array.isArray(p.dims)) j.dims = S.normalizeWeights(p.dims.map((d, i) => ({ id: d.id || `d${i + 1}`, name: String(d.name || '').slice(0, 30), weight: Number(d.weight) || 0, anchors: Array.from({ length: 5 }, (_, k) => String(d.anchors?.[k] || '').slice(0, 120)) })).filter((d) => d.name));
      j.jdCheck = S.checkJd(j.jd, j.gates);
      return save(j);
    });

    // ② 简历批量导入
    h('resume.upload', async (p) => {
      const j = load(p?.id);
      const files = Array.isArray(p?.files) ? p.files.slice(0, MAX_BATCH) : [];
      if (!files.length) throw new Error('请选择简历文件');
      const dir = ctx.dataPath(`${D}/files/${j.id}`);
      mkdirSync(dir, { recursive: true });
      const added = [];
      const failed = [];
      for (const f of files) {
        const name = basename(String(f.fileName || 'resume.txt')).replace(/[\\/:*?"<>|]/g, '_');
        try {
          if (!ALLOWED.has(extname(name).toLowerCase())) throw new Error('只支持 docx / pdf / txt / md');
          const buf = Buffer.from(String(f.base64 || ''), 'base64');
          if (!buf.length || buf.length > MAX_FILE) throw new Error('文件为空或超过 15MB');
          const cid = `c-${randomUUID().slice(0, 8)}`;
          const file = join(dir, `${cid}${extname(name)}`);
          writeFileSync(file, buf);
          const doc = await extractParas(file, { pdf });
          if (!doc.text.trim()) throw new Error(doc.warning || '没有读到文字');
          added.push({ id: cid, fileName: name, text: doc.text.slice(0, 40000), resume: null, screening: null, stage: 'sourcing', interview: null, invite: null, offer: null, onboarding: null, addedAt: Date.now() });
        } catch (e) {
          failed.push({ fileName: name, error: e.message });
        }
      }
      j.candidates.push(...added);
      save(j);
      return { added: added.length, failed, job: j };
    });

    // HR2 批量走集群分身：本机是主控且有在线员工机时，每份简历的模型调用在「本机 + 各员工机」之间轮流分
    // （员工机用 worker.run 跑同一段提示词）；某台员工机失败的那份回本机重做。可在设置里关掉
    const clusterProc = () => clusterOverride || deps?.clusterDiscoveryProc || null;
    const clusterWorkers = () => {
      const p = clusterProc();
      if (!p || settings().useCluster === false) return [];
      try {
        const self = p.getSelf?.();
        if (!self || self.deploymentRole !== 'orchestrator') return [];
        return (p.getOnlineNodes?.() || []).filter((n) => n.status === 'online' && Array.isArray(n.roles) && n.roles.includes('employee') && n.nodeId !== self.nodeId);
      } catch {
        return [];
      }
    };
    const remoteLlmJson = async (worker, prompt) => {
      const p = clusterProc();
      const id = `hra-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const res = await p.dispatchTask({
        taskId: id,
        idempotencyKey: id,
        targetNodeId: worker.nodeId,
        roleId: 'worker.run',
        priority: 'normal',
        payload: { prompt, timeoutMs: 180_000, dispatcherNodeId: p.getSelf().nodeId },
      });
      if (!res || res.status !== 'success') throw new Error(res?.error || '员工机执行失败');
      return parseJsonLoose(String(res.output?.text || ''));
    };

    /** 批处理：解析 / 筛选，并发 3（有员工机时按机器数放大），推进度；work(cid, ljson) 用 ljson 调模型 */
    const batch = async (jobId, ids, label, work) => {
      const total = ids.length;
      let done = 0;
      const errors = [];
      const workers = clusterWorkers();
      const slots = [null, ...workers]; // null = 本机
      const dist = { machines: slots.length, remote: 0, fallback: 0 };
      let next = 0;
      const ljsonFor = () => {
        const slot = slots[next++ % slots.length];
        if (!slot) return llmJson;
        return async (prompt) => {
          try {
            const r = await remoteLlmJson(slot, prompt);
            dist.remote++;
            return r;
          } catch (e) {
            dist.fallback++;
            ctx.log.warn(`员工机 ${slot.nodeId} 处理失败，回本机重做：${e.message}`);
            return llmJson(prompt);
          }
        };
      };
      const key = `hr:${jobId}:${label}`;
      ctx.emit('progress', { jobId, label, done, total });
      activity(key, { legionId: 'legion-hr', label, done, total });
      try {
        await pool(ids, CONCURRENCY * slots.length, async (cid) => {
          try {
            await work(cid, ljsonFor());
          } catch (e) {
            errors.push({ id: cid, error: e.message });
          }
          done++;
          ctx.emit('progress', { jobId, label, done, total });
          activity(key, { legionId: 'legion-hr', label, done, total });
        });
      } finally {
        activity(key, null);
      }
      return { job: load(jobId), errors, cluster: workers.length ? dist : null };
    };

    h('resume.parse', async (p) => {
      const j = load(p?.id);
      const ids = (Array.isArray(p.ids) && p.ids.length ? p.ids : j.candidates.filter((c) => !c.resume).map((c) => c.id)).filter((id) => j.candidates.some((c) => c.id === id));
      return batch(j.id, ids, '解析', async (cid, ljson) => {
        const text = cand(load(j.id), cid).text;
        const resume = S.normalizeResume(await ljson(S.resumePrompt(text)), text);
        patchCandidate(j.id, cid, (c) => {
          c.resume = resume;
        });
      });
    });

    // ③ 三层筛选：① 关键词预筛（技能命中）② 门禁 ③ 打分
    h('screen.run', async (p) => {
      const j = load(p?.id);
      if (!j.gates.length && !j.dims.length) throw new Error('请先在第 1 步生成或填写筛选标准');
      const th = settings().thresholds;
      const ids = (Array.isArray(p.ids) && p.ids.length ? p.ids : j.candidates.filter((c) => c.stage !== 'rejected' || !c.screening).map((c) => c.id)).filter((id) => j.candidates.some((c) => c.id === id));
      // 第一层关键词预筛（可选）：一个关键词都没命中的直接淘汰，不调模型；理由写明是预筛
      const keywords = (Array.isArray(p.keywords) ? p.keywords : []).map((k) => String(k).trim().toLowerCase()).filter(Boolean).slice(0, 30);
      // HR3 向量预筛（可选）：按与岗位要求的相似度只保留前 vectorKeep（0.4 / 0.6 / 0.8），其余不调模型
      const keepRatio = [0.4, 0.6, 0.8].includes(Number(p.vectorKeep)) ? Number(p.vectorKeep) : 0;
      const vec = keepRatio ? S.vectorPrefilter(j, j.candidates.filter((c) => ids.includes(c.id)), keepRatio) : null;
      return batch(j.id, ids, '筛选', async (cid, ljson) => {
        const job = load(j.id);
        const text = cand(job, cid).text;
        if (vec && !vec.keep.has(cid)) {
          patchCandidate(j.id, cid, (c) => {
            c.screening = { gates: [], scores: [], total: 0, decision: 'reject', why: `向量预筛：与岗位要求的相似度 ${vec.scores.get(cid)}，不在前 ${Math.round(keepRatio * 100)}%`, flags: ['未经模型评估，可手动改回'], highlights: [], gaps: [], prefiltered: true, similarity: vec.scores.get(cid), at: Date.now() };
            if (c.stage === 'sourcing' || c.stage === 'screening') c.stage = 'rejected';
          });
          return;
        }
        if (keywords.length && !keywords.some((k) => text.toLowerCase().includes(k))) {
          patchCandidate(j.id, cid, (c) => {
            c.screening = { gates: [], scores: [], total: 0, decision: 'reject', why: `关键词预筛未命中：${keywords.join('、')}`, flags: ['未经模型评估，可手动改回'], highlights: [], gaps: [], prefiltered: true, at: Date.now() };
            if (c.stage === 'sourcing' || c.stage === 'screening') c.stage = 'rejected';
          });
          return;
        }
        const result = S.normalizeScreening(await ljson(S.screenPrompt(job, text)), job, text, th);
        patchCandidate(j.id, cid, (c) => {
          c.screening = { ...result, at: Date.now() };
          if (c.stage === 'sourcing') c.stage = result.decision === 'reject' ? 'rejected' : 'screening';
        });
      });
    });

    h('candidate.stage', (p) => {
      if (!S.STAGES.includes(p?.stage)) throw new Error('阶段不对');
      return patchCandidate(p.id, p.candidateId, (c) => {
        c.stage = p.stage;
        if (p.stage === 'onboarding' && !c.onboarding) c.onboarding = S.DEFAULT_ONBOARDING.map((item) => ({ item, done: false }));
      });
    });
    h('candidate.remove', (p) => {
      const j = load(p?.id);
      j.candidates = j.candidates.filter((c) => c.id !== p.candidateId);
      return save(j);
    });

    // ④ 面试
    h('interview.generate', async (p) => {
      const j = load(p?.id);
      const c = cand(j, p.candidateId);
      const r = S.normalizeInterview(await llmJson(S.interviewPrompt(j, c)), j);
      return patchCandidate(j.id, c.id, (x) => {
        x.interview = r;
        if (x.stage === 'screening' || x.stage === 'sourcing') x.stage = 'interview';
      });
    });
    h('interview.score', (p) =>
      patchCandidate(p.id, p.candidateId, (c) => {
        const row = c.interview?.scorecard?.find((s) => s.dimension === p.dimension);
        if (!row) throw new Error('评分卡里没有这个维度');
        row.score = p.score == null ? null : Math.max(0, Math.min(4, Math.round(Number(p.score))));
        row.note = String(p.note ?? row.note).slice(0, 300);
        const rows = c.interview.scorecard.filter((s) => s.score != null);
        c.interview.total = rows.length ? Math.round(rows.reduce((n, s) => n + (s.weight * s.score) / 4, 0) * 10) / 10 : null;
      }),
    );

    // ⑤ 邀约：生成草稿 → 人改 → 人点两次确认才真发（invite.send）；也可复制到自己邮箱发
    h('invite.generate', async (p) => {
      const j = load(p?.id);
      const c = cand(j, p.candidateId);
      const r = await llmJson(S.invitePrompt(j, c, settings().company));
      return patchCandidate(j.id, c.id, (x) => {
        x.invite = { subject: String(r.subject || '').slice(0, 120), body: String(r.body || '').slice(0, 4000), status: 'draft' };
      });
    });
    h('invite.send', async (p) => {
      const send = mailOverride || mailHost;
      if (!send) throw new Error('本机没有发信通道，请复制草稿到邮箱发送');
      const j = load(p?.id);
      const c = cand(j, p.candidateId);
      const inv = c.invite;
      if (!inv || !inv.subject || !inv.body) throw new Error('先生成并保存邀约邮件');
      if (/【请填写】/.test(inv.subject + inv.body)) throw new Error('正文里还有「【请填写】」没补，补完再发');
      const to = String(p.to || c.resume?.basics?.email || '').trim();
      if (!/^[\w.+-]+@[\w-]+(\.[\w-]+)+$/.test(to)) throw new Error('收件地址不对，请填候选人的邮箱');
      if (inv.status === 'sent' && p.resend !== true) throw new Error('已经发过了；确实要再发一次请点「再次发送」');
      const r = await send({ to: [to], subject: inv.subject, body: inv.body });
      if (!r || !r.ok) throw new Error(r?.message || '发送失败');
      ctx.log.info(`邀约已发送（${r.via || 'self'}）`);
      return patchCandidate(j.id, c.id, (x) => {
        x.invite = { ...x.invite, status: 'sent', sentTo: to, sentAt: Date.now(), via: r.via || 'self', messageId: r.messageId || '', notice: r.notice || '' };
        if (x.stage === 'screening' || x.stage === 'sourcing') x.stage = 'interview';
      });
    });
    h('invite.save', (p) =>
      patchCandidate(p.id, p.candidateId, (c) => {
        c.invite = { ...(c.invite || {}), subject: String(p.subject || '').slice(0, 120), body: String(p.body || '').slice(0, 4000), status: ['draft', 'sent', 'replied'].includes(p.status) ? p.status : 'draft' };
      }),
    );

    // ⑥ Offer 与入职
    h('offer.generate', async (p) => {
      const j = load(p?.id);
      const c = cand(j, p.candidateId);
      const terms = { salary: String(p.salary || '').slice(0, 40), startDate: String(p.startDate || '').slice(0, 20), probation: String(p.probation || '').slice(0, 20) };
      const text = (await llm(S.offerPrompt(j, c, terms, settings().company))).trim().slice(0, 6000);
      return patchCandidate(j.id, c.id, (x) => {
        x.offer = { ...terms, text, status: 'draft' };
        if (x.stage !== 'onboarding') x.stage = 'offer';
      });
    });
    h('offer.save', (p) =>
      patchCandidate(p.id, p.candidateId, (c) => {
        if (!c.offer) throw new Error('还没有 offer');
        c.offer.text = String(p.text ?? c.offer.text).slice(0, 6000);
      }),
    );
    h('onboarding.toggle', (p) =>
      patchCandidate(p.id, p.candidateId, (c) => {
        if (!c.onboarding) c.onboarding = S.DEFAULT_ONBOARDING.map((item) => ({ item, done: false }));
        if (typeof p.add === 'string' && p.add.trim()) c.onboarding.push({ item: p.add.trim().slice(0, 80), done: false });
        else if (Number.isInteger(p.index) && c.onboarding[p.index]) c.onboarding[p.index].done = !!p.done;
      }),
    );

    // 导出
    const saveFile = async (defaultName, buffer, ext) => {
      let target;
      try {
        const { dialog, BrowserWindow, app } = require('electron');
        const win = deps?.getMainWindow?.() || BrowserWindow.getFocusedWindow() || undefined;
        const res = await dialog.showSaveDialog(win, { defaultPath: join(app.getPath('documents'), defaultName), filters: [{ name: ext.toUpperCase(), extensions: [ext] }] });
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
        /* 单测无 electron */
      }
      return { path: target };
    };
    h('offer.export', async (p) => {
      const j = load(p?.id);
      const c = cand(j, p.candidateId);
      if (!c.offer?.text) throw new Error('还没有 offer');
      const blocks = [{ text: '录用通知书', style: 'title' }, ...c.offer.text.split(/\n{2,}/).map((t) => ({ text: t })), { text: settings().company, style: 'h2' }];
      return saveFile(`${c.resume?.basics?.name || '候选人'}-${j.title}-录用通知书.docx`, buildDocx(blocks), 'docx');
    });
    h('screen.export', async (p) => {
      const j = load(p?.id);
      const csvCell = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
      const head = ['姓名', '文件', '阶段', '决定', '总分', ...j.gates.map((g) => `${g.severity === 'must' ? '[必备]' : '[加分]'}${g.condition}`), ...j.dims.map((d) => `${d.name}(${d.weight})`), '说明', '需复核'];
      const stageName = { sourcing: '寻源', screening: '筛选', interview: '面试', offer: 'Offer', onboarding: '入职', rejected: '淘汰' };
      const dec = { advance: '推进', hold: '待定', reject: '淘汰' };
      const verdict = { met: '满足', unmet: '不满足', unknown: '未知' };
      const rows = j.candidates.map((c) => [c.resume?.basics?.name || '', c.fileName, stageName[c.stage], dec[c.screening?.decision] || '', c.screening?.total ?? '', ...j.gates.map((g) => verdict[c.screening?.gates.find((x) => x.id === g.id)?.verdict] || ''), ...j.dims.map((d) => c.screening?.scores.find((x) => x.id === d.id)?.score ?? ''), c.screening?.why || '', (c.screening?.flags || []).join('；')]);
      const csv = `﻿${[head, ...rows].map((r) => r.map(csvCell).join(',')).join('\r\n')}`;
      return saveFile(`${j.title}-筛选表.csv`, Buffer.from(csv, 'utf8'), 'csv');
    });

    ctx.log.info('hr-agent activated');
  },

  deactivate() {},
};
