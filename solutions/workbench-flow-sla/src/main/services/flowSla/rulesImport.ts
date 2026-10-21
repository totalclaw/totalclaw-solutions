/**
 * 流程时效监控 · 从《时效看板指标》工作簿读规则表。
 *
 * 认五张工作表（按表名里的关键字找，表头按单元格文字定位，不依赖固定行列）：
 *   端到端用时              大类 / 流程细类 / 流程所属系统 / 整体时效要求
 *   CSS各节点时效要求       右半边：事务类型 / 费用类型 / 审批节点名 / 是否计入端对端时效 / 单节点要求（工作日）
 *   oa、费控节点内外部      流程名 / 环节名称 / 节点属性
 *   oa费控个人节点时效要求  审核人身份 / 大类 / 流程细类 / 平台 / 金额 / 重要性 / 时效要求
 *   审核人身份              姓名 / 身份
 * 金额线、风险比例、异常判定、跟进频次这些阈值不在工作簿里，沿用传进来的 base。
 */
import { basename, extname } from 'node:path';
import { t as i18nT } from '@totalclaw/i18n';
import { openSpreadsheetFile, readWorksheetData } from '../spreadsheetRead';
import type { CssNodeRule, E2eRule, PersonalRule, SlaRules } from './calc';

type Cell = unknown;
const str = (v: Cell): string => (v == null ? '' : String(v).trim());
const flat = (v: Cell): string => str(v).replace(/\s+/g, '');

function days(v: Cell): number | null {
  if (typeof v === 'number') return Number.isFinite(v) ? v : null;
  const m = /^(\d+(?:\.\d+)?)(天|个?工作日|日)?$/.exec(flat(v));
  return m ? Number(m[1]) : null;
}

interface Located { rows: Cell[][]; header: number; col: (re: RegExp) => number }

/** 找到同时含这些表头的那一行，返回按文字找列的函数 */
function locate(rows: Cell[][], must: RegExp[]): Located | null {
  for (let r = 0; r < Math.min(rows.length, 15); r += 1) {
    const cells = (rows[r] || []).map(flat);
    if (must.every((re) => cells.some((c) => re.test(c)))) {
      return { rows, header: r, col: (re) => cells.findIndex((c) => re.test(c)) };
    }
  }
  return null;
}

export interface RulesImportResult { rules: SlaRules; warnings: string[] }

