/** 财会审计 · accounting 分组的 runner 注册表（模块 id → ModuleRunner）。批次 1：A1 close、A2 recon；批次 2：A3–A8。 */
import type { ModuleRunner } from '../../runner';
import { closeRunner } from './closeRunner';
import { reconRunner } from './reconRunner';
import { arRunner } from './ar/runner';
import { apRunner } from './ap/runner';
import { expenseRunner } from './expense/runner';
import { fixedAssetsRunner } from './fixedAssets/runner';
import { payrollRunner } from './payroll/runner';
import { intercompanyRunner } from './intercompany/runner';

export const RUNNERS: Record<string, ModuleRunner> = {
  close: closeRunner,
  recon: reconRunner,
  ar: arRunner,
  ap: apRunner,
  expense: expenseRunner,
  'fixed-assets': fixedAssetsRunner,
  payroll: payrollRunner,
  intercompany: intercompanyRunner,
};
