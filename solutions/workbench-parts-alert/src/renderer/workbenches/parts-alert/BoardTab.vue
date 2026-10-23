<template>
  <div class="pa-board">
    <p v-if="!latest" class="ss-empty">{{ $t('还没有运算过。到「运算」页签投喂数据并运算，或在「定时运算」里设置自动运算，结果会汇总到这里') }}</p>
    <template v-else>
      <section class="ss-panel">
        <header class="pa-board__head">
          <h3>{{ $t('最近一次运算') }}</h3>
          <span class="ss-chip" :class="latest.source === 'schedule' ? 'brand' : ''">{{ latest.source === 'schedule' ? $t('定时运算') : $t('手动运算') }}</span>
          <span class="ss-muted">{{ $t('基准日 {a} · 运算时间 {b} · 共 {n} 个配件', { a: latest.asOf, b: fmtDateTime(latest.at), n: latest.summary.total }) }}</span>
        </header>
        <div class="ss-kpis">
          <div v-for="s in STATES" :key="s" class="ss-kpi pa-kpi" :class="stateClass(s)">
            <small>{{ stateLabel(s) }}</small><strong>{{ latest.summary.byState[s] }}</strong>
            <em v-if="total">{{ pct(latest.summary.byState[s]) }}</em>
          </div>
          <div class="ss-kpi accent"><small>{{ $t('建议补库') }}</small><strong>{{ latest.summary.replenishParts }}</strong><em>{{ $t('数量 {a} · 金额 {b}', { a: num(latest.summary.replenishQty), b: fmtMoney(latest.summary.replenishAmount) }) }}</em></div>
        </div>
        <VChart class="pa-chart" :option="distOption" autoresize />
        <p v-if="lastEntry && (lastEntry.newOut.length || lastEntry.newRisk.length)" class="ss-note warn">
          <i class="ri-alarm-warning-line"></i>{{ $t('相比上一次运算：新增已缺货 {a} 个，新增将缺货 {b} 个', { a: lastEntry.newOut.length, b: lastEntry.newRisk.length }) }}
        </p>
      </section>

      <div class="pa-board__cols">
        <section class="ss-panel">
          <h3>{{ $t('最紧急的缺货') }}</h3>
          <p class="ss-muted">{{ $t('已缺货的排最前，其余按预计断货日从早到晚') }}</p>
          <p v-if="!shortage.length" class="ss-empty">{{ $t('没有缺货或将缺货的配件') }}</p>
          <div v-else class="ss-table-wrap">
            <table class="ss-table">
              <thead><tr><th>{{ $t('配件') }}</th><th>{{ $t('状态') }}</th><th>{{ $t('断货日') }}</th><th class="num">{{ $t('库存') }}</th><th class="num">{{ $t('在途') }}</th><th>{{ $t('最早到货') }}</th><th class="num">{{ $t('建议补库') }}</th></tr></thead>
              <tbody>
                <tr v-for="r in shortage" :key="r.partNo">
                  <td><b>{{ r.partNo }}</b> <span class="ss-muted">{{ r.partName }}</span></td>
                  <td><span class="ss-chip" :class="stateClass(r.state)">{{ stateLabel(r.state) }}</span></td>
                  <td>{{ r.stockoutDate || '—' }}</td><td class="num">{{ num(r.stockQty) }}</td><td class="num">{{ r.inTransitQty ? num(r.inTransitQty) : '—' }}</td>
                  <td>{{ r.earliestEta || '—' }}</td><td class="num">{{ r.suggestQty ? num(r.suggestQty) : '—' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
        <section class="ss-panel">
          <header class="pa-board__head">
            <h3>{{ $t('占用最多的呆滞库存') }}</h3>
            <span class="grow"></span>
            <button type="button" class="ss-link" @click="byAmount = !byAmount">{{ byAmount ? $t('改按数量排') : $t('改按金额排') }}</button>
          </header>
          <p class="ss-muted">{{ byAmount ? $t('按库存金额从高到低（没有单价的排在后面）') : $t('按库存数量从高到低') }}</p>
          <p v-if="!stagnant.length" class="ss-empty">{{ $t('没有呆滞的配件') }}</p>
          <div v-else class="ss-table-wrap">
            <table class="ss-table">
              <thead><tr><th>{{ $t('配件') }}</th><th class="num">{{ $t('库存') }}</th><th class="num">{{ $t('库存金额') }}</th><th>{{ $t('最近发货') }}</th><th class="num">{{ $t('未发货月数') }}</th></tr></thead>
              <tbody>
                <tr v-for="r in stagnant" :key="r.partNo">
                  <td><b>{{ r.partNo }}</b> <span class="ss-muted">{{ r.partName }}</span></td>
                  <td class="num">{{ num(r.stockQty) }}</td><td class="num">{{ r.unitPrice === null ? '—' : fmtMoney(r.stockQty * r.unitPrice) }}</td>
                  <td>{{ r.lastShipMonth || $t('没有发货记录') }}</td><td class="num">{{ r.monthsSinceLastShip ?? '—' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <section class="ss-panel">
        <header class="pa-board__head">
          <h3>{{ $t('运算历史') }}</h3>
          <span class="ss-muted">{{ $t('共 {n} 次', { n: history.length }) }}</span>
          <span class="grow"></span>
          <button v-if="history.length" type="button" class="ss-link" @click="clearHistory">{{ $t('清空历史') }}</button>
        </header>
        <VChart v-if="history.length > 1" class="pa-chart tall" :option="trendOption" autoresize />
        <p v-else class="ss-muted">{{ $t('运算两次以上后，这里显示各状态数量的变化趋势') }}</p>
        <div class="ss-table-wrap">
          <table class="ss-table">
            <thead><tr><th>{{ $t('运算时间') }}</th><th>{{ $t('基准日') }}</th><th>{{ $t('来源') }}</th><th v-for="s in STATES" :key="s" class="num">{{ stateLabel(s) }}</th><th class="num">{{ $t('新增已缺货') }}</th><th class="num">{{ $t('新增将缺货') }}</th><th>{{ $t('文件') }}</th><th>{{ $t('说明') }}</th></tr></thead>
            <tbody>
              <tr v-for="h in history.slice(0, shownHistory)" :key="h.id">
                <td>{{ fmtDateTime(h.at) }}</td><td>{{ h.asOf }}</td><td>{{ h.source === 'schedule' ? $t('定时运算') : $t('手动运算') }}</td>
                <td v-for="s in STATES" :key="s" class="num">{{ h.byState[s] }}</td>
                <td class="num">{{ h.newOut.length }}</td><td class="num">{{ h.newRisk.length }}</td>
                <td><button v-for="f in h.files" :key="f" type="button" class="ss-link pa-file" :title="f" @click="open(f)">{{ fileName(f) }}</button></td>
                <td class="pa-note">{{ h.note }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <button v-if="history.length > shownHistory" type="button" class="ss-btn sm" @click="shownHistory += 20">{{ $t('显示更早的记录') }}</button>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
/** 预警看板：最近一次运算的状态分布、最紧急的缺货、占用最多的呆滞库存、历次运算的趋势。 */
import { computed, ref } from 'vue';
import { use as echartsUse } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { BarChart, LineChart } from 'echarts/charts';
import { GridComponent, LegendComponent, TooltipComponent } from 'echarts/components';
import VChart from 'vue-echarts';
import { PA_STATES } from '@totalclaw/ipc-contracts';
import { useNotificationStore } from '../../stores/notification';
import { STATE_COLORS, errorMessage, fmtDateTime, fmtMoney, num, openPath, pa, paLatest, paState, refreshState, stateClass, stateLabel } from './shared';

echartsUse([CanvasRenderer, BarChart, LineChart, GridComponent, LegendComponent, TooltipComponent]);

const notif = useNotificationStore();
const STATES = PA_STATES;
const TOP = 12;
const latest = computed(() => paState.value?.latest || null);
const history = computed(() => paState.value?.history || []);
const lastEntry = computed(() => history.value[0] || null);
const total = computed(() => latest.value?.summary.total || 0);
const byAmount = ref(true);
const shownHistory = ref(20);

const pct = (n: number): string => `${Math.round((n / Math.max(1, total.value)) * 1000) / 10}%`;
const fileName = (p: string): string => p.split(/[\\/]/).pop() || p;

const shortage = computed(() => paLatest.value
  .filter((r) => r.state === 'out_of_stock' || r.state === 'at_risk')
  .sort((a, b) => (a.state === b.state ? 0 : a.state === 'out_of_stock' ? -1 : 1) || (a.stockoutDate || '9999').localeCompare(b.stockoutDate || '9999') || a.partNo.localeCompare(b.partNo))
  .slice(0, TOP));

const stagnant = computed(() => {
  const amount = (r: { stockQty: number; unitPrice: number | null }): number => (r.unitPrice === null ? -1 : r.stockQty * r.unitPrice);
  return paLatest.value
    .filter((r) => r.state === 'stagnant')
    .sort((a, b) => (byAmount.value ? amount(b) - amount(a) : 0) || b.stockQty - a.stockQty || a.partNo.localeCompare(b.partNo))
    .slice(0, TOP);
});

function cssVar(name: string, fallback: string): string {
  if (typeof getComputedStyle === 'undefined' || typeof document === 'undefined') return fallback;
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
}
const axisColor = (): string => cssVar('--color-text-muted', '#8a8fa3');
const gridColor = (): string => cssVar('--color-border-subtle', '#eceef3');

/** 状态分布：一条横向条形，每种状态一根，直接标数量 */
const distOption = computed(() => {
  const by = latest.value?.summary.byState;
  const order = [...STATES].reverse();
  return {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: 86, right: 40, top: 8, bottom: 8 },
    xAxis: { type: 'value', minInterval: 1, axisLabel: { fontSize: 11, color: axisColor() }, splitLine: { lineStyle: { type: 'dashed', color: gridColor() } } },
    yAxis: { type: 'category', data: order.map(stateLabel), axisLabel: { fontSize: 12, color: axisColor() }, axisTick: { show: false }, axisLine: { show: false } },
    series: [{
      type: 'bar', barMaxWidth: 20, label: { show: true, position: 'right', fontSize: 11, color: axisColor() },
      data: order.map((s) => ({ value: by ? by[s] : 0, itemStyle: { color: STATE_COLORS[s], borderRadius: [0, 4, 4, 0] } })),
    }],
  };
});

/** 历次运算各状态数量：时间从左到右，最多取最近 30 次 */
const trendOption = computed(() => {
  const rows = [...history.value].slice(0, 30).reverse();
  const shown = STATES.filter((s) => s !== 'healthy');
  return {
    tooltip: { trigger: 'axis' },
    legend: { top: 0, right: 0, itemWidth: 10, itemHeight: 10, textStyle: { fontSize: 11, color: axisColor() } },
    grid: { left: 40, right: 16, top: 30, bottom: 24 },
    xAxis: { type: 'category', data: rows.map((h) => fmtDateTime(h.at).slice(5)), axisLabel: { fontSize: 11, color: axisColor() }, axisTick: { show: false } },
    yAxis: { type: 'value', minInterval: 1, axisLabel: { fontSize: 11, color: axisColor() }, splitLine: { lineStyle: { type: 'dashed', color: gridColor() } } },
    series: shown.map((s) => ({ name: stateLabel(s), type: 'line', data: rows.map((h) => h.byState[s]), itemStyle: { color: STATE_COLORS[s] }, lineStyle: { width: 2 }, symbolSize: 6 })),
  };
});

function open(path: string): void { void openPath(path).catch((e) => notif.error(errorMessage(e))); }
async function clearHistory(): Promise<void> {
  try { await pa('history.clear'); await refreshState(); } catch (e) { notif.error(errorMessage(e)); }
}
</script>

<style scoped>
.pa-board { display: grid; gap: 14px; }
.pa-board__cols { display: grid; gap: 14px; grid-template-columns: repeat(auto-fit, minmax(min(100%, 480px), 1fr)); align-items: start; }
.pa-board__head { display: flex; flex-wrap: wrap; align-items: center; gap: 8px 10px; }
.pa-board__head .grow { flex: 1; }
.ss-panel { border: 1px solid var(--color-border); border-radius: var(--radius-6); background: var(--color-bg-card); padding: 16px; display: grid; gap: 10px; min-width: 0; }
h3 { margin: 0; font-size: var(--font-size-lg); }
p { margin: 0; }
.pa-kpi { border-inline-start-width: 4px; }
.pa-kpi.bad { border-inline-start-color: var(--color-danger); }
.pa-kpi.warn { border-inline-start-color: var(--color-warning); }
.pa-kpi.ok { border-inline-start-color: var(--color-success); }
.pa-kpi.brand { border-inline-start-color: var(--color-brand); }
.pa-kpi.mute { border-inline-start-color: var(--color-text-secondary); }
.ss-kpi em { font-style: normal; font-size: 11.5px; color: var(--color-text-secondary); }
.pa-chart { height: 190px; width: 100%; }
.pa-chart.tall { height: 240px; }
.pa-file { display: block; max-width: 240px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; text-align: start; }
.pa-note { white-space: normal !important; min-width: 180px; max-width: 360px; color: var(--color-text-secondary); }
</style>
