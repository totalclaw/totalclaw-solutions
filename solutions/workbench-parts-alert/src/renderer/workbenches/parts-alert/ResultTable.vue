<template>
  <div class="pa-rt">
    <div class="ss-actions">
      <input v-model="keyword" type="search" class="pa-rt__search" :placeholder="$t('按配件编码、名称、供应商筛选')" data-test="pa-result-search" />
      <button v-for="s in STATES" :key="s" type="button" class="pa-rt__chip" :class="[stateClass(s), { on: states.includes(s) }]" @click="toggleState(s)">
        {{ stateLabel(s) }} {{ counts[s] }}
      </button>
      <button v-if="states.length || keyword" type="button" class="ss-link" @click="clear">{{ $t('清除筛选') }}</button>
      <span class="grow"></span>
      <span class="ss-muted">{{ $t('共 {n} 个配件', { n: filtered.length }) }}</span>
    </div>
    <div class="ss-table-wrap">
      <table class="ss-table" data-test="pa-result-table">
        <thead>
          <tr>
            <th></th>
            <th v-for="c in COLS" :key="c.key" :class="{ num: c.num, sortable: true }" @click="sortBy(c.key)">
              {{ c.title }}<i v-if="sort === c.key" :class="desc ? 'ri-arrow-down-s-fill' : 'ri-arrow-up-s-fill'"></i>
            </th>
          </tr>
        </thead>
        <tbody>
          <template v-for="r in pageRows" :key="r.partNo">
            <tr :class="{ bad: r.state === 'out_of_stock' }">
              <td><button type="button" class="ss-link" :data-test="`pa-basis-${r.partNo}`" @click="toggle(r.partNo)"><i :class="open.has(r.partNo) ? 'ri-arrow-down-s-line' : 'ri-arrow-right-s-line'"></i>{{ $t('算式依据') }}</button></td>
              <td><span class="ss-chip" :class="stateClass(r.state)">{{ stateLabel(r.state) }}</span></td>
              <td><b>{{ r.partNo }}</b> <span class="ss-muted">{{ r.partName }}</span></td>
              <td class="num">{{ num(r.stockQty) }}</td>
              <td class="num">{{ r.inTransitQty ? num(r.inTransitQty) : '—' }}</td>
              <td>{{ r.earliestEta || '—' }}</td>
              <td class="num">{{ num(r.dailyDemand, 2) }}</td>
              <td class="num">{{ r.coverDays === null ? '—' : num(r.coverDays, 1) }}</td>
              <td>{{ r.stockoutDate || '—' }}</td>
              <td class="num">{{ r.leadDays }}<span v-if="r.leadDaysDefaulted" class="ss-muted">{{ $t('（默认）') }}</span></td>
              <td class="num">{{ r.suggestQty ? num(r.suggestQty) : '—' }}</td>
            </tr>
            <tr v-if="open.has(r.partNo)" class="pa-rt__basis">
              <td :colspan="COLS.length + 1">
                <ol><li v-for="(b, i) in r.basis" :key="i">{{ b }}</li></ol>
                <p v-if="r.actions.length" class="ss-muted">{{ $t('建议举措：') }}{{ r.actions.map((a) => a.text).join($t('；')) }}</p>
              </td>
            </tr>
          </template>
          <tr v-if="!pageRows.length"><td :colspan="COLS.length + 1" class="ss-muted">{{ $t('没有符合条件的配件') }}</td></tr>
        </tbody>
      </table>
    </div>
    <div v-if="pages > 1" class="ss-actions">
      <button type="button" class="ss-btn sm" :disabled="page <= 1" @click="page -= 1"><i class="ri-arrow-left-s-line"></i>{{ $t('上一页') }}</button>
      <span class="ss-muted">{{ $t('第 {a} / {b} 页', { a: page, b: pages }) }}</span>
      <button type="button" class="ss-btn sm" :disabled="page >= pages" @click="page += 1">{{ $t('下一页') }}<i class="ri-arrow-right-s-line"></i></button>
    </div>
  </div>
</template>

