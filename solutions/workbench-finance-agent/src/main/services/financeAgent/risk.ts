/**
 * 财税风险巡检智能体（纯函数）：全量扫账套数据，按固定规则找风险点，出带整改建议的报告。
 *
 * 规则：发票连号、大额现金、大额付给个人、异常费用（环比暴涨 / 整数大额 / 周末招待）、
 * 税负偏低、往来长期挂账、余额方向异常、识别阶段的问题票据。
 * 每条都能回到具体票据 / 凭证号 / 往来单位；模型只在最后写一段总结。
 */
import { t as i18nT } from '@totalclaw/i18n';
import type {
  FaAgingRun, FaBalanceImport, FaDoc, FaFinding, FaJournalRow, FaRiskThresholds, FaTaxRun,
} from '@totalclaw/ipc-contracts';
import { fmt, pct, plNature, round2, sum } from './common';
import { firstLevelName } from './statements';

export function defaultRiskThresholds(): FaRiskThresholds {
  return { largeCash: 50_000, minVatBurden: 0.02, staleDays: 365, consecutiveCount: 3, expenseSpikeRatio: 2 };
}

export interface RiskInput {
  docs: FaDoc[];
  journal: FaJournalRow[];
  balances: FaBalanceImport | null;
  agings: FaAgingRun[];
  taxRuns: FaTaxRun[];
  thresholds: FaRiskThresholds;
}

/** 同一开票方的发票号码连号（虚开、拆票的常见信号） */
export function consecutiveInvoices(docs: FaDoc[], minRun: number): FaFinding[] {
  const out: FaFinding[] = [];
  const groups = new Map<string, FaDoc[]>();
  for (const d of docs) {
    if (d.direction !== 'in' || !d.invoiceNo || !/^\d+$/.test(d.invoiceNo)) continue;
    const k = d.sellerTaxId || d.sellerName || '';
    if (!k) continue;
    groups.set(k, [...(groups.get(k) || []), d]);
  }
  for (const list of groups.values()) {
    const sorted = [...list].sort((a, b) => (BigInt(a.invoiceNo!) < BigInt(b.invoiceNo!) ? -1 : 1));
    let run: FaDoc[] = [sorted[0]];
    const flush = () => {
      if (run.length >= minRun) {
        out.push({
          code: 'consecutive', level: 'high', refs: run.map((d) => d.id),
          title: i18nT('{p0} 开来的 {n} 张发票号码连号', { p0: run[0].sellerName || run[0].sellerTaxId || '', n: run.length }),
          detail: i18nT('号码 {a} ～ {b}，合计 {c}', { a: run[0].invoiceNo!, b: run[run.length - 1].invoiceNo!, c: fmt(sum(run.map((d) => d.total))) }),
          suggestion: i18nT('核实业务真实性：合同、出入库、物流、付款是否一一对应；连号大额常被税务系统判为拆票或虚开'),
        });
      }
    };
    for (let i = 1; i < sorted.length; i++) {
      if (BigInt(sorted[i].invoiceNo!) - BigInt(sorted[i - 1].invoiceNo!) === 1n) run.push(sorted[i]);
      else { flush(); run = [sorted[i]]; }
    }
    flush();
  }
  return out;
}

export function largeCash(journal: FaJournalRow[], threshold: number): FaFinding[] {
  const hits = journal.filter((r) => CASH_RE.test(firstLevelName(r.accountName)) && Math.max(r.debit, r.credit) >= threshold);
  if (!hits.length) return [];
  return [{
    code: 'large_cash', level: hits.some((r) => Math.max(r.debit, r.credit) >= threshold * 4) ? 'high' : 'warn',
    refs: hits.map((r) => r.voucherNo),
    title: i18nT('{n} 笔大额现金收付（≥ {p0}）', { n: hits.length, p0: fmt(threshold) }),
    detail: hits.slice(0, 10).map((r) => `${r.date} ${r.voucherNo} ${r.summary} ${fmt(Math.max(r.debit, r.credit))}`).join('\n'),
    suggestion: i18nT('大额业务改走对公账户；确需现金的留好签收单与用途说明，库存现金超限额的及时存行'),
  }];
}
const CASH_RE = /^库存现金$/;

/** 银行回单付给个人的大额款项 */
export function largeToPerson(docs: FaDoc[], threshold: number): FaFinding[] {
  const hits = docs.filter((d) => d.kind === 'bank_receipt' && d.direction === 'in' && d.total >= threshold && /^[一-龥·]{2,4}$/.test(d.payee || ''));
  if (!hits.length) return [];
  return [{
    code: 'pay_person', level: 'warn', refs: hits.map((d) => d.id),
    title: i18nT('{n} 笔大额款项付给个人', { n: hits.length }),
    detail: hits.slice(0, 10).map((d) => `${d.date || ''} ${d.payee} ${fmt(d.total)} ${d.purpose || ''}`).join('\n'),
    suggestion: i18nT('确认性质：工资应走代发并扣个税；劳务报酬要代扣个税并取得发票；借款要有借据并按期收回，否则可能被视同分红'),
  }];
}

