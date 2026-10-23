<template>
  <div class="ca-tk">
    <section class="ss-panel">
      <h3><i class="ri-git-pull-request-line"></i>{{ $t('转办问题') }}</h3>
      <p class="ss-muted">{{ $t('知识库里没有依据的问题会转到这里，按部门分派。部门答复后学生在手机「我的问题」里能看到；勾选「沉淀为 FAQ」，下次同样的问题直接自动回答。') }}</p>
      <div class="ca-filter">
        <button v-for="f in STATUS" :key="f.key" type="button" :class="{ on: status === f.key }" @click="status = f.key">{{ f.label }}<em v-if="f.key === 'open'"> {{ openCount }}</em></button>
        <select v-model="dept" class="ca-sel"><option value="">{{ $t('全部部门') }}</option><option v-for="d in depts" :key="d" :value="d">{{ d }}</option></select>
      </div>
      <p v-if="!list.length" class="ss-muted">{{ $t('没有符合条件的转办问题') }}</p>
      <article v-for="t in list" :key="t.id" class="ca-ticket" :class="{ sensitive: t.sensitive, done: t.status !== 'open' }" :data-test="`ca-ticket-${t.id}`">
        <header>
          <span v-if="t.sensitive" class="ss-chip bad"><i class="ri-alarm-warning-line"></i>{{ $t('敏感') }}</span>
          <span class="ss-chip" :class="t.status === 'open' ? 'warn' : 'ok'">{{ ticketStatusLabel(t.status) }}</span>
          <select :value="t.dept" class="ca-sel" @change="(e) => update(t.id, { dept: (e.target as HTMLSelectElement).value })"><option v-for="d in deptOptions(t.dept)" :key="d" :value="d">{{ d }}</option></select>
          <small class="ss-muted">{{ fmtDateTime(t.at) }} · {{ t.channel === 'mobile' ? $t('手机') : $t('电脑') }}</small>
        </header>
        <p class="ca-q">{{ t.question }}</p>
        <p v-if="t.sensitive && t.status === 'open'" class="ss-note danger"><i class="ri-alarm-warning-line"></i>{{ $t('敏感问题：提问的学生已收到求助电话。请{p0}尽快通过辅导员核实并联系学生；处理完再关闭。', { p0: t.dept }) }}</p>
        <template v-if="t.answer">
          <p class="ca-pre ca-reply"><b>{{ $t('答复：') }}</b>{{ t.answer }}</p>
          <small v-if="t.faqId" class="ss-muted"><i class="ri-checkbox-circle-line"></i>{{ $t('已沉淀为 FAQ') }}</small>
        </template>
        <form v-if="editing === t.id" class="ca-reply-form" @submit.prevent="answer(t.id)">
          <textarea v-model="draft" :placeholder="$t('写给学生的答复，尽量写清楚时间、地点、办理方式')"></textarea>
          <label v-if="!t.sensitive" class="ca-check"><input v-model="toFaq" type="checkbox" />{{ $t('沉淀为 FAQ（下次同样的问题直接用这个答案）') }}</label>
          <label v-if="toFaq && !t.sensitive" class="ss-field"><span>{{ $t('FAQ 问题写法（可改得更通用）') }}</span><input v-model="faqQuestion" /></label>
          <div class="ss-actions"><button type="submit" class="ss-btn primary sm" :disabled="busy || !draft.trim()">{{ $t('提交答复') }}</button><button type="button" class="ss-btn sm" @click="editing = ''">{{ $t('取消') }}</button></div>
        </form>
        <div v-else class="ss-actions">
          <button v-if="t.status === 'open'" type="button" class="ss-btn primary sm" @click="startAnswer(t)"><i class="ri-reply-line"></i>{{ $t('答复') }}</button>
          <button v-if="t.status !== 'closed'" type="button" class="ss-btn sm" @click="update(t.id, { status: 'closed' })">{{ $t('关闭') }}</button>
          <button v-else type="button" class="ss-btn sm" @click="update(t.id, { status: 'open' })">{{ $t('重新打开') }}</button>
        </div>
      </article>
    </section>
  </div>
