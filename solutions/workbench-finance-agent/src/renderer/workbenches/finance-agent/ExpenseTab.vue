<template>
  <div class="ss-module">
    <ModuleHeader :meta="meta" />

    <p class="ss-note info">
      <i class="ri-information-line"></i>{{ $t('报销标准、单张上限、月度额度、票据有效期在「设置」里改；预审结论只是意见，通过或驳回由财务点。') }}
      <button type="button" class="ss-link" @click="$emit('goto', 'settings')">{{ $t('去设置') }}</button>
    </p>

    <div class="fa-split">
      <aside class="fa-list">
        <div class="ss-subhead">{{ $t('新建报销单') }}</div>
        <div class="fa-new">
          <input v-model.trim="form.employee" type="text" :placeholder="$t('报销人')" />
          <input v-model.trim="form.dept" type="text" :placeholder="$t('部门')" />
          <input v-model.trim="form.level" type="text" :placeholder="$t('职级（可空）')" />
          <input v-model.trim="form.reason" type="text" :placeholder="$t('事由')" />
          <button type="button" class="ss-btn primary sm" :disabled="!form.employee || !!busy" @click="createClaim"><i class="ri-add-line"></i>{{ $t('新建') }}</button>
        </div>
        <div class="ss-subhead">{{ $t('报销单') }}</div>
        <ul>
          <li v-for="c in claims" :key="c.id" :class="{ active: c.id === selectedId }" @click="selectedId = c.id">
            <div class="fa-list__top">
              <strong>{{ c.employee }}</strong>
              <span class="ss-chip" :class="verdictChip(c)">{{ verdictLabel(c) }}</span>
            </div>
            <div class="fa-list__meta">
              <span>{{ c.dept || '—' }}</span>
              <span>{{ fmtMoney(c.total) }}</span>
              <span>{{ fmtDate(c.createdAt) }}</span>
              <button type="button" class="ss-link" @click.stop="removeClaim(c)">{{ $t('删除') }}</button>
            </div>
          </li>
          <li v-if="!claims.length" class="ss-empty">{{ $t('还没有报销单') }}</li>
        </ul>
      </aside>

      <section class="fa-detail">
        <template v-if="current">
          <StickyProgress :title="$t('报销预审：{p0}', { p0: current.employee })" :metas="metas" :runtime="runtime" :current-key="currentKey" @jump="scrollTo" />
          <p v-if="busy && faProgress.expense" class="ss-note info"><i class="ri-loader-4-line spin"></i>{{ faProgress.expense }}</p>
          <div class="ss-steps">
            <StepCard step-key="docs" :index="0" :title="metas[0].title" :hint="metas[0].hint" :runtime="runtime.docs">
              <FileDrop kind="invoice" :label="$t('上传报销票据')" :disabled="!!busy || !!current.decision" @picked="addDocs" />
              <p class="ss-muted">{{ $t('报销人：{a}　部门：{b}　职级：{c}　事由：{d}', { a: current.employee, b: current.dept || '—', c: current.level || '—', d: current.reason || '—' }) }}</p>
            </StepCard>

            <StepCard step-key="review" :index="1" :title="metas[1].title" :hint="metas[1].hint" :runtime="runtime.review">
              <div v-if="current.items.length" class="ss-table-wrap">
                <table class="ss-table">
                  <thead><tr><th>{{ $t('票据') }}</th><th>{{ $t('日期') }}</th><th>{{ $t('类别') }}</th><th class="num">{{ $t('金额') }}</th><th>{{ $t('校验') }}</th><th></th></tr></thead>
                  <tbody>
                    <tr v-for="it in current.items" :key="it.docId" :class="{ bad: it.checks.some((c) => c.level === 'error') }">
                      <td class="fa-file"><button type="button" class="ss-link" @click="openDoc(it.docId)">{{ docName(it.docId) }}</button></td>
                      <td>{{ it.date || '—' }}</td>
                      <td>
                        <select :value="it.category" :disabled="!!busy || !!current.decision" @change="setCategory(it.docId, ($event.target as HTMLSelectElement).value)">
                          <option v-for="c in categoryOptions(it.category)" :key="c" :value="c">{{ c }}</option>
                        </select>
                      </td>
                      <td class="num">{{ fmtMoney(it.amount) }}</td>
                      <td class="fa-wrap">
                        <div v-for="(c, i) in it.checks" :key="i" class="fa-check"><span class="ss-chip" :class="levelChip(c.level)">{{ levelLabel(c.level) }}</span>{{ c.message }}</div>
                      </td>
                      <td><button v-if="!current.decision" type="button" class="ss-link" @click="removeDoc(it.docId)">{{ $t('移除') }}</button></td>
                    </tr>
                    <tr class="total"><td colspan="3">{{ $t('合计') }}</td><td class="num">{{ fmtMoney(current.total) }}</td><td colspan="2"></td></tr>
                  </tbody>
                </table>
              </div>
              <div class="ss-actions">
                <span class="ss-chip" :class="verdictChip(current)">{{ $t('预审结论：{p0}', { p0: verdictText(current.verdict) }) }}</span>
                <button type="button" class="ss-btn ghost sm" :disabled="!!busy || !current.items.length" @click="reReview"><i class="ri-refresh-line"></i>{{ $t('重新预审') }}</button>
              </div>
              <ul v-if="current.rejectReasons.length" class="fa-reasons">
                <li v-for="(r, i) in current.rejectReasons" :key="i"><i class="ri-close-circle-line"></i>{{ r }}</li>
              </ul>
            </StepCard>

            <StepCard step-key="decide" :index="2" :title="metas[2].title" :hint="metas[2].hint" :runtime="runtime.decide">
              <div class="ss-actions">
                <button type="button" class="ss-btn primary" :disabled="!!busy || !current.items.length" @click="decide('approved')"><i class="ri-check-line"></i>{{ $t('通过') }}</button>
                <button type="button" class="ss-btn danger" :disabled="!!busy || !current.items.length" @click="decide('rejected')"><i class="ri-close-line"></i>{{ $t('驳回') }}</button>
                <span v-if="current.decision" class="ss-muted">{{ $t('{p0}（{p1}）', { p0: current.decision === 'approved' ? $t('已通过') : $t('已驳回'), p1: fmtDateTime(current.decidedAt) }) }}</span>
              </div>
            </StepCard>

            <StepCard step-key="notice" :index="3" :title="metas[3].title" :hint="metas[3].hint" :runtime="runtime.notice">
              <textarea class="fa-notice" :value="current.notice || ''" rows="7" readonly></textarea>
              <div class="ss-actions">
                <button type="button" class="ss-btn ghost sm" :disabled="!current.notice" @click="copyNotice"><i class="ri-file-copy-line"></i>{{ $t('复制') }}</button>
                <button type="button" class="ss-btn ghost sm" :disabled="!!busy || !current.notice" @click="polish"><i :class="busy === 'notice' ? 'ri-loader-4-line spin' : 'ri-quill-pen-line'"></i>{{ $t('润色措辞') }}</button>
                <span class="ss-muted">{{ $t('通知只生成文字，由财务自己发给员工；润色不会改动原因条目和金额。') }}</span>
              </div>
            </StepCard>
          </div>
        </template>
        <p v-else class="ss-muted">{{ $t('先在左边新建一张报销单。') }}</p>
      </section>
    </div>

    <section class="ss-panel">
      <header>
        <strong><i class="ri-building-line"></i> {{ $t('费用按部门归集（已通过的报销）') }}</strong>
        <span class="grow"></span>
        <button type="button" class="ss-btn ghost sm" @click="loadSummary"><i class="ri-refresh-line"></i>{{ $t('刷新') }}</button>
        <button type="button" class="ss-btn primary sm" :disabled="!!busy || !claims.length" @click="exportClaims"><i class="ri-file-excel-2-line"></i>{{ $t('导出报销预审') }}</button>
      </header>
      <div v-if="summary.length" class="ss-table-wrap">
        <table class="ss-table">
          <thead><tr><th>{{ $t('部门') }}</th><th>{{ $t('类别') }}</th><th class="num">{{ $t('张数') }}</th><th class="num">{{ $t('金额') }}</th></tr></thead>
          <tbody><tr v-for="(g, i) in summary" :key="i"><td>{{ g.dept }}</td><td>{{ g.category }}</td><td class="num">{{ g.count }}</td><td class="num">{{ fmtMoney(g.amount) }}</td></tr></tbody>
        </table>
      </div>
      <p v-else class="ss-muted">{{ $t('还没有已通过的报销。') }}</p>
      <div v-if="exported" class="ss-actions">
        <code class="fa-path">{{ exported }}</code>
        <button type="button" class="ss-btn ghost sm" @click="openFile(exported)"><i class="ri-external-link-line"></i>{{ $t('打开') }}</button>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
