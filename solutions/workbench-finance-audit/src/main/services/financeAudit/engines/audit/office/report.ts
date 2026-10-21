/**
 * P4 质检报告 xlsx：封面（文件、范围、各级问题数）+ 问题明细 + Checks。只读检查，不改原文件；质检工具不走签核。
 */
import { join } from 'node:path';
import { i18nKey } from '@totalclaw/i18n';
import type { FauLocale, FauQcReport } from '@totalclaw/ipc-contracts';
import { OUT, labeler, outputFileName } from '../../../outputs/common';
import { planSheetNames, writeWorkbookFile } from '../../../outputs/xlsx';
import { DECK_RULE_LABEL, QC_SEVERITY_LABEL, XLS_RULE_LABEL } from '../../../../../../shared/financeAudit/auditLabels';

export function writeQcReport(dir: string, locale: FauLocale, report: Omit<FauQcReport, 'reportPath'>, at = new Date()): string {
  const t = labeler(locale);
  const banner = t(i18nKey('质检报告：只读检查，未改动原文件'));
  const rule = (r: string) => t(XLS_RULE_LABEL[r as keyof typeof XLS_RULE_LABEL] || DECK_RULE_LABEL[r] || r);
  const [nCover, nList, nChecks] = planSheetNames([t(i18nKey('封面')), t(i18nKey('问题明细')), 'Checks']);
  const title = t(i18nKey('质检报告'));
  const base = report.file.replace(/\.[^.]+$/, '').slice(0, 40);
  const path = join(dir, outputFileName('P4', `${title}-${base}`, at.toISOString().slice(0, 10), 'xlsx', at));
  writeWorkbookFile(path, [
    { name: nCover, banner, rows: [[title], [t(i18nKey('文件')), report.file], [t(i18nKey('范围')), report.scope || ''], [t(OUT.preparedAt), at.toISOString()],
      [], ...(['critical', 'important', 'minor'] as const).map((s) => [t(QC_SEVERITY_LABEL[s]), report.counts[s] || 0])] },
    { name: nList, banner, headers: [t(i18nKey('位置')), t(i18nKey('规则')), t(i18nKey('严重程度')), t(i18nKey('说明'))], rows: report.findings.map((f) => [f.location, rule(f.rule), t(QC_SEVERITY_LABEL[f.severity]), f.detail]) },
    { name: nChecks, banner, headers: [t(OUT.check), t(OUT.result)], rows: [[t(i18nKey('没有严重问题')), !report.findings.some((f) => f.severity === 'critical')]] },
  ], { rtl: locale === 'ar' });
  return path;
}
