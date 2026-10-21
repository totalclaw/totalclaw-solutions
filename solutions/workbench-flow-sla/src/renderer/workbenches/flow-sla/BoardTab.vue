<template>
  <div class="fs-board">
    <p v-if="error" class="ss-note danger"><i class="ri-error-warning-line"></i>{{ error }}</p>
    <p v-if="board && !board.snapshot" class="ss-empty" data-test="fs-board-empty">{{ $t('还没有周期快照。在「通报」页走到第 3 步「计算」，每算一个周期就会存一份，看板从这里取数。') }}</p>
    <template v-else-if="board && board.snapshot">
      <div class="ss-actions fs-filters">
        <label class="ss-field inline"><span>{{ $t('周期') }}</span>
          <select v-model="filters.snapshotId" data-test="fs-board-period"><option v-for="s in snapshots" :key="s.id" :value="s.id">{{ kindLabel(s.kind) }} · {{ s.label }}</option></select>
        </label>
        <label class="ss-field inline"><span>{{ $t('系统') }}</span><select v-model="filters.system" data-test="fs-board-system"><option value="">{{ $t('全部') }}</option><option v-for="o in board.options.systems" :key="o" :value="o">{{ o }}</option></select></label>
        <label class="ss-field inline"><span>{{ $t('大类') }}</span><select v-model="filters.category"><option value="">{{ $t('全部') }}</option><option v-for="o in board.options.categories" :key="o" :value="o">{{ o }}</option></select></label>
        <label class="ss-field inline"><span>{{ $t('细类') }}</span><select v-model="filters.flowType"><option value="">{{ $t('全部') }}</option><option v-for="o in board.options.flowTypes" :key="o" :value="o">{{ o }}</option></select></label>
        <label class="ss-field inline"><span>{{ $t('部门') }}</span><select v-model="filters.dept"><option value="">{{ $t('全部') }}</option><option v-for="o in board.options.depts" :key="o" :value="o">{{ o }}</option></select></label>
        <button v-if="filtered" type="button" class="ss-link" @click="clearFilters">{{ $t('清除筛选') }}</button>
        <i v-if="loading" class="ri-loader-4-line spin"></i>
        <span class="grow"></span>
        <button type="button" class="ss-link" @click="removeSnapshot">{{ $t('删除这个周期的快照') }}</button>
      </div>

      <div v-if="board.overall" class="ss-kpis" data-test="fs-board-kpis">
        <div class="ss-kpi"><small>{{ $t('办结数') }}</small><strong>{{ board.overall.doneCount }}</strong></div>
        <div class="ss-kpi"><small>{{ $t('平均用时（天）') }}</small><strong>{{ fmtDays(board.overall.avgDays) }}</strong></div>
        <div class="ss-kpi accent"><small>{{ $t('流程时效合规率') }}</small><strong>{{ fmtRate(board.overall.complianceRate) }}</strong></div>
        <div class="ss-kpi"><small>{{ $t('在途数') }}</small><strong>{{ board.overall.runningCount }}</strong></div>
        <div class="ss-kpi"><small>{{ $t('已逾期') }}</small><strong :class="{ bad: board.overall.runningOverdue > 0 }">{{ board.overall.runningOverdue }}</strong></div>
        <div class="ss-kpi"><small>{{ $t('较大逾期风险') }}</small><strong>{{ board.overall.runningRisk }}</strong></div>
        <div class="ss-kpi accent"><small>{{ $t('个人审核合规率') }}</small><strong>{{ fmtRate(board.overall.reviewRate) }}</strong></div>
      </div>

      <div class="fs-charts">
        <section class="fs-card">
          <header><h3>{{ $t('合规率与平均用时趋势') }}</h3>
            <div class="fs-seg"><button v-for="k in KINDS" :key="k" type="button" :class="{ on: trendKind === k }" @click="trendKind = k">{{ kindLabel(k) }}</button></div>
          </header>
          <p v-if="trendPoints.length < 2" class="ss-empty">{{ $t('存了两个以上的{p0}周期后显示趋势', { p0: kindLabel(trendKind) }) }}</p>
          <VChart v-else class="fs-chart" :option="trendOption" autoresize />
          <p class="ss-muted">{{ $t('趋势用的是各周期保存时的整体数字，不随上面的筛选变化') }}</p>
        </section>
        <section class="fs-card">
          <header><h3>{{ $t('各流程细类合规率') }}</h3><span class="ss-muted">{{ $t('办结数最多的前 {n} 类', { n: typeBars.length }) }}</span></header>
          <p v-if="!typeBars.length" class="ss-empty">{{ $t('这个筛选条件下没有办结的流程') }}</p>
          <VChart v-else class="fs-chart" :option="typeOption" autoresize />
        </section>
      </div>

      <section class="fs-card">
        <header><h3>{{ $t('按细类') }}</h3></header>
        <div class="ss-table-wrap fs-scroll"><table class="ss-table">
          <thead><tr><th>{{ $t('大类') }}</th><th>{{ $t('流程细类') }}</th><th>{{ $t('系统') }}</th><th class="num">{{ $t('办结') }}</th><th class="num">{{ $t('平均用时（天）') }}</th><th class="num">{{ $t('时效要求') }}</th><th class="num">{{ $t('合规率') }}</th><th class="num">{{ $t('在途') }}</th><th class="num">{{ $t('在途逾期') }}</th></tr></thead>
          <tbody>
            <tr v-for="t in board.byType" :key="t.category + t.flowType + t.system" class="fs-click" :class="{ bad: t.complianceRate !== null && t.complianceRate < minRate }" @click="drill(t)">
              <td>{{ t.category }}</td><td>{{ t.flowType }}</td><td>{{ t.system }}</td><td class="num">{{ t.doneCount }}</td><td class="num">{{ fmtDays(t.avgDays) }}</td><td class="num">{{ t.limitDays ?? '-' }}</td><td class="num">{{ fmtRate(t.complianceRate) }}</td><td class="num">{{ t.runningCount }}</td><td class="num">{{ t.runningOverdue }}</td>
            </tr>
          </tbody>
        </table></div>
        <p class="ss-muted">{{ $t('点一行只看这一类的流程明细') }}</p>
      </section>

      <section class="fs-card">
        <header><h3>{{ $t('个人审核合规率排名') }}</h3><span class="ss-muted">{{ $t('{n} 人', { n: board.reviewerRank.length }) }}</span></header>
        <div class="ss-table-wrap fs-scroll"><table class="ss-table">
          <thead><tr><th class="num">{{ $t('排名') }}</th><th>{{ $t('姓名') }}</th><th>{{ $t('部门') }}</th><th>{{ $t('身份') }}</th><th class="num">{{ $t('审核次数') }}</th><th class="num">{{ $t('合规') }}</th><th class="num">{{ $t('合规率') }}</th><th class="num">{{ $t('平均用时') }}</th></tr></thead>
          <tbody><tr v-for="p in board.reviewerRank" :key="p.name"><td class="num">{{ p.rank }}</td><td>{{ p.name }}</td><td>{{ p.dept }}</td><td>{{ p.identity }}</td><td class="num">{{ p.count }}</td><td class="num">{{ p.compliant }}</td><td class="num">{{ fmtRate(p.rate) }}</td><td class="num">{{ fmtDays(p.avgDays) }}</td></tr></tbody>
        </table></div>
      </section>

      <section class="fs-card">
        <header><h3>{{ $t('流程明细') }}</h3><span class="ss-muted">{{ board.flowTotal > board.flows.length ? $t('共 {a} 单，这里列前 {b} 单；全部明细在「通报」第 3 步导出', { a: board.flowTotal, b: board.flows.length }) : $t('共 {a} 单', { a: board.flowTotal }) }}</span>
          <label class="ss-field inline fs-only"><input v-model="onlyAbnormal" type="checkbox" /><span>{{ $t('只看超时和逾期') }}</span></label>
        </header>
        <div class="ss-table-wrap fs-scroll tall"><table class="ss-table">
          <thead><tr><th>{{ $t('系统') }}</th><th>{{ $t('单号') }}</th><th>{{ $t('流程细类') }}</th><th>{{ $t('发起人') }}</th><th>{{ $t('部门') }}</th><th>{{ $t('状态') }}</th><th class="num">{{ $t('用时（天）') }}</th><th class="num">{{ $t('时效要求') }}</th><th class="num">{{ $t('超出（天）') }}</th><th>{{ $t('当前节点') }}</th><th>{{ $t('当前处理人') }}</th><th>{{ $t('开始') }}</th><th>{{ $t('结束') }}</th></tr></thead>
          <tbody>
            <tr v-for="f in shownFlows" :key="f.system + f.flowNo">
              <td>{{ f.system }}</td><td>{{ f.flowNo }}</td><td>{{ f.flowType }}</td><td>{{ f.initiator }}</td><td>{{ f.dept }}</td>
              <td><span class="ss-chip" :class="flowStateClass(f)">{{ flowStateLabel(f) }}</span></td>
              <td class="num">{{ fmtDays(f.days) }}</td><td class="num">{{ f.limitDays ?? '-' }}</td><td class="num">{{ f.overdueDays ? fmtDays(f.overdueDays) : '-' }}</td>
              <td>{{ f.currentNode }}</td><td>{{ f.currentHandler }}</td><td>{{ fmtTime(f.startAt) }}</td><td>{{ fmtTime(f.endAt) }}</td>
            </tr>
          </tbody>
        </table></div>
      </section>
    </template>
    <p v-else-if="!error" class="ss-note"><i class="ri-loader-4-line spin"></i>{{ $t('正在加载看板…') }}</p>
  </div>
