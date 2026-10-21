<template>
  <div class="ss-module">
    <ModuleHeader :meta="meta" />

    <!-- 自动处理规则 -->
    <section class="ss-rules">
      <h4><i class="ri-robot-2-line"></i>{{ $t('自动处理') }}</h4>
      <div class="ss-rule-row">
        <label class="ft-check"><input type="checkbox" :checked="settings?.autoExtract" @change="patch({ autoExtract: ($event.target as HTMLInputElement).checked })" />{{ $t('新询盘到达后自动提取信息并分类') }}</label>
      </div>
      <div class="ss-rule-row">
        <span class="lbl">{{ $t('自动回复（只对打开了「自动回复」的邮箱生效）：') }}</span>
        <select :value="settings?.autoReply.mode" @change="patch({ autoReply: { ...settings!.autoReply, mode: ($event.target as HTMLSelectElement).value as any } })">
          <option value="ack">{{ $t('只发确认收到 + 澄清问题（不报价）') }}</option>
          <option value="full">{{ $t('发完整回复（介绍产品、提问、说明下一步，不写价格）') }}</option>
        </select>
        <span class="lbl">{{ $t('意向至少') }}</span>
        <select :value="settings?.autoReply.minIntent" @change="patch({ autoReply: { ...settings!.autoReply, minIntent: ($event.target as HTMLSelectElement).value as any } })">
          <option value="high">{{ $t('高') }}</option><option value="medium">{{ $t('中') }}</option><option value="low">{{ $t('低') }}</option>
        </select>
        <label class="ft-check"><input type="checkbox" :checked="settings?.autoReply.skipSpam" @change="patch({ autoReply: { ...settings!.autoReply, skipSpam: ($event.target as HTMLInputElement).checked } })" />{{ $t('垃圾询盘不回') }}</label>
      </div>
      <p class="ss-muted">{{ $t('已开启自动回复的邮箱：{p0}', { p0: autoMailboxes || $t('无（在顶部「邮箱接管」里给邮箱打开）') }) }}</p>
    </section>

    <div class="ft-split">
      <!-- 询盘列表 -->
      <aside class="ft-list">
        <div class="ss-actions">
          <select v-model="filterMailbox" class="ft-select">
            <option value="">{{ $t('全部邮箱') }}</option>
            <option v-for="m in state?.mailboxes || []" :key="m.id" :value="m.id">{{ m.label || m.address }}</option>
          </select>
          <select v-model="filterStatus" class="ft-select">
            <option value="">{{ $t('全部状态') }}</option>
            <option v-for="s in STATUSES" :key="s" :value="s">{{ statusLabel(s) }}</option>
          </select>
          <button type="button" class="ss-btn sm ghost" :disabled="!newCount" @click="processNew"><i class="ri-play-line"></i>{{ $t('处理未提取的 {n} 条', { n: newCount }) }}</button>
        </div>
        <ul>
          <li v-for="q in list" :key="q.id" :class="{ active: q.id === selectedId }" @click="selectedId = q.id">
            <div class="ft-list__top">
              <strong>{{ q.company || q.customerName }}</strong>
              <span class="ss-chip" :class="statusClass(q.status)">{{ statusLabel(q.status) }}</span>
            </div>
            <div class="ft-list__sub">{{ q.subject || $t('（无标题）') }}</div>
            <div class="ft-list__meta">
              <span>{{ mailboxName(state, q.mailboxId) }}</span>
              <span>{{ fmtDateTime(q.receivedAt) }}</span>
              <span v-if="q.category" class="ss-chip" :class="intentClass(q.category.intent)">{{ $t('意向') }}{{ intentLabel(q.category.intent) }}</span>
              <span v-if="q.autoReply?.sent" class="ss-chip ok">{{ $t('已自动回复') }}</span>
            </div>
          </li>
          <li v-if="!list.length" class="ss-empty">{{ state?.mailboxes.length ? $t('还没有询盘。新邮件每 2 分钟收取一次，也可以在顶部「邮箱接管」里立即收取。') : $t('先在顶部「邮箱接管」里添加邮箱。') }}</li>
        </ul>
      </aside>

      <!-- 选中询盘的分步处理 -->
      <section v-if="current" class="ft-detail">
        <StickyProgress :title="$t('询盘处理')" :metas="metas" :runtime="runtime" :current-key="currentKey" @jump="scrollTo" />
        <div class="ss-steps">
          <StepCard step-key="receive" :index="0" :title="metas[0].title" :hint="metas[0].hint" :runtime="runtime.receive">
            <div class="ft-mail" v-for="m in messages" :key="m.id">
              <div class="ft-mail__head">
                <span class="ss-chip" :class="m.direction === 'in' ? 'brand' : 'ok'">{{ m.direction === 'in' ? $t('客户来信') : $t('我方发出') }}</span>
                <strong>{{ m.subject }}</strong>
                <span class="ss-muted">{{ m.from }} · {{ fmtDateTime(m.at) }}</span>
              </div>
              <pre class="ft-body">{{ m.body.slice(0, 3000) }}</pre>
              <div v-if="m.attachments.length" class="ss-actions">
                <button v-for="a in m.attachments" :key="a.path" type="button" class="ss-btn sm ghost" @click="open(a.path)"><i class="ri-attachment-2"></i>{{ a.name }}</button>
              </div>
            </div>
          </StepCard>

          <StepCard step-key="extract" :index="1" :title="metas[1].title" :hint="metas[1].hint" :runtime="runtime.extract">
            <div class="ss-actions">
              <button type="button" class="ss-btn primary" :disabled="busy === 'extract'" @click="run('extract', () => ft('inquiry.extract', { id: current!.id }))">
                <i :class="busy === 'extract' ? 'ri-loader-4-line spin' : 'ri-magic-line'"></i>{{ current.extractedAt ? $t('重新提取') : $t('提取信息') }}
              </button>
              <span v-if="current.model" class="ss-muted">{{ $t('由 {p0} 提取', { p0: modelLabel(current.model) }) }}</span>
            </div>
            <div v-if="current.fields.length" class="ss-table-wrap">
              <table class="ss-table">
                <thead><tr><th>{{ $t('字段') }}</th><th>{{ $t('内容') }}</th><th>{{ $t('原文依据') }}</th><th>{{ $t('出处') }}</th></tr></thead>
                <tbody>
                  <tr v-for="f in current.fields" :key="f.key + f.value">
                    <td>{{ f.label }}</td><td><strong>{{ f.value }}</strong></td>
                    <td class="ft-quote"><span :class="f.verified ? '' : 'ft-unverified'" :title="f.verified ? '' : $t('原文里没有找到这句，请人工核对')">{{ f.quote || '—' }}</span></td>
                    <td>{{ f.source || '—' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div v-if="current.items.length" class="ss-table-wrap">
              <table class="ss-table">
                <thead><tr><th>{{ $t('产品') }}</th><th>{{ $t('型号') }}</th><th>{{ $t('规格') }}</th><th class="num">{{ $t('数量') }}</th></tr></thead>
                <tbody><tr v-for="(it, i) in current.items" :key="i"><td>{{ it.product }}</td><td>{{ it.model || '—' }}</td><td>{{ it.spec || '—' }}</td><td class="num">{{ it.quantity || '—' }} {{ it.unit || '' }}</td></tr></tbody>
              </table>
            </div>
          </StepCard>

          <StepCard step-key="classify" :index="2" :title="metas[2].title" :hint="metas[2].hint" :runtime="runtime.classify">
            <div v-if="current.category" class="ss-kpis">
              <div class="ss-kpi"><small>{{ $t('产品线') }}</small><strong>{{ current.category.productLine }}</strong></div>
              <div class="ss-kpi"><small>{{ $t('信息完整度') }}</small><strong>{{ completenessLabel(current.category.completeness) }}</strong></div>
              <div class="ss-kpi accent"><small>{{ $t('意向') }}</small><strong>{{ intentLabel(current.category.intent) }}</strong></div>
              <div class="ss-kpi"><small>{{ $t('垃圾询盘') }}</small><strong>{{ current.category.spam ? $t('是') : $t('否') }}</strong></div>
              <div v-if="current.category.replyType" class="ss-kpi" data-test="ft-reply-type"><small>{{ $t('来信类型') }}</small><strong>{{ replyTypeLabel(current.category.replyType) }}</strong></div>
            </div>
            <p v-if="current.category?.reason" class="ss-note info"><i class="ri-information-line"></i>{{ current.category.reason }}</p>
            <div v-if="current.questions.length">
              <div class="ss-subhead">{{ $t('需要向客户澄清') }}</div>
              <ol class="ft-ol"><li v-for="(x, i) in current.questions" :key="i">{{ x }}</li></ol>
            </div>
            <div class="ss-actions">
              <span class="ss-muted">{{ $t('人工判断：') }}</span>
              <button type="button" class="ss-btn sm" @click="setStatus('spam')"><i class="ri-spam-2-line"></i>{{ $t('标为垃圾') }}</button>
              <button type="button" class="ss-btn sm" @click="setStatus('closed')"><i class="ri-archive-line"></i>{{ $t('不跟进，关闭') }}</button>
              <button v-if="['spam', 'closed'].includes(current.status)" type="button" class="ss-btn sm" @click="setStatus('extracted')"><i class="ri-arrow-go-back-line"></i>{{ $t('恢复') }}</button>
              <span class="grow"></span>
              <button type="button" class="ss-btn sm ghost" @click="$emit('goto', 'background', { company: current.company || '', email: current.customerEmail, country: current.country || '', inquiryId: current.id })"><i class="ri-shield-user-line"></i>{{ $t('去背调这个客户') }}</button>
              <button type="button" class="ss-btn sm ghost" :disabled="!current.items.length" @click="$emit('goto', 'quote', { inquiryId: current.id })"><i class="ri-price-tag-3-line"></i>{{ $t('去报价') }}</button>
            </div>
          </StepCard>

          <StepCard step-key="draft" :index="3" :title="metas[3].title" :hint="metas[3].hint" :runtime="runtime.draft">
            <div class="ss-actions">
              <button type="button" class="ss-btn" :disabled="busy === 'draft'" @click="draft('ack')"><i :class="busy === 'draft' ? 'ri-loader-4-line spin' : 'ri-chat-check-line'"></i>{{ $t('写确认回复') }}</button>
              <button type="button" class="ss-btn primary" :disabled="busy === 'draft'" @click="draft('full')"><i :class="busy === 'draft' ? 'ri-loader-4-line spin' : 'ri-quill-pen-line'"></i>{{ $t('写完整回复') }}</button>
              <span v-if="current.replyDraft" class="ss-muted">{{ $t('由 {p0} 撰写', { p0: modelLabel(current.replyDraft.model) }) }}</span>
            </div>
            <p v-if="current.autoReply" class="ss-note" :class="current.autoReply.sent ? 'ok' : 'warn'">
              <i :class="current.autoReply.sent ? 'ri-check-line' : 'ri-information-line'"></i>
              {{ current.autoReply.sent ? $t('已于 {p0} 自动回复', { p0: fmtDateTime(current.autoReply.at) }) : current.autoReply.blocked?.length ? $t('自动回复被发信闸门拦下（{p0}）', { p0: fmtDateTime(current.autoReply.at) }) : $t('没有自动回复：{p0}', { p0: current.autoReply.reason || '' }) }}
            </p>
            <GateIssues v-if="current.autoReply?.blocked?.length" :result="{ ok: false, issues: current.autoReply.blocked, hash: '', sentToday: 0, dailyLimit: 0 }" :hide-quota="true" />
            <template v-if="editor">
              <label class="ss-field"><span>{{ $t('收件人') }}</span><input v-model="editor.to" type="text" /></label>
              <label class="ss-field"><span>{{ $t('标题') }}</span><input v-model="editor.subject" type="text" /></label>
              <label class="ss-field"><span>{{ $t('正文') }}</span><textarea v-model="editor.body" rows="12"></textarea></label>
            </template>
            <GateIssues :result="gate" />
          </StepCard>

          <StepCard step-key="send" :index="4" :title="metas[4].title" :hint="metas[4].hint" :runtime="runtime.send">
            <div class="ss-actions">
              <span class="ss-muted">{{ $t('从收到询盘的邮箱发出：{p0}', { p0: mailboxName(state, current.mailboxId) }) }}</span>
              <span class="grow"></span>
              <button type="button" class="ss-btn primary" :disabled="!editor || busy === 'send'" @click="send"><i :class="busy === 'send' ? 'ri-loader-4-line spin' : 'ri-send-plane-line'"></i>{{ $t('发送') }}</button>
            </div>
            <p v-if="current.repliedAt" class="ss-note ok"><i class="ri-check-line"></i>{{ $t('已于 {p0} 回复', { p0: fmtDateTime(current.repliedAt) }) }}</p>
          </StepCard>
        </div>
      </section>
      <section v-else class="ft-detail ss-empty">{{ $t('在左侧选择一个询盘') }}</section>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 新询盘处理：多个邮箱的询盘汇到一处 → 提取（带原文依据）→ 分类 → 回复草稿 → 人工确认发送；
 * 打开了自动回复的邮箱按规则自动回。
 */
import { computed, ref, watch } from 'vue';
import type { FtGateResult, FtInquiry, FtReplyType, FtSettings } from '@totalclaw/ipc-contracts';
import { useNotificationStore } from '../../stores/notification';
import { t as i18nT } from '../../i18n';
import StepCard from '../service-settlement/StepCard.vue';
import StickyProgress from '../service-settlement/StickyProgress.vue';
import { scrollToStep, type StepMeta, type StepRuntime } from '../service-settlement/shared';
import ModuleHeader from './ModuleHeader.vue';
import GateIssues from './GateIssues.vue';
import {
  checkBeforeSend, errorMessage, fmtDateTime, ft, ftState, mailboxName, modelLabel, refreshState, splitEmails, type FtModuleMeta,
} from './shared';

const props = defineProps<{ meta: FtModuleMeta; focus?: { inquiryId?: string } | null }>();
defineEmits<{ (e: 'goto', module: string, payload: any): void }>();
const notif = useNotificationStore();
const state = ftState;
const settings = computed(() => state.value?.settings);

const STATUSES: FtInquiry['status'][] = ['new', 'extracted', 'replied', 'quoted', 'closed', 'spam'];
const filterMailbox = ref('');
const filterStatus = ref('');
const selectedId = ref('');
const busy = ref('');
const errors = ref<Record<string, string>>({});
const editor = ref<{ to: string; subject: string; body: string } | null>(null);
const gate = ref<FtGateResult | null>(null);

const list = computed(() => (state.value?.inquiries || [])
  .filter((q) => !filterMailbox.value || q.mailboxId === filterMailbox.value)
  .filter((q) => !filterStatus.value || q.status === filterStatus.value)
  .slice().sort((a, b) => b.receivedAt.localeCompare(a.receivedAt)));
const newCount = computed(() => (state.value?.inquiries || []).filter((q) => q.status === 'new' && !q.extractedAt).length);
const current = computed(() => state.value?.inquiries.find((q) => q.id === selectedId.value) || null);
const messages = computed(() => (current.value?.messageIds || []).map((id) => state.value?.messages.find((m) => m.id === id)).filter(Boolean) as NonNullable<typeof state.value>['messages']);
const autoMailboxes = computed(() => (state.value?.mailboxes || []).filter((m) => m.autoReply && m.enabled).map((m) => m.label || m.address).join(i18nT('、')));

watch(() => props.focus?.inquiryId, (id) => { if (id) selectedId.value = id; }, { immediate: true });
watch(list, (l) => { if (!selectedId.value && l.length) selectedId.value = l[0].id; }, { immediate: true });
watch(() => current.value?.id, () => {
  errors.value = {};
  gate.value = null;
  const d = current.value?.replyDraft;
  editor.value = d && current.value ? { to: current.value.customerEmail, subject: d.subject, body: d.body } : null;
});
watch(() => current.value?.replyDraft?.at, () => {
  const d = current.value?.replyDraft;
  if (d && current.value) editor.value = { to: current.value.customerEmail, subject: d.subject, body: d.body };
});

const metas: StepMeta[] = [
  { key: 'receive', title: i18nT('收件'), hint: i18nT('多个邮箱的来信按客户归并成一个询盘，附件一起收下') },
  { key: 'extract', title: i18nT('信息提取'), hint: i18nT('产品、数量、目的港、贸易术语、付款方式等，每项附原文依据') },
  { key: 'classify', title: i18nT('分类与判断'), hint: i18nT('产品线、完整度、意向、是否垃圾询盘；列出要问客户的问题') },
  { key: 'draft', title: i18nT('回复草稿'), hint: i18nT('用客户的语言起草回复，不写价格') },
  { key: 'send', title: i18nT('确认发送'), hint: i18nT('从收到询盘的邮箱发出，人确认后才发') },
];
const runtime = computed<Record<string, StepRuntime>>(() => {
  const q = current.value;
  const st = (key: string, done: boolean, summary?: string): StepRuntime => (busy.value === key
    ? { state: 'running' }
    : errors.value[key] ? { state: 'failed', error: errors.value[key] }
      : done ? { state: 'done', summary } : { state: 'todo' });
  return {
    receive: st('receive', !!q, q ? i18nT('{n} 封邮件', { n: q.messageIds.length }) : ''),
    extract: st('extract', !!q?.extractedAt, q?.extractedAt ? i18nT('{a} 个字段、{b} 个产品', { a: q.fields.length, b: q.items.length }) : ''),
    classify: st('classify', !!q?.category, q?.category ? `${q.category.productLine} · ${intentLabel(q.category.intent)}` : ''),
    draft: st('draft', !!q?.replyDraft),
    send: st('send', !!q && ['replied', 'quoted'].includes(q.status)),
  };
});
const currentKey = computed(() => metas.find((m) => runtime.value[m.key].state !== 'done')?.key || 'send');

function statusLabel(s: FtInquiry['status']): string {
  return { new: i18nT('新询盘'), extracted: i18nT('已整理'), replied: i18nT('已回复'), quoted: i18nT('已报价'), closed: i18nT('已关闭'), spam: i18nT('垃圾询盘') }[s];
}
function statusClass(s: FtInquiry['status']): string {
  return s === 'new' ? 'warn' : s === 'spam' || s === 'closed' ? '' : s === 'extracted' ? 'brand' : 'ok';
}
function intentLabel(i: 'high' | 'medium' | 'low'): string { return { high: i18nT('高'), medium: i18nT('中'), low: i18nT('低') }[i]; }
function intentClass(i: 'high' | 'medium' | 'low'): string { return i === 'high' ? 'ok' : i === 'medium' ? 'warn' : ''; }
function replyTypeLabel(t: FtReplyType): string {
  return {
    do_not_contact: i18nT('要求不再联系'), not_now: i18nT('暂不需要'), has_supplier: i18nT('已有供应商'), info_request: i18nT('索要资料'),
    sample_request: i18nT('要样品'), quote_request: i18nT('要报价'), meeting_request: i18nT('约通话 / 会面'), order_intent: i18nT('要下单'),
    wrong_contact: i18nT('找错人'), other: i18nT('其它'),
  }[t] || t;
}
function completenessLabel(c: string): string { return ({ complete: i18nT('完整'), partial: i18nT('部分缺失'), poor: i18nT('信息很少') } as Record<string, string>)[c] || c; }

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
async function patch(p: Partial<FtSettings>): Promise<void> {
  try { await ft('settings.patch', { patch: p }); await refreshState(); } catch (e) { notif.error(errorMessage(e)); }
}
async function setStatus(status: FtInquiry['status']): Promise<void> {
  if (!current.value) return;
  try { await ft('inquiry.update', { id: current.value.id, patch: { status } }); await refreshState(); } catch (e) { notif.error(errorMessage(e)); }
}
async function processNew(): Promise<void> {
  try {
    const n = await ft<number>('inquiry.processNew');
    notif.info(i18nT('已开始处理 {n} 条询盘，完成后自动刷新', { n }));
  } catch (e) { notif.error(errorMessage(e)); }
}
async function draft(mode: 'ack' | 'full'): Promise<void> {
  if (!current.value) return;
  await run('draft', () => ft('inquiry.draft', { id: current.value!.id, mode }));
}
async function send(): Promise<void> {
  const q = current.value;
  const e = editor.value;
  if (!q || !e) return;
  const to = splitEmails(e.to);
  let approvedHash: string | null;
  try {
    const r = await checkBeforeSend({ kind: 'inquiry_reply', mailboxId: q.mailboxId, to, subject: e.subject, body: e.body, refId: q.id }, mailboxName(state.value, q.mailboxId));
    gate.value = r.result;
    approvedHash = r.hash;
  } catch (err) { notif.error(errorMessage(err)); return; }
  if (!approvedHash) return;
  const ok = await run('send', () => ft('inquiry.send', { id: q.id, subject: e.subject, body: e.body, to, approvedHash }));
  if (ok) notif.success(i18nT('已发送'));
}
function open(path: string): void { void ft('path.open', { path }).catch((e) => notif.error(errorMessage(e))); }
function scrollTo(key: string): void { void scrollToStep(key); }
</script>

<style scoped>
.ft-split { display: grid; grid-template-columns: minmax(260px, 340px) 1fr; gap: 14px; align-items: start; }
@media (max-width: 960px) { .ft-split { grid-template-columns: 1fr; } }
.ft-list { display: grid; gap: 8px; border: 1px solid var(--color-border); border-radius: 14px; background: var(--color-bg-card); padding: 10px; position: sticky; top: 0; max-height: calc(100vh - 160px); overflow: hidden; grid-template-rows: auto 1fr; }
.ft-list ul { list-style: none; margin: 0; padding: 0; display: grid; gap: 6px; overflow-y: auto; align-content: start; }
.ft-list li { padding: 8px 10px; border-radius: 10px; border: 1px solid transparent; cursor: pointer; display: grid; gap: 3px; background: var(--color-bg-primary); }
.ft-list li.active { border-color: var(--color-brand); background: color-mix(in srgb, var(--color-brand) 8%, var(--color-bg-card)); }
.ft-list__top { display: flex; justify-content: space-between; gap: 6px; align-items: center; font-size: 13px; }
.ft-list__sub { font-size: 12px; color: var(--color-text-secondary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ft-list__meta { display: flex; gap: 6px; flex-wrap: wrap; font-size: 11px; color: var(--color-text-secondary); align-items: center; }
.ft-select { height: 30px; border-radius: 8px; border: 1px solid var(--color-border); background: var(--color-bg-input, var(--color-bg-primary)); color: var(--color-text-primary); font: inherit; font-size: 12px; max-width: 150px; }
.ft-detail { display: grid; gap: 12px; min-width: 0; }
.ft-mail { border: 1px solid var(--color-border); border-radius: 10px; padding: 8px 10px; display: grid; gap: 6px; }
.ft-mail__head { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; font-size: 12.5px; }
.ft-body { margin: 0; white-space: pre-wrap; font: inherit; font-size: 12.5px; line-height: 1.55; max-height: 260px; overflow: auto; color: var(--color-text-primary); }
.ft-quote { white-space: normal !important; max-width: 360px; font-size: 12px; color: var(--color-text-secondary); }
.ft-unverified { color: var(--color-warning); text-decoration: underline dotted; }
.ft-ol { margin: 4px 0 0; padding-inline-start: 20px; font-size: 12.5px; display: grid; gap: 3px; }
.ft-check { display: inline-flex; gap: 6px; align-items: center; font-size: 12.5px; }
</style>
