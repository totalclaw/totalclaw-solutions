/**
 * A8 合并与内部往来（intercompany-reconciliation + intercompany-guarantee-review + transfer-pricing-review + 判断框架）。纯函数，金额一律分。
 *
 * 双边匹配复用 A2 的总账 ↔ 子账引擎（glSubledgerRecon）：本方对对方的「资产 / 收入」一侧 ↔ 对方对本方的「负债 / 成本」一侧，
 *   分五类配对（应收 ↔ 应付、内部销售 ↔ 内部采购、借出 ↔ 借入、利息收入 ↔ 利息支出、其他往来）；两边都有单据号时逐单匹配，
 *   否则按余额比。容差 0（源：任何差异立即调查）。
 * 抵销分录草稿（CAS 33 / IFRS 10）：每个配对只抵两边都有的部分（每个键取两边较小的金额），差额调平前不抵；每张分录借贷相等。
 *   存货中的未实现内部利润需要毛利率与期末结存，源项目没有给，这里不算，报告里写明。
 * 担保检查：担保方有效担保余额 / 净资产 > 上限（默认 50%）超限；临近到期、过期仍有效、没有审批、免担保费、单笔超限。
 * 内部定价：|内部价 − 市场价| / 市场价 > 5% 列入偏离清单（转 C3 转让定价）。
 */
import { i18nKey } from '@totalclaw/i18n';
import type {
  FauFlag, FauGuaranteeCheck, FauIcBreak, FauIcPair, FauIcPairSummary, FauIcResult, FauJeLine, FauMsg, FauTpDeviation,
} from '@totalclaw/ipc-contracts';
import type { GuaranteeRow, IcRow } from '../../../subledgerTypes';
import type { LedgerExtractRow } from '../../../types';
import { isActiveStatus } from '../../../intake/subledgers';
import { addDays, addMonths, msg, periodEnd } from '../common';
import { glSubledgerRecon } from '../recon/glsub';
import WORDS from '../../../intake/subledgerKeywords.json';

export interface IcInput {
  period: string;
  rows: IcRow[];
  guarantees: GuaranteeRow[] | null;
  cnCodes: boolean;
  th: Record<string, number>;
}

type IcKind = 'interest_income' | 'interest_expense' | 'loan_receivable' | 'loan_payable' | 'receivable' | 'payable' | 'revenue' | 'cost';
const W = WORDS as unknown as { icTypes: Record<IcKind, string[]> };
const norm = (s: string) => String(s || '').replace(/\s+/g, '').toLowerCase();

/** 往来类型 → 配对类别 + 一侧（asset：本方的债权 / 收入；liab：本方的债务 / 成本） */
export function classifyIc(type: string, amount: number): { pair: FauIcPair; side: 'asset' | 'liab' } {
  const s = norm(type);
  const order: [IcKind, FauIcPair, 'asset' | 'liab'][] = [
    ['interest_income', 'interest', 'asset'], ['interest_expense', 'interest', 'liab'], ['loan_receivable', 'loan', 'asset'], ['loan_payable', 'loan', 'liab'],
    ['receivable', 'arap', 'asset'], ['payable', 'arap', 'liab'], ['revenue', 'sales', 'asset'], ['cost', 'sales', 'liab'],
  ];
  for (const [k, pair, side] of order) if ((W.icTypes[k] || []).some((w) => s.includes(norm(w)))) return { pair, side };
  return { pair: 'other', side: amount >= 0 ? 'asset' : 'liab' };
}

const ACCT: Record<FauIcPair, { dr: { code: string; name: string }; cr: { code: string; name: string } }> = {
  arap: { dr: { code: '2202', name: i18nKey('应付账款') }, cr: { code: '1122', name: i18nKey('应收账款') } },
  sales: { dr: { code: '6001', name: i18nKey('营业收入') }, cr: { code: '6401', name: i18nKey('营业成本') } },
  loan: { dr: { code: '2241', name: i18nKey('内部借入款') }, cr: { code: '1221', name: i18nKey('内部借出款') } },
  interest: { dr: { code: '6603', name: i18nKey('利息收入') }, cr: { code: '6603', name: i18nKey('利息支出') } },
  other: { dr: { code: '2241', name: i18nKey('其他应付款') }, cr: { code: '1221', name: i18nKey('其他应收款') } },
};

