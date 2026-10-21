/** 财会审计 · capital 分组（F1–F8，批次 7）的 runner 注册表：八个模块共用一个表驱动的 runner。 */
import type { ModuleRunner } from '../../runner';
import { capitalRunner } from './runner';

export const RUNNERS: Record<string, ModuleRunner> = Object.fromEntries(
  ['valuation', 'capex', 'ma', 'ib', 'pe', 'research', 'markets', 'wealth'].map((id) => [id, capitalRunner]),
);
