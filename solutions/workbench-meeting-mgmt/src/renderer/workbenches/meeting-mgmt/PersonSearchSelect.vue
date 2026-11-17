<template>
  <div ref="root" class="mm-pss" :class="{ open, disabled, multi: multiple }" @mousedown="onBoxDown">
    <i class="ri-search-line mm-pss__icon" aria-hidden="true"></i>
    <!-- 多选：已选的人是输入框里的小标签，点 × 去掉 -->
    <template v-if="multiple">
      <span v-for="o in selectedOpts" :key="o.value" class="mm-pss__chip" :data-test="dataTest ? `${dataTest}-chip-${o.value}` : undefined">
        <span class="mm-pss__av" :style="{ background: o.color }">{{ o.initial }}</span>{{ o.label }}
        <button v-if="!disabled" type="button" class="mm-pss__chip-x" :aria-label="$t('移除 {name}', { name: o.label })" :data-test="dataTest ? `${dataTest}-chip-x-${o.value}` : undefined" @mousedown.prevent.stop @click="toggle(o.value)"><i class="ri-close-line"></i></button>
      </span>
    </template>
    <span v-if="!multiple && !open && selected" class="mm-pss__value" :data-test="dataTest ? `${dataTest}-value` : undefined">
      <span class="mm-pss__av" :style="{ background: selected.color }">{{ selected.initial }}</span>
      <span class="mm-pss__name">{{ selected.label }}</span>
      <small v-if="selected.sub">{{ selected.sub }}</small>
    </span>
    <input
      ref="inputEl"
      v-model="q"
      class="mm-pss__input"
      :class="{ ghost: !multiple && !open && !!selected }"
      type="text"
      role="combobox"
      autocomplete="off"
      spellcheck="false"
      :aria-label="ariaLabel || placeholderText"
      :aria-expanded="open"
      aria-autocomplete="list"
      :aria-controls="listId"
      :aria-activedescendant="open && flat[active] ? optId(flat[active]!) : undefined"
      :placeholder="multiple ? (selectedIds.length ? '' : placeholderText) : !open && selected ? '' : placeholderText"
      :disabled="disabled"
      :data-test="dataTest"
      @focus="openList"
      @input="active = 0"
      @keydown="onKey"
      @blur="onBlur"
    />
    <button
      v-if="clearable && selectedIds.length && !disabled"
      type="button"
      class="mm-pss__clear"
      :aria-label="$t('清除')"
      :data-test="dataTest ? `${dataTest}-clear` : undefined"
      @mousedown.prevent.stop
      @click="clearAll"
    ><i class="ri-close-circle-fill"></i></button>
    <i v-else class="ri-arrow-down-s-line mm-pss__caret" aria-hidden="true"></i>

    <Teleport to="body">
      <div
        v-if="open"
        :id="listId"
        ref="popEl"
        class="mm-pss-pop"
        role="listbox"
        :aria-multiselectable="multiple || undefined"
        :style="popStyle"
        :data-test="dataTest ? `${dataTest}-list` : undefined"
        @mousedown.prevent
      >
        <template v-for="g in groups" :key="g.key">
          <div class="mm-pss-pop__group">{{ g.label }}</div>
          <div
            v-for="o in g.options"
            :id="optId(o)"
            :key="o.value"
            role="option"
            :aria-selected="isSel(o.value)"
            class="mm-pss-pop__opt"
            :class="{ active: flat[active]?.value === o.value, sel: isSel(o.value) }"
            :data-test="dataTest ? `${dataTest}-opt-${o.value}` : undefined"
            @mouseenter="active = flat.indexOf(o)"
            @click="choose(o.value)"
          >
            <span class="mm-pss__av" :style="{ background: o.color }">{{ o.initial }}</span>
            <span class="mm-pss-pop__name">{{ o.label }}</span>
            <small v-if="o.sub">{{ o.sub }}</small>
            <em v-if="o.hint">{{ o.hint }}</em>
            <i v-if="isSel(o.value)" class="ri-check-line mm-pss-pop__check" aria-hidden="true"></i>
          </div>
        </template>
        <div v-if="!flat.length" class="mm-pss-pop__empty">{{ loading ? $t('正在加载人员…') : q.trim() ? $t('没有找到「{q}」', { q: q.trim() }) : $t('没有可选的人员') }}</div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
