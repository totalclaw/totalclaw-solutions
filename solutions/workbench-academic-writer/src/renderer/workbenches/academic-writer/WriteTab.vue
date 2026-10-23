<template>
  <div class="ss-module">
    <section class="ss-panel aw-head">
      <div>
        <strong><i class="ri-quill-pen-line"></i> {{ $t('写作与双写') }}</strong>
        <p class="ss-muted">{{ $t('按提纲逐节写初稿，引用只能用文献库编号；写完送进人机双写编辑器，由你逐句改定。') }}</p>
      </div>
    </section>

    <StickyProgress :title="$t('写作与双写')" :metas="metas" :runtime="runtime" :current-key="currentKey" @jump="scrollTo" />
    <p v-if="busy && awProgress.write" class="ss-note info"><i class="ri-loader-4-line spin"></i>{{ awProgress.write }}</p>
    <div class="ss-steps">
      <StepCard step-key="sections" :index="0" :title="metas[0].title" :hint="metas[0].hint" :runtime="runtime.sections">
        <p v-if="!outline.length" class="ss-note warn"><i class="ri-information-line"></i>{{ $t('还没有提纲。') }} <button type="button" class="ss-link" @click="$emit('goto', 'outline')">{{ $t('去拟提纲') }}</button></p>
        <div v-else class="ss-actions">
          <button type="button" class="ss-btn primary" :disabled="!!busy || !unwritten.length" @click="writeAll">
            <i :class="busy === 'all' ? 'ri-loader-4-line spin' : 'ri-play-list-add-line'"></i>{{ $t('依次写完未写的节（{n}）', { n: unwritten.length }) }}
          </button>
          <span class="ss-muted">{{ $t('已写 {a}/{b} 节', { a: outline.length - unwritten.length, b: outline.length }) }}</span>
        </div>
        <div v-for="(o, i) in outline" :key="o.id" class="aw-sec">
          <div class="aw-sec__head">
            <span class="ss-chip brand">{{ i + 1 }}</span>
            <strong class="aw-grow">{{ o.heading }}</strong>
            <span v-if="sectionOf(o.id)?.model" class="ss-muted">{{ $t('由 {p0} 写', { p0: sectionOf(o.id)!.model! }) }}</span>
            <button type="button" class="ss-btn sm" :class="sectionOf(o.id) ? 'ghost' : 'primary'" :disabled="!!busy" @click="writeOne(o.id)">
              <i :class="busy === o.id ? 'ri-loader-4-line spin' : 'ri-edit-2-line'"></i>{{ sectionOf(o.id) ? $t('重写') : $t('写这一节') }}
            </button>
          </div>
          <p v-if="errors[o.id]" class="ss-note danger"><i class="ri-error-warning-line"></i>{{ errors[o.id] }}</p>
          <template v-if="sectionOf(o.id)">
            <p v-if="sectionOf(o.id)!.badRefs.length" class="ss-note danger">
              <i class="ri-error-warning-line"></i>{{ $t('引用了文献库里没有的编号：{p0}，请改成库里的编号或删掉', { p0: sectionOf(o.id)!.badRefs.map((n) => `[${n}]`).join(' ') }) }}
            </p>
            <textarea class="aw-text" :value="sectionOf(o.id)!.text" rows="10" dir="auto" @blur="saveText(o.id, ($event.target as HTMLTextAreaElement).value)"></textarea>
          </template>
        </div>
      </StepCard>

      <StepCard step-key="cowrite" :index="1" :title="metas[1].title" :hint="metas[1].hint" :runtime="runtime.cowrite">
        <p class="ss-note info"><i class="ri-information-line"></i>{{ $t('引用保留文献库编号 [n]，导出时自动按格式重排；在编辑器里改的时候别动方括号里的编号。') }}</p>
        <div class="ss-actions">
          <button type="button" class="ss-btn primary" :disabled="!!busy || !hasDraft" @click="toCowrite"><i :class="busy === 'cowrite' ? 'ri-loader-4-line spin' : 'ri-quill-pen-line'"></i>{{ $t('在人机双写编辑器中打开') }}</button>
          <button type="button" class="ss-btn ghost" :disabled="!!busy" @click="fromCowrite"><i :class="busy === 'pull' ? 'ri-loader-4-line spin' : 'ri-download-2-line'"></i>{{ $t('从双写编辑器取回') }}</button>
        </div>
        <p v-if="errors.cowrite" class="ss-note danger"><i class="ri-error-warning-line"></i>{{ errors.cowrite }}</p>
        <div v-if="project?.manuscript" class="ss-note ok aw-ms">
          <i class="ri-check-line"></i>
          <span>{{ $t('当前以双写编辑器取回的版本为准（{p0}，{n} 字）', { p0: fmtDateTime(project.manuscriptAt), n: words }) }}</span>
          <button type="button" class="ss-link" @click="resetMs">{{ $t('放弃，改回按节拼接') }}</button>
        </div>
      </StepCard>

      <StepCard step-key="next" :index="2" :title="metas[2].title" :hint="metas[2].hint" :runtime="runtime.next">
        <div class="ss-actions"><button type="button" class="ss-btn primary" :disabled="!hasDraft" @click="$emit('goto', 'export')"><i class="ri-file-word-2-line"></i>{{ $t('去查验与导出') }}</button></div>
      </StepCard>
    </div>
  </div>
