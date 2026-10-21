/**
 * 校园智能问答的判定链。顺序即优先级：
 *   ① 敏感问题（心理危机、人身安全）→ 不经模型，给求助方式，置顶转办；
 *   ② FAQ 问法几乎一致 → 不经模型，原样给部门审定的答案；
 *   ③ 检索证据不够 → 不经模型，转部门；
 *   ④ 模型只依据检索到的原文作答；判 NO_ANSWER 也转部门；
 *   ⑤ 回答里出现原文没有的数字（日期、金额、电话…）→ 不采用模型的话，改为直接列出原文。
 * 能拒的分支一律不调模型，杜绝「提示词让它拒答、它却答了」。
 */
import type { CaAnswerKind, CaFaq, CaHit, CaSource } from '@totalclaw/ipc-contracts';
import { t as i18nT } from '@totalclaw/i18n';
import { NO_ANSWER, SOURCES_TAG, parseAnswer } from '../groundedQa.logic';
import { DEPT_GUESS_MIN, matchFaq, search, type SearchSource } from './kb';
import { FALLBACK_DOMAIN, classifyDomain, domainOf } from './domains';

/** 心理危机、人身安全、受侵害类：命中即走 ① */
export const SENSITIVE_PATTERNS: readonly RegExp[] = [
  /自杀|轻生|不想活|活不下去|结束(自己的)?生命|寻死|跳楼|割腕|安眠药.*(吃|吞)|想死/,
  /自残|伤害自己|划(伤|破)自己/,
  /被(人)?(打|殴打|威胁|跟踪|勒索|敲诈|性侵|猥亵|强奸)|校园欺凌|霸凌|性骚扰/,
  /被骗|电信诈骗|网络诈骗|裸聊|校园贷|套路贷|网贷.*(还不上|逾期)/,
  /抑郁(症)?.*(严重|很久|好久)|崩溃|绝望/,
];

export function isSensitive(question: string): boolean {
  const q = String(question || '');
  return SENSITIVE_PATTERNS.some((re) => re.test(q));
}

export function sensitiveReply(hotline: string, dept: string): string {
  const lines = [
    i18nT('你的问题我们很重视，请先确保自己的安全。'),
    i18nT('如果正处在危险中，请立即拨打 110（报警）或 120（急救）。'),
  ];
  if (hotline) lines.push(i18nT('学校求助电话：{p0}', { p0: hotline }));
  lines.push(i18nT('也可以马上联系你的辅导员或身边信任的老师、同学。这条消息已经提醒{p0}的老师，会尽快联系你。', { p0: dept }));
  return lines.join('\n');
}

export function noEvidenceReply(dept: string): string {
  return i18nT('知识库里还没有这个问题的依据，我不会凭猜测回答。问题已转给{p0}，答复后会在「我的问题」里看到。', { p0: dept });
}

export function toSource(h: CaHit): CaSource {
  return { kind: h.kind, id: h.id, title: h.title, dept: h.dept, snippet: h.text.slice(0, 220) };
}

export function buildAnswerPrompt(question: string, hits: readonly CaHit[], schoolName: string): string {
  const refs = hits.map((h, i) => `${i18nT('资料 {n}：{title}（{dept}）', { n: String(i + 1), title: h.title, dept: h.dept || i18nT('未分部门') })}\n${h.text}`).join('\n\n');
  return [
    i18nT('你是{p0}的校园服务助手，回答学生和老师的问题。你只能依据下面给出的资料原文回答，不得补充资料之外的任何内容，不得推测。', { p0: schoolName }),
    i18nT('直接给出答案：不要开场白，不要复述问题，不要写「根据资料」之类的话。'),
    i18nT('时间、地点、金额、电话、条件等具体信息必须与资料原文一字不差；资料里没有的具体信息一律不写。'),
    i18nT('用纯文本输出，不要使用 Markdown 符号；需要分点时用「1. 2. 3.」。'),
    i18nT('资料只能回答问题的一部分时，就回答这一部分。'),
    `${i18nT('只有资料与问题完全无关时，才只输出：')}${NO_ANSWER}`,
    `${i18nT('最后单独一行写出实际用到的资料编号，格式：')}${SOURCES_TAG} 1,3`,
    i18nT('请用提问者使用的语言回答。'),
    '',
    i18nT('=== 可用资料 ==='),
    refs,
    '',
    i18nT('=== 问题 ==='),
    question,
  ].join('\n');
}

