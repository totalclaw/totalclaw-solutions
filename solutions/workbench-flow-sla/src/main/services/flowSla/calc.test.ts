import { describe, expect, it } from 'vitest';
import rulesJson from './defaultRules.json';
import {
  analyzeNodes, compareWithPrevious, computeSla, followUpIntervalDays, personalLimit, resolveFlowType, similar,
  toSnapshot, workdaysBetween, yearOverdueRunning,
  type CalcOptions, type FlowRow, type NodeRow, type SlaRules,
} from './calc';

const rules = rulesJson as unknown as SlaRules;
const T = (s: string) => new Date(s.length === 10 ? `${s}T00:00:00` : s).getTime();
const OPT: CalcOptions = { now: T('2026-10-12T09:00:00'), periodStart: T('2026-10-05'), periodEnd: T('2026-10-12') };

function flow(p: Partial<FlowRow> & Pick<FlowRow, 'system' | 'flowNo' | 'flowName'>): FlowRow {
  return { initiator: '张三', status: 'done', startAt: T('2026-10-01'), endAt: T('2026-10-08'), ...p };
}
function node(p: Partial<NodeRow> & Pick<NodeRow, 'system' | 'flowNo' | 'flowName' | 'node'>): NodeRow {
  return { handler: '李四', startAt: T('2026-10-06'), endAt: T('2026-10-07'), ...p };
}

describe('规则表', () => {
  it('四张规则表都装进来了', () => {
    expect(rules.e2e).toHaveLength(35);
    expect(rules.cssNodes).toHaveLength(76);
    expect(rules.oaFkNodes).toHaveLength(669);
    expect(rules.personal).toHaveLength(31);
    expect(rules.managers).toHaveLength(11);
  });
});

describe('流程名对规则', () => {
  it('完全相同 / 包含 / 去后缀', () => {
    expect(similar('日常费用报销', '日常费用报销')).toBe(3);
    expect(similar('日常费用报销', '日常费用报销单')).toBe(2);
    expect(similar('小批量工程单', '小批量工程报单')).toBe(1);
    expect(similar('预付单', '领料申请单')).toBe(0);
  });

  it('费控日常费用报销 → 30 天', () => {
    const t = resolveFlowType(rules, { system: '费控', flowName: '日常费用报销' });
    expect(t).toMatchObject({ category: '内部驱动型', limitDays: 30, matched: true });
  });

  it('CSS 特殊费用核销按费用类型区分', () => {
    expect(resolveFlowType(rules, { system: 'CSS', flowName: '特殊费用核销申请', feeType: '安装维修费用核销' }).limitDays).toBe(10);
    expect(resolveFlowType(rules, { system: 'CSS', flowName: '特殊费用核销申请', feeType: '返厂核销' }).limitDays).toBe(60);
    expect(resolveFlowType(rules, { system: 'CSS', flowName: '特殊费用核销申请', feeType: '不返厂核销' }).flowType).toBe('特殊费用核销申请-不返厂核销');
  });

  it('CSS 名称差异：免考核申请 / 小批量工程报单 / 产品事故报告', () => {
    expect(resolveFlowType(rules, { system: 'CSS', flowName: '免考核申请' }).limitDays).toBe(11);
    expect(resolveFlowType(rules, { system: 'CSS', flowName: '小批量工程报单' }).limitDays).toBe(2);
    const acc = resolveFlowType(rules, { system: 'CSS', flowName: '产品事故报告' });
    expect(acc.matched).toBe(true);
    expect(acc.limitDays).toBeNull();
  });

  it('退换货申请不会被「社会化服务商退换货物流运输费申请」抢走', () => {
    expect(resolveFlowType(rules, { system: 'CSS', flowName: '退换货申请' }).limitDays).toBe(1.5);
    expect(resolveFlowType(rules, { system: 'CSS', flowName: '社会化服务商退换货物流运输费申请' }).limitDays).toBe(10);
  });

  it('SRM 核价两种叫法都能对上', () => {
    expect(resolveFlowType(rules, { system: 'OA', flowName: 'SRM核价(含预估核价）流程' }).limitDays).toBe(30);
    expect(resolveFlowType(rules, { system: 'OA', flowName: '核价（含预估核价）流程' }).limitDays).toBe(30);
  });

  it('备用商 7 天、服务商 72 天，看标题；分不清取 72', () => {
    expect(resolveFlowType(rules, { system: 'OA', flowName: '备用商、服务商引入', title: '关于引入备用商 XX 的申请' }).limitDays).toBe(7);
    expect(resolveFlowType(rules, { system: 'OA', flowName: '备用商、服务商引入', title: '服务商 YY 引入' }).limitDays).toBe(72);
    expect(resolveFlowType(rules, { system: 'OA', flowName: '备用商、服务商引入' }).limitDays).toBe(72);
  });

  it('规则表里没有的 OA 流程归常规流程，不判端到端', () => {
    const t = resolveFlowType(rules, { system: 'OA', flowName: '印章外借申请' });
    expect(t).toMatchObject({ category: '常规流程', limitDays: null, matched: false });
  });

  it('系统不对不匹配：OA 的规则不套到费控', () => {
    expect(resolveFlowType(rules, { system: '费控', flowName: '退款申请流程' }).matched).toBe(false);
  });
});

