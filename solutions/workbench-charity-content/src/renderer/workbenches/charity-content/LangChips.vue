<template>
  <div class="cc-langs" role="tablist">
    <button
      v-for="l in langs" :key="l" type="button" role="tab" class="cc-lang" :class="{ active: l === modelValue, missing: missing?.includes(l), done: done?.includes(l) }"
      :aria-selected="l === modelValue" :lang="l" @click="$emit('update:modelValue', l)"
    >{{ LANG_LABEL[l] }}<i v-if="done?.includes(l)" class="ri-check-line" :title="$t('已合成')"></i><i v-else-if="missing?.includes(l)" class="ri-time-line" :title="$t('尚未生成')"></i></button>
  </div>
</template>

<script setup lang="ts">
import { LANGS, LANG_LABEL, type Lang } from './shared';
// done 优先于 missing 显示：已经产出的那一种，比「还没填文本」更该让人一眼看见
withDefaults(defineProps<{ modelValue: Lang; langs?: Lang[]; missing?: Lang[]; done?: Lang[] }>(), { langs: () => LANGS, missing: () => [], done: () => [] });
defineEmits<{ (e: 'update:modelValue', v: Lang): void }>();
</script>
