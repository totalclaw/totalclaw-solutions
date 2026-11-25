/**
 * 会议智能管理 · MeetingMgmtService.dispatch：权限（按角色、越权抛中文错误、手机页禁用动作）、
 * 从新建项目一路走到归档的完整闭环（文字记录 → 确认 → 退回 → 终审 → 方案 → 派发 → 异议四条支路 → 结项 → 归档只读）、
 * 通知（消息中心 + 企微卡片）、定时提醒、手机页令牌、声纹、演示数据。
 * 落盘是真的（临时目录）；流水线、企微、手机页服务、钥匙串换成替身。
 */
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

vi.mock('../accountScope', () => ({ accountPath: (...sub: string[]) => join(tmpdir(), 'mm-svc-unused', ...sub) }));
vi.mock('../sealedSecret', () => ({ canSealSecret: () => true, sealSecret: (s: string) => `S:${s}`, unsealSecret: (s: string) => s.slice(2) }));
vi.mock('./pipeline/index', () => ({
  runMeetingPipeline: vi.fn(), generatePlan: vi.fn(), generateWeeklyReport: vi.fn(), generateProjectSummary: vi.fn(),
  enrollVoiceprint: vi.fn(), exportSpeakerClip: vi.fn(), buildReportStats: vi.fn(),
}));
vi.mock('./mobile/server', () => ({
  startMeetingMobileServer: vi.fn(),
  buildMobileUrl: (b: string, t: string, link?: { kind: string; id: string } | null) => `${b}/m?t=${t}#/${link ? `${link.kind}/${link.id}` : 'home'}`,
  buildVoiceprintUrl: (b: string, t: string) => `${b}/v?t=${t}`,
  buildGroupUrl: (b: string, link?: { kind: string; id: string } | null, page?: string) => (page === 'voiceprint' ? `${b}/g?p=v` : `${b}/g#/${link ? `${link.kind}/${link.id}` : 'home'}`),
  isLanOnlyUrl: (u: string) => /^https?:\/\/(192\.168\.|10\.|127\.|localhost)/.test(u),
}));

import type { MmEvent, MmMeeting, MmNotice, MmDept, MmPerson, MmProject, MmReport, MmTaskView } from '../../../shared/meetingMgmt/types';
import { MeetingMgmtStore } from './store';
import { MeetingMgmtService, fileKindOf, type MmExternals, type PipelineInputLike } from './service';
import { diffOrg } from './wecom';
import { dueReminders } from './scheduler';

const NOW = new Date(2026, 10, 16, 10, 0, 0).getTime(); // 周一 10:00
const HOUR = 3_600_000;
let tmp = '';
beforeAll(() => { tmp = mkdtempSync(join(tmpdir(), 'mm-svc-')); });
afterAll(() => rmSync(tmp, { recursive: true, force: true }));

const stats = { total: 3, done: 3, cancelled: 0, overdue: 0, onTime: 3, late: 0, completionRate: 100 };

/** 替身流水线：参会人逐个按昵称认出；unknown = 再多一个没认出的发言人 */
function fakePipeline(opts: { unknown?: boolean; fail?: string } = {}) {
  return vi.fn(async (i: PipelineInputLike) => {
    i.onStage('parse', 40, '解析文字记录');
    i.onStage('organize', 80);
    if (opts.fail) throw new Error(opts.fail);
    const people = i.attendees;
    const segments = people.map((p, k) => ({ id: `g${k + 1}`, start: k * 10, end: k * 10 + 8, speakerLabel: p.name, text: `${p.name}的发言` }));
    const speakers: any[] = people.map((p) => ({ label: p.name, personId: p.id, matchedBy: 'nickname' }));
    if (opts.unknown) { segments.push({ id: 'g99', start: 99, end: 100, speakerLabel: 'S9', text: '没认出的人' }); speakers.push({ label: 'S9' }); }
    return {
      segments, speakers, topics: [{ id: 't1', title: '到货安排', segmentIds: segments.map((s) => s.id) }],
      decisions: [{ id: 'd1', text: '采购部每周同步到货进度', segmentIds: ['g1'] }], summaryLines: ['设备分三批到货', '下周完成地面改造', '每周同步进度'], durationSec: 200,
    };
  });
}

function make(dirName: string, over: Partial<MmExternals> = {}) {
  const clock = { now: NOW };
  const events: MmEvent[] = [];
  const wecom = {
    test: vi.fn(async () => ({ ok: true })),
    fetchOrg: vi.fn(async () => ({ depts: [] as MmDept[], people: [] as MmPerson[] })),
    sendCard: vi.fn(async (_to: string[], _card: any): Promise<{ ok: boolean; error?: string; invalidUsers?: string[] }> => ({ ok: true })),
  };
  const mobileStop = vi.fn(async () => {});
  const webhook = {
    send: vi.fn(async (_m: any): Promise<{ ok: boolean; error?: string }> => ({ ok: true })),
    sendMarkdown: vi.fn(async (_content: string): Promise<{ ok: boolean; error?: string }> => ({ ok: true })),
    test: vi.fn(async () => ({ ok: true })),
  };
  const ext: MmExternals = {
    runMeetingPipeline: fakePipeline(),
    generatePlan: vi.fn(async ({ meeting }) => ({
      generatedAt: clock.now, summary: '按决议拆为 3 项',
      items: [
        { id: 'pi_a', deptId: 'd_pur', title: '设备到货跟踪', standard: '每周同步到货进度', due: '2026-12-01', decisionId: meeting.decisions[0]?.id },
        { id: 'pi_b', deptId: 'd_prod', title: '地面改造', standard: '下周完成', due: '2026-11-25' },
      ],
    })),
    organizeMinutes: vi.fn(async ({ segments, speakerNames }) => ({
      segments: segments.map((x: any) => ({ ...x, topicId: 'tp_1' })),
      topics: [{ id: 'tp_1', title: '重新整理的议题', segmentIds: segments.map((x: any) => x.id) }],
      decisions: [{ id: 'dc_1', text: `${Object.values(speakerNames)[0]} 负责跟进`, segmentIds: [segments[0].id] }],
      summaryLines: ['新摘要一', '新摘要二'],
    })),
    generateWeeklyReport: vi.fn(async ({ from, to }) => ({ id: '', kind: 'weekly' as const, generatedAt: clock.now, periodFrom: from, periodTo: to, markdown: '# 周报', stats })),
    generateProjectSummary: vi.fn(async () => ({ id: '', kind: 'summary' as const, generatedAt: clock.now, markdown: '# 项目总结', stats })),
    enrollVoiceprint: vi.fn(async () => ({ ok: true as const, vector: [0.6, 0.8], seconds: 12 })),
    meetingVoiceSample: vi.fn(async () => null),
    exportSpeakerClip: vi.fn(async ({ workDir, label }) => { const p = join(workDir, `clip-${label}.wav`); writeFileSync(p, 'RIFF-fake'); return p; }),
    createWecom: vi.fn(() => wecom),
    createWebhook: vi.fn(() => webhook),
    checkRuntime: vi.fn(async () => ({ python: true, ffmpeg: true, asrModel: 'small', speaker: true, modelsDir: tmp })),
    detectHardware: vi.fn(() => ({ cpu: 'Apple M5 Pro', cores: 18, memGb: 24, arch: 'arm64', platform: 'darwin', appleSilicon: true, freeDiskGb: 120 })),
    cloudTranscribe: vi.fn(async () => ({ ok: true, text: '' })),
    segmentAudio: vi.fn((_dir: string, start: number, end: number) => Buffer.from(`wav:${start.toFixed(1)}-${end.toFixed(1)}`).toString('base64')),
    diffOrg,
    noticeCard: (n, ctx) => ({ title: n.title, description: n.summary + (ctx.footnote ? `|${ctx.footnote}` : ''), url: ctx.linkFor(n.to, n.link), btntxt: '查看' }),
    dueReminders: vi.fn(() => []),
    startScheduler: vi.fn(() => () => {}),
    startMobileServer: vi.fn(async () => ({ url: 'http://192.168.1.5:8280', port: 8280, stop: mobileStop })),
    seal: { can: () => true, seal: (s) => `S:${s}`, unseal: (s) => s.slice(2) },
    ...over,
  };
  const store = new MeetingMgmtStore(() => join(tmp, dirName));
  const svc = new MeetingMgmtService({ store, llm: async () => null, emit: (e) => events.push(e), now: () => clock.now, ext, logger: { warn: vi.fn(), info: vi.fn() } });
  const call = <R = any>(actor: string | null, action: string, payload: unknown = {}, origin: 'pc' | 'mobile' = 'pc'): Promise<R> => svc.dispatch(actor, action, payload, origin) as Promise<R>;
  /** 新发的通知（不含演示数据里预置的 nt_demo_*） */
  const notices = (to?: string, type?: string): MmNotice[] => store.read().notices.filter((n) => !n.id.startsWith('nt_demo') && (!to || n.to === to) && (!type || n.type === type));
  return { svc, store, clock, events, ext, wecom, webhook, mobileStop, call, notices };
}

describe('第一次使用与身份', () => {
  const t = make('first');

  it('第一次打开：自动载入演示组织，林晓是管理员和当前身份', async () => {
    expect(t.svc.pcActorId()).toBe('linxiao');
    const boot = await t.svc.dispatchPc('boot', {}) as any;
    expect(boot.me).toMatchObject({ person: { name: '林晓' }, isAdmin: true, canCreateProject: true });
    expect(boot.org).toMatchObject({ source: 'demo', deptCount: 6, peopleCount: 20 });
    expect(boot).toMatchObject({ wecomConnected: false, mobile: { running: false }, badges: { home: 5, meetings: 3, tasks: 2 }, canSwitchIdentity: true, operatorId: 'linxiao' });
    expect(t.store.read().settings.adminIds).toEqual(['linxiao']);
  });

  it('管理员切成普通成员代办，还能切回来；界面拿得到本机管理员', async () => {
    expect((await t.call('linxiao', 'identity.set', { personId: 'zhouting' }) as any).person.name).toBe('周婷');
    expect(t.svc.pcActorId()).toBe('zhouting');
    const boot = await t.svc.dispatchPc('boot', {}) as any;
    expect(boot.me.isAdmin).toBe(false);
    expect(boot).toMatchObject({ canSwitchIdentity: true, operator: { id: 'linxiao', name: '林晓' } });
    await expect(t.svc.dispatchPc('settings.save', { patch: { dueRemindDays: 3 } })).rejects.toThrow('只有管理员');
    await t.svc.dispatchPc('identity.set', { personId: 'linxiao' });
    expect(t.svc.pcActorId()).toBe('linxiao');
    await expect(t.call('zhouting', 'identity.set', { personId: 'linxiao' }, 'mobile')).rejects.toThrow('手机页不能执行');
    await expect(t.call('linxiao', 'identity.set', { personId: 'nobody' })).rejects.toThrow('不在组织里');
  });

  it('本机操作人也不是管理员时不能切身份；还没有管理员时第一个选的人成为管理员', async () => {
    t.store.update((s) => { s.operatorId = 'wugang'; });
    await expect(t.call('zhouting', 'identity.set', { personId: 'linxiao' })).rejects.toThrow('只有管理员可以切换身份');
    t.store.update((s) => { s.settings.adminIds = []; s.operatorId = null; });
    await t.call('zhouting', 'identity.set', { personId: 'zhaolei' });
    expect(t.store.read().settings.adminIds).toEqual(['zhaolei']);
    expect(t.store.read().operatorId).toBe('zhaolei');
  });

  it('身份无效（不存在 / 已离职）时只给 boot、people.list', async () => {
    await expect(t.call(null, 'home.get')).rejects.toThrow('当前身份无效');
    t.store.update((s) => { s.org.people.find((p) => p.id === 'hejing')!.left = true; });
    await expect(t.call('hejing', 'task.list', { view: 'received' })).rejects.toThrow('当前身份无效');
    expect(((await t.call(null, 'people.list')) as any).people.some((p: MmPerson) => p.id === 'hejing')).toBe(false);
    expect(((await t.call(null, 'boot')) as any).me.person).toBeNull();
  });
});

