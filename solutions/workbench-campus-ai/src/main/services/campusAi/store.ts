/**
 * 高校一体化 AI 智能体的落盘：账号私有目录 campus-ai/ 下
 *   state.json    设置 / 文档登记 / FAQ / 转办 / 数据集来源 / 预警这次运算的复核与通知 / 手机端会话（原子写）
 *   qa.json       问答记录（按保留天数清理）
 *   data.json     学业预警读进来的三类数据行
 *   results.json  预警逐人结果
 *   audit.jsonl   调用审计（不含学生个人信息原文）
 *   docs/         知识库文档副本
 *   index/        每份文档的分段与向量
 */
import { appendFileSync, existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { randomBytes, randomUUID } from 'node:crypto';
import type {
  CaAuditEntry, CaCourse, CaDatasetKey, CaDatasetMeta, CaDoc, CaFaq, CaGrading, CaGuide, CaLevelRule, CaOfficialDoc, CaOutput, CaQaRecord, CaQuestion, CaSchoolProfile, CaSettings, CaStudentResult, CaTicket, CaWarnRules, CaWarnRun,
} from '@totalclaw/ipc-contracts';
import { t as i18nT } from '@totalclaw/i18n';
import { accountPath } from '../accountScope';
import type { WarnData } from './warning';
import type { ScenarioStore } from './scenarios';

export interface CaMobileSession {
  /** 记录里用的匿名 id（令牌本身不写进问答记录） */
  id: string;
  token: string;
  createdAt: string;
  day: string;
  count: number;
}

/** 落盘的问答记录多一个提问者 id（手机端「我的问题」用，不给渲染层） */
export type StoredQa = CaQaRecord & { askerId?: string };

export interface CaStored {
  settings: CaSettings;
  docs: CaDoc[];
  faqs: CaFaq[];
  tickets: CaTicket[];
  datasets: Record<CaDatasetKey, CaDatasetMeta | null>;
  warn: CaWarnRun | null;
  /** 手机端校园口令（在二维码里） */
  campusKey: string;
  sessions: CaMobileSession[];
  scenarios: ScenarioStore;
  courses: CaCourse[];
  research: { outputsFile: string; skipped: number; guides: CaGuide[] };
  officialDocs: CaOfficialDoc[];
}

export const QA_LIMIT = 5000;
export const TICKET_LIMIT = 2000;
export const SESSION_LIMIT = 5000;

export function newId(prefix: string): string {
  return `${prefix}_${randomUUID().replace(/-/g, '').slice(0, 12)}`;
}

export function newCampusKey(): string {
  return randomBytes(6).toString('base64url');
}

export function defaultWarnRules(): CaWarnRules {
  return {
    passScore: 60,
    red: { failCourses: 4, failCredits: 12, absenceRate: 1 / 3 },
    orange: { failCourses: 2, failCredits: 6, absenceRate: 0.2 },
    yellow: { failCourses: 1, failCredits: 1, absenceRate: 0.1 },
  };
}

/** 提示词 / 文件里用的校名：没填就叫「本校」 */
export function schoolLabel(s: Pick<CaSettings, 'schoolName'>): string {
  return s.schoolName || i18nT('本校');
}

export function defaultProfile(): CaSchoolProfile {
  return { englishName: '', motto: '', founded: '', address: '', website: '', intro: '', logoPath: '' };
}

export function normalizeProfile(raw: Partial<CaSchoolProfile> | null | undefined): CaSchoolProfile {
  const r = raw || {};
  const str = (v: unknown, n: number) => String(v ?? '').trim().slice(0, n);
  return {
    englishName: str(r.englishName, 120),
    motto: str(r.motto, 60),
    founded: str(r.founded, 10),
    address: str(r.address, 120),
    website: str(r.website, 200),
    intro: str(r.intro, 2000),
    logoPath: str(r.logoPath, 1000),
  };
}

export function defaultSettings(): CaSettings {
  return {
    schoolName: '',
    profile: defaultProfile(),
    depts: [i18nT('招生办'), i18nT('教务处'), i18nT('学工处'), i18nT('财务处'), i18nT('后勤处'), i18nT('图书馆'), i18nT('信息中心')],
    categories: [i18nT('规章制度'), i18nT('办事指南'), i18nT('招生迎新'), i18nT('奖助资助'), i18nT('教学教务'), i18nT('生活服务')],
    sensitiveDept: i18nT('学工处'),
    hotline: '',
    retentionDays: 180,
    mobileDailyLimit: 30,
    // 检索分只做第一道闸，放宽以保召回（实测校内常见问法最低 0.17）；资料答不了的由模型判 NO_ANSWER 再拦一道
    minScore: 0.15,
    outputDir: '',
    warnRules: defaultWarnRules(),
  };
}

const num = (v: unknown, min: number, max: number, fallback: number): number => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
};

