<template>
  <div style="display:grid;gap:14px">
    <section class="qt-panel">
      <header class="qt-panel__head"><strong><i class="ri-dashboard-3-line"></i>{{ $t('管理层看板 · 课程进度与 5 名学生总体掌握') }}</strong><span class="qt-muted">{{ $t('统计由程序从答题记录实时计算；改动任一答案即刷新') }}</span><span class="grow"></span><button type="button" class="qt-btn sm" @click="load"><i class="ri-refresh-line"></i>{{ $t('刷新') }}</button></header>
      <div v-if="d" class="qt-kpis">
        <div class="qt-kpi"><div class="v"><bdi>{{ d.corpus.chapters }}</bdi> / <bdi>{{ d.corpus.verses }}</bdi></div><div class="k">{{ $t('章 / 节（{s}）', { s: d.corpus.verified ? $t('校验通过') : $t('未校验') }) }}</div></div>
        <div class="qt-kpi"><div class="v">{{ d.plans }}</div><div class="k">{{ $t('教学计划') }}</div></div>
        <div class="qt-kpi"><div class="v">{{ d.papers }}</div><div class="k">{{ $t('试卷版本') }}</div></div>
        <div class="qt-kpi"><div class="v"><bdi dir="ltr">{{ d.verifiedQuestions }} / {{ d.questions }}</bdi></div><div class="k">{{ $t('通过校验的题目') }}</div></div>
        <div class="qt-kpi"><div class="v">{{ d.commonIssues.filter((i) => i.verdict === 'common').length }}</div><div class="k">{{ $t('群体共同薄弱点') }}</div></div>
        <div class="qt-kpi"><div class="v"><bdi>{{ d.media.cards }}</bdi> / <bdi>{{ d.media.videos }}</bdi></div><div class="k">{{ $t('卡片 / 视频') }}</div></div>
      </div>
    </section>
    <div v-if="d" class="qt-cols">
      <section class="qt-panel">
        <header class="qt-panel__head"><strong><i class="ri-group-line"></i>{{ $t('5 名学生总体掌握 · 强项 / 弱项') }}</strong></header>
        <table class="qt-table"><thead><tr><th>{{ $t('学生') }}</th><th>{{ $t('平均分') }}</th><th>{{ $t('强项') }}</th><th>{{ $t('弱项') }}</th><th>{{ $t('试卷数') }}</th></tr></thead><tbody>
          <tr v-for="s in d.students" :key="s.studentId"><td><b>{{ s.name[state.lang] }}</b></td><td><span class="qt-score" :class="pctClass(s.avg)" style="font-size:18px"><bdi dir="ltr">{{ s.papers ? `${s.avg}%` : '—' }}</bdi></span></td><td><span v-if="s.strongest" class="qt-chip ok">{{ dimLabel(s.strongest) }}</span></td><td><span v-if="s.weakest" class="qt-chip bad">{{ dimLabel(s.weakest) }}</span></td><td>{{ s.papers }}</td></tr>
        </tbody></table>
      </section>
      <section class="qt-panel">
        <header class="qt-panel__head"><strong><i class="ri-error-warning-line"></i>{{ $t('共同问题（最近一套练习）') }}</strong></header>
        <div v-if="d.commonIssues.length" style="display:grid;gap:8px"><div v-for="i in d.commonIssues" :key="i.key" class="qt-issue" :class="i.verdict"><div class="qt-ratio" :style="{ '--p': i.ratio * 100, '--c': i.verdict === 'common' ? 'var(--color-danger)' : 'var(--color-warning)' }"><b dir="ltr">{{ i.wrongCount }}/{{ i.studentCount }}</b></div><div class="qt-issue__body"><div class="qt-issue__label">{{ i.label }}</div><div class="qt-issue__note">{{ verdictLabel(i.verdict) }} · {{ classLabel(i.classification) }}</div></div><span></span></div></div>
        <p v-else class="qt-note">{{ $t('尚无共同问题（或还没有答题数据）') }}</p>
      </section>
    </div>
    <section v-if="d" class="qt-panel">
      <header class="qt-panel__head"><strong><i class="ri-line-chart-line"></i>{{ $t('强化前后改善') }}</strong></header>
      <div v-if="d.improvement.length" class="qt-compare"><div v-for="r in d.improvement" :key="r.reinforcementId" class="qt-compare__tile"><div class="qt-muted">{{ r.targetLabel }}</div><div class="big" :class="r.after !== null && r.after < r.before ? 'up' : r.after !== null && r.after > r.before ? 'down' : ''"><bdi dir="ltr">{{ r.before }} → {{ r.after === null ? '?' : r.after }}</bdi></div><div class="qt-muted">{{ $t('薄弱点错误人数 / 5') }}</div></div></div>
      <p v-else class="qt-note">{{ $t('尚未生成强化教学') }}</p>
    </section>
    <section class="qt-panel">
      <header class="qt-panel__head"><strong><i class="ri-road-map-line"></i>{{ $t('正式项目阶段路线（本次不要求完成）') }}</strong></header>
      <div class="qt-tags"><span v-for="(r, i) in roadmap" :key="i" class="qt-chip">{{ r }}</span></div>
    </section>
  </div>
</template>

<script setup lang="ts">
/** 管理层：汇总看板（课程进度 / 5 名学生总体 / 共同问题 / 前后改善）+ 正式项目路线。 */
import { computed, onMounted, ref, watch } from 'vue';
import type { QuranDashboard } from '@totalclaw/ipc-contracts';
import { t as i18nT } from '../../i18n';
import { api, classLabel, dimLabel, pctClass, state, verdictLabel } from './shared';

const d = ref<QuranDashboard | null>(null);
const roadmap = computed(() => [i18nT('完整课程 / 班级管理与教师协作'), i18nT('长期学习画像与自适应推荐'), i18nT('专业诵读与泰吉威德辅助分析'), i18nT('更完整的图片 / 动画 / 视频生成'), i18nT('学习平台 / 学生信息系统 / 单点登录对接'), i18nT('云端与本地部署双方案'), i18nT('通用教材导入与学科知识图谱'), i18nT('规模化学习分析与管理决策看板')]);
async function load(): Promise<void> { d.value = await api().dashboard({ lang: state.lang }); }
onMounted(load);
watch(() => [state.records.length, state.analysis?.group.computedAt, state.lang], () => { void load(); });
</script>
