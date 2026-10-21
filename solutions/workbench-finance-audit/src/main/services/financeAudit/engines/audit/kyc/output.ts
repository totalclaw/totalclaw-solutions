/**
 * B6 产出：客商尽调 xlsx（主体档案 / 受益所有人与控制人 / 规则结论 / 名单命中 / 风险评分 / 升级包 / Checks）。
 * 处置只有建议，最终由合规官决定；抽取的原文（含阿语）原样保留。
 */
import { join } from 'node:path';
import { i18nKey } from '@totalclaw/i18n';
import type { FauKycResult, FauKycValue } from '@totalclaw/ipc-contracts';
import { FAU_KYC_DISPOSITIONS } from '@totalclaw/ipc-contracts';
import { OUT, labeler, outputFileName } from '../../../outputs/common';
import { planSheetNames, writeWorkbookFile, type XCell } from '../../../outputs/xlsx';
import { coverRows, type OutputCtx } from '../../../outputs/close';
import { APPLICANT_LABEL, IMPACT_LABEL, KYC_DISPOSITION_LABEL, KYC_EFFECT_LABEL } from '../../../../../../shared/financeAudit/auditLabels';

export function writeKycOutputs(ctx: OutputCtx, res: FauKycResult, levels: string[]): Array<{ kind: 'xlsx'; path: string; title: string }> {
  const t = labeler(ctx.locale);
  const rtl = ctx.locale === 'ar';
  const banner = t(OUT.draft);
  const rec = res.record;
  const v = (x: FauKycValue | null): XCell[] => [x?.value || '', x?.quote || '', x?.docName || '', x ? t(OUT.verified) : ''];
  const [nCover, nProfile, nOwners, nRules, nHits, nScore, nPack, nChecks] = planSheetNames([
    t(i18nKey('封面与签核页')), t(i18nKey('主体档案')), t(i18nKey('受益所有人与控制人')), t(i18nKey('规则结论')), t(i18nKey('名单命中')), t(i18nKey('风险评分')), t(i18nKey('升级包')), 'Checks',
  ]);
  const title = t(i18nKey('客商尽调筛查'));
  const path = join(ctx.dir, outputFileName(ctx.moduleCode, `${title}-${rec.legalName?.value || ''}`.slice(0, 80), ctx.period, 'xlsx', ctx.at));
  const head = [t(i18nKey('字段')), t(i18nKey('值')), t(i18nKey('原文依据')), t(i18nKey('来源文件')), t(i18nKey('回核'))];
  writeWorkbookFile(path, [
    { name: nCover, banner, rows: [...coverRows(ctx, t, title, levels), [], [t(i18nKey('处置建议')), t(KYC_DISPOSITION_LABEL[res.disposition])], [t(i18nKey('风险等级')), t(IMPACT_LABEL[res.rating])], [t(i18nKey('处置建议只是建议，从不批准；由合规官决定'))]] },
    { name: nProfile, banner, headers: head, rows: [
      [t(i18nKey('主体类型')), t(APPLICANT_LABEL[rec.applicantType]), '', '', ''],
      [t(i18nKey('名称')), ...v(rec.legalName)], [t(i18nKey('出生 / 成立日期')), ...v(rec.dobOrFormation)], [t(i18nKey('国籍 / 注册地')), ...v(rec.jurisdiction)],
      [t(i18nKey('地址')), ...v(rec.address)], [t(i18nKey('资金来源')), ...v(rec.sourceOfFunds)],
      [t(i18nKey('自报政治公众人物')), rec.pepDeclared === null ? '' : rec.pepDeclared ? t(i18nKey('是')) : t(i18nKey('否')), '', '', ''],
      ...rec.idDocuments.map((d) => [`${t(i18nKey('证件'))} · ${d.type} · ${d.expiry}`, ...v(d.number)]),
      ...rec.documents.map((d) => [t(i18nKey('文件')), `${d.type} · ${d.date}`, '', d.docName, '']),
      ...rec.dropped.map((k) => [t(i18nKey('已丢弃（原文定位不到）')), k, '', '', t(OUT.unverified)]),
    ] },
    { name: nOwners, banner, headers: [t(i18nKey('类型')), t(i18nKey('名称')), t(i18nKey('国籍 / 职务')), t(i18nKey('持股比例')), t(i18nKey('原文依据'))], rows: [
      ...rec.beneficialOwners.map((b) => [t(i18nKey('受益所有人')), b.name.value, b.nationality, b.pct ?? '', b.name.quote]),
      ...rec.controllers.map((c) => [t(i18nKey('控制人')), c.name.value, c.role, '', c.name.quote]),
    ] },
    { name: nRules, banner, headers: [t(i18nKey('规则编号')), t(i18nKey('规则')), t(i18nKey('结论')), t(i18nKey('依据')), t(i18nKey('结果'))],
      rows: res.outcomes.map((o) => [o.ruleId, o.builtin ? t(o.text) : o.text, o.outcome === 'fail' ? t(i18nKey('规则已触发')) : o.outcome === 'pass' ? t(i18nKey('规则未触发')) : t(i18nKey('不适用')), o.evidence, t(KYC_EFFECT_LABEL[o.effect])]) },
    { name: nHits, banner, headers: [t(i18nKey('被筛查对象')), t(i18nKey('角色')), t(i18nKey('名单')), t(i18nKey('名单条目')), t(i18nKey('相似度')), t(i18nKey('强度'))],
      rows: res.hits.map((h) => [h.subject, h.role, h.listName, h.entry, h.score, h.strength === 'strong' ? t(i18nKey('强命中')) : t(i18nKey('疑似命中'))]) },
    { name: nScore, banner, headers: [t(i18nKey('因素')), t(i18nKey('值')), t(i18nKey('分值'))], rows: [...res.factors.map((f) => [t(f.factor), f.value, f.points]), [], [t(i18nKey('风险等级')), t(IMPACT_LABEL[res.rating]), res.factors.reduce((s, f) => s + f.points, 0)]] },
    { name: nPack, banner, headers: [t(i18nKey('项目')), t(i18nKey('内容'))], rows: [
      [t(i18nKey('处置建议')), t(KYC_DISPOSITION_LABEL[res.disposition])],
      [t(i18nKey('缺少的文件')), res.missingDocs.join(', ')],
      ...res.reasons.map((r) => [t(i18nKey('升级原因')), r]),
    ] },
    { name: nChecks, banner, headers: [t(OUT.check), t(OUT.result)], rows: [
      [t(i18nKey('处置建议在四种建议之内，不含批准')), FAU_KYC_DISPOSITIONS.includes(res.disposition)],
      [t(i18nKey('每条规则结论都引用规则编号')), res.outcomes.every((o) => !!o.ruleId)],
    ] },
  ], { rtl });
  return [{ kind: 'xlsx', path, title: i18nKey('客商尽调筛查') }];
}
