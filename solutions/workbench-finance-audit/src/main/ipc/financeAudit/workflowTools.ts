/**
 * 财会审计 · 编排用的 workflow 工具（批次 8，docs/finance-audit-solution.md 第 9.4、12.2、12.3 节）。
 *
 *   finance-audit:run-engine  项目（id 或期间）+ 模块 + 模式 + 数据集 → 走工作台同一个 RunManager（③ 校验 ④ 计算 ⑤ 底稿），
 *                             返回引擎结果 JSON。金额全部由引擎算；流程里的模型节点只解读这份结果。
 *   finance-audit:import-run  把流程产出（解读与复核说明）作为一份草稿文件挂到那次运行上，之后在工作台走 SignoffCard 正式签核。
 *                             流程里的 human_confirm 只记流程内的复核意见；正式签核记录只有工作台一处。
 *
 * 试跑：sample=demo 时用内置示例数据（services/financeAudit/samples/）在独立的试跑区跑，不进用户的项目；金标准用例靠它。
 * 工具节点的入参经引擎插值，未提供的变量会原样留成 ${key}，这里一律当没填。
 */
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { i18nKey, t as i18nT, tIn } from '@totalclaw/i18n';
import type { FauArtifact, FauCompany, FauDatasetMeta, FauModuleDef, FauProject, FauRun } from '@totalclaw/ipc-contracts';
import { FAU_WORKFLOW_TOOLS } from '@totalclaw/ipc-contracts';
import { inputsForMode, moduleById } from '../../../shared/financeAudit/catalog';
import { accountPath } from '../../services/accountScope';
import { FinanceAuditStore, newId, nowIso } from '../../services/financeAudit/store';
import { RunManager, type ModuleRunner } from '../../services/financeAudit/runner';
import { FauStepError } from '../../services/financeAudit/skillRunner';
import { openItemsFor } from '../../services/financeAudit/handoff';
import { OUT, outputDirFor, outputFileName } from '../../services/financeAudit/outputs/common';
import { sha256File } from '../../services/financeAudit/signoff';
import { mapAccounts } from '../../services/financeAudit/accountMap';
import { SAMPLES } from '../../services/financeAudit/samples';
import type { TbRow } from '../../services/financeAudit/types';
import { sanitizeParams, validateCompany } from './common.actions';
import type { FauActionCtx } from './context';

export const FAU_TOOL_RUN_ENGINE = 'finance-audit:run-engine';
export const FAU_TOOL_IMPORT_RUN = 'finance-audit:import-run';
const TOOLS = new Set<string>(FAU_WORKFLOW_TOOLS);

export function isFinanceAuditTool(name: unknown): boolean {
  return typeof name === 'string' && TOOLS.has(name);
}

let bound: { ctx: FauActionCtx; runners: Record<string, ModuleRunner> } | null = null;

/** financeAudit.ipc.ts 注册时绑定（工作流执行器在别的模块里，按名字转进来） */
export function bindFinanceAuditWorkflowTools(ctx: FauActionCtx, runners: Record<string, ModuleRunner>): void {
  bound = { ctx, runners };
}

/** 没提供的模板变量（`${key}`）、空串都当没填 */
const val = (v: unknown): string => {
  const s = typeof v === 'string' ? v.trim() : v == null ? '' : String(v).trim();
  return /^\$\{\w+\}$/.test(s) ? '' : s;
};
const stripUnresolved = (s: string): string => s.replace(/\$\{\w+\}/g, '').trim();

export interface FauEngineOutput {
  /** fau:<公司>:<项目>:<运行>[:trial]，import-run 靠它找回运行（插值后的文字可能被截断，它排在最前） */
  runRef: string;
  runId: string;
  companyId: string;
  projectId: string;
  trial: boolean;
  moduleId: string;
  modeId: string;
  period: string;
  status: FauRun['status'];
  summary: string;
  validation: { blockers: number; warnings: number };
  reminders: string[];
  artifacts: Array<{ title: string; path: string }>;
  result: unknown;
}

export async function runFinanceAuditTool(name: string, input: Record<string, unknown> = {}): Promise<unknown> {
  if (!bound) throw new Error(i18nT('财会审计工作台没有启用，流程里的计算步骤用不了'));
  try {
    return name === FAU_TOOL_RUN_ENGINE ? await runEngine(bound.ctx, bound.runners, input) : importRun(bound.ctx, input);
  } catch (e) {
    if (e instanceof FauStepError) throw new Error(i18nT(e.key, e.params));
    throw e;
  }
}

// ── run-engine ──────────────────────────────────────────────────────────────

function datasetIdsOf(v: unknown): string[] {
  const list = Array.isArray(v) ? v : val(v).split(/[\s,，;]+/);
  return list.map((x) => val(x)).filter((x) => /^[A-Za-z0-9_-]{1,64}$/.test(x));
}