describe('权限', () => {
  const t = make('perm');
  const cases: Array<[string, string, unknown, string]> = [
    ['zhouting', 'settings.save', { patch: {} }, '只有管理员'],
    ['zhouting', 'wecom.save', { corpId: 'x', agentId: '1' }, '只有管理员'],
    ['zhouting', 'org.sync', {}, '只有管理员'],
    ['zhouting', 'mobile.start', {}, '只有管理员'],
    ['zhouting', 'demo.clear', {}, '只有管理员'],
    ['zhouting', 'project.create', { name: 'x', ownerId: 'zhouting' }, '只有管理员或被授权的人可以新建项目'],
    ['qiancheng', 'project.get', { id: 'pj_dfactory' }, '你不是这个项目的成员'],
    ['qiancheng', 'meeting.get', { id: 'mt_df_weekly' }, '你没有参与这场会议'],
    ['qiancheng', 'task.get', { id: 'mt_df_kickoff_k1' }, '你没有参与这个任务'],
    ['qiancheng', 'meeting.create', { projectId: 'pj_dfactory', title: 'x' }, '你不是这个项目的成员'],
    ['zhaolei', 'meeting.upload', { id: 'mt_a2_weekly', paths: ['/x'] }, '只有主持人'],
    ['zhaolei', 'meeting.review.approve', { id: 'mt_df_weekly' }, '只有主持人'],
    ['linxiao', 'meeting.decide', { id: 'mt_east_equip', decision: 'none' }, '只有主持人'],
    ['wugang', 'meeting.plan.save', { id: 'mt_east_plan', items: [] }, '只有任务负责人'],
    ['liuyang', 'task.accept', { id: 'mt_df_kickoff_k1' }, '只有接收任务的部门负责人'],
    ['zhouting', 'task.objection.arbitrate', { id: 'mt_df_kickoff_k1', decision: 'keep' }, '只有项目负责人可以裁决'],
    ['linxiao', 'task.objection.review', { id: 'mt_a2_kickoff_k4', decision: 'adopt' }, '只有任务负责人可以复核异议'],
    ['zhaolei', 'project.close', { id: 'pj_dfactory' }, '只有项目负责人'],
    ['zhaolei', 'project.members', { id: 'pj_dfactory', memberIds: [] }, '只有项目负责人'],
    ['zhaolei', 'voiceprint.enroll', { personId: 'wugang', path: '/x', consent: true }, '只能采集本人'],
    ['zhaolei', 'mobile.link', { personId: 'wugang' }, '只能查看本人的专属链接'],
    ['linxiao', 'meeting.pickFiles', { id: 'x' }, '只能在电脑端'],
    ['linxiao', 'no.such.action', {}, '未知操作'],
  ];
  it.each(cases)('%s 做 %s → 拒绝', async (actor, action, payload, msg) => {
    await expect(t.call(actor, action, payload)).rejects.toThrow(msg);
  });

  it('确认方案前方案负责人还没定：方案待确认只给任务负责人', async () => {
    // 林晓是扩产规划评审会的任务负责人：能确认（演示数据的部门负责人都在）
    const m = await t.call<MmMeeting>('linxiao', 'meeting.plan.confirm', { id: 'mt_east_plan' });
    expect(m.status).toBe('dispatched');
  });

  it('手机页不能执行电脑端专属动作', async () => {
    for (const a of ['demo.load', 'settings.save', 'wecom.save', 'org.sync', 'mobile.start', 'voiceprint.send', 'file.open']) {
      await expect(t.call('linxiao', a, {}, 'mobile')).rejects.toThrow(/手机页不能执行|只能在电脑端/);
    }
  });

  it('项目列表只返回我参与的；卡片带名字和完成率', async () => {
    const list = await t.call<any[]>('qiancheng', 'project.list');
    expect(list.map((p) => p.name)).toEqual(['A2 量产导入项目']);
    expect(list[0]).toMatchObject({ ownerName: '陈立峰', total: 4, done: 0, rate: 0 });
  });
});