</template>

<script setup lang="ts">
/** 时效看板：最近一个周期的数字 + 各周期趋势 + 按细类的条形图 + 多维筛选 + 明细下钻。数字全部由主进程按筛选条件重算。 */
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { use as echartsUse } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { BarChart, LineChart } from 'echarts/charts';
import { GridComponent, LegendComponent, MarkLineComponent, TooltipComponent } from 'echarts/components';
import VChart from 'vue-echarts';
import type { FsBoardView, FsPeriodKind, FsTypeStat } from '@totalclaw/ipc-contracts';
import { t as i18nT } from '../../i18n';
import { errorMessage, flowStateClass, flowStateLabel, fmtDays, fmtRate, fmtTime, fs, fsState, kindLabel } from './shared';

echartsUse([CanvasRenderer, BarChart, LineChart, GridComponent, TooltipComponent, LegendComponent, MarkLineComponent]);

const KINDS: FsPeriodKind[] = ['weekly', 'monthly'];
const board = ref<FsBoardView | null>(null);
const loading = ref(false);
const error = ref('');
const filters = reactive({ snapshotId: '', system: '', category: '', flowType: '', dept: '' });
const trendKind = ref<FsPeriodKind>('weekly');
const onlyAbnormal = ref(false);
const snapshots = computed(() => fsState.value?.snapshots ?? []);
const minRate = computed(() => fsState.value?.thresholds.minComplianceRate ?? 0.95);
const filtered = computed(() => !!(filters.system || filters.category || filters.flowType || filters.dept));