/** 异常费用：费用科目按月环比暴涨、整数大额、周末招待 */
export function abnormalExpenses(journal: FaJournalRow[], ratio: number): FaFinding[] {
  const out: FaFinding[] = [];
  const exp = journal.filter((r) => plNature(r.accountName) === 'expense' && r.debit > 0 && !/成本|所得税|税金/.test(firstLevelName(r.accountName)));
  const byAcct = new Map<string, Map<string, number>>();
  for (const r of exp) {
    const m = r.date.slice(0, 7);
    const a = byAcct.get(r.accountName) || new Map<string, number>();
    a.set(m, round2((a.get(m) || 0) + r.debit));
    byAcct.set(r.accountName, a);
  }
  const spikes: string[] = [];
  for (const [acct, months] of byAcct) {
    const keys = [...months.keys()].sort();
    if (keys.length < 3) continue;
    const last = keys[keys.length - 1];
    const prev = keys.slice(0, -1).map((k) => months.get(k) || 0);
    const avg = sum(prev) / prev.length;
    const cur = months.get(last) || 0;
    if (avg > 0 && cur >= avg * ratio && cur - avg >= 5000) spikes.push(i18nT('{p0}：{m} 月 {a}，前 {n} 个月平均 {b}（{r} 倍）', { p0: acct, m: last, a: fmt(cur), n: prev.length, b: fmt(avg), r: (cur / avg).toFixed(1) }));
  }
  if (spikes.length) {
    out.push({
      code: 'expense_spike', level: 'warn', title: i18nT('{n} 个费用科目本月大幅上涨', { n: spikes.length }), detail: spikes.join('\n'),
      suggestion: i18nT('逐笔看本月大额费用的业务背景；一次性支出写清说明，跨期费用改按受益期分摊'),
    });
  }
  const round = exp.filter((r) => r.debit >= 10_000 && r.debit % 1000 === 0);
  if (round.length >= 3) {
    out.push({
      code: 'round_amount', level: 'info', refs: round.map((r) => r.voucherNo),
      title: i18nT('{n} 笔整千大额费用', { n: round.length }),
      detail: round.slice(0, 10).map((r) => `${r.date} ${r.voucherNo} ${r.accountName} ${fmt(r.debit)}`).join('\n'),
      suggestion: i18nT('整数大额费用（咨询费、服务费、会务费）是稽查关注点，补齐合同、成果物与付款记录'),
    });
  }
  const weekend = exp.filter((r) => /招待/.test(r.accountName) && [0, 6].includes(new Date(`${r.date}T00:00:00`).getDay()) && r.debit >= 1000);
  if (weekend.length) {
    out.push({
      code: 'weekend_entertain', level: 'info', refs: weekend.map((r) => r.voucherNo),
      title: i18nT('{n} 笔周末发生的业务招待费', { n: weekend.length }),
      detail: weekend.slice(0, 10).map((r) => `${r.date} ${r.voucherNo} ${fmt(r.debit)} ${r.summary}`).join('\n'),
      suggestion: i18nT('写明招待对象与事由；与业务无关的个人消费不能入账'),
    });
  }
  return out;
}

/** 往来长期挂账：账龄表里超期的 + 余额表里其他应收 / 应付整年没变动的 */
export function staleBalances(balances: FaBalanceImport | null, agings: FaAgingRun[], staleDays: number): FaFinding[] {
  const out: FaFinding[] = [];
  for (const run of agings.slice(0, 2)) {
    const stale = run.rows.filter((r) => r.ageDays > staleDays);
    if (!stale.length) continue;
    out.push({
      code: 'stale_aging', level: 'warn', refs: [...new Set(stale.map((r) => r.counterparty))],
      title: run.side === 'ar' ? i18nT('应收长期挂账 {n} 笔', { n: stale.length }) : i18nT('应付长期挂账 {n} 笔', { n: stale.length }),
      detail: stale.slice(0, 10).map((r) => `${r.counterparty} ${r.docNo} ${r.date} ${fmt(r.outstanding)}（${r.ageDays}）`).join('\n'),
      suggestion: run.side === 'ar'
        ? i18nT('应收长期不收回可能被视为变相借款或隐匿收入，确认可收回性，必要时计提坏账')
        : i18nT('应付长期不付可能被认定为无需支付的款项，需并入收入纳税；核实后结清或转营业外收入'),
    });
  }
  if (balances) {
    const idle = balances.rows.filter((r) => /^(其他应收款|其他应付款)$/.test(firstLevelName(r.name)) && !r.debit && !r.credit
      && Math.abs(r.closingDebit - r.closingCredit) >= 1000 && r.openingDebit === r.closingDebit && r.openingCredit === r.closingCredit);
    if (idle.length) {
      out.push({
        code: 'idle_other', level: 'warn', refs: idle.map((r) => r.name),
        title: i18nT('{n} 个往来科目本期没有任何发生额但挂着余额', { n: idle.length }),
        detail: idle.slice(0, 10).map((r) => `${r.name} ${fmt(r.closingDebit - r.closingCredit)}`).join('\n'),
        suggestion: i18nT('股东借款年底未还可能被视同分红代扣个税；逐笔确认性质'),
      });
    }
    const wrongSide = balances.rows.filter((r) => /^(应收账款|预付账款|库存现金|原材料|库存商品)$/.test(firstLevelName(r.name)) && r.closingCredit > r.closingDebit + 0.005);
    if (wrongSide.length) {
      out.push({
        code: 'wrong_side', level: 'warn', refs: wrongSide.map((r) => r.name),
        title: i18nT('{n} 个资产科目余额在贷方', { n: wrongSide.length }),
        detail: wrongSide.map((r) => `${r.name} ${i18nT('贷方')} ${fmt(r.closingCredit - r.closingDebit)}`).join('\n'),
        suggestion: i18nT('库存现金 / 存货出现红字说明账实不符或少记收入、多结成本；应收账款贷方余额应重分类到预收'),
      });
    }
  }
  return out;
}