describe('完整闭环：新建项目 → 会议 → 纪要 → 方案 → 任务 → 异议 → 结项 → 归档', () => {
  const t = make('loop');
  let project: MmProject;
  let meeting: MmMeeting;
  const tasks: Record<string, MmTaskView> = {};

  it('新建项目与会议：主持人、参会人自动成为项目成员', async () => {
    project = await t.call<MmProject>('linxiao', 'project.create', { name: '华东基地设备到货', desc: '新线设备', ownerId: 'linxiao', memberIds: [] });
    meeting = await t.call<MmMeeting>('linxiao', 'meeting.create', { projectId: project.id, title: '设备到货协调会', time: NOW - HOUR, hostId: 'linxiao', attendeeIds: ['zhouting', 'wugang', 'zhengkai'] });
    expect(meeting.status).toBe('pending_upload');
    const p = await t.call<any>('linxiao', 'project.get', { id: project.id });
    expect(p.project.memberIds.sort()).toEqual(['linxiao', 'wugang', 'zhengkai', 'zhouting']);
    expect(p.can).toMatchObject({ editMembers: true, close: true, createMeeting: true });
  });

  it('上传文字记录：拷进数据目录、异步处理、按昵称认出发言人 → 待确认，通知发言人', async () => {
    t.events.length = 0;
    const r = await t.call<any>('linxiao', 'demo.transcript', { meetingId: meeting.id });
    expect(existsSync(r.path)).toBe(true);
    expect(r.meeting.status).toBe('processing');
    expect(r.meeting.files[0]).toMatchObject({ kind: 'transcript', name: '示例会议文字记录.txt' });
    expect(t.store.isInsideRoot(r.meeting.files[0].path)).toBe(true);
    await t.svc.idle();
    const m = (await t.call<any>('linxiao', 'meeting.get', { id: meeting.id })).meeting as MmMeeting;
    expect(m.status).toBe('pending_confirm');
    expect(m.confirmations.map((c) => c.personId).sort()).toEqual(['linxiao', 'wugang', 'zhengkai', 'zhouting']);
    expect(m.confirmations.every((c) => c.requestedAt === NOW)).toBe(true);
    expect(m.process?.log.map((l) => l.text)).toContain('解析文字记录');
    expect(t.notices(undefined, 'speech_confirm').map((n) => n.to).sort()).toEqual(['linxiao', 'wugang', 'zhengkai', 'zhouting']);
    expect(t.events.some((e) => e.type === 'process' && e.stage === 'done')).toBe(true);
    expect(t.events.some((e) => e.type === 'changed' && e.scope === 'meeting' && e.id === meeting.id)).toBe(true);
    const list = await t.call<any[]>('zhouting', 'meeting.list', { filter: 'todo' });
    expect(list.find((x) => x.id === meeting.id)).toMatchObject({ needsMe: true, confirmText: '已确认 0/4' });
    const d = await t.call<any>('zhouting', 'meeting.get', { id: meeting.id });
    expect(d.my).toEqual({ isHost: false, isSpeaker: true, isPlanOwner: false, myLabels: ['周婷'] });
  });

  it('发言人只能改本人发言；全员确认 → 待终审，通知主持人', async () => {
    const segOf = (name: string) => meetingNow().segments.find((s) => s.speakerLabel === name)!.id;
    await expect(t.call('zhouting', 'meeting.segment.edit', { id: meeting.id, segmentId: segOf('吴刚'), text: 'x' })).rejects.toThrow('只能修改本人');
    await t.call('zhouting', 'meeting.segment.edit', { id: meeting.id, segmentId: segOf('周婷'), text: '首批两台下周发货' });
    expect(meetingNow().segments.find((s) => s.speakerLabel === '周婷')).toMatchObject({ text: '首批两台下周发货', originalText: '周婷的发言', editedBy: 'zhouting' });
    for (const id of ['zhouting', 'wugang', 'zhengkai']) await t.call(id, 'meeting.confirm', { id: meeting.id });
    expect(meetingNow().status).toBe('pending_confirm');
    await t.call('linxiao', 'meeting.confirm', { id: meeting.id });
    expect(meetingNow().status).toBe('pending_review');
    expect(t.notices('linxiao', 'minutes_review')).toHaveLength(1);
  });

  it('终审退回：只让被退回的人重新确认', async () => {
    await t.call('linxiao', 'meeting.review.return', { id: meeting.id, personId: 'wugang', note: '地面改造时间说错了' });
    const m = meetingNow();
    expect(m.status).toBe('pending_confirm');
    expect(m.confirmations.filter((c) => c.status === 'pending').map((c) => c.personId)).toEqual(['wugang']);
    expect(t.notices('wugang', 'speech_confirm').at(-1)).toMatchObject({ title: '发言被退回：设备到货协调会', summary: '地面改造时间说错了' });
    await expect(t.call('zhouting', 'meeting.confirm', { id: meeting.id })).rejects.toThrow('已经确认过了');
    await t.call('wugang', 'meeting.confirm', { id: meeting.id });
    expect(meetingNow().status).toBe('pending_review');
  });

  it('主持人终审通过 → 已定稿锁定，正式纪要发给参会人（3 行摘要）', async () => {
    await t.call('linxiao', 'meeting.review.approve', { id: meeting.id });
    expect(meetingNow().status).toBe('finalized');
    const finals = t.notices(undefined, 'minutes_final');
    expect(finals.map((n) => n.to).sort()).toEqual(['linxiao', 'wugang', 'zhengkai', 'zhouting']);
    expect(finals[0].summary).toBe('设备分三批到货\n下周完成地面改造\n每周同步进度');
    // 定稿后：主持人还能修正错字，其他人不行；改发言人仍锁定
    await expect(t.call('zhouting', 'meeting.segment.edit', { id: meeting.id, segmentId: 'g1', text: 'x' })).rejects.toThrow('只有主持人');
    await t.call('linxiao', 'meeting.segment.edit', { id: meeting.id, segmentId: 'g1', text: '定稿后修正' });
    expect(t.store.read().meetings.find((x) => x.id === meeting.id)!.segments.find((x) => x.id === 'g1')!.text).toBe('定稿后修正');
    await expect(t.call('linxiao', 'meeting.segment.speaker', { id: meeting.id, segmentId: 'g1', personId: 'zhouting' })).rejects.toThrow('纪要已定稿锁定');
  });

  it('选择生成任务 → AI 方案 → 指定任务负责人（方案待确认时还能改）', async () => {
    await expect(t.call('zhouting', 'meeting.decide', { id: meeting.id, decision: 'generate' })).rejects.toThrow('只有主持人');
    const m = await t.call<MmMeeting>('linxiao', 'meeting.decide', { id: meeting.id, decision: 'generate' });
    expect(m.status).toBe('pending_owner');
    expect((t.ext.generatePlan as any).mock.calls[0][0]).toMatchObject({ today: '2026-11-16', org: expect.anything() });
    await t.call('linxiao', 'meeting.plan.owner', { id: meeting.id, ownerId: 'lina' });
    await t.call('linxiao', 'meeting.plan.owner', { id: meeting.id, ownerId: 'liuyang' });
    expect(meetingNow()).toMatchObject({ status: 'plan_confirm', plan: { ownerId: 'liuyang' } });
    expect(t.notices('lina', 'plan_confirm')).toHaveLength(1);
    expect(t.notices('liuyang', 'plan_confirm')[0].summary).toBe('设备到货跟踪（截止 2026-12-01）\n地面改造（截止 2026-11-25）');
    expect(t.store.read().projects.find((p) => p.id === project.id)!.memberIds).toContain('liuyang');
    // 多位任务负责人：刘洋 + 李娜；只通知新加进来的（李娜），刘洋不重复发
    await expect(t.call('linxiao', 'meeting.plan.owner', { id: meeting.id, ownerIds: [] })).rejects.toThrow('至少选一位');
    await t.call('linxiao', 'meeting.plan.owner', { id: meeting.id, ownerIds: ['liuyang', 'lina', 'liuyang'] });
    expect(meetingNow().plan).toMatchObject({ ownerId: 'liuyang', ownerIds: ['liuyang', 'lina'] });
    expect(t.notices('lina', 'plan_confirm')).toHaveLength(2);
    expect(t.notices('liuyang', 'plan_confirm')).toHaveLength(1);
    expect((await t.call<any>('lina', 'meeting.get', { id: meeting.id })).my.isPlanOwner).toBe(true);
  });

  it('任务负责人编辑方案（界面新加条目 id 换成正式 id）、确认 → 已派发，下发给部门第一负责人', async () => {
    await expect(t.call('linxiao', 'meeting.plan.save', { id: meeting.id, items: [] })).rejects.toThrow('只有任务负责人');
    const plan = await t.call<any>('liuyang', 'meeting.plan.save', {
      id: meeting.id, summary: '调整后的方案',
      items: [...meetingNow().plan!.items, { id: 'new-1', deptId: 'd_qa', title: '来料检验', standard: '到货 2 天内完成', due: '2026-12-03' }],
    });
    expect(plan.items).toHaveLength(3);
    expect(plan.items[2].id).not.toMatch(/^new-/);
    const m = await t.call<MmMeeting>('liuyang', 'meeting.plan.confirm', { id: meeting.id });
    expect(m.status).toBe('dispatched');
    const list = await t.call<MmTaskView[]>('liuyang', 'task.list', { view: 'assigned', meetingId: meeting.id });
    expect(list.map((x) => [x.title, x.assigneeName, x.ownerName, x.status])).toEqual([
      ['地面改造', '吴刚', '刘洋、李娜', 'to_accept'], ['设备到货跟踪', '周婷', '刘洋、李娜', 'to_accept'], ['来料检验', '孙浩', '刘洋、李娜', 'to_accept'],
    ]);
    expect(list.every((x) => JSON.stringify(x.ownerIds) === JSON.stringify(['liuyang', 'lina']))).toBe(true);
    // 第二位负责人也在「我分配的」里看得到
    expect((await t.call<MmTaskView[]>('lina', 'task.list', { view: 'assigned', meetingId: meeting.id })).length).toBe(3);
    for (const x of list) tasks[x.deptId] = x;
    expect(t.notices(undefined, 'task_new').map((n) => n.to).sort()).toEqual(['sunhao', 'wugang', 'zhouting']);
    expect(t.store.read().projects.find((p) => p.id === project.id)!.memberIds).toContain('sunhao');
  });

  it('接收 → 更新进度 → 标记完成，通知任务负责人', async () => {
    const id = tasks.d_qa.id;
    const g = await t.call<any>('sunhao', 'task.get', { id });
    expect(g.can).toMatchObject({ accept: true, object: true, progress: false, complete: false, review: false });
    await t.call('sunhao', 'task.accept', { id });
    await expect(t.call('sunhao', 'task.complete', { id })).rejects.toThrow('请先更新进度');
    expect((await t.call<MmTaskView>('sunhao', 'task.progress', { id, percent: 50, note: '检验规范已出' })).status).toBe('in_progress');
    // 进度更新：每位任务负责人收到一条，点开是这个任务；更新的人自己不收
    const prog = t.notices(undefined, 'task_progress');
    expect(prog.map((n) => n.to).sort()).toEqual(['lina', 'liuyang']);
    expect(prog[0]).toMatchObject({ title: '任务进度更新：来料检验', summary: '孙浩更新到 50%：检验规范已出', link: { kind: 'task', id } });
    expect((await t.call<MmTaskView>('sunhao', 'task.complete', { id, note: '完成' })).status).toBe('done');
    expect(t.notices('liuyang', 'task_done')[0].title).toBe('任务已完成：来料检验');
    expect(t.notices('lina', 'task_done')[0].title).toBe('任务已完成：来料检验');
  });

  it('异议支路：采纳并调整 → 部门负责人重新确认', async () => {
    const id = tasks.d_prod.id;
    await t.call('wugang', 'task.objection.raise', { id, target: 'time', reason: '施工队下周才进场', suggestion: '顺延到 11-30', suggestedDue: '2026-11-30' });
    expect(t.notices('liuyang', 'objection_review')[0]).toMatchObject({ title: '异议待复核：地面改造', summary: '吴刚：施工队下周才进场' });
    expect((await t.call<any>('liuyang', 'task.get', { id })).can.review).toBe(true);
    const v = await t.call<MmTaskView>('liuyang', 'task.objection.review', { id, decision: 'adopt', note: '同意' });
    expect(v).toMatchObject({ status: 'to_accept', due: '2026-11-30' });
    expect(t.notices('wugang', 'plan_adjusted')[0].summary).toBe('地面改造（截止 2026-11-30）');
    await t.call('wugang', 'task.accept', { id });
    await t.call('wugang', 'task.progress', { id, percent: 100, note: '改造完成' });
    await t.call('wugang', 'task.complete', { id });
  });

  it('异议支路：驳回 → 提交裁决 → 项目负责人维持原方案，结果通知双方', async () => {
    const id = tasks.d_pur.id;
    await t.call('zhouting', 'task.objection.raise', { id, target: 'time', reason: '原厂交期紧', suggestion: '推迟', suggestedDue: '2026-12-08' });
    await t.call('liuyang', 'task.objection.review', { id, decision: 'reject', note: '联调前置' });
    expect((await t.call<any>('zhouting', 'task.get', { id })).can).toMatchObject({ reply: true, escalate: true, accept: false });
    await t.call('zhouting', 'task.objection.reply', { id, decision: 'escalate' });
    expect(t.notices('linxiao', 'arbitration').at(-1)!.summary).toBe('周婷与刘洋、李娜对截止日有分歧（2026-12-01 / 2026-12-08）'); // 两位任务负责人
    const v = await t.call<MmTaskView>('linxiao', 'task.objection.arbitrate', { id, decision: 'keep', note: '按原计划' });
    expect(v).toMatchObject({ status: 'not_started', due: '2026-12-01' });
    expect(t.notices(undefined, 'arbitration_result').map((n) => n.to).sort()).toEqual(['lina', 'liuyang', 'zhouting']);
  });

  it('有未完成事项的成员不能移除；结项检查不通过列出未完成事项', async () => {
    const ids = t.store.read().projects.find((p) => p.id === project.id)!.memberIds;
    await expect(t.call('linxiao', 'project.members', { id: project.id, memberIds: ids.filter((x) => x !== 'zhouting') })).rejects.toThrow('该成员还有未完成事项');
    const ok = await t.call<MmProject>('linxiao', 'project.members', { id: project.id, memberIds: [...ids.filter((x) => x !== 'zhengkai'), 'lina'] });
    expect(ok.memberIds).not.toContain('zhengkai');
    const r = await t.call<any>('linxiao', 'project.close', { id: project.id });
    expect(r.ok).toBe(false);
    expect(r.items.map((i: any) => [i.kind, i.title])).toEqual([['task', '设备到货跟踪']]);
    expect(t.store.read().projects.find((p) => p.id === project.id)!.status).toBe('active');
  });

  it('全部完成 → 结项中（AI 生成总结，通知负责人审核）；结项中不能新建会议', async () => {
    const id = tasks.d_pur.id;
    await t.call('zhouting', 'task.progress', { id, percent: 100, note: '到货' });
    await t.call('zhouting', 'task.complete', { id });
    expect(await t.call<any>('linxiao', 'project.close', { id: project.id })).toEqual({ ok: true, items: [] });
    await t.svc.idle();
    const p = await t.call<any>('linxiao', 'project.get', { id: project.id });
    expect(p.project.status).toBe('closing');
    expect(p.project.summary).toMatchObject({ kind: 'summary', markdown: '# 项目总结' });
    expect(p.can).toMatchObject({ reviewSummary: true, close: false, createMeeting: false });
    expect(t.notices('linxiao', 'summary_review')).toHaveLength(1);
    await expect(t.call('linxiao', 'meeting.create', { projectId: project.id, title: 'x' })).rejects.toThrow('正在结项');
    await expect(t.call('zhouting', 'project.summary.save', { id: project.id, markdown: 'x' })).rejects.toThrow('只有项目负责人');
    await t.call('linxiao', 'project.summary.save', { id: project.id, markdown: '# 改过的总结' });
  });

  it('审核通过 → 已归档，通知全体成员；之后全部只读', async () => {
    await t.call('linxiao', 'project.summary.approve', { id: project.id });
    const pj = t.store.read().projects.find((p) => p.id === project.id)!;
    expect(pj).toMatchObject({ status: 'archived', summary: { markdown: '# 改过的总结', approvedBy: 'linxiao' } });
    expect(t.notices(undefined, 'project_archived').map((n) => n.to).sort()).toEqual([...pj.memberIds].sort());
    const blocked: Array<[string, string, unknown]> = [
      ['zhouting', 'task.progress', { id: tasks.d_pur.id, percent: 10 }],
      ['linxiao', 'meeting.segment.edit', { id: meeting.id, segmentId: 'g1', text: 'x' }],
      ['linxiao', 'project.members', { id: project.id, memberIds: pj.memberIds }],
      ['linxiao', 'project.close', { id: project.id }],
      ['linxiao', 'project.summary.save', { id: project.id, markdown: 'x' }],
      ['linxiao', 'project.report.generate', { id: project.id }],
      ['linxiao', 'meeting.create', { projectId: project.id, title: 'x' }],
    ];
    for (const [actor, action, payload] of blocked) await expect(t.call(actor, action, payload), action).rejects.toThrow('已归档');
    const p = await t.call<any>('linxiao', 'project.get', { id: project.id });
    expect(Object.values(p.can).every((v) => v === false)).toBe(true);
    const g = await t.call<any>('zhouting', 'task.get', { id: tasks.d_pur.id });
    expect(Object.values(g.can).every((v) => v === false)).toBe(true);
  });

  function meetingNow(): MmMeeting { return t.store.read().meetings.find((m) => m.id === meeting.id)!; }
});

