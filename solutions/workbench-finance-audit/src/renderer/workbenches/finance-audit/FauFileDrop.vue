<template>
  <div
    class="fau-drop" :class="{ over, disabled }" role="button" tabindex="0"
    @click="!disabled && choose()" @keydown.enter.prevent="!disabled && choose()"
    @dragover.prevent="!disabled && (over = true)" @dragleave.prevent="over = false" @drop.prevent="onDrop"
  >
    <i :class="kind === 'evidence' ? 'ri-file-text-line' : 'ri-file-excel-2-line'"></i>
    <div class="fau-drop__text">
      <strong>{{ label }}</strong>
      <small>{{ hint || (multi ? $t('把文件拖到这里，或点击选择（可多选）') : $t('把文件拖到这里，或点击选择')) }}</small>
    </div>
    <button type="button" class="ss-btn ghost sm" :disabled="disabled" @click.stop="choose"><i class="ri-folder-open-line"></i>{{ $t('选择文件') }}</button>
  </div>
</template>

<script setup lang="ts">
/**
 * 拖拽 + 点选的文件输入（照财务智能体 FileDrop.vue 的做法），选文件走本方案自己的 data.pick，
 * 不动服务商结算的 FileDropField（它写死了结算工作台的选文件通道）。
 */
import { ref } from 'vue';
import { EXCEL_RE, droppedPaths } from '../service-settlement/shared';
import { errorMessage, fau } from './shared';
import { useNotificationStore } from '../../stores/notification';

const props = withDefaults(defineProps<{ label: string; hint?: string; kind?: string; multi?: boolean; disabled?: boolean }>(), { hint: '', kind: '', multi: false, disabled: false });
const emit = defineEmits<{ (e: 'picked', paths: string[]): void }>();
const over = ref(false);
const EVIDENCE_RE = /\.(pdf|ofd|docx|xlsx|xls|png|jpe?g)$/i;
/** 银行流水另收 MT940 / CAMT.053 对账单（批次 2） */
const BANK_RE = /\.(xlsx|xls|xlsm|csv|sta|mt940|940|txt|xml|053)$/i;

async function choose(): Promise<void> {
  try {
    const r = await fau<{ paths: string[] }>('data.pick', { kind: props.kind, multi: props.multi });
    if (r?.paths?.length) emit('picked', props.multi ? r.paths : r.paths.slice(0, 1));
  } catch (e) {
    useNotificationStore().error(errorMessage(e));
  }
}
function onDrop(ev: DragEvent): void {
  over.value = false;
  if (props.disabled) return;
  const paths = droppedPaths(ev, props.kind === 'evidence' ? EVIDENCE_RE : props.kind === 'bank' ? BANK_RE : EXCEL_RE);
  if (paths.length) emit('picked', props.multi ? paths : paths.slice(0, 1));
}
</script>

<style scoped>
.fau-drop { display: flex; align-items: center; gap: 14px; padding: 12px 14px; border: 1.5px dashed var(--color-border); border-radius: var(--radius-5); background: var(--color-bg-primary); cursor: pointer; }
.fau-drop:hover, .fau-drop.over { border-color: var(--color-brand); }
.fau-drop.disabled { opacity: .6; cursor: not-allowed; }
.fau-drop > i { font-size: 22px; color: var(--color-brand); }
.fau-drop__text { flex: 1; min-width: 0; display: grid; gap: 2px; }
.fau-drop__text strong { font-size: var(--font-size-md); }
.fau-drop__text small { color: var(--color-text-secondary); font-size: var(--font-size-sm); }
</style>
