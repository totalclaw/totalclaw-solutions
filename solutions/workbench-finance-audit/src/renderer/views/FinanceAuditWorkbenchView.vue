<template>
  <div class="fau-page" data-test="fau-workbench">
    <header class="fau-head">
      <PageBackButton />
      <span class="heading-icon"><i class="ri-scales-3-line"></i></span>
      <div class="grow">
        <h1>{{ $t('财会审计解决方案') }}</h1>
        <p class="fau-sub">{{ $t('月结关账、对账、审计与内控、税务合规、管理报告、资金风险与投融资估值，48 个模块分步出底稿，人工签核后归档；中英阿三语，适配中国、国际、沙特与阿联酋准则税制。') }}</p>
      </div>
      <button v-if="moduleId" type="button" class="ss-btn" data-test="fau-home" @click="router.push('/workbenches/finance-audit')"><i class="ri-home-4-line"></i>{{ $t('工作台首页') }}</button>
      <button type="button" class="ss-btn" :disabled="loading" @click="reload"><i :class="loading ? 'ri-loader-4-line spin' : 'ri-refresh-line'"></i>{{ $t('刷新') }}</button>
    </header>

    <p v-if="loadError" class="ss-note danger"><i class="ri-error-warning-line"></i>{{ loadError }}</p>
    <p v-else-if="!home" class="ss-note"><i class="ri-loader-4-line spin"></i>{{ $t('正在加载工作台…') }}</p>

    <template v-else>
      <SetupWizard
        v-if="!home.company || editingSetup" :key="editingSetup ? `edit:${setupStart}` : 'new'" :company="editingSetup === 'edit' ? home.company : null" :start-at="setupStart"
        @saved="onSaved" @cancel="editingSetup = false; setupStart = ''" @sample="openSample"
      />
      <template v-else>
        <!-- 顶部条 -->
        <section class="fau-bar" data-test="fau-topbar">
          <span class="fau-row">
            <small class="ss-muted">{{ $t('公司') }}</small>
            <select :value="home.company.id" data-test="fau-company-select" @change="switchCompany(($event.target as HTMLSelectElement).value)">
              <option v-for="c in home.companies" :key="c.id" :value="c.id">{{ c.name }}</option>
              <option value="__new">{{ $t('+ 新建公司档案') }}</option>
            </select>
          </span>
          <ProjectBar ref="projectBar" :projects="home.projects" :project="home.project" @changed="reload" @open-run="(m, r) => router.push({ path: `/workbenches/finance-audit/m/${m}`, query: { run: r } })" />
          <span class="fau-badge" data-test="fau-region-badge">{{ $t(regionName) }} · {{ $t(STANDARD_LABELS[home.company.standard] || home.company.standard) }}</span>
          <OutputLocalePicker :model-value="home.company.outputLocale" @update:model-value="setOutputLocale" />
          <span class="fau-row">
            <small class="ss-muted">{{ $t('套餐') }}</small>
            <select :value="home.settings.bundle" data-test="fau-bundle" @change="setBundle(($event.target as HTMLSelectElement).value)">
              <option v-for="(label, k) in BUNDLE_LABELS" :key="k" :value="k">{{ $t(label) }}</option>
            </select>
          </span>
          <button type="button" class="ss-btn sm ghost" @click="editingSetup = 'edit'"><i class="ri-settings-3-line"></i>{{ $t('配置') }}</button>
          <button v-if="!home.company.sample" type="button" class="ss-btn sm ghost" :disabled="busy" data-test="fau-sample-open" @click="openSample"><i class="ri-flask-line"></i>{{ $t('打开示例项目') }}</button>
          <span class="fau-boundary"><i class="ri-shield-check-line"></i> {{ $t('全部为草稿：不过账·不付款·不申报·不发送·不出具意见') }}</span>
        </section>

        <p v-if="home.company.sample" class="ss-note warn fau-hint" data-test="fau-sample-banner">
          <i class="ri-flask-line"></i>
          <span class="grow">{{ $t('这是示例项目，用的都是示例数据。每个模块的第 2 步已经备好数据，进去点「开始校验并计算」就能看到结果与底稿。') }}</span>
          <button type="button" class="ss-btn sm" :disabled="busy" data-test="fau-sample-remove" @click="removeSample"><i class="ri-delete-bin-line"></i>{{ $t('删除示例项目') }}</button>
        </p>
        <p v-else-if="defaultsLeft.length && !hintClosed" class="ss-note info fau-hint" data-test="fau-defaults-hint">
          <i class="ri-information-line"></i>
          <span class="grow">{{ $t('还有 {n} 项配置用的是默认值：{p0}', { n: defaultsLeft.length, p0: defaultsLeft.map((d) => $t(d.label)).join(sep) }) }}</span>
          <button type="button" class="ss-btn sm" data-test="fau-defaults-go" @click="openSetupAt(defaultsLeft[0].step)">{{ $t('去完善') }}</button>
          <button type="button" class="ss-btn ghost sm" :aria-label="$t('不再提示')" data-test="fau-defaults-close" @click="closeHint"><i class="ri-close-line"></i></button>
        </p>

        <section v-if="!home.project" class="fau-panel" data-test="fau-first-project">
          <h3>{{ $t('先新建一个项目') }}</h3>
          <p class="ss-muted">{{ $t('每个项目对应一个月结期、年审或申报周期，数据、运行和签核都挂在项目下。') }}</p>
          <div class="ss-actions">
            <button type="button" class="ss-btn primary" :disabled="busy" data-test="fau-first-project-create" @click="createFirstProject"><i class="ri-add-line"></i>{{ $t('新建「{p0} 月结」', { p0: lastMonth() }) }}</button>
            <button type="button" class="ss-btn" @click="projectBar?.openCreate()">{{ $t('自定义…') }}</button>
          </div>
        </section>

        <ModuleRunner
          v-else-if="moduleId"
          :key="`${moduleId}:${home.project.id}`"
          :module-id="moduleId" :home="home" :run-id="String(route.query.run || '') || undefined" :step="String(route.query.step || '') || undefined"
          @home-changed="reload"
        />

        <template v-else>
          <div class="fau-panels">
            <section class="fau-panel" data-test="fau-todos">
              <h3><i class="ri-todo-line"></i>{{ $t('我的待办') }}</h3>
              <ul v-if="home.todos.length" class="fau-list">
                <li v-for="t in home.todos" :key="t.id" :data-test="`fau-todo-${t.kind}`" @click="openTodo(t)">
                  <span class="fau-dot" :class="t.severity === 'info' ? '' : t.severity"></span>
                  <span class="grow">{{ msg(t.message) }}</span>
                  <i class="ri-arrow-right-s-line fau-dir-icon"></i>
                </li>
              </ul>
              <p v-else class="ss-muted">{{ $t('没有待办') }}</p>
            </section>
            <section class="fau-panel" data-test="fau-queue">
              <h3><i class="ri-quill-pen-line"></i>{{ $t('签核队列') }}</h3>
              <SignoffQueue :items="home.queue" @open="(q) => router.push({ path: `/workbenches/finance-audit/m/${q.moduleId}`, query: { run: q.runId, step: 'signoff' } })" />
            </section>
            <section class="fau-panel" data-test="fau-close-progress">
              <h3><i class="ri-calendar-check-line"></i>{{ $t('本期关账进度') }}</h3>
              <template v-if="home.closeProgress">
                <div class="fau-row"><span class="grow">{{ $t('关账清单') }}</span><FauNum :value="`${home.closeProgress.checklistDone}/${home.closeProgress.checklistTotal}`" /></div>
                <div class="fau-row"><span class="grow">{{ $t('试算平衡') }}</span><span :class="home.closeProgress.trialOk ? 'fau-true' : 'fau-false'">{{ home.closeProgress.trialOk === null ? '-' : home.closeProgress.trialOk ? '✓' : '✗' }}</span></div>
                <div class="fau-row"><span class="grow">{{ $t('勾稽未通过') }}</span><FauNum :value="home.closeProgress.tieIssues" /></div>
              </template>
              <p v-else class="ss-muted">{{ $t('本项目还没有跑月结关账') }}</p>
              <div class="ss-actions"><button type="button" class="ss-btn sm" @click="router.push('/workbenches/finance-audit/m/close')">{{ $t('继续月结') }}</button></div>
            </section>
          </div>

          <!-- 模块入口：七个分组；每张卡说清楚能产出什么、现在能不能用 -->
          <p class="ss-muted fau-overview" data-test="fau-overview">{{ $t('{n} 个模块已可用、{m} 个即将上线：点可用的卡片进入，按七步出底稿；每张卡写着它产出什么。', { n: readyCount, m: plannedCount }) }}</p>
          <div class="fau-groups" data-test="fau-modules">
            <component
              :is="foldable(g) ? 'details' : 'section'" v-for="g in GROUPS" :key="g" class="fau-group" :data-test="`fau-group-${g}`"
              :open="foldable(g) ? capitalOpen : undefined" @toggle="foldable(g) && onCapitalToggle($event)"
            >
              <component :is="foldable(g) ? 'summary' : 'header'">
                <h3>{{ $t(GROUP_LABELS[g]) }}</h3>
                <span class="fau-badge muted">{{ modulesOf(g).length }}</span>
                <small v-if="foldable(g)" class="ss-muted">{{ capitalOpen ? $t('点击收起') : $t('点击展开') }}</small>
              </component>
              <div class="fau-mods">
                <component
                  :is="m.status === 'ready' ? 'button' : 'div'" v-for="m in modulesOf(g)" :key="m.id" :type="m.status === 'ready' ? 'button' : undefined"
                  class="fau-mod" :class="{ planned: m.status !== 'ready' }" :data-test="`fau-mod-${m.id}`" @click="m.status === 'ready' && openModule(m)"
                >
                  <strong><span class="fau-code">{{ m.code }}</span>{{ $t(m.name) }}</strong>
                  <small>{{ $t(m.summary) }}</small>
                  <span class="fau-mod-foot">
                    <span v-if="m.status === 'ready'" class="fau-badge ok">{{ $t('可用') }}</span>
                    <span v-else class="fau-badge muted" :data-test="`fau-planned-${m.id}`" :data-batch="m.batch">{{ $t('即将上线') }}</span>
                    <span v-for="o in m.outputs" :key="o" class="fau-out">{{ OUTPUT_LABEL[o] || o }}</span>
                  </span>
                </component>
              </div>
            </component>
          </div>

          <section class="fau-panel" data-test="fau-recent">
            <h3><i class="ri-file-list-3-line"></i>{{ $t('最近产出') }}</h3>
            <ul v-if="home.recent.length" class="fau-list">
              <li v-for="a in home.recent" :key="a.id" @click="openArtifact(a.path)">
                <i :class="a.kind === 'docx' ? 'ri-file-word-2-line' : 'ri-file-excel-2-line'"></i>
                <span class="grow">{{ msg(a.title) }} · <FauNum :value="baseName(a.path)" /></span>
                <span class="fau-badge" :class="a.archived ? 'ok' : 'warn'">{{ a.archived ? $t('已签核·已归档') : $t('草稿·待复核') }}</span>
              </li>
            </ul>
            <p v-else class="ss-muted">{{ $t('还没有产出') }}</p>
          </section>
        </template>
      </template>
    </template>

    <!-- P3 数据管理抽屉 -->
    <div v-if="dataOpen" class="fau-drawer-mask" @click="dataOpen = false"></div>
    <aside v-if="dataOpen" class="fau-drawer" role="dialog" :aria-label="$t('数据接入与清洗')" data-test="fau-data-drawer">
      <header>
        <h3>{{ $t('数据接入与清洗') }}</h3>
        <button type="button" class="ss-btn ghost sm" @click="dataOpen = false"><i class="ri-close-line"></i></button>
      </header>
      <div class="fau-drawer__body">
        <p class="ss-muted">{{ $t('在模块的第 2 步上传数据；这里管理本项目已导入的数据集，也可以从财务智能体账套只读导入。') }}</p>
        <div class="fau-table-wrap">
          <table class="fau-table">
            <thead><tr><th>{{ $t('数据集') }}</th><th>{{ $t('类型') }}</th><th class="num">{{ $t('行数') }}</th><th></th></tr></thead>
            <tbody>
              <tr v-for="d in datasets" :key="d.id">
                <td class="wrap">{{ d.label }}<small v-if="d.issues.length" class="ss-muted"> · {{ $t('问题 {n}', { n: d.issues.length }) }}</small></td>
                <td>{{ d.kind }}</td>
                <td class="num"><FauNum :value="d.rowCount" /></td>
                <td><button type="button" class="ss-btn ghost sm" @click="removeDataset(d.id)"><i class="ri-delete-bin-line"></i></button></td>
              </tr>
            </tbody>
          </table>
        </div>
        <h4>{{ $t('从财务智能体账套导入') }}</h4>
        <div class="fau-row">
          <select v-model="faLedger" data-test="fau-fa-ledger">
            <option value="">{{ ledgers.length ? $t('选择账套') : $t('财务智能体里还没有账套') }}</option>
            <option v-for="l in ledgers" :key="l.id" :value="l.id">{{ l.name }}</option>
          </select>
          <input v-model.trim="faPeriod" dir="ltr" :placeholder="'YYYY-MM'" />
          <button type="button" class="ss-btn sm" :disabled="!faLedger || busy" @click="importFromFa">{{ $t('只读导入') }}</button>
        </div>
        <p v-if="dataError" class="ss-note danger"><i class="ri-error-warning-line"></i>{{ dataError }}</p>
      </div>
    </aside>
    <p v-if="actionError" class="ss-note danger"><i class="ri-error-warning-line"></i>{{ actionError }}</p>
  </div>
