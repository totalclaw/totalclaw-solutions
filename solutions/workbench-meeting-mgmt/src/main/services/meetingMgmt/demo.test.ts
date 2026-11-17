/**
 * 会议智能管理 · 演示组织与演示数据：和原型同名、数据自洽（任务都下发给部门第一负责人、成员齐全），
 * 演示文字记录能按昵称认出发言人。
 */
import { describe, expect, it } from 'vitest';
import type { MmMeetingStatus } from '../../../shared/meetingMgmt/types';
import { DEMO_ADMIN_ID, DEMO_TRANSCRIPT, buildDemoData, buildDemoOrg } from './demo';
import { firstLeader } from './rules';
import { parseTranscriptText } from './pipeline/transcriptParse';

const NOW = new Date(2026, 10, 16, 10, 0, 0).getTime();

describe('演示组织', () => {
  it('6 个部门各有负责人，20 人，和原型同名', () => {
    const org = buildDemoOrg();
    expect(org.depts.map((d) => d.name)).toEqual(['运营中心', '研发部', '质量部', '采购部', '生产部', '工艺部']);
    expect(org.people).toHaveLength(20);
    const byName = (n: string) => org.people.find((p) => p.name === n)!;
    expect(byName('林晓').id).toBe(DEMO_ADMIN_ID);
    for (const [name, dept] of [['李娜', '运营中心'], ['赵磊', '研发部'], ['孙浩', '质量部'], ['周婷', '采购部'], ['吴刚', '生产部'], ['郑凯', '工艺部'], ['何静', '采购部'], ['钱程', '研发部']]) {
      expect(org.depts.find((d) => d.id === byName(name).deptId)?.name, name).toBe(dept);
    }
    const o = { ...org, source: 'demo' as const };
    expect(firstLeader(o, 'd_pur')?.name).toBe('周婷');
    expect(firstLeader(o, 'd_prod')?.name).toBe('吴刚');
    expect(firstLeader(o, 'd_proc')?.name).toBe('郑凯');
    for (const d of org.depts) expect(org.people.some((p) => p.id === d.leaderIds[0])).toBe(true);
  });
});

describe('演示数据', () => {
  const data = buildDemoData(NOW);
  const org = { ...buildDemoOrg(), source: 'demo' as const };

  it('三个项目、负责人和原型一致', () => {
    expect(data.projects.map((p) => [p.name, org.people.find((x) => x.id === p.ownerId)?.name])).toEqual([
      ['数字化工厂一期', '林晓'], ['A2 量产导入项目', '陈立峰'], ['华东生产基地扩产', '吴刚'],
    ]);
  });

  it('会议覆盖各状态；待终审的「数字化工厂周例会」三个议题、4 条决议、全员已确认', () => {
    const statuses = new Set(data.meetings.map((m) => m.status));
    for (const s of ['pending_upload', 'pending_assign', 'pending_confirm', 'pending_review', 'finalized', 'ended', 'pending_owner', 'plan_confirm', 'dispatched'] as MmMeetingStatus[]) {
      expect(statuses.has(s), s).toBe(true);
    }
    const w = data.meetings.find((m) => m.title === '数字化工厂周例会')!;
    expect(w.status).toBe('pending_review');
    expect(w.hostId).toBe('linxiao');
    expect(w.topics.map((t) => t.title)).toEqual(['MES 二期上线范围', '设备采购与到货', '培训与上线切换']);
    expect(w.decisions).toHaveLength(4);
    expect(w.summaryLines).toHaveLength(3);
    expect(w.confirmations.length).toBeGreaterThan(3);
    expect(w.confirmations.every((c) => c.status === 'confirmed')).toBe(true);
    for (const seg of w.segments) expect(w.speakers.some((s) => s.label === seg.speakerLabel)).toBe(true);
    const assign = data.meetings.find((m) => m.status === 'pending_assign')!;
    expect(assign.speakers.some((s) => !s.personId)).toBe(true);
  });

  it('任务覆盖待接收 / 进行中 / 逾期 / 待复核 / 待裁决；「主控芯片到货跟踪」周婷与刘洋就 12-15 / 12-20 分歧', () => {
    const statuses = new Set(data.tasks.map((t) => t.status));
    for (const s of ['to_accept', 'not_started', 'in_progress', 'done']) expect(statuses.has(s as any), s).toBe(true);
    const chip = data.tasks.find((t) => t.title === '主控芯片到货跟踪')!;
    expect(chip).toMatchObject({ assigneeId: 'zhouting', ownerId: 'liuyang', due: '2026-12-15' });
    expect(chip.objection).toMatchObject({ stage: 'arbitration', suggestedDue: '2026-12-20', raisedBy: 'zhouting', review: { by: 'liuyang', decision: 'reject' } });
    expect(data.tasks.some((t) => t.objection?.stage === 'review')).toBe(true);
    expect(data.tasks.some((t) => t.status === 'in_progress' && t.due < '2026-11-16')).toBe(true);
  });

  it('自洽：任务下发给部门第一负责人、任务负责人 = 方案负责人、相关人都是项目成员', () => {
    for (const t of data.tasks) {
      const m = data.meetings.find((x) => x.id === t.meetingId)!;
      expect(m.status).toBe('dispatched');
      expect(m.taskIds).toContain(t.id);
      expect(t.assigneeId).toBe(firstLeader(org, t.deptId)?.id);
      expect(t.ownerId).toBe(m.plan?.ownerId);
    }
    for (const p of data.projects) {
      const ms = data.meetings.filter((m) => m.projectId === p.id);
      for (const m of ms) for (const id of [m.hostId, ...m.attendeeIds]) expect(p.memberIds, `${p.name}/${id}`).toContain(id);
      for (const t of data.tasks.filter((x) => x.projectId === p.id)) expect(p.memberIds).toEqual(expect.arrayContaining([t.assigneeId, t.ownerId]));
    }
    for (const n of data.notices) expect(org.people.some((p) => p.id === n.to)).toBe(true);
  });

  it('跨年时芯片截止日用下一年的 12-15', () => {
    const late = buildDemoData(new Date(2026, 11, 20).getTime());
    expect(late.tasks.find((t) => t.title === '主控芯片到货跟踪')!.due).toBe('2027-12-15');
  });
});

describe('演示文字记录', () => {
  it('按昵称认出 4 位发言人（选林晓、周婷、吴刚、郑凯为参会人）', () => {
    const org = buildDemoOrg();
    const attendees = org.people.filter((p) => ['linxiao', 'zhouting', 'wugang', 'zhengkai'].includes(p.id));
    const r = parseTranscriptText(DEMO_TRANSCRIPT, '.txt', { attendees });
    expect(r.speakers.map((s) => s.personId).sort()).toEqual(['linxiao', 'wugang', 'zhengkai', 'zhouting']);
    expect(r.segments.length).toBeGreaterThanOrEqual(6);
    expect(r.segments[0].text).toContain('华东基地');
  });
});
