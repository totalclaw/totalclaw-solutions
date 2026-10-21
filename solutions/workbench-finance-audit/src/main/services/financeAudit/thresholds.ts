/**
 * 量化阈值（第 6.5 节）：默认值在 thresholds/<模块>.json，每条带出处；P1 公司档案可按 key 覆盖。
 * 运行记录写下用到的阈值版本（rulesUsed），改阈值不影响已签核的运行。
 */
import close from './thresholds/close.json';
import recon from './thresholds/recon.json';
import { FPA_THRESHOLD_FILES } from './thresholds/fpa';
import tax from './thresholds/tax.json';
import regulatory from './thresholds/regulatory.json';
import transferPricing from './thresholds/transfer-pricing.json';
// 批次 2：A3–A8
import ar from './thresholds/ar.json';
import ap from './thresholds/ap.json';
import expense from './thresholds/expense.json';
import fixedAssets from './thresholds/fixed-assets.json';
import payroll from './thresholds/payroll.json';
import intercompany from './thresholds/intercompany.json';
import { AUDIT_THRESHOLD_FILES } from './engines/audit/thresholdFiles';
// 批次 7：F1 估值
import valuation from './thresholds/valuation.json';
import { TREASURY_THRESHOLD_FILES } from './engines/treasury/thresholds';

export interface ThresholdItem { value: number; label: string; source: { file: string; section: string } }
export interface ThresholdFile { version: string; items: Record<string, ThresholdItem> }

const FILES: Record<string, ThresholdFile> = {
  close: close as unknown as ThresholdFile,
  recon: recon as unknown as ThresholdFile,
  ...FPA_THRESHOLD_FILES,
  // 批次 4：税务组
  tax: tax as unknown as ThresholdFile,
  regulatory: regulatory as unknown as ThresholdFile,
  'transfer-pricing': transferPricing as unknown as ThresholdFile,
  ar: ar as unknown as ThresholdFile,
  ap: ap as unknown as ThresholdFile,
  expense: expense as unknown as ThresholdFile,
  'fixed-assets': fixedAssets as unknown as ThresholdFile,
  payroll: payroll as unknown as ThresholdFile,
  intercompany: intercompany as unknown as ThresholdFile,
  ...AUDIT_THRESHOLD_FILES,
  valuation: valuation as unknown as ThresholdFile,
  // 批次 6：资金与金融风险
  ...TREASURY_THRESHOLD_FILES,
};

export function thresholdFile(module: string): ThresholdFile | null {
  return FILES[module] || null;
}

/** 默认值 + 覆盖（覆盖只认已登记的 key、有限数字） */
export function thresholdsFor(module: string, overrides: Record<string, number> = {}): Record<string, number> {
  const f = FILES[module];
  if (!f) return {};
  const out: Record<string, number> = {};
  for (const [k, item] of Object.entries(f.items)) {
    const o = overrides[`${module}.${k}`] ?? overrides[k];
    out[k] = typeof o === 'number' && Number.isFinite(o) ? o : item.value;
  }
  return out;
}

export function thresholdVersion(module: string): string {
  return FILES[module]?.version || '';
}