describe('处理失败、重试、指认与试听', () => {
  it('失败 → 推 changed 事件、主持人待办「处理失败」；重试成功', async () => {
    const pipe = vi.fn(fakePipeline());
    pipe.mockImplementationOnce(fakePipeline({ fail: '没有检测到人声' }));
    const t = make('fail', { runMeetingPipeline: pipe });
    const src = join(tmp, 'rec.m4a');
    writeFileSync(src, 'audio');
    t.events.length = 0;
    await t.call('chenlifeng', 'meeting.upload', { id: 'mt_a2_weekly', paths: [src] });
    await t.svc.idle();
    const m = t.store.read().meetings.find((x) => x.id === 'mt_a2_weekly')!;
    expect(m).toMatchObject({ status: 'failed', process: { error: '没有检测到人声' } });
    expect(m.files[0].kind).toBe('audio');
    expect(t.events.some((e) => e.type === 'changed' && e.scope === 'meeting' && e.id === 'mt_a2_weekly')).toBe(true);
    expect((await t.call<any>('chenlifeng', 'home.get')).todos.some((x: any) => x.type === 'retry_process')).toBe(true);
    await t.call('chenlifeng', 'meeting.retry', { id: 'mt_a2_weekly' });
    await t.svc.idle();
    expect(t.store.read().meetings.find((x) => x.id === 'mt_a2_weekly')!.status).toBe('pending_confirm');
  });

  it('应用重启时还在处理中的会议标为失败', async () => {
    const t = make('interrupt');
    t.svc.pcActorId();
    t.store.update((s) => { const m = s.meetings.find((x) => x.id === 'mt_a2_weekly')!; m.status = 'processing'; m.process = { stage: 'transcribe', progress: 30, log: [] }; });
    const again = new MeetingMgmtService({ store: new MeetingMgmtStore(() => t.store.root()), llm: async () => null, ext: t.ext });
    again.pcActorId();
    expect(again.store.read().meetings.find((x) => x.id === 'mt_a2_weekly')).toMatchObject({ status: 'failed', process: { error: expect.stringContaining('处理被中断') } });
  });

  it('有没认出的发言人 → 待指认；主持人试听、指认完 → 待确认并通知全体发言人', async () => {
    const t = make('assign', { runMeetingPipeline: fakePipeline({ unknown: true }) });
    const src = join(tmp, 'rec2.mp4');
    writeFileSync(src, 'video');
    await t.call('chenlifeng', 'meeting.upload', { id: 'mt_a2_weekly', paths: [src] });
    await t.svc.idle();
    let m = t.store.read().meetings.find((x) => x.id === 'mt_a2_weekly')!;
    expect(m.status).toBe('pending_assign');
    expect(m.files[0].kind).toBe('video');
    expect(t.notices(undefined, 'speech_confirm')).toHaveLength(0);
    const clip = await t.call<any>('chenlifeng', 'meeting.speaker.clip', { id: m.id, label: 'S9' });
    expect(clip.dataUrl).toBe(`data:audio/wav;base64,${Buffer.from('RIFF-fake').toString('base64')}`);
    await expect(t.call('zhouting', 'meeting.speaker.clip', { id: m.id, label: 'S9' })).rejects.toThrow('只有主持人');
    await expect(t.call('zhouting', 'meeting.speaker.assign', { id: m.id, label: 'S9', personId: 'hejing' })).rejects.toThrow('只有主持人');
    await t.call('chenlifeng', 'meeting.speaker.assign', { id: m.id, label: 'S9', personId: 'hejing' });
    m = t.store.read().meetings.find((x) => x.id === 'mt_a2_weekly')!;
    expect(m.status).toBe('pending_confirm');
    expect(t.notices(undefined, 'speech_confirm').map((n) => n.to).sort()).toEqual(['chenlifeng', 'hejing', 'wugang', 'zhengkai', 'zhouting']);
    expect(t.store.read().projects.find((p) => p.id === 'pj_a2')!.memberIds).toContain('hejing');
  });

  it('定稿前纠错：逐段改发言人（通知新发言人）、编号换人名、主持人改决议摘要、按当前发言人重新整理', async () => {
    const t = make('correct', { runMeetingPipeline: fakePipeline({ unknown: true }) });
    const src = join(tmp, 'rec-correct.m4a');
    writeFileSync(src, 'audio');
    await t.call('chenlifeng', 'meeting.upload', { id: 'mt_a2_weekly', paths: [src] });
    await t.svc.idle();
    t.store.update((s) => { s.meetings.find((x) => x.id === 'mt_a2_weekly')!.summaryLines = ['S9 同意按期到货']; });
    await t.call('chenlifeng', 'meeting.speaker.assign', { id: 'mt_a2_weekly', label: 'S9', personId: 'hejing' });
    let m = t.store.read().meetings.find((x) => x.id === 'mt_a2_weekly')!;
    expect(m.summaryLines).toEqual(['何静 同意按期到货']);
    // 全员确认 → 终审；主持人发现 g1 其实是何静说的
    for (const c of m.confirmations) await t.call(c.personId, 'meeting.confirm', { id: m.id });
    expect(t.store.read().meetings.find((x) => x.id === 'mt_a2_weekly')!.status).toBe('pending_review');
    const before = t.notices('hejing', 'speech_confirm').length;
    await expect(t.call('zhouting', 'meeting.segment.speaker', { id: m.id, segmentId: 'g1', label: 'S9' })).rejects.toThrow('只有主持人');
    await t.call('chenlifeng', 'meeting.segment.speaker', { id: m.id, segmentId: 'g1', label: 'S9' });
    m = t.store.read().meetings.find((x) => x.id === 'mt_a2_weekly')!;
    expect(m.status).toBe('pending_confirm');
    expect(m.confirmations.find((c) => c.personId === 'hejing')!.status).toBe('pending');
    expect(t.notices('hejing', 'speech_confirm').length).toBe(before + 1);
    // 改给本场没出现过的员工
    await t.call('chenlifeng', 'meeting.segment.speaker', { id: m.id, segmentId: 'g2', personId: 'liuyang' });
    m = t.store.read().meetings.find((x) => x.id === 'mt_a2_weekly')!;
    expect(m.speakers.find((s) => s.personId === 'liuyang')).toMatchObject({ matchedBy: 'manual' });
    expect(t.store.read().projects.find((p) => p.id === 'pj_a2')!.memberIds).toContain('liuyang');
    // 主持人手改决议和摘要
    await expect(t.call('zhouting', 'meeting.minutes.save', { id: m.id, summaryLines: ['x'] })).rejects.toThrow('只有主持人');
    await t.call('chenlifeng', 'meeting.minutes.save', { id: m.id, decisions: [{ id: 'd1', text: '采购部每周一同步到货进度' }, { text: '何静负责验收' }], summaryLines: ['设备分三批到货'] });
    m = t.store.read().meetings.find((x) => x.id === 'mt_a2_weekly')!;
    expect(m.decisions.map((d) => d.text)).toEqual(['采购部每周一同步到货进度', '何静负责验收']);
    expect(m.decisions[1]!.id).toMatch(/^dc_/);
    // 重新整理：模型拿到的是人名不是编号
    const r = await t.call<any>('chenlifeng', 'meeting.minutes.reorganize', { id: m.id });
    const arg = (t.ext.organizeMinutes as any).mock.calls[0][0];
    expect(Object.values(arg.speakerNames)).not.toContain('S9');
    expect(arg.speakerNames.S9).toBe('何静');
    expect(r.summaryLines).toEqual(['新摘要一', '新摘要二']);
    m = t.store.read().meetings.find((x) => x.id === 'mt_a2_weekly')!;
    expect(m.topics.map((x) => x.title)).toEqual(['重新整理的议题']);
    expect(m.segments.every((x) => x.topicId === 'tp_1')).toBe(true);
  });

  it('上传前就拦：状态不对、文件不存在；会议卡片显示处理阶段', async () => {
    const t = make('upload-guard', { runMeetingPipeline: vi.fn((i: PipelineInputLike) => { i.onStage('organize', 60); return new Promise(() => {}); }) as any });
    await expect(t.call('linxiao', 'meeting.upload', { id: 'mt_df_weekly', paths: ['/x'] })).rejects.toThrow('不能上传会议文件');
    await expect(t.call('chenlifeng', 'meeting.upload', { id: 'mt_a2_weekly', paths: [join(tmp, 'nope.m4a')] })).rejects.toThrow('文件不存在');
    const src = join(tmp, 'rec3.m4a');
    writeFileSync(src, 'audio');
    await t.call('chenlifeng', 'meeting.upload', { id: 'mt_a2_weekly', paths: [src] });
    const card = (await t.call<any[]>('chenlifeng', 'meeting.list', { filter: 'processing' })).find((x) => x.id === 'mt_a2_weekly');
    expect(card).toMatchObject({ status: 'processing', confirmText: '整理中' });
    await t.svc.stop();
  });

  it('文件类别按扩展名，认不出的交给流水线探测（标音频）', () => {
    expect(['a.MP3', 'b.amr', 'c.mov', 'd.webm', 'e.srt', 'f.docx', 'g.xyz'].map(fileKindOf)).toEqual(['audio', 'audio', 'video', 'video', 'transcript', 'transcript', 'audio']);
  });
});

describe('定时提醒（只发提醒、记提醒时间，不改状态）', () => {
  it('用真实的 dueReminders：逾期通知部门负责人和任务负责人、一周没更新提醒进度、生成周报；同一时间再跑不重复', async () => {
    const t = make('tick', { dueReminders });
    t.svc.pcActorId();
    const before = JSON.stringify(t.store.read().tasks.map((x) => [x.id, x.status]));
    await t.svc.tick();
    await t.svc.idle();
    const training = t.store.read().tasks.find((x) => x.title === '上线培训计划编制')!;
    expect(training.reminders.overdueAt).toBe(NOW);
    expect(t.notices(undefined, 'task_overdue').filter((n) => n.link.id === training.id).map((n) => n.to).sort()).toEqual(['linxiao', 'liuyang']);
    expect(t.notices('linxiao', 'task_overdue').at(-1)!.summary).toBe('截止 2026-11-14，已逾期 2 天');
    expect(t.notices('wugang', 'task_progress_remind')).toHaveLength(1);
    expect((t.ext.generateWeeklyReport as any).mock.calls.length).toBe(2);
    expect(t.store.read().projects.find((p) => p.id === 'pj_dfactory')!.weeklyReports).toHaveLength(1);
    const report = t.notices(undefined, 'progress_report');
    expect(report.some((n) => n.to === 'linxiao' && n.link.kind === 'report' && n.link.id === 'pj_dfactory')).toBe(true);
    expect(report[0].summary).toContain('完成率 100%');
    expect(JSON.stringify(t.store.read().tasks.map((x) => [x.id, x.status]))).toBe(before);
    const count = t.store.read().notices.length;
    await t.svc.tick();
    await t.svc.idle();
    expect(t.store.read().notices.length).toBe(count);
  });

  it('催办发言人：记 remindedAt，会议状态不变', async () => {
    const t = make('tick2', { dueReminders: vi.fn(() => [{ kind: 'speech_remind' as const, meetingId: 'mt_a2_review', personId: 'sunhao', waitedHours: 25 }]) });
    await t.svc.tick();
    const m = t.store.read().meetings.find((x) => x.id === 'mt_a2_review')!;
    expect(m.status).toBe('pending_confirm');
    expect(m.confirmations.find((c) => c.personId === 'sunhao')!.remindedAt).toBe(NOW);
    expect(t.notices('sunhao', 'speech_remind')[0].summary).toBe('会议纪要还在等你确认发言，已等待 25 小时');
  });
});

