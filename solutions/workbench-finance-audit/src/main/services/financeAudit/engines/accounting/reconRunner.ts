/**
 * A2 对账中心 runner（第 5.5 节）：
 *   银企对账：配对账户 → 四轮匹配 → 调节表；升级条件（不明扣款 > 1000 等）强制批准级；
 *   总账 ↔ 子账：全外连接分六类 → 重大差异交模型按 break-trace 写一句根因 → 代码复核（引用的单号 / 金额 / 日期
 *     必须在数据里，否则打回重写一次，仍不行保持「已打回」）；
 *   重查单条差异：从上一次总账 ↔ 子账运行里取一条差异重新追溯。
 */
import { i18nKey } from '@totalclaw/i18n';
import type {
  FauArtifact, FauBreakTrace, FauGlSubBreak, FauGlSubResult, FauReconResult, FauReminder, FauSubProgress, FauValidationReport, FauVerificationItem,
} from '@totalclaw/ipc-contracts';
import { STANDARD_LABELS } from '../../../../../shared/financeAudit/regions';
import type { AnalyzeResult, ModuleRunner, RunCtx } from '../../runner';
import { FauStepError, runSkill } from '../../skillRunner';
import { sha256File } from '../../signoff';
import { newId, nowIso } from '../../store';
import { writeBankOutputs, writeGlSubOutputs } from '../../outputs/recon';
import { BREAK_TASK, breakSchema } from '../../prompts/recon';
import type { JournalRow, LedgerExtractRow } from '../../types';
import { bankRecon, isBankAccount, type BankDirection } from './recon/bank';
import { glSubledgerRecon } from './recon/glsub';
import { breakFacts, majorBreaks, verifyBreakTrace } from './recon/breakTrace';
import { reconValidation } from './recon/validate';
import { periodEnd } from './common';
import { periodOf, withDatasetIssues } from './closeRunner';

const SUB_LABEL: Record<string, string> = {
  pair: i18nKey('配对银行账户'), match: i18nKey('四轮匹配'), statement: i18nKey('生成调节表'),
  join: i18nKey('全外连接'), classify: i18nKey('差异分类与成因'), trace: i18nKey('重大差异根因追溯'),
};

function accountPairs(ctx: RunCtx): { bookAccount: string; bankAccount: string }[] {
  const v = ctx.run.params.accountPairs;
  return Array.isArray(v) ? v.filter((p: any) => p && typeof p.bookAccount === 'string' && typeof p.bankAccount === 'string') as { bookAccount: string; bankAccount: string }[] : [];
}

function bookRowsOf(ctx: RunCtx): JournalRow[] {
  return ctx.rows<'journal'>('bankJournal').filter((r) => isBankAccount(r.accountCode, r.accountName));
}

/** 上一期项目链里的未达方向（连续 N 个月同方向未达） */
function bankHistory(ctx: RunCtx): { account: string; period: string; direction: BankDirection }[] {
  const out: { account: string; period: string; direction: BankDirection }[] = [];
  for (const r of ctx.history()) {
    const res = r.result as FauReconResult | undefined;
    const period = ctx.store.getProject(ctx.company.id, r.projectId)?.period || '';
    for (const acc of res?.bank || []) {
      for (const it of acc.items) {
        if (['book_out_bank_not', 'bank_out_book_not', 'book_in_bank_not', 'bank_in_book_not'].includes(it.cls)) out.push({ account: acc.account, period, direction: it.cls as BankDirection });
      }
    }
  }
  return out;
}

const y = (c: number | null) => (c == null ? null : Math.round(c) / 100);

