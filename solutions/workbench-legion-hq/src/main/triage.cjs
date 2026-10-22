/**
 * R1 AI 总经理判定：一件事要哪几个部门（一个 / 几个 / 全部），各部门做什么、谁等谁。
 *
 * 一次模型调用要 JSON；输出逐条校验（部门必须在线可用、依赖不成环），不合格回落关键词规则。
 * 通道把错误当正文返回（「⚠️ 模型调用失败…」）时也按失败处理，绝不把错误话术当判定结果。
 */

/** 「全公司」类任务的说法 */
const ALL_RE = /全公司|全面准备|全面推进|全员|全军|所有部门|各部门|上市准备|年度规划|战略规划/;

/** 规则模式下的默认先后（两个部门都在时才生效）：下游 → 上游 */
const DEFAULT_DEPS = {
  'legion-finance': ['legion-rd', 'legion-admin', 'legion-hr'],
  'legion-sales': ['legion-finance'],
  'legion-cs': ['legion-sales'],
};

const CHANNEL_ERROR_RE = /^\s*(⚠️|⚠|\[error\]|error:)|模型调用失败|API Key 无效|余额不足|请求超时|rate limit|invalid api key|insufficient/i;

function isChannelError(text) {
  return typeof text !== 'string' || !text.trim() || CHANNEL_ERROR_RE.test(text.slice(0, 200));
}