describe('企业微信', () => {
  it('Secret 只进主进程（加密单独存）；配好后通知发卡片，链接带本人令牌', async () => {
    const t = make('wecom');
    const w = await t.call<any>('linxiao', 'wecom.save', { corpId: 'ww1', agentId: '1000002', secret: 'top-secret', cardBaseUrl: 'https://mm.example.com' });
    expect(w).toEqual({ corpId: 'ww1', agentId: '1000002', hasSecret: true, cardBaseUrl: 'https://mm.example.com' });
    expect(readFileSync(t.store.statePath(), 'utf-8')).not.toContain('top-secret');
    expect(t.store.readSecret()).toBe('S:top-secret');
    expect((await t.call<any>('linxiao', 'boot')).wecomConnected).toBe(true);
    await t.call('linxiao', 'wecom.test');
    expect(t.ext.createWecom).toHaveBeenCalledWith({ corpId: 'ww1', agentId: '1000002', secret: 'top-secret' });
    // 再保存不带 secret：保留原密钥
    expect((await t.call<any>('linxiao', 'wecom.save', { corpId: 'ww1', agentId: '1000002', cardBaseUrl: 'https://mm.example.com' })).hasSecret).toBe(true);

    await t.call('chenlifeng', 'task.objection.review', { id: 'mt_a2_kickoff_k4', decision: 'reject', note: '先按 32 项' });
    await t.call('sunhao', 'task.objection.reply', { id: 'mt_a2_kickoff_k4', decision: 'escalate' });
    await t.svc.idle();
    const [to, card] = t.wecom.sendCard.mock.calls.at(-1)!;
    expect(to).toEqual(['chenlifeng']);
    const token = t.store.read().tokens.chenlifeng;
    expect(card.url).toBe(`https://mm.example.com/m?t=${token}#/task/mt_a2_kickoff_k4`);
    expect(card.description).not.toContain('公司内网链接'); // 填了外网地址：不提醒连 Wi-Fi
    expect(t.svc.personByToken(token)).toBe('chenlifeng');
    expect(t.notices('chenlifeng', 'arbitration')[0].wecom?.sentAt).toBe(NOW);

    // 企微照收但这个人收不到（不在可见范围）→ 记失败原因
    t.wecom.sendCard.mockImplementationOnce(async (to: string[]) => ({ ok: true, invalidUsers: to }));
    await t.call('linxiao', 'task.objection.arbitrate', { id: 'mt_df_kickoff_k1', decision: 'adjust', note: '按 12-20' });
    await t.svc.idle();
    expect(t.notices(undefined, 'arbitration_result').some((n) => n.wecom?.error?.includes('可见范围'))).toBe(true);
  });

  it('没有卡片地址（没开手机页、没填地址）：只进消息中心，记下原因', async () => {
    const t = make('wecom-nobase');
    await t.call('linxiao', 'wecom.save', { corpId: 'ww1', agentId: '1', secret: 's' });
    await t.call('zhengkai', 'task.accept', { id: 'mt_a2_kickoff_k1' });
    await t.call('zhengkai', 'task.progress', { id: 'mt_a2_kickoff_k1', percent: 100, note: '' });
    await t.call('zhengkai', 'task.complete', { id: 'mt_a2_kickoff_k1' });
    await t.svc.idle();
    expect(t.wecom.sendCard).not.toHaveBeenCalled();
    expect(t.notices('chenlifeng', 'task_done')[0].wecom?.error).toContain('卡片跳转地址');
  });

  it('推送失败看得到、能重发：开了手机页后全部重发成功；首页给管理员失败条数', async () => {
    const t = make('wecom-retry');
    await t.call('linxiao', 'wecom.save', { corpId: 'ww1', agentId: '1', secret: 's' });
    await t.call('zhengkai', 'task.accept', { id: 'mt_a2_kickoff_k1' });
    await t.call('zhengkai', 'task.progress', { id: 'mt_a2_kickoff_k1', percent: 100, note: '' });
    await t.call('zhengkai', 'task.complete', { id: 'mt_a2_kickoff_k1' });
    await t.svc.idle();
    const failed = await t.call<any>('linxiao', 'notice.push.failed');
    expect(failed.total).toBeGreaterThan(0);
    expect(failed.items[0]).toMatchObject({ toName: expect.any(String), error: expect.stringContaining('卡片跳转地址') });
    expect((await t.call<any>('linxiao', 'boot')).pushFailed).toBe(failed.total);
    expect((await t.call<any>('zhengkai', 'boot')).pushFailed).toBe(0);
    await expect(t.call('zhengkai', 'notice.push.failed')).rejects.toThrow('管理员');
    await expect(t.call('zhengkai', 'notice.push.retry', { all: true })).rejects.toThrow('管理员');
    await expect(t.call('linxiao', 'notice.push.retry', {})).rejects.toThrow('请选择');
    // 只重发一条：手机页没开还是失败
    const one = await t.call<any>('linxiao', 'notice.push.retry', { ids: [failed.items[0].id] });
    expect(one).toEqual({ sent: 0, failed: 1 });
    await t.call('linxiao', 'mobile.start');
    const all = await t.call<any>('linxiao', 'notice.push.retry', { all: true });
    expect(all).toEqual({ sent: failed.total, failed: 0 });
    expect(t.wecom.sendCard).toHaveBeenCalledTimes(failed.total);
    // 链接用的是手机页服务的局域网地址：卡片最后一行提醒连公司 Wi-Fi
    expect(t.wecom.sendCard.mock.calls.at(-1)![1].description).toContain('|公司内网链接：手机连公司 Wi-Fi 才能打开，用 4G 打不开');
    expect((await t.call<any>('linxiao', 'notice.push.failed')).total).toBe(0);
  });

  it('同步通讯录：企微里没有了的人标离职（保留历史），返回增减', async () => {
    const t = make('wecom-sync');
    await t.call('linxiao', 'wecom.save', { corpId: 'ww1', agentId: '1', secret: 's' });
    const demo = t.store.read().org;
    t.wecom.fetchOrg.mockImplementationOnce(async () => ({ depts: demo.depts, people: demo.people.filter((p) => p.id !== 'lina').map((p) => (p.id === 'zhaolei' ? { ...p, title: '研发总监' } : p)) }));
    const r = await t.call<any>('linxiao', 'org.sync');
    expect(r).toMatchObject({ source: 'wecom', left: ['lina'], changed: ['zhaolei'], by: 'linxiao' });
    expect(t.store.read().org.people.find((p) => p.id === 'lina')?.left).toBe(true);
    expect(t.store.read().org.source).toBe('wecom');
    t.wecom.fetchOrg.mockImplementationOnce(async () => { throw new Error('IP 不在可信 IP 里'); });
    expect((await t.call<any>('linxiao', 'org.sync')).error).toBe('IP 不在可信 IP 里');
  });

  it('没配企微：同步载入演示组织', async () => {
    const t = make('demo-sync');
    expect(await t.call<any>('linxiao', 'org.sync')).toMatchObject({ source: 'demo', added: [], left: [] });
  });
});

describe('换了转写模型后重新转写', () => {
  it('主持人定稿前可以重转：清掉确认和发言人、重新跑流水线；别人不行；定稿后不行', async () => {
    const t = make('reprocess');
    await t.svc.dispatchPc('boot', {});
    const s0 = t.store.read();
    const pc = s0.meetings.find((x) => x.status === 'pending_confirm' && x.files.length)!;
    const fin = s0.meetings.find((x) => x.status === 'finalized' || x.status === 'dispatched')!;
    const other = s0.org.people.find((p) => p.id !== pc.hostId && !p.left)!.id;
    await expect(t.call(other, 'meeting.reprocess', { id: pc.id })).rejects.toThrow('只有主持人');
    await expect(t.call(fin.hostId, 'meeting.reprocess', { id: fin.id })).rejects.toThrow('纪要已定稿锁定');
    const calls = (t.ext.runMeetingPipeline as any).mock.calls.length;
    const r = await t.call<any>(pc.hostId, 'meeting.reprocess', { id: pc.id });
    expect(r.status).toBe('processing');
    expect(r.confirmations).toEqual([]);
    expect(r.process.log[0].text).toContain('重新转写');
    await t.svc.idle();
    expect((t.ext.runMeetingPipeline as any).mock.calls.length).toBe(calls + 1);
    expect(t.store.read().meetings.find((x) => x.id === pc.id)!.status).not.toBe('processing');
  });
});

describe('逐段播放原声', () => {
  it('能看这场会议的人都能听（含手机页）；前后多留 0.3 秒；超过 3 分钟只放前 3 分钟；没有录音时说清楚', async () => {
    const t = make('seg-audio');
    await t.svc.dispatchPc('boot', {});
    const m = t.store.read().meetings.find((x) => x.segments.length > 1)!;
    const seg = m.segments[1]!;
    const host = m.hostId;
    const r = await t.call<any>(host, 'meeting.segment.audio', { id: m.id, segmentId: seg.id });
    expect(r.dataUrl.startsWith('data:audio/wav;base64,')).toBe(true);
    expect(Buffer.from(r.dataUrl.split(',')[1], 'base64').toString()).toBe(`wav:${Math.max(0, seg.start - 0.3).toFixed(1)}-${(seg.end + 0.3).toFixed(1)}`);
    expect((t.ext.segmentAudio as any).mock.calls.at(-1)[0]).toBe(t.store.filesDir(m.id));
    expect(await t.svc.dispatch(host, 'meeting.segment.audio', { id: m.id, segmentId: seg.id }, 'mobile')).toMatchObject({ clipped: false });
    t.store.update((st) => { const s0 = st.meetings.find((x) => x.id === m.id)!.segments[1]!; s0.end = s0.start + 600; });
    const long = await t.call<any>(host, 'meeting.segment.audio', { id: m.id, segmentId: seg.id });
    expect(long.end - long.start).toBeCloseTo(180, 5);
    expect(long.clipped).toBe(true);
    await expect(t.call(host, 'meeting.segment.audio', { id: m.id, segmentId: 'nope' })).rejects.toThrow('没有找到这段发言');
    (t.ext.segmentAudio as any).mockImplementationOnce(() => null);
    await expect(t.call(host, 'meeting.segment.audio', { id: m.id, segmentId: seg.id })).rejects.toThrow('没有可播放的录音');
  });
});

describe('会议转写方式：本机模型 / 在线接口', () => {
  it('在线接口：Key 加密单独存、界面只拿到「有没有」；能测试、能看原文；切成在线后处理会议带上解密后的配置；清除后退回本机', async () => {
    const t = make('cloud-asr');
    await expect(t.call('linxiao', 'asr.mode.save', { mode: 'cloud' })).rejects.toThrow('在线接口还没填完整');
    await expect(t.call('linxiao', 'asr.cloud.save', { provider: 'siliconflow', model: 'TeleAI/TeleSpeechASR' })).rejects.toThrow('API Key');
    const v = await t.call<any>('linxiao', 'asr.cloud.save', { provider: 'siliconflow', baseUrl: 'https://api.siliconflow.cn/v1/audio/transcriptions', model: 'TeleAI/TeleSpeechASR', apiKey: 'sk-test-1' });
    expect(v.cloud).toEqual({ provider: 'siliconflow', baseUrl: 'https://api.siliconflow.cn/v1', model: 'TeleAI/TeleSpeechASR', hasKey: true });
    expect(JSON.stringify(t.store.read())).not.toContain('sk-test-1');
    expect(t.store.readCloudAsrKey()).toBe('S:sk-test-1');
    expect(await t.call<any>('linxiao', 'asr.cloud.reveal')).toEqual({ apiKey: 'sk-test-1' });
    // 改模型不重填 Key：Key 保留
    await t.call('linxiao', 'asr.cloud.save', { provider: 'siliconflow', model: 'FunAudioLLM/SenseVoiceSmall' });
    expect(await t.call<any>('linxiao', 'asr.cloud.reveal')).toEqual({ apiKey: 'sk-test-1' });
    // 测试：没填的项用已保存的
    expect(await t.call<any>('linxiao', 'asr.cloud.test', {})).toMatchObject({ ok: true });
    expect((t.ext.cloudTranscribe as any).mock.calls.at(-1)[0]).toEqual({ provider: 'siliconflow', baseUrl: 'https://api.siliconflow.cn/v1', model: 'FunAudioLLM/SenseVoiceSmall', apiKey: 'sk-test-1' });
    (t.ext.cloudTranscribe as any).mockImplementationOnce(async () => ({ ok: false, error: 'API Key 不对' }));
    expect(await t.call<any>('linxiao', 'asr.cloud.test', { apiKey: 'bad' })).toEqual({ ok: false, error: 'API Key 不对' });
    // 切成在线接口 + 指定本机模型偏好
    expect(await t.call<any>('linxiao', 'asr.mode.save', { mode: 'cloud', localModel: 'sensevoice' })).toMatchObject({ mode: 'cloud', localModel: 'sensevoice' });
    await expect(t.call('zhouting', 'asr.cloud.reveal')).rejects.toThrow('只有管理员');
    await expect(t.svc.dispatch('linxiao', 'asr.cloud.reveal', {}, 'mobile')).rejects.toThrow('手机页不能');
    // 清除：Key 删掉，转写方式退回本机
    expect(await t.call<any>('linxiao', 'asr.cloud.save', { clear: true })).toMatchObject({ mode: 'local', cloud: null });
    expect(t.store.readCloudAsrKey()).toBe('');
  });
});

