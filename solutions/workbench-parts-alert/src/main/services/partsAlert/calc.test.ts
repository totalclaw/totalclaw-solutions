import { describe, expect, it } from 'vitest';
import {
  computePartsAlert, DEFAULT_PARAMS, forecastDailyDemand, projectStockout, parseDay, fmtDay,
  type MonthlyShipment, type PartsAlertInput,
} from './calc';

const ASOF = '2026-10-13';
const P = { ...DEFAULT_PARAMS, asOf: ASOF, seasonal: false };

/** 生成基准月之前连续 n 个月、每月固定数量的发货 */
function flatMonths(partNo: string, qty: number, n: number, endMonth = '2026-09'): MonthlyShipment[] {
  const [y, m] = endMonth.split('-').map(Number);
  const out: MonthlyShipment[] = [];
  for (let i = 0; i < n; i += 1) {
    const idx = y * 12 + (m - 1) - i;
    out.push({ partNo, month: `${Math.floor(idx / 12)}-${String((idx % 12) + 1).padStart(2, '0')}`, qty });
  }
  return out;
}

function one(input: Partial<PartsAlertInput>, params = P) {
  const out = computePartsAlert({ monthly: [], yearly: [], leadTimes: [], inTransit: [], stock: [], ...input }, params);
  return out;
}

describe('需求预测', () => {
  it('每月固定 300 → 月均 300、日均 10', () => {
    const by = new Map<number, number>();
    for (const r of flatMonths('A', 300, 12)) { const [y, m] = r.month.split('-').map(Number); by.set(y * 12 + m - 1, r.qty); }
    const f = forecastDailyDemand(by, 2026 * 12 + 9, false);
    expect(f.daily).toBeCloseTo(10, 6);
  });

  it('近期权重更高：近 3 个月 600、之前 300', () => {
    const by = new Map<number, number>();
    const base = 2026 * 12 + 9;
    for (let i = 1; i <= 12; i += 1) by.set(base - i, i <= 3 ? 600 : 300);
    const f = forecastDailyDemand(by, base, false);
    // 近3均 600，近6均 450，近12均 375 → 600*.5+450*.3+375*.2 = 510
    expect(f.base).toBeCloseTo(510, 6);
  });

  it('季节修正限制在 0.5～2 之间，数据不足 24 个月不修正', () => {
    const base = 2026 * 12 + 9;
    const short = new Map<number, number>();
    for (let i = 1; i <= 12; i += 1) short.set(base - i, 100);
    expect(forecastDailyDemand(short, base, true).seasonFactor).toBe(1);
    const long = new Map<number, number>();
    for (let i = 1; i <= 36; i += 1) long.set(base - i, 100);
    long.set(base - 12, 1000); long.set(base - 11, 1000); // 去年同期旺季
    expect(forecastDailyDemand(long, base, true).seasonFactor).toBe(2);
  });
});

describe('断货日推算', () => {
  const t0 = parseDay(ASOF);
  it('无在途：库存 100、日均 10 → 10 天后断货', () => {
    expect(fmtDay(projectStockout(100, 10, [], t0, 400))).toBe('2026-10-23');
  });
  it('在途在断货前到货，断货日顺延', () => {
    const eta = parseDay('2026-10-18');
    // 5 天后剩 50，到货 +100 = 150，再 15 天 → 11-02
    expect(fmtDay(projectStockout(100, 10, [{ day: eta, qty: 100 }], t0, 400))).toBe('2026-11-02');
  });
  it('在途晚于断货日，断货日不变', () => {
    const eta = parseDay('2026-11-10');
    expect(fmtDay(projectStockout(100, 10, [{ day: eta, qty: 500 }], t0, 400))).toBe('2026-10-23');
  });
  it('没有需求不会断货', () => {
    expect(Number.isNaN(projectStockout(100, 0, [], t0, 400))).toBe(true);
  });
});

