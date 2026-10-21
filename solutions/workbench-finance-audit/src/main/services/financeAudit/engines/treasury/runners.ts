/**
 * G5 资金与金融风险（E1–E7）的 ModuleRunner：③ 校验 → ④ 引擎（子进度）+ H 型模块模型写说明并回核 → ⑤ 底稿 / 说明文件。
 * 金额全部由引擎（纯函数）算；升级条件（三方差异超限、低于安全线、缺口、契约越线、超限额、合规越线…）进提醒项并强制批准级，
 * 首页待办按升级事项列出（todo.ts 已有的 escalation 口径）。付款只出计划 / 建议；外汇只出策略与询价单草稿。
 */
import { i18nKey } from '@totalclaw/i18n';
import type {
  FauArtifact, FauCashResult, FauEclResult, FauEclStage, FauFinancingResult, FauFxResult, FauInvestResult, FauIssue, FauMsg, FauReminder,
  FauSubProgress, FauTreasuryResult, FauValidationReport, FauVerificationItem, FauWcResult,
} from '@totalclaw/ipc-contracts';
import { STANDARD_LABELS } from '../../../../../shared/financeAudit/regions';
import type { AnalyzeResult, ModuleRunner, RunCtx } from '../../runner';
import { sha256File } from '../../signoff';
import { newId, nowIso } from '../../store';
import { withDatasetIssues } from '../accounting/closeRunner';
import { asOfOf, major, pct, periodDays, sum } from './common';
import { cashForecast, cashPosition, forecastEscalations, paymentPlan, positionEscalations } from './cash';
import { authorizationReview, bankScores, cashPool, lcr } from './treasuryOps';
import { fxExposure } from './fx';
import { covenantChecks, financingCost, latestActual, waccParams } from './financing';
import { eclGeneral, eclSimplified, forwardFactor, ratingIndex, resolveScenarios, weightsOk } from './ecl';
import { cccMetrics, inventoryAbc, scfOptions, supplierTerms } from './workingCapital';
import { liquidity, portfolio } from './investments';
import { writeNarrative } from './narrative';
import {
  writeCashOutputs, writeEclOutputs, writeFinancingOutputs, writeFxOutputs, writeInvestOutputs, writeTreasuryOutputs, writeWcOutputs, type OutputCtx,
} from './outputs';

// ── 公共 ──

const SUB_LABEL: Record<string, string> = {
  position: i18nKey('三方核对与可用余额'), forecast: i18nKey('13 周三情景预测'), payment: i18nKey('付款分级与排程'),
  authorization: i18nKey('付款授权复核'), pool: i18nKey('现金池测算'), banks: i18nKey('银行关系评分'), liquidity: i18nKey('LCR 与 NSFR'),
  exposure: i18nKey('敞口与敏感性'), hedge: i18nKey('分层对冲与询价单'), cost: i18nKey('融资成本与 WACC'), covenant: i18nKey('契约当前值与预测'),
  stage: i18nKey('三阶段分类'), measure: i18nKey('三情景计量'), matrix: i18nKey('拨备矩阵'), ccc: i18nKey('周转天数与现金转换周期'),
  inventory: i18nKey('存货 ABC 与呆滞'), suppliers: i18nKey('应付账期与集中度'), scf: i18nKey('供应链金融测算'), portfolio: i18nKey('投资盘点'),
  narrative: i18nKey('模型写说明并回核'),
};
const subs = (ids: string[]): FauSubProgress[] => ids.map((id) => ({ id, label: { key: SUB_LABEL[id] }, status: 'todo' }));

async function step<T>(ctx: RunCtx, id: string, fn: () => T | Promise<T>): Promise<T> {
  ctx.progress(id, 'running');
  try {
    const v = await fn();
    ctx.progress(id, 'done');
    return v;
  } catch (e) {
    ctx.progress(id, 'failed');
    throw e;
  }
}

const asOf = (ctx: RunCtx) => asOfOf(ctx.project.period);
const local = (ctx: RunCtx) => ctx.company.currency;
const has = (ctx: RunCtx, slot: string) => !!ctx.run.inputs[slot]?.length;

class Report {
  checks: FauValidationReport['checks'] = [];
  blockers: FauIssue[] = [];
  warnings: FauIssue[] = [];
  add(id: string, ok: boolean, level: 'block' | 'warn', message: FauMsg): void {
    this.checks.push({ id, ok, level, message });
    if (!ok) (level === 'block' ? this.blockers : this.warnings).push({ id: `chk_${id}`, level, code: id, message });
  }
  done(ctx: RunCtx, slots: string[]): FauValidationReport {
    return withDatasetIssues({ checks: this.checks, blockers: this.blockers, warnings: this.warnings }, ctx, slots);
  }
}

function nonEmpty(r: Report, ctx: RunCtx, slot: string, rows: unknown[]): void {
  if (has(ctx, slot)) r.add(`rows_${slot}`, rows.length > 0, 'block', { key: i18nKey('「{p0}」没有可用的数据行'), params: { p0: ctx.datasets(slot)[0]?.fileName || slot } });
}

const escalations = (prefix: string, msgs: FauMsg[]): FauReminder[] => msgs.map((m, i) => ({ id: `${prefix}:${i}`, source: 'escalation', level: 'warn', message: m }));

