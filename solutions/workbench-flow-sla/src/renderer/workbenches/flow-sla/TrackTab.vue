<template>
  <div class="fs-track">
    <div class="ss-kpis">
      <div class="ss-kpi"><small>{{ $t('跟进中') }}</small><strong data-test="fs-track-open">{{ open.length }}</strong></div>
      <div class="ss-kpi"><small>{{ $t('今天该跟进') }}</small><strong :class="{ bad: due.length > 0 }" data-test="fs-track-due">{{ due.length }}</strong></div>
      <div class="ss-kpi"><small>{{ $t('内部流程（每 {n} 天）', { n: th?.internalDays ?? 3 }) }}</small><strong>{{ open.filter((t) => !isExternal(t)).length }}</strong></div>
      <div class="ss-kpi"><small>{{ $t('外部流程（每 {n} 天）', { n: th?.externalDays ?? 7 }) }}</small><strong>{{ open.filter(isExternal).length }}</strong></div>
      <div class="ss-kpi"><small>{{ $t('已闭环') }}</small><strong>{{ closed.length }}</strong></div>
    </div>
    <p class="ss-note info"><i class="ri-information-line"></i>{{ $t('名单来自「通报」第 3 步的计算：在途且已逾期的流程进名单；以后导入的报表显示它已办结或终止，就自动闭环。到了跟进日，应用会在这里和系统通知里提醒你。') }}</p>
    <p v-if="error" class="ss-note danger"><i class="ri-error-warning-line"></i>{{ error }}</p>

    <div class="ss-actions">
      <div class="fs-seg"><button v-for="v in VIEWS" :key="v.key" type="button" :class="{ on: view === v.key }" :data-test="`fs-track-view-${v.key}`" @click="view = v.key">{{ v.title }}</button></div>
      <label class="ss-field inline"><span>{{ $t('搜索') }}</span><input v-model="keyword" type="text" :placeholder="$t('单号、流程名、处理人')" /></label>
      <span class="grow"></span>
      <button type="button" class="ss-btn sm" :disabled="busy" @click="checkNow"><i class="ri-notification-3-line"></i>{{ $t('现在检查一次提醒') }}</button>
    </div>

    <p v-if="!list.length" class="ss-empty">{{ view === 'closed' ? $t('还没有闭环的记录') : view === 'due' ? $t('今天没有到跟进日的流程') : $t('没有需要跟进的在途流程') }}</p>
    <article v-for="t in list" :key="t.key + t.firstSeenAt" class="fs-item" :class="{ due: isDue(t), closed: !!t.closedAt }" :data-test="`fs-track-${t.flowNo}`">
      <header>
        <span class="ss-chip">{{ t.system }}</span><strong>{{ t.flowNo }}</strong><span>{{ t.flowType }}</span><span v-if="t.title" class="ss-muted">{{ t.title }}</span>
        <span class="ss-chip" :class="isExternal(t) ? 'brand' : ''">{{ isExternal(t) ? $t('外部流转 · 每 {n} 天', { n: t.intervalDays }) : $t('内部 · 每 {n} 天', { n: t.intervalDays }) }}</span>
        <span v-if="t.closedAt" class="ss-chip ok">{{ $t('已闭环 {p0}', { p0: fmtDateTime(t.closedAt) }) }}</span>
        <span v-else-if="isDue(t)" class="ss-chip bad">{{ $t('该跟进了') }}</span>
        <span v-else class="ss-chip">{{ $t('下次跟进 {p0}', { p0: fmtDateTime(t.nextFollowAt) }) }}</span>
      </header>
      <p class="fs-facts">
        <span>{{ $t('在途 {p0} 天', { p0: fmtDays(t.days) }) }}</span><span>{{ $t('时效要求 {p0} 天', { p0: t.limitDays ?? '-' }) }}</span><span class="bad">{{ $t('超出 {p0} 天', { p0: fmtDays(t.overdueDays) }) }}</span>
        <span>{{ $t('当前节点：{p0}', { p0: t.currentNode || '-' }) }}</span><span v-if="t.currentNodeDays != null">{{ $t('节点停留 {p0} 天', { p0: fmtDays(t.currentNodeDays) }) }}</span>
        <span>{{ $t('处理人：{p0}', { p0: t.handler || '-' }) }}</span><span>{{ $t('发起人：{p0}', { p0: t.initiator || '-' }) }}</span>
      </p>
      <ul class="fs-notes">
        <li v-for="(n, i) in shownNotes(t)" :key="i" :class="n.kind"><time>{{ fmtDateTime(n.at) }}</time><i :class="n.kind === 'mail' ? 'ri-mail-send-line' : n.kind === 'note' ? 'ri-chat-1-line' : 'ri-robot-2-line'"></i><span>{{ n.text }}</span></li>
        <li v-if="t.notes.length > 4 && expanded !== t.key"><button type="button" class="ss-link" @click="expanded = t.key">{{ $t('看全部 {n} 条记录', { n: t.notes.length }) }}</button></li>
      </ul>
      <template v-if="!t.closedAt">
        <div class="ss-actions">
          <input v-model="drafts[t.key]" type="text" class="fs-note-input" :placeholder="$t('记一条处理进度（记完自动顺延下次跟进时间）')" :data-test="`fs-note-${t.flowNo}`" @keydown.enter.prevent="addNote(t)" />
          <button type="button" class="ss-btn sm primary" :disabled="busy || !(drafts[t.key] || '').trim()" :data-test="`fs-note-save-${t.flowNo}`" @click="addNote(t)"><i class="ri-add-line"></i>{{ $t('记进展') }}</button>
          <button type="button" class="ss-btn sm" :disabled="busy" @click="openMail(t)"><i class="ri-mail-send-line"></i>{{ $t('发送提醒') }}</button>
          <button type="button" class="ss-btn sm ghost" :disabled="busy" @click="close(t)"><i class="ri-check-double-line"></i>{{ $t('手工闭环') }}</button>
        </div>
        <div v-if="mail && mail.key === t.key" class="fs-mailbox">
          <label class="ss-field"><span>{{ $t('收件人（处理人邮箱）') }}</span><input v-model="mail.to" type="text" :placeholder="$t('花名册里没有邮箱，在这里填')" /></label>
          <label class="ss-field"><span>{{ $t('主题') }}</span><input v-model="mail.subject" type="text" /></label>
          <label class="ss-field"><span>{{ $t('正文') }}</span><textarea v-model="mail.body" rows="6"></textarea></label>
          <div class="ss-actions">
            <button type="button" class="ss-btn primary sm" :disabled="busy || !mail.to.trim()" data-test="fs-track-send" @click="sendMail(t)"><i :class="busy ? 'ri-loader-4-line spin' : 'ri-mail-send-line'"></i>{{ $t('确认发送') }}</button>
            <button type="button" class="ss-link" @click="mail = null">{{ $t('取消') }}</button>
          </div>
        </div>
      </template>
    </article>

    <section v-if="reminders.length" class="fs-card">
      <header><h3>{{ $t('最近的提醒') }}</h3><button type="button" class="ss-link" @click="clearReminders">{{ $t('清空') }}</button></header>
      <ul class="fs-notes">
        <li v-for="r in reminders.slice(0, 12)" :key="r.id"><time>{{ fmtDateTime(r.at) }}</time><i :class="r.type === 'follow_up' ? 'ri-route-line' : 'ri-book-2-line'"></i><span><b>{{ r.title }}</b><br />{{ r.body }}</span></li>
      </ul>
    </section>
  </div>
