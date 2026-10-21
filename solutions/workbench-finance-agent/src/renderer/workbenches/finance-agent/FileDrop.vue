<template>
  <div
    class="fa-drop" :class="{ over, disabled, compact }" role="button" tabindex="0"
    @click="!disabled && choose()" @keydown.enter.prevent="!disabled && choose()"
    @dragover.prevent="!disabled && (over = true)" @dragleave.prevent="over = false" @drop.prevent="onDrop"
  >
    <i :class="icon"></i>
    <div class="fa-drop__text">
      <strong>{{ label }}</strong>
      <small>{{ hint || (multi ? $t('把文件拖到这里，或点击选择（可多选）') : $t('把文件拖到这里，或点击选择')) }}</small>
    </div>
    <button type="button" class="ss-btn ghost sm" :disabled="disabled" @click.stop="choose"><i class="ri-folder-open-line"></i>{{ $t('选择文件') }}</button>
  </div>
</template>

<script setup lang="ts">
/**
 * 拖拽 + 点选的文件输入（财务智能体版：走 fa('files.pick')，按用途过滤类型）。
 */
import { computed, ref } from 'vue';
import { CONTRACT_RE, EXCEL_RE, INVOICE_RE, POLICY_RE, droppedPaths, pickFiles } from './shared';

const props = withDefaults(defineProps<{
  label: string;
  hint?: string;
  kind: 'invoice' | 'excel' | 'contract' | 'policy';
  multi?: boolean;
  disabled?: boolean;
  compact?: boolean;
}>(), { multi: true, disabled: false, compact: false, hint: '' });
const emit = defineEmits<{ (e: 'picked', paths: string[]): void }>();
const over = ref(false);
const icon = computed(() => ({ invoice: 'ri-bill-line', excel: 'ri-file-excel-2-line', contract: 'ri-file-text-line', policy: 'ri-book-2-line' }[props.kind]));
const accept = computed(() => ({ invoice: INVOICE_RE, excel: EXCEL_RE, contract: CONTRACT_RE, policy: POLICY_RE }[props.kind]));

async function choose(): Promise<void> {
  const paths = await pickFiles(props.kind, props.multi);
  if (paths.length) emit('picked', props.multi ? paths : paths.slice(0, 1));
}
function onDrop(ev: DragEvent): void {
  over.value = false;
  if (props.disabled) return;
  const paths = droppedPaths(ev, accept.value);
  if (paths.length) emit('picked', props.multi ? paths : paths.slice(0, 1));
}
</script>

<style scoped>
.fa-drop { display: flex; align-items: center; gap: 14px; padding: 14px 16px; border: 1.5px dashed var(--color-border); border-radius: 12px; background: var(--color-bg-primary); cursor: pointer; transition: border-color .15s, background .15s; }
.fa-drop.compact { padding: 9px 12px; }
.fa-drop:hover, .fa-drop.over { border-color: var(--color-brand); background: color-mix(in srgb, var(--color-brand) 6%, var(--color-bg-primary)); }
.fa-drop.disabled { opacity: .6; cursor: not-allowed; }
.fa-drop > i { font-size: 24px; color: var(--color-brand); flex: 0 0 auto; }
.fa-drop__text { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.fa-drop__text strong { font-size: 13px; }
.fa-drop__text small { color: var(--color-text-secondary); font-size: 12px; }
</style>