function octx(ctx: RunCtx): OutputCtx {
  const run = ctx.run;
  const mode = ctx.def.modes.find((m) => m.id === run.modeId);
  return {
    locale: ctx.locale, dir: ctx.outputDir(), companyName: ctx.company.name, projectName: ctx.project.name, period: ctx.project.period,
    moduleCode: ctx.def.code, moduleName: ctx.def.name, modeName: mode?.name || run.modeId, standardLabel: STANDARD_LABELS[ctx.profile.standard], model: run.model,
  };
}

function artifacts(ctx: RunCtx, outs: { path: string; title: string; kind?: 'docx' }[]): { artifacts: FauArtifact[]; summary: FauMsg } {
  const list = outs.map((o) => ({ id: newId('art'), kind: o.kind || 'xlsx', path: o.path, sha256: sha256File(o.path) || '', title: { key: o.title }, locale: ctx.locale, createdAt: nowIso() }) as FauArtifact);
  return { artifacts: list, summary: { key: i18nKey('已生成 {n} 个文件（草稿—待签核）'), params: { n: list.length } } };
}

const extra = (ctx: RunCtx) => ({ levels: ctx.run.requiredLevels, reminders: ctx.run.reminders });

function done(result: unknown, reminders: FauReminder[], summary: FauMsg, more: Partial<AnalyzeResult> = {}): AnalyzeResult {
  return { result, reminders, approveRequired: reminders.some((r) => r.source === 'escalation'), summary, ...more };
}

const localBalances = (ctx: RunCtx) => ctx.rows<'bank_balance'>('balances').filter((b) => !b.currency || b.currency === local(ctx));

// ── E1 现金 ──

export const cashRunner: ModuleRunner = {
  subSteps: (m) => subs(m === 'daily' ? ['position'] : m === 'forecast' ? ['position', 'forecast'] : ['payment']),
  async validate(ctx) {
    const r = new Report();
    nonEmpty(r, ctx, 'balances', ctx.rows<'bank_balance'>('balances'));
    if (ctx.run.modeId === 'forecast') nonEmpty(r, ctx, 'plan', ctx.rows<'cash_plan'>('plan'));
    if (ctx.run.modeId === 'payment') nonEmpty(r, ctx, 'requests', ctx.rows<'payment_request'>('requests'));
    const accts = ctx.rows<'bank_balance'>('balances').map((b) => b.account);
    r.add('dup_account', new Set(accts).size === accts.length, 'warn', { key: i18nKey('账户余额表里有重复的账号，会重复计入合计') });
    if (ctx.run.modeId === 'payment') {
      const reqs = ctx.rows<'payment_request'>('requests');
      r.add('no_due', reqs.every((x) => x.dueDate), 'warn', { key: i18nKey('{n} 笔付款申请没有到期日，排在同级最后'), params: { n: reqs.filter((x) => !x.dueDate).length } });
    }
    return r.done(ctx, ['balances', 'plan', 'ar', 'ap', 'facilities', 'requests']);
  },
  async analyze(ctx) {
    const th = ctx.th('cash');
    const p = await step(ctx, ctx.run.modeId === 'payment' ? 'payment' : 'position', () => cashPosition(ctx.rows<'bank_balance'>('balances'), local(ctx), asOf(ctx), th));
    if (ctx.run.modeId === 'daily') {
      const result: FauCashResult = { mode: 'daily', position: p };
      return done(result, escalations('pos', positionEscalations(p, th)), { key: i18nKey('{n} 个账户，可用余额 {p0}'), params: { n: p.accounts.length, p0: (p.totals.available / 100).toFixed(2) } });
    }
    if (ctx.run.modeId === 'forecast') {
      const f = await step(ctx, 'forecast', () => cashForecast({
        opening: p.totals.available, asOf: asOf(ctx), plan: ctx.rows<'cash_plan'>('plan'), ar: ctx.rows<'ar'>('ar'), ap: ctx.rows<'ap'>('ap'),
        facilities: has(ctx, 'facilities') ? ctx.rows<'credit_facility'>('facilities') : null, th,
      }));
      const result: FauCashResult = { mode: 'forecast', position: p, forecast: f };
      return done(result, escalations('fc', forecastEscalations(f, th)), { key: i18nKey('基准情景期末 {p0}，悲观情景最大缺口 {p1}'), params: { p0: (f.scenarios[1].endBalance / 100).toFixed(2), p1: (f.scenarios[2].maxGap / 100).toFixed(2) } });
    }
    const plan = paymentPlan(ctx.rows<'payment_request'>('requests'), p.totals.available, asOf(ctx));
    const reminders: FauReminder[] = [
      ...(plan.gap ? escalations('pay_gap', [{ key: i18nKey('必须支付的 P0 付款超出可用资金 {p0}'), params: { p0: (plan.gap / 100).toFixed(2) } }]) : []),
      ...plan.lines.filter((l) => l.plan === 'hold').map((l) => ({ id: `hold:${l.id}`, source: 'escalation' as const, level: 'warn' as const, message: { key: i18nKey('付款 {p0}（{p1}）暂停核实，原因见付款计划'), params: { p0: l.id, p1: l.payee } } })),
    ];
    const result: FauCashResult = { mode: 'payment', payments: plan };
    return done(result, reminders, { key: i18nKey('排入 {p0}，延后 {p1}，暂停核实 {p2}'), params: { p0: (plan.scheduled / 100).toFixed(2), p1: (plan.deferred / 100).toFixed(2), p2: (plan.held / 100).toFixed(2) } });
  },
  async draft(ctx) {
    return artifacts(ctx, writeCashOutputs(octx(ctx), ctx.run.result as FauCashResult, extra(ctx)));
  },
};

