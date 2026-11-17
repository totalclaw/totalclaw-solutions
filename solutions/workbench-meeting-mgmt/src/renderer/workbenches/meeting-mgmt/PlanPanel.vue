<template>
  <section class="mm-plan" data-test="mm-plan">
    <p v-if="!plan" class="mm-plan__empty">{{ $t('纪要定稿后，主持人选择「生成任务」，AI 会在这里按决议事项生成执行方案和任务清单。') }}</p>
    <template v-else>
      <header class="mm-plan__head">
        <h4>{{ $t('AI 执行方案') }}</h4>
        <span class="ss-muted">{{ $t('生成于 {t}', { t: fmtMs(plan.generatedAt) }) }}</span>
        <span class="mm-grow"></span>
        <span class="ss-chip" :class="owners.length ? 'brand' : 'warn'" data-test="mm-plan-owner-chip">{{ owners.length ? $t('任务负责人：{name}', { name: ownerNames }) : $t('还没有指定任务负责人') }}</span>
        <span v-if="plan.confirmedAt" class="ss-chip ok">{{ $t('{t} 已确认', { t: fmtMs(plan.confirmedAt) }) }}</span>
      </header>

      <!-- 主持人指定任务负责人 -->
      <div v-if="canAssign" class="mm-plan__owner" data-test="mm-plan-owner">
        <i class="ri-user-star-line" aria-hidden="true"></i>
        <span>{{ m.status === 'pending_owner' ? $t('指定任务负责人（可多选）：其中任何一位都能确认方案，确认后按部门下发给各部门负责人') : $t('更换任务负责人（可多选）') }}</span>
        <PersonSearchSelect v-model:values="ownerPicks" multiple :max="10" class="mm-plan__owner-pick" :people="people" :aria-label="$t('任务负责人')" data-test="mm-plan-owner-select" />
        <button type="button" class="ss-btn sm primary" :disabled="!ownerPicks.length || samePicks || !!busy" data-test="mm-plan-owner-save" @click="assignOwner">
          <i :class="busy === 'owner' ? 'ri-loader-4-line spin' : 'ri-check-line'"></i>{{ $t('指定') }}
        </button>
      </div>
      <p v-else-if="m.status === 'pending_owner'" class="ss-note"><i class="ri-time-line"></i>{{ $t('等待主持人 {name} 指定任务负责人', { name: nameOf(m.hostId) }) }}</p>
      <p v-else-if="m.status === 'plan_confirm' && !detail.my.isPlanOwner" class="ss-note"><i class="ri-time-line"></i>{{ $t('等待任务负责人 {name} 确认方案', { name: ownerNames }) }}</p>

      <!-- 方案概述 -->
      <div class="mm-plan__summary">
        <div class="mm-plan__sumhead">
          <b>{{ $t('方案概述') }}</b>
          <button v-if="canEdit && !editSummary" type="button" class="ss-link" @click="editSummary = true">{{ $t('编辑') }}</button>
        </div>
        <textarea v-if="editSummary" v-model="summary" rows="6" class="mm-plan__textarea" @input="dirty = true"></textarea>
        <!-- eslint-disable-next-line vue/no-v-html -- renderMarkdown 已过 sanitizeHtml -->
        <div v-else-if="summary.trim()" class="mm-plan__md" v-html="renderMarkdown(summary)"></div>
        <p v-else class="ss-muted">{{ $t('（没有概述）') }}</p>
      </div>

      <!-- 任务清单 -->
      <div class="mm-plan__sumhead">
        <b>{{ $t('任务清单 · {n} 项', { n: items.length }) }}</b>
        <span class="ss-muted">{{ $t('每项一个责任部门；「下发给」默认是该部门在通讯录里的第一位负责人，可以改成任何人') }}</span>
      </div>
      <div class="ss-table-wrap">
        <table class="ss-table mm-plan__table" :class="{ edit: canEdit }">
          <colgroup>
            <col class="c-no" /><col class="c-dept" /><col /><col /><col class="c-due" /><col class="c-to" /><col v-if="canEdit" class="c-del" />
          </colgroup>
          <thead>
            <tr>
              <th>#</th><th>{{ $t('责任部门') }}</th><th>{{ $t('执行事项') }}</th><th>{{ $t('交付标准') }}</th><th>{{ $t('完成时间') }}</th><th>{{ $t('下发给') }}</th><th v-if="canEdit"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(x, i) in items" :key="x.id" :data-test="`mm-plan-item-${i}`">
              <td class="num">{{ i + 1 }}</td>
              <td>
                <select v-if="canEdit" v-model="x.deptId" @change="dirty = true">
                  <option value="">{{ $t('选择部门') }}</option>
                  <option v-for="d in people.depts" :key="d.id" :value="d.id">{{ d.name }}</option>
                </select>
                <span v-else>{{ deptName(x.deptId) }}</span>
              </td>
              <td class="wrap">
                <input v-if="canEdit" v-model="x.title" type="text" class="wide" :placeholder="$t('执行事项')" @input="dirty = true" />
                <span v-else>{{ x.title }}</span>
                <small v-if="decisionNo(x.decisionId)" class="mm-plan__from">{{ $t('来自决议 {n}', { n: decisionNo(x.decisionId) }) }}</small>
              </td>
              <td class="wrap">
                <input v-if="canEdit" v-model="x.standard" type="text" class="wide" :placeholder="$t('交付标准')" @input="dirty = true" />
                <span v-else>{{ x.standard || '-' }}</span>
              </td>
              <td>
                <input v-if="canEdit" v-model="x.due" type="date" :data-test="`mm-plan-due-${i}`" @change="dirty = true" />
                <span v-else>{{ x.due || '-' }}</span>
                <small v-if="x.due && x.due < today" class="mm-plan__warn">{{ $t('早于今天') }}</small>
              </td>
              <td class="mm-plan__to">
                <template v-if="canEdit">
                  <!-- 不选 = 部门第一负责人（显示在占位里）；部门没设负责人或要交给别人时直接选人 -->
                  <PersonSearchSelect
                    :model-value="x.assigneeId || ''"
                    :people="people"
                    :pinned="deptMembers(x.deptId)"
                    :pinned-label="$t('本部门')"
                    :placeholder="leaderOf(x.deptId) ? $t('默认：{name}', { name: leaderOf(x.deptId) }) : $t('选择下发给谁')"
                    :aria-label="$t('下发给')"
                    clearable
                    :data-test="`mm-plan-to-${i}`"
                    @update:model-value="(v: string) => setAssignee(x, v)"
                  />
                  <small v-if="x.deptId && !x.assigneeId && !leaderOf(x.deptId) && people.depts.length" class="mm-plan__warn">{{ $t('部门没有负责人，请选人') }}</small>
                </template>
                <template v-else>
                  <span v-if="assigneeName(x)">{{ assigneeName(x) }}</span>
                  <span v-else-if="x.deptId" class="mm-plan__warn" :title="$t('企微通讯录里这个部门没有设置负责人，确认后无法下发')">{{ $t('部门没有负责人') }}</span>
                  <span v-else>-</span>
                </template>
              </td>
              <td v-if="canEdit"><button type="button" class="ss-link mm-plan__del" :title="$t('删除这项任务')" @click="remove(i)"><i class="ri-delete-bin-line"></i></button></td>
            </tr>
            <tr v-if="!items.length"><td :colspan="canEdit ? 7 : 6" class="mm-plan__none">{{ $t('AI 没有从决议里拆出任务') }}</td></tr>
          </tbody>
        </table>
      </div>

      <ul v-if="canEdit && problems.length && showProblems" class="mm-plan__problems">
        <li v-for="p in problems" :key="p">{{ p }}</li>
      </ul>
      <div v-if="canEdit" class="ss-actions">
        <button type="button" class="ss-btn sm" data-test="mm-plan-add" @click="add"><i class="ri-add-line"></i>{{ $t('添加任务') }}</button>
        <span class="grow"></span>
        <button v-if="dirty" type="button" class="ss-btn sm" :disabled="!!busy" data-test="mm-plan-save" @click="save()">
          <i :class="busy === 'save' ? 'ri-loader-4-line spin' : 'ri-save-3-line'"></i>{{ $t('保存修改') }}
        </button>
        <button v-if="dirty" type="button" class="ss-link" :disabled="!!busy" @click="reset">{{ $t('放弃修改') }}</button>
        <button type="button" class="ss-btn primary" :disabled="!!busy" data-test="mm-plan-confirm" @click="confirmPlan">
          <i :class="busy === 'confirm' ? 'ri-loader-4-line spin' : 'ri-send-plane-line'"></i>{{ $t('确认方案并下发') }}
        </button>
      </div>
    </template>
    <p v-if="error" class="ss-note danger"><i class="ri-error-warning-line"></i>{{ error }}</p>
  </section>
