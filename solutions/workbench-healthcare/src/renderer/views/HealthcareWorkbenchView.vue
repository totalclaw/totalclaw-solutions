<template>
  <div class="workbench healthcare-workbench" :dir="isRtl ? 'rtl' : 'ltr'">
    <header class="hero">
      <PageBackButton />
      <div class="hero-copy">
        <div class="eyebrow">{{ $t('智慧医院工作台') }}</div>
        <h1>{{ $t('智慧医院运营协同中心') }}</h1>
        <p>{{ $t('由患者服务、隐私保护、院内运营和质量复核 Agent 协同操作 HIS，并完整展示每一步执行过程。') }}</p>
      </div>
      <div class="hero-actions">
        <button class="button secondary" type="button" :disabled="statusLoading" @click="loadStatus">
          <i :class="statusLoading ? 'ri-loader-4-line spin' : 'ri-refresh-line'"></i>
          {{ statusLoading ? $t('正在检查…') : $t('刷新状态') }}
        </button>
      </div>
    </header>

    <!-- 解决方案工作台硬规则：分步骤 + 进度条 sticky 常驻视口 -->
    <WorkbenchStepBar v-model="step" :steps="stepDefs" />

    <template v-if="step === 1">
      <AutomationOpsConsole domain="healthcare" :execute="executeHealthcareAutomation" @status="onAutomationStatus" />

      <div class="capability-console-heading">
        <span>{{ $t('底层工具') }}</span>
        <strong>{{ $t('患者服务、院内运营、敏感信息保护与人工复核') }}</strong>
      </div>

      <section class="panel status-panel">
        <div class="section-heading">
          <div>
            <span class="section-kicker">{{ $t('状态与边界') }}</span>
            <h2>{{ $t('合规基础能力') }}</h2>
          </div>
          <span :class="['status-pill', statusTone]">
            <i class="ri-checkbox-blank-circle-fill"></i>
            {{ statusLabel }}
          </span>
        </div>

        <div v-if="statusError" class="message error" role="alert">
          <i class="ri-error-warning-line"></i>
          <span>{{ statusError }}</span>
        </div>

        <div class="status-grid">
          <article v-for="card in statusCards" :key="card.id" class="status-card">
            <div :class="['status-card-icon', card.available ? 'available' : 'unknown']">
              <i :class="card.icon"></i>
            </div>
            <div>
              <strong>{{ $t(card.label) }}</strong>
              <p>{{ $t(card.description) }}</p>
              <span :class="['mini-status', card.available ? 'available' : 'unknown']">
                {{ card.available ? $t('已连接') : $t('待确认') }}
              </span>
            </div>
            <details v-if="card.detail">
              <summary>{{ $t('查看原始状态') }}</summary>
              <pre>{{ card.detail }}</pre>
            </details>
          </article>
        </div>
      </section>
    </template>

    <nav v-if="step > 1" class="workbench-tabs" :aria-label="$t('医疗工作台功能')">
      <button type="button" :class="{ active: step === 2 }" @click="step = 2">
        <i class="ri-shield-user-line"></i>
        {{ $t('PHI 脱敏') }}
      </button>
      <button type="button" :class="{ active: step === 3 }" @click="step = 3">
        <i class="ri-user-follow-line"></i>
        {{ $t('人工复核') }}
        <span v-if="pendingCount" class="count-badge">{{ pendingCount }}</span>
      </button>
      <button type="button" :class="{ active: step === 4 }" @click="step = 4">
        <i class="ri-file-history-line"></i>
        {{ $t('审计导出') }}
      </button>
    </nav>

    <section v-if="step === 2" class="panel workspace-panel">
      <div class="section-heading">
        <div>
          <span class="section-kicker">{{ $t('敏感信息保护') }}</span>
          <h2>{{ $t('患者信息可逆脱敏') }}</h2>
          <p>{{ $t('在内容进入后续模型流程前先替换敏感信息；本页不会把脱敏结果解释成医疗结论。') }}</p>
        </div>
      </div>

      <div class="two-column">
        <form class="form-card" @submit.prevent="maskPhi">
          <label class="field">
            <span>{{ $t('待脱敏文本') }}</span>
            <textarea
              v-model="maskText"
              rows="11"
              :placeholder="$t('粘贴需要处理的患者文本。请只使用已获授权的数据。')"
            ></textarea>
          </label>
          <div class="privacy-note">
            <i class="ri-lock-2-line"></i>
            <span>{{ $t('脱敏会返回会话标识和替换后的文本；请按机构制度管理该会话标识。') }}</span>
          </div>
          <div class="form-actions">
            <button class="button secondary" type="button" @click="loadMaskSample">
              <i class="ri-flask-line"></i>
              {{ $t('载入示例文本') }}
            </button>
            <button class="button primary" type="submit" :disabled="maskBusy">
              <i :class="maskBusy ? 'ri-loader-4-line spin' : 'ri-shield-keyhole-line'"></i>
              {{ maskBusy ? $t('正在脱敏…') : $t('执行脱敏') }}
            </button>
          </div>
        </form>

        <div class="result-card">
          <div class="result-title">
            <strong>{{ $t('脱敏结果') }}</strong>
            <span v-if="maskResult?.sessionId">{{ $t('已建立可逆会话') }}</span>
          </div>
          <div v-if="maskError" class="message error" role="alert">{{ maskError }}</div>
          <template v-else-if="maskResult">
            <div class="result-block">
              <label>{{ $t('替换后的文本') }}</label>
              <pre>{{ maskResult.maskedText || formattedMaskResult }}</pre>
            </div>
            <dl class="result-meta">
              <div v-if="maskResult.sessionId">
                <dt>{{ $t('脱敏会话标识') }}</dt>
                <dd>{{ maskResult.sessionId }}</dd>
              </div>
              <div v-if="maskResult.stats">
                <dt>{{ $t('替换统计') }}</dt>
                <dd>{{ formatValue(maskResult.stats) }}</dd>
              </div>
            </dl>
          </template>
          <div v-else class="empty-state">
            <i class="ri-shield-user-line"></i>
            <p>{{ $t('真实脱敏结果会显示在这里。') }}</p>
          </div>
        </div>
      </div>
    </section>

    <section v-else-if="step === 3" class="panel workspace-panel">
      <div class="section-heading review-heading">
        <div>
          <span class="section-kicker">{{ $t('双人复核') }}</span>
          <h2>{{ $t('提交、审批与拒绝') }}</h2>
          <p>{{ $t('提交人与复核人必须是不同人员。未通过人工复核的高风险动作不得进入后续执行。') }}</p>
        </div>
        <div class="tenant-controls">
          <label>
            <span>{{ $t('机构标识') }}</span>
            <input v-model="tenantId" type="text" :placeholder="$t('例如：hospital-riyadh-01')" />
          </label>
          <label>
            <span>{{ $t('列表状态') }}</span>
            <select v-model="reviewFilter" @change="loadReviews">
              <option value="">{{ $t('全部') }}</option>
              <option value="pending">{{ $t('待复核') }}</option>
              <option value="approved">{{ $t('已通过') }}</option>
              <option value="rejected">{{ $t('已拒绝') }}</option>
            </select>
          </label>
          <button class="button secondary compact" type="button" :disabled="reviewsLoading" @click="loadReviews">
            <i :class="reviewsLoading ? 'ri-loader-4-line spin' : 'ri-refresh-line'"></i>
            {{ $t('刷新列表') }}
          </button>
        </div>
      </div>

      <div v-if="reviewsError" class="message error" role="alert">
        <i class="ri-error-warning-line"></i>
        <span>{{ reviewsError }}</span>
      </div>
      <div v-if="reviewNotice" class="message success" role="status">
        <i class="ri-checkbox-circle-line"></i>
        <div class="message-markdown" v-html="renderMarkdown(reviewNotice)"></div>
      </div>

      <div class="review-layout">
        <form class="form-card submit-card" @submit.prevent="submitReview">
          <div class="card-title">
            <i class="ri-send-plane-line"></i>
            <div>
              <strong>{{ $t('提交新的复核项') }}</strong>
              <p>{{ $t('只提交动作摘要与必要的结构化上下文，不在这里执行实际动作。') }}</p>
            </div>
          </div>
          <label class="field">
            <span>{{ $t('动作类型') }}</span>
            <input v-model="submitForm.actionType" type="text" :placeholder="$t('例如：operations.service_dispatch')" />
          </label>
          <label class="field">
            <span>{{ $t('提交人') }}</span>
            <input v-model="submitForm.maker" type="text" :placeholder="$t('人员标识')" />
          </label>
          <label class="field">
            <span>{{ $t('复核摘要') }}</span>
            <textarea v-model="submitForm.summary" rows="3" :placeholder="$t('说明动作目的、风险与需要确认的内容')"></textarea>
          </label>
          <label class="field">
            <span>{{ $t('机构标识') }}</span>
            <input v-model="tenantId" type="text" />
          </label>
          <label class="field">
            <span>{{ $t('动作上下文（JSON）') }}</span>
            <textarea v-model="submitForm.payloadText" rows="6" spellcheck="false"></textarea>
          </label>
          <div class="form-actions">
            <button class="button secondary" type="button" :disabled="reviewSubmitting" @click="loadReviewSample">
              <i class="ri-flask-line"></i>
              {{ $t('载入示例复核项') }}
            </button>
            <button class="button primary" type="submit" :disabled="reviewSubmitting">
              <i :class="reviewSubmitting ? 'ri-loader-4-line spin' : 'ri-send-plane-2-line'"></i>
              {{ reviewSubmitting ? $t('正在提交…') : $t('提交人工复核') }}
            </button>
          </div>
        </form>

        <div class="review-list">
          <div class="review-list-toolbar">
            <div>
              <strong>{{ $t('复核队列') }}</strong>
              <span>{{ $t('共 {count} 项', { count: reviewItems.length }) }}</span>
            </div>
            <label class="checker-field">
              <span>{{ $t('当前复核人') }}</span>
              <input v-model="decisionChecker" type="text" :placeholder="$t('必须与提交人不同')" />
            </label>
          </div>

          <article v-for="item in reviewItems" :key="reviewItemId(item)" class="review-item">
            <header>
              <div>
                <span :class="['review-status', reviewStatusClass(item.status)]">
                  {{ reviewStatusLabel(item.status) }}
                </span>
                <strong>{{ $t(item.summary || item.actionType || $t('未命名复核项')) }}</strong>
              </div>
              <time>{{ formatDate(item.tsCreated) }}</time>
            </header>
            <div class="review-facts">
              <span><b>{{ $t('动作') }}</b>{{ $t(item.actionType || '—') }}</span>
              <span><b>{{ $t('提交人') }}</b>{{ $t(item.maker || '—') }}</span>
              <span><b>{{ $t('复核人') }}</b>{{ $t(item.checker || '—') }}</span>
            </div>
            <details v-if="item.payload && Object.keys(item.payload).length">
              <summary>{{ $t('查看动作上下文') }}</summary>
              <pre>{{ formatValue(item.payload) }}</pre>
            </details>
            <p v-if="item.reason" class="decision-reason">
              <i class="ri-information-line"></i>{{ $t(item.reason) }}
            </p>
            <div v-if="item.status === 'pending'" class="decision-box">
              <input
                v-model="decisionReasons[reviewItemId(item)]"
                type="text"
                :placeholder="$t('填写审批意见或拒绝原因')"
              />
              <button
                class="button approve compact"
                type="button"
                :disabled="decisionBusyId === reviewItemId(item)"
                @click="decideReview(item, true)"
              >
                <i class="ri-check-line"></i>{{ $t('通过') }}
              </button>
              <button
                class="button reject compact"
                type="button"
                :disabled="decisionBusyId === reviewItemId(item)"
                @click="decideReview(item, false)"
              >
                <i class="ri-close-line"></i>{{ $t('拒绝') }}
              </button>
            </div>
          </article>

          <div v-if="!reviewsLoading && !reviewItems.length" class="empty-state review-empty">
            <i class="ri-inbox-archive-line"></i>
            <p>{{ $t('当前筛选条件下没有复核项。') }}</p>
          </div>
          <div v-if="reviewsLoading" class="empty-state review-empty">
            <i class="ri-loader-4-line spin"></i>
            <p>{{ $t('正在加载复核队列…') }}</p>
          </div>
        </div>
      </div>
    </section>

    <section v-else-if="step === 4" class="panel workspace-panel">
      <div class="section-heading">
        <div>
          <span class="section-kicker">{{ $t('合规留痕') }}</span>
          <h2>{{ $t('机构审计流水导出') }}</h2>
          <p>{{ $t('按机构标识导出真实审计 JSONL，供内部稽核、合规检查和事件追溯使用。') }}</p>
        </div>
      </div>

      <div class="audit-layout">
        <form class="form-card" @submit.prevent="exportAudit">
          <label class="field">
            <span>{{ $t('机构标识') }}</span>
            <input v-model="tenantId" type="text" :placeholder="$t('例如：hospital-riyadh-01')" />
          </label>
          <div class="privacy-note">
            <i class="ri-file-shield-2-line"></i>
            <span>{{ $t('审计文件可能包含操作人员与动作元数据，请按机构的数据分级制度保存。') }}</span>
          </div>
          <button class="button primary" type="submit" :disabled="auditBusy">
            <i :class="auditBusy ? 'ri-loader-4-line spin' : 'ri-download-2-line'"></i>
            {{ auditBusy ? $t('正在导出…') : $t('导出审计 JSONL') }}
          </button>
        </form>

        <div class="result-card audit-result">
          <div class="result-title">
            <strong>{{ $t('最近一次导出') }}</strong>
            <span v-if="auditResult">{{ $t('{count} 行', { count: auditResult.lineCount || 0 }) }}</span>
          </div>
          <div v-if="auditError" class="message error" role="alert">{{ auditError }}</div>
          <template v-else-if="auditResult">
            <pre>{{ auditResult.auditJsonl || $t('审计流水为空') }}</pre>
            <button class="button secondary compact" type="button" @click="downloadAudit">
              <i class="ri-save-3-line"></i>
              {{ $t('保存到下载目录') }}
            </button>
          </template>
          <div v-else class="empty-state">
            <i class="ri-file-history-line"></i>
            <p>{{ $t('导出的审计流水会显示在这里，并可保存为文件。') }}</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import PageBackButton from '../components/PageBackButton.vue';
