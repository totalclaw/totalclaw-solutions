/**
 * 财会审计 · 平台 action（批次 8）：ERP 只读取数（第 ② 步数据来源可选 ERP）、项目上下文 project.md 导出。
 * 渲染层传来的一切都当不可信输入；ERP 只读 /v1/erp/status 与经 data.erp_query 取数，不写账。
 */
import { join } from 'node:path';
import { writeFileSync, mkdirSync } from 'node:fs';
import { i18nKey, t as i18nT, tIn } from '@totalclaw/i18n';
import type { FauErpStatus, FauLocale } from '@totalclaw/ipc-contracts';
import { FAU_LOCALES } from '@totalclaw/ipc-contracts';
import { FAU_ERP_PROVIDERS } from '../../../shared/financeAudit/dataSources';
import { QiyeApiClient } from '../../services/qiyeApiClient';
import { pullErpToCsv } from '../../services/financeAudit/intake/erpPull';
import { buildProjectMd } from '../../services/financeAudit/outputs/projectMd';
import { safeFileName } from '../../services/serviceSettlement/excel';
import { FauStepError } from '../../services/financeAudit/skillRunner';
import type { ActionTable, FauActionCtx } from './context';

export function platformActions(ctx: FauActionCtx): ActionTable {
  const { store } = ctx;

  return {
    /** ERP 插件状态：哪些 backend 已配好凭据；数据服务没就绪时如实说明，界面退回上传 */
    'erp.status': async (): Promise<FauErpStatus> => {
      const proc = ctx.deps.qiyeApiProc;
      if (!proc || proc.getStatus() !== 'ready') return { available: false, reason: i18nT('后台数据服务没有就绪，暂时不能从 ERP 取数，请先上传导出文件'), enabled: false, providers: [] };
      try {
        const client = new QiyeApiClient({ baseUrl: proc.getBaseUrl(), getBearerToken: () => proc.getBearerToken(), defaultTimeoutMs: 15_000 });
        const s = await client.get<{ enabled?: boolean; defaultProvider?: string | null; providers?: Array<{ name?: string; configured?: boolean }> }>('/v1/erp/status');
        const known = new Set(FAU_ERP_PROVIDERS.map((p) => p.id));
        return {
          available: true, enabled: s?.enabled === true, defaultProvider: s?.defaultProvider || undefined,
          providers: (s?.providers || []).filter((p) => known.has(String(p?.name))).map((p) => ({ id: String(p.name), configured: p.configured === true })),
          ...(s?.enabled === true ? {} : { reason: i18nT('ERP 插件还没启用：请在后台数据服务的 ERP 插件配置里启用并绑定账套凭据；在那之前请上传导出文件') }),
        };
      } catch (e) {
        return { available: false, reason: i18nT('读取 ERP 状态失败：{p0}', { p0: String((e as Error)?.message || e).slice(0, 200) }), enabled: false, providers: [] };
      }
    },

    /** 从 ERP 只读取数 → 项目 files/ 下的 CSV；之后按上传文件同一条路识别列、确认后导入 */
    'erp.pull': async (p: { provider: string; docType: string; filters?: Record<string, unknown> | string }) => {
      const { company, project } = ctx.current();
      if (project.status === 'archived') throw new FauStepError(i18nKey('项目已归档，只读；请新建项目'));
      let filters: Record<string, unknown> = {};
      if (typeof p?.filters === 'string' && p.filters.trim()) {
        try { filters = JSON.parse(p.filters); } catch { throw new FauStepError(i18nKey('查询条件不是合法的 JSON')); }
      } else if (p?.filters && typeof p.filters === 'object') filters = p.filters as Record<string, unknown>;
      return pullErpToCsv(ctx.deps, { provider: p?.provider, docType: p?.docType, filters, period: project.period }, store.filesDir(company.id, project.id));
    },

    /** 项目上下文 project.md：写到产出目录下的项目文件夹 */
    'project.exportMd': (p: { id?: string; locale?: string }) => {
      const company = ctx.currentCompany();
      const project = store.getProject(company.id, String(p?.id || store.settings().currentProjectId));
      if (!project) throw new FauStepError(i18nKey('找不到项目'));
      const locale: FauLocale = FAU_LOCALES.includes(p?.locale as FauLocale) ? p!.locale as FauLocale : company.outputLocale;
      const md = buildProjectMd({
        company, project, locale,
        prev: project.prevProjectId ? store.getProject(company.id, project.prevProjectId) : null,
        datasets: store.datasetMetas(company.id, project.id),
        runs: store.listRuns(company.id, project.id).filter((r) => r.status !== 'void'),
        signoffs: store.readSignoffs(company.id, project.id),
        handoffs: store.handoffs(company.id, project.id),
      });
      const dir = join(store.settings().outputRoot || store.root(), safeFileName(company.name, 'company'), safeFileName(project.name, 'project'));
      mkdirSync(dir, { recursive: true });
      const path = join(dir, 'project.md');
      writeFileSync(path, md, 'utf8');
      return { path, title: tIn(locale, i18nKey('项目上下文')) };
    },
  };
}
