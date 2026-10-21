<template>
  <div class="ap-picker">
    <div class="ap-picker__kinds" role="tablist">
      <button
        v-for="k in KINDS" :key="k" type="button" role="tab" :class="{ on: kind === k }" :aria-selected="kind === k" @click="kind = k"
      >
        <i :class="KIND_ICON[k]"></i>
        <span>{{ kindLabel(k) }}</span>
        <em>{{ choicePart(model[idKey(k)], model[variantKey(k)]) || $t('未选') }}</em>
      </button>
    </div>
    <div class="ap-picker__groups">
      <div v-for="g in groups" :key="g" class="ap-picker__group">
        <small>{{ g }}</small>
        <div class="ap-picker__chips">
          <button
            v-for="o in inGroup(g)" :key="o.id" type="button" class="ap-chip" :class="{ on: model[idKey(kind)] === o.id }"
            :title="o.detail" @click="pick(o.id)"
          ><img v-if="thumbs[o.id]" :src="fileUrl(thumbs[o.id])" alt="" loading="lazy" />{{ o.label }}</button>
        </div>
      </div>
    </div>
    <button v-if="kind === 'hair' && audience" type="button" class="ss-link ap-picker__all" @click="showAll = !showAll">{{ showAll ? $t('只看适合该商品人群的发型') : $t('显示全部发型') }}</button>
    <div v-if="current && current.variants.length" class="ap-picker__variants">
      <small>{{ $t('细分场景') }} · {{ current.label }}<template v-if="current.detail">{{ $t('（{p0}）', { p0: current.detail }) }}</template></small>
      <div class="ap-picker__chips">
        <button
          v-for="v in current.variants" :key="v.id" type="button" class="ap-chip sub" :class="{ on: model[variantKey(kind)] === v.id }"
          @click="pickVariant(v.id)"
        >{{ v.label }}</button>
      </div>
    </div>
    <slot v-if="current?.needsUpload" name="upload"></slot>
  </div>
</template>

<script setup lang="ts">
/**
 * 造型选择器：背景 / 姿势 / 发型三类，先选大项再选细分场景（不选细分按大项通用描述生成）。
 * 按商品适用人群过滤（男装只显示适用男装的发型）。v-model 是一组 ApStyleChoice。
 */
import { computed, ref } from 'vue';
import type { ApAudience, ApStyleChoice, ApStyleKind } from '@totalclaw/ipc-contracts';
import { apState, choicePart, fileUrl, kindLabel, optionById, optionsOf } from './shared';

const props = defineProps<{ modelValue: ApStyleChoice; audience?: ApAudience | null; disabledIds?: string[] }>();
const emit = defineEmits<{ (e: 'update:modelValue', v: ApStyleChoice): void }>();

const KINDS: ApStyleKind[] = ['background', 'pose', 'hair'];
const KIND_ICON: Record<ApStyleKind, string> = { background: 'ri-landscape-line', pose: 'ri-walk-line', hair: 'ri-scissors-cut-line' };
const kind = ref<ApStyleKind>('background');
const model = computed(() => props.modelValue as unknown as Record<string, string | undefined>);

const idKey = (k: ApStyleKind) => (k === 'background' ? 'backgroundId' : k === 'pose' ? 'poseId' : 'hairId');
const variantKey = (k: ApStyleKind) => (k === 'background' ? 'backgroundVariant' : k === 'pose' ? 'poseVariant' : 'hairVariant');

const showAll = ref(false);
const thumbs = computed(() => apState.value?.thumbs || {});
const list = computed(() => optionsOf(kind.value, showAll.value ? null : props.audience).filter((o) => !props.disabledIds?.includes(o.id)));
const groups = computed(() => [...new Set(list.value.map((o) => o.group))]);
const inGroup = (g: string) => list.value.filter((o) => o.group === g);
const current = computed(() => optionById(model.value[idKey(kind.value)]));

function pick(id: string): void {
  const next = { ...props.modelValue } as Record<string, string | undefined>;
  next[idKey(kind.value)] = id;
  delete next[variantKey(kind.value)];
  emit('update:modelValue', next as unknown as ApStyleChoice);
}
function pickVariant(id: string): void {
  const next = { ...props.modelValue } as Record<string, string | undefined>;
  next[variantKey(kind.value)] = next[variantKey(kind.value)] === id ? undefined : id;
  emit('update:modelValue', next as unknown as ApStyleChoice);
}
</script>

<style scoped>
.ap-picker { display: grid; gap: 10px; }
.ap-picker__kinds { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
.ap-picker__kinds button { display: grid; grid-template-columns: auto 1fr; grid-template-rows: auto auto; column-gap: 8px; align-items: center; text-align: start; padding: 8px 12px; border: 1px solid var(--color-border); border-radius: 10px; background: var(--color-bg-primary); color: var(--color-text-primary); cursor: pointer; font: inherit; }
.ap-picker__kinds button i { grid-row: span 2; font-size: 20px; color: var(--color-text-secondary); }
.ap-picker__kinds button span { font-size: 12.5px; font-weight: 700; }
.ap-picker__kinds button em { font-style: normal; font-size: 11.5px; color: var(--color-text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ap-picker__kinds button.on { border-color: var(--color-brand); background: color-mix(in srgb, var(--color-brand) 8%, var(--color-bg-primary)); }
.ap-picker__kinds button.on i { color: var(--color-brand); }
.ap-picker__groups { display: grid; gap: 8px; max-height: 260px; overflow-y: auto; padding-inline-end: 4px; }
.ap-picker__group small, .ap-picker__variants small { display: block; font-size: 11.5px; font-weight: 700; color: var(--color-text-secondary); margin-bottom: 4px; }
.ap-picker__chips { display: flex; flex-wrap: wrap; gap: 6px; }
.ap-chip { border: 1px solid var(--color-border); background: var(--color-bg-card); color: var(--color-text-primary); border-radius: 999px; padding: 4px 11px; font: inherit; font-size: 12.5px; cursor: pointer; }
.ap-chip:hover { border-color: var(--color-brand); }
.ap-chip img { width: 22px; height: 22px; object-fit: cover; border-radius: 50%; vertical-align: middle; margin-inline-end: 4px; }
.ap-picker__all { justify-self: start; }
.ap-chip.on { background: var(--color-brand); border-color: var(--color-brand); color: #fff; font-weight: 700; }
.ap-chip.sub { background: var(--color-bg-primary); font-size: 12px; }
.ap-chip.sub.on { background: color-mix(in srgb, var(--color-brand) 14%, transparent); color: var(--color-brand); }
.ap-picker__variants { padding: 10px 12px; border-radius: 10px; background: var(--color-bg-hover); }
</style>
