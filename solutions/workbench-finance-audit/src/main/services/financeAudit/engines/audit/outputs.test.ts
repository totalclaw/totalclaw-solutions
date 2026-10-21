/**
 * 批次 3 产出物三语检查（第 13.5 节第 7 条）：B1–B6 与 P4 的每类产出在 zh / en / ar 各生成一次：
 *   第一行草稿警示是 tIn 对应语言；ar / en 的固定文案里没有汉字（这里用户数据全用英文，所以整份文件都不该有汉字）；
 *   阿语 xlsx 有 RTL、docx 有 bidi；文书没有意见段（页眉是「草稿，非审计 / 鉴证意见」）。
 */
import { afterAll, describe, expect, it } from 'vitest';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import * as XLSX from 'xlsx';
import AdmZip from 'adm-zip';
import { tIn } from '@totalclaw/i18n';
import type {
  FauExtAuditResult, FauFraudResult, FauIcfrResult, FauInternalAuditResult, FauKycResult, FauLocale, FauReviewResult,
} from '@totalclaw/ipc-contracts';
import { OUT } from '../../outputs/common';
import type { OutputCtx } from '../../outputs/close';
import { thresholdsFor } from '../../thresholds';
import { tableOf } from './testTable';
import { countGrades, deficienciesFromTests, evaluateTest, parseControls, parsePopulation, planAndSample } from './icfr/testing';
import { writeIcfrOutputs } from './icfr/output';
import { buildPlan, parseUniverse, trackOverdue } from './internalAudit/plan';
import { writeInternalAuditOutputs } from './internalAudit/output';
import { adjustmentImpact } from './extAudit/support';
import { applyStatus } from './extAudit/confirm';
import { writeExtAuditOutputs } from './extAudit/output';
import { writeReviewOutputs } from './review/output';
import { benford } from './fraud/benford';
import { writeFraudOutputs } from './fraud/output';
import { writeKycOutputs } from './kyc/output';
import { writeQcReport } from './office/report';

const DIR = mkdtempSync(join(tmpdir(), 'fau-b3-out-'));
afterAll(() => rmSync(DIR, { recursive: true, force: true }));
const HAN = /[一-鿿]/;
const LOCALES: FauLocale[] = ['zh-CN', 'en-US', 'ar'];
const ctx = (locale: FauLocale, code: string, name: string, mode: string): OutputCtx => ({
  locale, dir: join(DIR, locale, code), companyName: 'Test Group', projectName: 'FY2026 audit', period: '2026',
  moduleCode: code, moduleName: name, modeName: mode, standardLabel: 'IFRS', model: 'fake',
});