describe('库存状态判定', () => {
  it('已缺货：库存为 0 且有需求', () => {
    const r = one({ monthly: flatMonths('A', 300, 12), stock: [{ partNo: 'A', qty: 0 }] }).results[0];
    expect(r.state).toBe('out_of_stock');
  });

  it('将缺货：断货日落在 提前期 + 安全天数 之内', () => {
    // 日均 10，库存 300 → 30 天断货；提前期 30 + 安全 15 = 45 天
    const r = one({ monthly: flatMonths('A', 300, 12), stock: [{ partNo: 'A', qty: 300 }], leadTimes: [{ partNo: 'A', days: 30 }] }).results[0];
    expect(r.state).toBe('at_risk');
    expect(r.stockoutDate).toBe('2026-11-12');
    expect(r.hasInTransit).toBe(false);
  });

  it('健康：可用天数在风险窗口和冗余阈值之间', () => {
    // 库存 900 → 90 天
    const r = one({ monthly: flatMonths('A', 300, 12), stock: [{ partNo: 'A', qty: 900 }], leadTimes: [{ partNo: 'A', days: 30 }] }).results[0];
    expect(r.state).toBe('healthy');
    expect(r.suggestQty).toBe(0);
  });

  it('冗余：可用天数超过 6 个月', () => {
    const r = one({ monthly: flatMonths('A', 300, 12), stock: [{ partNo: 'A', qty: 2500 }] }).results[0];
    expect(r.state).toBe('redundant');
    expect(r.actions.map((a) => a.kind)).toContain('pause_replenish');
  });

  it('呆滞：有库存但 12 个月以上没有发货', () => {
    const r = one({ monthly: [{ partNo: 'A', month: '2025-03', qty: 50 }], stock: [{ partNo: 'A', qty: 80 }] }).results[0];
    expect(r.state).toBe('stagnant');
    expect(r.monthsSinceLastShip).toBe(19);
    expect(r.actions.map((a) => a.kind)).toEqual(['stop_purchase', 'transfer_out']);
  });

  it('呆滞超过 24 个月建议报废评估；有在途则建议取消', () => {
    const r = one({
      monthly: [{ partNo: 'A', month: '2024-01', qty: 50 }], stock: [{ partNo: 'A', qty: 80 }],
      inTransit: [{ partNo: 'A', qty: 20, eta: '2026-11-01' }],
    }).results[0];
    expect(r.state).toBe('stagnant');
    expect(r.actions.map((a) => a.kind)).toEqual(['stop_purchase', 'cancel_in_transit', 'transfer_out', 'scrap_review']);
  });

  it('在途能赶在断货前到且够用 → 不算将缺货', () => {
    const r = one({
      monthly: flatMonths('A', 300, 12), stock: [{ partNo: 'A', qty: 300 }], leadTimes: [{ partNo: 'A', days: 30 }],
      inTransit: [{ partNo: 'A', qty: 900, eta: '2026-10-30' }],
    }).results[0];
    expect(r.state).toBe('healthy');
  });

  it('没有库存也没有需求 → 健康且无动作', () => {
    const r = one({ monthly: [{ partNo: 'A', month: '2023-01', qty: 5 }], stock: [{ partNo: 'A', qty: 0 }] }).results[0];
    expect(r.state).toBe('healthy');
    expect(r.actions).toEqual([]);
  });
});

describe('补库清单与管控举措', () => {
  it('无在途：补库量 = 日均 × (提前期 + 补货周期 + 安全天数) − 库存', () => {
    const r = one({ monthly: flatMonths('A', 300, 12), stock: [{ partNo: 'A', qty: 300 }], leadTimes: [{ partNo: 'A', days: 30 }] }).results[0];
    // 10 × (30+30+15) = 750 − 300 = 450
    expect(r.suggestQty).toBe(450);
    expect(r.actions.map((a) => a.kind)).toEqual(['place_order', 'transfer_in']);
    // 断货 11-12，提前期 30 天 → 最迟下单日为基准日
    expect(r.latestOrderDate).toBe(ASOF);
  });

  it('有在途但到货晚于断货 → 催交加急 + 调拨，并扣减在途后追加', () => {
    const r = one({
      monthly: flatMonths('A', 300, 12), stock: [{ partNo: 'A', qty: 100 }], leadTimes: [{ partNo: 'A', days: 30 }],
      inTransit: [{ partNo: 'A', qty: 200, eta: '2026-11-05' }],
    }).results[0];
    expect(r.state).toBe('at_risk');
    expect(r.hasInTransit).toBe(true);
    expect(r.suggestQty).toBe(450); // 750 − 100 − 200
    expect(r.actions.map((a) => a.kind)).toEqual(['expedite', 'transfer_in', 'top_up_order']);
  });

  it('已缺货且有在途 → 催交、调拨、通知网点', () => {
    const r = one({
      monthly: flatMonths('A', 300, 12), stock: [{ partNo: 'A', qty: 0 }], leadTimes: [{ partNo: 'A', days: 20 }],
      inTransit: [{ partNo: 'A', qty: 1000, eta: '2026-10-20' }],
    }).results[0];
    expect(r.state).toBe('out_of_stock');
    expect(r.suggestQty).toBe(0); // 10 × 65 = 650 < 在途 1000
    expect(r.actions.map((a) => a.kind)).toEqual(['expedite', 'transfer_in', 'backorder_notice']);
  });

  it('最小起订量向上取整，并算出金额', () => {
    const r = one({
      monthly: flatMonths('A', 300, 12), stock: [{ partNo: 'A', qty: 300, unitPrice: 2.5 }],
      leadTimes: [{ partNo: 'A', days: 30, moq: 200 }],
    }).results[0];
    expect(r.suggestQty).toBe(600);
    expect(r.suggestAmount).toBe(1500);
  });

  it('提前期缺失用默认值并在汇总里列出', () => {
    const out = one({ monthly: flatMonths('A', 300, 12), stock: [{ partNo: 'A', qty: 300 }] });
    expect(out.results[0].leadDaysDefaulted).toBe(true);
    expect(out.summary.partsWithDefaultLead).toEqual(['A']);
  });

  it('在途没有预计回货时间按 基准日 + 提前期 到货', () => {
    const r = one({
      monthly: flatMonths('A', 300, 12), stock: [{ partNo: 'A', qty: 100 }], leadTimes: [{ partNo: 'A', days: 20 }],
      inTransit: [{ partNo: 'A', qty: 500 }],
    }).results[0];
    expect(r.earliestEta).toBe('2026-11-02');
  });
});

