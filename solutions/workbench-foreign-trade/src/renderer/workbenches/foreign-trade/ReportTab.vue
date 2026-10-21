<template>
  <div class="ss-module">
    <ModuleHeader :meta="meta" />

    <!-- 定时日报 -->
    <section v-if="schedule" class="ss-rules">
      <h4><i class="ri-alarm-line"></i>{{ $t('定时日报') }}</h4>
      <div class="ss-rule-row">
        <label class="ft-check"><input v-model="sched.enabled" type="checkbox" />{{ $t('每天自动汇总当天数据并发邮件') }}</label>
        <span class="lbl">{{ $t('时间') }}</span><input v-model="sched.time" type="text" placeholder="18:00" class="ft-time" />
        <span class="lbl">{{ $t('发件邮箱') }}</span>
        <select v-model="sched.mailboxId"><option value="">{{ $t('请选择') }}</option><option v-for="m in mailboxes" :key="m.id" :value="m.id">{{ m.label || m.address }}</option></select>
      </div>
      <div class="ss-rule-row">
        <span class="lbl">{{ $t('收件人（多个用逗号隔开）') }}</span><input v-model="sched.recipients" type="text" class="ft-wide" />
        <span class="grow"></span>
        <button type="button" class="ss-btn sm primary" @click="saveSchedule"><i class="ri-save-line"></i>{{ $t('保存') }}</button>
      </div>
      <p v-if="schedule.lastSentDate" class="ss-muted">{{ $t('上次自动发送：{p0}', { p0: schedule.lastSentDate }) }}</p>
    </section>

    <StickyProgress :title="$t('数据整理')" :metas="metas" :runtime="runtime" :current-key="currentKey" @jump="scrollTo" />
    <div class="ss-steps">
      <StepCard step-key="range" :index="0" :title="metas[0].title" :hint="metas[0].hint" :runtime="runtime.range">
        <div class="ss-actions">
          <button v-for="p in PRESETS" :key="p.key" type="button" class="ss-btn sm" :class="{ primary: preset === p.key }" @click="setPreset(p.key)">{{ p.label }}</button>
        </div>
        <div class="ss-grid tight">
          <label class="ss-field"><span>{{ $t('开始日期') }}</span><input v-model="from" type="date" @input="preset = 'custom'" /></label>
          <label class="ss-field"><span>{{ $t('结束日期') }}</span><input v-model="to" type="date" @input="preset = 'custom'" /></label>
        </div>
      </StepCard>

      <StepCard step-key="build" :index="1" :title="metas[1].title" :hint="metas[1].hint" :runtime="runtime.build">
        <div class="ss-actions">
          <button type="button" class="ss-btn primary" :disabled="!from || !to || busy === 'build'" @click="build"><i :class="busy === 'build' ? 'ri-loader-4-line spin' : 'ri-bar-chart-2-line'"></i>{{ $t('汇总数据') }}</button>
        </div>
        <template v-if="report">
          <div class="ss-kpis">
            <div class="ss-kpi accent"><small>{{ $t('新询盘') }}</small><strong>{{ s!.inquiries.total }}</strong></div>
            <div class="ss-kpi"><small>{{ $t('垃圾询盘') }}</small><strong>{{ s!.inquiries.spam }}</strong></div>
            <div class="ss-kpi"><small>{{ $t('已回复') }}</small><strong>{{ s!.inquiries.replied }}</strong></div>
            <div class="ss-kpi"><small>{{ $t('平均首次回复（小时）') }}</small><strong>{{ s!.inquiries.avgFirstReplyHours ?? '—' }}</strong></div>
            <div class="ss-kpi"><small>{{ $t('收到邮件') }}</small><strong>{{ s!.mails.received }}</strong></div>
            <div class="ss-kpi"><small>{{ $t('发出邮件') }}</small><strong>{{ s!.mails.sent }}</strong></div>
            <div class="ss-kpi"><small>{{ $t('新增潜客') }}</small><strong>{{ s!.outreach.leads }}</strong></div>
            <div class="ss-kpi"><small>{{ $t('开发信已发') }}</small><strong>{{ s!.outreach.sent }}</strong></div>
            <div class="ss-kpi"><small>{{ $t('报价单') }}</small><strong>{{ s!.quotes.count }}</strong></div>
            <div class="ss-kpi"><small>{{ $t('已发报价') }}</small><strong>{{ s!.quotes.sent }}</strong></div>
            <div class="ss-kpi"><small>{{ $t('进行中订单') }}</small><strong>{{ s!.orders.active }}</strong></div>
            <div class="ss-kpi"><small>{{ $t('逾期节点') }}</small><strong>{{ s!.orders.overdueNodes }}</strong></div>
            <div class="ss-kpi"><small>{{ $t('待跟进客户') }}</small><strong>{{ s!.followups.due }}</strong></div>
            <div v-for="(v, k) in s!.quotes.amountByCurrency" :key="k" class="ss-kpi"><small>{{ $t('已发报价金额（{p0}）', { p0: k }) }}</small><strong>{{ fmtMoney(v) }}</strong></div>
          </div>
          <div class="ft-two">
            <div v-if="Object.keys(s!.inquiries.byMailbox).length" class="ss-table-wrap">
              <table class="ss-table"><thead><tr><th>{{ $t('邮箱') }}</th><th class="num">{{ $t('询盘') }}</th></tr></thead>
                <tbody><tr v-for="(v, k) in s!.inquiries.byMailbox" :key="k"><td>{{ k }}</td><td class="num">{{ v }}</td></tr></tbody></table>
            </div>
            <div v-if="Object.keys(s!.inquiries.byCategory).length" class="ss-table-wrap">
              <table class="ss-table"><thead><tr><th>{{ $t('产品线') }}</th><th class="num">{{ $t('询盘') }}</th></tr></thead>
                <tbody><tr v-for="(v, k) in s!.inquiries.byCategory" :key="k"><td>{{ k }}</td><td class="num">{{ v }}</td></tr></tbody></table>
            </div>
          </div>
        </template>
      </StepCard>

      <StepCard step-key="comment" :index="2" :title="metas[2].title" :hint="metas[2].hint" :runtime="runtime.comment">
        <p class="ss-note info"><i class="ri-information-line"></i>{{ $t('报表里的数字全部由系统按记录统计，模型只负责写点评，不改动数字。') }}</p>
        <div class="ss-actions">
          <button type="button" class="ss-btn primary" :disabled="!report || busy === 'comment'" @click="comment"><i :class="busy === 'comment' ? 'ri-loader-4-line spin' : 'ri-chat-quote-line'"></i>{{ $t('生成点评') }}</button>
          <span v-if="report?.model" class="ss-muted">{{ $t('由 {p0} 撰写', { p0: modelLabel(report.model) }) }}</span>
        </div>
        <p v-if="report?.commentary" class="ft-comment">{{ report.commentary }}</p>
      </StepCard>

      <StepCard step-key="export" :index="3" :title="metas[3].title" :hint="metas[3].hint" :runtime="runtime.export">
        <div class="ss-actions">
          <button type="button" class="ss-btn" :disabled="!report || busy === 'export'" @click="exportReport"><i :class="busy === 'export' ? 'ri-loader-4-line spin' : 'ri-file-excel-2-line'"></i>{{ $t('导出 Excel') }}</button>
        </div>
        <div v-if="report?.filePath" class="ss-file-out">
          <i class="ri-file-check-line"></i><code>{{ report.filePath }}</code>
          <button type="button" class="ss-btn sm ghost" @click="open(report.filePath)"><i class="ri-external-link-line"></i>{{ $t('打开') }}</button>
        </div>
        <div class="ss-grid">
          <label class="ss-field"><span>{{ $t('发件邮箱') }}</span>
            <select v-model="sendMailbox"><option value="">{{ $t('请选择') }}</option><option v-for="m in mailboxes" :key="m.id" :value="m.id">{{ m.label || m.address }}</option></select>
          </label>
          <label class="ss-field"><span>{{ $t('收件人') }}</span><input v-model="sendTo" type="text" /></label>
        </div>
        <div class="ss-actions"><span class="grow"></span>
          <button type="button" class="ss-btn primary" :disabled="!report || !sendMailbox || !sendTo || busy === 'send'" @click="send"><i :class="busy === 'send' ? 'ri-loader-4-line spin' : 'ri-send-plane-line'"></i>{{ $t('发送报表') }}</button>
        </div>
        <p v-if="report?.sentAt" class="ss-note ok"><i class="ri-check-line"></i>{{ $t('已于 {p0} 发送', { p0: fmtDateTime(report.sentAt) }) }}</p>
      </StepCard>
    </div>

    <!-- 历史报表 -->
    <section v-if="reports.length" class="ss-panel">
      <header><strong><i class="ri-history-line"></i> {{ $t('历史报表') }}</strong></header>
      <div class="ss-table-wrap ft-scroll">
        <table class="ss-table">
          <thead><tr><th>{{ $t('区间') }}</th><th>{{ $t('生成时间') }}</th><th class="num">{{ $t('新询盘') }}</th><th>{{ $t('已发送') }}</th><th></th></tr></thead>
          <tbody>
            <tr v-for="r in reports" :key="r.id" :class="{ 'ft-active': r.id === reportId }">
              <td>{{ r.stats.from }} ~ {{ r.stats.to }}</td><td>{{ fmtDateTime(r.createdAt) }}</td><td class="num">{{ r.stats.inquiries.total }}</td>
              <td>{{ r.sentAt ? fmtDateTime(r.sentAt) : '—' }}</td>
              <td>
                <button type="button" class="ss-btn sm ghost" @click="reportId = r.id"><i class="ri-folder-open-line"></i>{{ $t('查看') }}</button>
                <button type="button" class="ss-btn sm ghost danger" :title="$t('删除这份报表')" @click="removeReport(r.id)"><i class="ri-delete-bin-line"></i></button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
