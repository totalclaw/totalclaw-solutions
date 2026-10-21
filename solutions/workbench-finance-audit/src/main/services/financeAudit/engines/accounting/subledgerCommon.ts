/**
 * 批次 2（A3–A8）runner 共用：截止日、校验报告拼装、产出上下文、产出物登记。
 */
import type { FauArtifact, FauIssue, FauMsg, FauValidationReport } from '@totalclaw/ipc-contracts';
import { STANDARD_LABELS } from '../../../../../shared/financeAudit/regions';
import type { RunCtx } from '../../runner';
import { sha256File } from '../../signoff';
import { newId, nowIso } from '../../store';
import type { OutputCtx } from '../../outputs/close';
import { periodEnd, msg } from './common';
import { periodOf, withDatasetIssues } from './closeRunner';

/** 截止日：运行参数 asOf（YYYY-MM-DD）优先，否则项目期间的月末 */
export function asOfOf(ctx: Pick<RunCtx, 'project' | 'run'>): string {
  const p = String(ctx.run.params.asOf || '');
  if (/^\d{4}-\d{2}-\d{2}$/.test(p)) return p;
  const period = periodOf(ctx);
  return /^\d{4}-\d{2}$/.test(period) ? periodEnd(period) : `${period}-12-31`;
}

export class IssueList {
  readonly blockers: FauIssue[] = [];
  readonly warnings: FauIssue[] = [];
  readonly checks: FauValidationReport['checks'] = [];
  add(level: 'block' | 'warn', code: string, key: string, params: Record<string, string | number> = {}, rows?: number[]): void {
    const list = level === 'block' ? this.blockers : this.warnings;
    list.push({ id: `${code}-${list.length + 1}`, level, code, message: msg(key, params), rows: rows?.slice(0, 50) });
  }
  /** 检查项汇总行（TRUE / FALSE）；具体问题由 add() 逐条写，阻断与否看 blockers */
  check(id: string, ok: boolean, level: 'block' | 'warn', message: FauMsg): void {
    this.checks.push({ id, ok, level, message });
  }
  has(code: string): boolean {
    return [...this.blockers, ...this.warnings].some((i) => i.code === code);
  }
  report(ctx: RunCtx, slots: string[]): FauValidationReport {
    return withDatasetIssues({ checks: this.checks, blockers: this.blockers, warnings: this.warnings }, ctx, slots);
  }
}

/** 同一键出现多次的行（重复导入 / 重复登记） */
export function duplicateRows<T extends { row: number }>(rows: T[], key: (r: T) => string): number[] {
  const seen = new Map<string, number>();
  const dup: number[] = [];
  for (const r of rows) {
    const k = key(r);
    if (!k) continue;
    if (seen.has(k)) dup.push(r.row);
    else seen.set(k, r.row);
  }
  return dup;
}

export function outputCtxOf(ctx: RunCtx): OutputCtx {
  const run = ctx.run;
  const mode = ctx.def.modes.find((m) => m.id === run.modeId);
  return {
    locale: ctx.locale, dir: ctx.outputDir(), companyName: ctx.company.name, projectName: ctx.project.name, period: periodOf(ctx),
    moduleCode: ctx.def.code, moduleName: ctx.def.name, modeName: mode?.name || run.modeId, standardLabel: STANDARD_LABELS[ctx.profile.standard], model: run.model,
  };
}

export function artifactOf(ctx: RunCtx, kind: FauArtifact['kind'], path: string, title: string): FauArtifact {
  return { id: newId('art'), kind, path, sha256: sha256File(path) || '', title: { key: title }, locale: ctx.locale, createdAt: nowIso() };
}
