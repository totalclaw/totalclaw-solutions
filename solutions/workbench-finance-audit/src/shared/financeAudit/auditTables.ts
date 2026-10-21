/**
 * 审计组按文件导入的表格：模块槽位 → 表格类型（主进程识别列、下载模板；界面决定哪些槽位显示「下载模板」）。
 * 列识别关键字在 main/services/financeAudit/engines/audit/columnKeywords.json。
 */
export const AUDIT_SLOT_TABLES = {
  icfr: { controls: 'controls', population: 'population', deficiencies: 'deficiencies' },
  'internal-audit': { universe: 'universe', findings: 'findings' },
  'ext-audit': { pbc: 'pbc', confirmList: 'confirmations' },
  review: { lpStatements: 'lpStatement', navLp: 'navLp', navFund: 'navFund' },
  fraud: { payments: 'payments', vendors: 'vendors', employees: 'employees' },
  kyc: { rules: 'kycRules', watchlist: 'watchlist' },
} as const satisfies Record<string, Record<string, string>>;

export function hasTemplate(moduleId: string, slot: string): boolean {
  return !!(AUDIT_SLOT_TABLES as Record<string, Record<string, string>>)[moduleId]?.[slot];
}
