import { describe, expect, it } from 'vitest';
import { FS_REASON_CATEGORIES, type FsCase, type FsPeriod } from '@totalclaw/ipc-contracts';
import rulesJson from './defaultRules.json';
import { computeSla, type CalcOptions, type FlowRow, type NodeRow, type SlaRules } from './calc';
import {
  acceptModelClassification, buildCases, categoryCounts, categoryLabel, classifyByRule, defaultRootCause, guardNumbers, numbersIn, ownerMails,
  readReasonRows, reasonSheet, reasonSheetHeaders,
} from './reasons';
import { reasonClassifyPrompt, summaryPrompt } from './prompts';

const rules = rulesJson as unknown as SlaRules;
const T = (s: string) => new Date(s.length === 10 ? `${s}T00:00:00` : s).getTime();
const OPT: CalcOptions = { now: T('2026-10-12T09:00:00'), periodStart: T('2026-10-05'), periodEnd: T('2026-10-12') };
const period: FsPeriod = { kind: 'weekly', start: OPT.periodStart, end: OPT.periodEnd, asOf: OPT.now, label: '2026-10-05 ~ 2026-10-11' };

const flows: FlowRow[] = [
  // 办结超时，有一次超时审核 → 找审核人
  { system: 'OA', flowNo: 'O1', flowName: '退款申请流程', title: '退款-甲', initiator: '张三', status: 'done', startAt: T('2026-09-20'), endAt: T('2026-10-08') },
  // 办结超时，没有节点 → 找发起人
  { system: '费控', flowNo: 'F1', flowName: '预付单', initiator: '李四', status: 'done', startAt: T('2026-09-20'), endAt: T('2026-10-07') },
  // 在途逾期 → 找当前处理人
  { system: 'OA', flowNo: 'O2', flowName: '退款申请流程', initiator: '张三', status: 'running', startAt: T('2026-09-20'), currentNode: '出纳付款', currentHandler: '王五' },
  // 办结不超时、在途正常 → 不进名单
  { system: 'OA', flowNo: 'O3', flowName: '退款申请流程', initiator: '张三', status: 'done', startAt: T('2026-10-05'), endAt: T('2026-10-08') },
  { system: 'OA', flowNo: 'O4', flowName: '退款申请流程', initiator: '张三', status: 'running', startAt: T('2026-10-11') },
];
const nodes: NodeRow[] = [
  { system: 'OA', flowNo: 'O1', flowName: '退款申请流程', node: '部门负责人', handler: '赵六', startAt: T('2026-09-21'), endAt: T('2026-10-06') },
  { system: 'OA', flowNo: 'O1', flowName: '退款申请流程', node: '一级部门负责人', handler: '钱七', startAt: T('2026-10-06'), endAt: T('2026-10-07') },
];
const res = computeSla(flows, nodes, rules, OPT);
const roster = [{ name: '赵六', dept: '甲部', email: 'zhao@example.com', identity: '' }, { name: '王五', dept: '乙部', email: 'wang@example.com', identity: '' }];

describe('原因类别', () => {
  it('七类都有名字和通用根因', () => {
    expect(FS_REASON_CATEGORIES).toHaveLength(7);
    for (const id of FS_REASON_CATEGORIES) { expect(categoryLabel(id).length).toBeGreaterThan(1); expect(defaultRootCause(id).length).toBeGreaterThan(10); }
    expect(categoryLabel('materials')).toBe('资料不全退回');
    expect(categoryLabel('')).toBe('未归类');
  });
  it('按关键字归类', () => {
    expect(classifyByRule('发票附件不全被退回，补充资料后重新提交')).toBe('materials');
    expect(classifyByRule('审批人出差一周，无人代审')).toBe('absence');
    expect(classifyByRule('需要财务和法务会签，沟通协调了三轮')).toBe('cross_dept');
    expect(classifyByRule('服务商一直未反馈，合同未盖章寄回')).toBe('external');
    expect(classifyByRule('系统故障无法提交，后来又没收到待办提醒')).toBe('system');
    expect(classifyByRule('审批层级太多，重复审批')).toBe('design');
    expect(classifyByRule('个人原因')).toBe('other');
    expect(classifyByRule('')).toBe('other');
  });
});

describe('找责任人', () => {
  const cases = buildCases(res, roster);
  it('只收办结超时和在途逾期的', () => {
    expect(cases.map((c) => c.key).sort()).toEqual(['OA|O1', 'OA|O2', '费控|F1']);
  });
  it('在途找当前处理人，办结找超时最多的审核人，没有就找发起人', () => {
    const by = Object.fromEntries(cases.map((c) => [c.key, c]));
    expect(by['OA|O2']).toMatchObject({ kind: 'running', owner: '王五', ownerRole: 'handler', ownerEmail: 'wang@example.com', currentNode: '出纳付款' });
    expect(by['OA|O1']).toMatchObject({ kind: 'overtime', owner: '赵六', ownerRole: 'reviewer', ownerEmail: 'zhao@example.com' });
    expect(by['费控|F1']).toMatchObject({ kind: 'overtime', owner: '李四', ownerRole: 'initiator', ownerEmail: '' });
    // 数字原样取自计算结果
    const f = res.flows.find((x) => x.flowNo === 'O1')!;
    expect(by['OA|O1']).toMatchObject({ days: f.days, limitDays: f.limitDays, overdueDays: f.overdueDays });
  });
  it('重算时保留已经填的原因、归类和发信时间', () => {
    const old: FsCase[] = cases.map((c) => (c.key === 'OA|O1' ? { ...c, reason: '出差', categoryId: 'absence', classifiedBy: 'manual', mailedAt: '2026-10-12T01:00:00.000Z' } : c));
    const again = buildCases(res, roster, old).find((c) => c.key === 'OA|O1')!;
    expect(again).toMatchObject({ reason: '出差', categoryId: 'absence', classifiedBy: 'manual', mailedAt: '2026-10-12T01:00:00.000Z' });
  });
});

