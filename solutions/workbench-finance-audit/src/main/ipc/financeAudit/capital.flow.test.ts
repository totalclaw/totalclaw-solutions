/**
 * 财会审计批次 7 主流程（经真实 IPC 处理函数走一遍，模型走本地假端点 TOTALCLAW_E2E_LLM_URL）：
 *   连接器未授权（需授权、默认关闭）→ F1 DCF：手工录入 + 从 CSV 导入预测表（来源 = 文件 + 行号）→ 校验（默认值进提醒、
 *   永续增长率 ≥ WACC 阻断）→ 计算（企业价值与手算一致、终值占比 > 75% 黄旗）→ 阿语叙述回核 → 两级签核归档 →
 *   转交 F4 提案（上游估值引用、事实回原文定位、定位不到的丢弃）→ F6 财报点评（买入评级措辞与编造的数字标未核实、
 *   「非投资建议」声明）→ F7 债券组合（不调模型、市场声明）。
 * 不碰任何真实模型、浏览器、邮箱或账号。
 */
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { createServer, type Server } from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const TMP = mkdtempSync(join(tmpdir(), 'fau-cap-flow-'));
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

import { IPC_CHANNELS, type FauCapResult, type FauRun } from '@totalclaw/ipc-contracts';
import { registerFinanceAuditHandlers } from '../financeAudit.ipc';
import { DCF_FX } from '../../services/financeAudit/__fixtures__/capital/valuation';

const llmCalls: Array<{ skill: string; locale: string }> = [];
function fakeLlm(body: { prompt: string; responseLocale: string }): string {
  const data = JSON.parse(body.prompt.match(/<data>\n([\s\S]*?)\n<\/data>/)![1]);
  const skill = body.prompt.match(/<skill name="([^"]+)">/)![1];
  llmCalls.push({ skill, locale: body.responseLocale });
  if (skill === 'fa-dcf-model') {
    const ev = data.results.metrics.find((m: { unit: string; value: number }) => m.unit === 'money' && Math.abs(m.value - 1431.8182) < 0.01).value;
    return JSON.stringify({ sections: [{ heading: 'التقييم', paragraphs: [`تبلغ قيمة المنشأة ${ev.toFixed(1)} وفق التدفقات النقدية المخصومة.`] }], facts: [] });
  }
  if (skill === 'fa-pitch-deck') {
    const ev = data.upstream[0].metrics.find((m: { unit: string; value: number }) => m.unit === 'money' && Math.abs(m.value - 1431.8182) < 0.01).value;
    return JSON.stringify({
      sections: [{ heading: '概况', paragraphs: [`公司 2025 年收入 2,500 million，DCF 企业价值 ${ev.toFixed(1)}。`] }],
      facts: [
        { label: '2025 年收入', value: '2,500', doc: 'company-overview.txt', quote: 'reported revenue of 2,500 million' },
        { label: 'EBITDA', value: '600', doc: 'company-overview.txt', quote: 'EBITDA of 600 million' },
      ],
    });
  }
  if (skill === 'fa-earnings-analysis') {
    return JSON.stringify({ sections: [{ heading: '业绩', paragraphs: ['收入 103.0，高于一致预期 100.0。', '我们给予买入评级，毛利率 47.3%。'] }], facts: [] });
  }
  return JSON.stringify({ sections: [{ heading: '说明', paragraphs: ['草稿说明。'] }], facts: [] });
}

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
const M = (v: number | string) => ({ v, src: { kind: 'manual' } });
const signers = { prep: { name: '张分析师', title: '估值分析师' }, rev: { name: '李总监', title: '投资总监' } };
async function signAll(runId: string): Promise<FauRun> {
  const { run } = await invoke<{ run: FauRun }>('run.get', { runId });
  const acks = run.reminders.map((r) => r.id);
  await invoke('signoff.submit', { runId, signer: signers.prep, acknowledged: acks, comment: '已核对' });
  const out = await invoke('signoff.decide', { runId, level: 'review', decision: 'approve', signer: signers.rev, acknowledged: acks, comment: '复核通过' });
  return out.run;
}

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
  mkdirSync(FX, { recursive: true });
  // 三语模板表头（导回来按列名认列）：年度 / Year / السنة …
  const head = ['年度 / Year', '收入 / Revenue', 'EBIT', '折旧摊销 / D&A', '资本开支 / Capex', '营运资本增加 / Increase in working capital'];
  writeFileSync(join(FX, 'forecast.csv'), [head.join(','), ...DCF_FX.forecast.map((y) => [y.year, y.revenue, y.ebit, y.da, y.capex, y.nwcChange].join(','))].join('\n'));
  writeFileSync(join(FX, 'company-overview.txt'), 'Acme Ltd reported revenue of 2,500 million in 2025. Management expects continued growth.');
});

