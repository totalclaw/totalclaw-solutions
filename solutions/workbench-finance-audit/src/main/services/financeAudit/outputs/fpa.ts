/**
 * 批次 5（fpa，D1–D10）产出：十个模块共用一种结果形状（表 + 叙述 + 预警 + 来源 + 自检），这里统一写成
 *   xlsx：封面与签核页 / 每张表一个 sheet / 叙述 / 数据来源 / Checks（TRUE / FALSE）；
 *   docx：封面 + 预警 + 表 + 叙述（逐段标已核实 / 未核实）+ 数据来源 + 发现与建议（无意见段）；
 *   pdf：同一份内容的 HTML（阿语 dir="rtl"），由 Electron printToPDF 渲染（第 10 节）。
 * 表头、sheet 名、固定说明按输出语言（tIn）；用户数据（科目名、指标名）原样保留。金额写主单位数值，比例写百分数。
 */
import { join } from 'node:path';
import { writeFileSync } from 'node:fs';
import { i18nKey } from '@totalclaw/i18n';
import type { FauFpaCell, FauFpaColumn, FauFpaLevel, FauFpaResult, FauFpaTable, FauLocale, FauReminder } from '@totalclaw/ipc-contracts';
import { OUT, fmtAmount, fmtPct, labeler, outputFileName, type L } from './common';
import { coverRows, type OutputCtx } from './close';
import { major, writeWorkbookFile, type XCell, type XSheet } from './xlsx';
import { buildHtml, writeDocxFile, type DocSection, type DocSpec } from './docx';

export const LEVEL_LABELS: Record<FauFpaLevel, string> = { green: i18nKey('绿灯'), yellow: i18nKey('黄灯'), red: i18nKey('红灯') };
export const NARRATIVE_STATUS: Record<string, string> = { verified: i18nKey('已核实'), unverified: i18nKey('未核实'), unknown: i18nKey('原因不明，待主管确认') };

/** 表头：比例列加「(%)」，xlsx 里写百分数数值 */
function header(c: FauFpaColumn, t: L): string {
  return c.kind === 'pct' ? `${t(c.label)} (%)` : t(c.label);
}

function xcell(c: FauFpaColumn, v: FauFpaCell, t: L): XCell {
  if (v === null || v === undefined || v === '') return null;
  switch (c.kind) {
    case 'amount': return typeof v === 'number' ? major(v) : v;
    case 'pct': return typeof v === 'number' ? Math.round(v * 10000) / 100 : v;
    case 'level': return LEVEL_LABELS[v as FauFpaLevel] ? t(LEVEL_LABELS[v as FauFpaLevel]) : String(v);
    case 'label': return t(String(v));
    default: return v;
  }
}

/** 给人看的单元格文字（docx / pdf / pptx） */
export function cellText(c: FauFpaColumn, v: FauFpaCell, locale: FauLocale, t: L): string {
  if (v === null || v === undefined || v === '') return '';
  switch (c.kind) {
    case 'amount': return typeof v === 'number' ? fmtAmount(v, locale) : String(v);
    case 'pct': return typeof v === 'number' ? fmtPct(v, locale) : String(v);
    case 'num': return typeof v === 'number' ? new Intl.NumberFormat(locale === 'ar' ? 'ar-u-nu-latn' : locale, { maximumFractionDigits: 2 }).format(v) : String(v);
    default: return String(xcell(c, v, t) ?? '');
  }
}

export interface FpaOutExtra {
  /** 产出名（词典 key），也是文件名的一部分 */
  title: string;
  levels: string[];
  reminders: FauReminder[];
  /** 固定声明（词典 key），写在封面与文书末尾，如「不代发」「非投资建议」 */
  statements?: string[];
}

function sourcesRows(res: FauFpaResult, t: L): XCell[][] {
  return res.sources.map((s) => [s.label, s.slot, s.rows, s.signed ? t(i18nKey('已签核')) : t(i18nKey('未签核')), (s.signedBy || []).join(', ')]);
}

export function writeFpaXlsx(ctx: OutputCtx, res: FauFpaResult, extra: FpaOutExtra): string {
  const t = labeler(ctx.locale);
  const banner = t(OUT.draft);
  const cover = coverRows(ctx, t, t(extra.title), extra.levels);
  for (const s of extra.statements || []) cover.splice(11, 0, [t(s)]);
  const sheets: XSheet[] = [{ name: t(i18nKey('封面与签核页')), rows: cover }];
  for (const tb of res.tables) {
    sheets.push({ name: t(tb.title), banner, headers: tb.columns.map((c) => header(c, t)), rows: tb.rows.map((r) => tb.columns.map((c) => xcell(c, r[c.key] ?? null, t))) });
  }
  if (res.alerts.length) {
    sheets.push({ name: t(i18nKey('预警')), banner, headers: [t(i18nKey('级别')), t(i18nKey('说明'))], rows: res.alerts.map((a) => [t(LEVEL_LABELS[a.level]), t(a.message.key, a.message.params)]) });
  }
  if (res.narratives.length) {
    sheets.push({ name: t(i18nKey('说明')), banner, headers: [t(i18nKey('小节')), t(i18nKey('说明')), t(i18nKey('回核')), t(i18nKey('数据里找不到'))], rows: res.narratives.map((n) => [t(n.heading), n.text, t(NARRATIVE_STATUS[n.status]), (n.missing || []).join(', ')]) });
  }
  sheets.push({ name: t(i18nKey('数据来源')), banner, headers: [t(i18nKey('数据集')), t(i18nKey('槽位')), t(i18nKey('数据行数')), t(i18nKey('签核状态')), t(i18nKey('引用它的已归档模块'))], rows: sourcesRows(res, t) });
  sheets.push({ name: 'Checks', banner, headers: [t(OUT.check), t(OUT.result)], rows: res.checks.map((c) => [t(c.message.key, c.message.params), c.ok]) });
  const path = join(ctx.dir, outputFileName(ctx.moduleCode, t(extra.title), ctx.period, 'xlsx', ctx.at));
  writeWorkbookFile(path, sheets, { rtl: ctx.locale === 'ar' });
  return path;
}

