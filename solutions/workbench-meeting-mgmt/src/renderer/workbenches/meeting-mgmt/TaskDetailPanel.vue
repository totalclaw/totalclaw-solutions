<template>
  <aside class="mm-td" :aria-label="$t('任务详情')" data-test="mm-task-detail">
    <button type="button" class="mm-td__close" :aria-label="$t('关闭')" data-test="mm-task-detail-close" @click="emit('close')"><i class="ri-close-line"></i></button>
    <p v-if="loading && !data" class="mm-td__loading"><i class="ri-loader-4-line spin"></i>{{ $t('加载中…') }}</p>
    <p v-if="error" class="ss-note danger"><i class="ri-error-warning-line"></i>{{ error }}</p>

    <template v-if="data && task">
      <header class="mm-td__head">
        <span class="mm-tag" :class="taskTone(task)" data-test="mm-task-status">{{ taskLongStatus(task) }}</span>
        <h3>{{ task.title }}</h3>
        <p class="mm-td__meta">
          <span>{{ task.deptName }} · {{ task.assigneeName }}</span>
          <i aria-hidden="true">|</i>
          <span>{{ $t('任务负责人 {name}', { name: task.ownerName }) }}</span>
          <i aria-hidden="true">|</i>
          <span :class="{ bad: task.overdue }">
            {{ $t('截止 {d}', { d: fmtDue(task.due) }) }}<template v-if="openObjection">{{ $t('（处理期间照常计时）') }}</template>
            <template v-if="task.overdue && task.overdueDays > 0"> · {{ $t('逾期 {n} 天', { n: task.overdueDays }) }}</template>
          </span>
        </p>
      </header>

      <nav class="mm-td__tabs" role="tablist">
        <button v-for="tb in TABS" :key="tb.key" type="button" role="tab" :aria-selected="tab === tb.key" :class="{ on: tab === tb.key }" :data-test="`mm-td-tab-${tb.key}`" @click="tab = tb.key">
          {{ tb.title }}<i v-if="tb.key === 'objection' && openObjection" class="mm-dot" :aria-label="$t('有处理中的异议')"></i>
        </button>
      </nav>

      <div class="mm-td__body">
        <!-- 详情 -->
        <dl v-if="tab === 'detail'" class="mm-td__dl">
          <dt>{{ $t('来源会议') }}</dt>
          <dd><button type="button" class="ss-link" @click="openLink({ kind: 'meeting', id: task.meetingId })">{{ task.meetingTitle || '—' }}</button></dd>
          <dt>{{ $t('所属项目') }}</dt>
          <dd><button type="button" class="ss-link" @click="openLink({ kind: 'project', id: task.projectId })">{{ task.projectName || '—' }}</button></dd>
          <dt>{{ $t('责任部门') }}</dt>
          <dd><PersonChip :name="task.assigneeName" :dept="task.deptName" /></dd>
          <dt>{{ $t('任务负责人') }}</dt>
          <dd><PersonChip :name="task.ownerName" /></dd>
          <dt>{{ $t('执行事项') }}</dt>
          <dd class="pre">{{ task.title }}</dd>
          <dt>{{ $t('交付标准') }}</dt>
          <dd class="pre">{{ task.standard || '—' }}</dd>
          <dt>{{ $t('完成时间') }}</dt>
          <dd :class="{ bad: task.overdue }">{{ task.due || '—' }}<template v-if="task.overdue && task.overdueDays > 0">{{ $t('（逾期 {n} 天）', { n: task.overdueDays }) }}</template></dd>
          <dt>{{ $t('当前进度') }}</dt>
          <dd class="mm-td__prog"><i class="mm-bar" :class="{ bad: task.overdue }"><b :style="{ width: `${pct(task.percent)}%` }"></b></i><em>{{ pct(task.percent) }}%</em></dd>
          <dt>{{ $t('下发时间') }}</dt>
          <dd>{{ fmtMs(task.createdAt) }}</dd>
          <template v-if="task.acceptedAt"><dt>{{ $t('接收时间') }}</dt><dd>{{ fmtMs(task.acceptedAt) }}</dd></template>
          <template v-if="task.doneAt"><dt>{{ $t('完成于') }}</dt><dd>{{ fmtMs(task.doneAt) }}</dd></template>
        </dl>

        <!-- 进度记录 -->
        <div v-else-if="tab === 'progress'" class="mm-td__log">
          <p v-if="!progressLog.length" class="ss-empty">{{ $t('还没有进度记录') }}</p>
          <ol v-else class="mm-tl">
            <li v-for="(p, i) in progressLog" :key="i">
              <i class="mm-tl__dot" aria-hidden="true"></i>
              <div>
                <p><b>{{ nameOf(data.names, p.by, p.by) }}</b> {{ $t('更新进度到 {n}%', { n: pct(p.percent) }) }} · <span class="mm-tag sm" :class="statusTone(p.status)">{{ TASK_STATUS_LABEL[p.status] }}</span></p>
                <p v-if="p.note" class="mm-tl__note">{{ p.note }}</p>
                <time>{{ fmtMdHm(p.at) }}</time>
              </div>
            </li>
          </ol>
        </div>

        <!-- 异议与变更 -->
        <ObjectionPanel v-else :task="task" :can="data.can" :names="data.names" @changed="afterAction" />

        <!-- 动作表单 -->
        <section v-if="form === 'progress'" class="mm-td__form" data-test="mm-form-progress">
          <h4>{{ $t('更新进度') }}</h4>
          <label class="mm-td__range">
            <span>{{ $t('完成百分比') }}</span>
            <input v-model.number="progressForm.percent" type="range" min="0" max="100" step="5" />
            <input v-model.number="progressForm.percent" type="number" min="0" max="100" class="num" data-test="mm-progress-percent" />
            <em>%</em>
          </label>
          <p class="mm-td__status">
            <span>{{ $t('状态') }}</span>
            <span class="mm-tag brand">{{ TASK_STATUS_LABEL.in_progress }}</span>
            <small>{{ task.status === 'not_started' ? $t('第一次更新进度后，任务从「未开始」变为「进行中」；做完了用「标记完成」') : $t('做完了用「标记完成」') }}</small>
          </p>
          <label class="ss-field"><span>{{ $t('说明') }}</span><textarea v-model="progressForm.note" rows="3" :placeholder="$t('这周做了什么、遇到什么问题')" data-test="mm-progress-note"></textarea></label>
          <div class="ss-actions">
            <button type="button" class="ss-btn primary sm" :disabled="busy" data-test="mm-progress-submit" @click="submitProgress"><i :class="busy ? 'ri-loader-4-line spin' : 'ri-check-line'"></i>{{ $t('提交进度') }}</button>
            <button type="button" class="ss-link" @click="form = ''">{{ $t('取消') }}</button>
          </div>
        </section>

        <section v-if="form === 'complete'" class="mm-td__form" data-test="mm-form-complete">
          <h4>{{ $t('标记完成') }}</h4>
          <p class="ss-muted">{{ $t('标记后通知任务负责人 {name}；完成后不能再改进度。', { name: task.ownerName }) }}</p>
          <label class="ss-field"><span>{{ $t('完成说明（可选）') }}</span><textarea v-model="completeNote" rows="3" :placeholder="$t('交付物放在哪里、和交付标准的对照')"></textarea></label>
          <div class="ss-actions">
            <button type="button" class="ss-btn primary sm" :disabled="busy" data-test="mm-complete-submit" @click="submitComplete"><i :class="busy ? 'ri-loader-4-line spin' : 'ri-check-double-line'"></i>{{ $t('确认完成') }}</button>
            <button type="button" class="ss-link" @click="form = ''">{{ $t('取消') }}</button>
          </div>
        </section>

        <section v-if="form === 'raise'" class="mm-td__form" data-test="mm-form-raise">
          <h4>{{ raiseTitle }}</h4>
          <p class="ss-muted">{{ $t('提交后由任务负责人 {name} 复核；处理期间任务照常计时，原截止日有效。', { name: task.ownerName }) }}</p>
          <div class="mm-td__radios" role="radiogroup" :aria-label="$t('分歧点')">
            <label v-for="(label, key) in OBJECTION_TARGET_LABEL" :key="key" :class="{ on: raiseForm.target === key }">
              <input v-model="raiseForm.target" type="radio" :value="key" />{{ label }}
            </label>
          </div>
          <label class="ss-field"><span>{{ $t('原因') }}</span><textarea v-model="raiseForm.reason" rows="3" :placeholder="$t('为什么按原方案做不了')" data-test="mm-raise-reason"></textarea></label>
          <label class="ss-field"><span>{{ $t('建议') }}</span><textarea v-model="raiseForm.suggestion" rows="2" :placeholder="$t('你建议怎么调整')" data-test="mm-raise-suggestion"></textarea></label>
          <label v-if="raiseForm.target === 'time'" class="ss-field"><span>{{ $t('建议的新截止日') }}</span><input v-model="raiseForm.suggestedDue" type="date" :min="todayIso()" data-test="mm-raise-due" /></label>
          <div class="ss-actions">
            <button type="button" class="ss-btn primary sm" :disabled="busy || !raiseForm.reason.trim() || !raiseForm.suggestion.trim()" data-test="mm-raise-submit" @click="submitRaise"><i :class="busy ? 'ri-loader-4-line spin' : 'ri-send-plane-line'"></i>{{ $t('提交') }}</button>
            <button type="button" class="ss-link" @click="form = ''">{{ $t('取消') }}</button>
          </div>
        </section>
      </div>

      <footer v-if="hasFooter && !form" class="mm-td__foot">
        <button v-if="can.accept" type="button" class="ss-btn primary" :disabled="busy" data-test="mm-task-accept" @click="accept"><i class="ri-checkbox-circle-line"></i>{{ $t('接收任务') }}</button>
        <button v-if="can.object" type="button" class="ss-btn" :disabled="busy" data-test="mm-task-object" @click="openForm('raise')"><i class="ri-question-answer-line"></i>{{ $t('提出异议') }}</button>
        <button v-if="can.progress" type="button" class="ss-btn primary" :disabled="busy" data-test="mm-task-progress" @click="openForm('progress')"><i class="ri-line-chart-line"></i>{{ $t('更新进度') }}</button>
        <button v-if="can.complete" type="button" class="ss-btn" :disabled="busy" data-test="mm-task-complete" @click="openForm('complete')"><i class="ri-check-double-line"></i>{{ $t('标记完成') }}</button>
        <button v-if="can.change" type="button" class="ss-btn ghost" :disabled="busy" data-test="mm-task-change" @click="openForm('raise')"><i class="ri-edit-2-line"></i>{{ $t('申请变更') }}</button>
      </footer>
    </template>
  </aside>
