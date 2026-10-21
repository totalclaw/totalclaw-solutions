/**
 * 税务组产出（批次 4，第 10 节）：
 *   C1 申报底稿 xlsx（封面与签核页 / 申报底稿 / 天课基数 / 风险清单 / 申报日历 / 地区规则与出处 / Checks）+ 申报说明备忘录 docx；
 *   C2 披露底稿 xlsx（封面 / 披露清单 / 测试明细 / 数据核查 / 分母 / 地区规则与出处 / Checks）+ 披露草稿 docx；
 *   C3 转让定价 xlsx（封面 / 关联交易汇总 / 可比分析（QUARTILE 公式联动）/ 文档要求 / 国别报告底稿 / 地区规则与出处 / Checks）+ 本地文档草稿 docx。
 * 全部是草稿：只出申报底稿，不提交申报；沙特 / 阿联酋口径在当地专业人员审核前标「草稿口径，需当地专业人士复核」。
 * 文案按输出语言（tIn），法规原文保留原语言并标「以原文为准」；用户数据（科目名、往来单位、说明）原样保留。
 */
import { join } from 'node:path';
import { i18nKey } from '@totalclaw/i18n';
import type {
  FauDisclosureLevel, FauLocale, FauRegulatoryResult, FauRuleUse, FauTaxFinding, FauTaxResult, FauTpResult, FauZakatCategory,
} from '@totalclaw/ipc-contracts';
import { FAU_DISCLOSURE_LEVELS } from '@totalclaw/ipc-contracts';
import { OUT, fmtAmount, fmtPct, labeler, outputFileName, type L } from './common';
import { addr, major, planSheetNames, ref, writeWorkbookFile, type XCell } from './xlsx';
import { writeDocxFile, type DocSection } from './docx';
import { coverRows, type OutputCtx } from './close';
import { hijriOf } from '../engines/tax/common';
import { DOC_LABEL } from '../engines/tax/tp';

export const DRAFT_BASIS = i18nKey('草稿口径，需当地专业人士复核');
export const NO_FILING = i18nKey('只出申报底稿，不提交申报：中国由人在电子税务局提交（代填可去财务智能体），沙特由人在 ZATCA 平台提交，阿联酋由人在 FTA 平台提交。');

export const LEVEL_LABEL: Record<FauTaxFinding['level'], string> = { info: i18nKey('提示'), warn: i18nKey('提醒'), high: i18nKey('高风险') };
export const ZAKAT_CATEGORY_LABEL: Record<FauZakatCategory, string> = {
  add_equity: i18nKey('加项：权益'), add_provision: i18nKey('加项：准备'), add_liability: i18nKey('加项：非流动负债'),
  deduct_fixed: i18nKey('减项：固定资产净值'), deduct_investment: i18nKey('减项：长期投资'), deduct_intangible: i18nKey('减项：无形资产'),
  deduct_other: i18nKey('减项：其他'), none: i18nKey('不计入'),
};
export const DISCLOSURE_LEVEL_LABEL: Record<FauDisclosureLevel, string> = {
  shareholder: i18nKey('提交股东大会并披露'), disclose: i18nKey('及时披露'), notes: i18nKey('在报表附注披露'), none: i18nKey('暂不需要披露'),
};
export const EVENT_TYPE_LABEL: Record<string, string> = {
  transaction: i18nKey('交易'), related_party: i18nKey('关联交易'), guarantee: i18nKey('担保'), litigation: i18nKey('诉讼 / 仲裁'), impairment: i18nKey('减值'), other: i18nKey('其他'), '': i18nKey('其他'),
};
export const RPT_TYPE_LABEL: Record<string, string> = {
  tangible: i18nKey('有形资产'), intangible_transfer: i18nKey('无形资产所有权转让'), intangible_license: i18nKey('无形资产使用权许可'),
  service: i18nKey('劳务'), financing: i18nKey('资金融通'), financial_asset: i18nKey('金融资产转让'), other: i18nKey('其他'),
};
export const PLI_LABEL: Record<string, string> = { ncp: i18nKey('完全成本加成率'), om: i18nKey('营业利润率') };
export const POSITION_LABEL: Record<string, string> = { below: i18nKey('低于下四分位'), within: i18nKey('在四分位区间内'), above: i18nKey('高于上四分位'), na: i18nKey('无法判断') };

