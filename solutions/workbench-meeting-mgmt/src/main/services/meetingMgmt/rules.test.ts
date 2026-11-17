/**
 * 会议智能管理 · 状态机（rules.ts）：项目 / 纪要 / 发言人确认 / 任务 / 异议四条支路全部流转、
 * 结项检查、成员自动加入与移除校验、逾期标记、任务下发给部门第一负责人、一项任务一个部门。
 */
import { describe, expect, it } from 'vitest';
import type { MmMeeting, MmOrg, MmProject, MmTask } from '../../../shared/meetingMgmt/types';
import * as R from './rules';
import { buildDemoOrg } from './demo';

const NOW = new Date(2026, 10, 16, 10, 0, 0).getTime(); // 2026-11-16 10:00（本地）
const org = (): MmOrg => ({ ...buildDemoOrg(), source: 'demo' });

let seq = 0;
const nid = (): string => `id${++seq}`;

function project(over: Partial<MmProject> = {}): MmProject {
  return { id: 'pj1', name: '数字化工厂一期', desc: '', ownerId: 'linxiao', memberIds: ['linxiao'], status: 'active', createdAt: NOW - 1e7, createdBy: 'linxiao', weeklyReports: [], ...over };
}

function meeting(over: Partial<MmMeeting> = {}): MmMeeting {
  return {
    id: 'mt1', projectId: 'pj1', title: '周例会', time: NOW - 3600_000, source: 'offline', hostId: 'linxiao', attendeeIds: ['linxiao', 'zhaolei', 'zhouting'],
    createdBy: 'linxiao', createdAt: NOW - 7200_000, status: 'pending_upload', files: [], speakers: [], segments: [], topics: [], decisions: [],
    summaryLines: [], confirmations: [], taskIds: [], ...over,
  };
}

function task(over: Partial<MmTask> = {}): MmTask {
  return {
    id: 'tk1', projectId: 'pj1', meetingId: 'mt1', planItemId: 'pi1', deptId: 'd_pur', assigneeId: 'zhouting', ownerId: 'liuyang',
    title: '主控芯片到货跟踪', standard: '按期到货', due: '2026-12-15', status: 'to_accept', percent: 0, createdAt: NOW - 86_400_000,
    objectionHistory: [], progressLog: [], events: [], reminders: {}, ...over,
  };
}

const segs = (pairs: Array<[string, string]>) => pairs.map(([label, text], i) => ({ id: `g${i + 1}`, start: i * 10, end: i * 10 + 8, speakerLabel: label, text }));

/** 处理中 → 跑完：S1 林晓、S2 赵磊（声纹认出），S3 没认出 */
function processed(withUnknown = true): MmMeeting {
  const m = meeting();
  R.startProcessing(m, 'linxiao', NOW, { files: [{ id: 'f1', name: 'a.m4a', kind: 'audio', size: 1, path: '/x/a.m4a', uploadedAt: NOW }] });
  R.applyPipelineResult(m, {
    segments: segs([['S1', '先说范围'], ['S2', '首批上两条线'], ...(withUnknown ? [['S3', '同意'] as [string, string]] : [])]),
    speakers: [{ label: 'S1', personId: 'linxiao', matchedBy: 'voiceprint' }, { label: 'S2', personId: 'zhaolei', matchedBy: 'voiceprint' }, ...(withUnknown ? [{ label: 'S3' }] : [])],
    topics: [], decisions: [{ id: 'd1', text: '首批上两条线', segmentIds: ['g2'] }], summaryLines: ['a', 'b', 'c', 'd'],
  }, NOW + 1000);
  return m;
}

describe('日期与逾期标记', () => {
  it('ymd / 加减天 / 本周范围', () => {
    expect(R.ymd(NOW)).toBe('2026-11-16');
    expect(R.addDaysYmd('2026-11-30', 1)).toBe('2026-12-01');
    expect(R.daysBetweenYmd('2026-11-14', '2026-11-16')).toBe(2);
    expect(R.isYmd('2026-02-30')).toBe(false);
    const w = R.weekRange(NOW); // 2026-11-16 是周一
    expect([w.fromYmd, w.toYmd]).toEqual(['2026-11-16', '2026-11-22']);
  });

  it('逾期只看未开始 / 进行中且过了截止日；待接收、已完成不算', () => {
    expect(R.isTaskOverdue(task({ status: 'in_progress', due: '2026-11-14' }), NOW)).toBe(true);
    expect(R.taskOverdueDays(task({ status: 'in_progress', due: '2026-11-14' }), NOW)).toBe(2);
    expect(R.isTaskOverdue(task({ status: 'not_started', due: '2026-11-16' }), NOW)).toBe(false);
    expect(R.isTaskOverdue(task({ status: 'to_accept', due: '2026-11-01' }), NOW)).toBe(false);
    expect(R.isTaskOverdue(task({ status: 'done', due: '2026-11-01' }), NOW)).toBe(false);
  });
});

