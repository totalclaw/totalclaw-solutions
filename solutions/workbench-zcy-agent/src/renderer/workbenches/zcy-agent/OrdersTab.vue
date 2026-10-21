<template>
  <div class="ss-module">
    <StickyProgress :title="$t('订单履约')" :metas="metas" :runtime="runtime" :current-key="currentKey" @jump="jump" />
    <div class="ss-steps">
      <StepCard step-key="o-read" :index="0" :title="metas[0].title" :hint="metas[0].hint" :runtime="runtime['o-read']" :is-current="currentKey === 'o-read'">
        <ReadBack kind="orders" :hand-label="$t('让数字员工读取订单列表')" :conv-title="$t('政采云：读取订单')" @done="readDone = true">
          <button type="button" class="ss-btn" :disabled="!!busy" @click="importFile"><i class="ri-file-excel-2-line"></i>{{ $t('导入订单表') }}</button>
        </ReadBack>
        <p v-if="fileNote" class="ss-note ok"><i class="ri-check-line"></i>{{ fileNote }}</p>
      </StepCard>

      <StepCard step-key="o-todo" :index="1" :title="metas[1].title" :hint="metas[1].hint" :runtime="runtime['o-todo']" :is-current="currentKey === 'o-todo'">
        <p class="ss-muted">{{ $t('接单时限按当前区划规则（{p0} 小时）计算，时间从读回的下单时间算起；确认接单、确认发货由你亲自点，数字员工不改价、不拒单。', { p0: rule?.acceptHours ?? 24 }) }}</p>
        <p v-if="!todo.length" class="ss-note ok"><i class="ri-check-line"></i>{{ $t('没有待接单、待发货的订单') }}</p>
        <div v-for="o in todo" :key="o.id" class="zc-order" :data-test="`zc-order-${o.orderNo}`">
          <div class="zc-order__head">
            <span class="ss-chip" :class="alertOf(o.id)?.level === 'error' ? 'bad' : 'warn'">{{ orderStatusLabel(o.status) }}</span>
            <b>{{ o.orderNo }}</b><span>{{ o.buyer }}</span><span class="ss-muted">{{ money(o.amount) }}</span>
            <span class="zc-grow"></span>
            <span v-if="alertOf(o.id)" class="ss-chip" :class="alertOf(o.id)!.level === 'error' ? 'bad' : 'warn'" data-test="zc-order-alert">{{ alertOf(o.id)!.text }}</span>
          </div>
          <p class="ss-muted">{{ o.items }}</p>
          <div v-if="o.status === 'to_accept'" class="ss-actions">
            <button type="button" class="ss-btn sm primary" :disabled="!!busy" @click="hand(o, 'accept')"><i class="ri-robot-2-line"></i>{{ $t('交给数字员工核对并准备接单') }}</button>
            <button type="button" class="ss-link" @click="setStatus(o, 'to_ship')">{{ $t('我已接单') }}</button>
          </div>
          <div v-else class="ss-actions">
            <input v-model="ships[o.id].company" type="text" :placeholder="$t('物流公司')" />
            <input v-model="ships[o.id].no" type="text" :placeholder="$t('物流单号')" />
            <button type="button" class="ss-btn sm primary" :disabled="!!busy || !ships[o.id].company || !ships[o.id].no" @click="hand(o, 'ship')"><i class="ri-robot-2-line"></i>{{ $t('交给数字员工回填物流') }}</button>
            <button type="button" class="ss-link" @click="setStatus(o, 'shipped')">{{ $t('我已发货') }}</button>
          </div>
          <button v-if="o.conversationId" type="button" class="ss-link zc-start" @click="openConv(o.conversationId)">{{ $t('查看执行过程') }}</button>
        </div>
      </StepCard>

      <StepCard step-key="o-invoice" :index="2" :title="metas[2].title" :hint="metas[2].hint" :runtime="runtime['o-invoice']" :is-current="currentKey === 'o-invoice'">
        <p class="ss-muted">{{ $t('转入后在发票智能体里校验、组票、开具。订单里的商品摘要不是规范的开票项目，请在发票智能体的校验步骤里改成正式的项目名称。') }}</p>
        <p v-if="!invoiceable.length" class="ss-empty">{{ $t('没有待开票的订单') }}</p>
        <template v-else>
          <div class="ss-table-wrap">
            <table class="ss-table">
              <thead><tr><th></th><th>{{ $t('订单编号') }}</th><th>{{ $t('采购单位') }}</th><th>{{ $t('采购单位税号') }}</th><th class="num">{{ $t('金额') }}</th><th>{{ $t('状态') }}</th></tr></thead>
              <tbody>
                <tr v-for="o in invoiceable" :key="o.id">
                  <td><input type="checkbox" :checked="picked.includes(o.id)" :data-test="`zc-inv-pick-${o.orderNo}`" @change="togglePick(o.id)" /></td>
                  <td>{{ o.orderNo }}</td><td>{{ o.buyer }}</td>
                  <td><input :value="o.buyerTaxNo" type="text" :placeholder="$t('有就填，开票时会校验')" @change="patch(o, { buyerTaxNo: ($event.target as HTMLInputElement).value })" /></td>
                  <td class="num">{{ money(o.amount) }}</td><td><span class="ss-chip">{{ orderStatusLabel(o.status) }}</span></td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="ss-actions">
            <button type="button" class="ss-btn primary" :disabled="!!busy || !picked.length" data-test="zc-to-invoice" @click="toInvoice"><i class="ri-bill-line"></i>{{ $t('转入发票智能体（{n} 张）', { n: picked.length }) }}</button>
          </div>
        </template>
        <p v-if="invoiceNote" class="ss-note ok" data-test="zc-invoice-note"><i class="ri-check-line"></i>{{ invoiceNote }}<button type="button" class="ss-btn sm" @click="gotoInvoice">{{ $t('去发票智能体') }}</button></p>
      </StepCard>

      <StepCard step-key="o-all" :index="3" :title="metas[3].title" :hint="metas[3].hint" :runtime="runtime['o-all']" :is-current="currentKey === 'o-all'">
        <p v-if="!orders.length" class="ss-empty">{{ $t('还没有订单') }}</p>
        <div v-else class="ss-table-wrap zc-scroll">
          <table class="ss-table" data-test="zc-orders">
            <thead><tr><th>{{ $t('订单编号') }}</th><th>{{ $t('采购单位') }}</th><th class="num">{{ $t('金额') }}</th><th>{{ $t('下单时间') }}</th><th>{{ $t('状态') }}</th><th>{{ $t('物流') }}</th><th></th></tr></thead>
            <tbody>
              <tr v-for="o in orders" :key="o.id">
                <td>{{ o.orderNo }}</td><td>{{ o.buyer }}</td><td class="num">{{ money(o.amount) }}</td><td>{{ deadlineText(o.createdAt) }}</td>
                <td><select :value="o.status" @change="setStatus(o, ($event.target as HTMLSelectElement).value as ZcOrderStatus)"><option v-for="s in STATUSES" :key="s" :value="s">{{ orderStatusLabel(s) }}</option></select></td>
                <td>{{ o.logisticsCompany }} {{ o.logisticsNo }}</td>
                <td class="zc-ops"><span v-if="o.invoiceBatchId" class="ss-chip ok">{{ $t('已转开票') }}</span><button type="button" class="ss-link" @click="remove(o)">{{ $t('删除') }}</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </StepCard>
    </div>
  </div>
