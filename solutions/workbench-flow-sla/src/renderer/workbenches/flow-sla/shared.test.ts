// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  countRecipients, daysLeft, defaultPeriodForm, flowStateClass, flowStateLabel, fmtDays, fmtPoints, fmtRate, fmtSigned, formFromPeriod, fromDateInput, fs,
  missingRoles, onFsEvent, periodFromForm, reasonCategoryLabel, roleDefs, toDateInput,
} from './shared';

const T = (s: string) => new Date(s.length === 10 ? `${s}T00:00:00` : s).getTime();
afterEach(() => { delete (window as any).electronAPI; });

describe('动作调用', () => {
  it('出参先剥成普通对象再过桥；桥不在时报人话', async () => {
    await expect(fs('state.get')).rejects.toThrow('流程时效监控接口不可用');
    const invoke = vi.fn(async (_a: string, p: any) => p);
    (window as any).electronAPI = { workbenches: { flowSla: { invoke, onEvent: (cb: any) => { cb({ type: 'state' }); return () => 'off'; } } } };
    const { reactive } = await import('vue');
    const payload = reactive({ a: { b: [1, 2] }, c: undefined });
    await fs('x', payload);
    const sent = invoke.mock.calls[0][1];
    expect(sent).toEqual({ a: { b: [1, 2] } });
    expect(sent).not.toBe(payload);
    const seen: string[] = [];
    const off = onFsEvent((ev) => seen.push(ev.type));
    expect(seen).toEqual(['state']);
    expect(off()).toBe('off');
  });
});

describe('格式', () => {
  it('比例、天数、变化量', () => {
    expect(fmtRate(0.9234)).toBe('92.3%');
    expect(fmtRate(null)).toBe('-');
    expect(fmtDays(6.256)).toBe('6.26');
    expect(fmtDays(undefined)).toBe('-');
    expect(fmtSigned(1.5)).toBe('+1.5');
    expect(fmtSigned(-2)).toBe('-2');
    expect(fmtSigned(0)).toBe('0');
    expect(fmtPoints(0.0312)).toBe('+3.1');
    expect(fmtPoints(-0.05)).toBe('-5.0');
    expect(fmtPoints(null)).toBe('-');
  });
  it('日期输入框的值和本地零点互转', () => {
    expect(toDateInput(T('2026-10-05T23:59:00'))).toBe('2026-10-05');
    expect(fromDateInput('2026-10-05')).toBe(T('2026-10-05'));
    expect(Number.isNaN(fromDateInput('2026/10/05'))).toBe(true);
  });
});

describe('统计周期', () => {
  const now = T('2026-10-13T10:00:00'); // 周二
  it('周报默认上周一到周日，月报默认上个月', () => {
    expect(defaultPeriodForm('weekly', now)).toEqual({ kind: 'weekly', start: '2026-10-05', lastDay: '2026-10-11', asOf: '2026-10-13' });
    expect(defaultPeriodForm('monthly', now)).toEqual({ kind: 'monthly', start: '2026-09-01', lastDay: '2026-09-30', asOf: '2026-10-13' });
    expect(defaultPeriodForm('weekly', T('2026-10-12T00:10:00')).start).toBe('2026-10-05');
    expect(defaultPeriodForm('monthly', T('2027-01-03T00:10:00'))).toMatchObject({ start: '2026-12-01', lastDay: '2026-12-31' });
  });
  it('表单 → 周期：结束是最后一天的次日零点；数据截至不超过现在', () => {
    const p = periodFromForm({ kind: 'weekly', start: '2026-10-05', lastDay: '2026-10-11', asOf: '2026-10-13' }, now);
    expect([p.start, p.end, p.asOf]).toEqual([T('2026-10-05'), T('2026-10-12'), now]);
    expect(periodFromForm({ kind: 'weekly', start: '2026-10-05', lastDay: '2026-10-11', asOf: '2026-10-12' }, now).asOf).toBe(T('2026-10-12T23:59:59'));
    expect(() => periodFromForm({ kind: 'weekly', start: '2026-10-11', lastDay: '2026-10-05', asOf: '' }, now)).toThrow('结束日期不能早于开始日期');
    expect(() => periodFromForm({ kind: 'weekly', start: '', lastDay: '2026-10-05', asOf: '' }, now)).toThrow('起止日期');
  });
  it('周期 → 表单 来回不走样', () => {
    const f = { kind: 'monthly' as const, start: '2026-09-01', lastDay: '2026-09-30', asOf: '2026-10-12' };
    expect(formFromPeriod(periodFromForm(f, now))).toEqual(f);
  });
});