/**
 * 费用报销智能体：新建报销单 → 上传票据 → 规则预审（标准、额度、有效期、重复票、抬头）→ 财务确认 → 通知文字。
 */
import { computed, onMounted, reactive, ref, watch } from 'vue';
import type { FaExpenseClaim } from '@totalclaw/ipc-contracts';
import { useNotificationStore } from '../../stores/notification';
import { t as i18nT } from '../../i18n';
import StepCard from '../service-settlement/StepCard.vue';
import StickyProgress from '../service-settlement/StickyProgress.vue';
import ModuleHeader from './ModuleHeader.vue';
import FileDrop from './FileDrop.vue';
import {
  errorMessage, fa, faProgress, faState, fmtDate, fmtDateTime, fmtMoney, levelChip, levelLabel, openPath, refreshState, scrollToStep,
  type FaModuleMeta, type StepMeta, type StepRuntime,
} from './shared';

defineProps<{ meta: FaModuleMeta; focus?: any }>();
defineEmits<{ (e: 'goto', module: string, payload?: any): void }>();
const notif = useNotificationStore();

const form = reactive({ employee: '', dept: '', level: '', reason: '' });
const selectedId = ref('');
const busy = ref('');
const errors = ref<Record<string, string>>({});
const summary = ref<Array<{ dept: string; category: string; amount: number; count: number }>>([]);
const exported = ref('');

