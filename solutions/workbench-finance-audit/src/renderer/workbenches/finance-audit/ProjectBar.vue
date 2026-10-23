<template>
  <span class="fau-row">
    <small class="ss-muted">{{ $t('项目') }}</small>
    <select :value="project?.id || ''" data-test="fau-project-select" @change="switchTo(($event.target as HTMLSelectElement).value)">
      <option v-if="!projects.length" value="">{{ $t('还没有项目') }}</option>
      <option v-for="p in projects" :key="p.id" :value="p.id">{{ p.name }}{{ p.status === 'archived' ? ` · ${$t('已归档')}` : '' }}</option>
    </select>
    <button type="button" class="ss-btn sm" data-test="fau-project-new" @click="creating = !creating"><i class="ri-add-line"></i>{{ $t('新建项目') }}</button>
    <button v-if="project" type="button" class="ss-btn sm ghost" data-test="fau-project-detail" @click="openDetail"><i class="ri-information-line"></i>{{ $t('项目详情') }}</button>
  </span>

  <div v-if="creating" class="fau-panel fau-newproj" data-test="fau-project-form">
    <h3>{{ $t('新建项目') }}</h3>
    <div class="ss-grid">
      <label class="ss-field"><span>{{ $t('类型') }}</span>
        <select v-model="form.type">
          <option v-for="(label, k) in TYPE_LABEL" :key="k" :value="k">{{ $t(label) }}</option>
        </select>
      </label>
      <label class="ss-field"><span>{{ form.type === 'month_close' ? $t('期间（YYYY-MM）') : $t('期间（YYYY 或 YYYY-MM）') }}</span><input v-model.trim="form.period" dir="ltr" data-test="fau-project-period" /></label>
      <label class="ss-field"><span>{{ $t('名称（可不填）') }}</span><input v-model.trim="form.name" /></label>
      <label class="ss-field"><span>{{ $t('上一期项目（可选）') }}</span>
        <select v-model="form.prevProjectId">
          <option value="">{{ $t('无') }}</option>
          <option v-for="p in projects" :key="p.id" :value="p.id">{{ p.name }}</option>
        </select>
      </label>
    </div>
    <p class="ss-muted">{{ $t('关联上一期后，上期期末余额与未达账项会带入本期比对（如连续 3 个月同方向未达）。') }}</p>
    <div class="ss-actions">
      <button type="button" class="ss-btn primary" :disabled="busy" data-test="fau-project-create" @click="create"><i class="ri-check-line"></i>{{ $t('创建') }}</button>
      <button type="button" class="ss-btn ghost" @click="creating = false">{{ $t('取消') }}</button>
    </div>
    <p v-if="error" class="ss-note danger"><i class="ri-error-warning-line"></i>{{ error }}</p>
  </div>

  <div v-if="detail" class="fau-drawer-mask" @click="detail = null"></div>
  <aside v-if="detail" class="fau-drawer" role="dialog" :aria-label="$t('项目详情')" data-test="fau-project-drawer">
    <header>
      <h3>{{ detail.project.name }}</h3>
      <button type="button" class="ss-btn ghost sm" @click="detail = null"><i class="ri-close-line"></i></button>
    </header>
    <div class="fau-drawer__body">
      <dl class="fau-kv">
        <dt>{{ $t('类型') }}</dt><dd>{{ $t(TYPE_LABEL[detail.project.type]) }}</dd>
        <dt>{{ $t('期间') }}</dt><dd><FauNum :value="detail.project.period" /></dd>
        <dt>{{ $t('状态') }}</dt><dd>{{ $t(STATUS_LABEL[detail.project.status]) }}</dd>
        <dt>{{ $t('上一期项目') }}</dt><dd>{{ detail.prev?.name || $t('无') }}</dd>
        <dt>{{ $t('签核') }}</dt><dd>{{ $t('待签 {a} · 已归档 {b} · 被退回 {c}', { a: detail.signoff.pending, b: detail.signoff.signed, c: detail.signoff.returned }) }}</dd>
      </dl>
      <h4>{{ $t('运行记录') }}</h4>
      <ul class="fau-list">
        <li v-for="r in detail.runs" :key="r.id" @click="emit('open-run', r.moduleId, r.id)">
          <span class="grow">{{ moduleLabel(r.moduleId) }} · {{ $t(RUN_STATUS[r.status] || r.status) }}</span>
          <small class="ss-muted"><FauNum :value="fmtTime(r.updatedAt)" /></small>
        </li>
        <li v-if="!detail.runs.length" class="ss-muted">{{ $t('还没有运行') }}</li>
      </ul>
      <h4>{{ $t('数据集') }}</h4>
      <ul class="fau-list">
        <li v-for="d in detail.datasets" :key="d.id"><span class="grow">{{ d.label }}</span><small class="ss-muted">{{ $t('{n} 行', { n: d.rowCount }) }}</small></li>
        <li v-if="!detail.datasets.length" class="ss-muted">{{ $t('还没有导入数据') }}</li>
      </ul>
      <div class="ss-actions">
        <button type="button" class="ss-btn" :disabled="busy" data-test="fau-project-export-md" @click="exportMd"><i class="ri-markdown-line"></i>{{ $t('导出项目上下文（project.md）') }}</button>
        <button type="button" class="ss-btn danger" :disabled="busy || detail.project.status === 'archived'" data-test="fau-project-archive" @click="archive"><i class="ri-archive-line"></i>{{ $t('归档项目（只读）') }}</button>
      </div>
      <p v-if="exported" class="ss-note ok" data-test="fau-project-md"><i class="ri-check-line"></i>{{ $t('已导出：{p0}', { p0: exported }) }} <button type="button" class="ss-link" @click="reveal">{{ $t('在文件夹中显示') }}</button></p>
      <p v-if="error" class="ss-note danger"><i class="ri-error-warning-line"></i>{{ error }}</p>
    </div>
  </aside>