export function intercompanyReview(input: IcInput): FauIcResult {
  const { th, period } = input;
  const asOf = periodEnd(period);
  const icTh = { 'glsub.amountTol': th['recon.amountTol'] ?? 0, 'glsub.qtyTol': 0, 'glsub.majorDiff': 1, 'glsub.feeMaxDiff': 0 };
  const tagged = input.rows.map((r) => ({ r, ...classifyIc(r.type, r.amount) }));
  // 有向配对：holder 一侧是资产 / 收入，对方一侧是负债 / 成本
  const keys = new Set<string>();
  for (const x of tagged) {
    const [holder, other] = x.side === 'asset' ? [x.r.entity, x.r.counterparty] : [x.r.counterparty, x.r.entity];
    keys.add(JSON.stringify([x.pair, holder, other]));
  }
  const pairs: FauIcPairSummary[] = [];
  const breaks: FauIcBreak[] = [];
  const je: FauJeLine[] = [];
  for (const k of [...keys].sort()) {
    const [pair, holder, other] = JSON.parse(k) as [FauIcPair, string, string];
    const own = tagged.filter((x) => x.pair === pair && x.side === 'asset' && x.r.entity === holder && x.r.counterparty === other).map((x) => x.r);
    const opp = tagged.filter((x) => x.pair === pair && x.side === 'liab' && x.r.entity === other && x.r.counterparty === holder).map((x) => x.r);
    const byDoc = [...own, ...opp].every((r) => r.docNo);
    // 负债一侧导出成负数的，整体翻正
    const sign = (rs: IcRow[]) => (rs.reduce((s, r) => s + r.amount, 0) < 0 ? -1 : 1);
    const toExtract = (rs: IcRow[], f: number): LedgerExtractRow[] => rs.map((r) => ({
      row: r.row, key: byDoc ? r.docNo : 'BALANCE', date: r.date, amount: r.amount * f, quantity: null, fxAmount: r.fxAmount == null ? null : r.fxAmount * f, currency: r.currency, docNo: r.docNo, desc: r.type,
    }));
    const res = glSubledgerRecon({ gl: toExtract(own, sign(own)), sub: toExtract(opp, sign(opp)), th: icTh });
    let eliminated = 0;
    for (const b of res.breaks) {
      if (b.glRows.length && b.subRows.length) eliminated += Math.min(Math.abs(b.glAmount), Math.abs(b.subAmount));
      if (b.cls === 'matched') continue;
      breaks.push({ id: `ic-${breaks.length + 1}`, pair, entity: holder, counterparty: other, key: b.key, cls: b.cls, own: b.glAmount, other: b.subAmount, diff: b.diff, causes: b.causes, ownRows: b.glRows, otherRows: b.subRows });
    }
    pairs.push({ pair, entity: holder, counterparty: other, own: res.totals.gl, other: res.totals.sub, diff: res.totals.diff, matched: res.counts.matched, breaks: res.breaks.length - res.counts.matched, eliminated });
    if (eliminated) {
      const voucherNo = `IC-${pairs.length}`;
      const a = ACCT[pair];
      const aux = `${holder} ↔ ${other}`;
      const line = (acct: { code: string; name: string }, debit: number, credit: number): FauJeLine => ({
        date: asOf, voucherNo, lineNo: debit ? 1 : 2, summary: aux, accountCode: input.cnCodes ? acct.code : '', accountName: acct.name, aux, debit, credit, source: 'ic_elimination', nameIsKey: true,
      });
      je.push(line(a.dr, eliminated, 0), line(a.cr, 0, eliminated));
    }
  }
  const staleDays = th['stale.days'] ?? 30;
  const cutoff = addDays(asOf, -staleDays);
  const staleRows = new Set(breaks.flatMap((b) => [...b.ownRows, ...b.otherRows]).filter((row) => {
    const r = input.rows.find((x) => x.row === row);
    return !!r?.date && r.date < cutoff;
  }));

  // 内部定价偏离
  const tpMax = th['tp.deviation'] ?? 0.05;
  const priced = input.rows.filter((r) => r.internalPrice != null && r.marketPrice != null && r.marketPrice !== 0);
  const pricing: FauTpDeviation[] | null = priced.length ? priced.map((r) => {
    const deviation = (r.internalPrice! - r.marketPrice!) / r.marketPrice!;
    return { row: r.row, entity: r.entity, counterparty: r.counterparty, type: r.type, amount: r.amount, internalPrice: r.internalPrice!, marketPrice: r.marketPrice!, deviation, flagged: Math.abs(deviation) > tpMax };
  }) : null;

  // 担保
  const guarantees = input.guarantees ? guaranteeChecks(input.guarantees, asOf, th) : null;

  const escalations: FauMsg[] = [];
  if (breaks.length) escalations.push(msg(i18nKey('内部往来对账有 {n} 条差异，容差为 0，须逐条查明并调平后再抵销'), { n: breaks.length }));
  if (staleRows.size) escalations.push(msg(i18nKey('{n} 行内部往来挂账超过 {m} 天未清'), { n: staleRows.size, m: staleDays }));
  const tpFlagged = (pricing || []).filter((p) => p.flagged);
  if (tpFlagged.length) escalations.push(msg(i18nKey('{n} 笔内部交易定价偏离市场价超过 {p0}，列入偏离清单转转让定价'), { n: tpFlagged.length, p0: `${(tpMax * 100).toFixed(0)}%` }));
  for (const g of (guarantees || []).filter((x) => x.flags.some((f) => f.code === 'gua.over_limit'))) {
    escalations.push(msg(i18nKey('担保方 {p0} 对 {p1} 的担保超过净资产比例上限'), { p0: g.guarantor, p1: g.beneficiary }));
  }
  const balanced = je.reduce((s, l) => s + l.debit - l.credit, 0) === 0;
  return { period, pairs, breaks, je, balanced, guarantees, pricing, stale: staleRows.size, escalations };
}

