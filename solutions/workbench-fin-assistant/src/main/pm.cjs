/**
 * AI 项目管理（纯逻辑，可单测）：全生命周期进度跟踪、日报周报自动生成、项目工具集成、需求管理 AI 化。
 *
 *   事实层（程序算，不靠模型）：git 提交 / 合并、任务状态与流转、逾期、会议纪要里的决议与待办 → 汇总成「当日事实」
 *   生成层（模型写）：只按事实写日报周报，数字必须出自事实（index.cjs 用 L.unverifiedNumbers 核对）
 *   工具集成：Jira / TAPD / 禅道按各自 REST 接口取任务（字段映射在这里），其它系统导出 CSV 进来，或经智能问数零侵入取数
 *   需求管理：程序先查需求文字里的含糊词、缺验收标准、缺角色；模型再做评审与拆任务（瀑布 / 敏捷 / DevOps 三种拆法）
 */

const STAGES = ['立项', '需求', '设计', '开发', '测试', '投产', '运维'];
const METHODS = { waterfall: '瀑布', agile: '敏捷', devops: 'DevOps' };
const DONE_RE = /^(done|closed|resolved|已完成|已关闭|已解决|完成|关闭|已上线|resolved)$/i;
const BLOCK_RE = /(阻塞|blocked|挂起|暂停|on hold)/i;

// ── git ──

/** 解析 `git log --pretty=format:%x1e%H%x1f%an%x1f%ad%x1f%s --date=iso-strict --numstat` 的输出（每条提交以 \x1e 开头，后面跟它自己的 numstat） */
function parseGitLog(out) {
  const commits = [];
  for (const block of String(out || '').split('\x1e')) {
    const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);
    if (!lines.length) continue;
    const [hash, author, date, subject] = lines[0].split('\x1f');
    if (!hash || !date) continue;
    let add = 0; let del = 0; let files = 0;
    for (const l of lines.slice(1)) { const m = /^(\d+|-)\t(\d+|-)\t/.exec(l); if (m) { files += 1; add += m[1] === '-' ? 0 : Number(m[1]); del += m[2] === '-' ? 0 : Number(m[2]); } }
    commits.push({ hash: hash.slice(0, 10), author: author || '', date, subject: String(subject || '').slice(0, 200), add, del, files, merge: /^Merge (pull request|branch|remote-tracking)|合并分支|合并请求/i.test(subject || '') });
  }
  return commits;
}

// ── 任务系统 ──

/** 各工具的取数接口与字段映射（只读；令牌由 index.cjs 加密保存、调用时放进头里） */
const TOOL_ADAPTERS = {
  jira: {
    label: 'Jira',
    request: (c) => ({ url: `${c.baseUrl.replace(/\/$/, '')}/rest/api/2/search?jql=${encodeURIComponent(c.query || `project=${c.project}`)}&maxResults=200&fields=summary,status,assignee,duedate,updated,priority`, headers: { Authorization: c.email ? `Basic ${Buffer.from(`${c.email}:${c.token}`).toString('base64')}` : `Bearer ${c.token}` } }),
    map: (j) => (j.issues || []).map((i) => ({ id: i.key, title: i.fields?.summary, status: i.fields?.status?.name, owner: i.fields?.assignee?.displayName || '', due: i.fields?.duedate || '', updated: i.fields?.updated || '', priority: i.fields?.priority?.name || '' })),
  },
  tapd: {
    label: 'TAPD',
    request: (c) => ({ url: `https://api.tapd.cn/stories?workspace_id=${encodeURIComponent(c.project)}&limit=200`, headers: { Authorization: `Basic ${Buffer.from(`${c.email}:${c.token}`).toString('base64')}` } }),
    map: (j) => (j.data || []).map((x) => x.Story || x).map((s) => ({ id: String(s.id), title: s.name, status: s.status, owner: s.owner || '', due: s.due || '', updated: s.modified || '', priority: s.priority || '' })),
  },
  zentao: {
    label: '禅道',
    request: (c) => ({ url: `${c.baseUrl.replace(/\/$/, '')}/api.php/v1/projects/${encodeURIComponent(c.project)}/tasks?limit=500`, headers: { Token: c.token } }),
    map: (j) => (j.tasks || []).map((t) => ({ id: String(t.id), title: t.name, status: t.status, owner: t.assignedTo?.realname || t.assignedTo || '', due: t.deadline || '', updated: t.lastEditedDate || '', priority: String(t.pri || '') })),
  },
  ones: {
    label: 'ONES',
    request: (c) => ({ url: `${c.baseUrl.replace(/\/$/, '')}/project/api/project/team/${encodeURIComponent(c.team || '')}/items/graphql`, headers: { 'Ones-User-Id': c.email, 'Ones-Auth-Token': c.token, 'content-type': 'application/json' }, method: 'POST', body: JSON.stringify({ query: `{ tasks(filter: { project_in: ["${c.project}"] }) { uuid name status { name } assign { name } deadline serverUpdateStamp } }` }) }),
    map: (j) => (j.data?.tasks || []).map((t) => ({ id: t.uuid, title: t.name, status: t.status?.name || '', owner: t.assign?.name || '', due: t.deadline ? new Date(t.deadline * 1000).toISOString().slice(0, 10) : '', updated: t.serverUpdateStamp ? new Date(t.serverUpdateStamp / 1000).toISOString() : '', priority: '' })),
  },
};