describe('纪要状态机', () => {
  it('待上传 → 处理中；只有主持人能上传，已定稿后不能再传', () => {
    const m = meeting();
    expect(() => R.startProcessing(m, 'zhaolei', NOW, { files: [] })).toThrow('只有主持人');
    expect(() => R.startProcessing(m, 'linxiao', NOW, { files: [] })).toThrow('请选择要上传');
    R.startProcessing(m, 'linxiao', NOW, { files: [{ id: 'f', name: 'a.mp3', kind: 'audio', size: 1, path: 'p', uploadedAt: NOW }] });
    expect(m.status).toBe('processing');
    expect(m.process?.stage).toBe('extract');
    expect(() => R.startProcessing(m, 'linxiao', NOW, { files: m.files })).toThrow('不能上传');
  });

  it('处理失败 → 重试回到处理中', () => {
    const m = meeting();
    R.startProcessing(m, 'linxiao', NOW, { files: [{ id: 'f', name: 'a.mp3', kind: 'audio', size: 1, path: 'p', uploadedAt: NOW }] });
    R.failProcessing(m, '转写失败', NOW);
    expect(m.status).toBe('failed');
    expect(m.process?.error).toBe('转写失败');
    expect(() => R.startProcessing(m, 'zhaolei', NOW, { retry: true })).toThrow('只有主持人');
    R.startProcessing(m, 'linxiao', NOW, { retry: true });
    expect(m.status).toBe('processing');
    expect(m.process?.error).toBeUndefined();
  });

  it('有没认出的发言人 → 待指认；摘要最多 3 行；认出的人自动算参会人', () => {
    const m = processed(true);
    expect(m.status).toBe('pending_assign');
    expect(m.summaryLines).toHaveLength(3);
    expect(m.confirmations).toHaveLength(2);
    expect(m.confirmations.every((c) => c.status === 'pending' && c.requestedAt === undefined)).toBe(true);
  });

  it('全部认出 → 直接待确认，并记下发出待确认的时间', () => {
    const m = meeting();
    R.startProcessing(m, 'linxiao', NOW, { files: [{ id: 'f', name: 't.txt', kind: 'transcript', size: 1, path: 'p', uploadedAt: NOW }] });
    const r = R.applyPipelineResult(m, { segments: segs([['林晓', 'a'], ['孙浩', 'b']]), speakers: [{ label: '林晓', personId: 'linxiao', matchedBy: 'nickname' }, { label: '孙浩', personId: 'sunhao', matchedBy: 'nickname' }], topics: [], decisions: [], summaryLines: [] }, NOW);
    expect(m.status).toBe('pending_confirm');
    expect(r.pending).toEqual(['linxiao', 'sunhao']);
    expect(m.attendeeIds).toContain('sunhao');
    expect(m.confirmations.every((c) => c.requestedAt === NOW)).toBe(true);
  });

  it('不在处理中的会议，流水线结果作废', () => {
    expect(() => R.applyPipelineResult(meeting(), { segments: [], speakers: [], topics: [], decisions: [], summaryLines: [] }, NOW)).toThrow('结果作废');
  });

  it('指认：全部指认完才进入待确认，通知全体未确认的人', () => {
    const m = processed(true);
    expect(() => R.assignSpeaker(m, 'zhaolei', 'S3', 'zhouting', NOW)).toThrow('只有主持人');
    expect(() => R.assignSpeaker(m, 'linxiao', 'S9', 'zhouting', NOW)).toThrow('没有找到发言人');
    const r = R.assignSpeaker(m, 'linxiao', 'S3', 'zhouting', NOW + 5);
    expect(m.status).toBe('pending_confirm');
    expect(r.pending.sort()).toEqual(['linxiao', 'zhaolei', 'zhouting']);
    expect(m.confirmations.every((c) => c.requestedAt === NOW + 5)).toBe(true);
    expect(m.speakers.find((s) => s.label === 'S3')?.matchedBy).toBe('manual');
  });

  it('确认中改指认：只有标签变了的人回到未确认，其他人的确认保留', () => {
    const m = processed(true);
    R.assignSpeaker(m, 'linxiao', 'S3', 'zhouting', NOW);
    R.confirmSpeech(m, 'linxiao', NOW);
    R.confirmSpeech(m, 'zhaolei', NOW);
    const r = R.assignSpeaker(m, 'linxiao', 'S3', 'zhaolei', NOW + 10); // S3 其实是赵磊
    expect(r.pending).toEqual(['zhaolei']);
    expect(m.confirmations.find((c) => c.personId === 'linxiao')?.status).toBe('confirmed');
    expect(m.confirmations.find((c) => c.personId === 'zhaolei')?.status).toBe('pending');
    expect(m.confirmations.find((c) => c.personId === 'zhouting')).toBeUndefined();
  });

  it('待确认：发言人只能改本人发言（确认后也能补全）、主持人可改任意段；全员确认自动进入待终审', () => {
    const m = processed(false);
    expect(m.status).toBe('pending_confirm');
    expect(() => R.editSegment(m, 'zhaolei', 'g1', '改别人的', NOW)).toThrow('只能修改本人');
    R.editSegment(m, 'zhaolei', 'g2', '首批只上总装线和检测线', NOW);
    const g2 = m.segments.find((s) => s.id === 'g2')!;
    expect(g2.originalText).toBe('首批上两条线');
    expect(g2.editedBy).toBe('zhaolei');
    expect(() => R.confirmSpeech(m, 'zhouting', NOW)).toThrow('不是这场会议的发言人');
    expect(R.confirmSpeech(m, 'zhaolei', NOW).allConfirmed).toBe(false);
    expect(() => R.confirmSpeech(m, 'zhaolei', NOW)).toThrow('已经确认过了');
    // 确认过也还能补全本人的话（会议还在待确认）
    R.editSegment(m, 'zhaolei', 'g2', '首批只上总装线和检测线，下月再上包装线', NOW);
    expect(g2.originalText).toBe('首批上两条线');
    // 主持人可改别人的段
    const other = m.segments.find((s) => m.speakers.find((x) => x.label === s.speakerLabel)?.personId !== m.hostId)!;
    R.editSegment(m, m.hostId, other.id, '主持人补全的文字', NOW);
    expect(other).toMatchObject({ text: '主持人补全的文字', editedBy: m.hostId });
    expect(R.confirmSpeech(m, 'linxiao', NOW + 1).allConfirmed).toBe(true);
    expect(m.status).toBe('pending_review');
    expect(m.reviewStartedAt).toBe(NOW + 1);
  });

  it('终审退回：只让被退回的人重新确认，他再确认后回到待终审', () => {
    const m = processed(false);
    R.confirmSpeech(m, 'zhaolei', NOW);
    R.confirmSpeech(m, 'linxiao', NOW);
    expect(() => R.returnToSpeaker(m, 'zhaolei', 'zhaolei', 'x', NOW)).toThrow('只有主持人');
    expect(() => R.returnToSpeaker(m, 'linxiao', 'sunhao', 'x', NOW)).toThrow('不是本场会议的发言人');
    R.returnToSpeaker(m, 'linxiao', 'zhaolei', '仓储那句说反了', NOW + 100);
    expect(m.status).toBe('pending_confirm');
    const zl = m.confirmations.find((c) => c.personId === 'zhaolei')!;
    expect(zl).toMatchObject({ status: 'pending', returnNote: '仓储那句说反了', returnedAt: NOW + 100, requestedAt: NOW + 100 });
    expect(m.confirmations.find((c) => c.personId === 'linxiao')?.status).toBe('confirmed');
    expect(() => R.confirmSpeech(m, 'linxiao', NOW)).toThrow('已经确认过了');
    // 被退回的人可以改本人发言
    R.editSegment(m, 'zhaolei', 'g2', '仓储放第二批', NOW + 101);
    R.confirmSpeech(m, 'zhaolei', NOW + 200);
    expect(m.status).toBe('pending_review');
  });

  it('终审时主持人可改任意段；终审通过后纪要锁定（主持人仍可修正错字，改发言人 / 确认不行）', () => {
    const m = processed(false);
    R.confirmSpeech(m, 'zhaolei', NOW);
    R.confirmSpeech(m, 'linxiao', NOW);
    expect(() => R.editSegment(m, 'zhaolei', 'g2', 'x', NOW)).toThrow('只有主持人');
    R.editSegment(m, 'linxiao', 'g2', '主持人改的', NOW);
    expect(() => R.approveMinutes(m, 'zhaolei', NOW)).toThrow('只有主持人');
    R.approveMinutes(m, 'linxiao', NOW + 1);
    expect(m.status).toBe('finalized');
    expect(m.finalizedBy).toBe('linxiao');
    expect(() => R.editSegment(m, 'zhaolei', 'g1', 'x', NOW)).toThrow('只有主持人');
    const before = m.segments.find((x) => x.id === 'g1')!.text;
    R.editSegment(m, 'linxiao', 'g1', '定稿后修正的错字', NOW + 2);
    expect(m.segments.find((x) => x.id === 'g1')).toMatchObject({ text: '定稿后修正的错字', originalText: before, editedBy: 'linxiao' });
    expect(m.status).toBe('finalized');
    R.saveMinutesDraft(m, 'linxiao', { summaryLines: ['定稿后改的摘要'] }, () => 'dx');
    expect(m.summaryLines).toEqual(['定稿后改的摘要']);
    expect(() => R.saveMinutesDraft(m, 'zhaolei', { summaryLines: ['x'] }, () => 'dy')).toThrow('只有主持人');
    expect(() => R.confirmSpeech(m, 'linxiao', NOW)).toThrow('纪要已定稿锁定');
    expect(() => R.assignSpeaker(m, 'linxiao', 'S1', 'zhouting', NOW)).toThrow('纪要已定稿锁定');
  });

  it('终审时发现声纹认错：主持人照样能更正整组；受影响的人回到待确认，没影响任何人就留在终审', () => {
    const m = processed(false);
    R.confirmSpeech(m, 'zhaolei', NOW);
    R.confirmSpeech(m, 'linxiao', NOW + 1);
    expect(m.status).toBe('pending_review');
    expect(R.assignSpeaker(m, 'linxiao', 'S2', 'zhaolei', NOW + 2)).toEqual({ pending: [] }); // 没改
    expect(m.reviewStartedAt).toBe(NOW + 1);
    const r = R.assignSpeaker(m, 'linxiao', 'S2', 'zhouting', NOW + 3); // S2 其实是周婷
    expect(r.pending).toEqual(['zhouting']);
    expect(m.status).toBe('pending_confirm');
    expect(m.reviewStartedAt).toBeUndefined();
    expect(m.confirmations.map((c) => [c.personId, c.status])).toEqual([['linxiao', 'confirmed'], ['zhouting', 'pending']]);
  });

  it('逐段改发言人：改给已有的人 / 改给本场还没出现的员工（新开标签）；新的发言人要重新确认，原发言人不用', () => {
    const m = processed(false);
    R.confirmSpeech(m, 'zhaolei', NOW);
    R.confirmSpeech(m, 'linxiao', NOW);
    expect(() => R.moveSegment(m, 'zhaolei', 'g1', { label: 'S2' }, NOW)).toThrow('只有主持人');
    expect(() => R.moveSegment(m, 'linxiao', 'gx', { label: 'S2' }, NOW)).toThrow('没有找到这段发言');
    expect(() => R.moveSegment(m, 'linxiao', 'g1', { label: 'S9' }, NOW)).toThrow('没有找到发言人');
    // g1 其实是赵磊说的：改给 S2；林晓已无发言 → 不再是发言人
    const r = R.moveSegment(m, 'linxiao', 'g1', { label: 'S2' }, NOW + 5);
    expect(m.segments.find((s) => s.id === 'g1')).toMatchObject({ speakerLabel: 'S2', originalSpeakerLabel: 'S1', editedBy: 'linxiao' });
    expect(m.speakers.map((s) => s.label)).toEqual(['S2']);
    expect(r.pending).toEqual(['zhaolei']);
    expect(m.status).toBe('pending_confirm');
    // g2 改给周婷（本场没有她的标签）→ 新开 S3，原识别标签只记第一次
    const r2 = R.moveSegment(m, 'linxiao', 'g2', { personId: 'zhouting' }, NOW + 6);
    expect(m.segments.find((s) => s.id === 'g2')).toMatchObject({ speakerLabel: 'S3', originalSpeakerLabel: 'S2' });
    expect(m.speakers.find((s) => s.label === 'S3')).toMatchObject({ personId: 'zhouting', matchedBy: 'manual' });
    expect(r2.pending).toEqual(['zhouting']);
    expect(m.attendeeIds).toContain('zhouting');
    R.moveSegment(m, 'linxiao', 'g1', { personId: 'zhouting' }, NOW + 7);
    expect(m.segments.find((s) => s.id === 'g1')).toMatchObject({ speakerLabel: 'S3', originalSpeakerLabel: 'S1' });
    // 待指认时也能逐段改；定稿后不能
    const a = processed(true);
    R.moveSegment(a, 'linxiao', 'g3', { label: 'S2' }, NOW);
    expect(a.speakers.some((s) => s.label === 'S3')).toBe(false);
    expect(a.status).toBe('pending_confirm'); // 没认出的那组没有发言了 → 不用再指认
    const f = processed(false);
    R.confirmSpeech(f, 'zhaolei', NOW);
    R.confirmSpeech(f, 'linxiao', NOW);
    R.approveMinutes(f, 'linxiao', NOW);
    expect(() => R.moveSegment(f, 'linxiao', 'g1', { label: 'S2' }, NOW)).toThrow('纪要已定稿锁定');
  });

  it('指认后把决议 / 摘要 / 议题标题里的识别编号换成人名（S1 不误伤 S12）', () => {
    const m = processed(true);
    m.decisions = [{ id: 'd1', text: 'S3 负责首批两条线，S12 配合', segmentIds: [] }];
    m.summaryLines = ['S3 同意首批上两条线'];
    m.topics = [{ id: 't1', title: 'S3 的提议', segmentIds: ['g3'] }];
    R.assignSpeaker(m, 'linxiao', 'S3', 'zhouting', NOW);
    const names: Record<string, string> = { zhouting: '周婷', linxiao: '林晓', zhaolei: '赵磊' };
    expect(R.replaceSpeakerLabels(m, (id) => names[id])).toBe(true);
    expect(m.decisions[0]!.text).toBe('周婷 负责首批两条线，S12 配合');
    expect(m.summaryLines).toEqual(['周婷 同意首批上两条线']);
    expect(m.topics[0]!.title).toBe('周婷 的提议');
    expect(R.replaceSpeakerLabels(m, (id) => names[id])).toBe(false);
  });

  it('主持人定稿前可改决议和摘要：保留原决议的出处，新加的给新 id，空行丢掉；定稿后主持人仍可修正', () => {
    const m = processed(false);
    let n = 0;
    const nid = () => `dc_new${++n}`;
    expect(() => R.saveMinutesDraft(m, 'zhaolei', { summaryLines: ['x'] }, nid)).toThrow('只有主持人');
    R.saveMinutesDraft(m, 'linxiao', { decisions: [{ id: 'd1', text: '首批只上总装线' }, { text: '  ' }, { text: '仓储放第二批' }], summaryLines: ['一', '', '二'] }, nid);
    expect(m.decisions).toEqual([{ id: 'd1', text: '首批只上总装线', segmentIds: ['g2'] }, { id: 'dc_new1', text: '仓储放第二批', segmentIds: [] }]);
    expect(m.summaryLines).toEqual(['一', '二']);
    expect(() => R.saveMinutesDraft(m, 'linxiao', { summaryLines: ['1', '2', '3', '4'] }, nid)).toThrow('最多 3 行');
    R.confirmSpeech(m, 'zhaolei', NOW);
    R.confirmSpeech(m, 'linxiao', NOW);
    R.saveMinutesDraft(m, 'linxiao', { summaryLines: ['终审时改'] }, nid);
    R.approveMinutes(m, 'linxiao', NOW);
    R.saveMinutesDraft(m, 'linxiao', { summaryLines: ['x'] }, nid);
    expect(m.summaryLines).toEqual(['x']);
  });

  it('一个发言人都没有：处理完直接待终审', () => {
    const m = meeting();
    R.startProcessing(m, 'linxiao', NOW, { files: [{ id: 'f', name: 'a.mp3', kind: 'audio', size: 1, path: 'p', uploadedAt: NOW }] });
    R.applyPipelineResult(m, { segments: [], speakers: [], topics: [], decisions: [], summaryLines: [] }, NOW);
    expect(m.status).toBe('pending_review');
  });

  it('定稿后选择：无需生成任务 → 已结束；生成任务 → 待指定负责人 → 方案待确认', () => {
    const a = meeting({ status: 'finalized' });
    expect(() => R.decideTasks(a, 'zhaolei', 'none')).toThrow('只有主持人');
    R.decideTasks(a, 'linxiao', 'none');
    expect(a.status).toBe('ended');

    const b = meeting({ status: 'finalized' });
    R.decideTasks(b, 'linxiao', 'generate');
    expect(b.status).toBe('finalized');
    R.attachPlan(b, { generatedAt: NOW, summary: 's', items: [{ id: 'pi1', deptId: 'd_pur', title: '芯片', standard: '', due: '2026-12-15' }] });
    expect(b.status).toBe('pending_owner');
    expect(() => R.setPlanOwner(b, 'zhaolei', 'liuyang')).toThrow('只有主持人');
    R.setPlanOwner(b, 'linxiao', 'liuyang');
    expect(b.status).toBe('plan_confirm');
    expect(b.plan?.ownerId).toBe('liuyang');
    expect(() => R.attachPlan(b, b.plan!)).toThrow('方案作废');
  });
});

