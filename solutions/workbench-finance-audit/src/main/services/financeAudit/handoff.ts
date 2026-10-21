/**
 * 模块间转交（第 4.3 节）：只允许模块定义里 handoffTo 声明过的方向；转交的是项目内已签核运行的引用，
 * 不是自由文本。批次 1 落地 A2 对账 → A1 月结（已签核的差异进入关账包「未结事项」页）。
 */
import { i18nKey, tIn } from '@totalclaw/i18n';
import type { FauCompany, FauLocale, FauOpenItem, FauProject, FauReconResult, FauRun } from '@totalclaw/ipc-contracts';
import { moduleById } from '../../../shared/financeAudit/catalog';
import { FinanceAuditStore, newId, nowIso, type HandoffRecord } from './store';
import { FauStepError } from './skillRunner';
import { BANK_CLASS_LABEL, GLSUB_CLASS_LABEL } from './outputs/recon';

export function sendHandoff(store: FinanceAuditStore, company: FauCompany, project: FauProject, fromRun: FauRun, toModuleId: string): HandoffRecord {
  const from = moduleById(fromRun.moduleId);
  const to = moduleById(toModuleId);
  if (!from || !to || !(from.handoffTo || []).includes(toModuleId)) throw new FauStepError(i18nKey('不允许从「{p0}」转交到这个模块'), { p0: from?.code || fromRun.moduleId });
  if (to.status !== 'ready') throw new FauStepError(i18nKey('目标模块即将上线'));
  if (fromRun.status !== 'archived') throw new FauStepError(i18nKey('只有签核归档后的结果才能转交'));
  const dup = store.handoffs(company.id, project.id).find((h) => h.fromRunId === fromRun.id && h.toModuleId === toModuleId);
  if (dup) return dup;
  const rec: HandoffRecord = { id: newId('ho'), fromRunId: fromRun.id, fromModuleId: fromRun.moduleId, toModuleId, at: nowIso() };
  store.addHandoff(company.id, project.id, rec);
  return rec;
}

/** 转给本模块的未结事项（描述按本次运行的输出语言写） */
export function openItemsFor(store: FinanceAuditStore, run: FauRun, company: FauCompany, project: FauProject): FauOpenItem[] {
  const loc: FauLocale = run.outputLocale;
  const out: FauOpenItem[] = [];
  for (const h of store.handoffs(company.id, project.id).filter((x) => x.toModuleId === run.moduleId)) {
    const src = store.findRun(company.id, h.fromRunId, project.id);
    if (!src || src.moduleId !== 'recon') continue;
    const res = src.result as FauReconResult | undefined;
    for (const acc of res?.bank || []) {
      for (const it of acc.items.filter((i) => i.cls !== 'matched')) {
        out.push({
          id: `${src.id}:${it.id}`, fromRunId: src.id, fromModuleId: 'A2',
          description: [acc.account, tIn(loc, BANK_CLASS_LABEL[it.cls]), it.ref, it.counterparty, it.summary].filter(Boolean).join(' · '),
          amount: it.bankAmount || it.bookAmount,
        });
      }
    }
    for (const b of (res?.glsub?.breaks || []).filter((x) => x.cls !== 'matched')) {
      out.push({
        id: `${src.id}:${b.id}`, fromRunId: src.id, fromModuleId: 'A2',
        description: [b.key, tIn(loc, GLSUB_CLASS_LABEL[b.cls]), b.trace?.status === 'verified' ? b.trace.rootCause : ''].filter(Boolean).join(' · '),
        amount: b.diff, owner: b.trace?.status === 'verified' ? b.trace.owner : undefined,
      });
    }
  }
  return out;
}
