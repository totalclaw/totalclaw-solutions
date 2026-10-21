<template>
  <div class="ss-module">
    <ModuleHeader :meta="meta" />

    <div class="fa-split">
      <aside class="fa-list">
        <div class="ss-subhead">{{ $t('核算记录') }}</div>
        <ul>
          <li v-for="r in runs" :key="r.id" :class="{ active: r.id === selectedId }" @click="selectRun(r.id)">
            <div class="fa-list__top"><strong>{{ r.period }}</strong><span class="ss-chip">{{ $t('{n} 个产品', { n: r.result.length }) }}</span></div>
            <div class="fa-list__meta">
              <span>{{ fmtDateTime(r.createdAt) }}</span>
              <button type="button" class="ss-link" @click.stop="remove(r.id)">{{ $t('删除') }}</button>
            </div>
          </li>
          <li v-if="!runs.length" class="ss-empty">{{ $t('还没有核算记录') }}</li>
        </ul>
        <button type="button" class="ss-btn sm ghost" @click="newRun"><i class="ri-add-line"></i>{{ $t('新核算') }}</button>
      </aside>

      <section class="fa-detail">
        <StickyProgress :title="$t('成本核算')" :metas="metas" :runtime="runtime" :current-key="currentKey" @jump="jump" />
        <div class="ss-steps">
          <StepCard step-key="products" :index="0" :title="metas[0].title" :hint="metas[0].hint" :runtime="runtime.products">
            <div class="ss-grid">
              <label class="ss-field"><span>{{ $t('核算期间') }}</span><input v-model="period" type="month" /></label>
            </div>
            <FileDrop compact kind="excel" :multi="false" :label="$t('导入产量表')" :hint="$t('需要：产品、完工数量；可选：工时、机时')" :disabled="!!busy" @picked="(p) => importProducts(p[0])" />
            <div class="ss-table-wrap">
              <table class="ss-table">
                <thead><tr><th>{{ $t('产品') }}</th><th class="num">{{ $t('完工数量') }}</th><th class="num">{{ $t('工时') }}</th><th class="num">{{ $t('机时') }}</th><th></th></tr></thead>
                <tbody>
                  <tr v-for="(p, i) in products" :key="i">
                    <td><input v-model.trim="p.name" type="text" /></td>
                    <td><input v-model.number="p.output" type="number" min="0" /></td>
                    <td><input v-model.number="p.hours" type="number" min="0" /></td>
                    <td><input v-model.number="p.machineHours" type="number" min="0" /></td>
                    <td><button type="button" class="ss-link" @click="products.splice(i, 1)">{{ $t('删除') }}</button></td>
                  </tr>
                  <tr v-if="!products.length"><td colspan="5" class="ss-empty">{{ $t('导入或手工添加产品') }}</td></tr>
                </tbody>
              </table>
            </div>
            <div class="ss-actions"><button type="button" class="ss-btn sm ghost" @click="products.push({ name: '', output: 0, hours: 0, machineHours: 0 })"><i class="ri-add-line"></i>{{ $t('加一行') }}</button></div>
          </StepCard>

          <StepCard step-key="materials" :index="1" :title="metas[1].title" :hint="metas[1].hint" :runtime="runtime.materials">
            <FileDrop compact kind="excel" :multi="false" :label="$t('导入领料表')" :hint="$t('需要：产品、材料、数量（或金额）；可选：单价、BOM 单耗')" :disabled="!!busy" @picked="(p) => importMaterials(p[0])" />
            <div class="ss-table-wrap">
              <table class="ss-table">
                <thead><tr><th>{{ $t('产品') }}</th><th>{{ $t('材料') }}</th><th class="num">{{ $t('数量') }}</th><th class="num">{{ $t('单价') }}</th><th class="num">{{ $t('BOM 单耗') }}</th><th></th></tr></thead>
                <tbody>
                  <tr v-for="(m, i) in materials" :key="i">
                    <td><input v-model.trim="m.product" type="text" /></td>
                    <td><input v-model.trim="m.material" type="text" /></td>
                    <td><input v-model.number="m.qty" type="number" min="0" /></td>
                    <td><input v-model.number="m.unitPrice" type="number" min="0" /></td>
                    <td><input v-model.number="m.stdPerUnit" type="number" min="0" /></td>
                    <td><button type="button" class="ss-link" @click="materials.splice(i, 1)">{{ $t('删除') }}</button></td>
                  </tr>
                  <tr v-if="!materials.length"><td colspan="6" class="ss-empty">{{ $t('导入或手工添加领料记录') }}</td></tr>
                </tbody>
              </table>
            </div>
            <div class="ss-actions"><button type="button" class="ss-btn sm ghost" @click="materials.push({ product: '', material: '', qty: 0, unitPrice: 0 })"><i class="ri-add-line"></i>{{ $t('加一行') }}</button></div>
          </StepCard>

          <StepCard step-key="overhead" :index="2" :title="metas[2].title" :hint="metas[2].hint" :runtime="runtime.overhead">
            <div class="ss-grid">
              <label class="ss-field"><span>{{ $t('直接人工总额') }}</span><input v-model.number="laborTotal" type="number" min="0" /></label>
              <label class="ss-field"><span>{{ $t('制造费用分配标准') }}</span>
                <select v-model="basis">
                  <option value="hours">{{ $t('生产工时') }}</option>
                  <option value="machine">{{ $t('机器工时') }}</option>
                  <option value="output">{{ $t('产量') }}</option>
                  <option value="material">{{ $t('直接材料成本') }}</option>
                </select>
              </label>
              <label class="ss-field"><span>{{ $t('损耗容差（%）') }}</span><input v-model.number="tolerancePct" type="number" min="0" step="0.5" /></label>
            </div>
            <div class="ss-subhead">{{ $t('制造费用明细') }}</div>
            <div v-for="(o, i) in overheadItems" :key="i" class="fa-row">
              <input v-model.trim="o.item" type="text" :placeholder="$t('项目（如电费、折旧）')" />
              <input v-model.number="o.amount" type="number" min="0" :placeholder="$t('金额')" />
              <button type="button" class="ss-link" @click="overheadItems.splice(i, 1)">{{ $t('删除') }}</button>
            </div>
            <div class="ss-actions">
              <button type="button" class="ss-btn sm ghost" @click="overheadItems.push({ item: '', amount: 0 })"><i class="ri-add-line"></i>{{ $t('加一项') }}</button>
              <span class="ss-muted">{{ $t('制造费用合计 {p0}', { p0: fmtMoney(overheadTotal) }) }}</span>
            </div>
          </StepCard>

          <StepCard step-key="compute" :index="3" :title="metas[3].title" :hint="metas[3].hint" :runtime="runtime.compute">
            <div class="ss-actions">
              <button type="button" class="ss-btn primary" :disabled="!!busy || !products.length || !period" @click="compute">
                <i :class="busy === 'compute' ? 'ri-loader-4-line spin' : 'ri-calculator-line'"></i>{{ $t('计算成本') }}
              </button>
              <span class="ss-muted">{{ $t('分摊按分计算，尾差放在最后一个产品上') }}</span>
            </div>
            <template v-if="current">
              <div class="ss-table-wrap">
                <table class="ss-table">
                  <thead><tr>
                    <th>{{ $t('产品') }}</th><th class="num">{{ $t('完工数量') }}</th><th class="num">{{ $t('直接材料') }}</th><th class="num">{{ $t('直接人工') }}</th>
                    <th class="num">{{ $t('制造费用') }}</th><th class="num">{{ $t('总成本') }}</th><th class="num">{{ $t('单位成本') }}</th><th class="num">{{ $t('上期单位成本') }}</th><th class="num">{{ $t('变动') }}</th>
                  </tr></thead>
                  <tbody>
                    <tr v-for="r in current.result" :key="r.product">
                      <td>{{ r.product }}</td><td class="num">{{ r.output }}</td><td class="num">{{ fmtMoney(r.material) }}</td><td class="num">{{ fmtMoney(r.labor) }}</td>
                      <td class="num">{{ fmtMoney(r.overhead) }}</td><td class="num">{{ fmtMoney(r.total) }}</td><td class="num"><strong>{{ fmtMoney(r.unitCost) }}</strong></td>
                      <td class="num">{{ r.priorUnitCost != null ? fmtMoney(r.priorUnitCost) : '-' }}</td>
                      <td class="num">{{ r.change != null ? fmtPct(r.change) : '-' }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div class="ss-subhead">{{ $t('分配过程') }}</div>
              <ul class="fa-calc">
                <li v-for="(c, i) in current.calc" :key="i"><strong>{{ c.label }}</strong><span>{{ c.formula }}</span><em>{{ c.value }}</em></li>
              </ul>
              <div v-if="current.losses.length">
                <div class="ss-subhead">{{ $t('异常损耗与波动') }}</div>
                <ul class="fa-findings">
                  <li v-for="(f, i) in current.losses" :key="i">
                    <span class="ss-chip" :class="levelChip(f.level)">{{ levelLabel(f.level) }}</span>
                    <div><strong>{{ f.title }}</strong><p class="fa-pre">{{ f.detail }}</p><p class="ss-muted">{{ f.suggestion }}</p></div>
                  </li>
                </ul>
              </div>
              <p v-else class="ss-note ok"><i class="ri-check-line"></i>{{ $t('没有发现超耗或大幅波动') }}</p>
            </template>
          </StepCard>

          <StepCard step-key="commentary" :index="4" :title="metas[4].title" :hint="metas[4].hint" :runtime="runtime.commentary">
            <div class="ss-actions">
              <button type="button" class="ss-btn primary" :disabled="!!busy || !current" @click="commentary">
                <i :class="busy === 'commentary' ? 'ri-loader-4-line spin' : 'ri-quill-pen-line'"></i>{{ current?.commentary ? $t('重新分析') : $t('写成本分析') }}
              </button>
              <span v-if="current?.model" class="ss-muted">{{ $t('由 {p0} 写作', { p0: modelLabel(current.model) }) }}</span>
            </div>
            <p v-if="current?.commentary" class="fa-pre fa-text">{{ current.commentary }}</p>
          </StepCard>

          <StepCard step-key="export" :index="5" :title="metas[5].title" :hint="metas[5].hint" :runtime="runtime.export">
            <div class="ss-actions">
              <button type="button" class="ss-btn primary" :disabled="!!busy || !current" @click="exportRun">
                <i :class="busy === 'export' ? 'ri-loader-4-line spin' : 'ri-file-excel-2-line'"></i>{{ $t('导出成本计算单') }}
              </button>
              <template v-if="current?.exportPath">
                <code class="fa-path">{{ current.exportPath }}</code>
                <button type="button" class="ss-btn sm ghost" @click="open(current.exportPath)"><i class="ri-external-link-line"></i>{{ $t('打开') }}</button>
              </template>
            </div>
          </StepCard>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 成本核算智能体：产量 → 领料 → 人工与制造费用 → 计算（分摊、单位成本、超耗）→ 模型写分析 → 导出。
 */
import { computed, ref } from 'vue';
import type { FaAllocBasis, FaCostMaterial, FaCostProduct, FaCostRun } from '@totalclaw/ipc-contracts';
import { useNotificationStore } from '../../stores/notification';
import { t as i18nT } from '../../i18n';
import StepCard from '../service-settlement/StepCard.vue';
import StickyProgress from '../service-settlement/StickyProgress.vue';
import ModuleHeader from './ModuleHeader.vue';
import FileDrop from './FileDrop.vue';
import {
  currentMonth, errorMessage, fa, faState, fmtDateTime, fmtMoney, fmtPct, levelChip, levelLabel, modelLabel, openPath, refreshState, scrollToStep,
  type FaModuleMeta, type StepMeta, type StepRuntime,
} from './shared';

defineProps<{ meta: FaModuleMeta; focus?: any }>();
defineEmits<{ (e: 'goto', module: string, payload?: any): void }>();
const notif = useNotificationStore();

const runs = computed<FaCostRun[]>(() => faState.value?.data.costRuns || []);
const selectedId = ref('');
const current = computed(() => runs.value.find((r) => r.id === selectedId.value) || null);

const period = ref(currentMonth());
const products = ref<FaCostProduct[]>([]);
const materials = ref<FaCostMaterial[]>([]);
const laborTotal = ref(0);
const overheadItems = ref<Array<{ item: string; amount: number }>>([{ item: '', amount: 0 }]);
const basis = ref<FaAllocBasis>('hours');
const tolerancePct = ref(5);
const overheadTotal = computed(() => overheadItems.value.reduce((s, o) => s + (Number(o.amount) || 0), 0));

const busy = ref('');
const errors = ref<Record<string, string>>({});

const metas: StepMeta[] = [
  { key: 'products', title: i18nT('产量'), hint: i18nT('各产品本期完工数量、工时、机时') },
  { key: 'materials', title: i18nT('领料（料）'), hint: i18nT('各产品领用的材料；填 BOM 单耗才能判断超耗') },
  { key: 'overhead', title: i18nT('人工与制造费用（工、费）'), hint: i18nT('直接人工按工时分摊，制造费用按选定标准分摊') },
  { key: 'compute', title: i18nT('计算单品成本'), hint: i18nT('料工费归集、分摊、单位成本、与上期比、异常损耗') },
  { key: 'commentary', title: i18nT('成本分析'), hint: i18nT('模型按计算结果写分析，数字不改') },
  { key: 'export', title: i18nT('导出'), hint: i18nT('成本计算单、分配过程、异常清单（Excel）') },
];
const runtime = computed<Record<string, StepRuntime>>(() => {
  const st = (key: string, done: boolean, summary?: string): StepRuntime => (busy.value === key ? { state: 'running' }
    : errors.value[key] ? { state: 'failed', error: errors.value[key] } : done ? { state: 'done', summary } : { state: 'todo' });
  const c = current.value;
  return {
    products: st('products', products.value.length > 0, i18nT('{n} 个产品', { n: products.value.length })),
    materials: st('materials', materials.value.length > 0, i18nT('{n} 条领料', { n: materials.value.length })),
    overhead: st('overhead', laborTotal.value > 0 || overheadTotal.value > 0, i18nT('人工 {a}，制造费用 {b}', { a: fmtMoney(laborTotal.value), b: fmtMoney(overheadTotal.value) })),
    compute: st('compute', !!c, c ? i18nT('{n} 个产品，{m} 条异常', { n: c.result.length, m: c.losses.length }) : ''),
    commentary: st('commentary', !!c?.commentary),
    export: st('export', !!c?.exportPath),
  };
});
const currentKey = computed(() => metas.find((m) => runtime.value[m.key].state !== 'done')?.key || 'export');

function selectRun(id: string): void {
  selectedId.value = id;
  const r = runs.value.find((x) => x.id === id);
  if (!r) return;
  period.value = r.period;
  products.value = r.products.map((p) => ({ ...p }));
  materials.value = r.materials.map((m) => ({ ...m }));
  laborTotal.value = r.laborTotal;
  overheadItems.value = r.overheadItems.map((o) => ({ ...o }));
  basis.value = r.basis;
  tolerancePct.value = Math.round(r.lossTolerance * 1000) / 10;
  errors.value = {};
}
function newRun(): void {
  selectedId.value = '';
  period.value = currentMonth();
  products.value = [];
  materials.value = [];
  laborTotal.value = 0;
  overheadItems.value = [{ item: '', amount: 0 }];
  errors.value = {};
}
if (runs.value.length) selectRun(runs.value[0].id);

async function run(key: string, fn: () => Promise<unknown>): Promise<void> {
  busy.value = key;
  errors.value = { ...errors.value, [key]: '' };
  void scrollToStep(key);
  try { await fn(); } catch (e) { errors.value = { ...errors.value, [key]: errorMessage(e) }; } finally { busy.value = ''; }
}
function importProducts(path: string): Promise<void> {
  return run('products', async () => { products.value = await fa<FaCostProduct[]>('cost.importProducts', { path }); });
}
function importMaterials(path: string): Promise<void> {
  return run('materials', async () => { materials.value = await fa<FaCostMaterial[]>('cost.importMaterials', { path }); });
}
function compute(): Promise<void> {
  return run('compute', async () => {
    const r = await fa<FaCostRun>('cost.compute', {
      period: period.value, basis: basis.value, laborTotal: Number(laborTotal.value) || 0,
      overheadItems: overheadItems.value.filter((o) => o.item && Number(o.amount)),
      products: products.value.filter((p) => p.name),
      materials: materials.value.filter((m) => m.product && m.material),
      lossTolerance: (Number(tolerancePct.value) || 0) / 100,
    });
    await refreshState();
    selectedId.value = r.id;
  });
}
function commentary(): Promise<void> {
  return run('commentary', async () => { await fa('cost.commentary', { id: selectedId.value }); await refreshState(); });
}
function exportRun(): Promise<void> {
  return run('export', async () => { await fa('cost.export', { id: selectedId.value }); await refreshState(); });
}
async function remove(id: string): Promise<void> {
  if (!window.confirm(i18nT('删除这条核算记录？'))) return;
  try {
    await fa('cost.remove', { id });
    if (selectedId.value === id) newRun();
    await refreshState();
  } catch (e) { notif.error(errorMessage(e)); }
}
function open(path: string): void { openPath(path).catch((e) => notif.error(errorMessage(e))); }
function jump(key: string): void { void scrollToStep(key); }
</script>

<style scoped>
.fa-split { display: grid; grid-template-columns: minmax(200px, 250px) 1fr; gap: 14px; align-items: start; }
@media (max-width: 960px) { .fa-split { grid-template-columns: 1fr; } }
.fa-list { display: grid; gap: 8px; border: 1px solid var(--color-border); border-radius: 14px; background: var(--color-bg-card); padding: 10px; position: sticky; top: 0; }
.fa-list ul { list-style: none; margin: 0; padding: 0; display: grid; gap: 6px; max-height: 50vh; overflow-y: auto; }
.fa-list li { padding: 8px 10px; border-radius: 10px; border: 1px solid transparent; cursor: pointer; display: grid; gap: 3px; background: var(--color-bg-primary); }
.fa-list li.active { border-color: var(--color-brand); }
.fa-list__top { display: flex; justify-content: space-between; gap: 6px; align-items: center; font-size: 13px; }
.fa-list__meta { display: flex; gap: 8px; font-size: 11px; color: var(--color-text-secondary); }
.fa-detail { display: grid; gap: 12px; min-width: 0; }
.fa-row { display: flex; gap: 8px; align-items: center; }
.fa-row input { flex: 1; min-width: 0; height: 32px; border-radius: 8px; border: 1px solid var(--color-border); background: var(--color-bg-primary); color: var(--color-text-primary); padding: 0 8px; font: inherit; }
.ss-table input { width: 100%; min-width: 70px; box-sizing: border-box; }
.fa-calc { list-style: none; margin: 0; padding: 0; display: grid; gap: 4px; font-size: 12.5px; }
.fa-calc li { display: flex; gap: 10px; flex-wrap: wrap; }
.fa-calc em { font-style: normal; color: var(--color-brand); font-variant-numeric: tabular-nums; }
.fa-findings { list-style: none; margin: 0; padding: 0; display: grid; gap: 8px; font-size: 12.5px; }
.fa-findings li { display: flex; gap: 8px; align-items: flex-start; }
.fa-findings p { margin: 2px 0 0; }
.fa-pre { white-space: pre-wrap; }
.fa-text { margin: 0; font-size: 13px; line-height: 1.7; }
.fa-path { font-size: 12px; color: var(--color-text-secondary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 420px; }
.spin { animation: fa-spin 1s linear infinite; }
@keyframes fa-spin { to { transform: rotate(360deg); } }
</style>