</template>

<script setup lang="ts">
/**
 * 会议详情 · 执行方案：AI 方案概述 + 任务清单。
 * 主持人指定任务负责人（meeting.plan.owner）；任务负责人编辑 / 增删任务、设完成时间（meeting.plan.save）、确认方案（meeting.plan.confirm → 已派发）。
 */
import { computed, onMounted, ref, watch } from 'vue';
import type { MmPlanItem } from '../../../shared/meetingMgmt/types';
import { t as i18nT } from '../../i18n';
import { renderMarkdown } from '../../utils/markdown';
import { useNotificationStore } from '../../stores/notification';
import { errorMessage, mm } from './shared';
import { fmtMs, loadPeople, ymd, type MmMeetingDetail, type MmPeople } from './meetingUi';
import PersonSearchSelect from './PersonSearchSelect.vue';

const props = defineProps<{ detail: MmMeetingDetail }>();
const emit = defineEmits<{ (e: 'changed'): void }>();

const notif = useNotificationStore();
const people = ref<MmPeople>({ depts: [], people: [] });
const items = ref<MmPlanItem[]>([]);
const summary = ref('');
const dirty = ref(false);
const editSummary = ref(false);
const showProblems = ref(false);
const ownerPicks = ref<string[]>([]);
const busy = ref<'' | 'owner' | 'save' | 'confirm'>('');
const error = ref('');
const today = ymd(Date.now());

