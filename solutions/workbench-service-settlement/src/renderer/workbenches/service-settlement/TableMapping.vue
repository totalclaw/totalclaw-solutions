<template>
  <div class="ss-map">
    <header class="ss-map__head">
      <i class="ri-table-line"></i>
      <strong class="ss-map__name" :title="table.path">{{ table.fileName }}</strong>
      <label v-if="table.sheetNames.length > 1" class="ss-map__sheet">
        <span>{{ $t('工作表') }}</span>
        <select :value="table.sheetName" @change="$emit('sheet', ($event.target as HTMLSelectElement).value)">
          <option v-for="n in table.sheetNames" :key="n" :value="n">{{ n }}</option>
        </select>
      </label>
      <small>{{ $t('{n} 行', { n: table.rowCount }) }}</small>
      <button type="button" class="ss-link" @click="showPreview = !showPreview">
        {{ showPreview ? $t('收起预览') : $t('看前 5 行') }}
      </button>
      <button v-if="removable" type="button" class="ss-iconbtn" :title="$t('移除')" @click="$emit('remove')"><i class="ri-close-line"></i></button>
    </header>
    <div class="ss-map__roles">
      <label v-for="r in roles" :key="r.key" class="ss-map__role" :class="{ missing: r.required && !table.mapping[r.key], ok: !!table.mapping[r.key] }">
        <span>
          {{ r.label || ROLE_LABELS[r.key] || r.key }}
          <em v-if="r.required">*</em>
        </span>
        <select :value="table.mapping[r.key] || ''" @change="onChange(r.key, ($event.target as HTMLSelectElement).value)">
          <option value="">{{ r.required ? $t('请选择列…') : $t('（无此列）') }}</option>
          <option v-for="h in table.headers" :key="h" :value="h">{{ h }}</option>
        </select>
        <i v-if="table.mapping[r.key]" class="ri-check-line"></i>
      </label>
    </div>
    <p v-if="missingRequired.length" class="ss-map__warn">
      <i class="ri-error-warning-line"></i>
      {{ $t('没识别到：{cols}。请在上面选择对应的列，否则这份表算不了。', { cols: missingRequired.join('、') }) }}
    </p>
    <p v-else class="ss-map__ok">
      <i class="ri-magic-line"></i>{{ $t('已自动识别列，不对的话直接改选即可。') }}
    </p>
    <div v-if="showPreview" class="ss-map__preview">
      <table>
        <thead><tr><th v-for="h in table.headers" :key="h">{{ h }}</th></tr></thead>
        <tbody>
          <tr v-for="(row, i) in table.preview" :key="i">
            <td v-for="h in table.headers" :key="h">{{ row[h] }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 列识别确认：主进程按表头关键字自动识别出「服务商列 = xxx」，这里给用户看一眼、改一下。
 * 必填角色缺失时整块标红并说明，用户不需要懂"列映射"这个词。
 */
import { computed, ref } from 'vue';
import { ROLE_LABELS, type PickedTable } from './shared';

const props = defineProps<{
  table: PickedTable;
  roles: { key: string; label?: string; required?: boolean }[];
  removable?: boolean;
}>();
const emit = defineEmits<{
  (e: 'update', mapping: Record<string, string>): void;
  (e: 'sheet', sheetName: string): void;
  (e: 'remove'): void;
}>();

const showPreview = ref(false);
const missingRequired = computed(() => props.roles.filter((r) => r.required && !props.table.mapping[r.key]).map((r) => r.label || ROLE_LABELS[r.key] || r.key));

function onChange(key: string, value: string): void {
  emit('update', { ...props.table.mapping, [key]: value });
}
</script>

<style scoped>
.ss-map { border: 1px solid var(--color-border); border-radius: 12px; padding: 12px 14px; display: grid; gap: 10px; background: var(--color-bg-card); }
.ss-map__head { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.ss-map__head > i { color: var(--color-brand); font-size: 18px; }
.ss-map__name { flex: 1; min-width: 120px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 13px; }
.ss-map__head small { color: var(--color-text-secondary); font-size: 12px; }
.ss-map__sheet { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; color: var(--color-text-secondary); }
.ss-map__sheet select, .ss-map__role select {
  height: 30px; border-radius: 8px; border: 1px solid var(--color-border); background: var(--color-bg-input, var(--color-bg-primary));
  color: var(--color-text-primary); font: inherit; font-size: 12.5px; padding: 0 8px; max-width: 220px;
}
.ss-map__roles { display: flex; flex-wrap: wrap; gap: 8px 14px; }
.ss-map__role { display: inline-flex; align-items: center; gap: 6px; font-size: 12.5px; }
.ss-map__role > span { color: var(--color-text-secondary); white-space: nowrap; }
.ss-map__role > span em { color: var(--color-danger); font-style: normal; }
.ss-map__role.missing select { border-color: var(--color-danger); }
.ss-map__role.ok i { color: var(--color-success); }
.ss-map__warn, .ss-map__ok { margin: 0; font-size: 12px; display: flex; gap: 6px; align-items: center; }
.ss-map__warn { color: var(--color-danger); }
.ss-map__ok { color: var(--color-text-secondary); }
.ss-map__preview { overflow-x: auto; border: 1px solid var(--color-border); border-radius: 8px; }
.ss-map__preview table { border-collapse: collapse; font-size: 12px; min-width: 100%; }
.ss-map__preview th, .ss-map__preview td { padding: 5px 8px; border-bottom: 1px solid var(--color-border); white-space: nowrap; text-align: left; }
.ss-map__preview th { background: var(--color-bg-hover); font-weight: 700; }
.ss-link { background: none; border: none; color: var(--color-brand); cursor: pointer; font: inherit; font-size: 12px; padding: 0; }
.ss-iconbtn { width: 24px; height: 24px; border-radius: 6px; border: none; background: transparent; color: var(--color-text-secondary); cursor: pointer; }
.ss-iconbtn:hover { color: var(--color-danger); background: var(--color-bg-hover); }
</style>
