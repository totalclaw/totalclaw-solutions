<template>
  <div v-if="stats" class="ap-dash">
    <div class="ss-kpis">
      <div class="ss-kpi accent"><small>{{ $t('试穿次数') }}</small><strong>{{ stats.tryons }}</strong></div>
      <div class="ss-kpi"><small>{{ $t('生成成功') }}</small><strong>{{ stats.done }}</strong></div>
      <div class="ss-kpi"><small>{{ $t('顾客') }}</small><strong>{{ stats.customers }}</strong></div>
      <div class="ss-kpi"><small>{{ $t('手机端占比') }}</small><strong>{{ fmtPct(stats.mobileShare, 0) }}</strong></div>
      <div class="ss-kpi"><small>{{ $t('想试实物率') }}</small><strong>{{ fmtPct(stats.wantRate, 0) }}</strong></div>
      <div class="ss-kpi"><small>{{ $t('到店率') }}</small><strong>{{ fmtPct(stats.visitRate, 0) }}</strong></div>
      <div class="ss-kpi"><small>{{ $t('成交率') }}</small><strong>{{ fmtPct(stats.closeRate, 0) }}</strong></div>
    </div>

    <section class="ss-panel">
      <header class="ap-head"><strong>{{ $t('转化漏斗') }}</strong><span class="ss-muted">{{ $t('生成成功 → 想试实物 → 到店试穿 → 成交') }}</span></header>
      <div class="ap-funnel">
        <div v-for="f in funnel" :key="f.label" class="ap-funnel__row">
          <span>{{ f.label }}</span>
          <div class="ap-funnel__bar"><i :style="{ width: `${f.pct}%` }"></i></div>
          <b>{{ f.value }}</b>
        </div>
      </div>
    </section>

    <section class="ss-panel">
      <header class="ap-head"><strong>{{ $t('近 14 天') }}</strong><span class="ss-muted"><i class="ap-dot a"></i>{{ $t('试穿') }} <i class="ap-dot b"></i>{{ $t('成交') }}</span></header>
      <div class="ap-days">
        <div v-for="d in stats.byDay" :key="d.day" class="ap-days__col" :title="`${d.day}：${$t('试穿')} ${d.tryons} / ${$t('成交')} ${d.purchased}`">
          <div class="ap-days__bars"><i class="a" :style="{ height: `${(d.tryons / dayMax) * 100}%` }"></i><i class="b" :style="{ height: `${(d.purchased / dayMax) * 100}%` }"></i></div>
          <small>{{ d.day.slice(5) }}</small>
        </div>
      </div>
    </section>

    <section class="ss-panel">
      <header class="ap-head"><strong>{{ $t('款式排行') }}</strong></header>
      <p v-if="stats.lagging.length" class="ss-note warn"><i class="ri-alert-line"></i>{{ $t('试穿多、成交少：{p0}。建议检查价格、尺码是否齐全、实物与图片是否一致。', { p0: stats.lagging.map(nameOf).join('、') }) }}</p>
      <div class="ss-table-wrap">
        <table class="ss-table">
          <thead><tr><th>{{ $t('款式') }}</th><th class="num">{{ $t('试穿') }}</th><th class="num">{{ $t('成功') }}</th><th class="num">{{ $t('想试实物') }}</th><th class="num">{{ $t('到店') }}</th><th class="num">{{ $t('成交') }}</th></tr></thead>
          <tbody>
            <tr v-for="g in stats.garments" :key="g.garmentId" :class="{ bad: stats.lagging.includes(g.garmentId) }">
              <td>{{ g.name }}</td><td class="num">{{ g.tryons }}</td><td class="num">{{ g.done }}</td><td class="num">{{ g.wantVisit }}</td><td class="num">{{ g.tried }}</td><td class="num">{{ g.purchased }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <div class="ap-dash__two">
      <section class="ss-panel">
        <header class="ap-head"><strong>{{ $t('热门造型组合 Top 10') }}</strong><span class="ss-muted">{{ $t('指导商品图拍摄与门店陈列主题') }}</span></header>
        <p v-if="!stats.combos.length" class="ss-empty">{{ $t('暂无数据') }}</p>
        <ol class="ap-rank">
          <li v-for="(c, i) in stats.combos" :key="i"><span>{{ choiceLabel({ backgroundId: c.backgroundId, poseId: c.poseId, hairId: c.hairId }) }}</span><b>{{ c.count }}</b></li>
        </ol>
      </section>
      <section class="ss-panel">
        <header class="ap-head"><strong>{{ $t('各类选项热度') }}</strong></header>
        <div v-for="blk in blocks" :key="blk.title" class="ap-mini">
          <small>{{ blk.title }}</small>
          <div class="ap-mini__chips"><span v-for="x in blk.items.slice(0, 6)" :key="x.id" class="ss-chip">{{ choiceLabel({ backgroundId: blk.kind === 'b' ? x.id : '', poseId: blk.kind === 'p' ? x.id : '', hairId: blk.kind === 'h' ? x.id : '' }) }} × {{ x.count }}</span></div>
        </div>
      </section>
    </div>
  </div>
  <p v-else class="ss-note"><i class="ri-loader-4-line spin"></i>{{ $t('正在统计…') }}</p>
</template>

<script setup lang="ts">
/** 试穿数据看板：漏斗、近 14 天、款式排行（高试穿低成交预警）、热门造型组合。 */
import { computed, onMounted, watch } from 'vue';
import { t as i18nT } from '../../i18n';
import { apState, apStats, choiceLabel, fmtPct, refreshStats } from './shared';

const stats = apStats;
onMounted(() => { void refreshStats(); });
watch(() => apState.value?.tryons, () => { void refreshStats(); });

const nameOf = (id: string) => apState.value?.garments.find((g) => g.id === id)?.name || id;
const dayMax = computed(() => Math.max(1, ...(stats.value?.byDay.map((d) => d.tryons) || [1])));
const funnel = computed(() => {
  const s = stats.value;
  if (!s) return [];
  const base = Math.max(1, s.done);
  return [
    { label: i18nT('生成成功'), value: s.done },
    { label: i18nT('想试实物'), value: s.wantVisit },
    { label: i18nT('到店试穿'), value: s.tried },
    { label: i18nT('成交'), value: s.purchased },
  ].map((f) => ({ ...f, pct: Math.round((f.value / base) * 100) }));
});
const blocks = computed(() => [
  { title: i18nT('背景'), kind: 'b', items: stats.value?.backgrounds || [] },
  { title: i18nT('姿势'), kind: 'p', items: stats.value?.poses || [] },
  { title: i18nT('发型'), kind: 'h', items: stats.value?.hairs || [] },
]);
</script>

<style scoped>
.ap-dash { display: grid; gap: 14px; }
.ss-panel { border: 1px solid var(--color-border); border-radius: var(--radius-6); background: var(--color-bg-card); padding: 14px; display: grid; gap: 10px; }
.ap-head { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
.ap-head strong { font-size: var(--font-size-base); }
.ap-funnel { display: grid; gap: 8px; }
.ap-funnel__row { display: grid; grid-template-columns: 90px 1fr 50px; gap: 10px; align-items: center; font-size: 12.5px; }
.ap-funnel__row b { text-align: end; font-variant-numeric: tabular-nums; }
.ap-funnel__bar { height: 14px; border-radius: var(--radius-2); background: var(--color-bg-hover); overflow: hidden; }
.ap-funnel__bar i { display: block; height: 100%; background: var(--color-brand); border-radius: var(--radius-2); }
.ap-days { display: flex; gap: 6px; align-items: flex-end; height: 140px; }
.ap-days__col { flex: 1; display: grid; grid-template-rows: 1fr auto; gap: 4px; height: 100%; }
.ap-days__bars { display: flex; gap: 2px; align-items: flex-end; justify-content: center; }
.ap-days__bars i { width: 40%; max-width: 12px; border-radius: var(--radius-1) var(--radius-1) 0 0; min-height: 1px; }
.ap-days__col small { font-size: 10px; text-align: center; color: var(--color-text-secondary); }
.a { background: var(--color-brand); }
.b { background: var(--color-success); }
.ap-dot { display: inline-block; width: 8px; height: 8px; border-radius: calc(var(--radius-1) / 2); margin: 0 4px 0 10px; }
.ap-dash__two { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.ap-rank { margin: 0; padding-inline-start: 20px; display: grid; gap: 4px; font-size: 12.5px; }
.ap-rank li span { margin-inline-end: 8px; }
.ap-mini { display: grid; gap: 4px; }
.ap-mini small { font-weight: 700; color: var(--color-text-secondary); }
.ap-mini__chips { display: flex; flex-wrap: wrap; gap: 4px; }
.spin { animation: ap-spin 1s linear infinite; }
@keyframes ap-spin { to { transform: rotate(360deg); } }
@media (max-width: 900px) { .ap-dash__two { grid-template-columns: 1fr; } }
</style>
