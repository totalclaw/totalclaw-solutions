<template>
  <div class="ss-module">
    <p class="ss-note warn"><i class="ri-shield-user-line"></i>{{ $t('AI 生成的初稿需要作者逐句核对、改写；投稿时按目标期刊要求声明 AI 使用情况') }}</p>

    <StickyProgress :title="$t('参考文献与导出')" :metas="metas" :runtime="runtime" :current-key="currentKey" @jump="scrollTo" />
    <div class="ss-steps">
      <StepCard step-key="check" :index="0" :title="metas[0].title" :hint="metas[0].hint" :runtime="runtime.check">
        <div class="ss-actions">
          <button type="button" class="ss-btn primary" :disabled="!!busy" @click="runCheck"><i :class="busy === 'check' ? 'ri-loader-4-line spin' : 'ri-search-2-line'"></i>{{ check ? $t('重新查验') : $t('查验引用') }}</button>
          <span v-if="check" class="ss-muted">{{ fmtDateTime(check.at) }}</span>
        </div>
        <template v-if="check">
          <div class="ss-kpis">
            <div class="ss-kpi"><small>{{ $t('字数') }}</small><strong>{{ check.wordCount }}</strong></div>
            <div class="ss-kpi accent"><small>{{ $t('引用文献') }}</small><strong>{{ check.cited.length }}</strong></div>
            <div class="ss-kpi"><small>{{ $t('库外编号') }}</small><strong :class="{ 'aw-bad': check.badRefs.length }">{{ check.badRefs.length }}</strong></div>
            <div class="ss-kpi"><small>{{ $t('未被引用') }}</small><strong>{{ check.uncited.length }}</strong></div>
          </div>
          <p v-if="check.badRefs.length" class="ss-note danger"><i class="ri-error-warning-line"></i>{{ $t('稿子里引用了文献库里没有的编号：{p0}。这些多半是模型编的，导出时会显示为 [?n]，请改成库里的编号或删掉。', { p0: check.badRefs.map((n) => `[${n}]`).join(' ') }) }}</p>
          <p v-else class="ss-note ok"><i class="ri-check-line"></i>{{ $t('所有引用都在文献库里') }}</p>
          <div v-if="check.uncited.length" class="aw-list">
            <div class="ss-subhead">{{ $t('文献库里没被引用的（可以删掉，或在正文补上引用）') }}</div>
            <ul><li v-for="id in check.uncited" :key="id">[{{ libNo(id) }}] {{ paperTitle(id) }}</li></ul>
          </div>
          <div v-if="check.doiMissing.length" class="aw-list">
            <div class="ss-subhead aw-bad">{{ $t('DOI 在 Crossref 查不到的（建议到文献库里核对这几篇是否真实）') }}</div>
            <ul><li v-for="id in check.doiMissing" :key="id">[{{ libNo(id) }}] {{ paperTitle(id) }}</li></ul>
            <button type="button" class="ss-link" @click="$emit('goto', 'library')">{{ $t('去文献库查验') }}</button>
          </div>
        </template>
      </StepCard>

      <StepCard step-key="refs" :index="1" :title="metas[1].title" :hint="metas[1].hint" :runtime="runtime.refs">
        <div class="ss-actions">
          <label class="ss-field aw-inline"><span>{{ $t('参考文献格式') }}</span>
            <select :value="project?.style" @change="setStyle(($event.target as HTMLSelectElement).value)">
              <option value="gbt7714">{{ styleLabel('gbt7714') }}</option><option value="apa">{{ styleLabel('apa') }}</option><option value="ieee">{{ styleLabel('ieee') }}</option>
            </select>
          </label>
          <button type="button" class="ss-btn ghost" :disabled="!!busy" @click="loadRefs"><i :class="busy === 'refs' ? 'ri-loader-4-line spin' : 'ri-refresh-line'"></i>{{ $t('生成预览') }}</button>
        </div>
        <ol v-if="refs.length" class="aw-refs"><li v-for="(r, i) in refs" :key="i" dir="auto">{{ r }}</li></ol>
        <p v-else-if="refsLoaded" class="ss-muted">{{ $t('稿子里还没有引用文献库的文献') }}</p>
      </StepCard>

      <StepCard step-key="export" :index="2" :title="metas[2].title" :hint="metas[2].hint" :runtime="runtime.export">
        <div class="ss-actions">
          <button type="button" class="ss-btn primary" :disabled="!!busy" @click="doExport('docx')"><i :class="busy === 'docx' ? 'ri-loader-4-line spin' : 'ri-file-word-2-line'"></i>{{ $t('导出 Word') }}</button>
          <button type="button" class="ss-btn ghost" :disabled="!!busy" @click="doExport('md')"><i class="ri-markdown-line"></i>{{ $t('导出 Markdown') }}</button>
          <button type="button" class="ss-btn ghost" :disabled="!!busy || !project?.library.length" @click="doExport('bib')"><i class="ri-book-2-line"></i>{{ $t('导出 BibTeX') }}</button>
        </div>
        <p class="ss-muted">{{ $t('导出时引用按所选格式重新编号，并在文末生成参考文献表；以双写编辑器取回的版本优先。') }}</p>
      </StepCard>

      <StepCard step-key="files" :index="3" :title="metas[3].title" :hint="metas[3].hint" :runtime="runtime.files">
        <div v-if="!exportsList.length" class="ss-empty">{{ $t('还没有导出文件') }}</div>
        <div v-else class="ss-table-wrap">
          <table class="ss-table">
            <thead><tr><th>{{ $t('文件') }}</th><th>{{ $t('格式') }}</th><th>{{ $t('时间') }}</th><th></th></tr></thead>
            <tbody>
              <tr v-for="e in exportsList" :key="e.path">
                <td class="aw-file" :title="e.path">{{ e.path.split(/[\\/]/).pop() }}</td>
                <td><span class="ss-chip">{{ e.kind === 'docx' ? 'Word' : e.kind === 'md' ? 'Markdown' : 'BibTeX' }}</span></td>
                <td>{{ fmtDateTime(e.at) }}</td>
                <td class="aw-ops">
                  <button type="button" class="ss-link" @click="preview(e.path, e.kind)">{{ $t('预览') }}</button>
                  <button type="button" class="ss-link" @click="reveal(e.path)">{{ $t('打开所在文件夹') }}</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="ss-muted">{{ $t('预览里左上角的文件名下拉可以选本机软件打开（WPS、Pages、LibreOffice 等）。') }}</p>
      </StepCard>
    </div>

    <DocViewer v-if="viewer" :path="viewer.path" :markdown="viewer.markdown" @close="viewer = null" @cowrite="toCowrite" />
  </div>
