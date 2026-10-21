/**
 * E1–E7 产出（第 10 节）：底稿 xlsx（封面与签核页 + 计算 sheet + Checks，第 1 行草稿警示、阿语 RTL、联动处写公式）
 * 与说明 docx（摘要 / 模型说明（带回核状态）/ 发现与建议 / 边界；页眉「草稿，非审计 / 鉴证意见」、阿语 bidi）。
 * 表头、sheet 名、固定说明全部按输出语言（tIn）；用户数据（账户、单位、产品名）原样保留。
 */
import { join } from 'node:path';
import { i18nKey } from '@totalclaw/i18n';
import type {
  FauCashForecast, FauCashPosition, FauCashResult, FauEclResult, FauFinancingResult, FauFxResult, FauInvestResult, FauPaymentPlan,
  FauReminder, FauTreasuryNarrative, FauTreasuryResult, FauWcResult,
} from '@totalclaw/ipc-contracts';
import {
  AGING_BUCKET_LABEL, AUTH_ADVICE_LABEL, BANK_TIER_LABEL, COVENANT_METRIC_LABEL, COVENANT_OP_LABEL, ECL_REASON_LABEL, ECL_STAGE_LABEL,
  FLOW_CERTAINTY_LABEL, FLOW_SOURCE_LABEL, FX_CERTAINTY_LABEL, FX_SIDE_LABEL, GAP_TIER_LABEL, INVEST_BUCKET_LABEL, INVEST_TYPE_LABEL,
  INV_AGING_LABEL, LIQ_CATEGORY_LABEL, LOAN_INSTRUMENT_LABEL, MATURITY_BUCKET_LABEL, PAY_PLAN_LABEL, RAG_LABEL, RECON3_LABEL, SCENARIO_LABEL, SCF_LABEL,
} from '../../../../../shared/financeAudit/treasuryLabels';
import { OUT, fmtAmount, fmtPct, labeler, outputFileName, type L } from '../../outputs/common';
import { coverRows, type OutputCtx } from '../../outputs/close';
import { addr, major, planSheetNames, ref, writeWorkbookFile, type XCell } from '../../outputs/xlsx';
import { writeDocxFile, type DocSection } from '../../outputs/docx';

export type { OutputCtx };
interface Sheet { name: string; headers?: string[]; rows: XCell[][] }
type Check = [label: string, value: XCell];

const R4 = (x: number | null | undefined): number | null => (x == null || !Number.isFinite(x) ? null : Math.round(x * 10000) / 10000);
const R2 = (x: number | null | undefined): number | null => (x == null || !Number.isFinite(x) ? null : Math.round(x * 100) / 100);

/** 一本底稿：封面与签核页 + 计算 sheet + Checks；表名先定好，公式里引用 */
function workbook(ctx: OutputCtx, title: string, sheets: (names: string[]) => Sheet[], sheetTitles: string[], checks: (names: string[]) => Check[], levels: string[]): string {
  const t = labeler(ctx.locale);
  const names = planSheetNames([t(i18nKey('封面与签核页')), ...sheetTitles.map((k) => t(k)), 'Checks']);
  const banner = t(OUT.draft);
  const body = sheets(names);
  const path = join(ctx.dir, outputFileName(ctx.moduleCode, t(title), ctx.period, 'xlsx', ctx.at));
  writeWorkbookFile(path, [
    { name: names[0], banner, rows: coverRows(ctx, t, t(title), levels) },
    ...body.map((s, i) => ({ name: names[i + 1], banner, headers: s.headers?.map((h) => t(h)), rows: s.rows })),
    { name: names[names.length - 1], banner, headers: [t(OUT.check), t(OUT.result)], rows: checks(names).map(([k, v]) => [t(k), v]) },
  ], { rtl: ctx.locale === 'ar' });
  return path;
}

function narrativeSection(t: L, ns: FauTreasuryNarrative[]): DocSection {
  return {
    heading: t(i18nKey('模型说明（数字已回核）')),
    paragraphs: ns.length ? ns.map((n) => `${t(n.topic)}${n.status === 'verified' ? '' : ` [${t(OUT.unverified)}]`}: ${n.text}`) : [t(i18nKey('无'))],
  };
}

function memo(ctx: OutputCtx, title: string, sections: DocSection[], reminders: FauReminder[], boundary: string[]): string {
  const t = labeler(ctx.locale);
  const path = join(ctx.dir, outputFileName(ctx.moduleCode, t(title), ctx.period, 'docx', ctx.at));
  writeDocxFile(path, {
    title: t(title), subtitle: `${ctx.companyName} · ${ctx.period}`,
    meta: [[t(OUT.project), ctx.projectName], [t(OUT.module), `${ctx.moduleCode} ${t(ctx.moduleName)}`], [t(OUT.mode), t(ctx.modeName)]],
    header: t(OUT.notOpinion), watermark: t(OUT.draft), rtl: ctx.locale === 'ar',
    sections: [
      ...sections,
      { heading: t(i18nKey('发现与建议')), paragraphs: reminders.length ? reminders.map((r) => `• ${t(r.message.key, r.message.params)}`) : [t(i18nKey('无'))] },
      { heading: t(i18nKey('边界')), paragraphs: [t(OUT.boundary), ...boundary.map((b) => t(b))] },
    ],
  });
  return path;
}

const PAY_BOUNDARY = i18nKey('付款计划与授权意见只是草稿和建议：本工作台不付款、不审批付款，付款由有权人在网银或资金系统里完成。');
const FX_BOUNDARY = i18nKey('对冲方案与询价单只是草稿：本工作台不下单、不成交、不确认交易，是否交易由有权人在银行渠道完成。');

// ── E1 / E2 资金头寸 ──