/** 按槽位挑数据：显式给的数据集按类型依次填槽位；没给的先找在本模块这个槽位导入的，再按类型找（文件型只认槽位） */
export function pickInputs(def: FauModuleDef, modeId: string, metas: FauDatasetMeta[], explicit: string[]): { inputs: Record<string, string[]>; missing: string[] } {
  const slots = inputsForMode(def, modeId);
  const inputs: Record<string, string[]> = {};
  const used = new Set<string>();
  const take = (slotId: string, m: FauDatasetMeta) => { (inputs[slotId] ||= []).push(m.id); used.add(m.id); };
  for (const id of explicit) {
    const m = metas.find((x) => x.id === id);
    const s = m && (slots.find((x) => x.id === m.slot && x.kind === m.kind && (x.multi || !inputs[x.id])) || slots.find((x) => x.kind === m.kind && (x.multi || !inputs[x.id])));
    if (m && s) take(s.id, m);
  }
  if (!explicit.length) {
    // metas 已按导入时间新→旧排好
    for (const s of slots) {
      const own = metas.filter((m) => !used.has(m.id) && m.kind === s.kind && m.slot === s.id && (!m.moduleId || m.moduleId === def.id));
      const byKind = s.kind === 'evidence' ? [] : metas.filter((m) => !used.has(m.id) && m.kind === s.kind && !slots.some((o) => o.id !== s.id && o.id === m.slot));
      const pick = own.length ? own : s.needed ? byKind : [];
      for (const m of s.multi ? pick : pick.slice(0, 1)) take(s.id, m);
    }
  }
  return { inputs, missing: slots.filter((s) => s.needed && !inputs[s.id]?.length).map((s) => s.label) };
}

function findProject(store: FinanceAuditStore, company: FauCompany, projectId: string, period: string): FauProject {
  if (projectId) {
    const p = store.getProject(company.id, projectId);
    if (!p) throw new FauStepError(i18nKey('找不到项目'));
    return p;
  }
  const projects = store.listProjects(company.id);
  if (period) {
    const hit = projects.filter((p) => p.period === period).sort((a, b) => Number(a.status === 'archived') - Number(b.status === 'archived'))[0];
    if (!hit) throw new FauStepError(i18nKey('财会审计工作台里没有期间为 {p0} 的项目：请先在工作台新建这个项目并导入数据，或者把「试跑数据」填 demo 用示例数据试跑'), { p0: period });
    return hit;
  }
  const cur = store.getProject(company.id, store.settings().currentProjectId) || projects[0];
  if (!cur) throw new FauStepError(i18nKey('还没有项目，请先新建一个项目（如「2026-09 月结」）'));
  return cur;
}

/** 试跑区：每次用示例数据重建一家试跑公司 + 一个项目，和用户的工作台数据完全分开 */
function trialSetup(ctx: FauActionCtx, runners: Record<string, ModuleRunner>, def: FauModuleDef, modeId: string): { store: FinanceAuditStore; runs: RunManager; company: FauCompany; project: FauProject; inputs: Record<string, string[]>; params: Record<string, unknown> } {
  const sample = SAMPLES[`${def.id}.${modeId}`];
  if (!sample) throw new FauStepError(i18nKey('「{p0}」没有内置的试跑数据，请在财会审计工作台导入真实数据后再跑'), { p0: `${def.code} ${i18nT(def.name)}` });
  const root = accountPath('finance-audit-trial', `${def.id}.${modeId}`);
  rmSync(root, { recursive: true, force: true });
  const store = new FinanceAuditStore(() => root);
  const runs = new RunManager({
    store, runners, llm: ctx.llm, emit: () => undefined, logger: ctx.deps.logger,
    outputDirFor: (_run, company, project, d) => outputDirFor(store.root(), company.name, project.name, d.code, i18nT(d.name)),
    openItemsFor: (run, company, project) => openItemsFor(store, run, company, project),
  });
  const tb = sample.datasets.find((d) => d.kind === 'tb');
  const draft = validateCompany({ ...sample.company, outputLocale: ctx.store.getCompany(ctx.store.settings().currentCompanyId)?.outputLocale }, null);
  const company = store.saveCompany({ ...draft, accountMap: tb ? mapAccounts(tb.rows as TbRow[], draft.standard).entries : [], accountMapConfirmed: !!tb });
  const project = store.saveProject({ id: newId('pj'), companyId: company.id, name: `${sample.project.period} ${i18nT(i18nKey('试跑'))}`, type: sample.project.type, period: sample.project.period, status: 'open', createdAt: nowIso(), updatedAt: nowIso() });
  store.patchSettings({ currentCompanyId: company.id, currentProjectId: project.id });
  const inputs: Record<string, string[]> = {};
  for (const d of sample.datasets) {
    const meta: FauDatasetMeta = {
      id: newId('ds'), projectId: project.id, kind: d.kind, slot: d.slot, moduleId: def.id, label: d.slot, fileName: '', sourcePath: '', storedPath: '', sha256: '',
      mapping: {}, rowCount: d.rows.length, importedAt: nowIso(), from: 'file', issues: [], currency: company.currency,
    };
    store.saveDataset(company.id, meta, d.rows);
    (inputs[d.slot] ||= []).push(meta.id);
  }
  return { store, runs, company, project, inputs, params: sample.params };
}

