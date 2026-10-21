<template>
  <div class="ss-drop" :class="{ over, disabled, compact }">
    <div
      class="ss-drop__zone"
      role="button"
      tabindex="0"
      @click="!disabled && choose()"
      @keydown.enter.prevent="!disabled && choose()"
      @dragover.prevent="onDragOver"
      @dragleave.prevent="over = false"
      @drop.prevent="onDrop"
    >
      <i :class="icon"></i>
      <div class="ss-drop__text">
        <strong>{{ label }}</strong>
        <small>{{ hint || (multi ? $t('把文件拖到这里，或点击选择（可多选）') : $t('把文件拖到这里，或点击选择')) }}</small>
      </div>
      <button type="button" class="ss-btn ghost" :disabled="disabled" @click.stop="choose">
        <i class="ri-folder-open-line"></i>{{ $t('选择文件') }}
      </button>
    </div>
    <ul v-if="files.length" class="ss-drop__files">
      <li v-for="f in files" :key="f.path">
        <i :class="icon"></i>
        <span class="name" :title="f.path">{{ f.name }}</span>
        <small v-if="f.note">{{ f.note }}</small>
        <button type="button" class="ss-iconbtn" :title="$t('移除')" :disabled="disabled" @click="$emit('remove', f.path)">
          <i class="ri-close-line"></i>
        </button>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
/**
 * 拖拽 + 点选的文件输入。小白不用知道路径在哪：拖进来或点「选择文件」，
 * 选完直接在下面列出来，每个文件可以单独移除。
 */
import { ref } from 'vue';
import { pickFiles, droppedPaths, EXCEL_RE, PDF_RE, INVOICE_RE } from './shared';

const props = withDefaults(defineProps<{
  label: string;
  hint?: string;
  kind?: 'excel' | 'pdf' | 'invoice' | 'any';
  multi?: boolean;
  disabled?: boolean;
  compact?: boolean;
  files?: { path: string; name: string; note?: string }[];
}>(), { kind: 'excel', multi: true, disabled: false, compact: false, files: () => [] });

const emit = defineEmits<{
  (e: 'picked', paths: string[]): void;
  (e: 'remove', path: string): void;
}>();

const over = ref(false);
const icon = props.kind === 'pdf' ? 'ri-file-pdf-2-line' : props.kind === 'invoice' ? 'ri-bill-line' : 'ri-file-excel-2-line';

function acceptRe(): RegExp {
  if (props.kind === 'pdf') return PDF_RE;
  if (props.kind === 'invoice') return INVOICE_RE;
  if (props.kind === 'any') return /./;
  return EXCEL_RE;
}

async function choose(): Promise<void> {
  const paths = await pickFiles(props.kind, props.multi, props.label);
  if (paths.length) emit('picked', props.multi ? paths : paths.slice(0, 1));
}

function onDragOver(): void {
  if (!props.disabled) over.value = true;
}

function onDrop(ev: DragEvent): void {
  over.value = false;
  if (props.disabled) return;
  const paths = droppedPaths(ev, acceptRe());
  if (paths.length) emit('picked', props.multi ? paths : paths.slice(0, 1));
}
</script>

<style scoped>
.ss-drop { display: grid; gap: 8px; }
.ss-drop__zone {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 18px;
  border: 1.5px dashed var(--color-border);
  border-radius: 12px;
  background: var(--color-bg-primary);
  cursor: pointer;
  transition: border-color .15s, background .15s;
}
.compact .ss-drop__zone { padding: 10px 14px; }
.ss-drop__zone:hover, .ss-drop.over .ss-drop__zone { border-color: var(--color-brand); background: color-mix(in srgb, var(--color-brand) 6%, var(--color-bg-primary)); }
.ss-drop.disabled .ss-drop__zone { opacity: .6; cursor: not-allowed; }
.ss-drop__zone > i { font-size: 26px; color: var(--color-brand); flex: 0 0 auto; }
.ss-drop__text { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.ss-drop__text strong { font-size: 13.5px; }
.ss-drop__text small { color: var(--color-text-secondary); font-size: 12px; }
.ss-drop__files { list-style: none; margin: 0; padding: 0; display: grid; gap: 6px; }
.ss-drop__files li {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border-radius: 8px;
  background: var(--color-bg-hover);
  font-size: 12.5px;
}
.ss-drop__files li i { color: var(--color-success); }
.ss-drop__files .name { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ss-drop__files small { color: var(--color-text-secondary); white-space: nowrap; }
.ss-btn {
  display: inline-flex; align-items: center; gap: 6px; height: 34px; padding: 0 12px; border-radius: 9px;
  border: 1px solid var(--color-border); background: var(--color-bg-card); color: var(--color-text-primary);
  font: inherit; font-size: 12.5px; font-weight: 700; cursor: pointer; white-space: nowrap;
}
.ss-btn:hover { border-color: var(--color-brand); color: var(--color-brand); }
.ss-btn:disabled { opacity: .5; cursor: not-allowed; }
.ss-iconbtn {
  width: 24px; height: 24px; border-radius: 6px; border: none; background: transparent; color: var(--color-text-secondary);
  cursor: pointer; display: inline-flex; align-items: center; justify-content: center;
}
.ss-iconbtn:hover { background: var(--color-bg-card); color: var(--color-danger); }
</style>
