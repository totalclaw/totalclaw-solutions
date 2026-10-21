<template>
  <div class="ss-module">
    <ModuleHeader :meta="meta" />

    <p class="ss-note warn">
      <i class="ri-shield-keyhole-line"></i>
      {{ $t('电子税务局没有给企业开放申报接口，登录必须本人扫码或用 CA 证书，申报提交在法律上由纳税人本人确认。所以这里的做法是：你登录 → 数字员工按草稿代填 → 停在「提交」前 → 你核对后亲自点提交。') }}
    </p>

    <!-- 本期申报期限 -->
    <section class="ss-panel">
      <header>
        <strong><i class="ri-calendar-check-line"></i> {{ $t('本期申报期限') }}</strong>
        <span class="ss-muted">{{ $t('按所属期结束后次月 15 日计算；遇节假日顺延，以电子税务局申报日历为准。') }}</span>
      </header>
      <div class="fa-deadlines">
        <div v-for="d in meta2.deadlines" :key="d.tax + d.period" class="fa-deadline" :class="{ done: d.done, soon: !d.done && d.daysLeft <= 5, over: !d.done && d.daysLeft < 0 }">
          <strong>{{ d.label }}</strong>
          <span>{{ $t('所属期 {p0}', { p0: d.period }) }}</span>
          <span>{{ $t('截止 {p0}', { p0: d.due }) }}</span>
          <em v-if="d.done" class="ss-chip ok">{{ $t('已申报') }}</em>
          <em v-else-if="d.daysLeft < 0" class="ss-chip bad">{{ $t('已逾期 {n} 天', { n: -d.daysLeft }) }}</em>
          <em v-else class="ss-chip" :class="d.daysLeft <= 5 ? 'warn' : ''">{{ $t('还剩 {n} 天', { n: d.daysLeft }) }}</em>
        </div>
      </div>
    </section>

    <div class="fa-split">
      <aside class="fa-list">
        <div class="ss-subhead">{{ $t('申报记录') }}</div>
        <ul>
          <li v-for="f in filings" :key="f.id" :class="{ active: f.id === selectedId }" @click="selectedId = f.id">
            <div class="fa-list__top"><strong>{{ f.period }}</strong><span class="ss-chip" :class="progressOf(f).filed === progressOf(f).total ? 'ok' : 'warn'">{{ $t('{a}/{b} 已申报', { a: progressOf(f).filed, b: progressOf(f).total }) }}</span></div>
            <div class="fa-list__meta"><span>{{ fmtDateTime(f.createdAt) }}</span><button type="button" class="ss-link" @click.stop="remove(f)">{{ $t('删除') }}</button></div>
          </li>
          <li v-if="!filings.length" class="ss-empty">{{ $t('还没有申报记录') }}</li>
        </ul>
        <button type="button" class="ss-btn sm ghost" :disabled="!filings.length" @click="exportLedger"><i class="ri-file-excel-2-line"></i>{{ $t('导出申报台账') }}</button>
      </aside>

      <section class="fa-detail">
        <StickyProgress :title="$t('申报上报')" :metas="metas" :runtime="runtime" :current-key="currentKey" @jump="scrollTo" />
        <div class="ss-steps">
          <!-- 1 选草稿 -->
          <StepCard step-key="draft" :index="0" :title="metas[0].title" :hint="metas[0].hint" :runtime="runtime.draft">
            <div class="ss-grid">
              <label class="ss-field"><span>{{ $t('申报草稿（税务申报智能体算好的）') }}</span>
                <select v-model="runId">
                  <option value="">{{ $t('请选择') }}</option>
                  <option v-for="r in taxRuns" :key="r.id" :value="r.id">{{ $t('{p0}：增值税 {a}，附加 {b}，所得税 {c}，个税 {d}', { p0: r.period, a: fmtMoney(r.result.vatPayable), b: fmtMoney(r.result.surchargeTotal), c: fmtMoney(r.result.citPayable), d: fmtMoney(r.result.iitTotal) }) }}</option>
                </select>
              </label>
              <label class="ss-field"><span>{{ $t('同时报送财务报表（可选）') }}</span>
                <select v-model="statementId">
                  <option value="">{{ $t('不报送') }}</option>
                  <option v-for="s in statements" :key="s.id" :value="s.id">{{ s.period }}</option>
                </select>
              </label>
            </div>
            <p v-if="!taxRuns.length" class="ss-note info"><i class="ri-information-line"></i>{{ $t('还没有申报草稿，先到「税务申报」算好税额。') }} <button type="button" class="ss-link" @click="$emit('goto', 'tax')">{{ $t('去税务申报') }}</button></p>
            <div class="ss-actions">
              <button type="button" class="ss-btn primary" :disabled="!runId || !!busy" @click="create"><i class="ri-list-check-2"></i>{{ $t('生成待报事项') }}</button>
            </div>
            <div v-if="current" class="ss-table-wrap">
              <table class="ss-table">
                <thead><tr><th>{{ $t('税种') }}</th><th class="num">{{ $t('应纳（补）税额') }}</th><th>{{ $t('状态') }}</th></tr></thead>
                <tbody>
                  <tr v-for="i in current.items" :key="i.tax"><td>{{ taxName(i.tax) }}</td><td class="num">{{ i.tax === 'statements' ? '—' : fmtMoney(i.amount) }}</td><td><span class="ss-chip" :class="statusChip(i.status)">{{ statusLabel(i.status) }}</span></td></tr>
                </tbody>
              </table>
            </div>
            <p v-if="current && current.items.some((i) => i.tax !== 'statements' && !i.amount)" class="ss-muted">{{ $t('税额为 0 的税种也要按期申报（零申报），否则算逾期未申报。') }}</p>
          </StepCard>

          <!-- 2 核对清单 -->
          <StepCard step-key="check" :index="1" :title="metas[1].title" :hint="metas[1].hint" :runtime="runtime.check">
            <ul v-if="current" class="fa-checklist">
              <li v-for="c in meta2.checklist" :key="c.key">
                <label><input type="checkbox" :checked="!!current.checklist[c.key]" @change="check(c.key, ($event.target as HTMLInputElement).checked)" /><span>{{ c.label }}</span></label>
              </li>
            </ul>
            <p v-else class="ss-muted">{{ $t('先生成待报事项') }}</p>
          </StepCard>

          <!-- 3 登录 -->
          <StepCard step-key="login" :index="2" :title="metas[2].title" :hint="metas[2].hint" :runtime="runtime.login">
            <div class="ss-grid">
              <label class="ss-field"><span>{{ $t('所在省份') }}</span>
                <select v-model="portal.province" @change="savePortal">
                  <option v-for="p in meta2.provinces" :key="p.code" :value="p.code">{{ p.name }}</option>
                </select>
              </label>
              <label class="ss-field"><span>{{ $t('或自定义地址') }}</span><input v-model.trim="portal.url" type="text" placeholder="https://etax.xxx.chinatax.gov.cn" @change="savePortal" /></label>
            </div>
            <div class="ss-actions">
              <code class="fa-url">{{ meta2.portal }}</code>
              <button type="button" class="ss-btn primary" :disabled="!current || !checklistDone" @click="openPortal"><i class="ri-global-line"></i>{{ $t('在内置浏览器打开电子税务局') }}</button>
              <label class="fa-inline"><input v-model="loggedIn" type="checkbox" :disabled="!opened" /><span>{{ $t('我已登录（本人扫码 / CA）') }}</span></label>
            </div>
            <p v-if="current && !checklistDone" class="ss-muted">{{ $t('核对清单全部勾完才能继续。') }}</p>
          </StepCard>

          <!-- 4 数字员工代填 -->
          <StepCard step-key="fill" :index="3" :title="metas[3].title" :hint="metas[3].hint" :runtime="runtime.fill">
            <div class="ss-actions">
              <button type="button" class="ss-btn ghost" :disabled="!current || !checklistDone || !!busy" @click="preview"><i class="ri-eye-line"></i>{{ $t('预览代填清单') }}</button>
              <button type="button" class="ss-btn primary" :disabled="!current || !checklistDone || !loggedIn || !!busy" @click="handOver"><i class="ri-robot-2-line"></i>{{ $t('交给数字员工代填') }}</button>
              <button v-if="current?.conversationId" type="button" class="ss-btn sm ghost" @click="router.push(`/conversations/${current.conversationId}`)"><i class="ri-eye-line"></i>{{ $t('查看代填过程') }}</button>
            </div>
            <p class="ss-muted">{{ $t('数字员工只填写，不点「提交申报」「缴款」；电子税务局预填的数据和草稿不一致时，它会停下来把两边数字列给你。') }}</p>
            <template v-if="instruction">
              <textarea class="fa-instruction" readonly :value="instruction" rows="12"></textarea>
              <div class="ss-actions"><button type="button" class="ss-btn sm ghost" @click="copy(instruction)"><i class="ri-file-copy-line"></i>{{ $t('复制（也可以照着自己填）') }}</button></div>
            </template>
          </StepCard>

          <!-- 5 提交与回执 -->
          <StepCard step-key="receipt" :index="4" :title="metas[4].title" :hint="metas[4].hint" :runtime="runtime.receipt">
            <p class="ss-note info"><i class="ri-hand"></i>{{ $t('在电子税务局核对代填结果无误后，由你本人点「提交申报」并缴款，然后回到这里登记。') }}</p>
            <div v-if="current" class="ss-table-wrap">
              <table class="ss-table">
                <thead><tr><th>{{ $t('税种') }}</th><th class="num">{{ $t('应纳税额') }}</th><th>{{ $t('状态') }}</th><th>{{ $t('回执号') }}</th><th class="num">{{ $t('缴款金额') }}</th><th>{{ $t('回执') }}</th></tr></thead>
                <tbody>
                  <tr v-for="i in current.items" :key="i.tax">
                    <td>{{ taxName(i.tax) }}</td>
                    <td class="num">{{ i.tax === 'statements' ? '—' : fmtMoney(i.amount) }}</td>
                    <td>
                      <select :value="i.status" @change="updateItem(i.tax, { status: ($event.target as HTMLSelectElement).value as any })">
                        <option value="pending">{{ statusLabel('pending') }}</option>
                        <option value="handed">{{ statusLabel('handed') }}</option>
                        <option value="filed">{{ statusLabel('filed') }}</option>
                        <option v-if="i.tax !== 'statements'" value="paid">{{ statusLabel('paid') }}</option>
                      </select>
                    </td>
                    <td><input :value="i.receiptNo || ''" type="text" @change="updateItem(i.tax, { receiptNo: ($event.target as HTMLInputElement).value })" /></td>
                    <td class="num"><input v-if="i.tax !== 'statements'" :value="i.paidAmount ?? ''" type="number" step="0.01" @change="updateItem(i.tax, { paidAmount: Number(($event.target as HTMLInputElement).value) })" /></td>
                    <td>
                      <button v-if="i.receiptPath" type="button" class="ss-link" @click="openPath(i.receiptPath)">{{ $t('查看') }}</button>
                      <button type="button" class="ss-link" @click="attach(i.tax)">{{ i.receiptPath ? $t('替换') : $t('上传回执') }}</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p v-if="current && paidMismatch.length" class="ss-note warn"><i class="ri-error-warning-line"></i>{{ $t('缴款金额与草稿不一致：{p0}。请确认是电子税务局按预填数据调整了，还是草稿有误。', { p0: paidMismatch.join(i18nT('、')) }) }}</p>
          </StepCard>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 申报上报：选草稿 → 核对清单 → 本人登录电子税务局 → 数字员工代填（停在提交前）→ 本人提交、登记回执与缴款。
 * 电子税务局不对企业开放申报接口，所以不做「一键上报」；提交这一下永远是人点。
 */
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import type { FaDeadline, FaFiling, FaFilingItem, FaFilingStatus, FaFilingTax } from '@totalclaw/ipc-contracts';
import { useNotificationStore } from '../../stores/notification';
import { t as i18nT } from '../../i18n';
import StepCard from '../service-settlement/StepCard.vue';
import StickyProgress from '../service-settlement/StickyProgress.vue';
import { openEmbeddedBrowser } from '../service-settlement/shared';
import ModuleHeader from './ModuleHeader.vue';
import {
  errorMessage, fa, faState, fmtDateTime, fmtMoney, openPath as openFile, pickFiles, refreshState, scrollToStep,
  type FaModuleMeta, type StepMeta, type StepRuntime,
} from './shared';

