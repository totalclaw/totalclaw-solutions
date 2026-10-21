<template>
  <div class="pa-plan">
    <section v-for="g in GROUPS" :key="g" class="pa-plan__group" :class="{ blocking: isBlocking(g) }" :data-test="`pa-group-${g}`">
      <header class="pa-plan__head">
        <button type="button" class="ss-link" @click="collapsed[g] = !collapsed[g]"><i :class="collapsed[g] ? 'ri-arrow-right-s-line' : 'ri-arrow-down-s-line'"></i></button>
        <strong>{{ groupLabel(g) }}</strong>
        <span class="ss-chip">{{ $t('{n} 个配件', { n: byGroup[g].length }) }}</span>
        <span v-if="pending[g]" class="ss-chip" :class="isBlocking(g) ? 'warn' : ''">{{ $t('还有 {n} 个没检验', { n: pending[g] }) }}</span>
        <span v-else-if="byGroup[g].length" class="ss-chip ok"><i class="ri-check-line"></i>{{ $t('已全部检验') }}</span>
        <span v-if="isBlocking(g)" class="ss-muted">{{ $t('检验完才能进补库清单') }}</span>
        <span class="grow"></span>
        <button v-if="pending[g]" type="button" class="ss-btn sm primary" :disabled="busy" :data-test="`pa-bulk-${g}`" @click="$emit('bulk', g, 'confirmed')">
          <i class="ri-check-double-line"></i>{{ $t('本组未检验的全部确认') }}
        </button>
      </header>
      <p class="ss-muted pa-plan__hint">{{ groupHint(g) }}</p>
      <template v-if="!collapsed[g]">
        <p v-if="!byGroup[g].length" class="ss-empty">{{ $t('这一类没有配件') }}</p>
        <article v-for="r in byGroup[g].slice(0, shown[g])" :key="r.partNo" class="pa-item" :class="statusOf(r)">
          <div class="pa-item__head">
            <b>{{ r.partNo }}</b><span>{{ r.partName }}</span>
            <span class="ss-chip" :class="stateClass(r.state)">{{ stateLabel(r.state) }}</span>
            <span class="ss-muted">{{ facts(r) }}</span>
            <span class="grow"></span>
            <span class="ss-chip" :class="{ ok: statusOf(r) === 'confirmed', bad: statusOf(r) === 'rejected' }">{{ reviewLabel(statusOf(r)) }}</span>
          </div>
          <textarea
            :value="textOf(r)" :rows="Math.min(6, Math.max(2, r.actions.length))" :disabled="busy"
            :aria-label="$t('行动计划')" :data-test="`pa-plan-text-${r.partNo}`" @change="saveText(r, ($event.target as HTMLTextAreaElement).value)"
          ></textarea>
          <div class="pa-item__ops">
            <input type="text" :value="reviews[r.partNo]?.remark || ''" :placeholder="$t('备注（可不填）')" :disabled="busy" @change="$emit('set', [{ partNo: r.partNo, remark: ($event.target as HTMLInputElement).value }])" />
            <button v-if="reviews[r.partNo]?.text" type="button" class="ss-link" @click="$emit('set', [{ partNo: r.partNo, text: '' }])">{{ $t('恢复系统建议') }}</button>
            <span class="grow"></span>
            <button v-if="statusOf(r) !== 'pending'" type="button" class="ss-link" :disabled="busy" @click="$emit('set', [{ partNo: r.partNo, status: 'pending' }])">{{ $t('撤回重新检验') }}</button>
            <button type="button" class="ss-btn sm danger" :disabled="busy || statusOf(r) === 'rejected'" :data-test="`pa-reject-${r.partNo}`" @click="$emit('set', [{ partNo: r.partNo, status: 'rejected' }])"><i class="ri-close-line"></i>{{ $t('驳回') }}</button>
            <button type="button" class="ss-btn sm primary" :disabled="busy || statusOf(r) === 'confirmed'" :data-test="`pa-confirm-${r.partNo}`" @click="$emit('set', [{ partNo: r.partNo, status: 'confirmed' }])"><i class="ri-check-line"></i>{{ $t('确认') }}</button>
          </div>
        </article>
        <button v-if="byGroup[g].length > shown[g]" type="button" class="ss-btn sm" @click="shown[g] += STEP">
          {{ $t('再显示 {a} 个（还有 {b} 个）', { a: Math.min(STEP, byGroup[g].length - shown[g]), b: byGroup[g].length - shown[g] }) }}
        </button>
      </template>
    </section>
  </div>
</template>

<script setup lang="ts">
/**
 * 行动计划检验：四组（无在途缺货 / 有在途缺货 / 呆滞 / 冗余），逐个配件确认、改文字或驳回，可整组确认。
 * 列表顺序固定（已缺货在前、断货日早的在前）；改过的文字在失去焦点时保存。
 */