describe('依据和举措要说实话', () => {
  it('靠在途才健康的配件：依据里写的是在途，不是「库存可用天数在区间内」', () => {
    const r = one({
      monthly: flatMonths('A', 300, 12), stock: [{ partNo: 'A', qty: 100 }], leadTimes: [{ partNo: 'A', days: 30 }],
      inTransit: [{ partNo: 'A', qty: 600, eta: '2026-10-18' }],
    }).results[0];
    expect(r.state).toBe('healthy');
    const line = r.basis.find((b) => b.includes('健康'))!;
    expect(line).toContain('现有库存只够 10 天');
    expect(line).toContain('在途 600');
    expect(line).not.toContain('之间');
  });

  it('在途没有预计回货时间：举措里标明到货日是推算的', () => {
    const r = one({
      monthly: flatMonths('A', 300, 12), stock: [{ partNo: 'A', qty: 100 }], leadTimes: [{ partNo: 'A', days: 30 }],
      inTransit: [{ partNo: 'A', qty: 600 }],
    }).results[0];
    expect(r.actions[0].text).toContain('按提前期推算');
    const withEta = one({
      monthly: flatMonths('A', 300, 12), stock: [{ partNo: 'A', qty: 100 }], leadTimes: [{ partNo: 'A', days: 30 }],
      inTransit: [{ partNo: 'A', qty: 600, eta: '2026-11-05' }],
    }).results[0];
    expect(withEta.actions[0].text).not.toContain('推算');
  });

  it('没有需求却还有在途：提示核对是否取消', () => {
    const r = one({ monthly: [{ partNo: 'A', month: '2023-01', qty: 5 }], stock: [{ partNo: 'A', qty: 0 }], inTransit: [{ partNo: 'A', qty: 40, eta: '2026-11-01' }] }).results[0];
    expect(r.state).toBe('healthy');
    expect(r.actions.map((a) => a.kind)).toEqual(['cancel_in_transit']);
  });

  it('年度趋势写进依据，并说明不进入预测', () => {
    const r = one({
      monthly: flatMonths('A', 300, 12), stock: [{ partNo: 'A', qty: 900 }],
      yearly: [{ partNo: 'A', year: 2025, qty: 3000 }, { partNo: 'A', year: 2024, qty: 4000 }],
    }).results[0];
    expect(r.basis.some((b) => b.includes('减少 25%') && b.includes('不进入预测'))).toBe(true);
  });
});

describe('汇总', () => {
  it('按状态计数，补库合计只算需要补的', () => {
    const out = one({
      monthly: [...flatMonths('A', 300, 12), ...flatMonths('B', 300, 12), { partNo: 'C', month: '2024-01', qty: 9 }],
      stock: [{ partNo: 'A', qty: 0 }, { partNo: 'B', qty: 900 }, { partNo: 'C', qty: 10 }],
      leadTimes: [{ partNo: 'A', days: 30 }, { partNo: 'B', days: 30 }],
    });
    expect(out.summary.byState).toEqual({ stagnant: 1, redundant: 0, healthy: 1, at_risk: 0, out_of_stock: 1 });
    expect(out.summary.replenishParts).toBe(1);
    expect(out.summary.replenishQty).toBe(750);
  });

  it('只出现在发货或在途里、没有库存记录的配件按库存 0 处理并列出', () => {
    const out = one({ monthly: flatMonths('X', 30, 12) });
    expect(out.results[0].state).toBe('out_of_stock');
    expect(out.summary.partsWithoutStockRow).toEqual(['X']);
  });

  it('年度趋势：去年相对前年的变化', () => {
    const out = one({
      monthly: flatMonths('A', 300, 12), stock: [{ partNo: 'A', qty: 900 }],
      yearly: [{ partNo: 'A', year: 2025, qty: 3000 }, { partNo: 'A', year: 2024, qty: 4000 }],
    });
    expect(out.results[0].yearlyTrend).toBe(-0.25);
  });
});
