/**
 * A2 总账 ↔ 子账（gl-recon）：按对账键全外连接（同键多行先合计），分六类：
 *   相符 / 金额差异（数量相同金额不同）/ 数量差异 / 时间差异（金额相同日期不同）/ 仅总账 / 仅子账。
 * 成因只是假设（给追根因的人看）：时间、汇率（外币相等本币不等，源技能原文 local agree, base don't）、
 * 映射（对面有同金额的另一个键）、重复或漏记、费用 / 计提（小额）、数据质量（正负号反、数量单位）。
 * 结果按本位币差额绝对值从大到小排；相符的也留在列表里（相符集合也要出底稿）。
 */
import { i18nKey } from '@totalclaw/i18n';
import type { FauBreakCause, FauGlSubBreak, FauGlSubClass, FauGlSubResult, FauMsg } from '@totalclaw/ipc-contracts';
import { FAU_GLSUB_CLASSES } from '@totalclaw/ipc-contracts';
import type { LedgerExtractRow } from '../../../types';
import { fmtYuan, msg } from '../common';

export interface GlSubInput {
  gl: LedgerExtractRow[];
  sub: LedgerExtractRow[];
  th: Record<string, number>;
}

/** 键统一：去空白、转大写（源技能：identifiers to upper-stripped strings） */
export const normKey = (k: string) => String(k || '').replace(/\s+/g, '').toUpperCase();

interface Agg { rows: number[]; amount: number; qty: number | null; fx: number | null; date: string; count: number }

function aggregate(rows: LedgerExtractRow[]): Map<string, Agg> {
  const m = new Map<string, Agg>();
  for (const r of rows) {
    const k = normKey(r.key);
    if (!k) continue;
    const a = m.get(k) || { rows: [], amount: 0, qty: null, fx: null, date: '', count: 0 };
    a.rows.push(r.row);
    a.amount += r.amount;
    if (r.quantity != null) a.qty = (a.qty ?? 0) + r.quantity;
    if (r.fxAmount != null) a.fx = (a.fx ?? 0) + r.fxAmount;
    if (r.date && (!a.date || r.date > a.date)) a.date = r.date;
    a.count += 1;
    m.set(k, a);
  }
  return m;
}

export function glSubledgerRecon(input: GlSubInput): FauGlSubResult {
  const tol = input.th['glsub.amountTol'] ?? 1;
  const qtyTol = input.th['glsub.qtyTol'] ?? 0;
  const major = input.th['glsub.majorDiff'] ?? 500000;
  const feeMax = input.th['glsub.feeMaxDiff'] ?? 10000;
  const gl = aggregate(input.gl);
  const sub = aggregate(input.sub);
  const keys = [...new Set([...gl.keys(), ...sub.keys()])];
  const breaks: FauGlSubBreak[] = keys.map((key) => {
    const g = gl.get(key);
    const s = sub.get(key);
    let cls: FauGlSubClass;
    if (g && !s) cls = 'gl_only';
    else if (s && !g) cls = 'sub_only';
    else if (g!.qty != null && s!.qty != null && Math.abs(g!.qty - s!.qty) > qtyTol) cls = 'quantity';
    else if (Math.abs(g!.amount - s!.amount) > tol) cls = 'amount';
    else if (g!.date && s!.date && g!.date !== s!.date) cls = 'timing';
    else cls = 'matched';
    const glAmount = g?.amount ?? 0;
    const subAmount = s?.amount ?? 0;
    return {
      id: `gs-${key}`, key, cls, glRows: g?.rows ?? [], subRows: s?.rows ?? [], glAmount, subAmount, diff: glAmount - subAmount,
      glQty: g?.qty ?? null, subQty: s?.qty ?? null, glFx: g?.fx ?? null, subFx: s?.fx ?? null, glDate: g?.date ?? '', subDate: s?.date ?? '',
      causes: [], major: false,
    };
  });
  // 成因假设
  for (const b of breaks) {
    if (b.cls === 'matched') continue;
    const causes = new Set<FauBreakCause>();
    if (b.cls === 'timing') causes.add('timing');
    if (b.cls === 'gl_only' || b.cls === 'sub_only') {
      const amt = b.cls === 'gl_only' ? b.glAmount : b.subAmount;
      const otherSide = b.cls === 'gl_only' ? 'sub_only' : 'gl_only';
      const twin = breaks.some((x) => x.cls === otherSide && Math.abs((otherSide === 'gl_only' ? x.glAmount : x.subAmount) - amt) <= tol);
      causes.add(twin ? 'mapping' : 'duplicate_or_missing');
    }
    if (b.cls === 'amount' || b.cls === 'quantity') {
      const g = gl.get(b.key)!;
      const s = sub.get(b.key)!;
      const fxEqual = b.glFx != null && b.subFx != null && Math.abs(b.glFx - b.subFx) <= tol;
      const lo = Math.min(Math.abs(b.glAmount), Math.abs(b.subAmount));
      const ratio = lo ? Math.max(Math.abs(b.glAmount), Math.abs(b.subAmount)) / lo : 0;
      const multiple = g.count !== s.count && ratio >= 2 && Math.abs(ratio - Math.round(ratio)) < 0.001;
      if (fxEqual && b.cls === 'amount') causes.add('fx');
      else if (b.glAmount !== 0 && Math.abs(b.glAmount + b.subAmount) <= tol) causes.add('data_quality'); // 正负号反
      else if (multiple) causes.add('duplicate_or_missing'); // 一边多记了整倍
      else if (b.cls === 'quantity' && b.glQty && b.subQty && [10, 100, 1000].includes(Math.round(Math.max(b.glQty, b.subQty) / Math.min(b.glQty, b.subQty)))) causes.add('data_quality'); // 计量单位
      else if (Math.abs(b.diff) <= feeMax) causes.add('fee_or_accrual');
      else causes.add('data_quality');
    }
    b.causes = [...causes];
    b.major = Math.abs(b.diff) >= major;
  }
  breaks.sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff) || a.key.localeCompare(b.key));
  const counts = Object.fromEntries(FAU_GLSUB_CLASSES.map((c) => [c, breaks.filter((b) => b.cls === c).length])) as Record<FauGlSubClass, number>;
  const glTotal = input.gl.reduce((a, r) => a + r.amount, 0);
  const subTotal = input.sub.reduce((a, r) => a + r.amount, 0);
  const escalations: FauMsg[] = breaks.filter((b) => b.major && b.cls !== 'matched').map((b) =>
    msg(i18nKey('重大差异：{key} 差额 {diff}，须追溯根因并由批准人签核'), { key: b.key, diff: fmtYuan(b.diff) }));
  return {
    breaks,
    counts,
    matchRate: keys.length ? counts.matched / keys.length : 1,
    totals: { gl: glTotal, sub: subTotal, diff: glTotal - subTotal },
    escalations,
  };
}
