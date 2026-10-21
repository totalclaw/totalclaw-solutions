/**
 * B2 产出：年度审计计划（xlsx + docx）、审计程序与发现底稿 xlsx + 审计报告草稿 docx（只有「发现与建议」，无意见段）、整改台账 xlsx。
 */
import { join } from 'node:path';
import { i18nKey } from '@totalclaw/i18n';
import type { FauInternalAuditResult } from '@totalclaw/ipc-contracts';
import { OUT, labeler, outputFileName } from '../../../outputs/common';
import { addr, planSheetNames, writeWorkbookFile, type XCell } from '../../../outputs/xlsx';
import { writeDocxFile } from '../../../outputs/docx';
import { coverRows, type OutputCtx } from '../../../outputs/close';
import { FINDING_KIND_LABEL, IMPACT_LABEL, SEVERITY_LABEL, TIER_LABEL, TRACK_STATUS_LABEL } from '../../../../../../shared/financeAudit/auditLabels';

const q = (n: string) => n.replace(/'/g, "''");
type Out = Array<{ kind: 'xlsx' | 'docx'; path: string; title: string }>;

export function writeInternalAuditOutputs(ctx: OutputCtx, res: FauInternalAuditResult, levels: string[]): Out {
  const t = labeler(ctx.locale);
  const rtl = ctx.locale === 'ar';
  const banner = t(OUT.draft);
  const out: Out = [];
  const yes = t(i18nKey('是'));
  const R0 = 2;

  if (res.mode === 'plan' && res.plan) {
    const p = res.plan;
    const [nCover, nPlan, nRes, nChecks] = planSheetNames([t(i18nKey('封面与签核页')), t(i18nKey('风险评估与审计计划')), t(i18nKey('资源测算')), 'Checks']);
    const rows: XCell[][] = p.areas.map((a) => [a.id, a.name, t(IMPACT_LABEL[a.likelihood]), t(IMPACT_LABEL[a.impact]), t(IMPACT_LABEL[a.risk]), a.mandatory ? yes : '', a.lastAudited, a.days, a.included ? yes : '', a.quarter]);
    const included = p.areas.filter((a) => a.included);
    const last = R0 + p.areas.length - 1;
    const resRows: XCell[][] = [
      [t(i18nKey('可用人天')), p.availableDays],
      [t(i18nKey('需求人天（必审 + 高 / 中风险）')), p.requiredDays],
      [t(i18nKey('缺口')), { f: `${addr(R0 + 1, 1)}-${addr(R0, 1)}`, v: p.gap }],
      [t(i18nKey('纳入计划的人天')), { f: p.areas.length ? `SUMIF('${q(nPlan)}'!I${R0 + 1}:I${last + 1},"${yes}",'${q(nPlan)}'!H${R0 + 1}:H${last + 1})` : '0', v: included.reduce((s, a) => s + a.days, 0) }],
    ];
    const title = t(i18nKey('年度审计计划'));
    const path = join(ctx.dir, outputFileName(ctx.moduleCode, title, ctx.period, 'xlsx', ctx.at));
    writeWorkbookFile(path, [
      { name: nCover, banner, rows: coverRows(ctx, t, title, levels) },
      { name: nPlan, banner, headers: [t(i18nKey('编号')), t(i18nKey('审计领域')), t(i18nKey('可能性')), t(i18nKey('影响')), t(i18nKey('风险等级')), t(i18nKey('必审')), t(i18nKey('上次审计日期')), t(i18nKey('预计人天')), t(i18nKey('纳入计划')), t(i18nKey('季度'))], rows },
      { name: nRes, banner, headers: [t(i18nKey('项目')), t(i18nKey('人天'))], rows: resRows },
      { name: nChecks, banner, headers: [t(OUT.check), t(OUT.result)], rows: [
        [t(i18nKey('高风险与必审领域全部纳入计划')), p.areas.filter((a) => a.mandatory || a.risk === 'high').every((a) => a.included)],
        [t(i18nKey('资源无缺口')), p.gap <= 0],
      ] },
    ], { rtl });
    out.push({ kind: 'xlsx', path, title: i18nKey('年度审计计划') });
    const docPath = join(ctx.dir, outputFileName(ctx.moduleCode, t(i18nKey('年度审计计划说明')), ctx.period, 'docx', ctx.at));
    writeDocxFile(docPath, {
      title: t(i18nKey('年度审计计划说明')), subtitle: `${ctx.companyName} · ${ctx.period}`, header: t(OUT.notOpinion), watermark: t(OUT.draft), rtl,
      sections: [
        { heading: t(i18nKey('计划说明')), paragraphs: [p.narrative || t(i18nKey('无')), p.narrativeStatus === 'unverified' ? t(i18nKey('（说明里有数字不在计划数据里，标为未核实）')) : ''].filter(Boolean) },
        { heading: t(i18nKey('纳入计划的领域')), table: { headers: [t(i18nKey('审计领域')), t(i18nKey('风险等级')), t(i18nKey('预计人天')), t(i18nKey('季度'))], rows: included.map((a) => [a.name, t(IMPACT_LABEL[a.risk]), a.days, a.quarter]) } },
      ],
    });
    out.push({ kind: 'docx', path: docPath, title: i18nKey('年度审计计划说明') });
  }

  if (res.mode === 'fieldwork') {
    const procs = res.procedures || [];
    const finds = res.findings || [];
    const [nCover, nProc, nFind] = planSheetNames([t(i18nKey('封面与签核页')), t(i18nKey('审计程序')), t(i18nKey('审计发现'))]);
    const title = t(i18nKey('审计程序与发现底稿'));
    const path = join(ctx.dir, outputFileName(ctx.moduleCode, title, ctx.period, 'xlsx', ctx.at));
    writeWorkbookFile(path, [
      { name: nCover, banner, rows: coverRows(ctx, t, title, levels) },
      { name: nProc, banner, headers: [t(i18nKey('编号')), t(i18nKey('领域')), t(i18nKey('目标')), t(i18nKey('程序')), t(i18nKey('证据'))], rows: procs.map((x) => [x.id, x.area, x.objective, x.procedure, x.evidence]) },
      { name: nFind, banner, headers: [t(i18nKey('编号')), t(i18nKey('标题')), t(i18nKey('类型')), t(i18nKey('严重程度')), t(i18nKey('现状')), t(i18nKey('标准')), t(i18nKey('原因')), t(i18nKey('影响')), t(i18nKey('建议')), t(i18nKey('原文依据')), t(i18nKey('来源文件'))],
        rows: finds.map((f) => [f.id, f.title, t(FINDING_KIND_LABEL[f.kind]), t(SEVERITY_LABEL[f.severity]), f.condition, f.criteria, f.cause, f.effect, f.recommendation, f.quote, f.docName]) },
    ], { rtl });
    out.push({ kind: 'xlsx', path, title: i18nKey('审计程序与发现底稿') });
    const docPath = join(ctx.dir, outputFileName(ctx.moduleCode, t(i18nKey('内部审计报告草稿')), ctx.period, 'docx', ctx.at));
    writeDocxFile(docPath, {
      title: t(i18nKey('内部审计报告草稿')), subtitle: `${ctx.companyName} · ${ctx.period}`, header: t(OUT.notOpinion), watermark: t(OUT.draft), rtl,
      sections: [
        { heading: t(i18nKey('审计范围与程序')), paragraphs: procs.length ? procs.map((x) => `${x.id} ${x.area}: ${x.procedure}`) : [t(i18nKey('无'))] },
        ...finds.map((f) => ({
          heading: `${f.id} ${f.title} · ${t(SEVERITY_LABEL[f.severity])}`,
          paragraphs: [`${t(i18nKey('现状'))}: ${f.condition}`, `${t(i18nKey('标准'))}: ${f.criteria}`, `${t(i18nKey('原因'))}: ${f.cause}`, `${t(i18nKey('影响'))}: ${f.effect}`, `${t(i18nKey('建议'))}: ${f.recommendation}`, `${t(i18nKey('原文依据'))}: ${f.quote} [${f.docName}]`],
        })),
        { heading: t(i18nKey('发现与建议')), paragraphs: [t(i18nKey('本报告为内部审计草稿，只列发现与建议，不出具审计意见；整改期限与责任人经被审计单位确认后录入整改台账。'))] },
      ],
    });
    out.push({ kind: 'docx', path: docPath, title: i18nKey('内部审计报告草稿') });
  }

  if (res.mode === 'tracking') {
    const list = res.tracked || [];
    const [nCover, nList, nSum] = planSheetNames([t(i18nKey('封面与签核页')), t(i18nKey('整改台账')), t(i18nKey('汇总'))]);
    const title = t(i18nKey('发现整改台账'));
    const path = join(ctx.dir, outputFileName(ctx.moduleCode, title, ctx.period, 'xlsx', ctx.at));
    const open = list.filter((f) => f.status !== 'closed');
    writeWorkbookFile(path, [
      { name: nCover, banner, rows: [...coverRows(ctx, t, title, levels), [], [t(i18nKey('截至日')), res.asOf]] },
      { name: nList, banner, headers: [t(i18nKey('编号')), t(i18nKey('标题')), t(i18nKey('严重程度')), t(i18nKey('负责人')), t(i18nKey('整改期限')), t(i18nKey('状态')), t(i18nKey('完成日期')), t(i18nKey('超期天数')), t(i18nKey('升级')), t(OUT.source)],
        rows: list.map((f) => [f.id, f.title, t(SEVERITY_LABEL[f.severity]), f.owner, f.dueDate, t(TRACK_STATUS_LABEL[f.status]), f.closedDate, f.overdueDays || '', t(TIER_LABEL[f.tier]), f.fromModule || '']) },
      { name: nSum, banner, headers: [t(i18nKey('项目')), t(i18nKey('数量'))], rows: [
        [t(i18nKey('全部')), list.length], [t(i18nKey('未关闭')), open.length], [t(i18nKey('超期未整改')), open.filter((f) => f.tier > 0).length],
        [t(TIER_LABEL[2]), open.filter((f) => f.tier === 2).length], [t(TIER_LABEL[3]), open.filter((f) => f.tier === 3).length],
        [t(i18nKey('整改率')), list.length ? (list.length - open.length) / list.length : ''],
      ] },
    ], { rtl });
    out.push({ kind: 'xlsx', path, title: i18nKey('发现整改台账') });
  }
  return out;
}