</template>

<script setup lang="ts">
/**
 * 任务详情抽屉（原型 03 右侧）：状态、标题、部门 · 部门负责人 | 任务负责人 | 截止；
 * 页签 详情 / 进度记录 / 异议与变更。按钮只按 task.get 返回的 can 显示，权限在主进程校验。
 */
import { computed, reactive, ref, watch } from 'vue';
import type { MmObjection, MmTaskStatus, MmTaskView } from '../../../shared/meetingMgmt/types';
import { t as i18nT } from '../../i18n';
import { useNotificationStore } from '../../stores/notification';
import ObjectionPanel from './ObjectionPanel.vue';
import PersonChip from './PersonChip.vue';
import { OBJECTION_TARGET_LABEL, TASK_STATUS_LABEL, errorMessage, fmtDue, mm, mmBoot, openLink } from './shared';
import {
  defaultDrawerTab, fmtMdHm, fmtMs, hasOpenObjection, nameOf, pct, taskLongStatus, taskRole, taskTone, todayIso,
  type NameMap, type TaskCan,
} from './pagesLogic';

const props = withDefaults(defineProps<{ taskId: string; refreshSeq?: number }>(), { refreshSeq: 0 });
const emit = defineEmits<{ (e: 'close'): void; (e: 'changed'): void; (e: 'role', label: string): void }>();