const label = (t: L, m: { key: string; params?: Record<string, string | number> } | undefined) => (m ? t(m.key, m.params) : '');
const r4 = (n: number | null | undefined) => (n == null || !Number.isFinite(n) ? null : Math.round(n * 1e6) / 1e6);

function banner(t: L, draftBasis: boolean): string {
  return draftBasis ? `${t(OUT.draft)} · ${t(DRAFT_BASIS)}` : t(OUT.draft);
}

/** 规则标签 / 文字取值：输出语言有译文用译文，否则用规则表里的中文原文 */
function ruleLabel(u: FauRuleUse, locale: FauLocale): string {
  return u.translations?.[locale]?.label || u.label;
}
function ruleValue(u: FauRuleUse, locale: FauLocale): string | number {
  return typeof u.value === 'number' ? u.value : (u.translations?.[locale]?.value || String(u.value));
}

/** 地区规则与出处：原文按原语言保留，译文仅供参考（以原文为准）；未审核的标草稿口径 */
function rulesSheetRows(rules: FauRuleUse[], t: L, locale: FauLocale): XCell[][] {
  return rules.map((u) => [
    u.id, ruleLabel(u, locale), ruleValue(u, locale), u.unit || '', u.version, u.effectiveFrom, u.effectiveTo || '',
    u.source.issuer, u.source.title, u.source.clause || '', u.source.originalText || '', u.source.translations?.[locale] || '',
    t(i18nKey('以原文为准')), u.reviewed ? t(i18nKey('已经当地专业人员审核')) : t(DRAFT_BASIS),
  ]);
}

function rulesHeaders(t: L): string[] {
  return [t(i18nKey('规则')), t(i18nKey('名称')), t(i18nKey('取值')), t(i18nKey('单位')), t(i18nKey('版本')), t(i18nKey('生效日期')), t(i18nKey('失效日期')),
    t(i18nKey('发布机构')), t(i18nKey('文件')), t(i18nKey('条款')), t(i18nKey('原文')), t(i18nKey('译文')), t(i18nKey('说明')), t(i18nKey('审核状态'))];
}

function findingRows(fs: FauTaxFinding[], t: L): XCell[][] {
  return fs.map((f) => [t(LEVEL_LABEL[f.level]), label(t, f.title), label(t, f.detail), label(t, f.suggestion), (f.rows || []).join(',')]);
}

function findingParas(fs: FauTaxFinding[], t: L): string[] {
  return fs.length ? fs.map((f) => `• [${t(LEVEL_LABEL[f.level])}] ${label(t, f.title)}${f.detail ? `: ${label(t, f.detail)}` : ''}`) : [t(i18nKey('无'))];
}

function ruleParas(rules: FauRuleUse[], t: L, locale: FauLocale): string[] {
  return rules.map((u) => `• ${ruleLabel(u, locale)}: ${ruleValue(u, locale)}${u.unit ? ` ${u.unit}` : ''} (v${u.version}, ${u.effectiveFrom}${u.effectiveTo ? ` ~ ${u.effectiveTo}` : ''}; ${u.source.issuer} · ${u.source.title}${u.source.clause ? ` · ${u.source.clause}` : ''})${u.reviewed ? '' : ` — ${t(DRAFT_BASIS)}`}`);
}

// ═══ C1 纳税申报准备 ═════════════════════════════════════════════════════

