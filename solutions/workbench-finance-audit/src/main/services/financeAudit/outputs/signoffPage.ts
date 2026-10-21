/**
 * 签核页（第 9.3 节）：各级签核人、时间、意见、已知悉事项、文件哈希，留空签名栏供线下签字或电子签。
 * 归档包里附 xlsx 一份 + PDF 一份（PDF 由调用方用 Electron printToPDF 渲染同一份 HTML）。
 */
import { join } from 'node:path';
import { i18nKey } from '@totalclaw/i18n';
import type { FauLocale, FauReminder, FauSignoffRecord } from '@totalclaw/ipc-contracts';
import { OUT, labeler } from './common';
import { writeWorkbookFile } from './xlsx';
import { buildHtml, type DocSpec } from './docx';

const LEVEL: Record<string, string> = { prepare: OUT.prepare, review: OUT.review, approve: OUT.approve };

export function signoffSpec(
  locale: FauLocale, title: string, records: FauSignoffRecord[], reminders: FauReminder[], meta: Array<[string, string]>,
): DocSpec {
  const t = labeler(locale);
  const approved = records.filter((r) => r.decision === 'approve');
  const last = approved[approved.length - 1];
  const sodWaived = records.some((r) => r.sodWaived);
  return {
    title: t(i18nKey('签核页')), subtitle: title, meta, header: t(OUT.notOpinion), watermark: t(OUT.draft), rtl: locale === 'ar',
    sections: [
      {
        heading: t(i18nKey('签核记录')),
        paragraphs: sodWaived ? [t(i18nKey('职责未分离：编制人与复核人为同一人，按公司设置「允许但记录」放行。'))] : undefined,
        table: {
          headers: [t(OUT.signLevel), t(i18nKey('决定')), t(OUT.signer), t(OUT.signTitle), t(OUT.signAt), t(OUT.signComment), t(OUT.signature)],
          rows: records.map((r) => [t(LEVEL[r.level]), t(r.decision === 'approve' ? i18nKey('通过') : i18nKey('退回')), r.signer.name, r.signer.title, r.at, r.comment || '', '']),
        },
      },
      {
        heading: t(i18nKey('已知悉事项')),
        paragraphs: reminders.length ? reminders.map((r) => `• ${t(r.message.key, r.message.params)}`) : [t(i18nKey('无'))],
      },
      {
        heading: t(i18nKey('文件哈希（SHA-256）')),
        table: { headers: [t(i18nKey('文件')), 'SHA-256'], rows: (last?.artifacts || []).map((a) => [a.path.split(/[\\/]/).pop() || a.path, a.sha256]) },
      },
      { heading: t(i18nKey('签名')), paragraphs: [`${t(OUT.prepare)}: ____________`, `${t(OUT.review)}: ____________`, `${t(OUT.approve)}: ____________`] },
    ],
  };
}

export function writeSignoffPage(dir: string, locale: FauLocale, spec: DocSpec): { xlsxPath: string; html: string } {
  const t = labeler(locale);
  const xlsxPath = join(dir, `${t(i18nKey('签核页'))}.xlsx`.replace(/[\\/:*?"<>|]/g, '_'));
  const rows = spec.sections.flatMap((s) => [
    [s.heading],
    ...(s.paragraphs || []).map((p) => [p]),
    ...(s.table ? [s.table.headers, ...s.table.rows] : []),
    [],
  ]);
  writeWorkbookFile(xlsxPath, [{ name: t(i18nKey('签核页')), banner: spec.watermark, rows: [[spec.subtitle || ''], ...(spec.meta || []), [], ...rows] }], { rtl: spec.rtl });
  return { xlsxPath, html: buildHtml(spec, locale) };
}
