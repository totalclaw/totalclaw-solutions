/** 审计组（B1–B6）第 ④ 步结果面板，经 modules/panels.ts 汇总；P4 质检（OfficeQcPanel）是独立入口面板，ModuleRunner 直接挂。 */
import type { Component } from 'vue';
import IcfrPanel from './IcfrPanel.vue';
import InternalAuditPanel from './InternalAuditPanel.vue';
import ExtAuditPanel from './ExtAuditPanel.vue';
import ReviewPanel from './ReviewPanel.vue';
import FraudPanel from './FraudPanel.vue';
import KycPanel from './KycPanel.vue';

export const PANELS: Record<string, Component> = {
  icfr: IcfrPanel,
  'internal-audit': InternalAuditPanel,
  'ext-audit': ExtAuditPanel,
  review: ReviewPanel,
  fraud: FraudPanel,
  kyc: KycPanel,
};