let seq = 0;
/** 上一次按哪组筛选条件取的数；条件没变就不重复取 */
let lastKey = '';
const keyOf = (): string => JSON.stringify(filters);
async function load(): Promise<void> {
  const mine = ++seq;
  lastKey = keyOf();
  loading.value = true;
  try {
    const r = await fs<FsBoardView>('board.get', filters);
    if (mine !== seq) return;
    board.value = r; error.value = '';
    if (r.snapshot && filters.snapshotId !== r.snapshot.id) { filters.snapshotId = r.snapshot.id; trendKind.value = r.snapshot.kind; lastKey = keyOf(); }
    // 换了大类之后原来选的细类可能不在了：清掉，筛选条件变了会再取一次
    if (filters.flowType && !r.options.flowTypes.includes(filters.flowType)) filters.flowType = '';
  } catch (e) {
    if (mine === seq) error.value = errorMessage(e);
  } finally {
    if (mine === seq) loading.value = false;
  }
}
watch(filters, () => { if (keyOf() !== lastKey) void load(); });
// 「通报」页新算了一个周期，或删了一个：回到最新的
watch(() => `${snapshots.value[0]?.id}|${snapshots.value.length}|${snapshots.value.map((x) => x.savedAt).join()}`, () => { filters.snapshotId = ''; void load(); });
onMounted(load);

function clearFilters(): void { Object.assign(filters, { system: '', category: '', flowType: '', dept: '' }); }
function drill(t: FsTypeStat): void { Object.assign(filters, { system: t.system, category: t.category, flowType: t.flowType }); }
async function removeSnapshot(): Promise<void> {
  const s = board.value?.snapshot;
  if (!s || !window.confirm(i18nT('删除「{p0}」这个周期的快照？趋势里也不再有它。', { p0: s.label }))) return;
  try { await fs('snapshot.remove', { id: s.id }); } catch (e) { error.value = errorMessage(e); }
}

const shownFlows = computed(() => (board.value?.flows ?? []).filter((f) => !onlyAbnormal.value || f.overtime === true || f.runningLabel === 'overdue'));
const trendPoints = computed(() => (board.value?.trend ?? []).filter((p) => p.kind === trendKind.value).slice(-16));
const typeBars = computed(() => [...(board.value?.byType ?? [])].filter((t) => t.doneCount > 0 && t.complianceRate !== null).sort((a, b) => b.doneCount - a.doneCount).slice(0, 12).reverse());

function cssVar(name: string, fallback: string): string {
  try { return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback; } catch { return fallback; }
}
const palette = computed(() => ({ brand: cssVar('--color-brand', '#3b6cf6'), warn: cssVar('--color-warning', '#f59e0b'), bad: cssVar('--color-danger', '#e5484d'), axis: cssVar('--color-text-secondary', '#8a8fa3'), grid: cssVar('--color-border', '#e6e8ef') }));

