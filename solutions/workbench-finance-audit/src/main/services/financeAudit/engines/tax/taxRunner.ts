/**
 * C1 纳税申报准备 runner：③ 校验 → ④ 按模式跑规则引擎（中国调用财务智能体 tax.ts；沙特 / 阿联酋 / 国际按规则表）→ ⑤ 申报底稿与备忘录。
 * R 型：钱和税全部由纯函数算，不调模型。只出申报草稿，不提交申报。
 */
import { i18nKey } from '@totalclaw/i18n';
import type {
  FauArtifact, FauIssue, FauRegion, FauReminder, FauSubProgress, FauTaxDeadline, FauTaxFinding, FauTaxModeId, FauTaxResult, FauTaxSection,
  FauValidationReport, FauZakatCategory,
} from '@totalclaw/ipc-contracts';
import { FAU_ZAKAT_CATEGORIES } from '@totalclaw/ipc-contracts';
import { STANDARD_LABELS, regionProfile } from '../../../../../shared/financeAudit/regions';
import type { AnalyzeResult, ModuleRunner, RunCtx } from '../../runner';
import { FauStepError } from '../../skillRunner';
import { sha256File } from '../../signoff';
import { newId, nowIso } from '../../store';
import { writeTaxOutputs } from '../../outputs/tax';
import { withDatasetIssues } from '../accounting/closeRunner';
import { addMonths, periodEnd } from '../accounting/common';
import { RuleBook, allRules, classifyTb, paramCents, paramRatio, profitBeforeTax, taxPeriod, type TaxPeriod } from './common';
import { inferCategory, vatReturn, type VatRegime } from './vat';
import { cnFindings, cnTax, goldenTaxChecks } from './cn';
import { zakatBase } from './zakat';
import { withholdingTax } from './wht';
import { aeCorporateTax, currentTax, deferredTax } from './incomeTax';
import { aeCitCalendar, aeVatCalendar, cnCalendar, saAnnualCalendar, saVatCalendar } from './calendar';

export const MODE_REGION: Record<FauTaxModeId, FauRegion> = { cn: 'CN', sa_vat: 'SA', sa_zakat: 'SA', sa_wht: 'SA', ae_vat: 'AE', ae_cit: 'AE', intl: 'INTL' };
const ANNUAL: FauTaxModeId[] = ['sa_zakat', 'ae_cit'];

const ENGINE_LABEL: Record<string, string> = {
  cnComputeTax: i18nKey('增值税、附加、所得税、个税计算（财务智能体口径）'),
  cnTaxFindings: i18nKey('账税差异与风险预检'),
  goldenTaxCheck: i18nKey('金税与数电票自检'),
  filingCalendar: i18nKey('申报日历'),
  vatReturn: i18nKey('增值税申报表各栏'),
  zakatBase: i18nKey('天课基数与天课'),
  nonSaudiCit: i18nKey('外资部分所得税'),
  withholdingTax: i18nKey('预提税'),
  aeCorporateTax: i18nKey('企业所得税（9%，含免征额）'),
  currentTax: i18nKey('当期所得税'),
  deferredTax: i18nKey('递延所得税（IAS 12）'),
};

const modeOf = (ctx: Pick<RunCtx, 'run'>) => ctx.run.modeId as FauTaxModeId;

/** 税期：运行参数优先，其次项目期间；天课与企业所得税按会计年度（YYYY，或以 YYYY-MM 为年末月） */
export function taxPeriodOf(ctx: Pick<RunCtx, 'run' | 'project' | 'company'>): TaxPeriod {
  const raw = String(ctx.run.params.period || ctx.project.period || '');
  if (ANNUAL.includes(modeOf(ctx)) && /^\d{4}-\d{2}$/.test(raw)) {
    const start = addMonths(raw, -11);
    return { label: raw, from: `${start}-01`, to: periodEnd(raw), days: Math.round((Date.parse(`${periodEnd(raw)}T00:00:00Z`) - Date.parse(`${start}-01T00:00:00Z`)) / 86_400_000) + 1 };
  }
  return taxPeriod(raw, ctx.company.fiscalYearStartMonth);
}