/** 数字比对用：去空白、全角转半角、去千分位 */
function digitsNorm(s: string): string {
  return String(s || '')
    .replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0))
    .replace(/(\d),(?=\d{3})/g, '$1')
    .replace(/\s+/g, '');
}

/**
 * 回答里出现、但所用资料原文里都没有的数字。
 * 只查 2 位以上的数和带小数的数：「1. 2. 3.」分点序号、单个个位数不算。
 */
export function unsupportedNumbers(answer: string, sourcesText: string): string[] {
  const hay = digitsNorm(sourcesText);
  const nums = digitsNorm(answer).match(/\d+(?:\.\d+)?/g) || [];
  const bad = new Set<string>();
  for (const n of nums) {
    if (n.length < 2 && !n.includes('.')) continue;
    if (!hay.includes(n)) bad.add(n);
  }
  return [...bad];
}

export function quoteReply(hits: readonly CaHit[]): string {
  return [
    i18nT('以下是知识库里的相关原文，请以原文为准：'),
    ...hits.slice(0, 3).map((h, i) => `${i + 1}. 《${h.title}》：${h.text.replace(/\s+/g, ' ').slice(0, 260)}`),
  ].join('\n');
}

export interface AskInput {
  question: string;
  source: SearchSource;
  faqs: readonly CaFaq[];
  minScore: number;
  schoolName: string;
  hotline: string;
  sensitiveDept: string;
  /** 没有来源可判部门时转给谁 */
  defaultDept: string;
  llm: (prompt: string) => Promise<{ text: string; model: string }>;
}

export interface AskOutput {
  kind: CaAnswerKind;
  /** 分到的领域助手 */
  domain: string;
  text: string;
  sources: CaSource[];
  /** 需要转办时填部门 */
  ticketDept?: string;
  faqId?: string;
  model?: string;
  /** 被核掉的数字（quote 时） */
  unsupported?: string[];
}

/**
 * 没有依据时转给谁：最相关来源的部门（相关度够）→ 领域助手对应的部门 → 待分派。
 * 实测「食堂有没有清真窗口」最相关的是新生入学指南（0.13），按来源会错转招生办；按领域（后勤）才对。
 */
export function routeDept(hits: readonly CaHit[], domain: string, fallback: string): string {
  const top = hits.find((h) => h.dept);
  if (top && top.score >= DEPT_GUESS_MIN) return top.dept;
  if (domain !== FALLBACK_DOMAIN) return domainOf(domain).dept;
  return fallback;
}

export async function answerQuestion(input: AskInput): Promise<AskOutput> {
  const q = String(input.question || '').trim();
  if (isSensitive(q)) {
    return { kind: 'sensitive', domain: 'wellbeing', text: sensitiveReply(input.hotline, input.sensitiveDept), sources: [], ticketDept: input.sensitiveDept };
  }
  const domain = classifyDomain(q);
  const faq = matchFaq(input.faqs, q);
  if (faq) {
    return { kind: 'faq', domain, text: faq.faq.answer, faqId: faq.faq.id, sources: [{ kind: 'faq', id: faq.faq.id, title: faq.faq.question, dept: faq.faq.dept, snippet: faq.faq.answer.slice(0, 220) }] };
  }
  const hits = search(input.source, q, 6);
  const top = hits[0];
  if (!top || top.score < input.minScore) {
    const dept = routeDept(hits, domain, input.defaultDept);
    return { kind: 'no_evidence', domain, text: noEvidenceReply(dept), sources: [], ticketDept: dept };
  }
  const usable = hits.filter((h) => h.score >= input.minScore * 0.6);
  const { text: raw, model } = await input.llm(buildAnswerPrompt(q, usable, input.schoolName));
  const parsed = parseAnswer(raw, usable.length);
  if (parsed.noAnswer) {
    const dept = routeDept(usable, domain, input.defaultDept);
    return { kind: 'no_evidence', domain, text: noEvidenceReply(dept), sources: [], ticketDept: dept, model };
  }
  const used = parsed.used.map((i) => usable[i]).filter(Boolean);
  const bad = unsupportedNumbers(parsed.text, used.map((h) => h.text).join('\n'));
  if (bad.length) {
    return { kind: 'quote', domain, text: quoteReply(used), sources: used.map(toSource), model, unsupported: bad };
  }
  return { kind: 'answer', domain, text: parsed.text, sources: used.map(toSource), model };
}