describe('方案与任务下发', () => {
  it('一项任务一个部门：缺部门 / 部门不存在 / 日期不对都拦下', () => {
    const o = org();
    expect(() => R.sanitizePlanItems([{ title: 'x', due: '2026-12-01' }], o, nid)).toThrow('一项任务只能有一个责任部门');
    expect(() => R.sanitizePlanItems([{ deptId: 'd_x', title: 'x', due: '2026-12-01' }], o, nid)).toThrow('不在组织里');
    expect(() => R.sanitizePlanItems([{ deptId: 'd_pur', title: '', due: '2026-12-01' }], o, nid)).toThrow('执行事项不能为空');
    expect(() => R.sanitizePlanItems([{ deptId: 'd_pur', title: 'x', due: '12-01' }], o, nid)).toThrow('完成时间');
    const items = R.sanitizePlanItems([{ deptId: 'd_pur', title: ' 芯片 ', due: '2026-12-01', standard: 's' }], o, nid);
    expect(items[0]).toMatchObject({ deptId: 'd_pur', title: '芯片', standard: 's' });
    expect(items[0].id).toBeTruthy();
  });

  function planned(): MmMeeting {
    const m = meeting({ status: 'finalized', taskDecision: 'generate' });
    R.attachPlan(m, { generatedAt: NOW, summary: 's', items: [
      { id: 'pi1', deptId: 'd_pur', title: '芯片到货', standard: '', due: '2026-12-15' },
      { id: 'pi2', deptId: 'd_rd', title: '需求确认', standard: '', due: '2026-11-20' },
    ] });
    R.setPlanOwner(m, 'linxiao', 'liuyang');
    return m;
  }

  it('只有任务负责人能编辑 / 确认方案；确认后已派发，任务下发给部门第一负责人', () => {
    const m = planned();
    const o = org();
    expect(() => R.savePlan(m, 'linxiao', [], undefined)).toThrow('只有任务负责人');
    expect(() => R.confirmPlan(m, 'linxiao', project(), o, NOW, nid)).toThrow('只有任务负责人');
    const tasks = R.confirmPlan(m, 'liuyang', project(), o, NOW, nid);
    expect(m.status).toBe('dispatched');
    expect(m.taskIds).toEqual(tasks.map((t) => t.id));
    expect(tasks.map((t) => [t.deptId, t.assigneeId, t.ownerId, t.status])).toEqual([['d_pur', 'zhouting', 'liuyang', 'to_accept'], ['d_rd', 'zhaolei', 'liuyang', 'to_accept']]);
  });

  it('多位任务负责人：任何一位都能编辑 / 确认方案；派发的任务带上全部负责人，任何一位都能复核异议', () => {
    const m = planned();
    expect(() => R.setPlanOwner(m, 'linxiao', [])).toThrow('至少选一位');
    expect(() => R.setPlanOwner(m, 'linxiao', Array.from({ length: 11 }, (_, i) => `p${i}`))).toThrow('最多 10 位');
    R.setPlanOwner(m, 'linxiao', ['liuyang', 'zhaolei', 'liuyang']);
    expect(m.plan).toMatchObject({ ownerId: 'liuyang', ownerIds: ['liuyang', 'zhaolei'] });
    expect(R.planOwners(m.plan)).toEqual(['liuyang', 'zhaolei']);
    // 旧数据只有 ownerId
    expect(R.planOwners({ ...m.plan!, ownerIds: undefined })).toEqual(['liuyang']);
    R.savePlan(m, 'zhaolei', m.plan!.items, '第二位负责人改的');
    const tasks = R.confirmPlan(m, 'zhaolei', project(), org(), NOW, nid);
    expect(tasks.every((t) => t.ownerId === 'liuyang' && JSON.stringify(t.ownerIds) === JSON.stringify(['liuyang', 'zhaolei']))).toBe(true);
    const t = tasks[0]!;
    t.status = 'not_started';
    R.raiseObjection(t, t.assigneeId, { target: 'time', reason: '交期紧', suggestion: '推迟', suggestedDue: '2026-12-30' }, NOW, 'o1');
    expect(R.reviewObjection(t, 'zhaolei', 'reject', '先按原计划', undefined, NOW + 1)).toBe('rejected');
  });

  it('部门第一负责人不可用时报明确原因，不悄悄换人', () => {
    const o = org();
    o.depts.find((d) => d.id === 'd_pur')!.leaderIds = ['ghost', 'hejing'];
    expect(() => R.confirmPlan(planned(), 'liuyang', project(), o, NOW, nid)).toThrow('第一负责人不在通讯录同步范围内');
    o.depts.find((d) => d.id === 'd_pur')!.leaderIds = ['zhouting', 'hejing'];
    o.people.find((p) => p.id === 'zhouting')!.left = true;
    expect(() => R.confirmPlan(planned(), 'liuyang', project(), o, NOW, nid)).toThrow('已离职');
    o.depts.find((d) => d.id === 'd_pur')!.leaderIds = [];
    expect(() => R.confirmPlan(planned(), 'liuyang', project(), o, NOW, nid)).toThrow('没有设置负责人');
    expect(() => R.confirmPlan(planned(), 'liuyang', project(), o, NOW, nid)).toThrow('可以在「下发给」里直接选人');
    expect(R.firstLeader(o, 'd_pur')).toBeNull();
  });

  it('「下发给」可以自定义：部门没有负责人时照样能下发，也能改给部门负责人以外的人', () => {
    const o = org();
    o.depts.find((d) => d.id === 'd_pur')!.leaderIds = [];
    const m = planned();
    m.plan!.items[0].assigneeId = 'hejing';
    m.plan!.items[1].assigneeId = 'linxiao';
    const tasks = R.confirmPlan(m, 'liuyang', project(), o, NOW, nid);
    expect(tasks.map((t) => [t.deptId, t.assigneeId])).toEqual([['d_pur', 'hejing'], ['d_rd', 'linxiao']]);
    // 指定的人离职 / 不在组织里：报出来，不悄悄换回部门负责人
    const m2 = planned();
    m2.plan!.items[0].assigneeId = 'hejing';
    m2.plan!.items[1].assigneeId = 'zhaolei';
    o.people.find((p) => p.id === 'zhaolei')!.left = true;
    expect(() => R.confirmPlan(m2, 'liuyang', project(), o, NOW, nid)).toThrow('「下发给」的人不在组织里或已离职');
    // 保存方案时也校验，空值不写进去（= 部门负责人）
    expect(() => R.sanitizePlanItems([{ deptId: 'd_pur', title: 'x', due: '2026-12-01', assigneeId: 'ghost' }], o, nid)).toThrow('「下发给」的人不在组织里或已离职');
    const items = R.sanitizePlanItems([{ deptId: 'd_pur', title: 'x', due: '2026-12-01', assigneeId: 'hejing' }, { deptId: 'd_rd', title: 'y', due: '2026-12-01', assigneeId: '' }], o, nid);
    expect(items[0].assigneeId).toBe('hejing');
    expect('assigneeId' in items[1]).toBe(false);
  });

  it('结项中的项目不能再下发任务', () => {
    expect(() => R.confirmPlan(planned(), 'liuyang', project({ status: 'closing' }), org(), NOW, nid)).toThrow('正在结项');
    expect(() => R.confirmPlan(planned(), 'liuyang', project({ status: 'archived' }), org(), NOW, nid)).toThrow('已归档');
  });
});

