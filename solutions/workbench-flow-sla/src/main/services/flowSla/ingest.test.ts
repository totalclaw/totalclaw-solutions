import { afterAll, describe, expect, it } from 'vitest';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import rulesJson from './defaultRules.json';
import { writeWorkbook } from '../serviceSettlement/excel';
import { computeSla, type CalcOptions, type SlaRules } from './calc';
import {
  REGULAR, aliasKey, applyAliases, defaultPeriod, detectMapping, effectiveRules, hasNodeColumn, ingestAll, isNodeLevel, makePeriod, missingRoles,
  parseDate, previewTable, readRawTable, resolveStatus, sanitizeThresholds, thresholdsOf,
} from './ingest';
import { writeDemo } from './demoData';

const rules = rulesJson as unknown as SlaRules;
const T = (s: string) => new Date(s.length === 10 ? `${s}T00:00:00` : s).getTime();
const dir = mkdtempSync(join(tmpdir(), 'fs-ingest-'));
afterAll(() => rmSync(dir, { recursive: true, force: true }));
const spec = (path: string, slot: 'flow' | 'node' | 'roster') => ({ path, mapping: previewTable(path, slot).mapping });

describe('时间解析', () => {
  it('常见写法都读成同一个本地时刻', () => {
    const want = T('2026-10-01T09:05:00');
    expect(parseDate('2026-10-01 09:05:00')).toBe(want);
    expect(parseDate('2026/10/1 9:05')).toBe(want);
    expect(parseDate('2026年10月1日 9时5分')).toBe(want);
    expect(parseDate('2026年10月1日 09:05')).toBe(want);
    expect(parseDate('2026.10.1 9:05:00')).toBe(want);
    expect(parseDate('2026-10-01T09:05:00')).toBe(want);
    expect(parseDate('10/1/2026 9:05')).toBe(want);
    expect(parseDate('2026/10/1 上午 9:05')).toBe(want);
    expect(parseDate('2026/10/1 下午 9:05')).toBe(T('2026-10-01T21:05:00'));
  });
  it('只有日期', () => {
    expect(parseDate('2026年10月1日')).toBe(T('2026-10-01'));
    expect(parseDate('20261001')).toBe(T('2026-10-01'));
    expect(parseDate('2026-10-01')).toBe(T('2026-10-01'));
  });
  it('Excel 序列号（数字或数字文本）带时分秒', () => {
    // 2026-10-01 = 46296
    expect(parseDate(46296)).toBe(T('2026-10-01'));
    expect(parseDate(46296.5)).toBe(T('2026-10-01T12:00:00'));
    expect(parseDate('46296.378472')).toBe(T('2026-10-01T09:05:00'));
  });
  it('空、横线、乱写的返回 null', () => {
    for (const v of ['', null, undefined, '-', '/', '——', '待定', '2026-13-40', 12, 'abc']) expect(parseDate(v)).toBeNull();
  });
});

describe('状态口径', () => {
  it('OA 看审批状态', () => {
    expect(resolveStatus('OA', '结束', '', true).status).toBe('done');
    expect(resolveStatus('OA', '待审', '', false).status).toBe('running');
    expect(resolveStatus('OA', '终止', '', false).status).toBe('terminated');
    expect(resolveStatus('OA', '未结束', '', false).status).toBe('running');
  });
  it('CSS 看状态', () => {
    expect(resolveStatus('CSS', '已审核', '', true).status).toBe('done');
    expect(resolveStatus('CSS', '审核中', '', false).status).toBe('running');
  });
  it('费控看当前处理人：结束 / 终止，其余都是在途', () => {
    expect(resolveStatus('费控', '', '结束', true).status).toBe('done');
    expect(resolveStatus('费控', '', '终止', false).status).toBe('terminated');
    expect(resolveStatus('费控', '', '王雪锋', false)).toEqual({ status: 'running', guessed: false });
    // 有结束时间但当前处理人是人名，仍按在途（口径以当前处理人为准）
    expect(resolveStatus('费控', '', '王雪锋', true).status).toBe('running');
  });
  it('认不出来的状态按有没有结束时间判断，并标记', () => {
    expect(resolveStatus('OA', '某种新状态', '', true)).toEqual({ status: 'done', guessed: true });
    expect(resolveStatus('OA', '某种新状态', '', false)).toEqual({ status: 'running', guessed: true });
    expect(resolveStatus('OA', '', '', true)).toEqual({ status: 'done', guessed: false });
  });
});