import WorkbenchStepBar, { type WorkbenchStep } from '../components/WorkbenchStepBar.vue';
import { useNotificationStore } from '../stores/notification';
import { t as i18nT } from '../i18n';
import { humanizeErrorMessage } from '../utils/humanize';
import { renderMarkdown } from '../utils/markdown';
import AutomationOpsConsole from '../components/AutomationOpsConsole.vue';
import type {
  AutomationExecutionContext,
  AutomationStepReporter,
} from '../workbenches/automationExecution';
import { workflowOutput, workflowRunId } from '../workbenches/workflowResult';

type ReviewItem = {
  id?: string;
  actionType?: string;
  payload?: Record<string, unknown>;
  summary?: string;
  maker?: string;
  checker?: string | null;
  amount?: number;
  status?: string;
  reason?: string;
  tsCreated?: number;
  tsDecided?: number | null;
};

type StatusCard = {
  id: string;
  label: string;
  description: string;
  icon: string;
  available: boolean;
  detail: string;
};

const { locale } = useI18n();
const router = useRouter();
const isRtl = computed(() => locale.value === 'ar');

/** 工作台步骤：1 状态与边界 / 2 PHI 脱敏 / 3 人工复核 / 4 审计导出（解决方案工作台硬规则：分步骤） */
const step = ref(1);
const notif = useNotificationStore();
const statusLoading = ref(false);
const statusError = ref('');
const statusResponse = ref<any>(null);

const statusLabel = computed(() => {
  if (statusLoading.value) return i18nT('检查中');
  if (statusError.value) return i18nT('不可用');
  if (statusResponse.value?.ok) return i18nT('服务已连接');
  return i18nT('尚未检查');
});

const statusTone = computed(() => {
  if (statusLoading.value) return 'loading';
  if (statusError.value) return 'danger';
  if (statusResponse.value?.ok) return 'success';
  return 'neutral';
});

const statusCards = computed<StatusCard[]>(() => {
  const status = statusResponse.value;
  const connected = status?.ok === true;
  return [
    {
      id: 'compliance',
      label: i18nT('合规服务'),
      description: i18nT('为人工复核和审计留痕提供基础状态。'),
      icon: 'ri-scales-3-line',
      available: connected && status.compliance != null,
      detail: status?.compliance ? formatValue(status.compliance) : '',
    },
    {
      id: 'masking',
      label: i18nT('PHI 脱敏服务'),
      description: i18nT('对患者敏感信息执行真实的可逆替换。'),
      icon: 'ri-shield-keyhole-line',
      available: connected && status.masking != null,
      detail: status?.masking ? formatValue(status.masking) : '',
    },
    {
      id: 'residency',
      label: i18nT('数据驻留检查'),
      description: i18nT('展示服务端返回的数据驻留检查状态。'),
      icon: 'ri-map-pin-shield-line',
      available: connected && status.residency != null,
      detail: status?.residency ? formatValue(status.residency) : '',
    },
    {
      id: 'humanDecision',
      label: i18nT('人工终审'),
      description: i18nT('所有高风险结果必须由人决定，不由模型自动通过。'),
      icon: 'ri-user-follow-line',
      available: status?.boundary?.finalDecisionRequiresHuman === true,
      detail: status?.boundary ? formatValue(status.boundary) : '',
    },
  ];
});

const maskText = ref('');
const maskBusy = ref(false);
const maskError = ref('');
const maskResult = ref<any>(null);
const formattedMaskResult = computed(() => maskResult.value ? formatValue(maskResult.value) : '');

const tenantId = ref('');
const reviewFilter = ref('');
const reviewItems = ref<ReviewItem[]>([]);
const reviewsLoading = ref(false);
const reviewsError = ref('');
const reviewNotice = ref('');
const reviewSubmitting = ref(false);
const decisionChecker = ref('');
const decisionBusyId = ref('');
const decisionReasons = reactive<Record<string, string>>({});
const submitForm = reactive({
  actionType: '',
  maker: '',
  summary: '',
  amount: 0,
  payloadText: '{}',
});

const pendingCount = computed(() => reviewItems.value.filter((item) => item.status === 'pending').length);

const auditBusy = ref(false);
const auditError = ref('');
const auditResult = ref<{ auditJsonl?: string; lineCount?: number; tenantId?: string } | null>(null);

const stepDefs = computed<WorkbenchStep[]>(() => [
  { id: 1, label: i18nT('状态与边界'), sub: statusResponse.value?.ok ? i18nT('合规能力已连接') : i18nT('待检查'), done: Boolean(statusResponse.value?.ok) },
  { id: 2, label: i18nT('PHI 脱敏'), sub: maskResult.value ? i18nT('已建立可逆会话') : i18nT('待处理文本'), done: Boolean(maskResult.value) },
  { id: 3, label: i18nT('人工复核'), sub: i18nT('待复核 {n} 项', { n: pendingCount.value }), done: reviewItems.value.length > 0 },
  { id: 4, label: i18nT('审计导出'), sub: auditResult.value ? i18nT('{n} 行已导出', { n: auditResult.value.lineCount || 0 }) : i18nT('未导出'), done: Boolean(auditResult.value) },
]);

function loadMaskSample(): void {
  maskText.value = [
    i18nT('预约人张同学，手机号 13800001234，申请改期并需要无障碍协助。'),
    i18nT('同行家属李女士，联系方式 +971501234567，邮箱 {email}。', { email: 'li.demo@example.com' }),
    i18nT('OpenMRS ID: 100HWA，本次就诊为报告领取，不含诊疗内容。'),
  ].join('\n');
  maskError.value = '';
  maskResult.value = null;
}

/** 场景执行台状态回报：真实运行完成后刷新复核队列（复核项由自动化流程写入） */
function onAutomationStatus(status: string): void {
  if (status !== 'completed') return;
  notif.success(i18nT('自动化任务已完成，复核项已进入队列'));
  void loadReviews();
}

function loadReviewSample(): void {
  tenantId.value = 'hospital-riyadh-sample';
  submitForm.actionType = 'operations.service_dispatch';
  submitForm.maker = 'hospital-ops-agent';
  submitForm.summary = i18nT('示例：复核一项已脱敏的院内服务工单分派，不包含诊断、治疗或金融内容');
  submitForm.amount = 0;
  submitForm.payloadText = JSON.stringify({
    workOrderRef: 'OPS-SAMPLE-2026-001',
    location: 'Building B / Floor 3',
    serviceType: 'bed-turnover',
    evidence: ['source_event_preserved', 'identity_masked', 'sla_checked'],
  }, null, 2);
  decisionChecker.value = 'hospital-duty-manager';
  reviewNotice.value = i18nT('已填入虚构示例数据；点击提交后会进入真实复核队列。');
}

function healthcareApi(): any {
  return (window as any).electronAPI?.workbenches?.healthcare;
}

const OPENMRS_BROWSER_CONTEXT = 'healthcare-openmrs-live';
// 本地官方 OpenMRS Reference Application + MySQL 数据卷。
// 避免公网演示站清理数据或 TLS 抖动，确保“登记 → 搜索 → 打开档案”可重复验证。
const OPENMRS_DEMO_ROOT = 'http://127.0.0.1:8088/openmrs';
const OPENMRS_LOGIN_URL = `${OPENMRS_DEMO_ROOT}/login.htm`;
const OPENMRS_LOGOUT_URL = `${OPENMRS_DEMO_ROOT}/appui/header/logout.action?successUrl=openmrs`;
const OPENMRS_HOME_URL = `${OPENMRS_DEMO_ROOT}/referenceapplication/home.page`;
const OPENMRS_REGISTER_URL = `${OPENMRS_DEMO_ROOT}/registrationapp/registerPatient.page?appId=referenceapplication.registrationapp.registerPatient`;
const OPENMRS_PATIENT_SEARCH_URL = `${OPENMRS_DEMO_ROOT}/coreapps/findpatient/findPatient.page?app=coreapps.findPatient`;
const OPENMRS_ACTIVE_VISITS_URL = `${OPENMRS_DEMO_ROOT}/coreapps/activeVisits.page?app=coreapps.activeVisits`;
const OPENMRS_APPOINTMENTS_URL = `${OPENMRS_DEMO_ROOT}/appointmentschedulingui/home.page`;
const OPENMRS_MANAGE_APPOINTMENTS_URL = `${OPENMRS_DEMO_ROOT}/coreapps/findpatient/findPatient.page?app=appointmentschedulingui.schedulingAppointmentApp&`;
const OPENMRS_DAILY_APPOINTMENTS_URL = `${OPENMRS_DEMO_ROOT}/appointmentschedulingui/dailyScheduledAppointments.page`;
const OPENMRS_APPOINTMENT_REQUESTS_URL = `${OPENMRS_DEMO_ROOT}/appointmentschedulingui/appointmentRequests.page`;
const OPENMRS_REPORTS_URL = `${OPENMRS_DEMO_ROOT}/reportingui/reportsapp/home.page`;
const OPENMRS_STEP_DWELL_MS = 1_800;
const OPENMRS_NAVIGATION_TIMEOUT_MS = 20_000;
let activeHealthcareContext: AutomationExecutionContext | undefined;
let activeHealthcareBrowserTabId = '';

type OpenMrsDemoPatient = {
  givenName: string;
  familyName: string;
  fullName: string;
  identifier: string;
  patientUrl: string;
  persisted: boolean;
  registrationEvidence: string;
};

type HealthcareBrowserState = {
  url: string;
  text: string;
  loading: boolean;
  readyState: string;
};

function healthcareBrowserTabsApi(): any {
  const tabs = (window as any).electronAPI?.browserTabs;
  if (!tabs?.create || !tabs?.command) {
    throw new Error(i18nT('内置浏览器自动操作接口不可用'));
  }
  return tabs;
}

function healthcareBrowserCommandValue(response: any): unknown {
  if (response?.success === false) {
    throw new Error(String(response?.error || i18nT('OpenMRS 页面操作失败')));
  }
  const raw = response?.data?.result;
  if (typeof raw !== 'string') return raw ?? response?.data ?? response;
  const trimmed = raw.trim();
  if (!trimmed) return '';
  if (/^(?:true|false|null|-?\d+(?:\.\d+)?|\{|\[)/.test(trimmed)) {
    try { return JSON.parse(trimmed); } catch { /* keep original text */ }
  }
  return raw;
}

async function healthcareBrowserCommand(command: string, args: string[] = []): Promise<unknown> {
  const response = await healthcareBrowserTabsApi().command({
    contextId: OPENMRS_BROWSER_CONTEXT,
    command,
    args,
  });
  return healthcareBrowserCommandValue(response);
}

async function healthcareBrowserEval(expression: string): Promise<unknown> {
  return healthcareBrowserCommand('eval', [expression]);
}

function healthcareBrowserPause(ms = 650): Promise<void> {
  const signal = activeHealthcareContext?.signal;
  if (!signal) return new Promise((resolve) => window.setTimeout(resolve, ms));
  signal.throwIfAborted();
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => {
      signal.removeEventListener('abort', onAbort);
      resolve();
    }, ms);
    const onAbort = () => {
      window.clearTimeout(timer);
      reject(new DOMException(i18nT('医疗自动化已由人工接管'), 'AbortError'));
    };
    signal.addEventListener('abort', onAbort, { once: true });
  });
}

async function healthcareBrowserOpen(url: string, dwellMs = 1_200): Promise<void> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const tabs = healthcareBrowserTabsApi();
      const navigation = activeHealthcareBrowserTabId && tabs.navigate
        ? tabs.navigate(activeHealthcareBrowserTabId, url)
        : healthcareBrowserCommand('open', [url]);
      await new Promise((resolve, reject) => {
        const timer = window.setTimeout(() => {
          reject(new Error(i18nT('OpenMRS 本地服务在 {seconds} 秒内没有响应', {
            seconds: Math.round(OPENMRS_NAVIGATION_TIMEOUT_MS / 1_000),
          })));
        }, OPENMRS_NAVIGATION_TIMEOUT_MS);
        void Promise.resolve(navigation).then(
          (value) => {
            window.clearTimeout(timer);
            resolve(value);
          },
          (error) => {
            window.clearTimeout(timer);
            reject(error);
          },
        );
      });
      await healthcareBrowserPause(dwellMs);
      return;
    } catch (error) {
      lastError = error;
      if (activeHealthcareBrowserTabId) {
        try { await healthcareBrowserTabsApi().stop?.(activeHealthcareBrowserTabId); } catch { /* retry below */ }
      }
      if (attempt < 3) await healthcareBrowserPause(700 * attempt);
    }
  }
  throw lastError instanceof Error ? lastError : new Error(String(lastError || 'OpenMRS open failed'));
}

async function waitForHealthcareBrowser(
  predicate: (state: HealthcareBrowserState) => boolean,
  description: string,
  timeoutMs = 30_000,
): Promise<HealthcareBrowserState> {
  const deadline = Date.now() + timeoutMs;
  let state: HealthcareBrowserState = {
    url: '',
    text: '',
    loading: true,
    readyState: '',
  };
  while (Date.now() < deadline) {
    activeHealthcareContext?.throwIfCancelled();
    let page: any;
    try {
      page = await healthcareBrowserEval(`(() => {
        const visible = (el) => {
          const style = getComputedStyle(el);
          const rect = el.getBoundingClientRect();
          return style.display !== 'none'
            && style.visibility !== 'hidden'
            && Number(style.opacity || 1) > 0
            && rect.width > 8
            && rect.height > 8;
        };
        const selectors = [
          '.loading', '.loader', '.spinner', '.loading-overlay', '.loading-container',
          '.spinner-container', '.fa-spinner', '.fa-circle-o-notch',
          '[class*="loading"]', '[class*="loader"]', '[class*="spinner"]',
          '[aria-busy="true"]'
        ];
        const loading = [...document.querySelectorAll(selectors.join(','))]
          .some((el) => visible(el));
        return JSON.stringify({
          url: location.href,
          text: (document.body?.innerText || '').replace(/\\s+/g, ' ').slice(0, 4000),
          loading,
          readyState: document.readyState
        });
      })()`) as any;
    } catch {
      // 登录、退出和模块跳转会销毁旧页面的 JS 上下文；等待新页面接管后重试。
      await healthcareBrowserPause(400);
      continue;
    }
    state = {
      url: String(page?.url || ''),
      text: String(page?.text || ''),
      loading: page?.loading === true,
      readyState: String(page?.readyState || ''),
    };
    if (state.readyState === 'complete' && !state.loading && predicate(state)) return state;
    await healthcareBrowserPause(400);
  }
  throw new Error(i18nT('右侧 OpenMRS 未完成{description}加载，当前页面：{url}', {
    description,
    url: state.url || 'unknown',
  }));
}

