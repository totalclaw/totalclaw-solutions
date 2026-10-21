/**
 * G6 投融资与估值（F1–F8）：每个模式的录入定义（第 ② 步「手工录入」表、上传表格的列、要不要上传资料），
 * 主进程（校验、引擎、产出）与渲染层（录入面板）共用。
 *
 * 金额按用户录入的单位存数值（模型单位，如「百万」），比例存小数（0.1 = 10%）。
 * def 是模板默认值：带进录入表但来源记为 default，产出里标 [未注明来源]，直到有人确认（改成手工录入）。
 */
import { i18nKey } from '@totalclaw/i18n';
import type { FauCapUnit } from '@totalclaw/ipc-contracts';

export interface CapOption { v: string; label: string }
export interface CapFieldSpec {
  key: string;
  label: string;
  unit: FauCapUnit;
  required?: boolean;
  def?: number | string;
  min?: number;
  max?: number;
  options?: CapOption[];
}
export interface CapTableSpec {
  id: string;
  label: string;
  help: string;
  columns: CapFieldSpec[];
  minRows: number;
}
export interface CapModeSpec {
  fields: CapFieldSpec[];
  tables: CapTableSpec[];
  /** 上传资料（年报、CIM、电话会全文、客户资料……）：none / optional / required */
  docs: 'none' | 'optional' | 'required';
  /** 有叙述（模型按技能起草，数字逐条回核） */
  narrative: boolean;
}

const F = (key: string, label: string, unit: FauCapUnit, o: Partial<CapFieldSpec> = {}): CapFieldSpec => ({ key, label, unit, ...o });
const req = { required: true };
const name = (label = i18nKey('名称')) => F('name', label, 'text', req);

// ── 公共字段 / 表 ──
const FACTS: CapTableSpec = {
  id: 'facts', label: i18nKey('已知事实与数据'), help: i18nKey('每行一条：指标或事实、数值、期间；来源可选手工录入或公开链接，上传表格时记文件与行号'),
  columns: [F('label', i18nKey('指标 / 事实'), 'text', req), F('value', i18nKey('数值'), 'text', req), F('period', i18nKey('期间'), 'text')], minRows: 0,
};
const UNITS = F('units', i18nKey('金额单位（如：百万）'), 'text');
const TAX = F('taxRate', i18nKey('所得税率'), 'pct', { def: 0.25, min: 0, max: 0.6 });
const RF = F('riskFree', i18nKey('无风险利率'), 'pct', { ...req, min: -0.05, max: 0.3 });
const BETA = F('beta', i18nKey('贝塔系数'), 'num', { ...req, min: -2, max: 5 });
const ERP = F('erp', i18nKey('市场风险溢价'), 'pct', { ...req, min: 0, max: 0.3 });
const KD = F('costDebt', i18nKey('税前债务成本'), 'pct', { ...req, min: 0, max: 0.4 });
const docMode = (tables: CapTableSpec[] = [FACTS], fields: CapFieldSpec[] = [], docs: CapModeSpec['docs'] = 'optional'): CapModeSpec => ({ fields, tables, docs, narrative: true });

const yes = (v: string, label: string): CapOption => ({ v, label });

