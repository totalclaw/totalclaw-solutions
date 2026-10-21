<template>
  <div v-if="FAU_ERP_KINDS.includes(kind)" class="fau-erp" :data-test="`fau-erp-${kind}`">
    <button v-if="!open" type="button" class="ss-link" :data-test="`fau-erp-open-${kind}`" @click="toggle"><i class="ri-database-2-line"></i>{{ $t('从 ERP 取数（只读）') }}</button>
    <template v-else>
      <header class="fau-row">
        <strong class="grow"><i class="ri-database-2-line"></i> {{ $t('从 ERP 取数（只读）') }}</strong>
        <button type="button" class="ss-btn ghost sm" @click="open = false">{{ $t('收起') }}</button>
      </header>
      <p v-if="!status" class="ss-muted">{{ $t('正在读取 ERP 状态…') }}</p>
      <p v-else-if="!status.available || !status.enabled" class="ss-note warn" data-test="fau-erp-unavailable"><i class="ri-error-warning-line"></i>{{ status.reason || $t('ERP 插件没有启用，请先上传导出文件') }}</p>
      <template v-else>
        <div class="ss-grid">
          <label class="ss-field"><span>ERP</span>
            <select v-model="provider" data-test="fau-erp-provider" @change="preset">
              <option v-for="p in FAU_ERP_PROVIDERS" :key="p.id" :value="p.id">{{ $t(p.name) }}{{ configured(p.id) ? '' : ` · ${$t('未配置')}` }}</option>
            </select>
          </label>
          <label class="ss-field"><span>{{ $t('单据类型') }}</span><input v-model.trim="docType" dir="ltr" data-test="fau-erp-doctype" /></label>
        </div>
        <label class="ss-field"><span>{{ $t('查询条件（JSON）') }} <small class="ss-muted">{{ $t('占位符按项目期间代入') }} <bdi dir="ltr">{from} {to} {year} {month}</bdi></small></span>
          <textarea v-model="filters" dir="ltr" rows="3" data-test="fau-erp-filters"></textarea>
        </label>
        <p class="ss-muted">{{ $t('只调用只读查询；单次最多 {n} 行，被截断就判失败、不导入部分数据。取回后照上传文件同一步识别列、确认后导入。', { n: FAU_ERP_MAX_ROWS }) }}</p>
        <div class="ss-actions">
          <button type="button" class="ss-btn primary sm" :disabled="busy || !docType" data-test="fau-erp-pull" @click="pull"><i class="ri-download-cloud-2-line"></i>{{ $t('取数') }}</button>
        </div>
      </template>
      <p v-if="error" class="ss-note danger" data-test="fau-erp-error"><i class="ri-error-warning-line"></i>{{ error }}</p>
    </template>
  </div>
</template>

<script setup lang="ts">
/**
 * 第 ② 步「从 ERP 取数」（批次 8，第 8.2 节 P1）：金蝶云星空、用友 U8、畅捷通 T+、精斗云经 agent ERP 插件只读取数，
 * 取回的 CSV 交回 ModuleRunner 的 picked()，与上传文件同一条路（列识别 → 人工确认 → 导入）。插件没就绪就显示原因，照常上传。
 */
import { ref } from 'vue';
import type { FauErpPullResult, FauErpStatus } from '@totalclaw/ipc-contracts';
import { FAU_ERP_KINDS, FAU_ERP_MAX_ROWS, FAU_ERP_PRESETS, FAU_ERP_PROVIDERS } from '../../../../../shared/financeAudit/dataSources';
import { errorMessage, fau } from '../../shared';

const props = defineProps<{ kind: string }>();
const emit = defineEmits<{ (e: 'picked', paths: string[]): void }>();

const open = ref(false);
const busy = ref(false);
const error = ref('');
const status = ref<FauErpStatus | null>(null);
const provider = ref(FAU_ERP_PROVIDERS[0].id);
const docType = ref('');
const filters = ref('{}');

const configured = (id: string) => !!status.value?.providers.find((p) => p.id === id)?.configured;

function preset(): void {
  const p = FAU_ERP_PRESETS[provider.value]?.[props.kind];
  docType.value = p?.docType || '';
  filters.value = JSON.stringify(p?.filters || {}, null, 2);
}

async function toggle(): Promise<void> {
  open.value = true;
  error.value = '';
  try {
    status.value = await fau<FauErpStatus>('erp.status');
    const first = status.value.defaultProvider && FAU_ERP_PROVIDERS.some((p) => p.id === status.value!.defaultProvider) ? status.value.defaultProvider : FAU_ERP_PROVIDERS.find((p) => configured(p.id))?.id;
    if (first) provider.value = first;
    preset();
  } catch (e) { error.value = errorMessage(e); }
}

async function pull(): Promise<void> {
  busy.value = true; error.value = '';
  try {
    const r = await fau<FauErpPullResult>('erp.pull', { provider: provider.value, docType: docType.value, filters: filters.value });
    emit('picked', [r.path]);
    open.value = false;
  } catch (e) { error.value = errorMessage(e); } finally { busy.value = false; }
}
</script>

<style scoped>
.fau-erp { display: grid; gap: 8px; }
.fau-erp textarea { width: 100%; font-family: var(--font-mono, monospace); font-size: 12px; }
</style>