/** 宽松取出模型回复里的 JSON 对象 */
function parseJsonLoose(text) {
  const s = String(text || '').replace(/```(?:json)?/gi, '');
  const a = s.indexOf('{');
  const b = s.lastIndexOf('}');
  if (a < 0 || b <= a) throw new Error('回复里没有 JSON');
  return JSON.parse(s.slice(a, b + 1));
}

function buildTriagePrompt(text, legions, company) {
  const list = legions.map((L) => `- ${L.id}（${L.name}）：${L.summary}`).join('\n');
  return [
    `你是「${company?.name || '北京泰途科技有限公司'}」的 AI 总经理。老板只有一个人，其余岗位都由下面的 AI 部门承担。`,
    `现在来了一件事，请判断需要哪些部门参与，每个部门做什么、谁要等谁的产出。`,
    ``,
    `可用部门（只能从这里选）：`,
    list,
    ``,
    `事情：${text}`,
    ``,
    `规则：`,
    `1. 只选真正需要的部门：一个部门能办完就只选一个；确实需要全公司协同才全选。`,
    `2. 闲聊、问候或总经理自己就能回答的，legions 为空。`,
    `3. dependsOn 写这个部门要等哪些部门的产出（部门 id），不能成环。`,
    `4. goal 用一句话写这个部门这次要交付什么，不超过 40 字。`,
    ``,
    `只输出 JSON，不要解释：`,
    `{"legions":["部门id"],"mode":"single|multi|all|none","reason":"一句话理由","steps":[{"legionId":"部门id","goal":"交付什么","dependsOn":["部门id"]}]}`,
  ].join('\n');
}

function hasCycle(steps) {
  const deps = new Map(steps.map((s) => [s.legionId, s.dependsOn || []]));
  const state = new Map();
  const visit = (id) => {
    if (state.get(id) === 1) return true;
    if (state.get(id) === 2) return false;
    state.set(id, 1);
    for (const d of deps.get(id) || []) if (deps.has(d) && visit(d)) return true;
    state.set(id, 2);
    return false;
  };
  return [...deps.keys()].some(visit);
}

function modeOf(n, total) {
  if (!n) return 'none';
  if (n === 1) return 'single';
  return n === total && total > 2 ? 'all' : 'multi';
}

/** 校验模型输出；不合格抛错（调用方回落规则） */
function validateTriage(raw, legions) {
  if (!raw || typeof raw !== 'object') throw new Error('判定结果不是对象');
  const avail = new Map(legions.map((L) => [L.id, L]));
  const ids = Array.isArray(raw.legions) ? [...new Set(raw.legions.map(String))] : null;
  if (!ids) throw new Error('缺少 legions');
  const unknown = ids.filter((id) => !avail.has(id));
  if (unknown.length) throw new Error(`选了不可用的部门：${unknown.join('、')}`);
  const rawSteps = Array.isArray(raw.steps) ? raw.steps : [];
  const steps = ids.map((id) => {
    const s = rawSteps.find((x) => x && String(x.legionId) === id) || {};
    const dependsOn = (Array.isArray(s.dependsOn) ? s.dependsOn.map(String) : []).filter((d) => d !== id && ids.includes(d));
    const goal = String(s.goal || '').trim().slice(0, 120) || `从${avail.get(id).name}的角度处理这件事`;
    return { legionId: id, goal, dependsOn: [...new Set(dependsOn)] };
  });
  if (hasCycle(steps)) throw new Error('部门依赖成环');
  return {
    legions: ids,
    mode: modeOf(ids.length, legions.length),
    reason: String(raw.reason || '').trim().slice(0, 120),
    steps,
  };
}

/** 关键词规则兜底 */
function triageByRules(text, legions) {
  const t = String(text || '');
  let ids;
  if (ALL_RE.test(t) && legions.length) ids = legions.map((L) => L.id);
  else ids = legions.filter((L) => L.routingHints.some((h) => h && t.toLowerCase().includes(h.toLowerCase()))).map((L) => L.id);
  const steps = ids.map((id) => {
    const L = legions.find((x) => x.id === id);
    return {
      legionId: id,
      goal: `从${L.name}的角度处理：${t.slice(0, 60)}`,
      dependsOn: (DEFAULT_DEPS[id] || []).filter((d) => ids.includes(d)),
    };
  });
  // 默认先后在少见组合下也可能成环（理论上不会），成环就去掉依赖并行跑
  if (hasCycle(steps)) for (const s of steps) s.dependsOn = [];
  const names = ids.map((id) => legions.find((x) => x.id === id).short);
  return {
    legions: ids,
    mode: modeOf(ids.length, legions.length),
    reason: ids.length ? `按关键词匹配到：${names.join('、')}` : '没有匹配到部门，AI 总经理直接处理',
    steps,
  };
}

/** 剧本 / 导演台强制指定部门（D3） */
function triageForced(text, legions, forced) {
  const ids = [...new Set(forced)].filter((id) => legions.some((L) => L.id === id));
  // 指定的部门每个都出一步（不看关键词是否命中），先后沿用规则模式的默认先后
  const steps = ids.map((id) => ({
    legionId: id,
    goal: `从${legions.find((L) => L.id === id).name}的角度处理：${String(text || '').slice(0, 60)}`,
    dependsOn: (DEFAULT_DEPS[id] || []).filter((d) => ids.includes(d)),
  }));
  if (hasCycle(steps)) for (const s of steps) s.dependsOn = [];
  const names = ids.map((id) => legions.find((L) => L.id === id).short);
  return { legions: ids, mode: modeOf(ids.length, legions.length), reason: ids.length ? `指定部门：${names.join('、')}` : '指定的部门都没有安装', steps };
}

/**
 * 判定入口。
 * @param {string} text
 * @param {object[]} legions  在线可用的部门（L2 + 装机索引）
 * @param {object} opts
 * @param {(prompt:string)=>Promise<string>} [opts.llm]  模型调用；不给就直接用规则
 * @param {string[]} [opts.forced]
 * @param {object} [opts.company]
 * @returns {Promise<{legions,mode,reason,steps,via:'model'|'rules'|'forced',fallbackReason?:string}>}
 */
async function triage(text, legions, opts = {}) {
  if (Array.isArray(opts.forced) && opts.forced.length) return { ...triageForced(text, legions, opts.forced), via: 'forced' };
  if (!legions.length) return { legions: [], mode: 'none', reason: '本公司还没有可用的部门，AI 总经理直接处理', steps: [], via: 'rules' };
  if (!opts.llm) return { ...triageByRules(text, legions), via: 'rules' };
  let fallbackReason;
  try {
    const reply = await opts.llm(buildTriagePrompt(text, legions, opts.company));
    if (isChannelError(reply)) throw new Error(`模型通道返回错误：${String(reply || '').slice(0, 80)}`);
    return { ...validateTriage(parseJsonLoose(reply), legions), via: 'model' };
  } catch (e) {
    fallbackReason = String(e && e.message ? e.message : e).slice(0, 160);
  }
  return { ...triageByRules(text, legions), via: 'rules', fallbackReason };
}

module.exports = { triage, triageByRules, validateTriage, buildTriagePrompt, parseJsonLoose, isChannelError, hasCycle };
