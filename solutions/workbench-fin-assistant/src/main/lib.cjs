/**
 * 智能金融助手 · 纯逻辑（不依赖宿主，单测直接 require）。
 *
 * 方案原则（《金融行业 AI 应用解决方案》第二章 / 7.6）：模型只做理解、检索归纳和起草；
 * 取数、计算、校验、拦截、审批和审计由这里的程序确定性执行，不靠提示词让模型「自觉」。
 */
const { createHash } = require('node:crypto');

// ── 通用 ─────────────────────────────────────────

/** 中文按单字 + 连续字母数字切词（不依赖分词词典；条款编号、产品代码保持整体） */
function tokenize(text) {
  const s = String(text || '').toLowerCase();
  const out = [];
  for (const m of s.matchAll(/[a-z0-9][a-z0-9._%-]*|[一-鿿]/g)) out.push(m[0]);
  // 中文相邻两字也算一个词，召回短语（「不良贷款」）
  const han = s.replace(/[^一-鿿]/g, ' ').split(/\s+/).filter(Boolean);
  for (const w of han) for (let i = 0; i + 1 < w.length; i += 1) out.push(w.slice(i, i + 2));
  return out;
}

/** 文本里出现的数字（含小数、百分号、千分位），用来核对「回答里的数字必须在原文 / 结果里找得到」 */
function numbersIn(text) {
  const out = [];
  for (const m of String(text || '').matchAll(/(?<![\w.])-?\d{1,3}(?:,\d{3})+(?:\.\d+)?%?|(?<![\w.])-?\d+(?:\.\d+)?%?/g)) {
    const raw = m[0];
    const n = Number(raw.replace(/[,%]/g, ''));
    if (Number.isFinite(n)) {
      const t = String(text);
      const before = t.slice(Math.max(0, m.index - 2), m.index).trim();
      const after = t.slice(m.index + raw.length, m.index + raw.length + 2).trim();
      out.push({ raw, n, pct: raw.endsWith('%'), before, after });
    }
  }
  return out;
}

/** 回答里的数字有没有出处：在证据里（原样或数值相等，百分比允许 0.05 个百分点误差）。年份、条款序号这类小整数不查 */
function unverifiedNumbers(answer, evidence) {
  const ev = numbersIn(evidence);
  const evRaw = new Set(ev.map((x) => x.raw.replace(/,/g, '')));
  const bad = [];
  for (const x of numbersIn(answer)) {
    // 序号与日期成分（「第 5 条」「3 月」「12 日」「[1]」）不查；金额、比例照查
    if (!x.pct && Number.isInteger(x.n) && (/第$/.test(x.before) || /^[条款项章节月日号年级档期\]]/.test(x.after) || /\[$/.test(x.before))) continue;
    if (!x.pct && x.n >= 1900 && x.n <= 2100 && Number.isInteger(x.n)) continue; // 年份
    const key = x.raw.replace(/,/g, '');
    if (evRaw.has(key)) continue;
    if (ev.some((e) => (x.pct ? Math.abs(e.n - x.n) < 0.05 : Math.abs(e.n - x.n) < 1e-6 || (x.n !== 0 && Math.abs((e.n - x.n) / x.n) < 1e-4)))) continue;
    bad.push(x.raw);
  }
  return [...new Set(bad)];
}

// ── 审计：按条串联哈希，任何删改都能被发现（方案 7.8） ─────────────

function auditHash(prev, entry) {
  return createHash('sha256').update(String(prev || '')).update(JSON.stringify(entry)).digest('hex');
}

/** 追加一条：hash = sha256(上一条 hash + 本条内容) */
function chainAppend(list, entry) {
  const prev = list.length ? list[list.length - 1].hash : '';
  const body = { ...entry };
  return { ...body, prev, hash: auditHash(prev, body) };
}

/** 校验整条链：返回第一处断开的位置（-1 = 完好） */
function chainVerify(list) {
  let prev = '';
  for (let i = 0; i < list.length; i += 1) {
    const { prev: p, hash, ...body } = list[i];
    if (p !== prev || hash !== auditHash(prev, body)) return i;
    prev = hash;
  }
  return -1;
}

// ── 制度库：按条切分 + 检索 + 判定链（方案 6.1） ─────────────────

