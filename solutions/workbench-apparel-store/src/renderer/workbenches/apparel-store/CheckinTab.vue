<template>
  <div class="ap-ci">
    <section class="ss-panel">
      <header class="ap-head"><strong><i class="ri-qr-scan-2-line"></i>{{ $t('到店核销') }}</strong><span class="ss-muted">{{ $t('顾客出示 6 位试穿码；读混 0/O、1/I 也能认') }}</span></header>
      <form class="ap-ci__form" @submit.prevent="lookup">
        <input v-model="code" type="text" maxlength="8" :placeholder="$t('输入试穿码')" autofocus />
        <button type="submit" class="ss-btn primary" :disabled="code.trim().length < 6"><i class="ri-search-line"></i>{{ $t('查找') }}</button>
      </form>
      <p v-if="notFound" class="ss-note danger"><i class="ri-error-warning-line"></i>{{ $t('没有找到这个试穿码') }}</p>
      <div v-if="hit" class="ap-ci__hit">
        <img v-if="hit.image" :src="fileUrl(hit.image)" alt="" />
        <div class="ap-ci__info">
          <strong>{{ garment?.name || $t('已删除的商品') }}</strong>
          <span class="ss-muted">{{ customer?.nickname }} · {{ choiceLabel(hit.choice) }}</span>
          <p v-if="!codeValid(hit)" class="ss-note warn"><i class="ri-time-line"></i>{{ $t('试穿码已过期（当天有效，生成于 {p0}）。确认是本人后仍可登记。', { p0: fmtDateTime(hit.wantAt || hit.createdAt) }) }}</p>
          <span>{{ $t('{p0}：', { p0: $t('推荐尺码') }) }}<b>{{ hit.size || suggestedSize || $t('未填身高，按顾客意愿') }}</b></span>
          <span v-if="garment">{{ $t('{p0}：', { p0: $t('库存') }) }}<span v-for="(n, s) in garment.stock" :key="s" class="ss-chip" :class="n > 0 ? '' : 'bad'">{{ s }} × {{ n }}</span></span>
          <label class="ss-field ap-ci__size"><span>{{ $t('实际尺码') }}</span>
            <select v-model="size"><option value="">—</option><option v-for="(n, s) in garment?.stock || {}" :key="s" :value="s">{{ s }}</option></select>
          </label>
          <div class="ss-actions">
            <button v-for="s in STATUSES" :key="s" type="button" class="ss-btn sm" :class="{ primary: hit.visit?.status === s }" @click="mark(s)">{{ visitLabel(s) }}</button>
          </div>
          <small class="ss-muted">{{ $t('登记「成交」会自动扣减该尺码库存 1 件') }}</small>
        </div>
      </div>
    </section>

    <section class="ss-panel">
      <header class="ap-head"><strong>{{ $t('待到店') }}</strong><span class="ss-muted">{{ $t('顾客点了「想试实物」，还没登记结果') }}</span></header>
      <p v-if="!waiting.length" class="ss-empty">{{ $t('暂无') }}</p>
      <div v-else class="ss-table-wrap">
        <table class="ss-table">
          <thead><tr><th>{{ $t('试穿码') }}</th><th>{{ $t('顾客') }}</th><th>{{ $t('款式') }}</th><th>{{ $t('推荐尺码') }}</th><th>{{ $t('时间') }}</th><th></th></tr></thead>
          <tbody>
            <tr v-for="t in waiting" :key="t.id">
              <td><b class="ap-code">{{ t.code }}</b></td>
              <td>{{ nameOf(t.customerId) }}</td>
              <td>{{ garmentOf(t.garmentId)?.name }}</td>
              <td>{{ t.size || '—' }}</td>
              <td>{{ fmtDateTime(t.wantAt) }}</td>
              <td><button type="button" class="ss-link" @click="open(t.code)">{{ $t('核销') }}</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
/** 到店核销：凭试穿码看款式、尺码、试穿图 → 备货 / 已试穿 / 成交 / 未成交。 */
import { computed, ref } from 'vue';
import type { ApTryon, ApVisitStatus } from '@totalclaw/ipc-contracts';
import { useNotificationStore } from '../../stores/notification';
import { ap, apState, choiceLabel, errorMessage, fileUrl, fmtDateTime, refreshState, visitLabel } from './shared';

const notif = useNotificationStore();
const STATUSES: ApVisitStatus[] = ['prepared', 'tried', 'purchased', 'left'];
const code = ref('');
const hitId = ref('');
const notFound = ref(false);
const size = ref('');
/** 凭码查到时主进程按身高体重现算的推荐尺码（顾客没点「想到店」时记录里没有） */
const suggestedSize = ref('');
const hit = computed<ApTryon | null>(() => apState.value?.tryons.find((t) => t.id === hitId.value) || null);
const garment = computed(() => (hit.value ? garmentOf(hit.value.garmentId) : undefined));
const customer = computed(() => apState.value?.customers.find((c) => c.id === hit.value?.customerId));
const waiting = computed(() => (apState.value?.tryons || []).filter((t) => t.wantVisit && (!t.visit || t.visit.status === 'prepared')));

const garmentOf = (id: string) => apState.value?.garments.find((g) => g.id === id);
const nameOf = (id: string) => apState.value?.customers.find((c) => c.id === id)?.nickname || '—';

async function lookup(): Promise<void> {
  notFound.value = false;
  try {
    const t = await ap<ApTryon | null>('tryon.byCode', { code: code.value });
    hitId.value = t?.id || '';
    notFound.value = !t;
    suggestedSize.value = t?.size || '';
    size.value = t?.visit?.size || t?.size || '';
  } catch (e) { notif.error(errorMessage(e)); }
}
function codeValid(t: ApTryon): boolean {
  const d = new Date(t.wantAt || t.createdAt);
  const n = new Date();
  return d.toDateString() === n.toDateString();
}
function open(c: string): void { code.value = c; void lookup(); }
async function mark(status: ApVisitStatus): Promise<void> {
  if (!hit.value) return;
  try { await ap('tryon.visit', { id: hit.value.id, status, size: size.value }); await refreshState(); } catch (e) { notif.error(errorMessage(e)); }
}
</script>

<style scoped>
.ap-ci { display: grid; gap: 14px; }
.ss-panel { border: 1px solid var(--color-border); border-radius: 14px; background: var(--color-bg-card); padding: 14px; display: grid; gap: 10px; }
.ap-head { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
.ap-head strong { display: flex; gap: 6px; align-items: center; font-size: 14px; }
.ap-ci__form { display: flex; gap: 10px; }
.ap-ci__form input { width: 220px; height: 44px; border-radius: 10px; border: 1px solid var(--color-brand); background: var(--color-bg-input, var(--color-bg-primary)); color: var(--color-text-primary); font: inherit; font-size: 22px; letter-spacing: .2em; text-transform: uppercase; padding: 0 12px; font-family: ui-monospace, Menlo, monospace; }
.ap-ci__form .ss-btn { height: 44px; }
.ap-ci__hit { display: flex; gap: 16px; align-items: flex-start; flex-wrap: wrap; }
.ap-ci__hit img { width: 220px; border-radius: 12px; border: 1px solid var(--color-border); }
.ap-ci__info { display: grid; gap: 8px; flex: 1; min-width: 260px; font-size: 13px; }
.ap-ci__info .ss-chip { margin-inline-end: 4px; }
.ap-ci__size { max-width: 180px; }
.ap-code { font-family: ui-monospace, Menlo, monospace; letter-spacing: .12em; color: var(--color-brand); }
</style>
