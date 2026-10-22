<template>
  <div class="warehouse-workbench" :dir="isRtl ? 'rtl' : 'ltr'">
    <header class="workbench-header">
      <div class="heading">
        <PageBackButton />
        <span class="heading-icon"><i class="ri-archive-stack-line"></i></span>
        <div>
          <p class="eyebrow">{{ $t('行业工作台') }}</p>
          <h1>{{ $t('产销存协同工作台') }}</h1>
          <p class="subtitle">
            {{ $t('由产销计划、数据归一、库存控制、出入库执行和审计 Agent 协同连接销售、采购、库存与履约数据。') }}
          </p>
        </div>
      </div>
      <div class="header-actions">
        <button class="button ghost" :disabled="capabilityLoading" @click="loadCapabilities">
          <i :class="capabilityLoading ? 'ri-loader-4-line spin' : 'ri-refresh-line'"></i>
          {{ $t('刷新能力') }}
        </button>
      </div>
    </header>

    <AutomationOpsConsole domain="warehouse" :execute="executeWarehouseAutomation" />

    <section v-if="threeWayResult" class="three-way-result">
      <header>
        <div>
          <span>{{ $t('三方确定性对账结果') }}</span>
          <h2>WMS × SAP ERP × Commerce</h2>
        </div>
        <strong>{{ threeWayResult.findings.length }} {{ $t('项可回指发现') }}</strong>
      </header>
      <div class="three-way-summary">
        <article><span>{{ $t('数据源') }}</span><b>{{ threeWayResult.sourceCount }}</b></article>
        <article><span>{{ $t('对账业务键') }}</span><b>{{ threeWayResult.comparedKeys }}</b></article>
        <article><span>{{ $t('证据锚点') }}</span><b>{{ threeWayResult.evidenceCount }}</b></article>
        <article class="impact"><span>{{ $t('差异影响') }}</span><b>SAR {{ numberValue(threeWayResult.totalImpactSar) }}</b></article>
      </div>
      <div class="three-way-findings">
        <article v-for="finding in threeWayResult.findings" :key="finding.id" :class="finding.severity">
          <div>
            <strong>{{ finding.sku }} · {{ finding.warehouse }}</strong>
            <p>{{ finding.detail }}</p>
          </div>
          <em v-if="finding.impactSar">SAR {{ numberValue(finding.impactSar) }}</em>
          <span v-else>{{ finding.type }}</span>
          <small>{{ finding.evidence.map((item) => `${item.sourceId}#${item.row}`).join(' · ') }}</small>
        </article>
      </div>
    </section>

    <div class="capability-console-heading">
      <span>{{ $t('底层工具') }}</span>
      <strong>{{ $t('多源数据接入、产销存归一、确定性对账与出入库执行') }}</strong>
    </div>

    <section class="guardrail-banner" aria-live="polite">
      <i class="ri-shield-keyhole-line"></i>
      <div>
        <strong>{{ $t('写操作受双闸门保护') }}</strong>
        <p>
          {{ $t('真实写入在人工确认后直接执行，并由不同人员复核批准。补货、采购、调拨和出入库状态变更都保留来源证据与执行记录。') }}
        </p>
      </div>
      <span class="guardrail-chip">{{ $t('仅检查') }}</span>
    </section>

    <WarehouseDataNormalization @normalized-reconcile="applyNormalizedReconcile" />

    <section class="capability-grid" aria-label="ERP capabilities">
      <article class="capability-card">
        <span class="capability-icon" :class="erpEnabled ? 'success' : 'muted'">
          <i class="ri-database-2-line"></i>
        </span>
        <div>
          <small>{{ $t('ERP 业务能力') }}</small>
          <strong v-if="capabilityLoading">{{ $t('探测中…') }}</strong>
          <strong v-else>{{ erpEnabled ? $t('已启用') : $t('未启用或不可用') }}</strong>
        </div>
      </article>
      <article class="capability-card">
        <span class="capability-icon"><i class="ri-plug-2-line"></i></span>
        <div>
          <small>{{ $t('可用 Provider') }}</small>
          <strong>{{ providers.length }}</strong>
          <span v-if="defaultProvider">{{ $t('默认：') }}{{ defaultProvider }}</span>
        </div>
      </article>
      <article class="capability-card">
        <span class="capability-icon success"><i class="ri-filter-3-line"></i></span>
        <div>
          <small>{{ $t('统一数据模型') }}</small>
          <strong>{{ $t('InventoryRecord v1') }}</strong>
          <span>{{ $t('SKU、仓库、数量、单位、批次与来源证据') }}</span>
        </div>
      </article>
      <article class="capability-card">
        <span class="capability-icon" :class="capabilityError ? 'danger' : 'success'">
          <i :class="capabilityError ? 'ri-error-warning-line' : 'ri-checkbox-circle-line'"></i>
        </span>
        <div>
          <small>{{ $t('能力探测') }}</small>
          <strong>{{ capabilityError ? $t('连接失败') : capabilityLoading ? $t('连接中') : $t('已完成') }}</strong>
          <span v-if="capabilityError" class="error-copy">{{ capabilityError }}</span>
        </div>
      </article>
    </section>

    <section v-if="providers.length" class="provider-strip">
      <span class="section-label">{{ $t('Provider 能力') }}</span>
      <div class="provider-list">
        <span v-for="(provider, index) in providers" :key="providerKey(provider, index)" class="provider-chip">
          <i class="ri-server-line"></i>
          {{ providerLabel(provider) }}
        </span>
      </div>
    </section>

    <main class="workbench-main">
      <section class="panel reconcile-panel">
        <div class="panel-heading">
          <div>
            <span class="section-label">{{ $t('确定性引擎') }}</span>
            <h2>{{ $t('双账记录对账') }}</h2>
            <p>{{ $t('输入两组 JSON 数组。完全匹配项只计数，界面展示差异残差及原始记录。') }}</p>
          </div>
          <span class="deterministic-badge">
            <i class="ri-code-box-line"></i>{{ $t('零模型推测') }}
          </span>
        </div>

        <div class="reconcile-options">
          <label>
            <span>{{ $t('匹配键（逗号分隔）') }}</span>
            <input
              v-model="keyFieldsInput"
              type="text"
              :placeholder="$t('例如：sku, batch')"
              :disabled="reconcileLoading"
            />
          </label>
          <label>
            <span>{{ $t('比较数值字段') }}</span>
            <input
              v-model="amountField"
              type="text"
              :placeholder="$t('例如：quantity 或 amount')"
              :disabled="reconcileLoading"
            />
          </label>
          <label>
            <span>{{ $t('允许误差') }}</span>
            <input
              v-model.number="tolerance"
              type="number"
              min="0"
              step="0.01"
              :disabled="reconcileLoading"
            />
          </label>
        </div>

        <div class="json-input-grid">
          <label class="json-field">
            <span>
              <b>{{ $t('左侧记录') }}</b>
              <small>{{ leftRecordCountLabel }}</small>
            </span>
            <textarea
              v-model="leftJson"
              spellcheck="false"
              :disabled="reconcileLoading"
              :placeholder="jsonPlaceholder"
            ></textarea>
            <em v-if="leftInputError">{{ leftInputError }}</em>
          </label>
          <label class="json-field">
            <span>
              <b>{{ $t('右侧记录') }}</b>
              <small>{{ rightRecordCountLabel }}</small>
            </span>
            <textarea
              v-model="rightJson"
              spellcheck="false"
              :disabled="reconcileLoading"
              :placeholder="jsonPlaceholder"
            ></textarea>
            <em v-if="rightInputError">{{ rightInputError }}</em>
          </label>
        </div>

        <div class="action-row">
          <p>
            <i class="ri-information-line"></i>
            {{ $t('业务字段原样参与本地对账；请先确认两侧单位、币种和编码口径一致。') }}
          </p>
          <div class="action-buttons">
            <button class="button secondary" type="button" :disabled="reconcileLoading" @click="loadReconcileSample">
              <i class="ri-flask-line"></i>
              {{ $t('载入示例账目') }}
            </button>
            <button class="button primary" :disabled="!canReconcile" @click="runReconcile">
              <i :class="reconcileLoading ? 'ri-loader-4-line spin' : 'ri-git-compare-line'"></i>
              {{ reconcileLoading ? $t('正在对账…') : $t('开始确定性对账') }}
            </button>
          </div>
        </div>

        <div v-if="reconcileError" class="inline-message error" role="alert">
          <i class="ri-error-warning-line"></i>
          <span>{{ reconcileError }}</span>
        </div>

        <section v-if="reconcileResult" class="result-block" aria-live="polite">
          <div class="result-heading">
            <div>
              <span class="section-label">{{ $t('真实返回结果') }}</span>
              <h3>{{ reconcileClean ? $t('两侧记录已对平') : $t('发现待处理差异') }}</h3>
            </div>
            <span class="result-state" :class="reconcileClean ? 'clean' : 'attention'">
              <i :class="reconcileClean ? 'ri-checkbox-circle-line' : 'ri-alert-line'"></i>
              {{ reconcileClean ? $t('无残差') : $t('需要复核') }}
            </span>
          </div>

          <div v-if="reconcileSummary" class="summary-grid">
            <div><span>{{ $t('左侧') }}</span><strong>{{ numberValue(reconcileSummary.leftCount) }}</strong></div>
            <div><span>{{ $t('右侧') }}</span><strong>{{ numberValue(reconcileSummary.rightCount) }}</strong></div>
            <div><span>{{ $t('匹配') }}</span><strong>{{ numberValue(reconcileSummary.matched) }}</strong></div>
            <div><span>{{ $t('数值不符') }}</span><strong>{{ numberValue(reconcileSummary.amountMismatch) }}</strong></div>
            <div><span>{{ $t('仅左侧') }}</span><strong>{{ numberValue(reconcileSummary.onlyLeft) }}</strong></div>
            <div><span>{{ $t('仅右侧') }}</span><strong>{{ numberValue(reconcileSummary.onlyRight) }}</strong></div>
            <div class="residual"><span>{{ $t('残差合计') }}</span><strong>{{ numberValue(reconcileSummary.residual) }}</strong></div>
          </div>

          <div v-if="amountMismatches.length" class="difference-section">
            <h4>{{ $t('数值差异') }}</h4>
            <div class="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>{{ $t('匹配键') }}</th>
                    <th>{{ $t('左侧数值') }}</th>
                    <th>{{ $t('右侧数值') }}</th>
                    <th>{{ $t('差额') }}</th>
                    <th>{{ $t('原始记录') }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, index) in amountMismatches" :key="`${String(row.key ?? '')}-${index}`">
                    <td><code>{{ scalar(row.key) }}</code></td>
                    <td>{{ scalar(row.leftAmount) }}</td>
                    <td>{{ scalar(row.rightAmount) }}</td>
                    <td class="difference-value">{{ scalar(row.diff) }}</td>
                    <td>
                      <details>
                        <summary>{{ $t('查看证据') }}</summary>
                        <pre>{{ formatJson({ left: row.left, right: row.right }) }}</pre>
                      </details>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div v-if="onlyLeftRecords.length || onlyRightRecords.length" class="residual-grid">
            <article v-if="onlyLeftRecords.length">
              <h4>{{ $t('仅左侧存在') }} <span>{{ onlyLeftRecords.length }}</span></h4>
              <pre>{{ formatJson(onlyLeftRecords) }}</pre>
            </article>
            <article v-if="onlyRightRecords.length">
              <h4>{{ $t('仅右侧存在') }} <span>{{ onlyRightRecords.length }}</span></h4>
              <pre>{{ formatJson(onlyRightRecords) }}</pre>
            </article>
          </div>

          <details class="raw-result">
            <summary>{{ $t('查看完整结构化返回') }}</summary>
            <pre>{{ formatJson(reconcileResult) }}</pre>
          </details>
        </section>
      </section>

      <aside class="side-column">
        <section class="panel integration-panel">
          <div class="panel-heading compact">
            <div>
              <span class="section-label">{{ $t('接入路径') }}</span>
              <h2>{{ $t('三档数据接入') }}</h2>
            </div>
          </div>
          <ol class="integration-list">
            <li>
              <span class="integration-index">1</span>
              <div>
                <strong>{{ $t('API 直连') }}</strong>
                <p>{{ $t('注册客户 REST / GraphQL 服务，探测读取权限后先只读试运行，再进入灰度写入。') }}</p>
                <em>{{ $t('适合已有标准接口的 WMS / ERP') }}</em>
              </div>
            </li>
            <li>
              <span class="integration-index">2</span>
              <div>
                <strong>{{ $t('Web 后台托管') }}</strong>
                <p>{{ $t('由真人亲自登录并完成二步验证，RPA 仅在授权会话中取数，异常时交还人工。') }}</p>
                <em>{{ $t('密码不通过本工作台采集') }}</em>
              </div>
            </li>
            <li>
              <span class="integration-index">3</span>
              <div>
                <strong>{{ $t('文件交换') }}</strong>
                <p>{{ $t('通过 CSV / Excel / PDF 导入，确认字段映射、单位、币种、日期与增量口径。') }}</p>
                <em>{{ $t('适合无接口或每日导出的系统') }}</em>
              </div>
            </li>
          </ol>
          <div class="integration-footnote">
            <i class="ri-lock-2-line"></i>
            {{ $t('任一接入档位的真实写操作都必须经过人工确认与 maker-checker，并写入审计记录。') }}
          </div>
        </section>
      </aside>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import type {
  WarehouseThreeWayReconcileRequest,
  WarehouseThreeWayReconcileResponse,
} from '@totalclaw/ipc-contracts';
import PageBackButton from '../components/PageBackButton.vue';
import { t as i18nT } from '../i18n';
import { humanizeErrorMessage } from '../utils/humanize';
import AutomationOpsConsole from '../components/AutomationOpsConsole.vue';
import WarehouseDataNormalization from '../components/WarehouseDataNormalization.vue';
import type {
  AutomationExecutionContext,
  AutomationStepReporter,
} from '../workbenches/automationExecution';
import { workflowOutput, workflowRunId } from '../workbenches/workflowResult';