describe('认列', () => {
  it('流程表', () => {
    const m = detectMapping(['流程编号', '流程名称', '标题', '起草人', '起草部门', '审批状态', '起草时间', '结束时间', '当前节点', '当前处理人'], 'flow');
    expect(m).toMatchObject({ flowNo: '流程编号', flowName: '流程名称', title: '标题', initiator: '起草人', dept: '起草部门', status: '审批状态', startAt: '起草时间', endAt: '结束时间', currentNode: '当前节点', currentHandler: '当前处理人' });
    expect(m.node).toBeUndefined();
    expect(missingRoles('flow', m)).toEqual([]);
  });
  it('节点表：开始 / 结束时间是节点的时间', () => {
    const m = detectMapping(['单据编号', '单据类型', '环节名称', '审批人', '接收时间', '审批时间'], 'node');
    expect(m).toMatchObject({ flowNo: '单据编号', flowName: '单据类型', node: '环节名称', handler: '审批人', nodeStart: '接收时间', nodeEnd: '审批时间' });
    expect(missingRoles('node', m, { hasFlowTable: true })).toEqual([]);
  });
  it('放在流程表位置上的节点级表：照样先认节点列', () => {
    const headers = ['事务编号', '事务类型', '费用类型', '标题', '发起人', '状态', '审批节点名', '审核人', '开始时间', '结束时间'];
    expect(hasNodeColumn(headers)).toBe(true);
    const m = detectMapping(headers, 'flow');
    expect(m).toMatchObject({ flowNo: '事务编号', flowName: '事务类型', feeType: '费用类型', node: '审批节点名', handler: '审核人', nodeStart: '开始时间', nodeEnd: '结束时间', status: '状态', initiator: '发起人' });
    expect(m.startAt).toBeUndefined();
    expect(isNodeLevel(m)).toBe(true);
  });
  it('流程时间和节点时间都有时各归各位', () => {
    const m = detectMapping(['单号', '流程名称', '起草时间', '流程结束时间', '节点名称', '处理人', '开始时间', '结束时间'], 'flow');
    expect(m).toMatchObject({ startAt: '起草时间', endAt: '流程结束时间', nodeStart: '开始时间', nodeEnd: '结束时间' });
  });
  it('缺必填列会指出来', () => {
    expect(missingRoles('flow', { flowNo: 'a' })).toEqual(['flowName', 'startAt']);
    expect(missingRoles('node', { flowNo: 'a', node: 'b', nodeStart: 'c' }, { hasFlowTable: false })).toEqual(['handler', 'flowName']);
    expect(missingRoles('roster', {})).toEqual(['name']);
  });
  it('花名册', () => {
    expect(detectMapping(['工号', '姓名', '部门', '邮箱', '身份'], 'roster')).toEqual({ name: '姓名', dept: '部门', email: '邮箱', identity: '身份' });
  });
});

