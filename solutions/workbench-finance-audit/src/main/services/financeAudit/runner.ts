/**
 * 运行编排（第 5.4 节统一七步）：① 选项目与模式 → ② 上传 → ③ 校验 → ④ 分析 / 计算 → ⑤ 生成底稿 → ⑥ 签核 → ⑦ 归档与转交。
 *
 * ③④⑤ 由各分组的 ModuleRunner 实现（engines/<group>/index.ts 的注册表），这里只管：
 *   每步独立状态（startedAt / progressAt / 子进度）、失败落在具体那一步、可取消、重试前先取消旧任务、
 *   有阻断项停在第 ③ 步、升级规则把批准级加进 requiredLevels、提醒项汇总给签核。
 * 进程重启后 running 的步骤由 store.markInterrupted() 标「已中断」。
 */
import { i18nKey, t as i18nT } from '@totalclaw/i18n';
import type {
  FauArtifact, FauCompany, FauConfidence, FauDatasetMeta, FauEvent, FauLocale, FauModuleDef, FauOpenItem, FauProject, FauReminder, FauRun,
  FauSignLevel, FauStepKey, FauStepState, FauSubProgress, FauValidationReport, FauVerificationItem, FauMsg,
} from '@totalclaw/ipc-contracts';
import { FAU_STEP_KEYS } from '@totalclaw/ipc-contracts';
import { inputsForMode, moduleById } from '../../../shared/financeAudit/catalog';
import { resolveProfile, type FauResolvedProfile } from '../../../shared/financeAudit/regions';
import { FinanceAuditStore, emptySteps, newId, nowIso } from './store';
import { thresholdVersion, thresholdsFor } from './thresholds';
import { FauStepError, type LlmFn } from './skillRunner';
import type { DatasetRowsByKind, ParsedKind } from './types';

export interface RunCtx {
  run: FauRun;
  def: FauModuleDef;
  company: FauCompany;
  project: FauProject;
  profile: FauResolvedProfile;
  locale: FauLocale;
  signal: AbortSignal;
  llm: LlmFn;
  store: FinanceAuditStore;
  /** 槽位下的全部数据集行（多份拼接） */
  rows<K extends ParsedKind>(slot: string): DatasetRowsByKind[K];
  datasets(slot: string): FauDatasetMeta[];
  th(module: string): Record<string, number>;
  /** 本项目里转交给本模块的未结事项（第 4.3 节） */
  openItems(): FauOpenItem[];
  /** 本模块在上一期项目链里的历史运行（连续 N 个月同方向未达等用） */
  history(): FauRun[];
  outputDir(): string;
  progress(subId: string, status: FauSubProgress['status'], summary?: FauMsg): void;
}

export interface AnalyzeResult {
  result: unknown;
  verification?: FauVerificationItem[];
  reminders?: FauReminder[];
  /** 升级条件命中：强制批准级 */
  approveRequired?: boolean;
  summary?: FauMsg;
  model?: string;
}

export interface ModuleRunner {
  subSteps(modeId: string): FauSubProgress[];
  validate(ctx: RunCtx): Promise<FauValidationReport>;
  analyze(ctx: RunCtx): Promise<AnalyzeResult>;
  draft(ctx: RunCtx): Promise<{ artifacts: FauArtifact[]; summary?: FauMsg }>;
}

export interface RunManagerDeps {
  store: FinanceAuditStore;
  runners: Record<string, ModuleRunner>;
  llm: LlmFn;
  emit: (ev: FauEvent) => void;
  /** 产出目录（<产出根>/<公司>/<项目>/<模块码>-<模块名>） */
  outputDirFor: (run: FauRun, company: FauCompany, project: FauProject, def: FauModuleDef) => string;
  openItemsFor: (run: FauRun, company: FauCompany, project: FauProject) => FauOpenItem[];
  logger?: { warn?: (source: string, message: string, data?: Record<string, any>) => void; info?: (source: string, message: string, data?: Record<string, any>) => void };
}

const ESTIMATE: Partial<Record<FauStepKey, { sec: number; kind: FauStepState['kind'] }>> = {
  validate: { sec: 10, kind: 'scan' },
  analyze: { sec: 90, kind: 'llm' },
  draft: { sec: 15, kind: 'generic' },
};

export function errorMsg(e: unknown): FauMsg {
  if (e instanceof FauStepError) return { key: e.key, params: e.params };
  const m = (e as Error)?.message || String(e);
  return { key: i18nKey('出错：{p0}'), params: { p0: m.slice(0, 300) } };
}

export class RunManager {
  private aborts = new Map<string, AbortController>();
  private running = new Map<string, Promise<void>>();

