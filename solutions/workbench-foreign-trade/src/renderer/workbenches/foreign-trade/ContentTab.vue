<template>
  <div class="ss-module">
    <ModuleHeader :meta="meta" />

    <!-- 公司信息（写文案、开发信都会用到） -->
    <section class="ss-rules">
      <h4><i class="ri-building-line"></i>{{ $t('公司信息') }}<button type="button" class="ss-link" @click="brandOpen = !brandOpen">{{ brandOpen ? $t('收起') : $t('编辑') }}</button></h4>
      <p v-if="!brandOpen" class="ss-muted">{{ brandSummary }}</p>
      <template v-else>
        <div class="ss-grid">
          <label class="ss-field"><span>{{ $t('公司名称') }}</span><input v-model="brand.company" type="text" /></label>
        </div>
        <label class="ss-field"><span>{{ $t('公司介绍') }}</span><textarea v-model="brand.intro" rows="3"></textarea></label>
        <label class="ss-field"><span>{{ $t('核心卖点') }}</span><textarea v-model="brand.sellingPoints" rows="3"></textarea></label>
        <div class="ss-actions"><span class="grow"></span><button type="button" class="ss-btn sm primary" @click="saveBrand"><i class="ri-save-line"></i>{{ $t('保存') }}</button></div>
      </template>
    </section>

    <StickyProgress :title="$t('内容生产')" :metas="metas" :runtime="runtime" :current-key="currentKey" @jump="scrollTo" />
    <div class="ss-steps">
      <StepCard step-key="pick" :index="0" :title="metas[0].title" :hint="metas[0].hint" :runtime="runtime.pick">
        <div class="ss-grid">
          <label class="ss-field"><span>{{ $t('内容类型') }}</span>
            <select v-model="form.kind"><option v-for="k in KINDS" :key="k.value" :value="k.value">{{ k.label }}</option></select>
          </label>
          <label class="ss-field"><span>{{ $t('产品') }}</span>
            <select v-model="form.productId">
              <option value="">{{ $t('不指定产品') }}</option>
              <option v-for="p in state?.products || []" :key="p.id" :value="p.id">{{ p.model }} · {{ p.name }}</option>
            </select>
          </label>
          <label class="ss-field"><span>{{ $t('语言') }}</span>
            <select v-model="form.language"><option v-for="l in LANGS" :key="l.value" :value="l.value">{{ l.label }}</option></select>
          </label>
        </div>
        <label class="ss-field"><span>{{ $t('主题 / 要点') }}</span><input v-model="form.topic" type="text" :placeholder="$t('例如：主打防水性能，面向中东户外市场')" /></label>
        <label class="ss-field"><span>{{ $t('补充资料（参数、认证、案例等，只会使用这里写的内容）') }}</span><textarea v-model="form.extra" rows="3"></textarea></label>
      </StepCard>

      <StepCard step-key="write" :index="1" :title="metas[1].title" :hint="metas[1].hint" :runtime="runtime.write">
        <div class="ss-actions">
          <button type="button" class="ss-btn primary" :disabled="busy === 'write'" @click="generate"><i :class="busy === 'write' ? 'ri-loader-4-line spin' : 'ri-quill-pen-line'"></i>{{ draft ? $t('重新生成') : $t('生成文案') }}</button>
          <span v-if="draft" class="ss-muted">{{ $t('由 {p0} 撰写', { p0: modelLabel(draft.model) }) }}</span>
        </div>
        <template v-if="editor">
          <label class="ss-field"><span>{{ $t('标题') }}</span><input v-model="editor.title" type="text" /></label>
          <label class="ss-field"><span>{{ $t('关键词（逗号分隔）') }}</span><input v-model="editor.keywords" type="text" /></label>
          <label class="ss-field"><span>{{ $t('正文') }}</span><textarea v-model="editor.body" rows="14"></textarea></label>
          <div class="ss-actions"><span class="grow"></span><button type="button" class="ss-btn sm" :disabled="busy === 'save'" @click="saveDraft"><i class="ri-save-line"></i>{{ $t('保存修改') }}</button></div>
        </template>
      </StepCard>

      <StepCard step-key="images" :index="2" :title="metas[2].title" :hint="metas[2].hint" :runtime="runtime.images">
        <p v-if="!draft" class="ss-muted">{{ $t('先生成文案') }}</p>
        <template v-else>
          <div class="ss-actions">
            <button type="button" class="ss-btn" :disabled="busy === 'prompts'" @click="makePrompts"><i :class="busy === 'prompts' ? 'ri-loader-4-line spin' : 'ri-lightbulb-line'"></i>{{ $t('生成图片描述') }}</button>
            <button type="button" class="ss-btn ghost" @click="pickReference"><i class="ri-image-add-line"></i>{{ referenceImage ? $t('更换产品实拍图') : $t('选择产品实拍图（可选）') }}</button>
            <button v-if="referenceImage" type="button" class="ss-link" @click="referenceImage = ''">{{ $t('不用实拍图') }}</button>
            <span class="grow"></span>
            <button type="button" class="ss-btn ghost" @click="uploadImages"><i class="ri-upload-2-line"></i>{{ $t('上传已有图片') }}</button>
          </div>
          <p v-if="referenceImage" class="ss-note info"><i class="ri-information-line"></i>{{ $t('会以这张实拍图为底图生成场景图，产品外观保持一致：{p0}', { p0: referenceImage }) }}</p>
          <div v-for="(p, i) in prompts" :key="i" class="ft-prompt">
            <textarea v-model="prompts[i]" rows="2"></textarea>
            <button type="button" class="ss-btn sm ghost" @click="prompts.splice(i, 1)"><i class="ri-close-line"></i></button>
          </div>
          <div class="ss-actions">
            <button type="button" class="ss-link" @click="prompts.push('')">{{ $t('+ 添加一条描述') }}</button>
            <span class="grow"></span>
            <button type="button" class="ss-btn primary" :disabled="busy === 'images' || !prompts.filter(Boolean).length" @click="makeImages"><i :class="busy === 'images' ? 'ri-loader-4-line spin' : 'ri-image-line'"></i>{{ $t('生成图片') }}</button>
          </div>
          <p v-if="busy === 'images' && ftProgress.content" class="ss-muted">{{ ftProgress.content }}</p>
          <div v-if="draft.images.length" class="ft-thumbs">
            <figure v-for="img in draft.images" :key="img" :class="{ picked: videoImage === img }" @click="videoImage = img">
              <img :src="fileUrl(img)" alt="" />
            </figure>
          </div>
        </template>
      </StepCard>

      <StepCard step-key="video" :index="3" :title="metas[3].title" :hint="metas[3].hint" :runtime="runtime.video">
        <p v-if="!draft?.images.length" class="ss-muted">{{ $t('先准备好产品图片') }}</p>
        <template v-else>
          <div class="ss-actions">
            <button type="button" class="ss-btn" :disabled="busy === 'video'" @click="slideshow"><i :class="busy === 'video' ? 'ri-loader-4-line spin' : 'ri-slideshow-line'"></i>{{ $t('用全部图片成片') }}</button>
            <span class="ss-muted">{{ $t('或') }}</span>
            <input v-model="videoPrompt" type="text" class="ft-input" :placeholder="$t('AI 视频的镜头描述（可选）')" />
            <button type="button" class="ss-btn primary" :disabled="busy === 'video' || !videoImage" @click="aiVideo"><i :class="busy === 'video' ? 'ri-loader-4-line spin' : 'ri-movie-2-line'"></i>{{ $t('用选中图片生成 AI 视频') }}</button>
          </div>
          <p class="ss-muted">{{ videoImage ? $t('已选中图片：{p0}', { p0: videoImage }) : $t('在上一步点一张图片作为 AI 视频的首帧') }}</p>
          <p v-if="busy === 'video' && ftProgress.content" class="ss-muted">{{ ftProgress.content }}</p>
          <div v-if="draft.videos.length" class="ft-videos">
            <video v-for="v in draft.videos" :key="v" :src="fileUrl(v)" controls preload="metadata"></video>
          </div>
        </template>
      </StepCard>

      <StepCard step-key="approve" :index="4" :title="metas[4].title" :hint="metas[4].hint" :runtime="runtime.approve">
        <div v-if="draft" class="ss-actions">
          <button type="button" class="ss-btn primary" :disabled="draft.status === 'approved'" @click="approve"><i class="ri-checkbox-circle-line"></i>{{ draft.status === 'approved' ? $t('已定稿') : $t('审核通过，定稿') }}</button>
          <button type="button" class="ss-btn" :disabled="busy === 'export'" @click="exportPdf"><i class="ri-file-pdf-2-line"></i>{{ $t('导出 PDF') }}</button>
          <span class="grow"></span>
          <button type="button" class="ss-btn ghost" :disabled="draft.status !== 'approved'" @click="$emit('goto', 'platform', { contentId: draft.id })"><i class="ri-store-2-line"></i>{{ $t('去平台发布产品') }}</button>
          <button type="button" class="ss-btn ghost" :disabled="draft.status !== 'approved'" @click="$emit('goto', 'social', { contentId: draft.id })"><i class="ri-global-line"></i>{{ $t('去社媒排期发布') }}</button>
        </div>
        <p v-else class="ss-muted">{{ $t('先生成文案') }}</p>
      </StepCard>
    </div>

    <!-- 历史内容 -->
    <section class="ss-panel">
      <header><strong>{{ $t('内容记录') }}</strong><span class="ss-muted">{{ $t('{n} 条', { n: (state?.contents || []).length }) }}</span></header>
      <div v-if="(state?.contents || []).length" class="ss-table-wrap">
        <table class="ss-table">
          <thead><tr><th>{{ $t('标题') }}</th><th>{{ $t('类型') }}</th><th>{{ $t('语言') }}</th><th>{{ $t('素材') }}</th><th>{{ $t('状态') }}</th><th>{{ $t('时间') }}</th><th></th></tr></thead>
          <tbody>
            <tr v-for="c in state?.contents || []" :key="c.id" :class="{ 'ft-active': c.id === draftId }">
              <td class="ft-wrap">{{ c.title || $t('（无标题）') }}</td>
              <td>{{ kindLabel(c.kind) }}</td>
              <td>{{ c.language }}</td>
              <td>{{ $t('{a} 图 / {b} 视频', { a: c.images.length, b: c.videos.length }) }}</td>
              <td><span class="ss-chip" :class="c.status === 'approved' ? 'ok' : ''">{{ c.status === 'approved' ? $t('已定稿') : $t('草稿') }}</span><span v-if="c.published" class="ss-chip brand">{{ $t('已交付发布') }}</span></td>
              <td>{{ fmtDateTime(c.createdAt) }}</td>
              <td>
                <button type="button" class="ss-btn sm ghost" @click="openDraft(c.id)">{{ $t('打开') }}</button>
                <button type="button" class="ss-btn sm ghost danger" @click="removeDraft(c.id)"><i class="ri-delete-bin-line"></i></button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-else class="ss-empty">{{ $t('还没有内容') }}</p>
    </section>
  </div>
