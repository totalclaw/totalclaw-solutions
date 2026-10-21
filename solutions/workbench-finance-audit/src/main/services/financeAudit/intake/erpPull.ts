/**
 * ERP 只读取数（批次 8，第 8.1 / 8.2 节 P1）：金蝶云星空、用友 U8、畅捷通 T+、精斗云，经 agent ERP 插件取数。
 *
 *   - 只走 data.erp_query（dataFetch.ts → /v1/erp/query）：数据源白名单（dataSourceGrants）、访问审计（dataAccessAudit）、
 *     截断即失败都在那一层；这里另外给会按上限截断的 backend 带上 limit，拿满就判截断；
 *   - ERP 状态只读 /v1/erp/status；不调写入、不调税务接口（boundary.test.ts 与 erpPull.test.ts 扫源码守卫）；
 *   - 取回的行原样写成 CSV 放进项目 files/，之后与上传文件同一条路：列识别 → 人工确认 → 导入成标准数据集。
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { i18nKey, t as i18nT } from '@totalclaw/i18n';
import { FAU_ERP_MAX_ROWS, FAU_ERP_PROVIDERS } from '../../../../shared/financeAudit/dataSources';
import { runDataFetchTool, rowsToCsv } from '../../dataFetch';
import type { IpcDeps } from '../../../ipc/shared';
import { safeFileName } from '../../serviceSettlement/excel';
import { FauStepError } from '../skillRunner';

export interface ErpPullRequest {
  provider: string;
  docType: string;
  filters?: Record<string, unknown>;
  /** 项目期间（YYYY-MM 或 YYYY），代入查询条件里的 {from} {to} {year} {month} */
  period?: string;
}

/** 期间 → 占位符；年度项目取全年 */
export function periodVars(period: string): Record<string, string> {
  const m = /^(\d{4})(?:-(\d{2}))?$/.exec(String(period || '').trim());
  if (!m) return {};
  const [, y, mm] = m;
  if (!mm) return { year: y, month: '12', from: `${y}-01-01`, to: `${y}-12-31` };
  const last = new Date(Date.UTC(Number(y), Number(mm), 0)).getUTCDate();
  return { year: y, month: String(Number(mm)), from: `${y}-${mm}-01`, to: `${y}-${mm}-${String(last).padStart(2, '0')}` };
}

/** 校验并整理请求（渲染层传来的都当不可信输入） */
export function normalizeErpRequest(req: ErpPullRequest): { provider: string; docType: string; filters: Record<string, unknown> } {
  const p = FAU_ERP_PROVIDERS.find((x) => x.id === String(req?.provider || ''));
  if (!p) throw new FauStepError(i18nKey('不支持的 ERP：{p0}'), { p0: String(req?.provider || '-').slice(0, 40) });
  const docType = String(req?.docType || '').trim();
  if (!docType || docType.length > 200 || /[\r\n]/.test(docType)) throw new FauStepError(i18nKey('请填写单据类型（ERP 接口里的表单或资源名）'));
  const vars = periodVars(req?.period || '');
  const filters: Record<string, unknown> = {};
  const raw = req?.filters && typeof req.filters === 'object' && !Array.isArray(req.filters) ? req.filters : {};
  for (const [k, v] of Object.entries(raw).slice(0, 30)) {
    if (!/^[A-Za-z_][A-Za-z0-9_.]{0,60}$/.test(k)) continue;
    filters[k] = typeof v === 'string' ? v.replace(/\{(from|to|year|month)\}/g, (_, key: string) => vars[key] ?? `{${key}}`).slice(0, 4000) : v;
  }
  // 会静默截断的 backend：带上单次上限（原始 SQL 由用户自己写，不追加）
  if (p.capped && !filters._sql) filters.limit = FAU_ERP_MAX_ROWS;
  return { provider: p.id, docType, filters };
}

/** 取数 → 写 CSV（全量，不留样本）；被截断 / 没授权 / 插件没启用都直接抛错，不拿部分数据 */
export async function pullErpToCsv(deps: Pick<IpcDeps, 'qiyeApiProc'>, req: ErpPullRequest, dir: string): Promise<{ path: string; rowCount: number; columns: string[]; checksum: string }> {
  const q = normalizeErpRequest(req);
  const r = await runDataFetchTool(deps, 'data.erp_query', { ...q, inlineMax: FAU_ERP_MAX_ROWS + 1 }, { via: 'workflow', workflowName: i18nT('财会审计工作台') });
  if (!r.rowCount) throw new FauStepError(i18nKey('ERP 没有返回数据，请检查单据类型和查询条件'));
  // 不带上限的 backend（畅捷通、精斗云、用友原始 SQL）超过单次上限：变量里只剩样本，同样判截断
  if (r.sampled || r.rowCount > FAU_ERP_MAX_ROWS || r.rows.length !== r.rowCount) {
    throw new FauStepError(i18nKey('ERP 取数超过单次上限 {p0} 行（实际 {p1} 行），不能只导入一部分：请缩小期间或加查询条件后分批取'), { p0: FAU_ERP_MAX_ROWS, p1: r.rowCount });
  }
  const { columns, rows } = namedRows(r.columns, r.rows, q.filters.field_keys);
  mkdirSync(dir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
  const path = join(dir, safeFileName(`erp-${q.provider}-${q.docType}-${stamp}.csv`));
  writeFileSync(path, rowsToCsv(columns, rows), 'utf8');
  return { path, rowCount: r.rowCount, columns, checksum: r.checksum };
}

/** 金蝶 ExecuteBillQuery 每行是按 FieldKeys 顺序的数组：换成「字段名 → 值」，CSV 表头才认得出列 */
export function namedRows(columns: string[], rows: Array<Record<string, unknown>>, fieldKeys: unknown): { columns: string[]; rows: Array<Record<string, unknown>> } {
  if (!Array.isArray(rows[0])) return { columns, rows };
  const width = Math.max(...rows.map((x) => (Array.isArray(x) ? x.length : 0)));
  const keys = typeof fieldKeys === 'string' ? fieldKeys.split(',').map((k) => k.trim()) : [];
  const names = Array.from({ length: width }, (_, i) => keys[i] || `col${i + 1}`);
  return { columns: names, rows: rows.map((x) => Object.fromEntries(names.map((n, i) => [n, (x as unknown as unknown[])[i]]))) };
}
