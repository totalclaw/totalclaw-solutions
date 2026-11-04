/**
 * 智能检索的两条快慢通道（纯逻辑，可单测）：
 *   简单问题亚秒直答：和「常见问题」里已确认的问法足够像（字二元组相似度 ≥ 阈值）→ 直接给已确认的答案，不检索、不调模型；
 *                    引用的制度已经换版 / 下线的常见问题不直答（答案可能过时），走正常问答
 *   复杂问题多步检索：一个问题里含多个子问 / 比较 / 汇总 → 先拆成子问题，逐个检索，再合并证据作答
 */

const clean = (s) => String(s || '').toLowerCase().replace(/[\s，。！？、；：,.!?;:“”"'（）()【】\[\]《》<>·…—\-]+/g, '');

/**
 * 比相似度前去掉口语虚词（请问 / 吗 / 呢 / 的 / 是 / 要 / 能…）：同一个问题换个说法，差的多是这些字，
 * 留着它们会把「大额存单起存金额要多少」和「…是多少？」的相似度压到 0.8 以下、「营销材料审核要多久」压到 0.6。
 * 只用于相似度，不改 clean()（去重判等仍按原文）
 */
const FILLER = /请问|一下|麻烦|能不能|可不可以|是不是|我想|我要|想知道|吗|呢|啊|呀|吧|的|了|是|要|能|可以|得/g;
function bigrams(s) {
  const t = clean(s).replace(FILLER, '');
  const out = new Set();
  for (let i = 0; i + 1 < t.length; i += 1) out.add(t.slice(i, i + 2));
  return out;
}
/** 字二元组的 Dice 相似度（0..1），中文问法换个说法也稳 */
function similarity(a, b) {
  const A = bigrams(a); const B = bigrams(b);
  if (!A.size || !B.size) return 0;
  let n = 0;
  for (const x of A) if (B.has(x)) n += 1;
  return (2 * n) / (A.size + B.size);
}

/** 在常见问题里找最像的一条；返回 { faq, score } 或 null */
function faqMatch(q, faqs, { threshold = 0.7 } = {}) {
  let best = null;
  for (const f of faqs || []) {
    if (f.disabled) continue;
    for (const variant of [f.q, ...(f.alts || [])]) {
      const s = clean(variant) === clean(q) ? 1 : similarity(q, variant);
      if (!best || s > best.score) best = { faq: f, score: s };
    }
  }
  return best && best.score >= threshold ? best : null;
}

/** 常见问题引用的制度版本还有效吗（换版 / 下线 → 不能直答） */
/** 只依据知识库资料（没有制度条款）的常见问题多久后要重新确认：知识库资料没有版本号，换了内容也看不出来 */
const KB_ONLY_FAQ_DAYS = 90;

function faqFresh(faq, policies, policyActive, now = Date.now()) {
  const cites = faq.citations || [];
  for (const c of cites) {
    if (c.kind && c.kind !== 'policy') continue;
    if (!c.policyId) continue;
    const p = (policies || []).find((x) => x.id === c.policyId);
    if (!p || !policyActive(p) || (c.version && p.version !== c.version)) return false;
  }
  const hasPolicy = cites.some((c) => (!c.kind || c.kind === 'policy') && c.policyId);
  if (!hasPolicy && cites.some((c) => c.kind === 'kb')) {
    const at = Date.parse(faq.updatedAt || faq.createdAt || '');
    if (!Number.isFinite(at) || now - at > KB_ONLY_FAQ_DAYS * 86400000) return false;
  }
  return true;
}

/** 复杂问题判定：多个问号 / 「分别」「对比」「区别」「以及」等并列比较词 / 很长 */
function isComplexQuestion(q) {
  const s = String(q || '');
  if ((s.match(/[？?]/g) || []).length >= 2) return true;
  if (/分别|对比|比较|区别|差异|以及|同时|和.{1,12}(各|分别)|哪些.{0,10}(条件|情况)/.test(s) && s.length >= 12) return true;
  return s.replace(/\s/g, '').length > 60;
}

/** 模型拆出的子问题：去空、去重、限 4 个；拆不出来就用原问题 */
function normalizeSubQuestions(raw, q) {
  const list = (Array.isArray(raw?.questions) ? raw.questions : Array.isArray(raw) ? raw : []).map((x) => String(x || '').trim().slice(0, 120)).filter((x) => x.length >= 2);
  const out = [];
  for (const x of list) if (!out.some((y) => similarity(x, y) > 0.9)) out.push(x);
  return out.length ? out.slice(0, 4) : [String(q || '')];
}

module.exports = { KB_ONLY_FAQ_DAYS, clean, bigrams, similarity, faqMatch, faqFresh, isComplexQuestion, normalizeSubQuestions };
