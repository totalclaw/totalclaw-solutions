<template>
  <section class="cc-panel cc-prompt" :data-cc-prompt="kind">
    <header class="cc-panel__head">
      <strong><i :class="icon"></i>{{ label }}</strong>
      <span class="cc-muted">{{ hint }}</span>
      <span class="grow"></span>
      <small class="cc-muted" dir="ltr">{{ $t('{n}/{max} 字', { n: modelValue.length, max }) }}</small>
      <button type="button" class="cc-btn sm ghost" data-act="reset" :disabled="disabled || modelValue === defaultValue" @click="$emit('update:modelValue', defaultValue)">
        <i class="ri-arrow-go-back-line"></i>{{ $t('恢复默认') }}
      </button>
    </header>
    <textarea
      class="cc-textarea" rows="3" :maxlength="max" :disabled="disabled" :value="modelValue" :dir="dir" :lang="lang"
      :placeholder="$t('留空则按不加提示词的方式生成')"
      @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
    ></textarea>
    <details v-if="$slots.effective" class="cc-prompt__effective">
      <summary><i class="ri-eye-line"></i>{{ $t('本次实际使用的提示词') }}</summary>
      <slot name="effective" />
    </details>
  </section>
</template>

<script setup lang="ts">
/** 慈善工场的提示词输入框：预填默认提示词（不是占位灰字）、可改、一键恢复默认；可选展开「本次实际使用的提示词」 */
import { CHARITY_PROMPT_MAX } from '../../../shared/charityPrompts';

withDefaults(defineProps<{
  kind: 'content' | 'video';
  modelValue: string;
  defaultValue: string;
  label: string;
  hint: string;
  icon?: string;
  disabled?: boolean;
  dir?: 'ltr' | 'rtl' | 'auto';
  lang?: string;
  max?: number;
}>(), { icon: 'ri-quill-pen-line', disabled: false, dir: 'auto', lang: undefined, max: CHARITY_PROMPT_MAX });
defineEmits<{ (e: 'update:modelValue', v: string): void }>();
</script>
