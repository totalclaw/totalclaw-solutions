<template>
  <div class="ss-module">
    <section class="ss-panel aw-head">
      <div class="aw-head__main">
        <strong><i class="ri-search-eye-line"></i> {{ $t('文献检索') }}</strong>
        <span class="ss-muted">{{ $t('直接查学术库的公开接口，结果都是真实文献；知网、万方等在内置浏览器打开后抓取当前页面。') }}</span>
      </div>
    </section>

    <StickyProgress :title="$t('文献检索')" :metas="metas" :runtime="runtime" :current-key="currentKey" @jump="scrollTo" />
    <p v-if="awProgress.search" class="ss-note info"><i class="ri-loader-4-line spin"></i>{{ awProgress.search }}</p>

    <div class="ss-steps">
      <!-- ① 选题与检索式 -->
      <StepCard step-key="topic" :index="0" :title="metas[0].title" :hint="metas[0].hint" :runtime="runtime.topic">
        <p class="aw-topic"><i class="ri-draft-line"></i>{{ project?.title || '—' }}</p>
        <div class="ss-actions">
          <button type="button" class="ss-btn primary" :disabled="!!busy || !project" @click="suggest">
            <i :class="busy === 'topic' ? 'ri-loader-4-line spin' : 'ri-magic-line'"></i>{{ $t('生成检索式') }}
          </button>
          <span v-if="suggestModel" class="ss-muted">{{ $t('由 {p0} 生成', { p0: suggestModel }) }}</span>
        </div>
        <div v-if="queries.length" class="aw-chips">
          <span class="ss-muted">{{ $t('英文检索式（点一下填入检索框）') }}</span>
          <button v-for="q in queries" :key="q.query" type="button" class="aw-chip" :title="q.purpose" @click="query = q.query">
            {{ q.query }}<small v-if="q.purpose">{{ q.purpose }}</small>
          </button>
        </div>
        <div v-if="zhKeywords.length" class="aw-chips">
          <span class="ss-muted">{{ $t('中文关键词（点一下填入学术网站检索词）') }}</span>
          <button v-for="k in zhKeywords" :key="k" type="button" class="aw-chip" @click="siteQuery = k">{{ k }}</button>
        </div>
      </StepCard>

      <!-- ② 学术库检索 -->
      <StepCard step-key="search" :index="1" :title="metas[1].title" :hint="metas[1].hint" :runtime="runtime.search">
        <div class="ss-grid">
          <label class="ss-field aw-wide"><span>{{ $t('检索词') }}</span><input v-model.trim="query" type="text" :placeholder="$t('英文检索效果最好，如 large language model radiology')" @keyup.enter="search" /></label>
          <label class="ss-field"><span>{{ $t('起始年份（可选）') }}</span><input v-model.number="yearFrom" type="number" min="1900" max="2100" /></label>
          <label class="ss-field"><span>{{ $t('每个库取多少条') }}</span><input v-model.number="limit" type="number" min="1" max="50" /></label>
        </div>
        <div class="aw-sources">
          <label v-for="s in ALL_SOURCES" :key="s" class="aw-check"><input v-model="sources" type="checkbox" :value="s" /><span>{{ sourceLabel(s) }}</span></label>
        </div>
        <div class="ss-actions">
          <button type="button" class="ss-btn primary" :disabled="!!busy || !query || !sources.length" @click="search">
            <i :class="busy === 'search' ? 'ri-loader-4-line spin' : 'ri-search-line'"></i>{{ $t('检索') }}
          </button>
        </div>
        <p v-for="e in lastSearch?.errors || []" :key="e.source" class="ss-note warn"><i class="ri-error-warning-line"></i>{{ $t('{p0} 没查成：{p1}', { p0: sourceLabel(e.source), p1: e.message }) }}</p>
      </StepCard>

      <!-- ③ 结果 -->
      <StepCard step-key="results" :index="2" :title="metas[2].title" :hint="metas[2].hint" :runtime="runtime.results">
        <template v-if="lastSearch">
          <div class="ss-actions">
            <span class="ss-muted">{{ $t('「{p0}」共 {n} 篇（已跨库去重）', { p0: lastSearch.query, n: results.length }) }}</span>
            <span class="aw-grow"></span>
            <button type="button" class="ss-btn sm ghost" :disabled="!notInLibrary.length" @click="pickAll">{{ $t('全选未入库') }}</button>
            <button type="button" class="ss-btn sm primary" :disabled="!picked.length || !!busy" @click="addToLibrary">
              <i :class="busy === 'add' ? 'ri-loader-4-line spin' : 'ri-add-line'"></i>{{ $t('加入文献库（{n}）', { n: picked.length }) }}
            </button>
          </div>
          <ul class="aw-results">
            <li v-for="p in results" :key="p.id" :class="{ inlib: inLibrary(p) }">
              <input type="checkbox" :disabled="inLibrary(p)" :checked="picked.includes(p.id)" @change="togglePick(p.id)" />
              <div class="aw-results__body">
                <button type="button" class="aw-title" @click="toggleOpen(p.id)">{{ p.title }}</button>
                <div class="aw-meta">
                  <span>{{ paperCite(p) }}</span>
                  <em v-for="s in p.foundIn || [p.source]" :key="s" class="ss-chip">{{ sourceLabel(s) }}</em>
                  <em v-if="p.citedBy != null" class="ss-chip">{{ $t('被引 {n}', { n: p.citedBy }) }}</em>
                  <em v-if="p.openAccess" class="ss-chip ok">{{ $t('开放获取') }}</em>
                  <em v-if="inLibrary(p)" class="ss-chip brand">{{ $t('已在文献库') }}</em>
                  <button v-if="p.url" type="button" class="ss-link" @click="openUrl(p.url)">{{ $t('在内置浏览器打开') }}</button>
                  <button v-if="p.pdfUrl" type="button" class="ss-link" @click="openUrl(p.pdfUrl)">PDF</button>
                </div>
                <p v-if="opened.includes(p.id)" class="aw-abstract">{{ p.abstract || $t('这条没有摘要') }}</p>
              </div>
            </li>
            <li v-if="!results.length" class="ss-empty">{{ $t('没有检索到结果，换个检索词或放宽年份试试') }}</li>
          </ul>
        </template>
        <p v-else class="ss-muted">{{ $t('还没有检索') }}</p>
      </StepCard>

      <!-- ④ 学术网站 -->
      <StepCard step-key="sites" :index="3" :title="metas[3].title" :hint="metas[3].hint" :runtime="runtime.sites">
        <label class="ss-field"><span>{{ $t('网站检索词（可选，填了就直接打开检索结果页）') }}</span><input v-model.trim="siteQuery" type="text" /></label>
        <div class="aw-sites">
          <button v-for="s in sites" :key="s.id" type="button" class="aw-site" @click="openSite(s)">
            <strong>{{ s.name }}</strong>
            <small v-if="s.note">{{ s.note }}</small>
          </button>
        </div>
        <p class="ss-muted">{{ $t('知网等需要机构账号的，在内置浏览器里登录一次，所有论文共用。') }}</p>
        <div class="ss-actions">
          <button type="button" class="ss-btn primary" :disabled="!!busy" @click="capture">
            <i :class="busy === 'sites' ? 'ri-loader-4-line spin' : 'ri-download-cloud-2-line'"></i>{{ $t('抓取当前页面到文献库') }}
          </button>
          <span class="ss-muted">{{ $t('先在内置浏览器里点进一篇文献的详情页') }}</span>
        </div>
        <p v-if="captured" class="ss-note ok"><i class="ri-check-line"></i>{{ captured }}</p>
      </StepCard>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 文献检索：选题 → 检索式 → 学术库接口检索 → 挑结果进文献库；另可在内置浏览器打开学术网站并抓取当前页面。
 */
