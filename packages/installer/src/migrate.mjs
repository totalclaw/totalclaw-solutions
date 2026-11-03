// 数据迁移：按账号数据目录执行方案包里的有序迁移脚本。
//
// 约定：
//   - 数据版本记在 <dataRoot>/.solution-data/<id>.json 的 schemaVersion（缺省视为 1）
//   - 迁移脚本 <package>/migrations/NNN-<name>.mjs，导出 { from, to, up(ctx) }（default 或具名导出均可）
//   - 迁移前把 manifest.data.paths 快照到 <dataRoot>/.solution-backups/<id>/<from>-<ts>/，保留最近 3 份
//   - 任一步失败：从快照恢复、数据版本不变、抛出 MigrationError（调用方据此不激活新版本）
//   - 数据版本高于代码支持的版本：抛出 DowngradeError（防止旧代码写坏新数据）
import { cpSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { readJsonFile, rmrf, safeJoin, writeJsonAtomic } from './fsutil.mjs';

export const KEEP_BACKUPS = 3;

export class MigrationError extends Error {
  constructor(message, cause) {
    super(message);
    this.code = 'MIGRATION_FAILED';
    this.cause = cause;
  }
}

export class DowngradeError extends Error {
  constructor(id, dataVersion, codeVersion) {
    super(`${id} 的数据版本 ${dataVersion} 高于当前代码支持的 ${codeVersion}，请升级方案后再使用`);
    this.code = 'DATA_DOWNGRADE';
  }
}

/** data.paths 中 `file#key` 形式表示宿主共享文件里属于本方案的键，不参与快照/删除 */
export function ownedDataPaths(manifest) {
  return (manifest?.data?.paths || []).filter((p) => !p.includes('#')).map((p) => p.replace(/\/$/, ''));
}

/**
 * data.uses：本方案也读写、但属于别的方案的数据路径（如经营自动化读服装店的商品库）。
 * 不参与本方案的快照 / 删除；只用于卸载别的方案删数据时，判定这些路径还有人在用、不能删。
 * 放在 paths 之外是为了旧客户端：它们只认 paths，碰到 uses 直接忽略，不会把别人的数据当成自己的删掉。
 */
export function usedDataPaths(manifest) {
  const uses = manifest?.data?.uses;
  return (Array.isArray(uses) ? uses : []).filter((p) => typeof p === 'string' && p && !p.includes('#')).map((p) => p.replace(/\/$/, ''));
}

export function dataMetaFile(dataRoot, id) {
  return join(dataRoot, '.solution-data', `${id}.json`);
}

export function readDataVersion(dataRoot, id) {
  return readJsonFile(dataMetaFile(dataRoot, id), null)?.schemaVersion ?? 1;
}

/** 迁移前必须确认不会降级 */
export function assertNotDowngrade(dataRoot, manifest) {
  const dataVersion = readDataVersion(dataRoot, manifest.id);
  const codeVersion = manifest.data?.schemaVersion ?? 1;
  if (dataVersion > codeVersion) throw new DowngradeError(manifest.id, dataVersion, codeVersion);
}

export async function loadMigrations(packageDir) {
  const dir = join(packageDir, 'migrations');
  if (!existsSync(dir)) return [];
  const files = readdirSync(dir).filter((f) => /^\d+[-_].+\.mjs$/.test(f)).sort();
  const out = [];
  for (const f of files) {
    const mod = await import(pathToFileURL(join(dir, f)).href);
    const m = mod.default && typeof mod.default === 'object' ? mod.default : mod;
    if (!Number.isInteger(m.from) || !Number.isInteger(m.to) || typeof m.up !== 'function' || m.to <= m.from) {
      throw new MigrationError(`迁移脚本 ${f} 必须导出 { from, to, up }，且 to > from`);
    }
    out.push({ file: f, from: m.from, to: m.to, up: m.up });
  }
  return out;
}

/** 从 current 走到 target 的迁移链；断档返回 null */
export function planChain(migrations, current, target) {
  const chain = [];
  let v = current;
  while (v < target) {
    const step = migrations.find((m) => m.from === v);
    if (!step) return null;
    chain.push(step);
    v = step.to;
  }
  return v === target ? chain : null;
}

function snapshot(dataRoot, id, paths, fromVersion) {
  const base = join(dataRoot, '.solution-backups', id);
  const dir = join(base, `${fromVersion}-${new Date().toISOString().replace(/[:.]/g, '-')}`);
  const saved = [];
  for (const p of paths) {
    const src = safeJoin(dataRoot, p);
    if (!existsSync(src)) continue;
    cpSync(src, safeJoin(dir, p), { recursive: true });
    saved.push(p);
  }
  writeJsonAtomic(join(dir, 'snapshot.json'), { id, fromVersion, paths, saved, at: new Date().toISOString() });
  const all = existsSync(base) ? readdirSync(base).sort() : [];
  for (const old of all.slice(0, Math.max(0, all.length - KEEP_BACKUPS))) rmrf(join(base, old));
  return { dir, saved };
}

function restore(dataRoot, paths, snap) {
  for (const p of paths) {
    const target = safeJoin(dataRoot, p);
    rmrf(target);
    if (snap.saved.includes(p)) cpSync(safeJoin(snap.dir, p), target, { recursive: true });
  }
}

/**
 * 对一个账号数据目录执行迁移。
 * @returns {{ from:number, to:number, steps:string[], backup?:string }}
 */
export async function migrateData({ packageDir, manifest, dataRoot, log = () => {} }) {
  const id = manifest.id;
  const target = manifest.data?.schemaVersion ?? 1;
  const current = readDataVersion(dataRoot, id);
  if (current > target) throw new DowngradeError(id, current, target);
  if (current === target) return { from: current, to: target, steps: [] };

  const chain = planChain(await loadMigrations(packageDir), current, target);
  if (!chain) throw new MigrationError(`${id} 缺少从数据版本 ${current} 到 ${target} 的迁移脚本`);

  const paths = ownedDataPaths(manifest);
  const snap = snapshot(dataRoot, id, paths, current);
  const ctx = {
    id,
    dataRoot,
    dataPath: (rel) => safeJoin(dataRoot, rel),
    readJson: (rel, fallback = null) => readJsonFile(safeJoin(dataRoot, rel), fallback),
    writeJson: (rel, value) => writeJsonAtomic(safeJoin(dataRoot, rel), value),
    log,
  };
  const steps = [];
  try {
    for (const step of chain) {
      log(`[${id}] 迁移 ${step.file}: ${step.from} → ${step.to}`);
      await step.up({ ...ctx, from: step.from, to: step.to });
      steps.push(step.file);
    }
  } catch (err) {
    restore(dataRoot, paths, snap);
    throw new MigrationError(`${id} 数据迁移失败（已从快照恢复）：${err.message}`, err);
  }
  const meta = readJsonFile(dataMetaFile(dataRoot, id), {}) || {};
  writeJsonAtomic(dataMetaFile(dataRoot, id), {
    id,
    schemaVersion: target,
    migratedAt: new Date().toISOString(),
    history: [...(meta.history || []), { from: current, to: target, steps, version: manifest.version, at: new Date().toISOString() }],
  });
  return { from: current, to: target, steps, backup: snap.dir };
}
