/**
 * B1 控制测试（纯函数）：控制清单 / 样本总体 / 缺陷清单解析 → 每个关键控制出抽样计划与样本 → 测试结论 → 缺陷分级。
 *
 * 结论口径（control-testing 第四步 + 属性抽样）：样本没测完 → 待评；偏差数超过抽样计划允许的偏差数
 * （样本量没达到属性抽样量时允许 0 个）或偏差率超过可容忍偏差率 → 控制无效；否则有效。
 * 控制无效自动生成一条缺陷，财务影响取未通过样本金额合计，运营影响与补偿性控制由人在第 ④ 步改。
 */
import type {
  FauCompensating, FauControl, FauControlTest, FauDeficiency, FauDeficiencyGrade, FauImpactLevel, FauSample, FauSamplePlan,
} from '@totalclaw/ipc-contracts';
import { FAU_COMPENSATING, FAU_CONTROL_FREQUENCIES, FAU_DEFICIENCY_GRADES, FAU_IMPACT_LEVELS } from '@totalclaw/ipc-contracts';
import { matchValue, toCents, toIsoDate, toRate, yesNo, type ParsedTable } from '../table';
import { samplePlan, seededSample, seedOf } from './sampling';
import { amountTier, gradeDeficiency } from './deficiency';

export interface PopulationRow { row: number; ref: string; date: string; amount: number; controlId: string }
export interface ControlRates { expectedRate: number | null; tolerableRate: number | null }

export function parseControls(p: ParsedTable): { controls: FauControl[]; rates: Map<string, ControlRates>; badFrequency: number[] } {
  const controls: FauControl[] = [];
  const rates = new Map<string, ControlRates>();
  const badFrequency: number[] = [];
  const keyCol = !!p.mapping.key;
  for (const r of p.rows) {
    const id = r.get('controlId').replace(/\s+/g, '').toUpperCase();
    if (!id) continue;
    const frequency = matchValue(r.get('frequency'), FAU_CONTROL_FREQUENCIES);
    if (!frequency) { badFrequency.push(r.row); continue; }
    controls.push({
      id, process: r.get('process'), risk: r.get('risk'), assertion: r.get('assertion'), description: r.get('description'),
      type: matchValue(r.get('type'), ['preventive', 'detective'] as const) || 'preventive',
      nature: matchValue(r.get('nature'), ['automated', 'itdm'] as const) || 'manual',
      frequency, owner: r.get('owner'), key: keyCol ? yesNo(r.get('key')) !== false : true, source: 'upload', row: r.row,
    });
    rates.set(id, { expectedRate: toRate(r.get('expectedRate')), tolerableRate: toRate(r.get('tolerableRate')) });
  }
  return { controls, rates, badFrequency };
}

export function parsePopulation(p: ParsedTable): PopulationRow[] {
  return p.rows.map((r) => ({
    row: r.row, ref: r.get('ref'), date: toIsoDate(r.get('date')), amount: toCents(r.get('amount')),
    controlId: r.get('controlId').replace(/\s+/g, '').toUpperCase(),
  })).filter((x) => x.ref);
}

export interface SampleResults { [key: string]: { result: 'pass' | 'fail'; note?: string } }
export const sampleKey = (controlId: string, row: number) => `${controlId}#${row}`;

/** 每个关键控制：总体 → 计划 → 固定种子抽样；已记录的测试结论按「控制 + 总体行号」带回 */
export function planAndSample(input: {
  controls: FauControl[]; rates: Map<string, ControlRates>; population: PopulationRow[]; byControl: boolean;
  seedBase: string; seed?: number | null; results: SampleResults; th: Record<string, number>;
}): { plans: FauSamplePlan[]; samples: FauSample[]; emptyControls: string[] } {
  const plans: FauSamplePlan[] = [];
  const samples: FauSample[] = [];
  const emptyControls: string[] = [];
  for (const c of input.controls.filter((x) => x.key)) {
    const pop = input.byControl ? input.population.filter((r) => r.controlId === c.id) : input.population;
    if (!pop.length) emptyControls.push(c.id);
    const seed = input.seed != null && Number.isFinite(input.seed) ? Math.floor(input.seed) >>> 0 : seedOf(`${input.seedBase}:${c.id}`);
    const rate = input.rates.get(c.id);
    const plan = samplePlan({ controlId: c.id, frequency: c.frequency, population: pop.length, expectedRate: rate?.expectedRate, tolerableRate: rate?.tolerableRate, seed }, input.th);
    plans.push(plan);
    seededSample(pop.length, plan.n, seed).forEach((i, seq) => {
      const r = pop[i];
      const got = input.results[sampleKey(c.id, r.row)];
      samples.push({ controlId: c.id, seq: seq + 1, row: r.row, ref: r.ref, date: r.date, amount: r.amount, result: got?.result || 'pending', note: got?.note });
    });
  }
  return { plans, samples, emptyControls };
}