export function writeTaxOutputs(ctx: OutputCtx, res: FauTaxResult, extra: { levels: string[]; modeName: string }): { workPath: string; memoPath: string } {
  const t = labeler(ctx.locale);
  const rtl = ctx.locale === 'ar';
  const b = banner(t, res.draftBasis);
  const sa = res.region === 'SA';
  const [nCover, nWork, nZakat, nRisk, nCal, nRules, nChecks] = planSheetNames([
    t(i18nKey('封面与签核页')), t(i18nKey('申报底稿')), t(i18nKey('天课基数')), t(i18nKey('风险清单')), t(i18nKey('申报日历')), t(i18nKey('地区规则与出处')), 'Checks',
  ]);
  const R0 = 2;
  const work: XCell[][] = [];
  const checks: XCell[][] = [];
  for (const s of res.sections) {
    work.push([`${t(s.title.key, s.title.params)} (${s.currency})`]);
    const at: Record<string, number> = {};
    for (const l of s.lines) {
      at[l.id] = R0 + work.length;
      let tax: XCell = major(l.tax ?? null);
      // 增值税：本期应纳 = 销项合计 − 进项合计、应缴 = 应纳 + 更正 − 留抵，写成公式联动
      if (s.id === 'vat' && l.id === 'net' && at.output_total != null && at.input_total != null) tax = { f: `ROUND(${addr(at.output_total, 3)}-${addr(at.input_total, 3)},2)`, v: major(l.tax ?? 0) ?? 0 };
      if (s.id === 'vat' && l.id === 'due' && at.net != null && at.correction != null && at.carried != null) tax = { f: `ROUND(${addr(at.net, 3)}+${addr(at.correction, 3)}+${addr(at.carried, 3)},2)`, v: major(l.tax ?? 0) ?? 0 };
      work.push([t(l.label.key, l.label.params), major(l.base ?? null), r4(l.rate), tax, l.formula || '', (l.rows || []).slice(0, 60).join(','), (l.ruleIds || []).join(', ')]);
    }
    work.push([t(i18nKey('本节应缴')), '', '', major(s.payable)]);
    work.push([]);
  }
  const zakatRows: XCell[][] = [];
  const z = res.zakat;
  if (z) {
    const first = R0;
    z.items.forEach((i) => zakatRows.push([i.row, i.accountCode, i.accountName, t(ZAKAT_CATEGORY_LABEL[i.category]), i.category, major(i.amount), t(i.source === 'manual' ? i18nKey('人工') : i18nKey('自动'))]));
    const last = first + z.items.length - 1;
    const rng = (c: number) => `${addr(first, c)}:${addr(Math.max(last, first), c)}`;
    const base = R0 + zakatRows.length + 1;
    zakatRows.push([]);
    zakatRows.push([t(i18nKey('本年利润（损益未结转时并入权益）')), '', '', '', '', major(z.currentProfit), (z.profitRows || []).slice(0, 60).join(',')]);
    zakatRows.push([t(i18nKey('加项合计')), '', '', '', '', { f: `ROUND(SUMIF(${rng(4)},"add_*",${rng(5)})+${addr(base, 5)},2)`, v: major(z.additions) ?? 0 }]);
    zakatRows.push([t(i18nKey('减项合计')), '', '', '', '', { f: `ROUND(SUMIF(${rng(4)},"deduct_*",${rng(5)}),2)`, v: major(z.deductions) ?? 0 }]);
    zakatRows.push([t(i18nKey('计算基数（加项 − 减项）')), '', '', '', '', { f: `ROUND(${addr(base + 1, 5)}-${addr(base + 2, 5)},2)`, v: major(z.computedBase) ?? 0 }]);
    zakatRows.push([t(i18nKey('调整后净利润（基数下限）')), '', '', '', '', major(z.adjustedProfit)]);
    zakatRows.push([t(i18nKey('天课基数')), '', '', '', '', { f: `MAX(${addr(base + 3, 5)},${addr(base + 4, 5)},0)`, v: major(z.base) ?? 0 }]);
    zakatRows.push([t(z.yearBasis === 'hijri' ? i18nKey('天课率（回历年）') : i18nKey('天课率（公历年按天数折算）')), '', '', '', '', r4(z.rate), z.yearBasis === 'gregorian' ? `× ${z.fiscalDays} / 354` : '']);
    zakatRows.push([t(i18nKey('沙特 / 海湾国家股东持股比例')), '', '', '', '', z.saudiShare]);
    zakatRows.push([t(i18nKey('应缴天课')), '', '', '', '', { f: `ROUND(${addr(base + 5, 5)}*${addr(base + 6, 5)}*${addr(base + 7, 5)},2)`, v: major(z.zakatDue) ?? 0 }]);
    zakatRows.push([t(i18nKey('外资部分应纳税所得额')), '', '', '', '', major(z.nonSaudiTaxable)]);
    zakatRows.push([t(i18nKey('外资部分所得税')), '', '', '', '', major(z.nonSaudiCit)]);
    checks.push([t(i18nKey('天课基数不低于调整后净利润')), z.base >= z.adjustedProfit]);
    checks.push([t(i18nKey('天课 = 基数 × 天课率 × 持股比例')), Math.abs(z.zakatDue - Math.round(z.base * z.rate * z.saudiShare)) <= 1]);
  }
  for (const s of res.sections) {
    const due = s.lines.find((l) => l.id === 'due' || l.id === 'cit_due' || l.id === 'wht_total');
    if (due && due.tax != null) checks.push([`${t(s.title.key, s.title.params)}: ${t(i18nKey('本节应缴与明细一致'))}`, due.tax === s.payable]);
  }
  checks.push([t(i18nKey('只出申报底稿，不提交申报')), true]);
  const calHeaders = [t(i18nKey('事项')), t(OUT.period), t(i18nKey('截止日')), ...(sa ? [t(i18nKey('截止日（回历）'))] : []), t(i18nKey('规则'))];
  const calRows: XCell[][] = res.calendar.map((c) => [t(c.label.key, c.label.params), c.period, c.due, ...(sa ? [hijriOf(c.due)] : []), c.ruleId || '']);
  const title = t(i18nKey('纳税申报底稿'));
  const workPath = join(ctx.dir, outputFileName(ctx.moduleCode, title, ctx.period, 'xlsx', ctx.at));
  const cover = [...coverRows(ctx, t, `${title} · ${t(extra.modeName)}`, extra.levels), [], [t(NO_FILING)], ...(res.draftBasis ? [[t(DRAFT_BASIS)]] : [])];
  writeWorkbookFile(workPath, [
    { name: nCover, banner: b, rows: cover },
    { name: nWork, banner: b, headers: [t(i18nKey('项目')), t(i18nKey('计税基数')), t(i18nKey('税率')), t(i18nKey('税额')), t(i18nKey('计算过程')), t(OUT.row), t(i18nKey('规则'))], rows: work },
    ...(z ? [{ name: nZakat, banner: b, headers: [t(OUT.row), t(i18nKey('科目编码')), t(i18nKey('科目名称')), t(i18nKey('类别')), 'code', t(i18nKey('金额')), t(OUT.source)], rows: zakatRows }] : []),
    { name: nRisk, banner: b, headers: [t(i18nKey('级别')), t(i18nKey('风险')), t(i18nKey('说明')), t(i18nKey('建议')), t(OUT.row)], rows: findingRows(res.findings, t) },
    { name: nCal, banner: b, headers: calHeaders, rows: calRows },
    { name: nRules, banner: b, headers: rulesHeaders(t), rows: rulesSheetRows(res.rules, t, ctx.locale) },
    { name: nChecks, banner: b, headers: [t(OUT.check), t(OUT.result)], rows: checks },
  ], { rtl });

  const memoPath = join(ctx.dir, outputFileName(ctx.moduleCode, t(i18nKey('申报说明备忘录')), ctx.period, 'docx', ctx.at));
  const keyFigures = res.sections.map((s) => `• ${t(s.title.key, s.title.params)}: ${fmtAmount(s.payable, ctx.locale)} ${s.currency}`);
  if (z) keyFigures.push(`• ${t(i18nKey('天课基数'))}: ${fmtAmount(z.base, ctx.locale)} · ${t(i18nKey('应缴天课'))}: ${fmtAmount(z.zakatDue, ctx.locale)} · ${t(i18nKey('外资部分所得税'))}: ${fmtAmount(z.nonSaudiCit, ctx.locale)}`);
  const sections: DocSection[] = [
    { heading: t(i18nKey('本期申报要点')), paragraphs: keyFigures.length ? keyFigures : [t(i18nKey('无'))] },
    { heading: t(i18nKey('风险与提醒')), paragraphs: findingParas(res.findings, t) },
    {
      heading: t(i18nKey('申报日历')), paragraphs: res.calendar.length ? undefined : [t(i18nKey('无'))],
      table: res.calendar.length ? { headers: calHeaders.slice(0, -1), rows: res.calendar.map((c) => [t(c.label.key, c.label.params), c.period, c.due, ...(sa ? [hijriOf(c.due)] : [])]) } : undefined,
    },
    { heading: t(i18nKey('口径与出处')), paragraphs: [...(res.draftBasis ? [t(DRAFT_BASIS)] : []), ...ruleParas(res.rules, t, ctx.locale), t(i18nKey('法规原文以原语言为准，译文仅供参考。'))] },
    { heading: t(i18nKey('发现与建议')), paragraphs: [t(NO_FILING), t(i18nKey('以上为编制人整理的申报底稿与风险提示，供复核与批准，不构成税务意见。'))] },
  ];
  writeDocxFile(memoPath, {
    title: t(i18nKey('申报说明备忘录')), subtitle: `${ctx.companyName} · ${ctx.period}`,
    meta: [[t(OUT.project), ctx.projectName], [t(OUT.mode), t(extra.modeName)], [t(OUT.standard), t(ctx.standardLabel)]],
    header: res.draftBasis ? `${t(OUT.notOpinion)} · ${t(DRAFT_BASIS)}` : t(OUT.notOpinion), watermark: t(OUT.draft), rtl, sections,
  });
  return { workPath, memoPath };
}