export const CAP_SPECS: Record<string, Record<string, CapModeSpec>> = {
  // ═══ F1 估值建模 ═══
  valuation: {
    dcf: {
      docs: 'optional', narrative: true,
      fields: [
        UNITS, TAX, RF, BETA, ERP, F('sizePremium', i18nKey('规模 / 特定风险溢价'), 'pct', { def: 0, min: 0, max: 0.2 }), KD,
        F('debtWeight', i18nKey('目标负债占比 D/(D+E)'), 'pct', { ...req, min: 0, max: 0.95 }),
        F('terminalMethod', i18nKey('终值方法'), 'select', { ...req, def: 'gordon', options: [yes('gordon', i18nKey('永续增长')), yes('exit', i18nKey('退出倍数'))] }),
        F('terminalGrowth', i18nKey('永续增长率'), 'pct', { def: 0.025, min: -0.05, max: 0.1 }),
        F('exitMultiple', i18nKey('退出 EV/EBITDA 倍数'), 'x', { min: 0, max: 60 }),
        F('midYear', i18nKey('期中折现'), 'select', { def: 'yes', options: [yes('yes', i18nKey('是')), yes('no', i18nKey('否'))] }),
        F('netDebt', i18nKey('净债务'), 'money', req), F('shares', i18nKey('总股本（股数，与金额同单位口径）'), 'num', { min: 0 }),
      ],
      tables: [{
        id: 'forecast', label: i18nKey('预测期现金流'), help: i18nKey('每年一行：收入、息税前利润、折旧摊销、资本开支、营运资本增加'), minRows: 1,
        columns: [F('year', i18nKey('年度'), 'text', req), F('revenue', i18nKey('收入'), 'money', req), F('ebit', i18nKey('息税前利润 EBIT'), 'money', req), F('da', i18nKey('折旧摊销'), 'money', req), F('capex', i18nKey('资本开支'), 'money', req), F('nwcChange', i18nKey('营运资本增加'), 'money', req)],
      }],
    },
    lbo: {
      docs: 'optional', narrative: true,
      fields: [
        UNITS, TAX, F('entryEbitda', i18nKey('进入时 EBITDA'), 'money', req), F('entryMultiple', i18nKey('进入 EV/EBITDA 倍数'), 'x', { ...req, min: 0, max: 60 }),
        F('feesPct', i18nKey('交易费用（占企业价值）'), 'pct', { def: 0.02, min: 0, max: 0.2 }), F('minCash', i18nKey('最低现金'), 'money', { def: 0, min: 0 }),
        F('seniorX', i18nKey('优先债（EBITDA 倍数）'), 'x', { ...req, min: 0, max: 15 }), F('seniorRate', i18nKey('优先债利率'), 'pct', { ...req, min: 0, max: 0.4 }),
        F('seniorAmort', i18nKey('优先债每年强制还本（占初始本金）'), 'pct', { def: 0.05, min: 0, max: 1 }), F('sweepPct', i18nKey('超额现金扫款比例'), 'pct', { def: 1, min: 0, max: 1 }),
        F('subX', i18nKey('次级债（EBITDA 倍数）'), 'x', { def: 0, min: 0, max: 10 }), F('subRate', i18nKey('次级债利率'), 'pct', { def: 0, min: 0, max: 0.4 }),
        F('exitMultiple', i18nKey('退出 EV/EBITDA 倍数'), 'x', { ...req, min: 0, max: 60 }),
      ],
      tables: [{
        id: 'forecast', label: i18nKey('持有期预测'), help: i18nKey('每年一行：EBITDA、折旧摊销、资本开支、营运资本增加；最后一年为退出年'), minRows: 1,
        columns: [F('year', i18nKey('年度'), 'text', req), F('ebitda', 'EBITDA', 'money', req), F('da', i18nKey('折旧摊销'), 'money', req), F('capex', i18nKey('资本开支'), 'money', req), F('nwcChange', i18nKey('营运资本增加'), 'money', req)],
      }],
    },
    three_statement: {
      docs: 'optional', narrative: true,
      fields: [
        UNITS, F('years', i18nKey('预测年数'), 'int', { def: 5, min: 1, max: 10 }),
        F('revenue0', i18nKey('基期收入'), 'money', req), F('growth', i18nKey('收入增长率'), 'pct', { ...req, min: -0.5, max: 2 }),
        F('grossMargin', i18nKey('毛利率'), 'pct', { ...req, min: -1, max: 1 }), F('opexPct', i18nKey('期间费用率'), 'pct', { ...req, min: 0, max: 1 }),
        F('daPct', i18nKey('折旧率（占期初固定资产）'), 'pct', { ...req, min: 0, max: 1 }), F('capexPct', i18nKey('资本开支占收入'), 'pct', { ...req, min: 0, max: 1 }),
        F('dso', i18nKey('应收账款周转天数'), 'num', { ...req, min: 0, max: 720 }), F('dio', i18nKey('存货周转天数（按营业成本）'), 'num', { ...req, min: 0, max: 720 }),
        F('dpo', i18nKey('应付账款周转天数（按营业成本）'), 'num', { ...req, min: 0, max: 720 }), TAX,
        F('interestRate', i18nKey('借款利率'), 'pct', { def: 0.05, min: 0, max: 0.4 }), F('payout', i18nKey('分红比例'), 'pct', { def: 0, min: 0, max: 1 }),
        F('cash0', i18nKey('基期现金'), 'money', req), F('ppe0', i18nKey('基期固定资产净值'), 'money', req), F('debt0', i18nKey('基期借款'), 'money', req),
        F('ar0', i18nKey('基期应收账款'), 'money', req), F('inv0', i18nKey('基期存货'), 'money', req), F('ap0', i18nKey('基期应付账款'), 'money', req),
        F('debtRepay', i18nKey('每年偿还借款'), 'money', { def: 0, min: 0 }),
      ],
      tables: [],
    },
    comps: {
      docs: 'optional', narrative: true,
      fields: [
        UNITS, F('targetRevenue', i18nKey('目标公司收入'), 'money'), F('targetEbitda', i18nKey('目标公司 EBITDA'), 'money', req),
        F('targetNetIncome', i18nKey('目标公司净利润'), 'money'), F('targetNetDebt', i18nKey('目标公司净债务'), 'money', req), F('shares', i18nKey('总股本（股数，与金额同单位口径）'), 'num', { min: 0 }),
      ],
      tables: [{
        id: 'peers', label: i18nKey('可比公司'), help: i18nKey('每家一行：企业价值、市值、收入、EBITDA、净利润（同一币种与单位）'), minRows: 3,
        columns: [name(i18nKey('公司')), F('ev', i18nKey('企业价值'), 'money', req), F('marketCap', i18nKey('市值'), 'money'), F('revenue', i18nKey('收入'), 'money'), F('ebitda', 'EBITDA', 'money'), F('netIncome', i18nKey('净利润'), 'money')],
      }],
    },
    integration: {
      docs: 'none', narrative: true, fields: [UNITS],
      tables: [{
        id: 'methods', label: i18nKey('各方法估值区间'), help: i18nKey('每种方法一行：低值、高值与权重；权重合计应为 100%'), minRows: 2,
        columns: [F('method', i18nKey('方法'), 'text', req), F('low', i18nKey('低值'), 'money', req), F('high', i18nKey('高值'), 'money', req), F('weight', i18nKey('权重'), 'pct', req)],
      }],
    },
  },

  // ═══ F2 资本配置与项目投资 ═══
  capex: {
    npv_irr: {
      docs: 'optional', narrative: true,
      fields: [UNITS, F('discountRate', i18nKey('折现率（WACC）'), 'pct', { ...req, min: 0, max: 0.5 }), F('riskPremium', i18nKey('项目特定风险溢价'), 'pct', { def: 0.02, min: 0, max: 0.3 }), F('investment', i18nKey('初始投资（第 0 期）'), 'money', { ...req, min: 0 })],
      tables: [{ id: 'cashflows', label: i18nKey('各期净现金流'), help: i18nKey('第 1 期起每期一行；流出填负数'), minRows: 1, columns: [F('period', i18nKey('期次'), 'int', req), F('cashflow', i18nKey('净现金流'), 'money', req)] }],
    },
    real_options: {
      docs: 'optional', narrative: true,
      fields: [
        UNITS, F('optionType', i18nKey('期权类型'), 'select', { ...req, def: 'defer', options: [yes('defer', i18nKey('延迟期权')), yes('expand', i18nKey('扩张期权')), yes('abandon', i18nKey('放弃期权'))] }),
        F('pv', i18nKey('项目现金流现值'), 'money', { ...req, min: 0 }), F('cost', i18nKey('投资成本'), 'money', { ...req, min: 0 }),
        F('vol', i18nKey('项目价值波动率'), 'pct', { ...req, min: 0.01, max: 2 }), F('riskFree', i18nKey('无风险利率'), 'pct', { ...req, min: -0.05, max: 0.3 }),
        F('years', i18nKey('期权期限（年）'), 'years', { ...req, min: 0.1, max: 30 }), F('steps', i18nKey('二叉树步数'), 'int', { def: 50, min: 1, max: 500 }),
        F('expandFactor', i18nKey('扩张规模（占原项目价值）'), 'pct', { def: 0.3, min: 0, max: 5 }), F('expandCost', i18nKey('扩张追加投资'), 'money', { def: 0, min: 0 }),
        F('salvage', i18nKey('放弃时残值'), 'money', { def: 0, min: 0 }),
      ],
      tables: [],
    },
    wacc_roic: {
      docs: 'none', narrative: true,
      fields: [UNITS, RF, BETA, ERP, KD, TAX, F('equityValue', i18nKey('股权市值'), 'money', { ...req, min: 0 }), F('debtValue', i18nKey('债务市值'), 'money', { ...req, min: 0 }), F('ebit', i18nKey('息税前利润 EBIT'), 'money', req), F('investedCapital', i18nKey('投入资本'), 'money', { ...req, min: 0 })],
      tables: [{ id: 'units', label: i18nKey('业务单元（可选）'), help: i18nKey('按业务单元分别算 ROIC 与价值创造'), minRows: 0, columns: [name(i18nKey('业务单元')), F('ebit', i18nKey('息税前利润 EBIT'), 'money', req), F('investedCapital', i18nKey('投入资本'), 'money', req)] }],
    },
    scenario: {
      docs: 'none', narrative: true, fields: [UNITS],
      tables: [{ id: 'scenarios', label: i18nKey('情景'), help: i18nKey('每个情景一行：概率与该情景下的净现值；概率合计应为 100%'), minRows: 2, columns: [name(i18nKey('情景')), F('probability', i18nKey('概率'), 'pct', req), F('npv', i18nKey('净现值'), 'money', req)] }],
    },
  },

  // ═══ F3 并购与财务尽调 ═══
  ma: {
    dd_checklist: {
      docs: 'none', narrative: false,
      fields: [
        F('industry', i18nKey('行业'), 'select', { ...req, def: 'general', options: [yes('general', i18nKey('通用')), yes('saas', i18nKey('软件与订阅')), yes('manufacturing', i18nKey('制造业')), yes('consumer', i18nKey('消费与零售')), yes('financial', i18nKey('金融服务')), yes('healthcare', i18nKey('医疗健康'))] }),
        F('dealType', i18nKey('交易类型'), 'select', { ...req, def: 'buyout', options: [yes('buyout', i18nKey('控股收购')), yes('minority', i18nKey('少数股权投资')), yes('carve_out', i18nKey('业务剥离')), yes('merger', i18nKey('合并'))] }),
      ],
      tables: [{ id: 'status', label: i18nKey('清单进度（可选）'), help: i18nKey('按清单编号填状态：已收到 / 待补 / 有问题；不填视为待补'), minRows: 0, columns: [F('item', i18nKey('清单编号'), 'text', req), F('status', i18nKey('状态'), 'select', { ...req, options: [yes('received', i18nKey('已收到')), yes('pending', i18nKey('待补')), yes('issue', i18nKey('有问题'))] }), F('note', i18nKey('备注'), 'text')] }],
    },
    financial_dd: {
      docs: 'optional', narrative: true,
      fields: [UNITS, F('reportedEbitda', i18nKey('报告 EBITDA'), 'money', req), F('pegNwc', i18nKey('目标营运资本（不填按平均值）'), 'money'), F('closingNwc', i18nKey('交割日营运资本'), 'money'), F('cash', i18nKey('现金'), 'money', req), F('debt', i18nKey('有息负债'), 'money', req)],
      tables: [
        { id: 'qoe', label: i18nKey('盈利质量调整'), help: i18nKey('每项调整一行：增加 EBITDA 填正数、减少填负数'), minRows: 0, columns: [F('item', i18nKey('调整项'), 'text', req), F('amount', i18nKey('金额'), 'money', req), F('category', i18nKey('类别'), 'select', { def: 'nonrecurring', options: [yes('nonrecurring', i18nKey('非经常性')), yes('owner', i18nKey('股东相关')), yes('pro_forma', i18nKey('备考')), yes('accounting', i18nKey('会计口径')), yes('other', i18nKey('其他'))] })] },
        { id: 'nwc', label: i18nKey('月度营运资本'), help: i18nKey('最近 12 个月每月一行'), minRows: 0, columns: [F('period', i18nKey('期间'), 'text', req), F('nwc', i18nKey('营运资本'), 'money', req)] },
        { id: 'debtLike', label: i18nKey('类债务项目'), help: i18nKey('未付奖金、递延收入、未决诉讼、欠缴税款等'), minRows: 0, columns: [F('item', i18nKey('项目'), 'text', req), F('amount', i18nKey('金额'), 'money', req)] },
      ],
    },
    dd_prep: docMode([FACTS], [F('topic', i18nKey('访谈对象与议题'), 'text', req)]),
    integration: docMode([{ id: 'synergies', label: i18nKey('协同效应'), help: i18nKey('每项一行：类型、年化金额、第一年实现比例、一次性成本'), minRows: 0, columns: [F('item', i18nKey('协同项'), 'text', req), F('type', i18nKey('类型'), 'select', { def: 'cost', options: [yes('cost', i18nKey('成本协同')), yes('revenue', i18nKey('收入协同'))] }), F('runRate', i18nKey('年化金额'), 'money', req), F('phaseY1', i18nKey('第一年实现比例'), 'pct', { def: 0.5 }), F('oneOff', i18nKey('一次性成本'), 'money', { def: 0 })] }, FACTS], [UNITS]),
  },

  // ═══ F4 投行交易材料 ═══
  ib: {
    merger_model: {
      docs: 'optional', narrative: true,
      fields: [
        UNITS, F('acqNetIncome', i18nKey('收购方净利润'), 'money', req), F('acqShares', i18nKey('收购方股数'), 'num', { ...req, min: 0 }), F('acqPrice', i18nKey('收购方股价'), 'money', { ...req, min: 0 }),
        F('tgtNetIncome', i18nKey('目标方净利润'), 'money', req), F('purchasePrice', i18nKey('收购对价（股权价值）'), 'money', { ...req, min: 0 }),
        F('pctStock', i18nKey('股票支付比例'), 'pct', { ...req, min: 0, max: 1 }), F('pctCash', i18nKey('现金支付比例'), 'pct', { ...req, min: 0, max: 1 }), F('pctDebt', i18nKey('新增借款支付比例'), 'pct', { ...req, min: 0, max: 1 }),
        F('costDebt', i18nKey('新增借款利率（税前）'), 'pct', { def: 0.06, min: 0, max: 0.4 }), F('cashYield', i18nKey('现金机会收益率（税前）'), 'pct', { def: 0.02, min: 0, max: 0.3 }), TAX,
        F('synergies', i18nKey('税前协同效应'), 'money', { def: 0 }), F('tgtNetAssets', i18nKey('目标方可辨认净资产公允价值'), 'money', req), F('intangibles', i18nKey('新确认无形资产'), 'money', { def: 0, min: 0 }),
      ],
      tables: [],
    },
    buyer_list: docMode([{ id: 'buyers', label: i18nKey('潜在买方'), help: i18nKey('每家一行：类型与三项 1–5 分（战略匹配、支付能力、可能性）'), minRows: 1, columns: [name(i18nKey('买方')), F('type', i18nKey('类型'), 'select', { ...req, options: [yes('strategic', i18nKey('战略买方')), yes('financial', i18nKey('财务买方'))] }), F('fit', i18nKey('战略匹配'), 'num', { ...req, min: 1, max: 5 }), F('capacity', i18nKey('支付能力'), 'num', { ...req, min: 1, max: 5 }), F('likelihood', i18nKey('可能性'), 'num', { ...req, min: 1, max: 5 }), F('note', i18nKey('备注'), 'text')] }], [], 'none'),
    deal_tracker: {
      docs: 'none', narrative: false, fields: [F('asOf', i18nKey('统计日'), 'date')],
      tables: [{ id: 'milestones', label: i18nKey('里程碑'), help: i18nKey('每个里程碑一行：项目、截止日、状态、负责人'), minRows: 1, columns: [F('deal', i18nKey('项目'), 'text', req), F('milestone', i18nKey('里程碑'), 'text', req), F('due', i18nKey('截止日'), 'date', req), F('status', i18nKey('状态'), 'select', { ...req, options: [yes('todo', i18nKey('未开始')), yes('doing', i18nKey('进行中')), yes('done', i18nKey('已完成'))] }), F('owner', i18nKey('负责人'), 'text')] }],
    },
    cim: docMode(),
    teaser: docMode(),
    one_pager: docMode(),
    process_letter: docMode([FACTS], [F('codename', i18nKey('项目代号'), 'text', req), F('bidDeadline', i18nKey('出价截止日'), 'date', req), F('rules', i18nKey('资料室与沟通规则'), 'text')], 'none'),
    datapack: docMode([], [UNITS], 'required'),
    pitch: docMode([FACTS], [UNITS]),
  },

  // ═══ F5 私募股权与投后 ═══
  pe: {
    returns: {
      docs: 'optional', narrative: true,
      fields: [
        UNITS, F('entryEbitda', i18nKey('进入时 EBITDA'), 'money', req), F('entryMultiple', i18nKey('进入 EV/EBITDA 倍数'), 'x', { ...req, min: 0, max: 60 }), F('entryNetDebt', i18nKey('进入时净债务'), 'money', req),
        F('exitEbitda', i18nKey('退出时 EBITDA'), 'money', req), F('exitMultiple', i18nKey('退出 EV/EBITDA 倍数'), 'x', { ...req, min: 0, max: 60 }), F('exitNetDebt', i18nKey('退出时净债务'), 'money', req),
        F('holdYears', i18nKey('持有期（年）'), 'years', { ...req, min: 0.25, max: 20 }),
      ],
      tables: [{ id: 'cashflows', label: i18nKey('实际现金流（可选，按日期算 XIRR）'), help: i18nKey('投入填负数、分配与退出填正数；有这张表时 IRR 按日期计算'), minRows: 0, columns: [F('date', i18nKey('日期'), 'date', req), F('amount', i18nKey('金额'), 'money', req)] }],
    },
    unit_economics: {
      docs: 'optional', narrative: true,
      fields: [F('arpa', i18nKey('每客户月收入'), 'money', { ...req, min: 0 }), F('grossMargin', i18nKey('毛利率'), 'pct', { ...req, min: 0, max: 1 }), F('monthlyChurn', i18nKey('月流失率'), 'pct', { ...req, min: 0.0001, max: 1 }), F('cac', i18nKey('获客成本'), 'money', { ...req, min: 0 })],
      tables: [{ id: 'cohorts', label: i18nKey('客户队列（可选）'), help: i18nKey('每个队列一行：起始 ARR 与 12 个月后的 ARR'), minRows: 0, columns: [F('cohort', i18nKey('队列'), 'text', req), F('startArr', i18nKey('起始 ARR'), 'money', req), F('arr12', i18nKey('12 个月后 ARR'), 'money', req)] }],
    },
    waterfall: {
      docs: 'optional', narrative: true,
      fields: [UNITS, F('contributed', i18nKey('实缴出资'), 'money', { ...req, min: 0 }), F('proceeds', i18nKey('可分配金额'), 'money', { ...req, min: 0 }), F('prefRate', i18nKey('优先回报率'), 'pct', { def: 0.08, min: 0, max: 0.3 }), F('years', i18nKey('出资至分配年数'), 'years', { ...req, min: 0, max: 20 }), F('catchUp', i18nKey('GP 追补比例'), 'pct', { def: 1, min: 0, max: 1 }), F('carry', i18nKey('业绩报酬比例'), 'pct', { def: 0.2, min: 0, max: 0.5 })],
      tables: [{ id: 'holdings', label: i18nKey('估值复核（可选）'), help: i18nKey('每家组合公司一行：成本、GP 估值、复核估值；偏差超过 10% 标出'), minRows: 0, columns: [name(i18nKey('组合公司')), F('cost', i18nKey('投资成本'), 'money', req), F('gpMark', i18nKey('GP 估值'), 'money', req), F('reviewMark', i18nKey('复核估值'), 'money')] }],
    },
    portfolio: {
      docs: 'none', narrative: true, fields: [F('threshold', i18nKey('预警偏差'), 'pct', { def: 0.1, min: 0, max: 1 })],
      tables: [{ id: 'kpis', label: i18nKey('组合公司 KPI'), help: i18nKey('每家公司每个指标一行：实际与预算'), minRows: 1, columns: [F('company', i18nKey('公司'), 'text', req), F('metric', i18nKey('指标'), 'text', req), F('actual', i18nKey('实际'), 'num', req), F('budget', i18nKey('预算'), 'num', req)] }],
    },
    screening: docMode([{ id: 'criteria', label: i18nKey('投资标准'), help: i18nKey('每条标准一行：比较方式、门槛与标的实际值'), minRows: 1, columns: [F('criterion', i18nKey('标准'), 'text', req), F('op', i18nKey('比较'), 'select', { ...req, options: [yes('gte', '≥'), yes('lte', '≤')] }), F('threshold', i18nKey('门槛'), 'num', req), F('actual', i18nKey('实际值'), 'num', req)] }, FACTS]),
    ic_memo: docMode([FACTS], [UNITS]),
    value_creation: docMode([{ id: 'bridge', label: i18nKey('EBITDA 提升举措'), help: i18nKey('每项举措一行：对 EBITDA 的影响与预计年度'), minRows: 1, columns: [F('lever', i18nKey('举措'), 'text', req), F('impact', i18nKey('EBITDA 影响'), 'money', req), F('year', i18nKey('年度'), 'text')] }], [UNITS, F('baseEbitda', i18nKey('基期 EBITDA'), 'money', req)]),
    sourcing: docMode([{ id: 'targets', label: i18nKey('候选标的'), help: i18nKey('每家一行：行业、收入、增长率、EBITDA 利润率'), minRows: 1, columns: [name(i18nKey('标的')), F('sector', i18nKey('行业'), 'text'), F('revenue', i18nKey('收入'), 'money', req), F('growth', i18nKey('增长率'), 'pct', req), F('margin', i18nKey('EBITDA 利润率'), 'pct', req)] }], [UNITS, F('minRevenue', i18nKey('最低收入'), 'money', { def: 0 }), F('minGrowth', i18nKey('最低增长率'), 'pct', { def: 0 }), F('minMargin', i18nKey('最低 EBITDA 利润率'), 'pct', { def: 0 })], 'none'),
    ai_readiness: docMode([{ id: 'useCases', label: i18nKey('AI 机会'), help: i18nKey('每个机会一行：价值、可行性、数据就绪度各 1–5 分'), minRows: 1, columns: [name(i18nKey('机会')), F('value', i18nKey('价值'), 'num', { ...req, min: 1, max: 5 }), F('feasibility', i18nKey('可行性'), 'num', { ...req, min: 1, max: 5 }), F('data', i18nKey('数据就绪度'), 'num', { ...req, min: 1, max: 5 })] }], [], 'none'),
  },

  // ═══ F6 证券研究（仅供内部研究，非投资建议） ═══
  research: {
    initiate: docMode([FACTS], [UNITS], 'required'),
    earnings: docMode([{ id: 'actuals', label: i18nKey('实际与一致预期'), help: i18nKey('每个指标一行：实际值与一致预期（没有授权数据源时填上传或公开数据）'), minRows: 1, columns: [F('metric', i18nKey('指标'), 'text', req), F('actual', i18nKey('实际'), 'num', req), F('consensus', i18nKey('一致预期'), 'num', req)] }], [F('beatPct', i18nKey('超预期 / 不及预期判定线'), 'pct', { def: 0.02, min: 0, max: 0.5 })]),
    earnings_preview: docMode([{ id: 'estimates', label: i18nKey('预期对比'), help: i18nKey('每个指标一行：一致预期与我们的估计'), minRows: 1, columns: [F('metric', i18nKey('指标'), 'text', req), F('consensus', i18nKey('一致预期'), 'num', req), F('ours', i18nKey('我们的估计'), 'num', req)] }]),
    model_update: docMode([{ id: 'estimates', label: i18nKey('估计值变化'), help: i18nKey('每个指标每期一行：原估计与新估计'), minRows: 1, columns: [F('metric', i18nKey('指标'), 'text', req), F('period', i18nKey('期间'), 'text'), F('old', i18nKey('原估计'), 'num', req), F('new', i18nKey('新估计'), 'num', req)] }], [F('materialPct', i18nKey('重大变化判定线'), 'pct', { def: 0.05, min: 0, max: 1 })]),
    morning_note: docMode([FACTS], [], 'required'),
    catalysts: {
      docs: 'none', narrative: false, fields: [F('asOf', i18nKey('统计日'), 'date')],
      tables: [{ id: 'events', label: i18nKey('事件'), help: i18nKey('每个事件一行：日期、公司、事件、类型'), minRows: 1, columns: [F('date', i18nKey('日期'), 'date', req), F('company', i18nKey('公司'), 'text', req), F('event', i18nKey('事件'), 'text', req), F('type', i18nKey('类型'), 'select', { options: [yes('earnings', i18nKey('财报')), yes('conference', i18nKey('会议')), yes('regulatory', i18nKey('监管')), yes('product', i18nKey('产品')), yes('other', i18nKey('其他'))] })] }],
    },
    screen: docMode([{ id: 'universe', label: i18nKey('股票池'), help: i18nKey('每只股票一行：市盈率、收入增长、净资产收益率、净负债 / EBITDA'), minRows: 1, columns: [name(i18nKey('股票')), F('pe', i18nKey('市盈率'), 'x'), F('growth', i18nKey('收入增长率'), 'pct'), F('roe', i18nKey('净资产收益率'), 'pct'), F('leverage', i18nKey('净负债 / EBITDA'), 'x')] }], [F('maxPe', i18nKey('市盈率上限'), 'x'), F('minGrowth', i18nKey('最低收入增长率'), 'pct'), F('minRoe', i18nKey('最低净资产收益率'), 'pct'), F('maxLeverage', i18nKey('净负债 / EBITDA 上限'), 'x')], 'none'),
    sector: docMode([FACTS], [], 'required'),
    competitive: docMode([{ id: 'competitors', label: i18nKey('竞争者'), help: i18nKey('每家一行：收入（算份额与集中度）与定位'), minRows: 2, columns: [name(i18nKey('公司')), F('revenue', i18nKey('收入'), 'money', req), F('positioning', i18nKey('定位'), 'text')] }, FACTS], [UNITS]),
    thesis: {
      docs: 'none', narrative: false, fields: [],
      tables: [{ id: 'pillars', label: i18nKey('逻辑支柱'), help: i18nKey('每个支柱一行：证据与当前状态'), minRows: 1, columns: [F('pillar', i18nKey('逻辑支柱'), 'text', req), F('evidence', i18nKey('证据'), 'text'), F('status', i18nKey('状态'), 'select', { ...req, options: [yes('intact', i18nKey('成立')), yes('watch', i18nKey('观察')), yes('broken', i18nKey('失效'))] })] }],
    },
    tear_sheet: docMode([FACTS], [F('audience', i18nKey('受众'), 'select', { def: 'equity_research', options: [yes('equity_research', i18nKey('研究')), yes('ib_ma', i18nKey('投行并购')), yes('corp_dev', i18nKey('企业发展')), yes('sales_bd', i18nKey('销售与商务拓展'))] })]),
    funding_digest: docMode([{ id: 'rounds', label: i18nKey('融资事件'), help: i18nKey('每轮一行：公司、日期、金额、轮次、投资方'), minRows: 1, columns: [F('company', i18nKey('公司'), 'text', req), F('date', i18nKey('日期'), 'date'), F('amount', i18nKey('金额'), 'money', req), F('stage', i18nKey('轮次'), 'text', req), F('investors', i18nKey('投资方'), 'text')] }], [UNITS], 'none'),
  },

  // ═══ F7 固定收益与市场分析（LSEG 8 项：计算在代码里，数据靠上传） ═══
  markets: {
    bond_basis: {
      docs: 'none', narrative: false,
      fields: [F('futuresPrice', i18nKey('期货价格'), 'num', { ...req, min: 0 }), F('repoRate', i18nKey('回购利率'), 'pct', { ...req, min: -0.05, max: 0.3 }), F('days', i18nKey('距交割天数'), 'int', { ...req, min: 1, max: 400 })],
      tables: [{ id: 'basket', label: i18nKey('可交割券'), help: i18nKey('每只一行：净价、票面利率、转换因子、应计利息'), minRows: 1, columns: [F('bond', i18nKey('债券'), 'text', req), F('cleanPrice', i18nKey('净价'), 'num', req), F('coupon', i18nKey('票面利率'), 'pct', req), F('cf', i18nKey('转换因子'), 'num', req), F('accrued', i18nKey('应计利息'), 'num', { def: 0 })] }],
    },
    bond_rv: {
      docs: 'none', narrative: false, fields: [],
      tables: [
        { id: 'bonds', label: i18nKey('债券'), help: i18nKey('每只一行：剩余期限、到期收益率；有历史利差均值与标准差时算 Z 值'), minRows: 1, columns: [F('bond', i18nKey('债券'), 'text', req), F('maturity', i18nKey('剩余期限（年）'), 'years', req), F('yield', i18nKey('到期收益率'), 'pct', req), F('avgSpread', i18nKey('历史利差均值（基点）'), 'bp'), F('stdSpread', i18nKey('历史利差标准差（基点）'), 'bp')] },
        { id: 'curve', label: i18nKey('基准曲线'), help: i18nKey('每个期限一行：期限与收益率'), minRows: 2, columns: [F('tenor', i18nKey('期限（年）'), 'years', req), F('yield', i18nKey('收益率'), 'pct', req)] },
      ],
    },
    fi_portfolio: {
      docs: 'none', narrative: false, fields: [F('shockBp', i18nKey('平行冲击（基点）'), 'bp', { def: 100, min: 1, max: 1000 })],
      tables: [{ id: 'holdings', label: i18nKey('持仓'), help: i18nKey('每只一行：面值、票面利率、到期收益率、剩余期限、年付息次数'), minRows: 1, columns: [F('bond', i18nKey('债券'), 'text', req), F('face', i18nKey('面值'), 'money', req), F('coupon', i18nKey('票面利率'), 'pct', req), F('yield', i18nKey('到期收益率'), 'pct', req), F('maturity', i18nKey('剩余期限（年）'), 'years', req), F('freq', i18nKey('年付息次数'), 'int', { def: 1 })] }],
    },
    fx_carry: {
      docs: 'none', narrative: false, fields: [],
      tables: [{ id: 'pairs', label: i18nKey('货币对'), help: i18nKey('每个货币对一行：即期汇率、基础货币与计价货币利率、波动率、期限天数'), minRows: 1, columns: [F('pair', i18nKey('货币对'), 'text', req), F('spot', i18nKey('即期汇率'), 'num', req), F('baseRate', i18nKey('基础货币利率'), 'pct', req), F('quoteRate', i18nKey('计价货币利率'), 'pct', req), F('vol', i18nKey('年化波动率'), 'pct', req), F('days', i18nKey('期限天数'), 'int', { def: 90 })] }],
    },
    option_vol: {
      docs: 'none', narrative: false, fields: [],
      tables: [{ id: 'options', label: i18nKey('期权报价'), help: i18nKey('每个合约一行：类型、标的价、行权价、剩余期限、无风险利率、期权价格'), minRows: 1, columns: [F('label', i18nKey('合约'), 'text', req), F('type', i18nKey('类型'), 'select', { ...req, options: [yes('call', i18nKey('看涨')), yes('put', i18nKey('看跌'))] }), F('spot', i18nKey('标的价'), 'num', req), F('strike', i18nKey('行权价'), 'num', req), F('years', i18nKey('剩余期限（年）'), 'years', req), F('rate', i18nKey('无风险利率'), 'pct', req), F('price', i18nKey('期权价格'), 'num', req)] }],
    },
    swap_curve: {
      docs: 'none', narrative: false, fields: [],
      tables: [{ id: 'curve', label: i18nKey('互换曲线'), help: i18nKey('每个期限一行：当前利率；有一个月前的利率时算变动'), minRows: 3, columns: [F('tenor', i18nKey('期限（年）'), 'years', req), F('rate', i18nKey('利率'), 'pct', req), F('prior', i18nKey('一个月前利率'), 'pct')] }],
    },
    macro_rates: {
      docs: 'none', narrative: false, fields: [],
      tables: [{ id: 'series', label: i18nKey('序列观测值'), help: i18nKey('每个观测一行：序列名、日期、数值（公开来源可填央行公布的利率、汇率）'), minRows: 2, columns: [F('series', i18nKey('序列'), 'text', req), F('date', i18nKey('日期'), 'date', req), F('value', i18nKey('数值'), 'num', req)] }],
    },
    equity_snapshot: {
      docs: 'none', narrative: false, fields: [F('targetPrice', i18nKey('一致预期目标价'), 'num'), F('eps', i18nKey('一致预期每股收益'), 'num')],
      tables: [{ id: 'prices', label: i18nKey('收盘价'), help: i18nKey('每个交易日一行：日期与收盘价'), minRows: 2, columns: [F('date', i18nKey('日期'), 'date', req), F('close', i18nKey('收盘价'), 'num', req)] }],
    },
  },

  // ═══ F8 财富管理客户服务（只给顾问，不发客户；非投资建议） ═══
  wealth: {
    client_review: docMode([HOLDINGS(), RETURNS()], [UNITS]),
    client_report: docMode([HOLDINGS(), RETURNS()], [UNITS]),
    investment_proposal: docMode([{ id: 'allocation', label: i18nKey('配置方案'), help: i18nKey('每类资产一行：权重、预期收益率'), minRows: 1, columns: [F('assetClass', i18nKey('资产类别'), 'text', req), F('weight', i18nKey('权重'), 'pct', req), F('expReturn', i18nKey('预期收益率'), 'pct', req)] }, FACTS], [UNITS, F('riskProfile', i18nKey('风险偏好'), 'select', { ...req, def: 'balanced', options: [yes('conservative', i18nKey('稳健')), yes('balanced', i18nKey('平衡')), yes('growth', i18nKey('进取'))] }), F('amount', i18nKey('拟投资金额'), 'money', { ...req, min: 0 })]),
    meeting_prep: docMode([FACTS], [F('meeting', i18nKey('会议目的'), 'text', req)]),
  },
};