</template>

<script setup lang="ts">
/**
 * 内容生产：文案 → 产品图片 → 产品视频 → 定稿；定稿后交给平台运营 / 网站社媒发布。
 */
import { computed, reactive, ref, watch } from 'vue';
import type { FtContentDraft, FtContentKind } from '@totalclaw/ipc-contracts';
import { useNotificationStore } from '../../stores/notification';
import { t as i18nT } from '../../i18n';
import StepCard from '../service-settlement/StepCard.vue';
import StickyProgress from '../service-settlement/StickyProgress.vue';
import { scrollToStep, type StepMeta, type StepRuntime } from '../service-settlement/shared';
import ModuleHeader from './ModuleHeader.vue';
import { errorMessage, fileUrl, fmtDateTime, ft, ftProgress, ftState, modelLabel, refreshState, type FtModuleMeta } from './shared';

const props = defineProps<{ meta: FtModuleMeta; focus?: { contentId?: string; productId?: string } | null }>();
defineEmits<{ (e: 'goto', module: string, payload: any): void }>();
const notif = useNotificationStore();
const state = ftState;

const KINDS: { value: FtContentKind; label: string }[] = [
  { value: 'product_listing', label: i18nT('平台上架文案') },
  { value: 'product_desc', label: i18nT('产品说明') },
  { value: 'social_post', label: i18nT('社媒帖子') },
  { value: 'article', label: i18nT('官网文章') },
  { value: 'outreach_template', label: i18nT('开发信模板') },
];
const LANGS = [
  { value: 'English', label: 'English' },
  { value: 'Spanish', label: 'Español' },
  { value: 'Arabic', label: 'العربية' },
  { value: 'French', label: 'Français' },
  { value: 'Russian', label: 'Русский' },
  { value: 'Portuguese', label: 'Português' },
  { value: 'Chinese', label: i18nT('中文') },
];
function kindLabel(k: FtContentKind): string { return KINDS.find((x) => x.value === k)?.label || k; }