/** CSV / Excel 导出的任务表：按常见列名认列（中英文都认） */
const COLS = { id: ['ID', '编号', 'Key', '任务ID', '需求ID'], title: ['标题', '名称', 'Summary', '任务名称', '需求名称', 'Title'], status: ['状态', 'Status'], owner: ['负责人', '处理人', 'Assignee', '指派给', 'Owner'], due: ['截止日期', '到期日', 'Due Date', 'Deadline', '计划完成'], updated: ['更新时间', 'Updated', '最后修改'] };
function mapTaskRows(rows) {
  const pick = (r, keys) => { for (const k of keys) { const hit = Object.keys(r).find((x) => x.trim().toLowerCase() === k.toLowerCase()); if (hit && r[hit] != null && String(r[hit]).trim() !== '') return String(r[hit]).trim(); } return ''; };
  return (rows || []).map((r, i) => ({ id: pick(r, COLS.id) || `T${i + 1}`, title: pick(r, COLS.title), status: pick(r, COLS.status), owner: pick(r, COLS.owner), due: pick(r, COLS.due).slice(0, 10), updated: pick(r, COLS.updated), priority: '' })).filter((t) => t.title);
}

/** 两次快照之间的任务流转：新增、状态变化、完成 */
function taskTransitions(prev, cur) {
  const before = new Map((prev || []).map((t) => [t.id, t]));
  const out = [];
  for (const t of cur || []) {
    const p = before.get(t.id);
    if (!p) out.push({ id: t.id, title: t.title, from: '', to: t.status, kind: 'new' });
    else if (p.status !== t.status) out.push({ id: t.id, title: t.title, from: p.status, to: t.status, kind: DONE_RE.test(t.status) ? 'done' : 'moved' });
  }
  return out;
}

// ── 会议纪要 ──

/** 纪要里的决议 / 待办（按行认：决议、结论、待办、负责人、截止） */
function minutesItems(text) {
  const lines = String(text || '').split('\n').map((l) => l.trim()).filter(Boolean);
  return {
    decisions: lines.filter((l) => /^(决议|结论|决定)[:：]/.test(l)).map((l) => l.replace(/^(决议|结论|决定)[:：]\s*/, '')).slice(0, 20),
    todos: lines.filter((l) => /^(待办|行动项|TODO)[:：]/i.test(l) || /负责.{0,20}(前|之前)完成/.test(l)).map((l) => l.replace(/^(待办|行动项|TODO)[:：]\s*/i, '')).slice(0, 20),
  };
}

// ── 进度与风险 ──

function progressOf(project, tasks, today) {
  const total = (tasks || []).length;
  const done = (tasks || []).filter((t) => DONE_RE.test(t.status || '')).length;
  const overdue = (tasks || []).filter((t) => t.due && t.due < today && !DONE_RE.test(t.status || ''));
  const blocked = (tasks || []).filter((t) => BLOCK_RE.test(t.status || ''));
  const stageIdx = Math.max(0, STAGES.indexOf(project.stage));
  // 计划进度：按起止日期线性估算，用来和完成率比
  let planned = null;
  if (project.startDate && project.endDate && project.endDate > project.startDate) {
    const span = Date.parse(project.endDate) - Date.parse(project.startDate);
    planned = Math.min(1, Math.max(0, (Date.parse(today) - Date.parse(project.startDate)) / span));
  }
  return { total, done, rate: total ? done / total : 0, overdue, blocked, stageIdx, planned };
}

