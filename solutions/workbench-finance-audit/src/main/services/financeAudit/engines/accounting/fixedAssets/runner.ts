/**
 * A6 固定资产 runner：③ 校验 → ④ 折旧重算 / 资产滚动表 / 购置与处置审核（规则计算） → ⑤ 折旧核对表 xlsx + 审核意见 docx + 处置分录导入草稿。
 */
import { i18nKey } from '@totalclaw/i18n';
import type { FauFaResult, FauReminder, FauSubProgress, FauValidationReport } from '@totalclaw/ipc-contracts';
import type { AnalyzeResult, ModuleRunner, RunCtx } from '../../../runner';
import { writeFixedAssetOutputs } from '../../../outputs/fixedAssets';
import { msg } from '../common';
import { periodOf } from '../closeRunner';
import { IssueList, artifactOf, duplicateRows, outputCtxOf } from '../subledgerCommon';
import { fixedAssetsReview } from './engine';

const SUB_LABEL: Record<string, string> = { depreciation: i18nKey('折旧重算与账面差异'), roll: i18nKey('资产滚动表'), review: i18nKey('购置与处置审核') };
const SUBS: Record<string, string[]> = { standard: ['depreciation', 'roll', 'review'], depreciation: ['depreciation', 'roll'] };

export const fixedAssetsRunner: ModuleRunner = {
  subSteps: (modeId) => (SUBS[modeId] || SUBS.standard).map((id): FauSubProgress => ({ id, label: { key: SUB_LABEL[id] }, status: 'todo' })),

  async validate(ctx: RunCtx): Promise<FauValidationReport> {
    const reg = ctx.rows<'fa_register'>('register');
    const v = new IssueList();
    if (!reg.length) v.add('block', 'fa_empty', i18nKey('资产台账没有数据行'));
    const dup = duplicateRows(reg, (a) => a.assetNo);
    if (dup.length) v.add('block', 'fa_duplicate', i18nKey('{n} 行资产编号重复'), { n: dup.length }, dup);
    const noLife = reg.filter((a) => !a.lifeMonths && !/工作量|units|وحدات/i.test(a.method));
    if (noLife.length) v.add('warn', 'fa_no_life', i18nKey('{n} 项资产没有使用年限，无法重算折旧'), { n: noLife.length }, noLife.map((a) => a.row));
    const noBooked = reg.filter((a) => a.bookedPeriod == null && a.bookedAccum == null);
    if (noBooked.length) v.add('warn', 'fa_no_booked', i18nKey('{n} 项资产没有账面本期折旧或累计折旧，只重算不比对'), { n: noBooked.length }, noBooked.map((a) => a.row));
    const neg = reg.filter((a) => a.cost <= 0);
    if (neg.length) v.add('warn', 'fa_cost', i18nKey('{n} 项资产原值不大于 0'), { n: neg.length }, neg.map((a) => a.row));
    v.check('fa_rows', reg.length > 0, 'block', msg(i18nKey('资产台账有数据')));
    v.check('fa_unique', !dup.length, 'block', msg(i18nKey('资产编号不重复')));
    v.check('fa_life', !noLife.length, 'warn', msg(i18nKey('每项资产都有使用年限')));
    return v.report(ctx, ['register', 'movements', 'faTb']);
  },

  async analyze(ctx: RunCtx): Promise<AnalyzeResult> {
    const steps = SUBS[ctx.run.modeId] || SUBS.standard;
    for (const id of steps) ctx.progress(id, 'running');
    const res = fixedAssetsReview({
      period: periodOf(ctx), register: ctx.rows<'fa_register'>('register'),
      movements: steps.includes('review') ? ctx.rows<'fa_movement'>('movements') : [],
      tb: ctx.run.inputs.faTb?.length ? ctx.rows<'tb'>('faTb') : null, cnCodes: ctx.profile.reportBasis === 'cn', th: ctx.th('fixed-assets'),
    });
    if (!steps.includes('review')) { res.disposals = []; res.additions = []; res.je = []; }
    for (const id of steps) ctx.progress(id, 'done');
    const reminders: FauReminder[] = res.escalations.map((e, i) => ({ id: `esc:fa:${i}`, source: 'escalation', level: 'warn', message: e }));
    const diffs = res.lines.filter((l) => l.flags.some((f) => f.code === 'asset.dep_diff' || f.code === 'asset.accum_diff')).length;
    if (diffs) reminders.push({ id: 'fa:diffs', source: 'engine', level: 'warn', message: { key: i18nKey('{n} 项资产折旧与账面差异超过容差，调整分录须另行审批'), params: { n: diffs } } });
    return {
      result: res, reminders, approveRequired: res.escalations.length > 0,
      summary: { key: i18nKey('{n} 项资产，折旧差异 {d} 项，处置 {m} 项'), params: { n: res.lines.length, d: diffs, m: res.disposals.length } },
    };
  },

  async draft(ctx: RunCtx) {
    const out = writeFixedAssetOutputs(outputCtxOf(ctx), ctx.run.result as FauFaResult, { levels: ctx.run.requiredLevels });
    const artifacts = [artifactOf(ctx, 'xlsx', out.xlsxPath, i18nKey('折旧核对表与资产滚动表')), artifactOf(ctx, 'docx', out.docxPath, i18nKey('购置与处置审核意见'))];
    if (out.jePath) artifacts.push(artifactOf(ctx, 'je_import_xlsx', out.jePath, i18nKey('凭证导入草稿')));
    return { artifacts, summary: { key: i18nKey('已生成 {n} 个文件（草稿—待签核）'), params: { n: artifacts.length } } };
  },
};