</template>

<script setup lang="ts">
/** 在途跟进：异常在途流程的跟进名单、进展记录、提醒邮件（人点发送）。到期提醒由主进程守护发出。 */
import { computed, reactive, ref } from 'vue';
import type { FsTrackItem } from '@totalclaw/ipc-contracts';
import { useNotificationStore } from '../../stores/notification';
import { t as i18nT } from '../../i18n';
import { errorMessage, fmtDateTime, fmtDays, fs, fsState, refreshState } from './shared';

type ViewKey = 'open' | 'due' | 'closed';
const VIEWS: Array<{ key: ViewKey; title: string }> = [{ key: 'open', title: i18nT('跟进中') }, { key: 'due', title: i18nT('今天该跟进') }, { key: 'closed', title: i18nT('已闭环') }];

const notif = useNotificationStore();
const view = ref<ViewKey>('open');
const keyword = ref('');
const busy = ref(false);
const error = ref('');
const expanded = ref('');
const drafts = reactive<Record<string, string>>({});
const mail = ref<{ key: string; to: string; subject: string; body: string } | null>(null);

const th = computed(() => fsState.value?.thresholds);
const all = computed(() => fsState.value?.tracking ?? []);
const reminders = computed(() => fsState.value?.reminders ?? []);
const open = computed(() => all.value.filter((t) => !t.closedAt));
const closed = computed(() => all.value.filter((t) => !!t.closedAt));
const isDue = (t: FsTrackItem): boolean => !t.closedAt && !!t.nextFollowAt && Date.parse(t.nextFollowAt) <= Date.now();
const isExternal = (t: FsTrackItem): boolean => t.intervalDays === (th.value?.externalDays ?? 7) && t.intervalDays !== (th.value?.internalDays ?? 3);
const due = computed(() => open.value.filter(isDue));
const list = computed(() => {
  const base = view.value === 'closed' ? closed.value : view.value === 'due' ? due.value : open.value;
  const k = keyword.value.trim().toLowerCase();
  return (k ? base.filter((t) => [t.flowNo, t.flowName, t.flowType, t.title, t.handler, t.initiator].some((x) => String(x || '').toLowerCase().includes(k))) : base).slice(0, 200);
});
const shownNotes = (t: FsTrackItem) => (expanded.value === t.key ? t.notes : t.notes.slice(-4));

