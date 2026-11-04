/**
 * 统一 AI 网关（纯逻辑，可单测）：本工作台所有模型调用都过这里。
 *
 *   多模型智能路由：按「场景 + 数据级别 + 问题复杂度」挑候选模型，按顺序调用，前一个失败自动换下一个；
 *                   客户敏感数据只能落到标记为「内网私有部署」的模型上，一个都没有就拦下。
 *   脱敏与安全围栏：发往非内网模型前把身份证、手机号、银行卡、邮箱、已登记的客户名替换成占位符，回来再还原；
 *                   输入里夹带「忽略以上指令」这类注入话术、问到禁问话题 → 拦下；输出里出现保本保收益等禁语、
 *                   或出现输入里没有的完整证件号 / 卡号 → 打码并标记。
 *   全量审计日志：每次调用记一条（场景、级别、路由规则、依次尝试的模型、最终模型、脱敏计数、围栏命中、耗时、
 *                   请求与结果的 sha256 指纹），原文不落审计。
 *
 * 宿主调用（真正发请求、写审计）由 index.cjs 注入，这里只做决定和变换。
 */
const { createHash } = require('node:crypto');

const CLASSES = ['public', 'internal', 'sensitive'];
const SCENES = ['qa', 'kb', 'ask', 'credit', 'mkt', 'doc', 'agent'];
const SCENE_LABEL = { qa: '制度问答', kb: '知识库检索', ask: '智能问数', credit: '授信预审', mkt: '营销审查', doc: '资料处理', agent: '智能体', '*': '全部场景' };

const sha = (s) => createHash('sha256').update(String(s || '')).digest('hex').slice(0, 16);

// ── 多模型路由 ──

/**
 * 模型清单规整。两种接入：
 *   host   —— 应用里已配置的模型，value 是 provider/model（空串 = 宿主默认模型）
 *   direct —— 直连内网私有部署的 OpenAI 兼容接口：endpoint（http/https）+ model + timeout 秒；value 固定为 direct:<id>。
 *             API 密钥不在这里（不进 settings.json），只存系统钥匙串，键名 gw-model-<id>
 */
function normalizeModels(list) {
  const out = [];
  const seen = new Set();
  for (const m of Array.isArray(list) ? list : []) {
    if (m?.kind === 'direct') {
      const id = String(m.id || '').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 40);
      const endpoint = String(m.endpoint || '').trim().replace(/\/+$/, '');
      const model = String(m.model || '').trim().slice(0, 120);
      if (!id || !/^https?:\/\/[^\s]+$/i.test(endpoint) || !model) continue;
      const value = `direct:${id}`;
      if (seen.has(value)) continue;
      seen.add(value);
      const timeout = Math.min(600, Math.max(5, Math.round(Number(m.timeout) || 60)));
      out.push({ value, kind: 'direct', id, endpoint: endpoint.slice(0, 300), model, timeout, label: String(m.label || model).slice(0, 80), internal: !!m.internal, enabled: m.enabled !== false });
      continue;
    }
    const value = String(m?.value ?? '').trim();
    if (value.startsWith('direct:') || seen.has(value)) continue;
    seen.add(value);
    out.push({ value, label: String(m?.label || value || '系统默认模型').slice(0, 80), internal: !!m?.internal, enabled: m?.enabled !== false });
  }
  if (!out.length) out.push({ value: '', label: '系统默认模型', internal: false, enabled: true });
  return out;
}

/** 接口地址只留协议 + 主机 + 端口（审计 / 报错里不带路径参数）；拼不出就给空 */
function endpointHost(endpoint) {
  try { const u = new URL(endpoint); return `${u.protocol}//${u.host}`; } catch { return ''; }
}

/**
 * 直连 OpenAI 兼容接口：POST <endpoint>/chat/completions，取 choices[0].message.content。
 * HTTP 非 2xx、返回体带 error、超时，都抛出真实原因（网关据此自动换下一个模型）。密钥只放请求头，不进任何报错文字
 */
