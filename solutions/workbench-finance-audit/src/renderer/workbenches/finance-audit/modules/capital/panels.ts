/** G6 投融资与估值（F1–F8）的面板：八个模块共用一套表驱动的录入面板（第 ② 步）与结果面板（第 ④ 步）。 */
import type { Component } from 'vue';
import CapitalInputPanel from './CapitalInputPanel.vue';
import CapitalResultPanel from './CapitalResultPanel.vue';

const IDS = ['valuation', 'capex', 'ma', 'ib', 'pe', 'research', 'markets', 'wealth'];
export const PANELS: Record<string, Component> = Object.fromEntries(IDS.map((id) => [id, CapitalResultPanel]));
export const INPUTS: Record<string, Component> = Object.fromEntries(IDS.map((id) => [id, CapitalInputPanel]));