// ── E2 司库 ──

export const treasuryRunner: ModuleRunner = {
  subSteps: (m) => subs(({ position: ['position', 'forecast'], authorization: ['authorization'], cash_pool: ['pool', 'narrative'], bank_relationship: ['banks'], liquidity: ['liquidity'] } as Record<string, string[]>)[m] || []),
  async validate(ctx) {
    const r = new Report();
    const m = ctx.run.modeId;
    if (['position', 'cash_pool'].includes(m)) nonEmpty(r, ctx, 'balances', ctx.rows<'bank_balance'>('balances'));
    if (m === 'position') nonEmpty(r, ctx, 'plan', ctx.rows<'cash_plan'>('plan'));
    if (m === 'authorization') nonEmpty(r, ctx, 'requests', ctx.rows<'payment_request'>('requests'));
    if (m === 'bank_relationship') nonEmpty(r, ctx, 'facilities', ctx.rows<'credit_facility'>('facilities'));
    if (m === 'liquidity') {
      const items = ctx.rows<'liquidity_items'>('liquidityItems');
      nonEmpty(r, ctx, 'liquidityItems', items);
      r.add('lcr_outflow', items.some((x) => x.category === 'outflow'), 'warn', { key: i18nKey('没有 30 天现金流出项，算不出 LCR') });
      r.add('nsfr_rsf', items.some((x) => x.category === 'rsf'), 'warn', { key: i18nKey('没有所需稳定资金项，算不出 NSFR') });
    }
    if (m === 'cash_pool') r.add('pool_local', localBalances(ctx).length >= 2, 'block', { key: i18nKey('本位币账户少于 2 个，无法组成资金池') });
    return r.done(ctx, ['balances', 'plan', 'ar', 'ap', 'facilities', 'requests', 'liquidityItems']);
  },
  async analyze(ctx) {
    const th = ctx.th('treasury');
    const m = ctx.run.modeId;
    const res: FauTreasuryResult = { mode: m as FauTreasuryResult['mode'], narrative: [] };
    const reminders: FauReminder[] = [];
    let verification: FauVerificationItem[] = [];
    let model: string | undefined;
    let summary: FauMsg = { key: i18nKey('计算完成') };
    if (m === 'position') {
      const cth = ctx.th('cash');
      res.position = await step(ctx, 'position', () => cashPosition(ctx.rows<'bank_balance'>('balances'), local(ctx), asOf(ctx), cth));
      res.forecast = await step(ctx, 'forecast', () => cashForecast({
        opening: res.position!.totals.available, asOf: asOf(ctx), plan: ctx.rows<'cash_plan'>('plan'), ar: ctx.rows<'ar'>('ar'), ap: ctx.rows<'ap'>('ap'),
        facilities: has(ctx, 'facilities') ? ctx.rows<'credit_facility'>('facilities') : null, th: cth,
      }));
      reminders.push(...escalations('pos', positionEscalations(res.position, cth)), ...escalations('fc', forecastEscalations(res.forecast, cth)));
      summary = { key: i18nKey('基准情景期末 {p0}，悲观情景最大缺口 {p1}'), params: { p0: (res.forecast.scenarios[1].endBalance / 100).toFixed(2), p1: (res.forecast.scenarios[2].maxGap / 100).toFixed(2) } };
    } else if (m === 'authorization') {
      res.authorizations = await step(ctx, 'authorization', () => authorizationReview(ctx.rows<'payment_request'>('requests'), ctx.rows<'bank_balance'>('balances'), th));
      for (const a of res.authorizations) {
        if (a.advice === 'reject_recommend' || a.advice === 'hold') reminders.push({ id: `auth:${a.id}`, source: 'escalation', level: 'warn', message: { key: i18nKey('付款 {p0}（{p1}）复核建议「暂缓 / 拒绝」，须批准人确认'), params: { p0: a.id, p1: a.payee } } });
        else if (a.large) reminders.push({ id: `auth_large:${a.id}`, source: 'escalation', level: 'warn', message: { key: i18nKey('付款 {p0}（{p1}）为大额付款，须资金总监 / CFO 审批'), params: { p0: a.id, p1: a.payee } } });
      }
      summary = { key: i18nKey('复核 {n} 笔：建议放行 {a}，补充资料 {b}，暂缓或拒绝 {c}'), params: { n: res.authorizations.length, a: res.authorizations.filter((x) => x.advice === 'proceed').length, b: res.authorizations.filter((x) => x.advice === 'request_docs').length, c: res.authorizations.filter((x) => x.advice === 'hold' || x.advice === 'reject_recommend').length } };
    } else if (m === 'cash_pool') {
      const pool = await step(ctx, 'pool', () => cashPool(ctx.rows<'bank_balance'>('balances'), local(ctx), th));
      res.pool = pool;
      const out = await step(ctx, 'narrative', () => writeNarrative(ctx, {
        kind: 'cash_pool', skill: 'fa-cash-pool-configuration', topics: ['pool_structure', 'pool_benefit'],
        facts: {
          headerAccount: pool.header, currency: pool.currency, sweepUp: major(pool.sweepUp), sweepDown: major(pool.sweepDown), pooled: major(pool.pooled),
          annualInterestGain: major(pool.interestGain), investRatePct: pct(pool.investRate),
          accounts: pool.accounts.map((a) => ({ account: a.account, entity: a.entity, bank: a.bank, balance: major(a.balance), keep: major(a.target), sweep: major(a.sweep), depositRatePct: pct(a.rate) })),
          excluded: pool.excluded.map((e) => e.account),
        },
        userData: [pool.header, ...pool.accounts.flatMap((a) => [a.account, a.entity, a.bank]), ...pool.excluded.map((e) => e.account)],
      }));
      res.narrative = out.narrative;
      verification = out.verification;
      model = out.model;
      summary = { key: i18nKey('归集后可调度资金 {p0}，年化利息增益估算 {p1}'), params: { p0: (pool.pooled / 100).toFixed(2), p1: (pool.interestGain / 100).toFixed(2) } };
    } else if (m === 'bank_relationship') {
      res.banks = await step(ctx, 'banks', () => bankScores(ctx.rows<'credit_facility'>('facilities'), ctx.rows<'bank_balance'>('balances'), asOf(ctx), th));
      for (const b of res.banks.filter((x) => x.utilization != null && x.utilization >= th['bank.utilBreach'])) reminders.push({ id: `util:${b.bank}`, source: 'escalation', level: 'warn', message: { key: i18nKey('{p0} 授信使用率越线'), params: { p0: b.bank } } });
      for (const b of res.banks.filter((x) => x.expiringSoon)) reminders.push({ id: `exp:${b.bank}`, source: 'engine', level: 'warn', message: { key: i18nKey('{p0} 授信 {p1} 到期，应启动续期'), params: { p0: b.bank, p1: b.expiry } } });
      summary = { key: i18nKey('{n} 家银行评分'), params: { n: res.banks.length } };
    } else {
      const l = await step(ctx, 'liquidity', () => lcr(ctx.rows<'liquidity_items'>('liquidityItems'), th));
      res.liquidity = l;
      if (l.lcrStatus === 'breach') reminders.push({ id: 'lcr', source: 'escalation', level: 'warn', message: { key: i18nKey('LCR {p0}% 低于最低要求，须立即升级 CFO'), params: { p0: ((l.lcr || 0) * 100).toFixed(1) } } });
      if (l.nsfrStatus === 'breach') reminders.push({ id: 'nsfr', source: 'escalation', level: 'warn', message: { key: i18nKey('NSFR {p0}% 低于最低要求'), params: { p0: ((l.nsfr || 0) * 100).toFixed(1) } } });
      summary = { key: i18nKey('LCR {p0}% · NSFR {p1}%'), params: { p0: l.lcr == null ? '-' : (l.lcr * 100).toFixed(1), p1: l.nsfr == null ? '-' : (l.nsfr * 100).toFixed(1) } };
    }
    return done(res, reminders, summary, { verification, model });
  },
  async draft(ctx) {
    return artifacts(ctx, writeTreasuryOutputs(octx(ctx), ctx.run.result as FauTreasuryResult, extra(ctx)));
  },
};

