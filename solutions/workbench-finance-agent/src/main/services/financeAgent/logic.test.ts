/**
 * 财务智能体纯计算：票据识别与校验、凭证分录、税额、报销规则、对账、账龄、报表勾稽、风险、预算、成本、合同、问答检索。
 */
import { describe, expect, it, vi } from 'vitest';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { FaBalanceRow, FaDoc, FaExpenseClaim, FaJournalRow, FaLedger } from '@totalclaw/ipc-contracts';

vi.mock('../accountScope', () => ({ accountPath: (...p: string[]) => join(tmpdir(), 'fa-unused', ...p) }));

import { checkDoc, directionOf, parseInvoiceText, classifyDoc } from './invoice';
import { buildVoucher, isBalanced } from './voucher';
import { computeIit, computeTax, taxFindings } from './tax';
import { defaultTaxSettings } from './tax';
import { defaultExpenseRules, reviewClaim } from './expense';
import { buildAging, matchRows, recSummary, reconcileLetter } from './reconcile';
import { buildStatements } from './statements';
import { consecutiveInvoices, largeCash } from './risk';
import { analyzeBudget, actualsFromJournal } from './budget';
import { allocate, computeCost } from './cost';
import { detectContractType, extractContractAmount, ruleFindings, stampDuty, verifyLlmRisks } from './contract';
import { searchBuiltin } from './knowledge';
import { normalizePdfText } from './common';

const US = '91320594MA1Q2W3E4U';
const THEM = '91310115MA1K3YJ12G';
const LEDGER: FaLedger = {
  id: 'l1', name: '苏州泰途科技有限公司', taxId: US, taxpayerType: 'general', cityTier: 'urban', industry: '', smallLowProfit: true, notes: '', createdAt: '',
};

const SPECIAL_TEXT = `电子发票（增值税专用发票）
发票号码：25322000000012345678
开票日期：2026年09月10日
购买方信息 名称：苏州泰途科技有限公司 统一社会信用代码/纳税人识别号：${US}
销售方信息 名称：上海云启信息技术有限公司 统一社会信用代码/纳税人识别号：${THEM}
项目名称 规格型号 单位 数量 单价 金额 税率/征收率 税额
*信息技术服务*软件服务费 年 1 9433.96 9433.96 6% 566.04
合 计 ¥9433.96 ¥566.04
价税合计（大写） 壹万圆整 （小写）¥10000.00`;

function docFrom(text: string, extra: Partial<FaDoc> = {}): FaDoc {
  const p = parseInvoiceText(text);
  const d: FaDoc = {
    id: extra.id || 'd1', fileName: 'a.pdf', path: '/tmp/a.pdf', kind: p.kind, direction: 'unknown',
    invoiceNo: p.invoiceNo, invoiceCode: p.invoiceCode, date: p.date, sellerName: p.sellerName, sellerTaxId: p.sellerTaxId,
    buyerName: p.buyerName, buyerTaxId: p.buyerTaxId, amount: p.amount || 0, tax: p.tax || 0, total: p.total || 0,
    taxRate: p.taxRate ?? null, items: p.items, category: '', fieldSource: {}, checks: [], text, status: 'recognized', createdAt: '',
    ...extra,
  };
  d.direction = directionOf(d, LEDGER);
  d.category = classifyDoc(d, text);
  return d;
}

