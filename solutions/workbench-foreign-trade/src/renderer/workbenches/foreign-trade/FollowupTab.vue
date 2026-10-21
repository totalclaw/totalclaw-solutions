<template>
  <div class="ss-module">
    <ModuleHeader :meta="meta" />

    <section class="ss-rules">
      <h4><i class="ri-alarm-line"></i>{{ $t('跟进规则') }}</h4>
      <div class="ss-rule-row">
        <span class="lbl">{{ $t('询盘收到后') }}</span>
        <input type="number" min="1" :value="rules?.inquiryNoReplyHours" @change="patchRule('inquiryNoReplyHours', $event)" />
        <span class="lbl">{{ $t('小时未回复') }}</span>
      </div>
      <div class="ss-rule-row">
        <span class="lbl">{{ $t('报价发出后') }}</span>
        <input type="number" min="1" :value="rules?.quoteNoReplyDays" @change="patchRule('quoteNoReplyDays', $event)" />
        <span class="lbl">{{ $t('天客户没回信') }}</span>
      </div>
      <div class="ss-rule-row">
        <span class="lbl">{{ $t('超过') }}</span>
        <input type="number" min="1" :value="rules?.silentDays" @change="patchRule('silentDays', $event)" />
        <span class="lbl">{{ $t('天没有往来算沉默客户') }}</span>
      </div>
    </section>

    <StickyProgress :title="$t('客户跟进')" :metas="metas" :runtime="runtime" :current-key="currentKey" @jump="scrollTo" />

    <div class="ss-steps">
      <StepCard step-key="history" :index="0" :title="metas[0].title" :hint="metas[0].hint" :runtime="runtime.history">
        <div class="ss-kpis">
          <div class="ss-kpi"><small>{{ $t('收到邮件') }}</small><strong>{{ counts.inbound }}</strong></div>
          <div class="ss-kpi"><small>{{ $t('发出邮件') }}</small><strong>{{ counts.outbound }}</strong></div>
          <div class="ss-kpi"><small>{{ $t('客户数') }}</small><strong>{{ counts.customers }}</strong></div>
          <div class="ss-kpi"><small>{{ $t('已发报价') }}</small><strong>{{ counts.quotes }}</strong></div>
        </div>
      </StepCard>

      <StepCard step-key="scan" :index="1" :title="metas[1].title" :hint="metas[1].hint" :runtime="runtime.scan">
        <div class="ss-actions">
          <button type="button" class="ss-btn primary" :disabled="!!busy" @click="scan">
            <i :class="busy === 'scan' ? 'ri-loader-4-line spin' : 'ri-search-line'"></i>{{ $t('找出今天该跟进的客户') }}
          </button>
          <span v-if="scannedAt" class="ss-muted">{{ $t('上次检查：{p0}', { p0: fmtDateTime(scannedAt) }) }}</span>
        </div>
        <div v-if="items.length" class="ss-table-wrap">
          <table class="ss-table">
            <thead><tr><th>{{ $t('客户') }}</th><th>{{ $t('原因') }}</th><th>{{ $t('起算时间') }}</th><th>{{ $t('最近往来') }}</th><th>{{ $t('邮箱') }}</th><th></th></tr></thead>
            <tbody>
              <tr v-for="it in items" :key="it.key" :class="{ 'ft-active': it.key === activeKey }">
                <td><button type="button" class="ss-link" @click="selectItem(it)"><strong>{{ it.customerName }}</strong></button><div class="ss-muted">{{ it.customerEmail }}</div></td>
                <td><span class="ss-chip" :class="reasonClass(it.reason)">{{ reasonLabel(it.reason) }}</span></td>
                <td>{{ fmtDateTime(it.since) }}</td>
                <td>{{ it.lastContactAt ? fmtDateTime(it.lastContactAt) : '—' }}<div class="ss-muted ft-wrap">{{ it.lastSubject }}</div></td>
                <td>{{ mailboxName(ftState, it.mailboxId) || '—' }}</td>
                <td><span v-if="sentKeys[it.key]" class="ss-chip ok">{{ $t('已发送') }}</span><span v-else-if="drafts[it.key]" class="ss-chip brand">{{ $t('已写草稿') }}</span></td>
              </tr>
            </tbody>
          </table>
        </div>
        <p v-else-if="scannedAt" class="ss-note ok"><i class="ri-check-line"></i>{{ $t('目前没有需要跟进的客户') }}</p>
      </StepCard>

      <StepCard step-key="draft" :index="2" :title="metas[2].title" :hint="metas[2].hint" :runtime="runtime.draft">
        <template v-if="active">
          <div class="ss-actions">
            <strong>{{ active.customerName }}</strong>
            <span class="ss-chip" :class="reasonClass(active.reason)">{{ reasonLabel(active.reason) }}</span>
            <span class="grow"></span>
            <button type="button" class="ss-btn primary" :disabled="!!busy" @click="draft(active)">
              <i :class="busy === 'draft' ? 'ri-loader-4-line spin' : 'ri-quill-pen-line'"></i>{{ drafts[active.key] ? $t('重新生成') : $t('生成跟进草稿') }}
            </button>
          </div>
          <div class="ft-timeline">
            <div class="ss-subhead">{{ $t('往来记录') }}</div>
            <ul>
              <li v-for="(t, i) in timeline" :key="i">
                <span class="ss-chip" :class="timelineClass(t.kind)">{{ timelineLabel(t.kind) }}</span>
                <span class="ss-muted">{{ fmtDateTime(t.at) }}</span>
                <span>{{ t.subject }}</span>
              </li>
              <li v-if="!timeline.length" class="ss-muted">{{ $t('没有往来记录') }}</li>
            </ul>
          </div>
          <template v-if="drafts[active.key]">
            <p class="ss-muted">{{ $t('由 {p0} 撰写', { p0: modelLabel(drafts[active.key].model) }) }}</p>
            <label class="ss-field"><span>{{ $t('收件人') }}</span><input v-model="editor.to" type="text" /></label>
            <label class="ss-field"><span>{{ $t('标题') }}</span><input v-model="editor.subject" type="text" /></label>
            <label class="ss-field"><span>{{ $t('正文') }}</span><textarea v-model="editor.body" rows="10"></textarea></label>
          </template>
          <GateIssues :result="gate" :opt-out-line="ftState?.settings.sendRules.optOutLine" @fix-opt-out="(line) => (editor.body = `${editor.body.trimEnd()}\n\n${line}`)" />
        </template>
        <p v-else class="ss-empty">{{ $t('在上一步的列表里点一个客户') }}</p>
      </StepCard>

      <StepCard step-key="send" :index="3" :title="metas[3].title" :hint="metas[3].hint" :runtime="runtime.send">
        <div class="ss-actions">
          <span class="ss-muted">{{ $t('发件邮箱') }}</span>
          <select v-model="mailboxId" class="ft-select">
            <option value="">{{ $t('请选择') }}</option>
            <option v-for="m in enabledMailboxes(ftState)" :key="m.id" :value="m.id">{{ m.label || m.address }}</option>
          </select>
          <span class="grow"></span>
          <button type="button" class="ss-btn primary" :disabled="!active || !drafts[active.key] || !mailboxId || busy === 'send'" @click="send">
            <i :class="busy === 'send' ? 'ri-loader-4-line spin' : 'ri-send-plane-line'"></i>{{ $t('发送') }}
          </button>
        </div>
      </StepCard>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 客户跟进：汇总往来记录 → 按规则找出待跟进 → 生成跟进草稿 → 确认发送。
 */