describe('收集邮件与回填', () => {
  const cases = buildCases(res, roster);
  it('一位责任人一封，正文列出他名下的流程和计算出的天数', () => {
    const mails = ownerMails(cases, period, '流程管理组');
    expect(mails.map((m) => m.owner).sort()).toEqual(['李四', '王五', '赵六']);
    const zhao = mails.find((m) => m.owner === '赵六')!;
    const c = cases.find((x) => x.key === 'OA|O1')!;
    expect(zhao.email).toBe('zhao@example.com');
    expect(zhao.subject).toContain('2026-10-05 ~ 2026-10-11');
    expect(zhao.body).toContain('O1');
    expect(zhao.body).toContain(`已用 ${c.days} 天`);
    expect(zhao.body).toContain(`超出 ${c.overdueDays} 天`);
    expect(zhao.body).toContain('流程管理组');
    expect(mails.find((m) => m.owner === '李四')!.email).toBe('');
  });
  it('收集表导出去、填好再读回来', () => {
    const sheet = reasonSheet(cases);
    expect(sheet.headers).toEqual(reasonSheetHeaders());
    const rows = sheet.rows.map((r) => Object.fromEntries(sheet.headers.map((h, i) => [h, String(r[i] ?? '')])));
    rows[0]['超时原因'] = '资料不全被退回';
    rows.push({ ...rows[0], 单号: '不存在的单号' });
    const back = readReasonRows(sheet.headers, rows, cases);
    expect(back.noColumn).toBe(false);
    expect(back.filled).toEqual([{ key: `${rows[0]['系统']}|${rows[0]['单号']}`, reason: '资料不全被退回' }]);
    expect(back.unmatched).toBe(1);
  });
  it('别人自己做的表：只有单号和原因两列也能对上；缺列会说', () => {
    expect(readReasonRows(['流程编号', '原因说明'], [{ 流程编号: 'F1', 原因说明: '服务商未反馈' }], cases).filled).toEqual([{ key: '费控|F1', reason: '服务商未反馈' }]);
    expect(readReasonRows(['姓名'], [{ 姓名: 'x' }], cases).noColumn).toBe(true);
  });
});

describe('模型输出的核对', () => {
  it('取数字：去千分位和百分号', () => {
    expect(numbersIn('合规率 92.50%，共 1,234 单，用时 3.0 天')).toEqual(['92.5', '1234', '3']);
  });
  it('句子里出现材料里没有的数字，整句丢掉；序号不算数字', () => {
    const source = '办结 120 单，合规率 92.5%，平均用时 6.3 天';
    const g = guardNumbers('1. 本期办结 120 单，合规率 92.5%。\n2. 合规率较上期提升 3 个百分点。\n3. 平均用时 6.3 天；预计下月降到 5 天。', source);
    expect(g.text).toBe('1. 本期办结 120 单，合规率 92.5%。\n3. 平均用时 6.3 天；');
    expect(g.dropped).toBe(2);
  });
  it('没有数字的句子原样保留', () => {
    expect(guardNumbers('审批人不在岗时没有代理人。', '').text).toBe('审批人不在岗时没有代理人。');
  });
  it('类别不在名单里、单号不是给它的，都不收', () => {
    const cases = buildCases(res, roster).map((c) => ({ ...c, reason: c.key === 'OA|O1' ? '出差 5 天' : c.key === 'OA|O2' ? '服务商未反馈' : '' }));
    const out = acceptModelClassification({
      items: [
        { key: 'OA|O1', category: 'absence' },
        { key: 'OA|O2', category: '外部原因' },
        { key: 'OA|O999', category: 'other' },
        { key: '费控|F1', category: 'other' },
      ],
      rootCauses: { absence: '审批人出差 5 天期间没有代理人。', external: '平均等待 9 天。', bogus: 'x', design: 123 },
    }, cases);
    expect(out.categories).toEqual({ 'OA|O1': 'absence' });
    expect(out.rootCauses).toEqual({ absence: '审批人出差 5 天期间没有代理人。' });
    expect(out.rejected).toBe(6);
  });
  it('模型回了不成形的东西也不会抛错', () => {
    expect(acceptModelClassification(null, []).categories).toEqual({});
    expect(acceptModelClassification('乱七八糟', []).rejected).toBe(0);
  });
  it('各类数量只数填了原因的', () => {
    const cases = buildCases(res, roster).map((c, i) => ({ ...c, reason: i < 2 ? '有原因' : '', categoryId: 'absence' as const }));
    expect(categoryCounts(cases)).toEqual([{ id: 'absence', count: 2 }]);
  });
});

describe('提示词', () => {
  it('归类提示词带上全部类别 id 和每条的 key', () => {
    const cases = buildCases(res, roster).map((c) => ({ ...c, reason: '出差' }));
    const p = reasonClassifyPrompt(cases);
    for (const id of FS_REASON_CATEGORIES) expect(p).toContain(id);
    for (const c of cases) expect(p).toContain(c.key);
  });
  it('总结提示词只给事实，并要求不许算数', () => {
    const p = summaryPrompt('monthly', ['办结 120 单'], { depts: ['甲部'], people: ['赵六'] });
    expect(p).toContain('- 办结 120 单');
    expect(p).toContain('do not compute');
    expect(p).toContain('甲部');
  });
});
