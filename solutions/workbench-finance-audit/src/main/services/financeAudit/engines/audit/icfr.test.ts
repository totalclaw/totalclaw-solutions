/**
 * B1 内控与 SOX：样本量（与 AICPA 属性抽样表一致）、频率下限、固定种子抽样可复现、测试结论、缺陷分级矩阵每一格。
 */
import { describe, expect, it } from 'vitest';
import type { FauCompensating, FauDeficiencyGrade, FauImpactLevel, FauSamplePlan } from '@totalclaw/ipc-contracts';
import { thresholdsFor } from '../../thresholds';
import { attributeSampleSize, binomCdf, samplePlan, seededSample } from './icfr/sampling';
import { amountTier, gradeDeficiency } from './icfr/deficiency';
import { evaluateTest, parseControls, parsePopulation, planAndSample } from './icfr/testing';
import { parseTable } from './table';
import * as FX from '../../__fixtures__/audit/data';

const th = thresholdsFor('icfr');
const table = (headers: string[], rows: (string | number)[][]) => parseTable({ headers, rows: rows.map((r) => Object.fromEntries(headers.map((h, i) => [h, String(r[i] ?? '')]))), fileName: 't.xlsx' }, 'controls');

describe('B1 属性抽样样本量', () => {
  it.each([
    // 预期偏差率, 可容忍偏差率, 置信水平 → 样本量(允许偏差数)：AICPA Audit Sampling 表 A-1（95%）
    [0, 0.05, 0.95, 59, 0], [0.01, 0.05, 0.95, 93, 1], [0.015, 0.05, 0.95, 124, 2], [0.02, 0.05, 0.95, 181, 4],
    [0, 0.10, 0.95, 29, 0], [0, 0.20, 0.95, 14, 0], [0.01, 0.10, 0.95, 46, 1],
  ])('预期 %s / 可容忍 %s / 置信 %s → %s（%s）', (e, t, c, n, k) => {
    expect(attributeSampleSize(e, t, c)).toEqual({ n, k });
  });

  it('预期偏差率不低于可容忍偏差率时无解（AICPA 表里的 *）', () => {
    expect(attributeSampleSize(0.05, 0.05, 0.95)).toBeNull();
  });

  it('二项分布：0.95^59 ≤ 5% < 0.95^58', () => {
    expect(binomCdf(0, 59, 0.05)).toBeLessThanOrEqual(0.05);
    expect(binomCdf(0, 58, 0.05)).toBeGreaterThan(0.05);
  });

  it('频率下限是下限：每日控制 max(59, 25) = 59；可容忍 20% 时 max(14, 25) = 25；季度控制总体 4 → 全量测试', () => {
    expect(samplePlan({ controlId: 'C', frequency: 'daily', population: 300, seed: 1 }, th).n).toBe(59);
    expect(samplePlan({ controlId: 'C', frequency: 'daily', population: 300, tolerableRate: 0.2, seed: 1 }, th).n).toBe(25);
    const q = samplePlan({ controlId: 'C', frequency: 'quarterly', population: 4, seed: 1 }, th);
    expect([q.n, q.testAll, q.frequencyMin]).toEqual([4, true, 2]);
  });
});

describe('B1 固定种子抽样', () => {
  it('同一种子两次抽样结果完全相同；换种子结果不同；无放回、升序、在范围内', () => {
    const a = seededSample(300, 59, FX.SEED);
    const b = seededSample(300, 59, FX.SEED);
    expect(a).toEqual(b);
    expect(seededSample(300, 59, FX.SEED + 1)).not.toEqual(a);
    expect(new Set(a).size).toBe(59);
    expect([...a].sort((x, y) => x - y)).toEqual(a);
    expect(a.every((i) => i >= 0 && i < 300)).toBe(true);
  });

  it('控制清单 + 样本总体 → 只给关键控制排计划，C-01 抽 59 个、C-02 全量 12 个，两次结果一致', () => {
    const ct = table(FX.CONTROLS_HEAD, FX.CONTROLS);
    const { controls, rates } = parseControls(ct);
    expect(controls.map((c) => `${c.id}:${c.frequency}:${c.key}`)).toEqual(['C-01:daily:true', 'C-02:monthly:true', 'C-03:daily:false']);
    expect(rates.get('C-01')?.tolerableRate).toBe(0.05);
    const pt = parseTable({ headers: FX.POPULATION_HEAD, rows: FX.POPULATION.map((r) => Object.fromEntries(FX.POPULATION_HEAD.map((h, i) => [h, String(r[i])]))), fileName: 'p.xlsx' }, 'population');
    const population = parsePopulation(pt);
    const run = () => planAndSample({ controls, rates, population, byControl: true, seedBase: 'run', seed: FX.SEED, results: {}, th });
    const one = run();
    expect(one.plans.map((p) => [p.controlId, p.population, p.n, p.testAll])).toEqual([['C-01', 300, 59, false], ['C-02', 12, 12, true]]);
    expect(one.samples).toHaveLength(71);
    expect(run().samples).toEqual(one.samples);
  });
});