const m = computed(() => props.detail.meeting);
const plan = computed(() => m.value.plan);
const canEdit = computed(() => m.value.status === 'plan_confirm' && props.detail.my.isPlanOwner);
const canAssign = computed(() => props.detail.my.isHost && (m.value.status === 'pending_owner' || m.value.status === 'plan_confirm'));

function nameOf(id: string): string {
  return props.detail.names[id]?.name || people.value.people.find((p) => p.id === id)?.name || id;
}
function deptName(id: string): string { return people.value.depts.find((d) => d.id === id)?.name || id || '-'; }
/** 部门在通讯录里的第一位负责人（企微 department_leader 第一个；不在同步范围或已离职就当没有，和主进程 firstLeader 一致） */
function leaderOf(deptId: string): string {
  const lid = people.value.depts.find((x) => x.id === deptId)?.leaderIds?.[0];
  const p = lid ? people.value.people.find((x) => x.id === lid) : undefined;
  return p && !p.left ? p.name : '';
}
function deptMembers(deptId: string): string[] {
  return deptId ? people.value.people.filter((p) => p.deptId === deptId && !p.left).map((p) => p.id) : [];
}
/** 这一项会下发给谁：指定了就是指定的人，否则是部门第一负责人 */
function assigneeName(x: MmPlanItem): string {
  return x.assigneeId ? nameOf(x.assigneeId) : leaderOf(x.deptId);
}
function setAssignee(x: MmPlanItem, id: string): void {
  if (id) x.assigneeId = id;
  else delete x.assigneeId;
  dirty.value = true;
}
function decisionNo(id?: string): number {
  if (!id) return 0;
  return m.value.decisions.findIndex((d) => d.id === id) + 1;
}

