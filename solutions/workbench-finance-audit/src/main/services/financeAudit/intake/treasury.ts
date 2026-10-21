/**
 * 资金与金融风险（批次 6）数据集：列定义（角色、类型、必需）驱动的通用解析。
 *
 * 每类数据集一份列定义：key 是列识别的角色（关键字在 treasuryKeywords.json，date / currency 等复用 columnKeywords.json），
 * field 是行上的字段名；类型决定怎么转：金额转分、比率转小数（写 5% 或 0.05 都行，> 1 的按百分数）、日期转 ISO、
 * 是否列认「是 / Y / yes / نعم」、枚举按同义词归一（认不出的记问题项，带行号）。
 */
import { i18nKey } from '@totalclaw/i18n';
import type { FauIssue } from '@totalclaw/ipc-contracts';
import type { SheetTable } from '../../serviceSettlement/excel';
import { normalizeDigits } from '../verify';
import type { TreasuryKind, TreasuryRowsByKind } from '../engines/treasury/types';
import { TREASURY_KINDS } from '../engines/treasury/types';
import type { RoleDef } from './columns';
import { HEADER_OFFSET, get, issue, toCents, toIsoDate, toNum, toPeriod } from './common';
import KW from './treasuryKeywords.json';

type ColType = 'text' | 'upper' | 'cents' | 'cents?' | 'num?' | 'rate' | 'rate?' | 'date' | 'period' | 'bool' | 'bool?' | 'int' | 'int?' | 'priority' | `enum:${string}`;
interface ColSpec {
  key: string;
  field?: string;
  label: string;
  type: ColType;
  required?: boolean;
  /** 枚举没填 / 认不出时的取值；不给且必需 = 认不出记阻断项 */
  def?: string;
}

const C = (key: string, label: string, type: ColType, o: Partial<ColSpec> = {}): ColSpec => ({ key, label, type, ...o });

