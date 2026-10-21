<template>
  <section class="ops-console">
    <header class="ops-header">
      <div>
        <span class="ops-kicker"><i class="ri-robot-2-line"></i> {{ $t('TotalClaw 企业助手平台 · REAL AGENT RUN') }}</span>
        <h2>{{ $t(current.title) }}</h2>
        <p>{{ $t(current.subtitle) }}</p>
      </div>
      <div class="ops-header-actions">
        <span class="runtime-state" :class="runStatus">
          <i :class="statusIcon"></i>{{ statusLabel }}
        </span>
        <button v-if="runStatus === 'waiting'" class="ops-button approve" type="button" @click="openApprovalDialog">
          <i class="ri-file-search-line"></i>{{ $t('查看确认详情') }}
        </button>
        <button v-else-if="runStatus === 'running'" class="ops-button secondary" type="button" @click="takeOver">
          <i class="ri-hand"></i>{{ $t('人工接管') }}
        </button>
        <button
          v-else
          class="ops-button primary"
          type="button"
          :disabled="!canStartCurrent"
          :title="startBlockedReasonCurrent"
          @click="start"
        >
          <i class="ri-play-fill"></i>{{ runStatus === 'completed' || runStatus === 'cancelled' || runStatus === 'failed' ? $t('重新演示') : $t(startButtonLabel) }}
        </button>
      </div>
    </header>
    <p v-if="domain !== 'global-ads'" class="execution-blocked">
      {{ $t('当前自动化场景含内置样例输入；正式业务数据接入待确认。') }}
    </p>
    <p v-if="!canStartCurrent && startBlockedReasonCurrent" class="execution-blocked">
      <i class="ri-upload-cloud-2-line"></i>{{ $t(startBlockedReasonCurrent) }}
    </p>
    <p v-if="executionError" class="execution-error">
      <i class="ri-error-warning-line"></i>{{ $t(executionError) }}
    </p>
    <p v-else-if="executionNote" class="execution-note">
      <i class="ri-link-m"></i>{{ $t(executionNote) }}
    </p>
    <!-- 执行中很久没有任何步骤回执：如实说「可能已超时」，可继续等待 / 停止并重新开始 / 查看日志 -->
    <StepRunAlert
      v-if="runWatchdog.suspect.value"
      state="suspect"
      :elapsed-sec="runWatchdog.elapsedSec.value"
      :since-heartbeat-sec="runWatchdog.sinceHeartbeatSec.value"
      :retry-label="$t('停止并重新开始')"
      :busy="restarting"
      @retry="restartStalledRun"
      @keep-waiting="runWatchdog.keepWaiting()"
    />

    <section class="platform-flow" :aria-label="$t('企业助手平台能力链')">
      <header>
        <div>
          <span><i class="ri-apps-2-line"></i> {{ $t('本次任务调用的平台能力') }}</span>
          <small>{{ hasApprovalStep ? $t('从业务目标到真实执行、人工确认与证据回写，全链路可见') : $t('从业务目标到工作流执行、系统回执与证据回写，全链路可见') }}</small>
        </div>
        <div class="run-meta">
          <em><i></i>{{ $t('真实执行') }}</em>
          <code>{{ runId || $t('点击开始后生成执行编号') }}</code>
          <time v-if="lastEventAt">{{ lastEventAt }}</time>
          <span v-if="runStatus === 'running' && runWatchdog.elapsedSec.value >= 3" class="run-elapsed">
            {{ $t('已运行 {p0}', { p0: formatStepDuration(runWatchdog.elapsedSec.value) }) }}
          </span>
        </div>
      </header>
      <div class="capability-chain">
        <article
          v-for="(stage, index) in platformStages"
          :key="stage.label"
          :class="platformStageState(index)"
        >
          <span class="capability-node"><i :class="stage.icon"></i></span>
          <div>
            <!-- tag 在 platformStages 里已经过 i18nT，这里不能再 $t 一次（拿译文当 key 查） -->
            <small>{{ stage.tag }}</small>
            <strong>{{ $t(stage.label) }}</strong>
            <p>{{ $t(stage.detail) }}</p>
          </div>
          <i v-if="index < platformStages.length - 1" class="ri-arrow-right-line chain-arrow"></i>
        </article>
      </div>
    </section>

    <section class="agent-team-strip" :aria-label="$t('多 Agent 协作团队')">
      <header>
        <div>
          <span><i class="ri-team-line"></i> {{ $t('本次任务的 Agent 团队') }}</span>
          <small>{{ $t('{p0} 个专业角色参与编排；只有收到真实执行回执后才标记完成', { p0: agentTeam.length }) }}</small>
        </div>
        <em><i></i>{{ runStatus === 'running' ? $t('协作执行中') : $t('{p0} 个角色已回执', { p0: verifiedActorCount }) }}</em>
      </header>
      <div>
        <article
          v-for="(agent, index) in agentTeam"
          :key="agent.id"
          :class="agentState(index)"
        >
          <span><i :class="agent.icon"></i></span>
          <div><strong>{{ $t(agent.name) }}</strong><small>{{ $t(agent.role) }}</small></div>
          <i v-if="index < agentTeam.length - 1" class="ri-arrow-right-line handoff-arrow"></i>
        </article>
      </div>
    </section>

    <div class="ops-grid">
      <aside class="task-rail">
        <div class="rail-title">
          <span>{{ $t('自动化任务') }}</span>
          <em>{{ scenarios.length }}</em>
        </div>
        <button
          v-for="(scenario, index) in scenarios"
          :key="scenario.id"
          type="button"
          class="task-card"
          :class="{ active: index === selectedIndex }"
          @click="selectScenario(index)"
        >
          <span class="task-status"><i :class="taskIcon(index)"></i></span>
          <span>
            <strong>{{ $t(scenario.title) }}</strong>
            <small>{{ $t(scenario.trigger) }}</small>
          </span>
          <i class="ri-arrow-right-s-line"></i>
        </button>
        <div class="rail-facts">
          <div><span>{{ $t('触发方式') }}</span><strong>{{ $t(current.trigger) }}</strong></div>
          <div><span>{{ $t('预估耗时') }}</span><strong>{{ $t(current.duration) }}</strong></div>
          <div><span>{{ $t('业务影响') }}</span><strong>{{ $t(current.impact) }}</strong></div>
        </div>
      </aside>

      <main class="system-stage">
        <div class="browser-chrome">
          <div class="traffic-lights"><i></i><i></i><i></i></div>
          <div class="address"><i class="ri-lock-2-line"></i>{{ current.url }}</div>
          <span class="live-badge"><i></i> {{ $t('执行状态') }}</span>
        </div>

        <div class="system-toolbar">
          <div>
            <span>{{ $t('目标系统') }}</span>
            <strong>{{ $t(current.system) }}</strong>
          </div>
          <span class="agent-control"><i class="ri-cursor-line"></i> {{ $t(statusLabel) }}</span>
        </div>

        <div class="metric-row">
          <article v-for="metric in current.metrics" :key="metric.label" :class="metric.tone || ''">
            <span>{{ $t(metric.label) }}</span>
            <strong :title="$t('当前执行回执未提供业务指标，数据接入待确认')">—</strong>
          </article>
        </div>

        <div class="system-content">
          <div v-if="runStatus === 'completed'" class="agent-action completed">
            <span class="agent-cursor"><i class="ri-check-line"></i></span>
            <div>
              <small>{{ $t('自动化流程 · 已完成') }}</small>
              <strong>{{ $t('自动化任务已完成') }}</strong>
              <p>{{ $t('全部步骤与证据已写入本次执行记录，可重新执行或切换其它场景。') }}</p>
            </div>
            <em>{{ current.steps.length }} / {{ current.steps.length }}</em>
          </div>
          <div v-else-if="activeStep" class="agent-action" :class="activeStep.kind">
            <span class="agent-cursor"><i class="ri-cursor-fill"></i></span>
            <div>
              <small>{{ activeEvent?.actorType === 'agent' ? $t('Agent 操作') : $t('工具操作') }} · {{ $t(activeStep.target) }}</small>
              <strong>{{ $t(activeStep.label) }}</strong>
              <p>{{ $t(activeStep.detail) }}</p>
            </div>
            <em v-if="activeEvent?.tool || activeStep.evidence">{{ $t(activeEvent?.tool || activeStep.evidence || '') }}</em>
          </div>
          <div v-else class="agent-action idle">
            <span class="agent-cursor"><i class="ri-robot-2-line"></i></span>
            <div>
              <small>{{ $t('自动化流程 · 就绪') }}</small>
              <strong>{{ $t('等待执行任务') }}</strong>
              <p>{{ $t('点击右侧按钮，观察 Agent 如何操作业务系统并保留证据。') }}</p>
            </div>
            <button
              class="inline-start-button"
              type="button"
              :disabled="!canStartCurrent"
              :title="startBlockedReasonCurrent"
              @click="start"
            >
              <i class="ri-play-fill"></i>
              {{ $t(startButtonLabel) }}
            </button>
          </div>

          <section class="agent-narration" :aria-label="$t('Agent 决策依据与操作摘要')">
            <header>
              <span><i class="ri-terminal-box-line"></i> {{ $t('Agent 决策依据与操作') }}</span>
              <em>{{ $t('执行器回执 · 实时') }}</em>
            </header>
            <p class="domain-rule">{{ $t(domainReasoningRule) }}</p>
            <ol>
              <li
                v-for="row in narrationRows"
                :key="`${current.id}-narration-${row.index}`"
                :class="row.state"
              >
                <span class="narration-index">{{ String(row.index + 1).padStart(2, '0') }}</span>
                <div>
              <p><b>{{ $t('依据') }}</b>{{ $t(row.thought) }}</p>
              <p><b>{{ $t('操作') }}</b>{{ $t(row.action) }}</p>
                </div>
              </li>
            </ol>
          </section>

          <div class="result-list" :class="{ revealed: hasStarted }">
            <article v-for="row in current.rows" :key="row.title">
              <span class="row-indicator" :class="row.tone || ''"></span>
              <div><strong>{{ $t('业务明细待确认') }}</strong><p>{{ $t('现有执行回执未提供明细数据') }}</p></div>
              <em>—</em>
            </article>
          </div>
        </div>
      </main>

      <aside class="execution-rail">
        <div class="rail-title">
          <span>{{ $t('实时执行记录') }}</span>
          <em>{{ completedSteps }}/{{ current.steps.length }}</em>
        </div>
        <div class="execution-session">
          <div><span>{{ $t('执行通道') }}</span><strong>{{ $t(executionChannel) }}</strong></div>
          <div><span>{{ $t('当前目标') }}</span><strong>{{ $t(activeStep?.target || current.system) }}</strong></div>
        </div>
        <div class="progress-track"><i :style="{ width: `${progress}%` }"></i></div>
        <ol class="step-list">
          <li
            v-for="(step, index) in current.steps"
            :key="`${current.id}-${index}`"
            :class="stepState(index)"
          >
            <span class="step-dot">
              <i :class="stepState(index) === 'done' ? 'ri-check-line' : stepKindIcon(step.kind)"></i>
            </span>
            <div>
              <strong>{{ $t(step.label) }}</strong>
              <p>{{ $t(step.detail) }}</p>
              <small>
                <i :class="targetIcon(step.kind)"></i>{{ $t(step.target) }}
                <em v-if="step.requiresApproval">{{ $t('需要人工确认') }}</em>
              </small>
              <span class="step-agent">
                <i :class="eventForStep(index)?.actorType === 'agent' ? 'ri-robot-2-line' : 'ri-tools-line'"></i>
                {{ eventForStep(index)?.actor ? $t(eventForStep(index)?.actor || '') : $t('等待执行器路由') }}
              </span>
              <small v-if="eventForStep(index)?.evidence" class="step-evidence">
                <i class="ri-file-shield-2-line"></i>{{ $t(eventForStep(index)?.evidence || '') }}
              </small>
            </div>
          </li>
        </ol>
        <div class="safety-note">
          <i class="ri-shield-check-line"></i>
          <span>
            <strong>{{ $t('{p0} 条执行证据已留存', { p0: persistedEvidenceCount }) }}</strong>
            {{ hasApprovalStep ? $t('写操作停在人工闸门；接管会真正取消自动执行。') : $t('演示目标允许直接执行；人工接管仍会真正取消自动执行。') }}
          </span>
        </div>
      </aside>
    </div>
  </section>

  <Teleport to="body">
    <div
      v-if="approvalDialogOpen && runStatus === 'waiting'"
      class="ops-confirm-dock"
      role="dialog"
      aria-modal="true"
      :aria-label="$t('工作台人工确认')"
    >
      <HumanConfirmCard
        v-if="!approvalDismissed"
        :key="approvalRequest.key"
        :request="approvalRequest"
        :busy="approvalBusy"
        :context-data="approvalContextData"
        :context-labels="approvalContextLabels"
        :context-preview="approvalContextPreview"
        @decide="onApprovalDecision"
        @dismiss="approvalDismissed = true"
      />
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import HumanConfirmCard, {
  type HumanConfirmCardRequest,
} from './workflow/HumanConfirmCard.vue';
import { createNativeBrowserModalLock } from '../composables/useNativeBrowserModalLock';
import StepRunAlert from './StepRunAlert.vue';
import { formatStepDuration, useStepWatchdog } from '../composables/useStepWatchdog';
import {
  AUTOMATION_SCENARIOS,
  DOMAIN_AGENT_TEAMS,
  type AutomationDomain,
  type AutomationStep,
} from '../workbenches/automationScenarios';
import type {
  AutomationExecutionContext,
  AutomationStepReceipt,
} from '../workbenches/automationExecution';
import { t as i18nT } from '../i18n';

