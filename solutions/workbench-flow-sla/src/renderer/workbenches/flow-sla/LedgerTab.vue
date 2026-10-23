<template>
  <div class="fs-ledger">
    <div class="ss-kpis">
      <div v-for="s in STATUSES" :key="s" class="ss-kpi"><small>{{ ledgerStatusLabel(s) }}</small><strong :class="{ bad: s === 'overdue' && counts[s] > 0 }" :data-test="`fs-ledger-count-${s}`">{{ counts[s] }}</strong></div>
      <div class="ss-kpi"><small>{{ $t('{n} 天内到期', { n: remindDays }) }}</small><strong :class="{ warn: soon.length > 0 }">{{ soon.length }}</strong></div>
    </div>
    <p class="ss-note info"><i class="ri-information-line"></i>{{ $t('月度通报发出后，改善建议会自动记到这里。执行期限前 {n} 天应用会提醒你与责任人确认执行情况；过了期限还没完成的标为逾期并升级督办；完成后可以归档。', { n: remindDays }) }}</p>
    <p v-if="error" class="ss-note danger"><i class="ri-error-warning-line"></i>{{ error }}</p>

    <div class="ss-actions">
      <div class="fs-seg">
        <button type="button" :class="{ on: filter === '' }" @click="filter = ''">{{ $t('全部') }}</button>
        <button v-for="s in STATUSES" :key="s" type="button" :class="{ on: filter === s }" :data-test="`fs-ledger-filter-${s}`" @click="filter = s">{{ ledgerStatusLabel(s) }}</button>
      </div>
      <span class="grow"></span>
      <button type="button" class="ss-btn primary" :disabled="busy" data-test="fs-ledger-add" @click="startEdit(null)"><i class="ri-add-line"></i>{{ $t('登记改善事项') }}</button>
      <button type="button" class="ss-btn" :disabled="busy || !items.length" data-test="fs-ledger-export" @click="exportLedger"><i class="ri-file-excel-2-line"></i>{{ $t('导出台账') }}</button>
    </div>
    <p v-if="file" class="ss-file-out"><i class="ri-file-excel-2-line"></i><code>{{ file }}</code><button type="button" class="ss-link" @click="openPath(file)">{{ $t('打开') }}</button><button type="button" class="ss-link" @click="openPath(file, true)">{{ $t('所在文件夹') }}</button></p>

    <form v-if="editing" class="fs-form" @submit.prevent="save">
      <h3>{{ editing.id ? $t('修改改善事项') : $t('登记改善事项') }}</h3>
      <label class="ss-field"><span>{{ $t('改善事项') }} *</span><input v-model="editing.item" type="text" data-test="fs-ledger-item" /></label>
      <div class="ss-grid">
        <label class="ss-field"><span>{{ $t('责任部门') }}</span><input v-model="editing.dept" type="text" data-test="fs-ledger-dept" /></label>
        <label class="ss-field"><span>{{ $t('责任人') }}</span><input v-model="editing.owner" type="text" data-test="fs-ledger-owner" /></label>
        <label class="ss-field"><span>{{ $t('执行期限') }}</span><input v-model="editing.deadline" type="date" data-test="fs-ledger-deadline" /></label>
      </div>
      <label class="ss-field"><span>{{ $t('执行要求') }}</span><input v-model="editing.requirement" type="text" /></label>
      <label class="ss-field"><span>{{ $t('验收要求') }}</span><input v-model="editing.acceptance" type="text" /></label>
      <div class="ss-actions">
        <button type="submit" class="ss-btn primary" :disabled="busy || !editing.item.trim()" data-test="fs-ledger-save"><i class="ri-save-line"></i>{{ $t('保存') }}</button>
        <button type="button" class="ss-link" @click="editing = null">{{ $t('取消') }}</button>
      </div>
    </form>

    <p v-if="!shown.length" class="ss-empty">{{ items.length ? $t('这个状态下没有事项') : $t('台账还是空的。月度通报发出后改善建议会记到这里，也可以手工登记。') }}</p>
    <article v-for="it in shown" :key="it.id" class="fs-item" :class="it.status" :data-test="`fs-ledger-row`">
      <header>
        <span class="ss-chip" :class="ledgerStatusClass(it.status)">{{ ledgerStatusLabel(it.status) }}</span>
        <span v-if="it.escalated && it.status === 'overdue'" class="ss-chip bad"><i class="ri-alarm-warning-line"></i>{{ $t('升级督办') }}</span>
        <strong>{{ it.item }}</strong>
        <span class="grow"></span>
        <span v-if="it.deadline" class="ss-chip" :class="deadlineClass(it)">{{ deadlineText(it) }}</span>
      </header>
      <p class="fs-facts">
        <span>{{ $t('责任部门：{p0}', { p0: it.dept || '-' }) }}</span><span>{{ $t('责任人：{p0}', { p0: it.owner || '-' }) }}</span><span>{{ $t('执行期限：{p0}', { p0: it.deadline || $t('未定') }) }}</span><span>{{ $t('来源：{p0}', { p0: it.source || '-' }) }}</span>
      </p>
      <p v-if="it.requirement" class="fs-line"><b>{{ $t('执行要求') }}</b>{{ it.requirement }}</p>
      <p v-if="it.acceptance" class="fs-line"><b>{{ $t('验收要求') }}</b>{{ it.acceptance }}</p>
      <ul v-if="it.progress.length" class="fs-notes">
        <li v-for="(p, i) in (expanded === it.id ? it.progress : it.progress.slice(-3))" :key="i"><time>{{ fmtDateTime(p.at) }}</time><span>{{ p.text }}</span></li>
        <li v-if="it.progress.length > 3 && expanded !== it.id"><button type="button" class="ss-link" @click="expanded = it.id">{{ $t('看全部 {n} 条进展', { n: it.progress.length }) }}</button></li>
      </ul>
      <div class="ss-actions">
        <template v-if="it.status !== 'archived'">
          <input v-model="drafts[it.id]" type="text" class="fs-note-input" :placeholder="$t('记一条执行进展（与责任人确认的情况）')" data-test="fs-ledger-progress" @keydown.enter.prevent="addProgress(it)" />
          <button type="button" class="ss-btn sm" :disabled="busy || !(drafts[it.id] || '').trim()" data-test="fs-ledger-progress-save" @click="addProgress(it)"><i class="ri-add-line"></i>{{ $t('记进展') }}</button>
        </template>
        <button v-if="it.status === 'doing' || it.status === 'overdue'" type="button" class="ss-btn sm primary" :disabled="busy" data-test="fs-ledger-done" @click="setStatus(it, 'done')"><i class="ri-check-line"></i>{{ $t('标为已完成') }}</button>
        <button v-if="it.status === 'done'" type="button" class="ss-btn sm" :disabled="busy" data-test="fs-ledger-archive" @click="setStatus(it, 'archived')"><i class="ri-archive-line"></i>{{ $t('归档') }}</button>
        <button v-if="it.status === 'done' || it.status === 'archived'" type="button" class="ss-link" :disabled="busy" @click="setStatus(it, 'doing')">{{ $t('重新打开') }}</button>
        <button type="button" class="ss-link" :disabled="busy" @click="startEdit(it)">{{ $t('修改') }}</button>
        <button type="button" class="ss-link danger" :disabled="busy" @click="remove(it)">{{ $t('删除') }}</button>
      </div>
    </article>
  </div>
