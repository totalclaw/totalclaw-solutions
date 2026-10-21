<template>
  <section class="fau-panel" data-test="fau-skill-studio">
    <h3><i class="ri-tools-line"></i>{{ $t('把本企业的制度与模板做成技能') }}</h3>
    <p class="ss-muted">{{ $t('报销制度、审批口径、底稿模板、科目使用说明……写成技能后，对话、专家团和流程里的 AI 员工遇到对应任务就按它来做。') }}</p>
    <ol class="fau-steps-list">
      <li>{{ $t('在 AutoCoder 的「Skill 开发」里新建一个技能，把制度原文、模板和示例发给 AI。') }}</li>
      <li>{{ $t('AI 按随本方案安装的 fa-skill-creator 的写法整理成技能说明与参考资料；财会口径沿用 fa-conventions、术语沿用 fa-glossary。') }}</li>
      <li>{{ $t('检查无误后装到本机；金额仍由工作台规则引擎计算，技能只负责口径与写法。') }}</li>
    </ol>
    <div class="ss-actions">
      <button v-if="!RELEASE_HIDDEN.autoCoder" type="button" class="ss-btn primary" data-test="fau-skill-new" @click="openStudio"><i class="ri-add-line"></i>{{ $t('去新建技能') }}</button>
      <button type="button" class="ss-btn" data-test="fau-skill-store" @click="router.push('/store/skills')"><i class="ri-apps-2-line"></i>{{ $t('查看已装技能') }}</button>
    </div>
    <p class="ss-note info"><i class="ri-information-line"></i>{{ $t('不想用 AutoCoder 也可以在对话里直接说：「用 fa-skill-creator 把《费用报销制度》做成技能」。') }}</p>
  </section>
</template>

<script setup lang="ts">
/** P6 企业技能自建（批次 8）：不另做一套编辑器，引导到现有的 AutoCoder「Skill 开发」，并附 fa-skill-creator 技能。 */
import { useRouter } from 'vue-router';
import { RELEASE_HIDDEN } from '../../../../../shared/releaseHidden';

const router = useRouter();

function openStudio(): void {
  // AutoCoder 按 localStorage 记住上次的页签（SolutionStudioView 的 tc.autocoder.tab）
  try { localStorage.setItem('tc.autocoder.tab', 'skill'); } catch { /* 存储不可用就落默认页签 */ }
  void router.push('/solution-studio');
}
</script>

<style scoped>
.fau-steps-list { margin: 0; padding-inline-start: 20px; display: grid; gap: 4px; }
</style>