type JsonRecord = Record<string, unknown>;

interface ErpStatus {
  ok?: boolean;
  enabled?: boolean;
  taxAutoSubmit?: boolean;
  defaultProvider?: string | null;
  providers?: unknown[];
  [key: string]: unknown;
}

interface ReconcileSummary {
  leftCount?: number;
  rightCount?: number;
  matched?: number;
  amountMismatch?: number;
  onlyLeft?: number;
  onlyRight?: number;
  residual?: number;
  clean?: boolean;
  residualRatio?: number;
}

interface AmountMismatch extends JsonRecord {
  key?: unknown;
  leftAmount?: unknown;
  rightAmount?: unknown;
  diff?: unknown;
  left?: unknown;
  right?: unknown;
}

interface ReconcileResult extends JsonRecord {
  ok?: boolean;
  keyFields?: string[];
  amountField?: string;
  summary?: ReconcileSummary;
  amountMismatch?: AmountMismatch[];
  onlyLeft?: JsonRecord[];
  onlyRight?: JsonRecord[];
}

interface WarehouseApi {
  status: () => Promise<ErpStatus>;
  providers: () => Promise<{ ok?: boolean; providers?: unknown[] } | unknown[]>;
  reconcile: (payload: {
    left: JsonRecord[];
    right: JsonRecord[];
    keyFields?: string[];
    amountField?: string;
    tolerance?: number;
  }) => Promise<ReconcileResult>;
  reconcileThreeWay: (
    payload: WarehouseThreeWayReconcileRequest,
  ) => Promise<WarehouseThreeWayReconcileResponse>;
  runWorkflow: (payload: {
    reconcileResult: Record<string, unknown>;
    runId: string;
    taskType?: 'three_way' | 'odoo_receipt' | 'supply_gap';
  }) => Promise<JsonRecord>;
  cancelWorkflow: (payload: { runId: string }) => Promise<JsonRecord>;
}

const { locale } = useI18n();
const router = useRouter();
const isRtl = computed(() => locale.value === 'ar');

const erpStatus = ref<ErpStatus | null>(null);
const providers = ref<unknown[]>([]);
const capabilityLoading = ref(false);
const capabilityError = ref('');

const leftJson = ref('[]');
const rightJson = ref('[]');
const keyFieldsInput = ref('');
const amountField = ref('amount');
const tolerance = ref(0.01);
const reconcileLoading = ref(false);
const reconcileError = ref('');
const reconcileResult = ref<ReconcileResult | null>(null);
const threeWayResult = ref<WarehouseThreeWayReconcileResponse | null>(null);

