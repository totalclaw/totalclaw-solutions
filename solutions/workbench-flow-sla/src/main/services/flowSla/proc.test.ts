import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { FsLedgerItem, FsSnapshotMeta } from '@totalclaw/ipc-contracts';
import rulesJson from './defaultRules.json';
import { computeSla, toSnapshot, type CalcOptions, type FlowRow, type FlowStatus, type SlaRules } from './calc';
import { FlowSlaProc, daysUntil, dueFollowUps, ledgerActions, ledgerStatus, nextFollowAt, syncTracking } from './proc';
import { DEFAULT_RULES, FlowSlaStore, MAX_SNAPSHOTS } from './store';

const rules = rulesJson as unknown as SlaRules;
const T = (s: string) => new Date(s.length === 10 ? `${s}T00:00:00` : s).getTime();
const DAY = 86_400_000;
const root = mkdtempSync(join(tmpdir(), 'fs-proc-'));
afterAll(() => rmSync(root, { recursive: true, force: true }));
let seq = 0;
const freshStore = (): FlowSlaStore => { seq += 1; const d = join(root, `s${seq}`); return new FlowSlaStore(() => d); };

const flow = (p: Partial<FlowRow> & Pick<FlowRow, 'system' | 'flowNo' | 'flowName'>): FlowRow => ({ initiator: '张三', status: 'running', startAt: T('2026-09-01'), ...p });
const run = (flows: FlowRow[], now: number) => {
  const opt: CalcOptions = { now, periodStart: T('2026-10-05'), periodEnd: T('2026-10-12') };
  return { result: computeSla(flows, [], rules, opt), statusByKey: new Map<string, FlowStatus>(flows.map((f) => [`${f.system}|${f.flowNo}`, f.status])), roster: [{ name: '王五', dept: '', email: 'wang@example.com', identity: '' }], rules, nowMs: now };
};

describe('跟进名单同步', () => {
  const now = T('2026-10-12T09:00:00');
  const first = syncTracking([], run([
    flow({ system: 'OA', flowNo: 'A1', flowName: '退款申请流程', currentNode: '出纳付款', currentHandler: '王五' }), // 内部驱动，逾期
    flow({ system: 'OA', flowNo: 'A2', flowName: '服务商变更', currentHandler: '李四' }),                         // 外部流转，逾期（30 天）
    flow({ system: 'OA', flowNo: 'A3', flowName: '退款申请流程', startAt: T('2026-10-11') }),                    // 正常
    flow({ system: 'OA', flowNo: 'A4', flowName: '退款申请流程', status: 'done', endAt: T('2026-10-08') }),       // 已办结
  ], now));

  it('只有在途已逾期的进名单；内部 3 天、外部 7 天后跟进', () => {
    expect(first.added).toBe(2);
    const by = Object.fromEntries(first.items.map((t) => [t.flowNo, t]));
    expect(Object.keys(by).sort()).toEqual(['A1', 'A2']);
    expect(by.A1).toMatchObject({ intervalDays: 3, handler: '王五', handlerEmail: 'wang@example.com', currentNode: '出纳付款', nextFollowAt: nextFollowAt(now, 3), closedAt: '' });
    expect(by.A2).toMatchObject({ intervalDays: 7, handler: '李四', handlerEmail: '', nextFollowAt: nextFollowAt(now, 7) });
    expect(by.A1.overdueDays).toBeGreaterThan(30);
    expect(by.A1.notes).toHaveLength(1);
  });

  it('再次导入：还在途的更新天数但不打乱跟进节奏；已办结 / 终止的闭环；这次没出现的原样保留', () => {
    const later = T('2026-10-14T09:00:00');
    const withNote = first.items.map((t) => (t.flowNo === 'A1' ? { ...t, notes: [...t.notes, { at: 'x', text: '已催办', kind: 'note' as const }] } : t));
    const extra = { ...first.items[0], key: 'CSS|Z9', system: 'CSS' as const, flowNo: 'Z9' };
    const second = syncTracking([...withNote, extra], run([
      flow({ system: 'OA', flowNo: 'A1', flowName: '退款申请流程', currentNode: '资金管理科审批', currentHandler: '赵六' }),
      flow({ system: 'OA', flowNo: 'A2', flowName: '服务商变更', status: 'done', endAt: T('2026-10-13') }),
    ], later));
    expect(second).toMatchObject({ added: 0, closed: 1 });
    const by = Object.fromEntries(second.items.map((t) => [t.flowNo, t]));
    expect(by.A1).toMatchObject({ handler: '赵六', handlerEmail: '', currentNode: '资金管理科审批', nextFollowAt: nextFollowAt(now, 3), closedAt: '' });
    expect(by.A1.days).toBeGreaterThan(first.items.find((t) => t.flowNo === 'A1')!.days);
    expect(by.A1.notes).toHaveLength(2);
    expect(by.A2.closedAt).toBe(new Date(later).toISOString());
    expect(by.A2.closeReason).toContain('已办结');
    expect(by.Z9.closedAt).toBe('');
    // 没闭环的排前面
    expect(second.items[second.items.length - 1].flowNo).toBe('A2');
  });

  it('终止的流程也闭环（计算结果里不带终止流程，靠导入的状态判断）', () => {
    const r = syncTracking(first.items, run([flow({ system: 'OA', flowNo: 'A1', flowName: '退款申请流程', status: 'terminated' })], now + DAY));
    expect(r.items.find((t) => t.flowNo === 'A1')!.closeReason).toContain('已终止');
  });

  it('闭环后又逾期的重新进名单，不留两条', () => {
    const closed = first.items.map((t) => ({ ...t, closedAt: '2026-10-12T02:00:00.000Z', closeReason: '手工闭环' }));
    const r = syncTracking(closed, run([flow({ system: 'OA', flowNo: 'A1', flowName: '退款申请流程' })], now + DAY));
    expect(r.items.filter((t) => t.flowNo === 'A1')).toHaveLength(1);
    expect(r.items.find((t) => t.flowNo === 'A1')!.closedAt).toBe('');
    expect(r.added).toBe(1);
  });

  it('到期判断：到了跟进日且这一次还没提醒过', () => {
    const items = first.items;
    expect(dueFollowUps(items, now + 2 * DAY)).toEqual([]);
    expect(dueFollowUps(items, now + 3 * DAY).map((t) => t.flowNo)).toEqual(['A1']);
    expect(dueFollowUps(items, now + 8 * DAY).map((t) => t.flowNo).sort()).toEqual(['A1', 'A2']);
    const notified = items.map((t) => ({ ...t, notifiedFor: t.nextFollowAt }));
    expect(dueFollowUps(notified, now + 8 * DAY)).toEqual([]);
    expect(dueFollowUps(items.map((t) => ({ ...t, closedAt: 'x' })), now + 8 * DAY)).toEqual([]);
  });
});