/** 风险预警（规则，可解释）：逾期、阻塞、进度落后计划、成员多日无提交、阶段超期 */
function risksOf(project, tasks, commits, today, { idleDays = 3 } = {}) {
  const p = progressOf(project, tasks, today);
  const out = [];
  if (p.overdue.length) out.push({ level: p.overdue.length >= 3 ? 'high' : 'medium', text: `${p.overdue.length} 项任务已逾期：${p.overdue.slice(0, 3).map((t) => t.title).join('、')}${p.overdue.length > 3 ? ' 等' : ''}` });
  if (p.blocked.length) out.push({ level: 'high', text: `${p.blocked.length} 项任务处于阻塞：${p.blocked.slice(0, 3).map((t) => t.title).join('、')}` });
  if (p.planned != null && p.total && p.rate + 0.15 < p.planned) out.push({ level: 'medium', text: `完成率 ${(p.rate * 100).toFixed(0)}%，落后计划进度 ${(p.planned * 100).toFixed(0)}%` });
  const since = new Date(Date.parse(today) - idleDays * 86400_000).toISOString().slice(0, 10);
  for (const m of project.members || []) {
    if (!(commits || []).some((c) => c.author === m && c.date.slice(0, 10) >= since) && (commits || []).some((c) => c.author === m)) out.push({ level: 'low', text: `${m} 已 ${idleDays} 天没有提交` });
  }
  if (project.stageDue && project.stageDue < today) out.push({ level: 'medium', text: `「${project.stage}」阶段计划 ${project.stageDue} 结束，已超期` });
  return out;
}

/** 某一天 / 某一周的事实汇总（日报周报只能用这里的数字） */
function reportFacts({ project, commits, tasks, prevTasks, minutes, from, to, today }) {
  const inRange = (d) => { const x = String(d || '').slice(0, 10); return x >= from && x <= to; };
  const cs = (commits || []).filter((c) => inRange(c.date));
  const byAuthor = {};
  for (const c of cs) { byAuthor[c.author] = byAuthor[c.author] || { commits: 0, add: 0, del: 0 }; byAuthor[c.author].commits += 1; byAuthor[c.author].add += c.add; byAuthor[c.author].del += c.del; }
  const trans = taskTransitions(prevTasks, tasks);
  const mi = minutesItems((minutes || []).filter((m) => inRange(m.date)).map((m) => m.text).join('\n'));
  const prog = progressOf(project, tasks, today);
  return {
    project: project.name, stage: project.stage, from, to,
    commits: cs.length, merges: cs.filter((c) => c.merge).length,
    linesAdded: cs.reduce((a, c) => a + c.add, 0), linesDeleted: cs.reduce((a, c) => a + c.del, 0),
    byAuthor, subjects: cs.filter((c) => !c.merge).slice(0, 30).map((c) => `${c.author}：${c.subject}`),
    transitions: trans.length, done: trans.filter((t) => t.kind === 'done').map((t) => t.title).slice(0, 20), moved: trans.filter((t) => t.kind !== 'done').map((t) => `${t.title}（${t.from || '新建'}→${t.to}）`).slice(0, 20),
    taskTotal: prog.total, taskDone: prog.done, completion: `${(prog.rate * 100).toFixed(0)}%`,
    overdue: prog.overdue.map((t) => `${t.title}（${t.owner || '未指派'}，${t.due}）`).slice(0, 10),
    decisions: mi.decisions, todos: mi.todos,
    risks: risksOf(project, tasks, commits, today).map((r) => r.text),
  };
}

/** 事实 → 给模型看的文字（也是数字核对的依据） */
function factsText(f) {
  return [
    `项目：${f.project}（当前阶段：${f.stage}）  区间：${f.from} 至 ${f.to}`,
    `代码：提交 ${f.commits} 次，其中合并请求 ${f.merges} 个；新增 ${f.linesAdded} 行，删除 ${f.linesDeleted} 行`,
    `按人：${Object.entries(f.byAuthor).map(([a, x]) => `${a} 提交 ${x.commits} 次`).join('；') || '无'}`,
    `提交说明：\n${f.subjects.join('\n') || '无'}`,
    `任务：共 ${f.taskTotal} 项，已完成 ${f.taskDone} 项（完成率 ${f.completion}）；本期流转 ${f.transitions} 项`,
    `本期完成：${f.done.join('、') || '无'}`,
    `状态变化：${f.moved.join('、') || '无'}`,
    `逾期：${f.overdue.join('、') || '无'}`,
    `会议决议：${f.decisions.join('；') || '无'}`,
    `会议待办：${f.todos.join('；') || '无'}`,
    `风险：${f.risks.join('；') || '无'}`,
  ].join('\n');
}

