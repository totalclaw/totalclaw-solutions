/**
 * 政采云智能体的落盘：账号私有目录 zcy-agent/state.json（原子写）。
 * 账号密码不以明文落盘：只存系统钥匙串（safeStorage）加密后的密文；钥匙串不可用时不保存，每次由人自己输。
 */
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import type { ZcInquiry, ZcLogEntry, ZcOrder, ZcProduct, ZcSettings, ZcWorkbench } from '@totalclaw/ipc-contracts';
import { accountPath } from '../accountScope';
import { defaultRegions } from './logic';

export interface ZcStored {
  settings: ZcSettings;
  products: ZcProduct[];
  inquiries: ZcInquiry[];
  orders: ZcOrder[];
  log: ZcLogEntry[];
  workbench: ZcWorkbench | null;
  /** 加密后的密码（base64 密文） */
  passwordCipher: string;
  /** 巡检提醒上次触发：HH:mm → YYYY-MM-DD */
  lastPatrol: Record<string, string>;
}

export function newId(prefix: string): string {
  return `${prefix}_${randomUUID().replace(/-/g, '').slice(0, 12)}`;
}

export const ZCY_LOGIN_URL = 'https://login.zcygov.cn/user-login/';
export const ZCY_HOME_URL = 'https://www.zcygov.cn/';
/** 吉林省政府采购网（建在政采云上，公告与入口都在这里） */
export const ZCY_JILIN_PORTAL = 'http://www.ccgp-jilin.gov.cn/';

export function defaultSettings(): ZcSettings {
  return {
    company: { name: '', creditCode: '', legalPerson: '', contact: '', phone: '', address: '', bank: '', bankAccount: '', qualifications: [], englishName: '', shortName: '', postcode: '', email: '', contactMobile: '', totalAssets: '', employees: '', income: '', intro: '', registerOrg: '', registerCapital: '', scope: '', onjobCount: '', socialPayCount: '' },
    account: { username: '', hasPassword: false, loginUrl: ZCY_LOGIN_URL, homeUrl: ZCY_HOME_URL, lastFillAt: '' },
    regionId: 'jilin',
    regions: defaultRegions(),
    defaultMargin: 0.08,
    invoiceTaxRate: 0.13,
    model: '',
    patrolTimes: [],
  };
}

function normalize(raw: any): ZcStored {
  const d = defaultSettings();
  const s = raw?.settings || {};
  const arr = <T>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);
  // 旧数据里的规则没有新字段：按内置同 id 规则补齐
  const regions = (Array.isArray(s.regions) && s.regions.length ? s.regions : d.regions).map((r: any) => ({ ...(d.regions.find((x) => x.id === r.id) || d.regions[0]), ...r }));
  return {
    settings: {
      ...d, ...s,
      company: { ...d.company, ...(s.company || {}), qualifications: arr(s.company?.qualifications) },
      account: { ...d.account, ...(s.account || {}), hasPassword: !!raw?.passwordCipher },
      regions,
      regionId: regions.some((r: any) => r.id === s.regionId) ? s.regionId : regions[0].id,
      patrolTimes: arr<string>(s.patrolTimes),
    },
    products: arr<ZcProduct>(raw?.products).map((p) => ({ ...p, images: p.images || [], refs: p.refs || [], issues: p.issues || [] })),
    inquiries: arr<ZcInquiry>(raw?.inquiries).map((q) => ({ ...q, items: q.items || [], issues: q.issues || [] })),
    orders: arr<ZcOrder>(raw?.orders),
    log: arr<ZcLogEntry>(raw?.log),
    workbench: raw?.workbench && typeof raw.workbench === 'object' ? { ...raw.workbench, todos: arr(raw.workbench.todos) } : null,
    passwordCipher: typeof raw?.passwordCipher === 'string' ? raw.passwordCipher : '',
    lastPatrol: raw?.lastPatrol && typeof raw.lastPatrol === 'object' ? raw.lastPatrol : {},
  };
}

export class ZcyAgentStore {
  private cache: ZcStored | null = null;
  private cacheDir = '';

  constructor(private readonly dirOf: () => string = () => accountPath('zcy-agent')) {}

  root(): string {
    const d = this.dirOf();
    if (d !== this.cacheDir) { this.cache = null; this.cacheDir = d; }
    mkdirSync(d, { recursive: true });
    return d;
  }

  read(): ZcStored {
    const f = join(this.root(), 'state.json');
    if (!this.cache) {
      let raw: any = null;
      try { raw = existsSync(f) ? JSON.parse(readFileSync(f, 'utf-8')) : null; } catch { raw = null; }
      this.cache = normalize(raw);
    }
    return this.cache;
  }

  update<T>(fn: (s: ZcStored) => T): T {
    this.read();
    const out = fn(this.cache!);
    this.cache!.log = this.cache!.log.slice(0, 300);
    this.cache!.settings.account.hasPassword = !!this.cache!.passwordCipher;
    const f = join(this.root(), 'state.json');
    writeFileSync(`${f}.tmp`, JSON.stringify(this.cache), 'utf-8');
    renameSync(`${f}.tmp`, f);
    return out;
  }
}
