<template>
  <div class="cc-asset" :class="{ compact }">
    <span v-if="!compact" class="cc-asset__name" :title="path">{{ label }}</span>
    <button type="button" class="cc-btn sm" :disabled="!path || busy" :title="$t('下载')" @click="download"><i :class="busy ? 'ri-loader-4-line cc-spin' : 'ri-download-2-line'"></i><span v-if="!compact">{{ $t('下载') }}</span></button>
    <button type="button" class="cc-btn sm ghost" :disabled="!path" :title="$t('打开所在目录')" @click="openPath(path, true)"><i class="ri-folder-open-line"></i><span v-if="!compact">{{ $t('所在目录') }}</span></button>
    <button type="button" class="cc-btn sm ghost" :disabled="!path" :title="$t('打开')" @click="openPath(path)"><i class="ri-external-link-line"></i><span v-if="!compact">{{ $t('打开') }}</span></button>
    <button type="button" class="cc-btn sm ghost" :title="$t('重新生成')" @click="$emit('regen')"><i class="ri-refresh-line"></i><span v-if="!compact">{{ $t('重新生成') }}</span></button>
  </div>
</template>

<script setup lang="ts">
/** 产物三件套：下载（系统保存框）/ 打开所在目录 / 重新生成。 */
import { ref } from 'vue';
import { useNotificationStore } from '../../stores/notification';
import { t as i18nT } from '../../i18n';
import { openPath, saveAs, errorMessage } from './shared';

const props = defineProps<{ path: string; label: string; compact?: boolean }>();
defineEmits<{ (e: 'regen'): void }>();
const busy = ref(false);
async function download(): Promise<void> {
  if (!props.path) return;
  busy.value = true;
  try { if (await saveAs(props.path, props.label)) useNotificationStore().success(i18nT('已保存')); }
  catch (e) { useNotificationStore().error(errorMessage(e)); }
  finally { busy.value = false; }
}
</script>
