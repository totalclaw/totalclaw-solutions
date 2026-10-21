/**
 * F1 估值金标准夹具（期望数字手算，写在注释里；valuation.test.ts 与 outputs/capital.test.ts 共用）。
 */
import type { DcfIn, LboIn } from '../../engines/capital/valuation';

/**
 * WACC：股权成本 = 4% + 1.6 × 5% = 12%；税后债务成本 = 5% × (1 − 20%) = 4%；WACC = 75% × 12% + 25% × 4% = 10%。
 * FCFF = EBIT × 0.8 + 20 − 20 − 0 → 100、110、121。
 * 年末折现：100 / 1.1 = 90.9091；110 / 1.21 = 90.9091；121 / 1.331 = 90.9091；合计 272.7273。
 * 终值 = 121 × 1.02 / (10% − 2%) = 1542.75；终值现值 = 1542.75 / 1.331 = 1159.0909。
 * 企业价值 = 1431.8182；终值占比 = 1159.0909 / 1431.8182 = 80.95%（> 75%，出黄旗）；
 * 股权价值 = 1431.8182 − 200 = 1231.8182；每股 = 12.3182。
 */
export const DCF_FX: DcfIn = {
  riskFree: 0.04, beta: 1.6, erp: 0.05, sizePremium: 0, costDebt: 0.05, taxRate: 0.2, debtWeight: 0.25,
  method: 'gordon', g: 0.02, exitMultiple: 10, midYear: false, netDebt: 200, shares: 100,
  forecast: [
    { year: '2027', revenue: 1000, ebit: 125, da: 20, capex: 20, nwcChange: 0 },
    { year: '2028', revenue: 1100, ebit: 137.5, da: 20, capex: 20, nwcChange: 0 },
    { year: '2029', revenue: 1210, ebit: 151.25, da: 20, capex: 20, nwcChange: 0 },
  ],
};

/**
 * LBO：进入 EV = 100 × 10 = 1000，费用 2% = 20；优先债 4x = 400（8%，每年强制还 5% × 400 = 20，超额现金 100% 扫款），次级债 1x = 100（10%）；
 * 股权投入 = 1020 − 500 = 520。税率 25%，三年 EBITDA 110 / 120 / 130，折旧 = 资本开支 = 10，营运资本不变。
 *   Y1：利息 32 + 10 = 42；税前 100 − 42 = 58；净利 43.5；可还债现金 43.5；强制 20，扫款 23.5；优先债期末 356.5
 *   Y2：利息 28.52 + 10 = 38.52；税前 71.48；净利 53.61；扫款 33.61；优先债期末 302.89
 *   Y3：利息 24.2312 + 10 = 34.2312；税前 85.7688；净利 64.3266；扫款 44.3266；优先债期末 238.5634
 * 退出 EV = 130 × 10 = 1300；净债务 = 238.5634 + 100 = 338.5634；退出股权 = 961.4366；
 * MOIC = 961.4366 / 520 = 1.848917；IRR = 1.848917^(1/3) − 1 = 22.7361%。
 */
export const LBO_FX: LboIn = {
  taxRate: 0.25, entryEbitda: 100, entryMultiple: 10, feesPct: 0.02, minCash: 0, seniorX: 4, seniorRate: 0.08, seniorAmort: 0.05, sweepPct: 1,
  subX: 1, subRate: 0.1, exitMultiple: 10,
  forecast: [
    { year: 'Y1', ebitda: 110, da: 10, capex: 10, nwcChange: 0 },
    { year: 'Y2', ebitda: 120, da: 10, capex: 10, nwcChange: 0 },
    { year: 'Y3', ebitda: 130, da: 10, capex: 10, nwcChange: 0 },
  ],
};
