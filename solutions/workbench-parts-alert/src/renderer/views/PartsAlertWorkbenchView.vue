<template>
  <div class="pa-workbench">
    <header class="workbench-header">
      <div class="heading">
        <PageBackButton />
        <span class="heading-icon"><i class="ri-alarm-warning-line"></i></span>
        <div>
          <p class="eyebrow">{{ $t('行业工作台') }}</p>
          <h1>{{ $t('配件预警与补库智能体') }}</h1>
          <p class="subtitle">{{ $t('投喂配件历史发货、采购提前期、采购在途和实时库存，算出每个配件是呆滞、冗余、健康、将缺货还是已缺货，给出行动计划和补库清单；你检验后生成采购订单文件，并可每天定时运算预警。') }}</p>
        </div>
      </div>
      <div class="header-actions">
        <button class="ss-btn" :disabled="loading" @click="reload"><i :class="loading ? 'ri-loader-4-line spin' : 'ri-refresh-line'"></i>{{ $t('刷新') }}</button>
      </div>
    </header>

    <section v-if="state" class="pa-bar">
      <span v-if="state.latest"><i class="ri-pulse-line"></i>{{ $t('最近运算 {a}：已缺货 {b} · 将缺货 {c} · 呆滞 {d} · 冗余 {e}', { a: state.latest.asOf, b: state.latest.summary.byState.out_of_stock, c: state.latest.summary.byState.at_risk, d: state.latest.summary.byState.stagnant, e: state.latest.summary.byState.redundant }) }}</span>
      <span v-else><i class="ri-pulse-line"></i>{{ $t('还没有运算过') }}</span>
      <span class="ss-muted">{{ state.settings.schedule.enabled ? $t('定时运算：每天 {p0}', { p0: state.settings.schedule.time }) : $t('定时运算未开启') }}</span>
      <p class="pa-bar__rule">
        <span class="no"><i class="ri-close-circle-line"></i>{{ $t('数量、日期、状态不交给模型算；不自动下采购订单') }}</span>
        <span class="yes"><i class="ri-checkbox-circle-line"></i>{{ $t('每个结论带算式，补库清单由你确认') }}</span>
      </p>
    </section>

    <nav class="pa-tabs" role="tablist">
      <button v-for="t in TABS" :key="t.key" type="button" role="tab" class="pa-tab" :class="{ active: active === t.key }" :aria-selected="active === t.key" :data-test="`pa-tab-${t.key}`" @click="select(t.key)">
        <i :class="t.icon"></i><span>{{ t.title }}</span><em v-if="t.key === 'board' && urgent" class="pa-badge">{{ urgent }}</em>
      </button>
    </nav>

    <div v-if="ready" class="pa-body">
      <RunTab v-show="active === 'run'" />
      <BoardTab v-if="active === 'board'" />
      <RulesTab v-else-if="active === 'rules'" />
      <ScheduleTab v-else-if="active === 'schedule'" />
      <div v-else-if="active === 'overview'" class="pa-ov">
        <section class="ss-panel">
          <h3>{{ $t('它替配件计划做什么') }}</h3>
          <ul class="pa-list">
            <li>{{ $t('读四类数据：配件历史发货（按月近 3 年、按年近 5 年）、采购提前期（近 1 年平均采购天数）、采购在途订单、实时库存。Excel 和 CSV 都行，列名自动认，认不准的你点选；一列一个月份的横表会自动拆开') }}</li>
            <li>{{ $t('算库存状态：按库存量、采购在途量和预计回货时间，把每个配件归到库存呆滞、库存冗余、库存健康、库存将缺货、库存已缺货之一，并给出预计断货日') }}</li>
            <li>{{ $t('拟行动计划：呆滞库存处理建议；缺货的分「有采购在途」和「无采购在途」两套管控举措；你逐条确认、修改或驳回') }}</li>
            <li>{{ $t('出补库清单：缺货计划确认后，按公式给出建议补库量，你可以改数量、供应商和期望到货日') }}</li>
            <li>{{ $t('转采购订单：你点「生成采购订单」后写出 Excel 文件，交给采购系统') }}</li>
            <li>{{ $t('定时循环：每天到点读数据文件夹里最新的表重新运算，提醒新增的缺货，可发邮件') }}</li>
          </ul>
        </section>
        <section class="ss-panel">
          <h3>{{ $t('判定规则（大白话）') }}</h3>
          <ul class="pa-list">
            <li>{{ $t('先估需求：最近 3 个月、6 个月、12 个月的月均发货按 5 : 3 : 2 加权，越近的越重要；有两年以上数据时再按去年同期的淡旺季修正') }}</li>
            <li>{{ $t('已缺货：现在库存是 0（或负数），而这个配件还有人要') }}</li>
            <li>{{ $t('将缺货：照现在的消耗速度，加上在途按时到货，仍会在「采购提前期 + 安全天数」之内断货——也就是现在不处理就来不及了') }}</li>
            <li>{{ $t('呆滞：有库存，但已经连续很多个月（默认 12 个月）没有发过货') }}</li>
            <li>{{ $t('冗余：库存够用的时间太长（默认超过 6 个月）') }}</li>
            <li>{{ $t('健康：不缺也不多') }}</li>
            <li>{{ $t('补多少：够用到「下一批货到 + 下次下单 + 安全余量」为止，减掉手上的库存和已经在路上的；有最小起订量的凑整') }}</li>
            <li>{{ $t('这些天数和月数都能在「规则」页签里改') }}</li>
          </ul>
        </section>
        <section class="ss-panel">
          <h3>{{ $t('两条红线') }}</h3>
          <ul class="pa-list">
            <li>{{ $t('数字只由公式算：库存状态、断货日、补库量、金额都是程序按规则算出来的，模型不参与计算；每个结论旁边都能展开看算式，导出的文件里也带') }}</li>
            <li>{{ $t('采购订单要人确认：行动计划要你检验，补库清单要你确认，「生成采购订单」要你点；生成的只是文件，应用不向采购系统或供应商提交任何东西') }}</li>
          </ul>
        </section>
        <section class="ss-panel">
          <h3>{{ $t('先知道这几件事') }}</h3>
          <ul class="pa-list">
            <li>{{ $t('历史发货（按月）和实时库存是必须的；没有采购提前期就全部按默认天数，没有采购在途就按没有在途算，页面上会提示') }}</li>
            <li>{{ $t('读表时跳过的行（没有配件编码、数量不是数字、合计行等）会列出原因，不会悄悄丢掉') }}</li>
            <li>{{ $t('在途订单没有预计到货日期的，按「基准日 + 采购提前期」推算到货') }}</li>
            <li>{{ $t('同一个配件在多个仓库的库存会相加后再判断') }}</li>
            <li>{{ $t('定时运算要应用开着才会跑；它只更新看板和历史，不动你正在检验的那一次结果') }}</li>
          </ul>
        </section>
      </div>
    </div>
    <p v-else-if="loadError" class="ss-note danger"><i class="ri-error-warning-line"></i>{{ loadError }}</p>
    <p v-else class="ss-note"><i class="ri-loader-4-line spin"></i>{{ $t('正在加载工作台…') }}</p>
  </div>
