<template>
  <div v-if="def" class="fau-runner ss-module" :data-test="`fau-module-${def.id}`">
    <!-- ModuleHeader -->
    <section class="fau-panel fau-mhead">
      <div class="fau-row">
        <span class="fau-code">{{ def.code }}</span>
        <h2 class="grow">{{ $t(def.name) }}</h2>
        <span class="fau-badge muted">{{ $t(ARCH_LABEL[def.archetype]) }}</span>
        <button type="button" class="ss-btn sm ghost" data-test="fau-judgement" @click="judgement = true"><i class="ri-scales-3-line"></i>{{ $t('判断依据') }}</button>
      </div>
      <p class="ss-muted">{{ $t(def.summary) }}</p>
      <dl class="fau-kv">
        <dt>{{ $t('输出物') }}</dt><dd>{{ def.outputs.map((o) => OUTPUT_LABEL[o] || o).join(' / ') }}</dd>
        <dt>{{ $t('适用地区与准则') }}</dt><dd>{{ def.regions === 'all' ? $t('全部地区') : def.regions.join(' / ') }}<template v-if="def.standards?.length"> · {{ def.standards.map((s) => $t(STANDARD_LABELS[s] || s)).join(' / ') }}</template></dd>
        <dt>{{ $t('来源能力') }}</dt><dd>{{ provenanceText(def.provenance, sep) }}</dd>
        <dt>{{ $t('本模块模型') }}</dt>
        <dd>
          <select :value="home.settings.moduleModels[def.id] || ''" data-test="fau-model" @change="setModel(($event.target as HTMLSelectElement).value)">
            <option value="">{{ $t('系统默认（{p0}）', { p0: models?.defaultLabel || '-' }) }}</option>
            <option v-for="o in models?.options || []" :key="o.value" :value="o.value">{{ o.group ? `${o.group} · ` : '' }}{{ o.label }}</option>
          </select>
        </dd>
      </dl>
    </section>

    <!-- 规划中 / 平台模块：没有七步流程，直接说明（从 URL 直达时不让人点出主进程报错） -->
    <OfficeQcPanel v-if="def.id === 'office-output' && def.status === 'ready'" :home="home" />
    <component :is="GROUP_PANELS[def.id]" v-else-if="def.group === 'platform' && def.status === 'ready' && GROUP_PANELS[def.id]" />
    <section v-else-if="!runnable" class="fau-panel" data-test="fau-not-runnable">
      <p v-if="def.status !== 'ready'" class="ss-note warn"><i class="ri-time-line"></i>{{ $t('这个模块即将上线，上方「来源能力」列出了它整合的开源能力') }}</p>
      <p v-else class="ss-note info"><i class="ri-information-line"></i>{{ $t('这个模块在工作台首页使用：配置向导、项目空间、数据管理') }}</p>
      <div class="ss-actions"><button type="button" class="ss-btn" @click="router.push('/workbenches/finance-audit')"><i class="ri-arrow-go-back-line fau-dir-icon"></i>{{ $t('回到首页') }}</button></div>
    </section>

    <StickyProgress v-if="runnable" :title="`${def.code} · ${$t(def.name)}`" :metas="metas" :runtime="runtime" :current-key="currentKey" @jump="scrollToStep" />

    <div v-if="runnable" class="fau-steps">
      <!-- ① 选择项目与模式 -->
      <StepCard step-key="setup" :index="0" :title="metas[0].title" :hint="metas[0].hint" :runtime="runtime.setup" :is-current="currentKey === 'setup'">
        <p v-if="home.project?.status === 'archived'" class="ss-note warn"><i class="ri-lock-line"></i>{{ $t('项目已归档，只读；请新建项目') }}</p>
        <div class="fau-row">
          <span class="ss-muted">{{ $t('场景模式') }}</span>
          <span class="fau-seg">
            <button v-for="m in def.modes" :key="m.id" type="button" :class="{ on: modeId === m.id }" :disabled="!!run && run.status !== 'draft'" :data-test="`fau-mode-${m.id}`" @click="modeId = m.id">{{ $t(m.name) }}</button>
          </span>
        </div>
        <div class="fau-row">
          <OutputLocalePicker v-model="outputLocale" :disabled="!!run" />
          <span class="fau-badge muted">{{ $t('期间') }} <FauNum :value="home.project?.period" /></span>
          <span class="fau-badge muted">{{ $t(regionName) }} · {{ $t(STANDARD_LABELS[home.company?.standard || 'CAS'] || '') }}</span>
        </div>
        <div v-if="pastRuns.length" class="fau-row">
          <span class="ss-muted">{{ $t('继续本项目里的运行') }}</span>
          <select :value="run?.id || ''" data-test="fau-run-select" @change="selectRun(($event.target as HTMLSelectElement).value)">
            <option value="">{{ $t('新建一次运行') }}</option>
            <option v-for="r in pastRuns" :key="r.id" :value="r.id">{{ modeName(r.modeId) }} · {{ $t(RUN_STATUS[r.status] || r.status) }} · {{ fmtTimeText(r.updatedAt) }}</option>
          </select>
        </div>
        <div class="ss-actions">
          <button v-if="!run" type="button" class="ss-btn primary" :disabled="busy || home.project?.status === 'archived'" data-test="fau-run-create" @click="createRun"><i class="ri-play-line"></i>{{ $t('开始这次运行') }}</button>
          <span v-else class="fau-badge ok">{{ $t('本次运行：{p0}', { p0: modeName(run.modeId) }) }} · {{ $t(LOCALE_LABEL[run.outputLocale]) }}</span>
        </div>
      </StepCard>

      <!-- ② 上传数据 -->
      <StepCard step-key="upload" :index="1" :title="metas[1].title" :hint="metas[1].hint" :runtime="runtime.upload" :is-current="currentKey === 'upload'">
        <p v-if="!run" class="ss-muted">{{ $t('先完成第 1 步') }}</p>
        <template v-else>
          <div v-for="inp in inputs" :key="inp.id" class="fau-input" :class="{ need: inp.needed, ok: (selected[inp.id] || []).length > 0 }" :data-test="`fau-input-${inp.id}`">
            <header>
              <strong>{{ $t(inp.label) }}</strong>
              <span class="fau-badge" :class="inp.needed ? 'warn' : 'muted'">{{ inp.needed ? $t('必需') : $t('可选') }}</span>
              <span class="grow"></span>
              <button type="button" class="ss-link" @click="guide = guide === inp.id ? '' : inp.id">{{ $t('怎么导出这份数据') }}</button>
              <button v-if="hasTemplate(def.id, inp.id)" type="button" class="ss-link" :data-test="`fau-template-${inp.id}`" @click="downloadTemplate(inp)">{{ $t('下载模板') }}</button>
            </header>
            <p v-if="guide === inp.id" class="ss-note info"><i class="ri-question-line"></i>{{ $t(inp.help) }} {{ exportGuide(inp.kind, home.company?.erp || 'other') }}</p>
            <div v-if="datasetsOf(inp.kind, inp.id).length" class="fau-row">
              <label v-for="d in datasetsOf(inp.kind, inp.id)" :key="d.id" class="fau-ds">
                <input :type="inp.multi ? 'checkbox' : 'radio'" :name="`slot-${inp.id}`" :checked="(selected[inp.id] || []).includes(d.id)" :disabled="!editable" @change="toggleDataset(inp.id, d.id, !!inp.multi)" />
                {{ d.label }} <small class="ss-muted">{{ $t('{n} 行', { n: d.rowCount }) }}</small>
                <span v-if="d.issues.length" class="fau-badge warn">{{ d.issues.length }}</span>
              </label>
            </div>
            <FauFileDrop v-if="editable" :label="$t('上传：{p0}', { p0: $t(inp.label) })" :kind="inp.kind" :multi="inp.kind === 'evidence'" @picked="(p) => picked(inp, p)" />
            <ErpPull v-if="editable" :kind="inp.kind" @picked="(p) => picked(inp, p)" />
            <template v-if="pending[inp.id]">
              <TableMapping
                v-if="pending[inp.id]!.inspect" :table="pending[inp.id]!.inspect as any"
                :roles="pending[inp.id]!.inspect!.roles.map((r) => ({ ...r, label: $t(r.label) }))"
                @update="(m) => reinspect(inp, m)" @sheet="(s) => reinspect(inp, undefined, s)"
              />
              <div class="ss-actions">
                <button type="button" class="ss-btn primary sm" :disabled="busy || !!pending[inp.id]!.inspect?.missing.length" :data-test="`fau-import-${inp.id}`" @click="doImport(inp)"><i class="ri-download-2-line"></i>{{ $t('确认导入') }}</button>
                <button type="button" class="ss-btn ghost sm" @click="delete pending[inp.id]">{{ $t('取消') }}</button>
              </div>
            </template>
          </div>
          <div v-if="def.id === 'recon' && run.modeId === 'bank' && pairing" class="fau-input" data-test="fau-bank-pairing">
            <header><strong>{{ $t('银行账户配对') }}</strong></header>
            <p v-if="!pairing.pairing.unpairedBook.length && !pairing.pairing.unpairedBank.length" class="ss-note ok"><i class="ri-links-line"></i>{{ $t('已自动配对 {n} 个账户', { n: pairing.pairing.pairs.length }) }}</p>
            <div v-for="b in pairing.pairing.unpairedBank" :key="b" class="fau-row">
              <FauNum :value="b" /> ↔
              <select v-model="manualPairs[b]" :disabled="!editable">
                <option value="">{{ $t('请选择…') }}</option>
                <option v-for="bk in pairing.book" :key="bk.code" :value="bk.code">{{ bk.code }} {{ bk.name }}</option>
              </select>
            </div>
            <div v-if="pairing.pairing.unpairedBank.length" class="ss-actions"><button type="button" class="ss-btn sm" :disabled="busy" @click="savePairs">{{ $t('保存配对') }}</button></div>
          </div>
          <!-- 批次 4：税务组的申报参数与模板 -->
          <TaxParams v-if="def.group === 'tax'" :run="run" :def="def" :editable="editable" @save="(p) => guarded(() => saveInputs({ ...selected }, p))" />
          <component :is="INPUT_PANELS[def.id]" v-if="INPUT_PANELS[def.id]" :run="run" :def="def" :editable="editable" @changed="reload" />
          <p v-if="run.steps.upload.status !== 'done' && missingNames.length" class="ss-note warn"><i class="ri-error-warning-line"></i>{{ $t('还缺：{p0}', { p0: missingNames.join(sep) }) }}</p>
        </template>
      </StepCard>

      <!-- ③ 校验 -->
      <StepCard step-key="validate" :index="2" :title="metas[2].title" :hint="metas[2].hint" :runtime="runtime.validate" :is-current="currentKey === 'validate'" :retry="run ? () => retry('validate') : undefined" :cancel="cancel">
        <p v-if="run && missingNames.length" class="ss-note warn"><i class="ri-forbid-line"></i>{{ $t('必需数据还缺：{p0}，补齐后才能校验', { p0: missingNames.join(sep) }) }}</p>
        <div class="ss-actions">
          <button type="button" class="ss-btn primary" :disabled="!run || busy || missingNames.length > 0 || isRunning || !editable" data-test="fau-run-start" @click="start"><i class="ri-play-circle-line"></i>{{ $t('开始校验并计算') }}</button>
          <span class="ss-muted">{{ $t('校验、计算、生成底稿会连续跑完；有阻断项会停在这一步') }}</span>
        </div>
        <ValidationReport v-if="run?.validation" :report="run.validation" />
      </StepCard>

      <!-- ④ 分析 / 计算 -->
      <StepCard step-key="analyze" :index="3" :title="metas[3].title" :hint="metas[3].hint" :runtime="runtime.analyze" :is-current="currentKey === 'analyze'" :retry="run ? () => retry('analyze') : undefined" :cancel="cancel">
        <ul v-if="run?.steps.analyze.sub?.length" class="fau-subs">
          <li v-for="s in run.steps.analyze.sub" :key="s.id" :class="s.status">
            <i :class="SUB_ICON[s.status]"></i>{{ msg(s.label) }}
          </li>
        </ul>
        <ClosePanel v-if="run?.result && def.id === 'close'" :run="run" :def="def" @changed="reload" />
        <ReconPanel v-else-if="run?.result && def.id === 'recon'" :run="run" @open-run="openRun" />
        <FpaPanel v-else-if="run?.result && def.group === 'fpa'" :run="run" />
        <TaxResult v-else-if="run?.result && def.group === 'tax'" :run="run" :def="def" :editable="editable" @changed="reload" />
        <component :is="GROUP_PANELS[def.id]" v-else-if="run?.result && GROUP_PANELS[def.id]" :run="run" :def="def" @changed="reload" @open-run="openRun" />
      </StepCard>

      <!-- ⑤ 生成底稿 -->
      <StepCard step-key="draft" :index="4" :title="metas[4].title" :hint="metas[4].hint" :runtime="runtime.draft" :is-current="currentKey === 'draft'" :retry="run ? () => retry('draft') : undefined" :cancel="cancel">
        <p class="ss-note warn"><i class="ri-draft-line"></i>{{ $t('全部为草稿，带「草稿—待签核」水印；签核后归档区放签核时的副本') }}</p>
        <div v-if="run?.confidence" class="fau-row">
          <span class="fau-badge">{{ $t('数据完整度') }}: {{ $t(CONF[run.confidence.data]) }}</span>
          <span class="fau-badge">{{ $t('方案成熟度') }}: {{ $t(CONF[run.confidence.method]) }}</span>
          <span class="fau-badge">{{ $t('整体置信度') }}: {{ $t(CONF[run.confidence.overall]) }}</span>
        </div>
        <div v-if="run?.verification.length" class="fau-table-wrap" data-test="fau-verification">
          <table class="fau-table">
            <thead><tr><th>{{ $t('回核报告') }}</th><th>{{ $t('结果') }}</th></tr></thead>
            <tbody>
              <tr v-for="v in run.verification" :key="v.id" :class="{ bad: v.status === 'unverified' }">
                <td class="wrap">{{ v.text }}<small v-if="v.missing?.length" class="ss-muted"><br>{{ $t('数据里找不到') }}: <FauNum :value="v.missing.join(', ')" /></small></td>
                <td><span class="fau-badge" :class="v.status === 'verified' ? 'ok' : 'bad'">{{ v.status === 'verified' ? $t('已核实') : $t('未核实') }}</span></td>
              </tr>
            </tbody>
          </table>
        </div>
        <ArtifactPreview v-if="run" :artifacts="run.artifacts" :archived="run.status === 'archived'" />
      </StepCard>

      <!-- ⑥ 人工签核 -->
      <StepCard step-key="signoff" :index="5" :title="metas[5].title" :hint="metas[5].hint" :runtime="runtime.signoff" :is-current="currentKey === 'signoff'">
        <SignoffCard v-if="run && home.company && runInfo" :run="run" :company="home.company" :active="runInfo.active" :next-level="runInfo.nextLevel" :base-levels="def.signoff.levels" @changed="reload" />
      </StepCard>

      <!-- ⑦ 归档与转交 -->
      <StepCard step-key="archive" :index="6" :title="metas[6].title" :hint="metas[6].hint" :runtime="runtime.archive" :is-current="currentKey === 'archive'">
        <p v-if="run?.status === 'archived'" class="ss-note ok" data-test="fau-archived"><i class="ri-archive-line"></i>{{ $t('已归档：文件、签核页、数据集快照与哈希清单在项目归档区') }}</p>
        <p v-else class="ss-muted">{{ $t('最后一级签核通过后自动归档') }}</p>
        <div v-if="def.handoffTo?.length" class="ss-actions">
          <span class="ss-muted">{{ $t('转交下游模块') }}</span>
          <button
            v-for="to in def.handoffTo" :key="to" type="button" class="ss-btn sm" :data-test="`fau-handoff-${to}`"
            :disabled="busy || run?.status !== 'archived' || targetPlanned(to)" :title="targetPlanned(to) ? $t('即将上线') : ''" @click="handoff(to)"
          >
            <i class="ri-share-forward-line fau-dir-icon"></i>{{ moduleLabel(to) }}<small v-if="targetPlanned(to)"> · {{ $t('即将上线') }}</small>
          </button>
        </div>
      </StepCard>
    </div>
    <p v-if="error" class="ss-note danger" data-test="fau-runner-error"><i class="ri-error-warning-line"></i>{{ error }}</p>
    <JudgementDrawer :open="judgement" :modules="[def.id]" :currency="home.company?.currency" @close="judgement = false" />
  </div>
  <p v-else class="ss-note warn"><i class="ri-error-warning-line"></i>{{ $t('未知模块：{p0}', { p0: moduleId }) }}</p>
