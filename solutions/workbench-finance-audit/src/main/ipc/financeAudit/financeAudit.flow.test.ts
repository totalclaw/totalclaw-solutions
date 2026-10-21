/**
 * 财会审计批次 1 主流程（经真实 IPC 处理函数走一遍，模型走本地假端点 TOTALCLAW_E2E_LLM_URL）：
 *   公司档案 → 科目映射（中国表自动完成、IFRS 表要人确认）→ 项目（关联上一期）→
 *   A2 银企对账（分类计数、调节相等、不明扣款升级强制批准级）→ 签核（缺已知悉被拦、职责分离被拦、三级走通归档）→
 *   校验签核有效 → 改归档文件后「签核失效」→ 转交 A1 → A1 月结（阿语产出，回核把故意写错的说明标未核实）→
 *   清单人工勾选重出文件 → 退回到第 ④ 步再跑 → 批准人专属的跨期确认 → 归档；
 *   A2 总账 ↔ 子账：六类计数、汇率成因、根因引用不存在单号被打回。
 * 不碰任何真实模型、浏览器、邮箱或账号。
 */
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { appendFileSync, existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createServer, type Server } from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import * as XLSX from 'xlsx';
import AdmZip from 'adm-zip';

const TMP = mkdtempSync(join(tmpdir(), 'fau-flow-'));
const handlers = new Map<string, (...a: any[]) => any>();

vi.mock('electron', () => ({
  app: { getPath: (n: string) => join(TMP, n), getVersion: () => '0.0.0', isPackaged: false },
  ipcMain: { handle: (ch: string, fn: (...a: any[]) => any) => handlers.set(ch, fn) },
  dialog: { showOpenDialog: async () => ({ canceled: true, filePaths: [] }) },
  shell: { openPath: async () => '', showItemInFolder: () => undefined },
  BrowserWindow: class {},
}));
const auditCalls: any[] = [];
vi.mock('../../services/audit', () => ({ audit: (e: any) => { auditCalls.push(e); } }));
vi.mock('../../services/bidWriter/docx', async (orig) => ({
  ...(await orig<typeof import('../../services/bidWriter/docx')>()),
  writePdfFromHtml: async (p: string) => { writeFileSync(p, '%PDF-1.4 test'); },
}));

import { IPC_CHANNELS, type FauCloseResult, type FauReconResult, type FauRun } from '@totalclaw/ipc-contracts';
import { registerFinanceAuditHandlers } from '../financeAudit.ipc';
import * as closeFx from '../../services/financeAudit/__fixtures__/accounting/close';
import * as bankFx from '../../services/financeAudit/__fixtures__/accounting/bank';
import * as glFx from '../../services/financeAudit/__fixtures__/accounting/glsub';
import { bankXlsx, budgetXlsx, journalXlsx, policyXlsx, subledgerXlsx, tbXlsx } from '../../services/financeAudit/__fixtures__/accounting/toXlsx';

// ── 假模型端点 ──
const llmCalls: Array<{ module: string; skill: string; locale: string }> = [];
function say(locale: string, label: string, amount: number): string {
  const amt = Math.abs(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (locale === 'ar') return `يعود التغير أساسًا إلى «${label}» بمبلغ ${amt}.`;
  if (locale === 'en-US') return `Mainly driven by "${label}" of ${amt}.`;
  return `主要由「${label}」驱动，金额 ${amt} 元。`;
}
function fakeLlm(body: { module: string; prompt: string; responseLocale: string }): string {
  const data = JSON.parse(body.prompt.match(/<data>\n([\s\S]*?)\n<\/data>/)![1]);
  const skill = body.prompt.match(/<skill name="([^"]+)">/)![1];
  llmCalls.push({ module: body.module, skill, locale: body.responseLocale });
  if (skill === 'fa-variance-commentary') {
    return JSON.stringify({
      lines: data.lines.map((l: any) => {
        const d = l.drivers[0];
        // 埋点：6602 管理费用每次都写一个数据里没有的数字 → 重写一次后仍错 → 未核实
        if (l.accountCode === '6602') return { accountCode: l.accountCode, commentary: say(body.responseLocale, d?.label || l.accountName, 123456.78), unknown: false };
        if (!d) return { accountCode: l.accountCode, commentary: data.unknownPhrase, unknown: true };
        return { accountCode: l.accountCode, commentary: say(body.responseLocale, d.label, d.amount), unknown: false };
      }),
    });
  }
  if (skill === 'fa-break-trace') {
    return JSON.stringify({
      traces: data.breaks.map((b: any) => ({
        id: b.id,
        // 埋点：INV-006 的根因引用一个不存在的单号 → 打回，重写仍错 → 保持已打回
        rootCause: b.key === 'INV-006' ? 'INV-999 exists only in the subledger' : `${b.key} appears twice in the subledger`,
        owner: 'AR clerk', expectedClearDate: '2026-10-15', action: 'investigate',
      })),
    });
  }
  return '{}';
}

