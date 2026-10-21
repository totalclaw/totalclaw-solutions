/** 审计组（B1–B6）阈值文件登记：thresholds.ts 合并进 FILES（模块 id → 文件）。 */
import icfr from '../../thresholds/icfr.json';
import internalAudit from '../../thresholds/internal-audit.json';
import extAudit from '../../thresholds/ext-audit.json';
import review from '../../thresholds/review.json';
import fraud from '../../thresholds/fraud.json';
import kyc from '../../thresholds/kyc.json';

type ThresholdFile = { version: string; items: Record<string, { value: number; label: string; source: { file: string; section: string } }> };

export const AUDIT_THRESHOLD_FILES: Record<string, ThresholdFile> = {
  icfr: icfr as unknown as ThresholdFile,
  'internal-audit': internalAudit as unknown as ThresholdFile,
  'ext-audit': extAudit as unknown as ThresholdFile,
  review: review as unknown as ThresholdFile,
  fraud: fraud as unknown as ThresholdFile,
  kyc: kyc as unknown as ThresholdFile,
};
