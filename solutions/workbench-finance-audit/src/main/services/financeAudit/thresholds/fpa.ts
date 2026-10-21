/** 批次 5（fpa）模块的阈值文件登记：模块 id → thresholds/<模块>.json（每条带出处，第 6.5 节）。 */
import type { ThresholdFile } from '../thresholds';
import mgmtReport from './mgmt-report.json';
import kpi from './kpi.json';
import finAnalysis from './fin-analysis.json';
import budget from './budget.json';
import cost from './cost.json';
import insight from './insight.json';
import esg from './esg.json';
import strategy from './strategy.json';

export const FPA_THRESHOLD_FILES: Record<string, ThresholdFile> = {
  'mgmt-report': mgmtReport as unknown as ThresholdFile,
  kpi: kpi as unknown as ThresholdFile,
  'fin-analysis': finAnalysis as unknown as ThresholdFile,
  budget: budget as unknown as ThresholdFile,
  cost: cost as unknown as ThresholdFile,
  insight: insight as unknown as ThresholdFile,
  esg: esg as unknown as ThresholdFile,
  strategy: strategy as unknown as ThresholdFile,
};