describe('读入：流程表 + 节点表分开', () => {
  const flowFile = join(dir, 'OA流程.xlsx');
  const nodeFile = join(dir, 'OA节点.xlsx');
  const rosterFile = join(dir, '花名册.xlsx');
  // 表头上面有一行标题；时间写法混着来
  writeWorkbook(flowFile, [{
    name: 'Sheet1', headers: ['OA 流程时效报表（导出）'],
    rows: [
      ['流程编号', '流程名称', '标题', '起草人', '起草部门', '审批状态', '起草时间', '结束时间', '当前节点', '当前处理人', '金额(元)'],
      ['OA001', '退款申请流程', '退款-甲', '张三', '服务交付部', '结束', '2026-10-01 09:00:00', '2026/10/6 18:30', '', '', '1,200.50'],
      ['OA002', '退款申请流程', '退款-乙', '李四', '服务交付部', '待审', '2026年10月2日 8时30分', '', '部门负责人', '王五', ''],
      ['OA003', '合同线上审查流程', '合同-丙', '张三', '运营管理部', '终止', new Date(2026, 9, 3, 10, 0, 0), '', '', '', '12万'],
      ['', '退款申请流程', '没有单号', '张三', '', '结束', '2026-10-01', '2026-10-02', '', '', ''],
      ['OA004', '退款申请流程', '时间坏了', '张三', '', '结束', '很久以前', '2026-10-02', '', '', ''],
      ['OA001', '退款申请流程', '重复', '张三', '', '结束', '2026-10-01', '2026-10-02', '', '', ''],
      ['OA005', '退款申请流程', '办结没结束时间', '张三', '', '结束', '2026-10-01', '', '', '', ''],
      ['OA006', '退款申请流程', '结束早于开始', '张三', '', '结束', '2026-10-05', '2026-10-02', '', '', ''],
    ],
  }]);
  writeWorkbook(nodeFile, [{
    name: 'Sheet1', headers: ['流程编号', '节点名称', '处理人', '到达时间', '处理时间'],
    rows: [
      ['OA001', '起草节点', '张三', '2026-10-01 09:00:00', '2026-10-01 09:05:00'],
      ['OA001', '部门负责人', '王五', '2026-10-01 09:05:00', '2026-10-03 09:05:00'],
      ['OA002', '部门负责人', '王五', '2026/10/2 8:30', ''],
      ['OA999', '部门负责人', '王五', '2026-10-01 09:00:00', '2026-10-01 10:00:00'],
      ['OA001', '', '王五', '2026-10-01 09:00:00', ''],
    ],
  }]);
  writeWorkbook(rosterFile, [{ name: 'Sheet1', headers: ['姓名', '部门', '邮箱', '身份'], rows: [['张三', '服务交付部', 'zhangsan@example.com', '非管理'], ['王五', '服务交付部', '不是邮箱', '管理干部'], ['张三', '重复', '', '']] }]);

  const r = ingestAll({ systems: { OA: { flow: spec(flowFile, 'flow'), node: spec(nodeFile, 'node') } }, roster: spec(rosterFile, 'roster') });

  it('标题行不会被当成表头', () => {
    const t = readRawTable(flowFile);
    expect(t.headerRow).toBe(2);
    expect(t.headers[0]).toBe('流程编号');
    expect(previewTable(flowFile, 'flow').mapping.amount).toBe('金额(元)');
  });
  it('流程归一：状态、时间、金额', () => {
    expect(r.flows.map((f) => f.flowNo)).toEqual(['OA001', 'OA002', 'OA003']);
    const [a, b, c] = r.flows;
    expect(a).toMatchObject({ system: 'OA', status: 'done', startAt: T('2026-10-01T09:00:00'), endAt: T('2026-10-06T18:30:00'), amount: 1200.5, initiator: '张三', dept: '服务交付部' });
    expect(b).toMatchObject({ status: 'running', startAt: T('2026-10-02T08:30:00'), currentNode: '部门负责人', currentHandler: '王五' });
    expect(b.endAt).toBeUndefined();
    expect(c).toMatchObject({ status: 'terminated', amount: 120000 });
    expect(Math.abs(c.startAt - T('2026-10-03T10:00:00'))).toBeLessThanOrEqual(1000);
  });
  it('节点归一：流程名从流程表按单号补，补不上的不收', () => {
    expect(r.nodes).toHaveLength(3);
    expect(r.nodes.every((n) => n.flowName)).toBe(true);
    expect(r.nodes[1]).toMatchObject({ flowNo: 'OA001', flowName: '退款申请流程', node: '部门负责人', handler: '王五', startAt: T('2026-10-01T09:05:00'), endAt: T('2026-10-03T09:05:00') });
    expect(r.nodes[2].endAt).toBeUndefined();
    expect(r.summary.warnings.join('\n')).toMatch(/找不到单号/);
  });
  it('没收的行都有原因和行号', () => {
    const by = Object.fromEntries(r.summary.skipped.map((s) => [s.reason, s]));
    expect(by['没有单号'].rows).toEqual([6]);
    expect(by['开始时间读不出来'].rows).toEqual([7]);
    expect(by['单号重复，只留第一行'].rows).toEqual([8]);
    expect(by['已办结但结束时间读不出来'].rows).toEqual([9]);
    expect(by['结束时间早于开始时间'].rows).toEqual([10]);
    expect(by['没有节点名称'].count).toBe(1);
    expect(by['姓名重复，只留第一行'].count).toBe(1);
  });
  it('花名册：邮箱格式不对的留空', () => {
    expect(r.roster).toEqual([{ name: '张三', dept: '服务交付部', email: 'zhangsan@example.com', identity: '非管理' }, { name: '王五', dept: '服务交付部', email: '', identity: '管理干部' }]);
    expect(r.summary).toMatchObject({ roster: 2, rosterWithEmail: 1 });
    expect(r.summary.systems[0]).toMatchObject({ system: 'OA', flows: 3, nodes: 3, done: 1, running: 1, terminated: 1, derived: false });
  });
  it('必填列没对上就不让导入', () => {
    expect(() => ingestAll({ systems: { OA: { flow: { path: flowFile, mapping: { flowNo: '流程编号' } } } } })).toThrow(/必填列/);
  });
});