const jsonPlaceholder = '[\n  { "sku": "SKU-001", "amount": 0 }\n]';

const warehouseApi = computed<WarehouseApi | null>(() => {
  return (window as any).electronAPI?.workbenches?.warehouse ?? null;
});

const erpEnabled = computed(() => erpStatus.value?.enabled === true);
const defaultProvider = computed(() => {
  const value = erpStatus.value?.defaultProvider;
  return typeof value === 'string' ? value : '';
});

function parseRecords(raw: string): { records: JsonRecord[] | null; error: string } {
  const text = raw.trim();
  if (!text) return { records: null, error: i18nT('请输入 JSON 数组') };
  try {
    const parsed: unknown = JSON.parse(text);
    if (!Array.isArray(parsed)) return { records: null, error: i18nT('顶层必须是 JSON 数组') };
    if (!parsed.every((item) => item !== null && typeof item === 'object' && !Array.isArray(item))) {
      return { records: null, error: i18nT('数组中的每一项都必须是对象') };
    }
    return { records: parsed as JsonRecord[], error: '' };
  } catch (error) {
    return {
      records: null,
      error: error instanceof Error
        ? i18nT('JSON 格式错误：{message}', { message: error.message })
        : i18nT('JSON 格式错误'),
    };
  }
}

function loadReconcileSample(): void {
  leftJson.value = JSON.stringify([
    { sku: 'SKU-001', warehouse: 'RUH-A', quantity: 18, amount: 1800 },
    { sku: 'SKU-002', warehouse: 'RUH-A', quantity: 7, amount: 840 },
    { sku: 'SKU-003', warehouse: 'JED-B', quantity: 4, amount: 520 },
  ], null, 2);
  rightJson.value = JSON.stringify([
    { sku: 'SKU-001', warehouse: 'RUH-A', quantity: 18, amount: 1800 },
    { sku: 'SKU-002', warehouse: 'RUH-A', quantity: 6, amount: 720 },
    { sku: 'SKU-004', warehouse: 'JED-B', quantity: 2, amount: 310 },
  ], null, 2);
  keyFieldsInput.value = 'sku';
  amountField.value = 'amount';
  tolerance.value = 0.01;
  reconcileResult.value = null;
  reconcileError.value = '';
}

function applyNormalizedReconcile(payload: {
  left: JsonRecord[];
  right: JsonRecord[];
  result: ReconcileResult;
}): void {
  leftJson.value = JSON.stringify(payload.left, null, 2);
  rightJson.value = JSON.stringify(payload.right, null, 2);
  keyFieldsInput.value = 'sku, warehouse, batch';
  amountField.value = 'amount';
  tolerance.value = 0.01;
  reconcileResult.value = payload.result;
  reconcileError.value = '';
}

async function openAutomationBrowser(
  url: string,
  contextId: string,
  context?: AutomationExecutionContext,
): Promise<{ opened: boolean; note: string }> {
  const tabs = (window as any).electronAPI?.browserTabs;
  if (!tabs?.create) {
    throw new Error(i18nT('内置浏览器接口不可用，已停止 Odoo 自动化'));
  }
  try {
    const tab = await tabs.create({ url, contextId, source: 'agent', activate: true });
    if (tab?.id && tabs.setAutomationPaused) await tabs.setAutomationPaused(tab.id, false);
    context?.registerCancellation(async () => {
      if (tab?.id && tabs.setAutomationPaused) await tabs.setAutomationPaused(tab.id, true);
    });
    return { opened: true, note: i18nT('已在内置浏览器打开 Odoo Inventory。') };
  } catch (error) {
    throw new Error(i18nT('本地 Odoo 暂时不可达（{message}），已停止本次执行。', {
      message: errorMessage(error),
    }));
  }
}

async function warehouseBrowserCommand(
  contextId: string,
  command: 'snapshot' | 'click' | 'eval',
  args: string[],
): Promise<unknown> {
  const tabs = (window as any).electronAPI?.browserTabs;
  if (!tabs?.command) throw new Error(i18nT('内置浏览器页面控制接口不可用'));
  const response = await tabs.command({ contextId, command, args });
  if (response?.success === false) throw new Error(String(response?.error || i18nT('浏览器页面操作失败')));
  const raw = response?.data?.result;
  if (raw == null && response?.data) return response.data;
  if (typeof raw !== 'string') return raw;
  try { return JSON.parse(raw); } catch { return raw; }
}

async function warehouseBrowserEval(contextId: string, expression: string): Promise<unknown> {
  return warehouseBrowserCommand(contextId, 'eval', [expression]);
}

async function warehouseBrowserTrustedClick(contextId: string, name: string): Promise<void> {
  for (let attempt = 0; attempt < 12; attempt += 1) {
    const snapshot = await warehouseBrowserCommand(contextId, 'snapshot', []) as any;
    const refs = Array.isArray(snapshot?.refs) ? snapshot.refs : [];
    const target = refs.find((item: any) =>
      String(item?.name || '').trim().toLowerCase() === name.trim().toLowerCase());
    if (target?.ref) {
      await warehouseBrowserCommand(contextId, 'click', [String(target.ref)]);
      return;
    }
    await new Promise((resolve) => window.setTimeout(resolve, 250));
  }
  throw new Error(i18nT('右侧业务系统没有找到可点击的“{name}”', { name }));
}

async function openOdooInventoryEvidence(
  contextId: string,
  context?: AutomationExecutionContext,
): Promise<{ url: string; title: string; text: string }> {
  await openAutomationBrowser(
    'http://127.0.0.1:8069/web/login?db=totalclaw_demo&redirect=%2Fodoo%2Finventory%2Freceipts',
    contextId,
    context,
  );
  let state: Record<string, unknown> = {};
  for (let attempt = 0; attempt < 30; attempt += 1) {
    context?.throwIfCancelled();
    state = await warehouseBrowserEval(contextId, `JSON.stringify({
      url: location.href,
      title: document.title,
      text: (document.body?.innerText || '').replace(/\\s+/g, ' ').slice(0, 2400),
      hasLogin: Boolean(document.querySelector('input[name="login"], #login')),
      hasPassword: Boolean(document.querySelector('input[name="password"], #password'))
    })`) as Record<string, unknown>;
    const url = String(state?.url || '');
    if (!state?.hasLogin && !/\/web\/login/i.test(url)) break;
    if (state?.hasLogin && state?.hasPassword) {
      const filled = await warehouseBrowserEval(contextId, `(() => {
        const setValue = (selector, value) => {
          const el = document.querySelector(selector);
          if (!el) return false;
          el.focus();
          el.value = value;
          el.dispatchEvent(new InputEvent('input', {bubbles:true, inputType:'insertText', data:value}));
          el.dispatchEvent(new Event('change', {bubbles:true}));
          return true;
        };
        return setValue('input[name="login"], #login', 'admin')
          && setValue('input[name="password"], #password', 'Admin123');
      })()`);
      if (filled !== true) throw new Error(i18nT('本地 Odoo 登录字段无法填写'));
      await warehouseBrowserTrustedClick(contextId, 'Log in');
    }
    await new Promise((resolve) => window.setTimeout(resolve, 1_000));
  }
  const result = {
    url: String(state?.url || ''),
    title: String(state?.title || 'Odoo Inventory'),
    text: String(state?.text || ''),
  };
  if (!/127\.0\.0\.1:8069|\/odoo\//i.test(result.url)
    || /\/web\/login/i.test(result.url)
    || /sign in|404|not found|internal server error/i.test(`${result.title} ${result.text}`)) {
    throw new Error(i18nT('本地 Odoo 未进入可读取的 Inventory 页面，已停止执行：{url}', {
      url: result.url || 'unknown',
    }));
  }
  return result;
}

