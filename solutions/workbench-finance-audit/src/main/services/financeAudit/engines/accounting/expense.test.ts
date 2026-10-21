/**
 * A5 费用报销稽核：复用财务智能体预审规则 + 超标率分档 + 提交时限 + ZATCA 二维码 + 异常模式（期望值见夹具注释）。
 */
import { describe, expect, it } from 'vitest';
import * as FX from '../../__fixtures__/accounting/subledgers';
import { parse } from '../../__fixtures__/accounting/parse';
import { thresholdsFor } from '../../thresholds';
import { canonicalCategory, expenseReview } from './expense/engine';
import { checkZatcaQr, decodeTlv } from './expense/zatca';

const lines = parse('expense_claim', FX.CLAIMS).rows;
const res = expenseReview({ asOf: FX.AS_OF, lines, company: { name: '泰途测试集团', taxId: '' }, th: thresholdsFor('expense'), anomalyOnly: false });
const claim = (no: string) => res.claims.find((c) => c.claimNo === no)!;
const codes = (row: number) => res.lines.find((l) => l.row === row)!.flags.map((f) => f.code);

describe('A5 逐单结论', () => {
  it('通过 / 需补正 / 驳回 / 升级', () => {
    expect(Object.fromEntries(res.claims.map((c) => [c.claimNo, c.verdict]))).toEqual({
      'EXP-1': 'escalate', 'EXP-2': 'reject', 'EXP-3': 'escalate', 'EXP-4': 'escalate', 'EXP-5': 'pass', 'EXP-6': 'escalate', 'EXP-7': 'reject', 'EXP-8': 'review',
    });
    expect(res.counts).toEqual({ pass: 1, review: 1, reject: 2, escalate: 4 });
  });

  it('超标率分档替代财务智能体的「超标即驳回」；同票多报沿用它的查重', () => {
    expect(codes(3)).toContain('exp.over_review');
    expect(codes(4)).toContain('exp.over_reject');
    expect(codes(12)).toContain('exp.over_minor');
    expect(codes(3)).not.toContain('inv.over_cap');
    expect(codes(2)).toContain('inv.duplicate');
    expect(codes(5)).toContain('inv.duplicate');
    expect(claim('EXP-1').reasons.some((r) => r.code === 'exp.over_review')).toBe(true);
  });

  it('提交时限 > 90 天驳回', () => {
    expect(codes(11)).toContain('exp.late_reject');
  });

  it('费用类别英文 / 阿语别名归到财务智能体的类别', () => {
    expect(canonicalCategory('Travel')).toBe('差旅费');
    expect(canonicalCategory('ضيافة')).toBe('业务招待费');
    expect(canonicalCategory('自定义类别')).toBe('自定义类别');
  });
});

describe('A5 ZATCA 二维码', () => {
  it('TLV 解码：五个标签、阿语卖方名称', () => {
    const f = decodeTlv(FX.qr('شركة المثال', '300000000000003', '2026-09-14T10:00:00Z', '1150.00', '150.00'))!;
    expect(f.map((x) => x.tag)).toEqual([1, 2, 3, 4, 5]);
    expect(f[0].value).toBe('شركة المثال');
    expect(decodeTlv('not base64 !!')).toBeNull();
  });
  it('与票面核对：总额不一致、税号格式、解不开', () => {
    expect(res.lines.find((l) => l.row === 6)!.qr).toMatchObject({ ok: false, problems: ['total'], total: 125000, vat: 15000, phase: 1 });
    expect(res.lines.find((l) => l.row === 7)!.qr).toMatchObject({ ok: true, sellerName: 'شركة المثال', vatNo: '300000000000003' });
    expect(checkZatcaQr(FX.qr('X', '123', '2026-09-14T00:00:00Z', '1.00', '0.13'), { sellerName: 'X', sellerTaxId: '', invoiceDate: '2026-09-14', total: 100, tax: 13 }).problems).toEqual(['vat_no_format']);
    expect(checkZatcaQr('', { sellerName: '', sellerTaxId: '', invoiceDate: '', total: 0, tax: 0 }).problems).toEqual(['decode']);
  });
});

describe('A5 异常模式', () => {
  const a = (code: string) => res.anomalies.filter((x) => x.code === code);
  it('同票多报（阻断）、拆单（阻断）与贴近审批边界（提醒）', () => {
    expect(a('duplicate')).toEqual([expect.objectContaining({ level: 'block', subject: '00000001', count: 2 })]);
    expect(a('split').map((x) => [x.level, x.count])).toEqual([['block', 3], ['warn', 2]]);
  });
  it('周末、整数金额只提醒；连号识别', () => {
    expect(a('weekend').some((x) => x.subject === '钱七')).toBe(true);
    expect(a('round_amount').find((x) => x.subject === '钱七')?.count).toBe(2);
    const seq = expenseReview({
      asOf: FX.AS_OF, company: { name: '泰途测试集团', taxId: '' }, th: thresholdsFor('expense'), anomalyOnly: true,
      lines: [{ ...lines[0], row: 90, invoiceNo: '12345678' }, { ...lines[0], row: 91, invoiceNo: '12345679', claimNo: 'X' }],
    });
    expect(seq.anomalies.find((x) => x.code === 'sequential')?.rows).toEqual([90, 91]);
    expect(seq.lines.every((l) => !l.flags.length)).toBe(true);
  });
});