</template>

<script setup lang="ts">
/**
 * 解决方案 · 配件预警与补库智能体。docs/parts-alert-workbench.md
 * 页签：运算（分步向导）/ 预警看板 / 规则 / 定时运算 / 方案说明。
 */
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { t as i18nT } from '../i18n';
import PageBackButton from '../components/PageBackButton.vue';
import { useNotificationStore } from '../stores/notification';
import RunTab from '../workbenches/parts-alert/RunTab.vue';
import BoardTab from '../workbenches/parts-alert/BoardTab.vue';
import RulesTab from '../workbenches/parts-alert/RulesTab.vue';
import ScheduleTab from '../workbenches/parts-alert/ScheduleTab.vue';
import { errorMessage, onPaEvent, paState, refreshState } from '../workbenches/parts-alert/shared';
import '../workbenches/service-settlement/styles.css';

type TabKey = 'run' | 'board' | 'rules' | 'schedule' | 'overview';
const TABS: Array<{ key: TabKey; icon: string; title: string }> = [
  { key: 'run', icon: 'ri-calculator-line', title: i18nT('运算') },
  { key: 'board', icon: 'ri-dashboard-3-line', title: i18nT('预警看板') },
  { key: 'rules', icon: 'ri-equalizer-line', title: i18nT('规则') },
  { key: 'schedule', icon: 'ri-timer-line', title: i18nT('定时运算') },
  { key: 'overview', icon: 'ri-book-open-line', title: i18nT('方案说明') },
];
const TAB_KEY = 'totalclaw:parts-alert-tab:v1';
function savedTab(): TabKey {
  try { const v = localStorage.getItem(TAB_KEY); return TABS.some((t) => t.key === v) ? (v as TabKey) : 'run'; } catch { return 'run'; }
}

const notif = useNotificationStore();
const state = paState;
const active = ref<TabKey>(savedTab());
const ready = ref(false);
const loading = ref(false);
const loadError = ref('');
const urgent = computed(() => (state.value?.latest ? state.value.latest.summary.byState.out_of_stock + state.value.latest.summary.byState.at_risk : 0));