const form = reactive({ kind: 'product_listing' as FtContentKind, productId: '', language: 'English', topic: '', extra: '' });
const draftId = ref('');
const draft = computed<FtContentDraft | null>(() => state.value?.contents.find((c) => c.id === draftId.value) || null);
const editor = ref<{ title: string; body: string; keywords: string } | null>(null);
const prompts = ref<string[]>([]);
const referenceImage = ref('');
const videoImage = ref('');
const videoPrompt = ref('');
const busy = ref('');
const errors = ref<Record<string, string>>({});
const brandOpen = ref(false);
const brand = reactive({ company: '', intro: '', sellingPoints: '' });

watch(() => state.value?.settings.brand, (b) => { if (b) Object.assign(brand, b); }, { immediate: true });
const brandSummary = computed(() => {
  const b = state.value?.settings.brand;
  return b?.company ? `${b.company}${b.sellingPoints ? ` · ${b.sellingPoints.slice(0, 60)}` : ''}` : i18nT('还没有填写公司信息，生成的文案落款会用占位符');
});

watch(() => draft.value?.id, () => {
  const d = draft.value;
  editor.value = d ? { title: d.title, body: d.body, keywords: (d.keywords || []).join(', ') } : null;
  videoImage.value = d?.images[0] || '';
  errors.value = {};
});
watch(() => props.focus, (f) => {
  if (f?.contentId) draftId.value = f.contentId;
  if (f?.productId) form.productId = f.productId;
}, { immediate: true });

