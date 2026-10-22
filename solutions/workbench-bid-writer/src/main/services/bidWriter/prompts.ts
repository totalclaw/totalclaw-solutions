/**
 * 标书场景的提示词。两条硬规矩写死在这里，不给模型商量余地：
 *   ① **不许编**。公司资料、业绩、资质、数字，只能用下面给出的事实；没有就写
 *      `【待补充：具体缺什么】`，自检会把这些占位汇总成缺料清单并挡住正式件导出。
 *   ② **按招标要求写**。每一章都把相关的招标条款原文喂进去，要求逐条响应。
 *
 * 之所以把提示词单独成文件：它是这个工作台产出质量的主要变量，改它要能一眼看到全文，
 * 而不是散在 ipc 的字符串拼接里。
 */
import { t as i18nT } from '@totalclaw/i18n';
import type {
  BidWriterCompanyField, BidWriterProject, BidWriterRequirement, BidWriterSection,
} from '@totalclaw/ipc-contracts';

const KIND_LABEL: Record<string, () => string> = {
  qualification: () => i18nT('资格要求'),
  scoring: () => i18nT('评分办法'),
  deliverable: () => i18nT('必交材料'),
  technical: () => i18nT('技术需求'),
  commercial: () => i18nT('商务条款'),
  format: () => i18nT('格式要求'),
};

export function requirementKindLabel(kind: string): string {
  return (KIND_LABEL[kind] || (() => kind))();
}

const LANG_LABEL: Record<string, () => string> = {
  'zh-CN': () => i18nT('简体中文'),
  'en-US': () => i18nT('英文'),
  ar: () => i18nT('阿拉伯文'),
};

/**
 * 投标目标：用户点了几个侧重标签，就据此写一段能直接进写作要求的目标陈述。
 *
 * 不许编具体数字（毛利率、工期、报价）—— 那是后面每一章都会照着写的东西，
 * 这里编一个「守住 8% 毛利」，整份标书都会跟着它跑偏。
 */
export function goalPrompt(options: {
  projectName: string;
  bidder: string;
  strategies: string[];
  buyer?: string;
  budget?: string;
  scoring: string[];
  lang: BidWriterProject['lang'];
}): string {
  const lang = (LANG_LABEL[options.lang] || LANG_LABEL['zh-CN'])();
  const lines = [
    i18nT('给一个投标项目写一句话投标目标（写给内部看，后面每一章都按它定调）。'),
    i18nT('用{lang}写，只输出这段文字本身：不要标题、不要解释、不要引号、不要 Markdown。', { lang }),
    i18nT('长度 60～140 字，一到两句。'),
    '',
    `${i18nT('项目名称')}：${options.projectName || i18nT('（未填）')}`,
    `${i18nT('投标人')}：${options.bidder || i18nT('（未填）')}`,
    `${i18nT('采购人')}：${options.buyer || i18nT('（公告未写明）')}`,
    `${i18nT('预算金额')}：${options.budget || i18nT('（公告未写明）')}`,
    `${i18nT('我方选定的取胜侧重')}：${options.strategies.join(i18nT('、')) || i18nT('（未选）')}`,
  ];
  if (options.scoring.length) {
    lines.push(i18nT('招标文件的评分办法（写目标时要对上分值大的那几项）：'));
    lines.push(...options.scoring.slice(0, 8).map((t) => `- ${t}`));
  }
  lines.push(
    '',
    i18nT('硬规则：'),
    i18nT('1. 只能用上面给出的信息。绝对不许编毛利率、工期、报价、业绩数量这类具体数字 —— 没给就不要提数字。'),
    i18nT('2. 把选中的侧重逐个落到实处（选了什么就说靠什么赢），没选的不要硬加。'),
    i18nT('3. 写成陈述句，不要"我们建议""可以考虑"这种口吻。'),
  );
  return lines.join('\n');
}

