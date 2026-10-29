/**
 * 财会审计批次 2 主流程（经真实 IPC 处理函数走 A3–A8 七步，全部规则计算，不调模型）：
 *   公司档案的阈值覆盖只认已登记的 key（新模块的 key 也能存）→ 每个模块导入夹具、开跑、关键数字与手算一致、出文件
 *   → 编制 / 复核 / 批准三级签核归档；A3 签核前读不到、签核后能读到已签核账龄（供 E5）；
 *   A7 沙特模式阿语产出（xlsx RTL）；MT940 / CAMT.053 对账单经 data.inspect / data.import 接入银行流水数据集。
 * 不碰任何真实模型、浏览器、邮箱或账号。
 */
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import * as XLSX from 'xlsx';

const TMP = mkdtempSync(join(tmpdir(), 'fau-flow2-'));
const handlers = new Map<string, (...a: any[]) => any>();

vi.mock('electron', () => ({
  app: { getPath: (n: string) => join(TMP, n), getVersion: () => '0.0.0', isPackaged: false },
  ipcMain: { handle: (ch: string, fn: (...a: any[]) => any) => handlers.set(ch, fn) },
  dialog: { showOpenDialog: async () => ({ canceled: true, filePaths: [] }) },
  shell: { openPath: async () => '', showItemInFolder: () => undefined },
  BrowserWindow: class {},
}));
// 运行状态每一步 / 每个进度都原子写并 fsync；并发全量跑时多 worker 抢磁盘落盘把单条用例拖过超时。
// 这里只验业务结果不验断电持久性：保留「写临时文件 → rename」，只把 fsync 置空。
vi.mock('fs', async (orig) => ({ ...(await orig<typeof import('fs')>()), fsyncSync: () => undefined }));
vi.mock('../../services/audit', () => ({ audit: () => undefined }));
vi.mock('../../services/bidWriter/docx', async (orig) => ({
  ...(await orig<typeof import('../../services/bidWriter/docx')>()),
  writePdfFromHtml: async (p: string) => { writeFileSync(p, '%PDF-1.4 test'); },
}));

import {
  IPC_CHANNELS, type FauApResult, type FauArResult, type FauExpenseResult, type FauFaResult, type FauIcResult, type FauPayrollResult, type FauRun, type FauSignedAging,
} from '@totalclaw/ipc-contracts';
import { registerFinanceAuditHandlers } from '../financeAudit.ipc';
import * as FX from '../../services/financeAudit/__fixtures__/accounting/subledgers';
import * as ST from '../../services/financeAudit/__fixtures__/accounting/statements';

const Y = (yuan: number) => Math.round(yuan * 100);
async function invoke<T = any>(action: string, payload: unknown = {}): Promise<T> {
  return handlers.get(IPC_CHANNELS.WORKBENCH_FINAUDIT_INVOKE)!(null, { action, payload });
}
async function waitRun(runId: string, ms = 20_000): Promise<FauRun> {
  const t0 = Date.now();
  for (;;) {
    const r = await invoke<{ run: FauRun; running: boolean }>('run.get', { runId });
    if (!r.running && r.run.status !== 'running') return r.run;
    if (Date.now() - t0 > ms) throw new Error(`run ${runId} did not finish`);
    await new Promise((res) => setTimeout(res, 20));
  }
}
const FXD = join(TMP, 'fixtures');
const signers = { prep: { name: '张会计', title: '会计' }, rev: { name: '李主管', title: '财务主管' }, appr: { name: '王经理', title: '财务经理' } };

/** 导入若干槽位并开跑到第 ⑤ 步 */
async function runModule(moduleId: string, modeId: string, slots: Array<[string, string, FX.RawTable]>, outputLocale?: string): Promise<FauRun> {
  const inputs: Record<string, string[]> = {};
  for (const [slot, kind, table] of slots) {
    const path = FX.writeTable(join(FXD, `${moduleId}-${slot}.xlsx`), table);
    const ins = await invoke('data.inspect', { path, kind });
    expect(ins.missing, `${moduleId}/${slot}`).toEqual([]);
    const meta = await invoke('data.import', { path, kind, slot, moduleId });
    inputs[slot] = [meta.id];
  }
  const started = await invoke<FauRun>('run.start', { moduleId, modeId, inputs, outputLocale });
  const run = await waitRun(started.id);
  expect([run.steps.validate.status, run.steps.analyze.status, run.steps.draft.status], `${moduleId} ${JSON.stringify(run.validation?.blockers)}`).toEqual(['done', 'done', 'done']);
  for (const a of run.artifacts) expect(existsSync(a.path)).toBe(true);
  return run;
}

