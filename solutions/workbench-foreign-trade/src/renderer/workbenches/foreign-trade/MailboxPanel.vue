<template>
  <section class="ss-panel ft-mailboxes">
    <header>
      <strong><i class="ri-mail-settings-line"></i> {{ $t('邮箱接管') }}</strong>
      <span class="ss-muted">{{ $t('可以同时接管多个邮箱（每位业务员的邮箱、公共询盘邮箱等）。每 2 分钟自动收一次；只读取新邮件，不会改动邮件的已读状态。') }}</span>
      <span class="grow"></span>
      <button type="button" class="ss-btn sm" :disabled="pollingAll || !mailboxes.length" @click="pollAll"><i :class="pollingAll ? 'ri-loader-4-line spin' : 'ri-refresh-line'"></i>{{ $t('全部立即收取') }}</button>
      <button type="button" class="ss-btn sm primary" @click="startAdd"><i class="ri-add-line"></i>{{ $t('添加邮箱') }}</button>
    </header>

    <div v-if="mailboxes.length" class="ss-table-wrap">
      <table class="ss-table">
        <thead>
          <tr>
            <th>{{ $t('邮箱') }}</th><th>{{ $t('业务员') }}</th><th>{{ $t('用途') }}</th><th>{{ $t('状态') }}</th>
            <th>{{ $t('最近收取') }}</th><th class="num">{{ $t('累计邮件') }}</th><th>{{ $t('自动回复') }}</th><th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="m in mailboxes" :key="m.id">
            <td><strong>{{ m.label }}</strong><div class="ss-muted">{{ m.address }}</div></td>
            <td>{{ m.owner || '—' }}</td>
            <td><span v-for="p in m.purposes" :key="p" class="ss-chip">{{ purposeLabel(p) }}</span></td>
            <td>
              <span class="ss-chip" :class="statusClass(m)">{{ statusLabel(m) }}</span>
              <div v-if="m.statusDetail && m.status === 'error'" class="ss-muted ft-err">{{ m.statusDetail }}</div>
            </td>
            <td>{{ m.lastSyncAt ? fmtDateTime(m.lastSyncAt) : '—' }}<span v-if="m.lastFetched" class="ss-muted"> · {{ $t('{n} 封', { n: m.lastFetched }) }}</span></td>
            <td class="num">{{ m.totalFetched || 0 }}</td>
            <td><span class="ss-chip" :class="m.autoReply ? 'ok' : ''">{{ m.autoReply ? $t('已开启') : $t('关闭') }}</span></td>
            <td class="ft-row-actions">
              <button type="button" class="ss-btn sm ghost" :disabled="busyId === m.id" @click="pollOne(m.id)"><i :class="busyId === m.id ? 'ri-loader-4-line spin' : 'ri-download-2-line'"></i>{{ $t('收取') }}</button>
              <button type="button" class="ss-btn sm ghost" @click="startEdit(m)"><i class="ri-edit-line"></i>{{ $t('编辑') }}</button>
              <button type="button" class="ss-btn sm ghost danger" @click="remove(m)"><i class="ri-delete-bin-line"></i></button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <p v-else class="ss-empty">{{ $t('还没有接管邮箱。添加至少一个邮箱后，新询盘会自动进入「新询盘处理」。') }}</p>

    <!-- 添加 / 编辑：可以同时有多行，每行单独确认或删除 -->
    <div v-for="(d, idx) in drafts" :key="d.key" class="ft-mb-form">
      <div class="ft-mb-form__head">
        <span class="ss-subhead">{{ d.input.id ? $t('编辑邮箱') : $t('新邮箱 {n}', { n: idx + 1 }) }}</span>
        <span v-if="d.input.address" class="ss-muted">{{ d.input.address }}</span>
      </div>
      <div class="ss-grid">
        <label class="ss-field"><span>{{ $t('邮箱服务商') }}</span>
          <select v-model="d.input.provider" @change="applyPreset(d)">
            <option v-for="p in presets" :key="p.id" :value="p.id">{{ p.label }}</option>
          </select>
        </label>
        <label class="ss-field"><span>{{ $t('邮箱地址') }}</span><input v-model.trim="d.input.address" type="email" placeholder="sales@yourcompany.com" /></label>
        <label class="ss-field"><span>{{ d.input.id ? $t('授权码（不改就留空）') : $t('授权码 / 应用专用密码') }}</span><input v-model="d.input.password" type="password" autocomplete="new-password" /></label>
        <label class="ss-field"><span>{{ $t('显示名称') }}</span><input v-model.trim="d.input.label" type="text" :placeholder="$t('例如：Tom 的询盘邮箱')" /></label>
        <label class="ss-field"><span>{{ $t('发件人名称') }}</span><input v-model.trim="d.input.senderName" type="text" placeholder="Tom Wang" /></label>
        <label class="ss-field"><span>{{ $t('归属业务员') }}</span><input v-model.trim="d.input.owner" type="text" /></label>
      </div>
      <p v-if="presetNote(d)" class="ss-note info"><i class="ri-information-line"></i>{{ presetNote(d) }}</p>
      <div class="ss-grid tight">
        <label class="ss-field"><span>{{ $t('收信服务器（IMAP）') }}</span><input v-model.trim="d.input.imapHost" type="text" /></label>
        <label class="ss-field"><span>{{ $t('IMAP 端口') }}</span><input v-model.number="d.input.imapPort" type="number" /></label>
        <label class="ss-field"><span>{{ $t('发信服务器（SMTP）') }}</span><input v-model.trim="d.input.smtpHost" type="text" /></label>
        <label class="ss-field"><span>{{ $t('SMTP 端口') }}</span><input v-model.number="d.input.smtpPort" type="number" /></label>
      </div>
      <div class="ss-actions">
        <span class="ss-muted">{{ $t('用途：') }}</span>
        <label v-for="p in PURPOSES" :key="p" class="ft-check"><input v-model="d.input.purposes" type="checkbox" :value="p" />{{ purposeLabel(p) }}</label>
        <span class="grow"></span>
        <label class="ft-check"><input v-model="d.input.enabled" type="checkbox" />{{ $t('启用接管（定时收取）') }}</label>
        <label class="ft-check"><input v-model="d.input.autoReply" type="checkbox" />{{ $t('新询盘自动回复（规则在「新询盘处理」里设置）') }}</label>
      </div>
      <div v-if="d.testResult" class="ft-test">
        <span class="ss-chip" :class="d.testResult.imap.ok ? 'ok' : 'bad'">{{ $t('收信：{p0}', { p0: d.testResult.imap.message }) }}</span>
        <span class="ss-chip" :class="d.testResult.smtp.ok ? 'ok' : 'bad'">{{ $t('发信：{p0}', { p0: d.testResult.smtp.message }) }}</span>
      </div>
      <p v-if="d.error" class="ss-note danger"><i class="ri-error-warning-line"></i>{{ d.error }}</p>
      <div class="ss-actions">
        <button type="button" class="ss-btn sm" :disabled="d.testing || !d.input.address" @click="test(d)"><i :class="d.testing ? 'ri-loader-4-line spin' : 'ri-plug-line'"></i>{{ $t('测试连接') }}</button>
        <span class="grow"></span>
        <button type="button" class="ss-btn sm ghost danger" :disabled="d.saving" @click="dropDraft(d)"><i class="ri-delete-bin-line"></i>{{ d.input.id ? $t('取消') : $t('删除') }}</button>
        <button type="button" class="ss-btn sm primary" :disabled="d.saving || !d.input.address || (!d.input.id && !d.input.password)" @click="save(d)"><i :class="d.saving ? 'ri-loader-4-line spin' : 'ri-check-line'"></i>{{ d.input.id ? $t('确认保存') : $t('确认添加') }}</button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