/** 公告正文 → 结构化要点。只让模型做条目化，数字类字段已由规则抽好。 */
export function noticeExtractPrompt(text: string): string {
  return [
    i18nT('你在读一份招标公告，任务是把其中的要求**逐条抄出来**，不是总结。'),
    i18nT('只输出一个 JSON 对象，不要任何解释文字，结构如下：'),
    '{"requirements":[{"kind":"qualification|scoring|deliverable|technical|commercial|format","text":"要求原文（可去掉编号，但不得改写含义）","points":数字或省略,"mandatory":true或false}]}',
    i18nT('规则：'),
    i18nT('1. text 必须是公告里出现过的原话，允许去掉序号和多余空格，不许概括、不许合并、不许补充公告里没有的内容。'),
    i18nT('2. kind 的含义：qualification=投标人资格门槛；scoring=评分/评审办法；deliverable=投标文件必须包含的材料；technical=技术或服务需求；commercial=工期、付款、质保等商务条款；format=份数、密封、签章、装订等格式要求。'),
    i18nT('3. 评分项若写明分值，填进 points。'),
    i18nT('4. 带"必须/应当/否则作废标"的条目 mandatory 置 true。'),
    i18nT('5. 最多 60 条，优先资格要求、评分办法与必交材料。'),
    i18nT('公告正文如下：'),
    '---',
    text.slice(0, 60_000),
  ].join('\n');
}

/** 资格要求 × 公司资料 → 逐条判定。宁可 unknown，也不许瞎判 met。 */
export function qualificationPrompt(requirements: BidWriterRequirement[], facts: BidWriterCompanyField[]): string {
  return [
    i18nT('下面是一份招标公告的资格要求，以及我方公司在知识库里登记的事实。请逐条判断我方是否满足。'),
    // JSON 结构不能进 key（花括号是 vue-i18n 占位符语法），作为参数拼回去
    i18nT('只输出 JSON：{schema}', { schema: '{"checks":[{"requirementId":"...","verdict":"met|unmet|unknown","evidence":"依据哪条公司事实（原文引用）","note":"一句话说明"}]}' }),
    i18nT('判定规则：只能依据下面列出的公司事实；事实里没有提到的一律判 unknown，绝不推测。事实明确不满足（如要求三年业绩而我方成立不足三年）才判 unmet。'),
    i18nT('资格要求：'),
    ...requirements.map((r) => `- [${r.id}] ${r.text}`),
    i18nT('公司事实：'),
    ...facts.filter((f) => f.value).map((f) => `- ${f.label}：${f.value}`),
  ].join('\n');
}

