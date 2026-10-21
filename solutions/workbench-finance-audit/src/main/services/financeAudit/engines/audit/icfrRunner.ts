/**
 * B1 内控与 SOX 测试 runner（第 5.6 节）：
 *   起草（路径一）：流程文档 → 模型按 sox-control-design / approval-matrix 起草 RCM 与审批矩阵（不给工具），
 *     每条回原文定位：控制定位不到标「未核实」，审批规则定位不到直接丢弃（事实类）；
 *   控制测试（路径二 / 三）：控制清单 + 样本总体 → 属性抽样样本量（含频率下限）→ 固定种子抽样 →
 *     测试结论由人在第 ④ 步逐个样本记录（icfr.sample.update）→ 偏差率与结论 → 控制无效自动生成缺陷并分级；
 *   缺陷评估：缺陷清单 → 金额 × 运营影响 × 补偿性控制矩阵分级。
 * 重大缺陷标「批准人确认」，重大 / 重要缺陷进升级事项；不出具内控有效性意见。
 */
import { i18nKey } from '@totalclaw/i18n';
import type { FauControl, FauDatasetMeta, FauIcfrResult, FauReminder, FauValidationReport, FauVerificationItem } from '@totalclaw/ipc-contracts';
import type { AnalyzeResult, ModuleRunner, RunCtx } from '../../runner';
import { runSkill } from '../../skillRunner';
import { RCM_TASK, rcmSchema } from '../../prompts/icfr';
import { withDatasetIssues } from '../accounting/closeRunner';
import { artifact, blockIssue, outputCtx, reminder, step, subSteps, warnIssue } from './common';
import { loadDocs, locate, untrusted } from './docs';
import { missingColumnsIssue, readDatasetTable } from './table';
import { countGrades, deficienciesFromTests, evaluateTest, parseControls, parseDeficiencies, parsePopulation, planAndSample, type DeficiencyEdit, type SampleResults } from './icfr/testing';
import { isEscalated } from './icfr/deficiency';
import { writeIcfrOutputs } from './icfr/output';

const SUB: Record<string, string> = {
  read: i18nKey('读取流程文档'), draft: i18nKey('模型起草 RCM 与审批矩阵'), verify: i18nKey('回原文核对'),
  parse: i18nKey('读取控制与总体'), sampling: i18nKey('样本量与固定种子抽样'), evaluate: i18nKey('测试结论'), deficiency: i18nKey('缺陷分级'),
};

/** 控制测试与缺陷评估的计算来源：第 ④ 步用 RunCtx，「记录测试结论」等 action 用存储里的运行 */
export interface IcfrSource {
  runId: string;
  params: Record<string, unknown>;
  datasets: (slot: string) => FauDatasetMeta[];
  th: Record<string, number>;
}

export function sourceOf(ctx: RunCtx): IcfrSource {
  return { runId: ctx.run.id, params: ctx.run.params, datasets: (slot) => ctx.datasets(slot), th: ctx.th('icfr') };
}

const edits = (src: IcfrSource): Record<string, DeficiencyEdit> => (src.params.deficiencyEdits || {}) as Record<string, DeficiencyEdit>;
const results = (src: IcfrSource): SampleResults => (src.params.sampleResults || {}) as SampleResults;

function oneTable(src: Pick<IcfrSource, 'datasets'>, slot: string, table: Parameters<typeof readDatasetTable>[1]) {
  const meta = src.datasets(slot)[0];
  return meta ? readDatasetTable(meta, table) : null;
}

/** 控制测试的计算部分（第 ④ 步与「记录测试结论」后重算共用） */
export function computeTesting(src: IcfrSource): FauIcfrResult {
  const ct = oneTable(src, 'controls', 'controls');
  const pt = oneTable(src, 'population', 'population');
  const { controls, rates } = ct ? parseControls(ct) : { controls: [], rates: new Map() };
  const population = pt ? parsePopulation(pt) : [];
  const seedParam = src.params.seed;
  const { plans, samples } = planAndSample({
    controls, rates, population, byControl: !!pt?.mapping.controlId, seedBase: src.runId,
    seed: typeof seedParam === 'number' ? seedParam : null, results: results(src), th: src.th,
  });
  const tests = plans.map((p) => evaluateTest(p, samples));
  const deficiencies = deficienciesFromTests(tests, controls, samples, edits(src), src.th);
  return { mode: 'testing', controls, approvalMatrix: [], plans, samples, tests, deficiencies, counts: countGrades(deficiencies) };
}