type StoredRun = {
  runId: string;
  domain: AutomationDomain;
  scenarioId: string;
  scenarioTitle: string;
  status: 'running' | 'waiting' | 'completed' | 'cancelled' | 'failed';
  startedAt: string;
  updatedAt: string;
  events: Array<AutomationStepReceipt & {
    stepIndex: number;
    stepLabel: string;
    note: string;
    at: string;
  }>;
  error?: string;
};

const props = defineProps<{
  domain: AutomationDomain;
  execute?: (
    scenarioId: string,
    phase: 'prepare' | 'commit',
    reportStep?: (index: number, note?: string, receipt?: AutomationStepReceipt) => void,
    context?: AutomationExecutionContext,
  ) => Promise<{ note?: string; progressManaged?: boolean } | void>;
  canStart?: (scenarioId: string) => boolean;
  startBlockedReason?: (scenarioId: string) => string;
  /** 返回 true 表示该场景已经跳转到标准工作流，由工作流页接管后续运行。 */
  beforeStart?: (scenarioId: string) => boolean | void | Promise<boolean | void>;
  /** 暂不开放的场景 id：整条从列表里摘掉（如对应平台尚未配置好时）。 */
  hiddenScenarios?: string[];
}>();
/** 运行状态回报给宿主工作台（可选监听；不监听时无副作用） */
const emit = defineEmits<{ (e: 'status', status: 'idle' | 'running' | 'waiting' | 'completed' | 'cancelled' | 'failed'): void }>();
/** 广告投放域不是「演示」，是真实执行投放任务；其余域保持演示口径。 */
const startButtonLabel = computed(() =>
  props.domain === 'global-ads' ? i18nT('执行投放任务') : i18nT('开始真实演示'));

