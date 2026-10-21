<template>
  <div class="qt-verse" :class="{ hit }" :title="verse.ref">
    <div class="qt-ar" :class="size" lang="ar">{{ verse.arabic }}</div>
    <div style="display:grid;gap:4px;justify-items:end">
      <span class="qt-verse__ref">{{ verse.ref }}</span>
      <span class="qt-layer l1" :title="$t('第一层 · 经文源数据：锁定，只读')"><i class="ri-lock-line"></i>L1</span>
    </div>
  </div>
</template>

<script setup lang="ts">
/** 单节经文：真实文字层（可复制、可核验），带章:节与 L1 锁定标识。 */
import type { QuranVerse } from '@totalclaw/ipc-contracts';
defineProps<{ verse: QuranVerse; hit?: boolean; size?: 'sm' | 'lg' | '' }>();
</script>