// ── 合成结果（用户数据全是英文 / 数字） ──
const thI = thresholdsFor('icfr');
const ct = tableOf(['Control ID', 'Process', 'Risk', 'Control Description', 'Frequency', 'Key Control'], [['C-01', 'Purchasing', 'Unapproved payment', 'Finance manager approves payments', 'daily', 'yes']], 'controls');
const pt = tableOf(['Control ID', 'Reference', 'Date', 'Amount'], Array.from({ length: 40 }, (_, i) => ['C-01', `PO-${i + 1}`, '2026-01-15', 600000]), 'population');
const { controls, rates } = parseControls(ct);
const sampled = planAndSample({ controls, rates, population: parsePopulation(pt), byControl: true, seedBase: 'x', seed: 7, results: {}, th: thI });
const samples = sampled.samples.map((s, i) => ({ ...s, result: (i < 2 ? 'fail' : 'pass') as 'fail' | 'pass' }));
const tests = sampled.plans.map((p) => evaluateTest(p, samples));
const defs = deficienciesFromTests(tests, controls, samples, { 'DEF-C-01': { opImpact: 'high', owner: 'CFO', dueDate: '2026-12-31', remediation: 'Add system block' } }, thI);
const icfrTesting: FauIcfrResult = { mode: 'testing', controls, approvalMatrix: [], plans: sampled.plans, samples, tests, deficiencies: defs, counts: countGrades(defs) };
const icfrDesign: FauIcfrResult = {
  mode: 'design', controls: controls.map((c) => ({ ...c, source: 'draft', quote: 'Payments over 500k need approval.', docName: 'policy.pdf', verified: true })),
  approvalMatrix: [{ matter: 'Payment', threshold: '> 500k', approver: 'Finance manager', quote: 'Payments over 500k need approval.', docName: 'policy.pdf', verified: true }],
  plans: [], samples: [], tests: [], deficiencies: [], counts: countGrades([]),
};
const areas = parseUniverse(tableOf(['Area', 'Likelihood', 'Impact', 'Mandatory', 'Last Audited'], [['Treasury', 'high', 'high', 'no', '2024-03-01'], ['Payroll', 'low', 'low', 'yes', '']], 'universe')).areas;
const iaPlan: FauInternalAuditResult = { mode: 'plan', asOf: '2026-10-19', plan: { ...buildPlan(areas, 40, thresholdsFor('internal-audit')), narrative: 'Treasury first.', narrativeStatus: 'verified' } };
const iaField: FauInternalAuditResult = {
  mode: 'fieldwork', asOf: '2026-10-19', procedures: [{ id: 'P-01', area: 'Purchasing', objective: 'Check approvals', procedure: 'Inspect payments', evidence: 'Payment slips' }],
  findings: [{ id: 'F-01', title: 'Missing approval', condition: 'PO-42 not approved', criteria: 'Policy 5', cause: 'Workflow gap', effect: 'Unauthorised payment', recommendation: 'Enforce approval', kind: 'deficiency', likelihood: 'medium', impact: 'high', severity: 'major', quote: 'PO-42 lacks approval', docName: 'evidence.pdf', verified: true }],
};
const iaTrack: FauInternalAuditResult = {
  mode: 'tracking', asOf: '2026-10-19',
  tracked: [{ id: 'F-1', title: 'Vendor master change', severity: 'major', owner: 'Purchasing', dueDate: '2026-09-01', status: 'open', closedDate: '', source: 'upload', overdueDays: 0, tier: 0 }].map((f) => trackOverdue(f as never, '2026-10-19', thresholdsFor('internal-audit'))),
};
const conf = [
  { id: 'CF-1', type: 'bank' as const, party: 'Bank A', email: 'a@x.com', account: '001', bookAmount: 100_000_00, currency: 'USD', replyAmount: null, status: 'draft' as const, diff: null, ageDays: null, alternative: [] },
  { id: 'CF-2', type: 'ar' as const, party: 'Customer B', email: 'b@x.com', account: 'AR', bookAmount: 50_000_00, currency: 'USD', replyAmount: null, status: 'draft' as const, diff: null, ageDays: null, alternative: [] },
];
const eaSupport: FauExtAuditResult = {
  mode: 'support', asOf: '2026-10-19', materiality: 3_000_000,
  pbc: [{ id: 'PBC-1', item: 'Bank statements', owner: 'Treasury', dueDate: '2026-10-10', status: 'provided', ref: '', source: 'upload' }],
  adjustments: adjustmentImpact([{ row: 2, date: '2026-09-30', voucherNo: 'AJE-1', lineNo: 1, accountCode: '6001', accountName: 'Revenue', summary: 'Cut-off', debit: 0, credit: 5_000_000, currency: 'USD', fxAmount: null, counterparty: '', dept: '', project: '', businessDate: '', source: '' },
    { row: 3, date: '2026-09-30', voucherNo: 'AJE-1', lineNo: 2, accountCode: '1122', accountName: 'Receivables', summary: 'Cut-off', debit: 5_000_000, credit: 0, currency: 'USD', fxAmount: null, counterparty: '', dept: '', project: '', businessDate: '', source: '' }], 'cn', [], 3_000_000),
  adjustmentTotals: { profit: 5_000_000, assets: 5_000_000, liabilities: 0, equity: 0 }, profitBefore: 10_000_000,
};
const eaPrepare: FauExtAuditResult = { mode: 'confirm_prepare', asOf: '2026-09-30', materiality: 0, confirmations: conf, responseRate: null };
const eaReplies: FauExtAuditResult = {
  mode: 'confirm_replies', asOf: '2026-10-19', materiality: 0, responseRate: 0.5,
  confirmations: applyStatus(conf, [{ id: 'CF-1', at: '2026-10-01T00:00:00Z', ok: true }, { id: 'CF-2', at: '2026-10-01T00:00:00Z', ok: true }], [{ confId: 'CF-1', file: 'r1.pdf', amount: 9_000_000, quote: '90,000.00', verified: true }], '2026-10-19', thresholdsFor('ext-audit')),
};
const review: FauReviewResult = {
  mode: 'statements', recommendation: 'hold', reasons: [{ key: '{n} 个交叉索引找不到对应底稿', params: { n: 1 } }],
  xls: [{ id: 'x', file: 'paper.xlsx', sheet: 'Sheet1', cell: 'B7', rule: 'sum_range_gap', severity: 'critical', formula: 'SUM(B3:B6)', detail: 'start' }],
  files: [{ file: 'paper.xlsx', sheets: 1, formulas: 3, findings: 1 }], crossRefs: [{ ref: 'B4-07', file: 'paper.xlsx', found: false }],
  nav: { lps: [{ lpId: 'LP-1', pct: 0.6, ok: true, decision: 'release', lines: [{ line: 'ending', statement: 100, recomputed: 100, diff: 0, ok: true }] }], fundNav: 100, sumEnding: 100, navTies: true },
};
const fraud: FauFraudResult = {
  hits: [{ id: 'h', rule: 'duplicate_payment', level: 'high', source: 'payments', rows: [2, 3], refs: ['P-1', 'P-2'], amount: 5_000_000, detail: 'Vendor C 1001' }],
  benford: benford(Array.from({ length: 200 }, (_, k) => ((k % 9) + 1) * 100_000), thresholdsFor('fraud')),
  coverage: [{ rule: 'duplicate_payment', status: 'ran', hits: 1 }, { rule: 'consecutive', status: 'not_applicable', hits: 0 }],
  plan: [{ id: 'S-01', objective: 'Verify', procedure: 'Inspect invoices', evidence: 'Invoices', owner: 'IA', refs: ['P-1'], verified: true }], summary: 'One hit to verify.', summaryStatus: 'verified',
};
const val = (value: string) => ({ value, quote: value, docName: 'packet.pdf', verified: true });
const kyc: FauKycResult = {
  record: { applicantType: 'entity', legalName: val('Gulf Trading LLC'), dobOrFormation: val('2015-03-12'), jurisdiction: val('SA'), address: val('Riyadh'), sourceOfFunds: null, pepDeclared: false,
    idDocuments: [], beneficialOwners: [{ name: val('Mohammed Ali'), nationality: 'SA', pct: 100 }], controllers: [], documents: [{ type: 'formation', docName: 'packet.pdf', date: '2015-03-12' }], dropped: ['sourceOfFunds'] },
  rating: 'high', factors: [{ factor: '资金来源不清', value: '', points: 2 }],
  outcomes: [{ ruleId: 'K6', text: 'K6 须说明资金来源', builtin: true, outcome: 'fail', evidence: '', effect: 'request_docs' }],
  hits: [{ subject: 'Mohammed Ali', role: 'ubo', listName: 'UN Sanctions', entry: 'Mohammed Ali', score: 1, strength: 'strong' }], missingDocs: ['address'], disposition: 'decline-recommend', reasons: ['K5: Mohammed Ali'],
};

