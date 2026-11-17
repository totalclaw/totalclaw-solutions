<template>
  <div class="mm-ob" data-test="mm-objection-panel">
    <p v-if="error" class="ss-note danger"><i class="ri-error-warning-line"></i>{{ error }}</p>

    <template v-if="o">
      <h4 class="mm-ob__title">
        {{ $t('当前分歧：{t}', { t: OBJECTION_TARGET_LABEL[o.target] }) }}
        <span class="ss-chip">{{ o.kind === 'change' ? $t('执行中申请变更') : $t('接收时提出异议') }}</span>
      </h4>
      <div class="mm-ob__sides">
        <article class="mm-ob__side raiser" data-test="mm-ob-raiser">
          <header>
            <i class="av" :style="{ background: avatarOf(raiserName).color }" aria-hidden="true">{{ avatarOf(raiserName).text }}</i>
            <b>{{ raiserName }}</b><small>{{ $t('部门负责人') }}</small>
          </header>
          <p>{{ o.reason }}</p>
          <p v-if="o.suggestion || o.suggestedDue" class="strong">
            {{ o.suggestion }}<template v-if="o.suggestedDue">{{ o.suggestion ? $t('，') : '' }}{{ $t('建议截止调整为 {d}', { d: fmtDue(o.suggestedDue) }) }}</template>
          </p>
          <time>{{ fmtMdHm(o.raisedAt) }}</time>
        </article>
        <article class="mm-ob__side owner" data-test="mm-ob-owner">
          <header>
            <i class="av" :style="{ background: avatarOf(task.ownerName).color }" aria-hidden="true">{{ avatarOf(task.ownerName).text }}</i>
            <b>{{ task.ownerName }}</b><small>{{ reviewState }}</small>
          </header>
          <p v-if="o.review" class="strong">{{ o.review.note || '—' }}</p>
          <p v-else class="muted">{{ $t('还没有复核意见') }}</p>
          <time v-if="o.review">{{ fmtMdHm(o.review.at) }}</time>
        </article>
      </div>

      <!-- 任务负责人复核 -->
      <section v-if="can.review" class="mm-ob__box" data-test="mm-ob-review">
        <h5>{{ $t('你的复核') }}</h5>
        <p class="sub">{{ $t('采纳后任务回到待接收，由部门负责人重新确认；驳回后由部门负责人决定接受驳回还是提交裁决') }}</p>
        <div class="mm-ob__btns">
          <button type="button" class="ss-btn" :disabled="busy" data-test="mm-ob-reject" @click="startMode('review_reject')">{{ $t('驳回并说明') }}</button>
          <button type="button" class="ss-btn primary" :disabled="busy" data-test="mm-ob-adopt" @click="startMode('review_adopt')">{{ $t('采纳并调整') }}</button>
        </div>
        <button type="button" class="ss-link more" :disabled="busy" data-test="mm-ob-delete-review" @click="removeTask('review')">{{ $t('更多：删除该任务') }} <i class="ri-arrow-right-s-line"></i></button>
      </section>

      <!-- 部门负责人回应驳回 -->
      <section v-if="can.reply || can.escalate" class="mm-ob__box" data-test="mm-ob-reply">
        <h5>{{ $t('任务负责人驳回了你的异议') }}</h5>
        <p class="sub">{{ $t('接受驳回则回到发起前的状态按原方案执行；不接受可以提交项目负责人裁决') }}</p>
        <div class="mm-ob__btns">
          <button v-if="can.reply" type="button" class="ss-btn" :disabled="busy" data-test="mm-ob-accept-reject" @click="reply('accept')">{{ $t('接受驳回') }}</button>
          <button v-if="can.escalate" type="button" class="ss-btn primary" :disabled="busy" data-test="mm-ob-escalate" @click="reply('escalate')">{{ $t('提交裁决') }}</button>
        </div>
      </section>

      <!-- 项目负责人裁决 -->
      <section v-if="can.arbitrate" class="mm-ob__box" data-test="mm-ob-arbitrate">
        <h5>{{ $t('你的裁决（最终结果）') }}</h5>
        <p class="sub">{{ $t('裁决后通知任务负责人和部门负责人，记入总结报告') }}</p>
        <div class="mm-ob__btns">
          <button type="button" class="ss-btn" :disabled="busy" data-test="mm-ob-keep" @click="startMode('arb_keep')">{{ $t('维持原方案') }}</button>
          <button type="button" class="ss-btn primary" :disabled="busy" data-test="mm-ob-adjust" @click="startMode('arb_adjust')">{{ $t('按异议调整') }}</button>
        </div>
        <button type="button" class="ss-link more" :disabled="busy" data-test="mm-ob-delete-arbitrate" @click="removeTask('arbitrate')">{{ $t('更多：删除该任务') }} <i class="ri-arrow-right-s-line"></i></button>
      </section>

      <p v-if="!anyAction" class="ss-note info"><i class="ri-time-line"></i>{{ waitingText }}</p>

      <!-- 复核 / 裁决的说明与调整内容 -->
      <section v-if="mode" class="mm-ob__form" data-test="mm-ob-form">
        <h5>{{ MODE_TITLE[mode] }}</h5>
        <template v-if="mode === 'review_adopt' || mode === 'arb_adjust'">
          <p class="ss-muted">{{ $t('按异议改好任务内容；没改的项保持原样。') }}</p>
          <label class="ss-field"><span>{{ $t('任务标题') }}</span><input v-model="changes.title" type="text" data-test="mm-ob-title" /></label>
          <label class="ss-field"><span>{{ $t('交付标准') }}</span><textarea v-model="changes.standard" rows="2"></textarea></label>
          <label class="ss-field"><span>{{ $t('截止日期') }}</span><input v-model="changes.due" type="date" data-test="mm-ob-due" /></label>
        </template>
        <label class="ss-field">
          <span>{{ mode === 'review_reject' ? $t('驳回理由') : $t('说明（可选）') }}</span>
          <textarea v-model="note" rows="3" :placeholder="mode === 'review_reject' ? $t('写明为什么维持原方案，部门负责人会看到') : ''" data-test="mm-ob-note"></textarea>
        </label>
        <div class="ss-actions">
          <button type="button" class="ss-btn primary sm" :disabled="busy || (mode === 'review_reject' && !note.trim())" data-test="mm-ob-submit" @click="submit"><i :class="busy ? 'ri-loader-4-line spin' : 'ri-check-line'"></i>{{ $t('确认') }}</button>
          <button type="button" class="ss-link" @click="mode = ''">{{ $t('取消') }}</button>
        </div>
      </section>
    </template>
    <p v-else class="ss-empty">{{ $t('当前没有处理中的异议') }}</p>

    <section v-if="history.length" class="mm-ob__hist">
      <h4>{{ $t('以往的异议') }}</h4>
      <ul>
        <li v-for="h in history" :key="h.id">
          <span class="ss-chip">{{ h.kind === 'change' ? $t('变更申请') : $t('异议') }} · {{ OBJECTION_TARGET_LABEL[h.target] }}</span>
          <span>{{ h.reason }}</span>
          <span class="ss-chip" :class="h.outcome === 'adopted' || h.outcome === 'adjusted' ? 'ok' : h.outcome === 'cancelled' ? 'bad' : ''">{{ outcomeLabel(h.outcome) }}</span>
          <time>{{ fmtMdHm(h.resolvedAt || h.raisedAt) }}</time>
        </li>
      </ul>
    </section>

    <section class="mm-ob__log">
      <h4>{{ $t('变更记录') }}</h4>
      <p v-if="!log.length" class="ss-muted">{{ $t('没有变更记录') }}</p>
      <ol v-else class="mm-tl" data-test="mm-ob-log">
        <li v-for="(ev, i) in log" :key="i">
          <i class="mm-tl__dot" aria-hidden="true"></i>
          <div>
            <p><b>{{ nameOf(names, ev.by, ev.by) }}</b> {{ eventText(ev) }}<template v-if="ev.note">{{ $t('：') }}{{ ev.note }}</template></p>
            <time>{{ fmtMdHm(ev.at) }}</time>
          </div>
        </li>
      </ol>
    </section>
  </div>
