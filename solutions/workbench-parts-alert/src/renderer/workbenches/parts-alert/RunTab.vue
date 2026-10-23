<template>
  <div class="ss-module">
    <StickyProgress :title="$t('配件预警与补库')" :metas="metas" :runtime="runtime" :current-key="currentKey" @jump="jump" />
    <div class="ss-steps">
      <!-- 1 投喂数据 -->
      <StepCard step-key="pa-feed" :index="0" :title="metas[0].title" :hint="metas[0].hint" :runtime="runtime['pa-feed']" :is-current="currentKey === 'pa-feed'">
        <div class="ss-actions">
          <button type="button" class="ss-btn" :disabled="!!busy" data-test="pa-demo" @click="loadDemo">
            <i :class="busy === 'pa-feed' ? 'ri-loader-4-line spin' : 'ri-file-download-line'"></i>{{ $t('生成示例数据') }}
          </button>
          <span class="ss-muted">{{ $t('没有现成的表？点一下生成 60 个配件的示例数据并自动投喂，文件放在输出目录的「示例数据」文件夹里') }}</span>
        </div>
        <p v-if="demoDir" class="ss-file-out"><i class="ri-folder-check-line"></i><code>{{ demoDir }}</code><button type="button" class="ss-link" @click="open(demoDir)">{{ $t('打开文件夹') }}</button></p>
        <div class="pa-slots">
          <DataSlot
            v-for="k in DATASETS" :key="k" :dataset="k" :meta="state?.datasets[k] || null" :busy="!!busy"
            :optional="k === 'yearly'" :recommended="k === 'leadTime' || k === 'inTransit'"
            @pick="(p) => importFile(k, p)" @update="(m) => importFile(k, state!.datasets[k]!.path, state!.datasets[k]!.sheetName, m)"
            @sheet="(s) => importFile(k, state!.datasets[k]!.path, s)" @remove="clearData(k)"
          />
        </div>
        <p v-if="fed && !state?.datasets.leadTime?.loaded" class="ss-note warn"><i class="ri-alert-line"></i>{{ $t('没有投喂采购提前期：所有配件都按默认 {n} 天计算（可在「规则」里改）', { n: state?.settings.rules.defaultLeadDays }) }}</p>
        <p v-if="fed && !state?.datasets.inTransit?.loaded" class="ss-note warn"><i class="ri-alert-line"></i>{{ $t('没有投喂采购在途：所有配件都按没有在途计算') }}</p>
      </StepCard>

      <!-- 2 运算库存状态 -->
      <StepCard step-key="pa-compute" :index="1" :title="metas[1].title" :hint="metas[1].hint" :runtime="runtime['pa-compute']" :is-current="currentKey === 'pa-compute'">
        <div class="ss-actions">
          <label class="ss-field inline"><span>{{ $t('基准日') }}</span><input v-model="asOf" type="date" data-test="pa-asof" /></label>
          <button type="button" class="ss-btn primary" :disabled="!!busy || !fed" data-test="pa-compute-run" @click="compute">
            <i :class="busy === 'pa-compute' ? 'ri-loader-4-line spin' : 'ri-calculator-line'"></i>{{ run ? $t('重新运算') : $t('运算库存状态') }}
          </button>
          <span v-if="!fed" class="ss-muted">{{ $t('先在第 1 步投喂历史发货（按月）和实时库存') }}</span>
          <span v-else-if="run && !run.stale" class="ss-muted">{{ $t('上次运算：{p0}', { p0: fmtDateTime(run.computedAt) }) }}</span>
        </div>
        <p v-if="run?.stale" class="ss-note warn" data-test="pa-stale"><i class="ri-alert-line"></i>{{ $t('{p0}，下面的结果已经过期，请重新运算', { p0: run.staleReason || $t('规则或数据已经改过') }) }}</p>
        <template v-if="run">
          <div class="pa-states" :class="{ stale: run.stale }">
            <button v-for="s in STATES" :key="s" type="button" class="pa-state" :class="[stateClass(s), { on: stateFilter.includes(s) }]" :data-test="`pa-state-${s}`" @click="toggleState(s)">
              <small>{{ stateLabel(s) }}</small><strong>{{ run.summary.byState[s] }}</strong>
            </button>
            <div class="pa-state total"><small>{{ $t('建议补库') }}</small><strong>{{ run.summary.replenishParts }}</strong><em>{{ $t('数量 {a}，金额 {b}', { a: num(run.summary.replenishQty), b: fmtMoney(run.summary.replenishAmount) }) }}</em></div>
          </div>
          <p v-if="run.summary.partsWithoutStockRow.length" class="ss-note warn"><i class="ri-alert-line"></i>{{ $t('{n} 个配件在发货或在途里出现，但库存表里没有，按库存 0 处理：{p0}', { n: run.summary.partsWithoutStockRow.length, p0: sample(run.summary.partsWithoutStockRow) }) }}</p>
          <p v-if="run.summary.partsWithDefaultLead.length" class="ss-note"><i class="ri-information-line"></i>{{ $t('{n} 个配件没有采购提前期，用了默认 {d} 天：{p0}', { n: run.summary.partsWithDefaultLead.length, d: run.rules.defaultLeadDays, p0: sample(run.summary.partsWithDefaultLead) }) }}</p>
          <ResultTable v-model:states="stateFilter" :rows="results" :counts="run.summary.byState" />
        </template>
      </StepCard>

      <!-- 3 检验行动计划 -->
      <StepCard step-key="pa-plan" :index="2" :title="metas[2].title" :hint="metas[2].hint" :runtime="runtime['pa-plan']" :is-current="currentKey === 'pa-plan'">
        <p v-if="!live" class="ss-empty">{{ $t('运算完成后，这里列出每个配件的行动计划等你检验') }}</p>
        <template v-else>
          <p v-if="leftBlocking" class="ss-note warn" data-test="pa-plan-left"><i class="ri-alert-line"></i>{{ $t('缺货管控计划还有 {n} 个没有检验，检验完才能进入补库清单', { n: leftBlocking }) }}</p>
          <p v-else class="ss-note ok"><i class="ri-check-line"></i>{{ $t('缺货管控计划已全部检验。呆滞和冗余的处理建议可以随时回来检验，不影响补库') }}</p>
          <PlanReview :results="results" :reviews="run!.reviews" :pending="state!.pending" :busy="!!busy" @set="setReviews" @bulk="bulkReview" />
        </template>
      </StepCard>

      <!-- 4 确认补库清单 -->
      <StepCard step-key="pa-replenish" :index="3" :title="metas[3].title" :hint="metas[3].hint" :runtime="runtime['pa-replenish']" :is-current="currentKey === 'pa-replenish'">
        <p v-if="!live" class="ss-empty">{{ $t('缺货管控计划确认后，需要补库的配件会出现在这里') }}</p>
        <template v-else>
          <p v-if="!lines.length" class="ss-empty" data-test="pa-lines-empty">{{ leftBlocking ? $t('还没有确认任何需要补库的缺货计划') : $t('本次没有需要补库的配件：缺货计划被驳回，或在途数量已经够用') }}</p>
          <template v-else>
            <div class="ss-actions">
              <button type="button" class="ss-link" :disabled="!!busy" @click="selectAll(true)">{{ $t('全选') }}</button>
              <button type="button" class="ss-link" :disabled="!!busy" @click="selectAll(false)">{{ $t('全不选') }}</button>
              <span class="ss-muted">{{ $t('下单量默认等于公式建议量，改了会并排显示；期望到货日默认是基准日加采购提前期') }}</span>
            </div>
            <div class="ss-table-wrap">
              <table class="ss-table" data-test="pa-lines">
                <thead><tr><th></th><th>{{ $t('配件') }}</th><th>{{ $t('状态') }}</th><th class="num">{{ $t('公式建议量') }}</th><th>{{ $t('下单量') }}</th><th>{{ $t('供应商') }}</th><th>{{ $t('期望到货日') }}</th><th>{{ $t('单价') }}</th><th class="num">{{ $t('金额') }}</th><th>{{ $t('断货日') }}</th></tr></thead>
                <tbody>
                  <tr v-for="l in lines" :key="l.partNo" :class="{ off: !l.selected }">
                    <td><input type="checkbox" :checked="l.selected" :disabled="!!busy" :data-test="`pa-line-check-${l.partNo}`" @change="editLine(l.partNo, { selected: ($event.target as HTMLInputElement).checked })" /></td>
                    <td><b>{{ l.partNo }}</b> <span class="ss-muted">{{ l.partName }}</span></td>
                    <td><span class="ss-chip" :class="stateClass(l.state)">{{ stateLabel(l.state) }}</span></td>
                    <td class="num">{{ num(l.suggestQty) }}</td>
                    <td>
                      <input type="number" min="1" step="1" class="pa-qty" :value="l.qty" :disabled="!!busy" :data-test="`pa-line-qty-${l.partNo}`" @change="editQty(l, ($event.target as HTMLInputElement))" />
                      <small v-if="l.qty !== l.suggestQty" class="pa-changed">{{ $t('建议 {a}，改为 {b}', { a: num(l.suggestQty), b: num(l.qty) }) }}<button type="button" class="ss-link" @click="editLine(l.partNo, { qty: l.suggestQty })">{{ $t('恢复') }}</button></small>
                    </td>
                    <td><input type="text" :value="l.supplier" :disabled="!!busy" :placeholder="$t('未知')" @change="editLine(l.partNo, { supplier: ($event.target as HTMLInputElement).value })" /></td>
                    <td><input type="date" :value="l.expectDate" :disabled="!!busy" @change="editLine(l.partNo, { expectDate: ($event.target as HTMLInputElement).value })" /></td>
                    <td><input type="number" min="0" step="0.01" class="pa-qty" :value="l.unitPrice ?? ''" :disabled="!!busy" :placeholder="$t('没有')" @change="editPrice(l.partNo, ($event.target as HTMLInputElement).value)" /></td>
                    <td class="num">{{ l.amount === null ? '—' : fmtMoney(l.amount) }}</td>
                    <td>{{ l.stockoutDate || '—' }}</td>
                  </tr>
                  <tr class="total">
                    <td></td><td colspan="3">{{ $t('已勾选 {a} / {b} 行', { a: totals.lines, b: lines.length }) }}</td>
                    <td class="num">{{ num(totals.qty) }}</td><td colspan="3"></td>
                    <td class="num">{{ fmtMoney(totals.amount) }}</td>
                    <td><span v-if="totals.unpriced" class="ss-muted">{{ $t('{n} 行没有单价，未计入', { n: totals.unpriced }) }}</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="ss-actions">
              <button type="button" class="ss-btn primary" :disabled="!!busy || !!leftBlocking || !totals.lines" data-test="pa-lines-confirm" @click="confirmLines">
                <i :class="busy === 'pa-replenish' ? 'ri-loader-4-line spin' : 'ri-check-double-line'"></i>{{ $t('确认补库清单') }}
              </button>
              <span v-if="leftBlocking" class="ss-muted">{{ $t('第 3 步还有 {n} 个缺货计划没检验', { n: leftBlocking }) }}</span>
              <span v-else-if="run!.replenishConfirmedAt" class="ss-muted">{{ $t('已于 {p0} 确认；再改清单需要重新确认', { p0: fmtDateTime(run!.replenishConfirmedAt) }) }}</span>
            </div>
          </template>
        </template>
      </StepCard>

      <!-- 5 转采购订单 -->
      <StepCard step-key="pa-order" :index="4" :title="metas[4].title" :hint="metas[4].hint" :runtime="runtime['pa-order']" :is-current="currentKey === 'pa-order'">
        <p class="ss-note info"><i class="ri-shield-check-line"></i>{{ $t('生成的是给采购系统录入或导入用的 Excel 文件。应用不会向任何系统提交订单，也不会发给供应商；下不下单、什么时候下，由采购人员决定。') }}</p>
        <div class="ss-actions">
          <button type="button" class="ss-btn primary" :disabled="!!busy || !confirmed" data-test="pa-order-export" @click="exportOrder">
            <i :class="busy === 'pa-order' ? 'ri-loader-4-line spin' : 'ri-file-list-3-line'"></i>{{ $t('生成采购订单') }}
          </button>
          <button type="button" class="ss-btn" :disabled="!!busy || !live" data-test="pa-plan-export" @click="exportPlan"><i class="ri-file-excel-2-line"></i>{{ $t('只导出库存状态与行动计划') }}</button>
          <span v-if="!confirmed" class="ss-muted">{{ $t('先在第 4 步确认补库清单') }}</span>
          <span v-else class="ss-muted">{{ $t('将生成 {a} 行，数量 {b}，金额 {c}', { a: totals.lines, b: num(totals.qty), c: fmtMoney(totals.amount) }) }}</span>
        </div>
        <template v-if="run?.exported">
          <p v-if="run.exported.at < (run.replenishConfirmedAt || '') || !run.replenishConfirmedAt || run.stale" class="ss-note warn"><i class="ri-alert-line"></i>{{ $t('下面是 {p0} 生成的文件；之后清单或数据改过，需要的话重新生成', { p0: fmtDateTime(run.exported.at) }) }}</p>
          <div v-for="f in [run.exported.orderFile, run.exported.planFile]" :key="f" class="ss-file-out">
            <i class="ri-file-excel-2-line"></i><code :title="f">{{ f }}</code>
            <button type="button" class="ss-btn sm" @click="open(f)">{{ $t('打开文件') }}</button>
            <button type="button" class="ss-btn sm" @click="open(f, true)">{{ $t('打开所在文件夹') }}</button>
          </div>
        </template>
        <div v-if="planFile" class="ss-file-out">
          <i class="ri-file-excel-2-line"></i><code :title="planFile">{{ planFile }}</code>
          <button type="button" class="ss-btn sm" @click="open(planFile)">{{ $t('打开文件') }}</button>
          <button type="button" class="ss-btn sm" @click="open(planFile, true)">{{ $t('打开所在文件夹') }}</button>
        </div>
      </StepCard>
    </div>
  </div>
