/**
 * 智能体编排（纯逻辑，可单测）：可视化工作流 + 多租户隔离 + 插件化扩展。
 *
 *   工作流：节点（开始 / 大模型 / 知识检索 / 条件分支 / 变量赋值 / 插件 / 回复）+ 连线；从「开始」沿连线执行，
 *           条件节点按结果走「是 / 否」分支；最多 60 步防环；每个节点的输入、输出、耗时都记进运行轨迹
 *   变量：{{inputs.x}} / {{节点id.output}} 模板替换；模板里取不到的变量留空，不报错
 *   插件：声明式清单（不执行任何上传的代码）——
 *           http    按清单拼请求（方法 / 地址 / 头 / 请求体模板），从返回 JSON 里按路径取结果；只允许 http(s)
 *           builtin 调本工作台已有能力（制度问答、智能问数、知识库检索），走同一套审计
 *   多租户：每个租户一份独立的智能体、运行记录、插件、API 密钥（落在 tenants/<租户>/ 下），互相看不到
 */
const { createHash, randomBytes } = require('node:crypto');

const NODE_TYPES = {
  start: { label: '开始', color: '#19376d', icon: 'ri-play-circle-line' },
  llm: { label: '大模型', color: '#7c3aed', icon: 'ri-sparkling-line' },
  retrieve: { label: '知识检索', color: '#0f766e', icon: 'ri-search-eye-line' },
  condition: { label: '条件分支', color: '#c2410c', icon: 'ri-git-branch-line' },
  assign: { label: '变量赋值', color: '#475569', icon: 'ri-equalizer-line' },
  plugin: { label: '插件', color: '#2563a8', icon: 'ri-plug-line' },
  answer: { label: '回复', color: '#15803d', icon: 'ri-chat-check-line' },
};
const MAX_STEPS = 60;

const sha = (s) => createHash('sha256').update(String(s || '')).digest('hex');
const newKey = () => `fa_${randomBytes(18).toString('base64url')}`;

// ── 模板 ──

function getPath(obj, path) {
  return String(path || '').split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);
}
/** {{a.b}} 替换；对象转 JSON；取不到为空串 */
function render(tpl, vars) {
  return String(tpl ?? '').replace(/\{\{\s*([\w.一-鿿-]+)\s*\}\}/g, (_m, p) => {
    const v = getPath(vars, p);
    if (v == null) return '';
    return typeof v === 'object' ? JSON.stringify(v) : String(v);
  });
}

// ── 图规整与校验 ──

function normalizeGraph(g) {
  const nodes = (Array.isArray(g?.nodes) ? g.nodes : []).slice(0, 80).map((n, i) => ({
    id: String(n?.id || `n${i + 1}`).replace(/[^\w-]/g, '').slice(0, 24) || `n${i + 1}`,
    type: NODE_TYPES[n?.type] ? n.type : 'assign',
    title: String(n?.title || NODE_TYPES[n?.type]?.label || '节点').slice(0, 30),
    x: Math.round(Number(n?.x) || 40 + i * 220), y: Math.round(Number(n?.y) || 80),
    config: n?.config && typeof n.config === 'object' ? n.config : {},
  }));
  const ids = new Set(nodes.map((n) => n.id));
  const edges = (Array.isArray(g?.edges) ? g.edges : []).filter((e) => ids.has(e?.from) && ids.has(e?.to) && e.from !== e.to)
    .map((e) => ({ from: e.from, to: e.to, branch: e.branch === 'false' ? 'false' : e.branch === 'true' ? 'true' : '' }))
    .slice(0, 200);
  return { nodes, edges };
}

