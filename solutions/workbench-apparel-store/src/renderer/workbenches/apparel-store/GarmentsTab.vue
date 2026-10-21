<template>
  <div class="ap-gl">
    <section class="ss-panel ap-gl__list" :class="{ over: dragOver }" @dragover.prevent="dragOver = true" @dragleave.prevent="dragOver = false" @drop.prevent="onDrop">
      <header class="ap-head">
        <strong><i class="ri-t-shirt-line"></i>{{ $t('商品库') }}</strong>
        <span class="ss-muted">{{ $t('{n} 件，手机端上架 {m} 件', { n: garments.length, m: garments.filter((g) => g.onShelf).length }) }}</span>
        <span class="grow"></span>
        <button type="button" class="ss-btn sm primary" :disabled="!!busy" @click="importMore()"><i class="ri-image-add-line"></i>{{ $t('导入服装图') }}</button>
      </header>
      <p class="ss-muted">{{ $t('可把图片直接拖进来批量导入。') }}{{ $t('白底图或平铺图效果最好。导入后 AI 自动识别品类、颜色、风格、面料、季节与适用人群，并给一组推荐造型；识别结果可手改。经营自动化智能体的上下架与短视频也用这份商品库。') }}</p>
      <p v-if="!garments.length" class="ss-empty">{{ $t('还没有商品') }}</p>
      <div class="ap-gl__items">
        <button v-for="g in garments" :key="g.id" type="button" class="ap-gl__item" :class="{ on: editing?.id === g.id }" @click="edit(g.id)">
          <img :src="fileUrl(g.image)" alt="" loading="lazy" />
          <span>
            <b>{{ g.name }}</b>
            <small>{{ [g.category, g.color, g.style].filter(Boolean).join(' · ') || $t('未打标签') }}</small>
            <small>¥{{ g.price }} · {{ $t('库存 {n}', { n: stockTotal(g.stock) }) }}</small>
          </span>
          <em class="ss-chip" :class="g.onShelf ? 'ok' : ''">{{ g.onShelf ? $t('已上架') : $t('未上架') }}</em>
        </button>
      </div>
    </section>

    <section v-if="editing" class="ss-panel ap-gl__edit">
      <header class="ap-head">
        <strong>{{ $t('编辑商品') }}</strong>
        <span v-if="editing.taggedBy" class="ss-chip brand">{{ $t('AI 已打标签') }}</span>
        <span class="grow"></span>
        <button type="button" class="ss-btn sm" :disabled="!!busy" @click="tag"><i :class="busy === 'tag' ? 'ri-loader-4-line spin' : 'ri-magic-line'"></i>{{ $t('AI 重新打标签') }}</button>
      </header>
      <div class="ap-gl__top">
        <img :src="fileUrl(editing.image)" alt="" />
        <div class="ss-grid">
          <label class="ss-field"><span>{{ $t('名称') }}</span><input v-model.trim="draft.name" type="text" /></label>
          <label class="ss-field"><span>{{ $t('货号') }}</span><input v-model.trim="draft.sku" type="text" /></label>
          <label class="ss-field"><span>{{ $t('价格（元）') }}</span><input v-model.number="draft.price" type="number" min="0" /></label>
          <label class="ss-field"><span>{{ $t('品类') }}</span><input v-model.trim="draft.category" type="text" /></label>
          <label class="ss-field"><span>{{ $t('颜色') }}</span><input v-model.trim="draft.color" type="text" /></label>
          <label class="ss-field"><span>{{ $t('风格') }}</span><input v-model.trim="draft.style" type="text" /></label>
          <label class="ss-field"><span>{{ $t('面料') }}</span><input v-model.trim="draft.fabric" type="text" /></label>
          <label class="ss-field"><span>{{ $t('季节') }}</span>
            <select v-model="draft.season"><option value="">—</option><option v-for="s in SEASONS" :key="s" :value="s">{{ s }}</option></select>
          </label>
          <label class="ss-field"><span>{{ $t('适用人群') }}</span>
            <select v-model="draft.audience"><option value="women">{{ $t('女装') }}</option><option value="men">{{ $t('男装') }}</option><option value="kids">{{ $t('童装') }}</option></select>
          </label>
        </div>
      </div>
      <label class="ss-field"><span>{{ $t('卖点（上架文案、短视频脚本用）') }}</span><textarea v-model="draft.sellingPoints" rows="2"></textarea></label>
      <label class="ss-field"><span>{{ $t('标签（逗号分隔）') }}</span><input v-model="tagText" type="text" /></label>
      <div class="ap-stock">
        <span class="ss-subhead">{{ $t('尺码与库存') }}</span>
        <div class="ap-stock__row">
          <label v-for="(n, size) in draft.stock" :key="size" class="ap-stock__cell">
            <b>{{ size }}</b><input v-model.number="draft.stock[size]" type="number" min="0" />
            <button type="button" class="ss-link" :aria-label="$t('删除')" @click="delete draft.stock[size]"><i class="ri-close-line"></i></button>
          </label>
          <span class="ap-stock__add"><input v-model.trim="newSize" type="text" :placeholder="$t('加尺码，如 XL 或 120')" @keydown.enter.prevent="addSize" /><button type="button" class="ss-link" @click="addSize">{{ $t('添加') }}</button></span>
        </div>
      </div>
      <label class="ap-check"><input v-model="draft.onShelf" type="checkbox" />{{ $t('在门店试穿手机端上架') }}</label>
      <div class="ap-rec">
        <span class="ss-subhead">{{ $t('推荐造型（店长推荐）') }}</span>
        <StylePicker v-model="rec" :audience="draft.audience" />
      </div>
      <div class="ss-actions">
        <button type="button" class="ss-btn primary" :disabled="!!busy" @click="save"><i class="ri-save-line"></i>{{ $t('保存') }}</button>
        <button type="button" class="ss-btn ghost" @click="editing = null">{{ $t('关闭') }}</button>
        <span class="grow"></span>
        <button type="button" class="ss-btn sm danger" :disabled="!!busy" @click="remove"><i class="ri-delete-bin-line"></i>{{ $t('删除商品') }}</button>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
