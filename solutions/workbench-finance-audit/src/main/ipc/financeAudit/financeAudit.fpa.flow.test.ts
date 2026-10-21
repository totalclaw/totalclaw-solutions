/**
 * 财会审计批次 5（财务分析与管理报告 D1–D10）主流程：经真实 IPC 处理函数走一遍，模型走本地假端点（TOTALCLAW_E2E_LLM_URL）。
 *   D2 KPI（连续 3 期未达标升级）→ D3 财务分析（故意写错一个数字 → 未核实）→ 签核归档 → 转交 D1；
 *   D1 管理报告：用的数据集都已被签核归档的运行引用，每个数字都回核通过，docx + pdf；签核归档 → 转交 D7；
 *   D7 董事会：取已签核的管理报告，三语各出一次 pptx（阿语模板 RTL），审计委员会关注事项引用定位不到的被丢弃；
 *   D4 预算（与财务智能体执行率一致、升级）、D5 成本（三种模式）、D6 洞察、D8 ESG、D9 战略、D10 投资者关系。
 * 不碰任何真实模型、浏览器、邮箱或账号。
 */
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { createServer, type Server } from 'node:http';
import { tmpdir } from 'node:os';
import { basename, join } from 'node:path';
import AdmZip from 'adm-zip';

const TMP = mkdtempSync(join(tmpdir(), 'fau-fpa-flow-'));
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
  writePdfFromHtml: async (p: string, html: string) => { writeFileSync(p, `%PDF-1.4 test\n${html.length}`); },
}));

import { IPC_CHANNELS, type FauFpaResult, type FauRun } from '@totalclaw/ipc-contracts';
import { registerFinanceAuditHandlers } from '../financeAudit.ipc';
import { readPptx } from '../../services/pptxEditor';
import * as F from '../../services/financeAudit/__fixtures__/fpa/fpa';
import { budgetXlsx, tbXlsx } from '../../services/financeAudit/__fixtures__/accounting/toXlsx';
import { deptJournalXlsx, kpiXlsx, pvXlsx } from '../../services/financeAudit/__fixtures__/fpa/toXlsx';