/**
 * 会议智能管理 · 统一的「选人」输入框：打字按姓名 / 拼音（全拼或首字母）/ 部门 / 职务过滤，
 * 列表显示头像色块 + 姓名 + 部门；↑↓ 选、回车确定、Esc 关。v-model 是 personId（extras 里的项是它自己的 value）。
 * 多选（multiple）：用 v-model:values（personId 数组）；已选的人在框里显示成小标签，点选项切换选中、列表不收起，
 * 输入框空着时按退格去掉最后一个。
 *
 * 人员默认取 loadPeople() 的缓存（people.list），也可以由父组件传 people。
 * 下拉层 Teleport 到 body（fixed 定位），不会被卡片 / 弹窗的 overflow 裁掉。
 * 拼音库（pinyin-pro，宿主自带）第一次打开时才按需加载；加载不了就只按汉字匹配。
 */
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { t as i18nT } from '../../i18n';
import { avatarOf } from './shared';
import { loadPeople, type MmPeople } from './meetingUi';

export interface PersonPickExtra { value: string; label: string; sub?: string }

const props = withDefaults(defineProps<{
  /** 单选的值 */
  modelValue?: string;
  /** 多选：选中的 personId 列表（v-model:values） */
  values?: string[];
  multiple?: boolean;
  /** 多选最多几位（到了就只能去掉、不能再加） */
  max?: number;
  /** 人员名单；不传就用 loadPeople() 的缓存 */
  people?: MmPeople | null;
  /** 只列这些人 */
  only?: string[];
  /** 不列这些人 */
  exclude?: string[];
  /** 排在最前面单独一组的人（如本场参会人） */
  pinned?: string[];
  pinnedLabel?: string;
  /** 不是员工的选项（如本场已有的发言人标签），排在最前面 */
  extras?: PersonPickExtra[];
  extrasLabel?: string;
  /** 名单里没有的人（离职 / 名单没拉到）的显示名兜底 */
  names?: Record<string, { name: string; deptName?: string }>;
  /** 选项后面的灰字备注（如「已指认给 S2」） */
  hint?: (id: string) => string;
  placeholder?: string;
  ariaLabel?: string;
  disabled?: boolean;
  clearable?: boolean;
  dataTest?: string;
}>(), { modelValue: '', values: () => [], multiple: false, max: 0, people: null, pinnedLabel: '', extrasLabel: '', placeholder: '', ariaLabel: '', disabled: false, clearable: false, dataTest: '' });

const emit = defineEmits<{
  (e: 'update:modelValue', v: string): void;
  (e: 'change', v: string): void;
  (e: 'update:values', v: string[]): void;
}>();

interface Opt { value: string; label: string; sub: string; hint: string; initial: string; color: string; search: string; deptId: string }

const root = ref<HTMLElement | null>(null);
const inputEl = ref<HTMLInputElement | null>(null);
const popEl = ref<HTMLElement | null>(null);
const open = ref(false);
const q = ref('');
const active = ref(0);
const loaded = ref<MmPeople | null>(null);
const loading = ref(false);
const popStyle = ref<Record<string, string>>({});
const uid = `mm-pss-${Math.random().toString(36).slice(2, 9)}`;
const listId = `${uid}-list`;

const placeholderText = computed(() => props.placeholder || i18nT('搜索姓名、拼音或部门'));
const src = computed<MmPeople>(() => props.people ?? loaded.value ?? { depts: [], people: [] });
const deptName = (id: string) => src.value.depts.find((d) => d.id === id)?.name || '';

// ── 拼音（按需加载） ──
type PinyinFn = (s: string, o: Record<string, unknown>) => string[];
let pinyinFn: PinyinFn | null = null;
const pinyinReady = ref(false);
function ensurePinyin(): void {
  if (pinyinFn || pinyinReady.value) return;
  import('pinyin-pro')
    .then((m) => { pinyinFn = (m as any).pinyin as PinyinFn; pinyinReady.value = true; })
    .catch(() => { /* 拼音库不可用：只按汉字匹配 */ });
}
const pyCache = new Map<string, string>();
function pinyinKeys(name: string): string {
  if (!pinyinFn || !/[㐀-鿿]/.test(name)) return '';
  const hit = pyCache.get(name);
  if (hit !== undefined) return hit;
  let out = '';
  try {
    const arr = pinyinFn(name, { toneType: 'none', type: 'array' }).map((s) => String(s).toLowerCase());
    out = `${arr.join('')} ${arr.map((s) => s[0] || '').join('')}`;
  } catch { out = ''; }
  pyCache.set(name, out);
  return out;
}

