/**
 * 财会审计 · audit 分组的模块特有 action（批次 3：B1–B6 + P4 质检入口），action 名用「<模块 id>.」前缀。
 *
 * 唯一的对外动作是函证发送，做成受保护的例外（第 9.1 节）：只发各级签核归档后的函证，
 * 先 ext-audit.confirm.prepareSend 出预览并签发一次性令牌，界面在确认框里由人点确认后 ext-audit.confirm.send 核销令牌才发；
 * 没有令牌、过期、重复、换了运行一律拒绝，邮件发送不会被调用（boundary.test 守卫）。
 */
import { dialog } from 'electron';
import { existsSync, mkdirSync, statSync, writeFileSync } from 'node:fs';
import { basename, dirname, extname, join } from 'node:path';
import { i18nKey, tIn } from '@totalclaw/i18n';
import { FAU_COMPENSATING, FAU_IMPACT_LEVELS, FAU_LOCALES, type FauIcfrResult, type FauLocale, type FauQcReport, type FauQcScope, type FauRun } from '@totalclaw/ipc-contracts';
import { audit } from '../../services/audit';
import { isSmtpConfigured, sendCaseMail } from '../../services/caseMailSender';
import { readPptx, writePptx } from '../../services/pptxEditor';
import { FauStepError } from '../../services/financeAudit/skillRunner';
import { thresholdsFor } from '../../services/financeAudit/thresholds';
import { writeWorkbookFile } from '../../services/financeAudit/outputs/xlsx';
import { outputDirFor, outputFileName } from '../../services/financeAudit/outputs/common';
import { levelsWith } from '../../services/financeAudit/runner';
import { moduleById } from '../../../shared/financeAudit/catalog';
import { computeDeficiency, computeTesting, icfrReminders } from '../../services/financeAudit/engines/audit/icfrRunner';
import { SLOT_TABLE, templateHeaders } from '../../services/financeAudit/engines/audit/table';
import { SendGuard } from '../../services/financeAudit/engines/audit/extAudit/sendGuard';
import { previewOf, sendConfirmed, sendableItems } from '../../services/financeAudit/engines/audit/extAudit/send';
import { appendSent, readSent } from '../../services/financeAudit/engines/audit/extAudit/sentLog';
import { auditWorkbook, readWorkbookForAudit } from '../../services/financeAudit/engines/audit/review/xlsAudit';
import { checkDeck, planRefresh, type RefreshMapping } from '../../services/financeAudit/engines/audit/office/deck';
import { writeQcReport } from '../../services/financeAudit/engines/audit/office/report';
import type { ActionTable, FauActionCtx } from './context';

const str = (v: unknown, max: number): string => String(v ?? '').trim().slice(0, max);
const bad = (key: string, params?: Record<string, string | number>) => new FauStepError(key, params);

/** 各模块允许在第 ④ 步改的运行参数（白名单 + 类型） */
const PARAMS: Record<string, Record<string, 'number' | 'date' | 'text' | 'dates'>> = {
  icfr: { seed: 'number' },
  'internal-audit': { availableDays: 'number', area: 'text', asOf: 'date' },
  'ext-audit': { materiality: 'number', asOf: 'date' },
  review: {},
  fraud: { holidays: 'dates' },
  kyc: { asOf: 'date' },
};

function cleanParams(moduleId: string, input: unknown): Record<string, unknown> {
  const spec = PARAMS[moduleId] || {};
  const out: Record<string, unknown> = {};
  for (const [k, type] of Object.entries(spec)) {
    const v = (input as Record<string, unknown> | null)?.[k];
    if (v === undefined) continue;
    if (type === 'number' && typeof v === 'number' && Number.isFinite(v) && v >= 0 && v < 1e13) out[k] = v;
    else if (type === 'date' && typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v)) out[k] = v;
    else if (type === 'text' && typeof v === 'string') out[k] = v.slice(0, 200);
    else if (type === 'dates' && Array.isArray(v)) out[k] = v.map(String).filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d)).slice(0, 100);
  }
  return out;
}