export function scanRisks(input: RiskInput): FaFinding[] {
  const t = input.thresholds;
  const out: FaFinding[] = [
    ...consecutiveInvoices(input.docs, t.consecutiveCount),
    ...largeCash(input.journal, t.largeCash),
    ...largeToPerson(input.docs, t.largeCash),
    ...abnormalExpenses(input.journal, t.expenseSpikeRatio),
    ...staleBalances(input.balances, input.agings, t.staleDays),
  ];
  const tax = input.taxRuns[0];
  if (tax?.result.burdenRate != null && tax.result.burdenRate < t.minVatBurden && !tax.result.vatExempt) {
    out.push({
      code: 'low_burden', level: 'warn', title: i18nT('{p0} 增值税税负率 {a} 偏低', { p0: tax.period, a: pct(tax.result.burdenRate) }),
      detail: i18nT('预警值 {p0}', { p0: pct(t.minVatBurden) }),
      suggestion: i18nT('核查进项取得是否集中、是否有未申报收入；准备好经营情况说明'),
    });
  }
  const flagged = input.docs.filter((d) => d.checks.some((c) => c.code === 'duplicate' || c.code === 'title_wrong' || c.code === 'uscc_invalid'));
  if (flagged.length) {
    out.push({
      code: 'bad_docs', level: 'warn', refs: flagged.map((d) => d.id),
      title: i18nT('{n} 张票据存在重复 / 抬头错误 / 税号错误', { n: flagged.length }),
      detail: flagged.slice(0, 10).map((d) => `${d.fileName}：${d.checks.filter((c) => c.level === 'error').map((c) => c.message).join(i18nT('；'))}`).join('\n'),
      suggestion: i18nT('重复票不得重复入账；抬头错误的退回开票方重开'),
    });
  }
  const order = { high: 0, warn: 1, info: 2 } as const;
  return out.sort((a, b) => order[a.level] - order[b.level]);
}

export function riskReportMarkdown(ledgerName: string, findings: FaFinding[], summary: string | undefined, scanned: { docs: number; vouchers: number; journal: number; aging: number }, at: string): string {
  const lv = { high: i18nT('高'), warn: i18nT('中'), info: i18nT('低') } as const;
  const lines = [
    `# ${i18nT('{p0} 财税风险巡检报告', { p0: ledgerName })}`,
    '',
    i18nT('巡检时间：{p0}　扫描范围：票据 {a} 张、凭证 {b} 张、序时账 {c} 行、账龄表 {d} 份', { p0: at.slice(0, 16).replace('T', ' '), a: scanned.docs, b: scanned.vouchers, c: scanned.journal, d: scanned.aging }),
    '',
    `> ${i18nT('本报告由财务智能体按固定规则生成，仅作风险提示与整改参考，结论需财务人员复核确认。')}`,
    '',
  ];
  if (summary) lines.push(`## ${i18nT('总体结论')}`, '', summary, '');
  lines.push(`## ${i18nT('风险明细（{n} 项）', { n: findings.length })}`, '');
  if (!findings.length) lines.push(i18nT('未发现规则内的风险点。'), '');
  findings.forEach((f, i) => {
    lines.push(`### ${i + 1}. [${lv[f.level]}] ${f.title}`, '', f.detail.split('\n').map((l) => `- ${l}`).join('\n'), '', `**${i18nT('整改建议')}**：${f.suggestion}`, '');
  });
  return lines.join('\n');
}