const ledgerItem = (p: Partial<FsLedgerItem>): FsLedgerItem => ({
  id: 'l1', item: '整理资料清单', dept: '甲部', owner: '张三', requirement: '', deadline: '2026-10-31', acceptance: '超时下降', status: 'doing', escalated: false, source: '',
  progress: [], createdAt: '', updatedAt: '', remindedFor: '', escalatedFor: '', ...p,
});

describe('改善台账的期限', () => {
  it('距期限的天数按日历日算', () => {
    expect(daysUntil('2026-10-31', T('2026-10-24T23:59:00'))).toBe(7);
    expect(daysUntil('2026-10-31', T('2026-10-31T08:00:00'))).toBe(0);
    expect(daysUntil('2026-10-31', T('2026-11-01T00:01:00'))).toBe(-1);
    expect(daysUntil('没写', T('2026-10-31'))).toBeNull();
  });
  it('状态：进行中过了期限算逾期；已完成 / 已归档不变', () => {
    expect(ledgerStatus(ledgerItem({}), T('2026-10-31T23:00:00'))).toBe('doing');
    expect(ledgerStatus(ledgerItem({}), T('2026-11-01T01:00:00'))).toBe('overdue');
    expect(ledgerStatus(ledgerItem({ status: 'overdue', deadline: '2026-12-31' }), T('2026-11-01'))).toBe('doing');
    expect(ledgerStatus(ledgerItem({ status: 'done' }), T('2026-12-01'))).toBe('done');
    expect(ledgerStatus(ledgerItem({ status: 'archived' }), T('2026-12-01'))).toBe('archived');
    expect(ledgerStatus(ledgerItem({ deadline: '' }), T('2026-12-01'))).toBe('doing');
  });
  it('到期前 7 天内提醒一次，逾期后升级一次', () => {
    const it0 = ledgerItem({});
    expect(ledgerActions([it0], T('2026-10-23T10:00:00'), 7)).toEqual({ remind: [], escalate: [] });
    expect(ledgerActions([it0], T('2026-10-24T10:00:00'), 7).remind).toHaveLength(1);
    expect(ledgerActions([{ ...it0, remindedFor: '2026-10-31' }], T('2026-10-25T10:00:00'), 7).remind).toHaveLength(0);
    // 期限改过之后，新的期限重新提醒
    expect(ledgerActions([{ ...it0, remindedFor: '2026-10-20' }], T('2026-10-25T10:00:00'), 7).remind).toHaveLength(1);
    expect(ledgerActions([it0], T('2026-11-02T10:00:00'), 7)).toMatchObject({ remind: [], escalate: [it0] });
    expect(ledgerActions([{ ...it0, escalatedFor: '2026-10-31' }], T('2026-11-02T10:00:00'), 7).escalate).toHaveLength(0);
    expect(ledgerActions([{ ...it0, status: 'done' }], T('2026-11-02T10:00:00'), 7)).toEqual({ remind: [], escalate: [] });
  });
});