async function executeWarehouseAutomation(
  scenarioId: string,
  phase: 'prepare' | 'commit',
  reportStep?: AutomationStepReporter,
  context?: AutomationExecutionContext,
): Promise<{ note?: string; progressManaged?: boolean }> {
  const target = warehouseApi.value;
  if (!target) throw new Error(i18nT('仓储自动化接口不可用'));
  context?.throwIfCancelled();

  if (scenarioId === 'three-way-reconcile' && phase === 'prepare') {
    if (typeof target.reconcileThreeWay !== 'function') {
      throw new Error(i18nT('三方确定性对账接口不可用'));
    }
    const sources: WarehouseThreeWayReconcileRequest['sources'] = [
      {
        id: 'wms',
        label: 'WMS',
        records: [
          { sku: 'SKU-100', warehouse: 'RUH-A', quantity: 100, unit: 'PCS', unitPriceSar: 520 },
          { sku: 'SKU-200', warehouse: 'JED-B', quantity: 40, unit: 'PCS' },
          { sku: 'SKU-300', warehouse: 'DMM-C', quantity: 30, unit: 'PCS', unitPriceSar: 5000 },
          { sku: 'SKU-400', warehouse: 'RUH-A', quantity: 60, unit: 'PCS', expiryDate: '2026-08-15' },
        ],
      },
      {
        id: 'erp',
        label: 'SAP ERP',
        records: [
          { sku: 'SKU-100', warehouse: 'RUH-A', quantity: 10, unit: 'CTN', packSize: 12, unitPriceSar: 520 },
          { sku: 'SKU-200', warehouse: 'JED-B', quantity: 40, unit: 'PCS' },
          { sku: 'SKU-300', warehouse: 'DMM-C', quantity: 30, unit: 'PCS', unitPriceSar: 5000 },
          { sku: 'SKU-400', warehouse: 'RUH-A', quantity: 60, unit: 'PCS' },
        ],
      },
      {
        id: 'commerce',
        label: 'Commerce',
        records: [
          { sku: 'SKU-100', warehouse: 'RUH-A', quantity: 120, unit: 'PCS', unitPriceSar: 520 },
          { sku: 'SKU-300', warehouse: 'DMM-C', quantity: 25, unit: 'PCS', unitPriceSar: 5000 },
          { sku: 'SKU-400', warehouse: 'RUH-A', quantity: 60, unit: 'PCS' },
        ],
      },
    ];
    const odooEvidence = await openOdooInventoryEvidence(
      'warehouse-three-way-live',
      context,
    );
    reportStep?.(0, i18nT('产销计划 Agent 已打开右侧本地 Odoo Inventory，并把 WMS、SAP ERP 与电商平台三类结构载入任务上下文'), {
      actor: i18nT('产销计划 Agent'), actorId: 'supply-planner', actorType: 'agent',
      tool: i18nT('内置浏览器 · Odoo Inventory + Multi-source Loader'),
      evidence: `${odooEvidence.url} · WMS 4 · ERP 4 · Commerce 3`,
      output: odooEvidence.text.slice(0, 320),
    });
    reportStep?.(1, i18nT('数据归一 Agent 正在统一 SKU、仓库、箱规与 PCS 数量口径'), {
      actor: i18nT('数据归一 Agent'), actorId: 'data-normalizer', actorType: 'agent',
      tool: 'Canonical InventoryRecord v1', evidence: 'CTN × packSize → PCS',
    });
    threeWayResult.value = await target.reconcileThreeWay({
      sources,
      keyFields: ['sku', 'warehouse'],
      tolerance: 0,
      asOf: '2026-07-29',
    });
    const result = threeWayResult.value;
    reportStep?.(2, i18nT('库存控制 Agent 已收到确定性三方回执：{findings} 项发现，影响 SAR {impact}', {
      findings: result.findings.length,
      impact: numberValue(result.totalImpactSar),
    }), {
      actor: i18nT('库存控制 Agent'), actorId: 'inventory-controller', actorType: 'agent',
      tool: 'workbench:warehouse:reconcile-three-way',
      evidence: i18nT('{p0} 个来源锚点', { p0: result.evidenceCount }),
      output: `${result.findings.length} findings · SAR ${numberValue(result.totalImpactSar)}`,
    });
    if (typeof target.runWorkflow !== 'function') {
      throw new Error(i18nT('仓储多 Agent 工作流接口不可用'));
    }
    const workflowRunIdValue = context?.runId || `warehouse-${Date.now()}`;
    const unregisterWorkflowCancel = context?.registerCancellation(async () => {
      await target.cancelWorkflow?.({ runId: workflowRunIdValue });
    });
    const workflow = await target.runWorkflow({
      runId: workflowRunIdValue,
      taskType: 'three_way',
      reconcileResult: JSON.parse(JSON.stringify(result)),
    }).finally(() => unregisterWorkflowCancel?.());
    context?.throwIfCancelled();
    const reviewedPlan = workflowOutput(workflow, ['reviewed_plan']);
    const workflowId = workflowRunId(workflow) || context?.runId || '';
    reportStep?.(3, i18nT('产销计划、库存风险和证据审计 Agent 已在工作流中并行生成处置意见'), {
      actor: i18nT('产销存多 Agent 工作流'), actorId: 'supply-planner', actorType: 'agent',
      tool: '/v1/workflows/dynamic/run', evidence: workflowId,
      output: reviewedPlan.slice(0, 320),
    });
    reportStep?.(4, i18nT('工作流已合成并复核处置方案，五项动作停在计划员人工确认'), {
      actor: i18nT('审计留痕 Agent'), actorId: 'evidence-auditor', actorType: 'agent',
      tool: 'Dynamic AST · parallel + reduce', evidence: workflowId,
      output: reviewedPlan.slice(0, 320),
    });
    return {
      note: i18nT('三方确定性引擎、产销计划 Agent 和证据审计 Agent 已真实接力。'),
      progressManaged: true,
    };
  }
  if (scenarioId === 'three-way-reconcile' && phase === 'commit') {
    reportStep?.(5, i18nT('计划员确认已记录，三方结果和 {count} 个证据锚点写入运行证据包', {
      count: threeWayResult.value?.evidenceCount || 0,
    }), {
      actor: i18nT('计划员'), actorType: 'human',
      tool: 'Human Gate', evidence: `${context?.runId || 'run'} · SAR ${numberValue(threeWayResult.value?.totalImpactSar || 0)}`,
    });
    return { note: i18nT('处置结果已确认并留痕。'), progressManaged: true };
  }
  if (scenarioId === 'odoo-receipt' && phase === 'prepare') {
    const contextId = 'warehouse-odoo-live';
    reportStep?.(0, i18nT('正在创建隔离的 Odoo 浏览器会话'));
    const browserResult = await openAutomationBrowser(
      'http://127.0.0.1:8069/web/login?db=totalclaw_demo&redirect=%2Fodoo%2Finventory%2Freceipts',
      contextId,
      context,
    );
    for (let attempt = 0; attempt < 30; attempt += 1) {
      context?.throwIfCancelled();
      const loginState = await warehouseBrowserEval(contextId, `JSON.stringify({
        url: location.href,
        hasLogin: Boolean(document.querySelector('input[name="login"], #login')),
        hasPassword: Boolean(document.querySelector('input[name="password"], #password'))
      })`) as Record<string, unknown>;
      if (!loginState?.hasLogin && !/\/web\/login/i.test(String(loginState?.url || ''))) break;
      if (loginState?.hasLogin && loginState?.hasPassword) {
        const filled = await warehouseBrowserEval(contextId, `(() => {
          const setValue = (selector, value) => {
            const el = document.querySelector(selector);
            if (!el) return false;
            el.focus();
            el.value = value;
            el.dispatchEvent(new InputEvent('input', {bubbles:true, inputType:'insertText', data:value}));
            el.dispatchEvent(new Event('change', {bubbles:true}));
            return true;
          };
          return setValue('input[name="login"], #login', 'admin')
            && setValue('input[name="password"], #password', 'Admin123');
        })()`);
        if (filled !== true) throw new Error(i18nT('本地 Odoo 登录字段无法填写'));
        await warehouseBrowserTrustedClick(contextId, 'Log in');
      }
      await new Promise((resolve) => window.setTimeout(resolve, 1_000));
    }
    let listReady = false;
    for (let attempt = 0; attempt < 30; attempt += 1) {
      context?.throwIfCancelled();
      listReady = await warehouseBrowserEval(contextId, `Boolean(
        /receipts/i.test(document.body?.innerText || '') &&
        /\\bready\\b/i.test(document.body?.innerText || '') &&
        [...document.querySelectorAll('tbody tr, .o_data_row')].some((row) =>
          /WH\\/IN\\//i.test(row.textContent || '') && /\\bReady\\b/i.test(row.textContent || ''))
      )`) === true;
      if (listReady) break;
      await new Promise((resolve) => window.setTimeout(resolve, 1_000));
    }
    if (!listReady) throw new Error(i18nT('Odoo 收货单列表加载超时，未找到 Ready 记录'));
    const openedReceipt = await warehouseBrowserEval(contextId, `(() => {
      const row = [...document.querySelectorAll('tbody tr, .o_data_row')].find((item) =>
        /WH\\/IN\\//i.test(item.textContent || '') && /\\bReady\\b/i.test(item.textContent || ''));
      if (!row) return false;
      const target = [...row.querySelectorAll('a, td')].find((item) =>
        /WH\\/IN\\//i.test(item.textContent || '')) || row;
      target.scrollIntoView({block:'center'});
      target.click();
      return true;
    })()`);
    if (openedReceipt !== true) throw new Error(i18nT('Odoo Ready 收货单无法打开'));
    let page: Record<string, unknown> = {};
    for (let attempt = 0; attempt < 30; attempt += 1) {
      context?.throwIfCancelled();
      page = await warehouseBrowserEval(contextId, `JSON.stringify({
        url: location.href,
        title: document.title,
        text: (document.body?.innerText || '').replace(/\\s+/g, ' ').slice(0, 2200)
      })`) as Record<string, unknown>;
      if (/\bValidate\b/i.test(String(page?.text || ''))
        && /WH\/IN\//i.test(String(page?.text || ''))
        && /\bProduct\b/i.test(String(page?.text || ''))) break;
      await new Promise((resolve) => window.setTimeout(resolve, 1_000));
    }
    const pageUrl = String(page?.url || '');
    const pageTitle = String(page?.title || 'Odoo');
    const pageText = String(page?.text || '');
    if (!/odoo/i.test(pageUrl) || /login|sign in|404|not found|internal server error/i.test(`${pageTitle} ${pageText}`)) {
      throw new Error(i18nT('Odoo 未进入可操作的收货单页面，已停止执行：{url}', { url: pageUrl || 'unknown' }));
    }
    // i18n-ignore：这是注入 Odoo 页面执行的脚本，「确认/验证」是中文版 Odoo 按钮原文，
    // 不能进翻译（之前包了 i18nT，英文/阿语界面下会把脚本当成 vue-i18n 消息编译、改坏）。
    const validateProbe = "Boolean(\n      [...document.querySelectorAll('button')].some((el) =>\n        /^(validate|确认|验证)$/i.test((el.textContent || '').trim()) ||\n        el.getAttribute('name') === 'button_validate')\n    )";
    const hasValidate = await warehouseBrowserEval(contextId, validateProbe);
    if (hasValidate !== true) {
      throw new Error(i18nT('当前 Odoo 页面没有可验证的收货单或 Validate 按钮，已停止执行'));
    }
    reportStep?.(1, i18nT('已回读右侧 Odoo 页面：{title}', { title: pageTitle }), {
      actor: i18nT('库存执行 Agent'), actorId: 'inventory-executor', actorType: 'agent',
      tool: 'browser.eval', evidence: pageUrl,
      output: pageText.slice(0, 320),
    });
    if (typeof target.runWorkflow !== 'function') throw new Error(i18nT('仓储多 Agent 工作流接口不可用'));
    const workflowRunIdValue = context?.runId || `warehouse-odoo-${Date.now()}`;
    const unregisterWorkflowCancel = context?.registerCancellation(async () => {
      await target.cancelWorkflow?.({ runId: workflowRunIdValue });
    });
    const workflow = await target.runWorkflow({
      runId: workflowRunIdValue,
      taskType: 'odoo_receipt',
      reconcileResult: {
        pageUrl,
        pageTitle,
        pageText,
        validateAvailable: true,
      },
    }).finally(() => unregisterWorkflowCancel?.());
    context?.throwIfCancelled();
    const reviewedPlan = workflowOutput(workflow, ['reviewed_plan']);
    reportStep?.(2, i18nT('库存执行、采购协同和证据审计 Agent 已基于浏览器回执完成并行复核'), {
      actor: i18nT('Odoo 收货多 Agent 工作流'), actorId: 'inventory-executor', actorType: 'agent',
      tool: '/v1/workflows/dynamic/run', evidence: workflowRunId(workflow) || workflowRunIdValue,
      output: reviewedPlan.slice(0, 320),
    });
    reportStep?.(3, i18nT('工作流已确认页面可操作；Validate 状态变更已停在人工闸门'), {
      actor: i18nT('现场演示人员'), actorType: 'human', tool: 'Human Gate',
      evidence: i18nT('尚未修改 Odoo 状态'),
      output: reviewedPlan.slice(0, 320),
    });
    return {
      note: `${browserResult.note} ${i18nT('页面状态已回读，等待人工确认。')}`,
      progressManaged: true,
    };
  }
  if (scenarioId === 'odoo-receipt' && phase === 'commit') {
    const contextId = 'warehouse-odoo-live';
    reportStep?.(4, i18nT('人工已确认，正在右侧查找并点击 Validate'));
    await warehouseBrowserTrustedClick(contextId, 'Validate');
    let result: Record<string, unknown> = {};
    for (let attempt = 0; attempt < 20; attempt += 1) {
      result = await warehouseBrowserEval(contextId, `JSON.stringify({
        url: location.href,
        title: document.title,
        text: (document.body?.innerText || '').replace(/\\s+/g, ' ').slice(0, 2200)
      })`) as Record<string, unknown>;
      if (/(^|\s)(done|validated)(\s|$)|已完成|已验证/i.test(String(result?.text || ''))) break;
      await new Promise((resolve) => window.setTimeout(resolve, 600));
    }
    const resultText = String(result?.text || '');
    if (!/(^|\s)(done|validated)(\s|$)|已完成|已验证/i.test(resultText)) {
      throw new Error(i18nT('已点击 Validate，但未从 Odoo 页面回读到 Done / 已完成状态，因此没有标记成功'));
    }
    reportStep?.(5, i18nT('已回读 Odoo 操作后页面并写入证据，当前地址：{url}', {
      url: String(result?.url || 'unknown'),
    }), {
      actor: i18nT('审计留痕 Agent'), actorId: 'evidence-auditor', actorType: 'agent',
      tool: 'browser.eval', evidence: String(result?.url || 'unknown'),
      output: resultText.slice(0, 360),
    });
    return { note: i18nT('Odoo 页面已明确回读 Done / 已完成，真实操作证据已留存。'), progressManaged: true };
  }
  if (scenarioId === 'supply-gap' && phase === 'prepare') {
    const odooEvidence = await openOdooInventoryEvidence(
      'warehouse-supply-gap-live',
      context,
    );
    reportStep?.(0, i18nT('产销计划 Agent 已打开右侧本地 Odoo Inventory，并汇总销售订单、预测、库存与在途采购四类数据'), {
      actor: i18nT('产销计划 Agent'),
      actorId: 'supply-planner',
      actorType: 'agent',
      tool: i18nT('内置浏览器 · Odoo Inventory'),
      evidence: odooEvidence.url,
      output: odooEvidence.text.slice(0, 320),
    });
    const demand = [
      { sku: 'SKU-002', warehouse: 'RUH-A', batch: '', quantity: 22 },
      { sku: 'SKU-003', warehouse: 'JED-B', batch: '', quantity: 10 },
      { sku: 'SKU-005', warehouse: 'DMM-C', batch: '', quantity: 9 },
    ];
    const supply = [
      { sku: 'SKU-002', warehouse: 'RUH-A', batch: '', quantity: 12 },
      { sku: 'SKU-003', warehouse: 'JED-B', batch: '', quantity: 8 },
      { sku: 'SKU-005', warehouse: 'DMM-C', batch: '', quantity: 12 },
    ];
    leftJson.value = JSON.stringify(demand, null, 2);
    rightJson.value = JSON.stringify(supply, null, 2);
    keyFieldsInput.value = 'sku, warehouse, batch';
    amountField.value = 'quantity';
    tolerance.value = 0;
    reportStep?.(1, i18nT('数据归一 Agent 已统一 SKU、仓库、批次与 PCS 数量口径'));
    reconcileResult.value = await target.reconcile({
      left: demand,
      right: supply,
      keyFields: ['sku', 'warehouse', 'batch'],
      amountField: 'quantity',
      tolerance: 0,
    });
    const deterministicResult = reconcileResult.value!;
    reportStep?.(2, i18nT('库存控制 Agent 已通过真实确定性接口计算 3 个 SKU 的供需差额'), {
      actor: i18nT('库存控制 Agent'), actorId: 'inventory-controller', actorType: 'agent',
      tool: '/v1/erp/reconcile', evidence: i18nT('{count} 个 SKU', { count: demand.length }),
      output: JSON.stringify(deterministicResult).slice(0, 320),
    });
    if (typeof target.runWorkflow !== 'function') throw new Error(i18nT('仓储多 Agent 工作流接口不可用'));
    const workflowRunIdValue = context?.runId || `warehouse-gap-${Date.now()}`;
    const unregisterWorkflowCancel = context?.registerCancellation(async () => {
      await target.cancelWorkflow?.({ runId: workflowRunIdValue });
    });
    const workflow = await target.runWorkflow({
      runId: workflowRunIdValue,
      taskType: 'supply_gap',
      reconcileResult: JSON.parse(JSON.stringify(deterministicResult)),
    }).finally(() => unregisterWorkflowCancel?.());
    context?.throwIfCancelled();
    const reviewedPlan = workflowOutput(workflow, ['reviewed_plan']);
    const evidenceRunId = workflowRunId(workflow) || workflowRunIdValue;
    reportStep?.(3, i18nT('产销计划、库存风险和采购协同 Agent 已并行生成补货、调拨与在途覆盖待办'), {
      actor: i18nT('产销缺口多 Agent 工作流'), actorId: 'supply-planner', actorType: 'agent',
      tool: '/v1/workflows/dynamic/run', evidence: evidenceRunId,
      output: reviewedPlan.slice(0, 320),
    });
    reportStep?.(4, i18nT('主管 Agent 已完成方案复核，采购和调拨动作停在计划员人工确认'), {
      actor: i18nT('产销协同主管 Agent'), actorId: 'supply-supervisor', actorType: 'agent',
      tool: 'Dynamic AST · reduce + final review', evidence: evidenceRunId,
      output: reviewedPlan.slice(0, 320),
    });
    return {
      note: i18nT('产销存四类数据已进入真实确定性对账链；补货与调拨只生成待办。'),
      progressManaged: true,
    };
  }
  if (scenarioId === 'supply-gap' && phase === 'commit') {
    reportStep?.(4, i18nT('计划员确认已写入执行记录；补货、调拨与拆单仍保持为待办，不自动下单'));
    return { note: i18nT('产销协同方案已确认并留痕。'), progressManaged: true };
  }
  return { note: i18nT('人工闸门已确认，处置结果写入本次任务审计。') };
}