async function act(fn: () => Promise<void>): Promise<void> {
  busy.value = true; error.value = '';
  try { await fn(); await refreshState(); } catch (e) { error.value = errorMessage(e); } finally { busy.value = false; }
}
async function addNote(t: FsTrackItem): Promise<void> {
  const text = (drafts[t.key] || '').trim();
  if (!text) return;
  await act(async () => { await fs('track.note', { key: t.key, text }); drafts[t.key] = ''; });
}
async function openMail(t: FsTrackItem): Promise<void> {
  await act(async () => {
    const p = await fs<{ to: string; subject: string; body: string }>('track.mailPreview', { key: t.key });
    mail.value = { key: t.key, ...p };
  });
}
async function sendMail(t: FsTrackItem): Promise<void> {
  const m = mail.value;
  if (!m || !window.confirm(i18nT('给 {p0} 发送进度提醒邮件？', { p0: m.to }))) return;
  await act(async () => {
    if (m.to.trim() !== t.handlerEmail) await fs('track.setEmail', { key: t.key, email: m.to.trim() });
    const r = await fs<{ via: string }>('track.remind', { key: t.key, subject: m.subject, body: m.body });
    mail.value = null;
    notif.success(r.via === 'official' ? i18nT('提醒已发送（经官方代发）') : i18nT('提醒已发送'));
  });
}
async function close(t: FsTrackItem): Promise<void> {
  const reason = window.prompt(i18nT('闭环原因（如：已线下办结）'), '');
  if (reason === null) return;
  await act(async () => { await fs('track.close', { key: t.key, reason }); });
}
async function checkNow(): Promise<void> {
  await act(async () => {
    const n = await fs<number>('reminders.check');
    notif.info(n ? i18nT('发出了 {n} 条提醒', { n }) : i18nT('现在没有新的到期提醒'));
  });
}
async function clearReminders(): Promise<void> { await act(async () => { await fs('reminders.clear'); }); }
</script>

<style scoped>
.fs-track { display: grid; gap: 12px; }
.fs-item { display: grid; gap: 8px; padding: 12px 14px; border: 1px solid var(--color-border); border-radius: 12px; background: var(--color-bg-card); }
.fs-item.due { border-color: color-mix(in srgb, var(--color-danger) 45%, var(--color-border)); }
.fs-item.closed { opacity: .75; }
.fs-item header { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; font-size: 13px; }
.fs-facts { margin: 0; display: flex; gap: 6px 16px; flex-wrap: wrap; font-size: 12.5px; color: var(--color-text-secondary); }
.fs-facts .bad, strong.bad { color: var(--color-danger); font-weight: 700; }
.fs-notes { list-style: none; margin: 0; padding: 0; display: grid; gap: 4px; font-size: 12.5px; }
.fs-notes li { display: flex; gap: 8px; align-items: baseline; color: var(--color-text-secondary); }
.fs-notes li.note { color: var(--color-text-primary); }
.fs-notes time { flex: 0 0 auto; font-variant-numeric: tabular-nums; font-size: 11.5px; }
.fs-note-input { flex: 1; min-width: 220px; height: 30px; border-radius: 8px; border: 1px solid var(--color-border); background: var(--color-bg-input, var(--color-bg-primary)); color: var(--color-text-primary); font: inherit; font-size: 12.5px; padding: 0 10px; }
.fs-mailbox { display: grid; gap: 8px; padding: 10px; border: 1px dashed var(--color-border); border-radius: 10px; }
.fs-card { border: 1px solid var(--color-border); border-radius: 14px; background: var(--color-bg-card); padding: 14px; display: grid; gap: 10px; }
.fs-card header { display: flex; align-items: center; justify-content: space-between; }
.fs-card h3 { margin: 0; font-size: 14px; }
.fs-seg { display: inline-flex; border: 1px solid var(--color-border); border-radius: 8px; overflow: hidden; }
.fs-seg button { height: 30px; padding: 0 12px; border: none; background: var(--color-bg-card); color: var(--color-text-secondary); font: inherit; font-size: 12px; font-weight: 700; cursor: pointer; }
.fs-seg button.on { background: var(--color-brand); color: #fff; }
.spin { animation: fs-spin 1s linear infinite; }
@keyframes fs-spin { to { transform: rotate(360deg); } }
</style>
