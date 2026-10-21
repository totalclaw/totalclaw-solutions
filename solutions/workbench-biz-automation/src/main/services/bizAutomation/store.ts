/**
 * 经营自动化智能体的落盘：账号私有目录 biz-automation/ 下
 *   state.json  视频 / 数字人 / 上架 / 报表 / 设置 / 日志（原子写）
 *   data.json   导入的销售与费用明细（量大，单独一个文件）
 *   work/       成片中间文件
 */
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { t as i18nT } from '@totalclaw/i18n';
import type {
  BaAvatarProject, BaCalendarDay, BaChannel, BaExpenseRow, BaImport, BaListing, BaLogEntry, BaQa, BaReport, BaRuleHit, BaSaleRow, BaSettings, BaVideoProject,
} from '@totalclaw/ipc-contracts';
import { accountPath } from '../accountScope';
import { defaultSeasonMonths, resetStaleRendering } from './logic';

export interface BaStored {
  settings: BaSettings;
  videos: BaVideoProject[];
  avatars: BaAvatarProject[];
  listings: BaListing[];
  ruleHits: BaRuleHit[];
  imports: BaImport[];
  reports: BaReport[];
  qa: BaQa[];
  log: BaLogEntry[];
  /** 定时任务上次执行的日期（YYYY-MM-DD） */
  lastRun: Record<string, string>;
  /** 新品入库联动已处理过的商品 id；共享文件夹已导入过的文件（路径 → 修改时间） */
  seen: { garments: string[]; files: Record<string, string> };
}

export interface BaData { sales: BaSaleRow[]; expenses: BaExpenseRow[] }

export function newId(prefix: string): string {
  return `${prefix}_${randomUUID().replace(/-/g, '').slice(0, 12)}`;
}

export function defaultChannels(): BaChannel[] {
  return [
    { id: 'doudian', name: i18nT('抖店'), url: 'https://fxg.jinritemai.com/', aspect: '1:1', titleMax: 30, enabled: true },
    { id: 'weixin_shop', name: i18nT('微信小店'), url: 'https://store.weixin.qq.com/', aspect: '1:1', titleMax: 30, enabled: true },
    { id: 'youzan', name: i18nT('有赞'), url: 'https://www.youzan.com/', aspect: '1:1', titleMax: 50, enabled: false },
    { id: 'taobao', name: i18nT('淘宝 / 天猫'), url: 'https://myseller.taobao.com/', aspect: '1:1', titleMax: 30, enabled: false },
    { id: 'xhs_shop', name: i18nT('小红书店铺'), url: 'https://ark.xiaohongshu.com/', aspect: '3:4', titleMax: 20, enabled: false },
  ];
}

/** 固定日期的节日（农历节日每年日期不同，由店长在「定时与联动」里自己加） */
export function defaultCalendar(): BaCalendarDay[] {
  return [
    { date: '01-01', name: i18nT('元旦'), topic: 'holiday' },
    { date: '03-08', name: i18nT('妇女节'), topic: 'holiday' },
    { date: '05-01', name: i18nT('劳动节'), topic: 'holiday' },
    { date: '10-01', name: i18nT('国庆节'), topic: 'holiday' },
    { date: '11-11', name: i18nT('双十一'), topic: 'holiday' },
    { date: '12-25', name: i18nT('圣诞节'), topic: 'holiday' },
  ];
}

export function defaultSettings(): BaSettings {
  return {
    brandName: '',
    storeAddress: '',
    openingHours: '',
    dataFolders: { sales: '', expense: '', inventory: '' },
    moduleModels: {},
    channels: defaultChannels(),
    seasonMonths: defaultSeasonMonths(),
    coreSizes: ['M', 'L'],
    autoDelistLocal: true,
    schedule: {
      dailyReport: { enabled: false, time: '08:30', push: true },
      inventoryPatrol: { enabled: false, time: '09:00' },
      weeklyVideo: { enabled: false, weekday: 1, time: '10:00' },
      monthlyReport: { enabled: false, day: 1, time: '09:30', push: true },
      newArrival: { enabled: false },
      calendar: { enabled: false, leadDays: 3, days: defaultCalendar() },
      folderImport: { enabled: false, time: '08:00' },
    },
    outputDir: '',
  };
}

/**
 * 磁盘 → 内存。只在从文件载入那一次调用：此刻还写着 rendering 的成片一定是上一个进程留下的
 * （本进程的成片 await 还没开始），统一收成失败让「重新成片」可点（见 logic.resetStaleRendering）。
 */
