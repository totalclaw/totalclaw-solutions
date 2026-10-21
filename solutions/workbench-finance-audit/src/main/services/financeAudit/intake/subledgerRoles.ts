/** 批次 2（A3–A8）子账类型的列角色（第 7.1 节）。关键字在 subledgerKeywords.json。 */
import { i18nKey } from '@totalclaw/i18n';
import type { FauInputKind } from '@totalclaw/ipc-contracts';
import type { RoleDef } from './columns';

const r = (key: string, label: string, required = false): RoleDef => (required ? { key, label, required } : { key, label });

const OPEN_ITEM = (party: string, amountLabel: string): RoleDef[] => [
  r('party', party, true), r('invoiceRef', i18nKey('发票号 / 单据号')), r('poNo', i18nKey('采购订单号')),
  r('docDate', i18nKey('开票 / 单据日期')), r('dueDate', i18nKey('到期日')), r('termDays', i18nKey('账期（天）')),
  r('itemAmount', amountLabel), r('openAmount', i18nKey('未清金额')), r('settled', i18nKey('已收 / 已付金额')),
  r('currency', i18nKey('币种')), r('disputed', i18nKey('是否争议')),
];
const PARTY: RoleDef[] = [
  r('partyName', i18nKey('名称'), true), r('regNo', i18nKey('信用代码 / 税号')), r('grade', i18nKey('等级')), r('termDays', i18nKey('账期（天）')),
  r('creditLimit', i18nKey('信用额度')), r('requestedLimit', i18nKey('申请额度')), r('debtRatio', i18nKey('资产负债率')), r('cashFlow', i18nKey('经营现金流')),
  r('riskFlags', i18nKey('风险信号')), r('payeeAccount', i18nKey('收款账号')), r('payeeBank', i18nKey('开户行')), r('payeeName', i18nKey('账户名')),
  r('prevAccount', i18nKey('原收款账号')), r('relatedParty', i18nKey('是否关联方')), r('blacklisted', i18nKey('是否黑名单')),
];
/** 三单：本单单号（订单 / 收货 / 发票）+ 订单号 + 行 + 数量 + 单价 / 金额 */
const PROCURE = (doc: RoleDef | null, poRequired: boolean): RoleDef[] => [
  ...(doc ? [doc] : []), r('poNo', i18nKey('采购订单号'), poRequired),
  r('poLine', i18nKey('订单行号')), r('item', i18nKey('物料 / 品名')), r('party', i18nKey('供应商')), r('quantity', i18nKey('数量'), true),
  r('unitPrice', i18nKey('不含税单价')), r('netAmount', i18nKey('不含税金额')), r('taxRate', i18nKey('税率')), r('docDate', i18nKey('日期')),
];

