/**
 * G6 投融资与估值的统一 runner（F1–F8 共用，按 specs.ts 与各引擎表驱动）：
 *   ③ 校验：录入规整（必填 / 范围 / 行数）+ 引擎特有阻断（如永续增长率 ≥ WACC）+ 没确认来源的默认值进提醒；
 *   ④ 计算：引擎算数（纯函数）→ 有叙述的模式交模型按钉住的技能起草（不给工具、上传资料放在不可信段里）→
 *      叙述里的数字逐条回核到引擎结果、录入值与已定位的原文；事实的引文回原文定位，定位不到的丢弃；
 *      研究 / 市场 / 财富的叙述里出现买卖评级或交易建议措辞的段落标「未核实」（不做投资建议）；
 *   ⑤ 产出：xlsx（F1 四种模型写公式联动）+ docx 备忘录，全部草稿；没用授权数据源时写明「数据完整度：中 / 低」。
 */
import { i18nKey, t as i18nT, tIn } from '@totalclaw/i18n';
import type {
  FauArtifact, FauCapFact, FauCapInputs, FauCapParagraph, FauCapResult, FauCapSection, FauReminder, FauSubProgress, FauValidationReport, FauVerificationItem,
} from '@totalclaw/ipc-contracts';
import { capSpec, type CapModeSpec } from '../../../../../shared/financeAudit/capital/specs';
import { STANDARD_LABELS } from '../../../../../shared/financeAudit/regions';
import { extractDocument, locateQuote, type ExtractedDoc } from '../../../documentExtractor';
import { dataConfidence, type AnalyzeResult, type ModuleRunner, type RunCtx } from '../../runner';
import { FauStepError, runSkill } from '../../skillRunner';
import { sha256File } from '../../signoff';
import { newId, nowIso } from '../../store';
import { extractNumbers, normalizeDigits, verifyNumbers } from '../../verify';
import { capNarrativeSchema, capTask } from '../../prompts/capital';
import { writeCapitalOutputs } from '../../outputs/capital';
import ADVICE from './adviceTerms.json';
import { readInputs, sanitizeInputs, type CapIn } from './inputs';
import type { CapEngine, CapOut } from './types';
import { VALUATION_ENGINES } from './valuation';
import { CAPEX_ENGINES } from './capex';
import { IB_ENGINES, MA_ENGINES, PE_ENGINES } from './deals';
import { RESEARCH_ENGINES, WEALTH_ENGINES } from './research';
import { MARKETS_ENGINES } from './markets';

export const CAP_ENGINES: Record<string, Record<string, CapEngine>> = {
  valuation: VALUATION_ENGINES, capex: CAPEX_ENGINES, ma: MA_ENGINES, ib: IB_ENGINES, pe: PE_ENGINES,
  research: RESEARCH_ENGINES, markets: MARKETS_ENGINES, wealth: WEALTH_ENGINES,
};
const DISCLAIMER: Record<string, FauCapResult['disclaimer']> = { research: 'research', markets: 'markets', wealth: 'wealth' };
const ADVICE_RE = (ADVICE as { patterns: string[] }).patterns.map((p) => new RegExp(p, 'iu'));
const MAX_DOC_CHARS = 24_000;
const MAX_DOCS_CHARS = 60_000;

const SUB = {
  compute: i18nKey('引擎计算'), docs: i18nKey('读取上传资料'), draft: i18nKey('按技能起草'), verify: i18nKey('数字回核与原文定位'),
};

function specOf(ctx: RunCtx): CapModeSpec {
  const spec = capSpec(ctx.run.moduleId, ctx.run.modeId);
  if (!spec) throw new FauStepError(i18nKey('这个模块没有「{p0}」模式'), { p0: ctx.run.modeId });
  return spec;
}
/** 录入值一律按 spec 重新规整（run.setInputs 的 params 不按 schema 校验） */
const capOf = (ctx: RunCtx): FauCapInputs => sanitizeInputs(specOf(ctx), ctx.run.params.cap);
const engineOf = (ctx: RunCtx): CapEngine => CAP_ENGINES[ctx.run.moduleId]?.[ctx.run.modeId] || { run: () => ({ metrics: [], tables: [], flags: [] }) };

