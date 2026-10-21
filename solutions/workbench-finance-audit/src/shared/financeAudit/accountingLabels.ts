/**
 * 批次 2（A3–A8）结果里的枚举与问题标记 → 词典 key。主进程产出（tIn）与渲染层（$t）共用一份，
 * 保证界面、底稿、签核页上同一个分类叫同一个名字。
 */
import { i18nKey } from '@totalclaw/i18n';
import type {
  FauAgingBucket, FauAnomalyCode, FauClaimVerdict, FauCreditApproval, FauDepMethod, FauDunningStage, FauGapTier, FauIcPair, FauMatchGrade, FauMatchQty,
  FauOverdueLevel, FauPayApproval, FauPayHistory, FauPayPriority, FauPayrollRegime, FauRiskLevel,
} from '@totalclaw/ipc-contracts';

export const AGING_BUCKET_LABEL: Record<FauAgingBucket, string> = {
  current: i18nKey('未逾期'), d1_30: i18nKey('逾期 1–30 天'), d31_60: i18nKey('逾期 31–60 天'), d61_90: i18nKey('逾期 61–90 天'),
  d91_180: i18nKey('逾期 91–180 天'), d181_365: i18nKey('逾期 181–365 天'), over365: i18nKey('逾期 1 年以上'),
};
/** 判断框架类型五的坏账概率分档（数字原样，不翻译） */
export const BAD_DEBT_PROBABILITY: Record<FauAgingBucket, string> = {
  current: '-', d1_30: '< 5%', d31_60: '5–15%', d61_90: '5–15%', d91_180: '15–40%', d181_365: '40–70%', over365: '> 70%',
};
export const RISK_LABEL: Record<FauRiskLevel, string> = { low: i18nKey('低'), medium: i18nKey('中'), high: i18nKey('高') };
export const STAGE_LABEL: Record<FauDunningStage, string> = {
  0: i18nKey('未逾期'), 1: i18nKey('阶段 1：友好提醒'), 2: i18nKey('阶段 2：正式提醒'), 3: i18nKey('阶段 3：书面催款'),
  4: i18nKey('阶段 4：最后通知并暂停接单'), 5: i18nKey('阶段 5：诉讼评估或核销评估'),
};
export const PAY_HISTORY_LABEL: Record<FauPayHistory, string> = {
  excellent: i18nKey('优秀'), good: i18nKey('良好'), fair: i18nKey('一般'), poor: i18nKey('较差'), bad: i18nKey('极差'), unknown: i18nKey('无记录'),
};
export const CREDIT_APPROVAL_LABEL: Record<FauCreditApproval, string> = {
  ar_supervisor: i18nKey('AR 主管'), credit_manager: i18nKey('AR 主管 + 信用管理经理'), cfo: i18nKey('AR 主管 + 信用管理经理 + 财务总监'),
};

export const MATCH_QTY_LABEL: Record<FauMatchQty, string> = {
  full: i18nKey('数量完全匹配'), partial: i18nKey('部分交货'), invoice_short: i18nKey('发票数量少于收货'), over_invoiced: i18nKey('发票数量多于收货'),
  not_received: i18nKey('未收货'), not_invoiced: i18nKey('未开票'),
};
export const MATCH_GRADE_LABEL: Record<FauMatchGrade, string> = {
  match: i18nKey('完全匹配'), within_tol: i18nKey('容差内'), review: i18nKey('需说明，主管审批'), reject: i18nKey('不付，联系供应商'),
};
export const TAX_CHECK_LABEL: Record<string, string> = { ok: i18nKey('税率一致'), lower: i18nKey('发票税率低于订单'), higher: i18nKey('发票税率高于订单'), unknown: i18nKey('税率未知') };
export const PRIORITY_LABEL: Record<FauPayPriority, string> = {
  P0: i18nKey('P0 已逾期'), P1: i18nKey('P1 战略供应商'), P2: i18nKey('P2 7 天内到期'), P3: i18nKey('P3 8–30 天到期'), P4: i18nKey('P4 30 天后到期'),
};
export const PAY_APPROVAL_LABEL: Record<FauPayApproval, string> = {
  l1: i18nKey('AP 专员 → AP 主管'), l2: i18nKey('加财务经理'), l3: i18nKey('加财务总监'), l4: i18nKey('加 CEO'),
};
export const OVERDUE_LEVEL_LABEL: Record<FauOverdueLevel, string> = {
  none: i18nKey('未逾期'), normal: i18nKey('正常'), attention: i18nKey('关注'), warning: i18nKey('警告'), high: i18nKey('高风险'),
};
export const GAP_TIER_LABEL: Record<FauGapTier, string> = {
  none: i18nKey('资金充足'), small: i18nKey('小额缺口：延后 P3 / P4 或加速催收'), medium: i18nKey('中等缺口：短期融资并协商延后'), large: i18nKey('大额缺口：升级财务总监'),
};
export const SUPPLIER_CONCLUSION_LABEL: Record<string, string> = { approve: i18nKey('可付'), conditional: i18nKey('附条件'), hold: i18nKey('暂停付款') };