function positionSheet(p: FauCashPosition, t: L): Sheet {
  return {
    name: i18nKey('资金日报'),
    headers: [i18nKey('银行账号'), i18nKey('开户银行'), i18nKey('主体'), i18nKey('币种'), i18nKey('银行余额'), i18nKey('账面余额'), i18nKey('资金系统余额'), i18nKey('最大差额'), i18nKey('三方核对'), i18nKey('受限金额'), i18nKey('可用余额'), i18nKey('安全线'), i18nKey('低于安全线'), OUT.row],
    rows: p.accounts.map((a) => [a.account, a.bank, a.entity, a.currency, major(a.bankBalance), major(a.bookBalance), major(a.systemBalance), major(a.maxDiff),
      a.sources < 2 ? t(i18nKey('来源不足，未核对')) : t(RECON3_LABEL[a.status]), major(a.restricted), major(a.available), major(a.safetyLine), a.belowSafety ? t(i18nKey('是')) : '', a.row]),
  };
}

function forecastSheets(f: FauCashForecast, t: L): Sheet[] {
  const R0 = 2;
  const scen = f.scenarios.map((s) => ({
    name: SCENARIO_LABEL[s.id],
    headers: [i18nKey('周'), i18nKey('起'), i18nKey('止'), i18nKey('期初余额'), i18nKey('流入'), i18nKey('流出'), i18nKey('净流量'), i18nKey('期末余额')],
    rows: s.weeks.map((w, i) => {
      const r = R0 + i;
      return [w.week, w.start, w.end, i === 0 ? major(w.opening) : { f: addr(r - 1, 7), v: major(w.opening) ?? 0 }, major(w.inflow), major(w.outflow),
        { f: `ROUND(${addr(r, 4)}-${addr(r, 5)},2)`, v: major(w.net) ?? 0 }, { f: `ROUND(${addr(r, 3)}+${addr(r, 4)}-${addr(r, 5)},2)`, v: major(w.closing) ?? 0 }] as XCell[];
    }),
  }));
  const lines: Sheet = {
    name: i18nKey('预测明细（基准）'),
    headers: [i18nKey('来源'), i18nKey('类别'), i18nKey('确定性'), ...f.scenarios[1].weeks.map((w) => `W${w.week}`), i18nKey('合计')],
    rows: f.lines.map((l) => [t(FLOW_SOURCE_LABEL[l.source]), l.category, t(FLOW_CERTAINTY_LABEL[l.certainty]), ...l.weeks.map((x) => major(x)), major(l.total)]),
  };
  const summary: Sheet = {
    name: i18nKey('三情景汇总'),
    headers: [i18nKey('情景'), i18nKey('非确定流入系数'), i18nKey('非确定流出系数'), i18nKey('合计流入'), i18nKey('合计流出'), i18nKey('期末余额'), i18nKey('最低余额'), i18nKey('首个缺口周'), i18nKey('最大缺口')],
    rows: [
      ...f.scenarios.map((s) => [t(SCENARIO_LABEL[s.id]), s.inFactor, s.outFactor, major(s.totalIn), major(s.totalOut), major(s.endBalance), major(s.minBalance), s.firstGapWeek ?? '', major(s.maxGap)] as XCell[]),
      [],
      [t(i18nKey('期初余额')), major(f.opening)],
      [t(i18nKey('缺口分档（基准）')), t(GAP_TIER_LABEL[f.gapTier])],
      [t(i18nKey('可用授信')), major(f.facilityAvailable)],
      [t(i18nKey('悲观情景需新增融资')), major(f.financingNeed)],
      [t(i18nKey('13 周以外未计入的笔数')), f.beyond],
      [],
      [t(i18nKey('单一付款方集中度')), t(i18nKey('金额')), t(i18nKey('占比')), t(i18nKey('状态'))],
      ...f.concentration.map((c) => [c.counterparty, major(c.amount), R4(c.share), t(RAG_LABEL[c.status])] as XCell[]),
    ],
  };
  return [summary, ...scen, lines];
}

function forecastChecks(f: FauCashForecast, names: string[], firstScenSheet: number): Check[] {
  return f.scenarios.map((s, i) => {
    const sheet = names[firstScenSheet + i];
    const last = 2 + s.weeks.length - 1;
    return [i18nKey('期初 + 流入 − 流出 = 期末（逐周勾稽）'), { f: `ROUND(${ref(sheet, 2, 3)}+SUM(${ref(sheet, 2, 4)}:${addr(last, 4)})-SUM(${ref(sheet, 2, 5)}:${addr(last, 5)})-${ref(sheet, last, 7)},2)=0`, v: f.opening + s.totalIn - s.totalOut === s.endBalance }] as Check;
  });
}

function paymentSheet(p: FauPaymentPlan, t: L): Sheet {
  return {
    name: i18nKey('付款计划草稿'),
    headers: [i18nKey('申请单号'), i18nKey('收款方'), i18nKey('付款金额'), i18nKey('到期日'), i18nKey('付款类别'), i18nKey('优先级'), i18nKey('计划'), i18nKey('累计占用'), i18nKey('提示'), OUT.row],
    rows: [
      ...p.lines.map((l) => [l.id, l.payee, major(l.amount), l.dueDate, l.category, l.priority, t(PAY_PLAN_LABEL[l.plan]), l.plan === 'hold' ? '' : major(l.cumulative), l.flags.map((f) => t(f.key, f.params)).join('; '), l.row] as XCell[]),
      [],
      [t(i18nKey('可用资金')), major(p.available)],
      [t(i18nKey('排入计划')), major(p.scheduled)],
      [t(i18nKey('延后')), major(p.deferred)],
      [t(i18nKey('暂停核实')), major(p.held)],
      [t(i18nKey('P0 资金缺口')), major(p.gap)],
    ],
  };
}

