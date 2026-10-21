/**
 * 输出物结构化载荷装配 —— 「生成文件」按钮送给主进程的那份数据。
 *
 * 从 SaudiWorkbench.vue 里抽出来单独成文件，是因为它踩过一次很贵的坑：
 * 载荷里的 `costTotal` 传的是 **BOM 小计**，而卡片上的「成本合计 / 目标毛利」是
 * 按完整成本口径算的（含物流、安装、维保、风险准备金）。主进程的交付物校验器
 * 拿这两个对不上的口径去验「合计 = Σ行小计」「毛利 = 售价 − 成本」，
 * 于是**只要卡片里有报价，任何输出物都会被恒等式阻断** —— 用户在三个模块里
 * 点多少次「生成文件」都落不下一个文件，界面上只留一句「还没有生成任何文件」。
 *
 * 藏在 SFC 里的纯函数没人能测，这类口径错配就只能等用户来报。所以搬到这里，
 * 由 outputPayload.test.ts 拿三个模块的真实卡片走一遍真校验器。
 *
 * 两条约束，改这个文件时必须守住：
 *   1. **载荷只描述这份文件本身** —— 文件里印不出来的数据（表格件的 BOM/报价行）
 *      一律不传，否则校验器会拿文件里根本没有的数字去对账；
 *   2. **口径跟着 calc.ts 的报价模型走** —— 成本合计 / 底价 / 设备采购是三个不同的数，
 *      各有各的用途，不许拿一个顶另一个。
 */
import { t as i18nT } from '../../i18n';
import { buildConclusionSections } from './actionTitle';
import type { CardData } from './types';

export interface OutputTable {
  sheetName: string;
  headers: string[];
  rows: string[][];
}

/** 装配所需的上下文：全部由工作台从当前案件/模块里取好传进来，这里不碰任何响应式状态。 */
export interface OutputPayloadContext {
  cards: CardData[];
  /** 走主 BOM 还是备选 BOM（Proof Switch 切的就是它） */
  bomVariant: 'primary' | 'alternate';
  /** 文件抬头：模块名 · 案件主题 */
  title: string;
  customer: string;
  project: string;
  ruleVersion: string;
  /** 案件主题，用于回落邮件正文 */
  subject: string;
  /** 草稿 .eml 的收件人（来件人邮箱） */
  to: string;
}

/**
 * 有些输出物本身就是一张表，而且**不是报价表**：
 * 「技术商务符合性矩阵」取符合性卡，「投标准备任务清单」取任务卡。
 * 不识别的话它们会被套上 BOM 模板，生成出两份一模一样的报价单。
 */
export function buildOutputTable(cards: CardData[], outputName: string): OutputTable | undefined {
  if (!outputName) return undefined;

  if (outputName.includes(i18nT('符合性矩阵'))) {
    // 必须按 id 取：能力匹配卡（capability）也用 matrixRows，
    // 只按字段找会命中它，导出来的"符合性矩阵"其实是能力表。
    const card = cards.find((c) => c.id === 'compliance');
    if (!card?.matrixRows?.length) return undefined;
    const verdictText: Record<string, string> = {
      ok: i18nT('满足'), partial: i18nT('部分满足'), deviate: i18nT('偏离'),
    };
    return {
      sheetName: i18nT('符合性矩阵'),
      headers: [i18nT('类别'), i18nT('要求'), i18nT('我方响应'), i18nT('判定'), i18nT('备选方案')],
      rows: card.matrixRows.map((r) => [
        i18nT(r.category ?? ''), i18nT(r.requirement), i18nT(r.proposed ?? ''),
        verdictText[r.verdict] || i18nT(r.specValue || ''), i18nT(r.alternate || '—'),
      ]),
    };
  }

  if (outputName.includes(i18nT('任务清单')) || outputName.includes(i18nT('任务'))) {
    const card = cards.find((c) => c.id === 'taskplan') ?? cards.find((c) => c.taskplan?.length);
    if (!card?.taskplan?.length) return undefined;
    return {
      sheetName: i18nT('投标准备任务'),
      headers: [i18nT('任务'), i18nT('负责人'), i18nT('截止'), i18nT('依赖')],
      rows: card.taskplan.map((t) => [i18nT(t.task), i18nT(t.owner), t.due, i18nT(t.dependsOn)]),
    };
  }

  return undefined;
}