describe('读入：一行一个节点的合并表', () => {
  const file = join(dir, 'CSS合并.xlsx');
  writeWorkbook(file, [{
    name: 'Sheet1', headers: ['事务编号', '事务类型', '费用类型', '标题', '发起人', '状态', '审批节点名', '审核人', '开始时间', '结束时间'],
    rows: [
      ['C001', '免考核申请', '', '免考核-甲', '赵六', '已审核', '发起', '赵六', new Date(2026, 9, 5, 9, 0, 0), new Date(2026, 9, 5, 9, 10, 0)],
      ['C001', '免考核申请', '', '免考核-甲', '赵六', '已审核', '区域服务经理审批', '王五', new Date(2026, 9, 5, 9, 10, 0), new Date(2026, 9, 6, 9, 10, 0)],
      ['C002', '特殊费用核销申请', '返厂核销', '核销-乙', '赵六', '审核中', '发起', '赵六', '2026-10-06 10:00:00', '2026-10-06 10:05:00'],
      ['C002', '特殊费用核销申请', '返厂核销', '核销-乙', '赵六', '审核中', '区域经理审批', '王五', '2026-10-06 10:05:00', null],
      ['C003', '免考核申请', '', '', '', '', '发起', '钱七', '2026-10-07 10:00:00', '2026-10-07 10:05:00'],
      ['C003', '免考核申请', '', '', '', '', '区域服务经理审批', '王五', '2026-10-07 10:05:00', '2026-10-08 10:05:00'],
    ],
  }]);
  const r = ingestAll({ systems: { CSS: { flow: spec(file, 'flow') } } });

  it('预览认出这是合并表', () => {
    const p = previewTable(file, 'flow');
    expect(p.combined).toBe(true);
    expect(p.rowCount).toBe(6);
    expect(p.preview[0]['开始时间']).toBe('2026-10-05 09:00:00');
  });
  it('按单号归并出流程', () => {
    expect(r.summary.systems[0]).toMatchObject({ system: 'CSS', flows: 3, nodes: 6, done: 2, running: 1, derived: true });
    const [a, b, c] = r.flows;
    expect(a).toMatchObject({ flowNo: 'C001', flowName: '免考核申请', status: 'done', initiator: '赵六', title: '免考核-甲' });
    expect(Math.abs(a.startAt - T('2026-10-05T09:00:00'))).toBeLessThanOrEqual(1000);
    expect(Math.abs((a.endAt as number) - T('2026-10-06T09:10:00'))).toBeLessThanOrEqual(1000);
    expect(b).toMatchObject({ flowNo: 'C002', feeType: '返厂核销', status: 'running', currentNode: '区域经理审批', currentHandler: '王五' });
    expect(b.endAt).toBeUndefined();
    // 没有状态、没有发起人：节点都处理完了算办结，发起人取「发起」节点的处理人
    expect(c).toMatchObject({ flowNo: 'C003', status: 'done', initiator: '钱七', endAt: T('2026-10-08T10:05:00') });
  });
  it('归并出的数据能直接算：CSS 只累计内部节点', () => {
    const opt: CalcOptions = { now: T('2026-10-12T09:00:00'), periodStart: T('2026-10-05'), periodEnd: T('2026-10-12') };
    const res = computeSla(r.flows, r.nodes, rules, opt);
    const a = res.flows.find((f) => f.flowNo === 'C001')!;
    expect(a.days).toBeCloseTo(1, 1);
    expect(a.approx).toBe(false);
    expect(res.flows.find((f) => f.flowNo === 'C002')!.flowType).toBe('特殊费用核销申请-返厂核销');
  });
  it('只给节点表、不给流程表也能归并', () => {
    const r2 = ingestAll({ systems: { CSS: { node: spec(file, 'node') } } });
    expect(r2.flows).toHaveLength(3);
    expect(r2.summary.systems[0].derived).toBe(true);
  });
  it('CSV 也能读', () => {
    const csv = join(dir, 'fk.csv');
    writeFileSync(csv, '﻿单据编号,单据类型,申请人,申请金额,创建时间,结束时间,当前处理人\nF1,日常费用报销,张三,88000,2026/10/1 9:05,2026/10/9 10:00,结束\nF2,预付单,李四,150000,2026/10/3 9:05,,王五\n', 'utf-8');
    const r3 = ingestAll({ systems: { 费控: { flow: spec(csv, 'flow') } } });
    expect(r3.flows).toHaveLength(2);
    expect(r3.flows[0]).toMatchObject({ status: 'done', amount: 88000 });
    expect(Math.abs(r3.flows[0].startAt - T('2026-10-01T09:05:00'))).toBeLessThanOrEqual(1000);
    expect(r3.flows[1]).toMatchObject({ status: 'running', currentHandler: '王五', amount: 150000 });
  });
});

