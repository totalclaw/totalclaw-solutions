/**
 * fpa 分组 runner 共用件：期间、数据来源（是否已签核）、基础校验、不可信文件文本、回核与模型叙述。
 *
 * 叙述的做法与 A1 波动说明一致（第 6.4 节）：钉住技能、不给工具、结构化输出；叙述里的每个数字必须能在
 * 给定数据（引擎结果 + 上传文件原文）里找到，找不到的带着问题重写一次，仍不行标「未核实」；
 * 引用上传文件原文的事实类条目，定位不到原文的直接丢弃。
 */
import { i18nKey } from '@totalclaw/i18n';
import type { FauFpaColKind, FauFpaColumn, FauFpaNarrative, FauFpaSource, FauValidationReport, FauVerificationItem } from '@totalclaw/ipc-contracts';
import { inputsForMode } from '../../../../../shared/financeAudit/catalog';
import { extractDocument, locateQuote, type ExtractedDoc } from '../../../documentExtractor';
import type { RunCtx } from '../../runner';
import { runSkill, type SkillCall } from '../../skillRunner';
import { extractNumbers, verifyNumbers } from '../../verify';
import { withDatasetIssues } from '../accounting/closeRunner';
import { yuan } from '../accounting/common';

export function fpaPeriod(ctx: Pick<RunCtx, 'project' | 'run'>): string {
  const p = String(ctx.run.params.period || '');
  return /^\d{4}(-\d{2}|-Q[1-4])?$/.test(p) ? p : ctx.project.period;
}

export const col = (key: string, label: string, kind: FauFpaColKind = 'text'): FauFpaColumn => ({ key, label, kind });

/** 本模式下选中的数据集 + 是否已被本项目里某次签核归档的运行引用 */
export function sourcesOf(ctx: RunCtx): FauFpaSource[] {
  const archived = ctx.store.listRuns(ctx.company.id, ctx.project.id).filter((r) => r.status === 'archived' && r.id !== ctx.run.id);
  return inputsForMode(ctx.def, ctx.run.modeId).flatMap((slot) => ctx.datasets(slot.id).map((d) => {
    const by = archived.filter((r) => Object.values(r.inputs).flat().includes(d.id));
    return {
      datasetId: d.id, label: d.label, kind: d.kind, slot: slot.id, rows: d.rowCount, signed: by.length > 0,
      signedBy: by.length ? [...new Set(by.map((r) => r.moduleId))] : undefined,
    };
  }));
}

/** 「来源」列：数据集名 + 行号（每个数字都能追溯到「数据集 + 行号」，第 10 节） */
export function sourceText(label: string, rows: number[] | undefined): string {
  const rs = [...new Set(rows || [])].sort((a, b) => a - b);
  if (!rs.length) return label;
  const shown = rs.slice(0, 12).join(',');
  return `${label} #${shown}${rs.length > 12 ? '…' : ''}`;
}

/** 第 ③ 步基础校验：数据集解析问题（带行号）+ 本模式必需的数据不能是空表 */
export function baseValidation(ctx: RunCtx): FauValidationReport {
  const slots = inputsForMode(ctx.def, ctx.run.modeId);
  const report: FauValidationReport = { checks: [], blockers: [], warnings: [] };
  for (const s of slots) {
    for (const d of ctx.datasets(s.id)) {
      if (d.kind !== 'evidence' && d.rowCount === 0) {
        report.blockers.push({ id: `empty:${d.id}`, level: 'block', code: 'empty_dataset', message: { key: i18nKey('「{p0}」没有读到任何数据行'), params: { p0: d.label } } });
      }
    }
  }
  return withDatasetIssues(report, ctx, slots.map((s) => s.id));
}

export interface LoadedDoc { name: string; text: string; doc: ExtractedDoc }