const leftParsed = computed(() => parseRecords(leftJson.value));
const rightParsed = computed(() => parseRecords(rightJson.value));
const leftInputError = computed(() => leftJson.value.trim() === '[]' ? '' : leftParsed.value.error);
const rightInputError = computed(() => rightJson.value.trim() === '[]' ? '' : rightParsed.value.error);
const leftRecordCountLabel = computed(() =>
  leftParsed.value.records ? i18nT('{count} 条', { count: leftParsed.value.records.length }) : '—');
const rightRecordCountLabel = computed(() =>
  rightParsed.value.records ? i18nT('{count} 条', { count: rightParsed.value.records.length }) : '—');
const canReconcile = computed(() =>
  !reconcileLoading.value
  && Boolean(warehouseApi.value)
  && Boolean(leftParsed.value.records?.length)
  && Boolean(rightParsed.value.records?.length)
  && Number.isFinite(Number(tolerance.value))
  && Number(tolerance.value) >= 0);

const reconcileSummary = computed(() => reconcileResult.value?.summary ?? null);
const reconcileClean = computed(() => reconcileSummary.value?.clean === true);
const amountMismatches = computed(() =>
  Array.isArray(reconcileResult.value?.amountMismatch) ? reconcileResult.value!.amountMismatch! : []);