</template>

<script setup lang="ts">
/** 运算向导：投喂数据 → 运算库存状态 → 检验行动计划 → 确认补库清单 → 转采购订单。 */
import { computed, ref, watch } from 'vue';
import { PA_DATASETS, PA_STATES, type PaDatasetKey, type PaPartState, type PaPlanGroup, type PaReplenishEdit, type PaReplenishLine, type PaReviewStatus } from '@totalclaw/ipc-contracts';
import { useNotificationStore } from '../../stores/notification';
import { t as i18nT } from '../../i18n';
import StepCard from '../service-settlement/StepCard.vue';
import StickyProgress from '../service-settlement/StickyProgress.vue';
import DataSlot from './DataSlot.vue';
import ResultTable from './ResultTable.vue';
import PlanReview from './PlanReview.vue';
import {
  blockingPending, currentStep, deriveSteps, errorMessage, fmtDateTime, fmtMoney, num, openPath, pa, paResults, paState, refreshState, scrollToStep,
  stateClass, stateLabel, todayStr, type StepKey, type StepMeta,
} from './shared';

const notif = useNotificationStore();
const state = paState;
const results = paResults;
const DATASETS = PA_DATASETS;
const STATES = PA_STATES;

const metas: StepMeta[] = [
  { key: 'pa-feed', title: i18nT('投喂数据'), hint: i18nT('历史发货、采购提前期、采购在途、实时库存；自动认列，认不准的你来改') },
  { key: 'pa-compute', title: i18nT('运算库存状态'), hint: i18nT('按公式算出每个配件是呆滞、冗余、健康、将缺货还是已缺货，每条都带算式') },
  { key: 'pa-plan', title: i18nT('检验行动计划'), hint: i18nT('呆滞处理建议、有采购在途和无采购在途两类缺货管控举措，逐条确认、修改或驳回') },
  { key: 'pa-replenish', title: i18nT('确认补库清单'), hint: i18nT('只收缺货计划已确认且需要补库的配件；数量、供应商、到货日可以改') },
  { key: 'pa-order', title: i18nT('转采购订单'), hint: i18nT('由你点击生成采购订单文件，交给采购系统；应用不代为提交') },
];