</template>

<script setup lang="ts">
/**
 * 模块页：统一七步（第 5.4 节）。③④⑤ 由主进程连续跑，界面只按 run.steps 渲染；
 * StickyProgress 贴顶、推进时自动滚到当前步骤；StepCard 自带看门狗（runtime 透传 startedAt / progressAt / kind / estimateSec）。
 */
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import type { FauDatasetMeta, FauHome, FauInspectResult, FauLocale, FauModuleInput, FauRun, FauRunSummary, FauSignLevel, FauSignoffRecord, FauStepKey } from '@totalclaw/ipc-contracts';
import { inputsForMode, moduleById } from '../../../shared/financeAudit/catalog';
import { STANDARD_LABELS, regionProfile } from '../../../shared/financeAudit/regions';
import { i18nKey, listSeparator, t as i18nT } from '../../i18n';
import StepCard from '../service-settlement/StepCard.vue';
import StickyProgress from '../service-settlement/StickyProgress.vue';
import TableMapping from '../service-settlement/TableMapping.vue';
import { scrollToStep, type StepRuntime } from '../service-settlement/shared';
import ArtifactPreview from './ArtifactPreview.vue';
import FauFileDrop from './FauFileDrop.vue';
import FauNum from './FauNum.vue';
import JudgementDrawer from './JudgementDrawer.vue';
import OutputLocalePicker from './OutputLocalePicker.vue';
import SignoffCard from './SignoffCard.vue';
import ValidationReport from './ValidationReport.vue';
import ClosePanel from './modules/accounting/ClosePanel.vue';
import ReconPanel from './modules/accounting/ReconPanel.vue';
import FpaPanel from './modules/fpa/FpaPanel.vue';
import TaxParams from './modules/tax/TaxParams.vue';
import TaxResult from './modules/tax/TaxResult.vue';
import { GROUP_PANELS, INPUT_PANELS } from './modules/panels';
import OfficeQcPanel from './modules/audit/OfficeQcPanel.vue';
import ErpPull from './modules/platform/ErpPull.vue';
import { hasTemplate } from '../../../shared/financeAudit/auditTables';
import { LOCALE_LABEL, OUTPUT_LABEL, STEP_ORDER, errorMessage, exportGuide, fau, fmtTime, msg, onFauEvent, provenanceText, stepMetas, stepRuntimeOf } from './shared';

