/**
 * 解决方案 · 流程时效监控智能体（主进程）。docs/flow-sla-workbench.md
 *
 * 一条动作通道 WORKBENCH_FS_INVOKE，按 action 分发；状态变化经 WORKBENCH_FS_EVENT 推给渲染层。
 *
 *   导入：OA / 费控 / CSS 的流程表、节点表和花名册（Excel、CSV），认列后归一成流程行与节点行；
 *   核对：对不上规则的流程名（可指定细类）、没登记内外部的节点（计入 / 不计入）、不在花名册的审核人；
 *   计算：端到端用时、个人审核用时、合规率、排名、在途逾期 —— 全部由 services/flowSla/calc.ts 计算，并存一份周期快照；
 *   分析：与上一周期环比、异常流程类型、节点分析、本年度在途超时；
 *   原因：按责任人出收集邮件（人点发送）、回填、归类（规则或模型，模型只归类和写话，不算数）；
 *   通报：周报邮件、月度分析报告 PDF、明细表；预览后由人点发送；月报发送时把改善建议记入台账；
 *   跟进：异常在途流程按内部 3 天 / 外部 7 天提醒；改善台账到期前提醒、逾期升级。
 */
import { app, dialog, ipcMain, Notification, shell, type BrowserWindow } from 'electron';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  FS_REASON_CATEGORIES, FS_SYSTEMS, IPC_CHANNELS,
  type FsBoardFilters, type FsBoardView, type FsCalcView, type FsCase, type FsCheckView, type FsCompareView, type FsIngestRequest, type FsLedgerItem, type FsLedgerStatus,
  type FsMailStatus, type FsOwnerMail, type FsPeriod, type FsReasonCategory, type FsReportPreview, type FsRulesView, type FsSettings, type FsSlot, type FsSnapshotMeta,
  type FsState, type FsSuggestion, type FsSystem, type FsTablePreview, type FsThresholds,
} from '@totalclaw/ipc-contracts';
import { t as i18nT } from '@totalclaw/i18n';
import type { WorkbenchIpcDeps } from './workbenchApi';
import { userFacingError } from '../utils/userFacingError';
import { onAppWillQuit } from '../util/quitRegistry';
import { createWorkbenchLlm } from '../services/workbenchLlm';
import { readTable, safeFileName, writeWorkbook } from '../services/serviceSettlement/excel';
import {
  analyzeNodes, compareWithPrevious, computeSla, toSnapshot, yearOverdueRunning,
  type CalcOptions, type FlowRow, type FlowStatus, type NodeRow, type PeriodSnapshot, type SlaResult, type SlaRules,
} from '../services/flowSla/calc';
import {
  REGULAR, aliasKey, applyAliases, effectiveRules, ingestAll, makePeriod, missingRoles, previewTable, sanitizeThresholds, thresholdsOf, ymd,
  type RosterRow,
} from '../services/flowSla/ingest';
import { DEFAULT_RULES, FlowSlaStore, emptySession, newId, type FsSnapshotData } from '../services/flowSla/store';
import { parseRulesWorkbook } from '../services/flowSla/rulesImport';
import { writeDemo } from '../services/flowSla/demoData';
import {
  acceptModelClassification, buildCases, categoryLabel, classifyByRule, defaultRootCause, ownerMails, readReasonRows, reasonSheet,
} from '../services/flowSla/reasons';
import {
  acceptModelSummary, buildFacts, detailSheets, monthlyMailText, monthlyReportHtml, overallDelta, reportSubject, ruleSuggestions, ruleSummary, weeklyMail,
  type ReportContext,
} from '../services/flowSla/report';
import { FlowSlaProc, ledgerStatus, nextFollowAt, syncTracking } from '../services/flowSla/proc';
import * as P from '../services/flowSla/prompts';
import { documentsFolderName } from '../services/brandPaths';

const store = new FlowSlaStore();
let proc: FlowSlaProc | null = null;

interface Computed { period: FsPeriod; rules: SlaRules; opt: CalcOptions; flows: FlowRow[]; nodes: NodeRow[]; roster: RosterRow[]; result: SlaResult }

function requireFound<T>(v: T | undefined | null, what: string): T {
  if (v == null) throw new Error(i18nT('{p0}不存在或已删除', { p0: what }));
  return v;
}

function runCompute(data: { flows: FlowRow[]; nodes: NodeRow[]; roster: RosterRow[] }, rules: SlaRules, opt: CalcOptions, aliases: Record<string, string>): SlaResult {
  const { flows, original } = applyAliases(data.flows, aliases);
  const result = computeSla(flows, data.nodes, rules, opt);
  // 结果里仍显示报表原来的流程名
  for (const f of result.flows) { const o = original.get(`${f.system}|${f.flowNo}`); if (o) f.flowName = o; }
  return result;
}