</template>

<script setup lang="ts">
/**
 * 「异议与变更」页签（原型 03 右侧）：当前分歧（双方意见卡）→ 按身份与阶段给操作：
 * 任务负责人复核（采纳并调整 / 驳回并说明）、部门负责人回应（接受驳回 / 提交裁决）、
 * 项目负责人裁决（维持原方案 / 按异议调整，更多：删除该任务）；下方是变更记录时间线。
 */
import { computed, reactive, ref, watch } from 'vue';
import type { MmTaskView } from '../../../shared/meetingMgmt/types';
import { t as i18nT } from '../../i18n';
import { useDialog } from '../../composables/useDialog';
import { useNotificationStore } from '../../stores/notification';
import { OBJECTION_TARGET_LABEL, avatarOf, errorMessage, fmtDue, mm } from './shared';
import {
  buildChanges, changeLog, eventText, fmtMdHm, hasOpenObjection, initialChanges, nameOf, outcomeLabel,
  type NameMap, type TaskCan,
} from './pagesLogic';

const props = defineProps<{ task: MmTaskView; can: TaskCan; names: NameMap }>();
const emit = defineEmits<{ (e: 'changed'): void }>();

type Mode = '' | 'review_adopt' | 'review_reject' | 'arb_keep' | 'arb_adjust';
const MODE_TITLE: Record<Exclude<Mode, ''>, string> = {
  review_adopt: i18nT('采纳并调整'),
  review_reject: i18nT('驳回并说明'),
  arb_keep: i18nT('维持原方案'),
  arb_adjust: i18nT('按异议调整'),
};

