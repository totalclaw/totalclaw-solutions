/**
 * 财会审计 · 公共 action（批次 1，docs/finance-audit-solution.md 第 7.4 节）：
 * 首页 / 目录 / 地区档案 / 公司档案 / 项目空间 / 数据接入 / 运行 / 产出 / 签核 / 转交 / 待办 / 设置 / 模型。
 *
 * 渲染层传来的一切都当不可信输入：逐字段校验、路径只认本方案自己的目录与用户刚选的文件。
 */
import { app, dialog, shell } from 'electron';
import { copyFileSync, existsSync, readFileSync, statSync } from 'node:fs';
import { basename, extname, join, resolve, sep } from 'node:path';
import { getLocale, i18nKey, t as i18nT, tIn } from '@totalclaw/i18n';
import {
  FAU_LOCALES, FAU_SIGN_LEVELS, FAU_STEP_KEYS,
  type FauBundle, type FauCatalogItem, type FauCompany, type FauDatasetMeta, type FauInputKind, type FauPackage, type FauProject,
  type FauProjectStatus, type FauProjectType, type FauRun, type FauRunSummary, type FauSignLevel, type FauStepKey,
} from '@totalclaw/ipc-contracts';
import * as XLSX from 'xlsx';
import AdmZip from 'adm-zip';
import { FAU_MODULES, bundleIncludes, moduleById, DEFAULT_PACKAGES } from '../../../shared/financeAudit/catalog';
import { FAU_REGION_PROFILES, STANDARD_LABELS, regionProfile } from '../../../shared/financeAudit/regions';
import { audit } from '../../services/audit';
import { newId, nowIso } from '../../services/financeAudit/store';
import { inspectFile, readAndParse } from '../../services/financeAudit/intake';
import { mapAccounts } from '../../services/financeAudit/accountMap';
import { financeAgentLedgers, readFinanceAgentLedger } from '../../services/financeAudit/intake/fromFinanceAgent';
import { isParsedKind, type TbRow } from '../../services/financeAudit/types';
import { buildRecord, lastHash, nextLevel, sha256File, verifySignoffs, SignoffError, activeRecords } from '../../services/financeAudit/signoff';
import { archiveRun } from '../../services/financeAudit/archive';
import { buildHome, computeTodos, signoffQueue } from '../../services/financeAudit/todo';
import { sendHandoff } from '../../services/financeAudit/handoff';
import { FauStepError } from '../../services/financeAudit/skillRunner';
import { thresholdFile } from '../../services/financeAudit/thresholds';
import { THRESHOLD_LABELS, isAmountThreshold, isPercentThreshold } from '../../services/financeAudit/thresholds/labels';
import { thresholdBasis } from '../../services/financeAudit/thresholds/sourceLabels';
import type { ActionTable, FauActionCtx } from './context';

const ERPS = ['yonyou', 'kingdee', 'sap', 'oracle', 'chanjet', 'other'] as const;
const PACKAGES: FauPackage[] = ['core', 'audit', 'tax', 'fpa', 'treasury', 'capital'];
const BUNDLES: FauBundle[] = ['all', 'accounting', 'audit', 'tax', 'fpa', 'treasury', 'capital'];
const PROJECT_TYPES: FauProjectType[] = ['month_close', 'annual_audit', 'filing', 'controls', 'ma', 'custom'];
const CLASSES = ['asset', 'liability', 'equity', 'revenue', 'expense', 'common', ''];

export const LEVEL_LABEL: Record<FauSignLevel, string> = { prepare: i18nKey('编制'), review: i18nKey('复核'), approve: i18nKey('批准') };
export const PROJECT_TYPE_LABEL: Record<FauProjectType, string> = {
  month_close: i18nKey('月结'), annual_audit: i18nKey('年审'), filing: i18nKey('申报'), controls: i18nKey('内控'), ma: i18nKey('并购'), custom: i18nKey('自定义'),
};

const str = (v: unknown, max: number): string => String(v ?? '').trim().slice(0, max);
const bad = (key: string, params?: Record<string, string | number>) => new FauStepError(key, params);

function fileOk(path: unknown): string {
  const p = String(path || '');
  if (!p || !existsSync(p) || !statSync(p).isFile()) throw bad(i18nKey('文件不存在：{p0}'), { p0: p });
  return p;
}

