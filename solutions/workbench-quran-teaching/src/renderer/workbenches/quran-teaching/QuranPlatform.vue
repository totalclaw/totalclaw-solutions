<template>
  <!-- 页面方向跟界面语言（<html dir>）；阿语经文 / 阿语内容块各自带 rtl，避免「英文界面 + 阿语内容」时整页镜像 -->
  <div class="qt-workbench" :class="{ 'reduced-motion': reducedMotion }">
    <header class="qt-hero">
      <div class="qt-hero__pattern" aria-hidden="true"></div>
      <div class="qt-hero__glow" aria-hidden="true"></div>
      <div class="qt-hero__copy">
        <p class="qt-hero__eyebrow"><i class="ri-graduation-cap-line"></i>{{ $t('教育 · 展示型演示 · 人工智能驱动的教学闭环') }}</p>
        <h1>{{ $t('人工智能《古兰经》智能教学平台') }}</h1>
        <p class="qt-hero__sub">{{ $t('标准经文语料（10 章 265 节，逐文件校验、原文冻结）进入平台后：识别章节结构 → 生成提纲与课程 → 理解图 → 不同版本的练习与考试 → 5 名学生的个人与共同薄弱点 → 强化教学与复测 → 图片、脚本与视频样例。让 AI 不仅知道教什么、考什么，还能根据学生学不会的地方，告诉教师下一步该怎么教。') }}</p>
        <div class="qt-hero__layers">
          <span class="qt-layer l1"><i class="ri-lock-line"></i>{{ $t('第一层 · 经文源数据 · 冻结只读') }}</span>
          <span class="qt-layer l2"><i class="ri-shield-check-line"></i>{{ $t('第二层 · 批准的教学资料 · 有来源与审核状态') }}</span>
          <span class="qt-layer l3"><i class="ri-sparkling-2-line"></i>{{ $t('第三层 · AI 生成材料 · 教师可接受 / 编辑 / 重新生成') }}</span>
        </div>
      </div>
      <div class="qt-hero__actions">
        <div class="qt-seg" :title="$t('生成内容的语言（界面语言在设置里切换）')"><button v-for="l in LANGS" :key="l" type="button" class="qt-seg__btn" :class="{ active: state.lang === l }" @click="setLang(l)">{{ LANG_LABEL[l] }}</button></div>
        <!--
          验收 13 要的是「核心学生展示页面支持 RTL」。整页版面方向跟的是**界面语言**
          （useLocale 设 <html dir>），这里这个只切「生成内容的语言」——两者不是一回事。
          演示阿语版面前要先去设置里把界面语言切成阿语，所以在这儿直说，别让演示人现场发懵。
        -->
        <span v-if="state.lang === 'ar' && !uiIsArabic" class="qt-chip warn" :title="$t('页面整体从右向左的版面跟随界面语言，不跟随这里的内容语言')"><i class="ri-information-line"></i>{{ $t('内容已是阿语；整页 RTL 版面需在设置里把界面语言也切为阿语') }}</span>
        <div class="qt-tags" style="justify-content:flex-end">
          <span class="qt-chip" :class="state.status?.llmReady ? 'ok' : 'warn'"><i class="ri-cpu-line"></i>{{ state.status?.llmReady ? $t('AI 大脑就绪') : $t('AI 大脑未就绪（用模板骨架）') }}</span>
        </div>
        <!-- fal 服务配置：来源（本地 / 服务端下发 / 未配置）+ 就地填 key、测连通 -->
        <FalServiceConfig solution-id="workbench-quran-teaching" @status="onFalStatus" />
      </div>
    </header>

    <!-- 没有任何 fal key 时的顶部提示；语音 / 背景图照常能出，只是走本地兜底 -->
    <FalServiceConfig solution-id="workbench-quran-teaching" variant="banner" :fallback-hint="$t('未配置时语音用本机引擎（标注备用）、图片卡用模板背景，其余步骤不受影响。')" @status="onFalStatus" />

    <div class="qt-topbar">
      <div class="qt-entries">
        <button type="button" :class="{ active: entry === 'teacher' }" @click="entry = 'teacher'"><i class="ri-user-star-line"></i>{{ $t('教师端') }}</button>
        <button type="button" :class="{ active: entry === 'student' }" @click="entry = 'student'"><i class="ri-user-smile-line"></i>{{ $t('学生端') }}</button>
        <button type="button" :class="{ active: entry === 'manager' }" @click="entry = 'manager'"><i class="ri-dashboard-3-line"></i>{{ $t('管理层') }}</button>
      </div>
      <span class="qt-muted">{{ $t('当前范围') }}: <b>{{ chapterName(state.selection.chapter) }}</b> · <bdi dir="ltr">{{ state.selection.chapter }}:{{ rangeLabel(state.selection) }}</bdi></span>
      <span class="grow"></span>
      <button type="button" class="qt-btn sm ghost danger" @click="resetDemo"><i class="ri-delete-bin-6-line"></i>{{ $t('清空演示数据') }}</button>
    </div>

    <p v-if="!state.ready" class="qt-note info"><i class="ri-loader-4-line qt-spin"></i>{{ $t('正在导入并校验标准经文语料包…') }}</p>
    <p v-else-if="!state.corpus?.allVerified" class="qt-note bad"><i class="ri-error-warning-line"></i>{{ $t('语料包校验未通过，系统拒绝导入：{p}', { p: (state.corpus?.problems || []).join(' · ') || $t('未找到语料目录') }) }}</p>

    <TeacherFlow v-if="entry === 'teacher'" />
    <StudentPortal v-else-if="entry === 'student'" />
    <ManagerDashboard v-else />
  </div>