</template>

<script setup lang="ts">
/** 订单履约：读回订单 → 接单 / 发货（停在确认前）→ 待开票订单转入发票智能体 → 全部订单。 */
import { computed, reactive, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import type { ZcOrder, ZcOrderStatus } from '@totalclaw/ipc-contracts';
import { useNotificationStore } from '../../stores/notification';
import { t as i18nT } from '../../i18n';
import StepCard from '../service-settlement/StepCard.vue';
import StickyProgress from '../service-settlement/StickyProgress.vue';
import ReadBack from './ReadBack.vue';
import { deadlineText, ensureSite, errorMessage, handToDigitalEmployee, money, orderStatusLabel, refreshState, scrollToStep, zc, zcState, type StepMeta, type StepRuntime } from './shared';

const STATUSES: ZcOrderStatus[] = ['to_accept', 'to_ship', 'shipped', 'to_settle', 'to_invoice', 'done', 'closed'];
const notif = useNotificationStore();
const router = useRouter();
const state = zcState;
const busy = ref('');
const errors = ref<Record<string, string>>({});
const readDone = ref(false);
const fileNote = ref('');
const invoiceNote = ref('');
const picked = ref<string[]>([]);
const orders = computed<ZcOrder[]>(() => state.value?.orders || []);
const rule = computed(() => state.value?.settings.regions.find((r) => r.id === state.value?.settings.regionId));
const todo = computed(() => orders.value.filter((o) => o.status === 'to_accept' || o.status === 'to_ship'));
const invoiceable = computed(() => orders.value.filter((o) => !o.invoiceBatchId && (o.status === 'to_invoice' || o.status === 'to_settle' || o.status === 'done')));
const ships = reactive<Record<string, { company: string; no: string }>>({});
watch(orders, (os) => { for (const o of os) if (!ships[o.id]) ships[o.id] = { company: o.logisticsCompany, no: o.logisticsNo }; picked.value = picked.value.filter((id) => invoiceable.value.some((o) => o.id === id)); }, { immediate: true });
const alertOf = (id: string) => state.value?.alerts.find((a) => (a.kind === 'order_accept' || a.kind === 'order_ship') && a.refId === id);
function togglePick(id: string): void { const i = picked.value.indexOf(id); if (i >= 0) picked.value.splice(i, 1); else picked.value.push(id); }

async function run(key: string, fn: () => Promise<unknown>): Promise<boolean> {
  busy.value = key;
  errors.value = { ...errors.value, [key]: '' };
  try { await fn(); await refreshState(); return true; } catch (e) { errors.value = { ...errors.value, [key]: errorMessage(e) }; void scrollToStep(key); return false; } finally { busy.value = ''; }
}
async function importFile(): Promise<void> {
  const paths = await zc<string[]>('files.pick', { kind: 'excel' });
  if (!paths.length) return;
  await run('o-read', async () => {
    const r = await zc<{ added: number; updated: number; dropped: number }>('orders.importFile', { path: paths[0] });
    fileNote.value = i18nT('新增 {a} 条，更新 {b} 条', { a: r.added, b: r.updated }) + (r.dropped ? i18nT('；{n} 条缺编号或状态认不出，没有收', { n: r.dropped }) : '');
    readDone.value = true;
  });
}
async function patch(o: ZcOrder, p: Partial<ZcOrder>): Promise<void> { await run('o-invoice', () => zc('order.update', { id: o.id, patch: p })); }
async function setStatus(o: ZcOrder, status: ZcOrderStatus): Promise<void> { await run('o-todo', () => zc('order.update', { id: o.id, patch: { status } })); }
async function hand(o: ZcOrder, what: 'accept' | 'ship'): Promise<void> {
  const ok = await run('o-todo', async () => {
    await ensureSite();
    if (what === 'ship') await zc('order.update', { id: o.id, patch: { logisticsCompany: ships[o.id].company, logisticsNo: ships[o.id].no } });
    const text = await zc<string>(what === 'accept' ? 'order.acceptInstruction' : 'order.shipInstruction', { id: o.id });
    const conv = await handToDigitalEmployee(what === 'accept' ? i18nT('政采云接单：{p0}', { p0: o.orderNo }) : i18nT('政采云发货：{p0}', { p0: o.orderNo }), text);
    await zc('order.update', { id: o.id, patch: { conversationId: conv } });
  });
  if (ok) notif.success(what === 'accept' ? i18nT('已交给数字员工，它会停在「确认接单」前等你确认') : i18nT('已交给数字员工，它会停在「确认发货」前等你确认'));
}
async function toInvoice(): Promise<void> {
  invoiceNote.value = '';
  await run('o-invoice', async () => {
    const r = await zc<{ batchId: string; count: number }>('orders.toInvoice', { ids: picked.value });
    invoiceNote.value = i18nT('{n} 张订单已转入发票智能体，生成了一批待校验的开票行', { n: r.count });
    picked.value = [];
  });
}
async function remove(o: ZcOrder): Promise<void> {
  if (!window.confirm(i18nT('从本机台账删除订单 {p0}？（不影响政采云上的订单）', { p0: o.orderNo }))) return;
  await run('o-all', () => zc('order.remove', { id: o.id }));
}
function gotoInvoice(): void { void router.push('/workbenches/invoice-agent').catch((e) => notif.error(errorMessage(e))); }
function openConv(id: string): void { void router.push(`/conversations/${id}`).catch((e) => notif.error(errorMessage(e))); }

const metas: StepMeta[] = [
  { key: 'o-read', title: i18nT('读回订单'), hint: i18nT('数字员工只读订单列表，或导入订单表') },
  { key: 'o-todo', title: i18nT('接单与发货'), hint: i18nT('超时预警；接单、发货停在确认前') },
  { key: 'o-invoice', title: i18nT('转开票'), hint: i18nT('待开票订单转入发票智能体') },
  { key: 'o-all', title: i18nT('全部订单'), hint: i18nT('本机台账，状态以政采云为准') },
];
function st(key: string, ok: boolean, summary?: string): StepRuntime {
  if (busy.value === key) return { state: 'running' };
  if (errors.value[key]) return { state: 'failed', error: errors.value[key] };
  return ok ? { state: 'done', summary } : { state: 'todo' };
}
const runtime = computed<Record<string, StepRuntime>>(() => ({
  'o-read': st('o-read', readDone.value || orders.value.length > 0, i18nT('{n} 张订单', { n: orders.value.length })),
  'o-todo': st('o-todo', orders.value.length > 0 && todo.value.length === 0),
  'o-invoice': st('o-invoice', orders.value.length > 0 && invoiceable.value.length === 0),
  'o-all': st('o-all', orders.value.length > 0),
}));
const currentKey = computed(() => metas.find((m) => runtime.value[m.key].state !== 'done')?.key || 'o-all');
function jump(key: string): void { void scrollToStep(key); }
</script>

<style scoped>
.zc-order { display: grid; gap: 6px; padding: 10px 12px; border: 1px solid var(--color-border); border-radius: 12px; }
.zc-order__head { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; font-size: 13px; }
.zc-order p { margin: 0; }
.zc-order input { height: 30px; border-radius: 8px; border: 1px solid var(--color-border); background: var(--color-bg-input, var(--color-bg-primary)); color: var(--color-text-primary); font: inherit; font-size: 12.5px; padding: 0 8px; }
.zc-grow { flex: 1; }
.zc-start { justify-self: start; }
.zc-scroll { max-height: 420px; overflow-y: auto; }
.zc-ops { display: flex; gap: 10px; align-items: center; }
</style>
