<template>
  <div v-if="open" class="fau-drawer-mask" @click="emit('close')"></div>
  <aside v-if="open" class="fau-drawer" role="dialog" :aria-label="$t('判断依据')" data-test="fau-judgement-drawer">
    <header>
      <h3><i class="ri-scales-3-line"></i> {{ $t('判断依据') }}</h3>
      <button type="button" class="ss-btn ghost sm" @click="emit('close')"><i class="ri-close-line"></i></button>
    </header>
    <div class="fau-drawer__body">
      <p class="ss-note info"><i class="ri-information-line"></i>{{ $t('阈值默认值来自源技能的判断框架，可在首次配置里按公司修改；原文为中文，以原文为准。') }}</p>
      <p v-if="error" class="ss-note danger"><i class="ri-error-warning-line"></i>{{ error }}</p>
      <div v-else class="fau-table-wrap">
        <table class="fau-table">
          <thead><tr><th>{{ $t('阈值') }}</th><th class="num">{{ $t('当前值') }}</th><th>{{ $t('依据') }}</th></tr></thead>
          <tbody>
            <tr v-for="it in items" :key="it.key">
              <td class="wrap">
                <div>{{ it.label ? $t(it.label) : it.original }}</div>
                <small class="ss-muted" :title="$t('以原文为准')">{{ it.original }}</small>
              </td>
              <td class="num">
                <FauNum :value="thresholdText(it, it.override ?? it.value)" /> {{ thresholdUnit(it, currency || '') }}
                <small v-if="it.override != null" class="ss-muted"> · {{ $t('已按公司覆盖') }}</small>
              </td>
              <td class="wrap"><small>{{ thresholdBasisText(it) }}</small></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
/** 「判断依据」抽屉：阈值表（三语名称）+ 原文（中文，标「以原文为准」）+ 可读的依据名与章节（第 6.5 节；不显示上游仓库路径） */
import { ref, watch } from 'vue';
import FauNum from './FauNum.vue';
import { errorMessage, fau, thresholdBasisText, thresholdText, thresholdUnit, type ThresholdItem } from './shared';

const props = defineProps<{ open: boolean; modules: string[]; currency?: string }>();
const emit = defineEmits<{ (e: 'close'): void }>();
const items = ref<ThresholdItem[]>([]);
const error = ref('');
watch(() => props.open, async (v) => {
  if (!v) return;
  try { items.value = await fau<ThresholdItem[]>('thresholds.get', { modules: props.modules }); error.value = ''; } catch (e) { error.value = errorMessage(e); }
}, { immediate: true });
</script>