export const CLAIM_VERDICT_LABEL: Record<FauClaimVerdict, string> = { pass: i18nKey('通过'), review: i18nKey('需补正'), reject: i18nKey('驳回'), escalate: i18nKey('升级') };
export const ANOMALY_LABEL: Record<FauAnomalyCode, string> = {
  high_frequency: i18nKey('高频异常员工'), split: i18nKey('疑似拆单'), supplier_concentration: i18nKey('供应商集中'), cross_period: i18nKey('跨期规律'),
  weekend: i18nKey('周末票据'), round_amount: i18nKey('整数金额'), sequential: i18nKey('发票连号'), duplicate: i18nKey('同票多报'),
};
export const QR_PROBLEM_LABEL: Record<string, string> = {
  decode: i18nKey('二维码解不开'), missing_tags: i18nKey('缺必填字段'), seller: i18nKey('卖方名称不一致'), vat_no: i18nKey('增值税号不一致'),
  vat_no_format: i18nKey('增值税号格式不对'), date: i18nKey('开票时间不一致'), total: i18nKey('含税总额不一致'), vat: i18nKey('增值税额不一致'),
};

export const DEP_METHOD_LABEL: Record<FauDepMethod, string> = {
  straight_line: i18nKey('直线法'), units: i18nKey('工作量法'), ddb: i18nKey('双倍余额递减法'), syd: i18nKey('年数总和法'),
};
export const PAYROLL_REGIME_LABEL: Record<FauPayrollRegime, string> = { cn: i18nKey('中国'), sa: i18nKey('沙特'), intl: i18nKey('国际') };
export const BASE_FLAG_LABEL: Record<string, string> = { ok: i18nKey('在上下限内'), below: i18nKey('低于下限'), above: i18nKey('高于上限'), unchecked: i18nKey('未检查') };
/** 内部往来差异分类（沿用 A2 总账 ↔ 子账的六类，两边换成本方 / 对方） */
export const IC_CLASS_LABEL: Record<string, string> = {
  matched: i18nKey('相符'), amount: i18nKey('金额差异'), quantity: i18nKey('数量差异'), timing: i18nKey('时间差异'), gl_only: i18nKey('仅本方入账'), sub_only: i18nKey('仅对方入账'),
};
export const IC_PAIR_LABEL: Record<FauIcPair, string> = {
  arap: i18nKey('应收 ↔ 应付'), sales: i18nKey('内部销售 ↔ 内部采购'), loan: i18nKey('借出 ↔ 借入'), interest: i18nKey('利息收入 ↔ 利息支出'), other: i18nKey('其他往来'),
};

