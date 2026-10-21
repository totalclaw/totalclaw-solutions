/**
 * 标书大纲：模板文本 → 章节骨架。
 *
 * 「上传标书模板」这件事的价值全在**章节骨架**上 —— 招标方给的「投标文件格式」里
 * 写死了要哪几章、顺序、每章要放什么。所以这里做的是确定性解析而不是交给模型猜：
 * 模型改一个字，用户下次生成就少一章，谁也说不清哪次对。
 *
 * 识别的标题形态与编号写法都在 matchPatterns.ts（匹配模式不翻译）。
 * 正文行（长句、以句号结尾、含大量标点）一律不当标题；标题下面紧跟的说明行收进 guide。
 *
 * 解析不出任何标题时回落内置标准大纲（国内公开招标常见的商务/技术/服务三段式），
 * 并在 note 里如实说明「模板没识别出标题，用的是标准大纲」——不许假装解析成功。
 */
import { t as i18nT } from '@totalclaw/i18n';
import type { BidWriterSection } from '@totalclaw/ipc-contracts';
import {
  BID_TITLE_WORDS, HEADING_PATTERNS, NUMBERING_PREFIXES, PLACEHOLDER_BRACES, PLACEHOLDER_BRACKETS,
  REQUIRED_TITLE_WORDS, looksLikeBody,
} from './matchPatterns';

export interface ParsedOutline {
  sections: BidWriterSection[];
  /** 解析说明：识别到几条、是否回落 */
  note: string;
  /** 真从模板里解析出来的（false = 回落内置大纲） */
  fromTemplate: boolean;
}

/** 带编号的标题（第X章 / 一、 / 1. / 1.1 / （一））—— 这类最可信 */
function numberedLevel(text: string): 1 | 2 | 3 | null {
  for (const p of HEADING_PATTERNS) {
    if (p.re.test(text)) return p.level;
  }
  return null;
}

/** 是不是「第X部分/篇/章」这种容器标题（底下还有子章节，本身不写实质内容） */
function isPartHeading(text: string): boolean {
  return HEADING_PATTERNS.some((p) => p.part && p.re.test(text));
}

/**
 * 裸标题行（没编号，靠词判）。**必须下面紧跟正文**才算标题 ——
 * 否则 docx 里的表格单元格（「序号」「响应承诺」「产品/服务名称」「质量标准」）
 * 会被一个个当成章节：用户那份模板实测被切出 73 章，一半是表头和目录条目。
 */
function bareTitleLevel(text: string, nextLine: string): 2 | null {
  if (text.length > 20 || !BID_TITLE_WORDS.test(text)) return null;
  if (/[／/]/.test(text)) return null;                      // 「产品/服务名称」这类表头
  const body = String(nextLine || '').trim();
  return body.length >= 40 ? 2 : null;                      // 下一行是正文段落才认
}

function headingLevel(line: string, nextLine: string): 1 | 2 | 3 | null {
  const text = line.trim();
  if (!text || looksLikeBody(text)) return null;
  const numbered = numberedLevel(text);
  if (numbered) return numbered;
  return bareTitleLevel(text, nextLine);
}

/** 去掉编号前缀，留下干净标题（编号在导出时统一重排，避免模板里 1/2/3 与实际章节错位） */
export function stripNumbering(raw: string): string {
  let out = String(raw || '');
  for (const re of NUMBERING_PREFIXES) out = out.replace(re, '');
  return out.replace(/[\s:：]+$/, '').trim();
}

/** 模板里常见的占位符：{{公司名称}} / ［填写］—— 收进 guide 提醒模型必须落实 */
function placeholderHints(line: string): string[] {
  const out: string[] = [];
  for (const m of line.matchAll(PLACEHOLDER_BRACES)) out.push(m[1].trim());
  for (const m of line.matchAll(PLACEHOLDER_BRACKETS)) out.push(m[1].trim());
  return out;
}

let seq = 0;
function sectionId(): string {
  seq += 1;
  return `sec_${Date.now().toString(36)}_${seq.toString(36)}`;
}