export function writeCashOutputs(ctx: OutputCtx, res: FauCashResult, extra: { levels: string[]; reminders: FauReminder[] }): { path: string; title: string }[] {
  const t = labeler(ctx.locale);
  if (res.mode === 'daily' && res.position) {
    const p = res.position;
    const path = workbook(ctx, i18nKey('资金日报'), () => [positionSheet(p, t)], [i18nKey('资金日报')], () => [
      [i18nKey('可用余额 = 银行余额 − 受限金额（逐户）'), p.accounts.every((a) => a.available === a.bankBalance - a.restricted)],
      [i18nKey('没有三方差异较大的账户'), p.accounts.every((a) => a.status !== 'breach')],
    ], extra.levels);
    return [{ path, title: i18nKey('资金日报') }];
  }
  if (res.mode === 'forecast' && res.forecast) {
    const f = res.forecast;
    const sheets = forecastSheets(f, t);
    const path = workbook(ctx, i18nKey('13 周现金预测'), () => sheets, sheets.map((s) => s.name), (names) => forecastChecks(f, names, 2), extra.levels);
    return [{ path, title: i18nKey('13 周现金预测') }];
  }
  const p = res.payments!;
  const path = workbook(ctx, i18nKey('付款计划草稿'), () => [paymentSheet(p, t)], [i18nKey('付款计划草稿')], () => [
    [i18nKey('暂停核实的付款没有排入计划'), p.lines.filter((l) => l.plan === 'hold').every((l) => l.cumulative === 0)],
    [PAY_BOUNDARY, true],
  ], extra.levels);
  return [{ path, title: i18nKey('付款计划草稿') }];
}

// ── E2 司库 ──

export function writeTreasuryOutputs(ctx: OutputCtx, res: FauTreasuryResult, extra: { levels: string[]; reminders: FauReminder[] }): { path: string; title: string; kind?: 'docx' }[] {
  const t = labeler(ctx.locale);
  const out: { path: string; title: string; kind?: 'docx' }[] = [];
  const summary: string[] = [];
  if (res.mode === 'position' && res.position && res.forecast) {
    const sheets = [positionSheet(res.position, t), ...forecastSheets(res.forecast, t)];
    out.push({ path: workbook(ctx, i18nKey('资金日报与预测'), () => sheets, sheets.map((s) => s.name), (names) => forecastChecks(res.forecast!, names, 3), extra.levels), title: i18nKey('资金日报与预测') });
    summary.push(t(i18nKey('本位币可用余额 {p0}；悲观情景最大缺口 {p1}'), { p0: fmtAmount(res.position.totals.available, ctx.locale), p1: fmtAmount(res.forecast.scenarios[2].maxGap, ctx.locale) }));
  }
  if (res.authorizations) {
    const rows = res.authorizations.map((a) => [a.id, a.payee, major(a.amount), t(AUTH_ADVICE_LABEL[a.advice]), a.large ? t(i18nKey('是')) : '', major(a.balanceAfter),
      a.checks.filter((c) => !c.ok).map((c) => t(c.message.key, c.message.params)).join('; '), a.row] as XCell[]);
    out.push({
      path: workbook(ctx, i18nKey('付款授权复核意见'), () => [{ name: i18nKey('授权复核'), headers: [i18nKey('申请单号'), i18nKey('收款方'), i18nKey('付款金额'), i18nKey('复核建议'), i18nKey('大额'), i18nKey('付款后余额'), i18nKey('问题'), OUT.row], rows }],
        [i18nKey('授权复核')], () => [[i18nKey('复核结论中没有「批准」'), res.authorizations!.every((a) => (a.advice as string) !== 'approve')], [PAY_BOUNDARY, true]], extra.levels),
      title: i18nKey('付款授权复核意见'),
    });
    summary.push(...res.authorizations.map((a) => `${a.id} ${a.payee} ${fmtAmount(a.amount, ctx.locale)}: ${t(AUTH_ADVICE_LABEL[a.advice])}`));
  }
  if (res.pool) {
    const p = res.pool;
    const rows: XCell[][] = [
      [p.header, '', '', '', '', '', t(i18nKey('主账户'))],
      ...p.accounts.map((a) => [a.account, a.entity, a.bank, major(a.balance), major(a.restricted), major(a.target), major(a.sweep), R4(a.rate)] as XCell[]),
      [],
      [t(i18nKey('上划合计')), major(p.sweepUp)], [t(i18nKey('下拨合计')), major(p.sweepDown)], [t(i18nKey('归集后可调度资金')), major(p.pooled)],
      [t(i18nKey('年化利息增益估算')), major(p.interestGain)], [t(i18nKey('归集资金运用收益率')), R4(p.investRate)],
      ...p.excluded.map((e) => [e.account, t(e.reason.key, e.reason.params)] as XCell[]),
    ];
    out.push({ path: workbook(ctx, i18nKey('现金池方案'), () => [{ name: i18nKey('现金池方案'), headers: [i18nKey('银行账号'), i18nKey('主体'), i18nKey('开户银行'), i18nKey('余额'), i18nKey('受限金额'), i18nKey('留存目标'), i18nKey('上划 / 下拨'), i18nKey('存款利率')], rows }], [i18nKey('现金池方案')], () => [[i18nKey('上划合计 = 各账户上划之和'), p.sweepUp === p.accounts.filter((a) => a.sweep > 0).reduce((x, a) => x + a.sweep, 0)]], extra.levels), title: i18nKey('现金池方案') });
    summary.push(t(i18nKey('归集后可调度资金 {p0}，年化利息增益估算 {p1}'), { p0: fmtAmount(p.pooled, ctx.locale), p1: fmtAmount(p.interestGain, ctx.locale) }));
  }
  if (res.banks) {
    const rows = res.banks.map((b) => [b.bank, major(b.limit), major(b.used), R4(b.utilization), R4(b.rate), major(b.deposits), R4(b.volumeShare), R2(b.scores.volume), R2(b.scores.rate), R2(b.scores.response), R2(b.scores.innovation), R2(b.scores.cooperation), R2(b.total), t(BANK_TIER_LABEL[b.tier]), b.expiry, b.flags.map((f) => t(f.key, f.params)).join('; ')] as XCell[]);
    out.push({ path: workbook(ctx, i18nKey('银行关系评分'), () => [{ name: i18nKey('银行关系评分'), headers: [i18nKey('银行'), i18nKey('授信额度'), i18nKey('已用额度'), i18nKey('授信使用率'), i18nKey('利率'), i18nKey('存款'), i18nKey('业务量占比'), i18nKey('业务量分'), i18nKey('利率分'), i18nKey('响应速度'), i18nKey('产品创新'), i18nKey('合作意愿'), i18nKey('综合评分'), i18nKey('分级'), i18nKey('授信到期日'), i18nKey('提示')], rows }], [i18nKey('银行关系评分')], () => [[i18nKey('业务量占比合计为 100%'), Math.abs(res.banks!.reduce((s, b) => s + b.volumeShare, 0) - 1) < 1e-9 || !res.banks!.length]], extra.levels), title: i18nKey('银行关系评分') });
  }
  if (res.liquidity) {
    const l = res.liquidity;
    const lines = l.lines.map((x) => [x.item, t(LIQ_CATEGORY_LABEL[x.category]), major(x.amount), R4(x.factor), major(x.weighted), x.row] as XCell[]);
    out.push({
      path: workbook(ctx, i18nKey('LCR 与 NSFR 测算'), () => [
        { name: i18nKey('明细'), headers: [i18nKey('项目'), i18nKey('类别'), i18nKey('金额'), i18nKey('折算率 / 流失率'), i18nKey('折算后'), OUT.row], rows: lines },
        { name: i18nKey('计算'), headers: [i18nKey('项目'), i18nKey('金额')], rows: [
          [t(LIQ_CATEGORY_LABEL.hqla_l1), major(l.hqla.l1)], [t(LIQ_CATEGORY_LABEL.hqla_l2a), major(l.hqla.l2a)], [t(LIQ_CATEGORY_LABEL.hqla_l2b), major(l.hqla.l2b)],
          [t(i18nKey('二级 B 15% 上限调整')), major(l.hqla.adj15)], [t(i18nKey('二级资产 40% 上限调整')), major(l.hqla.adj40)],
          [t(i18nKey('优质流动性资产合计')), { f: `ROUND(${addr(2, 1)}+${addr(3, 1)}+${addr(4, 1)}-${addr(5, 1)}-${addr(6, 1)},2)`, v: major(l.hqla.total) ?? 0 }],
          [t(i18nKey('30 天现金流出')), major(l.outflows)], [t(i18nKey('30 天现金流入（封顶后）')), major(l.inflowsCapped)],
          [t(i18nKey('净现金流出')), { f: `ROUND(${addr(8, 1)}-${addr(9, 1)},2)`, v: major(l.netOutflows) ?? 0 }],
          ['LCR', l.netOutflows > 0 ? { f: `ROUND(${addr(7, 1)}/${addr(10, 1)},4)`, v: R4(l.lcr) ?? 0 } : ''],
          [t(i18nKey('可用稳定资金')), major(l.asf)], [t(i18nKey('所需稳定资金')), major(l.rsf)], ['NSFR', R4(l.nsfr)],
        ] },
      ], [i18nKey('明细'), i18nKey('计算')], () => [[i18nKey('LCR 达到最低要求'), l.lcrStatus !== 'breach'], [i18nKey('NSFR 达到最低要求'), l.nsfrStatus !== 'breach']], extra.levels),
      title: i18nKey('LCR 与 NSFR 测算'),
    });
    summary.push(`LCR ${fmtPct(l.lcr, ctx.locale)} · NSFR ${fmtPct(l.nsfr, ctx.locale)}`);
  }
  if (res.mode === 'authorization' || res.mode === 'cash_pool') {
    const title = res.mode === 'authorization' ? i18nKey('付款授权复核意见') : i18nKey('现金池方案');
    out.push({ path: memo(ctx, title, [{ heading: t(i18nKey('摘要')), paragraphs: summary }, narrativeSection(t, res.narrative)], extra.reminders, [PAY_BOUNDARY]), title, kind: 'docx' });
  }
  return out;
}

