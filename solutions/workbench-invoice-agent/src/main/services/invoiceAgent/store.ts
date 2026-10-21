/**
 * 发票智能体的落盘：账号私有目录 invoice-agent/ 下
 *   state.json  设置 / 批次 / 发票草稿与台账 / 客户与商品档案 / 日志（原子写）
 *   rows.json   导入的明细行（量大，单独一个文件）
 */
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import type { IvBatch, IvCustomer, IvDraft, IvGoods, IvLogEntry, IvRow, IvSettings } from '@totalclaw/ipc-contracts';
import { accountPath } from '../accountScope';

export interface IvStored {
  settings: IvSettings;
  batches: IvBatch[];
  drafts: IvDraft[];
  customers: IvCustomer[];
  goods: IvGoods[];
  log: IvLogEntry[];
  /** 系统钥匙串加密后的密文（base64）：apiSecret / apiToken */
  secrets: Record<string, string>;
  /** 服务商 accessToken 缓存（密文）与过期时间：30 天内只能取 50 次，必须落盘 */
  tokenCache: { cipher: string; expiresAt: number } | null;
}

export function newId(prefix: string): string {
  return `${prefix}_${randomUUID().replace(/-/g, '').slice(0, 12)}`;
}

export function defaultSettings(): IvSettings {
  return {
    seller: { name: '', taxNo: '', address: '', phone: '', bank: '', bankAccount: '', drawer: '', taxpayerType: 'general', defaultTaxRate: 0.13, province: '', perInvoiceLimit: 0, remainingQuota: 0 },
    channel: 'etax_batch',
    api: { provider: 'nuonuo', sandbox: true, appKey: '', hasSecret: false, hasToken: false, eleAccount: '' },
    officialTemplate: '',
    mergeMode: 'buyer',
    defaultKind: 'normal',
    amountTaxIncluded: true,
    maxLines: 100,
    model: '',
    outputDir: '',
  };
}

function normalize(raw: any): IvStored {
  const d = defaultSettings();
  const s = raw?.settings || {};
  const arr = <T>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);
  return {
    settings: { ...d, ...s, channel: s.channel === 'api' ? 'api' : 'etax_batch', seller: { ...d.seller, ...(s.seller || {}) }, api: { ...d.api, ...(s.api || {}), hasSecret: !!raw?.secrets?.apiSecret, hasToken: !!raw?.secrets?.apiToken } },
    batches: arr<IvBatch>(raw?.batches),
    drafts: arr<IvDraft>(raw?.drafts).map((x) => ({ ...x, lines: x.lines || [], issues: x.issues || [], orderNos: x.orderNos || [] })),
    customers: arr<IvCustomer>(raw?.customers),
    goods: arr<IvGoods>(raw?.goods),
    log: arr<IvLogEntry>(raw?.log),
    secrets: raw?.secrets && typeof raw.secrets === 'object' ? raw.secrets : {},
    tokenCache: raw?.tokenCache && typeof raw.tokenCache.cipher === 'string' ? raw.tokenCache : null,
  };
}

function atomicWrite(file: string, data: unknown): void {
  writeFileSync(`${file}.tmp`, JSON.stringify(data), 'utf-8');
  renameSync(`${file}.tmp`, file);
}

export class InvoiceAgentStore {
  private cache: IvStored | null = null;
  private rowsCache: IvRow[] | null = null;
  private cacheDir = '';

  constructor(private readonly dirOf: () => string = () => accountPath('invoice-agent')) {}

  root(): string {
    const d = this.dirOf();
    if (d !== this.cacheDir) { this.cache = null; this.rowsCache = null; this.cacheDir = d; }
    mkdirSync(d, { recursive: true });
    return d;
  }

  read(): IvStored {
    const f = join(this.root(), 'state.json');
    if (!this.cache) {
      let raw: any = null;
      try { raw = existsSync(f) ? JSON.parse(readFileSync(f, 'utf-8')) : null; } catch { raw = null; }
      this.cache = normalize(raw);
    }
    return this.cache;
  }

  update<T>(fn: (s: IvStored) => T): T {
    this.read();
    const out = fn(this.cache!);
    this.cache!.log = this.cache!.log.slice(0, 300);
    this.cache!.settings.api.hasSecret = !!this.cache!.secrets.apiSecret;
    this.cache!.settings.api.hasToken = !!this.cache!.secrets.apiToken;
    atomicWrite(join(this.root(), 'state.json'), this.cache);
    return out;
  }

  rows(): IvRow[] {
    const f = join(this.root(), 'rows.json');
    if (!this.rowsCache) {
      let raw: any = null;
      try { raw = existsSync(f) ? JSON.parse(readFileSync(f, 'utf-8')) : null; } catch { raw = null; }
      this.rowsCache = Array.isArray(raw) ? raw : [];
    }
    return this.rowsCache;
  }

  updateRows<T>(fn: (rows: IvRow[]) => T | { replace: IvRow[] }): T {
    this.rows();
    const out = fn(this.rowsCache!) as any;
    if (out && Array.isArray(out.replace)) this.rowsCache = out.replace;
    atomicWrite(join(this.root(), 'rows.json'), this.rowsCache);
    return out as T;
  }
}