/** 内置标准大纲：模板缺失 / 解析不出标题时用它兜底。 */
export function builtinOutline(): BidWriterSection[] {
  const spec: Array<[1 | 2 | 3, string, string, boolean]> = [
    [1, i18nT('投标函及投标函附录'), i18nT('致采购人的正式投标函：确认按招标文件要求投标、报价总价、工期与有效期，并声明对招标文件无异议。'), true],
    [1, i18nT('法定代表人身份证明及授权委托书'), i18nT('法定代表人身份证明；如由代理人签署，附授权委托书并写明授权范围与期限。'), true],
    [1, i18nT('投标保证金证明'), i18nT('保证金缴纳凭证说明：金额、形式、递交时间，与招标公告要求逐项对应。'), true],
    [1, i18nT('投标人资格证明文件'), i18nT('营业执照、资质证书、认证证书、社保与纳税证明等资格材料清单及其有效期。'), true],
    [2, i18nT('企业基本情况'), i18nT('成立时间、注册资本、经营范围、组织机构与人员规模。'), false],
    [2, i18nT('资质与认证'), i18nT('逐项列出与本项目相关的资质、认证及编号、发证机关、有效期。'), false],
    [2, i18nT('类似项目业绩'), i18nT('近三年同类项目：项目名称、客户、合同金额、时间、验收情况。'), false],
    [1, i18nT('技术方案'), i18nT('针对招标文件的技术需求逐条响应，说明实现方式、关键指标与验证方法。'), true],
    [2, i18nT('总体设计与技术路线'), i18nT('总体架构、技术选型理由、与招标需求的对应关系。'), false],
    [2, i18nT('实施方案与进度计划'), i18nT('实施阶段划分、里程碑、交付物与进度保障措施。'), false],
    [2, i18nT('项目组织与人员配备'), i18nT('项目组织架构、关键岗位人员及其资历与投入比例。'), false],
    [2, i18nT('质量保证与风险控制'), i18nT('质量管理体系、过程检查节点、主要风险与应对预案。'), false],
    [1, i18nT('商务方案'), i18nT('报价构成、付款条件、工期承诺、知识产权与保密条款响应。'), true],
    [2, i18nT('报价说明'), i18nT('报价范围、计价方式、税费与不包含项说明（具体数字以报价表为准）。'), false],
    [1, i18nT('售后服务与培训方案'), i18nT('质保期、响应时效、服务团队、备件与培训安排。'), true],
    [1, i18nT('承诺书与其他材料'), i18nT('廉洁承诺、无违法记录声明及招标文件要求的其他附件。'), false],
  ];
  return spec.map(([level, title, guide, required]) => ({
    id: sectionId(),
    level,
    title,
    guide,
    required,
    state: 'todo' as const,
  }));
}

/**
 * 模板文本 → 章节骨架。
 * @param text 模板全文（documentExtractor 抽出来的纯文本）
 */
export function parseOutline(text: string): ParsedOutline {
  const lines = String(text || '')
    .replace(/\r/g, '')
    .split('\n')
    .map((l) => l.replace(/\t+/g, ' ').trim())
    .filter(Boolean);

  const sections: BidWriterSection[] = [];
  let pending: BidWriterSection | null = null;
  const guideBuffer: string[] = [];
  let sawNumbered = false;

  const flush = () => {
    if (!pending) return;
    const hints = guideBuffer.join(' ').slice(0, 400).trim();
    if (hints) pending.guide = hints;
    sections.push(pending);
    pending = null;
    guideBuffer.length = 0;
  };

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const level = headingLevel(line, lines[i + 1] || '');
    if (level) {
      const title = stripNumbering(line) || line;
      if (title.length > 60 || title.length < 2) continue; // 误判的长行 / 纯编号格
      const isNumbered = numberedLevel(line) !== null;
      // 文档标题（首个编号标题之前的裸标题，如「信息化技术项目通用投标标书模板」）不是章节
      if (!isNumbered && !sawNumbered) continue;
      if (isNumbered) sawNumbered = true;
      flush();
      pending = { id: sectionId(), level, title, state: 'todo' };
      if (isPartHeading(line)) pending.partHeading = true;
      continue;
    }
    if (pending && guideBuffer.join(' ').length < 400) {
      const hints = placeholderHints(line);
      guideBuffer.push(hints.length ? `${line}（${i18nT('需填写')}：${hints.join(i18nT('、'))}）` : line);
    }
  }
  flush();

  /*
   * 目录去重：模板开头一般先列「1. 投标函 … 10. 售后服务及商务承诺」，正文再逐章重复一遍。
   * 两次都收下就凭空多出一倍章节（用户那份模板 73 章里有一半是目录条目）。
   * 同名只保留**后面**那次 —— 目录条目底下没正文，正文那次才带得上 guide。
   */
  const lastIndex = new Map<string, number>();
  sections.forEach((s, i) => lastIndex.set(s.title, i));
  const deduped = sections.filter((s, i) => lastIndex.get(s.title) === i);

  sections.length = 0;
  sections.push(...deduped);

  // 至少要 3 条才算「解析出了骨架」—— 1~2 条基本是误判（封面上的两行字）
  if (sections.length < 3) {
    return {
      sections: builtinOutline(),
      note: i18nT('模板里没识别出章节标题，已改用内置标准大纲（可自行增删章节）'),
      fromTemplate: false,
    };
  }
  for (const s of sections) {
    if (REQUIRED_TITLE_WORDS.test(s.title)) s.required = true;
  }
  return {
    sections: sections.slice(0, 80),
    note: i18nT('从模板识别出 {n} 个章节', { n: String(Math.min(sections.length, 80)) }),
    fromTemplate: true,
  };
}
