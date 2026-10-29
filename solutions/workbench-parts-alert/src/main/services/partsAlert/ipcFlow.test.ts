/**
 * 配件预警与补库 —— 主进程动作通道走一遍完整流程：
 * 示例数据 → 运算 → 检验 → 补库清单 → 转采购订单；规则改动让结果过期；定时运算成功 / 失败 / 邮件失败。
 * electron 与账号目录 mock 到临时目录，表格文件是真写真读。
 */
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { existsSync, mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { PaWorkbenchState } from '@totalclaw/ipc-contracts';

const H = vi.hoisted(() => ({
  handlers: new Map<string, (...args: any[]) => any>(),
  sent: [] as any[],
  notifications: [] as Array<{ title: string; body: string }>,
  root: '',
  mail: { ok: true, message: '' } as { ok: boolean; message?: string },
  mails: [] as any[],
}));

vi.mock('electron', () => ({
  ipcMain: { handle: (ch: string, fn: (...a: any[]) => any) => { H.handlers.set(ch, fn); } },
  app: { getPath: () => join(H.root, 'docs') },
  dialog: { showOpenDialog: vi.fn(async () => ({ canceled: true, filePaths: [] })) },
  shell: { openPath: vi.fn(async () => ''), showItemInFolder: vi.fn() },
  Notification: class { constructor(private o: { title: string; body: string }) {} show(): void { H.notifications.push(this.o); } },
}));
vi.mock('../accountScope', () => ({ accountPath: (...sub: string[]) => join(H.root, 'account', ...sub) }));
vi.mock('../caseMailSender', () => ({ sendCaseMail: vi.fn(async (_c: any, input: any) => { H.mails.push(input); return H.mail; }) }));

// 静态导入：放在 beforeAll 里动态导入，首次转译 + 加载整张动作通道模块图（含 i18n 词典）就算进 10s 钩子超时，
// 全量并发跑时要 7s。模块里的路径都经 accountPath / app.getPath 现取，收集阶段加载不受 H.root 影响。
import { IPC_CHANNELS } from '@totalclaw/ipc-contracts';
import { registerPartsAlertHandlers } from '../../ipc/partsAlert.ipc';

let invoke: <T = any>(action: string, payload?: unknown) => Promise<T>;
const state = (): Promise<PaWorkbenchState> => invoke<PaWorkbenchState>('state.get');

beforeAll(() => {
  H.root = mkdtempSync(join(tmpdir(), 'pa-ipc-'));
  registerPartsAlertHandlers({ getMainWindow: () => ({ webContents: { send: (_ch: string, ev: any) => H.sent.push(ev) } }), logger: { warn: () => {} }, readEmailCredentials: () => ({}), serviceAuth: null } as any);
  const fn = H.handlers.get(IPC_CHANNELS.WORKBENCH_PA_INVOKE)!;
  invoke = (action, payload) => fn({}, { action, payload });
});
afterAll(() => { rmSync(H.root, { recursive: true, force: true }); });

describe('向导流程', () => {
  it('没有数据不能运算；未知动作报错', async () => {
    await expect(invoke('compute.run', {})).rejects.toThrow();
    await expect(invoke('nope')).rejects.toThrow();
    expect((await state()).run).toBeNull();
  });

  it('示例数据一键投喂 → 运算出五种状态', async () => {
    const demo = await invoke<{ dir: string; files: Record<string, string> }>('data.demo');
    expect(Object.values(demo.files).every((f) => existsSync(f))).toBe(true);
    const s = await state();
    expect(Object.values(s.datasets).every((d) => d?.loaded)).toBe(true);
    expect(s.datasets.monthly!.layout).toBe('wide');
    expect(s.datasets.monthly!.periodColumns).toBe(36);
    await expect(invoke('compute.run', { asOf: 'not-a-date' })).rejects.toThrow();
    const summary = await invoke('compute.run', {});
    expect(summary.total).toBe(60);
    const after = await state();
    expect(after.run!.stale).toBe(false);
    expect(after.history.length).toBe(1);
    expect(after.history[0].newOut.length).toBe(8);
    expect(after.latest!.source).toBe('manual');
    expect((await invoke<any[]>('results.get', { which: 'result' })).length).toBe(60);
    expect(H.sent.some((e) => e.type === 'state')).toBe(true);
  });

  it('没检验不能确认补库清单；逐个与整组检验', async () => {
    const s0 = await state();
    expect(s0.lines).toEqual([]);
    expect(s0.pending.shortage_none + s0.pending.shortage_transit).toBe(20);
    await expect(invoke('replenish.confirm')).rejects.toThrow();
    const results = await invoke<any[]>('results.get', {});
    const one = results.find((r) => r.state === 'at_risk' && !r.hasInTransit && r.suggestQty > 0);
    await invoke('review.set', { items: [{ partNo: one.partNo, status: 'confirmed', text: '改为分两批下单', remark: '已和采购确认' }] });
    let s = await state();
    expect(s.run!.reviews[one.partNo]).toMatchObject({ status: 'confirmed', text: '改为分两批下单', remark: '已和采购确认' });
    expect(s.lines.map((l) => l.partNo)).toEqual([one.partNo]);
    // 健康的配件没有行动计划，检验请求被忽略
    const healthy = results.find((r) => r.state === 'healthy');
    await invoke('review.set', { items: [{ partNo: healthy.partNo, status: 'confirmed' }] });
    expect((await state()).run!.reviews[healthy.partNo]).toBeUndefined();
    expect(await invoke('review.bulk', { group: 'shortage_none', status: 'confirmed' })).toBe(s.pending.shortage_none);
    await invoke('review.bulk', { group: 'shortage_transit', status: 'confirmed' });
    s = await state();
    expect(s.pending.shortage_none + s.pending.shortage_transit).toBe(0);
    // 整组确认不覆盖已经检验过的
    expect(s.run!.reviews[one.partNo].text).toBe('改为分两批下单');
    expect(s.lines.length).toBeGreaterThan(8);
    // 呆滞、冗余没检验不挡补库
    expect(s.pending.stagnant).toBe(8);
  });

  it('补库清单：改量校验、取消勾选、确认后再改要重新确认', async () => {
    const s = await state();
    const l = s.lines[0];
    await expect(invoke('replenish.set', { items: [{ partNo: l.partNo, qty: 0 }] })).rejects.toThrow();
    await expect(invoke('replenish.set', { items: [{ partNo: l.partNo, qty: 1.5 }] })).rejects.toThrow();
    await expect(invoke('replenish.set', { items: [{ partNo: 'NOT-IN-LIST', qty: 5 }] })).rejects.toThrow();
    await expect(invoke('order.export')).rejects.toThrow();
    await invoke('replenish.set', { items: [{ partNo: l.partNo, qty: l.suggestQty + 20 }, { partNo: s.lines[1].partNo, selected: false }] });
    const totals = await invoke('replenish.confirm');
    expect(totals.lines).toBe(s.lines.length - 1);
    let after = await state();
    expect(after.lines[0]).toMatchObject({ qty: l.suggestQty + 20, suggestQty: l.suggestQty });
    expect(after.run!.replenishConfirmedAt).not.toBe('');
    await invoke('replenish.set', { items: [{ partNo: l.partNo, supplier: '换一家' }] });
    after = await state();
    expect(after.run!.replenishConfirmedAt).toBe('');
    await expect(invoke('order.export')).rejects.toThrow();
  });

  it('人确认后才生成采购订单；文件落盘并记进历史', async () => {
    await invoke('replenish.confirm');
    const ex = await invoke('order.export');
    expect(existsSync(ex.orderFile) && existsSync(ex.planFile)).toBe(true);
    const s = await state();
    expect(s.run!.exported!.lines).toBe(s.lines.filter((l) => l.selected).length);
    expect(s.history[0].files).toEqual([ex.orderFile, ex.planFile]);
    expect(await invoke('path.open', { path: ex.orderFile })).toBe(true);
    await expect(invoke('path.open', { path: join(H.root, 'missing.xlsx') })).rejects.toThrow();
  });

  it('改规则 → 结果过期，检验 / 补库 / 导出都被挡住，重新运算后恢复', async () => {
    await invoke('rules.save', { rules: { safetyDays: 30 } });
    let s = await state();
    expect(s.settings.rules.safetyDays).toBe(30);
    expect(s.run!.stale).toBe(true);
    expect(s.lines).toEqual([]);
    await expect(invoke('review.bulk', { group: 'stagnant', status: 'confirmed' })).rejects.toThrow();
    await expect(invoke('order.export')).rejects.toThrow();
    await expect(invoke('plan.export')).rejects.toThrow();
    await invoke('compute.run', { asOf: s.run!.asOf });
    s = await state();
    expect(s.run!.stale).toBe(false);
    expect(s.run!.reviews).toEqual({});
    expect(s.run!.rules.safetyDays).toBe(30);
    // 规则没变不算改动
    await invoke('rules.save', { rules: { safetyDays: 30 } });
    expect((await state()).run!.stale).toBe(false);
    await invoke('rules.reset');
    s = await state();
    expect(s.settings.rules).toEqual(s.defaults.rules);
    expect(s.run!.stale).toBe(true);
    // 重新投喂数据同样让结果过期
    await invoke('compute.run', {});
    await invoke('data.clear', { dataset: 'yearly' });
    s = await state();
    expect(s.datasets.yearly).toBeNull();
    expect(s.run!.stale).toBe(true);
  });
});

describe('定时运算', () => {
  it('没设文件夹不能开启；文件夹里缺必须的数据时如实报失败', async () => {
    await expect(invoke('schedule.save', { schedule: { enabled: true, folder: '' } })).rejects.toThrow();
    const empty = join(H.root, 'empty-feed');
    mkdirSync(empty, { recursive: true });
    await invoke('schedule.save', { schedule: { enabled: true, time: '07:30', folder: empty } });
    const r = await invoke('schedule.runNow');
    expect(r.ok).toBe(false);
    const s = await state();
    expect(s.scheduleStatus.lastOk).toBe(false);
    expect(s.scheduleStatus.lastMessage).toBe(r.message);
    expect(r.message.length).toBeGreaterThan(0);
    expect(H.sent.some((e) => e.type === 'schedule' && e.payload.ok === false)).toBe(true);
  });

  it('读文件夹里最新的表运算、存历史、推通知；不动向导里那次结果', async () => {
    const before = await state();
    const folder = join(before.outputDir, '示例数据');
    await invoke('schedule.save', { schedule: { folder } });
    expect(Object.keys(await invoke('schedule.preview')).sort()).toEqual(['inTransit', 'leadTime', 'monthly', 'stock', 'yearly']);
    H.notifications.length = 0;
    const r = await invoke('schedule.runNow');
    expect(r.ok).toBe(true);
    const s = await state();
    expect(s.history[0].source).toBe('schedule');
    expect(s.history[0].total).toBe(60);
    expect(s.history[0].files.length).toBe(1);
    expect(existsSync(s.history[0].files[0])).toBe(true);
    expect(s.latest!.source).toBe('schedule');
    expect(s.scheduleStatus.lastOk).toBe(true);
    expect(s.scheduleStatus.lastFiles.length).toBe(5);
    expect(s.run!.id).toBe(before.run!.id);
    expect(H.notifications.length).toBe(1);
    // 数据没变再跑一次：没有新增的缺货
    await invoke('schedule.runNow');
    const again = await state();
    expect(again.history[0].newOut).toEqual([]);
    expect(again.history[0].newRisk).toEqual([]);
    expect((await invoke<any[]>('results.get', { which: 'latest' })).length).toBe(60);
  });

  it('邮件：发出去带附件；发不出去把原因写进结果，运算本身仍算完成', async () => {
    await expect(invoke('schedule.save', { schedule: { emailEnabled: true, emailTo: '' } })).rejects.toThrow();
    await invoke('schedule.save', { schedule: { emailEnabled: true, emailTo: 'a@example.com; b@example.com' } });
    H.mails.length = 0;
    H.mail = { ok: true };
    let r = await invoke('schedule.runNow');
    expect(r.ok).toBe(true);
    expect(H.mails[0].to).toEqual(['a@example.com', 'b@example.com']);
    expect(existsSync(H.mails[0].attachments[0].path)).toBe(true);
    H.mail = { ok: false, message: 'SMTP 未配置' };
    r = await invoke('schedule.runNow');
    expect(r.ok).toBe(true);
    expect(r.message).toContain('SMTP 未配置');
    expect((await state()).scheduleStatus.lastMessage).toContain('SMTP 未配置');
  });
});