function select(k: TabKey): void {
  active.value = k;
  try { localStorage.setItem(TAB_KEY, k); } catch { /* 忽略 */ }
}
async function reload(): Promise<void> {
  loading.value = true;
  try { await refreshState(); ready.value = true; loadError.value = ''; } catch (e) { loadError.value = errorMessage(e); } finally { loading.value = false; }
}

let timer: ReturnType<typeof setTimeout> | null = null;
let off: (() => void) | null = null;
onMounted(() => {
  void reload();
  off = onPaEvent((ev) => {
    // 定时运算跑完：页面开着就直接提示结果（成功 / 失败都说）
    if (ev?.type === 'schedule' && ev.payload?.message) {
      const text = i18nT('定时运算：{p0}', { p0: String(ev.payload.message) });
      if (ev.payload.ok) notif.info(text, 8000); else notif.error(text, 8000);
    }
    if (timer) return;
    timer = setTimeout(() => { timer = null; void refreshState().catch(() => {}); }, 250);
  });
});
onBeforeUnmount(() => { off?.(); if (timer) clearTimeout(timer); });
</script>

<style scoped>
.pa-workbench { display: grid; gap: 12px; padding: 18px 22px 40px; max-width: 1440px; margin: 0 auto; width: 100%; box-sizing: border-box; flex: 1; min-height: 0; overflow-y: auto; align-content: start; }
.workbench-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
.heading { display: flex; gap: 14px; align-items: flex-start; }
.heading-icon { width: 48px; height: 48px; border-radius: 14px; display: inline-flex; align-items: center; justify-content: center; background: color-mix(in srgb, var(--color-brand) 14%, transparent); color: var(--color-brand); font-size: 24px; flex: 0 0 auto; }
.eyebrow { margin: 0; font-size: 11px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; color: var(--color-text-secondary); }
h1 { margin: 2px 0 4px; font-size: 22px; }
.subtitle { margin: 0; color: var(--color-text-secondary); font-size: 13px; line-height: 1.6; max-width: 900px; }
.header-actions { display: flex; gap: 8px; align-items: center; }
.pa-bar { display: flex; gap: 10px 16px; align-items: center; flex-wrap: wrap; padding: 8px 12px; border: 1px solid var(--color-border); border-radius: 12px; background: var(--color-bg-card); font-size: 12.5px; }
.pa-bar > span:first-child { display: inline-flex; gap: 6px; align-items: center; font-weight: 700; }
.pa-bar__rule { margin: 0 0 0 auto; display: flex; gap: 12px; flex-wrap: wrap; color: var(--color-text-secondary); }
.pa-bar__rule span { display: inline-flex; gap: 4px; align-items: center; }
.pa-bar__rule .no i { color: var(--color-danger); }
.pa-bar__rule .yes i { color: var(--color-success); }
.pa-tabs { display: flex; gap: 2px; overflow-x: auto; overflow-y: hidden; min-height: 44px; align-items: stretch; border-bottom: 1px solid var(--color-border); scrollbar-width: thin; }
.pa-tab { display: inline-flex; align-items: center; gap: 6px; padding: 8px 12px; border: none; border-bottom: 2px solid transparent; margin-bottom: -1px; background: transparent; cursor: pointer; font: inherit; font-size: 13px; font-weight: 600; color: var(--color-text-secondary); white-space: nowrap; flex: 0 0 auto; border-radius: 8px 8px 0 0; }
.pa-tab i { font-size: 16px; }
.pa-tab:hover { color: var(--color-brand); background: var(--color-bg-hover); }
.pa-tab.active { color: var(--color-brand); border-bottom-color: var(--color-brand); }
.pa-badge { font-style: normal; font-size: 10.5px; font-weight: 800; min-width: 18px; height: 18px; padding: 0 5px; border-radius: 9px; background: var(--color-danger); color: #fff; display: inline-flex; align-items: center; justify-content: center; }
.pa-body { display: grid; gap: 14px; }
.pa-ov { display: grid; gap: 14px; max-width: 1100px; }
.ss-panel { border: 1px solid var(--color-border); border-radius: 14px; background: var(--color-bg-card); padding: 16px; display: grid; gap: 10px; }
h3 { margin: 0; font-size: 15px; }
.pa-list { margin: 0; padding-inline-start: 18px; font-size: 12.5px; color: var(--color-text-secondary); display: grid; gap: 4px; line-height: 1.6; }
.spin { animation: pa-spin 1s linear infinite; }
@keyframes pa-spin { to { transform: rotate(360deg); } }
</style>