import { computed, ref, watch } from 'vue';
import type { AwPaper, AwSource } from '@totalclaw/ipc-contracts';
import { t as i18nT } from '../../i18n';
import { useNotificationStore } from '../../stores/notification';
import StepCard from '../service-settlement/StepCard.vue';
import StickyProgress from '../service-settlement/StickyProgress.vue';
import {
  academicSites, aw, awProgress, awState, currentProject, errorMessage, openInBrowser, paperCite, refreshState, scrollToStep, sourceLabel,
  type StepMeta, type StepRuntime,
} from './shared';

defineEmits<{ (e: 'goto', tab: string): void }>();
const notif = useNotificationStore();

const ALL_SOURCES: AwSource[] = ['pubmed', 'europepmc', 'arxiv', 'crossref', 'openalex'];
const project = computed(() => { void awState.value; return currentProject(); });
const lastSearch = computed(() => project.value?.lastSearch || null);
const results = computed<AwPaper[]>(() => lastSearch.value?.results || []);
const sites = academicSites();

const query = ref(lastSearch.value?.query || '');
const siteQuery = ref('');
const yearFrom = ref<number | undefined>(lastSearch.value?.yearFrom);
const limit = ref(15);
const sources = ref<AwSource[]>([...(awState.value?.settings.defaultSources || ['pubmed', 'europepmc', 'arxiv', 'openalex'])].filter((s) => s !== 'web'));
const queries = ref<Array<{ query: string; purpose: string }>>([]);
const zhKeywords = ref<string[]>([]);
const suggestModel = ref('');
const picked = ref<string[]>([]);
const opened = ref<string[]>([]);
const busy = ref('');
const errors = ref<Record<string, string>>({});
const captured = ref('');
const siteOpened = ref(false);