</template>

<script setup lang="ts">
/**
 * 解决方案 · 财会审计（docs/finance-audit-solution.md 第 5 节）。
 * 首页：顶部条 + 我的待办 / 签核队列 / 本期关账进度 + 48 个模块（七个分组）+ 最近产出；
 * 模块页：/workbenches/finance-audit/m/:moduleId（统一七步）。没有公司档案时直接显示配置向导。
 */
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { FauCatalogItem, FauDatasetMeta, FauGroup, FauHome, FauLocale, FauTodo } from '@totalclaw/ipc-contracts';
import { FAU_GROUPS } from '@totalclaw/ipc-contracts';
import { BUNDLE_LABELS, GROUP_LABELS } from '../../shared/financeAudit/catalog';
import { STANDARD_LABELS, regionProfile } from '../../shared/financeAudit/regions';
import PageBackButton from '../components/PageBackButton.vue';
import SetupWizard from '../workbenches/finance-audit/SetupWizard.vue';
import ProjectBar from '../workbenches/finance-audit/ProjectBar.vue';
import OutputLocalePicker from '../workbenches/finance-audit/OutputLocalePicker.vue';
import SignoffQueue from '../workbenches/finance-audit/SignoffQueue.vue';
import ModuleRunner from '../workbenches/finance-audit/ModuleRunner.vue';
import FauNum from '../workbenches/finance-audit/FauNum.vue';
import { OUTPUT_LABEL, errorMessage, fau, lastMonth, msg, onFauEvent } from '../workbenches/finance-audit/shared';
import { i18nKey, listSeparator } from '../i18n';
import '../workbenches/service-settlement/styles.css';
import '../workbenches/finance-audit/styles.css';

