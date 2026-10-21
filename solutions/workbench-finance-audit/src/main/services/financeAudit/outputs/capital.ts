/**
 * G6 投融资与估值产出（第 10 节）：底稿 xlsx + 备忘录 docx，全部草稿。
 *   xlsx：封面与签核页 / F1 公式联动模型（假设 + 计算）或结果表 / 关键指标 / 输入与来源 / 叙述与回核 / 事实与出处 / Checks；
 *   docx：数据来源与完整度、关键指标、叙述（未核实的段落标 [未注明来源]）、事实与出处、提醒。
 * 研究 / 市场 / 财富每个文件都带「非投资建议」声明；没用授权数据源时写明「本结果未使用授权数据源，数据完整度：中 / 低」。
 * 用户数据（公司名、指标名、引文）原样保留，固定文案按输出语言（tIn）。
 */
import { join } from 'node:path';
import { i18nKey } from '@totalclaw/i18n';
import type { FauCapCell, FauCapResult, FauCapUnit } from '@totalclaw/ipc-contracts';
import { sourceTag } from '../../../../shared/financeAudit/capital/specs';
import type { CapIn } from '../engines/capital/inputs';
import { dcfInput, lboInput, tsInput, type DcfResult, type LboResult, type Peer, type TsYear } from '../engines/capital/valuation';
import { OUT, labeler, outputFileName, type L } from './common';
import { coverRows, type OutputCtx } from './close';
import { planSheetNames, writeWorkbookFile, type XCell, type XSheet } from './xlsx';
import { writeDocxFile, type DocSection } from './docx';
import { auditFormulas, compsModel, dcfModel, lboModel, threeStatementModel, type ModelSheets } from './capitalModels';

export const CAP_OUT = {
  research: i18nKey('仅供内部研究，非投资建议'),
  markets: i18nKey('仅供分析参考，非投资建议，不构成交易指令'),
  wealth: i18nKey('仅供持牌顾问内部使用，非投资建议，不发给客户，不执行交易'),
  degraded: i18nKey('本结果未使用授权数据源，数据完整度：{p0}'),
  high: i18nKey('高'),
  medium: i18nKey('中'),
  low: i18nKey('低'),
  unsourced: i18nKey('[未注明来源]'),
  adviceFlag: i18nKey('含买卖或配置建议措辞，签核前须删改'),
};

export function disclaimerText(res: FauCapResult, t: L): string {
  return res.disclaimer ? t(CAP_OUT[res.disclaimer]) : '';
}
export function degradedText(res: FauCapResult, t: L): string {
  return res.degraded.authorized ? '' : t(CAP_OUT.degraded, { p0: t(CAP_OUT[res.degraded.completeness]) });
}

const tagText = (t: L, src: Parameters<typeof sourceTag>[0]) => { const g = sourceTag(src); return t(g.key, g.params); };

/** 单元格 → 写进 xlsx 的值：比例乘 100（表头带 %），金额两位、其他四位小数；固定文案按输出语言 */
function cellOut(v: FauCapCell | undefined, unit: FauCapUnit, t: L): XCell {
  if (v === null || v === undefined) return '';
  if (typeof v === 'object') return t(v.key, v.params);
  if (typeof v !== 'number') return v;
  if (unit === 'pct') return Math.round(v * 1e6) / 1e4;
  return Math.round(v * (unit === 'money' ? 100 : 1e4)) / (unit === 'money' ? 100 : 1e4);
}
const head = (label: string, unit: FauCapUnit, t: L) => `${t(label)}${unit === 'pct' ? ' (%)' : ''}`;

export interface CapExtra { levels: string[]; docx: boolean; engineDetail: unknown; inputs: CapIn }

/** F1 四种模型写公式联动；其它模式返回 null，按结果表写 */
function modelSheets(res: FauCapResult, extra: CapExtra, t: L, nIn: string, nCalc: string): ModelSheets | null {
  if (res.moduleId !== 'valuation' || !extra.engineDetail) return null;
  const v = extra.inputs;
  switch (res.modeId) {
    case 'dcf': return dcfModel(t, nIn, nCalc, extra.engineDetail as DcfResult, dcfInput(v));
    case 'lbo': return lboModel(t, nIn, nCalc, extra.engineDetail as LboResult, lboInput(v));
    case 'three_statement': return threeStatementModel(t, nIn, nCalc, (extra.engineDetail as { years: TsYear[] }).years, tsInput(v));
    case 'comps': {
      const d = extra.engineDetail as { peers: Peer[]; netDebt: number };
      const num = (k: string) => (typeof v.f[k] === 'number' ? v.f[k] as number : null);
      return compsModel(t, nIn, nCalc, d.peers, { ebitda: num('targetEbitda'), revenue: num('targetRevenue'), netIncome: num('targetNetIncome'), netDebt: d.netDebt });
    }
    default: return null;
  }
}