// ── 假模型端点：按钉住的第一个技能返回结构化 JSON；按 responseLocale 写对应语言 ──
const calls: Array<{ skill: string; locale: string }> = [];
const n2 = (v: number) => Number(v).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
function fake(body: { prompt: string; responseLocale: string }): unknown {
  const data = JSON.parse(body.prompt.match(/<data>\n([\s\S]*?)\n<\/data>/)![1]);
  const skill = body.prompt.match(/<skill name="([^"]+)">/)![1];
  const L = body.responseLocale;
  calls.push({ skill, locale: L });
  const say = (zh: string, en: string, ar: string) => (L === 'ar' ? ar : L === 'en-US' ? en : zh);
  const metric = (k: string) => (data.metrics || []).find((m: any) => m.key === k || m.label === k) || data.metrics?.[0];
  switch (skill) {
    case 'fa-management-report-master': {
      const rev = metric('revenue');
      const np = metric('netProfit');
      const text = say(`营业收入 ${n2(rev.current)} 元，净利润 ${n2(np.current)} 元。`, `Revenue was ${n2(rev.current)} and net profit was ${n2(np.current)}.`, `بلغت الإيرادات ${n2(rev.current)} وبلغ صافي الربح ${n2(np.current)}.`);
      return { sections: ['overview', 'profitability', 'position', 'alerts', 'outlook'].map((id) => ({ id, text })) };
    }
    case 'fa-financial-analysis-master': {
      const rev = metric('revenue');
      return {
        sections: [
          { id: 'revenue', text: say(`营业收入 ${n2(rev.current)} 元，环比增长 ${rev.diffPriorPct}%。`, `Revenue was ${n2(rev.current)}, up ${rev.diffPriorPct}%.`, `بلغت الإيرادات ${n2(rev.current)} بزيادة ${rev.diffPriorPct}%.`) },
          // 埋点：数据里没有 987,654.32 → 重写一次仍错 → 未核实
          { id: 'summary', text: say('建议压降费用 987,654.32 元。', 'Cut expenses by 987,654.32.', 'خفض المصروفات بمقدار 987,654.32.') },
        ],
      };
    }
    case 'fa-kpi-management-master':
      return {
        causes: data.kpis.map((k: any) => ({
          id: k.id, type: k.consecutiveMisses >= 3 ? 'systemic' : 'one_off',
          reason: say(`达成率 ${k.achievementPct}%，连续 ${k.consecutiveMisses} 期未达标。`, `Achievement is ${k.achievementPct}%.`, `نسبة الإنجاز ${k.achievementPct}%.`),
          action: say('由责任人制定改进计划。', 'The owner prepares an improvement plan.', 'يعد المسؤول خطة تحسين.'),
        })),
      };
    case 'fa-business-insight-master': {
      const s = data.series[0];
      return {
        insights: [
          { title: say('订单量快速上升', 'Orders rose sharply', 'ارتفعت الطلبات بشكل حاد'), finding: say(`最近一期 ${s.last}，环比 ${s.changePct}%。`, `Latest ${s.last}, up ${s.changePct}%.`, `آخر قيمة ${s.last} بزيادة ${s.changePct}%.`), seriesId: s.id, recommendation: say('核实产能。', 'Check capacity.', 'تحقق من الطاقة الإنتاجية.'), quote: '' },
          { title: say('交付周期偏长', 'Lead time is long', 'مدة التسليم طويلة'), finding: say('客户反映交付周期偏长。', 'Customers say lead time is long.', 'يشير العملاء إلى طول مدة التسليم.'), seriesId: '', recommendation: say('优化排产。', 'Improve scheduling.', 'تحسين الجدولة.'), quote: '交付周期偏长' },
          { title: say('价格敏感', 'Price sensitive', 'حساسية للسعر'), finding: say('客户对价格敏感。', 'Customers are price sensitive.', 'العملاء حساسون للسعر.'), seriesId: '', recommendation: say('观察。', 'Monitor.', 'مراقبة.'), quote: '这句话原文里没有' },
        ],
      };
    }
    case 'fa-board-reporting-master': {
      const rev = metric(data.metrics[0]?.label);
      return {
        agenda: [{ title: say('审议本季度管理报告', 'Review the quarterly management report', 'مراجعة التقرير الإداري الفصلي'), kind: 'resolution', presenter: 'CFO' }, { title: say('审计委员会工作汇报', 'Audit committee report', 'تقرير لجنة المراجعة'), kind: 'report', presenter: 'AC' }],
        highlights: [say(`营业收入 ${n2(rev.current)} 元。`, `Revenue was ${n2(rev.current)}.`, `بلغت الإيرادات ${n2(rev.current)}.`)],
        acMatters: [
          { matter: say('应收账款账龄需重点关注。', 'Receivables ageing needs attention.', 'أعمار الذمم المدينة تحتاج إلى متابعة.'), quote: '应收账款账龄超过180天' },
          { matter: say('存货跌价。', 'Inventory write-down.', 'انخفاض قيمة المخزون.'), quote: '原文里没有这一句' },
        ],
        resolutions: [{ title: say('审议管理报告', 'Management report', 'التقرير الإداري'), text: say('提请董事会审议。', 'Submitted to the board for consideration.', 'يُعرض على المجلس للنظر فيه.') }],
        nextSteps: [say('下次会议前完成整改跟踪。', 'Track remediation before the next meeting.', 'متابعة المعالجة قبل الاجتماع القادم.')],
      };
    }
    case 'fa-esg-reporting-master':
      return {
        topics: [
          { topic: say('气候变化', 'Climate change', 'تغير المناخ'), category: 'E', impact: 4, financial: 4, rationale: say('范围一排放 1,100。', 'Scope 1 emissions were 1,100.', 'بلغت انبعاثات النطاق الأول 1,100.') },
          { topic: say('员工安全', 'Worker safety', 'سلامة العاملين'), category: 'S', impact: 3, financial: 2, rationale: say('员工人数 500 人。', 'Headcount was 500.', 'بلغ عدد الموظفين 500.') },
        ],
        sections: [
          { id: 'environment', text: say('范围一排放 1,100 吨。', 'Scope 1 emissions were 1,100 tonnes.', 'بلغت انبعاثات النطاق الأول 1,100 طن.') },
          { id: 'gaps', text: say('缺少范围三排放数据。', 'Scope 3 data is missing.', 'بيانات النطاق الثالث غير متوفرة.') },
        ],
      };
    case 'fa-strategic-planning-master':
      return {
        decomposition: [{ objective: say('提升海外收入占比', 'Grow overseas revenue share', 'زيادة حصة الإيرادات الخارجية'), milestone: say('进入两个新市场', 'Enter two new markets', 'دخول سوقين جديدين'), owner: 'CFO' }],
        assumptions: [
          { assumption: say('汇率保持稳定', 'Exchange rates stay stable', 'استقرار أسعار الصرف'), indicator: 'USD/CNY', status: 'holding', quote: '假设人民币汇率保持基本稳定' },
          { assumption: say('需求翻倍', 'Demand doubles', 'تضاعف الطلب'), indicator: 'GDP', status: 'unknown', quote: '原文没有这句' },
        ],
        risks: [{ risk: say('海外拓展不及预期', 'Overseas expansion lags', 'تأخر التوسع الخارجي'), likelihood: 4, impact: 4, response: say('分阶段投入。', 'Invest in stages.', 'الاستثمار على مراحل.') }],
        sections: [{ id: 'deviation', text: say('海外收入占比偏差 -40%。', 'Overseas share deviates by -40%.', 'انحراف حصة الإيرادات الخارجية -40%.') }],
      };
    case 'fa-investor-relations-master': {
      const rev = metric('revenue');
      const np = metric('netProfit');
      return {
        script: [{ id: 'opening', text: say(`本季度营业收入 ${n2(rev.current)} 元。`, `Revenue was ${n2(rev.current)}.`, `بلغت الإيرادات ${n2(rev.current)}.`) }, { id: 'highlights', text: say(`净利润 ${n2(np.current)} 元。`, `Net profit was ${n2(np.current)}.`, `بلغ صافي الربح ${n2(np.current)}.`) }],
        qa: [
          { question: say('收入增长的原因？', 'Why did revenue grow?', 'لماذا نمت الإيرادات؟'), answer: say(`营业收入 ${n2(rev.current)} 元，增长 ${rev.diffPriorPct}%。`, `Revenue was ${n2(rev.current)}, up ${rev.diffPriorPct}%.`, `بلغت الإيرادات ${n2(rev.current)}.`) },
          // 埋点：未公开的数字 → 披露核对未核实
          { question: say('明年收入？', 'Next year revenue?', 'إيرادات العام القادم؟'), answer: say('预计 888,888.88 元。', 'About 888,888.88.', 'حوالي 888,888.88.') },
        ],
        keyMessages: [say(`净利润 ${n2(np.current)} 元。`, `Net profit ${n2(np.current)}.`, `صافي الربح ${n2(np.current)}.`)],
        feedback: [],
      };
    }
    default:
      return {};
  }
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
const S = { prep: { name: '张会计', title: '财务分析' }, rev: { name: '李主管', title: '财务主管' }, appr: { name: '王经理', title: '财务经理' } };
const ds: Record<string, string> = {};