async function directChat({ endpoint, model, apiKey = '', timeoutMs = 60_000, prompt, maxTokens }) {
  const url = `${String(endpoint).replace(/\/+$/, '')}/chat/completions`;
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), Math.max(1000, timeoutMs));
  let res;
  let raw = '';
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...(apiKey ? { authorization: `Bearer ${apiKey}` } : {}) },
      body: JSON.stringify({ model, messages: [{ role: 'user', content: String(prompt || '') }], stream: false, ...(maxTokens ? { max_tokens: maxTokens } : {}) }),
      signal: ac.signal,
    });
    raw = await res.text();
  } catch (e) {
    if (ac.signal.aborted) throw new Error(`${endpointHost(endpoint)} 超过 ${Math.round(timeoutMs / 1000)} 秒没有返回`);
    throw new Error(`连不上 ${endpointHost(endpoint) || endpoint}：${String(e?.cause?.code || e?.cause?.message || e?.message || e)}`);
  } finally { clearTimeout(timer); }
  let j = null;
  try { j = JSON.parse(raw); } catch { /* 非 JSON 原样报 */ }
  const errMsg = j?.error ? (typeof j.error === 'string' ? j.error : j.error.message || JSON.stringify(j.error)) : '';
  if (!res.ok) throw new Error(`HTTP ${res.status}：${String(errMsg || raw || res.statusText).replace(/\s+/g, ' ').slice(0, 200)}`);
  if (errMsg) throw new Error(`模型返回错误：${String(errMsg).slice(0, 200)}`);
  const text = j?.choices?.[0]?.message?.content;
  if (typeof text !== 'string') throw new Error(`返回内容不是 OpenAI 兼容格式：${String(raw).replace(/\s+/g, ' ').slice(0, 120)}`);
  return { text, model: j?.model || model };
}

/** 路由规则：从上到下第一条命中的生效；models 按顺序尝试 */
function normalizeRules(list) {
  return (Array.isArray(list) ? list : []).slice(0, 40).map((r, i) => ({
    id: String(r?.id || `r${i + 1}`),
    name: String(r?.name || '').slice(0, 40),
    scene: SCENES.includes(r?.scene) ? r.scene : '*',
    cls: CLASSES.includes(r?.cls) ? r.cls : '*',
    complexity: ['simple', 'complex'].includes(r?.complexity) ? r.complexity : '*',
    models: (Array.isArray(r?.models) ? r.models : []).map(String).slice(0, 5),
  }));
}

/**
 * 问题复杂度（零成本启发式）：长文 / 多问 / 比较汇总类 → complex，其它 simple。
 * 用来把简单问题交给快而便宜的模型，复杂问题交给强模型
 */
function complexityOf(prompt) {
  const s = String(prompt || '');
  if (s.length > 6000) return 'complex';
  const q = (s.match(/[？?]/g) || []).length;
  if (q >= 3) return 'complex';
  if (/对比|比较|汇总|分析原因|逐条|分别|多步|综合|评估/.test(s.slice(-1500))) return 'complex';
  return 'simple';
}

/**
 * 选路：返回 { rule, candidates[]（按顺序尝试的模型）, blocked? }。
 * 敏感数据只保留内网模型；规则里的模型不在清单 / 被停用的跳过；规则都没命中 → 默认用清单里第一个可用模型
 */
function pickRoute({ scene, cls, prompt }, models, rules) {
  const ms = normalizeModels(models);
  const rs = normalizeRules(rules);
  const cx = complexityOf(prompt);
  const rule = rs.find((r) => (r.scene === '*' || r.scene === scene) && (r.cls === '*' || r.cls === cls) && (r.complexity === '*' || r.complexity === cx)) || null;
  const byValue = new Map(ms.map((m) => [m.value, m]));
  let list = rule ? rule.models.map((v) => byValue.get(v)).filter(Boolean) : [];
  if (!list.length) list = ms.slice();
  list = list.filter((m) => m.enabled);
  if (cls === 'sensitive') list = list.filter((m) => m.internal);
  if (!list.length) {
    return { rule, complexity: cx, candidates: [], blocked: cls === 'sensitive' ? 'no_internal_model' : 'no_model' };
  }
  return { rule, complexity: cx, candidates: list };
}

// ── 脱敏 ──

const ID_WEIGHTS = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
const ID_CHECK = '10X98765432';
function isIdCard(s) {
  if (!/^\d{17}[\dXx]$/.test(s)) return false;
  let sum = 0;
  for (let i = 0; i < 17; i += 1) sum += Number(s[i]) * ID_WEIGHTS[i];
  return ID_CHECK[sum % 11] === s[17].toUpperCase();
}
function luhn(s) {
  let sum = 0;
  let dbl = false;
  for (let i = s.length - 1; i >= 0; i -= 1) {
    let d = Number(s[i]);
    if (dbl) { d *= 2; if (d > 9) d -= 9; }
    sum += d;
    dbl = !dbl;
  }
  return sum % 10 === 0;
}

