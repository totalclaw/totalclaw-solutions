<template>
  <div class="ss-module">
    <section class="ss-panel aw-head">
      <div>
        <strong><i class="ri-list-ordered-2"></i> {{ $t('提纲') }}</strong>
        <p class="ss-muted">{{ $t('只依据文献库里的文献拟提纲；每节标出要引用的文献，写作时模型只能引用这些。') }}</p>
      </div>
    </section>

    <StickyProgress :title="$t('提纲')" :metas="metas" :runtime="runtime" :current-key="currentKey" @jump="scrollTo" />
    <div class="ss-steps">
      <StepCard step-key="generate" :index="0" :title="metas[0].title" :hint="metas[0].hint" :runtime="runtime.generate">
        <p v-if="libSize < 3" class="ss-note warn"><i class="ri-information-line"></i>{{ $t('文献库只有 {n} 篇，至少 3 篇才能拟提纲。', { n: libSize }) }} <button type="button" class="ss-link" @click="$emit('goto', 'search')">{{ $t('去检索') }}</button></p>
        <div class="ss-actions">
          <button type="button" class="ss-btn primary" :disabled="libSize < 3 || !!busy" @click="generate">
            <i :class="busy === 'generate' ? 'ri-loader-4-line spin' : 'ri-list-ordered'"></i>{{ outline.length ? $t('重新生成提纲') : $t('生成提纲') }}
          </button>
          <span v-if="project?.outlineModel" class="ss-muted">{{ $t('由 {p0} 生成', { p0: project.outlineModel }) }}</span>
        </div>
        <p v-if="outline.length" class="ss-muted">{{ $t('重新生成会覆盖下面的提纲（已写的正文不受影响）。') }}</p>
      </StepCard>

      <StepCard step-key="edit" :index="1" :title="metas[1].title" :hint="metas[1].hint" :runtime="runtime.edit">
        <div v-if="!draft.length" class="ss-empty">{{ $t('还没有提纲：先生成，或手动新增一节。') }}</div>
        <div v-for="(sec, i) in draft" :key="sec.id" class="aw-sec">
          <div class="aw-sec__head">
            <span class="ss-chip brand">{{ i + 1 }}</span>
            <input v-model="sec.heading" type="text" class="aw-sec__title" :placeholder="$t('节标题')" @input="dirty = true" />
            <button type="button" class="ss-btn sm ghost" :disabled="i === 0" :title="$t('上移')" @click="move(i, -1)"><i class="ri-arrow-up-line"></i></button>
            <button type="button" class="ss-btn sm ghost" :disabled="i === draft.length - 1" :title="$t('下移')" @click="move(i, 1)"><i class="ri-arrow-down-line"></i></button>
            <button type="button" class="ss-btn sm ghost" :title="$t('删除这一节')" @click="removeSec(i)"><i class="ri-delete-bin-line"></i></button>
          </div>
          <label class="ss-field"><span>{{ $t('要点（一行一条）') }}</span>
            <textarea :value="sec.points.join('\n')" rows="3" @input="onPoints(sec, ($event.target as HTMLTextAreaElement).value)"></textarea>
          </label>
          <div class="aw-cites">
            <span class="ss-muted">{{ $t('本节引用：') }}</span>
            <button
              v-for="(p, n) in library" :key="p.id" type="button" class="aw-cite" :class="{ on: sec.cites.includes(p.id) }"
              :title="p.title" @click="toggleCite(sec, p.id)"
            >[{{ n + 1 }}] {{ p.title.slice(0, 28) }}{{ p.title.length > 28 ? '…' : '' }}</button>
          </div>
        </div>
        <div class="ss-actions">
          <button type="button" class="ss-btn ghost" @click="addSec"><i class="ri-add-line"></i>{{ $t('新增一节') }}</button>
          <button type="button" class="ss-btn primary" :disabled="!dirty || !!busy" @click="save"><i :class="busy === 'edit' ? 'ri-loader-4-line spin' : 'ri-save-3-line'"></i>{{ $t('保存提纲') }}</button>
          <span v-if="dirty" class="ss-muted">{{ $t('有未保存的修改') }}</span>
        </div>
      </StepCard>

      <StepCard step-key="next" :index="2" :title="metas[2].title" :hint="metas[2].hint" :runtime="runtime.next">
        <div class="ss-actions">
          <button type="button" class="ss-btn primary" :disabled="!outline.length || dirty" @click="$emit('goto', 'write')"><i class="ri-quill-pen-line"></i>{{ $t('去写作') }}</button>
          <span v-if="dirty" class="ss-muted">{{ $t('先保存提纲') }}</span>
        </div>
      </StepCard>
    </div>
  </div>
</template>

<script setup lang="ts">
/** 提纲：生成 → 编辑（标题 / 要点 / 引用文献）→ 去写作 */
import { computed, ref, watch } from 'vue';
import type { AwOutlineSection } from '@totalclaw/ipc-contracts';
import { t as i18nT } from '../../i18n';
import { useNotificationStore } from '../../stores/notification';
import StepCard from '../service-settlement/StepCard.vue';
import StickyProgress from '../service-settlement/StickyProgress.vue';
import { aw, awState, currentProject, errorMessage, refreshState, scrollToStep, type StepMeta, type StepRuntime } from './shared';