describe('票据识别', () => {
  it('数电专票：号码、日期、双方、金额、税率都按版式读出', () => {
    const p = parseInvoiceText(SPECIAL_TEXT);
    expect(p.kind).toBe('vat_special');
    expect(p.invoiceNo).toBe('25322000000012345678');
    expect(p.date).toBe('2026-09-10');
    expect(p.buyerName).toBe('苏州泰途科技有限公司');
    expect(p.sellerTaxId).toBe(THEM);
    expect([p.amount, p.tax, p.total, p.taxRate]).toEqual([9433.96, 566.04, 10000, 0.06]);
    expect(p.items[0].name).toContain('软件服务费');
  });

  it('本公司是购买方 → 进项，归到咨询服务费，校验全过', () => {
    const d = docFrom(SPECIAL_TEXT);
    expect(d.direction).toBe('in');
    expect(d.category).toBe('咨询服务费');
    const checks = checkDoc(d, LEDGER, [], '2026-09-20');
    expect(checks.filter((c) => c.level === 'error')).toEqual([]);
  });

  it('金额加不上、税号校验位错、重复票都报错', () => {
    const bad = docFrom(SPECIAL_TEXT.replace('¥10000.00', '¥10000.50').replace(THEM, '91310115MA1K3YJ12X'));
    const existing = docFrom(SPECIAL_TEXT, { id: 'old', fileName: 'old.pdf' });
    const codes = checkDoc(bad, LEDGER, [existing], '2026-09-20').filter((c) => c.level === 'error').map((c) => c.code);
    expect(codes).toEqual(expect.arrayContaining(['sum_mismatch', 'uscc_invalid', 'duplicate']));
  });

  it('PDF 文字层的康熙部首字符、名称后粘着标签都能读（Chrome 打印的真实 PDF 实测）', () => {
    const p = parseInvoiceText('电⼦发票（增值税专⽤发票）\n发票号码：25322000000012345678\n开票⽇期：2026年09 ⽉ 10 ⽇\n购买⽅信息名称：苏州泰途科技有限公司统⼀社会信⽤代码/纳税⼈识别号：' + US + '\n*信息技术服务*软件服务费项1 9433.96 9433.96 6% 566.04\n合计¥9433.96 ¥566.04\n（⼩写）¥10000.00');
    expect([p.kind, p.date, p.buyerName, p.buyerTaxId, p.total]).toEqual(['vat_special', '2026-09-10', '苏州泰途科技有限公司', US, 10000]);
  });

  it('铁路客票按 9% 计算可抵扣进项', () => {
    const p = parseInvoiceText('电子发票（铁路电子客票）\n发票号码：26329100000012345678\n开票日期：2026年09月01日\n票价：¥545.00');
    expect(p.kind).toBe('e_ticket');
    expect(p.tax).toBe(45);
    expect(p.amount).toBe(500);
  });
});

describe('凭证草稿', () => {
  it('一般纳税人专票进项：借费用 + 进项税，贷其他应付款，借贷平衡', () => {
    const v = buildVoucher(docFrom(SPECIAL_TEXT), LEDGER, [])!;
    expect(v.no).toMatch(/-0001$/);
    expect(v.lines.map((l) => l.accountCode)).toEqual(['560209', '22210101', '2241']);
    expect(isBalanced(v.lines)).toBe(true);
  });

  it('小规模纳税人：专票税额也全额进费用', () => {
    const v = buildVoucher(docFrom(SPECIAL_TEXT), { ...LEDGER, taxpayerType: 'small' }, [])!;
    expect(v.lines).toHaveLength(2);
    expect(v.lines[0].debit).toBe(10000);
  });

  it('销项票：借应收、贷收入与销项税额', () => {
    const text = SPECIAL_TEXT.replace(/购买方信息 名称：苏州泰途科技有限公司/, '购买方信息 名称：无锡客户有限公司').replace(`纳税人识别号：${US}`, `纳税人识别号：${THEM}X`)
      .replace(/销售方信息 名称：上海云启信息技术有限公司 统一社会信用代码\/纳税人识别号：[0-9A-Z]+/, `销售方信息 名称：苏州泰途科技有限公司 统一社会信用代码/纳税人识别号：${US}`);
    const d = docFrom(text);
    expect(d.direction).toBe('out');
    const v = buildVoucher(d, LEDGER, [])!;
    expect(v.lines.map((l) => [l.accountCode, l.debit, l.credit])).toEqual([['1122', 10000, 0], ['5001', 0, 9433.96], ['22210102', 0, 566.04]]);
  });
});

