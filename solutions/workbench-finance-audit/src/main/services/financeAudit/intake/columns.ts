/**
 * 列识别（第 7.1 节）：本方案的三语关键字（columnKeywords.json）在前，序时账 / 余额表认不到的角色
 * 回落到财务智能体的 columnKeywords.json（只读复用）。
 *
 * 两轮匹配：先所有角色按关键字**精确**匹配，再对没认到的角色做包含匹配
 * （避免「日期」先把「业务日期」抢走）。ASCII 短关键字（≤ 2 个字母，如 Dr / Cr）只做精确匹配。
 */
import { i18nKey } from '@totalclaw/i18n';
import type { FauInputKind } from '@totalclaw/ipc-contracts';
import OURS from './columnKeywords.json';
import SUB from './subledgerKeywords.json';
import FA_KW from '../../financeAgent/columnKeywords.json';
import FPA_KW from './fpaColumnKeywords.json';
import { FPA_KIND_ROLES } from './fpa';

import TAX_KW from './taxColumnKeywords.json';
import { TAX_KIND_ROLES } from './tax';

// 批次 4：税务组的角色关键字另放一份（角色名不与这里重名）
import { SUBLEDGER_ANY_OF, SUBLEDGER_ROLES } from './subledgerRoles';
// 批次 6：资金与金融风险（关键字在 treasuryKeywords.json）
import { TREASURY_KEYWORDS, TREASURY_ROLES } from './treasury';

const KW = { ...FPA_KW, ...SUB, ...OURS, ...TAX_KW, ...TREASURY_KEYWORDS } as unknown as Record<string, string[]>;
const FA = FA_KW as unknown as Record<string, string[]>;
/** 本方案角色 → 财务智能体同义角色 */
const FA_ALIAS: Record<string, string> = {
  periodDebit: 'debit', periodCredit: 'credit', bankSummary: 'summary', bankCounterparty: 'counterparty', localAmount: 'amount', docNo: 'ref',
};

export interface RoleDef { key: string; label: string; required?: boolean }