const busy = ref('');
const errors = ref<Record<string, string>>({});
const runtime = computed(() => deriveSteps(state.value, busy.value, errors.value));
const currentKey = computed(() => currentStep(runtime.value));
const run = computed(() => state.value?.run || null);
const live = computed(() => !!run.value && !run.value.stale);
const fed = computed(() => !!state.value?.datasets.monthly?.loaded && !!state.value?.datasets.stock?.loaded);
const leftBlocking = computed(() => (state.value && live.value ? blockingPending(state.value) : 0));
const lines = computed<PaReplenishLine[]>(() => state.value?.lines || []);
const confirmed = computed(() => live.value && !leftBlocking.value && !!run.value?.replenishConfirmedAt);
const totals = computed(() => {
  const sel = lines.value.filter((l) => l.selected);
  return {
    lines: sel.length,
    qty: sel.reduce((a, l) => a + l.qty, 0),
    amount: Math.round(sel.reduce((a, l) => a + (l.amount ?? 0), 0) * 100) / 100,
    unpriced: sel.filter((l) => l.amount === null).length,
  };
});

const asOf = ref(todayStr());
const stateFilter = ref<PaPartState[]>([]);
const demoDir = ref('');
const planFile = ref('');
watch(() => run.value?.id, () => { if (run.value) asOf.value = run.value.asOf; stateFilter.value = []; planFile.value = ''; }, { immediate: true });