</template>

<script setup lang="ts">
/** 参考文献与导出：引用查验 → 参考文献预览 → 导出 → 预览 / 本机应用打开 */
import { computed, ref } from 'vue';
import { t as i18nT } from '../../i18n';
import { useNotificationStore } from '../../stores/notification';
import StepCard from '../service-settlement/StepCard.vue';
import StickyProgress from '../service-settlement/StickyProgress.vue';
import DocViewer from './DocViewer.vue';
import {
  aw, awState, currentProject, errorMessage, fmtDateTime, refreshState, scrollToStep, sendToCowrite, styleLabel,
  type StepMeta, type StepRuntime,
} from './shared';

defineEmits<{ (e: 'goto', tab: string): void }>();
const notif = useNotificationStore();
const project = computed(() => { void awState.value; return currentProject(); });
const check = computed(() => project.value?.check || null);
const exportsList = computed(() => project.value?.exports || []);
const refs = ref<string[]>([]);
const refsLoaded = ref(false);
const busy = ref('');
const errors = ref<Record<string, string>>({});
const viewer = ref<{ path: string; markdown: string } | null>(null);

const metas: StepMeta[] = [
  { key: 'check', title: i18nT('引用查验'), hint: i18nT('库外编号、未被引用的文献、DOI 查不到的') },
  { key: 'refs', title: i18nT('参考文献'), hint: i18nT('按所选格式由题录拼出，模型不参与') },
  { key: 'export', title: i18nT('导出'), hint: i18nT('Word、Markdown、BibTeX') },
  { key: 'files', title: i18nT('预览与打开'), hint: i18nT('内置预览，或选本机软件打开') },
];
const runtime = computed<Record<string, StepRuntime>>(() => {
  const st = (k: string, done: boolean, summary?: string): StepRuntime => (busy.value === k || (k === 'export' && ['docx', 'md', 'bib'].includes(busy.value)) ? { state: 'running' } : errors.value[k] ? { state: 'failed', error: errors.value[k] } : done ? { state: 'done', summary } : { state: 'todo' });
  return {
    check: st('check', !!check.value, check.value ? i18nT('引用 {a} 篇，库外 {b} 处', { a: check.value.cited.length, b: check.value.badRefs.length }) : ''),
    refs: st('refs', refs.value.length > 0, i18nT('{n} 条', { n: refs.value.length })),
    export: st('export', exportsList.value.length > 0, i18nT('{n} 个文件', { n: exportsList.value.length })),
    files: st('files', !!viewer.value || exportsList.value.length > 0, ''),
  };
});
const currentKey = computed(() => metas.find((m) => runtime.value[m.key].state !== 'done')?.key || 'files');