/** 发布前的检查：有且只有一个开始、至少一个回复、每个节点都从开始可达、条件节点两个分支都接了 */
function validateGraph(g) {
  const { nodes, edges } = normalizeGraph(g);
  const issues = [];
  const starts = nodes.filter((n) => n.type === 'start');
  if (starts.length !== 1) issues.push('要有且只有一个「开始」节点');
  if (!nodes.some((n) => n.type === 'answer')) issues.push('至少要有一个「回复」节点');
  if (starts.length === 1) {
    const seen = new Set([starts[0].id]);
    const q = [starts[0].id];
    while (q.length) { const id = q.shift(); for (const e of edges) if (e.from === id && !seen.has(e.to)) { seen.add(e.to); q.push(e.to); } }
    for (const n of nodes) if (!seen.has(n.id)) issues.push(`「${n.title}」没有接到流程里`);
  }
  for (const n of nodes.filter((x) => x.type === 'condition')) {
    const out = edges.filter((e) => e.from === n.id);
    if (!out.some((e) => e.branch === 'true') || !out.some((e) => e.branch === 'false')) issues.push(`条件「${n.title}」的「是 / 否」两个分支都要接上`);
  }
  for (const n of nodes.filter((x) => x.type === 'llm')) if (!String(n.config.prompt || '').trim()) issues.push(`「${n.title}」还没写提示词`);
  for (const n of nodes.filter((x) => x.type === 'plugin')) if (!n.config.plugin) issues.push(`「${n.title}」还没选插件`);
  return { ok: !issues.length, issues };
}

// ── 条件 ──

function evalCondition(cfg, vars) {
  const left = render(cfg.left ?? '', vars);
  const right = render(cfg.right ?? '', vars);
  const op = cfg.op || 'contains';
  const num = (s) => Number(String(s).replace(/,/g, ''));
  switch (op) {
    case 'contains': return right !== '' && left.includes(right);
    case 'not_contains': return right === '' || !left.includes(right);
    case 'equals': return left === right;
    case 'not_empty': return left.trim() !== '' && left !== '[]';
    case 'empty': return left.trim() === '' || left === '[]';
    case 'gt': return Number.isFinite(num(left)) && Number.isFinite(num(right)) && num(left) > num(right);
    case 'lt': return Number.isFinite(num(left)) && Number.isFinite(num(right)) && num(left) < num(right);
    default: return false;
  }
}

// ── 插件 ──

/** 插件清单规整：只认声明式字段；http 只允许 http(s) 地址 */
function normalizePlugin(raw) {
  const kind = raw?.kind === 'builtin' ? 'builtin' : 'http';
  const p = {
    id: String(raw?.id || '').replace(/[^\w-]/g, '').slice(0, 40),
    name: String(raw?.name || '').slice(0, 40),
    description: String(raw?.description || '').slice(0, 200),
    kind,
    inputs: (Array.isArray(raw?.inputs) ? raw.inputs : []).slice(0, 12).map((x) => ({ name: String(x?.name || '').replace(/[^\w一-鿿]/g, '').slice(0, 30), label: String(x?.label || x?.name || '').slice(0, 30), required: !!x?.required })).filter((x) => x.name),
  };
  if (!p.id || !p.name) throw new Error('插件清单要有 id 和 name');
  if (kind === 'builtin') {
    p.action = String(raw?.action || '');
    if (!['qa.ask', 'ask.run', 'kb.search'].includes(p.action)) throw new Error('内置插件只能调用：制度问答（qa.ask）、智能问数（ask.run）、知识库检索（kb.search）');
  } else {
    const url = String(raw?.request?.url || '');
    if (!/^https?:\/\/[^\s]+$/i.test(url)) throw new Error('插件请求地址要以 http:// 或 https:// 开头');
    p.request = {
      method: ['GET', 'POST', 'PUT'].includes(String(raw?.request?.method || 'POST').toUpperCase()) ? String(raw.request.method || 'POST').toUpperCase() : 'POST',
      url,
      headers: Object.fromEntries(Object.entries(raw?.request?.headers || {}).slice(0, 10).map(([k, v]) => [String(k).slice(0, 60), String(v).slice(0, 400)])),
      body: raw?.request?.body == null ? '' : (typeof raw.request.body === 'string' ? raw.request.body : JSON.stringify(raw.request.body)).slice(0, 4000),
    };
    p.outputPath = String(raw?.outputPath || '').slice(0, 100);
  }
  return p;
}

/** http 插件：按输入渲染请求（不发请求，发由调用方注入的 fetch 负责，便于超时与审计） */
function buildPluginRequest(plugin, inputs) {
  const vars = { inputs };
  const enc = (v) => encodeURIComponent(v);
  const url = String(plugin.request.url).replace(/\{\{\s*inputs\.([\w一-鿿]+)\s*\}\}/g, (_m, k) => enc(String(inputs?.[k] ?? '')));
  const headers = Object.fromEntries(Object.entries(plugin.request.headers || {}).map(([k, v]) => [k, render(v, vars)]));
  const body = plugin.request.method === 'GET' ? undefined : render(plugin.request.body || JSON.stringify(inputs || {}), vars);
  if (body && !Object.keys(headers).some((k) => k.toLowerCase() === 'content-type')) headers['content-type'] = 'application/json';
  return { method: plugin.request.method, url, headers, body };
}

