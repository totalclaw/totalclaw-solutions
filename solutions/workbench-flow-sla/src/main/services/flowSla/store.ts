/**
 * 流程时效监控的落盘：账号私有目录 flow-sla/ 下
 *   state.json          设置 / 阈值 / 流程名对应 / 节点内外部决定 / 本次通报进度 / 周期快照目录 / 在途跟进 / 改善台账 / 提醒记录（原子写）
 *   data.json           本次导入的标准化流程行、节点行、花名册（量大，单独一个文件）
 *   rules.json          导入的规则表（没有就用内置规则）
 *   snapshots/<id>.json 每个周期的输入数据与当时的规则，看板按筛选条件重算时用
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, renameSync, unlinkSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import type { FsLedgerItem, FsReminder, FsSession, FsSettings, FsSnapshotMeta, FsThresholds, FsTrackItem } from '@totalclaw/ipc-contracts';
import { accountPath } from '../accountScope';
import type { CalcOptions, FlowRow, NodeRow, SlaRules } from './calc';
import type { NodeDecision, RosterRow } from './ingest';
import defaultRulesJson from './defaultRules.json';

export const DEFAULT_RULES = defaultRulesJson as unknown as SlaRules;
export const MAX_SNAPSHOTS = 80;

export interface FsStored {
  settings: FsSettings;
  thresholds: Partial<FsThresholds>;
  /** `${系统}|${归一后的流程名}` → 规则细类名，或 REGULAR */
  aliases: Record<string, string>;
  aliasNames: Record<string, string>;
  nodeDecisions: NodeDecision[];
  session: FsSession;
  snapshots: FsSnapshotMeta[];
  tracking: FsTrackItem[];
  ledger: FsLedgerItem[];
  reminders: FsReminder[];
}

export interface FsData { flows: FlowRow[]; nodes: NodeRow[]; roster: RosterRow[] }
export interface FsSnapshotData extends FsData { options: CalcOptions; rules: SlaRules; aliases: Record<string, string> }

export function newId(prefix: string): string {
  return `${prefix}_${randomUUID().replace(/-/g, '').slice(0, 12)}`;
}

export function emptySession(): FsSession {
  return { period: null, ingest: null, snapshotId: '', prevSnapshotId: '', cases: [], rootCauses: {}, summary: '', suggestions: [], summaryBy: '', reportFiles: [], sentAt: '', ledgerWritten: false };
}

function normalize(raw: any): FsStored {
  const arr = <T>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);
  const obj = <T>(v: unknown): Record<string, T> => (v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, T>) : {});
  const s = raw?.settings || {};
  const dates = (v: unknown): string[] => [...new Set(arr<string>(v).map((x) => String(x).trim()).filter((x) => /^\d{4}-\d{2}-\d{2}$/.test(x)))].sort();
  return {
    settings: {
      outputDir: String(s.outputDir || ''), weeklyRecipients: String(s.weeklyRecipients || ''), monthlyRecipients: String(s.monthlyRecipients || ''),
      holidays: dates(s.holidays), extraWorkdays: dates(s.extraWorkdays),
    },
    thresholds: obj<number>(raw?.thresholds),
    aliases: obj<string>(raw?.aliases),
    aliasNames: obj<string>(raw?.aliasNames),
    nodeDecisions: arr<NodeDecision>(raw?.nodeDecisions),
    session: { ...emptySession(), ...(raw?.session || {}), cases: arr(raw?.session?.cases), suggestions: arr(raw?.session?.suggestions), reportFiles: arr(raw?.session?.reportFiles), rootCauses: obj<string>(raw?.session?.rootCauses) },
    snapshots: arr<FsSnapshotMeta>(raw?.snapshots),
    tracking: arr<FsTrackItem>(raw?.tracking).map((t) => ({ ...t, notes: arr(t.notes) })),
    ledger: arr<FsLedgerItem>(raw?.ledger).map((l) => ({ ...l, progress: arr(l.progress) })),
    reminders: arr<FsReminder>(raw?.reminders),
  };
}

function atomicWrite(file: string, data: unknown): void {
  writeFileSync(`${file}.tmp`, JSON.stringify(data), 'utf-8');
  renameSync(`${file}.tmp`, file);
}