describe('手机页服务与令牌', () => {
  it('开启 → 每人专属链接（可重置）→ 手机页走同一个 dispatch（手机身份、禁用动作）→ 关闭', async () => {
    const t = make('mobile');
    const st = await t.call<any>('linxiao', 'mobile.start');
    expect(st).toEqual({ running: true, url: 'http://192.168.1.5:8280', lanOnly: true });
    const opts = (t.ext.startMobileServer as any).mock.calls[0][0];
    expect(opts.dataDir).toBe(t.store.root());
    expect(opts.uploadDir).toBe(t.store.uploadsDir());
    expect(t.events.some((e) => e.type === 'mobile' && e.running)).toBe(true);
    const { url } = await t.call<any>('linxiao', 'mobile.link', { personId: 'zhouting' });
    const token = new URL(url).searchParams.get('t')!;
    expect(url).toBe(`http://192.168.1.5:8280/m?t=${token}#/home`);
    expect(opts.personByToken(token)).toBe('zhouting');
    expect(opts.personByToken('bad')).toBeNull();
    const { url: url2 } = await t.call<any>('linxiao', 'mobile.link', { personId: 'zhouting', reset: true });
    expect(url2).not.toBe(url);
    expect(opts.personByToken(token)).toBeNull();
    // 令牌的主人离职了：令牌仍认得出人，boot 回 me.person = null，其它动作拦下
    const token2 = new URL(url2).searchParams.get('t')!;
    t.store.update((s) => { s.org.people.find((p) => p.id === 'zhouting')!.left = true; });
    expect(opts.personByToken(token2)).toBe('zhouting');
    expect((await opts.dispatch('zhouting', 'boot', {})).me.person).toBeNull();
    await expect(opts.dispatch('zhouting', 'home.get', {})).rejects.toThrow('当前身份无效');
    t.store.update((s) => { s.org.people.find((p) => p.id === 'zhouting')!.left = undefined; });
    await expect(opts.dispatch('zhouting', 'mobile.link', {})).rejects.toThrow('手机页不能执行');
    const home = await opts.dispatch('zhouting', 'home.get', {});
    expect(home.greetingName).toBe('周婷');
    await expect(opts.dispatch('zhouting', 'identity.set', { personId: 'linxiao' })).rejects.toThrow('手机页不能执行');
    const g = await opts.dispatch('linxiao', 'meeting.get', { id: 'mt_df_weekly' });
    expect(g.meeting.files.every((f: any) => f.path === '')).toBe(true);
    const outside = join(tmp, 'outside.m4a');
    writeFileSync(outside, 'x');
    await expect(opts.dispatch('chenlifeng', 'meeting.upload', { id: 'mt_a2_weekly', paths: [outside] })).rejects.toThrow('不在上传目录里');
    const vl = await t.call<any>('linxiao', 'voiceprint.link');
    expect(vl.links).toHaveLength(20);
    expect(vl.url).toMatch(/^http:\/\/192\.168\.1\.5:8280\/v\?t=/);
    await t.call('linxiao', 'mobile.stop');
    expect(t.mobileStop).toHaveBeenCalled();
    expect((await t.call<any>('linxiao', 'boot')).mobile).toEqual({ running: false });
    await expect(t.call('linxiao', 'mobile.link', { personId: 'zhouting' })).rejects.toThrow('请先开启手机页服务');
  });

  it('记住开关：上次开着，应用重启后（定时器第一轮 / 打开工作台）自动重新开；手动关了就不再自动开', async () => {
    const t = make('mobile-resume');
    await t.call('linxiao', 'mobile.start');
    expect(t.store.read().mobileOn).toBe(true);
    await t.svc.stop();
    // 应用重启：同一份数据，新的服务实例
    const ext2 = { ...t.ext, startMobileServer: vi.fn(async () => ({ url: 'http://192.168.1.5:8280', port: 8280, stop: vi.fn(async () => {}) })) };
    const events: MmEvent[] = [];
    const svc2 = new MeetingMgmtService({ store: new MeetingMgmtStore(() => t.store.root()), llm: async () => null, emit: (e) => events.push(e), ext: ext2 });
    await svc2.tick();
    expect(ext2.startMobileServer).toHaveBeenCalledTimes(1);
    expect(events.some((e) => e.type === 'mobile' && e.running)).toBe(true);
    // 并发打开工作台不会再起一个
    await svc2.dispatchPc('boot', {});
    await svc2.tick();
    expect(ext2.startMobileServer).toHaveBeenCalledTimes(1);
    await svc2.dispatchPc('mobile.stop', {});
    expect(svc2['store'].read().mobileOn).toBe(false);
    await svc2.stop();
    const ext3 = { ...t.ext, startMobileServer: vi.fn(async () => ({ url: 'x', port: 1, stop: vi.fn(async () => {}) })) };
    const svc3 = new MeetingMgmtService({ store: new MeetingMgmtStore(() => t.store.root()), llm: async () => null, ext: ext3 });
    await svc3.tick();
    await svc3.dispatchPc('boot', {});
    expect(ext3.startMobileServer).not.toHaveBeenCalled();
  });
});

describe('声纹', () => {
  it('授权同意、本人或管理员导入；只和本场参会人比对；撤回', async () => {
    const t = make('voice', { runMeetingPipeline: fakePipeline() });
    const wav = join(tmp, 'voice.wav');
    writeFileSync(wav, 'wav');
    await expect(t.call('wugang', 'voiceprint.enroll', { personId: 'wugang', path: wav })).rejects.toThrow('需要本人授权同意');
    expect(await t.call('wugang', 'voiceprint.enroll', { personId: 'wugang', path: wav, consent: true })).toEqual({ ok: true, seconds: 12 });
    await t.call('linxiao', 'voiceprint.enroll', { personId: 'qiancheng', path: wav, consent: true });
    (t.ext.enrollVoiceprint as any).mockImplementationOnce(async () => ({ ok: false, reason: '噪音太大，请换个安静的地方重录' }));
    await expect(t.call('zhouting', 'voiceprint.enroll', { personId: 'zhouting', path: wav, consent: true })).rejects.toThrow('噪音太大');
    const list = await t.call<any[]>('linxiao', 'voiceprint.list');
    expect(list.filter((x) => x.status === 'collected').map((x) => x.person.id).sort()).toEqual(['qiancheng', 'wugang']);
    expect((await t.call<any[]>('wugang', 'voiceprint.list')).map((x) => [x.person.id, x.status])).toEqual([['wugang', 'collected']]);
    const src = join(tmp, 'rec-v.m4a');
    writeFileSync(src, 'audio');
    await t.call('chenlifeng', 'meeting.upload', { id: 'mt_a2_weekly', paths: [src] });
    await t.svc.idle();
    const input = (t.ext.runMeetingPipeline as any).mock.calls[0][0] as PipelineInputLike;
    expect(input.voiceprints.map((v) => v.personId)).toEqual(['wugang']); // 钱程不是本场参会人
    expect(input.attendees.map((p) => p.id).sort()).toEqual(['chenlifeng', 'wugang', 'zhengkai', 'zhouting']);
    expect(input).toMatchObject({ threshold: 0.55, asr: 'local', meetingId: 'mt_a2_weekly', workDir: t.store.filesDir('mt_a2_weekly') });
    await t.call('wugang', 'voiceprint.delete', {});
    expect(t.store.read().voiceprints.map((v) => v.personId)).toEqual(['qiancheng']);
  });
});

describe('声纹：新模型 + 用确认过的会议补充（采集同意里已包含，默认开）', () => {
  it('采集两个模型都存；默认开、只有本人能关；确认发言后补样本（像别人 / 不像本人的不补）；关掉删样本、重录保持关；列表不给向量', async () => {
    const t = make('voice-learn');
    await t.svc.dispatchPc('boot', {});
    const wav = join(tmp, 'voice-l.wav');
    writeFileSync(wav, 'wav');
    const m0 = t.store.read().meetings.find((x) => x.status === 'pending_confirm' && x.files.some((f) => f.kind === 'audio'))!;
    const pending = m0.confirmations.filter((c) => c.status === 'pending').map((c) => c.personId);
    const [me, other] = [pending[0]!, pending[1]!];
    const enroll = (who: string, v1: number[], v2: number[], extra: any = {}) => {
      (t.ext.enrollVoiceprint as any).mockImplementationOnce(async () => ({ ok: true, vector: v1, vector2: v2, seconds: 12 }));
      return t.call(who, 'voiceprint.enroll', { personId: who, path: wav, consent: true, ...extra });
    };
    // 本人采集时关掉补充
    await enroll(other, [1, 0], [0, 1], { autoLearn: false });
    expect(t.store.read().voiceprints.find((v) => v.personId === other)!.autoLearn).toBe(false);
    // 管理员代录：默认开；传 autoLearn:false 也不算（开关只能本人动）
    const admin = t.store.read().settings.adminIds[0]!;
    if (admin !== me) {
      (t.ext.enrollVoiceprint as any).mockImplementationOnce(async () => ({ ok: true, vector: [0.6, 0.8], vector2: [0.8, 0.6], seconds: 12 }));
      await t.call(admin, 'voiceprint.enroll', { personId: me, path: wav, consent: true, autoLearn: false });
      expect(t.store.read().voiceprints.find((v) => v.personId === me)!.autoLearn).toBe(true);
    }
    await enroll(me, [0.6, 0.8], [0.8, 0.6]);
    const vp = t.store.read().voiceprints.find((v) => v.personId === me)!;
    expect(vp).toMatchObject({ vector: [0.6, 0.8], vector2: [0.8, 0.6], autoLearn: true });
    // 列表只有状态，没有向量
    const row = (await t.call<any[]>(me, 'voiceprint.list'))[0];
    expect(row).toMatchObject({ newModel: true, autoLearn: true, extraCount: 0 });
    expect(JSON.stringify(row)).not.toContain('0.8');
    // 确认发言 → 后台补样本：像本人（0.97）也不比别人更像 → 补
    (t.ext.meetingVoiceSample as any).mockImplementationOnce(async () => ({ vector: [0.6, 0.8], vector2: [0.75, 0.66], seconds: 30 }));
    await t.call(me, 'meeting.confirm', { id: m0.id });
    await t.svc.idle();
    const ranges = (t.ext.meetingVoiceSample as any).mock.calls.at(-1)[1];
    expect(ranges.length).toBeGreaterThan(0);
    expect(t.store.read().voiceprints.find((v) => v.personId === me)!.extra).toMatchObject([{ meetingId: m0.id, seconds: 30, vector2: [0.75, 0.66] }]);
    // 另一场：样本更像别人 → 不补
    const m1 = t.store.read().meetings.find((x) => x.id !== m0.id && x.status === 'pending_confirm' && x.confirmations.some((c) => c.personId === me && c.status === 'pending'));
    if (m1) {
      (t.ext.meetingVoiceSample as any).mockImplementationOnce(async () => ({ vector2: [0.1, 0.99], seconds: 20 }));
      await t.call(me, 'meeting.confirm', { id: m1.id });
      await t.svc.idle();
      expect(t.store.read().voiceprints.find((v) => v.personId === me)!.extra!.length).toBe(1);
    }
    // 没开补充的人确认不触发
    const calls = (t.ext.meetingVoiceSample as any).mock.calls.length;
    await t.call(other, 'meeting.confirm', { id: m0.id });
    await t.svc.idle();
    expect((t.ext.meetingVoiceSample as any).mock.calls.length).toBe(calls);
    // 处理会议时把样本带给流水线
    const prepared = t.store.read().voiceprints.find((v) => v.personId === me)!;
    expect(prepared.extra!.length).toBe(1);
    // 关掉：样本一起删；没有声纹的人不能开
    expect(await t.call(me, 'voiceprint.autoLearn.set', { enabled: false })).toEqual({ autoLearn: false });
    const off = t.store.read().voiceprints.find((v) => v.personId === me)!;
    expect(off.autoLearn).toBe(false);
    expect(off.extra).toBeUndefined();
    // 关过的人重录：保持关
    await enroll(me, [0.6, 0.8], [0.8, 0.6]);
    expect(t.store.read().voiceprints.find((v) => v.personId === me)!.autoLearn).toBe(false);
    const noVp = t.store.read().org.people.find((x) => !x.left && !t.store.read().voiceprints.some((v) => v.personId === x.id))!.id;
    await expect(t.call(noVp, 'voiceprint.autoLearn.set', { enabled: true })).rejects.toThrow('还没有采集你的声纹');
    // 手机页也能本人开关
    expect(await t.svc.dispatch(me, 'voiceprint.autoLearn.set', { enabled: true }, 'mobile')).toEqual({ autoLearn: true });
  });
});