// ── E3 外汇（只到询价单草稿） ──

export const fxRunner: ModuleRunner = {
  subSteps: (m) => subs(m === 'hedge' ? ['exposure', 'hedge', 'narrative'] : ['exposure']),
  async validate(ctx) {
    const r = new Report();
    const rows = ctx.rows<'fx_exposure'>('fxExposure');
    nonEmpty(r, ctx, 'fxExposure', rows);
    const rates = ctx.rows<'fx_rates'>('fxRates');
    const missing = [...new Set(rows.map((x) => x.currency).filter((c) => c && c !== local(ctx) && !rates.some((q) => q.currency === c)))];
    r.add('fx_rates', !missing.length, 'block', { key: i18nKey('这些币种没有汇率：{p0}'), params: { p0: missing.join(', ') } });
    r.add('fx_local', rows.some((x) => x.currency !== local(ctx)), 'warn', { key: i18nKey('敞口表里没有外币行') });
    return r.done(ctx, ['fxExposure', 'fxRates']);
  },
  async analyze(ctx) {
    const th = ctx.th('fx');
    const r = await step(ctx, 'exposure', () => fxExposure(ctx.rows<'fx_exposure'>('fxExposure'), ctx.rows<'fx_rates'>('fxRates'), local(ctx), th));
    const res: FauFxResult = { localCurrency: local(ctx), exposures: r.exposures, rfq: [], totalLocal: r.totalLocal, narrative: [] };
    const reminders: FauReminder[] = [];
    for (const e of r.exposures) {
      if (e.overLimit) reminders.push({ id: `limit:${e.currency}`, source: 'escalation', level: 'warn', message: { key: i18nKey('{p0} 未对冲交易敞口超过限额，须立即升级 CFO'), params: { p0: e.currency } } });
      if (e.hedgeNeed && Math.sign(e.hedgeNeed) !== Math.sign(e.hedgeTarget)) reminders.push({ id: `over:${e.currency}`, source: 'engine', level: 'warn', message: { key: i18nKey('{p0} 已对冲超过目标比例，复核是否过度对冲'), params: { p0: e.currency } } });
    }
    let verification: FauVerificationItem[] = [];
    let model: string | undefined;
    if (ctx.run.modeId === 'hedge') {
      res.rfq = await step(ctx, 'hedge', () => r.rfq);
      const out = await step(ctx, 'narrative', () => writeNarrative(ctx, {
        kind: 'hedge', skill: 'fa-fx-hedging-strategy', topics: ['hedge_strategy', 'hedge_cost'],
        facts: {
          localCurrency: res.localCurrency,
          hedgeRatiosPct: { firm: pct(th['hedge.firmRatio']), highlyProbable: pct(th['hedge.probableRatio']), possible: pct(th['hedge.possibleRatio']) },
          currencies: r.exposures.map((e) => ({
            currency: e.currency, rate: e.rate, transactionExposure: major(e.transaction), translationExposure: major(e.translation), economicExposure: major(e.economic),
            transactionExposureLocal: major(e.transactionLocal), alreadyHedged: major(e.hedged), hedgeTarget: major(e.hedgeTarget), hedgeNeeded: major(e.hedgeNeed),
            hedgedPct: pct(e.hedgeRatio), sharePct: pct(e.share), impactOf1PctMoveLocal: major(e.sensitivity.find((s) => s.shock === 0.01)?.impact),
          })),
          requestForQuote: res.rfq.map((q) => ({ currency: q.currency, side: q.side, notional: major(q.notional), valueMonth: q.valueMonth, instrument: q.instrument })),
        },
        userData: r.exposures.map((e) => e.currency),
      }));
      res.narrative = out.narrative;
      verification = out.verification;
      model = out.model;
    }
    return done(res, reminders, { key: i18nKey('{n} 个外币币种，询价单 {m} 行（只询价，不下单）'), params: { n: r.exposures.length, m: res.rfq.length } }, { verification, model });
  },
  async draft(ctx) {
    return artifacts(ctx, writeFxOutputs(octx(ctx), ctx.run.result as FauFxResult, extra(ctx)));
  },
};

