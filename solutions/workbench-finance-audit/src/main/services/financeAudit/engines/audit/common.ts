/**
 * 审计组 runner 共用的小工具：消息、问题项、产出物条目、输出上下文、截至日、子进度包装、读文件型数据集的文本。
 */
import type { FauArtifact, FauIssue, FauMsg, FauReminder, FauSubProgress } from '@totalclaw/ipc-contracts';
import { STANDARD_LABELS } from '../../../../../shared/financeAudit/regions';
import type { RunCtx } from '../../runner';
import { sha256File } from '../../signoff';
import { newId, nowIso } from '../../store';
import type { OutputCtx } from '../../outputs/close';
import { periodOf } from '../accounting/closeRunner';

export function msg(key: string, params?: Record<string, string | number>): FauMsg {
  return params ? { key, params } : { key };
}

export function blockIssue(id: string, key: string, params?: Record<string, string | number>, rows?: number[]): FauIssue {
  return { id, level: 'block', code: id.split(':')[0], message: msg(key, params), rows: rows?.slice(0, 50) };
}

export function warnIssue(id: string, key: string, params?: Record<string, string | number>, rows?: number[]): FauIssue {
  return { id, level: 'warn', code: id.split(':')[0], message: msg(key, params), rows: rows?.slice(0, 50) };
}

export function reminder(id: string, source: FauReminder['source'], key: string, params?: Record<string, string | number>, approverOnly = false): FauReminder {
  return { id, source, level: 'warn', message: msg(key, params), ...(approverOnly ? { approverOnly } : {}) };
}

export function subSteps(ids: string[], labels: Record<string, string>): FauSubProgress[] {
  return ids.map((id) => ({ id, label: { key: labels[id] || id }, status: 'todo' }));
}

/** 子进度包装：跑之前标 running，完了标 done，抛错标 failed 再抛 */
export async function step<T>(ctx: RunCtx, id: string, fn: () => T | Promise<T>): Promise<T> {
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

export function outputCtx(ctx: RunCtx): OutputCtx {
  const mode = ctx.def.modes.find((m) => m.id === ctx.run.modeId);
  return {
    locale: ctx.locale, dir: ctx.outputDir(), companyName: ctx.company.name, projectName: ctx.project.name, period: periodOf(ctx),
    moduleCode: ctx.def.code, moduleName: ctx.def.name, modeName: mode?.name || ctx.run.modeId,
    standardLabel: STANDARD_LABELS[ctx.profile.standard], model: ctx.run.model,
  };
}

export function artifact(ctx: RunCtx, kind: FauArtifact['kind'], path: string, title: string): FauArtifact {
  return { id: newId('art'), kind, path, sha256: sha256File(path) || '', title: { key: title }, locale: ctx.locale, createdAt: nowIso() };
}

/** 截至日：运行参数 asOf（YYYY-MM-DD），否则今天（本地日期） */
export function asOfOf(ctx: Pick<RunCtx, 'run'>, now = new Date()): string {
  const p = String(ctx.run.params.asOf || '');
  if (/^\d{4}-\d{2}-\d{2}$/.test(p)) return p;
  const z = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${z(now.getMonth() + 1)}-${z(now.getDate())}`;
}

export function num(v: unknown, fallback: number): number {
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : fallback;
}

/** 本次运行某槽位挂的数据集（文件型） */
export function slotMetas(ctx: RunCtx, slot: string) {
  return ctx.datasets(slot);
}