describe('规则生效前的调整', () => {
  const opt: CalcOptions = { now: T('2026-10-12T09:00:00'), periodStart: T('2026-10-05'), periodEnd: T('2026-10-12') };
  it('流程名对到规则细类后按该细类的时效判定，结果仍能找回原名', () => {
    const flows = [{ system: 'CSS' as const, flowNo: 'X1', flowName: '配件索赔登记', initiator: '张三', status: 'done' as const, startAt: T('2026-10-01'), endAt: T('2026-10-08') }];
    expect(computeSla(flows, [], rules, opt).unmatchedTypes).toHaveLength(1);
    const a = applyAliases(flows, { [aliasKey('CSS', '配件索赔登记')]: '质量报告单' });
    const res = computeSla(a.flows, [], rules, opt);
    expect(res.unmatchedTypes).toHaveLength(0);
    expect(res.flows[0]).toMatchObject({ flowType: '质量报告单', limitDays: 2, overtime: true });
    expect(a.original.get('CSS|X1')).toBe('配件索赔登记');
    // 确认为常规流程的不换名
    expect(applyAliases(flows, { [aliasKey('CSS', '配件索赔登记')]: REGULAR }).flows[0].flowName).toBe('配件索赔登记');
  });
  it('人工给节点定了内外部后不再是未登记，也不会挤掉这个流程原有的节点', () => {
    const flows = [{ system: 'OA' as const, flowNo: 'O1', flowName: '退款申请', initiator: '张三', status: 'done' as const, startAt: T('2026-10-01'), endAt: T('2026-10-08') }];
    const nodes = [
      { system: 'OA' as const, flowNo: 'O1', flowName: '退款申请', node: '部门负责人', handler: '李四', startAt: T('2026-10-05'), endAt: T('2026-10-06') },
      { system: 'OA' as const, flowNo: 'O1', flowName: '退款申请', node: '数据复核岗', handler: '李四', startAt: T('2026-10-06'), endAt: T('2026-10-07') },
    ];
    const before = computeSla(flows, nodes, rules, opt);
    expect(before.unknownNodes.map((n) => n.node)).toEqual(['数据复核岗']);
    expect(before.reviews).toHaveLength(1);
    const counted = computeSla(flows, nodes, effectiveRules(rules, { decisions: [{ system: 'OA', flowName: '退款申请', node: '数据复核岗', internal: true }] }), opt);
    expect(counted.unknownNodes).toEqual([]);
    expect(counted.reviews.map((r) => r.node).sort()).toEqual(['数据复核岗', '部门负责人'].sort());
    const excluded = computeSla(flows, nodes, effectiveRules(rules, { decisions: [{ system: 'OA', flowName: '退款申请', node: '数据复核岗', internal: false }] }), opt);
    expect(excluded.unknownNodes).toEqual([]);
    expect(excluded.reviews.map((r) => r.node)).toEqual(['部门负责人']);
    // 内置规则本身不被改动
    expect(rules.oaFkNodes).toHaveLength(669);
  });
  it('CSS 节点的人工定性', () => {
    const r2 = effectiveRules(rules, { decisions: [{ system: 'CSS', flowName: '免考核申请', node: '数据复核岗', internal: true }] });
    expect(r2.cssNodes).toHaveLength(77);
    expect(rules.cssNodes).toHaveLength(76);
  });
  it('阈值覆盖与清洗', () => {
    const r2 = effectiveRules(rules, { thresholds: { riskRatio: 0.7, minComplianceRate: 0.9, internalDays: 2 } });
    expect(r2.riskRatio).toBe(0.7);
    expect(r2.abnormal).toEqual({ avgIncreaseDays: 3, minComplianceRate: 0.9 });
    expect(r2.followUp).toEqual({ internalDays: 2, externalDays: 7 });
    const base = thresholdsOf(rules);
    expect(base).toEqual({ amountThreshold: 100000, riskRatio: 0.8, avgIncreaseDays: 3, minComplianceRate: 0.95, internalDays: 3, externalDays: 7, improveRemindDays: 7 });
    expect(sanitizeThresholds({ riskRatio: 5, minComplianceRate: -1, internalDays: 0, externalDays: 'x' as any }, base)).toEqual(base);
  });
  it('花名册里标了管理干部的人并进管理干部名单，标了非管理的移出', () => {
    const r2 = effectiveRules(rules, { roster: [{ name: '新任经理', dept: '', email: '', identity: '管理干部' }, { name: rules.managers[0], dept: '', email: '', identity: '非管理' }, { name: '普通员工', dept: '', email: '', identity: '' }] });
    expect(r2.managers).toContain('新任经理');
    expect(r2.managers).not.toContain(rules.managers[0]);
    expect(r2.managers).not.toContain('普通员工');
    expect(r2.managers).toHaveLength(11);
  });
});

