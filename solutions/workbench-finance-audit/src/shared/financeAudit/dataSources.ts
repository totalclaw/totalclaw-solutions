/**
 * 财会审计 · 数据源目录（第 8 节）：两个源项目里的全部端点、连接器、企业自有服务都在这里有归属（数据在 dataSources.json）。
 *
 *   - 有真实 MCP 地址的付费数据源与文档库：登记在 shared/connectorCatalog.ts（默认不启用、标「需授权」），用 connectorId 关联；
 *   - 企业自有服务（internal-gl、subledger、nav、portfolio、screening、crm）：没有公开地址，「企业自建 MCP，填地址后可用」；
 *   - finance-skills 的 34 个连接器与 .mcp.json 端点：按层级登记接入方式与降级方式；ERP 只读取数批次 8 接入（access = erp-plugin，见下方 FAU_ERP_PROVIDERS）；
 *   - Microsoft 365 加载项部署工具：只作后续 Microsoft 365 连接器的接入参考，加载项本体不迁。
 * 原则（照搬 CONNECTORS.md）：读可以、写不行；取不到就降级到上传 / 公开数据 / 手工录入，并说明原因；凭据不进技能。
 * sources 是 sourceInventory.json 条目的 name，dataSources.test.ts 逐条核对每个 P5 源条目都有去向。
 */
import { i18nKey } from '@totalclaw/i18n';
import DATA from './dataSources.json';

export type FauDsLayer = 'erp' | 'bi' | 'execution' | 'docs' | 'hr_tax' | 'esg_ir' | 'market' | 'enterprise' | 'reference';
export type FauDsAccess = 'file' | 'erp-plugin' | 'mcp' | 'manual';
/** available：现在就能用（文件导入）；needs_auth：需授权，默认关闭；planned：后续批次 */
export type FauDsStatus = 'available' | 'needs_auth' | 'planned';

export interface FauDataSource {
  id: string;
  /** 产品 / 服务名：英文名直接显示；中文产品名在 NAME_KEYS 里走词典 */
  name: string;
  layer: FauDsLayer;
  modules: string[];
  access: FauDsAccess;
  status: FauDsStatus;
  connectorId?: string;
  /** access = erp-plugin 时，agent ERP 插件里对应的 backend */
  erpProviders?: string[];
  /** 词典 key：取不到时怎么降级 */
  fallback: string;
  sources: string[];
}

export const DS_LAYER_LABELS: Record<FauDsLayer, string> = {
  erp: i18nKey('ERP 与总账'), bi: i18nKey('BI 与报表'), execution: i18nKey('业务执行与资金'), docs: i18nKey('文档与计划'), hr_tax: i18nKey('人力与税务'),
  esg_ir: i18nKey('ESG 与投资者关系'), market: i18nKey('市场与研究数据'), enterprise: i18nKey('企业自有服务'), reference: i18nKey('接入参考'),
};
export const DS_STATUS_LABELS: Record<FauDsStatus, string> = { available: i18nKey('可用'), needs_auth: i18nKey('需授权'), planned: i18nKey('规划中') };

/** 中文产品名（词典 key，英文 / 阿语界面显示对应译名） */
export const DS_NAME_KEYS: Record<string, string> = {
  yonyou: i18nKey('用友 NC / U8 / Cloud'), kingdee: i18nKey('金蝶 K3 / Cloud'), chanjet: i18nKey('畅捷通 T+'), finereport: i18nKey('帆软 FineReport'), wind: i18nKey('万得 Wind'),
};

const FALLBACK: Record<FauDsLayer, string> = {
  market: i18nKey('没有授权时：上传终端导出的 CSV / xlsx，或用公开数据、手工录入'),
  enterprise: i18nKey('企业自建 MCP 服务，填地址后可用；没有时上传导出文件'),
  reference: i18nKey('只作接入参考，加载项本体不迁移'),
  erp: i18nKey('没有授权时：上传系统导出的文件'), bi: i18nKey('没有授权时：上传系统导出的文件'), execution: i18nKey('没有授权时：上传系统导出的文件'),
  docs: i18nKey('没有授权时：上传系统导出的文件'), hr_tax: i18nKey('没有授权时：上传系统导出的文件'), esg_ir: i18nKey('没有授权时：上传系统导出的文件'),
};

export const FAU_DATA_SOURCES: FauDataSource[] = (DATA.sources as Array<Omit<FauDataSource, 'fallback'>>).map((d) => ({ ...d, fallback: FALLBACK[d.layer] }));

export function dataSourceByConnector(connectorId: string): FauDataSource | undefined {
  return FAU_DATA_SOURCES.find((d) => d.connectorId === connectorId);
}

// ─── ERP 只读取数（批次 8，第 8.2 节 P1）：agent ERP 插件的 backend，经 data.erp_query 取数 ───

export interface FauErpProvider {
  /** agent ERP 插件的 backend 名 */
  id: string;
  /** 词典 key */
  name: string;
  /** 对应公司档案里的 ERP */
  erp: 'yonyou' | 'kingdee' | 'chanjet' | 'other';
  /** 会按单次上限截断（kingdee Limit / U8 TOP）：取数时带 limit，拿满即判截断 */
  capped: boolean;
}

export const FAU_ERP_PROVIDERS: FauErpProvider[] = [
  { id: 'kingdee_cloud', name: i18nKey('金蝶云星空'), erp: 'kingdee', capped: true },
  { id: 'yonyou_u8', name: i18nKey('用友 U8'), erp: 'yonyou', capped: true },
  { id: 'changjietong', name: i18nKey('畅捷通 T+'), erp: 'chanjet', capped: false },
  { id: 'jdy', name: i18nKey('精斗云'), erp: 'kingdee', capped: false },
];

/** ERP 里有的数据类型：第 ② 步这些槽位旁边才给「从 ERP 取数」（银行流水来自银行、政策表与证据是人填的） */
export const FAU_ERP_KINDS: readonly string[] = ['journal', 'tb', 'subledger', 'ar', 'ap', 'po', 'grn', 'invoice', 'fa_register', 'payroll', 'budget'];

/** 单次取数上限：拿到这么多行就当被截断，判失败（不拿部分数据当全量） */
export const FAU_ERP_MAX_ROWS = 5000;

/**
 * 单据类型与查询条件的参考写法（真实账套未验证，取回后照常过列识别与人工确认）。
 * 占位符 {from} {to} {year} {month} 按项目期间代入；没有参考写法的由用户按自己账套的接口目录填写。
 */
export const FAU_ERP_PRESETS: Record<string, Partial<Record<string, { docType: string; filters: Record<string, string> }>>> = {
  kingdee_cloud: {
    journal: {
      docType: 'GL_VOUCHER',
      filters: {
        field_keys: 'FDate,FBillNo,FEntity_FAccountId.FNumber,FEntity_FAccountId.FName,FEntity_FEXPLANATION,FEntity_FDEBIT,FEntity_FCREDIT',
        filter_string: "FDate>='{from}' and FDate<='{to}'",
      },
    },
  },
  yonyou_u8: {
    journal: { docType: 'GL_accvouch', filters: { _sql: 'SELECT dbill_date, ino_id, ccode, cdigest, md, mc FROM GL_accvouch WHERE iyear = {year} AND iperiod = {month}' } },
    tb: { docType: 'GL_accsum', filters: { _sql: 'SELECT ccode, mb, md, mc, me FROM GL_accsum WHERE iyear = {year} AND iperiod = {month}' } },
  },
  changjietong: {
    ar: { docType: '/tplus/api/v2/receivable/Query', filters: { period: '{year}-{month}' } },
  },
};
