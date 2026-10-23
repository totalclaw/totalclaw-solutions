<!--
  文件改动 diff 展示 —— 仓库原先只把 tool_input 当 JSON 显示（ChatBubble.vue），没有真正的 diff。
  本组件按「没有就补」新建：从 agent 文件工具（write_file / patch）的 tool_input 渲染改动：
  - write_file：整文件内容按新增行展示（新建/覆盖）
  - patch(replace)：old_string(-) → new_string(+) 逐行对照
  - patch(V4A diff)：直接渲染 patch 文本（按 +/- 着色）
  一次一个文件改动。多文件由父级列表渲染多个本组件。
-->
<template>
  <div class="fdv">
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
.fdv { border: 1px solid var(--border-color, var(--rwfdv-line)); border-radius: var(--radius-3); overflow: hidden; background: var(--panel-bg, var(--rwfdv-surface)); }
.fdv-head { display: flex; align-items: center; gap: 8px; padding: 6px 10px; cursor: pointer; background: var(--subtle-bg, var(--rwfdv-bg)); font-size: var(--font-size-sm); }
.fdv-caret { color: var(--text-tertiary, var(--rwfdv-muted)); width: 10px; flex-shrink: 0; }
.fdv-action { font-weight: 600; padding: 0 6px; border-radius: var(--radius-1); flex-shrink: 0; }
.fdv-action.write { color: var(--rwfdv-ok); background: var(--rwfdv-ok-bg); }
.fdv-action.patch { color: var(--rwfdv-warn); background: var(--rwfdv-warn-bg); }
.fdv-action.read { color: var(--rwfdv-info); background: var(--rwfdv-info-bg); }
.fdv-path { flex: 1; min-width: 0; font-family: ui-monospace, Menlo, monospace; color: var(--text-primary, var(--rwfdv-text)); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.fdv-stat { flex-shrink: 0; font-family: ui-monospace, monospace; }
.fdv-stat .add { color: var(--rwfdv-ok); } .fdv-stat .del { color: var(--rwfdv-danger); }
.fdv-open { flex-shrink: 0; border: none; background: transparent; cursor: pointer; color: var(--text-secondary, var(--rwfdv-text-2)); font-size: var(--font-size-md); }
.fdv-body { max-height: 320px; overflow: auto; background: var(--code-bg, var(--rwfdv-bg-2)); font-family: ui-monospace, Menlo, monospace; font-size: var(--font-size-sm); line-height: 1.5; }
.fdv-line { display: flex; }
.fdv-line.add { background: var(--rwfdv-ok-a9); }
.fdv-line.del { background: var(--rwfdv-danger-a9); }
.fdv-gutter { width: 18px; flex-shrink: 0; text-align: center; color: var(--text-tertiary, var(--rwfdv-muted)); user-select: none; }
.fdv-txt { white-space: pre-wrap; word-break: break-all; padding-right: 8px; }
.fdv-line.add .fdv-gutter { color: var(--rwfdv-ok); } .fdv-line.del .fdv-gutter { color: var(--rwfdv-danger); }
.fdv-empty { padding: 8px 10px; font-size: var(--font-size-sm); color: var(--text-tertiary, var(--rwfdv-muted)); }

/* ─── 调色板（docs/ui-design-system.md）：经典主题保持原值；界面主题（data-ui-theme）下映射全局 token ─── */
.fdv { /* ui-theme-exempt: 经典主题原值 */
  --rwfdv-line: #e3e6ea;
  --rwfdv-surface: #fff;
  --rwfdv-bg: #f7f8fa;
  --rwfdv-muted: #99a;
  --rwfdv-ok: #0a7d33;
  --rwfdv-ok-bg: #e5f7ec;
  --rwfdv-warn: #8a6100;
  --rwfdv-warn-bg: #fdf1d6;
  --rwfdv-info: #3a6ea5;
  --rwfdv-info-bg: #eaf2fb;
  --rwfdv-text: #232a36;
  --rwfdv-danger: #c0392b;
  --rwfdv-text-2: #667;
  --rwfdv-bg-2: #fbfcfd;
  --rwfdv-ok-a9: rgba(10, 125, 51, 0.09);
  --rwfdv-danger-a9: rgba(192, 57, 43, 0.09);
}
:root[data-ui-theme] .fdv {
  --rwfdv-line: var(--color-border);
  --rwfdv-surface: var(--color-bg-card);
  --rwfdv-bg: var(--color-bg-primary);
  --rwfdv-muted: var(--color-text-muted);
  --rwfdv-ok: var(--color-success);
  --rwfdv-ok-bg: var(--color-status-success-bg);
  --rwfdv-warn: var(--color-warning);
  --rwfdv-warn-bg: var(--color-status-warning-bg);
  --rwfdv-info: var(--color-info);
  --rwfdv-info-bg: var(--color-status-info-bg);
  --rwfdv-text: var(--color-text-primary);
  --rwfdv-danger: var(--color-danger);
  --rwfdv-text-2: var(--color-text-secondary);
  --rwfdv-bg-2: var(--color-bg-primary);
  --rwfdv-ok-a9: color-mix(in srgb, var(--color-success) 9%, transparent);
  --rwfdv-danger-a9: color-mix(in srgb, var(--color-danger) 9%, transparent);
}
</style>
