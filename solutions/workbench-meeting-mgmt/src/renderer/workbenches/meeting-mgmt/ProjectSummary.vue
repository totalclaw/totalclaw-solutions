<template>
  <div class="mm-psm" data-test="mm-project-summary">
    <p v-if="error" class="ss-note danger"><i class="ri-error-warning-line"></i>{{ error }}</p>

    <template v-if="project.status === 'active'">
      <p class="ss-empty">{{ $t('项目还在进行中。项目负责人「发起结项」且检查通过后，AI 会在这里生成项目总结报告（概况、关键决策、任务按期 / 延期完成情况、变更与裁决记录），审核通过后归档。') }}</p>
    </template>

    <template v-else-if="!summary">
      <div v-if="generating || (busy && acting === 'regen')" class="mm-psm__wait" data-test="mm-summary-waiting">
        <i class="ri-loader-4-line spin" aria-hidden="true"></i>
        <div>
          <strong>{{ $t('AI 正在生成项目总结报告…') }}</strong>
          <small>{{ waitText }}</small>
        </div>
      </div>
      <div v-else class="mm-psm__wait failed" data-test="mm-summary-missing">
        <i class="ri-file-warning-line" aria-hidden="true"></i>
        <div>
          <strong>{{ $t('总结报告还没有生成') }}</strong>
          <small>{{ isOwner ? $t('上次生成可能没成功，点「重新生成」再试一次') : $t('等项目负责人重新生成') }}</small>
        </div>
        <button v-if="isOwner" type="button" class="ss-btn sm primary" :disabled="busy" data-test="mm-summary-regen-empty" @click="regenerate(false)"><i class="ri-refresh-line"></i>{{ $t('重新生成') }}</button>
      </div>
    </template>

    <template v-else>
      <p v-if="generating" class="ss-note info"><i class="ri-loader-4-line spin"></i>{{ $t('AI 正在重新生成总结报告，生成完会自动刷新') }}</p>
      <div v-if="project.status === 'closing' && can.reviewSummary" class="mm-psm__bar">
        <template v-if="!editing">
          <p class="ss-muted">{{ $t('看一遍总结，需要的话在线修改；审核通过后项目归档，全部只读，并通知项目成员。') }}</p>
          <span class="grow"></span>
          <button type="button" class="ss-btn sm" :disabled="busy || generating" data-test="mm-summary-edit" @click="startEdit"><i class="ri-edit-line"></i>{{ $t('在线修改') }}</button>
          <button type="button" class="ss-btn sm" :disabled="busy || generating" data-test="mm-summary-regen" @click="regenerate(true)"><i :class="busy && acting === 'regen' ? 'ri-loader-4-line spin' : 'ri-refresh-line'"></i>{{ $t('重新生成') }}</button>
          <button type="button" class="ss-btn sm primary" :disabled="busy || generating" data-test="mm-summary-approve" @click="approve"><i :class="busy && acting === 'approve' ? 'ri-loader-4-line spin' : 'ri-checkbox-circle-line'"></i>{{ $t('审核通过并归档') }}</button>
        </template>
        <template v-else>
          <p class="ss-muted">{{ $t('直接改 Markdown 正文；统计数字以系统计算为准，不随正文修改。') }}</p>
          <span class="grow"></span>
          <button type="button" class="ss-btn sm" :disabled="busy" @click="editing = false">{{ $t('取消') }}</button>
          <button type="button" class="ss-btn sm primary" :disabled="busy || !draft.trim()" data-test="mm-summary-save" @click="save"><i :class="busy ? 'ri-loader-4-line spin' : 'ri-save-line'"></i>{{ $t('保存修改') }}</button>
        </template>
      </div>
      <p v-else-if="project.status === 'closing'" class="ss-note info"><i class="ri-time-line"></i>{{ $t('总结报告待项目负责人审核，审核通过后项目归档。') }}</p>
      <p v-else-if="project.status === 'archived'" class="ss-note ok"><i class="ri-archive-line"></i>{{ $t('项目已归档，全部内容只读。') }}</p>

      <textarea v-if="editing" v-model="draft" class="mm-psm__editor" rows="24" :aria-label="$t('总结报告正文')" data-test="mm-summary-editor"></textarea>
      <ReportView v-else :report="summary" :approver-name="approverName" />
    </template>
  </div>
</template>

<script setup lang="ts">
/**
 * 项目详情「总结报告」页签：结项中可查看 / 在线修改 / 重新生成 / 审核通过→归档（project.summary.*）；
 * 已归档只读。总结是结项检查通过后主进程异步生成的，生成完会推 changed 事件。
 */
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import type { MmPerson, MmProject } from '../../../shared/meetingMgmt/types';
import { t as i18nT } from '../../i18n';
import { useDialog } from '../../composables/useDialog';
import { useNotificationStore } from '../../stores/notification';
import ReportView from './ReportView.vue';
import { errorMessage, mm } from './shared';