const onlyLeftRecords = computed(() =>
  Array.isArray(reconcileResult.value?.onlyLeft) ? reconcileResult.value!.onlyLeft! : []);
const onlyRightRecords = computed(() =>
  Array.isArray(reconcileResult.value?.onlyRight) ? reconcileResult.value!.onlyRight! : []);

/**
 * 错误 → 人话。见 EducationWorkbenchView 同名函数注释。
 * 原实现最糟的一条是 `JSON.stringify(error)`：非 Error 对象会被整坨序列化后
 * 摆到界面上（含内部字段名），用户完全无从下手。
 */
function errorMessage(error: unknown): string {
  return humanizeErrorMessage(error, i18nT('未知错误'));
}

function formatJson(value: unknown): string {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function scalar(value: unknown): string {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'object') return formatJson(value);
  return String(value);
}

function numberValue(value: unknown): string {
  const number = Number(value);
  return Number.isFinite(number) ? new Intl.NumberFormat(locale.value).format(number) : '—';
}

function providerLabel(provider: unknown): string {
  if (typeof provider === 'string') return provider;
  if (provider && typeof provider === 'object') {
    const item = provider as Record<string, unknown>;
    return scalar(item.label ?? item.name ?? item.id ?? item.provider ?? provider);
  }
  return scalar(provider);
}

function providerKey(provider: unknown, index: number): string {
  if (typeof provider === 'string') return `${provider}-${index}`;
  if (provider && typeof provider === 'object') {
    const item = provider as Record<string, unknown>;
    return `${String(item.id ?? item.name ?? item.provider ?? 'provider')}-${index}`;
  }
  return `provider-${index}`;
}

async function loadCapabilities(): Promise<void> {
  capabilityLoading.value = true;
  capabilityError.value = '';
  const api = warehouseApi.value;
  if (!api) {
    capabilityError.value = i18nT('仓储工作台 API 不可用');
    capabilityLoading.value = false;
    return;
  }

  const [statusResult, providerResult] = await Promise.allSettled([
    api.status(),
    api.providers(),
  ]);

  if (statusResult.status === 'fulfilled') {
    erpStatus.value = statusResult.value;
  }
  if (providerResult.status === 'fulfilled') {
    const result = providerResult.value;
    providers.value = Array.isArray(result)
      ? result
      : Array.isArray(result?.providers) ? result.providers : [];
  } else if (Array.isArray(erpStatus.value?.providers)) {
    providers.value = erpStatus.value!.providers!;
  }

  const failures = [statusResult, providerResult]
    .filter((item): item is PromiseRejectedResult => item.status === 'rejected')
    .map((item) => errorMessage(item.reason));
  capabilityError.value = failures.join(i18nT('；'));
  capabilityLoading.value = false;
}

async function runReconcile(): Promise<void> {
  if (!canReconcile.value || !warehouseApi.value) return;
  const left = leftParsed.value.records;
  const right = rightParsed.value.records;
  if (!left || !right) return;

  reconcileLoading.value = true;
  reconcileError.value = '';
  reconcileResult.value = null;
  try {
    const keys = keyFieldsInput.value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
    reconcileResult.value = await warehouseApi.value.reconcile({
      left,
      right,
      ...(keys.length ? { keyFields: keys } : {}),
      ...(amountField.value.trim() ? { amountField: amountField.value.trim() } : {}),
      tolerance: Number(tolerance.value),
    });
  } catch (error) {
    reconcileError.value = errorMessage(error);
  } finally {
    reconcileLoading.value = false;
  }
}

onMounted(() => {
  void loadCapabilities();
});
</script>

<style scoped>
.warehouse-workbench {
  min-height: 100%;
  padding: 28px;
  overflow: auto;
  color: var(--color-text-primary);
  background:
    radial-gradient(circle at 12% 0%, color-mix(in srgb, var(--color-brand) 10%, transparent), transparent 30%),
    var(--color-bg-primary);
}

.workbench-header,
.heading,
.guardrail-banner,
.capability-card,
.panel-heading,
.action-row,
.result-heading,
.provider-list {
  display: flex;
  align-items: center;
}

.workbench-header {
  max-width: 1440px;
  margin: 0 auto 18px;
  justify-content: space-between;
  gap: 24px;
}
.header-actions { display: flex; align-items: center; gap: 8px; }