import { computed, reactive, ref } from 'vue';
import type { FtDraft, FtFollowupItem, FtGateResult, FtFollowupReason, FtFollowupRules, FtTimelineEntry } from '@totalclaw/ipc-contracts';
import { useNotificationStore } from '../../stores/notification';
import { t as i18nT } from '../../i18n';
import StepCard from '../service-settlement/StepCard.vue';
import StickyProgress from '../service-settlement/StickyProgress.vue';
import { scrollToStep, type StepMeta, type StepRuntime } from '../service-settlement/shared';
import ModuleHeader from './ModuleHeader.vue';
import GateIssues from './GateIssues.vue';
import {
  checkBeforeSend, enabledMailboxes, errorMessage, fmtDateTime, ft, ftState, mailboxName, modelLabel, refreshState,
  splitEmails, type FtModuleMeta,
} from './shared';

defineProps<{ meta: FtModuleMeta; focus?: Record<string, unknown> | null }>();
defineEmits<{ (e: 'goto', module: string, payload: any): void }>();
const notif = useNotificationStore();

const busy = ref('');
const errors = ref<Record<string, string>>({});
const items = ref<FtFollowupItem[]>([]);
const scannedAt = ref('');
const activeKey = ref('');
const timeline = ref<FtTimelineEntry[]>([]);
const drafts = reactive<Record<string, FtDraft>>({});
const sentKeys = reactive<Record<string, boolean>>({});
const editor = reactive({ to: '', subject: '', body: '' });
const mailboxId = ref('');
const gate = ref<FtGateResult | null>(null);