describe('首页、列表、设置、演示数据', () => {
  const t = make('misc');

  it('首页：问候、计数、待办、本周任务、我的项目、最近会议、通知', async () => {
    const h = await t.call<any>('linxiao', 'home.get');
    expect(h.greetingName).toBe('林晓');
    expect(h.counts).toEqual({ todos: 5, dueToday: 0, overdue: 1, unread: 5 });
    expect(h.todos[0].type).toBe('update_progress');
    expect(h.myTasksThisWeek.map((x: any) => x.title)).toEqual(['上线培训计划编制']);
    expect(h.projects.map((p: any) => p.name).sort()).toEqual(['A2 量产导入项目', '华东生产基地扩产', '数字化工厂一期']);
    expect(h.recentMeetings[0].title).toBe('A2 量产导入周会');
    expect(h.notices[0].at).toBeGreaterThanOrEqual(h.notices[1].at);
    await t.call('linxiao', 'notice.read', { ids: [h.notices[0].id] });
    expect((await t.call<MmNotice[]>('linxiao', 'notice.list', { unreadOnly: true }))).toHaveLength(4);
    expect((await t.call<any>('linxiao', 'notice.read', { all: true })).unread).toBe(0);
  });

  it('会议列表筛选：待我处理 / 处理中 / 已定稿；确认进度', async () => {
    const todo = await t.call<any[]>('linxiao', 'meeting.list', { filter: 'todo' });
    expect(todo.map((m) => m.title).sort()).toEqual(['A2 试产问题复盘会', '扩产规划评审会', '数字化工厂周例会']);
    expect(todo.find((m) => m.title === 'A2 试产问题复盘会').confirmText).toBe('已确认 3/5');
    const fin = await t.call<any[]>('linxiao', 'meeting.list', { filter: 'final', projectId: 'pj_dfactory' });
    expect(fin.map((m) => m.title)).toEqual(['数字化工厂启动会']);
    // 搜索：项目名、参会人姓名也能搜到（标题里没有这些字）
    const byProject = await t.call<any[]>('linxiao', 'meeting.list', { q: '数字化工厂一期' });
    expect(byProject.map((m) => m.title).sort()).toEqual(['数字化工厂启动会', '数字化工厂周例会']);
    const byPerson = await t.call<any[]>('linxiao', 'meeting.list', { q: '周婷' });
    expect(byPerson.length).toBeGreaterThan(0);
    expect(byPerson.every((m) => !m.title.includes('周婷'))).toBe(true);
    const d = await t.call<any>('linxiao', 'meeting.get', { id: 'mt_df_weekly' });
    expect(d).toMatchObject({ projectName: '数字化工厂一期', projectStatus: 'active', confirm: { done: 6, total: 6 }, my: { isHost: true, isSpeaker: true } });
    expect(d.can).toMatchObject({ review: true, edit: true, confirm: false });
    expect(d.names.zhouting).toEqual({ name: '周婷', deptName: '采购部' });
    expect(d.deptLeaders.d_pur).toEqual({ id: 'zhouting', name: '周婷' });
  });

  it('任务列表：我接收的 / 我分派的 / 逾期 / 异议', async () => {
    expect((await t.call<MmTaskView[]>('zhouting', 'task.list', { view: 'received' })).map((x) => x.title)).toEqual(['A2 物料齐套确认', '主控芯片到货跟踪']);
    expect((await t.call<MmTaskView[]>('linxiao', 'task.list', { view: 'all', status: 'overdue' })).map((x) => [x.title, x.overdueDays])).toEqual([['上线培训计划编制', 2]]);
    expect((await t.call<MmTaskView[]>('chenlifeng', 'task.list', { view: 'assigned', status: 'objection' })).map((x) => x.title)).toEqual(['首件检验方案']);
  });

  it('项目详情：统计、部门进度、决议、结项阻碍', async () => {
    const p = await t.call<any>('linxiao', 'project.get', { id: 'pj_dfactory' });
    expect(p.stats).toMatchObject({ meetings: 2, done: 1, total: 4, overdue: 1, objections: 1 });
    expect(p.deptProgress.find((d: any) => d.name === '质量部')).toMatchObject({ done: 1, total: 1 });
    expect(p.decisions.map((d: any) => d.meetingTitle)).toEqual(['数字化工厂启动会', '数字化工厂启动会', '数字化工厂启动会', '数字化工厂启动会']);
    expect(p.closeBlockers.map((x: any) => x.kind)).toEqual(['meeting', 'task', 'objection', 'task', 'task']);
  });

  it('手动生成周报：推给项目负责人和任务负责人', async () => {
    const r = await t.call<MmReport>('linxiao', 'project.report.generate', { id: 'pj_dfactory' });
    expect(r).toMatchObject({ kind: 'weekly', periodTo: NOW });
    expect(r.id).toBeTruthy();
    expect(t.notices(undefined, 'progress_report').map((n) => n.to).sort()).toEqual(['linxiao', 'liuyang']);
    await expect(t.call('zhaolei', 'project.report.generate', { id: 'pj_dfactory' })).rejects.toThrow('只有项目负责人');
  });

  it('设置：管理员改参数（夹在范围内），至少保留一位管理员', async () => {
    const s = await t.call<any>('linxiao', 'settings.save', { patch: { confirmTimeoutHours: 9999, dueRemindDays: 2, ai: { asr: 'agent', voiceprintThreshold: 3, planPrompt: '  ' }, projectCreatorIds: ['chenlifeng', 'ghost'] } });
    expect(s).toMatchObject({ confirmTimeoutHours: 720, dueRemindDays: 2, projectCreatorIds: ['chenlifeng'], ai: { asr: 'agent', voiceprintThreshold: 1 } });
    expect(s.ai.planPrompt).toBeUndefined();
    await expect(t.call('linxiao', 'settings.save', { patch: { adminIds: ['ghost'] } })).rejects.toThrow('至少保留一位管理员');
    expect((await t.call<any>('chenlifeng', 'boot')).me.canCreateProject).toBe(true);
  });

  it('清空 / 重新载入演示数据', async () => {
    await t.call('linxiao', 'demo.clear');
    expect(t.store.read()).toMatchObject({ projects: [], meetings: [], tasks: [], notices: [] });
    expect(t.store.read().org.people).toHaveLength(20);
    await t.call('linxiao', 'demo.load');
    expect(t.store.read().projects).toHaveLength(3);
    expect(t.store.read().demoLoaded).toBe(true);
  });
});

describe('企微群机器人（没有自建应用时）', () => {
  const KEY = '693a91f6-7a1b-4bc4-97a0-0ec2b1fa5aaa';
  const URL_IN = `https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=${KEY}`;

  it('只有管理员能配、地址要校验、加密存本机；自建应用优先，断开自建应用后回到群机器人', async () => {
    const t = make('hook-cfg');
    await expect(t.call('zhouting', 'wecom.webhook.save', { url: URL_IN })).rejects.toThrow('管理员');
    await expect(t.call('linxiao', 'wecom.webhook.save', { url: URL_IN }, 'mobile')).rejects.toThrow('手机页不能执行');
    await expect(t.call('linxiao', 'wecom.webhook.save', { url: 'https://example.com/hook?key=1234567890abcdef' })).rejects.toThrow('不是企业微信群机器人');
    const w = await t.call<any>('linxiao', 'wecom.webhook.save', { url: URL_IN });
    expect(w).toMatchObject({ hasWebhook: true, webhookMasked: '…key=693a****5aaa' });
    expect(readFileSync(t.store.webhookPath(), 'utf-8')).toBe(`S:${URL_IN}`);
    expect(JSON.stringify(t.store.read())).not.toContain(KEY);
    expect((await t.call<any>('linxiao', 'boot')).pushChannel).toBe('webhook');
    await t.call('linxiao', 'wecom.webhook.test');
    expect(t.ext.createWebhook).toHaveBeenLastCalledWith(URL_IN);
    expect(t.webhook.test).toHaveBeenCalledTimes(1);
    await t.call('linxiao', 'wecom.save', { corpId: 'ww1', agentId: '1', secret: 's' });
    expect(t.store.read().settings.wecom.hasWebhook).toBe(true);
    expect((await t.call<any>('linxiao', 'boot')).pushChannel).toBe('app');
    await t.call('linxiao', 'wecom.save', { corpId: '', agentId: '' });
    expect((await t.call<any>('linxiao', 'boot')).pushChannel).toBe('webhook');
    await t.call('linxiao', 'wecom.webhook.save', { url: '' });
    expect(existsSync(t.store.webhookPath())).toBe(false);
    expect((await t.call<any>('linxiao', 'boot')).pushChannel).toBeNull();
    await expect(t.call('linxiao', 'wecom.webhook.test')).rejects.toThrow('请先填写');
  });

  it('同一事件的几个人合成一条群消息：@ 姓名，按钮是不带令牌的群链接；失败记原因、能重发', async () => {
    const t = make('hook-push');
    await t.call('linxiao', 'wecom.webhook.save', { url: URL_IN });
    await t.call('linxiao', 'mobile.start');
    t.webhook.send.mockImplementationOnce(async () => ({ ok: false, error: '群机器人发送太频繁' }));
    const src = join(tmp, 'hook.m4a');
    writeFileSync(src, 'audio');
    await t.call('chenlifeng', 'meeting.upload', { id: 'mt_a2_weekly', paths: [src] });
    await t.svc.idle();
    const asks = t.notices(undefined, 'speech_confirm').filter((n) => n.link.id === 'mt_a2_weekly');
    expect(asks.length).toBeGreaterThan(1);
    const groupCalls = t.webhook.send.mock.calls.filter(([m]) => m.content.includes('【发言待确认】'));
    expect(groupCalls.length).toBe(1);
    expect(groupCalls[0]![0].msgtype).toBe('markdown'); // 演示组织：一个都 @ 不到
    const content = groupCalls[0]![0].content;
    const org = t.store.read().org;
    for (const n of asks) expect(content).toContain(`@${org.people.find((p) => p.id === n.to)!.name}`);
    expect(content).toContain('http://192.168.1.5:8280/g#/meeting/mt_a2_weekly');
    expect(content).not.toContain('?t=');
    expect(asks.every((n) => n.wecom?.error === '群机器人发送太频繁')).toBe(true);
    const failed = await t.call<any>('linxiao', 'notice.push.failed');
    expect(failed.total).toBe(asks.length);
    const r = await t.call<any>('linxiao', 'notice.push.retry', { all: true });
    expect(r).toEqual({ sent: asks.length, failed: 0 });
    expect(t.webhook.send.mock.calls.filter(([m]) => m.content.includes('【发言待确认】')).length).toBe(2);
    expect(t.wecom.sendCard).not.toHaveBeenCalled();
  });

  it('声纹采集邀请：群里发一条，只 @ 还没采集的人；全都采过就不发', async () => {
    const t = make('hook-vp');
    await t.call('linxiao', 'wecom.webhook.save', { url: URL_IN });
    await expect(t.call('linxiao', 'voiceprint.send')).rejects.toThrow('手机页服务');
    await t.call('linxiao', 'mobile.start');
    const src = join(tmp, 'vp-hook.m4a');
    writeFileSync(src, 'audio');
    await t.call('linxiao', 'voiceprint.enroll', { personId: 'zhouting', path: src, consent: true });
    const people = t.store.read().org.people.filter((p) => !p.left);
    const r = await t.call<any>('linxiao', 'voiceprint.send');
    expect(r).toMatchObject({ sent: people.length - 1, failed: [], group: true });
    const content = t.webhook.send.mock.calls.at(-1)![0].content;
    expect(content).toContain('【声纹采集邀请】');
    expect(content).toContain('@林晓');
    expect(content).not.toContain('@周婷');
    expect(content).toContain('http://192.168.1.5:8280/g?p=v');
    t.store.update((s) => { s.voiceprints = people.map((p) => ({ personId: p.id, consentAt: NOW, enrolledAt: NOW, vector: [1], sampleSeconds: 12 })); });
    expect(await t.call<any>('linxiao', 'voiceprint.send')).toMatchObject({ sent: 0, skipped: people.length });
  });
});

