<template>
  <div class="ss-module">
    <ModuleHeader :meta="meta" />

    <StickyProgress :title="$t('预算管控')" :metas="metas" :runtime="runtime" :current-key="currentKey" @jump="jump" />
    <div class="ss-steps">
      <StepCard step-key="bdg-input" :index="0" :title="metas[0].title" :hint="metas[0].hint" :runtime="runtime['bdg-input']">
        <div class="ss-actions">
          <label class="ss-field fa-year"><span>{{ $t('预算年度') }}</span><input v-model.number="year" type="number" min="2000" max="2100" /></label>
          <FileDrop compact kind="excel" :multi="false" :label="$t('导入预算表')" :hint="$t('列：部门、类别（预算科目）、1月…12月，或只有全年预算一列')" :disabled="!!busy" class="fa-grow" @picked="(p) => importBudget(p[0])" />
        </div>
        <div class="ss-table-wrap">
          <table class="ss-table fa-budget-edit">
            <thead>
              <tr>
                <th>{{ $t('部门') }}</th><th>{{ $t('类别') }}</th>
                <th v-for="m in 12" :key="m" class="num">{{ $t('{n}月', { n: m }) }}</th>
                <th class="num">{{ $t('全年') }}</th><th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(l, i) in draft" :key="i">
                <td><input v-model.trim="l.dept" type="text" :placeholder="$t('全公司')" /></td>
                <td><input v-model.trim="l.category" type="text" :placeholder="$t('如：差旅费')" /></td>
                <td v-for="m in 12" :key="m"><input v-model.number="l.months[m - 1]" type="number" min="0" class="num" /></td>
                <td class="num">{{ fmtMoney(rowTotal(l)) }}</td>
                <td><button type="button" class="ss-link" @click="draft.splice(i, 1)">{{ $t('删除') }}</button></td>
              </tr>
              <tr v-if="!draft.length"><td colspan="16" class="ss-empty">{{ $t('还没有预算：导入预算表，或点「加一行」') }}</td></tr>
            </tbody>
          </table>
        </div>
        <div class="ss-actions">
          <button type="button" class="ss-btn sm ghost" @click="addRow"><i class="ri-add-line"></i>{{ $t('加一行') }}</button>
          <button type="button" class="ss-btn sm primary" :disabled="!!busy || !dirty" @click="save"><i :class="busy === 'bdg-input' ? 'ri-loader-4-line spin' : 'ri-save-line'"></i>{{ $t('保存预算') }}</button>
          <span v-if="dirty" class="ss-muted">{{ $t('有未保存的修改') }}</span>
        </div>
      </StepCard>

      <StepCard step-key="bdg-track" :index="1" :title="metas[1].title" :hint="metas[1].hint" :runtime="runtime['bdg-track']">
        <div class="ss-actions">
          <label class="ss-field fa-year"><span>{{ $t('截至月份') }}</span>
            <select v-model.number="month"><option v-for="m in 12" :key="m" :value="m">{{ $t('{n}月', { n: m }) }}</option></select>
          </label>
          <button type="button" class="ss-btn primary" :disabled="!!busy || !savedLines.length" @click="analyze">
            <i :class="busy === 'bdg-track' ? 'ri-loader-4-line spin' : 'ri-bar-chart-box-line'"></i>{{ $t('跟踪执行') }}
          </button>
        </div>
        <p v-if="source === 'claims'" class="ss-note warn">
          <i class="ri-information-line"></i>{{ $t('账套还没有序时账，实际数暂用已通过的报销单统计；导入序时账后按账面数算更准。') }}
          <button type="button" class="ss-link" @click="showData = !showData">{{ showData ? $t('收起') : $t('去导入') }}</button>
        </p>
        <p v-else-if="source === 'journal'" class="ss-muted">{{ $t('实际数取自序时账（含本工作台已审核凭证）') }}</p>
        <DataSourcePanel v-if="showData" />
        <div v-if="current" class="ss-table-wrap">
          <table class="ss-table">
            <thead>
              <tr>
                <th>{{ $t('部门') }}</th><th>{{ $t('类别') }}</th><th class="num">{{ $t('累计预算') }}</th><th class="num">{{ $t('累计实际') }}</th><th>{{ $t('执行率') }}</th>
                <th class="num">{{ $t('本月预算') }}</th><th class="num">{{ $t('本月实际') }}</th><th class="num">{{ $t('本月差异') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(r, i) in current.rows" :key="i" :class="{ bad: r.level === 'over' }">
                <td>{{ r.dept }}</td><td>{{ r.category }}</td>
                <td class="num">{{ fmtMoney(r.budget) }}</td><td class="num">{{ fmtMoney(r.actual) }}</td>
                <td>
                  <div class="fa-usage" :class="r.level"><span :style="{ width: `${Math.min(100, r.usage * 100)}%` }"></span></div>
                  <small>{{ fmtPct(r.usage, 1) }}</small>
                </td>
                <td class="num">{{ fmtMoney(r.monthBudget) }}</td><td class="num">{{ fmtMoney(r.monthActual) }}</td>
                <td class="num">{{ fmtMoney(r.monthActual - r.monthBudget) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </StepCard>

      <StepCard step-key="bdg-warn" :index="2" :title="metas[2].title" :hint="metas[2].hint" :runtime="runtime['bdg-warn']">
        <template v-if="current">
          <ul v-if="alerts.length" class="fa-alerts">
            <li v-for="(r, i) in alerts" :key="i">
              <span class="ss-chip" :class="r.level === 'over' ? 'bad' : 'warn'">{{ r.level === 'over' ? $t('超预算') : $t('接近上限') }}</span>
              <span>{{ $t('{p0} / {p1}：累计预算 {a}，实际 {b}，执行率 {c}', { p0: r.dept, p1: r.category, a: fmtMoney(r.budget), b: fmtMoney(r.actual), c: fmtPct(r.usage, 1) }) }}</span>
            </li>
          </ul>
          <p v-else class="ss-note ok"><i class="ri-check-line"></i>{{ $t('各项预算都在 80% 以内') }}</p>
        </template>
      </StepCard>

      <StepCard step-key="bdg-comment" :index="3" :title="metas[3].title" :hint="metas[3].hint" :runtime="runtime['bdg-comment']">
        <div class="ss-actions">
          <button type="button" class="ss-btn primary" :disabled="!!busy || !current" @click="commentary">
            <i :class="busy === 'bdg-comment' ? 'ri-loader-4-line spin' : 'ri-quill-pen-line'"></i>{{ current?.commentary ? $t('重新解读') : $t('生成差异解读') }}
          </button>
          <span v-if="current?.model" class="ss-muted">{{ $t('由 {p0} 撰写', { p0: modelLabel(current.model) }) }}</span>
        </div>
        <div v-if="current?.commentary" class="fa-text">{{ current.commentary }}</div>
      </StepCard>

      <StepCard step-key="bdg-precheck" :index="4" :title="metas[4].title" :hint="metas[4].hint" :runtime="runtime['bdg-precheck']">
        <div class="ss-grid">
          <label class="ss-field"><span>{{ $t('部门') }}</span><input v-model.trim="pre.dept" type="text" /></label>
          <label class="ss-field"><span>{{ $t('类别') }}</span><input v-model.trim="pre.category" type="text" list="fa-budget-cats" /></label>
          <label class="ss-field"><span>{{ $t('本次金额') }}</span><input v-model.number="pre.amount" type="number" min="0" /></label>
        </div>
        <datalist id="fa-budget-cats"><option v-for="c in categories" :key="c" :value="c" /></datalist>
        <div class="ss-actions">
          <button type="button" class="ss-btn sm primary" :disabled="!!busy || !pre.category || !pre.amount" @click="precheck"><i class="ri-shield-check-line"></i>{{ $t('预检') }}</button>
          <span v-if="preResult" class="ss-chip" :class="preResult.ok ? 'ok' : 'bad'">{{ preResult.ok ? $t('可以支出') : $t('会超预算') }}</span>
          <span v-if="preResult" class="ss-muted">{{ preResult.message }}</span>
        </div>
      </StepCard>

      <StepCard step-key="bdg-export" :index="5" :title="metas[5].title" :hint="metas[5].hint" :runtime="runtime['bdg-export']">
        <div class="ss-actions">
          <button type="button" class="ss-btn primary" :disabled="!!busy || !current" @click="exportIt">
            <i :class="busy === 'bdg-export' ? 'ri-loader-4-line spin' : 'ri-download-2-line'"></i>{{ $t('导出预算执行表') }}
          </button>
          <template v-if="current?.exportPath">
            <code class="fa-out">{{ current.exportPath }}</code>
            <button type="button" class="ss-link" @click="open(current.exportPath)">{{ $t('打开') }}</button>
            <button type="button" class="ss-link" @click="open(current.exportPath, true)">{{ $t('所在文件夹') }}</button>
          </template>
        </div>
      </StepCard>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 预算管控：录入预算 → 跟踪执行 → 超预算预警 → 月度差异解读 → 支出预检 → 导出。
 */
import { computed, reactive, ref, watch } from 'vue';
import type { FaBudgetAnalysis, FaBudgetLine } from '@totalclaw/ipc-contracts';
import { useNotificationStore } from '../../stores/notification';
import { t as i18nT } from '../../i18n';
import StepCard from '../service-settlement/StepCard.vue';
import StickyProgress from '../service-settlement/StickyProgress.vue';
import ModuleHeader from './ModuleHeader.vue';
import FileDrop from './FileDrop.vue';
import DataSourcePanel from './DataSourcePanel.vue';
import {
  errorMessage, fa, faState, fmtMoney, fmtPct, modelLabel, openPath, refreshState, scrollToStep,
  type FaModuleMeta, type StepMeta, type StepRuntime,
} from './shared';

defineProps<{ meta: FaModuleMeta; focus?: any }>();
defineEmits<{ (e: 'goto', module: string, payload?: any): void }>();
const notif = useNotificationStore();

const budget = computed(() => faState.value?.data.budget || { year: new Date().getFullYear(), lines: [] as FaBudgetLine[] });
const savedLines = computed(() => budget.value.lines);
const year = ref(budget.value.year);
const draft = ref<FaBudgetLine[]>([]);
const clone = (lines: FaBudgetLine[]) => lines.map((l) => ({ dept: l.dept, category: l.category, months: Array.from({ length: 12 }, (_, i) => Number(l.months[i]) || 0) }));
watch(budget, (b) => { draft.value = clone(b.lines); year.value = b.year; }, { immediate: true });
const dirty = computed(() => year.value !== budget.value.year || JSON.stringify(draft.value) !== JSON.stringify(clone(savedLines.value)));
const categories = computed(() => [...new Set(savedLines.value.map((l) => l.category))]);

const analyses = computed(() => faState.value?.data.budgetAnalyses || []);
const month = ref(new Date().getMonth() + 1);
const selectedId = ref('');
const current = computed<FaBudgetAnalysis | null>(() => analyses.value.find((a) => a.id === selectedId.value) || analyses.value.find((a) => a.year === budget.value.year) || null);
const source = ref<'journal' | 'claims' | ''>('');
const alerts = computed(() => (current.value?.rows || []).filter((r) => r.level !== 'ok'));
const showData = ref(false);

const pre = reactive({ dept: '', category: '', amount: 0 });
const preResult = ref<{ ok: boolean; remaining: number | null; message: string } | null>(null);

const busy = ref('');
const errors = ref<Record<string, string>>({});
const metas: StepMeta[] = [
  { key: 'bdg-input', title: i18nT('录入预算'), hint: i18nT('按部门 × 类别 × 月份录入额度') },
  { key: 'bdg-track', title: i18nT('跟踪执行'), hint: i18nT('各部门预算消耗与执行率') },
  { key: 'bdg-warn', title: i18nT('超预算预警'), hint: i18nT('执行率 ≥ 80% 预警，≥ 100% 超支') },
  { key: 'bdg-comment', title: i18nT('差异解读'), hint: i18nT('模型写月度预算差异解读') },
  { key: 'bdg-precheck', title: i18nT('支出预检'), hint: i18nT('花钱之前先看会不会超预算') },
  { key: 'bdg-export', title: i18nT('导出'), hint: i18nT('预算执行表 Excel') },
];
function st(key: string, done: boolean, summary?: string): StepRuntime {
  return busy.value === key ? { state: 'running' } : errors.value[key] ? { state: 'failed', error: errors.value[key] } : done ? { state: 'done', summary } : { state: 'todo' };
}
const runtime = computed<Record<string, StepRuntime>>(() => {
  const c = current.value;
  return {
    'bdg-input': st('bdg-input', savedLines.value.length > 0 && !dirty.value, i18nT('{n} 行预算', { n: savedLines.value.length })),
    'bdg-track': st('bdg-track', !!c, c ? i18nT('{y} 年截至 {m} 月', { y: c.year, m: c.month }) : ''),
    'bdg-warn': st('bdg-warn', !!c, c ? i18nT('{n} 项预警', { n: alerts.value.length }) : ''),
    'bdg-comment': st('bdg-comment', !!c?.commentary),
    'bdg-precheck': st('bdg-precheck', !!preResult.value),
    'bdg-export': st('bdg-export', !!c?.exportPath),
  };
});
const currentKey = computed(() => metas.find((m) => runtime.value[m.key].state !== 'done')?.key || 'bdg-export');

function rowTotal(l: FaBudgetLine): number { return l.months.reduce((s, v) => s + (Number(v) || 0), 0); }
function addRow(): void { draft.value.push({ dept: '', category: '', months: Array(12).fill(0) }); }

async function run(key: string, fn: () => Promise<unknown>): Promise<void> {
  busy.value = key;
  errors.value = { ...errors.value, [key]: '' };
  void scrollToStep(key);
  try { await fn(); await refreshState(); } catch (e) { errors.value = { ...errors.value, [key]: errorMessage(e) }; } finally { busy.value = ''; }
}
async function importBudget(path: string): Promise<void> { await run('bdg-input', () => fa('budget.import', { path, year: year.value })); }
async function save(): Promise<void> { await run('bdg-input', () => fa('budget.save', { year: year.value, lines: draft.value })); }
async function analyze(): Promise<void> {
  await run('bdg-track', async () => {
    const r = await fa<FaBudgetAnalysis & { source: 'journal' | 'claims' }>('budget.analyze', { month: month.value });
    selectedId.value = r.id;
    source.value = r.source;
  });
}
async function commentary(): Promise<void> { if (current.value) await run('bdg-comment', () => fa('budget.commentary', { id: current.value!.id })); }
async function precheck(): Promise<void> {
  busy.value = 'bdg-precheck';
  errors.value = { ...errors.value, 'bdg-precheck': '' };
  try { preResult.value = await fa('budget.precheck', { dept: pre.dept, category: pre.category, amount: pre.amount }); } catch (e) { errors.value = { ...errors.value, 'bdg-precheck': errorMessage(e) }; } finally { busy.value = ''; }
}
async function exportIt(): Promise<void> { if (current.value) await run('bdg-export', () => fa('budget.export', { id: current.value!.id })); }
function open(path: string, reveal = false): void { openPath(path, reveal).catch((e) => notif.error(errorMessage(e))); }
function jump(key: string): void { void scrollToStep(key); }
</script>

<style scoped>
.fa-year { max-width: 160px; }
.fa-grow { flex: 1; min-width: 280px; }
.fa-budget-edit input { width: 100%; min-width: 64px; box-sizing: border-box; }
.fa-budget-edit td:first-child input, .fa-budget-edit td:nth-child(2) input { min-width: 100px; }
.fa-budget-edit input.num { text-align: right; }
.fa-usage { width: 110px; height: 6px; border-radius: var(--radius-1); background: var(--color-bg-hover); overflow: hidden; }
.fa-usage span { display: block; height: 100%; background: var(--color-success); }
.fa-usage.warn span { background: var(--color-warning); }
.fa-usage.over span { background: var(--color-danger); }
.fa-alerts { list-style: none; margin: 0; padding: 0; display: grid; gap: 6px; font-size: 12.5px; }
.fa-alerts li { display: flex; gap: 8px; align-items: center; }
.fa-text { white-space: pre-wrap; font-size: var(--font-size-md); line-height: 1.7; padding: 12px 14px; border-radius: var(--radius-4); background: var(--color-bg-primary); border: 1px solid var(--color-border); }
.fa-out { font-size: 11.5px; color: var(--color-text-secondary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 420px; }
.spin { animation: fa-spin 1s linear infinite; }
@keyframes fa-spin { to { transform: rotate(360deg); } }
</style>
