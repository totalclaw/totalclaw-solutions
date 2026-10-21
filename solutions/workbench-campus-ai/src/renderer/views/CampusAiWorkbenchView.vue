<template>
  <div class="ca-wb">
    <header class="ca-banner">
      <PageBackButton class="ca-banner__back" />
      <div class="ca-crest" :class="{ empty: !state?.logo }">
        <img v-if="state?.logo" :src="state.logo" alt="" />
        <i v-else class="ri-government-line"></i>
      </div>
      <div class="ca-banner__text">
        <h1>{{ state?.settings.schoolName || $t('高校一体化AI智能体') }}</h1>
        <p v-if="state?.settings.profile.englishName" class="ca-banner__en">{{ state.settings.profile.englishName }}</p>
        <p v-if="state?.settings.profile.motto" class="ca-banner__motto">{{ state.settings.profile.motto }}</p>
        <p v-if="state?.settings.schoolName" class="ca-banner__product">{{ $t('高校一体化AI智能体') }}</p>
        <p v-else class="ca-banner__product">{{ $t('在「运维与设置 → 学校档案」里填写学校名称、上传校徽') }}</p>
      </div>
      <div class="ca-banner__side">
        <span class="ca-pill" :class="state?.model ? 'ok' : 'warn'"><i :class="state?.model ? 'ri-cpu-line' : 'ri-error-warning-line'"></i>{{ state?.model ? $t('大模型已配置') : $t('大模型未配置') }}</span>
        <span class="ca-pill" :class="state?.mobile.running ? 'ok' : ''"><i class="ri-smartphone-line"></i>{{ state?.mobile.running ? $t('手机端运行中') : $t('手机端未开启') }}</span>
        <button class="ca-banner__btn" :disabled="loading" @click="reload"><i :class="loading ? 'ri-loader-4-line spin' : 'ri-refresh-line'"></i>{{ $t('刷新') }}</button>
      </div>
    </header>

    <p v-if="state" class="ca-rules">
      <span><i class="ri-close-circle-line"></i>{{ $t('没依据不编；预警数字不交给模型') }}</span>
      <span><i class="ri-checkbox-circle-line"></i>{{ $t('每个回答带出处；通知和邮件由人确认') }}</span>
      <span class="ca-rules__stat">{{ $t('文档 {a} · FAQ {b} · 近 7 天问答 {c}', { a: state.stats.docs, b: state.stats.faqs, c: state.stats.qa7d }) }}</span>
    </p>

    <nav class="ca-tabs" role="tablist">
      <template v-for="(t, i) in TABS" :key="t.key">
      <span v-if="t.group && t.group !== TABS[i - 1]?.group" class="ca-tabgroup">{{ t.group }}</span>
      <button type="button" role="tab" class="ca-tab" :class="{ active: active === t.key }" :aria-selected="active === t.key" :data-test="`ca-tab-${t.key}`" @click="select(t.key)">
        <i :class="t.icon"></i><span>{{ t.title }}</span><em v-if="badge(t.key)" class="ca-badge" :class="{ bad: t.key === 'tickets' && state?.stats.sensitiveOpen }">{{ badge(t.key) }}</em>
      </button>
      </template>
    </nav>

    <div v-if="ready" class="ca-body">
      <OverviewTab v-if="active === 'overview'" @go="(k) => select(k as TabKey)" />
      <AppsTab v-else-if="active === 'apps'" @go="(k) => select(k as TabKey)" />
      <TeachTab v-else-if="active === 'teach'" />
      <ResearchTab v-else-if="active === 'research'" />
      <GovTab v-else-if="active === 'gov'" />
      <KbTab v-else-if="active === 'kb'" />
      <QaTab v-else-if="active === 'qa'" />
      <TicketsTab v-else-if="active === 'tickets'" />
      <WarningTab v-show="active === 'warning'" />
      <OpsTab v-if="active === 'ops'" />
      <div v-if="active === 'about'" class="ca-about">
        <section class="ss-panel">
          <h3>{{ $t('它为学校做什么') }}</h3>
          <ul class="ca-list">
            <li>{{ $t('统一规划、建设与运维：AI 应用中心按五个方向列出全校场景、建设阶段与责任部门；校园知识库是各场景共用的底座；模型服务状态、调用审计、数据保留统一在运维里看') }}</li>
            <li>{{ $t('师生服务：学生扫码就能问，按招生、教务、资助、就业、后勤、心理、信息化等领域分给对应助手；常见问题直接给部门审定的答案，知识库有依据的依据原文回答并列出处，没有依据的不编、转给对应部门，答复后一键沉淀为 FAQ；涉及心理危机、人身安全的立即给求助方式并置顶提醒') }}</li>
            <li>{{ $t('教学：每门课一个资料库，课程助教只依据课程资料答学生的问题；从课程资料出单选、多选、判断、简答题，每题附原文出处；作业批改客观题按答案判分、主观题按评分要点给建议分由教师确认；学业预警按成绩和考勤算三级，辅导员复核后出谈话提纲与通知') }}</li>
            <li>{{ $t('科研：成果登记表按学院、类型、年度、级别统计数量与经费；申报指南自动抽出截止时间、申报条件、材料清单与资助额度，每条附原文；申报书与论文写作进入平台已有的学术写作能力') }}</li>
            <li>{{ $t('校务治理：公文助手按要点起草通知、请示、报告、函、纪要，标出要点里没有的数字，按国标版式导出 Word；诉求热点分析从师生问答与转办里找出热点、响应慢的部门和知识库缺口，生成周报') }}</li>
          </ul>
        </section>
        <section class="ss-panel">
          <h3>{{ $t('几条红线') }}</h3>
          <ul class="ca-list">
            <li>{{ $t('回答必须有出处：能拒答的分支一律不调模型；模型回答里出现原文没有的数字（日期、金额、电话），改为直接列出原文') }}</li>
            <li>{{ $t('数字不交给模型：预警的门数、学分、缺勤率、级别都由规则算；模型写通知时用错一个数字，整份改用规则模板') }}</li>
            <li>{{ $t('学生信息不出校：数据存本机；发给模型的预警事实不含姓名、学号、班级') }}</li>
            <li>{{ $t('对外发出的由人确认：通知要辅导员复核，邮件要勾选确认才发') }}</li>
            <li>{{ $t('教学与科研同样只认原文：出题和指南解读的每一条都要带原文引文并逐字核对，对不上的直接丢掉；主观题建议分必须教师确认才算成绩') }}</li>
          </ul>
        </section>
        <section class="ss-panel">
          <h3>{{ $t('先知道这几件事') }}</h3>
          <ul class="ca-list">
            <li>{{ $t('手机端要求手机和这台电脑在同一个校园网里；应用关了服务也会停') }}</li>
            <li>{{ $t('一门课多条成绩（补考、重修）取最好的一次；缓考、未录入不计') }}</li>
            <li>{{ $t('考勤可以是汇总表（缺勤次数 + 应到次数），也可以是逐次记录（每次的状态）；请假不计缺勤') }}</li>
            <li>{{ $t('预警规则和证据下限都能调：规则在「学业预警」第 2 步，证据下限在「运维与设置」') }}</li>
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
 * 解决方案 · 高校一体化 AI 智能体。docs/campus-ai-workbench.md
 * 页签：总览 / 校园知识库（分步）/ 智能问答 / 转办问题 / 学业预警（分步）/ 运维与设置 / 方案说明。
 */
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { t as i18nT } from '../i18n';
import PageBackButton from '../components/PageBackButton.vue';
import OverviewTab from '../workbenches/campus-ai/OverviewTab.vue';
import KbTab from '../workbenches/campus-ai/KbTab.vue';
import QaTab from '../workbenches/campus-ai/QaTab.vue';
import TicketsTab from '../workbenches/campus-ai/TicketsTab.vue';
import WarningTab from '../workbenches/campus-ai/WarningTab.vue';
import OpsTab from '../workbenches/campus-ai/OpsTab.vue';
import AppsTab from '../workbenches/campus-ai/AppsTab.vue';
import TeachTab from '../workbenches/campus-ai/TeachTab.vue';
import ResearchTab from '../workbenches/campus-ai/ResearchTab.vue';
import GovTab from '../workbenches/campus-ai/GovTab.vue';
import { caProgress, caState, errorMessage, onCaEvent, refreshState } from '../workbenches/campus-ai/shared';
import '../workbenches/service-settlement/styles.css';
import '../workbenches/campus-ai/styles.css';