// ── E4 融资 ──

export const financingRunner: ModuleRunner = {
  subSteps: (m) => subs(m === 'cost' ? ['cost'] : m === 'covenant' ? ['covenant'] : ['cost', 'covenant', 'narrative']),
  async validate(ctx) {
    const r = new Report();
    const m = ctx.run.modeId;
    if (m !== 'covenant') nonEmpty(r, ctx, 'loans', ctx.rows<'loan'>('loans'));
    if (m !== 'cost') nonEmpty(r, ctx, 'metrics', ctx.rows<'fin_metrics'>('metrics'));
    if (m === 'covenant') nonEmpty(r, ctx, 'covenants', ctx.rows<'covenant'>('covenants'));
    const loans = ctx.rows<'loan'>('loans');
    r.add('loan_rate', loans.every((l) => l.rate != null), 'warn', { key: i18nKey('{n} 笔借款没有利率，按 0 计算成本'), params: { n: loans.filter((l) => l.rate == null).length } });
    r.add('loan_maturity', loans.every((l) => !l.maturityDate || l.maturityDate > asOf(ctx)), 'warn', { key: i18nKey('有借款到期日早于基准日，请确认是否已还清') });
    return r.done(ctx, ['loans', 'metrics', 'covenants']);
  },
  async analyze(ctx) {
    const th = ctx.th('financing');
    const m = ctx.run.modeId;
    const metrics = ctx.rows<'fin_metrics'>('metrics');
    const res: FauFinancingResult = { mode: m as FauFinancingResult['mode'], narrative: [] };
    const reminders: FauReminder[] = [];
    if (m !== 'covenant') res.cost = await step(ctx, 'cost', () => financingCost(ctx.rows<'loan'>('loans'), metrics, waccParams(th, ctx.run.params), asOf(ctx)));
    if (m !== 'cost' && has(ctx, 'covenants')) {
      res.covenants = await step(ctx, 'covenant', () => covenantChecks(ctx.rows<'covenant'>('covenants'), metrics, th));
      for (const c of res.covenants) {
        if (c.current === 'breach') reminders.push({ id: `cov:${c.id}`, source: 'escalation', level: 'warn', message: { key: i18nKey('契约「{p0}」（{p1}）当前已越线'), params: { p0: c.name, p1: c.lender } } });
        else if (c.firstBreach) reminders.push({ id: `cov:${c.id}`, source: 'escalation', level: 'warn', message: { key: i18nKey('契约「{p0}」（{p1}）预计 {p2} 越线'), params: { p0: c.name, p1: c.lender, p2: c.firstBreach } } });
      }
    } else if (m === 'restructure') ctx.progress('covenant', 'skipped');
    let verification: FauVerificationItem[] = [];
    let model: string | undefined;
    if (m === 'restructure') {
      const c = res.cost!;
      const last = latestActual(metrics);
      const out = await step(ctx, 'narrative', () => writeNarrative(ctx, {
        kind: 'restructure', skill: 'fa-debt-restructuring', topics: ['restructure_options', 'restructure_risks'],
        facts: {
          totalDebt: major(c.debt), costOfDebtPreTaxPct: pct(c.kdPreTax), costOfDebtAfterTaxPct: pct(c.kdAfterTax), waccPct: pct(c.wacc),
          maturity: Object.fromEntries(c.maturity.map((x) => [x.bucket, major(x.amount)])),
          loans: c.loans.map((l) => ({ id: l.id, lender: l.lender, principal: major(l.principal), allInCostPct: pct(l.allIn), maturity: l.maturity })),
          latest: last ? { period: last.period, ebitda: major(last.ebitda), interest: major(last.interest), debtService: major(last.debtService), cash: major(last.cash) } : null,
          covenants: (res.covenants || []).map((x) => ({ lender: x.lender, name: x.name, limit: x.metric === 'net_worth' ? major(x.limit) : x.limit, status: x.current, firstBreach: x.firstBreach, values: x.values.map((v) => ({ period: v.period, value: v.value == null ? null : x.metric === 'net_worth' ? major(v.value) : Math.round(v.value * 100) / 100 })) })),
        },
        userData: [...c.loans.flatMap((l) => [l.id, l.lender]), ...(res.covenants || []).flatMap((x) => [x.lender, x.name])],
      }));
      res.narrative = out.narrative;
      verification = out.verification;
      model = out.model;
    }
    const summary: FauMsg = res.covenants
      ? { key: i18nKey('{n} 条契约：越线 {a}，关注 {b}'), params: { n: res.covenants.length, a: res.covenants.filter((x) => x.current === 'breach' || x.firstBreach).length, b: res.covenants.filter((x) => x.values.some((v) => v.status === 'watch')).length } }
      : { key: i18nKey('有息负债 {p0}，WACC {p1}%'), params: { p0: ((res.cost?.debt || 0) / 100).toFixed(2), p1: res.cost?.wacc == null ? '-' : (res.cost.wacc * 100).toFixed(2) } };
    return done(res, reminders, summary, { verification, model });
  },
  async draft(ctx) {
    return artifacts(ctx, writeFinancingOutputs(octx(ctx), ctx.run.result as FauFinancingResult, extra(ctx)));
  },
};

