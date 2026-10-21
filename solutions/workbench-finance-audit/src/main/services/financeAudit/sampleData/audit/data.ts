/**
 * 批次 3 审计组夹具（单测、流程测试、E2E 共用）。期望数字手算写在注释里。
 * 表格写成 xlsx 时表头用 engines/audit/columnKeywords.json 认得出的中文 / 英文 / 阿语表头。
 */
import * as XLSX from 'xlsx';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

export const AS_OF = '2026-10-19';

export function writeTable(path: string, headers: string[], rows: (string | number)[][]): string {
  mkdirSync(dirname(path), { recursive: true });
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([headers, ...rows]), 'Sheet1');
  XLSX.writeFile(wb, path);
  return path;
}

export function writeText(path: string, text: string): string {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, text, 'utf8');
  return path;
}

// ── B1 内控 ──
// C-01 每日、关键、可容忍 5%：总体 300 → 属性抽样 59（预期 0、置信 95%）、频率下限 25 → 样本量 59
// C-02 每月、关键：总体 12 → min(12, max(59, 2)) = 12，全量测试
// C-03 非关键控制：不安排测试
export const CONTROLS_HEAD = ['控制编号', '流程', '风险', '控制描述', '频率', '关键控制', '可容忍偏差率'];
export const CONTROLS = [
  ['C-01', '采购与付款', '付款未经审批', '单笔超过 50 万元的付款须经财务经理审批', '每日', '是', '5%'],
  ['C-02', '销售与收款', '收入确认不完整', '月末核对发货单与开票记录', '每月', '是', ''],
  ['C-03', '费用报销', '报销超标准', '部门负责人审批报销', '每日', '否', ''],
];
export const POPULATION_HEAD = ['控制编号', '单号', '日期', '金额'];
/** C-01 每笔 60 万元：两个样本不通过 → 偏差 2 > 允许 0 → 运行无效；缺陷金额 120 万 ≥ 100 万 → 财务影响「高」 */
export const POPULATION: (string | number)[][] = [
  ...Array.from({ length: 300 }, (_, i) => ['C-01', `PO-${String(i + 1).padStart(4, '0')}`, `2026-${String((i % 9) + 1).padStart(2, '0')}-15`, 600000]),
  ...Array.from({ length: 12 }, (_, i) => ['C-02', `MC-${String(i + 1).padStart(2, '0')}`, `2026-${String(i + 1).padStart(2, '0')}-28`, 0]),
];
export const SEED = 20261019;

// ── B2 内审 ──
// 可用 40 人天：必审 B（低风险 5）+ 高风险 A（20）一定纳入 = 25；中风险 C（10）→ 35；中风险 D（10）→ 45 > 40 不纳入；低风险 E（5）→ 40 纳入
// 需求 = 必审 + 高 + 中 = 5 + 20 + 10 + 10 = 45 → 缺口 5；每季 10 人天：B Q1、A Q1、C Q3、E Q4
export const UNIVERSE_HEAD = ['审计领域', '可能性', '影响', '是否必审', '上次审计日期'];
export const UNIVERSE = [
  ['资金管理', '高', '高', '否', '2024-03-01'],
  ['关联交易', '低', '低', '是', '2025-01-01'],
  ['存货管理', '中', '中', '否', '2024-01-01'],
  ['税务合规', '低', '高', '否', '2025-06-01'],
  ['行政事务', '低', '低', '否', '2023-01-01'],
];
// 截至 2026-10-19：F-001 超期 48 天 → 升级 CFO；F-002 超期 79 天 → 升级审计委员会；F-003 超期 1 天 → 提醒；F-004 已完成；F-005 无期限
export const FINDINGS_HEAD = ['发现编号', '发现标题', '严重程度', '整改负责人', '整改期限', '状态', '完成日期'];
export const FINDINGS = [
  ['F-001', '供应商主数据变更无复核', '重大', '采购部', '2026-09-01', '未整改', ''],
  ['F-002', '银行 U 盾保管不当', '中度', '资金部', '2026-08-01', '整改中', ''],
  ['F-003', '报销附件不全', '轻度', '财务部', '2026-10-18', '未整改', ''],
  ['F-004', '合同未编号', '轻度', '法务部', '2026-06-01', '已完成', '2026-05-30'],
  ['F-005', '固定资产标签缺失', '轻度', '行政部', '', '未整改', ''],
];
export const POLICY_DOC = '采购付款制度\n第五条 单笔付款超过 50 万元须经财务经理审批。\n第六条 供应商银行账户变更须由采购经理复核。';
export const EVIDENCE_DOC = '抽查记录\n2026 年 3 月抽查发现 PO-0042 付款 60 万元仅有部门经理签字，未经财务经理审批。\n其余抽查样本未见异常。';