defineProps<{ meta: FaModuleMeta; focus?: any }>();
defineEmits<{ (e: 'goto', module: string, payload?: any): void }>();
const notif = useNotificationStore();
const router = useRouter();

const meta2 = reactive<{ checklist: Array<{ key: string; label: string }>; provinces: Array<{ code: string; name: string }>; portal: string; deadlines: Array<FaDeadline & { label: string }> }>({ checklist: [], provinces: [], portal: '', deadlines: [] });
const data = computed(() => faState.value?.data);
const filings = computed<FaFiling[]>(() => data.value?.filings || []);
const taxRuns = computed(() => data.value?.taxRuns || []);
const statements = computed(() => data.value?.statements || []);
const selectedId = ref('');
const current = computed(() => filings.value.find((f) => f.id === selectedId.value) || null);
const runId = ref('');
const statementId = ref('');
const busy = ref('');
const errors = ref<Record<string, string>>({});
const opened = ref(false);
const loggedIn = ref(false);
const instruction = ref('');
const portal = reactive({ province: '', url: '' });

const checklistDone = computed(() => !!current.value && meta2.checklist.every((c) => current.value!.checklist[c.key]));
const paidMismatch = computed(() => (current.value?.items || []).filter((i) => i.status === 'paid' && i.paidAmount != null && Math.abs(i.paidAmount - i.amount) >= 0.01).map((i) => taxName(i.tax)));

