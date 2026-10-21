/**
 * 签核（第 9 节）：级别顺序、职责分离（阻断 / 允许但记录）、提醒项必须已知悉、批准人专属条目、退回必须写意见、
 * 哈希链（改一条记录即断）、文件被改即「签核失效」；进程重启后 running 的步骤标「已中断」。
 */
import { afterAll, describe, expect, it, vi } from 'vitest';
import { mkdtempSync, rmSync, writeFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

vi.mock('electron', () => ({ app: { getPath: () => tmpdir(), getVersion: () => '0' } }));

import type { FauRun, FauSignoffRecord } from '@totalclaw/ipc-contracts';
import { buildRecord, lastHash, nextLevel, verifyChain, verifySignoffs, SignoffError, sha256File } from './signoff';
import { FinanceAuditStore, emptySteps } from './store';

const DIR = mkdtempSync(join(tmpdir(), 'fau-sig-'));
afterAll(() => rmSync(DIR, { recursive: true, force: true }));

function mkRun(levels: FauRun['requiredLevels'] = ['prepare', 'review', 'approve']): FauRun {
  const f = join(DIR, `wp-${Math.random()}.xlsx`);
  writeFileSync(f, 'working paper');
  return {
    id: 'run_test1', projectId: 'pj_1', companyId: 'co_1', moduleId: 'close', modeId: 'standard', outputLocale: 'zh-CN', params: {}, inputs: {},
    status: 'ready', steps: emptySteps(), verification: [], requiredLevels: levels, rulesUsed: [], createdAt: '', updatedAt: '',
    reminders: [
      { id: 'v:1', source: 'validate', level: 'warn', message: { key: 'x' } },
      { id: 'cp:1', source: 'escalation', level: 'warn', message: { key: 'y' }, approverOnly: true },
    ],
    artifacts: [{ id: 'a', kind: 'xlsx', title: { key: 't' }, path: f, sha256: sha256File(f)!, locale: 'zh-CN', createdAt: '' }],
  };
}
const arts = (run: FauRun) => run.artifacts.map((a) => ({ path: a.path, sha256: sha256File(a.path)! }));
const P = { name: '张会计', title: '总账会计' };
const R = { name: '李主管', title: '财务主管' };
const A = { name: '王经理', title: '财务经理' };

function sign(run: FauRun, all: FauSignoffRecord[], input: Parameters<typeof buildRecord>[2], sodMode: 'block' | 'record' = 'block') {
  const rec = buildRecord(run, all, input, { sodMode, artifacts: arts(run), prevHash: lastHash(all) });
  all.push(rec);
  return rec;
}
const code = (fn: () => unknown) => { try { fn(); return ''; } catch (e) { return (e as SignoffError).code; } };

describe('签核', () => {
  it('级别顺序、已知悉、批准人专属、职责分离、退回意见', () => {
    const run = mkRun();
    const all: FauSignoffRecord[] = [];
    expect(nextLevel(run, all)).toBe('prepare');
    expect(code(() => sign(run, all, { level: 'review', decision: 'approve', signer: R }))).toBe('order');
    expect(code(() => sign(run, all, { level: 'prepare', decision: 'approve', signer: P }))).toBe('need_ack');
    expect(code(() => sign(run, all, { level: 'prepare', decision: 'approve', signer: P, acknowledged: ['v:1'] }))).toBe('need_reason');
    expect(code(() => sign(run, all, { level: 'prepare', decision: 'approve', signer: P, acknowledged: ['v:1', 'cp:1'], comment: 'r' }))).toBe('approver_only');
    sign(run, all, { level: 'prepare', decision: 'approve', signer: P, acknowledged: ['v:1'], comment: '已核对' });
    expect(code(() => sign(run, all, { level: 'review', decision: 'approve', signer: { name: ' 张会计 ', title: '' }, acknowledged: ['v:1'], comment: 'r' }))).toBe('sod');
    expect(code(() => sign(run, all, { level: 'review', decision: 'return', signer: R }))).toBe('need_comment');
    sign(run, all, { level: 'review', decision: 'return', signer: R, comment: '退回', returnToStep: 'draft' });
    // 退回后从编制重新开始
    expect(nextLevel(run, all)).toBe('prepare');
    sign(run, all, { level: 'prepare', decision: 'approve', signer: P, acknowledged: ['v:1'], comment: '改好了' });
    sign(run, all, { level: 'review', decision: 'approve', signer: R, acknowledged: ['v:1'], comment: '通过' });
    expect(code(() => sign(run, all, { level: 'approve', decision: 'approve', signer: A, acknowledged: ['v:1'], comment: 'x' }))).toBe('need_ack');
    sign(run, all, { level: 'approve', decision: 'approve', signer: A, acknowledged: ['v:1', 'cp:1'], comment: '同意' });
    expect(nextLevel(run, all)).toBeNull();
    expect(verifyChain(all)).toBe(true);
  });

  it('职责分离「允许但记录」：放行并记 sodWaived', () => {
    const run = mkRun(['prepare', 'review']);
    run.reminders = [];
    const all: FauSignoffRecord[] = [];
    sign(run, all, { level: 'prepare', decision: 'approve', signer: P }, 'record');
    const rec = sign(run, all, { level: 'review', decision: 'approve', signer: P }, 'record');
    expect(rec.sodWaived).toBe(true);
  });

  it('哈希链：改一条记录 / 删一条记录都会断；文件被改判签核失效', () => {
    const run = mkRun(['prepare', 'review']);
    run.reminders = [];
    const all: FauSignoffRecord[] = [];
    sign(run, all, { level: 'prepare', decision: 'approve', signer: P });
    sign(run, all, { level: 'review', decision: 'approve', signer: R });
    expect(verifySignoffs(all, [run], () => null).ok).toBe(true);
    const forged = all.map((r) => ({ ...r }));
    forged[0].signer = { name: '别人', title: '' };
    expect(verifyChain(forged)).toBe(false);
    expect(verifyChain([all[1]])).toBe(false);
    writeFileSync(run.artifacts[0].path, 'changed');
    const v = verifySignoffs(all, [run], () => null);
    expect(v.ok).toBe(false);
    expect(v.chainOk).toBe(true);
    expect(v.tampered).toHaveLength(1);
  });
});

describe('存储', () => {
  it('签核记录只追加；进程重启后 running 的步骤标「已中断」', () => {
    const store = new FinanceAuditStore(() => join(DIR, 'fa'));
    const run = mkRun();
    store.saveCompany({ id: 'co_1', name: 'c', regNo: '', vatNo: '', regions: ['CN'], region: 'CN', standard: 'CAS', currency: 'CNY', fiscalYearStartMonth: 1, hijriFiscalYear: false, erp: 'other', accountMap: [], accountMapConfirmed: false, thresholds: {}, signers: [], sodMode: 'block', packages: ['core'], outputLocale: 'zh-CN', createdAt: '1', updatedAt: '1' });
    store.saveProject({ id: 'pj_1', companyId: 'co_1', name: 'p', type: 'month_close', period: '2026-09', status: 'open', createdAt: '1', updatedAt: '1' });
    run.status = 'running';
    run.steps.analyze = { status: 'running', startedAt: Date.now() };
    store.saveRun(run);
    expect(store.markInterrupted()).toBe(1);
    const back = store.findRun('co_1', run.id)!;
    expect(back.steps.analyze.status).toBe('interrupted');
    expect(back.status).toBe('draft');
    const all: FauSignoffRecord[] = [];
    const r1 = sign(back, all, { level: 'prepare', decision: 'approve', signer: P, acknowledged: ['v:1'], comment: 'x' });
    store.appendSignoff('co_1', 'pj_1', r1);
    const text = readFileSync(store.signoffFile('co_1', 'pj_1'), 'utf8');
    expect(text.trim().split('\n')).toHaveLength(1);
    expect(store.readSignoffs('co_1', 'pj_1')[0].hash).toBe(r1.hash);
  });
});