</template>

<script setup lang="ts">
/** 转办问题：按部门分派、答复、沉淀为 FAQ；敏感问题置顶 */
import { computed, ref } from 'vue';
import type { CaTicket, CaTicketStatus } from '@totalclaw/ipc-contracts';
import { useNotificationStore } from '../../stores/notification';
import { t as i18nT } from '../../i18n';
import { ca, caState, errorMessage, fmtDateTime, refreshState, ticketStatusLabel } from './shared';

const notif = useNotificationStore();
const status = ref<'' | CaTicketStatus>('open');
const dept = ref('');
const editing = ref('');
const draft = ref('');
const toFaq = ref(true);
const faqQuestion = ref('');
const busy = ref(false);

const STATUS: Array<{ key: '' | CaTicketStatus; label: string }> = [
  { key: 'open', label: i18nT('待答复') },
  { key: 'answered', label: i18nT('已答复') },
  { key: 'closed', label: i18nT('已关闭') },
  { key: '', label: i18nT('全部') },
];
const tickets = computed(() => caState.value?.tickets || []);
const openCount = computed(() => tickets.value.filter((t) => t.status === 'open').length);
const depts = computed(() => [...new Set([...(caState.value?.settings.depts || []), ...tickets.value.map((t) => t.dept)].filter(Boolean))]);
const deptOptions = (cur: string): string[] => [...new Set([...(caState.value?.settings.depts || []), cur].filter(Boolean))];
// 敏感在前，其次新的在前
const list = computed(() => tickets.value
  .filter((t) => (!status.value || t.status === status.value) && (!dept.value || t.dept === dept.value))
  .slice()
  .sort((a, b) => Number(b.sensitive && b.status === 'open') - Number(a.sensitive && a.status === 'open') || b.at.localeCompare(a.at)));

function startAnswer(t: CaTicket): void {
  editing.value = t.id;
  draft.value = '';
  toFaq.value = !t.sensitive;
  faqQuestion.value = t.question;
}
async function answer(id: string): Promise<void> {
  busy.value = true;
  try {
    await ca('ticket.answer', { id, answer: draft.value, toFaq: toFaq.value, faqQuestion: faqQuestion.value });
    editing.value = '';
    await refreshState();
    notif.success(toFaq.value ? i18nT('已答复，并沉淀为 FAQ') : i18nT('已答复'));
  } catch (e) { notif.error(errorMessage(e)); } finally { busy.value = false; }
}
async function update(id: string, patch: { dept?: string; status?: CaTicketStatus }): Promise<void> {
  try { await ca('ticket.update', { id, ...patch }); await refreshState(); } catch (e) { notif.error(errorMessage(e)); }
}
</script>

<style scoped>
.ca-tk { display: grid; gap: 14px; max-width: 1100px; }
.ca-sel { height: 28px; border: 1px solid var(--color-border); border-radius: var(--radius-3); padding: 0 6px; font: inherit; font-size: var(--font-size-sm); background: var(--color-bg-card); color: var(--color-text); }
.ca-ticket { border: 1px solid var(--color-border); border-radius: var(--radius-5); padding: 12px 14px; display: grid; gap: 8px; }
.ca-ticket.sensitive { border-color: color-mix(in srgb, var(--color-danger) 50%, var(--color-border)); }
.ca-ticket.done { opacity: .85; }
.ca-ticket header { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
.ca-q { margin: 0; font-size: var(--font-size-base); font-weight: 600; }
.ca-reply { background: var(--color-bg-hover); border-radius: var(--radius-3); padding: 8px 10px; }
.ca-reply-form { display: grid; gap: 8px; }
.ca-reply-form textarea { min-height: 90px; border: 1px solid var(--color-border); border-radius: var(--radius-3); padding: 8px 10px; font: inherit; background: var(--color-bg-input); color: var(--color-text); resize: vertical; }
.ca-check { display: flex; gap: 6px; align-items: center; font-size: 12.5px; }
.ca-filter em { font-style: normal; font-weight: 800; }
</style>