// 步骤推进时把当前步骤滚进视野（首次加载不滚）
let seenFirst = false;
watch(currentKey, (k, prev) => {
  if (!seenFirst) { seenFirst = true; return; }
  if (prev && metas.findIndex((m) => m.key === k) > metas.findIndex((m) => m.key === prev)) void scrollToStep(k);
});

async function act(key: StepKey, fn: () => Promise<unknown>): Promise<boolean> {
  busy.value = key;
  errors.value = { ...errors.value, [key]: '' };
  try { await fn(); await refreshState(); return true; } catch (e) {
    errors.value = { ...errors.value, [key]: errorMessage(e) };
    void refreshState().catch(() => {});
    void scrollToStep(key);
    return false;
  } finally { busy.value = ''; }
}
function jump(key: string): void { void scrollToStep(key); }
const sample = (list: string[]): string => list.slice(0, 8).join(i18nT('、')) + (list.length > 8 ? ' …' : '');
function open(path: string, reveal = false): void { void openPath(path, reveal).catch((e) => notif.error(errorMessage(e))); }

// ── 1 投喂 ──
function importFile(dataset: PaDatasetKey, path: string, sheet?: string, mapping?: Record<string, string>): void {
  void act('pa-feed', () => pa('data.import', { dataset, path, sheet, mapping: mapping || null }));
}
function clearData(dataset: PaDatasetKey): void { void act('pa-feed', () => pa('data.clear', { dataset })); }
function loadDemo(): void {
  void act('pa-feed', async () => { const r = await pa<{ dir: string }>('data.demo'); demoDir.value = r.dir; });
}