interface TaskGet {
  task: MmTaskView;
  names: NameMap;
  can: TaskCan;
  /** 主进程额外带的所属项目（项目负责人用于判断身份角色） */
  project?: { id: string; name: string; status: string; ownerId: string };
}
type TabKey = 'detail' | 'progress' | 'objection';
const TABS: Array<{ key: TabKey; title: string }> = [
  { key: 'detail', title: i18nT('详情') },
  { key: 'progress', title: i18nT('进度记录') },
  { key: 'objection', title: i18nT('异议与变更') },
];

const notif = useNotificationStore();
const data = ref<TaskGet | null>(null);
const loading = ref(false);
const busy = ref(false);
const error = ref('');
const tab = ref<TabKey>('detail');
const form = ref<'' | 'progress' | 'complete' | 'raise'>('');
// 状态由主进程按规则推进（更新进度 → 进行中），界面只展示，固定传 in_progress
const progressForm = reactive({ percent: 0, note: '' });
const completeNote = ref('');
const raiseForm = reactive({ target: 'time' as MmObjection['target'], reason: '', suggestion: '', suggestedDue: '' });

const task = computed(() => data.value?.task ?? null);
const can = computed<TaskCan>(() => data.value?.can ?? {});
const openObjection = computed(() => !!task.value && hasOpenObjection(task.value));
const hasFooter = computed(() => !!(can.value.accept || can.value.object || can.value.progress || can.value.complete || can.value.change));
const progressLog = computed(() => [...(task.value?.progressLog ?? [])].sort((a, b) => b.at - a.at));
const raiseTitle = computed(() => (can.value.object ? i18nT('提出异议') : i18nT('申请变更')));

