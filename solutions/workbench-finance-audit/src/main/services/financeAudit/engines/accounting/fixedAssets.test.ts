/**
 * A6 固定资产：四种方法的折旧重算、与账面差异、应提未提、当月新增、资产滚动表、处置损益与分录（期望值见夹具注释）。
 */
import { describe, expect, it } from 'vitest';
import * as FX from '../../__fixtures__/accounting/subledgers';
import { parse } from '../../__fixtures__/accounting/parse';
import { thresholdsFor } from '../../thresholds';
import { accumAfter, fixedAssetsReview, methodOf, monthDiff } from './fixedAssets/engine';

const Y = (yuan: number) => Math.round(yuan * 100);
const res = fixedAssetsReview({
  period: FX.PERIOD, register: parse('fa_register', FX.FA_REGISTER).rows, movements: parse('fa_movement', FX.FA_MOVEMENTS).rows,
  tb: null, cnCodes: true, th: thresholdsFor('fixed-assets'),
});
const a = (no: string) => res.lines.find((l) => l.assetNo === no)!;
const codes = (no: string) => a(no).flags.map((f) => f.code);

describe('A6 折旧重算', () => {
  it('方法认读与月份口径', () => {
    expect(['直线法', '平均年限法', '双倍余额递减法', 'Sum of years digits', 'وحدات الإنتاج', '自定义'].map((m) => methodOf(m).method)).toEqual(['straight_line', 'straight_line', 'ddb', 'syd', 'units', 'straight_line']);
    expect(methodOf('自定义').known).toBe(false);
    expect(monthDiff('2025-01', '2026-09')).toBe(20);
  });

  it('直线法：本期与累计和账面一致；差 62.50 超容差标出', () => {
    expect(a('FA-001')).toMatchObject({ expectedPeriod: Y(1900), expectedAccum: Y(39900), diffPeriod: 0, diffAccum: 0 });
    expect(codes('FA-001')).toEqual([]);
    expect(a('FA-002')).toMatchObject({ expectedPeriod: Y(5937.5), diffPeriod: Y(62.5) });
    expect(codes('FA-002')).toEqual(['asset.dep_diff']);
  });

  it('双倍余额递减法：第 2 年按年初净值 × 2 / n；最后两年改直线', () => {
    expect(a('FA-003')).toMatchObject({ expectedPeriod: Y(200), expectedAccum: Y(4200) });
    // 10,000 / 残值 500 / 5 年：4,000 + 2,400 + 1,440 + 830 + 830 = 9,500 = 原值 − 残值
    expect(accumAfter('ddb', Y(9500), Y(10000), Y(500), 60, 60)).toBe(Y(9500));
    expect(accumAfter('ddb', Y(9500), Y(10000), Y(500), 60, 48)).toBe(Y(8670));
  });

  it('年数总和法：第 1 年 18,000 → 每月 1,500；账面本期 0 → 应提未提（阻断）', () => {
    expect(a('FA-004')).toMatchObject({ expectedPeriod: Y(1500), expectedAccum: Y(12000) });
    expect(a('FA-004').flags).toContainEqual({ code: 'asset.not_depreciated', level: 'block' });
    expect(accumAfter('syd', Y(36000), Y(36000), 0, 36, 36)).toBe(Y(36000));
  });

  it('当月新增不提折旧；处置当月照提', () => {
    expect(a('FA-005')).toMatchObject({ expectedPeriod: 0, expectedAccum: 0 });
    expect(codes('FA-005')).toContain('asset.early_dep');
    expect(a('FA-006')).toMatchObject({ expectedPeriod: Y(791.67), expectedAccum: Y(38000) });
  });
});

describe('A6 滚动表、购置与处置', () => {
  it('滚动表：期初 + 新增 − 处置 = 期末，本期折旧合计', () => {
    const sum = (k: 'openingCost' | 'additions' | 'disposals' | 'closingCost' | 'depreciation') => res.roll.reduce((s, r) => s + r[k], 0);
    expect([sum('openingCost'), sum('additions'), sum('disposals'), sum('closingCost')]).toEqual([Y(516000), Y(3000), Y(50000), Y(469000)]);
    expect(sum('depreciation')).toBe(Y(10329.17));
    for (const r of res.roll) expect(r.openingAccum + r.depreciation - r.disposalAccum).toBe(r.closingAccum);
  });

  it('处置：净值 12,000、净收入 14,500、收益 2,500；分录借贷各 68,000', () => {
    expect(res.disposals).toEqual([expect.objectContaining({ assetNo: 'FA-006', nbv: Y(12000), net: Y(14500), gainLoss: Y(2500) })]);
    const dr = res.je.reduce((s, l) => s + l.debit, 0);
    const cr = res.je.reduce((s, l) => s + l.credit, 0);
    expect([dr, cr]).toEqual([Y(68000), Y(68000)]);
    expect(res.je.find((l) => l.accountCode === '6115')).toMatchObject({ credit: Y(2500), nameIsKey: true });
  });

  it('购置：低于资本化门槛提示', () => {
    expect(res.additions).toEqual([expect.objectContaining({ assetNo: 'FA-005', amount: Y(3000), flags: [expect.objectContaining({ code: 'asset.below_cap' })] })]);
    expect(res.escalations.some((e) => e.key.includes('应提未提'))).toBe(true);
  });

  it('与总账核对：原值与累计折旧', () => {
    const r = fixedAssetsReview({
      period: FX.PERIOD, register: parse('fa_register', FX.FA_REGISTER).rows, movements: [], cnCodes: true, th: thresholdsFor('fixed-assets'),
      tb: [
        { row: 2, accountCode: '1601', accountName: '固定资产', level: 1, openingDr: 0, openingCr: 0, periodDr: 0, periodCr: 0, closingDr: Y(469000), closingCr: 0 },
        { row: 3, accountCode: '1602', accountName: '累计折旧', level: 1, openingDr: 0, openingCr: 0, periodDr: 0, periodCr: 0, closingDr: 0, closingCr: Y(160000) },
      ],
    });
    expect(r.glTie!.find((g) => g.item === 'cost')!.diff).toBe(0);
    // 未处置资产的账面累计：39,900 + 106,937.50 + 4,200 + 10,500 + 100 = 161,637.50
    expect(r.glTie!.find((g) => g.item === 'accum')).toMatchObject({ register: Y(161637.5), diff: Y(1637.5) });
  });
});
