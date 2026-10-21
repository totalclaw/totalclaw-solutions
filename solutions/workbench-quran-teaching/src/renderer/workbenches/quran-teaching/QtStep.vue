<template>
  <article class="qt-step" :class="[`is-${runtime.state}`, { current: isCurrent }]" :data-qt-step="stepKey">
    <header class="qt-step__head">
      <span class="qt-step__no">
        <i v-if="runtime.state === 'done'" class="ri-check-line"></i>
        <i v-else-if="runtime.state === 'running'" class="ri-loader-4-line qt-spin"></i>
        <i v-else-if="runtime.state === 'failed'" class="ri-close-line"></i>
        <template v-else>{{ index + 1 }}</template>
      </span>
      <div class="qt-step__title">
        <strong><i :class="icon"></i> {{ $t('第 {n} 步', { n: index + 1 }) }} · {{ title }}</strong>
        <small v-if="hint">{{ hint }}</small>
      </div>
      <div class="qt-step__tools"><slot name="tools"></slot></div>
      <em class="qt-step__state" :class="runtime.state">
        <template v-if="runtime.state === 'todo'">{{ $t('待执行') }}</template>
        <template v-else-if="runtime.state === 'running'">{{ $t('进行中') }}</template>
        <template v-else-if="runtime.state === 'done'">{{ $t('完成') }}</template>
        <template v-else>{{ $t('失败') }}</template>
      </em>
    </header>
    <p v-if="runtime.state === 'failed' && runtime.error" class="qt-step__error"><i class="ri-error-warning-line"></i>{{ runtime.error }}</p>
    <p v-else-if="runtime.state === 'done' && runtime.summary" class="qt-step__summary"><i class="ri-checkbox-circle-line"></i>{{ runtime.summary }}</p>
    <div class="qt-step__body"><slot></slot></div>
  </article>
</template>

<script setup lang="ts">
/** 步骤卡：编号 / 标题 / 独立状态；失败原因就写在这一步上（UX 硬规则一）。 */
import type { StepRuntime } from './shared';
defineProps<{ stepKey: string; index: number; title: string; hint?: string; icon?: string; runtime: StepRuntime; isCurrent?: boolean }>();
</script>