function currencyOf(ctx: Pick<RunCtx, 'company'>, region: FauRegion): string {
  return ctx.company.region === region ? ctx.company.currency : regionProfile(region).currency;
}

function block(id: string, key: string, params: Record<string, string | number> = {}, rows?: number[]): FauIssue {
  return { id: `tax:${id}`, level: 'block', code: id, message: { key, params }, rows };
}
function warn(id: string, key: string, params: Record<string, string | number> = {}, rows?: number[]): FauIssue {
  return { id: `tax:${id}`, level: 'warn', code: id, message: { key, params }, rows };
}

const p = (ctx: RunCtx) => ctx.run.params as Record<string, unknown>;

export const taxRunner: ModuleRunner = {
  subSteps(modeId: string): FauSubProgress[] {
    const engines = ({
      cn: ['cnComputeTax', 'cnTaxFindings', 'goldenTaxCheck', 'filingCalendar'], sa_vat: ['vatReturn', 'filingCalendar'],
      sa_zakat: ['zakatBase', 'nonSaudiCit', 'filingCalendar'], sa_wht: ['withholdingTax', 'filingCalendar'],
      ae_vat: ['vatReturn', 'filingCalendar'], ae_cit: ['aeCorporateTax', 'filingCalendar'], intl: ['vatReturn', 'currentTax', 'deferredTax'],
    } as Record<string, string[]>)[modeId] || [];
    return engines.map((id) => ({ id, label: { key: ENGINE_LABEL[id] }, status: 'todo' }));
  },

  async validate(ctx: RunCtx): Promise<FauValidationReport> {
    const mode = modeOf(ctx);
    const region = MODE_REGION[mode];
    const blockers: FauIssue[] = [];
    const warnings: FauIssue[] = [];
    if (!ctx.company.regions.includes(region)) blockers.push(block('region', i18nKey('这个模式适用于「{p0}」档案，当前公司没有选这个地区；请在配置向导里加上'), { p0: regionProfile(region).name }));
    let period: TaxPeriod | null = null;
    try { period = taxPeriodOf(ctx); } catch (e) { blockers.push(block('period', (e as FauStepError).key || i18nKey('税期格式不对：用 YYYY-MM、YYYY-Qn 或 YYYY'))); }
    if (period && region !== 'CN' && region !== 'INTL') {
      const rules = new RuleBook(allRules(), period.to, region);
      const need = ({ sa_vat: ['sa.vat_standard_rate'], ae_vat: ['ae.vat_standard_rate'], sa_zakat: ['sa.zakat_rate', 'sa.cit_rate_nonsaudi'], ae_cit: ['ae.cit_rate', 'ae.cit_zero_threshold'], sa_wht: ['sa.wht_return_due'] } as Record<string, string[]>)[mode] || [];
      for (const id of need) if (!rules.find(id)) blockers.push(block(`rule_${id}`, i18nKey('地区规则 {p0} 在 {p1} 没有生效的版本，请在流程库的地区规则表里补上'), { p0: id, p1: period.to }));
    }
    if (['sa_vat', 'ae_vat', 'intl', 'cn'].includes(mode)) {
      const lines = ctx.rows<'vat_lines'>('vatLines');
      if (mode !== 'cn') {
        const unknown = lines.filter((l) => l.status !== 'void' && !inferCategory(l)).map((l) => l.row);
        if (unknown.length) blockers.push(block('category', i18nKey('{n} 行没有计税类别且税额为 0：零税率、免税还是不征税要写明'), { n: unknown.length }, unknown));
      }
      if (mode === 'intl' && lines.length && !(paramRatio(p(ctx).vatStandardRate, 0) > 0)) blockers.push(block('intl_vat_rate', i18nKey('国际口径请先在参数里填写增值税 / 商品服务税标准税率')));
    }
    if (mode === 'intl' && !['vatLines', 'tb', 'tempDiffs'].some((k) => ctx.run.inputs[k]?.length)) {
      blockers.push(block('intl_empty', i18nKey('国际口径至少要有一份数据：销项与进项明细、年末科目余额表或暂时性差异明细')));
    }
    if (mode === 'intl' && (ctx.run.inputs.tb?.length || ctx.run.inputs.tempDiffs?.length) && !(paramRatio(p(ctx).incomeTaxRate, 0) > 0)) {
      blockers.push(block('intl_cit_rate', i18nKey('国际口径请先在参数里填写所得税税率')));
    }
    if (mode === 'sa_zakat' || mode === 'ae_cit' || (mode === 'intl' && ctx.run.inputs.tb?.length)) {
      const rows = classifyTb(ctx.rows<'tb'>('tb'), ctx.company, ctx.profile.standard);
      const unmapped = rows.filter((r) => !r.cls && (r.closingDr || r.closingCr || r.periodDr || r.periodCr)).map((r) => r.row);
      if (unmapped.length) warnings.push(warn('unmapped', i18nKey('{n} 个科目认不出报表大类，可能漏算：请在配置向导的科目映射里确认'), { n: unmapped.length }, unmapped));
      if (mode === 'sa_zakat') {
        const share = paramRatio(p(ctx).saudiShare, 1);
        if (share < 0 || share > 1) blockers.push(block('share', i18nKey('沙特 / 海湾国家股东持股比例要在 0 到 100% 之间')));
      }
    }
    const report: FauValidationReport = {
      checks: [{ id: 'region', ok: !blockers.some((b) => b.code === 'region'), level: 'block', message: { key: i18nKey('模式与公司地区档案一致') } }],
      blockers, warnings,
    };
    return withDatasetIssues(report, ctx, ['vatLines', 'journal', 'iit', 'tb', 'wht', 'tempDiffs']);
  },

  async analyze(ctx: RunCtx): Promise<AnalyzeResult> {
    const mode = modeOf(ctx);
    const region = MODE_REGION[mode];
    const period = taxPeriodOf(ctx);
    const currency = currencyOf(ctx, region);
    const rules = new RuleBook(allRules(), period.to, region === 'INTL' ? 'XX' : region);
    const th = ctx.th('tax');
    const sections: FauTaxSection[] = [];
    let findings: FauTaxFinding[] = [];
    let calendar: FauTaxDeadline[] = [];
    let zakat: FauTaxResult['zakat'];
    let cn: FauTaxResult['cn'];
    let vatTotals: FauTaxResult['vatTotals'];
    const run = (id: string) => ctx.progress(id, 'running');
    const done = (id: string) => ctx.progress(id, 'done');

    if (mode === 'cn') {
      run('cnComputeTax');
      const q = String(p(ctx).taxpayerType) === 'small' ? 'small' : 'general';
      const out = cnTax({
        lines: ctx.rows<'vat_lines'>('vatLines'), journal: ctx.rows<'journal'>('journal'), iit: ctx.rows<'iit_rows'>('iit'), period: period.label,
        ledger: { name: ctx.company.name, taxId: ctx.company.regNo, taxpayerType: q, cityTier: (['urban', 'county', 'other'].includes(String(p(ctx).cityTier)) ? p(ctx).cityTier : 'urban') as 'urban', smallLowProfit: p(ctx).smallLowProfit === true },
        overrides: {
          uninvoicedSales: num(p(ctx).uninvoicedSales), inputTransferOut: num(p(ctx).inputTransferOut), carriedCredit: num(p(ctx).carriedCredit),
          citPaidYtd: num(p(ctx).citPaidYtd), quarterly: typeof p(ctx).quarterly === 'boolean' ? p(ctx).quarterly as boolean : undefined,
        },
        locale: ctx.locale,
      });
      sections.push(...out.sections);
      cn = { vatPayable: out.result.vatPayable, surchargeTotal: out.result.surchargeTotal, citPayable: out.result.citPayable, iitTotal: out.result.iitTotal, burdenRate: out.result.burdenRate };
      vatTotals = { output: Math.round(out.inputs.salesByRate.reduce((s, g) => s + g.tax, 0) * 100), input: Math.round(out.inputs.inputTax * 100) };
      done('cnComputeTax');
      findings.push(...cnFindings(out.findings));
      done('cnTaxFindings');
      // 只看历史上同为中国口径的运行（沙特 / 阿联酋增值税的进销项不混进来）
      const history = ctx.history().filter((r) => r.modeId === 'cn').map((r) => ({ period: ctx.store.getProject(ctx.company.id, r.projectId)?.period || '', ...((r.result as FauTaxResult | undefined)?.vatTotals || { output: 0, input: 0 }) }));
      findings.push(...goldenTaxChecks(ctx.rows<'vat_lines'>('vatLines'), {
        topShare: th.topSupplierShare, warnMonths: th.inputOverOutputMonthsWarn, highMonths: th.inputOverOutputMonthsHigh,
        history: [{ period: period.label, ...vatTotals }, ...history],
      }));
      done('goldenTaxCheck');
      const month = Number(period.label.slice(5, 7));
      calendar = cnCalendar(period.label, { hasIit: out.result.iit.length > 0, citDue: /Q/.test(period.label) || [3, 6, 9, 12].includes(month) });
      done('filingCalendar');
    } else if (mode === 'sa_vat' || mode === 'ae_vat' || mode === 'intl') {
      const regime: VatRegime = mode === 'sa_vat' ? 'SA' : mode === 'ae_vat' ? 'AE' : 'INTL';
      const lines = ctx.rows<'vat_lines'>('vatLines');
      if (lines.length || mode !== 'intl') {
        run('vatReturn');
        const stdId = regime === 'SA' ? 'sa.vat_standard_rate' : regime === 'AE' ? 'ae.vat_standard_rate' : '';
        const corrId = regime === 'SA' ? 'sa.vat_correction_threshold' : regime === 'AE' ? 'ae.vat_correction_threshold' : '';
        const out = vatReturn({
          regime, lines, period, currency,
          standardRate: stdId ? rules.rate(stdId) : paramRatio(p(ctx).vatStandardRate, 0), standardRuleId: stdId || undefined,
          carriedCredit: Math.max(0, paramCents(p(ctx).carriedCredit)), correction: paramCents(p(ctx).priorCorrection),
          correctionMax: corrId ? Math.round(rules.num(corrId) * 100) : null, correctionRuleId: corrId || undefined, tol: th.vatLineTol,
        });
        sections.push(out.section);
        findings.push(...out.findings);
        vatTotals = { output: out.output, input: out.input };
        done('vatReturn');
      } else ctx.progress('vatReturn', 'skipped');
      if (mode !== 'intl') {
        calendar = regime === 'SA' ? saVatCalendar(period, rules) : aeVatCalendar(period, rules);
        const phase2 = regime === 'SA' ? rules.find('sa.einvoice_phase2_start') : null;
        if (phase2) findings.push({ id: 'sa_einvoice_phase2', level: 'info', title: { key: i18nKey('电子发票第二阶段（集成阶段）自 {p0} 起分批实施：销项发票须经开票系统与 ZATCA 平台对接，申报前核对发票已全部上报'), params: { p0: String(phase2.value) } } });
        done('filingCalendar');
      } else {
        const rate = paramRatio(p(ctx).incomeTaxRate, 0);
        if (ctx.run.inputs.tb?.length) {
          run('currentTax');
          const pl = profitBeforeTax(classifyTb(ctx.rows<'tb'>('tb'), ctx.company, ctx.profile.standard));
          sections.push(currentTax({ profit: pl.profit, profitRows: pl.rows, adjust: paramCents(p(ctx).taxAdjust), rate, currency }));
          done('currentTax');
        } else ctx.progress('currentTax', 'skipped');
        const tds = ctx.rows<'temp_diffs'>('tempDiffs');
        if (tds.length) { run('deferredTax'); sections.push(deferredTax(tds, rate, currency).section); done('deferredTax'); }
        else ctx.progress('deferredTax', 'skipped');
        findings.push({ id: 'intl_param', level: 'info', title: { key: i18nKey('国际口径：税率为参数，申报表格式与期限按当地规定') } });
      }
    } else if (mode === 'sa_zakat') {
      run('zakatBase');
      const rows = classifyTb(ctx.rows<'tb'>('tb'), ctx.company, ctx.profile.standard);
      const overrides: Record<string, FauZakatCategory> = {};
      const raw = p(ctx).zakatMap;
      if (raw && typeof raw === 'object') for (const [k, v] of Object.entries(raw as Record<string, unknown>)) if (FAU_ZAKAT_CATEGORIES.includes(v as FauZakatCategory)) overrides[k.slice(0, 80)] = v as FauZakatCategory;
      const yearBasis = p(ctx).zakatYearBasis === 'hijri' || (p(ctx).zakatYearBasis !== 'gregorian' && ctx.company.hijriFiscalYear) ? 'hijri' : 'gregorian';
      zakat = zakatBase({
        rows, overrides, profitAdjust: paramCents(p(ctx).profitAdjust), yearBasis, fiscalDays: period.days,
        saudiShare: paramRatio(p(ctx).saudiShare, 1), zakatRate: rules.rate('sa.zakat_rate'), hijriYearDays: rules.num('sa.zakat_hijri_year_days'),
        citRate: rules.rate('sa.cit_rate_nonsaudi'),
      });
      done('zakatBase');
      done('nonSaudiCit');
      sections.push({
        id: 'zakat', title: { key: i18nKey('天课') }, currency, payable: zakat.zakatDue,
        lines: [
          { id: 'additions', label: { key: i18nKey('加项合计') }, base: zakat.additions },
          { id: 'deductions', label: { key: i18nKey('减项合计') }, base: zakat.deductions },
          { id: 'computed', label: { key: i18nKey('计算基数（加项 − 减项）') }, base: zakat.computedBase },
          { id: 'adj_profit', label: { key: i18nKey('调整后净利润（基数下限）') }, base: zakat.adjustedProfit, rows: zakat.profitRows },
          { id: 'base', label: { key: i18nKey('天课基数') }, base: zakat.base, rate: zakat.rate, tax: Math.round(zakat.base * zakat.rate), ruleIds: ['sa.zakat_rate', 'sa.zakat_hijri_year_days'] },
          { id: 'zakat_due', label: { key: i18nKey('应缴天课（按沙特 / 海湾国家股东持股比例）') }, rate: zakat.saudiShare, tax: zakat.zakatDue },
        ],
      });
      if (zakat.saudiShare < 1) {
        sections.push({
          id: 'cit_nonsaudi', title: { key: i18nKey('外资部分所得税') }, currency, payable: zakat.nonSaudiCit,
          lines: [{ id: 'taxable', label: { key: i18nKey('外资部分应纳税所得额') }, base: zakat.nonSaudiTaxable, rate: rules.rate('sa.cit_rate_nonsaudi'), tax: zakat.nonSaudiCit, ruleIds: ['sa.cit_rate_nonsaudi'] }],
        });
      }
      if (zakat.floorApplied) findings.push({ id: 'zakat_floor', level: 'info', title: { key: i18nKey('天课基数按调整后净利润（下限）计算') } });
      const none = zakat.items.filter((i) => i.category === 'none');
      if (none.length) findings.push({ id: 'zakat_unclassified', level: 'warn', title: { key: i18nKey('有科目未计入天课基数') }, detail: { key: i18nKey('{n} 个资产负债类科目没有归入加项或减项，请逐个确认'), params: { n: none.length } }, rows: none.map((i) => i.row) });
      calendar = saAnnualCalendar(period.to, rules);
      done('filingCalendar');
    } else if (mode === 'sa_wht') {
      run('withholdingTax');
      const out = withholdingTax(ctx.rows<'wht_payments'>('wht'), period, rules, currency);
      sections.push(out.section);
      findings.push(...out.findings);
      calendar = out.calendar;
      done('withholdingTax');
      done('filingCalendar');
    } else if (mode === 'ae_cit') {
      run('aeCorporateTax');
      const pl = profitBeforeTax(classifyTb(ctx.rows<'tb'>('tb'), ctx.company, ctx.profile.standard));
      const out = aeCorporateTax({ profit: pl.profit, profitRows: pl.rows, revenue: pl.revenue, adjust: paramCents(p(ctx).citAdjust), smallBusinessRelief: p(ctx).smallBusinessRelief === true, rules, currency });
      sections.push(out.section);
      findings.push(...out.findings);
      if (p(ctx).qualifyingFreeZone === true) findings.push({ id: 'qfzp', level: 'warn', title: { key: i18nKey('自由区合格主体：合格收入按 0% 计税的口径需当地专业人员判断，本底稿按 9% 计算') } });
      done('aeCorporateTax');
      calendar = aeCitCalendar(period, rules);
      done('filingCalendar');
    } else {
      throw new FauStepError(i18nKey('这个模块没有「{p0}」模式'), { p0: mode });
    }

    const draftBasis = regionProfile(region).draftBasis || rules.draft();
    const result: FauTaxResult = { mode, region, period: period.label, currency, sections, findings, calendar, zakat, rules: rules.uses(), draftBasis, cn, vatTotals };
    const reminders: FauReminder[] = [];
    if (draftBasis) reminders.push({ id: 'tax:draft_basis', source: 'engine', level: 'warn', message: { key: i18nKey('草稿口径，需当地专业人士复核：用到的地区规则尚未经当地专业人员审核') } });
    findings.filter((f) => f.level === 'high').forEach((f) => reminders.push({ id: `tax:${f.id}`, source: 'escalation', level: 'warn', message: f.title }));
    const total = sections.reduce((s, x) => s + x.payable, 0);
    return {
      result, reminders, approveRequired: true,
      summary: { key: i18nKey('{n} 个税种，合计应缴 {p0} {p1}，风险 {m} 条'), params: { n: sections.length, p0: (total / 100).toFixed(2), p1: currency, m: findings.filter((f) => f.level !== 'info').length } },
    };
  },

  async draft(ctx: RunCtx) {
    const run = ctx.run;
    const res = run.result as FauTaxResult;
    const mode = ctx.def.modes.find((m) => m.id === run.modeId);
    const octx = {
      locale: ctx.locale, dir: ctx.outputDir(), companyName: ctx.company.name, projectName: ctx.project.name, period: res.period,
      moduleCode: ctx.def.code, moduleName: ctx.def.name, modeName: mode?.name || run.modeId, standardLabel: STANDARD_LABELS[ctx.profile.standard], model: run.model,
    };
    const out = writeTaxOutputs(octx, res, { levels: run.requiredLevels, modeName: mode?.name || run.modeId });
    const art = (kind: FauArtifact['kind'], path: string, title: string): FauArtifact => ({ id: newId('art'), kind, path, sha256: sha256File(path) || '', title: { key: title }, locale: ctx.locale, createdAt: nowIso() });
    const artifacts = [art('xlsx', out.workPath, i18nKey('纳税申报底稿')), art('docx', out.memoPath, i18nKey('申报说明备忘录'))];
    return { artifacts, summary: { key: i18nKey('已生成 {n} 个文件（草稿—待签核）'), params: { n: artifacts.length } } };
  },
};

function num(v: unknown): number | undefined {
  if (v === undefined || v === null || v === '') return undefined;
  const n = typeof v === 'number' ? v : Number(String(v).replace(/[,\s]/g, ''));
  return Number.isFinite(n) ? n : undefined;
}