/** 按「第 X 条」/「X.X」/「一、」切成条款；切不出来就按段落 */
function splitClauses(text) {
  const lines = String(text || '').replace(/\r/g, '').split('\n');
  const clauses = [];
  let cur = null;
  const head = /^\s*(第[一二三四五六七八九十百零〇\d]+条|\d+(?:\.\d+){0,3}[、.．\s]|[一二三四五六七八九十]+、)/;
  for (const line of lines) {
    const t = line.trim();
    if (!t) continue;
    const m = head.exec(t);
    if (m) {
      if (cur) clauses.push(cur);
      cur = { no: m[1].replace(/[、.．\s]+$/, ''), text: t };
    } else if (cur) {
      cur.text += `\n${t}`;
    } else {
      cur = { no: '', text: t };
    }
  }
  if (cur) clauses.push(cur);
  // 一条太长（整段没编号）再按 600 字切
  const out = [];
  for (const c of clauses) {
    if (c.text.length <= 900) { out.push(c); continue; }
    for (let i = 0; i < c.text.length; i += 600) out.push({ no: c.no, text: c.text.slice(i, i + 700) });
  }
  return out;
}

/**
 * 本机时区的日期 YYYY-MM-DD。不能用 toISOString().slice(0, 10)：那是 UTC 日期，
 * 国内早上 8 点前会算成昨天（日报、制度生效、证照到期都会差一天）
 */
