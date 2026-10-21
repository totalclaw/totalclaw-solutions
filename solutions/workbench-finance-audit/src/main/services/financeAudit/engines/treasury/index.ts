/** 财会审计 · treasury 分组的 runner 注册表（模块 id → ModuleRunner）。批次 6：E1–E7。 */
import type { ModuleRunner } from '../../runner';
import { cashRunner, eclRunner, financingRunner, fxRunner, investmentsRunner, treasuryRunner, workingCapitalRunner } from './runners';

export const RUNNERS: Record<string, ModuleRunner> = {
  cash: cashRunner,
  treasury: treasuryRunner,
  fx: fxRunner,
  financing: financingRunner,
  ifrs9: eclRunner,
  'working-capital': workingCapitalRunner,
  investments: investmentsRunner,
};