describe('任务状态机', () => {
  it('待接收 → 接收 → 未开始 → 更新进度 → 进行中 → 标记完成 → 已完成', () => {
    const t = task();
    expect(() => R.acceptTask(t, 'liuyang', NOW)).toThrow('只有接收任务的部门负责人');
    R.acceptTask(t, 'zhouting', NOW);
    expect(t.status).toBe('not_started');
    expect(() => R.acceptTask(t, 'zhouting', NOW)).toThrow('不能接收');
    expect(() => R.completeTask(t, 'zhouting', '', NOW)).toThrow('请先更新进度');
    expect(() => R.updateProgress(t, 'zhouting', 120, '', NOW)).toThrow('0~100');
    R.updateProgress(t, 'zhouting', 40, '已下单', NOW);
    expect(t).toMatchObject({ status: 'in_progress', percent: 40 });
    expect(t.progressLog).toHaveLength(1);
    R.completeTask(t, 'zhouting', '已到货', NOW + 1);
    expect(t).toMatchObject({ status: 'done', percent: 100, doneAt: NOW + 1 });
    expect(() => R.updateProgress(t, 'zhouting', 50, '', NOW)).toThrow('不能更新进度');
    expect(t.events.map((e) => e.action)).toEqual(['accepted', 'progress', 'done']);
  });

  it('更新进度时明确选「未开始」：状态保持未开始，进度只能是 0', () => {
    const t = task({ status: 'not_started' });
    expect(() => R.updateProgress(t, 'zhouting', 20, '', NOW, 'not_started')).toThrow('只能是 0');
    R.updateProgress(t, 'zhouting', 0, '等供应商报价', NOW, 'not_started');
    expect(t).toMatchObject({ status: 'not_started', percent: 0 });
    expect(t.progressLog.at(-1)).toMatchObject({ status: 'not_started', note: '等供应商报价' });
    R.updateProgress(t, 'zhouting', 0, '', NOW);
    expect(t.status).toBe('in_progress');
  });

  it('接收时叫「提出异议」，执行中叫「申请变更」；异议期间不能接收 / 更新', () => {
    const a = task();
    expect(() => R.raiseObjection(a, 'liuyang', { target: 'time', reason: 'x', suggestion: '' }, NOW, 'o1')).toThrow('只有接收任务的部门负责人');
    expect(() => R.raiseObjection(a, 'zhouting', { target: 'time', reason: '', suggestion: '' }, NOW, 'o1')).toThrow('请填写异议原因');
    expect(() => R.raiseObjection(a, 'zhouting', { target: 'x' as any, reason: 'r', suggestion: '' }, NOW, 'o1')).toThrow('请选择异议针对');
    expect(R.raiseObjection(a, 'zhouting', { target: 'time', reason: '交期紧', suggestion: '推迟', suggestedDue: '2026-12-20' }, NOW, 'o1')).toMatchObject({ kind: 'objection', prevStatus: 'to_accept', stage: 'review' });
    expect(() => R.acceptTask(a, 'zhouting', NOW)).toThrow('异议处理中');
    expect(() => R.raiseObjection(a, 'zhouting', { target: 'time', reason: 'x', suggestion: '' }, NOW, 'o2')).toThrow('异议处理中');

    const b = task({ status: 'in_progress', percent: 30 });
    expect(R.raiseObjection(b, 'zhouting', { target: 'requirement', reason: 'r', suggestion: 's' }, NOW, 'o3').kind).toBe('change');
    expect(() => R.updateProgress(b, 'zhouting', 50, '', NOW)).toThrow('异议处理中');
    expect(() => R.raiseObjection(task({ status: 'done' }), 'zhouting', { target: 'time', reason: 'r', suggestion: '' }, NOW, 'o4')).toThrow('不能提出异议');
  });

  it('支路 1：任务负责人采纳并调整 → 待接收（重新确认），截止日按调整、提醒记录清零', () => {
    const t = task({ status: 'not_started', acceptedAt: NOW - 10, reminders: { dueAt: NOW - 5 } });
    R.raiseObjection(t, 'zhouting', { target: 'time', reason: '交期紧', suggestion: '推迟', suggestedDue: '2026-12-20' }, NOW, 'o1');
    expect(() => R.reviewObjection(t, 'linxiao', 'adopt', '', undefined, NOW)).toThrow('只有任务负责人');
    expect(R.reviewObjection(t, 'liuyang', 'adopt', '同意', undefined, NOW + 1)).toBe('adopted');
    expect(t).toMatchObject({ status: 'to_accept', due: '2026-12-20', reminders: {} });
    expect(t.acceptedAt).toBeUndefined();
    expect(t.objection).toBeUndefined();
    expect(t.objectionHistory[0]).toMatchObject({ outcome: 'adopted', stage: 'resolved', review: { decision: 'adopt', by: 'liuyang' } });
    R.acceptTask(t, 'zhouting', NOW + 2);
    expect(t.status).toBe('not_started');
  });

  it('采纳时可删除该任务 → 已取消（终态）；驳回时不能删', () => {
    const t = task();
    R.raiseObjection(t, 'zhouting', { target: 'content', reason: '不是我部门的', suggestion: '' }, NOW, 'o1');
    expect(() => R.reviewObjection(t, 'liuyang', 'reject', '', { cancel: true }, NOW)).toThrow('驳回时不能删除');
    expect(R.reviewObjection(t, 'liuyang', 'adopt', '确实不需要', { cancel: true }, NOW)).toBe('cancelled');
    expect(t.status).toBe('cancelled');
    expect(t.objectionHistory[0].outcome).toBe('cancelled');
    expect(() => R.acceptTask(t, 'zhouting', NOW)).toThrow('不能接收');
  });

  it('支路 2：驳回 → 待部门回应 → 接受驳回，回到发起前状态', () => {
    const t = task({ status: 'in_progress', percent: 30 });
    R.raiseObjection(t, 'zhouting', { target: 'time', reason: 'r', suggestion: '' }, NOW, 'o1');
    expect(R.reviewObjection(t, 'liuyang', 'reject', '按原计划', undefined, NOW)).toBe('rejected');
    expect(t.objection?.stage).toBe('dept_reply');
    expect(() => R.replyObjection(t, 'liuyang', 'accept', NOW)).toThrow('只有接收任务的部门负责人');
    expect(R.replyObjection(t, 'zhouting', 'accept', NOW)).toBe('accepted_reject');
    expect(t.status).toBe('in_progress');
    expect(t.objection).toBeUndefined();
    expect(t.objectionHistory[0].outcome).toBe('accepted_reject');
  });

  it('支路 3：提交裁决 → 项目负责人维持原方案（原来是待接收的直接变未开始）', () => {
    const t = task();
    R.raiseObjection(t, 'zhouting', { target: 'time', reason: 'r', suggestion: '', suggestedDue: '2026-12-20' }, NOW, 'o1');
    R.reviewObjection(t, 'liuyang', 'reject', 'x', undefined, NOW);
    expect(R.replyObjection(t, 'zhouting', 'escalate', NOW)).toBe('escalated');
    expect(t.objection?.stage).toBe('arbitration');
    expect(() => R.arbitrateObjection(t, 'liuyang', 'linxiao', 'keep', '', undefined, NOW)).toThrow('只有项目负责人');
    expect(R.arbitrateObjection(t, 'linxiao', 'linxiao', 'keep', '12-15 是前置节点', undefined, NOW + 1)).toBe('kept');
    expect(t).toMatchObject({ status: 'not_started', due: '2026-12-15', acceptedAt: NOW + 1 });
    expect(t.objectionHistory[0]).toMatchObject({ outcome: 'kept', arbitration: { decision: 'keep', by: 'linxiao' } });

    const b = task({ status: 'in_progress' });
    R.raiseObjection(b, 'zhouting', { target: 'time', reason: 'r', suggestion: '' }, NOW, 'o2');
    R.reviewObjection(b, 'liuyang', 'reject', '', undefined, NOW);
    R.replyObjection(b, 'zhouting', 'escalate', NOW);
    R.arbitrateObjection(b, 'linxiao', 'linxiao', 'keep', '', undefined, NOW);
    expect(b.status).toBe('in_progress');
  });

  it('支路 4：裁决按异议调整 → 未开始 / 进行中（按调整后内容）；也可删除该任务', () => {
    const t = task();
    R.raiseObjection(t, 'zhouting', { target: 'time', reason: 'r', suggestion: '', suggestedDue: '2026-12-20' }, NOW, 'o1');
    R.reviewObjection(t, 'liuyang', 'reject', '', undefined, NOW);
    R.replyObjection(t, 'zhouting', 'escalate', NOW);
    expect(() => R.arbitrateObjection(t, 'linxiao', 'linxiao', 'adjust', '', { due: '12-20' }, NOW)).toThrow('截止日请写成');
    expect(R.arbitrateObjection(t, 'linxiao', 'linxiao', 'adjust', '按 12-20', { standard: '每周同步排产' }, NOW)).toBe('adjusted');
    expect(t).toMatchObject({ status: 'not_started', due: '2026-12-20', standard: '每周同步排产' });

    const b = task({ status: 'in_progress' });
    R.raiseObjection(b, 'zhouting', { target: 'content', reason: 'r', suggestion: '' }, NOW, 'o2');
    R.reviewObjection(b, 'liuyang', 'reject', '', undefined, NOW);
    R.replyObjection(b, 'zhouting', 'escalate', NOW);
    R.arbitrateObjection(b, 'linxiao', 'linxiao', 'adjust', '', { title: '芯片到货（含备选渠道）' }, NOW);
    expect(b).toMatchObject({ status: 'in_progress', title: '芯片到货（含备选渠道）' });

    const c = task({ status: 'not_started' });
    R.raiseObjection(c, 'zhouting', { target: 'content', reason: 'r', suggestion: '' }, NOW, 'o3');
    R.reviewObjection(c, 'liuyang', 'reject', '', undefined, NOW);
    R.replyObjection(c, 'zhouting', 'escalate', NOW);
    expect(R.arbitrateObjection(c, 'linxiao', 'linxiao', 'adjust', '删掉', { cancel: true }, NOW)).toBe('cancelled');
    expect(c.status).toBe('cancelled');
  });

  it('阶段不对的操作都拦下', () => {
    const t = task();
    expect(() => R.reviewObjection(t, 'liuyang', 'adopt', '', undefined, NOW)).toThrow('没有待复核的异议');
    expect(() => R.replyObjection(t, 'zhouting', 'accept', NOW)).toThrow('没有待你回应的驳回');
    expect(() => R.arbitrateObjection(t, 'linxiao', 'linxiao', 'keep', '', undefined, NOW)).toThrow('没有待裁决的异议');
    R.raiseObjection(t, 'zhouting', { target: 'time', reason: 'r', suggestion: '' }, NOW, 'o1');
    expect(() => R.replyObjection(t, 'zhouting', 'accept', NOW)).toThrow('没有待你回应的驳回');
    expect(() => R.arbitrateObjection(t, 'linxiao', 'linxiao', 'keep', '', undefined, NOW)).toThrow('没有待裁决的异议');
  });

  it('异议期间照常计时：原截止日有效，过期照样标逾期', () => {
    const t = task({ status: 'in_progress', due: '2026-11-14' });
    R.raiseObjection(t, 'zhouting', { target: 'time', reason: 'r', suggestion: '', suggestedDue: '2026-11-30' }, NOW, 'o1');
    expect(t.due).toBe('2026-11-14');
    expect(R.isTaskOverdue(t, NOW)).toBe(true);
    R.reviewObjection(t, 'liuyang', 'reject', '', undefined, NOW);
    expect(R.isTaskOverdue(t, NOW)).toBe(true);
    R.replyObjection(t, 'zhouting', 'escalate', NOW);
    R.arbitrateObjection(t, 'linxiao', 'linxiao', 'adjust', '', undefined, NOW); // 时间类异议：按建议截止日调整
    expect(t.due).toBe('2026-11-30');
    expect(R.isTaskOverdue(t, NOW)).toBe(false);
  });
});

