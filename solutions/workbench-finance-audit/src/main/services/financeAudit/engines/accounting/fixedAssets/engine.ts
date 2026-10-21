/**
 * A6 固定资产（depreciation-analysis + asset-acquisition-review + asset-disposal-review + fixed-assets CLAUDE.md）。纯函数，金额一律分。
 *
 * 折旧重算（CAS 4 / IAS 16）：增加当月不提、次月起提；处置当月照提、次月停；提足不再提。
 *   直线法：月折旧 = (原值 − 残值) / 使用月数；
 *   年数总和法：第 y 年 = (原值 − 残值) × (n − y + 1) / (n(n + 1) / 2)，月 = 年 / 12；
 *   双倍余额递减法：前 n − 2 年按年初净值 × 2 / n，最后两年改直线（年初净值 − 残值）/ 2；
 *   工作量法：(原值 − 残值) / 预计总工作量 × 本期工作量。
 * 本期应提 = 期末应有累计折旧 − 期初应有累计折旧（各自四舍五入到分，避免逐月舍入误差累积）；
 * 与账面差异超过 max(±1%, 1 元) 标出。有减值准备的资产，后续折旧按减值后账面价值另算，这里只提示不比。
 * 资产滚动表按类别：期初原值 + 本期新增 − 本期处置 = 期末原值；期初累计折旧 + 本期折旧 − 处置转出 = 期末累计折旧。
 * 处置：账面净值 = 原值 − 累计折旧 − 减值准备；净收入 = 处置收入 − 处置费用；损益 = 净收入 − 账面净值，出分录草稿（不过账）。
 */
import { i18nKey } from '@totalclaw/i18n';
import type { FauDepMethod, FauFaAddition, FauFaDisposal, FauFaLine, FauFaResult, FauFaRollRow, FauFlag, FauJeLine, FauMsg } from '@totalclaw/ipc-contracts';
import type { FaMovementRow, FaRegisterRow } from '../../../subledgerTypes';
import type { TbRow } from '../../../types';
import { addMonths, codeUnder, fmtYuan, msg, periodEnd, topLevel } from '../common';
import WORDS from '../../../intake/subledgerKeywords.json';

export interface FaInput {
  period: string;
  register: FaRegisterRow[];
  movements: FaMovementRow[];
  tb: TbRow[] | null;
  /** 中国准则出科目编码，其余只出科目名 */
  cnCodes: boolean;
  th: Record<string, number>;
}

const W = WORDS as unknown as { depMethods: Record<FauDepMethod, string[]>; disposedStatus: string[] };
const norm = (s: string) => String(s || '').replace(/\s+/g, '').toLowerCase();

export function methodOf(text: string): { method: FauDepMethod; known: boolean } {
  const s = norm(text);
  if (!s) return { method: 'straight_line', known: true };
  for (const [m, words] of Object.entries(W.depMethods) as [FauDepMethod, string[]][]) if (words.some((w) => s.includes(norm(w)))) return { method: m, known: true };
  return { method: 'straight_line', known: false };
}

/** a → b 相隔几个月（YYYY-MM） */
export function monthDiff(a: string, b: string): number {
  const [ya, ma] = a.split('-').map(Number);
  const [yb, mb] = b.split('-').map(Number);
  return (yb * 12 + mb) - (ya * 12 + ma);
}

/** 第 k 个月末的累计折旧（不含工作量法），k 从开始计提起算，超出年限按提足 */
export function accumAfter(method: FauDepMethod, base: number, cost: number, salvage: number, lifeMonths: number, k: number): number {
  const m = Math.max(0, Math.min(k, lifeMonths));
  if (m === 0 || lifeMonths <= 0) return 0;
  const n = lifeMonths / 12;
  if (method === 'syd' && Number.isInteger(n)) {
    const s = (n * (n + 1)) / 2;
    const full = Math.floor(m / 12);
    let units = 0;
    for (let y = 1; y <= full; y += 1) units += n - y + 1;
    if (full < n) units += ((m % 12) / 12) * (n - full);
    return Math.round((base * units) / s);
  }
  if (method === 'ddb' && Number.isInteger(n) && n >= 2) {
    const annual: number[] = [];
    let nbv = cost;
    for (let y = 1; y <= n - 2; y += 1) { const d = (nbv * 2) / n; annual.push(d); nbv -= d; }
    const last = (nbv - salvage) / 2;
    annual.push(last, last);
    const full = Math.floor(m / 12);
    let acc = annual.slice(0, full).reduce((a, b) => a + b, 0);
    if (full < n) acc += ((m % 12) / 12) * annual[full];
    return Math.round(acc);
  }
  return Math.round((base * m) / lifeMonths);
}

const isDisposedStatus = (s: string) => W.disposedStatus.some((w) => norm(s).includes(norm(w)));