  constructor(private readonly d: RunManagerDeps) {}

  private def(moduleId: string): FauModuleDef {
    const def = moduleById(moduleId);
    if (!def) throw new FauStepError(i18nKey('未知模块：{p0}'), { p0: moduleId });
    return def;
  }

  create(company: FauCompany, project: FauProject, input: { moduleId: string; modeId: string; outputLocale?: FauLocale; params?: Record<string, unknown> }): FauRun {
    const def = this.def(input.moduleId);
    if (def.status !== 'ready') throw new FauStepError(i18nKey('这个模块即将上线'));
    if (!this.d.runners[def.id]) throw new FauStepError(i18nKey('这个模块在工作台首页使用，不走七步流程'));
    if (!def.modes.some((m) => m.id === input.modeId)) throw new FauStepError(i18nKey('这个模块没有「{p0}」模式'), { p0: input.modeId });
    if (project.status === 'archived') throw new FauStepError(i18nKey('项目已归档，只读；请新建项目'));
    const steps = emptySteps();
    steps.setup = { status: 'done', finishedAt: Date.now() };
    const run: FauRun = {
      id: newId('run'), projectId: project.id, companyId: company.id, moduleId: def.id, modeId: input.modeId,
      outputLocale: input.outputLocale || company.outputLocale, params: input.params || {}, inputs: {},
      status: 'draft', steps, verification: [], reminders: [], requiredLevels: [...def.signoff.levels], artifacts: [], rulesUsed: [],
      createdAt: nowIso(), updatedAt: nowIso(),
    };
    return this.d.store.saveRun(run);
  }

  /** 第 ② 步：挂上数据集；必需项齐了才算完成 */
  setInputs(run: FauRun, inputs: Record<string, string[]>, params?: Record<string, unknown>): FauRun {
    this.assertEditable(run);
    const def = this.def(run.moduleId);
    const slots = inputsForMode(def, run.modeId);
    const metas = this.d.store.datasetMetas(run.companyId, run.projectId);
    const clean: Record<string, string[]> = {};
    for (const s of slots) {
      const ids = (inputs[s.id] || []).filter((id) => metas.some((m) => m.id === id && m.kind === s.kind));
      if (ids.length) clean[s.id] = s.multi ? ids : ids.slice(0, 1);
    }
    run.inputs = clean;
    if (params) run.params = { ...run.params, ...params };
    const missing = slots.filter((s) => s.needed && !clean[s.id]?.length);
    run.steps.upload = missing.length
      ? { status: 'todo', summary: { key: i18nKey('还缺：{p0}'), params: { p0: missing.map((m) => i18nT(m.label)).join(i18nT('、')) } } }
      : { status: 'done', finishedAt: Date.now(), summary: { key: i18nKey('已选 {n} 份数据'), params: { n: Object.values(clean).flat().length } } };
    this.resetFrom(run, 'validate');
    return this.d.store.saveRun(run);
  }

  missingInputs(run: FauRun): string[] {
    const def = this.def(run.moduleId);
    return inputsForMode(def, run.modeId).filter((s) => s.needed && !run.inputs[s.id]?.length).map((s) => s.label);
  }

  private assertEditable(run: FauRun): void {
    if (run.status === 'archived' || run.status === 'void') throw new FauStepError(i18nKey('这次运行已归档或作废，只读'));
    if (run.status === 'signing') throw new FauStepError(i18nKey('已经开始签核，不能再改；请复核人退回后再改'));
  }

  private resetFrom(run: FauRun, from: FauStepKey): void {
    const idx = FAU_STEP_KEYS.indexOf(from);
    for (const k of FAU_STEP_KEYS.slice(idx)) {
      if (k === 'setup' || k === 'upload') continue;
      run.steps[k] = { status: 'todo' };
    }
    if (idx <= FAU_STEP_KEYS.indexOf('draft')) run.artifacts = [];
    if (idx <= FAU_STEP_KEYS.indexOf('analyze')) { run.result = undefined; run.verification = []; }
    if (idx <= FAU_STEP_KEYS.indexOf('validate')) run.validation = undefined;
  }

  /** 被退回：从退回意见指向的那一步起打回待执行（第 5.4 节第 ⑥ 步），数据与已选输入保留 */
  markReturned(run: FauRun, toStep: FauStepKey): void {
    this.resetFrom(run, (['validate', 'analyze', 'draft'] as FauStepKey[]).includes(toStep) ? toStep : 'analyze');
    run.status = 'returned';
  }

  isRunning(runId: string): boolean {
    return this.running.has(runId);
  }