export function validateCompany(input: any, existing: FauCompany | null): FauCompany {
  const name = str(input?.name, 100);
  if (!name) throw bad(i18nKey('请填写公司名称'));
  const regions = (Array.isArray(input?.regions) ? input.regions : [input?.region]).filter((r: unknown) => FAU_REGION_PROFILES.some((p) => p.id === r));
  if (!regions.length) throw bad(i18nKey('请至少选择一个地区档案'));
  for (const r of regions) if (!regionProfile(r).available) throw bad(i18nKey('「{p0}」地区档案即将上线'), { p0: i18nT(regionProfile(r).name) });
  const region = regions.includes(input?.region) ? input.region : regions[0];
  const prof = regionProfile(region);
  const standard = prof.standards.includes(input?.standard) ? input.standard : prof.defaultStandard;
  const currency = /^[A-Z]{3}$/.test(String(input?.currency || '')) ? input.currency : prof.currency;
  const month = Number(input?.fiscalYearStartMonth);
  const signers = (Array.isArray(input?.signers) ? input.signers : []).slice(0, 50).map((s: any) => ({
    id: /^[A-Za-z0-9_-]{1,40}$/.test(String(s?.id || '')) ? s.id : newId('sg'),
    name: str(s?.name, 60), title: str(s?.title, 60),
    levels: (Array.isArray(s?.levels) ? s.levels : []).filter((l: unknown) => FAU_SIGN_LEVELS.includes(l as FauSignLevel)),
  })).filter((s: { name: string }) => s.name);
  const thresholds: Record<string, number> = {};
  for (const [k, v] of Object.entries(input?.thresholds || {})) {
    // 只认已登记阈值文件里的 key（<模块 id>.<阈值>，模块 id 可带连字符或数字，如 fixed-assets.dep.pctTol、ifrs9.stage.dpdS2）
    const mod = k.slice(0, k.indexOf('.'));
    if (/^[a-z0-9-]{2,30}\.[A-Za-z0-9_.]{1,60}$/.test(k) && thresholdFile(mod)?.items[k.slice(mod.length + 1)] && typeof v === 'number' && Number.isFinite(v) && v >= 0) thresholds[k] = v;
  }
  const accountMap = (Array.isArray(input?.accountMap) ? input.accountMap : []).slice(0, 5000).map((e: any) => ({
    code: str(e?.code, 40), name: str(e?.name, 120), cls: CLASSES.includes(e?.cls) ? e.cls : '', line: str(e?.line, 40), source: e?.source === 'manual' ? 'manual' : 'auto',
  }));
  const packages = PACKAGES.filter((p) => (Array.isArray(input?.packages) ? input.packages : DEFAULT_PACKAGES).includes(p));
  if (!packages.includes('core')) packages.unshift('core');
  const now = nowIso();
  return {
    id: existing?.id || newId('co'),
    name, regNo: str(input?.regNo, 50), vatNo: str(input?.vatNo, 50),
    regions, region, standard, currency,
    fiscalYearStartMonth: month >= 1 && month <= 12 ? Math.floor(month) : 1,
    hijriFiscalYear: !!input?.hijriFiscalYear && prof.hijri,
    erp: ERPS.includes(input?.erp) ? input.erp : 'other',
    accountMap,
    accountMapConfirmed: !!input?.accountMapConfirmed && accountMap.length > 0 && accountMap.every((e: { cls: string }) => e.cls),
    thresholds, signers,
    sodMode: input?.sodMode === 'record' ? 'record' : 'block',
    packages,
    outputLocale: FAU_LOCALES.includes(input?.outputLocale) ? input.outputLocale : (getLocale() as FauCompany['outputLocale']),
    // 示例标记只由 sample.open 打、渲染层改不了；「用默认配置开始」的标记走完一遍完整向导（不带它）就清掉
    ...(existing?.sample ? { sample: true } : {}),
    ...(input?.quickStart === true ? { quickStart: true } : {}),
    createdAt: existing?.createdAt || now, updatedAt: now,
  };
}

/** 产出根目录：首次设置时按当时的界面语言定目录名，之后固定，不随界面语言变化（第 7.2 节） */
export function ensureOutputRoot(store: FauActionCtx['store']): void {
  if (store.settings().outputRoot) return;
  store.patchSettings({ outputRoot: join(app.getPath('documents'), 'TotalClaw', tIn(getLocale(), i18nKey('财会审计'))) });
}

