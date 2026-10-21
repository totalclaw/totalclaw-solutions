<template>
  <div class="ss-module">
    <section class="ss-panel aw-head">
      <div class="aw-head__main">
        <strong><i class="ri-book-shelf-line"></i> {{ $t('文献库与精读') }}</strong>
        <span class="ss-muted">{{ $t('写作时用每篇前面的编号 [n] 引用；只有库里的文献能被引用。') }}</span>
      </div>
    </section>

    <p v-if="!library.length" class="ss-note info">
      <i class="ri-information-line"></i>{{ $t('文献库还是空的，先去「文献检索」挑文献。') }}
      <button type="button" class="ss-link" @click="$emit('goto', 'search')">{{ $t('去文献检索') }}</button>
    </p>

    <template v-else>
      <StickyProgress :title="$t('文献库与精读')" :metas="metas" :runtime="runtime" :current-key="currentKey" @jump="scrollTo" />
      <p v-if="awProgress.read || awProgress.library" class="ss-note info"><i class="ri-loader-4-line spin"></i>{{ awProgress.read || awProgress.library }}</p>

      <div class="ss-steps">
        <!-- ① 文献库 -->
        <StepCard step-key="list" :index="0" :title="metas[0].title" :hint="metas[0].hint" :runtime="runtime.list">
          <ul class="aw-lib">
            <li v-for="(p, i) in library" :key="p.id">
              <div class="aw-lib__top">
                <span class="aw-no">[{{ i + 1 }}]</span>
                <button type="button" class="aw-title" @click="toggleOpen(p.id)">{{ p.title }}</button>
              </div>
              <div class="aw-meta">
                <span>{{ paperCite(p) }}</span>
                <em v-for="s in p.foundIn || [p.source]" :key="s" class="ss-chip">{{ sourceLabel(s) }}</em>
                <em v-if="p.citedBy != null" class="ss-chip">{{ $t('被引 {n}', { n: p.citedBy }) }}</em>
                <span v-if="p.doi" class="aw-doi">DOI {{ p.doi }}
                  <em v-if="p.doiCheck === 'ok'" class="ss-chip ok">✓</em>
                  <em v-else-if="p.doiCheck === 'missing'" class="ss-chip bad">{{ $t('Crossref 查不到') }}</em>
                </span>
                <em v-if="p.summary" class="ss-chip brand">{{ $t('已精读') }}</em>
                <button v-if="p.url" type="button" class="ss-link" @click="openUrl(p.url)">{{ $t('打开网页') }}</button>
                <button v-if="p.pdfUrl" type="button" class="ss-link" @click="openUrl(p.pdfUrl)">PDF</button>
                <button type="button" class="ss-link" :disabled="!!busy" @click="readOne(p.id)">{{ p.summary ? $t('重读') : $t('精读') }}</button>
                <button type="button" class="ss-link aw-danger" @click="remove(p.id, i + 1)">{{ $t('删除') }}</button>
              </div>
              <input class="aw-note" type="text" :value="p.note || ''" :placeholder="$t('备注（可选）')" @blur="saveNote(p.id, ($event.target as HTMLInputElement).value, p.note)" />
              <div v-if="opened.includes(p.id)" class="aw-detail">
                <template v-if="p.summary">
                  <div class="aw-sum">
                    <div><small>{{ $t('研究问题') }}</small><p>{{ p.summary.question }}</p></div>
                    <div><small>{{ $t('方法') }}</small><p>{{ p.summary.method }}</p></div>
                    <div><small>{{ $t('主要发现') }}</small><p>{{ p.summary.findings }}</p></div>
                    <div><small>{{ $t('局限') }}</small><p>{{ p.summary.limitations }}</p></div>
                  </div>
                  <ul v-if="p.summary.quotes.length" class="aw-quotes">
                    <li v-for="(q, qi) in p.summary.quotes" :key="qi" :class="{ unverified: !q.verified }">
                      <span class="ss-chip" :class="q.verified ? 'ok' : ''">{{ q.verified ? $t('✓ 已在摘要中核实') : $t('未在摘要中找到') }}</span>
                      <span>{{ $t('「{p0}」', { p0: q.quote }) }}</span>
                    </li>
                  </ul>
                  <p class="ss-muted">{{ $t('由 {p0} 精读', { p0: p.summary.model }) }}</p>
                </template>
                <p class="aw-abstract">{{ p.abstract || $t('这条没有摘要') }}</p>
              </div>
            </li>
          </ul>
        </StepCard>

        <!-- ② 精读 -->
        <StepCard step-key="read" :index="1" :title="metas[1].title" :hint="metas[1].hint" :runtime="runtime.read">
          <div class="ss-actions">
            <button type="button" class="ss-btn primary" :disabled="!!busy || !unread.length" @click="readAll">
              <i :class="busy === 'read' ? 'ri-loader-4-line spin' : 'ri-book-open-line'"></i>{{ $t('精读全部未读的（{n}）', { n: unread.length }) }}
            </button>
            <span class="ss-muted">{{ $t('每篇提炼问题、方法、发现、局限，依据句回摘要核对；点标题展开看结果') }}</span>
          </div>
          <ul v-if="readFailed.length" class="aw-failed">
            <li v-for="(f, i) in readFailed" :key="i"><i class="ri-error-warning-line"></i>{{ f }}</li>
          </ul>
        </StepCard>

        <!-- ③ 查验 DOI 与导出 -->
        <StepCard step-key="doi" :index="2" :title="metas[2].title" :hint="metas[2].hint" :runtime="runtime.doi">
          <div class="ss-actions">
            <button type="button" class="ss-btn primary" :disabled="!!busy || !withDoi.length" @click="checkDoi">
              <i :class="busy === 'doi' ? 'ri-loader-4-line spin' : 'ri-shield-check-line'"></i>{{ $t('查验 DOI（{n}）', { n: withDoi.length }) }}
            </button>
            <button type="button" class="ss-btn ghost" :disabled="!!busy" @click="exportBib"><i class="ri-download-line"></i>{{ $t('导出 BibTeX') }}</button>
          </div>
          <p v-if="doiChecked" class="ss-muted">{{ $t('Crossref 查到 {a} 篇，查不到 {b} 篇', { a: doiOk, b: doiMissing }) }}</p>
        </StepCard>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
