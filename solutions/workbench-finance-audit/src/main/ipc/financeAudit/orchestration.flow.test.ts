/**
 * 财会审计批次 8 编排（docs/finance-audit-solution.md 第 9.4、12、16.3 节），经真实 IPC 处理函数与真实工作流引擎：
 *   - 流程里的计算步骤（finance-audit:run-engine）与工作台同一份数据跑出的结果一致；
 *   - import-run 把流程说明挂到那次运行上，之后在工作台走三级正式签核并归档；
 *   - 三份金标准用例（月结、银企对账、沙特天课）用试跑数据经 qualityEval 跑通，关键数字精确相等；
 *   - 专家团里可选的计算步骤缺数据时跳过并说明，不让模型自己算。
 * 模型一律走本地假端点 / 桩，不碰真实模型、浏览器、邮箱或账号。
 */
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { createServer, type Server } from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const TMP = mkdtempSync(join(tmpdir(), 'fau-orch-'));
const handlers = new Map<string, (...a: any[]) => any>();

vi.mock('electron', () => ({
  app: { getPath: (n: string) => join(TMP, n), getVersion: () => '0.0.0', isPackaged: false },
  ipcMain: { handle: (ch: string, fn: (...a: any[]) => any) => handlers.set(ch, fn) },
  dialog: { showOpenDialog: async () => ({ canceled: true, filePaths: [] }) },
  shell: { openPath: async () => '', showItemInFolder: () => undefined },
  BrowserWindow: class {},
}));
vi.mock('../../services/audit', () => ({ audit: () => undefined }));
vi.mock('../../services/bidWriter/docx', async (orig) => ({
  ...(await orig<typeof import('../../services/bidWriter/docx')>()),
  writePdfFromHtml: async (p: string) => { (await import('node:fs')).writeFileSync(p, '%PDF-1.4 test'); },
}));

import { IPC_CHANNELS, type FauRun } from '@totalclaw/ipc-contracts';
import { WorkflowEngine } from '@totalclaw/workflow-engine';
import type { ProcessDefinition, Workflow } from '@totalclaw/core-domain';
import { registerFinanceAuditHandlers } from '../financeAudit.ipc';
import { FAU_TOOL_IMPORT_RUN, FAU_TOOL_RUN_ENGINE, runFinanceAuditTool } from './workflowTools';
import { BUILTIN_GOLD, runQualityEval } from '../../services/processLibrary/qualityEval';
import closeSeed from '../../services/processLibrary/seeds/fa-month-end-close.json';
import bankSeed from '../../services/processLibrary/seeds/fa-bank-reconciliation.json';
import zakatSeed from '../../services/processLibrary/seeds/sa-zakat-return.json';
import * as bankFx from '../../services/financeAudit/__fixtures__/accounting/bank';
import { bankXlsx, journalXlsx, tbXlsx } from '../../services/financeAudit/__fixtures__/accounting/toXlsx';

let server: Server;
async function invoke<T = any>(action: string, payload: unknown = {}): Promise<T> {
  return handlers.get(IPC_CHANNELS.WORKBENCH_FINAUDIT_INVOKE)!(null, { action, payload });
}
async function waitRun(runId: string, ms = 20_000): Promise<FauRun> {
  const t0 = Date.now();
  for (;;) {
    const r = await invoke<{ run: FauRun; running: boolean }>('run.get', { runId });
    if (!r.running && r.run.status !== 'running') return r.run;
    if (Date.now() - t0 > ms) throw new Error(`run ${runId} did not finish`);
    await new Promise((res) => setTimeout(res, 30));
  }
}
const FX = join(TMP, 'fixtures');
const signers = { prep: { name: '张会计', title: '总账会计' }, rev: { name: '李主管', title: '财务主管' }, appr: { name: '王经理', title: '财务经理' } };

beforeAll(async () => {
  // 工作台技能型说明走假端点：波动说明一律回「原因不明」（数字由引擎算，本测试只看引擎数字与签核），其余回空 JSON
  server = createServer((req, res) => {
    let raw = '';
    req.on('data', (c) => { raw += c; });
    req.on('end', () => {
      const { prompt = '' } = JSON.parse(raw || '{}');
      const data = JSON.parse(/<data>\n([\s\S]*?)\n<\/data>/.exec(prompt)?.[1] || '{}');
      const text = /<skill name="fa-variance-commentary">/.test(prompt)
        ? JSON.stringify({ lines: (data.lines || []).map((l: { accountCode: string }) => ({ accountCode: l.accountCode, commentary: data.unknownPhrase, unknown: true })) })
        : '{}';
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ text, model: 'fake-llm' }));
    });
  });
  await new Promise<void>((r) => server.listen(0, '127.0.0.1', () => r()));
  process.env.TOTALCLAW_E2E = '1';
  process.env.TOTALCLAW_E2E_LLM_URL = `http://127.0.0.1:${(server.address() as { port: number }).port}/llm`;
  registerFinanceAuditHandlers({ logger: { info: () => undefined, warn: () => undefined }, getMainWindow: () => null, appConfig: {} } as any);
  journalXlsx(join(FX, 'bank-journal.xlsx'), bankFx.bookRows);
  bankXlsx(join(FX, 'bank.xlsx'), bankFx.bankRows);
  tbXlsx(join(FX, 'bank-tb.xlsx'), bankFx.tb);
});