</template>

<script setup lang="ts">
/** 写作与双写：分节成稿 → 送进人机双写编辑器 → 取回 → 去导出 */
import { computed, ref } from 'vue';
import { t as i18nT } from '../../i18n';
import { useNotificationStore } from '../../stores/notification';
import StepCard from '../service-settlement/StepCard.vue';
import StickyProgress from '../service-settlement/StickyProgress.vue';
import {
  aw, awProgress, awState, currentProject, errorMessage, fmtDateTime, readCowrite, refreshState, scrollToStep, sendToCowrite,
  type StepMeta, type StepRuntime,
} from './shared';

defineEmits<{ (e: 'goto', tab: string): void }>();
const notif = useNotificationStore();
const project = computed(() => { void awState.value; return currentProject(); });
const outline = computed(() => project.value?.outline || []);
const sections = computed(() => project.value?.sections || []);
const sectionOf = (id: string) => sections.value.find((s) => s.id === id);
const unwritten = computed(() => outline.value.filter((o) => !sectionOf(o.id)?.text.trim()));
const hasDraft = computed(() => sections.value.some((s) => s.text.trim()) || !!project.value?.manuscript);
const busy = ref('');
const errors = ref<Record<string, string>>({});
const pushed = ref(false);
const words = computed(() => {
  const t = project.value?.manuscript || '';
  return (t.match(/[一-鿿]/g) || []).length + (t.replace(/[一-鿿]/g, ' ').match(/[A-Za-z0-9]+/g) || []).length;
});

const metas: StepMeta[] = [
  { key: 'sections', title: i18nT('分节写初稿'), hint: i18nT('每节只引用提纲里勾选的文献，库外编号会被标红') },
  { key: 'cowrite', title: i18nT('人机双写'), hint: i18nT('送进双写编辑器由你改，改完取回') },
  { key: 'next', title: i18nT('查验与导出'), hint: i18nT('引用查验、参考文献、导出 Word') },
];
const runtime = computed<Record<string, StepRuntime>>(() => {
  const st = (k: string, done: boolean, summary?: string): StepRuntime => (busy.value === k || (k === 'sections' && busy.value && busy.value !== 'cowrite' && busy.value !== 'pull') ? { state: 'running' } : errors.value[k] ? { state: 'failed', error: errors.value[k] } : done ? { state: 'done', summary } : { state: 'todo' });
  return {
    sections: st('sections', outline.value.length > 0 && !unwritten.value.length, i18nT('{n} 节已写', { n: outline.value.length })),
    cowrite: st('cowrite', !!project.value?.manuscript || pushed.value, project.value?.manuscript ? i18nT('已取回') : i18nT('已送进编辑器')),
    next: st('next', (project.value?.exports.length || 0) > 0, i18nT('已导出')),
  };
});
const currentKey = computed(() => metas.find((m) => runtime.value[m.key].state !== 'done')?.key || 'next');