async function runModule(moduleId: string, modeId: string, inputs: Record<string, string[]>, outputLocale = 'zh-CN'): Promise<FauRun> {
  const run: FauRun = await invoke('run.create', { moduleId, modeId, outputLocale });
  await invoke('run.setInputs', { runId: run.id, inputs });
  await invoke('run.start', { runId: run.id });
  return waitRun(run.id);
}

/** 按 requiredLevels 逐级签核（全部提醒项「已知悉」+ 理由），返回最后的运行 */
async function signAll(run: FauRun): Promise<FauRun> {
  const acks = run.reminders.map((r) => r.id);
  await invoke('signoff.submit', { runId: run.id, signer: S.prep, acknowledged: acks, comment: '已逐条核对' });
  let last: { run: FauRun; archived: boolean } = { run, archived: false };
  for (const level of run.requiredLevels.filter((l) => l !== 'prepare')) {
    last = await invoke('signoff.decide', { runId: run.id, level, decision: 'approve', signer: level === 'review' ? S.rev : S.appr, acknowledged: acks, comment: '同意' });
  }
  expect(last.archived).toBe(true);
  return last.run;
}

const res = (r: FauRun) => r.result as FauFpaResult;
const table = (r: FauRun, id: string) => res(r).tables.find((t) => t.id === id)!;