// ── 执行器 ──

/**
 * 运行一个工作流。deps：{ llm(prompt, cls), retrieve(query, topK), plugin(pluginId, inputs) }（都由 index.cjs 注入）。
 * 返回 { ok, answer, trace[], vars, error? }
 */
async function runGraph(graph, inputs, deps, { maxSteps = MAX_STEPS, onStep } = {}) {
  const { nodes, edges } = normalizeGraph(graph);
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const start = nodes.find((n) => n.type === 'start');
  const vars = { inputs: { ...(inputs || {}) } };
  const trace = [];
  if (!start) return { ok: false, error: '没有「开始」节点', trace, vars };
  let cur = start;
  let answer = '';
  for (let step = 0; cur && step < maxSteps; step += 1) {
    const t0 = Date.now();
    const cfg = cur.config || {};
    const rec = { node: cur.id, type: cur.type, title: cur.title };
    let branch = '';
    try {
      switch (cur.type) {
        case 'start': {
          for (const f of Array.isArray(cfg.fields) ? cfg.fields : []) if (f?.required && !String(vars.inputs[f.name] ?? '').trim()) throw new Error(`缺少输入：${f.label || f.name}`);
          rec.output = vars.inputs;
          break;
        }
        case 'llm': {
          const prompt = render(cfg.prompt, vars);
          rec.input = prompt.slice(0, 2000);
          const r = await deps.llm(prompt, cfg.cls || 'internal');
          rec.output = String(r.text || '').trim();
          rec.model = r.model || '';
          break;
        }
        case 'retrieve': {
          const q = render(cfg.query || '{{inputs.question}}', vars);
          rec.input = q;
          const hits = await deps.retrieve(q, Math.min(8, Math.max(1, Number(cfg.topK) || 4)));
          rec.output = hits.map((h) => h.text).join('\n---\n');
          rec.hits = hits.map((h) => ({ title: h.title, source: h.sourceName || h.source || '' }));
          break;
        }
        case 'condition': {
          const yes = evalCondition(cfg, vars);
          branch = yes ? 'true' : 'false';
          rec.output = yes;
          rec.input = `${render(cfg.left, vars).slice(0, 200)} ${cfg.op || 'contains'} ${render(cfg.right, vars).slice(0, 100)}`;
          break;
        }
        case 'assign': {
          rec.output = render(cfg.value, vars);
          break;
        }
        case 'plugin': {
          const pin = Object.fromEntries(Object.entries(cfg.inputs || {}).map(([k, v]) => [k, render(v, vars)]));
          rec.input = pin;
          rec.output = await deps.plugin(cfg.plugin, pin);
          break;
        }
        case 'answer': {
          answer = render(cfg.text || '{{last.output}}', { ...vars, last: { output: trace.length ? vars[trace[trace.length - 1].node]?.output : '' } });
          rec.output = answer;
          break;
        }
        default: break;
      }
      rec.ok = true;
    } catch (e) {
      rec.ok = false;
      rec.error = String(e?.message || e).slice(0, 300);
    }
    rec.ms = Date.now() - t0;
    vars[cur.id] = { output: rec.output };
    trace.push(rec);
    onStep?.(rec);
    if (!rec.ok) return { ok: false, error: `「${cur.title}」出错：${rec.error}`, trace, vars, answer };
    if (cur.type === 'answer') return { ok: true, answer, trace, vars };
    const outs = edges.filter((e) => e.from === cur.id && (!branch || e.branch === branch));
    cur = outs.length ? byId.get(outs[0].to) : null;
  }
  return cur ? { ok: false, error: `超过 ${maxSteps} 步还没结束（流程里可能有环）`, trace, vars, answer } : { ok: !!answer, answer, trace, vars, ...(answer ? {} : { error: '流程走完了，但没有经过「回复」节点' }) };
}

// ── 多租户 ──