// ── E3 外汇 ──

export function writeFxOutputs(ctx: OutputCtx, res: FauFxResult, extra: { levels: string[]; reminders: FauReminder[] }): { path: string; title: string; kind?: 'docx' }[] {
  const t = labeler(ctx.locale);
  const exp = res.exposures.map((e) => [e.currency, e.rate, major(e.transaction), major(e.translation), major(e.economic), major(e.transactionLocal), major(e.translationLocal), major(e.economicLocal),
    major(e.layers.firm), major(e.layers.highly_probable), major(e.layers.possible), major(e.hedged), major(e.hedgeTarget), major(e.hedgeNeed), R4(e.hedgeRatio), R4(e.share), e.overLimit ? t(i18nKey('是')) : ''] as XCell[]);
  const sens = res.exposures.flatMap((e) => e.sensitivity.map((s) => [e.currency, R4(s.shock), major(s.impact)] as XCell[]));
  const exposurePath = workbook(ctx, i18nKey('外汇敞口表'), () => [
    { name: i18nKey('敞口'), headers: [i18nKey('币种'), i18nKey('汇率'), i18nKey('交易敞口（外币）'), i18nKey('会计敞口（外币）'), i18nKey('经济敞口（外币）'), i18nKey('交易敞口（本位币）'), i18nKey('会计敞口（本位币）'), i18nKey('经济敞口（本位币）'), FX_CERTAINTY_LABEL.firm, FX_CERTAINTY_LABEL.highly_probable, FX_CERTAINTY_LABEL.possible, i18nKey('已对冲'), i18nKey('目标对冲额'), i18nKey('还需对冲'), i18nKey('已对冲比例'), i18nKey('占比'), i18nKey('超限额')], rows: exp },
    { name: i18nKey('敏感性'), headers: [i18nKey('币种'), i18nKey('汇率变动'), i18nKey('对本位币的影响')], rows: sens },
  ], [i18nKey('敞口'), i18nKey('敏感性')], () => [
    [i18nKey('还需对冲 = 目标对冲额 − 已对冲'), res.exposures.every((e) => e.hedgeNeed === e.hedgeTarget - e.hedged)],
  ], extra.levels);
  const rfqRows = res.rfq.map((q) => [q.id, q.currency, t(FX_SIDE_LABEL[q.side]), major(q.notional), q.valueMonth, t(i18nKey('远期')), t(FX_CERTAINTY_LABEL[q.layer]), '', '', ''] as XCell[]);
  const rfqPath = workbook(ctx, i18nKey('询价单草稿'), () => [
    { name: i18nKey('询价单草稿'), headers: [i18nKey('编号'), i18nKey('币种'), i18nKey('方向'), i18nKey('名义本金（外币）'), i18nKey('交割月份'), i18nKey('工具'), i18nKey('覆盖的敞口层级'), i18nKey('银行报价（由人填写）'), i18nKey('询价银行'), i18nKey('询价时间')], rows: [...rfqRows, [], [t(FX_BOUNDARY)]] },
  ], [i18nKey('询价单草稿')], () => [[FX_BOUNDARY, true]], extra.levels);
  const memoPath = memo(ctx, i18nKey('外汇对冲方案'), [
    { heading: t(i18nKey('摘要')), paragraphs: res.exposures.map((e) => t(i18nKey('{p0}：交易敞口 {p1}（外币），目标对冲 {p2}，还需对冲 {p3}'), { p0: e.currency, p1: fmtAmount(e.transaction, ctx.locale), p2: fmtAmount(e.hedgeTarget, ctx.locale), p3: fmtAmount(e.hedgeNeed, ctx.locale) })) },
    narrativeSection(t, res.narrative),
    { heading: t(i18nKey('询价单草稿')), table: { headers: [t(i18nKey('币种')), t(i18nKey('方向')), t(i18nKey('名义本金（外币）')), t(i18nKey('交割月份'))], rows: res.rfq.map((q) => [q.currency, t(FX_SIDE_LABEL[q.side]), fmtAmount(q.notional, ctx.locale), q.valueMonth]) } },
  ], extra.reminders, [FX_BOUNDARY]);
  return [{ path: exposurePath, title: i18nKey('外汇敞口表') }, { path: rfqPath, title: i18nKey('询价单草稿') }, { path: memoPath, title: i18nKey('外汇对冲方案'), kind: 'docx' }];
}