describe('工作日', () => {
  const none = new Set<string>();
  it('跨周末不计周六周日', () => {
    // 周五 12:00 → 周一 12:00 = 周五半天 + 周一半天
    expect(workdaysBetween(T('2026-10-09T12:00:00'), T('2026-10-12T12:00:00'), none, none)).toBeCloseTo(1, 6);
  });
  it('节假日不计，调休上班的周末计', () => {
    const hol = new Set(['2026-10-01', '2026-10-02']);
    const extra = new Set(['2026-10-10']);
    expect(workdaysBetween(T('2026-10-01'), T('2026-10-03'), hol, none)).toBe(0);
    expect(workdaysBetween(T('2026-10-10'), T('2026-10-11'), none, extra)).toBe(1);
  });
});

describe('端到端用时与判定', () => {
  it('OA / 费控：结束 − 开始', () => {
    const res = computeSla([
      flow({ system: '费控', flowNo: 'F1', flowName: '预付单', startAt: T('2026-09-25'), endAt: T('2026-10-08') }), // 13 天 > 10
      flow({ system: 'OA', flowNo: 'O1', flowName: '退款申请流程', startAt: T('2026-10-03'), endAt: T('2026-10-08') }), // 5 天 ≤ 7
    ], [], rules, OPT);
    const f1 = res.flows.find((f) => f.flowNo === 'F1')!;
    const o1 = res.flows.find((f) => f.flowNo === 'O1')!;
    expect(f1).toMatchObject({ days: 13, limitDays: 10, overtime: true, overdueDays: 3 });
    expect(o1).toMatchObject({ days: 5, overtime: false });
    expect(res.overall).toMatchObject({ doneCount: 2, judged: 2, overtime: 1, complianceRate: 0.5 });
  });

  it('CSS 非退换货：只累加内部节点', () => {
    const base = { system: 'CSS' as const, flowNo: 'C1', flowName: '免考核申请' };
    const res = computeSla([flow({ ...base, startAt: T('2026-09-20'), endAt: T('2026-10-08') })], [
      node({ ...base, node: '发起', handler: '网点', startAt: T('2026-09-20'), endAt: T('2026-09-28') }), // 外部，不计
      node({ ...base, node: '区域服务经理审批', startAt: T('2026-09-28'), endAt: T('2026-09-30') }), // 2
      node({ ...base, node: '服务质量管理专员查核', startAt: T('2026-10-05'), endAt: T('2026-10-08') }), // 3
    ], rules, OPT);
    expect(res.flows[0]).toMatchObject({ days: 5, limitDays: 11, overtime: false, approx: false });
  });

  it('CSS 退换货申请：只算末次审核', () => {
    const base = { system: 'CSS' as const, flowNo: 'C2', flowName: '退换货申请' };
    const res = computeSla([flow({ ...base, startAt: T('2026-10-01'), endAt: T('2026-10-08') })], [
      node({ ...base, node: '逆向物流岗审核', startAt: T('2026-10-02'), endAt: T('2026-10-05') }),
      node({ ...base, node: '逆向物流岗审核', startAt: T('2026-10-06'), endAt: T('2026-10-08') }),
    ], rules, OPT);
    expect(res.flows[0]).toMatchObject({ days: 2, limitDays: 1.5, overtime: true });
  });

  it('CSS 没有节点明细时用结束减开始并标记近似', () => {
    const res = computeSla([flow({ system: 'CSS', flowNo: 'C3', flowName: '质量报告单', startAt: T('2026-10-06'), endAt: T('2026-10-07') })], [], rules, OPT);
    expect(res.flows[0]).toMatchObject({ days: 1, approx: true, overtime: false });
  });

  it('单号去重；终止的流程不统计', () => {
    const f = flow({ system: '费控', flowNo: 'F1', flowName: '预付单' });
    const res = computeSla([f, { ...f }, flow({ system: '费控', flowNo: 'F2', flowName: '预付单', status: 'terminated' })], [], rules, OPT);
    expect(res.flows).toHaveLength(1);
  });

  it('只统计周期内办结的流程', () => {
    const res = computeSla([
      flow({ system: '费控', flowNo: 'F1', flowName: '预付单', endAt: T('2026-10-08') }),
      flow({ system: '费控', flowNo: 'F2', flowName: '预付单', endAt: T('2026-09-20') }),
    ], [], rules, OPT);
    expect(res.overall.doneCount).toBe(1);
  });
});