watch(filings, (l) => { if (!selectedId.value && l.length) selectedId.value = l[0].id; }, { immediate: true });
watch(selectedId, () => { errors.value = {}; instruction.value = ''; opened.value = false; loggedIn.value = false; if (current.value) runId.value = current.value.taxRunId; });
watch(taxRuns, (l) => { if (!runId.value && l.length) runId.value = l[0].id; }, { immediate: true });

const metas: StepMeta[] = [
  { key: 'draft', title: i18nT('选申报草稿'), hint: i18nT('从税务申报智能体算好的草稿生成本期待报税种') },
  { key: 'check', title: i18nT('申报前核对'), hint: i18nT('逐项勾完才能进入电子税务局') },
  { key: 'login', title: i18nT('登录电子税务局'), hint: i18nT('在内置浏览器打开，由你本人扫码或用 CA 登录') },
  { key: 'fill', title: i18nT('数字员工代填'), hint: i18nT('按草稿逐表填写，停在「提交」前') },
  { key: 'receipt', title: i18nT('提交与回执'), hint: i18nT('你本人提交并缴款，回来登记回执号与缴款') },
];
const runtime = computed<Record<string, StepRuntime>>(() => {
  const f = current.value;
  const st = (key: string, done: boolean, summary?: string): StepRuntime => (busy.value === key ? { state: 'running' }
    : errors.value[key] ? { state: 'failed', error: errors.value[key] } : done ? { state: 'done', summary } : { state: 'todo' });
  const filed = f ? f.items.filter((i) => i.status === 'filed' || i.status === 'paid').length : 0;
  return {
    draft: st('draft', !!f, f ? i18nT('{p0}，{n} 个税种', { p0: f.period, n: f.items.length }) : ''),
    check: st('check', checklistDone.value, i18nT('已全部核对')),
    login: st('login', loggedIn.value || !!f?.handedAt, i18nT('已登录')),
    fill: st('fill', !!f?.handedAt, f?.handedAt ? i18nT('{p0} 交给数字员工', { p0: fmtDateTime(f.handedAt) }) : ''),
    receipt: st('receipt', !!f && filed === f.items.length, f ? i18nT('{a}/{b} 已申报', { a: filed, b: f.items.length }) : ''),
  };
});
const currentKey = computed(() => metas.find((m) => runtime.value[m.key].state !== 'done')?.key || 'receipt');

