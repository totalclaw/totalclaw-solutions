/**
 * 财会审计 IPC：各分组 action 文件共用的上下文。
 */
import type { BrowserWindow } from 'electron';
import type { FauCompany, FauEvent, FauProject } from '@totalclaw/ipc-contracts';
import type { WorkbenchIpcDeps } from '../workbenchApi';
import type { FinanceAuditStore } from '../../services/financeAudit/store';
import type { RunManager } from '../../services/financeAudit/runner';
import type { LlmFn } from '../../services/financeAudit/skillRunner';
import type { PdfWriter } from '../../services/financeAudit/archive';

export type ActionTable = Record<string, (p: any) => unknown>;

export interface FauActionCtx {
  deps: WorkbenchIpcDeps;
  store: FinanceAuditStore;
  runs: RunManager;
  llm: LlmFn;
  modelOptions: () => Promise<unknown>;
  emit: (ev: FauEvent) => void;
  win: () => BrowserWindow | null;
  writePdf?: PdfWriter;
  /** 当前公司 + 项目；没有就抛错（界面会先走配置向导 / 新建项目） */
  current: () => { company: FauCompany; project: FauProject };
  currentCompany: () => FauCompany;
}