// ═══ C2 监管报送与信息披露 ═══════════════════════════════════════════════

export function writeRegulatoryOutputs(ctx: OutputCtx, res: FauRegulatoryResult, extra: { levels: string[] }): { workPath: string; draftPath: string } {
  const t = labeler(ctx.locale);
  const rtl = ctx.locale === 'ar';
  const b = banner(t, res.draftBasis);
  const [nCover, nList, nTests, nData, nBase, nRules, nChecks] = planSheetNames([
    t(i18nKey('封面与签核页')), t(i18nKey('披露清单')), t(i18nKey('测试明细')), t(i18nKey('数据核查')), t(i18nKey('披露比例分母')), t(i18nKey('地区规则与出处')), 'Checks',
  ]);
  const list: XCell[][] = res.items.map((i) => [i.row, i.date, t(EVENT_TYPE_LABEL[i.type] || EVENT_TYPE_LABEL.other), i.description, i.counterparty, major(i.amount), t(DISCLOSURE_LEVEL_LABEL[i.level]),
    i.tests.filter((x) => x.hit).map((x) => t(x.label.key, x.label.params)).join('; '),
    i.draftStatus === 'verified' ? t(OUT.verified) : i.draftStatus === 'unverified' ? t(OUT.unverified) : '']);
  const tests: XCell[][] = res.items.flatMap((i) => i.tests.map((x) => [i.row, t(x.label.key, x.label.params), r4(x.ratio), r4(x.threshold), x.absMin != null ? major(x.absMin) : '', x.hit, t(DISCLOSURE_LEVEL_LABEL[x.level])]));
  const base: XCell[][] = [
    [t(i18nKey('总资产')), major(res.base.totalAssets)], [t(i18nKey('净资产')), major(res.base.netAssets)],
    [t(i18nKey('营业收入')), major(res.base.revenue)], [t(i18nKey('净利润')), major(res.base.netProfit)],
    [t(OUT.source), t(res.base.source === 'tb' ? i18nKey('科目余额表') : i18nKey('手工填写'))],
  ];
  const counts = FAU_DISCLOSURE_LEVELS.map((l) => [t(DISCLOSURE_LEVEL_LABEL[l]), res.counts[l] || 0]);
  const title = t(i18nKey('信息披露底稿'));
  const workPath = join(ctx.dir, outputFileName(ctx.moduleCode, title, ctx.period, 'xlsx', ctx.at));
  writeWorkbookFile(workPath, [
    { name: nCover, banner: b, rows: [...coverRows(ctx, t, title, extra.levels), [], ...counts, ...(res.draftBasis ? [[t(DRAFT_BASIS)]] : [])] },
    { name: nList, banner: b, headers: [t(OUT.row), t(i18nKey('日期')), t(i18nKey('类型')), t(i18nKey('事项说明')), t(i18nKey('对方')), t(i18nKey('金额')), t(i18nKey('结论')), t(i18nKey('达到的标准')), t(i18nKey('草稿回核'))], rows: list },
    { name: nTests, banner: b, headers: [t(OUT.row), t(i18nKey('测试')), t(i18nKey('占比')), t(i18nKey('标准')), t(i18nKey('绝对额下限')), t(OUT.result), t(i18nKey('结论'))], rows: tests },
    { name: nData, banner: b, headers: [t(i18nKey('级别')), t(i18nKey('事项')), t(i18nKey('说明')), t(i18nKey('建议')), t(OUT.row)], rows: findingRows(res.dataChecks, t) },
    { name: nBase, banner: b, headers: [t(i18nKey('项目')), t(i18nKey('金额'))], rows: base },
    { name: nRules, banner: b, headers: rulesHeaders(t), rows: rulesSheetRows(res.rules, t, ctx.locale) },
    { name: nChecks, banner: b, headers: [t(OUT.check), t(OUT.result)], rows: [[t(i18nKey('每个事项都有结论')), res.items.every((i) => !!i.level)], [t(i18nKey('披露草稿不对外发送')), true]] },
  ], { rtl });

  const draftPath = join(ctx.dir, outputFileName(ctx.moduleCode, t(i18nKey('披露草稿')), ctx.period, 'docx', ctx.at));
  const flagged = res.items.filter((i) => i.level === 'disclose' || i.level === 'shareholder');
  writeDocxFile(draftPath, {
    title: t(i18nKey('披露草稿')), subtitle: `${ctx.companyName} · ${ctx.period}`, meta: [[t(OUT.project), ctx.projectName]],
    header: res.draftBasis ? `${t(OUT.notOpinion)} · ${t(DRAFT_BASIS)}` : t(OUT.notOpinion), watermark: t(OUT.draft), rtl,
    sections: [
      ...flagged.map((i): DocSection => ({
        heading: `${i.date} · ${i.description}`,
        paragraphs: [
          `${t(i18nKey('结论'))}: ${t(DISCLOSURE_LEVEL_LABEL[i.level])} · ${t(i18nKey('金额'))}: ${fmtAmount(i.amount, ctx.locale)}`,
          ...i.tests.filter((x) => x.hit).map((x) => `• ${t(x.label.key, x.label.params)}${x.ratio != null ? `: ${fmtPct(x.ratio, ctx.locale)} ≥ ${fmtPct(x.threshold, ctx.locale)}` : ''}`),
          i.draft || t(i18nKey('（未生成草稿）')),
          i.draftStatus === 'unverified' ? `${t(OUT.unverified)}: ${(i.missing || []).join(', ')}` : '',
        ].filter(Boolean),
      })),
      ...(flagged.length ? [] : [{ heading: t(i18nKey('结论')), paragraphs: [t(i18nKey('本期没有达到披露标准的事项'))] }]),
      { heading: t(i18nKey('数据核查')), paragraphs: findingParas(res.dataChecks, t) },
      { heading: t(i18nKey('发现与建议')), paragraphs: [t(i18nKey('披露草稿由董事会秘书审定后，由人在交易所系统发布；本文件不对外发送。'))] },
    ],
  });
  return { workPath, draftPath };
}