async function healthcareBrowserSetValue(selectors: string[], value: string): Promise<void> {
  const deadline = Date.now() + 15_000;
  while (Date.now() < deadline) {
    const changed = await healthcareBrowserEval(`(() => {
      const selectors = ${JSON.stringify(selectors)};
      const el = selectors.map((selector) => document.querySelector(selector)).find(Boolean);
      if (!el) return false;
      el.scrollIntoView({block:'center', inline:'center'});
      el.focus();
      const value = ${JSON.stringify(value)};
      const proto = el.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
      const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
      if (setter) setter.call(el, value); else el.value = value;
      el.dispatchEvent(new InputEvent('input', {bubbles:true, inputType:'insertText', data:value}));
      el.dispatchEvent(new KeyboardEvent('keyup', {bubbles:true, key:value.slice(-1) || 'a'}));
      el.dispatchEvent(new Event('change', {bubbles:true}));
      if (globalThis.jQuery) {
        globalThis.jQuery(el).trigger('input').trigger('keyup').trigger('change');
      }
      return true;
    })()`);
    if (changed === true) {
      await healthcareBrowserPause(350);
      return;
    }
    await healthcareBrowserPause(350);
  }
  throw new Error(i18nT('OpenMRS 页面缺少预期输入项'));
}

async function healthcareBrowserClickByText(labels: string[]): Promise<boolean> {
  const clicked = await healthcareBrowserEval(`(() => {
    const labels = ${JSON.stringify(labels)}.map((item) => item.toLowerCase());
    const candidates = [...document.querySelectorAll('button, a, input[type="submit"], [role="button"]')];
    const el = candidates.find((item) => {
      const value = item instanceof HTMLInputElement ? item.value : item.textContent;
      const text = (value || '').trim().replace(/\\s+/g, ' ').toLowerCase();
      return labels.some((label) => text === label || text.includes(label));
    });
    if (!el) return false;
    el.scrollIntoView({block:'center', inline:'center'});
    el.click();
    return true;
  })()`);
  await healthcareBrowserPause(550);
  return clicked === true;
}