function taxName(t: FaFilingTax): string {
  return { vat: i18nT('增值税'), surcharge: i18nT('附加税费'), cit: i18nT('企业所得税（预缴）'), iit: i18nT('个人所得税（扣缴）'), statements: i18nT('财务报表报送') }[t];
}
function statusLabel(s: FaFilingStatus): string {
  return { pending: i18nT('待申报'), handed: i18nT('已交数字员工代填'), filed: i18nT('已申报'), paid: i18nT('已缴款') }[s];
}
function statusChip(s: FaFilingStatus): string { return s === 'paid' || s === 'filed' ? 'ok' : s === 'handed' ? 'brand' : 'warn'; }
function progressOf(f: FaFiling) { return { total: f.items.length, filed: f.items.filter((i) => i.status === 'filed' || i.status === 'paid').length }; }

async function loadMeta(): Promise<void> {
  try {
    Object.assign(meta2, await fa('filing.meta'));
    const p = faState.value?.settings.taxPortal;
    portal.province = p?.province || '';
    portal.url = p?.url || '';
  } catch (e) { notif.error(errorMessage(e)); }
}
onMounted(loadMeta);
watch(filings, () => { void loadMeta(); });

async function run(key: string, fn: () => Promise<unknown>): Promise<boolean> {
  busy.value = key;
  errors.value = { ...errors.value, [key]: '' };
  void scrollToStep(key);
  try { await fn(); await refreshState(); return true; } catch (e) { errors.value = { ...errors.value, [key]: errorMessage(e) }; return false; } finally { busy.value = ''; }
}
async function create(): Promise<void> {
  await run('draft', async () => {
    const f = await fa<FaFiling>('filing.create', { taxRunId: runId.value, statementId: statementId.value || undefined });
    selectedId.value = f.id;
  });
}
async function check(key: string, value: boolean): Promise<void> {
  if (!current.value) return;
  try { await fa('filing.check', { id: current.value.id, key, value }); await refreshState(); } catch (e) { notif.error(errorMessage(e)); }
}
async function savePortal(): Promise<void> {
  try { await fa('settings.patch', { patch: { taxPortal: { province: portal.province, url: portal.url } } }); await refreshState(); await loadMeta(); } catch (e) { notif.error(errorMessage(e)); }
}
async function openPortal(): Promise<void> {
  const id = faState.value?.activeLedgerId || 'default';
  // 每个账套单独一个浏览器上下文：代账公司不同客户的登录态互不串
  const ok = await openEmbeddedBrowser(meta2.portal, `finance-etax-${id}`);
  if (!ok) { notif.error(i18nT('内置浏览器不可用')); return; }
  opened.value = true;
}
async function preview(): Promise<void> {
  if (!current.value) return;
  await run('fill', async () => { instruction.value = await fa<string>('filing.instruction', { id: current.value!.id }); });
}
async function handOver(): Promise<void> {
  const f = current.value;
  if (!f) return;
  const ok = await run('fill', async () => {
    const text = await fa<string>('filing.instruction', { id: f.id });
    instruction.value = text;
    const api = (window as any).electronAPI;
    const conv = await api.conversation.create({ kind: 'single', members: ['general_assistant'], title: i18nT('代填申报：{p0} {p1}', { p0: faState.value?.ledgers.find((l) => l.id === faState.value?.activeLedgerId)?.name || '', p1: f.period }), initialMessage: text });
    void api.conversation.sendMessage(conv.id, text);
    await fa('filing.handed', { id: f.id, conversationId: conv.id });
  });
  if (ok) notif.success(i18nT('已交给数字员工代填；填完它会停在提交前请你核对'));
}
async function updateItem(tax: FaFilingTax, patch: Partial<FaFilingItem>): Promise<void> {
  if (!current.value) return;
  try { await fa('filing.updateItem', { id: current.value.id, tax, patch }); await refreshState(); } catch (e) { notif.error(errorMessage(e)); }
}
async function attach(tax: FaFilingTax): Promise<void> {
  if (!current.value) return;
  const paths = await pickFiles('invoice', false);
  if (!paths[0]) return;
  try { await fa('filing.attachReceipt', { id: current.value.id, tax, path: paths[0] }); await refreshState(); } catch (e) { notif.error(errorMessage(e)); }
}
async function remove(f: FaFiling): Promise<void> {
  if (!window.confirm(i18nT('删除 {p0} 的申报记录？（不影响电子税务局里已提交的申报）', { p0: f.period }))) return;
  try { await fa('filing.remove', { id: f.id }); if (selectedId.value === f.id) selectedId.value = ''; await refreshState(); } catch (e) { notif.error(errorMessage(e)); }
}
async function exportLedger(): Promise<void> {
  try { const r = await fa<{ path: string }>('filing.export'); await openFile(r.path, true); } catch (e) { notif.error(errorMessage(e)); }
}
function openPath(p: string): void { void openFile(p).catch((e) => notif.error(errorMessage(e))); }
async function copy(text: string): Promise<void> {
  try { await navigator.clipboard.writeText(text); notif.success(i18nT('已复制')); } catch { notif.error(i18nT('复制失败')); }
}
function scrollTo(key: string): void { void scrollToStep(key); }
</script>

