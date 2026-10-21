/**
 * B3 函证发送记录：只追加，存在项目工作区 work/<函证准备运行 id>/confirm-sent.json（不改已归档的运行与签核记录）。
 */
import { join } from 'node:path';
import { readJsonSafe, writeJsonAtomic } from '../../../../../utils/atomicJson';
import type { FinanceAuditStore } from '../../../store';
import type { SentRecord } from './confirm';

const file = (store: FinanceAuditStore, cid: string, pid: string, runId: string) => join(store.workDir(cid, pid, runId), 'confirm-sent.json');

export function readSent(store: FinanceAuditStore, cid: string, pid: string, runId: string): SentRecord[] {
  return readJsonSafe<SentRecord[]>(file(store, cid, pid, runId), []);
}

export function appendSent(store: FinanceAuditStore, cid: string, pid: string, runId: string, recs: SentRecord[]): void {
  writeJsonAtomic(file(store, cid, pid, runId), [...readSent(store, cid, pid, runId), ...recs]);
}