</template>

<script setup lang="ts">
/** 改善台账：改善事项的登记、进展、状态与导出。到期前提醒与逾期升级由主进程守护发出。 */
import { computed, reactive, ref } from 'vue';
import type { FsLedgerItem, FsLedgerStatus } from '@totalclaw/ipc-contracts';
import { t as i18nT } from '../../i18n';
import { daysLeft, errorMessage, fmtDateTime, fs, fsState, ledgerStatusClass, ledgerStatusLabel, openPath, refreshState } from './shared';

const STATUSES: FsLedgerStatus[] = ['doing', 'overdue', 'done', 'archived'];
type Draft = { id: string; item: string; dept: string; owner: string; requirement: string; deadline: string; acceptance: string };

const busy = ref(false);
const error = ref('');
const file = ref('');
const filter = ref<FsLedgerStatus | ''>('');
const editing = ref<Draft | null>(null);
const expanded = ref('');
const drafts = reactive<Record<string, string>>({});

const items = computed(() => fsState.value?.ledger ?? []);
const remindDays = computed(() => fsState.value?.thresholds.improveRemindDays ?? 7);
const counts = computed(() => Object.fromEntries(STATUSES.map((s) => [s, items.value.filter((x) => x.status === s).length])) as Record<FsLedgerStatus, number>);
const soon = computed(() => items.value.filter((x) => x.status === 'doing' && (() => { const d = daysLeft(x.deadline); return d !== null && d >= 0 && d <= remindDays.value; })()));
const shown = computed(() => {
  const order: Record<FsLedgerStatus, number> = { overdue: 0, doing: 1, done: 2, archived: 3 };
  return items.value.filter((x) => !filter.value || x.status === filter.value)
    .slice().sort((a, b) => order[a.status] - order[b.status] || (a.deadline || '9999').localeCompare(b.deadline || '9999'));
});