describe('税额计算', () => {
  const s = defaultTaxSettings();
  it('一般纳税人：销项 − 进项，附加税按城建 7% + 3% + 2%', () => {
    const r = computeTax({ salesByRate: [{ rate: 0.13, amount: 1_000_000, tax: 130_000 }], uninvoicedSales: 0, uninvoicedRate: 0.13, inputTax: 100_000, inputTransferOut: 0, carriedCredit: 0, bookRevenue: 1_000_000, profitYtd: 200_000, citPaidYtd: 0, quarterly: false }, { ...LEDGER, smallLowProfit: false }, s, []);
    expect(r.vatPayable).toBe(30_000);
    expect(r.surchargeTotal).toBe(3_600);
    expect(r.citPayable).toBe(50_000);
  });

  it('小规模季度 30 万以下免征；超过按 1%，附加税减半', () => {
    const base = { uninvoicedSales: 0, uninvoicedRate: 0.01, inputTax: 0, inputTransferOut: 0, carriedCredit: 0, bookRevenue: 0, profitYtd: 100_000, citPaidYtd: 0, quarterly: true };
    const small = { ...LEDGER, taxpayerType: 'small' as const };
    expect(computeTax({ ...base, salesByRate: [{ rate: 0.01, amount: 280_000, tax: 0 }] }, small, s, []).vatExempt).toBe(true);
    const r = computeTax({ ...base, salesByRate: [{ rate: 0.01, amount: 500_000, tax: 5000 }] }, small, s, []);
    expect(r.vatPayable).toBe(5000);
    expect(r.surcharges.map((x) => x.value)).toEqual([175, 75, 50]);
    expect(r.citPayable).toBe(5000);
  });

  it('个税累计预扣：第 3 个月', () => {
    const r = computeIit({ name: 'A', salary: 20000, insurance: 2000, special: 2000, ytdSalary: 40000, ytdInsurance: 4000, ytdSpecial: 4000, ytdTaxPaid: 780, monthIndex: 3 });
    // 60000 − 15000 − 6000 − 6000 = 33000 × 3% = 990；已扣 780 → 本月 210
    expect(r.taxableYtd).toBe(33000);
    expect(r.taxThisMonth).toBe(210);
  });

  it('账面收入与申报不一致、税负偏低会被预检出来', () => {
    const inputs = { salesByRate: [{ rate: 0.13, amount: 100_000, tax: 13_000 }], uninvoicedSales: 0, uninvoicedRate: 0.13, inputTax: 12_900, inputTransferOut: 0, carriedCredit: 0, bookRevenue: 180_000, profitYtd: 0, citPaidYtd: 0, quarterly: false };
    const r = computeTax(inputs, LEDGER, s, []);
    const codes = taxFindings(inputs, r, LEDGER, s, [], '2026-09').map((f) => f.code);
    expect(codes).toEqual(expect.arrayContaining(['book_tax_gap', 'low_burden', 'input_ratio']));
  });
});

describe('费用报销', () => {
  it('超标准、过期、重复报销都驳回', () => {
    const doc = docFrom(SPECIAL_TEXT.replace('*信息技术服务*软件服务费', '*住宿服务*住宿费'), { id: 'x1', date: '2025-01-01', claimId: 'c1' });
    doc.category = '差旅费';
    const dup = { ...doc, id: 'x0', claimId: 'c0', fileName: 'old.pdf' };
    const claim: FaExpenseClaim = { id: 'c1', employee: '张三', dept: '销售部', level: '', reason: '出差', items: [{ docId: 'x1', category: '', amount: 0, checks: [] }], total: 0, verdict: 'pending', rejectReasons: [], createdAt: '' };
    const r = reviewClaim(claim, [doc], { ledger: LEDGER, rules: defaultExpenseRules(), allDocs: [doc, dup], monthUsed: 0, today: '2026-09-20' });
    expect(r.verdict).toBe('reject');
    const codes = r.items[0].checks.map((c) => c.code);
    expect(codes).toEqual(expect.arrayContaining(['over_cap', 'expired', 'duplicate']));
  });
});

describe('往来对账与账龄', () => {
  it('单号匹配、金额差异、单边记录分开标', () => {
    const ours = [{ date: '2026-08-01', ref: 'INV-001', summary: '', amount: 1000 }, { date: '2026-08-05', ref: 'INV-002', summary: '', amount: 500 }, { date: '2026-08-09', ref: '', summary: '', amount: 300 }];
    const theirs = [{ date: '2026-08-02', ref: 'INV001', summary: '', amount: 1000 }, { date: '2026-08-05', ref: 'INV-002', summary: '', amount: 450 }, { date: '2026-08-20', ref: 'X9', summary: '', amount: 80 }];
    const m = matchRows(ours, theirs);
    expect(m.map((x) => x.status).sort()).toEqual(['amount_diff', 'matched', 'only_ours', 'only_theirs']);
    const s = recSummary(m);
    expect(s.gap).toBe(270);
    expect(reconcileLetter({ side: 'ar', counterparty: '甲公司', asOf: '2026-08-31', matches: m, ...s }, '乙公司')).toContain('1,800.00');
  });

  it('账龄分段与逾期预警', () => {
    const a = buildAging([
      { counterparty: 'A', docNo: '1', date: '2026-01-01', dueDate: '2026-02-01', amount: 1000, paid: 0 },
      { counterparty: 'A', docNo: '2', date: '2026-09-01', dueDate: '2026-10-01', amount: 500, paid: 100 },
      { counterparty: 'B', docNo: '3', date: '2025-01-01', dueDate: '2025-02-01', amount: 200, paid: 200 },
    ], '2026-09-20', 'ar', 365);
    expect(a.rows).toHaveLength(2);
    expect(a.byCounterparty[0]).toMatchObject({ counterparty: 'A', outstanding: 1400, overdue: 1000 });
    expect(a.warnings[0].level).toBe('high');
  });
});