/** 上传文件（不可信）→ 文本；读不出来的不阻断，给提醒 */
export async function docsOf(ctx: RunCtx, slot: string, maxChars = 12000): Promise<LoadedDoc[]> {
  const out: LoadedDoc[] = [];
  for (const d of ctx.datasets(slot)) {
    if (!d.storedPath) continue;
    const doc = await extractDocument(d.storedPath, d.fileName);
    if (doc.text) out.push({ name: d.fileName, text: doc.text.slice(0, maxChars), doc });
  }
  return out;
}

export interface Facts { amounts: number[]; percents: number[] }

/** 分 → 元、比例 → 百分数（两位小数），连同上传文件原文里出现的数字，作为叙述回核的允许集合 */
export function facts(input: { cents?: Array<number | null | undefined>; ratios?: Array<number | null | undefined>; plain?: Array<number | null | undefined>; docs?: LoadedDoc[] }): Facts {
  const amounts: number[] = [];
  const percents: number[] = [];
  for (const c of input.cents || []) if (c != null && Number.isFinite(c)) amounts.push(yuan(c));
  for (const r of input.ratios || []) if (r != null && Number.isFinite(r)) { percents.push(Math.round(r * 10000) / 100); amounts.push(Math.round(r * 10000) / 100); }
  for (const n of input.plain || []) if (n != null && Number.isFinite(n)) { amounts.push(n); percents.push(n); }
  for (const d of input.docs || []) for (const n of extractNumbers(d.text)) (n.percent ? percents : amounts).push(n.value);
  return { amounts, percents };
}

export function verifyText(text: string, f: Facts): { ok: boolean; missing: string[] } {
  return verifyNumbers(text, f.amounts, f.percents);
}

/** 引用的原文能不能在上传文件里找到 */
export function quoteFound(docs: LoadedDoc[], quote: string): boolean {
  const q = String(quote || '').trim();
  if (!q) return false;
  return docs.some((d) => locateQuote(d.doc, q).match !== 'none');
}

export type NarrateCall<T> = Omit<SkillCall<T>, 'outputLocale' | 'narratives'> & {
  /** 要回核数字、要做语言检查的叙述字段 */
  texts: (out: T) => string[];
  facts: Facts;
};

/** 模型写叙述 + 数字回核：有找不到的数字时带着问题重写一次，取找不到更少的那次 */
export async function narrate<T>(ctx: RunCtx, call: NarrateCall<T>): Promise<{ data: T; model: string }> {
  const go = (extra = '') => runSkill(ctx.llm, { ...call, task: call.task + extra, outputLocale: ctx.locale, narratives: call.texts });
  const bad = (o: T) => call.texts(o).map((t) => ({ t, c: verifyText(t, call.facts) })).filter((x) => x.t && !x.c.ok);
  const first = await go();
  const fails = bad(first.data);
  if (!fails.length) return { data: first.data, model: first.model };
  try {
    const fb = `\nThese numbers are NOT in the given data or documents and must not be used: ${fails.map((x) => x.c.missing.join(', ')).join('; ')}. Rewrite using only numbers that appear in <data> or in the documents.`;
    const second = await go(fb);
    if (bad(second.data).length <= fails.length) return { data: second.data, model: second.model || first.model };
  } catch { /* 重写失败：保留第一次的结果，逐条标未核实 */ }
  return { data: first.data, model: first.model };
}

/** 叙述 → 结果里的叙述条目 + 第 ⑤ 步回核报告 */
export function toNarratives(items: Array<{ id: string; heading: string; text: string }>, f: Facts, prefix: string): { narratives: FauFpaNarrative[]; verification: FauVerificationItem[] } {
  const narratives: FauFpaNarrative[] = [];
  const verification: FauVerificationItem[] = [];
  for (const it of items) {
    if (!it.text) continue;
    const c = verifyText(it.text, f);
    narratives.push({ id: it.id, heading: it.heading, text: it.text, status: c.ok ? 'verified' : 'unverified', missing: c.missing.length ? c.missing : undefined });
    verification.push({ id: `${prefix}:${it.id}`, ref: `${prefix}:${it.id}`, text: it.text, status: c.ok ? 'verified' : 'unverified', missing: c.missing.length ? c.missing : undefined });
  }
  return { narratives, verification };
}
