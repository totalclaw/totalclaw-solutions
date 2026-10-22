/**
 * 合同审查的提示词与结果校验（LG4）。模型只负责判断与措辞；位置、统计、法条格式核对、缺失条款都由代码算。
 *
 *   预分析   合同类型（必须是模板之一或 other）、主体（名字必须在原文出现）、金额 / 期限（必须在原文出现）
 *   条款抽取 模型给 {clauseType, quote}，代码在原文找位置，找不到的丢弃
 *   逐条审查 分级、理由、法条依据、修订动作与条文；法条做格式核对（法名在清单、条号在范围），不合格的丢弃
 *   缺失条款 = 模板必备条款 − 已抽到的条款类别（代码算）∪ 模型补充的（只收合法类别 id）
 *   框架四问 义务是否单向 / 退出权是否对等 / 有无虚假前提 / 违约是否对称（思路参考 CSlawyer1985/contract-review-pro，未复制其内容）
 */
const { locate, appearsIn } = require('./docText.cjs');

const LEVELS = ['high', 'medium', 'low'];
const ACTIONS = ['replace', 'insert', 'delete', 'comment'];
const MAX_TEXT = 24000;

function clipText(s, n = MAX_TEXT) {
  const t = String(s || '');
  return t.length > n ? `${t.slice(0, n)}\n…（后文略，共 ${t.length} 字）` : t;
}

const str = (v, n) => String(v ?? '').trim().slice(0, n);

// ── 预分析 ──
function preAnalyzePrompt(text, playbooks) {
  return [
    '你是企业法务。阅读下面的合同，识别基本信息。',
    `合同类型只能从这些 id 里选一个，都不像就写 other：${playbooks.map((p) => `${p.id}（${p.name}）`).join('、')}`,
    '主体、金额、期限必须是合同原文里出现的原话，原文没有就留空，不要推测。',
    '只输出 JSON：{"contractType":"id","title":"合同名称","parties":[{"name":"原文中的主体全称","role":"甲方/乙方/买方/卖方…"}],"amount":"原文金额","term":"原文期限","focus":["建议重点审查的条款，最多 6 条"]}',
    '',
    '合同：',
    clipText(text),
  ].join('\n');
}

function normalizePreAnalysis(raw, text, playbooks) {
  const r = raw && typeof raw === 'object' ? raw : {};
  const ids = new Set(playbooks.map((p) => p.id));
  const parties = (Array.isArray(r.parties) ? r.parties : [])
    .map((p) => ({ name: str(p?.name, 80), role: str(p?.role, 20) }))
    .filter((p) => p.name && appearsIn(text, p.name));
  return {
    contractType: ids.has(r.contractType) ? r.contractType : guessType(text, playbooks),
    title: str(r.title, 80),
    parties,
    amount: r.amount && appearsIn(text, r.amount) ? str(r.amount, 60) : '',
    term: r.term && appearsIn(text, r.term) ? str(r.term, 60) : '',
    focus: (Array.isArray(r.focus) ? r.focus : []).map((x) => str(x, 40)).filter(Boolean).slice(0, 6),
  };
}

/** 模型没给或给错类型时按关键词猜 */
function guessType(text, playbooks) {
  const head = String(text || '').slice(0, 600);
  let best = 'other';
  let score = 0;
  for (const p of playbooks) {
    const n = (p.matchKeywords || []).filter((k) => head.includes(k)).length;
    if (n > score) {
      score = n;
      best = p.id;
    }
  }
  return best;
}

// ── 条款抽取 ──
function extractPrompt(text, clauseTypes) {
  return [
    '从合同里找出下列类别的条款，每条给出类别 id 与原文原话（逐字摘录一段，30–150 字，不要改写）。',
    `类别：${clauseTypes.map((c) => `${c.id}=${c.zh}`).join('；')}`,
    '合同没有的类别不要写。只输出 JSON：{"clauses":[{"clauseType":"类别id","quote":"原文原话","summary":"一句话概括"}]}',
    '',
    '合同：',
    clipText(text),
  ].join('\n');
}