export const TREASURY_SPECS: Record<TreasuryKind, ColSpec[]> = {
  bank_balance: [
    C('bankAccount', i18nKey('银行账号'), 'text', { field: 'account', required: true }),
    C('bankName', i18nKey('开户银行'), 'text', { field: 'bank' }),
    C('legalEntity', i18nKey('主体'), 'text', { field: 'entity' }),
    C('currency', i18nKey('币种'), 'upper'),
    C('bankBalance', i18nKey('银行余额'), 'cents', { required: true }),
    C('bookBalance', i18nKey('账面余额'), 'cents?'),
    C('systemBalance', i18nKey('资金系统余额'), 'cents?'),
    C('restricted', i18nKey('受限金额'), 'cents'),
    C('safetyLine', i18nKey('安全线'), 'cents?'),
    C('depositRate', i18nKey('存款利率'), 'rate?'),
    C('date', i18nKey('余额日期'), 'date'),
  ],
  cash_plan: [
    C('date', i18nKey('日期'), 'date', { required: true }),
    C('flowCategory', i18nKey('类别'), 'text', { field: 'category' }),
    C('counterparty', i18nKey('往来单位'), 'text'),
    C('inflow', i18nKey('流入'), 'cents'),
    C('outflow', i18nKey('流出'), 'cents'),
    C('certainty', i18nKey('确定性'), 'enum:certainty', { def: 'expected' }),
  ],
  payment_request: [
    C('requestNo', i18nKey('申请单号'), 'text', { field: 'id' }),
    C('reqPayee', i18nKey('收款方'), 'text', { field: 'payee', required: true }),
    C('payAmount', i18nKey('付款金额'), 'cents', { field: 'amount', required: true }),
    C('payDueDate', i18nKey('到期日'), 'date', { field: 'dueDate' }),
    C('flowCategory', i18nKey('付款类别'), 'text', { field: 'category' }),
    C('priority', i18nKey('优先级'), 'priority'),
    C('payFrom', i18nKey('付款账户'), 'text'),
    C('beneficiaryAccount', i18nKey('收款账号'), 'text', { field: 'payeeAccount' }),
    C('accountChanged', i18nKey('收款账户变更'), 'bool'),
    C('personalAccount', i18nKey('个人账户'), 'bool'),
    C('newSupplier', i18nKey('新供应商'), 'bool'),
    C('contractAmount', i18nKey('合同金额'), 'cents?'),
    C('paidToDate', i18nKey('累计已付'), 'cents?'),
    C('invoiceAmount', i18nKey('发票金额'), 'cents?'),
    C('approvalLimit', i18nKey('审批权限'), 'cents?'),
  ],
  credit_facility: [
    C('bankName', i18nKey('银行'), 'text', { field: 'bank', required: true }),
    C('facilityLimit', i18nKey('授信额度'), 'cents', { field: 'limit', required: true }),
    C('facilityUsed', i18nKey('已用额度'), 'cents', { field: 'used' }),
    C('loanRate', i18nKey('利率'), 'rate?', { field: 'rate' }),
    C('expiryDate', i18nKey('授信到期日'), 'date', { field: 'expiry' }),
    C('scoreResponse', i18nKey('响应速度（1–10 分）'), 'num?', { field: 'response' }),
    C('scoreInnovation', i18nKey('产品创新（1–10 分）'), 'num?', { field: 'innovation' }),
    C('scoreCooperation', i18nKey('合作意愿（1–10 分）'), 'num?', { field: 'cooperation' }),
  ],
  liquidity_items: [
    C('itemName', i18nKey('项目'), 'text', { field: 'item', required: true }),
    C('liqCategory', i18nKey('类别'), 'enum:liqCategory', { field: 'category', required: true }),
    C('liqAmount', i18nKey('金额'), 'cents', { field: 'amount', required: true }),
    C('factor', i18nKey('折算率 / 流失率'), 'rate?'),
  ],
  fx_exposure: [
    C('currency', i18nKey('币种'), 'upper', { required: true }),
    C('fxKind', i18nKey('敞口类型'), 'enum:fxKind', { field: 'kind', required: true }),
    C('fcAmount', i18nKey('外币金额'), 'cents', { field: 'amount', required: true }),
    C('fxCertainty', i18nKey('确定性'), 'enum:fxCertainty', { field: 'certainty', def: 'firm' }),
    C('date', i18nKey('日期'), 'date'),
    C('legalEntity', i18nKey('主体'), 'text', { field: 'entity' }),
  ],
  loan: [
    C('loanId', i18nKey('合同编号'), 'text', { field: 'id' }),
    C('lender', i18nKey('贷款人'), 'text', { required: true }),
    C('instrument', i18nKey('融资类型'), 'enum:instrument', { def: 'loan' }),
    C('principal', i18nKey('本金余额'), 'cents', { required: true }),
    C('loanRate', i18nKey('利率'), 'rate?', { field: 'rate' }),
    C('loanFeeRate', i18nKey('费率'), 'rate?', { field: 'feeRate' }),
    C('loanStartDate', i18nKey('起始日'), 'date', { field: 'startDate' }),
    C('maturityDate', i18nKey('到期日'), 'date', { required: true }),
    C('repayment', i18nKey('还款方式'), 'enum:repayment', { def: 'bullet' }),
    C('secured', i18nKey('担保 / 抵押'), 'bool'),
    C('currency', i18nKey('币种'), 'upper'),
  ],
  covenant: [
    C('lender', i18nKey('贷款人'), 'text'),
    C('covenantName', i18nKey('条款'), 'text', { field: 'name' }),
    C('metric', i18nKey('指标'), 'enum:metric', { required: true }),
    C('operator', i18nKey('比较方向'), 'enum:operator', { field: 'op', def: '' }),
    C('limitValue', i18nKey('限值'), 'num?', { field: 'limit', required: true }),
  ],
  fin_metrics: [
    C('period', i18nKey('期间'), 'period', { required: true }),
    C('isForecast', i18nKey('是否预测'), 'bool', { field: 'forecast' }),
    C('revenue', i18nKey('营业收入'), 'cents?'),
    C('cogs', i18nKey('营业成本'), 'cents?'),
    C('ebitda', 'EBITDA', 'cents?'),
    C('interestExpense', i18nKey('利息支出'), 'cents?', { field: 'interest' }),
    C('totalDebt', i18nKey('有息负债'), 'cents?', { field: 'debt' }),
    C('cashBalance', i18nKey('货币资金'), 'cents?', { field: 'cash' }),
    C('currentAssets', i18nKey('流动资产'), 'cents?'),
    C('currentLiabilities', i18nKey('流动负债'), 'cents?'),
    C('inventoryBalance', i18nKey('存货'), 'cents?', { field: 'inventory' }),
    C('totalAssets', i18nKey('资产总计'), 'cents?'),
    C('totalLiabilities', i18nKey('负债合计'), 'cents?'),
    C('netWorth', i18nKey('所有者权益'), 'cents?'),
    C('debtService', i18nKey('还本付息'), 'cents?'),
    C('equityValue', i18nKey('股权市值'), 'cents?'),
    C('periodDays', i18nKey('期间天数'), 'int?', { field: 'days' }),
  ],
  credit_exposure: [
    C('exposureId', i18nKey('敞口编号'), 'text', { field: 'id' }),
    C('counterparty', i18nKey('交易对手'), 'text', { required: true }),
    C('segment', i18nKey('产品类型'), 'text'),
    C('grossBalance', i18nKey('账面余额'), 'cents', { field: 'balance', required: true }),
    C('undrawn', i18nKey('未提用额度'), 'cents'),
    C('ccf', i18nKey('信用转换系数'), 'rate?'),
    C('ratingOrig', i18nKey('初始评级'), 'upper'),
    C('ratingNow', i18nKey('当前评级'), 'upper'),
    C('dpd', i18nKey('逾期天数'), 'int'),
    C('watchlist', i18nKey('关注名单'), 'bool'),
    C('impaired', i18nKey('已发生信用减值'), 'bool'),
    C('pd12m', i18nKey('12 个月 PD'), 'rate?'),
    C('pdLifetime', i18nKey('存续期 PD'), 'rate?'),
    C('lgd', 'LGD', 'rate?'),
    C('eir', i18nKey('实际利率'), 'rate?'),
    C('termYears', i18nKey('剩余期限（年）'), 'num?'),
    C('priorStage', i18nKey('上期阶段'), 'int?'),
  ],
  macro_scenario: [
    C('scenario', i18nKey('情景'), 'enum:scenario', { required: true }),
    C('weight', i18nKey('权重'), 'rate', { required: true }),
    C('pdMultiplier', i18nKey('PD 调整系数'), 'num?', { required: true }),
  ],
  loss_rates: [
    C('agingBucket', i18nKey('账龄区间'), 'enum:agingBucket', { field: 'bucket', required: true }),
    C('lossRate', i18nKey('损失率'), 'rate', { field: 'rate', required: true }),
  ],
  inventory: [
    C('sku', i18nKey('物料编码'), 'text', { required: true }),
    C('skuName', i18nKey('物料名称'), 'text', { field: 'name' }),
    C('quantity', i18nKey('数量'), 'num?', { field: 'qty' }),
    C('stockValue', i18nKey('库存金额'), 'cents', { field: 'amount', required: true }),
    C('annualUsage', i18nKey('年耗用金额'), 'cents?', { field: 'usage' }),
    C('lastMoveDate', i18nKey('最后出入库日期'), 'date'),
  ],
  investment: [
    C('investId', i18nKey('产品代码'), 'text', { field: 'id' }),
    C('investProduct', i18nKey('产品名称'), 'text', { field: 'product', required: true }),
    C('investType', i18nKey('投资类型'), 'enum:investType', { field: 'type', def: 'other' }),
    C('issuer', i18nKey('发行人 / 管理人'), 'text'),
    C('costAmount', i18nKey('投资成本'), 'cents', { field: 'cost', required: true }),
    C('marketValue', i18nKey('市值'), 'cents', { required: true }),
    C('riskRating', i18nKey('风险等级（R1–R5）'), 'int?'),
    C('maturityDate', i18nKey('到期日'), 'date'),
    C('onApprovedList', i18nKey('在批准投资清单内'), 'bool?', { field: 'approved' }),
    C('yieldRate', i18nKey('收益率'), 'rate?', { field: 'yield' }),
    C('liquidityDays', i18nKey('变现天数'), 'int?'),
  ],
};