afterAll(() => {
  server?.close();
  delete process.env.TOTALCLAW_E2E;
  delete process.env.TOTALCLAW_E2E_LLM_URL;
  rmSync(TMP, { recursive: true, force: true });
});

describe('财会审计批次 7：投融资与估值', () => {
  let dcfRunId = '';

  it('公司与项目；投融资 8 个模块可用；付费连接器默认「需授权」', async () => {
    await invoke('company.save', { company: { name: 'Acme 集团', regions: ['CN'], region: 'CN', standard: 'CAS', currency: 'CNY', outputLocale: 'zh-CN', sodMode: 'block', signers: [{ ...signers.prep, levels: ['prepare'] }, { ...signers.rev, levels: ['review'] }] } });
    await invoke('project.create', { type: 'ma', period: '2026', name: '2026 估值' });
    const cat = await invoke('catalog.get');
    expect(cat.filter((m: { group: string; status: string }) => m.group === 'capital' && m.status === 'ready')).toHaveLength(8);
    const conns = await invoke<Array<{ id: string; status: string }>>('capital.connectors', { moduleId: 'valuation' });
    expect(conns.map((c) => c.id)).toEqual(['sp-global', 'daloopa', 'factset', 'morningstar']);
    expect(conns.every((c) => c.status === 'needs_auth')).toBe(true);
    // 判断依据抽屉：F1 的终值占比两条线已登记（带界面标签与出处）
    const th = await invoke<Array<{ key: string; label: string; value: number }>>('thresholds.get', { modules: ['valuation'] });
    expect(th.map((x) => [x.key, x.value])).toEqual([['valuation.dcf.terminalShareHigh', 0.75], ['valuation.dcf.terminalShareLow', 0.4]]);
    expect(th.every((x) => x.label)).toBe(true);
  });

  it('F1 DCF：手工录入 + CSV 导入预测表，来源记文件与行号；永续增长率 ≥ WACC 阻断', async () => {
    let run: FauRun = await invoke('run.create', { moduleId: 'valuation', modeId: 'dcf', outputLocale: 'ar' });
    dcfRunId = run.id;
    const ins = await invoke('capital.inspectTable', { runId: run.id, path: join(FX, 'forecast.csv'), tableId: 'forecast' });
    expect(ins.missing).toEqual([]);
    run = await invoke('capital.importTable', { runId: run.id, path: join(FX, 'forecast.csv'), tableId: 'forecast', mapping: ins.mapping });
    const rows = (run.params.cap as any).tables.forecast;
    expect(rows).toHaveLength(3);
    expect(rows[0].src).toMatchObject({ kind: 'upload', file: 'forecast.csv', row: 2 });
    expect(rows[2].cells.ebit).toBe(151.25);
    expect(run.inputs.dataFiles).toHaveLength(1);
    const fields = {
      riskFree: M(0.04), beta: M(1.6), erp: M(0.05), sizePremium: M(0), costDebt: M(0.05), debtWeight: M(0.25), terminalMethod: M('gordon'),
      terminalGrowth: M(0.1), midYear: M('no'), netDebt: M(200), shares: M(100), taxRate: { v: 0.2, src: { kind: 'default' } },
    };
    run = await invoke('capital.save', { runId: run.id, cap: { fields, tables: (run.params.cap as any).tables } });
    await invoke('run.start', { runId: run.id });
    run = await waitRun(run.id);
    expect(run.steps.validate.status).toBe('blocked');
    expect(run.validation!.blockers.map((b) => b.code)).toContain('engine_check');
    run = await invoke('capital.save', { runId: run.id, cap: { fields: { ...fields, terminalGrowth: M(0.02) }, tables: (run.params.cap as any).tables } });
    await invoke('run.start', { runId: run.id });
    run = await waitRun(run.id);
    expect(run.steps.draft.status).toBe('done');
    const res = run.result as FauCapResult;
    expect(res.metrics.find((m) => m.id === 'ev')!.value).toBeCloseTo(1431.8182, 3);
    expect(res.flags.map((f) => f.id)).toContain('tv_high');
    expect(res.degraded).toMatchObject({ authorized: false, completeness: run.confidence!.data }); // 与第 ④ 步徽标同一口径
    expect(res.inputs.fields.find((f) => f.key === 'taxRate')!.src.kind).toBe('default');
    expect(res.sections![0].paragraphs[0].status).toBe('verified');
    expect(llmCalls.find((c) => c.skill === 'fa-dcf-model')?.locale).toBe('ar');
    expect(run.reminders.map((r) => r.id)).toEqual(expect.arrayContaining(['v:cap_defaults', 'v:cap_degraded', 'cap:tv_high']));
    expect(run.artifacts.map((a) => a.kind)).toEqual(['xlsx', 'docx']);
    for (const a of run.artifacts) expect(existsSync(a.path)).toBe(true);
    const signed = await signAll(run.id);
    expect(signed.status).toBe('archived');
  });

  it('F1 → F4 提案：上游估值引用进叙述；事实回原文定位，定位不到的丢弃', async () => {
    await invoke('handoff.send', { fromRunId: dcfRunId, toModuleId: 'ib' });
    const doc = await invoke('data.import', { path: join(FX, 'company-overview.txt'), kind: 'evidence', slot: 'docs', moduleId: 'ib' });
    let run: FauRun = await invoke('run.create', { moduleId: 'ib', modeId: 'pitch' });
    run = await invoke('run.setInputs', { runId: run.id, inputs: { docs: [doc.id] } });
    await invoke('run.start', { runId: run.id });
    run = await waitRun(run.id);
    expect(run.steps.draft.status).toBe('done');
    const res = run.result as FauCapResult;
    expect(res.upstream).toHaveLength(1);
    expect(res.upstream[0].moduleId).toBe('valuation');
    expect(res.facts!.map((f) => f.label)).toEqual(['2025 年收入']);
    expect(res.droppedFacts).toBe(1);
    expect(res.sections![0].paragraphs[0].status).toBe('verified');
    expect(run.reminders.map((r) => r.id)).toContain('cap:facts_dropped');
  });

  it('F6 财报点评：买入评级措辞与编造的数字标未核实；带「非投资建议」声明', async () => {
    let run: FauRun = await invoke('run.create', { moduleId: 'research', modeId: 'earnings' });
    run = await invoke('capital.save', { runId: run.id, cap: { fields: { beatPct: M(0.02) }, tables: { actuals: [{ cells: { metric: 'Revenue', actual: 103, consensus: 100 }, src: { kind: 'public', url: 'https://example.com/results' } }] } } });
    await invoke('run.start', { runId: run.id });
    run = await waitRun(run.id);
    const res = run.result as FauCapResult;
    expect(res.disclaimer).toBe('research');
    const [ok, bad] = res.sections![0].paragraphs;
    expect(ok.status).toBe('verified');
    expect(bad.status).toBe('unverified');
    expect(bad.advice).toBe(true);
    expect(bad.missing).toEqual(expect.arrayContaining(['47.3%']));
    expect(run.verification.filter((v) => v.status === 'unverified')).toHaveLength(1);
  });

  it('F7 债券组合：不调模型，带市场分析声明，靠手工录入跑通', async () => {
    const before = llmCalls.length;
    let run: FauRun = await invoke('run.create', { moduleId: 'markets', modeId: 'fi_portfolio' });
    run = await invoke('capital.save', { runId: run.id, cap: { fields: { shockBp: M(100) }, tables: { holdings: [{ cells: { bond: 'CGB 5Y', face: 1000, coupon: 0.05, yield: 0.05, maturity: 5, freq: 1 }, src: { kind: 'manual' } }] } } });
    await invoke('run.start', { runId: run.id });
    run = await waitRun(run.id);
    expect(run.steps.draft.status).toBe('done');
    const res = run.result as FauCapResult;
    expect(res.disclaimer).toBe('markets');
    expect(res.metrics.find((m) => m.id === 'mv')!.value).toBeCloseTo(1000, 6);
    expect(llmCalls.length).toBe(before);
    expect(run.artifacts.map((a) => a.kind)).toEqual(['xlsx']);
  });
});