afterAll(() => {
  server?.close();
  delete process.env.TOTALCLAW_E2E;
  delete process.env.TOTALCLAW_E2E_LLM_URL;
  rmSync(TMP, { recursive: true, force: true });
});

/** 用真实工作流引擎跑一份实例化好的流程：工具步骤走 run-engine / import-run，模型步骤用桩 */
function engineRunner(llmText: (prompt: string) => string) {
  return async (wf: Workflow, input: Record<string, unknown>, humanReply: (nodeId: string) => string | true): Promise<Record<string, unknown>> => {
    const engine = new WorkflowEngine();
    const done = new Promise<Record<string, unknown>>((resolve, reject) => {
      engine.once('run:completed', (ev: any) => resolve(ev.finalVariables || {}));
      engine.once('run:failed', (ev: any) => reject(new Error(ev.error)));
    });
    await engine.startRun(wf, {
      llmCall: async (prompt: string) => llmText(prompt),
      toolCall: async (name: string, toolInput: Record<string, any>) => runFinanceAuditTool(name, toolInput),
      multiAgent: async () => ({}),
      humanConfirm: async (_q: string, ctx?: { nodeId?: string; requireComment?: boolean }) => {
        const r = humanReply(String(ctx?.nodeId || ''));
        // 签核点必须写意见：用例里每个人工确认都给了意见
        expect(ctx?.requireComment).toBe(true);
        expect(typeof r === 'string' && r.trim().length > 0).toBe(true);
        return { approved: true, reply: String(r) };
      },
    } as any, input);
    return done;
  };
}

