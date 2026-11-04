/**
 * 智能问数扩展（纯逻辑，可单测）：多数据源接入 + 零侵入接口捕获 + 报表 / API / 任务三种取数形态。
 *
 *   数据源：表格文件 / App 已配的数据库（只读 SQL）/ 只读 HTTP 接口 / 浏览器抓包（HAR）——最后都映射成口径库要求的那张表，
 *           指标怎么算仍由口径库 + 程序决定（模型不碰数字）
 *   零侵入接口捕获：业务系统不改一行代码——在浏览器里打开那张报表页，开发者工具「另存为 HAR」，导进来；
 *           这里把 HAR 里每个 JSON 响应拆出「对象数组」候选（路径、行数、字段），选一个、对上列就成了数据源
 *   报表：把一次问数的口径（指标 + 时间 + 维度 + 条件）存下来，之后按口径直接重算，不再调模型（快、稳、零成本）
 *   API：已存的报表经本机 API 取数（GET /v1/reports/<id>，租户密钥），供其它系统调用
 *   任务：报表按时间自动重算，留快照，可推送到群
 */

/** 在一个 JSON 里找「对象数组」候选：返回 [{ path, rows, keys }]，最多看 4 层 */
function arrayCandidates(json, maxDepth = 4) {
  const out = [];
  const walk = (v, path, d) => {
    if (d > maxDepth || v == null) return;
    if (Array.isArray(v)) {
      const objs = v.filter((x) => x && typeof x === 'object' && !Array.isArray(x));
      if (objs.length >= 1 && objs.length >= v.length * 0.8) {
        const keys = [...new Set(objs.slice(0, 20).flatMap((o) => Object.keys(o)))].slice(0, 40);
        out.push({ path, rows: objs.length, keys });
      }
      return;
    }
    if (typeof v === 'object') for (const [k, x] of Object.entries(v)) walk(x, path ? `${path}.${k}` : k, d + 1);
  };
  walk(json, '', 0);
  return out.sort((a, b) => b.rows - a.rows);
}