beforeAll(async () => {
  server = createServer((req, resp) => {
    let raw = '';
    req.on('data', (c) => { raw += c; });
    req.on('end', () => {
      const text = JSON.stringify(fake(JSON.parse(raw)));
      resp.setHeader('Content-Type', 'application/json');
      resp.end(JSON.stringify({ text, model: 'fake-llm' }));
    });
  });
  await new Promise<void>((r) => server.listen(0, '127.0.0.1', () => r()));
  process.env.TOTALCLAW_E2E = '1';
  process.env.TOTALCLAW_E2E_LLM_URL = `http://127.0.0.1:${(server.address() as { port: number }).port}/llm`;
  registerFinanceAuditHandlers({ logger: { info: () => undefined, warn: () => undefined }, getMainWindow: () => null, appConfig: {} } as any);

  mkdirSync(FX, { recursive: true });
  tbXlsx(join(FX, '科目余额表-2026-09.xlsx'), F.tb);
  tbXlsx(join(FX, '科目余额表-2026-08.xlsx'), F.tbPrior);
  budgetXlsx(join(FX, '预算-2026-09.xlsx'), F.budget);
  budgetXlsx(join(FX, '承诺额-2026-09.xlsx'), F.commitments);
  deptJournalXlsx(join(FX, '序时账-2026-09.xlsx'), F.journal);
  kpiXlsx(join(FX, 'KPI-2026-09.xlsx'), F.kpis);
  kpiXlsx(join(FX, '订单量.xlsx'), F.series);
  kpiXlsx(join(FX, 'ESG-2026.xlsx'), F.esg);
  kpiXlsx(join(FX, '战略目标-2026.xlsx'), F.objectives);
  pvXlsx(join(FX, '量价表-广告.xlsx'), F.pvBudget);
  pvXlsx(join(FX, '标准成本-产品A.xlsx'), F.pvCost);
  writeFileSync(join(FX, '审计发现.txt'), '审计发现一：应收账款账龄超过180天的余额为 52,000.00 元，建议评估坏账准备。\n审计发现二：费用报销审批流程执行到位。\n');
  writeFileSync(join(FX, '议题清单.txt'), '本次董事会议题：审议季度管理报告；听取审计委员会工作汇报。\n');
  writeFileSync(join(FX, '客户访谈.txt'), '访谈纪要：多位客户反映交付周期偏长，希望缩短到两周以内。\n');
  writeFileSync(join(FX, '战略规划.txt'), '战略规划（三年）\n关键假设：假设人民币汇率保持基本稳定；国内需求稳步增长。\n目标：海外收入占比达到 20%。\n');
  writeFileSync(join(FX, '业绩公告.txt'), '本季度业绩公告：营业收入 500,000.00 元，净利润 41,250.00 元。\n');
});

afterAll(() => {
  server?.close();
  delete process.env.TOTALCLAW_E2E;
  delete process.env.TOTALCLAW_E2E_LLM_URL;
  rmSync(TMP, { recursive: true, force: true });
});

