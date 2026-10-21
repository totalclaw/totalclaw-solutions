/**
 * A3 已签核账龄的只读出口（第 4.3 节 A3 → E5 / E6）：项目里最近一次签核归档的应收账龄运行，
 * 按账龄分层与客户给出未清余额。只认 archived（签核通过）的运行，草稿和被退回的不算。
 * E5 预期信用损失（批次 6）从这里取简化法拨备矩阵的输入。
 */
import type { FauArResult, FauSignedAging } from '@totalclaw/ipc-contracts';
import type { FinanceAuditStore } from '../../../store';

export function signedAging(store: FinanceAuditStore, companyId: string, projectId: string): FauSignedAging | null {
  const run = store.listRuns(companyId, projectId, 'ar')
    .filter((r) => r.status === 'archived' && r.result)
    .sort((a, b) => (b.archivedAt || '').localeCompare(a.archivedAt || ''))[0];
  if (!run) return null;
  const res = run.result as FauArResult;
  return {
    runId: run.id, asOf: res.asOf, archivedAt: run.archivedAt || '',
    buckets: res.buckets,
    customers: res.customers.map((c) => ({ customer: c.customer, byBucket: c.byBucket, open: c.open })),
  };
}
