/**
 * 模块定义的书写形态：provenance 不手写，由 index.ts 按 sourceInventory.json 的模块编号汇总（单一来源）。
 */
import type { FauModuleDef, FauSignLevel } from '@totalclaw/ipc-contracts';

export type FauModuleSpec = Omit<FauModuleDef, 'provenance'>;

export const PRA: FauSignLevel[] = ['prepare', 'review', 'approve'];
export const PR: FauSignLevel[] = ['prepare', 'review'];
export const PA: FauSignLevel[] = ['prepare', 'approve'];

/** 规划中模块的简写：只有目录条目，首页显示「规划中（批次 N）」和对应的源模块 */
export function planned(
  spec: Pick<FauModuleSpec, 'id' | 'code' | 'group' | 'name' | 'summary' | 'archetype' | 'package' | 'batch' | 'outputs'>
    & { levels?: FauSignLevel[]; handoffTo?: string[]; reuse?: FauModuleSpec['reuse']; regions?: FauModuleSpec['regions']; standards?: FauModuleSpec['standards'] },
): FauModuleSpec {
  const levels = spec.levels ?? PR;
  return {
    id: spec.id,
    code: spec.code,
    group: spec.group,
    name: spec.name,
    summary: spec.summary,
    archetype: spec.archetype,
    modes: [],
    inputs: [],
    outputs: spec.outputs,
    signoff: { required: levels.length > 0, levels },
    regions: spec.regions ?? 'all',
    standards: spec.standards,
    handoffTo: spec.handoffTo,
    reuse: spec.reuse,
    package: spec.package,
    status: 'planned',
    batch: spec.batch,
  };
}