describe('财务报表', () => {
  const row = (code: string, name: string, oD: number, oC: number, d: number, c: number, cD: number, cC: number): FaBalanceRow => ({ code, name, openingDebit: oD, openingCredit: oC, debit: d, credit: c, closingDebit: cD, closingCredit: cC });
  const rows = [
    row('1002', '银行存款', 100000, 0, 113000, 30000, 183000, 0),
    row('1122', '应收账款', 0, 0, 0, 0, 0, 0),
    row('2221', '应交税费', 0, 0, 0, 13000, 0, 13000),
    row('222101', '应交税费-应交增值税', 0, 0, 0, 13000, 0, 13000),
    row('3001', '实收资本', 0, 100000, 0, 0, 0, 100000),
    row('3103', '本年利润', 0, 0, 30000, 100000, 0, 70000),
    row('5001', '主营业务收入', 0, 0, 100000, 100000, 0, 0),
    row('5602', '管理费用', 0, 0, 30000, 30000, 0, 0),
  ];
  const journal: FaJournalRow[] = [
    { date: '2026-09-01', voucherNo: '1', summary: '', accountCode: '1002', accountName: '银行存款', debit: 113000, credit: 0 },
    { date: '2026-09-01', voucherNo: '1', summary: '', accountCode: '5001', accountName: '主营业务收入', debit: 0, credit: 100000 },
    { date: '2026-09-01', voucherNo: '1', summary: '', accountCode: '222101', accountName: '应交税费-应交增值税', debit: 0, credit: 13000 },
    { date: '2026-09-02', voucherNo: '2', summary: '', accountCode: '5602', accountName: '管理费用', debit: 30000, credit: 0 },
    { date: '2026-09-02', voucherNo: '2', summary: '', accountCode: '1002', accountName: '银行存款', debit: 0, credit: 30000 },
  ];
  it('资产 = 负债 + 权益，子科目不重复计数，净利润对上未分配利润', () => {
    const s = buildStatements(rows, journal);
    const g = (k: string) => s.balanceSheet.find((l) => l.key === k)!.current;
    expect(g('totalAssets')).toBe(183000);
    expect(g('taxes')).toBe(13000);
    expect(g('totalLiabEquity')).toBe(183000);
    expect(s.income.find((l) => l.key === 'netProfit')!.current).toBe(70000);
    expect(s.checks.filter((c) => c.level === 'error')).toEqual([]);
    expect(s.cashflow.find((l) => l.key === 'opSales')!.current).toBe(113000);
    expect(s.cashflow.find((l) => l.key === 'netIncrease')!.current).toBe(83000);
  });
});

describe('风险、预算、成本', () => {
  it('同一开票方 3 张连号发票', () => {
    const mk = (id: string, no: string) => ({ ...docFrom(SPECIAL_TEXT, { id }), invoiceNo: no });
    expect(consecutiveInvoices([mk('a', '1001'), mk('b', '1002'), mk('c', '1003'), mk('d', '1009')], 3)).toHaveLength(1);
  });

  it('大额现金', () => {
    expect(largeCash([{ date: '2026-09-01', voucherNo: '5', summary: '', accountCode: '1001', accountName: '库存现金', debit: 0, credit: 80000 }], 50000)[0].code).toBe('large_cash');
  });

  it('预算执行率与超预算', () => {
    const lines = [{ dept: '销售部', category: '差旅费', months: Array(12).fill(1000) }];
    const actual = actualsFromJournal([
      { date: '2026-01-10', voucherNo: '1', summary: '', accountCode: '560202', accountName: '管理费用-差旅费', debit: 1500, credit: 0, dept: '销售部' },
      { date: '2026-02-10', voucherNo: '2', summary: '', accountCode: '560202', accountName: '管理费用-差旅费', debit: 800, credit: 0, dept: '销售部' },
      { date: '2026-02-10', voucherNo: '3', summary: '', accountCode: '560202', accountName: '管理费用-差旅费', debit: 999, credit: 0, dept: '研发部' },
    ], 2026);
    const r = analyzeBudget(lines, actual, 2)[0];
    expect([r.budget, r.actual, r.level]).toEqual([2000, 2300, 'over']);
  });

  it('分摊尾差归最后一个，合计不差一分', () => {
    const a = allocate(100, [1, 1, 1]);
    expect(a).toEqual([33.33, 33.33, 33.34]);
  });

  it('成本核算与超耗', () => {
    const r = computeCost({
      products: [{ name: 'A', output: 100, hours: 60, machineHours: 0 }, { name: 'B', output: 50, hours: 40, machineHours: 0 }],
      materials: [{ product: 'A', material: '钢板', qty: 230, unitPrice: 10, stdPerUnit: 2 }, { product: 'B', material: '钢板', qty: 100, unitPrice: 10, stdPerUnit: 2 }],
      laborTotal: 5000, overheadItems: [{ item: '电费', amount: 2000 }], basis: 'hours', lossTolerance: 0.05,
    });
    expect(r.result.map((x) => x.total)).toEqual([2300 + 3000 + 1200, 1000 + 2000 + 800]);
    expect(r.result[0].unitCost).toBe(65);
    expect(r.losses.map((l) => l.code)).toEqual(['loss']);
  });
});

