/**
 * A1 关账清单（close-checklist-executor 的 15 项前置）。
 *
 * 能从数据判断的自动判：折旧凭证是否已生成、本期是否有银行对账结果、计提是否已跑、期末汇率；
 * 其余由人勾 ✅ / ⚠️ / ❌（没勾 = pending）。人勾的值优先于自动判（用户在别处做完了对账也能标）。
 * 判定「可以开始结账」：❌ ≤ 1、⚠️ ≤ 3，四项主线（试算表 / 银行对账 / 往来核销 / 折旧）不能是 ❌；
 * 有未勾项时不算通过。试算表不在 15 项里，按主线闸门单独判（trialBalanced）。
 */
import { i18nKey } from '@totalclaw/i18n';
import type { FauCheckMark, FauChecklistItem, FauChecklistResult, FauMsg } from '@totalclaw/ipc-contracts';
import type { FxRateRow, JournalRow, ManualChecklist, TbRow } from '../../../types';
import { KEYWORDS, codeUnder, hasAny, inPeriod, msg } from '../common';

export interface ChecklistItemDef { id: string; label: string; auto: boolean; critical: boolean }

export const CLOSE_CHECKLIST_ITEMS: ChecklistItemDef[] = [
  { id: 'oa_freeze', label: i18nKey('OA 审批流冻结'), auto: false, critical: false },
  { id: 'erp_period_close', label: i18nKey('ERP 物料账期关闭'), auto: false, critical: false },
  { id: 'depreciation', label: i18nKey('固定资产折旧凭证已生成'), auto: true, critical: true },
  { id: 'bank_recon', label: i18nKey('所有银行账户已完成银企对账'), auto: true, critical: true },
  { id: 'ar_ap_clearing', label: i18nKey('往来核销凭证已生成'), auto: false, critical: true },
  { id: 'fx_rate', label: i18nKey('期末汇率已维护'), auto: true, critical: false },
  { id: 'cost_calc', label: i18nKey('当月成本计算已完成'), auto: false, critical: false },
  { id: 'expense_allocation', label: i18nKey('期间费用分摊凭证已生成'), auto: false, critical: false },
  { id: 'revenue', label: i18nKey('当月收入已全部确认'), auto: false, critical: false },
  { id: 'purchase', label: i18nKey('当月采购已入库并确认应付'), auto: false, critical: false },
  { id: 'payroll', label: i18nKey('工资已计提、社保公积金已核对'), auto: false, critical: false },
  { id: 'accruals', label: i18nKey('已发生未报销费用已预提'), auto: true, critical: false },
  { id: 'asset_count', label: i18nKey('当月新增资产已盘点'), auto: false, critical: false },
  { id: 'invoice_archive', label: i18nKey('当月发票附件已归档'), auto: false, critical: false },
  { id: 'tax_filing', label: i18nKey('月度税务申报已完成'), auto: false, critical: false },
];

export interface ChecklistInput {
  period: string;
  journal: JournalRow[];
  tb: TbRow[];
  trialBalanced: boolean | null;
  bankReconDone: boolean;
  accrualRan: boolean;
  fxRates: FxRateRow[];
  hasForeignCurrency: boolean;
  manual: ManualChecklist;
}

function isDepreciationLine(r: JournalRow): boolean {
  return r.credit > 0 && (KEYWORDS.depreciationCodes.some((c) => codeUnder(r.accountCode, c)) || hasAny(r.accountName, KEYWORDS.depreciationNames));
}

function autoMark(id: string, input: ChecklistInput): { mark: FauCheckMark; evidence?: string; note?: FauMsg } | null {
  switch (id) {
    case 'depreciation': {
      const hit = input.journal.find((r) => inPeriod(r.date, input.period) && isDepreciationLine(r));
      return hit
        ? { mark: 'ok', evidence: hit.voucherNo, note: msg(i18nKey('折旧凭证 {p0}'), { p0: hit.voucherNo }) }
        : { mark: 'fail', note: msg(i18nKey('本期序时账里没有贷记累计折旧的分录')) };
    }
    case 'bank_recon':
      return input.bankReconDone ? { mark: 'ok', note: msg(i18nKey('本项目已有银企对账结果')) } : { mark: 'fail', note: msg(i18nKey('本项目还没有银企对账结果，请先在对账中心完成')) };
    case 'fx_rate':
      if (!input.hasForeignCurrency) return { mark: 'ok', note: msg(i18nKey('无外币业务')) };
      return input.fxRates.length ? { mark: 'ok', note: msg(i18nKey('已提供 {n} 个币种的期末汇率'), { n: input.fxRates.length }) } : { mark: 'fail', note: msg(i18nKey('有外币业务但没有期末汇率表')) };
    case 'accruals':
      return input.accrualRan ? { mark: 'ok', note: msg(i18nKey('本次运行已生成计提表')) } : null;
    default:
      return null;
  }
}

export function closeChecklist(input: ChecklistInput, th: Record<string, number> = {}): FauChecklistResult {
  const items: FauChecklistItem[] = CLOSE_CHECKLIST_ITEMS.map((def) => {
    const manual = input.manual[def.id];
    const auto = def.auto ? autoMark(def.id, input) : null;
    const mark: FauCheckMark = manual?.mark || auto?.mark || 'pending';
    return {
      id: def.id,
      label: msg(def.label),
      auto: def.auto,
      critical: def.critical,
      mark,
      evidence: manual?.evidence || auto?.evidence,
      note: manual ? (auto && manual.mark !== auto.mark ? msg(i18nKey('人工标记，覆盖自动判断')) : undefined) : auto?.note,
    };
  });
  const counts: Record<FauCheckMark, number> = { ok: 0, warn: 0, fail: 0, pending: 0 };
  for (const it of items) counts[it.mark] += 1;

  const maxFail = th['checklist.maxFail'] ?? 1;
  const maxWarn = th['checklist.maxWarn'] ?? 3;
  const reasons: FauMsg[] = [];
  if (counts.fail > maxFail) reasons.push(msg(i18nKey('❌ 项 {n} 个，超过上限 {max} 个'), { n: counts.fail, max: maxFail }));
  if (counts.warn > maxWarn) reasons.push(msg(i18nKey('⚠️ 项 {n} 个，超过上限 {max} 个'), { n: counts.warn, max: maxWarn }));
  const MAINLINE: Record<string, string> = {
    depreciation: i18nKey('结账主线未完成：折旧未计提'),
    bank_recon: i18nKey('结账主线未完成：银行对账未完成'),
    ar_ap_clearing: i18nKey('结账主线未完成：往来核销未完成'),
  };
  for (const it of items) {
    if (it.critical && it.mark === 'fail') reasons.push(msg(MAINLINE[it.id]));
  }
  if (input.trialBalanced === false) reasons.push(msg(i18nKey('结账主线未完成：试算表不平衡')));
  if (input.trialBalanced === null) reasons.push(msg(i18nKey('试算表还没有生成')));
  if (counts.pending) reasons.push(msg(i18nKey('还有 {n} 项没有勾选状态'), { n: counts.pending }));
  return { items, counts, canStart: reasons.length === 0, reasons };
}
