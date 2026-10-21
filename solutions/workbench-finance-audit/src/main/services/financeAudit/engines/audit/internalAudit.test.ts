/** B2 内部审计：风险矩阵九格、年度计划排程与人天缺口（手算见夹具注释）、整改超期分级、首页待办。 */
import { describe, expect, it } from 'vitest';
import type { FauCompany, FauImpactLevel, FauProject, FauRun } from '@totalclaw/ipc-contracts';
import { thresholdsFor } from '../../thresholds';
import { buildPlan, parseFindings, parseUniverse, riskOf, trackOverdue } from './internalAudit/plan';
import { auditTodos } from './todos';
import { tableOf } from './testTable';
import * as FX from '../../__fixtures__/audit/data';

const th = thresholdsFor('internal-audit');

describe('B2 风险矩阵', () => {
  it.each([
    ['high', 'high', 'high'], ['medium', 'high', 'high'], ['low', 'high', 'medium'],
    ['high', 'medium', 'high'], ['medium', 'medium', 'medium'], ['low', 'medium', 'low'],
    ['high', 'low', 'medium'], ['medium', 'low', 'low'], ['low', 'low', 'low'],
  ] as Array<[FauImpactLevel, FauImpactLevel, FauImpactLevel]>)('可能性 %s × 影响 %s → %s', (l, i, r) => expect(riskOf(l, i)).toBe(r));
});

describe('B2 年度计划', () => {
  it('必审与高风险一定纳入；按人天依次纳入；缺口与季度与手算一致', () => {
    const { areas, bad } = parseUniverse(tableOf(FX.UNIVERSE_HEAD, FX.UNIVERSE, 'universe'));
    expect(bad).toEqual([]);
    const plan = buildPlan(areas, 40, th);
    const byName = Object.fromEntries(plan.areas.map((a) => [a.name, a]));
    expect(plan.areas.map((a) => a.name)).toEqual(['关联交易', '资金管理', '存货管理', '税务合规', '行政事务']);
    expect([byName['资金管理'].risk, byName['关联交易'].risk, byName['存货管理'].risk, byName['税务合规'].risk, byName['行政事务'].risk]).toEqual(['high', 'low', 'medium', 'medium', 'low']);
    expect(plan.areas.filter((a) => a.included).map((a) => `${a.name}:${a.quarter}`)).toEqual(['关联交易:Q1', '资金管理:Q1', '存货管理:Q3', '行政事务:Q4']);
    expect(byName['税务合规'].included).toBe(false);
    expect([plan.requiredDays, plan.availableDays, plan.gap]).toEqual([45, 40, 5]);
  });
});

describe('B2 整改超期', () => {
  const { list } = parseFindings(tableOf(FX.FINDINGS_HEAD, FX.FINDINGS, 'findings'));
  it('截至 2026-10-19：F-001 48 天升级 CFO、F-002 79 天升级审计委员会、F-003 1 天提醒、已完成与无期限不算', () => {
    const t = list.map((f) => trackOverdue(f, FX.AS_OF, th));
    expect(t.map((f) => `${f.id}:${f.overdueDays}:${f.tier}:${f.status}`)).toEqual(['F-001:48:2:open', 'F-002:79:3:in_progress', 'F-003:1:1:open', 'F-004:0:0:closed', 'F-005:0:0:open']);
    expect(t.map((f) => f.severity)).toEqual(['major', 'moderate', 'low', 'low', 'low']);
  });

  it('首页待办：最新一次整改跟踪按今天现算，超期 3 项、有升级档 → 危险', () => {
    const run = { id: 'run_x', moduleId: 'internal-audit', modeId: 'tracking', status: 'archived', result: { mode: 'tracking', asOf: '2026-01-01', tracked: list } } as unknown as FauRun;
    const todos = auditTodos({} as never, { thresholds: {} } as FauCompany, {} as FauProject, run, FX.AS_OF);
    expect(todos).toHaveLength(1);
    expect(todos[0]).toMatchObject({ kind: 'escalation', severity: 'danger', message: { key: '内审整改：{n} 项超期未整改', params: { n: 3 } } });
  });
});
