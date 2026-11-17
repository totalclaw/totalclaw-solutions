<template>
  <div class="mm-tt">
    <div class="mm-tt__head" aria-hidden="true">
      <span>{{ $t('任务') }}</span>
      <span>{{ $t('部门负责人') }}</span>
      <span>{{ $t('截止') }}</span>
      <span>{{ $t('进度') }}</span>
      <span>{{ $t('状态') }}</span>
    </div>
    <p v-if="!groups.length" class="mm-tt__empty">{{ emptyText || $t('没有任务') }}</p>
    <template v-for="g in groups" :key="g.key">
      <div class="mm-tt__group">
        <span>{{ g.title }} · {{ g.tasks.length }}</span>
        <button v-if="g.collapsedByDefault || collapsed[g.key]" type="button" class="mm-tt__fold" :data-test="`mm-tt-fold-${g.key}`" @click="toggle(g)">
          {{ isCollapsed(g) ? $t('展开') : $t('收起') }}<i :class="isCollapsed(g) ? 'ri-arrow-down-s-line' : 'ri-arrow-up-s-line'" aria-hidden="true"></i>
        </button>
      </div>
      <template v-if="!isCollapsed(g)">
        <button
          v-for="t in g.tasks"
          :key="t.id"
          type="button"
          class="mm-tt__row"
          :class="{ on: t.id === selectedId, ended: t.status === 'done' || t.status === 'cancelled' }"
          :data-test="`mm-task-row-${t.id}`"
          @click="emit('select', t)"
        >
          <span class="mm-tt__title">
            <strong>{{ t.title }}</strong>
            <small>{{ showProject ? `${t.projectName} · ${t.meetingTitle}` : t.meetingTitle }}</small>
          </span>
          <span><PersonChip :name="t.assigneeName" :dept="t.deptName" /></span>
          <span class="mm-tt__due" :class="{ bad: t.overdue }">
            {{ fmtDue(t.due) }}
            <small v-if="t.overdue && t.overdueDays > 0">{{ $t('逾期 {n} 天', { n: t.overdueDays }) }}</small>
          </span>
          <span class="mm-tt__prog">
            <i class="mm-bar" :class="{ bad: t.overdue }"><b :style="{ width: `${pct(t.percent)}%` }"></b></i>
            <em>{{ pct(t.percent) }}%</em>
          </span>
          <span><span class="mm-tag" :class="taskTone(t)">{{ taskShortStatus(t) }}</span></span>
        </button>
      </template>
    </template>
  </div>
</template>

<script setup lang="ts">
/** 任务表（原型 03：任务 / 部门负责人 / 截止 / 进度 / 状态，分组行可收起；已完成默认收起） */
import { computed, reactive } from 'vue';
import type { MmTaskView } from '../../../shared/meetingMgmt/types';
import PersonChip from './PersonChip.vue';
import { fmtDue } from './shared';
import { groupTasks, pct, taskShortStatus, taskTone, type TaskGroup, type TaskGroupBy } from './pagesLogic';

const props = withDefaults(defineProps<{
  tasks: MmTaskView[];
  groupBy?: TaskGroupBy;
  selectedId?: string;
  /** 来源列带上项目名（跨项目列表） */
  showProject?: boolean;
  emptyText?: string;
}>(), { groupBy: 'status', selectedId: '', showProject: false, emptyText: '' });

const emit = defineEmits<{ (e: 'select', t: MmTaskView): void }>();

const groups = computed(() => groupTasks(props.tasks, props.groupBy));
/** 用户手动切换过的分组：true = 收起 */
const collapsed = reactive<Record<string, boolean>>({});
const isCollapsed = (g: TaskGroup) => (g.key in collapsed ? collapsed[g.key] : g.collapsedByDefault)
  // 选中的任务在收起的组里（从首页点进来）就展开
  && !(props.selectedId && g.tasks.some((t) => t.id === props.selectedId) && !(g.key in collapsed));
function toggle(g: TaskGroup): void {
  collapsed[g.key] = !isCollapsed(g);
}
</script>

<style scoped>
.mm-tt { display: grid; font-size: 13px; }
.mm-tt__head, .mm-tt__row { display: grid; grid-template-columns: minmax(180px, 2.2fr) minmax(130px, 1.3fr) 92px minmax(120px, 1.1fr) 104px; align-items: center; gap: 12px; padding: 0 16px; }
.mm-tt__head { height: 40px; color: var(--color-text-secondary); font-size: 12.5px; background: var(--color-bg-hover); border-radius: var(--radius-3) var(--radius-3) 0 0; }
.mm-tt__group { display: flex; align-items: center; gap: 12px; height: 40px; padding: 0 16px; font-weight: 700; color: var(--color-text-secondary); background: color-mix(in srgb, var(--color-bg-hover) 60%, transparent); border-bottom: 1px solid var(--color-border-subtle); font-size: 12.5px; }
.mm-tt__fold { border: none; background: none; color: var(--color-brand); cursor: pointer; font: inherit; font-weight: 600; display: inline-flex; align-items: center; gap: 2px; padding: 0; }
.mm-tt__row { min-height: 62px; padding-block: 8px; border: none; border-bottom: 1px solid var(--color-border-subtle); background: var(--color-bg-card); text-align: left; cursor: pointer; font: inherit; color: var(--color-text-primary); width: 100%; transition: background-color .12s; }
.mm-tt__row:hover { background: var(--color-bg-hover); }
.mm-tt__row.on { background: var(--color-brand-subtle); }
.mm-tt__row.ended { color: var(--color-text-secondary); }
.mm-tt__row:focus-visible { outline: 2px solid var(--color-brand); outline-offset: -2px; }
.mm-tt__title { display: grid; gap: 3px; min-width: 0; }
.mm-tt__title strong { font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.mm-tt__title small { color: var(--color-text-secondary); font-size: 12px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.mm-tt__due { display: grid; gap: 2px; font-variant-numeric: tabular-nums; }
.mm-tt__due.bad { color: var(--color-danger); }
.mm-tt__due small { font-size: 12px; font-weight: 600; }
.mm-tt__prog { display: flex; align-items: center; gap: 10px; }
.mm-tt__prog em { font-style: normal; color: var(--color-text-secondary); font-size: 12.5px; font-variant-numeric: tabular-nums; min-width: 34px; }
.mm-bar { flex: 1; max-width: 96px; height: 6px; border-radius: 3px; background: var(--color-bg-hover); overflow: hidden; display: block; }
.mm-bar b { display: block; height: 100%; border-radius: 3px; background: var(--color-brand); }
.mm-bar.bad b { background: var(--color-danger); }
.mm-tag { display: inline-flex; align-items: center; padding: 2px 9px; border-radius: var(--radius-2); font-size: 12px; font-weight: 700; white-space: nowrap; background: var(--color-bg-hover); color: var(--color-text-secondary); }
.mm-tag.bad { background: color-mix(in srgb, var(--color-danger) 12%, transparent); color: var(--color-danger); }
.mm-tag.warn { background: color-mix(in srgb, var(--color-warning) 16%, transparent); color: var(--color-warning); }
.mm-tag.brand { background: color-mix(in srgb, var(--color-brand) 12%, transparent); color: var(--color-brand); }
.mm-tag.ok { background: color-mix(in srgb, var(--color-success) 14%, transparent); color: var(--color-success); }
.mm-tag.muted { opacity: .75; }
.mm-tt__empty { margin: 0; padding: 28px 16px; text-align: center; color: var(--color-text-secondary); font-size: 12.5px; }
</style>
