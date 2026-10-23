<template>
  <div class="aw-workbench">
    <header class="workbench-header">
      <div class="heading">
        <PageBackButton />
        <span class="heading-icon"><i class="ri-graduation-cap-line"></i></span>
        <div>
          <p class="eyebrow">{{ $t('行业工作台') }}</p>
          <h1>{{ $t('学术写作智能体') }}</h1>
          <p class="subtitle">{{ $t('检索真实文献、精读、拟提纲、分节成稿，再到人机双写编辑器里由你改定。参考文献只来自你的文献库，AI 不编造文献；成稿是草稿，学术责任在作者。') }}</p>
        </div>
      </div>
      <div class="header-actions">
        <button class="ss-btn" :disabled="loading" @click="reload"><i :class="loading ? 'ri-loader-4-line spin' : 'ri-refresh-line'"></i>{{ $t('刷新') }}</button>
      </div>
    </header>

    <!-- 论文项目 -->
    <section v-if="project" class="aw-bar">
      <label class="aw-bar__pick">
        <i class="ri-draft-line"></i>
        <span>{{ $t('论文') }}</span>
        <select :value="state?.activeProjectId" @change="switchProject(($event.target as HTMLSelectElement).value)">
          <option v-for="p in state?.projects || []" :key="p.id" :value="p.id">{{ p.title }}</option>
        </select>
      </label>
      <span class="ss-chip">{{ paperTypeLabel(project.paperType) }}</span>
      <span class="ss-chip">{{ project.language === 'en' ? 'English' : $t('中文') }}</span>
      <span class="ss-chip">{{ styleLabel(project.style) }}</span>
      <span class="ss-chip brand">{{ $t('文献库 {n} 篇', { n: project.library.length }) }}</span>
      <button type="button" class="ss-link" @click="editProject(project)">{{ $t('编辑') }}</button>
      <button type="button" class="ss-link" @click="editProject(null)">{{ $t('新建论文') }}</button>
      <span class="aw-grow"></span>
      <span class="aw-rule"><i class="ri-shield-check-line"></i>{{ $t('引用只来自文献库 · 依据句回原文核对 · 成稿由作者负责') }}</span>
    </section>

    <section v-if="form" class="ss-panel">
      <header><strong><i class="ri-draft-line"></i> {{ form.id ? $t('编辑论文') : $t('新建论文') }}</strong></header>
      <div class="ss-grid">
        <label class="ss-field aw-wide"><span>{{ $t('题目 / 选题') }}</span><input v-model.trim="form.title" type="text" /></label>
        <label class="ss-field"><span>{{ $t('学科领域') }}</span><input v-model.trim="form.field" type="text" :placeholder="$t('如：医学影像、教育技术')" /></label>
        <label class="ss-field"><span>{{ $t('类型') }}</span>
          <select v-model="form.paperType"><option value="review">{{ paperTypeLabel('review') }}</option><option value="research">{{ paperTypeLabel('research') }}</option><option value="thesis">{{ paperTypeLabel('thesis') }}</option><option value="proposal">{{ paperTypeLabel('proposal') }}</option></select>
        </label>
        <label class="ss-field"><span>{{ $t('写作语言') }}</span>
          <select v-model="form.language"><option value="zh">{{ $t('中文') }}</option><option value="en">English</option></select>
        </label>
        <label class="ss-field"><span>{{ $t('参考文献格式') }}</span>
          <select v-model="form.style"><option value="gbt7714">GB/T 7714-2015</option><option value="apa">APA 7</option><option value="ieee">IEEE</option></select>
        </label>
      </div>
      <label class="ss-field"><span>{{ $t('写作要求（字数、目标期刊、导师要求等，可选）') }}</span><textarea v-model="form.requirements" rows="2"></textarea></label>
      <div class="ss-actions">
        <button type="button" class="ss-btn primary" :disabled="!form.title" @click="saveProject"><i class="ri-check-line"></i>{{ $t('保存') }}</button>
        <button type="button" class="ss-btn ghost" @click="form = null">{{ $t('取消') }}</button>
        <span class="aw-grow"></span>
        <button v-if="form.id" type="button" class="ss-btn danger sm" @click="removeProject(form.id)"><i class="ri-delete-bin-line"></i>{{ $t('删除论文') }}</button>
      </div>
    </section>

    <nav class="aw-tabs" role="tablist">
      <button v-for="t in tabs" :key="t.key" type="button" role="tab" class="aw-tab" :class="{ active: active === t.key }" :title="t.desc" @click="select(t.key)">
        <i :class="t.icon"></i><span>{{ t.title }}</span><em v-if="badge(t.key)" class="aw-badge">{{ badge(t.key) }}</em>
      </button>
      <span class="aw-grow"></span>
      <button type="button" role="tab" class="aw-tab" :class="{ active: active === 'settings' }" @click="select('settings')"><i class="ri-settings-3-line"></i><span>{{ $t('设置') }}</span></button>
    </nav>

    <p v-if="progressText" class="ss-note info aw-progress"><i class="ri-loader-4-line spin"></i>{{ progressText }}</p>

    <div v-if="ready && project" class="aw-body">
      <component :is="COMPONENTS[active]" :key="`${active}-${project.id}`" @goto="select" />
    </div>
    <p v-else-if="loadError" class="ss-note danger"><i class="ri-error-warning-line"></i>{{ loadError }}</p>
    <p v-else class="ss-note"><i class="ri-loader-4-line spin"></i>{{ $t('正在加载工作台…') }}</p>
  </div>