/** 编制 → 复核 → 批准，提醒项逐条已知悉 */
async function signAll(run: FauRun): Promise<FauRun> {
  const acks = run.reminders.map((r) => r.id);
  const base = { runId: run.id, acknowledged: acks, comment: '已核对，确认无误' };
  await invoke('signoff.submit', { ...base, signer: signers.prep });
  let out: any = await invoke('signoff.decide', { ...base, level: 'review', decision: 'approve', signer: signers.rev });
  if (run.requiredLevels.includes('approve')) out = await invoke('signoff.decide', { ...base, level: 'approve', decision: 'approve', signer: signers.appr });
  expect(out.archived).toBe(true);
  return out.run;
}

beforeAll(() => {
  registerFinanceAuditHandlers({ logger: { info: () => undefined, warn: () => undefined }, getMainWindow: () => null, appConfig: {} } as any);
});
afterAll(() => rmSync(TMP, { recursive: true, force: true }));

describe('财会审计批次 2 主流程', () => {
  it('公司档案：新模块的阈值覆盖可以存，未登记的 key 丢掉', async () => {
    const c = await invoke('company.save', {
      company: {
        name: '泰途测试集团', regions: ['CN'], region: 'CN', standard: 'CAS', currency: 'CNY', outputLocale: 'zh-CN', sodMode: 'block',
        signers: [{ ...signers.prep, levels: ['prepare'] }, { ...signers.rev, levels: ['review'] }, { ...signers.appr, levels: ['approve'] }],
        thresholds: { 'fixed-assets.cap.minAmount': 200000, 'ar.grace.days': 3, 'close.trial.ignoreMax': 1, 'ar.nope': 1, 'bogus.x': 1, 'payroll.cn.fundRate': -1 },
      },
    });
    expect(c.thresholds).toEqual({ 'fixed-assets.cap.minAmount': 200000, 'ar.grace.days': 3, 'close.trial.ignoreMax': 1 });
    await invoke('project.create', { type: 'month_close', period: FX.PERIOD });
    const cat = await invoke<Array<{ id: string; status: string }>>('catalog.get');
    expect(cat.filter((m) => ['ar', 'ap', 'expense', 'fixed-assets', 'payroll', 'intercompany'].includes(m.id)).every((m) => m.status === 'ready')).toBe(true);
    const th = await invoke<Array<{ key: string; override: number | null }>>('thresholds.get', { modules: ['fixed-assets'] });
    expect(th.find((x) => x.key === 'fixed-assets.cap.minAmount')?.override).toBe(200000);
  });

  it('A3 应收：账龄分层与手算一致；签核前读不到已签核账龄，签核后 E5 能读到', async () => {
    const run = await runModule('ar', 'standard', [['ar', 'ar', FX.AR], ['receipts', 'receipt', FX.RECEIPTS], ['customers', 'customer', FX.CUSTOMERS]]);
    const res = run.result as FauArResult;
    expect(res.buckets.map((b) => b.amount)).toEqual([Y(150000), Y(30000), Y(60000), 0, Y(60000), Y(12345.67), Y(15000)]);
    expect(res.provision).toBe(Y(45172.84));
    expect(run.requiredLevels).toEqual(['prepare', 'review', 'approve']);
    expect(run.artifacts.map((a) => a.kind)).toEqual(['xlsx', 'docx']);
    expect(await invoke('ar.signedAging')).toBeNull();
    const archived = await signAll(run);
    expect(archived.status).toBe('archived');
    const aging = await invoke<FauSignedAging>('ar.signedAging');
    expect(aging.runId).toBe(run.id);
    expect(aging.buckets.find((b) => b.bucket === 'd91_180')?.amount).toBe(Y(60000));
    expect(aging.customers.find((c) => c.customer === '丙公司')?.byBucket.d91_180).toBe(Y(60000));
  });

  it('A4 应付：三单分级、付款计划草稿、供应商暂停', async () => {
    const run = await runModule('ap', 'standard', [
      ['ap', 'ap', FX.AP], ['po', 'po', FX.PO], ['grn', 'grn', FX.GRN], ['invoices', 'invoice', FX.INVOICES], ['suppliers', 'supplier', FX.SUPPLIERS], ['funds', 'funds', FX.FUNDS],
    ]);
    const res = run.result as FauApResult;
    expect(res.matchCounts).toEqual({ match: 1, within_tol: 1, review: 1, reject: 2 });
    expect(res.plan).toMatchObject({ available: Y(63000), scheduledTotal: Y(57910), heldTotal: Y(66846.2), gapTier: 'small' });
    expect(res.suppliers.filter((s) => s.conclusion === 'hold').map((s) => s.supplier).sort()).toEqual(['南方电机', '西部物流']);
    expect(run.reminders.some((r) => r.id === 'ap:plan_draft')).toBe(true);
    expect((await signAll(run)).status).toBe('archived');
  });

  it('A5 报销稽核：逐单结论、同票多报与拆单升级、ZATCA 二维码', async () => {
    const run = await runModule('expense', 'batch', [['claims', 'expense_claim', FX.CLAIMS]]);
    const res = run.result as FauExpenseResult;
    expect(res.counts).toEqual({ pass: 1, review: 1, reject: 2, escalate: 4 });
    expect(res.lines.find((l) => l.claimNo === 'EXP-4')?.qr?.problems).toEqual(['total']);
    expect(run.requiredLevels).toEqual(['prepare', 'review', 'approve']);
    expect((await signAll(run)).status).toBe('archived');
  });

  it('A6 固定资产：折旧重算差额、处置分录导入草稿；公司档案覆盖的资本化门槛生效', async () => {
    const run = await runModule('fixed-assets', 'standard', [['register', 'fa_register', FX.FA_REGISTER], ['movements', 'fa_movement', FX.FA_MOVEMENTS]]);
    const res = run.result as FauFaResult;
    expect(res.lines.find((l) => l.assetNo === 'FA-002')?.diffPeriod).toBe(Y(62.5));
    expect(res.disposals[0].gainLoss).toBe(Y(2500));
    // 门槛被改成 2,000 元：3,000 元的新增不再提示「可能应费用化」
    expect(res.additions[0].flags).toEqual([]);
    expect(run.artifacts.map((a) => a.kind)).toEqual(['xlsx', 'docx', 'je_import_xlsx']);
    expect((await signAll(run)).status).toBe('archived');
  });

  it('A7 薪酬（中国）：个税累计预扣、增减员', async () => {
    const run = await runModule('payroll', 'cn', [['payroll', 'payroll', FX.PAYROLL_CN], ['payrollPrior', 'payroll', FX.PAYROLL_CN_PRIOR]]);
    const res = run.result as FauPayrollResult;
    expect(res.lines.map((l) => l.iitExpected)).toEqual([Y(950), Y(48), Y(3.75), 0]);
    expect(res.changes?.map((c) => `${c.kind}:${c.empId}`)).toEqual(['hire:E002', 'leave:E009']);
    expect((await signAll(run)).status).toBe('archived');
  });

  it('A7 薪酬（沙特，阿语产出）：GOSI 与期末服务金分段，xlsx 带 RTL', async () => {
    const run = await runModule('payroll', 'sa', [['payroll', 'payroll', FX.PAYROLL_SA]], 'ar');
    const res = run.result as FauPayrollResult;
    expect(res.lines.find((l) => l.empId === 'S001')?.eosb?.liability).toBe(Y(51078.77));
    expect(res.totals.eosbAccrual).toBe(Y(3078.77) + Y(410.96));
    const wb = XLSX.read(readFileSync(run.artifacts[0].path), { type: 'buffer' });
    expect((wb.Workbook?.Views?.[0] as { RTL?: boolean } | undefined)?.RTL).toBe(true);
    expect(run.outputLocale).toBe('ar');
    expect((await signAll(run)).status).toBe('archived');
  });

  it('A8 内部往来：抵销分录借贷平衡、担保超限', async () => {
    const run = await runModule('intercompany', 'standard', [['ic', 'intercompany', FX.IC], ['guarantees', 'guarantee', FX.GUARANTEES]]);
    const res = run.result as FauIcResult;
    expect(res.balanced).toBe(true);
    expect(res.je.reduce((s, l) => s + l.debit, 0)).toBe(Y(453000));
    expect(res.guarantees?.some((g) => g.flags.some((f) => f.code === 'gua.over_limit'))).toBe(true);
    const archived = await signAll(run);
    // 内部定价偏离转 C3（批次 4 已开放）
    await expect(invoke('handoff.send', { fromRunId: archived.id, toModuleId: 'transfer-pricing' })).resolves.toMatchObject({ fromModuleId: 'intercompany', toModuleId: 'transfer-pricing' });
  });

  it('MT940 / CAMT.053 对账单接入银行流水数据集', async () => {
    const sta = join(FXD, 'icbc.sta');
    writeFileSync(sta, ST.MT940);
    const ins = await invoke('data.inspect', { path: sta, kind: 'bank' });
    expect(ins).toMatchObject({ missing: [], sheetNames: ['MT940'] });
    const a = await invoke('data.import', { path: sta, kind: 'bank', slot: 'bank', moduleId: 'recon' });
    expect(a.rowCount).toBe(5);
    const xml = join(FXD, 'snb.xml');
    writeFileSync(xml, ST.CAMT053);
    const b = await invoke('data.import', { path: xml, kind: 'bank', slot: 'bank', moduleId: 'recon' });
    expect(b.rowCount).toBe(3);
    expect(b.issues.map((i: { code: string }) => i.code)).toEqual(['statement_pending']);
  });
});