function normalizeClauses(raw, paras, clauseTypes) {
  const ids = new Set(clauseTypes.map((c) => c.id));
  const out = [];
  let dropped = 0;
  for (const c of Array.isArray(raw?.clauses) ? raw.clauses : []) {
    if (!ids.has(c?.clauseType)) {
      dropped++;
      continue;
    }
    const loc = locate(paras, c.quote);
    if (!loc) {
      dropped++;
      continue;
    }
    if (out.some((x) => x.clauseType === c.clauseType && x.location.para === loc.para)) continue;
    out.push({ clauseType: c.clauseType, summary: str(c.summary, 80), location: loc });
  }
  out.sort((a, b) => a.location.para - b.location.para);
  return { clauses: out, dropped };
}

// ── 逐条审查 ──
const STANCE_LABEL = { first: '甲方 / 买方 / 委托方 / 用人单位', second: '乙方 / 卖方 / 受托方 / 劳动者', neutral: '中立（只做风险提示）' };

function reviewPrompt({ text, stance, playbook, clauses, clauseTypes }) {
  const name = (id) => clauseTypes.find((c) => c.id === id)?.zh || id;
  return [
    '你是代表我方的企业法务，审查下面的合同。',
    `我方立场：${STANCE_LABEL[stance.side] || STANCE_LABEL.neutral}${stance.partyName ? `（${stance.partyName}）` : ''}。`,
    stance.mustKeep?.length ? `必守项：${stance.mustKeep.join('；')}` : '',
    stance.tradeable?.length ? `可谈项：${stance.tradeable.join('；')}` : '',
    '',
    `审查模板「${playbook.name}」（每类条款：标准立场 / 可接受范围 / 需升级的情形）：`,
    ...playbook.entries.map((e) => `- ${name(e.clauseType)}（${e.clauseType}）：标准=${e.standard}；可接受=${e.acceptable}；升级=${e.escalateWhen}`),
    '',
    `已识别的条款：${clauses.map((c) => `${name(c.clauseType)}「${c.location.quote.slice(0, 40)}」`).join('；') || '（无）'}`,
    '',
    '要求：',
    '1. 逐条给出风险：level=high/medium/low（高=超出升级情形或对我方明显不利，中=需要谈判，低=提示）。',
    '2. quote 必须逐字摘自合同原文（插入新条款时可以为空）；不要报段落号。',
    '3. legalBasis 只写你确定存在的中国法律条文：{"law":"法律名称","article":"第X条"}；不确定就留空数组，不要编。',
    '4. action=replace（改写原文）/insert（新增条款）/delete（删除）/comment（只批注）；suggestion 写可直接放进合同的条文；fallback 写退让方案；priority=must（必争）/tradeable（可让）。',
    '5. missing 列出合同缺失的条款类别 id。',
    '6. framework 回答四问：oneSided 义务是否单向、exitSymmetric 退出权是否对等、falsePremise 是否有虚假或无法核实的前提、breachSymmetric 违约责任是否对称；answer=yes/no/unclear。',
    '只输出 JSON：{"risks":[{"clauseType":"id","quote":"原文","level":"high","reason":"为什么","legalBasis":[{"law":"","article":""}],"cost":"违约或损失后果","action":"replace","suggestion":"","fallback":"","priority":"must"}],"missing":["id"],"framework":{"oneSided":{"answer":"","note":""},"exitSymmetric":{"answer":"","note":""},"falsePremise":{"answer":"","note":""},"breachSymmetric":{"answer":"","note":""}},"overall":"一段总体意见"}',
    '',
    '合同：',
    clipText(text),
  ]
    .filter((x) => x !== '')
    .join('\n');
}