const statusTone = (s: MmTaskStatus) => (s === 'done' ? 'ok' : s === 'in_progress' ? 'brand' : s === 'to_accept' ? 'warn' : '');

async function load(resetTab: boolean): Promise<void> {
  if (!props.taskId) return;
  loading.value = true;
  error.value = '';
  try {
    const r = await mm<TaskGet>('task.get', { id: props.taskId });
    data.value = r;
    emit('role', taskRole(r.task, mmBoot.value?.me.person?.id, r.project?.ownerId, r.can));
    if (resetTab) {
      tab.value = defaultDrawerTab(r.task, r.can);
      form.value = '';
    }
  } catch (e) {
    error.value = errorMessage(e);
    if (resetTab) data.value = null;
  } finally {
    loading.value = false;
  }
}

watch(() => props.taskId, () => { void load(true); }, { immediate: true });
watch(() => props.refreshSeq, () => { void load(false); });

function openForm(kind: 'progress' | 'complete' | 'raise'): void {
  const t = task.value;
  if (!t) return;
  if (kind === 'progress') Object.assign(progressForm, { percent: pct(t.percent), note: '' });
  if (kind === 'complete') completeNote.value = '';
  if (kind === 'raise') Object.assign(raiseForm, { target: 'time', reason: '', suggestion: '', suggestedDue: '' });
  form.value = kind;
}

async function run(action: string, payload: Record<string, unknown>, okText: string): Promise<void> {
  busy.value = true;
  error.value = '';
  try {
    await mm(action, payload);
    notif.success(okText);
    form.value = '';
    await afterAction();
  } catch (e) {
    error.value = errorMessage(e);
  } finally {
    busy.value = false;
  }
}

async function afterAction(): Promise<void> {
  await load(false);
  emit('changed');
}