describe('在途：逾期与较大逾期风险', () => {
  it('在途时长 > 要求 → 已逾期；> 要求 × 0.8 → 较大逾期风险', () => {
    const mk = (no: string, start: string) => flow({ system: '费控', flowNo: no, flowName: '预付单', status: 'running', startAt: T(start), endAt: undefined });
    const res = computeSla([
      mk('A', '2026-09-30'), // 12.4 天 > 10
      mk('B', '2026-10-03T09:00:00'), // 9 天 > 8
      mk('C', '2026-10-08'), // 4.4 天
    ], [], rules, OPT);
    const by = Object.fromEntries(res.flows.map((f) => [f.flowNo, f.runningLabel]));
    expect(by).toEqual({ A: 'overdue', B: 'risk', C: 'normal' });
    expect(res.overall).toMatchObject({ runningCount: 3, runningOverdue: 1, runningRisk: 1 });
    expect(res.byType[0].runningOverdueRate).toBeCloseTo(1 / 3, 3);
  });

  it('当前节点停留时长取未结束的节点', () => {
    const base = { system: 'OA' as const, flowNo: 'O9', flowName: '服务商变更' };
    const res = computeSla([flow({ ...base, status: 'running', startAt: T('2026-10-01'), endAt: undefined })], [
      node({ ...base, node: '起草节点', startAt: T('2026-10-01'), endAt: T('2026-10-02') }),
      node({ ...base, node: '部门负责人', handler: '王五', startAt: T('2026-10-09T09:00:00'), endAt: undefined }),
    ], rules, OPT);
    expect(res.flows[0]).toMatchObject({ currentNode: '部门负责人', currentHandler: '王五', currentNodeDays: 3 });
  });

  it('本年度发起且已超时的在途清单', () => {
    const res = computeSla([
      flow({ system: '费控', flowNo: 'A', flowName: '预付单', status: 'running', startAt: T('2026-09-01'), endAt: undefined }),
      flow({ system: '费控', flowNo: 'B', flowName: '预付单', status: 'running', startAt: T('2025-12-01'), endAt: undefined }),
    ], [], rules, OPT);
    expect(yearOverdueRunning(res, OPT.now).map((f) => f.flowNo)).toEqual(['A']);
  });
});