</template>

<script setup lang="ts">
/** 项目空间（P2）：下拉切换、新建（类型 + 期间 + 上一期）、详情抽屉、归档（全部签核或作废后才能归档） */
import { ref } from 'vue';
import type { FauProject, FauProjectStatus, FauProjectType } from '@totalclaw/ipc-contracts';
import { moduleById } from '../../../shared/financeAudit/catalog';
import { i18nKey, t as i18nT } from '../../i18n';
import FauNum from './FauNum.vue';
import { errorMessage, fau, fmtTime, lastMonth } from './shared';

const props = defineProps<{ projects: FauProject[]; project: FauProject | null; openDetailOnMount?: boolean }>();
const emit = defineEmits<{ (e: 'changed'): void; (e: 'open-run', moduleId: string, runId: string): void }>();

const TYPE_LABEL: Record<FauProjectType, string> = {
  month_close: i18nKey('月结'), annual_audit: i18nKey('年审'), filing: i18nKey('申报'), controls: i18nKey('内控'), ma: i18nKey('并购'), custom: i18nKey('自定义'),
};
const STATUS_LABEL: Record<string, string> = { open: i18nKey('进行中'), closed: i18nKey('已关闭'), archived: i18nKey('已归档') };
const RUN_STATUS: Record<string, string> = {
  draft: i18nKey('草稿'), running: i18nKey('进行中'), ready: i18nKey('待签核'), signing: i18nKey('签核中'), returned: i18nKey('被退回'), archived: i18nKey('已归档'), void: i18nKey('已作废'),
};
const creating = ref(false);
const busy = ref(false);
const error = ref('');
const detail = ref<FauProjectStatus | null>(null);
const exported = ref('');
const form = ref({ type: 'month_close' as FauProjectType, period: lastMonth(), name: '', prevProjectId: props.project?.id || '' });

function moduleLabel(id: string): string {
  const m = moduleById(id);
  return m ? `${m.code} ${i18nT(m.name)}` : id;
}
async function switchTo(id: string): Promise<void> {
  if (!id) return;
  try { await fau('project.switch', { id }); emit('changed'); } catch (e) { error.value = errorMessage(e); }
}
async function create(): Promise<void> {
  busy.value = true; error.value = '';
  try {
    await fau('project.create', { ...form.value, prevProjectId: form.value.prevProjectId || undefined });
    creating.value = false;
    emit('changed');
  } catch (e) { error.value = errorMessage(e); } finally { busy.value = false; }
}
async function openDetail(): Promise<void> {
  error.value = '';
  try { detail.value = await fau<FauProjectStatus>('project.status', { id: props.project?.id }); } catch (e) { error.value = errorMessage(e); }
}
async function archive(): Promise<void> {
  if (!detail.value) return;
  busy.value = true; error.value = '';
  try { await fau('project.archive', { id: detail.value.project.id }); await openDetail(); emit('changed'); } catch (e) { error.value = errorMessage(e); } finally { busy.value = false; }
}
/** 项目上下文 project.md：给人看，也给对话里的财会技能读（技能约定「没有公司档案时读 project.md」） */
async function exportMd(): Promise<void> {
  if (!detail.value) return;
  busy.value = true; error.value = '';
  try { exported.value = (await fau<{ path: string }>('project.exportMd', { id: detail.value.project.id })).path; } catch (e) { error.value = errorMessage(e); } finally { busy.value = false; }
}
async function reveal(): Promise<void> {
  try { await fau('artifact.reveal', { path: exported.value }); } catch (e) { error.value = errorMessage(e); }
}
defineExpose({ openDetail, openCreate: () => { creating.value = true; } });
if (props.openDetailOnMount) void openDetail();
</script>

<style scoped>
.fau-newproj { flex-basis: 100%; }
h4 { margin: 4px 0 0; font-size: var(--font-size-md); }
</style>
