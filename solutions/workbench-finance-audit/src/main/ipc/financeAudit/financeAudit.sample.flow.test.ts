/**
 * 财会审计 · 示例项目（一键体验）与首次配置减负的主进程侧：
 *   sample.open 建示例公司 + 示例项目 → 每个已可用业务模块都有一次草稿运行，第 ② 步数据齐 →
 *   每个模块开跑都能过第 ③ 步校验；不用模型的模块和 A1 / D1 / B5 一路走到底稿 →
 *   再开一次不重复建 → 阈值不带上游路径、金额 / 比例标记正确 → sample.remove 删干净并切回自己的公司。
 * 模型走本地假端点（TOTALCLAW_E2E_LLM_URL），不碰任何真实模型与账号。
 */
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { existsSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { createServer, type Server } from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const TMP = mkdtempSync(join(tmpdir(), 'fau-sample-'));
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

import { IPC_CHANNELS, type FauCatalogItem, type FauHome, type FauRun, type FauRunSummary } from '@totalclaw/ipc-contracts';
import { registerFinanceAuditHandlers } from '../financeAudit.ipc';
import { SAMPLE_RUNS } from '../../services/financeAudit/sampleData';

/** 假模型：A1 波动说明、D1 管理报告、B5 调查计划（E2E 用同一套写法）、资金组说明段、投融资叙述；其它技能返回空对象 */
function fakeLlm(prompt: string): unknown {
  const skill = prompt.match(/<skill name="([^"]+)">/)?.[1];
  const data = JSON.parse(prompt.match(/<data>\n([\s\S]*?)\n<\/data>/)?.[1] || '{}');
  if (skill === 'fa-variance-commentary') return { lines: data.lines.map((l: any) => ({ accountCode: l.accountCode, commentary: `主要由「${l.drivers[0]?.label || l.accountName}」驱动。`, unknown: false })) };
  if (skill === 'fa-management-report-master') {
    const rev = data.metrics.find((m: any) => m.key === 'revenue');
    return { sections: ['overview', 'profitability', 'position', 'alerts', 'outlook'].map((id) => ({ id, text: `营业收入 ${Number(rev.current).toFixed(2)} 元。` })) };
  }
  if (skill === 'fa-fraud-investigation') return { plan: [{ id: 'S-01', objective: '核实异常', procedure: '调取原始单据核对', evidence: '付款单', owner: '内审', refs: data.hits[0].refs.slice(0, 1) }], summary: '数据分析发现的异常需逐条核实，不代表已确认舞弊。' };
  // 资金组说明段（按主题各写一句）与投融资组叙述（章节 + 事实）的通用写法
  if (Array.isArray(data.topics)) return { paragraphs: data.topics.map((t: { id: string }) => ({ id: t.id, text: '需要人工复核。' })) };
  if (data.results || data.inputs || data.upstream) return { sections: [{ heading: '说明', paragraphs: ['草稿说明，待人工复核。'] }], facts: [] };
  return {};
}

let server: Server;
async function invoke<T = any>(action: string, payload: unknown = {}): Promise<T> {
  return handlers.get(IPC_CHANNELS.WORKBENCH_FINAUDIT_INVOKE)!(null, { action, payload });
}
async function waitRun(runId: string, ms = 30_000): Promise<FauRun> {
  const t0 = Date.now();
  for (;;) {
    const r = await invoke<{ run: FauRun; running: boolean }>('run.get', { runId });
    if (!r.running && r.run.status !== 'running') return r.run;
    if (Date.now() - t0 > ms) throw new Error(`run ${runId} did not finish`);
    await new Promise((res) => setTimeout(res, 30));
  }
}

