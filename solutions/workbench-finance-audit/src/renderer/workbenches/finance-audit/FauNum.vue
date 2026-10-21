<template>
  <bdi dir="ltr" class="fau-num"><slot>{{ text }}</slot></bdi>
</template>

<script setup lang="ts">
/**
 * 金额 / 科目编码 / 单号 / 日期统一从这里出：<bdi dir="ltr">，阿语界面里负号、括号、千分位不错位（第 13.1 节）。
 * cents：分 → 主单位；ratio：小数 → 百分比；否则原样。
 */
import { computed } from 'vue';
import { fmtCents, fmtRatio } from './shared';

const props = defineProps<{ cents?: number | null; ratio?: number | null; value?: string | number | null }>();
const text = computed(() => {
  if (props.cents !== undefined) return fmtCents(props.cents);
  if (props.ratio !== undefined) return fmtRatio(props.ratio);
  return props.value === null || props.value === undefined || props.value === '' ? '-' : String(props.value);
});
</script>