watch(lastSearch, () => { picked.value = []; });

function inLibrary(p: AwPaper): boolean {
  const lib = project.value?.library || [];
  const norm = (t: string) => t.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '');
  return lib.some((x) => (p.doi && x.doi === p.doi) || norm(x.title) === norm(p.title));
}
const notInLibrary = computed(() => results.value.filter((p) => !inLibrary(p)));

const metas: StepMeta[] = [
  { key: 'topic', title: i18nT('选题与检索式'), hint: i18nT('让模型把选题拆成英文检索式和中文关键词') },
  { key: 'search', title: i18nT('学术库检索'), hint: i18nT('PubMed、Europe PMC、arXiv、Crossref、OpenAlex 同时查，跨库去重') },
  { key: 'results', title: i18nT('挑选文献'), hint: i18nT('勾选相关的加入文献库，写作只能引用库里的文献') },
  { key: 'sites', title: i18nT('学术网站'), hint: i18nT('在内置浏览器打开知网、万方、Google Scholar 等，抓取当前文献') },
];
const runtime = computed<Record<string, StepRuntime>>(() => {
  const st = (key: string, done: boolean, summary?: string): StepRuntime => (busy.value === key ? { state: 'running' }
    : errors.value[key] ? { state: 'failed', error: errors.value[key] } : done ? { state: 'done', summary } : { state: 'todo' });
  const libCount = project.value?.library.length || 0;
  return {
    topic: st('topic', queries.value.length > 0 || !!lastSearch.value, queries.value.length ? i18nT('{n} 条检索式', { n: queries.value.length }) : ''),
    search: st('search', !!lastSearch.value, lastSearch.value ? i18nT('{n} 篇', { n: results.value.length }) : ''),
    results: st('results', libCount > 0, i18nT('文献库 {n} 篇', { n: libCount })),
    sites: st('sites', siteOpened.value || !!captured.value, captured.value ? i18nT('已抓取') : i18nT('已打开')),
  };
});
const currentKey = computed(() => metas.find((m) => runtime.value[m.key].state !== 'done')?.key || 'sites');