// ── E5 ECL ──

/** 上一期项目链里最近一次已归档的一般法运行：敞口编号 → 阶段 */
function priorStages(ctx: RunCtx): Map<string, FauEclStage> {
  const out = new Map<string, FauEclStage>();
  const prev = ctx.history().filter((r) => (r.result as FauEclResult | undefined)?.lines).sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
  for (const l of (prev?.result as FauEclResult | undefined)?.lines || []) out.set(l.id, l.stage);
  return out;
}

export const eclRunner: ModuleRunner = {
  subSteps: (m) => subs(m === 'general' ? ['stage', 'measure'] : ['matrix']),
  async validate(ctx) {
    const r = new Report();
    const sc = resolveScenarios(ctx.rows<'macro_scenario'>('scenarios'), ctx.th('ifrs9'));
    r.add('weights', weightsOk(sc), 'block', { key: i18nKey('情景权重合计 {p0}%，必须等于 100%'), params: { p0: (sum(sc.map((s) => s.weight)) * 100).toFixed(1) } });
    if (ctx.run.modeId === 'general') {
      const rows = ctx.rows<'credit_exposure'>('exposures');
      nonEmpty(r, ctx, 'exposures', rows);
      r.add('neg_balance', rows.every((x) => x.balance >= 0 && x.undrawn >= 0), 'block', { key: i18nKey('有敞口余额或未提用额度为负数') });
      const noPd = rows.filter((x) => x.pd12m == null && ratingIndex(x.ratingNow) == null);
      r.add('no_pd', !noPd.length, 'warn', { key: i18nKey('{n} 条敞口既没有评级也没有 PD，按 BBB 档 0.60% 计'), params: { n: noPd.length } });
      const ids = rows.map((x) => x.id).filter(Boolean);
      r.add('dup_id', new Set(ids).size === ids.length, 'warn', { key: i18nKey('敞口编号有重复，阶段迁移按编号对应会不准') });
    } else {
      const ar = ctx.rows<'ar'>('ar');
      nonEmpty(r, ctx, 'ar', ar);
      r.add('ar_dates', ar.every((x) => x.dueDate || x.docDate), 'warn', { key: i18nKey('{n} 笔应收没有到期日和单据日期，按未到期处理'), params: { n: ar.filter((x) => !x.dueDate && !x.docDate).length } });
    }
    return r.done(ctx, ['exposures', 'scenarios', 'ar', 'lossRates']);
  },
  async analyze(ctx) {
    const th = ctx.th('ifrs9');
    const scenarios = resolveScenarios(ctx.rows<'macro_scenario'>('scenarios'), th);
    const factor = forwardFactor(scenarios);
    const res: FauEclResult = { mode: ctx.run.modeId as FauEclResult['mode'], asOf: asOf(ctx), scenarios, weightsOk: weightsOk(scenarios), forwardFactor: factor, totalEad: 0, totalEcl: 0 };
    const reminders: FauReminder[] = [];
    if (ctx.run.modeId === 'general') {
      const rows = ctx.rows<'credit_exposure'>('exposures');
      await step(ctx, 'stage', () => rows.length);
      const g = await step(ctx, 'measure', () => eclGeneral(rows, scenarios, th, priorStages(ctx)));
      Object.assign(res, { lines: g.lines, stages: g.stages, migration: g.migration, totalEad: g.totalEad, totalEcl: g.totalEcl });
      const s3 = g.stages.find((s) => s.stage === 3)!;
      const share = g.totalEad ? s3.ead / g.totalEad : 0;
      if (share > th.stage3ShareWatch) reminders.push({ id: 'stage3', source: 'escalation', level: 'warn', message: { key: i18nKey('第三阶段敞口占比 {p0}%，超过升级线'), params: { p0: (share * 100).toFixed(1) } } });
      if (!ctx.run.inputs.scenarios?.length) reminders.push({ id: 'default_scenarios', source: 'engine', level: 'warn', message: { key: i18nKey('未上传宏观情景，使用默认三情景权重与 PD 调整系数') } });
    } else {
      const m = await step(ctx, 'matrix', () => eclSimplified(ctx.rows<'ar'>('ar'), asOf(ctx), ctx.rows<'loss_rates'>('lossRates'), factor, th));
      Object.assign(res, { matrix: m.matrix, totalEad: m.totalEad, totalEcl: m.totalEcl });
      if (!ctx.run.inputs.lossRates?.length) reminders.push({ id: 'default_rates', source: 'engine', level: 'warn', message: { key: i18nKey('未上传损失率表，使用默认损失率，应按本企业历史损失率校准') } });
    }
    return done(res, reminders, { key: i18nKey('违约敞口 {p0}，预期信用损失 {p1}'), params: { p0: (res.totalEad / 100).toFixed(2), p1: (res.totalEcl / 100).toFixed(2) } });
  },
  async draft(ctx) {
    return artifacts(ctx, writeEclOutputs(octx(ctx), ctx.run.result as FauEclResult, extra(ctx)));
  },
};