const metas: StepMeta[] = [
  { key: 'pick', title: i18nT('选择内容类型与产品'), hint: i18nT('写什么、为哪个产品写、用什么语言') },
  { key: 'write', title: i18nT('生成文案'), hint: i18nT('只用你给的资料，缺的写成「请补充」占位') },
  { key: 'images', title: i18nT('产品图片'), hint: i18nT('按描述生成主图、场景图、细节图，也可以用实拍图做底') },
  { key: 'video', title: i18nT('产品视频'), hint: i18nT('全部图片成片，或用一张图生成 AI 视频') },
  { key: 'approve', title: i18nT('审核定稿'), hint: i18nT('人审核通过后，才能交给数字员工发布') },
];
const runtime = computed<Record<string, StepRuntime>>(() => {
  const d = draft.value;
  const st = (key: string, done: boolean, summary?: string): StepRuntime => (busy.value === key || (key === 'images' && busy.value === 'prompts')
    ? { state: 'running' }
    : errors.value[key] ? { state: 'failed', error: errors.value[key] }
      : done ? { state: 'done', summary } : { state: 'todo' });
  return {
    pick: st('pick', !!d || !!form.topic || !!form.productId),
    write: st('write', !!d, d ? d.title : ''),
    images: st('images', !!d?.images.length, d ? i18nT('{n} 张', { n: d.images.length }) : ''),
    video: st('video', !!d?.videos.length, d ? i18nT('{n} 个', { n: d.videos.length }) : ''),
    approve: st('approve', d?.status === 'approved'),
  };
});
const currentKey = computed(() => metas.find((m) => runtime.value[m.key].state !== 'done')?.key || 'approve');

async function run(key: string, fn: () => Promise<unknown>): Promise<boolean> {
  busy.value = key;
  errors.value = { ...errors.value, [key === 'prompts' ? 'images' : key]: '' };
  void scrollToStep(key === 'prompts' ? 'images' : key);
  try {
    await fn();
    await refreshState();
    return true;
  } catch (e) {
    errors.value = { ...errors.value, [key === 'prompts' ? 'images' : key]: errorMessage(e) };
    return false;
  } finally {
    busy.value = '';
  }
}