</template>

<script setup lang="ts">
/**
 * 解决方案 · 学术写作智能体。
 *
 * tab 按写论文的顺序：文献检索（学术库接口 + 内置浏览器学术网站 + 抓取当前页面）→ 文献库与精读 → 提纲 →
 * 写作与双写（分节成稿、送进人机双写编辑器、取回）→ 参考文献与导出（查验、Word / Markdown / BibTeX、内置预览 + Open in 本机应用）。
 */
import { computed, onBeforeUnmount, onMounted, ref, type Component } from 'vue';
import type { AwProject } from '@totalclaw/ipc-contracts';
import { t as i18nT } from '../i18n';
import { useNotificationStore } from '../stores/notification';
import PageBackButton from '../components/PageBackButton.vue';
import SearchTab from '../workbenches/academic-writer/SearchTab.vue';
import LibraryTab from '../workbenches/academic-writer/LibraryTab.vue';
import OutlineTab from '../workbenches/academic-writer/OutlineTab.vue';
import WriteTab from '../workbenches/academic-writer/WriteTab.vue';
import ExportTab from '../workbenches/academic-writer/ExportTab.vue';
import SettingsTab from '../workbenches/academic-writer/SettingsTab.vue';
import {
  aw, awProgress, awState, currentProject, errorMessage, onAwEvent, paperTypeLabel, refreshState, styleLabel,
} from '../workbenches/academic-writer/shared';
import '../workbenches/service-settlement/styles.css';
import '../workbenches/foreign-trade/styles.css';

type TabKey = 'search' | 'library' | 'outline' | 'write' | 'export' | 'settings';
const COMPONENTS: Record<TabKey, Component> = { search: SearchTab, library: LibraryTab, outline: OutlineTab, write: WriteTab, export: ExportTab, settings: SettingsTab };
const tabs: Array<{ key: TabKey; icon: string; title: string; desc: string }> = [
  { key: 'search', icon: 'ri-search-eye-line', title: i18nT('文献检索'), desc: i18nT('PubMed、Europe PMC、arXiv、Crossref、OpenAlex 一键检索；知网、万方等在内置浏览器打开并抓取') },
  { key: 'library', icon: 'ri-book-shelf-line', title: i18nT('文献库与精读'), desc: i18nT('问题、方法、发现、局限，依据句回摘要核对') },
  { key: 'outline', icon: 'ri-list-ordered-2', title: i18nT('提纲'), desc: i18nT('按文献库拟提纲，每节标出要引用的文献') },
  { key: 'write', icon: 'ri-quill-pen-line', title: i18nT('写作与双写'), desc: i18nT('分节成稿，送进人机双写编辑器由你改，再取回') },
  { key: 'export', icon: 'ri-file-word-2-line', title: i18nT('参考文献与导出'), desc: i18nT('引用查验、参考文献格式、导出与本机应用打开') },
];
const TAB_KEY = 'totalclaw:academic-writer-tab:v1';

const notif = useNotificationStore();
const state = awState;
const project = computed(() => { void state.value; return currentProject(); });
const active = ref<TabKey>((() => { try { const v = localStorage.getItem(TAB_KEY) as TabKey; return v && (v === 'settings' || tabs.some((t) => t.key === v)) ? v : 'search'; } catch { return 'search'; } })());
const ready = ref(false);
const loading = ref(false);
const loadError = ref('');
const form = ref<(Partial<AwProject> & { title: string }) | null>(null);
const progressText = computed(() => awProgress[active.value] || '');

function badge(k: TabKey): string {
  const p = project.value;
  if (!p) return '';
  if (k === 'library') { const n = p.library.filter((x) => !x.summary).length; return n ? String(n) : ''; }
  if (k === 'write') { const n = p.sections.reduce((s, x) => s + x.badRefs.length, 0); return n ? '!' : ''; }
  return '';
}
function select(k: TabKey | string): void {
  if (k !== 'settings' && !tabs.some((t) => t.key === k)) return;
  active.value = k as TabKey;
  try { localStorage.setItem(TAB_KEY, k); } catch { /* ignore */ }
}
function editProject(p: AwProject | null): void {
  form.value = p ? { id: p.id, title: p.title, field: p.field, paperType: p.paperType, language: p.language, style: p.style, requirements: p.requirements } : { title: '', field: '', paperType: 'review', language: 'zh', style: 'gbt7714', requirements: '' };
}
async function saveProject(): Promise<void> {
  if (!form.value) return;
  try {
    const { id, ...patch } = form.value;
    if (id) await aw('project.update', { patch });
    else await aw('project.create', { input: patch });
    form.value = null;
    await refreshState();
  } catch (e) { notif.error(errorMessage(e)); }
}
async function switchProject(id: string): Promise<void> {
  try { await aw('project.switch', { id }); await refreshState(); } catch (e) { notif.error(errorMessage(e)); }
}
async function removeProject(id: string): Promise<void> {
  const p = state.value?.projects.find((x) => x.id === id);
  if (!p || !window.confirm(i18nT('删除论文「{p0}」及其文献库、提纲和稿子？已导出的文件不会删。', { p0: p.title }))) return;
  try { await aw('project.remove', { id }); form.value = null; await refreshState(); } catch (e) { notif.error(errorMessage(e)); }
}

