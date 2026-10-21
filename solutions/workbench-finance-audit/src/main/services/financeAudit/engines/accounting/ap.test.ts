/**
 * A4 应付与三单匹配：差异分级、可付 / 暂扣、付款优先级与资金分配、供应商复核（期望值见夹具注释，手算）。
 */
import { describe, expect, it } from 'vitest';
import * as FX from '../../__fixtures__/accounting/subledgers';
import { parse } from '../../__fixtures__/accounting/parse';
import { thresholdsFor } from '../../thresholds';
import { apAnalysis, threeWayMatch } from './ap/engine';

const Y = (yuan: number) => Math.round(yuan * 100);
const th = thresholdsFor('ap');
const input = {
  asOf: FX.AS_OF, items: parse('ap', FX.AP).rows, po: parse('po', FX.PO).rows, grn: parse('grn', FX.GRN).rows,
  invoices: parse('invoice', FX.INVOICES).rows, suppliers: parse('supplier', FX.SUPPLIERS).rows, funds: parse('funds', FX.FUNDS).rows,
  history: [] as string[][], th, match: true, plan: true, review: true,
};
const res = apAnalysis(input);
const line = (po: string, ln: string) => res.match!.find((l) => l.poNo === po && l.line === ln)!;

describe('A4 三单匹配', () => {
  it('差异分级与手算一致', () => {
    expect(line('PO-001', '1')).toMatchObject({ qty: 'full', grade: 'match', payable: Y(5000), hold: 0 });
    expect(line('PO-001', '2')).toMatchObject({ grade: 'within_tol', priceDiff: Y(40), payable: Y(2000), hold: Y(40) });
    expect(line('PO-002', '1')).toMatchObject({ qty: 'over_invoiced', grade: 'review', payable: Y(8000), hold: Y(2000) });
    expect(line('PO-003', '1')).toMatchObject({ qty: 'partial', price: 'reject', tax: 'lower', grade: 'reject', payable: 0, hold: Y(900) });
    expect(line('PO-004', '1')).toMatchObject({ qty: 'not_received', grade: 'reject', payable: 0, hold: Y(4000) });
    expect(res.matchCounts).toEqual({ match: 1, within_tol: 1, review: 1, reject: 2 });
    for (const l of res.match!) expect(l.payable + l.hold).toBe(l.invAmount);
  });

  it('没有对应订单的发票升级；同一供应商连续 3 期不符升级', () => {
    expect(res.escalations.some((e) => e.key.includes('没有对应的采购订单') && e.params?.p0 === 'INV-9999')).toBe(true);
    const r = threeWayMatch(input.po, input.grn, input.invoices, th);
    expect(r.orphanInvoices.map((x) => x.docNo)).toEqual(['INV-9999']);
    const again = apAnalysis({ ...input, plan: false, review: false, history: [['华东材料'], ['华东材料']] });
    expect(again.escalations.some((e) => e.key.includes('连续') && e.params?.n === 3)).toBe(true);
  });
});

describe('A4 付款计划与供应商复核', () => {
  const plan = res.plan!;
  const pl = (doc: string) => plan.lines.find((l) => l.docNo === doc)!;
  it('优先级 P0–P4', () => {
    expect([pl('INV-7001').priority, pl('INV-9002').priority, pl('INV-8001').priority, pl('INV-7002').priority, pl('INV-9001').priority, pl('INV-9003').priority, pl('INV-9004').priority])
      .toEqual(['P0', 'P0', 'P1', 'P2', 'P2', 'P3', 'P4']);
    expect(pl('INV-7001')).toMatchObject({ overdueDays: 60, overdueLevel: 'warning' });
    expect(pl('INV-8001').approval).toBe('l1');
  });

  it('资金按优先级分配到用完，暂扣含税；合计勾稽', () => {
    expect(plan.available).toBe(Y(63000));
    expect(pl('INV-8001').scheduled).toBe(true);
    expect(pl('INV-9001')).toMatchObject({ scheduled: true, hold: Y(45.2) });
    expect(pl('INV-9003')).toMatchObject({ scheduled: false, hold: Y(981) });
    expect(plan.scheduledTotal).toBe(Y(57910));
    expect(plan.heldTotal).toBe(Y(66846.2));
    expect(plan.deferredTotal).toBe(0);
    expect(plan.scheduledTotal + plan.deferredTotal + plan.heldTotal).toBe(Y(124756.2));
    expect(plan.due30).toBe(Y(120236.2));
    expect(plan).toMatchObject({ gap: Y(57236.2), gapTier: 'small' });
  });

  it('账户变更、疑似个人账户暂停付款；关联方与集中度附条件', () => {
    const s = (n: string) => res.suppliers.find((x) => x.supplier === n)!;
    expect(s('南方电机')).toMatchObject({ conclusion: 'hold' });
    expect(s('南方电机').flags.map((f) => f.code)).toContain('sup.account_changed');
    expect(s('西部物流').flags.map((f) => f.code)).toContain('sup.personal_account');
    expect(s('战略伙伴')).toMatchObject({ conclusion: 'conditional' });
    expect(s('战略伙伴').flags.map((f) => f.code).sort()).toEqual(['sup.concentration', 'sup.related_party']);
    expect(s('华东材料').conclusion).toBe('approve');
    expect(pl('INV-7001').holdReason?.code).toBe('plan.hold_supplier');
  });
});
