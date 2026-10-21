<template>
  <span v-if="flags?.length" class="fau-flags">
    <span v-for="(f, i) in flags" :key="`${f.code}-${i}`" class="fau-badge" :class="f.level === 'block' ? 'bad' : f.level === 'warn' ? 'warn' : 'muted'">{{ $t(flagKey(f.code), f.params || {}) }}</span>
  </span>
  <span v-else-if="okText" class="fau-badge ok">{{ okText }}</span>
</template>

<script setup lang="ts">
/** 批次 2 结果里的问题标记（code → 词典 key，参数插值），按级别着色 */
import type { FauFlag } from '@totalclaw/ipc-contracts';
import { flagKey } from '../../../../../shared/financeAudit/accountingLabels';

defineProps<{ flags?: FauFlag[] | null; okText?: string }>();
</script>

<style scoped>
.fau-flags { display: inline-flex; flex-wrap: wrap; gap: 4px; }
.fau-flags .fau-badge { white-space: normal; }
</style>
