/**
 * HR8 绩效评估（纯逻辑，可单测）。
 *
 * 同筛选一样的口径：模型只起草目标、给建议分和证据；证据必须是自评 / 上级评价里的原话，找不到的建议分作废并标复核；
 * 总分与等级由程序按权重算；上级可以逐项改分（改过的以上级为准）。
 */
const { normalizeWeights } = require('./screening.cjs');
const { appearsIn } = require('./docText.cjs');

const str = (v, n) => String(v ?? '').trim().slice(0, n);
/** 等级线（总分 0–100） */
const GRADES = [
  { grade: 'A', min: 90, label: '卓越' },
  { grade: 'B', min: 75, label: '良好' },
  { grade: 'C', min: 60, label: '合格' },
  { grade: 'D', min: 0, label: '待改进' },
];

function goalsPrompt(p) {
  return [
    `为「${p.employee}」（${p.dept || '未填部门'}${p.position ? ` · ${p.position}` : ''}）起草「${p.period}」的绩效考核目标。`,
    p.context ? `参考（岗位职责 / 上期情况）：\n${str(p.context, 3000)}` : '',
    '要求：3–6 项，可衡量（写清目标值），weight 为整数权重，合计 100；不编造该员工的具体业绩数字。',
    '只输出 JSON：{"goals":[{"name":"","weight":30,"target":"目标值与衡量方式"}]}',
  ]
    .filter(Boolean)
    .join('\n');
}

function normalizeGoals(raw) {
  const list = (Array.isArray(raw?.goals) ? raw.goals : Array.isArray(raw) ? raw : [])
    .slice(0, 8)
    .map((g, i) => ({ id: `k${i + 1}`, name: str(g?.name, 60), weight: Math.max(0, Number(g?.weight) || 0), target: str(g?.target, 200) }))
    .filter((g) => g.name);
  return normalizeWeights(list);
}

function suggestPrompt(perf) {
  return [
    `给「${perf.employee}」「${perf.period}」的绩效逐项打建议分（0–4：0 未完成、1 部分完成、2 基本达成、3 达成、4 超出）。`,
    '每项必须给 evidence：从下面的自评或上级评价里**原样摘一句**；材料里没提到的这一项 score 填 null、evidence 留空，不要推测。',
    '考核目标：',
    ...perf.goals.map((g) => `- ${g.id} ${g.name}（权重 ${g.weight}，目标：${g.target || '未写'}）`),
    `自评：\n${str(perf.selfReview, 4000) || '（无）'}`,
    `上级评价：\n${str(perf.managerReview, 4000) || '（无）'}`,
    '只输出 JSON：{"items":[{"id":"k1","score":3,"evidence":"原话"}],"summary":"一句话总评"}',
  ].join('\n');
}

/** 建议分：证据必须出现在评价原文里，否则作废（score=null，flag） */
function normalizeSuggestion(raw, perf) {
  const material = `${perf.selfReview || ''}\n${perf.managerReview || ''}`;
  const byId = new Map((Array.isArray(raw?.items) ? raw.items : []).map((x) => [String(x?.id || ''), x]));
  const items = perf.goals.map((g) => {
    const x = byId.get(g.id) || {};
    const score = Number.isInteger(x.score) && x.score >= 0 && x.score <= 4 ? x.score : null;
    const evidence = str(x.evidence, 300);
    if (score === null) return { id: g.id, score: null, evidence: '', flag: '材料里没提到，需上级打分' };
    if (!evidence || !appearsIn(material, evidence)) return { id: g.id, score: null, evidence: '', flag: '建议分的证据不在评价原文里，已作废，需上级打分' };
    return { id: g.id, score, evidence, flag: null };
  });
  return { items, summary: str(raw?.summary, 200) };
}

/**
 * 总分 = Σ 权重 × 最终分 / 4；最终分 = 上级改过的分 ?? 有证据的建议分。
 * 有任何一项没分 → complete=false、不出等级（不拿 0 分顶）。
 */
function computePerf(perf) {
  const sug = new Map((perf.suggestion?.items || []).map((x) => [x.id, x]));
  const rows = perf.goals.map((g) => {
    const m = perf.managerScores?.[g.id];
    const s = sug.get(g.id);
    const final = Number.isInteger(m) && m >= 0 && m <= 4 ? m : s && Number.isInteger(s.score) ? s.score : null;
    return { id: g.id, name: g.name, weight: g.weight, final, by: Number.isInteger(m) ? 'manager' : final === null ? null : 'ai' };
  });
  const complete = rows.length > 0 && rows.every((r) => r.final !== null);
  const total = Math.round(rows.reduce((n, r) => n + (r.final === null ? 0 : (r.weight * r.final) / 4), 0) * 10) / 10;
  const g = complete ? GRADES.find((x) => total >= x.min) : null;
  return { rows, total, complete, grade: g ? g.grade : null, gradeLabel: g ? g.label : null, missing: rows.filter((r) => r.final === null).map((r) => r.name) };
}

module.exports = { GRADES, goalsPrompt, normalizeGoals, suggestPrompt, normalizeSuggestion, computePerf };