async function writeOne(id: string, flag = id): Promise<boolean> {
  busy.value = flag;
  errors.value = { ...errors.value, [id]: '' };
  try { await aw('write.section', { outlineId: id }); await refreshState(); return true; } catch (e) { errors.value = { ...errors.value, [id]: errorMessage(e) }; return false; } finally { if (flag === id) busy.value = ''; }
}
async function writeAll(): Promise<void> {
  const ids = unwritten.value.map((o) => o.id);
  busy.value = 'all';
  try {
    for (const id of ids) { if (!(await writeOne(id, 'all'))) break; }
  } finally { busy.value = ''; }
}
async function saveText(id: string, text: string): Promise<void> {
  if (sectionOf(id)?.text === text) return;
  try { await aw('sections.save', { id, text }); await refreshState(); } catch (e) { notif.error(errorMessage(e)); }
}
async function toCowrite(): Promise<void> {
  if (project.value?.manuscript && !window.confirm(i18nT('会把当前稿子作为新文档载入双写编辑器，编辑器里没取回的修改会被替换。继续？'))) return;
  busy.value = 'cowrite';
  errors.value = { ...errors.value, cowrite: '' };
  try {
    const text = await aw<string>('manuscript.compose');
    await sendToCowrite(project.value!.title, text);
    pushed.value = true;
    notif.success(i18nT('已载入人机双写编辑器，改完回来点「从双写编辑器取回」'));
  } catch (e) { errors.value = { ...errors.value, cowrite: cowriteError(e) }; } finally { busy.value = ''; }
}
async function fromCowrite(): Promise<void> {
  busy.value = 'pull';
  errors.value = { ...errors.value, cowrite: '' };
  try {
    const t = await readCowrite();
    const r = await aw<{ words: number }>('manuscript.save', { text: t });
    await refreshState();
    notif.success(i18nT('已取回 {n} 字', { n: r.words }));
  } catch (e) { errors.value = { ...errors.value, cowrite: cowriteError(e) }; } finally { busy.value = ''; }
}
function cowriteError(e: unknown): string {
  const m = errorMessage(e);
  return /EDITION_BLOCKED|human_handback|not enabled|未开通|版本/i.test(m) ? i18nT('当前版本没有开通人机双写（企业旗舰版能力），可以先导出 Word 再用本机软件修改') : m;
}
async function resetMs(): Promise<void> {
  if (!window.confirm(i18nT('放弃从双写编辑器取回的版本，改回按节拼接？'))) return;
  try { await aw('manuscript.reset'); await refreshState(); } catch (e) { notif.error(errorMessage(e)); }
}
function scrollTo(k: string): void { void scrollToStep(k); }
</script>

<style scoped>
.aw-head { display: flex; justify-content: space-between; gap: 16px; flex-wrap: wrap; align-items: flex-start; }
.aw-head strong { display: flex; gap: 6px; align-items: center; }
.aw-head p { margin: 4px 0 0; }
.aw-sec { display: grid; gap: 8px; padding: 10px; border: 1px solid var(--color-border); border-radius: var(--radius-5); background: var(--color-bg-primary); margin-top: 8px; }
.aw-sec__head { display: flex; gap: 8px; align-items: center; }
.aw-grow { flex: 1; }
.aw-text { width: 100%; box-sizing: border-box; font: inherit; font-size: 13.5px; line-height: 1.8; border-radius: var(--radius-4); border: 1px solid var(--color-border); background: var(--color-bg-card); color: var(--color-text-primary); padding: 10px; }
.aw-ms { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
.spin { animation: aw-spin 1s linear infinite; }
@keyframes aw-spin { to { transform: rotate(360deg); } }
</style>