describe('合同与问答', () => {
  const text = '采购合同\n甲方：苏州泰途科技有限公司\n合同总金额：人民币 113 万元（含税），其中不含税金额 100 万元。\n乙方收到货款后开具发票。付款至乙方个人账户。';
  it('类型、金额、印花税、固定规则', () => {
    const t = detectContractType(text)!;
    expect(t.type).toBe('买卖合同');
    const a = extractContractAmount(text);
    expect([a.total, a.exclTax]).toEqual([1_130_000, 1_000_000]);
    expect(stampDuty(t, a.total, a.exclTax)!.at(-1)!.value).toBe(300);
    const codes = ruleFindings(text).map((f) => f.code);
    expect(codes).toContain('personal_account');
    expect(codes).toContain('invoice_after_payment');
    expect(codes).not.toContain('no_invoice_type');
  });

  it('PDF 部首补充字符还原（人 \u2EA0币 → 人民币）', () => {
    expect(normalizePdfText('合同总金额：人 \u2EA0币 113 万元')).toBe('合同总金额:人民币 113 万元');
  });

  it('模型的风险必须能在原文找到引用', () => {
    const r = verifyLlmRisks([{ title: '先款后票', quote: '乙方收到货款后开具发票', level: 'warn' }, { title: '编的', quote: '甲方承担全部税费' }], text, []);
    expect(r.map((x) => x.title)).toEqual(['先款后票']);
  });

  it('模型复述规则已抓到的同一句原文，不重复列', () => {
    const rules = ruleFindings(text);
    const r = verifyLlmRisks([{ title: '收款方与签约方不一致', quote: '付款至乙方个人账户', level: 'high' }], text, rules);
    expect(r).toEqual([]);
  });

  it('内置知识库能检索到小规模免征', () => {
    expect(searchBuiltin('小规模纳税人季度多少万以下免征增值税')[0].id).toBe('vat_small_exempt');
  });
});

describe('申报上报', () => {
  it('申报期限：所属期结束后次月 15 日；季度 Q4 跨年', async () => {
    const { dueDateOf } = await import('./filing');
    expect(dueDateOf('2026-08')).toBe('2026-09-15');
    expect(dueDateOf('2026-12')).toBe('2027-01-15');
    expect(dueDateOf('2026-Q3')).toBe('2026-10-15');
    expect(dueDateOf('2026-Q4')).toBe('2027-01-15');
  });

  it('待报事项：季末月带所得税预缴，零税额也要报', async () => {
    const { buildFilingItems } = await import('./filing');
    const run: any = { period: '2026-09', result: { vatPayable: 0, surchargeTotal: 0, citPayable: 1200, iit: [{}], iitTotal: 30 } };
    expect(buildFilingItems(run).map((i) => [i.tax, i.amount])).toEqual([['vat', 0], ['surcharge', 0], ['cit', 1200], ['iit', 30]]);
    expect(buildFilingItems({ ...run, period: '2026-08', result: { ...run.result, iit: [] } }).map((i) => i.tax)).toEqual(['vat', 'surcharge']);
  });

  it('本期期限：小规模按季报增值税，已申报的标完成', async () => {
    const { upcomingDeadlines } = await import('./filing');
    const small = { ...LEDGER, taxpayerType: 'small' as const };
    const filings: any = [{ period: '2026-Q3', items: [{ tax: 'vat', status: 'filed' }] }];
    const d = upcomingDeadlines(small, filings, '2026-10-08');
    const vat = d.find((x) => x.tax === 'vat')!;
    expect([vat.period, vat.due, vat.daysLeft, vat.done]).toEqual(['2026-Q3', '2026-10-15', 7, true]);
    expect(d.find((x) => x.tax === 'iit')!.period).toBe('2026-09');
  });
});
