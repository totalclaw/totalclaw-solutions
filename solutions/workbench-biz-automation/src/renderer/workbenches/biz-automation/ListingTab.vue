<template>
  <div class="ss-module">
    <ModuleHeader module-key="listing" icon="ri-store-3-line" :title="$t('商品图文自动上下架')"
      :ability="$t('按渠道生成标题、卖点、详情与主图（按渠道比例补白边）→ 你确认 → 数字员工在网店后台填写、停在提交前；售罄 / 断码 / 过季 / 试穿多成交少按规则下架或提醒')"
      :output="$t('各渠道上架草稿、上架台账、下架指令；价格与库存取自商品库，不让模型填')" />

    <StickyProgress :title="$t('商品上下架')" :metas="metas" :runtime="runtime" :current-key="currentKey" @jump="jump" />
    <div class="ss-steps">
      <StepCard step-key="l-rules" :index="0" :title="metas[0].title" :hint="metas[0].hint" :runtime="runtime['l-rules']" :is-current="currentKey === 'l-rules'">
        <div class="ss-actions">
          <button type="button" class="ss-btn primary" :disabled="!!busy" @click="evaluate"><i :class="busy === 'l-rules' ? 'ri-loader-4-line spin' : 'ri-radar-line'"></i>{{ $t('库存巡检') }}</button>
          <button type="button" class="ss-btn" :disabled="!!busy" @click="syncInventory"><i class="ri-file-excel-2-line"></i>{{ $t('同步库存表') }}</button>
          <span class="ss-muted">{{ state?.settings.autoDelistLocal ? $t('售罄款会自动从门店试穿手机端下架（只动本机，网店要人确认）') : $t('只提醒，不自动下架') }}</span>
        </div>
        <p class="ss-muted">{{ $t('库存是自动下架的前提：导入收银 / 进销存导出的「货号 × 尺码 × 库存」表同步到商品库；读不到库存时只做上架与人工下架。') }}</p>
        <p v-if="syncNote" class="ss-note info"><i class="ri-information-line"></i>{{ syncNote }}</p>
        <p v-if="checked && !hits.length" class="ss-note ok"><i class="ri-check-line"></i>{{ $t('没有需要处理的款') }}</p>
        <div v-if="hits.length" class="ss-table-wrap">
          <table class="ss-table">
            <thead><tr><th>{{ $t('商品') }}</th><th>{{ $t('规则') }}</th><th>{{ $t('情况') }}</th><th>{{ $t('建议') }}</th><th></th></tr></thead>
            <tbody>
              <tr v-for="(h, i) in hits" :key="i">
                <td>{{ garmentName(h.garmentId) }}</td>
                <td><span class="ss-chip" :class="h.rule === 'soldout' ? 'bad' : 'warn'">{{ ruleLabel(h.rule) }}</span></td>
                <td class="ba-wrap">{{ h.detail }}</td>
                <td>
                  <select v-model="picks[`${h.garmentId}:${h.rule}`]" class="ba-mini">
                    <option v-for="a in (h.options || [h.action])" :key="a" :value="a">{{ ruleActionLabel(a) }}{{ a === h.action ? $t('（默认）') : '' }}</option>
                  </select>
                </td>
                <td class="ba-row">
                  <button type="button" class="ss-btn sm" :disabled="!!busy" @click="handle(h)">{{ $t('执行') }}</button>
                  <button v-if="garmentOnShelf(h.garmentId)" type="button" class="ss-link" @click="localShelf(h.garmentId, false)">{{ $t('门店手机端下架') }}</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </StepCard>

      <StepCard step-key="l-pick" :index="1" :title="metas[1].title" :hint="metas[1].hint" :runtime="runtime['l-pick']" :is-current="currentKey === 'l-pick'">
        <div class="ba-gpick">
          <button v-for="g in garments" :key="g.id" type="button" :class="{ on: pickG.includes(g.id) }" @click="toggle(pickG, g.id)">
            <img :src="fileUrl(g.image)" alt="" loading="lazy" /><span>{{ g.name }}</span><small>¥{{ g.price }}</small>
          </button>
        </div>
        <div class="ss-actions">
          <span class="ss-muted">{{ $t('上架渠道') }}</span>
          <label v-for="c in channels" :key="c.id" class="ba-check"><input type="checkbox" :checked="pickC.includes(c.id)" @change="toggle(pickC, c.id)" />{{ c.name }}</label>
        </div>
      </StepCard>

      <StepCard step-key="l-gen" :index="2" :title="metas[2].title" :hint="metas[2].hint" :runtime="runtime['l-gen']" :is-current="currentKey === 'l-gen'">
        <div class="ss-actions">
          <button type="button" class="ss-btn primary" :disabled="!!busy || !pickG.length || !pickC.length" @click="generate"><i :class="busy === 'l-gen' ? 'ri-loader-4-line spin' : 'ri-quill-pen-line'"></i>{{ $t('生成 {n} 份上架草稿', { n: pickG.length * pickC.length }) }}</button>
          <span class="ss-muted">{{ $t('主图 = 商品图 + 该款试穿图，按渠道比例补白边') }}</span>
        </div>
        <p v-for="e in genErrors" :key="e" class="ss-note warn"><i class="ri-error-warning-line"></i>{{ e }}</p>
      </StepCard>

      <StepCard step-key="l-confirm" :index="3" :title="metas[3].title" :hint="metas[3].hint" :runtime="runtime['l-confirm']" :is-current="currentKey === 'l-confirm'">
        <p v-if="!drafts.length" class="ss-empty">{{ $t('生成后的草稿在这里逐条确认') }}</p>
        <div v-for="l in drafts" :key="l.id" class="ba-listing">
          <div class="ba-listing__imgs"><img v-for="im in l.images.slice(0, 4)" :key="im" :src="fileUrl(im)" alt="" /></div>
          <div class="ba-listing__body">
            <div class="ba-listing__head"><b>{{ channelName(l.channelId) }}</b><span class="ss-muted">{{ garmentName(l.garmentId) }} · ¥{{ l.price }}</span><span class="ss-chip" :class="l.status === 'confirmed' ? 'ok' : ''">{{ statusLabel(l.status) }}</span></div>
            <p v-for="w in l.warnings" :key="w" class="ss-note warn"><i class="ri-error-warning-line"></i>{{ w }}</p>
            <input v-model="edits[l.id].title" type="text" />
            <textarea v-model="edits[l.id].points" rows="2" :placeholder="$t('卖点，一行一条')"></textarea>
            <textarea v-model="edits[l.id].detail" rows="3"></textarea>
            <div class="ss-actions">
              <button type="button" class="ss-btn sm" :disabled="!!busy" @click="saveEdit(l.id)"><i class="ri-save-line"></i>{{ $t('保存') }}</button>
              <button type="button" class="ss-btn sm primary" :disabled="!!busy || l.status === 'confirmed' || l.warnings.length > 0" @click="confirm(l.id)"><i class="ri-check-line"></i>{{ $t('确认') }}</button>
              <button type="button" class="ss-link" @click="removeListing(l.id)">{{ $t('删除') }}</button>
            </div>
          </div>
        </div>
      </StepCard>

      <StepCard step-key="l-hand" :index="4" :title="metas[4].title" :hint="metas[4].hint" :runtime="runtime['l-hand']" :is-current="currentKey === 'l-hand'">
        <p class="ss-muted">{{ $t('先在内置浏览器里登录各网店后台。数字员工按草稿填写，停在「提交 / 发布」前截图给你，由你亲自点提交。') }}</p>
        <p v-if="!confirmed.length" class="ss-empty">{{ $t('没有待上架的已确认草稿') }}</p>
        <div v-for="l in confirmed" :key="l.id" class="ss-actions">
          <span class="ss-chip">{{ channelName(l.channelId) }}</span><span>{{ l.title }}</span>
          <button type="button" class="ss-btn sm primary" :disabled="!!busy" @click="handOver(l.id)"><i class="ri-robot-2-line"></i>{{ $t('交给数字员工上架') }}</button>
        </div>
      </StepCard>

      <StepCard step-key="l-ledger" :index="5" :title="metas[5].title" :hint="metas[5].hint" :runtime="runtime['l-ledger']" :is-current="currentKey === 'l-ledger'">
        <p v-if="!ledger.length" class="ss-empty">{{ $t('还没有上架记录') }}</p>
        <div v-else class="ss-table-wrap">
          <table class="ss-table">
            <thead><tr><th>{{ $t('商品') }}</th><th>{{ $t('渠道') }}</th><th>{{ $t('状态') }}</th><th>{{ $t('商品链接') }}</th><th></th></tr></thead>
            <tbody>
              <tr v-for="l in ledger" :key="l.id">
                <td>{{ garmentName(l.garmentId) }}</td>
                <td>{{ channelName(l.channelId) }}</td>
                <td><span class="ss-chip" :class="l.status === 'listed' ? 'ok' : l.status === 'delisted' ? 'bad' : 'brand'">{{ statusLabel(l.status) }}</span></td>
                <td><input v-model="urls[l.id]" type="text" :placeholder="$t('上架成功后粘贴商品链接')" @change="setUrl(l.id)" /></td>
                <td class="ba-row">
                  <button v-if="l.conversationId" type="button" class="ss-link" @click="openConv(l.conversationId)">{{ $t('查看执行过程') }}</button>
                  <button v-if="l.status === 'handed'" type="button" class="ss-link" @click="setStatus(l.id, 'listed')">{{ $t('已上架') }}</button>
                  <button v-if="l.status === 'listed'" type="button" class="ss-link" @click="setStatus(l.id, 'delisted')">{{ $t('标记已下架') }}</button>
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
/** 模块 C：库存巡检 → 选商品与渠道 → 生成图文 → 确认 → 数字员工上架 → 上架台账。 */
import { computed, reactive, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import type { BaListing, BaListingStatus, BaRuleAction, BaRuleHit, BaRuleKind } from '@totalclaw/ipc-contracts';
import { useNotificationStore } from '../../stores/notification';
import { t as i18nT } from '../../i18n';
import StepCard from '../service-settlement/StepCard.vue';
import StickyProgress from '../service-settlement/StickyProgress.vue';
import ModuleHeader from './ModuleHeader.vue';
import { ba, baGarments, baState, errorMessage, fileUrl, garmentName, handToDigitalEmployee, pickFiles, refreshState, scrollToStep, type StepMeta, type StepRuntime } from './shared';

const notif = useNotificationStore();
const router = useRouter();
const state = baState;
const garments = computed(() => baGarments.value);
const channels = computed(() => (state.value?.settings.channels || []).filter((c) => c.enabled));
const hits = computed<BaRuleHit[]>(() => state.value?.ruleHits || []);
const listings = computed<BaListing[]>(() => state.value?.listings || []);
const drafts = computed(() => listings.value.filter((l) => l.status === 'draft' || l.status === 'confirmed'));
const confirmed = computed(() => listings.value.filter((l) => l.status === 'confirmed'));
const ledger = computed(() => listings.value.filter((l) => l.status === 'handed' || l.status === 'listed' || l.status === 'delisted'));
const pickG = ref<string[]>([]);
const pickC = ref<string[]>([]);
watch(channels, (c) => { if (!pickC.value.length) pickC.value = c.slice(0, 1).map((x) => x.id); }, { immediate: true });
const checked = ref(false);
const genErrors = ref<string[]>([]);
const edits = reactive<Record<string, { title: string; points: string; detail: string }>>({});
const urls = reactive<Record<string, string>>({});
watch(listings, (ls) => {
  for (const l of ls) {
    if (!edits[l.id]) edits[l.id] = { title: l.title, points: l.sellingPoints.join('\n'), detail: l.detail };
    if (urls[l.id] === undefined) urls[l.id] = l.productUrl || '';
  }
}, { immediate: true });
const busy = ref('');
const errors = ref<Record<string, string>>({});

const metas: StepMeta[] = [
  { key: 'l-rules', title: i18nT('库存巡检'), hint: i18nT('售罄下架、断码提醒、过季提醒、试穿多成交少换主图') },
  { key: 'l-pick', title: i18nT('选商品与渠道'), hint: i18nT('商品来自服装实体店智能体的商品库') },
  { key: 'l-gen', title: i18nT('生成图文'), hint: i18nT('标题、卖点、详情、关键词 + 主图') },
  { key: 'l-confirm', title: i18nT('确认'), hint: i18nT('逐条改、逐条确认；含极限词的不能确认') },
  { key: 'l-hand', title: i18nT('数字员工上架'), hint: i18nT('在网店后台填写，停在提交前等你确认') },
  { key: 'l-ledger', title: i18nT('上架台账'), hint: i18nT('记录商品链接，下架时用') },
];
function st(key: string, done: boolean, summary?: string): StepRuntime {
  if (busy.value === key) return { state: 'running' };
  if (errors.value[key]) return { state: 'failed', error: errors.value[key] };
  return done ? { state: 'done', summary } : { state: 'todo' };
}
const runtime = computed<Record<string, StepRuntime>>(() => ({
  'l-rules': st('l-rules', checked.value, i18nT('{n} 条提醒', { n: hits.value.length })),
  'l-pick': st('l-pick', pickG.value.length > 0 && pickC.value.length > 0),
  'l-gen': st('l-gen', listings.value.length > 0, i18nT('{n} 份草稿', { n: drafts.value.length })),
  'l-confirm': st('l-confirm', listings.value.some((l) => l.status !== 'draft')),
  'l-hand': st('l-hand', ledger.value.length > 0),
  'l-ledger': st('l-ledger', listings.value.some((l) => l.status === 'listed')),
}));
const currentKey = computed(() => metas.find((m) => runtime.value[m.key].state !== 'done')?.key || 'l-ledger');

const picks = reactive<Record<string, BaRuleAction>>({});
watch(hits, (hs) => { for (const h of hs) { const k = `${h.garmentId}:${h.rule}`; if (!picks[k]) picks[k] = h.action; } }, { immediate: true });
const ruleActionLabel = (a: BaRuleAction) => ({ delist: i18nT('下架'), presale: i18nT('改为预售'), delist_color: i18nT('下架该颜色'), badge_sale: i18nT('主图加「断码特价」'), clearance: i18nT('转入清仓专区'), swap_image: i18nT('换主图（试穿最多的造型图）'), remind: i18nT('提醒店长') }[a]);
const syncNote = ref('');
async function syncInventory(): Promise<void> {
  const paths = await pickFiles('excel');
  if (!paths.length) return;
  await run('l-rules', async () => {
    const r = await ba<{ rows: number; unmatched: string[] }>('finance.import', { path: paths[0], kind: 'inventory' });
    checked.value = true;
    syncNote.value = r.unmatched.length ? i18nT('已同步 {n} 行；这些货号在商品库里找不到：{p0}', { n: r.rows, p0: r.unmatched.slice(0, 8).join('、') }) : i18nT('已同步 {n} 行库存', { n: r.rows });
  });
}
async function handle(h: BaRuleHit): Promise<void> {
  const action = picks[`${h.garmentId}:${h.rule}`] || h.action;
  await run('l-rules', async () => {
    const r = await ba<{ done: string[]; text?: string; listingIds: string[] }>('rules.handle', { garmentId: h.garmentId, action });
    if (r.text) {
      const conv = await handToDigitalEmployee(i18nT('{p0}：{p1}', { p0: ruleActionLabel(action), p1: garmentName(h.garmentId) }), r.text);
      if (action === 'delist') for (const lid of r.listingIds) await ba('listing.status', { id: lid, status: 'handed', conversationId: conv });
      notif.success(i18nT('已交给数字员工处理'));
    } else if (r.done.length) notif.info(r.done.join(i18nT('；')));
  });
}
const ruleLabel = (r: BaRuleKind) => ({ soldout: i18nT('售罄'), broken_size: i18nT('断码'), off_season: i18nT('过季'), lagging: i18nT('试穿多成交少') }[r]);
const statusLabel = (s: BaListingStatus) => ({ draft: i18nT('草稿'), confirmed: i18nT('已确认'), handed: i18nT('数字员工处理中'), listed: i18nT('已上架'), delisted: i18nT('已下架') }[s]);
const channelName = (id: string) => state.value?.settings.channels.find((c) => c.id === id)?.name || id;
const garmentOnShelf = (id: string) => !!baGarments.value.find((g) => g.id === id)?.onShelf;
const hasListed = (id: string) => listings.value.some((l) => l.garmentId === id && (l.status === 'listed' || l.status === 'handed'));
function toggle(list: string[], id: string): void { const i = list.indexOf(id); if (i >= 0) list.splice(i, 1); else list.push(id); }

async function run(key: string, fn: () => Promise<unknown>): Promise<boolean> {
  busy.value = key;
  errors.value = { ...errors.value, [key]: '' };
  try { await fn(); await refreshState(); return true; } catch (e) { errors.value = { ...errors.value, [key]: errorMessage(e) }; void scrollToStep(key); return false; } finally { busy.value = ''; }
}
async function evaluate(): Promise<void> {
  await run('l-rules', async () => {
    const r = await ba<{ hits: BaRuleHit[]; delisted: number }>('rules.evaluate');
    checked.value = true;
    if (r.delisted) notif.info(i18nT('已把 {n} 款售罄商品从门店试穿手机端下架', { n: r.delisted }));
  });
}
async function localShelf(id: string, on: boolean): Promise<void> { await run('l-rules', () => ba('local.shelf', { garmentId: id, onShelf: on })); }
async function generate(): Promise<void> {
  genErrors.value = [];
  await run('l-gen', async () => {
    const r = await ba<{ made: BaListing[]; errors: string[] }>('listing.generate', { garmentIds: pickG.value, channelIds: pickC.value });
    genErrors.value = r.errors;
  });
}
async function saveEdit(id: string): Promise<void> {
  const e = edits[id];
  await run('l-confirm', () => ba('listing.update', { id, patch: { title: e.title, detail: e.detail, sellingPoints: e.points.split('\n').map((x) => x.trim()).filter(Boolean) } }));
  const l = listings.value.find((x) => x.id === id);
  if (l) edits[id] = { title: l.title, points: l.sellingPoints.join('\n'), detail: l.detail };
}
async function confirm(id: string): Promise<void> { await run('l-confirm', () => ba('listing.confirm', { id })); }
async function removeListing(id: string): Promise<void> { await run('l-confirm', () => ba('listing.remove', { id })); }
async function handOver(id: string): Promise<void> {
  const ok = await run('l-hand', async () => {
    const text = await ba<string>('listing.instruction', { id });
    const l = listings.value.find((x) => x.id === id)!;
    const conv = await handToDigitalEmployee(i18nT('{p0} 上架：{p1}', { p0: channelName(l.channelId), p1: l.title.slice(0, 20) }), text);
    await ba('listing.status', { id, status: 'handed', conversationId: conv });
  });
  if (ok) notif.success(i18nT('已交给数字员工，点「查看执行过程」可以看它操作；提交前会请你确认'));
}
async function setStatus(id: string, status: BaListingStatus): Promise<void> { await run('l-ledger', () => ba('listing.status', { id, status })); }
async function setUrl(id: string): Promise<void> { await run('l-ledger', () => ba('listing.update', { id, patch: { productUrl: urls[id] } })); }
function openConv(id: string): void { void router.push(`/conversations/${id}`).catch((e) => notif.error(errorMessage(e))); }
function jump(key: string): void { void scrollToStep(key); }
</script>

<style scoped>
.ba-gpick { display: grid; grid-template-columns: repeat(auto-fill, minmax(96px, 1fr)); gap: 8px; }
.ba-gpick button { display: grid; gap: 1px; padding: 0 0 6px; border: 2px solid var(--color-border); border-radius: var(--radius-4); overflow: hidden; background: var(--color-bg-card); cursor: pointer; font: inherit; font-size: 11.5px; color: var(--color-text-primary); }
.ba-gpick img { width: 100%; aspect-ratio: 3 / 4; object-fit: contain; background: var(--balt-surface); }
.ba-gpick span, .ba-gpick small { padding: 0 6px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ba-gpick small { color: var(--color-text-secondary); }
.ba-gpick button.on { border-color: var(--color-brand); }
.ba-check { display: inline-flex; gap: 4px; align-items: center; font-size: 12.5px; }
.ba-listing { display: grid; grid-template-columns: 200px 1fr; gap: 14px; padding: 12px; border: 1px solid var(--color-border); border-radius: var(--radius-5); }
.ba-listing__imgs { display: grid; grid-template-columns: 1fr 1fr; gap: 4px; align-content: start; }
.ba-listing__imgs img { width: 100%; aspect-ratio: 1; object-fit: cover; border-radius: var(--radius-2); background: var(--balt-surface); border: 1px solid var(--color-border); }
.ba-listing__body { display: grid; gap: 6px; }
.ba-listing__head { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; font-size: var(--font-size-md); }
.ba-listing__body input, .ba-listing__body textarea, .ss-table input { border-radius: var(--radius-3); border: 1px solid var(--color-border); background: var(--color-bg-input); color: var(--color-text-primary); font: inherit; font-size: 12.5px; padding: 6px 8px; }
.ba-wrap { white-space: normal !important; }
.ba-mini { height: 28px; border-radius: var(--radius-2); border: 1px solid var(--color-border); background: var(--color-bg-input); color: var(--color-text-primary); font: inherit; font-size: var(--font-size-sm); }
.ba-row { display: flex; gap: 10px; }
.spin { animation: ba-spin 1s linear infinite; }
@keyframes ba-spin { to { transform: rotate(360deg); } }

/* ─── 调色板（docs/ui-design-system.md）：经典主题保持原值；界面主题（data-ui-theme）下映射全局 token ─── */
.ss-module { /* ui-theme-exempt: 经典主题原值 */
  --balt-surface: #fff;
}
:root[data-ui-theme] .ss-module {
  --balt-surface: var(--color-bg-card);
}
</style>
