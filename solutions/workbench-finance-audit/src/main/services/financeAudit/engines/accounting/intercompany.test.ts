/**
 * A8 合并与内部往来：有向双边匹配（复用 A2 引擎）、抵销分录借贷平衡、挂账超期、担保超限 / 到期 / 未审批、内部定价偏离（期望值见夹具注释）。
 */
import { describe, expect, it } from 'vitest';
import * as FX from '../../__fixtures__/accounting/subledgers';
import { parse } from '../../__fixtures__/accounting/parse';
import { thresholdsFor } from '../../thresholds';
import { classifyIc, intercompanyReview } from './intercompany/engine';

const Y = (yuan: number) => Math.round(yuan * 100);
const res = intercompanyReview({ period: FX.PERIOD, rows: parse('intercompany', FX.IC).rows, guarantees: parse('guarantee', FX.GUARANTEES).rows, cnCodes: true, th: thresholdsFor('intercompany') });
const pair = (p: string, e: string, c: string) => res.pairs.find((x) => x.pair === p && x.entity === e && x.counterparty === c)!;

describe('A8 内部往来', () => {
  it('往来类型归类（中英阿）', () => {
    expect(classifyIc('其他应收款', 1)).toEqual({ pair: 'arap', side: 'asset' });
    expect(classifyIc('Intercompany loan payable', 1)).toEqual({ pair: 'loan', side: 'liab' });
    expect(classifyIc('إيرادات الفوائد', 1)).toEqual({ pair: 'interest', side: 'asset' });
    expect(classifyIc('', -5)).toEqual({ pair: 'other', side: 'liab' });
  });

  it('双边匹配：逐单与按余额两种粒度，负数导出整体翻正', () => {
    expect(pair('arap', '母公司', '子公司A')).toMatchObject({ own: Y(150000), other: Y(145000), diff: Y(5000), matched: 1, breaks: 1, eliminated: Y(145000) });
    expect(pair('sales', '母公司', '子公司A')).toMatchObject({ diff: 0, eliminated: Y(80000) });
    expect(pair('loan', '母公司', '子公司B')).toMatchObject({ diff: 0, eliminated: Y(200000) });
    expect(pair('arap', '子公司A', '子公司B')).toMatchObject({ own: Y(28000), other: Y(30000), diff: Y(-2000), eliminated: Y(28000) });
    expect(pair('arap', '子公司A', '母公司')).toMatchObject({ own: Y(12000), other: 0, eliminated: 0 });
    expect(res.breaks.map((b) => [b.key, b.cls])).toEqual(expect.arrayContaining([['IC-002', 'amount'], ['BALANCE', 'amount'], ['OT-9', 'gl_only']]));
    expect(res.breaks).toHaveLength(3);
  });

  it('抵销分录借贷平衡，合计 453,000；只抵两边都有的部分', () => {
    expect(res.balanced).toBe(true);
    expect(res.je.reduce((s, l) => s + l.debit, 0)).toBe(Y(453000));
    expect(res.je.reduce((s, l) => s + l.credit, 0)).toBe(Y(453000));
    expect(res.je.filter((l) => l.accountCode === '1122').reduce((s, l) => s + l.credit, 0)).toBe(Y(145000 + 28000));
  });

  it('挂账 > 30 天、定价偏离 > 5% 升级', () => {
    expect(res.stale).toBe(1);
    expect(res.pricing!.filter((p) => p.flagged).map((p) => Math.round(p.deviation * 1000) / 1000)).toEqual([0.111, -0.143]);
    expect(res.escalations.map((e) => e.key).join('|')).toContain('定价偏离');
  });

  it('担保：超净资产 50%、3 个月内到期、未审批、过期仍有效', () => {
    const g = (b: string) => res.guarantees!.find((x) => x.beneficiary === b)!.flags.map((f) => f.code);
    expect(res.guarantees![0].ratio).toBeCloseTo(7 / 12, 6);
    expect(g('子公司A')).toEqual(expect.arrayContaining(['gua.over_limit', 'gua.expiring']));
    expect(g('子公司B')).toEqual(expect.arrayContaining(['gua.over_limit', 'gua.unapproved']));
    expect(g('外部公司')).toEqual(expect.arrayContaining(['gua.expired_active', 'gua.no_net_assets']));
  });
});