describe('财会审计批次 8 · 编排', () => {
  let bankRun: FauRun;

  it('准备：公司档案、项目、银企对账数据（与批次 1 主流程同一份夹具）', async () => {
    await invoke('company.save', {
      company: {
        name: '编排测试集团', regions: ['CN'], region: 'CN', standard: 'CAS', currency: 'CNY', outputLocale: 'zh-CN', sodMode: 'block',
        signers: [{ ...signers.prep, levels: ['prepare'] }, { ...signers.rev, levels: ['review'] }, { ...signers.appr, levels: ['approve'] }],
      },
    });
    await invoke('project.create', { type: 'month_close', period: '2026-08' });
    await invoke('project.create', { type: 'month_close', period: '2026-09' });
    // 当前项目切到 8 月：流程按期间找项目，不按「当前项目」
    const projects = await invoke<Array<{ id: string; period: string }>>('project.list');
    await invoke('project.switch', { id: projects.find((p) => p.period === '2026-09')!.id });
    for (const [file, kind, slot] of [['bank-journal.xlsx', 'journal', 'bankJournal'], ['bank.xlsx', 'bank', 'bank'], ['bank-tb.xlsx', 'tb', 'bankTb']] as const) {
      await invoke('data.import', { path: join(FX, file), kind, slot, moduleId: 'recon' });
    }
    await invoke('project.switch', { id: projects.find((p) => p.period === '2026-08')!.id });
  });

  it('流程里的 run-engine 与工作台同一份数据算出的数字一致', async () => {
    // 先在工作台里用同一项目、同一份数据集跑一次（当前项目是 8 月，流程按期间找到 9 月项目）
    const projects = await invoke<Array<{ id: string; period: string }>>('project.list');
    const sep = projects.find((p) => p.period === '2026-09')!;
    await invoke('project.switch', { id: sep.id });
    const meta = await invoke<Array<{ id: string; slot: string }>>('data.list');
    const ids = (slot: string) => meta.filter((d) => d.slot === slot).map((d) => d.id);
    let run: FauRun = await invoke('run.create', { moduleId: 'recon', modeId: 'bank' });
    run = await invoke('run.setInputs', { runId: run.id, inputs: { bankJournal: ids('bankJournal'), bank: ids('bank'), bankTb: ids('bankTb') } });
    await invoke('run.start', { runId: run.id });
    run = await waitRun(run.id);
    await invoke('project.switch', { id: projects.find((p) => p.period === '2026-08')!.id });
    // 产出文件名精确到秒：错开一秒，免得两次运行写同一个文件名
    await new Promise((r) => setTimeout(r, 1100));
    const out: any = await runFinanceAuditTool(FAU_TOOL_RUN_ENGINE, { moduleId: 'recon', modeId: 'bank', period: '2026-09', sample: '${sample}' });
    expect(out.trial).toBe(false);
    expect(out.projectId).toBe(sep.id);
    expect(out.runRef).toMatch(/^fau:co_[^:]+:pj_[^:]+:[^:]+$/);
    expect(out.status).toBe('ready');
    expect(out.result).toEqual(run.result);
    for (const acc of out.result.bank) expect(acc.statement.adjustedBook).toBe(bankFx.expected[acc.account].adjusted);
    bankRun = (await invoke<{ run: FauRun }>('run.get', { runId: out.runId })).run;
  });

  it('import-run 把流程说明挂到运行上，之后在工作台三级签核归档；归档后不能再导入', async () => {
    const ref = `fau:${bankRun.companyId}:${bankRun.projectId}:${bankRun.id}`;
    await expect(runFinanceAuditTool(FAU_TOOL_IMPORT_RUN, { engine: ref, note: '${fau_note}' })).rejects.toThrow(/没有可导入的流程说明/);
    const r: any = await runFinanceAuditTool(FAU_TOOL_IMPORT_RUN, { engine: `{"runRef":"${ref}"}`, note: '工行户不明扣款 1,500 元须批准人处理；建行户金额差异 100 元待查。' });
    expect(r.imported).toHaveLength(1);
    expect(readFileSync(r.imported[0].path, 'utf8')).toContain('不明扣款 1,500');
    // 再导入一次：替换不叠加
    await runFinanceAuditTool(FAU_TOOL_IMPORT_RUN, { engine: ref, note: '第二版说明' });
    let { run } = await invoke<{ run: FauRun }>('run.get', { runId: bankRun.id });
    expect(run.artifacts.filter((a) => a.title.key === '流程解读与复核说明')).toHaveLength(1);
    const acks = run.reminders.map((x) => x.id);
    await invoke('signoff.submit', { runId: run.id, signer: signers.prep, acknowledged: acks, comment: '已核对流程说明' });
    await invoke('signoff.decide', { runId: run.id, level: 'review', decision: 'approve', signer: signers.rev, acknowledged: acks, comment: '复核通过' });
    const out = await invoke('signoff.decide', { runId: run.id, level: 'approve', decision: 'approve', signer: signers.appr, acknowledged: acks, comment: '同意' });
    expect(out.archived).toBe(true);
    run = out.run;
    expect(run.status).toBe('archived');
    const manifest = JSON.parse(readFileSync(join(TMP, 'userData', 'finance-audit', 'companies', run.companyId, 'projects', run.projectId, 'archive', run.id, 'manifest.json'), 'utf8'));
    expect(manifest.files.some((f: { name: string }) => f.name.endsWith('.md'))).toBe(true);
    expect((await invoke('signoff.verify', { runId: run.id })).ok).toBe(true);
    await expect(runFinanceAuditTool(FAU_TOOL_IMPORT_RUN, { engine: ref, note: '再来一次' })).rejects.toThrow(/已经开始签核/);
  });

  it('专家团里可选的计算步骤：缺数据跳过并说明，import-run 照实回「没有可导入的运行」', async () => {
    const skipped: any = await runFinanceAuditTool(FAU_TOOL_RUN_ENGINE, { moduleId: 'close', modeId: 'standard', period: '2026-09', optional: 'true' });
    expect(skipped.skipped).toBe(true);
    expect(skipped.reason).toMatch(/还缺必需的数据/);
    await expect(runFinanceAuditTool(FAU_TOOL_RUN_ENGINE, { moduleId: 'close', modeId: 'standard', period: '2026-09' })).rejects.toThrow(/还缺必需的数据/);
    await expect(runFinanceAuditTool(FAU_TOOL_RUN_ENGINE, { moduleId: 'close', modeId: 'standard', period: '2030-01', optional: 'true' })).resolves.toMatchObject({ skipped: true });
    const r: any = await runFinanceAuditTool(FAU_TOOL_IMPORT_RUN, { engine: JSON.stringify(skipped), note: '说明' });
    expect(r.imported).toEqual([]);
  });

  it.each([
    ['fa-month-end-close', closeSeed],
    ['fa-bank-reconciliation', bankSeed],
    ['sa-zakat-return', zakatSeed],
  ])('金标准用例 %s：试跑数据经 qualityEval 跑通，数字由引擎给出、精确相等', async (id, seed) => {
    const def = seed as unknown as ProcessDefinition;
    const cases = BUILTIN_GOLD[id];
    expect(cases?.length).toBeGreaterThan(0);
    const roles = (def.slots || []).flatMap((s) => s.preferredRoleIds || []).map((rid) => ({ id: rid, name: rid, department: 'finance' }));
    const res = await runQualityEval(def, cases, {
      roles, seatCap: 3,
      runWorkflow: engineRunner(() => '草稿说明：数字引自引擎结果，未核实的已标注。'),
      judge: async () => JSON.stringify(cases[0].rubric!.map(() => ({ score: 1 }))),
    });
    for (const c of res.cases) {
      expect(c.error, c.id).toBeUndefined();
      expect(c.numbers.length, c.id).toBeGreaterThan(0);
      expect(c.numbers.filter((n) => !n.ok), c.id).toEqual([]);
    }
    expect(res.score).toBe(1);
  });

  it('试跑区与用户项目分开：试跑不进当前公司的项目列表', async () => {
    const home = await invoke('home.get');
    expect(home.company.name).toBe('编排测试集团');
    expect(existsSync(join(TMP, 'userData', 'finance-audit-trial'))).toBe(true);
  });
});