function normalizeTenant(raw, prev = {}) {
  const id = String(prev.id || raw?.id || `t-${randomBytes(4).toString('hex')}`);
  return { id, name: String(raw?.name ?? prev.name ?? '').trim().slice(0, 30) || '未命名租户', color: /^#[0-9a-f]{6}$/i.test(raw?.color) ? raw.color : (prev.color || '#19376d'), createdAt: prev.createdAt || new Date().toISOString() };
}
/** API 密钥只存哈希；校验时比哈希，命中返回租户 id */
function keyRecord(tenantId, label) { const key = newKey(); return { key, rec: { id: sha(key).slice(0, 12), tenantId, label: String(label || '').slice(0, 30), hash: sha(key), createdAt: new Date().toISOString(), prefix: key.slice(0, 7) } }; }
function tenantOfKey(keys, key) { const h = sha(key); const k = (keys || []).find((x) => x.hash === h && !x.revoked); return k ? k.tenantId : null; }

/** 两个示例智能体（建租户时一起放进去，开箱就能跑） */
function sampleAgents() {
  return [
    {
      id: 'wealth-faq', name: '理财产品咨询助手', description: '先查知识库，问到保本保收益直接按合规口径回复，其余由模型依据检索结果作答',
      graph: {
        nodes: [
          { id: 'start', type: 'start', title: '开始', x: 40, y: 140, config: { fields: [{ name: 'question', label: '客户问题', required: true }] } },
          { id: 'guard', type: 'condition', title: '问保本保收益？', x: 260, y: 140, config: { left: '{{inputs.question}}', op: 'contains', right: '保本' } },
          { id: 'refuse', type: 'answer', title: '合规回复', x: 500, y: 40, config: { text: '理财产品不承诺保本保收益，过往业绩不代表未来表现。建议您结合自身风险承受能力选择，详情可咨询网点理财经理。' } },
          { id: 'kb', type: 'retrieve', title: '查知识库', x: 500, y: 240, config: { query: '{{inputs.question}}', topK: 4 } },
          { id: 'ans', type: 'llm', title: '依据作答', x: 740, y: 240, config: { cls: 'internal', prompt: '你是银行理财客服。只依据下面的资料回答客户问题，资料里没有就说「这个问题我需要转人工确认」。不得承诺收益。\n\n资料：\n{{kb.output}}\n\n客户问题：{{inputs.question}}' } },
          { id: 'out', type: 'answer', title: '回复客户', x: 980, y: 240, config: { text: '{{ans.output}}' } },
        ],
        edges: [{ from: 'start', to: 'guard' }, { from: 'guard', to: 'refuse', branch: 'true' }, { from: 'guard', to: 'kb', branch: 'false' }, { from: 'kb', to: 'ans' }, { from: 'ans', to: 'out' }],
      },
    },
    {
      id: 'policy-check', name: '制度条款速查', description: '调用内置插件「制度问答」，再把答案整理成一句话结论',
      graph: {
        nodes: [
          { id: 'start', type: 'start', title: '开始', x: 40, y: 120, config: { fields: [{ name: 'question', label: '问题', required: true }] } },
          { id: 'qa', type: 'plugin', title: '制度问答', x: 280, y: 120, config: { plugin: 'builtin-qa', inputs: { q: '{{inputs.question}}' } } },
          { id: 'out', type: 'answer', title: '回复', x: 520, y: 120, config: { text: '{{qa.output}}' } },
        ],
        edges: [{ from: 'start', to: 'qa' }, { from: 'qa', to: 'out' }],
      },
    },
  ];
}
const BUILTIN_PLUGINS = [
  { id: 'builtin-qa', name: '制度问答', description: '按本机制度库作答并标出处（依据不足会拒答）', kind: 'builtin', action: 'qa.ask', inputs: [{ name: 'q', label: '问题', required: true }] },
  { id: 'builtin-ask', name: '智能问数', description: '按指标口径库取数（客户敏感数据，只走内网模型）', kind: 'builtin', action: 'ask.run', inputs: [{ name: 'q', label: '取数问题', required: true }] },
  { id: 'builtin-kb', name: '知识库检索', description: '检索金融知识库（多来源）', kind: 'builtin', action: 'kb.search', inputs: [{ name: 'q', label: '检索词', required: true }] },
];

module.exports = { NODE_TYPES, MAX_STEPS, BUILTIN_PLUGINS, render, getPath, normalizeGraph, validateGraph, evalCondition, normalizePlugin, buildPluginRequest, runGraph, normalizeTenant, keyRecord, tenantOfKey, sampleAgents, sha };