/** 叙述模式至少要有资料文件、已知事实或录入表之一 */
function hasMaterial(ctx: RunCtx, spec: CapModeSpec): boolean {
  const cap = capOf(ctx);
  return !!ctx.run.inputs.docs?.length || spec.tables.some((t) => (cap?.tables?.[t.id] || []).length > 0) || spec.fields.some((f) => f.required && cap?.fields?.[f.key]);
}

/** 本项目里转交给本模块的上游估值（F1 → F2 / F4 / F5，第 4.3 节） */
function upstreamOf(ctx: RunCtx): FauCapResult['upstream'] {
  return ctx.store.handoffs(ctx.company.id, ctx.project.id).filter((h) => h.toModuleId === ctx.run.moduleId).flatMap((h) => {
    const src = ctx.store.findRun(ctx.company.id, h.fromRunId, ctx.project.id);
    const res = src?.result as FauCapResult | undefined;
    return src && res?.metrics ? [{ runId: src.id, moduleId: src.moduleId, modeId: src.modeId, metrics: res.metrics }] : [];
  });
}

/** 允许叙述引用的数字：引擎结果、录入值、上游转交、已定位事实（百分比单列，按 12.5 表示 12.5%） */
export function allowedNumbers(out: CapOut, v: CapIn, spec: CapModeSpec, upstream: FauCapResult['upstream'], facts: FauCapFact[]): { amounts: number[]; percents: number[] } {
  const amounts: number[] = [...(out.numbers || [])];
  const percents: number[] = [];
  const add = (x: unknown, pct: boolean) => {
    if (typeof x !== 'number' || !Number.isFinite(x)) return;
    if (pct) { percents.push(x * 100); amounts.push(x * 100); } else { amounts.push(x); percents.push(x); }
  };
  for (const m of [...out.metrics, ...upstream.flatMap((u) => u.metrics)]) add(m.value, m.unit === 'pct');
  for (const t of out.tables) for (const r of t.rows) for (const c of t.columns) add(r[c.key], c.unit === 'pct');
  for (const f of spec.fields) add(v.f[f.key], f.unit === 'pct');
  for (const t of spec.tables) for (const r of v.t[t.id] || []) for (const c of t.columns) add(r[c.key], c.unit === 'pct');
  for (const f of facts.filter((x) => x.located)) {
    for (const nn of extractNumbers(`${f.value} ${f.quote}`)) (nn.percent ? percents : amounts).push(nn.value);
    for (const x of rawNumbers(`${f.value} ${f.quote}`)) { amounts.push(x); percents.push(x); }
  }
  for (const r of v.t.facts || []) for (const nn of extractNumbers(String(r.value ?? ''))) (nn.percent ? percents : amounts).push(nn.value);
  return { amounts, percents };
}

/** 文本里原样写出的数字（不乘「万 / million」单位），事实的值与引文按原样比对 */
export function rawNumbers(text: string): number[] {
  return [...normalizeDigits(text).matchAll(/\d[\d,]*(?:\.\d+)?/g)].map((m) => Number(m[0].replace(/,/g, ''))).filter(Number.isFinite);
}

/** 事实回原文：引文必须能在资料里定位，且值里的数字要在引文里原样出现；做不到的丢弃 */
export function locateFacts(raw: Array<{ label: string; value: string; doc: string; quote: string }>, docs: ExtractedDoc[]): FauCapFact[] {
  return raw.map((f) => {
    const cands = [docs.find((d) => d.fileName === f.doc), ...docs.filter((d) => d.fileName !== f.doc)].filter((d): d is ExtractedDoc => !!d);
    for (const d of cands) {
      const a = locateQuote(d, f.quote);
      if (a.match === 'none') continue;
      const inQuote = rawNumbers(f.quote);
      if (!rawNumbers(f.value).every((x) => inQuote.includes(x))) continue;
      return { ...f, doc: d.fileName, page: a.page, cell: a.cell, located: true };
    }
    return { ...f, located: false };
  });
}