describe('后台守护（固定时钟）', () => {
  let clock = T('2026-10-12T09:00:00');
  let store: FlowSlaStore;
  let events: Array<{ type: string; payload?: any }>;
  let notes: Array<[string, string]>;
  let proc: FlowSlaProc;
  beforeEach(() => {
    clock = T('2026-10-12T09:00:00');
    store = freshStore();
    events = []; notes = [];
    proc = new FlowSlaProc({ store, remindDays: () => 7, broadcast: (e) => events.push(e), notify: (t, b) => notes.push([t, b]), now: () => clock });
  });

  it('在途跟进：到期提醒一次，下一轮不重复；记了进展顺延后到新的日期再提醒', async () => {
    const sync = syncTracking([], run([flow({ system: 'OA', flowNo: 'A1', flowName: '退款申请流程', currentHandler: '王五' }), flow({ system: 'OA', flowNo: 'A2', flowName: '退款申请流程', currentHandler: '王五' })], clock));
    store.update((s) => { s.tracking = sync.items; });
    expect(await proc.tick()).toEqual([]);
    clock += 3 * DAY + 60_000;
    const fired = await proc.tick();
    expect(fired).toHaveLength(1);
    expect(fired[0]).toMatchObject({ type: 'follow_up', title: '有 2 条在途流程到了跟进时间' });
    expect(fired[0].body).toContain('A1');
    expect(notes).toHaveLength(1);
    expect(events.map((e) => e.type)).toEqual(['reminder', 'state']);
    expect(store.read().reminders).toHaveLength(1);
    expect(await proc.tick()).toEqual([]);
    // 记进展 = 顺延下次跟进
    store.update((s) => { s.tracking[0].nextFollowAt = nextFollowAt(clock, 3); });
    clock += 2 * DAY;
    expect(await proc.tick()).toEqual([]);
    clock += DAY + 60_000;
    const again = await proc.tick();
    expect(again).toHaveLength(1);
    expect(again[0].title).toBe('有 1 条在途流程到了跟进时间');
  });

  it('改善台账：到期前 7 天提醒确认，逾期后标逾期并升级督办，各只一次', async () => {
    store.update((s) => { s.ledger = [ledgerItem({ id: 'a', deadline: '2026-10-25' }), ledgerItem({ id: 'b', deadline: '2026-10-15', status: 'done' })]; });
    expect(await proc.tick()).toEqual([]);
    clock = T('2026-10-18T09:00:00');
    const due = await proc.tick();
    expect(due.map((r) => r.type)).toEqual(['ledger_due']);
    expect(due[0].title).toContain('还有 7 天到期');
    expect(due[0].body).toContain('整理资料清单');
    expect(store.read().ledger[0].remindedFor).toBe('2026-10-25');
    expect(await proc.tick()).toEqual([]);
    clock = T('2026-10-27T09:00:00');
    const over = await proc.tick();
    expect(over.map((r) => r.type)).toEqual(['ledger_overdue']);
    expect(over[0].title).toContain('已逾期 2 天');
    expect(store.read().ledger[0]).toMatchObject({ status: 'overdue', escalated: true, escalatedFor: '2026-10-25' });
    expect(store.read().ledger[1].status).toBe('done');
    expect(await proc.tick()).toEqual([]);
    // 延期后回到进行中，新的期限重新走一遍
    store.update((s) => { s.ledger[0].deadline = '2026-11-30'; });
    clock = T('2026-11-24T09:00:00');
    const redo = await proc.tick();
    expect(redo.map((r) => r.type)).toEqual(['ledger_due']);
    expect(store.read().ledger[0].status).toBe('doing');
  });

  it('一段出错不影响另一段', async () => {
    const sync = syncTracking([], run([flow({ system: 'OA', flowNo: 'A1', flowName: '退款申请流程', currentHandler: '王五' })], clock));
    store.update((s) => { s.tracking = sync.items; s.ledger = [ledgerItem({ deadline: '2026-10-16' })]; });
    const broken = new FlowSlaProc({ store, remindDays: () => { throw new Error('boom'); }, broadcast: (e) => events.push(e), now: () => clock });
    clock += 4 * DAY;
    const fired = await broken.tick();
    expect(fired.map((r) => r.type)).toEqual(['follow_up']);
    // 换回正常的，台账那段照常提醒
    expect((await proc.tick()).map((r) => r.type)).toEqual(['ledger_due']);
  });

  it('start / stop 可以反复调用', () => {
    proc.start(); proc.start(); proc.stop(); proc.stop();
  });
});

