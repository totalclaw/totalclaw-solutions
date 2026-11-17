<template>
  <div class="mm-sw" data-test="mm-wecom">
    <header class="mm-sp__head">
      <div>
        <h3>{{ $t('消息推送') }}</h3>
        <p>{{ $t('配置企业微信自建应用后，通讯录真实同步、14 类通知以卡片推到企微；没配置时用演示组织，通知只进系统内消息中心。卡片只放标题、摘要和按钮，长文在系统内看。') }}</p>
        <p>{{ $t('配不了自建应用（要 CorpID、Secret 和企业可信 IP）时，可以只配一个「企微群机器人」：通知发到一个企微群里并点名提醒相关的人，见下方。') }}</p>
      </div>
      <span class="ss-chip" :class="channel ? 'ok' : 'warn'" data-test="mm-wecom-state">{{ channel === 'app' ? $t('企微已连接') : channel === 'webhook' ? $t('群机器人已连接') : $t('未连接企微') }}</span>
    </header>
    <p v-if="error" class="ss-note danger"><i class="ri-error-warning-line"></i>{{ error }}</p>
    <p v-if="testResult" class="ss-note" :class="testResult.ok ? 'ok' : 'danger'" data-test="mm-wecom-test-result">
      <i :class="testResult.ok ? 'ri-checkbox-circle-line' : 'ri-error-warning-line'"></i>{{ testResult.ok ? $t('连接正常') : (testResult.error || $t('连接失败')) }}
    </p>

    <section class="mm-sw__form">
      <div class="ss-grid">
        <label class="ss-field"><span>CorpID</span><input v-model="form.corpId" type="text" autocomplete="off" spellcheck="false" data-test="mm-wecom-corp" /></label>
        <label class="ss-field"><span>AgentID</span><input v-model="form.agentId" type="text" autocomplete="off" spellcheck="false" data-test="mm-wecom-agent" /></label>
        <label class="ss-field">
          <span>Secret <em v-if="settings.wecom.hasSecret" class="mm-sw__set">{{ $t('已配置') }}</em></span>
          <span class="mm-sw__secret">
            <input v-model="form.secret" :type="showSecret ? 'text' : 'password'" autocomplete="new-password" spellcheck="false" :placeholder="settings.wecom.hasSecret ? $t('已保存，点右边的眼睛查看') : $t('应用的 Secret')" data-test="mm-wecom-secret" />
            <button type="button" class="mm-sw__eye" :title="showSecret ? $t('隐藏') : $t('查看')" :disabled="busy" data-test="mm-wecom-secret-eye" @click="toggleSecret"><i :class="showSecret ? 'ri-eye-off-line' : 'ri-eye-line'"></i></button>
          </span>
        </label>
      </div>
      <label class="ss-field">
        <span>{{ $t('卡片跳转地址前缀') }}</span>
        <input v-model="form.cardBaseUrl" type="url" :placeholder="$t('留空 = 用手机页服务的局域网地址，如 http://192.168.1.10:8260')" spellcheck="false" data-test="mm-wecom-base" />
      </label>
      <p class="ss-muted">{{ $t('Secret 只保存在本机（系统加密存储），不会显示出来。卡片按钮会跳到「前缀 + 每人专属链接」，员工手机要能访问这个地址（同一局域网或可信域名）。CorpID 和 AgentID 都清空后保存 = 断开企微。') }}</p>
      <div class="ss-actions">
        <button type="button" class="ss-btn primary" :disabled="busy || !canSave" data-test="mm-wecom-save" @click="save"><i :class="busy && acting === 'save' ? 'ri-loader-4-line spin' : 'ri-save-line'"></i>{{ $t('保存') }}</button>
        <button type="button" class="ss-btn" :disabled="busy || (!settings.wecom.hasSecret && !connected)" data-test="mm-wecom-test" @click="test"><i :class="busy && acting === 'test' ? 'ri-loader-4-line spin' : 'ri-plug-line'"></i>{{ $t('测试连接') }}</button>
      </div>
    </section>

    <section class="mm-sw__form" data-test="mm-webhook">
      <h4 class="mm-sw__h">{{ $t('企微群机器人') }} <small>{{ $t('没有自建应用时用：通知发到一个企微群里，并点名提醒要处理的人') }}</small></h4>
      <ol class="mm-sw__steps">
        <li>{{ $t('在企业微信里打开要接收通知的内部群，点右上角「…」') }}</li>
        <li>{{ $t('选「消息推送」（旧版叫「群机器人」）→「添加」→ 新建一个，名字可以叫「会议助手」') }}</li>
        <li>{{ $t('复制生成的 Webhook 地址，粘贴到下面保存，再点「测试发送」看群里有没有收到') }}</li>
      </ol>
      <label class="ss-field">
        <span>{{ $t('Webhook 地址') }} <em v-if="settings.wecom.hasWebhook" class="mm-sw__set" data-test="mm-webhook-set">{{ $t('已配置') }} {{ settings.wecom.webhookMasked }}</em></span>
        <input v-model="hook" type="password" autocomplete="off" spellcheck="false" :placeholder="settings.wecom.hasWebhook ? $t('已配置，要换地址再粘贴') : 'https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=…'" data-test="mm-webhook-url" />
      </label>
      <p class="ss-muted">{{ $t('地址里的 key 等于发消息的凭据，只保存在本机（系统加密存储），不会显示出来。配了自建应用时通知发给个人，群机器人不再发。群消息里的按钮不带个人令牌：手机上打开过自己专属链接的人点了能直接进入。每个机器人每分钟最多发 20 条，同一事件的几个人合成一条。') }}</p>
      <p v-if="hookResult" class="ss-note" :class="hookResult.ok ? 'ok' : 'danger'" data-test="mm-webhook-result">
        <i :class="hookResult.ok ? 'ri-checkbox-circle-line' : 'ri-error-warning-line'"></i>{{ hookResult.ok ? $t('已发到群里，请到企微群里看一眼') : (hookResult.error || $t('发送失败')) }}
      </p>
      <div class="ss-actions">
        <button type="button" class="ss-btn primary" :disabled="busy || !hook.trim()" data-test="mm-webhook-save" @click="saveHook"><i :class="busy && acting === 'hook' ? 'ri-loader-4-line spin' : 'ri-save-line'"></i>{{ $t('保存') }}</button>
        <button type="button" class="ss-btn" :disabled="busy || !settings.wecom.hasWebhook" data-test="mm-webhook-test" @click="testHook"><i :class="busy && acting === 'hookTest' ? 'ri-loader-4-line spin' : 'ri-send-plane-line'"></i>{{ $t('测试发送') }}</button>
        <button v-if="settings.wecom.hasWebhook" type="button" class="ss-btn" :disabled="busy" data-test="mm-webhook-remove" @click="removeHook"><i class="ri-delete-bin-line"></i>{{ $t('移除') }}</button>
      </div>
    </section>

    <PushFailedList />

    <section class="mm-sw__events">
      <h4>{{ $t('14 类通知') }} <small>{{ $t('只发提醒，不改任何状态') }}</small></h4>
      <div class="ss-table-wrap">
        <table class="ss-table">
          <thead><tr><th>#</th><th>{{ $t('事件') }}</th><th>{{ $t('接收人') }}</th><th>{{ $t('卡片内容') }}</th></tr></thead>
          <tbody>
            <tr v-for="(ev, i) in EVENTS" :key="i">
              <td class="num">{{ i + 1 }}</td>
              <td>{{ ev.event }}</td>
              <td class="wrap">{{ ev.to }}</td>
              <td class="wrap">{{ ev.card }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="ss-muted">{{ $t('提醒周期（发言确认超时、到期提前、进度跟踪、周报）在「参数设置」里改。') }}</p>
    </section>
  </div>
</template>

<script setup lang="ts">
/** 消息推送：企微 CorpID / AgentID / Secret（只写不回显）/ 卡片跳转前缀，测试连接；13 类通知说明 */
import { computed, reactive, ref, watch } from 'vue';
import type { MmSettings } from '../../../shared/meetingMgmt/types';
import { t as i18nT } from '../../i18n';
import { useDialog } from '../../composables/useDialog';
import { useNotificationStore } from '../../stores/notification';
import { errorMessage, mm, mmBoot, refreshBoot } from './shared';
import PushFailedList from './PushFailedList.vue';

const props = defineProps<{ settings: MmSettings }>();
const emit = defineEmits<{ (e: 'saved', s?: MmSettings): void }>();

const TITLE_ACTION = i18nT('标题 + 摘要 + 按钮');
const EVENTS: Array<{ event: string; to: string; card: string }> = [
  { event: i18nT('发言待确认 / 未确认催办'), to: i18nT('发言人'), card: TITLE_ACTION },
  { event: i18nT('纪要待终审'), to: i18nT('主持人'), card: TITLE_ACTION },
  { event: i18nT('正式纪要已生成'), to: i18nT('参会人'), card: i18nT('会议主题 + 3 行摘要') },
  { event: i18nT('执行方案待确认'), to: i18nT('任务负责人'), card: i18nT('任务名 + 截止') },
  { event: i18nT('新任务待接收'), to: i18nT('部门负责人'), card: i18nT('任务名 + 截止') },
  { event: i18nT('进度更新 / 到期 / 逾期提醒'), to: i18nT('部门负责人（逾期同时通知任务负责人）'), card: TITLE_ACTION },
  { event: i18nT('任务进度有更新 / 任务已完成'), to: i18nT('任务负责人（可多位，每位都发）'), card: i18nT('任务名 + 进度 / 说明') },
  { event: i18nT('异议待复核'), to: i18nT('任务负责人'), card: TITLE_ACTION },
  { event: i18nT('调整后方案待确认'), to: i18nT('部门负责人'), card: i18nT('任务名 + 截止') },
  { event: i18nT('待裁决'), to: i18nT('项目负责人'), card: TITLE_ACTION },
  { event: i18nT('裁决结果'), to: i18nT('任务负责人、部门负责人'), card: TITLE_ACTION },
  { event: i18nT('进度汇总报告'), to: i18nT('任务负责人、项目负责人'), card: i18nT('完成率 + 逾期数') },
  { event: i18nT('总结报告待审核'), to: i18nT('项目负责人'), card: TITLE_ACTION },
  { event: i18nT('项目已归档'), to: i18nT('项目成员'), card: i18nT('项目已归档') },
];

const dialog = useDialog();
const notif = useNotificationStore();
const busy = ref(false);
const acting = ref<'' | 'save' | 'test' | 'hook' | 'hookTest'>('');
const error = ref('');
const testResult = ref<{ ok: boolean; error?: string } | null>(null);
const form = reactive({ corpId: '', agentId: '', secret: '', cardBaseUrl: '' });

const connected = computed(() => !!mmBoot.value?.wecomConnected);
const channel = computed(() => mmBoot.value?.pushChannel ?? (connected.value ? 'app' : null));
const hook = ref('');
const showSecret = ref(false);
/** 已保存的 Secret：点眼睛从本机取回原文（只在电脑端、只给管理员） */
async function toggleSecret(): Promise<void> {
  if (!showSecret.value && !form.secret && props.settings.wecom.hasSecret) {
    try {
      const r = await mm<{ secret: string }>('wecom.secret.reveal');
      form.secret = r?.secret || '';
    } catch (e) {
      error.value = errorMessage(e);
      return;
    }
  }
  showSecret.value = !showSecret.value;
}
const hookResult = ref<{ ok: boolean; error?: string } | null>(null);
/** 两项都清空 = 断开企微 */
const clearing = computed(() => !form.corpId.trim() && !form.agentId.trim());
const canSave = computed(() => (clearing.value
  ? !!(props.settings.wecom.corpId || props.settings.wecom.agentId || props.settings.wecom.hasSecret)
  : !!form.corpId.trim() && !!form.agentId.trim() && (props.settings.wecom.hasSecret || !!form.secret)));

watch(() => props.settings.wecom, (w) => {
  // 已经填在框里的 Secret 不清空（保存后设置会刷新一次，清空了看起来就像被删了）
  Object.assign(form, { corpId: w?.corpId ?? '', agentId: w?.agentId ?? '', secret: form.secret, cardBaseUrl: w?.cardBaseUrl ?? '' });
}, { immediate: true });

async function save(): Promise<void> {
  if (clearing.value && !(await dialog.confirm({
    title: i18nT('断开企微'),
    message: i18nT('清空企微配置后，通讯录不再从企微同步，通知只进系统内消息中心。确定吗？'),
    danger: true,
  }))) return;
  busy.value = true;
  acting.value = 'save';
  error.value = '';
  testResult.value = null;
  try {
    const payload: Record<string, string> = { corpId: form.corpId.trim(), agentId: form.agentId.trim(), cardBaseUrl: form.cardBaseUrl.trim() };
    if (form.secret) payload.secret = form.secret;
    await mm('wecom.save', payload);
    // 断开企微时 Secret 跟着清掉；平时保存后留在框里
    if (clearing.value) { form.secret = ''; showSecret.value = false; }
    notif.success(clearing.value ? i18nT('已断开企微') : i18nT('企微配置已保存'));
    emit('saved');
    await refreshBoot().catch(() => null);
  } catch (e) {
    error.value = errorMessage(e);
  } finally {
    busy.value = false;
    acting.value = '';
  }
}

async function runHook(kind: 'hook' | 'hookTest', fn: () => Promise<void>): Promise<void> {
  busy.value = true;
  acting.value = kind;
  error.value = '';
  hookResult.value = null;
  try {
    await fn();
  } catch (e) {
    hookResult.value = { ok: false, error: errorMessage(e) };
  } finally {
    busy.value = false;
    acting.value = '';
  }
}

function saveHook(): Promise<void> {
  return runHook('hook', async () => {
    await mm('wecom.webhook.save', { url: hook.value.trim() });
    hook.value = '';
    notif.success(i18nT('群机器人已保存'));
    emit('saved');
    await refreshBoot().catch(() => null);
  });
}

function testHook(): Promise<void> {
  return runHook('hookTest', async () => {
    const r = await mm<{ ok: boolean; error?: string }>('wecom.webhook.test');
    hookResult.value = { ok: !!r?.ok, error: r?.error };
  });
}

async function removeHook(): Promise<void> {
  const ok = await dialog.confirm({ title: i18nT('移除群机器人'), message: i18nT('移除后通知不再发到企微群（自建应用照常）。确定吗？'), danger: true });
  if (!ok) return;
  await runHook('hook', async () => {
    await mm('wecom.webhook.save', { url: '' });
    notif.success(i18nT('已移除群机器人'));
    emit('saved');
    await refreshBoot().catch(() => null);
  });
}

async function test(): Promise<void> {
  busy.value = true;
  acting.value = 'test';
  error.value = '';
  testResult.value = null;
  try {
    const r = await mm<{ ok: boolean; error?: string }>('wecom.test');
    testResult.value = { ok: !!r?.ok, error: r?.error };
    await refreshBoot().catch(() => null);
  } catch (e) {
    testResult.value = { ok: false, error: errorMessage(e) };
  } finally {
    busy.value = false;
    acting.value = '';
  }
}
</script>

<style scoped>
.mm-sw { display: grid; gap: 18px; }
.mm-sp__head { display: flex; align-items: flex-start; gap: 16px; flex-wrap: wrap; }
.mm-sp__head > div:first-child { flex: 1; min-width: 260px; display: grid; gap: 6px; }
.mm-sp__head h3 { margin: 0; font-size: 18px; }
.mm-sp__head p { margin: 0; color: var(--color-text-secondary); font-size: 13px; line-height: 1.6; max-width: 80ch; }
.mm-sw__form { display: grid; gap: 12px; padding-bottom: 18px; border-bottom: 1px solid var(--color-border-subtle); }
.mm-sw__form .ss-muted { margin: 0; }
.mm-sw__set { font-style: normal; margin-inline-start: 6px; padding: 0 6px; border-radius: var(--radius-pill); font-size: 11px; font-weight: 700; color: var(--color-success); background: color-mix(in srgb, var(--color-success) 14%, transparent); }
.mm-sw__h { margin: 0; font-size: 14.5px; display: flex; gap: 8px; align-items: baseline; flex-wrap: wrap; }
.mm-sw__h small { font-weight: 400; font-size: 12.5px; color: var(--color-text-secondary); }
.mm-sw__steps { margin: 0; padding-inline-start: 20px; display: grid; gap: 4px; font-size: 13px; line-height: 1.6; color: var(--color-text-secondary); }
.mm-sw__secret { position: relative; display: block; }
.mm-sw__secret input { width: 100%; box-sizing: border-box; padding-inline-end: 34px; }
.mm-sw__eye { position: absolute; inset-inline-end: 4px; top: 50%; transform: translateY(-50%); border: 0; background: none; cursor: pointer; color: var(--color-text-secondary); font-size: 16px; padding: 4px; }
.mm-sw__events { display: grid; gap: 10px; }
.mm-sw__events h4 { margin: 0; font-size: 14.5px; display: flex; gap: 8px; align-items: baseline; }
.mm-sw__events h4 small { font-weight: 400; font-size: 12.5px; color: var(--color-text-secondary); }
.mm-sw__events .ss-muted { margin: 0; }
.mm-sw td.wrap { white-space: normal; min-width: 160px; line-height: 1.5; }
.spin { animation: mm-sw-spin 1s linear infinite; }
@keyframes mm-sw-spin { to { transform: rotate(360deg); } }
</style>