export function recomputeAsset(a: FaRegisterRow, period: string, th: Record<string, number>): FauFaLine {
  const flags: FauFlag[] = [];
  const { method, known } = methodOf(a.method);
  if (!known) flags.push({ code: 'asset.method_unknown', level: 'warn', params: { p0: a.method } });
  const salvage = a.salvage ?? Math.round(a.cost * (a.salvageRate ?? th['salvage.defaultRate'] ?? 0.05));
  const base = a.cost - salvage;
  const life = a.lifeMonths ?? 0;
  const start = addMonths(a.acquireDate.slice(0, 7), 1);
  const disposedBefore = !!a.disposalDate && a.disposalDate.slice(0, 7) < period;
  const before = disposedBefore ? monthDiff(start, a.disposalDate.slice(0, 7)) + 1 : Math.max(0, monthDiff(start, period));
  const active = !disposedBefore && period >= start;
  let expectedStart = 0;
  let expectedEnd = 0;
  let formula = '';
  let comparable = true;
  if (method === 'units') {
    if (a.totalUnits && a.periodUnits != null) {
      const perUnit = base / a.totalUnits;
      const startAcc = a.unitsToDate != null ? Math.round(perUnit * a.unitsToDate) : (a.bookedAccum ?? 0) - (a.bookedPeriod ?? 0);
      expectedStart = startAcc;
      expectedEnd = Math.min(base, startAcc + (active ? Math.round(perUnit * a.periodUnits) : 0));
      formula = `(${fmtYuan(a.cost)} - ${fmtYuan(salvage)}) / ${a.totalUnits} × ${a.periodUnits}`;
    } else { flags.push({ code: 'asset.units_missing', level: 'warn' }); comparable = false; }
  } else if (life > 0) {
    expectedStart = accumAfter(method, base, a.cost, salvage, life, Math.max(0, Math.min(before, life)));
    expectedEnd = active ? accumAfter(method, base, a.cost, salvage, life, before + 1) : expectedStart;
    formula = method === 'straight_line'
      ? `(${fmtYuan(a.cost)} - ${fmtYuan(salvage)}) / ${life}`
      : `${method.toUpperCase()} · ${life / 12}y · k=${Math.min(before + 1, life)}`;
    if (before + 1 > life && !isDisposedStatus(a.status) && !a.disposalDate) flags.push({ code: 'asset.fully_in_use', level: 'info' });
  } else { flags.push({ code: 'asset.no_life', level: 'warn' }); comparable = false; }
  const expectedPeriod = expectedEnd - expectedStart;
  if (a.impairment > 0) { flags.push({ code: 'asset.impaired', level: 'info' }); comparable = false; }
  const pct = th['dep.pctTol'] ?? 0.01;
  const amt = th['dep.amtTol'] ?? 100;
  let diffPeriod: number | null = null;
  let diffAccum: number | null = null;
  if (a.bookedPeriod != null) {
    diffPeriod = a.bookedPeriod - expectedPeriod;
    if (comparable) {
      if (expectedPeriod > 0 && a.bookedPeriod === 0) flags.push({ code: 'asset.not_depreciated', level: 'block' });
      else if (expectedPeriod === 0 && a.bookedPeriod > 0 && !active && period < start) flags.push({ code: 'asset.early_dep', level: 'warn' });
      else if (Math.abs(diffPeriod) > Math.max(Math.abs(expectedPeriod) * pct, amt)) {
        flags.push({ code: 'asset.dep_diff', level: 'warn', params: { p0: fmtYuan(expectedPeriod), p1: fmtYuan(a.bookedPeriod), p2: fmtYuan(diffPeriod) } });
      }
    }
  }
  if (a.bookedAccum != null) {
    diffAccum = a.bookedAccum - expectedEnd;
    if (comparable && Math.abs(diffAccum) > Math.max(Math.abs(expectedEnd) * pct, amt)) {
      flags.push({ code: 'asset.accum_diff', level: 'warn', params: { p0: fmtYuan(expectedEnd), p1: fmtYuan(a.bookedAccum), p2: fmtYuan(diffAccum) } });
    }
  }
  return {
    row: a.row, assetNo: a.assetNo, name: a.name, category: a.category, acquireDate: a.acquireDate, method, lifeMonths: life, cost: a.cost, salvage,
    impairment: a.impairment, status: a.status, disposalDate: a.disposalDate, expectedPeriod, bookedPeriod: a.bookedPeriod, diffPeriod,
    expectedAccum: expectedEnd, bookedAccum: a.bookedAccum, diffAccum, nbv: a.cost - expectedEnd - a.impairment, formula, flags,
  };
}

