/**
 * 会议智能管理 · 落盘：缺字段补默认、原子写、改到一半抛错不落盘、坏文件不当空、换账号换目录、路径工具。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

vi.mock('../accountScope', () => ({ accountPath: (...sub: string[]) => join(tmpdir(), 'mm-store-unused', ...sub) }));

import { MeetingMgmtStore, emptyState, normalizeState } from './store';

let root = '';
beforeEach(() => { root = mkdtempSync(join(tmpdir(), 'mm-store-')); });
afterEach(() => rmSync(root, { recursive: true, force: true }));

describe('MeetingMgmtStore', () => {
  it('没有文件 = 空状态（默认设置）；normalize 补齐数组字段', () => {
    const s = new MeetingMgmtStore(() => join(root, 'a')).read();
    expect(s).toEqual(emptyState());
    expect(s.settings.confirmTimeoutHours).toBe(24);
    const n = normalizeState({ settings: { confirmTimeoutHours: 12, ai: { asr: 'agent' } }, meetings: [{ id: 'm' }], tasks: [{ id: 't' }], tokens: { a: 'x', b: 3 } });
    expect(n.settings.confirmTimeoutHours).toBe(12);
    expect(n.settings.ai).toMatchObject({ asr: 'agent', voiceprintThreshold: 0.55 }); // 没写的项补默认值
    expect(n.settings.wecom.hasSecret).toBe(false);
    expect(n.meetings[0]).toMatchObject({ speakers: [], segments: [], confirmations: [], taskIds: [] });
    expect(n.tasks[0]).toMatchObject({ events: [], progressLog: [], objectionHistory: [], reminders: {} });
    expect(n.tokens).toEqual({ a: 'x' });
  });

  it('update 原子写进 state.json；fn 抛错时不落盘、缓存回到上次提交的状态', () => {
    const store = new MeetingMgmtStore(() => join(root, 'a'));
    store.update((s) => { s.meId = 'linxiao'; });
    expect(JSON.parse(readFileSync(store.statePath(), 'utf-8')).meId).toBe('linxiao');
    expect(() => store.update((s) => { s.meId = 'zhouting'; s.projects.push({ id: 'x' } as any); throw new Error('不合法'); })).toThrow('不合法');
    expect(store.read().meId).toBe('linxiao');
    expect(store.read().projects).toEqual([]);
    expect(readdirSync(join(root, 'a')).filter((f) => f.includes('.tmp'))).toEqual([]);
  });

  it('坏文件留档，不静默覆盖', () => {
    const dir = join(root, 'a');
    const store = new MeetingMgmtStore(() => dir);
    store.root();
    writeFileSync(store.statePath(), '{ broken', 'utf-8');
    const warn = vi.fn();
    const s = new MeetingMgmtStore(() => dir, warn).read();
    expect(s.meId).toBeNull();
    expect(readdirSync(dir).some((f) => f.startsWith('state.json.corrupt-'))).toBe(true);
    expect(warn).toHaveBeenCalled();
  });

  it('换账号（目录变了）丢缓存、读新目录', () => {
    let dir = join(root, 'a');
    const store = new MeetingMgmtStore(() => dir);
    store.update((s) => { s.meId = 'a'; });
    dir = join(root, 'b');
    expect(store.read().meId).toBeNull();
  });

  it('目录工具与路径守卫；企微密文单独一个文件', () => {
    const store = new MeetingMgmtStore(() => join(root, 'a'));
    expect(store.filesDir('mt_1')).toBe(join(root, 'a', 'files', 'mt_1'));
    expect(store.filesDir('../../evil')).toBe(join(root, 'a', 'files', '______evil'));
    expect(existsSync(store.voiceprintsDir())).toBe(true);
    expect(store.isInsideRoot(join(store.uploadsDir(), 'x.m4a'))).toBe(true);
    expect(store.isInsideRoot(join(root, 'a', '..', 'x'))).toBe(false);
    expect(store.isInsideRoot(join(root, 'a'))).toBe(false);
    expect(store.readSecret()).toBe('');
    store.writeSecret('sealed-xyz');
    expect(store.readSecret()).toBe('sealed-xyz');
    expect(readFileSync(store.statePath(), { encoding: 'utf-8', flag: 'a+' })).not.toContain('sealed-xyz');
    store.writeSecret(null);
    expect(store.readSecret()).toBe('');
    store.filesDir('mt_2');
    store.removeMeetingFiles('mt_2');
    expect(existsSync(join(root, 'a', 'files', 'mt_2'))).toBe(false);
  });
});