function personOpt(id: string, name: string, deptId: string, title: string | undefined, fallbackDept = ''): Opt {
  const dn = deptName(deptId) || fallbackDept;
  const av = avatarOf(name);
  const hint = props.hint?.(id) || '';
  void pinyinReady.value; // 拼音加载好后重算
  return {
    value: id, label: name, sub: [dn, title].filter(Boolean).join(' · '), hint, initial: av.text, color: av.color, deptId,
    search: `${name} ${dn} ${title || ''} ${pinyinKeys(name)}`.toLowerCase(),
  };
}

const allPeople = computed<Opt[]>(() => {
  const only = props.only ? new Set(props.only) : null;
  const ex = new Set(props.exclude ?? []);
  return src.value.people
    .filter((p) => !p.left && (!only || only.has(p.id)) && !ex.has(p.id))
    .map((p) => personOpt(p.id, p.name, p.deptId, p.title));
});

const extraOpts = computed<Opt[]>(() => (props.extras ?? []).map((x) => {
  const av = avatarOf(x.label);
  return { value: x.value, label: x.label, sub: x.sub || '', hint: '', initial: av.text, color: av.color, deptId: '', search: `${x.label} ${x.sub || ''} ${pinyinKeys(x.label)}`.toLowerCase() };
}));

const pinnedOpts = computed<Opt[]>(() => {
  const ex = new Set(props.exclude ?? []);
  return (props.pinned ?? []).filter((id) => !ex.has(id)).map((id) => {
    const p = src.value.people.find((x) => x.id === id);
    if (p) return personOpt(p.id, p.name, p.deptId, p.title);
    const n = props.names?.[id];
    return personOpt(id, n?.name || id, '', undefined, n?.deptName || '');
  });
});

function matches(o: Opt, k: string): boolean {
  if (!k) return true;
  return k.split(/\s+/).filter(Boolean).every((part) => o.search.includes(part));
}

const groups = computed(() => {
  const k = q.value.trim().toLowerCase();
  const out: Array<{ key: string; label: string; options: Opt[] }> = [];
  const ex = extraOpts.value.filter((o) => matches(o, k));
  if (ex.length) out.push({ key: '__extras', label: props.extrasLabel || i18nT('本场发言人'), options: ex });
  const pin = pinnedOpts.value.filter((o) => matches(o, k));
  if (pin.length) out.push({ key: '__pinned', label: props.pinnedLabel || i18nT('本场参会人'), options: pin });
  const pinnedIds = new Set(props.pinned ?? []);
  const rest = allPeople.value.filter((o) => !pinnedIds.has(o.value) && matches(o, k));
  const seen = new Set<string>();
  for (const d of src.value.depts) {
    seen.add(d.id);
    const list = rest.filter((o) => o.deptId === d.id);
    if (list.length) out.push({ key: d.id, label: d.name, options: list });
  }
  const other = rest.filter((o) => !seen.has(o.deptId));
  if (other.length) out.push({ key: '__other', label: i18nT('其他'), options: other });
  return out;
});
const flat = computed(() => groups.value.flatMap((g) => g.options));

const selectedIds = computed<string[]>(() => (props.multiple ? props.values.filter(Boolean) : props.modelValue ? [props.modelValue] : []));
const isSel = (v: string) => selectedIds.value.includes(v);
const selected = computed<Opt | null>(() => (props.multiple ? null : optFor(props.modelValue)));
const selectedOpts = computed<Opt[]>(() => selectedIds.value.map(optFor).filter((o): o is Opt => !!o));

function optFor(v: string): Opt | null {
  if (!v) return null;
  return extraOpts.value.find((o) => o.value === v)
    ?? pinnedOpts.value.find((o) => o.value === v)
    ?? allPeople.value.find((o) => o.value === v)
    ?? (() => {
      const p = src.value.people.find((x) => x.id === v);
      const n = props.names?.[v];
      return p || n ? personOpt(v, p?.name || n!.name, p?.deptId || '', p?.title, n?.deptName || '') : null;
    })();
}

const optId = (o: Opt) => `${uid}-${o.value.replace(/[^A-Za-z0-9_-]/g, '_')}`;

