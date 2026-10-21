/**
 * 审计组的首页待办（第 5.2 节）：内审整改超期、函证超期未回。按「今天」现算，超期会随时间自然出现，不用重跑。
 * 只回词典 key + 参数，界面渲染时翻译。
 */
import { i18nKey } from '@totalclaw/i18n';
import type { FauCompany, FauExtAuditResult, FauInternalAuditResult, FauProject, FauRun, FauTodo } from '@totalclaw/ipc-contracts';
import type { FinanceAuditStore } from '../../store';
import { thresholdsFor } from '../../thresholds';
import { daysBetween } from '../accounting/common';
import { trackOverdue } from './internalAudit/plan';
import { readSent } from './extAudit/sentLog';

function localToday(d = new Date()): string {
  const z = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`;
}

export function auditTodos(store: FinanceAuditStore, company: FauCompany, project: FauProject, r: FauRun, today = localToday()): FauTodo[] {
  if (r.moduleId === 'internal-audit' && r.modeId === 'tracking' && r.result) {
    const th = thresholdsFor('internal-audit', company.thresholds);
    const over = ((r.result as FauInternalAuditResult).tracked || []).map((f) => trackOverdue(f, today, th)).filter((f) => f.tier > 0);
    if (!over.length) return [];
    return [{ id: `ia:${r.id}`, kind: 'escalation', severity: over.some((f) => f.tier >= 2) ? 'danger' : 'warn', moduleId: r.moduleId, runId: r.id, step: 'analyze', message: { key: i18nKey('内审整改：{n} 项超期未整改'), params: { n: over.length } } }];
  }
  if (r.moduleId === 'ext-audit' && r.modeId === 'confirm_prepare' && r.status === 'archived') {
    const days = thresholdsFor('ext-audit', company.thresholds)['confirm.overdueDays'] ?? 10;
    const replied = new Set(store.listRuns(company.id, project.id, 'ext-audit')
      .filter((x) => x.modeId === 'confirm_replies' && (x.result as FauExtAuditResult | undefined)?.sourceRunId === r.id)
      .flatMap((x) => ((x.result as FauExtAuditResult).confirmations || []).filter((c) => c.status === 'replied_match' || c.status === 'replied_diff').map((c) => c.id)));
    const late = readSent(store, company.id, project.id, r.id).filter((s) => s.ok && !replied.has(s.id) && daysBetween(s.at.slice(0, 10), today) >= days);
    const ids = [...new Set(late.map((s) => s.id))];
    if (!ids.length) return [];
    return [{ id: `cf:${r.id}`, kind: 'escalation', severity: 'warn', moduleId: r.moduleId, runId: r.id, step: 'archive', message: { key: i18nKey('函证：{n} 份未回函（超 {d} 天）'), params: { n: ids.length, d: days } } }];
  }
  return [];
}