/** 商品库：导入 → AI 打标签 → 手改属性、尺码库存、推荐造型、手机端上下架。 */
import { computed, reactive, ref } from 'vue';
import type { ApGarment, ApStyleChoice } from '@totalclaw/ipc-contracts';
import { useNotificationStore } from '../../stores/notification';
import { t as i18nT } from '../../i18n';
import StylePicker from './StylePicker.vue';
import { IMAGE_RE, ap, apState, droppedPaths, errorMessage, fileUrl, pickImages, refreshState, stockTotal } from './shared';

const notif = useNotificationStore();
const SEASONS = [i18nT('春'), i18nT('夏'), i18nT('秋'), i18nT('冬'), i18nT('四季')];
const garments = computed(() => apState.value?.garments || []);
const editing = ref<ApGarment | null>(null);
const draft = reactive<ApGarment>({} as ApGarment);
const rec = ref<ApStyleChoice>({ backgroundId: 'B29', poseId: 'P01', hairId: 'H00' });
const tagText = ref('');
const newSize = ref('');
const busy = ref('');

function edit(id: string): void {
  const g = garments.value.find((x) => x.id === id);
  if (!g) return;
  editing.value = g;
  Object.assign(draft, JSON.parse(JSON.stringify(g)));
  rec.value = g.recommended ? { ...g.recommended } : { backgroundId: 'B29', backgroundVariant: 'B29-1', poseId: 'P01', poseVariant: 'P01-1', hairId: 'H00' };
  tagText.value = g.tags.join(i18nT('，'));
}
function addSize(): void {
  const s = newSize.value.trim().toUpperCase();
  if (s && !(s in draft.stock)) draft.stock[s] = 0;
  newSize.value = '';
}
const dragOver = ref(false);
function onDrop(ev: DragEvent): void {
  dragOver.value = false;
  const paths = droppedPaths(ev, IMAGE_RE);
  if (paths.length) void importMore(paths);
}
async function importMore(dropped?: string[]): Promise<void> {
  const paths = dropped?.length ? dropped : await pickImages(true, i18nT('选择服装白底图 / 平铺图'));
  if (!paths.length) return;
  busy.value = 'import';
  try {
    const made = await ap<ApGarment[]>('garments.import', { paths });
    await refreshState();
    for (const g of made) {
      try { await ap('garment.tag', { id: g.id }); } catch (e) { notif.warn(errorMessage(e)); break; }
    }
    await refreshState();
    if (made[0]) edit(made[0].id);
  } catch (e) { notif.error(errorMessage(e)); } finally { busy.value = ''; }
}
async function tag(): Promise<void> {
  if (!editing.value) return;
  busy.value = 'tag';
  try { await ap('garment.tag', { id: editing.value.id }); await refreshState(); edit(editing.value.id); } catch (e) { notif.error(errorMessage(e)); } finally { busy.value = ''; }
}
async function save(): Promise<void> {
  busy.value = 'save';
  try {
    await ap('garment.save', { input: { ...draft, tags: tagText.value.split(/[,，、\s]+/).filter(Boolean), recommended: rec.value } });
    await refreshState();
    edit(draft.id);
    notif.success(i18nT('已保存'));
  } catch (e) { notif.error(errorMessage(e)); } finally { busy.value = ''; }
}
async function remove(): Promise<void> {
  if (!editing.value || !window.confirm(i18nT('删除商品「{p0}」？', { p0: editing.value.name }))) return;
  try { await ap('garment.remove', { id: editing.value.id }); editing.value = null; await refreshState(); } catch (e) { notif.error(errorMessage(e)); }
}
</script>