/** 把一个文件导入成项目数据集（复制原件进项目 files/，表格按列识别解析）；data.import 与示例项目共用 */
export function importDataset(
  store: FauActionCtx['store'], company: FauCompany, project: FauProject,
  p: { path: string; kind: FauInputKind; slot?: string; moduleId?: string; sheet?: string; mapping?: Record<string, string>; label?: string; accountLabel?: string },
): FauDatasetMeta {
  if (project.status === 'archived') throw bad(i18nKey('项目已归档，只读；请新建项目'));
  const path = fileOk(p?.path);
  const kind = p?.kind;
  const hash = sha256File(path) || '';
  const stored = join(store.filesDir(company.id, project.id), `${hash.slice(0, 12)}-${basename(path)}`);
  if (!existsSync(stored)) copyFileSync(path, stored);
  const base: Omit<FauDatasetMeta, 'rowCount' | 'mapping' | 'issues'> = {
    id: newId('ds'), projectId: project.id, kind, slot: str(p?.slot, 40) || undefined, moduleId: str(p?.moduleId, 40) || undefined,
    label: str(p?.label, 80) || basename(path), fileName: basename(path), sourcePath: path, storedPath: stored, sha256: hash,
    importedAt: nowIso(), from: 'file', currency: company.currency,
  };
  if (kind === 'evidence') {
    const meta: FauDatasetMeta = { ...base, rowCount: 0, mapping: {}, issues: [] };
    store.saveDataset(company.id, meta, []);
    return meta;
  }
  if (!isParsedKind(kind)) throw bad(i18nKey('不支持的数据类型'));
  const ins = inspectFile(path, kind, p?.sheet, p?.mapping);
  if (ins.missing.length) throw bad(i18nKey('还有必需的列没对应：{p0}'), { p0: ins.missing.map((k) => i18nT(ins.roles.find((r) => r.key === k)?.label || k)).join(i18nT('、')) });
  const parsed = readAndParse(path, kind, p?.sheet, ins.mapping, { period: project.period, accountLabel: str(p?.accountLabel, 60) || undefined });
  const meta: FauDatasetMeta = { ...base, sheetName: parsed.sheetName, mapping: ins.mapping, rowCount: parsed.rows.length, issues: parsed.issues.map((i) => ({ ...i, id: `${base.id}:${i.id}` })) };
  store.saveDataset(company.id, meta, parsed.rows);
  return meta;
}

function validPeriod(type: FauProjectType, period: string): boolean {
  if (type === 'month_close') return /^\d{4}-(0[1-9]|1[0-2])$/.test(period);
  return /^\d{4}(-(0[1-9]|1[0-2]))?$/.test(period);
}

function summary(r: FauRun, records: ReturnType<FauActionCtx['store']['readSignoffs']>): FauRunSummary {
  return { id: r.id, moduleId: r.moduleId, modeId: r.modeId, status: r.status, outputLocale: r.outputLocale, createdAt: r.createdAt, updatedAt: r.updatedAt, nextLevel: r.artifacts.length && r.status !== 'archived' ? nextLevel(r, records) : null };
}

