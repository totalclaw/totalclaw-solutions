/**
 * 招标公告 → 要点：**先规则，后模型**。
 *
 * 编号、预算、保证金、截止时间这些是会被写进标书封面和投标函的硬数字，模型抄错一位
 * 就是废标。所以凡是能用正则从原文里**原样截出来**的，一律不交给模型；模型只负责
 * 规则覆盖不到的部分（资格条款、评分办法、必交材料的条目化），且每条都要能在原文里
 * 找到出处，找不到的丢掉（verifyAgainstText）。
 *
 * 正则与关键词表都在 matchPatterns.ts（匹配模式不翻译）。纯函数，无 I/O。
 */
import { t as i18nT } from '@totalclaw/i18n';
import type { BidWriterNotice, BidWriterRequirement, BidWriterRequirementKind } from '@totalclaw/ipc-contracts';
import {
  CODE_LIKE_RE, CONTACT_LIKE_RE, DATE_LIKE_RE, DECLARATION_QUALIFICATION_RE, DEFINITION_SENTENCE_RE,
  ENTRUST_RE, EVIDENCE_QUALIFICATION_RE, FIELD_LABELS, INFO_BLOCK, ITEM_RE,
  LABEL_TAIL_RE, MANDATORY_RE, MONEY_RE, ORG_REJECT_RE, ORG_TAIL_RE, PUNCT_RE, SECTION_KIND,
  isHeadingShape,
} from './matchPatterns';

/**
 * 网页直出的公告常常**整篇没有换行**：用全角空格「　　」当段落分隔，
 * 「　　一、项目基本情况：　　1、项目编号：…；　　2、项目名称：…」全挤在一行。
 * 这样一来「标签必须在行首」的判据失效、逐条要求也一条都切不出来（用户实测 0 条要求）。
 * 所以解析前先把结构还原成行：全角双空格、中文序号、（一）、1、 这些都断行。
 */
