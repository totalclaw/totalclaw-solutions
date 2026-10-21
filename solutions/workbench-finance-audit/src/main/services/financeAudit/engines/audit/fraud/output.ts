/**
 * B5 产出：异常清单 xlsx（规则覆盖 / 异常明细带证据行号 / 本福特 / Checks）、调查计划 docx、调查报告草稿 docx。
 * 报告草稿的「调查结论」由调查组在系统外填写，本文件不下舞弊是否成立的结论。
 */
import { join } from 'node:path';
import { i18nKey } from '@totalclaw/i18n';
import type { FauFraudResult } from '@totalclaw/ipc-contracts';
import { OUT, fmtAmount, labeler, outputFileName } from '../../../outputs/common';
import { major, planSheetNames, writeWorkbookFile } from '../../../outputs/xlsx';
import { writeDocxFile } from '../../../outputs/docx';
import { coverRows, type OutputCtx } from '../../../outputs/close';
import { BENFORD_LABEL, FRAUD_RULE_LABEL } from '../../../../../../shared/financeAudit/auditLabels';

const LEVEL = { high: i18nKey('高'), warn: i18nKey('中'), info: i18nKey('低') };
const SOURCE = { journal: i18nKey('序时账'), payments: i18nKey('付款登记'), master: i18nKey('主数据'), tb: i18nKey('科目余额表') };

export function writeFraudOutputs(ctx: OutputCtx, res: FauFraudResult, levels: string[]): Array<{ kind: 'xlsx' | 'docx'; path: string; title: string }> {
  const t = labeler(ctx.locale);
  const rtl = ctx.locale === 'ar';
  const banner = t(OUT.draft);
  const rule = (r: string) => t(FRAUD_RULE_LABEL[r] || r);
  const [nCover, nCov, nHits, nBen, nChecks] = planSheetNames([t(i18nKey('封面与签核页')), t(i18nKey('规则覆盖')), t(i18nKey('异常明细')), t(i18nKey('本福特检验')), 'Checks']);
  const title = t(i18nKey('舞弊排查异常清单'));
  const path = join(ctx.dir, outputFileName(ctx.moduleCode, title, ctx.period, 'xlsx', ctx.at));
  const b = res.benford;
  writeWorkbookFile(path, [
    { name: nCover, banner, rows: [...coverRows(ctx, t, title, levels), [], [t(i18nKey('异常条数')), res.hits.length], [t(i18nKey('本福特检验')), t(BENFORD_LABEL[b.conformity])]] },
    { name: nCov, banner, headers: [t(i18nKey('规则')), t(i18nKey('状态')), t(i18nKey('命中'))], rows: res.coverage.map((c) => [rule(c.rule), c.status === 'ran' ? t(i18nKey('已执行')) : t(i18nKey('不适用（缺发票 / 回单 / 申报数据）')), c.hits]) },
    { name: nHits, banner, headers: [t(i18nKey('规则')), t(i18nKey('风险')), t(OUT.source), t(i18nKey('单号 / 对象')), t(i18nKey('金额')), t(OUT.row), t(i18nKey('说明'))],
      rows: res.hits.map((h) => [rule(h.rule), t(LEVEL[h.level]), t(SOURCE[h.source]), h.refs.join(', '), major(h.amount), h.rows.join(','), h.detail]) },
    { name: nBen, banner, headers: [t(i18nKey('首位数字')), t(i18nKey('实际占比')), t(i18nKey('期望占比')), t(i18nKey('显著偏高'))],
      rows: [...b.expected.map((e, i) => [i + 1, b.observed[i], e, b.spikes.includes(i + 1) ? t(i18nKey('是')) : '']), [], ['n', b.n], ['MAD', b.mad], ['χ²', b.chi2], [t(i18nKey('结论')), t(BENFORD_LABEL[b.conformity])]] },
    { name: nChecks, banner, headers: [t(OUT.check), t(OUT.result)], rows: [
      [t(i18nKey('每条异常都带证据行或单号')), res.hits.every((h) => h.rule === 'benford' || h.rows.length > 0 || h.refs.length > 0)],
      [t(i18nKey('调查计划引用的单号都在异常清单里')), res.plan.every((s) => s.verified)],
    ] },
  ], { rtl });
  const out: Array<{ kind: 'xlsx' | 'docx'; path: string; title: string }> = [{ kind: 'xlsx', path, title: i18nKey('舞弊排查异常清单') }];

  const planTitle = t(i18nKey('舞弊调查计划'));
  const planPath = join(ctx.dir, outputFileName(ctx.moduleCode, planTitle, ctx.period, 'docx', ctx.at));
  writeDocxFile(planPath, {
    title: planTitle, subtitle: `${ctx.companyName} · ${ctx.period}`, header: t(OUT.notOpinion), watermark: t(OUT.draft), rtl,
    sections: [
      { heading: t(i18nKey('摘要')), paragraphs: [res.summary || t(i18nKey('无')), res.summaryStatus === 'unverified' ? t(i18nKey('（摘要里有数字不在数据里，标为未核实）')) : ''].filter(Boolean) },
      { heading: t(i18nKey('调查步骤')), table: { headers: [t(i18nKey('编号')), t(i18nKey('目标')), t(i18nKey('程序')), t(i18nKey('证据')), t(i18nKey('负责人')), t(i18nKey('单号')), t(i18nKey('回核'))],
        rows: res.plan.map((s) => [s.id, s.objective, s.procedure, s.evidence, s.owner, s.refs.join(', '), t(s.verified ? OUT.verified : OUT.unverified)]) } },
      { heading: t(i18nKey('立项与保密')), paragraphs: [t(i18nKey('调查立项须经批准人签核；知情范围最小化，证据保全后再访谈。'))] },
    ],
  });
  out.push({ kind: 'docx', path: planPath, title: i18nKey('舞弊调查计划') });

  const repTitle = t(i18nKey('舞弊调查报告草稿'));
  const repPath = join(ctx.dir, outputFileName(ctx.moduleCode, repTitle, ctx.period, 'docx', ctx.at));
  const byRule = [...new Set(res.hits.map((h) => h.rule))];
  writeDocxFile(repPath, {
    title: repTitle, subtitle: `${ctx.companyName} · ${ctx.period}`, header: t(OUT.notOpinion), watermark: t(OUT.draft), rtl,
    sections: [
      { heading: t(i18nKey('数据分析发现')), paragraphs: byRule.length ? byRule.map((r) => { const hs = res.hits.filter((h) => h.rule === r); return `${rule(r)}: ${hs.length} · ${fmtAmount(hs.reduce((s, h) => s + h.amount, 0), ctx.locale)}`; }) : [t(i18nKey('无'))] },
      { heading: t(i18nKey('调查过程')), paragraphs: [t(i18nKey('（由调查组填写：审查文档、访谈、数据分析的范围与过程）'))] },
      { heading: t(i18nKey('调查结论')), paragraphs: [t(i18nKey('（由调查组在取得证据后填写；本草稿不判断舞弊是否成立）'))] },
      { heading: t(i18nKey('发现与建议')), paragraphs: [t(i18nKey('异常只代表需要核实，不等于舞弊；处理意见由批准人决定。'))] },
    ],
  });
  out.push({ kind: 'docx', path: repPath, title: i18nKey('舞弊调查报告草稿') });
  return out;
}