/**
 * 数据整理：选周期 → 系统按记录统计 → 模型写点评（不碰数字）→ 导出 / 发送；可设每日定时发送。
 */
import { computed, reactive, ref, watch } from 'vue';
import type { FtReport } from '@totalclaw/ipc-contracts';
import { useNotificationStore } from '../../stores/notification';
import { t as i18nT } from '../../i18n';
import StepCard from '../service-settlement/StepCard.vue';
import StickyProgress from '../service-settlement/StickyProgress.vue';
import { scrollToStep, type StepMeta, type StepRuntime } from '../service-settlement/shared';
import ModuleHeader from './ModuleHeader.vue';
import {
  confirmSend, enabledMailboxes, errorMessage, fmtDateTime, fmtMoney, ft, ftState, mailboxName, modelLabel, refreshState,
  splitEmails, todayIso, type FtModuleMeta,
} from './shared';

defineProps<{ meta: FtModuleMeta; focus?: unknown }>();
defineEmits<{ (e: 'goto', module: string, payload: any): void }>();
const notif = useNotificationStore();
const state = ftState;

const mailboxes = computed(() => enabledMailboxes(state.value));
const reports = computed(() => state.value?.reports || []);
const schedule = computed(() => state.value?.settings.reportSchedule);
const sched = reactive({ enabled: false, time: '18:00', recipients: '', mailboxId: '' });
watch(schedule, (v) => {
  if (!v) return;
  Object.assign(sched, { enabled: v.enabled, time: v.time, recipients: v.recipients.join(', '), mailboxId: v.mailboxId || '' });
}, { immediate: true });