// ── E4 融资 ──

export function writeFinancingOutputs(ctx: OutputCtx, res: FauFinancingResult, extra: { levels: string[]; reminders: FauReminder[] }): { path: string; title: string; kind?: 'docx' }[] {
  const t = labeler(ctx.locale);
  const sheets: Sheet[] = [];
  const titles: string[] = [];
  const summary: string[] = [];
  if (res.cost) {
    const c = res.cost;
    sheets.push({ name: i18nKey('融资成本'), headers: [i18nKey('合同编号'), i18nKey('贷款人'), i18nKey('融资类型'), i18nKey('本金余额'), i18nKey('利率'), i18nKey('费率'), i18nKey('期限（年）'), i18nKey('综合成本'), i18nKey('税后成本'), i18nKey('到期日'), i18nKey('剩余年限'), OUT.row],
      rows: [
        ...c.loans.map((l) => [l.id, l.lender, t(LOAN_INSTRUMENT_LABEL[l.instrument] || l.instrument), major(l.principal), R4(l.rate), R4(l.feeRate), R2(l.tenorYears), R4(l.allIn), R4(l.afterTax), l.maturity, R2(l.remainingYears), l.row] as XCell[]),
        [], [t(i18nKey('有息负债合计')), major(c.debt)], [t(i18nKey('税前债务成本')), R4(c.kdPreTax)], [t(i18nKey('税后债务成本')), R4(c.kdAfterTax)],
        [t(i18nKey('无风险利率')), R4(c.rf)], ['Beta', c.beta], [t(i18nKey('市场风险溢价')), R4(c.erp)], [t(i18nKey('股权成本')), R4(c.ke)], [t(i18nKey('权益价值')), major(c.equity)], ['WACC', R4(c.wacc)],
        [], [t(i18nKey('到期分布')), t(i18nKey('金额'))], ...c.maturity.map((m) => [t(MATURITY_BUCKET_LABEL[m.bucket]), major(m.amount)] as XCell[]),
      ] });
    titles.push(i18nKey('融资成本'));
    summary.push(t(i18nKey('有息负债 {p0}，税后债务成本 {p1}，WACC {p2}'), { p0: fmtAmount(c.debt, ctx.locale), p1: fmtPct(c.kdAfterTax, ctx.locale), p2: fmtPct(c.wacc, ctx.locale) }));
  }
  if (res.covenants) {
    sheets.push({ name: i18nKey('契约监控'), headers: [i18nKey('贷款人'), i18nKey('条款'), i18nKey('指标'), i18nKey('比较方向'), i18nKey('限值'), i18nKey('期间'), i18nKey('是否预测'), i18nKey('当前值'), i18nKey('缓冲空间'), i18nKey('状态')],
      rows: res.covenants.flatMap((c) => c.values.map((v) => [c.lender, c.name, t(COVENANT_METRIC_LABEL[c.metric]), COVENANT_OP_LABEL[c.op], c.metric === 'net_worth' ? major(c.limit) : c.limit, v.period, v.forecast ? t(i18nKey('预测')) : t(i18nKey('实际')), c.metric === 'net_worth' ? major(v.value) : R4(v.value), R4(v.headroom), t(RAG_LABEL[v.status])] as XCell[])) });
    titles.push(i18nKey('契约监控'));
    summary.push(...res.covenants.map((c) => `${c.lender} · ${c.name}: ${t(RAG_LABEL[c.current])}${c.firstBreach ? ` · ${t(i18nKey('最早越线期间 {p0}'), { p0: c.firstBreach })}` : ''}`));
  }
  const title = res.mode === 'covenant' ? i18nKey('契约监控表') : res.mode === 'restructure' ? i18nKey('债务重组方案') : i18nKey('融资成本表');
  const xlsx = workbook(ctx, title, () => sheets, titles, () => [
    ...(res.cost ? [[i18nKey('各笔本金之和 = 有息负债合计'), res.cost.loans.reduce((s, l) => s + l.principal, 0) === res.cost.debt] as Check] : []),
    ...(res.covenants ? [[i18nKey('当前没有越线的契约'), res.covenants.every((c) => c.current !== 'breach')] as Check] : []),
  ], extra.levels);
  const memoPath = memo(ctx, title, [{ heading: t(i18nKey('摘要')), paragraphs: summary }, narrativeSection(t, res.narrative)], extra.reminders, []);
  return [{ path: xlsx, title }, { path: memoPath, title, kind: 'docx' }];
}