// ═══ C3 转让定价 ═════════════════════════════════════════════════════════

export function writeTpOutputs(ctx: OutputCtx, res: FauTpResult, extra: { levels: string[] }): { workPath: string; docPath: string } {
  const t = labeler(ctx.locale);
  const rtl = ctx.locale === 'ar';
  const b = banner(t, res.draftBasis);
  const [nCover, nRpt, nComp, nDocs, nCbcr, nRules, nChecks] = planSheetNames([
    t(i18nKey('封面与签核页')), t(i18nKey('关联交易汇总')), t(i18nKey('可比分析')), t(i18nKey('文档要求')), t(i18nKey('国别报告底稿')), t(i18nKey('地区规则与出处')), 'Checks',
  ]);
  const R0 = 2;
  const comps = res.comparables;
  const compRows: XCell[][] = comps.map((c) => [c.row, c.name, c.year, r4(c.pli), c.included, c.reason ? t(c.reason.key, c.reason.params) : '']);
  // 只把参与计算的放进 QUARTILE：被排除的行 PLI 列为空，QUARTILE 自动忽略空单元格
  const first = R0;
  const last = R0 + Math.max(comps.length, 1) - 1;
  const col = `${addr(first, 3)}:${addr(last, 3)}`;
  const s0 = R0 + compRows.length + 1;
  const rg = res.range;
  compRows.push([]);
  compRows.push([t(i18nKey('可比公司家数')), '', '', { f: `COUNT(${col})`, v: rg?.n ?? 0 }]);
  compRows.push([t(i18nKey('下四分位')), '', '', rg ? { f: `QUARTILE(${col},1)`, v: r4(rg.q1) ?? 0 } : '']);
  compRows.push([t(i18nKey('中位值')), '', '', rg ? { f: `QUARTILE(${col},2)`, v: r4(rg.median) ?? 0 } : '']);
  compRows.push([t(i18nKey('上四分位')), '', '', rg ? { f: `QUARTILE(${col},3)`, v: r4(rg.q3) ?? 0 } : '']);
  compRows.push([]);
  compRows.push([`${t(i18nKey('受测方'))} · ${t(PLI_LABEL[res.pli])}`, '', '', r4(res.tested.pli)]);
  compRows.push([t(i18nKey('落点')), '', '', t(POSITION_LABEL[res.position])]);
  if (res.adjustment) compRows.push([t(i18nKey('调整到中位值需增加的营业利润')), '', '', major(res.adjustment.amount)]);
  const rptRows: XCell[][] = res.rpt.map((g) => [t(RPT_TYPE_LABEL[g.type]), g.count, major(g.amount), g.rows.slice(0, 60).join(',')]);
  rptRows.push([t(i18nKey('合计')), res.rpt.reduce((s, g) => s + g.count, 0), { f: `ROUND(SUM(${addr(R0, 2)}:${addr(R0 + Math.max(res.rpt.length, 1) - 1, 2)}),2)`, v: major(res.rptTotal) ?? 0 }]);
  const docRows: XCell[][] = res.docs.map((d) => [t(DOC_LABEL[d.id]), d.required, t(d.reason.key, d.reason.params), d.prepared, d.required && !d.prepared, d.ruleIds.join(', ')]);
  const cbcrHeaders = [t(i18nKey('税收管辖区')), t(i18nKey('非关联方收入')), t(i18nKey('关联方收入')), t(i18nKey('收入合计')), t(i18nKey('税前利润')), t(i18nKey('已缴所得税')), t(i18nKey('当年应计所得税')), t(i18nKey('注册资本')), t(i18nKey('累计未分配利润')), t(i18nKey('员工人数')), t(i18nKey('有形资产（不含现金）'))];
  const checks: XCell[][] = rg ? [
    [t(i18nKey('公式计算的下四分位与引擎一致')), { f: `ABS(${addr(s0 + 1, 3)}-${r4(rg.q1)})<0.000001`, v: true }],
    [t(i18nKey('公式计算的中位值与引擎一致')), { f: `ABS(${addr(s0 + 2, 3)}-${r4(rg.median)})<0.000001`, v: true }],
    [t(i18nKey('公式计算的上四分位与引擎一致')), { f: `ABS(${addr(s0 + 3, 3)}-${r4(rg.q3)})<0.000001`, v: true }],
  ] : [[t(i18nKey('有可用的可比公司')), false]];
  const title = t(i18nKey('转让定价底稿'));
  const workPath = join(ctx.dir, outputFileName(ctx.moduleCode, title, ctx.period, 'xlsx', ctx.at));
  writeWorkbookFile(workPath, [
    { name: nCover, banner: b, rows: [...coverRows(ctx, t, title, extra.levels), ...(res.draftBasis ? [[], [t(DRAFT_BASIS)]] : [])] },
    { name: nRpt, banner: b, headers: [t(i18nKey('交易类型')), t(i18nKey('笔数')), t(i18nKey('金额')), t(OUT.row)], rows: rptRows },
    { name: nComp, banner: b, headers: [t(OUT.row), t(i18nKey('可比公司')), t(i18nKey('年度')), t(PLI_LABEL[res.pli]), t(i18nKey('参与计算')), t(i18nKey('说明'))], rows: compRows },
    { name: nDocs, banner: b, headers: [t(i18nKey('文档')), t(i18nKey('须准备')), t(i18nKey('依据')), t(i18nKey('已准备')), t(i18nKey('缺口')), t(i18nKey('规则'))], rows: docRows },
    { name: nCbcr, banner: b, headers: cbcrHeaders, rows: [] },
    { name: nRules, banner: b, headers: rulesHeaders(t), rows: rulesSheetRows(res.rules, t, ctx.locale) },
    { name: nChecks, banner: b, headers: [t(OUT.check), t(OUT.result)], rows: checks },
  ], { rtl });

  const docPath = join(ctx.dir, outputFileName(ctx.moduleCode, t(i18nKey('本地文档草稿')), ctx.period, 'docx', ctx.at));
  const pctOf = (v: number | null) => (v == null ? '-' : fmtPct(v, ctx.locale));
  writeDocxFile(docPath, {
    title: t(i18nKey('本地文档草稿')), subtitle: `${ctx.companyName} · ${ctx.period}`, meta: [[t(OUT.project), ctx.projectName]],
    header: res.draftBasis ? `${t(OUT.notOpinion)} · ${t(DRAFT_BASIS)}` : t(OUT.notOpinion), watermark: t(OUT.draft), rtl,
    sections: [
      ...res.narrative.map((n): DocSection => ({ heading: t(n.heading.key, n.heading.params), paragraphs: [n.text, n.status === 'unverified' ? `${t(OUT.unverified)}: ${(n.missing || []).join(', ')}` : ''].filter(Boolean) })),
      { heading: t(i18nKey('关联交易汇总')), table: { headers: [t(i18nKey('交易类型')), t(i18nKey('笔数')), t(i18nKey('金额'))], rows: res.rpt.map((g) => [t(RPT_TYPE_LABEL[g.type]), g.count, fmtAmount(g.amount, ctx.locale)]) } },
      {
        heading: t(i18nKey('可比分析')),
        paragraphs: [`${t(PLI_LABEL[res.pli])} · ${t(i18nKey('受测方'))}: ${pctOf(res.tested.pli)} · ${t(POSITION_LABEL[res.position])}`],
        table: rg ? { headers: [t(i18nKey('可比公司家数')), t(i18nKey('下四分位')), t(i18nKey('中位值')), t(i18nKey('上四分位'))], rows: [[rg.n, pctOf(rg.q1), pctOf(rg.median), pctOf(rg.q3)]] } : undefined,
      },
      { heading: t(i18nKey('文档要求')), table: { headers: [t(i18nKey('文档')), t(i18nKey('须准备')), t(i18nKey('依据')), t(i18nKey('已准备'))], rows: res.docs.map((d) => [t(DOC_LABEL[d.id]), d.required ? '✓' : '—', t(d.reason.key, d.reason.params), d.prepared ? '✓' : '—']) } },
      { heading: t(i18nKey('风险与提醒')), paragraphs: findingParas(res.findings, t) },
      { heading: t(i18nKey('口径与出处')), paragraphs: [...(res.draftBasis ? [t(DRAFT_BASIS)] : []), ...ruleParas(res.rules, t, ctx.locale), t(i18nKey('法规原文以原语言为准，译文仅供参考。'))] },
      { heading: t(i18nKey('发现与建议')), paragraphs: [t(i18nKey('本草稿供税务专业人员复核，不构成税务意见；文档由人审定后按当地规定报送。'))] },
    ],
  });
  return { workPath, docPath };
}

