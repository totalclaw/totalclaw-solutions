<template>
  <section class="mm-pf" data-test="mm-push-failed">
    <div class="mm-pf__head">
      <h4>{{ $t('推送失败记录') }} <small>{{ $t('{n} 条', { n: total }) }}</small></h4>
      <span class="mm-grow"></span>
      <button v-if="total" type="button" class="ss-btn sm primary" :disabled="!!busy || !connected" :title="connected ? '' : $t('先配置并连接企业微信')" data-test="mm-push-retry-all" @click="retry()">
        <i :class="busy === 'all' ? 'ri-loader-4-line spin' : 'ri-send-plane-line'"></i>{{ $t('全部重发') }}
      </button>
    </div>
    <p class="ss-muted">{{ $t('企微卡片没发出去的通知（系统内消息中心照常有）。常见原因：手机页服务没开、接收人不在企微应用可见范围。处理好原因后再重发。') }}</p>
    <p v-if="result" class="ss-note" :class="result.failed ? 'danger' : 'ok'" data-test="mm-push-result">
      <i :class="result.failed ? 'ri-error-warning-line' : 'ri-checkbox-circle-line'"></i>{{ $t('重发成功 {a} 条，仍失败 {b} 条', { a: result.sent, b: result.failed }) }}
    </p>
    <p v-if="error" class="ss-note danger"><i class="ri-error-warning-line"></i>{{ error }}</p>
    <p v-if="!items.length && loaded" class="mm-pf__empty">{{ $t('没有发送失败的通知') }}</p>
    <div v-else-if="items.length" class="ss-table-wrap">
      <table class="ss-table">
        <thead><tr><th>{{ $t('时间') }}</th><th>{{ $t('接收人') }}</th><th>{{ $t('通知') }}</th><th>{{ $t('失败原因') }}</th><th class="num">{{ $t('操作') }}</th></tr></thead>
        <tbody>
          <tr v-for="x in items" :key="x.id" :data-test="`mm-push-row-${x.id}`">
            <td class="nowrap">{{ fmtMs(x.at) }}</td>
            <td class="nowrap">{{ x.toName }}</td>
            <td>{{ x.title }}</td>
            <td class="mm-pf__err">{{ x.error }}</td>
            <td class="num"><button type="button" class="ss-link" :disabled="!!busy || !connected" :data-test="`mm-push-retry-${x.id}`" @click="retry(x.id)">{{ busy === x.id ? $t('发送中…') : $t('重发') }}</button></td>
          </tr>
        </tbody>
      </table>
    </div>
    <small v-if="total > items.length" class="ss-muted">{{ $t('只列出最近 {n} 条', { n: items.length }) }}</small>
  </section>
</template>

<script setup lang="ts">
/** 设置 · 消息推送 · 推送失败记录（管理员）：notice.push.failed 列表、notice.push.retry 单条 / 全部重发 */
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { errorMessage, mm, mmBoot, onMmEvent, refreshBoot } from './shared';
import { fmtMs } from './meetingUi';

interface FailedItem { id: string; at: number; to: string; toName: string; type: string; title: string; error: string }

const items = ref<FailedItem[]>([]);
const total = ref(0);
const loaded = ref(false);
const busy = ref('');
const error = ref('');
const result = ref<{ sent: number; failed: number } | null>(null);
const connected = computed(() => !!mmBoot.value?.pushChannel || !!mmBoot.value?.wecomConnected);

async function load(): Promise<void> {
  try {
    const r = await mm<{ total: number; items: FailedItem[] }>('notice.push.failed');
    items.value = r?.items ?? [];
    total.value = r?.total ?? 0;
    error.value = '';
  } catch (e) {
    error.value = errorMessage(e);
  } finally {
    loaded.value = true;
  }
}
async function retry(id?: string): Promise<void> {
  busy.value = id || 'all';
  error.value = '';
  result.value = null;
  try {
    result.value = await mm<{ sent: number; failed: number }>('notice.push.retry', id ? { ids: [id] } : { all: true });
    await Promise.all([load(), refreshBoot().catch(() => null)]);
  } catch (e) {
    error.value = errorMessage(e);
  } finally {
    busy.value = '';
  }
}

let off: (() => void) | null = null;
onMounted(() => {
  void load();
  off = onMmEvent((ev) => { if (ev.type === 'changed' && ev.scope === 'notice' && !busy.value) void load(); });
});
onBeforeUnmount(() => off?.());
</script>

<style scoped>
.mm-pf { display: grid; gap: 10px; }
.mm-pf__head { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.mm-pf__head h4 { margin: 0; font-size: 14.5px; }
.mm-pf__head h4 small { color: var(--color-text-secondary); font-weight: 500; font-size: 12.5px; }
.mm-grow { flex: 1; }
.mm-pf > .ss-muted, .mm-pf > .ss-note { margin: 0; }
.mm-pf__empty { margin: 0; padding: 10px 12px; border-radius: var(--radius-4); background: var(--color-bg-hover); color: var(--color-text-secondary); font-size: 12.5px; }
.mm-pf__err { color: var(--color-danger); font-size: 12.5px; white-space: normal !important; }
.nowrap { white-space: nowrap; }
.spin { animation: mm-pf-spin 1s linear infinite; }
@keyframes mm-pf-spin { to { transform: rotate(360deg); } }
</style>