/** HAR → JSON 响应清单（只要 2xx 且能解析成 JSON 的；带 base64 的也解开） */
function parseHar(har) {
  const entries = Array.isArray(har?.log?.entries) ? har.log.entries : [];
  const out = [];
  for (const [i, e] of entries.entries()) {
    const st = Number(e?.response?.status) || 0;
    const c = e?.response?.content || {};
    const mime = String(c.mimeType || '');
    if (st < 200 || st >= 300 || !c.text) continue;
    if (!/json|javascript|text\/plain/i.test(mime) && !/^\s*[[{]/.test(c.text)) continue;
    let text = c.text;
    if (c.encoding === 'base64') { try { text = Buffer.from(text, 'base64').toString('utf8'); } catch { continue; } }
    let json;
    try { json = JSON.parse(text); } catch { continue; }
    const cands = arrayCandidates(json);
    if (!cands.length) continue;
    let url = String(e?.request?.url || '');
    try { const u = new URL(url); url = `${u.origin}${u.pathname}`; } catch { /* 原样 */ }
    out.push({ index: i, method: e?.request?.method || 'GET', url, status: st, bytes: text.length, candidates: cands.slice(0, 5) });
  }
  return out;
}

function pick(obj, path) {
  if (!path) return obj;
  return String(path).split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);
}

/** 取 HAR 第 index 条响应里 path 处的数组 */
function harRows(har, index, path) {
  const e = har?.log?.entries?.[index];
  let text = e?.response?.content?.text || '';
  if (e?.response?.content?.encoding === 'base64') text = Buffer.from(text, 'base64').toString('utf8');
  const v = pick(JSON.parse(text), path);
  return Array.isArray(v) ? v.filter((x) => x && typeof x === 'object') : [];
}

const NUMERIC = new Set(['balance', 'new_amount', 'customers', 'maturing_amount']);

/** 字段名自动对上：口径库字段 ← 源字段（同名 / 中文说明 / 常见别名） */
function autoMapping(fields, sourceKeys) {
  const alias = {
    stat_date: ['stat_date', 'date', 'dt', '统计日期', '日期', 'biz_date', 'data_date', 'report_date', 'acct_date', 'etl_date'],
    branch: ['branch', 'branch_name', 'org_name', 'org', 'dept_name', 'inst_name', '分行', '机构', '机构名称', '分支机构'],
    product: ['product', 'product_type', 'prod_type', 'product_name', 'prod_name', '产品', '产品类型', '产品名称'],
    customer_level: ['customer_level', 'cust_level', 'cust_grade', 'level', '客户等级', '等级', '客户层级'],
    balance: ['balance', 'bal', 'amount', 'bal_amt', 'balance_amt', '余额', '存款余额'],
    new_amount: ['new_amount', 'new_amt', 'increase', 'incr_amt', 'add_amt', '新增', '当月新增', '新增金额'],
    customers: ['customers', 'cust_cnt', 'cust_num', 'customer_count', 'customer_num', '客户数', '有余额客户数'],
    maturing_amount: ['maturing_amount', 'maturity', 'maturity_amt', 'due_amt', 'expire_amt', '到期金额', '次月到期金额'],
  };
  // 比对时去掉大小写、下划线、连字符和空格：业务系统接口多是驼峰（statDate / orgName / custCnt），
  // 原来只认下划线写法，抓包接进来的接口几乎一个都对不上
  const key = (x) => String(x || '').toLowerCase().replace(/[_\-\s]/g, '');
  const byKey = new Map();
  for (const k of sourceKeys) if (!byKey.has(key(k))) byKey.set(key(k), k);
  const out = {};
  const used = new Set();
  for (const f of Object.keys(fields)) {
    const hit = [f, ...(alias[f] || [])].map((a) => byKey.get(key(a))).find((k) => k && !used.has(k));
    if (hit) { out[f] = hit; used.add(hit); }
  }
  return out;
}

/** 按映射把源数据转成口径库的表；金额 / 人数转数字，日期截成 YYYY-MM-DD；缺必填列返回 missing */
function applyMapping(rows, mapping, fields) {
  const need = Object.keys(fields);
  const missing = need.filter((f) => !mapping[f]);
  if (missing.length) return { rows: [], missing };
  const out = [];
  for (const r of rows || []) {
    const o = {};
    for (const f of need) {
      let v = pick(r, mapping[f]);
      if (NUMERIC.has(f)) { const n = Number(String(v ?? '').replace(/[,，\s元]/g, '')); v = Number.isFinite(n) ? n : 0; }
      else if (f === 'stat_date') { const m = /(\d{4})[-/.年]?(\d{1,2})[-/.月]?(\d{1,2})/.exec(String(v ?? '')); v = m ? `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}` : String(v ?? ''); }
      else v = String(v ?? '').trim();
      o[f] = v;
    }
    if (o.stat_date) out.push(o);
  }
  return { rows: out, missing: [] };
}

/** 报表：从一次答过的问数记录存口径 */
function reportFromAsk(rec, name) {
  if (!rec || rec.status !== 'answered') throw new Error('只有答出来的问数能存成报表');
  return { name: String(name || rec.q).slice(0, 60), q: rec.q, metricId: rec.metricId, query: rec.query, unit: rec.unit, createdAt: new Date().toISOString() };
}

/** 报表结果 → 表格文字（推送 / 导出用） */
function reportText(rep, out, metricName) {
  const lines = [`${rep.name}（${metricName}，${out.period.from || '—'} 至 ${out.period.to || '—'}）`];
  if (out.groups) for (const g of out.groups) lines.push(`- ${g.key}：${g.value}`);
  else lines.push(`- 结果：${out.value}`);
  return lines.join('\n');
}

function reportCsv(rep, out) {
  const esc = (v) => { const s = String(v ?? ''); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
  const rows = out.groups ? out.groups.map((g) => [g.key, g.value]) : [['合计', out.value]];
  return `﻿${[['维度', `${rep.name}（${rep.unit || ''}）`], ...rows].map((r) => r.map(esc).join(',')).join('\n')}\n`;
}

module.exports = { arrayCandidates, parseHar, harRows, autoMapping, applyMapping, reportFromAsk, reportText, reportCsv, pick };