/** BOM 成本合计。没有 BOM 就返回 undefined —— 传个 0 过去会让毛利率校验判成 100%。 */
export function bomTotalCost(rows?: { qty: number; unitCost: number }[]): number | undefined {
  if (!rows?.length) return undefined;
  return rows.reduce((sum, r) => sum + r.qty * r.unitCost, 0);
}

/** 报价类邮件正文：客户、项目、报价区间与随附文件，够客户看懂这封邮件在说什么。 */
export function composeQuoteEmailBody(
  subject: string,
  pricingCard?: { priceRange?: { low: number; high: number }; calcLines?: { label: string; result: number; currency?: string }[] },
): string {
  const lines: string[] = [
    i18nT('您好，'),
    '',
    i18nT('关于「{p0}」的询价，我们已完成技术匹配与成本测算，随附技术方案与正式报价表。', { p0: subject }),
  ];
  if (pricingCard?.priceRange) {
    lines.push(i18nT('建议报价区间：{p0} — {p1}', {
      p0: String(pricingCard.priceRange.low), p1: String(pricingCard.priceRange.high),
    }));
  }
  const total = pricingCard?.calcLines?.find((l) => l.result);
  if (total) {
    lines.push(i18nT('{p0}：{p1} {p2}', {
      p0: i18nT(total.label), p1: total.currency ?? '', p2: String(Math.round(total.result)),
    }));
  }
  lines.push(
    '',
    i18nT('报价表中的行小计与合计均为公式，贵司调整数量后可自动重算。'),
    i18nT('如需调整交付地点、保修年限或付款条件，请回复本邮件，我们会同步更新报价。'),
    '',
    i18nT('顺颂商祺'),
  );
  return lines.join('\n');
}

/**
 * 把当前卡片装配成正式件的结构化输入。
 * 报价走 BOM + 计算行（xlsx 里会写成公式，客户改数量能自己重算）；
 * 方案/报告走字段表 + 段落；邮件走短回复正文；
 * 矩阵/清单类走 buildOutputTable 的通用表。
 */