// ── B3 外审 ──
export const PBC_HEAD = ['编号', '资料名称', '负责人', '截止日期', '状态', '底稿索引'];
export const PBC = [
  ['PBC-01', '银行对账单', '出纳', '2026-10-10', '已提供', ''],
  ['PBC-02', '合同台账', '法务', '2026-10-15', '未提供', ''],
  ['PBC-03', '月结关账包', '总账会计', '2026-10-30', '未提供', 'A1'],
];
/** AJE-1：补提费用 1 万 → 利润 −10,000.00、负债 +10,000.00；AJE-2：补记收入 5 万 → 利润 +50,000.00、资产 +50,000.00；重要性 3 万 → 只有 AJE-2 超过 */
export const ADJ_HEAD = ['记账日期', '凭证号', '科目编码', '科目名称', '摘要', '借方金额', '贷方金额'];
export const ADJUSTMENTS = [
  ['2026-09-30', 'AJE-1', '6602', '管理费用', '补提审计费', 10000, ''],
  ['2026-09-30', 'AJE-1', '2241', '其他应付款', '补提审计费', '', 10000],
  ['2026-09-30', 'AJE-2', '1122', '应收账款', '补记截止前发货收入', 50000, ''],
  ['2026-09-30', 'AJE-2', '6001', '主营业务收入', '补记截止前发货收入', '', 50000],
];
export const CONFIRM_HEAD = ['函证编号', '函证类型', '函证对象', '邮箱', '账号', '账面金额', '币种'];
export const CONFIRMS = [
  ['CF-001', '银行', '中国工商银行上海分行', 'bank@example.com', '6222 0000 0001', 1000000, 'CNY'],
  ['CF-002', '应收', '甲公司', 'ar@example.com', '应收账款', 500000, 'CNY'],
  ['CF-003', '应付', '乙公司', '', '应付账款', 200000, 'CNY'],
];
/** CF-001 回函相符；CF-002 回函 480,000.00，差 20,000.00 */
export const REPLY_1 = '询证函回函（函证编号 CF-001）\n经核对，截至 2026-09-30 贵公司在我行账户余额为 1,000,000.00 元，与贵公司记录相符。';
export const REPLY_2 = 'Confirmation reply CF-002\nOur records show a balance of 480,000.00 due from us, which differs from your records.';

// ── B4 复核 ──
// LP 资本账户：基金损益 = 已实现 1,000,000 + 未实现 500,000 − 管理费 100,000 − 费用 50,000 = 1,350,000
// LP-01 60%：分摊 810,000；期末 = 6,000,000 + 1,000,000 − 200,000 + 810,000 − 0 = 7,610,000（对账单一致）
// LP-02 40%：分摊 540,000；期末 = 4,000,000 + 540,000 − 54,000 = 4,486,000；对账单用了 40.1% → 分摊 541,350、期末 4,487,350 → 暂扣
// LP 期末合计 12,096,000 = 基金净值
export const LP_HEAD = ['LP 编号', '期初资本', '本期出资', '本期分配', '分摊损益', '附带权益', '期末资本'];
export const LP_STATEMENTS = [
  ['LP-01', 6000000, 1000000, 200000, 810000, 0, 7610000],
  ['LP-02', 4000000, 0, 0, 541350, 54000, 4487350],
];
export const NAV_LP_HEAD = ['LP 编号', '持有比例', '期初资本', '本期出资', '本期分配', '附带权益'];
export const NAV_LP = [
  ['LP-01', '60%', 6000000, 1000000, 200000, 0],
  ['LP-02', '40%', 4000000, 0, 0, 54000],
];
export const NAV_FUND_HEAD = ['项目', '金额'];
export const NAV_FUND = [['已实现损益', 1000000], ['未实现损益', 500000], ['管理费', 100000], ['基金费用', 50000], ['基金净值', 12096000]];

/** 底稿夹具：埋入 #REF!、断链、公式里的硬编码、公式不一致、求和漏行、隐藏表、交叉索引断链 */
export function writePaper(path: string): string {
  mkdirSync(dirname(path), { recursive: true });
  const ws: XLSX.WorkSheet = {
    A1: { t: 's', v: '项目' }, B1: { t: 's', v: '金额' }, C1: { t: 's', v: '含税' }, D1: { t: 's', v: '合计' },
    A8: { t: 's', v: 'B4-01' }, A9: { t: 's', v: '见 B4-01 与 B4-07 底稿' },
    E2: { t: 'n', v: 0, f: 'Missing!A1*2' }, E3: { t: 'e', v: 0x17, w: '#REF!' },
    B7: { t: 'n', v: 1400, f: 'SUM(B3:B6)' },
  };
  for (let r = 2; r <= 6; r += 1) {
    ws[`A${r}`] = { t: 's', v: `x${r}` };
    ws[`B${r}`] = { t: 'n', v: r * 100 };
    ws[`C${r}`] = { t: 'n', v: r * 113, f: `B${r}*1.13` };
    ws[`D${r}`] = { t: 'n', v: r * 213, f: r === 4 ? 'B4+C5' : `B${r}+C${r}` };
  }
  ws['!ref'] = 'A1:E9';
  const hidden: XLSX.WorkSheet = { A1: { t: 's', v: 'old' }, '!ref': 'A1:A1' };
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, '底稿');
  XLSX.utils.book_append_sheet(wb, hidden, 'Hidden');
  wb.Workbook = { Sheets: [{ name: '底稿', Hidden: 0 }, { name: 'Hidden', Hidden: 1 }] } as XLSX.WBProps;
  XLSX.writeFile(wb, path);
  return path;
}