<script setup lang="ts">
/** 库存状态结果表：按状态 / 关键字筛选，点列头排序，每行可展开看算式依据。 */
import { computed, ref, watch } from 'vue';
import { PA_STATES, type PaPartResult, type PaPartState } from '@totalclaw/ipc-contracts';
import { t as i18nT } from '../../i18n';
import { filterSortResults, num, stateClass, stateLabel, type SortKey } from './shared';

const props = defineProps<{ rows: PaPartResult[]; counts: Record<PaPartState, number> }>();
const states = defineModel<PaPartState[]>('states', { default: () => [] });

const STATES = PA_STATES;
const PAGE = 50;
const COLS: Array<{ key: SortKey; title: string; num?: boolean }> = [
  { key: 'state', title: i18nT('状态') },
  { key: 'partNo', title: i18nT('配件') },
  { key: 'stockQty', title: i18nT('库存'), num: true },
  { key: 'inTransitQty', title: i18nT('在途'), num: true },
  { key: 'earliestEta', title: i18nT('最早到货') },
  { key: 'dailyDemand', title: i18nT('日均需求'), num: true },
  { key: 'coverDays', title: i18nT('可用天数'), num: true },
  { key: 'stockoutDate', title: i18nT('断货日') },
  { key: 'leadDays', title: i18nT('提前期'), num: true },
  { key: 'suggestQty', title: i18nT('建议补库'), num: true },
];

const keyword = ref('');
const sort = ref<SortKey>('state');
const desc = ref(false);
const page = ref(1);
const open = ref(new Set<string>());

const filtered = computed(() => filterSortResults(props.rows, { states: states.value, keyword: keyword.value, sort: sort.value, desc: desc.value }));
const pages = computed(() => Math.max(1, Math.ceil(filtered.value.length / PAGE)));
const pageRows = computed(() => filtered.value.slice((page.value - 1) * PAGE, page.value * PAGE));
watch([keyword, states, sort, desc, () => props.rows], () => { page.value = 1; });

function sortBy(k: SortKey): void {
  if (sort.value === k) desc.value = !desc.value; else { sort.value = k; desc.value = false; }
}
function toggleState(s: PaPartState): void {
  states.value = states.value.includes(s) ? states.value.filter((x) => x !== s) : [...states.value, s];
}
function clear(): void { states.value = []; keyword.value = ''; }
function toggle(no: string): void {
  const next = new Set(open.value);
  if (next.has(no)) next.delete(no); else next.add(no);
  open.value = next;
}
</script>

<style scoped>
.pa-rt { display: grid; gap: 10px; }
.pa-rt__search { height: 32px; min-width: 240px; border-radius: var(--radius-3); border: 1px solid var(--color-border); background: var(--color-bg-input); color: var(--color-text-primary); font: inherit; font-size: 12.5px; padding: 0 10px; }
.pa-rt__chip { border: 1px solid var(--color-border); background: var(--color-bg-card); border-radius: var(--radius-pill); height: 28px; padding: 0 10px; font: inherit; font-size: var(--font-size-sm); font-weight: 700; cursor: pointer; color: var(--color-text-secondary); }
.pa-rt__chip.on { border-color: currentColor; background: color-mix(in srgb, currentColor 12%, transparent); }
.pa-rt__chip.bad.on { color: var(--color-danger); }
.pa-rt__chip.warn.on { color: var(--color-warning); }
.pa-rt__chip.ok.on { color: var(--color-success); }
.pa-rt__chip.brand.on { color: var(--color-brand); }
.pa-rt__chip.mute.on { color: var(--color-text-primary); }
th.sortable { cursor: pointer; user-select: none; }
th.sortable i { font-size: var(--font-size-base); vertical-align: -2px; }
.pa-rt__basis td { background: var(--color-bg-hover); white-space: normal; }
.pa-rt__basis ol { margin: 0; padding-inline-start: 20px; display: grid; gap: 3px; font-size: 12.5px; line-height: 1.6; }
.pa-rt__basis p { margin: 6px 0 0; }
</style>