async function runEngine(ctx: FauActionCtx, runners: Record<string, ModuleRunner>, input: Record<string, unknown>): Promise<FauEngineOutput | { skipped: true; reason: string; moduleId: string; modeId: string }> {
  const def = moduleById(val(input.moduleId));
  if (!def || def.status !== 'ready' || !runners[def.id]) throw new FauStepError(i18nKey('未知模块：{p0}'), { p0: val(input.moduleId) || '-' });
  const modeId = val(input.modeId) || def.modes[0]?.id || '';
  if (!def.modes.some((m) => m.id === modeId)) throw new FauStepError(i18nKey('这个模块没有「{p0}」模式'), { p0: modeId });
  const trial = val(input.sample).toLowerCase() === 'demo';
  // 专家团里可选的计算步骤：没项目、缺数据、引擎没算完都跳过并说明，不把整条流程卡死（模型照「未核实」写）
  const optional = val(input.optional) === 'true' || input.optional === true;
  const skip = (reason: string) => ({ skipped: true as const, reason, moduleId: def.id, modeId });
  const runParams: Record<string, unknown> = {};
  const rawParams = input.params && typeof input.params === 'object' ? input.params as Record<string, unknown> : {};
  for (const [k, v] of Object.entries(rawParams)) if (val(v)) runParams[k] = typeof v === 'number' ? v : val(v);

  let store: FinanceAuditStore;
  let runs: RunManager;
  let company: FauCompany;
  let project: FauProject;
  let inputs: Record<string, string[]>;
  let baseParams: Record<string, unknown> = {};
  if (trial) {
    ({ store, runs, company, project, inputs, params: baseParams } = trialSetup(ctx, runners, def, modeId));
  } else {
    ({ store, runs } = ctx);
    try {
      company = ctx.currentCompany();
      project = findProject(store, company, val(input.projectId), val(input.period));
    } catch (e) {
      if (optional && e instanceof FauStepError) return skip(i18nT(e.key, e.params));
      throw e;
    }
    const picked = pickInputs(def, modeId, store.datasetMetas(company.id, project.id), datasetIdsOf(input.datasetIds));
    if (picked.missing.length) {
      const reason = i18nT('项目「{p0}」还缺必需的数据：{p1}。请先在财会审计工作台「{p2}」第 2 步导入', { p0: project.name, p1: picked.missing.map((m) => i18nT(m)).join(i18nT('、')), p2: `${def.code} ${i18nT(def.name)}` });
      if (optional) return skip(reason);
      throw new Error(reason);
    }
    inputs = picked.inputs;
  }

  const params = sanitizeParams({ ...baseParams, ...runParams });
  if (!params.period && val(input.period)) params.period = val(input.period);
  let run = runs.create(company, project, { moduleId: def.id, modeId, params });
  run = runs.setInputs(run, inputs);
  await runs.start(run, company, project);
  await runs.wait(run.id);
  run = store.findRun(company.id, run.id, project.id)!;
  if (!trial) ctx.emit({ type: 'todo.changed' });
  const loc = run.outputLocale;
  const msg = (m: { key: string; params?: Record<string, string | number> } | undefined) => (m ? tIn(loc, m.key, m.params) : '');
  const bad = (['validate', 'analyze', 'draft'] as const).find((k) => ['failed', 'blocked', 'interrupted'].includes(run.steps[k].status));
  if (bad) {
    const blockers = (run.validation?.blockers || []).slice(0, 5).map((b) => msg(b.message)).join(i18nT('；'));
    const reason = i18nT('财会审计引擎没有算完（{p0}）：{p1}', { p0: bad, p1: [msg(run.steps[bad].error), blockers].filter(Boolean).join(' — ') });
    if (optional) return skip(reason);
    throw new Error(reason);
  }
  return {
    runRef: `fau:${company.id}:${project.id}:${run.id}${trial ? ':trial' : ''}`,
    runId: run.id, companyId: company.id, projectId: project.id, trial,
    moduleId: def.id, modeId, period: String(run.params.period || project.period), status: run.status,
    summary: msg(run.steps.analyze.summary),
    validation: { blockers: run.validation?.blockers.length || 0, warnings: run.validation?.warnings.length || 0 },
    reminders: run.reminders.slice(0, 20).map((r) => msg(r.message)),
    artifacts: run.artifacts.map((a) => ({ title: msg(a.title), path: a.path })),
    result: run.result,
  };
}