  /** 从第 ③ 步（或 fromStep）开始跑到第 ⑤ 步；立即返回，进度经事件推送 */
  async start(run: FauRun, company: FauCompany, project: FauProject, fromStep: FauStepKey = 'validate'): Promise<FauRun> {
    this.assertEditable(run);
    if (this.running.has(run.id)) await this.cancel(run.id);
    const missing = this.missingInputs(run);
    if (missing.length) throw new FauStepError(i18nKey('还缺必需的数据：{p0}'), { p0: missing.map((m) => i18nT(m)).join(i18nT('、')) });
    const from = (['validate', 'analyze', 'draft'] as FauStepKey[]).includes(fromStep) ? fromStep : 'validate';
    this.resetFrom(run, from);
    run.status = 'running';
    if (run.returned) run.returned = undefined;
    this.d.store.saveRun(run);
    const ctrl = new AbortController();
    this.aborts.set(run.id, ctrl);
    const p = this.execute(run.id, company, project, from, ctrl.signal)
      .catch((e) => this.d.logger?.warn?.('finance-audit', 'run failed', { runId: run.id, error: (e as Error)?.message }))
      .finally(() => { this.aborts.delete(run.id); this.running.delete(run.id); this.d.emit({ type: 'todo.changed' }); });
    this.running.set(run.id, p);
    return run;
  }

  /** 测试 / E2E 用：等当前这次跑完 */
  async wait(runId: string): Promise<void> {
    await this.running.get(runId);
  }

  async cancel(runId: string): Promise<void> {
    const ctrl = this.aborts.get(runId);
    if (!ctrl) return;
    ctrl.abort();
    try { await this.running.get(runId); } catch { /* 已在 execute 里落盘 */ }
  }

  private ctxFor(runId: string, company: FauCompany, project: FauProject, signal: AbortSignal): RunCtx {
    const store = this.d.store;
    const current = () => store.findRun(company.id, runId, project.id)!;
    const run = current();
    const def = this.def(run.moduleId);
    const self = this;
    return {
      get run() { return current(); },
      def, company, project, profile: resolveProfile(company), locale: run.outputLocale, signal, llm: this.d.llm, store,
      rows<K extends ParsedKind>(slot: string): DatasetRowsByKind[K] {
        const ids = current().inputs[slot] || [];
        return ids.flatMap((id) => store.dataset<any>(company.id, project.id, id)?.rows || []) as DatasetRowsByKind[K];
      },
      datasets(slot: string) {
        const ids = current().inputs[slot] || [];
        return store.datasetMetas(company.id, project.id).filter((m) => ids.includes(m.id));
      },
      th: (module: string) => thresholdsFor(module, company.thresholds),
      openItems: () => self.d.openItemsFor(current(), company, project),
      history: () => {
        const out: FauRun[] = [];
        let prevId = project.prevProjectId;
        const seen = new Set<string>();
        while (prevId && !seen.has(prevId)) {
          seen.add(prevId);
          out.push(...store.listRuns(company.id, prevId, def.id).filter((r) => r.status === 'archived'));
          prevId = store.getProject(company.id, prevId)?.prevProjectId;
        }
        return out;
      },
      outputDir: () => this.d.outputDirFor(current(), company, project, def),
      progress(subId, status, summary) {
        const r = current();
        const sub = (r.steps.analyze.sub || []).map((s) => (s.id === subId ? { ...s, status, summary: summary ?? s.summary } : s));
        r.steps.analyze = { ...r.steps.analyze, sub, progressAt: Date.now() };
        store.saveRun(r);
        self.d.emit({ type: 'run.progress', runId: r.id, step: 'analyze' });
      },
    };
  }

  private setStep(run: FauRun, step: FauStepKey, patch: Partial<FauStepState>): FauRun {
    run.steps[step] = { ...run.steps[step], ...patch };
    this.d.store.saveRun(run);
    this.d.emit({ type: 'run.progress', runId: run.id, step });
    return run;
  }