/**
 * 多邮箱接管：增删改、测试连接、立即收取，逐个邮箱显示状态。
 */
import { computed, onMounted, ref } from 'vue';
import type { FtMailbox, FtMailboxInput, FtMailboxPreset, FtMailboxPurpose, FtMailboxTestResult } from '@totalclaw/ipc-contracts';
import { useNotificationStore } from '../../stores/notification';
import { t as i18nT } from '../../i18n';
import { ft, ftState, errorMessage, fmtDateTime, refreshState } from './shared';

const notif = useNotificationStore();
const PURPOSES: FtMailboxPurpose[] = ['inquiry', 'outreach', 'followup', 'order'];
const presets = ref<FtMailboxPreset[]>([]);
interface Draft {
  key: number;
  input: FtMailboxInput & { password: string };
  testing: boolean;
  saving: boolean;
  testResult: FtMailboxTestResult | null;
  error: string;
}
/** 待确认的邮箱行：「添加邮箱」每点一次加一行，每行单独测试、确认或删除 */
const drafts = ref<Draft[]>([]);
let draftSeq = 0;
const busyId = ref('');
const pollingAll = ref(false);

const mailboxes = computed(() => ftState.value?.mailboxes || []);
function presetNote(d: Draft): string {
  return presets.value.find((p) => p.id === d.input.provider)?.note || '';
}

function purposeLabel(p: FtMailboxPurpose): string {
  return { inquiry: i18nT('收询盘'), outreach: i18nT('发开发信'), followup: i18nT('客户跟进'), order: i18nT('订单跟单') }[p];
}
function statusLabel(m: FtMailbox): string {
  if (!m.enabled) return i18nT('已停用');
  return { unknown: i18nT('待收取'), ready: i18nT('正常'), error: i18nT('异常'), disabled: i18nT('已停用') }[m.status];
}
function statusClass(m: FtMailbox): string {
  if (!m.enabled) return '';
  return m.status === 'ready' ? 'ok' : m.status === 'error' ? 'bad' : 'warn';
}