export function commonActions(ctx: FauActionCtx): ActionTable {
  const { store, runs } = ctx;
  const changed = () => ctx.emit({ type: 'todo.changed' });

  const runOf = (runId: unknown): { run: FauRun; company: FauCompany; project: FauProject } => {
    const company = ctx.currentCompany();
    const run = store.findRun(company.id, String(runId || ''), store.settings().currentProjectId);
    if (!run) throw bad(i18nKey('找不到这次运行'));
    const project = store.getProject(company.id, run.projectId);
    if (!project) throw bad(i18nKey('找不到项目'));
    return { run, company, project };
  };

  const knownPath = (p: unknown): string => {
    const path = resolve(String(p || ''));
    const roots = [store.root(), store.settings().outputRoot].filter(Boolean).map((r) => resolve(r));
    if (!roots.some((r) => path === r || path.startsWith(r + sep))) throw bad(i18nKey('只能打开本方案生成的文件'));
    return path;
  };

  async function sign(runId: unknown, input: any, fixedLevel?: FauSignLevel): Promise<{ run: FauRun; archived: boolean }> {
    const { run, company, project } = runOf(runId);
    const all = store.readSignoffs(company.id, project.id);
    // 签核的是生成时的那份文件：被改过就不让签，先重新生成
    const artifacts = run.artifacts.map((a) => ({ path: a.path, sha256: sha256File(a.path) || '' }));
    const changedFile = run.artifacts.find((a, i) => a.sha256 !== artifacts[i].sha256);
    if (changedFile) throw bad(i18nKey('底稿生成后被改动或删除了：{p0}，请重新生成后再签核'), { p0: basename(changedFile.path) });
    const level: FauSignLevel = fixedLevel || input?.level;
    let rec;
    try {
      rec = buildRecord(run, all, {
        level, decision: fixedLevel ? 'approve' : (input?.decision === 'return' ? 'return' : 'approve'),
        signer: { name: str(input?.signer?.name, 60), title: str(input?.signer?.title, 60) },
        comment: str(input?.comment, 2000),
        acknowledged: (Array.isArray(input?.acknowledged) ? input.acknowledged : []).map((x: unknown) => str(x, 200)),
        returnToStep: FAU_STEP_KEYS.includes(input?.returnToStep) && ['validate', 'analyze', 'draft'].includes(input.returnToStep) ? input.returnToStep : 'analyze',
      }, { sodMode: company.sodMode, artifacts, prevHash: lastHash(all) });
    } catch (e) {
      if (e instanceof SignoffError) {
        const params = { ...e.params };
        if (e.code === 'order' && typeof params.p0 === 'string') params.p0 = i18nT(LEVEL_LABEL[params.p0 as FauSignLevel] || params.p0);
        throw bad(e.message, params);
      }
      throw e;
    }
    store.appendSignoff(company.id, project.id, rec);
    try {
      audit({ actor: 'user', action: 'finance-audit.signoff', result: 'ok', subject: `${run.moduleId}/${run.id}/${rec.level}/${rec.decision}`, reason: rec.hash });
    } catch { /* 审计日志失败不挡签核：签核记录本身已落盘 */ }
    const allNow = [...all, rec];
    if (rec.decision === 'return') {
      run.returned = { level: rec.level, by: rec.signer.name, comment: rec.comment || '', toStep: rec.returnToStep || 'analyze', at: rec.at };
      runs.markReturned(run, run.returned.toStep);
      run.steps.signoff = { status: 'todo', summary: { key: i18nKey('已退回到第 {n} 步：{p0}'), params: { n: FAU_STEP_KEYS.indexOf(run.returned.toStep) + 1, p0: run.returned.comment.slice(0, 80) } } };
      store.saveRun(run);
      ctx.emit({ type: 'run.state', runId: run.id });
      changed();
      return { run, archived: false };
    }
    const next = nextLevel(run, allNow);
    if (next) {
      run.status = 'signing';
      run.steps.signoff = { status: 'todo', summary: { key: i18nKey('{p0}已签，待{p1}'), params: { p0: i18nT(LEVEL_LABEL[rec.level]), p1: i18nT(LEVEL_LABEL[next]) } } };
      store.saveRun(run);
      ctx.emit({ type: 'run.state', runId: run.id });
      changed();
      return { run, archived: false };
    }
    // 最后一级通过：归档（第 ⑦ 步）
    run.steps.signoff = { status: 'done', finishedAt: Date.now(), summary: { key: i18nKey('各级签核完成') } };
    run.steps.archive = { status: 'running', startedAt: Date.now(), progressAt: Date.now() };
    store.saveRun(run);
    try {
      const out = await archiveRun(store, run, company, project, allNow, ctx.writePdf);
      run.status = 'archived';
      run.archivedAt = nowIso();
      run.steps.archive = { status: 'done', finishedAt: Date.now(), summary: { key: i18nKey('已归档 {n} 个文件'), params: { n: out.files.length } } };
    } catch (e) {
      run.steps.archive = { status: 'failed', finishedAt: Date.now(), error: { key: i18nKey('归档失败：{p0}'), params: { p0: String((e as Error)?.message || e).slice(0, 200) } } };
    }
    store.saveRun(run);
    ctx.emit({ type: 'run.state', runId: run.id });
    changed();
    return { run, archived: run.status === 'archived' };
  }

  function projectStatus(company: FauCompany, project: FauProject): FauProjectStatus {
    const rs = store.listRuns(company.id, project.id);
    const recs = store.readSignoffs(company.id, project.id);
    return {
      project,
      prev: project.prevProjectId ? store.getProject(company.id, project.prevProjectId) : null,
      runs: rs.map((r) => summary(r, recs)),
      datasets: store.datasetMetas(company.id, project.id),
      signoff: {
        pending: signoffQueue(rs, recs).filter((q) => !q.returned).length,
        signed: rs.filter((r) => r.status === 'archived').length,
        returned: rs.filter((r) => r.status === 'returned').length,
      },
      artifacts: rs.flatMap((r) => r.artifacts.map((a) => ({ ...a, runId: r.id, moduleId: r.moduleId }))),
    };
  }

  return {
    'home.get': () => {
      const home = buildHome(store);
      // 当前选择丢了（被删 / 首次）就落到第一个
      const patch: Record<string, string> = {};
      if (home.company && home.settings.currentCompanyId !== home.company.id) patch.currentCompanyId = home.company.id;
      if (home.project && home.settings.currentProjectId !== home.project.id) patch.currentProjectId = home.project.id;
      if (Object.keys(patch).length) home.settings = store.patchSettings(patch);
      return home;
    },

    'catalog.get': (): FauCatalogItem[] => {
      const company = store.getCompany(store.settings().currentCompanyId);
      const bundle = store.settings().bundle;
      return FAU_MODULES.map((m) => ({
        ...m,
        applicable: !company || m.regions === 'all' || m.regions.some((r) => company.regions.includes(r)),
        visible: bundleIncludes(bundle, m) && (!company || company.packages.includes(m.package)),
      }));
    },

    'region.profiles': () => ({ profiles: FAU_REGION_PROFILES, standards: STANDARD_LABELS }),

    /** 判断依据：阈值默认值、公司覆盖值、出处（第 6.5 节；原文中文，界面标「以原文为准」） */
    'thresholds.get': (p: { modules?: string[] }) => {
      const company = store.getCompany(store.settings().currentCompanyId);
      const mods = (Array.isArray(p?.modules) && p.modules.length ? p.modules : ['close', 'recon']).map((m) => str(m, 20));
      return mods.flatMap((m) => {
        const f = thresholdFile(m);
        if (!f) return [];
        return Object.entries(f.items).map(([k, item]) => {
          const key = `${m}.${k}`;
          // 出处只给可读的依据名 + 章节，不把上游仓库路径带到界面；原文里给开发看的「（分）/（最小货币单位）」注记去掉（界面按元显示）
          return {
            key, module: m, value: item.value, override: company?.thresholds?.[key] ?? null, label: THRESHOLD_LABELS[key] || '', original: item.label.replace(/（(分|最小货币单位)）/g, ''),
            basis: thresholdBasis(item.source.file), section: item.source.section, amount: isAmountThreshold(key), percent: isPercentThreshold(key, item.value, item.label), version: f.version,
          };
        });
      });
    },

    // ── 公司档案（P1） ──
    'company.list': () => store.listCompanies(),
    'company.get': (p: { id?: string }) => store.getCompany(String(p?.id || store.settings().currentCompanyId)),
    'company.switch': (p: { id: string }) => {
      const c = store.getCompany(str(p?.id, 64));
      if (!c) throw bad(i18nKey('找不到公司档案'));
      // 换公司：项目落到这家公司的第一个（home.get 会自动补）
      store.patchSettings({ currentCompanyId: c.id, currentProjectId: store.listProjects(c.id)[0]?.id || '' });
      changed();
      return c;
    },
    'company.save': (p: { company: any }) => {
      const existing = p?.company?.id ? store.getCompany(String(p.company.id)) : null;
      const c = store.saveCompany(validateCompany(p?.company, existing));
      ensureOutputRoot(store);
      store.patchSettings({ currentCompanyId: c.id, ...(existing ? {} : { currentProjectId: '' }) });
      changed();
      return c;
    },
    'company.remove': (p: { id: string }) => {
      const c = store.getCompany(String(p?.id || ''));
      if (!c) return false;
      if (store.listProjects(c.id).some((pr) => store.listRuns(c.id, pr.id).some((r) => r.status === 'archived'))) {
        throw bad(i18nKey('这家公司已有签核归档的底稿，不能删除'));
      }
      store.removeCompany(c.id);
      if (store.settings().currentCompanyId === c.id) store.patchSettings({ currentCompanyId: '', currentProjectId: '' });
      changed();
      return true;
    },
    /** 第 5.3 节第 2 步：上传科目余额表 → 自动映射（中国科目表自动完成，其它进入人工确认） */
    'company.mapAccounts': (p: { path: string; sheet?: string; mapping?: Record<string, string>; standard?: string; previous?: any[] }) => {
      const path = fileOk(p?.path);
      const ins = inspectFile(path, 'tb', p?.sheet, p?.mapping);
      if (ins.missing.length) return { inspect: ins, result: null };
      const parsed = readAndParse(path, 'tb', p?.sheet, ins.mapping);
      const standard = (Object.keys(STANDARD_LABELS) as string[]).includes(String(p?.standard)) ? p.standard as FauCompany['standard'] : 'CAS';
      return { inspect: ins, result: mapAccounts(parsed.rows as TbRow[], standard, Array.isArray(p?.previous) ? p.previous : []) };
    },

    // ── 项目空间（P2） ──
    'project.list': () => store.listProjects(ctx.currentCompany().id),
    'project.create': (p: { name?: string; type?: string; period?: string; prevProjectId?: string }) => {
      const company = ctx.currentCompany();
      const type = PROJECT_TYPES.includes(p?.type as FauProjectType) ? p.type as FauProjectType : 'month_close';
      const period = str(p?.period, 7);
      if (!validPeriod(type, period)) throw bad(i18nKey('期间格式不对：月结用 YYYY-MM，其它用 YYYY 或 YYYY-MM'));
      const prev = p?.prevProjectId ? store.getProject(company.id, String(p.prevProjectId)) : null;
      if (p?.prevProjectId && !prev) throw bad(i18nKey('找不到上一期项目'));
      const now = nowIso();
      const project: FauProject = {
        id: newId('pj'), companyId: company.id, type, period,
        name: str(p?.name, 80) || `${period} ${i18nT(PROJECT_TYPE_LABEL[type])}`,
        prevProjectId: prev?.id, status: 'open', createdAt: now, updatedAt: now,
      };
      store.saveProject(project);
      store.patchSettings({ currentProjectId: project.id });
      changed();
      return project;
    },
    'project.switch': (p: { id: string }) => {
      const company = ctx.currentCompany();
      const project = store.getProject(company.id, String(p?.id || ''));
      if (!project) throw bad(i18nKey('找不到项目'));
      store.patchSettings({ currentProjectId: project.id });
      changed();
      return project;
    },
    'project.status': (p: { id?: string }) => {
      const company = ctx.currentCompany();
      const project = store.getProject(company.id, String(p?.id || store.settings().currentProjectId));
      if (!project) throw bad(i18nKey('找不到项目'));
      return projectStatus(company, project);
    },
    'project.archive': (p: { id: string }) => {
      const company = ctx.currentCompany();
      const project = store.getProject(company.id, String(p?.id || ''));
      if (!project) throw bad(i18nKey('找不到项目'));
      const open = store.listRuns(company.id, project.id).filter((r) => r.status !== 'archived' && r.status !== 'void');
      if (open.length) throw bad(i18nKey('还有 {n} 次运行没有签核归档或作废，不能归档项目'), { n: open.length });
      project.status = 'archived';
      project.updatedAt = nowIso();
      store.saveProject(project);
      changed();
      return project;
    },

    // ── 数据接入（P3） ──
    'data.pick': async (p: { kind?: string; multi?: boolean }) => {
      const tables = [{ name: 'Excel / CSV', extensions: ['xlsx', 'xls', 'xlsm', 'csv'] }];
      const docs = [{ name: 'PDF / Office / Images', extensions: ['pdf', 'ofd', 'docx', 'xlsx', 'xls', 'png', 'jpg', 'jpeg'] }];
      const w = ctx.win();
      // 银行流水另收 MT940 / CAMT.053 对账单（批次 2）
      const bank = [{ name: 'Excel / CSV / MT940 / CAMT.053', extensions: ['xlsx', 'xls', 'xlsm', 'csv', 'sta', 'mt940', '940', 'txt', 'xml', '053'] }];
      const opts = { properties: (p?.multi ? ['openFile', 'multiSelections'] : ['openFile']) as Array<'openFile' | 'multiSelections'>, filters: p?.kind === 'evidence' ? docs : p?.kind === 'bank' ? bank : tables };
      const r = w ? await dialog.showOpenDialog(w, opts) : await dialog.showOpenDialog(opts);
      return { paths: r.canceled ? [] : r.filePaths };
    },
    'data.inspect': (p: { path: string; kind: FauInputKind; sheet?: string; mapping?: Record<string, string> }) => {
      if (!isParsedKind(p?.kind)) throw bad(i18nKey('这类数据不需要识别列'));
      return inspectFile(fileOk(p?.path), p.kind, p?.sheet, p?.mapping);
    },
    'data.import': (p: { path: string; kind: FauInputKind; slot?: string; moduleId?: string; sheet?: string; mapping?: Record<string, string>; label?: string; accountLabel?: string }) => {
      const { company, project } = ctx.current();
      const meta = importDataset(store, company, project, p);
      changed();
      return meta;
    },
    'data.list': (p: { kind?: string }) => {
      const { company, project } = ctx.current();
      return store.datasetMetas(company.id, project.id).filter((m) => !p?.kind || m.kind === p.kind);
    },
    'data.remove': (p: { id: string }) => {
      const { company, project } = ctx.current();
      const id = str(p?.id, 64);
      if (store.listRuns(company.id, project.id).some((r) => r.status === 'archived' && Object.values(r.inputs).flat().includes(id))) {
        throw bad(i18nKey('这份数据已被签核归档的运行引用，不能删除'));
      }
      store.removeDataset(company.id, project.id, id);
      changed();
      return true;
    },
    'data.financeAgentLedgers': () => financeAgentLedgers(),
    'data.importFromFinanceAgent': (p: { ledgerId: string; period?: string }) => {
      const { company, project } = ctx.current();
      const period = str(p?.period, 7) || project.period;
      const got = readFinanceAgentLedger(str(p?.ledgerId, 64), period);
      if (!got.journal.length && !got.tb) throw bad(i18nKey('财务智能体这个账套在 {p0} 没有序时账或余额表'), { p0: period });
      const out: FauDatasetMeta[] = [];
      const mk = (kind: FauInputKind, rows: unknown[], label: string): FauDatasetMeta => {
        const meta: FauDatasetMeta = {
          id: newId('ds'), projectId: project.id, kind, label, fileName: label, sourcePath: '', storedPath: '', sha256: '',
          mapping: {}, rowCount: rows.length, importedAt: nowIso(), from: 'finance-agent', issues: [], currency: company.currency,
        };
        store.saveDataset(company.id, meta, rows);
        return meta;
      };
      if (got.journal.length) out.push(mk('journal', got.journal, `${got.ledgerName} · ${i18nT(i18nKey('序时账'))} · ${period}`));
      if (got.tb) out.push(mk('tb', got.tb, `${got.ledgerName} · ${i18nT(i18nKey('科目余额表'))} · ${got.tbPeriod}`));
      changed();
      return out;
    },

    // ── 运行 ──
    'run.create': (p: { moduleId: string; modeId: string; outputLocale?: string; params?: Record<string, unknown> }) => {
      const { company, project } = ctx.current();
      const locale = FAU_LOCALES.includes(p?.outputLocale as never) ? p.outputLocale as FauRun['outputLocale'] : undefined;
      const run = runs.create(company, project, { moduleId: str(p?.moduleId, 40), modeId: str(p?.modeId, 40), outputLocale: locale, params: sanitizeParams(p?.params) });
      changed();
      return run;
    },
    'run.setInputs': (p: { runId: string; inputs: Record<string, string[]>; params?: Record<string, unknown> }) => {
      const { run } = runOf(p?.runId);
      const inputs: Record<string, string[]> = {};
      for (const [k, v] of Object.entries(p?.inputs || {})) if (Array.isArray(v)) inputs[str(k, 40)] = v.map((x) => str(x, 64)).slice(0, 20);
      return runs.setInputs(run, inputs, sanitizeParams(p?.params));
    },
    /** run.start({runId}) 或 run.start({moduleId, modeId, inputs, params, outputLocale}) 一步建好就跑 */
    'run.start': async (p: { runId?: string; moduleId?: string; modeId?: string; inputs?: Record<string, string[]>; params?: Record<string, unknown>; outputLocale?: string; fromStep?: FauStepKey }) => {
      const { company, project } = ctx.current();
      let run: FauRun;
      if (p?.runId) run = runOf(p.runId).run;
      else {
        run = runs.create(company, project, { moduleId: str(p?.moduleId, 40), modeId: str(p?.modeId, 40), outputLocale: FAU_LOCALES.includes(p?.outputLocale as never) ? p!.outputLocale as FauRun['outputLocale'] : undefined, params: sanitizeParams(p?.params) });
        run = runs.setInputs(run, p?.inputs || {});
      }
      const proj = store.getProject(company.id, run.projectId) || project;
      return runs.start(run, company, proj, FAU_STEP_KEYS.includes(p?.fromStep as FauStepKey) ? p!.fromStep : 'validate');
    },
    'run.get': (p: { runId: string }) => {
      const { run, company, project } = runOf(p?.runId);
      const recs = store.readSignoffs(company.id, project.id);
      return {
        run, missing: runs.missingInputs(run), running: runs.isRunning(run.id),
        nextLevel: run.artifacts.length && run.status !== 'archived' ? nextLevel(run, recs) : null,
        records: recs.filter((r) => r.runId === run.id), active: activeRecords(run.id, recs),
      };
    },
    'run.list': (p: { moduleId?: string }) => {
      const { company, project } = ctx.current();
      const recs = store.readSignoffs(company.id, project.id);
      return store.listRuns(company.id, project.id, p?.moduleId ? str(p.moduleId, 40) : undefined).map((r) => summary(r, recs));
    },
    'run.cancel': async (p: { runId: string }) => {
      const { run } = runOf(p?.runId);
      await runs.cancel(run.id);
      return true;
    },
    'run.retry': async (p: { runId: string; fromStep?: FauStepKey }) => {
      const { run, company, project } = runOf(p?.runId);
      // 重新生成先取消旧任务（UX 硬规则三）
      await runs.cancel(run.id);
      const fresh = store.findRun(company.id, run.id, project.id)!;
      return runs.start(fresh, company, project, FAU_STEP_KEYS.includes(p?.fromStep as FauStepKey) ? p!.fromStep : 'validate');
    },

    // ── 产出 ──
    'artifact.open': async (p: { path: string }) => {
      const err = await shell.openPath(knownPath(p?.path));
      if (err) throw bad(i18nKey('打开失败：{p0}'), { p0: err });
      return true;
    },
    'artifact.reveal': (p: { path: string }) => { shell.showItemInFolder(knownPath(p?.path)); return true; },
    'artifact.preview': (p: { path: string; maxRows?: number }) => {
      const path = knownPath(p?.path);
      if (!existsSync(path)) throw bad(i18nKey('文件不存在：{p0}'), { p0: basename(path) });
      const max = Math.min(Math.max(Number(p?.maxRows) || 30, 5), 200);
      if (extname(path).toLowerCase() === '.xlsx') {
        const wb = XLSX.read(readFileSync(path), { type: 'buffer' });
        return {
          kind: 'xlsx', rtl: !!(wb.Workbook?.Views?.[0] as { RTL?: boolean } | undefined)?.RTL,
          sheets: wb.SheetNames.map((n) => ({ name: n, rows: (XLSX.utils.sheet_to_json(wb.Sheets[n], { header: 1, defval: '' }) as unknown[][]).slice(0, max) })),
        };
      }
      if (extname(path).toLowerCase() === '.docx') {
        const xmlText = new AdmZip(path).readAsText('word/document.xml');
        const paras = xmlText.split('</w:p>').map((s: string) => s.replace(/<[^>]+>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').trim()).filter(Boolean);
        return { kind: 'docx', rtl: xmlText.includes('<w:bidi/>'), paragraphs: paras.slice(0, max * 4) };
      }
      return { kind: 'other' };
    },

    // ── 签核（第 9 节） ──
    'signoff.queue': () => {
      const { company, project } = ctx.current();
      return signoffQueue(store.listRuns(company.id, project.id), store.readSignoffs(company.id, project.id));
    },
    'signoff.submit': (p: any) => sign(p?.runId, p, 'prepare'),
    'signoff.decide': (p: any) => {
      if (!['review', 'approve'].includes(p?.level)) throw bad(i18nKey('签核级别不对'));
      return sign(p?.runId, p);
    },
    'signoff.history': (p: { runId?: string }) => {
      const { company, project } = ctx.current();
      const all = store.readSignoffs(company.id, project.id);
      return p?.runId ? all.filter((r) => r.runId === p.runId) : all;
    },
    'signoff.verify': (p: { runId?: string }) => {
      const { company, project } = ctx.current();
      return verifySignoffs(store.readSignoffs(company.id, project.id), store.listRuns(company.id, project.id), (id) => store.archiveDir(company.id, project.id, id), p?.runId ? str(p.runId, 64) : undefined);
    },

    // ── 转交（第 4.3 节） ──
    'handoff.send': (p: { fromRunId: string; toModuleId: string }) => {
      const { run, company, project } = runOf(p?.fromRunId);
      const rec = sendHandoff(store, company, project, run, str(p?.toModuleId, 40));
      changed();
      return rec;
    },
    'handoff.list': () => {
      const { company, project } = ctx.current();
      return store.handoffs(company.id, project.id);
    },

    // ── 首页 / 设置 ──
    'todo.list': () => {
      const { company, project } = ctx.current();
      return computeTodos(store.listRuns(company.id, project.id), store.readSignoffs(company.id, project.id));
    },
    'settings.patch': (p: { bundle?: string; moduleModels?: Record<string, string>; outputRoot?: string }) => {
      const patch: Record<string, unknown> = {};
      if (BUNDLES.includes(p?.bundle as FauBundle)) patch.bundle = p.bundle;
      if (p?.moduleModels && typeof p.moduleModels === 'object') {
        patch.moduleModels = Object.fromEntries(Object.entries(p.moduleModels).filter(([k]) => moduleById(k)).map(([k, v]) => [k, str(v, 120)]));
      }
      if (typeof p?.outputRoot === 'string' && p.outputRoot.trim()) patch.outputRoot = resolve(p.outputRoot.trim());
      const s = store.patchSettings(patch);
      changed();
      return s;
    },
    'models.list': () => ctx.modelOptions(),
  };
}

/** 运行参数只收简单值（模块自己的 action 里再按需细校验） */
export function sanitizeParams(v: unknown): Record<string, unknown> {
  if (!v || typeof v !== 'object' || Array.isArray(v)) return {};
  const out: Record<string, unknown> = {};
  for (const [k, x] of Object.entries(v as Record<string, unknown>).slice(0, 40)) {
    if (!/^[A-Za-z][A-Za-z0-9_]{0,40}$/.test(k)) continue;
    if (typeof x === 'string') out[k] = x.slice(0, 500);
    else if (typeof x === 'number' && Number.isFinite(x)) out[k] = x;
    else if (typeof x === 'boolean') out[k] = x;
    else if (Array.isArray(x)) out[k] = JSON.parse(JSON.stringify(x.slice(0, 200)));
    else if (x && typeof x === 'object') out[k] = JSON.parse(JSON.stringify(x));
  }
  return out;
}