type PresetKey = 'today' | 'week' | 'month' | 'custom';
const PRESETS: { key: PresetKey; label: string }[] = [
  { key: 'today', label: i18nT('今天') }, { key: 'week', label: i18nT('本周') }, { key: 'month', label: i18nT('本月') }, { key: 'custom', label: i18nT('自定义') },
];
const preset = ref<PresetKey>('today');
const from = ref(todayIso());
const to = ref(todayIso());
const reportId = ref('');
const sendMailbox = ref('');
const sendTo = ref('');
const busy = ref('');
const errors = ref<Record<string, string>>({});
const report = computed(() => reports.value.find((r) => r.id === reportId.value) || null);
const s = computed(() => report.value?.stats);

function setPreset(k: PresetKey): void {
  preset.value = k;
  const d = new Date();
  to.value = todayIso();
  if (k === 'today') from.value = todayIso();
  if (k === 'week') from.value = todayIso(-((d.getDay() + 6) % 7));
  if (k === 'month') from.value = todayIso(-(d.getDate() - 1));
}

const metas: StepMeta[] = [
  { key: 'range', title: i18nT('选择周期'), hint: i18nT('今天、本周、本月或自定义日期') },
  { key: 'build', title: i18nT('汇总数据'), hint: i18nT('询盘、邮件、开发、报价、订单、跟进，按记录统计') },
  { key: 'comment', title: i18nT('生成点评'), hint: i18nT('指出最需要关注的变化并给建议') },
  { key: 'export', title: i18nT('导出与发送'), hint: i18nT('导出 Excel，或发邮件给管理层') },
];
const runtime = computed<Record<string, StepRuntime>>(() => {
  const r = report.value;
  const st = (key: string, done: boolean, summary?: string): StepRuntime => (busy.value === key
    ? { state: 'running' }
    : errors.value[key] ? { state: 'failed', error: errors.value[key] }
      : done ? { state: 'done', summary } : { state: 'todo' });
  return {
    range: st('range', !!from.value && !!to.value, `${from.value} ~ ${to.value}`),
    build: st('build', !!r, r ? i18nT('{n} 个新询盘', { n: r.stats.inquiries.total }) : ''),
    comment: st('comment', !!r?.commentary),
    export: st('export', !!(r?.filePath || r?.sentAt)),
  };
});
const currentKey = computed(() => metas.find((m) => runtime.value[m.key].state !== 'done')?.key || 'export');

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

