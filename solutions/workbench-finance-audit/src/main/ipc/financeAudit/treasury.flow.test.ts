/**
 * 财会审计批次 6（E1–E7）主流程：经真实 IPC 处理函数导入夹具 xlsx、开跑七步，模型走本地假端点（TOTALCLAW_E2E_LLM_URL）。
 *   E1 13 周预测三情景与手算一致、集中度升级进待办；付款计划只出草稿；
 *   E2 授权复核只给建议、现金池说明（一段故意写错数字 → 未核实）；
 *   E3 敞口与询价单草稿（没有任何下单 action）；E4 契约越线进待办、改 WACC 假设重算；
 *   E5 一般法金额与手算一致、简化法直接读应收与账龄模块导入的 ar 数据集；E6 / E7 跑通并签核归档；
 *   产出三语：表头按输出语言、en / ar 固定文案无汉字、阿语 xlsx RTL 与 docx bidi。
 * 不碰任何真实模型、浏览器、邮箱或账号。
 */
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createServer, type Server } from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import * as XLSX from 'xlsx';
import AdmZip from 'adm-zip';

const TMP = mkdtempSync(join(tmpdir(), 'fau-tr-flow-'));
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

import { containsHanText, tIn } from '@totalclaw/i18n';
import {
  IPC_CHANNELS, type FauCashResult, type FauEclResult, type FauFinancingResult, type FauFxResult, type FauInvestResult, type FauLocale, type FauRun,
  type FauTreasuryResult, type FauWcResult,
} from '@totalclaw/ipc-contracts';
import { registerFinanceAuditHandlers } from '../financeAudit.ipc';
import * as F from '../../services/financeAudit/__fixtures__/treasury';
import { fxRatesXlsx, openItemsXlsx, treasuryXlsx } from '../../services/financeAudit/__fixtures__/treasury/toXlsx';
import type { TreasuryKind } from '../../services/financeAudit/engines/treasury/types';

// ── 假模型端点：每个主题写一句，引用 facts 里的第一个数字；现金池收益段故意写一个不存在的数字 ──
const llmCalls: string[] = [];
function firstNumber(v: unknown): number | null {
  if (typeof v === 'number' && Number.isFinite(v) && Math.abs(v) >= 100) return v;
  if (Array.isArray(v)) { for (const x of v) { const n = firstNumber(x); if (n != null) return n; } }
  else if (v && typeof v === 'object') { for (const x of Object.values(v)) { const n = firstNumber(x); if (n != null) return n; } }
  return null;
}
function say(locale: string, n: string): string {
  if (locale === 'ar') return `يبلغ المبلغ الرئيسي ${n} ويحتاج إلى مراجعة بشرية.`;
  if (locale === 'en-US') return `The key amount is ${n} and needs human review.`;
  return `关键金额为 ${n}，需要人工复核。`;
}
function fakeLlm(body: { prompt: string; responseLocale: string }): string {
  const data = JSON.parse(body.prompt.match(/<data>\n([\s\S]*?)\n<\/data>/)![1]);
  const skill = body.prompt.match(/<skill name="([^"]+)">/)![1];
  llmCalls.push(skill);
  const n = firstNumber(data.facts) ?? 0;
  return JSON.stringify({
    paragraphs: data.topics.map((t: { id: string }) => ({ id: t.id, text: say(body.responseLocale, t.id === 'pool_benefit' ? '987,654.32' : n.toLocaleString('en-US', { minimumFractionDigits: 2 })) })),
  });
}