export function writeCapitalOutputs(ctx: OutputCtx, res: FauCapResult, extra: CapExtra): { xlsx: string; docx: string | null; audit: Array<{ id: string; ok: boolean }> } {
  const t = labeler(ctx.locale);
  const rtl = ctx.locale === 'ar';
  const disc = disclaimerText(res, t);
  const deg = degradedText(res, t);
  const banner = [t(OUT.draft), disc, deg].filter(Boolean).join(' · ');
  const title = `${t(ctx.modeName)}`;

  const tableNames = res.tables.map((x) => t(x.title));
  const names = planSheetNames([t(i18nKey('封面与签核页')), t(i18nKey('假设')), t(i18nKey('计算')), t(i18nKey('关键指标')), ...tableNames, t(i18nKey('输入与来源')), t(i18nKey('叙述与回核')), t(i18nKey('事实与出处')), 'Checks']);
  const [nCover, nIn, nCalc, nMetrics] = names;
  const nTables = names.slice(4, 4 + tableNames.length);
  const [nInputs, nNarr, nFacts, nChecks] = names.slice(4 + tableNames.length);

  const model = modelSheets(res, extra, t, nIn, nCalc);
  const sheets: XSheet[] = [];
  const cover = coverRows(ctx, t, title, extra.levels);
  cover.splice(10, 0, ...[disc, deg].filter(Boolean).map((x) => [x] as XCell[]));
  sheets.push({ name: nCover, banner, rows: cover });
  if (model) sheets.push(...model.sheets.map((s) => ({ ...s, banner })));
  const unitMark = (u: FauCapUnit) => (u === 'pct' ? '%' : u === 'x' ? 'x' : u === 'bp' ? 'bp' : '');
  sheets.push({ name: nMetrics, banner, headers: [t(i18nKey('指标')), t(i18nKey('数值')), t(i18nKey('单位')), t(i18nKey('提示'))], rows: res.metrics.map((m) => [t(m.label), cellOut(m.value, m.unit, t), unitMark(m.unit), m.flag === 'warn' || m.flag === 'bad' ? '⚠' : '']) });
  res.tables.forEach((tb, i) => {
    sheets.push({ name: nTables[i], banner, headers: tb.columns.map((c) => head(c.label, c.unit, t)), rows: tb.rows.map((r) => tb.columns.map((c) => cellOut(r[c.key], c.unit, t))) });
  });

  // 输入与来源：每个值、每行都带来源标注；没有来源的标 [未注明来源]
  const inRows: XCell[][] = res.inputs.fields.map((f) => [t(f.label), cellOut(f.value as FauCapCell, f.unit, t), f.unit === 'pct' ? '%' : '', tagText(t, f.src)]);
  for (const tb of res.inputs.tables.filter((x) => x.rows.length)) {
    inRows.push([], [t(tb.title)], [...tb.columns.map((c) => head(c.label, c.unit, t)), t(OUT.source)]);
    for (const r of tb.rows) inRows.push([...tb.columns.map((c) => cellOut(r.cells[c.key], c.unit, t)), tagText(t, r.src)]);
  }
  for (const u of res.upstream) {
    inRows.push([], [tagText(t, { kind: 'handoff', name: `${u.moduleId}/${u.modeId}` })]);
    for (const m of u.metrics) inRows.push([t(m.label), cellOut(m.value, m.unit, t), m.unit === 'pct' ? '%' : '', tagText(t, { kind: 'handoff', name: u.runId })]);
  }
  sheets.push({ name: nInputs, banner, headers: [t(i18nKey('项目')), t(i18nKey('数值')), t(i18nKey('单位')), t(OUT.source)], rows: inRows });

  const narr: XCell[][] = (res.sections || []).flatMap((s) => [[s.heading], ...s.paragraphs.map((p) => ['', p.status === 'verified' ? p.text : `${p.text} ${t(CAP_OUT.unsourced)}`, t(p.status === 'verified' ? OUT.verified : OUT.unverified), [...(p.missing || []), p.advice ? t(CAP_OUT.adviceFlag) : ''].filter(Boolean).join(', ')])]);
  if (narr.length) sheets.push({ name: nNarr, banner, headers: [t(i18nKey('小节')), t(i18nKey('段落')), t(i18nKey('回核')), t(i18nKey('数据里找不到'))], rows: narr });
  if (res.facts?.length) {
    sheets.push({ name: nFacts, banner, headers: [t(i18nKey('指标 / 事实')), t(i18nKey('数值')), t(OUT.source), t(i18nKey('原文引文'))],
      rows: res.facts.map((f) => [f.label, f.value, f.page ? t(i18nKey('[上传: {p0} 第 {n} 页]'), { p0: f.doc, n: f.page }) : tagText(t, { kind: 'upload', file: f.doc }), f.quote]) });
  }

  const audit = model ? auditFormulas(sheets, model.calcCells) : [];
  const AUDIT_LABEL: Record<string, string> = { refs: i18nKey('公式自检：引用的工作表都存在'), noref: i18nKey('公式自检：没有 #REF! 断链'), calc: i18nKey('公式自检：计算区没有写死的数字') };
  const unverified = (res.sections || []).flatMap((s) => s.paragraphs).filter((p) => p.status !== 'verified').length;
  const unsourcedInputs = res.inputs.fields.filter((f) => f.src.kind === 'default').length + res.inputs.tables.flatMap((x) => x.rows).filter((r) => r.src.kind === 'default').length;
  const checks: XCell[][] = [
    ...(model?.checks || []),
    ...audit.map((a) => [t(AUDIT_LABEL[a.id]), a.ok] as XCell[]),
    [t(i18nKey('所有输入都有来源')), unsourcedInputs === 0],
    ...(res.sections ? [[t(i18nKey('叙述里的数字都已回核')), unverified === 0] as XCell[]] : []),
    ...res.flags.map((f) => [t(f.message.key, f.message.params), f.level !== 'warn'] as XCell[]),
  ];
  sheets.push({ name: nChecks, banner, headers: [t(OUT.check), t(OUT.result)], rows: checks });

  const ordered = sheets.sort((a, b) => names.indexOf(a.name) - names.indexOf(b.name));
  const xlsx = join(ctx.dir, outputFileName(ctx.moduleCode, title, ctx.period, 'xlsx', ctx.at));
  writeWorkbookFile(xlsx, ordered, { rtl });

  let docx: string | null = null;
  if (extra.docx) {
    docx = join(ctx.dir, outputFileName(ctx.moduleCode, `${title}-${t(i18nKey('备忘录'))}`, ctx.period, 'docx', ctx.at));
    const sections: DocSection[] = [
      { heading: t(i18nKey('数据来源与完整度')), paragraphs: [deg, disc, t(OUT.boundary)].filter(Boolean) },
      ...(res.metrics.length ? [{ heading: t(i18nKey('关键指标')), table: { headers: [t(i18nKey('指标')), t(i18nKey('数值'))], rows: res.metrics.map((m) => [t(m.label), `${String(cellOut(m.value, m.unit, t))}${unitMark(m.unit)}`]) } }] : []),
      ...(res.sections || []).map((s) => ({ heading: s.heading, paragraphs: s.paragraphs.map((p) => (p.status === 'verified' ? p.text : `${p.text} ${t(CAP_OUT.unsourced)}`)) })),
      ...(res.facts?.length ? [{ heading: t(i18nKey('事实与出处')), table: { headers: [t(i18nKey('指标 / 事实')), t(i18nKey('数值')), t(OUT.source)], rows: res.facts.map((f) => [f.label, f.value, f.page ? t(i18nKey('[上传: {p0} 第 {n} 页]'), { p0: f.doc, n: f.page }) : tagText(t, { kind: 'upload', file: f.doc })]) } }] : []),
      ...(res.flags.length ? [{ heading: t(i18nKey('提醒')), paragraphs: res.flags.map((f) => t(f.message.key, f.message.params)) }] : []),
    ];
    writeDocxFile(docx, {
      title, subtitle: `${ctx.companyName} · ${ctx.projectName}`,
      meta: [[t(OUT.module), `${ctx.moduleCode} ${t(ctx.moduleName)}`], [t(OUT.preparedAt), (ctx.at || new Date()).toISOString().slice(0, 10)], [t(OUT.model), ctx.model || '']],
      header: disc || t(OUT.notOpinion), watermark: t(OUT.draft), rtl, sections,
    });
  }
  return { xlsx, docx, audit };
}
