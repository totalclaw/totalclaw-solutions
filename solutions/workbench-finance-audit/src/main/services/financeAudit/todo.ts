/**
 * 首页：我的待办、签核队列、本期关账进度、最近产出（第 5.2 节）。
 * 主进程只回词典 key + 参数（i18nKey），界面渲染时翻译，切换语言不会腌死在旧语言。
 */
import { i18nKey } from '@totalclaw/i18n';
import type {
  FauCloseResult, FauHome, FauProject, FauReconResult, FauRun, FauSignoffQueueItem, FauSignoffRecord, FauTodo,
} from '@totalclaw/ipc-contracts';
import { moduleById } from '../../../shared/financeAudit/catalog';
import { FinanceAuditStore } from './store';
import { nextLevel } from './signoff';
import { auditTodos } from './engines/audit/todos';

export function signoffQueue(runs: FauRun[], records: FauSignoffRecord[]): FauSignoffQueueItem[] {
  const out: FauSignoffQueueItem[] = [];
  for (const r of runs) {
    if (r.status === 'returned') {
      out.push({ runId: r.id, moduleId: r.moduleId, projectId: r.projectId, level: r.returned?.level || 'prepare', since: r.returned?.at || r.updatedAt, returned: true });
      continue;
    }
    if (!(r.status === 'ready' || r.status === 'signing') || !r.artifacts.length) continue;
    const level = nextLevel(r, records);
    if (level) out.push({ runId: r.id, moduleId: r.moduleId, projectId: r.projectId, level, since: r.updatedAt, returned: false });
  }
  return out;
}

/** extra：各分组按「每个模块最新一次运行」补的待办（审计组：内审整改超期、函证超期未回） */
export function computeTodos(runs: FauRun[], records: FauSignoffRecord[], extra?: (latest: FauRun) => FauTodo[]): FauTodo[] {
  const todos: FauTodo[] = [];
  // 每个模块只看最新一次运行，旧的被替代
  const latest = new Map<string, FauRun>();
  for (const r of runs) if (r.status !== 'void' && !latest.has(`${r.moduleId}:${r.modeId}`)) latest.set(`${r.moduleId}:${r.modeId}`, r);
  for (const r of latest.values()) {
    const code = moduleById(r.moduleId)?.code || r.moduleId;
    if (Object.values(r.steps).some((s) => s.status === 'interrupted')) {
      todos.push({ id: `int:${r.id}`, kind: 'run_interrupted', severity: 'warn', moduleId: r.moduleId, runId: r.id, step: 'analyze', message: { key: i18nKey('{p0}：上次运行被中断，请重新运行'), params: { p0: code } } });
    }
    if (extra) todos.push(...extra(r));
    if (r.status === 'archived') continue;
    if (r.moduleId === 'recon' && r.result) {
      const res = r.result as FauReconResult;
      const unbalanced = (res.bank || []).filter((a) => !a.statement.balanced || a.items.some((i) => i.cls !== 'matched'));
      if (unbalanced.length) todos.push({ id: `rec:${r.id}`, kind: 'recon_unbalanced', severity: 'warn', moduleId: r.moduleId, runId: r.id, step: 'draft', message: { key: i18nKey('银企对账：{n} 个账户有未达账项或未调平'), params: { n: unbalanced.length } } });
      const gs = res.glsub;
      if (gs && gs.matchRate < 1) todos.push({ id: `gs:${r.id}`, kind: 'recon_unbalanced', severity: 'warn', moduleId: r.moduleId, runId: r.id, step: 'draft', message: { key: i18nKey('总账与子账：{n} 条差异待处理'), params: { n: gs.breaks.filter((b) => b.cls !== 'matched').length } } });
    }
    if (r.moduleId === 'close' && r.result) {
      const cl = (r.result as FauCloseResult).checklist;
      const open = cl ? cl.items.filter((i) => i.mark !== 'ok').length : 0;
      if (open) todos.push({ id: `cl:${r.id}`, kind: 'checklist_open', severity: cl?.canStart ? 'info' : 'warn', moduleId: r.moduleId, runId: r.id, step: 'analyze', message: { key: i18nKey('关账清单：{n} 项未完成'), params: { n: open } } });
    }
    const esc = r.reminders.filter((x) => x.source === 'escalation').length;
    if (esc) todos.push({ id: `esc:${r.id}`, kind: 'escalation', severity: 'danger', moduleId: r.moduleId, runId: r.id, step: 'signoff', message: { key: i18nKey('{p0}：{n} 条升级事项需批准人处理'), params: { p0: code, n: esc } } });
  }
  for (const q of signoffQueue(runs, records)) {
    const code = moduleById(q.moduleId)?.code || q.moduleId;
    todos.push(q.returned
      ? { id: `ret:${q.runId}`, kind: 'signoff_returned', severity: 'danger', moduleId: q.moduleId, runId: q.runId, step: runs.find((r) => r.id === q.runId)?.returned?.toStep || 'analyze', message: { key: i18nKey('{p0}：被退回，请按意见修改'), params: { p0: code } } }
      : { id: `sig:${q.runId}`, kind: 'signoff_pending', severity: 'info', moduleId: q.moduleId, runId: q.runId, step: 'signoff', message: { key: q.level === 'prepare' ? i18nKey('{p0}：待编制人签核') : q.level === 'review' ? i18nKey('{p0}：待复核') : i18nKey('{p0}：待批准'), params: { p0: code } } });
  }
  return todos;
}

export function closeProgress(runs: FauRun[]): FauHome['closeProgress'] {
  const r = runs.find((x) => x.moduleId === 'close' && x.result);
  if (!r) return null;
  const res = r.result as FauCloseResult;
  const items = res.checklist?.items || [];
  return {
    checklistDone: items.filter((i) => i.mark === 'ok').length,
    checklistTotal: items.length,
    trialOk: res.trial ? res.trial.balanced : null,
    tieIssues: res.trial ? res.trial.checks.filter((c) => !c.ok).length : 0,
  };
}

export function buildHome(store: FinanceAuditStore): FauHome {
  const settings = store.settings();
  const companies = store.listCompanies();
  const company = store.getCompany(settings.currentCompanyId) || companies[0] || null;
  const projects: FauProject[] = company ? store.listProjects(company.id) : [];
  const project = (company && store.getProject(company.id, settings.currentProjectId)) || projects[0] || null;
  const runs = company && project ? store.listRuns(company.id, project.id) : [];
  const records = company && project ? store.readSignoffs(company.id, project.id) : [];
  const recent = runs.flatMap((r) => r.artifacts.map((a) => ({ ...a, runId: r.id, moduleId: r.moduleId, archived: r.status === 'archived' })))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 8);
  return {
    settings,
    company,
    companies: companies.map((c) => ({ id: c.id, name: c.name })),
    project,
    projects,
    todos: computeTodos(runs, records, company && project ? (r) => auditTodos(store, company, project, r) : undefined),
    queue: signoffQueue(runs, records),
    closeProgress: closeProgress(runs),
    recent,
  };
}