describe('统计周期', () => {
  it('周报默认上周一到周日', () => {
    // 2026-10-13 是周二
    const p = defaultPeriod('weekly', T('2026-10-13T10:00:00'));
    expect([p.start, p.end]).toEqual([T('2026-10-05'), T('2026-10-12')]);
    expect(p.label).toBe('2026-10-05 ~ 2026-10-11');
    // 周一当天、周日当天
    expect(defaultPeriod('weekly', T('2026-10-12T00:30:00')).start).toBe(T('2026-10-05'));
    expect(defaultPeriod('weekly', T('2026-10-18T23:00:00')).start).toBe(T('2026-10-05'));
  });
  it('月报默认上个月，跨年也对', () => {
    const p = defaultPeriod('monthly', T('2026-10-13T10:00:00'));
    expect([p.start, p.end, p.label]).toEqual([T('2026-09-01'), T('2026-10-01'), '2026-09']);
    const jan = defaultPeriod('monthly', T('2027-01-05T10:00:00'));
    expect([jan.start, jan.end, jan.label]).toEqual([T('2026-12-01'), T('2027-01-01'), '2026-12']);
  });
  it('自定义周期：不是整月就写起止日期，结束不晚于开始时补成一天', () => {
    expect(makePeriod('monthly', T('2026-09-10'), T('2026-10-10'), T('2026-10-13')).label).toBe('2026-09-10 ~ 2026-10-09');
    const p = makePeriod('weekly', T('2026-10-05'), T('2026-10-05'), T('2026-10-13'));
    expect(p.end - p.start).toBe(86_400_000);
  });
});