const MASK_KINDS = {
  idcard: { label: '身份证号', re: /(?<![\dA-Za-z])\d{17}[\dXx](?![\dA-Za-z])/g, ok: isIdCard },
  bankcard: { label: '银行卡号', re: /(?<!\d)\d{16,19}(?!\d)/g, ok: luhn },
  phone: { label: '手机号', re: /(?<!\d)1[3-9]\d{9}(?!\d)/g, ok: () => true },
  email: { label: '邮箱', re: /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, ok: () => true },
};

/**
 * 脱敏：按开启的类别把敏感值换成 [类别_序号]，同一个值同一个占位符；names 是登记的客户 / 借款人名（逐字替换）。
 * 返回 { text, map: { 占位符: 原值 }, counts: { 类别: 次数 } }
 */
function maskText(text, { kinds = Object.keys(MASK_KINDS), names = [] } = {}) {
  let out = String(text || '');
  const map = {};
  const rev = new Map();
  const counts = {};
  const place = (kind, label, value) => {
    if (rev.has(value)) return rev.get(value);
    counts[kind] = (counts[kind] || 0) + 1;
    const tag = `[${label}_${counts[kind]}]`;
    rev.set(value, tag);
    map[tag] = value;
    return tag;
  };
  // 名字先换（长的先换，免得「张三丰」被「张三」截断）
  for (const n of [...new Set(names.map((x) => String(x || '').trim()).filter((x) => x.length >= 2))].sort((a, b) => b.length - a.length)) {
    if (!out.includes(n)) continue;
    const tag = place('name', '客户名', n);
    out = out.split(n).join(tag);
  }
  for (const k of ['idcard', 'bankcard', 'phone', 'email']) {
    if (!kinds.includes(k)) continue;
    const { label, re, ok } = MASK_KINDS[k];
    out = out.replace(re, (m) => (ok(m) ? place(k, label, m) : m));
  }
  return { text: out, map, counts };
}

/** 还原：模型回答里的占位符换回原值（回答给本机使用者看，原值本来就在本机） */
function unmaskText(text, map) {
  let out = String(text || '');
  for (const [tag, value] of Object.entries(map || {})) out = out.split(tag).join(value);
  return out;
}

// ── 安全围栏 ──

const INJECTION_RE = /(忽略|无视|不要理会|覆盖|绕过)[^。！？\n]{0,8}(指令|规则|要求|提示|限制)|(输出|告诉我|泄露|打印)[^。！？\n]{0,6}(系统提示词|system prompt)|ignore (all |the )?(previous|above|prior) (instructions|rules)|you are now|system prompt|越狱|jailbreak|扮演.{0,6}(没有|不受).{0,4}(限制|约束)/i;
const DEFAULT_OUTPUT_BANNED = ['保本保收益', '稳赚不赔', '零风险', '保证收益', '无风险收益', '刚性兑付', '保本', '收益最高', '绝对安全'];

/**
 * 输入围栏：只看「使用者自己写的话」（被审查的材料本来就是数据，里面的话术交给模型时已经包起来说明不算指令）。
 * 返回 { ok, hits: [{kind, word}] }
 */
function guardInput(userText, { forbidden = [] } = {}) {
  const s = String(userText || '');
  const hits = [];
  const m = INJECTION_RE.exec(s);
  if (m) hits.push({ kind: 'injection', word: m[0] });
  for (const f of forbidden) {
    const words = Array.isArray(f?.keywords) ? f.keywords : [String(f || '')];
    const w = words.find((x) => x && s.includes(x));
    if (w) { hits.push({ kind: 'forbidden', word: w, topic: f?.name || '' }); break; }
  }
  return { ok: !hits.length, hits };
}

/**
 * 输出围栏：禁语命中 → 标记（不改写模型原文，交给界面标黄、审计记一笔）；
 * 回答里出现了输入里没有的完整身份证 / 银行卡号 → 打码（模型编的或从别处带出的号码都不能原样给出去）
 */
