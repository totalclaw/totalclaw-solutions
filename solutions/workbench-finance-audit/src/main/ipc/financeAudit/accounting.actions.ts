/**
 * 财会审计 · accounting 分组的模块特有 action（批次 1：A1 close.*、A2 recon.*；批次 2：A3 ar.*）。
 */
import { join } from 'node:path';
import { i18nKey, tIn } from '@totalclaw/i18n';
import { FAU_LOCALES, type FauCheckMark, type FauCloseResult, type FauLocale, type FauReconResult, type FauRun } from '@totalclaw/ipc-contracts';
import { closeChecklist, CLOSE_CHECKLIST_ITEMS } from '../../services/financeAudit/engines/accounting/close/checklist';
import { isBankAccount, pairBankAccounts } from '../../services/financeAudit/engines/accounting/recon/bank';
import { periodOf } from '../../services/financeAudit/engines/accounting/closeRunner';
import { FauStepError } from '../../services/financeAudit/skillRunner';
import { thresholdsFor } from '../../services/financeAudit/thresholds';
import { writeWorkbookFile } from '../../services/financeAudit/outputs/xlsx';
import { outputDirFor } from '../../services/financeAudit/outputs/common';
import KW from '../../services/financeAudit/intake/columnKeywords.json';
import type { BankRow, FxRateRow, JournalRow, ManualChecklist, TbRow } from '../../services/financeAudit/types';
import { signedAging } from '../../services/financeAudit/engines/accounting/ar/signedAging';
import type { ActionTable, FauActionCtx } from './context';

const MARKS: FauCheckMark[] = ['ok', 'warn', 'fail', 'pending'];
const POLICY_COLUMNS = ['policyId', 'policyDesc', 'expenseAccount', 'expenseAccountName', 'liabilityAccount', 'liabilityAccountName', 'basis', 'policyAmount', 'startPeriod', 'endPeriod', 'rate', 'baseAccount', 'keywords', 'autoReverse'];

/** 模板表头取列识别关键字里的中 / 英 / 阿各一个，保证导回来能自动认列（表头是数据，不是界面文案） */
function templateHeader(role: string): string {
  const kws = (KW as unknown as Record<string, string[]>)[role] || [role];
  const zh = kws.find((k) => /\p{Script=Han}/u.test(k)) || '';
  const en = kws.find((k) => /^[A-Za-z]/.test(k)) || '';
  const ar = kws.find((k) => /\p{Script=Arabic}/u.test(k)) || '';
  return [zh, en, ar].filter(Boolean).join(' / ');
}