const route = useRoute();
const router = useRouter();
const GROUPS: FauGroup[] = FAU_GROUPS;

const home = ref<FauHome | null>(null);
const catalog = ref<FauCatalogItem[]>([]);
const loading = ref(false);
const busy = ref(false);
const loadError = ref('');
const actionError = ref('');
const editingSetup = ref<false | 'edit' | 'new'>(false);
/** 从「去完善」进向导时直接落到的那一步 */
const setupStart = ref('');
const sep = listSeparator();
const projectBar = ref<InstanceType<typeof ProjectBar> | null>(null);
const dataOpen = ref(false);
const datasets = ref<FauDatasetMeta[]>([]);
const ledgers = ref<{ id: string; name: string }[]>([]);
const faLedger = ref('');
const faPeriod = ref('');
const dataError = ref('');

const moduleId = computed(() => String(route.params.moduleId || ''));
const regionName = computed(() => regionProfile(home.value?.company?.region || 'CN').name);
const baseName = (p: string) => p.split(/[\\/]/).pop() || p;

/** 投融资与估值：同一张卡里的扩展分组，默认折叠，点开即可用（纯界面状态，记在本机） */
const foldable = (g: FauGroup) => g === 'capital';
const CAPITAL_OPEN_KEY = 'totalclaw:finance-audit:capital-open:v1';
const capitalOpen = ref(readCapitalOpen());
function readCapitalOpen(): boolean {
  try { return localStorage.getItem(CAPITAL_OPEN_KEY) === '1'; } catch { return false; }
}
function onCapitalToggle(ev: Event): void {
  capitalOpen.value = (ev.target as HTMLDetailsElement).open;
  try { localStorage.setItem(CAPITAL_OPEN_KEY, capitalOpen.value ? '1' : '0'); } catch { /* 无痕模式等：只是不记住 */ }
}
const readyCount = computed(() => catalog.value.filter((m) => m.status === 'ready').length);
const plannedCount = computed(() => catalog.value.length - readyCount.value);