describe('个人审核', () => {
  it('管理干部：金额 10 万以内 2 天、以上 3 天；对不上规则按常规 2 天', () => {
    const t = resolveFlowType(rules, { system: '费控', flowName: '预算内调整' });
    expect(personalLimit(rules, '管理干部', t, 50000)).toBe(2);
    expect(personalLimit(rules, '管理干部', t, 200000)).toBe(3);
    expect(personalLimit(rules, '管理干部', resolveFlowType(rules, { system: 'OA', flowName: '印章外借申请' }))).toBe(2);
    expect(personalLimit(rules, '管理干部', resolveFlowType(rules, { system: 'OA', flowName: '合同线上审查流程' }))).toBe(3);
  });

  it('非管理干部内部节点统一 3 天', () => {
    expect(personalLimit(rules, '非管理干部', resolveFlowType(rules, { system: '费控', flowName: '预付单' }))).toBe(3);
  });

  it('OA 外部节点不统计，内部节点按自然日', () => {
    const base = { system: 'OA' as const, flowNo: 'O1', flowName: '备用商、服务商引入' };
    const res = computeSla([flow({ ...base })], [
      node({ ...base, node: '起草节点', handler: '张三' }),
      node({ ...base, node: '提交合同线上流程', handler: '张三' }), // 外部
      node({ ...base, node: '服务商管理组负责人', handler: '李四', startAt: T('2026-10-05'), endAt: T('2026-10-09') }), // 4 天 > 3
      node({ ...base, node: '用户服务中心总经理', handler: '孙立东', startAt: T('2026-10-09'), endAt: T('2026-10-10T12:00:00') }), // 1.5 天 ≤ 2
    ], rules, OPT);
    expect(res.reviews.map((r) => [r.handler, r.identity, r.days, r.limit, r.compliant])).toEqual([
      ['李四', '非管理干部', 4, 3, false],
      ['孙立东', '管理干部', 1.5, 2, true],
    ]);
  });

  it('CSS 按工作日并用节点自己的要求', () => {
    const base = { system: 'CSS' as const, flowNo: 'C1', flowName: '免考核申请' };
    const res = computeSla([flow({ ...base })], [
      // 周五 → 下周二：周五、周一两个工作日，要求 2 → 合规
      node({ ...base, node: '区域服务经理审批', handler: '李四', startAt: T('2026-10-02'), endAt: T('2026-10-06') }),
      // 周二 → 周五：3 个工作日，要求 1 → 不合规
      node({ ...base, node: '区域管理部经理会签', handler: '王五', startAt: T('2026-10-06'), endAt: T('2026-10-09') }),
    ], rules, OPT);
    expect(res.reviews.map((r) => [r.handler, r.days, r.unit, r.limit, r.compliant])).toEqual([
      ['李四', 2, '工作日', 2, true],
      ['王五', 3, '工作日', 1, false],
    ]);
  });

  it('没登记内外部属性的节点默认不计并列出；改成按内部计则统计', () => {
    const base = { system: 'OA' as const, flowNo: 'O2', flowName: '服务商变更' };
    const nodes = [node({ ...base, node: '某个新加的节点' })];
    const a = computeSla([flow({ ...base })], nodes, rules, OPT);
    expect(a.reviews).toHaveLength(0);
    expect(a.unknownNodes).toEqual([{ system: 'OA', flowName: '服务商变更', node: '某个新加的节点', count: 1 }]);
    const b = computeSla([flow({ ...base })], nodes, rules, { ...OPT, unknownNodePolicy: 'internal' });
    expect(b.reviews).toHaveLength(1);
  });

  it('给了花名册就只统计名单内的人，名单外的列出', () => {
    const base = { system: '费控' as const, flowNo: 'F1', flowName: '预付单' };
    const res = computeSla([flow({ ...base })], [
      node({ ...base, node: 'N1', handler: '李四' }), node({ ...base, node: 'N2', handler: '外部门赵六' }),
    ], rules, { ...OPT, roster: ['李四'], unknownNodePolicy: 'internal' });
    expect(res.reviews.map((r) => r.handler)).toEqual(['李四']);
    expect(res.outOfRoster).toEqual(['外部门赵六']);
  });

  it('只统计周期内审完的节点', () => {
    const base = { system: '费控' as const, flowNo: 'F1', flowName: '预付单' };
    const res = computeSla([flow({ ...base })], [
      node({ ...base, node: 'N1', endAt: T('2026-09-30'), startAt: T('2026-09-29') }),
      node({ ...base, node: 'N2' }),
    ], rules, { ...OPT, unknownNodePolicy: 'internal' });
    expect(res.reviews).toHaveLength(1);
  });
});

