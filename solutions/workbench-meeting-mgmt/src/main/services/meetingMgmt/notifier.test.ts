import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { MmLink, MmNotice, MmNoticeType } from '../../../shared/meetingMgmt/types';
import { cardSummary, noticeButtonText, noticeCard, noticeTypeLabel } from './notifier';
import { TEXTCARD_LIMITS, WecomClient, clearWecomTokenCache } from './wecom';

const notice = (over: Partial<MmNotice> & Pick<MmNotice, 'type'>): MmNotice => ({
  id: 'n1', at: 0, to: 'lin', title: '标题', summary: '', link: { kind: 'meeting', id: 'm1' }, read: false, ...over,
});
const linkFor = vi.fn((personId: string, link: MmLink) => `https://m.test/p/${personId}/${link.kind}/${link.id}${link.anchor ? `#${link.anchor}` : ''}`);
const ctx = { linkFor };
/** 取 description 里各行的文字（去掉标签、还原转义） */
const rows = (html: string): Array<{ cls: string; text: string }> =>
  [...html.matchAll(/<div class="(\w+)">([\s\S]*?)<\/div>/g)].map((m) => ({ cls: m[1], text: m[2].replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&amp;/g, '&') }));

beforeEach(() => { linkFor.mockClear(); });

describe('noticeCard', () => {
  it('正式纪要 = 会议主题 + 3 行摘要；按钮「查看」；链接按接收人生成', () => {
    const card = noticeCard(notice({
      type: 'minutes_final', to: 'zhou', title: 'Q4 产品评审会',
      summary: '1. 确定 12 月上线 V2\n2. 市场部负责发布会\n3. 研发 11-30 前提测\n4. 第四行不该出现',
      link: { kind: 'meeting', id: 'm9' },
    }), ctx);
    expect(card.title).toBe('Q4 产品评审会');
    expect(rows(card.description)).toEqual([
      { cls: 'gray', text: '正式纪要已生成' },
      { cls: 'normal', text: '确定 12 月上线 V2' },
      { cls: 'normal', text: '市场部负责发布会' },
      { cls: 'normal', text: '研发 11-30 前提测' },
    ]);
    expect(card.btntxt).toBe('查看');
    expect(card.url).toBe('https://m.test/p/zhou/meeting/m9');
    expect(linkFor).toHaveBeenCalledWith('zhou', { kind: 'meeting', id: 'm9' });
  });

  it('正式纪要只有一段话：按句拆成 3 行', () => {
    const card = noticeCard(notice({ type: 'minutes_final', summary: '一是定方案。二是排人手；三是定时间！四是多余的。' }), ctx);
    expect(rows(card.description).slice(1).map((r) => r.text)).toEqual(['一是定方案。', '二是排人手；', '三是定时间！']);
  });

  it('执行方案 = 任务名 + 截止；超过 3 项写「等共 N 项任务」；按钮「去确认」', () => {
    const items = Array.from({ length: 5 }, (_, i) => ({ title: `任务${i + 1}`, due: `2026-12-0${i + 1}` }));
    const card = noticeCard(notice({ type: 'plan_confirm', title: '执行方案待确认：Q4 评审会', summary: cardSummary.plan(items), link: { kind: 'meeting_plan', id: 'm1' } }), ctx);
    expect(rows(card.description).map((r) => r.text)).toEqual(['执行方案待确认', '任务1（截止 2026-12-01）', '任务2（截止 2026-12-02）', '…等共 5 项任务']);
    expect(card.btntxt).toBe('去确认');
    const three = noticeCard(notice({ type: 'task_new', summary: cardSummary.plan(items.slice(0, 3)) }), ctx);
    expect(rows(three.description)).toHaveLength(4);
  });

  it('进度汇总报告 = 完成率 + 逾期数（高亮）', () => {
    const card = noticeCard(notice({ type: 'progress_report', summary: cardSummary.report({ completionRate: 66.6, done: 4, total: 6, overdue: 2 }) }), ctx);
    expect(rows(card.description)).toEqual([{ cls: 'gray', text: '进度汇总报告' }, { cls: 'highlight', text: '完成率 67%（4/6） · 逾期 2 项' }]);
    expect(card.btntxt).toBe('查看');
  });

  it('总结 = 项目已归档', () => {
    const card = noticeCard(notice({ type: 'project_archived', title: '项目已归档：官网改版', summary: '' }), ctx);
    expect(rows(card.description).map((r) => r.text)).toEqual(['项目已归档', '项目已归档，项目内容转为只读，总结报告可在系统内查看']);
    expect(card.btntxt).toBe('查看');
  });

  it('其它事件：一句话摘要（第一行；太长取第一句并截断）', () => {
    const card = noticeCard(notice({ type: 'objection_review', summary: '研发部对「接口联调」提出异议：时间太紧。建议延后一周。\n第二行不要' }), ctx);
    expect(rows(card.description).map((r) => r.text)).toEqual(['异议待复核', '研发部对「接口联调」提出异议：时间太紧。建议延后一周。']);
    const long = noticeCard(notice({ type: 'arbitration', summary: `${'很长'.repeat(40)}。后面一句` }), ctx);
    expect(Array.from(rows(long.description)[1].text).length).toBeLessThanOrEqual(60);
    expect(rows(long.description)[1].text.endsWith('…')).toBe(true);
  });

  it('没有摘要：只有事件名那一行；没有标题：用事件名', () => {
    const card = noticeCard(notice({ type: 'task_done', title: '', summary: '' }), ctx);
    expect(card.title).toBe('任务已完成');
    expect(rows(card.description)).toEqual([{ cls: 'gray', text: '任务已完成' }]);
  });

  it('内网链接提醒放在卡片最后一行灰字；正文太长时先删正文行，提醒留着', () => {
    const foot = '公司内网链接：手机连公司 Wi-Fi 才能打开，用 4G 打不开';
    const card = noticeCard(notice({ type: 'task_done', summary: '「接口联调」已完成' }), { ...ctx, footnote: foot });
    expect(rows(card.description).at(-1)).toEqual({ cls: 'gray', text: foot });
    const long = noticeCard(notice({ type: 'plan_confirm', summary: Array.from({ length: 12 }, (_, i) => `任务${i}：${'很长的任务说明'.repeat(6)}`).join('\n') }), { ...ctx, footnote: foot });
    expect(Array.from(long.description).length).toBeLessThanOrEqual(TEXTCARD_LIMITS.description);
    expect(rows(long.description).at(-1)).toEqual({ cls: 'gray', text: foot });
  });

  it('逾期 / 到期提醒正文高亮', () => {
    const card = noticeCard(notice({ type: 'task_overdue', summary: '「接口联调」已逾期 2 天（截止 2026-11-14）' }), ctx);
    expect(rows(card.description)[1]).toEqual({ cls: 'highlight', text: '「接口联调」已逾期 2 天（截止 2026-11-14）' });
  });

  it('用户内容一律转义（不会被当成 HTML 标签）', () => {
    const card = noticeCard(notice({ type: 'minutes_final', title: '<script>', summary: '<b>加粗</b> & "引号"' }), ctx);
    expect(card.description).toContain('&lt;b&gt;加粗&lt;/b&gt; &amp; &quot;引号&quot;');
    expect(card.description).not.toContain('<b>');
  });

  it('再长也不超过企微上限：标题 128 字、描述 512 字、按钮 4 字', () => {
    const card = noticeCard(notice({ type: 'plan_confirm', title: '题'.repeat(300), summary: Array.from({ length: 3 }, () => '&'.repeat(200)).join('\n') }), ctx);
    expect(Array.from(card.title).length).toBeLessThanOrEqual(TEXTCARD_LIMITS.title);
    expect(Array.from(card.description).length).toBeLessThanOrEqual(TEXTCARD_LIMITS.description);
    expect(card.description.startsWith('<div class="gray">')).toBe(true);
  });

  it('每种事件都有事件名和 ≤ 4 字的按钮；待办类按钮按要做的事', () => {
    const all: MmNoticeType[] = ['speech_confirm', 'speech_remind', 'minutes_review', 'minutes_final', 'plan_confirm', 'task_new', 'task_progress_remind', 'task_due_remind', 'task_overdue', 'objection_review', 'plan_adjusted', 'arbitration', 'arbitration_result', 'progress_report', 'summary_review', 'project_archived', 'task_done'];
    for (const t of all) {
      expect(noticeTypeLabel(t)).toBeTruthy();
      expect(Array.from(noticeButtonText(t)).length).toBeLessThanOrEqual(4);
    }
    expect(Object.fromEntries(all.map((t) => [t, noticeButtonText(t)]))).toEqual({
      speech_confirm: '去确认', speech_remind: '去确认', minutes_review: '去终审', minutes_final: '查看',
      plan_confirm: '去确认', task_new: '去接收', task_progress_remind: '去更新', task_due_remind: '去更新', task_overdue: '查看',
      objection_review: '去复核', plan_adjusted: '去接收', arbitration: '去裁决', arbitration_result: '查看',
      progress_report: '查看', summary_review: '去审核', project_archived: '查看', task_done: '查看',
    });
  });
});