// ── 需求管理 ──

const VAGUE = ['尽快', '适当', '友好', '大概', '左右', '等等', '及时', '合理', '灵活', '尽可能', '必要时', '相关', '一定程度', '优化体验', '快速', '高效', '方便'];
/** 程序先查（不靠模型）：含糊词、缺验收标准、缺角色 / 场景、缺非功能要求 */
function lintRequirement(text) {
  const s = String(text || '');
  const issues = [];
  const vague = VAGUE.filter((w) => s.includes(w));
  if (vague.length) issues.push({ level: 'medium', kind: 'vague', text: `含糊表述：${vague.join('、')}（改成可度量的说法，如「3 秒内」「不超过 5 步」）` });
  if (!/验收|验收标准|Given|当.{0,20}时.{0,20}(应|则)|期望结果/.test(s)) issues.push({ level: 'high', kind: 'acceptance', text: '没有验收标准：每条功能都要写清「在什么情况下、做什么、得到什么结果」' });
  if (!/(用户|客户|客户经理|柜员|管理员|审批人|运营|作为)/.test(s)) issues.push({ level: 'medium', kind: 'role', text: '没写清给谁用（角色）' });
  if (!/(性能|并发|响应|安全|权限|审计|可用性|兼容|日志)/.test(s)) issues.push({ level: 'low', kind: 'nfr', text: '没提非功能要求（性能、安全、权限、审计等）' });
  if (s.replace(/\s/g, '').length < 60) issues.push({ level: 'high', kind: 'short', text: '需求太短，信息不够做评审和拆解' });
  return issues;
}

/** 模型拆出的任务规整：限定字段、估时取正数、按拆法校验类型 */
function normalizeBreakdown(raw, method) {
  const list = Array.isArray(raw?.tasks) ? raw.tasks : Array.isArray(raw) ? raw : [];
  const types = { waterfall: STAGES.slice(1, 6), agile: ['用户故事', '任务', '缺陷', 'Spike'], devops: ['开发', '代码评审', '自动化测试', '流水线', '发布', '监控'] }[method] || [];
  return list.slice(0, 60).map((t, i) => ({
    no: i + 1,
    title: String(t?.title || '').slice(0, 80),
    type: types.includes(t?.type) ? t.type : types[0] || '任务',
    detail: String(t?.detail || '').slice(0, 300),
    acceptance: String(t?.acceptance || '').slice(0, 300),
    estimate: Math.max(0, Math.min(200, Math.round(Number(t?.estimate) * 10) / 10 || 0)),
    unit: method === 'agile' ? '故事点' : '人天',
    dependsOn: Array.isArray(t?.dependsOn) ? t.dependsOn.map(Number).filter((n) => n > 0 && n <= i).slice(0, 5) : [],
  })).filter((t) => t.title);
}

/** 拆好的任务导出 CSV（Jira / TAPD / 禅道都能按列导入） */
function breakdownCsv(tasks) {
  const cols = ['序号', '标题', '类型', '说明', '验收标准', '估算', '单位', '依赖'];
  const esc = (v) => { const s = String(v ?? ''); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
  return `﻿${[cols, ...(tasks || []).map((t) => [t.no, t.title, t.type, t.detail, t.acceptance, t.estimate, t.unit, t.dependsOn.join(' ')])].map((r) => r.map(esc).join(',')).join('\n')}\n`;
}

/** 企业微信 / 钉钉 / 飞书群机器人：按地址认平台，拼 markdown 消息体 */
function imPayload(webhook, title, markdown) {
  const u = String(webhook || '');
  if (/qyapi\.weixin\.qq\.com/.test(u)) return { msgtype: 'markdown', markdown: { content: `### ${title}\n${markdown}`.slice(0, 4000) } };
  if (/oapi\.dingtalk\.com/.test(u)) return { msgtype: 'markdown', markdown: { title, text: `### ${title}\n${markdown}`.slice(0, 5000) } };
  if (/open\.feishu\.cn|open\.larksuite\.com/.test(u)) return { msg_type: 'text', content: { text: `${title}\n${markdown}`.slice(0, 4000) } };
  return { title, text: markdown };
}

module.exports = { STAGES, METHODS, DONE_RE, TOOL_ADAPTERS, parseGitLog, mapTaskRows, taskTransitions, minutesItems, progressOf, risksOf, reportFacts, factsText, lintRequirement, normalizeBreakdown, breakdownCsv, imPayload, VAGUE };