export function computeDeficiency(src: IcfrSource): FauIcfrResult {
  const dt = oneTable(src, 'deficiencies', 'deficiencies');
  const { list } = dt ? parseDeficiencies(dt, edits(src), src.th) : { list: [] };
  return { mode: 'deficiency', controls: [], approvalMatrix: [], plans: [], samples: [], tests: [], deficiencies: list, counts: countGrades(list) };
}

/** 升级 / 提醒：未测完的样本、重大与重要缺陷（重大缺陷只能批准人勾） */
export function icfrReminders(res: FauIcfrResult): { reminders: FauReminder[]; approveRequired: boolean } {
  const reminders: FauReminder[] = [];
  const pending = res.samples.filter((s) => s.result === 'pending').length;
  if (pending) reminders.push(reminder('icfr:pending', 'engine', i18nKey('还有 {n} 个样本未记录测试结论'), { n: pending }));
  for (const d of res.deficiencies.filter((x) => isEscalated(x.grade))) {
    const key = d.grade === 'material_weakness' ? i18nKey('{p0}：重大缺陷，须批准人确认并向审计委员会报告') : i18nKey('{p0}：重要缺陷，须向审计委员会报告');
    reminders.push(reminder(`icfr:def:${d.id}`, 'escalation', key, { p0: d.id }, d.grade === 'material_weakness'));
  }
  return { reminders, approveRequired: res.deficiencies.some((d) => isEscalated(d.grade)) };
}