const props = defineProps<{ moduleId: string; home: FauHome; runId?: string; step?: string }>();
const emit = defineEmits<{ (e: 'home-changed'): void }>();
const router = useRouter();

const ARCH_LABEL: Record<string, string> = { R: i18nKey('规则型'), S: i18nKey('技能型'), H: i18nKey('混合型'), P: i18nKey('平台') };
const RUN_STATUS: Record<string, string> = {
  draft: i18nKey('草稿'), running: i18nKey('进行中'), ready: i18nKey('待签核'), signing: i18nKey('签核中'), returned: i18nKey('被退回'), archived: i18nKey('已归档'), void: i18nKey('已作废'),
};
const CONF: Record<string, string> = { high: i18nKey('高'), medium: i18nKey('中'), low: i18nKey('低') };
const SUB_ICON: Record<string, string> = { todo: 'ri-checkbox-blank-circle-line', running: 'ri-loader-4-line spin', done: 'ri-checkbox-circle-line', failed: 'ri-close-circle-line', skipped: 'ri-skip-forward-line' };
const sep = listSeparator();

const def = computed(() => moduleById(props.moduleId));
/** 只有 ready 的业务模块走七步；规划中的、平台模块（P1–P6）不走 */
const runnable = computed(() => !!def.value && def.value.status === 'ready' && def.value.group !== 'platform');
const metas = stepMetas();
const run = ref<FauRun | null>(null);
const runInfo = ref<{ nextLevel: FauSignLevel | null; active: FauSignoffRecord[]; missing: string[]; running: boolean } | null>(null);
const pastRuns = ref<FauRunSummary[]>([]);
const datasets = ref<FauDatasetMeta[]>([]);
const models = ref<{ options: { value: string; label: string; group?: string }[]; defaultLabel: string } | null>(null);
const modeId = ref(def.value?.modes[0]?.id || '');
const outputLocale = ref<FauLocale>(props.home.company?.outputLocale || 'zh-CN');
const selected = reactive<Record<string, string[]>>({});
const pending = reactive<Record<string, { path: string; inspect: (FauInspectResult & { roles: { key: string; label: string; required?: boolean }[] }) | null }>>({});
const pairing = ref<{ book: { code: string; name: string }[]; bank: string[]; pairing: { pairs: { bookAccount: string; bankAccount: string }[]; unpairedBook: string[]; unpairedBank: string[] } } | null>(null);
const manualPairs = reactive<Record<string, string>>({});
const guide = ref('');
const busy = ref(false);
const error = ref('');
const judgement = ref(false);