export function isTreasuryKind(k: string): k is TreasuryKind {
  return (TREASURY_KINDS as string[]).includes(k);
}

/** 列识别角色（给 columns.ts::KIND_ROLES） */
export const TREASURY_ROLES: Record<TreasuryKind, RoleDef[]> = Object.fromEntries(
  Object.entries(TREASURY_SPECS).map(([k, cols]) => [k, cols.map((c) => ({ key: c.key, label: c.label, required: c.required }))]),
) as Record<TreasuryKind, RoleDef[]>;

/** 表头关键字（给 columns.ts 合并；_enum 是枚举同义词，不是角色） */
export const TREASURY_KEYWORDS: Record<string, string[]> = Object.fromEntries(
  Object.entries(KW as Record<string, unknown>).filter(([k, v]) => !k.startsWith('_') && Array.isArray(v)),
) as Record<string, string[]>;

const ENUMS = (KW as unknown as { _enum: Record<string, Record<string, string[]> | string[]> })._enum;
const YES = (ENUMS.yes as string[]).map((w) => w.toLowerCase());

/** 枚举同义词归一：先全等，再包含；认不出返回 null */
export function normEnum(name: string, raw: string): string | null {
  const s = String(raw || '').trim().toLowerCase().replace(/\s+/g, ' ');
  if (!s) return null;
  const table = ENUMS[name] as Record<string, string[]> | undefined;
  if (!table) return null;
  if (Object.prototype.hasOwnProperty.call(table, s)) return s;
  for (const [id, words] of Object.entries(table)) if (words.some((w) => w.toLowerCase() === s)) return id;
  for (const [id, words] of Object.entries(table)) if (words.some((w) => s.includes(w.toLowerCase()))) return id;
  return null;
}