const ACCT = {
  clearing: { code: '1606', name: i18nKey('固定资产清理') },
  accum: { code: '1602', name: i18nKey('累计折旧') },
  impairment: { code: '1603', name: i18nKey('固定资产减值准备') },
  asset: { code: '1601', name: i18nKey('固定资产') },
  bank: { code: '1002', name: i18nKey('银行存款') },
  gain: { code: '6115', name: i18nKey('资产处置损益') },
};

export function disposalEntries(d: FauFaDisposal, date: string, cnCodes: boolean): FauJeLine[] {
  const out: FauJeLine[] = [];
  const voucherNo = `FA-${d.assetNo}`;
  const add = (acct: { code: string; name: string }, debit: number, credit: number, summary: string) => {
    if (!debit && !credit) return;
    out.push({ date, voucherNo, lineNo: out.length + 1, summary, accountCode: cnCodes ? acct.code : '', accountName: acct.name, aux: d.assetNo, debit, credit, source: 'fa_disposal', nameIsKey: true });
  };
  const s = `${d.assetNo} ${d.name}`.trim();
  add(ACCT.clearing, d.nbv, 0, s);
  add(ACCT.accum, d.accum, 0, s);
  add(ACCT.impairment, d.impairment, 0, s);
  add(ACCT.asset, 0, d.cost, s);
  add(ACCT.bank, d.proceeds, 0, s);
  add(ACCT.clearing, 0, d.proceeds, s);
  add(ACCT.clearing, d.costs, 0, s);
  add(ACCT.bank, 0, d.costs, s);
  if (d.gainLoss > 0) { add(ACCT.clearing, d.gainLoss, 0, s); add(ACCT.gain, 0, d.gainLoss, s); }
  if (d.gainLoss < 0) { add(ACCT.gain, -d.gainLoss, 0, s); add(ACCT.clearing, 0, -d.gainLoss, s); }
  return out;
}

