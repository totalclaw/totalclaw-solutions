<template>
  <div class="ss-module">
    <StickyProgress :title="$t('商品上架')" :metas="metas" :runtime="runtime" :current-key="currentKey" @jump="jump" />
    <div class="ss-steps">
      <StepCard step-key="l-import" :index="0" :title="metas[0].title" :hint="metas[0].hint" :runtime="runtime['l-import']" :is-current="currentKey === 'l-import'">
        <div class="ss-actions">
          <button type="button" class="ss-btn primary" :disabled="!!busy" data-test="zc-products-import" @click="importTable"><i class="ri-file-excel-2-line"></i>{{ $t('导入商品表') }}</button>
          <button type="button" class="ss-btn" :disabled="!!busy" data-test="zc-product-add" @click="addProduct"><i class="ri-add-line"></i>{{ $t('手动添加一个') }}</button>
          <span class="ss-muted">{{ $t('表头认：商品名称、品牌、型号、类目、售价、库存、参数、京东 / 天猫 / 苏宁链接、电商价、图片路径') }}</span>
        </div>
      </StepCard>

      <StepCard step-key="l-check" :index="1" :title="metas[1].title" :hint="metas[1].hint" :runtime="runtime['l-check']" :is-current="currentKey === 'l-check'">
        <p v-if="rule" class="ss-muted">{{ $t('当前规则「{p0}」：主图 ≥ {p1} 张、最短边 ≥ {p2}、单张 ≤ {p3}KB；至少 {p4} 条自营比价链接；售价不得高于自营价{p5}{p6}', { p0: rule.name, p1: rule.imageMin, p2: rule.imageMinSide, p3: rule.imageMaxKb, p4: rule.refMin, p5: rule.priceRule === 'min' ? $t('最低价') : $t('均值'), p6: rule.priceTolerance ? $t('的 {p0}', { p0: pct(1 + rule.priceTolerance) }) : '' }) }}</p>
        <p v-if="!editable.length" class="ss-empty">{{ $t('导入或添加商品后在这里补全并检查') }}</p>
        <div v-for="p in editable" :key="p.id" class="zc-prod" :class="{ bad: hasError(p) }" :data-test="`zc-prod-${p.name}`">
          <div class="zc-prod__head">
            <span class="ss-chip" :class="p.status === 'confirmed' ? 'ok' : p.status === 'rejected' ? 'bad' : ''">{{ productStatusLabel(p.status) }}</span>
            <b>{{ p.title || p.name || $t('未命名商品') }}</b>
            <span class="ss-muted">¥{{ p.price }}{{ baselineText(p) }}</span>
            <span class="zc-grow"></span>
            <span v-if="errCount(p)" class="ss-chip bad" data-test="zc-prod-errors">{{ $t('{n} 个问题', { n: errCount(p) }) }}</span>
            <span v-else class="ss-chip ok" data-test="zc-prod-ok">{{ $t('检查通过') }}</span>
            <button type="button" class="ss-link" @click="toggle(p.id)">{{ openId === p.id ? $t('收起') : $t('编辑') }}</button>
            <button v-if="p.status !== 'confirmed'" type="button" class="ss-btn sm primary" :disabled="!!busy || hasError(p)" :data-test="`zc-prod-confirm-${p.name}`" @click="confirm(p.id, true)">{{ $t('确认') }}</button>
            <button v-else type="button" class="ss-link" @click="confirm(p.id, false)">{{ $t('撤回确认') }}</button>
            <button type="button" class="ss-link" @click="remove(p.id)">{{ $t('删除') }}</button>
          </div>
          <p v-if="p.status === 'rejected' && p.rejectReason" class="ss-note danger"><i class="ri-close-circle-line"></i>{{ $t('平台驳回原因：{p0}', { p0: p.rejectReason }) }}</p>
          <p v-for="(i, n) in p.issues" :key="n" class="ss-note" :class="i.level === 'error' ? 'danger' : 'warn'"><i class="ri-error-warning-line"></i>{{ i.message }}</p>
          <div v-if="openId === p.id && edit" class="zc-edit">
            <div class="ss-grid">
              <label class="ss-field"><span>{{ $t('商品名称（不含品牌型号）') }}</span><input v-model="edit.name" type="text" /></label>
              <label class="ss-field"><span>{{ $t('品牌') }}</span><input v-model="edit.brand" type="text" /></label>
              <label class="ss-field"><span>{{ $t('型号') }}</span><input v-model="edit.model" type="text" /></label>
              <label class="ss-field"><span>{{ $t('类目') }}</span><input v-model="edit.category" type="text" /></label>
              <label class="ss-field"><span>{{ $t('售价（元）') }}</span><input v-model.number="edit.price" type="number" min="0" step="0.01" /></label>
              <label class="ss-field"><span>{{ $t('库存') }}</span><input v-model.number="edit.stock" type="number" min="0" /></label>
              <label class="ss-field"><span>{{ $t('单位') }}</span><input v-model="edit.unit" type="text" /></label>
            </div>
            <label class="ss-field"><span>{{ $t('上架标题（留空按「品牌 品名 型号」生成）') }}</span><input v-model="edit.title" type="text" /></label>
            <label class="ss-field"><span>{{ $t('参数（一行一条，如「幅面：A4」）') }}</span><textarea v-model="edit.params" rows="4"></textarea></label>
            <label class="ss-field"><span>{{ $t('商品详情') }}<button type="button" class="ss-link zc-inline" :disabled="!!busy" @click="describe(p.id)">{{ busy === 'l-check' ? $t('生成中…') : $t('按参数生成') }}</button></span><textarea v-model="edit.detail" rows="3"></textarea></label>
            <div class="ss-subhead">{{ $t('电商比价链接（京东 / 天猫 / 苏宁自营同款）') }}</div>
            <div v-for="(r, n) in edit.refs" :key="n" class="zc-ref">
              <input v-model="r.url" type="text" :placeholder="$t('商品链接')" />
              <input v-model.number="r.price" type="number" min="0" step="0.01" :placeholder="$t('对方售价')" />
              <button type="button" class="ss-link" @click="edit.refs.splice(n, 1)">{{ $t('移除') }}</button>
            </div>
            <div class="ss-actions"><button type="button" class="ss-btn sm" @click="edit.refs.push({ platform: 'other', url: '', price: 0 })"><i class="ri-add-line"></i>{{ $t('加一条链接') }}</button><span class="ss-muted">{{ $t('对方售价请照页面抄：系统不去抓取电商页面') }}</span></div>
            <div class="ss-subhead">{{ $t('主图') }}</div>
            <div class="zc-imgs">
              <figure v-for="(im, n) in edit.images" :key="im.path"><img :src="fileUrl(im.path)" alt="" /><figcaption>{{ im.width }}×{{ im.height }} · {{ im.kb }}KB<button type="button" class="ss-link" @click="edit.images.splice(n, 1)">{{ $t('移除') }}</button></figcaption></figure>
              <button type="button" class="zc-addimg" :disabled="!!busy" @click="addImages(p.id)"><i class="ri-image-add-line"></i>{{ $t('添加图片') }}</button>
            </div>
            <div class="ss-actions"><button type="button" class="ss-btn primary" :disabled="!!busy" data-test="zc-prod-save" @click="save(p.id)"><i class="ri-save-line"></i>{{ $t('保存并检查') }}</button></div>
          </div>
        </div>
      </StepCard>

      <StepCard step-key="l-hand" :index="2" :title="metas[2].title" :hint="metas[2].hint" :runtime="runtime['l-hand']" :is-current="currentKey === 'l-hand'">
        <p v-if="state?.workbench?.temporary" class="ss-note warn" data-test="zc-listing-temp"><i class="ri-error-warning-line"></i>{{ $t('这个账号还是{p0}，商品中心没有访问权限：要先在「账号与材料」里完成入驻并通过审核，才能上架', { p0: state.workbench.identity }) }}</p>
        <p class="ss-muted">{{ $t('交出去之前应用会先打开政采云工作台确认登录状态。数字员工按确认过的内容填写，停在「提交审核」前截图给你，由你亲自点提交。') }}</p>
        <p v-if="!confirmed.length" class="ss-empty">{{ $t('没有待上架的已确认商品') }}</p>
        <div v-for="p in confirmed" :key="p.id" class="ss-actions">
          <b>{{ p.title }}</b><span class="ss-muted">¥{{ p.price }}</span>
          <button type="button" class="ss-btn sm primary" :disabled="!!busy" :data-test="`zc-prod-hand-${p.name}`" @click="hand(p.id)"><i class="ri-robot-2-line"></i>{{ $t('交给数字员工上架') }}</button>
          <button type="button" class="ss-link" @click="preview(p.id)">{{ $t('看指令') }}</button>
        </div>
        <pre v-if="instruction" class="zc-pre" data-test="zc-instruction">{{ instruction }}</pre>
      </StepCard>

      <StepCard step-key="l-ledger" :index="3" :title="metas[3].title" :hint="metas[3].hint" :runtime="runtime['l-ledger']" :is-current="currentKey === 'l-ledger'">
        <p v-if="!ledger.length" class="ss-empty">{{ $t('交出去的商品在这里跟进审核结果') }}</p>
        <div v-else class="ss-table-wrap">
          <table class="ss-table">
            <thead><tr><th>{{ $t('商品') }}</th><th class="num">{{ $t('售价') }}</th><th>{{ $t('状态') }}</th><th>{{ $t('商品链接') }}</th><th></th></tr></thead>
            <tbody>
              <tr v-for="p in ledger" :key="p.id">
                <td>{{ p.title }}</td><td class="num">{{ money(p.price) }}</td>
                <td><span class="ss-chip" :class="p.status === 'listed' ? 'ok' : p.status === 'delisted' ? 'bad' : 'brand'">{{ productStatusLabel(p.status) }}</span></td>
                <td><input v-model="urls[p.id]" type="text" :placeholder="$t('上架后粘贴商品链接')" @change="setStatus(p.id, p.status, { productUrl: urls[p.id] })" /></td>
                <td class="zc-ops">
                  <button v-if="p.conversationId" type="button" class="ss-link" @click="openConv(p.conversationId)">{{ $t('执行过程') }}</button>
                  <button v-if="p.status === 'handed'" type="button" class="ss-link" @click="setStatus(p.id, 'submitted')">{{ $t('我已提交审核') }}</button>
                  <button v-if="p.status === 'submitted'" type="button" class="ss-link" @click="setStatus(p.id, 'listed')">{{ $t('审核通过') }}</button>
                  <template v-if="p.status === 'submitted' || p.status === 'handed'">
                    <input v-model="rejects[p.id]" type="text" :placeholder="$t('驳回原因')" />
                    <button type="button" class="ss-link" :disabled="!rejects[p.id]" @click="setStatus(p.id, 'rejected', { rejectReason: rejects[p.id] })">{{ $t('被驳回') }}</button>
                  </template>
                  <button v-if="p.status === 'listed'" type="button" class="ss-link" @click="setStatus(p.id, 'delisted')">{{ $t('已下架') }}</button>
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
/** 商品上架：商品资料 → 按区划规则补全检查并确认 → 数字员工上架（停在提交审核前）→ 台账。 */
import { computed, reactive, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import type { ZcImageInfo, ZcPriceRef, ZcProduct, ZcProductStatus } from '@totalclaw/ipc-contracts';
import { useNotificationStore } from '../../stores/notification';
import { t as i18nT } from '../../i18n';
import StepCard from '../service-settlement/StepCard.vue';
import StickyProgress from '../service-settlement/StickyProgress.vue';
import { fileUrl } from '../foreign-trade/shared';
import { ensureSite, errorMessage, handToDigitalEmployee, money, pct, productStatusLabel, refreshState, scrollToStep, zc, zcState, type StepMeta, type StepRuntime } from './shared';

interface Edit { name: string; brand: string; model: string; category: string; title: string; price: number; stock: number; unit: string; params: string; detail: string; refs: ZcPriceRef[]; images: ZcImageInfo[] }

const notif = useNotificationStore();
const router = useRouter();
const state = zcState;
const busy = ref('');
const errors = ref<Record<string, string>>({});
const products = computed<ZcProduct[]>(() => state.value?.products || []);
const rule = computed(() => state.value?.settings.regions.find((r) => r.id === state.value?.settings.regionId));
const editable = computed(() => products.value.filter((p) => p.status === 'draft' || p.status === 'confirmed' || p.status === 'rejected'));
const confirmed = computed(() => products.value.filter((p) => p.status === 'confirmed'));
const ledger = computed(() => products.value.filter((p) => ['handed', 'submitted', 'listed', 'delisted'].includes(p.status)));
const hasError = (p: ZcProduct) => p.issues.some((i) => i.level === 'error');
const errCount = (p: ZcProduct) => p.issues.filter((i) => i.level === 'error').length;
const openId = ref('');
const edit = ref<Edit | null>(null);
const instruction = ref('');
const urls = reactive<Record<string, string>>({});
const rejects = reactive<Record<string, string>>({});
watch(products, (ps) => { for (const p of ps) if (urls[p.id] === undefined) urls[p.id] = p.productUrl || ''; }, { immediate: true });

function baselineText(p: ZcProduct): string {
  const prices = p.refs.filter((r) => r.platform !== 'other' && r.price > 0).map((r) => r.price);
  return prices.length ? i18nT(' · 自营价 {p0}', { p0: prices.join(' / ') }) : '';
}
function seed(p: ZcProduct): Edit {
  return { name: p.name, brand: p.brand, model: p.model, category: p.category, title: p.title, price: p.price, stock: p.stock, unit: p.unit, params: p.params, detail: p.detail, refs: p.refs.map((r) => ({ ...r })), images: p.images.map((i) => ({ ...i })) };
}
function toggle(id: string): void {
  if (openId.value === id) { openId.value = ''; edit.value = null; return; }
  const p = products.value.find((x) => x.id === id);
  if (p) { openId.value = id; edit.value = seed(p); }
}
function reseed(id: string): void { const p = products.value.find((x) => x.id === id); if (p && openId.value === id) edit.value = seed(p); }

async function run(key: string, fn: () => Promise<unknown>): Promise<boolean> {
  busy.value = key;
  errors.value = { ...errors.value, [key]: '' };
  try { await fn(); await refreshState(); return true; } catch (e) { errors.value = { ...errors.value, [key]: errorMessage(e) }; void scrollToStep(key); return false; } finally { busy.value = ''; }
}
async function importTable(): Promise<void> {
  const paths = await zc<string[]>('files.pick', { kind: 'excel' });
  if (!paths.length) return;
  await run('l-import', async () => { const r = await zc<{ imported: number }>('products.import', { path: paths[0] }); notif.success(i18nT('导入 {n} 个商品', { n: r.imported })); });
}
async function addProduct(): Promise<void> {
  let id = '';
  if (await run('l-import', async () => { id = (await zc<ZcProduct>('product.save', { patch: {} })).id; })) toggle(id);
}
async function save(id: string): Promise<void> {
  const e = edit.value;
  if (!e) return;
  if (await run('l-check', () => zc('product.save', { id, patch: { ...e, images: e.images.map((i) => ({ path: i.path })) } }))) reseed(id);
}
async function addImages(id: string): Promise<void> {
  const e = edit.value;
  if (!e) return;
  // 先存下正在改的内容，再加图，免得加图后的回写把没保存的字段冲掉
  if (await run('l-check', async () => { await zc('product.save', { id, patch: { ...e, images: e.images.map((i) => ({ path: i.path })) } }); await zc('product.addImages', { id }); })) reseed(id);
}
async function describe(id: string): Promise<void> {
  const e = edit.value;
  if (!e) return;
  if (await run('l-check', async () => { await zc('product.save', { id, patch: { ...e, images: e.images.map((i) => ({ path: i.path })) } }); await zc('product.describe', { id }); })) reseed(id);
}
async function confirm(id: string, on: boolean): Promise<void> {
  await run('l-check', async () => {
    const r = await zc<{ changed: number; blocked: number }>('product.confirm', { ids: [id], confirmed: on });
    if (r.blocked) throw new Error(i18nT('这个商品还有问题，不能确认'));
    if (on && openId.value === id) { openId.value = ''; edit.value = null; }
  });
}
async function remove(id: string): Promise<void> {
  if (!window.confirm(i18nT('删除这个商品？'))) return;
  await run('l-check', () => zc('product.remove', { id }));
}
async function preview(id: string): Promise<void> { await run('l-hand', async () => { instruction.value = await zc<string>('product.instruction', { id }); }); }
async function hand(id: string): Promise<void> {
  const ok = await run('l-hand', async () => {
    await ensureSite(true);
    const text = await zc<string>('product.instruction', { id });
    const p = products.value.find((x) => x.id === id)!;
    const conv = await handToDigitalEmployee(i18nT('政采云上架：{p0}', { p0: p.title.slice(0, 20) }), text);
    await zc('product.status', { id, status: 'handed', conversationId: conv });
    instruction.value = '';
  });
  if (ok) notif.success(i18nT('已交给数字员工，它会停在「提交审核」前等你确认'));
}
async function setStatus(id: string, status: ZcProductStatus, extra: { productUrl?: string; rejectReason?: string } = {}): Promise<void> {
  await run('l-ledger', () => zc('product.status', { id, status, ...extra }));
}
function openConv(id: string): void { void router.push(`/conversations/${id}`).catch((e) => notif.error(errorMessage(e))); }

const metas: StepMeta[] = [
  { key: 'l-import', title: i18nT('商品资料'), hint: i18nT('导入商品表或手动添加') },
  { key: 'l-check', title: i18nT('补全、检查并确认'), hint: i18nT('标题、禁用词、图片规格、比价链接与售价，查过才能确认') },
  { key: 'l-hand', title: i18nT('数字员工上架'), hint: i18nT('在政采云后台填写，停在提交审核前') },
  { key: 'l-ledger', title: i18nT('上架台账'), hint: i18nT('跟进审核结果、驳回原因与商品链接') },
];
function st(key: string, done: boolean, summary?: string): StepRuntime {
  if (busy.value === key) return { state: 'running' };
  if (errors.value[key]) return { state: 'failed', error: errors.value[key] };
  return done ? { state: 'done', summary } : { state: 'todo' };
}
const runtime = computed<Record<string, StepRuntime>>(() => ({
  'l-import': st('l-import', products.value.length > 0, i18nT('{n} 个商品', { n: products.value.length })),
  'l-check': st('l-check', products.value.length > 0 && !editable.value.some((p) => p.status !== 'confirmed')),
  'l-hand': st('l-hand', ledger.value.length > 0 && confirmed.value.length === 0),
  'l-ledger': st('l-ledger', products.value.some((p) => p.status === 'listed')),
}));
const currentKey = computed(() => metas.find((m) => runtime.value[m.key].state !== 'done')?.key || 'l-ledger');
function jump(key: string): void { void scrollToStep(key); }
</script>

<style scoped>
.zc-prod { display: grid; gap: 8px; padding: 10px 12px; border: 1px solid var(--color-border); border-radius: 12px; }
.zc-prod.bad { border-color: color-mix(in srgb, var(--color-danger) 45%, var(--color-border)); }
.zc-prod__head { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; font-size: 13px; }
.zc-grow { flex: 1; }
.zc-edit { display: grid; gap: 10px; padding-top: 8px; border-top: 1px dashed var(--color-border); }
.zc-inline { margin-inline-start: 10px; }
.zc-ref { display: grid; grid-template-columns: 1fr 130px auto; gap: 8px; align-items: center; }
.zc-ref input, .zc-ops input { height: 30px; border-radius: 8px; border: 1px solid var(--color-border); background: var(--color-bg-input, var(--color-bg-primary)); color: var(--color-text-primary); font: inherit; font-size: 12.5px; padding: 0 8px; min-width: 0; }
.zc-imgs { display: flex; gap: 10px; flex-wrap: wrap; }
.zc-imgs figure { margin: 0; width: 120px; display: grid; gap: 4px; font-size: 11px; color: var(--color-text-secondary); }
.zc-imgs img { width: 120px; height: 120px; object-fit: contain; background: #fff; border: 1px solid var(--color-border); border-radius: 8px; }
.zc-imgs figcaption { display: grid; gap: 2px; justify-items: start; }
.zc-addimg { width: 120px; height: 120px; border: 1px dashed var(--color-border); border-radius: 8px; background: transparent; color: var(--color-text-secondary); cursor: pointer; display: grid; place-items: center; align-content: center; gap: 4px; font: inherit; font-size: 12px; }
.zc-addimg i { font-size: 22px; }
.zc-ops { display: flex; gap: 10px; align-items: center; }
.zc-pre { margin: 0; padding: 12px; border-radius: 10px; background: var(--color-bg-hover); font: 12px/1.6 var(--font-mono, ui-monospace, monospace); white-space: pre-wrap; max-height: 320px; overflow: auto; }
</style>