async function run(key: string, fn: () => Promise<unknown>): Promise<boolean> {
  busy.value = key;
  errors.value = { ...errors.value, [key]: '' };
  void scrollToStep(key);
  try { await fn(); await refreshState(); return true; } catch (e) { errors.value = { ...errors.value, [key]: errorMessage(e) }; return false; } finally { busy.value = ''; }
}
async function suggest(): Promise<void> {
  await run('topic', async () => {
    const r = await aw<{ model: string; queries: Array<{ query: string; purpose: string }>; zhKeywords: string[] }>('query.suggest', { topic: project.value?.title });
    queries.value = r.queries;
    zhKeywords.value = r.zhKeywords;
    suggestModel.value = r.model;
    if (!query.value && r.queries[0]) query.value = r.queries[0].query;
  });
}
async function search(): Promise<void> {
  if (!query.value || !sources.value.length) return;
  await run('search', () => aw('search.run', { query: query.value, sources: sources.value, yearFrom: yearFrom.value || undefined, limit: limit.value || 15 }));
}
function togglePick(id: string): void {
  picked.value = picked.value.includes(id) ? picked.value.filter((x) => x !== id) : [...picked.value, id];
}
function toggleOpen(id: string): void {
  opened.value = opened.value.includes(id) ? opened.value.filter((x) => x !== id) : [...opened.value, id];
}
function pickAll(): void { picked.value = notInLibrary.value.map((p) => p.id); }
async function addToLibrary(): Promise<void> {
  const ok = await run('add', async () => {
    const r = await aw<{ added: number }>('library.add', { ids: picked.value });
    notif.success(i18nT('已加入文献库 {n} 篇', { n: r.added }));
    picked.value = [];
  });
  if (!ok) notif.error(errors.value.add);
}
async function openUrl(url: string): Promise<void> {
  try { if (!(await openInBrowser(url))) notif.error(i18nT('内置浏览器不可用')); } catch (e) { notif.error(errorMessage(e)); }
}
async function openSite(s: { home: string; search?: string }): Promise<void> {
  const url = siteQuery.value && s.search ? s.search.replace('{q}', encodeURIComponent(siteQuery.value)) : s.home;
  await openUrl(url);
  siteOpened.value = true;
}
async function capture(): Promise<void> {
  captured.value = '';
  await run('sites', async () => {
    const r = await aw<{ paper: AwPaper; added: boolean; model: string }>('web.capture');
    captured.value = r.added
      ? i18nT('已抓取进文献库：{p0}', { p0: r.paper.title })
      : i18nT('这篇已经在文献库里：{p0}', { p0: r.paper.title });
  });
}
function scrollTo(key: string): void { void scrollToStep(key); }
</script>

<style scoped>
.aw-head { display: flex; gap: 16px; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; }
.aw-head__main { display: grid; gap: 4px; flex: 1; min-width: 0; font-size: 13px; }
.aw-head__main strong { display: flex; gap: 6px; align-items: center; font-size: 15px; }
.aw-topic { margin: 0; font-size: 14px; font-weight: 600; display: flex; gap: 6px; align-items: center; }
.aw-topic i { color: var(--color-brand); }
.aw-chips { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
.aw-chip { display: inline-grid; gap: 1px; padding: 5px 10px; border-radius: 10px; border: 1px solid var(--color-border); background: var(--color-bg-primary); color: var(--color-text-primary); font: inherit; font-size: 12.5px; cursor: pointer; text-align: start; }
.aw-chip:hover { border-color: var(--color-brand); }
.aw-chip small { font-size: 11px; color: var(--color-text-secondary); }
.aw-wide { grid-column: 1 / -1; }
.aw-sources { display: flex; flex-wrap: wrap; gap: 12px; }
.aw-check { display: inline-flex; gap: 6px; align-items: center; font-size: 13px; cursor: pointer; }
.aw-grow { flex: 1; }
.aw-results { list-style: none; margin: 0; padding: 0; display: grid; gap: 6px; }
.aw-results li { display: flex; gap: 10px; align-items: flex-start; padding: 8px 10px; border-radius: 10px; background: var(--color-bg-primary); }
.aw-results li.inlib { opacity: .7; }
.aw-results li input { margin-top: 4px; }
.aw-results__body { display: grid; gap: 4px; min-width: 0; flex: 1; }
.aw-title { border: none; background: none; padding: 0; text-align: start; font: inherit; font-size: 13.5px; font-weight: 600; color: var(--color-text-primary); cursor: pointer; }
.aw-title:hover { color: var(--color-brand); }
.aw-meta { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; font-size: 12px; color: var(--color-text-secondary); }
.aw-meta em { font-style: normal; }
.aw-abstract { margin: 4px 0 0; font-size: 12.5px; line-height: 1.6; white-space: pre-wrap; color: var(--color-text-secondary); }
.aw-sites { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 8px; }
.aw-site { display: grid; gap: 2px; padding: 10px 12px; border-radius: 10px; border: 1px solid var(--color-border); background: var(--color-bg-primary); color: var(--color-text-primary); font: inherit; cursor: pointer; text-align: start; }
.aw-site:hover { border-color: var(--color-brand); }
.aw-site strong { font-size: 13px; }
.aw-site small { font-size: 11px; color: var(--color-text-secondary); }
.spin { animation: aw-spin 1s linear infinite; }
@keyframes aw-spin { to { transform: rotate(360deg); } }
</style>
