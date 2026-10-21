import { describe, expect, it } from 'vitest';
import { thresholdsFor } from '../../thresholds';
import * as F from '../../__fixtures__/accounting/close';
import { closeChecklist } from './close/checklist';
import { trialBalance, diffTier } from './close/trial';
import { crossPeriod, summaryDate } from './close/crossPeriod';
import { accrualSchedule } from './close/accrual';
import { rollForward } from './close/rollForward';
import { fluxFacts, fluxLines } from './close/flux';
import type { FauAccountMapEntry } from '@totalclaw/ipc-contracts';
import type { ManualChecklist, TbRow } from '../../types';

const th = thresholdsFor('close');

describe('A1 试算与勾稽（中国准则，复用财务智能体 buildStatements）', () => {
  const r = trialBalance({ tb: F.tb, tbPrior: F.tbPrior, journal: F.journalInPeriod, reportBasis: 'cn', accountMap: [], th });
  it('试算平衡；四项勾稽 + 期初衔接全部 TRUE', () => {
    expect(r.balanced).toBe(true);
    // 借方合计 1,144,040.00（手算见夹具注释）
    expect(r.totals.closingDr).toBe(114404000);
    expect(r.totals.closingCr).toBe(114404000);
    const byId = Object.fromEntries(r.checks.map((c) => [c.id, c]));
    for (const id of ['trial', 'bs', 'np_retained', 'cashflow', 'opening']) expect(byId[id]?.ok, id).toBe(true);
    // 净利润 −12,050.00；资产 918,990.00
    expect(byId.np_retained.left).toBe(F.expected.netProfit);
    expect(byId.bs.left).toBe(91899000);
    expect(byId.cashflow.left).toBe(-6005000);
  });
  it('借贷差异分档：≤0.01 忽略 / ≤100 定位 / ≤1000 停止 / >1000 停止并通知经理', () => {
    expect(diffTier(1, th)).toBe('ignore');
    expect(diffTier(5000, th)).toBe('locate');
    expect(diffTier(50000, th)).toBe('stop');
    expect(diffTier(500000, th)).toBe('stop_notify');
    const broken: TbRow[] = F.tb.map((x) => (x.accountCode === '1001' ? { ...x, closingDr: x.closingDr + 50000 } : x));
    const bad = trialBalance({ tb: broken, tbPrior: F.tbPrior, journal: F.journalInPeriod, reportBasis: 'cn', accountMap: [], th });
    expect(bad.balanced).toBe(false);
    expect(bad.checks[0].tier).toBe('stop');
  });
  it('上期期末与本期期初对不上时，逐科目列出', () => {
    const prior = F.tbPrior.map((x) => (x.accountCode === '1122' ? { ...x, closingDr: x.closingDr + 100 } : x));
    const res = trialBalance({ tb: F.tb, tbPrior: prior, journal: F.journalInPeriod, reportBasis: 'cn', accountMap: [], th });
    const op = res.checks.find((c) => c.id === 'opening')!;
    expect(op.ok).toBe(false);
    expect(op.details?.map((d) => d.accountCode)).toEqual(['1122']);
  });
  it('IFRS 口径按科目映射算三项勾稽', () => {
    const map: FauAccountMapEntry[] = [
      ['1000', 'asset', 'cash'], ['1100', 'asset', 'ar'], ['1500', 'asset', 'fixed'], ['2000', 'liability', 'ap'],
      ['3000', 'equity', 'paidIn'], ['3100', 'equity', 'retained'], ['4000', 'revenue', 'revenue'], ['5000', 'expense', 'cost'], ['6000', 'expense', 'admin'],
    ].map(([code, cls, line]) => ({ code, name: '', cls: cls as FauAccountMapEntry['cls'], line, source: 'manual' as const }));
    const res = trialBalance({ tb: F.ifrsTb, tbPrior: null, journal: [], reportBasis: 'ifrs', accountMap: map, th });
    const byId = Object.fromEntries(res.checks.map((c) => [c.id, c]));
    expect(byId.trial.ok).toBe(true);
    expect(byId.bs.ok).toBe(true);
    // 净利润 25,000 − 12,000 − 5,000 = 8,000 = 未结转损益增加
    expect(byId.np_retained.left).toBe(800000);
    expect(byId.np_retained.ok).toBe(true);
    expect(byId.opening.ok).toBe(false);
  });
});

