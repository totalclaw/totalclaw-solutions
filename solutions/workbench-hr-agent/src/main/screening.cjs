/**
 * 招聘：JD 体检、简历结构化、三层筛选、面试题、邀约 / offer 草稿的提示词与结果校验（HR2–HR4）。
 *
 * 可信性规则（代码执行，不靠模型自觉）：
 *   - 歧视性用词由正则检查并给出原文（性别 / 年龄 / 婚育 / 户籍地域 / 民族外貌健康）
 *   - 简历字段：姓名、邮箱、电话、公司、学校必须在简历原文里出现，否则丢弃
 *   - 门禁：证据必须逐字出现在简历里；没有证据只能判 unknown——「简历未提及 ≠ 不满足」
 *   - 打分：0–4 锚定分，证据不在简历里的维度按 0 分计并标出，交人复核
 *   - 总分由代码按权重算；决定：必须项不满足 → 淘汰，必须项未知 → 待定，再按阈值
 * 思路参考 sliday/resume-job-matcher（无许可证，只借思路）、srbhr/Resume-Matcher（Apache-2.0，「分数代码算、不编造」原则）。
 */
const { appearsIn } = require('./docText.cjs');

const str = (v, n) => String(v ?? '').trim().slice(0, n);
const clip = (s, n = 16000) => (String(s || '').length > n ? `${String(s).slice(0, n)}\n…（后文略）` : String(s || ''));

// ── JD 体检（规则）──
const BIAS_RULES = [
  { kind: '性别', re: /限男|限女|仅限男|仅限女|男性优先|女性优先|男士优先|女士优先|男生优先|女生优先/g },
  { kind: '年龄', re: /\d{2}\s*(?:周岁|岁)\s*(?:以下|以内|以上|之间)|年龄\s*(?:不超过|不大于|在)\s*\d{2}|\d{2}\s*[-~至]\s*\d{2}\s*(?:周岁|岁)/g },
  { kind: '婚育', re: /已婚已育|已婚|未婚|已育|婚育|无生育计划/g },
  { kind: '户籍地域', re: /本地户口|本地户籍|限.{0,4}户籍|户籍不限外|不招.{0,6}(?:人|省籍)/g },
  { kind: '民族 / 外貌 / 健康', re: /汉族|民族限|身高\s*\d|形象(?:气质)?佳|五官端正|长相|乙肝|无纹身/g },
];

function checkJd(jd, gates = []) {
  const issues = [];
  for (const rule of BIAS_RULES) {
    for (const m of String(jd || '').matchAll(rule.re)) issues.push({ kind: rule.kind, text: m[0] });
  }
  const must = gates.filter((g) => g.severity === 'must').length;
  const warnings = [];
  if (must > 8) warnings.push(`必备条件 ${must} 条，过多会把合适的人筛掉，建议压到 8 条以内`);
  if (String(jd || '').length < 120) warnings.push('JD 太短，候选人看不清岗位职责');
  return { issues, warnings, mustCount: must };
}

function jdPrompt(info, company) {
  return [
    `你是「${company || '本公司'}」的招聘专员。按下面的岗位信息写一份 JD，并拆出筛选标准。`,
    `岗位：${info.title}；部门：${info.dept || '—'}；地点：${info.location || '—'}；薪资：${info.salary || '面议'}；人数：${info.headcount || 1}`,
    info.notes ? `补充：${info.notes}` : '',
    '要求：',
    '1. JD 含岗位职责、任职要求（区分必备与加分）、我们提供；不得出现性别、年龄、婚育、户籍、民族、外貌等歧视性要求。',
    '2. gates：硬条件（能在简历里核实的，如学历、年限、证书、技能），severity=must（必备）/prefer（加分），最多 10 条。',
    '3. dimensions：3–6 个评分维度，weight 权重（整数，合计 100），anchors 写 0–4 分各自的标准。',
    '只输出 JSON：{"jd":"完整 JD 文本","gates":[{"condition":"","severity":"must"}],"dimensions":[{"name":"","weight":30,"anchors":["0分…","1分…","2分…","3分…","4分…"]}]}',
  ]
    .filter(Boolean)
    .join('\n');
}