describe('财会审计批次 5 · 财务分析与管理报告', () => {
  let d3: FauRun;
  let d1: FauRun;

  it('准备：公司档案、项目、导入数据（KPI 表 / 量价表三语表头可识别）', async () => {
    await invoke('company.save', {
      company: {
        name: '测试集团', regions: ['CN'], region: 'CN', standard: 'CAS', currency: 'CNY', outputLocale: 'zh-CN', sodMode: 'block',
        signers: [{ ...S.prep, levels: ['prepare'] }, { ...S.rev, levels: ['review'] }, { ...S.appr, levels: ['approve'] }],
      },
    });
    await invoke('project.create', { type: 'custom', period: '2026-09' });
    const cat = await invoke('catalog.get');
    expect(cat.filter((m: { group: string; status: string }) => m.group === 'fpa' && m.status === 'ready')).toHaveLength(10);
    const imp = async (key: string, file: string, kind: string, slot: string) => { ds[key] = (await invoke('data.import', { path: join(FX, file), kind, slot })).id; };
    await imp('tb', '科目余额表-2026-09.xlsx', 'tb', 'tb');
    await imp('tbPrior', '科目余额表-2026-08.xlsx', 'tb', 'tbPrior');
    await imp('budget', '预算-2026-09.xlsx', 'budget', 'budget');
    await imp('commitments', '承诺额-2026-09.xlsx', 'budget', 'commitments');
    await imp('journal', '序时账-2026-09.xlsx', 'journal', 'journal');
    await imp('kpi', 'KPI-2026-09.xlsx', 'kpi', 'kpi');
    await imp('series', '订单量.xlsx', 'kpi', 'kpi');
    await imp('esg', 'ESG-2026.xlsx', 'kpi', 'esg');
    await imp('objectives', '战略目标-2026.xlsx', 'kpi', 'objectives');
    await imp('pvBudget', '量价表-广告.xlsx', 'price_volume', 'pv');
    await imp('pvCost', '标准成本-产品A.xlsx', 'price_volume', 'pv');
    for (const [k, f] of [['audit', '审计发现.txt'], ['topics', '议题清单.txt'], ['survey', '客户访谈.txt'], ['strategyDoc', '战略规划.txt'], ['announce', '业绩公告.txt']]) {
      ds[k] = (await invoke('data.import', { path: join(FX, f), kind: 'evidence', slot: k })).id;
    }
    const ins = await invoke('data.inspect', { path: join(FX, 'KPI-2026-09.xlsx'), kind: 'kpi' });
    expect(ins.missing).toEqual([]);
    expect(ins.mapping.kpiTarget).toBe('目标值');
  });

  it('D2 KPI：红黄绿、连续 3 期未达标升级强制批准级、根因回核；签核归档', async () => {
    const run = await runModule('kpi', 'tracking', { kpi: [ds.kpi] });
    expect(run.steps.draft.status).toBe('done');
    const rows = table(run, 'kpi').rows;
    expect(rows.find((r) => r.indicator === '营业收入')).toMatchObject({ level: 'yellow', misses: 3 });
    expect(rows.find((r) => r.indicator === '应收账款周转天数')?.level).toBe('red');
    expect(run.requiredLevels).toEqual(['prepare', 'review', 'approve']);
    expect(run.reminders.some((r) => r.source === 'escalation')).toBe(true);
    expect(table(run, 'causes').rows).toHaveLength(3);
    expect(run.verification.every((v) => v.status === 'verified')).toBe(true);
    expect(run.artifacts.map((a) => a.kind).sort()).toEqual(['docx', 'xlsx']);
    await signAll(run);
  });

  it('D3 财务分析（环比）：指标与手算一致、毛利率下降黄色预警、写错的数字标未核实；签核归档并转交 D1', async () => {
    const run = await runModule('fin-analysis', 'mom', { tb: [ds.tb], tbPrior: [ds.tbPrior], budget: [ds.budget] });
    expect(run.steps.draft.status).toBe('done');
    const m = table(run, 'metrics').rows;
    expect(m.find((r) => r.metric === '收入')).toMatchObject({ current: F.expected.revenue, prior: F.expected.prior.revenue, budget: 52000000 });
    expect(m.find((r) => r.metric === '净利润')?.current).toBe(F.expected.netProfit);
    expect(res(run).alerts.map((a) => a.id)).toEqual(['gross_margin_drop']);
    expect(res(run).narratives.find((x) => x.id === 'summary')?.status).toBe('unverified');
    expect(res(run).narratives.find((x) => x.id === 'revenue')?.status).toBe('verified');
    expect(run.reminders.some((r) => r.source === 'verify')).toBe(true);
    expect(res(run).checks.find((c) => c.id === 'np_cross')?.ok).toBe(true);
    d3 = await signAll(run);
    await invoke('handoff.send', { fromRunId: d3.id, toModuleId: 'mgmt-report' });
  });

  it('D1 管理报告（英文产出）：每个数字都回核到已签核的数据集，docx + pdf；签核归档并转交董事会', async () => {
    const run = await runModule('mgmt-report', 'monthly', { tb: [ds.tb], tbPrior: [ds.tbPrior], budget: [ds.budget], kpi: [ds.kpi] }, 'en-US');
    expect(run.steps.draft.status).toBe('done');
    const r = res(run);
    expect(r.sources.length).toBe(4);
    expect(r.sources.every((s) => s.signed)).toBe(true);
    expect(r.sources.find((s) => s.slot === 'tb')?.signedBy).toEqual(['fin-analysis']);
    expect(r.narratives.length).toBe(5);
    expect(r.narratives.every((x) => x.status === 'verified')).toBe(true);
    expect(run.verification.every((v) => v.status === 'verified')).toBe(true);
    expect(r.checks.every((c) => c.ok)).toBe(true);
    expect(r.handoffFrom?.map((h) => h.runId)).toEqual([d3.id]);
    // 表里每个金额都带「数据集 + 行号」来源
    for (const row of table(run, 'metrics').rows) expect(String(row.source)).toMatch(/科目余额表-2026-09\.xlsx #\d/);
    expect(run.artifacts.map((a) => a.kind).sort()).toEqual(['docx', 'pdf']);
    for (const a of run.artifacts) expect(existsSync(a.path)).toBe(true);
    expect(run.reminders.filter((x) => x.id.includes(':unsigned:'))).toHaveLength(0);
    d1 = await signAll(run);
    await invoke('handoff.send', { fromRunId: d1.id, toModuleId: 'board' });
  });

  it.each(['zh-CN', 'en-US', 'ar'])('D7 董事会（%s）：取已签核的管理报告，pptx 全部占位符替换，阿语段落 RTL，关注事项引用找不到的丢弃', async (locale) => {
    const run = await runModule('board', 'board', { topics: [ds.topics], auditFindings: [ds.audit] }, locale);
    expect(run.steps.draft.status).toBe('done');
    const r = res(run);
    expect(r.handoffFrom?.[0].runId).toBe(d1.id);
    expect(r.checks.find((c) => c.id === 'signed_report')?.ok).toBe(true);
    expect(table(run, 'acMatters').rows).toHaveLength(1);
    expect(run.reminders.some((x) => x.id === 'board:dropped')).toBe(true);
    expect(table(run, 'distribution').rows.every((x) => x.status === '未发送（由人发送）')).toBe(true);
    const deck = run.artifacts.find((a) => a.kind === 'pptx')!;
    expect(deck).toBeTruthy();
    const texts = readPptx(deck.path).slides.flatMap((s) => s.shapes.flatMap((sh) => sh.runs.map((x) => x.text)));
    expect(texts.some((x) => x.includes('{{'))).toBe(false);
    const xml = new AdmZip(deck.path).readAsText('ppt/slides/slide3.xml');
    expect(xml.includes('rtl="1"')).toBe(locale === 'ar');
    if (process.env.FAU_SHOT_DIR) { mkdirSync(process.env.FAU_SHOT_DIR, { recursive: true }); copyFileSync(deck.path, join(process.env.FAU_SHOT_DIR, `board-${locale}-${basename(deck.path)}`)); }
  });

  it('D4 预算：执行率、承诺、升级；差异分析出量差价差；调整审核要点', async () => {
    const run = await runModule('budget', 'monitor', { budget: [ds.budget], journal: [ds.journal], commitments: [ds.commitments] });
    expect(run.steps.draft.status).toBe('done');
    const rows = table(run, 'execution').rows;
    expect(rows.find((r) => r.category === '销售费用')).toMatchObject({ level: 'red', approval: '财务总监审批，须提交预算调整申请' });
    expect(rows.find((r) => r.category === '财务费用')?.approval).toBe('CEO 审批；无充分理由不予报销');
    expect(rows.find((r) => r.category === '管理费用')?.usageWithCommit).toBeCloseTo(54000 / 55000, 8);
    expect(run.reminders.some((r) => r.id === 'budget:esc:财务费用')).toBe(true);
    const v = await runModule('budget', 'variance', { budget: [ds.budget], journal: [ds.journal], pv: [ds.pvBudget] });
    expect(table(v, 'pv').rows[0]).toMatchObject({ qtyVar: 875000, priceVar: -375000, totalVar: 500000 });
    const a = await runModule('budget', 'adjustment', { budget: [ds.budget], journal: [ds.journal], commitments: [ds.commitments] });
    // 管理费用含承诺 54,000 < 预算 55,000，不需要调整；另两项要
    expect(table(a, 'adjustment').rows.map((r) => r.category).sort()).toEqual(['财务费用', '销售费用'].sort());
  });

  it('D5 成本：标准成本差异、费用率归因、成本中心分摊', async () => {
    const s = await runModule('cost', 'standard', { pv: [ds.pvCost] });
    expect(table(s, 'byElement').rows.map((r) => r.totalVar)).toEqual([28000, 144000, 51000]);
    expect(res(s).checks.every((c) => c.ok)).toBe(true);
    const r = await runModule('cost', 'ratio', { tb: [ds.tb], tbPrior: [ds.tbPrior] });
    expect(table(r, 'ratios').rows.filter((x) => x.flag).map((x) => x.metric)).toEqual(['销售费用']);
    const c = await runModule('cost', 'center', { journal: [ds.journal] });
    expect(Object.fromEntries(table(c, 'centers').rows.filter((x) => x.total).map((x) => [x.center, x.total]))).toEqual(F.expected.centers);
  });

  it('D6 洞察：趋势异常点、验证分级；引用找不到原文的洞察丢弃', async () => {
    const run = await runModule('insight', 'survey', { kpi: [ds.series], survey: [ds.survey] });
    expect(run.steps.draft.status).toBe('done');
    expect(table(run, 'series').rows[0]).toMatchObject({ last: 200, anomalies: 1, trend: '上升趋势' });
    const ins = table(run, 'insights').rows;
    expect(ins).toHaveLength(2);
    expect(ins.map((r) => r.grade)).toEqual(['已验证（强）', '已验证（强）']);
    expect(run.reminders.some((r) => r.id === 'insight:dropped')).toBe(true);
  });

  it('D8 ESG（阿语产出）：ISSB 缺范围三、重大性由代码判定象限', async () => {
    const run = await runModule('esg', 'issb', { esg: [ds.esg] }, 'ar');
    expect(run.steps.draft.status).toBe('done');
    expect(table(run, 'completeness').rows.filter((r) => r.present === '缺失').map((r) => r.indicator)).toEqual(['范围三温室气体排放']);
    expect(table(run, 'materiality').rows.map((r) => r.quadrant)).toEqual(['双重重大', '影响重大']);
    expect(run.reminders.some((r) => r.id === 'esg:missing:scope3')).toBe(true);
    const xlsx = run.artifacts.find((a) => a.kind === 'xlsx')!;
    expect(new AdmZip(xlsx.path).readAsText('xl/worksheets/sheet1.xml')).toContain('rightToLeft="1"');
  });

  it('D9 战略：偏差分级、风险评分、假设引用找不到的丢弃；重度偏差升级', async () => {
    const run = await runModule('strategy', 'tracking', { objectives: [ds.objectives], strategyDoc: [ds.strategyDoc] });
    expect(run.steps.draft.status).toBe('done');
    expect(table(run, 'objectives').rows.map((r) => r.status)).toEqual(['中度偏差', '重度偏差', '正常推进']);
    expect(table(run, 'risks').rows[0]).toMatchObject({ score: 16, level: 'red' });
    expect(table(run, 'assumptions').rows).toHaveLength(1);
    expect(run.reminders.some((r) => r.id.startsWith('strategy:severe:'))).toBe(true);
  });

  it('D10 投资者关系：披露核对把未公开的数字标未核实，pptx + docx', async () => {
    const run = await runModule('ir', 'earnings', { tb: [ds.tb], tbPrior: [ds.tbPrior], announcements: [ds.announce] });
    expect(run.steps.draft.status).toBe('done');
    const qa = table(run, 'qa').rows;
    expect(qa.map((r) => r.check)).toEqual(['已核实', '未核实']);
    expect(res(run).checks.find((c) => c.id === 'disclosure')?.ok).toBe(false);
    expect(run.artifacts.map((a) => a.kind).sort()).toEqual(['docx', 'pptx']);
  });

  it('模型调用全部走假端点，叙述按所选输出语言', () => {
    expect(new Set(calls.map((c) => c.skill))).toEqual(new Set([
      'fa-kpi-management-master', 'fa-financial-analysis-master', 'fa-management-report-master', 'fa-board-reporting-master',
      'fa-business-insight-master', 'fa-esg-reporting-master', 'fa-strategic-planning-master', 'fa-investor-relations-master',
    ]));
    expect(calls.filter((c) => c.skill === 'fa-board-reporting-master').map((c) => c.locale).sort()).toEqual(['ar', 'en-US', 'zh-CN']);
  });
});
