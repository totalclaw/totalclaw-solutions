/**
 * 运营中心的补充能力（纯函数，便于单测）：
 *   D6 演示公司资料包    —— 读包内 resources/demo-pack/*.md，拼成提示词里的「公司资料」块
 *   O6 来信文件夹        —— 解析放进文件夹的 .eml / .txt / .md，变成来源 = 来信 的任务
 *   D5 剧本调优表        —— 每步耗时、机器、产出字数，用于把主剧本压到 8 分钟内
 *   O14 成本看板         —— 按部门统计（演示口径：token 按字数估算，等效人工按每步折合分钟 × 时薪）
 *   O12 考卷汇总         —— 按领域统计通过 / 部分 / 不通过与覆盖率，出 Markdown 报告
 */
const { readFileSync, readdirSync, existsSync, statSync } = require('node:fs');
const { join, extname, basename } = require('node:path');

// ── D6 ──
const DEMO_PACK_MAX = 3200;

function loadDemoPack(dir) {
  if (!existsSync(dir)) return '';
  const parts = readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .sort()
    .map((f) => readFileSync(join(dir, f), 'utf8').trim());
  const text = parts.join('\n\n');
  return text.length > DEMO_PACK_MAX ? `${text.slice(0, DEMO_PACK_MAX)}\n…（资料包后文略）` : text;
}

// ── O6 ──
const MAIL_EXT = new Set(['.eml', '.txt', '.md']);
const MAIL_MAX_BYTES = 2 * 1024 * 1024;

function decodeQuotedPrintable(s) {
  const bytes = [];
  const t = s.replace(/=\r?\n/g, '');
  for (let i = 0; i < t.length; i++) {
    if (t[i] === '=' && /^[0-9A-Fa-f]{2}$/.test(t.slice(i + 1, i + 3))) {
      bytes.push(parseInt(t.slice(i + 1, i + 3), 16));
      i += 2;
    } else bytes.push(...Buffer.from(t[i], 'utf8'));
  }
  return Buffer.from(bytes).toString('utf8');
}

/** RFC 2047 编码的标题：=?UTF-8?B?...?= / =?UTF-8?Q?...?= */
function decodeHeader(v) {
  return String(v || '').replace(/=\?([^?]+)\?([BbQq])\?([^?]*)\?=/g, (_, _cs, enc, data) => {
    try {
      if (enc.toUpperCase() === 'B') return Buffer.from(data, 'base64').toString('utf8');
      return decodeQuotedPrintable(data.replace(/_/g, ' '));
    } catch {
      return data;
    }
  });
}

/**
 * 解析一封来信。.eml 只取主题、发件人和第一个纯文本正文（不处理附件）；.txt / .md 首行当主题。
 * @returns {{ subject: string, from: string, body: string }}
 */
function parseMailFile(raw, fileName) {
  const text = String(raw || '').replace(/^﻿/, '');
  if (extname(fileName).toLowerCase() !== '.eml') {
    const lines = text.split(/\r?\n/);
    const first = lines.find((l) => l.trim()) || basename(fileName);
    return { subject: first.replace(/^#+\s*/, '').trim().slice(0, 80), from: '', body: text.trim().slice(0, 4000) };
  }
  const split = text.search(/\r?\n\r?\n/);
  const head = split >= 0 ? text.slice(0, split) : text;
  let body = split >= 0 ? text.slice(split).trim() : '';
  const headers = {};
  for (const line of head.replace(/\r?\n[ \t]+/g, ' ').split(/\r?\n/)) {
    const m = /^([\w-]+):\s*(.*)$/.exec(line);
    if (m) headers[m[1].toLowerCase()] = m[2];
  }
  const ctype = headers['content-type'] || '';
  const boundary = /boundary="?([^";]+)"?/i.exec(ctype)?.[1];
  let enc = (headers['content-transfer-encoding'] || '').toLowerCase();
  if (boundary) {
    const part = body
      .split(`--${boundary}`)
      .map((p) => p.trim())
      .find((p) => /content-type:\s*text\/plain/i.test(p));
    if (part) {
      const ps = part.search(/\r?\n\r?\n/);
      const ph = part.slice(0, ps);
      enc = (/content-transfer-encoding:\s*([\w-]+)/i.exec(ph)?.[1] || '').toLowerCase();
      body = part.slice(ps).trim();
    } else body = '';
  }
  if (enc === 'base64') {
    try {
      body = Buffer.from(body.replace(/\s+/g, ''), 'base64').toString('utf8');
    } catch {
      /* 保持原文 */
    }
  } else if (enc === 'quoted-printable') body = decodeQuotedPrintable(body);
  return { subject: decodeHeader(headers.subject || '').slice(0, 80) || basename(fileName), from: decodeHeader(headers.from || '').slice(0, 80), body: body.trim().slice(0, 4000) };
}

