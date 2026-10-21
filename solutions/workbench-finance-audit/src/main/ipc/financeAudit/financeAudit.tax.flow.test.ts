/**
 * 财会审计批次 4 主流程（经真实 IPC 处理函数走一遍，模型走本地假端点 TOTALCLAW_E2E_LLM_URL）：
 *   沙特 + 阿联酋 + 中国档案保存成功 → 模板下载后原样导回自动认列（阿语表头）→
 *   C1 沙特增值税（阿语产出、RTL、草稿口径提醒必须已知悉才能签、三级签核归档）→ 天课（公历口径、加减项回到行号）→
 *   阿联酋企业所得税（9%、375,000 免征额）→ 中国（与财务智能体 computeTax 一致）→
 *   C2 披露（上交所阈值、草稿回核把写错数字的标未核实）→ C3 转让定价（四分位与手算一致、本地文档叙述回核）→ 规则与出处。
 * 只出草稿：没有提交申报的通道。不碰任何真实模型、浏览器、邮箱或账号。
 */
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createServer, type Server } from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import * as XLSX from 'xlsx';
import AdmZip from 'adm-zip';

const TMP = mkdtempSync(join(tmpdir(), 'fau-tax-flow-'));
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
  writePdfFromHtml: async (p: string) => { writeFileSync(p, '%PDF-1.4 test'); },
}));

import { IPC_CHANNELS, type FauRegulatoryResult, type FauRun, type FauTaxResult, type FauTpResult } from '@totalclaw/ipc-contracts';
import { containsHanText } from '@totalclaw/i18n';
import { registerFinanceAuditHandlers } from '../financeAudit.ipc';
import * as FX from '../../services/financeAudit/__fixtures__/tax';

// ── 假模型端点：C2 披露草稿（第 2 行故意写错金额）、C3 本地文档叙述（只用给定数字） ──
const llmCalls: Array<{ skill: string; locale: string }> = [];
function fakeLlm(body: { prompt: string; responseLocale: string }): string {
  const data = JSON.parse(body.prompt.match(/<data>\n([\s\S]*?)\n<\/data>/)![1]);
  const skill = body.prompt.match(/<skill name="([^"]+)">/)![1];
  llmCalls.push({ skill, locale: body.responseLocale });
  if (skill === 'fa-disclosure-management') {
    return JSON.stringify({
      drafts: data.items.map((i: any) => ({
        id: i.id,
        text: i.id === 'ev2'
          ? `本公司于 ${i.date} 与「${i.counterparty}」达成交易，金额 9,999,999.00 元。`
          : `本公司于 ${i.date} 与「${i.counterparty}」发生「${i.description}」，金额 ${i.amount.toFixed(2)} 元，${i.tests[0]?.ratioPercent != null ? `占比 ${i.tests[0].ratioPercent}%，` : ''}达到披露标准，提请董事会秘书审定。`,
      })),
    });
  }
  if (skill === 'fa-transfer-pricing-documentation-master') {
    const r = data.range;
    return JSON.stringify({
      sections: [
        { id: 'overview', text: `关联交易合计 ${data.relatedPartyTotal.toFixed(2)} 元，按类型列示。` },
        { id: 'method', text: '受测方承担常规功能，选用交易净利润法与完全成本加成率。' },
        { id: 'comparability', text: `可比公司 ${r.n} 家，四分位区间 ${r.q1Percent}% 至 ${r.q3Percent}%，中位值 ${r.medianPercent}%。` },
        { id: 'conclusion', text: `受测方完全成本加成率 ${data.testedParty.pliPercent}%，低于下四分位，按中位值调整需增加营业利润 ${data.adjustmentToMedian.toFixed(2)} 元。` },
      ],
    });
  }
  return '{}';
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
const DIR = join(TMP, 'fixtures');
const y = (c: number) => Math.round(c) / 100;
function xlsx(name: string, headers: string[], rows: (string | number)[][]): string {
  mkdirSync(DIR, { recursive: true });
  const p = join(DIR, name);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([headers, ...rows]), 'Sheet1');
  XLSX.writeFile(wb, p);
  return p;
}
const CAT_AR: Record<string, string> = { standard: 'خاضع للنسبة الأساسية', zero: 'نسبة صفرية', export: 'تصدير', exempt: 'معفى', import_customs: 'استيراد', reverse_charge: 'احتساب عكسي', '': '' };
const signers = { prep: { name: 'أحمد', title: 'محاسب' }, rev: { name: 'سارة', title: 'مراجع' }, appr: { name: 'خالد', title: 'مدير مالي' } };

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
});