// ── E5 ECL ──

export function writeEclOutputs(ctx: OutputCtx, res: FauEclResult, extra: { levels: string[]; reminders: FauReminder[] }): { path: string; title: string; kind?: 'docx' }[] {
  const t = labeler(ctx.locale);
  const scen: Sheet = {
    name: i18nKey('情景与权重'),
    headers: [i18nKey('情景'), i18nKey('权重'), i18nKey('PD 调整系数')],
    rows: [...res.scenarios.map((s) => [t(SCENARIO_LABEL[s.id] || s.name), s.weight, s.pdMultiplier] as XCell[]), [], [t(i18nKey('前瞻系数')), R4(res.forwardFactor)]],
  };
  const sheets: Sheet[] = [scen];
  const titles = [i18nKey('情景与权重')];
  if (res.lines) {
    const S0 = 3; // 情景 ECL 列起点
    sheets.push({
      name: i18nKey('阶段与计量'),
      headers: [i18nKey('敞口编号'), i18nKey('交易对手'), i18nKey('产品类型'), ...res.scenarios.map((s) => `ECL · ${t(SCENARIO_LABEL[s.id] || s.name)}`), i18nKey('违约敞口'), i18nKey('阶段'), i18nKey('上期阶段'), i18nKey('判定理由'), 'PD', 'LGD', i18nKey('折现因子'), i18nKey('加权 ECL'), i18nKey('覆盖率'), OUT.row],
      rows: res.lines.map((l, i) => {
        const r = 2 + i;
        const w = res.scenarios.map((s, k) => `${s.weight}*${addr(r, S0 + k)}`).join('+');
        return [l.id, l.counterparty, l.segment, ...res.scenarios.map((s) => major(l.ecl[s.id])), major(l.ead), t(ECL_STAGE_LABEL[l.stage]), l.priorStage ? t(ECL_STAGE_LABEL[l.priorStage]) : t(ECL_STAGE_LABEL[0]),
          l.reasons.map((x) => t(ECL_REASON_LABEL[x] || x)).join('; '), R4(l.pd), R4(l.lgd), R4(l.df), { f: `ROUND(${w},2)`, v: major(l.weighted) ?? 0 }, R4(l.coverage), l.row] as XCell[];
      }),
    });
    sheets.push({
      name: i18nKey('阶段汇总与迁移'),
      headers: [i18nKey('阶段'), i18nKey('笔数'), i18nKey('违约敞口'), i18nKey('加权 ECL'), i18nKey('覆盖率')],
      rows: [
        ...(res.stages || []).map((s) => [t(ECL_STAGE_LABEL[s.stage]), s.count, major(s.ead), major(s.ecl), R4(s.coverage)] as XCell[]),
        [], [t(i18nKey('上期阶段')), t(i18nKey('本期阶段')), t(i18nKey('笔数')), t(i18nKey('违约敞口'))],
        ...(res.migration || []).map((m) => [t(ECL_STAGE_LABEL[m.from]), t(ECL_STAGE_LABEL[m.to]), m.count, major(m.ead)] as XCell[]),
      ],
    });
    titles.push(i18nKey('阶段与计量'), i18nKey('阶段汇总与迁移'));
  }
  if (res.matrix) {
    sheets.push({
      name: i18nKey('简化法拨备矩阵'),
      headers: [i18nKey('账龄区间'), i18nKey('笔数'), i18nKey('应收余额'), i18nKey('损失率'), i18nKey('前瞻系数'), i18nKey('预期信用损失')],
      rows: res.matrix.map((m, i) => [t(AGING_BUCKET_LABEL[m.bucket]), m.count, major(m.amount), m.rate, R4(m.factor), { f: `ROUND(${addr(2 + i, 2)}*MIN(1,${addr(2 + i, 3)}*${addr(2 + i, 4)}),2)`, v: major(m.ecl) ?? 0 }] as XCell[]),
    });
    titles.push(i18nKey('简化法拨备矩阵'));
  }
  const xlsx = workbook(ctx, i18nKey('预期信用损失计量'), () => sheets, titles, () => [
    [i18nKey('情景权重合计为 100%'), res.weightsOk],
    [i18nKey('分阶段 ECL 之和 = ECL 合计'), res.stages ? res.stages.reduce((s, x) => s + x.ecl, 0) === res.totalEcl : (res.matrix || []).reduce((s, x) => s + x.ecl, 0) === res.totalEcl],
  ], extra.levels);
  const disclosure: DocSection[] = [
    { heading: t(i18nKey('计量方法与关键假设')), paragraphs: [
      t(res.mode === 'general' ? i18nKey('一般法：逾期 30 天以上、评级下调 2 级以上、投资级降为投机级或进入关注名单视为信用风险显著上升（第二阶段）；逾期 90 天以上、评级为违约或已发生信用减值为第三阶段。') : i18nKey('简化法：应收账款按账龄分档，按损失率与前瞻系数计提整个存续期的预期信用损失。')),
      t(i18nKey('前瞻性信息：{p0}'), { p0: res.scenarios.map((s) => `${t(SCENARIO_LABEL[s.id] || s.name)} ${fmtPct(s.weight, ctx.locale)} × ${s.pdMultiplier}`).join('; ') }),
    ] },
    res.stages ? { heading: t(i18nKey('按阶段的账面余额与损失准备')), table: { headers: [t(i18nKey('阶段')), t(i18nKey('违约敞口')), t(i18nKey('加权 ECL')), t(i18nKey('覆盖率'))], rows: res.stages.map((s) => [t(ECL_STAGE_LABEL[s.stage]), fmtAmount(s.ead, ctx.locale), fmtAmount(s.ecl, ctx.locale), fmtPct(s.coverage, ctx.locale)]) } }
      : { heading: t(i18nKey('拨备矩阵')), table: { headers: [t(i18nKey('账龄区间')), t(i18nKey('应收余额')), t(i18nKey('损失率')), t(i18nKey('预期信用损失'))], rows: (res.matrix || []).map((m) => [t(AGING_BUCKET_LABEL[m.bucket]), fmtAmount(m.amount, ctx.locale), fmtPct(m.rate, ctx.locale), fmtAmount(m.ecl, ctx.locale)]) } },
    ...(res.migration ? [{ heading: t(i18nKey('阶段迁移')), table: { headers: [t(i18nKey('上期阶段')), t(i18nKey('本期阶段')), t(i18nKey('笔数')), t(i18nKey('违约敞口'))], rows: res.migration.map((m) => [t(ECL_STAGE_LABEL[m.from]), t(ECL_STAGE_LABEL[m.to]), m.count, fmtAmount(m.ead, ctx.locale)]) } }] : []),
    { heading: t(i18nKey('摘要')), paragraphs: [t(i18nKey('违约敞口合计 {p0}，预期信用损失合计 {p1}'), { p0: fmtAmount(res.totalEad, ctx.locale), p1: fmtAmount(res.totalEcl, ctx.locale) })] },
  ];
  const memoPath = memo(ctx, i18nKey('预期信用损失披露草稿'), disclosure, extra.reminders, []);
  return [{ path: xlsx, title: i18nKey('预期信用损失计量') }, { path: memoPath, title: i18nKey('预期信用损失披露草稿'), kind: 'docx' }];
}