const regionName = computed(() => regionProfile(props.home.company?.region || 'CN').name);
const inputs = computed<Array<FauModuleInput & { needed: boolean }>>(() => (def.value && run.value ? inputsForMode(def.value, run.value.modeId) : []));
const editable = computed(() => !!run.value && ['draft', 'returned'].includes(run.value.status) && !isRunning.value);
const isRunning = computed(() => !!run.value && Object.values(run.value.steps).some((s) => s.status === 'running'));
const missingNames = computed(() => (runInfo.value?.missing || []).map((k) => i18nT(k)));

const runtime = computed<Record<string, StepRuntime>>(() => {
  const r = run.value;
  const out: Record<string, StepRuntime> = {};
  for (const k of STEP_ORDER) out[k] = r ? stepRuntimeOf(r.steps[k]) : { state: 'todo' };
  if (!r) out.setup = { state: 'todo' };
  return out;
});
const currentKey = computed<string>(() => {
  const r = run.value;
  if (!r) return 'setup';
  const bad = STEP_ORDER.find((k) => ['running', 'failed', 'blocked', 'interrupted'].includes(r.steps[k].status));
  if (bad) return bad;
  return STEP_ORDER.find((k) => r.steps[k].status !== 'done') || 'archive';
});
watch(currentKey, (k) => { void scrollToStep(k); });