describe('A1 关账清单', () => {
  const base = {
    period: F.PERIOD, journal: F.journalInPeriod, tb: F.tb, trialBalanced: true, bankReconDone: true, accrualRan: true, fxRates: [], hasForeignCurrency: false,
  };
  const allOk = (): ManualChecklist => Object.fromEntries(
    ['oa_freeze', 'erp_period_close', 'ar_ap_clearing', 'cost_calc', 'expense_allocation', 'revenue', 'purchase', 'payroll', 'asset_count', 'invoice_archive', 'tax_filing']
      .map((id) => [id, { mark: 'ok' as const }]),
  );
  it('15 项；折旧、银行对账、计提、汇率自动判；1 个非主线 ❌ + 2 个 ⚠️ 可以开始结账', () => {
    const manual = { ...allOk(), erp_period_close: { mark: 'fail' as const }, asset_count: { mark: 'warn' as const }, invoice_archive: { mark: 'warn' as const } };
    const r = closeChecklist({ ...base, manual }, th);
    expect(r.items).toHaveLength(15);
    const dep = r.items.find((i) => i.id === 'depreciation')!;
    expect(dep.auto && dep.mark === 'ok' && dep.evidence === '记-0006').toBe(true);
    expect(r.items.find((i) => i.id === 'fx_rate')!.mark).toBe('ok');
    expect(r.counts).toEqual({ ok: 12, warn: 2, fail: 1, pending: 0 });
    expect(r.canStart).toBe(true);
  });
  it('主线项（往来核销）❌ 不能开始；❌ 超过 1 个不能开始；⚠️ 超过 3 个不能开始', () => {
    expect(closeChecklist({ ...base, manual: { ...allOk(), ar_ap_clearing: { mark: 'fail' } } }, th).canStart).toBe(false);
    expect(closeChecklist({ ...base, manual: { ...allOk(), oa_freeze: { mark: 'fail' }, cost_calc: { mark: 'fail' } } }, th).canStart).toBe(false);
    const fourWarn = { ...allOk(), oa_freeze: { mark: 'warn' as const }, cost_calc: { mark: 'warn' as const }, revenue: { mark: 'warn' as const }, purchase: { mark: 'warn' as const } };
    expect(closeChecklist({ ...base, manual: fourWarn }, th).canStart).toBe(false);
  });
  it('没有银行对账结果 / 没有折旧凭证 → 主线 ❌；没勾的项不算通过；试算不平不能开始', () => {
    const noBank = closeChecklist({ ...base, bankReconDone: false, manual: allOk() }, th);
    expect(noBank.items.find((i) => i.id === 'bank_recon')!.mark).toBe('fail');
    expect(noBank.canStart).toBe(false);
    const noDep = closeChecklist({ ...base, journal: F.journalInPeriod.filter((j) => j.voucherNo !== '记-0006'), manual: allOk() }, th);
    expect(noDep.items.find((i) => i.id === 'depreciation')!.mark).toBe('fail');
    const pending = closeChecklist({ ...base, manual: {} }, th);
    expect(pending.counts.pending).toBe(11);
    expect(pending.canStart).toBe(false);
    expect(closeChecklist({ ...base, trialBalanced: false, manual: allOk() }, th).canStart).toBe(false);
    expect(closeChecklist({ ...base, hasForeignCurrency: true, manual: allOk() }, th).items.find((i) => i.id === 'fx_rate')!.mark).toBe('fail');
  });
});

describe('A1 跨期调整', () => {
  const items = crossPeriod({ period: F.PERIOD, journal: F.journal, th });
  it('识别三类，一笔 6 万元跨期必须本期调整 + 批准人', () => {
    expect(items.map((i) => ({ voucherNo: i.voucherNo, type: i.type, amount: i.amount, approval: i.approval, adjustThisPeriod: i.adjustThisPeriod, days: i.days })))
      .toEqual(F.expected.crossPeriod);
    const big = items[0];
    expect(big.amountTier).toBe(4);
    expect(big.adjustThisPeriod && big.approval === 'approver').toBe(true);
  });
  it('付上月工资（只动往来与现金）不算跨期', () => {
    expect(items.some((i) => i.voucherNo === '记-0005')).toBe(false);
  });
  it('摘要日期：YYYY-MM-DD / YYYY年M月D日 / M月（跨年推断）', () => {
    expect(summaryDate('付 2026-08-15 运费', '2026-09-03')).toEqual({ date: '2026-08-15', month: '' });
    expect(summaryDate('2026年8月15日运费', '2026-09-03')).toEqual({ date: '2026-08-15', month: '' });
    expect(summaryDate('12月电费', '2027-01-05')).toEqual({ date: '', month: '2026-12' });
    expect(summaryDate('无日期', '2026-09-03')).toBeNull();
  });
  it('天数 > 90 也要批准人', () => {
    const j = F.journal.filter((x) => x.voucherNo === '记-0007').map((x) => ({ ...x, businessDate: '2026-05-01' }));
    const [it0] = crossPeriod({ period: F.PERIOD, journal: j, th });
    expect(it0.type).toBe('late');
    expect(it0.dayTier).toBe(4);
    expect(it0.approval).toBe('approver');
  });
});