let server: Server;
async function invoke<T = any>(action: string, payload: unknown = {}): Promise<T> {
  const fn = handlers.get(IPC_CHANNELS.WORKBENCH_FINAUDIT_INVOKE)!;
  return fn(null, { action, payload });
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
const signers = {
  prep: { name: '张会计', title: '总账会计' },
  rev: { name: '李主管', title: '财务主管' },
  appr: { name: '王经理', title: '财务经理' },
};

beforeAll(async () => {
  server = createServer((req, res) => {
    let raw = '';
    req.on('data', (c) => { raw += c; });
    req.on('end', () => {
      const text = fakeLlm(JSON.parse(raw));
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ text, model: 'fake-llm' }));
    });
  });
  await new Promise<void>((r) => server.listen(0, '127.0.0.1', () => r()));
  const port = (server.address() as { port: number }).port;
  process.env.TOTALCLAW_E2E = '1';
  process.env.TOTALCLAW_E2E_LLM_URL = `http://127.0.0.1:${port}/llm`;
  registerFinanceAuditHandlers({ logger: { info: () => undefined, warn: () => undefined }, getMainWindow: () => null, appConfig: {} } as any);

  journalXlsx(join(FX, 'bank-journal.xlsx'), bankFx.bookRows);
  bankXlsx(join(FX, 'bank.xlsx'), bankFx.bankRows);
  tbXlsx(join(FX, 'bank-tb.xlsx'), bankFx.tb);
  journalXlsx(join(FX, 'journal.xlsx'), closeFx.journal);
  tbXlsx(join(FX, 'tb.xlsx'), closeFx.tb);
  tbXlsx(join(FX, 'tb-prior.xlsx'), closeFx.tbPrior);
  tbXlsx(join(FX, 'tb-ifrs.xlsx'), closeFx.ifrsTb);
  budgetXlsx(join(FX, 'budget.xlsx'), closeFx.budget);
  policyXlsx(join(FX, 'policies.xlsx'), closeFx.policies);
  subledgerXlsx(join(FX, 'gl.xlsx'), glFx.gl);
  subledgerXlsx(join(FX, 'sub.xlsx'), glFx.sub);
});

afterAll(() => {
  server?.close();
  delete process.env.TOTALCLAW_E2E;
  delete process.env.TOTALCLAW_E2E_LLM_URL;
  rmSync(TMP, { recursive: true, force: true });
});