// ── E6 营运资本 ──

export function writeWcOutputs(ctx: OutputCtx, res: FauWcResult, extra: { levels: string[]; reminders: FauReminder[] }): { path: string; title: string; kind?: 'docx' }[] {
  const t = labeler(ctx.locale);
  const sheets: Sheet[] = [];
  const titles: string[] = [];
  const summary: string[] = [];
  if (res.ccc) {
    const c = res.ccc;
    sheets.push({ name: i18nKey('现金转换周期'), headers: [i18nKey('项目'), i18nKey('数值')], rows: [
      [t(i18nKey('期间天数')), c.days], [t(i18nKey('营业收入')), major(c.revenue)], [t(i18nKey('营业成本')), major(c.cogs)],
      [t(i18nKey('应收余额')), major(c.ar)], [t(i18nKey('存货余额')), major(c.inventory)], [t(i18nKey('应付余额')), major(c.ap)],
      ['DSO', R2(c.dso)], ['DIO', R2(c.dio)], ['DPO', R2(c.dpo)],
      ['CCC', c.ccc == null ? '' : { f: `ROUND(${addr(8, 1)}+${addr(9, 1)}-${addr(10, 1)},2)`, v: R2(c.ccc) ?? 0 }],
      [t(i18nKey('应收每缩短 1 天释放')), major(c.perDay.dso)], [t(i18nKey('存货每缩短 1 天释放')), major(c.perDay.dio)], [t(i18nKey('应付每延长 1 天保留')), major(c.perDay.dpo)],
      [t(i18nKey('逾期应收')), major(c.overdueAr)],
    ] });
    titles.push(i18nKey('现金转换周期'));
    summary.push(t(i18nKey('DSO {p0} 天、DIO {p1} 天、DPO {p2} 天，现金转换周期 {p3} 天'), { p0: R2(c.dso) ?? '-', p1: R2(c.dio) ?? '-', p2: R2(c.dpo) ?? '-', p3: R2(c.ccc) ?? '-' }));
  }
  if (res.inventory) {
    const v = res.inventory;
    sheets.push({ name: i18nKey('存货 ABC 与呆滞'), headers: [i18nKey('物料编码'), i18nKey('物料名称'), i18nKey('库存金额'), i18nKey('年耗用金额'), i18nKey('分类'), i18nKey('无动静天数'), i18nKey('状态'), OUT.row],
      rows: [...v.items.map((i) => [i.sku, i.name, major(i.amount), major(i.usage), i.cls, i.idleDays ?? '', t(INV_AGING_LABEL[i.aging]), i.row] as XCell[]),
        [], ...(['A', 'B', 'C'] as const).map((c) => [c, v.byClass[c].count, major(v.byClass[c].amount), major(v.byClass[c].usage)] as XCell[]),
        [t(INV_AGING_LABEL.slow), major(v.slow)], [t(INV_AGING_LABEL.obsolete), major(v.obsolete)], [t(i18nKey('可释放资金占用')), major(v.release)]] });
    titles.push(i18nKey('存货 ABC 与呆滞'));
    summary.push(t(i18nKey('呆滞 {p0}、过时 {p1}，可释放资金占用 {p2}'), { p0: fmtAmount(v.slow, ctx.locale), p1: fmtAmount(v.obsolete, ctx.locale), p2: fmtAmount(v.release, ctx.locale) }));
  }
  if (res.suppliers) {
    sheets.push({ name: i18nKey('应付策略'), headers: [i18nKey('供应商'), i18nKey('未清金额'), i18nKey('占比'), i18nKey('平均账期（天）'), i18nKey('30 天内到期'), i18nKey('状态')],
      rows: res.suppliers.map((s) => [s.supplier, major(s.open), R4(s.share), R2(s.avgTermDays), major(s.dueIn30), t(RAG_LABEL[s.status])] as XCell[]) });
    titles.push(i18nKey('应付策略'));
  }
  if (res.scf) {
    sheets.push({ name: i18nKey('供应链金融选项'), headers: [i18nKey('方案'), i18nKey('基数'), i18nKey('现金效应'), i18nKey('年化成本（负数为节约）')],
      rows: res.scf.map((o) => [t(SCF_LABEL[o.id]), major(o.base), major(o.cashEffect), major(o.annualCost)] as XCell[]) });
    titles.push(i18nKey('供应链金融选项'));
    summary.push(...res.scf.map((o) => `${t(SCF_LABEL[o.id])}: ${fmtAmount(o.cashEffect, ctx.locale)}`));
  }
  const title = res.mode === 'inventory' ? i18nKey('存货优化分析') : res.mode === 'payables' ? i18nKey('应付策略与供应链金融') : i18nKey('营运资本分析');
  const xlsx = workbook(ctx, title, () => sheets, titles, () => [
    ...(res.ccc && res.ccc.ccc != null ? [[i18nKey('CCC = DSO + DIO − DPO'), Math.abs(res.ccc.ccc - (res.ccc.dso! + res.ccc.dio! - res.ccc.dpo!)) < 1e-9] as Check] : []),
    ...(res.inventory ? [[i18nKey('分类金额合计 = 库存合计'), (['A', 'B', 'C'] as const).reduce((s, c) => s + res.inventory!.byClass[c].amount, 0) === res.inventory.items.reduce((s, i) => s + i.amount, 0)] as Check] : []),
  ], extra.levels);
  const memoPath = memo(ctx, i18nKey('营运资本优化建议'), [{ heading: t(i18nKey('摘要')), paragraphs: summary }], extra.reminders, []);
  return [{ path: xlsx, title }, { path: memoPath, title: i18nKey('营运资本优化建议'), kind: 'docx' }];
}

