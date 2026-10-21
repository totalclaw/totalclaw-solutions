/**
 * 人工签核（第 9 节）：编制 → 复核 → 批准，记录只追加、哈希成链。
 *
 *   - 职责分离：同一次运行里编制人与复核人不能是同一人；公司档案 sodMode='block' 时拦下，
 *     'record' 时放行但记 sodWaived，签核页印「职责未分离」。
 *   - 升级规则：运行的 requiredLevels 已由引擎结果加上批准级（试算不平、跨期 > 5 万、银行不明扣款 > 1000 …）。
 *   - 提醒项：通过（approve）前必须逐条勾「已知悉」并填理由；approverOnly 的条目只能由批准人勾。
 *   - 退回：必须写意见，运行回到退回意见指向的那一步。
 *   - 校验：重算整条链 + 比对签核时的文件哈希与当前文件（归档后以归档副本为准），任何一处不符即「签核失效」。
 */
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import { i18nKey } from '@totalclaw/i18n';
import type {
  FauReminder, FauRun, FauSignLevel, FauSignoffRecord, FauSignoffVerify, FauStepKey,
} from '@totalclaw/ipc-contracts';
import { FAU_SIGN_LEVELS } from '@totalclaw/ipc-contracts';
import { newId, nowIso } from './store';

export const GENESIS = '0'.repeat(64);

export class SignoffError extends Error {
  constructor(public readonly code: string, message: string, public readonly params: Record<string, string | number> = {}) {
    super(message);
  }
}

export function sha256File(path: string): string | null {
  try { return createHash('sha256').update(readFileSync(path)).digest('hex'); } catch { return null; }
}

/** 键排序后的 JSON（哈希要与字段顺序无关） */
function canonical(v: unknown): string {
  if (Array.isArray(v)) return `[${v.map(canonical).join(',')}]`;
  if (v && typeof v === 'object') {
    return `{${Object.keys(v as Record<string, unknown>).sort().filter((k) => (v as any)[k] !== undefined)
      .map((k) => `${JSON.stringify(k)}:${canonical((v as any)[k])}`).join(',')}}`;
  }
  return JSON.stringify(v);
}

export function recordHash(rec: Omit<FauSignoffRecord, 'hash'>): string {
  return createHash('sha256').update(canonical(rec)).digest('hex');
}

const sameSigner = (a: { name: string }, b: { name: string }) => a.name.trim().toLowerCase() === b.name.trim().toLowerCase();

/** 本次运行最近一次退回之后的有效签核 */
export function activeRecords(runId: string, all: FauSignoffRecord[]): FauSignoffRecord[] {
  const mine = all.filter((r) => r.runId === runId);
  let lastReturn = -1;
  mine.forEach((r, i) => { if (r.decision === 'return') lastReturn = i; });
  return mine.slice(lastReturn + 1);
}

export function nextLevel(run: FauRun, all: FauSignoffRecord[]): FauSignLevel | null {
  const done = new Set(activeRecords(run.id, all).filter((r) => r.decision === 'approve').map((r) => r.level));
  return run.requiredLevels.find((l) => !done.has(l)) || null;
}

/** 这一级必须勾「已知悉」的提醒项 */
export function requiredAcks(run: FauRun, level: FauSignLevel): FauReminder[] {
  return run.reminders.filter((r) => (r.approverOnly ? level === 'approve' : true));
}

export interface SignInput {
  level: FauSignLevel;
  decision: 'approve' | 'return';
  signer: { name: string; title: string };
  comment?: string;
  acknowledged?: string[];
  returnToStep?: FauStepKey;
}

/**
 * 校验并生成一条签核记录（不落盘，调用方 append）。
 * artifacts 由调用方按当前文件现算哈希传进来。
 */