/** 问题标记 code → 词典 key（params 原样插值） */
export const FLAG_LABEL: Record<string, string> = {
  // A3
  'ar.utilization': i18nKey('信用额度使用率 {p0}'),
  'ar.risk_signal': i18nKey('高风险信号：{p0}'),
  'ar.disputed': i18nKey('有争议款项'),
  'credit.no_history': i18nKey('没有付款记录，按新客户评估'),
  'credit.late': i18nKey('逾期 {n} 次，最长 {m} 天'),
  'credit.high_debt': i18nKey('资产负债率 {p0}，高负债'),
  'credit.negative_cf': i18nKey('经营现金流为负'),
  'credit.high_risk': i18nKey('高风险信号：{p0}，否决授信'),
  'credit.over_limit_minor': i18nKey('超额度 {p0}，AR 主管审批'),
  'credit.over_limit': i18nKey('超额度 {p0}，须重新评估信用'),
  // A4
  'match.no_po': i18nKey('发票没有对应的采购订单'),
  'match.over_received': i18nKey('收货数量多于订单'),
  'match.over_invoiced': i18nKey('发票数量多于收货，多出 {n} 不付'),
  'match.invoice_short': i18nKey('发票数量少于收货，联系供应商补票'),
  'match.partial': i18nKey('部分交货，按实收结算'),
  'match.not_received': i18nKey('已开票未收货，暂不付'),
  'match.price': i18nKey('单价差异率 {p0}'),
  'match.tax_lower': i18nKey('发票税率 {p0} 低于订单税率 {p1}，收到正确发票前不付'),
  'match.tax_higher': i18nKey('发票税率 {p0} 高于订单税率 {p1}，须说明'),
  'plan.hold_match': i18nKey('三单不符暂扣'),
  'plan.hold_supplier': i18nKey('供应商复核未通过暂停'),
  'sup.account_changed': i18nKey('收款账户变更：{p0} → {p1}'),
  'sup.personal_account': i18nKey('账户名「{p0}」与供应商名称不一致，疑似个人账户'),
  'sup.related_party': i18nKey('关联方'),
  'sup.blacklist': i18nKey('在黑名单或制裁名单中'),
  'sup.credit_code': i18nKey('信用代码 {p0} 校验位不对'),
  'sup.not_in_master': i18nKey('供应商档案里找不到'),
  'sup.split': i18nKey('{p0} 同日 {n} 笔金额贴近审批限额，疑似分拆'),
  'sup.concentration': i18nKey('占应付总额 {p0}，集中度过高'),
  // A5（财务智能体预审规则的结论码，只读复用）
  'inv.duplicate': i18nKey('同一张发票重复报销'),
  'inv.title': i18nKey('发票抬头不是本公司'),
  'inv.title_wrong': i18nKey('购买方税号不是本公司'),
  'inv.title_unknown': i18nKey('购买方和销售方都不是本公司，请确认抬头'),
  'inv.expired': i18nKey('票据开具已 {n} 天，超过 {m} 天有效期'),
  'inv.cross_year': i18nKey('跨年票据，超过次年 1 月 31 日报销期限'),
  'inv.no_date': i18nKey('没有开票日期'),
  'inv.need_special': i18nKey('该类费用要求增值税专用发票'),
  'inv.no_rule': i18nKey('费用类别没有报销标准，需人工判断'),
  'inv.not_invoice': i18nKey('不是正式发票（收据 / 小票）'),
  'inv.sum_mismatch': i18nKey('金额 + 税额 ≠ 价税合计'),
  'inv.rate_mismatch': i18nKey('税额与金额 × 税率对不上'),
  'inv.items_mismatch': i18nKey('明细金额合计与票面不一致'),
  'inv.uscc_invalid': i18nKey('税号校验位不对'),
  'inv.future_date': i18nKey('开票日期晚于截止日'),
  'inv.old_date': i18nKey('票据开具已超过 360 天'),
  'inv.red_letter': i18nKey('红字（负数）票据'),
  'inv.no_number': i18nKey('没有发票号码，无法查重'),
  'inv.no_total': i18nKey('没有金额'),
  'inv.normal_no_deduct': i18nKey('普通发票税额不能抵扣'),
  'inv.missing': i18nKey('票据缺失'),
  'inv.quota': i18nKey('超出本月报销额度'),
  'inv.other': i18nKey('预审提示：{p0}'),
  'exp.over_minor': i18nKey('超标 {p0}（标准 {p1}），轻微，直属上级确认'),
  'exp.over_review': i18nKey('超标 {p0}（标准 {p1}），须上级加签'),
  'exp.over_reject': i18nKey('超标 {p0}（标准 {p1}），初步驳回'),
  'exp.late_warn': i18nKey('提交距开票 {n} 天，须说明原因'),
  'exp.late_reject': i18nKey('提交距开票 {n} 天，超过时限'),
  'exp.qr_mismatch': i18nKey('ZATCA 二维码与票面不一致：{p0}'),
  'exp.qr_invalid': i18nKey('ZATCA 二维码无法解析'),
  'exp.escalate_single': i18nKey('单笔金额超过升级门槛'),
  // A6
  'asset.dep_diff': i18nKey('本期折旧重算 {p0}，账面 {p1}，差 {p2}'),
  'asset.accum_diff': i18nKey('累计折旧重算 {p0}，账面 {p1}，差 {p2}'),
  'asset.not_depreciated': i18nKey('在用资产本期应提未提'),
  'asset.early_dep': i18nKey('本月新增资产当月不提折旧，账面已提'),
  'asset.fully_in_use': i18nKey('已提足折旧仍在使用'),
  'asset.no_life': i18nKey('没有使用年限，无法重算'),
  'asset.units_missing': i18nKey('工作量法缺总工作量或本期工作量'),
  'asset.method_unknown': i18nKey('折旧方法「{p0}」认不出，按直线法重算'),
  'asset.below_cap': i18nKey('金额 {p0} 低于资本化门槛，可能应费用化'),
  'asset.large_cap': i18nKey('大额资本化 {p0}，须核对审批'),
  'asset.disposal_not_found': i18nKey('处置单的资产在台账里找不到'),
  'asset.disposal_loss': i18nKey('处置损失 {p0}'),
  'asset.impaired': i18nKey('有减值准备：后续折旧按减值后账面价值另行核对，不在这里比较'),
  // A7
  'pay.gross_mismatch': i18nKey('应发明细合计 {p0} ≠ 应发合计 {p1}'),
  'pay.net_mismatch': i18nKey('实发 {p0} ≠ 应发减扣款 {p1}'),
  'pay.personal_mismatch': i18nKey('个人社保公积金实扣 {p0}，按基数应扣 {p1}'),
  'pay.iit_mismatch': i18nKey('个税实扣 {p0}，累计预扣法应扣 {p1}'),
  'pay.iit_escalate': i18nKey('个税误差超过升级门槛'),
  'pay.base_below': i18nKey('缴费基数 {p0} 低于下限'),
  'pay.base_above': i18nKey('缴费基数 {p0} 高于上限'),
  'pay.no_base': i18nKey('没有缴费基数，按应发合计核对'),
  'pay.gosi_mismatch': i18nKey('GOSI 个人实扣 {p0}，应扣 {p1}'),
  'pay.eosb_mismatch': i18nKey('期末服务金账面 {p0}，重算 {p1}'),
  'pay.no_service_start': i18nKey('没有服务起始日，期末服务金按入职日期计算'),
  'pay.no_nationality': i18nKey('没有国籍，按沙特籍计算 GOSI'),
  'pay.new_hire': i18nKey('本期新增人员'),
  'pay.hire_no_base': i18nKey('新增人员没有参保基数'),
  'pay.leaver': i18nKey('本期减员'),
  'pay.leaver_paid': i18nKey('{p0} 已离职仍在本期工资表'),
  // A8
  'gua.over_limit': i18nKey('担保余额占净资产 {p0}，超过上限 {p1}'),
  'gua.expiring': i18nKey('{p0} 到期，须安排续保或解除'),
  'gua.expired_active': i18nKey('已于 {p0} 到期，状态仍为有效'),
  'gua.unapproved': i18nKey('没有审批记录'),
  'gua.no_fee': i18nKey('免担保费或费率为 0'),
  'gua.single_over': i18nKey('单笔担保超过上限'),
  'gua.no_net_assets': i18nKey('没有担保方净资产，不能算担保比例'),
};

export function flagKey(code: string): string {
  return FLAG_LABEL[code] || code;
}
