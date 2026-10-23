<template>
  <div class="ss-module">
    <StickyProgress :title="$t('询价报价')" :metas="metas" :runtime="runtime" :current-key="currentKey" @jump="jump" />
    <div class="ss-steps">
      <StepCard step-key="q-read" :index="0" :title="metas[0].title" :hint="metas[0].hint" :runtime="runtime['q-read']" :is-current="currentKey === 'q-read'">
        <ReadBack kind="inquiry" :hand-label="$t('让数字员工读取待报价的询价单')" :conv-title="$t('政采云：读取待报价询价单')" @done="readDone = true">
          <button type="button" class="ss-btn" :disabled="!!busy" data-test="zc-inquiry-add" @click="addManual"><i class="ri-add-line"></i>{{ $t('手动添加一张') }}</button>
        </ReadBack>
      </StepCard>

      <StepCard step-key="q-price" :index="1" :title="metas[1].title" :hint="metas[1].hint" :runtime="runtime['q-price']" :is-current="currentKey === 'q-price'">
        <p class="ss-muted">{{ $t('报价 = 你的含税到货成本 ×（1 + 目标毛利率），进到分；超过单价限价就压到限价。限价低于成本、合计超预算的不让确认。在线询价只有一轮报价，最低价成交。') }}</p>
        <p v-if="!open.length" class="ss-empty">{{ $t('读回或添加询价单后在这里填成本') }}</p>
        <div v-for="q in open" :key="q.id" class="zc-inq" :class="{ bad: q.issues.some((i) => i.level === 'error') }" :data-test="`zc-inq-${q.no || q.title}`">
          <div class="zc-inq__head">
            <span class="ss-chip" :class="q.status === 'confirmed' ? 'ok' : q.status === 'priced' ? 'brand' : ''">{{ inquiryStatusLabel(q.status) }}</span>
            <input v-model="edits[q.id].title" type="text" class="zc-title" :placeholder="$t('项目名称')" />
            <input v-model="edits[q.id].no" type="text" class="zc-no" :placeholder="$t('询价单号')" />
            <span class="ss-muted">{{ q.buyer }}</span>
            <span class="zc-grow"></span>
            <span class="ss-chip" :class="deadlineClass(q.id)">{{ $t('截止 {p0}', { p0: deadlineText(q.deadline) }) }}</span>
            <button type="button" class="ss-link" @click="skip(q.id)">{{ $t('不参与') }}</button>
          </div>
          <div class="ss-table-wrap">
            <table class="ss-table">
              <thead><tr><th>{{ $t('名称') }}</th><th>{{ $t('规格要求') }}</th><th class="num">{{ $t('数量') }}</th><th>{{ $t('单位') }}</th><th class="num">{{ $t('单价限价') }}</th><th class="num">{{ $t('我方成本（含税到货）') }}</th><th class="num">{{ $t('报价') }}</th><th></th></tr></thead>
              <tbody>
                <tr v-for="(it, n) in edits[q.id].items" :key="n">
                  <td><input v-model="it.name" type="text" /></td>
                  <td><input v-model="it.spec" type="text" /></td>
                  <td class="num"><input v-model.number="it.qty" type="number" min="0" class="zc-num" /></td>
                  <td><input v-model="it.unit" type="text" class="zc-unit" /></td>
                  <td class="num"><input v-model.number="it.ceiling" type="number" min="0" step="0.01" class="zc-num" /></td>
                  <td class="num"><input v-model.number="it.cost" type="number" min="0" step="0.01" class="zc-num" :data-test="`zc-cost-${n}`" /></td>
                  <td class="num"><b :data-test="`zc-quote-${n}`">{{ q.items[n]?.quote ? money(q.items[n].quote) : '—' }}</b></td>
                  <td><button type="button" class="ss-link" @click="edits[q.id].items.splice(n, 1)">{{ $t('移除') }}</button></td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="ss-actions">
            <button type="button" class="ss-btn sm" @click="edits[q.id].items.push({ name: '', spec: '', qty: 1, unit: '', ceiling: 0, cost: 0, quote: 0 })"><i class="ri-add-line"></i>{{ $t('加一行') }}</button>
            <label class="ss-field inline"><span>{{ $t('目标毛利率 %') }}</span><input v-model.number="edits[q.id].marginPct" type="number" min="0" step="0.5" class="zc-num" /></label>
            <label class="ss-field inline"><span>{{ $t('预算 / 总限价') }}</span><input v-model.number="edits[q.id].budget" type="number" min="0" class="zc-num" /></label>
            <label class="ss-field inline"><span>{{ $t('截止时间') }}</span><input v-model="edits[q.id].deadline" type="datetime-local" /></label>
            <span class="zc-grow"></span>
            <b v-if="q.total" class="zc-total" data-test="zc-inq-total">{{ $t('合计 {p0} 元', { p0: money(q.total) }) }}</b>
          </div>
          <label class="ss-field"><span>{{ $t('响应说明（可选，会原样填到报价页）') }}</span><input v-model="edits[q.id].note" type="text" /></label>
          <p v-for="(i, n) in q.issues" :key="n" class="ss-note" :class="i.level === 'error' ? 'danger' : 'warn'"><i class="ri-error-warning-line"></i>{{ i.message }}</p>
          <div class="ss-actions">
            <button type="button" class="ss-btn primary" :disabled="!!busy" :data-test="`zc-price-${q.no || q.title}`" @click="price(q.id)"><i class="ri-calculator-line"></i>{{ $t('保存并算报价') }}</button>
            <button v-if="q.status === 'priced'" type="button" class="ss-btn" :disabled="!!busy || q.issues.some((i) => i.level === 'error')" :data-test="`zc-inq-confirm-${q.no || q.title}`" @click="setStatus(q.id, 'confirmed')"><i class="ri-check-line"></i>{{ $t('确认报价') }}</button>
            <button type="button" class="ss-link" @click="remove(q.id)">{{ $t('删除') }}</button>
          </div>
        </div>
      </StepCard>

      <StepCard step-key="q-hand" :index="2" :title="metas[2].title" :hint="metas[2].hint" :runtime="runtime['q-hand']" :is-current="currentKey === 'q-hand'">
        <p v-if="!confirmed.length" class="ss-empty">{{ $t('没有已确认的报价') }}</p>
        <div v-for="q in confirmed" :key="q.id" class="ss-actions">
          <b>{{ q.title || q.no }}</b><span class="ss-muted">{{ $t('合计 {p0} 元', { p0: money(q.total) }) }}</span>
          <button type="button" class="ss-btn sm primary" :disabled="!!busy" @click="hand(q)"><i class="ri-robot-2-line"></i>{{ $t('交给数字员工填报价（停在提交前）') }}</button>
          <button type="button" class="ss-link" :data-test="`zc-inq-preview-${q.no || q.title}`" @click="preview(q.id)">{{ $t('看指令') }}</button>
          <button type="button" class="ss-link" @click="setStatus(q.id, 'priced')">{{ $t('撤回确认') }}</button>
        </div>
        <pre v-if="instruction" class="zc-pre" data-test="zc-quote-instruction">{{ instruction }}</pre>
      </StepCard>

      <StepCard step-key="q-result" :index="3" :title="metas[3].title" :hint="metas[3].hint" :runtime="runtime['q-result']" :is-current="currentKey === 'q-result'">
        <p v-if="!done.length" class="ss-empty">{{ $t('交出去的报价在这里登记结果') }}</p>
        <div v-else class="ss-table-wrap">
          <table class="ss-table">
            <thead><tr><th>{{ $t('询价单') }}</th><th>{{ $t('采购单位') }}</th><th class="num">{{ $t('报价合计') }}</th><th>{{ $t('状态') }}</th><th></th></tr></thead>
            <tbody>
              <tr v-for="q in done" :key="q.id">
                <td>{{ q.title || q.no }}</td><td>{{ q.buyer }}</td><td class="num">{{ q.total ? money(q.total) : '—' }}</td>
                <td><span class="ss-chip" :class="q.status === 'won' ? 'ok' : q.status === 'lost' ? 'bad' : 'brand'">{{ inquiryStatusLabel(q.status) }}</span></td>
                <td class="zc-ops">
                  <button v-if="q.conversationId" type="button" class="ss-link" @click="openConv(q.conversationId)">{{ $t('执行过程') }}</button>
                  <button v-if="q.status === 'handed'" type="button" class="ss-link" @click="setStatus(q.id, 'submitted')">{{ $t('我已提交报价') }}</button>
                  <template v-if="q.status === 'submitted'"><button type="button" class="ss-link" @click="setStatus(q.id, 'won')">{{ $t('成交') }}</button><button type="button" class="ss-link" @click="setStatus(q.id, 'lost')">{{ $t('未成交') }}</button></template>
                  <button type="button" class="ss-link" @click="remove(q.id)">{{ $t('删除') }}</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </StepCard>
    </div>
  </div>