function reset(): void {
  items.value = (plan.value?.items || []).map((x) => ({ ...x }));
  summary.value = plan.value?.summary || '';
  dirty.value = false;
  editSummary.value = false;
  showProblems.value = false;
}
// 主进程推来新方案时，没改过就跟着刷新；改了一半的不覆盖
watch(plan, () => { if (!dirty.value) reset(); }, { immediate: true, deep: true });
/** 任务负责人（可多位；旧数据只有 ownerId） */
const owners = computed<string[]>(() => {
  const pl = plan.value;
  if (!pl) return [];
  return pl.ownerIds?.length ? pl.ownerIds : pl.ownerId ? [pl.ownerId] : [];
});
const ownerNames = computed(() => owners.value.map((id) => nameOf(id)).filter(Boolean).join(i18nT('、')));
const samePicks = computed(() => ownerPicks.value.length === owners.value.length && ownerPicks.value.every((id) => owners.value.includes(id)));
watch(owners, (ids) => { ownerPicks.value = [...ids]; }, { immediate: true });

const problems = computed(() => {
  const out: string[] = [];
  if (!items.value.length) out.push(i18nT('至少保留一项任务'));
  items.value.forEach((x, i) => {
    const n = i + 1;
    if (!x.deptId) out.push(i18nT('第 {n} 项没有选责任部门', { n }));
    if (!x.title.trim()) out.push(i18nT('第 {n} 项没有填执行事项', { n }));
    if (!/^\d{4}-\d{2}-\d{2}$/.test(x.due || '')) out.push(i18nT('第 {n} 项没有设完成时间', { n }));
    if (x.deptId && !x.assigneeId && people.value.depts.length && !leaderOf(x.deptId)) out.push(i18nT('第 {n} 项的部门没有负责人，请在「下发给」里选人', { n }));
  });
  return out;
});

function add(): void {
  items.value.push({ id: `new-${Date.now().toString(36)}-${items.value.length}`, deptId: '', title: '', standard: '', due: '' });
  dirty.value = true;
}
function remove(i: number): void {
  items.value.splice(i, 1);
  dirty.value = true;
}

async function assignOwner(): Promise<void> {
  if (!ownerPicks.value.length || busy.value) return;
  busy.value = 'owner';
  error.value = '';
  try {
    const ids = [...ownerPicks.value];
    await mm('meeting.plan.owner', { id: m.value.id, ownerIds: ids });
    notif.success(i18nT('已指定 {name} 为任务负责人，已通知确认方案', { name: ids.map((id) => nameOf(id)).join(i18nT('、')) }));
    emit('changed');
  } catch (e) {
    error.value = errorMessage(e);
  } finally {
    busy.value = '';
  }
}
async function save(silent = false): Promise<boolean> {
  showProblems.value = true;
  if (problems.value.length) { error.value = i18nT('还有没填完的任务，先补齐再保存'); return false; }
  busy.value = 'save';
  error.value = '';
  try {
    await mm('meeting.plan.save', { id: m.value.id, items: items.value.map((x) => ({ ...x, title: x.title.trim(), standard: x.standard.trim() })), summary: summary.value });
    dirty.value = false;
    editSummary.value = false;
    if (!silent) notif.success(i18nT('方案已保存'));
    emit('changed');
    return true;
  } catch (e) {
    error.value = errorMessage(e);
    return false;
  } finally {
    busy.value = '';
  }
}
async function confirmPlan(): Promise<void> {
  showProblems.value = true;
  if (problems.value.length) { error.value = i18nT('还有没填完的任务，先补齐再确认'); return; }
  if (!window.confirm(i18nT('确认后将生成 {n} 项任务，按「下发给」一栏下发，方案不能再改。确定？', { n: items.value.length }))) return;
  if (dirty.value && !(await save(true))) return;
  busy.value = 'confirm';
  error.value = '';
  try {
    await mm('meeting.plan.confirm', { id: m.value.id });
    notif.success(i18nT('方案已确认，任务已下发'));
    emit('changed');
  } catch (e) {
    error.value = errorMessage(e);
  } finally {
    busy.value = '';
  }
}