async function populateOpenMrsRegistration(patient: OpenMrsDemoPatient): Promise<void> {
  const result = await healthcareBrowserEval(`(() => {
    try {
    const values = ${JSON.stringify({
      givenName: '',
      familyName: '',
      birthdate: '1998-06-15',
      birthdateDay: '15',
      birthdateMonth: '6',
      birthdateYear: '1998',
      address1: 'TotalClaw Demo Street',
      address2: 'Demo Unit 1201',
      cityVillage: 'Dubai',
      stateProvince: 'Dubai',
      country: 'United Arab Emirates',
      postalCode: '00000',
      phoneNumber: '0500000000',
    })};
    values.givenName = ${JSON.stringify(patient.givenName)};
    values.familyName = ${JSON.stringify(patient.familyName)};
    const visible = (el) => {
      if (!el) return false;
      const style = getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      return style.display !== 'none' && style.visibility !== 'hidden'
        && rect.width > 8 && rect.height > 8;
    };
    const normalize = (value) => String(value || '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '');
    const selectedQuestion = globalThis.NavigatorController?.getQuestions?.()
      ?.find((question) => question?.isSelected);
    // 导航栏会同时显示 Name / Gender / Birthdate / Address / Phone Number，
    // 因此不能用整页文本判断当前步骤，只读取当前可见问题区域。
    const visibleQuestionText = [
      ...document.querySelectorAll(
        '#registration fieldset h3, #registration fieldset legend, #registration fieldset label,'
        + ' #registration div[id] > h3, #registration div[id] > legend, #registration div[id] > label'
      ),
    ]
      .filter((el) => visible(el))
      .map((el) => el.textContent || '')
      .join(' ')
      .replace(/\\s+/g, ' ');
    const visibleQuestionId = [
      selectedQuestion?.id || '',
      ...document.querySelectorAll('#registration fieldset[id], #registration div[id]'),
    ]
      .map((el) => typeof el === 'string' ? el : el)
      .filter((el) => typeof el === 'string'
        ? Boolean(el)
        : visible(el) && el.querySelector('input, select, textarea'))
      .map((el) => typeof el === 'string' ? el : el.id || '')
      .join(' ');
    const stageText = visibleQuestionId + ' ' + visibleQuestionText;
    let stage = /patient'?s address|what is the patient'?s address|person.?address|contact.?info.?address/i.test(stageText)
      ? 'address'
      : /phone number|telephone|mobile number|phone.?number/i.test(stageText)
        ? 'phone'
        : /patient'?s name|what is the patient'?s name|demographics.?name/i.test(stageText)
          ? 'name'
          : /birthdate|date of birth|demographics.?birthdate/i.test(stageText)
            ? 'birthdate'
            : /gender|sex|demographics.?gender/i.test(stageText)
              ? 'gender'
              : 'other';
    const navigatorControls = (selectedQuestion?.fields || [])
      .map((field) => field?.element?.[0])
      .filter(Boolean);
    const controls = (navigatorControls.length > 0
      ? navigatorControls
      : [...document.querySelectorAll('input, select, textarea')])
      .filter((el) => {
        if (!visible(el)) return false;
        if (el instanceof HTMLInputElement) {
          return !['hidden', 'button', 'submit', 'reset', 'image'].includes(el.type);
        }
        return true;
      })
      .sort((a, b) => {
        const aRect = a.getBoundingClientRect();
        const bRect = b.getBoundingClientRect();
        return Math.abs(aRect.top - bRect.top) > 8
          ? aRect.top - bRect.top
          : aRect.left - bRect.left;
      });
    // 文本主题或翻译变化时，以当前可见控件的真实绑定名为准。
    // 这个判定不依赖左侧导航文案，也不会把隐藏步骤算进来。
    const visibleBindingText = controls.map((el) => [
      el.getAttribute('name'),
      el.id,
      el.getAttribute('ng-model'),
      el.getAttribute('data-field'),
    ].filter(Boolean).join(' ')).join(' ');
    if (stage === 'other') {
      if (/address1|address2|cityVillage|stateProvince|postalCode|personAddress/i.test(visibleBindingText)) {
        stage = 'address';
      } else if (/phoneNumber|telephone|mobileNumber|personAttribute.*phone/i.test(visibleBindingText)) {
        stage = 'phone';
      } else if (/givenName|familyName|middleName|personName/i.test(visibleBindingText)) {
        stage = 'name';
      } else if (/birthdate|birthDay|birthMonth|birthYear/i.test(visibleBindingText)) {
        stage = 'birthdate';
      } else if (/gender|sex/i.test(visibleBindingText)) {
        stage = 'gender';
      }
    }
    const used = new Set();
    const filled = [];
    const skippedControls = [];
    const setControl = (el, value, allowHidden = false) => {
      try {
        if (!el || (!allowHidden && !visible(el))) return false;
        if (el instanceof HTMLSelectElement) {
          const option = [...el.options].find((item) =>
            item.value.toLowerCase() === String(value).toLowerCase()
            || item.text.toLowerCase() === String(value).toLowerCase());
          const setter = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value')?.set;
          if (setter) setter.call(el, option?.value || String(value));
          else el.value = option?.value || String(value);
        } else {
          // exactControl 用 [name=] / getElementById 取元素，可能命中 OpenMRS 的包裹 div、
          // span 之类非表单节点。此时若拿 HTMLInputElement.prototype 的 value setter 去
          // setter.call(el) 会抛 TypeError: Illegal invocation —— 而本函数在 forEach 里，
          // 一个元素炸掉就中止整段注入脚本，后续步骤全不执行（表现为演示停在半路）。
          if (!(el instanceof HTMLInputElement) && !(el instanceof HTMLTextAreaElement)) return false;
          el.focus();
          const proto = el instanceof HTMLTextAreaElement
            ? HTMLTextAreaElement.prototype
            : HTMLInputElement.prototype;
          const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
          if (setter) setter.call(el, String(value));
          else el.value = String(value);
          el.dispatchEvent(new KeyboardEvent('keydown', {bubbles:true, key:String(value).slice(-1)}));
          el.dispatchEvent(new KeyboardEvent('keypress', {bubbles:true, key:String(value).slice(-1)}));
        }
        el.dispatchEvent(new InputEvent('input', {bubbles:true, inputType:'insertText', data:String(value)}));
        if (!(el instanceof HTMLSelectElement)) {
          el.dispatchEvent(new KeyboardEvent('keyup', {bubbles:true, key:String(value).slice(-1)}));
        }
        el.dispatchEvent(new Event('change', {bubbles:true}));
        el.dispatchEvent(new Event('blur', {bubbles:true}));
        if (globalThis.jQuery) {
          globalThis.jQuery(el).trigger('input').trigger('change').trigger('keyup').trigger('blur');
        }
        used.add(el);
        return true;
      } catch (err) {
        // 单个控件填充失败不该带走整轮演示：记下跳过，让后续步骤继续跑完。
        skippedControls.push((el && (el.name || el.id)) || 'unknown');
        return false;
      }
    };
    const exactControl = (name) => [
      document.querySelector('[name="' + name + '"]'),
      document.getElementById(name),
      document.querySelector('#registration [id$="-' + name + '"]'),
    ].find(Boolean);
    // OpenMRS Navigator 会把尚未展示和已经完成的问题同时保留在表单 DOM 中。
    // 进入向导后先按后端真正接收的字段名把整份虚构患者表单预填好；后续每一步
    // 仍会对当前可见控件触发事件和复核。这样不会再因为拿到上一步的控件而让
    // Address / Phone 看起来是空的，却被误判为已经填过。
    const prefilled = [];
    [
      ['givenName', values.givenName],
      ['familyName', values.familyName],
      ['birthdateDay', values.birthdateDay],
      ['birthdateMonth', values.birthdateMonth],
      ['birthdateYear', values.birthdateYear],
      ['address1', values.address1],
      ['address2', values.address2],
      ['cityVillage', values.cityVillage],
      ['stateProvince', values.stateProvince],
      ['country', values.country],
      ['postalCode', values.postalCode],
      ['phoneNumber', values.phoneNumber],
    ].forEach(([name, value]) => {
      const el = exactControl(name);
      if (setControl(el, value, true)) prefilled.push(name);
    });
    const controlSignature = (el) => {
      const id = el.id || '';
      const label = id
        ? document.querySelector('label[for="' + CSS.escape(id) + '"]')?.textContent || ''
        : '';
      // OpenMRS 每个地址控件都包在独立的 <p> 中。不要把整个 fieldset
      // 文本并入签名，否则 Address、City、Country 会互相误识别。
      const container = el.closest('p, .form-field, .field, .form-group, td, li');
      return normalize([
        el.getAttribute('name'),
        id,
        el.getAttribute('placeholder'),
        el.getAttribute('aria-label'),
        el.getAttribute('ng-model'),
        el.getAttribute('data-field'),
        label,
        container?.textContent?.slice(0, 180),
      ].filter(Boolean).join(' '));
    };
    const aliases = {
      givenName: ['givenname', 'firstname'],
      familyName: ['familyname', 'lastname', 'surname'],
      birthdate: ['birthdate', 'dateofbirth'],
      birthdateDay: ['birthdateday', 'birthday', 'day'],
      birthdateMonth: ['birthdatemonth', 'birthmonth', 'month'],
      birthdateYear: ['birthdateyear', 'birthyear', 'year'],
      address1: ['address1', 'addressline1', 'streetaddress'],
      address2: ['address2', 'addressline2'],
      cityVillage: ['cityvillage', 'city', 'village'],
      stateProvince: ['stateprovince', 'province', 'state'],
      country: ['country'],
      postalCode: ['postalcode', 'zipcode', 'zip'],
      phoneNumber: ['phonenumber', 'telephone', 'mobile', 'phone'],
    };
    const findControl = (name) => {
      const selectors = [
        '[name="' + name + '"]',
        '#' + name,
        '#fr' + name.charAt(0).toUpperCase() + name.slice(1),
        '[data-field="' + name + '"] input',
        '[data-field="' + name + '"] select',
        '[ng-model*="' + name + '"]'
      ];
      const direct = selectors
        .map((selector) => document.querySelector(selector))
        .find((item) => visible(item) && !used.has(item));
      if (direct) return direct;
      const keys = aliases[name] || [name];
      /**
       * 「估算年龄」两个框（birthdateYears / birthdateMonths）要的是数字岁数（上限 120），
       * 绝不能收生日。但模糊兜底是子串匹配：'birthdate' 命中 birthdateYears，
       * 'birthdateyear' 更是 birthdateYears 的前缀 —— 实测把 '1998-06-15' 填了进去，
       * OpenMRS 报 "Must be a number Maximum: 120"，整条注册流程卡死。
       * 除非调用方要的就是这两个字段本身，否则一律跳过。
       */
      const wantsEstimated = /years|months/i.test(name);
      return controls.find((el) => {
        if (used.has(el)) return false;
        const signature = controlSignature(el);
        if (!wantsEstimated && /birthdateyears|birthdatemonths|estimated/.test(signature)) return false;
        return keys.some((key) => signature.includes(normalize(key)));
      });
    };
    const stageFields = {
      name: ['givenName', 'familyName'],
      // 不填聚合的 birthdate：那是 OpenMRS 由 Day/Month/Year 自己算出来的隐藏字段，
      // 直接填不但多余，还会被模糊兜底错绑到可见的「估算年龄」框上。
      birthdate: ['birthdateDay', 'birthdateMonth', 'birthdateYear'],
      address: ['address1', 'address2', 'cityVillage', 'stateProvince', 'country', 'postalCode'],
      phone: ['phoneNumber'],
      gender: [],
      other: [],
    };
    (stageFields[stage] || []).forEach((name) => {
      const value = values[name];
      const el = findControl(name);
      if (setControl(el, value)) filled.push(name);
    });

    // OpenMRS Registration App 会为地址问卷生成动态 name/id。若字段语义无法从
    // 属性中识别，就按该步骤稳定的可视顺序填充，避免空表单仍被点击“下一步”。
    if (stage === 'address') {
      const addressControls = controls.filter((el) =>
        !used.has(el)
        && !(el instanceof HTMLInputElement && ['radio', 'checkbox'].includes(el.type)));
      const addressOrder = [
        ['address1', values.address1],
        ['address2', values.address2],
        ['cityVillage', values.cityVillage],
        ['stateProvince', values.stateProvince],
        ['country', values.country],
        ['postalCode', values.postalCode],
      ];
      addressOrder.forEach(([name, value], index) => {
        if (filled.includes(name)) return;
        const el = findControl(name) || addressControls.find((item) => !used.has(item))
          || addressControls[index];
        if (setControl(el, value)) filled.push(name);
      });
    }

    if (stage === 'phone' && !filled.includes('phoneNumber')) {
      const phone = controls.find((el) =>
        !used.has(el)
        && (!(el instanceof HTMLInputElement) || ['text', 'tel', 'number'].includes(el.type)));
      if (setControl(phone, values.phoneNumber)) filled.push('phoneNumber');
    }

    const gender = [
      document.querySelector('input[name="gender"][value="M"]'),
      document.querySelector('#gender-field'),
      document.querySelector('input[value="Male"]')
    ].find((item) => visible(item));
    if (gender instanceof HTMLInputElement) {
      gender.checked = true;
      gender.dispatchEvent(new Event('change', {bubbles:true}));
    } else if (gender instanceof HTMLSelectElement) {
      setControl(gender, 'M');
    }
    return {
      ok: true,
      stage,
      filled,
      visibleControlCount: controls.length,
      prefilled,
      visibleQuestionId,
      visibleQuestionText: visibleQuestionText.slice(0, 400),
      addressReady: stage !== 'address'
        || ['address1', 'address2', 'cityVillage', 'stateProvince', 'country', 'postalCode']
          .some((name) => /\\S/.test(String(exactControl(name)?.value || ''))),
      phoneReady: stage !== 'phone'
        || /\\S/.test(String(
          exactControl('phoneNumber')?.value
          || controls.find((el) => /phone|telephone|mobile/i.test(controlSignature(el)))?.value
          || ''
        )),
    };
    } catch (error) {
      return {ok:false, error:String(error?.stack || error)};
    }
  })()`);
  if (!result || typeof result !== 'object' || (result as any).ok !== true) {
    throw new Error(i18nT('OpenMRS 字段填充失败：{error}', {
      error: String((result as any)?.error || 'unknown registration script error'),
    }));
  }
  const semanticSnapshot = await healthcareBrowserCommand('snapshot') as any;
  const semanticText = String(semanticSnapshot?.snapshot || '');
  /**
   * 步骤判定以注入脚本按【当前可见控件绑定名】算出的 stage 为准。
   *
   * 不能只看整页快照：OpenMRS 向导的左侧导航常驻列出所有步骤名
   * （Demographics / Name / Gender / Birthdate / Contact Info / Address / Phone Number / …），
   * 于是在 Gender 步就会命中 /phone number/ 被误判成电话步，接着去找可填文本框——
   * 那一步只有 gender 下拉，直接抛「电话页没有可填写字段」，演示死在这里。
   * 仅当脚本自己也判不出（other）时，才退回整页文本匹配。
   */
  const detectedStage = String((result as any)?.stage || 'other');
  const isAddressStage = detectedStage === 'address'
    || (detectedStage === 'other'
      && /what is the patient'?s address|person\.address|city\/village/i.test(semanticText));
  const isPhoneStage = !isAddressStage
    && (detectedStage === 'phone'
      || (detectedStage === 'other'
        && /phone number|telephone|mobile number/i.test(semanticText)));
  if (isAddressStage) {
    (result as any).stage = 'address';
    const addressValues = [
      'TotalClaw Demo Street',
      'Demo Unit 1201',
      'Dubai',
      'Dubai',
      'United Arab Emirates',
      '00000',
    ];
    for (let index = 0; index < addressValues.length; index += 1) {
      const snapshot = await healthcareBrowserCommand('snapshot') as any;
      const fields = (Array.isArray(snapshot?.refs) ? snapshot.refs : [])
        .filter((item: any) =>
          !item?.disabled
          && ['text', 'tel', 'number', 'textbox'].includes(String(item?.role || '').toLowerCase()));
      const target = fields[index];
      if (!target?.ref) {
        throw new Error(i18nT('OpenMRS 地址页只识别到 {count} 个可填写字段，已停止继续', {
          count: String(fields.length),
        }));
      }
      await healthcareBrowserCommand('fill', [String(target.ref), addressValues[index]!]);
      await healthcareBrowserPause(160);
    }
    const verified = await healthcareBrowserCommand('snapshot') as any;
    const snapshotText = String(verified?.snapshot || '');
    (result as any).addressReady = addressValues
      .every((value) => snapshotText.includes(value));
  }
  if (isPhoneStage) {
    (result as any).stage = 'phone';
    const phone = (Array.isArray(semanticSnapshot?.refs) ? semanticSnapshot.refs : [])
      .find((item: any) =>
        !item?.disabled
        && ['text', 'tel', 'number', 'textbox'].includes(String(item?.role || '').toLowerCase()));
    if (!phone?.ref) throw new Error(i18nT('OpenMRS 电话页没有可填写字段'));
    await healthcareBrowserCommand('fill', [String(phone.ref), '0500000000']);
    const verified = await healthcareBrowserCommand('snapshot') as any;
    (result as any).phoneReady = String(verified?.snapshot || '').includes('0500000000');
  }
  if ((result as any).addressReady === false) {
    throw new Error(i18nT('OpenMRS 地址步骤未成功写入字段，已停止继续点击，避免产生空登记'));
  }
  if ((result as any).phoneReady === false) {
    throw new Error(i18nT('OpenMRS 电话步骤未成功写入字段，已停止继续点击，避免产生空登记'));
  }
}

async function advanceOpenMrsRegistration(): Promise<boolean> {
  const advanced = await healthcareBrowserEval(`(() => {
    const visible = (el) => {
      const style = getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      return style.display !== 'none' && style.visibility !== 'hidden'
        && Number(style.opacity || 1) > 0 && rect.width > 8 && rect.height > 8;
    };
    const candidates = [...document.querySelectorAll(
      '#next-button, #submit, button, input[type="button"], input[type="submit"], a.confirm'
    )].filter(visible);
    const text = (el) => (
      el instanceof HTMLInputElement ? el.value : el.textContent
    ).trim().replace(/\\s+/g, ' ').toLowerCase();
    const exactPriority = ['next', 'confirm', 'register patient', 'save', 'submit'];
    const target = candidates.find((el) => el.id === 'next-button')
      || exactPriority.map((label) => candidates.find((el) => text(el) === label)).find(Boolean)
      || candidates.find((el) => /^(next|confirm|register patient|save|submit)\\b/.test(text(el)));
    if (!target) return false;
    target.scrollIntoView({block:'center', inline:'center'});
    target.click();
    return true;
  })()`);
  if (advanced === true) await healthcareBrowserPause(1_400);
  return advanced === true;
}

async function submitOpenMrsRegistration(): Promise<boolean> {
  const snapshot = await healthcareBrowserCommand('snapshot') as any;
  const refs = Array.isArray(snapshot?.refs) ? snapshot.refs : [];
  const target = refs.find((item: any) =>
    String(item?.role || '').toLowerCase() === 'button'
    && String(item?.name || '').trim().toLowerCase() === 'confirm');
  if (!target?.ref) return false;
  await healthcareBrowserCommand('click', [String(target.ref)]);
  await healthcareBrowserPause(1_400);
  return true;
}

function createOpenMrsDemoPatient(): OpenMrsDemoPatient {
  const stamp = `${String(new Date().getUTCMonth() + 1).padStart(2, '0')}${String(new Date().getUTCDate()).padStart(2, '0')}${String(Date.now()).slice(-5)}`;
  const givenName = `TCDemo${stamp}`;
  const familyName = 'Patient';
  return {
    givenName,
    familyName,
    fullName: `${givenName} ${familyName}`,
    identifier: '',
    patientUrl: '',
    persisted: false,
    registrationEvidence: '',
  };
}

async function resolveOpenMrsPatientViaRest(patient: OpenMrsDemoPatient): Promise<boolean> {
  const result = await healthcareBrowserEval(`(async () => {
    try {
      const response = await fetch(
        '/openmrs/ws/rest/v1/patient?q='
          + encodeURIComponent(${JSON.stringify(patient.fullName)})
          + '&v=full',
        {credentials: 'same-origin', headers: {'Accept': 'application/json'}}
      );
      const payload = await response.json();
      const expectedGiven = ${JSON.stringify(patient.givenName.toLowerCase())};
      const expectedFamily = ${JSON.stringify(patient.familyName.toLowerCase())};
      const match = (payload?.results || []).find((item) =>
        (item?.person?.names || []).some((name) =>
          String(name?.givenName || '').toLowerCase() === expectedGiven
          && String(name?.familyName || '').toLowerCase() === expectedFamily));
      return {
        found: Boolean(response.ok && match?.uuid),
        uuid: String(match?.uuid || ''),
        identifier: String(match?.identifiers?.[0]?.identifier || ''),
      };
    } catch (error) {
      return {found:false, uuid:'', identifier:'', error:String(error)};
    }
  })()`) as any;
  if (!result?.found || !result?.uuid) return false;
  patient.identifier = String(result.identifier || '');
  patient.patientUrl = `${OPENMRS_DEMO_ROOT}/coreapps/clinicianfacing/patient.page?patientId=${encodeURIComponent(String(result.uuid))}`;
  patient.persisted = true;
  return true;
}

async function hydrateOpenMrsPatientIdentifier(patient: OpenMrsDemoPatient): Promise<void> {
  if (patient.identifier) return;
  const encodedUuid = patient.patientUrl.match(/[?&]patientId=([^&#]+)/i)?.[1];
  if (!encodedUuid) return;
  const patientUuid = decodeURIComponent(encodedUuid);
  const result = await healthcareBrowserEval(`(async () => {
    try {
      const response = await fetch(
        '/openmrs/ws/rest/v1/patient/' + encodeURIComponent(${JSON.stringify(patientUuid)}) + '?v=full',
        {credentials: 'same-origin', headers: {'Accept': 'application/json'}}
      );
      const payload = await response.json();
      return {
        ok: response.ok,
        identifier: String(payload?.identifiers?.[0]?.identifier || ''),
      };
    } catch (error) {
      return {ok:false, identifier:'', error:String(error)};
    }
  })()`) as any;
  if (result?.ok && result?.identifier) patient.identifier = String(result.identifier);
}

async function persistOpenMrsPatientViaRest(patient: OpenMrsDemoPatient): Promise<void> {
  const result = await healthcareBrowserEval(`(async () => {
    try {
      const identifierResponse = await fetch('/openmrs/ws/rest/v1/idgen/identifiersource', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          generateIdentifiers: true,
          sourceUuid: '691eed12-c0f1-11e2-94be-8c13b969e334',
          numberToGenerate: 1,
        }),
      });
      const identifierPayload = await identifierResponse.json();
      const generatedIdentifier = identifierPayload?.identifiers?.[0];
      if (!identifierResponse.ok || !generatedIdentifier) {
        return {
          ok: false,
          status: identifierResponse.status,
          payload: {},
          error: JSON.stringify(identifierPayload).slice(0, 500),
        };
      }
      const response = await fetch('/openmrs/ws/rest/v1/patient?v=full', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          person: {
            names: [{
              givenName: ${JSON.stringify(patient.givenName)},
              familyName: ${JSON.stringify(patient.familyName)},
              preferred: true,
            }],
            gender: 'M',
            birthdate: '1998-06-15T00:00:00.000+0000',
            addresses: [{
              address1: 'TotalClaw Demo Street',
              cityVillage: 'Dubai',
              stateProvince: 'Dubai',
              country: 'United Arab Emirates',
              postalCode: '00000',
              preferred: true,
            }],
            attributes: [],
          },
          identifiers: [{
            identifier: generatedIdentifier,
            identifierType: '05a29f94-c0ed-11e2-94be-8c13b969e334',
            location: '6351fcf4-e311-4a19-90f9-35667d99a8af',
            preferred: true,
          }],
        }),
      });
      const text = await response.text();
      let payload = {};
      try { payload = text ? JSON.parse(text) : {}; } catch {}
      return {
        ok: response.ok,
        status: response.status,
        payload,
        identifier: generatedIdentifier,
        error: response.ok ? '' : text.slice(0, 500),
      };
    } catch (error) {
      return {ok:false, status:0, payload:{}, error:String(error?.stack || error)};
    }
  })()`) as any;
  if (!result?.ok || !result?.payload?.uuid) {
    throw new Error(i18nT('OpenMRS REST 持久化失败（HTTP {status}）：{error}', {
      status: String(result?.status || 0),
      error: String(result?.error || 'patient uuid missing'),
    }));
  }
  patient.identifier = String(
    result.payload?.identifiers?.[0]?.identifier
    || result.identifier,
  );
  patient.patientUrl = `${OPENMRS_DEMO_ROOT}/coreapps/clinicianfacing/patient.page?patientId=${encodeURIComponent(String(result.payload.uuid))}`;
  patient.persisted = true;
}

async function registerOpenMrsDemoPatient(
  reportStep?: AutomationStepReporter,
): Promise<OpenMrsDemoPatient> {
  const patient = createOpenMrsDemoPatient();
  await healthcareBrowserOpen(OPENMRS_REGISTER_URL);
  await waitForHealthcareBrowser(
    ({ url, text }) => /registrationapp\/registerPatient\.page/i.test(url)
      && /Register a patient|patient'?s name|Demographics/i.test(text),
    i18nT('患者登记模块'),
  );
  reportStep?.(1, i18nT('已打开 Register a patient，正在录入本次演示专用虚构患者'), {
    actor: i18nT('患者服务 Agent'),
    actorId: 'patient-service',
    actorType: 'agent',
    tool: 'OpenMRS Registration',
    evidence: `${OPENMRS_REGISTER_URL} · ${patient.fullName}`,
  });

  let finalState: HealthcareBrowserState | null = null;
  for (let step = 0; step < 12; step += 1) {
    activeHealthcareContext?.throwIfCancelled();
    await populateOpenMrsRegistration(patient);
    // 给演示观众留出时间看清 Agent 刚写入的当前步骤字段，再进入下一题。
    await healthcareBrowserPause(900);
    const state = await healthcareBrowserEval(`JSON.stringify({
      url: location.href,
      text: (document.body?.innerText || '').replace(/\\s+/g, ' ').slice(0, 5000),
      readyState: document.readyState
    })`) as any;
    const currentUrl = String(state?.url || '');
    if (/coreapps\/clinicianfacing\/patient\.page\?patientId=/i.test(currentUrl)) {
      finalState = {
        url: currentUrl,
        text: String(state?.text || ''),
        loading: false,
        readyState: String(state?.readyState || ''),
      };
      break;
    }
    if (/Confirm submission\?/i.test(String(state?.text || ''))) {
      const submitted = await submitOpenMrsRegistration();
      if (!submitted) throw new Error(i18nT('OpenMRS 患者登记确认按钮不可用'));
      reportStep?.(1, i18nT('已在确认页提交虚构患者；正在等待本地 OpenMRS 与 MySQL 返回保存结果'), {
        actor: i18nT('患者服务 Agent'),
        actorId: 'patient-service',
        actorType: 'agent',
        tool: 'OpenMRS Registration submit',
        evidence: `${patient.fullName} · confirmation submitted`,
      });
      const saveDeadline = Date.now() + 12_000;
      while (Date.now() < saveDeadline) {
        await healthcareBrowserPause(700);
        const saved = await healthcareBrowserEval(`JSON.stringify({
          url: location.href,
          text: (document.body?.innerText || '').replace(/\\s+/g, ' ').slice(0, 5000),
          readyState: document.readyState
        })`) as any;
        if (/coreapps\/clinicianfacing\/patient\.page\?patientId=/i.test(String(saved?.url || ''))) {
          finalState = {
            url: String(saved?.url || ''),
            text: String(saved?.text || ''),
            loading: false,
            readyState: String(saved?.readyState || ''),
          };
          break;
        }
      }
      break;
    }
    const advanced = await advanceOpenMrsRegistration();
    if (!advanced) {
      const pageText = String(state?.text || '');
      const errors = pageText.match(/(?:required|please enter|invalid)[^.]{0,140}/gi)?.join(' · ');
      throw new Error(errors || i18nT('OpenMRS 患者登记页未找到下一步或确认按钮'));
    }
  }

  if (!finalState) {
    // 保存状态未确认时，不先把用户带到一个必然空结果的搜索页。
    // 先在同一登录会话中确认落库；未落库则写入，之后再进行可见搜索回读。
    const alreadyPersisted = await resolveOpenMrsPatientViaRest(patient);
    if (!alreadyPersisted) await persistOpenMrsPatientViaRest(patient);
    const verification = await searchAndOpenRegisteredPatient(patient);
    if (!verification.matchedCreated) {
      throw new Error(i18nT('OpenMRS 已返回患者 UUID，但患者检索仍无法回读本次新建档案'));
    }
    patient.patientUrl = verification.state.url || patient.patientUrl;
    patient.registrationEvidence = alreadyPersisted
      ? `${patient.patientUrl} · ${patient.identifier || patient.fullName} · registration verified by patient search`
      : `${patient.patientUrl} · ${patient.identifier} · browser session REST fallback verified by patient search`;
    reportStep?.(1, alreadyPersisted
      ? i18nT('虚构患者已保存；Agent 已从患者检索页回读并打开同一档案')
      : i18nT('登记向导未发出保存请求；Agent 已在同一登录浏览器会话调用 OpenMRS 接口写入，并从患者检索页回读确认'), {
      actor: i18nT('患者服务 Agent'),
      actorId: 'patient-service',
      actorType: 'agent',
      tool: 'OpenMRS Registration + REST + Patient Search',
      evidence: patient.registrationEvidence,
    });
    await healthcareBrowserPause(OPENMRS_STEP_DWELL_MS);
    return patient;
  }
  patient.persisted = true;
  patient.patientUrl = finalState.url;
  patient.identifier = finalState.text.match(/\b(?:OpenMRS ID|Patient ID)\s*[:#]?\s*([A-Z0-9-]{4,})\b/i)?.[1] || '';
  await hydrateOpenMrsPatientIdentifier(patient);
  patient.registrationEvidence = `${patient.patientUrl} · ${patient.identifier || patient.fullName}`;
  reportStep?.(1, i18nT('虚构患者已登记；已从新档案页回读患者编号并保持同一浏览器会话'), {
    actor: i18nT('患者服务 Agent'),
    actorId: 'patient-service',
    actorType: 'agent',
    tool: 'OpenMRS Registration',
    evidence: patient.registrationEvidence,
  });
  await healthcareBrowserPause(OPENMRS_STEP_DWELL_MS);
  return patient;
}

async function searchAndOpenRegisteredPatient(
  patient: OpenMrsDemoPatient,
): Promise<{
  patient: OpenMrsDemoPatient;
  state: HealthcareBrowserState;
  matchedCreated: boolean;
  openedRecordSummary: string;
}> {
  await healthcareBrowserOpen(OPENMRS_PATIENT_SEARCH_URL);
  await waitForHealthcareBrowser(
    ({ url, text }) => /coreapps\/findpatient\/findPatient\.page/i.test(url)
      && /Search by ID or Name|Find Patient Record/i.test(text),
    i18nT('患者检索模块'),
  );
  await healthcareBrowserSetValue(
    ['#patient-search', 'input[placeholder="Search by ID or Name"]', 'input[placeholder*="Search by ID"]'],
    patient.identifier || patient.fullName,
  );
  let matchedCreated = true;
  try {
    await waitForHealthcareBrowser(
      ({ url, text }) => /coreapps\/findpatient\/findPatient\.page/i.test(url)
        && text.includes(patient.givenName)
        && text.includes(patient.familyName),
      i18nT('新登记患者检索结果'),
      10_000,
    );
  } catch {
    matchedCreated = false;
    const emptyResult = await healthcareBrowserEval(`JSON.stringify({
      url: location.href,
      text: (document.body?.innerText || '').replace(/\\s+/g, ' ').slice(0, 5000),
      tableText: ([...document.querySelectorAll('tbody tr')][0]?.textContent || 'No matching records found')
        .replace(/\\s+/g, ' ').trim(),
      readyState: document.readyState
    })`) as any;
    return {
      patient,
      state: {
        url: String(emptyResult?.url || OPENMRS_PATIENT_SEARCH_URL),
        text: String(emptyResult?.text || ''),
        loading: false,
        readyState: String(emptyResult?.readyState || 'complete'),
      },
      matchedCreated: false,
      openedRecordSummary: String(emptyResult?.tableText || 'No matching records found'),
    };
  }
  const rowText = await healthcareBrowserEval(`(() => {
    const given = ${JSON.stringify(patient.givenName)};
    const family = ${JSON.stringify(patient.familyName)};
    const rows = [...document.querySelectorAll('tbody tr, tr')]
      .filter((item) => item.querySelector('td'));
    const row = rows.find((item) => {
      const text = item.textContent || '';
      return text.includes(given) && text.includes(family);
    });
    return row ? (row.textContent || '').replace(/\\s+/g, ' ').trim() : '';
  })()`);
  if (!patient.identifier) {
    patient.identifier = String(rowText || '').match(/\b[A-Z0-9]{4,}(?:-[A-Z0-9]+)*\b/)?.[0] || '';
  }
  const opened = await healthcareBrowserEval(`(() => {
    const given = ${JSON.stringify(patient.givenName)};
    const family = ${JSON.stringify(patient.familyName)};
    const rows = [...document.querySelectorAll('tbody tr, tr')]
      .filter((item) => item.querySelector('td'));
    const row = rows.find((item) => {
      const text = item.textContent || '';
      return text.includes(given) && text.includes(family);
    });
    const target = row?.querySelector('a, button, [role="button"]') || row;
    if (!target) return false;
    target.scrollIntoView({block:'center'});
    target.click();
    return true;
  })()`);
  if (opened !== true) throw new Error(i18nT('OpenMRS 新登记患者记录入口未找到'));
  const patientState = await waitForHealthcareBrowser(
    ({ url }) => /coreapps\/clinicianfacing\/patient\.page\?patientId=/i.test(url),
    i18nT('患者服务记录'),
  );
  if (matchedCreated) patient.patientUrl = patientState.url;
  return {
    patient,
    state: patientState,
    matchedCreated,
    openedRecordSummary: String(rowText || ''),
  };
}

async function resetOpenMrsLoginState(
  reportStep?: AutomationStepReporter,
): Promise<void> {
  reportStep?.(0, i18nT('正在清理上一次 OpenMRS 演示的登录状态，准备从登录页完整开始'), {
    actor: i18nT('患者服务 Agent'),
    actorId: 'patient-service',
    actorType: 'agent',
    tool: 'OpenMRS Logout',
    evidence: OPENMRS_LOGOUT_URL,
  });

  await healthcareBrowserOpen(OPENMRS_LOGIN_URL, 900);
  // OpenMRS 的 Logout 链接挂在折叠的头部菜单里，innerText 取不到它（整页 innerText 才 300 字符），
  // 但页面确实已登录。只靠 /Logout/ 判「已登录」会让本步骤必然等到超时——表现为演示死在第一步、
  // 后续步骤全停在「等待执行器路由」。这里改用 innerText 里真实存在的「Logged in as … Registration Desk」，
  // 保留 Logout 分支作为其它皮肤的兜底。
  const openMrsLoggedIn = (text: string): boolean =>
    /Logged in as .*Registration Desk/i.test(text)
    || (/Logout/i.test(text) && /admin|Registration Desk/i.test(text));
  let state = await waitForHealthcareBrowser(
    ({ text }) => /Username|Password|Location for this session/i.test(text)
      || openMrsLoggedIn(text),
    i18nT('OpenMRS 登录状态'),
  );
  if (openMrsLoggedIn(state.text)) {
    const clicked = await healthcareBrowserEval(`(() => {
      const logout = [...document.querySelectorAll('a, button')]
        .find((item) => /logout/i.test((item.textContent || '').trim()));
      if (!logout) return false;
      logout.scrollIntoView({block:'center'});
      logout.click();
      return true;
    })()`);
    if (clicked !== true) throw new Error(i18nT('OpenMRS 已登录，但页面没有找到退出入口'));
    state = await waitForHealthcareBrowser(
      ({ url, text }) => /\/login\.htm/i.test(url)
        && /Username|Password|Location for this session/i.test(text),
      i18nT('退出后的登录页'),
    );
  }
  if (!/\/login\.htm/i.test(state.url)
      || !/Username|Password|Location for this session/i.test(state.text)) {
    throw new Error(i18nT('OpenMRS 登录状态清理后没有返回登录页，已停止本次演示'));
  }
  reportStep?.(0, i18nT('上一次登录状态已清除；右侧已回到 OpenMRS 登录页，将演示账号、密码和工作地点选择'), {
    actor: i18nT('患者服务 Agent'),
    actorId: 'patient-service',
    actorType: 'agent',
    tool: 'OpenMRS Login',
    evidence: state.url,
  });
  await healthcareBrowserPause(OPENMRS_STEP_DWELL_MS);
}

async function ensureOpenMrsLoggedIn(): Promise<void> {
  try {
    const existing = await healthcareBrowserEval(`JSON.stringify({
      url: location.href,
      text: (document.body?.innerText || '').replace(/\\s+/g, ' ').slice(0, 4000)
    })`) as any;
    const existingUrl = String(existing?.url || '');
    const existingText = String(existing?.text || '');
    const authenticatedSession = /(?:o2\.openmrs\.org|127\.0\.0\.1:8088)\/openmrs\//i.test(existingUrl)
      && !/\/login\.htm/i.test(existingUrl)
      && /Logout/i.test(existingText)
      && /admin|Registration Desk/i.test(existingText);
    if (authenticatedSession) {
      await healthcareBrowserOpen(OPENMRS_HOME_URL);
      await waitForHealthcareBrowser(
        ({ text }) => /Logged in as .*Registration Desk/i.test(text)
          && /Find Patient Record|Active Visits|Appointment Scheduling/i.test(text),
        i18nT('OpenMRS 工作台'),
      );
      await healthcareBrowserPause(OPENMRS_STEP_DWELL_MS);
      return;
    }
  } catch {
    // 新建 Tab 或错误页没有可复用会话时，继续走本地 OpenMRS 登录。
  }
  await healthcareBrowserOpen(OPENMRS_LOGIN_URL);
  let state = await waitForHealthcareBrowser(
    ({ text }) => /Logged in as .*Registration Desk/i.test(text)
      || /Find Patient Record|Active Visits|Appointment Scheduling/i.test(text)
      || /Username|Password|Location for this session/i.test(text),
    i18nT('登录页或工作台'),
  );

  const alreadyOnWorkbench = /Logged in as .*Registration Desk/i.test(state.text)
    && /Find Patient Record|Active Visits|Appointment Scheduling/i.test(state.text);
  if (!alreadyOnWorkbench && /Username|Password|Location for this session/i.test(state.text)) {
    await healthcareBrowserSetValue(
      ['#username', 'input[name="username"]', 'input[placeholder*="username" i]', 'input[type="text"]'],
      'admin',
    );
    await healthcareBrowserSetValue(
      ['#password', 'input[name="password"]', 'input[placeholder*="password" i]', 'input[type="password"]'],
      'Admin123',
    );
    const locationSelected = await healthcareBrowserEval(`(() => {
      const target = [...document.querySelectorAll('li, button, a, label, span')]
        .find((item) => (item.textContent || '').trim() === 'Registration Desk');
      if (!target) return false;
      target.scrollIntoView({block:'center'});
      target.click();
      return true;
    })()`);
    if (locationSelected !== true) {
      throw new Error(i18nT('OpenMRS 登录页没有找到 Registration Desk'));
    }
    const loginClicked = await healthcareBrowserClickByText(['log in']);
    if (!loginClicked) {
      await healthcareBrowserCommand('press', ['Enter']);
    }
    state = await waitForHealthcareBrowser(
      ({ text }) => /Logged in as .*Registration Desk/i.test(text)
        && /Find Patient Record|Active Visits|Appointment Scheduling/i.test(text),
      i18nT('OpenMRS 首页'),
    );
  }

  if (!/Logged in as .*Registration Desk/i.test(state.text)
      || !/Find Patient Record|Active Visits|Appointment Scheduling/i.test(state.text)) {
    await healthcareBrowserOpen(OPENMRS_HOME_URL);
  }

  await waitForHealthcareBrowser(
    ({ text }) => /Logged in as .*Registration Desk/i.test(text)
      && /Find Patient Record|Active Visits|Appointment Scheduling/i.test(text),
    i18nT('OpenMRS 工作台'),
  );
  await healthcareBrowserPause(OPENMRS_STEP_DWELL_MS);
}

async function beginOpenMrsBrowserSession(
  reportStep?: AutomationStepReporter,
  context?: AutomationExecutionContext,
): Promise<void> {
  activeHealthcareContext = context;
  const tabs = healthcareBrowserTabsApi();
  const browserTab = await tabs.create({
    contextId: OPENMRS_BROWSER_CONTEXT,
    source: 'agent',
    activate: true,
  });
  activeHealthcareBrowserTabId = String(browserTab?.id || '');
  context?.registerCancellation(async () => {
    if (activeHealthcareBrowserTabId && tabs.setAutomationPaused) {
      await tabs.setAutomationPaused(activeHealthcareBrowserTabId, true);
    }
  });
  if (browserTab?.id && tabs.setAutomationPaused) {
    await tabs.setAutomationPaused(browserTab.id, false);
  }

  reportStep?.(0, i18nT('患者服务 Agent 正在右侧登录本地开源 OpenMRS 系统'), {
    actor: i18nT('患者服务 Agent'),
    actorId: 'patient-service',
    actorType: 'agent',
    tool: i18nT('内置浏览器 · OpenMRS'),
  });
  await resetOpenMrsLoginState(reportStep);
  await ensureOpenMrsLoggedIn();
  reportStep?.(0, i18nT('已进入 OpenMRS Registration Desk，登录和工作地点选择均在右侧可见'), {
    actor: i18nT('患者服务 Agent'),
    actorId: 'patient-service',
    actorType: 'agent',
    tool: 'browser.eval',
    evidence: `${OPENMRS_HOME_URL} · Registration Desk`,
  });
}

async function prepareOpenMrsHis(
  reportStep?: AutomationStepReporter,
  context?: AutomationExecutionContext,
): Promise<string> {
  await beginOpenMrsBrowserSession(reportStep, context);
  reportStep?.(1, i18nT('正在先登记一名本次演示专用的虚构患者'), {
    actor: i18nT('患者服务 Agent'),
    actorId: 'patient-service',
    actorType: 'agent',
    tool: 'OpenMRS Registration',
  });
  let patient = await registerOpenMrsDemoPatient(reportStep);

  reportStep?.(2, i18nT('正在用刚生成的姓名或患者编号进入 Find Patient Record 搜索'), {
    actor: i18nT('患者服务 Agent'),
    actorId: 'patient-service',
    actorType: 'agent',
    tool: 'OpenMRS Find Patient Record',
    evidence: patient.identifier || patient.fullName,
  });
  const openedPatient = await searchAndOpenRegisteredPatient(patient);
  const patientState = openedPatient.state;
  patient = openedPatient.patient;
  reportStep?.(2, openedPatient.matchedCreated
    ? i18nT('新登记患者已被检索并重新打开，登记、搜索和档案页形成同一条可回指证据链')
    : i18nT('已检索本次新建患者；本地 OpenMRS 未返回该记录，Agent 已如实记录异常结果'), {
    actor: i18nT('隐私保护 Agent'),
    actorId: 'privacy-guardian',
    actorType: 'agent',
    tool: 'OpenMRS Patient Record',
    evidence: openedPatient.matchedCreated
      ? `${patient.identifier || patient.fullName} · ${patientState.url}`
      : `${patient.fullName} → ${openedPatient.openedRecordSummary} · ${patientState.url}`,
  });
  await healthcareBrowserPause(OPENMRS_STEP_DWELL_MS);

  reportStep?.(3, i18nT('院内运营 Agent 正在打开 Active Visits 并读取当前就诊队列'));
  await healthcareBrowserOpen(OPENMRS_ACTIVE_VISITS_URL);
  const visitsState = await waitForHealthcareBrowser(
    ({ url, text }) => /coreapps\/activeVisits\.page/i.test(url)
      && /Active Visits|patient/i.test(text),
    i18nT('Active Visits 队列'),
  );
  const visitCount = visitsState.text.match(/Showing\s+\d+\s+to\s+\d+\s+of\s+(\d+)/i)?.[1];
  reportStep?.(3, visitCount
    ? i18nT('Active Visits 已回读：当前 {count} 条就诊记录，患者与服务状态可见', { count: visitCount })
    : i18nT('Active Visits 已回读，当前患者与服务状态可见'), {
    actor: i18nT('院内运营 Agent'),
    actorId: 'hospital-ops',
    actorType: 'agent',
    tool: 'OpenMRS Active Visits',
    evidence: `${visitsState.url} · count=${visitCount || 'visible'}`,
  });
  await healthcareBrowserPause(OPENMRS_STEP_DWELL_MS);

  reportStep?.(4, i18nT('正在进入 Reports 与 Appointment Scheduling'));
  await healthcareBrowserOpen(OPENMRS_REPORTS_URL);
  await waitForHealthcareBrowser(
    ({ url, text }) => /reportingui\/reportsapp\/home\.page/i.test(url)
      && /Reports|Run Report/i.test(text),
    i18nT('运营报表模块'),
  );
  await healthcareBrowserPause(OPENMRS_STEP_DWELL_MS);
  await healthcareBrowserOpen(OPENMRS_APPOINTMENTS_URL);
  const appointmentsState = await waitForHealthcareBrowser(
    ({ url, text }) => /appointmentschedulingui\/home\.page/i.test(url)
      && /Appointment Scheduling|Manage Appointments|Appointments/i.test(text),
    i18nT('预约管理模块'),
  );
  await healthcareBrowserPause(OPENMRS_STEP_DWELL_MS);
  reportStep?.(4, i18nT('运营报表与预约模块均已真实打开；右侧停留在 Appointment Scheduling，便于客户继续操作'), {
    actor: i18nT('院内运营 Agent'),
    actorId: 'hospital-ops',
    actorType: 'agent',
    tool: 'OpenMRS Reports + Appointments',
    evidence: appointmentsState.url,
  });

  return [
    `Patient identifier: ${patient.identifier || 'generated but not exposed by demo UI'}`,
    `Patient name: ${patient.fullName}`,
    `Patient registration: ${patient.persisted ? 'created and persisted in local OpenMRS/MySQL' : 'submitted; local persistence verification failed'}`,
    `Patient search match: ${openedPatient.matchedCreated ? 'newly registered patient' : 'new record not found; empty result recorded without fabricating persistence'}`,
    `Patient search/result page: ${patientState.url}`,
    `Active Visits page: ${visitsState.url}`,
    `Active visit count: ${visitCount || 'visible, count not parsed'}`,
    `Appointments page: ${appointmentsState.url}`,
    'Final page: OpenMRS Appointment Scheduling',
  ].join('\n');
}

async function runHealthcareWorkflow(
  scenarioId: string,
  maskedEvidence: string,
  context?: AutomationExecutionContext,
): Promise<any> {
  const target = healthcareApi();
  if (!target?.runWorkflow) throw new Error(i18nT('医疗多 Agent 工作流接口不可用'));
  const runId = context?.runId || `healthcare-${Date.now()}`;
  const unregisterCancellation = context?.registerCancellation(async () => {
    await target.cancelWorkflow?.({ runId });
  });
  try {
    const result = await target.runWorkflow({ runId, scenarioId, maskedEvidence });
    context?.throwIfCancelled();
    return result;
  } finally {
    unregisterCancellation?.();
  }
}

async function executeHealthcareAutomation(
  scenarioId: string,
  phase: 'prepare' | 'commit',
  reportStep?: AutomationStepReporter,
  context?: AutomationExecutionContext,
): Promise<{ note?: string; progressManaged?: boolean }> {
  activeHealthcareContext = context;
  context?.throwIfCancelled();
  if (phase === 'commit') {
    const target = healthcareApi();
    if (target?.reviewSubmit) {
      await target.reviewSubmit({
        tenantId: 'hospital-riyadh-sample',
        actionType: `automation.${scenarioId}.human_handoff`,
        payload: {
          scenarioId,
          runId: context?.runId,
          source: 'healthcare-automation-console',
          containsPhi: false,
          evidence: i18nT('执行步骤、工具回执与人工确认已写入本地运行证据包'),
        },
        maker: 'totalclaw-agent',
        amount: 0,
        summary: i18nT('自动化任务已完成预处理，等待有权限人员终审'),
      });
      tenantId.value = 'hospital-riyadh-sample';
      await loadReviews();
    }
    reportStep?.(
      5,
      i18nT('人工确认已记录，真实 reviewSubmit 接口已把任务写入复核队列'),
      {
        actor: i18nT('运营主管'),
        actorType: 'human',
        tool: '/v1/compliance/review/submit',
        evidence: `${context?.runId || 'run'} · hospital-riyadh-sample`,
      },
    );
    return {
      note: i18nT('人工接管已确认，任务与审计记录已写入复核队列。'),
      progressManaged: true,
    };
  }

  if (scenarioId === 'outpatient-service') {
    await beginOpenMrsBrowserSession(reportStep, context);
    await healthcareBrowserOpen(OPENMRS_APPOINTMENT_REQUESTS_URL);
    const appointmentRequestsState = await waitForHealthcareBrowser(
      ({ url, text }) => /appointmentschedulingui\/appointmentRequests\.page/i.test(url)
        && /Appointment Requests|Appointments/i.test(text),
      i18nT('OpenMRS 预约请求队列'),
    );
    reportStep?.(0, i18nT('患者服务 Agent 已在本地 OpenMRS 打开预约请求队列，并载入 36 条演示咨询请求'), {
      actor: i18nT('患者服务 Agent'), actorId: 'patient-service', actorType: 'agent',
      tool: i18nT('内置浏览器 · OpenMRS Appointment Requests'),
      evidence: i18nT('{p0} · 36 条演示服务请求', { p0: appointmentRequestsState.url }),
    });
    await healthcareBrowserPause(OPENMRS_STEP_DWELL_MS);
    const target = healthcareApi();
    if (!target?.mask) throw new Error(i18nT('PHI 脱敏服务不可用，已阻止 OpenMRS 预约证据进入模型'));
    const maskedSample = formatValue(await target.mask({
      text: [
        `OpenMRS page: ${appointmentRequestsState.url}`,
        `OpenMRS visible queue: ${appointmentRequestsState.text.slice(0, 1_200)}`,
        i18nT('预约人张同学，手机号 13800001234，申请改期并需要无障碍协助。'),
      ].join('\n'),
    }));
    reportStep?.(1, i18nT('隐私保护 Agent 已通过真实 PHI Masker 替换姓名与手机号'), {
      actor: i18nT('隐私保护 Agent'), actorId: 'privacy-guardian', actorType: 'agent',
      tool: '/v1/data_masking/mask',
      evidence: i18nT('OpenMRS Appointment Requests 页面证据已脱敏'),
    });
    reportStep?.(2, i18nT('患者服务、院内运营和质量复核 Agent 正在工作流中并行处理服务请求'), {
      actor: i18nT('医疗多 Agent 工作流'), actorId: 'patient-service', actorType: 'agent',
      tool: '/v1/workflows/dynamic/run', evidence: i18nT('输入来自本地 OpenMRS 且已脱敏'),
    });
    const workflow = await runHealthcareWorkflow(scenarioId, JSON.stringify({
      counts: { appointment: 14, reschedule: 7, reportPickup: 5, navigation: 6, accessibility: 4 },
      maskedSample,
      openMrsEvidence: appointmentRequestsState.url,
    }), context);
    const resultText = workflowOutput(workflow, ['reviewed_service_plan']);
    const workflowId = workflowRunId(workflow) || context?.runId || '';
    await healthcareBrowserOpen(OPENMRS_DAILY_APPOINTMENTS_URL);
    const dailyAppointmentsState = await waitForHealthcareBrowser(
      ({ url, text }) => /appointmentschedulingui\/dailyScheduledAppointments\.page/i.test(url)
        && /Daily Appointments|Appointments/i.test(text),
      i18nT('OpenMRS 每日预约页面'),
    );
    reportStep?.(3, i18nT('院内运营 Agent 已把工作流结果与 OpenMRS 每日预约资源页交叉核对'), {
      actor: i18nT('院内运营 Agent'), actorId: 'hospital-ops', actorType: 'agent',
      tool: 'OpenMRS Daily Appointments + Dynamic AST',
      evidence: `${dailyAppointmentsState.url} · ${workflowId}`,
      output: resultText.slice(0, 300),
    });
    await healthcareBrowserPause(OPENMRS_STEP_DWELL_MS);
    await healthcareBrowserOpen(OPENMRS_MANAGE_APPOINTMENTS_URL);
    const manageAppointmentsState = await waitForHealthcareBrowser(
      ({ url, text }) => /coreapps\/findpatient\/findPatient\.page/i.test(url)
        && /Manage Appointments|Find Patient Record|Search by ID or Name|patient/i.test(text),
      i18nT('OpenMRS 预约患者检索入口'),
    );
    reportStep?.(4, i18nT('质量复核 Agent 已打开 OpenMRS 预约患者检索入口；8 项异常只生成待办，不自动落单'), {
      actor: i18nT('质量复核 Agent'), actorId: 'quality-reviewer', actorType: 'agent',
      tool: 'OpenMRS Manage Appointments + Dynamic AST · final review',
      evidence: manageAppointmentsState.url,
      output: resultText.slice(0, 300),
    });
    await healthcareBrowserPause(OPENMRS_STEP_DWELL_MS);
    reviewNotice.value = resultText;
    reportStep?.(5, i18nT('8 项异常已停在患者服务主管人工确认；右侧保留 OpenMRS 预约患者入口供接管'), {
      actor: i18nT('质量复核 Agent'), actorId: 'quality-reviewer', actorType: 'agent',
      tool: i18nT('OpenMRS + 全局模型会话'),
      evidence: `${manageAppointmentsState.url} · ${i18nT('质量复核输出已进入人工闸门')}`,
      output: resultText.slice(0, 280),
    });
    return {
      note: i18nT('本地 OpenMRS 预约请求、每日预约和患者检索页已参与门诊多 Agent 工作流，当前等待人工确认。'),
      progressManaged: true,
    };
  }
  if (scenarioId === 'hospital-operations') {
    const openMrsEvidence = await prepareOpenMrsHis(reportStep, context);
    context?.throwIfCancelled();
    const target = healthcareApi();
    if (!target?.mask) throw new Error(i18nT('PHI 脱敏服务不可用，已阻止浏览器证据进入模型'));
    const maskedEvidence = formatValue(await target.mask({ text: openMrsEvidence }));
    reportStep?.(2, i18nT('隐私保护 Agent 已在证据进入模型前完成 PHI 脱敏'), {
      actor: i18nT('隐私保护 Agent'), actorId: 'privacy-guardian', actorType: 'agent',
      tool: '/v1/data_masking/mask', evidence: i18nT('浏览器证据已脱敏'),
    });
    const workflow = await runHealthcareWorkflow(scenarioId, maskedEvidence, context);
    const resultText = workflowOutput(workflow, ['reviewed_service_plan']);
    const workflowId = workflowRunId(workflow) || context?.runId || '';
    reportStep?.(3, i18nT('患者服务、院内运营和质量复核 Agent 已基于脱敏浏览器证据并行处理'), {
      actor: i18nT('医疗多 Agent 工作流'), actorId: 'hospital-ops', actorType: 'agent',
      tool: '/v1/workflows/dynamic/run', evidence: workflowId,
      output: resultText.slice(0, 300),
    });
    reviewNotice.value = resultText;
    await healthcareBrowserOpen(OPENMRS_APPOINTMENTS_URL);
    await waitForHealthcareBrowser(
      ({ url, text }) => /appointmentschedulingui\/home\.page/i.test(url)
        && /Appointment Scheduling|Manage Appointments|Appointments/i.test(text),
      i18nT('预约管理模块'),
    );
    reportStep?.(5, i18nT('质量复核 Agent 已对照浏览器证据完成复核；新建就诊、预约和登记状态变更等待运营主管确认'), {
      actor: i18nT('质量复核 Agent'), actorId: 'quality-reviewer', actorType: 'agent',
      tool: i18nT('全局模型会话'), evidence: `${context?.runId || 'run'} · OpenMRS evidence`,
      output: resultText.slice(0, 300),
    });
    return {
      note: i18nT('OpenMRS 真实浏览器操作与医疗多 Agent 工作流已完成，右侧停在预约工作台等待人工接管。'),
      progressManaged: true,
    };
  }
  await beginOpenMrsBrowserSession(reportStep, context);
  await healthcareBrowserOpen(OPENMRS_ACTIVE_VISITS_URL);
  const activeVisitsState = await waitForHealthcareBrowser(
    ({ url, text }) => /coreapps\/activeVisits\.page/i.test(url)
      && /Active Visits|patient/i.test(text),
    i18nT('OpenMRS 活跃就诊队列'),
  );
  const activeVisitCount = activeVisitsState.text.match(/Showing\s+\d+\s+to\s+\d+\s+of\s+(\d+)/i)?.[1];
  reportStep?.(0, i18nT('患者服务 Agent 已读取本地 OpenMRS Active Visits，并载入 47 条演示回访任务'), {
    actor: i18nT('患者服务 Agent'), actorId: 'patient-service', actorType: 'agent',
    tool: i18nT('内置浏览器 · OpenMRS Active Visits'),
    evidence: i18nT('{p0} · active={p1} · 47 条演示回访任务', { p0: activeVisitsState.url, p1: activeVisitCount || 'visible' }),
  });
  await healthcareBrowserPause(OPENMRS_STEP_DWELL_MS);
  const target = healthcareApi();
  if (!target?.mask) throw new Error(i18nT('PHI 脱敏服务不可用，已阻止 OpenMRS 就诊证据进入模型'));
  const maskedFollowupEvidence = formatValue(await target.mask({
    text: [
      `OpenMRS page: ${activeVisitsState.url}`,
      `OpenMRS queue: ${activeVisitsState.text.slice(0, 1_200)}`,
      i18nT('患者 PATIENT-SAMPLE-01，联系电话 13800004567，需要了解报告领取时间。'),
    ].join('\n'),
  }));
  reportStep?.(1, i18nT('隐私保护 Agent 已完成姓名与联系方式替换'), {
    actor: i18nT('隐私保护 Agent'), actorId: 'privacy-guardian', actorType: 'agent',
    tool: '/v1/data_masking/mask', evidence: i18nT('OpenMRS Active Visits 页面证据已脱敏'),
  });
  reportStep?.(2, i18nT('患者服务、院内运营和质量复核 Agent 正在工作流中生成并复核回访任务'), {
    actor: i18nT('医疗多 Agent 工作流'), actorId: 'patient-service', actorType: 'agent',
    tool: '/v1/workflows/dynamic/run', evidence: i18nT('本地 OpenMRS 队列 + 47 条已脱敏回访任务'),
  });
  const workflow = await runHealthcareWorkflow(scenarioId, JSON.stringify({
    counts: { materialPickup: 15, transport: 7, navigation: 9, waitFeedback: 10, noResponse: 6 },
    boundary: 'service-only; no diagnosis, prescription or treatment',
    maskedOpenMrsEvidence: maskedFollowupEvidence,
  }), context);
  const resultText = workflowOutput(workflow, ['reviewed_service_plan']);
  const workflowId = workflowRunId(workflow) || context?.runId || '';
  await healthcareBrowserOpen(OPENMRS_REPORTS_URL);
  const reportsState = await waitForHealthcareBrowser(
    ({ url, text }) => /reportingui\/reportsapp\/home\.page/i.test(url)
      && /Reports|Run Report/i.test(text),
    i18nT('OpenMRS 运营报表'),
  );
  reportStep?.(3, i18nT('院内运营 Agent 已把非临床回访分类与 OpenMRS 运营报表入口交叉核对'), {
    actor: i18nT('院内运营 Agent'), actorId: 'hospital-ops', actorType: 'agent',
    tool: 'OpenMRS Reports + Dynamic AST',
    evidence: `${reportsState.url} · ${workflowId}`,
    output: resultText.slice(0, 300),
  });
  await healthcareBrowserPause(OPENMRS_STEP_DWELL_MS);
  await healthcareBrowserOpen(OPENMRS_PATIENT_SEARCH_URL);
  const patientSearchState = await waitForHealthcareBrowser(
    ({ url, text }) => /coreapps\/findpatient\/findPatient\.page/i.test(url)
      && /Find Patient Record|patient/i.test(text),
    i18nT('OpenMRS 患者服务检索入口'),
  );
  reportStep?.(4, i18nT('质量复核 Agent 已打开 OpenMRS 患者服务检索入口，并确认结果不含诊断、处方和治疗建议'), {
    actor: i18nT('质量复核 Agent'), actorId: 'quality-reviewer', actorType: 'agent',
    tool: 'OpenMRS Patient Search + Dynamic AST · final review',
    evidence: patientSearchState.url,
    output: resultText.slice(0, 300),
  });
  await healthcareBrowserPause(OPENMRS_STEP_DWELL_MS);
  reviewNotice.value = resultText;
  reportStep?.(5, i18nT('6 项服务问题已停在患者服务主管人工确认；右侧保留 OpenMRS 患者服务入口供接管'), {
    actor: i18nT('质量复核 Agent'), actorId: 'quality-reviewer', actorType: 'agent',
    tool: i18nT('OpenMRS + 全局模型会话'),
    evidence: i18nT('{p0} · 质量复核输出已进入人工闸门', { p0: patientSearchState.url }),
    output: resultText.slice(0, 280),
  });
  return {
    note: i18nT('本地 OpenMRS Active Visits、运营报表和患者服务入口已参与回访多 Agent 工作流，当前等待人工确认。'),
    progressManaged: true,
  };
}

/**
 * 错误 → 人话。见 EducationWorkbenchView 同名函数注释：直接摆 error.message
 * 会把路径/栈帧/traceback/内部错误码原样丢给用户，必须经 humanizeErrorMessage。
 */
function errorMessage(error: unknown, fallback: string): string {
  return humanizeErrorMessage(error, fallback);
}

function formatValue(value: unknown): string {
  if (typeof value === 'string') return value;
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value ?? '');
  }
}

async function loadStatus(): Promise<void> {
  statusLoading.value = true;
  statusError.value = '';
  try {
    const api = healthcareApi();
    if (!api?.status) throw new Error(i18nT('医疗工作台接口不可用'));
    statusResponse.value = await api.status();
  } catch (error) {
    statusResponse.value = null;
    statusError.value = errorMessage(error, i18nT('医疗工作台状态检查失败'));
  } finally {
    statusLoading.value = false;
  }
}

async function maskPhi(): Promise<void> {
  if (!maskText.value.trim()) {
    maskError.value = i18nT('请输入待脱敏文本');
    return;
  }
  maskBusy.value = true;
  maskError.value = '';
  maskResult.value = null;
  try {
    const api = healthcareApi();
    if (!api?.mask) throw new Error(i18nT('医疗脱敏接口不可用'));
    maskResult.value = await api.mask({ text: maskText.value.trim() });
  } catch (error) {
    maskError.value = errorMessage(error, i18nT('患者信息脱敏失败'));
  } finally {
    maskBusy.value = false;
  }
}

async function loadReviews(): Promise<void> {
  reviewsError.value = '';
  reviewNotice.value = '';
  if (!tenantId.value.trim()) {
    reviewItems.value = [];
    reviewsError.value = i18nT('请先填写机构标识');
    return;
  }
  reviewsLoading.value = true;
  try {
    const api = healthcareApi();
    if (!api?.reviewList) throw new Error(i18nT('人工复核列表接口不可用'));
    const response = await api.reviewList({
      tenantId: tenantId.value.trim(),
      status: reviewFilter.value || undefined,
    });
    reviewItems.value = Array.isArray(response?.items) ? response.items : [];
  } catch (error) {
    reviewItems.value = [];
    reviewsError.value = errorMessage(error, i18nT('加载人工复核列表失败'));
  } finally {
    reviewsLoading.value = false;
  }
}

async function submitReview(): Promise<void> {
  reviewsError.value = '';
  reviewNotice.value = '';
  if (!tenantId.value.trim()
    || !submitForm.actionType.trim()
    || !submitForm.maker.trim()
    || !submitForm.summary.trim()) {
    reviewsError.value = i18nT('请填写机构标识、动作类型、提交人和复核摘要');
    return;
  }

  let payload: Record<string, unknown>;
  try {
    const parsed = JSON.parse(submitForm.payloadText || '{}');
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new Error(i18nT('动作上下文必须是 JSON 对象'));
    }
    payload = parsed;
  } catch (error) {
    reviewsError.value = errorMessage(error, i18nT('动作上下文不是有效的 JSON'));
    return;
  }

  reviewSubmitting.value = true;
  try {
    const api = healthcareApi();
    if (!api?.reviewSubmit) throw new Error(i18nT('人工复核提交接口不可用'));
    const response = await api.reviewSubmit({
      tenantId: tenantId.value.trim(),
      actionType: submitForm.actionType.trim(),
      payload,
      maker: submitForm.maker.trim(),
      amount: Number(submitForm.amount || 0),
      summary: submitForm.summary.trim(),
    });
    const status = response?.item?.status;
    reviewNotice.value = status === 'approved'
      ? i18nT('复核项已提交，并由服务端规则自动标记为已通过')
      : i18nT('复核项已提交，正在等待另一位人员确认');
    submitForm.summary = '';
    submitForm.amount = 0;
    submitForm.payloadText = '{}';
    await loadReviews();
    reviewNotice.value = status === 'approved'
      ? i18nT('复核项已提交，并由服务端规则自动标记为已通过')
      : i18nT('复核项已提交，正在等待另一位人员确认');
  } catch (error) {
    reviewsError.value = errorMessage(error, i18nT('提交人工复核失败'));
  } finally {
    reviewSubmitting.value = false;
  }
}

async function decideReview(item: ReviewItem, approve: boolean): Promise<void> {
  reviewsError.value = '';
  reviewNotice.value = '';
  const itemId = reviewItemId(item);
  const checker = decisionChecker.value.trim();
  if (!checker) {
    reviewsError.value = i18nT('请填写当前复核人');
    return;
  }
  if (checker === String(item.maker || '').trim()) {
    reviewsError.value = i18nT('复核人必须与提交人不同，禁止自我审批');
    return;
  }
  const reason = String(decisionReasons[itemId] || '').trim();
  if (!approve && !reason) {
    reviewsError.value = i18nT('拒绝复核项时必须填写原因');
    return;
  }

  decisionBusyId.value = itemId;
  try {
    const api = healthcareApi();
    if (!api?.reviewDecide) throw new Error(i18nT('人工复核决定接口不可用'));
    await api.reviewDecide({
      tenantId: tenantId.value.trim(),
      itemId,
      checker,
      approve,
      reason: reason || undefined,
    });
    delete decisionReasons[itemId];
    await loadReviews();
    reviewNotice.value = approve
      ? i18nT('复核项已由人工确认通过')
      : i18nT('复核项已由人工拒绝');
  } catch (error) {
    reviewsError.value = errorMessage(error, i18nT('提交复核决定失败'));
  } finally {
    decisionBusyId.value = '';
  }
}

async function exportAudit(): Promise<void> {
  auditError.value = '';
  auditResult.value = null;
  if (!tenantId.value.trim()) {
    auditError.value = i18nT('请先填写机构标识');
    return;
  }
  auditBusy.value = true;
  try {
    const api = healthcareApi();
    if (!api?.auditExport) throw new Error(i18nT('审计导出接口不可用'));
    auditResult.value = await api.auditExport({ tenantId: tenantId.value.trim() });
  } catch (error) {
    auditError.value = errorMessage(error, i18nT('审计流水导出失败'));
  } finally {
    auditBusy.value = false;
  }
}

function downloadAudit(): void {
  const content = auditResult.value?.auditJsonl || '';
  if (!content) {
    auditError.value = i18nT('没有可保存的审计流水');
    return;
  }
  const blob = new Blob([content], { type: 'application/x-ndjson;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  const safeTenant = tenantId.value.trim().replace(/[^a-zA-Z0-9_-]+/g, '_') || 'tenant';
  anchor.href = url;
  anchor.download = `healthcare-audit-${safeTenant}.jsonl`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function reviewItemId(item: ReviewItem): string {
  return String(item.id || '');
}

function reviewStatusLabel(status: unknown): string {
  const labels: Record<string, string> = {
    pending: i18nT('待复核'),
    approved: i18nT('已通过'),
    rejected: i18nT('已拒绝'),
  };
  const raw = String(status || '');
  return labels[raw] || i18nT(raw || '未知');
}

function reviewStatusClass(status: unknown): string {
  const raw = String(status || '');
  return ['pending', 'approved', 'rejected'].includes(raw) ? raw : 'unknown';
}

function formatDate(value: unknown): string {
  const seconds = Number(value);
  if (!Number.isFinite(seconds) || seconds <= 0) return '—';
  const localeCode = locale.value === 'ar' ? 'ar-SA' : locale.value;
  return new Intl.DateTimeFormat(localeCode, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(seconds * 1000));
}

function formatAmount(value: unknown): string {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return '—';
  return new Intl.NumberFormat(locale.value === 'ar' ? 'ar-SA' : locale.value, {
    maximumFractionDigits: 2,
  }).format(amount);
}

onMounted(() => {
  void loadStatus();
});
</script>

<style scoped>
.workbench {
  height: 100%;
  min-height: 0;
  overflow-y: auto;
  padding: 24px;
  color: var(--color-text);
  background:
    radial-gradient(circle at 8% 0%, color-mix(in srgb, var(--color-danger, #ef4444) 6%, transparent), transparent 30%),
    var(--color-bg);
}

.hero,
.panel,
.workbench-tabs {
  max-width: 1280px;
  margin-inline: auto;
}
.hero {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 18px;
}
.demo-banner {
  display: flex;
  align-items: center;
  gap: 12px;
  max-width: 1280px;
  margin: 0 auto 18px;
  padding: 13px 15px;
  border: 1px solid color-mix(in srgb, var(--color-brand) 40%, var(--color-border));
  border-radius: 14px;
  background: color-mix(in srgb, var(--color-brand) 9%, var(--color-bg-card));
}
.demo-banner > i { color: var(--color-brand); font-size: 22px; }
.demo-banner > div { flex: 1; min-width: 0; }
.demo-banner strong { display: block; margin-bottom: 3px; }
.demo-banner p { margin: 0; color: var(--color-text-muted); font-size: 12px; }
.capability-console-heading {
  max-width: 1280px;
  margin: 8px auto 12px;
}
.capability-console-heading span,
.capability-console-heading strong { display: block; }
.capability-console-heading span { margin-bottom: 3px; color: var(--color-brand); font-size: 10px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; }
.capability-console-heading strong { font-size: 15px; }
.hero-copy { max-width: 780px; margin-inline-end: auto; }
.hero-actions { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; justify-content: flex-end; }
.eyebrow,
.section-kicker {
  color: var(--color-primary, #3b82f6);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: .08em;
  text-transform: uppercase;
}
.hero h1 {
  margin: 7px 0 8px;
  font-size: clamp(26px, 3vw, 38px);
  line-height: 1.12;
}
.hero p,
.section-heading p {
  margin: 0;
  color: var(--color-text-secondary);
  line-height: 1.7;
}

.panel {
  padding: 20px;
  border: 1px solid var(--color-border);
  border-radius: 18px;
  background: var(--color-bg-elevated);
  box-shadow: 0 10px 32px color-mix(in srgb, #000 5%, transparent);
}
.status-panel { margin-bottom: 16px; }
.section-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 18px;
}
.section-heading h2 { margin: 4px 0; font-size: 19px; }
.status-pill,
.mini-status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 650;
}
.status-pill { padding: 7px 11px; background: var(--color-bg-input); }
.status-pill i { font-size: 7px; }
.status-pill.success,
.mini-status.available { color: var(--color-success, #22c55e); }
.status-pill.danger { color: var(--color-danger, #ef4444); }
.status-pill.loading { color: var(--color-info, #3b82f6); }
.mini-status.unknown { color: var(--color-text-secondary); }

.status-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}
.status-card {
  position: relative;
  min-width: 0;
  padding: 14px;
  border: 1px solid var(--color-border);
  border-radius: 13px;
  background: color-mix(in srgb, var(--color-bg-input) 45%, transparent);
}
.status-card-icon {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  margin-bottom: 11px;
  border-radius: 10px;
  font-size: 18px;
}
.status-card-icon.available {
  color: var(--color-success, #22c55e);
  background: color-mix(in srgb, var(--color-success, #22c55e) 12%, transparent);
}
.status-card-icon.unknown { color: var(--color-text-muted); background: var(--color-bg-input); }
.status-card p {
  min-height: 39px;
  margin: 6px 0 10px;
  color: var(--color-text-secondary);
  font-size: 12px;
  line-height: 1.5;
}
.mini-status { padding: 3px 7px; background: var(--color-bg-elevated); }
details { margin-top: 10px; }
summary {
  color: var(--color-text-secondary);
  font-size: 11.5px;
  cursor: pointer;
}
details pre {
  max-height: 180px;
  overflow: auto;
  margin: 8px 0 0;
  padding: 9px;
  border-radius: 8px;
  color: var(--color-text-secondary);
  background: var(--color-bg-input);
  font: 11px/1.5 var(--font-mono, ui-monospace);
  white-space: pre-wrap;
  word-break: break-word;
}

.workbench-tabs {
  display: flex;
  gap: 6px;
  margin-bottom: 10px;
  padding: 5px;
  border: 1px solid var(--color-border);
  border-radius: 13px;
  background: var(--color-bg-elevated);
}
.workbench-tabs button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-width: 145px;
  padding: 10px 16px;
  border: 0;
  border-radius: 9px;
  color: var(--color-text-secondary);
  background: transparent;
  font: inherit;
  font-size: 13px;
  font-weight: 650;
  cursor: pointer;
}
.workbench-tabs button.active {
  color: var(--color-primary, #3b82f6);
  background: color-mix(in srgb, var(--color-primary, #3b82f6) 11%, var(--color-bg-input));
}
.count-badge {
  display: grid;
  place-items: center;
  min-width: 19px;
  height: 19px;
  padding: 0 4px;
  border-radius: 999px;
  color: white;
  background: var(--color-danger, #ef4444);
  font-size: 10px;
}

.workspace-panel { margin-bottom: 24px; }
.two-column,
.audit-layout {
  display: grid;
  grid-template-columns: minmax(0, .95fr) minmax(0, 1.05fr);
  gap: 14px;
}
.form-card,
.result-card,
.review-list {
  min-width: 0;
  padding: 16px;
  border: 1px solid var(--color-border);
  border-radius: 14px;
  background: color-mix(in srgb, var(--color-bg-input) 36%, transparent);
}
.field-grid { display: grid; gap: 12px; }
.field-grid.two { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.field {
  display: grid;
  gap: 7px;
  margin-bottom: 13px;
  color: var(--color-text-secondary);
  font-size: 12px;
  font-weight: 650;
}
.field input,
.field select,
.field textarea,
.tenant-controls input,
.tenant-controls select,
.checker-field input,
.decision-box input {
  box-sizing: border-box;
  border: 1px solid var(--color-border);
  border-radius: 9px;
  outline: none;
  color: var(--color-text);
  background: var(--color-bg-input);
  font: inherit;
  font-size: 13px;
}
.field input,
.field select { width: 100%; height: 40px; padding: 0 11px; }
.field textarea { width: 100%; resize: vertical; padding: 10px 11px; line-height: 1.55; }
.field input:focus,
.field select:focus,
.field textarea:focus,
.tenant-controls input:focus,
.tenant-controls select:focus,
.checker-field input:focus,
.decision-box input:focus {
  border-color: var(--color-primary, #3b82f6);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary, #3b82f6) 12%, transparent);
}
.privacy-note {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  margin-bottom: 14px;
  padding: 10px;
  border-radius: 9px;
  color: var(--color-text-secondary);
  background: color-mix(in srgb, var(--color-info, #3b82f6) 8%, transparent);
  font-size: 12px;
  line-height: 1.5;
}
.privacy-note i { color: var(--color-info, #3b82f6); }

.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  min-height: 39px;
  padding: 0 14px;
  border: 1px solid transparent;
  border-radius: 9px;
  font: inherit;
  font-size: 13px;
  font-weight: 650;
  text-decoration: none;
  cursor: pointer;
}
.button:disabled { opacity: .55; cursor: not-allowed; }
.button.primary { color: white; background: var(--color-primary, #3b82f6); }
.button.secondary { color: var(--color-text); border-color: var(--color-border); background: var(--color-bg-elevated); }
.button.compact { min-height: 33px; padding-inline: 10px; font-size: 12px; }
.button.approve {
  color: var(--color-success, #22c55e);
  border-color: color-mix(in srgb, var(--color-success, #22c55e) 30%, var(--color-border));
  background: color-mix(in srgb, var(--color-success, #22c55e) 8%, var(--color-bg-elevated));
}
.button.reject {
  color: var(--color-danger, #ef4444);
  border-color: color-mix(in srgb, var(--color-danger, #ef4444) 30%, var(--color-border));
  background: color-mix(in srgb, var(--color-danger, #ef4444) 8%, var(--color-bg-elevated));
}

.result-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}
.result-title span {
  padding: 3px 7px;
  border-radius: 999px;
  color: var(--color-text-secondary);
  background: var(--color-bg-input);
  font-size: 11px;
}
.result-block label {
  display: block;
  margin-bottom: 7px;
  color: var(--color-text-secondary);
  font-size: 12px;
  font-weight: 650;
}
.result-block pre,
.audit-result > pre {
  max-height: 360px;
  overflow: auto;
  margin: 0 0 12px;
  padding: 12px;
  border: 1px solid var(--color-border);
  border-radius: 10px;
  color: var(--color-text);
  background: var(--color-bg-elevated);
  font: 12px/1.65 var(--font-mono, ui-monospace);
  white-space: pre-wrap;
  word-break: break-word;
}
.result-meta {
  display: grid;
  gap: 8px;
  margin: 0;
}
.result-meta div {
  display: grid;
  grid-template-columns: 130px minmax(0, 1fr);
  gap: 10px;
  padding: 8px 0;
  border-bottom: 1px solid var(--color-border);
}
.result-meta dt { color: var(--color-text-secondary); font-size: 12px; }
.result-meta dd { margin: 0; overflow-wrap: anywhere; font-family: var(--font-mono, ui-monospace); font-size: 12px; }
.empty-state {
  display: grid;
  place-items: center;
  min-height: 190px;
  color: var(--color-text-secondary);
  text-align: center;
}
.empty-state i { font-size: 38px; opacity: .38; }
.empty-state p { margin: 7px 0 0; }

.review-heading { align-items: flex-end; }
.tenant-controls {
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  gap: 8px;
  flex-wrap: wrap;
}
.tenant-controls label,
.checker-field {
  display: grid;
  gap: 5px;
  color: var(--color-text-secondary);
  font-size: 11px;
}
.tenant-controls input,
.tenant-controls select {
  width: 175px;
  height: 34px;
  padding: 0 9px;
}
.review-layout {
  display: grid;
  grid-template-columns: minmax(310px, .72fr) minmax(0, 1.28fr);
  gap: 14px;
}
.card-title {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
}
.card-title > i { color: var(--color-primary, #3b82f6); font-size: 21px; }
.card-title p { margin: 4px 0 0; color: var(--color-text-secondary); font-size: 12px; line-height: 1.5; }
.form-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.review-list {
  max-height: 720px;
  overflow-y: auto;
}
.review-list-toolbar {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-end;
  margin-bottom: 12px;
}
.review-list-toolbar > div { display: grid; gap: 3px; }
.review-list-toolbar > div span { color: var(--color-text-secondary); font-size: 11.5px; }
.checker-field input { width: 190px; height: 34px; padding: 0 9px; }
.review-item {
  margin-bottom: 10px;
  padding: 13px;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  background: var(--color-bg-elevated);
}
.review-item > header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
}
.review-item > header > div {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}
.review-item > header strong { overflow-wrap: anywhere; }
.review-item time { flex: 0 0 auto; color: var(--color-text-secondary); font-size: 11px; }
.review-status {
  flex: 0 0 auto;
  padding: 3px 7px;
  border-radius: 999px;
  font-size: 10.5px;
  font-weight: 700;
}
.review-status.pending { color: var(--color-warning, #f59e0b); background: color-mix(in srgb, var(--color-warning, #f59e0b) 12%, transparent); }
.review-status.approved { color: var(--color-success, #22c55e); background: color-mix(in srgb, var(--color-success, #22c55e) 12%, transparent); }
.review-status.rejected { color: var(--color-danger, #ef4444); background: color-mix(in srgb, var(--color-danger, #ef4444) 12%, transparent); }
.review-facts {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 6px;
  margin: 12px 0 4px;
}
.review-facts span {
  display: grid;
  gap: 3px;
  min-width: 0;
  color: var(--color-text);
  font-size: 11.5px;
  overflow-wrap: anywhere;
}
.review-facts b { color: var(--color-text-secondary); font-size: 10.5px; font-weight: 550; }
.decision-reason {
  display: flex;
  gap: 6px;
  align-items: flex-start;
  margin: 10px 0 0;
  color: var(--color-text-secondary);
  font-size: 12px;
}
.decision-box {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto auto;
  gap: 7px;
  margin-top: 11px;
}
.decision-box input { min-width: 0; height: 33px; padding: 0 9px; }
.review-empty { min-height: 250px; }
.audit-result > pre { max-height: 420px; }

.message {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  margin-bottom: 12px;
  padding: 10px 12px;
  border-radius: 9px;
  font-size: 12.5px;
  line-height: 1.5;
}
.message.error {
  color: var(--color-danger, #ef4444);
  background: color-mix(in srgb, var(--color-danger, #ef4444) 10%, transparent);
}
.message.success {
  color: var(--color-success, #22c55e);
  background: color-mix(in srgb, var(--color-success, #22c55e) 10%, transparent);
}
.spin { animation: spin .85s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

[dir="rtl"] .hero,
[dir="rtl"] .section-heading,
[dir="rtl"] .privacy-note,
[dir="rtl"] .card-title,
[dir="rtl"] .message { text-align: right; }

@container main-page (max-width: 1050px) {
  .status-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .review-heading { align-items: flex-start; }
  .review-heading,
  .review-layout { grid-template-columns: 1fr; }
  .review-layout { display: grid; }
  .section-heading.review-heading { flex-direction: column; }
  .tenant-controls { justify-content: flex-start; }
}

@container main-page (max-width: 780px) {
  .two-column,
  .audit-layout,
  .review-layout { grid-template-columns: 1fr; }
  .review-facts { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}

@container main-page (max-width: 620px) {
  .workbench { padding: 14px; }
  .hero,
  .section-heading { flex-direction: column; }
  .status-grid,
  .field-grid.two { grid-template-columns: 1fr; }
  .workbench-tabs button { flex: 1; min-width: 0; padding-inline: 7px; }
  .workbench-tabs button i { display: none; }
  .tenant-controls { width: 100%; }
  .tenant-controls label { width: 100%; }
  .tenant-controls input,
  .tenant-controls select { width: 100%; }
  .review-list-toolbar,
  .review-item > header { flex-direction: column; }
  .checker-field,
  .checker-field input { width: 100%; }
  .decision-box { grid-template-columns: 1fr 1fr; }
  .decision-box input { grid-column: 1 / -1; }
}
</style>