const CN_NUM = { 零: 0, 〇: 0, 一: 1, 二: 2, 两: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9 };
/** 「第一千二百六十条」「第58条」→ 数字 */
function articleNumber(s) {
  const m = /第?\s*([\d零〇一二两三四五六七八九十百千]+)\s*条/.exec(String(s || ''));
  if (!m) return null;
  const v = m[1];
  if (/^\d+$/.test(v)) return Number(v);
  let total = 0;
  let cur = 0;
  for (const ch of v) {
    if (ch in CN_NUM) cur = CN_NUM[ch];
    else {
      const unit = ch === '十' ? 10 : ch === '百' ? 100 : 1000;
      total += (cur || 1) * unit;
      cur = 0;
    }
  }
  return total + cur;
}

/** 法条格式核对：法名在清单（全称或简称）、条号不超出条数 */
function checkLegalBasis(list, statutes) {
  const kept = [];
  let dropped = 0;
  for (const b of Array.isArray(list) ? list : []) {
    const law = str(b?.law, 60).replace(/[《》]/g, '');
    const st = statutes.find((s) => s.name === law || s.aliases.includes(law) || s.name === `中华人民共和国${law}`);
    const n = articleNumber(b?.article || b?.law);
    if (!st || !n || n < 1 || n > st.maxArticle) {
      dropped++;
      continue;
    }
    kept.push({ law: st.name, article: `第${n}条`, verified: 'format' });
  }
  return { kept, dropped };
}

const FRAMEWORK_KEYS = ['oneSided', 'exitSymmetric', 'falsePremise', 'breachSymmetric'];

function normalizeReview(raw, { paras, clauseTypes, statutes, playbook, clauses }) {
  const ids = new Set(clauseTypes.map((c) => c.id));
  const risks = [];
  const stats = { droppedQuotes: 0, droppedBasis: 0 };
  for (const r of Array.isArray(raw?.risks) ? raw.risks : []) {
    const action = ACTIONS.includes(r?.action) ? r.action : 'comment';
    const reason = str(r?.reason, 400);
    if (!reason) continue;
    let location = null;
    if (r?.quote) location = locate(paras, r.quote);
    // 改写 / 删除 / 批注必须能定位到原文；新增条款可以没有锚点（放到合同末尾）
    if (!location && action !== 'insert') {
      stats.droppedQuotes++;
      continue;
    }
    const basis = checkLegalBasis(r?.legalBasis, statutes);
    stats.droppedBasis += basis.dropped;
    risks.push({
      id: `r${risks.length + 1}`,
      clauseType: ids.has(r?.clauseType) ? r.clauseType : 'other',
      location,
      level: LEVELS.includes(r?.level) ? r.level : 'medium',
      reason,
      legalBasis: basis.kept,
      cost: str(r?.cost, 200),
      action,
      suggestion: str(r?.suggestion, 1200),
      fallback: str(r?.fallback, 600),
      priority: r?.priority === 'must' ? 'must' : 'tradeable',
      accepted: false,
    });
  }
  const levelRank = { high: 0, medium: 1, low: 2 };
  risks.sort((a, b) => levelRank[a.level] - levelRank[b.level] || (a.location?.para ?? 1e9) - (b.location?.para ?? 1e9));
  const have = new Set(clauses.map((c) => c.clauseType));
  const missing = [...new Set([...(playbook.required || []).filter((id) => !have.has(id)), ...(Array.isArray(raw?.missing) ? raw.missing : []).filter((id) => ids.has(id) && !have.has(id))])];
  const framework = {};
  for (const k of FRAMEWORK_KEYS) {
    const v = raw?.framework?.[k] || {};
    framework[k] = { answer: ['yes', 'no', 'unclear'].includes(v.answer) ? v.answer : 'unclear', note: str(v.note, 200) };
  }
  return { risks, missing, framework, overall: str(raw?.overall, 1500), stats };
}

/** 风险汇总（代码算）：各级条数、必争条数、风险指数（100 起扣：高 15、中 6、低 2） */
function summarize(risks, missing) {
  const count = { high: 0, medium: 0, low: 0 };
  for (const r of risks) count[r.level]++;
  const index = Math.max(0, 100 - count.high * 15 - count.medium * 6 - count.low * 2 - missing.length * 3);
  return { count, must: risks.filter((r) => r.priority === 'must').length, missing: missing.length, index, verdict: count.high ? '建议修改后再签' : count.medium ? '可签，建议谈判' : '风险较低' };
}

