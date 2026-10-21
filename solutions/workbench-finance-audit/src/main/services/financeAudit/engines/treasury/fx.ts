/**
 * E3 外汇风险（纯函数）：交易 / 会计 / 经济三类敞口、敏感性、分层对冲比例与询价单草稿。
 *
 * **硬边界：本模块只到询价单草稿（RFQ draft）。没有下单、成交、确认交易的任何路径**（treasury.test.ts 扫源码守卫）。
 * 询价单是给人拿去问银行价的清单；是否交易、和谁交易，由有权人在银行渠道自行完成。
 * 规则来源：finance-skills fx-risk（fx-exposure-calculation / fx-hedging-strategy 与判断框架）。
 */
import type { FauFxCertainty, FauFxCurrencyExposure, FauFxKind, FauRfqLine } from '@totalclaw/ipc-contracts';
import { FAU_FX_CERTAINTIES } from '@totalclaw/ipc-contracts';
import type { FxRateRow } from '../../types';
import type { FxExposureRow } from './types';
import { allocate, sum } from './common';

type Th = Record<string, number>;

const SIGN: Record<FauFxKind, { cls: 'transaction' | 'translation' | 'economic' | 'hedge'; s: 1 | -1 }> = {
  receivable: { cls: 'transaction', s: 1 }, payable: { cls: 'transaction', s: -1 },
  forecast_inflow: { cls: 'transaction', s: 1 }, forecast_outflow: { cls: 'transaction', s: -1 },
  asset: { cls: 'translation', s: 1 }, liability: { cls: 'translation', s: -1 },
  revenue: { cls: 'economic', s: 1 }, cost: { cls: 'economic', s: -1 },
  hedge_sell: { cls: 'hedge', s: 1 }, hedge_buy: { cls: 'hedge', s: -1 },
};
export const FX_SHOCKS = [-0.1, -0.05, -0.01, 0.01, 0.05, 0.1];

export function rateOf(rates: FxRateRow[], currency: string): number | null {
  const hits = rates.filter((r) => r.currency === currency).sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  return hits.length ? hits[0].rate : null;
}

export function fxExposure(rows: FxExposureRow[], rates: FxRateRow[], local: string, th: Th): { exposures: FauFxCurrencyExposure[]; rfq: FauRfqLine[]; totalLocal: number; missingRates: string[] } {
  const currencies = [...new Set(rows.map((r) => r.currency).filter((c) => c && c !== local))].sort();
  const ratioOf: Record<FauFxCertainty, number> = { firm: th['hedge.firmRatio'], highly_probable: th['hedge.probableRatio'], possible: th['hedge.possibleRatio'] };
  const missingRates: string[] = [];
  const rfq: FauRfqLine[] = [];
  const exposures: FauFxCurrencyExposure[] = [];
  for (const cur of currencies) {
    const rate = rateOf(rates, cur);
    if (rate == null) { missingRates.push(cur); continue; }
    const rs = rows.filter((r) => r.currency === cur);
    const by = (cls: string) => sum(rs.filter((r) => SIGN[r.kind].cls === cls).map((r) => SIGN[r.kind].s * r.amount));
    const transaction = by('transaction');
    const translation = by('translation');
    const economic = by('economic');
    const hedged = by('hedge');
    const layers = Object.fromEntries(FAU_FX_CERTAINTIES.map((c) => [c, sum(rs.filter((r) => SIGN[r.kind].cls === 'transaction' && r.certainty === c).map((r) => SIGN[r.kind].s * r.amount))])) as Record<FauFxCertainty, number>;
    const layerTarget = FAU_FX_CERTAINTIES.map((c) => Math.round(layers[c] * ratioOf[c]));
    const hedgeTarget = sum(layerTarget);
    const hedgeNeed = hedgeTarget - hedged;
    const local$ = (fc: number) => Math.round(fc * rate);
    const open = transaction + translation - hedged;
    exposures.push({
      currency: cur, rate, transaction, translation, economic,
      transactionLocal: local$(transaction), translationLocal: local$(translation), economicLocal: local$(economic),
      layers, hedged, hedgeTarget, hedgeNeed,
      hedgeRatio: transaction && Math.sign(hedged) === Math.sign(transaction) ? Math.abs(hedged) / Math.abs(transaction) : transaction ? 0 : null,
      sensitivity: FX_SHOCKS.map((shock) => ({ shock, impact: Math.round(open * rate * shock) })),
      overLimit: Math.abs(local$(transaction - hedged)) > th['fx.limitEscalate'],
      share: 0,
    });
    // 只在「还需加做对冲」时出询价单（过度对冲只提醒，不出反向单）
    if (hedgeNeed !== 0 && Math.sign(hedgeNeed) === Math.sign(hedgeTarget)) {
      const same = FAU_FX_CERTAINTIES.map((c, i) => (Math.sign(layerTarget[i]) === Math.sign(hedgeTarget) ? Math.abs(layerTarget[i]) : 0));
      const parts = allocate(Math.abs(hedgeNeed), same);
      FAU_FX_CERTAINTIES.forEach((layer, i) => {
        if (!parts[i]) return;
        const dates = rs.filter((r) => SIGN[r.kind].cls === 'transaction' && r.certainty === layer).map((r) => r.date).filter(Boolean).sort();
        rfq.push({ id: `${cur}-${layer}`, currency: cur, side: hedgeNeed > 0 ? 'sell' : 'buy', notional: parts[i], valueMonth: (dates[dates.length - 1] || '').slice(0, 7), instrument: 'forward', layer });
      });
    }
  }
  const abs = exposures.map((e) => Math.abs(e.transactionLocal + e.translationLocal));
  const totalLocal = sum(abs);
  exposures.forEach((e, i) => { e.share = totalLocal ? abs[i] / totalLocal : 0; });
  return { exposures, rfq, totalLocal, missingRates };
}