async function saveSchedule(): Promise<void> {
  if (!/^\d{1,2}:\d{2}$/.test(sched.time)) { notif.warn(i18nT('时间格式应为 HH:MM，例如 18:00')); return; }
  const [h, m] = sched.time.split(':');
  try {
    await ft('settings.patch', { patch: { reportSchedule: { enabled: sched.enabled, time: `${h.padStart(2, '0')}:${m}`, recipients: splitEmails(sched.recipients), mailboxId: sched.mailboxId || undefined } } });
    await refreshState();
    notif.success(i18nT('定时日报设置已保存'));
  } catch (e) {
    notif.error(errorMessage(e));
  }
}
async function build(): Promise<void> {
  if (from.value > to.value) { errors.value = { ...errors.value, build: i18nT('开始日期不能晚于结束日期') }; return; }
  await run('build', async () => {
    const r = await ft<FtReport>('report.build', { from: from.value, to: to.value });
    reportId.value = r.id;
  });
}
async function comment(): Promise<void> {
  if (!report.value) return;
  await run('comment', () => ft('report.commentary', { id: report.value!.id }));
}
async function exportReport(): Promise<void> {
  if (!report.value) return;
  await run('export', () => ft('report.export', { id: report.value!.id }));
}
async function send(): Promise<void> {
  const r = report.value;
  if (!r) return;
  const toList = splitEmails(sendTo.value);
  if (!confirmSend(mailboxName(state.value, sendMailbox.value), toList, i18nT('外贸业务报表 {p0} ~ {p1}', { p0: r.stats.from, p1: r.stats.to }))) return;
  const ok = await run('send', () => ft('report.send', { id: r.id, mailboxId: sendMailbox.value, to: toList }));
  if (ok) notif.success(i18nT('报表已发送'));
}
function open(path?: string): void { if (path) void ft('path.open', { path }).catch((e) => notif.error(errorMessage(e))); }
function scrollTo(key: string): void { void scrollToStep(key); }
async function removeReport(id: string): Promise<void> {
  if (!window.confirm(i18nT('删除这份报表？导出的文件不受影响。'))) return;
  try {
    await ft('report.remove', { id });
    if (reportId.value === id) reportId.value = '';
    await refreshState();
  } catch (e) { notif.error(errorMessage(e)); }
}
</script>

<style scoped>
.ft-check { display: inline-flex; gap: 6px; align-items: center; font-size: 12.5px; }
.ft-time { width: 70px !important; }
.ft-wide { width: 320px !important; text-align: left !important; }
.ft-two { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 260px), 1fr)); gap: 10px; }
.ft-comment { margin: 0; padding: 10px 12px; border-radius: 10px; background: var(--color-bg-hover); font-size: 13px; line-height: 1.6; white-space: pre-wrap; }
.ft-scroll { max-height: 280px; overflow: auto; }
.ft-active td { background: color-mix(in srgb, var(--color-brand) 8%, transparent); }
</style>