let server: Server;
async function invoke<T = any>(action: string, payload: unknown = {}): Promise<T> {
  return handlers.get(IPC_CHANNELS.WORKBENCH_FINAUDIT_INVOKE)!(null, { action, payload });
}
async function waitRun(runId: string): Promise<FauRun> {
  const t0 = Date.now();
  for (;;) {
    const r = await invoke<{ run: FauRun; running: boolean }>('run.get', { runId });
    if (!r.running && r.run.status !== 'running') return r.run;
    if (Date.now() - t0 > 20_000) throw new Error(`run ${runId} did not finish`);
    await new Promise((res) => setTimeout(res, 30));
  }
}
const FX = join(TMP, 'fixtures');
const files: Record<string, string> = {};
const ds: Record<string, string> = {};
async function imp(name: string, kind: string, moduleId: string): Promise<string> {
  const meta = await invoke('data.import', { path: files[name], kind, slot: name, moduleId });
  expect(meta.issues, name).toEqual([]);
  ds[`${moduleId}:${name}`] = meta.id;
  return meta.id;
}
async function runModule(moduleId: string, modeId: string, inputs: Record<string, string>, outputLocale: FauLocale = 'zh-CN'): Promise<FauRun> {
  const r = await invoke<FauRun>('run.start', { moduleId, modeId, outputLocale, inputs: Object.fromEntries(Object.entries(inputs).map(([k, v]) => [k, [v]])) });
  const run = await waitRun(r.id);
  expect(run.steps.validate.status, `${moduleId}/${modeId} ${JSON.stringify(run.validation?.blockers)}`).toBe('done');
  expect(run.steps.analyze.status, `${moduleId}/${modeId} ${JSON.stringify(run.steps.analyze.error)}`).toBe('done');
  expect(run.steps.draft.status, `${moduleId}/${modeId} ${JSON.stringify(run.steps.draft.error)}`).toBe('done');
  for (const a of run.artifacts) expect(existsSync(a.path)).toBe(true);
  return run;
}
const signers = { prep: { name: '张会计', title: '资金专员' }, rev: { name: '李主管', title: '资金主管' }, appr: { name: '王经理', title: '财务经理' } };
const Y = (yuan: number) => Math.round(yuan * 100);

beforeAll(async () => {
  server = createServer((req, res) => {
    let raw = '';
    req.on('data', (c) => { raw += c; });
    req.on('end', () => { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify({ text: fakeLlm(JSON.parse(raw)), model: 'fake-llm' })); });
  });
  await new Promise<void>((r) => server.listen(0, '127.0.0.1', () => r()));
  process.env.TOTALCLAW_E2E = '1';
  process.env.TOTALCLAW_E2E_LLM_URL = `http://127.0.0.1:${(server.address() as { port: number }).port}/llm`;
  registerFinanceAuditHandlers({ logger: { info: () => undefined, warn: () => undefined }, getMainWindow: () => null, appConfig: {} } as any);
  const put = (name: string, kind: TreasuryKind, rows: unknown[]) => { files[name] = treasuryXlsx(join(FX, `${name}.xlsx`), kind, rows as Record<string, unknown>[]); };
  put('balances', 'bank_balance', F.balances);
  put('plan', 'cash_plan', F.cashPlan);
  const putOpen = (name: string, rows: typeof F.agingAr) => { files[name] = openItemsXlsx(join(FX, `${name}.xlsx`), rows); };
  putOpen('forecastAr', F.forecastAr);
  putOpen('forecastAp', F.forecastAp);
  put('facilities', 'credit_facility', F.facilities);
  put('requests', 'payment_request', F.paymentRequests);
  put('authRequests', 'payment_request', F.authRequests);
  put('liquidityItems', 'liquidity_items', F.liquidityItems);
  put('fxExposure', 'fx_exposure', F.fxRows);
  put('loans', 'loan', F.loans);
  put('metrics', 'fin_metrics', F.metrics);
  put('covenants', 'covenant', F.covenants);
  put('exposures', 'credit_exposure', F.exposures);
  putOpen('agingAr', F.agingAr);
  putOpen('wcAp', F.wcAp);
  put('inventory', 'inventory', F.inventory);
  put('investments', 'investment', F.investments);
  files.fxRates = fxRatesXlsx(join(FX, 'fxRates.xlsx'), F.fxRates);
});