// ── 2 运算 ──
function compute(): void { void act('pa-compute', () => pa('compute.run', { asOf: asOf.value })); }
function toggleState(s: PaPartState): void {
  stateFilter.value = stateFilter.value.includes(s) ? stateFilter.value.filter((x) => x !== s) : [...stateFilter.value, s];
}

// ── 3 检验 ──
function setReviews(items: Array<{ partNo: string; status?: PaReviewStatus; text?: string; remark?: string }>): void {
  void act('pa-plan', () => pa('review.set', { items }));
}
function bulkReview(group: PaPlanGroup, status: PaReviewStatus): void {
  void act('pa-plan', () => pa('review.bulk', { group, status, onlyPending: true }));
}

// ── 4 补库清单 ──
function editLine(partNo: string, edit: PaReplenishEdit): void {
  void act('pa-replenish', () => pa('replenish.set', { items: [{ partNo, ...edit }] }));
}
function editQty(l: PaReplenishLine, el: HTMLInputElement): void {
  const v = Number(el.value);
  if (!Number.isInteger(v) || v <= 0) {
    el.value = String(l.qty);
    errors.value = { ...errors.value, 'pa-replenish': i18nT('配件 {p0} 的下单数量要是大于 0 的整数', { p0: l.partNo }) };
    return;
  }
  editLine(l.partNo, { qty: v });
}
function editPrice(partNo: string, raw: string): void {
  editLine(partNo, { unitPrice: raw.trim() === '' ? null : Number(raw) });
}
function selectAll(selected: boolean): void {
  void act('pa-replenish', () => pa('replenish.set', { items: lines.value.map((l) => ({ partNo: l.partNo, selected })) }));
}
function confirmLines(): void { void act('pa-replenish', () => pa('replenish.confirm')); }

