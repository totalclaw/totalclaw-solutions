/** 财会审计 · audit 分组的规则引擎 runner 注册表（模块 id → ModuleRunner）。批次 3：B1–B6。P4 质检是首页独立工具，不走七步、不在这里登记。 */
import type { ModuleRunner } from '../../runner';
import { icfrRunner } from './icfrRunner';
import { internalAuditRunner } from './internalAuditRunner';
import { extAuditRunner } from './extAuditRunner';
import { reviewRunner } from './reviewRunner';
import { fraudRunner } from './fraudRunner';
import { kycRunner } from './kycRunner';

export const RUNNERS: Record<string, ModuleRunner> = {
  icfr: icfrRunner,
  'internal-audit': internalAuditRunner,
  'ext-audit': extAuditRunner,
  review: reviewRunner,
  fraud: fraudRunner,
  kyc: kycRunner,
};