// ── LG8 对方反驳推演 ──
function rebuttalPrompt(risk, stance) {
  return [
    `合同条款：「${risk.location?.quote || '（新增条款）'}」`,
    `我方（${STANCE_LABEL[stance.side] || '我方'}）的修改意见：${risk.suggestion || risk.reason}`,
    '站在对方立场，预判对方会怎么反驳（2–3 条），并给出我方的回应话术与可以让步的底线。简洁，分条。',
  ].join('\n');
}

// ── LG8 两版对比（段落级 LCS） ──
/** 两段文字的字对（bigram）Dice 系数 */
function similarity(a, b) {
  const grams = (t) => {
    const m = new Map();
    for (let i = 0; i < t.length - 1; i++) m.set(t.slice(i, i + 2), (m.get(t.slice(i, i + 2)) || 0) + 1);
    return m;
  };
  const x = grams(String(a).replace(/\s+/g, ''));
  const y = grams(String(b).replace(/\s+/g, ''));
  let inter = 0;
  for (const [k, v] of x) inter += Math.min(v, y.get(k) || 0);
  const total = [...x.values()].reduce((n, v) => n + v, 0) + [...y.values()].reduce((n, v) => n + v, 0);
  return total ? (2 * inter) / total : 0;
}

function compareVersions(a, b) {
  const A = a.map((p) => p.text.trim()).filter(Boolean);
  const B = b.map((p) => p.text.trim()).filter(Boolean);
  if (A.length * B.length > 4_000_000) throw new Error('文档太长，无法逐段对比');
  const dp = Array.from({ length: A.length + 1 }, () => new Uint16Array(B.length + 1));
  for (let i = A.length - 1; i >= 0; i--) for (let j = B.length - 1; j >= 0; j--) dp[i][j] = A[i] === B[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  const out = [];
  let i = 0;
  let j = 0;
  while (i < A.length || j < B.length) {
    if (i < A.length && j < B.length && A[i] === B[j]) {
      out.push({ type: 'same' });
      i++;
      j++;
    } else if (i < A.length && (j >= B.length || dp[i + 1][j] >= dp[i][j + 1])) out.push({ type: 'removed', text: A[i++] });
    else out.push({ type: 'added', text: B[j++] });
  }
  // 同一段连续改动里，每个新增段配最相似的删除段（字对重合 ≥ 40%）合成「修改」；不相干的分别算删和增
  const merged = [];
  for (let k = 0; k < out.length; ) {
    let e = k;
    while (e < out.length && out[e].type !== 'same') e++;
    const block = out.slice(k, e);
    const removed = block.filter((d) => d.type === 'removed');
    const used = new Set();
    const pairOf = new Map();
    for (const a of block.filter((d) => d.type === 'added')) {
      let best = null;
      let bestSim = 0.4;
      for (const r of removed) {
        if (used.has(r)) continue;
        const sim = similarity(r.text, a.text);
        if (sim >= bestSim) {
          best = r;
          bestSim = sim;
        }
      }
      if (best) {
        used.add(best);
        pairOf.set(a, best);
      }
    }
    for (const d of block) {
      if (d.type === 'removed' && used.has(d)) continue;
      merged.push(pairOf.has(d) ? { type: 'changed', from: pairOf.get(d).text, text: d.text } : d);
    }
    k = e + 1;
  }
  return merged;
}

module.exports = {
  preAnalyzePrompt,
  normalizePreAnalysis,
  guessType,
  extractPrompt,
  normalizeClauses,
  reviewPrompt,
  normalizeReview,
  checkLegalBasis,
  articleNumber,
  summarize,
  rebuttalPrompt,
  compareVersions,
  STANCE_LABEL,
};