defineEmits<{ (e: 'goto', tab: string): void }>();
const notif = useNotificationStore();
const project = computed(() => { void awState.value; return currentProject(); });
const library = computed(() => project.value?.library || []);
const libSize = computed(() => library.value.length);
const outline = computed(() => project.value?.outline || []);
const draft = ref<AwOutlineSection[]>([]);
const dirty = ref(false);
const busy = ref('');
const errors = ref<Record<string, string>>({});

watch(outline, (o) => { if (!dirty.value) draft.value = o.map((s) => ({ ...s, points: [...s.points], cites: [...s.cites] })); }, { immediate: true, deep: true });

const metas: StepMeta[] = [
  { key: 'generate', title: i18nT('生成提纲'), hint: i18nT('按论文类型和文献库拟各节标题、要点与引用') },
  { key: 'edit', title: i18nT('修改提纲'), hint: i18nT('改标题、要点，勾选每节要引用的文献') },
  { key: 'next', title: i18nT('去写作'), hint: i18nT('按提纲分节成稿') },
];
const runtime = computed<Record<string, StepRuntime>>(() => {
  const st = (k: string, done: boolean, summary?: string): StepRuntime => (busy.value === k ? { state: 'running' } : errors.value[k] ? { state: 'failed', error: errors.value[k] } : done ? { state: 'done', summary } : { state: 'todo' });
  return {
    generate: st('generate', outline.value.length > 0, i18nT('{n} 节', { n: outline.value.length })),
    edit: st('edit', outline.value.length > 0 && !dirty.value, i18nT('已保存')),
    next: st('next', (project.value?.sections.length || 0) > 0, i18nT('已开始写作')),
  };
});
const currentKey = computed(() => metas.find((m) => runtime.value[m.key].state !== 'done')?.key || 'next');

async function run(key: string, fn: () => Promise<unknown>): Promise<boolean> {
  busy.value = key;
  errors.value = { ...errors.value, [key]: '' };
  try { await fn(); await refreshState(); return true; } catch (e) { errors.value = { ...errors.value, [key]: errorMessage(e) }; return false; } finally { busy.value = ''; }
}
async function generate(): Promise<void> {
  if (outline.value.length && !window.confirm(i18nT('重新生成会覆盖当前提纲，继续？'))) return;
  dirty.value = false;
  await run('generate', () => aw('outline.generate'));
}
async function save(): Promise<void> {
  const ok = await run('edit', () => aw('outline.save', { outline: draft.value }));
  if (ok) { dirty.value = false; notif.success(i18nT('提纲已保存')); }
}
function onPoints(sec: AwOutlineSection, v: string): void { sec.points = v.split('\n').map((x) => x.trim()).filter(Boolean); dirty.value = true; }
function toggleCite(sec: AwOutlineSection, id: string): void {
  sec.cites = sec.cites.includes(id) ? sec.cites.filter((c) => c !== id) : [...sec.cites, id];
  dirty.value = true;
}
function move(i: number, d: number): void {
  const arr = [...draft.value];
  [arr[i], arr[i + d]] = [arr[i + d], arr[i]];
  draft.value = arr;
  dirty.value = true;
}
function removeSec(i: number): void { draft.value = draft.value.filter((_, j) => j !== i); dirty.value = true; }
function addSec(): void { draft.value = [...draft.value, { id: '', heading: '', points: [], cites: [] }]; dirty.value = true; }
function scrollTo(k: string): void { void scrollToStep(k); }
</script>

<style scoped>
.aw-head { display: flex; justify-content: space-between; gap: 16px; flex-wrap: wrap; align-items: flex-start; }
.aw-head strong { display: flex; gap: 6px; align-items: center; }
.aw-head p { margin: 4px 0 0; }
.aw-sec { display: grid; gap: 8px; padding: 10px; border: 1px solid var(--color-border); border-radius: var(--radius-5); background: var(--color-bg-primary); margin-bottom: 8px; }
.aw-sec__head { display: flex; gap: 6px; align-items: center; }
.aw-sec__title { flex: 1; height: 32px; border-radius: var(--radius-3); border: 1px solid var(--color-border); background: var(--color-bg-card); color: var(--color-text-primary); font: inherit; font-weight: 600; padding: 0 8px; }
.aw-sec textarea { width: 100%; box-sizing: border-box; }
.aw-cites { display: flex; flex-wrap: wrap; gap: 4px; align-items: center; font-size: var(--font-size-sm); }
.aw-cite { border: 1px solid var(--color-border); background: var(--color-bg-card); color: var(--color-text-secondary); border-radius: var(--radius-5); padding: 2px 8px; font: inherit; font-size: 11.5px; cursor: pointer; }
.aw-cite.on { border-color: var(--color-brand); color: var(--color-brand); background: color-mix(in srgb, var(--color-brand) 10%, var(--color-bg-card)); }
.spin { animation: aw-spin 1s linear infinite; }
@keyframes aw-spin { to { transform: rotate(360deg); } }
</style>