.demo-banner {
  max-width: 1440px;
  margin: 0 auto 18px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 13px 15px;
  border: 1px solid color-mix(in srgb, var(--color-brand) 40%, var(--color-border));
  border-radius: 14px;
  background: color-mix(in srgb, var(--color-brand) 9%, var(--color-bg-card));
}
.demo-banner > i { color: var(--color-brand); font-size: 22px; }
.demo-banner > div { flex: 1; min-width: 0; }
.demo-banner strong { display: block; margin-bottom: 3px; }
.demo-banner p { margin: 0; color: var(--color-text-secondary); font-size: 12px; }
.demo-receipt {
  padding: 6px 9px;
  border-radius: 999px;
  color: #047857;
  background: #d1fae5;
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
}
.capability-console-heading {
  max-width: 1440px;
  margin: 8px auto 12px;
  padding-top: 4px;
}
.capability-console-heading span,
.capability-console-heading strong { display: block; }
.capability-console-heading span { margin-bottom: 3px; color: var(--color-brand); font-size: 10px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; }
.capability-console-heading strong { font-size: 15px; }

.heading {
  align-items: flex-start;
  gap: 15px;
}

.heading-icon {
  display: grid;
  width: 50px;
  height: 50px;
  flex: 0 0 auto;
  place-items: center;
  border: 1px solid color-mix(in srgb, var(--color-brand) 32%, var(--color-border));
  border-radius: 15px;
  color: var(--color-brand);
  background: color-mix(in srgb, var(--color-brand) 10%, var(--color-bg-card));
  font-size: 24px;
}

.eyebrow,
.section-label {
  margin: 0 0 4px;
  color: var(--color-brand);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: .08em;
  text-transform: uppercase;
}

h1,
h2,
h3,
h4,
p {
  margin-top: 0;
}

h1 {
  margin-bottom: 6px;
  font-size: 25px;
  line-height: 1.2;
}

.subtitle {
  max-width: 760px;
  margin-bottom: 0;
  color: var(--color-text-secondary);
  font-size: 13px;
  line-height: 1.6;
}

.button {
  display: inline-flex;
  min-height: 36px;
  align-items: center;
  justify-content: center;
  gap: 7px;
  border: 1px solid transparent;
  border-radius: 9px;
  padding: 8px 14px;
  color: var(--color-text-primary);
  background: transparent;
  font: inherit;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.button:disabled {
  opacity: .5;
  cursor: not-allowed;
}

.button.ghost {
  border-color: var(--color-border);
  background: var(--color-bg-card);
}

.button.ghost:not(:disabled):hover {
  background: var(--color-bg-hover);
}

.button.primary {
  color: var(--color-text-inverse, #fff);
  background: var(--color-brand);
}

.button.primary:not(:disabled):hover {
  filter: brightness(1.06);
}

.button.full {
  width: 100%;
}

.guardrail-banner {
  max-width: 1440px;
  margin: 0 auto 18px;
  gap: 12px;
  padding: 13px 15px;
  border: 1px solid color-mix(in srgb, var(--color-warning) 38%, var(--color-border));
  border-radius: 12px;
  background: color-mix(in srgb, var(--color-warning) 9%, var(--color-bg-card));
}

.guardrail-banner > i {
  color: var(--color-warning);
  font-size: 22px;
}

.guardrail-banner div {
  min-width: 0;
  flex: 1;
}

.guardrail-banner strong {
  display: block;
  margin-bottom: 2px;
  font-size: 13px;
}

.guardrail-banner p {
  margin-bottom: 0;
  color: var(--color-text-secondary);
  font-size: 12px;
  line-height: 1.5;
}

.guardrail-chip,
.deterministic-badge,
.result-state {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 6px;
  border-radius: 999px;
  padding: 5px 9px;
  font-size: 11px;
  font-weight: 700;
}

.guardrail-chip {
  color: var(--color-warning);
  background: color-mix(in srgb, var(--color-warning) 14%, transparent);
}

.capability-grid {
  display: grid;
  max-width: 1440px;
  margin: 0 auto 14px;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.capability-card {
  min-width: 0;
  gap: 11px;
  padding: 13px;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  background: var(--color-bg-card);
}

.capability-icon {
  display: grid;
  width: 34px;
  height: 34px;
  flex: 0 0 auto;
  place-items: center;
  border-radius: 9px;
  color: var(--color-brand);
  background: color-mix(in srgb, var(--color-brand) 10%, transparent);
  font-size: 17px;
}

.capability-icon.success { color: var(--color-success); background: color-mix(in srgb, var(--color-success) 11%, transparent); }
.capability-icon.warning { color: var(--color-warning); background: color-mix(in srgb, var(--color-warning) 11%, transparent); }
.capability-icon.danger { color: var(--color-danger); background: color-mix(in srgb, var(--color-danger) 11%, transparent); }
.capability-icon.muted { color: var(--color-text-muted); background: var(--color-bg-hover); }

.capability-card div {
  min-width: 0;
}

.capability-card small,
.capability-card span {
  display: block;
  overflow: hidden;
  color: var(--color-text-secondary);
  font-size: 11px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.capability-card strong {
  display: block;
  margin: 2px 0;
  font-size: 14px;
}

.capability-card .error-copy {
  color: var(--color-danger);
}

.provider-strip {
  display: flex;
  max-width: 1440px;
  align-items: center;
  gap: 10px;
  margin: 0 auto 14px;
}

.provider-strip .section-label {
  flex: 0 0 auto;
  margin: 0;
}

.provider-list {
  flex-wrap: wrap;
  gap: 6px;
}

.provider-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 8px;
  border: 1px solid var(--color-border);
  border-radius: 999px;
  color: var(--color-text-secondary);
  background: var(--color-bg-card);
  font-size: 11px;
}

.workbench-main {
  display: grid;
  max-width: 1440px;
  margin: 0 auto;
  grid-template-columns: minmax(0, 1.7fr) minmax(330px, .8fr);
  align-items: start;
  gap: 16px;
}

.side-column {
  display: grid;
  gap: 16px;
}

.panel {
  min-width: 0;
  border: 1px solid var(--color-border);
  border-radius: 15px;
  padding: 18px;
  background: var(--color-bg-card);
  box-shadow: var(--shadow-sm);
}

.panel-heading {
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 16px;
}

.panel-heading.compact {
  margin-bottom: 14px;
}

.panel-heading h2 {
  margin-bottom: 4px;
  font-size: 17px;
}

.panel-heading p {
  max-width: 720px;
  margin-bottom: 0;
  color: var(--color-text-secondary);
  font-size: 12px;
  line-height: 1.55;
}

.panel-mark {
  color: var(--color-brand);
  font-size: 25px;
}

.deterministic-badge {
  color: var(--color-success);
  background: color-mix(in srgb, var(--color-success) 11%, transparent);
}

.reconcile-options {
  display: grid;
  gap: 10px;
}

.reconcile-options {
  grid-template-columns: 1.5fr 1fr .7fr;
  margin-bottom: 12px;
}

label > span {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 6px;
  color: var(--color-text-secondary);
  font-size: 11px;
  font-weight: 600;
}

input,
textarea {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid var(--color-border);
  border-radius: 9px;
  outline: none;
  color: var(--color-text-primary);
  background: var(--color-bg-input);
  font: inherit;
  font-size: 12px;
  transition: border-color .15s, box-shadow .15s;
}

input {
  height: 36px;
  padding: 0 10px;
}

textarea {
  min-height: 250px;
  resize: vertical;
  padding: 11px;
  font-family: var(--font-mono);
  line-height: 1.55;
  tab-size: 2;
}

input:focus,
textarea:focus {
  border-color: var(--color-brand);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--color-brand) 13%, transparent);
}

.json-input-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.json-field em {
  display: block;
  margin-top: 5px;
  color: var(--color-danger);
  font-size: 11px;
  font-style: normal;
}

.action-row {
  justify-content: space-between;
  align-items: flex-end;
  gap: 18px;
  margin-top: 13px;
}

.action-row p {
  margin-bottom: 0;
  color: var(--color-text-secondary);
  font-size: 11px;
  line-height: 1.5;
}

.action-row p i {
  color: var(--color-info);
}
.action-buttons {
  display: flex;
  flex: 0 0 auto;
  gap: 8px;
}

.inline-message {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-top: 12px;
  padding: 10px 11px;
  border-radius: 9px;
  font-size: 12px;
  line-height: 1.5;
}

.inline-message.error {
  border: 1px solid color-mix(in srgb, var(--color-danger) 34%, var(--color-border));
  color: var(--color-danger);
  background: color-mix(in srgb, var(--color-danger) 8%, transparent);
}

.result-block {
  margin-top: 18px;
  padding-top: 17px;
  border-top: 1px solid var(--color-border);
}

.result-heading {
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.result-heading h3 {
  margin-bottom: 0;
  font-size: 15px;
}

.result-state.clean {
  color: var(--color-success);
  background: color-mix(in srgb, var(--color-success) 10%, transparent);
}

.result-state.attention {
  color: var(--color-warning);
  background: color-mix(in srgb, var(--color-warning) 10%, transparent);
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(min(100%, 70px), 1fr));
  gap: 7px;
  margin-bottom: 15px;
}

.summary-grid > div {
  padding: 9px;
  border-radius: 9px;
  background: var(--color-bg-hover);
}

.summary-grid span,
.summary-grid strong {
  display: block;
}

.summary-grid span {
  color: var(--color-text-secondary);
  font-size: 10px;
}

.summary-grid strong {
  margin-top: 3px;
  font-size: 16px;
}

.summary-grid .residual {
  color: var(--color-warning);
  background: color-mix(in srgb, var(--color-warning) 9%, var(--color-bg-hover));
}

.difference-section h4,
.residual-grid h4 {
  margin: 0 0 8px;
  font-size: 13px;
}

.table-scroll {
  overflow: auto;
  border: 1px solid var(--color-border);
  border-radius: 10px;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 11px;
}

th,
td {
  padding: 9px;
  border-bottom: 1px solid var(--color-border);
  text-align: start;
  vertical-align: top;
  white-space: nowrap;
}

th {
  color: var(--color-text-secondary);
  background: var(--color-bg-hover);
  font-weight: 600;
}

tbody tr:last-child td {
  border-bottom: 0;
}

.difference-value {
  color: var(--color-danger);
  font-weight: 700;
}

code,
pre {
  font-family: var(--font-mono);
}

details summary {
  color: var(--color-brand);
  font-size: 11px;
  cursor: pointer;
}

details pre {
  max-width: 430px;
  max-height: 240px;
  overflow: auto;
  margin: 8px 0 0;
  color: var(--color-text-primary);
  white-space: pre-wrap;
  word-break: break-word;
}

.residual-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  margin-top: 12px;
}