function xlsxStrings(path: string): { wb: XLSX.WorkBook; cells: string[]; firstRows: string[] } {
  const wb = XLSX.read(readFileSync(path), { type: 'buffer', cellFormula: false });
  const cells: string[] = [];
  const firstRows: string[] = [];
  for (const n of wb.SheetNames) {
    const rows = XLSX.utils.sheet_to_json<unknown[]>(wb.Sheets[n], { header: 1, defval: '' });
    firstRows.push(String(rows[0]?.[0] ?? ''));
    for (const r of rows) for (const c of r) if (typeof c === 'string' && c) cells.push(c);
    cells.push(n);
  }
  return { wb, cells, firstRows };
}
function docxText(path: string): string {
  return new AdmZip(path).getEntries().filter((e: { entryName: string }) => e.entryName.startsWith('word/')).map((e: { getData: () => Buffer }) => e.getData().toString('utf8')).join('\n');
}

describe.each(LOCALES)('批次 3 产出物 · %s', (locale) => {
  const files: Array<{ kind: string; path: string; title: string }> = [
    ...writeIcfrOutputs(ctx(locale, 'B1', '内控与 SOX 测试', '控制测试'), icfrTesting, ['prepare', 'review', 'approve']),
    ...writeIcfrOutputs(ctx(locale, 'B1', '内控与 SOX 测试', '新建内控流程（起草 RCM）'), icfrDesign, ['prepare', 'review', 'approve']),
    ...writeInternalAuditOutputs(ctx(locale, 'B2', '内部审计', '年度审计计划'), iaPlan, ['prepare', 'review', 'approve']),
    ...writeInternalAuditOutputs(ctx(locale, 'B2', '内部审计', '流程合规审计'), iaField, ['prepare', 'review', 'approve']),
    ...writeInternalAuditOutputs(ctx(locale, 'B2', '内部审计', '整改跟踪'), iaTrack, ['prepare', 'review', 'approve']),
    ...writeExtAuditOutputs(ctx(locale, 'B3', '外审配合与函证', '资料清单与审计调整'), eaSupport, ['prepare', 'review'], 'Test Group'),
    ...writeExtAuditOutputs(ctx(locale, 'B3', '外审配合与函证', '函证准备（生成函证草稿）'), eaPrepare, ['prepare', 'review'], 'Test Group'),
    ...writeExtAuditOutputs(ctx(locale, 'B3', '外审配合与函证', '回函核对'), eaReplies, ['prepare', 'review'], 'Test Group'),
    ...writeReviewOutputs(ctx(locale, 'B4', '报表与底稿复核', '报表勾稽与底稿质检'), review, ['prepare', 'review', 'approve']),
    ...writeFraudOutputs(ctx(locale, 'B5', '舞弊排查', '数据分析筛查与调查计划'), fraud, ['prepare', 'review', 'approve']),
    ...writeKycOutputs(ctx(locale, 'B6', '客商尽调与反洗钱', '客商尽调筛查'), kyc, ['prepare', 'approve']),
  ];
  const qc = writeQcReport(join(DIR, locale, 'P4'), locale, { kind: 'xlsx', file: 'model.xlsx', scope: 'model', findings: [{ id: 'f', location: 'Sheet1!B7', rule: 'sum_range_gap', severity: 'critical', detail: 'start' }], counts: { critical: 1, important: 0, minor: 0 } });

  it('每类产出都生成了（xlsx 与 docx）', () => {
    expect(files.filter((f) => f.kind === 'xlsx').length).toBe(11);
    expect(files.filter((f) => f.kind === 'docx').length).toBeGreaterThanOrEqual(9);
  });

  it.each(files.filter((f) => f.kind === 'xlsx').map((f) => [f.title, f.path]))('%s xlsx：每张表第一行草稿警示、阿语 RTL、en / ar 没有汉字', (_t, path) => {
    const { wb, cells, firstRows } = xlsxStrings(path);
    expect(firstRows.every((r) => r === tIn(locale, OUT.draft))).toBe(true);
    expect(!!(wb.Workbook?.Views?.[0] as { RTL?: boolean } | undefined)?.RTL).toBe(locale === 'ar');
    if (locale !== 'zh-CN') expect(cells.filter((c) => HAN.test(c))).toEqual([]);
  });

  it.each(files.filter((f) => f.kind === 'docx').map((f) => [f.title, f.path]))('%s docx：页眉「非审计 / 鉴证意见」、阿语 bidi、en / ar 没有汉字', (_t, path) => {
    const xml = docxText(path);
    expect(xml).toContain(tIn(locale, OUT.notOpinion).replace(/&/g, '&amp;').replace(/'/g, '&apos;'));
    expect(xml.includes('<w:bidi/>')).toBe(locale === 'ar');
    if (locale !== 'zh-CN') expect(xml.replace(/<[^>]+>/g, ' ').match(/[一-鿿]+/g) || []).toEqual([]);
  });

  it('P4 质检报告：固定文案按语言、阿语 RTL', () => {
    const { wb, cells } = xlsxStrings(qc);
    expect(!!(wb.Workbook?.Views?.[0] as { RTL?: boolean } | undefined)?.RTL).toBe(locale === 'ar');
    if (locale !== 'zh-CN') expect(cells.filter((c) => HAN.test(c))).toEqual([]);
  });
});
