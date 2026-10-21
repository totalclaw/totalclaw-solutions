/** accounting 分组（批次 2：A3–A8）第 ④ 步的结果面板；A1 / A2 的面板在 ModuleRunner 里直接挂 */
import type { Component } from 'vue';
import './panels.css';
import ArPanel from './ArPanel.vue';
import ApPanel from './ApPanel.vue';
import ExpensePanel from './ExpensePanel.vue';
import FixedAssetsPanel from './FixedAssetsPanel.vue';
import PayrollPanel from './PayrollPanel.vue';
import IntercompanyPanel from './IntercompanyPanel.vue';

export const PANELS: Record<string, Component> = {
  ar: ArPanel,
  ap: ApPanel,
  expense: ExpensePanel,
  'fixed-assets': FixedAssetsPanel,
  payroll: PayrollPanel,
  intercompany: IntercompanyPanel,
};