function localDate(d = new Date()) {
  const x = d instanceof Date ? d : new Date(d);
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`;
}

/** 生效判定：今天在生效日之后、废止日之前（日期留空 = 不限） */
function policyActive(p, today = localDate()) {
  if (p.retired) return false;
  if (p.effectiveFrom && p.effectiveFrom > today) return false;
  if (p.effectiveTo && p.effectiveTo < today) return false;
  return true;
}

/**
 * BM25 + 专名精确命中加分（条款编号、产品名称）。
 * docs: [{ id, text, title, no }]；返回按分数排序的 [{ doc, score }]
 */
function bm25Search(docs, query, { k1 = 1.4, b = 0.75, limit = 6 } = {}) {
  const q = tokenize(query);
  if (!q.length || !docs.length) return [];
  const toks = docs.map((d) => tokenize(`${d.title || ''} ${d.text}`));
  const avg = toks.reduce((s, t) => s + t.length, 0) / toks.length || 1;
  const df = new Map();
  for (const t of toks) for (const w of new Set(t)) df.set(w, (df.get(w) || 0) + 1);
  const N = docs.length;
  const qSet = [...new Set(q)];
  const exact = [...String(query).matchAll(/第[一二三四五六七八九十百零〇\d]+条|[A-Za-z]{2,}[\w-]*\d[\w-]*|\d+(?:\.\d+){1,3}/g)].map((m) => m[0]);
  return docs.map((doc, i) => {
    const tf = new Map();
    for (const w of toks[i]) tf.set(w, (tf.get(w) || 0) + 1);
    let score = 0;
    for (const w of qSet) {
      const f = tf.get(w) || 0;
      if (!f) continue;
      const idf = Math.log(1 + (N - (df.get(w) || 0) + 0.5) / ((df.get(w) || 0) + 0.5));
      score += idf * ((f * (k1 + 1)) / (f + k1 * (1 - b + (b * toks[i].length) / avg)));
    }
    for (const e of exact) if (doc.text.includes(e) || doc.no === e) score += 3;
    return { doc, score };
  }).filter((x) => x.score > 0).sort((a, b2) => b2.score - a.score).slice(0, limit);
}

/** 问题覆盖率：问题里的关键词有多少在证据里出现（证据不足时拒答，不让模型硬编） */
function coverage(query, text, corpus) {
  let q = [...new Set(tokenize(query).filter((w) => w.length >= 2 || /[a-z0-9]/.test(w)))];
  if (!q.length) return 0;
  // 给了整个制度库原文时，只看问题里「制度库里出现过的词」：相邻两字切出来的「工出」「宿的」「是什」这类跨词碎片
  // 在制度里根本不存在，留着会把「员工出差住宿的报销标准是什么？」的覆盖率压到 0.31 被误拒；
  // 问的事制度里完全没有时，这样算出来是 0，照样拒答。能用的词少于 2 个就退回按全部词算
  if (corpus) {
    const c = String(corpus).toLowerCase();
    const inCorpus = q.filter((w) => c.includes(w));
    if (inCorpus.length >= 2) q = inCorpus;
  }
  const t = String(text || '').toLowerCase();
  return q.filter((w) => t.includes(w)).length / q.length;
}

/** 判定链第一关：禁区话题（针对具体客户的投资建议、个案违规定性等）。命中就不进模型 */
function forbiddenHit(question, topics) {
  const q = String(question || '');
  for (const t of topics || []) {
    for (const p of t.patterns || []) {
      try { if (new RegExp(p, 'i').test(q)) return t; } catch { /* 规则写错跳过 */ }
    }
  }
  return null;
}

// ── 智能问数：口径库是唯一依据，数字全部由程序算（方案 6.2） ──────

/** 口径过滤条件：{ field: value } 或 { field: [v1, v2] } */
function rowMatches(row, filter) {
  for (const [k, v] of Object.entries(filter || {})) {
    const cell = String(row[k] ?? '');
    if (Array.isArray(v) ? !v.map(String).includes(cell) : cell !== String(v)) return false;
  }
  return true;
}

const num = (v) => {
  const n = Number(String(v ?? '').replace(/[,\s]/g, ''));
  return Number.isFinite(n) ? n : 0;
};

function aggregate(rows, measure) {
  if (measure.agg === 'count') return rows.length;
  if (measure.agg === 'distinct') return new Set(rows.map((r) => String(r[measure.field] ?? ''))).size;
  const vals = rows.map((r) => num(r[measure.field]));
  const sum = vals.reduce((s, v) => s + v, 0);
  if (measure.agg === 'avg') return vals.length ? sum / vals.length : 0;
  return sum;
}

/**
 * 按口径计算一个指标。metric: { id, name, unit, table, timeField, measure, numerator?, denominator?, filter?, snapshot? }
 * query: { from, to, groupBy?, where? }。snapshot=true 的余额类指标取区间最后一个时点，不累加。
 * 返回 { value | groups, sql, rowsUsed, period }
 */
function runMetric(metric, rowsAll, query) {
  const tf = metric.timeField;
  const inRange = (r) => (!query.from || String(r[tf]) >= query.from) && (!query.to || String(r[tf]) <= query.to);
  let rows = rowsAll.filter((r) => inRange(r) && rowMatches(r, metric.filter) && rowMatches(r, query.where));
  let period = { from: query.from || '', to: query.to || '' };
  if (metric.snapshot && rows.length) {
    const last = rows.map((r) => String(r[tf])).sort().pop();
    rows = rows.filter((r) => String(r[tf]) === last);
    period = { from: last, to: last };
  }
  const calc = (rs) => {
    if (metric.numerator && metric.denominator) {
      const a = aggregate(rs.filter((r) => rowMatches(r, metric.numerator.filter)), metric.numerator);
      const b = aggregate(rs.filter((r) => rowMatches(r, metric.denominator.filter)), metric.denominator);
      return b ? (a / b) * (metric.scale || 1) : null;
    }
    const v = aggregate(rs, metric.measure);
    return metric.scale ? v * metric.scale : v;
  };
  const round = (v) => (v == null ? null : Math.round(v * 100) / 100);
  const sql = metricSql(metric, query, period);
  if (query.groupBy) {
    const groups = new Map();
    for (const r of rows) {
      const k = String(r[query.groupBy] ?? '');
      groups.set(k, [...(groups.get(k) || []), r]);
    }
    return { groups: [...groups].map(([k, rs]) => ({ key: k, value: round(calc(rs)) })).sort((a, b) => (b.value ?? 0) - (a.value ?? 0)), sql, rowsUsed: rows.length, period };
  }
  return { value: round(calc(rows)), sql, rowsUsed: rows.length, period };
}

/** 给人复核看的等价 SQL（程序实际按同样规则在内存里算，不让模型写 SQL） */
function metricSql(metric, query, period) {
  const lit = (v) => (typeof v === 'number' ? String(v) : `'${String(v).replace(/'/g, "''")}'`);
  const conds = [];
  const tf = metric.timeField;
  if (metric.snapshot && period?.to) conds.push(`${tf} = ${lit(period.to)}`);
  else {
    if (query.from) conds.push(`${tf} >= ${lit(query.from)}`);
    if (query.to) conds.push(`${tf} <= ${lit(query.to)}`);
  }
  const f = (filter) => Object.entries(filter || {}).map(([k, v]) => (Array.isArray(v) ? `${k} IN (${v.map(lit).join(', ')})` : `${k} = ${lit(v)}`));
  conds.push(...f(metric.filter), ...f(query.where));
  const aggExpr = (m) => (m.agg === 'count' ? 'COUNT(*)' : m.agg === 'distinct' ? `COUNT(DISTINCT ${m.field})` : `${m.agg === 'avg' ? 'AVG' : 'SUM'}(${m.field})`);
  const caseExpr = (m) => {
    const c = f(m.filter);
    if (!c.length) return aggExpr(m);
    if (m.agg === 'count') return `SUM(CASE WHEN ${c.join(' AND ')} THEN 1 ELSE 0 END)`;
    return `${m.agg === 'avg' ? 'AVG' : 'SUM'}(CASE WHEN ${c.join(' AND ')} THEN ${m.field} END)`;
  };
  const expr = metric.numerator && metric.denominator ? `${caseExpr(metric.numerator)} * 1.0 / NULLIF(${caseExpr(metric.denominator)}, 0)${metric.scale ? ` * ${metric.scale}` : ''}` : `${aggExpr(metric.measure)}${metric.scale ? ` * ${metric.scale}` : ''}`;
  const sel = query.groupBy ? `${query.groupBy}, ${expr} AS value` : `${expr} AS value`;
  return `SELECT ${sel}\nFROM ${metric.table}${conds.length ? `\nWHERE ${conds.join('\n  AND ')}` : ''}${query.groupBy ? `\nGROUP BY ${query.groupBy}\nORDER BY value DESC` : ''}`;
}