describe('通讯录导入、群里真 @、配置引导', () => {
  it('导入企微后台导出的通讯录：换掉演示组织（演示人员标离职），来源记为导入；管理员手填的手机号在下次导入时保留', async () => {
    const t = make('org-import');
    const csv = join(tmp, 'contacts.csv');
    writeFileSync(csv, '\ufeff姓名,帐号,部门,职务,手机,是否部门负责人\n张三,ZhangSan,速腾/研发部,研发经理,13800000001,是\n李四,LiSi,速腾/研发部,工程师,,否\n');
    await expect(t.call('zhouting', 'org.import', { path: csv })).rejects.toThrow('管理员');
    await expect(t.call('linxiao', 'org.import', { path: csv }, 'mobile')).rejects.toThrow('手机页不能执行');
    const r = await t.call<any>('linxiao', 'org.import', { path: csv });
    expect(r).toMatchObject({ source: 'import', people: 2, depts: 1, added: ['ZhangSan', 'LiSi'] });
    expect(r.left.length).toBe(20);
    const org = t.store.read().org;
    expect(org.source).toBe('import');
    expect(org.depts[0]).toMatchObject({ name: '研发部', leaderIds: ['ZhangSan'] });
    expect(org.people.find((p) => p.id === 'ZhangSan')).toMatchObject({ mobile: '13800000001', wecomUserId: 'ZhangSan' });
    // 管理员（演示组织里的林晓）已离职 → 还没有在职管理员；第一个选的身份成为管理员
    await t.call('ZhangSan', 'identity.set', { personId: 'ZhangSan' });
    await t.call('ZhangSan', 'org.person.contact', { personId: 'LiSi', mobile: '+86 139-0000-0002' });
    expect(t.store.read().org.people.find((p) => p.id === 'LiSi')!.mobile).toBe('13900000002');
    await t.call('ZhangSan', 'org.import', { path: csv });
    expect(t.store.read().org.people.find((p) => p.id === 'LiSi')!.mobile).toBe('13900000002');
  });

  it('管理员给演示人员填手机号 / 企微账号：群消息改发 text 真 @；格式不对报错；清空恢复', async () => {
    const t = make('org-contact');
    await t.call('linxiao', 'wecom.webhook.save', { url: 'https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=693a91f6-7a1b-4bc4-97a0-0ec2b1fa5aaa' });
    await t.call('linxiao', 'mobile.start');
    await expect(t.call('zhouting', 'org.person.contact', { personId: 'zhouting', mobile: '13800000002' })).rejects.toThrow('管理员');
    await expect(t.call('linxiao', 'org.person.contact', { personId: 'zhouting', mobile: 'abc' })).rejects.toThrow('手机号格式不对');
    await expect(t.call('linxiao', 'org.person.contact', { personId: 'zhouting', wecomUserId: '周婷' })).rejects.toThrow('企微账号格式不对');
    await t.call('linxiao', 'org.person.contact', { personId: 'zhouting', mobile: '13800000002' });
    await t.call('linxiao', 'org.person.contact', { personId: 'wugang', wecomUserId: 'WuGang' });
    expect(t.store.read().org.people.find((p) => p.id === 'wugang')).toMatchObject({ wecomUserId: 'WuGang', wecomIdManual: true });
    const r = await t.call<any>('linxiao', 'voiceprint.send');
    expect(r.group).toBe(true);
    const m = t.webhook.send.mock.calls.at(-1)![0];
    expect(m.msgtype).toBe('text');
    expect(m.mobiles).toEqual(['13800000002']);
    expect(m.userIds).toEqual(['WuGang']);
    expect(m.content).toContain('@林晓'); // 没填的人只写姓名（演示组织里自带的账号是编的，不拿来 @）
    expect(m.userIds).not.toContain('linxiao');
    await t.call('linxiao', 'org.person.contact', { personId: 'wugang', wecomUserId: '' });
    expect(t.store.read().org.people.find((p) => p.id === 'wugang')!.wecomUserId).toBeUndefined();
    // 重新同步（演示组织）手动填的手机号不丢
    await t.call('linxiao', 'org.sync');
    expect(t.store.read().org.people.find((p) => p.id === 'zhouting')!.mobile).toBe('13800000002');
  });

  it('配置引导：第一次打开时 boot 提示要走引导；状态里有电脑配置、推荐模型、各步完成情况；完成后不再提示', async () => {
    const t = make('setup');
    expect((await t.call<any>('linxiao', 'boot')).setupPending).toBe(true);
    expect((await t.call<any>('zhouting', 'boot')).setupPending).toBe(false);
    await expect(t.call('zhouting', 'setup.status')).rejects.toThrow('管理员');
    const st = await t.call<any>('linxiao', 'setup.status');
    expect(st).toMatchObject({
      done: false,
      org: { source: 'demo', people: 20, mentionable: 0 },
      push: { channel: null, hasWebhook: false },
      me: { id: 'linxiao', name: '林晓', voiceprint: false },
      mobile: { running: false },
      hardware: { cores: 18, memGb: 24 },
      models: { python: true, ffmpeg: true, asrModel: 'small', speaker: true, senseVoice: false, fireRed: false, asrReady: false },
      recommend: { engine: 'firered', installIds: ['asr-meeting-sensevoice', 'asr-meeting-firered2'], speakerInstallId: 'speaker-campplus' },
      asr: { mode: 'local', localModel: 'auto', cloud: null },
    });
    await t.call('linxiao', 'setup.finish');
    expect((await t.call<any>('linxiao', 'boot')).setupPending).toBe(false);
    expect((await t.call<any>('linxiao', 'setup.status')).done).toBe(true);
  });

  it('大模型连接测试：有回复算通、没回复算不通', async () => {
    const t = make('setup-llm');
    expect(await t.call<any>('linxiao', 'setup.llmTest')).toEqual({ ok: false });
    (t.svc as any).llm = async () => '收到';
    expect(await t.call<any>('linxiao', 'setup.llmTest')).toMatchObject({ ok: true, reply: '收到' });
  });

  it('电脑上现场录的声纹：录音数据落到上传目录、提完声纹就删；手机页不能调', async () => {
    const t = make('vp-data');
    await expect(t.call('linxiao', 'voiceprint.enrollData', { data: '', consent: true })).rejects.toThrow('录音数据无效');
    await expect(t.call('linxiao', 'voiceprint.enrollData', { data: Buffer.from('x').toString('base64'), consent: true }, 'mobile')).rejects.toThrow('手机页不能执行');
    const r = await t.call<any>('linxiao', 'voiceprint.enrollData', { data: Buffer.from('fake-webm').toString('base64'), ext: 'webm', consent: true });
    expect(r).toEqual({ ok: true, seconds: 12 });
    const path = (t.ext.enrollVoiceprint as any).mock.calls.at(-1)[0] as string;
    expect(path).toContain('pc-voice-');
    expect(existsSync(path)).toBe(false);
    expect(t.store.read().voiceprints.some((v) => v.personId === 'linxiao')).toBe(true);
    await expect(t.call('linxiao', 'voiceprint.enrollData', { data: Buffer.from('x').toString('base64'), consent: false })).rejects.toThrow('授权');
  });
});

describe('企微自建应用：同步换了通讯录后选身份、Secret 保留与查看', () => {
  it('同步后原身份不在新通讯录里：返回 needIdentity；新通讯录里选的第一个人成为管理员，配置引导能继续', async () => {
    const t = make('org-switch');
    await t.call('linxiao', 'wecom.save', { corpId: 'ww1', agentId: '1000002', secret: 'app-secret' });
    t.wecom.fetchOrg.mockImplementationOnce(async () => ({
      depts: [{ id: '1', name: '总部', leaderIds: ['ZhangSan'] }],
      people: [{ id: 'ZhangSan', name: '张三', deptId: '1', wecomUserId: 'ZhangSan' }, { id: 'LiSi', name: '李四', deptId: '1', wecomUserId: 'LiSi' }],
    }));
    const r = await t.call<any>('linxiao', 'org.sync');
    expect(r).toMatchObject({ source: 'wecom', needIdentity: true });
    await expect(t.call('linxiao', 'setup.status')).rejects.toThrow('当前身份无效');
    // 演示管理员已离职、没有在职管理员：PC 上谁都能选身份，选中的人成为管理员
    await t.call('linxiao', 'identity.set', { personId: 'ZhangSan' });
    expect(t.store.read().settings.adminIds).toEqual(['ZhangSan']);
    const st = await t.call<any>('ZhangSan', 'setup.status');
    expect(st.me).toMatchObject({ id: 'ZhangSan', name: '张三' });
    expect(st.wecom).toEqual({ corpId: 'ww1', agentId: '1000002', hasSecret: true });
    // 再同步一次，身份还在，不用再选
    t.wecom.fetchOrg.mockImplementationOnce(async () => ({
      depts: [{ id: '1', name: '总部', leaderIds: ['ZhangSan'] }],
      people: [{ id: 'ZhangSan', name: '张三', deptId: '1', wecomUserId: 'ZhangSan' }],
    }));
    expect((await t.call<any>('ZhangSan', 'org.sync')).needIdentity).toBe(false);
  });

  it('已保存的 Secret：管理员在电脑上能取回原文；非管理员、手机页取不到；没存过返回空', async () => {
    const t = make('secret-reveal');
    expect(await t.call<any>('linxiao', 'wecom.secret.reveal')).toEqual({ secret: '' });
    await t.call('linxiao', 'wecom.save', { corpId: 'ww1', agentId: '1000002', secret: 'app-secret-123' });
    expect(await t.call<any>('linxiao', 'wecom.secret.reveal')).toEqual({ secret: 'app-secret-123' });
    await expect(t.call('zhouting', 'wecom.secret.reveal')).rejects.toThrow('管理员');
    await expect(t.call('linxiao', 'wecom.secret.reveal', {}, 'mobile')).rejects.toThrow('手机页不能执行');
    // 只改 CorpID / AgentID、不填 Secret：原来的 Secret 保留
    await t.call('linxiao', 'wecom.save', { corpId: 'ww1', agentId: '1000003' });
    expect(await t.call<any>('linxiao', 'wecom.secret.reveal')).toEqual({ secret: 'app-secret-123' });
  });
});

describe('删除会议（meeting.delete）', () => {
  it('权限与归档拦截：普通参会人不能删、已归档项目不能删；主持人/管理员删除同时清理任务、通知和文件', async () => {
    const t = make('meeting-delete');
    // 演示数据里 mt_df_kickoff 属于 pj_dfactory（负责人 linxiao，主持人 linxiao，已派发 3 项任务）
    // zhaolei 只是参会人，既非主持人也非创建人/项目负责人/管理员
    const listAsMember = await t.call<any[]>('zhaolei', 'meeting.list', { filter: 'all' });
    expect(listAsMember.find((c) => c.id === 'mt_df_kickoff')?.canDelete).toBe(false);
    await expect(t.call('zhaolei', 'meeting.delete', { id: 'mt_df_kickoff' })).rejects.toThrow('只有主持人、创建人、项目负责人或管理员可以删除会议');

    // 给 mt_df_kickoff 建一个真实的会议文件目录，验证删除后磁盘也一并清理
    const filesDir = t.store.filesDir('mt_df_kickoff');
    writeFileSync(join(filesDir, 'rec.wav'), 'fake-audio');
    expect(existsSync(filesDir)).toBe(true);

    const listAsHost = await t.call<any[]>('linxiao', 'meeting.list', { filter: 'all' });
    const targetCard = listAsHost.find((c) => c.id === 'mt_df_kickoff');
    expect(targetCard?.canDelete).toBe(true);
    expect(targetCard?.taskCount).toBeGreaterThan(0);

    const beforeTaskIds = t.store.read().tasks.filter((x) => x.meetingId === 'mt_df_kickoff').map((x) => x.id);
    expect(beforeTaskIds.length).toBeGreaterThan(0);

    t.events.length = 0;
    const res = await t.call<any>('linxiao', 'meeting.delete', { id: 'mt_df_kickoff' });
    expect(res).toEqual({ ok: true, id: 'mt_df_kickoff', deletedTasks: beforeTaskIds.length });
    const st = t.store.read();
    expect(st.meetings.some((m) => m.id === 'mt_df_kickoff')).toBe(false);
    expect(st.tasks.some((tk) => tk.meetingId === 'mt_df_kickoff')).toBe(false);
    expect(st.notices.some((n) => (n.link.kind === 'meeting' || n.link.kind === 'meeting_plan') && n.link.id === 'mt_df_kickoff')).toBe(false);
    expect(st.notices.some((n) => n.link.kind === 'task' && beforeTaskIds.includes(n.link.id))).toBe(false);
    expect(existsSync(filesDir)).toBe(false);
    expect(t.events.some((e) => e.type === 'changed' && e.scope === 'all')).toBe(true);

    // 已归档项目的会议不能删，且卡片 canDelete=false
    t.store.update((s) => {
      const pj = s.projects.find((p) => p.id === 'pj_dfactory')!;
      pj.status = 'archived';
    });
    const archivedList = await t.call<any[]>('linxiao', 'meeting.list', { filter: 'all' });
    expect(archivedList.find((c) => c.id === 'mt_df_weekly')?.canDelete).toBe(false);
    await expect(t.call('linxiao', 'meeting.delete', { id: 'mt_df_weekly' })).rejects.toThrow('已归档');
  });
});
