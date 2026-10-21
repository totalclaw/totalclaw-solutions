/**
 * 审计组（B1–B6、P4）枚举值的显示名：词典 key，主进程产出用 tIn、界面用 $t。主进程与渲染层共用。
 */
import { i18nKey } from '@totalclaw/i18n';
import type {
  FauCompensating, FauConfirmStatus, FauConfirmType, FauControlFrequency, FauControlTest, FauDeficiencyGrade, FauFindingSeverity,
  FauImpactLevel, FauKycDisposition, FauNavLineId, FauQcSeverity, FauSampleResult, FauXlsRule,
} from '@totalclaw/ipc-contracts';

export const FREQ_LABEL: Record<FauControlFrequency, string> = {
  annual: i18nKey('每年'), quarterly: i18nKey('每季'), monthly: i18nKey('每月'), weekly: i18nKey('每周'), daily: i18nKey('每日'), multiple: i18nKey('每日多次'),
};
export const IMPACT_LABEL: Record<FauImpactLevel, string> = { high: i18nKey('高'), medium: i18nKey('中'), low: i18nKey('低') };
export const COMP_LABEL: Record<FauCompensating, string> = { effective: i18nKey('有效'), partial: i18nKey('部分有效'), none: i18nKey('无') };
export const GRADE_LABEL: Record<FauDeficiencyGrade, string> = {
  material_weakness: i18nKey('重大缺陷'), significant: i18nKey('重要缺陷'), deficiency: i18nKey('一般缺陷'), improvement: i18nKey('改进建议'),
};
export const RESULT_LABEL: Record<FauSampleResult, string> = { pending: i18nKey('待测试'), pass: i18nKey('通过'), fail: i18nKey('不通过') };
export const CONCLUSION_LABEL: Record<FauControlTest['conclusion'], string> = { effective: i18nKey('运行有效'), ineffective: i18nKey('运行无效'), pending: i18nKey('待评') };
export const TYPE_LABEL: Record<'preventive' | 'detective', string> = { preventive: i18nKey('预防性'), detective: i18nKey('检查性') };
export const NATURE_LABEL: Record<'manual' | 'automated' | 'itdm', string> = { manual: i18nKey('手工'), automated: i18nKey('自动'), itdm: i18nKey('IT 依赖的手工控制') };

export const SEVERITY_LABEL: Record<FauFindingSeverity, string> = { major: i18nKey('重大'), moderate: i18nKey('中度'), low: i18nKey('轻度') };
export const FINDING_KIND_LABEL: Record<'deficiency' | 'improvement' | 'compliance', string> = { deficiency: i18nKey('控制缺陷'), improvement: i18nKey('改进机会'), compliance: i18nKey('合规问题') };
export const TRACK_STATUS_LABEL: Record<'open' | 'in_progress' | 'closed', string> = { open: i18nKey('未整改'), in_progress: i18nKey('整改中'), closed: i18nKey('已完成') };
export const TIER_LABEL: Record<0 | 1 | 2 | 3, string> = { 0: i18nKey('未超期'), 1: i18nKey('提醒负责人'), 2: i18nKey('升级 CFO'), 3: i18nKey('升级审计委员会') };

export const CONFIRM_TYPE_LABEL: Record<FauConfirmType, string> = { bank: i18nKey('银行函证'), ar: i18nKey('应收函证'), ap: i18nKey('应付函证'), other: i18nKey('其他函证') };
export const CONFIRM_STATUS_LABEL: Record<FauConfirmStatus, string> = {
  draft: i18nKey('草稿未发'), sent: i18nKey('已发函待回'), replied_match: i18nKey('回函相符'), replied_diff: i18nKey('回函不符'), no_reply: i18nKey('未回函'),
};
export const PBC_STATUS_LABEL: Record<'requested' | 'provided' | 'overdue', string> = { requested: i18nKey('待提供'), provided: i18nKey('已提供'), overdue: i18nKey('已超期') };
/** 替代程序（confirmation-management / 判断框架类型五第四步） */
export const ALTERNATIVE_PROCEDURES: Record<FauConfirmType, string[]> = {
  bank: [i18nKey('取得银行对账单逐笔核对'), i18nKey('检查期后银行流水'), i18nKey('二次发函或改由审计师直接询证')],
  ar: [i18nKey('检查期后收款记录'), i18nKey('检查发货单与验收单'), i18nKey('检查发票与合同')],
  ap: [i18nKey('检查期后付款记录'), i18nKey('检查入库单与发票'), i18nKey('取得供应商对账单')],
  other: [i18nKey('检查相关合同与凭证'), i18nKey('取得管理层书面说明')],
};

