<template>
  <div class="ss-module">
    <ModuleHeader :meta="meta" />

    <section class="ss-rules">
      <h4><i class="ri-store-2-line"></i>{{ $t('平台设置') }}</h4>
      <div class="ss-rule-row">
        <span class="lbl">{{ $t('常用平台：') }}</span>
        <button v-for="p in PRESETS" :key="p.name" type="button" class="ss-btn sm ghost" @click="applyPreset(p)">{{ p.name }}</button>
      </div>
      <div class="ss-grid">
        <label class="ss-field"><span>{{ $t('平台名称') }}</span><input v-model="platform.name" type="text" /></label>
        <label class="ss-field"><span>{{ $t('后台地址') }}</span><input v-model="platform.url" type="url" /></label>
        <label class="ss-field"><span>{{ $t('发布产品页地址') }}</span><input v-model="platform.publishUrl" type="url" /></label>
      </div>
      <div class="ss-actions"><span class="grow"></span><button type="button" class="ss-btn sm primary" @click="savePlatform"><i class="ri-save-line"></i>{{ $t('保存') }}</button></div>
    </section>

    <StickyProgress :title="$t('平台运营')" :metas="metas" :runtime="runtime" :current-key="currentKey" @jump="scrollTo" />
    <div class="ss-steps">
      <StepCard step-key="open" :index="0" :title="metas[0].title" :hint="metas[0].hint" :runtime="runtime.open">
        <div class="ss-actions">
          <button type="button" class="ss-btn primary" @click="openBackend"><i class="ri-window-line"></i>{{ $t('在内置浏览器打开 {p0} 后台', { p0: platform.name || $t('平台') }) }}</button>
          <span class="ss-muted">{{ $t('第一次需要你在内置浏览器里登录一次，之后登录状态会保留在本机。') }}</span>
        </div>
      </StepCard>

      <StepCard step-key="import" :index="1" :title="metas[1].title" :hint="metas[1].hint" :runtime="runtime.import">
        <p class="ss-note info"><i class="ri-information-line"></i>{{ $t('在平台后台的商品管理 / 数据管家里导出商品列表（含标题、关键词、图片数、曝光、点击、询盘等列），把导出的 Excel 放进来。列名不用完全一致，会自动识别。') }}</p>
        <div class="ss-actions">
          <button type="button" class="ss-btn primary" :disabled="busy === 'import'" @click="importListings"><i :class="busy === 'import' ? 'ri-loader-4-line spin' : 'ri-file-excel-2-line'"></i>{{ $t('选择商品数据表') }}</button>
          <span v-if="listings.length" class="ss-muted">{{ $t('已导入 {n} 个商品', { n: listings.length }) }}</span>
        </div>
      </StepCard>

      <StepCard step-key="diagnose" :index="2" :title="metas[2].title" :hint="metas[2].hint" :runtime="runtime.diagnose">
        <div v-if="listings.length" class="ss-kpis">
          <div class="ss-kpi"><small>{{ $t('商品数') }}</small><strong>{{ listings.length }}</strong></div>
          <div class="ss-kpi"><small>{{ $t('有严重问题') }}</small><strong>{{ badCount }}</strong></div>
          <div class="ss-kpi"><small>{{ $t('需要改进') }}</small><strong>{{ warnCount }}</strong></div>
          <div class="ss-kpi accent"><small>{{ $t('没有问题') }}</small><strong>{{ listings.length - badCount - warnCount }}</strong></div>
        </div>
        <div v-if="listings.length" class="ss-table-wrap ft-scroll">
          <table class="ss-table">
            <thead><tr><th><input type="checkbox" :checked="allPicked" @change="togglePickAll" /></th><th>{{ $t('标题') }}</th><th class="num">{{ $t('曝光') }}</th><th class="num">{{ $t('点击') }}</th><th class="num">{{ $t('询盘') }}</th><th>{{ $t('问题') }}</th></tr></thead>
            <tbody>
              <tr v-for="l in listings" :key="l.id">
                <td><input v-model="picked" type="checkbox" :value="l.id" /></td>
                <td class="ft-wrap">{{ l.title }}</td>
                <td class="num">{{ l.exposure ?? '—' }}</td><td class="num">{{ l.clicks ?? '—' }}</td><td class="num">{{ l.inquiries ?? '—' }}</td>
                <td class="ft-wrap"><span v-for="i in l.issues" :key="i.rule" class="ss-chip" :class="i.level === 'bad' ? 'bad' : 'warn'" :title="i.message">{{ i.message }}</span><span v-if="!l.issues.length" class="ss-chip ok">{{ $t('正常') }}</span></td>
              </tr>
            </tbody>
          </table>
        </div>
        <p v-else class="ss-muted">{{ $t('先导入商品数据') }}</p>
      </StepCard>

      <StepCard step-key="suggest" :index="3" :title="metas[3].title" :hint="metas[3].hint" :runtime="runtime.suggest">
        <div class="ss-actions">
          <button type="button" class="ss-btn primary" :disabled="!picked.length || busy === 'suggest'" @click="suggest"><i :class="busy === 'suggest' ? 'ri-loader-4-line spin' : 'ri-magic-line'"></i>{{ $t('为选中的 {n} 个商品生成修改稿', { n: picked.length }) }}</button>
          <button type="button" class="ss-link" @click="pickProblems">{{ $t('只选有问题的') }}</button>
        </div>
        <p v-if="busy === 'suggest' && ftProgress.platform" class="ss-muted">{{ ftProgress.platform }}</p>
        <div v-for="l in suggested" :key="l.id" class="ft-sugg">
          <div class="ft-sugg__row"><span class="ss-muted">{{ $t('原标题') }}</span><span>{{ l.title }}</span></div>
          <div class="ft-sugg__row"><span class="ss-muted">{{ $t('新标题') }}</span><strong>{{ l.suggestion!.title }}</strong></div>
          <div class="ft-sugg__row"><span class="ss-muted">{{ $t('关键词') }}</span><span>{{ l.suggestion!.keywords.join(', ') }}</span></div>
          <div class="ft-sugg__row"><span class="ss-muted">{{ $t('改动说明') }}</span><span>{{ l.suggestion!.reason }}</span></div>
          <div v-if="l.suggestion!.issues?.length" class="ft-sugg__row" data-test="ft-title-lint"><span class="ss-muted">{{ $t('标题检查') }}</span><span><span v-for="i in l.suggestion!.issues" :key="i.rule" class="ss-chip" :class="i.level === 'bad' ? 'bad' : 'warn'" :title="i.message">{{ i.message }}</span></span></div>
          <div class="ss-actions">
            <span class="ss-muted">{{ $t('由 {p0} 生成', { p0: modelLabel(l.suggestion!.model) }) }}</span>
            <span class="grow"></span>
            <span v-if="l.status !== 'pending'" class="ss-chip ok">{{ l.status === 'applied' ? $t('已更新到平台') : $t('已通过') }}</span>
            <button v-else type="button" class="ss-btn sm primary" @click="setStatus(l.id, 'approved')"><i class="ri-check-line"></i>{{ $t('通过') }}</button>
          </div>
        </div>
      </StepCard>

      <StepCard step-key="apply" :index="4" :title="metas[4].title" :hint="metas[4].hint" :runtime="runtime.apply">
        <p class="ss-note info"><i class="ri-information-line"></i>{{ $t('逐条复制新标题和关键词，到平台后台对应商品里修改保存，然后在这里标记「已更新」。') }}</p>
        <div v-for="l in approvedListings" :key="l.id" class="ft-apply">
          <span class="ft-wrap">{{ l.suggestion!.title }}</span>
          <button type="button" class="ss-btn sm ghost" @click="copy(l.suggestion!.title)"><i class="ri-file-copy-line"></i>{{ $t('复制标题') }}</button>
          <button type="button" class="ss-btn sm ghost" @click="copy(l.suggestion!.keywords.join(', '))"><i class="ri-file-copy-line"></i>{{ $t('复制关键词') }}</button>
          <button v-if="l.url" type="button" class="ss-btn sm ghost" @click="openUrl(l.url)"><i class="ri-external-link-line"></i>{{ $t('打开商品') }}</button>
          <button v-if="l.status !== 'applied'" type="button" class="ss-btn sm primary" @click="setStatus(l.id, 'applied')"><i class="ri-check-double-line"></i>{{ $t('已更新') }}</button>
          <span v-else class="ss-chip ok">{{ $t('已更新到平台') }}</span>
        </div>
        <p v-if="!approvedListings.length" class="ss-muted">{{ $t('还没有通过的修改稿') }}</p>
      </StepCard>

      <StepCard step-key="publish" :index="5" :title="metas[5].title" :hint="metas[5].hint" :runtime="runtime.publish">
        <label class="ss-field"><span>{{ $t('要发布的产品素材（在「内容生产」定稿的内容）') }}</span>
          <select v-model="publishId">
            <option value="">{{ $t('请选择') }}</option>
            <option v-for="c in approvedContents" :key="c.id" :value="c.id">{{ $t('{p0}（{a} 图 / {b} 视频）', { p0: c.title, a: c.images.length, b: c.videos.length }) }}</option>
          </select>
        </label>
        <p v-if="!approvedContents.length" class="ss-muted">
          {{ $t('还没有定稿的产品素材。') }}<button type="button" class="ss-link" @click="$emit('goto', 'content', {})">{{ $t('去内容生产') }}</button>
        </p>
        <p class="ss-note info"><i class="ri-information-line"></i>{{ $t('数字员工会在内置浏览器里打开 {p0} 的发布页，按素材填写标题、关键词、描述并上传图片和视频；点击最终「提交」前会停下来请你确认。', { p0: platform.name || $t('平台') }) }}</p>
        <div class="ss-actions">
          <button type="button" class="ss-btn primary" :disabled="!publishId || busy === 'publish'" @click="handOver"><i :class="busy === 'publish' ? 'ri-loader-4-line spin' : 'ri-robot-2-line'"></i>{{ $t('交给数字员工发布') }}</button>
        </div>
        <div v-if="jobs.length" class="ss-table-wrap">
          <table class="ss-table">
            <thead><tr><th>{{ $t('时间') }}</th><th>{{ $t('平台') }}</th><th>{{ $t('产品') }}</th><th></th></tr></thead>
            <tbody>
              <tr v-for="j in jobs" :key="j.id">
                <td>{{ fmtDateTime(j.at) }}</td><td>{{ j.channel }}</td><td class="ft-wrap">{{ contentTitle(j.contentId) }}</td>
                <td><button v-if="j.conversationId" type="button" class="ss-btn sm ghost" @click="router.push(`/conversations/${j.conversationId}`)"><i class="ri-eye-line"></i>{{ $t('查看执行过程') }}</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </StepCard>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 平台运营：打开后台 → 导入商品数据 → 按固定规则诊断 → 生成修改稿 → 人工更新 → 交给数字员工发布新产品。
 */
