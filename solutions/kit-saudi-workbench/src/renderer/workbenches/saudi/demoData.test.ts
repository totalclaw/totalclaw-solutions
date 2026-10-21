/**
 * 两个需求里标 ⚠ 的验收点，钉成测试防回归：
 *   D1-10「主选、备选两套 BOM 可切换，**切换后成本联动**」
 *   D2-12「把某证书改成过期，建议立刻从『有条件参与』翻转为『不参与』，**且总分不变也要翻转**」
 * 外加 D1-18 / D2-20 的增量重算：受影响与未受影响必须是算出来的，不是写死名单。
 */
import { describe, it, expect } from 'vitest';
import { buildCards, defaultState } from './demoData';
import { computeImpact } from './proofSwitch';

function card(cards: ReturnType<typeof buildCards>, id: string) {
  const found = cards.find((c) => c.id === id);
  if (!found) throw new Error(`卡片不存在: ${id}`);
  return found;
}

describe('D1-10 BOM 切换联动成本', () => {
  it('切到备选后报价重算，且金额确实不同（备选交换机更贵）', () => {
    const base = defaultState('rfq-quote');
    const primary = buildCards('rfq-quote', base);
    const alternate = buildCards('rfq-quote', { ...base, bomVariant: 'alternate' });

    const equipmentOf = (cards: ReturnType<typeof buildCards>) =>
      card(cards, 'pricing').calcLines!.find((l) => l.key === 'equipment')!.result;

    expect(equipmentOf(alternate)).toBeGreaterThan(equipmentOf(primary));
    expect(card(alternate, 'pricing').priceRange!.low)
      .toBeGreaterThan(card(primary, 'pricing').priceRange!.low);
  });

  it('切换只影响成本相关卡，产品匹配与信息缺口不动', () => {
    const base = defaultState('rfq-quote');
    const impact = computeImpact(
      buildCards('rfq-quote', base),
      buildCards('rfq-quote', { ...base, bomVariant: 'alternate' }),
      [{ label: 'BOM 方案', before: '主选', after: '备选' }],
      'v1', 'v2',
    );
    expect(impact.affectedCards).toContain('pricing');
    expect(impact.affectedCards).toContain('bom');
    expect(impact.unaffectedCards).toContain('match');
    expect(impact.unaffectedCards).toContain('gap');
  });
});

describe('D2-12 硬性门槛改判翻转决策', () => {
  const base = defaultState('bid-decision');

  it('基线：1 项无法满足 → 有条件参与 + 顶部红条', () => {
    const decision = card(buildCards('bid-decision', base), 'decision').decision!;
    expect(decision.recommendation).toContain('有条件参与');
    expect(decision.hardBlock).toBeTruthy();
  });

  it('把 ISO 证书改判为「无法满足」→ 结论翻成不参与，**评分一分不变**', () => {
    const before = buildCards('bid-decision', base);
    const after = buildCards('bid-decision', {
      ...base,
      gateOverrides: { 'ISO 27001': 'cannot' },
    });
    const beforeDecision = card(before, 'decision').decision!;
    const afterDecision = card(after, 'decision').decision!;

    expect(afterDecision.recommendation).toContain('不参与');
    expect(afterDecision.hardBlock).toContain('ISO 27001');
    // 这一条是需求的原话：总分不变也要翻转 —— 分数逐项相等
    expect(afterDecision.scores).toEqual(beforeDecision.scores);
  });

  it('把唯一的阻断项改判为「可补齐」→ 反向翻回有条件参与', () => {
    const after = buildCards('bid-decision', {
      ...base,
      gateOverrides: { '本地同类案例 3 年': 'closeable' },
    });
    const decision = card(after, 'decision').decision!;
    expect(decision.recommendation).toContain('有条件参与');
    expect(decision.hardBlock).toBeUndefined();
  });

  it('改判只影响门槛与决策卡，符合性矩阵与招标信息卡不动', () => {
    const impact = computeImpact(
      buildCards('bid-decision', base),
      buildCards('bid-decision', { ...base, gateOverrides: { 'ISO 27001': 'cannot' } }),
      [{ label: '硬性门槛 · ISO 27001', before: '可补齐', after: '无法满足' }],
      'v1', 'v2',
    );
    expect(impact.affectedCards).toEqual(expect.arrayContaining(['gate', 'decision']));
    expect(impact.unaffectedCards).toEqual(expect.arrayContaining(['compliance', 'tender', 'pricing']));
  });
});

