/**
 * B2 整改跟踪接收的转交（第 4.3 节）：B1 内控的缺陷台账、B5 舞弊的已立项线索 → 整改台账条目。
 * 只读项目里已签核归档的来源运行，不改 handoff.ts 的口径。
 */
import type { FauCompany, FauFraudResult, FauIcfrResult, FauProject, FauTrackedFinding } from '@totalclaw/ipc-contracts';
import type { FinanceAuditStore } from '../../../store';

export function handoffFindings(store: FinanceAuditStore, company: FauCompany, project: FauProject): FauTrackedFinding[] {
  const out: FauTrackedFinding[] = [];
  for (const h of store.handoffs(company.id, project.id).filter((x) => x.toModuleId === 'internal-audit')) {
    const src = store.findRun(company.id, h.fromRunId, project.id);
    if (!src || src.status !== 'archived') continue;
    if (src.moduleId === 'icfr') {
      for (const d of (src.result as FauIcfrResult | undefined)?.deficiencies || []) {
        if (d.grade === 'improvement') continue;
        out.push({
          id: `B1:${d.id}`, title: d.description, severity: d.grade === 'deficiency' ? 'moderate' : 'major', owner: d.owner, dueDate: d.dueDate,
          status: 'open', closedDate: '', source: 'handoff', fromModule: 'B1', overdueDays: 0, tier: 0,
        });
      }
    } else if (src.moduleId === 'fraud') {
      for (const x of ((src.result as FauFraudResult | undefined)?.hits || []).filter((y) => y.level !== 'info')) {
        out.push({
          id: `B5:${x.id}`, title: x.detail || x.refs.slice(0, 5).join(', '), severity: x.level === 'high' ? 'major' : 'moderate',
          owner: '', dueDate: '', status: 'open', closedDate: '', source: 'handoff', fromModule: 'B5', overdueDays: 0, tier: 0,
        });
      }
    }
  }
  return out;
}