/** 模型给的问数意图只能落在口径库里：未知指标、未知维度、不合法的日期一律拒 */
function validateIntent(intent, metrics, dims) {
  const m = metrics.find((x) => x.id === intent?.metricId);
  if (!m) return { ok: false, reason: 'unknown_metric' };
  const date = (v) => (v == null || v === '' ? '' : /^\d{4}-\d{2}(-\d{2})?$/.test(String(v)) ? String(v) : null);
  const from = date(intent.from);
  const to = date(intent.to);
  if (from === null || to === null) return { ok: false, reason: 'bad_date' };
  const groupBy = intent.groupBy && (m.dims || dims || []).includes(intent.groupBy) ? intent.groupBy : '';
  if (intent.groupBy && !groupBy) return { ok: false, reason: 'unknown_dim' };
  const where = {};
  for (const [k, v] of Object.entries(intent.where || {})) {
    if (!(m.dims || dims || []).includes(k)) return { ok: false, reason: 'unknown_dim' };
    where[k] = v;
  }
  // 月份写成 2026-10：补成整月
  const fix = (d, end) => (d && d.length === 7 ? (end ? `${d}-31` : `${d}-01`) : d);
  return { ok: true, metric: m, query: { from: fix(from, false), to: fix(to, true), groupBy, where } };
}

// ── 授信材料预审：校验全部由程序算，模型只起草（方案 6.3） ────────────

/** 材料清单：按文件名关键词归类，算缺件 */
function classifyMaterial(fileName, checklist) {
  const n = String(fileName || '');
  for (const item of checklist) if ((item.keywords || []).some((k) => n.includes(k))) return item.id;
  return '';
}

function missingMaterials(files, checklist) {
  const have = new Set(files.map((f) => f.kind).filter(Boolean));
  return checklist.filter((c) => c.required && !have.has(c.id));
}

/** 抽取值在原文里的位置（第几页 / 第几字），找不到就标「未在原文找到」—— 不信模型给的位置 */
function locateQuote(pages, quote) {
  const q = String(quote || '').replace(/\s+/g, '');
  if (q.length < 2) return null;
  for (let i = 0; i < pages.length; i += 1) {
    const t = String(pages[i] || '').replace(/\s+/g, '');
    const at = t.indexOf(q.slice(0, 40));
    if (at >= 0) return { page: i + 1, offset: at };
  }
  return null;
}

/** 解析带单位的金额：「1,234.5 万元」→ 12345000 */
function parseAmount(v) {
  if (typeof v === 'number') return v;
  const s = String(v ?? '').replace(/[,\s，]/g, '');
  const m = /(-?\d+(?:\.\d+)?)(亿|万)?/.exec(s);
  if (!m) return null;
  const n = Number(m[1]);
  return m[2] === '亿' ? n * 1e8 : m[2] === '万' ? n * 1e4 : n;
}