function HOLDINGS(): CapTableSpec {
  return { id: 'holdings', label: i18nKey('持仓'), help: i18nKey('每项资产一行：资产类别、市值、目标权重'), minRows: 1, columns: [F('asset', i18nKey('资产'), 'text', req), F('assetClass', i18nKey('资产类别'), 'text', req), F('value', i18nKey('市值'), 'money', req), F('target', i18nKey('目标权重'), 'pct')] };
}
function RETURNS(): CapTableSpec {
  return { id: 'returns', label: i18nKey('分期收益率'), help: i18nKey('每期一行：期间与组合收益率（时间加权）'), minRows: 0, columns: [F('period', i18nKey('期间'), 'text', req), F('ret', i18nKey('收益率'), 'pct', req)] };
}

export function capSpec(moduleId: string, modeId: string): CapModeSpec | null {
  return CAP_SPECS[moduleId]?.[modeId] || null;
}

/** 输入值来源 → 产出与界面上的来源标注（词典 key + 参数，展示端翻译） */
export function sourceTag(src: { kind: string; file?: string; row?: number; url?: string; name?: string } | undefined): { key: string; params?: Record<string, string | number> } {
  switch (src?.kind) {
    case 'manual': return { key: i18nKey('[手工录入]') };
    case 'upload': return src.row ? { key: i18nKey('[上传: {p0} 第 {n} 行]'), params: { p0: src.file || '', n: src.row } } : { key: i18nKey('[上传: {p0}]'), params: { p0: src.file || '' } };
    case 'public': return { key: i18nKey('[公开: {p0}]'), params: { p0: src.url || '' } };
    case 'connector': return { key: i18nKey('[连接器: {p0}]'), params: { p0: src.name || '' } };
    case 'handoff': return { key: i18nKey('[转交: {p0}]'), params: { p0: src.name || '' } };
    default: return { key: i18nKey('[未注明来源]') };
  }
}

/** 模板默认值的初始录入（来源记 default） */
export function initialInputs(moduleId: string, modeId: string): { fields: Record<string, { v: number | string | null; src: { kind: 'default' } }>; tables: Record<string, never[]> } {
  const spec = capSpec(moduleId, modeId);
  const fields: Record<string, { v: number | string | null; src: { kind: 'default' } }> = {};
  for (const f of spec?.fields || []) if (f.def !== undefined) fields[f.key] = { v: f.def, src: { kind: 'default' } };
  return { fields, tables: Object.fromEntries((spec?.tables || []).map((t) => [t.id, []])) };
}