/** 「用默认配置开始」建的公司：还有哪几步用的是默认值（走完一遍完整向导后公司档案不再带 quickStart，提示消失） */
const defaultsLeft = computed(() => {
  const c = home.value?.company;
  if (!c?.quickStart) return [];
  return [
    { step: 'standard', label: i18nKey('准则与科目映射'), left: !c.accountMapConfirmed },
    { step: 'erp', label: i18nKey('ERP 与数据来源'), left: c.erp === 'other' },
    { step: 'thresholds', label: i18nKey('重要性水平与阈值'), left: !Object.keys(c.thresholds).length },
    { step: 'signers', label: i18nKey('签核人与岗位'), left: !c.signers.length },
  ].filter((x) => x.left);
});
const HINT_KEY = 'totalclaw:finance-audit:defaults-hint-closed:v1:';
const hintClosedFor = ref('');
const hintClosed = computed(() => {
  const id = home.value?.company?.id || '';
  if (hintClosedFor.value === id) return true;
  try { return localStorage.getItem(HINT_KEY + id) === '1'; } catch { return false; }
});
function closeHint(): void {
  const id = home.value?.company?.id || '';
  hintClosedFor.value = id;
  try { localStorage.setItem(HINT_KEY + id, '1'); } catch { /* 无痕模式等：只是下次还会提示 */ }
}
function openSetupAt(step: string): void {
  setupStart.value = step;
  editingSetup.value = 'edit';
}