async function reload(): Promise<void> {
  loading.value = true;
  try { await refreshState(); ready.value = true; loadError.value = ''; } catch (e) { loadError.value = errorMessage(e); } finally { loading.value = false; }
}
let timer: ReturnType<typeof setTimeout> | null = null;
let off: (() => void) | null = null;
onMounted(() => {
  void reload();
  off = onAwEvent((ev) => {
    if (ev.type === 'progress' && ev.payload?.key) { awProgress[String(ev.payload.key)] = String(ev.payload.message || ''); return; }
    if (timer) return;
    timer = setTimeout(() => { timer = null; void refreshState().catch(() => {}); }, 300);
  });
});
onBeforeUnmount(() => { off?.(); if (timer) clearTimeout(timer); });
</script>

<style scoped>
.aw-workbench { display: grid; gap: 12px; padding: 18px 22px 40px; max-width: 1440px; margin: 0 auto; width: 100%; box-sizing: border-box; flex: 1; min-height: 0; overflow-y: auto; align-content: start; }
.workbench-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
.heading { display: flex; gap: 14px; align-items: flex-start; }
.heading-icon { width: 48px; height: 48px; border-radius: var(--radius-6); display: inline-flex; align-items: center; justify-content: center; background: color-mix(in srgb, var(--color-brand) 14%, transparent); color: var(--color-brand); font-size: var(--font-size-2xl); flex: 0 0 auto; }
.eyebrow { margin: 0; font-size: var(--font-size-xs); font-weight: 800; letter-spacing: .08em; text-transform: uppercase; color: var(--color-text-secondary); }
h1 { margin: 2px 0 4px; font-size: 22px; }
.subtitle { margin: 0; color: var(--color-text-secondary); font-size: var(--font-size-md); line-height: 1.6; max-width: 920px; }
.header-actions { display: flex; gap: 8px; align-items: center; }
.aw-bar { display: flex; gap: 8px 12px; align-items: center; flex-wrap: wrap; padding: 8px 12px; border: 1px solid var(--color-border); border-radius: var(--radius-5); background: var(--color-bg-card); font-size: 12.5px; }
.aw-bar__pick { display: flex; gap: 6px; align-items: center; }
.aw-bar__pick i { color: var(--color-brand); font-size: 16px; }
.aw-bar select { height: 30px; border-radius: var(--radius-3); border: 1px solid var(--color-brand); background: var(--color-bg-input); color: var(--color-text-primary); font: inherit; font-weight: 600; padding: 0 6px; max-width: 360px; }
.aw-rule { color: var(--color-text-secondary); display: inline-flex; gap: 4px; align-items: center; }
.aw-rule i { color: var(--color-success); }
.aw-grow { flex: 1; }
.aw-wide { grid-column: 1 / -1; }
.ss-panel > header strong { display: flex; gap: 6px; align-items: center; }
.ss-panel textarea { width: 100%; box-sizing: border-box; }
/* 横向可滚动的 tab 条是滚动容器：min-height 防被网格压扁 */
.aw-tabs { display: flex; gap: 2px; overflow-x: auto; overflow-y: hidden; min-height: 44px; align-items: stretch; border-bottom: 1px solid var(--color-border); }
.aw-tab { display: inline-flex; align-items: center; gap: 6px; padding: 8px 14px; border: none; border-bottom: 2px solid transparent; margin-bottom: -1px; background: transparent; cursor: pointer; font: inherit; font-size: var(--font-size-md); font-weight: 600; color: var(--color-text-secondary); white-space: nowrap; flex: 0 0 auto; border-radius: var(--radius-3) var(--radius-3) 0 0; }
.aw-tab i { font-size: 16px; }
.aw-tab:hover { color: var(--color-brand); background: var(--color-bg-hover); }
.aw-tab.active { color: var(--color-brand); border-bottom-color: var(--color-brand); }
.aw-badge { font-style: normal; font-size: 10.5px; font-weight: 800; min-width: 18px; height: 18px; padding: 0 5px; border-radius: var(--radius-3); background: var(--color-warning); color: var(--color-on-accent); display: inline-flex; align-items: center; justify-content: center; }
.aw-progress { position: sticky; top: 0; z-index: 5; }
.aw-body { display: grid; gap: 14px; }
.spin { animation: aw-spin 1s linear infinite; }
@keyframes aw-spin { to { transform: rotate(360deg); } }
</style>