onMounted(async () => {
  try { people.value = await loadPeople(); } catch (e) { error.value = errorMessage(e); }
});
</script>

<style scoped>
.mm-plan { display: grid; gap: 12px; min-width: 0; }
.mm-plan__empty { margin: 0; padding: 14px; border-radius: var(--radius-4); background: var(--color-bg-hover); color: var(--color-text-secondary); font-size: 12.5px; }
.mm-plan__head { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.mm-plan__head h4 { margin: 0; font-size: 16px; }
.mm-grow { flex: 1; }
.mm-plan__owner { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; padding: 12px 14px; border-radius: var(--radius-4); background: color-mix(in srgb, var(--color-brand) 6%, var(--color-bg-card)); border: 1px solid color-mix(in srgb, var(--color-brand) 30%, var(--color-border)); font-size: var(--font-size-md); }
.mm-plan__owner i { color: var(--color-brand); font-size: 18px; }
.mm-plan__owner span { flex: 1; min-width: 220px; }
.mm-plan__owner .mm-plan__owner-pick { flex: 1 1 320px; max-width: 560px; }
.mm-plan__summary { display: grid; gap: 6px; padding: 12px 14px; border: 1px solid var(--color-border); border-radius: var(--radius-4); background: var(--color-bg-card); }
.mm-plan__sumhead { display: flex; align-items: baseline; gap: 10px; flex-wrap: wrap; font-size: var(--font-size-md); }
.mm-plan__md { font-size: var(--font-size-md); line-height: 1.7; }
.mm-plan__md :deep(p) { margin: 0 0 6px; }
.mm-plan__md :deep(ul), .mm-plan__md :deep(ol) { margin: 0 0 6px; padding-inline-start: 20px; }
.mm-plan__textarea { width: 100%; box-sizing: border-box; padding: 8px 10px; border-radius: var(--radius-3); border: 1px solid var(--color-brand); background: var(--color-bg-input); color: var(--color-text-primary); font: inherit; font-size: var(--font-size-md); line-height: 1.6; resize: vertical; }
/* 固定列宽：执行事项 / 交付标准吃剩下的宽度，其余列定宽，输入框撑满单元格，提示文字换行——不再横向溢出 */
.mm-plan__table { table-layout: fixed; width: 100%; }
.mm-plan__table col.c-no { width: 36px; }
.mm-plan__table col.c-dept { width: 128px; }
.mm-plan__table col.c-due { width: 148px; }
.mm-plan__table col.c-to { width: 200px; }
.mm-plan__table col.c-del { width: 40px; }
/* 只读时部门 / 时间 / 下发给都是短文字，多让些宽度给执行事项和交付标准 */
.mm-plan__table:not(.edit) col.c-dept { width: 96px; }
.mm-plan__table:not(.edit) col.c-due { width: 104px; }
.mm-plan__table:not(.edit) col.c-to { width: 112px; }
.mm-plan__table td, .mm-plan__table th { white-space: normal; vertical-align: top; }
.mm-plan__table select, .mm-plan__table input { width: 100%; box-sizing: border-box; min-width: 0; }
.mm-plan__table td.wrap { white-space: normal; word-break: break-word; }
.mm-plan__table input.wide { width: 100%; box-sizing: border-box; min-width: 0; }
.mm-plan__from { display: block; margin-top: 2px; font-size: 11px; color: var(--color-brand); }
.mm-plan__warn { display: block; font-size: 11px; color: var(--color-warning); }
.mm-plan__del { color: var(--color-danger); font-size: 16px; }
.mm-plan__to { min-width: 0; }
.mm-plan__none { text-align: center; color: var(--color-text-secondary); }
.mm-plan__problems { margin: 0; padding: 8px 12px 8px 28px; border-radius: var(--radius-4); background: color-mix(in srgb, var(--color-warning) 10%, transparent); color: var(--color-warning); font-size: 12.5px; display: grid; gap: 2px; }
.spin { animation: mm-spin 1s linear infinite; }
@keyframes mm-spin { to { transform: rotate(360deg); } }
</style>