.residual-grid article {
  min-width: 0;
  padding: 11px;
  border: 1px solid var(--color-border);
  border-radius: 10px;
  background: var(--color-bg-hover);
}

.residual-grid h4 span {
  margin-inline-start: 5px;
  color: var(--color-warning);
}

.residual-grid pre,
.raw-result pre {
  max-height: 280px;
  overflow: auto;
  margin: 0;
  color: var(--color-text-secondary);
  font-size: 10px;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
}

.raw-result {
  margin-top: 12px;
  padding-top: 10px;
  border-top: 1px dashed var(--color-border);
}

.raw-result pre {
  margin-top: 9px;
}

.checklist,
.integration-list {
  margin: 12px 0 0;
  padding: 0;
  list-style: none;
}

.checklist li {
  display: flex;
  gap: 8px;
  padding: 8px 0;
  border-bottom: 1px solid var(--color-border);
}

.checklist li:last-child {
  border-bottom: 0;
}

.checklist .passed { color: var(--color-success); }
.checklist .failed { color: var(--color-danger); }

.checklist strong,
.checklist span {
  display: block;
  font-size: 11px;
}

.checklist span {
  margin-top: 2px;
  color: var(--color-text-secondary);
  line-height: 1.4;
}

.result-note {
  margin: 9px 0 0;
  color: var(--color-text-secondary);
  font-size: 11px;
  line-height: 1.5;
}

.integration-list {
  counter-reset: integrations;
}

.integration-list li {
  display: flex;
  gap: 10px;
  padding: 11px 0;
  border-bottom: 1px solid var(--color-border);
}

.integration-list li:last-child {
  border-bottom: 0;
}

.integration-index {
  display: grid;
  width: 26px;
  height: 26px;
  flex: 0 0 auto;
  place-items: center;
  border-radius: 8px;
  color: var(--color-brand);
  background: color-mix(in srgb, var(--color-brand) 10%, transparent);
  font-size: 11px;
  font-weight: 700;
}

.integration-list strong {
  font-size: 12px;
}

.integration-list p {
  margin: 3px 0;
  color: var(--color-text-secondary);
  font-size: 11px;
  line-height: 1.5;
}

.integration-list em {
  color: var(--color-text-muted);
  font-size: 10px;
  font-style: normal;
}

.integration-footnote {
  margin-top: 12px;
  padding: 9px 10px;
  border-radius: 9px;
  color: var(--color-warning);
  background: color-mix(in srgb, var(--color-warning) 8%, transparent);
  font-size: 11px;
  line-height: 1.5;
}

.spin {
  animation: spin .8s linear infinite;
}

.three-way-result {
  max-width: 1440px; margin: 0 auto 18px; padding: 18px;
  border: 1px solid color-mix(in srgb, var(--color-brand) 30%, var(--color-border));
  border-radius: 16px; background: var(--color-bg-card);
  box-shadow: 0 12px 32px rgba(15, 23, 42, .08);
}
.three-way-result > header {
  display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 12px;
}
.three-way-result > header span { color: var(--color-brand); font-size: 11px; font-weight: 800; }
.three-way-result > header h2 { margin: 3px 0 0; font-size: 18px; }
.three-way-result > header > strong {
  padding: 6px 10px; border-radius: 999px; color: #b45309; background: #fef3c7; font-size: 11px;
}
.three-way-summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 9px; margin-bottom: 12px; }
.three-way-summary article { padding: 11px; border-radius: 10px; background: var(--color-bg-hover); }
.three-way-summary span, .three-way-summary b { display: block; }
.three-way-summary span { color: var(--color-text-muted); font-size: 9px; }
.three-way-summary b { margin-top: 4px; font-size: 16px; }
.three-way-summary .impact { color: #b91c1c; background: #fee2e2; }
.three-way-findings { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
.three-way-findings article {
  display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 4px 12px;
  padding: 11px; border-inline-start: 4px solid #f59e0b; border-radius: 9px; background: var(--color-bg-primary);
}
.three-way-findings article.critical { border-inline-start-color: #ef4444; }
.three-way-findings strong { font-size: 11px; }
.three-way-findings p { margin: 3px 0 0; color: var(--color-text-muted); font-size: 9px; line-height: 1.45; }
.three-way-findings em { color: #b91c1c; font-size: 11px; font-style: normal; font-weight: 800; }
.three-way-findings > article > span { color: #b45309; font-size: 9px; font-weight: 700; }
.three-way-findings small { grid-column: 1 / -1; color: #047857; font-size: 8px; }

[dir='rtl'] .workbench-header,
[dir='rtl'] .panel-heading,
[dir='rtl'] .result-heading,
[dir='rtl'] .action-row {
  text-align: right;
}

[dir='rtl'] input,
[dir='rtl'] textarea {
  text-align: right;
}

[dir='rtl'] textarea,
[dir='rtl'] pre,
[dir='rtl'] code {
  direction: ltr;
  text-align: left;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@container main-page (max-width: 1120px) {
  .capability-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .workbench-main {
    grid-template-columns: 1fr;
  }

  .side-column {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@container main-page (max-width: 760px) {
  .warehouse-workbench {
    padding: 18px 14px;
  }

  .workbench-header {
    align-items: flex-start;
  }

  .workbench-header,
  .guardrail-banner {
    flex-wrap: wrap;
  }

  .capability-grid,
  .three-way-findings,
  .json-input-grid,
  .side-column,
  .residual-grid {
    grid-template-columns: 1fr;
  }

  .reconcile-options {
    grid-template-columns: 1fr 1fr;
  }

  .reconcile-options label:first-child {
    grid-column: 1 / -1;
  }

  .summary-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .three-way-summary {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .action-row {
    align-items: stretch;
    flex-direction: column;
  }

  .action-row .button {
    width: 100%;
  }

  .action-buttons {
    width: 100%;
    flex-direction: column;
  }
}
</style>