/** 文件夹里新到的来信（按文件名 + 修改时间去重） */
function scanMailFolder(dir, seen) {
  if (!dir || !existsSync(dir)) return [];
  const out = [];
  for (const f of readdirSync(dir).sort()) {
    if (!MAIL_EXT.has(extname(f).toLowerCase()) || f.startsWith('.')) continue;
    const abs = join(dir, f);
    let st;
    try {
      st = statSync(abs);
    } catch {
      continue;
    }
    if (!st.isFile() || st.size > MAIL_MAX_BYTES) continue;
    const key = `${f}@${Math.round(st.mtimeMs)}`;
    if (seen.has(key)) continue;
    out.push({ key, file: abs, name: f });
  }
  return out;
}

function mailToTask(mail) {
  const head = `来信${mail.from ? `（${mail.from}）` : ''}：${mail.subject}`;
  return { title: head.slice(0, 60), text: `${head}\n\n${mail.body.slice(0, 1500)}\n\n请判断这封来信该由哪个部门处理并给出处理意见（回复草稿、转交事项）；涉及付款、签约的只准备材料。`, source: 'mail' };
}

// ── D5 ──
/** @param tasks 任务记录（runner.record 的形状），只取 since 之后创建的 */
function tuningRows(tasks, since = 0) {
  const rows = [];
  for (const t of tasks.filter((x) => (x.createdAt || 0) >= since).sort((a, b) => a.createdAt - b.createdAt)) {
    for (const s of t.plan?.steps || []) {
      const o = (t.outputs || {})[s.id] || {};
      rows.push({ taskNo: t.no, title: t.title, legionId: s.legionId, goal: s.goal, machine: o.machine || '', ms: o.ms ?? null, chars: o.text ? o.text.length : 0, ok: !o.error, error: o.error || null });
    }
  }
  const done = tasks.filter((x) => (x.createdAt || 0) >= since && x.finishedAt);
  const span = done.length ? Math.max(...done.map((x) => x.finishedAt)) - Math.min(...done.map((x) => x.createdAt)) : 0;
  const slow = rows.filter((r) => r.ms != null).sort((a, b) => b.ms - a.ms).slice(0, 5);
  return { rows, totalMs: span, tasks: done.length, slowest: slow };
}

// ── O14 ──
const COST_DEFAULTS = { yuanPer1kTokens: 0.004, tokensPerChar: 1.6, minutesPerStep: 30, hourlyWage: 60 };

/** 按部门汇总（演示口径）。tasks 取本月；字数来自各步产出 */
function costBoard(tasks, legions, opts = {}) {
  const o = { ...COST_DEFAULTS, ...opts };
  const month = new Date().toISOString().slice(0, 7);
  const byId = {};
  for (const L of legions) byId[L.id] = { legionId: L.id, name: L.name, steps: 0, chars: 0 };
  for (const t of tasks) {
    if (new Date(t.createdAt || 0).toISOString().slice(0, 7) !== month) continue;
    for (const s of t.plan?.steps || []) {
      const out = (t.outputs || {})[s.id];
      if (!out || out.error || !byId[s.legionId]) continue;
      byId[s.legionId].steps++;
      byId[s.legionId].chars += out.text ? out.text.length : 0;
    }
  }
  const rows = Object.values(byId).map((r) => {
    const tokens = Math.round(r.chars * o.tokensPerChar);
    const modelCost = Math.round((tokens / 1000) * o.yuanPer1kTokens * 100) / 100;
    const laborCost = Math.round(((r.steps * o.minutesPerStep) / 60) * o.hourlyWage);
    return { ...r, tokens, modelCost, laborCost };
  });
  const sum = (k) => rows.reduce((n, r) => n + r[k], 0);
  return { month, params: o, rows, total: { steps: sum('steps'), tokens: sum('tokens'), modelCost: Math.round(sum('modelCost') * 100) / 100, laborCost: sum('laborCost') }, note: '演示口径：员工机不回传 token 数，模型费用按产出字数估算；等效人工按每步折合分钟 × 时薪，均为估算' };
}

