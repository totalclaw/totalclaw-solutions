<template>
  <section class="pa-slot" :class="{ loaded: meta?.loaded, bad: meta && !meta.loaded }" :data-test="`pa-slot-${dataset}`">
    <header class="pa-slot__head">
      <strong>{{ datasetLabel(dataset) }}</strong>
      <span v-if="optional" class="ss-chip">{{ $t('可选') }}</span>
      <span v-else-if="recommended" class="ss-chip brand">{{ $t('建议投喂') }}</span>
      <span v-else class="ss-chip warn">{{ $t('必须') }}</span>
      <span v-if="meta?.loaded" class="ss-chip ok"><i class="ri-check-line"></i>{{ $t('已读入 {n} 条', { n: num(meta.count) }) }}</span>
      <small>{{ datasetHint(dataset) }}</small>
    </header>

    <div
      v-if="!meta" class="pa-drop" :class="{ over }" role="button" tabindex="0"
      @click="choose" @keydown.enter.prevent="choose" @dragover.prevent="over = true" @dragleave.prevent="over = false" @drop.prevent="onDrop"
    >
      <i class="ri-file-excel-2-line"></i>
      <span>{{ $t('把 Excel / CSV 拖到这里，或点击选择') }}</span>
      <button type="button" class="ss-btn sm ghost" :disabled="busy" @click.stop="choose"><i class="ri-folder-open-line"></i>{{ $t('选择文件') }}</button>
    </div>

    <template v-else>
      <TableMapping :table="meta" :roles="roles" removable @update="$emit('update', $event)" @sheet="$emit('sheet', $event)" @remove="$emit('remove')" />
      <p v-if="meta.layout === 'wide'" class="ss-note info">
        <i class="ri-layout-column-line"></i>{{ $t('识别为横表：{n} 个期间列（{a} ~ {b}），已按配件拆成一行一条', { n: meta.periodColumns, a: meta.periodFrom, b: meta.periodTo }) }}
      </p>
      <p v-else-if="meta.loaded && meta.periodFrom" class="ss-muted">{{ $t('数据期间：{a} ~ {b}', { a: meta.periodFrom, b: meta.periodTo }) }}</p>
      <p v-if="!meta.loaded" class="ss-note danger"><i class="ri-error-warning-line"></i>{{ $t('这份表还没有读入：{p0} 没有对应的列，请在上面选好', { p0: meta.missing.map(roleLabel).join('、') }) }}</p>
      <template v-else>
        <p v-for="(n, i) in meta.notes" :key="i" class="ss-note"><i class="ri-information-line"></i>{{ n }}</p>
        <div v-if="meta.skippedCount" class="pa-skip">
          <p class="ss-note warn">
            <i class="ri-alert-line"></i>
            <span>{{ $t('表里 {a} 行，读入 {b} 条，跳过 {c} 处', { a: num(meta.rowCount), b: num(meta.count), c: num(meta.skippedCount) }) }}</span>
            <button type="button" class="ss-link" @click="showSkipped = !showSkipped">{{ showSkipped ? $t('收起') : $t('看跳过的原因') }}</button>
          </p>
          <ul v-if="showSkipped" class="pa-skip__list">
            <li v-for="(s, i) in meta.skipped" :key="i"><b>{{ $t('第 {n} 条数据', { n: s.row }) }}</b>{{ s.reason }}</li>
            <li v-if="meta.skippedCount > meta.skipped.length" class="ss-muted">{{ $t('…… 其余 {n} 处没有列出', { n: meta.skippedCount - meta.skipped.length }) }}</li>
          </ul>
        </div>
      </template>
    </template>
  </section>
</template>

<script setup lang="ts">
/** 一类数据的投喂槽：拖入或选择文件 → 自动认列 → 可改列对应 → 显示读入条数与跳过原因。 */
import { computed, ref } from 'vue';
import { PA_DATASET_ROLES, type PaDatasetKey, type PaDatasetMeta } from '@totalclaw/ipc-contracts';
import TableMapping from '../service-settlement/TableMapping.vue';
import { EXCEL_RE, datasetHint, datasetLabel, droppedPaths, num, pa, roleLabel } from './shared';

const props = defineProps<{ dataset: PaDatasetKey; meta: PaDatasetMeta | null; busy?: boolean; optional?: boolean; recommended?: boolean }>();
const emit = defineEmits<{ (e: 'pick', path: string): void; (e: 'update', mapping: Record<string, string>): void; (e: 'sheet', name: string): void; (e: 'remove'): void }>();

const over = ref(false);
const showSkipped = ref(false);

/** 横表不需要月份列和数量列：期间在列头上 */
const roles = computed(() => PA_DATASET_ROLES[props.dataset]
  .filter((r) => !(props.meta?.layout === 'wide' && ['month', 'year', 'shipQty'].includes(r.key)))
  .map((r) => ({ key: r.key, label: roleLabel(r.key), required: !!r.required })));

async function choose(): Promise<void> {
  if (props.busy) return;
  const paths = await pa<string[]>('files.pick', {});
  if (paths[0]) emit('pick', paths[0]);
}
function onDrop(ev: DragEvent): void {
  over.value = false;
  if (props.busy) return;
  const paths = droppedPaths(ev, EXCEL_RE);
  if (paths[0]) emit('pick', paths[0]);
}
</script>

<style scoped>
.pa-slot { border: 1px solid var(--color-border); border-radius: 12px; padding: 12px; display: grid; gap: 10px; background: var(--color-bg-primary); }
.pa-slot.loaded { border-color: color-mix(in srgb, var(--color-success) 50%, var(--color-border)); }
.pa-slot.bad { border-color: var(--color-danger); }
.pa-slot__head { display: flex; flex-wrap: wrap; gap: 6px 8px; align-items: center; }
.pa-slot__head strong { font-size: 13.5px; }
.pa-slot__head small { flex: 1 1 100%; color: var(--color-text-secondary); font-size: 12px; line-height: 1.5; }
.pa-drop { display: flex; align-items: center; gap: 10px; padding: 12px 14px; border: 1.5px dashed var(--color-border); border-radius: 10px; cursor: pointer; font-size: 12.5px; color: var(--color-text-secondary); background: var(--color-bg-card); }
.pa-drop:hover, .pa-drop.over { border-color: var(--color-brand); color: var(--color-brand); }
.pa-drop > i { font-size: 22px; color: var(--color-brand); }
.pa-drop > span { flex: 1; min-width: 0; }
.pa-skip { display: grid; gap: 6px; }
.pa-skip .ss-note span { flex: 1; }
.pa-skip__list { margin: 0; padding: 8px 12px; list-style: none; display: grid; gap: 3px; font-size: 12px; max-height: 180px; overflow-y: auto; border: 1px solid var(--color-border); border-radius: 8px; background: var(--color-bg-card); }
.pa-skip__list b { margin-inline-end: 8px; font-weight: 700; }
</style>
