/**
 * B4 产出：复核意见表 xlsx（报表勾稽 / 底稿质检 / 交叉索引 / LP 逐行比对 / 放行或暂扣建议 / Checks）+ 复核备忘录 docx。
 * 「复核意见」指复核人的处理意见与放行建议，不是审计意见；文书只有「发现与建议」。
 */
import { join } from 'node:path';
import { i18nKey } from '@totalclaw/i18n';
import type { FauReviewResult } from '@totalclaw/ipc-contracts';
import { OUT, fmtAmount, labeler, outputFileName } from '../../../outputs/common';
import { addr, major, planSheetNames, writeWorkbookFile, type XCell } from '../../../outputs/xlsx';
import { writeDocxFile } from '../../../outputs/docx';
import { coverRows, type OutputCtx } from '../../../outputs/close';
import { NAV_LINE_LABEL, QC_SEVERITY_LABEL, XLS_RULE_LABEL } from '../../../../../../shared/financeAudit/auditLabels';

const DECISION = { release: i18nKey('建议放行'), hold: i18nKey('建议暂扣') };

export function writeReviewOutputs(ctx: OutputCtx, res: FauReviewResult, levels: string[]): Array<{ kind: 'xlsx' | 'docx'; path: string; title: string }> {
  const t = labeler(ctx.locale);
  const rtl = ctx.locale === 'ar';
  const banner = t(OUT.draft);
  const sheets: Parameters<typeof writeWorkbookFile>[1] = [];
  const checks: XCell[][] = [];
  const title = t(i18nKey('复核意见表'));
  const [nCover, nTrial, nXls, nRef, nNav, nChecks] = planSheetNames([t(i18nKey('封面与签核页')), t(i18nKey('报表勾稽')), t(i18nKey('底稿质检')), t(i18nKey('交叉索引')), t(i18nKey('LP 逐行比对')), 'Checks']);
  sheets.push({ name: nCover, banner, rows: [...coverRows(ctx, t, title, levels), [], [t(i18nKey('放行建议')), t(DECISION[res.recommendation])], ...res.reasons.map((r) => ['', t(r.key, r.params)])] });
  if (res.trial) {
    sheets.push({ name: nTrial, banner, headers: [t(OUT.check), t(OUT.left), t(OUT.right), t(OUT.diff), t(OUT.result), t(i18nKey('说明'))],
      rows: res.trial.checks.map((c) => [c.id, major(c.left), major(c.right), major(c.diff), c.ok, t(c.message.key, c.message.params)]) });
    checks.push([t(i18nKey('试算平衡')), res.trial.balanced]);
  }
  if (res.xls) {
    sheets.push({ name: nXls, banner, headers: [t(i18nKey('文件')), t(i18nKey('工作表')), t(i18nKey('单元格')), t(i18nKey('规则')), t(i18nKey('严重程度')), t(i18nKey('公式')), t(i18nKey('说明'))],
      rows: res.xls.map((f) => [f.file, f.sheet, f.cell, t(XLS_RULE_LABEL[f.rule]), t(QC_SEVERITY_LABEL[f.severity]), f.formula ? `=${f.formula}` : '', f.detail || '']) });
    checks.push([t(i18nKey('底稿没有严重问题')), !res.xls.some((f) => f.severity === 'critical')]);
  }
  if (res.crossRefs) {
    sheets.push({ name: nRef, banner, headers: [t(i18nKey('索引号')), t(i18nKey('文件')), t(i18nKey('找到对应底稿'))], rows: res.crossRefs.map((r) => [r.ref, r.file, r.found]) });
    checks.push([t(i18nKey('交叉索引都能对上')), res.crossRefs.every((r) => r.found)]);
  }
  if (res.nav) {
    const rows: XCell[][] = [];
    const R0 = 2;
    for (const lp of res.nav.lps) {
      for (const l of lp.lines) {
        const r = R0 + rows.length;
        rows.push([lp.lpId, lp.pct, t(NAV_LINE_LABEL[l.line]), major(l.statement), major(l.recomputed), { f: `ROUND(${addr(r, 3)}-${addr(r, 4)},2)`, v: major(l.diff) ?? 0 }, l.ok, t(DECISION[lp.decision])]);
      }
    }
    sheets.push({ name: nNav, banner, headers: [t(i18nKey('LP 编号')), t(i18nKey('持有比例')), t(i18nKey('行项目')), t(i18nKey('对账单金额')), t(i18nKey('重算金额')), t(OUT.diff), t(OUT.result), t(i18nKey('放行建议'))], rows });
    checks.push([t(i18nKey('全部 LP 逐行一致')), res.nav.lps.every((x) => x.ok)], [t(i18nKey('LP 期末资本合计 = 基金净值')), res.nav.navTies]);
  }
  sheets.push({ name: nChecks, banner, headers: [t(OUT.check), t(OUT.result)], rows: checks });
  const path = join(ctx.dir, outputFileName(ctx.moduleCode, title, ctx.period, 'xlsx', ctx.at));
  writeWorkbookFile(path, sheets, { rtl });

  const memo = t(i18nKey('复核备忘录'));
  const memoPath = join(ctx.dir, outputFileName(ctx.moduleCode, memo, ctx.period, 'docx', ctx.at));
  const crit = (res.xls || []).filter((f) => f.severity === 'critical');
  writeDocxFile(memoPath, {
    title: memo, subtitle: `${ctx.companyName} · ${ctx.period}`, header: t(OUT.notOpinion), watermark: t(OUT.draft), rtl,
    sections: [
      { heading: t(i18nKey('放行建议')), paragraphs: [t(DECISION[res.recommendation]), ...res.reasons.map((r) => `• ${t(r.key, r.params)}`)] },
      ...(res.trial ? [{ heading: t(i18nKey('报表勾稽')), paragraphs: res.trial.checks.map((c) => `${c.ok ? '✓' : '✗'} ${t(c.message.key, c.message.params)}`) }] : []),
      ...(res.xls ? [{ heading: t(i18nKey('底稿质检')), paragraphs: crit.length ? crit.slice(0, 50).map((f) => `${f.file} ${f.sheet}!${f.cell} · ${t(XLS_RULE_LABEL[f.rule])}`) : [t(i18nKey('没有严重问题'))] }] : []),
      ...(res.nav ? [{ heading: t(i18nKey('LP 对账单复核')), table: { headers: [t(i18nKey('LP 编号')), t(i18nKey('期末资本（对账单）')), t(i18nKey('期末资本（重算）')), t(i18nKey('放行建议'))],
        rows: res.nav.lps.map((lp) => { const e = lp.lines.find((l) => l.line === 'ending')!; return [lp.lpId, fmtAmount(e.statement, ctx.locale), fmtAmount(e.recomputed, ctx.locale), t(DECISION[lp.decision])]; }) } }] : []),
      { heading: t(i18nKey('发现与建议')), paragraphs: [t(i18nKey('本备忘录是复核草稿，列出勾稽与质检发现和放行 / 暂扣建议，由复核人与批准人决定；不出具审计意见。'))] },
    ],
  });
  return [{ kind: 'xlsx', path, title: i18nKey('复核意见表') }, { kind: 'docx', path: memoPath, title: i18nKey('复核备忘录') }];
}