const rules = computed(() => ftState.value?.settings.followupRules);
const active = computed(() => items.value.find((x) => x.key === activeKey.value) || null);
const counts = computed(() => {
  const s = ftState.value;
  const msgs = s?.messages || [];
  return {
    inbound: msgs.filter((m) => m.direction === 'in').length,
    outbound: msgs.filter((m) => m.direction === 'out').length,
    customers: new Set((s?.inquiries || []).map((q) => q.customerEmail)).size,
    quotes: (s?.quotes || []).filter((q) => q.status === 'sent').length,
  };
});

const metas: StepMeta[] = [
  { key: 'history', title: i18nT('汇总往来记录'), hint: i18nT('所有接管邮箱的收发邮件、报价、订单按客户归到一起') },
  { key: 'scan', title: i18nT('找出待跟进'), hint: i18nT('按规则找出询盘未回、报价未回和沉默的客户') },
  { key: 'draft', title: i18nT('生成跟进草稿'), hint: i18nT('结合往来记录写跟进邮件，不擅自降价') },
  { key: 'send', title: i18nT('确认发送'), hint: i18nT('业务员修改确认后发出') },
];
const runtime = computed<Record<string, StepRuntime>>(() => {
  const st = (key: string, done: boolean, summary?: string): StepRuntime => (busy.value === key
    ? { state: 'running' }
    : errors.value[key] ? { state: 'failed', error: errors.value[key] }
      : done ? { state: 'done', summary } : { state: 'todo' });
  return {
    history: st('history', counts.value.inbound + counts.value.outbound > 0, i18nT('{n} 位客户', { n: counts.value.customers })),
    scan: st('scan', !!scannedAt.value, i18nT('{n} 位待跟进', { n: items.value.length })),
    draft: st('draft', Object.keys(drafts).length > 0, i18nT('{n} 份草稿', { n: Object.keys(drafts).length })),
    send: st('send', Object.keys(sentKeys).length > 0, i18nT('已发 {n} 封', { n: Object.keys(sentKeys).length })),
  };
});
const currentKey = computed(() => metas.find((m) => runtime.value[m.key].state !== 'done')?.key || 'send');

function reasonLabel(r: FtFollowupReason): string {
  return { inquiry_unanswered: i18nT('询盘未回复'), quote_no_reply: i18nT('报价未回复'), silent: i18nT('沉默客户') }[r];
}
function reasonClass(r: FtFollowupReason): string {
  return r === 'inquiry_unanswered' ? 'bad' : r === 'quote_no_reply' ? 'warn' : '';
}
function timelineLabel(k: FtTimelineEntry['kind']): string {
  return { in: i18nT('客户来信'), out: i18nT('我方发出'), quote: i18nT('报价'), order: i18nT('订单') }[k];
}
function timelineClass(k: FtTimelineEntry['kind']): string {
  return k === 'in' ? 'brand' : k === 'out' ? 'ok' : 'warn';
}