</template>

<script setup lang="ts">
import { i18n } from '../../i18n';
/**
 * 人工智能《古兰经》智能教学平台 · 展示型演示（说明书 V2.1）。
 *
 * 作为「AI 学习中心」里的一个方向挂载，功能与独立页时完全一致：
 * 三入口（教师端九步主线 / 学生端 / 管理层看板），内容语言中英阿三选，阿语整页 RTL。
 * 「返回解决方案」按钮不在这里——外层页面已经有一个，两个叠着是多余的。
 */
import { onMounted, ref , computed} from 'vue';
import FalServiceConfig from '../../components/FalServiceConfig.vue';
import type { FalServiceStatus } from '../../components/falServiceStatus';
import TeacherFlow from './TeacherFlow.vue';
import StudentPortal from './StudentPortal.vue';
import ManagerDashboard from './ManagerDashboard.vue';
import { LANGS, LANG_LABEL, type Lang, api, chapterName, currentScript, prefersReducedMotion, rangeLabel, refreshStatus, resetTeacherSteps, restoreTeacherContent, state, syncContentLang } from './shared';
import './styles.css';

const reducedMotion = prefersReducedMotion();
const entry = ref<'teacher' | 'student' | 'manager'>('teacher');
/** 与主进程 status.falReady 同一个解析（本方案 id）：来源不是 none 即可用。只改这一项，不重拉整份状态 */
function onFalStatus(s: FalServiceStatus): void {
  if (s.loaded && state.status) state.status.falReady = s.source !== 'none';
}

onMounted(async () => {
  try { await refreshStatus(); } catch { state.ready = true; return; }
  // 刷新后教师端九步的状态从本机存档恢复：把结构 / 理解图 / 答题分析取回来，数据已不在的步骤回到待做
  await restoreTeacherContent();
  // 存档可能是别的语言生成的（例如先在中文界面做过、再切到英文界面进来）：按当前内容语言取缓存或补生成
  void syncContentLang();
});
function setLang(l: Lang): void {
  if (state.lang === l) return;
  state.lang = l;
  // 解析结果是三语对象无需重取；计划 / 试卷 / 分析 / 强化 / 脚本按语言取缓存，没有就补生成（见 syncContentLang）
  void syncContentLang();
}
async function resetDemo(): Promise<void> {
  state.status = await api().reset();
  state.papers = []; state.records = []; state.analysis = null; state.plan = null; state.graph = null; state.reinforcement = null; state.cards = []; state.scripts = []; state.videos = []; state.activePaperId = '';
  currentScript.value = null;
  resetTeacherSteps();
  await refreshStatus();
}
// 整页 RTL 版面跟的是**界面语言**（useLocale 设 <html dir>），不是这里的内容语言
const uiIsArabic = computed(() => String((i18n.global.locale as any)?.value ?? i18n.global.locale).startsWith('ar'));
</script>
