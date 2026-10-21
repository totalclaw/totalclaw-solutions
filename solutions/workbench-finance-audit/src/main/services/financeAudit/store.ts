/**
 * 财会审计 · 存储（第 7.2 节）。根目录 accountPath('finance-audit')，全部原子写。
 *
 *   state.json                                   设置
 *   companies/<cid>/company.json                 公司档案（P1）
 *   companies/<cid>/projects/<pid>/project.json  项目（P2）
 *     datasets/<datasetId>.json                  标准数据集（meta + rows）
 *     files/                                     上传原件副本（只读）
 *     runs/<moduleId>/<runId>.json               一次运行
 *     signoffs.jsonl                             签核记录，只追加（第 9.3 节）
 *     handoffs.json                              模块间转交（第 4.3 节）
 *     archive/<runId>/                           签核后的副本 + 签核页 + 哈希清单
 */
import { appendFileSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import type {
  FauCompany, FauDatasetMeta, FauProject, FauRun, FauSettings, FauSignoffRecord, FauStepKey,
} from '@totalclaw/ipc-contracts';
import { FAU_STEP_KEYS } from '@totalclaw/ipc-contracts';
import { accountPath } from '../accountScope';
import { readJsonSafe, writeJsonAtomic } from '../../utils/atomicJson';

export function newId(prefix: string): string {
  return `${prefix}_${randomUUID().replace(/-/g, '').slice(0, 12)}`;
}

export function nowIso(): string {
  return new Date().toISOString();
}

export function defaultSettings(): FauSettings {
  return { currentCompanyId: '', currentProjectId: '', bundle: 'all', moduleModels: {}, outputRoot: '' };
}

/** 新运行的七步初始态 */
export function emptySteps(): FauRun['steps'] {
  return Object.fromEntries(FAU_STEP_KEYS.map((k) => [k, { status: 'todo' }])) as FauRun['steps'];
}

export interface HandoffRecord {
  id: string;
  fromRunId: string;
  fromModuleId: string;
  toModuleId: string;
  at: string;
}

const SAFE_ID = /^[A-Za-z0-9_-]{1,64}$/;
function safeId(id: string): string {
  if (!SAFE_ID.test(String(id || ''))) throw new Error(`invalid id: ${String(id).slice(0, 40)}`);
  return id;
}

function ensureDir(d: string): string {
  mkdirSync(d, { recursive: true });
  return d;
}

function writeJson(path: string, data: unknown): void {
  ensureDir(join(path, '..'));
  writeJsonAtomic(path, data);
}

export class FinanceAuditStore {
  constructor(private readonly rootOf: () => string = () => accountPath('finance-audit')) {}

  root(): string {
    return ensureDir(this.rootOf());
  }

  // ── 设置 ──
  settings(): FauSettings {
    return { ...defaultSettings(), ...readJsonSafe<Partial<FauSettings>>(join(this.root(), 'state.json'), {}) };
  }

  patchSettings(patch: Partial<FauSettings>): FauSettings {
    const next = { ...this.settings(), ...patch };
    writeJson(join(this.root(), 'state.json'), next);
    return next;
  }

  // ── 公司档案 ──
  companyDir(cid: string): string {
    return join(this.root(), 'companies', safeId(cid));
  }

  listCompanies(): FauCompany[] {
    const dir = join(this.root(), 'companies');
    if (!existsSync(dir)) return [];
    return readdirSync(dir)
      .filter((n) => SAFE_ID.test(n))
      .map((n) => readJsonSafe<FauCompany | null>(join(dir, n, 'company.json'), null))
      .filter((c): c is FauCompany => !!c)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }

  getCompany(cid: string): FauCompany | null {
    if (!cid || !SAFE_ID.test(cid)) return null;
    return readJsonSafe<FauCompany | null>(join(this.companyDir(cid), 'company.json'), null);
  }

  saveCompany(c: FauCompany): FauCompany {
    writeJson(join(this.companyDir(c.id), 'company.json'), c);
    return c;
  }

  removeCompany(cid: string): void {
    rmSync(this.companyDir(cid), { recursive: true, force: true });
  }

  // ── 项目 ──
  projectDir(cid: string, pid: string): string {
    return join(this.companyDir(cid), 'projects', safeId(pid));
  }

  listProjects(cid: string): FauProject[] {
    if (!cid) return [];
    const dir = join(this.companyDir(cid), 'projects');
    if (!existsSync(dir)) return [];
    return readdirSync(dir)
      .filter((n) => SAFE_ID.test(n))
      .map((n) => readJsonSafe<FauProject | null>(join(dir, n, 'project.json'), null))
      .filter((p): p is FauProject => !!p)
      .sort((a, b) => b.period.localeCompare(a.period) || b.createdAt.localeCompare(a.createdAt));
  }

  getProject(cid: string, pid: string): FauProject | null {
    if (!cid || !pid || !SAFE_ID.test(cid) || !SAFE_ID.test(pid)) return null;
    return readJsonSafe<FauProject | null>(join(this.projectDir(cid, pid), 'project.json'), null);
  }

  saveProject(p: FauProject): FauProject {
    writeJson(join(this.projectDir(p.companyId, p.id), 'project.json'), p);
    return p;
  }

  // ── 数据集 ──
  filesDir(cid: string, pid: string): string {
    return ensureDir(join(this.projectDir(cid, pid), 'files'));
  }

  saveDataset<T>(cid: string, meta: FauDatasetMeta, rows: T[]): void {
    writeJson(join(this.projectDir(cid, meta.projectId), 'datasets', `${safeId(meta.id)}.json`), { meta, rows });
  }

  datasetMetas(cid: string, pid: string): FauDatasetMeta[] {
    const dir = join(this.projectDir(cid, pid), 'datasets');
    if (!existsSync(dir)) return [];
    const out: FauDatasetMeta[] = [];
    for (const n of readdirSync(dir)) {
      if (!n.endsWith('.json')) continue;
      const d = readJsonSafe<{ meta: FauDatasetMeta } | null>(join(dir, n), null);
      if (d?.meta) out.push(d.meta);
    }
    return out.sort((a, b) => b.importedAt.localeCompare(a.importedAt));
  }

  dataset<T>(cid: string, pid: string, id: string): { meta: FauDatasetMeta; rows: T[] } | null {
    if (!SAFE_ID.test(id)) return null;
    return readJsonSafe<{ meta: FauDatasetMeta; rows: T[] } | null>(join(this.projectDir(cid, pid), 'datasets', `${id}.json`), null);
  }

  removeDataset(cid: string, pid: string, id: string): void {
    rmSync(join(this.projectDir(cid, pid), 'datasets', `${safeId(id)}.json`), { force: true });
  }

  // ── 运行 ──
  private runFile(cid: string, pid: string, moduleId: string, runId: string): string {
    return join(this.projectDir(cid, pid), 'runs', safeId(moduleId), `${safeId(runId)}.json`);
  }

  saveRun(run: FauRun): FauRun {
    run.updatedAt = nowIso();
    writeJson(this.runFile(run.companyId, run.projectId, run.moduleId, run.id), run);
    return run;
  }

  listRuns(cid: string, pid: string, moduleId?: string): FauRun[] {
    const base = join(this.projectDir(cid, pid), 'runs');
    if (!existsSync(base)) return [];
    const mods = moduleId ? [moduleId] : readdirSync(base).filter((n) => SAFE_ID.test(n));
    const out: FauRun[] = [];
    for (const m of mods) {
      const dir = join(base, m);
      if (!existsSync(dir)) continue;
      for (const n of readdirSync(dir)) {
        if (!n.endsWith('.json')) continue;
        const r = readJsonSafe<FauRun | null>(join(dir, n), null);
        if (r) out.push(r);
      }
    }
    return out.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  /** 按 id 找运行：先在给定项目里找，找不到再扫这家公司全部项目 */
  findRun(cid: string, runId: string, pid?: string): FauRun | null {
    if (!SAFE_ID.test(runId)) return null;
    const pids = pid ? [pid, ...this.listProjects(cid).map((p) => p.id).filter((x) => x !== pid)] : this.listProjects(cid).map((p) => p.id);
    for (const p of pids) {
      const base = join(this.projectDir(cid, p), 'runs');
      if (!existsSync(base)) continue;
      for (const m of readdirSync(base)) {
        const f = join(base, m, `${runId}.json`);
        if (existsSync(f)) return readJsonSafe<FauRun | null>(f, null);
      }
    }
    return null;
  }

  /**
   * 进程换了：上次处于 running 的步骤标「已中断」（UX 硬规则三），绝不冒充还在跑。
   * 返回被标记的运行数。
   */
  markInterrupted(): number {
    let n = 0;
    for (const c of this.listCompanies()) {
      for (const p of this.listProjects(c.id)) {
        for (const r of this.listRuns(c.id, p.id)) {
          let touched = false;
          for (const k of Object.keys(r.steps) as FauStepKey[]) {
            if (r.steps[k].status === 'running') {
              r.steps[k] = { ...r.steps[k], status: 'interrupted', finishedAt: Date.now() };
              touched = true;
            }
          }
          if (touched) {
            if (r.status === 'running') r.status = 'draft';
            this.saveRun(r);
            n += 1;
          }
        }
      }
    }
    return n;
  }

  // ── 签核记录（只追加） ──
  signoffFile(cid: string, pid: string): string {
    return join(this.projectDir(cid, pid), 'signoffs.jsonl');
  }

  readSignoffs(cid: string, pid: string): FauSignoffRecord[] {
    const f = this.signoffFile(cid, pid);
    if (!existsSync(f)) return [];
    return readFileSync(f, 'utf8').split('\n').filter((l) => l.trim()).map((l) => JSON.parse(l) as FauSignoffRecord);
  }

  appendSignoff(cid: string, pid: string, rec: FauSignoffRecord): void {
    ensureDir(this.projectDir(cid, pid));
    appendFileSync(this.signoffFile(cid, pid), `${JSON.stringify(rec)}\n`, { encoding: 'utf8', mode: 0o600 });
  }

  // ── 转交 ──
  handoffs(cid: string, pid: string): HandoffRecord[] {
    return readJsonSafe<HandoffRecord[]>(join(this.projectDir(cid, pid), 'handoffs.json'), []);
  }

  addHandoff(cid: string, pid: string, rec: HandoffRecord): void {
    writeJson(join(this.projectDir(cid, pid), 'handoffs.json'), [...this.handoffs(cid, pid), rec]);
  }

  // ── 归档 / 产出 ──
  archiveDir(cid: string, pid: string, runId: string): string {
    return ensureDir(join(this.projectDir(cid, pid), 'archive', safeId(runId)));
  }

  workDir(cid: string, pid: string, runId: string): string {
    return ensureDir(join(this.projectDir(cid, pid), 'work', safeId(runId)));
  }
}