const trendOption = computed(() => {
  const p = palette.value;
  const pts = trendPoints.value;
  return {
    tooltip: { trigger: 'axis' },
    legend: { data: [i18nT('合规率（%）'), i18nT('平均用时（天）')], textStyle: { color: p.axis }, top: 0 },
    grid: { left: 44, right: 44, top: 34, bottom: 28 },
    xAxis: { type: 'category', data: pts.map((x) => x.label), axisLabel: { color: p.axis, fontSize: 10, hideOverlap: true }, axisLine: { lineStyle: { color: p.grid } } },
    yAxis: [
      { type: 'value', max: 100, min: (v: { min: number }) => Math.max(0, Math.floor((v.min - 5) / 5) * 5), axisLabel: { color: p.axis, formatter: '{value}%' }, splitLine: { lineStyle: { color: p.grid } } },
      { type: 'value', axisLabel: { color: p.axis }, splitLine: { show: false } },
    ],
    series: [
      { name: i18nT('合规率（%）'), type: 'line', data: pts.map((x) => (x.complianceRate == null ? null : Math.round(x.complianceRate * 1000) / 10)), itemStyle: { color: p.brand }, lineStyle: { color: p.brand }, connectNulls: true,
        markLine: { silent: true, symbol: 'none', lineStyle: { color: p.bad, type: 'dashed' }, label: { formatter: fmtRate(minRate.value), color: p.bad }, data: [{ yAxis: Math.round(minRate.value * 1000) / 10 }] } },
      { name: i18nT('平均用时（天）'), type: 'line', yAxisIndex: 1, data: pts.map((x) => x.avgDays), itemStyle: { color: p.warn }, lineStyle: { color: p.warn }, connectNulls: true },
    ],
  };
});
const typeOption = computed(() => {
  const p = palette.value;
  const list = typeBars.value;
  return {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: 8, right: 52, top: 8, bottom: 8, containLabel: true },
    xAxis: { type: 'value', max: 100, axisLabel: { color: p.axis, formatter: '{value}%' }, splitLine: { lineStyle: { color: p.grid } } },
    yAxis: { type: 'category', data: list.map((t) => (t.flowType.length > 14 ? `${t.flowType.slice(0, 13)}…` : t.flowType)), axisLabel: { color: p.axis, fontSize: 11 }, axisLine: { lineStyle: { color: p.grid } } },
    series: [{
      type: 'bar', barMaxWidth: 16,
      data: list.map((t) => ({ value: Math.round((t.complianceRate as number) * 1000) / 10, itemStyle: { color: (t.complianceRate as number) < minRate.value ? p.bad : p.brand, borderRadius: 3 } })),
      label: { show: true, position: 'right', formatter: '{c}%', color: p.axis, fontSize: 11 },
      markLine: { silent: true, symbol: 'none', lineStyle: { color: p.warn, type: 'dashed' }, label: { show: false }, data: [{ xAxis: Math.round(minRate.value * 1000) / 10 }] },
    }],
  };
});
</script>

<style scoped>
.fs-board { display: grid; gap: 14px; }
.fs-filters select { max-width: 260px; }
.fs-charts { display: grid; gap: 14px; grid-template-columns: repeat(auto-fit, minmax(min(100%, 480px), 1fr)); }
.fs-card { border: 1px solid var(--color-border); border-radius: 14px; background: var(--color-bg-card); padding: 14px; display: grid; gap: 10px; min-width: 0; align-content: start; }
.fs-card header { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
.fs-card h3 { margin: 0; font-size: 14px; }
.fs-only { margin-inline-start: auto; }
.fs-only input { height: auto; }
.fs-chart { height: 300px; width: 100%; }
.fs-scroll { max-height: 340px; overflow: auto; }
.fs-scroll.tall { max-height: 520px; }
.fs-click { cursor: pointer; }
.fs-click:hover td { background: var(--color-bg-hover); }
.fs-seg { display: inline-flex; border: 1px solid var(--color-border); border-radius: 8px; overflow: hidden; margin-inline-start: auto; }
.fs-seg button { height: 26px; padding: 0 12px; border: none; background: var(--color-bg-card); color: var(--color-text-secondary); font: inherit; font-size: 12px; font-weight: 700; cursor: pointer; }
.fs-seg button.on { background: var(--color-brand); color: #fff; }
strong.bad { color: var(--color-danger); }
.spin { animation: fs-spin 1s linear infinite; }
@keyframes fs-spin { to { transform: rotate(360deg); } }
</style>
