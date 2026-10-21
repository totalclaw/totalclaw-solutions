<template>
  <div class="ss-module">
    <StickyProgress :title="$t('校园知识库')" :metas="metas" :runtime="runtime" :current-key="currentKey" @jump="jump" />
    <div class="ss-steps">
      <!-- 1 导入资料 -->
      <StepCard step-key="kb-import" :index="0" :title="metas[0].title" :hint="metas[0].hint" :runtime="runtime['kb-import']" :is-current="currentKey === 'kb-import'">
        <div class="ss-grid tight">
          <label class="ss-field"><span>{{ $t('所属部门') }}</span>
            <select v-model="dept" data-test="ca-kb-dept"><option v-for="d in settings?.depts || []" :key="d" :value="d">{{ d }}</option></select>
          </label>
          <label class="ss-field"><span>{{ $t('类别') }}</span>
            <select v-model="category"><option value="">—</option><option v-for="c in settings?.categories || []" :key="c" :value="c">{{ c }}</option></select>
          </label>
        </div>
        <div class="ca-drop" :class="{ over: dragOver }" @dragover.prevent="dragOver = true" @dragleave="dragOver = false" @drop.prevent="onDrop">
          <i class="ri-upload-cloud-2-line"></i>
          <span>{{ $t('把文档拖到这里，或') }}</span>
          <button type="button" class="ss-btn primary sm" :disabled="!!busy" data-test="ca-kb-pick" @click="pickDocs"><i :class="busy === 'kb-import' ? 'ri-loader-4-line spin' : 'ri-file-add-line'"></i>{{ $t('选择文档') }}</button>
          <small>{{ $t('PDF、Word、Excel、PPT、TXT、Markdown、HTML；扫描件自动识别文字') }}</small>
        </div>
        <div class="ss-actions">
          <button type="button" class="ss-btn" :disabled="!!busy" data-test="ca-kb-demo" @click="loadDemo"><i :class="busy === 'kb-demo' ? 'ri-loader-4-line spin' : 'ri-magic-line'"></i>{{ $t('载入示例资料') }}</button>
          <span class="ss-muted">{{ $t('5 份示例校园文档 + 7 条 FAQ，文件写在输出目录的「示例数据」里') }}</span>
        </div>
        <div v-if="docs.length" class="ss-table-wrap tall">
          <table class="ss-table">
            <thead><tr><th>{{ $t('文档') }}</th><th>{{ $t('部门') }}</th><th>{{ $t('类别') }}</th><th>{{ $t('状态') }}</th><th class="num">{{ $t('分段') }}</th><th></th></tr></thead>
            <tbody>
              <tr v-for="d in docs" :key="d.id" :class="{ bad: d.status === 'failed' }">
                <td class="ca-wrap"><button type="button" class="ss-link" @click="openPath(d.path)">{{ d.name }}</button><small v-if="d.warning" class="ss-muted"> · {{ d.warning }}</small></td>
                <td><select :value="d.dept" @change="(e) => updateDoc(d.id, { dept: (e.target as HTMLSelectElement).value })"><option v-for="x in deptOptions(d.dept)" :key="x" :value="x">{{ x }}</option></select></td>
                <td><select :value="d.category" @change="(e) => updateDoc(d.id, { category: (e.target as HTMLSelectElement).value })"><option value="">—</option><option v-for="x in catOptions(d.category)" :key="x" :value="x">{{ x }}</option></select></td>
                <td><span class="ss-chip" :class="docStatusClass(d.status)"><i v-if="d.status === 'building'" class="ri-loader-4-line spin"></i>{{ docStatusLabel(d.status) }}</span><small v-if="d.error" class="ca-err">{{ d.error }}</small></td>
                <td class="num">{{ d.chunks || '—' }}</td>
                <td>
                  <button type="button" class="ss-btn sm ghost" :disabled="d.status === 'building'" :title="$t('重新构建')" @click="build([d.id])"><i class="ri-refresh-line"></i></button>
                  <button type="button" class="ss-btn sm ghost danger" @click="removeDoc(d.id)">{{ armed === d.id ? $t('确认删除') : $t('删除') }}</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </StepCard>

      <!-- 2 构建索引 -->
      <StepCard step-key="kb-build" :index="1" :title="metas[1].title" :hint="metas[1].hint" :runtime="runtime['kb-build']" :is-current="currentKey === 'kb-build'">
        <div class="ss-kpis">
          <div class="ss-kpi accent"><small>{{ $t('已就绪') }}</small><strong>{{ count('built') }}</strong></div>
          <div class="ss-kpi"><small>{{ $t('待构建') }}</small><strong>{{ count('pending') + count('building') }}</strong></div>
          <div class="ss-kpi"><small>{{ $t('失败') }}</small><strong>{{ count('failed') }}</strong></div>
          <div class="ss-kpi"><small>{{ $t('可检索分段') }}</small><strong>{{ caState?.stats.chunks || 0 }}</strong></div>
        </div>
        <p v-if="kbProgress" class="ss-note info"><i class="ri-loader-4-line spin"></i>{{ kbProgress }}</p>
        <div class="ss-actions">
          <button type="button" class="ss-btn primary" :disabled="!!busy || !docs.length || building" data-test="ca-kb-build" @click="build()"><i :class="busy === 'kb-build' || building ? 'ri-loader-4-line spin' : 'ri-hammer-line'"></i>{{ $t('构建未就绪的文档') }}</button>
          <span class="ss-muted">{{ $t('在本机分段、算向量，不上传到外部服务；导入后会自动构建') }}</span>
        </div>
      </StepCard>

      <!-- 3 检索自测 -->
      <StepCard step-key="kb-test" :index="2" :title="metas[2].title" :hint="metas[2].hint" :runtime="runtime['kb-test']" :is-current="currentKey === 'kb-test'">
        <form class="ss-actions" @submit.prevent="runSearch">
          <input v-model="query" class="ca-input" :placeholder="$t('输入一个学生常问的问题，例如：重修怎么报名')" data-test="ca-kb-query" />
          <button type="submit" class="ss-btn primary" :disabled="!!busy || !query.trim()" data-test="ca-kb-search"><i :class="busy === 'kb-test' ? 'ri-loader-4-line spin' : 'ri-search-line'"></i>{{ $t('检索') }}</button>
        </form>
        <p v-if="hits && !hits.length" class="ss-note warn"><i class="ri-alert-line"></i>{{ $t('没有命中任何资料：这个问题会被转给部门') }}</p>
        <div v-if="hits && hits.length" class="ss-table-wrap">
          <table class="ss-table">
            <thead><tr><th class="num">{{ $t('得分') }}</th><th>{{ $t('来源') }}</th><th>{{ $t('部门') }}</th><th>{{ $t('命中片段') }}</th></tr></thead>
            <tbody>
              <tr v-for="(h, i) in hits" :key="i" :class="{ dim: h.score < (settings?.minScore || 0) }">
                <td class="num">{{ h.score.toFixed(3) }}</td>
                <td><span class="ss-chip" :class="h.kind === 'faq' ? 'ok' : 'brand'">{{ h.kind === 'faq' ? 'FAQ' : $t('文档') }}</span> {{ h.title }}</td>
                <td>{{ h.dept || '—' }}</td>
                <td class="ca-wrap">{{ h.text.slice(0, 200) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p v-if="hits && hits.length" class="ss-muted">{{ $t('得分低于证据下限 {p0} 的片段不会用来回答（下限在「运维与设置」里调）', { p0: settings?.minScore }) }}</p>
      </StepCard>
    </div>

    <!-- FAQ -->
    <section class="ss-panel">
      <h3><i class="ri-questionnaire-line"></i>{{ $t('常见问题（FAQ）') }}<span class="ss-chip">{{ faqs.length }}</span></h3>
      <p class="ss-muted">{{ $t('部门审定的标准答案：学生的问法和这里的问题几乎一样时，直接给这个答案，不经过模型。') }}</p>
      <div class="ss-actions">
        <button type="button" class="ss-btn primary sm" @click="editFaq(null)"><i class="ri-add-line"></i>{{ $t('新增') }}</button>
        <button type="button" class="ss-btn sm" :disabled="!!busy" @click="importFaq"><i class="ri-file-excel-2-line"></i>{{ $t('从 Excel 导入') }}</button>
        <button type="button" class="ss-btn sm" :disabled="!faqs.length" @click="exportFaq"><i class="ri-download-2-line"></i>{{ $t('导出 Excel') }}</button>
        <span class="ss-muted">{{ $t('表头：问题、相似问法（用；分隔）、答案、部门') }}</span>
      </div>
      <form v-if="faqDraft" class="ca-faq-form" @submit.prevent="saveFaq">
        <label class="ss-field"><span>{{ $t('问题') }}</span><input v-model="faqDraft.question" /></label>
        <label class="ss-field"><span>{{ $t('相似问法（用；分隔）') }}</span><input v-model="faqDraft.similarText" /></label>
        <label class="ss-field"><span>{{ $t('答案') }}</span><textarea v-model="faqDraft.answer"></textarea></label>
        <label class="ss-field"><span>{{ $t('部门') }}</span><select v-model="faqDraft.dept"><option v-for="d in settings?.depts || []" :key="d" :value="d">{{ d }}</option></select></label>
        <div class="ss-actions"><button type="submit" class="ss-btn primary sm">{{ $t('保存') }}</button><button type="button" class="ss-btn sm" @click="faqDraft = null">{{ $t('取消') }}</button></div>
      </form>
      <div v-if="faqs.length" class="ss-table-wrap tall">
        <table class="ss-table">
          <thead><tr><th>{{ $t('问题') }}</th><th>{{ $t('答案') }}</th><th>{{ $t('部门') }}</th><th class="num">{{ $t('命中') }}</th><th>{{ $t('来源') }}</th><th></th></tr></thead>
          <tbody>
            <tr v-for="f in faqs" :key="f.id">
              <td class="ca-wrap"><b>{{ f.question }}</b><small v-if="f.similar.length" class="ss-muted"><br>{{ f.similar.join($t('；')) }}</small></td>
              <td class="ca-wrap">{{ f.answer }}</td>
              <td>{{ f.dept || '—' }}</td>
              <td class="num">{{ f.hits }}</td>
              <td>{{ faqSource(f.source) }}</td>
              <td>
                <button type="button" class="ss-btn sm ghost" @click="editFaq(f)">{{ $t('编辑') }}</button>
                <button type="button" class="ss-btn sm ghost danger" @click="removeFaq(f.id)">{{ armed === f.id ? $t('确认删除') : $t('删除') }}</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
/** 校园知识库：导入资料 → 构建索引 → 检索自测；FAQ 维护 */
import { computed, ref } from 'vue';
import type { CaDocStatus, CaFaq, CaHit } from '@totalclaw/ipc-contracts';
import { useNotificationStore } from '../../stores/notification';
import { t as i18nT } from '../../i18n';
import StepCard from '../service-settlement/StepCard.vue';
import StickyProgress from '../service-settlement/StickyProgress.vue';
import {
  DOC_RE, EXCEL_RE, ca, caProgress, caState, docStatusClass, docStatusLabel, droppedPaths, errorMessage, openPath, refreshState, scrollToStep,
  type StepMeta, type StepRuntime,
} from './shared';

const notif = useNotificationStore();
const settings = computed(() => caState.value?.settings);
const docs = computed(() => caState.value?.docs || []);
const faqs = computed(() => caState.value?.faqs || []);
const dept = ref('');
const category = ref('');
const dragOver = ref(false);
const busy = ref('');
const errors = ref<Record<string, string>>({});
const query = ref('');
const hits = ref<CaHit[] | null>(null);
const armed = ref('');
const faqDraft = ref<{ id?: string; question: string; similarText: string; answer: string; dept: string } | null>(null);

const metas: StepMeta[] = [
  { key: 'kb-import', title: i18nT('导入资料'), hint: i18nT('各部门的制度、办事指南、通知和 FAQ，选好所属部门再导入') },
  { key: 'kb-build', title: i18nT('构建索引'), hint: i18nT('把文档切成段落、建检索索引，问答只从这里找依据') },
  { key: 'kb-test', title: i18nT('检索自测'), hint: i18nT('用学生常问的问题试一试，看能不能找到对的原文') },
];

const building = computed(() => docs.value.some((d) => d.status === 'building' || d.status === 'pending'));
const kbProgress = computed(() => (caProgress.value.scope === 'kb' ? caProgress.value.message : ''));
const count = (s: CaDocStatus): number => docs.value.filter((d) => d.status === s).length;

const runtime = computed<Record<string, StepRuntime>>(() => {
  const err = errors.value;
  const has = docs.value.length > 0 || faqs.value.length > 0;
  const failed = count('failed');
  const builtAll = docs.value.length > 0 && count('built') === docs.value.length;
  return {
    'kb-import': busy.value === 'kb-import' || busy.value === 'kb-demo' ? { state: 'running' }
      : err['kb-import'] ? { state: 'failed', error: err['kb-import'] }
        : has ? { state: 'done', summary: i18nT('文档 {a} 份，FAQ {b} 条', { a: docs.value.length, b: faqs.value.length }) } : { state: 'todo' },
    'kb-build': busy.value === 'kb-build' || (docs.value.length && building.value) ? { state: 'running', kind: 'scan' }
      : err['kb-build'] ? { state: 'failed', error: err['kb-build'] }
        : failed ? { state: 'failed', error: i18nT('{n} 份文档构建失败，原因见第 1 步表格；可删除后换一份重新导入', { n: failed }) }
          : builtAll ? { state: 'done', summary: i18nT('{a} 份文档，{b} 段可检索', { a: docs.value.length, b: caState.value?.stats.chunks || 0 }) }
            : !docs.value.length && faqs.value.length ? { state: 'skipped' } : { state: 'todo' },
    'kb-test': busy.value === 'kb-test' ? { state: 'running' }
      : err['kb-test'] ? { state: 'failed', error: err['kb-test'] }
        : hits.value ? { state: 'done', summary: hits.value.length ? i18nT('最高分 {p0}：{p1}', { p0: hits.value[0].score.toFixed(3), p1: hits.value[0].title }) : i18nT('没有命中') } : { state: 'todo' },
  };
});
const currentKey = computed(() => metas.find((m) => !['done', 'skipped'].includes(runtime.value[m.key].state))?.key || metas[metas.length - 1].key);
const jump = (key: string): void => { void scrollToStep(key); };

async function act(key: string, fn: () => Promise<unknown>): Promise<unknown> {
  busy.value = key;
  errors.value = { ...errors.value, [key]: '' };
  try {
    const r = await fn();
    await refreshState();
    return r;
  } catch (e) {
    errors.value = { ...errors.value, [key]: errorMessage(e) };
    notif.error(errorMessage(e));
    return null;
  } finally { busy.value = ''; }
}

const deptOptions = (cur: string): string[] => [...new Set([...(settings.value?.depts || []), cur].filter(Boolean))];
const catOptions = (cur: string): string[] => [...new Set([...(settings.value?.categories || []), cur].filter(Boolean))];

async function importPaths(paths: string[]): Promise<void> {
  if (!paths.length) return;
  await act('kb-import', () => ca('kb.import', { paths, dept: dept.value, category: category.value }));
}
async function pickDocs(): Promise<void> {
  const paths = await ca<string[]>('files.pick', { kind: 'doc', multi: true, title: i18nT('选择要导入知识库的文档') }).catch(() => []);
  await importPaths(paths);
}
function onDrop(ev: DragEvent): void {
  dragOver.value = false;
  void importPaths(droppedPaths(ev, DOC_RE));
}
async function loadDemo(): Promise<void> {
  const r: any = await act('kb-demo', () => ca('kb.demo'));
  if (r) notif.success(i18nT('已载入示例资料：文档 {a} 份，FAQ {b} 条', { a: r.docs, b: r.faqs }));
}
function build(ids?: string[]): void {
  void act('kb-build', () => ca('kb.build', { ids }));
}
async function updateDoc(id: string, patch: { dept?: string; category?: string }): Promise<void> {
  await act('kb-import', () => ca('kb.update', { id, ...patch }));
}
/** 删除要点两下：第一下变成「确认删除」，3 秒内再点才删（不弹系统对话框） */
function confirmTwice(id: string): boolean {
  if (armed.value === id) { armed.value = ''; return true; }
  armed.value = id;
  setTimeout(() => { if (armed.value === id) armed.value = ''; }, 3000);
  return false;
}
async function removeDoc(id: string): Promise<void> {
  if (!confirmTwice(id)) return;
  await act('kb-import', () => ca('kb.remove', { id }));
}
async function runSearch(): Promise<void> {
  const r = await act('kb-test', () => ca<CaHit[]>('kb.search', { query: query.value }));
  if (r) hits.value = r as CaHit[];
}

function faqSource(s: CaFaq['source']): string {
  return { manual: i18nT('手工'), import: i18nT('导入'), ticket: i18nT('转办沉淀') }[s];
}
function editFaq(f: CaFaq | null): void {
  faqDraft.value = f
    ? { id: f.id, question: f.question, similarText: f.similar.join(i18nT('；')), answer: f.answer, dept: f.dept }
    : { question: '', similarText: '', answer: '', dept: settings.value?.depts[0] || '' };
}
async function saveFaq(): Promise<void> {
  const d = faqDraft.value;
  if (!d) return;
  const r = await act('kb-import', () => ca('faq.save', { input: { id: d.id, question: d.question, answer: d.answer, dept: d.dept, similar: d.similarText.split(/[；;\n]/).map((x) => x.trim()).filter(Boolean) } }));
  if (r) faqDraft.value = null;
}
async function removeFaq(id: string): Promise<void> {
  if (!confirmTwice(id)) return;
  await act('kb-import', () => ca('faq.remove', { id }));
}
async function importFaq(): Promise<void> {
  const paths = await ca<string[]>('files.pick', { kind: 'excel', multi: false, title: i18nT('选择 FAQ 表格') }).catch(() => []);
  if (!paths.length || !EXCEL_RE.test(paths[0])) return;
  const r: any = await act('kb-import', () => ca('faq.import', { path: paths[0] }));
  if (r) notif.success(i18nT('FAQ 新增 {a} 条、更新 {b} 条，跳过 {c} 行', { a: r.added, b: r.updated, c: r.skipped }));
}
async function exportFaq(): Promise<void> {
  const file = await act('kb-import', () => ca<string>('faq.export'));
  if (file) void openPath(String(file), true);
}

if (!dept.value) dept.value = settings.value?.depts[0] || '';
</script>

<style scoped>
.ca-drop { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; padding: 16px; border: 1.5px dashed var(--color-border); border-radius: 12px; font-size: 13px; color: var(--color-text-secondary); }
.ca-drop.over { border-color: var(--color-brand); background: color-mix(in srgb, var(--color-brand) 6%, transparent); }
.ca-drop i { font-size: 22px; color: var(--color-brand); }
.ca-drop small { flex-basis: 100%; }
.ca-input { flex: 1; min-width: 240px; height: 34px; border: 1px solid var(--color-border); border-radius: 8px; padding: 0 10px; font: inherit; background: var(--color-bg-input, var(--color-bg-card)); color: var(--color-text); }
.ca-err { display: block; color: var(--color-danger); white-space: normal; max-width: 260px; }
.ca-faq-form { display: grid; gap: 8px; padding: 12px; border: 1px solid var(--color-border); border-radius: 10px; }
tr.dim td { opacity: .55; }
</style>