import { computed, reactive } from 'vue';
import { PA_BLOCKING_GROUPS, PA_PLAN_GROUPS, type PaPartResult, type PaPlanGroup, type PaReview, type PaReviewStatus } from '@totalclaw/ipc-contracts';
import { t as i18nT } from '../../i18n';
import { defaultPlanText, groupHint, groupLabel, num, planGroupOf, reviewLabel, stateClass, stateLabel } from './shared';

const props = defineProps<{ results: PaPartResult[]; reviews: Record<string, PaReview>; pending: Record<PaPlanGroup, number>; busy?: boolean }>();
const emit = defineEmits<{
  (e: 'set', items: Array<{ partNo: string; status?: PaReviewStatus; text?: string; remark?: string }>): void;
  (e: 'bulk', group: PaPlanGroup, status: PaReviewStatus): void;
}>();

const GROUPS = PA_PLAN_GROUPS;
const STEP = 20;
const collapsed = reactive<Record<PaPlanGroup, boolean>>({ shortage_none: false, shortage_transit: false, stagnant: true, redundant: true });
const shown = reactive<Record<PaPlanGroup, number>>({ shortage_none: STEP, shortage_transit: STEP, stagnant: STEP, redundant: STEP });

const isBlocking = (g: PaPlanGroup): boolean => PA_BLOCKING_GROUPS.includes(g);
const statusOf = (r: PaPartResult): PaReviewStatus => props.reviews[r.partNo]?.status || 'pending';
const textOf = (r: PaPartResult): string => props.reviews[r.partNo]?.text || defaultPlanText(r);

const byGroup = computed(() => {
  const out: Record<PaPlanGroup, PaPartResult[]> = { shortage_none: [], shortage_transit: [], stagnant: [], redundant: [] };
  for (const r of props.results) { const g = planGroupOf(r); if (g) out[g].push(r); }
  // 已缺货排在将缺货前面，断货日早的在前；这个顺序不随检验状态变，免得点完一个列表跳动
  for (const g of GROUPS) {
    out[g].sort((a, b) => (a.state === b.state ? 0 : a.state === 'out_of_stock' ? -1 : b.state === 'out_of_stock' ? 1 : 0)
      || (a.stockoutDate || '9999').localeCompare(b.stockoutDate || '9999') || a.partNo.localeCompare(b.partNo));
  }
  return out;
});

function facts(r: PaPartResult): string {
  const parts = [i18nT('库存 {n}', { n: num(r.stockQty) })];
  if (r.inTransitQty) parts.push(i18nT('在途 {n}，最早 {p0} 到', { n: num(r.inTransitQty), p0: r.earliestEta }));
  if (r.stockoutDate) parts.push(i18nT('断货日 {p0}', { p0: r.stockoutDate }));
  if (r.lastShipMonth && (r.state === 'stagnant' || r.state === 'redundant')) parts.push(i18nT('最近发货 {p0}', { p0: r.lastShipMonth }));
  if (r.suggestQty) parts.push(i18nT('建议补库 {n}', { n: num(r.suggestQty) }));
  return parts.join(' · ');
}

function saveText(r: PaPartResult, value: string): void {
  const v = value.trim();
  // 和系统建议一样就不算人工修改
  emit('set', [{ partNo: r.partNo, text: v === defaultPlanText(r) ? '' : v }]);
}
</script>

<style scoped>
.pa-plan { display: grid; gap: 12px; }
.pa-plan__group { border: 1px solid var(--color-border); border-radius: 12px; padding: 12px; display: grid; gap: 8px; background: var(--color-bg-primary); }
.pa-plan__group.blocking { border-color: color-mix(in srgb, var(--color-warning) 45%, var(--color-border)); }
.pa-plan__head { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
.pa-plan__head strong { font-size: 14px; }
.pa-plan__head .grow, .pa-item__head .grow, .pa-item__ops .grow { flex: 1; }
.pa-plan__hint { margin: 0; }
.pa-item { border: 1px solid var(--color-border); border-radius: 10px; padding: 10px 12px; display: grid; gap: 8px; background: var(--color-bg-card); }
.pa-item.confirmed { border-color: color-mix(in srgb, var(--color-success) 50%, var(--color-border)); }
.pa-item.rejected { opacity: .75; border-style: dashed; }
.pa-item__head { display: flex; flex-wrap: wrap; align-items: center; gap: 6px 10px; font-size: 12.5px; }
.pa-item textarea { width: 100%; box-sizing: border-box; border-radius: 9px; border: 1px solid var(--color-border); background: var(--color-bg-input, var(--color-bg-primary)); color: var(--color-text-primary); font: inherit; font-size: 12.5px; line-height: 1.6; padding: 8px 10px; resize: vertical; }
.pa-item__ops { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
.pa-item__ops input { flex: 0 1 280px; height: 30px; border-radius: 8px; border: 1px solid var(--color-border); background: var(--color-bg-input, var(--color-bg-primary)); color: var(--color-text-primary); font: inherit; font-size: 12.5px; padding: 0 10px; }
</style>