const props = withDefaults(defineProps<{
  project: MmProject;
  can: { reviewSummary?: boolean };
  members?: MmPerson[];
  /** project.get 的 summaryGenerating：总结正在后台生成 */
  generating?: boolean;
  /** 当前身份是项目负责人（总结还没生成出来时 can.reviewSummary 为 false，用它决定能不能重新生成） */
  isOwner?: boolean;
}>(), { members: () => [], generating: false, isOwner: false });
const emit = defineEmits<{ (e: 'changed'): void }>();

const dialog = useDialog();
const notif = useNotificationStore();
const busy = ref(false);
const acting = ref<'' | 'regen' | 'approve' | 'save'>('');
const error = ref('');
const editing = ref(false);
const draft = ref('');
const now = ref(Date.now());
let tick: ReturnType<typeof setInterval> | null = null;

const summary = computed(() => props.project.summary ?? null);
const approverName = computed(() => props.members?.find((m) => m.id === summary.value?.approvedBy)?.name || '');
const waitText = computed(() => {
  const from = props.project.closeCheck?.at;
  const s = from ? Math.max(0, Math.floor((now.value - from) / 1000)) : 0;
  if (!from) return i18nT('生成完会自动显示在这里');
  if (s > 300) return i18nT('已经 {m} 分钟了，比平时慢；可以点「重新生成」再试一次', { m: Math.floor(s / 60) });
  return i18nT('已用时 {s} 秒；生成完会自动显示在这里', { s });
});

watch(() => props.project.id, () => { editing.value = false; error.value = ''; });
onMounted(() => { tick = setInterval(() => { now.value = Date.now(); }, 1000); });
onBeforeUnmount(() => { if (tick) clearInterval(tick); });

async function run(kind: 'regen' | 'approve' | 'save', action: string, payload: Record<string, unknown>, okText: string): Promise<boolean> {
  busy.value = true;
  acting.value = kind;
  error.value = '';
  try {
    await mm(action, payload);
    notif.success(okText);
    emit('changed');
    return true;
  } catch (e) {
    error.value = errorMessage(e);
    return false;
  } finally {
    busy.value = false;
    acting.value = '';
  }
}

function startEdit(): void {
  draft.value = summary.value?.markdown ?? '';
  editing.value = true;
}

async function save(): Promise<void> {
  if (await run('save', 'project.summary.save', { id: props.project.id, markdown: draft.value }, i18nT('总结报告已保存'))) editing.value = false;
}

async function regenerate(confirmFirst: boolean): Promise<void> {
  if (confirmFirst && !(await dialog.confirm({
    title: i18nT('重新生成总结报告'),
    message: summary.value?.editedAt ? i18nT('重新生成会覆盖你在线修改过的内容，确定吗？') : i18nT('按当前项目数据重新生成一份总结报告？'),
    danger: !!summary.value?.editedAt,
  }))) return;
  // 主进程等生成完才返回：按钮一直转到生成结束
  await run('regen', 'project.summary.regenerate', { id: props.project.id }, i18nT('总结报告已重新生成'));
}

async function approve(): Promise<void> {
  const ok = await dialog.confirm({
    title: i18nT('审核通过并归档'),
    message: i18nT('归档后项目全部只读、不能重新激活，并通知全部项目成员。确定审核通过吗？'),
    confirmLabel: i18nT('通过并归档'),
  });
  if (!ok) return;
  await run('approve', 'project.summary.approve', { id: props.project.id }, i18nT('项目已归档'));
}
</script>

<style scoped>
.mm-psm { display: grid; gap: 12px; }
.mm-psm__bar { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; padding: 10px 12px; border-radius: var(--radius-4); background: var(--color-bg-hover); }
.mm-psm__bar .grow { flex: 1; }
.mm-psm__bar .ss-muted { margin: 0; }
.mm-psm__wait { display: flex; align-items: center; gap: 12px; padding: 16px; border-radius: var(--radius-5); border: 1px dashed var(--color-border); }
.mm-psm__wait > i { font-size: 22px; color: var(--color-brand); }
.mm-psm__wait.failed > i { color: var(--color-warning); }
.mm-psm__wait div { flex: 1; display: grid; gap: 2px; }
.mm-psm__wait small { color: var(--color-text-secondary); font-size: 12.5px; }
.mm-psm__editor { width: 100%; min-height: 420px; padding: 12px 14px; border-radius: var(--radius-4); border: 1px solid var(--color-border); background: var(--color-bg-input); color: var(--color-text-primary); font-family: var(--font-mono); font-size: 13px; line-height: 1.65; resize: vertical; box-sizing: border-box; }
.mm-psm__editor:focus { outline: none; border-color: var(--color-brand); }
.spin { animation: mm-psm-spin 1s linear infinite; }
@keyframes mm-psm-spin { to { transform: rotate(360deg); } }
@media (prefers-reduced-motion: reduce) { .spin { animation: none; } }
</style>