export function evaluateTest(plan: FauSamplePlan, samples: FauSample[]): FauControlTest {
  const mine = samples.filter((s) => s.controlId === plan.controlId);
  const tested = mine.filter((s) => s.result !== 'pending').length;
  const deviations = mine.filter((s) => s.result === 'fail').length;
  const rate = tested ? deviations / tested : null;
  const allowed = plan.n >= plan.attributeN && plan.attributeN > 0 ? plan.allowedDeviations : 0;
  const base = { controlId: plan.controlId, sampled: mine.length, tested, deviations, rate, tolerableRate: plan.tolerableRate };
  if (!mine.length || tested < mine.length) return { ...base, conclusion: 'pending' };
  if (deviations > allowed || (rate !== null && rate > plan.tolerableRate)) return { ...base, conclusion: 'ineffective', reason: 'rate' };
  return { ...base, conclusion: 'effective' };
}

export interface DeficiencyEdit { opImpact?: FauImpactLevel; compensating?: FauCompensating; remediation?: string; owner?: string; dueDate?: string }

function finish(d: Omit<FauDeficiency, 'amountTier' | 'grade'>, th: Record<string, number>): FauDeficiency {
  const tier = amountTier(d.amount, th);
  return { ...d, amountTier: tier, grade: gradeDeficiency(tier, d.opImpact, d.compensating) };
}

/** 控制无效 → 缺陷（财务影响 = 未通过样本金额合计） */
export function deficienciesFromTests(tests: FauControlTest[], controls: FauControl[], samples: FauSample[], edits: Record<string, DeficiencyEdit>, th: Record<string, number>): FauDeficiency[] {
  return tests.filter((t) => t.conclusion === 'ineffective').map((t) => {
    const id = `DEF-${t.controlId}`;
    const e = edits[id] || {};
    const c = controls.find((x) => x.id === t.controlId);
    const amount = samples.filter((s) => s.controlId === t.controlId && s.result === 'fail').reduce((s, x) => s + Math.abs(x.amount), 0);
    return finish({
      id, controlId: t.controlId, description: c?.description || t.controlId, source: 'testing', amount,
      opImpact: e.opImpact || 'medium', compensating: e.compensating || 'none',
      owner: e.owner ?? c?.owner ?? '', dueDate: e.dueDate || '', remediation: e.remediation || '',
    }, th);
  });
}

export function parseDeficiencies(p: ParsedTable, edits: Record<string, DeficiencyEdit>, th: Record<string, number>): { list: FauDeficiency[]; badLevel: number[] } {
  const list: FauDeficiency[] = [];
  const badLevel: number[] = [];
  p.rows.forEach((r, i) => {
    const description = r.get('description');
    if (!description) return;
    const id = (r.get('defId') || `DEF-${i + 1}`).replace(/\s+/g, '').toUpperCase();
    const rawOp = r.get('opImpact');
    const op = matchValue(rawOp, FAU_IMPACT_LEVELS);
    const comp = matchValue(r.get('compensating'), FAU_COMPENSATING);
    if (rawOp && !op) badLevel.push(r.row);
    const e = edits[id] || {};
    list.push(finish({
      id, controlId: r.get('controlId').toUpperCase(), description, source: 'upload', amount: toCents(r.get('amount')),
      opImpact: e.opImpact || op || 'medium', compensating: e.compensating || comp || 'none',
      owner: e.owner ?? r.get('owner'), dueDate: e.dueDate || toIsoDate(r.get('dueDate')), remediation: e.remediation ?? r.get('remediation'), row: r.row,
    }, th));
  });
  return { list, badLevel };
}

export function countGrades(list: FauDeficiency[]): Record<FauDeficiencyGrade, number> {
  return Object.fromEntries(FAU_DEFICIENCY_GRADES.map((g) => [g, list.filter((d) => d.grade === g).length])) as Record<FauDeficiencyGrade, number>;
}
