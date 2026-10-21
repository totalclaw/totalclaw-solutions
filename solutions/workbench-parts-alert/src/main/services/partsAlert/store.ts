/**
 * 配件预警与补库的落盘：账号私有目录 parts-alert/ 下
 *   state.json   规则 / 定时设置 / 各数据集的来源与列对应 / 当前这次运算的检验与补库修改 / 运算历史（原子写）
 *   data.json    读进来的五类数据行（量大，单独一个文件）
 *   result.json  向导里当前这次运算的逐配件结果
 *   latest.json  最近一次运算（手动或定时）的逐配件结果，预警看板与「相比上次新增」用
 */
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import type {
  PaDatasetKey, PaDatasetMeta, PaHistoryEntry, PaLatest, PaPartResult, PaRules, PaRun, PaSchedule, PaScheduleStatus, PaSettings,
} from '@totalclaw/ipc-contracts';
import { accountPath } from '../accountScope';
import { DEFAULT_PARAMS } from './calc';
import type { DatasetRows } from './ingest';
import KW from './columnKeywords.json';

export interface PaStored {
  settings: PaSettings;
  datasets: Record<PaDatasetKey, PaDatasetMeta | null>;
  run: PaRun | null;
  history: PaHistoryEntry[];
  scheduleStatus: PaScheduleStatus;
  latest: PaLatest | null;
}

export const HISTORY_LIMIT = 120;

export function newId(prefix: string): string {
  return `${prefix}_${randomUUID().replace(/-/g, '').slice(0, 12)}`;
}

export function defaultRules(): PaRules {
  return { ...DEFAULT_PARAMS };
}

export function defaultKeywords(): Record<PaDatasetKey, string[]> {
  const k = KW.fileKeywords as Record<PaDatasetKey, string[]>;
  return { monthly: [...k.monthly], yearly: [...k.yearly], leadTime: [...k.leadTime], inTransit: [...k.inTransit], stock: [...k.stock] };
}

export function defaultSchedule(): PaSchedule {
  return { enabled: false, time: '08:00', folder: '', keywords: defaultKeywords(), notify: true, emailEnabled: false, emailTo: '' };
}

const clampInt = (v: unknown, min: number, max: number, fallback: number): number => {
  const n = Math.round(Number(v));
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
};

/** 规则收口：都是正整数，报废评估月数不小于呆滞月数 */
export function normalizeRules(raw: Partial<PaRules> | null | undefined): PaRules {
  const d = defaultRules();
  const r = raw || {};
  const stagnantMonths = clampInt(r.stagnantMonths, 1, 120, d.stagnantMonths);
  return {
    safetyDays: clampInt(r.safetyDays, 0, 365, d.safetyDays),
    reviewDays: clampInt(r.reviewDays, 1, 365, d.reviewDays),
    redundantMonths: clampInt(r.redundantMonths, 1, 120, d.redundantMonths),
    stagnantMonths,
    scrapMonths: Math.max(stagnantMonths, clampInt(r.scrapMonths, 1, 240, d.scrapMonths)),
    defaultLeadDays: clampInt(r.defaultLeadDays, 1, 365, d.defaultLeadDays),
    seasonal: r.seasonal === undefined ? d.seasonal : !!r.seasonal,
  };
}

export function normalizeKeywords(raw: unknown): Record<PaDatasetKey, string[]> {
  const d = defaultKeywords();
  const src = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const out = {} as Record<PaDatasetKey, string[]>;
  for (const k of Object.keys(d) as PaDatasetKey[]) {
    const list = Array.isArray(src[k]) ? (src[k] as unknown[]).map((x) => String(x || '').trim()).filter(Boolean) : null;
    out[k] = list && list.length ? [...new Set(list)].slice(0, 12) : d[k];
  }
  return out;
}

export function normalizeSchedule(raw: Partial<PaSchedule> | null | undefined): PaSchedule {
  const d = defaultSchedule();
  const s = raw || {};
  return {
    enabled: !!s.enabled,
    time: /^([01]?\d|2[0-3]):[0-5]\d$/.test(String(s.time || '')) ? String(s.time).padStart(5, '0') : d.time,
    folder: String(s.folder || ''),
    keywords: normalizeKeywords(s.keywords),
    notify: s.notify === undefined ? d.notify : !!s.notify,
    emailEnabled: !!s.emailEnabled,
    emailTo: String(s.emailTo || '').trim(),
  };
}

const EMPTY_DATASETS = (): Record<PaDatasetKey, PaDatasetMeta | null> => ({ monthly: null, yearly: null, leadTime: null, inTransit: null, stock: null });
export const emptyData = (): DatasetRows => ({ monthly: [], yearly: [], leadTime: [], inTransit: [], stock: [] });

