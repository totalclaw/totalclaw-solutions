/**
 * 会议智能管理 · IPC 层：动作通道转给 service（PC 当前身份）、事件发给窗口、
 * 电脑端专属的选文件 / 打开文件、错误转成可读中文、返回的函数停掉定时器和手机页服务。
 */
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const h = vi.hoisted(() => ({
  root: '',
  handler: null as null | ((e: unknown, req: { action: string; payload?: unknown }) => Promise<any>),
  channel: '',
  sent: [] as Array<[string, any]>,
  dialogResult: { canceled: true, filePaths: [] as string[] },
  dialogCalls: [] as any[],
  opened: [] as string[],
  quit: [] as Array<() => void>,
  stopScheduler: null as any,
  mobileStop: null as any,
}));

vi.mock('electron', () => ({
  ipcMain: { handle: (c: string, fn: any) => { h.channel = c; h.handler = fn; } },
  dialog: { showOpenDialog: vi.fn(async (_w: unknown, o: unknown) => { h.dialogCalls.push(o); return h.dialogResult; }) },
  shell: { openPath: vi.fn(), showItemInFolder: vi.fn() },
}));
vi.mock('../utils/openPathGuarded', () => ({ openPathGuarded: vi.fn(async (p: string) => { h.opened.push(p); return ''; }) }));
vi.mock('../util/quitRegistry', () => ({ onAppWillQuit: (_n: string, fn: () => void) => { h.quit.push(fn); return () => {}; } }));
vi.mock('../services/accountScope', () => ({ accountPath: (...sub: string[]) => join(h.root, 'account', ...sub) }));
vi.mock('../services/sealedSecret', () => ({ canSealSecret: () => true, sealSecret: (s: string) => s, unsealSecret: (s: string) => s }));
vi.mock('../services/councilChatRouter', () => ({ runOneshotChat: vi.fn(async () => '') }));
const pipelineMock = vi.hoisted(() => () => ({
  runMeetingPipeline: async () => ({
    segments: [{ id: 'g1', start: 0, end: 5, speakerLabel: '陈立峰', text: '开会' }],
    speakers: [{ label: '陈立峰', personId: 'chenlifeng', matchedBy: 'nickname' }], topics: [], decisions: [], summaryLines: ['a'], durationSec: 5,
  }),
  generatePlan: async () => null, generateWeeklyReport: async () => null, generateProjectSummary: async () => null,
  enrollVoiceprint: async () => ({ ok: false, reason: 'x' }), exportSpeakerClip: async () => null,
}));
vi.mock('../services/meetingMgmt/pipeline/index', () => pipelineMock());
// 流水线模块（代理 B）还没落盘时 service.ts 里的 './pipeline/index' 解析不到绝对路径，按原始 id 再登记一次（落盘后这一条不起作用）
vi.mock('./pipeline/index', () => pipelineMock());
vi.mock('../services/meetingMgmt/scheduler', async (orig) => ({
  ...(await orig<typeof import('../services/meetingMgmt/scheduler')>()),
  startMeetingScheduler: vi.fn(() => { h.stopScheduler = vi.fn(); return h.stopScheduler; }),
}));
vi.mock('../services/meetingMgmt/mobile/server', () => ({
  startMeetingMobileServer: vi.fn(async () => { h.mobileStop = vi.fn(async () => {}); return { url: 'http://10.0.0.2:8280', port: 8280, stop: h.mobileStop }; }),
  buildMobileUrl: (b: string, t: string) => `${b}/m?t=${t}`,
  buildVoiceprintUrl: (b: string, t: string) => `${b}/v?t=${t}`,
  isLanOnlyUrl: () => false,
}));

import { IPC_CHANNELS } from '@totalclaw/ipc-contracts';
import { registerMeetingMgmtHandlers } from './meetingMgmt.ipc';
import { pipelineConfig } from '../services/meetingMgmt/pipeline/runtime';

const call = async <R = any>(action: string, payload?: unknown): Promise<R> => h.handler!(null, { action, payload });
let dispose: () => void;

beforeAll(() => {
  h.root = mkdtempSync(join(tmpdir(), 'mm-ipc-'));
  dispose = registerMeetingMgmtHandlers({
    logger: { info: vi.fn(), warn: vi.fn() },
    getMainWindow: () => ({ webContents: { send: (c: string, ev: unknown) => h.sent.push([c, ev]) } }),
    authState: { authenticated: true }, qiyeApiProc: null,
  } as any);
});
afterAll(() => rmSync(h.root, { recursive: true, force: true }));

describe('meetingMgmt.ipc', () => {
  it('注册动作通道并启动定时提醒；boot 走 PC 当前身份', async () => {
    expect(h.channel).toBe(IPC_CHANNELS.WORKBENCH_MM_INVOKE);
    expect(h.stopScheduler).toBeTypeOf('function');
    expect(pipelineConfig().agentTranscribe).toBeTypeOf('function'); // 设置选 agent 转写时用 agent 自己的 STT
    const boot = await call('boot');
    expect(boot.me.person.name).toBe('林晓');
  });

  it('越权 / 未知动作：抛可读中文错误', async () => {
    await expect(call('no.such')).rejects.toThrow('未知操作');
    await call('identity.set', { personId: 'zhouting' });
    await expect(call('settings.save', { patch: {} })).rejects.toThrow('只有管理员可以修改系统设置');
    await call('identity.set', { personId: 'linxiao' });
  });

  it('meeting.pickFiles：取消返回 null；选了文件 → 上传、处理，事件发给窗口', async () => {
    await call('identity.set', { personId: 'chenlifeng' });
    expect(await call('meeting.pickFiles', { id: 'mt_a2_weekly' })).toBeNull();
    expect(h.dialogCalls[0].properties).toContain('multiSelections');
    const f = join(h.root, '周会录音.m4a');
    writeFileSync(f, 'audio');
    h.dialogResult = { canceled: false, filePaths: [f] };
    h.sent.length = 0;
    const m = await call('meeting.pickFiles', { id: 'mt_a2_weekly' });
    expect(m.status).toBe('processing');
    await new Promise((r) => setTimeout(r, 20));
    expect(h.sent.every(([c]) => c === IPC_CHANNELS.WORKBENCH_MM_EVENT)).toBe(true);
    expect(h.sent.some(([, e]) => e.type === 'process' && e.stage === 'done')).toBe(true);
    const d = await call('meeting.get', { id: 'mt_a2_weekly' });
    expect(d.meeting.status).toBe('pending_confirm');
    // file.open 走 openPathGuarded，只开工作台数据目录里的会议文件
    await call('file.open', { meetingId: 'mt_a2_weekly', fileId: d.meeting.files[0].id });
    expect(h.opened).toEqual([d.meeting.files[0].path]);
    await expect(call('file.open', { meetingId: 'mt_a2_weekly', fileId: 'nope' })).rejects.toThrow('文件不存在');
  });

  it('voiceprint.import：取消返回 null', async () => {
    h.dialogResult = { canceled: true, filePaths: [] };
    expect(await call('voiceprint.import', { personId: 'chenlifeng', consent: true })).toBeNull();
    await call('identity.set', { personId: 'linxiao' });
  });

  it('返回的函数停掉定时提醒和手机页服务', async () => {
    expect((await call('mobile.start')).running).toBe(true);
    dispose();
    await new Promise((r) => setTimeout(r, 0));
    expect(h.stopScheduler).toHaveBeenCalled();
    expect(h.mobileStop).toHaveBeenCalled();
    expect(h.quit).toHaveLength(1);
  });
});
