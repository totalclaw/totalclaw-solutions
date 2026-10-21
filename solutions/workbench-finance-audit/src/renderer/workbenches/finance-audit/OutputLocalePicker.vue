<template>
  <span class="fau-row" :title="$t('产出物语言与界面语言独立')">
    <small class="ss-muted">{{ $t('输出语言') }}</small>
    <span class="fau-seg" role="radiogroup" :aria-label="$t('输出语言')">
      <button
        v-for="l in LOCALES" :key="l" type="button" role="radio" :aria-checked="modelValue === l"
        :class="{ on: modelValue === l }" :disabled="disabled" :data-test="`fau-locale-${l}`" @click="emit('update:modelValue', l)"
      >{{ $t(LOCALE_LABEL[l]) }}</button>
    </span>
  </span>
</template>

<script setup lang="ts">
/** 产出物语言（zh-CN / en-US / ar），与界面语言独立（第 13.2 节） */
import type { FauLocale } from '@totalclaw/ipc-contracts';
import { LOCALE_LABEL } from './shared';

defineProps<{ modelValue: FauLocale; disabled?: boolean }>();
const emit = defineEmits<{ (e: 'update:modelValue', v: FauLocale): void }>();
const LOCALES: FauLocale[] = ['zh-CN', 'en-US', 'ar'];
</script>
