<template>
  <span class="mm-pc" :class="{ plain }" :title="dept ? `${name} · ${dept}` : name">
    <i class="mm-pc__av" :style="{ background: av.color }" aria-hidden="true">{{ av.text }}</i>
    <span class="mm-pc__name">{{ name || '—' }}</span>
    <template v-if="dept"><span class="mm-pc__dot" aria-hidden="true">·</span><span class="mm-pc__dept">{{ dept }}</span></template>
  </span>
</template>

<script setup lang="ts">
/** 头像 + 姓名（+ 部门）小胶囊（原型任务表「周婷 · 采购部」） */
import { computed } from 'vue';
import { avatarOf } from './shared';

const props = defineProps<{ name: string; dept?: string; plain?: boolean }>();
const av = computed(() => avatarOf(props.name));
</script>

<style scoped>
.mm-pc { display: inline-flex; align-items: center; gap: 5px; padding: 2px 9px 2px 3px; border-radius: var(--radius-pill); background: var(--color-bg-hover); font-size: 12.5px; color: var(--color-text-primary); white-space: nowrap; max-width: 100%; }
.mm-pc.plain { background: transparent; padding-inline: 0; }
.mm-pc__av { width: 18px; height: 18px; border-radius: 50%; flex: 0 0 18px; display: inline-grid; place-items: center; color: #fff; font-style: normal; font-size: 10px; font-weight: 700; }
.mm-pc__name { overflow: hidden; text-overflow: ellipsis; }
.mm-pc__dot, .mm-pc__dept { color: var(--color-text-secondary); }
</style>