const scenarios = computed(() => {
  const hidden = new Set(props.hiddenScenarios || []);
  const domainScenarios = AUTOMATION_SCENARIOS[props.domain].filter((item) => !hidden.has(item.id));
  if (props.domain !== 'healthcare') return domainScenarios;
  return [
    ...domainScenarios.filter((scenario) => scenario.id === 'hospital-operations'),
    ...domainScenarios.filter((scenario) => scenario.id !== 'hospital-operations'),
  ];
});
const agentTeam = computed(() => DOMAIN_AGENT_TEAMS[props.domain]);
const selectedIndex = ref(0);
// 隐藏后列表变短，原选中下标可能越界 → current 变 undefined，整个面板白屏
watch(scenarios, (list) => {
  if (selectedIndex.value >= list.length) selectedIndex.value = 0;
});
const current = computed(() => scenarios.value[selectedIndex.value]);
const currentStepIndex = ref(-1);
const runStatus = ref<'idle' | 'running' | 'waiting' | 'completed' | 'cancelled' | 'failed'>('idle');
const executionNote = ref('');
const executionError = ref('');
const progressManaged = ref(false);
const approvalDialogOpen = ref(false);
const approvalNativeBrowserLock = createNativeBrowserModalLock();
const approvalBusy = ref(false);
const stepNotes = ref<Record<number, string>>({});
const stepReceipts = ref<Record<number, AutomationStepReceipt>>({});
const runId = ref('');
const lastEventAt = ref('');
/** 数值版的「最近一次步骤回执」与「本次开始」，给看门狗用 */
const lastEventAtMs = ref(0);
const runStartedAtMs = ref(0);
const starting = ref(false);
/**
 * 执行中很久没有任何步骤回执 → 「可能已超时」。等待人工确认（waiting）不算卡住。
 * 这些场景跑的是真实业务系统（浏览器 / 工作流），步骤之间几分钟没回执是正常的，
 * 所以只按「无回执上限」判，不按预计。
 */
const runWatchdog = useStepWatchdog({
  running: () => runStatus.value === 'running',
  startedAt: () => runStartedAtMs.value || null,
  kind: 'publish',
  lastProgressAt: () => lastEventAtMs.value || null,
});
/** 「停止并重新开始」进行中（注意不能用 starting：它在整个执行期间都是 true） */
const restarting = ref(false);
async function restartStalledRun(): Promise<void> {
  if (restarting.value) return;
  restarting.value = true;
  try {
    if (!await takeOver()) return;
    /**
     * 卡住的执行器可能不理会 abort、永远不返回 —— 那条 start() 就一直挂在 await 上，
     * starting 恒 true 把新一轮挡在门外。takeOver 已把 runSequence 翻页，旧的那条
     * 无论何时回来都会被当作过期结果丢弃，所以这里可以放心把门打开。
     */
    starting.value = false;
    await start();
  } finally {
    restarting.value = false;
  }
}
let runSequence = 0;
let activeAbortController: AbortController | null = null;
let activeCancellations = new Set<() => void | Promise<void>>();
let storedRun: StoredRun | null = null;
const RUN_STORAGE_KEY = 'totalclaw.workbench.runs.v1';
const canStartCurrent = computed(() => !starting.value && !!props.execute && props.canStart?.(current.value.id) !== false);
const startBlockedReasonCurrent = computed(() =>
  canStartCurrent.value ? '' : (!props.execute ? i18nT('当前场景尚未接入执行能力') : props.startBlockedReason?.(current.value.id) || i18nT('当前条件未满足')));

const activeStep = computed(() =>
  currentStepIndex.value >= 0 ? current.value.steps[currentStepIndex.value] : null);
const activeEvent = computed(() => currentStepIndex.value >= 0
  ? stepReceipts.value[currentStepIndex.value]
  : undefined);
const hasStarted = computed(() => currentStepIndex.value >= 0 || runStatus.value === 'completed');
const completedSteps = computed(() => {
  if (runStatus.value === 'completed') return current.value.steps.length;
  return Math.max(0, currentStepIndex.value);
});
const progress = computed(() =>
  Math.round((completedSteps.value / current.value.steps.length) * 100));
const statusLabel = computed(() => ({
  idle: i18nT('等待执行'),
  running: i18nT('Agent 执行中'),
  waiting: i18nT('等待人工确认'),
  completed: i18nT('执行完成'),
  cancelled: i18nT('已人工接管'),
  failed: i18nT('执行失败'),
}[runStatus.value]));
const statusIcon = computed(() => ({
  idle: 'ri-time-line',
  running: 'ri-loader-4-line spin',
  waiting: 'ri-user-follow-line',
  completed: 'ri-checkbox-circle-fill',
  cancelled: 'ri-hand',
  failed: 'ri-error-warning-fill',
}[runStatus.value]));
const verifiedActorCount = computed(() => new Set(
  Object.values(stepReceipts.value).map((item) => item.actorId || item.actor).filter(Boolean),
).size);
const persistedEvidenceCount = computed(() =>
  Object.values(stepReceipts.value).filter((item) => item.evidence || item.output || item.tool).length);
const hasApprovalStep = computed(() =>
  current.value.steps.some((step) => step.requiresApproval));
const approvalStepIndex = computed(() => {
  const activeIndex = currentStepIndex.value;
  if (activeIndex >= 0 && current.value.steps[activeIndex]?.requiresApproval) return activeIndex;
  return current.value.steps.findIndex((step) => step.requiresApproval);
});
const approvalStep = computed(() => current.value.steps[approvalStepIndex.value]);
/** 「取消」只在本地收起卡片：审批本身仍在后台等待，重新触发或刷新即可再次出现。 */
const approvalDismissed = ref(false);
const approvalRequest = computed<HumanConfirmCardRequest>(() => ({
  key: `${runId.value || current.value.id}-workbench-approval`,
  runId: runId.value,
  nodeId: `${current.value.id}-human-gate`,
  nodeName: approvalStep.value?.label || i18nT('业务负责人确认'),
  question: i18nT('是否确认「{p0}」当前处理结果并继续？', { p0: current.value.title }),
  detail: approvalStep.value?.detail
    || i18nT('前序 Agent 与业务系统操作已经完成，后续动作会写入业务记录，因此需要人工复核。'),
  requireComment: false,
  source: 'human_confirm_node',
  approveLabel: i18nT('确认内容并继续'),
  rejectLabel: i18nT('退回并停止'),
  approveEffect: i18nT('采用当前结果，继续执行 {p0} 的后续步骤，并写入审计记录。', {
    p0: approvalStep.value?.target || current.value.system,
  }),
  rejectEffect: i18nT('停止本轮自动执行，保留当前结果；请调整输入后重新运行。'),
}));
const approvalContextLabels: Record<string, string> = {
  runId: i18nT('本次执行编号'),
  scenario: i18nT('当前业务场景'),
  system: i18nT('已操作业务系统'),
  currentTarget: i18nT('待确认目标'),
  executionSummary: i18nT('Agent 执行摘要'),
  evidence: i18nT('执行证据与工具回执'),
};
const approvalContextData = computed<Record<string, unknown>>(() => ({
  runId: runId.value,
  scenario: current.value.title,
  system: current.value.system,
  currentTarget: approvalStep.value?.target || current.value.system,
  executionSummary: i18nT(executionNote.value || approvalStep.value?.detail || ''),
  evidence: Object.entries(stepReceipts.value)
    .filter(([index]) => Number(index) <= approvalStepIndex.value)
    .map(([index, receipt]) => ({
      step: current.value.steps[Number(index)]?.label || `Step ${Number(index) + 1}`,
      actor: i18nT(receipt.actor || receipt.actorId || i18nT('执行器')),
      tool: i18nT(receipt.tool || ''),
      evidence: i18nT(receipt.evidence || ''),
      output: i18nT(receipt.output || ''),
    })),
}));
const approvalContextPreview = computed(() =>
  `${current.value.title}\n${executionNote.value || approvalStep.value?.detail || ''}`);
const executionChannel = computed(() => ({
  warehouse: i18nT('内置浏览器 · Odoo · 行业 IPC · 多 Agent'),
  healthcare: i18nT('内置浏览器 · HIS · 多 Agent'),
  'global-ads': i18nT('内置浏览器 / 平台驱动 · 固定多 Agent'),
}[props.domain]));
/**
 * 步骤标签走 i18n，源文用中文。
 *
 * 这六个 tag 原来是硬编码英文字面量（`01 · INTENT` …），中文界面下也是英文、切语言也不变。
 * 同一个工作台里同类装饰性标签（GlobalAdsWorkbenchView 的 eyebrow）是走 $t 的，
 * 所以这不是「刻意保留英文的设计语言」，就是漏了。en 词典里仍映射回原来的大写英文，
 * 英文界面观感不变；阿语是 RTL，夹一串不翻译也不换向的 LTR 英文最难看，这里受益最大。
 */