function docTable(tb: FauFpaTable, locale: FauLocale, t: L): DocSection {
  return { heading: t(tb.title), table: { headers: tb.columns.map((c) => t(c.label)), rows: tb.rows.map((r) => tb.columns.map((c) => cellText(c, r[c.key] ?? null, locale, t))) } };
}

export function fpaDocSpec(ctx: OutputCtx, res: FauFpaResult, extra: FpaOutExtra, opts: { tables?: string[] } = {}): DocSpec {
  const t = labeler(ctx.locale);
  const sections: DocSection[] = [];
  if (res.alerts.length) sections.push({ heading: t(i18nKey('预警')), paragraphs: res.alerts.map((a) => `• [${t(LEVEL_LABELS[a.level])}] ${t(a.message.key, a.message.params)}`) });
  for (const n of res.narratives) {
    sections.push({ heading: t(n.heading), paragraphs: [n.text, `${t(i18nKey('回核'))}: ${t(NARRATIVE_STATUS[n.status])}${n.missing?.length ? ` · ${t(i18nKey('数据里找不到'))}: ${n.missing.join(', ')}` : ''}`] });
  }
  for (const tb of res.tables.filter((x) => !opts.tables || opts.tables.includes(x.id))) sections.push(docTable(tb, ctx.locale, t));
  sections.push({
    heading: t(i18nKey('数据来源')),
    table: { headers: [t(i18nKey('数据集')), t(i18nKey('数据行数')), t(i18nKey('签核状态'))], rows: res.sources.map((s) => [s.label, String(s.rows), s.signed ? t(i18nKey('已签核')) : t(i18nKey('未签核'))]) },
  });
  if (extra.reminders.length) sections.push({ heading: t(i18nKey('提醒项')), paragraphs: extra.reminders.map((r) => `• ${t(r.message.key, r.message.params)}`) });
  sections.push({ heading: t(i18nKey('发现与建议')), paragraphs: [t(i18nKey('以上为编制人整理的发现与建议，供复核与批准；指标与差异由规则计算，说明文字中的数字已逐条回核数据来源。')), ...(extra.statements || []).map((s) => t(s)), t(OUT.boundary)] });
  return {
    title: t(extra.title), subtitle: `${ctx.companyName} · ${ctx.period}`,
    meta: [[t(OUT.project), ctx.projectName], [t(OUT.module), `${ctx.moduleCode} ${t(ctx.moduleName)}`], [t(OUT.standard), t(ctx.standardLabel)], [t(OUT.preparedAt), (ctx.at || new Date()).toISOString().slice(0, 10)]],
    header: t(OUT.notOpinion), watermark: t(OUT.draft), rtl: ctx.locale === 'ar', sections,
  };
}

export function writeFpaDocx(ctx: OutputCtx, res: FauFpaResult, extra: FpaOutExtra, opts: { tables?: string[] } = {}): { path: string; spec: DocSpec } {
  const spec = fpaDocSpec(ctx, res, extra, opts);
  const path = join(ctx.dir, outputFileName(ctx.moduleCode, spec.title, ctx.period, 'docx', ctx.at));
  writeDocxFile(path, spec);
  return { path, spec };
}

export type FpaPdfWriter = (path: string, html: string) => Promise<void>;

/** 同一份内容出 PDF（阿语 HTML dir="rtl"）；没有渲染器（单测）时写 .html 便于检查 */
export async function writeFpaPdf(ctx: OutputCtx, spec: DocSpec, writer: FpaPdfWriter | null): Promise<{ path: string; html: string; pdf: boolean }> {
  const html = buildHtml(spec, ctx.locale);
  if (!writer) {
    const path = join(ctx.dir, outputFileName(ctx.moduleCode, spec.title, ctx.period, 'html', ctx.at));
    writeFileSync(path, html, 'utf8');
    return { path, html, pdf: false };
  }
  const path = join(ctx.dir, outputFileName(ctx.moduleCode, spec.title, ctx.period, 'pdf', ctx.at));
  await writer(path, html);
  return { path, html, pdf: true };
}