describe('列角色', () => {
  const req = (slot: any, mapping: Record<string, string>, has: boolean) => roleDefs(slot, mapping, has).filter((r) => r.required).map((r) => r.key).sort();
  it('流程表：单号、流程名称、开始时间必填', () => {
    expect(req('flow', {}, false)).toEqual(['flowName', 'flowNo', 'startAt']);
    expect(missingRoles('flow', { flowNo: 'a', flowName: 'b' }, false)).toEqual(['startAt']);
  });
  it('节点级的表：单号、节点、处理人、到达时间必填；没有流程表时还要流程名称', () => {
    expect(req('node', {}, true)).toEqual(['flowNo', 'handler', 'node', 'nodeStart']);
    expect(req('node', {}, false)).toEqual(['flowName', 'flowNo', 'handler', 'node', 'nodeStart']);
    // 放在流程表位置上的合并表
    expect(req('flow', { node: '审批节点名', nodeStart: '开始时间' }, false)).toEqual(['flowName', 'flowNo', 'handler', 'node', 'nodeStart']);
  });
  it('花名册只有姓名必填；每个角色都有中文名', () => {
    expect(req('roster', {}, false)).toEqual(['name']);
    for (const r of [...roleDefs('flow', {}, false), ...roleDefs('roster', {}, false)]) expect(r.label).not.toBe(r.key);
  });
});

describe('标签', () => {
  it('流程状态', () => {
    expect(flowStateLabel({ status: 'done', overtime: true, runningLabel: null })).toBe('办结超时');
    expect(flowStateLabel({ status: 'done', overtime: false, runningLabel: null })).toBe('办结合规');
    expect(flowStateLabel({ status: 'done', overtime: null, runningLabel: null })).toBe('办结（无时效要求）');
    expect(flowStateLabel({ status: 'running', overtime: null, runningLabel: 'overdue' })).toBe('在途已逾期');
    expect(flowStateLabel({ status: 'running', overtime: null, runningLabel: 'risk' })).toBe('较大逾期风险');
    expect(flowStateClass({ status: 'running', overtime: null, runningLabel: 'overdue' })).toBe('bad');
    expect(flowStateClass({ status: 'running', overtime: null, runningLabel: 'risk' })).toBe('warn');
    expect(flowStateClass({ status: 'done', overtime: false, runningLabel: null })).toBe('ok');
  });
  it('原因类别', () => {
    expect(reasonCategoryLabel('cross_dept')).toBe('跨部门沟通等待');
    expect(reasonCategoryLabel('')).toBe('未归类');
  });
});

describe('期限与收件人', () => {
  it('距期限几天', () => {
    const now = T('2026-10-24T15:00:00');
    expect(daysLeft('2026-10-31', now)).toBe(7);
    expect(daysLeft('2026-10-24', now)).toBe(0);
    expect(daysLeft('2026-10-20', now)).toBe(-4);
    expect(daysLeft('', now)).toBeNull();
  });
  it('收件人：去重计数，挑出写错的', () => {
    expect(countRecipients('a@example.com; b@example.com\na@example.com')).toEqual({ ok: 2, bad: [] });
    expect(countRecipients('a@example.com，张三, b@')).toEqual({ ok: 1, bad: ['张三', 'b@'] });
    expect(countRecipients('  ')).toEqual({ ok: 0, bad: [] });
  });
});