export const icfrRunner: ModuleRunner = {
  subSteps(modeId) {
    const ids = modeId === 'design' ? ['read', 'draft', 'verify'] : modeId === 'testing' ? ['parse', 'sampling', 'evaluate', 'deficiency'] : ['parse', 'deficiency'];
    return subSteps(ids, SUB);
  },

  async validate(ctx) {
    const r: FauValidationReport = { checks: [], blockers: [], warnings: [] };
    const mode = ctx.run.modeId;
    if (mode === 'design') {
      const docs = await loadDocs(ctx.datasets('processDocs'));
      for (const d of docs.filter((x) => x.doc.warning)) r.warnings.push(warnIssue(`doc:${d.name}`, i18nKey('{p0}：{p1}'), { p0: d.name, p1: d.doc.warning || '' }));
      if (!docs.some((d) => d.doc.text.trim())) r.blockers.push(blockIssue('docs_empty', i18nKey('流程文档里没有可读的文字（扫描件未识别出文字），请换成文字版 PDF 或 Word')));
      return r;
    }
    if (mode === 'testing') {
      const ct = oneTable(ctx, 'controls', 'controls');
      const pt = oneTable(ctx, 'population', 'population');
      for (const [p, label] of [[ct, i18nKey('控制清单')], [pt, i18nKey('样本总体')]] as const) {
        const iss = p && missingColumnsIssue(p, label);
        if (iss) r.blockers.push(iss);
      }
      if (r.blockers.length || !ct || !pt) return r;
      const { controls, badFrequency } = parseControls(ct);
      if (badFrequency.length) r.warnings.push(warnIssue('bad_frequency', i18nKey('{n} 行控制频率认不出（应为年 / 季 / 月 / 周 / 日 / 多次），已跳过'), { n: badFrequency.length }, badFrequency));
      const keys = controls.filter((c) => c.key);
      r.checks.push({ id: 'key_controls', ok: keys.length > 0, level: 'block', message: { key: i18nKey('关键控制 {n} 个'), params: { n: keys.length } } });
      if (!keys.length) r.blockers.push(blockIssue('no_key_controls', i18nKey('控制清单里没有关键控制，无法安排测试')));
      const population = parsePopulation(pt);
      if (!population.length) r.blockers.push(blockIssue('population_empty', i18nKey('样本总体是空的')));
      if (pt.mapping.controlId) {
        const missing = keys.filter((c) => !population.some((x) => x.controlId === c.id)).map((c) => c.id);
        if (missing.length) r.warnings.push(warnIssue('control_no_population', i18nKey('这些关键控制在样本总体里没有记录：{p0}'), { p0: missing.join(', ') }));
      }
      const dup = population.filter((x, i) => population.findIndex((y) => y.ref === x.ref && y.controlId === x.controlId) !== i);
      if (dup.length) r.warnings.push(warnIssue('population_dup', i18nKey('样本总体有 {n} 行单号重复'), { n: dup.length }, dup.map((x) => x.row)));
      return r;
    }
    const dt = oneTable(ctx, 'deficiencies', 'deficiencies');
    const iss = dt && missingColumnsIssue(dt, i18nKey('缺陷清单'));
    if (iss) r.blockers.push(iss);
    if (dt && !iss) {
      const { list, badLevel } = parseDeficiencies(dt, {}, ctx.th('icfr'));
      if (!list.length) r.blockers.push(blockIssue('deficiencies_empty', i18nKey('缺陷清单是空的')));
      if (badLevel.length) r.warnings.push(warnIssue('bad_level', i18nKey('{n} 行运营影响认不出（应为高 / 中 / 低），按「中」处理'), { n: badLevel.length }, badLevel));
    }
    return withDatasetIssues(r, ctx, []);
  },

  async analyze(ctx): Promise<AnalyzeResult> {
    const mode = ctx.run.modeId;
    if (mode === 'design') {
      const docs = await step(ctx, 'read', () => loadDocs(ctx.datasets('processDocs')));
      const out = await step(ctx, 'draft', () => runSkill(ctx.llm, {
        module: 'icfr', skills: [{ name: 'fa-sox-control-design' }, { name: 'fa-approval-matrix' }], task: RCM_TASK,
        data: { company: ctx.company.name, region: ctx.profile.region, standard: ctx.profile.standard }, untrusted: untrusted(docs),
        outputLocale: ctx.locale, schema: rcmSchema,
        narratives: (o) => o.controls.flatMap((c) => [c.risk, c.description]).filter(Boolean),
      }));
      ctx.progress('verify', 'running');
      const controls: FauControl[] = out.data.controls.map((c) => {
        const loc = locate(docs, c.quote, c.docName);
        return { ...c, id: c.id.replace(/\s+/g, '').toUpperCase(), source: 'draft', verified: loc.verified, docName: loc.docName || c.docName };
      });
      // 审批规则是事实：原文里找不到、或权限条件里的数字不在原文里 → 丢弃
      const approvalMatrix = out.data.approvalMatrix
        .map((a) => ({ ...a, ...locate(docs, a.quote, a.docName) }))
        .filter((a) => a.verified && (!/\d/.test(a.threshold) || (a.threshold.match(/\d[\d,.]*/g) || []).every((n) => a.quote.includes(n))));
      const verification: FauVerificationItem[] = controls.map((c) => ({ id: `rcm:${c.id}`, ref: `rcm:${c.id}`, text: `${c.id} ${c.description}`, status: c.verified ? 'verified' : 'unverified' }));
      ctx.progress('verify', 'done');
      const dropped = out.data.approvalMatrix.length - approvalMatrix.length;
      const reminders: FauReminder[] = dropped ? [reminder('icfr:approval_dropped', 'engine', i18nKey('{n} 条审批规则在原文里找不到依据，已丢弃'), { n: dropped })] : [];
      const result: FauIcfrResult = { mode: 'design', controls, approvalMatrix, plans: [], samples: [], tests: [], deficiencies: [], counts: countGrades([]) };
      return { result, verification, reminders, model: out.model, summary: { key: i18nKey('起草控制 {n} 个、审批规则 {m} 条（草稿，须复核）'), params: { n: controls.length, m: approvalMatrix.length } } };
    }
    if (mode === 'testing') {
      ctx.progress('parse', 'done');
      const res = await step(ctx, 'sampling', () => computeTesting(sourceOf(ctx)));
      ctx.progress('evaluate', 'done');
      ctx.progress('deficiency', 'done');
      const { reminders, approveRequired } = icfrReminders(res);
      return {
        result: res, reminders, approveRequired,
        summary: { key: i18nKey('关键控制 {n} 个，样本 {m} 个，缺陷 {d} 个'), params: { n: res.plans.length, m: res.samples.length, d: res.deficiencies.length } },
      };
    }
    ctx.progress('parse', 'done');
    const res = await step(ctx, 'deficiency', () => computeDeficiency(sourceOf(ctx)));
    const { reminders, approveRequired } = icfrReminders(res);
    return { result: res, reminders, approveRequired, summary: { key: i18nKey('缺陷 {n} 个，其中重大 {a} 个、重要 {b} 个'), params: { n: res.deficiencies.length, a: res.counts.material_weakness, b: res.counts.significant } } };
  },

  async draft(ctx) {
    const res = ctx.run.result as FauIcfrResult;
    const artifacts = writeIcfrOutputs(outputCtx(ctx), res, ctx.run.requiredLevels).map((o) => artifact(ctx, o.kind, o.path, o.title));
    return { artifacts, summary: { key: i18nKey('已生成 {n} 个文件（草稿—待签核）'), params: { n: artifacts.length } } };
  },
};