export function guaranteeChecks(rows: GuaranteeRow[], asOf: string, th: Record<string, number>): FauGuaranteeCheck[] {
  const limit = th['guarantee.limitPct'] ?? 0.5;
  const months = th['guarantee.expiringMonths'] ?? 3;
  const single = th['guarantee.singleMax'] ?? 0;
  const horizon = `${addMonths(asOf.slice(0, 7), months)}${asOf.slice(7)}`;
  const isLive = (g: GuaranteeRow) => isActiveStatus(g.status) && (!g.endDate || g.endDate >= asOf);
  const byGuarantor = new Map<string, GuaranteeRow[]>();
  for (const g of rows) byGuarantor.set(g.guarantor, [...(byGuarantor.get(g.guarantor) || []), g]);
  return rows.map((g) => {
    const mine = byGuarantor.get(g.guarantor) || [];
    const netAssets = mine.map((x) => x.netAssets).find((x) => x != null) ?? null;
    const total = mine.filter(isLive).reduce((s, x) => s + x.amount, 0);
    const ratio = netAssets ? total / netAssets : null;
    const flags: FauFlag[] = [];
    if (netAssets == null) flags.push({ code: 'gua.no_net_assets', level: 'info' });
    if (ratio != null && ratio > limit && isLive(g)) flags.push({ code: 'gua.over_limit', level: 'block', params: { p0: `${(ratio * 100).toFixed(1)}%`, p1: `${(limit * 100).toFixed(0)}%` } });
    if (g.endDate && g.endDate >= asOf && g.endDate <= horizon && isActiveStatus(g.status)) flags.push({ code: 'gua.expiring', level: 'warn', params: { p0: g.endDate } });
    if (g.endDate && g.endDate < asOf && g.status && isActiveStatus(g.status)) flags.push({ code: 'gua.expired_active', level: 'warn', params: { p0: g.endDate } });
    if (g.approved === false) flags.push({ code: 'gua.unapproved', level: 'warn' });
    if (g.feeRate === 0) flags.push({ code: 'gua.no_fee', level: 'info' });
    if (single > 0 && g.amount > single) flags.push({ code: 'gua.single_over', level: 'warn' });
    return { row: g.row, guarantor: g.guarantor, beneficiary: g.beneficiary, amount: g.amount, endDate: g.endDate, status: g.status, netAssets, ratio, flags };
  });
}
