/**
 * 申报上报（纯函数）：申报草稿 → 待报事项、申报期限、电子税务局地址、核对清单。
 *
 * 电子税务局没有给企业开放申报接口（税企直连要税务机关专门授权），登录要本人扫码 / CA，
 * 所以上报的做法是：人登录 → 数字员工在内置浏览器按草稿代填 → 停在「提交」前，人核对后自己点提交
 * → 回来登记回执与缴款。本文件只算「报什么、什么时候报、报多少」。
 */
import { t as i18nT } from '@totalclaw/i18n';
import type {
  FaDeadline, FaFiling, FaFilingItem, FaFilingTax, FaLedger, FaStatementRun, FaTaxPortal, FaTaxRun,
} from '@totalclaw/ipc-contracts';
import { daysBetween, localDate, pad2 } from './common';
import { periodRange } from './tax';

export function taxLabel(tax: FaFilingTax | 'cit_annual'): string {
  return {
    vat: i18nT('增值税'), surcharge: i18nT('附加税费'), cit: i18nT('企业所得税（预缴）'), iit: i18nT('个人所得税（扣缴）'),
    statements: i18nT('财务报表报送'), cit_annual: i18nT('企业所得税年度汇算'),
  }[tax];
}

/** 申报前必须逐项勾选的核对清单（key 稳定，文案走 i18n） */
export function checklistItems(): Array<{ key: string; label: string }> {
  return [
    { key: 'draft_reviewed', label: i18nT('申报草稿的每一行公式已由财务复核') },
    { key: 'docs_clean', label: i18nT('本期异常票据已处理（或确认不计入）') },
    { key: 'gap_explained', label: i18nT('账税差异、风险预检提示已逐条处理或写明原因') },
    { key: 'invoices_matched', label: i18nT('销项与电子税务局的开票数据、进项与勾选认证数据已核对一致') },
    { key: 'funds_ready', label: i18nT('扣款账户（三方协议）余额足够缴纳本期税款') },
    { key: 'operator_authorized', label: i18nT('登录电子税务局的是办税员本人，或已取得法定代表人授权') },
  ];
}

/** 由申报草稿生成待报事项。零申报也要报：金额为 0 的税种照样列出 */
export function buildFilingItems(run: FaTaxRun, statement?: FaStatementRun | null): FaFilingItem[] {
  const items: FaFilingItem[] = [
    { tax: 'vat', amount: run.result.vatPayable, status: 'pending' },
    { tax: 'surcharge', amount: run.result.surchargeTotal, status: 'pending' },
  ];
  // 所得税按季预缴：季度所属期，或月度所属期落在季末月（3/6/9/12）
  const month = Number(run.period.slice(5, 7));
  if (/Q/.test(run.period) || [3, 6, 9, 12].includes(month)) items.push({ tax: 'cit', amount: run.result.citPayable, status: 'pending' });
  if (run.result.iit.length) items.push({ tax: 'iit', amount: run.result.iitTotal, status: 'pending' });
  if (statement) items.push({ tax: 'statements', amount: 0, status: 'pending' });
  return items;
}

/** 所属期结束后次月 15 日（遇节假日顺延，以电子税务局申报日历为准） */
export function dueDateOf(period: string): string {
  const end = periodRange(period).to.slice(0, 7);
  const [y, m] = end.split('-').map(Number);
  const ny = m === 12 ? y + 1 : y;
  const nm = m === 12 ? 1 : m + 1;
  return `${ny}-${pad2(nm)}-15`;
}

function prevPeriod(today: string, quarterly: boolean): string {
  const [y, m] = today.slice(0, 7).split('-').map(Number);
  if (quarterly) {
    const q = Math.floor((m - 1) / 3); // 当前季度 index 0..3，上一季度
    return q === 0 ? `${y - 1}-Q4` : `${y}-Q${q}`;
  }
  return m === 1 ? `${y - 1}-12` : `${y}-${pad2(m - 1)}`;
}

/** 本期该报的：增值税 / 附加（小规模按季、一般纳税人按月）、个税按月、所得税按季、年度汇算 5 月 31 日 */
export function upcomingDeadlines(ledger: FaLedger, filings: FaFiling[], today = localDate()): FaDeadline[] {
  const vatPeriod = prevPeriod(today, ledger.taxpayerType === 'small');
  const monthPeriod = prevPeriod(today, false);
  const quarterPeriod = prevPeriod(today, true);
  const done = (tax: FaFilingTax, period: string) => filings.some((f) => (f.period === period || (/Q/.test(period) && periodRange(period).to.slice(0, 7) === f.period))
    && f.items.some((i) => i.tax === tax && (i.status === 'filed' || i.status === 'paid')));
  const row = (tax: FaDeadline['tax'], period: string, due: string): FaDeadline => ({ tax, period, due, daysLeft: daysBetween(today, due), done: tax === 'cit_annual' ? false : done(tax as FaFilingTax, period) });
  const out: FaDeadline[] = [
    row('vat', vatPeriod, dueDateOf(vatPeriod)),
    row('surcharge', vatPeriod, dueDateOf(vatPeriod)),
    row('iit', monthPeriod, dueDateOf(monthPeriod)),
    row('cit', quarterPeriod, dueDateOf(quarterPeriod)),
  ];
  const y = Number(today.slice(0, 4));
  const annualDue = `${today.slice(5) <= '05-31' ? y : y + 1}-05-31`;
  out.push(row('cit_annual', String(Number(annualDue.slice(0, 4)) - 1), annualDue));
  return out.sort((a, b) => a.due.localeCompare(b.due));
}

export function provinces(): Array<{ code: string; name: string }> {
  return [
  { code: '', name: i18nT('全国统一入口') },
  { code: 'beijing', name: i18nT('北京') }, { code: 'shanghai', name: i18nT('上海') }, { code: 'tianjin', name: i18nT('天津') }, { code: 'chongqing', name: i18nT('重庆') },
  { code: 'jiangsu', name: i18nT('江苏') }, { code: 'zhejiang', name: i18nT('浙江') }, { code: 'guangdong', name: i18nT('广东') }, { code: 'shenzhen', name: i18nT('深圳') },
  { code: 'shandong', name: i18nT('山东') }, { code: 'fujian', name: i18nT('福建') }, { code: 'anhui', name: i18nT('安徽') }, { code: 'hubei', name: i18nT('湖北') },
  { code: 'hunan', name: i18nT('湖南') }, { code: 'henan', name: i18nT('河南') }, { code: 'hebei', name: i18nT('河北') }, { code: 'sichuan', name: i18nT('四川') },
  { code: 'shaanxi', name: i18nT('陕西') }, { code: 'liaoning', name: i18nT('辽宁') }, { code: 'jiangxi', name: i18nT('江西') }, { code: 'guangxi', name: i18nT('广西') },
  ];
}

export function portalUrl(p: FaTaxPortal | undefined): string {
  if (p?.url?.trim()) return p.url.trim();
  return p?.province ? `https://etax.${p.province}.chinatax.gov.cn` : 'https://etax.chinatax.gov.cn';
}

export function filingProgress(f: FaFiling): { filed: number; paid: number; total: number } {
  return {
    total: f.items.length,
    filed: f.items.filter((i) => i.status === 'filed' || i.status === 'paid').length,
    paid: f.items.filter((i) => i.status === 'paid' || (i.status === 'filed' && !i.amount)).length,
  };
}

