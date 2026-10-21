/**
 * 各分组的面板（模块 id → 组件）。每个分组在 modules/<group>/panels.ts 里导出 PANELS（第 ④ 步结果）
 * 与可选的 INPUTS（第 ② 步录入），这里按目录自动汇总：之后的批次只加自己分组的 panels.ts，不用再改 ModuleRunner。
 */
import type { Component } from 'vue';

const groups = import.meta.glob<{ PANELS?: Record<string, Component>; INPUTS?: Record<string, Component> }>('./*/panels.ts', { eager: true });

export const GROUP_PANELS: Record<string, Component> = Object.assign({}, ...Object.values(groups).map((m) => m.PANELS || {}));

/** 第 ② 步录入面板（各分组 panels.ts 导出的 INPUTS） */
export const INPUT_PANELS: Record<string, Component> = Object.assign({}, ...Object.values(groups).map((m) => m.INPUTS || {}));