describe('排名', () => {
  it('审核人按合规率排名，同率同名次', () => {
    const base = { system: '费控' as const, flowNo: 'F1', flowName: '预付单' };
    const mk = (handler: string, days: number, i: number) => node({ ...base, node: `N${i}`, handler, startAt: T('2026-10-06'), endAt: T('2026-10-06') + days * 86_400_000 });
    const res = computeSla([flow({ ...base })], [
      mk('甲', 1, 1), mk('甲', 1, 2), mk('乙', 1, 3), mk('乙', 5, 4), mk('丙', 2, 5),
    ], rules, { ...OPT, unknownNodePolicy: 'internal' });
    expect(res.reviewerRank.map((p) => [p.name, p.rate, p.rank])).toEqual([['甲', 1, 1], ['丙', 1, 1], ['乙', 0.5, 3]]);
  });

  it('发起人按端到端合规率排名', () => {
    const res = computeSla([
      flow({ system: '费控', flowNo: 'A', flowName: '预付单', initiator: '甲', startAt: T('2026-10-01'), endAt: T('2026-10-08') }),
      flow({ system: '费控', flowNo: 'B', flowName: '预付单', initiator: '乙', startAt: T('2026-09-20'), endAt: T('2026-10-08') }),
    ], [], rules, OPT);
    expect(res.initiatorRank.map((p) => [p.name, p.rate])).toEqual([['甲', 1], ['乙', 0]]);
  });
});

describe('环比与异常流程类型', () => {
  const run = (days: number[]) => computeSla(days.map((d, i) => flow({
    system: '费控', flowNo: `F${i}`, flowName: '日常费用报销', endAt: T('2026-10-08'), startAt: T('2026-10-08') - d * 86_400_000,
  })), [], rules, OPT);

  it('平均用时环比增加超过 3 天 → 异常', () => {
    const prev = toSnapshot('上周', OPT, run([10, 10]));
    const cmp = compareWithPrevious(run([14, 14]), prev, rules)[0];
    expect(cmp).toMatchObject({ avgDays: 14, prevAvgDays: 10, avgDelta: 4, abnormal: true });
    expect(cmp.reasons[0]).toContain('环比增加 4 天');
  });

  it('刚好增加 3 天不算异常', () => {
    const prev = toSnapshot('上周', OPT, run([10]));
    expect(compareWithPrevious(run([13]), prev, rules)[0].abnormal).toBe(false);
  });

  it('合规率低于 95% → 异常；没有上期数据也能判', () => {
    const cmp = compareWithPrevious(run([10, 40]), null, rules)[0];
    expect(cmp).toMatchObject({ complianceRate: 0.5, prevAvgDays: null, avgDelta: null, abnormal: true });
  });
});

describe('节点分析与跟进频次', () => {
  it('定位平均耗时最长的节点，并算等待时长和在途停留', () => {
    const base = { system: 'OA' as const, flowName: '服务商变更' };
    const flows = [
      flow({ ...base, flowNo: 'A' }),
      flow({ ...base, flowNo: 'B', status: 'running', endAt: undefined }),
    ];
    const nodes = [
      node({ ...base, flowNo: 'A', node: '起草节点', startAt: T('2026-10-01'), endAt: T('2026-10-02') }),
      node({ ...base, flowNo: 'A', node: '部门负责人', startAt: T('2026-10-03'), endAt: T('2026-10-07') }),
      node({ ...base, flowNo: 'B', node: '部门负责人', startAt: T('2026-10-10T09:00:00'), endAt: undefined }),
    ];
    const res = computeSla(flows, nodes, rules, OPT);
    const an = analyzeNodes('服务商变更', 'OA', res, nodes, rules, OPT);
    expect(an.longestNode).toBe('部门负责人');
    expect(an.nodes[0]).toMatchObject({ node: '部门负责人', avgDays: 4, avgWaitDays: 1, share: 0.8, stuckCount: 1, avgStuckDays: 2 });
  });

  it('内部流程 3 天、外部流程 7 天跟进一次', () => {
    expect(followUpIntervalDays('内部驱动型', rules)).toBe(3);
    expect(followUpIntervalDays('外部流转型', rules)).toBe(7);
    expect(followUpIntervalDays('常规流程', rules)).toBe(3);
  });
});
