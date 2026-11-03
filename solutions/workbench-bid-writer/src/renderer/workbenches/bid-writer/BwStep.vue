<template>
  <article ref="root" v-show="shown" class="bw-step" :class="[`is-${runtime.state}`, { current: isCurrent }]" :data-bw-step="stepKey">
    <header class="bw-step__head">
      <span class="bw-step__no">
        <i v-if="runtime.state === 'done'" class="ri-check-line"></i>
        <i v-else-if="runtime.state === 'running'" class="ri-loader-4-line bw-spin"></i>
        <i v-else-if="runtime.state === 'failed'" class="ri-close-line"></i>
        <template v-else>{{ index + 1 }}</template>
      </span>
      <div class="bw-step__title">
        <strong><i :class="icon"></i>{{ $t('第 {n} 步', { n: index + 1 }) }} · {{ title }}</strong>
        <small>{{ hint }}</small>
      </div>
      <div class="bw-step__tools"><slot name="tools"></slot></div>
      <em class="bw-step__state" :class="runtime.state">
        <template v-if="runtime.state === 'todo'">{{ $t('待执行') }}</template>
        <template v-else-if="runtime.state === 'running'">{{ $t('进行中') }}</template>
        <template v-else-if="runtime.state === 'done'">{{ $t('完成') }}</template>
        <template v-else>{{ $t('失败') }}</template>
      </em>
    </header>
    <p v-if="runtime.state === 'failed' && runtime.error" class="bw-step__msg bad">
      <i class="ri-error-warning-line"></i>{{ runtime.error }}
    </p>
    <p v-else-if="runtime.state === 'done' && runtime.summary" class="bw-step__msg ok">
      <i class="ri-checkbox-circle-line"></i>{{ runtime.summary }}
    </p>
    <div v-if="rendered" class="bw-step__body"><slot></slot></div>
  </article>
</template>

<script setup lang="ts">
/**
 * 步骤卡：编号 / 标题 / 独立状态（待执行·进行中·完成·失败），失败原因就写在这一步上。
 * 对应 docs/solution-workbench-ux-guidelines.md 规则一。
 */
import { computed, onMounted, ref, watch } from 'vue';
import type { StepRuntime } from './shared';
import { findStepTabsGroup, stepTabGroups } from './bwStepTabs';

const props = defineProps<{
  stepKey: string;
  index: number;
  title: string;
  hint: string;
  icon: string;
  runtime: StepRuntime;
  isCurrent?: boolean;
}>();

// 页签模式（bwStepTabs.ts）：同组进度条选中哪步就只显示哪步；第一次显示才渲染内容，之后切走只隐藏
const root = ref<HTMLElement | null>(null);
const group = ref('');
const resolved = ref(false);
onMounted(() => { group.value = findStepTabsGroup(root.value); resolved.value = true; });
const shown = computed(() => {
  if (!resolved.value) return false;
  const g = group.value ? stepTabGroups[group.value] : null;
  return !g || !g.active || g.active === props.stepKey;
});
const rendered = ref(false);
watch(shown, (v) => { if (v) rendered.value = true; });
</script>