function modeName(id: string): string {
  const m = def.value?.modes.find((x) => x.id === id);
  return m ? i18nT(m.name) : id;
}
function moduleLabel(id: string): string {
  const m = moduleById(id);
  return m ? `${m.code} ${i18nT(m.name)}` : id;
}
const targetPlanned = (id: string) => moduleById(id)?.status !== 'ready';
const fmtTimeText = (iso: string) => fmtTime(iso);
// 文件型数据（evidence）按槽位分开列，免得控制清单、名单、回函混在一起
const datasetsOf = (kind: string, slot?: string) => datasets.value.filter((d) => d.kind === kind && (kind !== 'evidence' || !d.slot || !slot || d.slot === slot));

async function loadLists(): Promise<void> {
  if (!def.value) return;
  const [rs, ds] = await Promise.all([fau<FauRunSummary[]>('run.list', { moduleId: def.value.id }), fau<FauDatasetMeta[]>('data.list')]);
  pastRuns.value = rs.filter((r) => r.status !== 'void');
  datasets.value = ds;
}
async function loadRun(id: string): Promise<void> {
  const r = await fau<{ run: FauRun; missing: string[]; running: boolean; nextLevel: FauSignLevel | null; records: FauSignoffRecord[]; active: FauSignoffRecord[] }>('run.get', { runId: id });
  run.value = r.run;
  runInfo.value = { nextLevel: r.nextLevel, active: r.active, missing: r.missing, running: r.running };
  modeId.value = r.run.modeId;
  outputLocale.value = r.run.outputLocale;
  for (const k of Object.keys(selected)) delete selected[k];
  for (const [k, v] of Object.entries(r.run.inputs)) selected[k] = [...v];
  if (r.run.moduleId === 'recon' && r.run.modeId === 'bank' && r.run.inputs.bank?.length && r.run.inputs.bankJournal?.length) {
    try { pairing.value = await fau('recon.bankAccounts', { runId: id }); } catch { pairing.value = null; }
  } else pairing.value = null;
}
async function reload(): Promise<void> {
  error.value = '';
  try {
    await loadLists();
    if (run.value) await loadRun(run.value.id);
    emit('home-changed');
  } catch (e) { error.value = errorMessage(e); }
}
async function selectRun(id: string): Promise<void> {
  if (!id) { run.value = null; runInfo.value = null; void router.replace({ query: {} }); return; }
  await loadRun(id);
  void router.replace({ query: { run: id } });
}
function openRun(id: string): void {
  void router.push({ path: `/workbenches/finance-audit/m/${props.moduleId}`, query: { run: id } });
}

