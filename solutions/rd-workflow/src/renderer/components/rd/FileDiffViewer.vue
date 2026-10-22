<!--
  文件改动 diff 展示 —— 仓库原先只把 tool_input 当 JSON 显示（ChatBubble.vue），没有真正的 diff。
  本组件按「没有就补」新建：从 agent 文件工具（write_file / patch）的 tool_input 渲染改动：
  - write_file：整文件内容按新增行展示（新建/覆盖）
  - patch(replace)：old_string(-) → new_string(+) 逐行对照
  - patch(V4A diff)：直接渲染 patch 文本（按 +/- 着色）
  一次一个文件改动。多文件由父级列表渲染多个本组件。
-->
<template>
  <!-- 代码 diff 始终左到右（界面整体随语言 RTL 时也一样） -->
  <div class="fdv" dir="ltr">
    <div class="fdv-head" @click="collapsed = !collapsed">
      <span class="fdv-caret">{{ collapsed ? '▸' : '▾' }}</span>
      <span class="fdv-action" :class="action">{{ actionLabel }}</span>
      <span class="fdv-path" :title="change.path">{{ change.path }}</span>
      <span class="fdv-stat"><span class="add">+{{ addCount }}</span> <span class="del">-{{ delCount }}</span></span>
      <button v-if="change.path" class="fdv-open" :title="$t('打开文件')" @click.stop="$emit('open', change.path)">↗</button>
    </div>
    <div v-if="!collapsed" class="fdv-body">
      <div v-for="(ln, i) in lines" :key="i" class="fdv-line" :class="ln.t">
        <span class="fdv-gutter">{{ ln.t === 'add' ? '+' : ln.t === 'del' ? '-' : ' ' }}</span>
        <span class="fdv-txt">{{ ln.text }}</span>
      </div>
      <div v-if="!lines.length" class="fdv-empty">{{ $t('（无文本改动内容）') }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { t as i18nT } from '../../i18n';

/** 一次文件改动（父级从 STREAM_TOOL_USE 的 toolName/toolInput 归一化而来） */
export interface RdFileChange {
  path: string;
  /** write=整文件写入(新建/覆盖) | patch=局部替换/diff | read=只读(不展示 diff) */
  action: 'write' | 'patch' | 'read';
  content?: string;      // write_file
  oldString?: string;    // patch replace
  newString?: string;    // patch replace
  patchText?: string;    // patch V4A diff
}

const props = defineProps<{ change: RdFileChange }>();
defineEmits<{ (e: 'open', path: string): void }>();

const collapsed = ref(false);

const action = computed(() => props.change.action);
const actionLabel = computed(() => ({ write: i18nT('写入'), patch: i18nT('修改'), read: i18nT('读取') } as Record<string, string>)[props.change.action] || props.change.action);

type Line = { t: 'add' | 'del' | 'ctx'; text: string };
const lines = computed<Line[]>(() => {
  const c = props.change;
  const out: Line[] = [];
  const split = (s: string) => (s || '').replace(/\n$/, '').split('\n');
  if (c.action === 'write' && c.content != null) {
    for (const t of split(c.content)) out.push({ t: 'add', text: t });
  } else if (c.action === 'patch') {
    if (c.patchText) {
      // V4A / 统一 diff 文本：按行首 +/- 着色
      for (const t of split(c.patchText)) {
        out.push({ t: t.startsWith('+') ? 'add' : t.startsWith('-') ? 'del' : 'ctx', text: t });
      }
    } else {
      for (const t of split(c.oldString || '')) out.push({ t: 'del', text: t });
      for (const t of split(c.newString || '')) out.push({ t: 'add', text: t });
    }
  }
  return out.slice(0, 400); // 超长截断，防卡渲染
});

const addCount = computed(() => lines.value.filter((l) => l.t === 'add').length);
const delCount = computed(() => lines.value.filter((l) => l.t === 'del').length);
</script>

<style scoped>
.fdv { border: 1px solid var(--border-color, #e3e6ea); border-radius: 8px; overflow: hidden; background: var(--panel-bg, #fff); }
.fdv-head { display: flex; align-items: center; gap: 8px; padding: 6px 10px; cursor: pointer; background: var(--subtle-bg, #f7f8fa); font-size: 12px; }
.fdv-caret { color: var(--text-tertiary, #99a); width: 10px; flex-shrink: 0; }
.fdv-action { font-weight: 600; padding: 0 6px; border-radius: 4px; flex-shrink: 0; }
.fdv-action.write { color: #0a7d33; background: #e5f7ec; }
.fdv-action.patch { color: #8a6100; background: #fdf1d6; }
.fdv-action.read { color: #3a6ea5; background: #eaf2fb; }
.fdv-path { flex: 1; min-width: 0; font-family: ui-monospace, Menlo, monospace; color: var(--text-primary, #232a36); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.fdv-stat { flex-shrink: 0; font-family: ui-monospace, monospace; }
.fdv-stat .add { color: #0a7d33; } .fdv-stat .del { color: #c0392b; }
.fdv-open { flex-shrink: 0; border: none; background: transparent; cursor: pointer; color: var(--text-secondary, #667); font-size: 13px; }
.fdv-body { max-height: 320px; overflow: auto; background: var(--code-bg, #fbfcfd); font-family: ui-monospace, Menlo, monospace; font-size: 12px; line-height: 1.5; }
.fdv-line { display: flex; }
.fdv-line.add { background: rgba(10, 125, 51, 0.09); }
.fdv-line.del { background: rgba(192, 57, 43, 0.09); }
.fdv-gutter { width: 18px; flex-shrink: 0; text-align: center; color: var(--text-tertiary, #99a); user-select: none; }
.fdv-txt { white-space: pre-wrap; word-break: break-all; padding-right: 8px; }
.fdv-line.add .fdv-gutter { color: #0a7d33; } .fdv-line.del .fdv-gutter { color: #c0392b; }
.fdv-empty { padding: 8px 10px; font-size: 12px; color: var(--text-tertiary, #99a); }
</style>
