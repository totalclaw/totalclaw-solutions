/**
 * 财会审计 · treasury 分组的模块特有 action（E1–E7，批次 6），action 名用「<模块 id>.」前缀。
 * 本组没有任何付款、审批付款、下单或对外发送的 action：付款只出计划 / 建议，外汇只出策略与询价单草稿。
 */
import { i18nKey } from '@totalclaw/i18n';
import type { FauRun } from '@totalclaw/ipc-contracts';
import { FauStepError } from '../../services/financeAudit/skillRunner';
import type { ActionTable, FauActionCtx } from './context';

/** 比率参数：写 5 或 0.05 都按 5%；超出 [0, 1) 拒绝 */
function rateParam(v: unknown): number | undefined {
  if (v === undefined || v === null || v === '') return undefined;
  let n = Number(v);
  if (!Number.isFinite(n)) throw new FauStepError(i18nKey('参数不是数字'));
  if (Math.abs(n) >= 1) n /= 100;
  if (n < 0 || n >= 1) throw new FauStepError(i18nKey('比率参数要在 0% 到 100% 之间'));
  return n;
}

export function treasuryActions(ctx: FauActionCtx): ActionTable {
  const { store, runs } = ctx;
  return {
    /** E4：改 WACC 假设（无风险利率、Beta、市场风险溢价、税率、权益价值）后从第 ④ 步重算 */
    'financing.params.update': async (p: { runId: string; rf?: unknown; beta?: unknown; erp?: unknown; taxRate?: unknown; equity?: unknown }) => {
      const company = ctx.currentCompany();
      const run: FauRun | null = store.findRun(company.id, String(p?.runId || ''), store.settings().currentProjectId);
      if (!run || run.moduleId !== 'financing') throw new FauStepError(i18nKey('找不到这次运行'));
      const project = store.getProject(company.id, run.projectId);
      if (!project) throw new FauStepError(i18nKey('找不到项目'));
      const beta = p?.beta === undefined || p?.beta === '' ? undefined : Number(p.beta);
      if (beta !== undefined && !(Number.isFinite(beta) && beta >= 0 && beta <= 5)) throw new FauStepError(i18nKey('Beta 要在 0 到 5 之间'));
      const equity = p?.equity === undefined || p?.equity === '' ? undefined : Number(p.equity);
      if (equity !== undefined && !(Number.isFinite(equity) && equity >= 0)) throw new FauStepError(i18nKey('权益价值不能为负'));
      const next: Record<string, unknown> = { ...run.params };
      const set = (k: string, v: number | undefined) => { if (v === undefined) delete next[k]; else next[k] = v; };
      set('rf', rateParam(p?.rf));
      set('erp', rateParam(p?.erp));
      set('taxRate', rateParam(p?.taxRate));
      set('beta', beta);
      set('equity', equity === undefined ? undefined : Math.round(equity * 100));
      run.params = next;
      store.saveRun(run);
      return runs.start(run, company, project, 'analyze');
    },
  };
}