function accept(): Promise<void> {
  return run('task.accept', { id: props.taskId }, i18nT('已接收任务'));
}
function submitProgress(): Promise<void> {
  const percent = Math.max(0, Math.min(100, Math.round(Number(progressForm.percent) || 0)));
  return run('task.progress', { id: props.taskId, percent, note: progressForm.note.trim(), status: 'in_progress' }, i18nT('进度已更新'));
}
function submitComplete(): Promise<void> {
  return run('task.complete', { id: props.taskId, note: completeNote.value.trim() || undefined }, i18nT('已标记完成，已通知任务负责人'));
}
function submitRaise(): Promise<void> {
  const payload: Record<string, unknown> = {
    id: props.taskId, target: raiseForm.target, reason: raiseForm.reason.trim(), suggestion: raiseForm.suggestion.trim(),
  };
  if (raiseForm.target === 'time' && raiseForm.suggestedDue) payload.suggestedDue = raiseForm.suggestedDue;
  return run('task.objection.raise', payload, i18nT('已提交，等待任务负责人复核')).then(() => { if (!error.value) tab.value = 'objection'; });
}
</script>

<style scoped>
.mm-td { position: relative; display: flex; flex-direction: column; min-width: 0; min-height: 100%; border-inline-start: 1px solid var(--color-border); background: var(--color-bg-card); }
.mm-td__close { position: absolute; top: 14px; inset-inline-end: 14px; width: 30px; height: 30px; border-radius: var(--radius-3); border: none; background: transparent; color: var(--color-text-secondary); cursor: pointer; font-size: 18px; display: grid; place-items: center; }
.mm-td__close:hover { background: var(--color-bg-hover); color: var(--color-text-primary); }
.mm-td__loading { margin: 0; padding: 24px; color: var(--color-text-secondary); display: flex; gap: 6px; align-items: center; }
.mm-td__head { padding: 20px 52px 0 24px; display: grid; gap: 8px; justify-items: start; }
.mm-td__head h3 { margin: 0; font-size: 19px; font-weight: 700; line-height: 1.35; text-wrap: balance; }
.mm-td__meta { margin: 0; display: flex; flex-wrap: wrap; gap: 4px 8px; align-items: center; font-size: 12.5px; color: var(--color-text-secondary); }
.mm-td__meta i { font-style: normal; color: var(--color-border); }
.mm-td__meta .bad, .mm-td__dl .bad { color: var(--color-danger); }
.mm-td__tabs { display: flex; gap: 22px; padding: 0 24px; margin-top: 14px; border-bottom: 1px solid var(--color-border-subtle); }
.mm-td__tabs button { position: relative; height: 40px; border: none; background: none; font: inherit; font-size: 13.5px; color: var(--color-text-secondary); cursor: pointer; padding: 0; display: inline-flex; align-items: center; gap: 5px; }
.mm-td__tabs button.on { color: var(--color-text-primary); font-weight: 700; }
.mm-td__tabs button.on::after { content: ''; position: absolute; inset-inline: 0; bottom: -1px; height: 2px; border-radius: 1px; background: var(--color-brand); }
.mm-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--color-danger); display: inline-block; }
.mm-td__body { flex: 1; padding: 16px 24px 20px; display: grid; gap: 16px; align-content: start; }
.mm-td__dl { margin: 0; display: grid; grid-template-columns: 88px minmax(0, 1fr); gap: 10px 14px; font-size: 13px; }
.mm-td__dl dt { color: var(--color-text-secondary); }
.mm-td__dl dd { margin: 0; min-width: 0; line-height: 1.55; }
.mm-td__dl dd.pre { white-space: pre-wrap; }
.mm-td__prog { display: flex; align-items: center; gap: 10px; }
.mm-td__prog em { font-style: normal; color: var(--color-text-secondary); font-variant-numeric: tabular-nums; }
.mm-bar { flex: 1; max-width: 200px; height: 6px; border-radius: 3px; background: var(--color-bg-hover); overflow: hidden; display: block; }
.mm-bar b { display: block; height: 100%; border-radius: 3px; background: var(--color-brand); }
.mm-bar.bad b { background: var(--color-danger); }
.mm-tl { list-style: none; margin: 0; padding: 0; display: grid; gap: 14px; }
.mm-tl li { display: grid; grid-template-columns: 10px minmax(0, 1fr); gap: 10px; position: relative; }
.mm-tl li:not(:last-child)::before { content: ''; position: absolute; inset-inline-start: 4px; top: 14px; bottom: -14px; width: 1px; background: var(--color-border); }
.mm-tl__dot { width: 9px; height: 9px; border-radius: 50%; background: var(--color-brand); margin-top: 5px; display: block; }
.mm-tl p { margin: 0; font-size: 13px; line-height: 1.55; }
.mm-tl__note { color: var(--color-text-secondary); white-space: pre-wrap; }
.mm-tl time { font-size: 12px; color: var(--color-text-muted); font-variant-numeric: tabular-nums; }
.mm-td__form { display: grid; gap: 10px; padding: 14px; border-radius: var(--radius-5); background: var(--color-bg-hover); }
.mm-td__form h4 { margin: 0; font-size: 14px; }
.mm-td__form .ss-muted { margin: 0; }
.mm-td__range { display: flex; align-items: center; gap: 10px; font-size: 12.5px; color: var(--color-text-secondary); }
.mm-td__range input[type="range"] { flex: 1; accent-color: var(--color-brand); }
.mm-td__range input.num { width: 64px; height: 30px; border-radius: var(--radius-3); border: 1px solid var(--color-border); background: var(--color-bg-input); color: var(--color-text-primary); font: inherit; text-align: right; padding: 0 8px; }
.mm-td__range em { font-style: normal; }
.mm-td__status { margin: 0; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; font-size: 12.5px; color: var(--color-text-secondary); }
.mm-td__status small { font-size: 12px; }
.mm-td__radios { display: flex; gap: 8px; flex-wrap: wrap; }
.mm-td__radios label { display: inline-flex; align-items: center; gap: 6px; padding: 5px 12px; border-radius: var(--radius-pill); border: 1px solid var(--color-border); background: var(--color-bg-card); font-size: 12.5px; cursor: pointer; }
.mm-td__radios label.on { border-color: var(--color-brand); color: var(--color-brand); background: var(--color-brand-subtle); font-weight: 700; }
.mm-td__radios input { position: absolute; opacity: 0; pointer-events: none; }
.mm-td__radios label:focus-within { outline: 2px solid var(--color-brand); outline-offset: 2px; }
.mm-td__foot { position: sticky; bottom: 0; display: flex; flex-wrap: wrap; gap: 8px; padding: 12px 24px; border-top: 1px solid var(--color-border-subtle); background: var(--color-bg-card); }
.mm-tag { display: inline-flex; align-items: center; padding: 2px 9px; border-radius: var(--radius-2); font-size: 12px; font-weight: 700; white-space: nowrap; background: var(--color-bg-hover); color: var(--color-text-secondary); }
.mm-tag.sm { padding: 0 6px; font-size: 11.5px; }
.mm-tag.bad { background: color-mix(in srgb, var(--color-danger) 12%, transparent); color: var(--color-danger); }
.mm-tag.warn { background: color-mix(in srgb, var(--color-warning) 16%, transparent); color: var(--color-warning); }
.mm-tag.brand { background: color-mix(in srgb, var(--color-brand) 12%, transparent); color: var(--color-brand); }
.mm-tag.ok { background: color-mix(in srgb, var(--color-success) 14%, transparent); color: var(--color-success); }
.spin { animation: mm-td-spin 1s linear infinite; }
@keyframes mm-td-spin { to { transform: rotate(360deg); } }
@media (prefers-reduced-motion: reduce) { .spin { animation: none; } }
</style>