function normalizeJd(raw) {
  const gates = (Array.isArray(raw?.gates) ? raw.gates : [])
    .map((g, i) => ({ id: `g${i + 1}`, condition: str(g?.condition, 120), severity: g?.severity === 'must' ? 'must' : 'prefer' }))
    .filter((g) => g.condition)
    .slice(0, 12);
  const dims = (Array.isArray(raw?.dimensions) ? raw.dimensions : [])
    .map((d, i) => ({
      id: `d${i + 1}`,
      name: str(d?.name, 30),
      weight: Math.max(0, Number(d?.weight) || 0),
      anchors: Array.from({ length: 5 }, (_, k) => str(Array.isArray(d?.anchors) ? d.anchors[k] : '', 120)),
    }))
    .filter((d) => d.name)
    .slice(0, 8);
  return { jd: str(raw?.jd, 6000), gates, dims: normalizeWeights(dims) };
}

/** 权重归一到合计 100（整数，余数给最大的那项）；全 0 时平均 */
function normalizeWeights(dims) {
  if (!dims.length) return dims;
  const sum = dims.reduce((n, d) => n + (Number(d.weight) || 0), 0);
  const out = dims.map((d) => ({ ...d, weight: sum > 0 ? Math.floor(((Number(d.weight) || 0) * 100) / sum) : Math.floor(100 / dims.length) }));
  const rest = 100 - out.reduce((n, d) => n + d.weight, 0);
  const top = out.reduce((a, b) => (b.weight > a.weight ? b : a), out[0]);
  top.weight += rest;
  return out;
}

// ── 简历结构化（JSON Resume + 中文扩展字段）──
function resumePrompt(text) {
  return [
    '把下面的简历整理成结构化数据。只写简历里有的内容，没有的留空，不要推测或补全。',
    '只输出 JSON：{"basics":{"name":"","email":"","phone":"","location":""},"work":[{"name":"公司","position":"职位","startDate":"","endDate":"","summary":""}],"education":[{"institution":"学校","area":"专业","studyType":"学历","endDate":""}],"skills":[{"name":""}],"cn":{"expectedSalary":"","availableFrom":"","hometown":"","yearsOfExperience":""}}',
    '',
    '简历：',
    clip(text),
  ].join('\n');
}

function normalizeResume(raw, text) {
  const has = (v) => !!v && appearsIn(text, v);
  const b = raw?.basics || {};
  const email = /^[\w.+-]+@[\w-]+\.[\w.]+$/.test(str(b.email, 80)) && has(b.email) ? str(b.email, 80) : '';
  const phoneDigits = String(b.phone || '').replace(/\D/g, '');
  const phone = phoneDigits.length >= 7 && String(text).replace(/\D/g, '').includes(phoneDigits) ? str(b.phone, 30) : '';
  const work = (Array.isArray(raw?.work) ? raw.work : [])
    .filter((w) => has(w?.name))
    .map((w) => ({ name: str(w.name, 80), position: str(w.position, 60), startDate: str(w.startDate, 20), endDate: str(w.endDate, 20), summary: str(w.summary, 300) }))
    .slice(0, 12);
  const education = (Array.isArray(raw?.education) ? raw.education : [])
    .filter((e) => has(e?.institution))
    .map((e) => ({ institution: str(e.institution, 80), area: str(e.area, 60), studyType: str(e.studyType, 20), endDate: str(e.endDate, 20) }))
    .slice(0, 6);
  const skills = (Array.isArray(raw?.skills) ? raw.skills : []).map((s) => str(s?.name ?? s, 30)).filter((s) => s && has(s)).slice(0, 30);
  const cn = raw?.cn || {};
  return {
    basics: { name: has(b.name) ? str(b.name, 30) : '', email, phone, location: has(b.location) ? str(b.location, 40) : '' },
    work,
    education,
    skills,
    cn: { expectedSalary: has(cn.expectedSalary) ? str(cn.expectedSalary, 30) : '', availableFrom: has(cn.availableFrom) ? str(cn.availableFrom, 30) : '', hometown: has(cn.hometown) ? str(cn.hometown, 30) : '', yearsOfExperience: has(cn.yearsOfExperience) ? str(cn.yearsOfExperience, 20) : '' },
  };
}