// ── 开关 / 定位 ──
function place(): void {
  const el = root.value;
  if (!el) return;
  const r = el.getBoundingClientRect();
  const vh = window.innerHeight || 800;
  const below = vh - r.bottom - 12;
  const above = r.top - 12;
  const up = below < 220 && above > below;
  const maxH = Math.max(160, Math.min(340, up ? above : below));
  popStyle.value = {
    position: 'fixed', left: `${Math.round(r.left)}px`, width: `${Math.round(Math.max(r.width, 260))}px`, maxHeight: `${Math.round(maxH)}px`,
    ...(up ? { bottom: `${Math.round(vh - r.top + 4)}px` } : { top: `${Math.round(r.bottom + 4)}px` }),
  };
}
function onWin(): void { if (open.value) place(); }

function openList(): void {
  if (props.disabled || open.value) return;
  ensurePinyin();
  if (!props.people && !loaded.value && !loading.value) {
    loading.value = true;
    loadPeople().then((p) => { loaded.value = p; }).catch(() => { /* 拿不到名单：只剩 extras / pinned */ }).finally(() => { loading.value = false; });
  }
  q.value = '';
  open.value = true;
  const i = flat.value.findIndex((o) => isSel(o.value));
  active.value = i >= 0 ? i : 0;
  place();
  window.addEventListener('scroll', onWin, true);
  window.addEventListener('resize', onWin);
  void nextTick(scrollActive);
}
function close(): void {
  if (!open.value) return;
  open.value = false;
  q.value = '';
  window.removeEventListener('scroll', onWin, true);
  window.removeEventListener('resize', onWin);
}
function onBoxDown(ev: MouseEvent): void {
  if (props.disabled) return;
  // 点框里任何地方都聚焦输入框；已经打开时再点一下收起
  if (ev.target !== inputEl.value) ev.preventDefault();
  if (open.value && ev.target !== inputEl.value) { close(); return; }
  inputEl.value?.focus();
  openList();
}
function onBlur(): void { close(); }

/** 多选：切换一个人；列表不收起，方便接着选 */
function toggle(v: string): void {
  if (!v) return;
  const cur = selectedIds.value;
  if (cur.includes(v)) emit('update:values', cur.filter((x) => x !== v));
  else if (!props.max || cur.length < props.max) emit('update:values', [...cur, v]);
  q.value = '';
}
function clearAll(): void {
  if (props.multiple) { emit('update:values', []); return; }
  choose('');
}

function choose(v: string): void {
  if (props.multiple) { toggle(v); return; }
  if (v !== props.modelValue) {
    emit('update:modelValue', v);
    emit('change', v);
  }
  close();
  inputEl.value?.blur();
}

function scrollActive(): void {
  const o = flat.value[active.value];
  if (!o || !popEl.value) return;
  const el = popEl.value.querySelector(`#${CSS.escape(optId(o))}`) as HTMLElement | null;
  el?.scrollIntoView?.({ block: 'nearest' });
}
function onKey(ev: KeyboardEvent): void {
  if (props.multiple && ev.key === 'Backspace' && !q.value && selectedIds.value.length) { toggle(selectedIds.value[selectedIds.value.length - 1]!); return; }
  if (!open.value && (ev.key === 'ArrowDown' || ev.key === 'Enter')) { ev.preventDefault(); openList(); return; }
  if (!open.value) return;
  const n = flat.value.length;
  if (ev.key === 'ArrowDown') { ev.preventDefault(); if (n) active.value = (active.value + 1) % n; void nextTick(scrollActive); }
  else if (ev.key === 'ArrowUp') { ev.preventDefault(); if (n) active.value = (active.value - 1 + n) % n; void nextTick(scrollActive); }
  else if (ev.key === 'Enter') { ev.preventDefault(); const o = flat.value[active.value]; if (o) choose(o.value); }
  else if (ev.key === 'Escape') { ev.preventDefault(); ev.stopPropagation(); close(); }
  else if (ev.key === 'Tab') close();
}

watch(() => flat.value.length, (n) => { if (active.value >= n) active.value = Math.max(0, n - 1); });
watch(() => props.disabled, (d) => { if (d) close(); });

onMounted(() => {
  // 已经选了人时要显示名字：没传 people 就先拉一次名单
  if (!props.people && selectedIds.value.length) {
    loading.value = true;
    loadPeople().then((p) => { loaded.value = p; }).catch(() => { /* */ }).finally(() => { loading.value = false; });
  }
});
onBeforeUnmount(close);
</script>

