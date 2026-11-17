import { describe, expect, it } from 'vitest';
import type { MmMeeting, MmOrg, MmProject } from '../../../../shared/meetingMgmt/types';
import { deptsMentioned, dueFromText, generatePlan, resolveDepts } from './plan';

const org: MmOrg = {
  source: 'demo',
  depts: [
    { id: 'd-rd', name: '研发部', leaderIds: ['u2'] },
    { id: 'd-qa', name: '测试部', leaderIds: ['u3'] },
    { id: 'd-mk', name: '市场中心', leaderIds: ['u4'] },
    { id: 'd-pm', name: '项目管理部', leaderIds: ['u1'] },
  ],
  people: [
    { id: 'u1', name: '林晓', deptId: 'd-pm' },
    { id: 'u2', name: '王建国', deptId: 'd-rd' },
    { id: 'u3', name: '赵敏', deptId: 'd-qa' },
    { id: 'u4', name: '孙悦', deptId: 'd-mk' },
  ],
};
const project: MmProject = { id: 'p1', name: '二期', desc: '', ownerId: 'u1', memberIds: ['u1'], status: 'active', createdAt: 0, createdBy: 'u1', weeklyReports: [] };
function meeting(decisions: string[]): MmMeeting {
  return {
    id: 'm1', projectId: 'p1', title: '二期评审会', time: 0, source: 'offline', hostId: 'u1', attendeeIds: ['u1', 'u2'], createdBy: 'u1', createdAt: 0,
    status: 'finalized', files: [], speakers: [], segments: [], topics: [], summaryLines: [], confirmations: [], taskIds: [],
    decisions: decisions.map((text, k) => ({ id: `dc_${k + 1}`, text, segmentIds: [] })),
  };
}
const today = '2026-11-16';

describe('generatePlan：模型可用', () => {
  it('部门必须是组织里有的；多部门的拆开；日期不合法的改成默认', async () => {
    const llm = async () => JSON.stringify({
      summary: '本次共 3 项任务，11 月 30 日上线。',
      items: [
        { decision: 1, dept: 'd-rd', title: '完成发布', standard: '生产环境发布成功', due: '2026-11-30' },
        { decision: 2, dept: ['测试部', '市场'], title: '回归测试与宣传准备', standard: '测试报告 / 宣传物料', due: 'next week' },
        { decision: 2, dept: '财务部', title: '不存在的部门', standard: 'x', due: '2026-11-20' },
        { decision: 1, dept: 'd-rd', title: '', standard: '', due: '' },
      ],
    });
    const plan = await generatePlan({ meeting: meeting(['11 月 30 日上线，研发部负责发布', '测试部完成回归测试，市场中心准备宣传，尽快']), project, org, today, llm });
    expect(plan.items.map(x => [x.deptId, x.title, x.due])).toEqual([
      ['d-rd', '完成发布', '2026-11-30'],
      ['d-qa', '回归测试与宣传准备', '2026-11-23'],
      ['d-mk', '回归测试与宣传准备', '2026-11-23'],
    ]);
    expect(plan.items.map(x => x.id)).toEqual(['pi_1', 'pi_2', 'pi_3']);
    expect(plan.items[0]!.decisionId).toBe('dc_1');
    expect(plan.summary).toBe('本次共 3 项任务，11 月 30 日上线。');
  });

  it('概述里出现材料没有的数字的句子删掉', async () => {
    const llm = async () => JSON.stringify({ summary: '共 1 项任务。预算 80 万。', items: [{ decision: 1, dept: 'd-rd', title: '发布', standard: '上线', due: '2026-11-25' }] });
    const plan = await generatePlan({ meeting: meeting(['研发部发布']), project, org, today, llm });
    expect(plan.summary).toBe('共 1 项任务。');
  });
});

describe('generatePlan：兜底', () => {
  it('模型不可用：按决议里点到的部门 / 人拆项，没点到给主持人所在部门；完成时间默认 7~14 天', async () => {
    const plan = await generatePlan({
      meeting: meeting(['研发部和测试部在 12 月 5 日前完成联调', '王建国负责整理接口文档', '大家尽快把周报交上来']),
      project, org, today, llm: async () => null,
    });
    expect(plan.items.map(x => [x.deptId, x.due])).toEqual([
      ['d-rd', '2026-12-05'],
      ['d-qa', '2026-12-05'],
      ['d-rd', '2026-11-30'],
      ['d-pm', '2026-11-23'],
    ]);
    expect(plan.items.every(x => x.standard.length > 0)).toBe(true);
    expect(plan.summary).toContain('3');
    expect(plan.summary).toContain('4');
  });

  it('没有决议：从纪要原文规则抽；还没有就给空方案和说明', async () => {
    const m = meeting([]);
    m.segments = [{ id: 'seg_1', start: 0, end: 5, speakerLabel: 'S1', text: '决定由市场中心负责下周发布会。' }];
    const plan = await generatePlan({ meeting: m, project, org, today, llm: async () => 'not json' });
    expect(plan.items).toHaveLength(1);
    expect(plan.items[0]!.deptId).toBe('d-mk');
    const empty = await generatePlan({ meeting: meeting([]), project, org, today, llm: async () => null });
    expect(empty.items).toEqual([]);
    expect(empty.summary).toMatch(/没有识别出决议/);
  });
});

describe('部门与日期解析', () => {
  it('resolveDepts / deptsMentioned', () => {
    expect(resolveDepts('研发部、测试部', org.depts)).toEqual(['d-rd', 'd-qa']);
    expect(resolveDepts('市场', org.depts)).toEqual(['d-mk']);
    expect(resolveDepts('财务部', org.depts)).toEqual([]);
    expect(deptsMentioned('请测试部配合研发部', org)).toEqual(['d-qa', 'd-rd']);
    expect(deptsMentioned('赵敏跟进', org)).toEqual(['d-qa']);
  });
  it('dueFromText', () => {
    expect(dueFromText('11月30日前完成', today)).toBe('2026-11-30');
    expect(dueFromText('2027年1月5日', today)).toBe('2027-01-05');
    expect(dueFromText('1月5日前', today)).toBe('2027-01-05');
    expect(dueFromText('没有日期', today)).toBeNull();
  });
});