function rate(raw: string): number | null {
  const n = toNum(raw);
  if (n == null) return null;
  // 写 5% 或 5 → 0.05；写 0.05 → 0.05
  return /%|٪/.test(raw) || Math.abs(n) > 1 ? n / 100 : n;
}

function int(raw: string): number | null {
  const m = normalizeDigits(raw).match(/-?\d+/);
  return m ? Number(m[0]) : null;
}

const empty = (s: string) => !String(s || '').trim();

export function parseTreasuryTable<K extends TreasuryKind>(kind: K, t: SheetTable, mp: Record<string, string>): { rows: TreasuryRowsByKind[K]; issues: FauIssue[] } {
  const cols = TREASURY_SPECS[kind];
  const rows: Record<string, unknown>[] = [];
  const skipped: number[] = [];
  const badEnum = new Map<string, { label: string; rows: number[]; block: boolean }>();
  t.rows.forEach((r, i) => {
    const row = i + HEADER_OFFSET;
    const raw = Object.fromEntries(cols.map((c) => [c.key, get(r, mp, c.key)]));
    if (cols.filter((c) => c.required).some((c) => empty(raw[c.key]))) {
      if (Object.values(r).some((v) => String(v).trim())) skipped.push(row);
      return;
    }
    const out: Record<string, unknown> = { row };
    for (const c of cols) {
      const v = raw[c.key];
      let val: unknown;
      switch (c.type) {
        case 'text': val = String(v || '').trim(); break;
        case 'upper': val = String(v || '').trim().toUpperCase(); break;
        case 'cents': val = toCents(v); break;
        case 'cents?': val = empty(v) ? null : toCents(v); break;
        case 'num?': val = empty(v) ? null : toNum(v); break;
        case 'rate': val = rate(v) ?? 0; break;
        case 'rate?': val = rate(v); break;
        case 'date': val = toIsoDate(v); break;
        case 'period': val = toPeriod(v) || String(v || '').trim(); break;
        case 'bool': val = YES.includes(String(v || '').trim().toLowerCase()); break;
        case 'bool?': val = empty(v) ? null : YES.includes(String(v || '').trim().toLowerCase()); break;
        case 'int': val = int(v) ?? 0; break;
        case 'int?': val = int(v); break;
        case 'priority': { const m = String(v || '').toUpperCase().match(/P[0-4]/); val = m ? m[0] : ''; break; }
        default: {
          const name = c.type.slice(5);
          const id = normEnum(name, v);
          if (id) { val = id; break; }
          if (!empty(v) || c.required) {
            const k = c.field || c.key;
            // 提示里写用户表里的表头（用户数据，不翻译），不写词典 key
            const e = badEnum.get(k) || { label: mp[c.key] || c.key, rows: [], block: !!c.required && c.def === undefined };
            e.rows.push(row);
            badEnum.set(k, e);
          }
          val = c.def ?? '';
        }
      }
      out[c.field || c.key] = val;
    }
    if (kind === 'cash_plan' && !out.inflow && !out.outflow) { skipped.push(row); return; }
    rows.push(out);
  });
  const issues: FauIssue[] = [];
  if (skipped.length) issues.push(issue('warn', 'rows_skipped', i18nKey('{n} 行缺必需的值，已跳过'), { n: skipped.length }, skipped));
  for (const [field, e] of badEnum) {
    issues.push(issue(e.block ? 'block' : 'warn', `bad_enum_${field}`, e.block ? i18nKey('{n} 行「{p0}」认不出，请按说明填写') : i18nKey('{n} 行「{p0}」认不出，已按默认值处理'), { n: e.rows.length, p0: e.label }, e.rows));
  }
  return { rows: rows as unknown as TreasuryRowsByKind[K], issues };
}
