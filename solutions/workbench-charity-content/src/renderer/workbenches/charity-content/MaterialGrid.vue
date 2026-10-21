<template>
  <div class="cc-grid" :class="{ over, disabled }" @dragover.prevent="onOver" @dragleave.prevent="over = false" @drop.prevent="onDrop">
    <div v-if="!items.length" class="cc-grid__empty" role="button" tabindex="0" @click="$emit('pick-dir')" @keydown.enter.prevent="$emit('pick-dir')">
      <span class="cc-grid__glyph"><i class="ri-upload-cloud-2-line"></i></span>
      <strong>{{ $t('把活动素材目录或文件拖到这里') }}</strong>
      <small>{{ $t('支持 JPG / PNG / MP4 / MOV / PDF，可多选') }}</small>
      <div class="cc-actions">
        <button type="button" class="cc-btn primary" :disabled="disabled" @click.stop="$emit('pick-dir')"><i class="ri-folder-open-line"></i>{{ $t('选择目录') }}</button>
        <button type="button" class="cc-btn" :disabled="disabled" @click.stop="$emit('pick-files')"><i class="ri-file-add-line"></i>{{ $t('选择文件') }}</button>
      </div>
    </div>
    <template v-else>
      <ul class="cc-grid__list">
        <li v-for="(it, i) in items" :key="it.path" class="cc-tile" :class="[it.kind, { bad: !it.ok }]" :style="{ '--i': i }">
          <div class="cc-tile__media">
            <img v-if="it.thumbDataUrl" :src="it.thumbDataUrl" :alt="it.name" loading="lazy" />
            <span v-else class="cc-tile__icon"><i :class="it.kind === 'video' ? 'ri-film-line' : it.kind === 'pdf' ? 'ri-file-pdf-2-line' : 'ri-image-line'"></i></span>
            <span class="cc-tile__badge">{{ it.kind === 'video' ? fmtDur(it.durationSec) || 'VIDEO' : it.kind === 'pdf' ? 'PDF' : 'IMG' }}</span>
            <button type="button" class="cc-tile__remove" :title="$t('移除')" :disabled="disabled" @click.stop="$emit('remove', it.path)"><i class="ri-close-line"></i></button>
          </div>
          <div class="cc-tile__meta">
            <span class="name" :title="it.path">{{ it.name }}</span>
            <small v-if="!it.ok" class="bad">{{ it.error }}</small>
            <small v-else><bdi dir="ltr">{{ fmtSize(it.size) }}</bdi><template v-if="it.width"> · <bdi dir="ltr">{{ it.width }}×{{ it.height }}</bdi></template></small>
          </div>
        </li>
        <li class="cc-tile cc-tile--add" role="button" tabindex="0" @click="$emit('pick-files')" @keydown.enter.prevent="$emit('pick-files')">
          <i class="ri-add-line"></i><span>{{ $t('再加几个') }}</span>
        </li>
      </ul>
    </template>
  </div>
</template>

<script setup lang="ts">
/** 素材网格：拖拽 / 多选 / 缩略图 / 悬停放大 / 单个删除。路径经 preload getPathForFile 取。 */
import { ref } from 'vue';
import type { CharityMediaItem } from '@totalclaw/ipc-contracts';
import { droppedPaths, fmtDur, fmtSize } from './shared';

const props = defineProps<{ items: CharityMediaItem[]; disabled?: boolean }>();
const emit = defineEmits<{ (e: 'pick-dir'): void; (e: 'pick-files'): void; (e: 'remove', path: string): void; (e: 'dropped', paths: string[]): void }>();
const over = ref(false);
function onOver(): void { if (!props.disabled) over.value = true; }
function onDrop(ev: DragEvent): void {
  over.value = false;
  if (props.disabled) return;
  const paths = droppedPaths(ev);
  if (paths.length) emit('dropped', paths);
}
</script>