const dialog = useDialog();
const notif = useNotificationStore();
const busy = ref(false);
const error = ref('');
const mode = ref<Mode>('');
const note = ref('');
const changes = reactive({ title: '', standard: '', due: '' });

const o = computed(() => (hasOpenObjection(props.task) ? props.task.objection! : null));
const raiserName = computed(() => nameOf(props.names, o.value?.raisedBy, props.task.assigneeName));
const reviewState = computed(() => {
  const r = o.value?.review;
  if (!r) return i18nT('待复核');
  return r.decision === 'adopt' ? i18nT('已采纳') : i18nT('已驳回');
});
const anyAction = computed(() => !!(props.can.review || props.can.reply || props.can.escalate || props.can.arbitrate));
const waitingText = computed(() => {
  const st = o.value?.stage;
  if (st === 'review') return i18nT('等待任务负责人 {name} 复核', { name: props.task.ownerName });
  if (st === 'dept_reply') return i18nT('任务负责人已驳回，等待部门负责人 {name} 接受驳回或提交裁决', { name: raiserName.value });
  if (st === 'arbitration') return i18nT('已提交裁决，等待项目负责人裁决');
  return '';
});
const history = computed(() => [...(props.task.objectionHistory ?? [])].sort((a, b) => (b.resolvedAt || b.raisedAt) - (a.resolvedAt || a.raisedAt)));
const log = computed(() => changeLog(props.task.events));

// 换了任务 / 阶段变了就收起表单
watch(() => [props.task.id, o.value?.stage], () => { mode.value = ''; error.value = ''; });

function startMode(m: Exclude<Mode, ''>): void {
  Object.assign(changes, initialChanges(props.task));
  note.value = '';
  mode.value = m;
}

async function run(action: string, payload: Record<string, unknown>, okText: string): Promise<boolean> {
  busy.value = true;
  error.value = '';
  try {
    await mm(action, payload);
    notif.success(okText);
    mode.value = '';
    emit('changed');
    return true;
  } catch (e) {
    error.value = errorMessage(e);
    return false;
  } finally {
    busy.value = false;
  }
}

async function submit(): Promise<void> {
  const id = props.task.id;
  const n = note.value.trim();
  const ch = buildChanges(changes, props.task);
  switch (mode.value) {
    case 'review_adopt':
      await run('task.objection.review', { id, decision: 'adopt', note: n, changes: ch }, i18nT('已采纳，任务回到待接收，等待部门负责人重新确认'));
      break;
    case 'review_reject':
      await run('task.objection.review', { id, decision: 'reject', note: n }, i18nT('已驳回，等待部门负责人回应'));
      break;
    case 'arb_keep':
      await run('task.objection.arbitrate', { id, decision: 'keep', note: n }, i18nT('已裁决：维持原方案'));
      break;
    case 'arb_adjust':
      await run('task.objection.arbitrate', { id, decision: 'adjust', note: n, changes: ch }, i18nT('已裁决：按异议调整'));
      break;
    default:
  }
}

async function reply(decision: 'accept' | 'escalate'): Promise<void> {
  const ok = await dialog.confirm(decision === 'accept'
    ? { title: i18nT('接受驳回'), message: i18nT('接受后异议结束，任务回到发起前的状态，按原方案执行。') }
    : { title: i18nT('提交裁决'), message: i18nT('提交后由项目负责人裁决，裁决结果为最终结果。') });
  if (!ok) return;
  await run('task.objection.reply', { id: props.task.id, decision }, decision === 'accept' ? i18nT('已接受驳回') : i18nT('已提交项目负责人裁决'));
}