/**
 * 年份（2025、FY2026）是日期不是金额，回核前摘掉。
 * shortcut: 1900–2099 之间、不带小数和千分位的整数一律当年份；真有这个数值的金额会漏核，要更严时改成只摘「年 / FY / 财年」相邻的写法
 */
export function stripYears(text: string): string {
  return normalizeDigits(text).replace(/(?<![\d.,])(?:FY)?(?:19|20)\d{2}(?![\d.,%])/gi, ' ');
}

export function adviceHit(text: string): string | null {
  for (const re of ADVICE_RE) {
    const m = re.exec(text);
    if (m) return m[0];
  }
  return null;
}

async function readDocs(ctx: RunCtx): Promise<ExtractedDoc[]> {
  const out: ExtractedDoc[] = [];
  let budget = MAX_DOCS_CHARS;
  for (const ds of ctx.datasets('docs')) {
    if (budget <= 0) break;
    try {
      const d = await extractDocument(ds.storedPath, ds.fileName);
      const text = d.text.slice(0, Math.min(MAX_DOC_CHARS, budget));
      budget -= text.length;
      out.push({ ...d, text });
    } catch { /* 读不出的文件跳过：签核时由提醒项说明 */ }
  }
  return out;
}

function textCells(v: CapIn): string[] {
  return Object.values(v.t).flatMap((rs) => rs.flatMap((r) => Object.values(r).filter((x): x is string => typeof x === 'string'))).concat(Object.values(v.f).filter((x): x is string => typeof x === 'string'));
}