export function registerFlowSlaHandlers(deps: WorkbenchIpcDeps): () => void {
  const logger = deps.logger;
  const win = (): BrowserWindow | null => deps.getMainWindow?.() ?? null;
  const broadcast = (event: { type: string; payload?: unknown }): void => { try { win()?.webContents.send(IPC_CHANNELS.WORKBENCH_FS_EVENT, event); } catch { /* 窗口已关 */ } };
  const pushState = (): void => broadcast({ type: 'state' });
  const nowIso = (): string => new Date().toISOString();

  const { llmJson } = createWorkbenchLlm(deps, { logTag: 'flow-sla', moduleModel: () => '' });

  const outputRoot = (): string => {
    const s = store.read().settings;
    return s.outputDir && existsSync(s.outputDir) ? s.outputDir : join(app.getPath('documents'), documentsFolderName(), i18nT('流程时效监控'));
  };
  const outputDir = (sub?: string): string => {
    const dir = sub ? join(outputRoot(), safeFileName(sub)) : outputRoot();
    mkdirSync(dir, { recursive: true });
    return dir;
  };
  const stamp = (d = new Date()): string => `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}-${String(d.getHours()).padStart(2, '0')}${String(d.getMinutes()).padStart(2, '0')}`;

  const sendMail = async (input: { to: string[]; subject: string; body: string; attachments?: { filename: string; path: string }[] }) => {
    const { sendCaseMail } = await import('../services/caseMailSender');
    const relay = deps.serviceAuth
      ? { send: (i: Parameters<NonNullable<typeof deps.serviceAuth>['relaySendMail']>[0]) => deps.serviceAuth!.relaySendMail(i) }
      : null;
    return sendCaseMail((deps.readEmailCredentials?.() ?? {}) as any, input, relay);
  };
  const mailStatus = (): FsMailStatus => {
    const c = deps.readEmailCredentials?.() ?? {};
    return { address: c.EMAIL_ADDRESS || '', smtpConfigured: Boolean(c.EMAIL_ADDRESS && c.EMAIL_PASSWORD && c.EMAIL_SMTP_HOST), officialRelay: Boolean(deps.serviceAuth) };
  };
  const senderName = (): string => { const c = deps.readEmailCredentials?.() ?? {}; return c.EMAIL_SENDER_NAME || ''; };

  const thresholds = (): FsThresholds => sanitizeThresholds(store.read().thresholds, thresholdsOf(store.baseRules()));

  proc = new FlowSlaProc({
    store,
    remindDays: () => thresholds().improveRemindDays,
    broadcast,
    notify: (title, body) => { if (Notification.isSupported()) new Notification({ title, body: body.slice(0, 200) }).show(); },
    logger: { info: (m, c) => logger?.info?.('flow-sla', m, c as any), warn: (m, c) => logger?.warn?.('flow-sla', m, c as any) },
  });
  proc.start();
  const stopBackground = () => proc?.stop();
  onAppWillQuit('flow-sla', stopBackground, { once: true });

  // ── 计算 ──
  const compute = (): Computed => {
    const s = store.read();
    const data = store.data();
    if (!data.flows.length) throw new Error(i18nT('还没有导入报表，请先完成第 1 步'));
    const period = requireFound(s.session.period, i18nT('统计周期'));
    const rules = effectiveRules(store.baseRules(), { thresholds: s.thresholds, decisions: s.nodeDecisions, roster: data.roster });
    const opt: CalcOptions = {
      now: Math.min(period.asOf, Date.now()), periodStart: period.start, periodEnd: period.end,
      holidays: s.settings.holidays, extraWorkdays: s.settings.extraWorkdays,
      roster: data.roster.length ? data.roster.map((r) => r.name) : undefined,
      rosterDept: Object.fromEntries(data.roster.filter((r) => r.dept).map((r) => [r.name, r.dept])),
      unknownNodePolicy: 'exclude',
    };
    return { period, rules, opt, flows: data.flows, nodes: data.nodes, roster: data.roster, result: runCompute(data, rules, opt, s.aliases) };
  };

  const snapshotId = (p: FsPeriod): string => `${p.kind}-${ymd(p.start)}-${ymd(p.end)}`;
  const asPeriodSnapshot = (m: FsSnapshotMeta): PeriodSnapshot => ({ label: m.label, periodStart: m.periodStart, periodEnd: m.periodEnd, overall: m.overall, byType: m.byType });
  /** 默认的上一周期：同类周期里结束时间不晚于本期开始的最近一个 */
  const previousOf = (period: FsPeriod, pickedId?: string): { prev: FsSnapshotMeta | null; candidates: FsSnapshotMeta[] } => {
    const curId = snapshotId(period);
    const candidates = store.read().snapshots.filter((x) => x.kind === period.kind && x.id !== curId);
    const picked = pickedId ? candidates.find((x) => x.id === pickedId) : undefined;
    return { prev: picked ?? candidates.find((x) => x.periodEnd <= period.start) ?? null, candidates };
  };

  const calcView = (c: Computed): FsCalcView => {
    const r = c.result;
    return {
      period: c.period, snapshotId: snapshotId(c.period), overall: r.overall, byCategory: r.byCategory, byType: r.byType,
      reviewerRank: r.reviewerRank, initiatorRank: r.initiatorRank, runningByInitiator: r.runningByInitiator,
      overtime: r.flows.filter((f) => f.status === 'done' && f.inPeriod && f.overtime === true).sort((a, b) => b.overdueDays - a.overdueDays),
      runningAbnormal: r.flows.filter((f) => f.status === 'running' && (f.runningLabel === 'overdue' || f.runningLabel === 'risk')).sort((a, b) => b.overdueDays - a.overdueDays || b.days - a.days),
      approxCount: r.flows.filter((f) => f.approx).length,
      noLimitCount: r.flows.filter((f) => f.limitDays === null && (f.status === 'running' || f.inPeriod)).length,
    };
  };

  const compareView = (c: Computed, prevId?: string): FsCompareView => {
    const { prev, candidates } = previousOf(c.period, prevId);
    const types = compareWithPrevious(c.result, prev ? asPeriodSnapshot(prev) : null, c.rules);
    const abnormal = types.filter((t) => t.abnormal).map((t) => ({ ...t, analysis: analyzeNodes(t.flowType, t.system, c.result, c.nodes, c.rules, c.opt) }));
    const current: FsSnapshotMeta = { id: snapshotId(c.period), kind: c.period.kind, savedAt: nowIso(), ...toSnapshot(c.period.label, c.opt, c.result) };
    return {
      current, previous: prev, candidates, delta: overallDelta(c.result.overall, prev?.overall), types, abnormal,
      yearOverdue: c.period.kind === 'monthly' ? yearOverdueRunning(c.result, c.opt.now) : [],
    };
  };

  const reportContext = (c: Computed): ReportContext => {
    const s = store.read();
    const cmp = compareView(c, s.session.prevSnapshotId || undefined);
    const curId = snapshotId(c.period);
    const history = s.snapshots.filter((x) => x.kind === c.period.kind && x.id !== curId && x.periodEnd <= c.period.start).slice(0, 11).reverse();
    return {
      period: c.period, result: c.result, previous: cmp.previous ? asPeriodSnapshot(cmp.previous) : null, delta: cmp.delta, compare: cmp.types, abnormal: cmp.abnormal,
      yearOverdue: cmp.yearOverdue, cases: s.session.cases, rootCauses: s.session.rootCauses, summary: s.session.summary, suggestions: s.session.suggestions,
      thresholds: thresholdsOf(c.rules),
      trend: [...history.map((h) => ({ label: h.label, complianceRate: h.overall.complianceRate, avgDays: h.overall.avgDays })), { label: c.period.label, complianceRate: c.result.overall.complianceRate, avgDays: c.result.overall.avgDays }],
      generatedAt: Date.now(),
    };
  };

  const publicState = (): FsState => {
    const s = store.read();
    const base = store.baseRules();
    const now = Date.now();
    return {
      settings: s.settings, outputDir: outputRoot(), session: s.session, snapshots: s.snapshots,
      tracking: s.tracking, ledger: s.ledger.map((l) => ({ ...l, status: ledgerStatus(l, now) })), reminders: s.reminders.slice(0, 50), mail: mailStatus(),
      rules: { version: base.version, custom: !!store.customRules(), counts: { e2e: base.e2e.length, cssNodes: base.cssNodes.length, oaFkNodes: base.oaFkNodes.length, personal: base.personal.length, managers: base.managers.length } },
      thresholds: thresholds(), hasData: store.data().flows.length > 0,
    };
  };

  const caseOf = (key: string): FsCase => requireFound(store.read().session.cases.find((x) => x.key === key), i18nT('流程'));
  const periodDir = (): string => outputDir(store.read().session.period?.label.replace(/\s*~\s*/g, '_') || i18nT('未命名周期'));

  /** 导入或换周期后，后面几步的产物全部作废 */
  const resetDownstream = (keepCases: boolean): void => {
    store.update((s) => {
      const old = s.session;
      s.session = { ...emptySession(), period: old.period, ingest: old.ingest, cases: keepCases ? old.cases : [] };
    });
  };

  const commitIngest = (req: FsIngestRequest): { summary: FsState['session']['ingest']; period: FsPeriod } => {
    const p = req.period;
    if (!p || !(p.end > p.start)) throw new Error(i18nT('统计周期的结束日期必须晚于开始日期'));
    const period = makePeriod(p.kind === 'monthly' ? 'monthly' : 'weekly', p.start, p.end, Math.min(Number(p.asOf) || Date.now(), Date.now()));
    const r = ingestAll({ systems: req.systems || {}, roster: req.roster });
    store.setData({ flows: r.flows, nodes: r.nodes, roster: r.roster });
    store.update((s) => { s.session = { ...emptySession(), period, ingest: r.summary }; });
    pushState();
    return { summary: r.summary, period };
  };

  const applyReasons = (list: Array<{ key: string; reason: string }>): number => {
    let n = 0;
    store.update((s) => {
      for (const it of list) {
        const c = s.session.cases.find((x) => x.key === it.key);
        if (!c) continue;
        c.reason = it.reason;
        if (c.classifiedBy !== 'manual') { c.categoryId = it.reason.trim() ? classifyByRule(it.reason) : ''; c.classifiedBy = it.reason.trim() ? 'rule' : ''; }
        n += 1;
      }
    });
    return n;
  };

  const writeLedgerFromSuggestions = (list: FsSuggestion[], source: string): number => {
    const now = nowIso();
    let n = 0;
    store.update((s) => {
      for (const sg of list) {
        if (!sg.item.trim()) continue;
        s.ledger.unshift({
          id: newId('fsl'), item: sg.item.trim(), dept: sg.dept || '', owner: sg.owner || '', requirement: sg.requirement || '', deadline: /^\d{4}-\d{2}-\d{2}$/.test(sg.deadline) ? sg.deadline : '',
          acceptance: sg.acceptance || '', status: 'doing', escalated: false, source, progress: [{ at: now, text: i18nT('由「{p0}」的改善建议记入', { p0: source }) }],
          createdAt: now, updatedAt: now, remindedFor: '', escalatedFor: '',
        });
        n += 1;
      }
      s.session.ledgerWritten = true;
    });
    return n;
  };

  const actions: Record<string, (p: any) => unknown> = {
    'state.get': () => publicState(),
    'settings.patch': (p: { patch: Partial<FsSettings> }) => {
      const patch = p?.patch || {};
      store.update((s) => {
        if (patch.outputDir !== undefined) s.settings.outputDir = String(patch.outputDir || '');
        if (patch.weeklyRecipients !== undefined) s.settings.weeklyRecipients = String(patch.weeklyRecipients || '').slice(0, 4000);
        if (patch.monthlyRecipients !== undefined) s.settings.monthlyRecipients = String(patch.monthlyRecipients || '').slice(0, 4000);
      });
      pushState();
      return store.read().settings;
    },
    'files.pick': async (p: { multi?: boolean }) => {
      const r = await dialog.showOpenDialog(win()!, { properties: p?.multi ? ['openFile', 'multiSelections'] : ['openFile'], filters: [{ name: 'Excel', extensions: ['xlsx', 'xls', 'xlsm', 'csv'] }] });
      return r.canceled ? [] : r.filePaths;
    },
    'dirs.pick': async () => {
      const r = await dialog.showOpenDialog(win()!, { properties: ['openDirectory', 'createDirectory'] });
      return r.canceled ? '' : r.filePaths[0] || '';
    },
    'path.open': async (p: { path: string; reveal?: boolean }) => {
      if (!p?.path || !existsSync(p.path)) throw new Error(i18nT('文件不存在'));
      if (p.reveal) { shell.showItemInFolder(p.path); return true; }
      const err = await shell.openPath(p.path);
      if (err) throw new Error(err);
      return true;
    },

    // ── 第 1 步 导入 ──
    'ingest.preview': (p: { path: string; slot: FsSlot; sheet?: string; hasFlowTable?: boolean }): FsTablePreview & { missing: string[] } => {
      if (!p?.path || !existsSync(p.path)) throw new Error(i18nT('文件不存在'));
      const slot: FsSlot = p.slot === 'node' || p.slot === 'roster' ? p.slot : 'flow';
      const t = previewTable(p.path, slot, p.sheet);
      return { ...t, missing: missingRoles(slot, t.mapping, { hasFlowTable: !!p.hasFlowTable }) };
    },
    'ingest.commit': (p: FsIngestRequest) => commitIngest(p),
    /** 生成一套示例报表写到输出目录并直接载入 */
    'demo.generate': (p: { period: FsPeriod }) => {
      const files = writeDemo(outputDir(), store.baseRules(), Date.now());
      const spec = (path: string, slot: FsSlot) => ({ path, mapping: previewTable(path, slot).mapping });
      const systems: FsIngestRequest['systems'] = {};
      const names: FsSystem[] = FS_SYSTEMS;
      systems[names[0]] = { flow: spec(files.oaFlow, 'flow'), node: spec(files.oaNode, 'node') };
      systems[names[1]] = { flow: spec(files.fkFlow, 'flow'), node: spec(files.fkNode, 'node') };
      systems[names[2]] = { flow: spec(files.css, 'flow') };
      const r = commitIngest({ period: p.period, systems, roster: spec(files.roster, 'roster') });
      return { ...r, dir: files.dir, files };
    },

    // ── 第 2 步 核对 ──
    'check.run': (): FsCheckView => {
      const c = compute();
      const s = store.read();
      return {
        counts: s.session.ingest?.systems ?? [],
        unmatched: c.result.unmatchedTypes.map((u) => ({ ...u, regular: s.aliases[aliasKey(u.system, u.flowName)] === REGULAR })),
        unknownNodes: c.result.unknownNodes,
        outOfRoster: c.result.outOfRoster,
        rosterCount: c.roster.length,
        ruleTypes: c.rules.e2e.filter((r) => !r.fallback).map((r) => ({ system: r.system, category: r.category, flowType: r.flowType })),
        aliases: Object.entries(s.aliases).map(([k, target]) => ({ system: k.split('|')[0] as FsSystem, flowName: s.aliasNames[k] || k.split('|').slice(1).join('|'), target })),
        decisions: s.nodeDecisions,
      };
    },
    /** 把一个流程名对到规则细类；target 传空 = 取消，传 REGULAR = 确认它就是常规流程 */
    'alias.set': (p: { system: FsSystem; flowName: string; target: string }) => {
      const k = aliasKey(p.system, p.flowName);
      const target = String(p.target || '');
      if (target && target !== REGULAR && !store.baseRules().e2e.some((r) => r.flowType === target)) throw new Error(i18nT('规则表里没有这个流程细类：{p0}', { p0: target }));
      store.update((s) => { if (target) { s.aliases[k] = target; s.aliasNames[k] = p.flowName; } else { delete s.aliases[k]; delete s.aliasNames[k]; } });
      resetDownstream(true);
      pushState();
      return true;
    },
    /** 给没登记内外部的节点定性；internal 传 null = 取消 */
    'node.decide': (p: { system: FsSystem; flowName: string; node: string; internal: boolean | null }) => {
      store.update((s) => {
        s.nodeDecisions = s.nodeDecisions.filter((d) => !(d.system === p.system && d.flowName === p.flowName && d.node === p.node));
        if (p.internal !== null && p.internal !== undefined) s.nodeDecisions.push({ system: p.system, flowName: p.flowName, node: p.node, internal: !!p.internal });
      });
      resetDownstream(true);
      pushState();
      return true;
    },

    // ── 第 3 步 计算 ──
    'calc.run': (): FsCalcView & { tracking: { added: number; closed: number } } => {
      const c = compute();
      const s = store.read();
      const meta: FsSnapshotMeta = { id: snapshotId(c.period), kind: c.period.kind, savedAt: nowIso(), ...toSnapshot(c.period.label, c.opt, c.result) };
      const data: FsSnapshotData = { flows: c.flows, nodes: c.nodes, roster: c.roster, options: c.opt, rules: c.rules, aliases: { ...s.aliases } };
      store.saveSnapshot(meta, data);
      const statusByKey = new Map<string, FlowStatus>(c.flows.map((f) => [`${f.system}|${f.flowNo}`, f.status]));
      const sync = syncTracking(s.tracking, { result: c.result, statusByKey, roster: c.roster, rules: c.rules, nowMs: Date.now() });
      store.update((st) => {
        st.tracking = sync.items;
        st.session.snapshotId = meta.id;
        st.session.cases = buildCases(c.result, c.roster, st.session.cases);
      });
      pushState();
      return { ...calcView(c), tracking: { added: sync.added, closed: sync.closed } };
    },
    'calc.view': (): FsCalcView => calcView(compute()),
    'calc.export': () => {
      const c = compute();
      const file = join(periodDir(), `${i18nT('流程时效明细')}-${stamp()}.xlsx`);
      writeWorkbook(file, detailSheets(reportContext(c)));
      return file;
    },
    'snapshot.remove': (p: { id: string }) => { store.removeSnapshot(String(p?.id || '')); pushState(); return true; },

    // ── 第 4 步 环比与异常 ──
    'compare.run': (p: { prevId?: string }): FsCompareView => {
      const c = compute();
      const view = compareView(c, p?.prevId);
      store.update((s) => { s.session.prevSnapshotId = view.previous?.id || ''; });
      return view;
    },

    // ── 第 5 步 原因 ──
    'cases.get': (): { cases: FsCase[]; mails: FsOwnerMail[] } => {
      const s = store.read();
      const period = requireFound(s.session.period, i18nT('统计周期'));
      return { cases: s.session.cases, mails: ownerMails(s.session.cases, period, senderName()) };
    },
    'cases.setEmail': (p: { owner: string; email: string }) => {
      const email = String(p?.email || '').trim();
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error(i18nT('邮箱格式不对：{p0}', { p0: email }));
      store.update((s) => { for (const c of s.session.cases) if (c.owner === p.owner) c.ownerEmail = email; });
      return true;
    },
    'reasons.set': (p: { key: string; reason?: string; categoryId?: FsReasonCategory | '' }) => {
      caseOf(p.key);
      if (p.reason !== undefined) applyReasons([{ key: p.key, reason: String(p.reason).slice(0, 500) }]);
      if (p.categoryId !== undefined) {
        if (p.categoryId && !FS_REASON_CATEGORIES.includes(p.categoryId)) throw new Error(i18nT('原因类别不在名单里'));
        store.update((s) => { const c = s.session.cases.find((x) => x.key === p.key)!; c.categoryId = p.categoryId!; c.classifiedBy = p.categoryId ? 'manual' : ''; });
      }
      return store.read().session.cases;
    },
    'reasons.export': () => {
      const cases = store.read().session.cases;
      if (!cases.length) throw new Error(i18nT('没有需要收集原因的流程'));
      const file = join(periodDir(), `${i18nT('超时原因收集表')}-${stamp()}.xlsx`);
      writeWorkbook(file, [reasonSheet(cases)]);
      return file;
    },
    'reasons.import': (p: { path: string }) => {
      if (!p?.path || !existsSync(p.path)) throw new Error(i18nT('文件不存在'));
      const t = readTable(p.path);
      const r = readReasonRows(t.headers, t.rows, store.read().session.cases);
      if (r.noColumn) throw new Error(i18nT('这张表里没有找到「单号」和「超时原因」两列'));
      const n = applyReasons(r.filled);
      return { filled: n, unmatched: r.unmatched, cases: store.read().session.cases };
    },
    /** 给选中的责任人各发一封原因收集邮件（由人点击触发）；没有邮箱的跳过并列出来 */
    'reasons.send': async (p: { owners: string[] }) => {
      const s = store.read();
      const period = requireFound(s.session.period, i18nT('统计周期'));
      const mails = ownerMails(s.session.cases, period, senderName()).filter((m) => (p?.owners || []).includes(m.owner));
      if (!mails.length) throw new Error(i18nT('请先勾选要发送的责任人'));
      const sent: string[] = []; const skipped: string[] = []; const failed: Array<{ owner: string; message: string }> = [];
      const dir = join(periodDir(), i18nT('原因收集'));
      mkdirSync(dir, { recursive: true });
      for (const m of mails) {
        if (!m.email) { skipped.push(m.owner); continue; }
        const file = join(dir, `${i18nT('超时原因收集表')}-${safeFileName(m.owner)}.xlsx`);
        writeWorkbook(file, [reasonSheet(s.session.cases.filter((c) => c.owner === m.owner))]);
        const r = await sendMail({ to: [m.email], subject: m.subject, body: m.body, attachments: [{ filename: `${i18nT('超时原因收集表')}.xlsx`, path: file }] });
        if (r.ok) { sent.push(m.owner); store.update((st) => { for (const c of st.session.cases) if (c.owner === m.owner) c.mailedAt = nowIso(); }); }
        else failed.push({ owner: m.owner, message: r.message || i18nT('发送失败') });
      }
      pushState();
      return { sent, skipped, failed };
    },
    /** 归类：先按关键字；useModel 时再让模型归类并写根因说明，通不过核对的保留关键字结果 */
    'reasons.classify': async (p: { useModel?: boolean }) => {
      const withReason = store.read().session.cases.filter((c) => c.reason.trim());
      if (!withReason.length) throw new Error(i18nT('还没有任何流程填了超时原因'));
      store.update((s) => {
        for (const c of s.session.cases) {
          if (!c.reason.trim()) { c.categoryId = ''; c.classifiedBy = ''; continue; }
          if (c.classifiedBy !== 'manual') { c.categoryId = classifyByRule(c.reason); c.classifiedBy = 'rule'; }
        }
      });
      let by: 'rule' | 'model' = 'rule'; let modelError = ''; let rejected = 0;
      let rootCauses: Partial<Record<FsReasonCategory, string>> = {};
      if (p?.useModel) {
        try {
          const { json } = await llmJson('reasons', P.reasonClassifyPrompt(withReason), 120_000);
          const out = acceptModelClassification(json, withReason);
          rejected = out.rejected;
          rootCauses = out.rootCauses;
          if (Object.keys(out.categories).length) {
            by = 'model';
            store.update((s) => { for (const c of s.session.cases) { const cat = out.categories[c.key]; if (cat && c.classifiedBy !== 'manual') { c.categoryId = cat; c.classifiedBy = 'model'; } } });
          }
        } catch (e) { modelError = userFacingError(e); }
      }
      store.update((s) => {
        const used = new Set(s.session.cases.filter((c) => c.reason.trim() && c.categoryId).map((c) => c.categoryId as FsReasonCategory));
        const next: Partial<Record<FsReasonCategory, string>> = {};
        for (const id of used) next[id] = rootCauses[id] || defaultRootCause(id);
        s.session.rootCauses = next;
      });
      const s = store.read().session;
      return { by, modelError, rejected, cases: s.cases, rootCauses: s.rootCauses, labels: Object.fromEntries(FS_REASON_CATEGORIES.map((id) => [id, categoryLabel(id)])) };
    },
    'rootCause.set': (p: { id: FsReasonCategory; text: string }) => {
      if (!FS_REASON_CATEGORIES.includes(p?.id)) throw new Error(i18nT('原因类别不在名单里'));
      store.update((s) => { s.session.rootCauses[p.id] = String(p.text || '').slice(0, 600); });
      return store.read().session.rootCauses;
    },

    // ── 第 6 步 通报 ──
    /** 起草总结与改善建议：默认规则写；useModel 时让模型写，通不过数字核对就退回规则版 */
    'summary.draft': async (p: { useModel?: boolean }) => {
      const ctx = reportContext(compute());
      let summary = ruleSummary(ctx); let suggestions = ruleSuggestions(ctx);
      let by: 'rule' | 'model' = 'rule'; let modelError = ''; let dropped = 0;
      if (p?.useModel) {
        try {
          const depts = [...new Set(ctx.result.flows.map((f) => f.dept).filter(Boolean))];
          const people = [...new Set([...ctx.cases.map((c) => c.owner), ...ctx.result.reviewerRank.map((r) => r.name)].filter(Boolean))];
          const { json } = await llmJson('summary', P.summaryPrompt(ctx.period.kind, buildFacts(ctx), { depts, people }), 180_000);
          const out = acceptModelSummary(json, ctx);
          dropped = out.dropped;
          if (out.usedModel) {
            by = 'model'; summary = out.summary;
            suggestions = out.suggestions.map((sg) => ({ ...sg, dept: depts.includes(sg.dept) ? sg.dept : '', owner: people.includes(sg.owner) ? sg.owner : '' }));
          }
        } catch (e) { modelError = userFacingError(e); }
      }
      store.update((s) => { s.session.summary = summary; s.session.suggestions = suggestions; s.session.summaryBy = by; });
      return { summary, suggestions, by, modelError, dropped };
    },
    'summary.save': (p: { summary: string; suggestions: FsSuggestion[] }) => {
      const clean = (Array.isArray(p?.suggestions) ? p.suggestions : []).slice(0, 30).map((x) => ({
        item: String(x?.item || '').slice(0, 300), dept: String(x?.dept || '').slice(0, 60), owner: String(x?.owner || '').slice(0, 60),
        requirement: String(x?.requirement || '').slice(0, 500), deadline: /^\d{4}-\d{2}-\d{2}$/.test(String(x?.deadline || '')) ? String(x.deadline) : '', acceptance: String(x?.acceptance || '').slice(0, 300),
      })).filter((x) => x.item.trim());
      store.update((s) => { s.session.summary = String(p?.summary || '').slice(0, 8000); s.session.suggestions = clean; s.session.summaryBy = 'manual'; });
      return store.read().session;
    },
    /** 生成通报文件并返回预览：周报 = 网页版 + 明细表；月报 = 分析报告 PDF + 明细表 */
    'report.build': async (): Promise<FsReportPreview> => {
      const c = compute();
      const ctx = reportContext(c);
      const dir = periodDir();
      const subject = reportSubject(ctx);
      const base = safeFileName(subject);
      const xlsx = join(dir, `${base}-${i18nT('明细')}.xlsx`);
      writeWorkbook(xlsx, detailSheets(ctx));
      let preview: FsReportPreview;
      if (c.period.kind === 'monthly') {
        const html = monthlyReportHtml(ctx);
        const pdf = join(dir, `${base}.pdf`);
        const { renderHtmlToPdf } = await import('../services/charityContent/render');
        await renderHtmlToPdf(html, pdf);
        preview = { kind: 'monthly', subject, text: monthlyMailText(ctx), html, files: [{ name: `${base}.pdf`, path: pdf }, { name: `${base}-${i18nT('明细')}.xlsx`, path: xlsx }] };
      } else {
        const m = weeklyMail(ctx);
        const htmlFile = join(dir, `${base}.html`);
        writeFileSync(htmlFile, m.html, 'utf-8');
        preview = { kind: 'weekly', subject, text: m.text, html: m.html, files: [{ name: `${base}.html`, path: htmlFile }, { name: `${base}-${i18nT('明细')}.xlsx`, path: xlsx }] };
      }
      store.update((s) => { s.session.reportFiles = preview.files.map((f) => f.path); });
      return preview;
    },
    /** 发送通报（由人点击触发）。月报发出后把改善建议记入改善台账 */
    'report.send': async (p: { to: string; subject: string; text: string }) => {
      const s = store.read();
      const period = requireFound(s.session.period, i18nT('统计周期'));
      const files = s.session.reportFiles.filter((f) => existsSync(f));
      if (!files.length) throw new Error(i18nT('请先生成通报并预览'));
      const { parseRecipients } = await import('../services/caseMailSender');
      const rcpt = parseRecipients(String(p?.to || ''));
      if (rcpt.invalid.length) throw new Error(i18nT('这些收件人地址不对：{p0}', { p0: rcpt.invalid.join('、') }));
      if (!rcpt.list.length) throw new Error(i18nT('请填写收件人'));
      store.update((st) => { if (period.kind === 'monthly') st.settings.monthlyRecipients = String(p.to); else st.settings.weeklyRecipients = String(p.to); });
      const r = await sendMail({
        to: rcpt.list, subject: String(p.subject || '').trim() || i18nT('线上流程时效达成情况通报'), body: String(p.text || ''),
        attachments: files.map((f) => ({ filename: f.split(/[\\/]/).pop() || 'attachment', path: f })),
      });
      if (!r.ok) throw new Error(r.message || i18nT('发送失败'));
      let ledgerAdded = 0;
      if (period.kind === 'monthly' && !store.read().session.ledgerWritten) ledgerAdded = writeLedgerFromSuggestions(store.read().session.suggestions, i18nT('{p0} 月度通报', { p0: period.label }));
      store.update((st) => { st.session.sentAt = nowIso(); });
      pushState();
      return { ok: true, via: r.via || 'self', notice: r.notice || '', recipients: rcpt.list.length, ledgerAdded };
    },
    /** 不发邮件，只把改善建议记入台账（月报） */
    'report.toLedger': () => {
      const s = store.read();
      if (s.session.ledgerWritten) throw new Error(i18nT('这一期的改善建议已经记入台账'));
      if (!s.session.suggestions.length) throw new Error(i18nT('没有改善建议'));
      const n = writeLedgerFromSuggestions(s.session.suggestions, i18nT('{p0} 月度通报', { p0: s.session.period?.label || '' }));
      pushState();
      return n;
    },

    // ── 时效看板 ──
    'board.get': (p: FsBoardFilters): FsBoardView => {
      const s = store.read();
      const metas = s.snapshots;
      const snapshot = (p?.snapshotId ? metas.find((x) => x.id === p.snapshotId) : undefined) ?? metas[0] ?? null;
      const trend = [...metas].reverse().map((m) => ({ id: m.id, kind: m.kind, label: m.label, periodEnd: m.periodEnd, complianceRate: m.overall.complianceRate, avgDays: m.overall.avgDays, doneCount: m.overall.doneCount }));
      const empty: FsBoardView = { snapshot, trend, overall: null, byCategory: [], byType: [], reviewerRank: [], flows: [], flowTotal: 0, options: { systems: [], categories: [], flowTypes: [], depts: [] } };
      const data = snapshot ? store.snapshotData(snapshot.id) : null;
      if (!snapshot || !data) return empty;
      const full = runCompute(data, data.rules, data.options, data.aliases);
      const shown = full.flows.filter((f) => f.status === 'running' || f.inPeriod);
      const uniq = (list: string[]): string[] => [...new Set(list.filter(Boolean))].sort((a, b) => a.localeCompare(b, 'zh'));
      const options = { systems: uniq(shown.map((f) => f.system)), categories: uniq(shown.map((f) => f.category)), flowTypes: uniq(shown.filter((f) => !p?.category || f.category === p.category).map((f) => f.flowType)), depts: uniq(shown.map((f) => f.dept)) };
      const narrow = !!(p?.category || p?.flowType || p?.dept);
      let res = full;
      if (p?.system || narrow) {
        const keep = new Set(full.flows.filter((f) => (!p.system || f.system === p.system) && (!p.category || f.category === p.category) && (!p.flowType || f.flowType === p.flowType) && (!p.dept || f.dept === p.dept)).map((f) => `${f.system}|${f.flowNo}`));
        const flows = data.flows.filter((f) => keep.has(`${f.system}|${f.flowNo}`));
        // 只按系统筛时，处理人维度里别的中心发起的流程节点也留着；按大类 / 细类 / 部门筛时只留这些流程自己的节点
        const nodes = data.nodes.filter((n) => (narrow ? keep.has(`${n.system}|${n.flowNo}`) : n.system === p.system));
        res = runCompute({ flows, nodes, roster: data.roster }, data.rules, data.options, data.aliases);
      }
      const flows = res.flows.filter((f) => f.status === 'running' || f.inPeriod)
        .sort((a, b) => Number(b.runningLabel === 'overdue' || b.overtime === true) - Number(a.runningLabel === 'overdue' || a.overtime === true) || b.overdueDays - a.overdueDays || b.days - a.days);
      return { snapshot, trend, overall: res.overall, byCategory: res.byCategory, byType: res.byType, reviewerRank: res.reviewerRank, flows: flows.slice(0, 500), flowTotal: flows.length, options };
    },

    // ── 在途跟进 ──
    'track.note': (p: { key: string; text: string }) => {
      const text = String(p?.text || '').trim();
      if (!text) throw new Error(i18nT('请填写进展'));
      store.update((s) => {
        const t = requireFound(s.tracking.find((x) => x.key === p.key && !x.closedAt), i18nT('跟进条目'));
        const now = Date.now();
        t.notes.push({ at: new Date(now).toISOString(), text: text.slice(0, 500), kind: 'note' });
        t.lastFollowAt = new Date(now).toISOString();
        t.nextFollowAt = nextFollowAt(now, t.intervalDays);
      });
      pushState();
      return true;
    },
    'track.setEmail': (p: { key: string; email: string }) => {
      const email = String(p?.email || '').trim();
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error(i18nT('邮箱格式不对：{p0}', { p0: email }));
      store.update((s) => { requireFound(s.tracking.find((x) => x.key === p.key), i18nT('跟进条目')).handlerEmail = email; });
      pushState();
      return true;
    },
    'track.mailPreview': (p: { key: string }) => {
      const t = requireFound(store.read().tracking.find((x) => x.key === p.key && !x.closedAt), i18nT('跟进条目'));
      return {
        to: t.handlerEmail,
        subject: i18nT('【流程时效】请更新在途流程的处理进度：{p0}', { p0: t.flowNo }),
        body: [
          i18nT('{p0}，你好：', { p0: t.handler || i18nT('同事') }),
          '',
          i18nT('[{p0}] {p1} {p2}{p3} 目前在途 {p4} 天，时效要求 {p5} 天，已超出 {p6} 天，停在「{p7}」。', { p0: t.system, p1: t.flowNo, p2: t.flowName, p3: t.title ? `（${t.title}）` : '', p4: t.days, p5: t.limitDays ?? '-', p6: t.overdueDays, p7: t.currentNode || '-' }),
          i18nT('请回复目前的处理进度、卡住的原因和预计办结时间。'),
          ...(senderName() ? ['', senderName()] : []),
        ].join('\n'),
      };
    },
    /** 给处理人发一封进度提醒（由人点击触发），并顺延下次跟进时间 */
    'track.remind': async (p: { key: string; subject: string; body: string }) => {
      const t = requireFound(store.read().tracking.find((x) => x.key === p.key && !x.closedAt), i18nT('跟进条目'));
      if (!t.handlerEmail) throw new Error(i18nT('这位处理人没有邮箱，请先补上'));
      const r = await sendMail({ to: [t.handlerEmail], subject: String(p.subject || ''), body: String(p.body || '') });
      if (!r.ok) throw new Error(r.message || i18nT('发送失败'));
      store.update((s) => {
        const cur = s.tracking.find((x) => x.key === p.key && !x.closedAt);
        if (!cur) return;
        const now = Date.now();
        cur.notes.push({ at: new Date(now).toISOString(), text: i18nT('已发提醒邮件给 {p0}', { p0: cur.handler || cur.handlerEmail }), kind: 'mail' });
        cur.lastFollowAt = new Date(now).toISOString();
        cur.nextFollowAt = nextFollowAt(now, cur.intervalDays);
      });
      pushState();
      return { ok: true, via: r.via || 'self' };
    },
    'track.close': (p: { key: string; reason?: string }) => {
      store.update((s) => {
        const t = requireFound(s.tracking.find((x) => x.key === p.key && !x.closedAt), i18nT('跟进条目'));
        t.closedAt = nowIso();
        t.closeReason = String(p?.reason || '').trim().slice(0, 200) || i18nT('手工闭环');
        t.notes.push({ at: t.closedAt, text: t.closeReason, kind: 'system' });
      });
      pushState();
      return true;
    },
    'reminders.check': async () => (await proc?.tick())?.length ?? 0,
    'reminders.clear': () => { store.update((s) => { s.reminders = []; }); pushState(); return true; },

    // ── 改善台账 ──
    'ledger.save': (p: { item: Partial<FsLedgerItem> }) => {
      const it = p?.item || {};
      const item = String(it.item || '').trim();
      if (!item) throw new Error(i18nT('请填写改善事项'));
      const deadline = String(it.deadline || '').trim();
      if (deadline && !/^\d{4}-\d{2}-\d{2}$/.test(deadline)) throw new Error(i18nT('执行期限请写成 2026-10-31 这样的日期'));
      const status: FsLedgerStatus | undefined = it.status === 'done' || it.status === 'archived' || it.status === 'doing' ? it.status : undefined;
      const now = nowIso();
      const saved = store.update((s) => {
        let cur = it.id ? s.ledger.find((x) => x.id === it.id) : undefined;
        if (!cur) {
          cur = { id: newId('fsl'), item, dept: '', owner: '', requirement: '', deadline: '', acceptance: '', status: 'doing', escalated: false, source: i18nT('手工登记'), progress: [], createdAt: now, updatedAt: now, remindedFor: '', escalatedFor: '' };
          s.ledger.unshift(cur);
        }
        cur.item = item.slice(0, 300);
        if (it.dept !== undefined) cur.dept = String(it.dept || '').slice(0, 60);
        if (it.owner !== undefined) cur.owner = String(it.owner || '').slice(0, 60);
        if (it.requirement !== undefined) cur.requirement = String(it.requirement || '').slice(0, 500);
        if (it.acceptance !== undefined) cur.acceptance = String(it.acceptance || '').slice(0, 300);
        if (it.deadline !== undefined) cur.deadline = deadline;
        if (status && status !== cur.status) {
          cur.progress.push({ at: now, text: i18nT('状态改为：{p0}', { p0: status === 'done' ? i18nT('已完成') : status === 'archived' ? i18nT('已归档') : i18nT('进行中') }) });
          cur.status = status;
          if (status !== 'doing') cur.escalated = false;
        }
        cur.status = ledgerStatus(cur, Date.now());
        if (cur.status === 'doing') cur.escalated = false;
        cur.updatedAt = now;
        return cur;
      });
      pushState();
      return saved;
    },
    'ledger.progress': (p: { id: string; text: string }) => {
      const text = String(p?.text || '').trim();
      if (!text) throw new Error(i18nT('请填写进展'));
      store.update((s) => { const cur = requireFound(s.ledger.find((x) => x.id === p.id), i18nT('改善事项')); cur.progress.push({ at: nowIso(), text: text.slice(0, 500) }); cur.updatedAt = nowIso(); });
      pushState();
      return true;
    },
    'ledger.remove': (p: { id: string }) => { store.update((s) => { s.ledger = s.ledger.filter((x) => x.id !== p?.id); }); pushState(); return true; },
    'ledger.export': () => {
      const list = store.read().ledger;
      if (!list.length) throw new Error(i18nT('台账还是空的'));
      const now = Date.now();
      const label = (st: FsLedgerStatus): string => ({ doing: i18nT('进行中'), done: i18nT('已完成'), overdue: i18nT('逾期'), archived: i18nT('已归档') }[st]);
      const file = join(outputDir(i18nT('改善台账')), `${i18nT('流程时效改善台账')}-${stamp()}.xlsx`);
      writeWorkbook(file, [{
        name: i18nT('改善台账'),
        headers: [i18nT('改善事项'), i18nT('责任部门'), i18nT('责任人'), i18nT('执行要求'), i18nT('执行期限'), i18nT('验收要求'), i18nT('状态'), i18nT('是否升级督办'), i18nT('来源'), i18nT('登记时间'), i18nT('进展记录')],
        rows: list.map((l) => [l.item, l.dept, l.owner, l.requirement, l.deadline, l.acceptance, label(ledgerStatus(l, now)), l.escalated ? i18nT('是') : i18nT('否'), l.source, l.createdAt.slice(0, 10), l.progress.map((x) => `${x.at.slice(0, 10)} ${x.text}`).join('\n')]),
      }]);
      return file;
    },

    // ── 规则 ──
    'rules.get': (): FsRulesView => {
      const base = store.baseRules();
      const s = store.read();
      return { version: base.version, custom: !!store.customRules(), e2e: base.e2e, cssNodes: base.cssNodes, oaFkNodes: base.oaFkNodes, personal: base.personal, managers: base.managers, thresholds: thresholds(), holidays: s.settings.holidays, extraWorkdays: s.settings.extraWorkdays };
    },
    /** 导入更新后的《时效看板指标》工作簿，整体替换五张规则表 */
    'rules.import': (p: { path: string }) => {
      if (!p?.path || !existsSync(p.path)) throw new Error(i18nT('文件不存在'));
      const r = parseRulesWorkbook(p.path, DEFAULT_RULES);
      store.setCustomRules(r.rules);
      resetDownstream(true);
      pushState();
      return { warnings: r.warnings, counts: { e2e: r.rules.e2e.length, cssNodes: r.rules.cssNodes.length, oaFkNodes: r.rules.oaFkNodes.length, personal: r.rules.personal.length, managers: r.rules.managers.length } };
    },
    'rules.reset': () => { store.setCustomRules(null); resetDownstream(true); pushState(); return true; },
    'rules.thresholds': (p: { patch: Partial<FsThresholds> | null }) => {
      store.update((s) => { s.thresholds = p?.patch ? sanitizeThresholds({ ...s.thresholds, ...p.patch }, thresholdsOf(store.baseRules())) : {}; });
      resetDownstream(true);
      pushState();
      return thresholds();
    },
    'calendar.save': (p: { holidays: string[]; extraWorkdays: string[] }) => {
      const clean = (v: unknown): string[] => [...new Set((Array.isArray(v) ? v : []).map((x) => String(x).trim()).filter(Boolean))].sort();
      const all = [...clean(p?.holidays), ...clean(p?.extraWorkdays)];
      const bad = all.filter((d) => !/^\d{4}-\d{2}-\d{2}$/.test(d) || Number.isNaN(new Date(`${d}T00:00:00`).getTime()));
      if (bad.length) throw new Error(i18nT('这些日期写得不对（应为 2026-10-01 这样）：{p0}', { p0: bad.slice(0, 5).join('、') }));
      store.update((s) => { s.settings.holidays = clean(p?.holidays); s.settings.extraWorkdays = clean(p?.extraWorkdays); });
      resetDownstream(true);
      pushState();
      return true;
    },
  };

  ipcMain.handle(IPC_CHANNELS.WORKBENCH_FS_INVOKE, async (_e, req: { action: string; payload?: unknown }) => {
    const fn = actions[String(req?.action || '')];
    if (!fn) throw new Error(i18nT('未知操作：{p0}', { p0: String(req?.action || '') }));
    try {
      return await fn(req.payload ?? {});
    } catch (error) {
      logger?.warn?.('flow-sla', `${req.action} failed`, { error: (error as Error)?.message });
      throw new Error(userFacingError(error));
    }
  });
  // 卸载 / 停用时由方案入口 deactivate 调用（宿主只撤 IPC 通道，后台任务要自己停）
  return stopBackground;
}
