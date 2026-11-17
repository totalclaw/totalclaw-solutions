<template>
  <section class="mm-card mm-mob" data-test="mm-mobile">
    <header class="mm-card__head">
      <h3>{{ $t('手机端') }}</h3>
      <span class="mm-tag" :class="status.running ? 'ok' : ''" data-test="mm-mobile-state">{{ status.running ? $t('运行中') : $t('未开启') }}</span>
      <span class="mm-grow"></span>
      <template v-if="isAdmin">
        <button v-if="!status.running" type="button" class="ss-btn primary sm" :disabled="busy" data-test="mm-mobile-start" @click="toggle(true)"><i :class="busy ? 'ri-loader-4-line spin' : 'ri-play-circle-line'"></i>{{ $t('开启手机页服务') }}</button>
        <button v-else type="button" class="ss-btn sm" :disabled="busy" data-test="mm-mobile-stop" @click="toggle(false)"><i :class="busy ? 'ri-loader-4-line spin' : 'ri-stop-circle-line'"></i>{{ $t('停止服务') }}</button>
      </template>
    </header>
    <p v-if="error" class="ss-note danger"><i class="ri-error-warning-line"></i>{{ error }}</p>

    <div class="mm-mob__addr">
      <small>{{ $t('局域网地址') }}</small>
      <b v-if="status.running && status.url" class="mono" data-test="mm-mobile-url">{{ status.url }}</b>
      <b v-else class="muted">{{ isAdmin ? $t('服务未开启') : $t('服务未开启，请管理员在首页开启') }}</b>
    </div>

    <div v-if="status.running" class="mm-mob__qr">
      <img v-if="qr" :src="qr" :alt="$t('我的手机端专属链接二维码')" width="132" height="132" data-test="mm-mobile-qr" />
      <span v-else class="mm-mob__qr-ph"><i class="ri-loader-4-line spin"></i></span>
      <div class="mm-mob__qr-text">
        <strong>{{ $t('用手机扫码打开') }}</strong>
        <small>{{ me ? $t('这是 {name} 的专属链接，扫开就是本人身份，不要转发给别人。', { name: me.name }) : $t('当前身份无效，无法生成专属链接') }}</small>
        <button v-if="link" type="button" class="ss-link" data-test="mm-mobile-copy" @click="copyLink">{{ $t('复制链接') }}</button>
      </div>
    </div>
    <p v-if="status.running && status.lanOnly" class="ss-note warn mm-mob__lan" data-test="mm-mobile-lan">
      <i class="ri-wifi-line"></i>
      <span>
        {{ $t('这是公司内网地址：手机要连公司 Wi-Fi（和这台电脑同一个网络）才能打开，用 4G 或在公司外面打不开。发到企业微信的消息里也会注明这一点。') }}
        <template v-if="isAdmin">{{ $t('要在外面也能打开，需要一个外网能访问到这台电脑的地址，填到 系统设置 → 企业微信 →「卡片跳转地址前缀」。') }}</template>
      </span>
    </p>
    <p v-else-if="status.publicBase" class="ss-note info" data-test="mm-mobile-public"><i class="ri-global-line"></i>{{ $t('消息里的链接用外网地址：{url}', { url: status.publicBase }) }}</p>
    <p class="mm-mob__note">{{ $t('手机和这台电脑要在同一个网络；第一次开启时系统可能询问是否允许接入网络，请选允许。服务会记住开关，电脑重启后自动开启。') }}</p>
  </section>
</template>

<script setup lang="ts">
/**
 * 会议智能管理 · 首页的「手机端」卡片：手机页服务开关（管理员）、局域网地址、本人专属链接二维码。
 * 每人专属链接的列表（给别人发链接、重置）还在 设置 → 手机端。
 */
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import QRCode from 'qrcode';
import { t as i18nT } from '../../i18n';
import { useNotificationStore } from '../../stores/notification';
import { errorMessage, mm, mmBoot, onMmEvent, type MmMobileStatus } from './shared';
import { copyText, pickUrl } from './pagesLogic';

const notif = useNotificationStore();
const status = ref<MmMobileStatus>({ ...(mmBoot.value?.mobile ?? {}), running: !!mmBoot.value?.mobile.running });
const busy = ref(false);
const error = ref('');
const link = ref('');
const qr = ref('');
const me = computed(() => mmBoot.value?.me?.person ?? null);
const isAdmin = computed(() => !!mmBoot.value?.me?.isAdmin);