function readJson(file: string): any {
  try { return existsSync(file) ? JSON.parse(readFileSync(file, 'utf-8')) : null; } catch { return null; }
}

export class FlowSlaStore {
  private cache: FsStored | null = null;
  private dataCache: FsData | null = null;
  private rulesCache: SlaRules | null | undefined;
  private cacheDir = '';

  constructor(private readonly dirOf: () => string = () => accountPath('flow-sla')) {}

  root(): string {
    const d = this.dirOf();
    if (d !== this.cacheDir) { this.cache = null; this.dataCache = null; this.rulesCache = undefined; this.cacheDir = d; }
    mkdirSync(d, { recursive: true });
    return d;
  }

  read(): FsStored {
    const dir = this.root();
    if (!this.cache) this.cache = normalize(readJson(join(dir, 'state.json')));
    return this.cache;
  }

  update<T>(fn: (s: FsStored) => T): T {
    this.read();
    const out = fn(this.cache!);
    this.cache!.reminders = this.cache!.reminders.slice(0, 200);
    atomicWrite(join(this.root(), 'state.json'), this.cache);
    return out;
  }

  data(): FsData {
    const dir = this.root();
    if (!this.dataCache) {
      const raw = readJson(join(dir, 'data.json'));
      this.dataCache = { flows: Array.isArray(raw?.flows) ? raw.flows : [], nodes: Array.isArray(raw?.nodes) ? raw.nodes : [], roster: Array.isArray(raw?.roster) ? raw.roster : [] };
    }
    return this.dataCache;
  }

  setData(data: FsData): void {
    this.root();
    this.dataCache = data;
    atomicWrite(join(this.root(), 'data.json'), data);
  }

  /** 导入的规则表；没有导入过返回 null */
  customRules(): SlaRules | null {
    const dir = this.root();
    if (this.rulesCache === undefined) {
      const raw = readJson(join(dir, 'rules.json'));
      this.rulesCache = raw && Array.isArray(raw.e2e) && Array.isArray(raw.cssNodes) && Array.isArray(raw.oaFkNodes) && Array.isArray(raw.personal) && Array.isArray(raw.managers) ? (raw as SlaRules) : null;
    }
    return this.rulesCache;
  }

  baseRules(): SlaRules { return this.customRules() ?? DEFAULT_RULES; }

  setCustomRules(rules: SlaRules | null): void {
    const file = join(this.root(), 'rules.json');
    this.rulesCache = rules;
    if (rules) atomicWrite(file, rules);
    else if (existsSync(file)) unlinkSync(file);
  }

  private snapDir(): string {
    const d = join(this.root(), 'snapshots');
    mkdirSync(d, { recursive: true });
    return d;
  }

  saveSnapshot(meta: FsSnapshotMeta, data: FsSnapshotData): void {
    atomicWrite(join(this.snapDir(), `${meta.id}.json`), data);
    this.update((s) => {
      s.snapshots = [meta, ...s.snapshots.filter((x) => x.id !== meta.id)].sort((a, b) => b.periodEnd - a.periodEnd || b.savedAt.localeCompare(a.savedAt));
      for (const old of s.snapshots.slice(MAX_SNAPSHOTS)) this.dropSnapshotFile(old.id);
      s.snapshots = s.snapshots.slice(0, MAX_SNAPSHOTS);
    });
  }

  snapshotData(id: string): FsSnapshotData | null {
    if (!/^[\w-]+$/.test(id)) return null;
    const raw = readJson(join(this.snapDir(), `${id}.json`));
    return raw && Array.isArray(raw.flows) && Array.isArray(raw.nodes) && raw.options && raw.rules ? { roster: [], aliases: {}, ...raw } : null;
  }

  removeSnapshot(id: string): void {
    this.update((s) => { s.snapshots = s.snapshots.filter((x) => x.id !== id); });
    this.dropSnapshotFile(id);
  }

  private dropSnapshotFile(id: string): void {
    try { if (/^[\w-]+$/.test(id)) unlinkSync(join(this.snapDir(), `${id}.json`)); } catch { /* 已经没有了 */ }
  }

  snapshotFiles(): string[] {
    try { return readdirSync(this.snapDir()).filter((f) => f.endsWith('.json')); } catch { return []; }
  }
}