async function removeTask(by: 'review' | 'arbitrate'): Promise<void> {
  const reason = await dialog.prompt({
    title: i18nT('删除该任务'),
    message: i18nT('删除后任务变为「已取消」（终态，结项时视同完成），并通知相关负责人。请写明原因：'),
    placeholder: i18nT('例如：该事项已并入其它任务'),
    confirmLabel: i18nT('删除任务'),
  });
  if (reason === null) return;
  const n = reason.trim() || i18nT('删除该任务');
  if (by === 'review') await run('task.objection.review', { id: props.task.id, decision: 'adopt', note: n, changes: { cancel: true } }, i18nT('任务已删除'));
  else await run('task.objection.arbitrate', { id: props.task.id, decision: 'adjust', note: n, changes: { cancel: true } }, i18nT('任务已删除'));
}
</script>

<style scoped>
.mm-ob { display: grid; gap: 16px; }
.mm-ob h4 { margin: 0; font-size: 14px; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.mm-ob__sides { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 200px), 1fr)); gap: 12px; }
.mm-ob__side { display: grid; gap: 6px; align-content: start; padding: 14px 16px; border-radius: var(--radius-5); border: 1px solid var(--color-border); font-size: 13px; line-height: 1.6; }
.mm-ob__side.raiser { border-color: color-mix(in srgb, var(--color-warning) 45%, var(--color-border)); background: color-mix(in srgb, var(--color-warning) 6%, var(--color-bg-card)); }
.mm-ob__side.owner { border-color: color-mix(in srgb, var(--color-brand) 30%, var(--color-border)); background: color-mix(in srgb, var(--color-brand) 4%, var(--color-bg-card)); }
.mm-ob__side header { display: flex; align-items: center; gap: 8px; }
.mm-ob__side header b { font-size: 14px; }
.mm-ob__side header small { color: var(--color-text-secondary); font-size: 12px; }
.mm-ob__side p { margin: 0; white-space: pre-wrap; }
.mm-ob__side p.strong { font-weight: 700; }
.mm-ob__side p.muted { color: var(--color-text-secondary); }
.mm-ob__side time { font-size: 12px; color: var(--color-text-muted); }
.av { width: 22px; height: 22px; border-radius: 50%; display: inline-grid; place-items: center; color: #fff; font-style: normal; font-size: 11px; font-weight: 700; flex: 0 0 22px; }
.mm-ob__box { display: grid; gap: 10px; padding: 16px 18px; border-radius: var(--radius-5); background: var(--color-bg-hover); }
.mm-ob__box h5, .mm-ob__form h5 { margin: 0; font-size: 14px; }
.mm-ob__box .sub { margin: 0; font-size: 12.5px; color: var(--color-text-secondary); }
.mm-ob__btns { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.mm-ob__btns .ss-btn { height: 40px; font-size: 13.5px; }
.mm-ob__box .more { justify-self: start; display: inline-flex; align-items: center; gap: 2px; font-size: 12.5px; }
.mm-ob__form { display: grid; gap: 10px; padding: 14px 16px; border-radius: var(--radius-5); border: 1px solid var(--color-brand); background: var(--color-bg-card); }
.mm-ob__form .ss-muted { margin: 0; }
.mm-ob__hist ul { list-style: none; margin: 8px 0 0; padding: 0; display: grid; gap: 6px; font-size: 12.5px; }
.mm-ob__hist li { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; color: var(--color-text-secondary); }
.mm-ob__hist time { font-size: 12px; color: var(--color-text-muted); }
.mm-ob__log { display: grid; gap: 10px; }
.mm-tl { list-style: none; margin: 0; padding: 0; display: grid; gap: 14px; }
.mm-tl li { display: grid; grid-template-columns: 10px minmax(0, 1fr); gap: 10px; position: relative; }
.mm-tl li:not(:last-child)::before { content: ''; position: absolute; inset-inline-start: 4px; top: 14px; bottom: -14px; width: 1px; background: var(--color-border); }
.mm-tl__dot { width: 9px; height: 9px; border-radius: 50%; background: var(--color-brand); margin-top: 5px; display: block; }
.mm-tl p { margin: 0; font-size: 13px; line-height: 1.55; }
.mm-tl time { font-size: 12px; color: var(--color-text-muted); font-variant-numeric: tabular-nums; }
.spin { animation: mm-ob-spin 1s linear infinite; }
@keyframes mm-ob-spin { to { transform: rotate(360deg); } }
@media (prefers-reduced-motion: reduce) { .spin { animation: none; } }
</style>