/**
 * 程序校验：资产负债平衡、流动比率、资产负债率、流水收入与报表收入匹配、证照有效期、大额 / 关联交易。
 * values: 抽取到的财报数（元）；flows: [{ date, amount(收入为正), counterparty }]；licenseExpiry: YYYY-MM-DD；related: [名称]
 */
function creditChecks({ values = {}, flows = [], licenseExpiry = '', related = [], largeThreshold = 2_000_000, today = localDate() }) {
  const out = [];
  const v = (k) => (values[k] == null ? null : Number(values[k]));
  const fmt = (n) => (n == null ? '—' : `${(n / 1e4).toFixed(2)} 万元`);
  const ta = v('totalAssets'); const tl = v('totalLiabilities'); const eq = v('equity');
  if (ta != null && tl != null && eq != null) {
    const diff = Math.abs(ta - (tl + eq));
    const ok = diff <= Math.max(1, ta * 0.001);
    out.push({ id: 'balance', level: ok ? 'pass' : 'high', title: '资产负债表平衡', detail: `资产 ${fmt(ta)}，负债 + 所有者权益 ${fmt(tl + eq)}，差额 ${fmt(diff)}`, rule: '资产 = 负债 + 所有者权益（允许 0.1% 舍入差）' });
  } else {
    out.push({ id: 'balance', level: 'medium', title: '资产负债表平衡', detail: '总资产 / 总负债 / 所有者权益没有全部抽取到，无法核对', rule: '资产 = 负债 + 所有者权益' });
  }
  const ca = v('currentAssets'); const cl = v('currentLiabilities');
  if (ca != null && cl) {
    const r = ca / cl;
    out.push({ id: 'current_ratio', level: r < 1 ? 'medium' : 'pass', title: '流动比率', detail: `流动资产 ÷ 流动负债 = ${r.toFixed(2)}`, rule: '低于 1.0 提示短期偿债压力' });
  }
  if (ta && tl != null) {
    const r = tl / ta;
    out.push({ id: 'debt_ratio', level: r > 0.7 ? 'medium' : 'pass', title: '资产负债率', detail: `${(r * 100).toFixed(1)}%`, rule: '高于 70% 提示杠杆偏高' });
  }
  const rev = v('revenue');
  const inflow = flows.filter((f) => f.amount > 0).reduce((s, f) => s + f.amount, 0);
  if (rev && flows.length) {
    const days = new Set(flows.map((f) => String(f.date).slice(0, 7))).size || 1;
    const annual = (inflow / days) * 12;
    const ratio = annual / rev;
    out.push({ id: 'flow_vs_revenue', level: ratio < 0.5 || ratio > 1.5 ? 'high' : ratio < 0.7 || ratio > 1.3 ? 'medium' : 'pass', title: '流水收入与报表收入匹配', detail: `流水 ${days} 个月入账 ${fmt(inflow)}，年化 ${fmt(annual)}；报表营业收入 ${fmt(rev)}；比值 ${ratio.toFixed(2)}`, rule: '年化入账 ÷ 营业收入在 0.7–1.3 之间视为匹配，0.5–1.5 之外为高风险' });
  } else if (!flows.length) {
    out.push({ id: 'flow_vs_revenue', level: 'medium', title: '流水收入与报表收入匹配', detail: '没有银行流水，无法核对', rule: '年化入账 ÷ 营业收入在 0.7–1.3 之间视为匹配' });
  }
  if (licenseExpiry) {
    const days = Math.round((Date.parse(licenseExpiry) - Date.parse(today)) / 86_400_000);
    out.push({ id: 'license', level: days < 0 ? 'high' : days < 90 ? 'medium' : 'pass', title: '营业执照有效期', detail: days < 0 ? `已于 ${licenseExpiry} 过期` : `有效期至 ${licenseExpiry}（还有 ${days} 天）`, rule: '过期为高风险；90 天内到期提示' });
  }
  const big = flows.filter((f) => Math.abs(f.amount) >= largeThreshold);
  if (big.length) out.push({ id: 'large', level: 'medium', title: '大额交易', detail: `${big.length} 笔单笔 ≥ ${fmt(largeThreshold)}：${big.slice(0, 5).map((f) => `${f.date} ${f.counterparty || ''} ${fmt(f.amount)}`).join('；')}`, rule: `单笔金额 ≥ ${fmt(largeThreshold)}` });
  const rel = (related || []).map((s) => String(s).trim()).filter(Boolean);
  if (rel.length) {
    const hits = flows.filter((f) => rel.some((r) => String(f.counterparty || '').includes(r)));
    out.push({ id: 'related', level: hits.length ? 'medium' : 'pass', title: '关联交易识别', detail: hits.length ? `${hits.length} 笔与已披露关联方往来：${hits.slice(0, 5).map((f) => `${f.date} ${f.counterparty} ${fmt(f.amount)}`).join('；')}` : '流水中未发现与已披露关联方的往来', rule: '对手方名称包含已披露关联方' });
  }
  return out;
}