/**
 * 文献库与精读：编号列表（写作引用用）→ 模型精读（依据句回摘要核对）→ Crossref 查验 DOI、导出 BibTeX。
 */
import { computed, ref } from 'vue';
import { t as i18nT } from '../../i18n';
import { useNotificationStore } from '../../stores/notification';
import StepCard from '../service-settlement/StepCard.vue';
import StickyProgress from '../service-settlement/StickyProgress.vue';
import {
  aw, awProgress, awState, currentProject, errorMessage, openInBrowser, paperCite, refreshState, scrollToStep, sourceLabel,
  type StepMeta, type StepRuntime,
} from './shared';

defineEmits<{ (e: 'goto', tab: string): void }>();
const notif = useNotificationStore();

const project = computed(() => { void awState.value; return currentProject(); });
const library = computed(() => project.value?.library || []);
const unread = computed(() => library.value.filter((p) => !p.summary));
const withDoi = computed(() => library.value.filter((p) => p.doi));
const doiChecked = computed(() => withDoi.value.some((p) => p.doiCheck));
const doiOk = computed(() => withDoi.value.filter((p) => p.doiCheck === 'ok').length);
const doiMissing = computed(() => withDoi.value.filter((p) => p.doiCheck === 'missing').length);
const opened = ref<string[]>([]);
const busy = ref('');
const errors = ref<Record<string, string>>({});
const readFailed = ref<string[]>([]);

const metas: StepMeta[] = [
  { key: 'list', title: i18nT('文献库'), hint: i18nT('编号 [n] 就是写作时的引用编号') },
  { key: 'read', title: i18nT('精读'), hint: i18nT('研究问题、方法、主要发现、局限，每项附摘要原句') },
  { key: 'doi', title: i18nT('查验 DOI 与导出'), hint: i18nT('Crossref 核对 DOI 真实存在，导出 BibTeX 给 Zotero / EndNote') },
];
const runtime = computed<Record<string, StepRuntime>>(() => {
  const st = (key: string, done: boolean, summary?: string): StepRuntime => (busy.value === key ? { state: 'running' }
    : errors.value[key] ? { state: 'failed', error: errors.value[key] } : done ? { state: 'done', summary } : { state: 'todo' });
  return {
    list: st('list', library.value.length > 0, i18nT('{n} 篇', { n: library.value.length })),
    read: st('read', library.value.length > 0 && !unread.value.length, i18nT('全部已精读')),
    doi: st('doi', doiChecked.value, i18nT('查到 {a}，查不到 {b}', { a: doiOk.value, b: doiMissing.value })),
  };
});
const currentKey = computed(() => metas.find((m) => runtime.value[m.key].state !== 'done')?.key || 'doi');

