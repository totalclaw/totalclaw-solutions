import { defaultState, type ModuleState } from './demoData';
import type { SaudiModuleId } from './types';

/**
 * 现场变更状态的按案件存取。
 *
 * 单独成模块是为了能单测：这条规则原先散在组件里，结果**漏了**——
 * `state` 是整个工作台一份，在 A 单点完「模拟变更」再切到 B 单，
 * B 单的卡片会显示 A 单的塔布克 / 3 年，而且和 B 单自己的审计对不上。
 *
 * 它决定卡片里的交付地点、保修年限、BOM 主备选与门槛改判 —— 属于
 * 「对这一单做了什么」，不是工作台的全局偏好。
 */

export function moduleStateKey(moduleId: SaudiModuleId, caseId: string): string {
  return `totalclaw:saudi:module-state:${moduleId}:${caseId}`;
}

/** 只需要 getItem/setItem/removeItem 三个方法，便于在测试里塞假实现。 */
export interface KeyValueStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

/** 读某一单的现场变更；没存过或存坏了都回默认值（不能因为一条脏数据开不了单）。 */
export function readModuleState(
  store: KeyValueStore | undefined,
  moduleId: SaudiModuleId,
  caseId: string,
): ModuleState {
  const base = defaultState(moduleId);
  if (!store || !caseId) return base;
  try {
    const raw = store.getItem(moduleStateKey(moduleId, caseId));
    return raw ? { ...base, ...JSON.parse(raw) } : base;
  } catch {
    return base;
  }
}

export function writeModuleState(
  store: KeyValueStore | undefined,
  moduleId: SaudiModuleId,
  caseId: string,
  state: ModuleState,
): void {
  if (!store || !caseId) return;
  try { store.setItem(moduleStateKey(moduleId, caseId), JSON.stringify(state)); } catch { /* 存不下不影响本次变更 */ }
}

export function clearModuleState(
  store: KeyValueStore | undefined,
  moduleId: SaudiModuleId,
  caseId: string,
): void {
  if (!store || !caseId) return;
  try { store.removeItem(moduleStateKey(moduleId, caseId)); } catch { /* */ }
}