// ── E7 投融资 ──

export function writeInvestOutputs(ctx: OutputCtx, res: FauInvestResult, extra: { levels: string[]; reminders: FauReminder[] }): { path: string; title: string; kind?: 'docx' }[] {
  const t = labeler(ctx.locale);
  const sheets: Sheet[] = [];
  const titles: string[] = [];
  const summary: string[] = [];
  if (res.portfolio) {
    const p = res.portfolio;
    sheets.push({ name: i18nKey('投资盘点'), headers: [i18nKey('产品代码'), i18nKey('产品名称'), i18nKey('投资类型'), i18nKey('发行人 / 管理人'), i18nKey('投资成本'), i18nKey('市值'), i18nKey('浮动盈亏'), i18nKey('盈亏比例'), i18nKey('风险等级'), i18nKey('到期日'), i18nKey('到期区间'), i18nKey('状态'), i18nKey('提示'), OUT.row],
      rows: [...p.lines.map((l) => [l.id, l.product, t(INVEST_TYPE_LABEL[l.type]), l.issuer, major(l.cost), major(l.marketValue), major(l.pnl), R4(l.pnlPct), l.riskRating == null ? '' : `R${l.riskRating}`, l.maturity, t(INVEST_BUCKET_LABEL[l.bucket]), t(RAG_LABEL[l.status]), l.flags.map((f) => t(f.key, f.params)).join('; '), l.row] as XCell[]),
        [], [t(i18nKey('合计')), '', '', '', major(p.totals.cost), major(p.totals.marketValue), major(p.totals.pnl)], [t(i18nKey('加权收益率')), R4(p.weightedYield)]] });
    sheets.push({ name: i18nKey('集中度与到期'), headers: [i18nKey('发行人 / 管理人'), i18nKey('市值'), i18nKey('占比'), i18nKey('状态')],
      rows: [...p.issuers.map((i) => [i.issuer, major(i.marketValue), R4(i.share), t(RAG_LABEL[i.status])] as XCell[]), [], ...p.ladder.map((l) => [t(INVEST_BUCKET_LABEL[l.bucket]), major(l.marketValue)] as XCell[])] });
    titles.push(i18nKey('投资盘点'), i18nKey('集中度与到期'));
    summary.push(t(i18nKey('市值 {p0}，浮动盈亏 {p1}，越线 {n} 项'), { p0: fmtAmount(p.totals.marketValue, ctx.locale), p1: fmtAmount(p.totals.pnl, ctx.locale), n: p.lines.filter((l) => l.status === 'breach').length }));
  }
  if (res.liquidity) {
    const l = res.liquidity;
    sheets.push({ name: i18nKey('流动性评估'), headers: [i18nKey('指标'), i18nKey('数值'), i18nKey('状态')], rows: [
      [t(i18nKey('可用现金')), major(l.cash)], [t(i18nKey('可快速变现的投资')), major(l.liquidInvestments)], [t(i18nKey('未用授信')), major(l.unusedFacilities)],
      [t(i18nKey('可用流动性合计')), { f: `ROUND(${addr(2, 1)}+${addr(3, 1)}+${addr(4, 1)},2)`, v: major(l.available) ?? 0 }], [t(i18nKey('一年内到期债务')), major(l.debtDue12m)],
      [t(i18nKey('流动比率')), R4(l.currentRatio), t(RAG_LABEL[l.statuses.current])], [t(i18nKey('速动比率')), R4(l.quickRatio), t(RAG_LABEL[l.statuses.quick])],
      [t(i18nKey('现金比率')), R4(l.cashRatio)], [t(i18nKey('短期债务覆盖')), R4(l.coverage), t(RAG_LABEL[l.statuses.coverage])],
      [t(i18nKey('授信使用率')), R4(l.facilityUtilization), t(RAG_LABEL[l.statuses.facility])],
    ] });
    titles.push(i18nKey('流动性评估'));
    summary.push(t(i18nKey('可用流动性 {p0}，一年内到期债务 {p1}'), { p0: fmtAmount(l.available, ctx.locale), p1: fmtAmount(l.debtDue12m, ctx.locale) }));
  }
  const title = res.mode === 'liquidity' ? i18nKey('流动性评估') : i18nKey('投资复盘');
  const xlsx = workbook(ctx, title, () => sheets, titles, () => [
    ...(res.portfolio ? [[i18nKey('浮动盈亏 = 市值 − 成本'), res.portfolio.totals.pnl === res.portfolio.totals.marketValue - res.portfolio.totals.cost] as Check] : []),
    ...(res.liquidity ? [[i18nKey('可用流动性 = 现金 + 可变现投资 + 未用授信'), res.liquidity.available === res.liquidity.cash + res.liquidity.liquidInvestments + res.liquidity.unusedFacilities] as Check] : []),
  ], extra.levels);
  const memoPath = memo(ctx, res.mode === 'liquidity' ? i18nKey('流动性评估报告') : i18nKey('投资复盘报告'), [{ heading: t(i18nKey('摘要')), paragraphs: summary }, narrativeSection(t, res.narrative)], extra.reminders, [i18nKey('仅供内部复盘，非投资建议。')]);
  return [{ path: xlsx, title }, { path: memoPath, title: res.mode === 'liquidity' ? i18nKey('流动性评估报告') : i18nKey('投资复盘报告'), kind: 'docx' }];
}