const platformStages = computed(() => [
  {
    tag: i18nT('01 · 意图'),
    label: i18nT('业务任务入口'),
    detail: current.value.trigger,
    icon: 'ri-flashlight-line',
  },
  {
    tag: i18nT('02 · 编排'),
    label: i18nT('Agent 拆解与编排'),
    detail: i18nT('{p0} 个步骤 · 风险边界已装载', { p0: current.value.steps.length }),
    icon: 'ri-node-tree',
  },
  {
    tag: i18nT('03 · 路由'),
    label: i18nT('模型与工具路由'),
    detail: executionChannel.value,
    icon: 'ri-route-line',
  },
  {
    tag: i18nT('04 · 执行'),
    label: i18nT('真实系统执行'),
    detail: current.value.system,
    icon: 'ri-cursor-line',
  },
  {
    tag: hasApprovalStep.value ? i18nT('05 · 人工') : i18nT('05 · 校验'),
    label: hasApprovalStep.value ? i18nT('人工确认与接管') : i18nT('系统回执校验'),
    detail: hasApprovalStep.value ? i18nT('关键状态变更前暂停') : i18nT('演示目标直接执行并回读结果'),
    icon: hasApprovalStep.value ? 'ri-user-follow-line' : 'ri-shield-check-line',
  },
  {
    tag: i18nT('06 · 证据'),
    label: i18nT('证据与审计回写'),
    detail: runId.value || i18nT('等待生成执行编号'),
    icon: 'ri-file-shield-2-line',
  },
]);
const domainReasoningRule = computed(() => ({
  warehouse: i18nT('以真实导出、SKU、批次、单位和来源行为判断依据；差异必须可回指。'),
  healthcare: i18nT('以 HIS 当前登记、预约、就诊队列与床位状态为事实；由多个 Agent 分工读取、操作、复核并等待人工确认。'),
  'global-ads': i18nT('由固定多 Agent 工作流生成作业包，只向已验证的 Mock 目标提交；失败即停止，不补写成功回执。'),
}[props.domain]));
const narrationRows = computed(() => current.value.steps.map((step, index) => {
  const state = narrationState(index);
  return {
    index,
    state,
    thought: thoughtSummary(step),
    action: actionSummary(step, index, state),
  };
}));

function agentState(index: number): 'done' | 'active' | 'pending' {
  const agent = agentTeam.value[index];
  const activeReceipt = activeEvent.value;
  if (runStatus.value === 'running'
    && (activeReceipt?.actorId === agent.id || activeReceipt?.actor === agent.name)) {
    return 'active';
  }
  const receipts = Object.values(stepReceipts.value);
  const hasReceipt = receipts.some((item) =>
    item.actorId === agent.id || item.actor === agent.name);
  if (hasReceipt) return 'done';
  return 'pending';
}

function thoughtSummary(step: AutomationStep): string {
  const index = current.value.steps.indexOf(step);
  const receipt = stepReceipts.value[index];
  if (receipt?.output) return i18nT(receipt.output);
  if (receipt?.evidence) return i18nT('执行依据已固化：{p0}', { p0: i18nT(receipt.evidence) });
  const agent = receipt?.actor || i18nT('执行器');
  if (step.kind === 'read') {
    return i18nT('{agent}需要先从 {target} 读取真实状态，确认输入完整后再继续。', {
      agent,
      target: step.target,
    });
  }
  if (step.kind === 'analysis') {
    return i18nT('{agent}将已取得证据与确定性规则逐项核对，避免用猜测替代事实。', { agent });
  }
  if (step.kind === 'guard') {
    return i18nT('{agent}检测到状态变更或高风险结果，必须停在人工闸门等待确认。', { agent });
  }
  return i18nT('{agent}将产生业务记录；仅在目标、范围和证据都明确时执行。', { agent });
}

function narrationState(index: number): 'done' | 'active' | 'pending' {
  if (runStatus.value === 'completed' || index < currentStepIndex.value) return 'done';
  if (index === currentStepIndex.value) return 'active';
  return 'pending';
}

function platformStageState(index: number): 'done' | 'active' | 'pending' {
  if (runStatus.value === 'completed') return 'done';
  let activeIndex = 0;
  if (runStatus.value === 'waiting') {
    activeIndex = 4;
  } else if (runStatus.value === 'running') {
    const kind = activeStep.value?.kind;
    activeIndex = kind === 'guard' ? 4 : kind === 'write' ? 3 : currentStepIndex.value <= 0 ? 2 : 3;
  }
  if (index < activeIndex) return 'done';
  if (index === activeIndex) return 'active';
  return 'pending';
}