describe('示例数据', () => {
  const now = T('2026-10-13T10:00:00');
  const files = writeDemo(dir, rules, now);
  const r = ingestAll({
    systems: {
      OA: { flow: spec(files.oaFlow, 'flow'), node: spec(files.oaNode, 'node') },
      费控: { flow: spec(files.fkFlow, 'flow'), node: spec(files.fkNode, 'node') },
      CSS: { flow: spec(files.css, 'flow') },
    },
    roster: spec(files.roster, 'roster'),
  });
  const eff = effectiveRules(rules, { roster: r.roster });
  const month: CalcOptions = { now, periodStart: T('2026-09-01'), periodEnd: T('2026-10-01'), roster: r.roster.map((x) => x.name), rosterDept: Object.fromEntries(r.roster.map((x) => [x.name, x.dept])) };
  const res = computeSla(r.flows, r.nodes, eff, month);

  it('规模：三个系统约 300 个流程、1500 行节点，写出来的都能读回去', () => {
    expect(files.flows).toBeGreaterThanOrEqual(280);
    expect(files.nodes).toBeGreaterThanOrEqual(1200);
    expect(r.flows).toHaveLength(files.flows);
    expect(r.nodes).toHaveLength(files.nodes);
    expect(r.summary.skipped).toEqual([]);
    expect(r.summary.systems.map((s) => s.system)).toEqual(['OA', '费控', 'CSS']);
    expect(r.summary.systems.every((s) => s.flows > 80 && s.done > 0 && s.running > 0)).toBe(true);
    expect(r.summary.systems[2].derived).toBe(true);
    expect(r.roster.length).toBe(rules.managers.length + 18);
    expect(r.summary.rosterWithEmail).toBe(r.roster.length);
  });
  it('覆盖到的情形：超时、临期、在途逾期、终止、金额两档、两种身份、对不上的流程名、未登记节点、花名册外的人', () => {
    expect(res.overall.doneCount).toBeGreaterThan(30);
    expect(res.overall.overtime).toBeGreaterThan(0);
    expect(res.overall.overtime).toBeLessThan(res.overall.judged);
    expect(res.overall.runningOverdue).toBeGreaterThan(3);
    expect(res.overall.runningRisk).toBeGreaterThan(0);
    expect(r.flows.some((f) => f.status === 'terminated')).toBe(true);
    expect(r.flows.some((f) => (f.amount ?? 0) > 100000)).toBe(true);
    expect(r.flows.some((f) => f.system === '费控' && (f.amount ?? 0) > 0 && (f.amount as number) <= 100000)).toBe(true);
    expect(new Set(res.reviews.map((x) => x.identity))).toEqual(new Set(['管理干部', '非管理干部']));
    expect(new Set(res.reviews.map((x) => x.system))).toEqual(new Set(['OA', '费控', 'CSS']));
    expect(res.reviews.some((x) => !x.compliant)).toBe(true);
    expect(res.unmatchedTypes.some((u) => u.system === 'CSS')).toBe(true);
    expect(res.unmatchedTypes.some((u) => u.system === 'OA')).toBe(true);
    expect(res.unknownNodes.length).toBeGreaterThan(0);
    expect(res.outOfRoster).toEqual(['外部审核员']);
    expect(res.byCategory.map((c) => c.category)).toEqual(expect.arrayContaining(['内部驱动型', '外部流转型', '常规流程']));
  });
  it('备用商 / 服务商两档时效都出现', () => {
    const limits = new Set(res.flows.filter((f) => f.flowType === '备用商、服务商引入').map((f) => f.limitDays));
    expect(limits.has(7)).toBe(true);
    expect(limits.has(72)).toBe(true);
  });
  it('同一时刻生成两次，数据相同', () => {
    const again = writeDemo(join(dir, 'again'), rules, now);
    expect([again.flows, again.nodes]).toEqual([files.flows, files.nodes]);
  });
});