/** 重大差异交模型追溯根因 + 代码复核；被打回的带着问题重写一次 */
export async function traceBreaks(ctx: RunCtx, breaks: FauGlSubBreak[], gl: LedgerExtractRow[], sub: LedgerExtractRow[]): Promise<{ traced: Map<string, FauBreakTrace>; verification: FauVerificationItem[]; model?: string }> {
  const traced = new Map<string, FauBreakTrace>();
  if (!breaks.length) return { traced, verification: [] };
  const rowsOf = (b: FauGlSubBreak) => ({
    glRows: gl.filter((r) => b.glRows.includes(r.row)).map((r) => ({ row: r.row, docNo: r.docNo || r.key, date: r.date, amount: y(r.amount), fxAmount: y(r.fxAmount), quantity: r.quantity, desc: r.desc })),
    subRows: sub.filter((r) => b.subRows.includes(r.row)).map((r) => ({ row: r.row, docNo: r.docNo || r.key, date: r.date, amount: y(r.amount), fxAmount: y(r.fxAmount), quantity: r.quantity, desc: r.desc })),
  });
  const call = (bs: FauGlSubBreak[], extra = '') => runSkill(ctx.llm, {
    module: 'recon', skills: [{ name: 'fa-break-trace' }], task: BREAK_TASK + extra,
    data: { breaks: bs.map((b) => ({ id: b.id, key: b.key, class: b.cls, diff: y(b.diff), causes: b.causes, ...rowsOf(b) })) },
    outputLocale: ctx.locale, schema: breakSchema, narratives: (o) => o.traces.map((t) => t.rootCause),
    userData: [...bs.map((b) => b.key), ...gl.map((r) => r.desc), ...sub.map((r) => r.desc)].filter(Boolean),
  });
  const first = await call(breaks);
  let model = first.model;
  const check = (b: FauGlSubBreak, t: { rootCause: string; owner: string; expectedClearDate: string; action: string }) => verifyBreakTrace(t, breakFacts(b, gl, sub));
  for (const t of first.data.traces) {
    const b = breaks.find((x) => x.id === t.id);
    if (b) traced.set(b.id, check(b, t));
  }
  const rejected = breaks.filter((b) => traced.get(b.id)?.status !== 'verified');
  if (rejected.length) {
    const fb = rejected.map((b) => `${b.id}: ${(traced.get(b.id)?.missing || ['no trace returned']).join(', ')}`).join('; ');
    try {
      const second = await call(rejected, `\nYour previous root causes were rejected because they cite items that are not in the rows: ${fb}. Cite only document numbers, amounts and dates from the given rows.`);
      model = second.model || model;
      for (const t of second.data.traces) {
        const b = rejected.find((x) => x.id === t.id);
        if (b) {
          const v = check(b, t);
          if (v.status === 'verified' || !traced.has(b.id)) traced.set(b.id, v);
        }
      }
    } catch { /* 重写失败：保留第一次的结论（已打回） */ }
  }
  const verification: FauVerificationItem[] = breaks.map((b) => {
    const t = traced.get(b.id);
    return { id: `break:${b.id}`, ref: `break:${b.key}`, text: t?.rootCause || '', status: t?.status === 'verified' ? 'verified' : 'unverified', missing: t?.missing };
  });
  return { traced, verification, model };
}

function sourceRunRows(ctx: RunCtx, sourceRunId: string): { res: FauGlSubResult; gl: LedgerExtractRow[]; sub: LedgerExtractRow[] } {
  const src = ctx.store.findRun(ctx.company.id, sourceRunId, ctx.project.id);
  const res = (src?.result as FauReconResult | undefined)?.glsub;
  if (!src || !res) throw new FauStepError(i18nKey('找不到要重查的总账与子账对账结果'));
  const load = (slot: string) => (src.inputs[slot] || []).flatMap((id) => ctx.store.dataset<LedgerExtractRow>(ctx.company.id, src.projectId, id)?.rows || []);
  return { res, gl: load('gl'), sub: load('sub') };
}