const claims = computed(() => faState.value?.data.claims || []);
const current = computed<FaExpenseClaim | null>(() => claims.value.find((c) => c.id === selectedId.value) || null);
watch(claims, (l) => { if (!l.some((c) => c.id === selectedId.value)) selectedId.value = l[0]?.id || ''; }, { immediate: true });
watch(selectedId, () => { errors.value = {}; });

const metas: StepMeta[] = [
  { key: 'docs', title: i18nT('上传单据'), hint: i18nT('员工的发票、客票、收据，逐张识别') },
  { key: 'review', title: i18nT('规则预审'), hint: i18nT('标准、额度、票据有效期、重复发票、抬头逐张校验') },
  { key: 'decide', title: i18nT('财务确认'), hint: i18nT('财务看预审意见，点通过或驳回') },
  { key: 'notice', title: i18nT('通知员工'), hint: i18nT('生成通过 / 驳回通知，驳回写明原因') },
];
const runtime = computed<Record<string, StepRuntime>>(() => {
  const c = current.value;
  const st = (key: string, done: boolean, summaryText?: string): StepRuntime => (busy.value === key
    ? { state: 'running' }
    : errors.value[key] ? { state: 'failed', error: errors.value[key] }
      : done ? { state: 'done', summary: summaryText } : { state: 'todo' });
  return {
    docs: st('docs', !!c?.items.length, c ? i18nT('{n} 张票据，合计 {p0}', { n: c.items.length, p0: fmtMoney(c.total) }) : ''),
    review: st('review', !!c && c.verdict !== 'pending', c ? verdictText(c.verdict) : ''),
    decide: st('decide', !!c?.decision, c?.decision === 'approved' ? i18nT('已通过') : i18nT('已驳回')),
    notice: st('notice', !!c?.decision && !!c.notice),
  };
});
const currentKey = computed(() => metas.find((m) => runtime.value[m.key].state !== 'done')?.key || 'notice');

function verdictText(v: FaExpenseClaim['verdict']): string {
  return { pass: i18nT('合规'), reject: i18nT('建议驳回'), review: i18nT('待人工判断'), pending: i18nT('未预审') }[v];
}
function verdictLabel(c: FaExpenseClaim): string {
  if (c.decision) return c.decision === 'approved' ? i18nT('已通过') : i18nT('已驳回');
  return verdictText(c.verdict);
}
function verdictChip(c: FaExpenseClaim): string {
  if (c.decision) return c.decision === 'approved' ? 'ok' : 'bad';
  return c.verdict === 'pass' ? 'ok' : c.verdict === 'reject' ? 'bad' : c.verdict === 'review' ? 'warn' : '';
}
function docName(id: string): string {
  return faState.value?.data.docs.find((d) => d.id === id)?.fileName || id;
}
function categoryOptions(cur: string): string[] {
  const set = new Set<string>([...(faState.value?.categories || []), ...(faState.value?.settings.expense.rules || []).map((r) => r.category)]);
  if (cur) set.add(cur);
  return [...set];
}

async function run(key: string, fn: () => Promise<unknown>): Promise<boolean> {
  busy.value = key;
  errors.value = { ...errors.value, [key]: '' };
  void scrollToStep(key);
  try {
    await fn();
    await refreshState();
    return true;
  } catch (e) {
    errors.value = { ...errors.value, [key]: errorMessage(e) };
    return false;
  } finally {
    busy.value = '';
  }
}