<style scoped>
.ss-panel > header strong { display: flex; gap: 6px; align-items: center; }
.fa-deadlines { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 8px; }
.fa-deadline { display: grid; gap: 2px; padding: 8px 10px; border-radius: 10px; border: 1px solid var(--color-border); background: var(--color-bg-primary); font-size: 12px; color: var(--color-text-secondary); }
.fa-deadline strong { font-size: 13px; color: var(--color-text-primary); }
.fa-deadline em { justify-self: start; font-style: normal; }
.fa-deadline.soon { border-color: var(--color-warning); }
.fa-deadline.over { border-color: var(--color-danger); }
.fa-split { display: grid; grid-template-columns: minmax(200px, 250px) 1fr; gap: 14px; align-items: start; }
@media (max-width: 960px) { .fa-split { grid-template-columns: 1fr; } }
.fa-list { display: grid; gap: 8px; border: 1px solid var(--color-border); border-radius: 14px; background: var(--color-bg-card); padding: 10px; position: sticky; top: 0; }
.fa-list ul { list-style: none; margin: 0; padding: 0; display: grid; gap: 6px; max-height: 50vh; overflow-y: auto; }
.fa-list li { padding: 8px 10px; border-radius: 10px; border: 1px solid transparent; cursor: pointer; display: grid; gap: 3px; background: var(--color-bg-primary); }
.fa-list li.active { border-color: var(--color-brand); }
.fa-list__top { display: flex; justify-content: space-between; gap: 6px; align-items: center; font-size: 13px; }
.fa-list__meta { display: flex; gap: 8px; font-size: 11px; color: var(--color-text-secondary); }
.fa-detail { display: grid; gap: 12px; min-width: 0; }
.fa-checklist { list-style: none; margin: 0; padding: 0; display: grid; gap: 8px; font-size: 13px; }
.fa-checklist label, .fa-inline { display: flex; gap: 8px; align-items: flex-start; cursor: pointer; font-size: 13px; }
.fa-url { font-size: 12px; color: var(--color-text-secondary); }
.fa-instruction { width: 100%; box-sizing: border-box; font: inherit; font-size: 12px; line-height: 1.6; border-radius: 10px; border: 1px solid var(--color-border); background: var(--color-bg-primary); color: var(--color-text-primary); padding: 10px; }
.ss-table input, .ss-table select { max-width: 160px; }
</style>