beforeAll(async () => {
  server = createServer((req, res) => {
    let raw = '';
    req.on('data', (c) => { raw += c; });
    req.on('end', () => { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify({ text: JSON.stringify(fakeLlm(JSON.parse(raw).prompt)), model: 'fake-llm' })); });
  });
  await new Promise<void>((r) => server.listen(0, '127.0.0.1', () => r()));
  process.env.TOTALCLAW_E2E = '1';
  process.env.TOTALCLAW_E2E_LLM_URL = `http://127.0.0.1:${(server.address() as { port: number }).port}/llm`;
  registerFinanceAuditHandlers({ logger: { info: () => undefined, warn: () => undefined }, getMainWindow: () => null, appConfig: {} } as any);
});

afterAll(() => {
  server?.close();
  delete process.env.TOTALCLAW_E2E;
  delete process.env.TOTALCLAW_E2E_LLM_URL;
  rmSync(TMP, { recursive: true, force: true });
});

/** 不调模型的模块（规则型）+ 假端点覆盖到的 A1 / D1 / B5：都要走到第 ⑤ 步 */
const TO_DRAFT = [
  'close', 'recon', 'ar', 'ap', 'expense', 'fixed-assets', 'payroll', 'intercompany', 'icfr', 'ext-audit', 'review', 'fraud', 'tax', 'mgmt-report', 'budget', 'cost',
  'cash', 'treasury', 'fx', 'financing', 'ifrs9', 'working-capital', 'investments',
  'valuation', 'capex', 'ma', 'ib', 'pe', 'research', 'markets', 'wealth',
];