async function run(key: string, fn: () => Promise<unknown>): Promise<boolean> {
  busy.value = key;
  errors.value = { ...errors.value, [key]: '' };
  void scrollToStep(key);
  try {
    await fn();
    return true;
  } catch (e) {
    errors.value = { ...errors.value, [key]: errorMessage(e) };
    return false;
  } finally {
    busy.value = '';
  }
}
async function patchRule(key: keyof FtFollowupRules, ev: Event): Promise<void> {
  const v = Number((ev.target as HTMLInputElement).value);
  if (!(v > 0) || !rules.value) return;
  try {
    await ft('settings.patch', { patch: { followupRules: { ...rules.value, [key]: v } } });
    await refreshState();
  } catch (e) { notif.error(errorMessage(e)); }
}
async function scan(): Promise<void> {
  await run('scan', async () => {
    items.value = await ft<FtFollowupItem[]>('followup.scan');
    scannedAt.value = new Date().toISOString();
    if (activeKey.value && !items.value.some((x) => x.key === activeKey.value)) activeKey.value = '';
  });
}
async function selectItem(it: FtFollowupItem): Promise<void> {
  activeKey.value = it.key;
  gate.value = null;
  mailboxId.value = it.mailboxId || mailboxId.value;
  const d = drafts[it.key];
  Object.assign(editor, { to: it.customerEmail, subject: d?.subject || '', body: d?.body || '' });
  try { timeline.value = await ft<FtTimelineEntry[]>('followup.timeline', { email: it.customerEmail }); } catch { timeline.value = []; }
  void scrollToStep('draft');
}
async function draft(it: FtFollowupItem): Promise<void> {
  await run('draft', async () => {
    const d = await ft<FtDraft>('followup.draft', { item: it });
    drafts[it.key] = d;
    Object.assign(editor, { to: it.customerEmail, subject: d.subject, body: d.body });
  });
}
async function send(): Promise<void> {
  const it = active.value;
  if (!it || !mailboxId.value) return;
  const to = splitEmails(editor.to);
  if (!to.length) { notif.warn(i18nT('请填写收件人')); return; }
  const item = { key: it.key, reason: it.reason, since: it.since, refId: it.refId };
  let approvedHash: string | null;
  try {
    const r = await checkBeforeSend({ kind: 'followup', mailboxId: mailboxId.value, to, subject: editor.subject, body: editor.body, refId: it.key, item }, mailboxName(ftState.value, mailboxId.value));
    gate.value = r.result;
    approvedHash = r.hash;
  } catch (err) { notif.error(errorMessage(err)); return; }
  if (!approvedHash) return;
  const ok = await run('send', async () => {
    await ft('followup.send', { mailboxId: mailboxId.value, to, subject: editor.subject, body: editor.body, approvedHash, item });
    sentKeys[it.key] = true;
    await refreshState();
  });
  if (ok) notif.success(i18nT('已发送'));
}
function scrollTo(key: string): void { void scrollToStep(key); }
</script>

<style scoped>
.ft-select { height: 30px; border-radius: 8px; border: 1px solid var(--color-border); background: var(--color-bg-input, var(--color-bg-primary)); color: var(--color-text-primary); font: inherit; font-size: 12px; max-width: 260px; }
.ft-wrap { white-space: normal !important; max-width: 260px; }
.ft-active td { background: color-mix(in srgb, var(--color-brand) 8%, transparent); }
.ft-timeline ul { list-style: none; margin: 6px 0 0; padding: 0; display: grid; gap: 5px; font-size: 12.5px; max-height: 220px; overflow: auto; }
.ft-timeline li { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
</style>
