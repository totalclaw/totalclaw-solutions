/**
 * 步骤页签模式（2026-11-03 用户要求：工作台步骤改成页签 + 懒加载，整页一长条太卡）。
 *
 * BwProgress（进度条）与 BwStep（步骤卡）在各工作台里是兄弟节点，provide/inject 够不着，
 * 所以用一个按「组」登记的小注册表：每个进度条一组（data-step-tabs="组 id"），步骤卡挂载后
 * 沿 DOM 往上找最近的、里面有进度条的祖先，认那一组。同一页面多个模块（v-show 切换、步骤 key 还可能重名）
 * 各认各的进度条，互不干扰。
 *
 * 只显示当前一步；第一次切到某步才渲染它的内容（懒加载），之后切走只隐藏不卸载（已填的内容 / 选好的文件不丢）。
 * 找不到进度条的步骤卡照旧全部显示（不是所有页面都有进度条）。
 */
import { reactive } from 'vue';

export interface StepTabsGroup {
  active: string;
}

let seq = 0;
export const stepTabGroups = reactive<Record<string, StepTabsGroup>>({});

export function registerStepTabs(initial: string): string {
  seq += 1;
  const id = `stg${seq}`;
  stepTabGroups[id] = { active: initial };
  return id;
}

export function unregisterStepTabs(id: string): void {
  delete stepTabGroups[id];
}

export function setActiveStep(id: string, key: string): void {
  const g = stepTabGroups[id];
  if (g && key) g.active = key;
}

/** 步骤卡认组：最近的、内部有 [data-step-tabs] 的祖先里的那个进度条 */
export function findStepTabsGroup(el: Element | null): string {
  for (let n = el?.parentElement ?? null; n; n = n.parentElement) {
    const bar = n.querySelector(':scope [data-step-tabs]');
    if (bar && !el!.contains(bar)) return bar.getAttribute('data-step-tabs') || '';
  }
  return '';
}