/** 预审意见不得下结论（方案 6.3：只陈述发现和依据） */
const VERDICT_RE = /(建议|同意|准予|拟)(批准|通过|放款|授信|拒绝|否决|不予)|予以(批准|拒绝)|可以放款|不予授信/;
function stripVerdicts(text) {
  return String(text || '').split('\n').filter((l) => !VERDICT_RE.test(l)).join('\n');
}

/** 银行流水 CSV / 表格行 → [{ date, amount, counterparty }]（收入为正、支出为负） */
function parseFlows(rows) {
  const out = [];
  for (const r of rows || []) {
    const keys = Object.keys(r);
    const pick = (re) => keys.find((k) => re.test(k));
    const kd = pick(/日期|时间|date/i);
    const kin = pick(/收入|贷方|入账|credit/i);
    const kout = pick(/支出|借方|出账|debit/i);
    const kamt = pick(/^金额$|发生额|amount/i);
    const kcp = pick(/对方|户名|对手|counterparty/i);
    const date = String(r[kd] ?? '').slice(0, 10);
    let amount = 0;
    if (kin || kout) amount = num(r[kin]) - num(r[kout]);
    else if (kamt) amount = num(r[kamt]);
    if (!date || !amount) continue;
    out.push({ date, amount, counterparty: String(r[kcp] ?? '') });
  }
  return out;
}

// ── 营销物料审查：规则硬匹配（方案 6.4） ───────────────────────

/** 返回问题清单：禁用表述（原文位置）+ 缺失的必备风险提示 + 收益表述要求 */
function marketingHardCheck(text, rules) {
  const t = String(text || '');
  const issues = [];
  for (const b of rules.banned || []) {
    for (const p of b.patterns) {
      let re;
      try { re = new RegExp(p, 'g'); } catch { continue; }
      for (const m of t.matchAll(re)) {
        issues.push({ kind: 'banned', level: b.level || 'high', quote: m[0], at: m.index, rule: b.name, basis: b.basis, suggestion: b.suggestion || '' });
      }
    }
  }
  for (const r of rules.required || []) {
    if (r.when && !new RegExp(r.when).test(t)) continue;
    if (!(r.anyOf || []).some((p) => new RegExp(p).test(t))) issues.push({ kind: 'missing', level: r.level || 'high', quote: '', at: -1, rule: r.name, basis: r.basis, suggestion: r.suggestion || '' });
  }
  for (const y of rules.yield || []) {
    for (const m of t.matchAll(new RegExp(y.trigger, 'g'))) {
      const win = t.slice(Math.max(0, m.index - 60), m.index + 120);
      if (!(y.anyOf || []).some((p) => new RegExp(p).test(win))) issues.push({ kind: 'yield', level: y.level || 'medium', quote: m[0], at: m.index, rule: y.name, basis: y.basis, suggestion: y.suggestion || '' });
    }
  }
  return issues.sort((a, b) => (a.at < 0 ? 1e9 : a.at) - (b.at < 0 ? 1e9 : b.at));
}

module.exports = {
  localDate, tokenize, numbersIn, unverifiedNumbers, auditHash, chainAppend, chainVerify,
  splitClauses, policyActive, bm25Search, coverage, forbiddenHit,
  rowMatches, aggregate, runMetric, metricSql, validateIntent,
  classifyMaterial, missingMaterials, locateQuote, parseAmount, creditChecks, stripVerdicts, VERDICT_RE, parseFlows,
  marketingHardCheck,
};