describe('B1 测试结论', () => {
  const plan = (n: number, attributeN: number, k: number): FauSamplePlan => ({ controlId: 'C', frequency: 'daily', population: 300, expectedRate: 0, tolerableRate: 0.05, confidence: 0.95, attributeN, allowedDeviations: k, frequencyMin: 25, n, testAll: false, seed: 1 });
  const samples = (n: number, fails: number, pending = 0) => Array.from({ length: n }, (_, i) => ({ controlId: 'C', seq: i + 1, row: i + 2, ref: `R${i}`, date: '', amount: 0, result: (i < fails ? 'fail' : i < fails + pending ? 'pending' : 'pass') as 'fail' | 'pending' | 'pass' }));
  it('没测完 → 待评；全部通过 → 有效；偏差超过允许数 → 无效', () => {
    expect(evaluateTest(plan(59, 59, 0), samples(59, 0, 3)).conclusion).toBe('pending');
    expect(evaluateTest(plan(59, 59, 0), samples(59, 0)).conclusion).toBe('effective');
    expect(evaluateTest(plan(59, 59, 0), samples(59, 1)).conclusion).toBe('ineffective');
    // 允许 1 个偏差的计划（93 个样本）：1 个有效、2 个无效
    expect(evaluateTest(plan(93, 93, 1), samples(93, 1)).conclusion).toBe('effective');
    expect(evaluateTest(plan(93, 93, 1), samples(93, 2)).conclusion).toBe('ineffective');
  });
});

describe('B1 缺陷分级矩阵：金额档 × 运营影响 × 补偿性控制，27 格全覆盖', () => {
  // 无补偿控制的基础等级（源技能矩阵 + 补齐的两格）；补偿控制「有效」降一级，「部分有效 / 无」不降
  const BASE: Record<FauImpactLevel, Record<FauImpactLevel, FauDeficiencyGrade>> = {
    high: { high: 'material_weakness', medium: 'significant', low: 'significant' },
    medium: { high: 'significant', medium: 'deficiency', low: 'deficiency' },
    low: { high: 'deficiency', medium: 'improvement', low: 'improvement' },
  };
  const DOWN: Record<FauDeficiencyGrade, FauDeficiencyGrade> = { material_weakness: 'significant', significant: 'deficiency', deficiency: 'improvement', improvement: 'improvement' };
  const cells: Array<[FauImpactLevel, FauImpactLevel, FauCompensating, FauDeficiencyGrade]> = [];
  for (const a of ['high', 'medium', 'low'] as const) for (const o of ['high', 'medium', 'low'] as const) for (const c of ['none', 'partial', 'effective'] as const) cells.push([a, o, c, c === 'effective' ? DOWN[BASE[a][o]] : BASE[a][o]]);
  it('一共 27 格', () => expect(cells).toHaveLength(27));
  it.each(cells)('金额 %s · 运营 %s · 补偿 %s → %s', (a, o, c, g) => expect(gradeDeficiency(a, o, c)).toBe(g));
  it('与源技能矩阵逐行一致（>X 高 无 → 重大；X–X 中 无 → 一般；<X 低 有效 → 改进建议）', () => {
    expect(gradeDeficiency('high', 'high', 'none')).toBe('material_weakness');
    expect(gradeDeficiency('high', 'low', 'none')).toBe('significant');
    expect(gradeDeficiency('medium', 'high', 'none')).toBe('significant');
    expect(gradeDeficiency('medium', 'low', 'none')).toBe('deficiency');
    expect(gradeDeficiency('low', 'low', 'effective')).toBe('improvement');
    expect(gradeDeficiency('low', 'low', 'none')).toBe('improvement');
  });
  it('金额分档：≥ 100 万为高、≥ 10 万为中', () => {
    expect([amountTier(100_000_000, th), amountTier(99_999_999, th), amountTier(10_000_000, th), amountTier(9_999_999, th)]).toEqual(['high', 'medium', 'medium', 'low']);
  });
});