/** 单章正文生成 */
export function sectionPrompt(options: {
  project: BidWriterProject;
  section: BidWriterSection;
  requirements: BidWriterRequirement[];
  company: BidWriterCompanyField[];
  knowledgeExcerpts: Array<{ label: string; text: string }>;
  templateExcerpt?: string;
  instruction?: string;
  /**
   * 「第一部分 商务投标文件」这种**部分级标题**：底下还有子章节，本身没有实质内容。
   * 不特殊处理的话模型会把整个部分的字段罗列成清单 —— 用户实测这一章一个人占了 27 处占位，
   * 而其余 9 章加起来才 10 处。
   */
  partHeading?: boolean;
}): string {
  const { project, section, requirements, company, knowledgeExcerpts, templateExcerpt, instruction, partHeading } = options;
  const lang = (LANG_LABEL[project.lang] || LANG_LABEL['zh-CN'])();
  const lines: string[] = [
    i18nT('你是一名资深标书撰写人，正在为一个真实投标项目撰写投标文件中的一章。'),
    i18nT('用{lang}写作。只输出这一章的正文，不要写标题、不要写"以下是…"之类的开场白、不要用 Markdown 代码块包裹。', { lang }),
    '',
    i18nT('【项目信息】'),
    `${i18nT('项目名称')}：${project.name}`,
    `${i18nT('采购人')}：${project.notice?.buyer || i18nT('（公告未写明）')}`,
    `${i18nT('招标编号')}：${project.notice?.projectCode || i18nT('（公告未写明）')}`,
    `${i18nT('投标人')}：${project.bidder || i18nT('（未填写）')}`,
    `${i18nT('投标目标')}：${project.goal || i18nT('（未填写）')}`,
  ];
  if (project.strategies?.length) lines.push(`${i18nT('侧重')}：${project.strategies.join(i18nT('、'))}`);
  lines.push('', i18nT('【本章要求】'), `${i18nT('章节标题')}：${section.title}`);
  if (partHeading) {
    lines.push(
      i18nT('这是一个**部分级标题**，下面还有各自独立的子章节。'),
      i18nT('只写 80～150 字的引言：说明本部分包含哪些内容、编制依据是什么。'),
      i18nT('**绝对不要**罗列报价、工期、证书编号、人员名单这类具体信息（那些在子章节里写），更不要出现任何占位符。'),
    );
  }
  if (section.guide) lines.push(`${i18nT('模板里的填写说明')}：${section.guide}`);
  if (templateExcerpt) {
    lines.push(i18nT('模板中这一章的原文片段（照它的结构和口吻写，不要照抄里面的示例数据）：'), templateExcerpt.slice(0, 3_000));
  }
  const notice = project.notice || { requirements: [] };
  const noticeFacts = [
    notice.agency ? `${i18nT('代理机构')}：${notice.agency}` : '',
    notice.budget ? `${i18nT('预算金额')}：${notice.budget}` : '',
    notice.deposit ? `${i18nT('投标保证金')}：${notice.deposit}` : '',
    notice.bidDeadline ? `${i18nT('投标截止时间')}：${notice.bidDeadline}` : '',
    notice.openAt ? `${i18nT('开标时间')}：${notice.openAt}` : '',
    notice.contact ? `${i18nT('联系方式')}：${notice.contact}` : '',
  ].filter(Boolean);
  if (noticeFacts.length) {
    lines.push('', i18nT('【公告里已经写明的事实（直接用，不要写成占位）】'), ...noticeFacts.map((t) => `- ${t}`));
  }
  if (requirements.length) {
    lines.push('', i18nT('【必须逐条响应的招标要求】'));
    lines.push(...requirements.map((r) => `- （${requirementKindLabel(r.kind)}${r.points ? ` ${r.points}${i18nT('分')}` : ''}）${r.text}`));
  }
  const known = company.filter((f) => String(f.value || '').trim());
  if (known.length) {
    // 用户在「需要你填写的信息」里填过的值会被写进公司事实，后续章节因此不再重复要同一项
    lines.push('', i18nT('【可用的公司事实（唯一可信来源）】'));
    lines.push(...known.map((f) => `- ${f.label}：${f.value}`));
  }
  if (knowledgeExcerpts.length) {
    lines.push('', i18nT('【知识库原文摘录（可引用）】'));
    lines.push(...knowledgeExcerpts.map((k) => `- 《${k.label}》：${k.text.slice(0, 600)}`));
  }
  lines.push(
    '',
    i18nT('【写作硬规则】'),
    i18nT('1. 公司名称、资质编号、业绩、人数、金额、年限等具体信息，只能用上面给出的事实。上面没有的，写成【待补充：需要什么信息】占位，绝对不许编造，也不许用"某某""XX"糊弄。'),
    i18nT('1a. 上面【可用的公司事实】里已经给出的值，必须原样抄进正文（比如信用代码要写全那串字符），不许再写成【XXX】这类自创的占位标记 —— 只有事实里确实没有的才用【待补充：…】。'),
    i18nT('1b. 上面【项目信息】与【可用的公司事实】里**已经给出的值，必须直接写进正文**（采购人、招标编号、投标人全称、信用代码、资质、业绩、团队、质保与响应时效都在里面），一个字都不许再写成占位。'),
    i18nT('1c. 占位要**克制**：同一项信息在本章只写一次，后文用「上述报价」「前述工期」引用；不要把「单价」「合价」「合计」拆成三处占位；表格里能写「详见报价表」的就不要逐格占位。'),
    i18nT('1d. 占位名**只能从这份清单里选**：投标总报价、大写金额、工期、质保年限、项目经理姓名、授权代表姓名、授权代表身份证号、报价明细、偏离说明、承诺事项。清单之外的信息，有事实就写事实，没有就整句不写 —— 不要自创「比例」「人数」「体系认证」这类看不懂要填什么的占位。'),
    i18nT('2. 对每条招标要求都要有对应的响应文字，不要漏条。'),
    i18nT('3. 写成可以直接放进投标文件的正式段落：分小标题、必要时用条目列举，不写"我们建议"这类咨询口吻。'),
    i18nT('4. 篇幅 600～1200 字；内容确实少的章节可以短，但不要为凑字数重复。'),
    i18nT('5. 不要出现"作为AI""根据你提供的资料"这类话。'),
  );
  if (instruction) lines.push('', i18nT('【本次修改意见（优先满足）】'), instruction.slice(0, 1_000));
  return lines.join('\n');
}