// ── E6 营运资本 ──

export const workingCapitalRunner: ModuleRunner = {
  subSteps: (m) => subs(m === 'ccc' ? ['ccc', 'inventory'] : m === 'inventory' ? ['inventory'] : ['suppliers', 'scf']),
  async validate(ctx) {
    const r = new Report();
    const m = ctx.run.modeId;
    if (m === 'ccc') { nonEmpty(r, ctx, 'ar', ctx.rows<'ar'>('ar')); nonEmpty(r, ctx, 'ap', ctx.rows<'ap'>('ap')); }
    if (m === 'inventory') nonEmpty(r, ctx, 'inventory', ctx.rows<'inventory'>('inventory'));
    if (m === 'payables') nonEmpty(r, ctx, 'ap', ctx.rows<'ap'>('ap'));
    if (m !== 'inventory') {
      const last = latestActual(ctx.rows<'fin_metrics'>('metrics'));
      r.add('rev_cogs', !!last?.revenue && !!last?.cogs, 'block', { key: i18nKey('财务指标表缺营业收入或营业成本，算不出周转天数') });
    }
    if (m !== 'payables') {
      const inv = ctx.rows<'inventory'>('inventory');
      r.add('inv_move', inv.every((x) => x.lastMoveDate), 'warn', { key: i18nKey('{n} 个物料没有最后出入库日期，不判呆滞'), params: { n: inv.filter((x) => !x.lastMoveDate).length } });
    }
    return r.done(ctx, ['ar', 'ap', 'inventory', 'metrics']);
  },
  async analyze(ctx) {
    const th = ctx.th('working-capital');
    const m = ctx.run.modeId;
    const res: FauWcResult = { mode: m as FauWcResult['mode'] };
    const last = latestActual(ctx.rows<'fin_metrics'>('metrics'));
    const days = last?.days || periodDays(ctx.project.period);
    const inv = ctx.rows<'inventory'>('inventory');
    const reminders: FauReminder[] = [];
    if (m === 'ccc') {
      res.ccc = await step(ctx, 'ccc', () => cccMetrics({ ar: ctx.rows<'ar'>('ar'), ap: ctx.rows<'ap'>('ap'), inventory: inv, metrics: last, days, asOf: asOf(ctx) }));
      if (inv.length) res.inventory = await step(ctx, 'inventory', () => inventoryAbc(inv, asOf(ctx), th)); else ctx.progress('inventory', 'skipped');
    } else if (m === 'inventory') {
      res.inventory = await step(ctx, 'inventory', () => inventoryAbc(inv, asOf(ctx), th));
    } else {
      res.suppliers = await step(ctx, 'suppliers', () => supplierTerms(ctx.rows<'ap'>('ap'), asOf(ctx), th));
      res.scf = await step(ctx, 'scf', () => scfOptions({ ar: ctx.rows<'ar'>('ar'), ap: ctx.rows<'ap'>('ap'), inventory: sum(inv.map((x) => x.amount)) || (last?.inventory ?? 0), cogs: last?.cogs ?? 0, days, asOf: asOf(ctx), th }));
      for (const s of res.suppliers.filter((x) => x.status !== 'ok')) reminders.push({ id: `sup:${s.supplier}`, source: 'engine', level: 'warn', message: { key: i18nKey('供应商 {p0} 应付占比 {p1}%，集中度偏高'), params: { p0: s.supplier, p1: (s.share * 100).toFixed(1) } } });
    }
    if (res.inventory?.obsolete) reminders.push({ id: 'inv_obsolete', source: 'engine', level: 'warn', message: { key: i18nKey('过时存货 {p0}，评估跌价准备'), params: { p0: (res.inventory.obsolete / 100).toFixed(2) } } });
    const summary: FauMsg = res.ccc?.ccc != null
      ? { key: i18nKey('现金转换周期 {p0} 天'), params: { p0: res.ccc.ccc.toFixed(1) } }
      : res.inventory ? { key: i18nKey('可释放资金占用 {p0}'), params: { p0: (res.inventory.release / 100).toFixed(2) } } : { key: i18nKey('{n} 家供应商'), params: { n: res.suppliers?.length || 0 } };
    return done(res, reminders, summary);
  },
  async draft(ctx) {
    return artifacts(ctx, writeWcOutputs(octx(ctx), ctx.run.result as FauWcResult, extra(ctx)));
  },
};

// ── E7 投融资 ──

const LIQ_BREACH: Record<string, string> = {
  current: i18nKey('流动比率越线'), quick: i18nKey('速动比率越线'), coverage: i18nKey('现金对一年内到期债务的覆盖越线'), facility: i18nKey('授信使用率越线'),
};