export const capitalRunner: ModuleRunner = {
  // 子进度与模式无关；没有资料 / 叙述的模式在 analyze 里标「跳过」
  subSteps: (): FauSubProgress[] => (['compute', 'docs', 'draft', 'verify'] as const).map((id) => ({ id, label: { key: SUB[id] }, status: 'todo' })),

  async validate(ctx: RunCtx): Promise<FauValidationReport> {
    const spec = specOf(ctx);
    const r = readInputs(spec, capOf(ctx), (k) => i18nT(k));
    const blockers = r.issues.filter((i) => i.level === 'block');
    const warnings = r.issues.filter((i) => i.level === 'warn');
    if (!blockers.length) {
      for (const [i, m] of (engineOf(ctx).check?.(r.v) || []).entries()) blockers.push({ id: `cap_check_${i}`, level: 'block', code: 'engine_check', message: m });
    }
    if (spec.narrative && !hasMaterial(ctx, spec)) blockers.push({ id: 'cap_no_material', level: 'block', code: 'no_material', message: { key: i18nKey('请上传资料文件，或在录入表里填写已知事实与数据') } });
    // 这一版不从连接器取数（保留接口）：每次都是降级运行，作为提醒项进签核，第 ⑤ 步的数据完整度也随之不是「高」
    warnings.push({ id: 'cap_degraded', level: 'warn', code: 'degraded', message: { key: i18nKey('没有使用授权数据源：按上传、公开数据与手工录入降级运行') } });
    return {
      checks: [{ id: 'inputs', ok: !blockers.length, level: 'block', message: { key: i18nKey('录入值完整且在合理范围内') } }],
      blockers, warnings,
    };
  },

  async analyze(ctx: RunCtx): Promise<AnalyzeResult> {
    const spec = specOf(ctx);
    const { v, unsourced } = readInputs(spec, capOf(ctx), (k) => i18nT(k));
    v.th = ctx.th(ctx.run.moduleId);
    ctx.progress('compute', 'running');
    const out = engineOf(ctx).run(v);
    const upstream = upstreamOf(ctx);
    ctx.progress('compute', 'done');

    let docs: ExtractedDoc[] = [];
    if (spec.narrative && ctx.run.inputs.docs?.length) {
      ctx.progress('docs', 'running');
      docs = await readDocs(ctx);
    }
    ctx.progress('docs', docs.length ? 'done' : 'skipped');
    let sections: FauCapSection[] | undefined;
    let dropped = 0;
    let facts: FauCapFact[] | undefined;
    let model: string | undefined;
    const verification: FauVerificationItem[] = [];
    const reminders: FauReminder[] = out.flags.filter((f) => f.level === 'warn').map((f) => ({ id: `cap:${f.id}`, source: 'engine', level: 'warn', message: f.message }));
    if (spec.narrative) {
      ctx.progress('draft', 'running');
      const loc = ctx.locale;
      const lbl = (k: string) => tIn(loc, k);
      const data = {
        module: ctx.def.code, mode: ctx.run.modeId, units: v.f.units ?? '',
        inputs: spec.fields.filter((f) => v.f[f.key] !== null).map((f) => ({ label: lbl(f.label), value: v.f[f.key], unit: f.unit })),
        tables: spec.tables.map((t) => ({ table: lbl(t.label), rows: (v.t[t.id] || []).slice(0, 60) })),
        results: { metrics: out.metrics.map((m) => ({ label: lbl(m.label), value: m.value, unit: m.unit })), tables: out.tables.map((t) => ({ title: lbl(t.title), rows: t.rows.slice(0, 40) })), flags: out.flags.map((f) => lbl(f.message.key)) },
        upstream: upstream.map((u) => ({ module: u.moduleId, mode: u.modeId, metrics: u.metrics.map((m) => ({ label: lbl(m.label), value: m.value, unit: m.unit })) })),
        documents: docs.map((d) => d.fileName),
      };
      const res = await runSkill(ctx.llm, {
        module: ctx.run.moduleId,
        skills: (ctx.def.modes.find((m) => m.id === ctx.run.modeId)?.skills || []).slice(0, 2).map((name) => ({ name })),
        task: capTask(ctx.run.moduleId, ctx.run.modeId, docs.length > 0), data, outputLocale: loc, schema: capNarrativeSchema,
        untrusted: docs.map((d) => ({ name: d.fileName, text: d.text })),
        narratives: (o) => o.sections.flatMap((s) => [s.heading, ...s.paragraphs]),
        userData: [...textCells(v), ...docs.map((d) => d.fileName)],
        timeoutMs: 240_000,
      });
      model = res.model;
      ctx.progress('draft', 'done');
      ctx.progress('verify', 'running');
      facts = locateFacts(res.data.facts || [], docs);
      dropped = facts.filter((f) => !f.located).length;
      const allowed = allowedNumbers(out, v, spec, upstream, facts);
      const adviceCheck = !!DISCLAIMER[ctx.run.moduleId];
      sections = res.data.sections.map((s, si) => ({
        heading: s.heading,
        paragraphs: s.paragraphs.map((text, pi): FauCapParagraph => {
          const chk = verifyNumbers(stripYears(text), allowed.amounts, allowed.percents);
          const advice = adviceCheck ? adviceHit(text) : null;
          const missing = [...chk.missing, ...(advice ? [advice] : [])];
          const p: FauCapParagraph = { text, status: missing.length ? 'unverified' : 'verified', ...(missing.length ? { missing } : {}), ...(advice ? { advice: true } : {}) };
          verification.push({ id: `cap:${si}:${pi}`, ref: `section:${si}`, text, status: p.status, missing: p.missing });
          return p;
        }),
      }));
      if (dropped) reminders.push({ id: 'cap:facts_dropped', source: 'verify', level: 'warn', message: { key: i18nKey('模型给出的 {n} 条事实在原文里定位不到，已丢弃'), params: { n: dropped } } });
      facts = facts.filter((f) => f.located);
      ctx.progress('verify', 'done');
      if (ctx.run.modeId === 'datapack') {
        out.tables.push({
          id: 'datapack', title: i18nKey('交易数据包'),
          columns: [{ key: 'label', label: i18nKey('指标 / 事实'), unit: 'text' }, { key: 'value', label: i18nKey('数值'), unit: 'text' }, { key: 'doc', label: i18nKey('资料文件'), unit: 'text' }, { key: 'page', label: i18nKey('页码'), unit: 'int' }],
          rows: facts.map((f) => ({ label: f.label, value: f.value, doc: f.doc, page: f.page ?? null })),
        });
      }
    } else {
      ctx.progress('draft', 'skipped');
      ctx.progress('verify', 'skipped');
    }
    const unverified = verification.filter((x) => x.status === 'unverified').length;
    const result: FauCapResult = {
      moduleId: ctx.run.moduleId, modeId: ctx.run.modeId, metrics: out.metrics, tables: out.tables, flags: out.flags, sections, facts,
      droppedFacts: facts ? dropped : undefined,
      inputs: {
        fields: spec.fields.filter((f) => v.f[f.key] !== null).map((f) => ({ key: f.key, label: f.label, unit: f.unit, value: v.f[f.key], src: capOf(ctx)?.fields?.[f.key]?.src || { kind: 'default' } })),
        tables: spec.tables.map((t) => ({ id: t.id, title: t.label, columns: t.columns.map((c) => ({ key: c.key, label: c.label, unit: c.unit })), rows: (capOf(ctx)?.tables?.[t.id] || []).map((r, i) => ({ cells: v.t[t.id]?.[i] || r.cells, src: r.src })) })),
      },
      upstream,
      degraded: { authorized: false, completeness: dataConfidence(ctx.run), unsourced: unsourced + unverified },
      disclaimer: DISCLAIMER[ctx.run.moduleId] ?? null,
    };
    return {
      result, verification, reminders, model,
      summary: { key: i18nKey('指标 {n} 项，结果表 {m} 张，提醒 {k} 条'), params: { n: out.metrics.length, m: out.tables.length, k: out.flags.length } },
    };
  },

  async draft(ctx: RunCtx) {
    const run = ctx.run;
    const res = run.result as FauCapResult;
    const mode = ctx.def.modes.find((m) => m.id === run.modeId);
    const spec = specOf(ctx);
    const { v } = readInputs(spec, capOf(ctx), (k) => i18nT(k));
    v.th = ctx.th(ctx.run.moduleId);
    const paths = writeCapitalOutputs({
      locale: ctx.locale, dir: ctx.outputDir(), companyName: ctx.company.name, projectName: ctx.project.name, period: ctx.project.period,
      moduleCode: ctx.def.code, moduleName: ctx.def.name, modeName: mode?.name || run.modeId, standardLabel: STANDARD_LABELS[ctx.profile.standard], model: run.model,
    }, res, { levels: run.requiredLevels, docx: ctx.def.outputs.includes('docx') && (!!res.sections?.length || res.tables.length > 0), engineDetail: engineOf(ctx).run(v).detail, inputs: v });
    const art = (kind: FauArtifact['kind'], path: string, title: string): FauArtifact => ({ id: newId('art'), kind, path, sha256: sha256File(path) || '', title: { key: title }, locale: ctx.locale, createdAt: nowIso() });
    const artifacts = [art('xlsx', paths.xlsx, i18nKey('底稿')), ...(paths.docx ? [art('docx', paths.docx, i18nKey('备忘录'))] : [])];
    return { artifacts, summary: { key: i18nKey('已生成 {n} 个文件（草稿—待签核）'), params: { n: artifacts.length } } };
  },
};

