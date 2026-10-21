/**
 * 服装实体店智能体的落盘：账号私有目录 apparel-store/ 下
 *   state.json   商品库 / 顾客 / 试穿记录 / 设置（原子写）
 *   garments/    商品图
 *   photos/      顾客照片（到期或顾客要求时删除）
 *   backgrounds/ 自定义背景照片（同上）
 *   results/     试穿图（同上）
 *
 * 商品库也给经营自动化智能体用（上下架、视频素材），所以 garment 相关方法是公开的。
 */
import { existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { randomBytes, randomUUID } from 'node:crypto';
import { t as i18nT } from '@totalclaw/i18n';
import type { ApCustomer, ApGarment, ApGarmentInput, ApSettings, ApTryon } from '@totalclaw/ipc-contracts';
import { AP_EDIT_MODELS } from '@totalclaw/ipc-contracts';
import { accountPath } from '../accountScope';
import { normalizeAudience, sortSizes } from './logic';

/** 手机端会话令牌只在主进程里，不进渲染层 */
export type StoredCustomer = ApCustomer & { mobileToken?: string; /** 自定义背景照片 */ background?: string };

export interface ApStored {
  settings: ApSettings;
  /** 门店口令：放在门店二维码里，换了旧码就失效 */
  storeKey: string;
  garments: ApGarment[];
  customers: StoredCustomer[];
  tryons: ApTryon[];
}

export function newId(prefix: string): string {
  return `${prefix}_${randomUUID().replace(/-/g, '').slice(0, 12)}`;
}

export function newStoreKey(): string {
  return randomBytes(9).toString('base64url');
}

export function defaultSettings(): ApSettings {
  return {
    storeName: i18nT('我的服装店'),
    editModel: AP_EDIT_MODELS[0],
    retentionDays: 7,
    mobileDailyLimit: 12,
    watermark: true,
    disabledOptions: [],
    outputDir: '',
  };
}

export function normalizeGarment(input: ApGarmentInput, prev?: ApGarment): ApGarment {
  const base: ApGarment = prev || {
    id: newId('apg'), name: '', sku: '', price: 0, category: '', color: '', style: '', fabric: '', season: '',
    audience: 'women', stock: {}, image: '', tags: [], sellingPoints: '', onShelf: true, createdAt: new Date().toISOString(),
  };
  const merged = { ...base, ...input, id: base.id, createdAt: base.createdAt } as ApGarment;
  const stock: Record<string, number> = {};
  for (const size of sortSizes(Object.keys(merged.stock || {}))) {
    const n = Math.max(0, Math.floor(Number(merged.stock[size]) || 0));
    stock[size.trim().toUpperCase()] = n;
  }
  return {
    ...merged,
    name: String(merged.name || '').trim().slice(0, 60) || i18nT('未命名商品'),
    sku: String(merged.sku || '').trim().slice(0, 40),
    price: Math.max(0, Math.round((Number(merged.price) || 0) * 100) / 100),
    category: String(merged.category || '').trim().slice(0, 20),
    color: String(merged.color || '').trim().slice(0, 20),
    style: String(merged.style || '').trim().slice(0, 20),
    fabric: String(merged.fabric || '').trim().slice(0, 30),
    season: String(merged.season || '').trim().slice(0, 10),
    audience: normalizeAudience(merged.audience),
    stock,
    tags: [...new Set((merged.tags || []).map((t) => String(t).trim()).filter(Boolean))].slice(0, 12),
    sellingPoints: String(merged.sellingPoints || '').slice(0, 500),
    onShelf: merged.onShelf !== false,
    updatedAt: prev ? new Date().toISOString() : undefined,
  };
}

function normalize(raw: any): ApStored {
  const d = defaultSettings();
  const s = raw?.settings || {};
  return {
    settings: {
      ...d, ...s,
      editModel: (AP_EDIT_MODELS as readonly string[]).includes(s.editModel) ? s.editModel : d.editModel,
      retentionDays: Math.min(Math.max(Math.round(Number(s.retentionDays) || d.retentionDays), 1), 30),
      mobileDailyLimit: Math.min(Math.max(Math.round(Number(s.mobileDailyLimit) || d.mobileDailyLimit), 1), 100),
      disabledOptions: Array.isArray(s.disabledOptions) ? s.disabledOptions.map(String) : [],
      watermark: s.watermark !== false,
    },
    storeKey: typeof raw?.storeKey === 'string' && raw.storeKey.length >= 8 ? raw.storeKey : newStoreKey(),
    garments: Array.isArray(raw?.garments) ? raw.garments.filter((g: any) => g?.id).map((g: any) => ({ ...normalizeGarment(g, { ...g, stock: g.stock || {}, tags: g.tags || [] }), updatedAt: g.updatedAt })) : [],
    customers: Array.isArray(raw?.customers) ? raw.customers.filter((c: any) => c?.id) : [],
    tryons: Array.isArray(raw?.tryons) ? raw.tryons.filter((t: any) => t?.id) : [],
  };
}

export class ApparelStore {
  private cache: ApStored | null = null;
  private cacheDir = '';

  constructor(private readonly dirOf: () => string = () => accountPath('apparel-store')) {}

  root(): string {
    const d = this.dirOf();
    if (d !== this.cacheDir) { this.cache = null; this.cacheDir = d; }
    mkdirSync(d, { recursive: true });
    return d;
  }

  dir(sub: 'garments' | 'photos' | 'backgrounds' | 'results' | 'thumbs'): string {
    const d = join(this.root(), sub);
    mkdirSync(d, { recursive: true });
    return d;
  }

  private file(): string { return join(this.root(), 'state.json'); }

  read(): ApStored {
    const f = this.file();
    if (!this.cache) {
      let raw: any = null;
      try { raw = existsSync(f) ? JSON.parse(readFileSync(f, 'utf-8')) : null; } catch { raw = null; }
      this.cache = normalize(raw);
      if (!raw) this.flush();
    }
    return this.cache;
  }

  private flush(): void {
    const f = this.file();
    writeFileSync(`${f}.tmp`, JSON.stringify(this.cache), 'utf-8');
    renameSync(`${f}.tmp`, f);
  }

  update<T>(fn: (s: ApStored) => T): T {
    this.read();
    const out = fn(this.cache!);
    this.flush();
    return out;
  }

  garment(id: string): ApGarment | undefined { return this.read().garments.find((g) => g.id === id); }

  /** 删文件：只删自己目录里的，路径不在本库目录下一律不动 */
  removeOwnFile(path: string | undefined): void {
    if (!path) return;
    const root = this.root();
    if (!path.startsWith(root)) return;
    try { rmSync(path, { force: true }); } catch { /* 已不存在 */ }
  }
}