describe('财会审计 · 示例项目与首次配置', () => {
  let own = '';
  it('先有一家自己的公司（「用默认配置开始」带 quickStart 标记，完整向导保存后清掉）', async () => {
    const c = await invoke('company.save', { company: { name: '我的公司', regions: ['CN'], quickStart: true, sample: true } });
    expect(c.quickStart).toBe(true);
    expect(c.sample).toBeUndefined(); // 示例标记渲染层打不上
    own = c.id;
    const again = await invoke('company.save', { company: { ...c, quickStart: undefined } });
    expect(again.quickStart).toBeUndefined();
  });

  it('打开示例项目：示例公司 + 示例项目，每个已可用业务模块都有一次挂好数据的草稿运行', async () => {
    const r = await invoke<{ company: { id: string; sample: boolean; name: string }; project: { id: string; name: string } }>('sample.open');
    expect(r.company.sample).toBe(true);
    expect(r.company.name).toContain('示例数据');
    const home = await invoke<FauHome>('home.get');
    expect(home.company?.id).toBe(r.company.id);
    expect(home.project?.id).toBe(r.project.id);
    const cat = await invoke<FauCatalogItem[]>('catalog.get');
    // 全部七组：可用的业务模块（平台组 P1–P6 不走七步）都要有示例数据
    const ready = cat.filter((m) => m.status === 'ready' && m.group !== 'platform').map((m) => m.id).sort();
    expect(ready.length).toBeGreaterThanOrEqual(42);
    expect(SAMPLE_RUNS.map((s) => s.moduleId).sort()).toEqual(ready);
    const groups = [...new Set(cat.map((m) => m.group))].sort();
    expect(groups).toEqual(['accounting', 'audit', 'capital', 'fpa', 'platform', 'tax', 'treasury']);
    expect([...new Set(SAMPLE_RUNS.map((s) => cat.find((m) => m.id === s.moduleId)!.group))].sort()).toEqual(groups.filter((g) => g !== 'platform'));
    const runs = await invoke<FauRunSummary[]>('run.list');
    expect(runs.map((x) => x.moduleId).sort()).toEqual(ready);
    for (const s of runs) {
      const g = await invoke<{ run: FauRun; missing: string[] }>('run.get', { runId: s.id });
      expect(g.missing, s.moduleId).toEqual([]);
      expect(g.run.steps.upload.status, s.moduleId).toBe('done');
    }
  });

  it('每个模块都能过第 ③ 步校验；规则型、A1 / D1 / B5 与资金、投融资两组走到底稿', async () => {
    const runs = await invoke<FauRunSummary[]>('run.list');
    await Promise.all(runs.map((s) => invoke('run.start', { runId: s.id })));
    for (const s of runs) {
      const run = await waitRun(s.id);
      expect(run.steps.validate.status, `${s.moduleId} ${JSON.stringify(run.validation?.blockers)}`).toBe('done');
      if (TO_DRAFT.includes(s.moduleId)) {
        expect(run.steps.draft.status, `${s.moduleId} ${JSON.stringify(run.steps.analyze.error || run.steps.draft.error)}`).toBe('done');
        expect(run.artifacts.length, s.moduleId).toBeGreaterThan(0);
      }
    }
  }, 120_000);

  it('再点一次「打开示例项目」不重复建', async () => {
    await invoke('sample.open');
    expect((await invoke<Array<{ id: string }>>('company.list')).length).toBe(2);
  });

  it('阈值：出处只给可读的依据名，不带上游路径；金额 / 比例标记', async () => {
    const all = await invoke<Array<{ key: string; basis: string; section: string; original: string; amount: boolean; percent: boolean }>>('thresholds.get', { modules: (await invoke<FauCatalogItem[]>('catalog.get')).map((m) => m.id) });
    expect(all.length).toBeGreaterThan(200);
    const text = JSON.stringify(all);
    for (const bad of ['finance-skills', 'financial-services', 'skills/', '.md', 'apps/', '.ts', 'scripts/', 'selfbuilt', '（分）', '（最小货币单位）']) expect(text, bad).not.toContain(bad);
    expect(all.filter((x) => !x.basis).map((x) => x.key)).toEqual([]);
    const by = (k: string) => all.find((x) => x.key === k)!;
    expect(by('close.trial.locateMax')).toMatchObject({ amount: true, percent: false, basis: '月结关账判断框架' });
    expect(by('close.flux.pct')).toMatchObject({ amount: false, percent: true });
    expect(by('payroll.cn.unemployment').percent).toBe(true);
    expect(by('kpi.level.greenMinRatio').percent).toBe(true);
    // 资金组：LCR 100% 存 1.0、损失率 100% 存 1.0 也是百分比；情景系数、PD 调整系数、速动比率不是
    for (const k of ['treasury.lcr.min', 'treasury.lcr.target', 'ifrs9.matrix.d365plus', 'fx.hedge.firmRatio', 'valuation.dcf.terminalShareHigh', 'ar.provision.over365']) expect(by(k).percent, k).toBe(true);
    expect(by('cash.daily.minorDiffMax')).toMatchObject({ amount: true, basis: '资金头寸监控规范' });
    for (const k of [
      'close.checklist.maxFail', 'close.cross.dayTier1', 'fraud.benford.madClose', 'kyc.name.strong', 'payroll.sa.eosbFirstRate', 'fin-analysis.alert.currentRatioRedRatio',
      'cash.forecast.optOutFactor', 'ifrs9.scenario.optMult', 'investments.liq.quickBreach', 'financing.wacc.beta', 'ifrs9.ecl.termDefault',
    ]) expect(by(k).percent, k).toBe(false);
  });

  it('删除示例项目：示例公司与产出目录都删掉，切回自己的公司', async () => {
    const sample = (await invoke<Array<{ id: string }>>('company.list')).find((c) => c.id !== own)!;
    const outRoot = join(TMP, 'documents', 'TotalClaw');
    expect(existsSync(outRoot)).toBe(true);
    expect(await invoke('sample.remove')).toBe(true);
    expect((await invoke<Array<{ id: string }>>('company.list')).map((c) => c.id)).toEqual([own]);
    expect((await invoke<FauHome>('home.get')).company?.id).toBe(own);
    expect(await invoke('company.get', { id: sample.id })).toBeNull();
    const left = readdirSync(join(outRoot, readdirSync(outRoot)[0]));
    expect(left.some((n) => n.includes('示例'))).toBe(false);
    expect(await invoke('sample.remove')).toBe(false);
  });
});
