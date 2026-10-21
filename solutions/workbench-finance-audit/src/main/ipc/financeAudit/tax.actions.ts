/**
 * 财会审计 · tax 分组的模块特有 action（C1–C3，批次 4），action 名用「<模块 id>.」前缀。
 *   tax.rules     当前公司地区用到的地区规则（版本、生效日期、出处原文与译文、审核状态），界面「规则与出处」展示；
 *   tax.template  税务组数据集的填写模板（三语表头，导回来自动认列）。
 * 只读规则、只写模板文件；没有任何提交申报、对外发送的通道。
 */
import { join } from 'node:path';
import { i18nKey, tIn } from '@totalclaw/i18n';
import { FAU_LOCALES, FAU_TAX_INPUT_KINDS, type FauLocale, type FauRuleUse, type FauTaxInputKind } from '@totalclaw/ipc-contracts';
import { regionRulesForCurrentUser } from '../../services/processLibrary/store';
import { allRules, ruleUse, setRuleSource } from '../../services/financeAudit/engines/tax/common';
import { TAX_KIND_ROLES } from '../../services/financeAudit/intake/tax';
import TAX_KW from '../../services/financeAudit/intake/taxColumnKeywords.json';
import FA_KW from '../../services/financeAgent/columnKeywords.json';
import { FauStepError } from '../../services/financeAudit/skillRunner';
import { writeWorkbookFile } from '../../services/financeAudit/outputs/xlsx';
import { outputDirFor } from '../../services/financeAudit/outputs/common';
import type { ActionTable, FauActionCtx } from './context';

const KIND_TITLE: Record<FauTaxInputKind, string> = {
  vat_lines: i18nKey('销项与进项明细'), iit_rows: i18nKey('工资个税明细'), wht_payments: i18nKey('向非居民付款明细'), temp_diffs: i18nKey('暂时性差异明细'),
  disclosure_events: i18nKey('重大事项与交易清单'), rp_transactions: i18nKey('关联交易明细'), tp_comparables: i18nKey('可比公司财务数据'),
};

/** 模板表头取列识别关键字里的中 / 英 / 阿各一个（表头是数据，不是界面文案），保证导回来能自动认列 */
export function templateHeader(role: string): string {
  const kws = [...((TAX_KW as unknown as Record<string, string[]>)[role] || []), ...((FA_KW as unknown as Record<string, string[]>)[role] || [])];
  const zh = kws.find((k) => /\p{Script=Han}/u.test(k)) || '';
  const en = kws.find((k) => /^[A-Za-z]/.test(k)) || '';
  const ar = kws.find((k) => /\p{Script=Arabic}/u.test(k)) || '';
  return [zh, en, ar].filter(Boolean).join(' / ') || role;
}

export function taxActions(ctx: FauActionCtx): ActionTable {
  // 地区规则：内置 + 企业在流程库里改过的版本（取不到就回落内置表）
  setRuleSource(() => regionRulesForCurrentUser());

  return {
    /** 当前公司各地区档案今天生效的规则，含审核状态；沙特 / 阿联酋未审核的一律草稿口径 */
    'tax.rules': (): FauRuleUse[] => {
      const company = ctx.currentCompany();
      const today = new Date().toISOString().slice(0, 10);
      const regions: string[] = company.regions.filter((r) => r !== 'INTL');
      const latest = new Map<string, FauRuleUse>();
      for (const r of allRules()) {
        if (!regions.includes(r.jurisdiction)) continue;
        if (r.effectiveFrom > today || (r.effectiveTo && r.effectiveTo < today)) continue;
        const cur = latest.get(r.id);
        if (!cur || cur.version < r.version) latest.set(r.id, ruleUse(r));
      }
      return [...latest.values()].sort((a, b) => a.jurisdiction.localeCompare(b.jurisdiction) || a.id.localeCompare(b.id));
    },

    /** 税务组数据集的填写模板 */
    'tax.template': (p: { kind?: string; locale?: string }) => {
      const kind = String(p?.kind || '') as FauTaxInputKind;
      if (!FAU_TAX_INPUT_KINDS.includes(kind)) throw new FauStepError(i18nKey('不支持的数据类型'));
      const { company, project } = ctx.current();
      const loc: FauLocale = FAU_LOCALES.includes(p?.locale as FauLocale) ? p!.locale as FauLocale : company.outputLocale;
      const dir = join(outputDirFor(ctx.store.settings().outputRoot || ctx.store.root(), company.name, project.name, 'C', tIn(loc, i18nKey('税务与合规'))), 'templates');
      const title = tIn(loc, KIND_TITLE[kind]);
      const path = join(dir, `${tIn(loc, i18nKey('模板'))}-${title}.xlsx`.replace(/[\\/:*?"<>|]/g, '_'));
      const roles = TAX_KIND_ROLES[kind];
      writeWorkbookFile(path, [
        { name: title, headers: roles.map((r) => templateHeader(r.key)), rows: [] },
        {
          name: tIn(loc, i18nKey('填写说明')),
          rows: [
            [tIn(loc, i18nKey('第一行是表头，按列填写；带 * 的列必须填。金额填主单位（元 / 里亚尔 / 迪拉姆），日期用 YYYY-MM-DD，税率填 15% 或 0.15。'))],
            ...roles.map((r) => [`${r.required ? '* ' : ''}${tIn(loc, r.label)}`, templateHeader(r.key)]),
          ],
        },
      ], { rtl: loc === 'ar' });
      return { path };
    },
  };
}