// ── 筛选 ──
function screenPrompt(job, text) {
  return [
    `岗位：${job.title}`,
    '按下面的硬条件和评分维度评估这份简历。',
    '硬条件（逐条判断）：',
    ...job.gates.map((g) => `- ${g.id} [${g.severity === 'must' ? '必备' : '加分'}] ${g.condition}`),
    '评分维度（0–4 分，按锚点）：',
    ...job.dims.map((d) => `- ${d.id} ${d.name}：${d.anchors.map((a, i) => `${i}分=${a}`).join('；')}`),
    '',
    '规则：',
    '1. evidence 必须是简历里逐字摘出来的一句话（10–80 字），不能改写。',
    '2. 简历没提到的硬条件判 unknown，不要判 unmet；只有简历里有反证时才判 unmet，并给出反证原话。',
    '3. 打分必须有证据；找不到证据的维度给 0 分、evidence 留空。',
    '只输出 JSON：{"gates":[{"id":"g1","verdict":"met|unmet|unknown","evidence":""}],"scores":[{"id":"d1","score":0,"evidence":""}],"highlights":["优势，最多 3 条"],"gaps":["差距，最多 3 条"]}',
    '',
    '简历：',
    clip(text),
  ].join('\n');
}

/**
 * 校验筛选结果并由代码算总分与决定。
 * @returns ScreeningResult（与 todo 10 的数据结构一致，另带 flags）
 */
function normalizeScreening(raw, job, text, thresholds = { advance: 70, hold: 50 }) {
  const flags = [];
  const gates = job.gates.map((g) => {
    const r = (Array.isArray(raw?.gates) ? raw.gates : []).find((x) => x?.id === g.id) || {};
    let verdict = ['met', 'unmet', 'unknown'].includes(r.verdict) ? r.verdict : 'unknown';
    let evidence = str(r.evidence, 200);
    if (evidence && !appearsIn(text, evidence)) {
      flags.push(`${g.condition}：模型给的证据在简历里找不到`);
      evidence = '';
    }
    if (!evidence && verdict !== 'unknown') verdict = 'unknown'; // 没有原文证据，不能判满足或不满足
    return { id: g.id, condition: g.condition, severity: g.severity, verdict, evidence };
  });
  const scores = job.dims.map((d) => {
    const r = (Array.isArray(raw?.scores) ? raw.scores : []).find((x) => x?.id === d.id) || {};
    let score = Math.max(0, Math.min(4, Math.round(Number(r.score) || 0)));
    let evidence = str(r.evidence, 200);
    if (evidence && !appearsIn(text, evidence)) {
      flags.push(`${d.name}：证据在简历里找不到，按 0 分计`);
      evidence = '';
    }
    if (!evidence && score > 0) {
      if (!flags.some((f) => f.startsWith(`${d.name}：`))) flags.push(`${d.name}：没有证据，按 0 分计`);
      score = 0;
    }
    return { id: d.id, dimension: d.name, weight: d.weight, score, evidence };
  });
  const total = Math.round(scores.reduce((n, s) => n + (s.weight * s.score) / 4, 0) * 10) / 10;
  const mustUnmet = gates.filter((g) => g.severity === 'must' && g.verdict === 'unmet');
  const mustUnknown = gates.filter((g) => g.severity === 'must' && g.verdict === 'unknown');
  let decision;
  let why;
  if (mustUnmet.length) {
    decision = 'reject';
    why = `必备条件不满足：${mustUnmet.map((g) => g.condition).join('；')}`;
  } else if (mustUnknown.length) {
    decision = 'hold';
    why = `必备条件简历未体现，需人工确认：${mustUnknown.map((g) => g.condition).join('；')}`;
  } else if (total >= thresholds.advance) {
    decision = 'advance';
    why = `总分 ${total} ≥ ${thresholds.advance}`;
  } else if (total >= thresholds.hold) {
    decision = 'hold';
    why = `总分 ${total} 在 ${thresholds.hold}–${thresholds.advance} 之间`;
  } else {
    decision = 'reject';
    why = `总分 ${total} < ${thresholds.hold}`;
  }
  return {
    gates,
    scores,
    total,
    decision,
    why,
    flags,
    highlights: (Array.isArray(raw?.highlights) ? raw.highlights : []).map((x) => str(x, 80)).filter(Boolean).slice(0, 3),
    gaps: (Array.isArray(raw?.gaps) ? raw.gaps : []).map((x) => str(x, 80)).filter(Boolean).slice(0, 3),
  };
}