export function accountingActions(ctx: FauActionCtx): ActionTable {
  const { store, runs } = ctx;

  const loadRun = (runId: unknown, moduleId: string): { run: FauRun; company: ReturnType<FauActionCtx['currentCompany']>; project: NonNullable<ReturnType<typeof store.getProject>> } => {
    const company = ctx.currentCompany();
    const run = store.findRun(company.id, String(runId || ''), store.settings().currentProjectId);
    if (!run || run.moduleId !== moduleId) throw new FauStepError(i18nKey('找不到这次运行'));
    const project = store.getProject(company.id, run.projectId);
    if (!project) throw new FauStepError(i18nKey('找不到项目'));
    return { run, company, project };
  };
  const rowsOf = <T>(run: FauRun, slot: string): T[] => (run.inputs[slot] || []).flatMap((id) => store.dataset<T>(run.companyId, run.projectId, id)?.rows || []);

  return {
    /** A1：关账清单人工勾 ✅ / ⚠️ / ❌（附证据），只重算清单并重出文件，不重跑模型 */
    'close.checklist.update': async (p: { runId: string; itemId: string; mark: string; evidence?: string }) => {
      const { run, company, project } = loadRun(p?.runId, 'close');
      if (['signing', 'archived', 'void'].includes(run.status)) throw new FauStepError(i18nKey('已经开始签核，不能再改；请复核人退回后再改'));
      if (!CLOSE_CHECKLIST_ITEMS.some((i) => i.id === p?.itemId)) throw new FauStepError(i18nKey('没有这一项'));
      if (!MARKS.includes(p?.mark as FauCheckMark)) throw new FauStepError(i18nKey('勾选值不对'));
      const manual = { ...((run.params.manualChecklist || {}) as ManualChecklist), [p.itemId]: { mark: p.mark as FauCheckMark, evidence: String(p?.evidence || '').slice(0, 300) || undefined } };
      run.params = { ...run.params, manualChecklist: manual };
      const res = run.result as FauCloseResult | undefined;
      if (res?.checklist) {
        const period = periodOf({ project, run });
        const journal = rowsOf<JournalRow>(run, 'journal');
        res.checklist = closeChecklist({
          period, journal, tb: rowsOf<TbRow>(run, 'tb'), trialBalanced: res.trial ? res.trial.balanced : null,
          bankReconDone: store.listRuns(company.id, project.id, 'recon').some((r) => r.modeId === 'bank' && ['ready', 'signing', 'archived'].includes(r.status)),
          accrualRan: !!res.accruals, fxRates: rowsOf<FxRateRow>(run, 'fxRates'),
          hasForeignCurrency: journal.some((j) => j.currency && j.currency !== company.currency), manual,
        }, thresholdsFor('close', company.thresholds));
        run.reminders = run.reminders.filter((r) => r.id !== 'checklist:cannot_start');
        if (!res.checklist.canStart) run.reminders.push({ id: 'checklist:cannot_start', source: 'engine', level: 'warn', message: { key: i18nKey('关账清单判定暂不能开始结账：{p0}'), params: { p0: String(res.checklist.reasons.length) } } });
        run.result = res;
      }
      store.saveRun(run);
      // 已出过文件：只重出 ⑤（不重跑模型）
      if (run.steps.draft.status === 'done') await runs.redraft(run, company, project);
      ctx.emit({ type: 'todo.changed' });
      return store.findRun(company.id, run.id, project.id);
    },

    /** A1：计提政策表模板（三语表头，导回来自动认列） */
    'close.policyTemplate': (p: { locale?: string }) => {
      const { company, project } = ctx.current();
      const loc: FauLocale = FAU_LOCALES.includes(p?.locale as FauLocale) ? p!.locale as FauLocale : company.outputLocale;
      const dir = join(outputDirFor(store.settings().outputRoot || store.root(), company.name, project.name, 'A1', tIn(loc, i18nKey('月结关账'))), 'templates');
      const path = join(dir, `A1-${tIn(loc, i18nKey('计提政策表模板'))}.xlsx`.replace(/[\\/:*?"<>|]/g, '_'));
      writeWorkbookFile(path, [
        { name: tIn(loc, i18nKey('计提政策')), headers: POLICY_COLUMNS.map(templateHeader), rows: [] },
        {
          name: tIn(loc, i18nKey('填写说明')),
          rows: [
            [tIn(loc, i18nKey('每行一条计提政策。计算方式填：固定金额（每期金额）、直线摊销（合同总额按起止期间平摊）、按比例（基数科目本期发生额 × 费率）。'))],
            [tIn(loc, i18nKey('已入账关键词：序时账里该费用科目、摘要含这些词的本期发生额算作已入账，多个词用逗号分隔。'))],
            [tIn(loc, i18nKey('自动冲回填「是」或「否」。期间格式 YYYY-MM。'))],
          ],
        },
      ], { rtl: loc === 'ar' });
      return { path };
    },

    /** A2：银行账户配对情况（账面明细科目 ↔ 银行账号），给第 ① / ③ 步补配对 */
    'recon.bankAccounts': (p: { runId: string }) => {
      const { run } = loadRun(p?.runId, 'recon');
      const book = rowsOf<JournalRow>(run, 'bankJournal').filter((r) => isBankAccount(r.accountCode, r.accountName));
      const bank = rowsOf<BankRow>(run, 'bank');
      const pairs = Array.isArray(run.params.accountPairs) ? run.params.accountPairs as { bookAccount: string; bankAccount: string }[] : [];
      const accounts = new Map<string, string>();
      for (const r of book) if (!accounts.has(r.accountCode)) accounts.set(r.accountCode, r.accountName);
      return {
        book: [...accounts.entries()].map(([code, name]) => ({ code, name })),
        bank: [...new Set(bank.map((r) => r.bankAccount))],
        pairing: pairBankAccounts(book, bank, pairs),
      };
    },

    /** A2：重查单条差异 —— 新建一次「重查」运行并开跑 */
    'recon.break.retrace': async (p: { runId: string; breakId: string }) => {
      const { run, company, project } = loadRun(p?.runId, 'recon');
      const res = run.result as FauReconResult | undefined;
      const brk = res?.glsub?.breaks.find((b) => b.id === p?.breakId);
      if (!brk) throw new FauStepError(i18nKey('找不到要重查的那条差异'));
      let fresh = runs.create(company, project, { moduleId: 'recon', modeId: 'retrace', outputLocale: run.outputLocale, params: { sourceRunId: run.id, breakId: brk.id } });
      fresh = runs.setInputs(fresh, {});
      return runs.start(fresh, company, project);
    },

    /** A3：本项目里最近一次已签核的账龄（供 E5 预期信用损失 / E6 营运资本读取；没有签核过返回 null） */
    'ar.signedAging': () => {
      const { company, project } = ctx.current();
      return signedAging(store, company.id, project.id);
    },
  };
}
