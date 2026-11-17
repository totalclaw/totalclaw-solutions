import { describe, expect, it } from 'vitest';
import type { MmSegment } from '../../../../shared/meetingMgmt/types';
import { fallbackDecisions, fallbackTopics, organizeMinutes, transcriptForLlm } from './organize';

const segs: MmSegment[] = [
  { id: 'seg_1', start: 0, end: 20, speakerLabel: 'S1', text: '今天主要讨论二期上线计划和测试安排。' },
  { id: 'seg_2', start: 21, end: 50, speakerLabel: 'S2', text: '后端接口已经完成八成，预计下周三之前全部完成。' },
  { id: 'seg_3', start: 51, end: 70, speakerLabel: 'S1', text: '那我们决定 11 月 30 日上线，研发部负责发布。' },
  { id: 'seg_4', start: 71, end: 90, speakerLabel: 'S3', text: '测试组需要提前两天拿到版本吗？' },
  { id: 'seg_5', start: 91, end: 120, speakerLabel: 'S1', text: '对，测试部负责在 11 月 28 日前完成回归测试。另外下次会议再说预算。' },
];
const names = { S1: '林晓', S2: '王建国', S3: 'S3' };

describe('organizeMinutes：模型可用', () => {
  it('按模型的议题 / 决议 / 摘要整理，段号回填到 topicId，没被认领的段接到前一个议题', async () => {
    let prompt = '';
    const llm = async (p: string) => {
      prompt = p;
      return JSON.stringify({
        topics: [{ title: '上线计划', segments: [1, 2, 3] }, { title: '测试安排', segments: [5] }],
        decisions: [
          { text: '11 月 30 日上线，研发部负责发布', segments: [3] },
          { text: '测试部 11 月 28 日前完成回归测试' },
          { text: '12 月 5 日前完成验收' },   // 原文里没有 12 / 5：丢掉
        ],
        summary: ['确定 11 月 30 日上线。', '测试部负责回归测试。', '预算 50 万下次再议。'],
      });
    };
    const r = await organizeMinutes({ segments: segs, speakerNames: names, attendeeNames: ['林晓', '王建国'], llm });
    expect(prompt).toContain('#3 [00:00:51] 林晓: 那我们决定');
    expect(r.source).toBe('llm');
    expect(r.topics.map(t => t.title)).toEqual(['上线计划', '测试安排']);
    // seg_4 没被认领：接到时间上前一个议题
    expect(r.topics[0]!.segmentIds).toEqual(['seg_1', 'seg_2', 'seg_3', 'seg_4']);
    expect(r.topics[1]!.segmentIds).toEqual(['seg_5']);
    expect(r.segments.find(s => s.id === 'seg_4')!.topicId).toBe(r.topics[0]!.id);
    expect(r.decisions.map(d => d.text)).toEqual(['11 月 30 日上线，研发部负责发布', '测试部 11 月 28 日前完成回归测试']);
    expect(r.decisions[0]!.segmentIds).toEqual(['seg_3']);
    expect(r.decisions[1]!.segmentIds).toEqual(['seg_5']); // 没给段号：按字面重合找到
    // 摘要第 3 行带了原文没有的「50」：删掉后用规则补齐到 3 行
    expect(r.summaryLines).toHaveLength(3);
    expect(r.summaryLines.join('')).not.toContain('50');
  });
});

describe('organizeMinutes：兜底', () => {
  it('模型不可用（null）：规则抽决议、时间线议题、各议题首句做摘要', async () => {
    const r = await organizeMinutes({ segments: segs, speakerNames: names, attendeeNames: [], llm: async () => null });
    expect(r.source).toBe('rules');
    expect(r.note).toMatch(/模型不可用/);
    expect(r.topics).toHaveLength(1);
    expect(r.topics[0]!.segmentIds).toHaveLength(5);
    expect(r.decisions.map(d => d.text)).toEqual([
      '后端接口已经完成八成，预计下周三之前全部完成。',
      '那我们决定 11 月 30 日上线，研发部负责发布。',
      '对，测试部负责在 11 月 28 日前完成回归测试。',
    ]);
    expect(r.summaryLines.length).toBeGreaterThan(0);
    expect(r.summaryLines.length).toBeLessThanOrEqual(3);
  });

  it('模型返回的不是 JSON / 段号全不对 / 抛错：都走兜底，流程不断', async () => {
    for (const llm of [
      async () => '抱歉，我无法处理',
      async () => JSON.stringify({ topics: [{ title: 'x', segments: [99] }], decisions: [], summary: [] }),
      async () => { throw new Error('boom'); },
    ]) {
      const r = await organizeMinutes({ segments: segs, speakerNames: names, attendeeNames: [], llm });
      expect(r.source).toBe('rules');
      expect(r.decisions.length).toBeGreaterThan(0);
      expect(r.topics.length).toBeGreaterThan(0);
    }
  });

  it('长会议按约 10 分钟分议题', () => {
    const long: MmSegment[] = Array.from({ length: 60 }, (_, k) => ({ id: `seg_${k + 1}`, start: k * 60, end: k * 60 + 50, speakerLabel: 'S1', text: `第${k + 1}分钟讨论的内容比较长一些。` }));
    const t = fallbackTopics(long);
    expect(t.length).toBeGreaterThanOrEqual(5);
    expect(t.length).toBeLessThanOrEqual(7);
    expect(t.flatMap(x => x.segmentIds)).toHaveLength(60);
  });

  it('问句不当决议；同一句不重复', () => {
    const d = fallbackDecisions([
      { id: 'a', start: 0, end: 1, speakerLabel: 'S1', text: '这个需要谁负责呢？需要研发部负责完成。需要研发部负责完成。' },
    ]);
    expect(d.map(x => x.text)).toEqual(['需要研发部负责完成。']);
  });

  it('超长文字稿按比例截短每段', () => {
    const many: MmSegment[] = Array.from({ length: 200 }, (_, k) => ({ id: `s${k}`, start: k, end: k + 1, speakerLabel: 'S1', text: '很长的内容'.repeat(100) }));
    const t = transcriptForLlm(many, {}, 20_000);
    expect(t.length).toBeLessThan(30_000);
    expect(t.split('\n')).toHaveLength(200);
  });
});