export const reconRunner: ModuleRunner = {
  subSteps(modeId: string): FauSubProgress[] {
    const ids = modeId === 'bank' ? ['pair', 'match', 'statement'] : modeId === 'glsub' ? ['join', 'classify', 'trace'] : ['trace'];
    return ids.map((id) => ({ id, label: { key: SUB_LABEL[id] }, status: 'todo' }));
  },

  async validate(ctx: RunCtx): Promise<FauValidationReport> {
    const th = ctx.th('recon');
    if (ctx.run.modeId === 'bank') {
      const r = reconValidation({ mode: 'bank', bookRows: bookRowsOf(ctx), bankRows: ctx.rows<'bank'>('bank'), tb: ctx.run.inputs.bankTb?.length ? ctx.rows<'tb'>('bankTb') : null, accountPairs: accountPairs(ctx), th });
      return withDatasetIssues(r, ctx, ['bankJournal', 'bank', 'bankTb']);
    }
    if (ctx.run.modeId === 'glsub') {
      const r = reconValidation({ mode: 'glsub', gl: ctx.rows<'subledger'>('gl'), sub: ctx.rows<'subledger'>('sub'), th });
      return withDatasetIssues(r, ctx, ['gl', 'sub']);
    }
    const { res } = sourceRunRows(ctx, String(ctx.run.params.sourceRunId || ''));
    const ok = res.breaks.some((b) => b.id === ctx.run.params.breakId);
    return ok
      ? { checks: [], blockers: [], warnings: [] }
      : { checks: [], blockers: [{ id: 'retrace_missing', level: 'block', code: 'retrace_missing', message: { key: i18nKey('找不到要重查的那条差异') } }], warnings: [] };
  },

  async analyze(ctx: RunCtx): Promise<AnalyzeResult> {
    const th = ctx.th('recon');
    const reminders: FauReminder[] = [];
    if (ctx.run.modeId === 'bank') {
      ctx.progress('pair', 'done');
      ctx.progress('match', 'running');
      const accounts = bankRecon({
        bookRows: bookRowsOf(ctx), bankRows: ctx.rows<'bank'>('bank'), tb: ctx.run.inputs.bankTb?.length ? ctx.rows<'tb'>('bankTb') : null,
        accountPairs: accountPairs(ctx), periodEnd: periodEnd(periodOf(ctx)), history: bankHistory(ctx), th,
      });
      ctx.progress('match', 'done');
      ctx.progress('statement', 'done');
      if (!ctx.run.inputs.bankTb?.length) reminders.push({ id: 'bank:no_tb', source: 'engine', level: 'warn', message: { key: i18nKey('未提供科目余额表：假设期初两边一致，期初余额未核对') } });
      accounts.forEach((a) => a.escalations.forEach((e, i) => reminders.push({ id: `esc:${a.account}:${i}`, source: 'escalation', level: 'warn', message: e })));
      for (const a of accounts.filter((x) => !x.statement.balanced)) reminders.push({ id: `unbal:${a.account}`, source: 'escalation', level: 'warn', message: { key: i18nKey('账户 {p0} 调整后两边余额不相等'), params: { p0: a.account } } });
      const result: FauReconResult = { mode: 'bank', bank: accounts };
      const esc = reminders.filter((r) => r.source === 'escalation').length;
      return {
        result, reminders, approveRequired: esc > 0,
        summary: { key: i18nKey('{n} 个账户，未达账项 {m} 笔，升级事项 {e} 条'), params: { n: accounts.length, m: accounts.reduce((s, a) => s + a.items.filter((i) => i.cls !== 'matched').length, 0), e: esc } },
      };
    }

    let gl: LedgerExtractRow[];
    let sub: LedgerExtractRow[];
    let res: FauGlSubResult;
    let targets: FauGlSubBreak[];
    if (ctx.run.modeId === 'glsub') {
      gl = ctx.rows<'subledger'>('gl');
      sub = ctx.rows<'subledger'>('sub');
      ctx.progress('join', 'running');
      res = glSubledgerRecon({ gl, sub, th });
      ctx.progress('join', 'done');
      ctx.progress('classify', 'done');
      targets = majorBreaks(res, th);
    } else {
      const src = sourceRunRows(ctx, String(ctx.run.params.sourceRunId || ''));
      gl = src.gl;
      sub = src.sub;
      const b = src.res.breaks.find((x) => x.id === ctx.run.params.breakId)!;
      res = { ...src.res, breaks: [{ ...b, trace: undefined }], escalations: [] };
      targets = res.breaks;
    }
    ctx.progress('trace', 'running');
    const t = await traceBreaks(ctx, targets, gl, sub);
    ctx.progress('trace', 'done');
    res = { ...res, breaks: res.breaks.map((b) => (t.traced.has(b.id) ? { ...b, trace: t.traced.get(b.id) } : b)) };
    res.escalations.forEach((e, i) => reminders.push({ id: `esc:glsub:${i}`, source: 'escalation', level: 'warn', message: e }));
    const result: FauReconResult = { mode: ctx.run.modeId === 'glsub' ? 'glsub' : 'retrace', glsub: res };
    return {
      result, verification: t.verification, reminders, approveRequired: res.escalations.length > 0, model: t.model,
      summary: { key: i18nKey('相符率 {p0}%，差异 {n} 条，追溯 {m} 条'), params: { p0: (res.matchRate * 100).toFixed(1), n: res.breaks.filter((b) => b.cls !== 'matched').length, m: targets.length } },
    };
  },

  async draft(ctx: RunCtx) {
    const run = ctx.run;
    const res = run.result as FauReconResult;
    const mode = ctx.def.modes.find((m) => m.id === run.modeId);
    const octx = {
      locale: ctx.locale, dir: ctx.outputDir(), companyName: ctx.company.name, projectName: ctx.project.name, period: periodOf(ctx),
      moduleCode: ctx.def.code, moduleName: ctx.def.name, modeName: mode?.name || run.modeId, standardLabel: STANDARD_LABELS[ctx.profile.standard], model: run.model,
    };
    const art = (kind: FauArtifact['kind'], path: string, title: string): FauArtifact => ({ id: newId('art'), kind, path, sha256: sha256File(path) || '', title: { key: title }, locale: ctx.locale, createdAt: nowIso() });
    const artifacts: FauArtifact[] = [];
    if (res.bank) {
      for (const p of writeBankOutputs(octx, res.bank, { levels: run.requiredLevels })) artifacts.push(art('xlsx', p, i18nKey('银行余额调节表')));
    }
    if (res.glsub) {
      const out = writeGlSubOutputs(octx, res.glsub, { levels: run.requiredLevels, reminders: run.reminders });
      artifacts.push(art('xlsx', out.reportPath, i18nKey('总账与子账差异报告')), art('docx', out.exceptionPath, i18nKey('例外报告')));
    }
    return { artifacts, summary: { key: i18nKey('已生成 {n} 个文件（草稿—待签核）'), params: { n: artifacts.length } } };
  },
};