describe('D2-20 Addendum 增量重算', () => {
  it('上传后数量 120→150，交付评分下降，硬性门槛与符合性矩阵不受影响', () => {
    const base = defaultState('bid-decision');
    const before = buildCards('bid-decision', base);
    const after = buildCards('bid-decision', { ...base, addendumApplied: true });

    const camerasOf = (cards: ReturnType<typeof buildCards>) =>
      card(cards, 'bom').bomPrimary!.find((r) => r.sku === 'IPC-4K-BLT-30')!.qty;
    expect(camerasOf(before)).toBe(120);
    expect(camerasOf(after)).toBe(150);

    const deliveryScore = (cards: ReturnType<typeof buildCards>) =>
      card(cards, 'decision').decision!.scores.find((sc) => sc.label === '交付')!.score;
    expect(deliveryScore(after)).toBeLessThan(deliveryScore(before));

    const impact = computeImpact(before, after, [{ label: 'Addendum 01', before: '未上传', after: '已上传' }], 'v1', 'v2');
    expect(impact.unaffectedCards).toEqual(expect.arrayContaining(['gate', 'compliance']));
  });
});

describe('D3-17 目标客户切换时监管事实逐字不变', () => {
  it('商业段落改写，监管与来源段落一字不动', () => {
    const base = defaultState('advisory-report');
    const household = card(buildCards('advisory-report', base), 'report').reportSections!;
    const commercial = card(buildCards('advisory-report', { ...base, segment: 'commercial' }), 'report').reportSections!;

    const pick = (sections: typeof household, id: string) => sections.find((sec) => sec.id === id)!;
    expect(pick(commercial, 'findings').body).not.toBe(pick(household, 'findings').body);
    // 监管基础事实：风险与核验、来源、需求与假设三段必须逐字相同
    for (const id of ['risks', 'sources', 'request']) {
      expect(pick(commercial, id).body).toBe(pick(household, id).body);
    }
  });
});

describe('D2-17 决策权重表可配', () => {
  const base = defaultState('bid-decision');

  it('权重来自数据包，改权重立刻反映到评分', () => {
    const withDefault = card(buildCards('bid-decision', base), 'decision').decision!;
    const withCustom = card(buildCards('bid-decision', base, {
      decisionWeights: [
        { key: 'qualification', label: '资质', weight: 40 },
        { key: 'technical', label: '技术 / 产品', weight: 10 },
      ],
    }), 'decision').decision!;

    expect(withDefault.scores).toHaveLength(7);
    expect(withCustom.scores).toHaveLength(2);
    expect(withCustom.scores[0].weight).toBe(40);
    // 达成率不变，权重翻倍 → 分数跟着涨
    expect(withCustom.scores[0].score).toBeGreaterThan(withDefault.scores[0].score);
  });

  it('改权重不改变硬性门槛的结论（硬性优先于总分）', () => {
    const blockedDefault = card(buildCards('bid-decision', {
      ...base, gateOverrides: { 'ISO 27001': 'cannot' },
    }), 'decision').decision!;
    const blockedHeavy = card(buildCards('bid-decision', {
      ...base, gateOverrides: { 'ISO 27001': 'cannot' },
    }, {
      decisionWeights: [{ key: 'qualification', label: '资质', weight: 100 }],
    }), 'decision').decision!;

    expect(blockedDefault.recommendation).toContain('不参与');
    // 把资质权重拉到 100 分也翻不回来
    expect(blockedHeavy.recommendation).toContain('不参与');
    expect(blockedHeavy.hardBlock).toBeTruthy();
  });

  it('Addendum 让交付达成率下降，交付分随之下降（与权重无关）', () => {
    const weights = [{ key: 'delivery', label: '交付', weight: 20 }];
    const before = card(buildCards('bid-decision', base, { decisionWeights: weights }), 'decision').decision!;
    const after = card(buildCards('bid-decision', { ...base, addendumApplied: true }, { decisionWeights: weights }), 'decision').decision!;
    expect(after.scores[0].score).toBeLessThan(before.scores[0].score);
  });
});
