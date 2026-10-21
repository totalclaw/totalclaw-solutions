<template>
  <VChart class="fau-tr-chart" :option="option" autoresize data-test="fau-cash-chart" />
</template>

<script setup lang="ts">
/** 13 周现金预测三情景期末余额折线图；方向随界面语言（阿语从右往左），数字走 FauNum 同一套格式 */
import { computed } from 'vue';
import { use as echartsUse } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { LineChart } from 'echarts/charts';
import { GridComponent, LegendComponent, MarkLineComponent, TooltipComponent } from 'echarts/components';
import VChart from 'vue-echarts';
import type { FauCashForecast } from '@totalclaw/ipc-contracts';
import { SCENARIO_LABEL } from '../../../../../shared/financeAudit/treasuryLabels';
import { t as i18nT } from '../../../../i18n';
import { currentLocale } from '../../../../composables/useLocale';
import { fmtCents } from '../../shared';
import { cashChartOption } from './chart';

echartsUse([CanvasRenderer, LineChart, GridComponent, LegendComponent, TooltipComponent, MarkLineComponent]);

const props = defineProps<{ forecast: FauCashForecast }>();
const option = computed(() => cashChartOption({
  weeks: props.forecast.scenarios[1].weeks.map((w) => `W${w.week}`),
  series: props.forecast.scenarios.map((s) => ({ name: i18nT(SCENARIO_LABEL[s.id]), data: s.weeks.map((w) => w.closing / 100) })),
  rtl: currentLocale() === 'ar',
  fmt: (v) => fmtCents(Math.round(v * 100)),
  zeroLabel: '0',
}));
</script>

<style scoped>
.fau-tr-chart { height: 280px; width: 100%; }
</style>
