<template>
  <div class="ap-mob">
    <section class="ss-panel">
      <header class="ap-head">
        <strong><i class="ri-smartphone-line"></i>{{ $t('门店手机端') }}</strong>
        <span class="ss-chip" :class="mobile?.running ? 'ok' : ''">{{ mobile?.running ? $t('运行中') : $t('未开启') }}</span>
        <span v-if="mobile?.running" class="ss-muted">{{ $t('最近 10 分钟在线 {n} 位顾客', { n: mobile.activeSessions }) }}</span>
        <span class="grow"></span>
        <button v-if="!mobile?.running" type="button" class="ss-btn primary" :disabled="busy" @click="start"><i class="ri-play-line"></i>{{ $t('开启手机服务') }}</button>
        <button v-else type="button" class="ss-btn" :disabled="busy" @click="stop"><i class="ri-stop-line"></i>{{ $t('关闭') }}</button>
      </header>
      <p class="ss-muted">{{ $t('顾客连店内 Wi-Fi 扫下面的门店码，用手机浏览器即可：授权 → 拍照 → 选衣服与造型 → 生成试穿图 → 想试实物拿试穿码。照片只存在这台电脑上，不需要小程序。') }}</p>
      <div v-if="mobile?.running && mobile.joinUrl" class="ap-mob__qr">
        <img v-if="qr" :src="qr" alt="" />
        <div class="ap-mob__info">
          <strong>{{ state?.settings.storeName }}</strong>
          <code>{{ mobile.joinUrl }}</code>
          <div class="ss-actions">
            <button type="button" class="ss-btn sm" @click="copy(mobile.joinUrl)"><i class="ri-file-copy-line"></i>{{ $t('复制链接') }}</button>
            <button type="button" class="ss-btn sm" @click="saveQr"><i class="ri-download-2-line"></i>{{ $t('保存门店码图片（打印用）') }}</button>
            <button type="button" class="ss-btn sm ghost" @click="rotate"><i class="ri-refresh-line"></i>{{ $t('更换门店码') }}</button>
          </div>
          <small class="ss-muted">{{ $t('更换后旧码立刻失效（已进来的顾客不受影响）。建议贴在试衣间、收银台。') }}</small>
          <template v-if="mobile.candidates.length">
            <small class="ss-muted">{{ $t('顾客扫码打不开？换下面的地址试试（电脑有多块网卡时）：') }}</small>
            <code v-for="u in mobile.candidates" :key="u" class="ap-mob__alt">{{ u }}</code>
          </template>
        </div>
      </div>
    </section>

    <section class="ss-panel">
      <header class="ap-head"><strong>{{ $t('手机端顾客') }}</strong><span class="ss-muted">{{ $t('按时间倒序') }}</span></header>
      <p v-if="!mobileCustomers.length" class="ss-empty">{{ $t('还没有顾客通过手机端使用') }}</p>
      <div v-else class="ss-table-wrap">
        <table class="ss-table">
          <thead><tr><th>{{ $t('顾客') }}</th><th>{{ $t('照片') }}</th><th>{{ $t('试穿图') }}</th><th>{{ $t('想试实物') }}</th><th>{{ $t('进入时间') }}</th><th></th></tr></thead>
          <tbody>
            <tr v-for="c in mobileCustomers" :key="c.id">
              <td>{{ c.nickname }}</td>
              <td>{{ c.purgedAt ? $t('已清除') : c.photo ? $t('已上传') : '—' }}</td>
              <td>{{ tryonsOf(c.id).filter((t) => t.status === 'done').length }}</td>
              <td>{{ tryonsOf(c.id).filter((t) => t.wantVisit).length }}</td>
              <td>{{ fmtDateTime(c.createdAt) }}</td>
              <td><button v-if="!c.purgedAt" type="button" class="ss-link" @click="$emit('open-customer', c.id)">{{ $t('在一键换装里打开') }}</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
/** 门店手机端：开关局域网服务、门店码（可打印 / 更换）、手机端顾客列表。 */
import { computed, ref, watch } from 'vue';
import QRCode from 'qrcode';
import { useNotificationStore } from '../../stores/notification';
import { t as i18nT } from '../../i18n';
import { ap, apState, errorMessage, fmtDateTime, refreshState } from './shared';

defineEmits<{ (e: 'open-customer', id: string): void }>();
const notif = useNotificationStore();
const state = apState;
const mobile = computed(() => state.value?.mobile);
const qr = ref('');
const busy = ref(false);
const mobileCustomers = computed(() => (state.value?.customers || []).filter((c) => c.source === 'mobile'));
const tryonsOf = (id: string) => (state.value?.tryons || []).filter((t) => t.customerId === id);

watch(() => mobile.value?.joinUrl, async (u) => { qr.value = u ? await QRCode.toDataURL(u, { margin: 1, width: 240 }) : ''; }, { immediate: true });

async function act(action: string): Promise<void> {
  busy.value = true;
  try { await ap(action); await refreshState(); } catch (e) { notif.error(errorMessage(e)); } finally { busy.value = false; }
}
const start = () => act('mobile.start');
const stop = () => act('mobile.stop');
async function rotate(): Promise<void> {
  if (!window.confirm(i18nT('更换门店码？已打印的旧码会失效。'))) return;
  await act('mobile.rotateKey');
}
async function copy(text: string): Promise<void> {
  try { await navigator.clipboard.writeText(text); notif.success(i18nT('已复制')); } catch (e) { notif.error(errorMessage(e)); }
}
/** 门店码存成图片（带店名与一句提示），拿去打印贴在试衣间、收银台 */
async function saveQr(): Promise<void> {
  if (!qr.value) return;
  const img = new Image();
  img.src = qr.value;
  await img.decode();
  const cv = document.createElement('canvas');
  cv.width = 600; cv.height = 760;
  const g = cv.getContext('2d')!;
  g.fillStyle = '#fff'; g.fillRect(0, 0, cv.width, cv.height);
  g.fillStyle = '#222'; g.textAlign = 'center';
  g.font = '700 36px -apple-system, "PingFang SC", sans-serif';
  g.fillText(state.value?.settings.storeName || '', 300, 80);
  g.font = '24px -apple-system, "PingFang SC", sans-serif';
  g.fillText(i18nT('连店内 Wi-Fi，扫码 AI 试穿'), 300, 130);
  g.drawImage(img, 90, 170, 420, 420);
  const a = document.createElement('a');
  a.href = cv.toDataURL('image/png');
  a.download = `${state.value?.settings.storeName || 'store'}-${i18nT('门店码')}.png`;
  a.click();
}
</script>

<style scoped>
.ap-mob { display: grid; gap: 14px; }
.ss-panel { border: 1px solid var(--color-border); border-radius: 14px; background: var(--color-bg-card); padding: 14px; display: grid; gap: 10px; }
.ap-head { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
.ap-head strong { display: flex; gap: 6px; align-items: center; font-size: 14px; }
.ap-mob__qr { display: flex; gap: 18px; align-items: flex-start; flex-wrap: wrap; }
.ap-mob__qr img { width: 220px; height: 220px; border-radius: 12px; background: #fff; border: 1px solid var(--color-border); }
.ap-mob__info { display: grid; gap: 8px; flex: 1; min-width: 260px; }
.ap-mob__info code { font-size: 12px; word-break: break-all; color: var(--color-text-secondary); }
.ap-mob__alt { display: block; }
.grow { flex: 1; }
</style>