// ── import-run ──────────────────────────────────────────────────────────────

const RUN_REF = /fau:([A-Za-z0-9_-]{1,64}):([A-Za-z0-9_-]{1,64}):([A-Za-z0-9_-]{1,64})(:trial)?/g;
export const FLOW_NOTE_TITLE = i18nKey('流程解读与复核说明');

function importRun(ctx: FauActionCtx, input: Record<string, unknown>): { imported: Array<{ runId: string; trial: boolean; path: string }>; message: string } {
  const engineText = typeof input.engine === 'string' ? input.engine : JSON.stringify(input.engine ?? '');
  const refs = [...engineText.matchAll(RUN_REF)];
  const note = stripUnresolved(typeof input.note === 'string' ? input.note : '').slice(0, 50_000);
  // 上游计算步骤缺数据被跳过：没有运行可挂，照实说明，不当失败
  if (!refs.length) return { imported: [], message: i18nT('上游没有可导入的运行（计算步骤被跳过或没有结果）') };
  if (!note) throw new Error(i18nT('没有可导入的流程说明'));
  const imported: Array<{ runId: string; trial: boolean; path: string }> = [];
  for (const [, companyId, projectId, runId, trialFlag] of refs) {
    if (imported.some((x) => x.runId === runId)) continue;
    const trial = !!trialFlag;
    const store = trial ? findTrialStore(runId) : ctx.store;
    const company = store?.getCompany(companyId);
    const project = company && store!.getProject(company.id, projectId);
    const run = project && store!.findRun(company!.id, runId, project.id);
    if (!store || !company || !project || !run) throw new FauStepError(i18nKey('找不到这次运行'));
    if (run.status !== 'ready') {
      throw new FauStepError(run.status === 'signing' || run.status === 'archived'
        ? i18nKey('这次运行已经开始签核，不能再导入流程说明') : i18nKey('这次运行还没有生成底稿，不能导入流程说明'));
    }
    const def = moduleById(run.moduleId)!;
    const loc = run.outputLocale;
    const L = (k: string, p?: Record<string, string | number>) => tIn(loc, k, p);
    const dir = run.artifacts[0] ? dirname(run.artifacts[0].path) : outputDirFor(store.settings().outputRoot || store.root(), company.name, project.name, def.code, L(def.name));
    mkdirSync(dir, { recursive: true });
    const path = join(dir, outputFileName(def.code, L(FLOW_NOTE_TITLE), project.period, 'md'));
    const md = [
      `# ${L(FLOW_NOTE_TITLE)} · ${def.code} ${L(def.name)}`,
      '',
      `> ${L(OUT.draft)} · ${L(OUT.notOpinion)}`,
      '',
      `- ${L(OUT.company)}: ${company.name}`,
      `- ${L(OUT.project)}: ${project.name}`,
      `- ${L(OUT.period)}: ${project.period}`,
      `- ${L(OUT.module)}: ${def.code} ${L(def.name)}`,
      `- ${L(OUT.preparedAt)}: ${nowIso()}`,
      '',
      note,
      '',
      '---',
      L(OUT.boundary),
      '',
    ].join('\n');
    writeFileSync(path, md, 'utf8');
    const art: FauArtifact = { id: newId('art'), kind: 'md', path, sha256: sha256File(path) || '', title: { key: FLOW_NOTE_TITLE }, locale: loc, createdAt: nowIso() };
    // 重跑流程再导入：替换上一份流程说明，不叠加
    const stale = run.artifacts.filter((a) => a.title.key === FLOW_NOTE_TITLE);
    for (const a of stale) if (a.path !== path && existsSync(a.path)) rmSync(a.path, { force: true });
    run.artifacts = [...run.artifacts.filter((a) => a.title.key !== FLOW_NOTE_TITLE), art];
    run.params = { ...run.params, workflowImport: { at: nowIso() } };
    store.saveRun(run);
    if (!trial) {
      ctx.emit({ type: 'run.state', runId: run.id });
      ctx.emit({ type: 'todo.changed' });
    }
    imported.push({ runId: run.id, trial, path });
  }
  return { imported, message: i18nT('已导入财会审计工作台，请到工作台的签核队列完成正式签核') };
}

function findTrialStore(runId: string): FinanceAuditStore | null {
  const base = accountPath('finance-audit-trial');
  if (!existsSync(base)) return null;
  for (const key of Object.keys(SAMPLES)) {
    const store = new FinanceAuditStore(() => join(base, key));
    if (!existsSync(join(base, key))) continue;
    if (store.listCompanies().some((c) => store.findRun(c.id, runId))) return store;
  }
  return null;
}