function normalizeLevel(raw: Partial<CaLevelRule> | undefined, d: CaLevelRule): CaLevelRule {
  const r = raw || {};
  return {
    failCourses: Math.round(num(r.failCourses, 0, 50, d.failCourses)),
    failCredits: num(r.failCredits, 0, 200, d.failCredits),
    absenceRate: num(r.absenceRate, 0, 1, d.absenceRate),
  };
}

/** 规则收口：0 表示这一项不作为门槛 */
export function normalizeWarnRules(raw: Partial<CaWarnRules> | null | undefined): CaWarnRules {
  const d = defaultWarnRules();
  const r = raw || {};
  return {
    passScore: num(r.passScore, 0, 100, d.passScore),
    red: normalizeLevel(r.red, d.red),
    orange: normalizeLevel(r.orange, d.orange),
    yellow: normalizeLevel(r.yellow, d.yellow),
  };
}

const cleanList = (v: unknown, fallback: string[]): string[] => {
  if (!Array.isArray(v)) return fallback;
  const list = [...new Set(v.map((x) => String(x || '').trim()).filter(Boolean))].slice(0, 60);
  return list.length ? list : fallback;
};

export function normalizeSettings(raw: Partial<CaSettings> | null | undefined): CaSettings {
  const d = defaultSettings();
  const s = raw || {};
  return {
    schoolName: String(s.schoolName ?? '').trim().slice(0, 40),
    profile: normalizeProfile(s.profile),
    depts: cleanList(s.depts, d.depts),
    categories: cleanList(s.categories, d.categories),
    sensitiveDept: String(s.sensitiveDept || '').trim() || d.sensitiveDept,
    hotline: String(s.hotline || '').trim().slice(0, 120),
    retentionDays: Math.round(num(s.retentionDays, 7, 3650, d.retentionDays)),
    mobileDailyLimit: Math.round(num(s.mobileDailyLimit, 1, 500, d.mobileDailyLimit)),
    minScore: num(s.minScore, 0.05, 0.9, d.minScore),
    outputDir: String(s.outputDir || ''),
    warnRules: normalizeWarnRules(s.warnRules),
  };
}

const EMPTY_DATASETS = (): Record<CaDatasetKey, CaDatasetMeta | null> => ({ roster: null, grades: null, attendance: null });
export const emptyWarnData = (): WarnData => ({ roster: [], grades: [], attendance: [] });

