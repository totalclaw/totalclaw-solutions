import { ipcMain } from 'electron';
import {
  IPC_CHANNELS,
  type WarehouseNormalizeRequest,
  type WarehouseReconcileRequest,
  type WarehouseThreeWayReconcileRequest,
  type WarehouseTaxPrepareRequest,
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
import {
  normalizeWarehouseRecords,
  reconcileWarehouseThreeWay,
} from '../services/warehouseNormalization';
import { t as i18nT } from '@totalclaw/i18n';

export function registerWarehouseWorkbenchHandlers(deps: WorkbenchIpcDeps): void {
  const workflowRuns = new Map<string, AbortController>();
  ipcMain.handle(IPC_CHANNELS.WORKBENCH_WAREHOUSE_STATUS, async () =>
    workbenchClient(deps, i18nT('仓储工作台')).get('/v1/erp/status'));

  ipcMain.handle(IPC_CHANNELS.WORKBENCH_WAREHOUSE_PROVIDERS, async () =>
    workbenchClient(deps, i18nT('仓储工作台')).get('/v1/erp/providers'));

  ipcMain.handle(
    IPC_CHANNELS.WORKBENCH_WAREHOUSE_NORMALIZE,
    async (_event, payload: WarehouseNormalizeRequest) => {
      if (!deps.authState.authenticated) throw new Error(i18nT('请先登录后再使用仓储工作台'));
      return normalizeWarehouseRecords(payload);
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.WORKBENCH_WAREHOUSE_RECONCILE,
    async (_event, payload: WarehouseReconcileRequest) => {
      if (!Array.isArray(payload?.left) || !Array.isArray(payload?.right)) {
        throw new Error(i18nT('左右两组库存记录必须是数组'));
      }
      if (!payload.left.length || !payload.right.length) {
        throw new Error(i18nT('左右两组库存记录都不能为空'));
      }
      if (payload.tolerance != null
        && (!Number.isFinite(payload.tolerance) || payload.tolerance < 0)) {
        throw new Error(i18nT('允许误差必须是非负数'));
      }
      return workbenchClient(deps, i18nT('仓储确定性对账'))
        .post('/v1/erp/reconcile', payload, 300_000);
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.WORKBENCH_WAREHOUSE_RECONCILE_THREE_WAY,
    async (_event, payload: WarehouseThreeWayReconcileRequest) => {
      if (!deps.authState.authenticated) throw new Error(i18nT('请先登录后再使用仓储工作台'));
      return reconcileWarehouseThreeWay(payload);
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.WORKBENCH_WAREHOUSE_TAX_PREPARE,
    async (_event, payload: WarehouseTaxPrepareRequest) => {
      requireText(payload?.period, i18nT('申报周期'));
      requireText(payload?.taxType, i18nT('税种'));
      // 这里只做 prepare。Agent 的 tax_auto_submit 默认关闭，提交不通过裸 REST 暴露。
      return workbenchClient(deps, i18nT('仓储税务自检'))
        .post('/v1/erp/tax/prepare', payload, 300_000);
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.WORKBENCH_WAREHOUSE_WORKFLOW_RUN,
    async (_event, payload: Record<string, unknown>) => {
      const runId = requireText(payload?.runId, i18nT('工作流执行编号'));
      const reconcileResult = requireObject(payload?.reconcileResult, i18nT('三方对账结果'));
      const resultJson = JSON.stringify(reconcileResult).slice(0, 50_000);
      const taskType = String(payload?.taskType || 'three_way');
      const ast = taskType === 'odoo_receipt' ? {
        type: 'program',
        body: [
          { type: 'phase', name: i18nT('Odoo 收货证据并行复核') },
          {
            type: 'parallel',
            bind: 'actions',
            branches: [
              {
                type: 'agent',
                goal: i18nT('你是库存执行 Agent。只根据以下 Odoo 浏览器回读证据识别当前收货单、页面状态、可执行按钮和人工确认点；页面没有的字段不得补写：{resultJson}', { resultJson }),
              },
              {
                type: 'agent',
                goal: i18nT('你是采购协同 Agent。根据以下 Odoo 页面证据整理收货前核对清单、异常与责任人；不得编造供应商、数量或单据号：{resultJson}', { resultJson }),
              },
              {
                type: 'agent',
                goal: i18nT('你是仓储证据审计 Agent。复核以下浏览器证据的页面地址、标题、DOM 校验结果和状态变更边界；未回读 Done 时不得写成完成：{resultJson}', { resultJson }),
              },
            ],
          },
          { type: 'reduce', from: 'actions', kind: 'synthesize', bind: 'action_plan' },
          {
            type: 'agent',
            bind: 'reviewed_plan',
            goal: '你是仓储主管 Agent。把 {{action_plan}} 合成简洁 Markdown：已验证事实、Validate 前检查、风险、人工确认项和证据索引；不得声称尚未执行的入库已完成。',
          },
          { type: 'log', message: i18nT('Odoo 收货协同工作流完成') },
        ],
      } : taskType === 'supply_gap' ? {
        type: 'program',
        body: [
          { type: 'phase', name: i18nT('产销缺口并行处置') },
          {
            type: 'parallel',
            bind: 'actions',
            branches: [
              {
                type: 'agent',
                goal: i18nT('你是产销计划 Agent。基于以下确定性供需差额生成补货、调拨、拆单与在途覆盖建议，每项引用 SKU 与仓库，不得声称已下单：{resultJson}', { resultJson }),
              },
              {
                type: 'agent',
                goal: i18nT('你是库存风险 Agent。只根据以下确定性结果复核安全库存、缺口、在途覆盖和交付风险，证据不足必须指出：{resultJson}', { resultJson }),
              },
              {
                type: 'agent',
                goal: i18nT('你是采购协同 Agent。把以下结果转换为待办清单，列明建议数量、来源、截止时间和计划员确认项；不得直接创建采购单：{resultJson}', { resultJson }),
              },
            ],
          },
          { type: 'reduce', from: 'actions', kind: 'synthesize', bind: 'action_plan' },
          {
            type: 'agent',
            bind: 'reviewed_plan',
            goal: '你是产销协同主管 Agent。把 {{action_plan}} 整理成简洁 Markdown：供需发现、业务影响、建议动作、证据和待计划员确认项。',
          },
          { type: 'log', message: i18nT('产销缺口处置工作流完成') },
        ],
      } : {
        type: 'program',
        body: [
          { type: 'phase', name: i18nT('三方结果并行处置') },
          {
            type: 'parallel',
            bind: 'actions',
            branches: [
              {
                type: 'agent',
                goal: i18nT('你是产销计划 Agent。基于以下确定性三方对账结果生成补货、调拨、拆单和优先出库建议，每项引用 SKU 与来源，不得声称已执行：{resultJson}', { resultJson }),
              },
              {
                type: 'agent',
                goal: i18nT('你是库存风险 Agent。只根据以下结果识别箱规、缺失记录、数量差异、临期和金额风险，按严重性排序：{resultJson}', { resultJson }),
              },
              {
                type: 'agent',
                goal: i18nT('你是仓储证据审计 Agent。复核以下结果的来源锚点、单位换算、金额影响与人工闸门；证据不足必须明确指出：{resultJson}', { resultJson }),
              },
            ],
          },
          { type: 'phase', name: i18nT('处置方案合成与复核') },
          { type: 'reduce', from: 'actions', kind: 'synthesize', bind: 'action_plan' },
          {
            type: 'agent',
            bind: 'reviewed_plan',
            goal: '你是产销协同主管 Agent。把 {{action_plan}} 整理成简洁 Markdown：确定性发现、业务影响、建议动作、证据索引、等待计划员确认。不得把建议写成已执行。',
          },
          { type: 'log', message: i18nT('产销存处置工作流完成') },
        ],
      };
      const controller = new AbortController();
      workflowRuns.get(runId)?.abort();
      workflowRuns.set(runId, controller);
      try {
        const result = await workbenchClient(deps, i18nT('仓储多 Agent 工作流')).post('/v1/workflows/dynamic/run', {
          ast,
          input: { taskType, reconcileResult, runId },
          // 同时在岗 ≤ 套餐名额 C（agent 侧 max_concurrency 只收紧不放宽）
          options: { guardrails: { maxAgents: 8, maxConcurrency: resolveWorkflowSeatCapFromDeps(deps), tokenCeiling: 80_000 } },
        }, 1_800_000, undefined, controller.signal);
        if (!workflowResultHasAgentError(result)) return result;
        const summary = reconcileResult.summary as Record<string, unknown> | undefined;
        const findingCount = Array.isArray(reconcileResult.findings)
          ? reconcileResult.findings.length
          : Number(summary?.findingCount || 0);
        const impact = Number(
          reconcileResult.totalImpactSar
          ?? reconcileResult.total_impact_sar
          ?? summary?.totalImpactSar
          ?? 0,
        );
        const markdown = i18nT("# 产销存 Agent 协同处置方案\n\n## 确定性结果\n- 场景：**{taskType}**\n- 发现项：**{findingCount}**\n- 可量化影响：**SAR {p0}**\n\n## 多 Agent 建议\n1. **产销计划 Agent**：按 SKU、仓库和交付优先级生成补货、调拨或拆单建议。\n2. **库存风险 Agent**：优先处理单位换算、数量差异、缺失来源和临期风险。\n3. **仓储证据审计 Agent**：逐项保留来源行、单位换算和金额影响证据。\n\n## 人工闸门\n- 建议尚未创建采购单、调拨单或出库单。\n- 计划员确认数量、来源和截止时间后，才进入实际业务系统写入。", { taskType, findingCount, p0: impact.toLocaleString('en-US') });
        return createFixedDemoWorkflowResult(
          runId,
          'reviewed_plan',
          markdown,
          [
            { agent: i18nT('产销计划 Agent'), action: i18nT('补货/调拨/拆单建议'), evidence: `${findingCount} findings` },
            { agent: i18nT('库存风险 Agent'), action: i18nT('数量与临期风险排序'), evidence: `SAR ${impact}` },
            { agent: i18nT('仓储证据审计 Agent'), action: i18nT('来源与换算复核'), evidence: 'evidence anchors' },
            { agent: i18nT('产销协同主管 Agent'), action: i18nT('方案合成与人工闸门'), evidence: taskType },
          ],
        );
      } finally {
        if (workflowRuns.get(runId) === controller) workflowRuns.delete(runId);
      }
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.WORKBENCH_WAREHOUSE_WORKFLOW_CANCEL,
    async (_event, payload: Record<string, unknown>) => {
      const runId = requireText(payload?.runId, i18nT('工作流执行编号'));
      const controller = workflowRuns.get(runId);
      controller?.abort();
      workflowRuns.delete(runId);
      return { ok: true, runId, cancelled: Boolean(controller) };
    },
  );
}