function normalize(raw: any): PaStored {
  const ds = EMPTY_DATASETS();
  for (const k of Object.keys(ds) as PaDatasetKey[]) {
    const m = raw?.datasets?.[k];
    if (m && typeof m === 'object' && typeof m.path === 'string') ds[k] = { ...m, skipped: m.skipped || [], notes: m.notes || [], missing: m.missing || [], preview: m.preview || [], sheetNames: m.sheetNames || [], headers: m.headers || [], mapping: m.mapping || {} };
  }
  const run: PaRun | null = raw?.run && typeof raw.run === 'object' && raw.run.summary
    ? { ...raw.run, rules: normalizeRules(raw.run.rules), reviews: raw.run.reviews || {}, edits: raw.run.edits || {}, exported: raw.run.exported || null, stale: !!raw.run.stale, staleReason: raw.run.staleReason || '', replenishConfirmedAt: raw.run.replenishConfirmedAt || '' }
    : null;
  const st = raw?.scheduleStatus || {};
  return {
    settings: { rules: normalizeRules(raw?.settings?.rules), outputDir: String(raw?.settings?.outputDir || ''), schedule: normalizeSchedule(raw?.settings?.schedule) },
    datasets: ds,
    run,
    history: Array.isArray(raw?.history) ? raw.history.filter((h: any) => h && h.byState).map((h: any) => ({ ...h, newOut: h.newOut || [], newRisk: h.newRisk || [], files: h.files || [], note: h.note || '' })) : [],
    scheduleStatus: { lastRunDay: String(st.lastRunDay || ''), lastRunAt: String(st.lastRunAt || ''), lastOk: !!st.lastOk, lastMessage: String(st.lastMessage || ''), lastFiles: Array.isArray(st.lastFiles) ? st.lastFiles : [] },
    latest: raw?.latest && raw.latest.summary ? raw.latest : null,
  };
}

function atomicWrite(file: string, data: unknown): void {
  writeFileSync(`${file}.tmp`, JSON.stringify(data), 'utf-8');
  renameSync(`${file}.tmp`, file);
}

function readJson(file: string): any {
  try { return existsSync(file) ? JSON.parse(readFileSync(file, 'utf-8')) : null; } catch { return null; }
}

export class PartsAlertStore {
  private cache: PaStored | null = null;
  private dataCache: DatasetRows | null = null;
  private resultCache: Record<'result' | 'latest', PaPartResult[] | null> = { result: null, latest: null };
  private cacheDir = '';

  constructor(private readonly dirOf: () => string = () => accountPath('parts-alert')) {}

  root(): string {
    const d = this.dirOf();
    if (d !== this.cacheDir) { this.cache = null; this.dataCache = null; this.resultCache = { result: null, latest: null }; this.cacheDir = d; }
    mkdirSync(d, { recursive: true });
    return d;
  }

  read(): PaStored {
    const dir = this.root();
    if (!this.cache) this.cache = normalize(readJson(join(dir, 'state.json')));
    return this.cache;
  }

  update<T>(fn: (s: PaStored) => T): T {
    this.read();
    const out = fn(this.cache!);
    this.cache!.history = this.cache!.history.slice(0, HISTORY_LIMIT);
    atomicWrite(join(this.root(), 'state.json'), this.cache);
    return out;
  }

  data(): DatasetRows {
    const dir = this.root();
    if (!this.dataCache) {
      const raw = readJson(join(dir, 'data.json'));
      const e = emptyData();
      for (const k of Object.keys(e) as PaDatasetKey[]) if (Array.isArray(raw?.[k])) (e as any)[k] = raw[k];
      this.dataCache = e;
    }
    return this.dataCache;
  }

  setData<K extends PaDatasetKey>(key: K, rows: DatasetRows[K]): void {
    this.data();
    this.dataCache![key] = rows;
    atomicWrite(join(this.root(), 'data.json'), this.dataCache);
  }

  results(which: 'result' | 'latest'): PaPartResult[] {
    const dir = this.root();
    if (!this.resultCache[which]) {
      const raw = readJson(join(dir, `${which}.json`));
      this.resultCache[which] = Array.isArray(raw) ? raw : [];
    }
    return this.resultCache[which]!;
  }

  setResults(which: 'result' | 'latest', rows: PaPartResult[]): void {
    const dir = this.root();
    this.resultCache[which] = rows;
    atomicWrite(join(dir, `${which}.json`), rows);
  }
}