/** 当前地区不适用、或不在所选套餐里的模块不显示 */
function modulesOf(g: FauGroup): FauCatalogItem[] {
  return catalog.value.filter((m) => m.group === g && m.applicable && m.visible);
}

async function reload(): Promise<void> {
  loading.value = true;
  try {
    const [h, c] = await Promise.all([fau<FauHome>('home.get'), fau<FauCatalogItem[]>('catalog.get')]);
    home.value = h;
    catalog.value = c;
    loadError.value = '';
    if (!faPeriod.value) faPeriod.value = h.project?.period || lastMonth();
  } catch (e) { loadError.value = errorMessage(e); } finally { loading.value = false; }
}
async function guarded(fn: () => Promise<unknown>): Promise<void> {
  busy.value = true; actionError.value = '';
  try { await fn(); } catch (e) { actionError.value = errorMessage(e); } finally { busy.value = false; }
}
async function onSaved(): Promise<void> {
  editingSetup.value = false;
  setupStart.value = '';
  await reload();
}
/** 示例项目：建好（或切到）示例公司与示例项目，回到首页 */
function openSample(): Promise<void> {
  return guarded(async () => {
    await fau('sample.open');
    editingSetup.value = false;
    setupStart.value = '';
    if (moduleId.value) await router.push('/workbenches/finance-audit');
    await reload();
  });
}
function removeSample(): Promise<void> {
  return guarded(async () => {
    await fau('sample.remove');
    if (moduleId.value) await router.push('/workbenches/finance-audit');
    await reload();
  });
}
function switchCompany(id: string): Promise<void> {
  if (id === '__new') { editingSetup.value = 'new'; return Promise.resolve(); }
  return guarded(async () => {
    await fau('company.switch', { id });
    await reload();
  });
}
function setOutputLocale(l: FauLocale): Promise<void> {
  return guarded(async () => { await fau('company.save', { company: { ...home.value!.company!, outputLocale: l } }); await reload(); });
}
function setBundle(b: string): Promise<void> {
  return guarded(async () => { await fau('settings.patch', { bundle: b }); await reload(); });
}
function createFirstProject(): Promise<void> {
  return guarded(async () => { await fau('project.create', { type: 'month_close', period: lastMonth() }); await reload(); });
}
function openTodo(t: FauTodo): void {
  void router.push({ path: `/workbenches/finance-audit/m/${t.moduleId}`, query: { ...(t.runId ? { run: t.runId } : {}), ...(t.step ? { step: t.step } : {}) } });
}
async function openModule(m: FauCatalogItem): Promise<void> {
  if (m.id === 'setup') { editingSetup.value = 'edit'; return; }
  if (m.id === 'projects') { await projectBar.value?.openDetail(); return; }
  if (m.id === 'data-intake') { await openData(); return; }
  void router.push(`/workbenches/finance-audit/m/${m.id}`);
}
async function openArtifact(path: string): Promise<void> {
  try { await fau('artifact.open', { path }); } catch (e) { actionError.value = errorMessage(e); }
}
async function openData(): Promise<void> {
  dataOpen.value = true;
  dataError.value = '';
  try {
    datasets.value = await fau<FauDatasetMeta[]>('data.list');
    ledgers.value = await fau<{ id: string; name: string }[]>('data.financeAgentLedgers');
  } catch (e) { dataError.value = errorMessage(e); }
}
async function removeDataset(id: string): Promise<void> {
  try { await fau('data.remove', { id }); await openData(); } catch (e) { dataError.value = errorMessage(e); }
}
async function importFromFa(): Promise<void> {
  busy.value = true;
  try { await fau('data.importFromFinanceAgent', { ledgerId: faLedger.value, period: faPeriod.value }); await openData(); } catch (e) { dataError.value = errorMessage(e); } finally { busy.value = false; }
}