export function buildRecord(
  run: FauRun, all: FauSignoffRecord[], input: SignInput,
  opts: { sodMode: 'block' | 'record'; artifacts: { path: string; sha256: string }[]; prevHash: string },
): FauSignoffRecord {
  if (!FAU_SIGN_LEVELS.includes(input.level)) throw new SignoffError('bad_level', i18nKey('签核级别不对'));
  if (!input.signer?.name?.trim()) throw new SignoffError('no_signer', i18nKey('请选择签核人身份'));
  if (run.status === 'archived' || run.status === 'void') throw new SignoffError('closed', i18nKey('这次运行已归档或作废，不能再签核'));
  if (!run.artifacts.length) throw new SignoffError('no_artifacts', i18nKey('还没有生成底稿，不能签核'));
  const expected = nextLevel(run, all);
  if (!expected) throw new SignoffError('done', i18nKey('各级签核都已完成'));
  if (input.level !== expected) throw new SignoffError('order', i18nKey('现在轮到「{p0}」签核'), { p0: expected });

  const active = activeRecords(run.id, all);
  let sodWaived = false;
  const preparer = active.find((r) => r.level === 'prepare' && r.decision === 'approve');
  if (input.level === 'review' && preparer && sameSigner(preparer.signer, input.signer)) {
    if (opts.sodMode === 'block') throw new SignoffError('sod', i18nKey('职责分离：编制人和复核人不能是同一人（{p0}）'), { p0: input.signer.name });
    sodWaived = true;
  }

  const comment = String(input.comment || '').trim();
  if (input.decision === 'return') {
    if (input.level === 'prepare') throw new SignoffError('prepare_return', i18nKey('编制人不能退回，请直接修改后重新生成'));
    if (!comment) throw new SignoffError('need_comment', i18nKey('退回必须写意见'));
  } else {
    const acks = new Set(input.acknowledged || []);
    const need = requiredAcks(run, input.level);
    const missing = need.filter((r) => !acks.has(r.id));
    if (missing.length) throw new SignoffError('need_ack', i18nKey('还有 {n} 条提醒项没有勾「已知悉」'), { n: missing.length });
    if (need.length && !comment) throw new SignoffError('need_reason', i18nKey('有提醒项时必须填写知悉理由'));
    const approverOnlyByOthers = input.level !== 'approve' && (input.acknowledged || []).some((id) => run.reminders.find((r) => r.id === id)?.approverOnly);
    if (approverOnlyByOthers) throw new SignoffError('approver_only', i18nKey('标「批准人确认」的条目只能由批准人勾选'));
  }

  const base: Omit<FauSignoffRecord, 'hash'> = {
    id: newId('sig'), runId: run.id, moduleId: run.moduleId, projectId: run.projectId,
    level: input.level, decision: input.decision,
    signer: { name: input.signer.name.trim(), title: String(input.signer.title || '').trim() },
    comment: comment || undefined,
    acknowledged: [...new Set(input.acknowledged || [])],
    artifacts: opts.artifacts,
    sodWaived: sodWaived || undefined,
    returnToStep: input.decision === 'return' ? (input.returnToStep || 'analyze') : undefined,
    at: nowIso(),
    prevHash: opts.prevHash,
  };
  return { ...base, hash: recordHash(base) };
}

export function lastHash(all: FauSignoffRecord[]): string {
  return all.length ? all[all.length - 1].hash : GENESIS;
}

/** 重算哈希链（只追加记录被改 / 删 / 插都会断） */
export function verifyChain(all: FauSignoffRecord[]): boolean {
  let prev = GENESIS;
  for (const r of all) {
    if (r.prevHash !== prev) return false;
    const { hash, ...rest } = r;
    if (recordHash(rest) !== hash) return false;
    prev = hash;
  }
  return true;
}

/**
 * 校验一次运行（或整个项目）的签核：链完整 + 文件哈希一致。
 * archiveDirOf(runId) 返回归档目录（已归档的以归档副本为准）。
 */
export function verifySignoffs(
  all: FauSignoffRecord[], runs: FauRun[], archiveDirOf: (runId: string) => string | null, runId?: string,
): FauSignoffVerify {
  const chainOk = verifyChain(all);
  const tampered: FauSignoffVerify['tampered'] = [];
  const targets = runs.filter((r) => !runId || r.id === runId);
  for (const run of targets) {
    const recs = activeRecords(run.id, all).filter((r) => r.decision === 'approve');
    const last = recs[recs.length - 1];
    if (!last) continue;
    const dir = run.status === 'archived' ? archiveDirOf(run.id) : null;
    for (const a of last.artifacts) {
      const p = dir ? join(dir, basename(a.path)) : a.path;
      const actual = existsSync(p) ? sha256File(p) : null;
      if (actual !== a.sha256) tampered.push({ path: p, expected: a.sha256, actual });
    }
  }
  const ok = chainOk && tampered.length === 0;
  return {
    ok, chainOk, tampered, records: all.length,
    message: ok
      ? { key: i18nKey('签核有效：{n} 条记录，哈希链完整，文件未被改动'), params: { n: all.length } }
      : !chainOk
        ? { key: i18nKey('签核失效：签核记录被改动过（哈希链断开）') }
        : { key: i18nKey('签核失效：{n} 个已签核文件被改动或缺失'), params: { n: tampered.length } },
  };
}
