/**
 * B1 产出：风险控制矩阵 xlsx（起草模式）、控制测试底稿 xlsx、缺陷评估与整改计划 docx。
 * 表头与固定文案按输出语言（tIn）；控制描述、单号等用户数据原样保留。
 */
import { join } from 'node:path';
import { i18nKey } from '@totalclaw/i18n';
import type { FauDeficiencyGrade, FauIcfrResult } from '@totalclaw/ipc-contracts';
import { FAU_DEFICIENCY_GRADES } from '@totalclaw/ipc-contracts';
import { OUT, fmtAmount, labeler, outputFileName } from '../../../outputs/common';
import { addr, major, planSheetNames, writeWorkbookFile, type XCell } from '../../../outputs/xlsx';
import { writeDocxFile } from '../../../outputs/docx';
import { coverRows, type OutputCtx } from '../../../outputs/close';
import { FREQ_LABEL, GRADE_LABEL, IMPACT_LABEL, COMP_LABEL, RESULT_LABEL, CONCLUSION_LABEL, TYPE_LABEL, NATURE_LABEL } from '../../../../../../shared/financeAudit/auditLabels';

export function writeIcfrOutputs(ctx: OutputCtx, res: FauIcfrResult, levels: string[]): Array<{ kind: 'xlsx' | 'docx'; path: string; title: string }> {
  const t = labeler(ctx.locale);
  const rtl = ctx.locale === 'ar';
  const banner = t(OUT.draft);
  const out: Array<{ kind: 'xlsx' | 'docx'; path: string; title: string }> = [];
  const yes = t(i18nKey('是'));
  const controlRows: XCell[][] = res.controls.map((c) => [
    c.id, c.process, c.risk, c.assertion, c.description, t(TYPE_LABEL[c.type]), t(NATURE_LABEL[c.nature]), t(FREQ_LABEL[c.frequency]), c.owner,
    c.key ? yes : '', c.source === 'draft' ? t(c.verified ? OUT.verified : OUT.unverified) : '', c.quote || '', c.docName || '',
  ]);
  const controlHead = [t(i18nKey('控制编号')), t(i18nKey('流程')), t(i18nKey('风险')), t(i18nKey('认定')), t(i18nKey('控制描述')), t(i18nKey('控制类型')), t(i18nKey('执行方式')), t(i18nKey('频率')), t(i18nKey('负责人')), t(i18nKey('关键控制')), t(i18nKey('回核')), t(i18nKey('原文依据')), t(i18nKey('来源文件'))];

  if (res.mode === 'design') {
    const [nCover, nRcm, nApp, nChecks] = planSheetNames([t(i18nKey('封面与签核页')), t(i18nKey('风险控制矩阵')), t(i18nKey('审批矩阵')), 'Checks']);
    const title = t(i18nKey('风险控制矩阵'));
    const path = join(ctx.dir, outputFileName(ctx.moduleCode, title, ctx.period, 'xlsx', ctx.at));
    writeWorkbookFile(path, [
      { name: nCover, banner, rows: [...coverRows(ctx, t, title, levels), [], [t(i18nKey('本文件是起草的内控设计草稿，控制是否有效须经测试，不构成内控鉴证'))]] },
      { name: nRcm, banner, headers: controlHead, rows: controlRows },
      { name: nApp, banner, headers: [t(i18nKey('事项')), t(i18nKey('权限条件')), t(i18nKey('审批人')), t(i18nKey('原文依据')), t(i18nKey('来源文件'))], rows: res.approvalMatrix.map((a) => [a.matter, a.threshold, a.approver, a.quote, a.docName]) },
      { name: nChecks, banner, headers: [t(OUT.check), t(OUT.result)], rows: [
        [t(i18nKey('审批矩阵每条都能在原文定位')), res.approvalMatrix.every((a) => a.verified)],
        [t(i18nKey('每个控制都有原文依据')), res.controls.every((c) => c.verified)],
      ] },
    ], { rtl });
    out.push({ kind: 'xlsx', path, title: i18nKey('风险控制矩阵') });
    return out;
  }

  const gradeRows: XCell[][] = FAU_DEFICIENCY_GRADES.map((g) => [t(GRADE_LABEL[g]), res.counts[g] || 0]);
  const defRows: XCell[][] = res.deficiencies.map((d) => [d.id, d.controlId, d.description, major(d.amount), t(IMPACT_LABEL[d.amountTier]), t(IMPACT_LABEL[d.opImpact]), t(COMP_LABEL[d.compensating]), t(GRADE_LABEL[d.grade]), d.owner, d.dueDate, d.remediation]);
  const defHead = [t(i18nKey('缺陷编号')), t(i18nKey('控制编号')), t(i18nKey('缺陷描述')), t(i18nKey('涉及金额')), t(i18nKey('财务影响')), t(i18nKey('运营影响')), t(i18nKey('补偿性控制')), t(i18nKey('缺陷等级')), t(i18nKey('整改负责人')), t(i18nKey('整改期限')), t(i18nKey('整改措施'))];

  if (res.mode === 'testing') {
    const [nCover, nCtl, nPlan, nSamples, nTests, nDef, nChecks] = planSheetNames([
      t(i18nKey('封面与签核页')), t(i18nKey('控制清单')), t(i18nKey('抽样计划')), t(i18nKey('样本明细')), t(i18nKey('测试结论')), t(i18nKey('缺陷评估')), 'Checks',
    ]);
    const R0 = 2;
    const planRows: XCell[][] = res.plans.map((p, i) => {
      const r = R0 + i;
      return [p.controlId, t(FREQ_LABEL[p.frequency]), p.population, p.expectedRate, p.tolerableRate, p.confidence, p.attributeN, p.allowedDeviations, p.frequencyMin,
        { f: `MIN(${addr(r, 2)},MAX(${addr(r, 6)},${addr(r, 8)}))`, v: p.n }, p.testAll ? yes : '', p.seed];
    });
    const testRows: XCell[][] = res.tests.map((x, i) => {
      const r = R0 + i;
      return [x.controlId, x.sampled, x.tested, x.deviations, { f: `IF(${addr(r, 2)}=0,"",ROUND(${addr(r, 3)}/${addr(r, 2)},4))`, v: x.rate ?? '' }, x.tolerableRate, t(CONCLUSION_LABEL[x.conclusion])];
    });
    const title = t(i18nKey('控制测试底稿'));
    const path = join(ctx.dir, outputFileName(ctx.moduleCode, title, ctx.period, 'xlsx', ctx.at));
    writeWorkbookFile(path, [
      { name: nCover, banner, rows: [...coverRows(ctx, t, title, levels), [], [t(i18nKey('缺陷等级'))], ...gradeRows] },
      { name: nCtl, banner, headers: controlHead, rows: controlRows },
      { name: nPlan, banner, headers: [t(i18nKey('控制编号')), t(i18nKey('频率')), t(i18nKey('总体数量')), t(i18nKey('预期偏差率')), t(i18nKey('可容忍偏差率')), t(i18nKey('置信水平')), t(i18nKey('属性抽样样本量')), t(i18nKey('允许偏差数')), t(i18nKey('频率最小样本量')), t(i18nKey('样本量')), t(i18nKey('全量测试')), t(i18nKey('随机种子'))], rows: planRows },
      { name: nSamples, banner, headers: [t(i18nKey('控制编号')), t(i18nKey('序号')), t(OUT.row), t(i18nKey('单号')), t(i18nKey('日期')), t(i18nKey('金额')), t(i18nKey('测试结论')), t(i18nKey('说明'))], rows: res.samples.map((s) => [s.controlId, s.seq, s.row, s.ref, s.date, major(s.amount), t(RESULT_LABEL[s.result]), s.note || '']) },
      { name: nTests, banner, headers: [t(i18nKey('控制编号')), t(i18nKey('样本数')), t(i18nKey('已测试')), t(i18nKey('偏差数')), t(i18nKey('偏差率')), t(i18nKey('可容忍偏差率')), t(i18nKey('结论'))], rows: testRows },
      { name: nDef, banner, headers: defHead, rows: defRows },
      { name: nChecks, banner, headers: [t(OUT.check), t(OUT.result)], rows: [
        ...res.plans.map((p, i) => [`${p.controlId} · ${t(i18nKey('样本量 = min(总体, max(属性抽样, 频率下限))'))}`, { f: `${addr(R0 + i, 9)}=MIN(${addr(R0 + i, 2)},MAX(${addr(R0 + i, 6)},${addr(R0 + i, 8)}))`, v: true }] as XCell[]),
        [t(i18nKey('全部样本已记录测试结论')), res.samples.every((s) => s.result !== 'pending')],
      ] },
    ], { rtl });
    out.push({ kind: 'xlsx', path, title: i18nKey('控制测试底稿') });
  } else {
    const [nCover, nDef] = planSheetNames([t(i18nKey('封面与签核页')), t(i18nKey('缺陷评估'))]);
    const title = t(i18nKey('缺陷评估表'));
    const path = join(ctx.dir, outputFileName(ctx.moduleCode, title, ctx.period, 'xlsx', ctx.at));
    writeWorkbookFile(path, [
      { name: nCover, banner, rows: [...coverRows(ctx, t, title, levels), [], [t(i18nKey('缺陷等级'))], ...gradeRows] },
      { name: nDef, banner, headers: defHead, rows: defRows },
    ], { rtl });
    out.push({ kind: 'xlsx', path, title: i18nKey('缺陷评估表') });
  }

  if (res.deficiencies.length) {
    const title = t(i18nKey('缺陷评估与整改计划'));
    const path = join(ctx.dir, outputFileName(ctx.moduleCode, title, ctx.period, 'docx', ctx.at));
    const sev = (g: FauDeficiencyGrade) => res.deficiencies.filter((d) => d.grade === g);
    writeDocxFile(path, {
      title, subtitle: `${ctx.companyName} · ${ctx.period}`, meta: [[t(OUT.project), ctx.projectName]],
      header: t(OUT.notOpinion), watermark: t(OUT.draft), rtl,
      sections: [
        { heading: t(i18nKey('缺陷等级汇总')), paragraphs: FAU_DEFICIENCY_GRADES.map((g) => `${t(GRADE_LABEL[g])}: ${res.counts[g] || 0}`) },
        {
          heading: t(i18nKey('缺陷明细与整改计划')),
          table: { headers: [t(i18nKey('缺陷编号')), t(i18nKey('控制编号')), t(i18nKey('缺陷描述')), t(i18nKey('涉及金额')), t(i18nKey('缺陷等级')), t(i18nKey('整改负责人')), t(i18nKey('整改期限')), t(i18nKey('整改措施'))],
            rows: res.deficiencies.map((d) => [d.id, d.controlId, d.description, fmtAmount(d.amount, ctx.locale), t(GRADE_LABEL[d.grade]), d.owner, d.dueDate, d.remediation]) },
        },
        { heading: t(i18nKey('升级事项')), paragraphs: [...sev('material_weakness'), ...sev('significant')].map((d) => `• ${d.id} ${t(GRADE_LABEL[d.grade])}`).concat(sev('material_weakness').length + sev('significant').length ? [] : [t(i18nKey('无'))]) },
        { heading: t(i18nKey('发现与建议')), paragraphs: [t(i18nKey('本文件按测试结果与分级矩阵起草，等级与整改计划须经复核与批准；不构成内控有效性鉴证。'))] },
      ],
    });
    out.push({ kind: 'docx', path, title: i18nKey('缺陷评估与整改计划') });
  }
  return out;
}