let off: (() => void) | null = null;
let timer: ReturnType<typeof setTimeout> | null = null;
onMounted(() => {
  void reload();
  off = onFauEvent((ev) => {
    if (ev.type !== 'todo.changed') return;
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => { void reload(); }, 300);
  });
});
onBeforeUnmount(() => { off?.(); if (timer) clearTimeout(timer); });
</script>

<style scoped>
.heading-icon { width: 40px; height: 40px; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; background: color-mix(in srgb, var(--color-brand) 14%, transparent); color: var(--color-brand); font-size: 20px; flex: 0 0 auto; }
.fau-hint { display: flex; align-items: center; gap: 8px; margin: 0; }
.fau-hint .grow { flex: 1; min-width: 0; }
.fau-overview { margin: 0; font-size: 12.5px; }
.fau-mod-foot { display: flex; flex-wrap: wrap; align-items: center; gap: 4px 6px; margin-block-start: 2px; }
.fau-out { padding: 1px 7px; border-radius: 6px; border: 1px solid var(--color-border); color: var(--color-text-secondary); font-size: 11px; }
.fau-group > summary { list-style: none; cursor: pointer; display: flex; align-items: center; gap: 8px; margin-block-end: 8px; }
.fau-group > summary h3 { margin: 0; font-size: 14px; }
.fau-drawer h4 { margin: 0; font-size: 13px; }
.fau-drawer select, .fau-drawer input { height: 30px; border-radius: 8px; border: 1px solid var(--color-border); background: var(--color-bg-input, var(--color-bg-primary)); color: var(--color-text-primary); padding-inline: 8px; font: inherit; font-size: 12.5px; }
.spin { animation: fau-spin 1s linear infinite; }
@keyframes fau-spin { to { transform: rotate(360deg); } }
</style>