type TabKey = 'overview' | 'apps' | 'kb' | 'qa' | 'tickets' | 'teach' | 'warning' | 'research' | 'gov' | 'ops' | 'about';
// 按五大方向分组：师生服务 / 教学 / 科研 / 校务治理 / 统一底座与运维
const TABS: Array<{ key: TabKey; icon: string; title: string; group?: string }> = [
  { key: 'overview', icon: 'ri-dashboard-3-line', title: i18nT('总览') },
  { key: 'apps', icon: 'ri-compass-3-line', title: i18nT('AI 应用中心') },
  { key: 'qa', icon: 'ri-customer-service-2-line', title: i18nT('智能问答'), group: i18nT('服务') },
  { key: 'tickets', icon: 'ri-git-pull-request-line', title: i18nT('转办问题'), group: i18nT('服务') },
  { key: 'teach', icon: 'ri-book-shelf-line', title: i18nT('教学助手'), group: i18nT('教学') },
  { key: 'warning', icon: 'ri-graduation-cap-line', title: i18nT('学业预警'), group: i18nT('教学') },
  { key: 'research', icon: 'ri-flask-line', title: i18nT('科研'), group: i18nT('科研') },
  { key: 'gov', icon: 'ri-government-line', title: i18nT('校务治理'), group: i18nT('治理') },
  { key: 'kb', icon: 'ri-book-2-line', title: i18nT('校园知识库'), group: i18nT('底座') },
  { key: 'ops', icon: 'ri-shield-check-line', title: i18nT('运维与设置'), group: i18nT('底座') },
  { key: 'about', icon: 'ri-book-open-line', title: i18nT('方案说明') },
];
const TAB_KEY = 'totalclaw:campus-ai-tab:v1';
function savedTab(): TabKey {
  try { const v = localStorage.getItem(TAB_KEY); return TABS.some((t) => t.key === v) ? (v as TabKey) : 'overview'; } catch { return 'overview'; }
}