  private async execute(runId: string, company: FauCompany, project: FauProject, from: FauStepKey, signal: AbortSignal): Promise<void> {
    const store = this.d.store;
    const load = () => store.findRun(company.id, runId, project.id)!;
    let run = load();
    const runner = this.d.runners[run.moduleId];
    if (!runner) throw new FauStepError(i18nKey('这个模块即将上线'));
    const ctx = this.ctxFor(runId, company, project, signal);
    const order: FauStepKey[] = ['validate', 'analyze', 'draft'];
    for (const step of order.slice(order.indexOf(from))) {
      run = load();
      const est = ESTIMATE[step];
      this.setStep(run, step, {
        status: 'running', startedAt: Date.now(), progressAt: Date.now(), finishedAt: undefined, error: undefined, summary: undefined,
        estimateSec: est?.sec, kind: est?.kind, sub: step === 'analyze' ? runner.subSteps(run.modeId) : undefined,
      });
      try {
        if (signal.aborted) throw new FauStepError(i18nKey('已取消'));
        if (step === 'validate') {
          const report = await runner.validate(ctx);
          run = load();
          run.validation = report;
          if (report.blockers.length) {
            run.status = 'draft';
            this.setStep(run, 'validate', { status: 'blocked', finishedAt: Date.now(), error: { key: i18nKey('有 {n} 个阻断项，请按原因修正数据后重新运行'), params: { n: report.blockers.length } } });
            this.d.emit({ type: 'run.state', runId });
            return;
          }
          this.setStep(run, 'validate', { status: 'done', finishedAt: Date.now(), summary: { key: i18nKey('校验通过，提醒项 {n} 条'), params: { n: report.warnings.length } } });
        } else if (step === 'analyze') {
          const out = await runner.analyze(ctx);
          if (signal.aborted) throw new FauStepError(i18nKey('已取消'));
          run = load();
          run.result = out.result;
          run.verification = out.verification || [];
          run.model = out.model || run.model;
          run.reminders = collectReminders(run, out.reminders || []);
          run.requiredLevels = levelsWith(this.def(run.moduleId).signoff.levels, !!out.approveRequired);
          run.rulesUsed = rulesUsed(ctx);
          run.confidence = confidenceOf(run, this.def(run.moduleId));
          this.setStep(run, 'analyze', { status: 'done', finishedAt: Date.now(), summary: out.summary });
        } else {
          const out = await runner.draft(ctx);
          run = load();
          run.artifacts = out.artifacts;
          run.status = 'ready';
          this.setStep(run, 'draft', { status: 'done', finishedAt: Date.now(), summary: out.summary });
          this.setStep(run, 'signoff', { status: 'todo' });
        }
      } catch (e) {
        run = load();
        run.status = 'draft';
        this.setStep(run, step, { status: 'failed', finishedAt: Date.now(), error: errorMsg(e) });
        this.d.emit({ type: 'run.state', runId });
        return;
      }
    }
    this.d.emit({ type: 'run.state', runId });
  }

  /** ⑤ 之后只重出文件（如关账清单人工勾选后） */
  async redraft(run: FauRun, company: FauCompany, project: FauProject): Promise<FauRun> {
    return this.start(run, company, project, 'draft');
  }
}

export function levelsWith(base: FauSignLevel[], approve: boolean): FauSignLevel[] {
  const set = new Set(base);
  if (approve) set.add('approve');
  return (['prepare', 'review', 'approve'] as FauSignLevel[]).filter((l) => set.has(l));
}

/** 签核时必须逐条「已知悉」的：③ 的提醒项 + ⑤ 的未核实条目 + 引擎给的升级 / 提醒 */
export function collectReminders(run: FauRun, engine: FauReminder[]): FauReminder[] {
  const out: FauReminder[] = [];
  for (const w of run.validation?.warnings || []) out.push({ id: `v:${w.id}`, source: 'validate', level: 'warn', message: w.message });
  for (const v of run.verification) {
    if (v.status === 'unverified') out.push({ id: `u:${v.id}`, source: 'verify', level: 'warn', message: { key: i18nKey('未核实：{p0}'), params: { p0: v.text.slice(0, 120) } } });
  }
  out.push(...engine);
  const seen = new Set<string>();
  return out.filter((r) => (seen.has(r.id) ? false : (seen.add(r.id), true)));
}

function rulesUsed(ctx: RunCtx): { id: string; version: string }[] {
  const mods = [ctx.run.moduleId];
  return [
    ...mods.map((m) => ({ id: `thresholds.${m}`, version: thresholdVersion(m) })).filter((x) => x.version),
    ...ctx.profile.ruleIds.map((id) => ({ id, version: 'region-rules' })),
  ];
}

/** 数据完整度（第 ④ 步徽标的口径，按校验提醒项数）；各模块结果里另写的完整度一律取这里，不另算 */
export function dataConfidence(run: FauRun): FauConfidence['data'] {
  const warn = run.validation?.warnings.length || 0;
  return warn === 0 ? 'high' : warn <= 3 ? 'medium' : 'low';
}

function confidenceOf(run: FauRun, def: FauModuleDef): FauConfidence {
  const unverified = run.verification.filter((v) => v.status === 'unverified').length;
  const data = dataConfidence(run);
  const method = def.archetype === 'R' ? 'high' : unverified === 0 ? 'medium' : 'low';
  const rank = { high: 3, medium: 2, low: 1 } as const;
  const overall = rank[data] <= rank[method] ? data : method;
  return { data, method, overall };
}