async function createClaim(): Promise<void> {
  busy.value = 'create';
  try {
    const c = await fa<FaExpenseClaim>('claim.create', { ...form });
    await refreshState();
    selectedId.value = c.id;
    Object.assign(form, { employee: '', dept: '', level: '', reason: '' });
  } catch (e) { notif.error(errorMessage(e)); } finally { busy.value = ''; }
}
async function removeClaim(c: FaExpenseClaim): Promise<void> {
  if (!window.confirm(i18nT('删除 {p0} 的这张报销单及其票据？', { p0: c.employee }))) return;
  try { await fa('claim.remove', { id: c.id }); await refreshState(); } catch (e) { notif.error(errorMessage(e)); }
}
async function addDocs(paths: string[]): Promise<void> {
  if (!current.value) return;
  const id = current.value.id;
  await run('docs', () => fa('claim.addDocs', { id, paths }));
}
async function reReview(): Promise<void> {
  if (!current.value) return;
  const id = current.value.id;
  await run('review', () => fa('claim.review', { id }));
}
async function setCategory(docId: string, category: string): Promise<void> {
  if (!current.value) return;
  const id = current.value.id;
  await run('review', () => fa('claim.setCategory', { id, docId, category }));
}
async function removeDoc(docId: string): Promise<void> {
  if (!current.value) return;
  const id = current.value.id;
  await run('review', () => fa('claim.removeDoc', { id, docId }));
}
async function decide(decision: 'approved' | 'rejected'): Promise<void> {
  if (!current.value) return;
  const c = current.value;
  if (decision === 'approved' && c.verdict === 'reject' && !window.confirm(i18nT('预审建议驳回，确定仍然通过？'))) return;
  await run('decide', () => fa('claim.decide', { id: c.id, decision }));
  void loadSummary();
}
async function polish(): Promise<void> {
  if (!current.value) return;
  const id = current.value.id;
  await run('notice', () => fa('claim.polishNotice', { id }));
}
async function copyNotice(): Promise<void> {
  try { await navigator.clipboard.writeText(current.value?.notice || ''); notif.success(i18nT('已复制')); } catch (e) { notif.error(errorMessage(e)); }
}
async function loadSummary(): Promise<void> {
  try { summary.value = await fa('claim.summary'); } catch (e) { notif.error(errorMessage(e)); }
}
async function exportClaims(): Promise<void> {
  busy.value = 'export';
  try { exported.value = (await fa<{ path: string }>('claim.export')).path; } catch (e) { notif.error(errorMessage(e)); } finally { busy.value = ''; }
}
function openDoc(docId: string): void {
  const d = faState.value?.data.docs.find((x) => x.id === docId);
  if (d) openFile(d.path);
}
function openFile(path: string): void {
  openPath(path).catch((e) => notif.error(errorMessage(e)));
}
function scrollTo(key: string): void { void scrollToStep(key); }
onMounted(() => { void loadSummary(); });
</script>

<style scoped>
.fa-split { display: grid; grid-template-columns: minmax(230px, 290px) 1fr; gap: 14px; align-items: start; }
@media (max-width: 960px) { .fa-split { grid-template-columns: 1fr; } }
.fa-list { display: grid; gap: 8px; border: 1px solid var(--color-border); border-radius: 14px; background: var(--color-bg-card); padding: 10px; position: sticky; top: 0; max-height: calc(100vh - 160px); overflow: hidden; grid-template-rows: auto auto auto 1fr; }
.fa-new { display: grid; gap: 6px; }
.fa-new input { height: 30px; border-radius: 8px; border: 1px solid var(--color-border); background: var(--color-bg-input, var(--color-bg-primary)); color: var(--color-text-primary); padding: 0 8px; font: inherit; font-size: 12.5px; }
.fa-list ul { list-style: none; margin: 0; padding: 0; display: grid; gap: 6px; overflow-y: auto; align-content: start; }
.fa-list li { padding: 8px 10px; border-radius: 10px; border: 1px solid transparent; cursor: pointer; display: grid; gap: 3px; background: var(--color-bg-primary); }
.fa-list li.active { border-color: var(--color-brand); background: color-mix(in srgb, var(--color-brand) 8%, var(--color-bg-card)); }
.fa-list__top { display: flex; justify-content: space-between; gap: 6px; align-items: center; font-size: 13px; }
.fa-list__meta { display: flex; gap: 8px; font-size: 11px; color: var(--color-text-secondary); align-items: center; flex-wrap: wrap; }
.fa-detail { display: grid; gap: 12px; min-width: 0; }
.fa-file { max-width: 220px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.fa-wrap { white-space: normal !important; }
.fa-check { display: flex; gap: 6px; align-items: center; font-size: 12px; margin: 2px 0; }
.fa-reasons { list-style: none; margin: 0; padding: 0; display: grid; gap: 4px; font-size: 12.5px; }
.fa-reasons i { color: var(--color-danger); margin-inline-end: 4px; }
.fa-notice { width: 100%; box-sizing: border-box; font: inherit; font-size: 12.5px; border-radius: 10px; border: 1px solid var(--color-border); background: var(--color-bg-primary); color: var(--color-text-primary); padding: 8px 10px; }
.ss-panel > header strong { display: flex; gap: 6px; align-items: center; }
.grow { flex: 1; }
.fa-path { flex: 1; min-width: 200px; font-size: 12px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--color-text-secondary); }
</style>