describe('落盘', () => {
  it('原子写、读回、换目录即换账号', () => {
    let d = join(root, 'acct-a');
    const store = new FlowSlaStore(() => d);
    store.update((s) => { s.settings.weeklyRecipients = 'a@example.com'; s.settings.holidays = ['2026-10-01']; });
    store.setData({ flows: [flow({ system: 'OA', flowNo: 'A1', flowName: 'x' })], nodes: [], roster: [] });
    expect(existsSync(join(d, 'state.json'))).toBe(true);
    expect(existsSync(join(d, 'state.json.tmp'))).toBe(false);
    expect(JSON.parse(readFileSync(join(d, 'state.json'), 'utf-8')).settings.weeklyRecipients).toBe('a@example.com');
    const reopened = new FlowSlaStore(() => d);
    expect(reopened.read().settings).toMatchObject({ weeklyRecipients: 'a@example.com', holidays: ['2026-10-01'] });
    expect(reopened.data().flows).toHaveLength(1);
    d = join(root, 'acct-b');
    expect(store.read().settings.weeklyRecipients).toBe('');
    expect(store.data().flows).toEqual([]);
  });
  it('规则：默认用内置的，导入后用导入的，恢复后回到内置', () => {
    const store = freshStore();
    expect(store.baseRules()).toBe(DEFAULT_RULES);
    const custom = { ...rules, version: '新版' };
    store.setCustomRules(custom);
    expect(new FlowSlaStore(() => store.root()).baseRules().version).toBe('新版');
    store.setCustomRules(null);
    expect(store.baseRules()).toBe(DEFAULT_RULES);
    expect(new FlowSlaStore(() => store.root()).customRules()).toBeNull();
  });
  it('周期快照：同一周期覆盖，按周期从新到旧排，超过上限删最旧的', () => {
    const store = freshStore();
    const opt: CalcOptions = { now: T('2026-10-12'), periodStart: T('2026-10-05'), periodEnd: T('2026-10-12') };
    const res = computeSla([flow({ system: 'OA', flowNo: 'A1', flowName: '退款申请流程', status: 'done', endAt: T('2026-10-08') })], [], rules, opt);
    const meta = (i: number): FsSnapshotMeta => ({ id: `weekly-${i}`, kind: 'weekly', savedAt: new Date(i).toISOString(), ...toSnapshot(`w${i}`, { periodStart: i * 10, periodEnd: i * 10 + 7 }, res) });
    const data = { flows: [], nodes: [], roster: [], options: opt, rules, aliases: {} };
    for (let i = 1; i <= MAX_SNAPSHOTS + 3; i += 1) store.saveSnapshot(meta(i), data);
    store.saveSnapshot({ ...meta(MAX_SNAPSHOTS + 3), label: '重算' }, data);
    const list = store.read().snapshots;
    expect(list).toHaveLength(MAX_SNAPSHOTS);
    expect(list[0]).toMatchObject({ id: `weekly-${MAX_SNAPSHOTS + 3}`, label: '重算' });
    expect(list[list.length - 1].id).toBe('weekly-4');
    expect(store.snapshotFiles()).toHaveLength(MAX_SNAPSHOTS);
    expect(store.snapshotData('weekly-1')).toBeNull();
    expect(store.snapshotData(`weekly-${MAX_SNAPSHOTS}`)?.options.periodEnd).toBe(opt.periodEnd);
    expect(store.snapshotData('../state')).toBeNull();
    store.removeSnapshot('weekly-4');
    expect(store.read().snapshots).toHaveLength(MAX_SNAPSHOTS - 1);
    expect(store.snapshotFiles()).toHaveLength(MAX_SNAPSHOTS - 1);
  });
  it('坏掉的 state.json 当成空的，不抛错', () => {
    const store = freshStore();
    store.update(() => undefined);
    require('node:fs').writeFileSync(join(store.root(), 'state.json'), '{坏了');
    const again = new FlowSlaStore(() => store.root());
    expect(again.read().ledger).toEqual([]);
    expect(again.read().session.cases).toEqual([]);
  });
});