describe('财会审计批次 1 主流程', () => {
  let projectId = '';
  let bankRunId = '';

  it('公司档案：中国档案保存成功（沙特、阿联酋档案批次 4 开放，见 financeAudit.tax.flow.test.ts）', async () => {
    expect((await invoke('home.get')).company).toBeNull();
    const c = await invoke('company.save', {
      company: {
        name: '测试集团', regions: ['CN'], region: 'CN', standard: 'CAS', currency: 'CNY', outputLocale: 'zh-CN', sodMode: 'block',
        signers: [{ ...signers.prep, levels: ['prepare'] }, { ...signers.rev, levels: ['review'] }, { ...signers.appr, levels: ['approve'] }],
      },
    });
    expect(c.id).toMatch(/^co_/);
    expect(c.packages).toContain('core');
    // 投融资与估值在同一张卡里：默认启用（首页分组默认折叠，展开即可用）
    expect(c.packages).toContain('capital');
  });

  it('科目映射：中国科目表自动完成，IFRS 科目表进入人工确认', async () => {
    const cn = await invoke('company.mapAccounts', { path: join(FX, 'tb.xlsx'), standard: 'CAS' });
    expect(cn.result.autoComplete).toBe(true);
    expect(cn.result.unmapped).toBe(0);
    const ifrs = await invoke('company.mapAccounts', { path: join(FX, 'tb-ifrs.xlsx'), standard: 'IFRS' });
    expect(ifrs.result.autoComplete).toBe(false);
    expect(ifrs.result.needsReview).toBe(true);
    const home = await invoke('home.get');
    await invoke('company.save', { company: { ...home.company, accountMap: cn.result.entries, accountMapConfirmed: true } });
    expect((await invoke('company.get')).accountMapConfirmed).toBe(true);
    const profiles = await invoke('region.profiles');
    expect(profiles.profiles.map((p: { id: string; available: boolean }) => `${p.id}:${p.available}`)).toEqual(['CN:true', 'INTL:true', 'SA:true', 'AE:true']);
    const cat = await invoke('catalog.get');
    expect(cat).toHaveLength(48);
    expect(cat.filter((m: { group: string; visible: boolean }) => m.group === 'capital' && m.visible)).toHaveLength(8);
  });

  it('项目：新建上一期与本期，切换、详情里能看到上一期', async () => {
    await expect(invoke('project.create', { type: 'month_close', period: '2026-9' })).rejects.toThrow(/格式/);
    const prev = await invoke('project.create', { type: 'month_close', period: '2026-08' });
    const p = await invoke('project.create', { type: 'month_close', period: '2026-09', prevProjectId: prev.id });
    projectId = p.id;
    expect(p.name).toContain('2026-09');
    const st = await invoke('project.status', {});
    expect(st.project.id).toBe(p.id);
    expect(st.prev.id).toBe(prev.id);
    await invoke('project.switch', { id: prev.id });
    expect((await invoke('home.get')).project.id).toBe(prev.id);
    await invoke('project.switch', { id: p.id });
  });

  it('A2 银企对账：分类计数与夹具一致、调节后两边相等、不明扣款 > 1000 升级并强制批准级', async () => {
    const ins = await invoke('data.inspect', { path: join(FX, 'bank.xlsx'), kind: 'bank' });
    expect(ins.missing).toEqual([]);
    expect(ins.mapping.amountIn).toBe('收入金额');
    const j = await invoke('data.import', { path: join(FX, 'bank-journal.xlsx'), kind: 'journal', slot: 'bankJournal', moduleId: 'recon' });
    const b = await invoke('data.import', { path: join(FX, 'bank.xlsx'), kind: 'bank', slot: 'bank', moduleId: 'recon' });
    const t = await invoke('data.import', { path: join(FX, 'bank-tb.xlsx'), kind: 'tb', slot: 'bankTb', moduleId: 'recon' });
    expect(b.rowCount).toBe(bankFx.bankRows.length);
    let run: FauRun = await invoke('run.create', { moduleId: 'recon', modeId: 'bank' });
    await expect(invoke('run.start', { runId: run.id })).rejects.toThrow(/还缺/);
    run = await invoke('run.setInputs', { runId: run.id, inputs: { bankJournal: [j.id], bank: [b.id], bankTb: [t.id] } });
    expect(run.steps.upload.status).toBe('done');
    await invoke('run.start', { runId: run.id });
    run = await waitRun(run.id);
    bankRunId = run.id;
    expect(run.steps.validate.status).toBe('done');
    expect(run.steps.analyze.status).toBe('done');
    expect(run.steps.draft.status).toBe('done');
    const res = run.result as FauReconResult;
    expect(res.bank).toHaveLength(2);
    for (const acc of res.bank!) {
      const exp = bankFx.expected[acc.account];
      expect(acc.counts).toEqual(exp.counts);
      expect(acc.statement.balanced).toBe(true);
      expect(acc.statement.adjustedBook).toBe(exp.adjusted);
      expect(acc.statement.adjustedBank).toBe(exp.adjusted);
      expect(acc.escalations.length).toBe(exp.escalations);
    }
    const unknown = res.bank!.flatMap((a) => a.items).find((i) => i.cause === 'unknown_deduction');
    expect(unknown?.bankAmount).toBe(-150000);
    expect(run.requiredLevels).toEqual(['prepare', 'review', 'approve']);
    expect(run.artifacts).toHaveLength(2);
    for (const a of run.artifacts) expect(existsSync(a.path)).toBe(true);
  });

  it('签核：缺已知悉被拦 → 职责分离被拦 → 三级走通并归档；校验有效；改归档文件后签核失效', async () => {
    const { run } = await invoke<{ run: FauRun }>('run.get', { runId: bankRunId });
    const acks = run.reminders.map((r) => r.id);
    expect(acks.length).toBeGreaterThan(0);
    await expect(invoke('signoff.submit', { runId: bankRunId, signer: signers.prep })).rejects.toThrow(/已知悉/);
    await expect(invoke('signoff.submit', { runId: bankRunId, signer: signers.prep, acknowledged: acks })).rejects.toThrow(/理由/);
    await invoke('signoff.submit', { runId: bankRunId, signer: signers.prep, acknowledged: acks, comment: '已核对' });
    await expect(invoke('signoff.decide', { runId: bankRunId, level: 'review', decision: 'approve', signer: signers.prep, acknowledged: acks, comment: '复核' })).rejects.toThrow(/职责分离/);
    await expect(invoke('signoff.decide', { runId: bankRunId, level: 'approve', decision: 'approve', signer: signers.appr, acknowledged: acks, comment: 'x' })).rejects.toThrow(/轮到/);
    await invoke('signoff.decide', { runId: bankRunId, level: 'review', decision: 'approve', signer: signers.rev, acknowledged: acks, comment: '复核通过' });
    const out = await invoke('signoff.decide', { runId: bankRunId, level: 'approve', decision: 'approve', signer: signers.appr, acknowledged: acks, comment: '同意' });
    expect(out.archived).toBe(true);
    expect(out.run.status).toBe('archived');
    expect(auditCalls.filter((a) => a.action === 'finance-audit.signoff')).toHaveLength(3);
    const ok = await invoke('signoff.verify', { runId: bankRunId });
    expect(ok.ok).toBe(true);
    // 改动归档区里的已签核文件
    const archived = join(TMP, 'userData', 'finance-audit', 'companies', out.run.companyId, 'projects', projectId, 'archive', bankRunId);
    const manifest = JSON.parse(readFileSync(join(archived, 'manifest.json'), 'utf8'));
    expect(manifest.files.some((f: { name: string }) => f.name.endsWith('.pdf'))).toBe(true);
    appendFileSync(join(archived, manifest.files[0].name), 'tampered');
    const bad = await invoke('signoff.verify', { runId: bankRunId });
    expect(bad.ok).toBe(false);
    expect(bad.tampered).toHaveLength(1);
    expect(bad.message.key).toMatch(/签核失效/);
  });

  it('转交：A2 已签核结果转到 A1；目标规划中被拦', async () => {
    await expect(invoke('handoff.send', { fromRunId: bankRunId, toModuleId: 'review' })).rejects.toThrow(/不允许|即将上线/);
    const h = await invoke('handoff.send', { fromRunId: bankRunId, toModuleId: 'close' });
    expect(h.toModuleId).toBe('close');
  });

  let closeRunId = '';
  it('A1 月结（阿语产出）：勾稽全过、6 万跨期须批准人、计提与手算一致、滚动表不倒挤、写错数字的说明标未核实', async () => {
    const ids: Record<string, string> = {};
    for (const [slot, file, kind] of [['journal', 'journal.xlsx', 'journal'], ['tb', 'tb.xlsx', 'tb'], ['tbPrior', 'tb-prior.xlsx', 'tb'], ['budget', 'budget.xlsx', 'budget'], ['accrualPolicy', 'policies.xlsx', 'accrual_policy']]) {
      ids[slot] = (await invoke('data.import', { path: join(FX, file), kind, slot, moduleId: 'close' })).id;
    }
    const run0 = await invoke('run.start', { moduleId: 'close', modeId: 'standard', outputLocale: 'ar', inputs: Object.fromEntries(Object.entries(ids).map(([k, v]) => [k, [v]])) });
    const run = await waitRun(run0.id);
    closeRunId = run.id;
    expect(run.steps.draft.status, JSON.stringify(run.steps)).toBe('done');
    const res = run.result as FauCloseResult;
    expect(res.trial!.balanced).toBe(true);
    expect(res.trial!.checks.every((c) => c.ok)).toBe(true);
    const big = res.crossPeriod!.find((c) => c.voucherNo === '记-0001')!;
    expect(big.adjustThisPeriod).toBe(true);
    expect(big.approval).toBe('approver');
    expect(run.requiredLevels).toContain('approve');
    expect(Object.fromEntries(res.accruals!.map((a) => [a.policyId, a.accrual]))).toEqual(closeFx.expected.accruals);
    const rf = res.rollForward!.find((r) => r.accountCode === '2241')!;
    expect(rf.unexplained).toBe(closeFx.expected.rollForwardUnexplained['2241']);
    expect(rf.closing).not.toBe(rf.computed);
    expect(res.flux!.length).toBeGreaterThanOrEqual(3);
    const f6602 = res.flux!.find((f) => f.accountCode === '6602')!;
    expect(f6602.commentaryStatus).toBe('unverified');
    expect(res.flux!.filter((f) => f.accountCode !== '6602' && f.commentaryStatus === 'verified').length).toBeGreaterThanOrEqual(2);
    expect(run.verification.find((v) => v.ref === 'flux:6602')?.status).toBe('unverified');
    expect(run.reminders.some((r) => r.id === 'u:flux:6602')).toBe(true);
    // 转交来的 A2 未达账项进了「未结事项」
    expect(res.openItems.length).toBe(4);
    // 模型按阿语调用；6602 被要求重写过一次
    expect(llmCalls.filter((c) => c.skill === 'fa-variance-commentary' && c.locale === 'ar').length).toBe(2);
    // 阿语产出：RTL、草稿警示行、表头是阿语
    const pkg = run.artifacts.find((a) => a.kind === 'xlsx')!;
    const wb = XLSX.read(readFileSync(pkg.path), { type: 'buffer' });
    expect(wb.SheetNames).toHaveLength(10);
    expect((wb.Workbook?.Views?.[0] as { RTL?: boolean } | undefined)?.RTL).toBe(true);
    const first = XLSX.utils.sheet_to_json<string[]>(wb.Sheets[wb.SheetNames[1]], { header: 1 });
    expect(first[0][0]).toBe('مسودة بانتظار الاعتماد');
    expect(/[一-鿿]/.test(first[1].join(''))).toBe(false);
    const memo = run.artifacts.find((a) => a.kind === 'docx')!;
    expect(new AdmZip(memo.path).readAsText('word/document.xml')).toContain('<w:bidi/>');
  });

  it('关账清单人工勾选：只重算清单并重出文件，不重跑模型', async () => {
    const before = llmCalls.length;
    const run = await invoke<FauRun>('close.checklist.update', { runId: closeRunId, itemId: 'ar_ap_clearing', mark: 'ok', evidence: '往来核销 记-0003' });
    await waitRun(closeRunId);
    const item = (run.result as FauCloseResult).checklist!.items.find((i) => i.id === 'ar_ap_clearing')!;
    expect(item.mark).toBe('ok');
    expect(llmCalls.length).toBe(before);
  });

  it('A1 签核：退回 → 回到第 ④ 步重跑 → 跨期须批准人勾选 → 归档', async () => {
    let { run } = await invoke<{ run: FauRun }>('run.get', { runId: closeRunId });
    const all = run.reminders.map((r) => r.id);
    const notApprover = run.reminders.filter((r) => !r.approverOnly).map((r) => r.id);
    expect(run.reminders.some((r) => r.approverOnly)).toBe(true);
    await expect(invoke('signoff.submit', { runId: closeRunId, signer: signers.prep, acknowledged: all, comment: 'x' })).rejects.toThrow(/批准人/);
    await invoke('signoff.submit', { runId: closeRunId, signer: signers.prep, acknowledged: notApprover, comment: '已核对' });
    await expect(invoke('signoff.decide', { runId: closeRunId, level: 'review', decision: 'return', signer: signers.rev })).rejects.toThrow(/意见/);
    const ret = await invoke('signoff.decide', { runId: closeRunId, level: 'review', decision: 'return', signer: signers.rev, comment: '计提口径再看一下', returnToStep: 'analyze' });
    expect(ret.run.status).toBe('returned');
    expect(ret.run.returned.toStep).toBe('analyze');
    await invoke('run.retry', { runId: closeRunId, fromStep: 'analyze' });
    run = await waitRun(closeRunId);
    expect(run.status).toBe('ready');
    const ids = run.reminders.map((r) => r.id);
    const nonAppr = run.reminders.filter((r) => !r.approverOnly).map((r) => r.id);
    await invoke('signoff.submit', { runId: closeRunId, signer: signers.prep, acknowledged: nonAppr, comment: '重新编制' });
    await invoke('signoff.decide', { runId: closeRunId, level: 'review', decision: 'approve', signer: signers.rev, acknowledged: nonAppr, comment: '复核通过' });
    await expect(invoke('signoff.decide', { runId: closeRunId, level: 'approve', decision: 'approve', signer: signers.appr, acknowledged: nonAppr, comment: '同意' })).rejects.toThrow(/已知悉/);
    const done = await invoke('signoff.decide', { runId: closeRunId, level: 'approve', decision: 'approve', signer: signers.appr, acknowledged: ids, comment: '同意' });
    expect(done.archived).toBe(true);
    expect((await invoke('signoff.verify', { runId: closeRunId })).ok).toBe(true);
  });

  it('A2 总账 ↔ 子账：六类计数一致、汇率成因、根因引用不存在的单号被打回', async () => {
    const gl = await invoke('data.import', { path: join(FX, 'gl.xlsx'), kind: 'subledger', slot: 'gl', moduleId: 'recon' });
    const sub = await invoke('data.import', { path: join(FX, 'sub.xlsx'), kind: 'subledger', slot: 'sub', moduleId: 'recon' });
    const r0 = await invoke('run.start', { moduleId: 'recon', modeId: 'glsub', outputLocale: 'en-US', inputs: { gl: [gl.id], sub: [sub.id] } });
    const run = await waitRun(r0.id);
    expect(run.steps.draft.status, JSON.stringify(run.steps)).toBe('done');
    const res = (run.result as FauReconResult).glsub!;
    expect(res.counts).toEqual(glFx.expected.counts);
    expect(res.breaks.find((b) => b.key === 'INV-007')!.causes).toContain('fx');
    expect(res.breaks.find((b) => b.key === 'INV-006')!.trace!.status).toBe('rejected');
    expect(res.breaks.find((b) => b.key === 'INV-009')!.trace!.status).toBe('verified');
    // 英文产出没有汉字的固定文案（用户数据列除外）
    const rep = run.artifacts.find((a) => a.kind === 'xlsx')!;
    const wb = XLSX.read(readFileSync(rep.path), { type: 'buffer' });
    const head = XLSX.utils.sheet_to_json<string[]>(wb.Sheets[wb.SheetNames[2]], { header: 1 }).slice(0, 2).flat().join(' ');
    expect(/[一-鿿]/.test(head)).toBe(false);
    // 重查单条差异
    const brk = res.breaks.find((b) => b.key === 'INV-006')!;
    const re0 = await invoke<FauRun>('recon.break.retrace', { runId: run.id, breakId: brk.id });
    const re = await waitRun(re0.id);
    expect(re.modeId).toBe('retrace');
    expect((re.result as FauReconResult).glsub!.breaks).toHaveLength(1);
  });

  it('待办与签核队列：未结的运行出现在待办，点开直达对应步骤', async () => {
    const home = await invoke('home.get');
    expect(home.todos.some((t: any) => t.kind === 'signoff_pending' && t.step === 'signoff')).toBe(true);
    expect(home.queue.length).toBeGreaterThan(0);
    expect(home.closeProgress.checklistTotal).toBe(15);
  });
});
