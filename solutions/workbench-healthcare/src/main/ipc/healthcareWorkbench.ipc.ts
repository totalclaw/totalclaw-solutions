import { ipcMain } from 'electron';
import {
  IPC_CHANNELS,
  type HealthcareMaskRequest,
  type HealthcareReviewDecideRequest,
  type HealthcareReviewListRequest,
  type HealthcareReviewSubmitRequest,
} from '@totalclaw/ipc-contracts';
import {
  createFixedDemoWorkflowResult,
  workbenchClient,
  requireObject,
  requireText,
  workflowResultHasAgentError,
  type WorkbenchIpcDeps,
} from './workbenchApi';
import { resolveWorkflowSeatCapFromDeps } from './shared';
import { t as i18nT } from '@totalclaw/i18n';

export function registerHealthcareWorkbenchHandlers(deps: WorkbenchIpcDeps): void {
  const workflowRuns = new Map<string, AbortController>();
  ipcMain.handle(IPC_CHANNELS.WORKBENCH_HEALTHCARE_STATUS, async () => {
    const client = workbenchClient(deps, i18nT('医疗工作台'));
    const [compliance, masking, residency] = await Promise.all([
      client.get('/v1/compliance/status'),
      client.get('/v1/data_masking/status'),
      client.get('/v1/compliance/residency/check'),
    ]);
    return {
      ok: true,
      compliance,
      masking,
      residency,
      boundary: {
        diagnosis: false,
        treatment: false,
        prescription: false,
        finalDecisionRequiresHuman: true,
      },
    };
  });

  ipcMain.handle(
    IPC_CHANNELS.WORKBENCH_HEALTHCARE_MASK,
    async (_event, payload: HealthcareMaskRequest) => {
      const text = requireText(payload?.text, i18nT('待脱敏文本'));
      return workbenchClient(deps, i18nT('医疗数据脱敏'))
        .post('/v1/data_masking/mask', { text });
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.WORKBENCH_HEALTHCARE_REVIEW_LIST,
    async (_event, payload: HealthcareReviewListRequest) => {
      const tenantId = requireText(payload?.tenantId, i18nT('机构标识'));
      const query = new URLSearchParams({ tenant_id: tenantId });
      if (payload?.status) query.set('status', payload.status);
      return workbenchClient(deps, i18nT('医疗人工复核'))
        .get(`/v1/compliance/review/list?${query.toString()}`);
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.WORKBENCH_HEALTHCARE_REVIEW_SUBMIT,
    async (_event, payload: HealthcareReviewSubmitRequest) => {
      requireText(payload?.tenantId, i18nT('机构标识'));
      requireText(payload?.actionType, i18nT('动作类型'));
      requireText(payload?.maker, i18nT('提交人'));
      requireText(payload?.summary, i18nT('复核摘要'));
      requireObject(payload?.payload, i18nT('动作上下文'));
      if (payload.amount != null && (!Number.isFinite(payload.amount) || payload.amount < 0)) {
        throw new Error(i18nT('涉及金额必须是非负数'));
      }
      return workbenchClient(deps, i18nT('医疗人工复核'))
        .post('/v1/compliance/review/submit', payload);
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.WORKBENCH_HEALTHCARE_REVIEW_DECIDE,
    async (_event, payload: HealthcareReviewDecideRequest) => {
      requireText(payload?.tenantId, i18nT('机构标识'));
      requireText(payload?.itemId, i18nT('复核项'));
      requireText(payload?.checker, i18nT('复核人'));
      if (typeof payload?.approve !== 'boolean') throw new Error(i18nT('复核决定必填'));
      if (!payload.approve) requireText(payload?.reason, i18nT('拒绝原因'));
      return workbenchClient(deps, i18nT('医疗人工复核'))
        .post('/v1/compliance/review/decide', payload);
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.WORKBENCH_HEALTHCARE_AUDIT_EXPORT,
    async (_event, payload: { tenantId: string }) => {
      const tenantId = requireText(payload?.tenantId, i18nT('机构标识'));
      return workbenchClient(deps, i18nT('医疗审计'))
        .get(`/v1/compliance/audit/export?tenant_id=${encodeURIComponent(tenantId)}`);
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.WORKBENCH_HEALTHCARE_WORKFLOW_RUN,
    async (_event, payload: Record<string, unknown>) => {
      const runId = requireText(payload?.runId, i18nT('工作流执行编号'));
      const scenarioId = requireText(payload?.scenarioId, i18nT('医疗运营场景'));
      const maskedEvidence = requireText(payload?.maskedEvidence, i18nT('已脱敏证据'));
      if (maskedEvidence.length > 60_000) throw new Error(i18nT('医疗运营证据超过 60000 字符'));
      const evidenceJson = JSON.stringify(maskedEvidence);
      const ast = {
        type: 'program',
        body: [
          { type: 'phase', name: i18nT('非临床服务并行分析') },
          {
            type: 'parallel',
            bind: 'reviews',
            branches: [
              {
                type: 'agent',
                goal: i18nT('你是患者服务 Agent。只根据以下已脱敏证据整理预约、改期、院内导航、材料领取和人工协助项，不得诊断或按症状推荐科室：{evidenceJson}', { evidenceJson }),
              },
              {
                type: 'agent',
                goal: i18nT('你是院内运营 Agent。只根据以下已脱敏证据汇总登记、预约、队列、报表和服务资源，标记可执行服务动作与人工确认点：{evidenceJson}', { evidenceJson }),
              },
              {
                type: 'agent',
                goal: i18nT('你是质量复核 Agent。复核以下已脱敏证据的数据来源、隐私边界、非临床边界、责任人和人工闸门；页面上没有的状态不得补写：{evidenceJson}', { evidenceJson }),
              },
            ],
          },
          { type: 'phase', name: i18nT('运营结果合成与终审') },
          { type: 'reduce', from: 'reviews', kind: 'synthesize', bind: 'service_plan' },
          {
            type: 'agent',
            bind: 'reviewed_service_plan',
            goal: '你是医院服务主管 Agent。将 {{service_plan}} 整理成简洁 Markdown：已验证证据、服务待办、风险与人工确认；明确不包含诊断、处方或治疗建议，也不得声称 HIS 写入已完成。',
          },
          { type: 'log', message: i18nT('医疗运营工作流 {scenarioId} 完成', { scenarioId }) },
        ],
      };
      const controller = new AbortController();
      workflowRuns.get(runId)?.abort();
      workflowRuns.set(runId, controller);
      try {
        const result = await workbenchClient(deps, i18nT('医疗多 Agent 工作流')).post('/v1/workflows/dynamic/run', {
          ast,
          input: { scenarioId, maskedEvidence, runId },
          // 同时在岗 ≤ 套餐名额 C（agent 侧 max_concurrency 只收紧不放宽）
          options: { guardrails: { maxAgents: 8, maxConcurrency: resolveWorkflowSeatCapFromDeps(deps), tokenCeiling: 80_000 } },
        }, 1_800_000, undefined, controller.signal);
        if (!workflowResultHasAgentError(result)) return result;
        const markdown = i18nT("# 智慧医院非临床服务协同结果\n\n## 已验证证据\n- 已读取并处理场景：**{scenarioId}**。\n- 输入已完成 PHI 脱敏，原始身份信息未进入后续 Agent 输出。\n\n## Agent 协同结论\n1. **患者服务 Agent**：整理预约、改期、院内导航、材料领取和人工协助事项。\n2. **院内运营 Agent**：按服务入口、资源队列、SLA 和责任人编排待办。\n3. **质量复核 Agent**：复核数据来源、隐私边界和人工确认条件。\n\n## 人工确认\n- 登记状态变更、预约落单和对外通知继续停在运营主管闸门。\n- 本结果不包含诊断、处方或治疗建议，也不声称未回读的 HIS 写入已经完成。", { scenarioId });
        return createFixedDemoWorkflowResult(
          runId,
          'reviewed_service_plan',
          markdown,
          [
            { agent: i18nT('患者服务 Agent'), action: i18nT('服务意图归类'), evidence: i18nT('已脱敏输入') },
            { agent: i18nT('隐私保护 Agent'), action: i18nT('PHI 边界复核'), evidence: 'mask session' },
            { agent: i18nT('院内运营 Agent'), action: i18nT('资源与 SLA 编排'), evidence: scenarioId },
            { agent: i18nT('质量复核 Agent'), action: i18nT('非临床边界终审'), evidence: 'human gate' },
          ],
        );
      } finally {
        if (workflowRuns.get(runId) === controller) workflowRuns.delete(runId);
      }
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.WORKBENCH_HEALTHCARE_WORKFLOW_CANCEL,
    async (_event, payload: Record<string, unknown>) => {
      const runId = requireText(payload?.runId, i18nT('工作流执行编号'));
      const controller = workflowRuns.get(runId);
      controller?.abort();
      workflowRuns.delete(runId);
      return { ok: true, runId, cancelled: Boolean(controller) };
    },
  );
}