// ── B5 舞弊 ──
export const PAYMENTS_HEAD = ['付款单号', '收款方', '发票号', '付款金额', '付款日期', '收款账号'];
/** P-1 / P-2 同一收款方、同金额、同发票号 → 重复付款（高） */
export const PAYMENTS = [
  ['P-1', '丙公司', '1001', 50000, '2026-09-03', '6222000011112222'],
  ['P-2', '丙公司', '1001', 50000, '2026-09-20', '6222000011112222'],
  ['P-3', '丁公司', '2002', 10000, '2026-09-21', '6222000033334444'],
];
export const VENDORS_HEAD = ['供应商编号', '供应商名称', '银行账号'];
/** V-2 张三商贸 的账号与员工 E-1 张三 相同 → 账户碰撞；名称包含员工姓名 → 名称相似 */
export const VENDORS = [['V-1', '丙公司', '6222000011112222'], ['V-2', '张三商贸', '6222 9999 0000 1111']];
export const EMPLOYEES_HEAD = ['员工编号', '姓名', '银行账号'];
export const EMPLOYEES = [['E-1', '张三', '6222999900001111'], ['E-2', '李四', '6222888800002222']];

// ── B6 KYC（阿语资料） ──
export const KYC_LICENSE = 'شهادة السجل التجاري\nالاسم: شركة الخليج للتجارة المحدودة\nبلد التأسيس: المملكة العربية السعودية\nتاريخ التأسيس: 2015-03-12\nالعنوان: الرياض، طريق الملك فهد 12';
export const KYC_UBO = 'إقرار المستفيد الحقيقي\nالمالك المستفيد: محمد أحمد العلي، الجنسية: سعودي، نسبة الملكية 100%';
export const KYC_ADDRESS = 'فاتورة كهرباء\nالتاريخ: 2026-09-01\nالعنوان: الرياض، طريق الملك فهد 12';
export const WATCH_HEAD = ['Name', 'Aliases', 'List'];
/** 名单条目与受益所有人同名（阿语写法带音符、英文别名）→ 强命中制裁名单 → 建议拒绝 */
export const WATCHLIST = [['Mohammed Ahmad Al-Ali', 'مُحمّد أحمد العلي; Mohamed A. Alali', 'UN Sanctions List'], ['John Smith', '', 'PEP']];

/**
 * 舞弊排查用的序时账：300 张费用凭证首位数 1–9 均匀（本福特不符合）；V-SAT 周六记账；V-END 9-30 手工 8 万（期末大额手工）；
 * 3 笔 2 万整数咨询费；1 笔 6 万库存现金（大额现金）。都在工作日，除 V-SAT 外。
 */
export function fraudJournal(): (string | number)[][] {
  const rows: (string | number)[][] = [];
  const workday = (k: number) => {
    const days = ['01', '02', '03', '04', '07', '08', '09', '10', '11', '14', '15', '16', '17', '18', '21', '22', '23', '24', '25', '28'];
    return `2026-09-${days[k % days.length]}`;
  };
  for (let k = 0; k < 300; k += 1) {
    const amt = ((k % 9) + 1) * 1000 + (k % 97) + 0.5;
    const v = `V-${String(k + 1).padStart(4, '0')}`;
    rows.push([workday(k), v, '6602', '管理费用', '日常费用', amt, '', '系统'], [workday(k), v, '1002', '银行存款', '日常费用', '', amt, '系统']);
  }
  rows.push(['2026-09-05', 'V-SAT', '6602', '管理费用', '周末报销', 2000, '', '系统'], ['2026-09-05', 'V-SAT', '1002', '银行存款', '周末报销', '', 2000, '系统']);
  rows.push(['2026-09-30', 'V-END', '1122', '应收账款', '期末调整', 80000, '', '手工'], ['2026-09-30', 'V-END', '6001', '主营业务收入', '期末调整', '', 80000, '手工']);
  for (const i of [1, 2, 3]) rows.push([`2026-09-1${i + 3}`, `V-R${i}`, '6602', '咨询费', '咨询服务', 20000, '', '系统'], [`2026-09-1${i + 3}`, `V-R${i}`, '1002', '银行存款', '咨询服务', '', 20000, '系统']);
  rows.push(['2026-09-16', 'V-CASH', '1001', '库存现金', '提现', 60000, '', '系统'], ['2026-09-16', 'V-CASH', '1002', '银行存款', '提现', '', 60000, '系统']);
  return rows;
}
export const FRAUD_JOURNAL_HEAD = ['记账日期', '凭证号', '科目编码', '科目名称', '摘要', '借方金额', '贷方金额', '凭证来源'];