export function auditActions(ctx: FauActionCtx): ActionTable {
  const { store, runs } = ctx;
  const guard = new SendGuard();

  const loadRun = (runId: unknown, moduleId: string) => {
    const company = ctx.currentCompany();
    const run = store.findRun(company.id, String(runId || ''), store.settings().currentProjectId);
    if (!run || run.moduleId !== moduleId) throw bad(i18nKey('找不到这次运行'));
    const project = store.getProject(company.id, run.projectId);
    if (!project) throw bad(i18nKey('找不到项目'));
    return { run, company, project };
  };
  const editable = (run: FauRun) => {
    if (['signing', 'archived', 'void'].includes(run.status)) throw bad(i18nKey('已经开始签核，不能再改；请复核人退回后再改'));
  };

  /** B1 重算：测试结论 / 缺陷属性改了之后，只重算并重出文件，不重跑模型 */
  async function recomputeIcfr(runId: unknown, patch: (params: Record<string, unknown>) => Record<string, unknown>) {
    // 上一次改动触发的重出文件还在跑：等它跑完再读，免得两边各存一份把对方的改动覆盖掉
    await runs.wait(String(runId || ''));
    const { run, company, project } = loadRun(runId, 'icfr');
    editable(run);
    if (!run.result) throw bad(i18nKey('先完成第 4 步的计算'));
    run.params = patch({ ...run.params });
    const src = {
      runId: run.id, params: run.params, th: thresholdsFor('icfr', company.thresholds),
      datasets: (slot: string) => store.datasetMetas(company.id, project.id).filter((m) => (run.inputs[slot] || []).includes(m.id)),
    };
    const res: FauIcfrResult = run.modeId === 'testing' ? computeTesting(src) : computeDeficiency(src);
    const { reminders, approveRequired } = icfrReminders(res);
    run.result = res;
    run.reminders = [...run.reminders.filter((r) => !r.id.startsWith('icfr:')), ...reminders];
    run.requiredLevels = levelsWith(moduleById('icfr')!.signoff.levels, approveRequired);
    // 第 ④ 步摘要跟着重算（与 icfrRunner.analyze 同一句）
    run.steps.analyze = {
      ...run.steps.analyze,
      summary: run.modeId === 'testing'
        ? { key: i18nKey('关键控制 {n} 个，样本 {m} 个，缺陷 {d} 个'), params: { n: res.plans.length, m: res.samples.length, d: res.deficiencies.length } }
        : { key: i18nKey('缺陷 {n} 个，其中重大 {a} 个、重要 {b} 个'), params: { n: res.deficiencies.length, a: res.counts.material_weakness, b: res.counts.significant } },
    };
    store.saveRun(run);
    if (run.steps.draft.status === 'done') await runs.redraft(run, company, project);
    ctx.emit({ type: 'todo.changed' });
    return store.findRun(company.id, run.id, project.id);
  }

  const outDir = (code: string, name: string, loc: FauLocale) => {
    const { company, project } = ctx.current();
    return outputDirFor(store.settings().outputRoot || store.root(), company.name, project.name, code, tIn(loc, name));
  };
  const localeOf = (v: unknown): FauLocale => (FAU_LOCALES.includes(v as FauLocale) ? v as FauLocale : ctx.currentCompany().outputLocale);
  const fileOk = (p: unknown, exts: string[]): string => {
    const path = String(p || '');
    if (!path || !existsSync(path) || !statSync(path).isFile()) throw bad(i18nKey('文件不存在：{p0}'), { p0: path });
    if (!exts.includes(extname(path).toLowerCase())) throw bad(i18nKey('不支持的文件类型：{p0}'), { p0: basename(path) });
    return path;
  };

  return {
    // ── B1 内控 ──
    'icfr.sample.update': (p: { runId: string; controlId: string; row: number; result: string; note?: string }) => recomputeIcfr(p?.runId, (params) => {
      const key = `${str(p?.controlId, 40).toUpperCase()}#${Math.floor(Number(p?.row) || 0)}`;
      const results = { ...((params.sampleResults || {}) as Record<string, unknown>) };
      if (p?.result === 'pending') delete results[key];
      else if (p?.result === 'pass' || p?.result === 'fail') results[key] = { result: p.result, note: str(p?.note, 300) || undefined };
      else throw bad(i18nKey('测试结论只能是通过、不通过或待测试'));
      return { ...params, sampleResults: results };
    }),
    'icfr.deficiency.update': (p: { runId: string; id: string; opImpact?: string; compensating?: string; owner?: string; dueDate?: string; remediation?: string }) => recomputeIcfr(p?.runId, (params) => {
      const id = str(p?.id, 60).toUpperCase();
      if (!id) throw bad(i18nKey('没有这一项'));
      const cur = ((params.deficiencyEdits || {}) as Record<string, Record<string, string>>)[id] || {};
      const next: Record<string, string> = { ...cur };
      if (p?.opImpact !== undefined) { if (!FAU_IMPACT_LEVELS.includes(p.opImpact as never)) throw bad(i18nKey('运营影响只能是高、中、低')); next.opImpact = p.opImpact; }
      if (p?.compensating !== undefined) { if (!FAU_COMPENSATING.includes(p.compensating as never)) throw bad(i18nKey('补偿性控制只能是有效、部分有效或无')); next.compensating = p.compensating; }
      if (p?.owner !== undefined) next.owner = str(p.owner, 60);
      if (p?.dueDate !== undefined) next.dueDate = /^\d{4}-\d{2}-\d{2}$/.test(String(p.dueDate)) ? String(p.dueDate) : '';
      if (p?.remediation !== undefined) next.remediation = str(p.remediation, 500);
      return { ...params, deficiencyEdits: { ...((params.deficiencyEdits || {}) as object), [id]: next } };
    }),

    // ── 通用：改运行参数后从第 ③ 步重跑；下载表格模板 ──
    'audit.params.set': async (p: { runId: string; moduleId: string; params: Record<string, unknown> }) => {
      const moduleId = str(p?.moduleId, 40);
      if (!(moduleId in PARAMS)) throw bad(i18nKey('未知模块：{p0}'), { p0: moduleId });
      const { run, company, project } = loadRun(p?.runId, moduleId);
      editable(run);
      run.params = { ...run.params, ...cleanParams(moduleId, p?.params) };
      store.saveRun(run);
      if (run.steps.validate.status === 'todo') return run;
      return runs.start(run, company, project, 'validate');
    },
    'audit.template': (p: { moduleId: string; slot: string; locale?: string }) => {
      const def = moduleById(str(p?.moduleId, 40));
      const table = def ? SLOT_TABLE[def.id]?.[str(p?.slot, 40)] : undefined;
      const input = def?.inputs.find((i) => i.id === p?.slot);
      if (!def || !table || !input) throw bad(i18nKey('这份数据没有模板'));
      const loc = localeOf(p?.locale);
      const dir = join(outDir(def.code, def.name, loc), 'templates');
      const path = join(dir, `${def.code}-${tIn(loc, input.label)}-${tIn(loc, i18nKey('模板'))}.xlsx`.replace(/[\\/:*?"<>|]/g, '_'));
      writeWorkbookFile(path, [{ name: tIn(loc, input.label), headers: templateHeaders(table), rows: [] }, { name: tIn(loc, i18nKey('填写说明')), rows: [[tIn(loc, input.help)]] }], { rtl: loc === 'ar' });
      return { path };
    },

    // ── B3 函证：人点发送 + 确认框（受保护的例外） ──
    'ext-audit.confirm.sentLog': (p: { runId: string }) => {
      const { run, company, project } = loadRun(p?.runId, 'ext-audit');
      return readSent(store, company.id, project.id, run.id);
    },
    'ext-audit.confirm.prepareSend': (p: { runId: string; ids?: string[] }) => {
      const { run, company, project } = loadRun(p?.runId, 'ext-audit');
      const ids = Array.isArray(p?.ids) ? p.ids.map((x) => str(x, 40).toUpperCase()).filter(Boolean) : undefined;
      const { items, blocked } = sendableItems(run, store.readSignoffs(company.id, project.id), store.archiveDir(company.id, project.id, run.id), readSent(store, company.id, project.id, run.id), company.name, ids);
      const creds = ctx.deps.readEmailCredentials?.() ?? null;
      const via = isSmtpConfigured(creds as never) ? 'self' : ctx.deps.serviceAuth ? 'official' : 'none';
      return previewOf(guard, run, via === 'none' ? [] : items, via === 'none' ? [...blocked, { key: i18nKey('未配置发信邮箱，请先到设置里的邮件通道配置') }] : blocked, via);
    },
    'ext-audit.confirm.send': async (p: { runId: string; token: string }) => {
      const { run, company, project } = loadRun(p?.runId, 'ext-audit');
      const { items } = sendableItems(run, store.readSignoffs(company.id, project.id), store.archiveDir(company.id, project.id, run.id), readSent(store, company.id, project.id, run.id), company.name);
      const relay = ctx.deps.serviceAuth ? { send: (i: Parameters<NonNullable<typeof ctx.deps.serviceAuth>['relaySendMail']>[0]) => ctx.deps.serviceAuth!.relaySendMail(i) } : null;
      const from = String((ctx.deps.readEmailCredentials?.() as { EMAIL_ADDRESS?: string } | undefined)?.EMAIL_ADDRESS || '');
      let recs;
      try {
        recs = await sendConfirmed(guard, p?.token, run, items, async (it) => {
          const r = await sendCaseMail((ctx.deps.readEmailCredentials?.() ?? {}) as never, {
            to: [it.email], subject: it.subject, body: it.body, attachments: [{ filename: basename(it.attachment), path: it.attachment }],
            headers: from ? { 'Disposition-Notification-To': from } : undefined,
          }, relay);
          return { ok: r.ok, message: r.message, via: r.via };
        });
      } catch (e) {
        if ((e as { code?: string })?.code === 'not_confirmed') throw bad(i18nKey('发送没有经过确认或确认已过期，请重新点「发送」并在确认框里确认'));
        throw e;
      }
      appendSent(store, company.id, project.id, run.id, recs);
      for (const r of recs) {
        try { audit({ actor: 'user', action: 'finance-audit.confirmation.send', result: r.ok ? 'ok' : 'fail', subject: `${run.id}/${r.id}`, reason: r.message || '' }); } catch { /* 审计日志失败不挡：发送记录已落盘 */ }
      }
      ctx.emit({ type: 'todo.changed' });
      return recs;
    },

    // ── P4 办公产出与质检（独立入口，不走七步、不签核） ──
    'office-output.pick': async (p: { kind?: string }) => {
      const filters = p?.kind === 'pptx' ? [{ name: 'PowerPoint', extensions: ['pptx'] }] : [{ name: 'Excel', extensions: ['xlsx', 'xlsm', 'xls'] }];
      const w = ctx.win();
      const r = w ? await dialog.showOpenDialog(w, { properties: ['openFile'], filters }) : await dialog.showOpenDialog({ properties: ['openFile'], filters });
      return { paths: r.canceled ? [] : r.filePaths };
    },
    'office-output.inspect': (p: { path: string }) => {
      const path = fileOk(p?.path, ['.xlsx', '.xlsm', '.xls', '.pptx']);
      if (extname(path).toLowerCase() === '.pptx') return { kind: 'pptx', file: basename(path), slides: readPptx(path).slides.length };
      return { kind: 'xlsx', file: basename(path), sheets: readWorkbookForAudit(path).SheetNames };
    },
    'office-output.check': (p: { path: string; scope?: string; sheet?: string; range?: string; locale?: string }): FauQcReport => {
      const path = fileOk(p?.path, ['.xlsx', '.xlsm', '.xls', '.pptx']);
      const loc = localeOf(p?.locale);
      const file = basename(path);
      const def = moduleById('office-output')!;
      let report: Omit<FauQcReport, 'reportPath'>;
      if (extname(path).toLowerCase() === '.pptx') {
        const findings = checkDeck(readPptx(path), file);
        report = { kind: 'pptx', file, findings, counts: { critical: 0, important: 0, minor: 0 } };
      } else {
        const scope: FauQcScope = ['selection', 'sheet', 'model'].includes(String(p?.scope)) ? p!.scope as FauQcScope : 'model';
        if (scope === 'selection' && !/^[A-Z]{1,3}\d+:[A-Z]{1,3}\d+$/i.test(String(p?.range || ''))) throw bad(i18nKey('选区格式应为 B3:F20'));
        const r = auditWorkbook(readWorkbookForAudit(path), file, { scope, sheet: str(p?.sheet, 100) || undefined, range: String(p?.range || '').toUpperCase() || undefined });
        report = { kind: 'xlsx', file, scope, findings: r.findings.map((f) => ({ id: f.id, location: `${f.sheet}!${f.cell}`, rule: f.rule, severity: f.severity, detail: [f.formula ? `=${f.formula}` : '', f.detail || ''].filter(Boolean).join(' · ') })), counts: { critical: 0, important: 0, minor: 0 } };
      }
      for (const f of report.findings) report.counts[f.severity] += 1;
      return { ...report, reportPath: writeQcReport(outDir(def.code, def.name, loc), loc, report) };
    },
    'office-output.refreshPlan': (p: { path: string; mapping: RefreshMapping[] }) => {
      const path = fileOk(p?.path, ['.pptx']);
      const mapping = (Array.isArray(p?.mapping) ? p.mapping : []).slice(0, 100).map((m) => ({ from: str(m?.from, 60), to: str(m?.to, 60) })).filter((m) => m.from && m.to);
      if (!mapping.length) throw bad(i18nKey('请至少填一组「旧值 → 新值」'));
      const plan = planRefresh(readPptx(path), mapping);
      return { file: basename(path), changes: plan.changes, flagged: plan.flagged };
    },
    /** 人看过计划、点了确认才执行；另存新文件，原文件不动 */
    'office-output.refreshApply': (p: { path: string; mapping: RefreshMapping[]; confirmed?: boolean; locale?: string }) => {
      if (p?.confirmed !== true) throw bad(i18nKey('请先确认刷新计划'));
      const path = fileOk(p?.path, ['.pptx']);
      const mapping = (Array.isArray(p?.mapping) ? p.mapping : []).slice(0, 100).map((m) => ({ from: str(m?.from, 60), to: str(m?.to, 60) })).filter((m) => m.from && m.to);
      const plan = planRefresh(readPptx(path), mapping);
      if (!plan.patches.length) throw bad(i18nKey('没有找到要替换的数字'));
      const loc = localeOf(p?.locale);
      const def = moduleById('office-output')!;
      const out = join(outDir(def.code, def.name, loc), outputFileName('P4', `${basename(path, '.pptx')}-${tIn(loc, i18nKey('刷新'))}`, new Date().toISOString().slice(0, 10), 'pptx'));
      mkdirSync(dirname(out), { recursive: true });
      writeFileSync(out, writePptx(path, plan.patches));
      return { path: out, changes: plan.changes.length, flagged: plan.flagged.length };
    },
  };
}