export function parseRulesWorkbook(path: string, base: SlaRules): RulesImportResult {
  const wb = openSpreadsheetFile(path, { cellDates: false });
  const names = wb.SheetNames || [];
  const warnings: string[] = [];
  const sheet = (re: RegExp, label: string): Cell[][] => {
    const name = names.find((n) => re.test(n.replace(/\s+/g, '')));
    if (!name) throw new Error(i18nT('工作簿里没有找到「{p0}」这张表，请确认导入的是《时效看板指标》', { p0: label }));
    return readWorksheetData(wb.Sheets[name], { raw: true, defval: null }).rows;
  };
  const need = (loc: Located | null, label: string): Located => {
    if (!loc) throw new Error(i18nT('「{p0}」表里没有找到表头行，列名可能改过', { p0: label }));
    return loc;
  };

  // —— 端到端用时 ——
  const e2eLabel = i18nT('端到端用时');
  const e2eLoc = need(locate(sheet(/端到端/, e2eLabel), [/^大类$/, /流程细类/, /时效要求/]), e2eLabel);
  const [cCat, cType, cSys, cLimit] = [e2eLoc.col(/^大类$/), e2eLoc.col(/流程细类/), e2eLoc.col(/系统/), e2eLoc.col(/时效要求/)];
  const e2e: E2eRule[] = [];
  for (const row of e2eLoc.rows.slice(e2eLoc.header + 1)) {
    const category = str(row[cCat]); const flowType = str(row[cType]);
    if (!category || !flowType) continue;
    const sysRaw = str(row[cSys]);
    const system = /^css$/i.test(sysRaw) ? 'CSS' : sysRaw;
    const limitText = str(row[cLimit]);
    const rule: E2eRule = { category, flowType, system, limitDays: days(row[cLimit]) };
    if (rule.limitDays === null && limitText && limitText !== '/') {
      // 一格里写了几种情况（备用商 7 天 / 服务商 72 天）：拆成按标题关键字区分的多档
      const variants = limitText.split(/[\n；;]+/).map((line) => /^(\D+?)(\d+(?:\.\d+)?)天/.exec(line.trim())).filter(Boolean)
        .map((m) => ({ keyword: (m as RegExpExecArray)[1].trim(), limitDays: Number((m as RegExpExecArray)[2]) }));
      if (variants.length) rule.variants = variants;
      else warnings.push(i18nT('端到端用时「{p0}」的时效要求「{p1}」读不成天数，按没有时效要求处理', { p0: flowType, p1: limitText }));
    }
    if (/除了以上/.test(flowType)) rule.fallback = true;
    e2e.push(rule);
  }

  // —— CSS 各节点 ——
  const cssLabel = i18nT('CSS各节点时效要求');
  const cssLoc = need(locate(sheet(/css.*节点/i, cssLabel), [/^事务类型$/, /^审批节点名$/]), cssLabel);
  const k0 = cssLoc.col(/^事务类型$/);
  const [kFee, kNode, kAttr, kLimit] = [cssLoc.col(/^费用类型$/), cssLoc.col(/^审批节点名$/), cssLoc.col(/是否计入/), cssLoc.col(/单节点要求/)];
  const cssNodes: CssNodeRule[] = [];
  for (const row of cssLoc.rows.slice(cssLoc.header + 1)) {
    const flowType = str(row[k0]); const node = flat(row[kNode]);
    if (!flowType || !node) continue;
    const limitText = str(row[kLimit]);
    const limit = days(row[kLimit]);
    cssNodes.push({
      flowType, feeType: kFee >= 0 ? str(row[kFee]) : '', node, internal: /内部/.test(str(row[kAttr])), limitWorkdays: limit,
      note: limit === null && limitText && limitText !== '/' ? limitText.split(/\n+/).map((x) => x.trim()).filter(Boolean).join(i18nT('；')) : '',
    });
  }

  // —— OA / 费控节点内外部 ——
  const nodeLabel = i18nT('oa、费控节点内外部');
  const nodeLoc = need(locate(sheet(/节点内外部/, nodeLabel), [/^流程名/, /环节名称/, /节点属性/]), nodeLabel);
  const [nFlow, nNode, nAttr] = [nodeLoc.col(/^流程名/), nodeLoc.col(/环节名称/), nodeLoc.col(/节点属性/)];
  const oaFkNodes: Array<[string, string, boolean]> = [];
  let badAttr = 0;
  for (const row of nodeLoc.rows.slice(nodeLoc.header + 1)) {
    const flow = str(row[nFlow]); const node = str(row[nNode]); const attr = str(row[nAttr]);
    if (!flow || !node) continue;
    if (!/内部|外部/.test(attr)) badAttr += 1;
    oaFkNodes.push([flow, node, /内部/.test(attr)]);
  }
  if (badAttr) warnings.push(i18nT('节点内外部表有 {p0} 行的节点属性既不是内部也不是外部，按外部处理', { p0: badAttr }));

  // —— OA / 费控个人节点 ——
  const perLabel = i18nT('oa费控个人节点时效要求');
  const perLoc = need(locate(sheet(/个人节点/, perLabel), [/审核人身份/, /流程细类/, /时效要求/]), perLabel);
  const [pId, pCat, pType, pPlat, pAmt, pImp, pLimit] = [perLoc.col(/审核人身份/), perLoc.col(/^大类$/), perLoc.col(/流程细类/), perLoc.col(/平台/), perLoc.col(/金额/), perLoc.col(/重要性/), perLoc.col(/时效要求/)];
  const personal: PersonalRule[] = [];
  for (const row of perLoc.rows.slice(perLoc.header + 1)) {
    const identity = str(row[pId]); const category = str(row[pCat]);
    if (!identity || !category) continue;
    const amt = flat(row[pAmt]);
    personal.push({
      identity, category, flowType: str(row[pType]), platform: str(row[pPlat]),
      amount: /以内|以下/.test(amt) ? 'le10w' : /以上/.test(amt) ? 'gt10w' : 'any',
      importance: str(row[pImp]), limitDays: days(row[pLimit]),
    });
  }

  // —— 审核人身份 ——
  const mgrLabel = i18nT('审核人身份');
  const mgrLoc = need(locate(sheet(/审核人身份/, mgrLabel), [/^姓名$/, /^身份$/]), mgrLabel);
  const [mName, mId] = [mgrLoc.col(/^姓名$/), mgrLoc.col(/^身份$/)];
  const managers: string[] = [];
  for (const row of mgrLoc.rows.slice(mgrLoc.header + 1)) {
    const name = str(row[mName]); const id = flat(row[mId]);
    if (name && /管理干部/.test(id) && !/非管理/.test(id) && !managers.includes(name)) managers.push(name);
  }

  if (!e2e.length) throw new Error(i18nT('「{p0}」表里没有读到任何规则', { p0: e2eLabel }));
  if (!personal.length) throw new Error(i18nT('「{p0}」表里没有读到任何规则', { p0: perLabel }));
  if (!e2e.some((r) => r.fallback)) warnings.push(i18nT('端到端用时表里没有「除了以上流程」这一行，对不上的 OA / 费控流程会归到「常规流程」'));

  return {
    rules: {
      version: basename(path, extname(path)), e2e, cssNodes, oaFkNodes, personal, managers,
      amountThreshold: base.amountThreshold, riskRatio: base.riskRatio, abnormal: { ...base.abnormal }, followUp: { ...base.followUp }, improveRemindDays: base.improveRemindDays,
    },
    warnings,
  };
}