function libNo(id: string): number { return (project.value?.library.findIndex((p) => p.id === id) ?? -1) + 1; }
function paperTitle(id: string): string { return project.value?.library.find((p) => p.id === id)?.title || id; }

async function run(key: string, fn: () => Promise<unknown>): Promise<boolean> {
  busy.value = key;
  errors.value = { ...errors.value, [key === 'docx' || key === 'md' || key === 'bib' ? 'export' : key]: '' };
  try { await fn(); await refreshState(); return true; } catch (e) { errors.value = { ...errors.value, [key === 'docx' || key === 'md' || key === 'bib' ? 'export' : key]: errorMessage(e) }; return false; } finally { busy.value = ''; }
}
const runCheck = () => run('check', () => aw('check.run'));
async function loadRefs(): Promise<void> {
  await run('refs', async () => { refs.value = await aw<string[]>('references.preview'); refsLoaded.value = true; });
}
async function setStyle(style: string): Promise<void> {
  try { await aw('project.update', { patch: { style } }); await refreshState(); if (refsLoaded.value) await loadRefs(); } catch (e) { notif.error(errorMessage(e)); }
}
async function doExport(format: 'docx' | 'md' | 'bib'): Promise<void> {
  let path = '';
  const ok = await run(format, async () => { path = (await aw<{ path: string }>('export', { format })).path; });
  if (ok && path) await preview(path, format);
}
async function preview(path: string, kind: string): Promise<void> {
  try {
    const markdown = kind === 'bib'
      ? i18nT('BibTeX 文件包含文献库全部 {n} 条题录，可导入 Zotero、EndNote、NoteExpress 等文献管理软件。用左上角「打开方式」选本机软件查看。', { n: project.value?.library.length || 0 })
      : await aw<string>('manuscript.rendered');
    viewer.value = { path, markdown };
  } catch (e) { notif.error(errorMessage(e)); }
}
function reveal(path: string): void { void aw('path.open', { path, reveal: true }).catch((e) => notif.error(errorMessage(e))); }
async function toCowrite(): Promise<void> {
  try {
    await sendToCowrite(project.value!.title, await aw<string>('manuscript.compose'));
    viewer.value = null;
    notif.success(i18nT('已载入人机双写编辑器'));
  } catch (e) { notif.error(errorMessage(e)); }
}
function scrollTo(k: string): void { void scrollToStep(k); }
</script>

<style scoped>
.aw-bad { color: var(--color-danger); }
.aw-list ul { margin: 4px 0; padding-inline-start: 18px; font-size: 12.5px; display: grid; gap: 2px; }
.aw-inline { flex-direction: row !important; align-items: center; gap: 8px; }
.aw-refs { margin: 0; padding-inline-start: 0; list-style: none; display: grid; gap: 6px; font-size: 12.5px; line-height: 1.6; }
.aw-file { max-width: 380px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.aw-ops { display: flex; gap: 10px; }
.spin { animation: aw-spin 1s linear infinite; }
@keyframes aw-spin { to { transform: rotate(360deg); } }
</style>