function blank(): FtMailboxInput & { password: string } {
  const p = presets.value[0];
  return {
    label: '', address: '', password: '', senderName: '', owner: '', purposes: ['inquiry'],
    provider: p?.id || 'custom', imapHost: p?.imapHost || '', imapPort: p?.imapPort || 993,
    smtpHost: p?.smtpHost || '', smtpPort: p?.smtpPort || 465, enabled: true, autoReply: false,
  };
}
function pushDraft(input: FtMailboxInput & { password: string }): void {
  drafts.value.push({ key: ++draftSeq, input, testing: false, saving: false, testResult: null, error: '' });
}
function startAdd(): void { pushDraft(blank()); }
function dropDraft(d: Draft): void { drafts.value = drafts.value.filter((x) => x.key !== d.key); }
function startEdit(m: FtMailbox): void {
  if (drafts.value.some((d) => d.input.id === m.id)) return;   // 已经在编辑这一个
  pushDraft({
    id: m.id, label: m.label, address: m.address, password: '', senderName: m.senderName || '', owner: m.owner || '',
    purposes: [...m.purposes], provider: m.provider, imapHost: m.imapHost, imapPort: m.imapPort,
    smtpHost: m.smtpHost, smtpPort: m.smtpPort, enabled: m.enabled, autoReply: m.autoReply,
  });
}
function applyPreset(d: Draft): void {
  const p = presets.value.find((x) => x.id === d.input.provider);
  if (!p || p.id === 'custom') return;
  Object.assign(d.input, { imapHost: p.imapHost, imapPort: p.imapPort, smtpHost: p.smtpHost, smtpPort: p.smtpPort });
}

async function test(d: Draft): Promise<void> {
  d.testing = true;
  d.testResult = null;
  d.error = '';
  try {
    d.testResult = await ft<FtMailboxTestResult>('mailbox.test', { id: d.input.id, input: d.input });
  } catch (e) {
    d.error = errorMessage(e);
  } finally {
    d.testing = false;
  }
}
async function save(d: Draft): Promise<void> {
  d.saving = true;
  d.error = '';
  try {
    const input = { ...d.input };
    if (!input.password) delete (input as any).password;
    const saved = await ft<FtMailbox>('mailbox.save', { input });
    notif.success(i18nT('已保存邮箱 {p0}', { p0: saved.address }));
    dropDraft(d);
    await refreshState();
    if (saved.enabled) void pollOne(saved.id);
  } catch (e) {
    d.error = errorMessage(e);   // 错误写在这一行上，其它行不受影响
  } finally {
    d.saving = false;
  }
}
async function remove(m: FtMailbox): Promise<void> {
  if (!window.confirm(i18nT('确定不再接管邮箱 {p0}？已收到的邮件和询盘会保留。', { p0: m.address }))) return;
  try { await ft('mailbox.remove', { id: m.id }); await refreshState(); } catch (e) { notif.error(errorMessage(e)); }
}
async function pollOne(id: string): Promise<void> {
  busyId.value = id;
  try {
    const r = await ft<Record<string, { fetched: number; created: number; error?: string }>>('mailbox.poll', { id });
    const x = r[id];
    if (x?.error) notif.error(x.error);
    else notif.success(i18nT('收到 {p0} 封新邮件，新增 {p1} 个询盘', { p0: x?.fetched || 0, p1: x?.created || 0 }));
    await refreshState();
  } catch (e) {
    notif.error(errorMessage(e));
  } finally {
    busyId.value = '';
  }
}
async function pollAll(): Promise<void> {
  pollingAll.value = true;
  try {
    const r = await ft<Record<string, { fetched: number; created: number; error?: string }>>('mailbox.poll', {});
    const vals = Object.values(r);
    const failed = vals.filter((x) => x.error).length;
    notif.info(i18nT('收取完成：{p0} 个邮箱，新增 {p1} 个询盘{p2}', { p0: vals.length, p1: vals.reduce((s, x) => s + (x.created || 0), 0), p2: failed ? i18nT('，{n} 个邮箱失败', { n: failed }) : '' }));
    await refreshState();
  } catch (e) {
    notif.error(errorMessage(e));
  } finally {
    pollingAll.value = false;
  }
}

onMounted(async () => {
  try { presets.value = await ft<FtMailboxPreset[]>('mailbox.presets'); } catch { /* 预设拿不到就手填 */ }
});
</script>

<style scoped>
.ft-mailboxes header strong { display: flex; gap: 6px; align-items: center; }
.ft-row-actions { display: flex; gap: 4px; }
.ft-err { max-width: 260px; white-space: normal; color: var(--color-danger); }
.ft-mb-form { display: grid; gap: 10px; border: 1px solid var(--color-border); border-radius: var(--radius-5); padding: 10px 12px; background: var(--color-bg-primary); }
.ft-mb-form__head { display: flex; gap: 10px; align-items: baseline; }
.ft-check { display: inline-flex; gap: 6px; align-items: center; font-size: 12.5px; }
.ft-test { display: flex; gap: 8px; flex-wrap: wrap; }
.ft-test .ss-chip { white-space: normal; }
</style>