export const investmentsRunner: ModuleRunner = {
  subSteps: (m) => subs(m === 'portfolio' ? ['portfolio', 'narrative'] : ['liquidity', 'narrative']),
  async validate(ctx) {
    const r = new Report();
    if (ctx.run.modeId === 'portfolio') {
      const inv = ctx.rows<'investment'>('investments');
      nonEmpty(r, ctx, 'investments', inv);
      r.add('risk_rating', inv.every((x) => x.riskRating != null), 'warn', { key: i18nKey('{n} 个投资没有风险等级，不做等级合规判断'), params: { n: inv.filter((x) => x.riskRating == null).length } });
    } else {
      nonEmpty(r, ctx, 'balances', ctx.rows<'bank_balance'>('balances'));
      const last = latestActual(ctx.rows<'fin_metrics'>('metrics'));
      r.add('ca_cl', !!last?.currentAssets && !!last?.currentLiabilities, 'warn', { key: i18nKey('财务指标表缺流动资产或流动负债，流动比率不计算') });
    }
    return r.done(ctx, ['investments', 'balances', 'loans', 'facilities', 'metrics']);
  },
  async analyze(ctx) {
    const th = ctx.th('investments');
    const res: FauInvestResult = { mode: ctx.run.modeId as FauInvestResult['mode'], narrative: [] };
    const reminders: FauReminder[] = [];
    let narrativeArgs: Parameters<typeof writeNarrative>[1];
    if (res.mode === 'portfolio') {
      const p = await step(ctx, 'portfolio', () => portfolio(ctx.rows<'investment'>('investments'), asOf(ctx), th));
      res.portfolio = p;
      for (const l of p.lines.filter((x) => x.status === 'breach')) reminders.push({ id: `inv:${l.id}`, source: 'escalation', level: 'warn', message: { key: i18nKey('投资 {p0}（{p1}）越线，须 CFO 审批处置'), params: { p0: l.id, p1: l.product } } });
      for (const i of p.issuers.filter((x) => x.status === 'breach')) reminders.push({ id: `iss:${i.issuer}`, source: 'engine', level: 'warn', message: { key: i18nKey('发行人 {p0} 占比 {p1}%，集中度越线'), params: { p0: i.issuer, p1: (i.share * 100).toFixed(1) } } });
      narrativeArgs = {
        kind: 'portfolio', skill: 'fa-investment-portfolio-review', topics: ['portfolio_review'],
        facts: {
          cost: major(p.totals.cost), marketValue: major(p.totals.marketValue), pnl: major(p.totals.pnl), weightedYieldPct: pct(p.weightedYield),
          positions: p.lines.map((l) => ({ id: l.id, product: l.product, issuer: l.issuer, cost: major(l.cost), marketValue: major(l.marketValue), pnl: major(l.pnl), pnlPct: pct(l.pnlPct), riskRating: l.riskRating, status: l.status })),
          issuers: p.issuers.map((i) => ({ issuer: i.issuer, marketValue: major(i.marketValue), sharePct: pct(i.share), status: i.status })),
          ladder: Object.fromEntries(p.ladder.map((x) => [x.bucket, major(x.marketValue)])),
        },
        userData: p.lines.flatMap((l) => [l.id, l.product, l.issuer]),
      };
    } else {
      const last = latestActual(ctx.rows<'fin_metrics'>('metrics'));
      const l = await step(ctx, 'liquidity', () => liquidity({
        balances: localBalances(ctx), investments: ctx.rows<'investment'>('investments'), loans: ctx.rows<'loan'>('loans'),
        facilities: ctx.rows<'credit_facility'>('facilities'), metrics: last, asOf: asOf(ctx), th,
      }));
      res.liquidity = l;
      for (const [k, s] of Object.entries(l.statuses)) if (s === 'breach') reminders.push({ id: `liq:${k}`, source: 'escalation', level: 'warn', message: { key: LIQ_BREACH[k] } });
      narrativeArgs = {
        kind: 'liquidity', skill: 'fa-liquidity-assessment', topics: ['liquidity_view'],
        facts: {
          cash: major(l.cash), liquidInvestments: major(l.liquidInvestments), unusedFacilities: major(l.unusedFacilities), availableLiquidity: major(l.available), debtDue12m: major(l.debtDue12m),
          currentRatio: l.currentRatio == null ? null : Math.round(l.currentRatio * 100) / 100, quickRatio: l.quickRatio == null ? null : Math.round(l.quickRatio * 100) / 100,
          coverage: l.coverage == null ? null : Math.round(l.coverage * 100) / 100, facilityUtilizationPct: pct(l.facilityUtilization), statuses: l.statuses,
        },
        userData: [],
      };
    }
    const out = await step(ctx, 'narrative', () => writeNarrative(ctx, narrativeArgs));
    res.narrative = out.narrative;
    const summary: FauMsg = res.portfolio
      ? { key: i18nKey('市值 {p0}，浮动盈亏 {p1}'), params: { p0: (res.portfolio.totals.marketValue / 100).toFixed(2), p1: (res.portfolio.totals.pnl / 100).toFixed(2) } }
      : { key: i18nKey('可用流动性 {p0}'), params: { p0: ((res.liquidity?.available || 0) / 100).toFixed(2) } };
    return done(res, reminders, summary, { verification: out.verification, model: out.model });
  },
  async draft(ctx) {
    return artifacts(ctx, writeInvestOutputs(octx(ctx), ctx.run.result as FauInvestResult, extra(ctx)));
  },
};