export const KIND_ROLES: Partial<Record<FauInputKind, RoleDef[]>> = {
  journal: [
    { key: 'date', label: i18nKey('记账日期'), required: true },
    { key: 'businessDate', label: i18nKey('业务 / 发票日期') },
    { key: 'voucherNo', label: i18nKey('凭证号') },
    { key: 'lineNo', label: i18nKey('分录序号') },
    { key: 'accountCode', label: i18nKey('科目编码') },
    { key: 'accountName', label: i18nKey('科目名称'), required: true },
    { key: 'summary', label: i18nKey('摘要') },
    { key: 'debit', label: i18nKey('借方金额'), required: true },
    { key: 'credit', label: i18nKey('贷方金额'), required: true },
    { key: 'currency', label: i18nKey('币种') },
    { key: 'fxAmount', label: i18nKey('原币金额') },
    { key: 'counterparty', label: i18nKey('往来单位') },
    { key: 'dept', label: i18nKey('部门') },
    { key: 'project', label: i18nKey('项目') },
    { key: 'source', label: i18nKey('凭证来源') },
  ],
  tb: [
    { key: 'accountCode', label: i18nKey('科目编码') },
    { key: 'accountName', label: i18nKey('科目名称'), required: true },
    { key: 'level', label: i18nKey('级次') },
    { key: 'openingDebit', label: i18nKey('期初借方') },
    { key: 'openingCredit', label: i18nKey('期初贷方') },
    { key: 'periodDebit', label: i18nKey('本期借方') },
    { key: 'periodCredit', label: i18nKey('本期贷方') },
    { key: 'closingDebit', label: i18nKey('期末借方'), required: true },
    { key: 'closingCredit', label: i18nKey('期末贷方'), required: true },
  ],
  bank: [
    { key: 'bankAccount', label: i18nKey('银行账号') },
    { key: 'date', label: i18nKey('交易日期'), required: true },
    { key: 'valueDate', label: i18nKey('起息日') },
    { key: 'ref', label: i18nKey('流水号 / 参考号') },
    { key: 'bankCounterparty', label: i18nKey('对方户名') },
    { key: 'amountIn', label: i18nKey('收入金额') },
    { key: 'amountOut', label: i18nKey('支出金额') },
    { key: 'amount', label: i18nKey('交易金额（单列）') },
    { key: 'direction', label: i18nKey('收支方向') },
    { key: 'balance', label: i18nKey('余额') },
    { key: 'bankSummary', label: i18nKey('摘要 / 用途') },
  ],
  subledger: [
    { key: 'key', label: i18nKey('对账键'), required: true },
    { key: 'localAmount', label: i18nKey('本位币金额'), required: true },
    { key: 'date', label: i18nKey('日期') },
    { key: 'quantity', label: i18nKey('数量') },
    { key: 'fxAmount', label: i18nKey('原币金额') },
    { key: 'currency', label: i18nKey('币种') },
    { key: 'docNo', label: i18nKey('单据号') },
    { key: 'summary', label: i18nKey('摘要') },
  ],
  budget: [
    { key: 'accountCode', label: i18nKey('科目编码') },
    { key: 'accountName', label: i18nKey('科目名称'), required: true },
    { key: 'period', label: i18nKey('期间') },
    { key: 'budgetAmount', label: i18nKey('预算金额'), required: true },
  ],
  accrual_policy: [
    { key: 'policyId', label: i18nKey('政策编号') },
    { key: 'policyDesc', label: i18nKey('计提项目'), required: true },
    { key: 'expenseAccount', label: i18nKey('费用科目'), required: true },
    { key: 'expenseAccountName', label: i18nKey('费用科目名称') },
    { key: 'liabilityAccount', label: i18nKey('负债科目'), required: true },
    { key: 'liabilityAccountName', label: i18nKey('负债科目名称') },
    { key: 'basis', label: i18nKey('计算方式'), required: true },
    { key: 'policyAmount', label: i18nKey('金额') },
    { key: 'startPeriod', label: i18nKey('起始期间') },
    { key: 'endPeriod', label: i18nKey('结束期间') },
    { key: 'rate', label: i18nKey('费率') },
    { key: 'baseAccount', label: i18nKey('基数科目') },
    { key: 'keywords', label: i18nKey('已入账关键词') },
    { key: 'autoReverse', label: i18nKey('自动冲回') },
  ],
  fx_rates: [
    { key: 'currency', label: i18nKey('币种'), required: true },
    { key: 'rate', label: i18nKey('汇率'), required: true },
    { key: 'date', label: i18nKey('日期') },
  ],
  ...FPA_KIND_ROLES,
  ...TAX_KIND_ROLES,
  // 批次 2：A3–A8 子账类型
  ...SUBLEDGER_ROLES,
  // 批次 6：资金与金融风险
  ...TREASURY_ROLES,
};

const norm = (s: string) => String(s || '').replace(/\s+/g, '').toLowerCase();
const shortAscii = (s: string) => /^[A-Za-z/]{1,2}$/.test(s);

function keywordsOf(role: string): string[] {
  const own = KW[role] || [];
  const fa = FA[FA_ALIAS[role] || role] || [];
  return [...own, ...fa.filter((k) => !own.includes(k))];
}

/** 按角色识别列：返回 角色 → 表头（认不到为 ''） */
export function detectRoles(headers: string[], roles: string[]): Record<string, string> {
  const used = new Set<string>();
  const out: Record<string, string> = Object.fromEntries(roles.map((r) => [r, '']));
  for (const role of roles) {
    for (const kw of keywordsOf(role)) {
      const hit = headers.find((h) => !used.has(h) && norm(h) === norm(kw));
      if (hit) { out[role] = hit; used.add(hit); break; }
    }
  }
  for (const role of roles) {
    if (out[role]) continue;
    for (const kw of keywordsOf(role)) {
      if (shortAscii(kw)) continue;
      const hit = headers.find((h) => !used.has(h) && norm(h).includes(norm(kw)));
      if (hit) { out[role] = hit; used.add(hit); break; }
    }
  }
  return out;
}

export function rolesFor(kind: FauInputKind): RoleDef[] {
  return KIND_ROLES[kind] || [];
}

/** 缺失的必需角色（bank：收入 / 支出两列或单列金额至少有一种） */
export function missingRoles(kind: FauInputKind, mapping: Record<string, string>): string[] {
  const miss = rolesFor(kind).filter((r) => r.required && !mapping[r.key]).map((r) => r.key);
  if (kind === 'bank' && !mapping.amount && !(mapping.amountIn || mapping.amountOut)) miss.push('amount');
  for (const group of SUBLEDGER_ANY_OF[kind] || []) if (!group.some((k) => mapping[k])) miss.push(group[0]);
  return miss;
}
