/** treasury 分组（批次 6：E1–E7）第 ④ 步的结果面板：七个模块共用一个面板，按模块与模式渲染 */
import type { Component } from 'vue';
import TreasuryPanel from './TreasuryPanel.vue';

export const PANELS: Record<string, Component> = Object.fromEntries(
  ['cash', 'treasury', 'fx', 'financing', 'ifrs9', 'working-capital', 'investments'].map((id) => [id, TreasuryPanel]),
);
