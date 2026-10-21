/**
 * C3 转让定价（四分位与手算一致、落点与调整额、三层文档门槛）与 C2 披露阈值判断（上交所 / 沙特 / 国际）。
 */
import { describe, expect, it } from 'vitest';
import type { RegionRule } from '@totalclaw/core-domain';
import SEED from '../../../processLibrary/seeds/region-rules.json';
import * as FX from '../../__fixtures__/tax';
import { thresholdsFor } from '../../thresholds';
import { RuleBook } from './common';
import { quartileInc, rptSummary, tpAdjustment, tpDocRequirements, tpPosition, tpRange } from './tp';
import { disclosureItems, reportingChecks } from './disclosure';

const RULES = SEED as unknown as RegionRule[];

describe('转让定价：四分位（QUARTILE.INC 口径）', () => {
  it('与手算一致：Q1 4.5%、中位值 6%、Q3 9%；缺数据的不参与', () => {
    const { comparables, range } = tpRange(FX.comparables, 'ncp');
    expect(range!.n).toBe(7);
    expect(range!.q1).toBeCloseTo(FX.TP.q1, 12);
    expect(range!.median).toBeCloseTo(FX.TP.median, 12);
    expect(range!.q3).toBeCloseTo(FX.TP.q3, 12);
    expect([range!.min, range!.max]).toEqual([0.03, 0.12]);
    expect(comparables.find((c) => c.row === 9)!.included).toBe(false);
  });

  it('偶数个样本的插值（1,2,3,4 → Q1 1.75、中位 2.5、Q3 3.25）', () => {
    expect([quartileInc([1, 2, 3, 4], 0.25), quartileInc([1, 2, 3, 4], 0.5), quartileInc([1, 2, 3, 4], 0.75)]).toEqual([1.75, 2.5, 3.25]);
  });

  it('受测方低于下四分位，按中位值调整 28,200', () => {
    const { range } = tpRange(FX.comparables, 'ncp');
    const t = FX.TP.tested;
    const pli = t.operatingProfit / t.totalCost;
    const pos = tpPosition(pli, range);
    expect(pos).toBe('below');
    expect(tpAdjustment(t, 'ncp', range, pos)).toEqual({ toPli: range!.median, amount: FX.TP.adjustment });
    expect(tpPosition(0.05, range)).toBe('within');
    expect(tpPosition(0.1, range)).toBe('above');
  });

  it('中国三层文档：有形资产 > 2 亿 → 本地文档；合计 < 10 亿 → 不须主体文档；集团收入 > 55 亿 → 国别报告', () => {
    const { rpt, total } = rptSummary(FX.rptRows);
    expect(total).toBe(28_000_000_000);
    const docs = tpDocRequirements({
      jurisdiction: 'CN', rpt, rptTotal: total, entityRevenue: 0, groupRevenue: 600_000_000_000, groupHasMasterFile: false,
      prepared: { disclosure: false, master: false, local: true, cbcr: false }, intlCbcrThreshold: 0, rules: new RuleBook(RULES, '2025-12-31', 'CN'),
    });
    const req = Object.fromEntries(docs.map((d) => [d.id, d.required]));
    expect(req).toEqual({ master: false, local: true, cbcr: true });
  });

  it('沙特：关联交易 > 600 万须披露表，> 4800 万须主体与本地文档；阿联酋按本主体收入 2 亿或集团收入 31.5 亿', () => {
    const sa = tpDocRequirements({
      jurisdiction: 'SA', rpt: [], rptTotal: 1_000_000_000, entityRevenue: 0, groupRevenue: 0, groupHasMasterFile: false,
      prepared: { disclosure: false, master: false, local: false, cbcr: false }, intlCbcrThreshold: 0, rules: new RuleBook(RULES, '2025-12-31', 'SA'),
    });
    expect(Object.fromEntries(sa.map((d) => [d.id, d.required]))).toEqual({ disclosure: true, master: false, local: false, cbcr: false });
    const ae = tpDocRequirements({
      jurisdiction: 'AE', rpt: [], rptTotal: 0, entityRevenue: 25_000_000_000, groupRevenue: 0, groupHasMasterFile: false,
      prepared: { disclosure: false, master: false, local: false, cbcr: false }, intlCbcrThreshold: 0, rules: new RuleBook(RULES, '2025-12-31', 'AE'),
    });
    expect(Object.fromEntries(ae.map((d) => [d.id, d.required]))).toEqual({ master: true, local: true, cbcr: false });
  });
});

describe('信息披露：阈值判断', () => {
  it('上交所口径：须披露 4 项、提交股东大会 2 项、不需要 1 项', () => {
    const items = disclosureItems(FX.events, 'cn_sse', FX.DISCLOSURE_BASE, thresholdsFor('regulatory'), null);
    const by = (l: string) => items.filter((i) => i.level === l).map((i) => i.row);
    expect(by('shareholder')).toEqual([7, 8]);
    expect(by('disclose')).toEqual([2, 3, 4, 6]);
    expect(by('none')).toEqual([5]);
    expect(items.find((i) => i.row === 3)!.tests.find((t) => t.hit)!.id).toBe('assets');
    expect(FX.DISCLOSURE).toEqual({ shareholder: 2, disclose: 4, none: 1 });
  });

  it('沙特口径：资产交易按净资产 10%，关联交易按营业收入 1%（规则表）', () => {
    const rules = new RuleBook(RULES, '2026-09-30', 'SA');
    const items = disclosureItems(FX.events, 'sa_cma', FX.DISCLOSURE_BASE, thresholdsFor('regulatory'), rules);
    // 净资产 1 亿：E1 1200 万 12% ✓、E2 900 万 ✗、担保 100 万 1% ✗、E6 6000 万 ✓；营业收入 5 亿：关联交易 350 万 0.7% ✗、3500 万 7% ✓
    expect(items.filter((i) => i.level === 'disclose').map((i) => i.row)).toEqual([2, 7, 8]);
    expect(rules.draft()).toBe(true);
  });

  it('国际口径：关联方交易在附注披露，其它按重要性', () => {
    const items = disclosureItems(FX.events, 'intl', FX.DISCLOSURE_BASE, thresholdsFor('regulatory'), null);
    expect(items.filter((i) => i.level === 'notes').map((i) => i.row)).toEqual([4, 5, 8]);
    // 净利润 2000 万 × 5% = 100 万：E1 / E2 / E5 担保 100 万 / E6 都达到
    expect(items.filter((i) => i.level === 'disclose').map((i) => i.row)).toEqual([2, 3, 6, 7]);
  });

  it('报送数据核查：重复、金额为 0、分母缺失', () => {
    const dup = [...FX.events, { ...FX.events[0], row: 9 }, { ...FX.events[1], row: 10, amount: 0, date: '2026-01-01' }];
    const fs = reportingChecks(dup, { label: '2026-09', from: '2026-09-01', to: '2026-09-30', days: 30 }, { ...FX.DISCLOSURE_BASE, revenue: 0 });
    expect(fs.find((f) => f.id === 'ev_duplicate')?.rows).toEqual([9]);
    expect(fs.find((f) => f.id === 'ev_zero')?.rows).toEqual([10]);
    expect(fs.find((f) => f.id === 'ev_out_of_period')?.rows).toEqual([10]);
    expect(fs.some((f) => f.id === 'base_revenue')).toBe(true);
  });
});
