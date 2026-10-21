import { beginPolicyReview, confirmPolicyReview, assertPolicyReviewComplete } from '../services/serviceSettlement/policyReview';
import { onAppWillQuit } from '../util/quitRegistry';
import { readPolicyPages, validatePolicyDraft, POLICY_PROMPT } from '../services/serviceSettlement/policyExtraction';
import { rulesPdfPaths, combineRuleDocuments } from '../services/serviceSettlement/rulesPdfSources';
/**
 * 服务商结算与激励核算工作台 · 主进程 IPC。
 *
 * 四个模块（好评激励 / 结案汇总与付款跟踪 / 报废台账 / 营销激励结案）全部在本机确定性计算：
 * Excel 读写走 services/serviceSettlement/excel.ts，邮件复用 caseMailSender，收件复用 IntakeService，
 * PDF 规则抽取与季度报告两处用 runOneshotChat（纯补全），提醒由 ServiceSettlementProc 守护。
 * 渲染层只拿文件路径和结果表，不接触 SMTP/IMAP 凭据。
 */
import { app, dialog, ipcMain, type BrowserWindow } from 'electron';
import { existsSync, mkdirSync } from 'fs';
import { join, basename } from 'path';
import {
  IPC_CHANNELS,
  type SsAchievementRequest, type SsInspectTableRequest, type SsInspectTableResponse, type SsMarketingComputeRequest,
  type SsMarketingNotifyRequest, type SsPickFilesRequest, type SsReviewRunRequest, type SsReviewRatesRequest, type SsScrapAggregateRequest,
  type SsScrapMatchRequest, type SsScrapMergeRequest, type SsSendOutcome, type SsSettlementRunRequest,
  type SsSettlementSendRequest, type SsTableRef, type SsTrackUpdateRequest,
} from '@totalclaw/ipc-contracts';
import { t as i18nT } from '@totalclaw/i18n';
import { requireText, type WorkbenchIpcDeps } from './workbenchApi';
import { userFacingError } from '../utils/userFacingError';
import { ServiceSettlementStore, type ProviderContact } from '../services/serviceSettlement/store';
import { ServiceSettlementProc } from '../services/serviceSettlement/proc';
import {
  buildProviderAliasMap, detectColumns, listSheetNames, readTable, readAllSheets, writeWorkbook, type ProviderMerge, type SheetTable,
} from '../services/serviceSettlement/excel';
import {
  computeReviewIncentive, computeReviewRates, reviewResultToRows, reviewRatesToRows, sanitizeRules, REVIEW_RESULT_COLUMNS, REVIEW_RATE_COLUMNS, mergeRules, type MappedTable,
} from '../services/serviceSettlement/reviewIncentive';
import {
  computeSettlementSummary, planProviderWorkbooks, summaryHeaders, summaryRows, trackingRow, TRACKING_HEADERS,
  evaluateTracking, unpaidRows, parseRecipients, formatRecipients, fillTemplate, type FeeItemSource, type ProviderTrackingRecord,
} from '../services/serviceSettlement/settlementSummary';
import {
  mergeTables, matchChannels, aggregateScrap, scrapSummaryRows, scrapPivot, SCRAP_SUMMARY_HEADERS, SOURCE_COLUMN,
} from '../services/serviceSettlement/scrapLedger';
import {
  buildScrapLedger, inspectScrapSources, writeScrapLedgerWorkbook, writeScrapSummaryWorkbook, scrapOutputStamp, describeLedgerWriteError,
} from '../services/serviceSettlement/scrapTemplate';
import type { SsScrapLedgerBuildRequest, SsScrapLedgerBuildResponse, SsScrapLedgerInspectResponse } from '@totalclaw/ipc-contracts';
import {
  computeAchievement, computeIncentives, sanitizeMarketingRules, quarterRange, providerIncentiveRows, managerIncentiveRows, describeRules,
  PROVIDER_INCENTIVE_HEADERS, MANAGER_INCENTIVE_HEADERS, buildTaxRows, taxRowsForExport, fillTaxTemplate, DEFAULT_TAX_HEADERS, DEFAULT_2026_RULES,
  validateLeader, parseLeaderInfoFromTable, addDays, normalizeDate, readProviderInfoTable,
  type AchievementResult, type LeaderInfo, type IncentiveResult, type IncentiveExtras, type ProviderInfoData,
} from '../services/serviceSettlement/marketingIncentive';

const store = new ServiceSettlementStore();
let proc: ServiceSettlementProc | null = null;

function todayIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** 结算期只接受 YYYY-MM：它会拼进输出目录路径，放任意字符串等于让渲染层决定往哪写文件 */
function requirePeriod(value: unknown): string {
  const v = requireText(value, i18nT('结算期'));
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(v)) throw new Error(i18nT('结算期格式应为 YYYY-MM，例如 2026-08'));
  return v;
}

function loadRef(ref: SsTableRef): MappedTable {
  if (!ref?.path || !existsSync(ref.path)) throw new Error(i18nT('文件不存在：{path}', { path: ref?.path || '' }));
  const table = readTable(ref.path, { sheetName: ref.sheetName });
  return { table, mapping: ref.mapping || {} };
}

/** 各表服务商列里出现过的原始名字（给名称变体归并用） */
function observedProviders(sources: MappedTable[]): string[] {
  const out = new Set<string>();
  for (const s of sources) {
    const col = s.mapping?.provider;
    if (!col) continue;
    for (const r of s.table.rows) { const v = r[col]; if (v) out.add(v); }
  }
  return [...out];
}

/**
 * 核算前把明细里的名称变体归到通讯录规范名（手工别名优先，自动归并只在唯一命中时生效）。
 * 归并了什么原样写进 warnings：用户看得见、不认可就去通讯录改别名。
 */
function resolveProviderAliases(store: ServiceSettlementStore, sources: MappedTable[]): { aliases: Record<string, string>; merges: ProviderMerge[]; warning: string } {
  const { map, merges } = buildProviderAliasMap({ directory: store.directoryNames(), aliases: store.aliasMap(), observed: observedProviders(sources) });
  const shown = merges.slice(0, 8).map((m) => `${m.from} → ${m.to}`).join(i18nT('；'));
  const warning = merges.length
    ? i18nT('已自动把 {n} 个名称变体并入同一家（通讯录规范名 / 全称）：{list}{more}。不认可的到通讯录里改别名', { n: merges.length, list: shown, more: merges.length > 8 ? '…' : '' })
    : '';
  return { aliases: map, merges, warning };
}

function inspect(req: SsInspectTableRequest): SsInspectTableResponse {
  const path = requireText(req?.path, i18nT('文件路径'));
  if (!existsSync(path)) throw new Error(i18nT('文件不存在：{path}', { path }));
  const sheetNames = listSheetNames(path);
  // 多 sheet 工作簿的默认页：客户真实文件把三个平台的评价明细放同一个工作簿的三个 sheet、
  // 结案表的外发版本叫「xx-外发」——按调用方给的关键字（安装 / 售后 / 天猫 / 外发 …）先挑，
  // 挑不到再退回第一个；用户随时可在界面上改选。
  let sheetName = req.sheetName;
  const prefer = Array.isArray(req.preferSheet) ? req.preferSheet.map((k) => String(k || '').trim()).filter(Boolean) : [];
  if (!sheetName && sheetNames.length > 1 && prefer.length) {
    const hit = prefer.map((k) => sheetNames.find((n) => n.includes(k))).find(Boolean);
    if (hit) sheetName = hit;
  }
  const table = readTable(path, { sheetName });
  const roles = Array.isArray(req.roles) ? req.roles : [];
  return {
    path,
    fileName: table.fileName,
    sheetName: table.sheetName,
    sheetNames,
    headers: table.headers,
    rowCount: table.rows.length,
    preview: table.rows.slice(0, 5),
    mapping: detectColumns(table.headers, roles),
  };
}