function normalize(raw: any): BaStored {
  const d = defaultSettings();
  const s = raw?.settings || {};
  const arr = <T>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);
  const out: BaStored = {
    settings: {
      ...d, ...s,
      moduleModels: { ...(s.moduleModels || {}) },
      channels: Array.isArray(s.channels) && s.channels.length ? s.channels : d.channels,
      seasonMonths: s.seasonMonths && typeof s.seasonMonths === 'object' ? s.seasonMonths : d.seasonMonths,
      coreSizes: Array.isArray(s.coreSizes) ? s.coreSizes : d.coreSizes,
      schedule: {
        dailyReport: { ...d.schedule.dailyReport, ...(s.schedule?.dailyReport || {}) },
        inventoryPatrol: { ...d.schedule.inventoryPatrol, ...(s.schedule?.inventoryPatrol || {}) },
        weeklyVideo: { ...d.schedule.weeklyVideo, ...(s.schedule?.weeklyVideo || {}) },
        monthlyReport: { ...d.schedule.monthlyReport, ...(s.schedule?.monthlyReport || {}) },
        newArrival: { ...d.schedule.newArrival, ...(s.schedule?.newArrival || {}) },
        calendar: { ...d.schedule.calendar, ...(s.schedule?.calendar || {}), days: Array.isArray(s.schedule?.calendar?.days) ? s.schedule.calendar.days : d.schedule.calendar.days },
        folderImport: { ...d.schedule.folderImport, ...(s.schedule?.folderImport || {}) },
      },
      dataFolders: { ...d.dataFolders, ...(s.dataFolders || {}) },
    },
    videos: arr<BaVideoProject>(raw?.videos).map((v) => ({ ...v, warnings: v.warnings || [], copies: v.copies || {}, scenes: v.scenes || [], history: Array.isArray(v.history) ? v.history : [], publishRuns: Array.isArray(v.publishRuns) ? v.publishRuns : [] })),
    avatars: arr<BaAvatarProject>(raw?.avatars).map((a) => ({ ...a, warnings: a.warnings || [], facts: a.facts || [] })),
    listings: arr<BaListing>(raw?.listings).map((l) => ({ ...l, warnings: l.warnings || [], images: l.images || [] })),
    ruleHits: arr<BaRuleHit>(raw?.ruleHits),
    imports: arr<BaImport>(raw?.imports),
    reports: arr<BaReport>(raw?.reports),
    qa: arr<BaQa>(raw?.qa),
    log: arr<BaLogEntry>(raw?.log),
    lastRun: raw?.lastRun && typeof raw.lastRun === 'object' ? raw.lastRun : {},
    seen: {
      garments: Array.isArray(raw?.seen?.garments) ? raw.seen.garments : [],
      files: raw?.seen?.files && typeof raw.seen.files === 'object' ? raw.seen.files : {},
    },
  };
  resetStaleRendering(out, i18nT('应用重启导致上次成片中断，请重新成片'));
  return out;
}

function atomicWrite(file: string, data: unknown): void {
  writeFileSync(`${file}.tmp`, JSON.stringify(data), 'utf-8');
  renameSync(`${file}.tmp`, file);
}

export class BizAutomationStore {
  private cache: BaStored | null = null;
  private dataCache: BaData | null = null;
  private cacheDir = '';

  constructor(private readonly dirOf: () => string = () => accountPath('biz-automation')) {}

  root(): string {
    const d = this.dirOf();
    if (d !== this.cacheDir) { this.cache = null; this.dataCache = null; this.cacheDir = d; }
    mkdirSync(d, { recursive: true });
    return d;
  }

  dir(sub: string): string {
    const d = join(this.root(), sub);
    mkdirSync(d, { recursive: true });
    return d;
  }

  read(): BaStored {
    const f = join(this.root(), 'state.json');
    if (!this.cache) {
      let raw: any = null;
      try { raw = existsSync(f) ? JSON.parse(readFileSync(f, 'utf-8')) : null; } catch { raw = null; }
      this.cache = normalize(raw);
    }
    return this.cache;
  }

  update<T>(fn: (s: BaStored) => T): T {
    this.read();
    const out = fn(this.cache!);
    // 报表、问答、日志只留最近的，文件不无限长
    this.cache!.reports = this.cache!.reports.slice(0, 60);
    this.cache!.qa = this.cache!.qa.slice(0, 50);
    this.cache!.log = this.cache!.log.slice(0, 200);
    atomicWrite(join(this.root(), 'state.json'), this.cache);
    return out;
  }

  data(): BaData {
    const f = join(this.root(), 'data.json');
    if (!this.dataCache) {
      let raw: any = null;
      try { raw = existsSync(f) ? JSON.parse(readFileSync(f, 'utf-8')) : null; } catch { raw = null; }
      this.dataCache = { sales: Array.isArray(raw?.sales) ? raw.sales : [], expenses: Array.isArray(raw?.expenses) ? raw.expenses : [] };
    }
    return this.dataCache;
  }

  updateData<T>(fn: (d: BaData) => T): T {
    this.data();
    const out = fn(this.dataCache!);
    atomicWrite(join(this.root(), 'data.json'), this.dataCache);
    return out;
  }
}