export function fixedAssetsReview(input: FaInput): FauFaResult {
  const { period, th } = input;
  const pStart = `${period}-01`;
  const pEnd = periodEnd(period);
  const lines = input.register.map((a) => recomputeAsset(a, period, th));
  const inScope = (l: FauFaLine) => l.acquireDate <= pEnd && !(l.disposalDate && l.disposalDate < pStart);
  const scoped = lines.filter(inScope);

  // 资产滚动表（按类别）
  const cats = [...new Set(scoped.map((l) => l.category || '-'))];
  const roll: FauFaRollRow[] = cats.map((category) => {
    const ls = scoped.filter((l) => (l.category || '-') === category);
    const existed = ls.filter((l) => l.acquireDate < pStart);
    const added = ls.filter((l) => l.acquireDate >= pStart);
    const disposed = ls.filter((l) => l.disposalDate && l.disposalDate >= pStart && l.disposalDate <= pEnd);
    const openingCost = existed.reduce((s, l) => s + l.cost, 0);
    const additions = added.reduce((s, l) => s + l.cost, 0);
    const disposals = disposed.reduce((s, l) => s + l.cost, 0);
    const openingAccum = existed.reduce((s, l) => s + (l.expectedAccum - l.expectedPeriod), 0);
    const depreciation = ls.reduce((s, l) => s + l.expectedPeriod, 0);
    const disposalAccum = disposed.reduce((s, l) => s + l.expectedAccum, 0);
    const remaining = ls.filter((l) => !disposed.includes(l));
    const closingCost = openingCost + additions - disposals;
    const closingAccum = openingAccum + depreciation - disposalAccum;
    return {
      category, openingCost, additions, disposals, closingCost, openingAccum, depreciation, disposalAccum, closingAccum,
      bookedClosingAccum: remaining.every((l) => l.bookedAccum != null) ? remaining.reduce((s, l) => s + (l.bookedAccum ?? 0), 0) : null,
      nbv: closingCost - closingAccum - remaining.reduce((s, l) => s + l.impairment, 0),
    };
  });

  // 处置审核：处置单优先；台账里本期有处置日期但没有处置单的也列出
  const byNo = new Map(lines.map((l) => [l.assetNo, l]));
  const disposals: FauFaDisposal[] = [];
  const moved = new Set<string>();
  for (const m of input.movements.filter((x) => x.type === 'disposal')) {
    const l = byNo.get(m.assetNo);
    moved.add(m.assetNo);
    const flags: FauFlag[] = l ? [] : [{ code: 'asset.disposal_not_found', level: 'block' }];
    const cost = l?.cost ?? m.amount;
    const accum = l ? (l.bookedAccum ?? l.expectedAccum) : 0;
    const impairment = l?.impairment ?? 0;
    const nbv = cost - accum - impairment;
    const net = m.proceeds - m.costs;
    const gainLoss = net - nbv;
    if (gainLoss < 0) flags.push({ code: 'asset.disposal_loss', level: 'warn', params: { p0: fmtYuan(-gainLoss) } });
    disposals.push({ row: m.row, assetNo: m.assetNo, name: l?.name || m.name, date: m.date || l?.disposalDate || pEnd, type: m.typeText, cost, accum, impairment, nbv, proceeds: m.proceeds, costs: m.costs, net, gainLoss, flags });
  }
  for (const l of scoped.filter((x) => x.disposalDate && x.disposalDate >= pStart && !moved.has(x.assetNo))) {
    const accum = l.bookedAccum ?? l.expectedAccum;
    const nbv = l.cost - accum - l.impairment;
    disposals.push({ row: l.row, assetNo: l.assetNo, name: l.name, date: l.disposalDate, type: '', cost: l.cost, accum, impairment: l.impairment, nbv, proceeds: 0, costs: 0, net: 0, gainLoss: -nbv, flags: nbv > 0 ? [{ code: 'asset.disposal_loss', level: 'warn', params: { p0: fmtYuan(nbv) } }] : [] });
  }
  const je = disposals.filter((d) => !d.flags.some((f) => f.code === 'asset.disposal_not_found')).flatMap((d) => disposalEntries(d, d.date, input.cnCodes));

  // 购置审核：资本化门槛、大额
  const capMin = th['cap.minAmount'] ?? 500_000;
  const capLarge = th['cap.largeAmount'] ?? 500_000_000;
  const addSrc: { row: number; assetNo: string; name: string; date: string; amount: number }[] = [
    ...input.movements.filter((m) => m.type === 'addition').map((m) => ({ row: m.row, assetNo: m.assetNo, name: m.name || byNo.get(m.assetNo)?.name || '', date: m.date, amount: m.amount || byNo.get(m.assetNo)?.cost || 0 })),
    ...scoped.filter((l) => l.acquireDate >= pStart && !input.movements.some((m) => m.type === 'addition' && m.assetNo === l.assetNo)).map((l) => ({ row: l.row, assetNo: l.assetNo, name: l.name, date: l.acquireDate, amount: l.cost })),
  ];
  const additions: FauFaAddition[] = addSrc.map((a) => {
    const flags: FauFlag[] = [];
    if (a.amount > 0 && a.amount < capMin) flags.push({ code: 'asset.below_cap', level: 'warn', params: { p0: fmtYuan(a.amount) } });
    if (a.amount > capLarge) flags.push({ code: 'asset.large_cap', level: 'warn', params: { p0: fmtYuan(a.amount) } });
    return { ...a, flags };
  });

  // 与总账（固定资产 / 累计折旧科目期末）核对
  let glTie: FauFaResult['glTie'] = null;
  if (input.tb?.length) {
    const top = topLevel(input.tb);
    const isCost = (r: TbRow) => codeUnder(r.accountCode, '1601') || (/^(固定资产|property,? plant|الممتلكات)/i.test(r.accountName) && !/(累计|清理|减值|accumulated|impairment|مجمع)/i.test(r.accountName));
    const isAccum = (r: TbRow) => codeUnder(r.accountCode, '1602') || /(累计折旧|accumulated depreciation|مجمع الإهلاك)/i.test(r.accountName);
    const glCost = top.filter(isCost).reduce((s, r) => s + r.closingDr - r.closingCr, 0);
    const glAccum = top.filter(isAccum).reduce((s, r) => s + r.closingCr - r.closingDr, 0);
    const regCost = roll.reduce((s, r) => s + r.closingCost, 0);
    const regAccum = roll.reduce((s, r) => s + (r.bookedClosingAccum ?? r.closingAccum), 0);
    glTie = [
      { item: 'cost', register: regCost, gl: glCost, diff: regCost - glCost },
      { item: 'accum', register: regAccum, gl: glAccum, diff: regAccum - glAccum },
    ];
  }

  const escalations: FauMsg[] = [];
  const notDep = lines.filter((l) => l.flags.some((f) => f.code === 'asset.not_depreciated'));
  if (notDep.length) escalations.push(msg(i18nKey('{n} 项在用资产本期应提未提折旧'), { n: notDep.length }));
  for (const a of additions.filter((x) => x.flags.some((f) => f.code === 'asset.large_cap'))) escalations.push(msg(i18nKey('资产 {p0} 大额资本化 {p1}，须核对审批与预算'), { p0: a.assetNo, p1: fmtYuan(a.amount) }));
  for (const d of disposals.filter((x) => x.flags.some((f) => f.code === 'asset.disposal_not_found'))) escalations.push(msg(i18nKey('处置单的资产 {p0} 在台账里找不到'), { p0: d.assetNo }));
  for (const g of (glTie || []).filter((x) => x.diff !== 0)) escalations.push(msg(g.item === 'cost' ? i18nKey('资产台账原值与总账差 {p0}') : i18nKey('资产台账累计折旧与总账差 {p0}'), { p0: fmtYuan(g.diff) }));
  return { period, lines, roll, disposals, additions, je, glTie, escalations };
}