// ── 5 转采购订单 ──
function exportOrder(): void { void act('pa-order', async () => { await pa('order.export'); planFile.value = ''; }); }
function exportPlan(): void { void act('pa-order', async () => { planFile.value = await pa<string>('plan.export'); }); }
</script>

<style scoped>
.pa-slots { display: grid; gap: 10px; grid-template-columns: repeat(auto-fit, minmax(min(100%, 460px), 1fr)); }
.pa-states { display: grid; gap: 10px; grid-template-columns: repeat(auto-fit, minmax(min(100%, 130px), 1fr)); }
.pa-states.stale { opacity: .55; }
.pa-state { display: grid; gap: 2px; text-align: start; border: 1px solid var(--color-border); border-inline-start-width: 4px; border-radius: var(--radius-5); padding: 10px 12px; background: var(--color-bg-card); font: inherit; color: var(--color-text-primary); cursor: pointer; }
.pa-state small { color: var(--color-text-secondary); font-size: 11.5px; }
.pa-state strong { font-size: 22px; font-variant-numeric: tabular-nums; }
.pa-state em { font-style: normal; font-size: 11.5px; color: var(--color-text-secondary); }
.pa-state.bad { border-inline-start-color: var(--color-danger); }
.pa-state.warn { border-inline-start-color: var(--color-warning); }
.pa-state.ok { border-inline-start-color: var(--color-success); }
.pa-state.brand { border-inline-start-color: var(--color-brand); }
.pa-state.mute { border-inline-start-color: var(--color-text-secondary); }
.pa-state.on { box-shadow: 0 0 0 2px color-mix(in srgb, var(--color-brand) 35%, transparent); }
.pa-state.total { cursor: default; border-inline-start-width: 1px; }
.pa-qty { width: 96px; min-width: 0 !important; text-align: right; }
.pa-changed { display: block; margin-top: 2px; font-size: 11.5px; color: var(--color-warning); }
.pa-changed .ss-link { margin-inline-start: 6px; }
tr.off td { opacity: .5; }
tr.off td:first-child { opacity: 1; }
.spin { animation: pa-spin 1s linear infinite; }
@keyframes pa-spin { to { transform: rotate(360deg); } }
</style>