describe('项目：结项、归档、成员', () => {
  it('结项检查：未结束的会议、未完成的任务、处理中的异议都列出来，不通过留在进行中', () => {
    const p = project();
    const ms = [meeting({ status: 'pending_review' }), meeting({ id: 'mt2', status: 'ended' }), meeting({ id: 'mt3', status: 'dispatched' })];
    const ts = [task({ status: 'done' }), task({ id: 'tk2', status: 'cancelled' }), task({ id: 'tk3', status: 'in_progress', objection: { id: 'o', kind: 'change', target: 'time', reason: 'r', suggestion: '', raisedBy: 'zhouting', raisedAt: NOW, prevStatus: 'in_progress', stage: 'review' } })];
    const items = R.closeCheckItems(p, ms, ts);
    expect(items.map((i) => [i.kind, i.id])).toEqual([['meeting', 'mt1'], ['task', 'tk3'], ['objection', 'tk3']]);
    expect(items[0].reason).toContain('待终审');
    expect(() => R.startClose(p, 'zhaolei', items, NOW)).toThrow('只有项目负责人');
    expect(R.startClose(p, 'linxiao', items, NOW)).toBe(false);
    expect(p.status).toBe('active');
    expect(p.closeCheck).toMatchObject({ ok: false, items });
  });

  it('检查通过 → 结项中 → 审核通过 → 已归档；结项中不能新建会议，已归档全部只读', () => {
    const p = project();
    expect(R.startClose(p, 'linxiao', R.closeCheckItems(p, [meeting({ status: 'ended' })], [task({ status: 'done' })]), NOW)).toBe(true);
    expect(p.status).toBe('closing');
    expect(() => R.assertProjectActive(p)).toThrow('正在结项');
    expect(() => R.startClose(p, 'linxiao', [], NOW)).toThrow('已经在结项中');
    expect(() => R.approveSummary(p, 'linxiao', NOW)).toThrow('还没有生成好');
    p.summary = { id: 'r', kind: 'summary', generatedAt: NOW, markdown: '#', stats: { total: 1, done: 1, cancelled: 0, overdue: 0, onTime: 1, late: 0, completionRate: 100 } };
    expect(() => R.approveSummary(p, 'zhaolei', NOW)).toThrow('只有项目负责人');
    R.approveSummary(p, 'linxiao', NOW + 1);
    expect(p).toMatchObject({ status: 'archived', archivedAt: NOW + 1 });
    expect(p.summary.approvedBy).toBe('linxiao');
    expect(() => R.assertProjectNotArchived(p)).toThrow('已归档');
    expect(() => R.approveSummary(p, 'linxiao', NOW)).toThrow('已归档');
    expect(() => R.startClose(p, 'linxiao', [], NOW)).toThrow('已归档');
    expect(() => R.applyMembers(p, 'linxiao', ['linxiao'], [], [], (x) => x)).toThrow('已归档');
  });

  it('成员自动加入不重复；有未完成事项的成员不能移除；负责人不能移除', () => {
    const p = project({ memberIds: ['linxiao', 'zhaolei', 'zhouting', 'sunhao'] });
    expect(R.ensureMembers(p, ['zhaolei', 'liuyang', null, 'liuyang'])).toEqual(['liuyang']);
    const ms = [meeting({ status: 'pending_confirm', confirmations: [{ personId: 'sunhao', status: 'pending' }] })];
    const ts = [task({ status: 'in_progress', assigneeId: 'zhouting' }), task({ id: 'tk2', status: 'done', assigneeId: 'zhaolei', ownerId: 'zhaolei' })];
    expect(R.memberOpenItems('zhouting', p, ms, ts)).toEqual(['主控芯片到货跟踪']);
    expect(R.memberOpenItems('liuyang', p, ms, ts)).toEqual(['主控芯片到货跟踪']); // 任务负责人
    expect(() => R.applyMembers(p, 'zhaolei', ['linxiao'], ms, ts, (x) => x)).toThrow('只有项目负责人');
    expect(() => R.applyMembers(p, 'linxiao', ['linxiao', 'zhaolei', 'sunhao', 'liuyang'], ms, ts, (x) => x)).toThrow('zhouting：该成员还有未完成事项');
    expect(() => R.applyMembers(p, 'linxiao', ['linxiao', 'zhaolei', 'zhouting', 'liuyang'], ms, ts, (x) => x)).toThrow('该成员还有未完成事项');
    const r = R.applyMembers(p, 'linxiao', ['zhouting', 'sunhao', 'liuyang', 'wugang'], ms, ts, (x) => x); // 移除赵磊（任务已完成），负责人自动保留
    expect(r).toEqual({ added: ['wugang'], removed: ['zhaolei'] });
    expect(p.memberIds).toEqual(['linxiao', 'zhouting', 'sunhao', 'liuyang', 'wugang']);
  });
});