afterAll(() => {
  server?.close();
  delete process.env.TOTALCLAW_E2E;
  delete process.env.TOTALCLAW_E2E_LLM_URL;
  rmSync(TMP, { recursive: true, force: true });
});

const HAN_FIXED = (rows: unknown[][]) => containsHanText(`${rows[0]?.join('')}${rows[1]?.join('')}`);
const sheetRows = (path: string, i: number) => {
  const wb = XLSX.read(readFileSync(path), { type: 'buffer' });
  return { wb, rows: XLSX.utils.sheet_to_json<unknown[]>(wb.Sheets[wb.SheetNames[i]], { header: 1, defval: '' }) };
};

describe('财会审计批次 6：资金与金融风险', () => {
  it('公司与项目；E1–E7 在目录里全部可用；E 组阈值能在公司档案里覆盖', async () => {
    // 覆盖值取默认值，不影响后面各模块的金标准
    const c = await invoke('company.save', {
      company: {
        name: '测试集团', regions: ['CN'], region: 'CN', standard: 'CAS', currency: 'CNY', outputLocale: 'zh-CN', sodMode: 'block',
        signers: [{ ...signers.prep, levels: ['prepare'] }, { ...signers.rev, levels: ['review'] }, { ...signers.appr, levels: ['approve'] }],
        thresholds: { 'ifrs9.stage.dpdS2': 30, 'working-capital.abc.aShare': 0.8, 'cash.daily.minorDiffMax': 1000000, 'cash.nope': 1 },
      },
    });
    expect(c.thresholds).toEqual({ 'ifrs9.stage.dpdS2': 30, 'working-capital.abc.aShare': 0.8, 'cash.daily.minorDiffMax': 1000000 });
    const th = await invoke('thresholds.get', { modules: ['ifrs9', 'working-capital'] });
    expect(th.find((x: any) => x.key === 'ifrs9.stage.dpdS2')).toMatchObject({ override: 30, label: expect.any(String) });
    expect(th.every((x: any) => x.label)).toBe(true);
    await invoke('project.create', { type: 'month_close', period: F.PERIOD });
    const cat = await invoke('catalog.get');
    expect(cat.filter((m: any) => m.group === 'treasury').map((m: any) => `${m.code}:${m.status}`)).toEqual(['E1:ready', 'E2:ready', 'E3:ready', 'E4:ready', 'E5:ready', 'E6:ready', 'E7:ready']);
    const ins = await invoke('data.inspect', { path: files.balances, kind: 'bank_balance' });
    expect(ins.missing).toEqual([]);
    expect(ins.mapping.bankBalance).toBe('银行余额');
  });

  let forecastRunId = '';
  it('E1 13 周预测：三情景合计与手算一致，集中度升级进待办', async () => {
    const run = await runModule('cash', 'forecast', {
      balances: await imp('balances', 'bank_balance', 'cash'), plan: await imp('plan', 'cash_plan', 'cash'),
      ar: await imp('forecastAr', 'ar', 'cash'), ap: await imp('forecastAp', 'ap', 'cash'), facilities: await imp('facilities', 'credit_facility', 'cash'),
    });
    forecastRunId = run.id;
    const f = (run.result as FauCashResult).forecast!;
    expect(f.scenarios.map((s) => [s.id, s.totalIn, s.totalOut, s.endBalance, s.maxGap])).toEqual([
      ['optimistic', Y(1_680_000), Y(2_720_000), Y(990_000), 0], ['base', Y(1_400_000), Y(2_900_000), Y(530_000), 0], ['pessimistic', Y(1_120_000), Y(3_080_000), Y(70_000), Y(110_000)],
    ]);
    expect(run.requiredLevels).toEqual(['prepare', 'review', 'approve']);
    const todos = await invoke('todo.list');
    expect(todos.some((t: any) => t.kind === 'escalation' && t.moduleId === 'cash')).toBe(true);
    // Checks 页：逐周勾稽为 TRUE
    const { rows } = sheetRows(run.artifacts[0].path, 6);
    expect(rows.slice(2).map((r) => r[1])).toEqual([true, true, true]);
  });

  it('E1 付款计划：只出草稿，红线暂停核实', async () => {
    const run = await runModule('cash', 'payment', { balances: ds['cash:balances'], requests: await imp('requests', 'payment_request', 'cash') });
    const p = (run.result as FauCashResult).payments!;
    expect([p.scheduled, p.deferred, p.held]).toEqual([Y(1_300_000), Y(1_400_000), Y(350_000)]);
    expect(run.reminders.filter((r) => r.id.startsWith('hold:'))).toHaveLength(2);
  });

  it('E2 授权复核只给建议；现金池说明里写错的数字标未核实', async () => {
    const auth = await runModule('treasury', 'authorization', { requests: await imp('authRequests', 'payment_request', 'treasury'), balances: ds['cash:balances'] });
    const advice = (auth.result as FauTreasuryResult).authorizations!.map((a) => a.advice);
    expect(advice).toEqual(['proceed', 'request_docs', 'reject_recommend', 'hold', 'hold', 'hold']);
    expect(auth.artifacts.map((a) => a.kind)).toEqual(['xlsx', 'docx']);
    const pool = await runModule('treasury', 'cash_pool', { balances: ds['cash:balances'] });
    const res = pool.result as FauTreasuryResult;
    expect(res.pool!.interestGain).toBe(Y(7_975));
    expect(res.narrative.map((n) => [n.id, n.status])).toEqual([['pool_structure', 'verified'], ['pool_benefit', 'unverified']]);
    expect(pool.reminders.some((r) => r.source === 'verify')).toBe(true);
    expect(llmCalls).toContain('fa-cash-pool-configuration');
    const lcr = await runModule('treasury', 'liquidity', { liquidityItems: await imp('liquidityItems', 'liquidity_items', 'treasury') });
    expect((lcr.result as FauTreasuryResult).liquidity!.lcr).toBeCloseTo(2.425, 9);
  });

  it('E3 外汇：询价单草稿与手算一致，只询价不下单', async () => {
    const run = await runModule('fx', 'hedge', { fxExposure: await imp('fxExposure', 'fx_exposure', 'fx'), fxRates: await imp('fxRates', 'fx_rates', 'fx') });
    const r = run.result as FauFxResult;
    expect(r.rfq.map((q) => [q.id, q.side, q.notional])).toEqual([['EUR-firm', 'buy', Y(225_000)], ['EUR-highly_probable', 'buy', Y(50_000)], ['USD-firm', 'sell', 31_764_706], ['USD-highly_probable', 'sell', 28_235_294]]);
    expect(run.artifacts.map((a) => a.title.key)).toEqual(['外汇敞口表', '询价单草稿', '外汇对冲方案']);
    const actions = Object.keys(await import('./treasury.actions').then((m) => m.treasuryActions({} as any)));
    expect(actions.some((a) => a.startsWith('fx.'))).toBe(false);
  });

  it('E4 契约：越线进待办；改 WACC 假设后重算', async () => {
    const metrics = await imp('metrics', 'fin_metrics', 'financing');
    const cov = await runModule('financing', 'covenant', { metrics, covenants: await imp('covenants', 'covenant', 'financing') });
    const cs = (cov.result as FauFinancingResult).covenants!;
    expect(cs.map((c) => [c.current, c.firstBreach])).toEqual([['ok', '2027-03'], ['ok', '2027-03'], ['breach', '2026-09'], ['ok', '2027-03']]);
    const todos = await invoke('todo.list');
    const t = todos.find((x: any) => x.kind === 'escalation' && x.moduleId === 'financing');
    expect(t).toBeTruthy();
    expect(t.message.params.n).toBe(4);
    const cost = await runModule('financing', 'cost', { loans: await imp('loans', 'loan', 'financing'), metrics });
    expect((cost.result as FauFinancingResult).cost!.wacc).toBeCloseTo(0.063575, 12);
    await invoke('financing.params.update', { runId: cost.id, beta: 1.2, rf: 3 });
    const again = await waitRun(cost.id);
    const c = (again.result as FauFinancingResult).cost!;
    expect([c.rf, c.beta]).toEqual([0.03, 1.2]);
    expect(c.ke).toBeCloseTo(0.03 + 1.2 * 0.06, 12);
  });

  it('E5 一般法与手算一致；简化法直接读应收与账龄模块导入的 ar 数据集', async () => {
    const gen = await runModule('ifrs9', 'general', { exposures: await imp('exposures', 'credit_exposure', 'ifrs9') });
    const g = gen.result as FauEclResult;
    expect([g.totalEad, g.totalEcl]).toEqual([Y(71_500_000), 453_597_299]);
    expect(g.migration!.map((m) => `${m.from}>${m.to}:${m.count}`)).toEqual(['0>2:1', '1>1:2', '1>2:1', '2>2:1', '2>3:1']);
    // 当成 A3 应收与账龄模块导入的账龄表（同项目数据集可直接引用）
    const arId = await imp('agingAr', 'ar', 'ar');
    const simp = await runModule('ifrs9', 'simplified', { ar: arId });
    expect((simp.result as FauEclResult).totalEcl).toBe(Y(96_218.75));
  });

  it('E6 营运资本跑通并签核归档（编制 → 复核）', async () => {
    const run = await runModule('working-capital', 'ccc', {
      ar: ds['ar:agingAr'], ap: await imp('wcAp', 'ap', 'working-capital'), inventory: await imp('inventory', 'inventory', 'working-capital'), metrics: ds['financing:metrics'],
    });
    const w = run.result as FauWcResult;
    expect(w.ccc!.ccc).toBeCloseTo(11.5 + 2_000_000 / 2_100_000 * 30 - 20, 9);
    expect(w.inventory!.release).toBe(Y(450_000));
    const acks = run.reminders.map((r) => r.id);
    await invoke('signoff.submit', { runId: run.id, signer: signers.prep, acknowledged: acks, comment: '已核对' });
    const out = await invoke('signoff.decide', { runId: run.id, level: 'review', decision: 'approve', signer: signers.rev, acknowledged: acks, comment: '复核通过' });
    expect(out.archived).toBe(true);
    expect((await invoke('signoff.verify', { runId: run.id })).ok).toBe(true);
  });

  it('E7 投资盘点与流动性评估', async () => {
    const p = await runModule('investments', 'portfolio', { investments: await imp('investments', 'investment', 'investments') });
    expect((p.result as FauInvestResult).portfolio!.totals.pnl).toBe(Y(-339_000));
    expect(p.requiredLevels).toContain('approve');
    const l = await runModule('investments', 'liquidity', { balances: ds['cash:balances'], investments: ds['investments:investments'], loans: ds['financing:loans'], facilities: ds['cash:facilities'], metrics: ds['financing:metrics'] });
    expect((l.result as FauInvestResult).liquidity!.statuses.coverage).toBe('watch');
  });

  it.each(['zh-CN', 'en-US', 'ar'] as FauLocale[])('三语产出（%s）：表头语言、无汉字、RTL / bidi', async (locale) => {
    const run = await runModule('ifrs9', 'general', { exposures: ds['ifrs9:exposures'] }, locale);
    const [xlsx, docx] = run.artifacts;
    const { wb, rows } = sheetRows(xlsx.path, 2);
    expect(rows[0][0]).toBe(tIn(locale, '草稿—待签核'));
    expect(rows[1][0]).toBe(tIn(locale, '敞口编号'));
    expect(!!(wb.Workbook?.Views?.[0] as { RTL?: boolean } | undefined)?.RTL).toBe(locale === 'ar');
    if (locale !== 'zh-CN') {
      for (const n of wb.SheetNames) expect(containsHanText(n), n).toBe(false);
      for (let i = 1; i < wb.SheetNames.length; i += 1) expect(HAN_FIXED(sheetRows(xlsx.path, i).rows), wb.SheetNames[i]).toBe(false);
    }
    const doc = new AdmZip(docx.path).readAsText('word/document.xml');
    expect(doc.includes('<w:bidi/>')).toBe(locale === 'ar');
    // 现金预测（另一类产出）也按输出语言
    const fc = await runModule('cash', 'forecast', { balances: ds['cash:balances'], plan: ds['cash:plan'] }, locale);
    const s = sheetRows(fc.artifacts[0].path, 1);
    expect(s.rows[1][0]).toBe(tIn(locale, '情景'));
    if (locale !== 'zh-CN') expect(HAN_FIXED(s.rows)).toBe(false);
    void forecastRunId;
  });

  // 每个（语言 × 模块 / 模式）单独一条：一条只跑一次七步流程，不再把 13 次完整运行塞进同一条的超时里
  const OUTPUT_CASES: Array<[string, string, Record<string, string>]> = [
    ['cash', 'daily', { balances: 'cash:balances' }], ['cash', 'payment', { balances: 'cash:balances', requests: 'cash:requests' }],
    ['treasury', 'position', { balances: 'cash:balances', plan: 'cash:plan' }], ['treasury', 'authorization', { requests: 'treasury:authRequests', balances: 'cash:balances' }],
    ['treasury', 'cash_pool', { balances: 'cash:balances' }], ['treasury', 'bank_relationship', { facilities: 'cash:facilities', balances: 'cash:balances' }],
    ['treasury', 'liquidity', { liquidityItems: 'treasury:liquidityItems' }], ['fx', 'hedge', { fxExposure: 'fx:fxExposure', fxRates: 'fx:fxRates' }],
    ['financing', 'restructure', { loans: 'financing:loans', metrics: 'financing:metrics', covenants: 'financing:covenants' }],
    ['ifrs9', 'simplified', { ar: 'ar:agingAr' }], ['working-capital', 'payables', { ap: 'working-capital:wcAp', metrics: 'financing:metrics' }],
    ['working-capital', 'inventory', { inventory: 'working-capital:inventory' }],
    ['investments', 'portfolio', { investments: 'investments:investments' }],
  ];
  it.each((['zh-CN', 'en-US', 'ar'] as FauLocale[]).flatMap((locale) => OUTPUT_CASES.map(([m, mode, keys]) => [locale, m, mode, keys] as const)))('本批每类产出（%s）%s/%s：草稿警示、固定文案语言、xlsx RTL / docx bidi', async (locale, moduleId, modeId, keys) => {
    const inputs = Object.fromEntries(Object.entries(keys).map(([slot, key]) => [slot, ds[key]]));
    const run = await runModule(moduleId, modeId, inputs, locale);
    for (const a of run.artifacts) {
      const where = `${moduleId}/${modeId} ${a.title.key}`;
      if (a.kind === 'docx') {
        const zip = new AdmZip(a.path);
        expect(zip.readAsText('word/document.xml').includes('<w:bidi/>'), where).toBe(locale === 'ar');
        if (locale !== 'zh-CN') expect(containsHanText(zip.readAsText('word/header1.xml')), where).toBe(false);
        continue;
      }
      const { wb } = sheetRows(a.path, 0);
      expect(!!(wb.Workbook?.Views?.[0] as { RTL?: boolean } | undefined)?.RTL, where).toBe(locale === 'ar');
      for (let i = 1; i < wb.SheetNames.length; i += 1) {
        const rows = sheetRows(a.path, i).rows;
        expect(rows[0][0], where).toBe(tIn(locale, '草稿—待签核'));
        if (locale !== 'zh-CN') {
          expect(containsHanText(wb.SheetNames[i]), `${where} ${wb.SheetNames[i]}`).toBe(false);
          expect(HAN_FIXED(rows), `${where} ${wb.SheetNames[i]}`).toBe(false);
        }
      }
    }
  });
});