describe('A1 计提表', () => {
  const r = accrualSchedule({ period: F.PERIOD, journal: F.journalInPeriod, tb: F.tb, policies: F.policies, th });
  it('三条政策金额与手算一致', () => {
    const by = Object.fromEntries(r.lines.map((l) => [l.policyId, l]));
    expect(by.P1.booked).toBe(200000);
    expect(by.P1.accrual).toBe(F.expected.accruals.P1);
    expect(by.P2.due).toBe(F.expected.accruals.P2);
    expect(by.P2.formula).toBe('100,000.00 / 12 = 8,333.33');
    expect(by.P3.base).toBe(10800000);
    expect(by.P3.accrual).toBe(F.expected.accruals.P3);
    expect(by.P1.note?.key).toBeTruthy(); // 自动冲回
  });
  it('分录草稿借贷平衡，凭证号 JT-期间-序号，列与通用凭证导入格式一致', () => {
    expect(r.je).toHaveLength(6);
    expect(r.je.reduce((a, l) => a + l.debit - l.credit, 0)).toBe(0);
    expect([...new Set(r.je.map((l) => l.voucherNo))]).toEqual(['JT-2026-09-01', 'JT-2026-09-02', 'JT-2026-09-03']);
    expect(Object.keys(r.je[0]).sort()).toEqual(['accountCode', 'accountName', 'aux', 'credit', 'date', 'debit', 'lineNo', 'source', 'summary', 'voucherNo']);
  });
  it('直线摊销最后一期吃余数；不在摊销期间不计提', () => {
    const last = accrualSchedule({ period: '2026-12', journal: [], tb: [], policies: [F.policies[1]], th });
    expect(last.lines[0].due).toBe(10000000 - 833333 * 11);
    const out = accrualSchedule({ period: '2027-01', journal: [], tb: [], policies: [F.policies[1]], th });
    expect(out.lines[0].accrual).toBe(0);
    expect(out.je).toHaveLength(0);
  });
});

describe('A1 滚动表', () => {
  const rows = rollForward({ period: F.PERIOD, journal: F.journal, tb: F.tb, accounts: [], th });
  it('设计好的未解释差额原样列出，不倒挤', () => {
    const r2241 = rows.find((r) => r.accountCode === '2241')!;
    expect(r2241.opening).toBe(2000000);
    expect(r2241.accruals).toBe(200000);
    expect(r2241.computed).toBe(2200000);
    expect(r2241.closing).toBe(2500000);
    expect(r2241.unexplained).toBe(F.expected.rollForwardUnexplained['2241']);
  });
  it('其它科目轧平；付款 / 计提 / 增加按摘要与对方科目归类；累计折旧按贷方看', () => {
    for (const r of rows.filter((x) => x.accountCode !== '2241')) expect(r.unexplained, r.accountCode).toBe(0);
    const pay = rows.find((r) => r.accountCode === '2211')!;
    expect(pay.accruals).toBe(5000000);
    expect(pay.payments).toBe(6000000);
    const dep = rows.find((r) => r.accountCode === '1602')!;
    expect(dep.opening).toBe(10000000);
    expect(dep.accruals).toBe(500000);
    expect(rows.some((r) => r.accountCode === '100201')).toBe(false); // 只取顶层
  });
  it('指定科目只出这些', () => {
    expect(rollForward({ period: F.PERIOD, journal: F.journal, tb: F.tb, accounts: ['2241'], th }).map((r) => r.accountCode)).toEqual(['2241']);
  });
});

describe('A1 波动说明（计算部分）', () => {
  const lines = fluxLines({ tb: F.tb, tbPrior: F.tbPrior, budget: F.budget, journal: F.journal, reportBasis: 'cn', th, period: F.PERIOD });
  it('超阈值或必评科目 ≥ 3 行', () => {
    expect(lines.map((l) => l.accountCode).sort()).toEqual(F.expected.fluxAccounts);
    expect(lines.find((l) => l.accountCode === '1001')!.reason).toBe('must_review');
  });
  it('管理费用：对上期 +48,000（92.31%），对预算 +40,000；驱动前三按往来单位 / 摘要聚合', () => {
    const l = lines.find((x) => x.accountCode === '6602')!;
    expect(l.current).toBe(10000000);
    expect(l.prior).toBe(5200000);
    expect(l.diffPrior).toBe(4800000);
    expect(l.diffBudget).toBe(4000000);
    expect(l.drivers.map((d) => [d.label, d.amount])).toEqual([['华南物业', 6000000], ['计提9月工资', 3000000], ['计提9月折旧', 500000]]);
    const facts = fluxFacts(l);
    expect(facts.amounts).toEqual(expect.arrayContaining([100000, 52000, 48000, 60000, 40000, 60000, 30000, 5000]));
    expect(facts.percents).toEqual([92.31, 66.67]);
  });
});
