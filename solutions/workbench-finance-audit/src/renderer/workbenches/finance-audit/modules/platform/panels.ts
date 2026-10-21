/** G0 平台：P6 企业技能自建（批次 8）没有七步，直接在模块页显示引导面板。 */
import type { Component } from 'vue';
import SkillStudioPanel from './SkillStudioPanel.vue';

export const PANELS: Record<string, Component> = { 'skill-studio': SkillStudioPanel };
