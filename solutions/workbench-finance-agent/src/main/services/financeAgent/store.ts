/**
 * 财务智能体工作台的落盘。
 *
 * 目录固定在账号私有目录（切账号即换库）：
 *   state.json                 账套清单 + 当前账套 + 设置
 *   ledgers/<id>.json          一个账套的全部数据（票据、凭证、各智能体的结果、问答记录）
 *   ledgers/<id>.policies.json 企业财务制度的分块（问答检索用，体积大，单独存）
 *   files/<id>/                复制进来的票据、合同原件
 * 单文件原子写（先写 .tmp 再 rename）。
 */
import { existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { t as i18nT } from '@totalclaw/i18n';
import type { FaLedger, FaLedgerData, FaSettings } from '@totalclaw/ipc-contracts';
import { accountPath } from '../accountScope';
import { newId } from './common';
import { defaultExpenseRules } from './expense';
import type { PolicyChunk } from './knowledge';
import { defaultRiskThresholds } from './risk';
import { defaultTaxSettings } from './tax';

export const MAX_QA = 400;

export interface FaStoredRoot {
  ledgers: FaLedger[];
  activeLedgerId: string;
  settings: FaSettings;
}

export function defaultSettings(): FaSettings {
  return {
    moduleModels: {},
    outputDir: '',
    package: 'all',
    tax: defaultTaxSettings(),
    expense: defaultExpenseRules(),
    risk: defaultRiskThresholds(),
    apiReceiver: { enabled: false, port: 18765, token: '' },
    taxPortal: { province: '', url: '' },
  };
}

export function emptyLedgerData(): FaLedgerData {
  return {
    docs: [], vouchers: [], balances: [], journal: null, taxRuns: [], filings: [], claims: [], reconciles: [], agings: [],
    statements: [], risks: [], budget: { year: new Date().getFullYear(), lines: [] }, budgetAnalyses: [],
    costRuns: [], contracts: [], qa: [], policies: [],
  };
}

export function newLedger(input: Partial<FaLedger> & { name: string }): FaLedger {
  return {
    id: input.id || newId('ldg'),
    name: input.name.trim(),
    taxId: String(input.taxId || '').trim().toUpperCase(),
    taxpayerType: input.taxpayerType === 'general' ? 'general' : 'small',
    cityTier: input.cityTier === 'county' || input.cityTier === 'other' ? input.cityTier : 'urban',
    industry: String(input.industry || '').trim(),
    smallLowProfit: input.smallLowProfit ?? true,
    notes: String(input.notes || ''),
    createdAt: input.createdAt || new Date().toISOString(),
  };
}

function normalizeRoot(raw: any): FaStoredRoot {
  const d = defaultSettings();
  const s = raw?.settings && typeof raw.settings === 'object' ? raw.settings : {};
  const settings: FaSettings = {
    ...d,
    ...s,
    moduleModels: { ...(s.moduleModels || {}) },
    tax: { ...d.tax, ...(s.tax || {}) },
    expense: { ...d.expense, ...(s.expense || {}), rules: Array.isArray(s.expense?.rules) ? s.expense.rules : d.expense.rules, monthlyQuota: { ...(s.expense?.monthlyQuota || {}) } },
    risk: { ...d.risk, ...(s.risk || {}) },
    apiReceiver: { ...d.apiReceiver, ...(s.apiReceiver || {}) },
    taxPortal: { ...d.taxPortal, ...(s.taxPortal || {}) },
  };
  const ledgers: FaLedger[] = Array.isArray(raw?.ledgers) ? raw.ledgers.filter((l: any) => l?.id && l?.name).map((l: any) => newLedger(l)) : [];
  if (!ledgers.length) ledgers.push(newLedger({ name: i18nT('默认账套') }));
  const activeLedgerId = ledgers.some((l) => l.id === raw?.activeLedgerId) ? raw.activeLedgerId : ledgers[0].id;
  return { ledgers, activeLedgerId, settings };
}

function normalizeData(raw: any): FaLedgerData {
  const base = emptyLedgerData();
  if (!raw || typeof raw !== 'object') return base;
  const out: any = { ...base };
  for (const k of Object.keys(base) as (keyof FaLedgerData)[]) {
    if (Array.isArray((base as any)[k]) && Array.isArray(raw[k])) out[k] = raw[k];
  }
  if (raw.journal && Array.isArray(raw.journal.rows)) out.journal = raw.journal;
  if (raw.budget && Array.isArray(raw.budget.lines)) out.budget = { year: Number(raw.budget.year) || base.budget.year, lines: raw.budget.lines };
  return out;
}

function atomicWrite(path: string, value: unknown): void {
  const tmp = `${path}.tmp`;
  writeFileSync(tmp, JSON.stringify(value), 'utf-8');
  renameSync(tmp, path);
}

function readJson(path: string): any {
  try { return existsSync(path) ? JSON.parse(readFileSync(path, 'utf-8')) : null; } catch { return null; }
}

export class FinanceAgentStore {
  private rootCache: FaStoredRoot | null = null;
  private dataCache = new Map<string, FaLedgerData>();

  constructor(private readonly dirOf: () => string = () => accountPath('finance-agent')) {}

  private cacheDir = '';

  dir(): string {
    const d = this.dirOf();
    // 切账号后目录变了：缓存属于上一个账号，丢掉
    if (d !== this.cacheDir) { this.rootCache = null; this.dataCache.clear(); this.cacheDir = d; }
    mkdirSync(join(d, 'ledgers'), { recursive: true });
    return d;
  }

  root(): FaStoredRoot {
    this.dir();
    if (!this.rootCache) this.rootCache = normalizeRoot(readJson(join(this.dir(), 'state.json')));
    return this.rootCache;
  }

  updateRoot<T>(fn: (r: FaStoredRoot) => T): T {
    const r = this.root();
    const out = fn(r);
    atomicWrite(join(this.dir(), 'state.json'), r);
    return out;
  }

  activeLedger(): FaLedger {
    const r = this.root();
    return r.ledgers.find((l) => l.id === r.activeLedgerId) || r.ledgers[0];
  }

  data(ledgerId = this.activeLedger().id): FaLedgerData {
    this.dir();
    let d = this.dataCache.get(ledgerId);
    if (!d) {
      d = normalizeData(readJson(join(this.dir(), 'ledgers', `${ledgerId}.json`)));
      this.dataCache.set(ledgerId, d);
    }
    return d;
  }

  update<T>(fn: (d: FaLedgerData) => T, ledgerId = this.activeLedger().id): T {
    const d = this.data(ledgerId);
    const out = fn(d);
    if (d.qa.length > MAX_QA) d.qa.splice(0, d.qa.length - MAX_QA);
    atomicWrite(join(this.dir(), 'ledgers', `${ledgerId}.json`), d);
    return out;
  }

  policies(ledgerId = this.activeLedger().id): PolicyChunk[] {
    const raw = readJson(join(this.dir(), 'ledgers', `${ledgerId}.policies.json`));
    return Array.isArray(raw) ? raw : [];
  }

  savePolicies(chunks: PolicyChunk[], ledgerId = this.activeLedger().id): void {
    atomicWrite(join(this.dir(), 'ledgers', `${ledgerId}.policies.json`), chunks);
  }

  /** 票据 / 合同原件复制进库的目录 */
  filesDir(ledgerId = this.activeLedger().id): string {
    const d = join(this.dir(), 'files', ledgerId);
    mkdirSync(d, { recursive: true });
    return d;
  }

  removeLedger(id: string): void {
    this.dataCache.delete(id);
    for (const p of [join(this.dir(), 'ledgers', `${id}.json`), join(this.dir(), 'ledgers', `${id}.policies.json`), join(this.dir(), 'files', id)]) {
      try { rmSync(p, { recursive: true, force: true }); } catch { /* 删不掉不影响账套清单 */ }
    }
  }

  /** 切账号后清缓存 */
  reset(): void {
    this.rootCache = null;
    this.dataCache.clear();
  }
}