async function guarded(fn: () => Promise<unknown>): Promise<void> {
  busy.value = true; error.value = '';
  try { await fn(); } catch (e) { error.value = errorMessage(e); } finally { busy.value = false; }
}
function createRun(): Promise<void> {
  return guarded(async () => {
    const r = await fau<FauRun>('run.create', { moduleId: props.moduleId, modeId: modeId.value, outputLocale: outputLocale.value });
    await loadLists();
    await selectRun(r.id);
  });
}
async function picked(inp: FauModuleInput, paths: string[]): Promise<void> {
  if (inp.kind === 'evidence') {
    await guarded(async () => {
      const ids: string[] = [];
      for (const p of paths) ids.push((await fau<FauDatasetMeta>('data.import', { path: p, kind: inp.kind, slot: inp.id, moduleId: props.moduleId })).id);
      await saveInputs({ ...selected, [inp.id]: [...(selected[inp.id] || []), ...ids] });
    });
    return;
  }
  pending[inp.id] = { path: paths[0], inspect: null };
  await reinspect(inp);
}
async function reinspect(inp: FauModuleInput, mapping?: Record<string, string>, sheet?: string): Promise<void> {
  const p = pending[inp.id];
  if (!p) return;
  await guarded(async () => {
    p.inspect = await fau('data.inspect', { path: p.path, kind: inp.kind, mapping: mapping ?? p.inspect?.mapping, sheet: sheet ?? p.inspect?.sheetName });
  });
}
function doImport(inp: FauModuleInput): Promise<void> {
  const p = pending[inp.id];
  if (!p) return Promise.resolve();
  return guarded(async () => {
    const meta = await fau<FauDatasetMeta>('data.import', { path: p.path, kind: inp.kind, slot: inp.id, moduleId: props.moduleId, mapping: p.inspect?.mapping, sheet: p.inspect?.sheetName });
    delete pending[inp.id];
    await saveInputs({ ...selected, [inp.id]: inp.multi ? [...(selected[inp.id] || []), meta.id] : [meta.id] });
  });
}
async function saveInputs(next: Record<string, string[]>, params?: Record<string, unknown>): Promise<void> {
  if (!run.value) return;
  await fau('run.setInputs', { runId: run.value.id, inputs: next, params });
  await reload();
}
function toggleDataset(slot: string, id: string, multi: boolean): Promise<void> {
  const cur = selected[slot] || [];
  const next = multi ? (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]) : (cur.includes(id) ? [] : [id]);
  return guarded(() => saveInputs({ ...selected, [slot]: next }));
}
function downloadTemplate(inp: FauModuleInput): Promise<void> {
  return guarded(async () => {
    const r = await fau<{ path: string }>('audit.template', { moduleId: props.moduleId, slot: inp.id, locale: outputLocale.value });
    await fau('artifact.reveal', { path: r.path });
  });
}
function savePairs(): Promise<void> {
  const pairs = [...(pairing.value?.pairing.pairs || []), ...Object.entries(manualPairs).filter(([, v]) => v).map(([bank, book]) => ({ bookAccount: book, bankAccount: bank }))];
  return guarded(() => saveInputs({ ...selected }, { accountPairs: pairs }));
}
function start(): Promise<void> {
  return guarded(async () => {
    await fau('run.start', { runId: run.value!.id });
    await reload();
    void scrollToStep('validate');
  });
}
async function retry(fromStep: FauStepKey): Promise<void> {
  await guarded(async () => { await fau('run.retry', { runId: run.value!.id, fromStep }); await reload(); });
}
async function cancel(): Promise<void> {
  if (run.value) await fau('run.cancel', { runId: run.value.id });
}
function handoff(to: string): Promise<void> {
  return guarded(async () => { await fau('handoff.send', { fromRunId: run.value!.id, toModuleId: to }); emit('home-changed'); });
}
async function setModel(v: string): Promise<void> {
  await guarded(async () => { await fau('settings.patch', { moduleModels: { ...props.home.settings.moduleModels, [props.moduleId]: v } }); emit('home-changed'); });
}