async function saveBrand(): Promise<void> {
  try { await ft('settings.patch', { patch: { brand: { ...brand } } }); await refreshState(); brandOpen.value = false; notif.success(i18nT('已保存')); } catch (e) { notif.error(errorMessage(e)); }
}
async function generate(): Promise<void> {
  await run('write', async () => {
    const d = await ft<FtContentDraft>('content.generate', { ...form });
    draftId.value = d.id;
    prompts.value = [];
  });
}
async function saveDraft(): Promise<void> {
  if (!draft.value || !editor.value) return;
  const e = editor.value;
  await run('save', () => ft('content.save', { draft: { id: draft.value!.id, title: e.title, body: e.body, keywords: e.keywords.split(/[,，]+/).map((x) => x.trim()).filter(Boolean) } }));
  notif.success(i18nT('已保存'));
}
async function makePrompts(): Promise<void> {
  if (!draft.value) return;
  await run('prompts', async () => { prompts.value = await ft<string[]>('content.imagePrompts', { id: draft.value!.id, count: 4 }); });
}
async function pickReference(): Promise<void> {
  const paths = await ft<string[]>('files.pick', { filters: [{ name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'webp'] }] });
  if (paths[0]) referenceImage.value = paths[0];
}
async function uploadImages(): Promise<void> {
  if (!draft.value) return;
  const paths = await ft<string[]>('files.pick', { multi: true, filters: [{ name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'webp'] }] });
  if (!paths.length) return;
  await run('images', () => ft('content.addImages', { id: draft.value!.id, paths }));
}
async function makeImages(): Promise<void> {
  if (!draft.value) return;
  await run('images', async () => {
    const r = await ft<{ draft: FtContentDraft; errors: string[] }>('content.images', { id: draft.value!.id, prompts: prompts.value.filter(Boolean), referenceImage: referenceImage.value || undefined });
    if (r.errors?.length) notif.warn(i18nT('有 {n} 张没生成出来：{p0}', { n: r.errors.length, p0: r.errors[0] }));
    if (!videoImage.value) videoImage.value = r.draft.images[0] || '';
  });
}
async function slideshow(): Promise<void> {
  if (!draft.value) return;
  const d = draft.value;
  await run('video', async () => {
    const dir = await ft<string>('content.materialDir', { id: d.id });
    const res = await (window as any).electronAPI.solution.videoGenerate({ script: 'oneclick', materialDir: dir, perImage: 2.2, width: 1080, height: 1080, title: d.title });
    if (res?.cancelled) throw new Error(i18nT('已取消'));
    if (!res?.ok || !res.videoPath) throw new Error(res?.error || i18nT('成片失败'));
    await ft('content.attachVideo', { id: d.id, path: res.videoPath });
  });
}
async function aiVideo(): Promise<void> {
  if (!draft.value || !videoImage.value) return;
  await run('video', () => ft('content.video', { id: draft.value!.id, image: videoImage.value, prompt: videoPrompt.value }));
}
async function approve(): Promise<void> {
  if (!draft.value) return;
  if (editor.value) await saveDraft();
  await run('approve', () => ft('content.save', { draft: { id: draft.value!.id, status: 'approved' } }));
}
async function exportPdf(): Promise<void> {
  if (!draft.value) return;
  await run('export', async () => {
    const path = await ft<string>('content.export', { id: draft.value!.id });
    await ft('path.open', { path });
  });
  if (errors.value.export) notif.error(errors.value.export);
}
function openDraft(id: string): void {
  draftId.value = id;
  void scrollToStep('write');
}
async function removeDraft(id: string): Promise<void> {
  if (!window.confirm(i18nT('确定删除这条内容？已生成的图片和视频文件会保留在输出目录。'))) return;
  try {
    await ft('content.remove', { id });
    if (draftId.value === id) draftId.value = '';
    await refreshState();
  } catch (e) { notif.error(errorMessage(e)); }
}
function scrollTo(key: string): void { void scrollToStep(key); }
</script>

<style scoped>
.ft-prompt { display: flex; gap: 6px; align-items: flex-start; }
.ft-prompt textarea { flex: 1; min-height: 44px; border-radius: 9px; border: 1px solid var(--color-border); background: var(--color-bg-input, var(--color-bg-primary)); color: var(--color-text-primary); font: inherit; font-size: 12.5px; padding: 6px 10px; resize: vertical; }
.ft-thumbs { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 8px; }
.ft-thumbs figure { margin: 0; border: 2px solid transparent; border-radius: 10px; overflow: hidden; cursor: pointer; background: var(--color-bg-primary); aspect-ratio: 1; }
.ft-thumbs figure.picked { border-color: var(--color-brand); }
.ft-thumbs img { width: 100%; height: 100%; object-fit: cover; display: block; }
.ft-videos { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 10px; }
.ft-videos video { width: 100%; border-radius: 10px; background: #000; }
.ft-input { height: 34px; border-radius: 9px; border: 1px solid var(--color-border); background: var(--color-bg-input, var(--color-bg-primary)); color: var(--color-text-primary); font: inherit; font-size: 12.5px; padding: 0 10px; min-width: 200px; flex: 1; }
.ft-wrap { white-space: normal !important; max-width: 320px; }
.ft-active td { background: color-mix(in srgb, var(--color-brand) 8%, transparent); }
</style>