function deadlineText(it: FsLedgerItem): string {
  const d = daysLeft(it.deadline);
  if (d === null) return it.deadline;
  if (it.status === 'done' || it.status === 'archived') return it.deadline;
  if (d < 0) return i18nT('已过期 {n} 天', { n: -d });
  if (d === 0) return i18nT('今天到期');
  return i18nT('还有 {n} 天', { n: d });
}
function deadlineClass(it: FsLedgerItem): string {
  const d = daysLeft(it.deadline);
  if (d === null || it.status === 'done' || it.status === 'archived') return '';
  return d < 0 ? 'bad' : d <= remindDays.value ? 'warn' : '';
}

async function act(fn: () => Promise<void>): Promise<boolean> {
  busy.value = true; error.value = '';
  try { await fn(); await refreshState(); return true; } catch (e) { error.value = errorMessage(e); return false; } finally { busy.value = false; }
}
function startEdit(it: FsLedgerItem | null): void {
  editing.value = it ? { id: it.id, item: it.item, dept: it.dept, owner: it.owner, requirement: it.requirement, deadline: it.deadline, acceptance: it.acceptance } : { id: '', item: '', dept: '', owner: '', requirement: '', deadline: '', acceptance: '' };
}
async function save(): Promise<void> {
  const d = editing.value;
  if (!d) return;
  if (await act(async () => { await fs('ledger.save', { item: d.id ? d : { ...d, id: undefined } }); })) editing.value = null;
}
async function setStatus(it: FsLedgerItem, status: FsLedgerStatus): Promise<void> {
  await act(async () => { await fs('ledger.save', { item: { id: it.id, item: it.item, status } }); });
}
async function addProgress(it: FsLedgerItem): Promise<void> {
  const text = (drafts[it.id] || '').trim();
  if (!text) return;
  await act(async () => { await fs('ledger.progress', { id: it.id, text }); drafts[it.id] = ''; });
}
async function remove(it: FsLedgerItem): Promise<void> {
  if (!window.confirm(i18nT('删除「{p0}」？进展记录也会一起删掉。', { p0: it.item }))) return;
  await act(async () => { await fs('ledger.remove', { id: it.id }); });
}
async function exportLedger(): Promise<void> {
  await act(async () => { file.value = await fs<string>('ledger.export'); });
}
defineExpose({ startEdit, save, editing });
</script>

<style scoped>
.fs-ledger { display: grid; gap: 12px; }
.fs-form { display: grid; gap: 10px; padding: 14px; border: 1px solid var(--color-brand); border-radius: var(--radius-5); background: var(--color-bg-card); }
.fs-form h3 { margin: 0; font-size: var(--font-size-base); }
.fs-item { display: grid; gap: 8px; padding: 12px 14px; border: 1px solid var(--color-border); border-radius: var(--radius-5); background: var(--color-bg-card); }
.fs-item.overdue { border-color: color-mix(in srgb, var(--color-danger) 45%, var(--color-border)); }
.fs-item.archived { opacity: .7; }
.fs-item header { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; font-size: 13.5px; }
.fs-item header .grow { flex: 1; }
.fs-facts { margin: 0; display: flex; gap: 6px 16px; flex-wrap: wrap; font-size: 12.5px; color: var(--color-text-secondary); }
.fs-line { margin: 0; font-size: 12.5px; line-height: 1.6; }
.fs-line b { margin-inline-end: 8px; color: var(--color-text-secondary); font-weight: 700; }
.fs-notes { list-style: none; margin: 0; padding: 0; display: grid; gap: 4px; font-size: 12.5px; }
.fs-notes li { display: flex; gap: 8px; align-items: baseline; }
.fs-notes time { flex: 0 0 auto; color: var(--color-text-secondary); font-size: 11.5px; font-variant-numeric: tabular-nums; }
.fs-note-input { flex: 1; min-width: 220px; height: 30px; border-radius: var(--radius-3); border: 1px solid var(--color-border); background: var(--color-bg-input); color: var(--color-text-primary); font: inherit; font-size: 12.5px; padding: 0 10px; }
.fs-seg { display: inline-flex; border: 1px solid var(--color-border); border-radius: var(--radius-3); overflow: hidden; }
.fs-seg button { height: 30px; padding: 0 12px; border: none; background: var(--color-bg-card); color: var(--color-text-secondary); font: inherit; font-size: var(--font-size-sm); font-weight: 700; cursor: pointer; }
.fs-seg button.on { background: var(--color-brand); color: var(--color-on-accent); }
strong.bad { color: var(--color-danger); }
strong.warn { color: var(--color-warning); }
.ss-link.danger { color: var(--color-danger); }
</style>