let off: (() => void) | null = null;
let timer: ReturnType<typeof setTimeout> | null = null;
onMounted(async () => {
  off = onFauEvent((ev) => {
    // 数据集 / 运行列表变了（别处导入、转交、签核）：刷新可选的数据集与运行
    if (ev.type === 'todo.changed') { void loadLists().catch(() => {}); return; }
    if ((ev.type === 'run.progress' || ev.type === 'run.state') && ev.runId === run.value?.id) {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => { void loadRun(ev.runId).catch(() => {}); }, 150);
    }
  });
  try {
    await loadLists();
    const id = props.runId || pastRuns.value.find((r) => !['archived', 'void'].includes(r.status))?.id;
    if (id) await loadRun(id);
    if (props.step) void scrollToStep(props.step);
  } catch (e) { error.value = errorMessage(e); }
  fau('models.list').then((m) => { models.value = m; }).catch(() => {});
});
onBeforeUnmount(() => { off?.(); if (timer) clearTimeout(timer); });
watch(() => props.runId, (id) => { if (id && id !== run.value?.id) void loadRun(id).catch((e) => { error.value = errorMessage(e); }); });
</script>

<style scoped>
.fau-runner { display: grid; gap: 12px; }
.fau-mhead h2 { margin: 0; font-size: 17px; }
.fau-mhead .fau-code { font-weight: 800; color: var(--color-brand); font-size: var(--font-size-lg); }
.fau-mhead select, .fau-input select { height: 30px; border-radius: var(--radius-3); border: 1px solid var(--color-border); background: var(--color-bg-input); color: var(--color-text-primary); font: inherit; font-size: 12.5px; max-width: 420px; }
.fau-ds { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border: 1px solid var(--color-border); border-radius: var(--radius-pill); font-size: var(--font-size-sm); }
.fau-subs { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; gap: 6px 14px; font-size: 12.5px; }
.fau-subs li { display: inline-flex; align-items: center; gap: 4px; color: var(--color-text-secondary); }
.fau-subs li.done { color: var(--color-success); }
.fau-subs li.running { color: var(--color-brand); }
.fau-subs li.failed { color: var(--color-danger); }
.spin { animation: fau-spin 1s linear infinite; }
@keyframes fau-spin { to { transform: rotate(360deg); } }
</style>