function normalize(raw: any): CaStored {
  const ds = EMPTY_DATASETS();
  for (const k of Object.keys(ds) as CaDatasetKey[]) {
    const m = raw?.datasets?.[k];
    if (m && typeof m === 'object' && typeof m.path === 'string') ds[k] = { ...m, skipped: m.skipped || [], notes: m.notes || [], missing: m.missing || [], preview: m.preview || [], sheetNames: m.sheetNames || [], headers: m.headers || [], mapping: m.mapping || {} };
  }
  const w = raw?.warn;
  const warn: CaWarnRun | null = w && typeof w === 'object' && w.summary
    ? { ...w, rules: normalizeWarnRules(w.rules), reviews: w.reviews || {}, notices: w.notices || {}, stale: !!w.stale }
    : null;
  return {
    settings: normalizeSettings(raw?.settings),
    docs: Array.isArray(raw?.docs) ? raw.docs.filter((d: any) => d && d.id && d.path) : [],
    faqs: Array.isArray(raw?.faqs) ? raw.faqs.filter((f: any) => f && f.id && f.question).map((f: any) => ({ ...f, similar: Array.isArray(f.similar) ? f.similar : [], hits: Number(f.hits) || 0 })) : [],
    tickets: Array.isArray(raw?.tickets) ? raw.tickets.filter((t: any) => t && t.id) : [],
    datasets: ds,
    warn,
    campusKey: typeof raw?.campusKey === 'string' && raw.campusKey.length >= 6 ? raw.campusKey : newCampusKey(),
    sessions: Array.isArray(raw?.sessions) ? raw.sessions.filter((x: any) => x && typeof x.token === 'string' && typeof x.id === 'string') : [],
    scenarios: { overrides: raw?.scenarios?.overrides && typeof raw.scenarios.overrides === 'object' ? raw.scenarios.overrides : {}, custom: Array.isArray(raw?.scenarios?.custom) ? raw.scenarios.custom.filter((c: any) => c && c.id && c.name) : [] },
    courses: Array.isArray(raw?.courses) ? raw.courses.filter((c: any) => c && c.id && c.name) : [],
    research: { outputsFile: String(raw?.research?.outputsFile || ''), skipped: Number(raw?.research?.skipped) || 0, guides: Array.isArray(raw?.research?.guides) ? raw.research.guides.filter((g: any) => g && g.id) : [] },
    officialDocs: Array.isArray(raw?.officialDocs) ? raw.officialDocs.filter((d: any) => d && d.id) : [],
  };
}

function atomicWrite(file: string, data: unknown): void {
  writeFileSync(`${file}.tmp`, JSON.stringify(data), 'utf-8');
  renameSync(`${file}.tmp`, file);
}

function readJson(file: string): any {
  try { return existsSync(file) ? JSON.parse(readFileSync(file, 'utf-8')) : null; } catch { return null; }
}

export interface DocIndex {
  chunks: Array<{ i: number; text: string }>;
  /** 每段的本地向量（base64 的 Float32） */
  vectors: string[];
  dim: number;
}

export class CampusAiStore {
  private cache: CaStored | null = null;
  private qaCache: StoredQa[] | null = null;
  private dataCache: WarnData | null = null;
  private resultCache: CaStudentResult[] | null = null;
  private indexCache = new Map<string, DocIndex>();
  private cacheDir = '';

  constructor(private readonly dirOf: () => string = () => accountPath('campus-ai')) {}

  root(): string {
    const d = this.dirOf();
    if (d !== this.cacheDir) {
      this.cache = null; this.qaCache = null; this.dataCache = null; this.resultCache = null; this.indexCache.clear(); this.listCache?.clear();
      this.cacheDir = d;
    }
    mkdirSync(d, { recursive: true });
    return d;
  }

  dir(sub: 'docs' | 'index' | 'demo' | 'brand' | 'courses' | 'files'): string {
    const d = join(this.root(), sub);
    mkdirSync(d, { recursive: true });
    return d;
  }

  read(): CaStored {
    const dir = this.root();
    if (!this.cache) this.cache = normalize(readJson(join(dir, 'state.json')));
    return this.cache;
  }

  update<T>(fn: (s: CaStored) => T): T {
    this.read();
    const out = fn(this.cache!);
    this.cache!.tickets = this.cache!.tickets.slice(0, TICKET_LIMIT);
    this.cache!.sessions = this.cache!.sessions.slice(-SESSION_LIMIT);
    atomicWrite(join(this.root(), 'state.json'), this.cache);
    return out;
  }

  // ── 问答记录 ──
  qa(): StoredQa[] {
    const dir = this.root();
    if (!this.qaCache) {
      const raw = readJson(join(dir, 'qa.json'));
      this.qaCache = Array.isArray(raw) ? raw : [];
    }
    return this.qaCache;
  }

  updateQa<T>(fn: (list: StoredQa[]) => T): T {
    const list = this.qa();
    const out = fn(list);
    if (list.length > QA_LIMIT) list.splice(QA_LIMIT);
    atomicWrite(join(this.root(), 'qa.json'), list);
    return out;
  }

  /** 按保留天数清理问答记录，返回删掉的条数 */
  purgeQa(retentionDays: number, now = Date.now()): number {
    const cutoff = now - retentionDays * 86_400_000;
    return this.updateQa((list) => {
      const before = list.length;
      const keep = list.filter((r) => Date.parse(r.at) >= cutoff);
      list.splice(0, list.length, ...keep);
      return before - keep.length;
    });
  }

