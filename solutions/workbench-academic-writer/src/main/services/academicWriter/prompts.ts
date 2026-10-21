/**
 * 学术写作智能体 · 给模型的指令（不是界面文案，豁免 i18n 词典，见 scripts/i18n-codemod.mjs）。
 *
 * 共同红线：不编造文献、数据、实验结果；引用只能用给定清单里的编号 [n]；没有依据的地方写「（需补充文献）」让作者补。
 */
import type { AwPaper, AwProject } from '@totalclaw/ipc-contracts';

const JSON_ONLY = '只输出一个 JSON 对象，不要 Markdown 代码块，不要解释。';

const TYPE_LABEL: Record<string, string> = { review: '综述', research: '研究论文', thesis: '学位论文', proposal: '开题报告' };

function lang(p: AwProject): string {
  return p.language === 'en' ? '用英文（学术英语）写' : '用中文（规范学术中文）写';
}

export function queryPrompt(topic: string, field: string): string {
  return [
    '你是科研馆员，帮作者为下面的选题设计文献检索式，用于 PubMed / Europe PMC / arXiv / Crossref / OpenAlex 这些英文学术库。',
    `选题：${topic}`,
    field ? `学科领域：${field}` : '',
    '给出 3～5 条英文检索式：每条覆盖选题的一个侧面（核心概念、方法、应用场景、综述类），用常见的同义词和 OR / AND 组合，不要太长（10 个词以内）。',
    '另给 3～6 个中文关键词，方便作者去知网、万方检索。',
    JSON_ONLY,
    '格式：{"queries":[{"query":"","purpose":"这条检索式查什么（中文一句话）"}],"zhKeywords":[""]}',
  ].filter(Boolean).join('\n');
}

export function readPrompt(p: AwProject, paper: AwPaper, text: string): string {
  return [
    `你在帮作者精读一篇文献，服务于「${p.title}」这篇${TYPE_LABEL[p.paperType] || '论文'}。${lang(p)}。`,
    '根据下面的原文（通常是摘要）提炼四项：研究问题 question、方法 method、主要发现 findings、局限 limitations。',
    '每项再给一句支撑它的原文引用 quote：必须是原文里逐字连续的一段（不超过 60 个词），不能改写；原文里没有依据的项写「摘要未提及」，quote 留空。',
    '不要补充原文没有的数字、样本量、结论。',
    JSON_ONLY,
    '格式：{"question":"","method":"","findings":"","limitations":"","quotes":[{"field":"question|method|findings|limitations","quote":""}]}',
    `--- 文献：${paper.title}（${paper.authors.slice(0, 3).join(', ')}${paper.authors.length > 3 ? ' 等' : ''}，${paper.journal} ${paper.year}） ---`,
    text.slice(0, 12000),
  ].join('\n');
}

function libraryBlock(library: AwPaper[], ids?: string[]): string {
  return library
    .map((x, i) => ({ x, n: i + 1 }))
    .filter(({ x }) => !ids || ids.includes(x.id))
    .map(({ x, n }) => {
      const s = x.summary;
      const brief = s ? `问题：${s.question}；方法：${s.method}；发现：${s.findings}；局限：${s.limitations}` : (x.abstract || '').slice(0, 700);
      return `[${n}] ${x.title}（${x.authors[0] || ''}${x.authors.length > 1 ? ' 等' : ''}, ${x.year}, ${x.journal}）\n${brief}`;
    }).join('\n\n');
}

export function outlinePrompt(p: AwProject): string {
  return [
    `为一篇${TYPE_LABEL[p.paperType] || '论文'}拟提纲。题目：「${p.title}」${p.field ? `，领域：${p.field}` : ''}。${lang(p)}。`,
    p.requirements ? `作者的要求：${p.requirements}` : '',
    '只能依据下面文献库里的文献组织内容。每节给 3～6 个要点，并列出这一节要引用的文献编号（只能用下面出现的 [n]）。',
    p.paperType === 'review' ? '综述结构参考：引言（背景与意义）→ 按主题 / 方法分的若干节（比较、演进、争议）→ 挑战与展望 → 结论。' : '',
    p.paperType === 'research' ? '研究论文结构参考：引言 → 相关工作 → 方法 → 实验 / 结果（这里只写要做什么，结果由作者填）→ 讨论 → 结论。' : '',
    p.paperType === 'proposal' ? '开题报告结构参考：选题背景与意义 → 国内外研究现状 → 研究内容与目标 → 研究方法与技术路线 → 创新点 → 进度安排 → 预期成果。' : '',
    JSON_ONLY,
    '格式：{"sections":[{"heading":"","points":[""],"cites":[1,2]}]}',
    '--- 文献库 ---',
    libraryBlock(p.library),
  ].filter(Boolean).join('\n');
}

export function sectionPrompt(p: AwProject, heading: string, points: string[], citeIds: string[], allHeadings: string[]): string {
  return [
    `你在和作者一起写「${p.title}」（${TYPE_LABEL[p.paperType] || '论文'}）。${lang(p)}。现在只写其中一节：「${heading}」。`,
    `全文的节标题依次是：${allHeadings.join(' / ')}。本节不要重复其它节的内容。`,
    points.length ? `本节要点：\n${points.map((x) => `- ${x}`).join('\n')}` : '',
    p.requirements ? `作者的要求：${p.requirements}` : '',
    '写作规则：',
    '- 需要依据的陈述，在句末用文献编号标注，如 [3] 或 [2, 5]；编号只能用下面清单里的，绝不编造文献或编号；',
    '- 不编造数据、样本量、实验结果、百分比；清单里没有依据又必须写的，写「（需补充文献）」或「（待作者补充数据）」占位；',
    '- 段落式学术写作，不用列表堆砌；本节 400～900 字（英文 300～700 词）；',
    '- 只输出本节正文，不要重复节标题，不要输出参考文献表。',
    '--- 可引用的文献 ---',
    libraryBlock(p.library, citeIds.length ? citeIds : undefined),
  ].filter(Boolean).join('\n');
}

export function webExtractPrompt(url: string, text: string): string {
  return [
    '下面是作者在学术网站（知网、万方、期刊官网、Google Scholar 等）打开的一个文献页面的文字。把这篇文献的题录信息抄出来。',
    '每个值必须能在页面文字里原样找到；找不到的填空字符串，不要猜。authors 是作者名数组；year 四位年份；abstract 是摘要原文（不要改写、不要翻译）。',
    '如果页面是检索结果列表而不是单篇文献详情，返回 {"notArticle": true}。',
    JSON_ONLY,
    '格式：{"title":"","authors":[""],"journal":"","year":"","volume":"","issue":"","pages":"","doi":"","abstract":""}',
    `--- 页面 ${url} ---`,
    text.slice(0, 8000),
  ].join('\n');
}
