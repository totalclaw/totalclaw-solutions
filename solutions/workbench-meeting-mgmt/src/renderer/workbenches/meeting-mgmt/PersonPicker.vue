<template>
  <div class="mm-pp">
    <div v-if="multiple && selected.length" class="mm-pp__chosen">
      <span v-for="p in selected" :key="p.id" class="mm-pp__chip">
        <i :style="{ background: avatarOf(p.name).color }" aria-hidden="true">{{ avatarOf(p.name).text }}</i>{{ p.name }}
        <button v-if="!locked?.includes(p.id)" type="button" :aria-label="$t('移除 {name}', { name: p.name })" @click="toggle(p.id)"><i class="ri-close-line"></i></button>
        <em v-else>{{ lockedHint || '' }}</em>
      </span>
    </div>
    <div class="mm-pp__search"><i class="ri-search-line" aria-hidden="true"></i><input v-model="q" type="search" :placeholder="$t('搜索姓名、部门')" /></div>
    <ul class="mm-pp__list" :style="{ maxHeight: `${maxHeight}px` }" role="listbox" :aria-multiselectable="multiple">
      <li v-for="g in groups" :key="g.id">
        <p class="mm-pp__dept">{{ g.name }}</p>
        <button
          v-for="p in g.people"
          :key="p.id"
          type="button"
          role="option"
          class="mm-pp__opt"
          :class="{ on: isOn(p.id) }"
          :aria-selected="isOn(p.id)"
          :disabled="locked?.includes(p.id) && isOn(p.id)"
          :data-test="`mm-pp-${p.id}`"
          @click="toggle(p.id)"
        >
          <i :style="{ background: avatarOf(p.name).color }" aria-hidden="true">{{ avatarOf(p.name).text }}</i>
          <span>{{ p.name }}</span><small v-if="p.title">{{ p.title }}</small>
          <b v-if="isOn(p.id)" class="ri-check-line" aria-hidden="true"></b>
        </button>
      </li>
      <li v-if="!groups.length" class="mm-pp__empty">{{ $t('没有匹配的人员') }}</li>
    </ul>
  </div>
</template>

<script setup lang="ts" generic="T extends string | string[]">
/** 选人：按部门分组、可搜索；multiple=false 时单选（v-model 是 id 字符串），否则 v-model 是 id 数组 */
import { computed, ref } from 'vue';
import type { MmDept, MmPerson } from '../../../shared/meetingMgmt/types';
import { avatarOf } from './shared';
import { matchPerson } from './pagesLogic';

const props = withDefaults(defineProps<{
  people: MmPerson[];
  depts: MmDept[];
  modelValue: T;
  multiple?: boolean;
  /** 已选且不能移除的人（如项目负责人） */
  locked?: string[];
  lockedHint?: string;
  maxHeight?: number;
}>(), { multiple: true, maxHeight: 220 });

const emit = defineEmits<{ (e: 'update:modelValue', v: T): void }>();
const q = ref('');

const ids = computed<string[]>(() => {
  const v = props.modelValue as string | string[];
  return Array.isArray(v) ? v : v ? [v] : [];
});
const isOn = (id: string) => ids.value.includes(id);
const deptName = (id: string) => props.depts.find((d) => d.id === id)?.name || '';
const active = computed(() => props.people.filter((p) => !p.left));
const selected = computed(() => ids.value.map((id) => props.people.find((p) => p.id === id)).filter((p): p is MmPerson => !!p));

const groups = computed(() => {
  const out: Array<{ id: string; name: string; people: MmPerson[] }> = [];
  const byDept = new Map<string, MmPerson[]>();
  for (const p of active.value) {
    if (!matchPerson(p, deptName(p.deptId), q.value)) continue;
    const list = byDept.get(p.deptId) ?? [];
    list.push(p);
    byDept.set(p.deptId, list);
  }
  for (const d of props.depts) {
    const list = byDept.get(d.id);
    if (list?.length) out.push({ id: d.id, name: d.name, people: list });
    byDept.delete(d.id);
  }
  for (const [id, list] of byDept) out.push({ id, name: deptName(id) || '—', people: list });
  return out;
});

function toggle(id: string): void {
  if (!props.multiple) {
    emit('update:modelValue', id as T);
    return;
  }
  if (isOn(id)) {
    if (props.locked?.includes(id)) return;
    emit('update:modelValue', ids.value.filter((x) => x !== id) as T);
  } else {
    emit('update:modelValue', [...ids.value, id] as T);
  }
}
</script>

<style scoped>
.mm-pp { display: grid; gap: 8px; }
.mm-pp__chosen { display: flex; flex-wrap: wrap; gap: 6px; }
.mm-pp__chip { display: inline-flex; align-items: center; gap: 5px; padding: 2px 4px 2px 3px; border-radius: var(--radius-pill); background: var(--color-brand-subtle); color: var(--color-text-primary); font-size: 12.5px; }
.mm-pp__chip i, .mm-pp__opt i { width: 18px; height: 18px; border-radius: 50%; display: inline-grid; place-items: center; color: #fff; font-style: normal; font-size: 10px; font-weight: 700; flex: 0 0 18px; }
.mm-pp__chip button { border: none; background: none; cursor: pointer; color: var(--color-text-secondary); padding: 0 2px; display: inline-flex; }
.mm-pp__chip button:hover { color: var(--color-danger); }
.mm-pp__chip em { font-style: normal; font-size: var(--font-size-xs); color: var(--color-text-secondary); padding-inline-end: 4px; }
.mm-pp__search { display: flex; align-items: center; gap: 6px; height: 32px; padding: 0 10px; border: 1px solid var(--color-border); border-radius: var(--radius-3); background: var(--color-bg-input); color: var(--color-text-secondary); }
.mm-pp__search input { flex: 1; border: none; outline: none; background: transparent; font: inherit; font-size: 12.5px; color: var(--color-text-primary); min-width: 0; }
.mm-pp__list { list-style: none; margin: 0; padding: 4px; overflow: auto; border: 1px solid var(--color-border); border-radius: var(--radius-3); background: var(--color-bg-card); }
.mm-pp__dept { margin: 6px 6px 2px; font-size: var(--font-size-xs); color: var(--color-text-secondary); font-weight: 700; }
.mm-pp__opt { display: flex; align-items: center; gap: 8px; width: 100%; padding: 5px 8px; border: none; background: none; border-radius: var(--radius-2); cursor: pointer; font: inherit; font-size: 12.5px; color: var(--color-text-primary); text-align: left; }
.mm-pp__opt:hover:not(:disabled) { background: var(--color-bg-hover); }
.mm-pp__opt.on { background: var(--color-brand-subtle); }
.mm-pp__opt:disabled { cursor: default; }
.mm-pp__opt small { color: var(--color-text-secondary); font-size: var(--font-size-xs); }
.mm-pp__opt b { margin-inline-start: auto; color: var(--color-brand); font-weight: 400; }
.mm-pp__empty { padding: 10px; text-align: center; color: var(--color-text-secondary); font-size: 12.5px; }
</style>
