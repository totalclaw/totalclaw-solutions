/**
 * 解决方案 · 财会审计（主进程）。设计稿：docs/finance-audit-solution.md
 *
 * 一条动作通道 WORKBENCH_FINAUDIT_INVOKE（{action, payload}），合并公共 action 与各分组的 action 表；
 * 状态变化经 WORKBENCH_FINAUDIT_EVENT 推给渲染层（run.progress / run.state / todo.changed）。
 *
 * 合规边界（写进代码，第 9.1 节）：本工作台只读数据、只出草稿文件；没有任何过账、付款、提交申报、
 * 对外发送、出具意见的通道（boundary.test.ts 扫源码守卫）。
 */
import { ipcMain, type BrowserWindow } from 'electron';
import { i18nKey, t as i18nT } from '@totalclaw/i18n';
import { IPC_CHANNELS, type FauCompany, type FauEvent, type FauProject } from '@totalclaw/ipc-contracts';
import type { WorkbenchIpcDeps } from './workbenchApi';
import { userFacingError } from '../utils/userFacingError';
import { createWorkbenchLlm } from '../services/workbenchLlm';
import { FinanceAuditStore } from '../services/financeAudit/store';
import { RunManager, type ModuleRunner } from '../services/financeAudit/runner';
import { FauStepError, type LlmFn } from '../services/financeAudit/skillRunner';
import { openItemsFor } from '../services/financeAudit/handoff';
import { outputDirFor } from '../services/financeAudit/outputs/common';
import { writePdfFromHtml } from '../services/bidWriter/docx';
import { RUNNERS as ACCOUNTING } from '../services/financeAudit/engines/accounting';
import { RUNNERS as AUDIT } from '../services/financeAudit/engines/audit';
import { RUNNERS as TAX } from '../services/financeAudit/engines/tax';
import { RUNNERS as FPA } from '../services/financeAudit/engines/fpa';
import { RUNNERS as TREASURY } from '../services/financeAudit/engines/treasury';
import { RUNNERS as CAPITAL } from '../services/financeAudit/engines/capital';
import { commonActions } from './financeAudit/common.actions';
import { accountingActions } from './financeAudit/accounting.actions';
import { auditActions } from './financeAudit/audit.actions';
import { taxActions } from './financeAudit/tax.actions';
import { fpaActions } from './financeAudit/fpa.actions';
import { treasuryActions } from './financeAudit/treasury.actions';
import { capitalActions } from './financeAudit/capital.actions';
import { sampleActions } from './financeAudit/sample.actions';
import { platformActions } from './financeAudit/platform.actions';
import { bindFinanceAuditWorkflowTools } from './financeAudit/workflowTools';
import type { ActionTable, FauActionCtx } from './financeAudit/context';

export const FAU_RUNNERS: Record<string, ModuleRunner> = { ...ACCOUNTING, ...AUDIT, ...TAX, ...FPA, ...TREASURY, ...CAPITAL };

export function registerFinanceAuditHandlers(deps: WorkbenchIpcDeps): void {
  const logger = deps.logger;
  const store = new FinanceAuditStore();
  const win = (): BrowserWindow | null => deps.getMainWindow?.() ?? null;
  const emit = (ev: FauEvent): void => { try { win()?.webContents.send(IPC_CHANNELS.WORKBENCH_FINAUDIT_EVENT, ev); } catch { /* 窗口已关 */ } };
  const workbench = createWorkbenchLlm(deps, { logTag: 'finance-audit', moduleModel: (m) => store.settings().moduleModels[m] || '' });
  const llm: LlmFn = (prompt, o) => workbench.llm(o.module, prompt, o.timeoutMs ?? 180_000, { responseLocale: o.responseLocale });

  const currentCompany = (): FauCompany => {
    const s = store.settings();
    const c = store.getCompany(s.currentCompanyId) || store.listCompanies()[0];
    if (!c) throw new FauStepError(i18nKey('还没有公司档案，请先完成首次配置'));
    return c;
  };
  const current = (): { company: FauCompany; project: FauProject } => {
    const company = currentCompany();
    const p = store.getProject(company.id, store.settings().currentProjectId) || store.listProjects(company.id)[0];
    if (!p) throw new FauStepError(i18nKey('还没有项目，请先新建一个项目（如「2026-09 月结」）'));
    return { company, project: p };
  };

  const runs = new RunManager({
    store, runners: FAU_RUNNERS, llm, emit,
    outputDirFor: (run, company, project, def) => outputDirFor(store.settings().outputRoot || store.root(), company.name, project.name, def.code, i18nT(def.name)),
    openItemsFor: (run, company, project) => openItemsFor(store, run, company, project),
    logger,
  });

  // 进程换了：上次 running 的步骤标「已中断」（UX 硬规则三）
  try {
    const n = store.markInterrupted();
    if (n) logger?.info?.('finance-audit', 'marked interrupted runs', { n });
  } catch (e) { logger?.warn?.('finance-audit', 'markInterrupted failed', { error: (e as Error)?.message }); }

  const ctx: FauActionCtx = {
    deps, store, runs, llm, emit, win, current, currentCompany,
    modelOptions: () => workbench.modelOptions(),
    writePdf: (path, html) => writePdfFromHtml(path, html),
  };
  // 批次 8：流程库 / 专家团 / 超级任务里的 finance-audit:run-engine、finance-audit:import-run（workflow.ipc.ts 执行器按名字转进来）
  bindFinanceAuditWorkflowTools(ctx, FAU_RUNNERS);
  const tables: ActionTable[] = [commonActions(ctx), accountingActions(ctx), auditActions(ctx), taxActions(ctx), fpaActions(ctx), treasuryActions(ctx), capitalActions(ctx), sampleActions(ctx), platformActions(ctx)];
  const actions: ActionTable = {};
  for (const t of tables) {
    for (const [k, fn] of Object.entries(t)) {
      if (actions[k]) throw new Error(`finance-audit action registered twice: ${k}`);
      actions[k] = fn;
    }
  }

  ipcMain.handle(IPC_CHANNELS.WORKBENCH_FINAUDIT_INVOKE, async (_e, req: { action: string; payload?: unknown }) => {
    const name = String(req?.action || '');
    const fn = Object.prototype.hasOwnProperty.call(actions, name) ? actions[name] : null;
    if (!fn) throw new Error(i18nT('未知操作：{p0}', { p0: name }));
    try {
      return await fn(req.payload ?? {});
    } catch (error) {
      logger?.warn?.('finance-audit', `${name} failed`, { error: (error as Error)?.message });
      if (error instanceof FauStepError) throw new Error(i18nT(error.key, error.params));
      throw new Error(userFacingError(error));
    }
  });
}