<style scoped>
.ap-gl { display: grid; grid-template-columns: minmax(320px, 420px) 1fr; gap: 14px; align-items: start; }
.ss-panel { border: 1px solid var(--color-border); border-radius: 14px; background: var(--color-bg-card); padding: 14px; display: grid; gap: 10px; }
.ap-gl__list.over { border-color: var(--color-brand); background: color-mix(in srgb, var(--color-brand) 6%, var(--color-bg-card)); }
.ap-head { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
.ap-head strong { display: flex; gap: 6px; align-items: center; font-size: 14px; }
.ap-gl__items { display: grid; gap: 6px; max-height: 640px; overflow-y: auto; }
.ap-gl__item { display: flex; gap: 10px; align-items: center; text-align: start; padding: 6px; border: 1px solid var(--color-border); border-radius: 10px; background: var(--color-bg-primary); cursor: pointer; font: inherit; color: var(--color-text-primary); }
.ap-gl__item.on { border-color: var(--color-brand); }
.ap-gl__item img { width: 48px; height: 64px; object-fit: contain; background: #fff; border-radius: 6px; }
.ap-gl__item span { flex: 1; min-width: 0; display: grid; }
.ap-gl__item b { font-size: 12.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ap-gl__item small { font-size: 11.5px; color: var(--color-text-secondary); }
.ap-gl__top { display: grid; grid-template-columns: 150px 1fr; gap: 14px; }
.ap-gl__top img { width: 150px; aspect-ratio: 3 / 4; object-fit: contain; background: #fff; border-radius: 10px; border: 1px solid var(--color-border); }
.ap-stock { display: grid; gap: 6px; }
.ap-stock__row { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
.ap-stock__cell { display: inline-flex; gap: 4px; align-items: center; padding: 4px 6px; border: 1px solid var(--color-border); border-radius: 8px; font-size: 12px; }
.ap-stock__cell input { width: 56px; height: 26px; border-radius: 6px; border: 1px solid var(--color-border); background: var(--color-bg-input, var(--color-bg-primary)); color: var(--color-text-primary); padding: 0 6px; font: inherit; }
.ap-stock__add { display: inline-flex; gap: 6px; align-items: center; }
.ap-stock__add input { width: 150px; height: 28px; border-radius: 7px; border: 1px solid var(--color-border); background: var(--color-bg-input, var(--color-bg-primary)); color: var(--color-text-primary); padding: 0 8px; font: inherit; font-size: 12px; }
.ap-check { display: flex; gap: 6px; align-items: center; font-size: 12.5px; }
.ap-rec { display: grid; gap: 6px; }
.grow { flex: 1; }
.spin { animation: ap-spin 1s linear infinite; }
@keyframes ap-spin { to { transform: rotate(360deg); } }
@media (max-width: 1000px) { .ap-gl { grid-template-columns: 1fr; } }
</style>