<style scoped>
.mm-pss {
  position: relative; display: flex; align-items: center; gap: 6px; min-width: 220px; height: 34px; padding: 0 8px 0 10px;
  border: 1px solid var(--color-border); border-radius: var(--radius-3); background: var(--color-bg-input);
  color: var(--color-text-primary); font-size: var(--font-size-md); cursor: text; transition: border-color .15s, box-shadow .15s;
}
.mm-pss:hover { border-color: color-mix(in srgb, var(--color-brand) 45%, var(--color-border)); }
.mm-pss.open, .mm-pss:focus-within { border-color: var(--color-brand); box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-brand) 16%, transparent); }
.mm-pss.disabled { opacity: .6; cursor: not-allowed; }
.mm-pss.multi { height: auto; min-height: 34px; flex-wrap: wrap; padding-top: 3px; padding-bottom: 3px; row-gap: 4px; }
.mm-pss.multi .mm-pss__input { flex: 1 0 80px; height: 26px; }
.mm-pss__chip {
  display: inline-flex; align-items: center; gap: 5px; height: 26px; padding: 0 4px 0 3px; border-radius: var(--radius-pill);
  background: var(--color-brand-subtle, var(--color-bg-hover)); font-size: 12.5px; font-weight: 600; white-space: nowrap;
}
.mm-pss__chip .mm-pss__av { width: 20px; height: 20px; }
.mm-pss__chip-x { border: 0; background: none; padding: 0; width: 18px; height: 18px; border-radius: 50%; cursor: pointer; color: var(--color-text-muted); display: inline-flex; align-items: center; justify-content: center; }
.mm-pss__chip-x:hover { background: color-mix(in srgb, var(--color-text-primary) 10%, transparent); color: var(--color-text-primary); }
.mm-pss__icon { color: var(--color-text-muted); font-size: 15px; flex: none; }
.mm-pss__value { position: absolute; left: 30px; right: 30px; top: 0; bottom: 0; display: flex; align-items: center; gap: 6px; pointer-events: none; min-width: 0; }
.mm-pss__name { font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.mm-pss__value small { color: var(--color-text-secondary); font-size: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.mm-pss__input {
  flex: 1; min-width: 0; height: 100%; border: 0 !important; outline: none; background: transparent !important; padding: 0 !important;
  color: inherit; font: inherit; box-shadow: none !important;
}
.mm-pss__input.ghost { color: transparent; caret-color: transparent; }
.mm-pss__input::placeholder { color: var(--color-text-muted); }
.mm-pss__caret { color: var(--color-text-muted); font-size: 16px; flex: none; }
.mm-pss__clear { border: 0; background: none; padding: 0; cursor: pointer; color: var(--color-text-muted); font-size: 15px; line-height: 1; display: inline-flex; }
.mm-pss__clear:hover { color: var(--color-text-secondary); }
.mm-pss__av {
  width: 20px; height: 20px; border-radius: 50%; flex: none; display: inline-flex; align-items: center; justify-content: center;
  color: var(--color-on-accent, #fff); font-size: 10.5px; font-weight: 700;
}

.mm-pss-pop {
  z-index: 3000; overflow-y: auto; padding: 4px; border-radius: var(--radius-4); border: 1px solid var(--color-border);
  background: var(--color-bg-card, var(--color-bg-elevated)); box-shadow: var(--shadow-lg, 0 12px 32px rgba(0, 0, 0, .16));
  font-size: var(--font-size-md); color: var(--color-text-primary);
}
.mm-pss-pop__group { padding: 8px 10px 4px; font-size: 11.5px; font-weight: 600; color: var(--color-text-muted); letter-spacing: .02em; }
.mm-pss-pop__opt { display: flex; align-items: center; gap: 8px; padding: 7px 10px; border-radius: var(--radius-3); cursor: pointer; min-width: 0; }
.mm-pss-pop__opt.active { background: var(--color-bg-hover); }
.mm-pss-pop__opt.sel .mm-pss-pop__name { color: var(--color-brand); }
.mm-pss-pop__name { font-weight: 600; white-space: nowrap; }
.mm-pss-pop__opt small { color: var(--color-text-secondary); font-size: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; min-width: 0; }
.mm-pss-pop__opt em { margin-left: auto; font-style: normal; font-size: 11.5px; color: var(--color-warning, #d97706); white-space: nowrap; }
.mm-pss-pop__check { margin-left: auto; color: var(--color-brand); }
.mm-pss-pop__opt em + .mm-pss-pop__check { margin-left: 6px; }
.mm-pss-pop__empty { padding: 14px 10px; text-align: center; color: var(--color-text-muted); font-size: 12.5px; }
</style>
