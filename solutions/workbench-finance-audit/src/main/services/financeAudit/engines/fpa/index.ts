/** 财会审计 · fpa 分组的 runner 注册表（模块 id → ModuleRunner）。批次 5：D1–D10。 */
import type { ModuleRunner } from '../../runner';
import { finAnalysisRunner, irRunner, mgmtReportRunner } from './reports';
import { esgRunner, insightRunner, kpiRunner, strategyRunner } from './indicators';
import { budgetRunner, costRunner } from './budgetCost';
import { boardRunner } from './board';

export const RUNNERS: Record<string, ModuleRunner> = {
  'mgmt-report': mgmtReportRunner,
  kpi: kpiRunner,
  'fin-analysis': finAnalysisRunner,
  budget: budgetRunner,
  cost: costRunner,
  insight: insightRunner,
  board: boardRunner,
  esg: esgRunner,
  strategy: strategyRunner,
  ir: irRunner,
};