export const SUBLEDGER_ROLES: Partial<Record<FauInputKind, RoleDef[]>> = {
  ar: OPEN_ITEM(i18nKey('客户'), i18nKey('应收金额')),
  ap: OPEN_ITEM(i18nKey('供应商'), i18nKey('应付金额')),
  receipt: [r('party', i18nKey('客户'), true), r('invoiceRef', i18nKey('核销发票号')), r('receiptDate', i18nKey('收款日期'), true), r('receiptAmount', i18nKey('收款金额'), true)],
  customer: PARTY,
  supplier: PARTY,
  po: PROCURE(null, true),
  grn: PROCURE(r('grnNo', i18nKey('收货单号')), true),
  invoice: PROCURE(r('invoiceRef', i18nKey('发票号'), true), false),
  funds: [r('fundAccount', i18nKey('账户')), r('fundBalance', i18nKey('余额'), true), r('scheduled', i18nKey('已排期付款')), r('frozen', i18nKey('冻结金额'))],
  expense_claim: [
    r('claimNo', i18nKey('报销单号')), r('employee', i18nKey('报销人'), true), r('dept', i18nKey('部门')), r('empLevel', i18nKey('职级')),
    r('category', i18nKey('费用类型')), r('submitDate', i18nKey('提交日期')), r('expenseDate', i18nKey('费用发生日期')),
    r('invoiceKind', i18nKey('发票类型')), r('invoiceCode', i18nKey('发票代码')), r('invoiceRef', i18nKey('发票号')), r('docDate', i18nKey('开票日期')),
    r('sellerName', i18nKey('销售方')), r('sellerTaxId', i18nKey('销售方税号')), r('buyerName', i18nKey('购买方')), r('buyerTaxId', i18nKey('购买方税号')),
    r('netAmount', i18nKey('不含税金额')), r('taxAmount', i18nKey('税额')), r('totalAmount', i18nKey('价税合计'), true), r('taxRate', i18nKey('税率')),
    r('qr', i18nKey('电子发票二维码')),
  ],
  fa_register: [
    r('assetNo', i18nKey('资产编号'), true), r('assetName', i18nKey('资产名称')), r('assetCategory', i18nKey('资产类别')),
    r('acquireDate', i18nKey('开始使用日期'), true), r('cost', i18nKey('原值'), true), r('depMethod', i18nKey('折旧方法')),
    r('lifeMonths', i18nKey('使用月数')), r('lifeYears', i18nKey('使用年限')), r('salvageRate', i18nKey('残值率')), r('salvage', i18nKey('净残值')),
    r('bookedAccum', i18nKey('累计折旧')), r('bookedPeriod', i18nKey('本期折旧')), r('impairment', i18nKey('减值准备')),
    r('totalUnits', i18nKey('预计总工作量')), r('periodUnits', i18nKey('本期工作量')), r('unitsToDate', i18nKey('累计工作量')),
    r('dept', i18nKey('使用部门')), r('assetStatus', i18nKey('使用状态')), r('disposalDate', i18nKey('处置日期')),
  ],
  fa_movement: [
    r('movementType', i18nKey('变动类型'), true), r('assetNo', i18nKey('资产编号'), true), r('assetName', i18nKey('资产名称')),
    r('docDate', i18nKey('日期')), r('cost', i18nKey('原值')), r('proceeds', i18nKey('处置收入')), r('disposalCosts', i18nKey('处置费用')),
  ],
  payroll: [
    r('empId', i18nKey('员工编号')), r('empName', i18nKey('姓名')), r('dept', i18nKey('部门')),
    r('payBase', i18nKey('基本工资')), r('payPosition', i18nKey('岗位工资')), r('payBonus', i18nKey('绩效 / 奖金')), r('payOvertime', i18nKey('加班费')),
    r('payAllowance', i18nKey('补贴')), r('payHousing', i18nKey('住房补贴')), r('payOther', i18nKey('其他应发')),
    r('gross', i18nKey('应发合计'), true), r('socialPersonal', i18nKey('个人社保')), r('fundPersonal', i18nKey('个人公积金')),
    r('iitWithheld', i18nKey('实扣个税')), r('otherDeductions', i18nKey('其他扣款')), r('netPay', i18nKey('实发合计')),
    r('socialBase', i18nKey('社保缴费基数')), r('fundBase', i18nKey('公积金基数')), r('special', i18nKey('专项附加扣除')),
    r('ytdIncome', i18nKey('本年累计收入（不含本月）')), r('ytdInsurance', i18nKey('累计专项扣除（不含本月）')), r('ytdSpecial', i18nKey('累计专项附加扣除（不含本月）')),
    r('ytdTaxPaid', i18nKey('累计已预扣税额')), r('monthIndex', i18nKey('本年累计月数')), r('employerBooked', i18nKey('单位社保公积金')),
    r('hireDate', i18nKey('入职日期')), r('leaveDate', i18nKey('离职日期')), r('nationality', i18nKey('国籍')),
    r('serviceStart', i18nKey('服务起始日')), r('eosbBooked', i18nKey('期末服务金余额')),
  ],
  intercompany: [
    r('entity', i18nKey('本方公司'), true), r('icCounterparty', i18nKey('对方公司'), true), r('icType', i18nKey('往来类型 / 科目')),
    r('docNo', i18nKey('单据号')), r('docDate', i18nKey('日期')), r('localAmount', i18nKey('本位币金额'), true), r('fxAmount', i18nKey('原币金额')),
    r('currency', i18nKey('币种')), r('internalPrice', i18nKey('内部价格')), r('marketPrice', i18nKey('市场价格')),
  ],
  guarantee: [
    r('guarantor', i18nKey('担保方'), true), r('beneficiary', i18nKey('被担保方'), true), r('beneficiaryType', i18nKey('被担保方类型')),
    r('guaranteeAmount', i18nKey('担保金额'), true), r('startDate', i18nKey('起始日')), r('endDate', i18nKey('到期日')),
    r('feeRate', i18nKey('担保费率')), r('status', i18nKey('状态')), r('approved', i18nKey('是否审批')), r('netAssets', i18nKey('担保方净资产')),
  ],
};

/** 每组至少要对上一列（不是单列必需） */
export const SUBLEDGER_ANY_OF: Partial<Record<FauInputKind, string[][]>> = {
  ar: [['itemAmount', 'openAmount'], ['docDate', 'dueDate']],
  ap: [['itemAmount', 'openAmount'], ['docDate', 'dueDate']],
  po: [['unitPrice', 'netAmount']],
  invoice: [['unitPrice', 'netAmount']],
  payroll: [['empId', 'empName']],
  fa_register: [['lifeMonths', 'lifeYears']],
};