export const XLS_RULE_LABEL: Record<FauXlsRule, string> = {
  error_value: i18nKey('公式错误值'), hardcode_in_formula: i18nKey('公式里的硬编码'), inconsistent_formula: i18nKey('公式与相邻单元格不一致'),
  sum_range_gap: i18nKey('求和区间漏行'), broken_link: i18nKey('跨表引用断链'), hidden_sheet: i18nKey('隐藏工作表'), hidden_rows: i18nKey('隐藏行或列'),
  pasted_value: i18nKey('公式列里粘贴的数值'), bs_unbalanced: i18nKey('资产负债表不平'),
};
export const DECK_RULE_LABEL: Record<string, string> = {
  number_mismatch: i18nKey('同一指标在不同页数值不一致'), unit_style: i18nKey('单位写法混用'), date_format: i18nKey('日期格式混用'),
  placeholder: i18nKey('占位符未替换'), casual_language: i18nKey('口语化措辞'), contraction: i18nKey('英文缩写形式'), exclamation: i18nKey('感叹号'),
  missing_source: i18nKey('有数字但没有来源说明'),
};
export const QC_SEVERITY_LABEL: Record<FauQcSeverity, string> = { critical: i18nKey('严重'), important: i18nKey('重要'), minor: i18nKey('次要') };
export const NAV_LINE_LABEL: Record<FauNavLineId, string> = {
  beginning: i18nKey('期初资本'), contributions: i18nKey('本期出资'), distributions: i18nKey('本期分配'), allocatedPnl: i18nKey('分摊损益'), carry: i18nKey('附带权益'), ending: i18nKey('期末资本'),
};

export const FRAUD_RULE_LABEL: Record<string, string> = {
  benford: i18nKey('本福特首位数检验'),
  duplicate_payment: i18nKey('重复付款'),
  weekend_entry: i18nKey('周末 / 节假日分录'),
  period_end_manual: i18nKey('期末大额手工调整'),
  round_amount: i18nKey('整数金额'),
  vendor_employee_bank: i18nKey('供应商与员工银行账户相同'),
  related_name: i18nKey('供应商与员工名称相似'),
  large_cash: i18nKey('大额现金收付'),
  expense_spike: i18nKey('费用科目环比暴涨'),
  fa_round_amount: i18nKey('整千大额费用'),
  weekend_entertain: i18nKey('周末业务招待费'),
  idle_other: i18nKey('往来科目挂账无发生额'),
  wrong_side: i18nKey('资产科目余额在贷方'),
  stale_aging: i18nKey('往来长期挂账（账龄）'),
  consecutive: i18nKey('发票连号'),
  pay_person: i18nKey('大额付给个人'),
  low_burden: i18nKey('税负率偏低'),
  bad_docs: i18nKey('问题票据'),
};
export const BENFORD_LABEL: Record<'close' | 'acceptable' | 'marginal' | 'nonconformity' | 'insufficient', string> = {
  close: i18nKey('高度符合'), acceptable: i18nKey('可接受'), marginal: i18nKey('边缘符合'), nonconformity: i18nKey('不符合'), insufficient: i18nKey('样本不足，不下结论'),
};

export const KYC_DISPOSITION_LABEL: Record<FauKycDisposition, string> = {
  clear: i18nKey('无异常（待合规官决定）'), 'request-docs': i18nKey('补充资料'), 'escalate-EDD': i18nKey('升级强化尽调'), 'decline-recommend': i18nKey('建议拒绝'),
};
export const KYC_EFFECT_LABEL: Record<'escalate' | 'request_docs' | 'decline' | 'risk', string> = {
  escalate: i18nKey('升级'), request_docs: i18nKey('补件'), decline: i18nKey('建议拒绝'), risk: i18nKey('计分'),
};
export const APPLICANT_LABEL: Record<'individual' | 'entity' | 'trust' | '', string> = { individual: i18nKey('个人'), entity: i18nKey('法人'), trust: i18nKey('信托'), '': i18nKey('未识别') };