function markEvent(): void {
  lastEventAtMs.value = Date.now();
  lastEventAt.value = new Intl.DateTimeFormat(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(new Date());
}

function actionSummary(
  step: AutomationStep,
  index: number,
  state: 'done' | 'active' | 'pending',
): string {
  if (state === 'pending') return i18nT('待执行：{label}；目标 {target}。', {
    label: step.label,
    target: step.target,
  });
  if (state === 'done') {
    const evidence = stepReceipts.value[index]?.evidence;
    return evidence
      ? i18nT('{label}已完成；证据：{evidence}。', { label: step.label, evidence })
      : stepNotes.value[index] || i18nT('该步骤未提供执行回执，结果待确认');
  }
  const note = stepNotes.value[index];
  if (note) return note;
  if (runStatus.value === 'waiting') return i18nT('已到 {target}：{detail}，正在等待人工确认。', {
    target: step.target,
    detail: step.detail,
  });
  return i18nT('正在执行 {label}：{detail}。', { label: step.label, detail: step.detail });
}

function eventForStep(index: number): AutomationStepReceipt | undefined {
  return stepReceipts.value[index];
}

function readStoredRuns(): StoredRun[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(RUN_STORAGE_KEY) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persistStoredRun(): void {
  if (!storedRun) return;
  const runs = readStoredRuns().filter((item) => item.runId !== storedRun?.runId);
  runs.unshift(storedRun);
  localStorage.setItem(RUN_STORAGE_KEY, JSON.stringify(runs.slice(0, 50)));
}

function updateStoredRun(
  status: StoredRun['status'],
  error?: string,
): void {
  if (!storedRun) return;
  storedRun.status = status;
  storedRun.updatedAt = new Date().toISOString();
  storedRun.error = error;
  persistStoredRun();
}

function reportExecutionStep(
  sequence: number,
  index: number,
  note?: string,
  receipt: AutomationStepReceipt = {},
): void {
  if (sequence !== runSequence) return;
  activeAbortController?.signal.throwIfAborted();
  const boundedIndex = Math.max(0, Math.min(index, current.value.steps.length - 1));
  currentStepIndex.value = boundedIndex;
  runStatus.value = current.value.steps[boundedIndex]?.requiresApproval ? 'waiting' : 'running';
  const normalized: AutomationStepReceipt = {
    actorType: receipt.actorType || (receipt.actor ? 'agent' : 'tool'),
    actor: receipt.actor || (receipt.actorType === 'human' ? i18nT('人工复核人') : i18nT('确定性执行器')),
    ...receipt,
  };
  stepReceipts.value = { ...stepReceipts.value, [boundedIndex]: normalized };
  if (note) {
    executionNote.value = note;
    stepNotes.value = { ...stepNotes.value, [boundedIndex]: note };
  }
  if (storedRun) {
    storedRun.events.push({
      ...normalized,
      stepIndex: boundedIndex,
      stepLabel: current.value.steps[boundedIndex]?.label || `Step ${boundedIndex + 1}`,
      note: note || '',
      at: new Date().toISOString(),
    });
    updateStoredRun(runStatus.value === 'waiting' ? 'waiting' : 'running');
  }
  markEvent();
}

function createExecutionContext(sequence: number): AutomationExecutionContext {
  const controller = new AbortController();
  activeAbortController = controller;
  return {
    runId: runId.value,
    signal: controller.signal,
    throwIfCancelled: () => {
      if (sequence !== runSequence) throw new DOMException(i18nT('运行已被新任务替换'), 'AbortError');
      controller.signal.throwIfAborted();
    },
    registerCancellation: (cancel) => {
      activeCancellations.add(cancel);
      return () => activeCancellations.delete(cancel);
    },
  };
}

async function cancelActiveExecution(reason: string): Promise<boolean> {
  activeAbortController?.abort(new DOMException(reason, 'AbortError'));
  const cancellations = [...activeCancellations];
  activeCancellations.clear();
  const results = await Promise.allSettled(cancellations.map((cancel) => Promise.resolve().then(cancel)));
  const failures = results.filter((result) => result.status === 'rejected');
  results.forEach((result, i) => { if (result.status === 'rejected') activeCancellations.add(cancellations[i]); });
  if (failures.length) {
    executionError.value = i18nT('停止执行失败，请检查运行状态后重试：') + failures.map((r) => String(r.reason)).join('; ');
    runStatus.value = 'failed';
    updateStoredRun('failed', executionError.value);
    return false;
  }
  return true;
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError'
    || error instanceof Error && /abort|cancel|接管|替换/i.test(error.message);
}

async function start(): Promise<void> {
  if (!canStartCurrent.value) return;
  starting.value = true;
  try { await startExecution(); }
  catch (error) {
    executionError.value = error instanceof Error ? error.message : String(error);
    runStatus.value = 'failed';
  } finally { starting.value = false; }
}

async function startExecution(): Promise<void> {
  if (await props.beforeStart?.(current.value.id) === true) return;
  if (!await cancelActiveExecution(i18nT('开始新的运行'))) return;
  runSequence += 1;
  const sequence = runSequence;
  currentStepIndex.value = 0;
  runStatus.value = 'running';
  runStartedAtMs.value = Date.now();
  executionNote.value = '';
  executionError.value = '';
  approvalDialogOpen.value = false;
  approvalBusy.value = false;
  progressManaged.value = false;
  stepNotes.value = {};
  stepReceipts.value = {};
  runId.value = `TC-${props.domain.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 5)}-${Date.now().toString(36).toUpperCase()}`;
  storedRun = {
    runId: runId.value,
    domain: props.domain,
    scenarioId: current.value.id,
    scenarioTitle: current.value.title,
    status: 'running',
    startedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    events: [],
  };
  persistStoredRun();
  const context = createExecutionContext(sequence);
  markEvent();
  try {
    const result = await props.execute?.(
      current.value.id,
      'prepare',
      (index, note, receipt) => reportExecutionStep(sequence, index, note, receipt),
      context,
    );
    context.throwIfCancelled();
    executionNote.value = result?.note || '';
    progressManaged.value = result?.progressManaged === true;
  } catch (error) {
    if (sequence !== runSequence) return;
    if (isAbortError(error)) {
      executionNote.value = i18nT('自动执行已停止，右侧业务系统保留当前页面供人工继续操作。');
      runStatus.value = 'cancelled';
      updateStoredRun('cancelled');
      markEvent();
      return;
    }
    executionError.value = error instanceof Error ? error.message : String(error);
    runStatus.value = 'failed';
    updateStoredRun('failed', executionError.value);
    markEvent();
    return;
  }
  if (progressManaged.value) {
    if (current.value.steps[currentStepIndex.value]?.requiresApproval) {
      runStatus.value = 'waiting';
    } else if (currentStepIndex.value >= current.value.steps.length - 1) {
      currentStepIndex.value = current.value.steps.length;
      runStatus.value = 'completed';
      updateStoredRun('completed');
    }
    markEvent();
    return;
  }
  executionError.value = i18nT('执行器未返回真实步骤进度，请确认该场景接入状态');
  runStatus.value = 'failed';
  updateStoredRun('failed', executionError.value);
}

async function approve(decision?: { reply?: string; selectedOption?: string }): Promise<void> {
  if (runStatus.value !== 'waiting') return;
  runStatus.value = 'running';
  executionError.value = '';
  const humanStepIndex = approvalStepIndex.value;
  const humanReply = [decision?.selectedOption, decision?.reply].filter(Boolean).join(' · ');
  if (humanStepIndex >= 0) {
    const receipt: AutomationStepReceipt = {
      actor: i18nT('业务负责人'),
      actorType: 'human',
      tool: 'Human Confirm Card',
      evidence: humanReply || i18nT('已审阅执行详情并确认继续'),
      output: humanReply,
    };
    stepReceipts.value = { ...stepReceipts.value, [humanStepIndex]: receipt };
    if (storedRun) {
      storedRun.events.push({
        ...receipt,
        stepIndex: humanStepIndex,
        stepLabel: current.value.steps[humanStepIndex]?.label || i18nT('人工确认'),
        note: humanReply || i18nT('已审阅执行详情并确认继续'),
        at: new Date().toISOString(),
      });
      updateStoredRun('running');
    }
  }
  const sequence = runSequence;
  const context = createExecutionContext(sequence);
  try {
    const result = await props.execute?.(
      current.value.id,
      'commit',
      (index, note, receipt) => reportExecutionStep(sequence, index, note, receipt),
      context,
    );
    context.throwIfCancelled();
    if (result?.note) executionNote.value = result.note;
    if (result?.progressManaged === true) progressManaged.value = true;
  } catch (error) {
    if (sequence !== runSequence) return;
    if (isAbortError(error)) {
      runStatus.value = 'cancelled';
      updateStoredRun('cancelled');
      return;
    }
    executionError.value = error instanceof Error ? error.message : String(error);
    runStatus.value = 'waiting';
    updateStoredRun('waiting', executionError.value);
    markEvent();
    return;
  }
  if (progressManaged.value) {
    currentStepIndex.value = current.value.steps.length;
    runStatus.value = 'completed';
    updateStoredRun('completed');
    markEvent();
    return;
  }
  if (currentStepIndex.value >= current.value.steps.length - 1) {
    currentStepIndex.value = current.value.steps.length;
    runStatus.value = 'completed';
    updateStoredRun('completed');
    return;
  }
  currentStepIndex.value += 1;
  executionError.value = i18nT('执行器未返回真实步骤进度，请确认该场景接入状态');
  runStatus.value = 'failed';
  updateStoredRun('failed', executionError.value);
}

async function takeOver(): Promise<boolean> {
  if (!await cancelActiveExecution(i18nT('人工接管'))) return false;
  runSequence += 1;
  runStatus.value = 'cancelled';
  executionError.value = '';
  executionNote.value = i18nT('自动执行已停止，右侧业务系统保持当前状态，人工可安全接管。');
  updateStoredRun('cancelled');
  markEvent();
  return true;
}

async function selectScenario(index: number): Promise<void> {
  if (!await cancelActiveExecution(i18nT('切换场景'))) return;
  runSequence += 1;
  selectedIndex.value = index;
  currentStepIndex.value = -1;
  runStatus.value = 'idle';
  executionNote.value = '';
  executionError.value = '';
  approvalDialogOpen.value = false;
  approvalBusy.value = false;
  progressManaged.value = false;
  stepNotes.value = {};
  stepReceipts.value = {};
  runId.value = '';
  lastEventAt.value = '';
}

function openApprovalDialog(): void {
  if (runStatus.value !== 'waiting') return;
  approvalDialogOpen.value = true;
}

async function onApprovalDecision(payload: {
  approved: boolean;
  reply?: string;
  selectedOption?: string;
}): Promise<void> {
  if (approvalBusy.value || runStatus.value !== 'waiting') return;
  approvalBusy.value = true;
  try {
    if (payload.approved) {
      await approve(payload);
      approvalDialogOpen.value = false;
      return;
    }
    approvalDialogOpen.value = false;
    if (await takeOver()) {
      executionNote.value = i18nT('已退回并停止执行，请调整输入后重新运行。');
    }

  } finally {
    approvalBusy.value = false;
  }
}

watch(runStatus, (status) => {
  emit('status', status);
  if (status === 'waiting') {
    approvalDialogOpen.value = true;
  } else if (status !== 'running') {
    approvalDialogOpen.value = false;
  }
});

watch(
  () => approvalDialogOpen.value && runStatus.value === 'waiting',
  (open) => approvalNativeBrowserLock.set(open),
  { flush: 'post' },
);

function stepState(index: number): 'done' | 'active' | 'pending' {
  if (runStatus.value === 'completed' || index < currentStepIndex.value) return 'done';
  if (index === currentStepIndex.value) return 'active';
  return 'pending';
}

function taskIcon(index: number): string {
  if (index === selectedIndex.value && runStatus.value === 'running') return 'ri-loader-4-line spin';
  if (index === selectedIndex.value && runStatus.value === 'completed') return 'ri-checkbox-circle-fill';
  return index === selectedIndex.value ? 'ri-play-circle-line' : 'ri-time-line';
}

function stepKindIcon(kind: AutomationStep['kind']): string {
  return ({ read: 'ri-eye-line', write: 'ri-edit-line', analysis: 'ri-cpu-line', guard: 'ri-shield-keyhole-line' })[kind];
}

function targetIcon(kind: AutomationStep['kind']): string {
  return kind === 'guard' ? 'ri-user-follow-line' : kind === 'write' ? 'ri-edit-box-line' : 'ri-links-line';
}

onBeforeUnmount(() => {
  approvalNativeBrowserLock.release();
  void cancelActiveExecution(i18nT('页面已关闭'));
});
</script>

<style scoped>
.ops-console {
  max-width: 1440px;
  margin: 0 auto 22px;
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--color-brand) 28%, var(--color-border));
  border-radius: 18px;
  color: var(--color-text-primary);
  background: color-mix(in srgb, var(--color-bg-card) 96%, #111827);
  box-shadow: 0 18px 50px rgba(15, 23, 42, .10);
}
.ops-header {
  display: flex; align-items: center; justify-content: space-between; gap: 20px;
  padding: 18px 20px; border-bottom: 1px solid var(--color-border);
  background: linear-gradient(115deg, color-mix(in srgb, var(--color-brand) 11%, var(--color-bg-card)), var(--color-bg-card));
}
.ops-header h2 { margin: 4px 0; font-size: 21px; }
.ops-header p { margin: 0; color: var(--color-text-muted); font-size: 12px; }
.ops-kicker { color: var(--color-brand); font-size: 10px; font-weight: 800; letter-spacing: .1em; }
.ops-header-actions { display: flex; align-items: center; gap: 8px; }
.runtime-state, .ops-button {
  display: inline-flex; align-items: center; gap: 6px; height: 34px; padding: 0 11px;
  border-radius: 9px; font-size: 11px; font-weight: 700; white-space: nowrap;
}
.runtime-state { color: var(--color-text-muted); background: var(--color-bg-hover); }
.runtime-state.running { color: #2563eb; background: var(--color-status-info-bg); }
.runtime-state.waiting { color: var(--color-status-warning-fg); background: var(--color-status-warning-bg); }
.runtime-state.completed { color: var(--color-status-success-fg); background: var(--color-status-success-bg); }
.runtime-state.cancelled { color: #7c3aed; background: var(--color-brand-subtle); }
.runtime-state.failed { color: var(--color-status-danger-fg); background: var(--color-status-danger-bg); }
.ops-button { border: 1px solid var(--color-border); cursor: pointer; font-family: inherit; }
.ops-button:disabled { cursor: not-allowed; opacity: .48; }
.ops-button.primary { border-color: transparent; color: #fff; background: var(--color-brand); }
.ops-button.secondary { color: var(--color-text-primary); background: var(--color-bg-card); }
.ops-button.approve { border-color: #f59e0b; color: var(--color-status-warning-fg); background: var(--color-status-warning-bg); }
.ops-confirm-dock {
  position: fixed;
  z-index: 5500;
  inset: 0;
  display: grid;
  place-items: center;
  box-sizing: border-box;
  padding: 24px;
  overflow: hidden;
  background: rgba(18, 24, 38, .24);
  backdrop-filter: blur(10px) saturate(.78);
  -webkit-backdrop-filter: blur(10px) saturate(.78);
}
.ops-confirm-dock > * {
  width: min(760px, 100%);
  max-height: 100%;
}
.platform-flow {
  padding: 13px 16px 15px;
  border-bottom: 1px solid var(--color-border);
  background: color-mix(in srgb, var(--color-bg-primary) 76%, var(--color-brand) 4%);
}
.platform-flow > header {
  display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 10px;
}
.platform-flow > header > div:first-child { display: grid; gap: 2px; }
.platform-flow > header span { font-size: 10.5px; font-weight: 800; }
.platform-flow > header span i { margin-inline-end: 5px; color: var(--color-brand); }
.platform-flow > header small { color: var(--color-text-muted); font-size: 8.5px; }
.run-meta { display: flex; align-items: center; justify-content: flex-end; gap: 8px; min-width: 0; }
.run-meta em {
  display: inline-flex; align-items: center; gap: 5px; padding: 4px 7px; border-radius: 999px;
  color: var(--color-status-success-fg); background: var(--color-status-success-bg); font-size: 8px; font-style: normal; font-weight: 800;
}
.run-meta em i { width: 6px; height: 6px; border-radius: 50%; background: #10b981; box-shadow: 0 0 0 3px rgba(16,185,129,.15); }
.run-meta code, .run-meta time, .run-meta .run-elapsed { color: var(--color-text-muted); font-size: 8px; font-variant-numeric: tabular-nums; }
.run-meta code { overflow: hidden; max-width: 230px; text-overflow: ellipsis; white-space: nowrap; }
.capability-chain { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 7px; }
.capability-chain article {
  position: relative; display: grid; grid-template-columns: 28px 1fr; align-items: center; gap: 7px;
  min-width: 0; padding: 9px; border: 1px solid var(--color-border); border-radius: 10px;
  background: var(--color-bg-card); opacity: .46; transition: opacity .2s, border-color .2s, box-shadow .2s;
}
.capability-chain article.active {
  opacity: 1; border-color: color-mix(in srgb, var(--color-brand) 58%, var(--color-border));
  box-shadow: 0 7px 18px color-mix(in srgb, var(--color-brand) 12%, transparent);
}
.capability-chain article.done { opacity: .9; border-color: #a7f3d0; background: color-mix(in srgb, var(--color-status-success-bg) 58%, var(--color-bg-card)); }
.capability-node {
  display: grid; width: 28px; height: 28px; place-items: center; border-radius: 8px;
  color: var(--color-text-muted); background: var(--color-bg-hover); font-size: 13px;
}
.capability-chain article.active .capability-node { color: #fff; background: var(--color-brand); }
.capability-chain article.done .capability-node { color: var(--color-status-success-fg); background: var(--color-status-success-bg); }
.capability-chain article div { min-width: 0; }
.capability-chain article small, .capability-chain article strong, .capability-chain article p { display: block; }
.capability-chain article small { color: var(--color-text-muted); font-size: 6.8px; letter-spacing: .04em; }
.capability-chain article strong { overflow: hidden; margin: 2px 0; font-size: 9px; text-overflow: ellipsis; white-space: nowrap; }
.capability-chain article p {
  overflow: hidden; margin: 0; color: var(--color-text-muted); font-size: 7.5px; line-height: 1.35;
  text-overflow: ellipsis; white-space: nowrap;
}
.chain-arrow {
  position: absolute; z-index: 2; inset-inline-end: -8px; top: 50%; transform: translateY(-50%);
  color: var(--color-text-muted); font-size: 9px;
}
.agent-team-strip {
  padding: 11px 16px 13px;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-bg-card);
}
.agent-team-strip > header {
  display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 8px;
}
.agent-team-strip > header span { font-size: 10px; font-weight: 800; }
.agent-team-strip > header span i { margin-inline-end: 5px; color: var(--color-brand); }
.agent-team-strip > header small { display: block; margin-top: 2px; color: var(--color-text-muted); font-size: 8px; }
.agent-team-strip > header em {
  display: inline-flex; align-items: center; gap: 5px; color: var(--color-status-success-fg); font-size: 8px; font-style: normal; font-weight: 800;
}
.agent-team-strip > header em i { width: 6px; height: 6px; border-radius: 50%; background: #10b981; }
.agent-team-strip > div { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 7px; }
.agent-team-strip article {
  position: relative; display: grid; grid-template-columns: 27px minmax(0, 1fr); align-items: center; gap: 7px;
  min-width: 0; padding: 7px 8px; border: 1px solid var(--color-border); border-radius: 9px; opacity: .5;
}
.agent-team-strip article.active {
  opacity: 1; border-color: color-mix(in srgb, var(--color-brand) 55%, var(--color-border));
  background: color-mix(in srgb, var(--color-brand) 7%, var(--color-bg-card));
}
.agent-team-strip article.done { opacity: .9; border-color: #a7f3d0; }
.agent-team-strip article > span {
  display: grid; width: 27px; height: 27px; place-items: center; border-radius: 8px;
  color: var(--color-brand); background: color-mix(in srgb, var(--color-brand) 10%, transparent); font-size: 13px;
}
.agent-team-strip article strong, .agent-team-strip article small {
  display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.agent-team-strip article strong { font-size: 8.8px; }
.agent-team-strip article small { margin-top: 2px; color: var(--color-text-muted); font-size: 7px; }
.handoff-arrow { position: absolute; z-index: 2; inset-inline-end: -8px; color: var(--color-brand); font-size: 9px; }
.ops-grid { display: grid; grid-template-columns: 230px minmax(min(100%, 420px), 1fr) 300px; min-height: 570px; }
.execution-note, .execution-error {
  display: flex; align-items: center; gap: 7px; margin: 0; padding: 8px 20px;
  border-bottom: 1px solid var(--color-border); font-size: 9.5px;
}
.execution-note { color: var(--color-status-success-fg); background: var(--color-status-success-bg); }
.execution-error { color: var(--color-status-danger-fg); background: var(--color-status-danger-bg); }
.execution-blocked {
  display: flex; align-items: center; gap: 7px; margin: 0; padding: 8px 20px;
  border-bottom: 1px solid #fde68a; color: var(--color-status-warning-fg); background: var(--color-status-warning-bg); font-size: 9.5px;
}
.task-rail, .execution-rail { padding: 15px; background: color-mix(in srgb, var(--color-bg-hover) 60%, var(--color-bg-card)); }
.task-rail { border-inline-end: 1px solid var(--color-border); }
.execution-rail { border-inline-start: 1px solid var(--color-border); }
.rail-title { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; font-size: 11px; font-weight: 800; }
.rail-title em { padding: 2px 7px; border-radius: 999px; color: var(--color-brand); background: color-mix(in srgb, var(--color-brand) 10%, transparent); font-style: normal; }
.execution-session {
  display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-bottom: 10px; padding: 8px;
  border: 1px solid var(--color-border); border-radius: 9px; background: var(--color-bg-card);
}
.execution-session span, .execution-session strong { display: block; }
.execution-session span { margin-bottom: 2px; color: var(--color-text-muted); font-size: 7px; }
.execution-session strong { overflow: hidden; font-size: 8px; text-overflow: ellipsis; white-space: nowrap; }
.task-card {
  width: 100%; display: grid; grid-template-columns: 28px minmax(0, 1fr) 16px; align-items: center; gap: 8px;
  margin-bottom: 8px; padding: 10px; border: 1px solid transparent; border-radius: 11px;
  text-align: start; color: var(--color-text-primary); background: transparent; cursor: pointer; font-family: inherit;
}
.task-card:hover, .task-card.active { border-color: color-mix(in srgb, var(--color-brand) 35%, var(--color-border)); background: var(--color-bg-card); }
.task-card.active { box-shadow: inset 3px 0 var(--color-brand); }
.task-status { display: grid; width: 26px; height: 26px; place-items: center; border-radius: 8px; color: var(--color-brand); background: color-mix(in srgb, var(--color-brand) 10%, transparent); }
.task-card > span:nth-child(2) { min-width: 0; }
.task-card strong, .task-card small { display: block; }
.task-card strong { overflow: hidden; margin-bottom: 3px; font-size: 11.5px; text-overflow: ellipsis; white-space: nowrap; }
.task-card small { overflow: hidden; color: var(--color-text-muted); font-size: 9.5px; text-overflow: ellipsis; white-space: nowrap; }
.rail-facts { margin-top: 18px; padding-top: 12px; border-top: 1px solid var(--color-border); }
.rail-facts div { margin-bottom: 11px; }
.rail-facts span, .rail-facts strong { display: block; }
.rail-facts span { margin-bottom: 3px; color: var(--color-text-muted); font-size: 9px; }
.rail-facts strong { font-size: 10.5px; line-height: 1.4; }
.system-stage { min-width: 0; background: var(--color-bg-card); }
.browser-chrome {
  display: grid; grid-template-columns: 62px 1fr auto; align-items: center; gap: 9px;
  padding: 8px 12px; border-bottom: 1px solid var(--color-border); background: var(--color-bg-hover);
}
.traffic-lights { display: flex; gap: 5px; }
.traffic-lights i { width: 8px; height: 8px; border-radius: 50%; background: #fb7185; }
.traffic-lights i:nth-child(2) { background: #fbbf24; }
.traffic-lights i:nth-child(3) { background: #34d399; }
.address { overflow: hidden; padding: 6px 10px; border-radius: 7px; color: #64748b; background: #fff; font-size: 9.5px; text-overflow: ellipsis; white-space: nowrap; }
.live-badge { color: #0f766e; font-size: 8px; font-weight: 800; letter-spacing: .08em; }
.live-badge i { display: inline-block; width: 6px; height: 6px; margin-right: 4px; border-radius: 50%; background: #10b981; }
.system-toolbar { display: flex; justify-content: space-between; align-items: center; padding: 14px 16px 10px; }
.system-toolbar span, .system-toolbar strong { display: block; }
.system-toolbar span { color: var(--color-text-muted); font-size: 9px; }
.system-toolbar strong { margin-top: 2px; font-size: 13px; }
.system-toolbar .agent-control { padding: 5px 8px; border-radius: 7px; color: #2563eb; background: var(--color-status-info-bg); font-size: 9px; font-weight: 700; }
.metric-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; padding: 0 16px 12px; }
.metric-row article { padding: 10px; border: 1px solid var(--color-border); border-radius: 10px; background: var(--color-bg-primary); }
.metric-row span, .metric-row strong { display: block; }
.metric-row span { margin-bottom: 5px; color: var(--color-text-muted); font-size: 9px; }
.metric-row strong { font-size: 14px; }
.metric-row .good strong { color: #059669; }
.metric-row .warn strong { color: #d97706; }
.metric-row .danger strong { color: #dc2626; }
.system-content { padding: 0 16px 16px; }
.agent-action {
  display: flex; align-items: center; gap: 11px; min-height: 72px; padding: 12px;
  border: 1px solid #bfdbfe; border-radius: 12px; background: linear-gradient(100deg, var(--color-status-info-bg), #fff);
}
.agent-action.guard { border-color: #fde68a; background: linear-gradient(100deg, var(--color-status-warning-bg), #fff); }
.agent-action.write { border-color: #c4b5fd; background: linear-gradient(100deg, #f5f3ff, #fff); }
.agent-action.completed { border-color: #a7f3d0; background: linear-gradient(100deg, var(--color-status-success-bg), #fff); }
.agent-action.completed .agent-cursor { background: #059669; }
.agent-action.idle { border-style: dashed; border-color: var(--color-border); background: var(--color-bg-primary); }
.agent-cursor { display: grid; width: 34px; height: 34px; flex: 0 0 auto; place-items: center; border-radius: 10px; color: #fff; background: #2563eb; box-shadow: 0 7px 16px rgba(37, 99, 235, .25); }
.agent-action.guard .agent-cursor { background: #d97706; }
.agent-action.idle .agent-cursor { background: #64748b; }
.agent-action div { flex: 1; min-width: 0; }
.agent-action small, .agent-action strong, .agent-action p { display: block; }
.agent-action small { margin-bottom: 3px; color: #2563eb; font-size: 8px; font-weight: 800; letter-spacing: .06em; }
.agent-action strong { font-size: 12px; }
.agent-action p { margin: 3px 0 0; color: #64748b; font-size: 9.5px; line-height: 1.4; }
.agent-action > em { padding: 5px 7px; border-radius: 7px; color: #0f766e; background: #ccfbf1; font-size: 8px; font-style: normal; white-space: nowrap; }
.inline-start-button {
  display: inline-flex; flex: 0 0 auto; align-items: center; justify-content: center; gap: 5px;
  min-height: 34px; padding: 0 13px; border: 0; border-radius: 9px;
  color: #fff; background: linear-gradient(135deg, var(--color-brand), #4f46e5);
  box-shadow: 0 7px 16px color-mix(in srgb, var(--color-brand) 24%, transparent);
  font: 700 10px/1 inherit; cursor: pointer; white-space: nowrap;
}
.inline-start-button:hover:not(:disabled) { transform: translateY(-1px); filter: brightness(1.04); }
.inline-start-button:disabled { cursor: not-allowed; opacity: .45; box-shadow: none; }
.agent-narration {
  margin-top: 9px; padding: 9px 10px; border: 1px solid var(--color-border); border-radius: 10px;
  background: color-mix(in srgb, var(--color-bg-primary) 84%, #0f172a);
}
.agent-narration header { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.agent-narration header span { color: var(--color-text-primary); font-size: 9px; font-weight: 800; }
.agent-narration header span i { margin-inline-end: 4px; color: var(--color-brand); }
.agent-narration header em {
  color: var(--color-text-muted); font-size: 7.5px; font-style: normal; letter-spacing: .04em;
}
.domain-rule {
  margin: 5px 0 7px; padding-bottom: 6px; border-bottom: 1px dashed var(--color-border);
  color: var(--color-text-muted); font-size: 8px; line-height: 1.45;
}
.agent-narration ol { display: grid; gap: 3px; margin: 0; padding: 0; list-style: none; }
.agent-narration li {
  display: grid; grid-template-columns: 22px 1fr; gap: 6px; align-items: start;
  padding: 5px 6px; border-radius: 7px; opacity: .42;
}
.agent-narration li.active {
  opacity: 1; background: color-mix(in srgb, var(--color-brand) 8%, transparent);
  box-shadow: inset 2px 0 var(--color-brand);
}
.agent-narration li.done { opacity: .78; }
.narration-index {
  display: grid; width: 20px; height: 20px; place-items: center; border-radius: 6px;
  color: var(--color-text-muted); background: var(--color-bg-hover); font-size: 7.5px; font-weight: 800;
}
.agent-narration li.active .narration-index { color: #fff; background: var(--color-brand); }
.agent-narration li.done .narration-index { color: var(--color-status-success-fg); background: var(--color-status-success-bg); }
.agent-narration li p { margin: 0; color: var(--color-text-muted); font-size: 8px; line-height: 1.45; }
.agent-narration li p + p { margin-top: 2px; }
.agent-narration li b {
  display: inline-block; min-width: 28px; margin-inline-end: 4px;
  color: var(--color-text-secondary); font-size: 7.5px;
}
.agent-narration li.active p { color: var(--color-text-secondary); }
.agent-narration li.active b { color: var(--color-brand); }
.result-list { margin-top: 10px; opacity: .48; filter: saturate(.35); transition: opacity .25s, filter .25s; }
.result-list.revealed { opacity: 1; filter: none; }
.result-list article { display: grid; grid-template-columns: 7px 1fr auto; align-items: center; gap: 9px; padding: 9px 7px; border-bottom: 1px solid var(--color-border); }
.row-indicator { width: 6px; height: 28px; border-radius: 999px; background: #94a3b8; }
.row-indicator.good { background: #10b981; }
.row-indicator.warn { background: #f59e0b; }
.row-indicator.danger { background: #ef4444; }
.result-list strong, .result-list p { display: block; }
.result-list strong { font-size: 10.5px; }
.result-list p { margin: 2px 0 0; color: var(--color-text-muted); font-size: 8.8px; line-height: 1.35; }
.result-list em { color: var(--color-text-secondary); font-size: 9px; font-style: normal; font-weight: 800; }
.result-list em.good { color: #059669; }
.result-list em.warn { color: #d97706; }
.result-list em.danger { color: #dc2626; }
.progress-track { height: 4px; overflow: hidden; margin-bottom: 15px; border-radius: 999px; background: var(--color-border); }
.progress-track i { display: block; height: 100%; border-radius: inherit; background: var(--color-brand); transition: width .25s; }
.step-list { margin: 0; padding: 0; list-style: none; }
.step-list li { display: grid; grid-template-columns: 28px 1fr; gap: 8px; position: relative; padding-bottom: 13px; opacity: .48; }
.step-list li::after { content: ''; position: absolute; left: 13px; top: 27px; bottom: 0; width: 1px; background: var(--color-border); }
.step-list li:last-child::after { display: none; }
.step-list li.active, .step-list li.done { opacity: 1; }
.step-dot { z-index: 1; display: grid; width: 26px; height: 26px; place-items: center; border: 1px solid var(--color-border); border-radius: 50%; color: var(--color-text-muted); background: var(--color-bg-card); font-size: 10px; }
.step-list li.active .step-dot { border-color: var(--color-brand); color: #fff; background: var(--color-brand); box-shadow: 0 0 0 4px color-mix(in srgb, var(--color-brand) 12%, transparent); }
.step-list li.done .step-dot { border-color: #10b981; color: #fff; background: #10b981; }
.step-list strong { display: block; padding-top: 2px; font-size: 10px; }
.step-list p { margin: 3px 0; color: var(--color-text-muted); font-size: 8.8px; line-height: 1.35; }
.step-list small { color: var(--color-text-muted); font-size: 8px; }
.step-list small em { margin-left: 5px; padding: 2px 4px; border-radius: 4px; color: var(--color-status-warning-fg); background: var(--color-status-warning-bg); font-style: normal; }
.step-agent {
  display: inline-flex; align-items: center; gap: 4px; margin-top: 4px; padding: 2px 5px;
  border-radius: 5px; color: var(--color-brand); background: color-mix(in srgb, var(--color-brand) 9%, transparent);
  font-size: 7.5px; font-weight: 700;
}
.step-evidence {
  display: block; overflow: hidden; margin-top: 4px; color: var(--color-status-success-fg) !important;
  text-overflow: ellipsis; white-space: nowrap;
}
.safety-note { display: flex; gap: 8px; margin-top: 6px; padding: 9px; border-radius: 9px; color: var(--color-status-success-fg); background: var(--color-status-success-bg); font-size: 8.5px; line-height: 1.45; }
.safety-note strong { display: block; font-size: 9px; }
.spin { animation: ops-spin 1s linear infinite; }
@keyframes ops-spin { to { transform: rotate(360deg); } }
@container settings-panel (max-width: 1120px) {
  .capability-chain { grid-template-columns: repeat(3, 1fr); }
  .agent-team-strip > div { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .chain-arrow { display: none; }
  .ops-grid { grid-template-columns: 210px 1fr; }
  .execution-rail { grid-column: 1 / -1; border-top: 1px solid var(--color-border); border-inline-start: 0; }
  .step-list { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
  .step-list li::after { display: none; }
}
@container settings-panel (max-width: 760px) {
  .ops-header { align-items: flex-start; flex-direction: column; }
  .platform-flow > header { align-items: flex-start; flex-direction: column; }
  .run-meta { justify-content: flex-start; flex-wrap: wrap; }
  .capability-chain { grid-template-columns: 1fr 1fr; }
  .agent-team-strip > div { grid-template-columns: 1fr 1fr; }
  .ops-grid { display: block; }
  .task-rail { border-inline-end: 0; border-bottom: 1px solid var(--color-border); }
  .step-list { grid-template-columns: 1fr; }
}
</style>