export function registerServiceSettlementHandlers(deps: WorkbenchIpcDeps): void {
  const logger = deps.logger;
  const win = (): BrowserWindow | null => deps.getMainWindow?.() ?? null;
  const broadcast = (event: { type: string; payload?: unknown }): void => {
    try { win()?.webContents.send(IPC_CHANNELS.WORKBENCH_SS_EVENT, event); } catch { /* 窗口已关 */ }
  };
  const defaultOutputDir = (): string => join(app.getPath('documents'), 'TotalClaw', i18nT('服务商结算'));

  const sendMail = async (input: { to: string[]; subject: string; body: string; attachments?: { filename: string; path: string }[]; headers?: Record<string, string> }) => {
    const { sendCaseMail } = await import('../services/caseMailSender');
    const relay = deps.serviceAuth
      ? { send: (i: Parameters<NonNullable<typeof deps.serviceAuth>['relaySendMail']>[0]) => deps.serviceAuth!.relaySendMail(i) }
      : null;
    return sendCaseMail((deps.readEmailCredentials?.() ?? {}) as any, input, relay);
  };

  const pushOutlets = async (title: string, body: string): Promise<string[]> => {
    const settings = deps.cronNotifyStore?.get();
    if (!settings || !Object.values(settings.outlets || {}).some(Boolean)) return [];
    const { notifyCronResult } = await import('../services/cronResultNotifier');
    const jobId = 'service-settlement';
    const outcomes = await notifyCronResult(
      { outlets: settings.outlets, enabledJobs: { [jobId]: true } },
      jobId,
      { jobName: title, ok: true, firedAt: Date.now(), summary: body },
      { sendMail: async ({ to, subject, body: b }) => sendMail({ to, subject, body: b }) },
    );
    return outcomes.filter((o) => o.ok).map((o) => o.outlet);
  };

  proc = new ServiceSettlementProc({
    store,
    get intakeService() { return deps.intakeService as any; },
    readEmailCredentials: () => deps.readEmailCredentials?.() ?? {},
    sendMail,
    pushOutlets,
    broadcast,
    logger: {
      info: (m, c) => logger?.info?.('service-settlement', m, c as any),
      warn: (m, c) => logger?.warn?.('service-settlement', m, c as any),
    },
    defaultOutputDir,
  });
  proc.start();
  onAppWillQuit('service-settlement', () => proc?.stop(), { once: true });

  const outDir = (sub?: string): string => proc!.outputDir(sub);
  const emailStatus = () => {
    const c = deps.readEmailCredentials?.() ?? {};
    return {
      address: c.EMAIL_ADDRESS || '',
      smtpConfigured: Boolean(c.EMAIL_ADDRESS && c.EMAIL_PASSWORD && c.EMAIL_SMTP_HOST),
      imapConfigured: Boolean(c.EMAIL_ADDRESS && c.EMAIL_PASSWORD && c.EMAIL_IMAP_HOST),
      officialRelay: Boolean(deps.serviceAuth),
      intakeReady: Boolean(deps.intakeService),
    };
  };

  // ── 通用 ──

  ipcMain.handle(IPC_CHANNELS.WORKBENCH_SS_STATE_GET, async () => {
    const s = store.get();
    return {
      state: s,
      outputDir: s.outputDir || defaultOutputDir(),
      dirs: {
        review: join(s.outputDir || defaultOutputDir(), i18nT('好评激励')),
        settlement: join(s.outputDir || defaultOutputDir(), i18nT('结案汇总')),
        scrap: join(s.outputDir || defaultOutputDir(), i18nT('报废台账')),
        marketing: join(s.outputDir || defaultOutputDir(), i18nT('营销激励结案')),
      },
      email: emailStatus(),
      trackingFlags: Object.fromEntries(s.settlement.records.map((r) => [`${r.period}|${r.provider}`, evaluateTracking(r)])),
    };
  });

  let rulesLoadVersion = 0;
  ipcMain.handle(IPC_CHANNELS.WORKBENCH_SS_STATE_PATCH, async (_e, patch: Record<string, any>) => {
    if (!patch || typeof patch !== 'object') throw new Error(i18nT('state patch 必须是对象'));
    store.update((s) => {
      if (typeof patch.outputDir === 'string') s.outputDir = patch.outputDir.trim() || undefined;
      if (patch.review && typeof patch.review === 'object') {
        const r = patch.review;
        if (typeof r.period === 'string') s.review.period = r.period;
        if (r.rules != null) s.review.rules = sanitizeRules(r.rules);
        if (r.paymentReminder && typeof r.paymentReminder === 'object') {
          const p = r.paymentReminder;
          const wasEnabled = s.review.paymentReminder.enabled;
          if (typeof p.enabled === 'boolean') s.review.paymentReminder.enabled = p.enabled;
          if (Number.isFinite(Number(p.day))) s.review.paymentReminder.day = Math.min(28, Math.max(1, Math.round(Number(p.day))));
          if (Number.isFinite(Number(p.hour))) s.review.paymentReminder.hour = Math.min(23, Math.max(0, Math.round(Number(p.hour))));
          // 「错过补提醒」只该补给一直开着的人：本月提醒日已过才来开开关，立刻响一发是误报——从下月开始。
          const now = new Date();
          const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
          if (!wasEnabled && s.review.paymentReminder.enabled && now.getDate() > s.review.paymentReminder.day) {
            s.review.paymentReminder.lastFiredMonth = monthKey;
          }
        }
      }
      if (patch.settlement && typeof patch.settlement === 'object') {
        const t = patch.settlement;
        if (typeof t.period === 'string') s.settlement.period = t.period;
        if (typeof t.invoiceNameTemplate === 'string' && t.invoiceNameTemplate.trim()) s.settlement.invoiceNameTemplate = t.invoiceNameTemplate.trim();
        if (typeof t.expenseSystemUrl === 'string') s.settlement.expenseSystemUrl = t.expenseSystemUrl.trim();
        if (typeof t.mailSubjectTemplate === 'string' && t.mailSubjectTemplate.trim()) s.settlement.mailSubjectTemplate = t.mailSubjectTemplate;
        if (typeof t.mailBodyTemplate === 'string' && t.mailBodyTemplate.trim()) s.settlement.mailBodyTemplate = t.mailBodyTemplate;
        if (typeof t.nudgeSubjectTemplate === 'string' && t.nudgeSubjectTemplate.trim()) s.settlement.nudgeSubjectTemplate = t.nudgeSubjectTemplate;
        if (typeof t.nudgeBodyTemplate === 'string' && t.nudgeBodyTemplate.trim()) s.settlement.nudgeBodyTemplate = t.nudgeBodyTemplate;
        if (t.followUp && typeof t.followUp === 'object') {
          const f = t.followUp;
          if (typeof f.enabled === 'boolean') s.settlement.followUp.enabled = f.enabled;
          if (Number.isFinite(Number(f.days))) s.settlement.followUp.days = Math.min(60, Math.max(1, Math.round(Number(f.days))));
        }
        if (t.unpaidReport && typeof t.unpaidReport === 'object') {
          const u = t.unpaidReport;
          if (typeof u.enabled === 'boolean') s.settlement.unpaidReport.enabled = u.enabled;
          if (Number.isFinite(Number(u.weekday))) s.settlement.unpaidReport.weekday = Math.min(6, Math.max(0, Math.round(Number(u.weekday))));
          if (Number.isFinite(Number(u.hour))) s.settlement.unpaidReport.hour = Math.min(23, Math.max(0, Math.round(Number(u.hour))));
        }
      }
      if (patch.scrap && typeof patch.scrap === 'object') {
        if (typeof patch.scrap.expenseSystemUrl === 'string') s.scrap.expenseSystemUrl = patch.scrap.expenseSystemUrl.trim();
      }
      if (patch.marketing && typeof patch.marketing === 'object') {
        const m = patch.marketing;
        if (Number.isFinite(Number(m.year))) s.marketing.year = Math.round(Number(m.year));
        if ([1, 2, 3, 4].includes(Number(m.quarter))) s.marketing.quarter = Number(m.quarter) as 1 | 2 | 3 | 4;
        if (typeof m.youzanUrl === 'string') s.marketing.youzanUrl = m.youzanUrl.trim();
        if (typeof m.cssUrl === 'string') s.marketing.cssUrl = m.cssUrl.trim();
        if (m.rulesReviewed === true) {
          if (!m.rules || Array.isArray(m.rulesPdfPaths)) throw new Error(i18nT('确认规则必须提供当前规则，且不能同时更换政策文件'));
          confirmPolicyReview(s.marketing, m.reviewedRevision);
        }
        if (m.rules != null) { s.marketing.rules = sanitizeMarketingRules(m.rules); rulesLoadVersion += 1; }
        if (Array.isArray(m.rulesPdfPaths)) {
          beginPolicyReview(s.marketing);
          s.marketing.rulesPdfPaths = m.rulesPdfPaths.length ? rulesPdfPaths({ paths: m.rulesPdfPaths }) : [];
          s.marketing.rulesPdfPath = s.marketing.rulesPdfPaths[0];
          rulesLoadVersion += 1;
        }
        if (typeof m.taxTemplatePath === 'string') s.marketing.taxTemplatePath = m.taxTemplatePath;
      }
    });
    return { ok: true, state: store.get() };
  });

  // E2E/演示钩子：用环境变量预排「文件选择」的返回值 —— 原生对话框 Playwright 点不了
  // （e2e/service-settlement.spec.ts 此前只能绕过 UI 直调 IPC）。设
  // TOTALCLAW_SS_PICK_QUEUE='[["p1","p2"],["p3"]]' 后，每次 PICK_FILES 依次出队一组；
  // 队列耗尽或未设置时回落真对话框。生产不设该 env，零影响。
  const pickQueue: string[][] = (() => {
    try {
      const q = JSON.parse(process.env.TOTALCLAW_SS_PICK_QUEUE || '[]');
      return Array.isArray(q) ? q.filter((g: unknown) => Array.isArray(g)) : [];
    } catch { return []; }
  })();

  ipcMain.handle(IPC_CHANNELS.WORKBENCH_SS_PICK_FILES, async (_e, req: SsPickFilesRequest) => {
    if (pickQueue.length) return { paths: pickQueue.shift()!.map((p) => String(p)) };
    const kind = req?.kind || 'excel';
    const filters = kind === 'excel' ? [{ name: i18nT('Excel 表格'), extensions: ['xlsx', 'xls', 'xlsm', 'csv'] }]
      : kind === 'pdf' ? [{ name: 'PDF', extensions: ['pdf'] }]
        : kind === 'invoice' ? [{ name: i18nT('发票文件'), extensions: ['pdf', 'ofd', 'jpg', 'jpeg', 'png', 'xlsx', 'zip'] }]
          : [{ name: i18nT('所有文件'), extensions: ['*'] }];
    const opts = {
      title: req?.title || i18nT('选择文件'),
      properties: (req?.multi === false ? ['openFile'] : ['openFile', 'multiSelections']) as Array<'openFile' | 'multiSelections'>,
      filters,
    };
    const w = win();
    const picked = w ? await dialog.showOpenDialog(w, opts) : await dialog.showOpenDialog(opts);
    return { paths: picked.canceled ? [] : picked.filePaths };
  });

  ipcMain.handle(IPC_CHANNELS.WORKBENCH_SS_PICK_FOLDER, async (_e, req: { title?: string; setAsOutput?: boolean }) => {
    const opts = { title: req?.title || i18nT('选择文件夹'), properties: ['openDirectory', 'createDirectory'] as Array<'openDirectory' | 'createDirectory'> };
    const w = win();
    const picked = w ? await dialog.showOpenDialog(w, opts) : await dialog.showOpenDialog(opts);
    const path = picked.canceled ? '' : picked.filePaths[0] || '';
    if (path && req?.setAsOutput) store.update((s) => { s.outputDir = path; });
    return { path };
  });

  ipcMain.handle(IPC_CHANNELS.WORKBENCH_SS_LIST_FOLDER_FILES, async (_e, req: { dir: string; depth?: number }) => {
    const dir = requireText(req?.dir, i18nT('文件夹'));
    // depth：往下钻几层子目录（报废流程包是「根/OEM报废/FYSQ…/鉴定表」两层，对照表和模板在根）；上限 3 防止选到 ~/Downloads 整棵树
    const depth = Math.min(Math.max(Math.trunc(Number(req?.depth) || 0), 0), 3);
    return { files: proc!.listSpreadsheets(dir, depth) };
  });

  ipcMain.handle(IPC_CHANNELS.WORKBENCH_SS_INSPECT_TABLE, async (_e, req: SsInspectTableRequest) => {
    try { return inspect(req); } catch (e) { throw new Error(userFacingError(e)); }
  });

  ipcMain.handle(IPC_CHANNELS.WORKBENCH_SS_CONTACTS_UPSERT, async (_e, req: { contacts: ProviderContact[] }) => {
    if (!Array.isArray(req?.contacts)) throw new Error(i18nT('contacts 必须是数组'));
    store.upsertContacts(req.contacts.map((c) => ({
      provider: String(c.provider || ''), email: c.email == null ? undefined : String(c.email), wecom: c.wecom == null ? undefined : String(c.wecom),
      manager: c.manager == null ? undefined : String(c.manager), leaderName: c.leaderName == null ? undefined : String(c.leaderName), phone: c.phone == null ? undefined : String(c.phone),
      // 别名：通讯录表格里填的「同一家的其它写法」——2026-09-07 之前这里没透传，界面填了保存后就丢，核算照样拆成两家
      aliases: Array.isArray(c.aliases) ? c.aliases.map((a) => String(a ?? '').trim()).filter(Boolean) : undefined,
    })));
    return { ok: true, providerDirectory: store.get().providerDirectory };
  });

  /** 从 Excel 导入服务商通讯录（服务商 / 邮箱 / 企微 / 区域经理 列自动识别） */
  ipcMain.handle(IPC_CHANNELS.WORKBENCH_SS_CONTACTS_IMPORT, async (_e, req: { path: string; sheetName?: string }) => {
    const table = readTable(requireText(req?.path, i18nT('文件路径')), { sheetName: req?.sheetName });
    const m = detectColumns(table.headers, ['provider', 'email', 'wecom', 'manager', 'name', 'phone', 'alias']);
    if (!m.provider) throw new Error(i18nT('没有识别到「服务商」列，请确认表头包含“服务商”或“网点”'));
    // 「别名」列：同一家的其它写法，多个用 逗号/顿号/分号 分隔；核算时并入本主体
    const splitAliases = (v: unknown) => String(v ?? '').split(/[,，、;；|\n]+/).map((s) => s.trim()).filter(Boolean);
    const contacts: ProviderContact[] = table.rows.map((r) => ({
      provider: r[m.provider], email: m.email ? r[m.email] : undefined, wecom: m.wecom ? r[m.wecom] : undefined,
      aliases: m.alias ? splitAliases(r[m.alias]) : undefined,
      manager: m.manager ? r[m.manager] : undefined, leaderName: m.name ? r[m.name] : undefined, phone: m.phone ? r[m.phone] : undefined,
    })).filter((c) => c.provider);
    store.upsertContacts(contacts);
    return { ok: true, imported: contacts.length, providerDirectory: store.get().providerDirectory };
  });

  // ── 模块一：好评激励 ──

  /**
   * 「计算京东安装评价率」单独一步（2026-09-09 客户要求先算评价率、单独成块）：
   * 只用安装明细 + 完工总单量 / 评价率报表，逐家给出 完工总单量 / 已评价 / 中好评价（非差评）/ 评价率 Y / 差评率 X 与来源。
   */
  ipcMain.handle(IPC_CHANNELS.WORKBENCH_SS_REVIEW_RATES, async (_e, req: SsReviewRatesRequest) => {
    const jdInstall = (req?.jdInstall || []).map(loadRef);
    const evaluableCounts = (req?.evaluable || []).map(loadRef);
    if (!jdInstall.length) throw new Error(i18nT('请先在第 1 步选择京东安装评价明细'));
    const names = resolveProviderAliases(store, [...jdInstall, ...evaluableCounts]);
    const rates = computeReviewRates({ jdInstall, jdAfterSales: [], tmall: [], evaluableCounts, aliases: names.aliases });
    if (names.warning) rates.warnings.push(names.warning);
    return rates;
  });

  ipcMain.handle(IPC_CHANNELS.WORKBENCH_SS_REVIEW_RUN, async (_e, req: SsReviewRunRequest) => {
    const period = requirePeriod(req?.period);
    const jdInstall = (req.jdInstall || []).map(loadRef);
    const jdAfterSales = (req.jdAfterSales || []).map(loadRef);
    const tmall = (req.tmall || []).map(loadRef);
    const evaluableCounts = (req.evaluable || []).map(loadRef);
    if (!jdInstall.length && !jdAfterSales.length && !tmall.length) throw new Error(i18nT('至少要提供一份评价明细 Excel'));
    const rules = sanitizeRules(req.rules);
    const names = resolveProviderAliases(store, [...jdInstall, ...jdAfterSales, ...tmall, ...evaluableCounts]);
    const result = computeReviewIncentive({ jdInstall, jdAfterSales, tmall, evaluableCounts, rules, aliases: names.aliases });
    if (names.warning) result.warnings.push(names.warning);
    // 评价率单独一页：完工总单量 / 已评价 / 中好评价（非差评）/ Y / X 与来源，客户核对公式用
    const rates = computeReviewRates({ jdInstall, jdAfterSales: [], tmall: [], evaluableCounts, rules, aliases: names.aliases });
    const dir = outDir(i18nT('好评激励'));
    const outputPath = join(dir, `${i18nT('服务商好评激励结果表')}-${period}.xlsx`);
    const merged = mergeRules(rules);
    writeWorkbook(outputPath, [
      { name: i18nT('激励结果'), headers: REVIEW_RESULT_COLUMNS.map((c) => c.label), rows: reviewResultToRows(result) },
      { name: i18nT('评价率'), headers: REVIEW_RATE_COLUMNS.map((c) => c.label), rows: reviewRatesToRows(rates) },
      {
        name: i18nT('计算规则'),
        headers: [i18nT('项目'), i18nT('规则')],
        rows: [
          [i18nT('安装差评率阈值'), `${(merged.badRateThreshold * 100).toFixed(2)}%`],
          [i18nT('X>阈值 基础激励'), `${merged.baseAmountAboveThreshold} ${i18nT('元')}`],
          [i18nT('X≤阈值 基础激励'), `${merged.baseAmountWithinThreshold} ${i18nT('元')}`],
          ...merged.coefTiers.map((t) => [i18nT('评价率 ≥ {rate} 系数', { rate: `${(t.minRate * 100).toFixed(0)}%` }), String(t.coef)]),
          [i18nT('售后非常满意/满意 每单'), `${merged.afterSalesPerOrder} ${i18nT('元')}`],
          [i18nT('天猫好评 每单'), `${merged.tmallPerOrder} ${i18nT('元')}`],
          [i18nT('有效好评'), i18nT('≥ {n} 星', { n: merged.goodStarsMin })],
          [i18nT('差评'), i18nT('≤ {n} 星', { n: merged.badStarsMax })],
          [i18nT('差评率分母'), merged.badRateDenominator === 'rated' ? i18nT('已评价单数') : i18nT('可评价单数')],
          [i18nT('公式'), i18nT('本项总激励 = ①有效好评单数×基础激励×系数 + ②(非常满意+满意)×售后单价 + ③天猫好评×天猫单价')],
        ],
      },
    ]);
    store.ensureProviders(result.providers.map((p) => p.provider));
    store.update((s) => {
      s.review.period = period;
      s.review.rules = rules;
      s.review.lastOutputPath = outputPath;
      s.review.lastRunAt = new Date().toISOString();
      s.review.lastSummary = { providerCount: result.totals.providerCount, total: result.totals.total };
    });
    logger?.audit?.('service-settlement', i18nT('好评激励核算完成'), { period, providers: result.totals.providerCount, total: result.totals.total });
    return { result, rates, outputPath, merges: names.merges };
  });

  // ── 模块二：结案汇总 / 下发 / 跟踪 ──

  ipcMain.handle(IPC_CHANNELS.WORKBENCH_SS_SETTLEMENT_RUN, async (_e, req: SsSettlementRunRequest) => {
    const period = requirePeriod(req?.period);
    const workOrders = (req.workOrders || []).map(loadRef);
    const feeItems: FeeItemSource[] = (req.feeItems || []).map((f) => ({ ...loadRef(f), name: String(f.name || '').trim() || basename(f.path), sign: f.sign === -1 ? -1 : 1 }));
    // 客户 7 月结案包里没有工单结算明细，只有激励 / 补扣表：允许只汇总费用项
    if (!workOrders.length && !feeItems.length) throw new Error(i18nT('请先选择工单结算明细表或激励 / 补扣表格'));
    const names = resolveProviderAliases(store, [...workOrders, ...feeItems]);
    const input = { period, workOrders, feeItems, aliases: names.aliases };
    const result = computeSettlementSummary(input);
    if (names.warning) result.warnings.push(names.warning);
    const plans = planProviderWorkbooks(input, result);
    const baseDir = outDir(join(i18nT('结案汇总'), period));
    const splitDir = join(baseDir, i18nT('按服务商拆分'));
    if (!existsSync(splitDir)) mkdirSync(splitDir, { recursive: true });
    // 汇总表：结算列 + 跟踪列
    const summaryPath = join(baseDir, `${i18nT('服务商结算总汇总表')}-${period}.xlsx`);
    const headers = [...summaryHeaders(result), ...TRACKING_HEADERS.slice(4)];
    const rows = summaryRows(result).map((r, i) => {
      const p = result.providers[i];
      if (!p) return [...r, ...TRACKING_HEADERS.slice(4).map(() => '')];
      const rec = store.trackingRecord(period, p.provider) || { period, provider: p.provider };
      return [...r, ...trackingRow({ ...rec, netTotal: p.netTotal }).slice(4)];
    });
    writeWorkbook(summaryPath, [{ name: i18nT('结算汇总'), headers, rows }]);
    const files: { provider: string; path: string; sheets: string[] }[] = [];
    for (const plan of plans) {
      const path = join(splitDir, plan.fileName);
      writeWorkbook(path, plan.sheets);
      files.push({ provider: plan.provider, path, sheets: plan.sheets.map((s) => s.name) });
    }
    store.ensureProviders(result.providers.map((p) => p.provider));
    for (const p of result.providers) {
      const file = files.find((f) => f.provider === p.provider);
      const contact = store.contact(p.provider);
      store.upsertTracking(period, p.provider, { netTotal: p.netTotal, attachmentPath: file?.path, email: contact?.email || store.trackingRecord(period, p.provider)?.email });
    }
    store.update((s) => {
      s.settlement.period = period;
      s.settlement.lastSummaryPath = summaryPath;
      s.settlement.lastSplitDir = splitDir;
      s.settlement.lastRunAt = new Date().toISOString();
    });
    logger?.audit?.('service-settlement', i18nT('结案汇总完成'), { period, providers: result.totals.providerCount, net: result.totals.netTotal });
    return { result, summaryPath, splitDir, files, merges: names.merges, records: store.get().settlement.records.filter((r) => r.period === period) };
  });

  ipcMain.handle(IPC_CHANNELS.WORKBENCH_SS_SETTLEMENT_SEND, async (_e, req: SsSettlementSendRequest) => {
    const period = requirePeriod(req?.period);
    const outcomes = await proc!.sendSettlementMails(period, {
      providers: req.providers, subjectTemplate: req.subjectTemplate, bodyTemplate: req.bodyTemplate, requestReadReceipt: req.requestReadReceipt,
    });
    logger?.audit?.('service-settlement', i18nT('结算明细邮件下发'), { period, sent: outcomes.filter((o) => o.ok).length, failed: outcomes.filter((o) => !o.ok).length });
    return { outcomes, records: store.get().settlement.records.filter((r) => r.period === period) };
  });

  /** 人工催办：已读没发票，点一下就按催办模板再发一封（自动跟进关着也能用） */
  ipcMain.handle(IPC_CHANNELS.WORKBENCH_SS_SETTLEMENT_NUDGE, async (_e, req: { period: string; providers?: string[] }) => {
    const period = requirePeriod(req?.period);
    const providers = Array.isArray(req?.providers) && req.providers.length
      ? req.providers.map((p) => String(p))
      : store.get().settlement.records.filter((r) => r.period === period && r.sentAt && !r.invoiceReceivedAt).map((r) => r.provider);
    const outcomes: SsSendOutcome[] = [];
    for (const p of providers) outcomes.push(await proc!.sendNudge(period, p));
    logger?.audit?.('service-settlement', i18nT('结算明细催办'), { period, sent: outcomes.filter((o) => o.ok).length, failed: outcomes.filter((o) => !o.ok).length });
    return { outcomes, records: store.get().settlement.records.filter((r) => r.period === period) };
  });

  ipcMain.handle(IPC_CHANNELS.WORKBENCH_SS_SETTLEMENT_TRACK_UPDATE, async (_e, req: SsTrackUpdateRequest) => {
    const period = requirePeriod(req?.period);
    const provider = requireText(req?.provider, i18nT('服务商'));
    const allowed: (keyof ProviderTrackingRecord)[] = ['email', 'invoiceReceivedAt', 'writeoffStartedAt', 'writeoffCompletedAt', 'note', 'readAt', 'repliedAt'];
    const patch: Partial<ProviderTrackingRecord> = {};
    for (const k of allowed) {
      if (k in (req.patch || {})) {
        const v = req.patch[k];
        (patch as any)[k] = v == null || v === '' ? undefined : String(v);
      }
    }
    // 多个邮箱统一成「逗号 + 空格」写法存，发送时再拆
    if (patch.email) patch.email = formatRecipients(patch.email);
    if (patch.writeoffCompletedAt && !store.trackingRecord(period, provider)?.writeoffStartedAt && !patch.writeoffStartedAt) patch.writeoffStartedAt = patch.writeoffCompletedAt;
    const rec = store.upsertTracking(period, provider, patch);
    if (patch.email) store.upsertContacts([{ provider, email: patch.email }]);
    return { record: rec, flags: evaluateTracking(rec) };
  });

  ipcMain.handle(IPC_CHANNELS.WORKBENCH_SS_SETTLEMENT_IMPORT_INVOICES, async (_e, req: { period: string; provider: string; paths: string[] }) => {
    const period = requirePeriod(req?.period);
    const provider = requireText(req?.provider, i18nT('服务商'));
    const saved = proc!.importInvoices(period, provider, Array.isArray(req.paths) ? req.paths : []);
    return { saved, record: store.trackingRecord(period, provider) };
  });

  /** 从费控系统导出表回写：识别 服务商 / 流程状态 / 发起时间 / 结束时间 */
  ipcMain.handle(IPC_CHANNELS.WORKBENCH_SS_SETTLEMENT_WRITEBACK_IMPORT, async (_e, req: { period: string; path: string; sheetName?: string }) => {
    const period = requirePeriod(req?.period);
    const table = readTable(requireText(req?.path, i18nT('文件路径')), { sheetName: req?.sheetName });
    const m = detectColumns(table.headers, ['provider', 'status']);
    const startCol = table.headers.find((h) => /发起|创建|提交|开始/.test(h) && /时间|日期/.test(h)) || '';
    const endCol = table.headers.find((h) => /结束|完成|审批通过|付款|支付/.test(h) && /时间|日期/.test(h)) || '';
    if (!m.provider) throw new Error(i18nT('没有识别到「服务商」列'));
    let updated = 0;
    const missing: string[] = [];
    for (const row of table.rows) {
      const provider = (row[m.provider] || '').trim();
      if (!provider) continue;
      const rec = store.trackingRecord(period, provider);
      if (!rec) { missing.push(provider); continue; }
      const status = m.status ? row[m.status] : '';
      // 费控系统导出的日期五花八门（2026/9/1、2026年9月1日、2026-09-01 10:00）：统一成 ISO 日期，否则 Date.parse 失败后
      // 3 天/20 天判定全部失效
      const started = startCol ? (normalizeDate(row[startCol]) || row[startCol]) : '';
      const ended = endCol ? (normalizeDate(row[endCol]) || row[endCol]) : '';
      const patch: Partial<ProviderTrackingRecord> = {};
      if (started) patch.writeoffStartedAt = started;
      else if (status && /进行|审批|处理|已发起|待/.test(status) && !rec.writeoffStartedAt) patch.writeoffStartedAt = new Date().toISOString();
      if (ended) patch.writeoffCompletedAt = ended;
      else if (status && /完成|结束|已付|通过|已支付/.test(status) && !rec.writeoffCompletedAt) patch.writeoffCompletedAt = new Date().toISOString();
      if (Object.keys(patch).length) { store.upsertTracking(period, provider, patch); updated += 1; }
    }
    broadcast({ type: 'tracking-changed', payload: { updated } });
    return { updated, missing: missing.slice(0, 50), records: store.get().settlement.records.filter((r) => r.period === period) };
  });

  ipcMain.handle(IPC_CHANNELS.WORKBENCH_SS_SETTLEMENT_SCAN_NOW, async () => {
    try { await deps.mailIntakeProc?.poll?.(); } catch { /* 邮件通道未配也继续扫已有收件 */ }
    const intake = await proc!.scanIntake();
    const receipts = await proc!.scanMailReceipts(true);
    return { ...intake, receipts, records: store.get().settlement.records, email: emailStatus() };
  });

  ipcMain.handle(IPC_CHANNELS.WORKBENCH_SS_SETTLEMENT_REPORT, async (_e, req: { period?: string }) => {
    const s = store.get();
    const records = req?.period ? s.settlement.records.filter((r) => r.period === req.period) : s.settlement.records;
    const dir = outDir(i18nT('结案汇总'));
    const stamp = todayIso();
    const trackingPath = join(dir, `${i18nT('服务商付款跟踪表')}-${req?.period || i18nT('全部')}-${stamp}.xlsx`);
    writeWorkbook(trackingPath, [
      { name: i18nT('付款跟踪'), headers: TRACKING_HEADERS, rows: records.map((r) => trackingRow(r)) },
      { name: i18nT('未完成付款'), headers: TRACKING_HEADERS, rows: unpaidRows(records) },
    ]);
    const unpaidPath = join(dir, `${i18nT('未完成付款服务商明细')}-${stamp}.xlsx`);
    writeWorkbook(unpaidPath, [{ name: i18nT('未付款明细'), headers: TRACKING_HEADERS, rows: unpaidRows(records) }]);
    store.update((st) => { st.settlement.unpaidReport.lastPath = unpaidPath; });
    return { trackingPath, unpaidPath, unpaidCount: unpaidRows(records).length };
  });

  // ── 模块三：报废台账 ──

  const loadScrapSources = (paths: string[]): SheetTable[] => {
    const tables: SheetTable[] = [];
    for (const p of paths) {
      if (!existsSync(p)) throw new Error(i18nT('文件不存在：{path}', { path: p }));
      tables.push(...readAllSheets(p));
    }
    if (!tables.length) throw new Error(i18nT('所选文件里没有可读的数据表'));
    return tables;
  };

  ipcMain.handle(IPC_CHANNELS.WORKBENCH_SS_SCRAP_MERGE, async (_e, req: SsScrapMergeRequest) => {
    const paths = Array.isArray(req?.paths) ? req.paths : [];
    if (!paths.length) throw new Error(i18nT('请先选择报废附件 Excel'));
    const merged = mergeTables(loadScrapSources(paths));
    const detected = detectColumns(merged.headers.filter((h) => h !== SOURCE_COLUMN), ['barcode', 'category', 'amount', 'channel']);
    return { headers: merged.headers, rowCount: merged.rows.length, sources: merged.sources, detected, preview: merged.rows.slice(0, 5) };
  });

  ipcMain.handle(IPC_CHANNELS.WORKBENCH_SS_SCRAP_MATCH, async (_e, req: SsScrapMatchRequest) => {
    const merged = mergeTables(loadScrapSources(req.paths || []));
    const lookup = readTable(requireText(req?.lookup?.path, i18nT('渠道对照表')), { sheetName: req.lookup.sheetName });
    const result = matchChannels({
      merged, barcodeColumn: requireText(req.barcodeColumn, i18nT('条码列')), lookup,
      lookupBarcodeColumn: requireText(req.lookup.barcodeColumn, i18nT('对照表条码列')),
      lookupChannelColumn: requireText(req.lookup.channelColumn, i18nT('对照表渠道列')),
      extraColumns: req.lookup.extraColumns,
    });
    store.update((s) => { s.scrap.lastLookupPath = req.lookup.path; });
    return { matched: result.matched, unmatched: result.unmatched, unmatchedBarcodes: result.unmatchedBarcodes, duplicateBarcodes: result.duplicateBarcodes, headers: result.headers, channelColumn: result.channelColumn, preview: result.rows.slice(0, 5) };
  });

  ipcMain.handle(IPC_CHANNELS.WORKBENCH_SS_SCRAP_AGGREGATE, async (_e, req: SsScrapAggregateRequest) => {
    const merged = mergeTables(loadScrapSources(req.paths || []));
    const lookup = readTable(requireText(req?.lookup?.path, i18nT('渠道对照表')), { sheetName: req.lookup.sheetName });
    const matched = matchChannels({
      merged, barcodeColumn: requireText(req.barcodeColumn, i18nT('条码列')), lookup,
      lookupBarcodeColumn: requireText(req.lookup.barcodeColumn, i18nT('对照表条码列')),
      lookupChannelColumn: requireText(req.lookup.channelColumn, i18nT('对照表渠道列')),
      extraColumns: req.lookup.extraColumns,
    });
    const channelColumn = req.channelColumn || matched.channelColumn;
    const agg = aggregateScrap(matched.rows, { channel: channelColumn, category: requireText(req.categoryColumn, i18nT('品类列')), amount: requireText(req.amountColumn, i18nT('报废费用列')) });
    const dir = outDir(i18nT('报废台账'));
    const stamp = todayIso();
    const outputPath = join(dir, `${i18nT('各渠道各品类报废费用汇总表')}-${stamp}.xlsx`);
    const pivot = scrapPivot(agg);
    writeWorkbook(outputPath, [
      { name: i18nT('渠道品类汇总'), headers: SCRAP_SUMMARY_HEADERS, rows: scrapSummaryRows(agg) },
      { name: i18nT('渠道×品类透视'), headers: pivot.headers, rows: pivot.rows },
      { name: i18nT('总数据表(已匹配渠道)'), headers: matched.headers, rows: matched.rows.map((r) => matched.headers.map((h) => r[h] ?? '')) },
    ]);
    const mergedPath = join(dir, `${i18nT('报废总数据表')}-${stamp}.xlsx`);
    writeWorkbook(mergedPath, [{ name: i18nT('总数据表'), headers: matched.headers, rows: matched.rows.map((r) => matched.headers.map((h) => r[h] ?? '')) }]);
    store.update((s) => { s.scrap.lastOutputPath = outputPath; s.scrap.lastRunAt = new Date().toISOString(); });
    logger?.audit?.('service-settlement', i18nT('报废台账汇总完成'), { rows: matched.rows.length, unmatched: matched.unmatched, total: agg.total.amount });
    return { aggregate: agg, matched: matched.matched, unmatched: matched.unmatched, outputPath, mergedPath };
  });

  // ── 模块四：营销激励结案 ──

  /** 服务商信息表（可选，客户「服务商最新信息」）→ 服务商→经理（归属兜底）/ 服务商→引入时间（呆滞配件返利年限）/ 曾用名→现名 */
  const readProviderInfo = (ref?: SsTableRef | null): ProviderInfoData => {
    if (!ref?.path) return { manager: {}, introducedAt: {}, aliases: {} };
    const { table, mapping } = loadRef(ref);
    return readProviderInfoTable(table, mapping);
  };
  /** 区域经理绩效等级表（可选，客户「服务经理绩效」）→ 经理→等级；等级只认 S / A / B+ 这类短码，表尾「绩效评比原则」杂行自然过滤 */
  const readGrades = (ref?: SsTableRef | null): Record<string, string> => {
    const out: Record<string, string> = {};
    if (!ref?.path) return out;
    const { table, mapping } = loadRef(ref);
    if (!mapping.manager || !mapping.grade) return out;
    for (const row of table.rows) {
      const m = (row[mapping.manager] || '').trim();
      const g = (row[mapping.grade] || '').trim();
      if (m && g && /^[A-Za-z][A-Za-z+＋\s]{0,3}$/.test(g)) out[m] = g;
    }
    return out;
  };

  ipcMain.handle(IPC_CHANNELS.WORKBENCH_SS_MARKETING_ACHIEVEMENT, async (_e, req: SsAchievementRequest) => {
    const orders = (req.orders || []).map(loadRef);
    if (!orders.length) throw new Error(i18nT('请先选择订单 Excel'));
    // 经理归属兜底：订单行经理为空、服务商又不在辅材订单映射里（客户延保表实测 7 家）→ 查服务商信息表
    const info = readProviderInfo(req.providerInfo);
    const known: Record<string, string> = { ...info.manager, ...(req.knownProviderManager || {}) };
    const qualifierPattern = typeof req.qualifierPattern === 'string' && req.qualifierPattern.trim() ? req.qualifierPattern.trim() : undefined;
    const result = computeAchievement({
      orders,
      providerTasks: req.providerTasks ? loadRef(req.providerTasks) : null,
      managerTasks: req.managerTasks ? loadRef(req.managerTasks) : null,
      quarter: quarterRange(Number(req.year) || new Date().getFullYear(), ([1, 2, 3, 4].includes(Number(req.quarter)) ? Number(req.quarter) : 1) as 1 | 2 | 3 | 4),
      measure: req.measure === 'quantity' ? 'quantity' : 'amount',
      knownProviderManager: known,
      qualifierPattern,
      aliases: info.aliases,
    });
    store.ensureProviders(result.providers.map((p) => p.name));
    store.upsertContacts(result.providers.filter((p) => p.manager).map((p) => ({ provider: p.name, manager: p.manager })));
    return result;
  });

  ipcMain.handle(IPC_CHANNELS.WORKBENCH_SS_MARKETING_RULES_FROM_PDF, async (_e, req: { path?: string; paths?: string[]; preset?: string }) => {
    const requestVersion = ++rulesLoadVersion;
    // 预设：不读 PDF 直接套（2026 默认政策已按 OCR 原件逐条人工核对，见 DEFAULT_2026_RULES 注释）
    if (req?.preset) {
      if (req.preset !== 'vatti-2026') throw new Error(i18nT('未知的规则预设：{p}', { p: req.preset }));
      const rules = sanitizeMarketingRules(DEFAULT_2026_RULES);
      store.update((s) => { beginPolicyReview(s.marketing); s.marketing.rules = rules; s.marketing.rulesReviewPending = false; });
      return { rules, excerpt: '', notes: '', llmNote: '', extracted: Object.keys(rules).filter((k) => k !== 'source' && k !== 'version'), error: '' };
    }
    const paths = rulesPdfPaths(req || {});
    for (const path of paths) if (!existsSync(path)) throw new Error(i18nT('文件不存在：{path}', { path }));
    let reviewRevision = 0;
    store.update(s => { reviewRevision = beginPolicyReview(s.marketing); s.marketing.rulesPdfPaths = paths; s.marketing.rulesPdfPath = paths[0]; });
    const fileName = paths.map(p => basename(p)).join(i18nT('、'));
    let activeFileName = '';
    let hadOcr = false;
    const documents: { path: string; text: string; ocr?: boolean; ocrPages?: number[]; pages: { page: number; text: string }[] }[] = [];
    const current = store.get().marketing.rules;
    // 抽不出来就明确报错、规则原样不动 —— 以前静默回默认规则，用户以为「AI 读过了」拿默认阶梯去结案（2026-09-03 真实政策 PDF 复盘）
    const failed = (error: string, excerpt = '') => {
      if (requestVersion === rulesLoadVersion) store.update((s) => { s.marketing.rulesPdfPaths = paths; s.marketing.rulesPdfPath = paths[0]; });
      return { reviewRevision, rules: sanitizeMarketingRules(current), excerpt, notes: '', llmNote: '', extracted: [] as string[], error: activeFileName ? `${activeFileName}：${error}` : error };
    };
    const { extractDocument } = await import('../services/documentExtractor');
    for (const path of paths) {
      activeFileName = basename(path);
      const fileName = activeFileName;
      let doc: Awaited<ReturnType<typeof extractDocument>>;
      try { doc = await extractDocument(path, fileName); }
      catch (error) { return failed(i18nT('PDF 读取失败：{p0}', { p0: (error as Error).message })); }
      const proc = deps.qiyeApiProc;
      const { QiyeApiClient } = await import('../services/qiyeApiClient');
      const client = proc && proc.getStatus() === 'ready'
        ? new QiyeApiClient({ baseUrl: proc.getBaseUrl(), getBearerToken: () => proc.getBearerToken(), defaultTimeoutMs: 600_000 }) : null;
      try {
        doc = await readPolicyPages(doc, path, {
          local: async (payload) => {
            if (!client) throw new Error(i18nT('OCR 服务未就绪'));
            return client.post('/v1/doc/ocr', payload);
          },
          vision: async (pages) => {
            if (!client) throw new Error(i18nT('视觉识别服务未就绪'));
            const { qiyeApiBridge } = await import('../services/qiyeApiBridge');
            const { renderScannedPages } = await import('../services/documentExtractor');
            const out: { page: number; text: string }[] = [];
            // 每批覆盖渲染器 12 页上限，不能静默漏掉后续政策页。
            for (let i = 0; i < pages.length; i += 12) {
              const images = await renderScannedPages(path, pages.slice(i, i + 12));
              for (const image of images) {
                const res = await qiyeApiBridge.chatCompletionsForVision({
                  imageDataUrl: image.dataUrl, maxTokens: 8192, timeoutMs: 180_000,
                  prompt: i18nT('识别中文政策图片，逐字转录全部中文、数字及公式，保留表格对应关系。不总结、不推断、不翻译；读不清处标注无法辨认。'),
                });
                const value = res.text;
                out.push({ page: image.page, text: typeof value === 'string' ? value : '' });
              }
            }
            return out;
          },
        });
      } catch (error) {
        logger?.warn?.('service-settlement', '政策识别未通过，未调用规则模型', { fileName, error: (error as Error).message });
        return failed((error as Error).message);
      }
      const text = String(doc.text || '').trim();
      if (!text) return failed(i18nT('这份 PDF 没有可读文字，无法抽取规则。请找业务方要文字版，或点「套用 2026 默认政策」/ 手工填写。'));
      // 页级 OCR 标记要一路传到 validatePolicyDraft，否则扫描件防护只能按整份文档判，
      // 一页走 OCR 就把整份 80 页的依据全拒掉（见 ExtractedDoc.ocrPages）。
      documents.push({ path, text, pages: doc.pages, ocr: !!doc.ocr, ocrPages: doc.ocrPages });
      hadOcr ||= !!doc.ocr;
    }
    activeFileName = '';
    let text: string;
    try { text = combineRuleDocuments(documents); } catch (error) { return failed((error as Error).message); }
    const excerpt = text;
    const { runOneshotChat } = await import('../services/councilChatRouter');
    const prompt = i18nT("{POLICY_PROMPT}\n===== 文件内容 =====\n{excerpt}", { POLICY_PROMPT, excerpt });
    let raw = '';
    try {
      raw = await runOneshotChat(deps, prompt, { plainCompletion: true, timeoutMs: 180_000 });
    } catch (e) {
      return failed(i18nT('模型抽取失败：{message}。规则未改动，请重试、点「套用 2026 默认政策」或对照 PDF 手工填写。', { message: userFacingError(e) }), text.slice(0, 3000));
    }
    let parsed: Record<string, unknown> | null = null;
    const cleaned = raw.replace(/```json|```/g, '');
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start >= 0 && end > start) {
      try { parsed = JSON.parse(cleaned.slice(start, end + 1)); } catch { parsed = null; }
    }
    if (!parsed) return failed(i18nT('模型没有返回可解析的结构化规则。规则未改动，请重试、点「套用 2026 默认政策」或手工核对。'), text.slice(0, 3000));
    if (requestVersion !== rulesLoadVersion) return failed(i18nT('等待期间文件或规则已变更，本次抽取未采用，请重新读取'));
    try {
      const draft = validatePolicyDraft(parsed, documents);
      // 草稿不改 store，也不经 sanitizer 补默认值。用户核对后才选择应用。
      return { reviewRevision, draft: draft.rules, evidence: draft.evidence, missing: draft.missing, documents: draft.documents || [],
        source: fileName, extracted: draft.fields, notes: draft.notes || '',
        excerpt: text.slice(0, 3000), llmNote: hadOcr ? i18nT('正文由 OCR 转录，中文可读不代表表格、公式和数字准确。未提取不代表原文未规定，请逐项核对。') : '', error: '' };
    } catch (error) { return failed(i18nT('规则草稿校验失败：{p0}', { p0: (error as Error).message }), text.slice(0, 3000)); }

  });

  ipcMain.handle(IPC_CHANNELS.WORKBENCH_SS_MARKETING_COMPUTE, async (_e, req: SsMarketingComputeRequest) => {
    assertPolicyReviewComplete(store.get().marketing);
    const aux = req?.aux as AchievementResult | undefined;
    if (!aux || !Array.isArray(aux.providers)) throw new Error(i18nT('请先完成第 2 步辅材达成计算'));
    const warranty = (req.warranty as AchievementResult | null | undefined) || null;
    const rules = sanitizeMarketingRules(req.rules);
    const q = quarterRange(Number(req.year) || new Date().getFullYear(), ([1, 2, 3, 4].includes(Number(req.quarter)) ? Number(req.quarter) : 1) as 1 | 2 | 3 | 4);
    // 可选补充表：绩效等级（系数）、服务商信息（引入时间 → 服务年限 → 呆滞配件返利比例；曾用名 → 现名对齐辅材 / 延保）
    const info = readProviderInfo(req.providerInfo);
    const extras: IncentiveExtras = { grades: readGrades(req.grades), introducedAt: info.introducedAt, aliases: info.aliases, quarter: q };
    const result = computeIncentives(aux, warranty, rules, extras);
    const dir = outDir(join(i18nT('营销激励结案'), q.label));
    const outputPath = join(dir, `${i18nT('服务营销激励核算表')}-${q.label}.xlsx`);
    writeWorkbook(outputPath, [
      { name: i18nT('服务商激励'), headers: PROVIDER_INCENTIVE_HEADERS, rows: providerIncentiveRows(result) },
      { name: i18nT('区域经理激励'), headers: MANAGER_INCENTIVE_HEADERS, rows: managerIncentiveRows(result) },
      { name: i18nT('计算规则'), headers: [i18nT('项目'), i18nT('规则')], rows: describeRules(rules) },
    ]);
    store.update((s) => {
      s.marketing.year = q.label ? Number(q.label.slice(0, 4)) : s.marketing.year;
      s.marketing.quarter = Number(q.label.slice(-1)) as 1 | 2 | 3 | 4;
      s.marketing.rules = rules;
      s.marketing.lastIncentivePath = outputPath;
      s.marketing.lastRunAt = new Date().toISOString();
      s.marketing.leaderIncentiveByProvider = Object.fromEntries(result.providers.map((p) => [p.provider, p.leaderIncentive]));
      // 退回记录：金额跟着最新核算走，通知状态保留
      for (const p of result.providers) {
        const rec = s.marketing.returnRecords.find((r) => r.provider === p.provider);
        if (rec) rec.amount = p.auxInitial; else s.marketing.returnRecords.push({ provider: p.provider, amount: p.auxInitial });
      }
    });
    logger?.audit?.('service-settlement', i18nT('营销激励核算完成'), { quarter: q.label, providers: result.providers.length, managers: result.managers.length });
    return { result, outputPath, quarter: q, returnRecords: store.get().marketing.returnRecords };
  });

  ipcMain.handle(IPC_CHANNELS.WORKBENCH_SS_MARKETING_NOTIFY, async (_e, req: SsMarketingNotifyRequest) => {
    const kind = req?.kind;
    if (!['return', 'invoice', 'leader_info'].includes(kind)) throw new Error(i18nT('通知类型不正确'));
    const q = quarterRange(Number(req.year) || new Date().getFullYear(), ([1, 2, 3, 4].includes(Number(req.quarter)) ? Number(req.quarter) : 1) as 1 | 2 | 3 | 4);
    const s = store.get();
    const rules = s.marketing.rules;
    const dueDate = req.dueDate || addDays(todayIso(), rules.returnDueDays);
    const outcomes: SsSendOutcome[] = [];
    const now = new Date().toISOString();
    for (const item of req.providers || []) {
      const provider = String(item.provider || '').trim();
      if (!provider) continue;
      const contact = store.contact(provider);
      const to = parseRecipients(contact?.email).valid;
      const email = to.join(', ');
      let subject = '';
      let body = '';
      if (kind === 'return') {
        subject = i18nT('【{q}】呆滞配件退回通知 - {provider}', { q: q.label, provider });
        body = i18nT('{provider} 您好：\n\n根据 {q} 服务营销激励核算，贵司辅材激励初始金额为 {amount} 元。按规则需退回等额呆滞配件，退回截止日期：{due}。\n请在截止日前安排退回并回复本邮件确认；逾期未退回将影响激励结算。\n\n谢谢！', { provider, q: q.label, amount: item.amount, due: dueDate });
      } else if (kind === 'invoice') {
        subject = i18nT('【{q}】服务营销激励开票通知 - {provider}', { q: q.label, provider });
        body = i18nT('{provider} 您好：\n\n{q} 服务营销激励已核算完成：贵司最终延保激励金额 {amount} 元。请按此金额开具发票并回复本邮件（或通过企微发送发票附件）。\n\n谢谢！', { provider, q: q.label, amount: item.amount });
      } else {
        subject = i18nT('【{q}】服务商负责人激励信息提报 - {provider}', { q: q.label, provider });
        body = i18nT('{provider} 您好：\n\n{q} 服务商负责人激励金额为 {amount} 元（代扣代缴个税后发放）。请回复本邮件提报负责人信息，格式如下（每项一行）：\n姓名：\n身份证号：\n银行卡号：\n开户行：\n手机号：\n\n也可通过企微发送同样内容或 Excel。\n\n谢谢！', { provider, q: q.label, amount: item.amount });
      }
      let ok = false;
      let message: string | undefined;
      let messageId: string | undefined;
      if (!to.length) { message = i18nT('未填写邮箱'); } else {
        const r = await sendMail({ to, subject, body });
        ok = r.ok; message = r.message; messageId = r.messageId;
      }
      store.update((st) => {
        let rec = st.marketing.returnRecords.find((r) => r.provider === provider);
        if (!rec) { rec = { provider, amount: Number(item.amount) || 0 }; st.marketing.returnRecords.push(rec); }
        if (kind === 'return') { rec.amount = Number(item.amount) || rec.amount; if (ok) { rec.notifiedAt = now; rec.dueDate = dueDate; rec.secondNoticeAt = undefined; } }
        if (kind === 'invoice' && ok) rec.invoiceNoticeAt = now;
        if (kind === 'leader_info' && ok) rec.leaderInfoNoticeAt = now;
        rec.notifyError = ok ? undefined : message;
      });
      outcomes.push({ provider, email: email || undefined, ok, message, messageId });
    }
    logger?.audit?.('service-settlement', i18nT('营销激励通知发送'), { kind, sent: outcomes.filter((o) => o.ok).length, failed: outcomes.filter((o) => !o.ok).length });
    return { outcomes, dueDate, returnRecords: store.get().marketing.returnRecords };
  });

  ipcMain.handle(IPC_CHANNELS.WORKBENCH_SS_MARKETING_RETURN_UPDATE, async (_e, req: { provider: string; patch: Record<string, unknown> }) => {
    const provider = requireText(req?.provider, i18nT('服务商'));
    store.update((s) => {
      let rec = s.marketing.returnRecords.find((r) => r.provider === provider);
      if (!rec) { rec = { provider, amount: 0 }; s.marketing.returnRecords.push(rec); }
      const p = req.patch || {};
      if (typeof p.returned === 'boolean') { rec.returned = p.returned; rec.returnedAt = p.returned ? (typeof p.returnedAt === 'string' && p.returnedAt ? p.returnedAt : todayIso()) : undefined; }
      if (typeof p.dueDate === 'string') rec.dueDate = p.dueDate || undefined;
      if (p.amount != null && Number.isFinite(Number(p.amount))) rec.amount = Number(p.amount);
    });
    return { returnRecords: store.get().marketing.returnRecords };
  });

  ipcMain.handle(IPC_CHANNELS.WORKBENCH_SS_MARKETING_LEADERS_IMPORT, async (_e, req: { path: string; sheetName?: string; provider?: string }) => {
    const table = readTable(requireText(req?.path, i18nT('文件路径')), { sheetName: req?.sheetName });
    const providerCol = detectColumns(table.headers, ['provider']).provider;
    const parsed = parseLeaderInfoFromTable(table);
    if (!parsed.length) throw new Error(i18nT('没有识别到身份证 / 银行卡列，请检查表头'));
    let imported = 0;
    store.update((s) => {
      parsed.forEach((p) => {
        const provider = ((providerCol ? table.rows[p.rowIndex]?.[providerCol] : '') || req.provider || '').trim();
        if (!provider) return;
        const { rowIndex: _row, ...fields } = p;
        const info: LeaderInfo = { provider, ...fields, source: i18nT('导入'), receivedAt: new Date().toISOString(), errors: [] };
        info.errors = validateLeader(info);
        const idx = s.marketing.leaders.findIndex((l) => l.provider === provider);
        if (idx >= 0) s.marketing.leaders[idx] = info; else s.marketing.leaders.push(info);
        imported += 1;
      });
    });
    return { imported, leaders: store.get().marketing.leaders };
  });

  ipcMain.handle(IPC_CHANNELS.WORKBENCH_SS_MARKETING_LEADER_UPDATE, async (_e, req: { provider: string; patch: Record<string, unknown>; remove?: boolean }) => {
    const provider = requireText(req?.provider, i18nT('服务商'));
    store.update((s) => {
      if (req.remove) { s.marketing.leaders = s.marketing.leaders.filter((l) => l.provider !== provider); return; }
      let info = s.marketing.leaders.find((l) => l.provider === provider);
      if (!info) { info = { provider, name: '', idCard: '', bankCard: '', bankName: '', source: i18nT('手工'), errors: [] }; s.marketing.leaders.push(info); }
      const p = req.patch || {};
      for (const k of ['name', 'idCard', 'bankCard', 'bankName', 'phone'] as const) {
        if (k in p) (info as any)[k] = String(p[k] ?? '').trim();
      }
      info.idCard = info.idCard.toUpperCase();
      info.bankCard = info.bankCard.replace(/\s+/g, '');
      info.errors = validateLeader(info);
    });
    return { leaders: store.get().marketing.leaders };
  });

  ipcMain.handle(IPC_CHANNELS.WORKBENCH_SS_MARKETING_TAX_EXPORT, async (_e, req: { templatePath?: string; incentiveByProvider?: Record<string, number> }) => {
    const s = store.get();
    const incentive = req?.incentiveByProvider && Object.keys(req.incentiveByProvider).length ? req.incentiveByProvider : (s.marketing.leaderIncentiveByProvider || {});
    if (!Object.keys(incentive).length) throw new Error(i18nT('还没有负责人激励金额，请先完成第 8 步核算'));
    const valid = s.marketing.leaders.filter((l) => !l.errors.length);
    if (!valid.length) throw new Error(i18nT('没有校验通过的负责人信息，请先在第 9 步补齐'));
    const rows = buildTaxRows(valid, incentive);
    const q = s.marketing.year && s.marketing.quarter ? `${s.marketing.year}Q${s.marketing.quarter}` : todayIso();
    const dir = outDir(join(i18nT('营销激励结案'), q));
    const outputPath = join(dir, `${i18nT('个税申报表')}-${q}.xlsx`);
    let usedTemplate = false;
    const templatePath = req?.templatePath || s.marketing.taxTemplatePath;
    if (templatePath && existsSync(templatePath)) {
      try {
        const tpl = readTable(templatePath);
        const filled = fillTaxTemplate(tpl.headers, rows);
        if (filled) {
          writeWorkbook(outputPath, [{ name: tpl.sheetName || i18nT('个税申报'), headers: tpl.headers, rows: filled }]);
          usedTemplate = true;
        }
      } catch { usedTemplate = false; }
    }
    if (!usedTemplate) writeWorkbook(outputPath, [{ name: i18nT('个税申报'), headers: DEFAULT_TAX_HEADERS, rows: taxRowsForExport(rows) }]);
    store.update((st) => { st.marketing.lastTaxPath = outputPath; if (templatePath) st.marketing.taxTemplatePath = templatePath; });
    const skipped = s.marketing.leaders.filter((l) => l.errors.length).map((l) => l.provider);
    return { outputPath, usedTemplate, count: rows.length, skipped, totalTax: rows.reduce((a, r) => a + r.tax, 0) };
  });

  ipcMain.handle(IPC_CHANNELS.WORKBENCH_SS_MARKETING_REPORT, async (_e, req: { year: number; quarter: 1 | 2 | 3 | 4; aux?: AchievementResult; warranty?: AchievementResult | null; incentive?: IncentiveResult }) => {
    const q = quarterRange(Number(req?.year) || new Date().getFullYear(), ([1, 2, 3, 4].includes(Number(req?.quarter)) ? Number(req.quarter) : 1) as 1 | 2 | 3 | 4);
    const s = store.get();
    const inc = req?.incentive;
    const aux = req?.aux;
    const warranty = req?.warranty || null;
    const rules = s.marketing.rules;
    const returned = s.marketing.returnRecords.filter((r) => r.returned).length;
    const leadersOk = s.marketing.leaders.filter((l) => !l.errors.length).length;
    const leadersBad = s.marketing.leaders.length - leadersOk;
    const facts = [
      i18nT('季度：{p0}（{p1} ~ {p2}）', { p0: q.label, p1: q.start, p2: q.end }),
      aux ? i18nT('辅材：服务商 {p0} 家，实际 {p1} 元 / 任务 {p2} 元，整体达成率 {p3}%；区域经理 {p4} 人', { p0: aux.providers.length, p1: aux.totals.actual, p2: aux.totals.task, p3: (aux.totals.rate * 100).toFixed(1), p4: aux.managers.length }) : i18nT('辅材：未计算'),
      warranty ? i18nT('延保：服务商实际 {p0} / 任务 {p1}，整体达成率 {p2}%', { p0: warranty.totals.actual, p1: warranty.totals.task, p2: (warranty.totals.rate * 100).toFixed(1) }) : i18nT('延保：未计算'),
      inc ? i18nT('激励：服务商辅材激励初始合计 {p0} 元；服务商延保激励合计 {p1} 元；负责人激励合计 {p2} 元；区域经理最终激励合计 {p3} 元', { p0: inc.totals.auxInitial, p1: inc.totals.warrantyIncentive, p2: inc.totals.leaderIncentive, p3: inc.totals.managerFinal }) : i18nT('激励：未计算'),
      inc ? i18nT('区域经理打折：{p0}', { p0: inc.managers.filter((m) => m.discount < 1).map((m) => `${m.manager}（延保达成率 ${(m.warrantyRate * 100).toFixed(1)}%，${(m.discount * 10).toFixed(1)} 折）`).join('、') || '无' }) : '',
      i18nT('呆滞配件退回：已通知 {p0} 家，已退回 {returned} 家，二次提醒 {p1} 家', { p0: s.marketing.returnRecords.filter((r) => r.notifiedAt).length, returned, p1: s.marketing.returnRecords.filter((r) => r.secondNoticeAt).length }),
      i18nT('负责人信息：已收集 {p0} 家，校验通过 {leadersOk} 家，有误 {leadersBad} 家', { p0: s.marketing.leaders.length, leadersOk, leadersBad }),
      i18nT('规则来源：{p0}', { p0: rules.source || '默认' }),
      inc ? i18nT('服务商 TOP5（按辅材激励）：{p0}', { p0: [...inc.providers].sort((a, b) => b.auxInitial - a.auxInitial).slice(0, 5).map((p) => `${p.provider} ${p.auxInitial} 元（达成率 ${(p.auxRate * 100).toFixed(1)}%）`).join('；') }) : '',
      inc ? i18nT('未达标服务商（辅材达成率 < 80%）：{p0}', { p0: inc.providers.filter((p) => p.auxRate < 0.8).map((p) => p.provider).join('、') || '无' }) : '',
    ].filter(Boolean).join('\n');
    // 事实版报告（模型不可用时直接用；模型可用时也作为兜底）——六节结构与提示词一致，数字全部来自核算结果
    const fmtYuan = (n: unknown) => Number(n || 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const pct = (r: unknown) => `${(Number(r || 0) * 100).toFixed(1)}%`;
    const discounted = inc ? inc.managers.filter((m) => m.discount < 1) : [];
    const below = inc ? inc.providers.filter((p) => p.auxRate < 0.8) : [];
    const top5 = inc ? [...inc.providers].sort((a, b) => b.auxInitial - a.auxInitial).slice(0, 5) : [];
    const templateReport = [
      i18nT('# {p0} 服务营销激励结案报告', { p0: q.label }),
      '',
      i18nT('## 1. 结案概览'),
      i18nT('- 结案季度：{p0}（{p1} ~ {p2}）', { p0: q.label, p1: q.start, p2: q.end }),
      inc ? i18nT('- 激励总额：服务商辅材激励初始 {p0} 元，服务商延保激励 {p1} 元，负责人激励 {p2} 元，区域经理最终激励 {p3} 元', { p0: fmtYuan(inc.totals.auxInitial), p1: fmtYuan(inc.totals.warrantyIncentive), p2: fmtYuan(inc.totals.leaderIncentive), p3: fmtYuan(inc.totals.managerFinal) }) : i18nT('- 激励：未计算'),
      i18nT('- 规则来源：{p0}', { p0: rules.source || i18nT('默认') }),
      '',
      i18nT('## 2. 辅材达成情况'),
      aux ? i18nT('- 服务商 {p0} 家：实际 {p1} 元 / 任务 {p2} 元，整体达成率 {p3}；区域经理 {p4} 人', { p0: aux.providers.length, p1: fmtYuan(aux.totals.actual), p2: fmtYuan(aux.totals.task), p3: pct(aux.totals.rate), p4: aux.managers.length }) : i18nT('- 未计算'),
      top5.length ? i18nT('- 亮点（按辅材激励 TOP5）：{p0}', { p0: top5.map((p) => `${p.provider} ${fmtYuan(p.auxInitial)} 元（达成率 ${pct(p.auxRate)}）`).join('；') }) : '',
      inc ? i18nT('- 未达标（辅材达成率 < 80%）{n} 家：{p0}', { n: below.length, p0: below.map((p) => p.provider).join('、') || i18nT('无') }) : '',
      '',
      i18nT('## 3. 延保达成情况及对区域经理激励的影响'),
      warranty ? i18nT('- 服务商延保实际 {p0} / 任务 {p1}，整体达成率 {p2}', { p0: fmtYuan(warranty.totals.actual), p1: fmtYuan(warranty.totals.task), p2: pct(warranty.totals.rate) }) : i18nT('- 未计算'),
      inc ? i18nT('- 区域经理辅材提成打折 {n} 人：{p0}', { n: discounted.length, p0: discounted.map((m) => `${m.manager}（延保达成率 ${pct(m.warrantyRate)}，${(m.discount * 10).toFixed(1)} 折）`).join('、') || i18nT('无') }) : '',
      '',
      i18nT('## 4. 激励核算结果'),
      inc ? i18nT('- 服务商：辅材激励初始合计 {p0} 元、延保激励合计 {p1} 元；负责人激励合计 {p2} 元', { p0: fmtYuan(inc.totals.auxInitial), p1: fmtYuan(inc.totals.warrantyIncentive), p2: fmtYuan(inc.totals.leaderIncentive) }) : i18nT('- 未计算'),
      inc ? i18nT('- 区域经理最终激励合计 {p0} 元（{n} 人）', { p0: fmtYuan(inc.totals.managerFinal), n: inc.managers.length }) : '',
      ...(inc ? inc.managers.map((m) => i18nT('  - {p0}：{p1} 元', { p0: m.manager, p1: fmtYuan(m.finalIncentive) })) : []),
      '',
      i18nT('## 5. 呆滞配件退回与开票、信息提报进度'),
      i18nT('- 呆滞配件退回：已通知 {p0} 家，已退回 {returned} 家，二次提醒 {p1} 家', { p0: s.marketing.returnRecords.filter((r) => r.notifiedAt).length, returned, p1: s.marketing.returnRecords.filter((r) => r.secondNoticeAt).length }),
      i18nT('- 负责人信息：已收集 {p0} 家，校验通过 {leadersOk} 家，有误 {leadersBad} 家', { p0: s.marketing.leaders.length, leadersOk, leadersBad }),
      '',
      i18nT('## 6. 风险与下季度建议'),
      inc && below.length ? i18nT('- {n} 家服务商辅材达成率不足 80%，建议下季度前置盘点任务分解与提货节奏', { n: below.length }) : i18nT('- 辅材达成整体正常'),
      inc && discounted.length ? i18nT('- {n} 位区域经理因延保达成率不足被打折，建议加强延保推广考核', { n: discounted.length }) : i18nT('- 区域经理延保达成整体正常'),
      leadersBad ? i18nT('- {n} 家负责人信息校验有误，需在个税申报前补正', { n: leadersBad }) : '',
      '',
      i18nT('> 由核算事实自动生成 · {p0}', { p0: new Date().toLocaleString('zh-CN') }),
    ].filter((l) => l !== '').join('\n');
    // 模型回复必须像一份报告：短文本 / 没有标题 / 一看就是错误提示的，都不能当报告写进文件
    // （2026-09-04 实测：模型通道余额不足时把「大模型账户余额不足…请充值」当成回复内容返回，整份报告就这一句）
    const looksLikeReport = (md: string): boolean => {
      const t = md.trim();
      if (t.length < 300) return false;
      if (!/^#{1,3}\s/m.test(t)) return false;
      if (/余额不足|配额受限|额度不足|请充值|API\s*Key|未配置|无法启动|请稍后重试|not\s+found|unauthorized/i.test(t.slice(0, 200))) return false;
      return true;
    };
    let markdown = '';
    let llmNote = '';
    try {
      const { runOneshotChat } = await import('../services/councilChatRouter');
      const prompt = [
        i18nT('你是服务营销结算专员。请根据下面的核算事实写一份《季度服务营销激励结案报告》，Markdown 格式，中文，结构：'),
        i18nT('1. 结案概览（季度、范围、总金额）'),
        i18nT('2. 辅材达成情况（服务商与区域经理，亮点与未达标）'),
        i18nT('3. 延保达成情况及对区域经理激励的影响'),
        i18nT('4. 激励核算结果（服务商 / 负责人 / 区域经理）'),
        i18nT('5. 呆滞配件退回与开票、信息提报进度'),
        i18nT('6. 风险与下季度建议'),
        i18nT('只使用给定事实，不要编造任何数字；数字原样引用。'),
        '',
        i18nT('===== 核算事实 ====='),
        facts,
      ].join('\n');
      const reply = await runOneshotChat(deps, prompt, { plainCompletion: true, timeoutMs: 180_000 });
      if (looksLikeReport(reply)) markdown = reply;
      else llmNote = i18nT('AI 润色不可用（{message}），已输出事实版报告。', { message: reply.trim().replace(/\s+/g, ' ').slice(0, 120) || i18nT('模型没有返回内容') });
    } catch (e) {
      llmNote = i18nT('AI 润色不可用（{message}），已输出事实版报告。', { message: userFacingError(e) });
    }
    if (!markdown.trim()) markdown = templateReport;
    const dir = outDir(join(i18nT('营销激励结案'), q.label));
    const outputPath = join(dir, `${i18nT('季度结案报告')}-${q.label}.md`);
    const { writeFileSync } = await import('fs');
    writeFileSync(outputPath, markdown, 'utf-8');
    store.update((st) => { st.marketing.lastReportPath = outputPath; });
    return { outputPath, markdown, llmNote };
  });

  // ── 提醒 ──

  ipcMain.handle(IPC_CHANNELS.WORKBENCH_SS_REMINDERS_ACK, async (_e, req: { ids?: string[]; all?: boolean }) => {
    store.update((s) => {
      for (const r of s.reminders) if (req?.all || req?.ids?.includes(r.id)) r.read = true;
    });
    return { reminders: store.get().reminders };
  });

  ipcMain.handle(IPC_CHANNELS.WORKBENCH_SS_TRIGGER_TICK, async () => {
    await proc!.tick();
    return { reminders: store.get().reminders, records: store.get().settlement.records };
  });

  // ── 模块三 · 报废台账（8.21 模板：鉴定表 + 报废条码 → 台账 → 条码匹配渠道 → 渠道×品类汇总）──

  ipcMain.handle(IPC_CHANNELS.WORKBENCH_SS_SCRAP_LEDGER_BUILD, async (_e, req: SsScrapLedgerBuildRequest): Promise<SsScrapLedgerBuildResponse | SsScrapLedgerInspectResponse> => {
    const oemFiles = Array.isArray(req?.oemFiles) ? req.oemFiles.map((p) => String(p || '')).filter(Boolean) : [];
    const barcodeFiles = Array.isArray(req?.barcodeFiles) ? req.barcodeFiles.map((p) => String(p || '')).filter(Boolean) : [];
    if (!oemFiles.length && !barcodeFiles.length) throw new Error(i18nT('请先选择鉴定表或报废条码文件'));
    for (const p of [...oemFiles, ...barcodeFiles]) if (!existsSync(p)) throw new Error(i18nT('文件不存在：{path}', { path: p }));
    const byFile = (m: unknown): Record<string, string> | undefined => {
      if (!m || typeof m !== 'object') return undefined;
      const out: Record<string, string> = {};
      for (const [k, v] of Object.entries(m as Record<string, unknown>)) if (k && v != null) out[k] = String(v).trim();
      return out;
    };
    const supplierByFile = byFile(req.supplierByFile);
    const processNoByFile = byFile(req.processNoByFile);
    // 第 1 步的来源预识别：只解析不出台账，逐文件回错（放错框 / 认不出供应商流程号），界面给补填框
    if (req.dryRun) {
      const r = inspectScrapSources({ oemFiles, barcodeFiles, supplierByFile, processNoByFile });
      return { dryRun: true, sources: r.sources.map((s) => (s.error ? { ...s, error: userFacingError(new Error(s.error)) } : s)), warnings: r.warnings };
    }
    const lookups = (req.lookups ?? (req.lookup ? [req.lookup] : [])).map((ref) => {
      const path = requireText(ref?.path, i18nT('渠道对照表'));
      if (!existsSync(path)) throw new Error(i18nT('文件不存在：{path}', { path }));
      return { ...ref, path };
    });
    const lookupPath = requireText(lookups[0]?.path, i18nT('渠道对照表'));
    const templatePath = req.templatePath ? String(req.templatePath) : '';
    if (templatePath && !existsSync(templatePath)) throw new Error(i18nT('文件不存在：{path}', { path: templatePath }));
    let result: ReturnType<typeof buildScrapLedger>;
    try {
      result = buildScrapLedger({
        oemFiles, barcodeFiles,
        lookups,
        templatePath: templatePath || undefined,
        startDate: req.startDate ? String(req.startDate) : undefined,
        supplierByFile, processNoByFile,
        includeReason: Boolean(req.includeReason),
      });
    } catch (e) { throw new Error(userFacingError(e)); }
    const dir = outDir(i18nT('报废台账'));
    // 带时分：同一天重跑不覆盖上一次；Windows 上旧台账还在 Excel 里开着也不会撞 EBUSY
    const stamp = scrapOutputStamp();
    const outputPath = join(dir, `${i18nT('报废台账')}-${stamp}.xlsx`);
    const summaryPath = join(dir, `${i18nT('各渠道各品类报废费用汇总表')}-${stamp}.xlsx`);
    try { writeScrapLedgerWorkbook(outputPath, result); } catch (e) { throw new Error(describeLedgerWriteError(e, outputPath)); }
    try { writeScrapSummaryWorkbook(summaryPath, result); } catch (e) { throw new Error(describeLedgerWriteError(e, summaryPath)); }
    store.update((s) => { s.scrap.lastOutputPath = outputPath; s.scrap.lastRunAt = new Date().toISOString(); s.scrap.lastLookupPath = lookupPath; });
    logger?.audit?.('service-settlement', i18nT('报废台账生成完成'), { oemUnits: result.counts.oemUnits, oemKept: result.counts.oemKept, barcodeUnits: result.counts.barcodeUnits, total: result.counts.total, unmatched: result.counts.unmatched });
    return {
      outputPath, summaryPath, outputDir: dir,
      headers: result.headers, preview: result.rows.slice(0, 30), counts: result.counts, warnings: result.warnings, sources: result.sources,
      aggregate: result.aggregate, aggregateAmount: result.aggregateAmount, amountColumn: result.amountColumn,
      summaryHeaders: result.summaryHeaders, summary: result.summary, pivot: result.pivot,
      unmatched: result.unmatched.slice(0, 200), templateUsed: result.templateUsed, startDate: result.startDate,
    };
  });
}
