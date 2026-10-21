/**
 * A8 合并与内部往来 runner：③ 校验 → ④ 双边匹配 / 抵销分录草稿 / 担保检查 / 内部定价偏离（规则计算）
 *   → ⑤ 内部往来对账表 xlsx（含抵销分录草稿与担保检查）+ 抵销分录导入草稿。定价偏离清单可在签核后转交 C3。
 */
import { i18nKey } from '@totalclaw/i18n';
import type { FauIcResult, FauReminder, FauSubProgress, FauValidationReport } from '@totalclaw/ipc-contracts';
import type { AnalyzeResult, ModuleRunner, RunCtx } from '../../../runner';
import { writeIntercompanyOutputs } from '../../../outputs/intercompany';
import { msg } from '../common';
import { periodOf } from '../closeRunner';
import { IssueList, artifactOf, outputCtxOf } from '../subledgerCommon';
import { intercompanyReview } from './engine';

const SUB_LABEL: Record<string, string> = { match: i18nKey('双边匹配'), eliminate: i18nKey('抵销分录草稿'), guarantee: i18nKey('担保检查'), pricing: i18nKey('内部定价偏离') };
const SUBS: Record<string, string[]> = { standard: ['match', 'eliminate', 'guarantee', 'pricing'], recon: ['match', 'eliminate', 'pricing'], guarantee: ['guarantee'] };

export const intercompanyRunner: ModuleRunner = {
  subSteps: (modeId) => (SUBS[modeId] || SUBS.standard).map((id): FauSubProgress => ({ id, label: { key: SUB_LABEL[id] }, status: 'todo' })),

  async validate(ctx: RunCtx): Promise<FauValidationReport> {
    const steps = SUBS[ctx.run.modeId] || SUBS.standard;
    const v = new IssueList();
    if (steps.includes('match')) {
      const rows = ctx.rows<'intercompany'>('ic');
      if (!rows.length) v.add('block', 'ic_empty', i18nKey('内部往来明细没有数据行'));
      const self = rows.filter((r) => r.entity === r.counterparty);
      if (self.length) v.add('block', 'ic_self', i18nKey('{n} 行本方公司与对方公司相同'), { n: self.length }, self.map((r) => r.row));
      const entities = new Set(rows.map((r) => r.entity));
      const oneSided = [...new Set(rows.map((r) => r.counterparty))].filter((c) => !entities.has(c));
      if (oneSided.length) v.add('warn', 'ic_one_sided', i18nKey('这些对方公司没有提供自己的往来明细，只能单边列示：{p0}'), { p0: oneSided.join(', ') });
      const noType = rows.filter((r) => !r.type);
      if (noType.length) v.add('warn', 'ic_no_type', i18nKey('{n} 行没有往来类型，按金额正负归入其他往来'), { n: noType.length }, noType.map((r) => r.row));
      v.check('ic_rows', rows.length > 0, 'block', msg(i18nKey('内部往来明细有数据')));
      v.check('ic_two_sided', !oneSided.length, 'warn', msg(i18nKey('每家关联方都提供了自己的明细')));
    }
    if (steps.includes('guarantee')) {
      const g = ctx.rows<'guarantee'>('guarantees');
      if (ctx.run.modeId === 'guarantee' && !g.length) v.add('block', 'gua_empty', i18nKey('担保台账没有数据行'));
      if (g.length && g.every((x) => x.netAssets == null)) v.add('warn', 'gua_no_net', i18nKey('担保台账没有担保方净资产，不能判断担保比例是否超限'));
    }
    return v.report(ctx, ['ic', 'guarantees']);
  },

  async analyze(ctx: RunCtx): Promise<AnalyzeResult> {
    const steps = SUBS[ctx.run.modeId] || SUBS.standard;
    for (const id of steps) ctx.progress(id, 'running');
    const res = intercompanyReview({
      period: periodOf(ctx), rows: steps.includes('match') ? ctx.rows<'intercompany'>('ic') : [],
      guarantees: steps.includes('guarantee') && ctx.run.inputs.guarantees?.length ? ctx.rows<'guarantee'>('guarantees') : null,
      cnCodes: ctx.profile.reportBasis === 'cn', th: ctx.th('intercompany'),
    });
    if (!steps.includes('pricing')) res.pricing = null;
    for (const id of steps) ctx.progress(id, 'done');
    const reminders: FauReminder[] = res.escalations.map((e, i) => ({ id: `esc:ic:${i}`, source: 'escalation', level: 'warn', message: e }));
    if (res.je.length) reminders.push({ id: 'ic:unrealized', source: 'engine', level: 'warn', message: { key: i18nKey('抵销分录不含存货中的未实现内部利润，需按毛利率与期末结存另行计算') } });
    return {
      result: res, reminders, approveRequired: res.escalations.length > 0,
      summary: { key: i18nKey('{n} 组配对，差异 {m} 条，抵销分录 {e} 行'), params: { n: res.pairs.length, m: res.breaks.length, e: res.je.length } },
    };
  },

  async draft(ctx: RunCtx) {
    const out = writeIntercompanyOutputs(outputCtxOf(ctx), ctx.run.result as FauIcResult, { levels: ctx.run.requiredLevels });
    const artifacts = [artifactOf(ctx, 'xlsx', out.xlsxPath, i18nKey('内部往来对账表与抵销分录草稿'))];
    if (out.jePath) artifacts.push(artifactOf(ctx, 'je_import_xlsx', out.jePath, i18nKey('凭证导入草稿')));
    return { artifacts, summary: { key: i18nKey('已生成 {n} 个文件（草稿—待签核）'), params: { n: artifacts.length } } };
  },
};