function guardOutput(text, { banned = DEFAULT_OUTPUT_BANNED, inputText = '' } = {}) {
  let out = String(text || '');
  const hits = [];
  for (const w of banned) if (w && out.includes(w)) hits.push({ kind: 'banned', word: w });
  const src = String(inputText || '');
  for (const k of ['idcard', 'bankcard']) {
    const { re, ok, label } = MASK_KINDS[k];
    out = out.replace(re, (m) => {
      if (!ok(m) || src.includes(m)) return m;
      hits.push({ kind: 'leak', word: label });
      return `${m.slice(0, 4)}****${m.slice(-4)}`;
    });
  }
  return { text: out, hits };
}

// ── 审计 ──

/** 一次网关调用的审计记录（不含原文） */
function auditRecord({ scene, cls, rule, complexity, tried, model, ok, ms, masked, guards, prompt, reply, error, blocked }) {
  return {
    scene, cls,
    rule: rule ? (rule.name || rule.id) : '',
    complexity: complexity || '',
    tried: (tried || []).map((t) => ({ model: t.model || '默认', ok: !!t.ok, ms: t.ms || 0, ...(t.error ? { error: String(t.error).slice(0, 120) } : {}) })),
    model: model || '',
    fallback: (tried || []).length > 1,
    ok: !!ok,
    ms: ms || 0,
    masked: masked || {},
    guards: (guards || []).map((g) => `${g.kind}:${g.word}`).slice(0, 10),
    promptSha: prompt ? sha(prompt) : '',
    replySha: reply ? sha(reply) : '',
    chars: prompt ? String(prompt).length : 0,
    ...(error ? { error: String(error).slice(0, 200) } : {}),
    ...(blocked ? { blocked } : {}),
  };
}

/** 审计筛选与统计（界面用） */
function filterAudit(list, { scene, model, status, q } = {}) {
  return (list || []).filter((r) => r.action === 'model.call' || r.action === 'model.blocked').filter((r) => {
    if (scene && scene !== '*' && r.scene !== scene) return false;
    if (model && r.model !== model) return false;
    if (status === 'ok' && !r.ok) return false;
    if (status === 'fail' && r.ok) return false;
    if (status === 'guard' && !(r.guards || []).length && r.action !== 'model.blocked') return false;
    if (status === 'fallback' && !r.fallback) return false;
    if (q && !JSON.stringify(r).includes(q)) return false;
    return true;
  });
}

function auditStats(list) {
  const calls = (list || []).filter((r) => r.action === 'model.call' || r.action === 'model.blocked');
  const byModel = {};
  const byScene = {};
  let ok = 0; let fallback = 0; let blocked = 0; let guarded = 0; let masked = 0; let ms = 0;
  for (const r of calls) {
    if (r.action === 'model.blocked') { blocked += 1; continue; }
    if (r.ok) ok += 1;
    if (r.fallback) fallback += 1;
    if ((r.guards || []).length) guarded += 1;
    masked += Object.values(r.masked || {}).reduce((a, b) => a + b, 0);
    ms += r.ms || 0;
    const m = r.model || '默认';
    byModel[m] = (byModel[m] || 0) + 1;
    byScene[r.scene] = (byScene[r.scene] || 0) + 1;
  }
  const done = calls.length - blocked;
  return { total: calls.length, ok, failed: done - ok, fallback, blocked, guarded, masked, avgMs: done ? Math.round(ms / done) : 0, byModel, byScene };
}

/** 审计导出 CSV（UTF-8 BOM，Excel 直接打开） */
function auditCsv(list) {
  const cols = ['at', 'scene', 'cls', 'rule', 'complexity', 'model', 'fallback', 'ok', 'ms', 'masked', 'guards', 'promptSha', 'replySha', 'blocked', 'error', 'hash'];
  const esc = (v) => { const s = typeof v === 'object' && v !== null ? JSON.stringify(v) : String(v ?? ''); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
  return `﻿${cols.join(',')}\n${(list || []).map((r) => cols.map((c) => esc(r[c])).join(',')).join('\n')}\n`;
}

module.exports = {
  directChat, endpointHost,
  CLASSES, SCENES, SCENE_LABEL, MASK_KINDS, DEFAULT_OUTPUT_BANNED,
  sha, normalizeModels, normalizeRules, complexityOf, pickRoute,
  isIdCard, luhn, maskText, unmaskText, guardInput, guardOutput,
  auditRecord, filterAudit, auditStats, auditCsv,
};