export function buildStructuredOutput(kind: string, outputName: string, ctx: OutputPayloadContext): Record<string, any> {
  const { cards } = ctx;
  const pricingCard = cards.find((c) => c.kind === 'pricing');
  const bomCard = cards.find((c) => c.kind === 'bom');
  const fieldsCard = cards.find((c) => c.kind === 'fields');
  const reportCard = cards.find((c) => c.reportSections?.length);
  const replyCard = cards.find((c) => c.replyLines?.length);
  const activeBom = ctx.bomVariant === 'alternate' ? bomCard?.bomAlternate : bomCard?.bomPrimary;
  // 通用表格只有 xlsx 生成器认（buildQuotationXlsx）；docx / pdf 生成器根本不读 ctx.table，
  // 传过去只会让校验器扫到一堆文件里并不存在的文字。
  const table = kind === 'excel' ? buildOutputTable(cards, outputName) : undefined;

  const headline = {
    title: ctx.title,
    customer: ctx.customer,
    project: ctx.project,
    ruleVersion: ctx.ruleVersion,
  };

  /**
   * 表格类输出物（符合性矩阵 / 投标准备任务清单）落到文件里**只有这张表** ——
   * BOM、成本行、报价区间一个字都不会印上去。再把它们塞进结构化载荷，
   * 校验器就会拿「文件里根本没有的数字」去对账：任务清单被「毛利 = 售价 − 成本」拦下，
   * 用户点十次「生成文件」十次落不下文件，还看不出这跟任务清单有什么关系。
   */
  if (table) return { ...headline, table };

  // 校验器要对的三个数必须和**报价模型自己的口径**一致（calc.ts computePricing）：
  //   设备采购 = Σ(数量 × 单价)                 ← 「合计 = Σ行小计」对的是这一行
  //   成本合计 = 设备 + 物流 + 安装 + 外协 + 维保 + 风险准备金（≠ BOM 小计）
  //   底价     = 成本合计 + 目标毛利            ← 「毛利 = 售价 − 成本」说的就是它
  // 早先传的是 BOM 小计与建议区间下限，两个口径都对不上成本/毛利那两行，
  // 于是只要卡片里有报价，**任何**输出物都会被恒等式阻断，一个文件都落不下来。
  const calcByKey = (key: string) => pricingCard?.calcLines?.find((l) => l.key === key);
  const totalCostLine = calcByKey('total_cost') ?? pricingCard?.calcLines?.find((l) => l.emphasis === 'total');
  const floorPriceLine = calcByKey('floor_price') ?? pricingCard?.calcLines?.find((l) => l.emphasis === 'floor');
  const equipmentLine = calcByKey('equipment');

  return {
    ...headline,
    bom: kind === 'excel' || kind === 'pdf'
      ? (activeBom ?? []).map((r) => ({
          sku: r.sku, description: i18nT(r.description), qty: r.qty, unit: i18nT(r.unit), unitCost: r.unitCost,
          // 行小计一并传过去，主进程才有东西可对账（P0-1 恒等式校验）。
          // 不传的话校验器只能跳过这一条 —— 它不会拿自己算的数和自己比，那毫无意义。
          lineTotal: r.qty * r.unitCost,
        }))
      : undefined,
    // 成本合计 / 售价：给了主进程才能校验「毛利 = 售价 − 成本」与毛利率范围
    costTotal: totalCostLine?.result ?? bomTotalCost(activeBom),
    sellPrice: floorPriceLine?.result ?? pricingCard?.priceRange?.low,
    // BOM 小计单独给 —— 「合计 = Σ行小计」要对的是「设备采购」这一行，
    // 不是「成本合计」。不给的话主进程只能按 emphasis='total' 硬猜，猜的正好是成本合计。
    bomSubtotal: equipmentLine?.result,
    calcLines: (pricingCard?.calcLines ?? []).map((l) => ({
      label: i18nT(l.label), formula: l.formula, result: l.result, currency: l.currency, emphasis: l.emphasis,
    })),
    priceRange: pricingCard?.priceRange,
    fields: (fieldsCard?.fields ?? []).map((f) => ({ label: i18nT(f.label), value: String(f.value) })),
    // 交付物章节 = 结论摘要（结论式标题，P1-2）+ 原有的七段报告正文。
    // **工作台里照旧显示栏目名**，只有落到文件里的这一份走结论句 ——
    // 客户打开建议书要能光看标题读完故事线，而不是看到一排「符合性矩阵」。
    sections: [
      ...buildConclusionSections(
        cards.filter((c) => ['matrix', 'decision', 'pricing', 'kanban', 'bom', 'taskplan', 'gaps'].includes(c.kind)),
      ).map((s) => ({ title: s.title, body: s.body })),
      ...(reportCard?.reportSections ?? []).map((sec) => ({ title: i18nT(sec.title), body: i18nT(sec.body) })),
    ],
    // 询价模块没有"简短回复"卡，回落到按报价信息拼正文；
    // 否则草稿 .eml 里只剩一行水印，等于发了封空邮件给客户。
    emailBody: replyCard?.replyLines?.length
      ? replyCard.replyLines.map((line) => (line ? i18nT(line) : '')).join('\n')
      : composeQuoteEmailBody(ctx.subject, pricingCard),
    // 草稿 .eml 的 To 用来源收件人预填（真正发送时以审阅弹层里确认的收件人为准）
    to: ctx.to,
  };
}