afterAll(() => {
  server?.close();
  delete process.env.TOTALCLAW_E2E;
  delete process.env.TOTALCLAW_E2E_LLM_URL;
  rmSync(TMP, { recursive: true, force: true });
});

describe('财会审计批次 4：税务与合规', () => {
  it('沙特、阿联酋、中国三个档案一起保存；四个地区档案都可用', async () => {
    const profiles = await invoke('region.profiles');
    expect(profiles.profiles.map((p: { id: string; available: boolean }) => `${p.id}:${p.available}`)).toEqual(['CN:true', 'INTL:true', 'SA:true', 'AE:true']);
    const c = await invoke('company.save', {
      company: {
        name: 'شركة الاختبار', regions: ['SA', 'AE', 'CN'], region: 'SA', standard: 'SOCPA', currency: 'SAR', outputLocale: 'ar', sodMode: 'block',
        signers: [{ ...signers.prep, levels: ['prepare'] }, { ...signers.rev, levels: ['review'] }, { ...signers.appr, levels: ['approve'] }],
      },
    });
    expect(c.regions).toEqual(['SA', 'AE', 'CN']);
    expect(c.standard).toBe('SOCPA');
    await invoke('project.create', { type: 'filing', period: '2026-09', name: '2026-09 VAT' });
    const cat = await invoke('catalog.get');
    expect(cat.filter((m: { group: string; status: string }) => m.group === 'tax' && m.status === 'ready')).toHaveLength(3);
  });

  it('规则与出处：沙特 / 阿联酋规则带版本与生效日期，未审核 = 草稿口径', async () => {
    const rules = await invoke('tax.rules');
    const ids = rules.map((r: { id: string }) => r.id);
    expect(ids).toEqual(expect.arrayContaining(['sa.zakat_rate', 'sa.cit_rate_nonsaudi', 'sa.wht_rates.royalty', 'sa.einvoice_phase2_start', 'ae.cit_rate', 'ae.cit_zero_threshold', 'cn.tp_cbcr_threshold']));
    expect(rules.every((r: { reviewed: boolean }) => !r.reviewed)).toBe(true);
    const z = rules.find((r: { id: string }) => r.id === 'sa.zakat_rate');
    expect(z.source.originalText).toMatch(/[؀-ۿ]/);
    expect(z.translations.ar.label).toMatch(/[؀-ۿ]/);
  });

  it('模板：三语表头，导回来自动认列', async () => {
    const t = await invoke('tax.template', { kind: 'vat_lines', locale: 'ar' });
    const ins = await invoke('data.inspect', { path: t.path, kind: 'vat_lines' });
    expect(ins.missing).toEqual([]);
    expect(ins.mapping.vatNet).toMatch(/不含税金额/);
  });

  let saVatRunId = '';
  it('C1 沙特增值税：阿语表头自动认列，各栏与手算一致，阿语产出 RTL，草稿口径', async () => {
    const path = xlsx('vat-sa.xlsx', ['الاتجاه', 'تاريخ الفاتورة', 'رقم الفاتورة', 'اسم العميل', 'الرقم الضريبي', 'المبلغ الخاضع للضريبة', 'مبلغ الضريبة', 'فئة الضريبة', 'حالة الفاتورة', 'قابلة للاسترداد'],
      FX.saVatLines.map((l) => [l.direction === 'sales' ? 'مبيعات' : 'مشتريات', l.date, l.docNo, l.counterparty, l.counterpartyVatNo, y(l.net), y(l.vat), CAT_AR[l.category], l.status === 'void' ? 'ملغاة' : 'عادية', l.recoverable === false ? 'لا' : '']));
    const ins = await invoke('data.inspect', { path, kind: 'vat_lines' });
    expect(ins.missing).toEqual([]);
    expect(ins.mapping.vatCategory).toBe('فئة الضريبة');
    const ds = await invoke('data.import', { path, kind: 'vat_lines', slot: 'vatLines', moduleId: 'tax' });
    expect(ds.rowCount).toBe(FX.saVatLines.length);
    const r0 = await invoke('run.start', { moduleId: 'tax', modeId: 'sa_vat', outputLocale: 'ar', inputs: { vatLines: [ds.id] }, params: { carriedCredit: 1000 } });
    const run = await waitRun(r0.id);
    expect(run.steps.draft.status, JSON.stringify(run.steps)).toBe('done');
    saVatRunId = run.id;
    const res = run.result as FauTaxResult;
    expect(res.sections[0].payable).toBe(FX.SA_VAT.due);
    expect(res.vatTotals).toEqual({ output: FX.SA_VAT.output, input: FX.SA_VAT.input });
    expect(res.draftBasis).toBe(true);
    expect(res.rules.map((r) => r.id)).toEqual(expect.arrayContaining(['sa.vat_standard_rate', 'sa.vat_correction_threshold', 'sa.vat_return_due']));
    expect(res.calendar[0]).toMatchObject({ due: '2026-10-31', ruleId: 'sa.vat_return_due' });
    expect(run.reminders.some((r) => r.id === 'tax:draft_basis')).toBe(true);
    expect(run.requiredLevels).toEqual(['prepare', 'review', 'approve']);
    // 阿语产出：RTL、草稿警示 + 草稿口径、固定文案没有汉字、回历截止日列
    const wbPath = run.artifacts.find((a) => a.kind === 'xlsx')!.path;
    const wb = XLSX.read(readFileSync(wbPath), { type: 'buffer' });
    expect((wb.Workbook?.Views?.[0] as { RTL?: boolean } | undefined)?.RTL).toBe(true);
    const work = XLSX.utils.sheet_to_json<string[]>(wb.Sheets[wb.SheetNames[1]], { header: 1 });
    expect(work[0][0]).toContain('مسودة بانتظار الاعتماد');
    expect(work[0][0]).toContain('مسودة');
    expect(containsHanText(work.slice(0, 2).flat().join(' '))).toBe(false);
    const cal = XLSX.utils.sheet_to_json<string[]>(wb.Sheets[wb.SheetNames.find((n) => /تقويم|Calendar/.test(n)) || wb.SheetNames[4]], { header: 1 });
    expect(cal[1].length).toBeGreaterThanOrEqual(4);
    expect(String(cal[2][3])).toMatch(/^14\d\d-\d\d-\d\d$/);
    const docXml = new AdmZip(run.artifacts.find((a) => a.kind === 'docx')!.path).readAsText('word/document.xml');
    expect(docXml).toContain('<w:bidi/>');
  });

  it('C1 签核：草稿口径必须逐条已知悉；三级签核后归档', async () => {
    const { run } = await invoke<{ run: FauRun }>('run.get', { runId: saVatRunId });
    const acks = run.reminders.map((r) => r.id);
    await expect(invoke('signoff.submit', { runId: saVatRunId, signer: signers.prep, comment: 'x' })).rejects.toThrow(/已知悉/);
    await invoke('signoff.submit', { runId: saVatRunId, signer: signers.prep, acknowledged: acks, comment: 'تمت المراجعة' });
    await invoke('signoff.decide', { runId: saVatRunId, level: 'review', decision: 'approve', signer: signers.rev, acknowledged: acks, comment: 'موافق' });
    const out = await invoke('signoff.decide', { runId: saVatRunId, level: 'approve', decision: 'approve', signer: signers.appr, acknowledged: acks, comment: 'موافق' });
    expect(out.archived).toBe(true);
  });

  it('C1 天课（公历口径）：基数、天课与外资部分所得税和手算一致，每一项回到余额表行号', async () => {
    const path = xlsx('tb-sa.xlsx', ['Account Code', 'Account Name', 'Period Debit', 'Period Credit', 'Closing Debit', 'Closing Credit'],
      FX.zakatTb.map((r) => [r.accountCode, r.accountName, y(r.periodDr), y(r.periodCr), y(r.closingDr), y(r.closingCr)]));
    const ds = await invoke('data.import', { path, kind: 'tb', slot: 'tb', moduleId: 'tax' });
    const r0 = await invoke('run.start', { moduleId: 'tax', modeId: 'sa_zakat', outputLocale: 'en-US', inputs: { tb: [ds.id] }, params: { period: '2025', zakatYearBasis: 'gregorian', saudiShare: 60 } });
    const run = await waitRun(r0.id);
    expect(run.steps.draft.status, JSON.stringify(run.steps)).toBe('done');
    const z = (run.result as FauTaxResult).zakat!;
    expect([z.base, z.zakatDue, z.nonSaudiCit]).toEqual([FX.ZAKAT.base, FX.ZAKAT.greg60, FX.ZAKAT.cit40]);
    expect(z.fiscalDays).toBe(365);
    expect(z.items.map((i) => i.row).sort((a, b) => a - b)).toEqual([2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
    expect((run.result as FauTaxResult).calendar[0].due).toBe('2026-04-30');
    // 英文产出：天课基数表用公式联动，固定文案没有汉字
    const wb = XLSX.read(readFileSync(run.artifacts.find((a) => a.kind === 'xlsx')!.path), { type: 'buffer', cellFormula: true });
    const sheet = wb.Sheets[wb.SheetNames[2]];
    expect(Object.values(sheet).some((c: any) => typeof c?.f === 'string' && c.f.includes('SUMIF'))).toBe(true);
    const head = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1 }).slice(0, 2).flat().join(' ');
    expect(containsHanText(head)).toBe(false);
  });

  it('C1 阿联酋企业所得税：(1,000,000 − 375,000) × 9% = 56,250', async () => {
    await invoke('company.save', { company: { ...(await invoke('company.get')), region: 'AE', standard: 'IFRS', currency: 'AED' } });
    const path = xlsx('tb-ae.xlsx', ['Account Code', 'Account Name', 'Period Debit', 'Period Credit', 'Closing Debit', 'Closing Credit'],
      FX.aeCitTb.map((r) => [r.accountCode, r.accountName, y(r.periodDr), y(r.periodCr), y(r.closingDr), y(r.closingCr)]));
    const ds = await invoke('data.import', { path, kind: 'tb', slot: 'tb', moduleId: 'tax' });
    const r0 = await invoke('run.start', { moduleId: 'tax', modeId: 'ae_cit', outputLocale: 'ar', inputs: { tb: [ds.id] }, params: { period: '2025' } });
    const run = await waitRun(r0.id);
    expect(run.steps.draft.status, JSON.stringify(run.steps)).toBe('done');
    const res = run.result as FauTaxResult;
    expect(res.sections[0].payable).toBe(FX.AE_CIT.tax);
    expect(res.currency).toBe('AED');
    expect(res.draftBasis).toBe(true);
    expect(res.calendar[0].due).toBe('2026-09-30');
  });

  it('C1 中国：与财务智能体 computeTax 结果一致；申报代填跳财务智能体（没有提交通道）', async () => {
    const path = xlsx('vat-cn.xlsx', ['方向', '开票日期', '发票号码', '对方名称', '对方税号', '不含税金额', '税额', '税率', '发票类型', '发票状态'],
      FX.cnVatLines.map((l) => [l.direction === 'sales' ? '销项' : '进项', l.date, l.docNo, l.counterparty, l.counterpartyVatNo, y(l.net), y(l.vat), `${Math.round((l.rate || 0) * 100)}%`, l.invoiceType === 'vat_special' ? '专票' : '普票', l.status === 'abnormal' ? '失控' : '正常']));
    const ds = await invoke('data.import', { path, kind: 'vat_lines', slot: 'vatLines', moduleId: 'tax' });
    const r0 = await invoke('run.start', { moduleId: 'tax', modeId: 'cn', outputLocale: 'zh-CN', inputs: { vatLines: [ds.id] }, params: { taxpayerType: 'general', cityTier: 'urban' } });
    const run = await waitRun(r0.id);
    expect(run.steps.draft.status, JSON.stringify(run.steps)).toBe('done');
    const res = run.result as FauTaxResult;
    expect(res.cn!.vatPayable).toBe(8_200);
    expect(res.sections.find((s) => s.id === 'vat')!.payable).toBe(820_000);
    expect(res.draftBasis).toBe(false);
    expect(res.findings.some((f) => f.id === 'gt_abnormal_input')).toBe(true);
    expect(res.calendar[0].due).toBe('2026-10-15');
    expect((await invoke('catalog.get')).find((m: any) => m.id === 'tax').reuse[0].route).toBe('/workbenches/finance-agent');
  });

  it('C2 披露：上交所阈值判断；草稿回核把写错金额的标未核实', async () => {
    await invoke('company.save', { company: { ...(await invoke('company.get')), region: 'CN', standard: 'CAS', currency: 'CNY' } });
    const path = xlsx('events.xlsx', ['日期', '事项类型', '事项说明', '对方', '成交金额', '关联方类型', '涉及资产总额'],
      FX.events.map((e) => [e.date, { transaction: '交易', related_party: '关联交易', guarantee: '担保' }[e.type as string] || '其他', e.description, e.counterparty, y(e.amount), e.rpKind === 'legal' ? '法人' : e.rpKind === 'natural' ? '自然人' : '', e.assetTotal == null ? '' : y(e.assetTotal)]));
    const ds = await invoke('data.import', { path, kind: 'disclosure_events', slot: 'events', moduleId: 'regulatory' });
    const b = FX.DISCLOSURE_BASE;
    const r0 = await invoke('run.start', {
      moduleId: 'regulatory', modeId: 'disclosure', outputLocale: 'zh-CN', inputs: { events: [ds.id] },
      params: { regime: 'cn_sse', auditedTotalAssets: y(b.totalAssets), auditedNetAssets: y(b.netAssets), auditedRevenue: y(b.revenue), auditedNetProfit: y(b.netProfit) },
    });
    const run = await waitRun(r0.id);
    expect(run.steps.draft.status, JSON.stringify(run.steps)).toBe('done');
    const res = run.result as FauRegulatoryResult;
    expect([res.counts.shareholder, res.counts.disclose, res.counts.none]).toEqual([FX.DISCLOSURE.shareholder, FX.DISCLOSURE.disclose, FX.DISCLOSURE.none]);
    expect(res.items.find((i) => i.row === 2)!.draftStatus).toBe('unverified');
    expect(res.items.find((i) => i.row === 3)!.draftStatus).toBe('verified');
    expect(run.reminders.some((r) => r.id === 'u:draft:ev2')).toBe(true);
    // 第 2 行写错的被要求重写过一次
    expect(llmCalls.filter((c) => c.skill === 'fa-disclosure-management').length).toBe(2);
  });

  it('C3 转让定价：四分位与手算一致、低于下四分位按中位值调整、本地文档叙述回核通过', async () => {
    const comp = xlsx('comps.xlsx', ['可比公司', '年度', '营业利润', '总成本'], FX.comparables.map((c) => [c.name, c.year, c.operatingProfit == null ? '' : y(c.operatingProfit), c.totalCost == null ? '' : y(c.totalCost)]));
    const rpt = xlsx('rpt.xlsx', ['关联方', '所在国家', '交易类型', '交易金额', '定价方法'], FX.rptRows.map((r) => [r.counterparty, r.jurisdiction, r.type === 'tangible' ? '有形资产' : '劳务', y(r.amount), r.method]));
    const c = await invoke('data.import', { path: comp, kind: 'tp_comparables', slot: 'comparables', moduleId: 'transfer-pricing' });
    const r = await invoke('data.import', { path: rpt, kind: 'rp_transactions', slot: 'rpt', moduleId: 'transfer-pricing' });
    const t = FX.TP.tested;
    const r0 = await invoke('run.start', {
      moduleId: 'transfer-pricing', modeId: 'local_file', outputLocale: 'zh-CN', inputs: { comparables: [c.id], rpt: [r.id] },
      params: { tpJurisdiction: 'CN', pli: 'ncp', testedRevenue: y(t.revenue), testedOperatingProfit: y(t.operatingProfit), testedTotalCost: y(t.totalCost), groupRevenue: 6_000_000_000 },
    });
    const run = await waitRun(r0.id);
    expect(run.steps.draft.status, JSON.stringify(run.steps)).toBe('done');
    const res = run.result as FauTpResult;
    expect(res.range!.q1).toBeCloseTo(FX.TP.q1, 12);
    expect(res.range!.median).toBeCloseTo(FX.TP.median, 12);
    expect(res.range!.q3).toBeCloseTo(FX.TP.q3, 12);
    expect(res.position).toBe('below');
    expect(res.adjustment!.amount).toBe(FX.TP.adjustment);
    expect(Object.fromEntries(res.docs.map((d) => [d.id, d.required]))).toEqual({ master: false, local: true, cbcr: true });
    expect(res.narrative.every((n) => n.status === 'verified')).toBe(true);
    expect(res.draftBasis).toBe(true);
    // 可比分析表用 QUARTILE 公式联动
    const wb = XLSX.read(readFileSync(run.artifacts.find((a) => a.kind === 'xlsx')!.path), { type: 'buffer', cellFormula: true });
    expect(Object.values(wb.Sheets[wb.SheetNames[2]]).some((cell: any) => typeof cell?.f === 'string' && cell.f.startsWith('QUARTILE('))).toBe(true);
  });
});
