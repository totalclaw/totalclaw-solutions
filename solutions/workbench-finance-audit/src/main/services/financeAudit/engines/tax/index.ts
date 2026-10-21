/** 财会审计 · tax 分组的 runner 注册表（模块 id → ModuleRunner）。批次 4：C1 纳税申报准备、C2 监管与披露、C3 转让定价。 */
import type { ModuleRunner } from '../../runner';
import { taxRunner } from './taxRunner';
import { regulatoryRunner } from './regulatoryRunner';
import { tpRunner } from './tpRunner';

export const RUNNERS: Record<string, ModuleRunner> = {
  tax: taxRunner,
  regulatory: regulatoryRunner,
  'transfer-pricing': tpRunner,
};