import { computed, reactive, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import type { FtListing } from '@totalclaw/ipc-contracts';
import { useNotificationStore } from '../../stores/notification';
import { t as i18nT } from '../../i18n';
import StepCard from '../service-settlement/StepCard.vue';
import StickyProgress from '../service-settlement/StickyProgress.vue';
import { openEmbeddedBrowser, scrollToStep, type StepMeta, type StepRuntime } from '../service-settlement/shared';
import ModuleHeader from './ModuleHeader.vue';
import { errorMessage, fmtDateTime, ft, ftProgress, ftState, modelLabel, refreshState, type FtModuleMeta } from './shared';

const props = defineProps<{ meta: FtModuleMeta; focus?: { contentId?: string } | null }>();
defineEmits<{ (e: 'goto', module: string, payload: any): void }>();
const router = useRouter();
const notif = useNotificationStore();
const state = ftState;

const PRESETS = [
  { name: 'Alibaba.com', url: 'https://i.alibaba.com', publishUrl: 'https://post.alibaba.com/product/publish.htm' },
  { name: 'Made-in-China', url: 'https://membercenter.made-in-china.com', publishUrl: 'https://membercenter.made-in-china.com' },
  { name: 'Global Sources', url: 'https://supplier.globalsources.com', publishUrl: 'https://supplier.globalsources.com' },
];
const platform = reactive({ name: '', url: '', publishUrl: '' });
watch(() => state.value?.settings.platform, (p) => { if (p) Object.assign(platform, p); }, { immediate: true });

const listings = computed(() => state.value?.listings || []);
const badCount = computed(() => listings.value.filter((l) => l.issues.some((i) => i.level === 'bad')).length);
const warnCount = computed(() => listings.value.filter((l) => l.issues.length && !l.issues.some((i) => i.level === 'bad')).length);
const suggested = computed(() => listings.value.filter((l) => l.suggestion));
const approvedListings = computed(() => listings.value.filter((l) => l.suggestion && l.status !== 'pending'));
const approvedContents = computed(() => (state.value?.contents || []).filter((c) => c.status === 'approved')
  .slice().sort((a, b) => Number(b.kind === 'product_listing') - Number(a.kind === 'product_listing')));
const jobs = computed(() => (state.value?.publishJobs || []).filter((j) => j.kind === 'platform_product'));

const picked = ref<string[]>([]);
const publishId = ref('');
const opened = ref(false);
const busy = ref('');
const errors = ref<Record<string, string>>({});
const allPicked = computed(() => listings.value.length > 0 && picked.value.length === listings.value.length);
watch(() => props.focus?.contentId, (id) => { if (id) { publishId.value = id; void scrollToStep('publish'); } }, { immediate: true });

const metas: StepMeta[] = [
  { key: 'open', title: i18nT('打开平台后台'), hint: i18nT('用内置浏览器登录平台，登录状态保存在本机') },
  { key: 'import', title: i18nT('导入商品数据'), hint: i18nT('从后台导出商品列表与数据，放进来') },
  { key: 'diagnose', title: i18nT('链接诊断'), hint: i18nT('按固定规则检查标题、关键词、图片、详情、属性与转化') },
  { key: 'suggest', title: i18nT('生成修改稿'), hint: i18nT('为选中商品写新标题和关键词，人审核通过') },
  { key: 'apply', title: i18nT('更新到平台'), hint: i18nT('在后台逐条修改后标记已更新') },
  { key: 'publish', title: i18nT('发布新产品'), hint: i18nT('交给数字员工按素材在平台发布，提交前由你确认') },
];
const runtime = computed<Record<string, StepRuntime>>(() => {
  const st = (key: string, done: boolean, summary?: string): StepRuntime => (busy.value === key
    ? { state: 'running' }
    : errors.value[key] ? { state: 'failed', error: errors.value[key] }
      : done ? { state: 'done', summary } : { state: 'todo' });
  return {
    open: st('open', opened.value || listings.value.length > 0),
    import: st('import', listings.value.length > 0, i18nT('{n} 个商品', { n: listings.value.length })),
    diagnose: st('diagnose', listings.value.length > 0, i18nT('{a} 个严重、{b} 个待改进', { a: badCount.value, b: warnCount.value })),
    suggest: st('suggest', suggested.value.length > 0, i18nT('{n} 条修改稿', { n: suggested.value.length })),
    apply: st('apply', approvedListings.value.some((l) => l.status === 'applied'), i18nT('{n} 条已更新', { n: approvedListings.value.filter((l) => l.status === 'applied').length })),
    publish: st('publish', jobs.value.length > 0, i18nT('{n} 次', { n: jobs.value.length })),
  };
});
const currentKey = computed(() => metas.find((m) => runtime.value[m.key].state !== 'done')?.key || 'publish');

async function run(key: string, fn: () => Promise<unknown>): Promise<boolean> {
  busy.value = key;
  errors.value = { ...errors.value, [key]: '' };
  void scrollToStep(key);
  try {
    await fn();
    await refreshState();
    return true;
  } catch (e) {
    errors.value = { ...errors.value, [key]: errorMessage(e) };
    return false;
  } finally {
    busy.value = '';
  }
}
function contentTitle(id: string): string { return (state.value?.contents || []).find((c) => c.id === id)?.title || id; }

function applyPreset(p: { name: string; url: string; publishUrl: string }): void { Object.assign(platform, p); }
async function savePlatform(): Promise<void> {
  try { await ft('settings.patch', { patch: { platform: { ...platform } } }); await refreshState(); notif.success(i18nT('已保存')); } catch (e) { notif.error(errorMessage(e)); }
}
async function openUrl(url: string): Promise<void> {
  const ok = await openEmbeddedBrowser(url, 'foreign-trade-platform');
  if (!ok) notif.error(i18nT('内置浏览器不可用'));
}
async function openBackend(): Promise<void> {
  if (!platform.url) { notif.warn(i18nT('请先填写平台后台地址')); return; }
  await openUrl(platform.url);
  opened.value = true;
}
async function importListings(): Promise<void> {
  const paths = await ft<string[]>('files.pick', { filters: [{ name: 'Excel / CSV', extensions: ['xlsx', 'xls', 'csv'] }] });
  if (!paths[0]) return;
  const ok = await run('import', async () => {
    const r = await ft<{ count: number }>('listing.import', { path: paths[0] });
    picked.value = [];
    notif.success(i18nT('已导入 {n} 个商品', { n: r.count }));
  });
  if (!ok) notif.error(errors.value.import);
}
function togglePickAll(): void { picked.value = allPicked.value ? [] : listings.value.map((l) => l.id); }
function pickProblems(): void { picked.value = listings.value.filter((l) => l.issues.length).map((l) => l.id); }
async function suggest(): Promise<void> {
  await run('suggest', () => ft('listing.suggest', { ids: picked.value }));
}
async function setStatus(id: string, status: FtListing['status']): Promise<void> {
  try { await ft('listing.update', { id, patch: { status } }); await refreshState(); } catch (e) { notif.error(errorMessage(e)); }
}
async function copy(text: string): Promise<void> {
  try { await navigator.clipboard.writeText(text); notif.success(i18nT('已复制')); } catch { notif.error(i18nT('复制失败')); }
}
async function handOver(): Promise<void> {
  const c = approvedContents.value.find((x) => x.id === publishId.value);
  if (!c) return;
  const ok = await run('publish', async () => {
    const text = await ft<string>('publish.instruction', { contentId: c.id, kind: 'platform_product', channel: platform.name });
    const api = (window as any).electronAPI;
    const conv = await api.conversation.create({ kind: 'single', members: ['general_assistant'], title: i18nT('在 {p0} 发布：{p1}', { p0: platform.name, p1: c.title.slice(0, 30) }), initialMessage: text });
    void api.conversation.sendMessage(conv.id, text);
    await ft('publish.record', { contentId: c.id, kind: 'platform_product', channel: platform.name, conversationId: conv.id });
  });
  if (ok) notif.success(i18nT('已交给数字员工，点击「查看执行过程」可以看它操作；提交前会请你确认'));
}
function scrollTo(key: string): void { void scrollToStep(key); }
</script>

<style scoped>
.ft-wrap { white-space: normal !important; max-width: 420px; }
.ft-wrap .ss-chip { margin: 1px 3px 1px 0; white-space: normal; }
.ft-scroll { max-height: 420px; overflow: auto; }
.ft-sugg { border: 1px solid var(--color-border); border-radius: 10px; padding: 8px 10px; display: grid; gap: 4px; font-size: 12.5px; }
.ft-sugg__row { display: grid; grid-template-columns: 80px 1fr; gap: 8px; }
.ft-apply { display: flex; gap: 6px; align-items: center; flex-wrap: wrap; padding: 6px 0; border-bottom: 1px dashed var(--color-border); font-size: 12.5px; }
.ft-apply .ft-wrap { flex: 1; min-width: 200px; }
</style>