  // ── 学业预警数据 ──
  data(): WarnData {
    const dir = this.root();
    if (!this.dataCache) {
      const raw = readJson(join(dir, 'data.json'));
      const e = emptyWarnData();
      for (const k of Object.keys(e) as CaDatasetKey[]) if (Array.isArray(raw?.[k])) (e as any)[k] = raw[k];
      this.dataCache = e;
    }
    return this.dataCache;
  }

  setData<K extends CaDatasetKey>(key: K, rows: WarnData[K]): void {
    this.data();
    this.dataCache![key] = rows;
    atomicWrite(join(this.root(), 'data.json'), this.dataCache);
  }

  results(): CaStudentResult[] {
    const dir = this.root();
    if (!this.resultCache) {
      const raw = readJson(join(dir, 'results.json'));
      this.resultCache = Array.isArray(raw) ? raw : [];
    }
    return this.resultCache;
  }

  setResults(list: CaStudentResult[]): void {
    this.resultCache = list;
    atomicWrite(join(this.root(), 'results.json'), list);
  }

  // ── 题库 / 批改 / 科研成果（量大，各一个文件） ──
  private listCache = new Map<string, unknown[]>();
  list<T>(name: 'questions' | 'gradings' | 'outputs'): T[] {
    const dir = this.root();
    if (!this.listCache.has(name)) {
      const raw = readJson(join(dir, `${name}.json`));
      this.listCache.set(name, Array.isArray(raw) ? raw : []);
    }
    return this.listCache.get(name) as T[];
  }
  setList<T>(name: 'questions' | 'gradings' | 'outputs', list: T[]): void {
    this.listCache.set(name, list as unknown[]);
    atomicWrite(join(this.root(), `${name}.json`), list);
  }
  questions(): CaQuestion[] { return this.list<CaQuestion>('questions'); }
  gradings(): CaGrading[] { return this.list<CaGrading>('gradings'); }
  outputs(): CaOutput[] { return this.list<CaOutput>('outputs'); }

  // ── 知识库索引 ──
  index(docId: string): DocIndex | null {
    if (this.indexCache.has(docId)) return this.indexCache.get(docId)!;
    const raw = readJson(join(this.dir('index'), `${docId}.json`));
    if (!raw || !Array.isArray(raw.chunks)) return null;
    this.indexCache.set(docId, raw);
    return raw;
  }

  setIndex(docId: string, idx: DocIndex): void {
    this.indexCache.set(docId, idx);
    atomicWrite(join(this.dir('index'), `${docId}.json`), idx);
  }

  removeIndex(docId: string): void {
    this.indexCache.delete(docId);
    rmSync(join(this.dir('index'), `${docId}.json`), { force: true });
  }

  // ── 审计 ──
  audit(entry: CaAuditEntry): void {
    try { appendFileSync(join(this.root(), 'audit.jsonl'), `${JSON.stringify(entry)}\n`, 'utf-8'); } catch { /* 审计写不进不影响业务 */ }
  }

  auditList(limit = 300): CaAuditEntry[] {
    const file = join(this.root(), 'audit.jsonl');
    if (!existsSync(file)) return [];
    const lines = readFileSync(file, 'utf-8').split('\n').filter(Boolean);
    const out: CaAuditEntry[] = [];
    for (let i = lines.length - 1; i >= 0 && out.length < limit; i--) {
      try { out.push(JSON.parse(lines[i])); } catch { /* 跳过坏行 */ }
    }
    return out;
  }

  /** 审计按保留天数裁剪 */
  purgeAudit(retentionDays: number, now = Date.now()): void {
    const file = join(this.root(), 'audit.jsonl');
    if (!existsSync(file)) return;
    const cutoff = now - retentionDays * 86_400_000;
    const keep = readFileSync(file, 'utf-8').split('\n').filter((l) => {
      if (!l) return false;
      try { return Date.parse(JSON.parse(l).at) >= cutoff; } catch { return false; }
    });
    writeFileSync(file, keep.length ? `${keep.join('\n')}\n` : '', 'utf-8');
  }
}