describe('cardSummary', () => {
  it('纪要取前 3 行、去空行；任务带截止；没有截止只写任务名', () => {
    expect(cardSummary.minutes([' a ', '', 'b', 'c', 'd'])).toBe('a\nb\nc');
    expect(cardSummary.task({ title: ' 联调 ', due: '2026-11-20' })).toBe('联调（截止 2026-11-20）');
    expect(cardSummary.task({ title: '联调', due: '' })).toBe('联调');
  });
});

describe('noticeCard → WecomClient.sendCard', () => {
  it('卡片描述原样发出（不二次转义）', async () => {
    clearWecomTokenCache();
    const bodies: any[] = [];
    const f = (async (input: string | URL | Request, init?: RequestInit) => {
      const api = new URL(String(input)).pathname;
      if (api.endsWith('gettoken')) return new Response(JSON.stringify({ errcode: 0, access_token: 't', expires_in: 7200 }));
      bodies.push(JSON.parse(String(init?.body)));
      return new Response(JSON.stringify({ errcode: 0 }));
    }) as unknown as typeof fetch;
    const card = noticeCard(notice({ type: 'speech_confirm', title: '请确认你在「Q4 评审会」的发言', summary: 'A & B 的发言共 12 段' }), ctx);
    const r = await new WecomClient({ corpId: 'ww1', agentId: '1', secret: 's' }, f).sendCard(['lin'], card);
    expect(r.ok).toBe(true);
    expect(bodies[0].textcard).toEqual({ title: card.title, description: card.description, url: card.url, btntxt: '去确认' });
    expect(bodies[0].textcard.description).toContain('A &amp; B');
  });
});