// ── 面试题与评分卡 ──
function interviewPrompt(job, cand) {
  return [
    `岗位：${job.title}。候选人：${cand.resume?.basics?.name || '候选人'}。`,
    `评分维度：${job.dims.map((d) => d.name).join('、')}`,
    `筛选发现的差距：${(cand.screening?.gaps || []).join('；') || '无'}；需确认的必备条件：${(cand.screening?.gates || []).filter((g) => g.verdict === 'unknown').map((g) => g.condition).join('；') || '无'}`,
    '出 6 道胜任力行为面试题（针对差距与待确认项优先）+ 2 道情景题；每题写考察维度和好回答的要点。',
    '只输出 JSON：{"questions":[{"q":"","dimension":"","lookFor":""}]}',
  ].join('\n');
}

function normalizeInterview(raw, job) {
  const names = new Set(job.dims.map((d) => d.name));
  const questions = (Array.isArray(raw?.questions) ? raw.questions : [])
    .map((x) => ({ q: str(x?.q, 300), dimension: names.has(x?.dimension) ? x.dimension : str(x?.dimension, 30), lookFor: str(x?.lookFor, 300) }))
    .filter((x) => x.q)
    .slice(0, 10);
  const scorecard = job.dims.map((d) => ({ dimension: d.name, weight: d.weight, anchors: d.anchors, score: null, note: '' }));
  return { questions, scorecard };
}

function invitePrompt(job, cand, company) {
  return [
    `以「${company || '本公司'}」招聘负责人的口吻，给候选人 ${cand.resume?.basics?.name || ''} 写一封面试邀约邮件（岗位：${job.title}）。`,
    `结合 TA 的经历写一句个性化的开头：${(cand.screening?.highlights || []).join('；')}`,
    '面试时间写成「【请填写】」占位，由人填；不要承诺薪资。',
    '只输出 JSON：{"subject":"","body":""}',
  ].join('\n');
}

function offerPrompt(job, cand, offer, company) {
  return [
    `以「${company || '本公司'}」人事部的口吻写一封录用通知书（offer）。`,
    `候选人：${cand.resume?.basics?.name || ''}；岗位：${job.title}；部门：${job.info?.dept || ''}；`,
    `薪资：${offer.salary || '【请填写】'}；入职日期：${offer.startDate || '【请填写】'}；试用期：${offer.probation || '【请填写】'}；工作地点：${job.info?.location || '【请填写】'}`,
    '内容：岗位与薪资、入职日期与报到材料、试用期、回复期限；试用期需符合劳动合同法。只输出正文。',
  ].join('\n');
}

const STAGES = ['sourcing', 'screening', 'interview', 'offer', 'onboarding', 'rejected'];
const DEFAULT_ONBOARDING = [
  '签订劳动合同与保密协议',
  '社保 / 公积金增员',
  '开通邮箱、办公软件与业务系统账号',
  '准备电脑与工位',
  '指定导师',
  '首日：公司介绍与制度培训',
  '首周：岗位培训与第一个小任务',
  '试用期目标与考核标准确认',
];

module.exports = {
  checkJd,
  jdPrompt,
  normalizeJd,
  normalizeWeights,
  resumePrompt,
  normalizeResume,
  screenPrompt,
  normalizeScreening,
  interviewPrompt,
  normalizeInterview,
  invitePrompt,
  offerPrompt,
  STAGES,
  DEFAULT_ONBOARDING,
  BIAS_RULES,
};
