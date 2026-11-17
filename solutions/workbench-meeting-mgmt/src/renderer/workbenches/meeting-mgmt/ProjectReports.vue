<template>
  <div class="mm-prp" data-test="mm-project-reports">
    <div class="mm-prp__bar">
      <p class="ss-muted">{{ canGenerate ? $t('每 {n} 天自动生成一份进度汇总报告，发给任务负责人和项目负责人；项目负责人也可以现在手动生成一份。', { n: cycleDays }) : $t('每 {n} 天自动生成一份进度汇总报告，发给任务负责人和项目负责人。', { n: cycleDays }) }}</p>
      <span class="grow"></span>
      <button v-if="props.canGenerate" type="button" class="ss-btn primary sm" :disabled="busy" data-test="mm-report-generate" @click="generate">
        <i :class="busy ? 'ri-loader-4-line spin' : 'ri-file-chart-line'"></i>{{ busy ? $t('生成中… {s} 秒', { s: elapsed }) : $t('生成一份进度报告') }}
      </button>
    </div>
    <p v-if="busy && elapsed > 60" class="ss-note warn"><i class="ri-time-line"></i>{{ $t('比平时慢，模型还在写叙述；数字已由系统算好，模型不可用时会用模板兜底。') }}</p>
    <p v-if="error" class="ss-note danger"><i class="ri-error-warning-line"></i>{{ error }}</p>

    <p v-if="!reports.length" class="ss-empty">{{ $t('还没有进度报告') }}</p>
    <div v-else class="mm-prp__split">
      <ul class="mm-prp__list" role="listbox" :aria-label="$t('进度报告列表')">
        <li v-for="r in reports" :key="r.id">
          <button type="button" role="option" :aria-selected="r.id === currentId" :class="{ on: r.id === currentId }" :data-test="`mm-report-${r.id}`" @click="currentId = r.id">
            <strong>{{ r.periodFrom && r.periodTo ? `${fmtMd(r.periodFrom)} ~ ${fmtMd(r.periodTo)}` : fmtMs(r.generatedAt) }}</strong>
            <small>{{ $t('完成率 {p}% · 逾期 {n}', { p: pct(r.stats?.completionRate), n: r.stats?.overdue ?? 0 }) }}</small>
          </button>
        </li>
      </ul>
      <ReportView v-if="current" :report="current" />
    </div>
  </div>
</template>

<script setup lang="ts">
/** 项目详情「进度报告」页签：每周汇总报告列表 + Markdown 正文，可手动生成一份（project.report.generate） */
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import type { MmProject, MmReport } from '../../../shared/meetingMgmt/types';
import { t as i18nT } from '../../i18n';
import { useNotificationStore } from '../../stores/notification';
import ReportView from './ReportView.vue';
import { errorMessage, mm, mmBoot } from './shared';
import { fmtMd, fmtMs, pct } from './pagesLogic';

const props = withDefaults(defineProps<{ project: MmProject; focusReportId?: string; canGenerate?: boolean }>(), { focusReportId: '', canGenerate: false });
const emit = defineEmits<{ (e: 'changed'): void }>();

const notif = useNotificationStore();
const busy = ref(false);
const error = ref('');
const elapsed = ref(0);
const currentId = ref('');
const extra = ref<MmReport | null>(null);
let tick: ReturnType<typeof setInterval> | null = null;

const reports = computed(() => {
  const list = [...(props.project.weeklyReports ?? [])];
  if (extra.value && !list.some((r) => r.id === extra.value!.id)) list.push(extra.value);
  return list.sort((a, b) => b.generatedAt - a.generatedAt);
});
const current = computed(() => reports.value.find((r) => r.id === currentId.value) ?? reports.value[0] ?? null);
const cycleDays = computed(() => mmBoot.value?.settings.reportCycleDays ?? 7);

watch(() => [props.project.id, props.focusReportId], () => {
  currentId.value = props.focusReportId && reports.value.some((r) => r.id === props.focusReportId) ? props.focusReportId : '';
}, { immediate: true });
watch(() => props.project.id, () => { extra.value = null; error.value = ''; });

async function generate(): Promise<void> {
  busy.value = true;
  error.value = '';
  elapsed.value = 0;
  const started = Date.now();
  tick = setInterval(() => { elapsed.value = Math.floor((Date.now() - started) / 1000); }, 1000);
  try {
    const r = await mm<MmReport>('project.report.generate', { id: props.project.id });
    if (r?.id) {
      extra.value = r;
      currentId.value = r.id;
    }
    notif.success(i18nT('进度报告已生成'));
    emit('changed');
  } catch (e) {
    error.value = errorMessage(e);
  } finally {
    busy.value = false;
    if (tick) clearInterval(tick);
    tick = null;
  }
}
onBeforeUnmount(() => { if (tick) clearInterval(tick); });
</script>

<style scoped>
.mm-prp { display: grid; gap: 12px; }
.mm-prp__bar { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.mm-prp__bar .grow { flex: 1; }
.mm-prp__bar .ss-muted { margin: 0; }
.mm-prp__split { display: grid; grid-template-columns: 200px minmax(0, 1fr); gap: 18px; align-items: start; }
.mm-prp__list { list-style: none; margin: 0; padding: 0; display: grid; gap: 6px; position: sticky; top: 8px; }
.mm-prp__list button { width: 100%; display: grid; gap: 2px; padding: 9px 12px; border: 1px solid var(--color-border); border-radius: var(--radius-4); background: var(--color-bg-card); text-align: left; cursor: pointer; font: inherit; color: var(--color-text-primary); }
.mm-prp__list button:hover { border-color: var(--color-brand); }
.mm-prp__list button.on { border-color: var(--color-brand); background: var(--color-brand-subtle); }
.mm-prp__list strong { font-size: 13px; font-variant-numeric: tabular-nums; }
.mm-prp__list small { font-size: 12px; color: var(--color-text-secondary); }
.spin { animation: mm-prp-spin 1s linear infinite; }
@keyframes mm-prp-spin { to { transform: rotate(360deg); } }
@media (max-width: 900px) { .mm-prp__split { grid-template-columns: 1fr; } .mm-prp__list { position: static; } }
</style>