// ── O12 ──
const VERDICTS = ['pass', 'partial', 'fail'];

function examReport(exam, results, coverage) {
  const byDomain = {};
  let answered = 0;
  const count = { pass: 0, partial: 0, fail: 0, todo: 0 };
  for (const q of exam.items) {
    const r = results[q.id];
    const v = r && VERDICTS.includes(r.verdict) ? r.verdict : 'todo';
    count[v]++;
    if (v !== 'todo') answered++;
    const d = (byDomain[q.domain] = byDomain[q.domain] || { domain: q.domain, pass: 0, partial: 0, fail: 0, todo: 0 });
    d[v]++;
  }
  const total = exam.items.length;
  const pct = (n) => (total ? Math.round((n / total) * 1000) / 10 : 0);
  const usable = count.pass + count.partial;
  const lines = [
    '# OPC 考卷实测报告',
    '',
    `生成时间：${new Date().toLocaleString('zh-CN')}　已作答 ${answered} / ${total} 题`,
    '',
    `- 通过 ${count.pass} 题（${pct(count.pass)}%）、部分 ${count.partial} 题（${pct(count.partial)}%）、不通过 ${count.fail} 题、未作答 ${count.todo} 题`,
    `- 通过 + 部分 = ${usable} 题（${pct(usable)}%）；目标 ≥ 75% 再对外讲「一个人能撑起一家公司的大部分日常」${answered < total ? '；未全部作答，结论不成立' : usable / total >= 0.75 ? '——已达到' : '——未达到，如实讲覆盖到哪'}`,
    '',
    '| 领域 | 通过 | 部分 | 不通过 | 未作答 |',
    '|---|---|---|---|---|',
    ...Object.values(byDomain).map((d) => `| ${d.domain} | ${d.pass} | ${d.partial} | ${d.fail} | ${d.todo} |`),
    '',
    '## 逐题',
    '',
    '| 题号 | 事务 | 能力地图预估 | 实测 | 检查点通过 | 备注 |',
    '|---|---|---|---|---|---|',
    ...exam.items.map((q) => {
      const r = results[q.id] || {};
      const cov = coverage?.items?.find((c) => c.id === q.coverageId);
      const label = { pass: '通过', partial: '部分', fail: '不通过' }[r.verdict] || '未作答';
      const checks = Array.isArray(r.checks) ? `${r.checks.filter(Boolean).length}/${q.checks.length}` : '—';
      return `| ${q.id} | ${q.task} | ${cov ? coverage.statusLabels[cov.status] : '—'} | ${label} | ${checks} | ${String(r.note || '').replace(/\|/g, '/').slice(0, 60)} |`;
    }),
  ];
  // O13 缺口排序：不通过在前，部分通过按检查点通过率从低到高；只排已作答的
  const ratio = (q) => {
    const c = results[q.id]?.checks;
    return Array.isArray(c) && q.checks.length ? c.filter(Boolean).length / q.checks.length : 0;
  };
  const gaps = exam.items
    .filter((q) => ['fail', 'partial'].includes(results[q.id]?.verdict))
    .sort((a, b) => (results[a.id].verdict === results[b.id].verdict ? ratio(a) - ratio(b) : results[a.id].verdict === 'fail' ? -1 : 1))
    .map((q, i) => ({ rank: i + 1, id: q.id, task: q.task, domain: q.domain, verdict: results[q.id].verdict, checkRatio: Math.round(ratio(q) * 100) }));
  lines.push('', '## 缺口排序（先补这些）', '');
  if (gaps.length) lines.push(...gaps.map((g) => `${g.rank}. ${g.id} ${g.task}（${g.domain}，${g.verdict === 'fail' ? '不通过' : '部分'}，检查点 ${g.checkRatio}%）`));
  else lines.push(answered ? '已作答的题没有不通过或部分通过的。' : '还没有作答。');
  if (Array.isArray(exam.knownGaps) && exam.knownGaps.length) lines.push('', '已知缺口（考卷外）：' + exam.knownGaps.join('；'));
  return { total, answered, count, usable, usablePct: pct(usable), byDomain: Object.values(byDomain), gaps, markdown: lines.join('\n') + '\n' };
}

module.exports = { loadDemoPack, parseMailFile, scanMailFolder, mailToTask, decodeHeader, tuningRows, costBoard, COST_DEFAULTS, examReport, VERDICTS };