async function run(key: string, fn: () => Promise<unknown>): Promise<boolean> {
  busy.value = key;
  errors.value = { ...errors.value, [key]: '' };
  void scrollToStep(key);
  try { await fn(); await refreshState(); return true; } catch (e) { errors.value = { ...errors.value, [key]: errorMessage(e) }; return false; } finally { busy.value = ''; }
}
function toggleOpen(id: string): void {
  opened.value = opened.value.includes(id) ? opened.value.filter((x) => x !== id) : [...opened.value, id];
}
async function readAll(): Promise<void> {
  readFailed.value = [];
  await run('read', async () => {
    const r = await aw<{ done: number; failed: string[] }>('read.run', {});
    readFailed.value = r.failed || [];
    notif.success(i18nT('精读完成 {n} 篇', { n: r.done }));
  });
}
async function readOne(id: string): Promise<void> {
  readFailed.value = [];
  const ok = await run('read', async () => {
    const r = await aw<{ done: number; failed: string[] }>('read.run', { ids: [id] });
    readFailed.value = r.failed || [];
    if (r.done && !opened.value.includes(id)) opened.value = [...opened.value, id];
  });
  if (!ok) notif.error(errors.value.read);
}
async function saveNote(id: string, note: string, old?: string): Promise<void> {
  if ((old || '') === note) return;
  try { await aw('library.note', { id, note }); await refreshState(); } catch (e) { notif.error(errorMessage(e)); }
}
async function remove(id: string, n: number): Promise<void> {
  if (!window.confirm(i18nT('从文献库删除 [{n}]？后面文献的编号会前移，稿子里的引用会同步改。', { n }))) return;
  try { await aw('library.remove', { id }); await refreshState(); } catch (e) { notif.error(errorMessage(e)); }
}
async function checkDoi(): Promise<void> {
  await run('doi', () => aw('library.checkDoi'));
}
async function exportBib(): Promise<void> {
  const ok = await run('doi', async () => {
    const r = await aw<{ path: string }>('export', { format: 'bib' });
    await aw('path.open', { path: r.path, reveal: true });
  });
  if (!ok) notif.error(errors.value.doi);
}
async function openUrl(url: string): Promise<void> {
  try { if (!(await openInBrowser(url))) notif.error(i18nT('内置浏览器不可用')); } catch (e) { notif.error(errorMessage(e)); }
}
function scrollTo(key: string): void { void scrollToStep(key); }
</script>

<style scoped>
.aw-head { display: flex; gap: 16px; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; }
.aw-head__main { display: grid; gap: 4px; flex: 1; min-width: 0; font-size: 13px; }
.aw-head__main strong { display: flex; gap: 6px; align-items: center; font-size: 15px; }
.aw-lib { list-style: none; margin: 0; padding: 0; display: grid; gap: 8px; }
.aw-lib > li { display: grid; gap: 5px; padding: 10px 12px; border-radius: 10px; background: var(--color-bg-primary); }
.aw-lib__top { display: flex; gap: 8px; align-items: baseline; }
.aw-no { font-weight: 800; color: var(--color-brand); font-variant-numeric: tabular-nums; flex: 0 0 auto; }
.aw-title { border: none; background: none; padding: 0; text-align: start; font: inherit; font-size: 13.5px; font-weight: 600; color: var(--color-text-primary); cursor: pointer; }
.aw-title:hover { color: var(--color-brand); }
.aw-meta { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; font-size: 12px; color: var(--color-text-secondary); }
.aw-meta em { font-style: normal; }
.aw-doi { display: inline-flex; gap: 4px; align-items: center; }
.aw-danger { color: var(--color-danger); }
.aw-note { height: 28px; border-radius: 8px; border: 1px solid var(--color-border); background: var(--color-bg-card); color: var(--color-text-primary); font: inherit; font-size: 12px; padding: 0 8px; }
.aw-detail { display: grid; gap: 8px; padding-top: 4px; }
.aw-sum { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 8px; }
.aw-sum > div { padding: 8px 10px; border-radius: 8px; background: var(--color-bg-card); border: 1px solid var(--color-border); }
.aw-sum small { font-size: 11px; color: var(--color-text-secondary); font-weight: 700; }
.aw-sum p { margin: 2px 0 0; font-size: 12.5px; line-height: 1.6; }
.aw-quotes { list-style: none; margin: 0; padding: 0; display: grid; gap: 4px; font-size: 12px; }
.aw-quotes li { display: flex; gap: 6px; align-items: flex-start; }
.aw-quotes li.unverified { color: var(--color-text-secondary); }
.aw-abstract { margin: 0; font-size: 12.5px; line-height: 1.6; white-space: pre-wrap; color: var(--color-text-secondary); }
.aw-failed { list-style: none; margin: 0; padding: 0; display: grid; gap: 4px; font-size: 12.5px; color: var(--color-danger); }
.aw-failed li { display: flex; gap: 6px; align-items: flex-start; }
.spin { animation: aw-spin 1s linear infinite; }
@keyframes aw-spin { to { transform: rotate(360deg); } }
</style>