const state = caState;
const active = ref<TabKey>(savedTab());
const ready = ref(false);
const loading = ref(false);
const loadError = ref('');

function badge(k: TabKey): number {
  const s = state.value?.stats;
  if (!s) return 0;
  if (k === 'tickets') return s.openTickets;
  if (k === 'warning') return s.warnPending;
  return 0;
}
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
  off = onCaEvent((ev) => {
    if (ev?.type === 'progress') { caProgress.value = { message: String(ev.payload?.message || ''), scope: ev.payload?.scope, done: ev.payload?.done, total: ev.payload?.total }; return; }
    if (timer) return;
    timer = setTimeout(() => { timer = null; void refreshState().catch(() => {}); }, 250);
  });
});
onBeforeUnmount(() => { off?.(); if (timer) clearTimeout(timer); });
</script>

<style scoped>
.ca-wb { display: grid; gap: 12px; padding: 18px 22px 40px; max-width: 1440px; margin: 0 auto; width: 100%; box-sizing: border-box; flex: 1; min-height: 0; overflow-y: auto; align-content: start; }
.ca-banner { position: relative; display: flex; align-items: center; gap: 18px; padding: 18px 22px 20px; border-radius: 14px; background: var(--ca-oxblood-deep); color: var(--ca-banner-ink); flex-wrap: wrap; box-shadow: inset 0 -3px 0 var(--ca-gold); }
.ca-banner::before { content: ''; position: absolute; inset: 6px; border: 1px solid oklch(0.78 0.1 80 / 0.35); border-radius: 10px; pointer-events: none; }
.ca-banner__back.page-back, .ca-banner :deep(.page-back) { background: transparent; border: 1px solid oklch(0.78 0.1 80 / 0.55); color: var(--ca-banner-ink); align-self: flex-start; }
.ca-banner :deep(.page-back:hover) { background: oklch(0.78 0.1 80 / 0.18); color: var(--ca-banner-ink); }
.ca-crest { width: 76px; height: 76px; border-radius: 50%; flex: 0 0 auto; display: grid; place-items: center; background: oklch(0.99 0.005 80); border: 3px solid var(--ca-gold); box-shadow: 0 0 0 4px var(--ca-oxblood-deep), 0 0 0 5px oklch(0.78 0.1 80 / 0.6); overflow: hidden; }
.ca-crest img { width: 100%; height: 100%; object-fit: contain; padding: 6px; }
.ca-crest.empty { background: transparent; }
.ca-crest i { font-size: 34px; color: var(--ca-gold); }
.ca-banner__text { min-width: 0; flex: 1; display: grid; gap: 2px; }
.ca-banner h1 { margin: 0; font-family: var(--ca-serif); font-size: 26px; font-weight: 800; letter-spacing: .06em; line-height: 1.25; text-wrap: balance; color: var(--ca-banner-ink); }
.ca-banner__en { margin: 0; font-family: var(--ca-serif); font-size: 12.5px; letter-spacing: .14em; text-transform: uppercase; color: var(--ca-gold); }
.ca-banner__motto { margin: 2px 0 0; font-family: var(--ca-serif); font-style: italic; font-size: 13.5px; letter-spacing: .3em; color: oklch(0.92 0.03 80); }
.ca-banner__product { margin: 4px 0 0; font-size: 12.5px; color: oklch(0.88 0.03 40); }
.ca-banner__side { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
.ca-pill { display: inline-flex; align-items: center; gap: 5px; padding: 4px 10px; border-radius: 999px; font-size: 12px; font-weight: 600; background: oklch(1 0 0 / 0.10); color: var(--ca-banner-ink); border: 1px solid oklch(1 0 0 / 0.18); }
.ca-pill.ok i { color: oklch(0.85 0.14 150); }
.ca-pill.warn i { color: oklch(0.85 0.14 80); }
.ca-banner__btn { display: inline-flex; align-items: center; gap: 6px; height: 32px; padding: 0 14px; border-radius: 8px; border: 1px solid var(--ca-gold); background: transparent; color: var(--ca-banner-ink); font: inherit; font-size: 13px; cursor: pointer; transition: background .15s; }
.ca-banner__btn:hover { background: oklch(0.78 0.1 80 / 0.18); }
.ca-banner__btn:disabled { opacity: .6; cursor: default; }
.ca-rules { margin: 0; display: flex; gap: 8px 18px; flex-wrap: wrap; align-items: center; font-size: 12.5px; color: var(--color-text-secondary); padding: 0 4px; }
.ca-rules span { display: inline-flex; gap: 5px; align-items: center; }
.ca-rules span:first-child i { color: var(--ca-oxblood); }
.ca-rules span:nth-child(2) i { color: oklch(0.55 0.13 150); }
.ca-rules__stat { margin-inline-start: auto; }
.ca-tabs { display: flex; gap: 2px; overflow-x: auto; overflow-y: hidden; min-height: 44px; align-items: stretch; border-bottom: 1px solid var(--color-border); scrollbar-width: thin; }
.ca-tab { display: inline-flex; align-items: center; gap: 6px; padding: 8px 12px; border: none; border-bottom: 2px solid transparent; margin-bottom: -1px; background: transparent; cursor: pointer; font: inherit; font-size: 13px; font-weight: 600; color: var(--color-text-secondary); white-space: nowrap; flex: 0 0 auto; border-radius: 8px 8px 0 0; }
.ca-tab i { font-size: 16px; }
.ca-tab:hover { color: var(--color-brand); background: var(--color-bg-hover); }
.ca-tab.active { color: var(--ca-oxblood); border-bottom-color: var(--ca-gold); }
.ca-tabgroup { align-self: center; flex: 0 0 auto; margin-inline: 8px 2px; padding-inline-start: 10px; border-inline-start: 1px solid var(--color-border); font-family: var(--ca-serif); font-size: 11.5px; color: var(--ca-gold); letter-spacing: .1em; }
.ca-badge { font-style: normal; font-size: 10.5px; font-weight: 800; min-width: 18px; height: 18px; padding: 0 5px; border-radius: 9px; background: var(--color-warning); color: #fff; display: inline-flex; align-items: center; justify-content: center; }
.ca-badge.bad { background: var(--color-danger); }
.ca-body { display: grid; gap: 14px; }
.ca-about { display: grid; gap: 14px; max-width: 1100px; }
</style>