</template>

<script setup lang="ts">
/** 询价报价：读回询价单 → 填成本、规则算报价并确认 → 数字员工填写（停在提交报价前）→ 登记结果。 */
import { computed, reactive, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import type { ZcInquiry, ZcInquiryItem, ZcInquiryStatus } from '@totalclaw/ipc-contracts';
import { useNotificationStore } from '../../stores/notification';
import { t as i18nT } from '../../i18n';
import StepCard from '../service-settlement/StepCard.vue';
import StickyProgress from '../service-settlement/StickyProgress.vue';
import ReadBack from './ReadBack.vue';
import { deadlineText, ensureSite, errorMessage, handToDigitalEmployee, inquiryStatusLabel, money, refreshState, scrollToStep, zc, zcState, type StepMeta, type StepRuntime } from './shared';

interface Edit { title: string; no: string; note: string; marginPct: number; budget: number; deadline: string; items: ZcInquiryItem[] }

const notif = useNotificationStore();
const router = useRouter();
const state = zcState;
const busy = ref('');
const errors = ref<Record<string, string>>({});
const readDone = ref(false);
const instruction = ref('');
const inquiries = computed<ZcInquiry[]>(() => state.value?.inquiries || []);
const open = computed(() => inquiries.value.filter((q) => q.status === 'new' || q.status === 'priced'));
const confirmed = computed(() => inquiries.value.filter((q) => q.status === 'confirmed'));
const done = computed(() => inquiries.value.filter((q) => ['handed', 'submitted', 'won', 'lost', 'skipped'].includes(q.status)));
const edits = reactive<Record<string, Edit>>({});

const localDt = (iso: string): string => {
  const d = new Date(iso);
  if (!iso || !Number.isFinite(d.getTime())) return '';
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
};
const seed = (q: ZcInquiry): Edit => ({ title: q.title, no: q.no, note: q.note, marginPct: Math.round(q.margin * 10000) / 100, budget: q.budget, deadline: localDt(q.deadline), items: q.items.map((i) => ({ ...i })) });
// 只在第一次见到、或主进程里的内容更新后（updatedAt 变了）才重灌编辑区，不冲掉正在填的成本
const stamps: Record<string, string> = {};
watch(inquiries, (qs) => { for (const q of qs) if (stamps[q.id] !== q.updatedAt) { stamps[q.id] = q.updatedAt; edits[q.id] = seed(q); } }, { immediate: true });
const deadlineClass = (id: string) => { const a = state.value?.alerts.find((x) => x.kind === 'inquiry_deadline' && x.refId === id); return a ? (a.level === 'error' ? 'bad' : 'warn') : ''; };

async function run(key: string, fn: () => Promise<unknown>): Promise<boolean> {
  busy.value = key;
  errors.value = { ...errors.value, [key]: '' };
  try { await fn(); await refreshState(); return true; } catch (e) { errors.value = { ...errors.value, [key]: errorMessage(e) }; void scrollToStep(key); return false; } finally { busy.value = ''; }
}
async function addManual(): Promise<void> {
  await run('q-read', () => zc('inquiry.save', { patch: { title: i18nT('新询价单'), items: [{ name: i18nT('货物'), spec: '', qty: 1, unit: '', ceiling: 0, cost: 0 }] } }));
  readDone.value = true;
}
async function price(id: string): Promise<void> {
  const e = edits[id];
  await run('q-price', async () => {
    await zc('inquiry.save', { id, patch: { title: e.title, no: e.no, note: e.note, margin: (Number(e.marginPct) || 0) / 100, budget: e.budget, deadline: e.deadline ? new Date(e.deadline).toISOString() : '', items: e.items } });
    await zc('inquiry.price', { id });
  });
}
async function setStatus(id: string, status: ZcInquiryStatus): Promise<void> { await run(status === 'confirmed' || status === 'priced' ? 'q-price' : 'q-result', () => zc('inquiry.status', { id, status })); }
async function skip(id: string): Promise<void> { await run('q-price', () => zc('inquiry.status', { id, status: 'skipped' })); }
async function remove(id: string): Promise<void> {
  if (!window.confirm(i18nT('删除这张询价单？'))) return;
  await run('q-price', () => zc('inquiry.remove', { id }));
}
async function preview(id: string): Promise<void> { await run('q-hand', async () => { instruction.value = await zc<string>('inquiry.instruction', { id }); }); }
async function hand(q: ZcInquiry): Promise<void> {
  const ok = await run('q-hand', async () => {
    await ensureSite();
    const text = await zc<string>('inquiry.instruction', { id: q.id });
    const conv = await handToDigitalEmployee(i18nT('政采云报价：{p0}', { p0: (q.title || q.no).slice(0, 20) }), text);
    await zc('inquiry.status', { id: q.id, status: 'handed', conversationId: conv });
    instruction.value = '';
  });
  if (ok) notif.success(i18nT('已交给数字员工，它会停在「提交报价」前等你确认'));
}
function openConv(id: string): void { void router.push(`/conversations/${id}`).catch((e) => notif.error(errorMessage(e))); }

const metas: StepMeta[] = [
  { key: 'q-read', title: i18nT('读回询价单'), hint: i18nT('数字员工只读待报价的在线询价 / 反向竞价') },
  { key: 'q-price', title: i18nT('填成本、算报价并确认'), hint: i18nT('报价由规则算，限价低于成本或超预算会拦下') },
  { key: 'q-hand', title: i18nT('数字员工填报价'), hint: i18nT('逐项照抄单价，停在提交报价前') },
  { key: 'q-result', title: i18nT('登记结果'), hint: i18nT('已提交、成交、未成交') },
];
function st(key: string, ok: boolean, summary?: string): StepRuntime {
  if (busy.value === key) return { state: 'running' };
  if (errors.value[key]) return { state: 'failed', error: errors.value[key] };
  return ok ? { state: 'done', summary } : { state: 'todo' };
}
const runtime = computed<Record<string, StepRuntime>>(() => ({
  'q-read': st('q-read', readDone.value || inquiries.value.length > 0, i18nT('{n} 张', { n: inquiries.value.length })),
  'q-price': st('q-price', inquiries.value.length > 0 && open.value.length === 0),
  'q-hand': st('q-hand', done.value.some((q) => q.status !== 'skipped') && confirmed.value.length === 0),
  'q-result': st('q-result', done.value.length > 0 && !done.value.some((q) => q.status === 'handed' || q.status === 'submitted')),
}));
const currentKey = computed(() => metas.find((m) => runtime.value[m.key].state !== 'done')?.key || 'q-result');
function jump(key: string): void { void scrollToStep(key); }
</script>

<style scoped>
.zc-inq { display: grid; gap: 8px; padding: 12px; border: 1px solid var(--color-border); border-radius: var(--radius-5); }
.zc-inq.bad { border-color: color-mix(in srgb, var(--color-danger) 45%, var(--color-border)); }
.zc-inq__head { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; font-size: var(--font-size-md); }
.zc-inq__head input { height: 30px; border-radius: var(--radius-3); border: 1px solid var(--color-border); background: var(--color-bg-input); color: var(--color-text-primary); font: inherit; font-size: var(--font-size-md); padding: 0 8px; }
.zc-title { font-weight: 700; min-width: 240px; flex: 1; }
.zc-no { width: 170px; }
.zc-grow { flex: 1; }
.zc-num { width: 100px !important; min-width: 0 !important; text-align: end; }
.zc-unit { width: 60px !important; min-width: 0 !important; }
.zc-total { font-variant-numeric: tabular-nums; }
.zc-ops { display: flex; gap: 10px; align-items: center; }
.zc-pre { margin: 0; padding: 12px; border-radius: var(--radius-4); background: var(--color-bg-hover); font: 12px/1.6 var(--font-mono); white-space: pre-wrap; max-height: 320px; overflow: auto; }
</style>