/** 本人专属链接 + 二维码（服务开着、身份有效时） */
async function loadLink(): Promise<void> {
  link.value = '';
  qr.value = '';
  if (!status.value.running || !me.value) return;
  try {
    const url = pickUrl(await mm('mobile.link', {}));
    if (!url) return;
    link.value = url;
    qr.value = await QRCode.toDataURL(url, { margin: 1, width: 264 }).catch(() => '');
  } catch (e) {
    error.value = errorMessage(e);
  }
}

async function refreshStatus(): Promise<void> {
  try {
    const r = await mm<MmMobileStatus>('mobile.status');
    if (r) status.value = { ...r, running: !!r.running };
  } catch (e) {
    error.value = errorMessage(e);
  }
}

async function toggle(on: boolean): Promise<void> {
  busy.value = true;
  error.value = '';
  try {
    const r = await mm<MmMobileStatus | undefined>(on ? 'mobile.start' : 'mobile.stop');
    if (r && typeof r === 'object' && 'running' in r) status.value = { ...r, running: !!r.running };
    else await refreshStatus();
    notif.success(on ? i18nT('手机页服务已开启') : i18nT('手机页服务已停止'));
  } catch (e) {
    error.value = errorMessage(e);
  } finally {
    busy.value = false;
  }
}

async function copyLink(): Promise<void> {
  if (link.value && await copyText(link.value)) notif.success(i18nT('已复制专属链接'));
}

// 服务开关、地址、当前身份变了都要重新生成（切身份代办时二维码跟着换人）
watch(() => [status.value.running, status.value.url, me.value?.id], () => { void loadLink(); });

let off: (() => void) | null = null;
onMounted(() => {
  void refreshStatus().then(loadLink);
  off = onMmEvent((ev) => {
    if (ev.type === 'mobile') {
      status.value = { ...status.value, running: ev.running, url: ev.url };
      if (mmBoot.value) mmBoot.value.mobile = { ...mmBoot.value.mobile, running: ev.running, url: ev.url };
      void refreshStatus();
    }
  });
});
onBeforeUnmount(() => off?.());
</script>

<style scoped>
.mm-card { border: 1px solid var(--color-border); border-radius: var(--radius-6); background: var(--color-bg-card); padding: 18px 22px; display: grid; gap: 12px; align-content: start; min-width: 0; }
.mm-card__head { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.mm-card__head h3 { margin: 0; font-size: 18px; font-weight: 800; }
.mm-grow { flex: 1; }
.mm-tag { display: inline-flex; align-items: center; padding: 2px 8px; border-radius: var(--radius-3); font-size: var(--font-size-sm); font-weight: 600; background: var(--color-bg-hover); color: var(--color-text-secondary); white-space: nowrap; }
.mm-tag.ok { background: color-mix(in srgb, var(--color-success) 14%, transparent); color: var(--color-success); }
.ss-btn.sm { height: 32px; padding: 0 12px; font-size: var(--font-size-sm); }
.mm-mob__addr { display: grid; gap: 3px; padding: 12px 14px; border-radius: var(--radius-4); background: var(--color-bg-hover); }
.mm-mob__addr small { font-size: 12px; color: var(--color-text-secondary); }
.mm-mob__addr b { font-size: 15px; word-break: break-all; }
.mm-mob__addr b.muted { color: var(--color-text-muted); font-weight: 400; font-size: 13px; }
.mono { font-family: var(--font-mono); }
.mm-mob__qr { display: flex; align-items: center; gap: 14px; }
.mm-mob__qr img, .mm-mob__qr-ph { flex: none; width: 132px; height: 132px; border-radius: var(--radius-3); background: #fff; border: 1px solid var(--color-border); }
.mm-mob__qr-ph { display: grid; place-items: center; color: var(--color-text-muted); font-size: 20px; }
.mm-mob__qr-text { display: grid; gap: 6px; justify-items: start; min-width: 0; }
.mm-mob__qr-text strong { font-size: var(--font-size-md); }
.mm-mob__qr-text small { color: var(--color-text-secondary); font-size: 12.5px; line-height: 1.55; }
.mm-mob__lan { align-items: flex-start; }
.mm-mob__note { margin: 0; color: var(--color-text-secondary); font-size: 12px; line-height: 1.55; }
.spin { animation: mm-mob-spin 1s linear infinite; }
@keyframes mm-mob-spin { to { transform: rotate(360deg); } }
</style>