export function normalizeNoticeText(raw: string): string {
  return String(raw || '')
    .replace(/\r/g, '')
    .replace(/[\u3000]{2,}/g, '\n')                                   // 　　＝段落分隔
    .replace(/([；;。])\s*(?=[（(]?[一二三四五六七八九十]{1,3}[、）)])/g, '$1\n')
    .replace(/([；;。])\s*(?=\d{1,2}\s*[、.．])/g, '$1\n')
    .replace(/(?<=[^\n])(?=[（(][一二三四五六七八九十]{1,3}[）)])/g, '\n') // （一）（二）另起一行
    .replace(/[ \t\u3000]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

type FieldKey = keyof typeof FIELD_LABELS;

interface Candidate {
  value: string;
  score: number;
}

/** 正则转义：标签词里有 () 之类 */
function escapeRe(raw: string): string {
  return raw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * 扫出某个字段的所有候选。
 *
 * 标签必须处在**字段位**：行首（可带「（一）」「1.」这类序号）或紧跟空白/顿号/括号，
 * 且后面要有冒号、或「为/是」、或至少两个空格 —— 正文里的「…为采购人提供…」因此不会中招。
 */
function collectCandidates(text: string, labels: readonly string[]): Candidate[] {
  const out: Candidate[] = [];
  for (const label of labels) {
    const re = new RegExp(
      // 边界要含 / ：真实公告有「提交投标文件截止时间/开标时间：…」这种并列标签
      `(^|[\\n\\s\u3000、，,；;（(【\\[/／])`
      + `(?:[（(]?\\s*[0-9一二三四五六七八九十]{1,3}\\s*[）)、.．]\\s*)?`   // （一）/ 1. 这类序号
      + `${escapeRe(label)}`
      + `(?:和|及|与)?(?:地点|地址|方式)?`                                    // 「开标时间和地点」整体当标签
      + `(?:\\s*[/／、]\\s*[^\\n:：]{0,12})?`                                  // 「提交投标文件截止时间/开标时间：」这种并列标签
      + `\\s*(?:[:：]|为|是|\u3000| {2,})\\s*`
      + `([^\\n]{1,60})`,
      'g',
    );
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      const lineStart = m[1] === '' || /[\n]/.test(m[1]);
      const hasColon = /[:：]/.test(m[0].slice(0, m[0].length - m[2].length));
      const raw = m[2].replace(LABEL_TAIL_RE, '').replace(/[\s\u3000]+/g, ' ').trim();
      if (!raw) continue;
      out.push({
        value: raw,
        // 行首 + 冒号 = 典型字段行；标签越具体权重越高（这条要压过「越靠前越好」：
        // 真实公告里「（一）提交投标文件时间」在前、「（二）提交投标文件截止时间」在后，
        // 后者才是截止点）；位置只做很小的加权，用来在同样具体的两条里挑抬头那条。
        score: (lineStart ? 3 : 0) + (hasColon ? 3 : 0) + label.length * 0.5
          + Math.max(0, 1 - m.index / Math.max(1, text.length)),
      });
      if (out.length >= 40) break;
    }
  }
  return out;
}

/** 取值清洗：截到第一个句末标点，去掉尾部的「，其中」这类拖尾 */
function trimValue(raw: string, stopAtComma: boolean): string {
  const cut = stopAtComma ? raw.split(/[。；;，,]/)[0] : raw.split(/[。；;]/)[0];
  return cut.replace(/^[\s:：、，,]+/, '').replace(/[\s、，,]+$/, '').trim().slice(0, 120);
}

/** 按字段类型校验：不像就丢掉（宁可空着让用户手填，也不要填一句正文进去） */
function acceptValue(field: FieldKey, raw: string): string | null {
  const v = trimValue(raw, field !== 'budget' && field !== 'deposit');
  if (v.length < 2) return null;
  switch (field) {
    case 'bidDeadline':
    case 'openAt': {
      if (!DATE_LIKE_RE.test(v)) return null;
      return v;
    }
    case 'budget':
    case 'deposit': {
      const m = MONEY_RE.exec(raw);
      // 只去首尾空白：金额是要写进投标函的数字，原样保留（「人民币 8 万元」不改成「人民币8万元」）
      return m ? m[0].trim() : null;
    }
    case 'buyer':
    case 'agency': {
      if (ORG_REJECT_RE.test(v)) return null;
      if (v.length > 30) return null;
      // 机构名要么以机构后缀结尾，要么短且不含动词（有些公告写「XX 市人民医院（本部）」）
      const core = v.replace(/[（(][^）)]*[）)]\s*$/, '');
      return ORG_TAIL_RE.test(core) || core.length <= 20 ? v : null;
    }
    case 'contact': {
      return CONTACT_LIKE_RE.test(v) ? v : null;
    }
    case 'projectCode': {
      const token = v.split(/[\s\u3000]/)[0];
      return CODE_LIKE_RE.test(token) ? token : null;
    }
    default:
      return v;
  }
}

/**
 * 国内公告的固定写法：「（一）采购人信息 / 名称：X / 地址：… / 联系人：… / 联系方式：…」。
 * 机构名在**块里的「名称」**上，不在「采购人」那行本身 —— 只认标签行会一直抓不到。
 */
function pickFromInfoBlock(lines: string[], blockRe: RegExp, innerLabels: readonly string[]): string | undefined {
  for (let i = 0; i < lines.length; i += 1) {
    if (!blockRe.test(lines[i])) continue;
    for (let j = i + 1; j < Math.min(i + 6, lines.length); j += 1) {
      for (const label of innerLabels) {
        const m = new RegExp(`^\\s*(?:[（(]?\\s*[0-9一二三四五六七八九十]{1,3}\\s*[）)、.．]\\s*)?${escapeRe(label)}\\s*[:：]\\s*(.+)$`).exec(lines[j]);
        if (m?.[1]?.trim()) return m[1].split(/[。；;]/)[0].trim().slice(0, 60);
      }
    }
  }
  return undefined;
}

/** 「A 受 B 的委托」：国内公告开篇的固定句式，A=代理机构，B=采购人 */
function pickFromEntrustSentence(text: string): { agency?: string; buyer?: string } {
  const m = ENTRUST_RE.exec(text);
  if (!m) return {};
  return { agency: m[1].trim(), buyer: m[2].trim() };
}

/** 挑一个：所有候选按类型校验后取分最高的；一个都不合格就返回 undefined（如实留空） */
export function pickField(text: string, field: FieldKey): string | undefined {
  const scored = collectCandidates(text, FIELD_LABELS[field])
    .map((c) => ({ ...c, clean: acceptValue(field, c.value) }))
    .filter((c) => c.clean) as Array<Candidate & { clean: string }>;
  if (!scored.length) return undefined;
  scored.sort((a, b) => b.score - a.score || a.clean.length - b.clean.length);
  return scored[0].clean;
}

function requirementId(index: number): string {
  return `req_${index.toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
}

/** 评分办法里的分值：「技术方案 40 分」 */
function pointsOf(text: string): number | undefined {
  const m = /(\d{1,3}(?:\.\d)?)\s*分/.exec(text);
  if (!m) return undefined;
  const v = Number(m[1]);
  return Number.isFinite(v) && v > 0 && v <= 100 ? v : undefined;
}

/**
 * 按小标题分段 + 逐条切分，得到带类型的要求清单。
 * 只做确定性切分：切不出来的整段留给模型去条目化。
 */
export function extractRequirementsByRules(text: string, sourceLabel: string, locator?: string): BidWriterRequirement[] {
  // 先还原结构：网页直出的公告整篇没有换行，不还原的话一条都切不出来
  const lines = normalizeNoticeText(text).split('\n').map((l) => l.trim());
  const out: BidWriterRequirement[] = [];
  let current: BidWriterRequirementKind | null = null;
  let index = 0;

  for (const line of lines) {
    if (!line) continue;
    const isItem = ITEM_RE.test(line);
    const body = line.replace(ITEM_RE, '').trim();
    // 小标题 vs 正文条目：两者都长得像「四、格式要求」/「1. 投标文件正本一份，密封递交」，
    // 只看关键词会把正文条目当小标题吃掉（实测「1. …密封递交…」命中"密封"整条丢失）。
    // 判据：去掉序号后足够短、且句内没有逗号顿号分号 —— 小标题不会有这些。
    if (isHeadingShape(body)) {
      const hit = SECTION_KIND.find((s) => s.re.test(body));
      if (hit) { current = hit.kind as BidWriterRequirementKind; continue; }
    }
    if (!current) continue;
    if (!isItem || body.length < 6) continue;
    if (body.length > 400) continue;
    // 「重大违法记录，是指……」这类是**对上一条的解释**，不是一条要求 —— 进了清单就变成
    // 一行永远确认不了的「待确认」（用户 2026-09-20 实测截图里就有这么一条）
    if (DEFINITION_SENTENCE_RE.test(body)) continue;
    index += 1;
    out.push({
      id: requirementId(index),
      kind: current,
      text: body.slice(0, 400),
      points: current === 'scoring' ? pointsOf(body) : undefined,
      mandatory: current === 'qualification' || MANDATORY_RE.test(body),
      source: { kind: 'notice', label: sourceLabel, locator, quote: body.slice(0, 160) },
    });
    if (out.length >= 120) break;
  }
  return out;
}

/**
 * 公告头部字段（编号 / 预算 / 时间 …）。
 *
 * 取值顺序：① 「采购人信息 / 代理机构信息」块里的「名称」（国内公告的固定写法）；
 * ② 字段位上的标签（标签必须在行首或分隔符后 + 冒号，正文里的「…为采购人提供…」不会中招）；
 * ③ 开篇「A 受 B 的委托」句式。三条都不成立就留空，**宁可让用户手填也不填一句正文进去**。
 */
export function extractNoticeFacts(text: string): Omit<BidWriterNotice, 'requirements'> {
  const t = normalizeNoticeText(text);
  const lines = t.split('\n').map((l) => l.trim()).filter(Boolean);
  const entrust = pickFromEntrustSentence(t);

  const buyerBlock = pickFromInfoBlock(lines, INFO_BLOCK.buyer.head, INFO_BLOCK.buyer.labels);
  const agencyBlock = pickFromInfoBlock(lines, INFO_BLOCK.agency.head, INFO_BLOCK.agency.labels);
  const contactBlock = pickFromInfoBlock(lines, INFO_BLOCK.contact.head, INFO_BLOCK.contact.labels);

  return {
    projectCode: pickField(t, 'projectCode'),
    buyer: buyerBlock || pickField(t, 'buyer') || entrust.buyer,
    agency: agencyBlock || pickField(t, 'agency') || entrust.agency,
    budget: pickField(t, 'budget'),
    deposit: pickField(t, 'deposit'),
    bidDeadline: pickField(t, 'bidDeadline'),
    openAt: pickField(t, 'openAt'),
    contact: contactBlock || pickField(t, 'contact'),
  };
}

/** 模型返回的条目必须能在原文里找到依据，否则丢掉（防编造）。 */
export function verifyAgainstText(text: string, quote: string): boolean {
  const norm = (s: string) => s.replace(PUNCT_RE, '');
  const haystack = norm(text);
  const needle = norm(quote);
  if (needle.length < 6) return false;
  if (haystack.includes(needle)) return true;
  // 模型常做轻微改写：取前 12 个字符当指纹再试一次
  return haystack.includes(needle.slice(0, 12));
}

/** 规则抽完后给用户的提示（哪些关键字段没抓到，需要手填） */
export function missingFactWarnings(facts: Omit<BidWriterNotice, 'requirements'>): string[] {
  const miss: string[] = [];
  if (!facts.projectCode) miss.push(i18nT('招标编号'));
  if (!facts.buyer) miss.push(i18nT('采购人'));
  if (!facts.bidDeadline) miss.push(i18nT('投标截止时间'));
  return miss.length ? [i18nT('这些关键信息没在公告里抓到，请手工补：{list}', { list: miss.join(i18nT('、')) })] : [];
}

/**
 * 资格条款该怎么判：
 *  · declaration —— 承诺即满足（政府采购法第二十二条那类），可以自动判满足；
 *  · evidence     —— 要资质 / 业绩 / 报表等材料，必须有依据或人工确认。
 * 两类词都命中时按 evidence 处理：宁可让人多看一眼，也不能把要材料的条款自动判满足。
 */
export function qualificationKind(text: string): 'declaration' | 'evidence' {
  const t = String(text || '');
  if (EVIDENCE_QUALIFICATION_RE.test(t)) return 'evidence';
  return DECLARATION_QUALIFICATION_RE.test(t) ? 'declaration' : 'evidence';
}
