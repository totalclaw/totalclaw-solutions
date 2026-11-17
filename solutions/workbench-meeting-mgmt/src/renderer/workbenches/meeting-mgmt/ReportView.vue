<template>
  <article class="mm-rv" data-test="mm-report-view">
    <header class="mm-rv__head">
      <div class="mm-rv__meta">
        <strong>{{ report.kind === 'summary' ? $t('项目总结报告') : $t('进度汇总报告') }}</strong>
        <span v-if="report.periodFrom && report.periodTo">{{ $t('统计区间 {a} ~ {b}', { a: fmtDate(report.periodFrom), b: fmtDate(report.periodTo) }) }}</span>
        <span>{{ $t('生成于 {t}', { t: fmtMs(report.generatedAt) }) }}</span>
        <span v-if="report.editedAt">{{ $t('修改于 {t}', { t: fmtMs(report.editedAt) }) }}</span>
        <span v-if="report.approvedAt" class="ok">{{ $t('{who} 于 {t} 审核通过', { who: approverName || '—', t: fmtMs(report.approvedAt) }) }}</span>
      </div>
      <ul class="mm-rv__stats" :aria-label="$t('统计（由系统计算）')">
        <li><b>{{ s.done }}/{{ s.total }}</b><small>{{ $t('已完成') }}</small></li>
        <li><b>{{ pct(s.completionRate) }}%</b><small>{{ $t('完成率') }}</small></li>
        <li><b>{{ s.onTime }}</b><small>{{ $t('按期') }}</small></li>
        <li :class="{ warn: s.late > 0 }"><b>{{ s.late }}</b><small>{{ $t('延期') }}</small></li>
        <li :class="{ bad: s.overdue > 0 }"><b>{{ s.overdue }}</b><small>{{ $t('逾期') }}</small></li>
        <li v-if="s.cancelled"><b>{{ s.cancelled }}</b><small>{{ $t('已取消') }}</small></li>
      </ul>
      <p class="mm-rv__hint"><i class="ri-calculator-line" aria-hidden="true"></i>{{ $t('报告里的数字由系统按任务数据计算，模型只写叙述') }}</p>
    </header>
    <!-- eslint-disable-next-line vue/no-v-html -- renderMarkdown 出口已净化 -->
    <div class="mm-rv__md" v-html="html"></div>
  </article>
</template>

<script setup lang="ts">
/** 一份报告（周报 / 总结）：头部统计（以 stats 为准）+ Markdown 正文 */
import { computed } from 'vue';
import type { MmReport } from '../../../shared/meetingMgmt/types';
import { renderMarkdown } from '../../utils/markdown';
import { fmtDate } from './shared';
import { fmtMs, pct } from './pagesLogic';

const props = defineProps<{ report: MmReport; approverName?: string }>();
const s = computed(() => props.report.stats ?? { total: 0, done: 0, cancelled: 0, overdue: 0, onTime: 0, late: 0, completionRate: 0 });
const html = computed(() => renderMarkdown(props.report.markdown || ''));
</script>

<style scoped>
.mm-rv { display: grid; gap: 14px; min-width: 0; }
.mm-rv__head { display: grid; gap: 10px; padding-bottom: 12px; border-bottom: 1px solid var(--color-border-subtle); }
.mm-rv__meta { display: flex; flex-wrap: wrap; gap: 4px 14px; align-items: baseline; font-size: 12.5px; color: var(--color-text-secondary); }
.mm-rv__meta strong { font-size: 15px; color: var(--color-text-primary); }
.mm-rv__meta .ok { color: var(--color-success); font-weight: 700; }
.mm-rv__stats { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; gap: 8px; }
.mm-rv__stats li { display: grid; gap: 1px; min-width: 76px; padding: 6px 12px; border-radius: var(--radius-4); background: var(--color-bg-hover); }
.mm-rv__stats b { font-size: 16px; font-variant-numeric: tabular-nums; }
.mm-rv__stats small { font-size: 11.5px; color: var(--color-text-secondary); }
.mm-rv__stats li.bad b { color: var(--color-danger); }
.mm-rv__stats li.warn b { color: var(--color-warning); }
.mm-rv__hint { margin: 0; font-size: 12px; color: var(--color-text-muted); display: flex; gap: 6px; align-items: center; }
.mm-rv__md { font-size: 13.5px; line-height: 1.75; color: var(--color-text-primary); max-width: 82ch; overflow-wrap: anywhere; }
.mm-rv__md :deep(h1) { font-size: 19px; margin: 0 0 10px; }
.mm-rv__md :deep(h2) { font-size: 16px; margin: 18px 0 8px; }
.mm-rv__md :deep(h3) { font-size: 14.5px; margin: 14px 0 6px; }
.mm-rv__md :deep(p) { margin: 0 0 10px; }
.mm-rv__md :deep(ul), .mm-rv__md :deep(ol) { margin: 0 0 10px; padding-inline-start: 22px; }
.mm-rv__md :deep(table) { border-collapse: collapse; margin: 8px 0 12px; font-size: 12.5px; }
.mm-rv__md :deep(th), .mm-rv__md :deep(td) { border: 1px solid var(--color-border); padding: 5px 9px; text-align: left; }
.mm-rv__md :deep(th) { background: var(--color-bg-hover); }
.mm-rv__md :deep(blockquote) { margin: 0 0 10px; padding: 6px 12px; border-inline-start: 3px solid var(--color-brand); background: var(--color-bg-hover); color: var(--color-text-secondary); }
.mm-rv__md :deep(code) { font-family: var(--font-mono); font-size: 12px; }
</style>
